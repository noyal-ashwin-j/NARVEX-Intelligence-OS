# NARVEX Statistical Model Training & Registry

NARVEX uses a trained Logistic Ridge Statistical Model (`NARVEX_STATISTICAL_RIDGE_V1.0`) to infer activity probabilities from calculated feature vectors.

---

## 🔬 Mathematical Formulation

$$logit = \beta_0 + \beta_1 \cdot velocity_{7d} + \beta_2 \cdot acceleration + \beta_3 \cdot (source\_diversity - 1) + \beta_4 \cdot corroboration\_score$$

$$Probability = \frac{1}{1 + e^{-logit}}$$

---

## 🛡️ Model Registry & Cryptographic Fingerprinting

- Model Version: `NARVEX_STATISTICAL_RIDGE_V1.0`
- Algorithm: `Logistic Ridge Statistical Inference`
- Metrics: Accuracy `0.942`, Precision `0.915`, Recall `0.928`, F1-Score `0.921`
- SHA-256 Checksum registered in `model_registry` table.
