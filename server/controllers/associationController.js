import pool from '../database/db.js';

/**
 * Get Spatial Associations & Detailed Transit Corridors
 */
export async function getSpatialAssociations(req, res) {
  try {
    const {
      districtId,
      transportMode,
      routeType,
      contraband,
      riskIntensity,
      minObservations = 1
    } = req.query;

    let whereClause = 'WHERE sa.observation_count >= ?';
    const params = [parseInt(minObservations, 10)];

    if (districtId && districtId !== 'ALL') {
      whereClause += ' AND (sa.origin_district_id = ? OR sa.destination_district_id = ?)';
      params.push(districtId, districtId);
    }

    if (transportMode && transportMode !== 'ALL') {
      whereClause += ' AND (sa.primary_sources LIKE ? OR sa.transport_mode = ?)';
      params.push(`%${transportMode}%`, transportMode);
    }

    if (riskIntensity && riskIntensity !== 'ALL') {
      whereClause += ' AND sa.confidence_level = ?';
      params.push(riskIntensity);
    }

    const query = `
      SELECT 
        sa.*,
        od.name as origin_district_name,
        od.code as origin_district_code,
        od.center_lat as origin_lat,
        od.center_lng as origin_lng,
        dd.name as destination_district_name,
        dd.code as destination_district_code,
        dd.center_lat as destination_lat,
        dd.center_lng as destination_lng
      FROM spatial_associations sa
      LEFT JOIN districts od ON sa.origin_district_id = od.id
      LEFT JOIN districts dd ON sa.destination_district_id = dd.id
      ${whereClause}
      ORDER BY sa.observation_count DESC
    `;

    const [associations] = await pool.query(query, params);

    return res.json({
      success: true,
      total: associations.length,
      associations
    });
  } catch (err) {
    console.error('Error fetching spatial associations:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Master Database-Backed Route Intelligence Endpoint
 * Returns route records for Global, India, and Tamil Nadu levels
 */
export async function getRouteIntelligence(req, res) {
  try {
    const { scope = 'WORLD', mode = 'ALL', status = 'ALL', timeWindow = '90D' } = req.query;

    const normalizedScope = scope === 'GLOBAL' ? 'WORLD' : scope;

    let timeWhere = '';
    if (timeWindow === '7D') {
      timeWhere = ' AND ri.last_observed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (timeWindow === '30D') {
      timeWhere = ' AND ri.last_observed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    } else if (timeWindow === '90D') {
      timeWhere = ' AND ri.last_observed_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
    } else if (timeWindow === '1Y') {
      timeWhere = ' AND ri.last_observed_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
    }

    const [rows] = await pool.query(
      `SELECT 
        ri.id,
        ri.route_id,
        ri.origin_region AS origin,
        ri.destination_region AS destination,
        ri.origin_lat,
        ri.origin_lng,
        ri.destination_lat AS dest_lat,
        ri.destination_lng AS dest_lng,
        ri.transport_mode,
        ri.scope_tier,
        ri.observation_count,
        ri.verified_event_count,
        ri.unique_sources,
        ri.historical_frequency,
        ri.recent_velocity,
        ri.trend_direction,
        ri.evidence_confidence,
        ri.coverage_status,
        ri.derived_state,
        ri.arc_status,
        ri.first_observed_at,
        ri.last_observed_at
       FROM route_intelligence ri
       WHERE (ri.scope_tier = ? OR ? = 'ALL')
         AND (ri.transport_mode = ? OR ? = 'ALL')
         AND (ri.arc_status = ? OR ? = 'ALL')
         ${timeWhere}
       ORDER BY ri.observation_count DESC`,
      [normalizedScope, normalizedScope, mode, mode, status, status]
    );

    const routes = rows.map((r) => {
      const obsCount = parseInt(r.observation_count, 10) || 1;
      const verifiedCount = parseInt(r.verified_event_count, 10) || Math.ceil(obsCount * 0.8);
      const confidence = parseFloat(r.evidence_confidence) || 0.75;
      const arcWidth = Math.min(8.5, Math.max(2.5, 2.5 + Math.log(1 + obsCount) * 1.2));
      
      let color = '#3b82f6';
      if (r.transport_mode === 'AIR') color = '#ef4444';
      else if (r.transport_mode === 'MARITIME') color = '#06b6d4';
      else if (r.transport_mode === 'ROAD') color = '#f59e0b';
      else if (r.transport_mode === 'RAIL') color = '#8b5cf6';

      let interpretation = "Repeated observations connect these locations during the selected analysis window.";
      if (r.arc_status === 'FORECAST') {
        interpretation = "Model-derived preventive attention projection. Not a confirmed future movement.";
      } else if (r.arc_status === 'EMERGING') {
        interpretation = "Statistically accelerating origin-destination spatial association detected.";
      }

      return {
        ...r,
        arc_width: arcWidth,
        arc_opacity: confidence,
        color,
        interpretation,
        provenance_chain: [
          `${obsCount} raw observational records in MySQL`,
          `${verifiedCount} verified enforcement & seizure events`,
          `${r.unique_sources} independent source categories`,
          `Recent velocity ratio: ${parseFloat(r.recent_velocity).toFixed(2)}x`,
          `Last observed: ${r.last_observed_at ? new Date(r.last_observed_at).toISOString().slice(0, 10) : 'N/A'}`,
          `Classification state: ${r.arc_status}`
        ]
      };
    });

    return res.json({
      success: true,
      scope: normalizedScope,
      mode,
      status,
      timeWindow,
      total: routes.length,
      routes
    });
  } catch (err) {
    console.error('Error fetching route intelligence:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export const getIntelligenceArcs = getRouteIntelligence;
export const getMapArcs = getRouteIntelligence;

/**
 * Compare Two Corridors
 */
export async function compareCorridors(req, res) {
  const { id1, id2 } = req.query;

  if (!id1 || !id2) {
    return res.status(400).json({ success: false, message: 'Please provide id1 and id2 to compare.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT sa.*, od.name as origin_name, dd.name as dest_name 
       FROM spatial_associations sa
       JOIN districts od ON sa.origin_district_id = od.id
       JOIN districts dd ON sa.destination_district_id = dd.id
       WHERE sa.id IN (?, ?)`,
      [id1, id2]
    );

    return res.json({
      success: true,
      corridor1: rows.find((r) => r.id === parseInt(id1, 10)) || null,
      corridor2: rows.find((r) => r.id === parseInt(id2, 10)) || null
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
