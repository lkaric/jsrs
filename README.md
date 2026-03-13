# JSRS — Anonymous Tech Reviews + Job Board

A Glassdoor alternative for the tech industry with **cryptographic anonymity guarantees** using Zero-Knowledge Proofs. Employees verify their employment via work email and submit anonymous reviews and salary data that cannot be linked back to them — not even by the platform operator.

[![CI](https://github.com/lkaric/jsrs/actions/workflows/ci.yml/badge.svg)](https://github.com/lkaric/jsrs/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Full-stack app | TanStack Start (SSR + server functions) |
| Auth | better-auth (Organizations plugin) |
| ORM | Drizzle ORM |
| DB | PostgreSQL |
| ZKP | Semaphore (off-chain) + snarkjs |
| UI | shadcn/ui + Tailwind CSS v4 |
| Email | Resend |

## Quick Start

### Prerequisites
- Node.js >= 22
- pnpm >= 9
- Docker + Docker Compose

### Setup

```bash
git clone https://github.com/your-org/jsrs
cd jsrs
pnpm install
cp .env.example .env.local
# Edit .env.local with your secrets
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm dev
```

The web app runs at `http://localhost:3000` and svc-verify at `http://localhost:3001`.

## How Anonymity Works

1. **Enrollment**: User verifies work email → browser generates a cryptographic identity secret → commitment (hash of secret) is added to a company-specific Merkle tree → email mapping is immediately deleted
2. **Review Submission**: Browser generates a Zero-Knowledge Proof proving membership in the company's Merkle tree without revealing which leaf → server verifies proof via svc-verify → review is stored with no link to user identity
3. **Double-Submit Prevention**: Nullifier hashes (derived from identity secret + scope) prevent the same identity from submitting twice per company per scope

See [docs/zkp-system.md](./docs/zkp-system.md) for a detailed explanation.

## Project Structure

```
apps/
  web/          # TanStack Start app (SSR + server functions)
  svc-verify/   # Internal Hono service for ZKP verification
packages/
  db/           # Drizzle schema + migrations
  auth/         # better-auth configuration
  ui/           # shadcn/ui components
  types/        # Shared TypeScript types
  zkp-core/     # ZKP utilities (commitment, nullifier, proof, merkle)
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT — see [LICENSE](./LICENSE)
