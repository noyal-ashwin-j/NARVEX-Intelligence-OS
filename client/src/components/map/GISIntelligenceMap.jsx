import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../../context/ThemeContext';
import { useFilters } from '../../context/FilterContext';
import { api } from '../../services/api';
import { Layers, ShieldAlert, Navigation, Eye, EyeOff, Info, Truck, Train, Ship, Plane, Bus } from 'lucide-react';
import { RiskBadge, StatusBadge, CoverageBadge } from '../common/Badge';

export function GISIntelligenceMap({
  height = '600px',
  onSelectEvent,
  onSelectZone,
  onSelectCorridor,
  selectedDistrictId
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef({});

  const { isDark } = useTheme();
  const { filters } = useFilters();

  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState(null);
  const [activeLayers, setActiveLayers] = useState({
    riskZones: true,
    emergingZones: true,
    associations: true,
    enforcementPoints: true,
    riskSignalPoints: true,
    checkposts: true,
    citizenReports: true
  });
  const [selectedTransportMode, setSelectedTransportMode] = useState('ALL');

  // Initialize Leaflet Map Instance once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of Tamil Nadu (approx ~ 11.1271° N, 78.6569° E)
      const map = L.map(mapContainerRef.current, {
        center: [11.0, 78.5],
        zoom: 7,
        minZoom: 6,
        maxZoom: 16,
        zoomControl: true,
        attributionControl: false
      });

      // Layer groups for toggling
      layersGroupRef.current = {
        riskZones: L.layerGroup().addTo(map),
        emergingZones: L.layerGroup().addTo(map),
        associations: L.layerGroup().addTo(map),
        enforcementPoints: L.layerGroup().addTo(map),
        riskSignalPoints: L.layerGroup().addTo(map),
        checkposts: L.layerGroup().addTo(map),
        citizenReports: L.layerGroup().addTo(map)
      };

      mapInstanceRef.current = map;
    }
  }, []);

  // Update Tile Layer based on Dark / Light theme
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (map._tileLayer) {
      map.removeLayer(map._tileLayer);
    }

    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    map._tileLayer = tileLayer;
  }, [isDark]);

  // Fetch Map Data whenever filters change
  useEffect(() => {
    async function loadMapData() {
      setLoading(true);
      try {
        const queryParams = {
          districtId: selectedDistrictId || filters.districtId,
          talukId: filters.talukId,
          categoryId: filters.categoryId,
          sourceId: filters.sourceId,
          verificationStatus: filters.verificationStatus,
          riskLevel: filters.riskLevel,
          startDate: filters.startDate,
          endDate: filters.endDate
        };

        const res = await api.getMapData(queryParams);
        if (res.success) {
          setMapData(res.data);
        }
      } catch (err) {
        console.error('Failed to load GIS map layers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, [filters, selectedDistrictId]);

  // Render Vector Layers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapData) return;

    const groups = layersGroupRef.current;

    // Clear all layer groups
    Object.values(groups).forEach((group) => group.clearLayers());

    // 1. RISK ZONES
    if (activeLayers.riskZones && mapData.riskZones) {
      mapData.riskZones.forEach((zone) => {
        const isEmerging = zone.historical_trend === 'NEW_EMERGING';
        let color = '#EAB308'; // Watch Yellow
        let fillColor = '#EAB308';

        if (zone.risk_level === 'HIGH PREVENTIVE ATTENTION') {
          color = '#EF4444'; // Signal Red
          fillColor = '#EF4444';
        } else if (zone.risk_level === 'INCREASING') {
          color = '#F97316'; // Alert Orange
          fillColor = '#F97316';
        } else if (zone.data_coverage === 'LIMITED') {
          color = '#64748B'; // Insufficient data gray
          fillColor = '#64748B';
        }

        const circle = L.circle([parseFloat(zone.center_lat), parseFloat(zone.center_lng)], {
          radius: zone.radius_meters || 4000,
          color: color,
          weight: 2,
          opacity: 0.85,
          fillColor: fillColor,
          fillOpacity: isEmerging ? 0.35 : 0.2,
          dashArray: isEmerging ? '6, 6' : undefined
        });

        circle.bindPopup(`
          <div style="font-family: Inter, sans-serif; font-size: 13px; min-width: 220px; line-height: 1.4; color: #f8fafc;">
            <div style="font-family: 'Space Grotesk', sans-serif; font-weight: 600; color: ${color}; font-size: 15px; margin-bottom: 4px;">
              ${zone.name}
            </div>
            <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Risk Level:</strong> ${zone.risk_level}</div>
            <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Evidence Quality:</strong> <span style="font-family: 'JetBrains Mono', monospace;">${zone.confidence_level}</span></div>
            <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Coverage:</strong> ${zone.data_coverage === 'LIMITED' ? 'INSUFFICIENT DATA' : zone.data_coverage}</div>
            <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Signals Count:</strong> <span style="font-family: 'JetBrains Mono', monospace;">${zone.signal_count} (${zone.verified_count} verified)</span></div>
            <div style="margin-top: 6px; font-size: 12px; color: #94a3b8;">${zone.primary_factors}</div>
          </div>
        `);

        circle.on('click', () => {
          if (onSelectZone) onSelectZone(zone);
        });

        if (isEmerging && groups.emergingZones && activeLayers.emergingZones) {
          circle.addTo(groups.emergingZones);
        } else {
          circle.addTo(groups.riskZones);
        }
      });
    }

    // 2. DETAILED TRANSIT CORRIDORS (Mode of Transport: Road / Rail / Coastal / Air / Bus)
    if (activeLayers.associations && mapData.associations) {
      mapData.associations.forEach((assoc) => {
        // Filter by transport mode if selected
        if (selectedTransportMode !== 'ALL' && assoc.transport_mode !== selectedTransportMode) {
          return;
        }

        let waypoints = [];
        try {
          if (assoc.waypoints_json) waypoints = JSON.parse(assoc.waypoints_json);
        } catch {
          waypoints = [];
        }

        if (waypoints.length >= 2) {
          // Color code by Mode of Transport
          let routeColor = '#3B82F6'; // Default Info Blue
          let modeLabel = 'ROAD FREIGHT';
          let dashPattern = '8, 8';

          if (assoc.transport_mode === 'ROAD_HIGHWAY') {
            routeColor = assoc.risk_intensity === 'CRITICAL' ? '#EF4444' : '#F97316';
            modeLabel = '🚚 ROAD / HIGHWAY TRUCK';
            dashPattern = '6, 6';
          } else if (assoc.transport_mode === 'RAILWAY') {
            routeColor = '#3B82F6'; // Info Blue
            modeLabel = '🚆 RAILWAY EXPRESS TRANSIT';
            dashPattern = '12, 6';
          } else if (assoc.transport_mode === 'COASTAL_MARITIME') {
            routeColor = '#22D3EE'; // Neon Cyan Sea
            modeLabel = '🚢 COASTAL / MARITIME ROUTE';
            dashPattern = '10, 8';
          } else if (assoc.transport_mode === 'AIR_CARGO') {
            routeColor = '#A855F7'; // AI Purple
            modeLabel = '✈️ EXPRESS COURIER / AIR';
            dashPattern = '4, 4';
          } else if (assoc.transport_mode === 'BUS_TRANSIT') {
            routeColor = '#EAB308'; // Watch Yellow
            modeLabel = '🚌 INTER-TALUK BUS LINE';
            dashPattern = '8, 4';
          }

          const polyline = L.polyline(waypoints, {
            color: routeColor,
            weight: Math.min(Math.max(assoc.observation_count / 8, 3), 7),
            opacity: 0.85,
            dashArray: dashPattern
          });

          polyline.bindPopup(`
            <div style="font-family: Inter, sans-serif; font-size: 13px; min-width: 250px; line-height: 1.4; color: #f8fafc;">
              <div style="font-family: 'Space Grotesk', sans-serif; font-weight: 600; color: ${routeColor}; font-size: 15px; margin-bottom: 3px;">
                ${assoc.corridor_name}
              </div>
              <div style="font-weight: 600; color: #22D3EE; margin-bottom: 6px; font-size: 11px; text-transform: uppercase;">
                ${modeLabel} (${assoc.route_type === 'INTRA_DISTRICT' ? 'Intra-District Flow' : 'Inter-District Trunk'})
              </div>
              <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Primary Contraband:</strong> ${assoc.primary_contraband || assoc.primary_categories}</div>
              <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Checkposts / Tolls:</strong> ${assoc.checkposts_on_route || 'Multiple Highway Checkpoints'}</div>
              <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Transit Frequency:</strong> <span style="font-family: 'JetBrains Mono', monospace;">${assoc.observation_count} historical intercepts</span></div>
              <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Est. Transit Time:</strong> <span style="font-family: 'JetBrains Mono', monospace;">${assoc.average_transit_time_hrs || 2.0} hrs</span></div>
              <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Evidence Quality:</strong> <span style="font-family: 'JetBrains Mono', monospace;">${assoc.confidence_level}</span></div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; border-top: 1px solid #1e293b; padding-top: 4px;">
                ${assoc.disclaimer}
              </div>
            </div>
          `);

          polyline.on('click', () => {
            if (onSelectCorridor) onSelectCorridor(assoc);
          });

          polyline.addTo(groups.associations);
        }
      });
    }

    // 3. ENFORCEMENT POINTS
    if (activeLayers.enforcementPoints && mapData.enforcementPoints) {
      mapData.enforcementPoints.forEach((evt) => {
        const marker = L.circleMarker([parseFloat(evt.lat), parseFloat(evt.lng)], {
          radius: 6,
          color: '#EF4444',
          fillColor: '#EF4444',
          fillOpacity: 0.9,
          weight: 2
        });

        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; font-size: 13px; min-width: 220px; color: #f8fafc;">
            <div style="color: #EF4444; font-weight: 600; font-family: 'JetBrains Mono', monospace;">[SEIZURE INTERCEPT] ${evt.event_code}</div>
            <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Location:</strong> ${evt.location_name}</div>
            <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Source:</strong> ${evt.source_name}</div>
            <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Status:</strong> ${evt.verification_status}</div>
            <button id="btn-prov-${evt.id}" style="margin-top: 8px; width: 100%; padding: 6px 10px; background: #22D3EE; color: #000; border: 0; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              Inspect Provenance
            </button>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-prov-${evt.id}`);
          if (btn) btn.onclick = () => onSelectEvent && onSelectEvent(evt.id);
        });

        marker.addTo(groups.enforcementPoints);
      });
    }

    // 4. CHECKPOSTS
    if (activeLayers.checkposts && mapData.checkposts) {
      mapData.checkposts.forEach((cp) => {
        const icon = L.divIcon({
          html: `<div style="background:#10B981;color:#fff;font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;border:1px solid #10B981;font-family:'JetBrains Mono',monospace;">CP</div>`,
          className: 'custom-checkpost-icon',
          iconSize: [26, 20]
        });

        const marker = L.marker([parseFloat(cp.lat), parseFloat(cp.lng)], { icon });
        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; font-size: 13px; color: #f8fafc;">
            <div style="color: #10B981; font-weight: 600; font-family: 'Space Grotesk', sans-serif; font-size: 14px;">${cp.name}</div>
            <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Code:</strong> <span style="font-family: 'JetBrains Mono', monospace;">${cp.checkpost_code}</span></div>
            <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Type:</strong> ${cp.border_type}</div>
            <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Neighboring Jurisdiction:</strong> ${cp.neighbor_state_district || 'Inter-District'}</div>
          </div>
        `);
        marker.addTo(groups.checkposts);
      });
    }

    // 5. CITIZEN ANONYMOUS REPORTS
    if (activeLayers.citizenReports && mapData.citizenReports) {
      mapData.citizenReports.forEach((cr) => {
        const marker = L.circleMarker([parseFloat(cr.lat), parseFloat(cr.lng)], {
          radius: 4,
          color: '#22D3EE',
          fillColor: '#22D3EE',
          fillOpacity: 0.7,
          weight: 1
        });

        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; font-size: 13px; color: #f8fafc;">
            <div style="color: #22D3EE; font-weight: 600; font-family: 'JetBrains Mono', monospace;">[ANONYMOUS TIP] ${cr.report_code}</div>
            <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Location:</strong> ${cr.approximate_location}</div>
            <div><strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">Status:</strong> ${cr.status}</div>
          </div>
        `);

        marker.addTo(groups.citizenReports);
      });
    }

    // If a specific district is selected, zoom to it
    if (selectedDistrictId && selectedDistrictId !== 'ALL') {
      const targetZone = mapData.riskZones?.find((z) => String(z.district_id) === String(selectedDistrictId));
      if (targetZone) {
        map.setView([parseFloat(targetZone.center_lat), parseFloat(targetZone.center_lng)], 10);
      }
    }
  }, [mapData, activeLayers, selectedDistrictId, selectedTransportMode]);

  const toggleLayer = (layerKey) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] shadow-md font-inter">
      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ height }} className="z-0" />

      {/* Top Floating Transport Mode Filter Bar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg text-xs font-inter">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.5px] px-1">Transit Mode:</span>
        <button
          type="button"
          onClick={() => setSelectedTransportMode('ALL')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase tracking-[0.5px] transition-all cursor-pointer ${
            selectedTransportMode === 'ALL' ? 'bg-[#22D3EE] text-black shadow-glow-cyan font-semibold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          All Routes
        </button>
        <button
          type="button"
          onClick={() => setSelectedTransportMode('ROAD_HIGHWAY')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase tracking-[0.5px] transition-all cursor-pointer ${
            selectedTransportMode === 'ROAD_HIGHWAY' ? 'bg-[#EF4444] text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Truck className="w-3.5 h-3.5" /> <span>Road / Highway</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedTransportMode('RAILWAY')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase tracking-[0.5px] transition-all cursor-pointer ${
            selectedTransportMode === 'RAILWAY' ? 'bg-[#3B82F6] text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Train className="w-3.5 h-3.5" /> <span>Railway</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedTransportMode('COASTAL_MARITIME')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase tracking-[0.5px] transition-all cursor-pointer ${
            selectedTransportMode === 'COASTAL_MARITIME' ? 'bg-[#22D3EE] text-black shadow-glow-cyan font-semibold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Ship className="w-3.5 h-3.5" /> <span>Coastal / Ports</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedTransportMode('BUS_TRANSIT')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase tracking-[0.5px] transition-all cursor-pointer ${
            selectedTransportMode === 'BUS_TRANSIT' ? 'bg-[#EAB308] text-black shadow-sm font-semibold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Bus className="w-3.5 h-3.5" /> <span>Bus Transit</span>
        </button>
      </div>

      {/* Top Right Floating Tactical Layer Controller */}
      <div className="absolute top-3 right-3 z-10 p-3 rounded-2xl bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-xs max-w-xs shadow-xl font-inter">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold">
          <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[1px] font-semibold text-slate-400">
            <Layers className="w-3.5 h-3.5 text-[#22D3EE]" />
            GIS Layers
          </span>
          {loading && <span className="text-[10px] text-[#22D3EE] font-mono font-medium animate-pulse">Syncing...</span>}
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="flex items-center justify-between cursor-pointer text-slate-700 dark:text-slate-300 font-normal">
            <span className="flex items-center gap-1.5 text-red-500 text-[11px] uppercase tracking-[0.5px] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
              Risk Indicator Zones
            </span>
            <input
              type="checkbox"
              checked={activeLayers.riskZones}
              onChange={() => toggleLayer('riskZones')}
              className="rounded text-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-slate-700 dark:text-slate-300 font-normal">
            <span className="flex items-center gap-1.5 text-purple-400 text-[11px] uppercase tracking-[0.5px] font-medium">
              <span className="w-2 h-2 rounded-full border border-dashed border-[#A855F7]"></span>
              Emerging Zones
            </span>
            <input
              type="checkbox"
              checked={activeLayers.emergingZones}
              onChange={() => toggleLayer('emergingZones')}
              className="rounded text-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-slate-700 dark:text-slate-300 font-normal">
            <span className="flex items-center gap-1.5 text-[#22D3EE] font-medium text-[11px] uppercase tracking-[0.5px]">
              <span className="w-3 h-0.5 bg-[#22D3EE]"></span>
              Transit Corridors (Routes)
            </span>
            <input
              type="checkbox"
              checked={activeLayers.associations}
              onChange={() => toggleLayer('associations')}
              className="rounded text-cyan-500"
            />
          </label>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1 space-y-1.5">
            <label className="flex items-center justify-between cursor-pointer text-slate-700 dark:text-slate-300 font-normal">
              <span className="flex items-center gap-1.5 text-red-500 text-[11px] uppercase tracking-[0.5px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                Seizures / Enforcement
              </span>
              <input
                type="checkbox"
                checked={activeLayers.enforcementPoints}
                onChange={() => toggleLayer('enforcementPoints')}
                className="rounded text-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-slate-700 dark:text-slate-300 font-normal">
              <span className="flex items-center gap-1.5 text-emerald-500 text-[11px] uppercase tracking-[0.5px] font-medium">
                <span className="w-2.5 h-2 bg-[#10B981] rounded-sm"></span>
                Checkposts
              </span>
              <input
                type="checkbox"
                checked={activeLayers.checkposts}
                onChange={() => toggleLayer('checkposts')}
                className="rounded text-cyan-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Floating Legend at Bottom */}
      <div className="absolute bottom-3 left-3 z-10 px-3 py-2 rounded-xl bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-3 shadow-lg font-medium uppercase tracking-[0.5px]">
        <span className="flex items-center gap-1 text-red-500">
          <span className="w-2.5 h-1 bg-[#EF4444] rounded"></span> Road
        </span>
        <span className="flex items-center gap-1 text-blue-500">
          <span className="w-2.5 h-1 bg-[#3B82F6] rounded"></span> Railway
        </span>
        <span className="flex items-center gap-1 text-cyan-400">
          <span className="w-2.5 h-1 bg-[#22D3EE] rounded"></span> Coastal
        </span>
        <span className="flex items-center gap-1 text-amber-500">
          <span className="w-2.5 h-1 bg-[#EAB308] rounded"></span> Bus
        </span>
      </div>
    </div>
  );
}
