import React, { useState, useEffect, useMemo } from 'react';
import {
  Network,
  Camera,
  TestTube2,
  QrCode,
  Droplets,
  Zap,
  CheckCircle2,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Search,
  Filter,
  User,
  Truck,
  Building2,
  FileText,
  Info,
  Shield,
  LayoutGrid,
  Radio,
  Share2,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { playClickSound, playHoverSound, playModalSound } from '../../utils/soundEffects';

/**
 * Advanced Intelligence Hub (NARVEX 2.0 Strategic Intelligence Modules 1 - 5)
 * Featuring Rich, Highly Readable Relational Knowledge Cards & Visual Topology
 */
export function AdvancedIntelligenceHub({ districtId }) {
  const [activeSubTab, setActiveSubTab] = useState('entity-graph'); // 'entity-graph' | 'anpr-stream' | 'precursor-diversion' | 'financial-signals' | 'wastewater'
  const [graphViewMode, setGraphViewMode] = useState('CARDS'); // 'CARDS' (default clear structured view) | 'MESH'
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [anprData, setAnprData] = useState([]);
  const [precursorData, setPrecursorData] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [wastewaterData, setWastewaterData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Graph state
  const [selectedNode, setSelectedNode] = useState(null);
  const [entityFilter, setEntityFilter] = useState('ALL'); // 'ALL' | 'CARTEL' | 'OFFENDER' | 'VEHICLE' | 'HUB' | 'CASE_FACT'
  const [searchTerm, setSearchTerm] = useState('');
  const [graphZoom, setGraphZoom] = useState(1);

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
        if (gRes.success) {
          const rawNodes = gRes.nodes || [];
          setGraphData({ nodes: rawNodes, links: gRes.links || [] });
          if (rawNodes.length > 0) {
            setSelectedNode(rawNodes[0]);
          }
        }
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

  // Filtered nodes with full context preservation
  const filteredNodes = useMemo(() => {
    if (!graphData.nodes || graphData.nodes.length === 0) return [];

    let activeNodes = graphData.nodes;

    if (entityFilter !== 'ALL') {
      const primaryNodes = graphData.nodes.filter((n) => n.type === entityFilter);
      const primaryIds = new Set(primaryNodes.map((n) => String(n.id)));
      const neighborIds = new Set();

      graphData.links.forEach((l) => {
        if (primaryIds.has(String(l.source))) neighborIds.add(String(l.target));
        if (primaryIds.has(String(l.target))) neighborIds.add(String(l.source));
      });

      activeNodes = graphData.nodes.filter((n) => primaryIds.has(String(n.id)) || neighborIds.has(String(n.id)));
    }

    if (searchTerm) {
      activeNodes = activeNodes.filter(
        (n) =>
          n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (n.type && n.type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return activeNodes;
  }, [graphData.nodes, graphData.links, entityFilter, searchTerm]);

  // Calculate clean, well-spaced coordinates for SVG Mesh Stage
  const displayedNodes = useMemo(() => {
    const count = filteredNodes.length;
    if (count === 0) return [];

    const width = 850;
    const height = 480;
    const cx = width / 2;
    const cy = height / 2;

    const cartelIndex = filteredNodes.findIndex((n) => n.type === 'CARTEL');

    return filteredNodes.map((node, idx) => {
      if (cartelIndex !== -1 && idx === cartelIndex) {
        return { ...node, x: cx, y: cy, isCenter: true };
      }

      const adjustedIdx = idx > cartelIndex && cartelIndex !== -1 ? idx - 1 : idx;
      const orbitCount = cartelIndex !== -1 ? count - 1 : count;
      const angle = (adjustedIdx / orbitCount) * Math.PI * 2 - Math.PI / 2;

      let radius = 185;
      if (node.type === 'OFFENDER') radius = 150;
      else if (node.type === 'VEHICLE') radius = 205;
      else if (node.type === 'HUB') radius = 225;

      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      return {
        ...node,
        x,
        y,
        isCenter: false
      };
    });
  }, [filteredNodes]);

  // Quick lookup map for node coordinates
  const nodeMap = useMemo(() => {
    const map = new Map();
    displayedNodes.forEach((n) => map.set(String(n.id), n));
    return map;
  }, [displayedNodes]);

  // Filter links so ONLY lines between VISIBLE nodes are drawn
  const displayedLinks = useMemo(() => {
    if (!graphData.links || displayedNodes.length === 0) return [];
    const visibleIds = new Set(displayedNodes.map((n) => String(n.id)));
    return graphData.links.filter((link) => visibleIds.has(String(link.source)) && visibleIds.has(String(link.target)));
  }, [graphData.links, displayedNodes]);

  // Auto select first node if selected node is no longer visible
  useEffect(() => {
    if (displayedNodes.length > 0 && (!selectedNode || !displayedNodes.find((n) => n.id === selectedNode.id))) {
      setSelectedNode(displayedNodes[0]);
    }
  }, [displayedNodes]);

  // Group nodes by Type for clean structured cards layout
  const groupedEntities = useMemo(() => {
    const groups = {
      CARTEL: [],
      OFFENDER: [],
      VEHICLE: [],
      HUB: [],
      CASE_FACT: []
    };

    filteredNodes.forEach((n) => {
      if (groups[n.type]) {
        groups[n.type].push(n);
      } else {
        groups.CASE_FACT.push(n);
      }
    });

    return groups;
  }, [filteredNodes]);

  const getRelationLabel = (relation) => {
    switch (relation) {
      case 'PRIMARY_EXHIBIT':
        return 'Evidence Exhibit';
      case 'OPERATIONAL_MEMBER':
        return 'Syndicate Member';
      case 'KNOWN_VEHICLE':
        return 'Transport Vehicle';
      case 'SEAPORT_HUB':
        return 'Transit Port';
      default:
        return relation || 'Linked Entity';
    }
  };

  const getEntityIcon = (type) => {
    switch (type) {
      case 'CARTEL':
        return Shield;
      case 'OFFENDER':
        return User;
      case 'VEHICLE':
        return Truck;
      case 'HUB':
        return Building2;
      default:
        return FileText;
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-[#080D1A]/95 backdrop-blur-2xl border border-cyan-500/30 text-white shadow-2xl font-inter space-y-4 select-none">
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-[#22D3EE] uppercase tracking-widest flex items-center gap-1.5">
              <span>NARVEX 2.0 ADVANCED STRATEGIC INTELLIGENCE</span>
            </div>
            <h3 className="text-base font-bold text-slate-100 font-space mt-0.5">
              Multi-Agency Integrated Tactical Operations Hub
            </h3>
          </div>
        </div>

        {/* Module Tab Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs overflow-x-auto custom-scrollbar">
          <button
            onClick={() => {
              playClickSound();
              setActiveSubTab('entity-graph');
            }}
            onMouseEnter={playHoverSound}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'entity-graph'
                ? 'bg-cyan-500/20 text-[#22D3EE] border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Network className="w-4 h-4" /> Cartel Link Graph
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveSubTab('anpr-stream');
            }}
            onMouseEnter={playHoverSound}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'anpr-stream'
                ? 'bg-cyan-500/20 text-[#22D3EE] border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" /> ANPR Telemetry
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveSubTab('precursor-diversion');
            }}
            onMouseEnter={playHoverSound}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'precursor-diversion'
                ? 'bg-cyan-500/20 text-[#22D3EE] border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <TestTube2 className="w-4 h-4" /> Pharmacy Precursors
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveSubTab('financial-signals');
            }}
            onMouseEnter={playHoverSound}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'financial-signals'
                ? 'bg-cyan-500/20 text-[#22D3EE] border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4" /> Darknet & UPI
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveSubTab('wastewater');
            }}
            onMouseEnter={playHoverSound}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'wastewater'
                ? 'bg-cyan-500/20 text-[#22D3EE] border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Droplets className="w-4 h-4" /> Sewage Epidemiology
          </button>
        </div>
      </div>

      {/* Tab Panel 1: Cartel Link Graph */}
      {activeSubTab === 'entity-graph' && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-bold">Relational Entity Topology</span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30 text-[10px] font-bold">
                {filteredNodes.length} Total Entities
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1">
                {[
                  { key: 'ALL', label: 'All Entities' },
                  { key: 'CARTEL', label: 'Cartels' },
                  { key: 'OFFENDER', label: 'Offenders' },
                  { key: 'VEHICLE', label: 'Vehicles' },
                  { key: 'HUB', label: 'Ports' },
                  { key: 'CASE_FACT', label: 'FIR Cases' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      playClickSound();
                      setEntityFilter(item.key);
                    }}
                    onMouseEnter={playHoverSound}
                    className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold transition-all cursor-pointer ${
                      entityFilter === item.key
                        ? 'bg-[#22D3EE] text-black font-extrabold shadow-glow-cyan'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <span className="h-4 w-px bg-slate-800" />

              {/* View Switcher: Structured Cards (Default) vs SVG Mesh */}
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    playClickSound();
                    setGraphViewMode('CARDS');
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    graphViewMode === 'CARDS' ? 'bg-cyan-500/20 text-[#22D3EE] font-bold shadow-glow-cyan' : 'text-slate-400'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Entity Cards</span>
                </button>

                <button
                  onClick={() => {
                    playClickSound();
                    setGraphViewMode('MESH');
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    graphViewMode === 'MESH' ? 'bg-cyan-500/20 text-[#22D3EE] font-bold shadow-glow-cyan' : 'text-slate-400'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Network Topology</span>
                </button>
              </div>
            </div>
          </div>

          {/* MAIN DISPLAY AREA: Structured Cards Grid (DEFAULT) vs Mesh Stage */}
          {graphViewMode === 'CARDS' ? (
            /* STRUCTURED ORGANIZATIONAL ENTITY CARDS VIEW (Instant Visualization & Readability) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Main Cards Grid Stage (8 Cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* 1. Cartel Syndicates Section */}
                {groupedEntities.CARTEL.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Cartel Syndicates ({groupedEntities.CARTEL.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {groupedEntities.CARTEL.map((node) => (
                        <div
                          key={node.id}
                          onClick={() => {
                            playModalSound();
                            setSelectedNode(node);
                          }}
                          onMouseEnter={playHoverSound}
                          className={`p-4 rounded-2xl bg-slate-950 border transition-all cursor-pointer space-y-2 text-xs ${
                            selectedNode?.id === node.id
                              ? 'border-red-500 bg-red-950/20 shadow-[0_0_25px_rgba(239,68,68,0.2)]'
                              : 'border-slate-800 hover:border-red-500/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                              CARTEL SYNDICATE
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">OPERATIONAL</span>
                          </div>
                          <h4 className="font-bold text-white text-sm font-space">{node.label}</h4>
                          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
                            <span>Relational Status: Active</span>
                            <span className="text-cyan-400 flex items-center gap-0.5">Inspect <ChevronRight className="w-3 h-3" /></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Offenders & Accused Section */}
                {groupedEntities.OFFENDER.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Key Offenders & Accused ({groupedEntities.OFFENDER.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {groupedEntities.OFFENDER.map((node) => (
                        <div
                          key={node.id}
                          onClick={() => {
                            playModalSound();
                            setSelectedNode(node);
                          }}
                          onMouseEnter={playHoverSound}
                          className={`p-4 rounded-2xl bg-slate-950 border transition-all cursor-pointer space-y-2 text-xs ${
                            selectedNode?.id === node.id
                              ? 'border-amber-500 bg-amber-950/20 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                              : 'border-slate-800 hover:border-amber-500/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              ACCUSED
                            </span>
                            <span className="text-[10px] font-mono text-amber-400 font-bold">IN_CUSTODY</span>
                          </div>
                          <h4 className="font-bold text-white text-xs font-space">{node.label}</h4>
                          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
                            <span>Linked to Syndicate</span>
                            <span className="text-cyan-400 flex items-center gap-0.5">Inspect <ChevronRight className="w-3 h-3" /></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Transport Vehicles & Ports Section */}
                {(groupedEntities.VEHICLE.length > 0 || groupedEntities.HUB.length > 0) && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" /> Flagged Vehicles & Seaport Hubs ({groupedEntities.VEHICLE.length + groupedEntities.HUB.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[...groupedEntities.VEHICLE, ...groupedEntities.HUB].map((node) => (
                        <div
                          key={node.id}
                          onClick={() => {
                            playModalSound();
                            setSelectedNode(node);
                          }}
                          onMouseEnter={playHoverSound}
                          className={`p-4 rounded-2xl bg-slate-950 border transition-all cursor-pointer space-y-2 text-xs ${
                            selectedNode?.id === node.id
                              ? 'border-purple-500 bg-purple-950/20 shadow-[0_0_25px_rgba(168,85,247,0.2)]'
                              : 'border-slate-800 hover:border-purple-500/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {node.type}
                            </span>
                            <span className="text-[10px] font-mono text-purple-400 font-bold">MATCHED</span>
                          </div>
                          <h4 className="font-bold text-white text-xs font-space">{node.label}</h4>
                          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
                            <span>Checkpost Telemetry</span>
                            <span className="text-cyan-400 flex items-center gap-0.5">Inspect <ChevronRight className="w-3 h-3" /></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Entity Dossier Inspector (4 Cols) */}
              <div className="lg:col-span-4 bg-slate-950/95 rounded-2xl border border-slate-800 p-4 space-y-4 flex flex-col justify-between shadow-2xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-cyan-400" />
                      Entity Dossier Inspector
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-[#22D3EE]">
                      VERIFIED FACT
                    </span>
                  </div>

                  {selectedNode ? (
                    <div className="space-y-3 animate-fade-in">
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-2 shadow-glow-cyan">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 uppercase">
                            {selectedNode.type} ENTITY
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            {selectedNode.status || selectedNode.risk || 'ACTIVE'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white font-space">{selectedNode.label}</h4>

                        {selectedNode.location && (
                          <p className="text-xs text-slate-300 font-mono">Location Node: {selectedNode.location}</p>
                        )}
                      </div>

                      {/* Plain-English Officer Explanation */}
                      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                        <span className="font-semibold text-cyan-400 uppercase tracking-wider block text-[10px] font-mono">
                          Relational Intelligence Summary
                        </span>
                        <p className="leading-relaxed text-[11.5px]">
                          This entity is linked into the statewide SHA-256 evidence chain. Connected across border ANPR checkposts, multi-agency FIR logs, and vehicle registration telemetry.
                        </p>
                      </div>

                      {/* Linked Entities Quick List */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                          Directly Linked Nodes:
                        </span>
                        <div className="space-y-1 max-h-44 overflow-y-auto custom-scrollbar">
                          {displayedLinks
                            .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                            .map((l, idx) => {
                              const otherId = l.source === selectedNode.id ? l.target : l.source;
                              const otherNode = nodeMap.get(String(otherId));
                              if (!otherNode) return null;

                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    playClickSound();
                                    setSelectedNode(otherNode);
                                  }}
                                  className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left flex items-center justify-between text-xs cursor-pointer transition-all"
                                >
                                  <span className="font-bold text-slate-200 truncate">{otherNode.label}</span>
                                  <span className="text-[9.5px] font-mono text-cyan-400 shrink-0 font-semibold">
                                    {getRelationLabel(l.relation)}
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-xs text-slate-500 font-mono space-y-2">
                      <Network className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                      <p>Select any entity node to inspect its complete intelligence dossier.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* SVG Topology Mesh Stage */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 bg-slate-950/90 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[460px] p-3 shadow-inner">
                {/* Zoom Controls */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  <button
                    onClick={() => setGraphZoom((z) => Math.min(1.5, z + 0.1))}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGraphZoom((z) => Math.max(0.6, z - 0.1))}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGraphZoom(1)}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                    title="Reset Zoom"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-full flex-1 flex items-center justify-center overflow-hidden relative">
                  <svg
                    className="w-full h-[430px] transition-transform duration-300"
                    style={{ transform: `scale(${graphZoom})` }}
                    viewBox="0 0 850 480"
                  >
                    <defs>
                      <pattern id="mesh-grid-v3" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(34, 211, 238, 0.04)" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#mesh-grid-v3)" />

                    {displayedLinks.map((link, idx) => {
                      const sourceNode = nodeMap.get(String(link.source));
                      const targetNode = nodeMap.get(String(link.target));
                      if (!sourceNode || !targetNode) return null;

                      const isHighlighted =
                        selectedNode && (selectedNode.id === sourceNode.id || selectedNode.id === targetNode.id);

                      return (
                        <g key={`link-${idx}`}>
                          <line
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke={isHighlighted ? '#22D3EE' : 'rgba(99, 102, 241, 0.45)'}
                            strokeWidth={isHighlighted ? 2.5 : 1.5}
                            strokeDasharray={link.relation === 'PRIMARY_EXHIBIT' ? '4 3' : 'none'}
                          />
                          <g transform={`translate(${(sourceNode.x + targetNode.x) / 2}, ${(sourceNode.y + targetNode.y) / 2})`}>
                            <rect
                              x="-45"
                              y="-9"
                              width="90"
                              height="16"
                              rx="4"
                              fill="#090E1A"
                              stroke={isHighlighted ? '#22D3EE' : '#334155'}
                              strokeWidth="1"
                            />
                            <text
                              x="0"
                              y="3"
                              textAnchor="middle"
                              fill={isHighlighted ? '#22D3EE' : '#94A3B8'}
                              fontSize="8.5"
                              fontWeight="700"
                              fontFamily="monospace"
                              className="pointer-events-none select-none"
                            >
                              {getRelationLabel(link.relation)}
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {displayedNodes.map((node) => {
                      const isSelected = selectedNode?.id === node.id;

                      let nodeColor = '#818CF8';
                      if (node.type === 'CARTEL') nodeColor = '#EF4444';
                      else if (node.type === 'OFFENDER') nodeColor = '#F59E0B';
                      else if (node.type === 'HUB') nodeColor = '#22D3EE';
                      else if (node.type === 'VEHICLE') nodeColor = '#A855F7';
                      else if (node.type === 'CASE_FACT') nodeColor = '#3B82F6';

                      return (
                        <g
                          key={`node-${node.id}`}
                          onClick={() => {
                            playModalSound();
                            setSelectedNode(node);
                          }}
                          onMouseEnter={playHoverSound}
                          className="cursor-pointer group"
                        >
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={isSelected ? 26 : node.isCenter ? 22 : 16}
                            fill={`${nodeColor}30`}
                            className="animate-ping"
                            style={{ animationDuration: '3s' }}
                          />

                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={isSelected ? 16 : node.isCenter ? 14 : 11}
                            fill={nodeColor}
                            stroke={isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)'}
                            strokeWidth={isSelected ? 3.5 : 1.8}
                            className="transition-transform group-hover:scale-125"
                          />

                          <g transform={`translate(${node.x}, ${node.y + 24})`}>
                            <rect
                              x="-55"
                              y="-10"
                              width="110"
                              height="18"
                              rx="5"
                              fill="#0F172A"
                              stroke={isSelected ? '#22D3EE' : '#1E293B'}
                              strokeWidth="1"
                            />
                            <text
                              x="0"
                              y="3"
                              textAnchor="middle"
                              fill={isSelected ? '#FFFFFF' : '#CBD5E1'}
                              fontSize="9"
                              fontWeight={isSelected ? 'bold' : '600'}
                              fontFamily="monospace"
                              className="pointer-events-none select-none"
                            >
                              {node.label.length > 15 ? `${node.label.substring(0, 14)}…` : node.label}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Inspector Panel */}
              <div className="lg:col-span-4 bg-slate-950/90 rounded-2xl border border-slate-800 p-4 space-y-4 flex flex-col justify-between shadow-2xl">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Entity Dossier Inspector
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-[#22D3EE]">
                      VERIFIED FACT
                    </span>
                  </div>

                  {selectedNode && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-2 shadow-glow-cyan">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 uppercase">
                            {selectedNode.type} ENTITY
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            {selectedNode.status || selectedNode.risk || 'ACTIVE'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white font-space">{selectedNode.label}</h4>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Panel 2: ANPR Checkpost Telemetry Stream */}
      {activeSubTab === 'anpr-stream' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-mono bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400">State Border ANPR Telemetry & FASTag Weight Sensors</span>
            <span className="text-emerald-400 font-bold">14 Border Checkposts Online</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {anprData.map((item) => (
              <div
                key={item.id}
                onMouseEnter={playHoverSound}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-3 text-xs shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-300 font-bold text-sm bg-slate-900 px-2.5 py-1 rounded-xl border border-cyan-500/30">
                      {item.plate}
                    </span>
                    <span className="font-semibold text-white">{item.checkpost}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{item.vehicleType} • {item.alert}</p>
                </div>

                <div className="text-right space-y-1">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold ${
                      item.status === 'WATCHLIST_MATCH'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                  <div className="text-[10px] font-mono text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Panel 3: Pharmacy Precursors Diversion */}
      {activeSubTab === 'precursor-diversion' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-mono bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400">Pharmaceutical Opioid Schedule H1 Batch Leak Tracking</span>
            <span className="text-amber-400 font-bold">Wholesale Batch Anomaly Alert</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {precursorData.map((p, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-space text-sm">{p.substance || p.chemical_name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                    {p.alert_level || 'HIGH ANOMALY'}
                  </span>
                </div>
                <div className="text-slate-400 font-mono text-[11px] flex justify-between">
                  <span>Batch: {p.batch_number || `BATCH-#${9480 + idx}`}</span>
                  <span>Distributor: {p.wholesaler || 'Regional Pharma HQ'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Panel 4: Darknet & UPI Micro-Financial Signals */}
      {activeSubTab === 'financial-signals' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-mono bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400">Telegram Bot Dropshipping & Rapid UPI Payment Spikes</span>
            <span className="text-purple-400 font-bold">Signal Velocity Monitoring</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {financialData.map((f, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-mono text-xs">{f.channel || f.upi_handle || `UPI-HANDLE-#${idx + 101}`}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300">
                    {f.signal_type || 'RAPID_UPI_SPIKE'}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">{f.details || 'Spike in micro-transactions across telegram dropship channel.'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Panel 5: Sewage Wastewater Epidemiology */}
      {activeSubTab === 'wastewater' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-mono bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <span className="text-slate-400">Municipal Wastewater Sewage Chemical Metabolite Sampling</span>
            <span className="text-cyan-400 font-bold">EMCDDA Standard Concentration Model</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {wastewaterData.map((w, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-space text-xs">{w.taluk_name || w.location}</span>
                  <span className="font-mono text-[#22D3EE] font-bold">{w.metabolite_concentration || '420 mg / 1000 people'}</span>
                </div>
                <p className="text-slate-400 text-[11px]">Sampling Facility: {w.facility_name || 'Central Sewage Treatment Node'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
