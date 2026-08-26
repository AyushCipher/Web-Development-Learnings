# ✈ AI Trip Planner

A modern, full-stack React 19 application that transforms natural-language travel requests into structured, interactive day-by-day itineraries powered by **Google Gemini AI**, **Redux Toolkit**, and **Tailwind CSS v4**.

Instead of returning unstructured text or basic chat responses, the app utilizes Gemini's structured JSON output mode to render an interactive itinerary complete with drag-and-drop stop reordering, day expansion controls, single-stop deletions, and defensive error recovery.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Setup & Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-trip-planner

# Copy environment file and configure your API key
cp .env.example .env
```

Edit `.env` to include your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install & Start

Dependencies for both the React frontend and Express backend proxy are automatically configured via npm's `postinstall` hook.

```bash
# Install dependencies for client & server
npm install

# Start both backend proxy (port 3001) & Vite dev server (port 5173)
npm start
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗 Architecture & Design Principles

```
┌────────────────────────────────┐         ┌───────────────────────────────┐         ┌──────────────────────────────┐
│  React 19 + Redux Toolkit UI   │ ──────> │   Express API Proxy (Port 3001)│ ──────> │   Google Gemini 3.6 Flash    │
│  (Port 5173 / Vite Dev Server) │ <────── │   (Hides API Key from Browser) │ <────── │ (Structured JSON Schema)     │
└────────────────────────────────┘         └───────────────────────────────┘         └──────────────────────────────┘
```

### Key Architectural Decisions
- **Secure Backend Proxy**: Hides `GEMINI_API_KEY` from client bundles while managing rate limiting and request timeouts.
- **Server & Client AbortControllers**: Enforces a 15-second timeout budget to prevent hung upstream connections.
- **Stale Response Protection**: Redux thunk tracks request IDs (`requestId`) to guarantee out-of-order API responses never overwrite current UI state.
- **Resilient JSON Validation**: Frontend and backend validators strip markdown code fences (` ```json `) and validate required schema fields (`days`, `dayNumber`, `stops`, etc.) before rendering.

---

## ✨ Core Features

- **Natural Language Trip Planner**: Converts prompts like *"5 days in Tokyo focusing on street food, tech, and ancient temples"* into complete travel plans.
- **Interactive Day & Stop View**: Includes expandable day cards, detailed stop timing, cost estimates, descriptions, and tips.
- **Drag-and-Drop Reordering**: Smooth activity reordering within days using `@dnd-kit/core` and `@dnd-kit/sortable`.
- **Customization & Edits**: Delete unwanted stops dynamically with instant state recalculation.
- **Tailwind CSS v4 Styling**: Built with Tailwind CSS v4 featuring custom `@theme` variables (`paper`, `ink`, `sand`, `terracotta`, `pine`), Google Fonts (`DM Sans`, `Fraunces`), warm neutral colors, responsive grid layouts, and custom interactive states.

---

## 🛡 Robust Error Handling

The application provides multi-layered error handling across client and server:

| Failure Scenario | Detection / Resolution | User Experience |
|---|---|---|
| **Malformed JSON from AI** | `validateItinerary` sanitizes fences and validates object structure | Gracefully falls back to error state with clean feedback |
| **Missing Required Fields** | Schema checker enforces mandatory trip properties (`days`, `stops`, `title`) | Displays error details with prompt suggestions |
| **Timeout (>15 seconds)** | Dual client & server `AbortController` timeouts | Shows "Request timed out" with a 1-click **Retry** button |
| **Rapid Submissions** | Stale request tracking matches `requestId` on Redux store | Stale API responses are safely ignored |
| **Offline Network Loss** | Client detects `navigator.onLine === false` | Prompts user with an offline connectivity warning |
| **Rate Limit / API Error** | Express proxy maps status codes (e.g., 429, 400 safety blocks) | Displays user-friendly guidance to rephrase or wait |

---

## 🧪 Testing & Failure Simulation

### Unit Tests
Built with **Vitest** for state management, JSON validation, fence stripping, and stale request cancellation:

```bash
# Run unit test suite
npm test

# Run tests in watch mode
npm run test:watch
```

### Failure Mode Simulation (`MOCK_MODE`)
Test UI error states without burning API quota by configuring `MOCK_MODE` in `.env`:

```env
# Options: malformed | empty | slow | partial | off
MOCK_MODE=malformed
```

- `malformed`: Returns unparseable JSON text.
- `empty`: Simulates blank upstream AI response.
- `slow`: Delays response for 20s to trigger client timeout handler.
- `partial`: Returns valid JSON missing required trip schema elements.

---

## 🔄 State Management (Redux Toolkit)

Global state is centralized in `itinerarySlice`:

```javascript
{
  status: 'idle' | 'loading' | 'success' | 'error',
  data: {
    tripTitle: string,
    destination: string,
    duration: string,
    travelers: number,
    estimatedBudget: string,
    days: [
      {
        id: string,
        dayNumber: number,
        title: string,
        stops: [
          { id: string, name: string, time: string, description: string, cost: string, tips: string }
        ]
      }
    ]
  },
  errorMessage: string | null,
  requestId: string | null,
  lastPrompt: string | null
}
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, Vite |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`), Custom `@theme` tokens |
| **State Management** | Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) |
| **Drag & Drop** | `@dnd-kit/core`, `@dnd-kit/sortable` |
| **Backend Proxy** | Express.js (Node 18+ ES Modules) |
| **AI Integration** | Google Gemini API (Structured JSON Schema) |
| **Testing** | Vitest |

---

## 📋 Available Scripts

- `npm start` - Launches both backend server and Vite client concurrently.
- `npm run dev` - Starts Vite frontend only.
- `npm run dev:server` - Starts Express proxy server only.
- `npm run build` - Builds production frontend assets.
- `npm test` - Runs Vitest unit tests.
h CSS custom properties |
| Testing | Vitest |
