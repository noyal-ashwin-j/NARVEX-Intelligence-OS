# 🛡️ NARVEX — Sovereign System Architecture & Technical Specification

> **Smart India Hackathon (SIH 2026)**  
> **Author & Lead Architect**: **Noyal Ashwin J**  
> **Team / Unit**: **VBE Coding**  
> **Repository**: [https://github.com/noyal-ashwin-j/NARVEX-Intelligence-OS](https://github.com/noyal-ashwin-j/NARVEX-Intelligence-OS)

---

## 🏛️ 1. Sovereign Enterprise Architecture

```text
               ┌─────────────────────────────────────────────────────────┐
               │                 NARVEX INTELLIGENCE OS                  │
               │   Java Sovereign Core + Python ML + JS MapCN Dashboard  │
               └────────────────────────────┬────────────────────────────┘
                                            │
    ┌───────────────────────────────────────┼───────────────────────────────────────┐
    ▼                                       ▼                                       ▼
+-----------------------+       +-----------------------+       +-----------------------+
| 1. JAVA CORE ENGINE   |       | 2. PYTHON ML ENGINE   |       | 3. JS MAPCN DASHBOARD |
| SHA-256 Block Chain,  | ────➔ | Ridge Forecasting,    | ────➔ | World/India/TN 3D     |
| Tripartite Risk Math, |       | Observational Bias ML,|       | MapCN Layers, Voice & |
| Sovereign Ledger      |       | Waterbed Shift Check  |       | Webcam Control        |
+-----------------------+       +-----------------------+       +-----------------------+
```

---

## 🗄️ 2. Database Schema & Data Lineage

NARVEX enforces a strict 100% MySQL source of truth.

### Key Database Tables:
- **`districts`**: 38 Tamil Nadu districts with baseline population, coordinates, and live risk badges.
- **`intelligence_events`**: 6,500+ raw seizure and community observation records.
- **`event_provenance`**: Document ingestion metadata, source department, extraction confidence, and SHA-256 block hash.
- **`route_observations`**: 6,900+ raw spatial movement observations.
- **`route_intelligence`**: 88 derived spatial transport corridors across `WORLD`, `INDIA`, and `TAMIL NADU` scopes.
- **`audit_hash_chain`**: Append-only cryptographic SHA-256 ledger.

---

## 🔐 3. Security, Authorization & Threat Model

- **Zero-Trust Role-Based Access Control (RBAC)**:
  - `STATE_ADMIN`: Full statewide visibility across all 38 districts.
  - `DISTRICT_OFFICER`: Strictly scoped to their single assigned district (`enforceDistrictScope`).
- **Cryptographic Audit Ledger**: Every intelligence record is hashed into a SHA-256 block chain (`verifyChainIntegrity()`).
- **Bias Prevention Safeguard**: Enforcement seizures and community risk signals are kept mathematically separate.

---

## 🚀 4. Advanced Strategic Modules (NARVEX 2.0)

1. **Cartel & Offender Link Graph**: Interactive node-edge network graph (`Cartels ➔ Accused ➔ Vehicles ➔ Prison Logs`).
2. **ANPR Border Checkpost Telemetry**: Real-time vehicle registration plate passing telemetry.
3. **Pharmaceutical Precursor Leak Engine**: Schedule H1 opioid wholesale batch tracking.
4. **Darknet & UPI Micro-Financial Signals**: Rapid QR payment spikes & Telegram drop bot channels.
5. **Wastewater Sewage Epidemiology (EMCDDA Model)**: Chemical metabolite sampling (mg/1000 people/day per taluk).

---

## 👨‍💻 5. Authorship & Project Credits

- **Author & Lead Architect**: **Noyal Ashwin J**
- **Team / Unit**: **VBE Coding**
- **Repository**: [https://github.com/noyal-ashwin-j/NARVEX-Intelligence-OS](https://github.com/noyal-ashwin-j/NARVEX-Intelligence-OS)
