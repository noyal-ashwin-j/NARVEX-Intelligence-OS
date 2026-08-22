/**
 * Synthetic Case Bundle Service
 * Generates raw, purely observational case records for "NARVEX SYNTHETIC CASE — MULTI-SOURCE EMERGING DRUG ACTIVITY & PUBLIC SAFETY INCIDENT"
 * ZERO hardcoded risk scores, ZERO kingpins, ZERO predetermined routes.
 */

export const SYNTHETIC_CASE_TITLE = "NARVEX SYNTHETIC CASE — MULTI-SOURCE EMERGING DRUG ACTIVITY & PUBLIC SAFETY INCIDENT";

export function getSyntheticCaseObservations() {
  const baseTime = new Date('2026-08-20T08:00:00Z').getTime();
  const formatDt = (ms) => new Date(ms).toISOString().slice(0, 19).replace('T', ' ');

  return [
    // T0: Initial isolated observations
    {
      stepId: 'T0-1',
      stepTitle: 'Initial Community Observation',
      timeOffsetHrs: 0,
      timestamp: formatDt(baseTime),
      districtId: 2, // Coimbatore
      districtName: 'Coimbatore',
      locality: 'Gandhipuram Bus Stand Area',
      lat: 11.0168,
      lng: 76.9558,
      sourceType: 'COMMUNITY',
      sourceName: 'Citizen Anonymous Tip #8821',
      category: 'COMMUNITY_REPORT',
      transportMode: 'ROAD',
      verificationStatus: 'UNVERIFIED',
      documentRef: 'SYNTH-DOC-01',
      description: 'Public report of suspicious evening vehicle exchanges near parcel service counters in Gandhipuram.'
    },
    {
      stepId: 'T0-2',
      stepTitle: 'Routine Police Routine Patrol Note',
      timeOffsetHrs: 2,
      timestamp: formatDt(baseTime + 2 * 3600000),
      districtId: 2,
      districtName: 'Coimbatore',
      locality: 'Singanallur Checkpost Axis',
      lat: 10.9980,
      lng: 77.0250,
      sourceType: 'POLICE',
      sourceName: 'Local Patrol Note #402',
      category: 'ENFORCEMENT_PATROL',
      transportMode: 'ROAD',
      verificationStatus: 'VERIFIED',
      documentRef: 'SYNTH-DOC-02',
      description: 'Interstate night check recorded unusual commercial van activity arriving via Palakkad highway corridor.'
    },

    // T1: Independent news & health aggregate signals
    {
      stepId: 'T1-1',
      stepTitle: 'Open Source News Signal',
      timeOffsetHrs: 8,
      timestamp: formatDt(baseTime + 8 * 3600000),
      districtId: 1, // Chennai
      districtName: 'Chennai',
      locality: 'Chennai Central Parcel Hub',
      lat: 13.0827,
      lng: 80.2707,
      sourceType: 'NEWS_OPENSOURCE',
      sourceName: 'State Media Brief',
      category: 'NEWS_REPORT',
      transportMode: 'RAIL',
      verificationStatus: 'VERIFIED',
      documentRef: 'SYNTH-DOC-03',
      description: 'Regional news report mentions unaddressed parcel seizure at central transit terminal.'
    },
    {
      stepId: 'T1-2',
      stepTitle: 'Health Rehabilitation Aggregate Metric Shift',
      timeOffsetHrs: 14,
      timestamp: formatDt(baseTime + 14 * 3600000),
      districtId: 2,
      districtName: 'Coimbatore',
      locality: 'Peelamedu Locality',
      lat: 11.0280,
      lng: 77.0020,
      sourceType: 'HEALTH_AGGREGATE',
      sourceName: 'District Health Surveillance Aggregate',
      category: 'HEALTH_METRIC',
      transportMode: 'UNKNOWN',
      verificationStatus: 'VERIFIED',
      documentRef: 'SYNTH-DOC-04',
      description: 'Anonymized aggregate admissions data indicates subtle 12% shift in emergency toxicological inquiries.'
    },

    // T2: First-time signal locality (Zero history locality)
    {
      stepId: 'T2-1',
      stepTitle: 'First-Time Locality Signal (Sulur Industrial Corridor)',
      timeOffsetHrs: 24,
      timestamp: formatDt(baseTime + 24 * 3600000),
      districtId: 2,
      districtName: 'Coimbatore',
      locality: 'Sulur Industrial Corridor', // COMPLETELY NEW LOCALITY WITH 0 HISTORY
      lat: 11.0250,
      lng: 77.1280,
      sourceType: 'CHECKPOST',
      sourceName: 'Checkpost Log #Z-901',
      category: 'CHECKPOST_LOG',
      transportMode: 'ROAD',
      verificationStatus: 'UNVERIFIED',
      documentRef: 'SYNTH-DOC-05',
      description: 'First observation recorded at Sulur checkpost regarding heavy container truck midnight transit.'
    },

    // T3-T5: Multi-Source Corroboration & Velocity Increase
    {
      stepId: 'T3-1',
      stepTitle: 'Corroborating Police Seizure Report',
      timeOffsetHrs: 36,
      timestamp: formatDt(baseTime + 36 * 3600000),
      districtId: 2,
      districtName: 'Coimbatore',
      locality: 'Sulur Industrial Corridor',
      lat: 11.0250,
      lng: 77.1280,
      sourceType: 'POLICE',
      sourceName: 'Special Task Unit Seizure Memorandum',
      category: 'SEIZURE_ENFORCEMENT',
      transportMode: 'ROAD',
      verificationStatus: 'VERIFIED',
      documentRef: 'SYNTH-FIR-104/2026',
      description: 'Police interception yielded contraband recovery of 14.5 kg pharmaceutical stimulants from transport vehicle.'
    },
    {
      stepId: 'T4-1',
      stepTitle: 'Maritime Cargo Entry Observation (Thoothukudi Port)',
      timeOffsetHrs: 48,
      timestamp: formatDt(baseTime + 48 * 3600000),
      districtId: 3, // Thoothukudi
      districtName: 'Thoothukudi',
      locality: 'Thoothukudi Container Terminal',
      lat: 8.7642,
      lng: 78.1348,
      sourceType: 'MARITIME_CUSTOMS',
      sourceName: 'Port Logistics Inspection Record',
      category: 'MARITIME_LOGISTICS',
      transportMode: 'MARITIME',
      verificationStatus: 'VERIFIED',
      documentRef: 'SYNTH-PORT-889',
      description: 'Customs manifest audit logged discrepancy on sealed chemical container originating from Colombo Palk Strait axis.'
    },

    // T6-T8: Emerging Zone Detection & Forecast Target
    {
      stepId: 'T6-1',
      stepTitle: 'Inter-District Highway Intercept (Tiruppur Border)',
      timeOffsetHrs: 72,
      timestamp: formatDt(baseTime + 72 * 3600000),
      districtId: 4, // Tiruppur
      districtName: 'Tiruppur',
      locality: 'Avinashi Highway Toll Node',
      lat: 11.1930,
      lng: 77.2690,
      sourceType: 'CHECKPOST',
      sourceName: 'Highway Patrol Intercept #118',
      category: 'CHECKPOST_LOG',
      transportMode: 'ROAD',
      verificationStatus: 'VERIFIED',
      documentRef: 'SYNTH-TOLL-401',
      description: 'Joint checkpoint intercepted secondary courier vehicle attempting feeder movement toward Salem axis.'
    },
    {
      stepId: 'T8-1',
      stepTitle: 'Aviation Freight Observation (Chennai Air Cargo)',
      timeOffsetHrs: 96,
      timestamp: formatDt(baseTime + 96 * 3600000),
      districtId: 1,
      districtName: 'Chennai',
      locality: 'Chennai International Air Cargo Complex',
      lat: 12.9940,
      lng: 80.1700,
      sourceType: 'AIRPORT_SECURITY',
      sourceName: 'Cargo Scanner Audit Log',
      category: 'SEIZURE_ENFORCEMENT',
      transportMode: 'AIR',
      verificationStatus: 'VERIFIED',
      documentRef: 'SYNTH-AIR-992',
      description: 'High-throughput X-ray scanner flagged organic density anomaly in express parcel originating from Dubai Aviation Hub.'
    }
  ];
}
