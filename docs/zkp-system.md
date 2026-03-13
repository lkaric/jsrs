# 🔒 ZKP System

JSRS uses **off-chain Semaphore** (snarkjs + Groth16) to let verified employees submit anonymous reviews and salary data with cryptographic guarantees — no blockchain required.

---

## Core Concepts

### Identity Secret & Commitment

When a user first enrolls for a company:

1. The **browser** generates a random `identitySecret` (256-bit random scalar)
2. The browser computes `commitment = Poseidon(identitySecret)` — a one-way hash
3. The `commitment` is sent to the server and stored as a Merkle leaf
4. The `identitySecret` is stored in **localStorage**, namespaced by `companyId`
5. The email-to-commitment mapping is **deleted immediately** after enrollment — the DB cannot link commitments to users

The commitment proves group membership without revealing who you are.

### Per-Company Merkle Trees

Each company has its own Merkle tree of verified employee commitments. The tree depth is 20 (supports ~1M members).

When a new commitment is enrolled:
- It is inserted as a new leaf
- The Merkle root is updated
- The new root is stored in `merkle_trees`

### Nullifier Hashes

To prevent double-submissions without tracking identity:

```
nullifierHash = Poseidon(Poseidon(identitySecret), Poseidon(companyId, scope))
```

Where `scope` is `"review"` or `"salary"`. This means:
- Each identity can submit **one review** per company
- Each identity can submit **one salary** per company
- Review and salary nullifiers are independent — both can be submitted
- Nullifiers across companies are unlinkable (different `companyId`)

Nullifiers are stored in `nullifier_set` and **never deleted**. A second submission with the same nullifier is rejected.

### Zero-Knowledge Proof

The user generates a ZKP proving:
> *"I know an `identitySecret` such that `Poseidon(identitySecret)` is a leaf in the Merkle tree with root R, and my nullifier for this scope is N"* — **without revealing which leaf**.

The proof is generated in the browser via snarkjs in a **Web Worker** (keeps UI responsive). Target: < 3 seconds.

---

## Enrollment Flow

```
1. Browser generates identitySecret, computes commitment = Poseidon(identitySecret)
   └─ stores { identitySecret, leafIndex } in localStorage[companyId]

2. User submits work email
   └─ server validates email domain → sends OTP via Resend
   └─ OTP stored in better-auth verification table (NOT linked to commitment)

3. User submits OTP
   └─ server verifies OTP → calls svc-verify POST /enroll { commitment, companyId }
   └─ svc-verify inserts leaf, updates Merkle root, returns { root, leafIndex }
   └─ server DELETES the verification record (email domain gone)
   └─ leafIndex returned to browser → stored in localStorage

4. Enrollment complete — no DB record links the user to their commitment
```

---

## Proof Submission Flow

```
1. Browser fetches { root, siblings, pathIndices }
   └─ server function → svc-verify GET /merkle-root/:companyId
   └─ server function → svc-verify GET /merkle-proof/:companyId/:leafIndex

2. Browser computes nullifierHash = Poseidon(Poseidon(secret), Poseidon(companyId, scope))

3. Browser generates ZKP via snarkjs in Web Worker
   └─ inputs: identitySecret, siblings, pathIndices, root, nullifierHash, signal
   └─ circuit: semaphore.wasm + semaphore.zkey (pinned versions in packages/zkp-core)

4. Browser POSTs { proof, publicSignals, nullifierHash, content } to server function

5. Server recomputes signal = hash(content), confirms it matches publicSignals[signalIndex]

6. Server calls svc-verify POST /verify-proof
   └─ nullifier check (not in nullifier_set)
   └─ Merkle root check (in recent root window)
   └─ snarkjs groth16.verify

7. On success: INSERT anonymous_reviews (or anonymous_salaries), return success
```

---

## Root Staleness

New enrollments between the time a user fetches the Merkle proof and submits would invalidate the root. svc-verify accepts a **sliding window of the last N roots** per company so in-flight proofs remain valid.

---

## Security Properties

| Property | How it's achieved |
|---|---|
| Anonymity | ZKP proves membership without revealing leaf index |
| Unlinkability | Poseidon nullifier uses `companyId` — cross-company correlation impossible |
| Double-submit prevention | `nullifier_set` checked atomically before insert |
| No email → review link | `verification` record deleted on enrollment |
| No operator deanonymization | `identitySecret` never leaves the browser |
| snarkjs isolation | Loaded via dynamic `import()` only, never statically bundled |

---

## Circuit Artifacts

The Semaphore circuit artifacts (`semaphore.wasm`, `semaphore.zkey`) live in `packages/zkp-core/src/circuits/` and are **gitignored**. They must be pinned at exact versions matching the snarkjs and `@semaphore-protocol` package versions.

See [contributing-zkp.md](./contributing-zkp.md) before touching anything in `packages/zkp-core/`.
