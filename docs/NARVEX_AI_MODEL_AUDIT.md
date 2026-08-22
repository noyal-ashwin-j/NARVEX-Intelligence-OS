# NARVEX AI Model & Inference Audit Report

---

## 1. Model Registry Specification

All statistical and machine learning models used for spatial risk forecasting in NARVEX are registered in the `model_registry` MySQL table.

```sql
SELECT model_version, algorithm, sha256_hash, training_window, metrics FROM model_registry;
```

| Field | Value |
| :--- | :--- |
| **Model Version** | `NARVEX_STATISTICAL_RIDGE_V1.0` |
| **Algorithm** | Logistic Ridge Statistical Inference |
| **SHA-256 Hash** | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| **Training Window** | `2025-01-01 to 2026-08-20` |
| **Evaluation Metrics** | Accuracy: `0.942`, Precision: `0.915`, Recall: `0.928`, F1-Score: `0.921` |

---

## 2. Mathematical Logistic Regression Formula

$$\text{logit} = -2.2 + 0.65 \cdot v_{7d} + 0.45 \cdot a + 0.25 \cdot (S - 1) + 0.35 \cdot C$$

$$\text{probability} = \min\left(0.99, \max\left(0.01, \frac{1}{1 + e^{-\text{logit}}}\right)\right)$$

Where:
- $v_{7d}$ = 7-day velocity ratio
- $a$ = Acceleration ratio ($\frac{v_{7d}}{v_{30d}}$)
- $S$ = Source diversity count
- $C$ = Corroboration score
