import pool from '../database/db.js';
import { appendAuditRecord } from '../services/hashChainService.js';

/**
 * Get Responsible AI & Bias Governance Metrics
 */
export async function getGovernanceMetrics(req, res) {
  try {
    // 1. Regional Data Coverage & Disparity (Urban vs Rural Districts)
    const [coverageRows] = await pool.query(
      `SELECT 
        d.coverage_status,
        COUNT(d.id) as district_count,
        SUM(d.baseline_population) as total_population,
        COUNT(e.id) as total_signals
       FROM districts d
       LEFT JOIN intelligence_events e ON d.id = e.district_id
       GROUP BY d.coverage_status`
    );

    // 2. Enforcement Activity vs Independent Signals Disparity by District
    const [enforcementDisparity] = await pool.query(
      `SELECT 
        d.name as district_name,
        d.risk_level,
        COUNT(e.id) as total_signals,
        COUNT(CASE WHEN e.is_enforcement = 1 THEN 1 END) as enforcement_count,
        COUNT(CASE WHEN e.is_enforcement = 0 THEN 1 END) as independent_risk_count,
        ROUND(COUNT(CASE WHEN e.is_enforcement = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(e.id), 0), 1) as enforcement_ratio_pct
       FROM districts d
       LEFT JOIN intelligence_events e ON d.id = e.district_id
       GROUP BY d.id
       ORDER BY enforcement_ratio_pct DESC
       LIMIT 10`
    );

    // 3. Human Reviewer Decisions vs AI Suggestions (Rubber-Stamping / Override Audit)
    const [reviewerDecisions] = await pool.query(
      `SELECT 
        p.classification_method,
        COUNT(p.id) as total_reviewed,
        ROUND(AVG(p.extraction_confidence), 1) as avg_confidence,
        COUNT(CASE WHEN e.verification_status = 'VERIFIED' THEN 1 END) as verified_count,
        COUNT(CASE WHEN e.verification_status = 'REJECTED' THEN 1 END) as rejected_count,
        COUNT(CASE WHEN e.verification_status = 'CORROBORATED' THEN 1 END) as corroborated_count
       FROM event_provenance p
       JOIN intelligence_events e ON p.event_id = e.id
       GROUP BY p.classification_method`
    );

    // 4. Current Active Threshold Configuration
    const [thresholds] = await pool.query(
      `SELECT rtc.*, u.full_name as modified_by_name 
       FROM risk_threshold_configs rtc
       LEFT JOIN users u ON rtc.modified_by = u.id
       WHERE rtc.is_active = 1
       LIMIT 1`
    );

    return res.json({
      success: true,
      governanceData: {
        coverageDistribution: coverageRows,
        enforcementDisparity,
        reviewerDecisions,
        activeThreshold: thresholds[0] || null,
        principles: [
          { title: 'LOW REPORTING ≠ LOW RISK', description: 'Sparse data triggers INSUFFICIENT DATA status rather than artificially lowering risk scores.' },
          { title: 'HIGH ENFORCEMENT ≠ HIGH DRUG RISK', description: 'Enforcement seizures are analyzed separately to avoid over-policing feedback loops.' },
          { title: 'FULL PROVENANCE & HUMAN-IN-THE-LOOP', description: 'Every automated suggestion requires human officer sign-off with permanent cryptographic audit logging.' }
        ]
      }
    });
  } catch (err) {
    console.error('Governance metrics error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Update Risk Threshold Configuration (RBAC: STATE_ADMIN)
 */
export async function updateRiskThresholds(req, res) {
  const { watchThreshold, risingThreshold, highThreshold, minConfidenceForHigh, populationWeight, notes } = req.body;

  try {
    const versionTag = `TN_CONFIG_${Date.now().toString().slice(-4)}`;

    // Deactivate previous active threshold
    await pool.query('UPDATE risk_threshold_configs SET is_active = 0');

    // Insert new version
    const [insResult] = await pool.query(
      `INSERT INTO risk_threshold_configs 
       (version_tag, watch_threshold, rising_threshold, high_threshold, min_confidence_for_high, population_weight, is_active, notes, modified_by)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        versionTag,
        parseInt(watchThreshold, 10) || 5,
        parseInt(risingThreshold, 10) || 12,
        parseInt(highThreshold, 10) || 25,
        parseFloat(minConfidenceForHigh) || 70.0,
        parseFloat(populationWeight) || 0.35,
        notes || 'Policy threshold update via governance dashboard',
        req.user?.id || null
      ]
    );

    // Audit Log
    await appendAuditRecord({
      actorUserId: req.user?.id || null,
      actionType: 'RISK_THRESHOLDS_UPDATED',
      entityType: 'RISK_THRESHOLD_CONFIG',
      entityId: insResult.insertId,
      payload: { versionTag, watchThreshold, risingThreshold, highThreshold },
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: `Risk thresholds updated to version ${versionTag}.`,
      versionTag
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
