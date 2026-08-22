import pool from '../database/db.js';

/**
 * Filtered GIS Intelligence Map Data Layers
 */
export async function getMapData(req, res) {
  try {
    const {
      districtId,
      talukId,
      categoryId,
      sourceId,
      verificationStatus,
      riskLevel,
      startDate,
      endDate
    } = req.query;

    const isDistrictOfficer = req.user?.roleKey === 'DISTRICT_OFFICER';
    const effectiveDistrictId = (isDistrictOfficer && req.user?.districtId)
      ? req.user.districtId
      : districtId;

    let eventWhere = 'WHERE 1=1';
    let zoneWhere = 'WHERE 1=1';
    let alertWhere = "WHERE a.status NOT IN ('RESOLVED', 'DISMISSED')";
    const eventParams = [];
    const zoneParams = [];
    const alertParams = [];

    if (effectiveDistrictId && effectiveDistrictId !== 'ALL') {
      eventWhere += ' AND e.district_id = ?';
      eventParams.push(effectiveDistrictId);

      zoneWhere += ' AND rz.district_id = ?';
      zoneParams.push(effectiveDistrictId);

      alertWhere += ' AND a.district_id = ?';
      alertParams.push(effectiveDistrictId);
    }

    if (talukId && talukId !== 'ALL') {
      eventWhere += ' AND e.taluk_id = ?';
      eventParams.push(talukId);
      zoneWhere += ' AND rz.taluk_id = ?';
      zoneParams.push(talukId);
      alertWhere += ' AND a.taluk_id = ?';
      alertParams.push(talukId);
    }

    if (categoryId && categoryId !== 'ALL') {
      eventWhere += ' AND e.category_id = ?';
      eventParams.push(categoryId);
    }

    if (sourceId && sourceId !== 'ALL') {
      eventWhere += ' AND e.source_id = ?';
      eventParams.push(sourceId);
    }

    if (verificationStatus && verificationStatus !== 'ALL') {
      eventWhere += ' AND e.verification_status = ?';
      eventParams.push(verificationStatus);
    }

    if (riskLevel && riskLevel !== 'ALL') {
      zoneWhere += ' AND rz.risk_level = ?';
      zoneParams.push(riskLevel);
    }

    if (startDate) {
      eventWhere += ' AND e.event_date >= ?';
      eventParams.push(startDate);
    }

    if (endDate) {
      eventWhere += ' AND e.event_date <= ?';
      eventParams.push(endDate);
    }

    // 1. Fetch Risk Zones
    const [riskZones] = await pool.query(
      `SELECT rz.*, d.name as district_name, d.code as district_code, t.name as taluk_name
       FROM risk_zones rz
       JOIN districts d ON rz.district_id = d.id
       LEFT JOIN taluks t ON rz.taluk_id = t.id
       ${zoneWhere}`,
      zoneParams
    );

    // 2. Fetch Intelligence Events (Separated into Enforcement vs Risk Signals)
    const [events] = await pool.query(
      `SELECT 
        e.id,
        e.event_code,
        e.district_id,
        d.name as district_name,
        e.location_name,
        e.lat,
        e.lng,
        e.event_date,
        e.severity_level,
        e.is_enforcement,
        e.verification_status,
        e.confidence_score,
        e.coverage_flag,
        c.category_name,
        c.category_key,
        s.source_name,
        s.source_type,
        p.source_department,
        p.source_file_name
       FROM intelligence_events e
       JOIN districts d ON e.district_id = d.id
       JOIN event_categories c ON e.category_id = c.id
       JOIN event_sources s ON e.source_id = s.id
       LEFT JOIN event_provenance p ON e.id = p.event_id
       ${eventWhere}`,
      eventParams
    );

    // 3. Fetch Spatial Associations (Corridors)
    const [associations] = await pool.query(
      `SELECT 
        sa.*,
        od.name as origin_name,
        od.code as origin_code,
        dd.name as destination_name,
        dd.code as destination_code
       FROM spatial_associations sa
       JOIN districts od ON sa.origin_district_id = od.id
       JOIN districts dd ON sa.destination_district_id = dd.id
        ${effectiveDistrictId && effectiveDistrictId !== 'ALL' ? 'WHERE sa.origin_district_id = ? OR sa.destination_district_id = ?' : ''}`,
      effectiveDistrictId && effectiveDistrictId !== 'ALL' ? [effectiveDistrictId, effectiveDistrictId] : []
    );

    // 4. Fetch Active Alerts
    const [alerts] = await pool.query(
      `SELECT a.*, d.name as district_name 
       FROM alerts a 
       JOIN districts d ON a.district_id = d.id 
       ${alertWhere} 
       ORDER BY a.created_at DESC`,
      alertParams
    );

    // 5. Fetch Checkposts & Police Stations for map overlays
    let checkpostQuery = 'SELECT cp.*, d.name as district_name FROM checkposts cp JOIN districts d ON cp.district_id = d.id';
    let stationQuery = 'SELECT ps.*, d.name as district_name FROM police_stations ps JOIN districts d ON ps.district_id = d.id';
    const locParams = [];
    if (effectiveDistrictId && effectiveDistrictId !== 'ALL') {
      checkpostQuery += ' WHERE cp.district_id = ?';
      stationQuery += ' WHERE ps.district_id = ?';
      locParams.push(effectiveDistrictId);
    }
    const [checkposts] = await pool.query(checkpostQuery, locParams);
    const [policeStations] = await pool.query(stationQuery, locParams);

    // 6. Fetch Anonymous Citizen Reports (Approximate pins)
    const [citizenReports] = await pool.query(
      `SELECT cr.id, cr.report_code, cr.approximate_location, cr.lat, cr.lng, cr.report_date, cr.status, cr.confidence_score, c.category_name, d.name as district_name
       FROM citizen_reports cr
       JOIN districts d ON cr.approximate_district_id = d.id
       JOIN event_categories c ON cr.category_id = c.id
       ${effectiveDistrictId && effectiveDistrictId !== 'ALL' ? 'WHERE cr.approximate_district_id = ?' : ''}`,
      effectiveDistrictId && effectiveDistrictId !== 'ALL' ? [effectiveDistrictId] : []
    );

    return res.json({
      success: true,
      data: {
        riskZones,
        events,
        enforcementPoints: events.filter((e) => e.is_enforcement === 1),
        riskSignalPoints: events.filter((e) => e.is_enforcement === 0),
        associations,
        alerts,
        checkposts,
        policeStations,
        citizenReports
      }
    });
  } catch (err) {
    console.error('Error fetching GIS map data:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
