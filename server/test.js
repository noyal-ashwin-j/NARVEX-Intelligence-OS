import { testConnection } from './database/db.js';
import pool from './database/db.js';
import { verifyChainIntegrity, appendAuditRecord } from './services/hashChainService.js';
import { redactPII } from './services/piiRedactionService.js';
import { classifySignalContent } from './services/aiClassificationService.js';
import { enforceDistrictScope } from './middleware/authMiddleware.js';

async function runVerificationSuite() {
  console.log('🧪 Starting NARC-INTEL (N-RISE) Automated Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Database Connectivity
  const dbStatus = await testConnection();
  assert(dbStatus.ok, `Database connection to MySQL narvex established: ${dbStatus.message || dbStatus.error}`);

  // 2. All 38 Districts Check
  const [districts] = await pool.query('SELECT COUNT(*) as count FROM districts');
  assert(districts[0].count === 38, `All 38 Tamil Nadu districts loaded dynamically (Found: ${districts[0].count})`);

  // 3. User Seed Accounts Check
  const [users] = await pool.query('SELECT username, role_key FROM users');
  const rolesFound = users.map((u) => u.role_key);
  assert(rolesFound.includes('STATE_ADMIN'), 'STATE_ADMIN account present');
  assert(rolesFound.includes('DISTRICT_OFFICER'), 'DISTRICT_OFFICER account present');
  assert(rolesFound.includes('VERIFICATION_OFFICER'), 'VERIFICATION_OFFICER account present');
  assert(rolesFound.includes('CITIZEN_REPORTER'), 'CITIZEN_REPORTER account present');

  // 4. Intelligence Events & Provenance Integrity
  const [events] = await pool.query('SELECT e.id, e.event_code, p.source_department FROM intelligence_events e LEFT JOIN event_provenance p ON e.id = p.event_id');
  assert(events.length > 0, `Intelligence events populated (Count: ${events.length})`);
  assert(events.some((e) => e.source_department !== null), 'Event Provenance ("Why is this here?") linkage verified');

  // 5. PII Redaction Test
  const rawTextWithPII = 'Spotted vehicle TN 38 AB 1234 driven by suspect calling +91 9840123456 with email test@sample.com and Aadhaar 4582 1234 5678.';
  const piiResult = redactPII(rawTextWithPII);
  assert(piiResult.piiDetectedCount >= 3, `PII Redactor identified ${piiResult.piiDetectedCount} sensitive items`);
  assert(!piiResult.sanitizedText.includes('9840123456'), 'Phone number redacted properly');
  assert(!piiResult.sanitizedText.includes('test@sample.com'), 'Email redacted properly');

  // 6. AI / Rule-Based Classification Test
  const classification = await classifySignalContent('Large consignment seizure at Walayar interstate checkpost.');
  assert(classification.categoryKey === 'SEIZURE_ENFORCEMENT', `Classification correctly identified category: ${classification.categoryKey}`);
  assert(classification.classificationMethod !== undefined, `Classification method explicitly declared: ${classification.classificationMethod}`);

  // 7. SHA-256 Hash Chain Verification
  await appendAuditRecord({
    actorUserId: 1,
    actionType: 'TEST_SUITE_VERIFICATION',
    entityType: 'TEST',
    entityId: 'TEST_001',
    payload: { status: 'RUNNING' }
  });
  const chainResult = await verifyChainIntegrity();
  assert(chainResult.isIntact, `SHA-256 Cryptographic Hash Chain is intact (Blocks: ${chainResult.totalBlocks})`);

  // 8. RBAC Server-Side Security Assertions
  // 8a. District Officer Scoping: Block access to unauthorized district
  let districtOfficerBlocked = false;
  const mockReqOfficer = {
    user: { roleKey: 'DISTRICT_OFFICER', districtId: 2, districtName: 'Coimbatore' },
    query: { districtId: '1' }, // Requesting Chennai (DT #1)
    params: {},
    baseUrl: '/api/districts'
  };
  const mockResOfficer = {
    status: (code) => {
      if (code === 403) districtOfficerBlocked = true;
      return { json: () => {} };
    }
  };
  enforceDistrictScope(mockReqOfficer, mockResOfficer, () => {});
  assert(districtOfficerBlocked, 'Server-Side RBAC: District Officer blocked from querying unauthorized district (403)');

  // 8b. Citizen Account: Block access to intelligence ledger
  let citizenBlocked = false;
  const mockReqCitizen = {
    user: { roleKey: 'CITIZEN_REPORTER' },
    query: {},
    params: {},
    baseUrl: '/api/intelligence'
  };
  const mockResCitizen = {
    status: (code) => {
      if (code === 403) citizenBlocked = true;
      return { json: () => {} };
    }
  };
  enforceDistrictScope(mockReqCitizen, mockResCitizen, () => {});
  assert(citizenBlocked, 'Server-Side RBAC: Citizen account blocked from intelligence ledger (403)');

  // 9. Geographic Resolution (38 TN Districts & Localities)
  const { resolveGeographicLocation } = await import('./services/geoResolutionService.js');
  const geo1 = await resolveGeographicLocation({ locationText: 'Suspicious vehicle near Gandhipuram Cross Cut Road' });
  assert(geo1.resolved && geo1.district.name === 'Coimbatore', `Locality resolved: Gandhipuram -> Coimbatore (Confidence: ${geo1.confidence}%)`);

  const geo2 = await resolveGeographicLocation({ locationText: 'Interstate cargo scan at Zuzuvadi Checkpost near border' });
  assert(geo2.resolved && geo2.district.name === 'Krishnagiri', `Checkpost resolved: Zuzuvadi -> Krishnagiri (Confidence: ${geo2.confidence}%)`);

  const geo3 = await resolveGeographicLocation({ locationText: 'Near anonymous unknown junction without district mention' });
  assert(!geo3.resolved && geo3.unresolvedReason === 'LOCATION_VERIFICATION_REQUIRED', 'Ambiguous location safely marked for Human Verification rather than hallucinated');

  // 10. Document Understanding & Entity Extraction
  const { parseUnstructuredDocument } = await import('./services/universalIngestionService.js');
  const sampleFIR = `TAMIL NADU POLICE FIR Cr. No. 104/2026. Date: 2026-08-16. Station: Singanallur PS, Coimbatore. Sub-Inspector seized 14.5 kg Ganja and 250 synthetic pills during vehicle check.`;
  const parsedDoc = await parseUnstructuredDocument(sampleFIR, 'FIR_104_2026.pdf');
  assert(parsedDoc.docType === 'POLICE_FIR_REPORT', `Document Type identified: ${parsedDoc.docType}`);
  assert(parsedDoc.referenceNumber && parsedDoc.referenceNumber.includes('104/2026'), `Reference/FIR number extracted: ${parsedDoc.referenceNumber}`);
  assert(parsedDoc.geoResult.resolved && parsedDoc.geoResult.district.name === 'Coimbatore', `District mapped to ${parsedDoc.geoResult.district.name}`);
  assert(parsedDoc.substances.length >= 2, `Contraband identified: ${parsedDoc.substances.join(', ')}`);

  // 11. Duplicate & Multi-Signal Burst Detection
  const { detectDuplicatesAndBursts } = await import('./services/duplicateDetectionService.js');
  const dupResult = await detectDuplicatesAndBursts({
    districtId: 2,
    eventDate: '2026-08-16',
    lat: 11.0168,
    lng: 76.9558,
    description: 'Seizure of contraband cargo tablets at checkpost.',
    categoryId: 3,
    referenceNumber: '104/2026'
  });
  assert(dupResult !== undefined, 'Duplicate detection executed successfully');

  console.log(`\n========================================================`);
  console.log(`🏁 Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runVerificationSuite().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
