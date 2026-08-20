import React from 'react';
import { Activity, ShieldCheck, Database, Zap } from 'lucide-react';

export function CircularGaugeMetrics({ velocity = 9.4, confidence = 88, coverage = 76, activeAlerts = 20 }) {
  // SVG circular calculation helper
  const renderCircle = (value, max, color, size = 110, stroke = 8) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(value / max, 0), 1);
    const strokeDashoffset = circumference - progress * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E293B"
          strokeWidth={stroke}
          fill="transparent"
        />
        {/* Animated value arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Gauge 1: Risk Velocity Acceleration */}
      <div className="p-3.5 rounded-2xl bg-[#090E1A] border border-cyan-500/30 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-glow-cyan">
        <div className="absolute top-2 left-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Zap className="w-3 h-3 text-cyan-400" /> Velocity Index
        </div>
        <div className="relative my-2 flex items-center justify-center">
          {renderCircle(velocity, 10, '#22D3EE', 96, 7)}
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-bold font-mono text-white tracking-tight">{velocity}x</span>
            <span className="text-[9px] font-mono text-cyan-400">RAPID</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">30D Accel Ratio</span>
      </div>

      {/* Gauge 2: Evidence Quality / Confidence */}
      <div className="p-3.5 rounded-2xl bg-[#090E1A] border border-emerald-500/30 flex flex-col items-center justify-between text-center relative overflow-hidden">
        <div className="absolute top-2 left-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Evidence Conf
        </div>
        <div className="relative my-2 flex items-center justify-center">
          {renderCircle(confidence, 100, '#10B981', 96, 7)}
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-bold font-mono text-white tracking-tight">{confidence}%</span>
            <span className="text-[9px] font-mono text-emerald-400">GROUNDED</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Cross-Corroborated</span>
      </div>

      {/* Gauge 3: Data Coverage Index */}
      <div className="p-3.5 rounded-2xl bg-[#090E1A] border border-purple-500/30 flex flex-col items-center justify-between text-center relative overflow-hidden">
        <div className="absolute top-2 left-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Database className="w-3 h-3 text-purple-400" /> Coverage Rate
        </div>
        <div className="relative my-2 flex items-center justify-center">
          {renderCircle(coverage, 100, '#A855F7', 96, 7)}
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-bold font-mono text-white tracking-tight">{coverage}%</span>
            <span className="text-[9px] font-mono text-purple-400">TELEMETRY</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">38 DT Grid Active</span>
      </div>

      {/* Gauge 4: Active Threat Radar */}
      <div className="p-3.5 rounded-2xl bg-[#090E1A] border border-amber-500/30 flex flex-col items-center justify-between text-center relative overflow-hidden">
        <div className="absolute top-2 left-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Activity className="w-3 h-3 text-amber-400" /> Alert Queue
        </div>
        <div className="relative my-2 flex items-center justify-center">
          {renderCircle(activeAlerts, 50, '#F59E0B', 96, 7)}
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-bold font-mono text-white tracking-tight">{activeAlerts}</span>
            <span className="text-[9px] font-mono text-amber-400">PENDING</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Field Review Req.</span>
      </div>
    </div>
  );
}
