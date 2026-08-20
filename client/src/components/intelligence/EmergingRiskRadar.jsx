import React from 'react';
import {
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export function EmergingRiskRadar({ onSelectDistrict, onOpenWhyFlagged, onNavigateTab }) {
  const radarStages = [
    {
      stage: 'NOW',
      label: 'High Preventive Priority',
      badge: '🔴 NOW',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      items: [
        {
          name: 'Coimbatore Urban Core',
          districtId: 2,
          velocity: '6.0x Velocity',
          conf: '88%',
          factors: 'Interstate gateway telemetry discrepancy + campus cluster'
        },
        {
          name: 'Chennai Port & Freight Axis',
          districtId: 1,
          velocity: '4.0x Velocity',
          conf: '82%',
          factors: 'Coastal freight arrival anomalies + unverified citizen tips'
        }
      ]
    },
    {
      stage: 'NEXT',
      label: 'Accelerating Risk Velocity',
      badge: '🟠 NEXT',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      items: [
        {
          name: 'Krishnagiri / Hosur Gateway',
          districtId: 10,
          velocity: '3.0x Velocity',
          conf: '79%',
          factors: 'Late-night freight discrepancy + NH-48 interstate volume'
        },
        {
          name: 'Salem Shevapet Junction',
          districtId: 4,
          velocity: '2.5x Velocity',
          conf: '74%',
          factors: 'Commercial distribution complaints + first-time signals'
        }
      ]
    },
    {
      stage: 'EMERGING',
      label: 'Early Cluster Formations',
      badge: '🟡 EMERGING',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      items: [
        {
          name: 'Tenkasi Puliyarai Ghat Route',
          districtId: 14,
          velocity: '2.0x Velocity',
          conf: '68%',
          factors: 'Southern Kerala border pass observations'
        },
        {
          name: 'Madurai Mattuthavani Sector',
          districtId: 3,
          velocity: '1.8x Velocity',
          conf: '72%',
          factors: 'Transit hub multi-point parcel observations'
        }
      ]
    },
    {
      stage: 'INSUFFICIENT_DATA',
      label: 'Sparse Data (Not Assumed Safe)',
      badge: '⚪ INSUFFICIENT DATA',
      badgeColor: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
      items: [
        {
          name: 'Ariyalur Rural Boundary',
          districtId: 31,
          velocity: 'Baseline Sparse',
          conf: '35%',
          factors: 'Low historical report density; human verification mandated'
        },
        {
          name: 'Perambalur West Block',
          districtId: 32,
          velocity: 'Baseline Sparse',
          conf: '38%',
          factors: 'Reporting gap flagged; active telemetry surveillance initiated'
        }
      ]
    }
  ];

  return (
    <div className="p-5 rounded-3xl bg-[#0D1527] border border-slate-800 shadow-md space-y-4 font-inter text-xs">
      {/* Radar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-semibold text-[14px] text-white uppercase tracking-wider font-space flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Emerging Risk Radar — Preventive Attention Horizon
          </h3>
          <p className="text-[11px] text-slate-400 font-normal mt-0.5">
            Continuous trajectory mapping: Identifies present risk, accelerating regions, and early clusters.
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
          30-90 Day Projection
        </span>
      </div>

      {/* Radar 4-Column Horizon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {radarStages.map((stage) => (
          <div
            key={stage.stage}
            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3"
          >
            {/* Stage Title */}
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-semibold ${stage.badgeColor}`}>
                {stage.badge}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{stage.items.length} Zones</span>
            </div>

            {/* Stage Items */}
            <div className="space-y-2.5 flex-1">
              {stage.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/30 transition-all space-y-1.5 group cursor-pointer"
                  onClick={() => onSelectDistrict && onSelectDistrict(item.districtId)}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-semibold text-white text-[12px] group-hover:text-cyan-400 transition-colors font-space">
                      {item.name}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/50 px-1.5 py-0.2 rounded border border-cyan-500/30">
                      {item.velocity}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                    {item.factors}
                  </p>

                  <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono">Conf: {item.conf}</span>
                    {onOpenWhyFlagged && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenWhyFlagged({ name: item.name, risk_level: stage.badge, confidence: parseInt(item.conf, 10) });
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-0.5 text-[9px] cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" /> Why?
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
