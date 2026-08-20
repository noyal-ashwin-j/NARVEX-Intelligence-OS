import React, { useState, useEffect } from 'react';
import { Filter, X, RotateCcw, Building2, Calendar, Tag, Search, Share2, MapPin } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { api } from '../../services/api';

export function LiveFilterBar({ onExportDossier, showExport = true }) {
  const { filters, updateFilter, resetFilters, activeFilterCount } = useFilters();
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [dtRes, metaRes] = await Promise.all([
          api.getDistricts({ sortBy: 'alpha' }),
          api.getMetadata()
        ]);
        if (dtRes.success) setDistricts(dtRes.districts || []);
        if (metaRes.success) setCategories(metaRes.categories || []);
      } catch (err) {
        console.error('Filter bar meta error:', err);
      }
    }
    loadMeta();
  }, []);

  const activeDistrictObj = districts.find((d) => String(d.id) === String(filters.districtId));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-2.5 font-sans">
      {/* Top Filter Controls Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* District Quick Select */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <select
              value={filters.districtId}
              onChange={(e) => updateFilter('districtId', e.target.value)}
              className="bg-transparent border-0 text-slate-900 dark:text-slate-100 font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Tamil Nadu (38 DT)</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Time Horizon Quick Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={filters.datePreset}
              onChange={(e) => updateFilter('datePreset', e.target.value)}
              className="bg-transparent border-0 text-slate-900 dark:text-slate-100 font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="30D">Last 30 Days</option>
              <option value="90D">Last 90 Days</option>
              <option value="1Y">Past 1 Year</option>
              <option value="ALL">All-Time Archive</option>
            </select>
          </div>

          {/* Category Quick Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
            <Tag className="w-4 h-4 text-amber-600 shrink-0" />
            <select
              value={filters.categoryId}
              onChange={(e) => updateFilter('categoryId', e.target.value)}
              className="bg-transparent border-0 text-slate-900 dark:text-slate-100 font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status Quick Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 py-1.5">
            <Filter className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={filters.verificationStatus}
              onChange={(e) => updateFilter('verificationStatus', e.target.value)}
              className="bg-transparent border-0 text-slate-900 dark:text-slate-100 font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Signal Statuses</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="CORROBORATED">Corroborated Only</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="NEEDS_VERIFICATION">Needs Verification</option>
            </select>
          </div>
        </div>

        {/* Right Actions: Reset & Location Extract Dossier */}
        <div className="flex items-center gap-2 font-mono">
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {showExport && (
            <button
              onClick={() => onExportDossier && onExportDossier(activeDistrictObj)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 cursor-pointer transition-all"
              title="Extract & Share Location Intelligence Brief"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Extract & Share Dossier</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips Strip */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
        <span className="text-slate-400 font-bold font-sans">Active Scope:</span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 font-bold">
          <MapPin className="w-3 h-3 text-blue-600" />
          {filters.districtId === 'ALL' ? 'Statewide (38 DT)' : (activeDistrictObj?.name || `District #${filters.districtId}`)}
        </span>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold">
          Horizon: {filters.datePreset}
        </span>

        {filters.categoryId !== 'ALL' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold">
            Cat: {categories.find((c) => String(c.id) === String(filters.categoryId))?.category_name || filters.categoryId}
            <button onClick={() => updateFilter('categoryId', 'ALL')} className="hover:text-amber-600 cursor-pointer">
              <X className="w-3 h-3 ml-0.5" />
            </button>
          </span>
        )}

        {filters.verificationStatus !== 'ALL' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
            Status: {filters.verificationStatus}
            <button onClick={() => updateFilter('verificationStatus', 'ALL')} className="hover:text-emerald-600 cursor-pointer">
              <X className="w-3 h-3 ml-0.5" />
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
