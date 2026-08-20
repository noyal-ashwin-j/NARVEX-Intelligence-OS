import React, { useState } from 'react';
import { Sliders, Shield, AlertTriangle, ArrowRight, RefreshCw, X, Info } from 'lucide-react';

export default function ScenarioSimulator({ districtId = 2, districtName = 'Coimbatore', onClose }) {
  const [checkpostIntensity, setCheckpostIntensity] = useState(50);
  const [communityOutreach, setCommunityOutreach] = useState(30);
  const [patrolUnits, setPatrolUnits] = useState(4);
  const [horizonDays, setHorizonDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulation/preventive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDistrictId: districtId,
          checkpostInterventionIntensity: checkpostIntensity,
          communityOutreachIntensity: communityOutreach,
          mobilePatrolUnits: patrolUnits,
          timeHorizonDays: horizonDays
        })
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      console.error('Simulation execution failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">What-If Preventive Scenario Simulator</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-900/60 text-amber-300 border border-amber-700/50 rounded-full">
                  Target: {districtName}
                </span>
              </div>
              <p className="text-xs text-slate-400">Hypothetical Countermeasure & Spatial Displacement Modeling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulator Controls & Output */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-slate-950/60 border border-slate-800 rounded-xl">
            {/* Control 1 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Gateway Checkpost Intensity</span>
                <span className="text-amber-400 font-mono">+{checkpostIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={checkpostIntensity}
                onChange={(e) => setCheckpostIntensity(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Intensify ANPR scanner throughput at border entryways.</p>
            </div>

            {/* Control 2 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Community Resilience Outreach</span>
                <span className="text-emerald-400 font-mono">+{communityOutreach}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={communityOutreach}
                onChange={(e) => setCommunityOutreach(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Youth de-addiction & campus awareness intervention.</p>
            </div>

            {/* Control 3 */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Mobile Tactical Patrol Units</span>
                <span className="text-blue-400 font-mono">{patrolUnits} Units</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={patrolUnits}
                onChange={(e) => setPatrolUnits(parseInt(e.target.value, 10))}
                className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Inter-district highway roving patrol sectors.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={runPreventiveSimulation}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-950/50 flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Run Simulation Model
            </button>
          </div>

          {/* Results Comparison */}
          {simResult && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{simResult.disclaimer}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {simResult.results.filter((r) => r.districtId === districtId || r.simulated.displacementImpact !== 'NONE').map((item) => (
                  <div key={item.districtId} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{item.districtName}</span>
                      {item.simulated.displacementImpact !== 'NONE' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/50 rounded">
                          Spillover Displacement
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-900 border border-slate-800/80 rounded-lg">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Current State</span>
                        <div className="text-sm font-bold text-slate-200 mt-0.5">{item.current.riskLevel}</div>
                        <div className="text-xs text-slate-400">{item.current.velocity30d}x Velocity</div>
                      </div>

                      <div className="p-2.5 bg-indigo-950/40 border border-indigo-800/40 rounded-lg">
                        <span className="text-[10px] text-indigo-400 uppercase font-semibold">Simulated State</span>
                        <div className="text-sm font-bold text-emerald-400 mt-0.5">{item.simulated.riskLevel}</div>
                        <div className="text-xs text-indigo-300">{item.simulated.velocity30d}x Projected</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 italic bg-slate-900/40 p-2 rounded border border-slate-800/40">
                      {item.simulated.simulationNotes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
