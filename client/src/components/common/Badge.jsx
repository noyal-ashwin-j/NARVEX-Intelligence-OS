import React from 'react';

/**
 * Meaning-Driven Color System:
 * - Signal Red    #EF4444 : Critical zones, alerts (High priority)
 * - Alert Orange  #F97316 : Elevated risk, increasing (Medium)
 * - Watch Yellow  #EAB308 : Monitoring, review (Low)
 * - Info Blue     #3B82F6 : General data, neutral status
 * - AI Purple     #A855F7 : AI insights only (Exclusive)
 * - Success Green #10B981 : Positive / verified / expected (Rare use)
 * - Neutral Gray  #64748B : Insufficient data / closed
 */

export function RiskBadge({ level }) {
  const styles = {
    'HIGH PREVENTIVE ATTENTION': 'bg-red-500/10 text-red-600 border-red-500/30 dark:bg-red-950/40 dark:text-red-400 dark:border-red-500/30',
    'INCREASING': 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-500/30',
    'WATCH': 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/30',
    'LOW': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/30',
    'UNVERIFIED': 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700'
  };

  const current = styles[level] || 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:bg-slate-800 dark:text-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-inter font-medium uppercase tracking-[0.5px] border ${current}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {level || 'UNKNOWN'}
    </span>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    // Success Green #10B981
    'VERIFIED': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/30',
    'CORROBORATED': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/30',
    'ACTION_TAKEN': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/30',
    
    // Alert Orange #F97316
    'NEEDS_VERIFICATION': 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-500/30',
    
    // Watch Yellow #EAB308
    'UNDER_REVIEW': 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/30',
    'ASSIGNED': 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/30',

    // Info Blue #3B82F6
    'OPEN': 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500/30',
    'RECEIVED': 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500/30',
    'MONITORING': 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500/30',
    'REFERRED': 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500/30',
    'REFERRED_FOR_PREVENTION': 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500/30',

    // AI Purple #A855F7 (AI Insights only)
    'AI_GENERATED': 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-500/30',
    'PREDICTIVE': 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-500/30',

    // Gray (Neutral / Closed)
    'CLOSED': 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700',
    'UNVERIFIED': 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700'
  };

  const current = styles[status] || 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:bg-slate-800 dark:text-slate-400';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-inter font-medium uppercase tracking-[0.5px] border ${current}`}>
      {status ? status.replace(/_/g, ' ') : 'N/A'}
    </span>
  );
}

export function CoverageBadge({ coverage }) {
  const styles = {
    'GOOD': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/30',
    'MODERATE': 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/30',
    'LIMITED': 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700'
  };

  const current = styles[coverage] || 'bg-slate-500/10 text-slate-600 border-slate-500/30 dark:bg-slate-800 dark:text-slate-400';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-inter font-medium uppercase tracking-[0.5px] border ${current}`}>
      {coverage === 'LIMITED' ? 'INSUFFICIENT DATA' : `${coverage} COVERAGE`}
    </span>
  );
}
