import React from 'react';
import { ShieldCheck, AlertCircle, Info } from 'lucide-react';

export function DisclaimerBanner({ type = 'standard' }) {
  if (type === 'coverage-warning') {
    return (
      <div className="py-1.5 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-300 text-xs flex items-center gap-2 font-sans font-medium">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span><strong>Coverage Gap Notice:</strong> Low reporting in this area indicates limited data collection, not low real-world risk.</span>
      </div>
    );
  }

  if (type === 'forecast-disclaimer') {
    return (
      <div className="py-1.5 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 text-blue-900 dark:text-blue-300 text-xs flex items-center gap-2 font-sans font-medium">
        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span><strong>Forecast Advisory:</strong> Statistical probability projections for preventive resource planning. Requires officer verification.</span>
      </div>
    );
  }

  return (
    <div className="py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs flex items-center justify-between gap-2 font-sans font-medium">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>All signals require human officer verification. PII redaction active.</span>
      </div>
      <span className="text-[10px] text-slate-400 font-semibold uppercase">
        Synthetic Demonstration Platform
      </span>
    </div>
  );
}
