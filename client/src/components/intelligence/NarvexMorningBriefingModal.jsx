import React from 'react';
import {
  Sparkles,
  Zap,
  ShieldAlert,
  ArrowRight,
  X,
  Radio,
  Clock,
  ChevronRight,
  Layers,
  MapPin
} from 'lucide-react';

export function NarvexMorningBriefingModal({ isOpen, onClose, onNavigateTab, onSelectDistrict }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center font-inter text-xs">
      <div onClick={onClose} className="fixed inset-0 bg-[#070B14]/85 backdrop-blur-md transition-opacity" />

      <div className="relative w-full max-w-xl bg-[#090E1A] border border-cyan-500/40 rounded-3xl shadow-glow-cyan z-10 space-y-5 p-6 text-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan">
              <Sparkles className="w-6 h-6 animate-pulse text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white uppercase tracking-wider font-space">
                  NARVEX Morning Briefing
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono">
                  Statewide Delta
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Automated 24-Hour State Intelligence Digest • Grounded in MySQL Ledger
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Briefing Narrative Message */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 font-inter">
          <div className="font-bold text-sm text-cyan-300 font-space flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            Good morning Officer.
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            Surveillance telemetry processed over the last 24 hours has generated <strong>5 critical operational updates</strong> across Tamil Nadu:
          </p>

          {/* Key Bullet Summary */}
          <div className="space-y-2 pt-1 font-mono text-[11px]">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">📊 New Signals Processed Today:</span>
              <strong className="text-cyan-400">+35 Signals</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">📈 Highest Velocity Jurisdiction:</span>
              <strong className="text-red-400">Coimbatore (6.0x Accel)</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">🟣 Zero-History First-Time Signals:</span>
              <strong className="text-purple-400">Salem (Shevapet), Tenkasi</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">🛣️ Interstate Corridors Monitored:</span>
              <strong className="text-emerald-400">12 Active Arcs (Kerala, KA, AP)</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">🚨 Unresolved Action Alerts:</span>
              <strong className="text-amber-400">4 Pending Human Triage</strong>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
          >
            Dismiss Briefing
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onSelectDistrict) onSelectDistrict(2); // Focus Coimbatore
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-medium cursor-pointer transition-all"
            >
              Focus Coimbatore
            </button>

            <button
              onClick={() => {
                onClose();
                if (onNavigateTab) onNavigateTab('command-center');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <span>View Live Changes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
