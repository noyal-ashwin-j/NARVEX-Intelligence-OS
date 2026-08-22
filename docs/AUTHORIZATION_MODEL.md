# NARVEX — Authorization & Access Control Model

## 1. Role-to-Permission Mapping Matrix

| Capability / Resource | STATE_ADMIN | DISTRICT_OFFICER | VERIFICATION_OFFICER | CITIZEN_REPORTER |
|---|---|---|---|---|
| Statewide Command Center | ✅ Full | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| Assigned District Intelligence | ✅ Full | ✅ Scoped (Own District) | ✅ Scoped | ❌ Blocked |
| Cross-District Intelligence | ✅ Full | ❌ 403 Forbidden | ❌ Blocked | ❌ Blocked |
| Citizen Triage & Queue | ✅ Full | ✅ District Scope | ✅ Full | ❌ Blocked |
| Action Ticket Creation | ✅ Full | ✅ District Scope | ❌ Blocked | ❌ Blocked |
| What-If Scenario Simulator | ✅ Full | ✅ District Scope | ❌ Blocked | ❌ Blocked |
| Executive Briefing PDF | ✅ Full | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| SHA-256 Audit Trail | ✅ Full | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| Security Command Center | ✅ Full | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| Anonymous Report Submission | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Token Status Lookup | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
