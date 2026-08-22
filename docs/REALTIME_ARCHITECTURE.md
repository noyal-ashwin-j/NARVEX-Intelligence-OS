# NARVEX Real-Time & Event-Driven Pipeline Architecture

This document describes the event-driven recomputation flow of NARVEX when raw observations are ingested, modified, or deleted.

---

## 🔄 End-to-End Real-Time Ingestion & Recomputation Flow

```
+------------------+      +--------------------+      +-----------------------+
| External Intake  | ---> | Document / Payload | ---> | SHA-256 Hash Check &  |
| File Drop / REST |      | Ingestion Pipeline |      | Deduplication         |
+------------------+      +--------------------+      +-----------------------+
                                                                |
                                                                v
+------------------+      +--------------------+      +-----------------------+
| Real-Time SSE/WS | <--- | Statistical Model  | <--- | Feature Engineering   |
| Frontend & Agent |      | Inference Engine   |      | Recomputation         |
+------------------+      +--------------------+      +-----------------------+
```

---

## ⚡ Step-by-Step Execution Sequence

1. **Intake & Ingestion**:
   - Files or payloads dropped into `documentIngestionService.js` receive a SHA-256 cryptographic hash.
   - Text parsing & NER extract locations, timestamps, substances, and case references.
   - Raw records written to MySQL `documents`, `document_extractions`, and `event_provenance`.

2. **Affected Geography & Time Window Detection**:
   - `triggerDependencyAwareRecomputation(affectedDistrictId)` isolates the affected district.
   - Computes 7-day, 30-day, 90-day observation velocities, acceleration, source diversity, and coverage scores.

3. **Model Inference**:
   - `forecastInferenceEngine.js` evaluates feature vectors using Logistic Ridge formulation.
   - Updates `forecast_records` in MySQL with probability, confidence, coverage, and signal state.

4. **Real-Time Broadcast**:
   - Emits SSE payload (`timestamp`, `actionType`, `district`, `features`, `forecast`) to active frontend clients and the NARVEX Central Agent.
