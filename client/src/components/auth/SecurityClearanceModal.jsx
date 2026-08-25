import React, { useEffect, useState } from 'react';
import { Shield, Fingerprint, Lock, CheckCircle2, Cpu, Zap, Activity } from 'lucide-react';
import { playScanSweepSound, playAccessGrantedSound } from '../../utils/soundEffects';

export function SecurityClearanceModal({ isOpen, username, roleTitle, onComplete }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      return;
    }

    playScanSweepSound();

    const timer1 = setTimeout(() => setStep(1), 300);
    const timer2 = setTimeout(() => setStep(2), 650);
    const timer3 = setTimeout(() => setStep(3), 1000);
    const timer4 = setTimeout(() => {
      setStep(4);
      playAccessGrantedSound();
    }, 1350);

    const timerComplete = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timerComplete);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in font-inter">
      <div className="relative w-full max-w-md bg-[#0B0F19] border border-cyan-500/40 rounded-3xl p-8 shadow-[0_0_60px_rgba(34,211,238,0.25)] text-center space-y-6 overflow-hidden animate-modal-pop">
        {/* Animated Scanner Ring */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-indigo-500/20 border-b-indigo-400 animate-spin-reverse" />

          <div className="relative z-10 p-4 rounded-full bg-cyan-500/10 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan">
            {step < 4 ? (
              <Fingerprint className="w-10 h-10 animate-pulse text-[#22D3EE]" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold font-space uppercase tracking-wider text-white">
            {step < 4 ? 'Verifying Security Clearance' : 'Security Clearance Granted'}
          </h3>
          <p className="text-xs text-cyan-300/80 font-mono">
            OFFICER ID: <span className="text-white font-bold">{username || 'AUTHORITY'}</span>
          </p>
        </div>

        {/* Step-by-step Console Output */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left font-mono text-[11px] space-y-2 text-slate-300">
          <div className={`flex items-center gap-2 transition-all ${step >= 1 ? 'text-cyan-400 opacity-100' : 'opacity-30'}`}>
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>[0.1s] Verifying SHA-256 Ledger Provenance...</span>
          </div>

          <div className={`flex items-center gap-2 transition-all ${step >= 2 ? 'text-cyan-400 opacity-100' : 'opacity-30'}`}>
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>[0.4s] Checking Zero-Trust Role Matrix...</span>
          </div>

          <div className={`flex items-center gap-2 transition-all ${step >= 3 ? 'text-cyan-400 opacity-100' : 'opacity-30'}`}>
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>[0.7s] Establishing Live SSE Telemetry Handshake...</span>
          </div>

          <div className={`flex items-center gap-2 font-bold transition-all ${step >= 4 ? 'text-emerald-400 opacity-100' : 'opacity-30'}`}>
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>[1.0s] ACCESS AUTHORIZED. LOADING COMMAND NODE...</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
