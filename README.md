# JSRS — Anonymous Tech Reviews + Job Board 🔏

A Glassdoor alternative for the tech industry with **cryptographic anonymity guarantees** using Zero-Knowledge Proofs. Employees verify their employment via work email and submit anonymous reviews and salary data that cannot be linked back to them — not even by the platform operator.

[![CI](https://github.com/lkaric/jsrs/actions/workflows/ci.yml/badge.svg)](https://github.com/lkaric/jsrs/actions/workflows/ci.yml)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](./LICENSE)

## ⚡ Quick Start

**Prerequisites:** Node.js >= 24.13.0, pnpm >= 9, Docker

```bash
git clone https://github.com/lkaric/jsrs
cd jsrs
pnpm install
cp .env.example .env.local   # fill in secrets
docker compose up -d
pnpm db:generate && pnpm db:migrate
pnpm dev
```

Web app at `http://localhost:3000` — svc-verify at `http://localhost:3001`.

For the full setup guide including env vars, troubleshooting, and individual app commands, see [docs/development.md](./docs/development.md).

## 🔒 How Anonymity Works

1. **Enrollment** — Work email verified via OTP → browser generates cryptographic identity secret → commitment added to company Merkle tree → email mapping immediately deleted
2. **Proof generation** — Browser generates a ZKP proving Merkle membership without revealing which leaf
3. **Submission** — Server verifies proof via svc-verify → review stored with zero link to user identity

See [docs/zkp-system.md](./docs/zkp-system.md) for a full explanation.

## 📁 Project Structure

```
apps/
  web/          # TanStack Start — public site + employer dashboard
  svc-verify/   # Internal Hono service for ZKP verification
packages/
  db/           # Drizzle schema + migrations
  auth/         # better-auth configuration
  ui/           # shadcn/ui components
  types/        # Shared TypeScript types
  zkp-core/     # ZKP utilities (commitment, nullifier, proof, Merkle)
```

See [docs/architecture.md](./docs/architecture.md) for tech stack, domain model, and key decisions.

## 📚 Docs

| Document | What's in it |
|---|---|
| [docs/architecture.md](./docs/architecture.md) | Tech stack, schema domains, key decisions |
| [docs/development.md](./docs/development.md) | Full dev setup, commands, env vars |
| [docs/zkp-system.md](./docs/zkp-system.md) | ZKP concepts, enrollment + proof flows |
| [docs/contributing-zkp.md](./docs/contributing-zkp.md) | How to safely modify ZKP code |

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📄 License

GPL-3.0-or-later — see [LICENSE](./LICENSE)
