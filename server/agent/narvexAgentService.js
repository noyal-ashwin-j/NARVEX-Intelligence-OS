import pool from '../database/db.js';
import { getWhatChangedSummary } from '../services/backgroundIntelligenceService.js';
import { fuseSignalsForDistrict } from '../intelligence/signalFusionEngine.js';
import { runPreventiveSimulation } from '../intelligence/scenarioSimulationEngine.js';
import { generateComprehensiveBriefing } from '../services/intelligenceBriefingService.js';
import { getAggregatedIntelligenceGraph } from '../intelligence/networkGraphEngine.js';
import { getMaritimeIntelligenceData } from '../intelligence/maritimeIntelligenceService.js';

/**
 * NARVEX Central Agent Operating Service
 * 
 * Capability: Translates high-level natural language intents into authorized
 * operational system tool executions and coordinated UI manipulations.
 */

export const AUTHORIZED_AGENT_TOOLS = {
  getWhatChanged: async () => await getWhatChangedSummary(),
  getDistrictSummary: async ({ districtId }) => {
    const [rows] = await pool.query('SELECT * FROM districts WHERE id = ? OR name LIKE ?', [districtId, `%${districtId}%`]);
    return rows[0] || null;
  },
  getCorroboratingSignals: async ({ districtId, windowDays }) => await fuseSignalsForDistrict(districtId, windowDays),
  runSimulation: async (params) => await runPreventiveSimulation(params),
  generateBriefing: async ({ districtId }) => await generateComprehensiveBriefing(districtId),
  getNetworkGraph: async ({ districtId }) => await getAggregatedIntelligenceGraph(districtId),
  getMaritimeIntelligence: async () => await getMaritimeIntelligenceData()
};

export async function processAgentIntent({ query, language = 'AUTO', currentContext = {} }) {
  const norm = (query || '').toLowerCase().trim();

  // Detect District mentions across all 38 districts
  const [districtList] = await pool.query('SELECT id, name, code, center_lat, center_lng FROM districts');
  const matchedDistrict = districtList.find((d) => norm.includes(d.name.toLowerCase()) || norm.includes(d.code.toLowerCase()));

  // 1. What Changed Today Intent
  if (norm.includes('what changed') || norm.includes('enna change') || norm.includes('iniku') || norm.includes('today')) {
    const whatChanged = await AUTHORIZED_AGENT_TOOLS.getWhatChanged();
    const isTamil = language === 'TA' || norm.includes('enna') || norm.includes('iniku');

    return {
      success: true,
      intent: 'WHAT_CHANGED',
      action: {
        type: 'OPEN_WHAT_CHANGED_PANEL',
        payload: whatChanged
      },
      speechResponse: isTamil
        ? `Iniku ${whatChanged.today?.newSignalsCount || 0} pudhu signals process pannappattullana. Coimbatore matrum Tiruvallur-la signal velocity historical baseline vida increase aagirukku.`
        : `Today ${whatChanged.today?.newSignalsCount || 0} new signals were processed. Coimbatore and Tiruvallur show recent signal velocity acceleration above their baseline.`
    };
  }

  // 2. Focus District Intent
  if (matchedDistrict && (norm.includes('focus') || norm.includes('show') || norm.includes('kaatu') || norm.includes('paaru') || norm.includes('district'))) {
    const districtSummary = await AUTHORIZED_AGENT_TOOLS.getDistrictSummary({ districtId: matchedDistrict.id });
    const isTamil = language === 'TA' || norm.includes('kaatu') || norm.includes('paaru');

    return {
      success: true,
      intent: 'FOCUS_DISTRICT',
      action: {
        type: 'FLY_TO_DISTRICT',
        payload: {
          districtId: matchedDistrict.id,
          districtName: matchedDistrict.name,
          lat: parseFloat(matchedDistrict.center_lat),
          lng: parseFloat(matchedDistrict.center_lng),
          zoom: 9.5,
          districtSummary
        }
      },
      speechResponse: isTamil
        ? `${matchedDistrict.name} mavattathai focus seigiren. Risk indicator: ${districtSummary?.risk_level || 'WATCH'}, Velocity: ${districtSummary?.velocity_30d || 1.0}x.`
        : `Focusing on ${matchedDistrict.name}. Current Risk Indicator: ${districtSummary?.risk_level || 'WATCH'}, 30-day velocity is ${districtSummary?.velocity_30d || 1.0}x.`
    };
  }

  // 3. Scenario Simulation Intent
  if (norm.includes('simulation') || norm.includes('what if') || norm.includes('countermeasure') || norm.includes('resource')) {
    const simTargetId = matchedDistrict ? matchedDistrict.id : 2;
    const simResult = await AUTHORIZED_AGENT_TOOLS.runSimulation({ targetDistrictId: simTargetId });

    return {
      success: true,
      intent: 'OPEN_SIMULATOR',
      action: {
        type: 'OPEN_SCENARIO_SIMULATOR',
        payload: simResult
      },
      speechResponse: `Opening What-If Preventive Scenario Simulator for ${simResult.parameters.targetDistrictName}. Displaying projected displacement and transit velocity reduction.`
    };
  }

  // 4. Intelligence Briefing Dossier Intent
  if (norm.includes('briefing') || norm.includes('dossier') || norm.includes('report') || norm.includes('pdf')) {
    const briefingResult = await AUTHORIZED_AGENT_TOOLS.generateBriefing({ districtId: matchedDistrict?.id || null });

    return {
      success: true,
      intent: 'GENERATE_BRIEFING',
      action: {
        type: 'OPEN_BRIEFING_MODAL',
        payload: briefingResult
      },
      speechResponse: `Generating official State Narcotic Intelligence Briefing Dossier with cryptographic SHA-256 audit hash.`
    };
  }

  // 5. Maritime / Coastal Intelligence Intent
  if (norm.includes('coastal') || norm.includes('maritime') || norm.includes('port') || norm.includes('kadal') || norm.includes('landing')) {
    const maritimeData = await AUTHORIZED_AGENT_TOOLS.getMaritimeIntelligence();

    return {
      success: true,
      intent: 'FILTER_MARITIME_LAYER',
      action: {
        type: 'ACTIVATE_MARITIME_LAYER',
        payload: maritimeData
      },
      speechResponse: `Activating Tamil Nadu 1,076 km Coastal Radar and Seaport Intelligence layer. Highlighting Chennai Port, Thoothukudi, and Palk Strait landing points.`
    };
  }

  // 6. Network Graph Intent
  if (norm.includes('graph') || norm.includes('network') || norm.includes('association') || norm.includes('connection')) {
    const graphData = await AUTHORIZED_AGENT_TOOLS.getNetworkGraph({ districtId: matchedDistrict?.id || null });

    return {
      success: true,
      intent: 'OPEN_NETWORK_GRAPH',
      action: {
        type: 'OPEN_GRAPH_VIEW',
        payload: graphData
      },
      speechResponse: `Opening aggregated Intelligence Knowledge Graph. Displaying inter-district corridors, gateway checkposts, and contraband class relationships.`
    };
  }

  // Default Central Intelligence Overview
  return {
    success: true,
    intent: 'GENERAL_ASSISTANCE',
    action: {
      type: 'HIGHLIGHT_ALL_EMERGING_ZONES',
      payload: { filter: 'EMERGING' }
    },
    speechResponse: `NARVEX Central Intelligence System is active. You can request district focus, What-Changed summary, What-If simulation, or briefing generation.`
  };
}

export default {
  AUTHORIZED_AGENT_TOOLS,
  processAgentIntent
};
