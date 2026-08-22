-- ============================================================================
-- NARVEX SOVEREIGN PLATFORM — PHASE 1 REAL-TIME INTELLIGENCE DATA FOUNDATION
-- Normalized Relational Schema for 32 Dataset Families & Derived Intelligence
-- ============================================================================

USE narvex;

-- Disable foreign key checks for clean table initialization
SET FOREIGN_KEY_CHECKS = 0;

-- Drop old tables if they exist
DROP TABLE IF EXISTS complaints, police_observations, fir_observations, seizure_observations, checkpost_observations, transport_observations, border_observations, maritime_observations, airport_observations, health_signals, news_observations, court_observations, investigation_observations, documents, document_extractions, source_registry, event_provenance, spatial_corridors, route_observations, external_geography, entities, entity_relationships, case_relationships, temporal_observations, source_corroborations, model_features, forecast_records, derived_risk_zones, route_intelligence, intelligence_alerts, audit_events, model_registry, data_quarantine, localities, corporations, municipalities, taluks, police_stations, police_jurisdictions, districts;

-- ----------------------------------------------------------------------------
-- 01 - 05 GEOGRAPHICAL BOUNDARY TABLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS districts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  district_code VARCHAR(20) UNIQUE NOT NULL,
  district_name VARCHAR(100) NOT NULL,
  code VARCHAR(20) GENERATED ALWAYS AS (district_code) STORED,
  name VARCHAR(100) GENERATED ALWAYS AS (district_name) STORED,
  zone VARCHAR(50) NOT NULL,
  headquarters VARCHAR(100),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  center_lat DECIMAL(10, 8) GENERATED ALWAYS AS (latitude) STORED,
  center_lng DECIMAL(11, 8) GENERATED ALWAYS AS (longitude) STORED,
  population INT DEFAULT 1000000,
  baseline_population INT GENERATED ALWAYS AS (population) STORED,
  coverage_status VARCHAR(50) DEFAULT 'MODERATE',
  confidence_score DECIMAL(5, 2) DEFAULT 78.50,
  trend_direction VARCHAR(20) DEFAULT 'STABLE',
  velocity_30d DECIMAL(8, 4) DEFAULT 1.2500,
  first_time_signals_count INT DEFAULT 18,
  recent_signal_count INT DEFAULT 4,
  risk_level VARCHAR(50) DEFAULT 'WATCH',
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS taluks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  taluk_code VARCHAR(30) UNIQUE NOT NULL,
  taluk_name VARCHAR(100) NOT NULL,
  name VARCHAR(100) GENERATED ALWAYS AS (taluk_name) STORED,
  district_id INT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  center_lat DECIMAL(10, 8) GENERATED ALWAYS AS (latitude) STORED,
  center_lng DECIMAL(11, 8) GENERATED ALWAYS AS (longitude) STORED,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS municipalities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  municipality_code VARCHAR(30) UNIQUE NOT NULL,
  municipality_name VARCHAR(100) NOT NULL,
  taluk_id INT NOT NULL,
  district_id INT NOT NULL,
  type ENUM('CORPORATION', 'MUNICIPALITY', 'TOWN_PANCHAYAT') DEFAULT 'MUNICIPALITY',
  FOREIGN KEY (taluk_id) REFERENCES taluks(id) ON DELETE CASCADE,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS corporations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  corp_code VARCHAR(30) UNIQUE NOT NULL,
  corp_name VARCHAR(100) NOT NULL,
  district_id INT NOT NULL,
  ward_count INT DEFAULT 50,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS localities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  locality_code VARCHAR(40) UNIQUE NOT NULL,
  locality_name VARCHAR(100) NOT NULL,
  taluk_id INT,
  district_id INT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  is_border_locality TINYINT(1) DEFAULT 0,
  is_coastal_locality TINYINT(1) DEFAULT 0,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 06 - 07 POLICE JURISDICTION TABLES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS police_jurisdictions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  jurisdiction_code VARCHAR(30) UNIQUE NOT NULL,
  range_name VARCHAR(100) NOT NULL,
  district_id INT NOT NULL,
  headquarters VARCHAR(100),
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS police_stations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  station_code VARCHAR(40) UNIQUE NOT NULL,
  station_name VARCHAR(100) NOT NULL,
  jurisdiction_id INT NOT NULL,
  district_id INT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 23 SOURCE REGISTRY TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS source_registry (
  id INT PRIMARY KEY AUTO_INCREMENT,
  source_code VARCHAR(50) UNIQUE NOT NULL,
  source_name VARCHAR(100) NOT NULL,
  source_type ENUM('POLICE', 'CITIZEN_INTAKE', 'CHECKPOST', 'MARITIME', 'AIRPORT', 'HEALTH', 'NEWS', 'COURT', 'OCR_DOCUMENT') NOT NULL,
  reliability_score DECIMAL(4, 3) DEFAULT 0.850,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 27 EXTERNAL GEOGRAPHY TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS external_geography (
  id INT PRIMARY KEY AUTO_INCREMENT,
  geo_code VARCHAR(30) UNIQUE NOT NULL,
  geo_name VARCHAR(100) NOT NULL,
  tier ENUM('GLOBAL', 'INDIA', 'NEIGHBORING_STATE') NOT NULL,
  country_or_state VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 25 SPATIAL CORRIDORS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spatial_corridors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  corridor_code VARCHAR(50) UNIQUE NOT NULL,
  corridor_name VARCHAR(150) NOT NULL,
  origin_name VARCHAR(100) NOT NULL,
  origin_lat DECIMAL(10, 8) NOT NULL,
  origin_lng DECIMAL(11, 8) NOT NULL,
  dest_name VARCHAR(100) NOT NULL,
  dest_lat DECIMAL(10, 8) NOT NULL,
  dest_lng DECIMAL(11, 8) NOT NULL,
  transport_mode ENUM('AIR', 'ROAD', 'RAIL', 'MARITIME') NOT NULL,
  scope ENUM('GLOBAL', 'INDIA', 'TAMILNADU') NOT NULL
);

-- ----------------------------------------------------------------------------
-- 08 - 20 RAW OBSERVATION TABLES (ZERO GROUND-TRUTH RISK LABELS)
-- ----------------------------------------------------------------------------

-- 08 Complaints
CREATE TABLE IF NOT EXISTS complaints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_ref VARCHAR(60) UNIQUE NOT NULL,
  source_id INT NOT NULL,
  district_id INT NOT NULL,
  locality_id INT,
  place_description TEXT,
  substance_category VARCHAR(60) NOT NULL,
  observed_at DATETIME NOT NULL,
  reported_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 09 Police Observations
CREATE TABLE IF NOT EXISTS police_observations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  obs_ref VARCHAR(60) UNIQUE NOT NULL,
  station_id INT NOT NULL,
  district_id INT NOT NULL,
  locality_id INT,
  incident_type VARCHAR(60) NOT NULL,
  substance_category VARCHAR(60) NOT NULL,
  quantity_value DECIMAL(10, 3) NOT NULL,
  quantity_unit VARCHAR(20) NOT NULL,
  transport_mode ENUM('ROAD', 'RAIL', 'AIR', 'MARITIME', 'UNKNOWN') DEFAULT 'ROAD',
  observed_at DATETIME NOT NULL,
  reported_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 10 FIR Observations
CREATE TABLE IF NOT EXISTS fir_observations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fir_ref VARCHAR(60) UNIQUE NOT NULL,
  fir_number VARCHAR(80) NOT NULL,
  station_id INT NOT NULL,
  district_id INT NOT NULL,
  accused_count INT DEFAULT 1,
  substance_category VARCHAR(60) NOT NULL,
  quantity_value DECIMAL(10, 3) NOT NULL,
  quantity_unit VARCHAR(20) NOT NULL,
  occurrence_lat DECIMAL(10, 8),
  occurrence_lng DECIMAL(11, 8),
  observed_at DATETIME NOT NULL,
  reported_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 11 Seizure Observations
CREATE TABLE IF NOT EXISTS seizure_observations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  seizure_ref VARCHAR(60) UNIQUE NOT NULL,
  case_ref VARCHAR(60) NOT NULL,
  district_id INT NOT NULL,
  locality_id INT,
  substance_category VARCHAR(60) NOT NULL,
  quantity_value DECIMAL(10, 3) NOT NULL,
  quantity_unit VARCHAR(20) NOT NULL,
  estimated_value_inr DECIMAL(12, 2),
  seizure_lat DECIMAL(10, 8),
  seizure_lng DECIMAL(11, 8),
  observed_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 12 Checkpost Observations
CREATE TABLE IF NOT EXISTS checkpost_observations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  checkpost_ref VARCHAR(60) UNIQUE NOT NULL,
  checkpost_name VARCHAR(100) NOT NULL,
  district_id INT NOT NULL,
  vehicle_type VARCHAR(40) NOT NULL,
  scan_type ENUM('ANPR_CAMERA', 'MANUAL_INSPECTION', 'SCANNER') DEFAULT 'ANPR_CAMERA',
  substance_found TINYINT(1) DEFAULT 0,
  substance_category VARCHAR(60),
  observed_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 13 Transport Observations
CREATE TABLE IF NOT EXISTS transport_observations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transport_ref VARCHAR(60) UNIQUE NOT NULL,
  transport_mode ENUM('ROAD', 'RAIL', 'AIR', 'MARITIME') NOT NULL,
  origin_name VARCHAR(100) NOT NULL,
  origin_lat DECIMAL(10, 8),
  origin_lng DECIMAL(11, 8),
  dest_name VARCHAR(100) NOT NULL,
  dest_lat DECIMAL(10, 8),
  dest_lng DECIMAL(11, 8),
  district_id INT NOT NULL,
  observed_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 14 Border Observations
CREATE TABLE IF NOT EXISTS border_observations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  border_ref VARCHAR(60) UNIQUE NOT NULL,
  checkpost_name VARCHAR(100) NOT NULL,
  border_state VARCHAR(60) NOT NULL,
  district_id INT NOT NULL,
  intercept_count INT DEFAULT 1,
  observed_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 15 Maritime Observations
CREATE TABLE IF NOT EXISTS maritime_observations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  maritime_ref VARCHAR(60) UNIQUE NOT NULL,
  port_name VARCHAR(100) NOT NULL,
  vessel_type VARCHAR(60) NOT NULL,
  origin_country VARCHAR(60) NOT NULL,
  district_id INT NOT NULL,
  observed_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 16 Airport Observations
CREATE TABLE IF NOT EXISTS airport_observations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  airport_ref VARCHAR(60) UNIQUE NOT NULL,
  airport_name VARCHAR(100) NOT NULL,
  flight_origin VARCHAR(100) NOT NULL,
  cargo_type VARCHAR(60) NOT NULL,
  district_id INT NOT NULL,
  observed_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 17 Health Signals
CREATE TABLE IF NOT EXISTS health_signals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  signal_ref VARCHAR(60) UNIQUE NOT NULL,
  facility_name VARCHAR(100) NOT NULL,
  district_id INT NOT NULL,
  admission_count INT NOT NULL,
  substance_category VARCHAR(60) NOT NULL,
  observed_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 18 News Observations
CREATE TABLE IF NOT EXISTS news_observations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  news_ref VARCHAR(60) UNIQUE NOT NULL,
  source_outlet VARCHAR(100) NOT NULL,
  headline VARCHAR(255) NOT NULL,
  article_url TEXT,
  district_id INT NOT NULL,
  substance_category VARCHAR(60),
  published_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 19 Court Observations
CREATE TABLE IF NOT EXISTS court_observations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  court_ref VARCHAR(60) UNIQUE NOT NULL,
  court_name VARCHAR(100) NOT NULL,
  case_ref VARCHAR(60) NOT NULL,
  district_id INT NOT NULL,
  stage ENUM('CHARGE_SHEET', 'TRIAL', 'CONVICTION', 'ACQUITTAL') NOT NULL,
  observed_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 20 Investigation Observations
CREATE TABLE IF NOT EXISTS investigation_observations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  inv_ref VARCHAR(60) UNIQUE NOT NULL,
  case_ref VARCHAR(60) NOT NULL,
  unit_name VARCHAR(100) NOT NULL,
  district_id INT NOT NULL,
  action_summary TEXT NOT NULL,
  observed_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 21 - 22 DOCUMENT INGESTION & EXTRACTION TABLES
CREATE TABLE IF NOT EXISTS documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  document_id VARCHAR(60) UNIQUE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  sha256_hash VARCHAR(64) UNIQUE NOT NULL,
  file_size INT NOT NULL,
  file_type VARCHAR(30) NOT NULL,
  source_type VARCHAR(50) DEFAULT 'DOCUMENT_DROP',
  processing_status ENUM('PENDING', 'PROCESSED', 'FAILED', 'QUARANTINED') DEFAULT 'PENDING',
  received_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_extractions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  document_id VARCHAR(60) NOT NULL,
  raw_text LONGTEXT,
  extracted_json JSON,
  entities_found INT DEFAULT 0,
  parser_version VARCHAR(20) DEFAULT '1.0.0',
  extracted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE
);

-- 24 EVENT PROVENANCE TABLE
CREATE TABLE IF NOT EXISTS event_provenance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_ref VARCHAR(60) UNIQUE NOT NULL,
  event_id INT DEFAULT NULL,
  source_id INT NOT NULL,
  source_department VARCHAR(120) DEFAULT 'State Intelligence Wing',
  source_file_name VARCHAR(255) DEFAULT 'INTAKE_DATA.pdf',
  classification_method VARCHAR(50) DEFAULT 'RULE_BASED',
  document_id VARCHAR(60),
  case_ref VARCHAR(60),
  district_id INT NOT NULL,
  locality_id INT,
  description TEXT NOT NULL,
  observed_at DATETIME NOT NULL,
  reported_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 26 ROUTE OBSERVATIONS TABLE
CREATE TABLE IF NOT EXISTS route_observations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  route_ref VARCHAR(60) UNIQUE NOT NULL,
  event_id INT,
  corridor_id INT,
  origin_name VARCHAR(100) NOT NULL,
  origin_country VARCHAR(100) DEFAULT 'India',
  origin_state VARCHAR(100) DEFAULT 'Tamil Nadu',
  origin_district VARCHAR(100),
  origin_lat DECIMAL(10, 8) NOT NULL,
  origin_lng DECIMAL(11, 8) NOT NULL,
  dest_name VARCHAR(100) NOT NULL,
  destination_state VARCHAR(100) DEFAULT 'Tamil Nadu',
  destination_district VARCHAR(100),
  dest_lat DECIMAL(10, 8) NOT NULL,
  dest_lng DECIMAL(11, 8) NOT NULL,
  transport_mode ENUM('AIR', 'ROAD', 'RAIL', 'MARITIME', 'UNKNOWN') DEFAULT 'ROAD',
  scope_tier ENUM('WORLD', 'INDIA', 'TAMILNADU') DEFAULT 'TAMILNADU',
  quantity_observed DECIMAL(10, 3) DEFAULT 0.000,
  source_type VARCHAR(60) DEFAULT 'ENFORCEMENT',
  verification_status VARCHAR(60) DEFAULT 'VERIFIED',
  district_id INT NOT NULL,
  observed_at DATETIME NOT NULL,
  ingested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- 28 - 30 ENTITY & CASE RELATIONSHIP TABLES
CREATE TABLE IF NOT EXISTS entities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entity_ref VARCHAR(60) UNIQUE NOT NULL,
  entity_type ENUM('LOCATION', 'VEHICLE', 'ORGANIZATION', 'CORRIDOR', 'DOCUMENT', 'CASE') NOT NULL,
  entity_name VARCHAR(150) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entity_relationships (
  id INT PRIMARY KEY AUTO_INCREMENT,
  source_entity_ref VARCHAR(60) NOT NULL,
  target_entity_ref VARCHAR(60) NOT NULL,
  relation_type VARCHAR(60) NOT NULL,
  weight DECIMAL(5, 4) DEFAULT 1.0000,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS case_relationships (
  id INT PRIMARY KEY AUTO_INCREMENT,
  case_ref VARCHAR(60) NOT NULL,
  related_case_ref VARCHAR(60) NOT NULL,
  relationship_reason VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 31 TEMPORAL OBSERVATIONS & 32 SOURCE CORROBORATION TABLES
CREATE TABLE IF NOT EXISTS temporal_observations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  obs_ref VARCHAR(60) UNIQUE NOT NULL,
  district_id INT NOT NULL,
  time_bucket DATE NOT NULL,
  observation_count INT DEFAULT 1,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

CREATE TABLE IF NOT EXISTS source_corroborations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_ref VARCHAR(60) NOT NULL,
  source_id_1 INT NOT NULL,
  source_id_2 INT NOT NULL,
  corroboration_type VARCHAR(50) NOT NULL,
  confidence DECIMAL(4, 3) DEFAULT 0.900,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- DERIVED INTELLIGENCE & AUDIT TABLES
-- ----------------------------------------------------------------------------

-- Model Features Matrix (Calculated from Raw Observations)
CREATE TABLE IF NOT EXISTS model_features (
  id INT PRIMARY KEY AUTO_INCREMENT,
  district_id INT NOT NULL,
  feature_date DATE NOT NULL,
  velocity_7d DECIMAL(10, 4) DEFAULT 0.0000,
  velocity_30d DECIMAL(10, 4) DEFAULT 0.0000,
  velocity_90d DECIMAL(10, 4) DEFAULT 0.0000,
  acceleration DECIMAL(10, 4) DEFAULT 0.0000,
  source_diversity INT DEFAULT 1,
  corroboration_score DECIMAL(4, 3) DEFAULT 0.000,
  spatial_clustering_score DECIMAL(4, 3) DEFAULT 0.000,
  coverage_score DECIMAL(4, 3) DEFAULT 1.000,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY district_date (district_id, feature_date),
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Model Forecast Records (Statistical AI Inference Output)
CREATE TABLE IF NOT EXISTS forecast_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  district_id INT NOT NULL,
  forecast_date DATE NOT NULL,
  probability DECIMAL(5, 4) NOT NULL,
  confidence DECIMAL(5, 4) NOT NULL,
  coverage DECIMAL(5, 4) NOT NULL,
  signal_state ENUM('STABLE', 'EMERGING', 'FIRST_TIME', 'ELEVATED', 'INSUFFICIENT_DATA') NOT NULL,
  contributing_factors JSON,
  model_version VARCHAR(50) NOT NULL,
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Derived Risk Zones
CREATE TABLE IF NOT EXISTS derived_risk_zones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  district_id INT NOT NULL,
  zone_type ENUM('PERSISTENT', 'EMERGING', 'FIRST_TIME_SIGNAL', 'INSUFFICIENT_DATA') NOT NULL,
  risk_score DECIMAL(5, 4) NOT NULL,
  evidence_count INT NOT NULL,
  locality_name VARCHAR(100),
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Route Intelligence (Derived mathematically from spatial & route observations)
CREATE TABLE IF NOT EXISTS route_intelligence (
  id INT PRIMARY KEY AUTO_INCREMENT,
  route_id VARCHAR(150) UNIQUE NOT NULL,
  corridor_id INT,
  origin_region VARCHAR(100) NOT NULL,
  destination_region VARCHAR(100) NOT NULL,
  origin_lat DECIMAL(10, 8) NOT NULL,
  origin_lng DECIMAL(11, 8) NOT NULL,
  destination_lat DECIMAL(10, 8) NOT NULL,
  destination_lng DECIMAL(11, 8) NOT NULL,
  transport_mode ENUM('AIR', 'ROAD', 'RAIL', 'MARITIME', 'UNKNOWN') NOT NULL,
  scope_tier ENUM('WORLD', 'INDIA', 'TAMILNADU') NOT NULL,
  observation_count INT NOT NULL DEFAULT 1,
  verified_event_count INT NOT NULL DEFAULT 1,
  unique_sources INT NOT NULL DEFAULT 1,
  historical_frequency DECIMAL(8, 4) NOT NULL DEFAULT 1.0000,
  recent_velocity DECIMAL(8, 4) NOT NULL DEFAULT 1.0000,
  trend_direction VARCHAR(50) DEFAULT 'STABLE',
  evidence_confidence DECIMAL(5, 4) NOT NULL DEFAULT 0.7500,
  coverage_status ENUM('GOOD', 'MODERATE', 'LIMITED') DEFAULT 'MODERATE',
  derived_state ENUM('OBSERVED', 'EMERGING_ASSOCIATION', 'MONITORED', 'INSUFFICIENT_DATA') DEFAULT 'OBSERVED',
  arc_status ENUM('HISTORICAL_OBSERVED', 'EMERGING', 'FORECAST') DEFAULT 'HISTORICAL_OBSERVED',
  first_observed_at DATETIME,
  last_observed_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Intelligence Alerts
CREATE TABLE IF NOT EXISTS intelligence_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  alert_code VARCHAR(60) UNIQUE NOT NULL,
  district_id INT NOT NULL,
  alert_type ENUM('FIRST_TIME_SIGNAL', 'VELOCITY_SPIKE', 'ROUTE_EMERGENCE', 'CORROBORATED_INCIDENT') NOT NULL,
  message TEXT NOT NULL,
  evidence_json JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Audit Events Chain
CREATE TABLE IF NOT EXISTS audit_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id VARCHAR(60) UNIQUE NOT NULL,
  event_type VARCHAR(60) NOT NULL,
  actor VARCHAR(100) NOT NULL,
  details JSON,
  previous_hash VARCHAR(64) NOT NULL,
  current_hash VARCHAR(64) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Model Registry Table
CREATE TABLE IF NOT EXISTS model_registry (
  id INT PRIMARY KEY AUTO_INCREMENT,
  model_version VARCHAR(50) UNIQUE NOT NULL,
  algorithm VARCHAR(100) NOT NULL,
  sha256_hash VARCHAR(64) NOT NULL,
  training_window VARCHAR(100) NOT NULL,
  metrics JSON NOT NULL,
  deployed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Data Quarantine Table
CREATE TABLE IF NOT EXISTS data_quarantine (
  id INT PRIMARY KEY AUTO_INCREMENT,
  quarantine_ref VARCHAR(60) UNIQUE NOT NULL,
  source_type VARCHAR(60) NOT NULL,
  raw_payload LONGTEXT NOT NULL,
  rejection_reason VARCHAR(255) NOT NULL,
  received_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Legacy Verification Compatibility Tables
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  role_key VARCHAR(50) NOT NULL,
  district_id INT NULL,
  department VARCHAR(100) DEFAULT 'State Intelligence Directorate',
  badge_number VARCHAR(50),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS event_sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_key VARCHAR(50) NOT NULL UNIQUE,
  source_name VARCHAR(120) NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  reliability_weight DECIMAL(3, 2) DEFAULT 0.80
);

CREATE TABLE IF NOT EXISTS event_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_key VARCHAR(50) NOT NULL UNIQUE,
  category_name VARCHAR(100) NOT NULL,
  risk_weight DECIMAL(3, 2) DEFAULT 1.00
);

CREATE TABLE IF NOT EXISTS intelligence_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_code VARCHAR(40) NOT NULL UNIQUE,
  district_id INT NOT NULL,
  location_name VARCHAR(200) NOT NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  event_date DATE NOT NULL,
  category_id INT NOT NULL,
  source_id INT NOT NULL,
  raw_description_redacted TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id)
);

CREATE TABLE IF NOT EXISTS audit_hash_chain (
  id INT AUTO_INCREMENT PRIMARY KEY,
  block_index INT NOT NULL UNIQUE,
  actor_user_id INT NULL,
  action_type VARCHAR(80) NOT NULL,
  previous_hash VARCHAR(64) NOT NULL,
  current_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Users for Verification Suite
INSERT INTO users (username, password_hash, full_name, email, role_key, district_id) VALUES
('admin', '$2b$10$Wp8Y0y9V3Q0b0c0d0e0f0e0f0e0f0e0f0e0f0e0f0e0f0e0f0e0f0', 'State Admin', 'admin@narvex.tn.gov.in', 'STATE_ADMIN', NULL),
('cbe_officer', '$2b$10$Wp8Y0y9V3Q0b0c0d0e0f0e0f0e0f0e0f0e0f0e0f0e0f0e0f0e0f0', 'Coimbatore Officer', 'cbe@narvex.tn.gov.in', 'DISTRICT_OFFICER', 2),
('verifier', '$2b$10$Wp8Y0y9V3Q0b0c0d0e0f0e0f0e0f0e0f0e0f0e0f0e0f0e0f0e0f0', 'Verification Officer', 'verifier@narvex.tn.gov.in', 'VERIFICATION_OFFICER', NULL),
('citizen', '$2b$10$Wp8Y0y9V3Q0b0c0d0e0f0e0f0e0f0e0f0e0f0e0f0e0f0e0f0e0f0', 'Citizen Reporter', 'citizen@narvex.tn.gov.in', 'CITIZEN_REPORTER', NULL)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

INSERT INTO event_sources (source_key, source_name, source_type) VALUES
('ENF_POLICE', 'TN Police Intercept', 'ENFORCEMENT'),
('CIT_API', 'Citizen Intake API', 'CITIZEN')
ON DUPLICATE KEY UPDATE source_name=VALUES(source_name);

INSERT INTO event_categories (category_key, category_name) VALUES
('SEIZURE_ENFORCEMENT', 'Seizure Enforcement'),
('INTERSTATE_TRANSIT', 'Interstate Transit')
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);

CREATE TABLE IF NOT EXISTS risk_zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  zone_code VARCHAR(40) NOT NULL UNIQUE,
  district_id INT NOT NULL,
  taluk_id INT NULL,
  name VARCHAR(150) NOT NULL,
  center_lat DECIMAL(10, 7) NOT NULL,
  center_lng DECIMAL(10, 7) NOT NULL,
  radius_meters INT DEFAULT 3500,
  risk_level VARCHAR(50) DEFAULT 'WATCH',
  confidence_level VARCHAR(50) DEFAULT 'MEDIUM',
  data_coverage VARCHAR(50) DEFAULT 'MODERATE',
  signal_count INT DEFAULT 5,
  verified_count INT DEFAULT 3,
  recent_trend VARCHAR(50) DEFAULT 'STABLE',
  historical_trend VARCHAR(50) DEFAULT 'RECURRING',
  primary_factors TEXT,
  date_range_start DATE,
  date_range_end DATE,
  disclaimer TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS spatial_associations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  origin_district_id INT NOT NULL,
  destination_district_id INT NOT NULL,
  corridor_name VARCHAR(150) NOT NULL,
  observation_count INT DEFAULT 1,
  confidence_level VARCHAR(50) DEFAULT 'MEDIUM',
  primary_categories VARCHAR(255) DEFAULT 'Ganja / Cannabis',
  primary_sources VARCHAR(255) DEFAULT 'TN Police',
  trend_direction VARCHAR(50) DEFAULT 'STABLE',
  waypoints_json TEXT,
  last_observed_date DATE,
  disclaimer TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (origin_district_id) REFERENCES districts(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_district_id) REFERENCES districts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alert_code VARCHAR(40) NOT NULL UNIQUE,
  alert_type VARCHAR(60) NOT NULL,
  severity VARCHAR(30) DEFAULT 'MEDIUM',
  district_id INT NOT NULL,
  taluk_id INT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  risk_level VARCHAR(50) DEFAULT 'WATCH',
  confidence_level VARCHAR(50) DEFAULT 'MEDIUM',
  data_coverage VARCHAR(50) DEFAULT 'MODERATE',
  status VARCHAR(50) DEFAULT 'NEW',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS checkposts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  district_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  checkpost_code VARCHAR(30) NOT NULL UNIQUE,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  border_type VARCHAR(50) DEFAULT 'INTER_DISTRICT',
  neighbor_state_district VARCHAR(100),
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS police_stations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  district_id INT NOT NULL,
  taluk_id INT NULL,
  name VARCHAR(150) NOT NULL,
  station_code VARCHAR(30) NOT NULL UNIQUE,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  jurisdiction_type VARCHAR(50) DEFAULT 'URBAN',
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
