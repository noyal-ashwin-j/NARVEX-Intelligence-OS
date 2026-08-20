import fs from 'fs';
import path from 'path';
import pool from './database/db.js';
import { extractDocumentContent, parseUnstructuredDocument } from './services/universalIngestionService.js';
import { resolveGeographicLocation } from './services/geoResolutionService.js';
import { recalculateDistrictRiskScores } from './services/backgroundIntelligenceService.js';

async function testUniversalPipeline() {
  console.log('🧪 Testing NARVEX Universal Ingestion Pipeline directly...\n');

  // Test 1: Sample Multi-row Checkpost CSV
  const csvPath = path.resolve('../sample_checkpost_ingestion.csv');
  if (fs.existsSync(csvPath)) {
    const extractedCsv = await extractDocumentContent(csvPath, 'sample_checkpost_ingestion.csv', 'text/csv');
    console.log(`✅ CSV Extraction: ${extractedCsv.structuredRows.length} rows parsed from sample file.`);
    
    // Check column mapping
    const headers = Object.keys(extractedCsv.structuredRows[0] || {});
    const { suggestColumnMapping } = await import('./services/aiClassificationService.js');
    const mappingRes = await suggestColumnMapping(headers);
    console.log(`✅ Auto-Mapped Columns:`, JSON.stringify(mappingRes.mapping));

    // Check first row district resolution with mapped columns
    const row1 = extractedCsv.structuredRows[0];
    const rawDist = row1[mappingRes.mapping.district] || row1.District || row1.district;
    const rawLoc = row1[mappingRes.mapping.location] || row1.Location || row1.location;
    const geo = await resolveGeographicLocation({
      locationText: `${rawLoc} ${rawDist}`,
      districtMention: rawDist
    });
    console.log(`✅ Geo Resolution on CSV row: Resolved -> ${geo.resolved ? geo.district.name : 'Unresolved'} (Confidence: ${geo.confidence}%)`);
  }

  // Test 2: Unstructured Text / Complaint
  const complaintText = `Yesterday around 8 PM near Singanallur bus stop, observed suspicious exchange of brown packets from a white car. Please investigate.`;
  const parsed = await parseUnstructuredDocument(complaintText, 'citizen_complaint_01.txt');
  console.log(`✅ Unstructured Complaint Parsed:`);
  console.log(`   - Doc Type: ${parsed.docType}`);
  console.log(`   - District: ${parsed.geoResult.resolved ? parsed.geoResult.district.name : 'UNRESOLVED'}`);
  console.log(`   - Category: ${parsed.classification.categoryKey}`);
  console.log(`   - Severity: ${parsed.classification.severity}`);
  console.log(`   - Verification Status: ${parsed.verificationStatus}`);

  // Test 3: Background Intelligence Risk Recalculation
  const recalc = await recalculateDistrictRiskScores(2); // Coimbatore
  console.log(`✅ State Intelligence Recalculation: updated status ${recalc.success}`);

  console.log('\n✨ Universal Feed & Ingestion Pipeline verification complete!');
  process.exit(0);
}

testUniversalPipeline().catch((err) => {
  console.error('Pipeline test failed:', err);
  process.exit(1);
});
