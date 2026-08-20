# NARVEX — Static Dataset Catalog
**Location:** `/data/datasets/`  
**Total Standalone CSV Files:** 24  
**Total Records:** 21,862  

---

## 1. Dataset Index & Schema Details

| # | File Name | Purpose / Operational Scope | Key Fields & Foreign References | Record Count |
|---|---|---|---|---|
| **01** | `01_districts.csv` | Master list of all 38 Tamil Nadu administrative districts | `district_id`, `district_code`, `district_name`, `headquarters`, `latitude`, `longitude`, `population`, `risk_level`, `velocity_30d`, `confidence_score`, `coverage_status` | **38** |
| **02** | `02_taluks.csv` | Administrative taluk/sub-district subdivisions | `taluk_id`, `district_id` (FK ➔ 01), `district_name`, `taluk_name`, `latitude`, `longitude`, `population` | **190** |
| **03** | `03_localities.csv` | Granular wards, villages, transit hubs & campus sectors | `locality_id`, `taluk_id` (FK ➔ 02), `district_id` (FK ➔ 01), `locality_name`, `locality_type`, `latitude`, `longitude` | **570** |
| **04** | `04_complaints.csv` | Multi-source normalized intelligence complaint ledger | `complaint_id`, `district_id`, `taluk_id`, `locality_id`, `category_id`, `source_id`, `reported_at`, `verification_status`, `confidence_score` | **1,250** |
| **05** | `05_police_reports.csv` | Official law enforcement station beat & patrol records | `police_report_id`, `district_id`, `taluk_id`, `locality_id`, `station_code`, `incident_timestamp`, `category_id`, `investigation_status` | **1,150** |
| **06** | `06_checkpost_reports.csv` | Interstate border checkpost & weighbridge telemetry | `checkpost_report_id`, `checkpost_name`, `district_id`, `border_corridor`, `scanned_at`, `transit_direction`, `category_id`, `volume_band` | **1,050** |
| **07** | `07_citizen_reports.csv` | Anonymous public tip submissions with synthetic tokens | `citizen_report_id`, `anonymous_token`, `district_id`, `taluk_id`, `locality_id`, `category_id`, `submitted_at`, `verification_status` | **1,200** |
| **08** | `08_fir_records.csv` | Statutory NDPS First Information Report (FIR) logs | `fir_id`, `district_id`, `police_station_code`, `fir_date`, `offense_section`, `category_id`, `quantity_classification`, `investigation_status` | **1,100** |
| **09** | `09_seizure_records.csv` | Quantified contraband field seizure records | `seizure_id`, `district_id`, `locality_name`, `seizure_timestamp`, `category_id`, `seized_quantity`, `unit_of_measure`, `seizure_context` | **1,050** |
| **10** | `10_health_rehabilitation_signals.csv` | Non-PII medical hospital & de-addiction intake trends | `health_signal_id`, `district_id`, `reported_date`, `facility_type`, `aggregate_signal_type`, `category_id`, `aggregate_count` | **1,000** |
| **11** | `11_news_signals.csv` | Open-source regional press and media bulletins | `news_signal_id`, `district_id`, `published_at`, `media_source`, `headline_sanitized`, `category_id`, `public_concern_level` | **1,000** |
| **12** | `12_drug_categories.csv` | Controlled classification taxonomy & severity weights | `category_id`, `category_key`, `category_name`, `risk_weight`, `description` | **6** |
| **13** | `13_spatial_corridors.csv` | Inter-state & inter-district historical transit corridors | `corridor_id`, `corridor_name`, `origin_district_id`, `destination_district_id`, `highway_route`, `distance_km`, `classification_type` | **8** |
| **14** | `14_risk_zone_history.csv` | 18-month longitudinal district risk snapshots | `snapshot_id`, `district_id`, `snapshot_timestamp`, `risk_indicator`, `velocity_ratio`, `confidence_score`, `coverage_status` | **1,200** |
| **15** | `15_emerging_zone_signals.csv` | Spatial-temporal micro-cluster state transition ledger | `signal_id`, `district_id`, `taluk_id`, `locality_id`, `timestamp`, `category_id`, `lifecycle_state`, `transition_trigger` | **1,050** |
| **16** | `16_forecast_training_data.csv` | Longitudinal multi-window feature matrix for AI models | `feature_id`, `district_id`, `window_start_date`, `velocity_7d`, `velocity_30d`, `volume_90d`, `checkpost_anomalies_count`, `target_label` | **1,200** |
| **17** | `17_forecast_zone_history.csv` | 30D / 90D Bayesian preventive attention projections | `forecast_id`, `district_id`, `generated_at`, `forecast_horizon`, `forecast_risk_level`, `forecast_confidence`, `primary_factor` | **1,100** |
| **18** | `18_alerts.csv` | Multi-category operational intelligence alerts | `alert_id`, `district_id`, `created_at`, `alert_type`, `priority_level`, `status`, `trigger_summary`, `confidence_score` | **1,050** |
| **19** | `19_action_tickets.csv` | Human-in-the-loop task assignments for field officers | `ticket_id`, `associated_alert_id` (FK ➔ 18), `district_id`, `assigned_officer_id`, `created_at`, `action_type`, `ticket_status` | **1,000** |
| **20** | `20_action_outcomes.csv` | Verifiable outcomes and feedback to AI models | `outcome_id`, `ticket_id` (FK ➔ 19), `resolved_at`, `operational_outcome`, `feedback_to_model`, `outcome_confidence` | **1,000** |
| **21** | `21_data_provenance.csv` | Cryptographic lineage blocks with SHA-256 audit hashes | `provenance_id`, `target_record_id`, `source_dataset`, `ingested_at`, `transformation_stage`, `verification_status`, `sha256_audit_hash` | **1,500** |
| **22** | `22_source_registry.csv` | Reliability weighting for data source origins | `source_id`, `source_key`, `source_name`, `source_type`, `reliability_weight` | **5** |
| **23** | `23_model_evaluation.csv` | Precision, recall, F1, and concept drift metrics | `eval_id`, `district_id`, `evaluation_timestamp`, `precision_rate`, `recall_rate`, `f1_score`, `false_alarm_rate`, `concept_drift_status` | **1,000** |
| **24** | `24_daily_intelligence_snapshots.csv` | 3-year continuous daily time-series telemetry | `snapshot_id`, `district_id`, `snapshot_date`, `daily_signals_count`, `velocity_ratio`, `risk_level`, `confidence_score`, `coverage_status` | **1,095** |

---

## 2. Ingestion Guarantee
All 24 standalone CSV datasets reside physically in `/data/datasets/` and are strictly ingested via the production pipeline `node server/database/importDatasets.js` without any runtime randomization.
