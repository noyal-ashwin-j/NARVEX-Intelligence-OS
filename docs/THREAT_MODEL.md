# NARVEX — Threat Model & STRIDE Analysis

## 1. Asset Inventory
1. **Raw Observational Records**: Citizen tips, Police FIRs, Checkpost weighbridge scans.
2. **AI & Derived Forecasts**: Predictive risk horizons, emerging zone micro-clusters.
3. **Cryptographic Provenance**: SHA-256 block hash chain audit blocks.
4. **User & Officer Identities**: Badges, contact details, assigned jurisdictions.

---

## 2. STRIDE Threat Assessment & Mitigations

| Threat Class | Potential Attack Vector | Applied Mitigation Strategy |
|---|---|---|
| **Spoofing** | Forged JWT token or fake officer identity | Bcrypt salted passwords + JWT signature verification + active session registry validation. |
| **Tampering** | Modifying historical events or forecast records | Immutable append-only SHA-256 hash chaining (`audit_hash_chain`) + continuous integrity checks. |
| **Repudiation** | Denying an action ticket or data upload | Forensic provenance metadata (`event_provenance`) storing raw payload hashes and actor IDs. |
| **Information Disclosure** | Cross-district intelligence leaks or PII exposure | Zero-trust district scoping (`enforceDistrictScope`) + automated PII redaction (Aadhaar, phone, email). |
| **Denial of Service** | Flooding universal file ingestion with malformed payloads | Request size bounds (10MB limit) + multer memory safeguards + SIEM rate limiting. |
| **Elevation of Privilege** | District officer executing statewide commands via voice agent | Central Agent authorization policy gate + `requirePermission` validation. |
