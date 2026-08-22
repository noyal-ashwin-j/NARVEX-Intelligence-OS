import pool from '../database/db.js';

/**
 * Get All 38 Tamil Nadu Districts with Live Synchronized Intelligence Metrics
 * If DISTRICT_OFFICER, only returns their single assigned district.
 */
export async function getAllDistricts(req, res) {
  try {
    const { sortBy = 'priority', riskLevel, search } = req.query;

    let query = `
      SELECT 
        d.id,
        d.code,
        d.name,
        d.headquarters,
        d.center_lat,
        d.center_lng,
        d.baseline_population,
        d.coverage_status,
        d.risk_level,
        d.confidence_score,
        d.trend_direction,
        d.velocity_30d,
        COUNT(DISTINCT a.id) as active_alerts_count,
        COUNT(DISTINCT rz.id) as emerging_zones_count,
        COUNT(DISTINCT CASE WHEN e.verification_status = 'VERIFIED' THEN e.id END) as verified_events_count,
        COUNT(DISTINCT CASE WHEN e.verification_status IN ('UNVERIFIED', 'UNDER_REVIEW', 'NEEDS_VERIFICATION', 'NEW_SIGNAL') THEN e.id END) as pending_verification_count,
        COUNT(DISTINCT CASE WHEN e.is_first_time_signal = 1 THEN e.id END) as first_time_signals_count,
        COUNT(DISTINCT e.id) as total_signals_count,
        COUNT(DISTINCT CASE WHEN e.event_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN e.id END) as recent_signal_count,
        d.last_updated
      FROM districts d
      LEFT JOIN alerts a ON d.id = a.district_id AND a.status NOT IN ('RESOLVED', 'DISMISSED')
      LEFT JOIN risk_zones rz ON d.id = rz.district_id AND rz.historical_trend = 'NEW_EMERGING'
      LEFT JOIN intelligence_events e ON d.id = e.district_id
      WHERE 1=1
    `;

    const params = [];

    // Enforce District Officer scoping
    if (req.user && req.user.roleKey === 'DISTRICT_OFFICER') {
      query += ' AND d.id = ?';
      params.push(req.user.districtId);
    } else if (req.query.districtId && req.query.districtId !== 'ALL') {
      query += ' AND d.id = ?';
      params.push(req.query.districtId);
    }

    if (riskLevel && riskLevel !== 'ALL') {
      query += ' AND d.risk_level = ?';
      params.push(riskLevel);
    }

    if (search) {
      query += ' AND (d.name LIKE ? OR d.headquarters LIKE ? OR d.code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY d.id';

    // Order By
    switch (sortBy) {
      case 'increasing':
        query += ' ORDER BY d.velocity_30d DESC, recent_signal_count DESC, d.confidence_score DESC';
        break;
      case 'new_signals':
        query += ' ORDER BY first_time_signals_count DESC, pending_verification_count DESC, recent_signal_count DESC';
        break;
      case 'alerts':
        query += ' ORDER BY active_alerts_count DESC, d.confidence_score DESC';
        break;
      case 'emerging':
        query += ' ORDER BY emerging_zones_count DESC, recent_signal_count DESC';
        break;
      case 'confidence':
        query += ' ORDER BY d.confidence_score DESC, verified_events_count DESC';
        break;
      case 'recent_trend':
        query += ' ORDER BY recent_signal_count DESC, d.district_name ASC';
        break;
      case 'alpha':
        query += ' ORDER BY d.district_name ASC';
        break;
      case 'priority':
      default:
        query += ` ORDER BY 
          CASE d.risk_level 
            WHEN 'HIGH PREVENTIVE ATTENTION' THEN 1 
            WHEN 'INCREASING' THEN 2 
            WHEN 'WATCH' THEN 3 
            WHEN 'LOW' THEN 4 
            ELSE 5 
          END ASC, 
          d.velocity_30d DESC,
          active_alerts_count DESC, 
          recent_signal_count DESC`;
        break;
    }

    const [districts] = await pool.query(query, params);

    return res.json({
      success: true,
      total: districts.length,
      districts
    });
  } catch (err) {
    console.error('Error fetching districts:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Get Specific District Intelligence Profile & Associated Hierarchy
 */
export async function getDistrictById(req, res) {
  const { id } = req.params;

  // Enforce District Officer scoping
  if (req.user && req.user.roleKey === 'DISTRICT_OFFICER') {
    if (String(req.user.districtId) !== String(id)) {
      return res.status(403).json({
        success: false,
        message: `Access Forbidden: District Officer is restricted to assigned district #${req.user.districtId}.`
      });
    }
  }

  try {
    const [districtRows] = await pool.query(
      `SELECT d.*,
        COUNT(DISTINCT a.id) as active_alerts_count,
        COUNT(DISTINCT rz.id) as emerging_zones_count,
        COUNT(DISTINCT CASE WHEN e.verification_status = 'VERIFIED' THEN e.id END) as verified_events_count,
        COUNT(DISTINCT CASE WHEN e.verification_status IN ('UNVERIFIED', 'UNDER_REVIEW') THEN e.id END) as pending_verification_count,
        COUNT(DISTINCT e.id) as total_signals_count,
        COUNT(DISTINCT CASE WHEN e.event_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN e.id END) as recent_signal_count
       FROM districts d
       LEFT JOIN alerts a ON d.id = a.district_id AND a.status NOT IN ('RESOLVED', 'DISMISSED')
       LEFT JOIN risk_zones rz ON d.id = rz.district_id AND rz.historical_trend = 'NEW_EMERGING'
       LEFT JOIN intelligence_events e ON d.id = e.district_id
       WHERE d.id = ? OR d.code = ?
       GROUP BY d.id`,
      [id, id]
    );

    if (districtRows.length === 0) {
      return res.status(404).json({ success: false, message: 'District not found.' });
    }

    const district = districtRows[0];

    // Fetch taluks, police stations, checkposts
    const [taluks] = await pool.query('SELECT * FROM taluks WHERE district_id = ? ORDER BY id ASC', [district.id]);
    const [policeStations] = await pool.query('SELECT * FROM police_stations WHERE district_id = ? ORDER BY id ASC', [district.id]);
    const [checkposts] = await pool.query('SELECT * FROM checkposts WHERE district_id = ? ORDER BY id ASC', [district.id]);

    // Fetch active alerts for this district
    const [alerts] = await pool.query(
      `SELECT * FROM alerts WHERE district_id = ? ORDER BY created_at DESC LIMIT 10`,
      [district.id]
    );

    // Fetch active risk zones for this district
    const [riskZones] = await pool.query(
      `SELECT * FROM risk_zones WHERE district_id = ? ORDER BY last_updated DESC`,
      [district.id]
    );

    return res.json({
      success: true,
      district,
      taluks,
      policeStations,
      checkposts,
      alerts,
      riskZones
    });
  } catch (err) {
    console.error('Error fetching district detail:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
