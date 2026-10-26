# IM-PROJECT

## Backend

The Express application starts with `npm start` (or `npm run dev` for watch mode).
Configuration is loaded from the environment, with optional `.env` support:

- `PORT` (default: `3000`)
- `NODE_ENV` (`development`, `test`, or `production`; default: `development`)
- `DATABASE_URL` (optional PostgreSQL URL; database connectivity is not enabled yet)

`GET /health` returns `{"status":"ok"}` and does not access the database. The
resource endpoint and its response schema, along with the database access
settings, must be agreed before implementing database-backed routes.