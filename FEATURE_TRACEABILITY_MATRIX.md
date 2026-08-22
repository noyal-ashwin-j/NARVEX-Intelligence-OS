# FEATURE TRACEABILITY MATRIX
**Platform:** NARVEX (State-Level Narcotic Intelligence Operating System)  
**Audit Date:** August 21, 2026  
**Auditor Classification:** Autonomous Forensic Code & System Inspector  

---

## 1. Traceability Matrix

| Feature Name | Frontend Component | API Endpoint | Backend Service / Controller | Database Table | AI / Intelligence Engine | Source Data File | Dynamic? | Verified? | Evidence / Execution Log |
|---|---|---|---|---|---|---|---|---|---|
| **State Command Center Overview** | `StateCommandCenter.jsx` | `GET /api/districts` | `districtController.js` | `districts` | `backgroundIntelligenceService.js` | `05_districts.csv` | Yes | ✅ Yes | Renders 38 districts with dynamic sorting |
| **Tactical GIS Intelligence Map** | `GISIntelligenceMap.jsx` | `GET /api/map/layers` | `mapController.js` | `risk_zones`, `spatial_associations` | `signalFusionEngine.js` | MySQL DB tables | Yes | ✅ Yes | Dynamic Leaflet risk polygons & corridors |
| **Tripartite Score Inspector** | `StateCommandCenter.jsx` | `GET /api/districts/:id` | `districtController.js` | `districts` | Tripartite Derivation Engine | MySQL DB tables | Yes | ✅ Yes | Displays Risk, Confidence, Coverage separately |
| **Data Provenance Inspector** | `ProvenanceModal.jsx` | `GET /api/intelligence/events/:id` | `intelligenceController.js` | `event_provenance` | SHA-256 Hash Chain Service | MySQL `event_provenance` | Yes | ✅ Yes | Traces source file, row, hash, and reviewer |
| **Anonymous Citizen Portal** | `CitizenPortal.jsx` | `POST /api/citizen/report` | `citizenController.js` | `citizen_reports` | `piiRedactionService.js` | User web input | Yes | ✅ Yes | Generates `ANON-TOKEN-*` with PII redaction |
| **Public Token Status Tracker** | `CitizenPortal.jsx` | `GET /api/citizen/track/:token` | `citizenController.js` | `citizen_reports` | Workflow Engine | MySQL `citizen_reports` | Yes | ✅ Yes | Safe stage lookup without revealing PII |
| **Analyst Verification Queue** | `AnalystQueue.jsx` | `GET /api/citizen/queue` | `citizenController.js` | `citizen_reports` | Duplicate & Burst Detector | MySQL `citizen_reports` | Yes | ✅ Yes | Flags duplicates & burst patterns |
| **Universal File Ingestion** | `DataIngestion.jsx` | `POST /api/ingest/universal` | `ingestionController.js` | `intelligence_events` | Text/OCR Ingestion Pipeline | Uploaded PDF/CSV/Excel | Yes | ✅ Yes | Extracted observations written to MySQL |
| **Spatial Corridor Analysis** | `SpatialCorridors.jsx` | `GET /api/spatial/associations` | `associationController.js` | `spatial_associations` | Spatial Correlation Engine | MySQL `spatial_associations` | Yes | ✅ Yes | Models interstate & district corridors |
| **What-If Scenario Simulator** | `ScenarioSimulator.jsx` | `POST /api/simulation/preventive` | `scenarioSimulationEngine.js` | Policy parameters | Scenario Displacement Engine | Interactive UI Sliders | Yes | ✅ Yes | Computes velocity drop & spillover |
| **AI Predictive Forecast** | `ForecastMatrix.jsx` | `GET /api/forecast/zones` | `forecastController.js` | `forecast_records` | `forecastInferenceService.js` | ML Model Artifact | Yes | ✅ Yes | Generates 30d & 90d predictions |
| **Cross-Source Signal Fusion** | `CorroboratingSignals.jsx` | `GET /api/fusion/district/:id` | `signalFusionEngine.js` | Multi-source tables | Spatial-Temporal Fusion Engine | MySQL DB tables | Yes | ✅ Yes | Fuses multi-source events |
| **Knowledge Network Graph** | `IntelligenceNetworkGraph.jsx` | `GET /api/graph/intelligence` | `networkGraphEngine.js` | Aggregated entities | Force Graph Generator | MySQL DB tables | Yes | ✅ Yes | Force-directed SVG mesh with map sync |
| **Maritime Radar Extension** | `GISIntelligenceMap.jsx` | `GET /api/maritime/intelligence` | `maritimeIntelligenceService.js` | Coastal nodes | Maritime Risk Engine | 1,076 km coastline data | Yes | ✅ Yes | Ingests Chennai Port & Palk Strait nodes |
| **Executive Briefing Generator** | `GenerateBriefing.jsx` | `GET /api/briefing/generate` | `intelligenceBriefingService.js` | System records | Briefing Dossier Generator | MySQL DB tables | Yes | ✅ Yes | Generates dossier with SHA-256 hash |
| **Central Voice HUD Controller** | `NarvexAvatarCore.jsx` | `POST /api/agent/command` | `narvexAgentService.js` | `agent_audit_logs` | Natural Language Intent Parser | Speech / Text input | Yes | ✅ Yes | Dispatches UI actions & speaks Tamil/English |
| **SHA-256 Audit Chain Explorer** | `SecurityCommandCenter.jsx` | `GET /api/audit/verify-chain` | `auditController.js` | `audit_hash_chain` | `hashChainService.js` | Sequential SHA-256 blocks | Yes | ✅ Yes | Live cryptographic hash verification |
| **SIEM & Zero-Trust Security** | `SecurityCommandCenter.jsx` | `GET /api/security/dashboard` | `authController.js` | `security_events`, `sessions` | Threat Anomaly Engine | Real-time SIEM logs | Yes | ✅ Yes | Threat anomaly score & session kill-switch |
