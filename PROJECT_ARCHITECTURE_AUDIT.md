# PROJECT ARCHITECTURE AUDIT REPORT
**Platform:** NARVEX (State-Level Narcotic Intelligence Operating System)  
**Audit Date:** August 21, 2026  
**Auditor Classification:** Autonomous Forensic Code & System Inspector  

---

## 1. Executive Summary & File Tree Layout

The NARVEX repository is organized as a decoupled web application with a client-side React SPA HUD, a server-side Node.js/Express REST and SSE command engine, a MySQL relational database (`narvex`), a statistical AI training and inference engine, and a multi-source data ingestion pipeline.

```text
NARVEX/
├── client/                     # Frontend React 18 SPA (Vite)
│   ├── public/                 # Static assets & map tile icons
│   ├── src/
│   │   ├── components/         # UI & Intelligence components
│   │   │   ├── assistant/      # NarvexAvatarCore (Voice HUD)
│   │   │   ├── intelligence/   # Signal Fusion, What-If Simulator, Briefing, Knowledge Graph
│   │   │   └── map/            # GISIntelligenceMap (Leaflet/MapLibre)
│   │   ├── pages/              # StateCommandCenter, SecurityCommandCenter, CitizenPortal
│   │   ├── services/           # api.js (Frontend REST Service Abstraction)
│   │   ├── App.jsx             # React App Root Router
│   │   └── main.jsx            # React Entry Point
│   ├── package.json            # Vite, Tailwind, Lucide-React, Leaflet dependencies
│   └── vite.config.js          # Vite compilation config
├── server/                     # Backend API & Intelligence Operating Engine
│   ├── agent/                  # narvexAgentService.js (Central Agent & Intent Dispatcher)
│   ├── ai/                     # AI Machine Learning Engine
│   │   ├── models/             # narvex_forecast_model.json (Saved Weights & Scaler)
│   │   ├── trainForecastModel.js # Regularized Logistic Regression Trainer
│   │   └── forecastInferenceService.js # AI Model Inference Engine
│   ├── controllers/            # Express Endpoint Controllers (auth, district, map, etc.)
│   ├── database/               # Database Schemas & Seeding Scripts
│   │   ├── db.js               # MySQL mysql2 Connection Pool
│   │   ├── NRISE_DATABASE.sql  # Canonical SQL DDL & DML Schema
│   │   └── importDatasets.js   # Master Multi-Source CSV Ingestion & Pipeline Launcher
│   ├── intelligence/           # Core Analytical & Intelligence Engines
│   │   ├── maritimeIntelligenceService.js # 1,076 km Coastal & Maritime Radar Engine
│   │   ├── networkGraphEngine.js # Force-Directed Aggregated Knowledge Mesh
│   │   ├── scenarioSimulationEngine.js # What-If Policy Intervention Engine
│   │   └── signalFusionEngine.js # Spatial-Temporal Cross-Source Signal Fusion Engine
│   ├── middleware/             # authMiddleware.js (JWT & Zero-Trust District Scoping)
│   ├── routes/                 # api.js (Express Route Router)
│   ├── services/               # Core Services (Security, Hash Chain, PII, Briefings)
│   ├── .env                    # Environment secrets & DB_PASSWORD configuration
│   ├── server.js               # Express Server Entry Point (Port 5000)
│   ├── test.js                 # 24-Test Unit & Integration Verification Suite
│   ├── testDataMutationEngine.js # Real Database Mutation & Derivation Verification Suite
│   ├── testFrontendAPIs.js     # Live End-to-End API Integration Suite
│   ├── testNarvex3Suite.js     # NARVEX 3.0 Sovereign System Capability Test Suite
│   └── testSecurityHardeningSuite.js # 10 Zero-Trust Security Gate Test Suite
├── data/                       # Ground Truth Observation & Training Datasets
│   ├── datasets/               # Standalone CSVs (04_complaints, 07_citizen_reports, etc.)
│   └── mock/                   # Stream Simulation Datasets
└── docs/                       # 10 Zero-Trust Security & Architecture Guides
```

---

## 2. Key Component Mapping & Architecture Matrix

| Component | Repository File Path | Implementation Status | Verified Endpoint / Function |
|---|---|---|---|
| **Frontend Entry Point** | [`client/src/main.jsx`](file:///d:/NARVEX/NARVEX/client/src/main.jsx) | ✅ Operational | React DOM Root Mount |
| **Frontend App Router** | [`client/src/App.jsx`](file:///d:/NARVEX/NARVEX/client/src/App.jsx) | ✅ Operational | StateCommandCenter, CitizenPortal, SecurityCommandCenter |
| **Backend Entry Point** | [`server/server.js`](file:///d:/NARVEX/NARVEX/server/server.js) | ✅ Operational | Express listener on `http://127.0.0.1:5000` |
| **API Router** | [`server/routes/api.js`](file:///d:/NARVEX/NARVEX/server/routes/api.js) | ✅ Operational | Express `/api/*` endpoints |
| **Database Pool** | [`server/database/db.js`](file:///d:/NARVEX/NARVEX/server/database/db.js) | ✅ Operational | MySQL mysql2 connection pool to `narvex` |
| **SQL Master Schema** | [`server/database/NRISE_DATABASE.sql`](file:///d:/NARVEX/NARVEX/server/database/NRISE_DATABASE.sql) | ✅ Operational | Tables: `districts`, `intelligence_events`, `citizen_reports`, `forecast_records`, `audit_hash_chain` |
| **Dataset Ingestion Engine** | [`server/database/importDatasets.js`](file:///d:/NARVEX/NARVEX/server/database/importDatasets.js) | ✅ Operational | `importStaticDatasets()` ingesting `data/datasets/*.csv` |
| **AI Model Trainer** | [`server/ai/trainForecastModel.js`](file:///d:/NARVEX/NARVEX/server/ai/trainForecastModel.js) | ✅ Operational | Regularized Logistic Regression on 1,200 training records |
| **AI Model Inference** | [`server/ai/forecastInferenceService.js`](file:///d:/NARVEX/NARVEX/server/ai/forecastInferenceService.js) | ✅ Operational | `runForecastInference()` computing 30/90-day probabilities |
| **Signal Fusion Engine** | [`server/intelligence/signalFusionEngine.js`](file:///d:/NARVEX/NARVEX/server/intelligence/signalFusionEngine.js) | ✅ Operational | `fuseSignalsForDistrict()` spatial-temporal corroboration |
| **What-If Simulator** | [`server/intelligence/scenarioSimulationEngine.js`](file:///d:/NARVEX/NARVEX/server/intelligence/scenarioSimulationEngine.js) | ✅ Operational | `runPreventiveSimulation()` calculating displacement |
| **Knowledge Mesh Engine** | [`server/intelligence/networkGraphEngine.js`](file:///d:/NARVEX/NARVEX/server/intelligence/networkGraphEngine.js) | ✅ Operational | `getAggregatedIntelligenceGraph()` |
| **Maritime Radar Engine** | [`server/intelligence/maritimeIntelligenceService.js`](file:///d:/NARVEX/NARVEX/server/intelligence/maritimeIntelligenceService.js) | ✅ Operational | `getMaritimeIntelligenceData()` for 1,076 km coastline |
| **Central Agent HUD** | [`server/agent/narvexAgentService.js`](file:///d:/NARVEX/NARVEX/server/agent/narvexAgentService.js) | ✅ Operational | `processAgentIntent()` dispatching voice & UI actions |
| **Zero-Trust Security** | [`server/services/securityHardeningService.js`](file:///d:/NARVEX/NARVEX/server/services/securityHardeningService.js) | ✅ Operational | Bcrypt, RFC 6238 TOTP, active session kill-switch, SIEM logs |
| **Hash-Chain Audit Ledger** | [`server/services/hashChainService.js`](file:///d:/NARVEX/NARVEX/server/services/hashChainService.js) | ✅ Operational | `appendAuditRecord()`, `verifyChainIntegrity()` |
| **Realtime Stream (SSE)** | [`server/services/realtimeIntelligenceService.js`](file:///d:/NARVEX/NARVEX/server/services/realtimeIntelligenceService.js) | ✅ Operational | Server-Sent Events `/api/realtime/stream` |
