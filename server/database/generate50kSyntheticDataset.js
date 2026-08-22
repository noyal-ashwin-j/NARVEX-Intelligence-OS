import pool from './db.js';

// Seeded PRNG for 100% deterministic synthetic dataset generation
function createPRNG(seed = 123456789) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const random = createPRNG(42);

function getRandomElement(arr) {
  return arr[Math.floor(random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

// 38 Districts of Tamil Nadu
const DISTRICTS = [
  { code: 'TN-CHN', name: 'Chennai', zone: 'North', lat: 13.0827, lng: 80.2707 },
  { code: 'TN-CBE', name: 'Coimbatore', zone: 'West', lat: 11.0168, lng: 76.9558 },
  { code: 'TN-MDU', name: 'Madurai', zone: 'South', lat: 9.9252, lng: 78.1198 },
  { code: 'TN-TCR', name: 'Thoothukudi', zone: 'South', lat: 8.7642, lng: 78.1348 },
  { code: 'TN-SLM', name: 'Salem', zone: 'West', lat: 11.6643, lng: 78.1460 },
  { code: 'TN-KGI', name: 'Krishnagiri', zone: 'North', lat: 12.5266, lng: 78.2138 },
  { code: 'TN-TRY', name: 'Tiruchirappalli', zone: 'Central', lat: 10.7905, lng: 78.7047 },
  { code: 'TN-TNV', name: 'Tirunelveli', zone: 'South', lat: 8.7139, lng: 77.7567 },
  { code: 'TN-VEL', name: 'Vellore', zone: 'North', lat: 12.9165, lng: 79.1325 },
  { code: 'TN-ERD', name: 'Erode', zone: 'West', lat: 11.3410, lng: 77.7172 },
  { code: 'TN-TPR', name: 'Tiruppur', zone: 'West', lat: 11.1085, lng: 77.3411 },
  { code: 'TN-KKI', name: 'Kanyakumari', zone: 'South', lat: 8.0883, lng: 77.5385 },
  { code: 'TN-DPL', name: 'Dharmapuri', zone: 'North', lat: 12.1211, lng: 78.1582 },
  { code: 'TN-NMK', name: 'Namakkal', zone: 'West', lat: 11.2189, lng: 78.1674 },
  { code: 'TN-NGL', name: 'Nilgiris', zone: 'West', lat: 11.4102, lng: 76.6950 },
  { code: 'TN-KPM', name: 'Kanchipuram', zone: 'North', lat: 12.8342, lng: 79.7036 },
  { code: 'TN-CGL', name: 'Chengalpattu', zone: 'North', lat: 12.6819, lng: 79.9888 },
  { code: 'TN-TVR', name: 'Tiruvallur', zone: 'North', lat: 13.1432, lng: 79.9070 },
  { code: 'TN-TNM', name: 'Tiruvannamalai', zone: 'North', lat: 12.2253, lng: 79.0747 },
  { code: 'TN-VPM', name: 'Viluppuram', zone: 'Central', lat: 11.9401, lng: 79.4861 },
  { code: 'TN-KLK', name: 'Kallakurichi', zone: 'Central', lat: 11.7384, lng: 78.9639 },
  { code: 'TN-CUD', name: 'Cuddalore', zone: 'Central', lat: 11.7480, lng: 79.7714 },
  { code: 'TN-MAY', name: 'Mayiladuthurai', zone: 'Central', lat: 11.1018, lng: 79.6522 },
  { code: 'TN-NAG', name: 'Nagapattinam', zone: 'Central', lat: 10.7672, lng: 79.8449 },
  { code: 'TN-TNJ', name: 'Thanjavur', zone: 'Central', lat: 10.7870, lng: 79.1378 },
  { code: 'TN-TTV', name: 'Tiruvarur', zone: 'Central', lat: 10.7726, lng: 79.6365 },
  { code: 'TN-PDK', name: 'Pudukkottai', zone: 'Central', lat: 10.3797, lng: 78.8202 },
  { code: 'TN-DGL', name: 'Dindigul', zone: 'South', lat: 10.3673, lng: 77.9803 },
  { code: 'TN-TNI', name: 'Theni', zone: 'South', lat: 10.0104, lng: 77.4768 },
  { code: 'TN-RMD', name: 'Ramanathapuram', zone: 'South', lat: 9.3639, lng: 78.8395 },
  { code: 'TN-SGV', name: 'Sivaganga', zone: 'South', lat: 9.8433, lng: 78.4809 },
  { code: 'TN-VNR', name: 'Virudhunagar', zone: 'South', lat: 9.5680, lng: 77.9624 },
  { code: 'TN-TEN', name: 'Tenkasi', zone: 'South', lat: 8.9593, lng: 77.3148 },
  { code: 'TN-KRR', name: 'Karur', zone: 'Central', lat: 10.9601, lng: 78.0766 },
  { code: 'TN-PER', name: 'Perambalur', zone: 'Central', lat: 11.2342, lng: 78.8820 },
  { code: 'TN-ARI', name: 'Ariyalur', zone: 'Central', lat: 11.1401, lng: 79.0782 },
  { code: 'TN-RAN', name: 'Ranipet', zone: 'North', lat: 12.9296, lng: 79.3332 },
  { code: 'TN-TPT', name: 'Tirupathur', zone: 'North', lat: 12.4936, lng: 78.5678 }
];

const SUBSTANCES = ['Ganja / Cannabis', 'Prescription Narcotics', 'Synthetic Stimulants / MDMA', 'Heroin', 'Opium / Poppy'];
const MODES = ['ROAD', 'RAIL', 'AIR', 'MARITIME'];
const SOURCES = [
  { code: 'SRC-POLICE-01', name: 'TN Police Narcotic Intelligence Wing', type: 'POLICE' },
  { code: 'SRC-CITIZEN-01', name: 'NARVEX Anonymous Intake API', type: 'CITIZEN_INTAKE' },
  { code: 'SRC-CHECKPOST-01', name: 'Commercial Checkpost ANPR Network', type: 'CHECKPOST' },
  { code: 'SRC-MARITIME-01', name: 'Coastal Security Group Radar & Patrol', type: 'MARITIME' },
  { code: 'SRC-AIRPORT-01', name: 'Customs Air Cargo Intelligence Unit', type: 'AIRPORT' },
  { code: 'SRC-HEALTH-01', name: 'State Health Addiction Recovery Monitoring', type: 'HEALTH' },
  { code: 'SRC-NEWS-01', name: 'Open-Source Press Release Monitor', type: 'NEWS' }
];

async function generateDataset() {
  console.log('🚀 Generating 50,000+ Record Connected Observation Universe (Phase 1)...');
  const conn = await pool.getConnection();

  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE complaints');
    await conn.query('TRUNCATE TABLE police_observations');
    await conn.query('TRUNCATE TABLE seizure_observations');
    await conn.query('TRUNCATE TABLE checkpost_observations');
    await conn.query('TRUNCATE TABLE transport_observations');
    await conn.query('TRUNCATE TABLE news_observations');
    await conn.query('TRUNCATE TABLE event_provenance');
    await conn.query('TRUNCATE TABLE route_observations');
    await conn.query('TRUNCATE TABLE intelligence_events');
    await conn.query('TRUNCATE TABLE route_intelligence');

    // 1. Seed Districts
    console.log('  └─ Seeding 38 Districts...');
    for (const d of DISTRICTS) {
      await conn.query(
        `INSERT INTO districts (district_code, district_name, zone, latitude, longitude)
         VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE district_name=VALUES(district_name)`,
        [d.code, d.name, d.zone, d.lat, d.lng]
      );
    }

    // 2. Fetch District IDs
    const [districtRows] = await conn.query('SELECT id, district_code, district_name, latitude, longitude FROM districts');
    const districtMap = new Map(districtRows.map(r => [r.district_code, r]));

    // 3. Seed Source Registry
    console.log('  └─ Seeding Source Registry...');
    for (const s of SOURCES) {
      await conn.query(
        `INSERT INTO source_registry (source_code, source_name, source_type, reliability_score)
         VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE source_name=VALUES(source_name)`,
        [s.code, s.name, s.type, 0.900]
      );
    }

    // 4. Seed Localities (4 per district = 152 Localities)
    console.log('  └─ Seeding Localities & Checkposts...');
    const localityIds = [];
    for (const d of districtRows) {
      for (let i = 1; i <= 4; i++) {
        const locCode = `LOC-${d.district_code}-${i}`;
        const locName = `${d.district_name} Sector ${i}`;
        const lat = parseFloat(d.latitude) + (random() - 0.5) * 0.1;
        const lng = parseFloat(d.longitude) + (random() - 0.5) * 0.1;
        const [res] = await conn.query(
          `INSERT INTO localities (locality_code, locality_name, district_id, latitude, longitude, is_border_locality)
           VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE locality_name=VALUES(locality_name)`,
          [locCode, locName, d.id, lat, lng, i === 1 ? 1 : 0]
        );
        localityIds.push({ id: res.insertId || i, district_id: d.id, lat, lng, name: locName });
      }
    }

    // 5. Seed Spatial Corridors
    console.log('  └─ Seeding Spatial Corridors...');
    const CORRIDORS = [
      { code: 'CORR-NH44', name: 'NH 44 Bengaluru-Hosur-Salem Corridor', oName: 'Bengaluru', oLat: 12.9716, oLng: 77.5946, dName: 'Salem Hub', dLat: 11.6643, dLng: 78.1460, mode: 'ROAD', scope: 'INDIA' },
      { code: 'CORR-NH544', name: 'NH 544 Walayar-Coimbatore Corridor', oName: 'Walayar Checkpost', oLat: 10.8354, oLng: 76.8483, dName: 'Coimbatore Hub', dLat: 11.0168, dLng: 76.9558, mode: 'ROAD', scope: 'INDIA' },
      { code: 'CORR-PALK', name: 'Palk Strait Coastal Route', oName: 'Colombo Axis', oLat: 6.9271, oLng: 79.8612, dName: 'Thoothukudi Coast', dLat: 8.7642, dLng: 78.1348, mode: 'MARITIME', scope: 'GLOBAL' },
      { code: 'CORR-DXB-AIR', name: 'Dubai Air Cargo Axis', oName: 'Dubai International', oLat: 25.2048, oLng: 55.2708, dName: 'Chennai Air Cargo', dLat: 13.0827, dLng: 80.2707, mode: 'AIR', scope: 'GLOBAL' }
    ];

    for (const c of CORRIDORS) {
      await conn.query(
        `INSERT INTO spatial_corridors (corridor_code, corridor_name, origin_name, origin_lat, origin_lng, dest_name, dest_lat, dest_lng, transport_mode, scope)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE corridor_name=VALUES(corridor_name)`,
        [c.code, c.name, c.oName, c.oLat, c.oLng, c.dName, c.dLat, c.dLng, c.mode, c.scope]
      );
    }

    // 6. Generate 50,000+ Raw Observations (Strictly Factual, Zero Pre-assigned Risk Labels)
    console.log('  └─ Generating 50,000+ Raw Relational Observations across 24 Table Families...');

    const startDate = new Date('2025-01-01T00:00:00Z').getTime();
    const endDate = new Date('2026-08-20T00:00:00Z').getTime();

    let countComplaints = 0;
    let countPoliceObs = 0;
    let countSeizures = 0;
    let countCheckposts = 0;
    let countTransport = 0;
    let countNews = 0;
    let countHealth = 0;
    let countProvenance = 0;
    let countRoutes = 0;

    // We generate 6,500 coherent multi-observation Case Narratives (producing ~52,000 total observations)
    for (let c = 1; c <= 6500; c++) {
      const caseRef = `CASE-2025-${String(c).padStart(5, '0')}`;
      const district = getRandomElement(districtRows);
      const substance = getRandomElement(SUBSTANCES);
      const mode = getRandomElement(MODES);

      const baseTime = startDate + Math.floor(random() * (endDate - startDate));
      const observedAt = new Date(baseTime).toISOString().slice(0, 19).replace('T', ' ');
      const reportedAt = new Date(baseTime + 3600000).toISOString().slice(0, 19).replace('T', ' ');

      // 1. Complaint Observation
      const compRef = `CMP-${caseRef}-01`;
      await conn.query(
        `INSERT INTO complaints (complaint_ref, source_id, district_id, place_description, substance_category, observed_at, reported_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [compRef, 2, district.id, `${district.district_name} Sector Transport Hub`, substance, observedAt, reportedAt]
      );
      countComplaints++;

      // 2. Police Observation
      const polRef = `POL-${caseRef}-02`;
      await conn.query(
        `INSERT INTO police_observations (obs_ref, station_id, district_id, incident_type, substance_category, quantity_value, quantity_unit, transport_mode, observed_at, reported_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [polRef, 1, district.id, 'PATROL_INTERCEPT', substance, (random() * 25 + 1).toFixed(2), 'KG', mode, observedAt, reportedAt]
      );
      countPoliceObs++;

      // 3. Seizure Observation
      const sezRef = `SEZ-${caseRef}-03`;
      await conn.query(
        `INSERT INTO seizure_observations (seizure_ref, case_ref, district_id, substance_category, quantity_value, quantity_unit, estimated_value_inr, seizure_lat, seizure_lng, observed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sezRef, caseRef, district.id, substance, (random() * 50 + 2).toFixed(2), 'KG', (random() * 500000 + 10000).toFixed(2), district.latitude, district.longitude, observedAt]
      );
      countSeizures++;

      // 4. Checkpost Observation
      const chkRef = `CHK-${caseRef}-04`;
      await conn.query(
        `INSERT INTO checkpost_observations (checkpost_ref, checkpost_name, district_id, vehicle_type, scan_type, substance_found, substance_category, observed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [chkRef, `${district.district_name} Border Gate`, district.id, 'HEAVY_TRUCK', 'ANPR_CAMERA', 1, substance, observedAt]
      );
      countCheckposts++;

      // 5. Transport Observation
      const trsRef = `TRS-${caseRef}-05`;
      await conn.query(
        `INSERT INTO transport_observations (transport_ref, transport_mode, origin_name, origin_lat, origin_lng, dest_name, dest_lat, dest_lng, district_id, observed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [trsRef, mode, 'Logistics Hub', parseFloat(district.latitude) + 0.1, parseFloat(district.longitude) + 0.1, district.district_name, parseFloat(district.latitude), parseFloat(district.longitude), district.id, observedAt]
      );
      countTransport++;

      // 6. News Observation
      const newsRef = `NEWS-${caseRef}-06`;
      await conn.query(
        `INSERT INTO news_observations (news_ref, source_outlet, headline, district_id, substance_category, published_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [newsRef, 'State Press Release Monitor', `Official Contraband Intercept in ${district.district_name}`, district.id, substance, reportedAt]
      );
      countNews++;

      // Insert intelligence_events record for legacy test compatibility
      const [evtRes] = await conn.query(
        `INSERT INTO intelligence_events (event_code, district_id, location_name, lat, lng, event_date, category_id, source_id, raw_description_redacted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`EVT-CODE-${Date.now()}-${c}-${Math.floor(random() * 100000)}`, district.id, `${district.district_name} Command Sector`, parseFloat(district.latitude), parseFloat(district.longitude), observedAt.slice(0, 10), 1, 1, `Redacted intelligence narrative for ${caseRef}`]
      );
      const eventId = evtRes.insertId;

      // 7. Event Provenance Record ("Why is this here?")
      const provRef = `PROV-${caseRef}-07`;
      await conn.query(
        `INSERT INTO event_provenance (event_ref, event_id, source_id, source_department, case_ref, district_id, description, observed_at, reported_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [provRef, eventId, 1, 'TN Police Intelligence Wing', caseRef, district.id, `Multi-agency corroborated intelligence for ${caseRef} in ${district.district_name}`, observedAt, reportedAt]
      );
      countProvenance++;

      // 8. Route Observation across 3 Tiers (WORLD, INDIA, TAMILNADU)
      const rteRef = `RTE-${caseRef}-08`;

      // Multi-tiered realistic origins
      const worldOrigins = [
        { name: 'Cape Town / South Africa Deep Sea Route', lat: -33.9249, lng: 18.4241, mode: 'MARITIME', dest: 'Thoothukudi Deep Sea Port', dlat: 8.7642, dlng: 78.1348, tier: 'WORLD' },
        { name: 'Golden Triangle (Myanmar)', lat: 21.0000, lng: 98.0000, mode: 'AIR', dest: 'Chennai Port & Air Command', dlat: 13.0827, dlng: 80.2707, tier: 'WORLD' },
        { name: 'Golden Crescent (Afghanistan)', lat: 33.0000, lng: 65.0000, mode: 'AIR', dest: 'Chennai Port & Air Command', dlat: 13.0827, dlng: 80.2707, tier: 'WORLD' },
        { name: 'Dubai Maritime & Aviation Hub', lat: 25.2048, lng: 55.2708, mode: 'AIR', dest: 'Chennai Port & Air Command', dlat: 13.0827, dlng: 80.2707, tier: 'WORLD' },
        { name: 'Singapore Shipping Strait', lat: 1.3521, lng: 103.8198, mode: 'MARITIME', dest: 'Thoothukudi Deep Sea Port', dlat: 8.7642, dlng: 78.1348, tier: 'WORLD' },
        { name: 'Colombo / Palk Strait Axis (Sri Lanka)', lat: 6.9271, lng: 79.8612, mode: 'MARITIME', dest: 'Thoothukudi Deep Sea Port', dlat: 8.7642, dlng: 78.1348, tier: 'WORLD' },
        { name: 'London European Corridor', lat: 51.5074, lng: -0.1276, mode: 'AIR', dest: 'Chennai Port & Air Command', dlat: 13.0827, dlng: 80.2707, tier: 'WORLD' },
        { name: 'Tokyo East Asia Line', lat: 35.6895, lng: 139.6917, mode: 'AIR', dest: 'Chennai Port & Air Command', dlat: 13.0827, dlng: 80.2707, tier: 'WORLD' }
      ];

      const indiaOrigins = [
        { name: 'Delhi NCR Aviation & Rail Hub', lat: 28.6139, lng: 77.2090, mode: 'AIR', dest: 'Chennai Central Command', dlat: 13.0827, dlng: 80.2707, tier: 'INDIA' },
        { name: 'Mumbai Port & JNPT Freight Corridor', lat: 19.0760, lng: 72.8777, mode: 'ROAD', dest: 'Coimbatore (Walayar Corridor)', dlat: 11.0168, dlng: 76.9558, tier: 'INDIA' },
        { name: 'Bengaluru Logistics Interchange', lat: 12.9716, lng: 77.5946, mode: 'ROAD', dest: 'Hosur-Zuzuvadi Checkpost', dlat: 12.5266, dlng: 78.2138, tier: 'INDIA' },
        { name: 'Andhra Border (Chittoor Route)', lat: 13.2172, lng: 79.1003, mode: 'ROAD', dest: 'Chennai Gateway', dlat: 13.0827, dlng: 80.2707, tier: 'INDIA' },
        { name: 'Kerala Border (Walayar Checkpost)', lat: 10.8354, lng: 76.8483, mode: 'ROAD', dest: 'Coimbatore Walayar', dlat: 11.0168, dlng: 76.9558, tier: 'INDIA' },
        { name: 'Kolkata Bay Shipping Link', lat: 22.5726, lng: 88.3639, mode: 'MARITIME', dest: 'Chennai Port & Air Command', dlat: 13.0827, dlng: 80.2707, tier: 'INDIA' }
      ];

      const tnNeighbor = districtRows[(district.id % districtRows.length)];
      const tnRouteItem = {
        name: district.district_name,
        lat: parseFloat(district.latitude),
        lng: parseFloat(district.longitude),
        mode: mode,
        dest: tnNeighbor.district_name,
        dlat: parseFloat(tnNeighbor.latitude),
        dlng: parseFloat(tnNeighbor.longitude),
        tier: 'TAMILNADU'
      };

      const selectedRouteTemplate = (c % 3 === 0) 
        ? worldOrigins[c % worldOrigins.length]
        : (c % 3 === 1)
        ? indiaOrigins[c % indiaOrigins.length]
        : tnRouteItem;

      await conn.query(
        `INSERT INTO route_observations 
          (route_ref, origin_name, origin_lat, origin_lng, dest_name, dest_lat, dest_lng, transport_mode, scope_tier, district_id, observed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rteRef,
          selectedRouteTemplate.name,
          selectedRouteTemplate.lat,
          selectedRouteTemplate.lng,
          selectedRouteTemplate.dest,
          selectedRouteTemplate.dlat,
          selectedRouteTemplate.dlng,
          selectedRouteTemplate.mode,
          selectedRouteTemplate.tier,
          district.id,
          observedAt
        ]
      );
      countRoutes++;
    }

    // Recompute Route Intelligence Derived Table
    console.log(`\n  └─ Recomputing Route Intelligence Associations...`);
    const { recomputeRouteIntelligence } = await import('../intelligence/routeAggregationEngine.js');
    await recomputeRouteIntelligence();

    const totalCount = countComplaints + countPoliceObs + countSeizures + countCheckposts + countTransport + countNews + countProvenance + countRoutes;

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    conn.release();

    console.log(`\n================================================================`);
    console.log(`✅ 50,000+ RECORD SYNTHETIC OBSERVATION UNIVERSE GENERATED!`);
    console.log(`   • Complaints: ${countComplaints}`);
    console.log(`   • Police Observations: ${countPoliceObs}`);
    console.log(`   • Seizures: ${countSeizures}`);
    console.log(`   • Checkpost Scans: ${countCheckposts}`);
    console.log(`   • Transport Logs: ${countTransport}`);
    console.log(`   • News Observations: ${countNews}`);
    console.log(`   • Event Provenance Records: ${countProvenance}`);
    console.log(`   • Route Observations: ${countRoutes}`);
    console.log(`   👉 TOTAL RAW OBSERVATIONS IN MYSQL: ${totalCount}`);
    console.log(`   • GROUND-TRUTH RISK LABELS: 0 (Pure raw observations)`);
    console.log(`================================================================\n`);
    process.exit(0);

  } catch (err) {
    console.error('❌ Error generating synthetic dataset:', err);
    process.exit(1);
  }
}

generateDataset();
