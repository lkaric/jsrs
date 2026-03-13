# 🏗️ Architecture

## What is JSRS?

A Glassdoor alternative for the tech industry with **cryptographic anonymity guarantees** using Zero-Knowledge Proofs. Users prove employment via work email and submit anonymous reviews + salary data that cannot be linked back to them — not even by the platform operator.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Monorepo | Turborepo + pnpm workspaces | Single repo, multiple apps + packages |
| Full-stack app | TanStack Start | SSR + typed server functions |
| Auth | better-auth | Organizations plugin for employer accounts |
| ORM | Drizzle ORM | Schema-first, fully typed |
| DB | PostgreSQL | Docker (local), Neon (production) |
| ZKP | Semaphore (off-chain) + snarkjs | Browser WASM proof generation |
| UI | shadcn/ui + Tailwind CSS v4 | |
| Email | Resend | OTP delivery |

---

## Monorepo Structure

```
apps/
  web/                  # TanStack Start — public site + employer dashboard
  svc-verify/           # Internal Hono service — ZKP verification only
packages/
  db/                   # Drizzle schema + migrations (source of truth for DB)
  auth/                 # better-auth config + client export
  ui/                   # shadcn/ui component library
  types/                # Shared TypeScript types
  zkp-core/             # ZKP utilities: commitment, nullifier, proof, Merkle
```

---

## Database Schema — Three Domains

The schema is divided into three domains with strict boundary rules. **Foreign keys never cross domain boundaries.**

```
packages/db/src/schema/
  auth/    ← Identity: users, sessions, accounts, organizations, members
  jobs/    ← Job board: companies, jobs, applications
  anon/    ← ZKP anonymous: merkle_trees, leaves, nullifiers, reviews, salaries
```

**The one allowed cross-domain reference:** `company_id` (cuid2, text) flows from `anon/` into `jobs/companies.id` — stored as a plain value, **never declared as a FK**.

### auth/ domain

Managed by better-auth — do not hand-edit. Regenerate with:
```bash
DATABASE_URL="..." pnpm dlx auth@latest generate \
  --config ./packages/auth/src/auth.ts \
  --output ./packages/db/src/schema/auth/index.ts --yes
```

Tables: `user`, `session`, `account`, `verification`, `organization`, `member`, `invitation`

### jobs/ domain

| Table | Key columns |
|---|---|
| `companies` | id (cuid2), organization_id (FK→org), name, slug, verified |
| `jobs` | id, company_id (FK), title, employment_type, status, salary_min/max |
| `applications` | id, job_id (FK), user_id (FK), status — UNIQUE(job_id, user_id) |

### anon/ domain

No FKs to any other domain. Built in Phase 3.

| Table | Key columns |
|---|---|
| `merkle_trees` | id, company_id (no FK), root (hex), leaf_count |
| `merkle_leaves` | id, tree_id (FK→trees), commitment (hex), leaf_index |
| `nullifier_set` | nullifier_hash (PK), scope (review/salary), company_id. **Never deleted.** |
| `anonymous_reviews` | id, company_id, nullifier_hash (FK→nullifier_set), rating, role_title, pros, cons |
| `anonymous_salaries` | id, company_id, nullifier_hash (FK→nullifier_set), base_salary, total_comp, level |

---

## Key Decisions

| Decision | Choice | Why |
|---|---|---|
| Primary keys | cuid2 (`text`, JS-generated) | URL-safe, no sequential guessing, works offline |
| OTP storage | better-auth `verification` table | No separate table needed, no `workEmail` stored |
| Auth schema | better-auth generated | Keeps auth tables in sync with library; do not hand-edit |
| ZKP proving | Off-chain Semaphore, snarkjs in browser | No blockchain, no gas, sub-3s proof generation target |
| Merkle trees | Per-company | Isolates membership sets; nullifiers are also per-company |
| svc-verify | Internal Hono service, HMAC-secured | Never exposed publicly; single writer for tree integrity |
| Neon (prod) | `neon-serverless` WebSocket adapter | Required for transaction support in serverless environments |

---

## svc-verify API (internal)

All routes are HMAC-secured. Never exposed publicly.

| Method | Path | Purpose |
|---|---|---|
| POST | `/enroll` | Insert commitment as Merkle leaf, return new root + leafIndex |
| POST | `/verify-proof` | Nullifier check + snarkjs groth16.verify |
| GET | `/merkle-root/:companyId` | Current root + leafCount for client proof generation |
| GET | `/merkle-proof/:companyId/:leafIndex` | Siblings + pathIndices for client proof generation |
| GET | `/health` | Health check |

---

## Build Phases

| Phase | Deliverable |
|---|---|
| 1 | Scaffold, auth, employer org creation |
| 2 | Job board (listings, apply, ATS) |
| 3 | ZKP spike + svc-verify |
| 4 | Anonymous reviews |
| 5 | Salary data |
| 6 | Launch prep (rate limiting, CSP, logging, Neon) |
