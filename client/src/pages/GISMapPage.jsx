import React, { useState } from 'react';
import { Map, Layers, Filter, ShieldAlert, CheckCircle2, Database, Info, X, Share2, MapPin } from 'lucide-react';
import { NarvexIntelligenceMap } from '../components/map/NarvexIntelligenceMap';
import { TimeMachine } from '../components/map/TimeMachine';
import { useFilters } from '../context/FilterContext';
import { RiskBadge, CoverageBadge, StatusBadge } from '../components/common/Badge';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { LiveFilterBar } from '../components/common/LiveFilterBar';
import { LocationDossierModal } from '../components/common/LocationDossierModal';

export function GISMapPage({ onSelectEvent }) {
  const { filters } = useFilters();
  const [selectedZone, setSelectedZone] = useState(null);
  const [dossierDistrict, setDossierDistrict] = useState(null);

  const handleExportFromFilter = (districtObj) => {
    if (districtObj) {
      setDossierDistrict(districtObj);
    } else {
      setDossierDistrict({
        id: 2,
        name: 'Coimbatore',
        code: 'CBE',
        headquarters: 'Coimbatore',
        center_lat: 11.0168,
        center_lng: 76.9558,
        risk_level: 'HIGH PREVENTIVE ATTENTION',
        confidence_score: 91.5,
        coverage_status: 'GOOD',
        active_alerts_count: 3,
        emerging_zones_count: 2,
        verified_events_count: 3
      });
    }
  };

  return (
    <div className="space-y-4 pb-12 font-sans">
      <DisclaimerBanner />

      {/* Interactive Amazon-Style Live Filter Strip */}
      <LiveFilterBar
        onExportDossier={handleExportFromFilter}
        showExport={true}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2 font-space">
            <Map className="w-5 h-5 text-cyan-500 dark:text-[#22D3EE]" />
            Tactical GIS Intelligence Command Map
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal font-inter">
            Multi-layer spatial-temporal surveillance, checkposts, and risk zone clustering.
          </p>
        </div>
      </div>

      {/* GIS Map & Side Zone Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className={selectedZone ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <NarvexIntelligenceMap
            height="650px"
            mode="PRESENT"
            onSelectEvent={onSelectEvent}
            onSelectZone={(zone) => setSelectedZone(zone)}
          />
        </div>

        {/* Zone Inspector Slideout */}
        {selectedZone && (
          <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 font-inter text-xs animate-in slide-in-from-right duration-200">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-medium tracking-[0.5px]">Zone Intelligence</span>
                <h4 className="font-semibold text-[16px] text-cyan-600 dark:text-[#22D3EE] mt-0.5 font-space">{selectedZone.name}</h4>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tripartite Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-slate-400">Risk Indicator:</span>
                <RiskBadge level={selectedZone.risk_level} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-slate-400">Evidence Quality:</span>
                <span className="text-[#22D3EE] font-medium font-mono text-xs">{selectedZone.confidence_level} CONFIDENCE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-slate-400">Data Coverage:</span>
                <CoverageBadge coverage={selectedZone.data_coverage} />
              </div>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-[0.5px]">Total Signals</span>
                <strong className="text-slate-900 dark:text-slate-100 text-[16px] font-mono font-medium">{selectedZone.signal_count}</strong>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-[0.5px]">Verified Count</span>
                <strong className="text-emerald-500 text-[16px] font-mono font-medium">{selectedZone.verified_count}</strong>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-[0.5px]">Recent Velocity</span>
                <strong className="text-amber-500 font-mono font-medium text-xs">{selectedZone.recent_trend}</strong>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-[0.5px]">Pattern Lifecycle</span>
                <strong className="text-purple-400 font-mono font-medium text-xs">{selectedZone.historical_trend}</strong>
              </div>
            </div>

            {/* Contributing Risk Factors */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 uppercase font-medium tracking-[0.5px] block">Contributing Factors</span>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[13px] font-normal leading-relaxed">
                {selectedZone.primary_factors}
              </div>
            </div>

            {/* Extract Zone Brief */}
            <button
              onClick={() => {
                setDossierDistrict({
                  id: selectedZone.id || 2,
                  name: selectedZone.name,
                  code: 'ZONE',
                  headquarters: selectedZone.name,
                  center_lat: selectedZone.center_lat,
                  center_lng: selectedZone.center_lng,
                  risk_level: selectedZone.risk_level,
                  confidence_score: selectedZone.confidence_score || 90,
                  coverage_status: selectedZone.data_coverage,
                  active_alerts_count: 1,
                  emerging_zones_count: 1,
                  verified_events_count: selectedZone.verified_count
                });
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black font-semibold text-[11px] uppercase tracking-[0.5px] flex items-center justify-center gap-1.5 cursor-pointer shadow-glow-cyan transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Extract This Zone Dossier</span>
            </button>
          </div>
        )}
      </div>

      {/* Location Dossier Extraction Modal */}
      <LocationDossierModal
        isOpen={!!dossierDistrict}
        onClose={() => setDossierDistrict(null)}
        district={dossierDistrict}
      />
    </div>
  );
}
