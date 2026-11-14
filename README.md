# Recall

Recall is an AI-powered active recall and adaptive learning platform. It generates structured lessons, assesses mastery through tailored quizzes, and delivers pinpoint remediation for topics that need reinforcement.

## Architecture

- **`server/`**: Express.js API backend built with a clean Model-View-Controller (MVC) pattern, robust error handling, input validation, and Gemini AI integration.
- **`client/`**: Modern React + Vite application featuring a unified session flow, state machine, decoupled data models, custom controller hooks, and modular UI components.

## Directory Structure

```
recall/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js                  # loads GEMINI_API_KEY, PORT, timeouts
│   │   ├── routes/
│   │   │   ├── index.js                # mounts all routes under /api
│   │   │   ├── lesson.routes.js        # POST /api/lesson
│   │   │   ├── quiz.routes.js          # POST /api/quiz
│   │   │   └── remediation.routes.js   # POST /api/remediation
│   │   ├── controllers/
│   │   │   ├── lesson.controller.js
│   │   │   ├── quiz.controller.js
│   │   │   └── remediation.controller.js
│   │   ├── models/                     # Zod schemas = the contract
│   │   │   ├── lesson.model.js
│   │   │   ├── quiz.model.js
│   │   │   └── remediation.model.js
│   │   ├── views/                      # shapes the JSON sent to the client
│   │   │   └── response.view.js        # success({data, warnings}) / failure({code, message})
│   │   ├── services/
│   │   │   ├── ai.service.js           # the only file that talks to Gemini
│   │   │   ├── prompts.js              # the 3 prompt builders
│   │   │   └── parser.service.js       # strip code fences, JSON.parse, Zod validate, retry once
│   │   ├── middleware/
│   │   │   ├── validateRequest.js      # checks topic length, level value
│   │   │   ├── rateLimit.js
│   │   │   └── errorHandler.js         # one place that turns errors into responses
│   │   ├── utils/
│   │   │   ├── AppError.js             # typed errors: TIMEOUT, BAD_JSON, BAD_SHAPE, EMPTY
│   │   │   └── extractJson.js
│   │   ├── app.js                      # express app, cors, json, routes, errorHandler
│   │   └── server.js                   # starts listening
│   ├── .env                            # never committed
│   ├── .env.example
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── models/                     # data and business logic, no React inside
│   │   │   ├── lesson.schema.js        # same Zod shapes, validated again on the client
│   │   │   ├── quiz.schema.js
│   │   │   ├── remediation.schema.js
│   │   │   ├── scoring.js              # per-section score, strength levels, weak sections
│   │   │   ├── sessionReducer.js       # stage, lesson, quiz, answers, report state
│   │   │   └── constants.js            # stages, levels, limits
│   │   ├── controllers/                # hooks: user action -> API -> model -> view
│   │   │   ├── useAiRequest.js         # loading/error, AbortController, stale guard, retry
│   │   │   ├── useLessonController.js
│   │   │   ├── useQuizController.js    # answer, next, retry missed
│   │   │   ├── useReportController.js  # runs scoring.js, triggers remediation call
│   │   │   └── useTheme.js
│   │   ├── services/
│   │   │   └── api.js                  # fetch wrappers for /api/lesson, /quiz, /remediation
│   │   ├── context/
│   │   │   └── SessionContext.jsx      # provides state and dispatch to the whole app
│   │   ├── views/
│   │   │   ├── pages/
│   │   │   │   ├── InputPage.jsx
│   │   │   │   ├── LessonPage.jsx
│   │   │   │   ├── QuizPage.jsx
│   │   │   │   ├── ReportPage.jsx
│   │   │   │   └── ReviewPage.jsx      # tabs: Re-explained / Remember / Revise
│   │   │   ├── components/
│   │   │   │   ├── layout/             # TopBar, StageTrail, ThemeToggle
│   │   │   │   └── feedback/           # LoadingState, ErrorBoundary, EmptyState, ErrorBanner
│   │   │   └── styles/
│   │   │       ├── tokens.css          # palette variables, light + dark
│   │   │       └── global.css
│   │   ├── App.jsx                     # picks the page based on session.stage
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js                  # proxies /api to the server in dev
│   └── package.json
│
├── .gitignore
├── package.json                        # root scripts so `npm install && npm start` works
└── README.md
```

## Quick Start

1. Install dependencies:
   ```bash
   npm run install:all
   ```
2. Configure `.env` in `server/`:
   ```bash
   cp server/.env.example server/.env
   # Add your GEMINI_API_KEY
   ```
3. Run the development environment:
   ```bash
   npm run dev
   ```
   This starts the Express backend on port 5000 and the Vite dev server on port 3000 (which proxies `/api` to the backend).

## Running Tests

Run the backend validation, edge cases, and mocked AI test suite:
```bash
npm --prefix server test
```
Or directly with Node:
```bash
node server/test/failure-cases.js
```
You can also inspect and trigger requests using [`server/test/failure-cases.http`](server/test/failure-cases.http).

## How the AI Is Used

Recall uses **Google Gemini** (currently `gemini-3.5-flash`) as the runtime AI model at three points in the learning flow:

1. **Lesson generation** — Given a topic and difficulty level, Gemini produces a structured JSON lesson with 3–6 sections, each containing an explanation, key points, and a concrete example.
2. **Quiz generation** — Given the lesson, Gemini generates ≥10 multiple-choice questions that reference specific section IDs from the lesson. Each question has exactly 4 options, one correct answer, and an explanation.
3. **Remediation** — Given the user's weak sections and wrong answers, Gemini produces targeted re-explanations, "why you missed it" diagnoses, memory tricks, and a spaced repetition schedule.

**Prompt engineering decisions:**
- All prompts use **JSON output mode** (`responseMimeType: 'application/json'`) and temperature ~0.4 for deterministic, structured output.
- A system-level instruction tells the model to treat the user's topic text as *data*, not as instructions — this is the prompt-injection defense.
- Prompts are in `server/src/services/prompts.js`. The AI SDK wrapper is in `server/src/services/ai.service.js` — it is the **only** file that imports `@google/genai`.

**AI-assisted development:** This project was built with the assistance of an AI coding agent (Antigravity / Gemini). The agent helped with code generation, debugging, and architecture decisions. All code was reviewed, understood, and tested by the developer.

## Failure Handling

Handling AI failures robustly is a core design goal. The system handles five failure modes:

| Failure | Where handled | What happens |
|---|---|---|
| **Malformed JSON** (code fences, trailing text) | `parser.service.js` | Strips markdown fences, extracts first `{...}` block, retries once with a stricter prompt |
| **Wrong shape** (valid JSON, wrong schema) | `parser.service.js` + Zod | Zod validation rejects it, retries once, then returns `BAD_SHAPE` error |
| **Empty response** | `ai.service.js` | Throws `EMPTY` error (502) |
| **Slow / timeout** | `ai.service.js` | `AbortController` fires after `AI_TIMEOUT_MS` (default 60s), returns `TIMEOUT` (504). Never retried. |
| **API failure / rate limit** | `ai.service.js` | Automated model cascade: tries up to 5 models with 600ms backoff. Returns `UPSTREAM` (502) if all fail. |

**Stale response prevention:** The client uses a `requestIdRef` counter. Each new request increments it and aborts the previous in-flight request. When a response arrives, it checks `currentRequestId === requestIdRef.current` — if a newer request has started, the stale response is silently discarded.

**Error Boundary:** A React `ErrorBoundary` wraps the entire app. If any component throws during rendering (e.g. accessing `.map()` on `undefined`), the user sees a friendly "Something went wrong" screen with a "Try Again" button instead of a blank white page.

## API Key Security

The Gemini API key is **never shipped to the browser**:

- The key lives only in `server/.env` (git-ignored).
- `server/src/services/ai.service.js` is the sole file that imports `@google/genai`.
- The client makes `fetch()` calls to relative paths (`/api/lesson`, etc.), which are proxied to the Express backend by Vite in dev.
- The error handler never leaks the API key or raw request bodies in responses.

## Known Limitations

1. **No persistence** — Session state (lesson, quiz answers, report, remediation) is held in React `useReducer` memory. Refreshing the browser resets everything. There is no database or `localStorage` persistence.
2. **No authentication** — The app has no user accounts. Rate limiting is per-IP only (20 requests/minute).
3. **AI output variability** — Gemini's responses may occasionally produce fewer questions than requested, or explanations that vary in quality. The lenient validators drop invalid questions and warn the user rather than failing entirely.
4. **Single-session design** — The app supports one learning session at a time. There is no history, bookmarks, or multi-topic dashboard.
5. **Model availability** — The app depends on Google Gemini API availability. During high-demand periods, the automated model cascade may exhaust all candidates and return an upstream error.
6. **No offline support** — The app requires an active internet connection for both the frontend (dev server) and backend (Gemini API calls).

## Time Spent

Approximately **12–14 hours** total:
- ~3 hours: Architecture design, backend MVC setup, Zod schemas, error types
- ~3 hours: AI service layer (prompt engineering, parser, retry logic, model cascade)
- ~4 hours: Frontend (5-page session flow, controller hooks, UI components, dark mode, mobile responsive)
- ~2 hours: Failure handling, edge cases, testing, and debugging model availability issues
  R e c a l l _ F l a m  
 