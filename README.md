# Pastebin-Lite (Node.js + Express + Redis)

A minimal Pastebin-like service built to pass automated grading:
- Create pastes
- Share URLs
- TTL and max-view constraints
- Deterministic time for testing
- Redis persistence (serverless-safe)

## Requirements
- Node.js 18+
- Redis (managed recommended)

## Environment Variables
Create a `.env` file (do NOT commit secrets):

```
PORT=3000
REDIS_URL=redis://:password@host:port
FRONTEND_BASE_URL=http://localhost:3000
TEST_MODE=0
```

> In test runs, the grader may set `TEST_MODE=1` and pass `x-test-now-ms` header.

## Run locally
```
npm install
npm run dev
```
Open:
- Health: `GET /api/healthz`
- Create: `POST /api/pastes`
- View API: `GET /api/pastes/:id`
- View HTML: `GET /p/:id`

## Persistence
Redis is used as the primary persistence layer. No in-memory storage.

## Notes
- All unavailable pastes return HTTP 404.
- HTML output escapes content safely.
