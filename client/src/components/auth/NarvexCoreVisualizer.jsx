import React, { useState, useEffect } from 'react';
import { Shield, Radio, Lock, Activity, CheckCircle2 } from 'lucide-react';

/**
 * NARVEX Central Intelligence Core Anchor
 * Controlled 3D Orbital Rings, Telemetry Step Text, and Subtle Core Pulses
 */
export function NarvexCoreVisualizer({ stateText, isAuthenticating = false, isAccessGranted = false }) {
  const [telemetryStep, setTelemetryStep] = useState(0);

  const steps = [
    'BOOTING INTELLIGENCE CORE',
    'SYNCING SIGNAL NETWORK',
    'SECURE CHANNEL DETECTED',
    'COMMAND NODE READY'
  ];

  // Progressive loading text sequence on mount
  useEffect(() => {
    if (isAuthenticating || isAccessGranted) return;

    const timer1 = setTimeout(() => setTelemetryStep(1), 400);
    const timer2 = setTimeout(() => setTelemetryStep(2), 800);
    const timer3 = setTimeout(() => setTelemetryStep(3), 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isAuthenticating, isAccessGranted]);

  const activeStatusText = isAccessGranted
    ? 'ACCESS GRANTED — ENTERING COMMAND SYSTEM'
    : isAuthenticating
    ? (stateText || 'VERIFYING CREDENTIALS…')
    : steps[telemetryStep];

  return (
    <div className="flex flex-col items-center justify-center space-y-3 font-inter select-none">
      {/* Central Core & Orbital Rings Container */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer Ring 1 (Slow clockwise rotation) */}
        <div
          className={`absolute inset-0 rounded-full border border-cyan-500/30 border-t-cyan-400 transition-all duration-700 ${
            isAccessGranted ? 'scale-150 border-emerald-400 opacity-80' : 'animate-[spin_12s_linear_infinite]'
          }`}
        />

        {/* Middle Ring 2 (Counter-clockwise rotation) */}
        <div
          className={`absolute inset-2 rounded-full border border-indigo-500/20 border-b-indigo-400 transition-all duration-700 ${
            isAccessGranted ? 'scale-125 border-emerald-400 opacity-60' : 'animate-[spin_8s_linear_infinite_reverse]'
          }`}
        />

        {/* Inner Ring 3 (Fast subtle pulse ring) */}
        <div
          className={`absolute inset-4 rounded-full border border-slate-700/60 ${
            isAuthenticating ? 'border-amber-400/60 animate-ping' : ''
          }`}
        />

        {/* Orbiting Signal Particle */}
        <div
          className="absolute inset-0 animate-[spin_6s_linear_infinite] pointer-events-none"
          style={{ animationPlayState: isAccessGranted ? 'paused' : 'running' }}
        >
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
        </div>

        {/* Center Core Shield Icon */}
        <div
          className={`relative z-10 p-4 rounded-2xl border transition-all duration-500 ${
            isAccessGranted
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-[0_0_40px_rgba(16,185,129,0.4)] scale-110'
              : isAuthenticating
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse'
              : 'bg-cyan-500/10 text-[#22D3EE] border-cyan-500/30 shadow-[0_0_25px_rgba(34,211,238,0.2)]'
          }`}
        >
          {isAccessGranted ? (
            <CheckCircle2 className="w-8 h-8 animate-bounce" />
          ) : (
            <Shield className="w-8 h-8" />
          )}
        </div>
      </div>

      {/* Telemetry Status Line */}
      <div className="flex items-center gap-2 text-xs font-mono tracking-wider">
        <span
          className={`w-2 h-2 rounded-full ${
            isAccessGranted
              ? 'bg-emerald-400 animate-ping'
              : isAuthenticating
              ? 'bg-amber-400 animate-ping'
              : 'bg-[#22D3EE] animate-pulse'
          }`}
        />
        <span
          className={`transition-colors duration-300 ${
            isAccessGranted
              ? 'text-emerald-300 font-bold'
              : isAuthenticating
              ? 'text-amber-300 font-bold'
              : 'text-slate-300 font-medium'
          }`}
        >
          {activeStatusText}
        </span>
      </div>
    </div>
  );
}
