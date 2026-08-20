import React, { useState, useEffect } from 'react';
import { Share2, ZoomIn, ZoomOut, RefreshCw, X, Radio, ArrowRight, Shield } from 'lucide-react';

export default function IntelligenceNetworkGraph({ districtId = null, onSelectDistrict, onClose }) {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/graph/intelligence${districtId ? `?districtId=${districtId}` : ''}`);
      const data = await res.json();
      setGraphData(data);
    } catch (err) {
      console.error('Failed to load network graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [districtId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Aggregated Intelligence Knowledge Graph</h2>
              <p className="text-xs text-slate-400">Inter-District Corridors, Gateway Checkposts & Contraband Linkage Mesh</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Main Visual Graph Stage */}
          <div className="md:col-span-3 bg-slate-950/90 relative overflow-hidden flex items-center justify-center p-4">
            {loading ? (
              <div className="text-slate-500 text-sm">Synthesizing relational knowledge graph...</div>
            ) : graphData ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                {/* SVG Visual Mesh */}
                <svg
                  className="w-full h-[520px] transition-transform duration-300"
                  style={{ transform: `scale(${zoomLevel})` }}
                  viewBox="0 0 800 500"
                >
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#graph-grid)" />

                  {/* Edges */}
                  {graphData.graph.edges.map((edge, idx) => {
                    const sourceIdx = graphData.graph.nodes.findIndex((n) => n.id === edge.source);
                    const targetIdx = graphData.graph.nodes.findIndex((n) => n.id === edge.target);
                    if (sourceIdx === -1 || targetIdx === -1) return null;

                    const total = graphData.graph.nodes.length;
                    const x1 = 400 + 260 * Math.cos((sourceIdx * 2 * Math.PI) / total);
                    const y1 = 250 + 190 * Math.sin((sourceIdx * 2 * Math.PI) / total);
                    const x2 = 400 + 260 * Math.cos((targetIdx * 2 * Math.PI) / total);
                    const y2 = 250 + 190 * Math.sin((targetIdx * 2 * Math.PI) / total);

                    return (
                      <g key={edge.id || idx}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={edge.type === 'SHARED_CORRIDOR' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(236, 72, 153, 0.3)'}
                          strokeWidth={edge.type === 'SHARED_CORRIDOR' ? 2 : 1.5}
                          strokeDasharray={edge.type === 'PRIMARY_CONTRABAND_SIGNAL' ? '4 3' : 'none'}
                        />
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {graphData.graph.nodes.map((node, idx) => {
                    const total = graphData.graph.nodes.length;
                    const cx = 400 + 260 * Math.cos((idx * 2 * Math.PI) / total);
                    const cy = 250 + 190 * Math.sin((idx * 2 * Math.PI) / total);
                    const isSelected = selectedNode?.id === node.id;

                    const fillColor =
                      node.type === 'DISTRICT'
                        ? node.riskLevel === 'HIGH PREVENTIVE ATTENTION'
                          ? '#f43f5e'
                          : '#6366f1'
                        : node.type === 'CHECKPOST'
                        ? '#f59e0b'
                        : '#a855f7';

                    return (
                      <g
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className="cursor-pointer transition-transform hover:scale-125"
                      >
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 16 : node.size / 2}
                          fill={fillColor}
                          stroke={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.2)'}
                          strokeWidth={isSelected ? 3 : 1.5}
                        />
                        <text
                          x={cx}
                          y={cy + 22}
                          textAnchor="middle"
                          fill="#cbd5e1"
                          fontSize="10"
                          fontWeight="600"
                          className="select-none pointer-events-none"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Graph Legend */}
                <div className="absolute bottom-3 left-4 flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> High Risk District</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Baseline District</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Checkpost Gateway</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Contraband Class</div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Right Inspector Panel */}
          <div className="p-5 bg-slate-900/60 overflow-y-auto space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Node & Edge Inspector</h3>

            {selectedNode ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-purple-400">{selectedNode.type} Entity</span>
                  <h4 className="text-sm font-bold text-white">{selectedNode.label}</h4>
                  {selectedNode.riskLevel && (
                    <div className="text-xs text-rose-400 font-semibold">{selectedNode.riskLevel}</div>
                  )}
                </div>

                {selectedNode.type === 'DISTRICT' && onSelectDistrict && (
                  <button
                    onClick={() => {
                      onSelectDistrict(selectedNode.entityId);
                      if (onClose) onClose();
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Fly Map to {selectedNode.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl text-xs text-slate-400 space-y-2">
                  <div className="font-semibold text-slate-300">Relational Topology:</div>
                  <p>Connected via multi-district transport corridors and border checkposts.</p>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-xs text-slate-500">
                Click any node in the knowledge mesh to inspect relational associations and trigger map fly-to.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
