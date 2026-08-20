import React, { useEffect, useState, useMemo } from 'react';
import { Map as MapLibreMap, MapGeoJSON, MapArc, MapMarker, MarkerPopup } from '../../../mapcn/src/registry/map';
import 'maplibre-gl/dist/maplibre-gl.css';
import intelligenceLayers from '../../config/intelligenceLayers.json';
import { useFilters } from '../../context/FilterContext';
import { api } from '../../services/api';
import { cn } from '@/lib/utils';

/**
 * NARVEX Intelligence Map – core visualisation component.
 *
 * Props:
 *  - height: CSS height of the map container.
 *  - mode: "PAST" | "PRESENT" | "FORECAST" – determines which temporal data is requested.
 *  - onSelectZone: callback when a zone (risk / signal) is clicked.
 *  - onSelectCorridor: callback when a historical corridor is clicked.
 *  - assistantCommand: optional command object from NARVEX Assistant.
 */
export function NarvexIntelligenceMap({
  height = '650px',
  mode = 'PRESENT',
  startDate,
  endDate,
  onSelectZone,
  onSelectCorridor,
  assistantCommand,
}) {
  const { filters } = useFilters();
  const [activeLayers, setActiveLayers] = useState(() => {
    const init = {};
    intelligenceLayers.forEach((l) => (init[l.id] = true));
    return init;
  });
  const [layerData, setLayerData] = useState({});
  const [loading, setLoading] = useState(false);

  // Load data for each active layer whenever filters, mode or layer toggles change.
  useEffect(() => {
    let cancelled = false;
    async function fetchLayers() {
      setLoading(true);
      const dataAccumulator = {};
      await Promise.all(
        intelligenceLayers.map(async (layer) => {
          if (!activeLayers[layer.id]) return;
          try {
            const response = await api.get(layer.source, {
              params: { ...filters, mode, startDate, endDate },
            });
            if (response.success && !cancelled) {
              dataAccumulator[layer.id] = response.data;
            }
          } catch (err) {
            console.error(`Failed to load ${layer.id}:`, err);
          }
        })
      );
      if (!cancelled) {
        setLayerData(dataAccumulator);
        setLoading(false);
      }
    }
    fetchLayers();
    return () => {
      cancelled = true;
    };
  }, [filters, mode, activeLayers]);

  // Simple layer toggle handler – could be wired to a UI drawer later.
  const toggleLayer = (layerId) => {
    setActiveLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  // Render GeoJSON features using MapLibre components based on config.
  const renderLayer = (layer) => {
    const data = layerData[layer.id];
    if (!data) return null;
    switch (layer.type) {
      case 'circle':
        // Expect data to be an array of feature objects (GeoJSON Point) with additional props.
        return data.map((feature) => (
          <MapMarker
            key={feature.id}
            longitude={parseFloat(feature.center_lng)}
            latitude={parseFloat(feature.center_lat)}
            {...layer.style}
            onClick={() => onSelectZone && onSelectZone(feature)}
          >
            <MarkerPopup>
              <div className="p-2">
                <strong>{feature.name || 'Zone'}</strong><br />
                Risk: {feature.risk_level}<br />
                Confidence: {feature.confidence_level}<br />
                Coverage: {feature.data_coverage}
              </div>
            </MarkerPopup>
          </MapMarker>
        ));
      case 'line':
        // Expect a FeatureCollection of LineString geometries.
        return (
          <MapArc
            key={layer.id}
            data={data}
            lineColor={layer.style.color}
            lineWidth={layer.style.width}
            dashArray={layer.style.dasharray}
            onClick={(e) => onSelectCorridor && onSelectCorridor(e)}
          />
        );
      case 'arc':
        // Render arcs (e.g., admin connections) using MapArc.
        return (
          <MapArc
            key={layer.id}
            data={data}
            lineColor={layer.style.color}
            lineWidth={layer.style.width}
            dashArray={layer.style.dasharray}
            onClick={(e) => onSelectCorridor && onSelectCorridor(e)}
          />
        );
      case 'symbol':
        // Symbol layer – render as MapMarker with an icon.
        return data.map((feature) => (
          <MapMarker
            key={feature.id}
            longitude={parseFloat(feature.center_lng)}
            latitude={parseFloat(feature.center_lat)}
            icon={layer.style.icon}
            iconColor={layer.style.iconColor}
          />
        ));
      default:
        // Fallback – render raw GeoJSON.
        return (
          <MapGeoJSON
            key={layer.id}
            data={data}
            fillColor={layer.style.color}
            fillOpacity={layer.style.fillOpacity}
          />
        );
    }
  };

  // Assistant command handling – simple keyword mapping (can be expanded later).
  useEffect(() => {
    if (!assistantCommand) return;
    const { action, payload } = assistantCommand;
    switch (action) {
      case 'showDistrict':
        // payload should be district name or code.
        // Find district geometry in layer data (assumes a district layer exists).
        // For brevity, we just log.
        console.log('Assistant request: showDistrict', payload);
        break;
      case 'toggleLayer':
        toggleLayer(payload);
        break;
      case 'setMode':
        // payload = 'PAST' | 'PRESENT' | 'FORECAST'
        // This component receives mode via prop, so higher level should handle.
        break;
      default:
        console.warn('Unknown assistant command', assistantCommand);
    }
  }, [assistantCommand]);

  return (
    <div className={cn('relative w-full', loading && 'opacity-70')}>
      {/* Mode Switch – simple tab style; can be extracted later */}
      <div className="absolute top-2 left-2 z-10 flex space-x-2">
        {['PAST', 'PRESENT', 'FORECAST'].map((m) => (
          <button
            key={m}
            type="button"
            className={cn(
              'px-3 py-1 rounded text-sm font-medium',
              m === mode ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            )}
            disabled={m === mode}
          >
            {m}
          </button>
        ))}
      </div>
      <MapLibreMap height={height} className="w-full h-full">
        {/* Iterate over configured layers */}
        {intelligenceLayers.map((layer) => {
          if (!activeLayers[layer.id]) return null;
          return <React.Fragment key={layer.id}>{renderLayer(layer)}</React.Fragment>;
        })}
      </MapLibreMap>
    </div>
  );
}
