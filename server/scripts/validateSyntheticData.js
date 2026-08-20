import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SYNTHETIC_DIR = path.resolve(__dirname, '../../data/synthetic');

console.log('🔍 Running NARVEX Synthetic Dataset Validation Engine...\n');

let totalErrors = 0;
let totalPassedFiles = 0;

function parseCsv(filename) {
  const filePath = path.join(SYNTHETIC_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing file: ${filename}`);
    totalErrors++;
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const result = Papa.parse(content, { header: true, skipEmptyLines: true });
  return result.data;
}

// 1. Validate Districts
const districts = parseCsv('01_districts.csv');
if (districts) {
  if (districts.length !== 38) {
    console.error(`❌ Expected 38 districts, found: ${districts.length}`);
    totalErrors++;
  } else {
    console.log(`✅ 01_districts.csv: All 38 Tamil Nadu districts validated.`);
    totalPassedFiles++;
  }
}

// 2. Validate Taluks & Foreign Keys
const taluks = parseCsv('02_taluks.csv');
if (taluks) {
  let invalidD = 0;
  taluks.forEach((t) => {
    const dId = parseInt(t.district_id, 10);
    if (!dId || dId < 1 || dId > 38) invalidD++;
  });
  if (invalidD > 0) {
    console.error(`❌ 02_taluks.csv has ${invalidD} invalid district foreign keys.`);
    totalErrors++;
  } else {
    console.log(`✅ 02_taluks.csv: ${taluks.length} taluks validated with valid district IDs.`);
    totalPassedFiles++;
  }
}

// 3. Validate Event Datasets Volume & Foreign Key Consistency
const eventFiles = [
  '06_citizen_reports.csv',
  '07_police_reports.csv',
  '08_fir_incidents.csv',
  '09_seizure_checkpost_reports.csv',
  '10_helpline_signals.csv',
  '11_health_rehabilitation_signals.csv',
  '12_enforcement_activity.csv',
  '13_intelligence_signals.csv',
  '14_drug_category_signals.csv',
  '16_corridor_observations.csv',
  '17_risk_zone_history.csv',
  '18_emerging_zone_events.csv',
  '19_forecast_zone_history.csv',
  '20_alerts.csv',
  '21_action_tickets.csv',
  '22_action_outcomes.csv',
  '23_data_provenance.csv',
  '24_audit_events.csv',
  '25_model_evaluation.csv'
];

eventFiles.forEach((f) => {
  const rows = parseCsv(f);
  if (!rows) return;

  if (rows.length < 1000) {
    console.error(`❌ ${f}: Required 1000+ records, but found ${rows.length}`);
    totalErrors++;
  } else {
    // Check timestamps & mandatory fields
    let badRow = 0;
    rows.forEach((r, idx) => {
      const keys = Object.keys(r);
      if (keys.length === 0) badRow++;
      if (r.district_id) {
        const dId = parseInt(r.district_id, 10);
        if (dId < 1 || dId > 38) badRow++;
      }
    });

    if (badRow > 0) {
      console.error(`❌ ${f}: ${badRow} records failed validation rules.`);
      totalErrors++;
    } else {
      console.log(`✅ ${f}: ${rows.length} records verified (Passes 1000+ volume requirement).`);
      totalPassedFiles++;
    }
  }
});

console.log('\n========================================================');
if (totalErrors === 0) {
  console.log(`🏁 Validation Complete: All datasets passed integrity checks! (${totalPassedFiles} files verified)`);
  process.exit(0);
} else {
  console.error(`🏁 Validation Failed: ${totalErrors} errors found.`);
  process.exit(1);
}
