# 🤝 Contributing to JSRS

## 🚀 Setup

See [docs/development.md](./docs/development.md) for the full local setup guide.

## 🌿 Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/description` | `feat/salary-aggregation` |
| Bug fix | `fix/description` | `fix/nullifier-check` |
| Chore | `chore/description` | `chore/update-deps` |
| Docs | `docs/description` | `docs/zkp-enrollment-flow` |

## 📝 Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/). Enforced by commitlint.

**Format:** `type(optional-scope): description`

**Types:** `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `ci`, `perf`, `revert`

### Gitmoji (optional but encouraged ✨)

Prefix your commit with an emoji for extra clarity — not enforced, just fun.

| Emoji | Type | When to use |
|---|---|---|
| ✨ | `feat` | New feature |
| 🐛 | `fix` | Bug fix |
| 📝 | `docs` | Documentation |
| 🎨 | `style` | Formatting, no logic change |
| ♻️ | `refactor` | Refactor without feature/fix |
| 🧪 | `test` | Tests |
| 👷 | `ci` | CI/CD changes |
| 🔧 | `chore` | Build, deps, tooling |
| ⚡️ | `perf` | Performance |
| ⏪ | `revert` | Revert a commit |
| 🔒 | `fix` | Security fix |
| 🗄️ | `feat` | Database schema |
| 🔐 | `feat` | Auth / ZKP |

**Examples:**
```
✨ feat(reviews): add ZKP proof generation web worker
🐛 fix(svc-verify): handle merkle root staleness window
feat(reviews): add ZKP proof generation web worker   ← also valid
```

## 🔀 Pull Requests

- Target `main`
- PR title must follow Conventional Commits format
- Squash merge only

## 🎨 Code Style

Biome handles linting + formatting automatically on commit (Lefthook pre-commit hook).

```bash
pnpm lint:fix     # run manually
pnpm typecheck    # TypeScript strict check
```

No `any` in application code. `strict: true` is enforced.

## 🔒 ZKP Changes

Before modifying anything in `packages/zkp-core/` or `apps/svc-verify/`, read [docs/contributing-zkp.md](./docs/contributing-zkp.md).

TL;DR: hash input order must be identical across browser WASM, svc-verify Node, and circuit constraints. A mismatch silently breaks proof verification.
