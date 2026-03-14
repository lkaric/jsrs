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
compatibility_flags = ["nodejs_compat"]

[observability]
enabled = true
```

### `apps/web/wrangler.toml`

```toml
name = "jsrs-web"
main = "@tanstack/react-start/server-entry"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

[[custom_domains]]
pattern = "js.rs"

[[services]]
binding = "SVC_VERIFY"
service = "jsrs-svc-verify"

[observability]
enabled = true
```

> `main = "@tanstack/react-start/server-entry"` is a virtual module resolved by `@cloudflare/vite-plugin` — not a path to a built file.

---

## GitHub Repository Secrets

Set these in **Settings → Secrets and variables → Actions**:

| Secret | Used by | Description |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Both | Wrangler authentication — needs Workers edit permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Both | Your Cloudflare account ID |
| `DATABASE_URL` | Both | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Both | Random 32-byte secret for better-auth session signing |
| `BETTER_AUTH_URL` | web | Public base URL, e.g. `https://jsrs.app` — used for OAuth callbacks |
| `GH_CLIENT_ID` | web | GitHub OAuth app client ID |
| `GH_CLIENT_SECRET` | web | GitHub OAuth app client secret |
| `GOOGLE_CLIENT_ID` | web | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | web | Google OAuth client secret |
| `RESEND_API_KEY` | web | Resend API key for OTP email delivery |
| `EMAIL_FROM` | web | Sender address, e.g. `noreply@jsrs.app` |

**Not needed:** `SVC_VERIFY_URL`, `SVC_VERIFY_HMAC_SECRET` — the Service Binding replaces HTTP transport entirely.

---

## Environment Variable Mapping

Local `.env.local` → Cloudflare Worker secrets:

```
DATABASE_URL          → wrangler secret put DATABASE_URL
BETTER_AUTH_SECRET    → wrangler secret put BETTER_AUTH_SECRET
BETTER_AUTH_URL       → wrangler secret put BETTER_AUTH_URL
GH_CLIENT_ID      → wrangler secret put GH_CLIENT_ID
GH_CLIENT_SECRET  → wrangler secret put GH_CLIENT_SECRET
GOOGLE_CLIENT_ID      → wrangler secret put GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET  → wrangler secret put GOOGLE_CLIENT_SECRET
RESEND_API_KEY        → wrangler secret put RESEND_API_KEY
EMAIL_FROM            → wrangler secret put EMAIL_FROM
```

Worker secrets are set per-Worker. Run `wrangler secret put <NAME>` from the respective app directory.

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

**Jobs:** `deploy-svc-verify` and `deploy-web` run in **parallel** — both are gated only on CI success via `if: github.event.workflow_run.conclusion == 'success'`. Neither job depends on the other.

**Concurrency:** `cancel-in-progress: false` — deploys are never cancelled mid-flight.

---

## Neon Database Setup

1. Create a Neon project at [neon.tech](https://neon.tech)
2. Copy the **pooled** connection string (ends in `?sslmode=require`)
3. Set it as `DATABASE_URL` in GitHub secrets and locally in `.env.local`

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
