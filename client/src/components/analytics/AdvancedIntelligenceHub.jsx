import React, { useState, useEffect } from 'react';
import { Network, Camera, TestTube2, QrCode, Droplets, ShieldAlert, Zap, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

/**
 * Advanced Intelligence Hub (NARVEX 2.0 Strategic Modules)
 * 1. Offender & Cartel Entity Network Graph
 * 2. ANPR & FASTag Border Telemetry Stream
 * 3. Pharmaceutical Precursor Diversion Tracking
 * 4. Darknet, Telegram & Micro-Financial UPI Signals
 * 5. Wastewater Sewage Epidemiology Metrics (EMCDDA Model)
 */
export function AdvancedIntelligenceHub({ districtId }) {
  const [activeSubTab, setActiveSubTab] = useState('entity-graph');
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [anprData, setAnprData] = useState([]);
  const [precursorData, setPrecursorData] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [wastewaterData, setWastewaterData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHubData() {
      setLoading(true);
      try {
        const [gRes, aRes, pRes, fRes, wRes] = await Promise.all([
          api.getEntityGraph({ districtId }),
          api.getANPRStream(),
          api.getPrecursorDiversion(),
          api.getFinancialSignals(),
          api.getWastewaterMetrics()
        ]);
        if (gRes.success) setGraphData({ nodes: gRes.nodes || [], links: gRes.links || [] });
        if (aRes.success) setAnprData(aRes.telemetry || []);
        if (pRes.success) setPrecursorData(pRes.precursors || []);
        if (fRes.success) setFinancialData(fRes.financialSignals || []);
        if (wRes.success) setWastewaterData(wRes.metrics || []);
      } catch (err) {
        console.error('Error loading Advanced Intelligence Hub data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHubData();
  }, [districtId]);

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl font-inter space-y-4">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="size-3 text-cyan-400" /> NARVEX 2.0 Advanced Strategic Intelligence
          </div>
          <h3 className="text-base font-bold text-slate-100 font-space mt-0.5">
            Multi-Agency Integrated Tactical Operations Hub
          </h3>
        </div>

        {/* Tab Selector Pill */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('entity-graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeSubTab === 'entity-graph' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Network className="size-3.5" /> Cartel Link Graph
          </button>
          <button
            onClick={() => setActiveSubTab('anpr-stream')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeSubTab === 'anpr-stream' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Camera className="size-3.5" /> ANPR Telemetry
          </button>
          <button
            onClick={() => setActiveSubTab('precursor-diversion')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeSubTab === 'precursor-diversion' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <TestTube2 className="size-3.5" /> Pharmacy Precursors
          </button>
          <button
            onClick={() => setActiveSubTab('financial-signals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeSubTab === 'financial-signals' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <QrCode className="size-3.5" /> Darknet & UPI
          </button>
          <button
            onClick={() => setActiveSubTab('wastewater')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeSubTab === 'wastewater' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Droplets className="size-3.5" /> Sewage Epidemiology
          </button>
        </div>
      </div>

      {/* Tab Panel 1: Entity Link Graph */}
      {activeSubTab === 'entity-graph' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">NIDAAN & Palantir-Style Linkage Analysis (Cartels ➔ Accused ➔ Vehicles ➔ Prison Logs)</span>
            <span className="font-mono text-cyan-400">{graphData.nodes.length} Nodes • {graphData.links.length} Connected Edges</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {graphData.nodes.map((node) => (
              <div key={node.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all space-y-1 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${node.type === 'CARTEL' ? 'bg-red-950 text-red-300 border border-red-800' : (node.type === 'OFFENDER' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-300')}`}>
                    {node.type}
                  </span>
                  <span className="text-slate-500 text-[10px]">{node.status || node.mode || 'LINKED'}</span>
                </div>
                <h4 className="font-bold text-slate-100">{node.label}</h4>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ChevronRight className="size-3 text-cyan-400" /> Linked to active intelligence ledger
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Panel 2: ANPR Checkpost Telemetry */}
      {activeSubTab === 'anpr-stream' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">State Border Automatic Number Plate Recognition (ANPR) & FASTag Weight Telemetry</span>
            <span className="font-mono text-cyan-400">14 State Border Checkposts Active</span>
          </div>

          <div className="space-y-2">
            {anprData.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="font-mono text-cyan-300 text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{item.plate}</span>
                    <span>{item.checkpost}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{item.vehicleType} • {item.alert}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${item.status === 'WATCHLIST_MATCH' ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse' : 'bg-emerald-950 text-emerald-300'}`}>
                    {item.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Panel 3: Pharmacy Precursors */}
      {activeSubTab === 'precursor-diversion' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Drug Control Administration (DCA) Wholesale Pharmacy Batch Leak Monitoring</span>
            <span className="font-mono text-amber-400">3 Schedule H1 Precursor Leak Alerts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {precursorData.map((p, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">{p.category}</span>
                  <span className="text-red-400 font-mono font-bold text-[10px]">{p.status}</span>
                </div>
                <h4 className="font-bold text-slate-100 text-sm">{p.chemical}</h4>
                <div className="text-[11px] text-slate-300 space-y-1 font-mono">
                  <div>Normal Batch: <strong className="text-slate-200">{p.monthlyNormalBatch}</strong></div>
                  <div>Diverted Estimate: <strong className="text-red-400">{p.divertedBatchEstimate}</strong></div>
                  <div className="text-[10px] text-slate-400 font-sans mt-1">Distributor: {p.primaryDistributor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Panel 4: Darknet & UPI Financial Signals */}
      {activeSubTab === 'financial-signals' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Micro-Transaction QR Code Spikes, Telegram Drop Bots & Crypto Wallet Tracing</span>
            <span className="font-mono text-purple-400">Live Financial Telemetry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {financialData.map((f) => (
              <div key={f.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-cyan-400 font-bold">{f.channel}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-red-950 text-red-300 border border-red-800">{f.risk} RISK</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">{f.pattern}</p>
                <div className="pt-2 border-t border-slate-900 flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Location: <strong className="text-slate-200">{f.location}</strong></span>
                  <span>Confidence: <strong className="text-emerald-400">{f.confidence}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Panel 5: Wastewater Sewage Epidemiology */}
      {activeSubTab === 'wastewater' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">EMCDDA Model Sewage Wastewater Chemical Metabolite Sampling (True Consumption Metric)</span>
            <span className="font-mono text-emerald-400">Independent Chemical Calibration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {wastewaterData.map((w, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-sm font-space">{w.taluk}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-800">{w.surgePct}</span>
                </div>
                <div className="text-[11px] text-cyan-300 font-mono">{w.metabolite}</div>
                <div className="text-[11px] text-slate-300 space-y-1 font-mono pt-1">
                  <div>Concentration: <strong className="text-amber-400">{w.concentrationMgPer1000} mg/1k people/day</strong></div>
                  <div>Baseline: <strong className="text-slate-400">{w.baselineMgPer1000} mg/1k people/day</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
