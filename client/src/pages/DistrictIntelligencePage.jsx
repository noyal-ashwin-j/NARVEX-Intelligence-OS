import React, { useState, useEffect } from 'react';
import {
  Building2,
  Filter,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  FileText,
  MapPin,
  Calendar,
  Layers,
  Clock,
  Share2,
  Sparkles,
  Ticket,
  ChevronRight,
  ShieldAlert,
  Radio,
  TrendingUp,
  HelpCircle,
  CheckCircle2,
  Info,
  ArrowUpRight,
  Activity,
  History
} from 'lucide-react';
import { api } from '../services/api';
import { useFilters } from '../context/FilterContext';
import { TripartiteScore } from '../components/common/TripartiteScore';
import { TemporalTrendChart } from '../components/charts/TemporalTrendChart';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { SourceBarChart } from '../components/charts/SourceBarChart';
import { EnforcementVsRiskChart } from '../components/charts/EnforcementVsRiskChart';
import { GISIntelligenceMap } from '../components/map/GISIntelligenceMap';
import { StatusBadge, RiskBadge, CoverageBadge } from '../components/common/Badge';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { LiveFilterBar } from '../components/common/LiveFilterBar';
import { LocationDossierModal } from '../components/common/LocationDossierModal';
import { CampusCaseStudyModal } from '../components/common/CampusCaseStudyModal';

export function DistrictIntelligencePage({
  districtId = 2,
  onBackToState,
  onSelectEvent,
  onSelectZone
}) {
  const { filters, updateFilter } = useFilters();

  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [page, setPage] = useState(1);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [caseStudyOpen, setCaseStudyOpen] = useState(false);
  const [actionTicketCreated, setActionTicketCreated] = useState(null);
  const [showWhyAlert, setShowWhyAlert] = useState(false);

  // Sync active district into filters
  useEffect(() => {
    if (districtId) {
      updateFilter('districtId', String(districtId));
    }
  }, [districtId]);

  // Load district profile, analytics, events, and automated forecasts
  useEffect(() => {
    async function loadDistrictIntel() {
      setLoading(true);
      try {
        const [distRes, analRes, evtRes, fcstRes] = await Promise.all([
          api.getDistrictById(districtId),
          api.getAnalytics({ districtId }),
          api.getEvents({
            districtId,
            talukId: filters.talukId,
            categoryId: filters.categoryId,
            sourceId: filters.sourceId,
            verificationStatus: filters.verificationStatus,
            isEnforcement: filters.isEnforcement,
            startDate: filters.startDate,
            endDate: filters.endDate,
            page,
            limit: 10
          }),
          api.getForecastZones({ districtId })
        ]);

        if (distRes.success) setDistrict(distRes.district);
        if (analRes.success) setAnalytics(analRes);
        if (evtRes.success) {
          setEvents(evtRes.events || []);
          setTotalEvents(evtRes.total || 0);
        }
        if (fcstRes.success) {
          setForecasts(fcstRes.forecasts || []);
        }
      } catch (err) {
        console.error('District intel loading error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDistrictIntel();
  }, [districtId, filters, page]);

  // Fast convert automated forecast to official action ticket
  const handleQuickConvertTicket = async (fcst) => {
    try {
      const res = await api.createActionTicket({
        title: `Preventive Protocol: Early-Warning for ${fcst.location_name || district.name}`,
        districtId: fcst.district_id || district.id,
        talukId: fcst.taluk_id || null,
        targetZoneName: fcst.location_name || `${district.name} Forecast Zone`,
        priority: 'HIGH',
        category: 'CAMPUS_OUTREACH',
        recommendedActionSummary: fcst.recommended_action || fcst.historical_contributing_factors,
        assignedOfficerBadge: 'OFFICER-LEAD-CBE'
      });

      if (res.success) {
        setActionTicketCreated(res.ticketCode || 'TKT-AUTO-GEN');
        setTimeout(() => setActionTicketCreated(null), 4000);
      }
    } catch (err) {
      alert(`Action ticket creation failed: ${err.message}`);
    }
  };

  const primaryForecast = forecasts.length > 0 ? forecasts[0] : null;

  return (
    <div className="space-y-5 pb-12 font-inter text-xs">
      {/* Top Breadcrumb */}
      {onBackToState && (
        <button
          onClick={onBackToState}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] font-medium uppercase tracking-[0.5px] text-[#22D3EE] shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Statewide Command Center
        </button>
      )}

      {/* Mission Tagline Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950 via-slate-900 to-purple-950 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[1px] text-[#22D3EE]">
            NARC-INTEL MISSION PRINCIPLE
          </div>
          <h2 className="text-[16px] font-semibold tracking-tight mt-0.5 font-space">
            “Don’t wait for the pattern to become a crisis.”
          </h2>
          <p className="text-[13px] text-slate-300 font-normal mt-0.5">
            Detect the signal. Understand the pattern. Verify the risk. Act earlier.
          </p>
        </div>

        <button
          onClick={() => setCaseStudyOpen(true)}
          className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-cyan-50 font-semibold text-[11px] uppercase tracking-[0.5px] shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>🎓 Campus Tragedy Case Study</span>
        </button>
      </div>

      {/* Interactive Amazon-Style Live Filter Strip */}
      <LiveFilterBar
        onExportDossier={() => setDossierModalOpen(true)}
        showExport={true}
      />

      <DisclaimerBanner />

      {/* 1. CORE INTELLIGENCE PURPOSE: AUTOMATED FUTURE EMERGING RISK ZONE FORECAST */}
      {primaryForecast && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-white to-red-500/10 dark:from-[#111827] dark:to-[#111827] border-2 border-amber-500/40 shadow-md space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500 text-black shadow-sm animate-pulse">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-amber-500 uppercase tracking-[0.5px] block">
                  Automated Early-Warning Forecast ({primaryForecast.forecast_window_days}-Day Horizon)
                </span>
                <h3 className="text-[16px] font-semibold text-slate-900 dark:text-slate-100 font-space">
                  Projected Emerging Risk Hotspot: {primaryForecast.location_name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RiskBadge level={primaryForecast.risk_level} />
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-cyan-500/10 text-[#22D3EE] border border-cyan-500/30">
                {primaryForecast.confidence_level} Confidence
              </span>
              <button
                onClick={() => setShowWhyAlert(!showWhyAlert)}
                className="px-3 py-1 rounded-lg bg-white dark:bg-[#0B0F19] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-medium text-[11px] uppercase tracking-[0.5px] flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Why this alert?</span>
              </button>
            </div>
          </div>

          {/* "Why did AI raise this alert?" Multi-Reason Evidence Dropdown */}
          {showWhyAlert && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-blue-200 dark:border-blue-800/50 space-y-2.5 shadow-sm animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-extrabold text-xs text-blue-900 dark:text-blue-200 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Evidence Breakdown: Why did NARC-INTEL raise this alert?
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Decision-Support Explainability</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <strong className="text-slate-900 dark:text-slate-100 block">1. Recent Signal Acceleration</strong>
                  <span>Signal frequency increased +42% above 90-day baseline in surrounding 3km zone.</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <strong className="text-slate-900 dark:text-slate-100 block">2. Spatial-Temporal Clustering</strong>
                  <span>Multiple independent observations recorded within 1.5km radius over the last 14 days.</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <strong className="text-slate-900 dark:text-slate-100 block">3. Ingress Transit Highway Nexus</strong>
                  <span>Direct waypoint on active NH544 freight corridor linked to inter-district supply nodes.</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <strong className="text-slate-900 dark:text-slate-100 block">4. Multi-Source Corroboration</strong>
                  <span>Checkpost telemetry + Hospital de-addiction consultation spikes + 2 verified community tips.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-300 font-medium">
                ⚖️ <strong>Legal & Governance Safeguard:</strong> Risk Indicator ≠ Criminal Proof. This alert represents a <em>Preventive Attention Priority</em> for authorized human officers to verify and schedule counseling / checkpost checks.
              </div>
            </div>
          )}

          {/* Converging Signals Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-amber-200 dark:border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                Why is the model projecting future risk here? (Converging Vectors)
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {primaryForecast.historical_contributing_factors}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-amber-200 dark:border-slate-800 space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase block">
                  Recommended Proactive Preventive Actions
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {primaryForecast.recommended_action || 'Deploy non-coercive campus awareness workshops and schedule highway checkpost weight scans.'}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                {actionTicketCreated ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    ✓ Ticket {actionTicketCreated} Assigned to District Officer!
                  </span>
                ) : (
                  <button
                    onClick={() => handleQuickConvertTicket(primaryForecast)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Create Preventive Action Ticket</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ESCALATION TIMELINE COMPONENT (Pattern Progression) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              Regional Escalation Timeline: From Initial Signal to Prevention
            </h3>
          </div>
          <span className="text-[11px] font-bold text-blue-600">Peelamedu - Avinashi Axis</span>
        </div>

        {/* 7-Step Visual Progression Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          {/* Day 1 */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase block">Day 1</span>
            <strong className="text-slate-900 dark:text-slate-100 text-xs block">Initial Signal</strong>
            <p className="text-[11px] text-slate-500 leading-tight">Overdose intake flagged in hospital aggregate log.</p>
          </div>

          {/* Day 5 */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-amber-600 uppercase block">Day 5</span>
            <strong className="text-slate-900 dark:text-slate-100 text-xs block">Second Signal</strong>
            <p className="text-[11px] text-slate-500 leading-tight">Walayar checkpost weight anomaly recorded.</p>
          </div>

          {/* Day 8 */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-red-600 uppercase block">Day 8</span>
            <strong className="text-slate-900 dark:text-slate-100 text-xs block">Pattern Detect</strong>
            <p className="text-[11px] text-slate-500 leading-tight">Spatial clustering connects 1+2 within 1.5km.</p>
          </div>

          {/* Day 9 */}
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 space-y-1">
            <span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase block">Day 9</span>
            <strong className="text-red-900 dark:text-red-200 text-xs block">Alert Raised</strong>
            <p className="text-[11px] text-red-800 dark:text-red-300 leading-tight">Early-warning alert sent to District SP dashboard.</p>
          </div>

          {/* Day 10 */}
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 space-y-1">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase block">Day 10</span>
            <strong className="text-blue-900 dark:text-blue-100 text-xs block">Ticket Assigned</strong>
            <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-tight">NSS college workshop + bypass checkpost patrol.</p>
          </div>

          {/* Day 11 */}
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Day 11</span>
            <strong className="text-emerald-900 dark:text-emerald-200 text-xs block">Action Sealed</strong>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-tight">Consignment intercepted; recorded on SHA-256 chain.</p>
          </div>

          {/* Day 20 */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-purple-600 uppercase block">Day 20</span>
            <strong className="text-slate-900 dark:text-slate-100 text-xs block">Risk Stabilized</strong>
            <p className="text-[11px] text-slate-500 leading-tight">Risk score drops 40%; recurring violence prevented.</p>
          </div>
        </div>
      </div>

      {/* 3. "WHAT CHANGED?" COMPARATIVE PERIOD ANALYTICS */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-[1px] flex items-center gap-1.5 font-space">
              <TrendingUp className="w-4 h-4 text-[#22D3EE]" />
              What Changed? (Previous Period vs. Current Period)
            </h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
              Comparison of regional risk indicators over the last 30 days.
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-red-500/10 text-red-500 border border-red-500/30 font-medium text-[11px] uppercase tracking-[0.5px]">
            Risk Indicator Trend: ↑ 68%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.5px] block">Verified Signals</span>
            <div className="text-[16px] font-medium font-mono text-slate-900 dark:text-slate-100 mt-1">
              4 <span className="text-slate-400 font-normal">→</span> <span className="text-[#22D3EE]">9</span>
            </div>
            <span className="text-[10px] text-red-500 font-medium font-mono">+125% surge</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.5px] block">Emerging Zones</span>
            <div className="text-[16px] font-medium font-mono text-slate-900 dark:text-slate-100 mt-1">
              1 <span className="text-slate-400 font-normal">→</span> <span className="text-purple-400">3</span>
            </div>
            <span className="text-[10px] text-purple-400 font-medium font-mono">+2 new hotspots</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.5px] block">Serious Incidents</span>
            <div className="text-[16px] font-medium font-mono text-slate-900 dark:text-slate-100 mt-1">
              1 <span className="text-slate-400 font-normal">→</span> <span className="text-red-500">3</span>
            </div>
            <span className="text-[10px] text-red-500 font-medium font-mono">+200% escalation</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.5px] block">Route Associations</span>
            <div className="text-[16px] font-medium font-mono text-slate-900 dark:text-slate-100 mt-1">
              2 <span className="text-slate-400 font-normal">→</span> <span className="text-blue-500">4</span>
            </div>
            <span className="text-[10px] text-blue-500 font-medium font-mono">+2 active lines</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.5px] block">Preventive Alerts</span>
            <div className="text-[16px] font-medium font-mono text-slate-900 dark:text-slate-100 mt-1">
              1 <span className="text-slate-400 font-normal">→</span> <span className="text-amber-500">5</span>
            </div>
            <span className="text-[10px] text-amber-500 font-medium font-mono">Action recommended</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-normal">
          * Note: <em>Risk Indicator Trend</em> measures spatial anomaly convergence and does not represent absolute drug consumption volume.
        </div>
      </div>

      {/* 4. District Header & Tripartite Score */}
      {district && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#22D3EE]" />
                <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-tight font-space">
                  District Profile: {district.name} ({district.code})
                </h2>
              </div>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                Headquarters: <strong>{district.headquarters}</strong> • Baseline Population: <strong className="font-mono">{Number(district.baseline_population).toLocaleString()}</strong> • Coordinates: <span className="font-mono">{district.center_lat}, {district.center_lng}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px] uppercase tracking-[0.5px]">
                Active Alerts: <strong className="text-amber-500 font-mono text-[13px]">{district.active_alerts_count}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px] uppercase tracking-[0.5px]">
                Emerging Zones: <strong className="text-purple-400 font-mono text-[13px]">{district.emerging_zones_count}</strong>
              </span>
            </div>
          </div>

          {/* Tripartite Score Safeguard */}
          <TripartiteScore
            riskLevel={district.risk_level}
            confidenceScore={parseFloat(district.confidence_score)}
            coverageStatus={district.coverage_status}
          />
        </div>
      )}

      {/* 5. CHARTS BEFORE THE MAP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            1. Spatial-Temporal & Category Analytics
          </h3>
          <span className="text-[11px] text-slate-400">Database-backed charts</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Temporal Trend */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                Temporal Trend: Signals over Time
              </span>
              <span className="text-[11px] text-blue-600 font-bold">Monthly breakdown</span>
            </div>
            <TemporalTrendChart data={analytics?.temporalTrend || []} />
          </div>

          {/* Chart 2: Category Distribution */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                Signals by Category Taxonomy
              </span>
              <span className="text-[11px] text-amber-600 font-bold">Category split</span>
            </div>
            <CategoryDonutChart data={analytics?.categoryDistribution || []} />
          </div>

          {/* Chart 3: Source Breakdown */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                Signals by Source Department
              </span>
              <span className="text-[11px] text-emerald-600 font-bold">Reliability weighted</span>
            </div>
            <SourceBarChart data={analytics?.sourceBreakdown || []} />
          </div>

          {/* Chart 4: Enforcement vs Risk Signal Layer Separation */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                Safeguard: Enforcement vs Community Signals
              </span>
              <span className="text-[11px] text-purple-600 font-bold">Bias Prevention</span>
            </div>
            <EnforcementVsRiskChart data={analytics?.enforcementVsRisk || {}} />
          </div>
        </div>
      </div>

      {/* 6. TACTICAL GIS INTELLIGENCE MAP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            2. Tactical District GIS Layer & Risk Zones
          </h3>
          <span className="text-[11px] text-slate-400">
            Interactive GIS viewport ({district?.name})
          </span>
        </div>

        <GISIntelligenceMap
          height="500px"
          selectedDistrictId={districtId}
          onSelectEvent={onSelectEvent}
          onSelectZone={onSelectZone}
        />
      </div>

      {/* 7. FILTERED INTELLIGENCE EVENT STREAM TABLE */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              3. Filtered Intelligence Signal Ledger ({totalEvents} Records)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Click "Inspect Provenance" on any signal to view source file manifest, row ID, and SHA-256 raw hash.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600">Page {page}</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold text-xs animate-pulse">
            Loading district event stream...
          </div>
        ) : events.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            No intelligence events match current filters in this district.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Event Code</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Location / Taluk</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3 text-right">Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                    <td className="py-3 px-3 font-bold text-blue-600">{evt.event_code}</td>
                    <td className="py-3 px-3 text-slate-500 font-medium">{evt.event_date}</td>
                    <td className="py-3 px-3 text-slate-900 dark:text-slate-100 font-medium">
                      <div className="font-bold">{evt.location_name}</div>
                      {evt.taluk_name && <span className="text-[11px] text-slate-500">Taluk: {evt.taluk_name}</span>}
                    </td>
                    <td className="py-3 px-3 font-medium">{evt.category_name}</td>
                    <td className="py-3 px-3 text-slate-500 font-medium">{evt.source_name}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={evt.verification_status} />
                    </td>
                    <td className="py-3 px-3 text-blue-600 font-bold">{evt.confidence_score}%</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectEvent && onSelectEvent(evt.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-800 dark:text-slate-200 transition-colors text-[11px] font-bold cursor-pointer"
                      >
                        Inspect Provenance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Location Dossier Extraction Modal */}
      <LocationDossierModal
        isOpen={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
        district={district}
      />

      {/* Campus Tragedy Prevention Case Study Modal */}
      <CampusCaseStudyModal
        isOpen={caseStudyOpen}
        onClose={() => setCaseStudyOpen(false)}
      />
    </div>
  );
}
