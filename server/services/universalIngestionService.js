import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { createWorker } from 'tesseract.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

import { redactPII } from './piiRedactionService.js';
import { resolveGeographicLocation } from './geoResolutionService.js';
import { classifySignalContent, suggestColumnMapping } from './aiClassificationService.js';

/**
 * Universal Multi-Format Intelligence Ingestion Engine
 * Handles Spreadsheets (CSV/XLSX), Digital PDFs, Scanned PDFs/Images (OCR), Word DOCX, and Text.
 */

// File category detector
export function detectFileType(filePath, originalName, mimeType = '') {
  const ext = path.extname(originalName).toLowerCase();
  
  if (['.csv'].includes(ext) || mimeType.includes('csv')) {
    return { category: 'SPREADSHEET_CSV', ext, isMultiRow: true };
  }
  if (['.xlsx', '.xls', '.xlsm', '.ods'].includes(ext) || mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return { category: 'SPREADSHEET_EXCEL', ext, isMultiRow: true };
  }
  if (['.pdf'].includes(ext) || mimeType.includes('pdf')) {
    return { category: 'PDF_DOCUMENT', ext, isMultiRow: false };
  }
  if (['.docx', '.doc'].includes(ext) || mimeType.includes('word') || mimeType.includes('officedocument.wordprocessingml')) {
    return { category: 'WORD_DOCUMENT', ext, isMultiRow: false };
  }
  if (['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'].includes(ext) || mimeType.includes('image')) {
    return { category: 'IMAGE_SCAN', ext, isMultiRow: false };
  }
  if (['.txt', '.log', '.json'].includes(ext) || mimeType.includes('text')) {
    return { category: 'PLAIN_TEXT', ext, isMultiRow: false };
  }

  return { category: 'UNKNOWN_FORMAT', ext, isMultiRow: false };
}

/**
 * Extract raw text from any document format
 */
export async function extractDocumentContent(filePath, originalName, mimeType = '') {
  const fileType = detectFileType(filePath, originalName, mimeType);

  let rawText = '';
  let ocrConfidence = 100.0;
  let extractionMethod = 'NATIVE_PARSER';
  let totalPages = 1;
  let structuredRows = [];

  switch (fileType.category) {
    case 'SPREADSHEET_CSV': {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
      structuredRows = parsed.data;
      rawText = content;
      extractionMethod = 'CSV_STREAM_PARSER';
      break;
    }

    case 'SPREADSHEET_EXCEL': {
      const wb = XLSX.readFile(filePath);
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      structuredRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      rawText = structuredRows.map((r) => Object.values(r).join(' ')).join('\n');
      extractionMethod = 'XLSX_WORKBOOK_PARSER';
      break;
    }

    case 'PDF_DOCUMENT': {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const parsed = await pdfParse(dataBuffer);
        rawText = parsed.text || '';
        totalPages = parsed.numpages || 1;
        extractionMethod = 'PDF_TEXT_STREAM';

        // If digital text is too sparse (< 25 chars), it's likely a scanned image PDF
        if (rawText.trim().length < 25) {
          rawText = `[SCANNED PDF ENCOUNTERED - OCR REQUIRED]\nSource Document: ${originalName}`;
          extractionMethod = 'PDF_SCANNED_IMAGE';
          ocrConfidence = 50.0;
        }
      } catch (err) {
        console.warn('PDF parse error:', err.message);
        rawText = `[PDF PARSE ERROR: ${err.message}]`;
        extractionMethod = 'PDF_ERROR_FALLBACK';
        ocrConfidence = 30.0;
      }
      break;
    }

    case 'WORD_DOCUMENT': {
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        rawText = result.value || '';
        extractionMethod = 'DOCX_XML_EXTRACTOR';
      } catch (err) {
        console.warn('DOCX extraction error:', err.message);
        rawText = `[DOCX PARSE ERROR: ${err.message}]`;
        extractionMethod = 'DOCX_ERROR_FALLBACK';
      }
      break;
    }

    case 'IMAGE_SCAN': {
      try {
        const worker = await createWorker('eng');
        const ret = await worker.recognize(filePath);
        rawText = ret.data.text || '';
        ocrConfidence = parseFloat(ret.data.confidence) || 75.0;
        extractionMethod = 'TESSERACT_OCR_ENGINE';
        await worker.terminate();
      } catch (err) {
        console.warn('OCR error:', err.message);
        rawText = `[OCR EXTRACTION FAILED: ${err.message}]`;
        extractionMethod = 'OCR_FALLBACK_FAIL';
        ocrConfidence = 20.0;
      }
      break;
    }

    case 'PLAIN_TEXT':
    default: {
      rawText = fs.readFileSync(filePath, 'utf8');
      extractionMethod = 'UTF8_RAW_READER';
      break;
    }
  }

  return {
    fileType,
    rawText,
    ocrConfidence,
    extractionMethod,
    totalPages,
    structuredRows
  };
}

/**
 * Parses unstructured document text (FIR, written complaint, checkpost report)
 * into a structured intelligence entity.
 */
export async function parseUnstructuredDocument(rawText, originalName) {
  const { sanitizedText, piiDetectedCount, piiTypes } = redactPII(rawText);

  // 1. Extract potential dates
  let eventDate = new Date().toISOString().slice(0, 10);
  const dateMatch = sanitizedText.match(/(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})|(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/);
  if (dateMatch) {
    try {
      const d = new Date(dateMatch[0]);
      if (!isNaN(d.getTime())) {
        eventDate = d.toISOString().slice(0, 10);
      }
    } catch {
      // ignore
    }
  }

  // 2. Extract Reference / FIR numbers
  let referenceNumber = null;
  const firMatch = sanitizedText.match(/(?:FIR\s*(?:Cr\.?\s*No\.?)?|Cr\.?\s*No\.?|Reference|Ref|Report\s*No|GD\s*Entry)[\s.:#/-]+([A-Z0-9/_-]+(?:\/\d+)?)/i);
  if (firMatch) {
    referenceNumber = firMatch[0].trim();
  }

  // 3. Extract Contraband Mentions & Quantities
  const substances = [];
  const lower = sanitizedText.toLowerCase();
  if (lower.includes('ganja') || lower.includes('cannabis') || lower.includes('weed')) substances.push('Ganja / Cannabis');
  if (lower.includes('mdma') || lower.includes('ecstasy') || lower.includes('methamphetamine') || lower.includes('meth') || lower.includes('synthetic')) substances.push('Synthetic Stimulants / MDMA');
  if (lower.includes('heroin') || lower.includes('brown sugar') || lower.includes('opioid') || lower.includes('opium')) substances.push('Heroin / Opioids');
  if (lower.includes('prescription') || lower.includes('painkiller') || lower.includes('alprazolam') || lower.includes('tramadol') || lower.includes('pills') || lower.includes('tablets')) substances.push('Prescription Narcotics');

  // 4. Document Type / Source Identification
  let docType = 'WRITTEN_COMPLAINT';
  let sourceDepartment = 'State Intelligence Ingestion Feed';
  let defaultSourceId = 3; // Citizen / Helpline fallback

  if (/fir|police station|cr\.?\s*no|section\s*8|ndps|inspector|sub-inspector|seizure mahazar/i.test(sanitizedText) || originalName.toLowerCase().includes('fir') || originalName.toLowerCase().includes('police')) {
    docType = 'POLICE_FIR_REPORT';
    sourceDepartment = 'Tamil Nadu Police Enforcement Wing';
    defaultSourceId = 1; // Enforcement
  } else if (/checkpost|toll|weighbridge|border|transit scan|lorry|cargo intercept/i.test(sanitizedText) || originalName.toLowerCase().includes('checkpost')) {
    docType = 'CHECKPOST_BORDER_REPORT';
    sourceDepartment = 'State Checkpost Monitoring Telemetry';
    defaultSourceId = 2; // Checkpost
  } else if (/hospital|patient|admission|intake|detox|overdose|emergency/i.test(sanitizedText)) {
    docType = 'HEALTH_AGGREGATE_SIGNAL';
    sourceDepartment = 'Health & De-Addiction Services Registry';
    defaultSourceId = 5; // Health
  } else if (/helpline|1058|telephonic tip|caller/i.test(sanitizedText)) {
    docType = 'HELPLINE_TIP';
    sourceDepartment = 'Anti-Drug Helpline 1058';
    defaultSourceId = 4; // Helpline
  }

  // 5. Geographic Resolution
  const geoResult = await resolveGeographicLocation({
    locationText: sanitizedText.slice(0, 500),
    districtMention: ''
  });

  // 6. AI / Rule-Based Classification
  const classification = await classifySignalContent(sanitizedText);

  // 7. Determine Verification Requirement Flag
  let verificationStatus = 'NEW_SIGNAL';
  let verificationReason = null;

  if (!geoResult.resolved) {
    verificationStatus = 'NEEDS_VERIFICATION';
    verificationReason = 'UNRESOLVED_LOCATION';
  } else if (classification.confidence < 70) {
    verificationStatus = 'NEEDS_VERIFICATION';
    verificationReason = 'LOW_AI_CONFIDENCE';
  }

  return {
    docType,
    sourceDepartment,
    defaultSourceId,
    eventDate,
    referenceNumber,
    substances,
    geoResult,
    classification,
    verificationStatus,
    verificationReason,
    piiDetectedCount,
    piiTypes,
    sanitizedText
  };
}
