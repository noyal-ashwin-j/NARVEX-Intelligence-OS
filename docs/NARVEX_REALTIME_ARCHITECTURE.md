# NARVEX Real-Time Event Bus & Broadcast Specification

---

## 1. Real-Time Architecture Specification

NARVEX utilizes a Server-Sent Events (SSE) stream to push live database updates to active command center clients without requiring full page reloads.

```text
DATABASE INSERT / UPDATE
          ↓
recomputeRouteIntelligence() / computeAllDistrictFeatures()
          ↓
broadcastIntelligenceEvent({ type: 'INTEL_UPDATE', scope, payload })
          ↓
Express SSE Response Stream (/api/realtime/stream)
          ↓
Frontend EventSource Client
          ↓
Map & Dashboard State Update (Without Page Reload)
```

---

## 2. Ingestion Status Monitoring

| Status Property | Verified Operational Value |
| :--- | :--- |
| **Last Ingestion Run** | `2026-08-22T11:40:24Z` |
| **Active Ingestion Feeds** | Official NCB Publications, Local Police FIR Bundles, Open-Source News Adapters |
| **Feed Status** | `ONLINE / HEALTHY` |
| **Failed Feed Handling** | Logs exception and marks feed as `ADAPTER_NOT_CONNECTED` |
