import React, { useState } from 'react';
import { Network, Zap, Shield, MapPin, Radio, Activity } from 'lucide-react';

export function SpatialNetworkGraph({ onSelectDistrict }) {
  const [activeNode, setActiveNode] = useState(null);

  // Strategic nodes with coordinate layout inside 540x280 SVG canvas
  const nodes = [
    // Interstate hubs
    { id: 'KL-PAL', label: 'Kerala (Walayar)', x: 70, y: 130, type: 'INTERSTATE', conf: '92%', count: 23, districtId: 2 },
    { id: 'KA-BLR', label: 'Karnataka (Attibele)', x: 130, y: 50, type: 'INTERSTATE', conf: '95%', count: 31, districtId: 10 },
    { id: 'AP-TPR', label: 'Andhra (Chittoor)', x: 340, y: 45, type: 'INTERSTATE', conf: '88%', count: 16, districtId: 5 },
    { id: 'MH-MUM', label: 'Maharashtra Axis', x: 50, y: 40, type: 'NATIONAL', conf: '84%', count: 12, districtId: 10 },
    { id: 'OD-BBI', label: 'Odisha Freight', x: 470, y: 50, type: 'NATIONAL', conf: '90%', count: 18, districtId: 1 },

    // Core Tamil Nadu nodes
    { id: 'CBE', label: 'Coimbatore Node', x: 160, y: 150, type: 'CORE_HUB', conf: '88%', count: 42, districtId: 2, isHigh: true },
    { id: 'KRI', label: 'Krishnagiri Gateway', x: 230, y: 80, type: 'CORE_HUB', conf: '84%', count: 36, districtId: 10, isHigh: true },
    { id: 'CHN', label: 'Chennai Central Port', x: 430, y: 100, type: 'CORE_HUB', conf: '82%', count: 38, districtId: 1, isHigh: true },
    { id: 'SLM', label: 'Salem Axis Junction', x: 270, y: 140, type: 'TRANSIT', conf: '76%', count: 20, districtId: 4 },
    { id: 'MDU', label: 'Madurai Logistics Hub', x: 260, y: 220, type: 'TRANSIT', conf: '74%', count: 24, districtId: 3 },
    { id: 'TSI', label: 'Tenkasi Border Pass', x: 150, y: 240, type: 'BORDER', conf: '68%', count: 15, districtId: 14 },
    { id: 'TUT', label: 'Thoothukudi Maritime', x: 360, y: 240, type: 'MARITIME', conf: '86%', count: 28, districtId: 12 }
  ];

  // Interconnected corridor edges
  const edges = [
    { from: 'KL-PAL', to: 'CBE', observations: 23, color: '#22D3EE' },
    { from: 'KA-BLR', to: 'KRI', observations: 31, color: '#EF4444' },
    { from: 'MH-MUM', to: 'KRI', observations: 12, color: '#A855F7' },
    { from: 'AP-TPR', to: 'CHN', observations: 16, color: '#F59E0B' },
    { from: 'OD-BBI', to: 'CHN', observations: 18, color: '#10B981' },
    { from: 'CBE', to: 'SLM', observations: 14, color: '#22D3EE' },
    { from: 'KRI', to: 'SLM', observations: 19, color: '#EF4444' },
    { from: 'SLM', to: 'MDU', observations: 11, color: '#22D3EE' },
    { from: 'KRI', to: 'CHN', observations: 25, color: '#EF4444' },
    { from: 'MDU', to: 'TUT', observations: 11, color: '#10B981' },
    { from: 'TSI', to: 'MDU', observations: 8, color: '#A855F7' }
  ];

  return (
    <div className="p-4 rounded-3xl bg-[#090E1A] border border-cyan-500/30 shadow-lg space-y-3 font-inter">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h4 className="font-semibold text-xs text-white uppercase tracking-wider font-space">
            Interstate & State Spatial Topology Graph
          </h4>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
          12 Nodes • 11 Corridors Active
        </span>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative w-full h-[260px] bg-[#050811] rounded-2xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 540 280" className="w-full h-full">
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.5" opacity="0.3" />
            </pattern>
            {/* Glowing filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="540" height="280" fill="url(#grid-pattern)" />

          {/* Render Edges (Glowing Vectors) */}
          {edges.map((e, idx) => {
            const src = nodes.find((n) => n.id === e.from);
            const dst = nodes.find((n) => n.id === e.to);
            if (!src || !dst) return null;

            return (
              <g key={idx}>
                {/* Outer Glow line */}
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke={e.color}
                  strokeWidth="2.5"
                  opacity="0.3"
                  filter="url(#glow)"
                />
                {/* Core Vector line */}
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke={e.color}
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  opacity="0.8"
                />
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const isSelected = activeNode?.id === node.id;

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => {
                  setActiveNode(node);
                  if (onSelectDistrict && node.districtId) onSelectDistrict(node.districtId);
                }}
              >
                {/* Outer Pulse ring for high-priority hubs */}
                {node.isHigh && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="15"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="1"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}

                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.isHigh ? 9 : 7}
                  fill={node.isHigh ? '#EF4444' : node.type.includes('INTER') ? '#A855F7' : '#22D3EE'}
                  stroke="#050811"
                  strokeWidth="2"
                  filter="url(#glow)"
                />

                {/* Node Label */}
                <text
                  x={node.x}
                  y={node.y + 16}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily='"JetBrains Mono", monospace'
                  fontWeight="500"
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Floating HUD card */}
        {activeNode && (
          <div className="absolute bottom-2 right-2 p-2.5 rounded-xl bg-[#090E1A]/95 border border-cyan-500/50 backdrop-blur-md text-[10px] space-y-1 shadow-glow-cyan animate-in fade-in">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-white font-space">{activeNode.label}</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono">
                {activeNode.conf} Conf
              </span>
            </div>
            <div className="text-slate-400 font-mono">
              Telemetry Volume: <strong className="text-white">{activeNode.count} Signals</strong>
            </div>
          </div>
        )}
      </div>

      {/* Graph Legend */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> High Attention</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Interstate Gateway</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Regional Axis</span>
        </div>
        <span className="text-slate-500">Bézier Spatial Telemetry</span>
      </div>
    </div>
  );
}
