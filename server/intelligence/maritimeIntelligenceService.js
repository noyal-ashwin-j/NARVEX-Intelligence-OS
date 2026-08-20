import pool from '../database/db.js';

/**
 * NARVEX Coastal & Maritime Intelligence Extension
 * 
 * Capability: Ingests, correlates and visualizes Tamil Nadu's 1,076 km coastline risk points,
 * major seaport container discrepancies, and coastal landing points (Palk Strait, Gulf of Mannar).
 */

export const COASTAL_PORTS_AND_LANDING_POINTS = [
  {
    id: 'PORT-CHN-01',
    name: 'Chennai Port Container Terminal',
    districtId: 1,
    districtName: 'Chennai',
    lat: 13.0848,
    lng: 80.2974,
    type: 'INTERNATIONAL_SEAPORT',
    jurisdiction: 'Customs & Port Trust Intelligence',
    riskIndicator: 'HIGH PREVENTIVE ATTENTION',
    evidenceConfidence: 84.0,
    coverageStatus: 'GOOD',
    recentAnomaliesCount: 4,
    primaryContraband: 'Synthetic Stimulants, Chemical Precursors',
    description: 'High-density international container throughput; automated x-ray scanner density discrepancies flagged.'
  },
  {
    id: 'PORT-ENR-02',
    name: 'Kamarajar Port (Ennore)',
    districtId: 18,
    districtName: 'Tiruvallur',
    lat: 13.2505,
    lng: 80.3340,
    type: 'BULK_CARGO_PORT',
    jurisdiction: 'Marine Police & Customs',
    riskIndicator: 'INCREASING',
    evidenceConfidence: 78.0,
    coverageStatus: 'GOOD',
    recentAnomaliesCount: 2,
    primaryContraband: 'Commercial Ganja & Chemical Solvents',
    description: 'Bulk industrial shipping channel with high-tonnage cargo manifests.'
  },
  {
    id: 'PORT-TUT-03',
    name: 'V.O. Chidambaranar Port (Thoothukudi)',
    districtId: 13,
    districtName: 'Thoothukudi',
    lat: 8.7523,
    lng: 78.1884,
    type: 'CONTAINER_PORT_AND_COAST',
    jurisdiction: 'Coastal Security Group & DRI',
    riskIndicator: 'HIGH PREVENTIVE ATTENTION',
    evidenceConfidence: 86.0,
    coverageStatus: 'GOOD',
    recentAnomaliesCount: 5,
    primaryContraband: 'Commercial Ganja, Synthetic Stimulants',
    description: 'Direct maritime corridor facing Sri Lankan maritime transit lanes in Gulf of Mannar.'
  },
  {
    id: 'LAND-RMD-04',
    name: 'Mandapam / Rameswaram Coast',
    districtId: 30,
    districtName: 'Ramanathapuram',
    lat: 9.2818,
    lng: 79.1245,
    type: 'SECLUDED_COASTAL_LANDING',
    jurisdiction: 'Indian Coast Guard & Coastal Security Group',
    riskIndicator: 'HIGH PREVENTIVE ATTENTION',
    evidenceConfidence: 88.0,
    coverageStatus: 'GOOD',
    recentAnomaliesCount: 6,
    primaryContraband: 'Commercial Ganja, Methamphetamine Crystals',
    description: 'Palk Strait shallow water channel used by non-mechanized country craft vessels.'
  },
  {
    id: 'LAND-NGP-05',
    name: 'Nagapattinam Port & Creek Mouth',
    districtId: 34,
    districtName: 'Nagapattinam',
    lat: 10.7601,
    lng: 79.8450,
    type: 'COASTAL_FISHING_HARBOUR',
    jurisdiction: 'State Marine Police',
    riskIndicator: 'INCREASING',
    evidenceConfidence: 74.0,
    coverageStatus: 'MODERATE',
    recentAnomaliesCount: 2,
    primaryContraband: 'Commercial Ganja',
    description: 'Estuary delta mouth with multi-vessel traditional fishing fleet operations.'
  },
  {
    id: 'LAND-CUD-06',
    name: 'Cuddalore Old Town Harbour',
    districtId: 19,
    districtName: 'Cuddalore',
    lat: 11.7245,
    lng: 79.7745,
    type: 'MINOR_PORT_AND_ESTUARY',
    jurisdiction: 'Coastal Security Cell',
    riskIndicator: 'WATCH',
    evidenceConfidence: 72.0,
    coverageStatus: 'MODERATE',
    recentAnomaliesCount: 1,
    primaryContraband: 'Commercial Ganja',
    description: 'Gudilam-Ponnaiyar confluence channel monitored for coastal contraband offloading.'
  },
  {
    id: 'LAND-KKI-07',
    name: 'Colachel / Muttom Coastal Sector',
    districtId: 14,
    districtName: 'Kanniyakumari',
    lat: 8.1755,
    lng: 77.2562,
    type: 'DEEP_SEA_FISHING_BASE',
    jurisdiction: 'Marine Police Station Colachel',
    riskIndicator: 'WATCH',
    evidenceConfidence: 76.0,
    coverageStatus: 'GOOD',
    recentAnomaliesCount: 1,
    primaryContraband: 'Synthetic Stimulants',
    description: 'Deep-sea multi-day gillnet vessel base operating across Arabian Sea / Indian Ocean boundary.'
  }
];

export async function getMaritimeIntelligenceData() {
  try {
    // Return structured coastal radar points with real-time risk linkages
    return {
      success: true,
      totalCoastalNodes: COASTAL_PORTS_AND_LANDING_POINTS.length,
      coastlineLengthKm: 1076,
      disclaimer: 'Maritime intelligence reflects approved port observations & coastal security telemetry. Prototype simulation layer.',
      nodes: COASTAL_PORTS_AND_LANDING_POINTS
    };
  } catch (err) {
    console.error('Maritime Intelligence Error:', err);
    throw err;
  }
}

export default {
  COASTAL_PORTS_AND_LANDING_POINTS,
  getMaritimeIntelligenceData
};
