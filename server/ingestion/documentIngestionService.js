import crypto from 'crypto';
import pool from '../database/db.js';
import { runForecastInferenceForDistrict } from '../ai/forecastInferenceEngine.js';

/**
 * Document Drop Ingestion & Extraction Engine
 * Ingests external files, computes SHA-256, extracts structured observations, and triggers real-time updates.
 */
export async function ingestDocumentPayload({ fileName, fileContent, sourceType = 'DOCUMENT_DROP' }) {
  const sha256Hash = crypto.createHash('sha256').update(fileContent).digest('hex');
  const documentId = `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const conn = await pool.getConnection();
  try {
    // 1. Check duplicate document by hash
    const [existing] = await conn.query('SELECT document_id FROM documents WHERE sha256_hash = ?', [sha256Hash]);
    if (existing.length > 0) {
      conn.release();
      return {
        status: 'DUPLICATE_SKIPPED',
        documentId: existing[0].document_id,
        sha256Hash,
        message: 'Document already processed into MySQL ledger'
      };
    }

    // 2. Insert document record
    await conn.query(
      `INSERT INTO documents (document_id, file_name, sha256_hash, file_size, file_type, source_type, processing_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [documentId, fileName, sha256Hash, Buffer.byteLength(fileContent), 'TXT', sourceType, 'PROCESSED']
    );

    // 3. Extraction Simulation (NER & Location Parsing)
    const textStr = fileContent.toString('utf8');
    const districtMatch = textStr.match(/Chennai|Coimbatore|Madurai|Salem|Thoothukudi|Krishnagiri|Erode|Vellore/i) || ['Chennai'];
    const districtName = districtMatch[0];

    const [dRows] = await conn.query('SELECT id FROM districts WHERE district_name LIKE ?', [`%${districtName}%`]);
    const districtId = dRows.length > 0 ? dRows[0].id : 1;

    const substanceMatch = textStr.match(/Ganja|Cannabis|MDMA|Heroin|Opium|Prescription/i) || ['Ganja / Cannabis'];
    const substanceCategory = substanceMatch[0];

    const eventRef = `EVT-DOC-${Date.now()}`;
    const caseRef = `CASE-DOC-${Date.now()}`;
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Insert Raw Observation
    await conn.query(
      `INSERT INTO event_provenance (event_ref, source_id, document_id, case_ref, district_id, description, observed_at, reported_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [eventRef, 1, documentId, caseRef, districtId, textStr.slice(0, 200), nowStr, nowStr]
    );

    // Insert Extraction Metadata
    await conn.query(
      `INSERT INTO document_extractions (document_id, raw_text, extracted_json, entities_found)
       VALUES (?, ?, ?, ?)`,
      [
        documentId,
        textStr,
        JSON.stringify({ districtName, substanceCategory, caseRef, eventRef }),
        4
      ]
    );

    conn.release();

    // 4. Dependency-Aware Dynamic Recomputation
    const updatedForecast = await runForecastInferenceForDistrict(districtId);

    return {
      status: 'SUCCESS',
      documentId,
      sha256Hash,
      districtId,
      districtName,
      substanceCategory,
      eventRef,
      updatedForecast
    };
  } catch (err) {
    conn.release();
    throw err;
  }
}
