import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  UserX,
  FileText,
  Activity,
  HeartHandshake
} from 'lucide-react';

export function CampusCaseStudyModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Event 1: Initial Student Overdose Incident',
      realWorldFailure: 'In traditional police stations, this was recorded as an isolated accidental hospital death. Hospital records and police FIRs remained disconnected in separate paper silos.',
      narcIntelSolution: 'Cross-Department Ingestion links hospital aggregate admissions (18-25 cohort) with local precinct logs. System instantly flags a 35% synthetic substance anomaly in the student zone and raises status to WATCH LEVEL.',
      statusTag: 'SIGNAL CORRELATED',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    {
      step: 2,
      title: 'Event 2: Second Violent Altercation in Vicinity',
      realWorldFailure: 'Treated as an ordinary street brawl. No correlation was established with the previous student death.',
      narcIntelSolution: 'Spatial-Temporal Engine (NRISE-RISK-v1.0) correlates 2 critical events within 1.5km in under 14 days. The campus zone automatically escalates to HIGH PREVENTIVE ATTENTION (Red Alert Hotspot) on the District Officer dashboard.',
      statusTag: 'ESCALATED TO HIGH RISK',
      badgeColor: 'text-red-700 bg-red-50 border-red-200'
    },
    {
      step: 3,
      title: 'Proactive Early Intervention: Preventing the 3rd Death',
      realWorldFailure: 'Without early warnings, no proactive steps were taken, leading to a 3rd fatal casualty.',
      narcIntelSolution: 'System automatically generates Action Ticket TKT-2026-CAMPUS-SHIELD: 1) Non-coercive student counseling & NSS awareness workshops at college clusters, 2) Midnight highway checkpost weight checks at bypass ingress points. Supply is intercepted before the 3rd casualty occurs!',
      statusTag: '3RD TRAGEDY PREVENTED',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      step: 4,
      title: 'Whistleblower Shield: Protecting the Student Informant',
      realWorldFailure: 'A student informant provided tips directly to local police; his identity was leaked/exposed, leading to a brutal retaliatory assault.',
      narcIntelSolution: 'Zero-Identity Cryptographic Whistleblower Architecture: PII redactor automatically sanitizes names, phone numbers, and IP addresses. Generates blind token TN-7X9K-42PQ. Even inspecting police officers CANNOT see the informant’s identity because it is never stored in the database. The student remains 100% safe.',
      statusTag: 'INFORMANT 100% PROTECTED',
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center font-inter text-xs">
      <div onClick={onClose} className="fixed inset-0 bg-[#0B0F19]/70 backdrop-blur-sm transition-opacity" />

      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[18px] text-slate-900 dark:text-slate-100 uppercase tracking-tight font-space">
                Real-World Case Study: Campus Tragedy Prevention
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal">
                How NARC-INTEL connects disconnected signals to save student lives and protect whistleblowers.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Selector Tabs */}
        <div className="grid grid-cols-4 gap-2">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`p-2.5 rounded-xl border text-center text-xs font-medium uppercase tracking-[0.5px] transition-all cursor-pointer ${
                activeStep === s.step
                  ? 'bg-[#22D3EE] text-black border-cyan-400 font-semibold shadow-glow-cyan'
                  : 'bg-slate-50 dark:bg-[#0B0F19] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Stage {s.step}
            </button>
          ))}
        </div>

        {/* Active Stage Content */}
        {(() => {
          const current = steps[activeStep - 1];
          return (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                <h4 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 font-space">
                  {current.title}
                </h4>
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase tracking-[0.5px] border ${current.badgeColor}`}>
                  {current.statusTag}
                </span>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Traditional Failure */}
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-medium text-red-500 uppercase text-[11px] tracking-[0.5px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Traditional System Failure
                  </div>
                  <p className="text-slate-800 dark:text-slate-300 font-normal text-[13px] leading-relaxed">
                    {current.realWorldFailure}
                  </p>
                </div>

                {/* NARC-INTEL Solution */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-medium text-emerald-400 uppercase text-[11px] tracking-[0.5px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    NARC-INTEL Early Prevention
                  </div>
                  <p className="text-slate-800 dark:text-slate-300 font-normal text-[13px] leading-relaxed">
                    {current.narcIntelSolution}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400 font-normal">
            Stage {activeStep} of 4 • Built for Youth & Whistleblower Safety
          </span>

          <div className="flex items-center gap-2">
            {activeStep < 4 ? (
              <button
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="px-4 py-2 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black font-semibold text-xs uppercase tracking-[0.5px] shadow-glow-cyan flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black font-semibold text-xs uppercase tracking-[0.5px] shadow-glow-cyan cursor-pointer transition-all"
              >
                Close Case Study
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
