# NARVEX — AI Model Artifact & Supply Chain Security

## 1. Model Artifact Verification Standard
To protect the intelligence engine against unauthorized substitution, model tampering, and silent bias injection, all predictive ML model weights (`narvex_forecast_model.json`) are cryptographically anchored.

---

## 2. Integrity Verification Workflow

```text
MODEL DEPLOYMENT PIPELINE
          ↓
Compute SHA-256 Digest of Model Artifact
          ↓
Validate Feature Schema & Normalization Vectors
          ↓
Store Record in model_registry_audits
          ↓
Verify Pre-Execution Hash against Approved Registry
          ↓
Valid → Load into Memory / Invalid → Reject & Raise SIEM Alert
```

---

## 3. Supply Chain Integrity & Lineage
Every deployed forecast prediction records:
- `model_version`: Semantic version identifier.
- `model_sha256`: SHA-256 fingerprint of the weights JSON.
- `feature_schema_version`: Array of 5 continuous features ($x_1\dots x_5$).
- `training_timestamp`: Exact ISO timestamp of model fitting.
- `inference_calibration`: Temperature scaling factor ($T = 1.6$) and probability bounds ($[0.15, 0.88]$).
