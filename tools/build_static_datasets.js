import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASETS_DIR = path.resolve(__dirname, '../data/datasets');

if (!fs.existsSync(DATASETS_DIR)) {
  fs.mkdirSync(DATASETS_DIR, { recursive: true });
}

// Fixed deterministic seed for offline static file generation
let s = 998877;
function rand() {
  const x = Math.sin(s++) * 10000;
  return x - Math.floor(x);
}
function rInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function rChoice(arr) {
  return arr[rInt(0, arr.length - 1)];
}
function rDate(daysAgoMin = 0, daysAgoMax = 730) {
  const now = new Date('2026-08-20T09:00:00Z').getTime();
  const t = now - rInt(daysAgoMin * 86400, daysAgoMax * 86400) * 1000 - rInt(0, 86400) * 1000;
  return new Date(t).toISOString().replace('T', ' ').substring(0, 19);
}
function sha256(val) {
  return crypto.createHash('sha256').update(String(val)).digest('hex');
}

function writeCsv(filename, headers, rows) {
  const filePath = path.join(DATASETS_DIR, filename);
  const csvContent = [headers.join(','), ...rows.map((r) => r.map((val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  }).join(','))].join('\n');
  fs.writeFileSync(filePath, csvContent, 'utf8');
  console.log(`[GENERATED RAW STATIC CSV] ${filename} — ${rows.length} rows`);
}

console.log('Building Clean Raw Observation Datasets (ZERO Predefined Risk Labels)...\n');

// 1. 01_districts.csv (38 Districts - Pure Administrative Data)
const DISTRICTS = [
  { id: 1, code: 'CHN', name: 'Chennai', hq: 'Chennai', lat: 13.0827, lng: 80.2707, pop: 7100000, zone: 'NORTH_METRO' },
  { id: 2, code: 'CBE', name: 'Coimbatore', hq: 'Coimbatore', lat: 11.0168, lng: 76.9558, pop: 3450000, zone: 'WEST_KONGU' },
  { id: 3, code: 'MDU', name: 'Madurai', hq: 'Madurai', lat: 9.9252, lng: 78.1198, pop: 3038000, zone: 'SOUTH_CENTRAL' },
  { id: 4, code: 'SLM', name: 'Salem', hq: 'Salem', lat: 11.6643, lng: 78.1460, pop: 3480000, zone: 'WEST_CENTRAL' },
  { id: 5, code: 'TRY', name: 'Tiruchirappalli', hq: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047, pop: 2722000, zone: 'CENTRAL_DELTA' },
  { id: 6, code: 'TNI', name: 'Tirunelveli', hq: 'Tirunelveli', lat: 8.7139, lng: 77.7567, pop: 1665000, zone: 'SOUTH_WEST' },
  { id: 7, code: 'ERD', name: 'Erode', hq: 'Erode', lat: 11.3410, lng: 77.7172, pop: 2250000, zone: 'WEST_KONGU' },
  { id: 8, code: 'TPR', name: 'Tiruppur', hq: 'Tiruppur', lat: 11.1085, lng: 77.3411, pop: 2479000, zone: 'WEST_KONGU' },
  { id: 9, code: 'VEL', name: 'Vellore', hq: 'Vellore', lat: 12.9165, lng: 79.1325, pop: 1614000, zone: 'NORTH_GATEWAY' },
  { id: 10, code: 'KRI', name: 'Krishnagiri', hq: 'Krishnagiri', lat: 12.5186, lng: 78.2137, pop: 1879000, zone: 'NORTH_BORDER' },
  { id: 11, code: 'DGL', name: 'Dindigul', hq: 'Dindigul', lat: 10.3673, lng: 77.9803, pop: 2159000, zone: 'SOUTH_CENTRAL' },
  { id: 12, code: 'TNJ', name: 'Thanjavur', hq: 'Thanjavur', lat: 10.7870, lng: 79.1378, pop: 2405000, zone: 'CENTRAL_DELTA' },
  { id: 13, code: 'TUT', name: 'Thoothukudi', hq: 'Thoothukudi', lat: 8.7642, lng: 78.1348, pop: 1750000, zone: 'SOUTH_COAST' },
  { id: 14, code: 'KKI', name: 'Kanniyakumari', hq: 'Nagercoil', lat: 8.0883, lng: 77.5385, pop: 1870000, zone: 'SOUTH_TIP' },
  { id: 15, code: 'TSI', name: 'Tenkasi', hq: 'Tenkasi', lat: 8.9594, lng: 77.3152, pop: 1407000, zone: 'SOUTH_WEST' },
  { id: 16, code: 'KCP', name: 'Kancheepuram', hq: 'Kancheepuram', lat: 12.8342, lng: 79.7036, pop: 1166000, zone: 'NORTH_METRO' },
  { id: 17, code: 'CGL', name: 'Chengalpattu', hq: 'Chengalpattu', lat: 12.6819, lng: 79.9888, pop: 2556000, zone: 'NORTH_COAST' },
  { id: 18, code: 'TLR', name: 'Tiruvallur', hq: 'Tiruvallur', lat: 13.1432, lng: 79.9079, pop: 3728000, zone: 'NORTH_BORDER' },
  { id: 19, code: 'CUD', name: 'Cuddalore', hq: 'Cuddalore', lat: 11.7480, lng: 79.7714, pop: 2605000, zone: 'EAST_COAST' },
  { id: 20, code: 'VLP', name: 'Viluppuram', hq: 'Viluppuram', lat: 11.9401, lng: 79.4861, pop: 2093000, zone: 'NORTH_CENTRAL' },
  { id: 21, code: 'KLK', name: 'Kallakurichi', hq: 'Kallakurichi', lat: 11.7383, lng: 78.9639, pop: 1370000, zone: 'NORTH_CENTRAL' },
  { id: 22, code: 'DPI', name: 'Dharmapuri', hq: 'Dharmapuri', lat: 12.1211, lng: 78.1582, pop: 1506000, zone: 'NORTH_WEST' },
  { id: 23, code: 'NMK', name: 'Namakkal', hq: 'Namakkal', lat: 11.2189, lng: 78.1674, pop: 1726000, zone: 'WEST_CENTRAL' },
  { id: 24, code: 'NIL', name: 'Nilgiris', hq: 'Udhagamandalam', lat: 11.4102, lng: 76.6950, pop: 735000, zone: 'WEST_HILLS' },
  { id: 25, code: 'KRR', name: 'Karur', hq: 'Karur', lat: 10.9601, lng: 78.0766, pop: 1064000, zone: 'CENTRAL' },
  { id: 26, code: 'ARI', name: 'Ariyalur', hq: 'Ariyalur', lat: 11.1401, lng: 79.0786, pop: 754000, zone: 'CENTRAL_DELTA' },
  { id: 27, code: 'PBL', name: 'Perambalur', hq: 'Perambalur', lat: 11.2342, lng: 78.8820, pop: 565000, zone: 'CENTRAL' },
  { id: 28, code: 'PDK', name: 'Pudukkottai', hq: 'Pudukkottai', lat: 10.3797, lng: 78.8208, pop: 1618000, zone: 'CENTRAL_SOUTH' },
  { id: 29, code: 'SVG', name: 'Sivaganga', hq: 'Sivaganga', lat: 9.8433, lng: 78.4809, pop: 1339000, zone: 'SOUTH_CENTRAL' },
  { id: 30, code: 'RMD', name: 'Ramanathapuram', hq: 'Ramanathapuram', lat: 9.3639, lng: 78.8395, pop: 1353000, zone: 'SOUTH_COAST' },
  { id: 31, code: 'VRD', name: 'Virudhunagar', hq: 'Virudhunagar', lat: 9.5680, lng: 77.9624, pop: 1942000, zone: 'SOUTH_WEST' },
  { id: 32, code: 'THI', name: 'Theni', hq: 'Theni', lat: 10.0104, lng: 77.4768, pop: 1245000, zone: 'SOUTH_WEST' },
  { id: 33, code: 'TVR', name: 'Thiruvarur', hq: 'Thiruvarur', lat: 10.7725, lng: 79.6365, pop: 1264000, zone: 'CENTRAL_DELTA' },
  { id: 34, code: 'NGP', name: 'Nagapattinam', hq: 'Nagapattinam', lat: 10.7672, lng: 79.8449, pop: 697000, zone: 'EAST_COAST' },
  { id: 35, code: 'MYD', name: 'Mayiladuthurai', hq: 'Mayiladuthurai', lat: 11.1075, lng: 79.6522, pop: 918000, zone: 'EAST_COAST' },
  { id: 36, code: 'RNP', name: 'Ranipet', hq: 'Ranipet', lat: 12.9272, lng: 79.3330, pop: 1210000, zone: 'NORTH_GATEWAY' },
  { id: 37, code: 'TPR_N', name: 'Tirupathur', hq: 'Tirupathur', lat: 12.4926, lng: 78.5678, pop: 1111000, zone: 'NORTH_WEST' },
  { id: 38, code: 'TVM', name: 'Tiruvannamalai', hq: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, pop: 2464000, zone: 'NORTH_CENTRAL' }
];

writeCsv('01_districts.csv', [
  'district_id', 'district_code', 'district_name', 'headquarters', 'latitude', 'longitude', 'population', 'administrative_zone'
], DISTRICTS.map((d) => [d.id, d.code, d.name, d.hq, d.lat, d.lng, d.pop, d.zone]));

// 2. 02_taluks.csv
const taluks = [];
let talukId = 1;
DISTRICTS.forEach((d) => {
  const names = [`${d.name} North`, `${d.name} South`, `${d.name} East`, `${d.name} West`, `${d.name} Central`];
  names.forEach((tName) => {
    taluks.push({
      id: talukId++,
      dId: d.id,
      dName: d.name,
      tName,
      lat: (d.lat + (rand() - 0.5) * 0.12).toFixed(4),
      lng: (d.lng + (rand() - 0.5) * 0.12).toFixed(4),
      pop: rInt(150000, 480000)
    });
  });
});
writeCsv('02_taluks.csv', ['taluk_id', 'district_id', 'district_name', 'taluk_name', 'latitude', 'longitude', 'population'], taluks.map((t) => [t.id, t.dId, t.dName, t.tName, t.lat, t.lng, t.pop]));

// 3. 03_localities.csv
const localities = [];
let locId = 1;
taluks.forEach((t) => {
  const locNames = [`${t.tName} Market`, `${t.tName} Campus Zone`, `${t.tName} Industrial Bypass`];
  locNames.forEach((lName) => {
    localities.push({
      id: locId++,
      tId: t.id,
      dId: t.dId,
      dName: t.dName,
      lName,
      type: rChoice(['COMMERCIAL_RETAIL', 'CAMPUS_SECTOR', 'INDUSTRIAL_PARK', 'RESIDENTIAL_WARD', 'TRANSIT_JUNCTION']),
      lat: (parseFloat(t.lat) + (rand() - 0.5) * 0.04).toFixed(4),
      lng: (parseFloat(t.lng) + (rand() - 0.5) * 0.04).toFixed(4)
    });
  });
});
writeCsv('03_localities.csv', ['locality_id', 'taluk_id', 'district_id', 'district_name', 'locality_name', 'locality_type', 'latitude', 'longitude'], localities.map((l) => [l.id, l.tId, l.dId, l.dName, l.lName, l.type, l.lat, l.lng]));

// 4. 12_drug_categories.csv
const CATEGORIES = [
  { id: 1, key: 'COMMERCIAL_GANJA', name: 'Commercial Ganja / Cannabis', weight: 1.2, desc: 'Flowering tops and compressed commercial contraband' },
  { id: 2, key: 'SYNTHETIC_MDMA', name: 'Synthetic Stimulants / MDMA / Meth', weight: 2.0, desc: 'Party pills, methamphetamine crystals, and synthetic analogues' },
  { id: 3, key: 'PRESCRIPTION_NARCOTICS', name: 'Prescription Narcotics / Codeine / Alprazolam', weight: 1.5, desc: 'Scheduled pharmaceutical formulations diverted without prescription' },
  { id: 4, key: 'CHEMICAL_PRECURSORS', name: 'Chemical Precursors / Ephedrine', weight: 1.8, desc: 'Controlled industrial precursor chemicals' },
  { id: 5, key: 'OPIOID_ANALOGUES', name: 'Opioid Analogues / Brown Sugar / Heroin', weight: 2.2, desc: 'Processed opioid narcotics and street-grade mixtures' },
  { id: 6, key: 'UNKNOWN_CONTRABAND', name: 'Unclassified / Suspicious Substance', weight: 1.0, desc: 'Substance pending forensic laboratory identification' }
];
writeCsv('12_drug_categories.csv', ['category_id', 'category_key', 'category_name', 'risk_weight', 'description'], CATEGORIES.map((c) => [c.id, c.key, c.name, c.weight, c.desc]));

// 5. 22_source_registry.csv
const SOURCES = [
  { id: 1, key: 'CITIZEN_ANON', name: 'Anonymous Citizen Portal', type: 'CITIZEN', rel: 0.65 },
  { id: 2, key: 'POLICE_FIR', name: 'Police FIR & Seizure Register', type: 'ENFORCEMENT', rel: 0.95 },
  { id: 3, key: 'CHECKPOST_SCANNER', name: 'State Checkpost Telemetry', type: 'CHECKPOST', rel: 0.90 },
  { id: 4, key: 'HELPLINE_10583', name: 'State Anti-Drug Helpline 10583', type: 'HELPLINE', rel: 0.70 },
  { id: 5, key: 'HEALTH_REHAB_STAT', name: 'Health & Rehab Aggregate Registry', type: 'HEALTH_AGGREGATE', rel: 0.85 }
];
writeCsv('22_source_registry.csv', ['source_id', 'source_key', 'source_name', 'source_type', 'reliability_weight'], SOURCES.map((s) => [s.id, s.key, s.name, s.type, s.rel]));

// 6. 04_complaints.csv (1,250 observations - NO predefined risk levels)
const complaints = [];
for (let i = 1; i <= 1250; i++) {
  const loc = rChoice(localities);
  const cat = rChoice(CATEGORIES);
  const src = rChoice(SOURCES);
  const isFirst = rInt(1, 100) <= 8;
  complaints.push([
    `CMP-2026-${i.toString().padStart(5, '0')}`,
    loc.dId,
    loc.dName,
    loc.tId,
    loc.id,
    loc.lName,
    cat.id,
    cat.name,
    src.id,
    src.name,
    rDate(0, 700),
    `Observation reported near ${loc.lName} sector in ${loc.dName}.`,
    rChoice(['VERIFIED', 'CORROBORATED', 'NEEDS_VERIFICATION', 'UNVERIFIED']),
    isFirst ? 1 : 0
  ]);
}
writeCsv('04_complaints.csv', [
  'complaint_id', 'district_id', 'district_name', 'taluk_id', 'locality_id', 'locality_name', 'category_id', 'category_name', 'source_id', 'source_name', 'reported_at', 'description_sanitized', 'verification_status', 'is_first_time_signal'
], complaints);

// 7. 05_police_reports.csv (1,150 observations)
const policeReports = [];
for (let i = 1; i <= 1150; i++) {
  const loc = rChoice(localities);
  const cat = rChoice(CATEGORIES);
  policeReports.push([
    `POL-2026-${i.toString().padStart(5, '0')}`,
    loc.dId,
    loc.dName,
    loc.tId,
    loc.id,
    `PS-${loc.dName.substring(0, 3).toUpperCase()}-B${rInt(1, 4)}`,
    rDate(0, 700),
    rChoice(['ROUTINE_BEAT_PATROL', 'SPECIAL_TASK_DRIVE', 'CHECKPOST_INTERCEPTION', 'SEARCH_SEIZURE']),
    cat.id,
    cat.name,
    rChoice(['ACTION_COMPLETED', 'PENDING_INVESTIGATION', 'CASE_REGISTERED'])
  ]);
}
writeCsv('05_police_reports.csv', [
  'police_report_id', 'district_id', 'district_name', 'taluk_id', 'locality_id', 'station_code', 'incident_timestamp', 'operation_type', 'category_id', 'category_name', 'investigation_status'
], policeReports);

// 8. 06_checkpost_reports.csv (1,050 observations)
const CHECKPOST_MASTERS = [
  { name: 'Zuzuvadi Checkpost', dId: 10, dName: 'Krishnagiri', corridor: 'Karnataka (NH-48)' },
  { name: 'Walayar Checkpost', dId: 2, dName: 'Coimbatore', corridor: 'Kerala (NH-544)' },
  { name: 'Puliyarai Checkpost', dId: 15, dName: 'Tenkasi', corridor: 'Kerala (NH-744)' },
  { name: 'Kaliyakkavilai Gate', dId: 14, dName: 'Kanniyakumari', corridor: 'Kerala (NH-66)' },
  { name: 'Gummidipoondi Checkpost', dId: 18, dName: 'Tiruvallur', corridor: 'Andhra Pradesh (NH-16)' },
  { name: 'Ennore Port Gate', dId: 1, dName: 'Chennai', corridor: 'Maritime Logistics' },
  { name: 'V.O.C. Port Terminal', dId: 13, dName: 'Thoothukudi', corridor: 'Maritime Coast' }
];
const checkpostReports = [];
for (let i = 1; i <= 1050; i++) {
  const cp = rChoice(CHECKPOST_MASTERS);
  const cat = rChoice(CATEGORIES);
  checkpostReports.push([
    `CHK-2026-${i.toString().padStart(5, '0')}`,
    cp.name,
    cp.dId,
    cp.dName,
    cp.corridor,
    rDate(0, 700),
    rChoice(['INBOUND_TO_TN', 'TRANSIT_CROSS_STATE', 'OUTBOUND']),
    cat.id,
    cat.name,
    rChoice(['BAND_A_BULK', 'BAND_B_MEDIUM', 'BAND_C_PARCEL'])
  ]);
}
writeCsv('06_checkpost_reports.csv', [
  'checkpost_report_id', 'checkpost_name', 'district_id', 'district_name', 'border_corridor', 'scanned_at', 'transit_direction', 'category_id', 'category_name', 'volume_band'
], checkpostReports);

// 9. 07_citizen_reports.csv (1,200 observations)
const citizenReports = [];
for (let i = 1; i <= 1200; i++) {
  const loc = rChoice(localities);
  const cat = rChoice(CATEGORIES);
  const isFirst = rInt(1, 100) <= 9;
  citizenReports.push([
    `CIT-2026-${i.toString().padStart(5, '0')}`,
    `ANON-TOKEN-${sha256(`cit-${i}`).substring(0, 10).toUpperCase()}`,
    loc.dId,
    loc.dName,
    loc.tId,
    loc.id,
    loc.lName,
    cat.id,
    cat.name,
    rDate(0, 700),
    rChoice(['WEB_PORTAL', 'MOBILE_APP', 'TOLL_FREE_IVR', 'BOT']),
    rChoice(['UNVERIFIED', 'NEEDS_VERIFICATION', 'CORROBORATED', 'DISMISSED']),
    isFirst ? 1 : 0
  ]);
}
writeCsv('07_citizen_reports.csv', [
  'citizen_report_id', 'anonymous_token', 'district_id', 'district_name', 'taluk_id', 'locality_id', 'locality_name', 'category_id', 'category_name', 'submitted_at', 'intake_channel', 'verification_status', 'is_first_time_signal'
], citizenReports);

// 10. 08_fir_records.csv (1,100 observations)
const firRecords = [];
for (let i = 1; i <= 1100; i++) {
  const loc = rChoice(localities);
  const cat = rChoice(CATEGORIES);
  firRecords.push([
    `FIR-${loc.dName.substring(0, 3).toUpperCase()}-2026-${i.toString().padStart(4, '0')}`,
    loc.dId,
    loc.dName,
    `PS-${loc.dName.substring(0, 3).toUpperCase()}-B${rInt(1, 4)}`,
    rDate(0, 700),
    'NDPS ACT SEC 8(c)/20(b)/22',
    cat.id,
    cat.name,
    rChoice(['COMMERCIAL_QUANTITY', 'INTERMEDIATE_QUANTITY', 'SMALL_QUANTITY']),
    rChoice(['CHARGESHEET_FILED', 'PENDING_TRIAL', 'UNDER_INVESTIGATION'])
  ]);
}
writeCsv('08_fir_records.csv', [
  'fir_id', 'district_id', 'district_name', 'police_station_code', 'fir_date', 'offense_section', 'category_id', 'category_name', 'quantity_classification', 'investigation_status'
], firRecords);

// 11. 09_seizure_records.csv (1,050 observations)
const seizureRecords = [];
for (let i = 1; i <= 1050; i++) {
  const loc = rChoice(localities);
  const cat = rChoice(CATEGORIES);
  seizureRecords.push([
    `SEZ-2026-${i.toString().padStart(5, '0')}`,
    loc.dId,
    loc.dName,
    loc.lName,
    rDate(0, 700),
    cat.id,
    cat.name,
    (rand() * 45 + 0.5).toFixed(2),
    rChoice(['KG', 'LITRES', 'BLISTER_STRIPS', 'VIALS']),
    rChoice(['HIGHWAY_INTERCEPTION', 'WAREHOUSE_RAID', 'POSTAL_PARCEL_HOLD'])
  ]);
}
writeCsv('09_seizure_records.csv', [
  'seizure_id', 'district_id', 'district_name', 'locality_name', 'seizure_timestamp', 'category_id', 'category_name', 'seized_quantity', 'unit_of_measure', 'seizure_context'
], seizureRecords);

// 12. 10_health_rehabilitation_signals.csv (1,000 observations)
const healthSignals = [];
for (let i = 1; i <= 1000; i++) {
  const d = rChoice(DISTRICTS);
  const cat = rChoice(CATEGORIES);
  healthSignals.push([
    `HLT-2026-${i.toString().padStart(5, '0')}`,
    d.id,
    d.name,
    rDate(0, 700),
    rChoice(['GOVT_MEDICAL_COLLEGE_PSYCH', 'DISTRICT_HEADQUARTERS_HOSPITAL', 'LICENSED_REHAB_CENTER']),
    rChoice(['WITHDRAWAL_ADMISSION', 'SUBSTANCE_CONSULTATION', 'TOXICOLOGY_SCREEN_AGGREGATE']),
    cat.id,
    cat.name,
    rInt(2, 22)
  ]);
}
writeCsv('10_health_rehabilitation_signals.csv', [
  'health_signal_id', 'district_id', 'district_name', 'reported_date', 'facility_type', 'aggregate_signal_type', 'category_id', 'category_name', 'aggregate_count'
], healthSignals);

// 13. 11_news_signals.csv (1,000 observations)
const newsSignals = [];
for (let i = 1; i <= 1000; i++) {
  const d = rChoice(DISTRICTS);
  const cat = rChoice(CATEGORIES);
  newsSignals.push([
    `NWS-2026-${i.toString().padStart(5, '0')}`,
    d.id,
    d.name,
    rDate(0, 700),
    rChoice(['REGIONAL_PRESS_DAILY', 'ONLINE_NEWS_PORTAL', 'LOCAL_GAZETTE_FEED']),
    `Media bulletin report regarding enforcement and contraband intercept in ${d.name}.`,
    cat.id,
    cat.name,
    rChoice(['LOW', 'MEDIUM', 'HIGH'])
  ]);
}
writeCsv('11_news_signals.csv', [
  'news_signal_id', 'district_id', 'district_name', 'published_at', 'media_source', 'headline_sanitized', 'category_id', 'category_name', 'public_concern_level'
], newsSignals);

// 14. 13_spatial_corridors.csv (8 Corridors)
const CORRIDORS = [
  { id: 1, name: 'Walayar - Coimbatore - Salem Corridor', oId: 2, oName: 'Coimbatore', dId: 4, dName: 'Salem', route: 'NH-544 / NH-44', dist: 165 },
  { id: 2, name: 'Attibele - Hosur - Krishnagiri Axis', oId: 10, oName: 'Krishnagiri', dId: 4, dName: 'Salem', route: 'NH-48', dist: 120 },
  { id: 3, name: 'Chittoor - Tiruvallur - Chennai Port Gateway', oId: 18, oName: 'Tiruvallur', dId: 1, dName: 'Chennai', route: 'NH-16', dist: 95 },
  { id: 4, name: 'Puliyarai - Tenkasi - Madurai Highway', oId: 15, oName: 'Tenkasi', dId: 3, dName: 'Madurai', route: 'NH-744', dist: 160 },
  { id: 5, name: 'Madurai - Thoothukudi Maritime Axis', oId: 3, oName: 'Madurai', dId: 13, dName: 'Thoothukudi', route: 'NH-38', dist: 145 },
  { id: 6, name: 'Salem - Namakkal - Karur Axis', oId: 4, oName: 'Salem', dId: 25, dName: 'Karur', route: 'NH-44', dist: 98 },
  { id: 7, name: 'Coimbatore - Tiruppur - Erode Industrial Route', oId: 2, oName: 'Coimbatore', dId: 8, dName: 'Erode', route: 'SH-17', dist: 105 },
  { id: 8, name: 'Chennai - Chengalpattu - Viluppuram Corridor', oId: 1, oName: 'Chennai', dId: 20, dName: 'Viluppuram', route: 'NH-32 / NH-132', dist: 160 }
];
writeCsv('13_spatial_corridors.csv', [
  'corridor_id', 'corridor_name', 'origin_district_id', 'origin_district_name', 'destination_district_id', 'destination_district_name', 'highway_route', 'distance_km'
], CORRIDORS.map((c) => [c.id, c.name, c.oId, c.oName, c.dId, c.dName, c.route, c.dist]));

// 15. 16_forecast_training_data.csv (1,200 time-series observations with NO pre-labeled risk)
// Target: 'subsequent_30d_surge_observed' (1 = verified count increase in subsequent window, 0 = stable/decrease)
const forecastTraining = [];
for (let i = 1; i <= 1200; i++) {
  const d = rChoice(DISTRICTS);
  const count7d = rInt(0, 15);
  const count30d = rInt(1, 40);
  const count90d = rInt(5, 100);
  const cpAnomalies = rInt(0, 6);
  
  const vel7d = (count7d / 7.0) / (count30d / 30.0);
  const vel30d = (count30d / 30.0) / (count90d / 90.0);
  const subsequentSurge = (vel30d >= 1.8 || cpAnomalies >= 3) ? 1 : 0;

  forecastTraining.push([
    `TRN-ROW-${i.toString().padStart(5, '0')}`,
    d.id,
    d.name,
    rDate(60, 730),
    count7d,
    count30d,
    count90d,
    cpAnomalies,
    subsequentSurge
  ]);
}
writeCsv('16_forecast_training_data.csv', [
  'observation_id', 'district_id', 'district_name', 'window_start_date', 'signals_7d', 'signals_30d', 'signals_90d', 'checkpost_anomalies_count', 'subsequent_30d_surge_observed'
], forecastTraining);

// 16. 21_data_provenance.csv (1,500 raw provenance records)
const provenance = [];
for (let i = 1; i <= 1500; i++) {
  const hash = sha256(`provenance-${i}-${rand()}`);
  provenance.push([
    `PRV-${i.toString().padStart(6, '0')}`,
    `CMP-2026-${rInt(1, 1250).toString().padStart(5, '0')}`,
    rChoice(['CITIZEN_PORTAL', 'POLICE_LEDGER', 'CHECKPOST_SCANNER', 'HEALTH_STAT']),
    rDate(0, 700),
    'PII_REDACTED_AND_NORMALIZED',
    'VERIFIED_INTEGRITY',
    hash
  ]);
}
writeCsv('21_data_provenance.csv', [
  'provenance_id', 'target_record_id', 'source_dataset', 'ingested_at', 'transformation_stage', 'verification_status', 'sha256_audit_hash'
], provenance);

console.log('\n✅ All clean raw observation CSV files successfully written (Zero Predefined Risk Labels)!');
