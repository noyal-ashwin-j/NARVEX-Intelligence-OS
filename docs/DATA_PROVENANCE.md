# NARVEX — Data Provenance & Lineage Architecture

## 1. Zero-Trust Provenance Standard
Every intelligence event, risk zone calculation, and forecasting score in NARVEX answers the fundamental operational question:
> **"Why is this information here?"**

---

## 2. Lineage Chain Architecture

```text
1. RAW SOURCE OBSERVATION (CSV / FIR / Police Report / Citizen Tip / Seizure)
      ↓
2. INGESTION BATCH & CONTENT HASH (SHA-256 payload hash stored in event_provenance)
      ↓
3. VALIDATION & SANITIZATION (PII stripped, geographic coordinates validated)
      ↓
4. NORMALIZED MYSQL RECORD (intelligence_events, citizen_reports)
      ↓
5. FEATURE EXTRACTION (7D/30D velocity, acceleration, volume, checkpost count)
      ↓
6. ML FORECAST & RISK INFERENCE (Logistic regression weights with temperature scaling)
      ↓
7. IMMUTABLE CRYPTOGRAPHIC LEDGER (Recorded in audit_hash_chain with sequential blocks)
      ↓
8. COMMAND CENTER MAP VISUALIZATION & DOSSIER EXPORT
```
