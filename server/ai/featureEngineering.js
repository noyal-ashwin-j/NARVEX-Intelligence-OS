import pool from '../database/db.js';

/**
 * NARVEX Feature Engineering Engine
 * 
 * Extracts quantitative behavioral and spatial-temporal features for all 38 districts
 * from the live MySQL database for ML model training and real-time inference.
 */

export async function extractDistrictFeatures(districtId = null) {
  let query = `
    SELECT 
      d.id as district_id,
      d.name as district_name,
      d.code as district_code,
      d.baseline_population,
      d.coverage_status,
      COUNT(e.id) as total_events,
      SUM(CASE WHEN e.event_date >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as count_7d,
      SUM(CASE WHEN e.event_date >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as count_30d,
      SUM(CASE WHEN e.event_date >= DATE_SUB(NOW(), INTERVAL 90 DAY) THEN 1 ELSE 0 END) as count_90d,
      SUM(CASE WHEN e.is_enforcement = 1 THEN 1 ELSE 0 END) as enforcement_events,
      SUM(CASE WHEN e.is_first_time_signal = 1 THEN 1 ELSE 0 END) as first_time_signals,
      SUM(CASE WHEN e.category_id = 2 THEN 1 ELSE 0 END) as synthetic_drug_events,
      SUM(CASE WHEN e.category_id = 1 THEN 1 ELSE 0 END) as ganja_events,
      SUM(CASE WHEN e.category_id = 3 THEN 1 ELSE 0 END) as prescription_events
    FROM districts d
    LEFT JOIN intelligence_events e ON d.id = e.district_id
  `;

  const params = [];
  if (districtId) {
    query += ` WHERE d.id = ? GROUP BY d.id`;
    params.push(districtId);
  } else {
    query += ` GROUP BY d.id ORDER BY d.id ASC`;
  }

  const [rows] = await pool.query(query, params);

  // Fetch corridor connectivity
  const [corridorRows] = await pool.query(`
    SELECT origin_district_id, destination_district_id, COUNT(*) as active_corridors
    FROM spatial_associations
    GROUP BY origin_district_id, destination_district_id
  `);

  const corridorMap = new Map();
  corridorRows.forEach((c) => {
    corridorMap.set(c.origin_district_id, (corridorMap.get(c.origin_district_id) || 0) + c.active_corridors);
    corridorMap.set(c.destination_district_id, (corridorMap.get(c.destination_district_id) || 0) + c.active_corridors);
  });

  return rows.map((r) => {
    const count7d = parseFloat(r.count_7d) || 0;
    const count30d = parseFloat(r.count_30d) || 0;
    const count90d = parseFloat(r.count_90d) || 0;
    const pop = parseFloat(r.baseline_population) || 1000000;
    const total = parseFloat(r.total_events) || 0;
    const enforcement = parseFloat(r.enforcement_events) || 0;
    const firstTime = parseFloat(r.first_time_signals) || 0;

    // Feature 1: Velocity 7D vs 30D baseline (weekly rate vs daily baseline)
    const baselineDailyRate30d = count30d > 0 ? count30d / 30.0 : 0.05;
    const velocity7d = count7d > 0 ? (count7d / 7.0) / baselineDailyRate30d : 0.0;

    // Feature 2: Velocity 30D vs 90D baseline
    const baselineDailyRate90d = count90d > 0 ? count90d / 90.0 : 0.05;
    const velocity30d = count30d > 0 ? (count30d / 30.0) / baselineDailyRate90d : 0.0;

    // Feature 3: Acceleration (Velocity 7D / Velocity 30D)
    const acceleration = velocity30d > 0 ? velocity7d / velocity30d : 1.0;

    // Feature 4: Enforcement vs Community Divergence Ratio
    const communityEvents = Math.max(0, total - enforcement);
    const enforcementRatio = total > 0 ? enforcement / total : 0.5;

    // Feature 5: Category Concentration (Synthetic Contraband Ratio)
    const syntheticRatio = total > 0 ? (parseFloat(r.synthetic_drug_events) || 0) / total : 0.0;

    // Feature 6: First Time Signal Density
    const firstTimeRatio = total > 0 ? firstTime / total : 0.0;

    // Feature 7: Interstate Transit Connectivity Index
    const corridorCount = corridorMap.get(r.district_id) || 0;

    // Feature 8: Reporting Volume Per 100k Population
    const perCapitaVolume = (total / pop) * 100000.0;

    // Feature 9: Data Coverage Sparsity Index
    const isSparse = total < 10 || r.coverage_status === 'LIMITED';

    return {
      districtId: r.district_id,
      districtName: r.district_name,
      districtCode: r.district_code,
      features: [
        Math.min(10.0, velocity7d),
        Math.min(10.0, velocity30d),
        Math.min(10.0, acceleration),
        enforcementRatio,
        syntheticRatio,
        firstTimeRatio,
        corridorCount,
        Math.min(50.0, perCapitaVolume),
        isSparse ? 1.0 : 0.0
      ],
      featureNames: [
        'velocity_7d',
        'velocity_30d',
        'acceleration',
        'enforcement_ratio',
        'synthetic_ratio',
        'first_time_ratio',
        'corridor_connectivity',
        'per_capita_volume',
        'is_sparse_coverage'
      ],
      metadata: {
        totalEvents: total,
        count7d,
        count30d,
        count90d,
        enforcementCount: enforcement,
        communityCount: communityEvents,
        firstTimeCount: firstTime,
        coverageStatus: r.coverage_status
      }
    };
  });
}

export default { extractDistrictFeatures };
