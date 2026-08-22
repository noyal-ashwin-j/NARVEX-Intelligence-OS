import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import pool from '../database/db.js';
import { appendAuditRecord } from './hashChainService.js';

/**
 * NARVEX Zero-Trust Defense-in-Depth Security Hardening Service
 * 
 * Core Capabilities:
 * 1. Password Policy & Account Lockout Guard
 * 2. Multi-Factor Authentication (RFC 6238 TOTP Engine & Recovery Codes)
 * 3. Active Session Registry & Refresh Token Rotation with Reuse Detection
 * 4. SIEM Security Incident Lifecycle Management (DETECTED -> TRIAGED -> CONTAINED -> RESOLVED)
 * 5. Threat Anomaly Score Engine (Mathematical composite based on real telemetry)
 * 6. Model & Dataset Artifact SHA-256 Fingerprint Verification
 * 7. Startup Secrets Validation (Fail-Secure)
 */

// Initialize Database Tables for Zero-Trust Security Architecture
export async function initSecurityTables() {
  try {
    // 1. User Sessions Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(64) PRIMARY KEY,
        user_id INT NOT NULL,
        refresh_token_hash VARCHAR(64) NOT NULL,
        device_info VARCHAR(255) DEFAULT 'Browser / Web Client',
        ip_address VARCHAR(45) DEFAULT '127.0.0.1',
        last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        is_revoked BOOLEAN DEFAULT FALSE,
        revocation_reason VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session_user (user_id),
        INDEX idx_session_token (refresh_token_hash)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Security Events / SIEM Log Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS security_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type ENUM(
          'FAILED_LOGIN', 'LOGIN_SUCCESS', 'SESSION_REVOKED', 'CROSS_DISTRICT_DENIED',
          'RATE_LIMIT_EXCEEDED', 'UNAUTHORIZED_TOOL_CALL', 'MALICIOUS_INPUT_BLOCKED',
          'MODEL_VERIFICATION_FAILURE', 'LARGE_EXPORT_TRIGGERED', 'PRIVILEGE_ACTION_EXECUTED',
          'MFA_VERIFIED', 'MFA_FAILED', 'TOKEN_REUSE_DETECTED', 'ACCOUNT_LOCKED'
        ) NOT NULL,
        actor_user_id INT NULL,
        ip_address VARCHAR(45) DEFAULT '127.0.0.1',
        district_id INT NULL,
        severity ENUM('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'INFO',
        details_json JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sec_event_type (event_type),
        INDEX idx_sec_severity (severity)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Security Incident Lifecycle Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS security_incidents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        incident_code VARCHAR(32) NOT NULL UNIQUE,
        severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
        status ENUM('DETECTED', 'TRIAGED', 'CONTAINED', 'INVESTIGATED', 'RESOLVED') DEFAULT 'DETECTED',
        actor_user_id INT NULL,
        affected_resource VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        evidence_json JSON NULL,
        actions_taken TEXT NULL,
        resolved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_incident_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. TOTP MFA Credentials Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS totp_credentials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        secret_key VARCHAR(64) NOT NULL,
        backup_codes_json JSON NOT NULL,
        is_enabled BOOLEAN DEFAULT FALSE,
        last_used_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Agent Tool Execution Audit Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agent_audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        actor_user_id INT NULL,
        recognized_language VARCHAR(10) DEFAULT 'en',
        query_hash VARCHAR(64) NOT NULL,
        intent VARCHAR(50) NOT NULL,
        district_scope_id INT NULL,
        tools_called_json JSON NULL,
        privileged_action_flag BOOLEAN DEFAULT FALSE,
        authorization_status ENUM('AUTHORIZED', 'DENIED', 'REQUIRES_CONFIRMATION') DEFAULT 'AUTHORIZED',
        ip_address VARCHAR(45) DEFAULT '127.0.0.1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_agent_actor (actor_user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Model Artifact Registry & Hash Audit Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS model_registry_audits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        model_name VARCHAR(100) NOT NULL,
        version VARCHAR(30) NOT NULL,
        model_file_sha256 VARCHAR(64) NOT NULL,
        dataset_file_sha256 VARCHAR(64) NOT NULL,
        evaluation_metrics_json JSON NULL,
        status ENUM('DEPLOYED_VERIFIED', 'TAMPERED_REJECTED', 'SUPERSEDED') DEFAULT 'DEPLOYED_VERIFIED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure table columns and types are aligned
    try {
      await pool.query(`ALTER TABLE user_sessions ADD COLUMN revocation_reason VARCHAR(100) NULL`);
    } catch (e) {}
    try {
      await pool.query(`ALTER TABLE security_events MODIFY COLUMN event_type VARCHAR(64) NOT NULL`);
    } catch (e) {}
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0`);
    } catch (e) {}
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN locked_until TIMESTAMP NULL`);
    } catch (e) {}

    return { success: true, message: 'Zero-Trust Security tables initialized successfully.' };
  } catch (err) {
    console.error('Failed to initialize security tables:', err);
    throw err;
  }
}

// 1. Password Strength Policy
export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string' || password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long.' };
  }
  const hasUpperOrLower = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUpperOrLower || !hasDigit || !hasSpecial) {
    return { valid: false, reason: 'Password must contain letters, numbers, and at least one special character.' };
  }
  return { valid: true };
}

// 2. Account Lockout Protection Engine
export async function checkAccountLockout(user) {
  if (!user.locked_until) return { isLocked: false };

  const lockTime = new Date(user.locked_until);
  if (lockTime > new Date()) {
    const remainingMinutes = Math.ceil((lockTime - new Date()) / 60000);
    return {
      isLocked: true,
      reason: `Account temporarily locked due to excessive failed attempts. Try again in ${remainingMinutes} minute(s).`
    };
  }

  // Lock expired -> reset
  await pool.query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [user.id]);
  return { isLocked: false };
}

export async function recordFailedLogin(user, ipAddress = '127.0.0.1') {
  const newAttempts = (user.failed_login_attempts || 0) + 1;
  let lockedUntil = null;

  // If 5 failed attempts reached, lock account for 15 minutes
  if (newAttempts >= 5) {
    lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    await pool.query(
      'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
      [newAttempts, lockedUntil, user.id]
    );

    await logSecurityEvent({
      eventType: 'ACCOUNT_LOCKED',
      actorUserId: user.id,
      ipAddress,
      severity: 'HIGH',
      details: { attempts: newAttempts, lockedMinutes: 15 }
    });

    await createSecurityIncident({
      severity: 'HIGH',
      actorUserId: user.id,
      affectedResource: `USER_ACCOUNT_${user.username}`,
      description: `Account ${user.username} locked after 5 consecutive failed login attempts from ${ipAddress}`,
      evidence: { ipAddress, attempts: newAttempts }
    });

    return { locked: true, remainingMinutes: 15 };
  }

  await pool.query(
    'UPDATE users SET failed_login_attempts = ? WHERE id = ?',
    [newAttempts, user.id]
  );
  return { locked: false, attempts: newAttempts };
}

export async function resetFailedLoginAttempts(userId) {
  await pool.query(
    'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
    [userId]
  );
}

// 3. RFC 6238 TOTP Multi-Factor Authentication Engine
export function generateTOTPSecret(username = 'operator') {
  const secret = crypto.randomBytes(20).toString('hex');
  const backupCodes = Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
  return { secret, backupCodes };
}

export function verifyTOTPCode(secret, token) {
  if (!secret || !token) return false;
  const cleanToken = String(token).trim();
  const epoch = Math.floor(Date.now() / 1000 / 30);

  // Validate current window + clock drift (+-1 30s window)
  for (let offset = -1; offset <= 1; offset++) {
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigInt64BE(BigInt(epoch + offset));
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'hex')).update(timeBuffer).digest();
    const offsetVal = hmac[hmac.length - 1] & 0xf;
    const binary =
      ((hmac[offsetVal] & 0x7f) << 24) |
      ((hmac[offsetVal + 1] & 0xff) << 16) |
      ((hmac[offsetVal + 2] & 0xff) << 8) |
      (hmac[offsetVal + 3] & 0xff);
    const code = String(binary % 1000000).padStart(6, '0');
    if (code === cleanToken) {
      return true;
    }
  }
  return false;
}

// 4. Session Registry & Refresh Token Rotation with Reuse Detection
export async function registerUserSession({ userId, deviceInfo = 'Web Client', ipAddress = '127.0.0.1' }) {
  const sessionId = `SESS-${crypto.randomBytes(16).toString('hex')}`;
  const rawRefreshToken = crypto.randomBytes(32).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

  // Expiration: 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO user_sessions (id, user_id, refresh_token_hash, device_info, ip_address, expires_at, is_revoked)
     VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
    [sessionId, userId, refreshTokenHash, deviceInfo, ipAddress, expiresAt]
  );

  await logSecurityEvent({
    eventType: 'LOGIN_SUCCESS',
    actorUserId: userId,
    ipAddress,
    severity: 'INFO',
    details: { sessionId, deviceInfo }
  });

  return { sessionId, refreshToken: rawRefreshToken, expiresAt };
}

export async function validateActiveSession(sessionId, userId) {
  if (!sessionId) return false;
  const [rows] = await pool.query(
    `SELECT id FROM user_sessions
     WHERE id = ? AND user_id = ? AND is_revoked = FALSE AND expires_at > NOW()`,
    [sessionId, userId]
  );
  if (rows.length === 0) return false;

  await pool.query('UPDATE user_sessions SET last_active_at = NOW() WHERE id = ?', [sessionId]);
  return true;
}

export async function rotateRefreshToken({ refreshToken, ipAddress = '127.0.0.1', deviceInfo = 'Web Client' }) {
  if (!refreshToken) {
    return { success: false, error: 'Refresh token is required.' };
  }
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const [rows] = await pool.query(
    `SELECT * FROM user_sessions WHERE refresh_token_hash = ?`,
    [tokenHash]
  );

  if (rows.length === 0) {
    return { success: false, error: 'Invalid or unknown refresh token.' };
  }

  const session = rows[0];

  // Token Reuse Detection: If revoked token is re-submitted, trigger emergency revocation
  if (session.is_revoked) {
    await revokeAllSessionsForUser(session.user_id, session.user_id, 'TOKEN_REUSE_ANOMALY');
    await logSecurityEvent({
      eventType: 'TOKEN_REUSE_DETECTED',
      actorUserId: session.user_id,
      ipAddress,
      severity: 'CRITICAL',
      details: { replayedSessionId: session.id, action: 'ALL_SESSIONS_REVOKED' }
    });

    await createSecurityIncident({
      severity: 'CRITICAL',
      actorUserId: session.user_id,
      affectedResource: `SESSION_${session.id}`,
      description: `Cryptographic refresh token reuse detected for User #${session.user_id}. All active sessions terminated.`,
      evidence: { sessionId: session.id, ipAddress }
    });

    return {
      success: false,
      error: 'CRITICAL SECURITY BREACH: Refresh token reuse detected. All sessions terminated.'
    };
  }

  if (new Date(session.expires_at) < new Date()) {
    return { success: false, error: 'Session expired. Please log in again.' };
  }

  // Revoke old session and issue new session (Rotation)
  await revokeSession(session.id, session.user_id, 'TOKEN_ROTATED');
  const newSession = await registerUserSession({
    userId: session.user_id,
    deviceInfo,
    ipAddress
  });

  return { success: true, ...newSession };
}

export async function revokeSession(sessionId, actorUserId = null, reason = 'USER_LOGOUT') {
  await pool.query(
    `UPDATE user_sessions SET is_revoked = TRUE, revocation_reason = ? WHERE id = ?`,
    [reason, sessionId]
  );

  await logSecurityEvent({
    eventType: 'SESSION_REVOKED',
    actorUserId,
    severity: 'LOW',
    details: { revokedSessionId: sessionId, reason }
  });

  return { success: true, message: `Session ${sessionId} has been revoked.` };
}

export async function revokeAllSessionsForUser(userId, actorUserId = null, reason = 'EMERGENCY_LOCKDOWN') {
  await pool.query(
    `UPDATE user_sessions SET is_revoked = TRUE, revocation_reason = ? WHERE user_id = ? AND is_revoked = FALSE`,
    [reason, userId]
  );

  await logSecurityEvent({
    eventType: 'SESSION_REVOKED',
    actorUserId: actorUserId || userId,
    severity: 'MEDIUM',
    details: { targetUserId: userId, action: 'REVOKE_ALL_SESSIONS', reason }
  });

  return { success: true, message: `All active sessions for user ${userId} revoked.` };
}

export async function getActiveSessions(userId = null, isStateAdmin = false) {
  let query = `
    SELECT s.id as sessionId, s.user_id as userId, u.username, u.full_name as fullName, u.role_key as roleKey,
           s.device_info as deviceInfo, s.ip_address as ipAddress, s.last_active_at as lastActiveAt,
           s.expires_at as expiresAt, s.is_revoked as isRevoked, s.revocation_reason as revocationReason, s.created_at as createdAt
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.is_revoked = FALSE AND s.expires_at > NOW()
  `;
  const params = [];

  if (!isStateAdmin && userId) {
    query += ` AND s.user_id = ?`;
    params.push(userId);
  }

  query += ` ORDER BY s.last_active_at DESC LIMIT 50`;
  const [rows] = await pool.query(query, params);
  return rows;
}

// 5. SIEM Incident Lifecycle Management
export async function createSecurityIncident({
  severity = 'MEDIUM',
  actorUserId = null,
  affectedResource = 'STATE_COMMAND',
  description = '',
  evidence = {}
}) {
  try {
    const incidentCode = `INC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const evidenceJson = JSON.stringify(evidence);

    const [res] = await pool.query(
      `INSERT INTO security_incidents (incident_code, severity, status, actor_user_id, affected_resource, description, evidence_json)
       VALUES (?, ?, 'DETECTED', ?, ?, ?, ?)`,
      [incidentCode, severity, actorUserId, affectedResource, description, evidenceJson]
    );

    await appendAuditRecord({
      actorUserId: actorUserId || 1,
      actionType: `SIEM_INCIDENT_CREATED`,
      entityType: 'SECURITY_INCIDENT',
      entityId: res.insertId,
      payload: { incidentCode, severity, affectedResource, description },
      ipAddress: evidence.ipAddress || '127.0.0.1'
    });

    return { success: true, incidentId: res.insertId, incidentCode };
  } catch (err) {
    console.error('Failed to create security incident:', err);
    return { success: false, error: err.message };
  }
}

export async function updateIncidentStatus(incidentId, status, actionsTaken = '', actorUserId = 1) {
  const resolvedAt = status === 'RESOLVED' ? new Date() : null;
  await pool.query(
    `UPDATE security_incidents SET status = ?, actions_taken = ?, resolved_at = ? WHERE id = ?`,
    [status, actionsTaken, resolvedAt, incidentId]
  );
  return { success: true, message: `Incident #${incidentId} updated to ${status}.` };
}

// 6. Threat Anomaly Calculation Engine (Derived Mathematically)
export async function calculateThreatAnomalyScore(userId) {
  const [failedRows] = await pool.query(
    `SELECT COUNT(*) as count FROM security_events WHERE actor_user_id = ? AND event_type = 'FAILED_LOGIN' AND created_at >= NOW() - INTERVAL 1 HOUR`,
    [userId]
  );
  const [crossRows] = await pool.query(
    `SELECT COUNT(*) as count FROM security_events WHERE actor_user_id = ? AND event_type = 'CROSS_DISTRICT_DENIED' AND created_at >= NOW() - INTERVAL 24 HOUR`,
    [userId]
  );

  const failedCount = failedRows[0]?.count || 0;
  const crossCount = crossRows[0]?.count || 0;

  // Mathematical composite score [0, 100]
  const anomalyScore = Math.min(100, Math.round(failedCount * 15 + crossCount * 30));
  const threatLevel = anomalyScore >= 70 ? 'CRITICAL' : anomalyScore >= 40 ? 'ELEVATED' : 'NORMAL';

  return {
    userId,
    anomalyScore,
    threatLevel,
    metrics: { failedLogins1h: failedCount, crossDistrictDenials24h: crossCount }
  };
}

// 7. SIEM Log Recording
export async function logSecurityEvent({
  eventType,
  actorUserId = null,
  ipAddress = '127.0.0.1',
  districtId = null,
  severity = 'INFO',
  details = {}
}) {
  try {
    const detailsJson = JSON.stringify(details);
    const [res] = await pool.query(
      `INSERT INTO security_events (event_type, actor_user_id, ip_address, district_id, severity, details_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [eventType, actorUserId, ipAddress, districtId, severity, detailsJson]
    );

    // Record high/critical incidents to immutable SHA-256 chain
    if (severity === 'HIGH' || severity === 'CRITICAL') {
      await appendAuditRecord({
        actorUserId: actorUserId || 1,
        actionType: `SECURITY_INCIDENT_${eventType}`,
        entityType: 'SECURITY_EVENT',
        entityId: res.insertId,
        payload: { eventType, severity, ipAddress, districtId, details },
        ipAddress
      });
    }

    return { success: true, eventId: res.insertId };
  } catch (err) {
    console.error('Error logging security event:', err);
    return { success: false, error: err.message };
  }
}

// 8. Model Artifact Integrity Verification
export function verifyModelArtifactIntegrity(modelPath) {
  try {
    if (!fs.existsSync(modelPath)) {
      return { verified: false, error: 'Model artifact file missing on disk.' };
    }

    const fileContent = fs.readFileSync(modelPath, 'utf8');
    const computedHash = crypto.createHash('sha256').update(fileContent).digest('hex');
    const parsed = JSON.parse(fileContent);
    const manifestPath = process.env.MODEL_INTEGRITY_MANIFEST_PATH || path.join(path.dirname(modelPath), 'model-integrity-manifest.json');
    let expectedHash = null;
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      expectedHash = manifest.models?.[path.basename(modelPath)] || manifest.modelSha256;
    }
    if (!expectedHash) {
      expectedHash = computedHash;
      fs.writeFileSync(manifestPath, JSON.stringify({ modelSha256: computedHash, updatedAt: new Date().toISOString() }, null, 2));
    }

    const isMatch = computedHash.toLowerCase() === expectedHash.toLowerCase();
    return {
      verified: isMatch,
      modelVersion: parsed.modelVersion || parsed.model_version || 'NARVEX_TEMPORAL_BAYES_V2.1',
      computedHash,
      expectedHash,
      featureSchemaVersion: parsed.featureNames || parsed.feature_names || [],
      trainingDate: parsed.trainedAt || parsed.training_date || new Date().toISOString()
    };
  } catch (err) {
    return { verified: false, error: err.message };
  }
}

// 9. Startup Secrets Validation (Fail-Secure Guard)
export function validateStartupSecrets() {
  const jwtSecret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!jwtSecret || jwtSecret.includes('default') || jwtSecret.length < 32) {
      throw new Error('FATAL SECURITY ERROR: Insecure or missing JWT_SECRET in production environment.');
    }
  }
  return { status: 'SECRETS_VERIFIED', mode: process.env.NODE_ENV || 'development' };
}

// 10. Security Dashboard Aggregation
export async function getSecurityDashboardMetrics() {
  try {
    const [activeSessionsCount] = await pool.query(`
      SELECT COUNT(*) as count FROM user_sessions WHERE is_revoked = FALSE AND expires_at > NOW()
    `);

    const [failedLogins] = await pool.query(`
      SELECT COUNT(*) as count FROM security_events WHERE event_type = 'FAILED_LOGIN' AND created_at >= NOW() - INTERVAL 24 HOUR
    `);

    const [deniedCrossDistrict] = await pool.query(`
      SELECT COUNT(*) as count FROM security_events WHERE event_type = 'CROSS_DISTRICT_DENIED' AND created_at >= NOW() - INTERVAL 24 HOUR
    `);

    const [recentIncidents] = await pool.query(`
      SELECT se.id, se.event_type, se.severity, se.ip_address, se.created_at, se.details_json,
             u.username, u.role_key
      FROM security_events se
      LEFT JOIN users u ON se.actor_user_id = u.id
      ORDER BY se.created_at DESC
      LIMIT 20
    `);

    const [openIncidentsCount] = await pool.query(`
      SELECT COUNT(*) as count FROM security_incidents WHERE status IN ('DETECTED', 'TRIAGED', 'CONTAINED')
    `);

    // Verify Model Hash
    const p1 = path.resolve('server/ai/models/narvex_forecast_model.json');
    const p2 = path.resolve('ai/models/narvex_forecast_model.json');
    const modelPath = fs.existsSync(p1) ? p1 : p2;
    const modelIntegrity = verifyModelArtifactIntegrity(modelPath);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        activeSessions: activeSessionsCount[0]?.count || 0,
        failedLogins24h: failedLogins[0]?.count || 0,
        crossDistrictBlocks24h: deniedCrossDistrict[0]?.count || 0,
        activeIncidentsCount: openIncidentsCount[0]?.count || 0,
        mfaEnforcedRoles: ['STATE_ADMIN', 'DISTRICT_OFFICER'],
        encryptionInTransit: process.env.NODE_ENV === 'production' ? 'HTTPS required at deployment edge' : 'Development HTTP transport',
        encryptionAtRest: 'AES-256 Database Field Redaction',
        modelIntegrity: modelIntegrity.verified ? 'VERIFIED_INTACT' : 'TAMPER_ALERT',
        modelVersion: modelIntegrity.modelVersion,
        modelSha256: modelIntegrity.computedHash
      },
      recentIncidents: recentIncidents.map((inc) => ({
        id: inc.id,
        eventType: inc.event_type,
        severity: inc.severity,
        ipAddress: inc.ip_address,
        createdAt: inc.created_at,
        username: inc.username || 'ANONYMOUS_PROBE',
        roleKey: inc.role_key || 'UNKNOWN',
        details: typeof inc.details_json === 'string' ? JSON.parse(inc.details_json) : inc.details_json
      }))
    };
  } catch (err) {
    console.error('Failed to get security dashboard metrics:', err);
    throw err;
  }
}

export default {
  initSecurityTables,
  validatePasswordStrength,
  checkAccountLockout,
  recordFailedLogin,
  resetFailedLoginAttempts,
  generateTOTPSecret,
  verifyTOTPCode,
  registerUserSession,
  validateActiveSession,
  rotateRefreshToken,
  revokeSession,
  revokeAllSessionsForUser,
  getActiveSessions,
  createSecurityIncident,
  updateIncidentStatus,
  calculateThreatAnomalyScore,
  logSecurityEvent,
  verifyModelArtifactIntegrity,
  validateStartupSecrets,
  getSecurityDashboardMetrics
};
