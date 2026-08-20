import React, { useState, useEffect } from 'react';
import {
  Cpu,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Database,
  BarChart2,
  Info,
  Scale,
  FileCheck2,
  Radio,
  MapPin,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge, CoverageBadge } from '../components/common/Badge';
import { RiskConfidenceMatrix } from '../components/charts/RiskConfidenceMatrix';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export function ForecastGovernancePage({ onSelectDistrict }) {
  const [loading, setLoading] = useState(true);
  const [forecasts, setForecasts] = useState([]);
  const [matrixData, setMatrixData] = useState({});
  const [governance, setGovernance] = useState(null);

  // Threshold form state
  const [watchThreshold, setWatchThreshold] = useState(5);
  const [risingThreshold, setRisingThreshold] = useState(12);
  const [highThreshold, setHighThreshold] = useState(25);
  const [minConf, setMinConf] = useState(70.0);
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [thresholdSavedMsg, setThresholdSavedMsg] = useState('');

  // Disparity mitigation state
  const [disparityMitigationActive, setDisparityMitigationActive] = useState(true);

  const loadAllGovernance = async () => {
    setLoading(true);
    try {
      const [fcRes, mxRes, govRes] = await Promise.all([
        api.getForecastZones(),
        api.getRiskConfidenceMatrix(),
        api.getGovernanceMetrics()
      ]);

      if (fcRes.success) setForecasts(fcRes.forecasts || []);
      if (mxRes.success) setMatrixData(mxRes.matrix || {});
      if (govRes.success && govRes.governanceData) {
        setGovernance(govRes.governanceData);
        if (govRes.governanceData.activeThreshold) {
          setWatchThreshold(govRes.governanceData.activeThreshold.watch_threshold);
          setRisingThreshold(govRes.governanceData.activeThreshold.rising_threshold);
          setHighThreshold(govRes.governanceData.activeThreshold.high_threshold);
          setMinConf(govRes.governanceData.activeThreshold.min_confidence_for_high);
        }
      }
    } catch (err) {
      console.error('Error loading forecast governance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllGovernance();
  }, []);

  const handleUpdateThresholds = async (e) => {
    e.preventDefault();
    setSavingThreshold(true);
    setThresholdSavedMsg('');
    try {
      const res = await api.updateRiskThresholds({
        watchThreshold,
        risingThreshold,
        highThreshold,
        minConfidenceForHigh: minConf,
        notes: 'Updated via Responsible AI Governance Panel'
      });
      if (res.success) {
        setThresholdSavedMsg(`Policy thresholds updated to version ${res.versionTag}`);
        loadAllGovernance();
      }
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setSavingThreshold(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-inter text-xs">
      <DisclaimerBanner type="forecast-disclaimer" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2 font-space">
            <Cpu className="w-5 h-5 text-purple-400" />
            Predictive Risk Forecasting & Bias Governance Auditor
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            Active mitigation of urban vs rural observation bias, statistical confidence matrix, and policy thresholds.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#111827] border border-purple-500/30 text-[#A855F7] text-[11px] font-medium font-mono shadow-glow-purple uppercase tracking-[0.5px]">
          ACTIVE MODEL: <strong>NRISE-RISK-v1.0</strong>
        </span>
      </div>

      {/* 1. Urban vs Rural Disparity Mitigation Safeguard Box (Solves Drawback 1) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-[1px]">
              Urban vs. Rural Observation Bias Mitigation Layer
            </h3>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-[11px] font-medium uppercase tracking-[0.5px]">
            <input
              type="checkbox"
              checked={disparityMitigationActive}
              onChange={(e) => setDisparityMitigationActive(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500"
            />
            <span className="text-slate-800 dark:text-slate-200">
              Automated Baseline Prior Floor ({disparityMitigationActive ? 'ACTIVE' : 'DISABLED'})
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.5px] block">
              The Drawback (Observation Disparity Risk)
            </span>
            <p className="text-slate-700 dark:text-slate-300 font-normal text-[13px] leading-relaxed">
              Metropolitan districts (Chennai, Coimbatore) log 10x more digital citizen reports than rural border taluks (Tenkasi, Ariyalur). Standard machine learning algorithms would falsely mark rural borders as "Safe" due to data absence.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
            <span className="text-[11px] font-medium text-emerald-500 uppercase tracking-[0.5px] block">
              NARC-INTEL Mathematical Safeguard
            </span>
            <p className="text-slate-700 dark:text-slate-300 font-normal text-[13px] leading-relaxed">
              {disparityMitigationActive
                ? 'Active Bayesian Prior Floor applied: Low-reporting districts are capped with INSUFFICIENT DATA status. The model never assigns LOW RISK to unmonitored zones, forcing scheduled physical checkpost verification.'
                : 'Warning: Disparity mitigation disabled. Model will strictly rely on raw counts.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. 2-Axis Risk vs Confidence Matrix */}
      <RiskConfidenceMatrix matrix={matrixData} onSelectDistrict={onSelectDistrict} />

      {/* 3. Experimental Forecast Zones (30D & 90D Horizons) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-[1px] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#A855F7]" />
              Automated Early-Warning Forecast Zones (Next 30 / 90 Days)
            </h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
              Statistical risk projections designed for preventive patrol scheduling.
            </p>
          </div>
          <span className="text-[#A855F7] bg-purple-500/10 dark:bg-purple-950/40 px-3 py-1 rounded-lg border border-purple-500/30 font-medium text-[11px] uppercase tracking-[0.5px]">
            STRICTLY PREVENTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forecasts.map((fc) => (
            <div
              key={fc.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    WINDOW: NEXT {fc.forecast_window_days} DAYS
                  </span>
                  <h4 className="font-extrabold text-sm text-blue-600 mt-0.5">
                    {fc.district_name}
                  </h4>
                  {fc.taluk_name && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      {fc.taluk_name} Taluk
                    </span>
                  )}
                </div>
                <RiskBadge level={fc.risk_level} />
              </div>

              <div className="flex items-center justify-between text-xs py-2 border-y border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-bold">Confidence:</span>
                <span className="text-blue-600 font-extrabold">{fc.confidence_level}</span>
                <CoverageBadge coverage={fc.data_coverage} />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-bold block">
                  Projected Location & Hotspot
                </span>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {fc.location_name}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed font-medium mt-1">
                  {fc.historical_contributing_factors}
                </p>
              </div>

              <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                Model: {fc.model_version} • Trained: {fc.training_date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Responsible AI & Configurable Risk Thresholds Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Coverage Disparity & Reviewer Decisions */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              Regional Coverage & Reporting Gap Monitor
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Audits urban vs rural reporting disparities to prevent geographic bias.
            </p>
          </div>

          <div className="space-y-2.5">
            {governance?.coverageDistribution?.map((cov) => (
              <div
                key={cov.coverage_status}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-slate-200">
                    {cov.coverage_status} DATA COVERAGE
                  </span>
                  <span className="text-slate-500 block text-[11px] font-medium">
                    {cov.district_count} Districts • Pop: {Number(cov.total_population || 0).toLocaleString()}
                  </span>
                </div>
                <span className="text-blue-600 font-bold">{cov.total_signals} signals</span>
              </div>
            ))}
          </div>

          {/* Rubber-Stamping Audit */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase block">
              Human Reviewer Override & Agreement Audit
            </span>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              {governance?.reviewerDecisions?.map((rev, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{rev.classification_method}</span>
                  <span className="text-emerald-600 font-bold">{rev.verified_count} Verified</span>
                  <span className="text-amber-600 font-bold">{rev.corroborated_count} Corroborated</span>
                  <span className="text-slate-500">{rev.total_reviewed} Total</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Configurable Risk Thresholds Editor */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Transparent Risk Threshold Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Versioned policy formulas stored in database, never hardcoded in software.
            </p>
          </div>

          {thresholdSavedMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-2.5 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{thresholdSavedMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateThresholds} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-bold">Watch Level Threshold</label>
                <input
                  type="number"
                  value={watchThreshold}
                  onChange={(e) => setWatchThreshold(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-bold">Rising Level Threshold</label>
                <input
                  type="number"
                  value={risingThreshold}
                  onChange={(e) => setRisingThreshold(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-bold">High Preventive Threshold</label>
                <input
                  type="number"
                  value={highThreshold}
                  onChange={(e) => setHighThreshold(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-bold">Min Confidence for High (%)</label>
                <input
                  type="number"
                  value={minConf}
                  onChange={(e) => setMinConf(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingThreshold}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30 disabled:opacity-50 cursor-pointer text-xs"
              >
                {savingThreshold ? 'Saving Version...' : 'Save & Publish New Threshold Version'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
