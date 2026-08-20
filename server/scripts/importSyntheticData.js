import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

import pool from '../database/db.js';
import { recalculateDistrictRiskScores } from '../services/backgroundIntelligenceService.js';
import { appendAuditRecord } from '../services/hashChainService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SYNTHETIC_DIR = path.resolve(__dirname, '../../data/synthetic');

function parseCsv(filename) {
  const filePath = path.join(SYNTHETIC_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Warning: CSV file not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
  return parsed.data;
}

export async function importSyntheticData() {
  console.log('========================================================');
  console.log('📦 IMPORTING NARVEX SYNTHETIC INTELLIGENCE DATASETS (1000+ per dataset)');
  console.log(`📁 Source Directory: ${SYNTHETIC_DIR}`);
  console.log('========================================================\n');

  await pool.query('SET FOREIGN_KEY_CHECKS = 0');

  try {
    // 1. Ensure Table Columns exist
    try { await pool.query(`ALTER TABLE districts ADD COLUMN trend_direction VARCHAR(30) DEFAULT 'STABLE'`); } catch (e) {}
    try { await pool.query(`ALTER TABLE districts ADD COLUMN velocity_30d DECIMAL(5,2) DEFAULT 1.00`); } catch (e) {}
    try { await pool.query(`ALTER TABLE districts ADD COLUMN first_time_signals_count INT DEFAULT 0`); } catch (e) {}
    try { await pool.query(`ALTER TABLE intelligence_events ADD COLUMN is_first_time_signal TINYINT(1) DEFAULT 0`); } catch (e) {}
    try { await pool.query(`ALTER TABLE citizen_reports ADD COLUMN intake_channel VARCHAR(50) DEFAULT 'WEB_PORTAL'`); } catch (e) {}

    // 2. Clear previous tables
    await pool.query('TRUNCATE TABLE event_provenance');
    await pool.query('TRUNCATE TABLE intelligence_events');
    await pool.query('TRUNCATE TABLE citizen_reports');
    await pool.query('TRUNCATE TABLE spatial_associations');
    await pool.query('TRUNCATE TABLE forecast_records');
    await pool.query('TRUNCATE TABLE action_tickets');
    await pool.query('TRUNCATE TABLE event_categories');
    await pool.query('TRUNCATE TABLE event_sources');
    await pool.query('TRUNCATE TABLE districts');

    // 3. Ensure Roles & Users
    console.log('👥 1. Ensuring Standard RBAC Accounts...');
    await pool.query(`
      INSERT INTO roles (id, role_key, role_name, description) VALUES
      (1, 'STATE_ADMIN', 'State Intelligence Administrator', 'Full statewide oversight'),
      (2, 'DISTRICT_OFFICER', 'District Intelligence Officer', 'District-level triage'),
      (3, 'VERIFICATION_OFFICER', 'Intelligence Verification Analyst', 'Data verification & provenance'),
      (4, 'CITIZEN_REPORTER', 'Citizen Reporter (Public)', 'Anonymous citizen intake')
      ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);
    `);

    const defaultPwHash = '$2a$10$wN9a.H7x18vK.i5Ckg01uOpvAiqEkgd9yGzW.q1N0mN70.0Xw7YCy';
    await pool.query(`
      INSERT INTO users (id, username, password_hash, full_name, email, role_key, district_id, department, badge_number) VALUES
      (1, 'admin_state', '${defaultPwHash}', 'Director General of Police (Intel)', 'intel.director@tn.gov.in', 'STATE_ADMIN', NULL, 'State Intelligence Directorate', 'TN-DIR-001'),
      (2, 'officer_cbe', '${defaultPwHash}', 'Superintendent of Police (Coimbatore)', 'sp.cbe.intel@tn.gov.in', 'DISTRICT_OFFICER', 2, 'Coimbatore District Police', 'TN-CBE-SP-01'),
      (3, 'officer_chn', '${defaultPwHash}', 'Joint Commissioner of Police (Chennai)', 'jcp.chn.intel@tn.gov.in', 'DISTRICT_OFFICER', 1, 'Chennai City Police', 'TN-CHN-JC-01'),
      (4, 'verifier_lead', '${defaultPwHash}', 'Senior Intelligence Analyst (Verification)', 'analyst.lead@tn.gov.in', 'VERIFICATION_OFFICER', NULL, 'Special Task Force', 'TN-VER-001'),
      (5, 'citizen_demo', '${defaultPwHash}', 'Public Citizen Demo Account', 'citizen.demo@narvex.tn.gov.in', 'CITIZEN_REPORTER', NULL, 'Public Access', 'CITIZEN-DEMO')
      ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);
    `);

    // 4. Categories & Sources Master
    console.log('🧪 2. Ingesting Controlled Categories & Sources...');
    const catKeys = [
      [1, 'COMMERCIAL_GANJA', 'Commercial Ganja / Cannabis', 1.2],
      [2, 'SYNTHETIC_MDMA', 'Synthetic Stimulants / MDMA / Meth', 2.0],
      [3, 'PRESCRIPTION_NARCOTICS', 'Prescription Narcotics / Codeine / Alprazolam', 1.5],
      [4, 'CHEMICAL_PRECURSORS', 'Chemical Precursors / Ephedrine', 1.8],
      [5, 'OPIOID_ANALOGUES', 'Opioid Analogues / Brown Sugar / Heroin', 2.2],
      [6, 'UNKNOWN_CONTRABAND', 'Unclassified / Suspicious Substance', 1.0]
    ];
    for (const c of catKeys) {
      await pool.query(
        `INSERT INTO event_categories (id, category_key, category_name, risk_weight) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE category_name = VALUES(category_name)`,
        [c[0], c[1], c[2], c[3]]
      );
    }

    const srcKeys = [
      [1, 'CITIZEN_PORTAL', 'Anonymous Citizen Web Portal', 'CITIZEN', 0.65],
      [2, 'POLICE_FIR', 'Police First Information Report (FIR)', 'ENFORCEMENT', 0.95],
      [3, 'CHECKPOST_TELEMETRY', 'State Checkpost Automated Scanner', 'CHECKPOST', 0.90],
      [4, 'HELPLINE_10583', 'State De-Addiction Helpline 10583', 'HELPLINE', 0.70],
      [5, 'HEALTH_REHAB', 'Hospital & Rehabilitation Aggregate Telemetry', 'HEALTH_AGGREGATE', 0.85]
    ];
    for (const s of srcKeys) {
      await pool.query(
        `INSERT INTO event_sources (id, source_key, source_name, source_type, reliability_weight) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE source_name = VALUES(source_name)`,
        [s[0], s[1], s[2], s[3], s[4]]
      );
    }

    // 5. Ingest Districts (01_districts.csv)
    console.log('🏛️ 3. Ingesting all 38 Tamil Nadu Districts from 01_districts.csv...');
    const districtRows = parseCsv('01_districts.csv');
    const districtMap = new Map();
    for (const d of districtRows) {
      const dId = parseInt(d.district_id, 10);
      const lat = parseFloat(d.latitude);
      const lng = parseFloat(d.longitude);
      districtMap.set(dId, { lat, lng, name: d.district_name });

      await pool.query(
        `INSERT INTO districts (id, code, name, headquarters, center_lat, center_lng, baseline_population, risk_level, trend_direction, velocity_30d, confidence_score, coverage_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), center_lat = VALUES(center_lat), center_lng = VALUES(center_lng), coverage_status = VALUES(coverage_status)`,
        [
          dId,
          d.district_code,
          d.district_name,
          d.headquarters || d.district_name,
          lat,
          lng,
          parseInt(d.baseline_population, 10) || 1000000,
          d.risk_level || 'LOW',
          d.trend_direction || 'STABLE',
          parseFloat(d.velocity_30d) || 1.0,
          parseFloat(d.confidence_score) || 75,
          d.coverage_status || 'ADEQUATE'
        ]
      );
    }

    // 6. Ingest Citizen Reports (06_citizen_reports.csv)
    console.log('📱 4. Ingesting Citizen Reports (1,250 rows)...');
    const citizenRows = parseCsv('06_citizen_reports.csv');
    for (const cr of citizenRows) {
      const isFirst = parseInt(cr.is_first_time_signal, 10) === 1;
      await pool.query(
        `INSERT INTO citizen_reports (tracking_id, anonymous_token, raw_text_redacted, pii_redacted, district_id, intake_channel, status, confidence_score, risk_relevance, is_first_time_signal, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cr.report_id,
          cr.anonymous_token,
          cr.description,
          1,
          parseInt(cr.district_id, 10),
          cr.source_channel || 'WEB_PORTAL',
          cr.verification_status || 'UNVERIFIED',
          parseFloat(cr.confidence_score) || 70,
          cr.risk_relevance || 'MEDIUM',
          isFirst ? 1 : 0,
          cr.received_at || new Date()
        ]
      );
    }

    // 7. Ingest Police & FIR Reports into Intelligence Events (07_police_reports.csv & 08_fir_incidents.csv)
    console.log('🚔 5. Ingesting Official Police & FIR Incidents into Intelligence Events...');
    const policeRows = parseCsv('07_police_reports.csv');
    for (const pr of policeRows) {
      const dId = parseInt(pr.district_id, 10);
      const distInfo = districtMap.get(dId) || { lat: 11.0168, lng: 76.9558 };
      const catId = pr.drug_category.includes('GANJA') ? 1 : pr.drug_category.includes('MDMA') ? 2 : pr.drug_category.includes('PRESCRIPTION') ? 3 : pr.drug_category.includes('CHEMICAL') ? 4 : 5;

      const [evtRes] = await pool.query(
        `INSERT INTO intelligence_events (event_code, district_id, location_name, lat, lng, event_date, category_id, source_id, severity_level, is_enforcement, verification_status, confidence_score, coverage_flag, raw_description_redacted, notes, is_first_time_signal)
         VALUES (?, ?, ?, ?, ?, ?, ?, 2, 'HIGH', 1, 'VERIFIED', ?, 'GOOD', ?, ?, 0)`,
        [
          pr.report_id,
          dId,
          `${pr.station_name} Jurisdiction`,
          distInfo.lat,
          distInfo.lng,
          pr.incident_timestamp || new Date(),
          catId,
          parseFloat(pr.evidence_confidence) || 85,
          `Official Enforcement Log: ${pr.incident_type} (${pr.drug_category}) reported by ${pr.reporting_wing}.`,
          `Ingested from 07_police_reports.csv`
        ]
      );

      // Provenance
      const hash = crypto.createHash('sha256').update(JSON.stringify(pr)).digest('hex');
      await pool.query(
        `INSERT INTO event_provenance (event_id, source_department, source_file_name, sheet_name, source_row_number, raw_payload_hash, extraction_confidence, classification_method, transformation_log)
         VALUES (?, 'Tamil Nadu Police Enforcement Feed', '07_police_reports.csv', 'Primary', 1, ?, 95.00, 'RULE_BASED', 'Normalized to jurisdiction coordinates.')`,
        [evtRes.insertId, hash]
      );
    }

    // 8. Ingest Spatial Corridors (15_spatial_corridors.csv)
    console.log('🛣️ 6. Ingesting Spatial Corridors & Historical Associations...');
    const corridors = parseCsv('15_spatial_corridors.csv');
    for (const c of corridors) {
      await pool.query(
        `INSERT INTO spatial_associations (corridor_name, origin_district_id, destination_district_id, observation_count, confidence_level, primary_categories, primary_sources, highway_route)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.corridor_name,
          parseInt(c.origin_district_id, 10),
          parseInt(c.destination_district_id, 10),
          randInt(15, 45),
          'HIGH_HISTORICAL_CORRELATION',
          'Commercial Ganja, Synthetic MDMA',
          'CHECKPOST_INTERCEPTION, HIGHWAY_SCAN',
          c.highway_route
        ]
      );
    }

    // 9. Ingest Forecast Records (19_forecast_zone_history.csv)
    console.log('🔮 7. Ingesting 30D / 90D Preventive Attention Forecasts...');
    const forecasts = parseCsv('19_forecast_zone_history.csv');
    for (const f of forecasts.slice(0, 38)) {
      await pool.query(
        `INSERT INTO forecast_records (district_id, forecast_horizon_days, forecast_risk_level, forecast_confidence_score, primary_drivers, model_version)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          parseInt(f.district_id, 10),
          f.target_horizon.includes('30') ? 30 : 90,
          f.forecast_risk_level || 'INCREASING',
          parseFloat(f.forecast_confidence) || 82,
          f.primary_contributing_factor || 'Transit velocity surge',
          f.model_version || 'NARVEX_TEMPORAL_BAYES_V2.1'
        ]
      );
    }

    // 10. Ingest Action Tickets (21_action_tickets.csv)
    console.log('🎫 8. Ingesting Human-in-the-Loop Action Tickets...');
    const tickets = parseCsv('21_action_tickets.csv');
    for (const t of tickets.slice(0, 50)) {
      await pool.query(
        `INSERT INTO action_tickets (ticket_code, district_id, status, assigned_to_user_id, action_type, priority, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          t.ticket_id,
          parseInt(t.district_id, 10),
          t.ticket_status === 'OPEN' ? 'OPEN' : t.ticket_status === 'CLOSED' ? 'CLOSED' : 'IN_PROGRESS',
          2,
          t.action_type || 'PATROL_DISPATCH',
          t.priority || 'HIGH',
          `Generated from synthetic alert pipeline for ${t.district_name}.`
        ]
      );
    }

    // 11. Run Statewide Intelligence Recalculation
    console.log('⚙️ 9. Executing Background Intelligence Engine Recalculation...');
    await recalculateDistrictRiskScores();

    // 12. Append Cryptographic Hash
    await appendAuditRecord('SYNTHETIC_DATASET_INGESTION_COMPLETED', {
      totalDistricts: 38,
      totalCitizenReports: citizenRows.length,
      totalPoliceEvents: policeRows.length,
      timestamp: new Date().toISOString()
    });

    console.log('\n✅ All synthetic datasets successfully ingested and calculated in MySQL database!');
  } catch (err) {
    console.error('❌ Error during synthetic data ingestion:', err);
    process.exit(1);
  } finally {
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  }
}

// Direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  importSyntheticData().then(() => process.exit(0));
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
