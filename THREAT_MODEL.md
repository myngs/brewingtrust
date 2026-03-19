# Trust Brew - Threat Model (STRIDE)

## System Overview

**Components**: Next.js Frontend + Express/MongoDB Backend + Ganache Blockchain + JSON Off-chain Storage
**Data Flow**: Employee → API → JSON Hash → Ethereum → MongoDB Reference

## STRIDE Threats Analysis

### S - Spoofing (Authentication)

| Threat                | Risk   | Mitigation                                |
| --------------------- | ------ | ----------------------------------------- |
| Impersonate employee  | High   | JWT + roleMiddleware.js ✅                |
| API token leak        | Medium | 1hr expiry, httpOnly cookies recommended  |
| Employee wallet spoof | Low    | Server wallet fallback, hash verification |

### T - Tampering (Integrity)

| Threat                  | Risk         | Mitigation                               |
| ----------------------- | ------------ | ---------------------------------------- |
| JSON tampering          | **CRITICAL** | SHA256 hash + blockchain verification ✅ |
| MongoDB record edit     | High         | recordHash prevents undetected changes   |
| Clock time manipulation | Medium       | Server `Date.now()`, validate ranges     |

### R - Repudiation (Non-repudiation)

| Threat               | Risk | Mitigation                     |
| -------------------- | ---- | ------------------------------ |
| "I didn't clock in"  | Low  | Ethereum txHash + timestamp ✅ |
| Admin deletes record | Low  | JSON backup persists           |

### I - Information Disclosure

| Threat               | Risk   | Mitigation                |
| -------------------- | ------ | ------------------------- |
| Employee data leak   | Medium | maskSensitiveData() ✅    |
| PRIVATE_KEY exposure | High   | .env only, no repo commit |
| MongoDB dump         | High   | Connection string secrets |

### D - Denial of Service

| Threat           | Risk   | Mitigation                      |
| ---------------- | ------ | ------------------------------- |
| Gas exhaustion   | Low    | Fixed gasLimit: 500k ✅         |
| Mongo flood      | Medium | Rate limiting needed            |
| JSON write flood | Medium | File locking in offChainStorage |

### E - Elevation of Privilege

| Threat               | Risk | Mitigation               |
| -------------------- | ---- | ------------------------ |
| Employee → Admin     | Low  | roleMiddleware.js ✅     |
| Admin → Owner wallet | High | Separate deployer wallet |

## Gas Cost Analysis (Current: 52k/record)

```
Mapping write: 20k SSTORE
Event emit:  8k LOG
Params:     12k CALC
Overhead:   12k
```

**Optimization**: Batch API endpoint (-25k/record)

## Attack Surface Reduction Checklist

- [x] Hash-only blockchain storage
- [x] Role separation
- [x] Input sanitization (test-security.js)
- [ ] Rate limiting (express-rate-limit)
- [ ] HTTPS reverse proxy (nginx)
- [ ] Audit logging middleware
