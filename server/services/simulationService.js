import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

import pool from '../database/db.js';
import { redactPII } from './piiRedactionService.js';
import { resolveGeographicLocation } from './geoResolutionService.js';
import { classifySignalContent } from './aiClassificationService.js';
import { recalculateDistrictRiskScores } from './backgroundIntelligenceService.js';
import { detectDuplicatesAndBursts } from './duplicateDetectionService.js';
import { appendAuditRecord } from './hashChainService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_MOCK_DIR = path.resolve(__dirname, '../../data/mock');

let currentStreamIndex = 0;
let simulationActive = false;
let simulationInterval = null;

function loadStreamData() {
  const filePath = path.join(DATA_MOCK_DIR, 'live_signal_stream.csv');
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
  return parsed.data;
}

/**
 * Ingests a single live event from the live_signal_stream.csv dataset
 */
export async function tickLiveSimulation() {
  const stream = loadStreamData();
  if (stream.length === 0) {
    return { success: false, message: 'No live stream records available in live_signal_stream.csv' };
  }

  const row = stream[currentStreamIndex % stream.length];
  currentStreamIndex++;

  const rawDesc = row.description || `Live signal from ${row.location_name || 'Field Unit'}`;
  const { sanitizedText, piiDetectedCount } = redactPII(rawDesc);

  // 1. Resolve Geographic District
  const geoResult = await resolveGeographicLocation({
    locationText: `${row.location_name || ''} ${row.district_name || ''}`,
    districtMention: row.district_name || ''
  });

  let districtId = 2; // default Coimbatore
  if (geoResult.resolved && geoResult.district) {
    districtId = geoResult.district.id;
  }

  // 2. AI Classification
  const classification = await classifySignalContent(sanitizedText);
  const lat = parseFloat(row.latitude) || (geoResult.resolved ? geoResult.lat : 11.0168);
  const lng = parseFloat(row.longitude) || (geoResult.resolved ? geoResult.lng : 76.9558);
  const isEnforcement = parseInt(row.is_enforcement, 10) === 1 ? 1 : 0;

  // 3. Category Lookup
  const [catRows] = await pool.query('SELECT id, category_key FROM event_categories WHERE category_key = ?', [row.category_key || classification.categoryKey]);
  const categoryId = catRows.length > 0 ? catRows[0].id : 1;

  // 4. Duplicate Check
  const dupCheck = await detectDuplicatesAndBursts({
    districtId,
    eventDate: row.event_date || new Date().toISOString().slice(0, 10),
    lat,
    lng,
    description: sanitizedText,
    categoryId
  });

  const eventCode = `SIM-LIVE-${Date.now().toString(36).toUpperCase()}`;

  // 5. Insert Intelligence Event
  const [evtRes] = await pool.query(
    `INSERT INTO intelligence_events 
     (event_code, district_id, location_name, lat, lng, event_date, category_id, source_id, severity_level, is_enforcement, verification_status, confidence_score, coverage_flag, raw_description_redacted, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW_SIGNAL', ?, 'GOOD', ?, ?)`,
    [
      eventCode,
      districtId,
      row.location_name || 'Live Telemetry Hotspot',
      lat,
      lng,
      row.event_date || new Date().toISOString().slice(0, 10),
      categoryId,
      row.source_type === 'POLICE' ? 1 : row.source_type === 'CHECKPOST' ? 2 : 3,
      classification.severity,
      isEnforcement,
      classification.confidence,
      sanitizedText,
      `Simulated live intelligence feed from live_signal_stream.csv (Seq: ${row.stream_seq || currentStreamIndex})`
    ]
  );

  const eventId = evtRes.insertId;

  // 6. Cryptographic Provenance Hash
  const payloadHash = crypto.createHash('sha256').update(JSON.stringify(row)).digest('hex');
  await pool.query(
    `INSERT INTO event_provenance 
     (event_id, source_department, source_file_name, sheet_name, source_row_number, raw_payload_hash, extraction_confidence, classification_method, transformation_log)
     VALUES (?, ?, 'live_signal_stream.csv', 'LiveStream', ?, ?, ?, ?, ?)`,
    [
      eventId,
      `${row.source_type || 'TELEMETRY'} Live Feed`,
      currentStreamIndex,
      payloadHash,
      classification.confidence,
      classification.classificationMethod,
      `Live simulation event ingested. PII Redacted: ${piiDetectedCount} items.`
    ]
  );

  // 7. Dynamic Risk Recalculation
  await recalculateDistrictRiskScores(districtId);

  // 8. Generate Alert if High Severity
  if (classification.severity === 'HIGH' || classification.severity === 'CRITICAL') {
    const alertCode = `ALT-LIVE-${Date.now().toString(36).toUpperCase()}`;
    await pool.query(
      `INSERT INTO alerts (alert_code, alert_type, severity, district_id, title, description, risk_level, confidence_level, data_coverage, event_id, status)
       VALUES (?, 'NEW_SIGNAL', ?, ?, ?, ?, 'HIGH PREVENTIVE ATTENTION', 'HIGH', 'GOOD', ?, 'NEW')`,
      [
        alertCode,
        classification.severity,
        districtId,
        `Live Stream Signal: ${row.location_name || 'Surveillance Node'}`,
        sanitizedText,
        eventId
      ]
    );
  }

  // 9. Append Audit Record
  await appendAuditRecord({
    actorUserId: 1,
    actionType: 'LIVE_SIMULATION_EVENT_INGESTED',
    entityType: 'INTELLIGENCE_EVENT',
    entityId: eventCode,
    payload: {
      streamSeq: row.stream_seq || currentStreamIndex,
      districtId,
      location: row.location_name,
      severity: classification.severity
    },
    ipAddress: '127.0.0.1'
  });

  return {
    success: true,
    message: `Live event #${row.stream_seq || currentStreamIndex} ingested from live_signal_stream.csv`,
    event: {
      id: eventId,
      event_code: eventCode,
      district_id: districtId,
      location_name: row.location_name,
      severity_level: classification.severity,
      is_enforcement: isEnforcement,
      sanitizedText,
      duplicateDetected: dupCheck.isDuplicate
    }
  };
}

export function getSimulationStatus() {
  const stream = loadStreamData();
  return {
    active: simulationActive,
    totalRecords: stream.length,
    currentIndex: currentStreamIndex,
    loopCount: Math.floor(currentStreamIndex / (stream.length || 1))
  };
}

export default {
  tickLiveSimulation,
  getSimulationStatus
};
