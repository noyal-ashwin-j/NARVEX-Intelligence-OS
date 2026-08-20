import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

export function RiskConfidenceMatrix({ matrix = {}, onSelectDistrict }) {
  const {
    strongPreventive = [],
    requiresVerification = [],
    stableBaseline = [],
    insufficientData = []
  } = matrix;

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 font-inter text-xs shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 gap-2">
        <div>
          <h4 className="font-semibold text-[14px] text-slate-900 dark:text-slate-100 uppercase tracking-[1px]">
            2-Axis Intelligence Matrix: Risk Signal vs Evidence Quality
          </h4>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
            Never collapses risk and confidence into a single blended number.
          </p>
        </div>
        <span className="text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-lg text-cyan-600 dark:text-[#22D3EE] border border-slate-200 dark:border-slate-700 w-fit uppercase tracking-[0.5px]">
          X = Evidence Quality | Y = Observed Risk
        </span>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Q2 (Top-Left): HIGH RISK + LOW CONFIDENCE */}
        <div className="p-4 rounded-xl bg-orange-500/10 dark:bg-orange-950/20 border border-orange-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-orange-600 dark:text-orange-400 font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.5px]">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                HIGH RISK + LOW CONFIDENCE
              </span>
              <span className="text-[12px] font-mono font-medium bg-orange-500/20 px-2 py-0.5 rounded">{requiresVerification.length} DT</span>
            </div>
            <span className="text-[11px] text-orange-700 dark:text-orange-300 font-medium uppercase tracking-[0.5px] block mt-1">
              ACTION: REQUIRES IMMEDIATE FIELD VERIFICATION
            </span>
            <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-1 font-normal">
              Elevated signal velocity with uncorroborated single-source tips. Prioritize field verification before any action.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 font-mono">
            {requiresVerification.map((d) => (
              <button
                key={d.id}
                onClick={() => onSelectDistrict && onSelectDistrict(d.id)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-800 text-orange-900 dark:text-orange-200 border border-orange-300 dark:border-orange-700 text-xs font-medium shadow-sm cursor-pointer"
              >
                {d.name} ({d.confidence_score}%)
              </button>
            ))}
          </div>
        </div>

        {/* Q1 (Top-Right): HIGH RISK + HIGH CONFIDENCE */}
        <div className="p-4 rounded-xl bg-red-500/10 dark:bg-red-950/20 border border-red-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-red-600 dark:text-red-400 font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.5px]">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                HIGH RISK + HIGH CONFIDENCE
              </span>
              <span className="text-[12px] font-mono font-medium bg-red-500/20 px-2 py-0.5 rounded">{strongPreventive.length} DT</span>
            </div>
            <span className="text-[11px] text-red-700 dark:text-red-300 font-medium uppercase tracking-[0.5px] block mt-1">
              ACTION: STRONG PREVENTIVE ATTENTION
            </span>
            <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-1 font-normal">
              Corroborated across multiple independent sources (police, checkposts, helpline) and recurrent spatial patterns.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 font-mono">
            {strongPreventive.map((d) => (
              <button
                key={d.id}
                onClick={() => onSelectDistrict && onSelectDistrict(d.id)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-800 text-red-900 dark:text-red-200 border border-red-300 dark:border-red-700 text-xs font-medium shadow-sm cursor-pointer"
              >
                {d.name} ({d.confidence_score}%)
              </button>
            ))}
          </div>
        </div>

        {/* Q4 (Bottom-Left): LOW RISK + LOW CONFIDENCE */}
        <div className="p-4 rounded-xl bg-slate-500/10 dark:bg-slate-900/40 border border-slate-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.5px]">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                LOW RISK + LOW CONFIDENCE
              </span>
              <span className="text-[12px] font-mono font-medium bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">{insufficientData.length} DT</span>
            </div>
            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium uppercase tracking-[0.5px] block mt-1">
              STATUS: INSUFFICIENT DATA / COVERAGE GAP
            </span>
            <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-1 font-normal">
              Sparse baseline telemetry. Never labeled as "Low Risk"; flagged for monitoring expansion.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 font-mono">
            {insufficientData.map((d) => (
              <button
                key={d.id}
                onClick={() => onSelectDistrict && onSelectDistrict(d.id)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-medium shadow-sm cursor-pointer"
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* Q3 (Bottom-Right): LOW RISK + HIGH CONFIDENCE */}
        <div className="p-4 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.5px]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                LOW RISK + HIGH CONFIDENCE
              </span>
              <span className="text-[12px] font-mono font-medium bg-emerald-500/20 px-2 py-0.5 rounded">{stableBaseline.length} DT</span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium uppercase tracking-[0.5px] block mt-1">
              STATUS: STABLE MONITORED BASELINE
            </span>
            <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-1 font-normal">
              High data coverage with low observed signal concentration. Maintain standard sensor feeds.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 font-mono">
            {stableBaseline.map((d) => (
              <button
                key={d.id}
                onClick={() => onSelectDistrict && onSelectDistrict(d.id)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-800 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 text-xs font-medium shadow-sm cursor-pointer"
              >
                {d.name} ({d.confidence_score}%)
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
