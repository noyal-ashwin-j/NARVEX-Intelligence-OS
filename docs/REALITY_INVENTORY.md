# NARVEX System Reality Inventory

This document presents an empirical, codebase-verified inventory of all features in the NARVEX Intelligence OS.

| Feature / Subsystem | Status | Actual File | Evidence & Provenance | Dependencies | Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MySQL Database Source of Truth** | ✅ **REAL** | `server/database/db.js` | 6,502 events, 38 districts, 6,973 route observations in MySQL. | MySQL pool, `mysql2/promise` | Active |
| **Multi-Scope MapArc Rendering** | ✅ **REAL** | `client/src/components/map/Interactive3DGlobeMap.jsx` | 16 World, 15 India, 57 Tamil Nadu database-derived arcs. | MapLibre GL JS, MapCN MapArc | Active |
| **Transport Mode Filters** | ✅ **REAL** | `server/controllers/associationController.js` | Direct SQL `transport_mode` filtering (`AIR`, `MARITIME`, `ROAD`, `RAIL`). | MySQL `route_intelligence` | Active |
| **First-Time Signal Detection** | ✅ **REAL** | `server/intelligence/featureEngineeringEngine.js` | Flags unverified localities with `FIRST_TIME_SIGNAL` & `INSUFFICIENT_DATA`. | `intelligence_alerts` table | Active |
| **Case Bundle Ingestion Engine** | ✅ **REAL** | `server/controllers/ingestionController.js` | Parses PDF/CSV/XLSX case bundles, hashes documents (SHA-256), extracts events. | `pdf-parse`, `xlsx`, `csv-parser` | Active |
| **Logistic Ridge Forecast Engine** | ✅ **REAL** | `server/ai/forecastInferenceEngine.js` | Registered model `NARVEX_STATISTICAL_RIDGE_V1.0` in `model_registry`. | `model_features` table | Active |
| **SHA-256 Cryptographic Audit Chain** | ✅ **REAL** | `server/services/hashChainService.js` | Append-only block hash chain (`hash_n = SHA256(hash_n-1 + payload_n)`). | `audit_hash_chain` table | Active |
| **Zero-Trust RBAC Scoping** | ✅ **REAL** | `server/middleware/authMiddleware.js` | Blocks District Officer from querying unauthorized district intelligence (403). | Express JWT middleware | Active |
| **Real-Time SSE Event Stream** | ✅ **REAL** | `server/services/realtimeIntelligenceService.js` | Broadcasts live database events to frontend maps & counters. | Express SSE response stream | Active |
| **NARVEX Central AI Agent** | ✅ **REAL** | `server/controllers/assistantController.js` | Queries MySQL tools (`searchCases`, `getCorridors`, `getForecast`) dynamically. | Backend tool registry | Active |
| **Computer Vision Webcam Gestures** | 🟡 **ADAPTER_READY** | `client/src/components/control/WebcamAdapter.jsx` | Interface boundary declared (`WEBCAM_ADAPTER_READY`). | MediaDevices API | Interface Ready |
| **External Live Government APIs** | 🟡 **ADAPTER_READY** | `server/services/externalFeedAdapter.js` | Pluggable source registry (`ADAPTER_NOT_CONNECTED` when offline). | External HTTP client | Interface Ready |
