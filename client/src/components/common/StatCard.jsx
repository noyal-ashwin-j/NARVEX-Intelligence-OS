import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  onClick,
  className = ''
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm transition-all font-inter ${
        onClick ? 'cursor-pointer hover:border-cyan-400/60 dark:hover:border-cyan-500/50 hover:shadow-glow-cyan' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      </div>

      <div className="mt-2 text-[24px] font-medium font-mono text-slate-900 dark:text-slate-100 tracking-tight">
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center gap-1.5 text-[13px] font-normal text-slate-500 dark:text-slate-400">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-medium ${
                trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-emerald-500' : 'text-slate-400'
              }`}
            >
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend === 'stable' && <Minus className="w-3 h-3" />}
              {trendValue}
            </span>
          )}
          {subtitle && <span className="truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
