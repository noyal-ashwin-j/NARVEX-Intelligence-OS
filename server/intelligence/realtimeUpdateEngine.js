import pool from '../database/db.js';
import { computeFeaturesForDistrict } from '../features/featureEngineeringEngine.js';
import { runForecastInferenceForDistrict } from '../ai/forecastInferenceEngine.js';

// Subscriber event listeners for SSE / WebSocket real-time updates
const listeners = new Set();

export function subscribeToUpdates(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function broadcastUpdate(payload) {
  for (const listener of listeners) {
    try {
      listener(payload);
    } catch (err) {
      console.error('SSE listener notification error:', err);
    }
  }
}

/**
 * Dependency-Aware Recomputation Trigger
 * Call this whenever raw database observations are mutated (inserted, updated, or deleted).
 */
export async function triggerDependencyAwareRecomputation(affectedDistrictId, actionType = 'MUTATION') {
  const feat = await computeFeaturesForDistrict(affectedDistrictId);
  const forecast = await runForecastInferenceForDistrict(affectedDistrictId);

  // Query updated summary for affected district
  const [dRows] = await pool.query(
    `SELECT d.id, d.district_name, d.district_code,
            COUNT(ep.id) AS raw_observation_count
     FROM districts d
     LEFT JOIN event_provenance ep ON d.id = ep.district_id
     WHERE d.id = ?
     GROUP BY d.id`,
    [affectedDistrictId]
  );

  const payload = {
    timestamp: new Date().toISOString(),
    actionType,
    district: dRows[0] || { id: affectedDistrictId },
    features: feat,
    forecast: forecast
  };

  broadcastUpdate(payload);
  return payload;
}
