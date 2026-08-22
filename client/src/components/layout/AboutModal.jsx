import React from 'react';
import { Shield, X, Info, CheckCircle2, Code2, Calendar, Database, Sparkles, Target, Compass } from 'lucide-react';

export function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center font-inter text-xs">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0B0F19]/70 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[18px] text-slate-900 dark:text-slate-100 uppercase tracking-tight font-space">
                NARVEX <span className="text-[#22D3EE]">INTELLIGENCE OS</span>
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal">
                Sovereign Narcotics Spatial-Temporal Intelligence & Preventive Risk Monitoring Platform
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mission Motto Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-purple-950 text-white space-y-1 shadow-md border border-slate-800">
          <span className="text-[11px] font-medium text-[#22D3EE] uppercase tracking-[1px] block">
            Core Philosophy
          </span>
          <div className="text-[15px] font-semibold font-space">
            “Don’t wait for the pattern to become a crisis.”
          </div>
          <p className="text-[13px] text-slate-300 font-normal">
            Detect the signal. Understand the pattern. Verify the risk. Act earlier.
          </p>
        </div>

        {/* Project Description */}
        <div className="space-y-3">
          <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            <strong>The Core Problem:</strong> Drug-related incidents, citizen signals, police reports, and healthcare logs are often recorded in separate silos. Without continuously correlating their location, time, and historical transit patterns, an emerging regional risk may only become visible after multiple serious tragedies have already occurred.
          </p>

          <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            <strong>The Solution:</strong> NARVEX continuously correlates multi-source signals to detect emerging patterns, visualize geographic and temporal progression, protect anonymous whistleblowers, and route evidence-based early warnings to authorized officers for human verification and proactive prevention.
          </p>

          <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase block font-medium tracking-[0.5px]">Target Jurisdiction</span>
              <strong className="text-[#22D3EE] text-xs font-space font-semibold">Tamil Nadu (38 Districts)</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase block font-medium tracking-[0.5px]">Privacy Architecture</span>
              <strong className="text-emerald-500 text-xs font-semibold">Zero-Identity Cryptography</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase block font-medium tracking-[0.5px]">Decision Safeguard</span>
              <strong className="text-amber-500 text-xs font-semibold">Risk ≠ Proof (Human-in-the-Loop)</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase block font-medium tracking-[0.5px]">Audit Architecture</span>
              <strong className="text-purple-400 text-xs font-semibold font-mono">SHA-256 Hash Chain</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black font-semibold text-xs uppercase tracking-[0.5px] shadow-glow-cyan cursor-pointer transition-all"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}
