# NARVEX Feature Engineering & Intelligence Engine

This document details how raw database observations are mathematically transformed into feature matrices and intelligence indicators.

---

## 📐 Calculated Mathematical Features

1. **Velocity Metrics**:
   - `velocity_7d = count_7d / 7.0`
   - `velocity_30d = count_30d / 30.0`
   - `velocity_90d = count_90d / 90.0`
2. **Acceleration Ratio**:
   - `acceleration = velocity_30d > 0 ? (velocity_7d / velocity_30d) : 0.0`
3. **Source Diversity**:
   - Count of distinct reporting source categories in that jurisdiction.
4. **Corroboration Score**:
   - Ratio of multi-agency corroborated events.
5. **Coverage Metric**:
   - Data completeness score (`1.00` if >10 observations, lower for sparse locations).
