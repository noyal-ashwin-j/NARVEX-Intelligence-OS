import crypto from 'crypto';
import fs from 'fs';
import pool from '../database/db.js';
import { redactPII } from '../services/piiRedactionService.js';
import { classifySignalContent, suggestColumnMapping } from '../services/aiClassificationService.js';
import { resolveGeographicLocation, getDistrictDictionary } from '../services/geoResolutionService.js';
import { extractDocumentContent, parseUnstructuredDocument, detectFileType } from '../services/universalIngestionService.js';
import { detectDuplicatesAndBursts } from '../services/duplicateDetectionService.js';
import { appendAuditRecord } from '../services/hashChainService.js';
import { recalculateDistrictRiskScores, evaluateFirstTimeLocality } from '../services/backgroundIntelligenceService.js';

/**
 * NARVEX Universal Intelligence Ingestion Controller
 * Zero-format input engine: Accepts Excel, CSV, PDF, FIR scan, Complaint Photo, Word DOCX, TXT.
 */

export async function uploadUniversalFeed(req, res) {
  const files = req.files || (req.file ? [req.file] : []);

  if (files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please upload at least one intelligence document or data file.'
    });
  }

  const batchCode = `NX-FEED-${Date.now().toString().slice(-6)}`;
  const batchSummary = {
    batchCode,
    totalFiles: files.length,
    totalSignalsCreated: 0,
    completedFiles: 0,
    needsReviewFiles: 0,
    failedFiles: 0,
    fileResults: [],
    createdSignals: []
  };

  try {
    // Load categories dictionary
    const [categories] = await pool.query('SELECT id, category_key, category_name FROM event_categories');
    const catMap = new Map();
    categories.forEach((c) => {
      catMap.set(c.category_key.toLowerCase(), c.id);
      catMap.set(c.category_name.toLowerCase(), c.id);
    });

    // Process each uploaded file
    for (let fIdx = 0; fIdx < files.length; fIdx++) {
      const file = files[fIdx];
      const filePath = file.path;
      const originalName = file.originalname;
      const mimeType = file.mimetype;
      const fileSize = file.size;

      const fileResult = {
        fileIndex: fIdx + 1,
        fileName: originalName,
        fileSize,
        detectedType: null,
        extractionMethod: null,
        status: 'PROCESSING',
        signalsCount: 0,
        needsReviewCount: 0,
        duplicateCount: 0,
        ocrConfidence: 100,
        signals: [],
        error: null
      };

      try {
        // 1. Text & Content Extraction
        const extracted = await extractDocumentContent(filePath, originalName, mimeType);
        fileResult.detectedType = extracted.fileType.category;
        fileResult.extractionMethod = extracted.extractionMethod;
        fileResult.ocrConfidence = extracted.ocrConfidence;

        // 2. Create Batch Database Record
        const [batchDbRes] = await pool.query(
          `INSERT INTO data_upload_batches 
           (batch_code, file_name, file_type, file_size_bytes, total_rows, uploader_user_id, status)
           VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
          [
            `${batchCode}-${fIdx + 1}`,
            originalName,
            extracted.fileType.category,
            fileSize,
            extracted.fileType.isMultiRow ? extracted.structuredRows.length : 1,
            req.user?.id || null
          ]
        );
        const batchDbId = batchDbRes.insertId;

        // 3. Process Content Based on Multi-Row Spreadsheet vs Unstructured Document
        if (extracted.fileType.isMultiRow && extracted.structuredRows.length > 0) {
          // --- SPREADSHEET (CSV / EXCEL) MULTI-RECORD INGESTION ---
          const rows = extracted.structuredRows;
          const headers = Object.keys(rows[0] || {});
          const mappingSuggestion = await suggestColumnMapping(headers);
          const map = mappingSuggestion.mapping;

          let fileValid = 0;
          let fileReview = 0;
          let fileDuplicates = 0;

          for (let rIdx = 0; rIdx < rows.length; rIdx++) {
            const row = rows[rIdx];
            const rawDesc = String(row[map.description] || row.description || row.details || Object.values(row).join(' '));
            const rawDate = String(row[map.date] || row.date || row.event_date || new Date().toISOString().slice(0, 10));
            const rawDist = String(row[map.district] || row.district || row.district_name || '');
            const rawLoc = String(row[map.location] || row.location || row.area || row.station || 'State Transport Junction');
            const rawSource = String(row[map.source] || row.source || row.department || 'Enforcement Log');

            // A. PII Redaction
            const { sanitizedText, piiDetectedCount, piiTypes } = redactPII(rawDesc);

            // B. Geographic Resolution
            const geo = await resolveGeographicLocation({
              locationText: `${rawLoc} ${rawDist}`,
              districtMention: rawDist
            });

            // C. AI Classification
            const classification = await classifySignalContent(sanitizedText);
            const categoryId = catMap.get(classification.categoryKey.toLowerCase()) || 2;

            // D. Fallback default district if completely unresolved
            const assignedDistrictId = geo.resolved ? geo.district.id : 2; // Coimbatore default
            const assignedLat = geo.resolved ? geo.lat : 11.0168;
            const assignedLng = geo.resolved ? geo.lng : 76.9558;

            // E. Duplicate Detection
            const dupCheck = await detectDuplicatesAndBursts({
              districtId: assignedDistrictId,
              eventDate: rawDate.slice(0, 10),
              lat: assignedLat,
              lng: assignedLng,
              description: sanitizedText,
              categoryId
            });

            if (dupCheck.isDuplicate) fileDuplicates++;

            // F. First-Time / Zero-History Locality Check
            const firstTimeCheck = await evaluateFirstTimeLocality(assignedDistrictId, geo.locationName);
            const isFirstTime = firstTimeCheck.isFirstTime;

            // G. Verification State
            let verificationStatus = 'VERIFIED';
            if (!geo.resolved || isFirstTime) {
              verificationStatus = 'NEEDS_VERIFICATION';
              fileReview++;
            } else if (dupCheck.isDuplicate) {
              verificationStatus = 'NEEDS_VERIFICATION';
              fileReview++;
            } else {
              fileValid++;
            }

            // H. Insert Intelligence Event
            const eventCode = `NXR-${Date.now().toString().slice(-4)}-${fIdx + 1}${rIdx + 1}`;
            const [evtRes] = await pool.query(
              `INSERT INTO intelligence_events 
               (event_code, district_id, location_name, lat, lng, event_date, category_id, source_id, severity_level, is_enforcement, verification_status, confidence_score, coverage_flag, raw_description_redacted, is_first_time_signal, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                eventCode,
                assignedDistrictId,
                geo.locationName,
                assignedLat,
                assignedLng,
                rawDate.slice(0, 10),
                categoryId,
                1,
                classification.severity,
                classification.categoryKey === 'SEIZURE_ENFORCEMENT' ? 1 : 0,
                verificationStatus,
                classification.confidence,
                geo.resolved ? 'GOOD' : 'LIMITED',
                sanitizedText,
                isFirstTime ? 1 : 0,
                `Universal Feed from ${originalName} (Row ${rIdx + 1}). ${isFirstTime ? '🟣 FIRST-TIME SIGNAL (Zero Historical Baseline).' : ''} Duplicate Score: ${dupCheck.duplicateScore}%`
              ]
            );

            const eventId = evtRes.insertId;

            // Generate First-Time Signal Alert
            if (isFirstTime) {
              const alertCode = `ALT-NEW-${Date.now().toString().slice(-4)}-${eventId}`;
              await pool.query(
                `INSERT INTO alerts (alert_code, alert_type, severity, district_id, title, description, risk_level, confidence_level, data_coverage, event_id, status)
                 VALUES (?, 'NEW_SIGNAL', 'HIGH', ?, ?, ?, 'HIGH PREVENTIVE ATTENTION', 'MEDIUM', 'LIMITED', ?, 'NEW')`,
                [
                  alertCode,
                  assignedDistrictId,
                  `🟣 First-Time Signal: ${geo.locationName}`,
                  `First recorded intelligence signal in "${geo.locationName}" (zero prior historical baseline). Scheduled for human verification.`,
                  eventId
                ]
              );
            }

            // H. Provenance Record
            const rowHash = crypto.createHash('sha256').update(JSON.stringify(row)).digest('hex');
            await pool.query(
              `INSERT INTO event_provenance 
               (event_id, source_department, source_file_name, sheet_name, source_row_number, batch_id, raw_payload_hash, extraction_confidence, classification_method, human_reviewer_id, transformation_log)
               VALUES (?, ?, ?, 'Sheet1', ?, ?, ?, ?, ?, ?, ?)`,
              [
                eventId,
                rawSource,
                originalName,
                rIdx + 1,
                batchDbId,
                rowHash,
                classification.confidence,
                classification.classificationMethod,
                req.user?.id || null,
                `PII Redacted: ${piiDetectedCount} items. Geo: ${geo.resolutionMethod}. Duplicate: ${dupCheck.isDuplicate ? `YES (${dupCheck.duplicateScore}%)` : 'NO'}`
              ]
            );

            const signalItem = {
              signalId: eventId,
              eventCode,
              districtName: geo.resolved ? geo.district.name : 'UNRESOLVED (Needs Review)',
              location: geo.locationName,
              category: classification.categoryKey,
              severity: classification.severity,
              confidence: classification.confidence,
              verificationStatus,
              isDuplicate: dupCheck.isDuplicate,
              duplicateScore: dupCheck.duplicateScore,
              piiRedactedCount: piiDetectedCount,
              provenance: {
                fileName: originalName,
                row: rIdx + 1,
                hash: rowHash.slice(0, 16) + '...'
              }
            };

            fileResult.signals.push(signalItem);
            batchSummary.createdSignals.push(signalItem);
          }

          fileResult.signalsCount = rows.length;
          fileResult.needsReviewCount = fileReview;
          fileResult.duplicateCount = fileDuplicates;
          fileResult.status = fileReview > 0 ? 'NEEDS_REVIEW' : 'COMPLETED';

          await pool.query(
            `UPDATE data_upload_batches 
             SET status = 'INGESTED', valid_rows = ?, duplicate_rows = ? 
             WHERE id = ?`,
            [fileValid, fileDuplicates, batchDbId]
          );
        } else {
          // --- UNSTRUCTURED DOCUMENT (PDF, WORD, IMAGE OCR, TXT) ---
          const doc = await parseUnstructuredDocument(extracted.rawText, originalName);

          const categoryId = catMap.get(doc.classification.categoryKey.toLowerCase()) || 2;
          const assignedDistrictId = doc.geoResult.resolved ? doc.geoResult.district.id : 2;
          const assignedLat = doc.geoResult.resolved ? doc.geoResult.lat : 11.0168;
          const assignedLng = doc.geoResult.resolved ? doc.geoResult.lng : 76.9558;

          // Duplicate Check
          const dupCheck = await detectDuplicatesAndBursts({
            districtId: assignedDistrictId,
            eventDate: doc.eventDate,
            lat: assignedLat,
            lng: assignedLng,
            description: doc.sanitizedText,
            categoryId,
            referenceNumber: doc.referenceNumber
          });

          // First-Time / Zero-History Locality Check
          const firstTimeCheck = await evaluateFirstTimeLocality(assignedDistrictId, doc.geoResult.locationName);
          const isFirstTime = firstTimeCheck.isFirstTime;

          let verificationStatus = 'VERIFIED';
          if (!doc.geoResult.resolved || doc.classification.confidence < 70 || dupCheck.isDuplicate || isFirstTime) {
            verificationStatus = 'NEEDS_VERIFICATION';
          }

          const eventCode = `NXR-DOC-${Date.now().toString().slice(-4)}-${fIdx + 1}`;
          const [evtRes] = await pool.query(
            `INSERT INTO intelligence_events 
             (event_code, district_id, location_name, lat, lng, event_date, category_id, source_id, severity_level, is_enforcement, verification_status, confidence_score, coverage_flag, raw_description_redacted, is_first_time_signal, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              eventCode,
              assignedDistrictId,
              doc.geoResult.locationName,
              assignedLat,
              assignedLng,
              doc.eventDate,
              categoryId,
              doc.defaultSourceId,
              doc.classification.severity,
              doc.classification.categoryKey === 'SEIZURE_ENFORCEMENT' ? 1 : 0,
              verificationStatus,
              doc.classification.confidence,
              doc.geoResult.resolved ? 'GOOD' : 'LIMITED',
              doc.sanitizedText,
              isFirstTime ? 1 : 0,
              `Universal Feed from ${originalName}. Ref: ${doc.referenceNumber || 'N/A'}. ${isFirstTime ? '🟣 FIRST-TIME SIGNAL (Zero Historical Baseline).' : ''} Method: ${extracted.extractionMethod}`
            ]
          );

          const eventId = evtRes.insertId;

          // Generate First-Time Signal Alert
          if (isFirstTime) {
            const alertCode = `ALT-NEW-${Date.now().toString().slice(-4)}-${eventId}`;
            await pool.query(
              `INSERT INTO alerts (alert_code, alert_type, severity, district_id, title, description, risk_level, confidence_level, data_coverage, event_id, status)
               VALUES (?, 'NEW_SIGNAL', 'HIGH', ?, ?, ?, 'HIGH PREVENTIVE ATTENTION', 'MEDIUM', 'LIMITED', ?, 'NEW')`,
              [
                alertCode,
                assignedDistrictId,
                `🟣 First-Time Signal: ${doc.geoResult.locationName}`,
                `First recorded intelligence signal in "${doc.geoResult.locationName}" (zero prior historical baseline). Scheduled for human verification.`,
                eventId
              ]
            );
          }

          // Provenance Record
          const docHash = crypto.createHash('sha256').update(extracted.rawText).digest('hex');
          await pool.query(
            `INSERT INTO event_provenance 
             (event_id, source_department, source_file_name, sheet_name, source_row_number, batch_id, raw_payload_hash, extraction_confidence, classification_method, human_reviewer_id, transformation_log)
             VALUES (?, ?, ?, 'Page 1', 1, ?, ?, ?, ?, ?, ?)`,
            [
              eventId,
              doc.sourceDepartment,
              originalName,
              batchDbId,
              docHash,
              doc.classification.confidence,
              doc.classification.classificationMethod,
              req.user?.id || null,
              `PII: ${doc.piiDetectedCount} redacted. Geo: ${doc.geoResult.resolutionMethod}. OCR Conf: ${extracted.ocrConfidence}%`
            ]
          );

          const signalItem = {
            signalId: eventId,
            eventCode,
            districtName: doc.geoResult.resolved ? doc.geoResult.district.name : 'UNRESOLVED (Needs Review)',
            location: doc.geoResult.locationName,
            category: doc.classification.categoryKey,
            severity: doc.classification.severity,
            confidence: doc.classification.confidence,
            verificationStatus,
            referenceNumber: doc.referenceNumber,
            substances: doc.substances,
            isDuplicate: dupCheck.isDuplicate,
            duplicateScore: dupCheck.duplicateScore,
            matchFactors: dupCheck.matchFactors || [],
            piiRedactedCount: doc.piiDetectedCount,
            ocrConfidence: extracted.ocrConfidence,
            provenance: {
              fileName: originalName,
              sourceDept: doc.sourceDepartment,
              hash: docHash.slice(0, 16) + '...'
            }
          };

          fileResult.signals.push(signalItem);
          batchSummary.createdSignals.push(signalItem);
          fileResult.signalsCount = 1;
          fileResult.needsReviewCount = verificationStatus === 'NEEDS_VERIFICATION' ? 1 : 0;
          fileResult.duplicateCount = dupCheck.isDuplicate ? 1 : 0;
          fileResult.status = verificationStatus === 'NEEDS_VERIFICATION' ? 'NEEDS_REVIEW' : 'COMPLETED';

          await pool.query(
            `UPDATE data_upload_batches 
             SET status = 'INGESTED', valid_rows = 1, duplicate_rows = ? 
             WHERE id = ?`,
            [dupCheck.isDuplicate ? 1 : 0, batchDbId]
          );
        }

        if (fileResult.status === 'COMPLETED') {
          batchSummary.completedFiles++;
        } else {
          batchSummary.needsReviewFiles++;
        }
      } catch (fileErr) {
        console.error(`Error processing file ${originalName}:`, fileErr);
        fileResult.status = 'FAILED';
        fileResult.error = fileErr.message;
        batchSummary.failedFiles++;
      }

      batchSummary.fileResults.push(fileResult);
    }

    batchSummary.totalSignalsCreated = batchSummary.createdSignals.length;

    // 4. Live State Intelligence & Risk Recalculation
    await recalculateDistrictRiskScores();

    // 5. SHA-256 Audit Log
    await appendAuditRecord({
      actorUserId: req.user?.id || null,
      actionType: 'UNIVERSAL_FEED_INGESTED',
      entityType: 'INTELLIGENCE_BATCH',
      entityId: batchCode,
      payload: {
        totalFiles: batchSummary.totalFiles,
        signalsCreated: batchSummary.totalSignalsCreated,
        completed: batchSummary.completedFiles,
        needsReview: batchSummary.needsReviewFiles
      },
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: `Universal feed processed. Created ${batchSummary.totalSignalsCreated} structured intelligence signals.`,
      summary: batchSummary
    });
  } catch (err) {
    console.error('Universal feed ingestion error:', err);
    return res.status(500).json({
      success: false,
      message: `Ingestion failed: ${err.message}`
    });
  }
}

/**
 * Handle Duplicate Action (Merge or Keep Separate)
 */
export async function resolveDuplicateSignal(req, res) {
  const { signalId } = req.params;
  const { action, mergeIntoEventId } = req.body; // 'MERGE' or 'KEEP_SEPARATE'

  try {
    if (action === 'MERGE' && mergeIntoEventId) {
      // Mark signal as REJECTED/MERGED and append note
      await pool.query(
        `UPDATE intelligence_events 
         SET verification_status = 'REJECTED', notes = CONCAT(COALESCE(notes, ''), ' [Merged into Event #', ?, ']')
         WHERE id = ?`,
        [mergeIntoEventId, signalId]
      );
    } else {
      // Keep separate and verify
      await pool.query(
        `UPDATE intelligence_events 
         SET verification_status = 'VERIFIED', notes = CONCAT(COALESCE(notes, ''), ' [Confirmed Separate Signal by Officer]')
         WHERE id = ?`,
        [signalId]
      );
    }

    await recalculateDistrictRiskScores();

    return res.json({ success: true, message: `Duplicate action '${action}' applied successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Legacy preview endpoint preserved for backward compatibility
 */
export async function uploadAndPreviewFile(req, res) {
  return uploadUniversalFeed(req, res);
}

/**
 * Legacy execute batch endpoint preserved for backward compatibility
 */
export async function executeBatchIngestion(req, res) {
  return res.json({
    success: true,
    message: 'Batch already automatically ingested into state intelligence repository.'
  });
}
