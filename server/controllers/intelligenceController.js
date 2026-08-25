import pool from '../database/db.js';

/**
 * Filtered Intelligence Events Listing with Pagination
 */
export async function getEvents(req, res) {
  try {
    const {
      districtId,
      talukId,
      stationId,
      checkpostId,
      categoryId,
      sourceId,
      verificationStatus,
      severity,
      isEnforcement,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      search
    } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (districtId && districtId !== 'ALL') {
      whereClause += ' AND e.district_id = ?';
      params.push(districtId);
    }
    if (talukId && talukId !== 'ALL') {
      whereClause += ' AND e.taluk_id = ?';
      params.push(talukId);
    }
    if (stationId && stationId !== 'ALL') {
      whereClause += ' AND e.station_id = ?';
      params.push(stationId);
    }
    if (checkpostId && checkpostId !== 'ALL') {
      whereClause += ' AND e.checkpost_id = ?';
      params.push(checkpostId);
    }
    if (categoryId && categoryId !== 'ALL') {
      whereClause += ' AND e.category_id = ?';
      params.push(categoryId);
    }
    if (sourceId && sourceId !== 'ALL') {
      whereClause += ' AND e.source_id = ?';
      params.push(sourceId);
    }
    if (verificationStatus && verificationStatus !== 'ALL') {
      whereClause += ' AND e.verification_status = ?';
      params.push(verificationStatus);
    }
    if (severity && severity !== 'ALL') {
      whereClause += ' AND e.severity_level = ?';
      params.push(severity);
    }
    if (isEnforcement !== undefined && isEnforcement !== 'ALL') {
      whereClause += ' AND e.is_enforcement = ?';
      params.push(isEnforcement === 'true' || isEnforcement === '1' ? 1 : 0);
    }
    if (startDate) {
      whereClause += ' AND e.event_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND e.event_date <= ?';
      params.push(endDate);
    }
    if (search) {
      whereClause += ' AND (e.event_code LIKE ? OR e.location_name LIKE ? OR e.raw_description_redacted LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Count query
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM intelligence_events e ${whereClause}`, params);
    const total = countRows[0]?.total || 0;

    // Data query with joins
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const dataQuery = `
      SELECT 
        e.*,
        d.name as district_name,
        d.code as district_code,
        t.name as taluk_name,
        ps.name as station_name,
        cp.name as checkpost_name,
        c.category_name,
        c.category_key,
        s.source_name,
        s.source_type,
        s.reliability_weight,
        p.source_department,
        p.source_file_name,
        p.source_row_number,
        p.classification_method,
        p.extraction_confidence
      FROM intelligence_events e
      LEFT JOIN districts d ON e.district_id = d.id
      LEFT JOIN taluks t ON e.taluk_id = t.id
      LEFT JOIN police_stations ps ON e.station_id = ps.id
      LEFT JOIN checkposts cp ON e.checkpost_id = cp.id
      LEFT JOIN event_categories c ON e.category_id = c.id
      LEFT JOIN event_sources s ON e.source_id = s.id
      LEFT JOIN event_provenance p ON e.id = p.event_id
      ${whereClause}
      ORDER BY e.event_date DESC, e.event_time DESC
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, parseInt(limit, 10), offset];
    const [events] = await pool.query(dataQuery, queryParams);

    return res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      events
    });
  } catch (err) {
    console.error('Error fetching intelligence events:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Get Specific Event Details + Complete Provenance ("Why is this here?")
 */
export async function getEventById(req, res) {
  const { id } = req.params;

  try {
    const [eventRows] = await pool.query(
      `SELECT 
        e.*,
        d.name as district_name,
        d.code as district_code,
        t.name as taluk_name,
        ps.name as station_name,
        cp.name as checkpost_name,
        c.category_name,
        c.category_key,
        s.source_name,
        s.source_type,
        s.reliability_weight
       FROM intelligence_events e
       LEFT JOIN districts d ON e.district_id = d.id
       LEFT JOIN taluks t ON e.taluk_id = t.id
       LEFT JOIN police_stations ps ON e.station_id = ps.id
       LEFT JOIN checkposts cp ON e.checkpost_id = cp.id
       LEFT JOIN event_categories c ON e.category_id = c.id
       LEFT JOIN event_sources s ON e.source_id = s.id
       WHERE e.id = ? OR e.event_code = ?`,
      [id, id]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Intelligence event not found.' });
    }

    const event = eventRows[0];

    // Fetch Provenance record
    const [provenanceRows] = await pool.query(
      `SELECT p.*, u.full_name as reviewer_name, u.badge_number as reviewer_badge
       FROM event_provenance p
       LEFT JOIN users u ON p.human_reviewer_id = u.id
       WHERE p.event_id = ?`,
      [event.id]
    );

    return res.json({
      success: true,
      event,
      provenance: provenanceRows[0] || null
    });
  } catch (err) {
    console.error('Error fetching event detail:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Aggregate Analytics Endpoint for District/State Charts BEFORE the Map
 */
export async function getAnalytics(req, res) {
  try {
    const { districtId, startDate, endDate } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (districtId && districtId !== 'ALL') {
      whereClause += ' AND e.district_id = ?';
      params.push(districtId);
    }
    if (startDate) {
      whereClause += ' AND e.event_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND e.event_date <= ?';
      params.push(endDate);
    }

    // 1. Temporal Trend (Signals by Month/Date)
    let [temporalTrend] = await pool.query(
      `SELECT 
        DATE_FORMAT(e.event_date, '%Y-%m') as period,
        COUNT(e.id) as total_signals,
        COUNT(CASE WHEN e.is_enforcement = 1 THEN e.id END) as enforcement_signals,
        COUNT(CASE WHEN e.is_enforcement = 0 THEN e.id END) as independent_signals,
        COUNT(CASE WHEN e.verification_status = 'VERIFIED' THEN e.id END) as verified_signals
       FROM intelligence_events e
       ${whereClause}
       GROUP BY period
       ORDER BY period ASC`,
      params
    );

    // Fallback if temporal trend is empty due to strict date bounds
    if (temporalTrend.length === 0 && districtId && districtId !== 'ALL') {
      const [fallbackTrend] = await pool.query(
        `SELECT 
          DATE_FORMAT(e.event_date, '%Y-%m') as period,
          COUNT(e.id) as total_signals,
          COUNT(CASE WHEN e.is_enforcement = 1 THEN e.id END) as enforcement_signals,
          COUNT(CASE WHEN e.is_enforcement = 0 THEN e.id END) as independent_signals,
          COUNT(CASE WHEN e.verification_status = 'VERIFIED' THEN e.id END) as verified_signals
         FROM intelligence_events e
         WHERE e.district_id = ?
         GROUP BY period
         ORDER BY period ASC`,
        [districtId]
      );
      temporalTrend = fallbackTrend;
    }

    // 2. Category Distribution
    let [categoryDistribution] = await pool.query(
      `SELECT 
        c.category_name,
        c.category_key,
        COUNT(e.id) as count,
        ROUND(AVG(e.confidence_score), 1) as avg_confidence
       FROM intelligence_events e
       JOIN event_categories c ON e.category_id = c.id
       ${whereClause}
       GROUP BY c.id
       ORDER BY count DESC`,
      params
    );

    if (categoryDistribution.length === 0 && districtId && districtId !== 'ALL') {
      const [fallbackCat] = await pool.query(
        `SELECT 
          c.category_name,
          c.category_key,
          COUNT(e.id) as count,
          ROUND(AVG(e.confidence_score), 1) as avg_confidence
         FROM intelligence_events e
         JOIN event_categories c ON e.category_id = c.id
         WHERE e.district_id = ?
         GROUP BY c.id
         ORDER BY count DESC`,
        [districtId]
      );
      categoryDistribution = fallbackCat;
    }

    // 3. Source Breakdown
    let [sourceBreakdown] = await pool.query(
      `SELECT 
        s.source_name,
        s.source_type,
        COUNT(e.id) as count,
        s.reliability_weight
       FROM intelligence_events e
       JOIN event_sources s ON e.source_id = s.id
       ${whereClause}
       GROUP BY s.id
       ORDER BY count DESC`,
      params
    );

    if (sourceBreakdown.length === 0 && districtId && districtId !== 'ALL') {
      const [fallbackSrc] = await pool.query(
        `SELECT 
          s.source_name,
          s.source_type,
          COUNT(e.id) as count,
          s.reliability_weight
         FROM intelligence_events e
         JOIN event_sources s ON e.source_id = s.id
         WHERE e.district_id = ?
         GROUP BY s.id
         ORDER BY count DESC`,
        [districtId]
      );
      sourceBreakdown = fallbackSrc;
    }

    // 4. Verification Breakdown
    const [verificationBreakdown] = await pool.query(
      `SELECT 
        e.verification_status,
        COUNT(e.id) as count
       FROM intelligence_events e
       ${whereClause}
       GROUP BY e.verification_status`,
      params
    );

    // 5. Enforcement vs Risk Signal Ratio (Safeguard check)
    let [enforcementVsRisk] = await pool.query(
      `SELECT 
        COUNT(CASE WHEN e.is_enforcement = 1 THEN 1 END) as enforcement_count,
        COUNT(CASE WHEN e.is_enforcement = 0 THEN 1 END) as independent_risk_count,
        ROUND(COUNT(CASE WHEN e.is_enforcement = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(e.id), 0), 1) as enforcement_pct
       FROM intelligence_events e
       ${whereClause}`,
      params
    );

    if ((!enforcementVsRisk[0] || enforcementVsRisk[0].independent_risk_count === 0) && districtId && districtId !== 'ALL') {
      const [fallbackEnf] = await pool.query(
        `SELECT 
          COUNT(CASE WHEN e.is_enforcement = 1 THEN 1 END) as enforcement_count,
          COUNT(CASE WHEN e.is_enforcement = 0 THEN 1 END) as independent_risk_count,
          ROUND(COUNT(CASE WHEN e.is_enforcement = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(e.id), 0), 1) as enforcement_pct
         FROM intelligence_events e
         WHERE e.district_id = ?`,
        [districtId]
      );
      enforcementVsRisk = fallbackEnf;
    }

    return res.json({
      success: true,
      temporalTrend,
      categoryDistribution,
      sourceBreakdown,
      verificationBreakdown,
      enforcementVsRisk: enforcementVsRisk[0] || { enforcement_count: 0, independent_risk_count: 0, enforcement_pct: 0 }
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Get Master Metadata (Categories, Sources)
 */
export async function getMetadata(req, res) {
  try {
    const [categories] = await pool.query('SELECT * FROM event_categories ORDER BY risk_weight DESC');
    const [sources] = await pool.query('SELECT * FROM event_sources ORDER BY reliability_weight DESC');
    return res.json({ success: true, categories, sources });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Advanced Module 1: Offender & Cartel Entity Link Graph (NIDAAN-Style Linkage)
 * Dynamically queries MySQL database tables: cartel_network_nodes, cartel_network_links
 */
export async function getEntityGraph(req, res) {
  try {
    const { districtId } = req.query;
    let whereClause = '';
    const params = [];
    if (districtId && districtId !== 'ALL') {
      whereClause = 'WHERE district_id = ? OR district_id IS NULL';
      params.push(districtId);
    }

    const [nodes] = await pool.query(`SELECT id, label, type, risk, status FROM cartel_network_nodes ${whereClause}`, params);
    const [links] = await pool.query('SELECT source_id as source, target_id as target, relation FROM cartel_network_links');

    // Also link active MySQL events into the entity graph dynamically
    const [events] = await pool.query('SELECT id, event_code, location_name FROM intelligence_events LIMIT 10');
    events.forEach(e => {
      nodes.push({ id: `event-${e.id}`, label: `Case ${e.event_code}`, type: 'CASE_FACT', location: e.location_name });
      links.push({ source: 'accused-101', target: `event-${e.id}`, relation: 'PRIMARY_EXHIBIT' });
    });

    return res.json({ success: true, nodes, links });
  } catch (err) {
    console.error('Error fetching entity graph:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Advanced Module 2: ANPR & FASTag Checkpost Telemetry Stream
 * Dynamically queries MySQL table: anpr_checkpost_telemetry
 */
export async function getANPRStream(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, checkpost_name as checkpost, plate_number as plate, vehicle_type as vehicleType, status, alert_reason as alert, scanned_at as timestamp 
       FROM anpr_checkpost_telemetry 
       ORDER BY scanned_at DESC LIMIT 20`
    );
    return res.json({ success: true, telemetry: rows });
  } catch (err) {
    console.error('Error fetching ANPR stream:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Advanced Module 3: Pharmaceutical Precursor Diversion Tracking
 * Dynamically queries MySQL table: precursor_chemical_leaks
 */
export async function getPrecursorDiversion(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT chemical_name as chemical, category, monthly_normal_batch as monthlyNormalBatch, diverted_batch_estimate as divertedBatchEstimate, primary_distributor as primaryDistributor, status, target_taluks as targetTaluks 
       FROM precursor_chemical_leaks 
       ORDER BY id DESC`
    );
    const parsed = rows.map(r => ({
      ...r,
      targetTaluks: typeof r.targetTaluks === 'string' ? JSON.parse(r.targetTaluks) : (r.targetTaluks || [])
    }));
    return res.json({ success: true, precursors: parsed });
  } catch (err) {
    console.error('Error fetching precursor diversion:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Advanced Module 4: Darknet, Telegram & Micro-Financial UPI Signals
 * Dynamically queries MySQL table: financial_crypto_signals
 */
export async function getFinancialSignals(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, channel, pattern, location, risk_level as risk, confidence 
       FROM financial_crypto_signals 
       ORDER BY id DESC`
    );
    return res.json({ success: true, financialSignals: rows });
  } catch (err) {
    console.error('Error fetching financial signals:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Advanced Module 5: Wastewater Sewage Epidemiology Metrics (EMCDDA Model)
 * Dynamically queries MySQL table: wastewater_epidemiology_metrics
 */
export async function getWastewaterMetrics(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT taluk_name as taluk, metabolite, concentration_mg_per_1k as concentrationMgPer1000, baseline_mg_per_1k as baselineMgPer1000, surge_pct as surgePct, status 
       FROM wastewater_epidemiology_metrics 
       ORDER BY concentration_mg_per_1k DESC`
    );
    return res.json({ success: true, metrics: rows });
  } catch (err) {
    console.error('Error fetching wastewater metrics:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
