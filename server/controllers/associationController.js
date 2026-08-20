import pool from '../database/db.js';

/**
 * Get Spatial Associations & Detailed Transit Corridors
 * Supports Mode of Transport (Road, Rail, Coastal, Air, Bus) & Intra/Inter-District filters
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
      whereClause += ' AND sa.primary_sources LIKE ?';
      params.push(`%${transportMode}%`);
    }

    if (routeType && routeType !== 'ALL') {
      whereClause += ' AND sa.primary_sources LIKE ?';
      params.push(`%${routeType}%`);
    }

    if (riskIntensity && riskIntensity !== 'ALL') {
      whereClause += ' AND sa.confidence_level = ?';
      params.push(riskIntensity);
    }

    if (contraband && contraband !== 'ALL') {
      whereClause += ' AND sa.primary_categories LIKE ?';
      params.push(`%${contraband}%`);
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
      JOIN districts od ON sa.origin_district_id = od.id
      JOIN districts dd ON sa.destination_district_id = dd.id
      ${whereClause}
      ORDER BY sa.observation_count DESC
    `;

    const [associations] = await pool.query(query, params);

    // Compute aggregated transport mode statistics
    const modeCounts = {
      ROAD_HIGHWAY: 0,
      RAILWAY: 0,
      COASTAL_MARITIME: 0,
      AIR_CARGO: 0,
      BUS_TRANSIT: 0
    };

    associations.forEach((a) => {
      const src = String(a.primary_sources || '');
      if (src.includes('ROAD_HIGHWAY')) modeCounts.ROAD_HIGHWAY++;
      else if (src.includes('RAILWAY')) modeCounts.RAILWAY++;
      else if (src.includes('COASTAL_MARITIME')) modeCounts.COASTAL_MARITIME++;
      else if (src.includes('AIR_CARGO')) modeCounts.AIR_CARGO++;
      else modeCounts.ROAD_HIGHWAY++;
    });

    return res.json({
      success: true,
      total: associations.length,
      associations,
      modeSummary: modeCounts
    });
  } catch (err) {
    console.error('Error fetching spatial associations:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

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
