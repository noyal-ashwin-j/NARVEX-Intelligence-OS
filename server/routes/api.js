import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { getAllDistricts, getDistrictById } from '../controllers/districtController.js';
import { getEvents, getEventById, getAnalytics, getMetadata, getEntityGraph, getANPRStream, getPrecursorDiversion, getFinancialSignals, getWastewaterMetrics } from '../controllers/intelligenceController.js';
import { getMapData } from '../controllers/mapController.js';
import { submitCitizenReport, trackCitizenReport, getVerificationQueue, triageCitizenReport } from '../controllers/citizenController.js';
import { uploadAndPreviewFile, executeBatchIngestion, uploadUniversalFeed, resolveDuplicateSignal } from '../controllers/ingestionController.js';
import { getSpatialAssociations, compareCorridors, getRouteIntelligence, getIntelligenceArcs, getMapArcs } from '../controllers/associationController.js';
import { getForecastZones, getRiskConfidenceMatrix, getModelStatus, triggerModelReInference } from '../controllers/forecastController.js';
import { getAlerts, createActionTicket, getActionTickets, updateActionTicket } from '../controllers/actionController.js';
import { getGovernanceMetrics, updateRiskThresholds } from '../controllers/governanceController.js';
import { getAuditLogs, testChainIntegrity } from '../controllers/auditController.js';
import { globalSearch } from '../controllers/searchController.js';
import { queryAssistant } from '../controllers/assistantController.js';
import {
  getReplayStatusHandler,
  startReplayHandler,
  stepReplayHandler,
  resetReplayHandler,
  generateValidationReportHandler
} from '../controllers/caseReplayController.js';
import { authenticateToken, requireRoles, enforceDistrictScope } from '../middleware/authMiddleware.js';

const router = express.Router();

// 6. Spatial-Temporal & Historical Route Associations
router.get('/spatial/associations', optionalAuth, getSpatialAssociations);
router.get('/spatial/routes', optionalAuth, getRouteIntelligence);
router.get('/intelligence/arcs', optionalAuth, getIntelligenceArcs);
router.get('/map/arcs', optionalAuth, getMapArcs);
router.get('/spatial/compare', optionalAuth, compareCorridors);

// 15. Real-World Intelligence Scenario Case Replay Validation
router.get('/validation/replay/status', optionalAuth, getReplayStatusHandler);
router.post('/validation/replay/start', optionalAuth, startReplayHandler);
router.post('/validation/replay/step', optionalAuth, stepReplayHandler);
router.post('/validation/replay/reset', optionalAuth, resetReplayHandler);
router.get('/validation/report', optionalAuth, generateValidationReportHandler);

// Setup multer for upload handling
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `upload_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Optional auth helper to attach user if Authorization header is present
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.split(' ')[1]) {
    return authenticateToken(req, res, next);
  }
  next();
}

import {
  login,
  getCurrentUser,
  getSeedAccounts,
  logoutUser,
  getUserSessions,
  revokeSessionHandler,
  revokeAllUserSessionsHandler,
  refreshTokenHandler,
  setupTOTPHandler,
  getSecurityMetricsHandler
} from '../controllers/authController.js';

// 1. Authentication & Session Registry
router.post('/auth/login', login);
router.post('/auth/refresh', refreshTokenHandler);
router.post('/auth/logout', authenticateToken, logoutUser);
router.get('/auth/me', authenticateToken, getCurrentUser);
router.get('/auth/seed-accounts', getSeedAccounts);
router.get('/auth/sessions', authenticateToken, getUserSessions);
router.post('/auth/sessions/:sessionId/revoke', authenticateToken, revokeSessionHandler);
router.post('/auth/sessions/revoke-all/:userId', authenticateToken, requireRoles('STATE_ADMIN'), revokeAllUserSessionsHandler);
router.post('/auth/mfa/setup', authenticateToken, setupTOTPHandler);

// Security SIEM & Command Dashboard
router.get('/security/dashboard', authenticateToken, requireRoles('STATE_ADMIN'), getSecurityMetricsHandler);

// 2. State & District Intelligence (Secured with RBAC & District Scoping)
router.get('/districts', optionalAuth, enforceDistrictScope, getAllDistricts);
router.get('/districts/:id', optionalAuth, enforceDistrictScope, getDistrictById);
router.get('/intelligence/events', optionalAuth, enforceDistrictScope, getEvents);
router.get('/intelligence/events/:id', optionalAuth, enforceDistrictScope, getEventById);
router.get('/intelligence/analytics', optionalAuth, enforceDistrictScope, getAnalytics);
router.get('/intelligence/metadata', getMetadata);

// Advanced Modules 1-5: Entity Link Graph, ANPR, Precursors, Financial Signals & Wastewater
router.get('/intelligence/entity-graph', optionalAuth, getEntityGraph);
router.get('/intelligence/anpr-stream', optionalAuth, getANPRStream);
router.get('/intelligence/precursor-diversion', optionalAuth, getPrecursorDiversion);
router.get('/intelligence/financial-signals', optionalAuth, getFinancialSignals);
router.get('/intelligence/wastewater-metrics', optionalAuth, getWastewaterMetrics);
import { getWhatChangedSummary } from '../services/backgroundIntelligenceService.js';

router.get('/intelligence/what-changed', optionalAuth, async (req, res) => {
  const data = await getWhatChangedSummary();
  res.json({ success: true, ...data });
});

// 3. GIS Map Command Center
router.get('/map/layers', optionalAuth, enforceDistrictScope, getMapData);

// 4. Anonymous Citizen Reporting (Public & Internal Queue)
router.post('/citizen/report', submitCitizenReport);
router.get('/citizen/track/:token', trackCitizenReport);
router.get('/citizen/queue', authenticateToken, requireRoles('STATE_ADMIN', 'DISTRICT_OFFICER', 'VERIFICATION_OFFICER'), getVerificationQueue);
router.post('/citizen/triage/:id', authenticateToken, requireRoles('STATE_ADMIN', 'DISTRICT_OFFICER', 'VERIFICATION_OFFICER'), triageCitizenReport);

// 5. Universal Intelligence Feed & AI Ingestion (Zero-Format Multi-File Support)
router.post('/ingest/universal', optionalAuth, upload.array('files', 100), uploadUniversalFeed);
router.post('/ingest/preview', optionalAuth, upload.array('files', 100), uploadUniversalFeed);
router.post('/ingest/execute', optionalAuth, executeBatchIngestion);
router.post('/ingest/resolve-duplicate/:signalId', optionalAuth, resolveDuplicateSignal);

// 6. Spatial-Temporal & Historical Route Associations
router.get('/spatial/associations', optionalAuth, getSpatialAssociations);
router.get('/spatial/compare', optionalAuth, compareCorridors);

// 7. Forecast, AI Model & 2-Axis Risk Matrix
router.get('/forecast/zones', optionalAuth, enforceDistrictScope, getForecastZones);
router.get('/forecast/matrix', optionalAuth, getRiskConfidenceMatrix);
router.get('/ai/model-status', optionalAuth, getModelStatus);
router.post('/ai/re-infer', optionalAuth, triggerModelReInference);

// 8. Alerts & Action Tickets
router.get('/alerts', optionalAuth, enforceDistrictScope, getAlerts);
router.post('/actions/tickets', authenticateToken, requireRoles('STATE_ADMIN', 'DISTRICT_OFFICER'), createActionTicket);
router.get('/actions/tickets', optionalAuth, enforceDistrictScope, getActionTickets);
router.patch('/actions/tickets/:id', authenticateToken, requireRoles('STATE_ADMIN', 'DISTRICT_OFFICER'), updateActionTicket);

// 9. Responsible AI Governance & Policy Thresholds
router.get('/governance/metrics', authenticateToken, requireRoles('STATE_ADMIN'), getGovernanceMetrics);
router.post('/governance/thresholds', authenticateToken, requireRoles('STATE_ADMIN'), updateRiskThresholds);

// 10. Cryptographic Hash-Chain Audit Logs
router.get('/audit/logs', authenticateToken, requireRoles('STATE_ADMIN'), getAuditLogs);
router.get('/audit/verify-chain', authenticateToken, requireRoles('STATE_ADMIN'), testChainIntegrity);

// 11. Omnibox Global Search
router.get('/search', optionalAuth, globalSearch);

// 12. Centralized NARVEX Intelligence Assistant
router.post('/assistant/query', optionalAuth, queryAssistant);

import { tickLiveSimulation, getSimulationStatus } from '../services/simulationService.js';
import { fuseSignalsForDistrict } from '../intelligence/signalFusionEngine.js';
import { runPreventiveSimulation } from '../intelligence/scenarioSimulationEngine.js';
import { generateComprehensiveBriefing } from '../services/intelligenceBriefingService.js';
import { getAggregatedIntelligenceGraph } from '../intelligence/networkGraphEngine.js';
import { getMaritimeIntelligenceData } from '../intelligence/maritimeIntelligenceService.js';
import { handleSseConnection } from '../services/realtimeIntelligenceService.js';
import { processAgentIntent } from '../agent/narvexAgentService.js';

// 13. Live Signal Stream Simulation (External CSV stream)
router.post('/simulation/tick', optionalAuth, async (req, res) => {
  try {
    const result = await tickLiveSimulation();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/simulation/status', optionalAuth, (req, res) => {
  res.json(getSimulationStatus());
});

// 14. NARVEX 3.0 Core Capabilities
// A. Cross-Source Signal Fusion
router.get('/fusion/district/:districtId', optionalAuth, async (req, res) => {
  try {
    const result = await fuseSignalsForDistrict(req.params.districtId, req.query.windowDays || 30);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// B. What-If Scenario Simulator
router.post('/simulation/preventive', optionalAuth, async (req, res) => {
  try {
    const result = await runPreventiveSimulation(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// C. One-Click Comprehensive Briefing Dossier
router.get('/briefing/generate', optionalAuth, async (req, res) => {
  try {
    const result = await generateComprehensiveBriefing(req.query.districtId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// D. Aggregated Intelligence Knowledge Graph
router.get('/graph/intelligence', optionalAuth, async (req, res) => {
  try {
    const result = await getAggregatedIntelligenceGraph(req.query.districtId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// E. 1076km Coastal & Maritime Radar Extension
router.get('/maritime/intelligence', optionalAuth, async (req, res) => {
  try {
    const result = await getMaritimeIntelligenceData();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// F. Real-Time Command Mesh (SSE)
router.get('/realtime/stream', handleSseConnection);

// G. Voice & Central Agent Command Action Dispatcher
router.post('/agent/command', optionalAuth, async (req, res) => {
  try {
    const result = await processAgentIntent(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
