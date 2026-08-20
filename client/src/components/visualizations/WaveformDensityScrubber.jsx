import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { Activity, Clock, Sliders } from 'lucide-react';

export function WaveformDensityScrubber() {
  const [selectedRange, setSelectedRange] = useState('30D');

  const rawData = [
    { time: '00:00', density: 12, baseline: 8, confidence: 85 },
    { time: '02:00', density: 24, baseline: 10, confidence: 88 },
    { time: '04:00', density: 48, baseline: 14, confidence: 92 },
    { time: '06:00', density: 32, baseline: 18, confidence: 86 },
    { time: '08:00', density: 18, baseline: 22, confidence: 80 },
    { time: '10:00', density: 28, baseline: 25, confidence: 78 },
    { time: '12:00', density: 35, baseline: 24, confidence: 84 },
    { time: '14:00', density: 22, baseline: 20, confidence: 82 },
    { time: '16:00', density: 41, baseline: 22, confidence: 89 },
    { time: '18:00', density: 65, baseline: 26, confidence: 94 },
    { time: '20:00', density: 82, baseline: 30, confidence: 96 },
    { time: '22:00', density: 56, baseline: 20, confidence: 90 }
  ];

  return (
    <div className="p-4 rounded-3xl bg-[#090E1A] border border-cyan-500/20 shadow-lg space-y-3 font-inter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h4 className="font-semibold text-xs text-white uppercase tracking-wider font-space">
            Telemetry Waveform Density Scrubber
          </h4>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-xl text-[10px] font-mono">
          {['24H', '7D', '30D', '90D'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRange(r)}
              className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                selectedRange === r
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* High-Contrast Mountain Waveform Area Chart */}
      <div className="w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rawData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="waveformCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="waveformEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.4} />
            <XAxis
              dataKey="time"
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
            <Area
              type="natural"
              dataKey="density"
              name="Active Signal Pulse"
              stroke="#22D3EE"
              strokeWidth={2.5}
              fill="url(#waveformCyan)"
            />
            <Area
              type="natural"
              dataKey="baseline"
              name="Historical Normal"
              stroke="#10B981"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              fill="url(#waveformEmerald)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Scrubber Status */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-cyan-400" /> Peak Surge: <strong>20:00 - 22:00 IST (Late Night Transit)</strong>
        </span>
        <span className="text-cyan-400">Deviation: +52 Signals over baseline</span>
      </div>
    </div>
  );
}
