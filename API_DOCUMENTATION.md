# NARC-INTEL (N-RISE) API Documentation

**Statewide Narcotic Intelligence & Preventive Risk Monitoring Platform**  
**State**: Tamil Nadu (38 Districts)  
**Database**: MySQL (`narvex`)  
**Base URL**: `http://localhost:5000/api`

---

## 1. Authentication & RBAC

### `POST /auth/login`
- **Body**: `{ "username": "state_admin", "password": "Admin@123" }`
- **Response**: JWT token and user profile including `roleKey`, `districtId`, and `badgeNumber`.

### `GET /auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Current authenticated user details.

### `GET /auth/seed-accounts`
- **Response**: Available demo accounts for quick role-switching (`STATE_ADMIN`, `DISTRICT_OFFICER`, `VERIFICATION_OFFICER`, `CITIZEN_REPORTER`).

---

## 2. Statewide & District Intelligence

### `GET /districts`
- **Query Params**: `sortBy` (`priority`, `alerts`, `emerging`, `recent_trend`, `alpha`), `riskLevel`, `search`
- **Response**: All 38 Tamil Nadu districts with dynamic counters derived from live database records.

### `GET /districts/:id`
- **Response**: Single district intelligence profile, taluks, police stations, checkposts, active alerts, and risk zones.

### `GET /intelligence/events`
- **Query Params**: `districtId`, `talukId`, `stationId`, `checkpostId`, `categoryId`, `sourceId`, `verificationStatus`, `isEnforcement`, `startDate`, `endDate`, `page`, `limit`, `search`
- **Response**: Filtered event ledger with pagination and joined metadata.

### `GET /intelligence/events/:id`
- **Response**: Event details + Complete Data Provenance record ("Why is this here?", raw SHA-256 payload hash, source file, row, reviewer signoff).

### `GET /intelligence/analytics`
- **Query Params**: `districtId`, `startDate`, `endDate`
- **Response**: Temporal trend, category distribution, source breakdown, verification breakdown, and enforcement vs risk signal ratio.

---

## 3. GIS Map Command Center

### `GET /map/layers`
- **Query Params**: `districtId`, `talukId`, `categoryId`, `sourceId`, `verificationStatus`, `riskLevel`, `startDate`, `endDate`
- **Response**: Unified vector data for Leaflet GIS map (Risk Indicator Zones, Emerging Zones, Spatial Associations, Enforcement Activity points, Raw Risk Signal points, Checkposts, Active Alerts, Citizen Tips).

---

## 4. Anonymous Citizen Reporting

### `POST /citizen/report`
- **Body**: `{ "approximateDistrictId": 2, "approximateLocation": "...", "categoryId": 4, "description": "...", "audioTranscript": "..." }`
- **Response**: Unique anonymous tracking token (e.g. `TN-7X9K-42PQ`), PII sanitization confirmation.

### `GET /citizen/track/:token`
- **Response**: Safe non-sensitive public lifecycle progress (`RECEIVED` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `CORROBORATED` $\rightarrow$ `REFERRED` $\rightarrow$ `CLOSED`).

### `GET /citizen/queue`
- **RBAC**: `STATE_ADMIN`, `DISTRICT_OFFICER`, `VERIFICATION_OFFICER`
- **Response**: Internal analyst verification queue with red flags (`POTENTIAL_DUPLICATE`, `COORDINATED_BURST`).

### `POST /citizen/triage/:id`
- **Body**: `{ "newStatus": "CORROBORATING", "reviewerNotes": "...", "promoteToEvent": true }`
- **Response**: Updates status, sets public message, optionally inserts into intelligence ledger with provenance.

---

## 5. Multi-Source Ingestion & Provenance

### `POST /ingest/preview`
- **Multipart Form**: `file` (CSV / XLSX)
- **Response**: Batch ID, detected headers, AI/Rule-based column mapping suggestions, row preview with PII scan.

### `POST /ingest/execute`
- **Body**: `{ "batchId": 1, "finalMapping": { ... }, "defaultDistrictId": 2, "defaultSourceId": 1 }`
- **Response**: Normalizes rows into `intelligence_events`, creates `event_provenance` records with SHA-256 hashes, logs to audit chain.

---

## 6. Spatial-Temporal & Historical Corridors

### `GET /spatial/associations`
- **Query Params**: `districtId`, `minObservations`
- **Response**: District-to-district historical corridors with observation weights and coordinates.

### `GET /spatial/compare?id1=1&id2=2`
- **Response**: Comparative analysis between two historical transport corridors.

---

## 7. Predictive Risk Forecast & Governance

### `GET /forecast/zones`
- **Query Params**: `districtId`, `windowDays` (7, 30, 90)
- **Response**: Forecasted preventive attention zones with model version (`NRISE-RISK-v1.0`), uncertainty, and contributing factors.

### `GET /forecast/matrix`
- **Response**: 4-quadrant 2-Axis Risk vs Confidence matrix dataset.

### `GET /governance/metrics`
- **Response**: Regional coverage disparity (urban vs rural), reviewer decisions vs AI suggestions, active threshold configuration.

### `POST /governance/thresholds`
- **RBAC**: `STATE_ADMIN`
- **Body**: `{ "watchThreshold": 5, "risingThreshold": 12, "highThreshold": 25, "minConfidenceForHigh": 70 }`
- **Response**: Updates active threshold version and logs to audit chain.

---

## 8. Alert Center & Action Tickets

### `GET /alerts`
- **Response**: Active state and district alerts.

### `POST /actions/tickets`
- **Body**: `{ "alertId": 1, "assignedDepartment": "...", "priority": "HIGH", "actionType": "...", "operationalNotes": "..." }`
- **Response**: Dispatches preventive action ticket.

### `GET /actions/tickets`
- **Response**: Action ticket ledger.

### `PATCH /actions/tickets/:id`
- **Body**: `{ "verificationStatus": "ACTION_TAKEN", "outcomeType": "...", "outcomeNotes": "..." }`
- **Response**: Updates ticket status and records outcome.

---

## 9. SHA-256 Cryptographic Hash-Chain Audit

### `GET /audit/logs`
- **Response**: Sequential cryptographic audit log entries.

### `GET /audit/verify-chain`
- **Response**: Real-time mathematical verification of SHA-256 hash-chain integrity from genesis block to current tip.
