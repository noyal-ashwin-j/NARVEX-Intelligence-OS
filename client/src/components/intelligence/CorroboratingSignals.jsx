import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, AlertCircle, FileText, CheckCircle2, RefreshCw, X, Radio } from 'lucide-react';

export default function CorroboratingSignals({ districtId = 2, districtName = 'Coimbatore', onClose }) {
  const [loading, setLoading] = useState(true);
  const [fusionData, setFusionData] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);

  const fetchFusion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fusion/district/${districtId}?windowDays=30`);
      const data = await res.json();
      setFusionData(data);
      if (data.fusedSignals?.length > 0) {
        setSelectedCluster(data.fusedSignals[0]);
      }
    } catch (err) {
      console.error('Failed to fetch signal fusion:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFusion();
  }, [districtId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Cross-Source Signal Fusion Engine</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 rounded-full">
                  {districtName}
                </span>
              </div>
              <p className="text-xs text-slate-400">Multi-agency spatial-temporal correlation without double-counting</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchFusion}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Refresh Fusion"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left: Clusters List */}
          <div className="p-4 overflow-y-auto space-y-3 bg-slate-950/30">
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2 flex items-center justify-between">
              <span>Fused Signal Clusters</span>
              <span className="text-indigo-400">{fusionData?.fusedClustersCount || 0} Clusters</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-sm">Corroborating multi-agency telemetry...</div>
            ) : fusionData?.fusedSignals?.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">No multi-signal clusters detected in 30-day window.</div>
            ) : (
              fusionData?.fusedSignals?.map((cluster) => (
                <div
                  key={cluster.fusedClusterId}
                  onClick={() => setSelectedCluster(cluster)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedCluster?.fusedClusterId === cluster.fusedClusterId
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-slate-200">{cluster.primaryLocality}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      cluster.riskIndicator === 'HIGH PREVENTIVE ATTENTION'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                    }`}>
                      {cluster.riskIndicator}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Radio className="w-3 h-3 text-indigo-400" />
                      <span>{cluster.distinctSourcesCount} Sources</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{cluster.evidenceConfidence}% Conf</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: Cluster Details & Contributing Sources */}
          <div className="md:col-span-2 p-6 overflow-y-auto bg-slate-900/50 space-y-6">
            {selectedCluster ? (
              <>
                {/* Cluster Metric Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Corroboration Tier</span>
                    <div className="text-sm font-bold text-indigo-300 mt-1">{selectedCluster.corroborationTier.replace(/_/g, ' ')}</div>
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Evidence Confidence</span>
                    <div className="text-sm font-bold text-emerald-400 mt-1">{selectedCluster.evidenceConfidence}% (Multi-Source)</div>
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Data Coverage</span>
                    <div className="text-sm font-bold text-blue-400 mt-1">{selectedCluster.dataCoverage}</div>
                  </div>
                </div>

                {/* Source Breakdown */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                    Contributing Multi-Source Evidence ({selectedCluster.contributingEvents.length} Observations)
                  </h3>
                  <div className="space-y-2">
                    {selectedCluster.contributingEvents.map((evt, i) => (
                      <div key={i} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded">
                              {evt.eventCode}
                            </span>
                            <span className="text-xs font-semibold text-slate-200">{evt.sourceName}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(evt.eventDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">{evt.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                          <span className="text-indigo-400 font-medium">Class: {evt.categoryName}</span>
                          <span>•</span>
                          <span className="text-emerald-400">Status: {evt.verificationStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legal Disclaimer */}
                <div className="p-3 bg-indigo-950/20 border border-indigo-800/30 rounded-xl text-xs text-indigo-300/80 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                  <span>{selectedCluster.disclaimer}</span>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-500">Select a cluster on the left to inspect multi-source corroboration.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
