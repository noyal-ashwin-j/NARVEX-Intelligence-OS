USE narvex;

-- -------------------------------------------------------------
-- NARC-INTEL (N-RISE) STATEWIDE INTELLIGENCE PLATFORM SCHEMA
-- Target Database: narvex
-- Focus: State of Tamil Nadu (38 Districts)
-- -------------------------------------------------------------

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_hash_chain;
DROP TABLE IF EXISTS action_tickets;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS forecast_records;
DROP TABLE IF EXISTS spatial_associations;
DROP TABLE IF EXISTS risk_threshold_configs;
DROP TABLE IF EXISTS risk_zones;
DROP TABLE IF EXISTS report_red_flags;
DROP TABLE IF EXISTS anonymous_tracking_tokens;
DROP TABLE IF EXISTS citizen_reports;
DROP TABLE IF EXISTS event_provenance;
DROP TABLE IF EXISTS intelligence_events;
DROP TABLE IF EXISTS data_upload_batches;
DROP TABLE IF EXISTS event_categories;
DROP TABLE IF EXISTS event_sources;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS checkposts;
DROP TABLE IF EXISTS police_stations;
DROP TABLE IF EXISTS taluks;
DROP TABLE IF EXISTS districts;
DROP TABLE IF EXISTS system_settings;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. DISTRICTS (All 38 Tamil Nadu Districts)
CREATE TABLE districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    headquarters VARCHAR(100),
    center_lat DECIMAL(10, 7) NOT NULL,
    center_lng DECIMAL(10, 7) NOT NULL,
    baseline_population INT DEFAULT 2000000,
    coverage_status ENUM('GOOD', 'MODERATE', 'LIMITED') DEFAULT 'MODERATE',
    risk_level ENUM('LOW', 'WATCH', 'INCREASING', 'HIGH PREVENTIVE ATTENTION') DEFAULT 'WATCH',
    confidence_score DECIMAL(5, 2) DEFAULT 75.00,
    active_alerts_count INT DEFAULT 0,
    emerging_zones_count INT DEFAULT 0,
    verified_events_count INT DEFAULT 0,
    pending_verification_count INT DEFAULT 0,
    historical_signal_count INT DEFAULT 0,
    recent_signal_count INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_district_risk (risk_level),
    INDEX idx_district_coords (center_lat, center_lng)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TALUKS
CREATE TABLE taluks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    district_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    center_lat DECIMAL(10, 7) NOT NULL,
    center_lng DECIMAL(10, 7) NOT NULL,
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    INDEX idx_taluk_district (district_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. POLICE STATIONS
CREATE TABLE police_stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    district_id INT NOT NULL,
    taluk_id INT NULL,
    name VARCHAR(150) NOT NULL,
    station_code VARCHAR(30) NOT NULL UNIQUE,
    lat DECIMAL(10, 7) NOT NULL,
    lng DECIMAL(10, 7) NOT NULL,
    jurisdiction_type ENUM('URBAN', 'RURAL', 'HIGHWAY', 'RAILWAY', 'COASTAL') DEFAULT 'URBAN',
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    FOREIGN KEY (taluk_id) REFERENCES taluks(id) ON DELETE SET NULL,
    INDEX idx_station_district (district_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CHECKPOSTS
CREATE TABLE checkposts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    district_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    checkpost_code VARCHAR(30) NOT NULL UNIQUE,
    lat DECIMAL(10, 7) NOT NULL,
    lng DECIMAL(10, 7) NOT NULL,
    border_type ENUM('INTER_STATE', 'INTER_DISTRICT', 'COASTAL', 'TOLL_PLAZA', 'FOREST') DEFAULT 'INTER_DISTRICT',
    neighbor_state_district VARCHAR(100),
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    INDEX idx_checkpost_district (district_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ROLES & RBAC
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_key VARCHAR(50) NOT NULL UNIQUE,
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    perm_key VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. USERS
CREATE TABLE users (
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
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL,
    INDEX idx_user_role (role_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. EVENT SOURCES
CREATE TABLE event_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_key VARCHAR(50) NOT NULL UNIQUE,
    source_name VARCHAR(120) NOT NULL,
    source_type ENUM('ENFORCEMENT', 'CHECKPOST', 'CITIZEN', 'HELPLINE', 'HEALTH_AGGREGATE', 'GOVT_DEPT', 'COMMUNITY_ORGANIZATION') NOT NULL,
    reliability_weight DECIMAL(3, 2) DEFAULT 0.80,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. EVENT CATEGORIES
CREATE TABLE event_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_key VARCHAR(50) NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL,
    parent_category VARCHAR(50) NULL,
    risk_weight DECIMAL(3, 2) DEFAULT 1.00,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. UPLOAD BATCHES
CREATE TABLE data_upload_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_code VARCHAR(40) NOT NULL UNIQUE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    file_size_bytes INT NOT NULL,
    total_rows INT DEFAULT 0,
    valid_rows INT DEFAULT 0,
    invalid_rows INT DEFAULT 0,
    duplicate_rows INT DEFAULT 0,
    pii_detected_count INT DEFAULT 0,
    uploader_user_id INT NULL,
    source_id INT NULL,
    status ENUM('PENDING', 'VALIDATED', 'PARTIAL_INGESTED', 'INGESTED', 'REJECTED') DEFAULT 'PENDING',
    mapping_config_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploader_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (source_id) REFERENCES event_sources(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. INTELLIGENCE EVENTS
CREATE TABLE intelligence_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_code VARCHAR(40) NOT NULL UNIQUE,
    district_id INT NOT NULL,
    taluk_id INT NULL,
    station_id INT NULL,
    checkpost_id INT NULL,
    location_name VARCHAR(200) NOT NULL,
    lat DECIMAL(10, 7) NOT NULL,
    lng DECIMAL(10, 7) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME DEFAULT '12:00:00',
    category_id INT NOT NULL,
    source_id INT NOT NULL,
    severity_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    is_enforcement TINYINT(1) DEFAULT 0,
    verification_status VARCHAR(64) DEFAULT 'UNVERIFIED',
    confidence_score DECIMAL(5, 2) DEFAULT 60.00,
    coverage_flag ENUM('GOOD', 'MODERATE', 'LIMITED') DEFAULT 'MODERATE',
    raw_description_redacted TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    FOREIGN KEY (taluk_id) REFERENCES taluks(id) ON DELETE SET NULL,
    FOREIGN KEY (station_id) REFERENCES police_stations(id) ON DELETE SET NULL,
    FOREIGN KEY (checkpost_id) REFERENCES checkposts(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES event_categories(id),
    FOREIGN KEY (source_id) REFERENCES event_sources(id),
    INDEX idx_event_district (district_id),
    INDEX idx_event_date (event_date),
    INDEX idx_event_category (category_id),
    INDEX idx_event_source (source_id),
    INDEX idx_event_verification (verification_status),
    INDEX idx_event_enforcement (is_enforcement),
    INDEX idx_event_coords (lat, lng)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. EVENT PROVENANCE (Traceability)
CREATE TABLE event_provenance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL UNIQUE,
    source_department VARCHAR(120) NOT NULL,
    source_file_name VARCHAR(255),
    sheet_name VARCHAR(100),
    source_row_number INT,
    batch_id INT NULL,
    raw_payload_hash VARCHAR(64) NOT NULL,
    extraction_confidence DECIMAL(5, 2) DEFAULT 85.00,
    classification_method ENUM('LLM_CLAUDE_SONNET', 'RULE_BASED', 'MANUAL_OFFICER_ENTRY') DEFAULT 'RULE_BASED',
    human_reviewer_id INT NULL,
    review_timestamp TIMESTAMP NULL,
    transformation_log TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES intelligence_events(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES data_upload_batches(id) ON DELETE SET NULL,
    FOREIGN KEY (human_reviewer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. CITIZEN REPORTS (Anonymous)
CREATE TABLE citizen_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_code VARCHAR(40) NOT NULL UNIQUE,
    tracking_token VARCHAR(20) NOT NULL UNIQUE,
    approximate_district_id INT NOT NULL,
    approximate_taluk_id INT NULL,
    approximate_location VARCHAR(200) NOT NULL,
    lat DECIMAL(10, 7) NOT NULL,
    lng DECIMAL(10, 7) NOT NULL,
    report_date DATE NOT NULL,
    category_id INT NOT NULL,
    redacted_content TEXT NOT NULL,
    audio_transcript TEXT,
    has_attachment TINYINT(1) DEFAULT 0,
    attachment_name VARCHAR(255),
    status VARCHAR(64) DEFAULT 'RECEIVED',
    duplicate_flag TINYINT(1) DEFAULT 0,
    burst_pattern_flag TINYINT(1) DEFAULT 0,
    confidence_score DECIMAL(5, 2) DEFAULT 40.00,
    reviewer_notes TEXT,
    assigned_officer_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (approximate_district_id) REFERENCES districts(id) ON DELETE CASCADE,
    FOREIGN KEY (approximate_taluk_id) REFERENCES taluks(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES event_categories(id),
    FOREIGN KEY (assigned_officer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_citizen_token (tracking_token),
    INDEX idx_citizen_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. ANONYMOUS TRACKING TOKENS
CREATE TABLE anonymous_tracking_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token_code VARCHAR(20) NOT NULL UNIQUE,
    citizen_report_id INT NOT NULL UNIQUE,
    current_stage ENUM('RECEIVED', 'UNDER_REVIEW', 'NEEDS_VERIFICATION', 'CORROBORATED', 'REFERRED', 'CLOSED') DEFAULT 'RECEIVED',
    stage_received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stage_review_at TIMESTAMP NULL,
    stage_corroboration_at TIMESTAMP NULL,
    stage_referred_at TIMESTAMP NULL,
    stage_closed_at TIMESTAMP NULL,
    public_status_message VARCHAR(255) DEFAULT 'Signal successfully registered in state intelligence queue.',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_report_id) REFERENCES citizen_reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. REPORT RED FLAGS
CREATE TABLE report_red_flags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    flag_type ENUM('POTENTIAL_DUPLICATE', 'COORDINATED_BURST', 'LOW_CONFIDENCE', 'LOCATION_AMBIGUITY', 'AUTOMATION_PATTERN') NOT NULL,
    reason TEXT NOT NULL,
    score DECIMAL(5, 2) DEFAULT 50.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES citizen_reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. RISK ZONES
CREATE TABLE risk_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_code VARCHAR(40) NOT NULL UNIQUE,
    district_id INT NOT NULL,
    taluk_id INT NULL,
    name VARCHAR(150) NOT NULL,
    center_lat DECIMAL(10, 7) NOT NULL,
    center_lng DECIMAL(10, 7) NOT NULL,
    radius_meters INT DEFAULT 3500,
    risk_level ENUM('LOW', 'WATCH', 'INCREASING', 'HIGH PREVENTIVE ATTENTION') NOT NULL,
    confidence_level ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    data_coverage ENUM('GOOD', 'MODERATE', 'LIMITED') NOT NULL,
    signal_count INT DEFAULT 0,
    verified_count INT DEFAULT 0,
    recent_trend ENUM('RISING', 'STABLE', 'DECLINING') DEFAULT 'STABLE',
    historical_trend ENUM('PERSISTENT', 'RECURRING', 'NEW_EMERGING') DEFAULT 'RECURRING',
    primary_factors TEXT NOT NULL,
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    disclaimer TEXT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    FOREIGN KEY (taluk_id) REFERENCES taluks(id) ON DELETE SET NULL,
    INDEX idx_zone_district (district_id),
    INDEX idx_zone_risk (risk_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. RISK THRESHOLD CONFIGS
CREATE TABLE risk_threshold_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version_tag VARCHAR(50) NOT NULL UNIQUE,
    watch_threshold INT DEFAULT 5,
    rising_threshold INT DEFAULT 12,
    high_threshold INT DEFAULT 25,
    min_confidence_for_high DECIMAL(5, 2) DEFAULT 70.00,
    population_weight DECIMAL(3, 2) DEFAULT 0.35,
    is_active TINYINT(1) DEFAULT 1,
    notes TEXT,
    modified_by INT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. SPATIAL ASSOCIATIONS (District-to-District)
CREATE TABLE spatial_associations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    origin_district_id INT NOT NULL,
    destination_district_id INT NOT NULL,
    corridor_name VARCHAR(150) NOT NULL,
    observation_count INT DEFAULT 1,
    confidence_level ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    primary_categories VARCHAR(255) NOT NULL,
    primary_sources VARCHAR(255) NOT NULL,
    trend_direction ENUM('RISING', 'STABLE', 'DECLINING') DEFAULT 'STABLE',
    waypoints_json TEXT,
    last_observed_date DATE NOT NULL,
    disclaimer TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (origin_district_id) REFERENCES districts(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_district_id) REFERENCES districts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. FORECAST RECORDS
CREATE TABLE forecast_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    forecast_code VARCHAR(40) NOT NULL UNIQUE,
    district_id INT NOT NULL,
    taluk_id INT NULL,
    center_lat DECIMAL(10, 7) NOT NULL,
    center_lng DECIMAL(10, 7) NOT NULL,
    radius_meters INT DEFAULT 4000,
    forecast_window_days INT NOT NULL,
    risk_level ENUM('WATCH', 'INCREASING', 'HIGH PREVENTIVE ATTENTION') NOT NULL,
    confidence_level ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    data_coverage ENUM('GOOD', 'MODERATE', 'LIMITED') NOT NULL,
    historical_contributing_factors TEXT NOT NULL,
    model_version VARCHAR(50) DEFAULT 'NRISE-RISK-v1.0',
    training_date DATE NOT NULL,
    disclaimer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    FOREIGN KEY (taluk_id) REFERENCES taluks(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. ALERTS
CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_code VARCHAR(40) NOT NULL UNIQUE,
    alert_type ENUM('NEW_SIGNAL', 'RAPID_INCREASE', 'EMERGING_ZONE', 'SPATIAL_TEMPORAL_PATTERN', 'ROUTE_ASSOCIATION', 'DATA_ANOMALY', 'HIGH_RISK_LOW_CONFIDENCE', 'FORECASTED_INCREASE') NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    district_id INT NOT NULL,
    taluk_id INT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    risk_level ENUM('LOW', 'WATCH', 'INCREASING', 'HIGH PREVENTIVE ATTENTION') NOT NULL,
    confidence_level ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    data_coverage ENUM('GOOD', 'MODERATE', 'LIMITED') NOT NULL,
    event_id INT NULL,
    risk_zone_id INT NULL,
    assigned_user_id INT NULL,
    status ENUM('NEW', 'ACKNOWLEDGED', 'UNDER_INVESTIGATION', 'TICKET_CREATED', 'DISMISSED', 'RESOLVED') DEFAULT 'NEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    FOREIGN KEY (taluk_id) REFERENCES taluks(id) ON DELETE SET NULL,
    FOREIGN KEY (event_id) REFERENCES intelligence_events(id) ON DELETE SET NULL,
    FOREIGN KEY (risk_zone_id) REFERENCES risk_zones(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_alert_status (status),
    INDEX idx_alert_district (district_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. ACTION TICKETS
CREATE TABLE action_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_code VARCHAR(40) NOT NULL UNIQUE,
    alert_id INT NOT NULL,
    assigned_department VARCHAR(120) NOT NULL,
    assigned_user_id INT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    action_type ENUM('FIELD_VERIFICATION', 'CHECKPOST_INSPECTION_ENHANCEMENT', 'COMMUNITY_AWARENESS', 'DEPT_COORDINATION', 'SPECIAL_PATROL_MONITORING') NOT NULL,
    verification_status ENUM('OPEN', 'ASSIGNED', 'UNDER_VERIFICATION', 'ACTION_TAKEN', 'MONITORING', 'CLOSED') DEFAULT 'OPEN',
    operational_notes TEXT,
    outcome_type ENUM('PREVENTIVE_INTERVENTION_COMPLETED', 'FALSE_ALARM_RESOLVED', 'REFERRED_TO_REHAB', 'EVIDENCE_CORROBORATED', 'MONITORING_ONGOING') NULL,
    outcome_notes TEXT,
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ticket_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. AUDIT HASH CHAIN (Append-Only Cryptographic Chain)
CREATE TABLE audit_hash_chain (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sequence_num INT NOT NULL UNIQUE,
    actor_user_id INT NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(80) NOT NULL,
    prev_hash VARCHAR(64) NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    block_hash VARCHAR(64) NOT NULL,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_seq (sequence_num)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. SYSTEM SETTINGS
CREATE TABLE system_settings (
    setting_key VARCHAR(80) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- SEED DATA: ROLES & SYSTEM SETTINGS
-- -------------------------------------------------------------

INSERT INTO roles (role_key, role_name, description) VALUES
('STATE_ADMIN', 'State Intelligence Administrator', 'Full statewide oversight, model governance, user management, policy thresholds'),
('DISTRICT_OFFICER', 'District Intelligence Officer', 'District-level command, triage, localized filter & ticket routing'),
('VERIFICATION_OFFICER', 'Intelligence Verification Analyst', 'Data validation, provenance review, citizen report corroboration'),
('CITIZEN_REPORTER', 'Citizen Reporter (Public)', 'Anonymous submission and status tracking only');

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('PLATFORM_NAME', 'NARC-INTEL (N-RISE)', 'Statewide Narcotic Intelligence & Preventive Risk Monitoring Platform'),
('STATE_NAME', 'Tamil Nadu', 'Jurisdiction state'),
('MODEL_ACTIVE_VERSION', 'NRISE-RISK-v1.0', 'Active predictive risk and clustering model version'),
('DATASET_CLASSIFICATION', 'SYNTHETIC_DEMO_DATA', 'Dataset watermark status'),
('AUDIT_HASH_GENESIS', '0000000000000000000000000000000000000000000000000000000000000000', 'Genesis hash for SHA-256 chain');

INSERT INTO risk_threshold_configs (version_tag, watch_threshold, rising_threshold, high_threshold, min_confidence_for_high, population_weight, is_active, notes) VALUES
('DEFAULT_TN_2026_V1', 5, 12, 25, 70.00, 0.35, 1, 'Standard baseline threshold calibrated for Tamil Nadu districts with population normalization.');

INSERT INTO event_sources (source_key, source_name, source_type, reliability_weight, description) VALUES
('POLICE_FIR', 'Law Enforcement Station Record', 'ENFORCEMENT', 0.95, 'Authorized police station initial intelligence / seizure log'),
('CHECKPOST_LOG', 'Interstate/Interdistrict Checkpost Log', 'CHECKPOST', 0.90, 'Vehicular border inspection & scanner records'),
('CITIZEN_ANON', 'Anonymous Citizen Portal', 'CITIZEN', 0.50, 'Unverified public tip requiring corroboration'),
('HELPLINE_1058', 'State Anti-Drug Helpline (1058)', 'HELPLINE', 0.65, 'Toll-free telephonic reporting'),
('HEALTH_AGGREGATE', 'Health & Rehabilitation Aggregate Signal', 'HEALTH_AGGREGATE', 0.80, 'Aggregated non-PII medical / detox center service demand'),
('STF_INTEL', 'Special Task Force Intelligence Unit', 'ENFORCEMENT', 0.95, 'Dedicated state narcotics intelligence unit field log');

INSERT INTO event_categories (category_key, category_name, parent_category, risk_weight, description) VALUES
('SUPPLY_SALE', 'Suspected Distribution / Sale', 'SUPPLY', 1.00, 'Signals indicating distribution points or exchanges'),
('TRANSPORT_TRANSIT', 'Suspected Transit / Route Activity', 'LOGISTICS', 0.90, 'Movement along highway corridors or border crossings'),
('SEIZURE_ENFORCEMENT', 'Enforcement Seizure Interception', 'ENFORCEMENT', 0.85, 'Official confiscation or interception activity'),
('COMMUNITY_CONCERN', 'Community & Neighborhood Concern', 'PREVENTION', 0.60, 'Public reporting regarding vulnerable public areas'),
('HEALTH_EMERGENCY', 'Health / Overdose Emergency Signal', 'HEALTH', 0.80, 'Medical emergency response aggregate indicator'),
('REHAB_SERVICE_NEED', 'Rehabilitation / Counseling Request', 'HEALTH', 0.40, 'Voluntary request for de-addiction service');

-- -------------------------------------------------------------
-- SEED DATA: ALL 38 TAMIL NADU DISTRICTS
-- -------------------------------------------------------------
INSERT INTO districts (id, code, name, headquarters, center_lat, center_lng, baseline_population, coverage_status, risk_level, confidence_score, active_alerts_count, emerging_zones_count, verified_events_count, pending_verification_count, historical_signal_count, recent_signal_count) VALUES
(1, 'CHN', 'Chennai', 'Chennai', 13.0827, 80.2707, 7100000, 'GOOD', 'INCREASING', 88.00, 6, 2, 45, 12, 120, 34),
(2, 'CBE', 'Coimbatore', 'Coimbatore', 11.0168, 76.9558, 3450000, 'GOOD', 'HIGH PREVENTIVE ATTENTION', 85.00, 8, 3, 58, 15, 142, 48),
(3, 'MDU', 'Madurai', 'Madurai', 9.9252, 78.1198, 3038000, 'GOOD', 'INCREASING', 82.00, 5, 1, 38, 9, 98, 28),
(4, 'SLM', 'Salem', 'Salem', 11.6643, 78.1460, 3480000, 'GOOD', 'INCREASING', 79.00, 4, 1, 32, 8, 85, 24),
(5, 'TRY', 'Tiruchirappalli', 'Tiruchirappalli', 10.7905, 78.7047, 2722000, 'GOOD', 'WATCH', 75.00, 3, 0, 24, 7, 72, 18),
(6, 'TNI', 'Tirunelveli', 'Tirunelveli', 8.7139, 77.7567, 1665000, 'MODERATE', 'WATCH', 72.00, 2, 1, 19, 5, 55, 14),
(7, 'ERD', 'Erode', 'Erode', 11.3410, 77.7172, 2250000, 'GOOD', 'INCREASING', 80.00, 4, 1, 29, 6, 68, 22),
(8, 'TPR', 'Tiruppur', 'Tiruppur', 11.1085, 77.3411, 2479000, 'GOOD', 'INCREASING', 78.00, 3, 1, 26, 8, 64, 20),
(9, 'VEL', 'Vellore', 'Vellore', 12.9165, 79.1325, 1614000, 'GOOD', 'INCREASING', 81.00, 4, 1, 27, 7, 74, 21),
(10, 'KRI', 'Krishnagiri', 'Krishnagiri', 12.5186, 78.2137, 1879000, 'GOOD', 'HIGH PREVENTIVE ATTENTION', 86.00, 7, 2, 42, 11, 105, 36),
(11, 'DPI', 'Dharmapuri', 'Dharmapuri', 12.1211, 78.1582, 1506000, 'MODERATE', 'WATCH', 70.00, 2, 0, 14, 4, 42, 10),
(12, 'DGL', 'Dindigul', 'Dindigul', 10.3673, 77.9803, 2159000, 'MODERATE', 'WATCH', 68.00, 2, 1, 16, 5, 48, 12),
(13, 'KKI', 'Kanyakumari', 'Nagercoil', 8.0883, 77.5385, 1870000, 'GOOD', 'WATCH', 74.00, 2, 0, 20, 6, 52, 15),
(14, 'TSI', 'Tenkasi', 'Tenkasi', 8.9594, 77.3152, 1407000, 'MODERATE', 'HIGH PREVENTIVE ATTENTION', 65.00, 6, 4, 22, 14, 38, 26),
(15, 'THN', 'Theni', 'Theni', 10.0104, 77.4768, 1245000, 'MODERATE', 'INCREASING', 76.00, 3, 1, 21, 5, 50, 17),
(16, 'NKL', 'Namakkal', 'Namakkal', 11.2189, 78.1674, 1726000, 'MODERATE', 'WATCH', 69.00, 1, 0, 15, 3, 39, 9),
(17, 'KRR', 'Karur', 'Karur', 10.9601, 78.0766, 1064000, 'MODERATE', 'LOW', 72.00, 1, 0, 11, 2, 28, 6),
(18, 'TNJ', 'Thanjavur', 'Thanjavur', 10.7870, 79.1378, 2405000, 'GOOD', 'WATCH', 73.00, 2, 0, 18, 5, 46, 11),
(19, 'TUV', 'Tiruvarur', 'Tiruvarur', 10.7661, 79.6344, 1264000, 'LIMITED', 'LOW', 55.00, 0, 0, 8, 2, 22, 4),
(20, 'NGP', 'Nagapattinam', 'Nagapattinam', 10.7672, 79.8449, 697000, 'MODERATE', 'WATCH', 70.00, 2, 1, 16, 4, 39, 11),
(21, 'MYD', 'Mayiladuthurai', 'Mayiladuthurai', 11.1018, 79.6522, 918000, 'LIMITED', 'LOW', 58.00, 1, 0, 7, 3, 19, 5),
(22, 'CUD', 'Cuddalore', 'Cuddalore', 11.7480, 79.7714, 2605000, 'GOOD', 'WATCH', 75.00, 2, 0, 21, 6, 54, 13),
(23, 'VPM', 'Villupuram', 'Villupuram', 11.9401, 79.4861, 2093000, 'GOOD', 'INCREASING', 77.00, 3, 1, 23, 7, 60, 16),
(24, 'KLU', 'Kallakurichi', 'Kallakurichi', 11.7384, 78.9639, 1370000, 'LIMITED', 'WATCH', 60.00, 2, 1, 12, 4, 31, 8),
(25, 'TVM', 'Tiruvannamalai', 'Tiruvannamalai', 12.2253, 79.0747, 2464000, 'MODERATE', 'WATCH', 71.00, 2, 0, 17, 5, 45, 10),
(26, 'RPT', 'Ranipet', 'Ranipet', 12.9272, 79.3330, 1210000, 'MODERATE', 'WATCH', 73.00, 1, 0, 14, 3, 36, 8),
(27, 'TPT', 'Tirupattur', 'Tirupattur', 12.4925, 78.5678, 1111000, 'MODERATE', 'WATCH', 70.00, 2, 1, 15, 4, 38, 10),
(28, 'TLR', 'Tiruvallur', 'Tiruvallur', 13.1438, 79.9079, 3728000, 'GOOD', 'INCREASING', 83.00, 5, 1, 35, 10, 89, 25),
(29, 'CGL', 'Chengalpattu', 'Chengalpattu', 12.6819, 79.9888, 2556000, 'GOOD', 'INCREASING', 82.00, 4, 1, 30, 8, 78, 22),
(30, 'KCH', 'Kancheepuram', 'Kancheepuram', 12.8342, 79.7036, 1664000, 'GOOD', 'WATCH', 76.00, 2, 0, 18, 5, 47, 12),
(31, 'PDK', 'Pudukkottai', 'Pudukkottai', 10.3797, 78.8208, 1618000, 'MODERATE', 'LOW', 66.00, 1, 0, 10, 3, 27, 5),
(32, 'SVG', 'Sivaganga', 'Sivaganga', 9.8433, 78.4809, 1339000, 'LIMITED', 'LOW', 62.00, 1, 0, 9, 2, 24, 5),
(33, 'RMD', 'Ramanathapuram', 'Ramanathapuram', 9.3639, 78.8395, 1353000, 'MODERATE', 'INCREASING', 76.00, 4, 2, 25, 7, 62, 19),
(34, 'VNR', 'Virudhunagar', 'Virudhunagar', 9.5680, 77.9624, 1942000, 'MODERATE', 'WATCH', 71.00, 2, 0, 15, 4, 40, 9),
(35, 'TUK', 'Thoothukudi', 'Thoothukudi', 8.7642, 78.1348, 1750000, 'GOOD', 'INCREASING', 81.00, 4, 1, 31, 8, 76, 23),
(36, 'NIL', 'Nilgiris', 'Udhagamandalam', 11.4102, 76.6950, 735000, 'MODERATE', 'WATCH', 72.00, 2, 1, 13, 3, 33, 8),
(37, 'ARI', 'Ariyalur', 'Ariyalur', 11.1401, 79.0786, 754000, 'LIMITED', 'LOW', 52.00, 0, 0, 5, 2, 16, 3),
(38, 'PER', 'Perambalur', 'Perambalur', 11.2342, 78.8820, 565000, 'LIMITED', 'LOW', 50.00, 0, 0, 4, 1, 14, 2);

-- -------------------------------------------------------------
-- SEED DATA: KEY TALUKS, POLICE STATIONS & CHECKPOSTS
-- -------------------------------------------------------------
INSERT INTO taluks (district_id, name, center_lat, center_lng) VALUES
(2, 'Coimbatore North', 11.0500, 76.9600),
(2, 'Coimbatore South', 10.9800, 76.9500),
(2, 'Pollachi', 10.6580, 77.0080),
(2, 'Sulur', 11.0260, 77.1260),
(10, 'Hosur', 12.7409, 77.8253),
(10, 'Krishnagiri', 12.5186, 78.2137),
(14, 'Tenkasi', 8.9594, 77.3152),
(14, 'Shenkottai', 8.9833, 77.2500),
(1, 'Egmore', 13.0784, 80.2608),
(1, 'T Nagar', 13.0418, 80.2341),
(3, 'Madurai North', 9.9400, 78.1300),
(4, 'Salem West', 11.6600, 78.1200);

INSERT INTO checkposts (district_id, name, checkpost_code, lat, lng, border_type, neighbor_state_district) VALUES
(2, 'Walayar Interstate Checkpost', 'CP-CBE-01', 10.8428, 76.8520, 'INTER_STATE', 'Palakkad (Kerala)'),
(2, 'Gopalapuram Checkpost', 'CP-CBE-02', 10.6800, 76.8900, 'INTER_STATE', 'Palakkad (Kerala)'),
(10, 'Zuzuvadi Interstate Checkpost', 'CP-KRI-01', 12.7630, 77.7800, 'INTER_STATE', 'Attibele (Karnataka)'),
(14, 'Aryankavu - Puliyarai Checkpost', 'CP-TSI-01', 8.9750, 77.1750, 'INTER_STATE', 'Kollam (Kerala)'),
(28, 'Gummidipoondi Checkpost', 'CP-TLR-01', 13.4050, 80.1250, 'INTER_STATE', 'Tada (Andhra Pradesh)'),
(33, 'Mandapam Coastal Checkpost', 'CP-RMD-01', 9.2780, 79.1230, 'COASTAL', 'Palk Strait Corridor'),
(35, 'VOC Port Logistics Checkpost', 'CP-TUK-01', 8.7520, 78.1850, 'COASTAL', 'Gulf of Mannar Route');

INSERT INTO police_stations (district_id, taluk_id, name, station_code, lat, lng, jurisdiction_type) VALUES
(2, 1, 'Gandhipuram Police Station', 'PS-CBE-01', 11.0180, 76.9680, 'URBAN'),
(2, 2, 'Ukadadam Police Station', 'PS-CBE-02', 10.9850, 76.9620, 'URBAN'),
(2, 3, 'Pollachi Town Station', 'PS-CBE-03', 10.6620, 77.0120, 'HIGHWAY'),
(10, 5, 'Hosur SIPCOT Police Station', 'PS-KRI-01', 12.7550, 77.8120, 'HIGHWAY'),
(14, 8, 'Shenkottai Police Station', 'PS-TSI-01', 8.9800, 77.2480, 'HIGHWAY'),
(1, 9, 'Egmore Police Station', 'PS-CHN-01', 13.0800, 80.2610, 'URBAN'),
(3, 11, 'Madurai Junction Station', 'PS-MDU-01', 9.9280, 78.1120, 'RAILWAY');

-- -------------------------------------------------------------
-- SEED DATA: USERS (4 MVP ROLES)
-- Password for all seed users is 'Admin@123'
-- Hash: $2a$10$sv3Wp/bGmCuPU9Si6jM45.ZQ7plK5dMvpF8RN.F76H.1BRNwIPb7q
-- -------------------------------------------------------------
INSERT INTO users (username, password_hash, full_name, email, role_key, district_id, department, badge_number) VALUES
('state_admin', '$2a$10$sv3Wp/bGmCuPU9Si6jM45.ZQ7plK5dMvpF8RN.F76H.1BRNwIPb7q', 'Dr. S. K. Ramanathan, IPS', 'admin.intel@tn.gov.in', 'STATE_ADMIN', NULL, 'State Intelligence Command', 'IPS-TN-0482'),
('district_cbe', '$2a$10$sv3Wp/bGmCuPU9Si6jM45.ZQ7plK5dMvpF8RN.F76H.1BRNwIPb7q', 'M. Anbarasu, DSP', 'cbe.intel@tn.gov.in', 'DISTRICT_OFFICER', 2, 'Coimbatore District Intelligence Unit', 'DSP-CBE-109'),
('analyst_priya', '$2a$10$sv3Wp/bGmCuPU9Si6jM45.ZQ7plK5dMvpF8RN.F76H.1BRNwIPb7q', 'Priya Soundararajan', 'priya.analyst@tn.gov.in', 'VERIFICATION_OFFICER', NULL, 'State Risk Triage Wing', 'V-ANL-882'),
('citizen_demo', '$2a$10$sv3Wp/bGmCuPU9Si6jM45.ZQ7plK5dMvpF8RN.F76H.1BRNwIPb7q', 'Citizen Portal Demo Account', 'citizen.portal@tn.gov.in', 'CITIZEN_REPORTER', NULL, 'Public Anonymous Reporting', 'PUB-DEMO-001');

-- -------------------------------------------------------------
-- SEED DATA: REALISTIC SYNTHETIC DEMONSTRATION INTELLIGENCE EVENTS
-- -------------------------------------------------------------
INSERT INTO intelligence_events (id, event_code, district_id, taluk_id, station_id, checkpost_id, location_name, lat, lng, event_date, event_time, category_id, source_id, severity_level, is_enforcement, verification_status, confidence_score, coverage_flag, raw_description_redacted, notes) VALUES
(1, 'EVT-2026-0801', 2, 1, 1, NULL, 'Gandhipuram Commercial Transit Junction', 11.0185, 76.9685, '2026-08-12', '18:30:00', 1, 1, 'HIGH', 1, 'VERIFIED', 92.00, 'GOOD', '[REDACTED] Interception of parcel transit package containing commercial synthetic contrabands near central terminal.', 'Corroborated by joint STF team. Provenance file checkpost_august_2026.xlsx.'),
(2, 'EVT-2026-0802', 2, NULL, NULL, 1, 'Walayar Interstate Border Point', 10.8430, 76.8525, '2026-08-14', '03:15:00', 2, 2, 'HIGH', 1, 'VERIFIED', 89.00, 'GOOD', '[REDACTED] Heavy commercial transport container scanned with irregular density discrepancy in hidden partition.', 'Routine scanner checkpost log #8821.'),
(3, 'EVT-2026-0803', 2, 2, 2, NULL, 'Ukadadam Highway Bypass', 10.9855, 76.9625, '2026-08-15', '21:00:00', 4, 3, 'MEDIUM', 0, 'CORROBORATED', 68.00, 'GOOD', '[REDACTED] Anonymous community report regarding unusual night vehicle parking and exchange activity.', 'Multiple independent citizen reports recorded within 48 hours.'),
(4, 'EVT-2026-0804', 10, 5, 4, 3, 'Hosur SIPCOT Industrial Corridor', 12.7555, 77.8125, '2026-08-10', '14:20:00', 2, 2, 'HIGH', 1, 'VERIFIED', 91.00, 'GOOD', '[REDACTED] Inter-state consignment interception moving across boundary junction.', 'Checkpost telemetry alert triggered.'),
(5, 'EVT-2026-0805', 14, 8, 5, 4, 'Puliyarai Border Check Corridor', 8.9755, 77.1755, '2026-08-16', '22:45:00', 2, 3, 'HIGH', 0, 'UNDER_REVIEW', 58.00, 'MODERATE', '[REDACTED] Community tips indicating recent unmonitored vehicle halts along bypass lane.', 'Emerging signal burst detected in past 7 days.'),
(6, 'EVT-2026-0806', 1, 9, 6, NULL, 'Egmore Terminal Logistics Hub', 13.0805, 80.2615, '2026-08-11', '11:00:00', 1, 1, 'HIGH', 1, 'VERIFIED', 94.00, 'GOOD', '[REDACTED] Joint rail enforcement seizure of suspicious shipment.', 'Corroborated with inter-state registry.'),
(7, 'EVT-2026-0807', 3, 11, 7, NULL, 'Madurai Junction Goods Shed', 9.9285, 78.1125, '2026-08-09', '19:40:00', 2, 1, 'MEDIUM', 1, 'VERIFIED', 85.00, 'GOOD', '[REDACTED] Railway parcel scrutiny identified contraband transit package.', 'Under tracking for provenance linkage.'),
(8, 'EVT-2026-0808', 4, 12, NULL, NULL, 'Salem Steel Plant Bypass Junction', 11.6620, 78.1250, '2026-08-13', '04:10:00', 2, 2, 'HIGH', 1, 'VERIFIED', 88.00, 'GOOD', '[REDACTED] Highway patrol inter-district transit checkpoint inspection.', 'Highway patrol log unit #14.');

-- -------------------------------------------------------------
-- SEED DATA: PROVENANCE RECORDS ("Why is this here?")
-- -------------------------------------------------------------
INSERT INTO event_provenance (event_id, source_department, source_file_name, sheet_name, source_row_number, batch_id, raw_payload_hash, extraction_confidence, classification_method, human_reviewer_id, review_timestamp, transformation_log) VALUES
(1, 'District Intelligence Wing - Coimbatore', 'cbe_stf_log_2026_q3.xlsx', 'Seizures_Aug', 42, NULL, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 94.50, 'RULE_BASED', 2, '2026-08-12 19:15:00', 'Extracted via CSV parser, PII scrubbed, location mapped to Gandhipuram PS coordinates.'),
(2, 'Walayar Border Directorate', 'checkpost_august_2026.xlsx', 'Sheet_2', 182, NULL, 'f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2', 89.00, 'RULE_BASED', 3, '2026-08-14 04:00:00', 'Automated checkpost telemetry ingested with verified density report #8821.'),
(3, 'State Anonymous Helpline Center', 'helpline_transcripts_aug26.csv', 'CallRecords', 94, NULL, '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', 72.00, 'RULE_BASED', 3, '2026-08-15 22:30:00', 'Citizen phone complaint transcribed, names/numbers redacted, spatial cluster matched with Ukadadam PS.'),
(4, 'Hosur Commercial Tax & Checkpost Post', 'kri_border_logs_august.csv', 'Data', 61, NULL, 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35', 91.00, 'RULE_BASED', 2, '2026-08-10 15:00:00', 'Scanned manifest discrepancy logged and verified by Inspector Hosur.'),
(5, 'Tenkasi Field Observation Wing', 'tenkasi_border_unverified_burst.csv', 'Sheet1', 12, NULL, '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce', 62.00, 'RULE_BASED', 3, '2026-08-16 23:00:00', 'Emerging signal burst; queued for physical field verification.');

-- -------------------------------------------------------------
-- SEED DATA: CITIZEN ANONYMOUS REPORTS & TRACKING TOKENS
-- -------------------------------------------------------------
INSERT INTO citizen_reports (id, report_code, tracking_token, approximate_district_id, approximate_taluk_id, approximate_location, lat, lng, report_date, category_id, redacted_content, status, duplicate_flag, burst_pattern_flag, confidence_score) VALUES
(1, 'CIT-2026-901', 'TN-7X9K-42PQ', 2, 2, 'Near Ukkadam Bus Depot Bypass', 10.9850, 76.9620, '2026-08-16', 4, '[REDACTED] Recurring late-night vehicle exchanges observed behind public transit shed.', 'CORROBORATING', 0, 0, 65.00),
(2, 'CIT-2026-902', 'TN-3M8V-91XY', 14, 8, 'Shenkottai Railway Gate Crossing Area', 8.9800, 77.2480, '2026-08-17', 2, '[REDACTED] Suspicious luggage transfers from non-registered transport vans during train arrival hours.', 'UNDER_REVIEW', 0, 1, 55.00),
(3, 'CIT-2026-903', 'TN-4K2L-19WZ', 10, 5, 'Near Hosur Ring Road Junction', 12.7450, 77.8200, '2026-08-17', 1, '[REDACTED] Frequent unverified gatherings near vacant godown on highway service road.', 'RECEIVED', 0, 0, 45.00);

INSERT INTO anonymous_tracking_tokens (token_code, citizen_report_id, current_stage, stage_received_at, stage_review_at, stage_corroboration_at, public_status_message) VALUES
('TN-7X9K-42PQ', 1, 'CORROBORATED', '2026-08-16 10:00:00', '2026-08-16 14:00:00', '2026-08-17 09:00:00', 'Signal matched with existing cluster. Under preventive field review.'),
('TN-3M8V-91XY', 2, 'UNDER_REVIEW', '2026-08-17 08:30:00', '2026-08-17 11:15:00', NULL, 'Signal under triage by District Verification Officer.'),
('TN-4K2L-19WZ', 3, 'RECEIVED', '2026-08-17 19:45:00', NULL, NULL, 'Signal successfully registered in state intelligence queue.');

-- -------------------------------------------------------------
-- SEED DATA: RISK INDICATOR ZONES (Separate Risk / Confidence / Coverage)
-- -------------------------------------------------------------
INSERT INTO risk_zones (id, zone_code, district_id, taluk_id, name, center_lat, center_lng, radius_meters, risk_level, confidence_level, data_coverage, signal_count, verified_count, recent_trend, historical_trend, primary_factors, date_range_start, date_range_end, disclaimer) VALUES
(1, 'RZ-CBE-WALAYAR', 2, 1, 'Walayar - Gandhipuram Logistics Corridor', 10.9400, 76.9100, 5500, 'HIGH PREVENTIVE ATTENTION', 'HIGH', 'GOOD', 34, 22, 'RISING', 'PERSISTENT', 'Recent signal spike (+45%), multiple independent sources, historical interstate route recurrence', '2026-01-01', '2026-08-18', 'Risk indicators represent patterns in available data for preventive planning and do not establish criminal activity, consumption, or guaranteed guilt.'),
(2, 'RZ-KRI-HOSUR', 10, 5, 'Hosur - Attibele Interstate Gateway Zone', 12.7500, 77.8100, 4800, 'HIGH PREVENTIVE ATTENTION', 'HIGH', 'GOOD', 28, 19, 'RISING', 'PERSISTENT', 'High transit corridor density, checkpost scanner anomalies, repeated cargo verification requests', '2026-01-01', '2026-08-18', 'Risk indicators represent patterns in available data for preventive planning and do not establish criminal activity, consumption, or guaranteed guilt.'),
(3, 'RZ-TSI-PULIYARAI', 14, 8, 'Tenkasi - Puliyarai Ghat Corridor (Emerging)', 8.9700, 77.2200, 3800, 'HIGH PREVENTIVE ATTENTION', 'MEDIUM', 'MODERATE', 16, 7, 'RISING', 'NEW_EMERGING', 'Recent unverified signal burst (+180% over 14 days), sparse historical baseline, uncorroborated night transit tips', '2026-06-01', '2026-08-18', 'Risk indicators represent patterns in available data for preventive planning and do not establish criminal activity, consumption, or guaranteed guilt.'),
(4, 'RZ-CHN-CENTRAL', 1, 9, 'Chennai Central - Egmore Rail Corridor', 13.0800, 80.2650, 3200, 'INCREASING', 'HIGH', 'GOOD', 25, 18, 'STABLE', 'RECURRING', 'Parcel hub seizure logs, inter-state transit linkages, dense station coverage', '2026-01-01', '2026-08-18', 'Risk indicators represent patterns in available data for preventive planning and do not establish criminal activity, consumption, or guaranteed guilt.'),
(5, 'RZ-RMD-MANDAPAM', 33, NULL, 'Mandapam Coastal Belt Zone', 9.2800, 79.1200, 6000, 'INCREASING', 'MEDIUM', 'MODERATE', 18, 11, 'RISING', 'RECURRING', 'Coastal patrol inter-agency advisories, maritime checkpost telemetry', '2026-02-01', '2026-08-18', 'Risk indicators represent patterns in available data for preventive planning and do not establish criminal activity, consumption, or guaranteed guilt.');

-- -------------------------------------------------------------
-- SEED DATA: SPATIAL ASSOCIATIONS (District-to-District Historical Corridors)
-- -------------------------------------------------------------
INSERT INTO spatial_associations (origin_district_id, destination_district_id, corridor_name, observation_count, confidence_level, primary_categories, primary_sources, trend_direction, waypoints_json, last_observed_date, disclaimer) VALUES
(10, 4, 'Krishnagiri → Salem NH44 Industrial Axis', 42, 'HIGH', 'Transit, Supply', 'Checkpost, Police Station', 'RISING', '[[12.5186, 78.2137], [12.1211, 78.1582], [11.6643, 78.1460]]', '2026-08-14', 'Historical spatial association observed based on available records. Does not establish confirmed trafficking without case-specific evidence.'),
(4, 2, 'Salem → Coimbatore NH544 Freight Corridor', 56, 'HIGH', 'Transit, Seizure', 'Checkpost, STF Unit', 'RISING', '[[11.6643, 78.1460], [11.3410, 77.7172], [11.1085, 77.3411], [11.0168, 76.9558]]', '2026-08-15', 'Historical spatial association observed based on available records. Does not establish confirmed trafficking without case-specific evidence.'),
(3, 14, 'Madurai → Tenkasi Southern Ghat Link', 24, 'MEDIUM', 'Community Concern, Transit', 'Citizen Portal, Helpline', 'RISING', '[[9.9252, 78.1198], [9.5680, 77.9624], [8.9594, 77.3152]]', '2026-08-16', 'Historical spatial association observed based on available records. Does not establish confirmed trafficking without case-specific evidence.'),
(1, 28, 'Chennai → Tiruvallur Northern Boundary Axis', 31, 'HIGH', 'Supply, Enforcement', 'Police FIR, STF', 'STABLE', '[[13.0827, 80.2707], [13.1438, 79.9079]]', '2026-08-12', 'Historical spatial association observed based on available records. Does not establish confirmed trafficking without case-specific evidence.');

-- -------------------------------------------------------------
-- SEED DATA: EXPERIMENTAL FORECAST RECORDS
-- -------------------------------------------------------------
INSERT INTO forecast_records (forecast_code, district_id, taluk_id, center_lat, center_lng, radius_meters, forecast_window_days, risk_level, confidence_level, data_coverage, historical_contributing_factors, model_version, training_date, disclaimer) VALUES
('FCST-2026-30D-CBE', 2, 1, 10.9450, 76.9200, 5000, 30, 'HIGH PREVENTIVE ATTENTION', 'MEDIUM', 'GOOD', 'Corridor transit recurrence, 45% recent signal acceleration, inter-district highway density', 'NRISE-RISK-v1.0', '2026-08-01', 'Forecasted Preventive Attention Zone: Decision-support signal for authorized verification and preventive planning; does not independently authorize enforcement action.'),
('FCST-2026-30D-TSI', 14, 8, 8.9720, 77.2150, 4200, 30, 'INCREASING', 'LOW', 'MODERATE', 'Emerging signal burst in last 14 days, sparse historical baseline, unverified border transit reports', 'NRISE-RISK-v1.0', '2026-08-01', 'Forecasted Preventive Attention Zone: Decision-support signal for authorized verification and preventive planning; does not independently authorize enforcement action.'),
('FCST-2026-90D-KRI', 10, 5, 12.7520, 77.8150, 5000, 90, 'HIGH PREVENTIVE ATTENTION', 'HIGH', 'GOOD', 'Persistent multi-quarter checkpost anomalies, heavy industrial freight nexus', 'NRISE-RISK-v1.0', '2026-08-01', 'Forecasted Preventive Attention Zone: Decision-support signal for authorized verification and preventive planning; does not independently authorize enforcement action.');

-- -------------------------------------------------------------
-- SEED DATA: ALERTS & ACTION TICKETS
-- -------------------------------------------------------------
INSERT INTO alerts (id, alert_code, alert_type, severity, district_id, taluk_id, title, description, risk_level, confidence_level, data_coverage, event_id, risk_zone_id, assigned_user_id, status) VALUES
(1, 'ALT-2026-001', 'RAPID_INCREASE', 'HIGH', 2, 1, 'Rapid Signal Increase: Walayar-Coimbatore Corridor', 'Signal velocity increased by 45% in past 14 days across Walayar border & Gandhipuram transit.', 'HIGH PREVENTIVE ATTENTION', 'HIGH', 'GOOD', 1, 1, 2, 'TICKET_CREATED'),
(2, 'ALT-2026-002', 'EMERGING_ZONE', 'HIGH', 14, 8, 'Emerging Signal Cluster: Puliyarai Ghat Corridor', 'Tenkasi border recorded 4 unverified burst reports within 72 hours; sparse historical baseline.', 'HIGH PREVENTIVE ATTENTION', 'MEDIUM', 'MODERATE', 5, 3, 3, 'UNDER_INVESTIGATION'),
(3, 'ALT-2026-003', 'ROUTE_ASSOCIATION', 'MEDIUM', 10, 5, 'Persistent Route Association: Hosur → Salem Axis', 'Checkpost telemetry confirms recurring transit anomaly correlation between Hosur and Salem bypass.', 'INCREASING', 'HIGH', 'GOOD', 4, 2, 1, 'ACKNOWLEDGED'),
(4, 'ALT-2026-004', 'DATA_ANOMALY', 'LOW', 37, NULL, 'Reporting Gap Warning: Ariyalur District', 'Ariyalur reporting coverage flagged as LIMITED. Absence of signals must not be interpreted as absence of risk.', 'LOW', 'LOW', 'LIMITED', NULL, NULL, 1, 'NEW');

INSERT INTO action_tickets (ticket_code, alert_id, assigned_department, assigned_user_id, priority, action_type, verification_status, operational_notes, outcome_type, outcome_notes) VALUES
('TCK-TN-2026-041', 1, 'Coimbatore District Flying Squad Unit', 2, 'HIGH', 'CHECKPOST_INSPECTION_ENHANCEMENT', 'UNDER_VERIFICATION', 'Joint vehicle scrutiny deployed at Walayar checkpost with round-the-clock automated scanner logs.', 'MONITORING_ONGOING', 'Initial preventive deployment active. Daily telemetry stream linked to state command center.');

-- -------------------------------------------------------------
-- SEED DATA: GENESIS AUDIT HASH CHAIN
-- -------------------------------------------------------------
INSERT INTO audit_hash_chain (sequence_num, actor_user_id, action_type, entity_type, entity_id, prev_hash, payload_hash, block_hash, ip_address) VALUES
(1, 1, 'GENESIS_INITIALIZATION', 'SYSTEM', 'SYS_INIT_001', '0000000000000000000000000000000000000000000000000000000000000000', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '3a7be4b84b55be553075d9e503387796d11f81d11b33347b56711bb5c1cb0876', '127.0.0.1'),
(2, 1, 'DATABASE_SEED_LOADED', 'DATABASE', 'NARVEX_SCHEMA_V1', '3a7be4b84b55be553075d9e503387796d11f81d11b33347b56711bb5c1cb0876', '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', 'c93a0b410f443b71f92e42ef998bb3d75ea5dc2e42f9b23b1c67d30f4e24ab49', '127.0.0.1'),
(3, 2, 'ALERT_ACKNOWLEDGED', 'ALERT', 'ALT-2026-001', 'c93a0b410f443b71f92e42ef998bb3d75ea5dc2e42f9b23b1c67d30f4e24ab49', '4a7d1ed414474e4033ac29ccb8653d9b', '8d145c1bb18b067a54483c61b2b8db0425c27cb484c6ef93d93b334a1795796b', '127.0.0.1');

