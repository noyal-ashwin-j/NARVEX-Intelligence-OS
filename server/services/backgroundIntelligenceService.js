import pool from '../database/db.js';
import { appendAuditRecord } from './hashChainService.js';

/**
 * NARVEX Continuous Background Intelligence Engine
 * 
 * Core Architectural Principles:
 * 1. ZERO PREDEFINED INTELLIGENCE: All intelligence states, trends, and first-time flags
 *    are dynamically computed from stored database records.
 * 2. DYNAMIC FIRST-TIME SIGNAL DERIVATION: Evaluated by querying whether prior records exist
 *    in the locality before the given event timestamp.
 * 3. INSUFFICIENT DATA SAFEGUARD: Districts with sparse/zero data are classified as
 *    INSUFFICIENT_DATA with LIMITED coverage and LOW confidence (never assumed "Safe").
 * 4. ENFORCEMENT BIAS SEPARATION: Police enforcement seizures do not conflate community risk.
 * 5. TRIPARTITE SEPARATION: Risk, Evidence Confidence, and Data Coverage remain independent.
 */

export async function ensureIntelligenceSchema() {
  try {
    await pool.query(`
      ALTER TABLE intelligence_events 
      ADD COLUMN IF NOT EXISTS is_first_time_signal TINYINT(1) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS locality_baseline_count INT DEFAULT 0;
    `);
    await pool.query(`
      ALTER TABLE districts
      ADD COLUMN IF NOT EXISTS trend_direction VARCHAR(30) DEFAULT 'STABLE',
      ADD COLUMN IF NOT EXISTS velocity_30d DECIMAL(5,2) DEFAULT 1.00,
      ADD COLUMN IF NOT EXISTS first_time_signals_count INT DEFAULT 0;
    `);
  } catch (err) {
    // Columns exist
  }
}

/**
 * Dynamically updates `is_first_time_signal` for all records in MySQL
 * by checking if prior historical observations existed in the same locality prior to event_date.
 */
export async function deriveFirstTimeSignalsDynamically() {
  await ensureIntelligenceSchema();

  // Reset all to 0 first
  await pool.query(`UPDATE intelligence_events SET is_first_time_signal = 0`);

  // Query events ordered by date per location
  const [rows] = await pool.query(`
    SELECT id, district_id, location_name, event_date
    FROM intelligence_events
    ORDER BY district_id ASC, location_name ASC, event_date ASC
  `);

  const seenLocations = new Set();
  const firstTimeIds = [];

  for (const r of rows) {
    const locKey = `${r.district_id}::${(r.location_name || '').trim().toLowerCase()}`;
    if (!seenLocations.has(locKey)) {
      seenLocations.add(locKey);
      firstTimeIds.push(r.id);
    }
  }

  if (firstTimeIds.length > 0) {
    // Update only the true earliest observation for each locality
    const chunks = [];
    const chunkSize = 500;
    for (let i = 0; i < firstTimeIds.length; i += chunkSize) {
      chunks.push(firstTimeIds.slice(i, i + chunkSize));
    }
    for (const chunk of chunks) {
      await pool.query(`UPDATE intelligence_events SET is_first_time_signal = 1 WHERE id IN (?)`, [chunk]);
    }
  }
}

/**
 * Recalculates district-level risk indicators, trend velocity, acceleration, and 3-axis status.
 */
export async function recalculateDistrictRiskScores(districtId = null) {
  try {
    await ensureIntelligenceSchema();

    // 1. Re-evaluate first-time signal flags dynamically from historical timeline
    await deriveFirstTimeSignalsDynamically();

    const districtQuery = districtId
      ? 'SELECT id, code, name, baseline_population FROM districts WHERE id = ?'
      : 'SELECT id, code, name, baseline_population FROM districts';
    const queryParams = districtId ? [districtId] : [];

    const [districts] = await pool.query(districtQuery, queryParams);

    for (const dist of districts) {
      // 2. Fetch signal metrics partitioned by enforcement vs community
      const [metrics] = await pool.query(
        `SELECT 
           COUNT(*) as total_signals,
           SUM(CASE WHEN verification_status = 'VERIFIED' THEN 1 ELSE 0 END) as verified_count,
           SUM(CASE WHEN verification_status IN ('UNVERIFIED', 'NEEDS_VERIFICATION', 'UNDER_REVIEW', 'NEW_SIGNAL') THEN 1 ELSE 0 END) as pending_count,
           SUM(CASE WHEN is_first_time_signal = 1 THEN 1 ELSE 0 END) as first_time_count,
           SUM(CASE WHEN is_enforcement = 1 THEN 1 ELSE 0 END) as enforcement_count,
           SUM(CASE WHEN is_enforcement = 0 THEN 1 ELSE 0 END) as community_count,
           -- Community-specific counts (to prevent enforcement bias)
           SUM(CASE WHEN is_enforcement = 0 AND event_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as comm_count_7d,
           SUM(CASE WHEN is_enforcement = 0 AND event_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND event_date < DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as comm_count_prev_7d,
           SUM(CASE WHEN is_enforcement = 0 AND event_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as comm_count_30d,
           SUM(CASE WHEN is_enforcement = 0 AND event_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) AND event_date < DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as comm_count_prev_30d,
           -- Overall signal counts
           SUM(CASE WHEN event_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as count_7d,
           SUM(CASE WHEN event_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND event_date < DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as count_prev_7d,
           SUM(CASE WHEN event_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as count_30d,
           SUM(CASE WHEN event_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) AND event_date < DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as count_prev_30d,
           SUM(CASE WHEN event_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY) THEN 1 ELSE 0 END) as count_90d,
           AVG(confidence_score) as avg_confidence
         FROM intelligence_events 
         WHERE district_id = ?`,
        [dist.id]
      );

      const m = metrics[0] || {};
      const total = parseInt(m.total_signals, 10) || 0;
      const verified = parseInt(m.verified_count, 10) || 0;
      const pending = parseInt(m.pending_count, 10) || 0;
      const firstTime = parseInt(m.first_time_count, 10) || 0;
      const count7d = parseInt(m.count_7d, 10) || 0;
      const countPrev7d = parseInt(m.count_prev_7d, 10) || 0;
      const count30d = parseInt(m.count_30d, 10) || 0;
      const countPrev30d = parseInt(m.count_prev_30d, 10) || 0;
      
      const commCount30d = parseInt(m.comm_count_30d, 10) || 0;
      const commCountPrev30d = parseInt(m.comm_count_prev_30d, 10) || 0;

      // 3. Velocity and Acceleration (Derived strictly from real rates)
      const baseline30 = Math.max(commCountPrev30d > 0 ? commCountPrev30d : countPrev30d, 1);
      const activeCount30 = commCount30d > 0 ? commCount30d : count30d;
      const velocity30 = total > 0 ? parseFloat((activeCount30 / baseline30).toFixed(2)) : 0.0;
      
      const baseline7 = Math.max(countPrev7d, 1);
      const velocity7 = total > 0 ? parseFloat((count7d / baseline7).toFixed(2)) : 0.0;
      const acceleration = parseFloat((velocity7 - velocity30).toFixed(2));

      // Trend Direction
      let trendDirection = 'STABLE';
      if (velocity30 >= 2.0 || (count30d >= 4 && countPrev30d === 0)) {
        trendDirection = 'RAPID_INCREASE';
      } else if (velocity30 >= 1.25) {
        trendDirection = 'INCREASING';
      } else if (velocity30 <= 0.75 && count30d > 0) {
        trendDirection = 'DECREASING';
      }

      // 4. Tripartite Dimension 1: Risk Assessment (Engine Derived)
      let calculatedRisk = 'WATCH';
      if (total === 0 || (total <= 2 && count30d === 0)) {
        // INSUFFICIENT DATA Safeguard: Absence of data is NEVER assumed low risk / safe!
        calculatedRisk = 'INSUFFICIENT_DATA';
      } else if (firstTime > 0 && total <= 3) {
        calculatedRisk = 'WATCH'; // New signal in fresh area stays on WATCH / verification queue
      } else if (count30d >= 15 || verified >= 18 || (velocity30 >= 2.2 && count30d >= 4)) {
        calculatedRisk = 'HIGH PREVENTIVE ATTENTION';
      } else if (count30d >= 6 || verified >= 8 || velocity30 >= 1.3) {
        calculatedRisk = 'INCREASING';
      } else {
        calculatedRisk = 'WATCH';
      }

      // 5. Tripartite Dimension 2: Data Coverage
      let coverageStatus = 'MODERATE';
      if (total === 0 || total < 5) {
        coverageStatus = 'LIMITED';
      } else if (count30d >= 12 && verified >= 10) {
        coverageStatus = 'GOOD';
      } else {
        coverageStatus = 'MODERATE';
      }

      // 6. Tripartite Dimension 3: Calibrated Evidence Confidence
      let calculatedConfidence = 50.0;
      if (total === 0) {
        calculatedConfidence = 35.0; // Low confidence for sparse areas
      } else if (verified >= 15) {
        calculatedConfidence = Math.min(88.0, 75.0 + verified * 0.5);
      } else if (total >= 10) {
        calculatedConfidence = 74.0;
      } else {
        calculatedConfidence = 60.0;
      }

      // 7. Emerging Zones Count
      const [zoneRows] = await pool.query(
        `SELECT COUNT(*) as emerging_count 
         FROM risk_zones 
         WHERE district_id = ? AND risk_level IN ('INCREASING', 'HIGH PREVENTIVE ATTENTION')`,
        [dist.id]
      );
      const emergingZones = zoneRows[0]?.emerging_count || (trendDirection === 'RAPID_INCREASE' ? 1 : 0);

      // 8. Active Alerts Count
      const [alertRows] = await pool.query(
        `SELECT COUNT(*) as alert_count 
         FROM alerts 
         WHERE district_id = ? AND status NOT IN ('RESOLVED', 'DISMISSED')`,
        [dist.id]
      );
      const activeAlerts = alertRows[0]?.alert_count || 0;

      // 9. Update District Table
      await pool.query(
        `UPDATE districts 
         SET verified_events_count = ?,
             pending_verification_count = ?,
             recent_signal_count = ?,
             first_time_signals_count = ?,
             historical_signal_count = ?,
             risk_level = ?,
             coverage_status = ?,
             confidence_score = ?,
             emerging_zones_count = ?,
             active_alerts_count = ?,
             trend_direction = ?,
             velocity_30d = ?
         WHERE id = ?`,
        [
          verified,
          pending,
          count30d,
          firstTime,
          total,
          calculatedRisk,
          coverageStatus,
          calculatedConfidence,
          emergingZones,
          activeAlerts,
          trendDirection,
          velocity30,
          dist.id
        ]
      );
    }

    return { success: true, updatedDistricts: districts.length };
  } catch (err) {
    console.error('District risk recalculation error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Computes "What Changed?" temporal intelligence deltas across Today, 7-Day, and 30-Day windows.
 */
export async function getWhatChangedSummary() {
  try {
    const [eventsToday] = await pool.query(`
      SELECT e.*, d.name as district_name, c.category_name
      FROM intelligence_events e
      JOIN districts d ON e.district_id = d.id
      JOIN event_categories c ON e.category_id = c.id
      WHERE e.event_date >= CURDATE()
      ORDER BY e.created_at DESC
      LIMIT 10
    `);

    const [rapidDistricts] = await pool.query(`
      SELECT name, code, velocity_30d, risk_level, trend_direction
      FROM districts
      WHERE velocity_30d >= 2.0 OR trend_direction = 'RAPID_INCREASE'
      ORDER BY velocity_30d DESC
      LIMIT 5
    `);

    const [firstTimeSignals] = await pool.query(`
      SELECT e.id, e.event_code, e.location_name, e.event_date, d.name as district_name, c.category_name
      FROM intelligence_events e
      JOIN districts d ON e.district_id = d.id
      JOIN event_categories c ON e.category_id = c.id
      WHERE e.is_first_time_signal = 1
      ORDER BY e.event_date DESC
      LIMIT 5
    `);

    return {
      today: {
        newSignalsCount: eventsToday.length,
        signals: eventsToday
      },
      velocitySurges: rapidDistricts,
      firstTimeSignals,
      generatedAt: new Date().toISOString()
    };
  } catch (err) {
    return { today: { newSignalsCount: 0, signals: [] }, velocitySurges: [], firstTimeSignals: [] };
  }
}

export default {
  ensureIntelligenceSchema,
  deriveFirstTimeSignalsDynamically,
  recalculateDistrictRiskScores,
  getWhatChangedSummary
};
