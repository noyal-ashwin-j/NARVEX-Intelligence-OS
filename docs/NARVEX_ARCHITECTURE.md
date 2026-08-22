# NARVEX System Architecture Specification

---

## 1. High-Level Architecture Overview

```text
+-----------------------------------------------------------------------+
|                         CLIENT LAYER (Vite + React)                  |
|  Interactive3DGlobeMap  |  HierarchicalMap  |  NARVEX AI Assistant    |
+-----------------------------------------------------------------------+
                                   ▲
                                   │ HTTP REST / SSE Stream
                                   ▼
+-----------------------------------------------------------------------+
|                      EXPRESS BACKEND SERVER (Node.js)                 |
|  /api/map/arcs   |   /api/spatial/routes   |   /api/assistant/chat  |
|  authMiddleware  |   rbocMiddleware        |   hashChainService     |
+-----------------------------------------------------------------------+
                                   ▲
                                   │ Feature & Aggregation Engines
                                   ▼
+-----------------------------------------------------------------------+
|                      INTELLIGENCE & FORECAST ENGINES                  |
|  featureEngineering  |  routeAggregation  |  forecastInferenceEngine  |
+-----------------------------------------------------------------------+
                                   ▲
                                   │ Connection Pool (mysql2)
                                   ▼
+-----------------------------------------------------------------------+
|                         MYSQL DATABASE LAYER                          |
|  event_provenance  |  route_observations  |  route_intelligence   |
|  model_features    |  forecast_records    |  audit_hash_chain     |
+-----------------------------------------------------------------------+
```

---

## 2. Component Breakdown

1. **Client Layer**: Built with React, Tailwind CSS, MapLibre GL JS, MapCN (`MapArc`, `MapMarker`, `MarkerLabel`, `MapPopup`, `MapGeoJSON`).
2. **Backend Express API Layer**: Provides secure REST endpoints with JWT authentication and Zero-Trust RBAC district scope checks.
3. **Intelligence Derivation Layer**: Processes raw spatial-temporal observations into derived corridors and statistical risk forecasts.
4. **Data Persistence Layer**: MySQL database storing canonical geographical entities, evidence provenance, and immutable SHA-256 audit blocks.
