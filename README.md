# AI Notes Pro

A full-stack AI-powered note-taking app built with Next.js and Hono.  
It includes secure authentication, note management, search, and AI assistance for summarization, rewriting, and tags.

## Key Highlights

- Secure auth flow with access + refresh tokens
- Notes CRUD with search and responsive dashboard UI
- AI actions: summarize, improve text, generate tags
- Clean layered backend architecture for maintainability
- AI fallback logic implemented for quota/provider failures

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Hono.js, TypeScript
- **Database:** MongoDB (Mongoose) *(adaptable to PostgreSQL)*
- **AI Provider:** Gemini/OpenAI (configurable)

## AI Fallback Note

Due to external API quota/rate limitations, fallback logic is built into `ai.service.ts`.  
If provider calls fail, the app still returns mock/fallback AI output so the product flow remains demo-ready.

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
# Terminal 1
cd backend && npm run dev

# Terminal 2
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

> Replace with your actual demo account before submission.

## License

This project is created for assignment/demo purposes.

