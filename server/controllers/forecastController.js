import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../database/db.js';
import { runForecastInference } from '../ai/forecastInferenceService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODEL_PATH = path.resolve(__dirname, '../ai/models/narvex_forecast_model.json');

/**
 * Get Forecasted Preventive Attention Zones
 */
export async function getForecastZones(req, res) {
  try {
    const { districtId, windowDays } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (districtId && districtId !== 'ALL') {
      whereClause += ' AND fc.district_id = ?';
      params.push(districtId);
    }

    if (windowDays) {
      whereClause += ' AND fc.forecast_window_days = ?';
      params.push(parseInt(windowDays, 10));
    }

    const query = `
      SELECT 
        fc.*,
        d.name as district_name,
        d.code as district_code,
        t.name as taluk_name
      FROM forecast_records fc
      JOIN districts d ON fc.district_id = d.id
      LEFT JOIN taluks t ON fc.taluk_id = t.id
      ${whereClause}
      ORDER BY fc.id DESC
    `;

    const [forecasts] = await pool.query(query, params);

    return res.json({
      success: true,
      total: forecasts.length,
      modelVersion: 'NARVEX_TEMPORAL_BAYES_V2.1',
      disclaimer: 'Forecasts represent decision-support signals for preventive attention and verification; they do not independently authorize enforcement or accusation.',
      forecasts
    });
  } catch (err) {
    console.error('Error fetching forecasts:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * 2-Axis Risk vs Evidence Confidence Matrix Data
 */
export async function getRiskConfidenceMatrix(req, res) {
  try {
    const [districts] = await pool.query(
      `SELECT 
        d.id,
        d.name,
        d.code,
        d.risk_level,
        d.confidence_score,
        d.coverage_status,
        COUNT(e.id) as total_signals,
        COUNT(CASE WHEN e.is_enforcement = 1 THEN 1 END) as enforcement_signals
       FROM districts d
       LEFT JOIN intelligence_events e ON d.id = e.district_id
       GROUP BY d.id`
    );

    const matrix = {
      strongPreventive: [], // High Risk, High Conf
      requiresVerification: [], // High Risk, Low Conf
      stableBaseline: [], // Low Risk, High Conf
      insufficientData: [] // Low Risk, Low Conf
    };

    districts.forEach((d) => {
      const isHighRisk = d.risk_level === 'HIGH PREVENTIVE ATTENTION' || d.risk_level === 'INCREASING';
      const isHighConf = parseFloat(d.confidence_score) >= 70.0;

      if (isHighRisk && isHighConf) matrix.strongPreventive.push(d);
      else if (isHighRisk && !isHighConf) matrix.requiresVerification.push(d);
      else if (!isHighRisk && isHighConf) matrix.stableBaseline.push(d);
      else matrix.insufficientData.push(d);
    });

    return res.json({
      success: true,
      totalDistricts: districts.length,
      matrix
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Get AI Model Operational Status & Metadata
 */
export async function getModelStatus(req, res) {
  try {
    if (!fs.existsSync(MODEL_PATH)) {
      return res.status(404).json({ success: false, message: 'Model artifact not yet trained.' });
    }
    const modelArtifact = JSON.parse(fs.readFileSync(MODEL_PATH, 'utf8'));
    return res.json({
      success: true,
      model: modelArtifact
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Trigger On-Demand AI Model Re-Inference
 */
export async function triggerModelReInference(req, res) {
  try {
    const result = await runForecastInference();
    return res.json({
      success: true,
      message: 'AI Model Inference successfully executed across all 38 districts.',
      result
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export default {
  getForecastZones,
  getRiskConfidenceMatrix,
  getModelStatus,
  triggerModelReInference
};
