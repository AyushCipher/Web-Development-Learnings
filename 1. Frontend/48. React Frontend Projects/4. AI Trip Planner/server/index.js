import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const TIMEOUT_MS = 45_000;

const SYSTEM_PROMPT = `You are a travel planning assistant. Given a trip description, return a structured JSON itinerary.

You MUST respond with valid JSON matching this exact schema — no markdown, no explanation, just the JSON object:

{
  "tripTitle": "string — a catchy title for the trip",
  "destination": "string — main destination",
  "duration": "string — e.g. '3 days'",
  "travelers": number,
  "estimatedBudget": "string — e.g. '$1,500'",
  "days": [
    {
      "dayNumber": number,
      "title": "string — theme for the day, e.g. 'Arrival & Old Town'",
      "stops": [
        {
          "time": "string — e.g. '9:00 AM'",
          "name": "string — place or activity name",
          "description": "string — 1-2 sentence description",
          "category": "one of: accommodation, food, activity, transport, shopping, nightlife",
          "estimatedCost": "string — e.g. '$50'",
          "duration": "string — e.g. '2 hours'",
          "tips": "string — practical tip for this stop"
        }
      ]
    }
  ]
}

Rules:
- Each day should have 3-6 stops
- Include realistic times, costs, and durations
- Categories must be one of: accommodation, food, activity, transport, shopping, nightlife
- If the user doesn't specify number of travelers, default to 2
- If the user doesn't specify budget, estimate a moderate one`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    tripTitle: { type: 'string' },
    destination: { type: 'string' },
    duration: { type: 'string' },
    travelers: { type: 'integer' },
    estimatedBudget: { type: 'string' },
    days: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          dayNumber: { type: 'integer' },
          title: { type: 'string' },
          stops: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                time: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string' },
                estimatedCost: { type: 'string' },
                duration: { type: 'string' },
                tips: { type: 'string' },
              },
              required: ['time', 'name', 'description'],
            },
          },
        },
        required: ['dayNumber', 'title', 'stops'],
      },
    },
  },
  required: ['tripTitle', 'destination', 'days'],
};

const MOCK_RESPONSES = {
  malformed: () => ({ status: 200, body: '{ this is not valid json at all!!!' }),
  empty: () => ({ status: 200, body: '' }),
  partial: () => ({
    status: 200,
    body: JSON.stringify({ foo: 'bar', tripTitle: 'Test', destination: 'Nowhere' }),
  }),
  slow: () =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ status: 200, body: JSON.stringify({ tripTitle: 'Late' }) }), 20_000)
    ),
};

app.post('/api/generate', async (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({
      error: true,
      reason: 'invalid_input',
      message: 'A non-empty prompt is required.',
    });
  }

  const mockMode = process.env.MOCK_MODE?.toLowerCase();
  if (mockMode && mockMode !== 'off' && MOCK_RESPONSES[mockMode]) {
    console.log(`[MOCK_MODE=${mockMode}] Returning mock response`);
    try {
      const mock = await MOCK_RESPONSES[mockMode]();
      return res.status(mock.status).send(mock.body);
    } catch {
      return res.status(500).json({ error: true, reason: 'mock_error', message: 'Mock failed' });
    }
  }

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment');
    return res.status(500).json({
      error: true,
      reason: 'api_error',
      message: 'Server misconfigured: missing API key.',
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    console.log(`Sending Gemini request with model: ${GEMINI_MODEL}`);
    const geminiResponse = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    });

    clearTimeout(timeout);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text().catch(() => 'Unknown error');
      let errorBody;
      try {
        errorBody = JSON.parse(errorText);
      } catch {
        errorBody = null;
      }

      console.error('Gemini API request failed', {
        httpStatus: geminiResponse.status,
        errorStatus: errorBody?.error?.status ?? null,
        errorMessage: errorBody?.error?.message ?? errorText,
        responseBody: errorText,
      });
      const errorMessage = errorBody?.error?.message?.toLowerCase() ?? '';
      const isSafetyBlock = /safety|blocked|refus/.test(errorMessage);

      if (geminiResponse.status === 429) {
        return res.status(429).json({
          error: true,
          reason: 'rate_limit',
          message: 'Too many requests — please try again in a moment.',
        });
      }

      if (geminiResponse.status === 401 || geminiResponse.status === 403) {
        return res.status(500).json({
          error: true,
          reason: 'server_configuration',
          message: 'Server configuration error — please try again later.',
        });
      }

      if (isSafetyBlock) {
        return res.status(400).json({
          error: true,
          reason: 'content_safety',
          message: "Couldn't generate a response for that request — try rephrasing.",
        });
      }

      return res.status(502).json({
        error: true,
        reason: 'provider_error',
        message: 'The itinerary service is temporarily unavailable. Please try again later.',
      });
    }

    const data = await geminiResponse.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!text) {
      return res.status(200).json({
        error: true,
        reason: 'empty',
        message: 'Gemini returned an empty response.',
      });
    }

    res.status(200).send(text);
  } catch (err) {
    clearTimeout(timeout);

    if (err.name === 'AbortError') {
      return res.status(504).json({
        error: true,
        reason: 'timeout',
        message: `Request timed out after ${TIMEOUT_MS / 1000} seconds. Try a simpler prompt or try again.`,
      });
    }

    return next(err);
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    error: true,
    reason: 'server_error',
    message: 'Something went wrong on the server. Please try again later.',
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../dist')));

app.get('/*splat', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});

const serverPort = process.env.PORT || PORT;

app.listen(serverPort, () => {
  console.log(`Server running on http://localhost:${serverPort}`);
  console.log(
    `Gemini configuration: model=${GEMINI_MODEL}, API key prefix=${
      GEMINI_API_KEY ? `${GEMINI_API_KEY.slice(0, 8)}...` : '[not set]'
    }`
  );
  if (process.env.MOCK_MODE && process.env.MOCK_MODE !== 'off') {
    console.log(`⚠️  MOCK_MODE is active: ${process.env.MOCK_MODE}`);
  }
});
