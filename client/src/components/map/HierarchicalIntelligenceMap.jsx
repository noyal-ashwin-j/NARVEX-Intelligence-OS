import React, { useMemo, useState, useEffect } from 'react';
import {
  Map,
  MapArc,
  MapMarker,
  MapPopup,
  MarkerContent,
  MarkerLabel,
  MapControls,
} from '@/registry/map';
import {
  Globe,
  Compass,
  MapPin,
  Filter,
  Plane,
  Ship,
  Truck,
  Train,
  Zap,
} from 'lucide-react';
import { GISIntelligenceMap } from './GISIntelligenceMap';
import { RouteIntelligenceModal } from './RouteIntelligenceModal';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

// High-Contrast Clear Basemap Raster Tile Style (Carto Positron / Voyager)
const clearBasemapStyle = {
  version: 8,
  sources: {
    'carto-clear': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors, © CARTO'
    }
  },
  layers: [
    {
      id: 'carto-clear-layer',
      type: 'raster',
      source: 'carto-clear',
      minzoom: 0,
      maxzoom: 20
    }
  ]
};

export function HierarchicalIntelligenceMap({
  height = '100%',
  onSelectDistrict,
  externalScope,
  externalMode
}) {
  const { isDark } = useTheme();

  // Scope View: 'GLOBAL' | 'INDIA' | 'TAMILNADU'
  const [scope, setScope] = useState(externalScope || 'GLOBAL');
  // Transport Mode Filter: 'ALL' | 'AIR' | 'ROAD' | 'RAIL' | 'SEA'
  const [transportMode, setTransportMode] = useState(externalMode || 'ALL');

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredArc, setHoveredArc] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sync external voice commands
  useEffect(() => {
    if (externalScope) setScope(externalScope);
  }, [externalScope]);

  useEffect(() => {
    if (externalMode) setTransportMode(externalMode);
  }, [externalMode]);

  // Fetch Database-backed Route Intelligence
  useEffect(() => {
    let isMounted = true;
    async function fetchRoutes() {
      try {
        setLoading(true);
        const res = await api.get(`/spatial/routes?scope=${scope}&mode=${transportMode}`);
        if (isMounted && res.data && res.data.routes) {
          setRoutes(res.data.routes);
        }
      } catch (err) {
        console.error('Failed to fetch route intelligence:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchRoutes();
    return () => { isMounted = false; };
  }, [scope, transportMode]);

  // Scope Switcher Handler with smooth transition
  const handleScopeSwitch = (newScope) => {
    if (newScope === scope) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setScope(newScope);
      setIsTransitioning(false);
    }, 300);
  };

  // Camera Settings based on Scope
  const cameraProps = useMemo(() => {
    if (scope === 'GLOBAL') {
      return { center: [80.2707, 13.0827], zoom: 1.6, projection: { type: 'globe' } };
    }
    if (scope === 'INDIA') {
      return { center: [78.9629, 20.5937], zoom: 3.8, projection: { type: 'mercator' } };
    }
    return { center: [78.6569, 11.1271], zoom: 6.8, projection: { type: 'mercator' } };
  }, [scope]);

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

  // Dynamic Geodesic Arcs Construction
  const arcData = useMemo(() => {
    return routes
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
          name: `${origName} ➔ ${destName}`,
          from: [origLng, origLat],
          to: [destLng, destLat],
          mode: r.transport_mode,
          arcStatus: r.arc_status || (r.route_status === 'OBSERVED' ? 'HISTORICAL_OBSERVED' : r.route_status === 'PREDICTED' ? 'EMERGING' : 'FORECAST'),
          confidence: r.evidence_confidence,
          routeRecord: r,
          color: r.color || (r.transport_mode === 'AIR' ? '#ef4444' : r.transport_mode === 'MARITIME' ? '#06b6d4' : '#f59e0b')
        };
      })
      .filter(Boolean);
  }, [routes]);

  const historicalArcs = useMemo(() => arcData.filter(a => a.arcStatus === 'HISTORICAL_OBSERVED'), [arcData]);
  const emergingArcs = useMemo(() => arcData.filter(a => a.arcStatus === 'EMERGING'), [arcData]);
  const forecastArcs = useMemo(() => arcData.filter(a => a.arcStatus === 'FORECAST'), [arcData]);

  // Uncluttered Node Markers
  const nodeMarkers = useMemo(() => {
    const nodeObj = {};
    routes.forEach((r) => {
      if (!nodeObj[r.origin]) {
        nodeObj[r.origin] = {
          name: r.origin,
          lng: r.origin_lng,
          lat: r.origin_lat,
          mode: r.transport_mode,
          status: r.route_status,
          country: r.origin_country || r.origin_state || 'Origin Node'
        };
      }
    });
    return Object.values(nodeObj);
  }, [routes]);

  return (
    <div
      className="w-full h-full relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col font-inter"
      style={{ minHeight: height }}
    >
      {/* ========================================================================= */}
      {/* TOP HEADER CONTROLS BAR: 3-TIER SCOPE SWITCHER & MODE FILTERS              */}
      {/* ========================================================================= */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md text-xs">
        
        {/* Scope Switcher Pill Bar */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => handleScopeSwitch('GLOBAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              scope === 'GLOBAL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Globe className="size-3.5" />
            <span>GLOBAL</span>
          </button>

          <button
            onClick={() => handleScopeSwitch('INDIA')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              scope === 'INDIA'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="size-3.5" />
            <span>INDIA</span>
          </button>

          <button
            onClick={() => handleScopeSwitch('TAMILNADU')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
              scope === 'TAMILNADU'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin className="size-3.5 text-emerald-300" />
            <span>TAMIL NADU</span>
          </button>
        </div>

        {/* Transport Mode Filters */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 px-1 flex items-center gap-1">
            <Filter className="size-3 text-blue-500" /> Mode:
          </span>

          <button
            onClick={() => setTransportMode('ALL')}
            className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-colors ${
              transportMode === 'ALL'
                ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ALL
          </button>

          <button
            onClick={() => setTransportMode('AIR')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-medium transition-colors ${
              transportMode === 'AIR'
                ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plane className="size-2.5 text-red-500" /> AIR
          </button>

          <button
            onClick={() => setTransportMode('ROAD')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-medium transition-colors ${
              transportMode === 'ROAD'
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Truck className="size-2.5 text-amber-500" /> ROAD
          </button>

          <button
            onClick={() => setTransportMode('RAIL')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-medium transition-colors ${
              transportMode === 'RAIL'
                ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Train className="size-2.5 text-purple-500" /> RAIL
          </button>

          <button
            onClick={() => setTransportMode('SEA')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-medium transition-colors ${
              transportMode === 'SEA'
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Ship className="size-2.5 text-cyan-500" /> SEA
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAP VIEWPORT: CLEAR, HIGH-CONTRAST MAP RENDERER                           */}
      {/* ========================================================================= */}
      <div
        className={`w-full h-full flex-1 transition-all duration-300 transform ${
          isTransitioning ? 'scale-95 opacity-20 blur-sm' : 'scale-100 opacity-100 blur-none'
        }`}
      >
        <Map
          key={`${scope}-${transportMode}`}
            center={cameraProps.center}
            zoom={cameraProps.zoom}
            projection={cameraProps.projection}
            styles={{ light: reliableBasemapStyle, dark: reliableBasemapStyle }}
            className="w-full h-full"
          >
            <MapControls position="top-right" showZoom showCompass showFullscreen />

            {/* 1. Historical Baseline Arcs (Solid Mode-Colored Lines) */}
            {historicalArcs.length > 0 && (
              <MapArc
                id="h-arcs-historical"
                data={historicalArcs}
                curvature={scope === 'GLOBAL' ? 0.25 : 0.15}
                samples={128}
                paint={{
                  "line-color": ["match", ["get", "mode"], "AIR", "#ef4444", "MARITIME", "#06b6d4", "ROAD", "#f59e0b", "RAIL", "#8b5cf6", "#3b82f6"],
                  "line-width": 3.5,
                  "line-opacity": 0.8,
                }}
                hoverPaint={{ "line-width": 7.5, "line-opacity": 1.0, "line-color": "#38bdf8" }}
                onClick={(e) => { if (e && e.arc && e.arc.routeRecord) setSelectedRoute(e.arc.routeRecord); }}
                onHover={(e) => setHoveredArc(e ? { arc: e.arc, popupLngLat: { longitude: e.longitude, latitude: e.latitude } } : null)}
              />
            )}

            {/* 2. Emerging Accelerating Arcs (Thick Crimson Glowing Lines) */}
            {emergingArcs.length > 0 && (
              <MapArc
                id="h-arcs-emerging"
                data={emergingArcs}
                curvature={scope === 'GLOBAL' ? 0.35 : 0.25}
                samples={128}
                paint={{
                  "line-color": "#f43f5e",
                  "line-width": 6.5,
                  "line-opacity": 0.95,
                }}
                hoverPaint={{ "line-width": 9.0, "line-opacity": 1.0, "line-color": "#fb7185" }}
                onClick={(e) => { if (e && e.arc && e.arc.routeRecord) setSelectedRoute(e.arc.routeRecord); }}
                onHover={(e) => setHoveredArc(e ? { arc: e.arc, popupLngLat: { longitude: e.longitude, latitude: e.latitude } } : null)}
              />
            )}

            {/* 3. Forecast Projections (Dashed Violet Model-Derived Lines) */}
            {forecastArcs.length > 0 && (
              <MapArc
                id="h-arcs-forecast"
                data={forecastArcs}
                curvature={scope === 'GLOBAL' ? 0.45 : 0.35}
                samples={128}
                paint={{
                  "line-color": "#a855f7",
                  "line-width": 4.5,
                  "line-dasharray": [3, 3],
                  "line-opacity": 0.85,
                }}
                hoverPaint={{ "line-width": 8.0, "line-opacity": 1.0, "line-color": "#c084fc" }}
                onClick={(e) => { if (e && e.arc && e.arc.routeRecord) setSelectedRoute(e.arc.routeRecord); }}
                onHover={(e) => setHoveredArc(e ? { arc: e.arc, popupLngLat: { longitude: e.longitude, latitude: e.latitude } } : null)}
              />
            )}

            {/* Uncluttered Node Markers */}
            {nodeMarkers.map((node) => (
              <MapMarker key={node.name} longitude={node.lng} latitude={node.lat}>
                <MarkerContent>
                  <div
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="group relative flex items-center justify-center cursor-pointer p-1"
                  >
                    <span className="absolute size-3.5 rounded-full bg-blue-500/40 animate-ping" />
                    <div className="size-2.5 rounded-full border-2 border-white bg-blue-600 shadow-md group-hover:scale-150 transition-transform" />
                    
                    {/* Hover Popup Label (Prevents Congestion) */}
                    {hoveredNode?.name === node.name && (
                      <MarkerLabel
                        position="top"
                        className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md px-2 py-1 text-[10px] font-bold shadow-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-1 font-mono">
                          <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span>{node.name}</span>
                        </div>
                      </MarkerLabel>
                    )}
                  </div>
                </MarkerContent>
              </MapMarker>
            ))}

            {/* Hover Arc Info Popup */}
            {hoveredArc && (
              <MapPopup
                longitude={hoveredArc.popupLngLat.longitude}
                latitude={hoveredArc.popupLngLat.latitude}
                offset={14}
                closeOnClick={false}
                className="p-0"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-blue-500/40 rounded-xl shadow-xl font-mono text-[11px]">
                  <Zap className="size-3 text-blue-500 animate-pulse" />
                  <span className="font-bold text-blue-600 dark:text-blue-400">{hoveredArc.arc.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-2 text-[10px]">
                    Click to inspect intelligence
                  </span>
                </div>
              </MapPopup>
            )}
          </Map>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM LEGEND STRIP                                                       */}
      {/* ========================================================================= */}
      <div className="absolute bottom-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300 shadow-md font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-blue-600 rounded-full" />
            <span className="font-semibold text-blue-600 dark:text-blue-400 text-[10px]">──────── OBSERVED</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-amber-500 rounded-full border-b border-dashed border-amber-400" />
            <span className="font-semibold text-amber-600 dark:text-amber-400 text-[10px]">- - - - PREDICTED</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-purple-600 rounded-full animate-pulse" />
            <span className="font-semibold text-purple-600 dark:text-purple-400 text-[10px]">· · · · EMERGING</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
          <span>Routes: <strong className="text-blue-600 dark:text-blue-400">{routes.length}</strong></span>
          <span>Scope: <strong className="text-indigo-600 dark:text-indigo-400">{scope}</strong></span>
          <span>Mode: <strong className="text-emerald-600 dark:text-emerald-400">{transportMode}</strong></span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROUTE INTELLIGENCE DETAIL MODAL                                           */}
      {/* ========================================================================= */}
      {selectedRoute && (
        <RouteIntelligenceModal
          route={selectedRoute}
          onClose={() => setSelectedRoute(null)}
          onInspectProvenance={(r) => {
            alert(`Opening Cryptographic Provenance Audit Ledger for Route: ${r.route_id}`);
          }}
        />
      )}
    </div>
  );
}
