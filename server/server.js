import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';
import { testConnection } from './database/db.js';
import { initSecurityTables, validateStartupSecrets } from './services/securityHardeningService.js';

dotenv.config();
validateStartupSecrets();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Health Check
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'HEALTHY',
    platform: 'NARC-INTEL (N-RISE)',
    version: '1.0.0-SIH-PROTOTYPE',
    jurisdiction: 'State of Tamil Nadu (38 Districts)',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Mount Routes
app.use('/api', apiRouter);

// Root information endpoint
app.get('/', (req, res) => {
  res.json({
    platform: 'STATEWIDE NARCOTIC INTELLIGENCE & PREVENTIVE RISK MONITORING PLATFORM',
    shortName: 'NARC-INTEL (N-RISE)',
    state: 'Tamil Nadu',
    status: 'OPERATIONAL',
    apiHealth: '/api/health'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`========================================================`);
  console.log(`🛡️  NARC-INTEL (N-RISE) STATE INTELLIGENCE BACKEND RUNNING`);
  console.log(`📡  Port: ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏛️  Jurisdiction: Tamil Nadu Command Center (38 Districts)`);
  console.log(`========================================================`);
  const conn = await testConnection();
  console.log(`📊  Database Status:`, conn.ok ? 'CONNECTED TO narvex' : conn.error);
  try {
    await initSecurityTables();
    await (await import('./database/migrateProvenanceSchema.js')).ensureProvenanceSchema();
    console.log(`🔒  Security Envelope: Active (Zero-Trust Session Registry & SIEM Ready)`);
    const { startLiveTelemetryDaemon } = await import('./services/liveTelemetryDaemon.js');
    startLiveTelemetryDaemon();
    console.log(`⚡  Live Streaming Telemetry Daemon: STARTED (SSE active at /api/stream/live-intelligence)`);
  } catch (err) {
    console.error(`⚠️  Security Table Init Error:`, err.message);
  }
});
