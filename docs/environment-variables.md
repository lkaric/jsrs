# Environment Variables

JSRS runs on Cloudflare Workers (`apps/web`). Environment variables are **not** set via `.env` files — they are Cloudflare **bindings** read via `process.env` at runtime (enabled by the `nodejs_compat_populate_process_env` compatibility flag in `wrangler.toml`).

---

## Local Development

Create `apps/web/.dev.vars` (gitignored). Wrangler reads this file automatically when you run `pnpm dev`.

```ini
# apps/web/.dev.vars
DATABASE_URL=postgresql://jsrs:jsrs_dev_password@localhost:5432/jsrs_dev
BETTER_AUTH_SECRET=dev-secret-replace-in-production
BETTER_AUTH_URL=http://localhost:3000
GH_CLIENT_ID=
GH_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
```

> **Important:** No quotes around values. Wrangler's `.dev.vars` parser does not strip them.

---

## Production

Secrets are set via the Wrangler CLI and stored encrypted in Cloudflare:

```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put GH_CLIENT_ID
npx wrangler secret put GH_CLIENT_SECRET
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put RESEND_API_KEY
```

Non-sensitive vars (e.g. `BETTER_AUTH_URL`) can be added to `wrangler.toml` under `[vars]` instead.

---

## Variable Reference

### Database

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |

Local: Docker Compose at `localhost:5432` (see `docker-compose.yml`).
Production: Neon — `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`.

### Auth (better-auth)

| Variable | Description | Example |
|---|---|---|
| `BETTER_AUTH_SECRET` | HMAC secret for signing sessions | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Base URL used for OAuth callback construction | `https://js.rs` |

`BETTER_AUTH_SECRET` must be at least 32 characters. Rotate it by setting a new secret — all active sessions will be invalidated.

### OAuth — GitHub

| Variable | Description | Where to get it |
|---|---|---|
| `GH_CLIENT_ID` | GitHub OAuth App client ID | github.com → Settings → Developer settings → OAuth Apps |
| `GH_CLIENT_SECRET` | GitHub OAuth App client secret | Same |

Callback URL to register: `{BETTER_AUTH_URL}/api/auth/callback/github`

### OAuth — Google

| Variable | Description | Where to get it |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | console.cloud.google.com → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Same |

Callback URL to register: `{BETTER_AUTH_URL}/api/auth/callback/google`

### Email (Resend)

| Variable | Description | Where to get it |
|---|---|---|
| `RESEND_API_KEY` | Resend API key for transactional email | resend.com → API Keys |

Used for: OTP delivery, waitlist notifications.

---

## How It Works (Cloudflare Workers)

Cloudflare Workers do not use `process.env` by default. Two compatibility flags in `apps/web/wrangler.toml` enable Node.js-compatible env access:

```toml
compatibility_flags = ["nodejs_compat", "nodejs_compat_populate_process_env"]
```

- `nodejs_compat` — enables Node.js built-in polyfills
- `nodejs_compat_populate_process_env` — copies all bindings into `process.env`

Without `nodejs_compat_populate_process_env`, you would need to use `import { env } from "cloudflare:workers"` instead of `process.env` in server-side code.

---

## Database CLI Commands

Migrations and Drizzle Studio require passing `DATABASE_URL` directly (they run in Node.js, not Workers):

```bash
cd packages/db

# Generate migration after schema changes
DATABASE_URL="postgresql://..." pnpm db:generate

# Apply pending migrations
DATABASE_URL="postgresql://..." pnpm db:migrate

# Open Drizzle Studio
DATABASE_URL="postgresql://..." pnpm db:studio
```
