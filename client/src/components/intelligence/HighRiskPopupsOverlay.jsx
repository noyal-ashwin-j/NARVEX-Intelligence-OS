import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Zap, ArrowRight, X, ChevronRight, HelpCircle, Bell } from 'lucide-react';

export function HighRiskPopupsOverlay({ onSelectDistrict, onOpenWhyFlagged }) {
  const [alerts, setAlerts] = useState([
    {
      id: 'alert-1',
      type: 'HIGH_PREVENTIVE_ATTENTION',
      severity: 'CRITICAL',
      title: 'Coimbatore Urban Core (Gandhipuram)',
      districtId: 2,
      districtName: 'Coimbatore',
      metric: '+34% Velocity (6.0x Accel)',
      desc: 'Multi-source independent signals verified. Immediate preventive patrol advisory issued.',
      time: '08:42 PM',
      color: 'border-red-500/50 bg-red-950/40 text-red-300'
    },
    {
      id: 'alert-2',
      type: 'NEW_SIGNAL',
      severity: 'WARNING',
      title: 'Salem (Shevapet Commercial Street)',
      districtId: 4,
      districtName: 'Salem',
      metric: 'Zero-History Locality',
      desc: 'First recorded anonymous tip in commercial trading corridor. Corroboration required.',
      time: '07:58 PM',
      color: 'border-purple-500/50 bg-purple-950/40 text-purple-300'
    },
    {
      id: 'alert-3',
      type: 'CORRIDOR_SHIFT',
      severity: 'ADVISORY',
      title: 'Walayar → Coimbatore → Salem Corridor',
      districtId: 10,
      districtName: 'Krishnagiri / Salem',
      metric: '14 Inter-State Observations',
      desc: 'Bézier telemetry indicates transit shift along NH-544 / NH-44 checkpoint routes.',
      time: '07:31 PM',
      color: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
    }
  ]);

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2.5 font-inter">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>Live High-Risk Intelligence Alerts ({alerts.length})</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Real-Time State Telemetry</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => onSelectDistrict && onSelectDistrict(alert.districtId)}
            className={`p-3.5 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-2 ${alert.color} hover:scale-[1.02]`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  {alert.type.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-mono text-slate-400">{alert.time}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissAlert(alert.id);
                  }}
                  className="p-0.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Title & Metric */}
            <div>
              <h5 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors font-space">
                {alert.title}
              </h5>
              <div className="text-[10px] font-mono text-cyan-300 mt-0.5 font-semibold">
                {alert.metric}
              </div>
            </div>

            {/* Description */}
            <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
              {alert.desc}
            </p>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenWhyFlagged) {
                    onOpenWhyFlagged({
                      name: alert.title,
                      risk_level: 'HIGH PREVENTIVE ATTENTION',
                      confidence_score: 88,
                      coverage_status: 'ADEQUATE',
                      velocity_30d: '6.0x'
                    });
                  }
                }}
                className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" /> Why?
              </button>

              <span className="text-cyan-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Inspect <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
