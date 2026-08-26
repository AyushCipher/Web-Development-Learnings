function stripMarkdownFences(raw) {
  if (typeof raw !== 'string') return raw;

  const fencePattern = /```(?:json)?\s*\n?([\s\S]*?)```/i;
  const match = raw.match(fencePattern);
  if (match) {
    return match[1].trim();
  }

  return raw;
}

function tryParseJSON(raw) {
  if (raw === null || raw === undefined) {
    return { parsed: null, error: 'Input is null or undefined' };
  }

  if (typeof raw === 'object') {
    return { parsed: raw, error: null };
  }

  if (typeof raw !== 'string') {
    return { parsed: null, error: `Unexpected input type: ${typeof raw}` };
  }

  const trimmed = raw.trim();
  
  if (trimmed.length === 0) {
    return { parsed: null, error: 'Response is empty' };
  }

  try {
    return { parsed: JSON.parse(trimmed), error: null };
  } catch {
  }

  const stripped = stripMarkdownFences(trimmed);
  if (stripped !== trimmed) {
    try {
      return { parsed: JSON.parse(stripped), error: null };
    } catch {
    }
  }

  return { parsed: null, error: 'Failed to parse response as JSON' };
}


function validateShape(data) {
  const errors = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    errors.push('Response is not a valid object');
    return errors;
  }

  if (!data.destination || typeof data.destination !== 'string') {
    errors.push('Missing or invalid "destination" field');
  }

  if (!data.days) {
    errors.push('Missing "days" field');
    return errors;
  }

  if (!Array.isArray(data.days)) {
    errors.push('"days" is not an array');
    return errors;
  }

  if (data.days.length === 0) {
    errors.push('Itinerary has no days');
    return errors;
  }

  data.days.forEach((day, dayIdx) => {
    if (!day || typeof day !== 'object') {
      errors.push(`Day ${dayIdx + 1} is not a valid object`);
      return;
    }

    if (day.dayNumber === undefined && day.dayNumber === null) {
      errors.push(`Day ${dayIdx + 1} is missing "dayNumber"`);
    }

    if (!day.title || typeof day.title !== 'string') {
      errors.push(`Day ${dayIdx + 1} is missing "title"`);
    }

    if (!day.stops || !Array.isArray(day.stops)) {
      errors.push(`Day ${dayIdx + 1} is missing "stops" array`);
      return;
    }

    day.stops.forEach((stop, stopIdx) => {
      if (!stop || typeof stop !== 'object') {
        errors.push(`Day ${dayIdx + 1}, Stop ${stopIdx + 1} is not a valid object`);
        return;
      }

      if (!stop.name || typeof stop.name !== 'string') {
        errors.push(`Day ${dayIdx + 1}, Stop ${stopIdx + 1} is missing "name"`);
      }
    });
  });

  return errors;
}

function addIds(data) {
  let stopCounter = 0;

  if (data.days && Array.isArray(data.days)) {
    data.days = data.days.map((day, dayIdx) => {
      const dayWithId = {
        ...day,
        id: `day-${dayIdx + 1}-${Date.now()}`,
        dayNumber: day.dayNumber ?? dayIdx + 1,
        title: day.title ?? `Day ${dayIdx + 1}`,
        stops: [],
      };

      if (day.stops && Array.isArray(day.stops)) {
        dayWithId.stops = day.stops.map((stop) => {
          stopCounter++;
          return {
            ...stop,
            id: `stop-${stopCounter}-${Date.now()}`,
            name: stop.name ?? 'Unnamed Stop',
            time: stop.time ?? '',
            description: stop.description ?? '',
            category: stop.category ?? 'activity',
            estimatedCost: stop.estimatedCost ?? '',
            duration: stop.duration ?? '',
            tips: stop.tips ?? '',
          };
        });
      }

      return dayWithId;
    });
  }

  return data;
}

export default function validateItinerary(raw) {
  const { parsed, error: parseError } = tryParseJSON(raw);

  if (parseError) {
    return { valid: false, data: null, errors: [parseError] };
  }

  if (parsed.error === true && parsed.reason) {
    return {
      valid: false,
      data: null,
      errors: [parsed.message || `API error: ${parsed.reason}`],
    };
  }

  const shapeErrors = validateShape(parsed);

  if (shapeErrors.length > 0) {
    return { valid: false, data: null, errors: shapeErrors };
  }

  const enriched = addIds({ ...parsed });

  return { valid: true, data: enriched, errors: [] };
}

export { stripMarkdownFences, tryParseJSON, validateShape };
