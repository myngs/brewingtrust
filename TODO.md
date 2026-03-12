# Blockchain Attendance System Implementation

## Task: Implement professor-required blockchain attendance system with off-chain storage

### Implementation Steps:

- [x] 1. Update Solidity Smart Contract - Store only attendance record hashes/references
- [x] 2. Create Off-Chain Storage Module - JSON-based file storage for attendance data
- [x] 3. Update MongoDB Attendance Schema - Store only metadata/references
- [x] 4. Update Attendance Routes - Integrate off-chain storage and blockchain
- [x] 5. Add Web3.js utilities for Ganache integration
- [x] 6. Create deployment scripts and configuration files

### Architecture Overview:

```
Employee Clock In/Out
    -> Off-chain storage (JSON file)
    -> Generate hash
    -> Store hash on blockchain
    -> Store hash reference in MongoDB
```

### Data Flow:

1. Employee performs clock-in/clock-out
2. System stores attendance data off-chain (JSON)
3. SHA-256 hash generated for the record
4. Smart contract stores the hash reference
5. MongoDB stores metadata + hash reference

### Files Created/Modified:

#### Blockchain (blockchain/):

- `contracts/Attendance.sol` - Updated smart contract storing only hashes
- `package.json` - Added compile/deploy scripts
- `.env.example` - Example environment configuration

#### Server (server/):

- `models/Attendance.js` - Updated schema (stores only references)
- `routes/attendanceRoutes.js` - Updated routes with new data flow
- `utils/offChainStorage.js` - New off-chain JSON storage module
- `utils/blockchain.js` - New Web3.js/Ethers blockchain utilities
- `package.json` - Added ethers dependency
- `.env.example` - Example environment configuration

#### Client (client/):

- `app/blockchain/contract.ts` - Updated ABI to match new contract

### How to Run:

1. Start Ganache:

   ```
   ganache-cli
   # or use Ganache GUI
   ```

2. Deploy the smart contract:

   ```
   cd blockchain
   npm install
   npx hardhat compile
   npx hardhat run scripts/deploy.ts --network ganache
   ```

3. Copy the deployed contract address to server/.env

4. Start the server:

   ```
   cd server
   npm install
   npm start
   ```

5. The system will now:
   - Store attendance data in JSON files (off-chain)
   - Store hash references on blockchain
   - Store metadata in MongoDB

### Progress:

Status: COMPLETED
Last Updated: Implementation Complete

---

# Module 11 (Prototype Sprint 2) -- Filled Using Current Blockchain Features

This section fills the PDF template (\"Prototype Sprint 2 - Feature Expansion and Integration\") based on what's implemented right now in this repo (smart contract + blockchain utilities + off-chain JSON storage).

## SESSION 1: Feature Expansion

| Item Category (head)<br>New Feature: What will you add?<br>Integration: API/Tool/Service<br>Success Criteria: How do we know it works?<br>Risk and Fixes: Potential issues? | Description Details (head) |
|---|---|
| (Template - leave blank) | Implemented an attendance integrity flow that stores the full attendance record off-chain (JSON) and anchors only its SHA-256 hash on-chain using a Solidity contract.<br><br>Integration in this repo: `server/utils/offChainStorage.js` generates/stores the record + hash, `blockchain/contracts/Attendance.sol` stores a `bytes32` hash per date, `server/utils/blockchain.js` sends transactions/reads state, and `server/models/Attendance.js` keeps MongoDB as reference-only (`recordHash`, `blockchainTxHash`, status).<br><br>Success criteria: hashes are consistently generated, stored, and verifiable; `storeAttendanceRecord()` mines and `verifyRecordHash()` returns true for the correct hash; MongoDB contains no raw clock-in/out timestamps.<br><br>Risks & fixes: blockchain/RPC/contract misconfig and tx failures (fix with stricter `.env` validation + health checks); off-chain file corruption/concurrency (fix with atomic writes/locking); signer/address mismatch for per-user verification (fix by aligning who signs/stores vs who verifies). |

**Important current limitation (as implemented):** `Attendance.sol` stores records under `msg.sender`. The backend signs transactions using the server wallet (`PRIVATE_KEY`), so on-chain hashes are anchored under the server wallet unless you change the design to have users sign with their own wallets (or change the contract to accept a `user` address and authorize it). This affects per-user `blockchainVerified` results.

## SESSION 2: Implementation Testing

| Test Case | Before State | After State | Improvement Type |
|---|---|---|---|
| Store hash on-chain (contract) | No hash stored for the given `date`. | Calling `storeAttendanceRecord(date, recordHash)` stores/updates the `bytes32` hash and emits store/update events. | Smart contract capability |
| Verify stored hash (blockchain) | No reliable way to confirm if a hash matches what is anchored on-chain. | Calling `verifyRecordHash(user, date, recordHash)` returns `true` for the correct hash and `false` for a different hash. | Integrity verification |

## REFLECTION (Individual)

- What feature integration did you add? Off-chain JSON storage + SHA-256 hashing integrated with a Solidity smart contract that anchors hashes on-chain, with MongoDB storing only references.
- Did it work on all test cases? Off-chain + MongoDB works; blockchain anchoring works when Ganache + contract + server private key are configured. Per-user verification depends on consistent signer/address design (see limitation note above).
- What was your biggest challenge? Coordinating 3 layers (JSON off-chain, MongoDB references, blockchain tx) while following \"no raw attendance data in DB\" and still supporting retrieval + verification.
- What feature would you add next in Sprint 3? User-signed transactions (MetaMask) for true per-user anchoring, plus a background re-anchor worker for failed blockchain writes and a stronger integrity check that recomputes hashes from off-chain records.

---

# Module 12 (Evaluation Sprint) -- Performance and Security Testing

This section fills the PDF template (\"Evaluation Sprint - Performance and Security Testing\") based on the current implementation and the repo's testing artifacts (`test-security.js`, `SECURITY_TESTING_MATRIX.md`).

## SESSION 1: Performance Test Pack

| Test Case | Steps | Expected | Actual | Pass/Fail | Note |
|---|---|---|---|---|---|
| Normal Input (Attendance clock-in) | Send `POST /api/attendance/clock-in` with a valid JWT + a normal `date` (8 digits, e.g. `20260311`). | Returns 200; off-chain record created; `recordHash` returned; blockchain tx attempted and `blockchainTxHash` returned if successful. | Code path: `attendanceRoutes.js` validates `date` exists, stores JSON off-chain + SHA-256 hash, then calls blockchain store (best-effort), then saves MongoDB reference. | PASS (by implementation) | This is primarily a functional/perf sanity test (no load test numbers captured). |
| Long Input (Oversized `date`) | Send `POST /api/attendance/clock-in` with a very long `date` string (hundreds/thousands of chars). | Should be rejected with 400 (invalid format/length) without heavy processing. | Current code only checks `date` exists (not format/length). Large `date` may bloat JSON/hash work and can break precision when `parseInt(date)` is used for blockchain calls. | FAIL (needs validation) | Add strict `date` validation (exactly 8 digits) and reject early. Consider using `BigInt`/strings consistently for uint256 handling. |
| Empty Input (Missing `date`) | Send `POST /api/attendance/clock-in` without `date`. | Returns 400 with \"Date is required\". | Implemented: early return `res.status(400).json({ message: \"Date is required\" })`. | PASS (by implementation) | Confirms endpoint fails fast on missing required input. |

## SESSION 2: Security Test Pack

| Test Case | Steps | Expected | Actual | Pass/Fail | Note |
|---|---|---|---|---|---|
| Authorization | Call a protected endpoint without a JWT (e.g. `GET /api/auth/users` or `GET /api/attendance/all`). | Returns 401 Unauthorized (and 403 if role is wrong). | Implemented via `authMiddleware` + `roleMiddleware` on protected routes. | PASS (by implementation) | Confirms RBAC is enforced for admin/employee routes. |
| Invalid Input | Attempt XSS/invalid fields on signup (e.g. username `<script>alert(1)</script>`, weak password). | Input is sanitized; invalid format rejected with 400. | Implemented in `authRoutes.js` using `sanitize-html` + regex validation patterns. | PASS (by implementation) | See `test-security.js` for sample invalid-input checks. |
| Data Exposure | Fetch admin/attendance listings and confirm sensitive fields are not leaked. | Password/OTP not returned; PII is masked in attendance list responses. | Implemented: `GET /api/auth/users` excludes `password`, `otp`, `otpExpires`; attendance list routes apply `maskSensitiveData()` before responding. | PASS (by implementation) | Confirms output-masking and field exclusion are applied server-side. |

## REFLECTION (Individual)

- Our most surprising test result was the Long Input (oversized `date`) case, because it highlights missing server-side format/length validation and potential numeric precision issues in blockchain calls (`parseInt(date)`).
- Why we think it happened: the route currently validates presence of `date` but not the schema (8-digit `YYYYMMDD`), so invalid/oversized values can reach hashing, file storage, and blockchain conversion logic.
- One change we'll try next sprint: add strict request validation for `date` (exactly 8 digits), reject early, and standardize uint256 handling (use `BigInt` or pass strings to ethers) to avoid precision bugs.
