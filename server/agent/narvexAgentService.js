import crypto from 'crypto';
import pool from '../database/db.js';
import { getWhatChangedSummary } from '../services/backgroundIntelligenceService.js';
import { fuseSignalsForDistrict } from '../intelligence/signalFusionEngine.js';
import { runPreventiveSimulation } from '../intelligence/scenarioSimulationEngine.js';
import { generateComprehensiveBriefing } from '../services/intelligenceBriefingService.js';
import { getAggregatedIntelligenceGraph } from '../intelligence/networkGraphEngine.js';
import { getMaritimeIntelligenceData } from '../intelligence/maritimeIntelligenceService.js';
import { logSecurityEvent } from '../services/securityHardeningService.js';
import { authorizeOperation, PERMISSIONS } from '../services/authorizationPolicyService.js';

/**
 * NARVEX Central Agent Operating Service
 * 
 * Capability: Translates natural language intents into authorized
 * operational system tool executions, security policy gates, and UI manipulations.
 */

export const AUTHORIZED_AGENT_TOOLS = {
  getWhatChanged: async () => await getWhatChangedSummary(),
  getDistrictSummary: async ({ districtId }) => {
    const [rows] = await pool.query('SELECT * FROM districts WHERE id = ? OR district_name LIKE ?', [districtId, `%${districtId}%`]);
    return rows[0] || null;
  },
  getCorroboratingSignals: async ({ districtId, windowDays }) => await fuseSignalsForDistrict(districtId, windowDays),
  runSimulation: async (params) => await runPreventiveSimulation(params),
  generateBriefing: async ({ districtId }) => await generateComprehensiveBriefing(districtId),
  getNetworkGraph: async ({ districtId }) => await getAggregatedIntelligenceGraph(districtId),
  getMaritimeIntelligence: async () => await getMaritimeIntelligenceData(),
  
  // Phase 1 Mandatory Tool Registry Integrations
  searchObservations: async ({ query, districtId }) => {
    const [rows] = await pool.query(
      `SELECT * FROM event_provenance WHERE (district_id = ? OR ? IS NULL) AND description LIKE ? LIMIT 50`,
      [districtId || null, districtId || null, `%${query}%`]
    );
    return rows;
  },
  searchCases: async ({ caseRef }) => {
    const [rows] = await pool.query(`SELECT * FROM event_provenance WHERE case_ref LIKE ?`, [`%${caseRef}%`]);
    return rows;
  },
  searchDocuments: async ({ query }) => {
    const [rows] = await pool.query(`SELECT * FROM documents WHERE file_name LIKE ? OR sha256_hash = ? LIMIT 20`, [`%${query}%`, query]);
    return rows;
  },
  getDistrictIntelligence: async ({ districtId }) => {
    const [rows] = await pool.query(
      `SELECT d.district_name, mf.velocity_7d, mf.velocity_30d, mf.acceleration, fr.probability, fr.signal_state
       FROM districts d
       LEFT JOIN model_features mf ON d.id = mf.district_id
       LEFT JOIN forecast_records fr ON d.id = fr.district_id
       WHERE d.id = ?`,
      [districtId]
    );
    return rows[0] || null;
  },
  getRouteAssociations: async ({ scope, mode }) => {
    const [rows] = await pool.query(
      `SELECT * FROM route_observations WHERE (transport_mode = ? OR ? = 'ALL') LIMIT 50`,
      [mode || 'ALL', mode || 'ALL']
    );
    return rows;
  },
  getEmergingZones: async () => {
    const [rows] = await pool.query(
      `SELECT d.district_name, fr.probability, fr.signal_state, fr.coverage
       FROM forecast_records fr
       JOIN districts d ON fr.district_id = d.id
       WHERE fr.signal_state IN ('EMERGING', 'ELEVATED')`
    );
    return rows;
  },
  getForecasts: async ({ districtId }) => {
    const [rows] = await pool.query(`SELECT * FROM forecast_records WHERE district_id = ? ORDER BY calculated_at DESC LIMIT 5`, [districtId]);
    return rows;
  },
  getSourceEvidence: async ({ eventRef }) => {
    const [rows] = await pool.query(`SELECT * FROM event_provenance WHERE event_ref = ?`, [eventRef]);
    return rows[0] || null;
  },
  getDataCoverage: async () => {
    const [rows] = await pool.query(
      `SELECT d.district_name, mf.coverage_score, mf.velocity_90d
       FROM model_features mf
       JOIN districts d ON mf.district_id = d.id`
    );
    return rows;
  }
};

export async function processAgentIntent({ query, language = 'AUTO', currentContext = {}, user = null, ipAddress = '127.0.0.1' }) {
  const norm = (query || '').toLowerCase().trim();
  const queryHash = crypto.createHash('sha256').update(norm).digest('hex');

  // Detect District mentions across all 38 districts
  const [districtList] = await pool.query('SELECT id, district_name AS name, district_code AS code, latitude AS center_lat, longitude AS center_lng FROM districts');
  const matchedDistrict = districtList.find((d) => norm.includes(d.name.toLowerCase()) || norm.includes(d.code.toLowerCase()));

  // 1. Zero-Trust District Scoping Gate for District Officers
  if (user && user.roleKey === 'DISTRICT_OFFICER' && matchedDistrict) {
    if (parseInt(matchedDistrict.id, 10) !== parseInt(user.districtId, 10)) {
      await logSecurityEvent({
        eventType: 'UNAUTHORIZED_TOOL_CALL',
        actorUserId: user.id,
        districtId: matchedDistrict.id,
        ipAddress,
        severity: 'HIGH',
        details: { attemptedDistrict: matchedDistrict.name, query }
      });

      return {
        success: false,
        authorized: false,
        intent: 'DISTRICT_ACCESS_DENIED',
        speechResponse: `Access Denied: You are only authorized to query intelligence for your assigned jurisdiction (${user.districtName || user.districtId}).`,
        action: { type: 'ACCESS_DENIED_ALERT', payload: { targetDistrict: matchedDistrict.name } }
      };
    }
  }

  // 2. What Changed Today Intent
  if (norm.includes('what changed') || norm.includes('enna change') || norm.includes('iniku') || norm.includes('today')) {
    const whatChanged = await AUTHORIZED_AGENT_TOOLS.getWhatChanged();
    const isTamil = language === 'TA' || norm.includes('enna') || norm.includes('iniku');
    const surgeDistricts = (whatChanged.velocitySurges || []).map((d) => d.districtName).join(' & ') || 'monitored corridors';

    return {
      success: true,
      intent: 'WHAT_CHANGED',
      action: {
        type: 'OPEN_WHAT_CHANGED_PANEL',
        payload: whatChanged
      },
      speechResponse: isTamil
        ? `Iniku ${whatChanged.today?.newSignalsCount || 0} pudhu signals process pannappattullana. ${surgeDistricts}-la signal velocity historical baseline vida increase aagirukku.`
        : `Today ${whatChanged.today?.newSignalsCount || 0} new signals were processed. ${surgeDistricts} show recent signal velocity acceleration above their baseline.`
    };
  }

  // 3. Focus District Intent
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

  // 4. Scenario Simulation Intent
  if (norm.includes('simulation') || norm.includes('what if') || norm.includes('countermeasure') || norm.includes('resource')) {
    const simTargetId = matchedDistrict ? matchedDistrict.id : (user?.districtId || 2);
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

  // 5. Intelligence Briefing Dossier Intent (Privileged)
  if (norm.includes('briefing') || norm.includes('dossier') || norm.includes('report') || norm.includes('pdf')) {
    const briefingResult = await AUTHORIZED_AGENT_TOOLS.generateBriefing({ districtId: matchedDistrict?.id || user?.districtId || null });

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

  // 6. Map Scope Switching Intents (GLOBAL / INDIA / TAMIL NADU)
  if (norm.includes('global') || norm.includes('world') || norm.includes('international')) {
    return {
      success: true,
      intent: 'SWITCH_MAP_SCOPE',
      action: {
        type: 'SET_MAP_SCOPE',
        payload: { scope: 'GLOBAL' }
      },
      speechResponse: language === 'TA' || norm.includes('kaatu')
        ? `Global 3D Globe view-ku maatugiren. International trade lines, maritime corridors, and air routes-ai display seigiren.`
        : `Switching map view to Global 3D Globe. Displaying international logistics corridors and maritime links to Tamil Nadu.`
    };
  }

  if (norm.includes('india') || norm.includes('national') || norm.includes('interstate') || norm.includes('inter-state')) {
    return {
      success: true,
      intent: 'SWITCH_MAP_SCOPE',
      action: {
        type: 'SET_MAP_SCOPE',
        payload: { scope: 'INDIA' }
      },
      speechResponse: language === 'TA' || norm.includes('kaatu')
        ? `India National view-ku maatugiren. Interstate corridors (Delhi, Mumbai, Bengaluru, Andhra, Kerala) Tamil Nadu-vudhan connect aagum route-galaai kaatugiren.`
        : `Switching map view to India National. Displaying interstate transit corridors connecting to Tamil Nadu.`
    };
  }

  if (norm.includes('tamil nadu') || norm.includes('tamilnadu') || norm.includes('38 district') || norm.includes('local map')) {
    return {
      success: true,
      intent: 'SWITCH_MAP_SCOPE',
      action: {
        type: 'SET_MAP_SCOPE',
        payload: { scope: 'TAMILNADU' }
      },
      speechResponse: language === 'TA' || norm.includes('kaatu')
        ? `Tamil Nadu 38-District view-ku maatugiren. District corridors, taluk checkposts, endrum dynamic risk zones-ai kaatugiren.`
        : `Switching map view to Tamil Nadu 38-District Tactical GIS. Displaying district boundaries, checkposts, and risk zones.`
    };
  }

  // 7. Transport Mode Filter Intents (AIR / ROAD / RAIL / SEA / MULTIMODAL)
  if (norm.includes('air') || norm.includes('aviation') || norm.includes('flight')) {
    return {
      success: true,
      intent: 'FILTER_TRANSPORT_MODE',
      action: { type: 'SET_TRANSPORT_MODE', payload: { mode: 'AIR' } },
      speechResponse: `Filtering map layer to show exclusively Air Aviation & Air Cargo transport corridors.`
    };
  }

  if (norm.includes('sea') || norm.includes('maritime') || norm.includes('coastal') || norm.includes('kadal') || norm.includes('ship')) {
    const maritimeData = await AUTHORIZED_AGENT_TOOLS.getMaritimeIntelligence();
    return {
      success: true,
      intent: 'FILTER_TRANSPORT_MODE',
      action: { type: 'SET_TRANSPORT_MODE', payload: { mode: 'SEA', maritimeData } },
      speechResponse: language === 'TA'
        ? `Maritime and Coastal sea routes-ai filter seigiren. 1,076 km coastline, Chennai Port, and Palk Strait country boat channels-ai kaatugiren.`
        : `Filtering map layer for Maritime Sea Routes & 1,076 km Tamil Nadu Coastal Radar Sector.`
    };
  }

  if (norm.includes('road') || norm.includes('highway') || norm.includes('checkpost') || norm.includes('truck')) {
    return {
      success: true,
      intent: 'FILTER_TRANSPORT_MODE',
      action: { type: 'SET_TRANSPORT_MODE', payload: { mode: 'ROAD' } },
      speechResponse: `Filtering map layer to show interstate highway road corridors (NH 44, NH 544, NH 48) and checkpost checkpoints.`
    };
  }

  if (norm.includes('rail') || norm.includes('train') || norm.includes('railway')) {
    return {
      success: true,
      intent: 'FILTER_TRANSPORT_MODE',
      action: { type: 'SET_TRANSPORT_MODE', payload: { mode: 'RAIL' } },
      speechResponse: `Filtering map layer to show railway freight and passenger express transit routes.`
    };
  }

  // 7. Network Graph Intent
  if (norm.includes('graph') || norm.includes('network') || norm.includes('association') || norm.includes('connection')) {
    const graphData = await AUTHORIZED_AGENT_TOOLS.getNetworkGraph({ districtId: matchedDistrict?.id || user?.districtId || null });

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
