# NARVEX — Security Incident Response Protocol

## 1. Incident Classification & Severity Levels

- **CRITICAL (P1)**: Cryptographic hash chain broken link, unauthorized model tampering, multi-account credential stuffing.
- **HIGH (P2)**: Repeated cross-district unauthorized probes by district officers, sudden bulk export attempt.
- **MEDIUM (P3)**: Individual failed login burst, suspicious user-agent anomaly.
- **INFO (P4)**: Routine session revocations, password updates.

---

## 2. Containment & Automated Defense Actions

1. **Session Invalidation**: When high-severity anomalies are detected, the security engine triggers immediate session termination via `revokeSession(sessionId)`.
2. **Cryptographic Incident Logging**: All P1 and P2 incidents are written immediately to both `security_events` and the immutable `audit_hash_chain`.
3. **Emergency Lockdown**: State Admins can trigger statewide session termination via the Security Command Center.
