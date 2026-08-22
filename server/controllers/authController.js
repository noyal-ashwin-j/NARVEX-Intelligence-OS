import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database/db.js';
import { appendAuditRecord } from '../services/hashChainService.js';
import {
  registerUserSession,
  rotateRefreshToken,
  revokeSession,
  revokeAllSessionsForUser,
  getActiveSessions,
  logSecurityEvent,
  checkAccountLockout,
  recordFailedLogin,
  resetFailedLoginAttempts,
  generateTOTPSecret,
  verifyTOTPCode,
  getSecurityDashboardMetrics
} from '../services/securityHardeningService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nrise_state_intel_secure_jwt_key_2026_tamilnadu';

export async function login(req, res) {
  const { username, password, totpCode } = req.body;
  const ipAddress = req.ip || req.headers?.['x-forwarded-for'] || '127.0.0.1';
  const deviceInfo = req.headers?.['user-agent'] || 'Web Client';

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  try {
    const [users] = await pool.query(
      `SELECT u.*, d.name as district_name 
       FROM users u 
       LEFT JOIN districts d ON u.district_id = d.id 
       WHERE u.username = ?`,
      [username]
    );

    if (users.length === 0) {
      await logSecurityEvent({
        eventType: 'FAILED_LOGIN',
        ipAddress,
        severity: 'MEDIUM',
        details: { attemptedUsername: username, reason: 'ACCOUNT_NOT_FOUND' }
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials or unauthorized account.' });
    }

    const user = users[0];

    // 1. Account Lockout Check
    const lockout = await checkAccountLockout(user);
    if (lockout.isLocked) {
      return res.status(423).json({ success: false, message: lockout.reason });
    }

    // 2. Strict Bcrypt Verification (Zero Plaintext Fallbacks)
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      const lockResult = await recordFailedLogin(user, ipAddress);
      await logSecurityEvent({
        eventType: 'FAILED_LOGIN',
        actorUserId: user.id,
        districtId: user.district_id,
        ipAddress,
        severity: 'HIGH',
        details: { username: user.username, reason: 'PASSWORD_MISMATCH', attemptCount: lockResult.attempts }
      });

      if (lockResult.locked) {
        return res.status(423).json({
          success: false,
          message: 'Account locked for 15 minutes due to 5 consecutive failed attempts.'
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // 3. TOTP MFA Challenge (if configured)
    const [totpRows] = await pool.query(
      `SELECT secret_key, is_enabled FROM totp_credentials WHERE user_id = ? AND is_enabled = TRUE`,
      [user.id]
    );

    if (totpRows.length > 0) {
      if (!totpCode) {
        return res.status(200).json({
          success: false,
          mfaRequired: true,
          userId: user.id,
          message: 'MFA TOTP code required to complete authentication.'
        });
      }

      const mfaValid = verifyTOTPCode(totpRows[0].secret_key, totpCode);
      if (!mfaValid) {
        await logSecurityEvent({
          eventType: 'MFA_FAILED',
          actorUserId: user.id,
          ipAddress,
          severity: 'HIGH',
          details: { reason: 'INVALID_TOTP_CODE' }
        });
        return res.status(401).json({ success: false, message: 'Invalid MFA verification code.' });
      }

      await logSecurityEvent({
        eventType: 'MFA_VERIFIED',
        actorUserId: user.id,
        ipAddress,
        severity: 'INFO',
        details: { method: 'TOTP_RFC6238' }
      });
    }

    // Reset only after every required authentication factor has succeeded.
    await resetFailedLoginAttempts(user.id);

    // Update last_login timestamp
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Register session before issuing an access token, so the token can be revoked.
    const session = await registerUserSession({
      userId: user.id,
      deviceInfo,
      ipAddress
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role_key, districtId: user.district_id, sessionId: session.sessionId },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Audit log login in SHA-256 chain
    await appendAuditRecord({
      actorUserId: user.id,
      actionType: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      payload: { username: user.username, role: user.role_key, sessionId: session.sessionId },
      ipAddress
    });

    return res.json({
      success: true,
      token,
      sessionId: session.sessionId,
      refreshToken: session.refreshToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        roleKey: user.role_key,
        districtId: user.district_id,
        districtName: user.district_name,
        department: user.department,
        badgeNumber: user.badge_number
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
}

export async function refreshTokenHandler(req, res) {
  try {
    const { refreshToken } = req.body;
    const ipAddress = req.ip || req.headers?.['x-forwarded-for'] || '127.0.0.1';
    const deviceInfo = req.headers?.['user-agent'] || 'Web Client';

    const result = await rotateRefreshToken({ refreshToken, ipAddress, deviceInfo });
    if (!result.success) {
      return res.status(401).json({ success: false, message: result.error });
    }

    // Generate new JWT
    const [users] = await pool.query(`SELECT * FROM users WHERE id = ?`, [result.userId]);
    const user = users[0];
    const newToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role_key, districtId: user.district_id, sessionId: result.sessionId },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({
      success: true,
      token: newToken,
      sessionId: result.sessionId,
      refreshToken: result.refreshToken
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getCurrentUser(req, res) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  return res.json({ success: true, user: req.user });
}

export async function getSeedAccounts(req, res) {
  try {
    const [users] = await pool.query(
      `SELECT u.username, u.full_name, u.role_key, u.department, u.badge_number, d.name as district_name 
       FROM users u 
       LEFT JOIN districts d ON u.district_id = d.id 
       ORDER BY u.id ASC`
    );
    return res.json({ success: true, accounts: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function logoutUser(req, res) {
  try {
    const sessionId = req.body.sessionId || req.headers['x-session-id'];
    if (sessionId) {
      const [sessions] = await pool.query('SELECT user_id FROM user_sessions WHERE id = ?', [sessionId]);
      if (sessions.length === 0) {
        return res.status(404).json({ success: false, message: 'Session not found.' });
      }
      if (sessions[0].user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'You may only log out your own session.' });
      }
      await revokeSession(sessionId, req.user?.id || null, 'USER_LOGOUT');
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getUserSessions(req, res) {
  try {
    const isStateAdmin = req.user.roleKey === 'STATE_ADMIN';
    const sessions = await getActiveSessions(req.user.id, isStateAdmin);
    return res.json({ success: true, sessions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function revokeSessionHandler(req, res) {
  try {
    const { sessionId } = req.params;
    const [sessions] = await pool.query('SELECT user_id FROM user_sessions WHERE id = ?', [sessionId]);
    if (sessions.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }
    if (req.user.roleKey !== 'STATE_ADMIN' && sessions[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You may only revoke your own sessions.' });
    }
    await revokeSession(sessionId, req.user.id, 'MANUAL_ADMIN_REVOKE');
    return res.json({ success: true, message: 'Session revoked.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function revokeAllUserSessionsHandler(req, res) {
  try {
    const targetUserId = req.params.userId || req.user.id;
    await revokeAllSessionsForUser(targetUserId, req.user.id, 'EMERGENCY_ADMIN_KILL_SWITCH');
    return res.json({ success: true, message: `All sessions revoked for user ${targetUserId}.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function setupTOTPHandler(req, res) {
  try {
    const { secret, backupCodes } = generateTOTPSecret(req.user.username);
    await pool.query(
      `INSERT INTO totp_credentials (user_id, secret_key, backup_codes_json, is_enabled)
       VALUES (?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE secret_key = VALUES(secret_key), backup_codes_json = VALUES(backup_codes_json), is_enabled = TRUE`,
      [req.user.id, secret, JSON.stringify(backupCodes)]
    );

    return res.json({
      success: true,
      secret,
      backupCodes,
      message: 'TOTP Multi-Factor Authentication configured successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getSecurityMetricsHandler(req, res) {
  try {
    const data = await getSecurityDashboardMetrics();
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
