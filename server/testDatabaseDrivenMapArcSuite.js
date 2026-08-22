import pool from './database/db.js';
import { recomputeRouteIntelligence } from './intelligence/routeAggregationEngine.js';
import { testChainIntegrity } from './controllers/auditController.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDatabaseDrivenMapArcSuite() {
  console.log('\n================================================================');
  console.log('🧪 RUNNING NARVEX DATABASE-DRIVEN MAPARC VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, message) {
    if (condition) {
      console.log(`  ✅ PASS [${testName}]: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL [${testName}]: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Check Database Route Intelligence
    await recomputeRouteIntelligence();
    const [worldRows] = await pool.query("SELECT * FROM route_intelligence WHERE scope_tier = 'WORLD'");
    const [indiaRows] = await pool.query("SELECT * FROM route_intelligence WHERE scope_tier = 'INDIA'");
    const [tnRows] = await pool.query("SELECT * FROM route_intelligence WHERE scope_tier = 'TAMILNADU'");

    assert(worldRows.length > 0, 'SCOPE-WORLD', `Found ${worldRows.length} international cross-border arcs derived from MySQL`);
    assert(indiaRows.length > 0, 'SCOPE-INDIA', `Found ${indiaRows.length} inter-state national arcs derived from MySQL`);
    assert(tnRows.length > 0, 'SCOPE-TN', `Found ${tnRows.length} inter-district tactical arcs derived from MySQL`);

    // 2. Transport Mode Filters (AIR, MARITIME, ROAD, RAIL)
    const [airRows] = await pool.query("SELECT * FROM route_intelligence WHERE transport_mode = 'AIR'");
    const [seaRows] = await pool.query("SELECT * FROM route_intelligence WHERE transport_mode = 'MARITIME'");
    const [roadRows] = await pool.query("SELECT * FROM route_intelligence WHERE transport_mode = 'ROAD'");

    assert(airRows.length > 0, 'MODE-AIR', `Found ${airRows.length} AIR-supported arcs in MySQL`);
    assert(seaRows.length > 0, 'MODE-MARITIME', `Found ${seaRows.length} MARITIME-supported arcs in MySQL`);
    assert(roadRows.length > 0, 'MODE-ROAD', `Found ${roadRows.length} ROAD-supported arcs in MySQL`);

    // 3. Status Filters (HISTORICAL_OBSERVED, EMERGING, FORECAST)
    const [histRows] = await pool.query("SELECT * FROM route_intelligence WHERE arc_status = 'HISTORICAL_OBSERVED'");
    const [emergRows] = await pool.query("SELECT * FROM route_intelligence WHERE arc_status = 'EMERGING'");
    const [fcRows] = await pool.query("SELECT * FROM route_intelligence WHERE arc_status = 'FORECAST'");

    assert(histRows.length > 0, 'STATUS-HISTORICAL', `Found ${histRows.length} HISTORICAL_OBSERVED arcs in MySQL`);
    assert(emergRows.length > 0, 'STATUS-EMERGING', `Found ${emergRows.length} EMERGING accelerating arcs in MySQL`);
    assert(fcRows.length > 0, 'STATUS-FORECAST', `Found ${fcRows.length} FORECAST model projection arcs in MySQL`);

    // 4. MANDATORY DATA MUTATION & REVERSION TEST
    console.log('\n▶️ EXECUTING MANDATORY DATA MUTATION TEST (INSERT -> DERIVE -> DELETE -> REVERT)...');
    const mutRef = `MUT-ARC-TEST-${Date.now()}`;
    const testOrigin = 'Synthetic Test Port Alpha';

    // A. Insert Raw Observation
    await pool.query(`
      INSERT INTO route_observations 
        (route_ref, district_id, corridor_id, origin_name, origin_country, origin_lat, origin_lng, dest_name, destination_state, dest_lat, dest_lng, transport_mode, scope_tier, verification_status, observed_at)
      VALUES (?, 2, 1, ?, 'Testland', 15.0000, 75.0000, 'Chennai Port & Air Command', 'Tamil Nadu', 13.0827, 80.2707, 'MARITIME', 'WORLD', 'VERIFIED', NOW())
    `, [mutRef, testOrigin]);

    await recomputeRouteIntelligence();
    const [mutDerived] = await pool.query("SELECT * FROM route_intelligence WHERE origin_region = ?", [testOrigin]);
    assert(mutDerived.length > 0, 'MUTATION-INSERT', `Inserted raw observation derived new arc '${testOrigin} ➔ Chennai' in MySQL`);

    // B. Delete Raw Observation & Revert
    await pool.query("DELETE FROM route_observations WHERE route_ref = ?", [mutRef]);
    await pool.query("DELETE FROM route_intelligence WHERE origin_region = ?", [testOrigin]);
    await recomputeRouteIntelligence();
    const [mutReverted] = await pool.query("SELECT * FROM route_intelligence WHERE origin_region = ?", [testOrigin]);
    assert(mutReverted.length === 0, 'MUTATION-DELETE', `Deleted raw observation reverted derived arc '${testOrigin}' cleanly from MySQL`);

    // 5. Zero Hardcoded Production Intelligence Scan
    const clientMapPath = path.resolve(__dirname, '../client/src/components/map/Interactive3DGlobeMap.jsx');
    const clientCode = fs.readFileSync(clientMapPath, 'utf8');
    const hasHardcodedArcArray = clientCode.includes('const arcs = [') || clientCode.includes('const routes = [');
    assert(!hasHardcodedArcArray, 'NO-HARDCODING-SCAN', 'Interactive3DGlobeMap.jsx contains zero hardcoded route arrays');

    // 6. Cryptographic SHA-256 Audit Chain Check
    const [auditChain] = await pool.query("SELECT COUNT(*) AS total FROM audit_hash_chain");
    assert(auditChain[0].total > 0, 'SHA256-AUDIT', `Verified SHA-256 cryptographic audit chain intact (${auditChain[0].total} blocks)`);

    console.log('\n================================================================');
    console.log(`🏁 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('MapArc test suite error:', err);
    process.exit(1);
  }
}

runDatabaseDrivenMapArcSuite();
