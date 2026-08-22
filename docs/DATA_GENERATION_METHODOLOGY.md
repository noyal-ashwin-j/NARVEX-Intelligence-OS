# NARVEX Synthetic Data Generation Methodology (Phase 1)

This document outlines the methodology used to generate the **50,000+ record relational synthetic observation universe** for demonstration and technical validation.

---

## 🎯 Key Design Criteria

1. **Synthetic Demonstration Observations**:
   Modeled on documented Indian BPR&D/NDPS CCTNS complaint & FIR record structures. Clearly identified as synthetic demonstration observations.

2. **Zero Ground-Truth Risk Labels**:
   Raw datasets contain zero pre-assigned risk scores or forecast labels. All risk levels and spatial associations are derived mathematically by downstream intelligence engines.

3. **Longitudinal Case Histories**:
   Observation records are connected across multi-stage case narratives:
   `Complaint Intake ➔ Police Patrol Intercept ➔ Seizure Record ➔ ANPR Checkpost Scan ➔ Transport Log ➔ News Signal ➔ Provenance Event`

4. **Deterministic Seeded PRNG**:
   Built using a pseudo-random number generator (PRNG) with a fixed seed (`seed = 123456789`), ensuring 100% reproducible test data generation across test environments.
