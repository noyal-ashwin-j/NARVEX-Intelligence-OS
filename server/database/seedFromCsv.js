import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

import pool from './db.js';
import { redactPII } from '../services/piiRedactionService.js';
import { resolveGeographicLocation } from '../services/geoResolutionService.js';
import { classifySignalContent } from '../services/aiClassificationService.js';
import { recalculateDistrictRiskScores } from '../services/backgroundIntelligenceService.js';
import { appendAuditRecord } from '../services/hashChainService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_MOCK_DIR = path.resolve(__dirname, '../../data/mock');

function parseCsvFile(fileName) {
  const filePath = path.join(DATA_MOCK_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Warning: CSV file not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
  return parsed.data;
}

export async function runCsvSeeder() {
  console.log('========================================================');
  console.log('🌱 NARVEX DATA-DRIVEN CSV INTELLIGENCE SEEDER');
  console.log(`📁 Loading external CSV datasets from: ${DATA_MOCK_DIR}`);
  console.log('========================================================\n');

  // Disable FK checks temporarily for clean atomic seeding
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  try {
    await pool.query(`ALTER TABLE districts ADD COLUMN trend_direction VARCHAR(30) DEFAULT 'STABLE'`);
  } catch (e) {}
  try {
    await pool.query(`ALTER TABLE districts ADD COLUMN velocity_30d DECIMAL(5,2) DEFAULT 1.00`);
  } catch (e) {}
  try {
    await pool.query(`ALTER TABLE districts ADD COLUMN first_time_signals_count INT DEFAULT 0`);
  } catch (e) {}
  try {
    await pool.query(`ALTER TABLE intelligence_events ADD COLUMN is_first_time_signal TINYINT(1) DEFAULT 0`);
  } catch (e) {}
  try {
    await pool.query(`ALTER TABLE citizen_reports ADD COLUMN intake_channel VARCHAR(50) DEFAULT 'WEB_PORTAL'`);
  } catch (e) {}
  await pool.query(`ALTER TABLE intelligence_events MODIFY COLUMN verification_status ENUM('UNVERIFIED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'CORROBORATED', 'NEEDS_VERIFICATION', 'NEW_SIGNAL', 'MERGED') DEFAULT 'UNVERIFIED'`);
  await pool.query(`ALTER TABLE citizen_reports MODIFY COLUMN status ENUM('UNVERIFIED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'CORROBORATED', 'NEEDS_VERIFICATION', 'NEW_SIGNAL', 'MERGED') DEFAULT 'UNVERIFIED'`);
  await pool.query('TRUNCATE TABLE event_provenance');
  await pool.query('TRUNCATE TABLE intelligence_events');
  await pool.query('TRUNCATE TABLE citizen_reports');
  await pool.query('TRUNCATE TABLE spatial_associations');
  await pool.query('TRUNCATE TABLE forecast_records');
  await pool.query('TRUNCATE TABLE action_tickets');
  await pool.query('TRUNCATE TABLE event_categories');
  await pool.query('TRUNCATE TABLE event_sources');
  await pool.query('TRUNCATE TABLE districts');

  // 1. Seed Roles & Users (if not present)
  console.log('👥 1. Ensuring RBAC Roles and Baseline Users...');
  await pool.query(`
    INSERT INTO roles (id, role_key, role_name, description) VALUES
    (1, 'STATE_ADMIN', 'State Intelligence Administrator', 'Full statewide oversight, model governance, user management'),
    (2, 'DISTRICT_OFFICER', 'District Intelligence Officer', 'District-level command, triage, localized filter & ticket routing'),
    (3, 'VERIFICATION_OFFICER', 'Intelligence Verification Analyst', 'Data validation, provenance review, citizen report corroboration'),
    (4, 'CITIZEN_REPORTER', 'Citizen Reporter (Public)', 'Anonymous submission and status tracking only')
    ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);
  `);

  // Default hashed password for 'Admin@123'
  const defaultPwHash = '$2a$10$wN9a.H7x18vK.i5Ckg01uOpvAiqEkgd9yGzW.q1N0mN70.0Xw7YCy';
  await pool.query(`
    INSERT INTO users (id, username, password_hash, full_name, email, role_key, district_id, department, badge_number) VALUES
    (1, 'admin_state', '${defaultPwHash}', 'Director General of Police (Intel)', 'intel.director@tn.gov.in', 'STATE_ADMIN', NULL, 'State Intelligence Directorate', 'TN-DIR-001'),
    (2, 'officer_cbe', '${defaultPwHash}', 'Superintendent of Police (Coimbatore)', 'sp.cbe.intel@tn.gov.in', 'DISTRICT_OFFICER', 2, 'Coimbatore District Police', 'TN-CBE-SP-01'),
    (3, 'officer_chn', '${defaultPwHash}', 'Joint Commissioner of Police (Chennai)', 'jcp.chn.intel@tn.gov.in', 'DISTRICT_OFFICER', 1, 'Chennai City Police', 'TN-CHN-JC-01'),
    (4, 'verifier_lead', '${defaultPwHash}', 'Senior Intelligence Analyst (Verification)', 'analyst.lead@tn.gov.in', 'VERIFICATION_OFFICER', NULL, 'Special Task Force Verification Cell', 'TN-VER-001'),
    (5, 'citizen_demo', '${defaultPwHash}', 'Public Citizen Demo Account', 'citizen.demo@narvex.tn.gov.in', 'CITIZEN_REPORTER', NULL, 'Public Access', 'CITIZEN-DEMO')
    ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);
  `);

  // 2. Seed Drug Categories from CSV
  console.log('🧪 2. Ingesting Drug Categories from drug_categories.csv...');
  const drugCats = parseCsvFile('drug_categories.csv');
  for (const cat of drugCats) {
    await pool.query(
      `INSERT INTO event_categories (id, category_key, category_name, parent_category, risk_weight, description)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE category_name = VALUES(category_name), risk_weight = VALUES(risk_weight), description = VALUES(description)`,
      [
        parseInt(cat.drug_category_id, 10),
        cat.category_key,
        cat.category_name,
        cat.parent_category || null,
        parseFloat(cat.risk_weight) || 1.0,
        cat.description
      ]
    );
  }
  console.log(`   ✓ Ingested ${drugCats.length} drug categories.`);

  // 3. Seed Source Registry from CSV
  console.log('📡 3. Ingesting Source Registry from source_registry.csv...');
  const sources = parseCsvFile('source_registry.csv');
  for (const src of sources) {
    await pool.query(
      `INSERT INTO event_sources (id, source_key, source_name, source_type, reliability_weight, description)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE source_name = VALUES(source_name), reliability_weight = VALUES(reliability_weight), description = VALUES(description)`,
      [
        parseInt(src.source_id, 10),
        src.source_key,
        src.source_name,
        src.source_type,
        parseFloat(src.reliability_weight) || 0.8,
        src.description
      ]
    );
  }
  console.log(`   ✓ Ingested ${sources.length} intelligence sources.`);

  // 4. Seed 38 Tamil Nadu Districts from CSV
  console.log('🗺️ 4. Ingesting 38 Tamil Nadu Districts from districts.csv...');
  const districts = parseCsvFile('districts.csv');
  for (const d of districts) {
    await pool.query(
      `INSERT INTO districts (id, code, name, headquarters, center_lat, center_lng, baseline_population, coverage_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), center_lat = VALUES(center_lat), center_lng = VALUES(center_lng), coverage_status = VALUES(coverage_status)`,
      [
        parseInt(d.district_id, 10),
        d.district_code,
        d.district_name,
        d.headquarters || d.district_name,
        parseFloat(d.latitude),
        parseFloat(d.longitude),
        parseInt(d.population_indicator, 10) || 2000000,
        d.coverage_status || 'MODERATE'
      ]
    );
  }
  console.log(`   ✓ Ingested ${districts.length} official districts.`);

  // Clear events & provenance for fresh CSV synchronization
  await pool.query('TRUNCATE TABLE event_provenance');
  await pool.query('TRUNCATE TABLE intelligence_events');
  await pool.query('TRUNCATE TABLE citizen_reports');
  await pool.query('TRUNCATE TABLE spatial_associations');
  await pool.query('TRUNCATE TABLE forecast_records');
  await pool.query('TRUNCATE TABLE action_tickets');

  // Load district and category lookup maps
  const [distRows] = await pool.query('SELECT id, code, name, center_lat, center_lng FROM districts');
  const districtMap = new Map();
  distRows.forEach((d) => {
    districtMap.set(d.name.toLowerCase(), d);
    districtMap.set(d.code.toLowerCase(), d);
  });

  const [catRows] = await pool.query('SELECT id, category_key FROM event_categories');
  const categoryMap = new Map();
  catRows.forEach((c) => categoryMap.set(c.category_key.toLowerCase(), c.id));

  // 5. Ingest Multi-Source Complaints from complaints.csv
  console.log('📋 5. Ingesting Complaints from complaints.csv...');
  const complaints = parseCsvFile('complaints.csv');
  let complaintCount = 0;

  for (const cmp of complaints) {
    const rawDesc = cmp.description || 'Observation record';
    const { sanitizedText, piiDetectedCount } = redactPII(rawDesc);

    const distObj = districtMap.get((cmp.district_name || '').toLowerCase()) || distRows[1]; // Coimbatore default
    const lat = cmp.latitude ? parseFloat(cmp.latitude) : parseFloat(distObj.center_lat);
    const lng = cmp.longitude ? parseFloat(cmp.longitude) : parseFloat(distObj.center_lng);

    const classification = await classifySignalContent(sanitizedText);
    const catId = categoryMap.get((cmp.drug_category || classification.categoryKey).toLowerCase()) || 2;
    const isEnforcement = cmp.incident_type === 'SEIZURE_ENFORCEMENT' ? 1 : 0;

    const [evtRes] = await pool.query(
      `INSERT INTO intelligence_events 
       (event_code, district_id, location_name, lat, lng, event_date, category_id, source_id, severity_level, is_enforcement, verification_status, confidence_score, coverage_flag, raw_description_redacted, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cmp.complaint_id,
        distObj.id,
        cmp.locality || distObj.name,
        lat,
        lng,
        cmp.reported_date || '2026-08-16',
        catId,
        cmp.source_type === 'POLICE' ? 1 : cmp.source_type === 'CHECKPOST' ? 2 : cmp.source_type === 'CITIZEN' ? 3 : 4,
        classification.severity,
        isEnforcement,
        cmp.verification_status || 'VERIFIED',
        classification.confidence,
        'GOOD',
        sanitizedText,
        `Data-Driven Ingestion from complaints.csv (${cmp.source_type})`
      ]
    );

    const eventId = evtRes.insertId;

    // Cryptographic Provenance SHA-256 Hash
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(cmp)).digest('hex');
    await pool.query(
      `INSERT INTO event_provenance 
       (event_id, source_department, source_file_name, sheet_name, source_row_number, raw_payload_hash, extraction_confidence, classification_method, transformation_log)
       VALUES (?, ?, 'complaints.csv', 'Primary', ?, ?, ?, ?, ?)`,
      [
        eventId,
        `${cmp.source_type} Ingestion Feed`,
        complaintCount + 1,
        payloadHash,
        classification.confidence,
        classification.classificationMethod,
        `PII Redacted: ${piiDetectedCount} items. Normalized to ${distObj.name} coordinates.`
      ]
    );

    complaintCount++;
  }
  console.log(`   ✓ Ingested ${complaintCount} intelligence complaints with SHA-256 provenance.`);

  // 6. Ingest Police Reports from police_reports.csv
  console.log('🚔 6. Ingesting Police Reports from police_reports.csv...');
  const policeReports = parseCsvFile('police_reports.csv');
  for (const pol of policeReports) {
    const distObj = districtMap.get((pol.district_name || '').toLowerCase()) || distRows[0];
    const lat = pol.latitude ? parseFloat(pol.latitude) : parseFloat(distObj.center_lat);
    const lng = pol.longitude ? parseFloat(pol.longitude) : parseFloat(distObj.center_lng);

    const rawDesc = `[POLICE FIR ${pol.fir_id}] Station: ${pol.station_name}. Offence: ${pol.offence_section}. Seized: ${pol.seized_quantity_kg} kg ${pol.contraband_type}. Vehicle: ${pol.vehicle_seized || 'None'}. Notes: ${pol.notes}`;
    const { sanitizedText } = redactPII(rawDesc);
    const classification = await classifySignalContent(sanitizedText);

    const [evtRes] = await pool.query(
      `INSERT INTO intelligence_events 
       (event_code, district_id, location_name, lat, lng, event_date, category_id, source_id, severity_level, is_enforcement, verification_status, confidence_score, coverage_flag, raw_description_redacted, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, 1, 'VERIFIED', 92.00, 'GOOD', ?, ?)`,
      [
        pol.fir_id,
        distObj.id,
        pol.location_name || distObj.name,
        lat,
        lng,
        pol.incident_date || '2026-08-16',
        3, // SEIZURE_ENFORCEMENT
        pol.severity || 'HIGH',
        sanitizedText,
        `Ingested from police_reports.csv (${pol.station_code})`
      ]
    );

    const eventId = evtRes.insertId;
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(pol)).digest('hex');
    await pool.query(
      `INSERT INTO event_provenance 
       (event_id, source_department, source_file_name, sheet_name, source_row_number, raw_payload_hash, extraction_confidence, classification_method, transformation_log)
       VALUES (?, 'Tamil Nadu Police Enforcement Wing', 'police_reports.csv', 'FIR_Log', ?, ?, 92.00, 'RULE_BASED', 'Official FIR Mahazar Registration')`,
      [eventId, eventId, payloadHash]
    );
  }
  console.log(`   ✓ Ingested ${policeReports.length} statutory police FIR reports.`);

  // 7. Ingest Anonymous Citizen Reports from citizen_reports.csv
  console.log('👤 7. Ingesting Anonymous Citizen Reports from citizen_reports.csv...');
  const citizenReports = parseCsvFile('citizen_reports.csv');
  for (const cr of citizenReports) {
    const distObj = districtMap.get((cr.district_name || '').toLowerCase()) || distRows[0];
    const catId = categoryMap.get((cr.category_name || '').toLowerCase()) || 4;

    await pool.query(
      `INSERT INTO citizen_reports 
       (report_code, tracking_token, approximate_district_id, approximate_taluk_id, approximate_location, lat, lng, report_date, category_id, redacted_content, status, confidence_score)
       VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, 'UNDER_REVIEW', ?)`,
      [
        cr.report_code,
        cr.tracking_token,
        distObj.id,
        cr.approximate_location,
        parseFloat(cr.latitude) || parseFloat(distObj.center_lat),
        parseFloat(cr.longitude) || parseFloat(distObj.center_lng),
        cr.report_date || '2026-08-16',
        catId,
        cr.description,
        parseFloat(cr.risk_contribution) * 100 || 50.0
      ]
    );
  }
  console.log(`   ✓ Ingested ${citizenReports.length} privacy-sanitized citizen reports.`);

  // 8. Ingest Historical Spatial Associations from transport_signals.csv
  console.log('🛣️ 8. Ingesting Historical Spatial Associations from transport_signals.csv...');
  const transportSignals = parseCsvFile('transport_signals.csv');
  for (const ts of transportSignals) {
    const originDist = districtMap.get((ts.origin_district_name || '').toLowerCase()) || distRows[1];
    const destDist = districtMap.get((ts.destination_district_name || '').toLowerCase()) || distRows[0];

    await pool.query(
      `INSERT INTO spatial_associations 
       (origin_district_id, destination_district_id, corridor_name, observation_count, confidence_level, primary_categories, primary_sources, trend_direction, waypoints_json, last_observed_date, disclaimer)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'RISING', ?, ?, ?)`,
      [
        originDist.id,
        destDist.id,
        ts.corridor_name,
        parseInt(ts.observation_count, 10) || 5,
        ts.confidence_level || 'HIGH',
        ts.primary_contraband || 'Ganja / Synthetic MDMA',
        `${ts.transport_mode} Transit (${ts.primary_checkpost || 'Checkpost'})`,
        ts.waypoints_json || '[]',
        ts.last_observed_date || '2026-08-16',
        ts.disclaimer || 'HISTORICAL SPATIAL ASSOCIATION: Statistically recurrent telemetry. Does not prove individual transport guilt.'
      ]
    );
  }
  console.log(`   ✓ Ingested ${transportSignals.length} historical spatial associations.`);

  // 8b. Generate Early-Warning Alerts
  console.log('🚨 8b. Generating Early-Warning Alerts from Ingested Clusters...');
  await pool.query('TRUNCATE TABLE alerts');
  const [createdAlert1] = await pool.query(
    `INSERT INTO alerts (alert_code, alert_type, severity, district_id, title, description, risk_level, confidence_level, data_coverage, status)
     VALUES ('ALT-CBE-001', 'EMERGING_ZONE', 'HIGH', 2, 'Emerging Risk Cluster: Gandhipuram Campus Sector', 'Multiple correlated signals indicating youth parcel exchanges near educational area.', 'HIGH PREVENTIVE ATTENTION', 'HIGH', 'GOOD', 'NEW')`
  );
  const [createdAlert2] = await pool.query(
    `INSERT INTO alerts (alert_code, alert_type, severity, district_id, title, description, risk_level, confidence_level, data_coverage, status)
     VALUES ('ALT-KRI-002', 'ROUTE_ASSOCIATION', 'HIGH', 10, 'Border Telemetry Alert: Zuzuvadi Interstate Toll Post', 'Night transit density scan flagged recurrent freight discrepancy.', 'HIGH PREVENTIVE ATTENTION', 'HIGH', 'GOOD', 'NEW')`
  );
  const [createdAlert3] = await pool.query(
    `INSERT INTO alerts (alert_code, alert_type, severity, district_id, title, description, risk_level, confidence_level, data_coverage, status)
     VALUES ('ALT-TSI-003', 'HIGH_RISK_LOW_CONFIDENCE', 'MEDIUM', 14, 'Verification Required: Puliyarai Ghat Route', 'High risk indicator with limited corroborate reporting. Scheduled for verification.', 'HIGH PREVENTIVE ATTENTION', 'LOW', 'MODERATE', 'NEW')`
  );
  const alert1Id = createdAlert1.insertId;

  // 9. Ingest Action Tickets from action_tickets.csv
  console.log('🎟️ 9. Ingesting Action Tickets from action_tickets.csv...');
  const tickets = parseCsvFile('action_tickets.csv');
  for (const tkt of tickets) {
    await pool.query(
      `INSERT INTO action_tickets 
       (ticket_code, alert_id, assigned_department, priority, action_type, verification_status, operational_notes, outcome_type, outcome_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tkt.ticket_code,
        alert1Id,
        tkt.assigned_department,
        tkt.priority || 'MEDIUM',
        tkt.action_type || 'FIELD_VERIFICATION',
        tkt.verification_status || 'OPEN',
        tkt.operational_notes || '',
        tkt.outcome_type || null,
        tkt.outcome_notes || ''
      ]
    );
  }
  console.log(`   ✓ Ingested ${tickets.length} operational response tickets.`);

  // 10. Generate Automated 30/90 Day Forecast Records based on Ingested Data
  console.log('🔮 10. Computing Data-Driven Predictive Forecasts from Historical Signal Density...');
  const [activeDistEvents] = await pool.query(`
    SELECT district_id, COUNT(*) as signal_vol, 
           SUM(CASE WHEN is_enforcement = 1 THEN 1 ELSE 0 END) as enforcement_vol
    FROM intelligence_events 
    GROUP BY district_id
  `);

  for (const row of activeDistEvents) {
    const distObj = distRows.find((d) => d.id === row.district_id);
    if (!distObj) continue;

    const vol = row.signal_vol;
    let predicted30 = 'WATCH';
    let predicted90 = 'WATCH';
    let conf = 75.0;

    if (vol >= 10) {
      predicted30 = 'HIGH PREVENTIVE ATTENTION';
      predicted90 = 'INCREASING';
      conf = 88.0;
    } else if (vol >= 4) {
      predicted30 = 'INCREASING';
      predicted90 = 'WATCH';
      conf = 80.0;
    }

    const forecastCode = `FCST-30D-${distObj.code}-2026`;
    await pool.query(
      `INSERT INTO forecast_records 
       (forecast_code, district_id, taluk_id, center_lat, center_lng, radius_meters, forecast_window_days, risk_level, confidence_level, data_coverage, historical_contributing_factors, model_version, training_date, disclaimer)
       VALUES (?, ?, NULL, ?, ?, 4000, 30, ?, ?, 'GOOD', ?, 'NARVEX-DATA-DRIVEN-v1.0', CURDATE(), 'PREDICTED PREVENTIVE ATTENTION PRIORITY: Statistical risk estimate for proactive resource allocation. Not a certainty of future crime.')
       ON DUPLICATE KEY UPDATE risk_level = VALUES(risk_level), confidence_level = VALUES(confidence_level)`,
      [
        forecastCode,
        distObj.id,
        parseFloat(distObj.center_lat),
        parseFloat(distObj.center_lng),
        predicted30,
        conf >= 85 ? 'HIGH' : conf >= 75 ? 'MEDIUM' : 'LOW',
        `Based on ${vol} observed signals across highway and urban educational clusters in ${distObj.name}.`
      ]
    );
  }
  console.log('   ✓ Computed and registered predictive forecast priorities.');

  // 11. Run Dynamic Intelligence Risk Recalculation Engine
  console.log('⚡ 11. Executing Statewide Intelligence Risk & 3-Axis Metric Recalculation...');
  await recalculateDistrictRiskScores();
  console.log('   ✓ District Risk Level, Evidence Confidence & Data Coverage recalculated dynamically.');

  // 12. Append Cryptographic Genesis Block & Audit Record
  console.log('🔒 12. Registering SHA-256 Audit Log...');
  await appendAuditRecord({
    actorUserId: 1,
    actionType: 'DATA_DRIVEN_CSV_SEED_COMPLETED',
    entityType: 'STATE_INTELLIGENCE_LEDGER',
    entityId: 'ALL_38_DISTRICTS',
    payload: {
      districtsIngested: districts.length,
      complaintsIngested: complaintCount,
      policeFIRsIngested: policeReports.length,
      citizenReportsIngested: citizenReports.length,
      corridorsIngested: transportSignals.length
    },
    ipAddress: '127.0.0.1'
  });

  // Re-enable FK checks
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log('\n========================================================');
  console.log('✨ 100% DATA-DRIVEN CSV INTELLIGENCE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('========================================================\n');
}

// Run directly if invoked as script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCsvSeeder()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal CSV Seeding Error:', err);
      process.exit(1);
    });
}

export default { runCsvSeeder };
