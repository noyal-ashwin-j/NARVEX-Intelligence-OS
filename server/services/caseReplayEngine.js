import pool from '../database/db.js';
import { getSyntheticCaseObservations, SYNTHETIC_CASE_TITLE } from './syntheticCaseBundleService.js';
import { computeAllDistrictFeatures } from '../features/featureEngineeringEngine.js';
import { recomputeRouteIntelligence } from '../intelligence/routeAggregationEngine.js';
import { broadcastIntelligenceEvent } from './realtimeIntelligenceService.js';
import { appendAuditRecord } from './hashChainService.js';

let replayState = {
  active: false,
  currentStepIndex: 0,
  totalSteps: 9,
  history: [],
  logs: [],
  lastUpdated: null
};

export function getCaseReplayStatus() {
  return {
    success: true,
    title: SYNTHETIC_CASE_TITLE,
    replayState
  };
}

export async function resetCaseReplay() {
  const conn = await pool.getConnection();
  try {
    // Clear synthetic test records
    await conn.query("DELETE FROM event_provenance WHERE event_ref LIKE 'SYNTH-%'");
    await conn.query("DELETE FROM route_observations WHERE route_ref LIKE 'SYNTH-%'");
    conn.release();

    await computeAllDistrictFeatures();
    await recomputeRouteIntelligence();

    replayState = {
      active: false,
      currentStepIndex: 0,
      totalSteps: 9,
      history: [],
      logs: ['Replay environment reset cleanly to baseline observational state.'],
      lastUpdated: new Date().toISOString()
    };

    return { success: true, message: 'Case replay reset cleanly', replayState };
  } catch (err) {
    conn.release();
    throw err;
  }
}

export async function stepCaseReplay() {
  const observations = getSyntheticCaseObservations();
  if (replayState.currentStepIndex >= observations.length) {
    return {
      success: true,
      completed: true,
      message: 'Scenario replay completed all steps.',
      replayState
    };
  }

  const currentObs = observations[replayState.currentStepIndex];
  const conn = await pool.getConnection();

  try {
    // 1. Insert Raw Observation into event_provenance (ZERO hardcoded risk scores)
    const eventRef = `SYNTH-EVT-${currentObs.stepId}`;
    const routeRef = `SYNTH-RT-${currentObs.stepId}`;

    await conn.query(`
      INSERT INTO event_provenance 
        (event_ref, source_id, source_department, district_id, description, observed_at, reported_at)
      VALUES (?, 1, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE description = VALUES(description)
    `, [
      eventRef,
      currentObs.sourceName,
      currentObs.districtId,
      currentObs.description,
      currentObs.timestamp,
      currentObs.timestamp
    ]);

    // Insert Route Observation if transport details exist
    if (currentObs.transportMode && currentObs.transportMode !== 'UNKNOWN') {
      await conn.query(`
        INSERT INTO route_observations 
          (route_ref, district_id, corridor_id, origin_name, origin_country, origin_lat, origin_lng, dest_name, destination_state, dest_lat, dest_lng, transport_mode, scope_tier, verification_status, observed_at)
        VALUES (?, ?, 1, ?, 'India', ?, ?, 'Chennai Port & Air Command', 'Tamil Nadu', 13.0827, 80.2707, ?, 'TAMILNADU', ?, ?)
        ON DUPLICATE KEY UPDATE observed_at = VALUES(observed_at)
      `, [
        routeRef,
        currentObs.districtId,
        currentObs.locality,
        currentObs.lat,
        currentObs.lng,
        currentObs.transportMode,
        currentObs.verificationStatus,
        currentObs.timestamp
      ]);
    }

    conn.release();

    // 2. Execute Production Feature & Arc Aggregation Engines
    await computeAllDistrictFeatures();
    await recomputeRouteIntelligence();

    // 3. Add SHA-256 Cryptographic Audit Block
    await appendAuditRecord({
      actionType: 'SYNTHETIC_OBSERVATION_INGESTED',
      entityType: 'INTELLIGENCE_EVENT',
      entityId: eventRef,
      payload: {
        eventRef,
        stepId: currentObs.stepId,
        locality: currentObs.locality,
        timestamp: currentObs.timestamp
      }
    });

    // 4. Broadcast Real-Time SSE Event
    broadcastIntelligenceEvent('SYNTHETIC_SCENARIO_TICK', {
      stepId: currentObs.stepId,
      title: currentObs.stepTitle,
      locality: currentObs.locality,
      sourceType: currentObs.sourceType,
      timestamp: currentObs.timestamp
    });

    replayState.active = true;
    replayState.currentStepIndex += 1;
    replayState.history.push(currentObs);
    replayState.logs.push(`Ingested ${currentObs.stepTitle} at ${currentObs.locality} (${currentObs.sourceType})`);
    replayState.lastUpdated = new Date().toISOString();

    return {
      success: true,
      currentStep: currentObs,
      replayState
    };
  } catch (err) {
    conn.release();
    throw err;
  }
}
