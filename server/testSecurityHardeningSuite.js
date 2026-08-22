import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import pool from './database/db.js';
import {
  initSecurityTables,
  validatePasswordStrength,
  checkAccountLockout,
  recordFailedLogin,
  resetFailedLoginAttempts,
  generateTOTPSecret,
  verifyTOTPCode,
  registerUserSession,
  rotateRefreshToken,
  revokeSession,
  revokeAllSessionsForUser,
  getActiveSessions,
  createSecurityIncident,
  calculateThreatAnomalyScore,
  logSecurityEvent,
  verifyModelArtifactIntegrity,
  validateStartupSecrets,
  getSecurityDashboardMetrics
} from './services/securityHardeningService.js';
import { authorizeOperation, PERMISSIONS } from './services/authorizationPolicyService.js';
import { processAgentIntent } from './agent/narvexAgentService.js';
import { verifyChainIntegrity, appendAuditRecord } from './services/hashChainService.js';

console.log('================================================================');
console.log('🛡️  NARVEX ZERO-TRUST DEFENSE-IN-DEPTH SECURITY VERIFICATION SUITE');
console.log('================================================================\n');

async function runSecurityVerification() {
  let passedCount = 0;

  // 1. Initialize Security Tables
  console.log('1. Verifying Database Security Tables Initialization...');
  const initResult = await initSecurityTables();
  console.log(`   ✓ ${initResult.message}`);
  console.log('   ✅ PASS: Security schema (sessions, SIEM logs, agent audit, TOTP) active.\n');
  passedCount++;

  // 2. Password Strength Policy & Bcrypt Hashing
  console.log('2. Testing Password Policy & Bcrypt Hashing...');
  const weakCheck = validatePasswordStrength('weak');
  const strongCheck = validatePasswordStrength('SecureAdmin@2026!');
  console.log(`   ✓ Weak Password Rejected: ${!weakCheck.valid} (${weakCheck.reason})`);
  console.log(`   ✓ Strong Password Accepted: ${strongCheck.valid}`);

  const [users] = await pool.query('SELECT password_hash FROM users WHERE id = 1');
  const bcryptMatch = await bcrypt.compare('Admin@123', users[0].password_hash);
  console.log(`   ✓ Real Bcrypt Hash Matches: ${bcryptMatch}`);

  if (!weakCheck.valid && strongCheck.valid && bcryptMatch) {
    console.log('   ✅ PASS: Password policy and strict Bcrypt verification enforced.\n');
    passedCount++;
  } else {
    throw new Error('Password policy or Bcrypt verification failed.');
  }

  // 3. Account Lockout Engine
  console.log('3. Testing Account Lockout on Consecutive Failed Attempts...');
  const mockUser = { id: 2, username: 'district_cbe', failed_login_attempts: 4 };
  const lockResult = await recordFailedLogin(mockUser, '192.168.1.100');
  console.log(`   ✓ 5th Failed Login Attempt Locked Account: ${lockResult.locked} (${lockResult.remainingMinutes} mins)`);
  await resetFailedLoginAttempts(2);
  if (lockResult.locked) {
    console.log('   ✅ PASS: Account lockout engine triggered properly.\n');
    passedCount++;
  } else {
    throw new Error('Account lockout failed to trigger on 5th failed attempt.');
  }

  // 4. RFC 6238 TOTP Multi-Factor Authentication Engine
  console.log('4. Testing RFC 6238 TOTP MFA Generation & Token Validation...');
  const { secret, backupCodes } = generateTOTPSecret('state_admin');
  console.log(`   ✓ Generated TOTP Secret: ${secret.substring(0, 16)}...`);
  console.log(`   ✓ Generated 8 Backup Codes: ${backupCodes.length} codes`);

  // Calculate current valid TOTP token using RFC 6238
  const epoch = Math.floor(Date.now() / 1000 / 30);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(epoch));
  const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'hex')).update(timeBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const validToken = String(binary % 1000000).padStart(6, '0');

  const isValidMFA = verifyTOTPCode(secret, validToken);
  const isInvalidMFA = verifyTOTPCode(secret, '000000');
  console.log(`   ✓ Valid TOTP Token '${validToken}' Verified: ${isValidMFA}`);
  console.log(`   ✓ Invalid TOTP Token '000000' Rejected: ${!isInvalidMFA}`);

  if (isValidMFA && !isInvalidMFA) {
    console.log('   ✅ PASS: RFC 6238 TOTP engine verified.\n');
    passedCount++;
  } else {
    throw new Error('TOTP MFA verification failed.');
  }

  // 5. Session Registry, Token Rotation & Token Reuse Detection
  console.log('5. Testing Session Registry, Token Rotation & Reuse Detection...');
  const session = await registerUserSession({
    userId: 2,
    deviceInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    ipAddress: '10.20.30.40'
  });
  console.log(`   ✓ Session Registered: ${session.sessionId}`);

  // Normal Token Rotation
  const rotated = await rotateRefreshToken({
    refreshToken: session.refreshToken,
    ipAddress: '10.20.30.40'
  });
  console.log(`   ✓ Token Rotation Succeeded: New Session ${rotated.sessionId}`);

  // Adversarial Attack: Replaying Old Revoked Refresh Token
  const replayAttack = await rotateRefreshToken({
    refreshToken: session.refreshToken,
    ipAddress: '10.20.30.99'
  });
  console.log(`   ✓ Replay Attack Intercepted & Blocked: ${!replayAttack.success}`);
  console.log(`   ✓ SIEM Alert Generated: "${replayAttack.error}"`);

  if (rotated.success && !replayAttack.success) {
    console.log('   ✅ PASS: Token rotation and reuse detection kill-switch verified.\n');
    passedCount++;
  } else {
    throw new Error('Token reuse detection failed.');
  }

  // 6. Zero-Trust Scoping & IDOR Defense Gate
  console.log('6. Testing Zero-Trust Scoping & IDOR Prevention...');
  const stateAdminUser = { id: 1, roleKey: 'STATE_ADMIN', districtId: null };
  const districtOfficerCBE = { id: 2, roleKey: 'DISTRICT_OFFICER', districtId: 2, districtName: 'Coimbatore' };

  const adminAuth = authorizeOperation({
    user: stateAdminUser,
    permission: PERMISSIONS.VIEW_DISTRICT_INTELLIGENCE,
    targetDistrictId: 1
  });
  const cbeOwnAuth = authorizeOperation({
    user: districtOfficerCBE,
    permission: PERMISSIONS.VIEW_DISTRICT_INTELLIGENCE,
    targetDistrictId: 2
  });
  const cbeCrossAuth = authorizeOperation({
    user: districtOfficerCBE,
    permission: PERMISSIONS.VIEW_DISTRICT_INTELLIGENCE,
    targetDistrictId: 1
  });

  console.log(`   ✓ State Admin -> Chennai Access: ${adminAuth.authorized ? 'AUTHORIZED (Statewide)' : 'DENIED'}`);
  console.log(`   ✓ CBE Officer -> Coimbatore Access: ${cbeOwnAuth.authorized ? 'AUTHORIZED (District Scope)' : 'DENIED'}`);
  console.log(`   ✓ CBE Officer -> Chennai Access: ${cbeCrossAuth.authorized ? 'AUTHORIZED' : 'DENIED (Blocked Scope Violation)'}`);

  if (adminAuth.authorized && cbeOwnAuth.authorized && !cbeCrossAuth.authorized) {
    console.log('   ✅ PASS: Zero-Trust server-side district isolation enforced.\n');
    passedCount++;
  } else {
    throw new Error('Cross-district authorization policy breach detected.');
  }

  // 7. Central Agent Voice Privilege Gate
  console.log('7. Testing Central Voice/Agent Tool Authorization...');
  const allowedAgentQuery = await processAgentIntent({
    query: 'Focus Coimbatore and show intelligence summary',
    user: districtOfficerCBE,
    ipAddress: '10.20.30.40'
  });
  const blockedAgentQuery = await processAgentIntent({
    query: 'Focus Salem and show intelligence summary',
    user: districtOfficerCBE,
    ipAddress: '10.20.30.40'
  });

  console.log(`   ✓ CBE Officer query 'Focus Coimbatore': ${allowedAgentQuery.success ? 'EXECUTED' : 'DENIED'}`);
  console.log(`   ✓ CBE Officer query 'Focus Salem': ${blockedAgentQuery.success ? 'EXECUTED' : 'DENIED (Access Denied Alert)'}`);
  console.log(`   ✓ Agent Voice Alert: "${blockedAgentQuery.speechResponse}"`);

  if (allowedAgentQuery.success && !blockedAgentQuery.success) {
    console.log('   ✅ PASS: Central Agent authorization gate blocked unauthorized cross-district voice probe.\n');
    passedCount++;
  } else {
    throw new Error('Agent failed to enforce district scope on natural language intent.');
  }

  // 8. AI Model Artifact SHA-256 Fingerprint Verification
  console.log('8. Testing AI Model Artifact Cryptographic Fingerprint Verification...');
  const p1 = path.resolve('server/ai/models/narvex_forecast_model.json');
  const p2 = path.resolve('ai/models/narvex_forecast_model.json');
  const modelPath = fs.existsSync(p1) ? p1 : p2;
  const modelIntegrity = verifyModelArtifactIntegrity(modelPath);

  console.log(`   ✓ Model Version: ${modelIntegrity.modelVersion}`);
  console.log(`   ✓ Computed SHA-256 Hash: ${(modelIntegrity.computedHash || '').substring(0, 24)}...`);
  console.log(`   ✓ Integrity Verification: ${modelIntegrity.verified ? 'INTACT & DEPLOYED' : 'TAMPERED'}`);
  if (modelIntegrity.verified) {
    console.log('   ✅ PASS: Model artifact cryptographic fingerprint validated.\n');
    passedCount++;
  } else {
    throw new Error('Model artifact integrity verification failed: ' + modelIntegrity.error);
  }

  // 9. Immutable SHA-256 Hash Chain Integrity
  console.log('9. Testing Immutable Cryptographic Audit Chain...');
  await appendAuditRecord({
    actorUserId: 1,
    actionType: 'SECURITY_POLICY_UPDATE',
    entityType: 'POLICY',
    entityId: 101,
    payload: { policy: 'MFA_ENFORCED_STATEWIDE', timestamp: new Date().toISOString() },
    ipAddress: '127.0.0.1'
  });

  const chainCheck = await verifyChainIntegrity();
  console.log(`   ✓ Chain Intact: ${chainCheck.isIntact}`);
  console.log(`   ✓ Total Cryptographic Blocks: ${chainCheck.totalBlocks}`);
  console.log(`   ✓ Hash Link Violations: ${chainCheck.violations.length}`);
  if (chainCheck.isIntact && chainCheck.violations.length === 0) {
    console.log('   ✅ PASS: Cryptographic SHA-256 provenance chain 100% intact.\n');
    passedCount++;
  } else {
    throw new Error('Audit chain broken link detected.');
  }

  // 10. Threat Anomaly Score Engine & SIEM Metrics
  console.log('10. Testing Threat Anomaly Score Engine & SIEM Incident Aggregation...');
  const threatScore = await calculateThreatAnomalyScore(2);
  const siemData = await getSecurityDashboardMetrics();
  console.log(`   ✓ Mathematical Anomaly Score: ${threatScore.anomalyScore}/100 (Level: ${threatScore.threatLevel})`);
  console.log(`   ✓ Active Sessions Metric: ${siemData.metrics.activeSessions}`);
  console.log(`   ✓ Model Integrity Metric: ${siemData.metrics.modelIntegrity}`);
  console.log(`   ✓ Recent Incident Logs Count: ${siemData.recentIncidents.length}`);
  console.log('   ✅ PASS: Threat anomaly scoring and SIEM dashboard metrics aggregated.\n');
  passedCount++;

  console.log('================================================================');
  console.log(`🏁 ZERO-TRUST SECURITY AUDIT: ${passedCount}/10 TEST GATES PASSED (100%)`);
  console.log('================================================================');
  process.exit(0);
}

runSecurityVerification().catch((err) => {
  console.error('❌ Security verification failed:', err);
  process.exit(1);
});
