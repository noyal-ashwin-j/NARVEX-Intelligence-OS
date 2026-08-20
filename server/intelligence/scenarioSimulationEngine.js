import pool from '../database/db.js';
import { extractDistrictFeatures } from '../ai/featureEngineering.js';

/**
 * NARVEX What-If Preventive Scenario Simulation Engine
 * 
 * Capability: Explores hypothetical countermeasure impacts (Interstate checkpost intensification,
 * youth community outreach, mobile highway patrols) and projects the spatial displacement &
 * preventive attention reduction across affected and adjacent corridors.
 */

export async function runPreventiveSimulation({
  targetDistrictId = 2, // Default: Coimbatore
  checkpostInterventionIntensity = 50, // 0 to 100%
  communityOutreachIntensity = 30, // 0 to 100%
  mobilePatrolUnits = 4, // integer
  timeHorizonDays = 30
}) {
  try {
    // 1. Fetch current live baseline features for all districts
    const currentFeatures = await extractDistrictFeatures();
    const targetDist = currentFeatures.find((d) => d.districtId === parseInt(targetDistrictId, 10));

    if (!targetDist) {
      throw new Error(`District with ID ${targetDistrictId} not found.`);
    }

    // 2. Fetch connected corridors to model spatial displacement effect
    const [connectedCorridors] = await pool.query(
      `SELECT destination_district_id, corridor_name
       FROM spatial_associations
       WHERE origin_district_id = ?`,
      [targetDistrictId]
    );

    const connectedDistrictIds = new Set(connectedCorridors.map((c) => c.destination_district_id));

    // 3. Compute Simulated State for Target & Neighboring Districts
    const simulatedDistricts = currentFeatures.map((df) => {
      const isTarget = df.districtId === parseInt(targetDistrictId, 10);
      const isConnectedNeighbor = connectedDistrictIds.has(df.districtId);

      const baseVel30d = df.features[1];
      const baseVel7d = df.features[0];
      const baseAcceleration = df.features[2];

      let simVel30d = baseVel30d;
      let simRiskLevel = df.metadata.totalEvents <= 2 ? 'INSUFFICIENT_DATA' : baseVel30d >= 2.0 ? 'HIGH PREVENTIVE ATTENTION' : baseVel30d >= 1.2 ? 'INCREASING' : 'WATCH';
      let displacementImpact = 'NONE';
      let simulationNotes = 'Baseline monitored state';

      if (isTarget) {
        // Direct Intervention Impact on Target District
        // Reduction factor proportional to combined interventions
        const totalInterventionPower = (checkpostInterventionIntensity * 0.45 + communityOutreachIntensity * 0.35 + mobilePatrolUnits * 5) / 100.0;
        simVel30d = parseFloat(Math.max(0.4, baseVel30d * (1.0 - totalInterventionPower * 0.55)).toFixed(2));

        if (simVel30d >= 2.2) simRiskLevel = 'HIGH PREVENTIVE ATTENTION';
        else if (simVel30d >= 1.3) simRiskLevel = 'INCREASING';
        else simRiskLevel = 'WATCH';

        simulationNotes = `Projected ${(totalInterventionPower * 45).toFixed(1)}% reduction in transit velocity due to intensified gateway surveillance and community resilience programs.`;
      } else if (isConnectedNeighbor) {
        // Spatial Displacement Spillover Effect
        // Trafficking traffic partially diverts to alternative routes
        const spilloverFactor = (checkpostInterventionIntensity * 0.15) / 100.0;
        simVel30d = parseFloat((baseVel30d * (1.0 + spilloverFactor)).toFixed(2));

        if (simVel30d >= 2.2) simRiskLevel = 'HIGH PREVENTIVE ATTENTION';
        else if (simVel30d >= 1.3) simRiskLevel = 'INCREASING';
        else simRiskLevel = 'WATCH';

        displacementImpact = 'POTENTIAL_CORRIDOR_DISPLACEMENT';
        simulationNotes = `Projected +${(spilloverFactor * 100).toFixed(1)}% diversion spillover along connected highway routes. Recommend secondary perimeter monitoring.`;
      }

      return {
        districtId: df.districtId,
        districtName: df.districtName,
        districtCode: df.districtCode,
        current: {
          velocity30d: baseVel30d,
          riskLevel: df.metadata.totalEvents <= 2 ? 'INSUFFICIENT_DATA' : baseVel30d >= 2.0 ? 'HIGH PREVENTIVE ATTENTION' : baseVel30d >= 1.2 ? 'INCREASING' : 'WATCH'
        },
        simulated: {
          velocity30d: simVel30d,
          riskLevel: simRiskLevel,
          displacementImpact,
          simulationNotes
        }
      };
    });

    return {
      simulationId: `SIM-${Date.now()}`,
      evaluatedAt: new Date().toISOString(),
      parameters: {
        targetDistrictId: parseInt(targetDistrictId, 10),
        targetDistrictName: targetDist.districtName,
        checkpostInterventionIntensity: `${checkpostInterventionIntensity}%`,
        communityOutreachIntensity: `${communityOutreachIntensity}%`,
        mobilePatrolUnits,
        timeHorizonDays: `${timeHorizonDays} Days`
      },
      disclaimer: 'HYPOTHETICAL SIMULATION — NOT A GUARANTEED REAL-WORLD PREDICTION. For strategic preventive resource planning only.',
      affectedDistrictsCount: 1 + connectedDistrictIds.size,
      results: simulatedDistricts
    };
  } catch (err) {
    console.error('Scenario Simulation Error:', err);
    throw err;
  }
}

export default { runPreventiveSimulation };
