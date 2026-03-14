# Deployment — Cloudflare Workers

Both JSRS apps deploy to **Cloudflare Workers** via GitHub Actions on every push to `main` (after CI passes).

---

## Prerequisites

- Cloudflare account with Workers enabled
- Wrangler CLI installed locally: `pnpm add -g wrangler`
- Logged in: `wrangler login`

---

## Cloudflare Setup

### 1. Create the Workers

Create both Workers in the Cloudflare dashboard (or via Wrangler) before the first deploy.

```bash
# From apps/svc-verify
wrangler deploy --dry-run   # creates the Worker entry on first real deploy

# From apps/web
wrangler deploy --dry-run
```

Worker names (must match `wrangler.toml`):

| App | Worker name |
|---|---|
| `apps/web` | `jsrs-web` |
| `apps/svc-verify` | `jsrs-svc-verify` |

### 2. Configure the Service Binding

`apps/web` calls `apps/svc-verify` exclusively via a **Cloudflare Service Binding** — `svc-verify` has no public URL.

The binding is declared in `apps/web/wrangler.toml`:

```toml
[[services]]
binding = "SVC_VERIFY"
service = "jsrs-svc-verify"
```

At runtime, `apps/web` calls `svc-verify` via:

```ts
const response = await env.SVC_VERIFY.fetch(request)
```

No `SVC_VERIFY_URL` env var is needed — the binding handles routing internally within Cloudflare's network.

---

## wrangler.toml Reference

These files live in each app directory. Add them when the apps are scaffolded.

### `apps/svc-verify/wrangler.toml`

```toml
name = "jsrs-svc-verify"
main = "src/index.ts"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat", "nodejs_compat_populate_process_env"]

[observability]
enabled = true
```

### `apps/web/wrangler.toml`

```toml
name = "jsrs-web"
main = "@tanstack/react-start/server-entry"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat", "nodejs_compat_populate_process_env"]

[[routes]]
pattern = "js.rs"
custom_domain = true

[[services]]
binding = "SVC_VERIFY"
service = "jsrs-svc-verify"

[observability]
enabled = true
```

> `nodejs_compat_populate_process_env` copies all Cloudflare bindings (secrets + vars) into `process.env`, enabling standard Node.js-style env access. Without it, you must use `import { env } from "cloudflare:workers"` instead.

> `main = "@tanstack/react-start/server-entry"` is a virtual module resolved by `@cloudflare/vite-plugin` — not a path to a built file.

---

## Secrets vs Vars

Cloudflare has two ways to pass configuration to a Worker:

| Type | Where defined | Encrypted | Use for |
|---|---|---|---|
| **Secret** | `wrangler secret put` / CI pipeline | Yes | Sensitive values (API keys, DB URLs, auth secrets) |
| **Var** | `wrangler.toml` `[vars]` block | No (committed to repo) | Non-sensitive config (feature flags, public URLs) |

Both are available at runtime via `process.env.<NAME>` (enabled by `nodejs_compat_populate_process_env`).

---

## How Secrets Flow from GitHub → Cloudflare

The pipeline handles secret delivery automatically — you never run `wrangler secret put` manually in production.

```
GitHub Actions secret
        │
        ▼
  deploy.yml env: block      ← makes the value available to the runner
        │
        ▼
  wrangler-action secrets: block  ← calls `wrangler secret put` for each name
        │
        ▼
  Cloudflare Worker secret   ← stored encrypted, bound to the Worker
        │
        ▼
  process.env.NAME           ← accessible in server functions at runtime
```

In `deploy.yml`, each secret appears in two places:

```yaml
secrets: |
  DATABASE_URL          # tells wrangler-action to call `wrangler secret put DATABASE_URL`
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}   # provides the value from GitHub secrets
```

---

## GitHub Repository Secrets

Set these in **Settings → Secrets and variables → Actions**:

### Pipeline authentication

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Wrangler auth token — needs Workers Edit + Secrets Write permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

### Worker secrets (pushed to Cloudflare on each deploy)

| Secret | Worker | Description |
|---|---|---|
| `DATABASE_URL` | both | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | both | 32-byte secret for session signing (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | web | Public base URL — used for OAuth callback construction, e.g. `https://js.rs` |
| `GH_CLIENT_ID` | web | GitHub OAuth app client ID |
| `GH_CLIENT_SECRET` | web | GitHub OAuth app client secret |
| `GOOGLE_CLIENT_ID` | web | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | web | Google OAuth client secret |
| `RESEND_API_KEY` | web | Resend API key for transactional email |
| `EMAIL_FROM` | web | Sender address, e.g. `noreply@js.rs` |

**Not needed:** `SVC_VERIFY_URL`, `SVC_VERIFY_HMAC_SECRET` — the Service Binding replaces HTTP transport entirely.

---

## Local Development vs Production

| | Local | Production |
|---|---|---|
| **Config file** | `apps/web/.dev.vars` (gitignored) | GitHub Actions secrets |
| **How it's applied** | Wrangler reads `.dev.vars` automatically on `pnpm dev` | `wrangler-action` calls `wrangler secret put` on each deploy |
| **Accessible via** | `process.env.NAME` | `process.env.NAME` |

See **[docs/environment-variables.md](./environment-variables.md)** for the full variable reference.

---

## Manual Deployment

Deploy from local (requires `wrangler login`):

```bash
cd apps/svc-verify && wrangler deploy
cd apps/web && wrangler deploy
```

---

## CI/CD Pipeline

Deployment is automated via `.github/workflows/deploy.yml`.

**Trigger:** `workflow_run` on the `CI` workflow completing successfully on `main`. This means deploys only happen after lint + typecheck + build pass.

**Job order:**

```
CI (lint + typecheck + build)
        │
        ▼
    migrate          ← applies pending DB migrations against production Neon
    /       \
   ▼         ▼
deploy-   deploy-
svc-verify  web
```

- `migrate` runs `pnpm db:migrate` in `packages/db` using the `DATABASE_URL` GitHub secret (Neon production).
- `deploy-svc-verify` and `deploy-web` both `needs: migrate` — they only start after migrations succeed. If a migration fails, neither Worker is updated.
- The two deploy jobs run in **parallel** once migrations pass.

**Concurrency:** `cancel-in-progress: false` — deploys are never cancelled mid-flight.

### Adding a migration

1. Edit the schema in `packages/db/src/schema/`
2. Generate the migration file locally: `DATABASE_URL="..." pnpm db:generate` (from `packages/db/`)
3. Commit the generated SQL file in `packages/db/src/migrations/` alongside your schema change
4. Merge to `main` — the `migrate` job applies it automatically before the Workers are updated

> Never apply migrations manually to production after the pipeline is set up. Always go through the PR → merge → pipeline flow to keep the migration history in sync with the deployed code.

---

## Neon Database Setup

1. Create a Neon project at [neon.tech](https://neon.tech)
2. Copy the **pooled** connection string (ends in `?sslmode=require`)
3. Set it as `DATABASE_URL` in GitHub secrets and locally in `apps/web/.dev.vars`

### Known limitation (Phase 6)

`packages/db/src/client.ts` currently uses the `postgres` npm package. With `nodejs_compat` this works, but is not optimal for serverless — each Worker invocation may open a new TCP connection.

**Phase 6** swaps to `@neondatabase/serverless` which uses WebSockets for connection pooling, required for transaction support under concurrent serverless load.

---

## Verification Checklist

After initial setup:

1. Merge a PR to `main`
2. Confirm CI workflow completes — check the **Actions** tab
3. Confirm Deploy workflow triggers via `workflow_run` (appears as a separate run)
4. **Expected:** `deploy-svc-verify` fails with "no wrangler.toml found" — `apps/svc-verify` not yet scaffolded (Phase 3). `deploy-web` runs in parallel and should succeed. Confirm the svc-verify failure is a missing file, not a Wrangler auth error.
5. When `apps/svc-verify` is scaffolded (Phase 3): add `wrangler.toml` → both jobs should pass
6. End-to-end: push a change to `main` → confirm both Workers updated in Cloudflare dashboard
