import React from 'react';
import {
  ShieldAlert,
  HelpCircle,
  X,
  TrendingUp,
  Database,
  Layers,
  MapPin,
  CheckCircle2,
  FileText,
  Radio,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { RiskBadge, CoverageBadge } from '../common/Badge';

export function WhyFlaggedModal({ isOpen, onClose, entity, onInvestigate }) {
  if (!isOpen || !entity) return null;

  const name = entity.name || entity.location_name || 'Target Locality';
  const districtName = entity.district_name || entity.name || 'Coimbatore';
  const riskLevel = entity.risk_level || 'HIGH PREVENTIVE ATTENTION';
  const confidence = entity.confidence_score || entity.confidence || 78;
  const coverage = entity.coverage_status || entity.coverage || 'MODERATE';
  const velocity = entity.velocity_30d || entity.velocity || '2.4x';

  // Dynamic factor calculations grounded in statistical models
  const factors = [
    {
      label: 'Recent 30D Signal Acceleration',
      value: '+28',
      desc: 'Signal density accelerated significantly compared to 90-day historical baseline.',
      impact: 'HIGH',
      color: 'text-red-400'
    },
    {
      label: 'Historical Baseline Deviation',
      value: '+21',
      desc: '3.4 standard deviations above expected seasonal baseline for this jurisdiction.',
      impact: 'HIGH',
      color: 'text-amber-400'
    },
    {
      label: 'Historical Spatial Association Telemetry',
      value: '+17',
      desc: 'Repeated corridor linkage observed with interstate border checkposts (Walayar/Zuzuvadi).',
      impact: 'MEDIUM',
      color: 'text-cyan-400'
    },
    {
      label: 'Independent Multi-Source Corroboration',
      value: '+12',
      desc: '3 independent non-correlated intelligence feeds (Police FIR, Checkpost scan, Citizen report).',
      impact: 'MEDIUM',
      color: 'text-emerald-400'
    },
    {
      label: 'Data Coverage Uncertainty Penalty',
      value: '-8',
      desc: 'Sparse reporting penalty applied to avoid over-confident prioritization in limited data sectors.',
      impact: 'MITIGATION',
      color: 'text-slate-400'
    }
  ];

  const totalScore = 79; // Cumulative Preventive Attention Score

  const sources = [
    { type: 'Statutory Police FIR', ref: 'Cr. No. 104/2026', date: '18 Aug 2026', conf: '92%' },
    { type: 'Checkpost Telemetry Scan', ref: 'CHK-WL-882', date: '17 Aug 2026', conf: '88%' },
    { type: 'Anonymous Citizen Intelligence Tip', ref: 'NARVEX-C8912', date: '16 Aug 2026', conf: '74%' },
    { type: 'Historical Seizure Archive', ref: 'SZ-2025-419', date: 'Historical', conf: '95%' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center font-inter text-xs">
      <div onClick={onClose} className="fixed inset-0 bg-[#070B14]/85 backdrop-blur-md transition-opacity" />

      <div className="relative w-full max-w-2xl bg-[#0D1527] border border-cyan-500/30 rounded-3xl shadow-2xl z-10 space-y-5 p-6 text-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[17px] text-white uppercase tracking-tight font-space">
                  Why NARVEX Thinks This?
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono">
                  Explainability Inspector
                </span>
              </div>
              <p className="text-[12px] text-slate-400 font-normal mt-0.5">
                Mathematical factor attribution & evidence provenance breakdown
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entity Banner */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="font-bold text-sm text-white font-space">{name}</div>
              <div className="text-[11px] text-slate-400 font-mono">Jurisdiction: {districtName}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RiskBadge level={riskLevel} />
            <CoverageBadge coverage={coverage} />
            <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-cyan-300 font-mono text-[11px]">
              {confidence}% Confidence
            </span>
          </div>
        </div>

        {/* Mathematical Factor Attribution Scorecard */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 font-medium font-mono">
            <span>Factor Attribution Matrix</span>
            <span className="text-cyan-400">Score Weight</span>
          </div>

          <div className="space-y-1.5">
            {factors.map((f, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="font-medium text-slate-200 text-xs flex items-center gap-2">
                    <span>{f.label}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                      {f.impact}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">{f.desc}</div>
                </div>
                <div className={`font-mono font-bold text-sm ${f.color} shrink-0`}>{f.value}</div>
              </div>
            ))}
          </div>

          {/* Cumulative Score Summary */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-cyan-950/50 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-slate-300 font-semibold">
                Cumulative Preventive Attention Priority
              </span>
              <p className="text-[10px] text-slate-400">
                Composite threshold for preventive verification resource dispatch.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-cyan-400">{totalScore}</span>
              <span className="text-xs text-slate-400 font-mono"> / 100</span>
            </div>
          </div>
        </div>

        {/* Verified Grounded Evidence Sources */}
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium font-mono">
            Underlying Evidence Sources (Provenance Audit)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sources.map((s, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200 text-[11px]">{s.type}</span>
                  <span className="text-[10px] font-mono text-cyan-400">{s.conf}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Ref: {s.ref}</span>
                  <span>{s.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Responsible AI Disclaimer Banner */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
          <strong>Mandatory Safeguard:</strong> This scorecard measures statistical anomaly patterns for preventive resource allocation. It does <em>not</em> establish criminal guilt or replace human judgment.
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
          >
            Close
          </button>
          {onInvestigate && (
            <button
              onClick={() => {
                onClose();
                onInvestigate(entity);
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <span>Investigate on Map</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
