import pool from '../database/db.js';
import { verifyChainIntegrity } from '../services/hashChainService.js';

export async function getAuditLogs(req, res) {
  try {
    const { actionType, page = 1, limit = 25 } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (actionType && actionType !== 'ALL') {
      whereClause += ' AND a.action_type = ?';
      params.push(actionType);
    }

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM audit_hash_chain a ${whereClause}`, params);
    const total = countRows[0]?.total || 0;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [logs] = await pool.query(
      `SELECT 
        a.*,
        u.username as actor_username,
        u.full_name as actor_name,
        u.role_key as actor_role
       FROM audit_hash_chain a
       LEFT JOIN users u ON a.actor_user_id = u.id
       ${whereClause}
       ORDER BY a.sequence_num DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    return res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      logs
    });
  } catch (err) {
    console.error('Audit logs fetch error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function testChainIntegrity(req, res) {
  try {
    const result = await verifyChainIntegrity();
    return res.json({
      success: true,
      integrity: result
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
