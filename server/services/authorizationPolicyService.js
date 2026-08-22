/**
 * NARVEX Centralized Authorization Policy Service
 * 
 * Enforces Zero-Trust Attribute-Based & Role-Based Access Control (ABAC/RBAC).
 * Evaluates (Actor, Action, Resource, District Scope, Environment Context).
 */

export const PERMISSIONS = {
  VIEW_STATEWIDE_INTELLIGENCE: 'VIEW_STATEWIDE_INTELLIGENCE',
  VIEW_DISTRICT_INTELLIGENCE: 'VIEW_DISTRICT_INTELLIGENCE',
  TRIAGE_CITIZEN_QUEUE: 'TRIAGE_CITIZEN_QUEUE',
  CREATE_ACTION_TICKET: 'CREATE_ACTION_TICKET',
  UPDATE_ACTION_TICKET: 'UPDATE_ACTION_TICKET',
  RUN_SCENARIO_SIMULATION: 'RUN_SCENARIO_SIMULATION',
  GENERATE_EXECUTIVE_BRIEFING: 'GENERATE_EXECUTIVE_BRIEFING',
  VIEW_CRYPTOGRAPHIC_AUDIT: 'VIEW_CRYPTOGRAPHIC_AUDIT',
  MANAGE_SECURITY_POLICIES: 'MANAGE_SECURITY_POLICIES',
  INGEST_INTELLIGENCE_FEEDS: 'INGEST_INTELLIGENCE_FEEDS',
  EXECUTE_PRIVILEGED_VOICE_TOOL: 'EXECUTE_PRIVILEGED_VOICE_TOOL'
};

export const ROLE_POLICY_MAP = {
  STATE_ADMIN: [
    PERMISSIONS.VIEW_STATEWIDE_INTELLIGENCE,
    PERMISSIONS.VIEW_DISTRICT_INTELLIGENCE,
    PERMISSIONS.TRIAGE_CITIZEN_QUEUE,
    PERMISSIONS.CREATE_ACTION_TICKET,
    PERMISSIONS.UPDATE_ACTION_TICKET,
    PERMISSIONS.RUN_SCENARIO_SIMULATION,
    PERMISSIONS.GENERATE_EXECUTIVE_BRIEFING,
    PERMISSIONS.VIEW_CRYPTOGRAPHIC_AUDIT,
    PERMISSIONS.MANAGE_SECURITY_POLICIES,
    PERMISSIONS.INGEST_INTELLIGENCE_FEEDS,
    PERMISSIONS.EXECUTE_PRIVILEGED_VOICE_TOOL
  ],
  DISTRICT_OFFICER: [
    PERMISSIONS.VIEW_DISTRICT_INTELLIGENCE,
    PERMISSIONS.TRIAGE_CITIZEN_QUEUE,
    PERMISSIONS.CREATE_ACTION_TICKET,
    PERMISSIONS.UPDATE_ACTION_TICKET,
    PERMISSIONS.RUN_SCENARIO_SIMULATION
  ],
  VERIFICATION_OFFICER: [
    PERMISSIONS.VIEW_DISTRICT_INTELLIGENCE,
    PERMISSIONS.TRIAGE_CITIZEN_QUEUE,
    PERMISSIONS.UPDATE_ACTION_TICKET
  ],
  CITIZEN_REPORTER: []
};

/**
 * Authorize an operation based on user role and target district scope
 */
export function authorizeOperation({ user, permission, targetDistrictId = null }) {
  if (!user || !user.roleKey) {
    return { authorized: false, reason: 'UNAUTHENTICATED_ACCESS' };
  }

  const rolePermissions = ROLE_POLICY_MAP[user.roleKey] || [];
  if (!rolePermissions.includes(permission)) {
    return {
      authorized: false,
      reason: `ROLE_PERMISSION_DENIED: Role '${user.roleKey}' lacks '${permission}' capability.`
    };
  }

  // Statewide Admin bypasses single-district scoping
  if (user.roleKey === 'STATE_ADMIN') {
    return { authorized: true, scope: 'STATEWIDE' };
  }

  // District Officer Scoping Check
  if (targetDistrictId && targetDistrictId !== 'ALL') {
    const requestedId = parseInt(targetDistrictId, 10);
    const assignedId = parseInt(user.districtId, 10);

    if (requestedId !== assignedId) {
      return {
        authorized: false,
        reason: `DISTRICT_SCOPE_VIOLATION: Officer assigned to District #${assignedId} is forbidden from accessing District #${requestedId}.`
      };
    }
  }

  return { authorized: true, scope: `DISTRICT_${user.districtId}` };
}

export default {
  PERMISSIONS,
  ROLE_POLICY_MAP,
  authorizeOperation
};
