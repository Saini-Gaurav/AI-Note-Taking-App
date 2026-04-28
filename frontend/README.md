# Frontend - AI Notes Pro

Next.js client application for authentication, note management, search, and AI-assisted writing.

## Highlights

- Auth flow (login/register/logout) with protected dashboard
- Notes list + editor with create, update, delete, and search
- AI actions (summarize, improve, tags) integrated into note workflow
- Responsive UI with light/dark theme
- Graceful fallback support when AI provider limits are hit

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form
- Axios + token refresh interceptor
- Sonner toasts

## Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
NEXT_PUBLIC_AI_MOCK_MODE=false
```

- Set `NEXT_PUBLIC_AI_MOCK_MODE=true` to return mock AI output after provider errors.

## Run & Build

```bash
npm run dev
npm run build
npm run start
npm run lint
```

App URL: `http://localhost:3000`

## Folder Structure

```text
frontend/
└── src/
    ├── app/              # pages and layouts
    ├── features/auth/    # auth feature modules
    ├── features/notes/   # notes + AI flows
    ├── providers/        # auth/theme providers
    ├── lib/              # API client and utilities
    └── components/       # shared UI components
```

## Notes

- Main AI flow calls: `POST /api/notes/:id/ai/:action`
- Provider errors are shown to users with clear toasts
- Optional mock mode keeps demos functional when provider quota is exceeded
