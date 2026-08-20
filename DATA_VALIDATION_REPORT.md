# NARVEX — Data Validation & Integrity Report
**Generated On:** August 20, 2026  
**Target Path:** `/data/datasets/`  
**Datasets Validated:** 24 CSV files  

---

## 1. Executive Summary
- **All 38 Tamil Nadu Districts Represented**: **Yes (100% Coverage)**
- **Event Datasets Volume**: **1,000+ records in all 19 signal/event/time-series files**
- **Foreign Key Consistency**: **100% Valid (Zero orphan taluks, localities, alerts, or tickets)**
- **PII Redaction Check**: **Zero raw phone numbers, Aadhaar IDs, or real names exposed**
- **Cryptographic Lineage**: **1,500 SHA-256 integrity hash blocks verified**

---

## 2. District Coverage & Representation Matrix

| District Code | District Name | Taluks Count | Localities Count | Ingested Signals (24M) | Baseline Velocity | Risk Classification | Data Coverage Flag |
|---|---|---|---|---|---|---|---|
| **CHN** | Chennai | 5 | 15 | 892 | 3.50x | `HIGH PREVENTIVE ATTENTION` | `GOOD` |
| **CBE** | Coimbatore | 5 | 15 | 1,120 | 6.00x | `HIGH PREVENTIVE ATTENTION` | `GOOD` |
| **MDU** | Madurai | 5 | 15 | 640 | 2.10x | `INCREASING` | `GOOD` |
| **SLM** | Salem | 5 | 15 | 710 | 2.40x | `INCREASING` | `GOOD` |
| **TRY** | Tiruchirappalli | 5 | 15 | 450 | 1.10x | `WATCH` | `GOOD` |
| **TNI** | Tirunelveli | 5 | 15 | 390 | 1.00x | `WATCH` | `MODERATE` |
| **ERD** | Erode | 5 | 15 | 480 | 1.20x | `WATCH` | `GOOD` |
| **TPR** | Tiruppur | 5 | 15 | 760 | 2.80x | `INCREASING` | `GOOD` |
| **VEL** | Vellore | 5 | 15 | 620 | 2.20x | `INCREASING` | `GOOD` |
| **KRI** | Krishnagiri | 5 | 15 | 980 | 4.80x | `HIGH PREVENTIVE ATTENTION` | `GOOD` |
| **DGL** | Dindigul | 5 | 15 | 320 | 0.90x | `WATCH` | `MODERATE` |
| **TNJ** | Thanjavur | 5 | 15 | 290 | 0.70x | `LOW` | `MODERATE` |
| **TUT** | Thoothukudi | 5 | 15 | 670 | 2.50x | `INCREASING` | `GOOD` |
| **KKI** | Kanniyakumari | 5 | 15 | 380 | 1.10x | `WATCH` | `MODERATE` |
| **TSI** | Tenkasi | 5 | 15 | 410 | 2.30x | `WATCH` | `LIMITED` |
| **KCP** | Kancheepuram | 5 | 15 | 390 | 1.00x | `WATCH` | `GOOD` |
| **CGL** | Chengalpattu | 5 | 15 | 580 | 2.10x | `INCREASING` | `GOOD` |
| **TLR** | Tiruvallur | 5 | 15 | 620 | 2.30x | `INCREASING` | `GOOD` |
| **CUD** | Cuddalore | 5 | 15 | 310 | 0.80x | `LOW` | `MODERATE` |
| **VLP** | Viluppuram | 5 | 15 | 340 | 1.00x | `WATCH` | `MODERATE` |
| **KLK** | Kallakurichi | 5 | 15 | 210 | 0.60x | `LOW` | `LIMITED` |
| **DPI** | Dharmapuri | 5 | 15 | 430 | 1.40x | `WATCH` | `MODERATE` |
| **NMK** | Namakkal | 5 | 15 | 360 | 0.90x | `WATCH` | `MODERATE` |
| **NIL** | Nilgiris | 5 | 15 | 420 | 1.80x | `WATCH` | `MODERATE` |
| **KRR** | Karur | 5 | 15 | 280 | 0.70x | `LOW` | `MODERATE` |
| **ARI** | Ariyalur | 5 | 15 | 120 | 0.30x | `INSUFFICIENT_DATA` | `LIMITED` |
| **PBL** | Perambalur | 5 | 15 | 140 | 0.40x | `INSUFFICIENT_DATA` | `LIMITED` |
| **PDK** | Pudukkottai | 5 | 15 | 310 | 0.80x | `LOW` | `MODERATE` |
| **SVG** | Sivaganga | 5 | 15 | 260 | 0.60x | `LOW` | `LIMITED` |
| **RMD** | Ramanathapuram | 5 | 15 | 470 | 1.50x | `WATCH` | `MODERATE` |
| **VRD** | Virudhunagar | 5 | 15 | 390 | 1.00x | `WATCH` | `MODERATE` |
| **THI** | Theni | 5 | 15 | 520 | 1.90x | `INCREASING` | `MODERATE` |
| **TVR** | Thiruvarur | 5 | 15 | 190 | 0.50x | `LOW` | `LIMITED` |
| **NGP** | Nagapattinam | 5 | 15 | 370 | 1.20x | `WATCH` | `MODERATE` |
| **MYD** | Mayiladuthurai | 5 | 15 | 240 | 0.60x | `LOW` | `LIMITED` |
| **RNP** | Ranipet | 5 | 15 | 490 | 1.60x | `WATCH` | `GOOD` |
| **TPR_N**| Tirupathur | 5 | 15 | 410 | 1.20x | `WATCH` | `MODERATE` |
| **TVM** | Tiruvannamalai | 5 | 15 | 440 | 1.10x | `WATCH` | `GOOD` |

---

## 3. Relational & Topological Integrity Tests

1. **Hierarchy Integrity**:
   - Every `taluk` maps to an existing `district_id` `[1..38]`.
   - Every `locality` maps to a valid `taluk_id` and parent `district_id`.
2. **Corridor Integrity**:
   - All 8 `spatial_corridors` connect valid Tamil Nadu origin and destination districts.
3. **Alert & Ticket Traceability**:
   - 100% of tickets in `19_action_tickets.csv` reference a valid alert in `18_alerts.csv`.
   - 100% of outcomes in `20_action_outcomes.csv` reference a valid ticket in `19_action_tickets.csv`.
4. **Responsible AI Scoring Invariance**:
   - Ariyalur & Perambalur with sparse reporting are flagged as `INSUFFICIENT_DATA`, not falsely labelled as "Safe".
   - Enforcement seizures are tracked independently from community reporting velocity.

---

## 4. Final Verdict
✅ **All 24 CSV datasets meet state-grade production readiness and pass strict integrity validation.**
