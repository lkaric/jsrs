# 🛠️ Development Guide

## Prerequisites

- **Node.js** >= 24.13.0 (use `.node-version` with fnm/nvm)
- **pnpm** >= 9
- **Docker** + Docker Compose

## First-Time Setup

```bash
git clone https://github.com/lkaric/jsrs
cd jsrs
pnpm install
cp .env.example .env.local
```

Edit `.env.local` — every variable is documented in `.env.example`.

## Starting the Database

```bash
docker compose up -d          # starts Postgres 16 on localhost:5432
docker compose logs -f db     # tail logs
docker compose down           # stop
```

## Database Migrations

```bash
# Generate a new migration after schema changes
DATABASE_URL="postgresql://..." pnpm db:generate

# Apply pending migrations
DATABASE_URL="postgresql://..." pnpm db:migrate

# Open Drizzle Studio (visual DB browser)
DATABASE_URL="postgresql://..." pnpm db:studio
```

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

All variables are documented in `.env.example`. Key groups:

| Variable | Required for |
|---|---|
| `DATABASE_URL` | All DB operations |
| `BETTER_AUTH_SECRET` | Session signing |
| `BETTER_AUTH_URL` | OAuth callback base URL |
| `GITHUB_CLIENT_ID/SECRET` | GitHub OAuth |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth |
| `RESEND_API_KEY` | OTP email delivery |
| `SVC_VERIFY_URL` | Web app → svc-verify |
| `SVC_VERIFY_HMAC_SECRET` | HMAC auth between web + svc-verify |

## Dev Container

A `.devcontainer/devcontainer.json` is provided for VS Code / GitHub Codespaces. It includes Docker-in-Docker so `docker compose up -d` works out of the box.

## Troubleshooting

**`DATABASE_URL` not picked up** — prefix the command directly: `DATABASE_URL="..." pnpm db:migrate`

**Port conflicts** — web defaults to 3000, svc-verify to 3001. Set `PORT` in `.env.local` to override.

**pnpm install fails** — ensure Node.js >= 24.13.0 (`node -v`). Use fnm: `fnm use`.
