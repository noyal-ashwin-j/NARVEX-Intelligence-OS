import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SYNTHETIC_DIR = path.resolve(__dirname, '../../data/synthetic');

// Ensure directory exists
if (!fs.existsSync(SYNTHETIC_DIR)) {
  fs.mkdirSync(SYNTHETIC_DIR, { recursive: true });
}

// PRNG for deterministic regeneration
let seed = 424242;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}
function randInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}
function randChoice(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function randDate(startDaysAgo = 730, endDaysAgo = 0) {
  const now = Date.now();
  const start = now - startDaysAgo * 86400 * 1000;
  const end = now - endDaysAgo * 86400 * 1000;
  const t = start + random() * (end - start);
  return new Date(t).toISOString().replace('T', ' ').substring(0, 19);
}
function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// 1. TAMIL NADU 38 DISTRICTS MASTER
const DISTRICTS = [
  { id: 1, name: 'Chennai', code: 'CHN', hq: 'Chennai', lat: 13.0827, lng: 80.2707, pop: 7088000, risk: 'HIGH PREVENTIVE ATTENTION', trend: 'RAPID_INCREASE', vel: 3.5, conf: 84, cov: 'ADEQUATE' },
  { id: 2, name: 'Coimbatore', code: 'CBE', hq: 'Coimbatore', lat: 11.0168, lng: 76.9558, pop: 3458000, risk: 'HIGH PREVENTIVE ATTENTION', trend: 'RAPID_INCREASE', vel: 6.0, conf: 88, cov: 'ADEQUATE' },
  { id: 3, name: 'Madurai', code: 'MDU', hq: 'Madurai', lat: 9.9252, lng: 78.1198, pop: 3038000, risk: 'INCREASING', trend: 'MODERATE_INCREASE', vel: 2.1, conf: 78, cov: 'ADEQUATE' },
  { id: 4, name: 'Salem', code: 'SLM', hq: 'Salem', lat: 11.6643, lng: 78.1460, pop: 3482000, risk: 'INCREASING', trend: 'MODERATE_INCREASE', vel: 2.4, conf: 82, cov: 'ADEQUATE' },
  { id: 5, name: 'Tiruchirappalli', code: 'TPJ', hq: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, pop: 2722000, risk: 'WATCH', trend: 'STABLE', vel: 1.1, conf: 74, cov: 'ADEQUATE' },
  { id: 6, name: 'Tirunelveli', code: 'TIN', hq: 'Tirunelveli', lat: 8.7139, lng: 77.7567, pop: 1665000, risk: 'WATCH', trend: 'STABLE', vel: 1.0, conf: 72, cov: 'MODERATE' },
  { id: 7, name: 'Tiruppur', code: 'TPR', hq: 'Tiruppur', lat: 11.1085, lng: 77.3411, pop: 2479000, risk: 'INCREASING', trend: 'MODERATE_INCREASE', vel: 2.8, conf: 80, cov: 'ADEQUATE' },
  { id: 8, name: 'Erode', code: 'ERD', hq: 'Erode', lat: 11.3410, lng: 77.7172, pop: 2251000, risk: 'WATCH', trend: 'STABLE', vel: 1.2, conf: 75, cov: 'ADEQUATE' },
  { id: 9, name: 'Vellore', code: 'VEL', hq: 'Vellore', lat: 12.9165, lng: 79.1325, pop: 1614000, risk: 'INCREASING', trend: 'MODERATE_INCREASE', vel: 2.2, conf: 76, cov: 'ADEQUATE' },
  { id: 10, name: 'Krishnagiri', code: 'KRI', hq: 'Krishnagiri', lat: 12.5186, lng: 78.2137, pop: 1879000, risk: 'HIGH PREVENTIVE ATTENTION', trend: 'RAPID_INCREASE', vel: 4.8, conf: 85, cov: 'ADEQUATE' },
  { id: 11, name: 'Dindigul', code: 'DGL', hq: 'Dindigul', lat: 10.3673, lng: 77.9803, pop: 2159000, risk: 'WATCH', trend: 'STABLE', vel: 0.9, conf: 68, cov: 'MODERATE' },
  { id: 12, name: 'Thanjavur', code: 'TNJ', hq: 'Thanjavur', lat: 10.7870, lng: 79.1378, pop: 2405000, risk: 'LOW', trend: 'DECREASING', vel: 0.7, conf: 64, cov: 'MODERATE' },
  { id: 13, name: 'Thoothukudi', code: 'TUT', hq: 'Thoothukudi', lat: 8.7642, lng: 78.1348, pop: 1750000, risk: 'INCREASING', trend: 'MODERATE_INCREASE', vel: 2.5, conf: 86, cov: 'ADEQUATE' },
  { id: 14, name: 'Kanniyakumari', code: 'KKI', hq: 'Nagercoil', lat: 8.0883, lng: 77.5385, pop: 1870000, risk: 'WATCH', trend: 'STABLE', vel: 1.1, conf: 70, cov: 'MODERATE' },
  { id: 15, name: 'Tenkasi', code: 'TSI', hq: 'Tenkasi', lat: 8.9594, lng: 77.3152, pop: 1407000, risk: 'WATCH', trend: 'RAPID_INCREASE', vel: 2.3, conf: 68, cov: 'LIMITED' },
  { id: 16, name: 'Kancheepuram', code: 'KCP', hq: 'Kancheepuram', lat: 12.8342, lng: 79.7036, pop: 1166000, risk: 'WATCH', trend: 'STABLE', vel: 1.0, conf: 72, cov: 'ADEQUATE' },
  { id: 17, name: 'Chengalpattu', code: 'CGL', hq: 'Chengalpattu', lat: 12.6819, lng: 79.9888, pop: 2556000, risk: 'INCREASING', trend: 'MODERATE_INCREASE', vel: 2.1, conf: 78, cov: 'ADEQUATE' },
  { id: 18, name: 'Tiruvallur', code: 'TLR', hq: 'Tiruvallur', lat: 13.1432, lng: 79.9079, pop: 3728000, risk: 'INCREASING', trend: 'MODERATE_INCREASE', vel: 2.3, conf: 80, cov: 'ADEQUATE' },
  { id: 19, name: 'Cuddalore', code: 'CUD', hq: 'Cuddalore', lat: 11.7480, lng: 79.7714, pop: 2605000, risk: 'LOW', trend: 'STABLE', vel: 0.8, conf: 62, cov: 'MODERATE' },
  { id: 20, name: 'Viluppuram', code: 'VLP', hq: 'Viluppuram', lat: 11.9401, lng: 79.4861, pop: 2093000, risk: 'WATCH', trend: 'STABLE', vel: 1.0, conf: 65, cov: 'MODERATE' },
  { id: 21, name: 'Kallakurichi', code: 'KLK', hq: 'Kallakurichi', lat: 11.7383, lng: 78.9639, pop: 1370000, risk: 'LOW', trend: 'STABLE', vel: 0.6, conf: 58, cov: 'LIMITED' },
  { id: 22, name: 'Dharmapuri', code: 'DPI', hq: 'Dharmapuri', lat: 12.1211, lng: 78.1582, pop: 1506000, risk: 'WATCH', trend: 'MODERATE_INCREASE', vel: 1.4, conf: 66, cov: 'MODERATE' },
  { id: 23, name: 'Namakkal', code: 'NMK', hq: 'Namakkal', lat: 11.2189, lng: 78.1674, pop: 1726000, risk: 'WATCH', trend: 'STABLE', vel: 0.9, conf: 68, cov: 'MODERATE' },
  { id: 24, name: 'Nilgiris', code: 'NIL', hq: 'Udhagamandalam', lat: 11.4102, lng: 76.6950, pop: 735000, risk: 'WATCH', trend: 'MODERATE_INCREASE', vel: 1.8, conf: 74, cov: 'MODERATE' },
  { id: 25, name: 'Karur', code: 'KRR', hq: 'Karur', lat: 10.9601, lng: 78.0766, pop: 1064000, risk: 'LOW', trend: 'STABLE', vel: 0.7, conf: 60, cov: 'MODERATE' },
  { id: 26, name: 'Ariyalur', code: 'ARI', hq: 'Ariyalur', lat: 11.1401, lng: 79.0786, pop: 754000, risk: 'INSUFFICIENT_DATA', trend: 'STABLE', vel: 0.3, conf: 42, cov: 'LIMITED' },
  { id: 27, name: 'Perambalur', code: 'PBL', hq: 'Perambalur', lat: 11.2342, lng: 78.8820, pop: 565000, risk: 'INSUFFICIENT_DATA', trend: 'STABLE', vel: 0.4, conf: 44, cov: 'LIMITED' },
  { id: 28, name: 'Pudukkottai', code: 'PDK', hq: 'Pudukkottai', lat: 10.3797, lng: 78.8208, pop: 1618000, risk: 'LOW', trend: 'STABLE', vel: 0.8, conf: 61, cov: 'MODERATE' },
  { id: 29, name: 'Sivaganga', code: 'SVG', hq: 'Sivaganga', lat: 9.8433, lng: 78.4809, pop: 1339000, risk: 'LOW', trend: 'STABLE', vel: 0.6, conf: 59, cov: 'LIMITED' },
  { id: 30, name: 'Ramanathapuram', code: 'RMD', hq: 'Ramanathapuram', lat: 9.3639, lng: 78.8395, pop: 1353000, risk: 'WATCH', trend: 'MODERATE_INCREASE', vel: 1.5, conf: 71, cov: 'MODERATE' },
  { id: 31, name: 'Virudhunagar', code: 'VRD', hq: 'Virudhunagar', lat: 9.5680, lng: 77.9624, pop: 1942000, risk: 'WATCH', trend: 'STABLE', vel: 1.0, conf: 69, cov: 'MODERATE' },
  { id: 32, name: 'Theni', code: 'THI', hq: 'Theni', lat: 10.0104, lng: 77.4768, pop: 1245000, risk: 'INCREASING', trend: 'MODERATE_INCREASE', vel: 1.9, conf: 73, cov: 'MODERATE' },
  { id: 33, name: 'Thiruvarur', code: 'TVR', hq: 'Thiruvarur', lat: 10.7725, lng: 79.6365, pop: 1264000, risk: 'LOW', trend: 'DECREASING', vel: 0.5, conf: 56, cov: 'LIMITED' },
  { id: 34, name: 'Nagapattinam', code: 'NGP', hq: 'Nagapattinam', lat: 10.7672, lng: 79.8449, pop: 697000, risk: 'WATCH', trend: 'STABLE', vel: 1.2, conf: 68, cov: 'MODERATE' },
  { id: 35, name: 'Mayiladuthurai', code: 'MYD', hq: 'Mayiladuthurai', lat: 11.1075, lng: 79.6522, pop: 918000, risk: 'LOW', trend: 'STABLE', vel: 0.6, conf: 58, cov: 'LIMITED' },
  { id: 36, name: 'Ranipet', code: 'RNP', hq: 'Ranipet', lat: 12.9272, lng: 79.3330, pop: 1210000, risk: 'WATCH', trend: 'MODERATE_INCREASE', vel: 1.6, conf: 72, cov: 'ADEQUATE' },
  { id: 37, name: 'Tirupathur', code: 'TPR_N', hq: 'Tirupathur', lat: 12.4926, lng: 78.5678, pop: 1111000, risk: 'WATCH', trend: 'STABLE', vel: 1.2, conf: 67, cov: 'MODERATE' },
  { id: 38, name: 'Tiruvannamalai', code: 'TVM', hq: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, pop: 2464000, risk: 'WATCH', trend: 'STABLE', vel: 1.1, conf: 70, cov: 'ADEQUATE' }
];

// Helper to write CSV
function writeCsv(filename, headers, rows) {
  const filePath = path.join(SYNTHETIC_DIR, filename);
  const csvContent = [headers.join(','), ...rows.map((r) => r.map((val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  }).join(','))].join('\n');
  fs.writeFileSync(filePath, csvContent, 'utf8');
  console.log(`Generated ${filename} (${rows.length} rows)`);
}

// Generate Datasets
console.log('Generating complete synthetic datasets for NARVEX (All 38 Districts)...');

// 01_districts.csv
const districtRows = DISTRICTS.map((d) => [
  d.id, 'TN', d.name, d.code, d.hq, d.lat, d.lng, d.pop, d.risk, d.trend, d.vel, d.conf, d.cov, 0, 0, 0, 0, 0
]);
writeCsv('01_districts.csv', [
  'district_id', 'state_code', 'district_name', 'district_code', 'headquarters', 'latitude', 'longitude', 'baseline_population', 'risk_level', 'trend_direction', 'velocity_30d', 'confidence_score', 'coverage_status', 'verified_events_count', 'emerging_zones_count', 'active_alerts_count', 'pending_verification_count', 'first_time_signals_count'
], districtRows);

// 02_taluks.csv
const talukRows = [];
let talukId = 1;
DISTRICTS.forEach((d) => {
  const talukNames = [
    `${d.name} North`, `${d.name} South`, `${d.name} East`, `${d.name} West`,
    `${d.name} Rural`, `${d.name} Central`
  ].slice(0, randInt(3, 5));

  talukNames.forEach((tName) => {
    talukRows.push([
      talukId++, d.id, d.name, tName,
      (d.lat + (random() - 0.5) * 0.15).toFixed(4),
      (d.lng + (random() - 0.5) * 0.15).toFixed(4),
      randInt(120000, 450000)
    ]);
  });
});
writeCsv('02_taluks.csv', ['taluk_id', 'district_id', 'district_name', 'taluk_name', 'latitude', 'longitude', 'population'], talukRows);

// 03_localities.csv
const localityRows = [];
let localityId = 1;
talukRows.forEach((t) => {
  const locTypes = ['COMMERCIAL', 'CAMPUS_ZONE', 'LOGISTICS_PARK', 'RESIDENTIAL', 'TRANSIT_JUNCTION', 'VILLAGE'];
  const locNames = [
    `${t[3]} Sector A`, `${t[3]} Market`, `${t[3]} Bypass Hub`, `${t[3]} Industrial Colony`
  ].slice(0, randInt(2, 3));

  locNames.forEach((locName) => {
    localityRows.push([
      localityId++, t[0], t[1], t[2], locName, randChoice(locTypes),
      (parseFloat(t[4]) + (random() - 0.5) * 0.05).toFixed(4),
      (parseFloat(t[5]) + (random() - 0.5) * 0.05).toFixed(4)
    ]);
  });
});
writeCsv('03_localities.csv', ['locality_id', 'taluk_id', 'district_id', 'district_name', 'locality_name', 'locality_type', 'latitude', 'longitude'], localityRows);

// 04_police_stations.csv
const stationRows = [];
let stationId = 1;
DISTRICTS.forEach((d) => {
  const count = randInt(3, 6);
  for (let i = 1; i <= count; i++) {
    stationRows.push([
      stationId++, d.id, d.name, `PS-${d.code}-${i.toString().padStart(2, '0')}`,
      `${d.name} Town PS ${i}`, `B${i}-Division`,
      (d.lat + (random() - 0.5) * 0.1).toFixed(4),
      (d.lng + (random() - 0.5) * 0.1).toFixed(4)
    ]);
  }
});
writeCsv('04_police_stations.csv', ['station_id', 'district_id', 'district_name', 'station_code', 'station_name', 'division', 'latitude', 'longitude'], stationRows);

// 05_checkposts.csv
const checkposts = [
  { name: 'Zuzuvadi Checkpost', dId: 10, dName: 'Krishnagiri', lat: 12.7214, lng: 77.8341, border: 'Karnataka (NH-48)' },
  { name: 'Walayar Checkpost', dId: 2, dName: 'Coimbatore', lat: 10.8456, lng: 76.8523, border: 'Kerala (NH-544)' },
  { name: 'Puliyarai Checkpost', dId: 15, dName: 'Tenkasi', lat: 8.9832, lng: 77.1642, border: 'Kerala (NH-744)' },
  { name: 'Kaliyakkavilai Post', dId: 14, dName: 'Kanniyakumari', lat: 8.3121, lng: 77.1425, border: 'Kerala (NH-66)' },
  { name: 'Gummidipoondi Gate', dId: 18, dName: 'Tiruvallur', lat: 13.4121, lng: 80.1245, border: 'Andhra Pradesh (NH-16)' },
  { name: 'Ennore Port Checkpoint', dId: 1, dName: 'Chennai', lat: 13.2341, lng: 80.3214, border: 'Maritime Logistics' },
  { name: 'V.O.C. Port Terminal', dId: 13, dName: 'Thoothukudi', lat: 8.7521, lng: 78.1832, border: 'Maritime Coast' },
  { name: 'Attibele Border Axis', dId: 10, dName: 'Krishnagiri', lat: 12.7845, lng: 77.7712, border: 'Karnataka Border' }
];
const checkpostRows = checkposts.map((c, idx) => [
  idx + 1, c.dId, c.dName, c.name, c.border, c.lat, c.lng, '24x7 HIGH_FREQUENCY'
]);
writeCsv('05_checkposts.csv', ['checkpost_id', 'district_id', 'district_name', 'checkpost_name', 'border_state_corridor', 'latitude', 'longitude', 'operational_mode'], checkpostRows);

// 06_citizen_reports.csv (1,250 records)
const DRUG_CATEGORIES = ['COMMERCIAL_GANJA', 'SYNTHETIC_MDMA', 'PRESCRIPTION_NARCOTICS', 'CHEMICAL_PRECURSORS', 'OPIOID_ANALOGUES', 'UNKNOWN_CONTRABAND'];
const VERIFICATION_STATUSES = ['UNVERIFIED', 'NEEDS_VERIFICATION', 'CORROBORATED', 'DISMISSED'];

const citizenRows = [];
for (let i = 1; i <= 1250; i++) {
  const d = randChoice(DISTRICTS);
  const taluk = randChoice(talukRows.filter((t) => t[1] === d.id)) || talukRows[0];
  const loc = randChoice(localityRows.filter((l) => l[2] === d.id)) || localityRows[0];
  const isFirstTime = random() < 0.12;
  const anonToken = `ANON-TN-${sha256(`citizen-${i}`).substring(0, 10).toUpperCase()}`;

  citizenRows.push([
    `CR-2026-${i.toString().padStart(5, '0')}`,
    anonToken,
    randDate(700, 0),
    d.id,
    d.name,
    taluk[0],
    taluk[3],
    loc[0],
    loc[4],
    randChoice(['SUSPECTED_DISTRIBUTION', 'COMMUNITY_CONCERN', 'HEALTH_EMERGENCY', 'REHAB_NEED']),
    randChoice(DRUG_CATEGORIES),
    `Anonymous observation reported near ${loc[4]} locality in ${d.name}.`,
    randChoice(['WEB_PORTAL', 'MOBILE_APP', 'TOLL_FREE_IVR', 'TELEGRAM_BOT']),
    randChoice(VERIFICATION_STATUSES),
    'PROCESSED',
    `DUP-GRP-${randInt(1, 400)}`,
    randChoice(['HIGH', 'MEDIUM', 'LOW']),
    randInt(55, 92),
    isFirstTime ? 1 : 0
  ]);
}
writeCsv('06_citizen_reports.csv', [
  'report_id', 'anonymous_token', 'received_at', 'district_id', 'district_name', 'taluk_id', 'taluk_name', 'locality_id', 'locality_name', 'signal_type', 'drug_category', 'description', 'source_channel', 'verification_status', 'processing_status', 'duplicate_group_id', 'risk_relevance', 'confidence_score', 'is_first_time_signal'
], citizenRows);

// 07_police_reports.csv (1,150 records)
const policeRows = [];
for (let i = 1; i <= 1150; i++) {
  const d = randChoice(DISTRICTS);
  const st = randChoice(stationRows.filter((s) => s[1] === d.id)) || stationRows[0];
  policeRows.push([
    `PR-2026-${i.toString().padStart(5, '0')}`,
    st[0],
    st[4],
    d.id,
    d.name,
    randDate(700, 0),
    randChoice(['ROUTINE_PATROL_SCAN', 'TIP_VERIFICATION', 'CHECKPOST_INTERCEPTION', 'RAID_SEIZURE']),
    randChoice(DRUG_CATEGORIES),
    randChoice(['VERIFIED_INCIDENT', 'UNDER_INVESTIGATION', 'ACTION_COMPLETED']),
    randChoice(['CRIME_BRANCH', 'PROHIBITION_WING', 'HIGHWAY_PATROL', 'STATION_BEAT']),
    randInt(75, 98)
  ]);
}
writeCsv('07_police_reports.csv', [
  'report_id', 'station_id', 'station_name', 'district_id', 'district_name', 'incident_timestamp', 'incident_type', 'drug_category', 'status', 'reporting_wing', 'evidence_confidence'
], policeRows);

// 08_fir_incidents.csv (1,100 records)
const firRows = [];
for (let i = 1; i <= 1100; i++) {
  const d = randChoice(DISTRICTS);
  const st = randChoice(stationRows.filter((s) => s[1] === d.id)) || stationRows[0];
  firRows.push([
    `FIR-${d.code}-${2025 + randInt(0, 1)}-${i.toString().padStart(4, '0')}`,
    st[0],
    st[4],
    d.id,
    d.name,
    randDate(700, 0),
    'NDPS ACT SEC 8(c)/20(b)/22',
    randChoice(DRUG_CATEGORIES),
    randChoice(['COMMERCIAL_QUANTITY', 'INTERMEDIATE_QUANTITY', 'SMALL_QUANTITY']),
    randChoice(['CHARGESHEET_FILED', 'PENDING_TRIAL', 'UNDER_INVESTIGATION']),
    randInt(85, 99)
  ]);
}
writeCsv('08_fir_incidents.csv', [
  'fir_number', 'station_id', 'station_name', 'district_id', 'district_name', 'fir_date', 'offense_section', 'drug_category', 'quantity_band', 'investigation_status', 'confidence_score'
], firRows);

// 09_seizure_checkpost_reports.csv (1,050 records)
const seizureRows = [];
for (let i = 1; i <= 1050; i++) {
  const cp = randChoice(checkposts);
  seizureRows.push([
    `SZ-2026-${i.toString().padStart(5, '0')}`,
    cp.name,
    cp.dId,
    cp.dName,
    randDate(700, 0),
    randChoice(['INBOUND_TO_TN', 'TRANSIT_CORRIDOR', 'OUTBOUND_STATE']),
    randChoice(DRUG_CATEGORIES),
    randChoice(['BAND_A_COMMERCIAL_BULK', 'BAND_B_MEDIUM_TRANSIT', 'BAND_C_PERSONAL_PARCEL']),
    randChoice(['VERIFIED_FIELD_SEIZURE', 'DETECTED_SCANNER_ANOMALY', 'INTERSTATE_ALERT_HOLD']),
    randInt(82, 98)
  ]);
}
writeCsv('09_seizure_checkpost_reports.csv', [
  'seizure_id', 'checkpost_name', 'district_id', 'district_name', 'timestamp', 'transit_direction', 'drug_category', 'quantity_band', 'verification_status', 'evidence_confidence'
], seizureRows);

// 10_helpline_signals.csv (1,050 records)
const helplineRows = [];
for (let i = 1; i <= 1050; i++) {
  const d = randChoice(DISTRICTS);
  helplineRows.push([
    `HL-2026-${i.toString().padStart(5, '0')}`,
    randDate(700, 0),
    d.id,
    d.name,
    randChoice(['10583_STATE_HELPLINE', '112_EMERGENCY_DISPATCH', '1098_CHILDLINE_REFERRAL']),
    randChoice(['DE_ADDICTION_SUPPORT', 'COMMUNITY_SUSPICION', 'YOUTH_COUNSELLING_REQUEST']),
    randChoice(DRUG_CATEGORIES),
    randInt(60, 88)
  ]);
}
writeCsv('10_helpline_signals.csv', [
  'signal_id', 'call_timestamp', 'district_id', 'district_name', 'helpline_source', 'request_type', 'drug_category', 'confidence_score'
], helplineRows);

// 11_health_rehabilitation_signals.csv (1,000 records)
const healthRows = [];
for (let i = 1; i <= 1000; i++) {
  const d = randChoice(DISTRICTS);
  healthRows.push([
    `HR-2026-${i.toString().padStart(5, '0')}`,
    randDate(700, 0),
    d.id,
    d.name,
    randChoice(['GOVT_MEDICAL_COLLEGE_PSYCH', 'DISTRICT_HQ_HOSPITAL', 'LICENSED_DE_ADDICTION_NGO']),
    randChoice(['WITHDRAWAL_ADMISSION', 'OUTPATIENT_SUBSTANCE_CONSULT', 'TOXICOLOGY_SCREEN_AGGREGATE']),
    randChoice(DRUG_CATEGORIES),
    randInt(1, 15),
    randInt(70, 94)
  ]);
}
writeCsv('11_health_rehabilitation_signals.csv', [
  'health_record_id', 'reporting_period', 'district_id', 'district_name', 'facility_type', 'aggregate_signal_type', 'primary_category', 'aggregate_patient_count', 'confidence_score'
], healthRows);

// 12_enforcement_activity.csv (1,100 records)
const enforcementRows = [];
for (let i = 1; i <= 1100; i++) {
  const d = randChoice(DISTRICTS);
  enforcementRows.push([
    `ENF-2026-${i.toString().padStart(5, '0')}`,
    d.id,
    d.name,
    randDate(700, 0),
    randChoice(['INTENSIVE_VEHICLE_CHECK', 'SPECIAL_CAMPUS_DRIVE', 'HOTEL_LODGE_SURPRISE_INSPECTION', 'COASTAL_PATROL_SWEEP']),
    randChoice(['NO_CONTRABAND_FOUND', 'INTERMEDIATE_DISCREPANCY', 'SEIZURE_REGISTERED']),
    randChoice(['PROHIBITION_ENFORCEMENT_WING', 'DISTRICT_SPECIAL_TASK_FORCE', 'COASTAL_SECURITY_GROUP']),
    randInt(85, 99)
  ]);
}
writeCsv('12_enforcement_activity.csv', [
  'enforcement_id', 'district_id', 'district_name', 'activity_timestamp', 'operation_type', 'outcome_summary', 'enforcing_agency', 'data_integrity_score'
], enforcementRows);

// 13_intelligence_signals.csv (1,500 records)
const intelSignalRows = [];
for (let i = 1; i <= 1500; i++) {
  const d = randChoice(DISTRICTS);
  const isFirst = random() < 0.08;
  intelSignalRows.push([
    `SIG-TN-${i.toString().padStart(5, '0')}`,
    d.id,
    d.name,
    randDate(700, 0),
    randChoice(['CITIZEN_AGGREGATE', 'CHECKPOST_TELEMETRY', 'POLICE_INVESTIGATION', 'HEALTH_ANOMALY']),
    randChoice(DRUG_CATEGORIES),
    randChoice(['HIGH_PREVENTIVE_ATTENTION', 'INCREASING', 'WATCH', 'EMERGING']),
    randInt(65, 96),
    isFirst ? 'FIRST_TIME_SIGNAL' : 'RECURRENT_PATTERN',
    isFirst ? 1 : 0
  ]);
}
writeCsv('13_intelligence_signals.csv', [
  'signal_id', 'district_id', 'district_name', 'event_timestamp', 'signal_source', 'drug_category', 'risk_indicator', 'confidence_score', 'lifecycle_state', 'is_first_time_signal'
], intelSignalRows);

// 14_drug_category_signals.csv (1,200 records)
const categorySignalRows = [];
for (let i = 1; i <= 1200; i++) {
  const d = randChoice(DISTRICTS);
  categorySignalRows.push([
    `CAT-SIG-${i.toString().padStart(5, '0')}`,
    d.id,
    d.name,
    randChoice(DRUG_CATEGORIES),
    randDate(700, 0),
    randChoice(['RETAIL_PEDDLING', 'HIGHWAY_LOGISTICS', 'PHARMACY_DIVERSION', 'PARCEL_COURIER']),
    randInt(5, 45),
    randInt(60, 95)
  ]);
}
writeCsv('14_drug_category_signals.csv', [
  'id', 'district_id', 'district_name', 'drug_category', 'timestamp', 'suspected_channel', 'volume_index', 'confidence_score'
], categorySignalRows);

// 15_spatial_corridors.csv
const spatialCorridors = [
  { id: 1, name: 'Walayar - Coimbatore - Salem Corridor', oId: 2, oName: 'Coimbatore', dId: 4, dName: 'Salem', route: 'NH-544 / NH-44', dist: 165 },
  { id: 2, name: 'Attibele - Hosur - Krishnagiri Axis', oId: 10, oName: 'Krishnagiri', dId: 4, dName: 'Salem', route: 'NH-48', dist: 120 },
  { id: 3, name: 'Chittoor - Tiruvallur - Chennai Port Gateway', oId: 18, oName: 'Tiruvallur', dId: 1, dName: 'Chennai', route: 'NH-16', dist: 95 },
  { id: 4, name: 'Puliyarai - Tenkasi - Madurai Highway', oId: 15, oName: 'Tenkasi', dId: 3, dName: 'Madurai', route: 'NH-744', dist: 160 },
  { id: 5, name: 'Madurai - Thoothukudi Maritime Axis', oId: 3, oName: 'Madurai', dId: 13, dName: 'Thoothukudi', route: 'NH-38', dist: 145 },
  { id: 6, name: 'Salem - Namakkal - Karur Axis', oId: 4, oName: 'Salem', dId: 25, dName: 'Karur', route: 'NH-44', dist: 98 },
  { id: 7, name: 'Coimbatore - Tiruppur - Erode Industrial Route', oId: 2, oName: 'Coimbatore', dId: 8, dName: 'Erode', route: 'SH-17', dist: 105 },
  { id: 8, name: 'Chennai - Chengalpattu - Viluppuram Corridor', oId: 1, oName: 'Chennai', dId: 20, dName: 'Viluppuram', route: 'NH-32 / NH-132', dist: 160 }
];
const corridorRows = spatialCorridors.map((c) => [
  c.id, c.name, c.oId, c.oName, c.dId, c.dName, c.route, c.dist, 'HISTORICAL_SPATIAL_ASSOCIATION', 'ACTIVE_MONITORING'
]);
writeCsv('15_spatial_corridors.csv', [
  'corridor_id', 'corridor_name', 'origin_district_id', 'origin_district_name', 'destination_district_id', 'destination_district_name', 'highway_route', 'distance_km', 'classification_type', 'monitoring_status'
], corridorRows);

// 16_corridor_observations.csv (1,200 records)
const corridorObsRows = [];
for (let i = 1; i <= 1200; i++) {
  const c = randChoice(spatialCorridors);
  corridorObsRows.push([
    `OBS-CORR-${i.toString().padStart(5, '0')}`,
    c.id,
    c.name,
    randDate(700, 0),
    randChoice(['LATE_NIGHT_TRANSIT_SPIKE', 'CHECKPOST_ANOMALY_HOLD', 'GPS_CORRELATED_TIP', 'FREIGHT_LOGISTICS_SCAN']),
    randChoice(['STRENGTHENING', 'STABLE', 'WEAKENING', 'NEWLY_EMERGING']),
    randInt(72, 96),
    'Historical association telemetry only; does not establish unlawful transit.'
  ]);
}
writeCsv('16_corridor_observations.csv', [
  'observation_id', 'corridor_id', 'corridor_name', 'observation_timestamp', 'trigger_telemetry', 'association_trend', 'confidence_score', 'disclaimer_label'
], corridorObsRows);

// 17_risk_zone_history.csv (1,200 records)
const riskZoneRows = [];
for (let i = 1; i <= 1200; i++) {
  const d = randChoice(DISTRICTS);
  riskZoneRows.push([
    `RZ-HIST-${i.toString().padStart(5, '0')}`,
    d.id,
    d.name,
    randDate(700, 0),
    d.risk,
    d.vel,
    d.conf,
    d.cov,
    randChoice(['ACCELERATING_30D', 'BASELINE_NORMAL', 'DATA_COVERAGE_GAP', 'DECELERATING'])
  ]);
}
writeCsv('17_risk_zone_history.csv', [
  'snapshot_id', 'district_id', 'district_name', 'snapshot_timestamp', 'risk_indicator', 'velocity_ratio', 'confidence_score', 'coverage_status', 'trend_classification'
], riskZoneRows);

// 18_emerging_zone_events.csv (1,050 records)
const emergingRows = [];
for (let i = 1; i <= 1050; i++) {
  const d = randChoice(DISTRICTS);
  emergingRows.push([
    `EMG-EVT-${i.toString().padStart(5, '0')}`,
    d.id,
    d.name,
    randDate(700, 0),
    randChoice(['NEW_SIGNAL', 'UNVERIFIED', 'EMERGING', 'CORROBORATED', 'PERSISTENT', 'DISMISSED']),
    randChoice(['CLUSTER_FORMATION_48H', 'FIRST_TIME_REPORT', 'MULTI_SOURCE_CONVERGENCE', 'ANOMALY_CLEARED']),
    randInt(62, 94)
  ]);
}
writeCsv('18_emerging_zone_events.csv', [
  'event_id', 'district_id', 'district_name', 'timestamp', 'lifecycle_state', 'transition_reason', 'confidence_score'
], emergingRows);

// 19_forecast_zone_history.csv (1,100 records)
const forecastRows = [];
for (let i = 1; i <= 1100; i++) {
  const d = randChoice(DISTRICTS);
  forecastRows.push([
    `FC-HIST-${i.toString().padStart(5, '0')}`,
    d.id,
    d.name,
    randDate(700, 0),
    randChoice(['30_DAY_PREVENTIVE_ATTENTION', '90_DAY_PREVENTIVE_ATTENTION']),
    randChoice(['HIGH PREVENTIVE ATTENTION', 'INCREASING', 'WATCH', 'STABLE']),
    randInt(68, 92),
    randChoice(['HIGHWAY_CHECKPOST_ACCELERATION', 'CAMPUS_SECTOR_MICRO_CLUSTER', 'INTERSTATE_FREIGHT_DISCREPANCY']),
    'NARVEX_TEMPORAL_BAYES_V2.1',
    'Preventive attention priority indicator only; not criminal proof.'
  ]);
}
writeCsv('19_forecast_zone_history.csv', [
  'forecast_id', 'district_id', 'district_name', 'generated_at', 'target_horizon', 'forecast_risk_level', 'forecast_confidence', 'primary_contributing_factor', 'model_version', 'safeguard_disclaimer'
], forecastRows);

// 20_alerts.csv (1,050 records)
const alertRows = [];
for (let i = 1; i <= 1050; i++) {
  const d = randChoice(DISTRICTS);
  alertRows.push([
    `ALT-2026-${i.toString().padStart(5, '0')}`,
    d.id,
    d.name,
    randDate(700, 0),
    randChoice(['RAPID_INCREASE', 'NEW_SIGNAL', 'EMERGING_ZONE', 'CORRIDOR_SURGE', 'DATA_ANOMALY', 'HIGH_RISK_LOW_CONFIDENCE']),
    randChoice(['CRITICAL', 'HIGH', 'MEDIUM', 'ADVISORY']),
    randChoice(['ACTIVE_UNASSIGNED', 'ASSIGNED_FOR_TRIAGE', 'VERIFIED_ACTIONED', 'RESOLVED']),
    `Statistically significant pattern change observed in ${d.name} jurisdiction.`,
    randInt(65, 96)
  ]);
}
writeCsv('20_alerts.csv', [
  'alert_id', 'district_id', 'district_name', 'created_at', 'alert_type', 'priority_level', 'status', 'trigger_summary', 'confidence_score'
], alertRows);

// 21_action_tickets.csv (1,000 records)
const ticketRows = [];
for (let i = 1; i <= 1000; i++) {
  const d = randChoice(DISTRICTS);
  ticketRows.push([
    `TCK-2026-${i.toString().padStart(5, '0')}`,
    `ALT-2026-${randInt(1, 1050).toString().padStart(5, '0')}`,
    d.id,
    d.name,
    `OFFICER-TN-${randInt(101, 199)}`,
    randDate(600, 0),
    randChoice(['IMMEDIATE_PATROL_DISPATCH', 'HUMAN_INTELLIGENCE_INSPECTION', 'CHECKPOST_ENHANCED_SURVEILLANCE', 'INTER_AGENCY_COORDINATION']),
    randChoice(['OPEN', 'IN_PROGRESS', 'ACTION_COMPLETED', 'ESCALATED', 'CLOSED']),
    randChoice(['HIGH', 'MEDIUM', 'LOW'])
  ]);
}
writeCsv('21_action_tickets.csv', [
  'ticket_id', 'associated_alert_id', 'district_id', 'district_name', 'assigned_officer_id', 'created_at', 'action_type', 'ticket_status', 'priority'
], ticketRows);

// 22_action_outcomes.csv (1,000 records)
const outcomeRows = [];
for (let i = 1; i <= 1000; i++) {
  outcomeRows.push([
    `OUT-2026-${i.toString().padStart(5, '0')}`,
    `TCK-2026-${i.toString().padStart(5, '0')}`,
    randDate(500, 0),
    randChoice(['SEIZURE_EXECUTED', 'PREVENTIVE_DETERRENCE_ACHIEVED', 'UNSUBSTANTIATED_TIP', 'CIVIL_SUPPORT_REFERRED']),
    randChoice(['MODEL_PREDICTION_VERIFIED', 'FALSE_ALARM_REPORTED', 'NEW_CORRIDOR_DISCOVERED']),
    randInt(75, 99)
  ]);
}
writeCsv('22_action_outcomes.csv', [
  'outcome_id', 'ticket_id', 'resolved_at', 'operational_outcome', 'feedback_to_intelligence_model', 'outcome_confidence'
], outcomeRows);

// 23_data_provenance.csv (1,500 records)
const provenanceRows = [];
for (let i = 1; i <= 1500; i++) {
  const hash = sha256(`provenance-block-${i}-${random()}`);
  provenanceRows.push([
    `PRV-${i.toString().padStart(6, '0')}`,
    `SIG-TN-${i.toString().padStart(5, '0')}`,
    randChoice(['CITIZEN_FEED', 'POLICE_LEDGER', 'CHECKPOST_OCR', 'HEALTH_STAT']),
    randDate(700, 0),
    'PII_REDACTED_AND_NORMALIZED',
    'VERIFIED_INTEGRITY',
    hash
  ]);
}
writeCsv('23_data_provenance.csv', [
  'provenance_id', 'target_record_id', 'source_origin_dataset', 'ingested_at', 'transformation_stage', 'verification_status', 'sha256_audit_hash'
], provenanceRows);

// 24_audit_events.csv (1,500 records)
const auditRows = [];
for (let i = 1; i <= 1500; i++) {
  const auditHash = sha256(`audit-log-${i}-${random()}`);
  auditRows.push([
    `AUDIT-${i.toString().padStart(6, '0')}`,
    randDate(700, 0),
    randChoice(['STATE_ADMIN', 'DISTRICT_OFFICER', 'VERIFICATION_OFFICER', 'AUTOMATED_INTELLIGENCE_SERVICE']),
    randChoice(['RECORD_INGESTION', 'RISK_RECALCULATION', 'ALERT_DISPATCH', 'TICKET_STATUS_UPDATE', 'DOSSIER_EXTRACTION']),
    `Event block #${i} verified with cryptographic hash chain.`,
    auditHash
  ]);
}
writeCsv('24_audit_events.csv', [
  'audit_id', 'event_timestamp', 'actor_role', 'action_performed', 'event_details', 'cryptographic_hash'
], auditRows);

// 25_model_evaluation.csv (1,000 records)
const modelEvalRows = [];
for (let i = 1; i <= 1000; i++) {
  const d = randChoice(DISTRICTS);
  modelEvalRows.push([
    `EVAL-${i.toString().padStart(5, '0')}`,
    d.id,
    d.name,
    randDate(700, 0),
    (0.82 + (random() * 0.14)).toFixed(3), // Precision
    (0.80 + (random() * 0.15)).toFixed(3), // Recall
    (0.81 + (random() * 0.14)).toFixed(3), // F1 Score
    (0.04 + (random() * 0.06)).toFixed(3), // False alarm rate
    randChoice(['OPTIMAL', 'SLIGHT_DRIFT', 'CALIBRATED']),
    'NARVEX_TEMPORAL_BAYES_V2.1'
  ]);
}
writeCsv('25_model_evaluation.csv', [
  'eval_id', 'district_id', 'district_name', 'evaluation_timestamp', 'precision_rate', 'recall_rate', 'f1_score', 'false_alarm_rate', 'concept_drift_status', 'model_version'
], modelEvalRows);

console.log('\n✅ All 25 synthetic datasets successfully generated in /data/synthetic/!');
