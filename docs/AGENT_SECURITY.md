# NARVEX — Central Agent & Voice Security Envelope

## 1. Operating System Agent Paradigm
The NARVEX Central Agent is an authorized command gateway that interacts with core operational systems: GIS maps, ML predictive engines, What-If simulation models, and cryptographic briefing generation.

```text
USER VOICE / TEXT COMMAND
          ↓
NATURAL LANGUAGE INTENT CLASSIFICATION
          ↓
AUTHENTICATION & IDENTITY VALIDATION
          ↓
ZERO-TRUST AUTHORIZATION GATE (RBAC/ABAC)
          ↓
DISTRICT & RESOURCE SCOPING GUARD
          ↓
STRUCTURED TOOL BUS EXECUTION
          ↓
CRYPTOGRAPHIC HASH LOGGING (agent_audit_logs + audit_hash_chain)
          ↓
DYNAMIC OPERATING SYSTEM ACTION & SPEECH SYNTHESIS
```

---

## 2. Voice & Natural Language Authorization Policy
- **No Direct SQL Execution**: The agent never runs arbitrary queries or unfiltered SQL. It maps intents to strictly typed, sandboxed tool calls in `AUTHORIZED_AGENT_TOOLS`.
- **District Scoping Enforcement**: If a District Officer queries an unauthorized district, the agent halts execution immediately, issues an access denial alert, and records a high-severity security event.
- **High-Risk Action Confirmation**: Operations modifying state (e.g. session revocation, model deployment, bulk data export) require explicit confirmation parameters and administrative privileges.
