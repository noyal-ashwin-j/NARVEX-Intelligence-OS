import pool from '../database/db.js';

/**
 * Feature Engineering & Intelligence Derivation Engine
 * Implements Observational Bias Correction, Emerging-Zone Detection,
 * Waterbed Corridor Shift Analysis, and "WHY" Evidence Explanations.
 */
export async function computeFeaturesForDistrict(districtId, dateStr = new Date().toISOString().slice(0, 10)) {
  const conn = await pool.getConnection();
  try {
    const targetDate = new Date(dateStr);
    const date7d = new Date(targetDate.getTime() - 7 * 86400000).toISOString().slice(0, 19).replace('T', ' ');
    const date30d = new Date(targetDate.getTime() - 30 * 86400000).toISOString().slice(0, 19).replace('T', ' ');
    const date90d = new Date(targetDate.getTime() - 90 * 86400000).toISOString().slice(0, 19).replace('T', ' ');

    // 1. Observation Counts (7d, 30d, 90d)
    const [rows7d] = await conn.query(
      `SELECT COUNT(*) AS cnt FROM event_provenance WHERE district_id = ? AND observed_at >= ?`,
      [districtId, date7d]
    );
    const [rows30d] = await conn.query(
      `SELECT COUNT(*) AS cnt FROM event_provenance WHERE district_id = ? AND observed_at >= ?`,
      [districtId, date30d]
    );
    const [rows90d] = await conn.query(
      `SELECT COUNT(*) AS cnt FROM event_provenance WHERE district_id = ? AND observed_at >= ?`,
      [districtId, date90d]
    );

    const cnt7 = rows7d[0].cnt || 0;
    const cnt30 = rows30d[0].cnt || 0;
    const cnt90 = rows90d[0].cnt || 0;

    const velocity7d = Number((cnt7 / 7.0).toFixed(4));
    const velocity30d = Number((cnt30 / 30.0).toFixed(4));
    const velocity90d = Number((cnt90 / 90.0).toFixed(4));
    const acceleration = velocity30d > 0 ? Number((velocity7d / velocity30d).toFixed(4)) : (velocity7d > 0 ? 2.0 : 0.0);

    // 2. Observational Bias Dimensions
    // A. Enforcement vs Community Signals
    const [enfRows] = await conn.query(
      `SELECT COUNT(*) AS enf_cnt FROM event_provenance WHERE district_id = ? AND (source_department LIKE '%Police%' OR source_department LIKE '%NCB%' OR source_department LIKE '%Customs%')`,
      [districtId]
    );
    const [commRows] = await conn.query(
      `SELECT COUNT(*) AS comm_cnt FROM event_provenance WHERE district_id = ? AND (source_department LIKE '%Community%' OR source_department LIKE '%Health%' OR source_department LIKE '%Public%')`,
      [districtId]
    );

    const enforcementCount = enfRows[0].enf_cnt || 0;
    const communityCount = commRows[0].comm_cnt || 0;
    const enforcementRatio = (enforcementCount + communityCount) > 0 ? Number((enforcementCount / (enforcementCount + communityCount)).toFixed(2)) : 0.50;

    // B. Source Diversity
    const [srcRows] = await conn.query(
      `SELECT COUNT(DISTINCT source_id) AS div_cnt FROM event_provenance WHERE district_id = ?`,
      [districtId]
    );
    const sourceDiversity = srcRows[0].div_cnt || 1;

    // C. Data Coverage & Data Gap (Zero observations != Safe!)
    const coverageScore = cnt90 >= 10 ? 1.0 : (cnt90 > 0 ? 0.50 : 0.15);
    const dataGap = Number((1.0 - coverageScore).toFixed(2));
    const coverageLabel = coverageScore >= 0.8 ? 'HIGH' : (coverageScore >= 0.4 ? 'MODERATE' : 'SPARSE');

    // D. Corroboration & Confidence
    const corroborationScore = Math.min(1.0, (cnt30 > 5 && sourceDiversity >= 2 ? 0.90 : (cnt30 > 0 ? 0.60 : 0.30)));
    const confidenceScore = Number((0.40 * coverageScore + 0.35 * corroborationScore + 0.25 * Math.min(1.0, sourceDiversity / 3.0)).toFixed(2));

    // 3. Dynamic Emerging-Zone Derivation
    let signalState = 'STABLE';
    if (coverageScore < 0.35) {
      signalState = 'INSUFFICIENT_DATA'; // Safe safeguard: Low data != Safe!
    } else if (acceleration > 1.4 && velocity7d > 0.5) {
      signalState = 'HIGH PREVENTIVE ATTENTION';
    } else if (acceleration > 1.1 || cnt7 >= 3) {
      signalState = 'EMERGING';
    } else if (velocity7d > velocity30d || enforcementRatio > 0.8) {
      signalState = 'WATCH';
    }

    // 4. Rerouting / Waterbed Effect Corridor Shift Check
    const [corridorRows] = await conn.query(
      `SELECT origin_region, destination_region, recent_velocity, historical_frequency FROM route_intelligence WHERE (origin_region LIKE CONCAT('%', ?, '%') OR destination_region LIKE CONCAT('%', ?, '%')) AND scope_tier = 'TAMILNADU'`,
      [districtId, districtId]
    );

    let waterbedShiftDetected = false;
    let shiftDetails = null;

    if (corridorRows.length >= 2) {
      // Compare relative velocity changes between connected corridors
      const mainCorridor = corridorRows[0];
      const altCorridor = corridorRows[1];
      const deltaA = mainCorridor.recent_velocity - mainCorridor.historical_frequency;
      const deltaB = altCorridor.recent_velocity - altCorridor.historical_frequency;

      if (deltaA < -0.2 && deltaB > 0.2) {
        waterbedShiftDetected = true;
        shiftDetails = `POTENTIAL CORRIDOR SHIFT — Activity decreased on ${mainCorridor.origin_region}➔${mainCorridor.destination_region} (Δ ${deltaA.toFixed(2)}) while connected ${altCorridor.origin_region}➔${altCorridor.destination_region} increased (Δ +${deltaB.toFixed(2)})`;
      }
    }

    // 5. Build Structured "WHY" Evidence Explanation Payload
    const baselineMultiple = velocity30d > 0 ? Number((velocity7d / velocity30d).toFixed(1)) : 1.0;
    const whyExplanation = {
      districtId,
      signalState,
      velocity7d,
      baselineMultiple,
      independentSources: sourceDiversity,
      enforcementRatio,
      communitySignalCount: communityCount,
      coverageLabel,
      dataGap,
      confidenceScore: Math.round(confidenceScore * 100),
      waterbedShift: shiftDetails || 'Normal spatial progression',
      primaryEvidenceSummary: `Derived from ${cnt30} verified events across ${sourceDiversity} independent sources with ${coverageLabel} data coverage.`
    };

    // Upsert features into model_features
    await conn.query(
      `INSERT INTO model_features 
        (district_id, feature_date, velocity_7d, velocity_30d, velocity_90d, acceleration, source_diversity, corroboration_score, coverage_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        velocity_7d=VALUES(velocity_7d),
        velocity_30d=VALUES(velocity_30d),
        velocity_90d=VALUES(velocity_90d),
        acceleration=VALUES(acceleration),
        source_diversity=VALUES(source_diversity),
        corroboration_score=VALUES(corroboration_score),
        coverage_score=VALUES(coverage_score)`,
      [districtId, dateStr, velocity7d, velocity30d, velocity90d, acceleration, sourceDiversity, corroborationScore, coverageScore]
    );

    conn.release();
    return {
      districtId,
      dateStr,
      velocity7d,
      velocity30d,
      velocity90d,
      acceleration,
      enforcementRatio,
      sourceDiversity,
      corroborationScore,
      coverageScore,
      dataGap,
      confidenceScore,
      signalState,
      whyExplanation
    };
  } catch (err) {
    conn.release();
    throw err;
  }
}

export async function computeAllDistrictFeatures() {
  const [districts] = await pool.query('SELECT id FROM districts');
  const results = [];
  for (const d of districts) {
    const feat = await computeFeaturesForDistrict(d.id);
    results.push(feat);
  }
  return results;
}
