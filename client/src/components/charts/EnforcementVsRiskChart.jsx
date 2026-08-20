import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export function EnforcementVsRiskChart({ data = {} }) {
  const enforcement = parseInt(data.enforcement_count, 10) || 0;
  const independent = parseInt(data.independent_risk_count, 10) || 0;
  const total = enforcement + independent || 1;
  const enfPct = Math.round((enforcement / total) * 100);
  const indepPct = 100 - enfPct;

  return (
    <div className="h-64 flex flex-col justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 font-inter">
      <div>
        <div className="text-[14px] uppercase tracking-[1px] text-slate-800 dark:text-slate-200 font-semibold mb-1">
          Layer Separation: Enforcement vs Community Signals
        </div>
        <p className="text-[13px] text-slate-600 dark:text-slate-400 font-normal">
          Prevents over-policed areas from self-perpetuating as higher risk.
        </p>
      </div>

      {/* Visual Dual Progress Bar */}
      <div className="space-y-2 my-auto font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium font-inter text-[11px] uppercase tracking-[0.5px]">
            <ShieldAlert className="w-4 h-4 text-red-500" /> Enforcement Seizures ({enfPct}%)
          </span>
          <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-medium font-inter text-[11px] uppercase tracking-[0.5px]">
            <ShieldCheck className="w-4 h-4 text-cyan-500" /> Community Signals ({indepPct}%)
          </span>
        </div>

        <div className="w-full h-5 rounded-full bg-slate-200 dark:bg-slate-900 overflow-hidden flex border border-slate-300 dark:border-slate-800">
          <div
            style={{ width: `${enfPct}%` }}
            className="bg-[#EF4444] transition-all duration-500 h-full flex items-center justify-center text-[11px] text-white font-mono font-medium"
          >
            {enfPct > 15 ? `${enforcement} events` : ''}
          </div>
          <div
            style={{ width: `${indepPct}%` }}
            className="bg-[#22D3EE] text-black transition-all duration-500 h-full flex items-center justify-center text-[11px] font-mono font-medium"
          >
            {indepPct > 15 ? `${independent} events` : ''}
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-[13px] text-slate-700 dark:text-slate-300 font-normal leading-relaxed shadow-sm">
        {enfPct > 70 ? (
          <span className="text-amber-700 dark:text-amber-300">
            ⚠️ <strong>Enforcement Bias Alert:</strong> High proportion of enforcement seizures detected. Verify independent community reporting baseline.
          </span>
        ) : (
          <span className="text-emerald-700 dark:text-emerald-300">
            ✓ <strong>Balanced Intelligence Mix:</strong> Corroborated with multi-source independent signals and telemetry.
          </span>
        )}
      </div>
    </div>
  );
}
