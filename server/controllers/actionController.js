import pool from '../database/db.js';
import { appendAuditRecord } from '../services/hashChainService.js';

/**
 * Get Alerts
 */
export async function getAlerts(req, res) {
  try {
    const { districtId, status = 'ALL', severity, alertType } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (districtId && districtId !== 'ALL') {
      whereClause += ' AND a.district_id = ?';
      params.push(districtId);
    }
    if (status !== 'ALL') {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }
    if (severity && severity !== 'ALL') {
      whereClause += ' AND a.severity = ?';
      params.push(severity);
    }
    if (alertType && alertType !== 'ALL') {
      whereClause += ' AND a.alert_type = ?';
      params.push(alertType);
    }

    const query = `
      SELECT 
        a.*,
        d.name as district_name,
        d.code as district_code,
        t.name as taluk_name,
        u.full_name as assigned_user_name,
        tk.ticket_code,
        tk.verification_status as ticket_status
      FROM alerts a
      JOIN districts d ON a.district_id = d.id
      LEFT JOIN taluks t ON a.taluk_id = t.id
      LEFT JOIN users u ON a.assigned_user_id = u.id
      LEFT JOIN action_tickets tk ON a.id = tk.alert_id
      ${whereClause}
      ORDER BY a.created_at DESC
    `;

    const [alerts] = await pool.query(query, params);

    return res.json({
      success: true,
      total: alerts.length,
      alerts
    });
  } catch (err) {
    console.error('Error fetching alerts:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Create Action Ticket from Alert
 */
export async function createActionTicket(req, res) {
  const { alertId, assignedDepartment, priority = 'MEDIUM', actionType, operationalNotes } = req.body;

  if (!alertId || !assignedDepartment || !actionType) {
    return res.status(400).json({
      success: false,
      message: 'Alert ID, assigned department, and action type are required.'
    });
  }

  try {
    const [alertRows] = await pool.query('SELECT * FROM alerts WHERE id = ?', [alertId]);
    if (alertRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    const ticketCode = `TCK-TN-2026-${Date.now().toString().slice(-4)}`;

    const [result] = await pool.query(
      `INSERT INTO action_tickets 
       (ticket_code, alert_id, assigned_department, assigned_user_id, priority, action_type, verification_status, operational_notes)
       VALUES (?, ?, ?, ?, ?, ?, 'ASSIGNED', ?)`,
      [ticketCode, alertId, assignedDepartment, req.user?.id || null, priority, actionType, operationalNotes || null]
    );

    const ticketId = result.insertId;

    // Update alert status to TICKET_CREATED
    await pool.query("UPDATE alerts SET status = 'TICKET_CREATED', assigned_user_id = ? WHERE id = ?", [
      req.user?.id || null,
      alertId
    ]);

    // Append to Audit Chain
    await appendAuditRecord({
      actorUserId: req.user?.id || null,
      actionType: 'ACTION_TICKET_CREATED',
      entityType: 'ACTION_TICKET',
      entityId: ticketId,
      payload: { ticketCode, alertId, actionType, priority, department: assignedDepartment },
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.status(201).json({
      success: true,
      message: 'Preventive Action Ticket dispatched successfully.',
      ticketId,
      ticketCode
    });
  } catch (err) {
    console.error('Create action ticket error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Get Action Tickets
 */
export async function getActionTickets(req, res) {
  try {
    const { status = 'ALL', priority = 'ALL' } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status !== 'ALL') {
      whereClause += ' AND tk.verification_status = ?';
      params.push(status);
    }
    if (priority !== 'ALL') {
      whereClause += ' AND tk.priority = ?';
      params.push(priority);
    }

    const query = `
      SELECT 
        tk.*,
        a.alert_code,
        a.title as alert_title,
        a.severity as alert_severity,
        a.risk_level as alert_risk,
        d.name as district_name,
        u.full_name as assigned_user_name
      FROM action_tickets tk
      JOIN alerts a ON tk.alert_id = a.id
      JOIN districts d ON a.district_id = d.id
      LEFT JOIN users u ON tk.assigned_user_id = u.id
      ${whereClause}
      ORDER BY tk.created_at DESC
    `;

    const [tickets] = await pool.query(query, params);

    return res.json({
      success: true,
      total: tickets.length,
      tickets
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Update Action Ticket Outcome & Status
 */
export async function updateActionTicket(req, res) {
  const { id } = req.params;
  const { verificationStatus, operationalNotes, outcomeType, outcomeNotes } = req.body;

  try {
    const [ticketRows] = await pool.query('SELECT * FROM action_tickets WHERE id = ?', [id]);
    if (ticketRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const isClosing = verificationStatus === 'CLOSED';

    await pool.query(
      `UPDATE action_tickets 
       SET verification_status = ?, operational_notes = COALESCE(?, operational_notes), 
           outcome_type = COALESCE(?, outcome_type), outcome_notes = COALESCE(?, outcome_notes),
           closed_at = CASE WHEN ? THEN NOW() ELSE closed_at END,
           updated_at = NOW()
       WHERE id = ?`,
      [verificationStatus, operationalNotes, outcomeType, outcomeNotes, isClosing, id]
    );

    // If closed, also update alert to RESOLVED
    if (isClosing) {
      await pool.query("UPDATE alerts SET status = 'RESOLVED' WHERE id = ?", [ticketRows[0].alert_id]);
    }

    // Append to Audit Chain
    await appendAuditRecord({
      actorUserId: req.user?.id || null,
      actionType: 'ACTION_TICKET_UPDATED',
      entityType: 'ACTION_TICKET',
      entityId: id,
      payload: { verificationStatus, outcomeType, outcomeNotes },
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: 'Action ticket updated successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
