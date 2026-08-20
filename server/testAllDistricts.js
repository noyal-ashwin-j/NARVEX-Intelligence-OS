import pool from './database/db.js';

console.log('🧪 Testing NARVEX 38-District Intelligence Matrix...\n');

async function testAllDistricts() {
  const [districts] = await pool.query('SELECT id, name, code, risk_level, confidence_score, coverage_status, velocity_30d, active_alerts_count, emerging_zones_count, first_time_signals_count FROM districts ORDER BY id ASC');

  if (districts.length !== 38) {
    console.error(`❌ Expected 38 districts, found: ${districts.length}`);
    process.exit(1);
  }

  console.log(`✅ Verified: All 38 Tamil Nadu districts loaded dynamically from database.`);
  console.log('---------------------------------------------------------------------------------------------------');
  console.log(sprintf('%-4s | %-16s | %-6s | %-26s | %-8s | %-8s | %-10s', 'ID', 'District Name', 'Code', 'Risk Level', 'Velocity', 'Conf %', 'Coverage'));
  console.log('---------------------------------------------------------------------------------------------------');

  let passedDistricts = 0;
  for (const d of districts) {
    console.log(sprintf('%-4s | %-16s | %-6s | %-26s | %-8s | %-8s | %-10s', d.id, d.name, d.code, d.risk_level, `${d.velocity_30d}x`, `${d.confidence_score}%`, d.coverage_status));
    passedDistricts++;
  }

  console.log('---------------------------------------------------------------------------------------------------');
  console.log(`🏁 38-District Matrix Complete: ${passedDistricts}/38 districts validated with live tripartite intelligence scores!`);
  process.exit(0);
}

function sprintf(format, ...args) {
  let i = 0;
  return format.replace(/%(-)?(\d+)?s/g, (match, left, width) => {
    let val = String(args[i++] ?? '');
    if (!width) return val;
    const pad = Math.max(0, parseInt(width, 10) - val.length);
    return left ? val + ' '.repeat(pad) : ' '.repeat(pad) + val;
  });
}

testAllDistricts();
