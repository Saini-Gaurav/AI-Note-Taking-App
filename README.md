# AI Notes Pro

A full-stack AI-powered note-taking application built with Next.js and Hono.  
It provides secure authentication, note management, search, and AI capabilities for summarization, rewriting, and tag generation.

## Key Highlights

- Secure authentication with access and refresh tokens
- Complete notes CRUD with search and a responsive dashboard
- AI actions for summarization, text improvement, and tag generation
- Layered backend architecture designed for maintainability
- Fallback logic for provider quota and availability issues

## Feature Breakdown

- **Authentication**
  - Register, login, and logout
  - Protected dashboard route
  - Access and refresh token flow
- **Notes Management**
  - Create, read, update, and delete notes
  - Search notes by query
  - Draft-friendly editing workflow
- **AI Assistance**
  - Summarize long notes
  - Improve writing clarity
  - Generate suggested tags
- **Reliability**
  - Validation and centralized error handling
  - Fallback AI responses when provider fails

## AI Features

- Real API integration with Gemini/OpenAI along with fallback handling for reliability.
- Note-level AI endpoints:
  - `POST /api/notes/:id/ai/summarize`
  - `POST /api/notes/:id/ai/improve`
  - `POST /api/notes/:id/ai/tags`
- When quota, authentication, or model issues occur, the app surfaces clear error messages and can continue with graceful fallback responses to maintain consistent user experience.

## System Architecture & Flow

### Backend Flow

`routes -> controllers -> services -> repositories -> models`

1. Each request enters the route and middleware pipeline (auth, validation, rate limiting, and logging).
2. Controller maps request to a business operation.
3. Service executes core logic (including AI orchestration and fallback strategy).
4. Repository interacts with MongoDB through Mongoose models.
5. Response is returned with consistent error mapping.

### Frontend Flow

1. User authenticates and accesses the protected dashboard.
2. Notes data is fetched through typed API client.
3. User actions (save, delete, search, AI) invoke backend endpoints.
4. UI updates local state and displays success/error toasts.

## UI/UX

- Responsive dashboard layout across desktop and smaller screens.
- Clean, modern interface using Tailwind and component-driven design.
- Light/dark theme support.
- Clear feedback states for loading, errors, success toasts, and AI fallback messaging.

## Key Technical Decisions

- Adopted a layered backend architecture (`controller -> service -> repository`) to improve scalability and maintain separation of concerns.
- Implemented an AI service abstraction to support multiple providers with minimal changes to business logic.
- Added fallback handling to preserve feature continuity during provider or quota failures.
- Used JWT-based authentication with refresh tokens to strengthen session security.

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Hono.js, TypeScript
- **Database:** MongoDB (Mongoose) *(adaptable to PostgreSQL)*
- **AI Provider:** Gemini/OpenAI (configurable)

## AI Fallback Note

Due to external API quota and rate limitations, fallback logic is built into `ai.service.ts`.  
If provider calls fail, the app returns graceful fallback responses to maintain consistent user experience.

## Evaluation Focus

This project prioritizes:

- Clean and maintainable code
- Functional AI integration
- Robust error handling
- Good user experience

instead of focusing on unnecessary feature expansion.

## Project Structure

```text
ai-notes-pro-poc/
├── frontend/        # Next.js client
├── backend/         # Hono API server
├── README.md
```

## Setup

### 1) Install dependencies

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2) Configure environment variables

```bash
cd backend
copy .env.example .env

cd ../frontend
copy .env.example .env.local
```

Minimum config:

- `frontend/.env.local`
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api`
- `backend/.env`
  - `MONGODB_URI=...`
  - `JWT_ACCESS_SECRET=...`
  - `JWT_REFRESH_SECRET=...`
  - `GEMINI_API_KEY=...` *(optional when fallback mode is used)*

### 3) Run the app

```bash
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
cd frontend && npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Common Commands

### Frontend

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### Backend

```bash
npm run dev
npm run build
npm run start
```

## Demo

- **Live Demo:** `Add your deployed frontend URL here`
- **API URL:** `Add your deployed backend URL here`
- **Video Walkthrough:** `Add your demo video link here`

## Test Credentials

```text
Email: demo@example.com
Password: demo@123
```

## License

This project is developed for assignment and demonstration purposes.

