import React from 'react';
import { Map as MapCN } from '../../mapcn/src/registry/map';
import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * NARVEX Intelligence Map wrapper built on mapcn (MapLibre GL).
 * Accepts a height prop (string, e.g., "650px") and forwards any children.
 * Additional props can be added later to handle layers, filters, etc.
 */
export function MapCNWrapper({ height = '100%', children, ...rest }) {
  return (
    <div style={{ height }} className="relative w-full">
      <MapCN className="h-full w-full" {...rest}>
        {children}
      </MapCN>
    </div>
  );
}
