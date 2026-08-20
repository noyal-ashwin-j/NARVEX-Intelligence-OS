import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { BarChart3, Activity } from 'lucide-react';

export function MultiSpectrumBarChart() {
  const data = [
    { category: 'Synthetic MDMA', last7D: 18, last30D: 42, baseline90D: 25 },
    { category: 'Commercial Ganja', last7D: 24, last30D: 58, baseline90D: 48 },
    { category: 'Rx Narcotics', last7D: 12, last30D: 31, baseline90D: 20 },
    { category: 'Chemical Precursors', last7D: 8, last30D: 19, baseline90D: 14 },
    { category: 'Opioid Analogues', last7D: 6, last30D: 15, baseline90D: 9 }
  ];

  return (
    <div className="p-4 rounded-3xl bg-[#090E1A] border border-slate-800 shadow-lg space-y-3 font-inter">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h4 className="font-semibold text-xs text-white uppercase tracking-wider font-space">
            Multi-Spectrum Temporal Category Surge (7D vs 30D vs 90D)
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Normalized Velocity Comparison
        </span>
      </div>

      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.5} />
            <XAxis
              dataKey="category"
              stroke="#64748B"
              tick={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace' }}
            />
            <YAxis
              stroke="#64748B"
              tick={{ fontSize: 10, fontFamily: '"JetBrains Mono", monospace' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#090E1A',
                borderColor: '#22D3EE',
                borderRadius: '12px',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '11px',
                color: '#F8FAFC'
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: '10px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                paddingTop: '8px'
              }}
            />
            <Bar dataKey="last7D" name="Recent 7-Day Surge" fill="#22D3EE" radius={[4, 4, 0, 0]} />
            <Bar dataKey="last30D" name="Active 30-Day Window" fill="#A855F7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="baseline90D" name="90-Day Baseline" fill="#475569" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
