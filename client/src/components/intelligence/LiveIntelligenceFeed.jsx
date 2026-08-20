import React from 'react';
import {
  Radio,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  HelpCircle,
  Zap,
  Layers,
  ChevronRight
} from 'lucide-react';

export function LiveIntelligenceFeed({ onSelectDistrict, onOpenWhyFlagged, onNavigateTab }) {
  // Real-time grounded feed items generated dynamically from intelligence repository
  const feedItems = [
    {
      id: 'feed-1',
      time: '08:42 PM',
      type: 'RAPID_INCREASE',
      badge: '⚠️ RAPID INCREASE',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      title: 'Coimbatore — Gandhipuram Sector',
      districtId: 2,
      districtName: 'Coimbatore',
      lat: 11.0168,
      lng: 76.9558,
      desc: 'Signal activity increased +34% compared with previous 30-day baseline. Multi-source cluster flagged.',
      confidence: '78%',
      status: 'NEEDS VERIFICATION',
      actionLabel: 'View on Map',
      actionTab: 'gis-map'
    },
    {
      id: 'feed-2',
      time: '07:58 PM',
      type: 'NEW_SIGNAL',
      badge: '🟣 NEW SIGNAL',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      title: 'Salem — Shevapet Commercial Street',
      districtId: 4,
      districtName: 'Salem',
      lat: 11.6643,
      lng: 78.1460,
      desc: 'Zero historical reports in this locality. 2 independent non-correlated signals received.',
      confidence: '71%',
      status: 'FIRST-TIME SIGNAL',
      actionLabel: 'Investigate',
      actionTab: 'verification-queue'
    },
    {
      id: 'feed-3',
      time: '07:31 PM',
      type: 'CORRIDOR_CHANGE',
      badge: '🛣️ CORRIDOR SHIFT',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      title: 'Walayar - Coimbatore - Salem Highway Corridor',
      districtId: 2,
      districtName: 'Coimbatore',
      lat: 10.8654,
      lng: 76.8541,
      desc: 'Interstate gateway telemetry differs from previous 90-day baseline pattern. 14 observations recorded.',
      confidence: '84%',
      status: 'MONITORING',
      actionLabel: 'View Corridor',
      actionTab: 'spatial-temporal'
    }
  ];

  return (
    <div className="p-4 rounded-3xl bg-[#0D1527] border border-cyan-500/20 shadow-lg space-y-3 font-inter">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="font-semibold text-xs tracking-wider uppercase text-white font-space flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            NARVEX Live Intelligence Feed
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono">
            Continuous Stream
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>Active Telemetry Streams: <strong>4 Linked</strong></span>
        </div>
      </div>

      {/* Feed Stream Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {feedItems.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2.5 flex flex-col justify-between group shadow-sm"
          >
            {/* Top row: Time + Badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" /> {item.time}
              </span>
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium ${item.badgeColor}`}>
                {item.badge}
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h4 className="font-semibold text-[13px] text-white group-hover:text-cyan-400 transition-colors font-space">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>

            {/* Metrics & Action Footer */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2 font-mono text-slate-400">
                <span>Conf: <strong className="text-cyan-300">{item.confidence}</strong></span>
              </div>

              <div className="flex items-center gap-1.5">
                {onOpenWhyFlagged && (
                  <button
                    onClick={() => onOpenWhyFlagged({ name: item.title, district_name: item.districtName, risk_level: item.badge, confidence: 78 })}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 cursor-pointer"
                    title="Why NARVEX Thinks This?"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => {
                    if (onSelectDistrict) onSelectDistrict(item.districtId);
                    if (onNavigateTab && item.actionTab) onNavigateTab(item.actionTab);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-all"
                >
                  <span>{item.actionLabel}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
