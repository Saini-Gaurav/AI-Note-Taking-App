# Backend - AI Notes Pro API

Hono API server for authentication, notes CRUD/search, and AI note actions.

## Highlights

- JWT auth with access + refresh token rotation
- Layered architecture for maintainability and testing
- Notes CRUD + search endpoints with validation
- AI endpoints for summarize/improve/tags
- Fallback-safe AI handling for provider failures and quota limits

## Tech Stack

- Hono.js + TypeScript
- MongoDB + Mongoose
- Zod validation
- JWT (`jsonwebtoken`)
- Pino logger
- Gemini/OpenAI compatible service layer (currently Gemini-based)

## Architecture

Request flow:

- `routes -> controllers -> services -> repositories -> models`

Cross-cutting middleware:

- CORS
- request logging
- rate limiting
- auth guard
- schema validation
- centralized error handling

## Environment

Copy `backend/.env.example` to `backend/.env` and fill:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/ai-notes-pro
JWT_ACCESS_SECRET=replace_with_strong_secret_32_chars_min
JWT_REFRESH_SECRET=replace_with_strong_secret_32_chars_min
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash-latest
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
CORS_ORIGIN=http://localhost:3000
```

## Commands

```bash
npm run dev
npm run build
npm run start
```

## Run Locally

```bash
cd backend
npm install
npm run dev
```

Server starts at `http://localhost:4000`.

## Endpoints

### System

- `GET /api/health`
- `GET /api/docs`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Notes

- `GET /api/notes?q=...`
- `POST /api/notes`
- `GET /api/notes/:id`
- `PATCH /api/notes/:id`
- `PUT /api/notes/:id`
- `DELETE /api/notes/:id`

### AI

- `POST /api/notes/:id/ai/summarize`
- `POST /api/notes/:id/ai/improve`
- `POST /api/notes/:id/ai/tags`
- `POST /api/ai/summarize` with `{ "text": "..." }`
- `POST /api/ai/improve` with `{ "text": "..." }`
- `POST /api/ai/tags` with `{ "text": "..." }`

## AI Fallback Behavior

- Provider errors are mapped to clear API responses (`429`, `503`, etc.)
- Frontend can switch to local mock AI output for uninterrupted demos
- This allows assignment flow to remain functional even when provider quota is limited

## Troubleshooting

### AI returns `503 Invalid Gemini API key`

- Ensure `GEMINI_API_KEY` is valid and active
- Remove quotes/extra spaces in `.env`
- Restart server after `.env` changes

### AI returns `429`

- Key is recognized, but billing/quota/rate limit is exceeded
- Check Gemini API quotas and project limits in Google AI Studio
