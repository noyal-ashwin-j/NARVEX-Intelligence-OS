# NARVEX Data Lineage & Provenance Specification

---

## 1. End-to-End Data Lineage Flow

Every intelligence output displayed in NARVEX follows an unbroken, cryptographically auditable data lineage:

```text
1. RAW OBSERVATION INGESTION
   Input: Case Document (PDF / CSV / XLSX)
   Target: `event_provenance` & `route_observations`
   Fields Stored: `route_ref`, `origin_name`, `dest_name`, `transport_mode`, `observed_at`, `source_department`, `document_hash` (SHA-256)

2. FEATURE MATRIX COMPUTATION
   Engine: `featureEngineeringEngine.js`
   Target: `model_features`
   Calculated Metrics: `velocity_7d`, `velocity_30d`, `velocity_90d`, `acceleration`, `source_diversity`, `corroboration_score`, `coverage_score`

3. CORRIDOR DERIVATION & AGGREGATION
   Engine: `routeAggregationEngine.js`
   Target: `route_intelligence`
   Calculated Metrics: `observation_count`, `verified_event_count`, `recent_velocity`, `trend_direction`, `evidence_confidence`, `arc_status` (`HISTORICAL_OBSERVED`, `EMERGING`, `FORECAST`)

4. FORECAST INFERENCE
   Engine: `forecastInferenceEngine.js`
   Target: `forecast_records`
   Calculated Metrics: `forecast_probability`, `confidence`, `contributing_factors`, `model_version` (`NARVEX_STATISTICAL_RIDGE_V1.0`)

5. API SERVING & MAPCN RENDER
   Endpoint: `GET /api/map/arcs?scope=WORLD`
   Frontend Component: `<MapArc data={arcs} paint={{ 'line-color': ... }} />`
   Popup Lineage: Displays observation count, independent sources, confidence %, and SHA-256 provenance hashes.
```

---

## 2. Visual Arc Provenance Classifications

- **`OBSERVED` (Solid Arc)**: Verified historical events $\ge 3$.
- **`DERIVED` (Curved Arc)**: Co-occurring spatial-temporal associations.
- **`PREDICTED` (Dashed Arc)**: Forecast model output (`probability > 0.70`).
- **`UNVERIFIED` (Dotted Arc)**: Initial observations awaiting multi-source corroboration.
