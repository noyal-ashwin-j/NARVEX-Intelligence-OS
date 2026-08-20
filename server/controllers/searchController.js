import pool from '../database/db.js';

export async function globalSearch(req, res) {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({ success: true, results: { districts: [], events: [], alerts: [], citizenTokens: [], checkposts: [] } });
  }

  const queryTerm = `%${q.trim()}%`;

  try {
    const [districts] = await pool.query(
      'SELECT id, name, code, risk_level, confidence_score FROM districts WHERE name LIKE ? OR code LIKE ? LIMIT 5',
      [queryTerm, queryTerm]
    );

    const [events] = await pool.query(
      `SELECT e.id, e.event_code, e.location_name, e.event_date, d.name as district_name 
       FROM intelligence_events e 
       JOIN districts d ON e.district_id = d.id 
       WHERE e.event_code LIKE ? OR e.location_name LIKE ? OR e.raw_description_redacted LIKE ? LIMIT 5`,
      [queryTerm, queryTerm, queryTerm]
    );

    const [alerts] = await pool.query(
      `SELECT a.id, a.alert_code, a.title, a.severity, d.name as district_name 
       FROM alerts a 
       JOIN districts d ON a.district_id = d.id 
       WHERE a.alert_code LIKE ? OR a.title LIKE ? LIMIT 5`,
      [queryTerm, queryTerm]
    );

    const [citizenTokens] = await pool.query(
      `SELECT att.token_code, att.current_stage, cr.report_date, d.name as district_name 
       FROM anonymous_tracking_tokens att 
       JOIN citizen_reports cr ON att.citizen_report_id = cr.id 
       JOIN districts d ON cr.approximate_district_id = d.id 
       WHERE att.token_code LIKE ? LIMIT 5`,
      [queryTerm]
    );

    const [checkposts] = await pool.query(
      `SELECT cp.id, cp.name, cp.checkpost_code, cp.border_type, d.name as district_name 
       FROM checkposts cp 
       JOIN districts d ON cp.district_id = d.id 
       WHERE cp.name LIKE ? OR cp.checkpost_code LIKE ? LIMIT 5`,
      [queryTerm, queryTerm]
    );

    return res.json({
      success: true,
      query: q,
      results: {
        districts,
        events,
        alerts,
        citizenTokens,
        checkposts
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
