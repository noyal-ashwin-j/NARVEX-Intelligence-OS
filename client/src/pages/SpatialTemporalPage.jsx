import React, { useState, useEffect } from 'react';
import {
  Network,
  Truck,
  Train,
  Ship,
  Plane,
  Bus,
  ArrowRight,
  Filter,
  Layers,
  MapPin,
  Clock,
  ShieldAlert,
  Share2,
  CheckCircle2,
  Info,
  Building2,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { StatCard } from '../components/common/StatCard';
import { GISIntelligenceMap } from '../components/map/GISIntelligenceMap';
import { LocationDossierModal } from '../components/common/LocationDossierModal';

export function SpatialTemporalPage() {
  const [loading, setLoading] = useState(true);
  const [associations, setAssociations] = useState([]);
  const [selectedAssoc, setSelectedAssoc] = useState(null);
  const [modeSummary, setModeSummary] = useState({});

  // Filters
  const [transportMode, setTransportMode] = useState('ALL');
  const [routeType, setRouteType] = useState('ALL');
  const [contrabandFilter, setContrabandFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [districts, setDistricts] = useState([]);

  // Corridor Comparison tool
  const [compareId1, setCompareId1] = useState('');
  const [compareId2, setCompareId2] = useState('');
  const [compareResult, setCompareResult] = useState(null);

  // Dossier modal
  const [dossierDistrict, setDossierDistrict] = useState(null);

  // Load districts
  useEffect(() => {
    async function loadDistrictsList() {
      try {
        const res = await api.getDistricts({ sortBy: 'alpha' });
        if (res.success) setDistricts(res.districts || []);
      } catch (err) {
        console.error('Failed to load districts:', err);
      }
    }
    loadDistrictsList();
  }, []);

  // Load Transit Corridors with active filters
  const loadCorridors = async () => {
    setLoading(true);
    try {
      const res = await api.getSpatialAssociations({
        transportMode: transportMode !== 'ALL' ? transportMode : undefined,
        routeType: routeType !== 'ALL' ? routeType : undefined,
        contraband: contrabandFilter !== 'ALL' ? contrabandFilter : undefined,
        districtId: districtFilter !== 'ALL' ? districtFilter : undefined
      });

      if (res.success) {
        setAssociations(res.associations || []);
        setModeSummary(res.modeSummary || {});
        if (res.associations?.length > 0) {
          setSelectedAssoc(res.associations[0]);
          setCompareId1(String(res.associations[0].id));
          if (res.associations.length > 1) setCompareId2(String(res.associations[1].id));
        } else {
          setSelectedAssoc(null);
        }
      }
    } catch (err) {
      console.error('Error loading associations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCorridors();
  }, [transportMode, routeType, contrabandFilter, districtFilter]);

  const handleCompare = async () => {
    if (!compareId1 || !compareId2) return;
    try {
      const res = await api.compareCorridors(compareId1, compareId2);
      if (res.success) setCompareResult(res);
    } catch (err) {
      alert(`Comparison failed: ${err.message}`);
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'ROAD_HIGHWAY':
        return <Truck className="w-4 h-4 text-red-500" />;
      case 'RAILWAY':
        return <Train className="w-4 h-4 text-blue-500" />;
      case 'COASTAL_MARITIME':
        return <Ship className="w-4 h-4 text-[#22D3EE]" />;
      case 'AIR_CARGO':
        return <Plane className="w-4 h-4 text-purple-400" />;
      case 'BUS_TRANSIT':
        return <Bus className="w-4 h-4 text-amber-500" />;
      default:
        return <Truck className="w-4 h-4 text-[#22D3EE]" />;
    }
  };

  const getModeBadge = (mode) => {
    switch (mode) {
      case 'ROAD_HIGHWAY':
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium font-inter uppercase tracking-[0.5px] bg-red-500/10 text-red-500 border border-red-500/30">Road / Highway</span>;
      case 'RAILWAY':
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium font-inter uppercase tracking-[0.5px] bg-blue-500/10 text-blue-500 border border-blue-500/30">Railway Freight</span>;
      case 'COASTAL_MARITIME':
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium font-inter uppercase tracking-[0.5px] bg-cyan-500/10 text-[#22D3EE] border border-cyan-500/30">Coastal / Maritime</span>;
      case 'AIR_CARGO':
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium font-inter uppercase tracking-[0.5px] bg-purple-500/10 text-[#A855F7] border border-purple-500/30">Air / Courier</span>;
      case 'BUS_TRANSIT':
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium font-inter uppercase tracking-[0.5px] bg-amber-500/10 text-amber-500 border border-amber-500/30">Bus Line</span>;
      default:
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-medium font-inter uppercase tracking-[0.5px] bg-slate-500/10 text-slate-400 border border-slate-700">Multi-Modal</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 font-inter text-xs">
      <DisclaimerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2 font-space">
            <Network className="w-5 h-5 text-[#22D3EE]" />
            Illicit Transit Corridors & Mode of Transport Intelligence
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            Surveillance of inter-district highways, railway express parcels, coastal waterways, and local intra-district routes.
          </p>
        </div>
      </div>

      {/* 1. Mode of Transport KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Transit Routes"
          value={associations.length}
          subtitle="Observed spatial linkages"
          icon={Network}
        />
        <StatCard
          title="Road / Highways"
          value={modeSummary.ROAD_HIGHWAY || 0}
          subtitle="Commercial freight trucks"
          icon={Truck}
        />
        <StatCard
          title="Railway Express"
          value={modeSummary.RAILWAY || 0}
          subtitle="Parcel vans & platform hubs"
          icon={Train}
        />
        <StatCard
          title="Coastal / Ports"
          value={modeSummary.COASTAL_MARITIME || 0}
          subtitle="Gulf of Mannar & Bay of Bengal"
          icon={Ship}
        />
        <StatCard
          title="Bus & Local Flow"
          value={modeSummary.BUS_TRANSIT || 0}
          subtitle="Inter-Taluk bus lines"
          icon={Bus}
        />
      </div>

      {/* 2. Interactive Route Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="text-[14px] font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-[1px] flex items-center gap-1.5 font-space">
            <Filter className="w-4 h-4 text-[#22D3EE]" />
            Transit Route Filters & Mode Selector
          </span>
          <span className="text-[11px] font-mono font-medium text-[#22D3EE] uppercase tracking-[0.5px]">
            Showing {associations.length} Active Corridors
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Mode of Transport */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase block">Mode of Transport</label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Transport Modes (Road, Rail, Sea, Air, Bus)</option>
              <option value="ROAD_HIGHWAY">🚚 Road & National Highways (NH44, NH544)</option>
              <option value="RAILWAY">🚆 Southern Railway Express Lines</option>
              <option value="COASTAL_MARITIME">🚢 Coastal / Maritime Routes</option>
              <option value="BUS_TRANSIT">🚌 Inter-Taluk Bus Lines</option>
              <option value="AIR_CARGO">✈️ Air Express & Courier</option>
            </select>
          </div>

          {/* Route Type: Inter vs Intra */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase block">Route Scope (State vs District)</label>
            <select
              value={routeType}
              onChange={(e) => setRouteType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Transit Routes</option>
              <option value="INTER_DISTRICT">🌐 Statewide Inter-District Corridors</option>
              <option value="INTRA_DISTRICT">📍 Intra-District Local Flow (Inside Taluks)</option>
            </select>
          </div>

          {/* District Scope */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase block">District Jurisdiction</label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All 38 Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          {/* Contraband Category */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase block">Primary Contraband</label>
            <select
              value={contrabandFilter}
              onChange={(e) => setContrabandFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Contraband Types</option>
              <option value="Synthetic">Synthetic Narcotics / MDMA / Meth</option>
              <option value="Ganja">Commercial Ganja / Cannabis</option>
              <option value="Opioids">Prescription Opioids & Tablets</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Interactive GIS Route Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Tactical Map: Exact Illicit Transit Trajectories
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Click any route line to inspect waypoints and checkposts
          </span>
        </div>

        <GISIntelligenceMap
          height="520px"
          onSelectCorridor={(corridor) => setSelectedAssoc(corridor)}
          selectedDistrictId={districtFilter}
        />
      </div>

      {/* 4. Corridor Inspector & Comparison Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Corridor List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase block">
            Observed Transit Corridors ({associations.length})
          </span>

          {associations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No transit corridors match selected filters.
            </div>
          ) : (
            associations.map((assoc) => (
              <button
                key={assoc.id}
                onClick={() => setSelectedAssoc(assoc)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedAssoc?.id === assoc.id
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-900 dark:text-blue-100 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    {getModeIcon(assoc.transport_mode)}
                    <span className="truncate">{assoc.corridor_name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
                  <div>{getModeBadge(assoc.transport_mode)}</div>
                  <span className="font-bold text-slate-900 dark:text-slate-200">
                    {assoc.observation_count} Intercepts
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Center/Right: Corridor Inspector Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedAssoc ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    {getModeIcon(selectedAssoc.transport_mode)}
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {selectedAssoc.corridor_name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Route Type: <strong>{selectedAssoc.route_type === 'INTRA_DISTRICT' ? 'Intra-District Local Flow' : 'Statewide Inter-District Transit'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {getModeBadge(selectedAssoc.transport_mode)}
                </div>
              </div>

              {/* Transit Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">Origin Jurisdiction</span>
                  <strong className="text-slate-900 dark:text-slate-100 text-xs">{selectedAssoc.origin_district_name}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">Destination</span>
                  <strong className="text-slate-900 dark:text-slate-100 text-xs">{selectedAssoc.destination_district_name}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">Historical Intercepts</span>
                  <strong className="text-blue-600 text-xs">{selectedAssoc.observation_count} Records</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">Avg Transit Time</span>
                  <strong className="text-amber-600 text-xs">{selectedAssoc.average_transit_time_hrs} Hours</strong>
                </div>
              </div>

              {/* Contraband & Checkpoints */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">Primary Contraband Observed</span>
                  <strong className="text-slate-900 dark:text-slate-100 text-xs">{selectedAssoc.primary_contraband || 'Synthetic Substances'}</strong>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">Checkposts & Tolls Crossed</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 text-xs">{selectedAssoc.checkposts_on_route || 'Multiple Highway Checkpoints'}</strong>
                </div>
              </div>

              {/* Action Button: Extract & Dispatch Dossier */}
              <div className="pt-2 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-medium">
                  Last observed: {selectedAssoc.last_observed_date}
                </div>
                <button
                  onClick={() => {
                    setDossierDistrict({
                      id: selectedAssoc.origin_district_id,
                      name: selectedAssoc.corridor_name,
                      code: 'TRANSIT',
                      headquarters: `${selectedAssoc.origin_district_name} -> ${selectedAssoc.destination_district_name}`,
                      center_lat: 11.0168,
                      center_lng: 76.9558,
                      risk_level: selectedAssoc.risk_intensity || 'HIGH PREVENTIVE ATTENTION',
                      confidence_score: 92.0,
                      coverage_status: 'GOOD',
                      active_alerts_count: 2,
                      emerging_zones_count: 1,
                      verified_events_count: selectedAssoc.observation_count
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Extract Transit Dossier</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-400">
              Select a corridor from the list to inspect transit route details.
            </div>
          )}

          {/* Corridor Comparison Tool */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <span className="font-bold text-slate-900 dark:text-slate-100 uppercase text-xs">
                Transit Corridor Comparison Tool
              </span>
              <button
                onClick={handleCompare}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Compare Corridors
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1 font-bold">Route A</label>
                <select
                  value={compareId1}
                  onChange={(e) => setCompareId1(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                >
                  {associations.map((a) => (
                    <option key={a.id} value={a.id}>{a.corridor_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1 font-bold">Route B</label>
                <select
                  value={compareId2}
                  onChange={(e) => setCompareId2(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none"
                >
                  {associations.map((a) => (
                    <option key={a.id} value={a.id}>{a.corridor_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {compareResult && (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-blue-600">{compareResult.corridor1?.corridor_name}</div>
                  <div>Mode: <strong>{compareResult.corridor1?.transport_mode}</strong></div>
                  <div>Intercepts: <strong>{compareResult.corridor1?.observation_count}</strong></div>
                  <div>Checkposts: <strong>{compareResult.corridor1?.checkposts_on_route}</strong></div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-purple-600">{compareResult.corridor2?.corridor_name}</div>
                  <div>Mode: <strong>{compareResult.corridor2?.transport_mode}</strong></div>
                  <div>Intercepts: <strong>{compareResult.corridor2?.observation_count}</strong></div>
                  <div>Checkposts: <strong>{compareResult.corridor2?.checkposts_on_route}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dossier Modal */}
      <LocationDossierModal
        isOpen={!!dossierDistrict}
        onClose={() => setDossierDistrict(null)}
        district={dossierDistrict}
      />
    </div>
  );
}
