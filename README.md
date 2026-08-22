# 🛡️ NARVEX — State-Level Narcotic Intelligence & Preventive Decision-Support Platform

> **Smart India Hackathon (SIH 2026)**  
> **Author & Lead Architect**: **Noyal Ashwin J**  
> **Team / Unit**: **VBE Coding**  
> **Repository**: [https://github.com/noyal-ashwin-j/NARVEX-Intelligence-OS](https://github.com/noyal-ashwin-j/NARVEX-Intelligence-OS)

---

```text
               ┌─────────────────────────────────────────────────────────┐
               │                 NARVEX INTELLIGENCE OS                  │
               │   State-Level Anti-Narcotic Preventive Command System   │
               └────────────────────────────┬────────────────────────────┘
                                            │
    ┌───────────────────────────────────────┼───────────────────────────────────────┐
    ▼                                       ▼                                       ▼
+-----------------------+       +-----------------------+       +-----------------------+
| 1. EVIDENCE ENGINE    |       | 2. SPATIAL CORRIDORS  |       | 3. DECISION SUPPORT   |
| Raw Ingestion (PDF/   |       | Multi-Scope MapCN     |       | Statistical Ridge     |
| CSV/XLSX), SHA-256    | ────➔ | (World, India, TN),   | ────➔ | Forecasts, "WHY"      |
| Document Hashing,     |       | Emerging Zone Engine  |       | Evidence Panels,      |
| MySQL Source of Truth |       | & Waterbed Shift Check|       | NARVEX AI Assistant   |
+-----------------------+       +-----------------------+       +-----------------------+
```

---

## 📋 Table of Contents
1. [Problem Statement](#-1-problem-statement)
2. [The NARVEX Solution](#-2-the-narvex-solution)
3. [Key Implemented Features](#-3-key-implemented-features)
4. [5 Advanced Strategic Modules (NARVEX 2.0)](#-4-5-advanced-strategic-modules-narvex-20)
5. [Future Engineering Roadmap](#-5-future-engineering-roadmap)
6. [System Architecture & Data Flow](#-6-system-architecture--data-flow)
7. [Step-by-Step Installation & Setup Guide](#-7-step-by-step-installation--setup-guide)
8. [Automated Verification & Test Suites](#-8-automated-verification--test-suites)
9. [Author & Credit Information](#-9-author--credit-information)

---

## 🎯 1. Problem Statement

Drug law enforcement across India faces three critical systemic bottlenecks:

1. **Reactive vs. Preventive Operation**: Traditional policing acts *after* seizures occur, counting arrests instead of intervening *before* smuggling corridors accelerate.
2. **Observational Bias (Over-Policed vs. Unmonitored Dark Zones)**: High arrest counts in urban centers reflect high police vigilance, not necessarily exclusive drug prevalence. Quiet rural border checkposts with low enforcement presence can carry unintercepted traffic while appearing "safe" on basic charts.
3. **Fragmented Agency Silos**: Police FIRs, NCB seizures, customs logs, railway parcel telemetry, and hospital overdose reports exist in disconnected databases, preventing cross-agency signal correlation.

---

## 💡 2. The NARVEX Solution

**NARVEX** (*Tamil Nadu State-Level Narcotic Intelligence & Preventive Decision-Support Platform*) transforms narcotic policing into a **database-driven, spatial-temporal operating system**.

### The Core Vision Loop:
$$\text{Raw Evidence} \xrightarrow{\text{Ingest}} \text{MySQL Database} \xrightarrow{\text{Feature Engine}} \text{Spatial Corridors} \xrightarrow{\text{Forecast Model}} \text{MapCN Map} \xrightarrow{\text{NARVEX Agent}} \text{Preventive Action}$$

- **100% Database-Driven**: Zero hardcoded route arrays, fake risk scores, or static AI responses. All metrics originate dynamically from MySQL (`narvex`).
- **Cryptographic Audit Ledger**: Append-only SHA-256 block hash chain (`audit_hash_chain`) securing data lineage.
- **Human-in-the-Loop Safeguard**: Automated early-warning alerts require human officer verification before generating preventive action tickets.

---

## ⚡ 3. Key Implemented Features

### A. 🌐 MapCN Multi-Scope Spatial Architecture
- **World Scope (`WORLD`)**: Renders 16 international cross-border flight & maritime cargo lanes to Tamil Nadu on a 3D Globe projection.
- **India Scope (`INDIA`)**: Renders 15 inter-state national corridors connecting Maharashtra, Delhi, Kerala, Karnataka, Andhra Pradesh, West Bengal, and Gujarat.
- **Tamil Nadu Scope (`TAMILNADU`)**: Renders 57 inter-district tactical arcs connecting all 38 Tamil Nadu districts.
- **Visual Distinction**:
  - `HISTORICAL_OBSERVED`: **Solid Line** ($\ge 3$ verified events).
  - `EMERGING`: **Solid Vibrant Line** (Accelerating recent velocity).
  - `FORECAST`: **Dashed Glowing Line** (`paint: { "line-dasharray": [2, 2] }`) projecting future risk corridors.

### B. 🎯 Observational Bias Correction & Emerging-Zone Engine
- Computes separate mathematical dimensions: `observed_activity`, `enforcement_intensity`, `source_coverage`, `community_signal`, `data_gap`, `confidence`.
- **Core Principle**: Zero observations $\rightarrow$ `INSUFFICIENT_DATA` / `NEEDS_VERIFICATION` (NOT low risk!).
- **Dynamic States**: `STABLE`, `WATCH`, `EMERGING`, `HIGH PREVENTIVE ATTENTION`, `INSUFFICIENT_DATA`.

### C. 🌊 Waterbed Effect Corridor Substitution Shift Check
- Automatically detects when police intervention on Corridor A causes smuggling syndicates to reroute through connected Corridor B:
  $$\Delta A = \text{recent}_A - \text{baseline}_A < -0.20 \quad \text{AND} \quad \Delta B = \text{recent}_B - \text{baseline}_B > +0.20$$
- Triggers high-priority UI alert: `⚡ POTENTIAL CORRIDOR SHIFT — NEEDS VERIFICATION (Hosur ➔ Salem)`.

### D. 📷 Webcam Gesture Access Control (`WebcamAdapter.jsx`)
- Uses HTML5 MediaDevices (`navigator.mediaDevices.getUserMedia`) for hand gesture navigation:
  - `👋 Swipe Left`: Switches scope to **`WORLD`**
  - `👉 Swipe Right`: Switches scope to **`INDIA`**
  - `👌 Pinch`: Switches scope to **`TAMIL NADU`**

### E. 🎙️ WebSpeech Voice Access Assistant (`NarvexAvatarCore.jsx`)
- Integrated speech recognition (`window.SpeechRecognition`) and text-to-speech voice synthesis in English & Tanglish.
- Queries MySQL database tools dynamically to answer: *"Why did Coimbatore become an emerging attention zone?"*

---

## 🚀 4. 5 Advanced Strategic Modules (NARVEX 2.0)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NARVEX 2.0 STRATEGIC MODULES                          │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ 1. CARTEL GRAPH   │ 2. ANPR TELEMETRY │ 3. PRECURSORS     │ 4. DARKNET/UPI  │
│ Palantir-Style    │ FASTag Toll Match │ Pharmacy Leak Track│ Telegram Drops  │
└───────────────────┴───────────────────┴───────────────────┴─────────────────┘
```

1. **👥 Offender & Cartel Entity Link Graph (`NIDAAN`/`Palantir` Style)**:
   - Node-edge network graph mapping `Cartels ➔ Accused Offenders ➔ Transport Vehicles ➔ Seaports ➔ Prison Visitors`.
2. **🚘 FASTag & ANPR Border Checkpost Telemetry Stream**:
   - Live vehicle registration plate passing telemetry across 14 state border checkposts (Zuzuvadi, Walayar, Kaliyakavallai, Serakuppam).
3. **🧪 Pharmaceutical Precursor Diversion Tracking**:
   - Batch leak tracking for Schedule H1 opioids (Codeine, Tramadol, Alprazolam).
4. **📲 Darknet, Telegram & Micro-Financial UPI Signals**:
   - Rapid UPI QR payment spikes & Telegram bot drop-shipping channels.
5. **🧪 Wastewater Sewage Epidemiology Metrics (EMCDDA Model)**:
   - Chemical metabolite concentrations (mg/1000 people/day per taluk) for independent consumption measurement.

---

## 🔮 5. Future Engineering Roadmap

| Feature Domain | Future Upgrade | Architectural Purpose |
| :--- | :--- | :--- |
| **Ground Geometry** | **OSRM Highway Topography Overlay** | Render physical road lines (NH-44, NH-544) underneath MapCN curved arcs. |
| **Multi-Hop AI** | **Spatial-Temporal Graph Neural Networks (ST-GNN)** | Model multi-hop supply chain disruptions across 3+ state hops. |
| **High-Volume Telemetry** | **PostgreSQL + PostGIS / TimescaleDB** | Spatial vector indexing (`GEOMETRY(Point, 4326)`) for millions of GPS vehicle logs. |
| **Document Ingestion** | **Gemini Multilingual FIR OCR** | Multilingual Tamil/English police FIR document entity extraction. |

---

## 🏗️ 6. System Architecture & Data Flow

```text
RAW CASE BUNDLE / SEIZURE FACT
              │
              ▼
   DOCUMENT INGESTION + OCR
              │
              ▼
  MYSQL DATABASE (narvex)
   ├── districts (38)
   ├── intelligence_events (6,502)
   ├── event_provenance (6,510)
   ├── route_observations (6,973)
   ├── route_intelligence (88)
   └── audit_hash_chain (300+)
              │
              ├───────────────────────────────┐
              ▼                               ▼
FEATURE ENGINEERING ENGINE           FORECAST RIDGE MODEL
 (7d/30d/90d Velocity & Bias)      (NARVEX_STATISTICAL_RIDGE_V1.0)
              │                               │
              └───────────────┬───────────────┘
                              ▼
                 MapCN INTERACTIVE MAPS & UI
                  ├── 🌐 World 3D Globe
                  ├── 🧭 India Mercator Map
                  ├── 📍 38-District Grid
                  ├── 📷 Webcam Gesture Adapter
                  └── 🎙️ Voice Assistant Copilot
```

---

## 💻 7. Step-by-Step Installation & Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MySQL Server**: v8.0 or higher
- **Git**

### Step 1: Clone the Repository
```bash
git clone https://github.com/noyal-ashwin-j/NARVEX-Intelligence-OS.git
cd NARVEX-Intelligence-OS
```

### Step 2: Configure MySQL Database
Create database `narvex` in MySQL and configure environment variables in `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=narvex
JWT_SECRET=narvex_sovereign_secret_key_2026
```

### Step 3: Install Server Dependencies & Seed Database
```bash
cd server
npm install
npm run db:setup
```

### Step 4: Install Client Dependencies
```bash
cd ../client
npm install
```

### Step 5: Launch the Application
Open two terminal windows:

**Terminal 1 (Express Backend Server - Port 5000)**:
```bash
cd server
npm start
```

**Terminal 2 (Vite Command Center Client - Port 5173)**:
```bash
cd client
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 🧪 8. Automated Verification & Test Suites

NARVEX includes 6 automated test suites:

```bash
# 1. Run Master Full System Audit Suite
node server/testFullSystemCoreVisionMasterSuite.js

# 2. Run End-to-End Real Scenario Validation Suite
node server/testEndToEndScenarioValidationSuite.js

# 3. Run Database-Driven MapArc Suite
node server/testDatabaseDrivenMapArcSuite.js

# 4. Run Server Core Unit Tests
npm test --prefix server

# 5. Build Client Production Bundle
npm run build --prefix client
```

### Verification Output:
```text
================================================================
🏁 MASTER AUDIT VERIFICATION SUMMARY
================================================================
✅ Section 1. CORE-VISION: 6,510 raw observations in MySQL
✅ Section 2. DB-SOURCE-OF-TRUTH: 38 Tamil Nadu districts loaded dynamically
✅ Section 3. SCOPE-WORLD: 16 international cross-border arcs
✅ Section 3. SCOPE-INDIA: 15 inter-state national arcs
✅ Section 3. SCOPE-TN: 57 inter-district tactical arcs
✅ Section 5. SHA256-AUDIT-CHAIN: 300+ blocks 100% valid
✅ Section 6. ZERO-HARDCODING-SCAN: 0 hardcoded route arrays in frontend
✅ Section 7. REAL MUTATION TEST: Insert ➔ Derive ➔ Delete ➔ Revert verified
```

---

## 👨‍💻 9. Author & Credit Information

```text
================================================================
🏆 AUTHOR & LEAD ARCHITECT
================================================================
• Lead Architect:  Noyal Ashwin J
• Development Unit: VBE Coding
• Project:         NARVEX Intelligence OS (SIH 2026)
• Repository:      https://github.com/noyal-ashwin-j/NARVEX-Intelligence-OS
================================================================
```

*Built with passion and commitment for the Government of Tamil Nadu Anti-Narcotics Mission & Smart India Hackathon 2026.*
