import React from 'react';
import { Shield, CheckCircle2, AlertCircle, Info, Database, BarChart3, HelpCircle } from 'lucide-react';
import { RiskBadge, CoverageBadge } from './Badge';

export function TripartiteScore({ riskLevel, confidenceScore, coverageStatus, showTooltip = true }) {
  return (
    <div className="space-y-3 font-inter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-500 dark:text-[#22D3EE]" />
          <h4 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-[1px]">
            Tripartite Decision Safeguard (Strictly Unmerged)
          </h4>
        </div>
        {showTooltip && (
          <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Mandated Protocol
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
        {/* Pillar 1: Risk Level */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium uppercase text-[11px] tracking-[0.5px]">
            <span>1. Observed Risk Level</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <RiskBadge level={riskLevel} />
          </div>
          <p className="text-[13px] font-normal text-slate-500 dark:text-slate-400 leading-snug">
            Signal density & historical trend. Never implies individual suspicion.
          </p>
        </div>

        {/* Pillar 2: Evidence Quality / Confidence */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium uppercase text-[11px] tracking-[0.5px]">
            <span>2. Evidence Quality</span>
            <BarChart3 className="w-4 h-4 text-cyan-500 dark:text-[#22D3EE]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-medium font-mono text-cyan-600 dark:text-[#22D3EE]">
              {confidenceScore || 0}%
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-slate-400">Corroboration</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#22D3EE] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(confidenceScore || 0, 100)}%` }}
            />
          </div>
          <p className="text-[13px] font-normal text-slate-500 dark:text-slate-400 leading-snug">
            Multi-source cross-verification score.
          </p>
        </div>

        {/* Pillar 3: Data Coverage */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium uppercase text-[11px] tracking-[0.5px]">
            <span>3. Data Coverage Status</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <CoverageBadge coverage={coverageStatus} />
          </div>
          <p className="text-[13px] font-normal text-slate-500 dark:text-slate-400 leading-snug">
            {coverageStatus === 'LIMITED'
              ? 'Sparse reporting. Must NOT be interpreted as low real-world risk.'
              : 'Consistent multi-source data reporting pipeline.'}
          </p>
        </div>
      </div>
    </div>
  );
}
