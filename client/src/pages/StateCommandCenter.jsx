import React, { useState } from 'react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { Interactive3DGlobeMap } from '../components/map/Interactive3DGlobeMap';
import { NarvexAvatarCore } from '../components/assistant/NarvexAvatarCore';
import { AdvancedIntelligenceHub } from '../components/analytics/AdvancedIntelligenceHub';
import { RealtimeNotificationTicker } from '../components/common/RealtimeNotificationTicker';
import { Maximize2, Minimize2, Columns, Bot, Map as MapIcon, Sparkles, Shield, Eye, Layers } from 'lucide-react';
import { playClickSound, playHoverSound } from '../utils/soundEffects';

export function StateCommandCenter({ onSelectDistrict, onNavigateTab, onOpenFeed }) {
  // View Modes: 'SPLIT' (7:5 grid), 'FULL_MAP' (12-col map), 'FULL_COPILOT' (12-col assistant)
  const [viewMode, setViewMode] = useState('SPLIT');

  const toggleViewMode = (mode) => {
    playClickSound();
    setViewMode(mode);
  };

  return (
    <div className="w-full space-y-4 font-inter pb-8 select-none">
      {/* Real-Time Telemetry Live Notification Ticker */}
      <RealtimeNotificationTicker />

      {/* 0. CORE MISSION & VISION FLOW BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950 via-slate-900 to-purple-950 text-white shadow-lg border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <div>
            <div className="text-[10px] font-mono font-bold text-[#22D3EE] uppercase tracking-widest flex items-center gap-1.5">
              <span>🛡️</span> NARVEX CORE MISSION STATEMENT & PREVENTIVE FLOW
            </div>
            <h2 className="text-[16px] font-semibold text-slate-100 font-space mt-0.5">
              “Don’t wait for the pattern to become a crisis.”
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-cyan-500/10 text-[#22D3EE] border border-cyan-500/30 text-[11px] font-mono font-bold">
              Statewide Command Vision v2.0
            </span>
          </div>
        </div>

        {/* 4-Step Operational Flow Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] font-mono font-bold text-[#22D3EE] uppercase block">Step 1</span>
            <strong className="text-slate-100 text-xs block">📡 Detect Signal</strong>
            <p className="text-[11px] text-slate-400 leading-tight">Multi-agency ingestion (FIRs, ANPR, UPI QR, Wastewater).</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase block">Step 2</span>
            <strong className="text-slate-100 text-xs block">🧩 Understand Pattern</strong>
            <p className="text-[11px] text-slate-400 leading-tight">Observational bias correction & MapCN transit corridors.</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">Step 3</span>
            <strong className="text-slate-100 text-xs block">🛡️ Verify Risk</strong>
            <p className="text-[11px] text-slate-400 leading-tight">Tripartite scoring & SHA-256 cryptographic hash audit chain.</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">Step 4</span>
            <strong className="text-slate-100 text-xs block">⚡ Act Earlier</strong>
            <p className="text-[11px] text-slate-400 leading-tight">Automated preventive patrol action ticket dispatching.</p>
          </div>
        </div>
      </div>

      {/* VIEWPORT LAYOUT CONTROLLER TOOLBAR */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 shadow-md text-xs font-mono">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            Command Viewport Mode:
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => toggleViewMode('SPLIT')}
            onMouseEnter={playHoverSound}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'SPLIT'
                ? 'bg-cyan-500/20 text-[#22D3EE] border-cyan-500/40 font-bold shadow-glow-cyan'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Standard Split View</span>
          </button>

          <button
            onClick={() => toggleViewMode('FULL_MAP')}
            onMouseEnter={playHoverSound}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'FULL_MAP'
                ? 'bg-cyan-500/20 text-[#22D3EE] border-cyan-500/40 font-bold shadow-glow-cyan'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Expanded Tactical Map</span>
          </button>

          <button
            onClick={() => toggleViewMode('FULL_COPILOT')}
            onMouseEnter={playHoverSound}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'FULL_COPILOT'
                ? 'bg-cyan-500/20 text-[#22D3EE] border-cyan-500/40 font-bold shadow-glow-cyan'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Copilot Focus</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC ANIMATED VIEWPORT GRID CONTAINER */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 transition-all duration-500 ease-in-out">
        {/* Left Side: Interactive 3D Globe Map Container */}
        {viewMode !== 'FULL_COPILOT' && (
          <div
            onDoubleClick={() => toggleViewMode(viewMode === 'FULL_MAP' ? 'SPLIT' : 'FULL_MAP')}
            className={`relative rounded-3xl overflow-hidden transition-all duration-500 ease-in-out group ${
              viewMode === 'FULL_MAP'
                ? 'lg:col-span-12 h-[680px] border-2 border-cyan-500/60 shadow-[0_0_60px_rgba(34,211,238,0.3)]'
                : 'lg:col-span-7 h-[560px] border border-cyan-500/30 hover:border-cyan-500/60 shadow-glow-cyan hover:shadow-[0_0_40px_rgba(34,211,238,0.2)]'
            }`}
          >
            {/* Animated Laser Corner Brackets on Hover */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 opacity-40 group-hover:opacity-100 transition-opacity z-20 pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 opacity-40 group-hover:opacity-100 transition-opacity z-20 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 opacity-40 group-hover:opacity-100 transition-opacity z-20 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 opacity-40 group-hover:opacity-100 transition-opacity z-20 pointer-events-none" />

            {/* Interactive Animated Hover Popup Badge */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 pointer-events-auto">
              <button
                onClick={() => toggleViewMode(viewMode === 'FULL_MAP' ? 'SPLIT' : 'FULL_MAP')}
                onMouseEnter={playHoverSound}
                className="px-4 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-xl border border-cyan-500/50 text-[#22D3EE] text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_25px_rgba(34,211,238,0.3)] animate-pulse hover:scale-105 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{viewMode === 'FULL_MAP' ? 'Click to Restore Split View' : '✨ Touch / Click to Expand Full Map (100%) ⛶'}</span>
              </button>
            </div>

            {/* Quick Floating Expand / Restore Button Overlay (Top Right) */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
              <button
                onClick={() => toggleViewMode(viewMode === 'FULL_MAP' ? 'SPLIT' : 'FULL_MAP')}
                onMouseEnter={playHoverSound}
                className="px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md border border-cyan-500/40 text-[#22D3EE] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg hover:scale-105"
                title={viewMode === 'FULL_MAP' ? 'Restore Split View' : 'Expand to Full Map View'}
              >
                {viewMode === 'FULL_MAP' ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Restore Split</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand Map</span>
                  </>
                )}
              </button>
            </div>

            <ErrorBoundary>
              <Interactive3DGlobeMap
                height="100%"
                onSelectDistrict={onSelectDistrict}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* Right Side: Centralized NARVEX AI Assistant Container */}
        {viewMode !== 'FULL_MAP' && (
          <div
            className={`transition-all duration-500 ease-in-out ${
              viewMode === 'FULL_COPILOT'
                ? 'lg:col-span-12 h-[640px]'
                : 'lg:col-span-5 h-[560px]'
            }`}
          >
            <ErrorBoundary>
              <NarvexAvatarCore
                activeDistrictId={2}
                onNavigateTab={onNavigateTab}
                onSelectDistrict={onSelectDistrict}
              />
            </ErrorBoundary>
          </div>
        )}

        {/* Floating Mini Copilot Chip when Map is in Full Mode */}
        {viewMode === 'FULL_MAP' && (
          <div className="absolute bottom-6 right-6 z-40 animate-bounce-subtle">
            <button
              onClick={() => toggleViewMode('SPLIT')}
              onMouseEnter={playHoverSound}
              className="p-3 rounded-2xl bg-[#080D1A]/95 backdrop-blur-xl border border-cyan-500/50 text-[#22D3EE] shadow-[0_0_30px_rgba(34,211,238,0.3)] flex items-center gap-2 cursor-pointer hover:scale-105 transition-all"
            >
              <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-white uppercase">AI Copilot Active</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-300">
                MIC ON
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Advanced Strategic Intelligence Hub (Modules 1-5) */}
      <ErrorBoundary>
        <AdvancedIntelligenceHub districtId="ALL" />
      </ErrorBoundary>
    </div>
  );
}
