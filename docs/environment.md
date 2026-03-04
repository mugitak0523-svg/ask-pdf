# Environment Separation (dev/prod)

This repository supports two environments:

- `development`
- `production`

## Backend

The backend reads env files in this order:

1. If `APP_ENV=production`: `.env.production`
2. Otherwise: `.env.development`
3. Fallback: `.env`

Create files from templates:

```bash
cp .env.development.example .env.development
cp .env.production.example .env.production
```

Run backend:

```bash
APP_ENV=development uvicorn app.main:app --app-dir apps/server --reload
APP_ENV=production uvicorn app.main:app --app-dir apps/server --host 0.0.0.0 --port 8000
```

## Frontend

Use separate env files for Next.js:

- dev: `apps/web/.env.local` (from `apps/web/.env.development.example`)
- prod: deploy platform secrets or `apps/web/.env.production.local`

Template files:

```bash
cp apps/web/.env.development.example apps/web/.env.local
cp apps/web/.env.production.example apps/web/.env.production.local
```
