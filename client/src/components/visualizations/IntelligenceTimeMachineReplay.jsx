import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Clock,
  Sparkles,
  Layers,
  MapPin,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export function IntelligenceTimeMachineReplay({ onSelectDistrict }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 5x

  const timelineSteps = [
    {
      day: 'Day 01 (Aug 01)',
      title: 'Historical Baseline Normal',
      district: 'Statewide',
      districtId: 2,
      events: 4,
      desc: 'Standard background surveillance density across 38 districts. Zero abnormal surges.',
      status: 'BASELINE_STABLE',
      color: 'text-slate-400'
    },
    {
      day: 'Day 05 (Aug 05)',
      title: '🟣 Zero-History First-Time Signal Detected',
      district: 'Salem (Shevapet)',
      districtId: 4,
      events: 7,
      desc: 'First recorded anonymous intelligence tip in commercial street (zero prior historical records). Flagged for verification.',
      status: 'FIRST_TIME_SIGNAL',
      color: 'text-purple-400'
    },
    {
      day: 'Day 09 (Aug 09)',
      title: '📈 Micro-Cluster Signal Acceleration',
      district: 'Coimbatore (Gandhipuram)',
      districtId: 2,
      events: 14,
      desc: '3 multi-source tips in campus sector within 48 hours. Velocity shifts from 1.0x to 2.4x.',
      status: 'EMERGING_CLUSTER',
      color: 'text-amber-400'
    },
    {
      day: 'Day 14 (Aug 14)',
      title: '🛣️ Interstate Checkpost Telemetry Anomaly',
      district: 'Krishnagiri (Zuzuvadi)',
      districtId: 10,
      events: 24,
      desc: 'NH-48 interstate freight night scan flagged repeated transit discrepancies. Spatial association established.',
      status: 'CORRIDOR_SURGE',
      color: 'text-cyan-400'
    },
    {
      day: 'Day 18 (Today)',
      title: '🚨 High Preventive Attention Priority Confirmed',
      district: 'Coimbatore & Chennai Gateways',
      districtId: 2,
      events: 35,
      desc: 'Multi-source corroboration verified. Early warning alert dispatched to District Intelligence Officer.',
      status: 'HIGH_PREVENTIVE_PRIORITY',
      color: 'text-red-400'
    }
  ];

  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 2500 / speed;
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= timelineSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, speed, timelineSteps.length]);

  const activeStep = timelineSteps[currentStep];

  return (
    <div className="p-5 rounded-3xl bg-[#090E1A] border border-cyan-500/30 shadow-lg space-y-4 font-inter text-slate-100">
      {/* Header with Player Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <h4 className="font-bold text-sm text-white uppercase tracking-wider font-space">
              NARVEX Time Machine // Intelligence Replay
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Replay historical evolution: Observe how emerging risk clusters develop over time.
            </p>
          </div>
        </div>

        {/* Player Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause Replay' : 'Play Timeline'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep(0);
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Reset to Day 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-xl text-[10px] font-mono">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                  speed === s ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Timeline Stepper Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Evolution Progression: Step {currentStep + 1} of {timelineSteps.length}</span>
          <span className="text-cyan-400 font-bold">{activeStep.day}</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {timelineSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                setIsPlaying(false);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStep
                  ? 'bg-cyan-400 shadow-glow-cyan h-2.5'
                  : idx < currentStep
                  ? 'bg-cyan-700'
                  : 'bg-slate-800'
              }`}
              title={step.day}
            />
          ))}
        </div>
      </div>

      {/* Active Step Intelligence Inspection Card */}
      <div
        onClick={() => onSelectDistrict && onSelectDistrict(activeStep.districtId)}
        className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2 cursor-pointer group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm ${activeStep.color} font-space`}>
              {activeStep.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-300">
              {activeStep.district}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold">
              {activeStep.events} Cumulative Signals
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {activeStep.desc}
        </p>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>State: <strong className="text-white">{activeStep.status}</strong></span>
          <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Inspect Jurisdiction <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
