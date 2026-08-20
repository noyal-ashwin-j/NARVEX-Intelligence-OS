import React, { useMemo, useState } from 'react';
import {
  Map,
  MapArc,
  MapMarker,
  MapPopup,
  MarkerContent,
  MarkerLabel,
  MapControls
} from '@/registry/map';
import { Globe, Radio, Sparkles, Zap, Shield, ArrowRight, RotateCw } from 'lucide-react';

/**
 * Authentic mapcn.dev 3D Globe with Inter-State Great-Circle Arcs
 * Built on top of MapLibre GL 3D Globe Projection
 */

export function Interactive3DGlobeMap({ height = '480px', onSelectDistrict }) {
  const [selectedArc, setSelectedArc] = useState(null);
  const [selectedHub, setSelectedHub] = useState(null);

  // Strategic National & State Nodes
  const hubs = useMemo(() => [
    // Tamil Nadu Core Hubs
    { id: 'TN-CHE', name: 'Chennai Central Port', state: 'Tamil Nadu', lng: 80.2707, lat: 13.0827, districtId: 1, type: 'CORE_GATEWAY', count: 42, color: '#22D3EE' },
    { id: 'TN-CBE', name: 'Coimbatore Hub (Walayar)', state: 'Tamil Nadu', lng: 76.9558, lat: 11.0168, districtId: 2, type: 'CORE_GATEWAY', count: 48, color: '#EF4444' },
    { id: 'TN-KRI', name: 'Krishnagiri / Hosur', state: 'Tamil Nadu', lng: 78.2137, lat: 12.5186, districtId: 10, type: 'CORE_GATEWAY', count: 36, color: '#EF4444' },
    { id: 'TN-SLM', name: 'Salem Junction', state: 'Tamil Nadu', lng: 78.1460, lat: 11.6643, districtId: 4, type: 'REGIONAL', count: 20, color: '#22D3EE' },
    { id: 'TN-MDU', name: 'Madurai Logistics', state: 'Tamil Nadu', lng: 78.1198, lat: 9.9252, districtId: 3, type: 'REGIONAL', count: 24, color: '#22D3EE' },
    { id: 'TN-TSI', name: 'Tenkasi (Puliyarai Ghat)', state: 'Tamil Nadu', lng: 77.3152, lat: 8.9594, districtId: 14, type: 'BORDER_PASS', count: 16, color: '#A855F7' },
    { id: 'TN-TUT', name: 'Thoothukudi Port', state: 'Tamil Nadu', lng: 78.1348, lat: 8.7642, districtId: 12, type: 'MARITIME', count: 28, color: '#10B981' },

    // Indian Interstate Origins
    { id: 'KL-PAL', name: 'Kerala (Palakkad)', state: 'Kerala', lng: 76.6548, lat: 10.7867, type: 'INTERSTATE_ORIGIN', count: 26, color: '#A855F7' },
    { id: 'KA-BLR', name: 'Karnataka (Bengaluru)', state: 'Karnataka', lng: 77.5946, lat: 12.9716, type: 'INTERSTATE_ORIGIN', count: 34, color: '#EF4444' },
    { id: 'AP-TPR', name: 'Andhra Pradesh (Tirupati)', state: 'Andhra Pradesh', lng: 79.4192, lat: 13.6288, type: 'INTERSTATE_ORIGIN', count: 19, color: '#F59E0B' },
    { id: 'MH-MUM', name: 'Maharashtra (Mumbai)', state: 'Maharashtra', lng: 72.8777, lat: 19.0760, type: 'INTERSTATE_ORIGIN', count: 22, color: '#F59E0B' },
    { id: 'OD-BBI', name: 'Odisha (Bhubaneswar)', state: 'Odisha', lng: 85.8245, lat: 20.2961, type: 'INTERSTATE_ORIGIN', count: 18, color: '#10B981' },
    { id: 'DL-DEL', name: 'Delhi NCR', state: 'Delhi NCR', lng: 77.2090, lat: 28.6139, type: 'INTERSTATE_ORIGIN', count: 15, color: '#38BDF8' },
    { id: 'WB-KOL', name: 'West Bengal (Kolkata)', state: 'West Bengal', lng: 88.3639, lat: 22.5726, type: 'INTERSTATE_ORIGIN', count: 14, color: '#34D399' },
    { id: 'GJ-AHM', name: 'Gujarat (Ahmedabad)', state: 'Gujarat', lng: 72.5714, lat: 23.0225, type: 'INTERSTATE_ORIGIN', count: 12, color: '#FBBF24' }
  ], []);

  // Connected Great-Circle Arcs
  const arcs = useMemo(() => [
    { id: 'KL-CBE', name: 'Kerala → Coimbatore Axis', from: [76.6548, 10.7867], to: [76.9558, 11.0168], color: '#22D3EE', volume: '26 Signals' },
    { id: 'KA-KRI', name: 'Karnataka → Krishnagiri Gateway', from: [77.5946, 12.9716], to: [78.2137, 12.5186], color: '#EF4444', volume: '34 Signals' },
    { id: 'AP-CHE', name: 'Andhra Pradesh → Chennai Axis', from: [79.4192, 13.6288], to: [80.2707, 13.0827], color: '#F59E0B', volume: '19 Signals' },
    { id: 'MH-KRI', name: 'Mumbai → Hosur / Salem Corridor', from: [72.8777, 19.0760], to: [78.2137, 12.5186], color: '#A855F7', volume: '22 Signals' },
    { id: 'OD-CHE', name: 'Odisha → Chennai Maritime Link', from: [85.8245, 20.2961], to: [80.2707, 13.0827], color: '#10B981', volume: '18 Signals' },
    { id: 'DL-CHE', name: 'Delhi NCR → Chennai Freight Trunk', from: [77.2090, 28.6139], to: [80.2707, 13.0827], color: '#38BDF8', volume: '15 Signals' },
    { id: 'WB-TUT', name: 'Kolkata → Thoothukudi Maritime Link', from: [88.3639, 22.5726], to: [78.1348, 8.7642], color: '#34D399', volume: '14 Signals' },
    { id: 'GJ-SLM', name: 'Gujarat → Salem Chemical Axis', from: [72.5714, 23.0225], to: [78.1460, 11.6643], color: '#FBBF24', volume: '12 Signals' },
    { id: 'KRI-SLM', name: 'Krishnagiri → Salem Corridor', from: [78.2137, 12.5186], to: [78.1460, 11.6643], color: '#22D3EE', volume: '20 Signals' },
    { id: 'CBE-SLM', name: 'Coimbatore → Salem Corridor', from: [76.9558, 11.0168], to: [78.1460, 11.6643], color: '#22D3EE', volume: '14 Signals' },
    { id: 'SLM-MDU', name: 'Salem → Madurai Logistics', from: [78.1460, 11.6643], to: [78.1198, 9.9252], color: '#22D3EE', volume: '16 Signals' },
    { id: 'MDU-TUT', name: 'Madurai → Thoothukudi Link', from: [78.1198, 9.9252], to: [78.1348, 8.7642], color: '#10B981', volume: '11 Signals' }
  ], []);

  return (
    <div
      className="relative w-full rounded-3xl bg-[#090E1A] border border-cyan-500/30 overflow-hidden font-inter shadow-2xl"
      style={{ height }}
    >
      {/* 3D MapLibre Globe from mapcn */}
      <Map
        center={[78.9629, 20.5937]}
        zoom={2.5}
        projection={{ type: 'globe' }}
        theme="dark"
        className="w-full h-full"
      >
        {/* Map Controls */}
        <MapControls position="top-right" showZoom showCompass showFullscreen />

        {/* 3D Great-Circle Curved Arcs */}
        <MapArc
          data={arcs}
          curvature={0.25}
          paint={{
            'line-color': ['get', 'color'],
            'line-width': 2.5,
            'line-opacity': 0.85,
            'line-dasharray': [2, 2]
          }}
          hoverPaint={{
            'line-width': 4.5,
            'line-opacity': 1
          }}
          onHover={(event) =>
            setSelectedArc(
              event
                ? {
                    arc: event.arc,
                    popupLngLat: {
                      longitude: event.longitude,
                      latitude: event.latitude
                    }
                  }
                : null
            )
          }
        />

        {/* State & Jurisdiction Node Markers */}
        {hubs.map((hub) => {
          const isTN = hub.state === 'Tamil Nadu';

          return (
            <MapMarker
              key={hub.id}
              longitude={hub.lng}
              latitude={hub.lat}
              onClick={() => {
                setSelectedHub(hub);
                if (isTN && hub.districtId && onSelectDistrict) {
                  onSelectDistrict(hub.districtId);
                }
              }}
            >
              <MarkerContent>
                <div
                  className={`rounded-full border-2 border-white cursor-pointer transition-transform hover:scale-125 ${
                    isTN ? 'size-3.5 bg-cyan-400 shadow-glow-cyan animate-pulse' : 'size-2.5 bg-purple-500'
                  }`}
                  style={{ backgroundColor: hub.color }}
                />
                <MarkerLabel
                  position="top"
                  className="bg-[#090E1A]/90 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-semibold px-2 py-0.5 rounded-lg shadow-md backdrop-blur-sm"
                >
                  {hub.name.split(' ')[0]}
                </MarkerLabel>
              </MarkerContent>
            </MapMarker>
          );
        })}

        {/* Selected Arc Interactive Popup */}
        {selectedArc && (
          <MapPopup
            longitude={selectedArc.popupLngLat.longitude}
            latitude={selectedArc.popupLngLat.latitude}
            offset={14}
            closeOnClick={false}
            className="p-0"
          >
            <div className="flex items-center gap-2 px-3 py-2 text-xs bg-[#090E1A] text-white border border-cyan-500/40 rounded-xl shadow-lg font-mono">
              <span
                className="size-2 rounded-full animate-ping"
                style={{ background: selectedArc.arc.color }}
              />
              <span className="font-bold text-cyan-300">
                {selectedArc.arc.name}
              </span>
              <span className="text-slate-400 border-l border-slate-700 pl-2">
                {selectedArc.arc.volume}
              </span>
            </div>
          </MapPopup>
        )}
      </Map>

      {/* Top HUD Overlay Banner */}
      <div className="absolute top-3.5 left-4 flex items-center gap-2 pointer-events-none">
        <div className="p-2 rounded-xl bg-[#090E1A]/90 border border-cyan-500/40 text-cyan-400 backdrop-blur-md shadow-glow-cyan pointer-events-auto">
          <Globe className="w-5 h-5 animate-pulse" />
        </div>
        <div className="pointer-events-auto">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-white font-space">
              Inter-State Connected 3D Globe
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono">
              mapcn.dev Real Engine
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Drag to rotate • Scroll to zoom • Hover arcs for spatial correlation
          </p>
        </div>
      </div>

      {/* Bottom Telemetry Legend HUD */}
      <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[10px] font-mono text-slate-300">
        <div className="flex items-center gap-3 bg-[#090E1A]/90 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md pointer-events-auto shadow-md">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /> Tamil Nadu Gateway</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> Interstate Origin Node</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Coastal Maritime Arc</span>
        </div>

        <div className="bg-[#090E1A]/90 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-cyan-300 backdrop-blur-md pointer-events-auto shadow-md">
          12 State Corridors • 15 Connected Hubs Active
        </div>
      </div>
    </div>
  );
}
