# JSRS — Claude Code Configuration

## Project

JSRS is a Glassdoor alternative with cryptographic anonymity via Zero-Knowledge Proofs.

- Architecture, domain model, key decisions → [docs/architecture.md](../docs/architecture.md)
- ZKP system → [docs/zkp-system.md](../docs/zkp-system.md)
- Dev commands → [docs/development.md](../docs/development.md)
- Commit/branch conventions → [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## GitHub-Driven Workflow

**Every piece of work follows this flow — no exceptions.**

```
milestone (phase) → issue (task) → branch → PR → squash merge
```

### Commands

```bash
# Milestones use the API (gh milestone create does not exist)
gh api repos/lkaric/jsrs/milestones --method POST -f title="..." -f description="..."

# Issues
gh issue create --repo lkaric/jsrs --title "..." --milestone "Phase N — ..." --body "..."
gh issue create --repo lkaric/jsrs --title "..." --label "bug" --body "..."

# PRs
gh pr create --repo lkaric/jsrs --title "..." --base main --head feat/... --body "..."

# Rebase after upstream merge
git fetch origin && git rebase origin/main && git push --force-with-lease origin <branch>
```

### Milestones

| # | Milestone |
|---|---|
| 1 | Phase 1 — Scaffold & Auth |
| 2 | Phase 2 — Job Board |
| 3 | Phase 3 — ZKP Spike + svc-verify |
| 4 | Phase 4 — Anonymous Reviews |
| 5 | Phase 5 — Salary Data |
| 6 | Phase 6 — Launch Prep |

---

## Domain Boundaries

Three schema domains — **FKs never cross boundaries.**

```
packages/db/src/schema/
  auth/   ← better-auth managed (do not hand-edit)
  jobs/   ← companies, jobs, applications
  anon/   ← ZKP: merkle trees, nullifiers, reviews, salaries (Phase 3)
```

`company_id` flows from `anon/` → `jobs/` as a plain value only — never a FK.

---

## Key Decisions

- `SVC_VERIFY_URL` / `SVC_VERIFY_HMAC_SECRET` are **not needed** — `svc-verify` is accessed exclusively via Cloudflare Service Binding (`env.SVC_VERIFY.fetch()`). No HTTP transport between apps; no URL or HMAC secret to manage.

---

## Things to Never Do

- Never hand-edit `packages/db/src/schema/auth/` — regenerate with `auth@latest generate`
- Never add a FK from `anon/` to `auth/` or `jobs/`
- Never store work emails — OTP uses better-auth `verification` table + `emailDomain` only
- Never bundle snarkjs statically — always dynamic `import()`
- Never write raw SQL — use Drizzle schema + migrations
- Never skip the issue → branch → PR flow
- Never commit directly to `main`
- Never enforce gitmoji via commitlint — it is optional (see CONTRIBUTING.md)
