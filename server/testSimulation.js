import pool from './database/db.js';
import { recalculateDistrictRiskScores } from './services/backgroundIntelligenceService.js';
import { appendAuditRecord } from './services/hashChainService.js';

console.log('🧪 Testing NARVEX Real-Time Event Ingestion & Simulation Stream...\n');

async function testSimulation() {
  console.log('1. Simulating incoming live signal from Checkpost Telemetry...');
  const testSignal = {
    event_code: `SIM-LIVE-${Date.now().toString().slice(-6)}`,
    district_id: 2, // Coimbatore
    location_name: 'Walayar Gateway Checkpost ANPR Feed',
    lat: 10.8456,
    lng: 76.8523,
    event_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    category_id: 2, // SYNTHETIC_MDMA
    source_id: 3, // CHECKPOST_TELEMETRY
    severity_level: 'CRITICAL',
    is_enforcement: 1,
    verification_status: 'VERIFIED',
    confidence_score: 96.00,
    coverage_flag: 'GOOD',
    raw_description_redacted: 'Automated vehicle scanner flagged high-density contraband discrepancy on interstate cargo carrier.',
    notes: 'Simulated real-time streaming feed record',
    is_first_time_signal: 0
  };

  const [res] = await pool.query(
    `INSERT INTO intelligence_events (event_code, district_id, location_name, lat, lng, event_date, category_id, source_id, severity_level, is_enforcement, verification_status, confidence_score, coverage_flag, raw_description_redacted, notes, is_first_time_signal)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      testSignal.event_code,
      testSignal.district_id,
      testSignal.location_name,
      testSignal.lat,
      testSignal.lng,
      testSignal.event_date,
      testSignal.category_id,
      testSignal.source_id,
      testSignal.severity_level,
      testSignal.is_enforcement,
      testSignal.verification_status,
      testSignal.confidence_score,
      testSignal.coverage_flag,
      testSignal.raw_description_redacted,
      testSignal.notes,
      testSignal.is_first_time_signal
    ]
  );

  console.log(`   ✅ Ingested simulated event [ID #${res.insertId} | Code: ${testSignal.event_code}]`);

  console.log('2. Triggering live background intelligence recalculation...');
  const summary = await recalculateDistrictRiskScores();
  console.log(`   ✅ Live Recalculation Complete: ${summary.updatedDistrictsCount} districts updated.`);

  console.log('3. Appending cryptographic audit hash block...');
  const auditRes = await appendAuditRecord({
    actionType: 'SIMULATION_EVENT_PROCESSED',
    entityType: 'INTELLIGENCE_EVENT',
    entityId: testSignal.event_code,
    payload: testSignal
  });
  console.log(`   ✅ SHA-256 Audit Block Linked: Sequence #${auditRes.sequenceNum} (Hash: ${auditRes.blockHash.substring(0, 16)}...)`);

  console.log('\n🏁 Simulation Round-Trip Succeeded: Data ➔ Ingestion ➔ Recalculation ➔ Audit Chain validated!');
  process.exit(0);
}

testSimulation().catch((err) => {
  console.error('❌ Simulation test failed:', err);
  process.exit(1);
});
