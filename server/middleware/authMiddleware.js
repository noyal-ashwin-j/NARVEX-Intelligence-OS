import jwt from 'jsonwebtoken';
import pool from '../database/db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'nrise_state_intel_secure_jwt_key_2026_tamilnadu';

/**
 * Verify JWT token and attach user profile to request
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token required.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch fresh user record
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.badge_number, u.district_id, u.is_active,
              u.role_key, d.name as district_name, d.code as district_code
       FROM users u
       LEFT JOIN districts d ON u.district_id = d.id
       WHERE u.id = ? AND u.is_active = 1`,
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or user account deactivated.'
      });
    }

    const user = rows[0];
    req.user = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      badgeNumber: user.badge_number,
      roleKey: user.role_key,
      districtId: user.district_id,
      districtName: user.district_name,
      districtCode: user.district_code
    };

    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
}

/**
 * RBAC Guard: Authorize specific roles
 */
export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    if (!allowedRoles.includes(req.user.roleKey)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.roleKey}' is not authorized for this operation.`
      });
    }

    next();
  };
}

/**
 * Enforce District Officer Scoping on Data Queries
 * Blocks cross-district access and auto-injects assigned districtId
 */
export function enforceDistrictScope(req, res, next) {
  if (!req.user) return next();

  // CITIZEN_REPORTER has zero access to intelligence endpoints
  if (req.user.roleKey === 'CITIZEN_REPORTER') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Citizen accounts do not have access to intelligence data.'
    });
  }

  // DISTRICT_OFFICER must be strictly locked to their assigned district
  if (req.user.roleKey === 'DISTRICT_OFFICER') {
    const userDistrictId = String(req.user.districtId);

    // If query specifies a different district, block with 403
    if (req.query.districtId && req.query.districtId !== 'ALL' && String(req.query.districtId) !== userDistrictId) {
      return res.status(403).json({
        success: false,
        message: `Access Forbidden: District Officer is restricted to assigned district (${req.user.districtName || userDistrictId}).`
      });
    }

    // If route parameter :id specifies a different district (e.g. GET /districts/:id)
    if (req.params.id && String(req.params.id) !== userDistrictId && (req.baseUrl || '').includes('districts')) {
      return res.status(403).json({
        success: false,
        message: `Access Forbidden: You are not authorized to access data for district #${req.params.id}.`
      });
    }

    // Force districtId to officer's district
    req.query.districtId = userDistrictId;
  }

  next();
}
