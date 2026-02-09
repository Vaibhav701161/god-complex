# God Complex

This is a monorepo for a daily accountability app. The main idea is: you declare goals for the day, and later you check them in as completed, min effort, or failed. The system tracks groups, time zones, and penalties.

## What is here

- Web app (Next.js) for the UI
- API server (Express) for auth, goals, check-ins, and state
- Shared packages for Prisma, UI, and config

## Tech stack

- Next.js (frontend)
- Express + Prisma (backend)
- Postgres (database)
- Turborepo + pnpm (monorepo tooling)

## Setup (local)

1. Install dependencies

```
pnpm install
```

2. Start the database

```
pnpm db:start
```

3. Run migrations

```
pnpm db:migrate
```

4. Optional seed data

```
pnpm db:seed
```

5. Start dev servers

```
pnpm dev
```

Web app: http://localhost:3000
API server: http://localhost:4000

## Common scripts

- pnpm dev
- pnpm build
- pnpm lint
- pnpm check-types
- pnpm db:start
- pnpm db:stop
- pnpm db:reset
- pnpm db:migrate
- pnpm db:seed

## Project layout

```
apps/
  http-server/   API server
  web/           Next.js frontend
packages/
  prisma/        schema and client
  ui/            shared UI components
  eslint-config/ shared lint config
  typescript-config/ shared TS config
scripts/         local setup and validation scripts
```

## Notes

- Group cutoff controls when you can declare or edit goals.
- Check-in should be allowed any time after goals exist, unless the day is finalized.
