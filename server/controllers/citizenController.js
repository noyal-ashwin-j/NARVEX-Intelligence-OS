import crypto from 'crypto';
import pool from '../database/db.js';
import { redactPII } from '../services/piiRedactionService.js';
import { appendAuditRecord } from '../services/hashChainService.js';
import { detectDuplicatesAndBursts } from '../services/duplicateDetectionService.js';

function generateTrackingToken() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
  for (let i = 0; i < 4; i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  return `TN-${p1}-${p2}`;
}

/**
 * Omnichannel Citizen Tip / Complaint Submission
 * Supports: WEB_PORTAL, PHONE_IVR_1058, WHATSAPP_BOT, ENCRYPTED_EMAIL, DIRECT_DISPATCH
 */
export async function submitCitizenReport(req, res) {
  try {
    const {
      approximateDistrictId,
      approximateTalukId,
      approximateLocation,
      lat,
      lng,
      reportDate,
      categoryId,
      description,
      audioTranscript,
      attachmentName,
      intakeChannel = 'WEB_PORTAL'
    } = req.body;

    if (!approximateDistrictId || !approximateLocation || !description) {
      return res.status(400).json({
        success: false,
        message: 'District, approximate location, and description are required.'
      });
    }

    // 1. PII Redaction
    const { sanitizedText, piiDetectedCount, piiTypes } = redactPII(description);
    const trackingToken = generateTrackingToken();
    const prefix = intakeChannel === 'PHONE_IVR_1058' ? 'IVR' : intakeChannel === 'WHATSAPP_BOT' ? 'WA' : intakeChannel === 'ENCRYPTED_EMAIL' ? 'EML' : 'CIT';
    const reportCode = `${prefix}-${Date.now().toString().slice(-6)}`;
    const finalDate = reportDate || new Date().toISOString().slice(0, 10);
    const finalLat = parseFloat(lat) || 11.0;
    const finalLng = parseFloat(lng) || 77.0;
    const finalCatId = parseInt(categoryId, 10) || 4; // default Community Concern

    // 2. Automated Red-Flag / Duplicate / Burst Check
    const { isDuplicate, duplicateOfEventId, duplicateScore, isBurst, burstCount } =
      await detectDuplicatesAndBursts({
        districtId: approximateDistrictId,
        eventDate: finalDate,
        lat: finalLat,
        lng: finalLng,
        description: sanitizedText,
        categoryId: finalCatId
      });

    // Check if intake_channel column exists
    const [cols] = await pool.query('DESCRIBE citizen_reports');
    const colNames = cols.map((c) => c.Field);
    if (!colNames.includes('intake_channel')) {
      await pool.query("ALTER TABLE citizen_reports ADD COLUMN intake_channel VARCHAR(50) DEFAULT 'WEB_PORTAL'");
    }

    // 3. Insert Citizen Report
    const [result] = await pool.query(
      `INSERT INTO citizen_reports 
       (report_code, tracking_token, approximate_district_id, approximate_taluk_id, approximate_location, lat, lng, report_date, category_id, redacted_content, audio_transcript, has_attachment, attachment_name, status, duplicate_flag, burst_pattern_flag, confidence_score, intake_channel)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RECEIVED', ?, ?, ?, ?)`,
      [
        reportCode,
        trackingToken,
        approximateDistrictId,
        approximateTalukId || null,
        approximateLocation,
        finalLat,
        finalLng,
        finalDate,
        finalCatId,
        sanitizedText,
        audioTranscript || null,
        attachmentName ? 1 : 0,
        attachmentName || null,
        isDuplicate ? 1 : 0,
        isBurst ? 1 : 0,
        isDuplicate ? 35.0 : 50.0,
        intakeChannel
      ]
    );

    const citizenReportId = result.insertId;

    // 4. Create Anonymous Tracking Token Lifecycle Record
    await pool.query(
      `INSERT INTO anonymous_tracking_tokens 
       (token_code, citizen_report_id, current_stage, stage_received_at, public_status_message)
       VALUES (?, ?, 'RECEIVED', NOW(), 'Signal securely recorded in state intelligence queue for verification.')`,
      [trackingToken, citizenReportId]
    );

    // 5. If Red Flags detected, record them
    if (isDuplicate) {
      await pool.query(
        `INSERT INTO report_red_flags (report_id, flag_type, reason, score) VALUES (?, 'POTENTIAL_DUPLICATE', ?, ?)`,
        [citizenReportId, `Matches event #${duplicateOfEventId} within spatial-temporal proximity`, duplicateScore]
      );
    }
    if (isBurst) {
      await pool.query(
        `INSERT INTO report_red_flags (report_id, flag_type, reason, score) VALUES (?, 'COORDINATED_BURST', ?, ?)`,
        [citizenReportId, `Burst pattern detected: ${burstCount} reports in district within 7 days`, 75.0]
      );
    }

    // 6. Audit Chain Entry
    await appendAuditRecord({
      actorUserId: req.user?.id || null,
      actionType: 'CITIZEN_REPORT_SUBMITTED',
      entityType: 'CITIZEN_REPORT',
      entityId: citizenReportId,
      payload: { token: trackingToken, intakeChannel, piiDetectedCount, isDuplicate, isBurst },
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.status(201).json({
      success: true,
      message: `Citizen intelligence tip registered anonymously via ${intakeChannel}.`,
      trackingToken,
      reportCode,
      intakeChannel,
      piiSanitized: piiDetectedCount > 0,
      piiDetectedCount
    });
  } catch (err) {
    console.error('Citizen report submission error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Public Anonymous Token Lookup
 */
export async function trackCitizenReport(req, res) {
  const { token } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT 
        att.token_code,
        att.current_stage,
        att.stage_received_at,
        att.stage_review_at,
        att.stage_corroboration_at,
        att.stage_referred_at,
        att.stage_closed_at,
        att.public_status_message,
        att.updated_at,
        cr.report_date,
        cr.approximate_location,
        cr.intake_channel,
        d.name as district_name,
        c.category_name
       FROM anonymous_tracking_tokens att
       JOIN citizen_reports cr ON att.citizen_report_id = cr.id
       JOIN districts d ON cr.approximate_district_id = d.id
       JOIN event_categories c ON cr.category_id = c.id
       WHERE att.token_code = ?`,
      [token.trim().toUpperCase()]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No record found matching the provided anonymous tracking token.'
      });
    }

    return res.json({
      success: true,
      reportStatus: rows[0]
    });
  } catch (err) {
    console.error('Citizen tracking lookup error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Verification Queue for Intelligence Analysts
 */
export async function getVerificationQueue(req, res) {
  try {
    const { status = 'ALL', districtId, intakeChannel, page = 1, limit = 20 } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status !== 'ALL') {
      whereClause += ' AND cr.status = ?';
      params.push(status);
    }
    if (districtId && districtId !== 'ALL') {
      whereClause += ' AND cr.approximate_district_id = ?';
      params.push(districtId);
    }
    if (intakeChannel && intakeChannel !== 'ALL' && intakeChannel !== 'undefined') {
      whereClause += ' AND cr.intake_channel = ?';
      params.push(intakeChannel);
    }

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM citizen_reports cr ${whereClause}`, params);
    const total = countRows[0]?.total || 0;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [reports] = await pool.query(
      `SELECT 
        cr.*,
        d.name as district_name,
        c.category_name,
        c.category_key,
        att.current_stage,
        att.public_status_message,
        GROUP_CONCAT(CONCAT(rf.flag_type, '::', rf.reason) SEPARATOR '||') as red_flags_concat
       FROM citizen_reports cr
       JOIN districts d ON cr.approximate_district_id = d.id
       JOIN event_categories c ON cr.category_id = c.id
       LEFT JOIN anonymous_tracking_tokens att ON cr.id = att.citizen_report_id
       LEFT JOIN report_red_flags rf ON cr.id = rf.report_id
       ${whereClause}
       GROUP BY cr.id
       ORDER BY cr.report_date DESC, cr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    const formatted = reports.map((r) => {
      const redFlags = [];
      if (r.red_flags_concat) {
        r.red_flags_concat.split('||').forEach((item) => {
          const [flagType, reason] = item.split('::');
          redFlags.push({ flagType, reason });
        });
      }
      return { ...r, redFlags };
    });

    return res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      reports: formatted
    });
  } catch (err) {
    console.error('Verification queue fetch error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Analyst Verification / Triage Action on Citizen Report
 */
export async function triageCitizenReport(req, res) {
  const { id } = req.params;
  const { newStatus, reviewerNotes, promoteToEvent } = req.body;

  try {
    const [reportRows] = await pool.query('SELECT * FROM citizen_reports WHERE id = ?', [id]);
    if (reportRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }
    const report = reportRows[0];

    await pool.query(
      `UPDATE citizen_reports 
       SET status = ?, reviewer_notes = ?, assigned_officer_id = ?, updated_at = NOW() 
       WHERE id = ?`,
      [newStatus, reviewerNotes || report.reviewer_notes, req.user?.id || null, id]
    );

    let stage = 'UNDER_REVIEW';
    let msg = 'Signal is under verified assessment by state analysts.';
    if (newStatus === 'CORROBORATING') {
      stage = 'CORROBORATED';
      msg = 'Signal corroborated with regional data and queued for preventive verification.';
    } else if (newStatus === 'REFERRED_FOR_PREVENTION') {
      stage = 'REFERRED';
      msg = 'Signal assigned to district authority for preventive field coordination.';
    } else if (newStatus === 'CLOSED') {
      stage = 'CLOSED';
      msg = 'Preventive review concluded.';
    }

    await pool.query(
      `UPDATE anonymous_tracking_tokens 
       SET current_stage = ?, public_status_message = ?, updated_at = NOW(),
           stage_review_at = COALESCE(stage_review_at, NOW()),
           stage_corroboration_at = CASE WHEN ? = 'CORROBORATED' THEN NOW() ELSE stage_corroboration_at END,
           stage_referred_at = CASE WHEN ? = 'REFERRED' THEN NOW() ELSE stage_referred_at END,
           stage_closed_at = CASE WHEN ? = 'CLOSED' THEN NOW() ELSE stage_closed_at END
       WHERE citizen_report_id = ?`,
      [stage, msg, stage, stage, stage, id]
    );

    let promotedEventId = null;
    if (promoteToEvent) {
      const eventCode = `EVT-CIT-${report.id}-${Date.now().toString().slice(-4)}`;
      const [insResult] = await pool.query(
        `INSERT INTO intelligence_events 
         (event_code, district_id, taluk_id, location_name, lat, lng, event_date, category_id, source_id, severity_level, is_enforcement, verification_status, confidence_score, raw_description_redacted, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 3, 'MEDIUM', 0, 'CORROBORATED', ?, ?, ?)`,
        [
          eventCode,
          report.approximate_district_id,
          report.approximate_taluk_id,
          report.approximate_location,
          report.lat,
          report.lng,
          report.report_date,
          report.category_id,
          report.confidence_score,
          report.redacted_content,
          `Promoted from citizen report ${report.report_code}. Channel: ${report.intake_channel || 'WEB_PORTAL'}. Analyst notes: ${reviewerNotes || ''}`
        ]
      );
      promotedEventId = insResult.insertId;

      await pool.query(
        `INSERT INTO event_provenance 
         (event_id, source_department, source_file_name, source_row_number, raw_payload_hash, extraction_confidence, classification_method, human_reviewer_id, review_timestamp, transformation_log)
         VALUES (?, 'State Anonymous Citizen Portal', ?, 1, ?, ?, 'MANUAL_OFFICER_ENTRY', ?, NOW(), ?)`,
        [
          promotedEventId,
          report.report_code,
          crypto.createHash('sha256').update(report.redacted_content).digest('hex'),
          report.confidence_score,
          req.user?.id || null,
          `Verified and promoted by ${req.user?.full_name || 'Authorized Officer'}. Channel: ${report.intake_channel || 'WEB_PORTAL'}`
        ]
      );
    }

    await appendAuditRecord({
      actorUserId: req.user?.id || null,
      actionType: 'CITIZEN_REPORT_TRIAGED',
      entityType: 'CITIZEN_REPORT',
      entityId: id,
      payload: { newStatus, promotedEventId, notes: reviewerNotes },
      ipAddress: req.ip || '127.0.0.1'
    });

    return res.json({
      success: true,
      message: 'Citizen report status updated successfully.',
      promotedEventId
    });
  } catch (err) {
    console.error('Triage citizen report error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
