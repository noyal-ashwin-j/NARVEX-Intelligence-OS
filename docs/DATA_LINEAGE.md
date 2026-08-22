# NARVEX Data Lineage & Provenance Specification

Every intelligence output on the NARVEX platform is 100% traceable back to underlying raw observations, document extractions, and source records.

---

## 🔗 Evidence Traceability Chain ("Why am I seeing this?")

```
[ FRONTEND UI FORECAST CARD ]
          │
          ▼ (queries /api/forecasts?district_id=X)
[ FORECAST_RECORDS TABLE ]  <--- (model_version: NARVEX_STATISTICAL_RIDGE_V1.0)
          │
          ▼ (references district_id & calculated_at)
[ MODEL_FEATURES MATRIX ]  <--- (velocity_7d, velocity_30d, acceleration, source_diversity)
          │
          ▼ (queries event_provenance JOIN complaints JOIN police_obs)
[ RAW OBSERVATION TABLES ]  <--- (complaint_ref, obs_ref, seizure_ref, checkpost_ref)
          │
          ▼ (references document_id & sha256_hash)
[ DOCUMENTS & OCR EXTRACTIONS ]
          │
          ▼ (references source_id & reliability_score)
[ SOURCE REGISTRY & AUDIT LOG ]
```

---

## 🛡️ Auditability Guarantees

1. **No Orphan Intelligence**: Every probability score, emerging signal, or spatial corridor line must link back to one or more rows in `event_provenance`.
2. **Cryptographic SHA-256 Hashing**: Document files receive SHA-256 checksums (`documents.sha256_hash`), and model artifacts are registered in `model_registry` with immutable SHA-256 signatures.
3. **Immutable Audit Chain**: System mutations produce blocks appended to `audit_hash_chain`.
