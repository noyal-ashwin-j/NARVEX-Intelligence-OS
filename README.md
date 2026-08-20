# NARC-INTEL (N-RISE)
### Statewide Narcotic Intelligence & Preventive Risk Monitoring Platform
**Target Jurisdiction**: State of Tamil Nadu (All 38 Districts)  
**Prototype Scope**: Smart India Hackathon (SIH) Full Working Demonstration  
**Target Database**: MySQL (`USE narvex;`)

---

## 1. System Overview & Core Objective

**NARC-INTEL (N-RISE)** is a government-style statewide intelligence, data audit, spatial visualization, risk monitoring, and early-warning preventive decision-support platform for Tamil Nadu.

### What the Platform Does:
1. **Aggregates Multi-Source Signals**: Combines historical and present signals from Police Stations, Interstate Checkposts, Anonymous Citizen tips, State Helpline (1058), Special Task Forces, and Healthcare aggregates.
2. **Tripartite Safeguard**: Displays **Observed Risk**, **Evidence Confidence**, and **Data Coverage** as **three independent values** — never collapsed into one number.
3. **Layer Separation**: Separates *Enforcement Activity* (seizures, arrests) from *Risk Signals* (community concerns) to avoid over-policed feedback loops.
4. **Complete Provenance**: Every signal, marker, and zone traces to original Source Dept, File/Row ID, Timestamp, AI Extraction Confidence, and Reviewing Officer ("Why is this here?").
5. **Human-in-the-Loop**: AI output serves solely as a *Preventive Attention Priority* suggestion. All real actions require an authorized officer and are logged to an append-only SHA-256 cryptographic audit chain.

---

## 2. Completed Phases (Phases 1 — 8 Full Scope)

| Phase | Module | Completion Status | Key Features |
|---|---|---|---|
| **Phase 1** | Foundation & RBAC | ✅ **100% Complete** | `NRISE_DATABASE.sql` with all 38 districts, JWT auth, RBAC middleware, 4 core roles, automated test suite (`npm test`). |
| **Phase 2** | Statewide Command Center & District Intel | ✅ **100% Complete** | Statewide overview, sortable 38-district priority grid, district page with Tripartite Score and charts before map. |
| **Phase 3** | Interactive GIS Intelligence Map | ✅ **100% Complete** | Leaflet GIS with Dark/Light command center layers, dynamic radius risk zones, active alert overlays, zone inspector. |
| **Phase 4** | Anonymous Citizen Reporting & Queue | ✅ **100% Complete** | Public portal (Tamil/English/voice), PII scrubber, tracking token generator (`TN-7X9K-42PQ`), safe public status tracker, analyst triage queue with duplicate/burst red flags. |
| **Phase 5** | Multi-Source Ingestion & Provenance | ✅ **100% Complete** | Drag-drop CSV/Excel parser, AI/Rule column mapping, PII scan, duplicate match check, automatic SHA-256 provenance generation. |
| **Phase 6** | Spatial-Temporal & Historical Associations | ✅ **100% Complete** | District-to-district historical corridors, corridor comparison tool, emerging zone lifecycle state machine. |
| **Phase 7** | Predictive Risk Forecast & Governance | ✅ **100% Complete** | Experimental 30/90-day forecast zones, 2-axis risk vs confidence matrix, urban/rural coverage disparity monitor, transparent threshold editor. |
| **Phase 8** | Action Tickets & Audit Hash-Chain | ✅ **100% Complete** | Alert $\rightarrow$ Action ticket dispatch, intervention outcome logging, SHA-256 cryptographic chain explorer with integrity validator. |

---

## 3. Demo Login Credentials

All seed accounts use the default password: **`Admin@123`**

| Role | Username | Full Name | Jurisdiction / Scope |
|---|---|---|---|
| **State Admin** | `state_admin` | Dr. S. K. Ramanathan, IPS | Full Statewide Oversight, Policy Thresholds, Governance |
| **District Officer** | `district_cbe` | M. Anbarasu, DSP | Coimbatore District Intelligence Unit |
| **Verification Officer** | `analyst_priya` | Priya Soundararajan | State Risk Triage Wing, Verification Queue, Ingestion |
| **Citizen Reporter** | `citizen_demo` | Demo Public Account | Anonymous Tip Submission & Public Token Tracker |

*(Note: The UI also includes a quick one-click role switcher in the top navigation bar).*

---

## 4. Getting Started & Installation

### Prerequisites
- Node.js v18+ or v20+ / v24+
- MySQL 8.0 running on localhost with database `narvex`

### Step 1: Database Setup
The database schema and seeds are in `server/database/NRISE_DATABASE.sql`.
Run against `narvex`:
```bash
mysql -u root -p narvex < server/database/NRISE_DATABASE.sql
```

### Step 2: Environment Configuration
Check `server/.env`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=narvex
JWT_SECRET=nrise_state_intel_secure_jwt_key_2026_tamilnadu
ANTHROPIC_API_KEY=
```

### Step 3: Run Backend Test Suite
```bash
npm test
```
*Expected: 14/14 tests pass (DB connectivity, all 38 districts, RBAC guards, PII redactor, SHA-256 chain integrity).*

### Step 4: Launch Backend & Frontend Servers
In terminal 1 (Backend):
```bash
npm run server
```
In terminal 2 (Frontend):
```bash
npm run client
```

Open browser at: **`http://localhost:5173`**

---

## 5. Recommended Live Demo Script (Walkthrough)

1. **State Command Center**: Log in as `state_admin`. Observe statewide KPI counters, Tamil Nadu 38-district priority grid, and dynamic sorting by Preventive Priority or Emerging Risk.
2. **District Intelligence Deep-Dive**: Click **Coimbatore (CBE)** or **Tenkasi (TSI)**. Notice the Tripartite Score (`Risk`, `Confidence`, `Coverage`), charts rendered *before* the map, and the synchronized filter drawer.
3. **Tactical GIS Command Map**: Open the Tactical GIS Map tab. Toggle the *Enforcement Activity* vs *Raw Risk Signals* layers. Click a Risk Zone to open the Zone Inspector.
4. **Data Provenance ("Why is this here?")**: In any event table or map popup, click **"Inspect Provenance"** to view the source file name, row number, raw SHA-256 payload hash, and reviewing officer signoff.
5. **Anonymous Citizen Tip & Status Tracker**: Navigate to Citizen Portal. Submit a concern with landmark info. Copy the generated tracking token (e.g. `TN-7X9K-42PQ`). Go to Anonymous Token Lookup and verify stage progression.
6. **Analyst Verification Queue**: Log in as `analyst_priya`. Open Verification Queue. Inspect automated red-flag detections (duplicates / bursts). Triage the report and promote it to an official intelligence signal.
7. **Spreadsheet Ingestion**: Open Data Ingestion. Drag-and-drop `sample_checkpost_ingestion.csv`. Review the AI/Rule column mapping, observe PII redaction, and execute batch ingestion.
8. **Spatial-Temporal Corridors**: Open Spatial-Temporal tab. Inspect the *Krishnagiri $\rightarrow$ Salem $\rightarrow$ Coimbatore* corridor and use the Corridor Comparison tool.
9. **Responsible AI Governance**: Open Forecast & Responsible AI tab. View the 2-Axis Risk vs Confidence matrix and adjust versioned policy thresholds.
10. **SHA-256 Audit Trail**: Open SHA-256 Audit Trail tab. Click **"Verify Full Chain Integrity"** to see live mathematical recomputation of block hashes from genesis to current tip.

---

## 6. Responsible AI & Legal Safeguards Summary

- **LOW REPORTING $\neq$ LOW RISK**: Sparse areas display **"INSUFFICIENT DATA"**, preventing under-monitored regions from being falsely labeled safe.
- **HIGH ENFORCEMENT $\neq$ HIGH DRUG RISK**: Enforcement seizures are isolated to prevent over-policing bias feedback loops.
- **NO DEMOGRAPHIC PROFILING**: Zero storage or inference of individual identities or demographic profiling.
- **DECISION SUPPORT ONLY**: Forecasts and alerts represent preventive attention priorities; they never independently authorize enforcement or accusation without human verification.
