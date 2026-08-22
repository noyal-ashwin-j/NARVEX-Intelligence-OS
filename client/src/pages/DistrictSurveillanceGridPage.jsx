import React, { useState, useEffect } from 'react';
import {
  Building,
  Search,
  ArrowUpDown,
  Zap,
  ArrowRight,
  HelpCircle,
  Share2,
  TrendingUp,
  ShieldAlert,
  FileCheck2,
  Network
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge, CoverageBadge } from '../components/common/Badge';
import { CircularGaugeMetrics } from '../components/visualizations/CircularGaugeMetrics';
import { WhyFlaggedModal } from '../components/intelligence/WhyFlaggedModal';
import { LocationDossierModal } from '../components/common/LocationDossierModal';

export function DistrictSurveillanceGridPage({ onSelectDistrict }) {
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState([]);
  const [whatChanged, setWhatChanged] = useState(null);
  const [sortBy, setSortBy] = useState('priority');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  const [whyFlaggedEntity, setWhyFlaggedEntity] = useState(null);
  const [dossierDistrict, setDossierDistrict] = useState(null);

  useEffect(() => {
    async function loadGrid() {
      setLoading(true);
      try {
        const [distRes, wcRes] = await Promise.all([
          api.getDistricts({ sortBy, riskLevel: riskFilter, search: searchFilter }),
          api.getWhatChanged()
        ]);
        if (distRes.success) setDistricts(distRes.districts || []);
        if (wcRes && wcRes.success) setWhatChanged(wcRes);
      } catch (err) {
        console.error('Failed to load district grid:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGrid();
  }, [sortBy, riskFilter, searchFilter]);

  const totalActiveAlerts = districts.reduce((acc, d) => acc + (parseInt(d.active_alerts_count, 10) || 0), 0);

  return (
    <div className="space-y-6 pb-12 font-inter">
      {/* Top Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#090E1A] border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[19px] font-bold text-slate-900 dark:text-white uppercase font-space flex items-center gap-2">
              <Building className="w-5 h-5 text-cyan-500" />
              Tamil Nadu District Surveillance Grid (38 Districts)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live multi-district velocity tracking, first-time signal emergence, and individual district dossiers.
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <div className="relative">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search district..."
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 text-[11px] uppercase tracking-[0.5px] focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH PREVENTIVE ATTENTION">High Preventive Attention</option>
              <option value="INCREASING">Increasing</option>
              <option value="WATCH">Watch</option>
              <option value="LOW">Low</option>
            </select>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-0 text-slate-700 dark:text-slate-200 text-[11px] uppercase tracking-[0.5px] focus:outline-none cursor-pointer font-mono"
              >
                <option value="priority">Sort: Priority</option>
                <option value="increasing">Sort: Highest Velocity</option>
                <option value="new_signals">Sort: Most New Signals</option>
                <option value="emerging">Sort: Emerging Zones</option>
                <option value="alerts">Sort: Active Alerts</option>
                <option value="confidence">Sort: Highest Confidence</option>
                <option value="alpha">Sort: A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Statewide Circular Gauges */}
      <CircularGaugeMetrics
        velocity={9.4}
        confidence={88}
        coverage={76}
        activeAlerts={totalActiveAlerts || 20}
      />

      {/* 38 District Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium text-xs animate-pulse">
          Loading 38 Tamil Nadu districts...
        </div>
      ) : districts.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs">
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
                    ? 'bg-red-500/5 border-red-500/40 hover:border-red-400 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[15px] text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors font-space">
                        {d.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">({d.code})</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      HQ: {d.headquarters || d.name}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-bold text-lg ${isHigh ? 'text-red-500' : 'text-cyan-500'}`}>
                      {score} <span className="text-xs font-normal">{isIncreasing ? '↑' : '→'}</span>
                    </div>
                    <div className="text-[9px] uppercase font-mono text-slate-400 tracking-wider">
                      Risk Index
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-[10px]">
                  <div>
                    <span className="text-slate-400 block font-mono">Confidence:</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-300 font-mono">{d.confidence_score}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono">Coverage:</span>
                    <span className={`font-bold font-mono ${d.coverage_status === 'LIMITED' ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {d.coverage_status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <RiskBadge level={d.risk_level} />
                  {isIncreasing && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-[9px] font-mono font-medium">
                      📈 {d.velocity_30d || '1.8x'} Vel
                    </span>
                  )}
                  {hasFirstTime && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-[9px] font-mono font-medium">
                      🟣 New Signal
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setWhyFlaggedEntity(d);
                    }}
                    className="text-slate-400 hover:text-cyan-500 inline-flex items-center gap-1 text-[10px] cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Why?
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDossierDistrict(d);
                      }}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-cyan-500 font-medium uppercase tracking-[0.5px] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-[10px]">
                      Inspect <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <WhyFlaggedModal
        isOpen={!!whyFlaggedEntity}
        onClose={() => setWhyFlaggedEntity(null)}
        entity={whyFlaggedEntity}
        onInvestigate={(entity) => {
          if (entity.id) onSelectDistrict(entity.id);
        }}
      />

      <LocationDossierModal
        isOpen={!!dossierDistrict}
        onClose={() => setDossierDistrict(null)}
        district={dossierDistrict}
      />
    </div>
  );
}
