# NARVEX Data Dictionary & Schema Specification (Phase 1)

This document defines the schema contracts for the 32 raw observation tables and derived intelligence entities in NARVEX.

---

## 🔒 Mandatory Data Governance Principles

1. **Zero Ground-Truth Risk Labels**:
   Raw observation tables MUST NOT contain pre-assigned ground-truth risk labels (`risk_level`, `risk_score`, `predicted_risk`, `forecast_risk`, `hotspot`, `high_risk`, etc.).
2. **Strict Time Separation**:
   - `observed_at`: When the real-world incident actually occurred.
   - `reported_at`: When the incident was filed by a source.
   - `ingested_at`: When the record was hashed and written to MySQL by NARVEX.

---

## 🗄️ Core Observation Tables

### 1. `complaints`
- `id` (INT PK AUTO_INCREMENT)
- `complaint_ref` (VARCHAR 60 UNIQUE) - Stable external tracking code.
- `source_id` (INT FK -> source_registry.id)
- `district_id` (INT FK -> districts.id)
- `locality_id` (INT NULLable)
- `place_description` (TEXT)
- `substance_category` (VARCHAR 60)
- `observed_at` (DATETIME)
- `reported_at` (DATETIME)
- `ingested_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### 2. `police_observations`
- `id` (INT PK AUTO_INCREMENT)
- `obs_ref` (VARCHAR 60 UNIQUE)
- `station_id` (INT)
- `district_id` (INT FK -> districts.id)
- `locality_id` (INT NULLable)
- `incident_type` (VARCHAR 60)
- `substance_category` (VARCHAR 60)
- `quantity_value` (DECIMAL 10, 3)
- `quantity_unit` (VARCHAR 20)
- `transport_mode` (ENUM: 'ROAD', 'RAIL', 'AIR', 'MARITIME', 'UNKNOWN')
- `observed_at` (DATETIME)
- `reported_at` (DATETIME)
- `ingested_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### 3. `seizure_observations`
- `id` (INT PK AUTO_INCREMENT)
- `seizure_ref` (VARCHAR 60 UNIQUE)
- `case_ref` (VARCHAR 60)
- `district_id` (INT FK -> districts.id)
- `substance_category` (VARCHAR 60)
- `quantity_value` (DECIMAL 10, 3)
- `quantity_unit` (VARCHAR 20)
- `estimated_value_inr` (DECIMAL 12, 2)
- `seizure_lat` (DECIMAL 10, 8)
- `seizure_lng` (DECIMAL 11, 8)
- `observed_at` (DATETIME)
- `ingested_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### 4. `checkpost_observations`
- `id` (INT PK AUTO_INCREMENT)
- `checkpost_ref` (VARCHAR 60 UNIQUE)
- `checkpost_name` (VARCHAR 100)
- `district_id` (INT FK -> districts.id)
- `vehicle_type` (VARCHAR 40)
- `scan_type` (ENUM: 'ANPR_CAMERA', 'MANUAL_INSPECTION', 'SCANNER')
- `substance_found` (TINYINT 1)
- `substance_category` (VARCHAR 60)
- `observed_at` (DATETIME)
- `ingested_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### 5. `documents` & `document_extractions`
- `document_id` (VARCHAR 60 UNIQUE PK)
- `file_name` (VARCHAR 255)
- `sha256_hash` (VARCHAR 64 UNIQUE) - Cryptographic file hash.
- `file_size` (INT)
- `file_type` (VARCHAR 30)
- `processing_status` (ENUM: 'PENDING', 'PROCESSED', 'FAILED', 'QUARANTINED')
- `received_at` (DATETIME)

---

## 📊 Derived Intelligence Tables (Calculated by Engine)

### 1. `model_features`
- `district_id` (INT FK)
- `feature_date` (DATE)
- `velocity_7d` (DECIMAL 10, 4) - 7-day daily observation count.
- `velocity_30d` (DECIMAL 10, 4) - 30-day daily observation count.
- `velocity_90d` (DECIMAL 10, 4) - 90-day baseline.
- `acceleration` (DECIMAL 10, 4) - `velocity_7d / (velocity_30d + 0.001)`.
- `source_diversity` (INT) - Distinct source count.
- `corroboration_score` (DECIMAL 4, 3) - Multi-source ratio.
- `coverage_score` (DECIMAL 4, 3) - Data completeness metric.

### 2. `forecast_records`
- `district_id` (INT FK)
- `forecast_date` (DATE)
- `probability` (DECIMAL 5, 4) - Inferential probability `[0.0000, 1.0000]`.
- `confidence` (DECIMAL 5, 4)
- `coverage` (DECIMAL 5, 4)
- `signal_state` (ENUM: 'STABLE', 'EMERGING', 'FIRST_TIME', 'ELEVATED', 'INSUFFICIENT_DATA')
- `contributing_factors` (JSON)
- `model_version` (VARCHAR 50)
- `calculated_at` (DATETIME)
