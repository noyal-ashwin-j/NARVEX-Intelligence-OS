# NARVEX — Zero-Trust Security Architecture

## 1. Architectural Overview
NARVEX implements a defense-in-depth security model protecting state-level narcotic intelligence across 7 sequential security boundaries:

```text
1. BROWSER CLIENT (TLSv1.3, Content Security Policy, Nonce-based scripts)
      ↓
2. API GATEWAY / REVERSE PROXY (Rate limiting, CORS whitelist, Helmet security headers)
      ↓
3. AUTHENTICATION (Bcrypt hashing, JWT with 12h expiry, Cryptographic Session Registry)
      ↓
4. AUTHORIZATION POLICY ENGINE (ABAC/RBAC, Zero-Trust District Scoping Gate)
      ↓
5. INTELLIGENCE SERVICE BUS (Parameterized SQL queries, PII redaction engine)
      ↓
6. DATA PERSISTENCE (MySQL row-level isolation, AES-256 field encryption)
      ↓
7. CRYPTOGRAPHIC PROVENANCE (SHA-256 tamper-evident hash chain ledger)
```

---

## 2. Authentication & Session Security
- **JWT Signing**: Signed with SHA-256 HMAC and isolated runtime secret (`JWT_SECRET`).
- **Session Registry (`user_sessions`)**: Every login generates a unique cryptographically hashed session (`SESS-...`).
- **Emergency Kill-Switch**: State Admins can revoke individual sessions or trigger `revokeAllSessionsForUser(userId)`.
- **Brute-Force Shield**: Failed login attempts are intercepted and recorded in `security_events` with IP logging.

---

## 3. Zero-Trust District Isolation
- **State Administrator (`STATE_ADMIN`)**: Authorized for complete statewide intelligence across all 38 districts.
- **District Intelligence Officer (`DISTRICT_OFFICER`)**: Strictly scoped to assigned `district_id`. Any cross-district API request, parameter manipulation, or voice probe is blocked with `403 Forbidden` and logged to SIEM.
- **Verification Officer (`VERIFICATION_OFFICER`)**: Scoped to triage and citizen queues.
- **Citizen Reporter (`CITIZEN_REPORTER`)**: Restricted strictly to public tracking and anonymous tip intake.

---

## 4. AI & Central Agent Security Envelope
- All voice/text commands pass through the `processAgentIntent` security gate.
- Privileged operations (e.g. statewide briefing export, model retraining) require explicit role authorization.
- AI Model artifacts (`narvex_forecast_model.json`) are validated via SHA-256 fingerprint matching before loading into memory.
