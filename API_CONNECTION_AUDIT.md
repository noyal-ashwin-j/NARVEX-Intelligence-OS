# FRONTEND ↔ BACKEND API CONNECTION AUDIT REPORT
**Platform:** NARVEX (State-Level Narcotic Intelligence Operating System)  
**Audit Date:** August 21, 2026  
**Auditor Classification:** Autonomous Forensic Code & System Inspector  

---

## 1. Audit Summary

Every frontend API function defined in [`client/src/services/api.js`](file:///d:/NARVEX/NARVEX/client/src/services/api.js) and individual React components in [`client/src/components/`](file:///d:/NARVEX/NARVEX/client/src/components/) was mapped directly against backend routes in [`server/routes/api.js`](file:///d:/NARVEX/NARVEX/server/routes/api.js), controllers, and database handlers.

---

## 2. API Endpoint Traceability Matrix

| Frontend Component | HTTP Method | URL Path | Backend Controller / Service | Database Operation | Audit Status | Evidence / Notes |
|---|---|---|---|---|---|---|
| `api.login` / Login UI | `POST` | `/api/auth/login` | `authController.js: login` | `SELECT` `users`, verify `password_hash` via Bcrypt | `CONNECTED` | Verified HTTP 200 on `state_admin` credentials |
| `api.getMe` / Navigation | `GET` | `/api/auth/me` | `authController.js: getCurrentUser` | `SELECT` `users` by JWT ID | `CONNECTED` | Verified JWT validation & active session check |
| `api.getSeedAccounts` | `GET` | `/api/auth/seed-accounts` | `authController.js: getSeedAccounts` | In-memory configuration | `CONNECTED` | Returns pre-populated login quick switcher |
| `api.getDistricts` / Command Center | `GET` | `/api/districts` | `districtController.js: getAllDistricts` | `SELECT` `districts` with derived metrics | `CONNECTED` | Returns 38 Tamil Nadu districts with Tripartite Scores |
| `api.getDistrictById` | `GET` | `/api/districts/:id` | `districtController.js: getDistrictById` | `SELECT` `districts` WHERE `id = ?` | `CONNECTED` | Returns detailed district profile & historical charts |
| `api.getEvents` / Event Table | `GET` | `/api/intelligence/events` | `intelligenceController.js: getEvents` | `SELECT` `intelligence_events` JOIN `provenance` | `CONNECTED` | Supports filtering by district, category, enforcement |
| `api.getWhatChanged` / State HUD | `GET` | `/api/intelligence/what-changed` | `backgroundIntelligenceService.js` | `SELECT` event delta past 7 days vs 30 days | `CONNECTED` | Computes dynamic 7-day velocity deltas |
| `api.getMapData` / GIS Map | `GET` | `/api/map/layers` | `mapController.js: getMapData` | `SELECT` `risk_zones`, `spatial_associations` | `CONNECTED` | Renders dynamic Leaflet risk polygons & corridors |
| `api.submitCitizenReport` | `POST` | `/api/citizen/report` | `citizenController.js: submitCitizenReport` | `INSERT` into `citizen_reports` | `CONNECTED` | Applies automated PII redaction and SHA-256 token |
| `api.trackCitizenReport` | `GET` | `/api/citizen/track/:token` | `citizenController.js: trackCitizenReport` | `SELECT` `citizen_reports` by tracking token | `CONNECTED` | Public tracking without exposing sensitive data |
| `api.getVerificationQueue` | `GET` | `/api/citizen/queue` | `citizenController.js: getVerificationQueue` | `SELECT` unverified `citizen_reports` | `CONNECTED` | Analysts inspect burst red-flags & duplicates |
| `api.triageCitizenReport` | `POST` | `/api/citizen/triage/:id` | `citizenController.js: triageCitizenReport` | `UPDATE` `citizen_reports` -> `intelligence_events` | `CONNECTED` | Promotes verified report to official signal |
| `api.feedUniversalIntelligence` | `POST` | `/api/ingest/universal` | `ingestionController.js: uploadUniversalFeed` | Text/OCR extraction + `INSERT` | `CONNECTED` | Ingests PDF/CSV/Excel, redacts PII, inserts DB |
| `api.getSpatialAssociations` | `GET` | `/api/spatial/associations` | `associationController.js` | `SELECT` `spatial_associations` | `CONNECTED` | Returns historical corridor sequences |
| `api.compareCorridors` | `GET` | `/api/spatial/compare` | `associationController.js` | `SELECT` corridor comparison | `CONNECTED` | Side-by-side historical corridor comparison |
| `api.getForecastZones` | `GET` | `/api/forecast/zones` | `forecastController.js: getForecastZones` | `SELECT` `forecast_records` | `CONNECTED` | Returns 30-day and 90-day AI risk predictions |
| `api.getRiskConfidenceMatrix` | `GET` | `/api/forecast/matrix` | `forecastController.js` | 2-Axis Risk vs Confidence matrix | `CONNECTED` | Aggregates risk level against evidence confidence |
| `CorroboratingSignals` | `GET` | `/api/fusion/district/:id` | `signalFusionEngine.js` | Corroborates Multi-source events | `CONNECTED` | Spatial-temporal clustering across sources |
| `ScenarioSimulator` | `POST` | `/api/simulation/preventive` | `scenarioSimulationEngine.js` | Calculates spatial policy displacement | `CONNECTED` | Dynamic velocity reduction & spillover modeling |
| `GenerateBriefing` | `GET` | `/api/briefing/generate` | `intelligenceBriefingService.js` | Compiles printable executive dossier | `CONNECTED` | Output signed with SHA-256 provenance hash |
| `IntelligenceNetworkGraph` | `GET` | `/api/graph/intelligence` | `networkGraphEngine.js` | Constructs relational force graph | `CONNECTED` | SVG graph synced bi-directionally with map |
| `Maritime Radar` | `GET` | `/api/maritime/intelligence` | `maritimeIntelligenceService.js` | Coastal risk nodes (1,076 km) | `CONNECTED` | Ingests port & Palk Strait country boat data |
| `NarvexAvatarCore` | `POST` | `/api/agent/command` | `narvexAgentService.js` | Intent parsing & tool dispatcher | `CONNECTED` | Maps Tamil/English speech to system actions |
| `Security Dashboard` | `GET` | `/api/security/dashboard` | `authController.js` | `SELECT` `security_events`, threat score | `CONNECTED` | SIEM incident stream & anomaly calculation |
| `Live Signal Stream` | `POST` | `/api/simulation/tick` | `simulationService.js: tickLiveSimulation` | Streams rows from `data/mock/*.csv` | `PARTIALLY_CONNECTED` | Connector required for live external feeds |

---

## 3. Disconnected or Orphaned Endpoints Identified

1. **Live External News API Connector**:
   - Status: `NOT LIVE / CONNECTOR REQUIRED`
   - Description: External live news fetching currently relies on simulated CSV streaming via `simulationService.js`. Production implementation requires connecting an external RSS or web search connector.
