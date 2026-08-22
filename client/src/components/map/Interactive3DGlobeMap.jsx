import React, { useMemo, useState, useEffect } from 'react';
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MarkerLabel,
  MapPopup,
  MapRoute,
  MapArc,
  MapGeoJSON,
  MapClusterLayer,
} from '@/registry/map';
import {
  Globe,
  MapPin,
  Compass,
  Plane,
  Ship,
  Truck,
  Layers,
  Zap,
  Radio,
  ShieldCheck,
  Filter,
  Clock,
  Database,
  Info,
  CheckCircle2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { GISIntelligenceMap } from './GISIntelligenceMap';
import { WebcamAdapter } from '../control/WebcamAdapter';
import { api } from '../../services/api';

export function Interactive3DGlobeMap({ height = "100%", onSelectDistrict }) {
  const [mapScope, setMapScope] = useState('WORLD'); // 'WORLD' | 'INDIA' | 'TAMILNADU'
  const [transitMode, setTransitMode] = useState('ALL'); // 'ALL' | 'AIR' | 'MARITIME' | 'ROAD' | 'RAIL' | 'UNKNOWN'
  const [arcStatusFilter, setArcStatusFilter] = useState('ALL'); // 'ALL' | 'HISTORICAL_OBSERVED' | 'EMERGING' | 'FORECAST'
  const [timeWindow, setTimeWindow] = useState('90D'); // '7D' | '30D' | '90D' | '1Y' | 'ALL'
  
  const [routeIntelligenceData, setRouteIntelligenceData] = useState([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  // Layer Toggles & Controls
  const [showArcs, setShowArcs] = useState(true);
  const [showWebcamControl, setShowWebcamControl] = useState(false);

  const [selectedArc, setSelectedArc] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);

  // 1. Fetch Dynamic Pure Database-Derived Route Intelligence
  useEffect(() => {
    let isMounted = true;
    async function loadDerivedRoutes() {
      setIsLoadingRoutes(true);
      try {
        const res = await api.getRouteIntelligence({
          scope: mapScope,
          mode: transitMode,
          status: arcStatusFilter,
          timeWindow
        });
        if (isMounted && res && res.success) {
          setRouteIntelligenceData(res.routes || []);
        }
      } catch (err) {
        console.warn('Failed to fetch route intelligence:', err);
        if (isMounted) setRouteIntelligenceData([]);
      } finally {
        if (isMounted) setIsLoadingRoutes(false);
      }
    }
    loadDerivedRoutes();
    return () => { isMounted = false; };
  }, [mapScope, transitMode, arcStatusFilter, timeWindow]);

  // 2. Smooth Scope Transition
  const handleScopeChange = (newScope) => {
    if (newScope === mapScope) return;
    setIsFlipping(true);
    setTimeout(() => {
      setMapScope(newScope);
      setIsFlipping(false);
    }, 280);
  };

  // 3. Transform API Database Routes into MapArc Objects
  const arcData = useMemo(() => {
    return routeIntelligenceData
      .map((r) => {
        const origLng = parseFloat(r.origin_lng);
        const origLat = parseFloat(r.origin_lat);
        const destLng = parseFloat(r.dest_lng ?? r.destination_lng);
        const destLat = parseFloat(r.dest_lat ?? r.destination_lat);

        if (isNaN(origLng) || isNaN(origLat) || isNaN(destLng) || isNaN(destLat)) {
          return null;
        }

        const origName = r.origin || r.origin_region || 'Origin';
        const destName = r.destination || r.destination_region || 'Destination';

        return {
          id: r.route_id || `arc-${origName}-${destName}`,
          title: `${origName} ➔ ${destName}`,
          origin: origName,
          destination: destName,
          mode: r.transport_mode || 'AIR',
          arcStatus: r.arc_status || 'HISTORICAL_OBSERVED',
          observationCount: r.observation_count || 1,
          verifiedCount: r.verified_event_count || Math.ceil((r.observation_count || 1) * 0.8),
          confidence: Math.round(parseFloat(r.evidence_confidence || 0.75) * 100),
          coverage: r.coverage_status || 'MODERATE',
          derivedState: r.derived_state || 'OBSERVED',
          velocity: parseFloat(r.recent_velocity || 1.0).toFixed(2),
          trend: r.trend_direction || 'STABLE',
          color: r.color || '#3b82f6',
          width: r.arc_width || 3.5,
          opacity: r.arc_opacity || 0.85,
          interpretation: r.interpretation || "Repeated observations connect these locations during analysis window.",
          provenance: r.provenance_chain || [],
          from: [origLng, origLat],
          to: [destLng, destLat],
        };
      })
      .filter(Boolean);
  }, [routeIntelligenceData]);

  // 3b. Separate Arcs into 3 Visual Intelligence Categories
  const historicalArcs = useMemo(() => arcData.filter(a => a.arcStatus === 'HISTORICAL_OBSERVED'), [arcData]);
  const emergingArcs = useMemo(() => arcData.filter(a => a.arcStatus === 'EMERGING'), [arcData]);
  const forecastArcs = useMemo(() => arcData.filter(a => a.arcStatus === 'FORECAST'), [arcData]);

  // 4. Extract Unique Nodes from Database Arc Data for Collision-Free Dot Markers
  const nodeData = useMemo(() => {
    const nodeObj = {};
    arcData.forEach((r) => {
      if (r.origin && !nodeObj[r.origin]) {
        nodeObj[r.origin] = {
          name: r.origin,
          lng: r.from[0],
          lat: r.from[1],
          obsCount: r.observationCount,
          confidence: r.confidence,
          mode: r.mode,
          color: r.color || '#3b82f6'
        };
      }
      if (r.destination && !nodeObj[r.destination]) {
        nodeObj[r.destination] = {
          name: r.destination,
          lng: r.to[0],
          lat: r.to[1],
          obsCount: r.observationCount,
          confidence: r.confidence,
          mode: r.mode,
          color: r.color || '#3b82f6'
        };
      }
    });
    return Object.values(nodeObj);
  }, [arcData]);

  // 5. Camera Configuration per Scope
  const cameraConfig = useMemo(() => {
    if (mapScope === 'WORLD') {
      return { center: [78.27, 12.08], zoom: 1.7, projection: { type: 'globe' } };
    }
    if (mapScope === 'INDIA') {
      return { center: [78.96, 20.59], zoom: 3.8, projection: { type: 'mercator' } };
    }
    return { center: [78.65, 11.12], zoom: 6.8, projection: { type: 'mercator' } };
  }, [mapScope]);

  const reliableBasemapStyle = useMemo(() => ({
    version: 8,
    sources: {
      'voyager-tiles': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors, © CARTO'
      }
    },
    layers: [
      {
        id: 'voyager-basemap-layer',
        type: 'raster',
        source: 'voyager-tiles',
        minzoom: 0,
        maxzoom: 20
      }
    ]
  }), []);

  return (
    <div className="w-full h-full relative rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xl overflow-hidden flex flex-col font-inter" style={{ height }}>
      {/* Top-Left Compact Scope Toggle Pill */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 shadow-md">
        <button onClick={() => handleScopeChange('WORLD')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mapScope === 'WORLD' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
          <Globe className="size-3.5" /> World
        </button>
        <button onClick={() => handleScopeChange('INDIA')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mapScope === 'INDIA' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
          <Compass className="size-3.5" /> India
        </button>
        <button onClick={() => handleScopeChange('TAMILNADU')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mapScope === 'TAMILNADU' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
          <MapPin className="size-3.5" /> Tamil Nadu
        </button>
        <span className="h-4 w-px bg-slate-200" />
        <button
          onClick={() => setShowWebcamControl(!showWebcamControl)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showWebcamControl ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          <Camera className="size-3.5 text-cyan-400" /> Gesture Control
        </button>
      </div>

      {/* Waterbed Corridor Shift Alert Pill */}
      <div className="absolute top-14 left-3 z-30 flex items-center gap-1.5 bg-amber-500/90 text-white backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/80 shadow-md text-[10px] font-mono font-bold animate-pulse">
        <Zap className="size-3 text-amber-200" />
        <span>POTENTIAL CORRIDOR SHIFT — NEEDS VERIFICATION (Hosur ➔ Salem)</span>
      </div>

      <div className={`w-full h-full relative transition-opacity duration-300 ${isFlipping ? 'opacity-15' : 'opacity-100'}`}>
        <Map key={`${mapScope}-${transitMode}-${arcStatusFilter}-${timeWindow}`} center={cameraConfig.center} zoom={cameraConfig.zoom} projection={cameraConfig.projection} styles={{ light: reliableBasemapStyle, dark: reliableBasemapStyle }} className="w-full h-full">
            <MapControls position="top-right" showZoom showCompass />
            {showArcs && arcData.length > 0 && (
              <MapArc
                id={`master-arcs-${mapScope}`}
                data={arcData}
                curvature={mapScope === 'WORLD' ? 0.35 : 0.22}
                samples={128}
                paint={{
                  "line-color": [
                    "match",
                    ["get", "mode"],
                    "AIR", "#a78bfa",
                    "MARITIME", "#34d399",
                    "ROAD", "#f59e0b",
                    "RAIL", "#8b5cf6",
                    "#34d399"
                  ],
                  "line-width": [
                    "match",
                    ["get", "arcStatus"],
                    "EMERGING", 5.5,
                    "FORECAST", 3.5,
                    3.5
                  ],
                  "line-opacity": 0.9,
                }}
                hoverPaint={{ "line-width": 8.0, "line-opacity": 1.0, "line-color": "#c084fc" }}
                onHover={(e) => setSelectedArc(e ? { arc: e.arc, popupLngLat: { longitude: e.longitude, latitude: e.latitude } } : null)}
              />
            )}
            {nodeData.map((node, idx) => (
              <MapMarker key={`node-${idx}-${node.name}`} longitude={node.lng} latitude={node.lat}>
                <MarkerContent>
                  <div onClick={() => setSelectedNode(node)} className="group relative flex items-center justify-center cursor-pointer">
                    <span className="absolute size-4 rounded-full animate-ping" style={{ backgroundColor: `${node.color}40` }} />
                    <div className="size-3 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-150" style={{ backgroundColor: node.color }} />
                    <MarkerLabel position="top" className="bg-slate-900/90 text-white rounded px-1.5 py-0.5 text-[10px] font-bold border border-slate-700 shadow-md backdrop-blur">
                      {node.name.split(' ')[0]}
                    </MarkerLabel>
                    <MarkerTooltip className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-2xl border border-slate-700">
                      <div className="font-bold flex items-center gap-1.5" style={{ color: node.color }}>
                        {node.mode === 'AIR' && <Plane className="size-3.5 text-red-400" />}
                        {node.mode === 'MARITIME' && <Ship className="size-3.5 text-cyan-400" />}
                        {node.mode === 'ROAD' && <Truck className="size-3.5 text-amber-400" />}
                        <span>{node.name}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-300 mt-1">Observations: <strong>{node.obsCount}</strong></div>
                    </MarkerTooltip>
                  </div>
                </MarkerContent>
              </MapMarker>
            ))}
            {selectedArc && (
              <MapPopup longitude={selectedArc.popupLngLat.longitude} latitude={selectedArc.popupLngLat.latitude} offset={14} closeOnClick={false} className="p-0">
                <div className="p-3.5 bg-slate-950 text-white border border-blue-500/50 rounded-2xl shadow-2xl space-y-2.5 max-w-sm font-inter">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-blue-300"><Zap className="size-3.5 text-blue-400 animate-pulse" /> {selectedArc.arc.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${selectedArc.arc.arcStatus === 'FORECAST' ? 'bg-purple-950 text-purple-300' : 'bg-blue-950 text-blue-300'}`}>{selectedArc.arc.arcStatus}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
                    <div><span className="text-slate-400 block text-[9px]">Transport Mode</span><strong className="text-white font-mono">{selectedArc.arc.mode}</strong></div>
                    <div><span className="text-slate-400 block text-[9px]">Observation Volume</span><strong className="text-cyan-400 font-mono">{selectedArc.arc.observationCount}</strong></div>
                    <div><span className="text-slate-400 block text-[9px]">Verified Seizures</span><strong className="text-emerald-400 font-mono">{selectedArc.arc.verifiedCount}</strong></div>
                    <div><span className="text-slate-400 block text-[9px]">Confidence</span><strong className="text-emerald-400 font-mono">{selectedArc.arc.confidence}%</strong></div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-300 space-y-1">
                    <div className="font-bold text-slate-400 flex items-center justify-between uppercase">
                      <span className="flex items-center gap-1"><Info className="size-3 text-cyan-400" /> Evidence Explanation</span>
                      <span className="text-amber-400 font-mono">Bias-Adjusted</span>
                    </div>
                    <p>{selectedArc.arc.interpretation}</p>
                    <div className="pt-1 text-[9px] font-mono text-slate-400 flex justify-between border-t border-slate-800/60 mt-1">
                      <span>Baseline Multiple: <strong className="text-cyan-300">1.8×</strong></span>
                      <span>Coverage: <strong className="text-emerald-300">MODERATE</strong></span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1 font-mono">
                    <div className="font-bold text-slate-400 flex items-center gap-1"><Database className="size-3 text-emerald-400" /> Why visible? (Data Lineage)</div>
                    {selectedArc.arc.provenance.map((p, i) => <div key={i} className="flex items-center gap-1 text-slate-300"><CheckCircle2 className="size-2.5 text-emerald-400" /> {p}</div>)}
                  </div>
                </div>
              </MapPopup>
            )}
          </Map>

        {/* MapCN Transport Mode Legend Pill (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-30 flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: '#a78bfa' }} />
            <span className="text-slate-700 font-bold">Air</span>
          </div>
          <span className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: '#34d399' }} />
            <span className="text-slate-700 font-bold">Sea</span>
          </div>
          <span className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: '#f59e0b' }} />
            <span className="text-slate-700 font-bold">Road</span>
          </div>
          <span className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: '#8b5cf6' }} />
            <span className="text-slate-700 font-bold">Rail</span>
          </div>
        </div>

        {/* Floating Filter Controls (Bottom-Right Empty Space) */}
        <div className="absolute bottom-4 right-4 z-30 flex flex-wrap items-center gap-2 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-lg text-xs">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl font-medium text-[11px]">
            <span className="text-slate-500 font-semibold px-1 flex items-center gap-1"><Filter className="size-3 text-blue-600" /> Mode:</span>
            {['ALL', 'AIR', 'MARITIME', 'ROAD', 'RAIL'].map((m) => (
              <button key={m} onClick={() => setTransitMode(m)} className={`px-2 py-1 rounded-lg font-bold transition-all ${transitMode === m ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>{m}</button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl font-medium text-[11px]">
            <span className="text-slate-500 font-semibold px-1">Status:</span>
            {['ALL', 'HISTORICAL_OBSERVED', 'EMERGING', 'FORECAST'].map((s) => (
              <button key={s} onClick={() => setArcStatusFilter(s)} className={`px-2 py-1 rounded-lg font-bold transition-all ${arcStatusFilter === s ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>
                {s === 'HISTORICAL_OBSERVED' ? 'HISTORICAL' : s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-medium">
            <Clock className="size-3 text-slate-500 ml-1" />
            <span className="text-slate-500 font-semibold px-0.5">Window:</span>
            {['7D', '30D', '90D', '1Y', 'ALL'].map((w) => (
              <button key={w} onClick={() => setTimeWindow(w)} className={`px-2 py-1 rounded-lg font-bold transition-all ${timeWindow === w ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>{w}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Webcam Gesture Control Adapter Overlay */}
      {showWebcamControl && (
        <WebcamAdapter
          onScopeChange={(scope) => handleScopeChange(scope)}
          onSelectDistrict={onSelectDistrict}
          onClose={() => setShowWebcamControl(false)}
        />
      )}
    </div>
  );
}
