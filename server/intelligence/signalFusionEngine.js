import pool from '../database/db.js';

/**
 * NARVEX Cross-Source Signal Fusion Engine
 * 
 * Capability: Corroborates disparate observations (Citizen reports, Police FIRs, Checkpost scans,
 * Health indicators) across space and time without double-counting.
 */

export async function fuseSignalsForDistrict(districtId, windowDays = 30) {
  try {
    // 1. Fetch all raw events in district within the temporal window
    const [events] = await pool.query(
      `SELECT 
         e.id, e.event_code, e.location_name, e.lat, e.lng, e.event_date, e.category_id, e.source_id,
         e.severity_level, e.is_enforcement, e.verification_status, e.confidence_score, e.raw_description_redacted,
         c.category_name, s.source_name, s.source_type, s.reliability_weight
       FROM intelligence_events e
       JOIN event_categories c ON e.category_id = c.id
       JOIN event_sources s ON e.source_id = s.id
       WHERE e.district_id = ? AND e.event_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY e.event_date DESC`,
      [districtId, windowDays]
    );

    if (events.length === 0) {
      return {
        districtId,
        windowDays,
        totalRawEvents: 0,
        fusedClustersCount: 0,
        fusedSignals: []
      };
    }

    // 2. Spatial-Temporal Clustering (within 5km and 7 days of each other)
    const clusters = [];
    const assigned = new Set();

    for (let i = 0; i < events.length; i++) {
      if (assigned.has(events[i].id)) continue;
      const base = events[i];
      const cluster = [base];
      assigned.add(base.id);

      for (let j = i + 1; j < events.length; j++) {
        if (assigned.has(events[j].id)) continue;
        const candidate = events[j];

        // Spatial distance approximation in km
        const dLat = (base.lat - candidate.lat) * 111.0;
        const dLng = (base.lng - candidate.lng) * 111.0 * Math.cos((base.lat * Math.PI) / 180.0);
        const distKm = Math.sqrt(dLat * dLat + dLng * dLng);

        // Temporal difference in days
        const tDiffDays = Math.abs(new Date(base.event_date) - new Date(candidate.event_date)) / (86400 * 1000);

        if (distKm <= 8.0 && tDiffDays <= 7.0) {
          cluster.push(candidate);
          assigned.add(candidate.id);
        }
      }

      clusters.push(cluster);
    }

    // 3. Score Each Fused Cluster
    const fusedSignals = clusters.map((c, idx) => {
      const distinctSources = new Set(c.map((e) => e.source_id));
      const hasEnforcement = c.some((e) => e.is_enforcement === 1);
      const hasCitizen = c.some((e) => e.source_type === 'CITIZEN' || e.source_id === 1);
      const hasCheckpost = c.some((e) => e.source_type === 'CHECKPOST' || e.source_id === 3);
      const verifiedCount = c.filter((e) => e.verification_status === 'VERIFIED').length;

      // Corroboration multiplier: More independent sources = higher evidence confidence
      let corroborationTier = 'UNILATERAL_SIGNAL';
      let confidenceScore = 60.0;

      if (distinctSources.size >= 3) {
        corroborationTier = 'MULTI_AGENCY_CORROBORATED';
        confidenceScore = 88.0;
      } else if (distinctSources.size === 2) {
        corroborationTier = 'DUAL_SOURCE_CORROBORATED';
        confidenceScore = 78.0;
      } else if (verifiedCount > 0) {
        corroborationTier = 'SINGLE_SOURCE_VERIFIED';
        confidenceScore = 72.0;
      }

      // Tripartite Risk Indicator for Cluster
      let clusterRisk = 'WATCH';
      if (c.length >= 5 || (distinctSources.size >= 2 && verifiedCount >= 2)) {
        clusterRisk = 'HIGH PREVENTIVE ATTENTION';
      } else if (c.length >= 3 || distinctSources.size >= 2) {
        clusterRisk = 'INCREASING';
      }

      return {
        fusedClusterId: `FUSED-D${districtId}-${idx + 1}`,
        centroidLat: parseFloat((c.reduce((acc, e) => acc + parseFloat(e.lat), 0) / c.length).toFixed(4)),
        centroidLng: parseFloat((c.reduce((acc, e) => acc + parseFloat(e.lng), 0) / c.length).toFixed(4)),
        primaryLocality: c[0].location_name,
        observationCount: c.length,
        distinctSourcesCount: distinctSources.size,
        corroborationTier,
        riskIndicator: clusterRisk,
        evidenceConfidence: confidenceScore,
        dataCoverage: c.length >= 4 ? 'GOOD' : 'MODERATE',
        sourceBreakdown: {
          citizenTips: c.filter((e) => e.source_type === 'CITIZEN').length,
          policeRecords: c.filter((e) => e.is_enforcement === 1).length,
          checkpostScans: c.filter((e) => e.source_type === 'CHECKPOST').length
        },
        contributingEvents: c.map((e) => ({
          eventId: e.id,
          eventCode: e.event_code,
          sourceName: e.source_name,
          categoryName: e.category_name,
          eventDate: e.event_date,
          verificationStatus: e.verification_status,
          description: e.raw_description_redacted
        })),
        disclaimer: 'Corroboration indicates spatial-temporal signal alignment; does not establish judicial guilt.'
      };
    });

    return {
      districtId,
      windowDays,
      totalRawEvents: events.length,
      fusedClustersCount: fusedSignals.length,
      fusedSignals
    };
  } catch (err) {
    console.error('Signal Fusion Error:', err);
    throw err;
  }
}

export default { fuseSignalsForDistrict };
