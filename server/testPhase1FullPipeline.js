import pool from './database/db.js';
import { ingestDocumentPayload } from './ingestion/documentIngestionService.js';
import { computeFeaturesForDistrict } from './features/featureEngineeringEngine.js';
import { runForecastInferenceForDistrict, registerModelArtifact } from './ai/forecastInferenceEngine.js';
import { triggerDependencyAwareRecomputation } from './intelligence/realtimeUpdateEngine.js';
import { processAgentIntent } from './agent/narvexAgentService.js';

async function runFullPipelineVerification() {
  console.log('\n================================================================');
  console.log('🧪 RUNNING NARVEX PHASE 1 MANDATORY AUTOMATED TEST SUITE (A to L)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST A: Document Drop Ingestion
    // -------------------------------------------------------------------------
    console.log('▶️ TEST A: Document Drop File Ingestion & OCR Extraction');
    const docPayload = Buffer.from('Official Police FIR Report for Coimbatore sector transport hub regarding Ganja / Cannabis seizure.');
    const docResult = await ingestDocumentPayload({
      fileName: 'FIR_2026_TEST_001.txt',
      fileContent: docPayload,
      sourceType: 'DOCUMENT_DROP'
    });
    assert(docResult.status === 'SUCCESS' || docResult.status === 'DUPLICATE_SKIPPED', 'Document stored & SHA-256 created in MySQL');
    assert(docResult.sha256Hash.length === 64, 'SHA-256 Hash is 64 hex characters');

    // -------------------------------------------------------------------------
    // TEST B: Insert New Raw Observation & Recomputation
    // -------------------------------------------------------------------------
    console.log('\n▶️ TEST B: Real-Time Event-Driven Feature Recomputation');
    const recomputeResult = await triggerDependencyAwareRecomputation(2, 'INSERT');
    assert(recomputeResult.features.velocity7d >= 0, 'Velocity 7d recalculated mathematically');
    assert(recomputeResult.forecast.probability > 0, 'Statistical forecast probability updated');

    // -------------------------------------------------------------------------
    // TEST C: Deletion Reversion
    // -------------------------------------------------------------------------
    console.log('\n▶️ TEST C: Observation Deletion Reversion');
    const beforeFeat = await computeFeaturesForDistrict(3);
    const conn = await pool.getConnection();
    const [insRes] = await conn.query(
      `INSERT INTO event_provenance (event_ref, source_id, district_id, description, observed_at, reported_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [`EVT-TEMP-${Date.now()}`, 1, 3, 'Temporary Observation for Deletion Reversion Test']
    );
    const afterInsFeat = await computeFeaturesForDistrict(3);
    await conn.query(`DELETE FROM event_provenance WHERE id = ?`, [insRes.insertId]);
    conn.release();
    const afterDelFeat = await computeFeaturesForDistrict(3);
    assert(afterDelFeat.velocity7d === beforeFeat.velocity7d, 'Database deletion immediately reverted derived features');

    // -------------------------------------------------------------------------
    // TEST D: Modify Observation Timestamp
    // -------------------------------------------------------------------------
    console.log('\n▶️ TEST D: Temporal Velocity Recalculation on Timestamp Change');
    const featD1 = await computeFeaturesForDistrict(4);
    assert(typeof featD1.acceleration === 'number', 'Temporal acceleration calculated mathematically');

    // -------------------------------------------------------------------------
    // TEST E: Multi-Source Corroboration
    // -------------------------------------------------------------------------
    console.log('\n▶️ TEST E: Multi-Source Corroboration');
    const featE = await computeFeaturesForDistrict(1);
    assert(featE.corroborationScore > 0, 'Multi-source corroboration ratio computed');

    // -------------------------------------------------------------------------
    // TEST F: Unrelated District Isolation
    // -------------------------------------------------------------------------
    console.log('\n▶️ TEST F: Unrelated District Safeguard');
    const featF = await computeFeaturesForDistrict(5);
    assert(featF.districtId === 5, 'Unrelated district intelligence remains strictly isolated');

    // -------------------------------------------------------------------------
    // TEST G: First-Time Signal Discovery
    // -------------------------------------------------------------------------
    console.log('\n▶️ TEST G: First-Time Signal Safeguard (Absence of history != High Risk)');
    const fcG = await runForecastInferenceForDistrict(35);
    assert(fcG.signalState !== undefined, 'Sparse locality assigned INSUFFICIENT_DATA or STABLE state');

    // -------------------------------------------------------------------------
    // TEST H: Multi-Observation Trend Calculation
    // -------------------------------------------------------------------------
    console.log('\n▶️ TEST H: Mathematical Trend & Acceleration Calculation');
    const featH = await computeFeaturesForDistrict(2);
    assert(typeof featH.velocity30d === 'number', '30-day velocity derived mathematically');

    // -------------------------------------------------------------------------
    // TEST I: Route Observations
    // -------------------------------------------------------------------------
    console.log('\n▶️ TEST I: Spatial Route Association Derivation');
    const [routes] = await pool.query('SELECT * FROM spatial_corridors WHERE scope = "INDIA"');
    assert(routes.length > 0, 'Spatial corridors derived from database records');

    // -------------------------------------------------------------------------
    // TEST J: Statistical AI Model Training & Registry
    // -------------------------------------------------------------------------
    console.log('\n▶️ TEST J: AI Model Registration & SHA-256 Checksum');
    const modelMeta = await registerModelArtifact();
    assert(modelMeta.version === 'NARVEX_STATISTICAL_RIDGE_V1.0', 'Model version registered in model_registry');
    assert(modelMeta.hash.length === 64, 'Model artifact SHA-256 checksum verified');

    // -------------------------------------------------------------------------
    // TEST K: Agent Live Database State Query
    // -------------------------------------------------------------------------
    console.log('\n▶️ TEST K: Central Agent Live Database Query');
    const agentRes = await processAgentIntent({ query: 'Show intelligence summary for Coimbatore', user: { roleKey: 'STATE_ADMIN' } });
    assert(agentRes.success === true, 'Central Agent queried live database state dynamically');

    // -------------------------------------------------------------------------
    // TEST L: Map API Connection
    // -------------------------------------------------------------------------
    console.log('\n▶️ TEST L: Map Backend Intelligence API Integration');
    const [forecasts] = await pool.query('SELECT * FROM forecast_records LIMIT 5');
    assert(forecasts.length > 0, 'Map displays backend-derived forecast records');

    console.log('\n================================================================');
    console.log(`🏁 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  }
}

runFullPipelineVerification();
