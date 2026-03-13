# Contributing to JSRS

Thank you for your interest in contributing! This document covers the development workflow.

## Development Setup

Follow the [Quick Start](./README.md#quick-start) in the README.

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/description` | `feat/salary-aggregation` |
| Bug fix | `fix/description` | `fix/nullifier-check` |
| Chore | `chore/description` | `chore/update-deps` |
| Docs | `docs/description` | `docs/zkp-enrollment-flow` |

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/). Enforced by commitlint.

**Format**: `type(optional-scope): description`

**Types**: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `ci`, `perf`, `revert`

**Examples**:
```
feat(reviews): add ZKP proof generation web worker
fix(svc-verify): handle merkle root staleness window
docs(zkp): explain nullifier scoping
```

## Pull Requests

- Target `main` branch
- PR title must follow Conventional Commits format (enforced)
- Squash merge only

## Code Style

- **Biome** handles linting + formatting (runs automatically on commit via Lefthook)
- `strict: true` TypeScript — no `any` in application code
- Run manually: `pnpm lint:fix`

## ZKP Changes

If modifying anything in `packages/zkp-core/` or `apps/svc-verify/`:

1. Read [docs/contributing-zkp.md](./docs/contributing-zkp.md) first
2. Never change Poseidon hash input order without updating all three sites: browser WASM, svc-verify Node, circuit constraints
3. Pin wasm/zkey/package versions together — a mismatch silently breaks proof verification
4. Add test vectors for any hash computation change

## Testing

```bash
pnpm test           # all tests via Turborepo
pnpm typecheck      # TypeScript strict check across all workspaces
```
