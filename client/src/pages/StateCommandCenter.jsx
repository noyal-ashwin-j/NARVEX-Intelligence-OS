import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  Clock,
  TrendingUp,
  Filter,
  ArrowUpDown,
  Building,
  ArrowRight,
  Database,
  Radio,
  Sparkles,
  Zap,
  Activity,
  Calendar,
  Layers,
  HelpCircle,
  Share2,
  Search,
  Network,
  BarChart3,
  Sliders,
  Play,
  RotateCw,
  Maximize2,
  LayoutGrid,
  Globe
} from 'lucide-react';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { RiskBadge, CoverageBadge } from '../components/common/Badge';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { useFilters } from '../context/FilterContext';
import { LiveIntelligenceFeed } from '../components/intelligence/LiveIntelligenceFeed';
import { EmergingRiskRadar } from '../components/intelligence/EmergingRiskRadar';
import { WhyFlaggedModal } from '../components/intelligence/WhyFlaggedModal';
import { LocationDossierModal } from '../components/common/LocationDossierModal';
import { CircularGaugeMetrics } from '../components/visualizations/CircularGaugeMetrics';
import { SpatialNetworkGraph } from '../components/visualizations/SpatialNetworkGraph';
import { WaveformDensityScrubber } from '../components/visualizations/WaveformDensityScrubber';
import { MultiSpectrumBarChart } from '../components/visualizations/MultiSpectrumBarChart';
import { Interactive3DGlobeMap } from '../components/map/Interactive3DGlobeMap';
import { NarvexMorningBriefingModal } from '../components/intelligence/NarvexMorningBriefingModal';
import { HighRiskPopupsOverlay } from '../components/intelligence/HighRiskPopupsOverlay';
import CorroboratingSignals from '../components/intelligence/CorroboratingSignals';
import ScenarioSimulator from '../components/intelligence/ScenarioSimulator';
import GenerateBriefing from '../components/intelligence/GenerateBriefing';
import IntelligenceNetworkGraph from '../components/intelligence/IntelligenceNetworkGraph';

export function StateCommandCenter({ onSelectDistrict, onNavigateTab, onOpenFeed }) {
  const { filters, updateFilter } = useFilters();

  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState([]);
  const [whatChanged, setWhatChanged] = useState(null);
  const [sortBy, setSortBy] = useState('priority');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [viewMode, setViewMode] = useState('COMMAND_CANVAS'); // 'COMMAND_CANVAS' | 'FULL_GRID'

  // Modals state
  const [whyFlaggedEntity, setWhyFlaggedEntity] = useState(null);
  const [dossierDistrict, setDossierDistrict] = useState(null);
  const [showBriefing, setShowBriefing] = useState(false);
  const [showFusion, setShowFusion] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showExecutiveDossier, setShowExecutiveDossier] = useState(false);
  const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);
  const [activeActionDistrict, setActiveActionDistrict] = useState({ id: 2, name: 'Coimbatore' });

  // SSE Live Telemetry Stream Listener
  useEffect(() => {
    const eventSource = new EventSource('/api/realtime/stream');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type && data.type !== 'HEARTBEAT') {
          loadData();
        }
      } catch (e) {}
    };
    return () => eventSource.close();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [distRes, wcRes] = await Promise.all([
        api.getDistricts({
          sortBy,
          riskLevel: riskFilter,
          search: searchFilter
        }),
        api.getWhatChanged()
      ]);

      if (distRes.success) {
        setDistricts(distRes.districts || []);
      }
      if (wcRes && wcRes.success) {
        setWhatChanged(wcRes);
      }
    } catch (err) {
      console.error('Error fetching state command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sortBy, riskFilter, searchFilter]);

  // Aggregate Statewide KPI Calculations
  const totalVerified = districts.reduce((acc, d) => acc + (parseInt(d.verified_events_count, 10) || 0), 0);
  const totalEmergingZones = districts.reduce((acc, d) => acc + (parseInt(d.emerging_zones_count, 10) || 0), 0);
  const totalHighAttention = districts.filter((d) => d.risk_level === 'HIGH PREVENTIVE ATTENTION').length;
  const totalPendingVerification = districts.reduce((acc, d) => acc + (parseInt(d.pending_verification_count, 10) || 0), 0);
  const totalActiveAlerts = districts.reduce((acc, d) => acc + (parseInt(d.active_alerts_count, 10) || 0), 0);
  const totalFirstTimeSignals = districts.reduce((acc, d) => acc + (parseInt(d.first_time_signals_count, 10) || 0), 0);

  return (
    <div className="space-y-5 pb-12 font-inter text-slate-100 bg-[#050811] min-h-screen p-1 rounded-3xl">
      {/* Top Banner & Mandatory Safeguard */}
      <DisclaimerBanner />

      {/* 1. CYBER TACTICAL WAR ROOM COMMAND HEADER */}
      <div className="p-4 rounded-3xl bg-[#090E1A] border border-cyan-500/30 shadow-glow-cyan flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan">
            <Radio className="w-6 h-6 animate-pulse text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[19px] font-bold tracking-tight text-white uppercase font-space">
                NARVEX // STATE COMMAND CENTER
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE WAR ROOM ● STREAMING
              </span>
            </div>
            <p className="text-[12px] text-slate-400 font-normal mt-0.5">
              Continuous multi-source state narcotic surveillance • 38 District Nodes Active
            </p>
          </div>
        </div>

        {/* Header Actions & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-2xl font-mono text-[11px]">
            <button
              onClick={() => setViewMode('COMMAND_CANVAS')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'COMMAND_CANVAS'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3D Globe View</span>
            </button>

            <button
              onClick={() => setViewMode('FULL_GRID')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'FULL_GRID'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Surveillance Grid</span>
            </button>
          </div>

          {/* NARVEX 3.0 Capability Buttons */}
          <button
            onClick={() => setShowFusion(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono text-[11px] font-medium flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            title="Cross-Source Signal Fusion"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Signal Fusion</span>
          </button>

          <button
            onClick={() => setShowSimulator(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px] font-medium flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            title="What-If Scenario Simulator"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>What-If Simulator</span>
          </button>

          <button
            onClick={() => setShowKnowledgeGraph(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-[11px] font-medium flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            title="Aggregated Knowledge Graph"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Knowledge Graph</span>
          </button>

          <button
            onClick={() => setShowExecutiveDossier(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono text-[11px] font-medium flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            title="Generate Official Executive Dossier"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Executive Dossier</span>
          </button>

          <button
            onClick={() => setShowBriefing(true)}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-[11px] font-medium flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Briefing</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ADMIN 1ST VIEW: FOCUSED 3D GLOBE MAP + NARVEX ASSISTANT + HIGH-RISK POPUPS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left/Center: Authentic mapcn 3D Globe (7 Cols) */}
        <div className="lg:col-span-7 h-[540px]">
          <Interactive3DGlobeMap height="540px" onSelectDistrict={onSelectDistrict} />
        </div>

        {/* Right: NARVEX AI Core Avatar & Voice Assistant (5 Cols) */}
        <div className="lg:col-span-5 h-[540px] flex flex-col justify-between">
          <NarvexAvatarCore
            activeDistrictId={2}
            onNavigateTab={onNavigateTab}
            onSelectDistrict={onSelectDistrict}
            onOpenWhyFlagged={(entity) => setWhyFlaggedEntity(entity)}
          />
        </div>
      </div>

      {/* 3. HIGH-RISK UPDATES POPUPS OVERLAY (POPUP ALERTS IN THAT PAGE) */}
      <HighRiskPopupsOverlay
        onSelectDistrict={onSelectDistrict}
        onOpenWhyFlagged={(entity) => setWhyFlaggedEntity(entity)}
      />

      {/* ========================================================================= */}
      {/* 4. PROGRESSIVE DISCLOSURE: DETAILED ANALYTICS & 38-DISTRICT SURVEILLANCE GRID */}
      {/* ========================================================================= */}
      {viewMode === 'FULL_GRID' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Advanced Circular Gauge Telemetry */}
          <CircularGaugeMetrics
            velocity={9.4}
            confidence={88}
            coverage={76}
            activeAlerts={totalActiveAlerts || 20}
          />

          {/* Spatial Network Topology Graph + Waveform Scrubber */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SpatialNetworkGraph onSelectDistrict={onSelectDistrict} />
            <WaveformDensityScrubber />
          </div>

          {/* Multi-Spectrum Category Bars */}
          <MultiSpectrumBarChart />

          {/* Time Machine Historical Replay */}
          <IntelligenceTimeMachineReplay onSelectDistrict={onSelectDistrict} />

          {/* Live Feed Ticker & Emerging Radar */}
          <LiveIntelligenceFeed
            onSelectDistrict={onSelectDistrict}
            onOpenWhyFlagged={(entity) => setWhyFlaggedEntity(entity)}
            onNavigateTab={onNavigateTab}
          />

          <EmergingRiskRadar
            onSelectDistrict={onSelectDistrict}
            onOpenWhyFlagged={(entity) => setWhyFlaggedEntity(entity)}
            onNavigateTab={onNavigateTab}
          />

          {/* 38-District High-Density Surveillance Grid */}
          <div className="p-5 rounded-3xl bg-[#090E1A] border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-[14px] font-semibold text-white uppercase tracking-[1px] font-space flex items-center gap-2">
                  <Building className="w-4 h-4 text-cyan-400" />
                  Tamil Nadu District Surveillance Grid (38 Districts)
                </h3>
                <p className="text-[12px] text-slate-400 mt-0.5 font-normal">
                  Click any district card to view its localized intelligence dossier, timeline, and tactical map.
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                <div className="relative">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search district..."
                    className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 text-[11px] uppercase tracking-[0.5px] focus:outline-none focus:border-cyan-400 cursor-pointer font-mono"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="HIGH PREVENTIVE ATTENTION">High Preventive Attention</option>
                  <option value="INCREASING">Increasing</option>
                  <option value="WATCH">Watch</option>
                  <option value="LOW">Low</option>
                </select>

                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-0 text-slate-200 text-[11px] uppercase tracking-[0.5px] focus:outline-none cursor-pointer font-mono"
                  >
                    <option value="priority">Sort: Priority</option>
                    <option value="increasing">Sort: Highest Increasing Risk</option>
                    <option value="new_signals">Sort: Most New Signals</option>
                    <option value="emerging">Sort: Emerging Zones</option>
                    <option value="alerts">Sort: Active Alerts</option>
                    <option value="confidence">Sort: Highest Confidence</option>
                    <option value="alpha">Sort: A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* District Cards */}
            {loading ? (
              <div className="py-16 text-center text-slate-400 font-medium text-xs animate-pulse">
                Loading district surveillance grid...
              </div>
            ) : districts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No districts match the selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {districts.map((d) => {
                  const isHigh = d.risk_level === 'HIGH PREVENTIVE ATTENTION';
                  const isIncreasing = d.trend_direction === 'RAPID_INCREASE' || parseFloat(d.velocity_30d) >= 1.5;
                  const hasFirstTime = d.first_time_signals_count > 0;
                  const score = isHigh ? 78 : d.risk_level === 'INCREASING' ? 64 : d.risk_level === 'WATCH' ? 45 : 22;

                  return (
                    <div
                      key={d.id}
                      onClick={() => onSelectDistrict && onSelectDistrict(d.id)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-xs font-inter group flex flex-col justify-between space-y-3 ${
                        isHigh
                          ? 'bg-red-950/20 border-red-500/40 hover:border-red-400 shadow-sm'
                          : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/50 hover:shadow-glow-cyan'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[15px] text-white group-hover:text-cyan-400 transition-colors font-space">
                              {d.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">({d.code})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            HQ: {d.headquarters || d.name}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-mono font-bold text-lg ${isHigh ? 'text-red-400' : 'text-cyan-400'}`}>
                            {score} <span className="text-xs font-normal">{isIncreasing ? '↑' : '→'}</span>
                          </div>
                          <div className="text-[9px] uppercase font-mono text-slate-400 tracking-wider">
                            Preventive Score
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px]">
                        <div>
                          <span className="text-slate-400 block font-mono">Confidence:</span>
                          <span className="font-bold text-cyan-300 font-mono">{d.confidence_score}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-mono">Coverage:</span>
                          <span className={`font-bold font-mono ${d.coverage_status === 'LIMITED' ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {d.coverage_status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <RiskBadge level={d.risk_level} />
                        {isIncreasing && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-medium">
                            📈 {d.velocity_30d || '1.8x'} Vel
                          </span>
                        )}
                        {hasFirstTime && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[9px] font-mono font-medium">
                            🟣 New Signal
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setWhyFlaggedEntity(d);
                          }}
                          className="text-slate-400 hover:text-cyan-300 inline-flex items-center gap-1 text-[10px] cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5" /> Why?
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDossierDistrict(d);
                            }}
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          <span className="text-cyan-400 font-medium uppercase tracking-[0.5px] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-[10px]">
                            Inspect <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WHY FLAGGED EXPLAINABILITY MODAL */}
      <WhyFlaggedModal
        isOpen={!!whyFlaggedEntity}
        onClose={() => setWhyFlaggedEntity(null)}
        entity={whyFlaggedEntity}
        onInvestigate={(entity) => {
          if (entity.id) onSelectDistrict(entity.id);
          else if (entity.districtId) onSelectDistrict(entity.districtId);
        }}
      />

      {/* LOCATION DOSSIER MODAL */}
      <LocationDossierModal
        isOpen={!!dossierDistrict}
        onClose={() => setDossierDistrict(null)}
        district={dossierDistrict}
      />

      {/* MORNING BRIEFING MODAL */}
      <NarvexMorningBriefingModal
        isOpen={showBriefing}
        onClose={() => setShowBriefing(false)}
        onNavigateTab={onNavigateTab}
        onSelectDistrict={onSelectDistrict}
      />

      {/* CROSS-SOURCE SIGNAL FUSION MODAL */}
      {showFusion && (
        <CorroboratingSignals
          districtId={activeActionDistrict.id}
          districtName={activeActionDistrict.name}
          onClose={() => setShowFusion(false)}
        />
      )}

      {/* WHAT-IF SCENARIO SIMULATOR MODAL */}
      {showSimulator && (
        <ScenarioSimulator
          districtId={activeActionDistrict.id}
          districtName={activeActionDistrict.name}
          onClose={() => setShowSimulator(false)}
        />
      )}

      {/* ONE-CLICK EXECUTIVE INTELLIGENCE BRIEFING DOSSIER */}
      {showExecutiveDossier && (
        <GenerateBriefing
          districtId={null}
          onClose={() => setShowExecutiveDossier(false)}
        />
      )}

      {/* AGGREGATED INTELLIGENCE KNOWLEDGE GRAPH */}
      {showKnowledgeGraph && (
        <IntelligenceNetworkGraph
          districtId={null}
          onSelectDistrict={(dId) => {
            setShowKnowledgeGraph(false);
            if (onSelectDistrict) onSelectDistrict(dId);
          }}
          onClose={() => setShowKnowledgeGraph(false)}
        />
      )}
    </div>
  );
}
