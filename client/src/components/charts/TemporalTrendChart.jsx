import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export function TemporalTrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 font-mono text-[13px]">
        No temporal data available for selected filters.
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="enforceColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="indepColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
          <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', fontWeight: 500 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: '"JetBrains Mono", monospace', fontWeight: 500 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              borderColor: '#1e293b',
              borderRadius: '8px',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '12px',
              color: '#f8fafc',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', fontWeight: 500, paddingTop: '10px' }} />
          <Area
            type="monotone"
            dataKey="total_signals"
            name="Total Signals"
            stroke="#22D3EE"
            fillOpacity={1}
            fill="url(#totalColor)"
            strokeWidth={2.5}
          />
          <Area
            type="monotone"
            dataKey="enforcement_signals"
            name="Enforcement Actions"
            stroke="#EF4444"
            fillOpacity={1}
            fill="url(#enforceColor)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="independent_signals"
            name="Independent Signals"
            stroke="#A855F7"
            fillOpacity={1}
            fill="url(#indepColor)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
