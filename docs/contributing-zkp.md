# 🧪 Contributing to ZKP Code

The ZKP system is the core privacy guarantee of JSRS. Changes here require extra care — a subtle mismatch silently breaks proof verification or, worse, breaks anonymity.

Read [zkp-system.md](./zkp-system.md) first to understand the system before touching any of this code.

---

## The Three Sites Rule

The Poseidon hash inputs must be **identical** across all three places:

| Site | Location |
|---|---|
| Browser WASM (proof gen) | `packages/zkp-core/src/commitment.ts` + Web Worker |
| svc-verify (Node, proof verify) | `apps/svc-verify/src/services/proof.service.ts` |
| Circuit constraints | `packages/zkp-core/src/circuits/` (semaphore.wasm + .zkey) |

**If you change hash input order in one place, you must change it in all three.** A mismatch produces a proof that always fails — no error, just silent rejection.

---

## Version Pinning

The circuit artifacts, snarkjs, and `@semaphore-protocol/*` packages must be pinned at **exact matching versions**. Do not upgrade one without upgrading all.

When upgrading:
1. Download new `semaphore.wasm` + `semaphore.zkey` matching the target version
2. Update `snarkjs` and `@semaphore-protocol/*` in `packages/zkp-core/package.json`
3. Re-run test vectors (see below) before opening a PR
4. Document the version bump in the PR description

---

## Test Vectors

Any change to hash computation (commitment, nullifier, signal) must include test vectors:

```typescript
// packages/zkp-core/src/__tests__/commitment.test.ts
it('produces known commitment for known secret', () => {
  const secret = BigInt('0x1234...'); // fixed test input
  expect(commitment(secret)).toBe('0xabcd...'); // pre-computed expected output
});
```

Test vectors pin the expected output for known inputs. If a refactor accidentally changes the hash output, the test vector fails loudly.

---

## snarkjs Bundle Size

snarkjs WASM is ~5MB. It must **never** be imported statically:

```typescript
// ✅ correct — loaded on demand in Web Worker only
const snarkjs = await import('snarkjs');

// ❌ wrong — inflates main bundle
import snarkjs from 'snarkjs';
```

The Web Worker entry point is the only place snarkjs is allowed to load.

---

## Merkle Tree Integrity

`svc-verify` is the **single writer** for Merkle trees. Never write to `merkle_leaves` or `merkle_trees` directly from the web app. Always go through `svc-verify POST /enroll`.

On startup, svc-verify rebuilds the in-memory tree from the DB. For large trees this can be slow — the service stores serialized snapshots and replays only newer leaves.

---

## Checklist Before Opening a PR

- [ ] Read the Three Sites Rule and verified all three are consistent
- [ ] Test vectors pass
- [ ] snarkjs is loaded via dynamic `import()` only
- [ ] Circuit artifact versions are pinned and match snarkjs
- [ ] `nullifier_set` insert is atomic with the review/salary insert (transaction)
- [ ] No new FK added from `anon/` to `auth/` or `jobs/`
