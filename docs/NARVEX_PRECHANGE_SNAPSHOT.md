# NARVEX Pre-Change System Snapshot

This document records the exact state of the NARVEX repository, entry points, packages, database connections, and test suites prior to making any system hardening edits.

---

## 1. Environment & Package Metadata

| Property | Verified Value |
| :--- | :--- |
| **Operating System** | Windows |
| **Node.js Runtime** | Node.js v24.16.0 |
| **Database Engine** | MySQL 8.0 / MariaDB on Port 3306 (`database: narvex`) |
| **Client Framework** | Vite v5.4.21 + React 18 |
| **Map Rendering Engine** | MapLibre GL JS v4.7.1 + MapCN Component Architecture |
| **Server Entry Point** | `server/server.js` |
| **Client Entry Point** | `client/src/main.jsx` |
| **Server Environment Variables** | `PORT=5000`, `DB_HOST=localhost`, `DB_USER=root`, `DB_NAME=narvex`, `JWT_SECRET=...` |

---

## 2. Empirical Database Snapshot (Verified via `testEmpiricalDbCounts.js`)

```text
================================================================
📊 EMPIRICAL MYSQL TABLE COUNTS (EVIDENCE PROOF)
================================================================

CLAIM: Table 'districts' contains data.
EVIDENCE: COUNT(*) = 38
SOURCE: MySQL database 'narvex'

CLAIM: Table 'intelligence_events' contains data.
EVIDENCE: COUNT(*) = 6502
SOURCE: MySQL database 'narvex'

CLAIM: Table 'event_provenance' contains data.
EVIDENCE: COUNT(*) = 6510
SOURCE: MySQL database 'narvex'

CLAIM: Table 'route_observations' contains data.
EVIDENCE: COUNT(*) = 6973
SOURCE: MySQL database 'narvex'

CLAIM: Table 'route_intelligence' contains data.
EVIDENCE: COUNT(*) = 88
SOURCE: MySQL database 'narvex'

CLAIM: Table 'model_features' contains data.
EVIDENCE: COUNT(*) = 76
SOURCE: MySQL database 'narvex'

CLAIM: Table 'forecast_records' contains data.
EVIDENCE: COUNT(*) = 21
SOURCE: MySQL database 'narvex'

CLAIM: Table 'intelligence_alerts' contains data.
EVIDENCE: COUNT(*) = 0
SOURCE: MySQL database 'narvex'

CLAIM: Table 'audit_hash_chain' contains data.
EVIDENCE: COUNT(*) = 255
SOURCE: MySQL database 'narvex'

CLAIM: Table 'model_registry' contains data.
EVIDENCE: COUNT(*) = 1
SOURCE: MySQL database 'narvex'

CLAIM: Table 'users' contains data.
EVIDENCE: COUNT(*) = 9
SOURCE: MySQL database 'narvex'

CLAIM: Table 'user_sessions' contains data.
EVIDENCE: COUNT(*) = 22
SOURCE: MySQL database 'narvex'
```

---

## 3. Git Status & Directory Snapshot

- **Branch**: `master`
- **Key Modules**:
  - `server/controllers/associationController.js` (Route MapArc API)
  - `server/controllers/ingestionController.js` (Case Bundle Ingestion API)
  - `server/ai/forecastInferenceEngine.js` (Logistic Ridge Model V1.0)
  - `server/services/hashChainService.js` (SHA-256 Audit Chain)
  - `client/src/components/map/Interactive3DGlobeMap.jsx` (MapCN MapArc Visualization)
