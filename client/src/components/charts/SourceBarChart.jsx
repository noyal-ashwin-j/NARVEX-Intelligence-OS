import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export function SourceBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 font-mono text-[13px]">
        No source breakdown data available.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.source_name.length > 18 ? item.source_name.substring(0, 18) + '...' : item.source_name,
    fullName: item.source_name,
    count: parseInt(item.count, 10),
    type: item.source_type
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            tick={{ fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
            angle={-20}
            textAnchor="end"
          />
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
          <Bar dataKey="count" name="Signals Count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`bar-${index}`}
                fill={entry.type === 'ENFORCEMENT' ? '#EF4444' : entry.type === 'CHECKPOST' ? '#10B981' : '#22D3EE'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
