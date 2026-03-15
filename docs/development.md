# 🛠️ Development Guide

## Prerequisites

- **Node.js** >= 24.13.0 (use `.node-version` with fnm/nvm)
- **pnpm** >= 9
- **Neon account** — [neon.tech](https://neon.tech) (free tier is sufficient)

## First-Time Setup

```bash
git clone https://github.com/lkaric/jsrs
cd jsrs
pnpm install
```

Create `apps/web/.dev.vars` with your Neon dev branch connection string:

```ini
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=dev-secret-replace-in-production
BETTER_AUTH_URL=http://localhost:3000
GH_CLIENT_ID=
GH_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
```

See **[docs/environment-variables.md](./environment-variables.md)** for the full variable reference.

## Database — Neon Branching Workflow

The app uses **Neon's HTTP driver** (`@neondatabase/serverless`) which is required for Cloudflare Workers compatibility. This means each developer works against a **Neon branch** rather than a local postgres.

### Setting up your dev branch

1. Go to the [Neon dashboard](https://console.neon.tech) → your project
2. Click **Branches → New branch**, name it `dev/yourname`, branch from `main`
3. Copy the connection string and put it in `apps/web/.dev.vars` as `DATABASE_URL`
4. Apply migrations against your branch:

```bash
cd packages/db
DATABASE_URL="postgresql://..." pnpm db:migrate
```

Your branch is isolated — reset, nuke, or recreate it freely without affecting production or other developers.

### Resetting your dev branch

```bash
# In the Neon dashboard: Branches → your branch → Reset to parent
# Then re-apply migrations:
cd packages/db && DATABASE_URL="postgresql://..." pnpm db:migrate
```

## Database Migrations

```bash
# Generate a new migration after schema changes
cd packages/db
DATABASE_URL="postgresql://..." pnpm db:generate

# Apply pending migrations to your dev branch
DATABASE_URL="postgresql://..." pnpm db:migrate

# Open Drizzle Studio (visual DB browser)
DATABASE_URL="postgresql://..." pnpm db:studio
```

Always commit the generated SQL file in `packages/db/src/migrations/` alongside your schema change. The deploy pipeline applies migrations to production automatically before deploying Workers.

## Regenerating the better-auth Schema

After changing `packages/auth/src/auth.ts` (e.g. adding a plugin):

```bash
DATABASE_URL="postgresql://..." pnpm dlx auth@latest generate \
  --config ./packages/auth/src/auth.ts \
  --output ./packages/db/src/schema/auth/index.ts \
  --yes
```

The output file is managed by better-auth — do not hand-edit it.

## Running the Apps

```bash
pnpm dev          # starts web (port 3000) + svc-verify (port 3001) via Turborepo
```

Or run individually:
```bash
pnpm --filter @jsrs/web dev
pnpm --filter @jsrs/svc-verify dev
```

## Linting & Formatting

```bash
pnpm lint         # Biome check (read-only)
pnpm lint:fix     # Biome check + auto-fix (runs on commit via Lefthook)
```

## Type Checking

```bash
pnpm typecheck    # tsc --noEmit across all workspaces (runs on push via Lefthook)
```

## Building

```bash
pnpm build        # build all apps + packages via Turborepo
```

## Environment Variables

See **[docs/environment-variables.md](./environment-variables.md)** for the full reference including local setup, production secrets, and Cloudflare Workers specifics.

## Troubleshooting

**`DATABASE_URL` not picked up** — for CLI tools (migrations, studio) prefix the command directly: `DATABASE_URL="..." pnpm db:migrate`. For the dev server, ensure `apps/web/.dev.vars` exists — see [docs/environment-variables.md](./environment-variables.md).

**Port conflicts** — web defaults to 3000, svc-verify to 3001. Set `PORT` in `.env.local` to override.

**pnpm install fails** — ensure Node.js >= 24.13.0 (`node -v`). Use fnm: `fnm use`.
