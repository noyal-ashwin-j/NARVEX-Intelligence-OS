import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ShieldAlert,
  Activity,
  Database,
  Layers,
  FileText,
  CheckCircle2,
  XCircle,
  Cpu,
  Radio,
  Zap,
  Globe,
  X
} from 'lucide-react';

export function NarvexCaseReplayModal({ isOpen, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [replayState, setReplayState] = useState({ currentStepIndex: 0, totalSteps: 9, logs: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchStatus();
  }, [isOpen]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/validation/replay/status');
      const data = await res.json();
      if (data.success && data.replayState) {
        setReplayState(data.replayState);
      }
    } catch (err) {
      console.error('Failed to fetch replay status:', err);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/validation/replay/start', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setReplayState(data.firstStep.replayState);
        setCurrentStep(data.firstStep.currentStep);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/validation/replay/step', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.currentStep) {
        setReplayState(data.replayState);
        setCurrentStep(data.currentStep);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setIsPlaying(false);
    try {
      const res = await fetch('http://localhost:5000/api/validation/replay/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setReplayState(data.replayState);
        setCurrentStep(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 font-inter">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-cyan-400 animate-pulse" />
            <div>
              <h2 className="text-sm font-bold tracking-wider text-cyan-300 font-mono">
                NARVEX CASE REPLAY — REAL-WORLD SCENARIO VALIDATION
              </h2>
              <p className="text-[10px] text-slate-400">
                End-to-End Observational Intelligence Pipeline Replay & Verification Engine
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/90 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handleStart}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Play className="size-3.5 fill-current" />
                <span>Start Scenario</span>
              </button>
              <button
                onClick={handleStep}
                disabled={loading || replayState.currentStepIndex >= replayState.totalSteps}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                <SkipForward className="size-3.5" />
                <span>Next Event (T{replayState.currentStepIndex})</span>
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="font-mono text-xs text-slate-400 flex items-center gap-3">
              <span>Step: <strong className="text-cyan-400">{replayState.currentStepIndex} / {replayState.totalSteps}</strong></span>
              <span>Pipeline: <strong className="text-emerald-400">ACTIVE</strong></span>
            </div>
          </div>

          {/* Live Transformation Scrubber */}
          <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono">
            {['Raw Observation', 'MySQL Record', 'Feature Engine', 'MapArc Derivation', 'Action Ticket'].map((stage, idx) => (
              <div
                key={stage}
                className={`p-2 rounded-xl border font-bold transition-all ${
                  idx < replayState.currentStepIndex
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="text-[9px] text-slate-500">STAGE {idx + 1}</div>
                <div>{stage}</div>
              </div>
            ))}
          </div>

          {/* Current Ingested Step Detail */}
          {currentStep && (
            <div className="p-4 bg-slate-950/90 rounded-xl border border-blue-500/40 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-blue-300 flex items-center gap-1.5">
                  <Zap className="size-4 text-blue-400" />
                  [{currentStep.stepId}] {currentStep.stepTitle}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800">
                  {currentStep.verificationStatus}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Locality: <strong className="text-white">{currentStep.locality} ({currentStep.districtName})</strong></div>
                <div>Source: <strong className="text-amber-400">{currentStep.sourceType} ({currentStep.sourceName})</strong></div>
                <div>Transport Mode: <strong className="text-cyan-400">{currentStep.transportMode}</strong></div>
                <div>Doc Reference: <strong className="text-emerald-400">{currentStep.documentRef}</strong></div>
              </div>
              <p className="p-2 bg-slate-900 rounded-lg text-slate-300 font-sans text-xs border border-slate-800">
                "{currentStep.description}"
              </p>
            </div>
          )}

          {/* Live Execution Logs */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px] max-h-40 overflow-y-auto">
            <div className="font-bold text-slate-400 flex items-center gap-1 text-[10px] uppercase">
              <Database className="size-3 text-cyan-400" /> Replay Execution Journal
            </div>
            {replayState.logs.map((log, i) => (
              <div key={i} className="text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
