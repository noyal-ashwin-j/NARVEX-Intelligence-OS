import React, { useState, useEffect } from 'react';
import { X, Filter, RotateCcw, Check, Calendar, Building2, Tag, Shield, Radio } from 'lucide-react';
import { useFilters } from '../../context/FilterContext';
import { api } from '../../services/api';

export function FilterDrawer() {
  const { filters, updateFilter, resetFilters, isDrawerOpen, setIsDrawerOpen, activeFilterCount } = useFilters();

  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [dtRes, metaRes] = await Promise.all([
          api.getDistricts({ sortBy: 'alpha' }),
          api.getMetadata()
        ]);
        if (dtRes.success) setDistricts(dtRes.districts || []);
        if (metaRes.success) {
          setCategories(metaRes.categories || []);
          setSources(metaRes.sources || []);
        }
      } catch (err) {
        console.error('Metadata load error:', err);
      }
    }
    loadMeta();
  }, []);

  // When district changes, load taluks
  useEffect(() => {
    async function loadTaluks() {
      if (!filters.districtId || filters.districtId === 'ALL') {
        setTaluks([]);
        return;
      }
      try {
        const res = await api.getTaluksByDistrict(filters.districtId);
        if (res.success) setTaluks(res.taluks || []);
      } catch {
        setTaluks([]);
      }
    }
    loadTaluks();
  }, [filters.districtId]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-inter text-xs">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-[#0B0F19]/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 uppercase font-space">
                  Multi-Dimensional Filters
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  Synchronizes all charts, maps & tables
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Form */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1 font-inter">
            {/* 1. Date Range Preset */}
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-medium uppercase tracking-[0.5px] flex items-center gap-1.5 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-[#22D3EE]" /> Date Horizon Preset
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: '30D', label: '30 Days' },
                  { key: '90D', label: '90 Days' },
                  { key: '1Y', label: '1 Year' },
                  { key: 'ALL', label: 'All-Time' }
                ].map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => updateFilter('datePreset', d.key)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium uppercase tracking-[0.5px] border transition-all cursor-pointer ${
                      filters.datePreset === d.key
                        ? 'bg-[#22D3EE] text-black border-cyan-400 font-semibold shadow-glow-cyan'
                        : 'bg-slate-50 dark:bg-[#0B0F19] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. District Filter */}
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-medium uppercase tracking-[0.5px] flex items-center gap-1.5 text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-[#22D3EE]" /> Target District (38 Districts)
              </label>
              <select
                value={filters.districtId}
                onChange={(e) => updateFilter('districtId', e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium text-xs focus:outline-none focus:border-[#22D3EE]"
              >
                <option value="ALL">STATEWIDE (ALL 38 DISTRICTS)</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code}) — {d.risk_level}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Taluk Filter */}
            {taluks.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-medium uppercase tracking-[0.5px] text-[11px]">
                  Taluk Subdivision
                </label>
                <select
                  value={filters.talukId}
                  onChange={(e) => updateFilter('talukId', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium text-xs focus:outline-none focus:border-[#22D3EE]"
                >
                  <option value="ALL">ALL TALUKS IN DISTRICT</option>
                  {taluks.map((t) => (
                    <option key={t.id} value={t.id}>{t.taluk_name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 4. Drug-Related Category Filter */}
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-medium uppercase tracking-[0.5px] flex items-center gap-1.5 text-[11px]">
                <Tag className="w-3.5 h-3.5 text-amber-500" /> Category Classification
              </label>
              <select
                value={filters.categoryId}
                onChange={(e) => updateFilter('categoryId', e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium text-xs focus:outline-none focus:border-[#22D3EE]"
              >
                <option value="ALL">ALL CATEGORIES</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.category_name}</option>
                ))}
              </select>
            </div>

            {/* 5. Ingestion Source Department */}
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-medium uppercase tracking-[0.5px] text-[11px]">
                Source Department
              </label>
              <select
                value={filters.sourceId}
                onChange={(e) => updateFilter('sourceId', e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium text-xs focus:outline-none focus:border-[#22D3EE]"
              >
                <option value="ALL">ALL SOURCE DEPARTMENTS</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>{s.source_name} ({s.source_type})</option>
                ))}
              </select>
            </div>

            {/* 6. Verification Status Filter */}
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-medium uppercase tracking-[0.5px] text-[11px]">
                Verification Pipeline Status
              </label>
              <select
                value={filters.verificationStatus}
                onChange={(e) => updateFilter('verificationStatus', e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium text-xs focus:outline-none focus:border-[#22D3EE]"
              >
                <option value="ALL">ALL VERIFICATION STATUSES</option>
                <option value="VERIFIED">VERIFIED ONLY</option>
                <option value="CORROBORATED">CORROBORATED ONLY</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
                <option value="NEEDS_VERIFICATION">NEEDS FIELD VERIFICATION</option>
              </select>
            </div>

            {/* 7. Layer Isolation Toggle: Enforcement vs Risk */}
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-medium uppercase tracking-[0.5px] flex items-center gap-1.5 text-[11px]">
                <Shield className="w-3.5 h-3.5 text-red-500" /> Layer Isolation Safeguard
              </label>
              <select
                value={filters.isEnforcement}
                onChange={(e) => updateFilter('isEnforcement', e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium text-xs focus:outline-none focus:border-[#22D3EE]"
              >
                <option value="ALL">ALL SIGNALS (ENFORCEMENT + COMMUNITY)</option>
                <option value="false">RAW RISK SIGNALS ONLY (NON-ENFORCEMENT)</option>
                <option value="true">ENFORCEMENT SEIZURES ONLY</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-medium text-[11px] uppercase tracking-[0.5px] border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>

            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black font-semibold text-[11px] uppercase tracking-[0.5px] shadow-glow-cyan cursor-pointer transition-all"
            >
              <Check className="w-4 h-4" /> Apply Synchronized View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
