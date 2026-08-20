import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, FileText, AlertTriangle, ArrowRight, CornerDownLeft } from 'lucide-react';
import { api } from '../../services/api';
import { RiskBadge, StatusBadge } from '../common/Badge';

export function GlobalSearchModal({ isOpen, onClose, onSelectDistrict, onSelectEvent }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = async (searchTerm) => {
    setQuery(searchTerm);
    if (!searchTerm || searchTerm.length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const res = await api.globalSearch(searchTerm);
      if (res.success) {
        setResults(res.results);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalResults =
    (results?.districts?.length || 0) +
    (results?.events?.length || 0) +
    (results?.alerts?.length || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex items-start justify-center font-inter text-xs">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0B0F19]/70 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19]">
          <Search className="w-5 h-5 text-[#22D3EE] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search Tamil Nadu districts, event codes, locations, categories, or alerts..."
            className="w-full bg-transparent px-3.5 py-4 text-slate-900 dark:text-slate-100 font-normal placeholder-slate-500 text-[13px] focus:outline-none"
          />
          {query && (
            <button onClick={() => handleSearch('')} className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 font-inter">
          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs animate-pulse font-mono">
              Searching statewide intelligence database...
            </div>
          ) : !query ? (
            <div className="py-8 text-center text-slate-400 text-xs font-normal">
              Type at least 2 characters to search across districts, events, and early warnings.
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-mono">
              No matching intelligence records found for "{query}".
            </div>
          ) : (
            <div className="space-y-4">
              {/* Districts */}
              {results?.districts?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium uppercase text-slate-400 tracking-[1px] block">
                    Districts ({results.districts.length})
                  </span>
                  {results.districts.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        onSelectDistrict(d.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] hover:bg-cyan-500/10 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-[#22D3EE]" />
                        <div>
                          <strong className="text-slate-900 dark:text-slate-100 text-xs font-space font-semibold group-hover:text-[#22D3EE]">{d.name} <span className="font-mono text-slate-400">({d.code})</span></strong>
                          <span className="text-slate-500 block text-[10px] font-normal">HQ: {d.headquarters}</span>
                        </div>
                      </div>
                      <RiskBadge level={d.risk_level} />
                    </button>
                  ))}
                </div>
              )}

              {/* Events */}
              {results?.events?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium uppercase text-slate-400 tracking-[1px] block">
                    Intelligence Signals ({results.events.length})
                  </span>
                  {results.events.map((evt) => (
                    <button
                      key={evt.id}
                      onClick={() => {
                        onSelectEvent(evt.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] hover:bg-cyan-500/10 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <div>
                          <strong className="text-[#22D3EE] text-xs font-mono font-semibold">{evt.event_code}</strong>
                          <span className="text-slate-800 dark:text-slate-300 block text-[11px] font-normal">
                            {evt.location_name} • {evt.category_name}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={evt.verification_status} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-500 text-[11px] font-mono font-medium">
          <span>Press ESC to close</span>
          <span className="flex items-center gap-1">
            Navigate with <CornerDownLeft className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
