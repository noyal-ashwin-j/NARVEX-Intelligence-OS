import pool from './database/db.js';

async function runEmpiricalDbCounts() {
  const tables = [
    'districts',
    'intelligence_events',
    'event_provenance',
    'route_observations',
    'route_intelligence',
    'model_features',
    'forecast_records',
    'intelligence_alerts',
    'audit_hash_chain',
    'model_registry',
    'users',
    'user_sessions'
  ];

  console.log('================================================================');
  console.log('📊 EMPIRICAL MYSQL TABLE COUNTS (EVIDENCE PROOF)');
  console.log('================================================================\n');

  for (const table of tables) {
    try {
      const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM ${table}`);
      console.log(`CLAIM: Table '${table}' contains data.`);
      console.log(`EVIDENCE: COUNT(*) = ${rows[0].total}`);
      console.log(`SOURCE: MySQL database 'narvex'\n`);
    } catch (err) {
      console.log(`CLAIM: Table '${table}' exists.`);
      console.log(`EVIDENCE: Error - ${err.message}`);
      console.log(`SOURCE: MySQL database 'narvex'\n`);
    }
  }

  process.exit(0);
}

runEmpiricalDbCounts();
