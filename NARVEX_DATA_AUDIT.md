# NARVEX — Data Layer Audit Report
**Platform:** NARVEX (State-Level Narcotic Intelligence & Preventive Decision-Support Platform for Tamil Nadu)  
**Audit Standard:** Strict Observational Data Separation & Anti-Cheating Protocol  
**Audit Date:** August 20, 2026

---

## 1. Data Classification Standard

```text
RAW OBSERVATIONAL LAYER (Physical CSV & MySQL)
├── citizen_reports (Anonymous public intake)
├── intelligence_events (Police FIRs, Checkpost scans, Health & News observations)
├── spatial_associations (Monitored highway transit corridors)
└── event_sources & event_categories (Taxonomies)

DERIVED INTELLIGENCE LAYER (Generated mathematically by Engines)
├── districts (Risk Level, Velocity 30D, Tripartite Confidence, Coverage Status)
├── risk_zones (Spatial-temporal clusters)
├── forecast_records (30D/90D model projections & contributing factors)
├── alerts (Dynamically triggered by statistical thresholds)
└── event_provenance & audit_hash_chain (Tamper-proof SHA-256 blocks)
```

---

## 2. Standalone Raw CSV Dataset Inventory (`/data/datasets/`)

| File Name | Physical Rows | Content Type | Ground-Truth Risk Labels Present? |
|---|---|---|---|
| `01_districts.csv` | **38** | Administrative district attributes (lat/lng, pop, zone) | ❌ **NONE** (Zero pre-labels) |
| `02_taluks.csv` | **190** | Administrative taluk hierarchy | ❌ **NONE** |
| `03_localities.csv` | **570** | Locality, ward, and campus sectors | ❌ **NONE** |
| `04_complaints.csv` | **1,250** | Raw normalized citizen/community complaints | ❌ **NONE** |
| `05_police_reports.csv` | **1,150** | Official beat patrol and investigation logs | ❌ **NONE** |
| `06_checkpost_reports.csv` | **1,050** | Interstate weighbridge & ANPR telemetry | ❌ **NONE** |
| `07_citizen_reports.csv` | **1,200** | Anonymous citizen tip submissions | ❌ **NONE** |
| `08_fir_records.csv` | **1,100** | Statutory NDPS FIR registrations | ❌ **NONE** |
| `09_seizure_records.csv` | **1,050** | Contraband field seizure records (KG / Litres) | ❌ **NONE** |
| `10_health_rehabilitation_signals.csv` | **1,000** | Aggregate hospital/rehab admissions | ❌ **NONE** |
| `11_news_signals.csv` | **1,000** | Open-source press bulletins | ❌ **NONE** |
| `12_drug_categories.csv` | **6** | Controlled classification taxonomy | ❌ **NONE** |
| `13_spatial_corridors.csv` | **8** | Interstate & inter-district highway routes | ❌ **NONE** |
| `16_forecast_training_data.csv` | **1,200** | Time-series feature observations with $t+30\text{d}$ outcome | ❌ **NONE** (Learned target) |
| `21_data_provenance.csv` | **1,500** | Cryptographic ingestion audit records | ❌ **NONE** |
| `22_source_registry.csv` | **5** | Source reliability weights | ❌ **NONE** |

---

## 3. Relational Hierarchy & Spatial Representation
- **All 38 Districts Covered:** Chennai, Coimbatore, Madurai, Salem, Tiruchirappalli, Tirunelveli, Erode, Tiruppur, Vellore, Krishnagiri, Dindigul, Thanjavur, Thoothukudi, Kanniyakumari, Tenkasi, Kancheepuram, Chengalpattu, Tiruvallur, Cuddalore, Viluppuram, Kallakurichi, Dharmapuri, Namakkal, Nilgiris, Karur, Ariyalur, Perambalur, Pudukkottai, Sivaganga, Ramanathapuram, Virudhunagar, Theni, Thiruvarur, Nagapattinam, Mayiladuthurai, Ranipet, Tirupathur, Tiruvannamalai.
- **Relational Integrity:** Zero orphan taluks or localities.
- **Privacy Protection:** Zero personal PII (Aadhaar, phone numbers, individual bank accounts, suspect faces) stored in the database.

---

## 4. Ingestion & Quality Assurance
- **Ingestion Script:** `server/database/importDatasets.js`
- **Validation Pipeline:** Redacts PII via regex filter, validates GPS coordinates, enforces foreign keys, and appends a SHA-256 audit block upon completion.
