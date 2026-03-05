# Security Testing Matrix

## Module 1: Authentication (Login/Signup API)

**File:** `server/routes/authRoutes.js`

| #   | Security Risk                   | Description                                                                                       | Potential Impact                                                                          |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | **JWT Token Expiration**        | Tokens expire in 1 hour with no refresh token mechanism. Long sessions require re-authentication. | Token leakage allows access for up to 1 hour; no way to invalidate tokens remotely        |
| 2   | **OTP via Email (Unencrypted)** | OTP is sent via plain email. No encryption or secondary factor.                                   | Man-in-the-middle could intercept OTP; email account compromise leads to account takeover |
| 3   | **Account Lockout DoS**         | After 5 failed attempts, account locks for 5 minutes. No alternative recovery method.             | Attacker can lock out legitimate users by attempting wrong passwords                      |

---

## Module 2: Attendance API Endpoint

**File:** `server/routes/attendanceRoutes.js`

| #   | Security Risk                   | Description                                                                        | Potential Impact                                                             |
| --- | ------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | **Client-Controlled Date**      | The `date` parameter comes from the client without validation against server time. | Users can clock in/out for past or future dates by manipulating the request  |
| 2   | **Unvalidated Blockchain Hash** | `blockchainTxHash` is accepted without validation of format or existence.          | Arbitrary string injection; potential storage of malicious data              |
| 3   | **Server Time Manipulation**    | Uses `Math.floor(Date.now() / 1000)` - relies on server system clock.              | If server clock is compromised, attendance records have incorrect timestamps |

---

## Module 3: Data Input Form (Signup Form)

**File:** `client/app/signup/page.tsx`

| #   | Security Risk                   | Description                                                                                          | Potential Impact                                                    |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | **Client-Side Only Validation** | Password validation happens only in browser. Can be bypassed by disabling JS or direct API calls.    | Weak passwords can be submitted, bypassing strength requirements    |
| 2   | **Information Disclosure**      | Error messages reveal "Username or email already exists" - helps attackers enumerate valid accounts. | Account enumeration attack; attackers can identify registered users |
| 3   | **No Rate Limiting on Client**  | Form has no client-side rate limiting. Double-click prevention exists but easily bypassed.           | Brute force attacks on registration endpoint; spam account creation |

---

## Summary

The security testing matrix identifies **9 potential security risks** across 3 key modules:

1. **Authentication Module** - 3 risks related to JWT, OTP, and account lockout
2. **Attendance API Module** - 3 risks related to date manipulation, blockchain hash validation, and server time
3. **Signup Form Module** - 3 risks related to client-side validation, information disclosure, and rate limiting

Each risk can be further tested with specific security testing techniques like penetration testing, code review, and automated vulnerability scanning.
