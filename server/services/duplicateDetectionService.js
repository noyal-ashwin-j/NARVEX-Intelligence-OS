import pool from '../database/db.js';

/**
 * Duplicate & Burst Pattern Detection Service for NARVEX Intelligence Engine
 * Cross-references spatial proximity, temporal window, categories, and textual similarity.
 */

// Helper to compute token Jaccard similarity between two text strings
function computeTextSimilarity(textA = '', textB = '') {
  const getTokens = (str) =>
    new Set(
      str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

  const setA = getTokens(textA);
  const setB = getTokens(textB);

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union > 0 ? (intersection / union) * 100 : 0;
}

export async function detectDuplicatesAndBursts({
  districtId,
  eventDate,
  lat = null,
  lng = null,
  description = '',
  categoryId = null,
  referenceNumber = null
}) {
  try {
    if (!districtId) {
      return { isDuplicate: false, isBurst: false, duplicateScore: 0 };
    }

    // 1. Look for existing events in the same district within +- 5 days
    const [existing] = await pool.query(
      `SELECT e.id, e.event_code, e.location_name, e.lat, e.lng, e.event_date, e.category_id, e.raw_description_redacted,
              p.source_file_name, p.classification_method
       FROM intelligence_events e
       LEFT JOIN event_provenance p ON e.id = p.event_id
       WHERE e.district_id = ? 
       AND ABS(DATEDIFF(e.event_date, ?)) <= 5
       ORDER BY e.id DESC
       LIMIT 30`,
      [districtId, eventDate || new Date().toISOString().slice(0, 10)]
    );

    let isDuplicate = false;
    let duplicateOfEventId = null;
    let duplicateEventCode = null;
    let duplicateScore = 0;
    const matchFactors = [];

    for (const item of existing) {
      let score = 0;
      const factors = [];

      // A. Explicit Reference Number Match (e.g. same FIR)
      if (referenceNumber && item.raw_description_redacted.includes(referenceNumber)) {
        score += 60;
        factors.push(`REFERENCE_NUM_MATCH (${referenceNumber})`);
      }

      // B. Spatial Proximity Check
      if (lat && lng && item.lat && item.lng) {
        const dLat = Math.abs(parseFloat(item.lat) - parseFloat(lat));
        const dLng = Math.abs(parseFloat(item.lng) - parseFloat(lng));
        if (dLat < 0.015 && dLng < 0.015) {
          // within ~1.5 km
          score += 35;
          factors.push('HIGH_SPATIAL_PROXIMITY (< 1.5 km)');
        } else if (dLat < 0.04 && dLng < 0.04) {
          // within ~4 km
          score += 20;
          factors.push('MODERATE_SPATIAL_PROXIMITY (< 4 km)');
        }
      }

      // C. Temporal Window
      const dayDiff = Math.abs((new Date(item.event_date) - new Date(eventDate)) / (1000 * 60 * 60 * 24));
      if (dayDiff === 0) {
        score += 20;
        factors.push('SAME_DAY_INCIDENT');
      } else if (dayDiff <= 2) {
        score += 15;
        factors.push(`TEMPORAL_PROXIMITY (${Math.round(dayDiff)} days)`);
      }

      // D. Same Category Match
      if (categoryId && item.category_id === categoryId) {
        score += 15;
        factors.push('SAME_EVENT_CATEGORY');
      }

      // E. Text Similarity
      const textSim = computeTextSimilarity(description, item.raw_description_redacted);
      if (textSim > 50) {
        score += Math.min(30, Math.round(textSim * 0.3));
        factors.push(`SEMANTIC_TEXT_SIMILARITY (${Math.round(textSim)}%)`);
      }

      // Cap at 98%
      const finalSimilarity = Math.min(98, score);

      if (finalSimilarity >= 75 && finalSimilarity > duplicateScore) {
        isDuplicate = true;
        duplicateOfEventId = item.id;
        duplicateEventCode = item.event_code;
        duplicateScore = finalSimilarity;
        matchFactors.length = 0;
        matchFactors.push(...factors);
      }
    }

    // 2. Burst pattern check in same district within last 7 days (> 4 events)
    const [burstCountRows] = await pool.query(
      `SELECT COUNT(*) as recent_count 
       FROM intelligence_events 
       WHERE district_id = ? 
       AND event_date >= DATE_SUB(?, INTERVAL 7 DAY)`,
      [districtId, eventDate || new Date().toISOString().slice(0, 10)]
    );

    const burstCount = burstCountRows[0]?.recent_count || 0;
    const isBurst = burstCount >= 4;

    return {
      isDuplicate,
      duplicateOfEventId,
      duplicateEventCode,
      duplicateScore,
      matchFactors,
      isBurst,
      burstCount
    };
  } catch (err) {
    console.error('Duplicate detection service error:', err.message);
    return { isDuplicate: false, isBurst: false, duplicateScore: 0 };
  }
}
