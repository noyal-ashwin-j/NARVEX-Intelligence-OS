import pool from './database/db.js';

async function testBackendQueries() {
  console.log('--- RUNNING COMPREHENSIVE BACKEND DATABASE QUERY AUDIT ---');

  const tests = [
    { name: 'Districts Query', sql: 'SELECT * FROM districts LIMIT 5' },
    { name: 'Taluks Query', sql: 'SELECT * FROM taluks LIMIT 5' },
    { name: 'Intelligence Events Query', sql: 'SELECT * FROM intelligence_events LIMIT 5' },
    { name: 'Forecast Records Query', sql: 'SELECT fc.*, d.name as district_name FROM forecast_records fc JOIN districts d ON fc.district_id = d.id LIMIT 5' },
    { name: 'Cartel Network Nodes', sql: 'SELECT * FROM cartel_network_nodes LIMIT 5' },
    { name: 'Cartel Network Links', sql: 'SELECT * FROM cartel_network_links LIMIT 5' },
    { name: 'ANPR Telemetry Query', sql: 'SELECT * FROM anpr_checkpost_telemetry LIMIT 5' },
    { name: 'Precursor Chemical Leaks Query', sql: 'SELECT * FROM precursor_chemical_leaks LIMIT 5' },
    { name: 'Financial Crypto Signals Query', sql: 'SELECT * FROM financial_crypto_signals LIMIT 5' },
    { name: 'Wastewater Epidemiology Metrics Query', sql: 'SELECT * FROM wastewater_epidemiology_metrics LIMIT 5' },
    { name: 'Audit Hash Chain Query', sql: 'SELECT * FROM audit_hash_chain LIMIT 5' },
    { name: 'Users Seed Query', sql: 'SELECT id, email, role_key FROM users LIMIT 5' }
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      const [rows] = await pool.query(t.sql);
      console.log(`✅ [PASS] ${t.name} — Returned ${rows.length} rows`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${t.name} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n--- SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  process.exit(failed > 0 ? 1 : 0);
}

testBackendQueries();
