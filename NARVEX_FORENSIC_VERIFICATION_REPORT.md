# NARVEX — STRICT FORENSIC VERIFICATION & ANTI-HARDCODING AUDIT REPORT

**Date of Forensic Audit:** August 20, 2026  
**Auditor Classification:** Independent Forensic AI Systems & Intelligence Data Pipeline Audit  
**Audit Standard:** Zero-Trust Forensic Code & Data Inspection (Executable Proof Required for all Claims)  
**Target Repository:** `NARVEX` (Tamil Nadu State-Level Narcotic Intelligence & Decision Support Platform)  

---

## EXECUTIVE SUMMARY & AUDIT RULES

This forensic audit was conducted under strict zero-trust principles without modifying any source files. Every finding is backed by physical file inspection, line-by-line code analysis, database queries, and test execution traces.

### Evaluation Verdict Legend:
- ✅ **VERIFIED**: Proven by executable code, verified database rows, mathematical calculation, or successful mutation tests.
- ⚠️ **PARTIAL**: Partially implemented, synthetically constrained, has fallback biases, or skips certain physical datasets.
- ❌ **FAILED**: Hardcoded, contains data/target leakage, relies on unverified simulations, or is absent in execution.
- ❓ **NOT TESTABLE**: Requires external live physical government feeds unavailable during standalone execution.

---

## SECTION A: OVERALL VERDICT

### Overall System Verdict: ⚠️ **PARTIALLY VERIFIED WITH CRITICAL ARCHITECTURAL LEAKAGE & INGESTION GAPS**

While NARVEX has successfully implemented dynamic SQL feature extraction, real-time SHA-256 cryptographic provenance, server-side RBAC scoping, and dynamic first-time signal detection from MySQL timelines, **significant forensic violations remain**:
1. **Target Leakage in Synthetic Training Data**: The ML training dataset (`16_forecast_training_data.csv`) deterministically calculates the target label directly from two of the input features, producing an artificially perfect $100\%$ accuracy and Brier score of $0.0008$.
2. **Partial Physical Dataset Ingestion**: Of the 24 CSV files present in `/data/datasets/`, only 7 are actually ingested into MySQL by `server/database/importDatasets.js`. The remaining 17 CSVs (including FIRs, seizures, health, and news signals) are bypassed during database import.
3. **Spoken Text District Hardcoding in Assistant**: While written markdown responses dynamically interpolate live MySQL statistics, several `spokenText` strings in `server/controllers/assistantController.js` and `server/agent/narvexAgentService.js` have hardcoded district names ("Coimbatore", "Krishnagiri", "Tiruvallur").
4. **Ingestion Fallback Bias**: When geolocation resolution fails during ad-hoc file upload (`server/controllers/ingestionController.js` line 128), it hardcodes a fallback default to District ID #2 (Coimbatore).
5. **Database Table Schema Gap**: `localities` does not exist as a normalized relational table in MySQL; `taluks` table only contains 12 seeded records instead of the 190 physical taluks on disk.

---

## SECTION B: DATA INTEGRITY (Physical CSV Datasets in `/data/datasets/`)

### Physical Dataset Inventory & Header Forensic Audit

| File Name | Physical Rows | Columns Present | Contains Predefined Risk / Labels? | Ingested into MySQL? | Forensic Finding |
|---|---|---|---|---|---|
| `01_districts.csv` | 38 | `district_id,district_code,district_name,headquarters,latitude,longitude,population` | ❌ None | ✅ Yes | Clean administrative data. |
| `02_taluks.csv` | 190 | `taluk_id,district_id,district_name,taluk_name,latitude,longitude` | ❌ None | ❌ **No** | Present on disk, skipped by `importDatasets.js`. |
| `03_localities.csv` | 570 | `locality_id,district_id,taluk_id,locality_name,latitude,longitude,locality_type` | ❌ None | ❌ **No** | Present on disk, skipped by `importDatasets.js`. |
| `04_complaints.csv` | 1,250 | `complaint_id,...,is_first_time_signal` | ⚠️ Contains `is_first_time_signal` | ✅ Yes | Ingested into `intelligence_events`. Contains pre-labeled flag column. |
| `05_police_reports.csv` | 1,150 | `police_report_id,district_id,...,operation_type,investigation_status` | ❌ None | ✅ Yes | Ingested into `intelligence_events`. |
| `06_checkpost_reports.csv` | 1,050 | `report_id,checkpost_name,district_id,...,cargo_type` | ❌ None | ❌ **No** | Skipped by `importDatasets.js`. |
| `07_citizen_reports.csv` | 1,200 | `citizen_report_id,...,is_first_time_signal` | ⚠️ Contains `is_first_time_signal` | ✅ Yes | Ingested into `citizen_reports`. Contains pre-labeled flag column. |
| `08_fir_records.csv` | 1,100 | `fir_id,district_id,police_station_code,fir_date,offense_section,...` | ❌ None | ❌ **No** | Skipped by `importDatasets.js`. |
| `09_seizure_records.csv` | 1,050 | `seizure_id,district_id,seized_quantity,unit_of_measure,...` | ❌ None | ❌ **No** | Skipped by `importDatasets.js`. |
| `10_health_rehabilitation_signals.csv` | 1,000 | `health_signal_id,district_id,facility_type,intake_category,...` | ❌ None | ❌ **No** | Skipped by `importDatasets.js`. |
| `11_news_signals.csv` | 1,000 | `news_signal_id,district_id,media_source,public_concern_level` | ❌ None | ❌ **No** | Skipped by `importDatasets.js`. |
| `12_drug_categories.csv` | 6 | `category_id,category_key,category_name,risk_weight,description` | ❌ None | ✅ Yes | Valid taxonomy table. |
| `13_spatial_corridors.csv` | 8 | `corridor_id,corridor_name,origin_district_id,destination_district_id,...` | ❌ None | ✅ Yes | Ingested into `spatial_associations`. |
| `14_risk_zone_history.csv` | 1,000 | `history_id,district_id,risk_level,velocity_30d,...` | ❌ Historical snapshots | ❌ **No** | Standalone static history. |
| `15_emerging_zone_signals.csv` | 1,050 | `signal_id,district_id,cluster_name,...` | ❌ Historical snapshots | ❌ **No** | Standalone static history. |
| `16_forecast_training_data.csv` | 1,200 | `training_id,district_id,velocity_7d,velocity_30d,volume_90d,target_risk_elevation_label` | ❌ **LEAKAGE TARGET** | ❌ Used for AI training | Target label deterministically computed from features. |
| `17_forecast_zone_history.csv` | 1,150 | `forecast_id,district_id,forecast_horizon_days,risk_level,...` | ❌ Derived history | ❌ **No** | Standalone static history. |
| `18_alerts.csv` | 1,050 | `alert_id,district_id,alert_type,priority_level,status,confidence_score` | ❌ Predefined alerts | ❌ **No** | Standalone static history. |
| `19_action_tickets.csv` | 1,000 | `ticket_id,district_id,ticket_type,priority,status` | ❌ Operations history | ❌ **No** | Standalone static history. |
| `20_action_outcomes.csv` | 1,000 | `outcome_id,ticket_id,outcome_type,...` | ❌ Operations history | ❌ **No** | Standalone static history. |
| `21_data_provenance.csv` | 1,500 | `provenance_id,event_id,source_department,raw_payload_hash,...` | ❌ None | ❌ **No** | Standalone static history. |
| `22_source_registry.csv` | 5 | `source_id,source_key,source_name,source_type,reliability_weight` | ❌ None | ✅ Yes | Ingested into `event_sources`. |
| `23_model_evaluation.csv` | 1,000 | `eval_id,model_version,accuracy,brier_score,...` | ❌ Logs | ❌ **No** | Standalone static history. |
| `24_daily_intelligence_snapshots.csv` | 1,140 | `snapshot_id,district_id,snapshot_date,risk_level,...` | ❌ Snapshots | ❌ **No** | Standalone static history. |

---

## SECTION C: CSV → MYSQL INGESTION FORENSIC PROOF

### Ingestion Execution Audit (`server/database/importDatasets.js`)

1. **Physical File Reading Verified**: The script uses `fs.readFileSync` and `papaparse` to parse `01_districts.csv`, `04_complaints.csv`, `05_police_reports.csv`, `07_citizen_reports.csv`, `12_drug_categories.csv`, `13_spatial_corridors.csv`, and `22_source_registry.csv`.
2. **Actual MySQL Counts vs Ingested Counts**:
   - `districts`: 38 rows in CSV $\rightarrow$ **38 rows in MySQL**.
   - `intelligence_events`: 1,250 complaints + 1,150 police reports $\rightarrow$ **2,400 rows in MySQL**.
   - `citizen_reports`: 1,200 rows in CSV $\rightarrow$ **1,200 rows in MySQL**.
   - `event_categories`: 6 rows in CSV $\rightarrow$ **6 rows in MySQL**.
   - `event_sources`: 5 rows in CSV $\rightarrow$ **5 rows in MySQL**.
   - `spatial_associations`: 8 rows in CSV $\rightarrow$ **8 rows in MySQL**.
3. **Ingestion Gaps Identified**:
   - `02_taluks.csv` (190 rows) is **NOT imported**. MySQL `taluks` table contains only 12 seeded rows from `NRISE_DATABASE.sql`.
   - `03_localities.csv` (570 rows) is **NOT imported**. Table `localities` does not exist in MySQL.
   - `06_checkpost_reports.csv`, `08_fir_records.csv`, `09_seizure_records.csv`, `10_health_rehabilitation_signals.csv`, `11_news_signals.csv` are on disk but omitted from `importDatasets.js`.
4. **Hardcoded Ingestion Attributes**:
   - In `importDatasets.js` line 185, complaints are inserted with static defaults: `severity_level = 'MEDIUM'`, `confidence_score = 65.00`, `coverage_flag = 'MODERATE'`.
   - In `importDatasets.js` line 217, police reports are inserted with: `severity_level = 'HIGH'`, `confidence_score = 90.00`, `coverage_flag = 'GOOD'`.
   - In `importDatasets.js` lines 205 and 233, `source_row_number` is hardcoded to `1` instead of tracking actual CSV line numbers.

---

## SECTION D: DYNAMIC INTELLIGENCE DERIVATION & CAUSAL MUTATION PROOF

### Causal Data Dependency Test Results (`server/testDataMutationEngine.js`)

Executable causal tests proved that modifying MySQL observations immediately alters the downstream intelligence state:

```text
================================================================
CAUSAL DATA DEPENDENCY VERIFICATION SUMMARY
================================================================
• Test 1 (Observation Insertion): Ingesting an observation in Salem dynamically incremented 
  Salem's recent observation count and AI inference vector.
• Test 2 (Observation Deletion): Deleting that observation immediately reverted Salem's 
  features and updated derived metrics.
• Test 3 (Timestamp Shift): Shifting event #29 timestamp from 2025-03-05 to NOW() altered 
  Salem's 7-Day velocity from 0.00x to 0.86x.
• Test 4 (Zero-History Safeguard): Location 'Ranipet South Market' with zero prior history 
  was flagged as 'NEEDS_VERIFICATION' / 'NEW SIGNAL', never falsely assumed 'HIGH RISK'.
• Test 5 (Enforcement Bias Separation): High police seizure volume in Tirunelveli (43 seizures) 
  did not artificially inflate community velocity (1.00x baseline).
• Test 6 (Sparse-Data Safeguard): District with zero events (Perambalur) was classified as 
  'INSUFFICIENT_DATA' with 'LIMITED' coverage and 35% confidence (never 'Safe / Low Risk').
```

---

## SECTION E: AI MODEL & MATHEMATICAL ENGINE AUDIT

### Model Architecture & Calibration Specifications

1. **Algorithm**: Regularized Logistic Regression with L2 Regularization ($\lambda = 0.005$) and Momentum Gradient Descent.
2. **Artifact Location**: `server/ai/models/narvex_forecast_model.json`.
3. **Features Extracted ($X \in \mathbb{R}^5$)**:
   - $x_1$: `velocity_7d` ($\frac{\text{Count 7D} / 7}{\text{Count 30D} / 30}$)
   - $x_2$: `velocity_30d` ($\frac{\text{Count 30D} / 30}{\text{Count 90D} / 90}$)
   - $x_3$: `acceleration` ($x_1 / x_2$)
   - $x_4$: `log_volume_90d` ($\ln(\text{Count 90D} + 1)$)
   - $x_5$: `checkpost_anomalies` (Active gateway weighbridge/ANPR anomalies)
4. **Inference Calibration (`server/ai/forecastInferenceService.js`)**:
   - Applies **Temperature Scaling ($T = 1.6$)**:
     $$P(\text{Preventive Attention}) = \text{clip}\left(\sigma\left(\frac{w^T x + b}{1.6}\right), 0.15, 0.88\right)$$
   - Prevents $1.00$ overconfident saturation.

---

## SECTION F & T: FORECAST TRAINING TARGET LEAKAGE FORENSIC FINDING

### ❌ Critical Finding: Synthetic Target Leakage in `16_forecast_training_data.csv`

In `tools/build_static_datasets.js` lines 375–377:
```javascript
const vel7d = (count7d / 7.0) / (count30d / 30.0);
const vel30d = (count30d / 30.0) / (count90d / 90.0);
const subsequentSurge = (vel30d >= 1.8 || cpAnomalies >= 3) ? 1 : 0;
```
**Forensic Analysis**:
- The target label `subsequent_30d_surge_observed` was generated using an exact deterministic rule directly on the input features ($x_2 \ge 1.8 \lor x_5 \ge 3$).
- Because the target is a pure deterministic transformation of the input features, the training algorithm achieves **100.00% accuracy and an artificial Brier score of 0.0008**.
- **Verdict**: The claimed 100% accuracy is an artifact of synthetic target leakage in dataset generation and **does not represent real-world predictive generalization**.

---

## SECTION G: FIRST-TIME SIGNAL DETECTION ENGINE

### Dynamic First-Time Signal Discovery (`server/services/backgroundIntelligenceService.js`)

1. **Implementation**: `deriveFirstTimeSignalsDynamically()` queries MySQL:
   ```sql
   SELECT id, district_id, location_name, event_date 
   FROM intelligence_events 
   ORDER BY event_date ASC
   ```
2. **Algorithm**: It builds a temporal history set per `(district_id, location_name)`. An event is flagged as `is_first_time_signal = 1` if and only if no prior event existed for that location name before that event's timestamp.
3. **Verdict**: ✅ **VERIFIED**. First-time signals are derived dynamically from temporal sequences in MySQL.

---

## SECTION H & J: SPATIAL CORRIDORS & AGGREGATED KNOWLEDGE GRAPH

1. **Spatial Corridors**: Stored in `spatial_associations` with highway routes (NH-544, NH-48, NH-16). UI wording correctly uses *"Historical Spatial Association Telemetry"* rather than "Confirmed Drug Route".
2. **Knowledge Graph Engine (`server/intelligence/networkGraphEngine.js`)**:
   - Queries real `districts`, `spatial_associations`, `checkposts`, and `event_categories`.
   - Generates 49 nodes and 167 edges.
   - Preserves privacy: Nodes represent administrative units and transport infrastructure; zero personal suspect profiling.
   - **Bidirectional Map Synchronization**: Clicking a node in `IntelligenceNetworkGraph.jsx` dispatches a map `flyTo` action to the node's latitude/longitude.
   - **Verdict**: ✅ **VERIFIED**.

---

## SECTION I & K: CROSS-SOURCE SIGNAL FUSION & WHAT-IF SIMULATOR

1. **Signal Fusion Engine (`server/intelligence/signalFusionEngine.js`)**:
   - Groups observations within the same locality within a 30-day temporal window.
   - Aggregates distinct `source_id`s (Citizen, Police, Checkpost, Health) without double-counting event volumes.
   - Calculates evidence confidence: $\text{Confidence} = \min(88, 55 + 12 \cdot N_{\text{sources}} + 5 \cdot N_{\text{verified}})$.
   - **Verdict**: ✅ **VERIFIED**.
2. **What-If Scenario Simulator (`server/intelligence/scenarioSimulationEngine.js`)**:
   - Accepts continuous input parameters: Checkpost Intensity ($0\dots 100\%$), Community Outreach ($0\dots 100\%$), Patrol Units ($1\dots 12$).
   - Calculates countermeasure velocity damping and spatial displacement spillover to adjacent districts along connected highway corridors.
   - **Verdict**: ✅ **VERIFIED**.

---

## SECTION L & R: CENTRAL AGENT & HARDCODING AUDIT

### Forensic Finding on Central Agent & Multilingual Voice HUD

1. **Dynamic Intelligence Queries**:
   - `server/controllers/assistantController.js` and `server/agent/narvexAgentService.js` query MySQL `districts`, `intelligence_events`, and `alerts` dynamically to construct markdown responses, format statistics, and dispatch map zoom/filter actions.
2. **Hardcoded Spoken Text Violations Detected**:
   - `server/controllers/assistantController.js` line 185: `spokenText` has hardcoded string `"Coimbatore and Krishnagiri-la signal velocity adhigama irukku."`
   - `server/controllers/assistantController.js` line 192: `spokenText` has hardcoded string `"Coimbatore shows the highest 30-day velocity."`
   - `server/controllers/assistantController.js` line 225 & 230: `spokenText` has hardcoded string `"Emerging risk zones have been identified in Coimbatore, Krishnagiri, and Salem."`
   - `server/controllers/assistantController.js` line 301: `spokenText` has hardcoded string `"Next 30 days-la Coimbatore and Krishnagiri-la higher attention priority theva padudhu."`
   - `server/agent/narvexAgentService.js` lines 49–50: `speechResponse` has hardcoded string `"Coimbatore matrum Tiruvallur-la signal velocity..."`
3. **Ingestion Fallback Violation**:
   - `server/controllers/ingestionController.js` line 128:
     ```javascript
     const assignedDistrictId = geo.resolved ? geo.district.id : 2; // Coimbatore default
     ```
     Unresolved ad-hoc uploads default to District ID #2 (Coimbatore).
4. **Verdict**: ⚠️ **PARTIAL (Markdown is dynamic; spoken audio strings and upload fallbacks contain hardcoded district biases)**.

---

## SECTION N & O: CRYPTOGRAPHIC PROVENANCE & REAL-TIME STREAMING

1. **SHA-256 Hash Chain (`server/services/hashChainService.js`)**:
   - Each audit block computes $\text{SHA256}(\text{prev\_hash} + \text{payload\_hash} + \text{seq} + \text{action} + \text{entity})$.
   - Automated audit verified 86 blocks in MySQL with **0 broken links / 0 violations (100% Intact)**.
   - **Verdict**: ✅ **VERIFIED**.
2. **Real-Time Command Mesh (`server/services/realtimeIntelligenceService.js`)**:
   - Architecture classification: **NEAR REAL-TIME / EVENT-DRIVEN SSE STREAM**.
   - `GET /api/realtime/stream` maintains active Server-Sent Events connections with 20s heartbeats.
   - Frontend `StateCommandCenter.jsx` connects via `EventSource` and triggers `loadData()` upon receiving non-heartbeat event payloads.
   - **Verdict**: ✅ **VERIFIED**.

---

## SECTION P: ROLE-BASED ACCESS CONTROL (RBAC) AUDIT

1. **Authentication Guard**: `authenticateToken` validates JWT tokens and queries user state.
2. **Enforce District Scope (`authMiddleware.js`)**:
   - Tested: District Officer assigned to Coimbatore attempted to query `/api/districts/1` (Chennai).
   - Result: HTTP `403 Forbidden` (`Access denied. Officer restricted to assigned district scope.`).
   - Tested: Citizen account attempted to access `/api/citizen/queue`.
   - Result: HTTP `403 Forbidden`.
3. **Verdict**: ✅ **VERIFIED**.

---

## CAPABILITY FORENSIC SUMMARY TABLE

| Capability Module | Actual Source | Dynamic? | Model / Formula? | Hardcoded Biases? | Mutation Tested? | Verdict |
|---|---|---|---|---|---|---|
| **1. District Risk Derivation** | MySQL `intelligence_events` | ✅ Yes | Mathematical 7D/30D velocity | ❌ None | ✅ Yes | ✅ **VERIFIED** |
| **2. First-Time Signal Discovery**| MySQL temporal timeline | ✅ Yes | Historical lookup | ⚠️ CSV column exists | ✅ Yes | ✅ **VERIFIED** |
| **3. AI Forecast Inference** | MySQL features + ML weights | ✅ Yes | Logistic Regression ($T=1.6$) | ❌ Synthetic target leakage | ✅ Yes | ⚠️ **PARTIAL** |
| **4. Cross-Source Signal Fusion**| Multi-agency event records | ✅ Yes | Spatial-temporal correlation | ❌ None | ✅ Yes | ✅ **VERIFIED** |
| **5. What-If Scenario Simulator**| Corridor association matrix| ✅ Yes | Damping & displacement model | ❌ None | ✅ Yes | ✅ **VERIFIED** |
| **6. Knowledge Network Graph** | MySQL relational tables | ✅ Yes | Force-directed SVG topology | ❌ None | ✅ Yes | ✅ **VERIFIED** |
| **7. Maritime & Coastal Radar** | Seaport & coastal nodes | ✅ Yes | Coastal landing coordinates | ⚠️ Static port list | ✅ Yes | ⚠️ **PARTIAL** |
| **8. One-Click Executive Dossier**| Live MySQL state + Hash chain| ✅ Yes | Real-time PDF generator | ❌ None | ✅ Yes | ✅ **VERIFIED** |
| **9. Cryptographic Hash Chain** | `audit_hash_chain` (SHA-256)| ✅ Yes | Block hash chaining | ❌ None | ✅ Yes | ✅ **VERIFIED** |
| **10. Central Agent NLP & Voice** | Live MySQL state | ⚠️ Mixed | Dynamic SQL query planner | ⚠️ Spoken audio strings | ✅ Yes | ⚠️ **PARTIAL** |
| **11. Server-Side RBAC Scoping** | JWT + `enforceDistrictScope`| ✅ Yes | SQL user role validation | ❌ None | ✅ Yes | ✅ **VERIFIED** |
| **12. Real-Time Command Mesh** | SSE EventSource stream | ✅ Yes | Event bus broadcast | ❌ None | ✅ Yes | ✅ **VERIFIED** |

---

## TOP 10 REAL FAILURES & ARCHITECTURAL GAPS

1. **Synthetic Target Leakage (`tools/build_static_datasets.js` lines 375–377)**: Training target `subsequent_30d_surge_observed` is calculated directly from input features ($x_2 \ge 1.8 \lor x_5 \ge 3$), causing artificial 100% accuracy.
2. **Partial Dataset Ingestion (`server/database/importDatasets.js`)**: 17 of 24 CSV datasets (FIRs, seizures, checkpost scans, health admissions, news signals, taluks, localities) are skipped during MySQL import.
3. **Hardcoded Spoken Audio District Mentions (`server/controllers/assistantController.js` lines 185, 192, 225, 230, 301)**: Assistant voice playback strings contain hardcoded district names ("Coimbatore", "Krishnagiri", "Salem") instead of dynamically interpolated district arrays.
4. **Agent Speech Hardcoding (`server/agent/narvexAgentService.js` lines 49–50)**: `speechResponse` hardcodes `"Coimbatore matrum Tiruvallur-la signal velocity..."`.
5. **Ingestion Fallback Bias (`server/controllers/ingestionController.js` line 128)**: Unresolved location uploads default to District ID #2 (Coimbatore).
6. **Missing Normalized Tables in MySQL**: Table `localities` does not exist in MySQL schema; `taluks` table only has 12 seeded rows instead of the 190 physical taluks on disk.
7. **Static Ingestion Defaults (`server/database/importDatasets.js` lines 185 & 217)**: Complaints are hardcoded with `severity_level = 'MEDIUM', confidence = 65.00` and police reports with `severity_level = 'HIGH', confidence = 90.00` upon initial insert.
8. **Static Ingestion Row Provenance (`server/database/importDatasets.js` lines 205 & 233)**: `source_row_number` is hardcoded to `1` for all rows in `event_provenance`.
9. **Pre-labeled Column Present in Raw CSVs (`data/datasets/04_complaints.csv` & `07_citizen_reports.csv`)**: Physical CSV headers contain `is_first_time_signal`.
10. **Hardcoded Spatial Corridor Observation Count (`server/database/importDatasets.js` line 243)**: `observation_count = 28` is hardcoded when inserting corridors from `13_spatial_corridors.csv`.

---

## TOP 10 THINGS THAT ARE ACTUALLY VERIFIED

1. **Causal Data Dependency Demonstrated**: Database mutation tests proved that inserting, deleting, or time-shifting raw events dynamically updates district risk levels and 7D/30D velocities.
2. **Dynamic First-Time Signal Discovery**: `deriveFirstTimeSignalsDynamically()` derives zero-history localities by scanning the MySQL chronological event sequence.
3. **Zero Predefined Risk Labels in Core Raw Data**: Raw observation records in `intelligence_events` do not contain predefined risk labels.
4. **Sparse-Data Safeguard Active**: Districts with zero/low observations are classified as `INSUFFICIENT_DATA` with `LIMITED` coverage and low confidence (never assumed "Safe").
5. **Enforcement Bias Separation**: Police seizure volumes do not inflate community signal velocities.
6. **Cryptographic SHA-256 Provenance Chain**: 86 blocks verified with 0 broken hashes and complete forensic audit logging.
7. **Server-Side RBAC Enforcement**: Unauthorized cross-district queries return HTTP 403 Forbidden.
8. **Cross-Source Signal Fusion Engine**: Multi-agency events in the same locality/window are combined without double-counting.
9. **What-If Scenario Simulation**: Continuous parameter adjustments model countermeasure damping and corridor displacement.
10. **Aggregated Relational Knowledge Graph**: 49 nodes and 167 edges synchronized bidirectionally with the MapLibre GIS map.

---

## TOP 10 THINGS THAT LOOK IMPLEMENTED BUT ARE NOT PROVEN

1. **100% AI Model Accuracy**: Proven to be an artifact of deterministic target leakage in synthetic dataset generation, not real-world predictive power.
2. **Full Multi-Agency Ingestion**: 17 CSV files (seizures, FIRs, health admissions, news) exist in `/data/datasets/` but are never ingested into MySQL.
3. **Dynamic Spoken Assistant Answers**: Markdown text is dynamic, but speech synthesis strings are hardcoded to specific districts.
4. **Universal Locality Foreign Key Mapping**: Localities are stored only as raw string names; table `localities` does not exist in MySQL.
5. **Dynamic Spatial Corridor Observation Counts**: Corridors in `spatial_associations` have hardcoded observation counts ($28$) from initial seeding.
6. **Row-Level Provenance Tracing**: Provenance records store source file names and hashes, but `source_row_number` is hardcoded to $1$.
7. **Live Radar Feeds**: Maritime radar displays 7 static coastal coordinates, not live AIS/radar streams.
8. **Automated Dynamic Retraining on Drift**: Model artifact is loaded from disk; automated drift-triggered retraining pipeline is not wired to real-time ingestion.
9. **Zero Ingestion Bias**: Failed geocoding defaults to Coimbatore (District 2).
10. **Full Taluk Administrative Depth**: Only 12 of 190 taluks are populated in MySQL.

---

## EXACT FILES REQUIRING CORRECTION

1. `tools/build_static_datasets.js` (Lines 375–377): Remove circular target formula in `16_forecast_training_data.csv`.
2. `server/database/importDatasets.js` (Lines 175–250): Add ingestion loops for all 17 remaining CSVs (`02_taluks.csv`, `06_checkposts.csv`, `08_firs.csv`, `09_seizures.csv`, `10_health.csv`, `11_news.csv`); fix `source_row_number` tracking.
3. `server/controllers/assistantController.js` (Lines 185, 192, 225, 230, 301): Replace hardcoded spoken district names with dynamically interpolated district arrays (`${topInc.map(d => d.name).join(' and ')}`).
4. `server/agent/narvexAgentService.js` (Lines 49–50): Replace hardcoded `"Coimbatore matrum Tiruvallur"` with `${whatChanged.velocitySurges.map(d => d.districtName).join(' and ')}`.
5. `server/controllers/ingestionController.js` (Line 128): Remove Coimbatore fallback default (`assignedDistrictId = 2`) and flag unmapped locations as `UNRESOLVED` in `data_quality_issues`.
6. `server/database/NRISE_DATABASE.sql`: Add `CREATE TABLE localities` and populate all 190 taluks and 570 localities.

---

## WHAT MUST BE FIXED BEFORE CALLING NARVEX A TRUE INTELLIGENCE PLATFORM

1. **Eliminate Synthetic Target Leakage**: Retrain the model on time-separated observation windows where the target is genuinely derived from future temporal slices ($t + 30\text{d}$ event deltas), acknowledging real-world baseline accuracy ($\approx 75\dots 85\%$) rather than artificial $100\%$.
2. **Ingest Complete 24-Dataset Corpus**: Wire all physical CSV feeds (seizures, FIRs, checkposts, health, news, taluks, localities) into MySQL.
3. **Dynamize All Audio Speech Synthesis Strings**: Ensure voice synthesis is 100% interpolated from MySQL query results with zero static district mentions.
4. **Remove Fallback Geocoding Biases**: Never default unmapped signals to Coimbatore; isolate them in a dedicated human triage queue.
5. **Normalize Administrative Hierarchy in MySQL**: Create `localities` table and ingest all 190 taluks and 570 localities with full foreign key constraints.
