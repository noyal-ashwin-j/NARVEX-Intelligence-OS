import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck2,
  Lock,
  Hash,
  UserCheck,
  Calendar,
  Database,
  Building,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../../services/api';
import { StatusBadge } from '../common/Badge';

export function ProvenanceDrawer({ eventId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventId) {
      setData(null);
      return;
    }

    async function loadProvenance() {
      setLoading(true);
      setError('');
      try {
        const res = await api.getEventById(eventId);
        if (res.success) {
          setData(res);
        } else {
          setError(res.message || 'Provenance not found.');
        }
      } catch (err) {
        setError(err.message || 'Error fetching provenance details.');
      } finally {
        setLoading(false);
      }
    }
    loadProvenance();
  }, [eventId]);

  if (!eventId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-inter text-xs">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0B0F19]/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 uppercase font-space">
                  Data Provenance Inspector
                </h3>
                <span className="text-[11px] text-[#22D3EE] font-medium uppercase tracking-[0.5px]">
                  "Why is this signal here?" Audit Trail
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1 font-inter">
            {loading ? (
              <div className="py-16 text-center text-slate-500 font-mono animate-pulse">
                Fetching cryptographic provenance record...
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500">
                {error}
              </div>
            ) : data ? (
              <div className="space-y-4 text-xs">
                {/* Event Summary Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[#22D3EE] font-mono">{data.event?.event_code}</span>
                    <StatusBadge status={data.event?.verification_status} />
                  </div>
                  <div className="text-slate-800 dark:text-slate-300 font-inter text-[13px] font-normal leading-relaxed">
                    <div><strong>District:</strong> {data.event?.district_name} ({data.event?.location_name})</div>
                    <div><strong>Date:</strong> <span className="font-mono">{data.event?.event_date}</span></div>
                    <div><strong>Category:</strong> {data.event?.category_name}</div>
                  </div>
                </div>

                {/* Provenance Metadata */}
                {data.provenance ? (
                  <div className="space-y-3">
                    <div className="text-[11px] font-medium uppercase text-slate-400 tracking-[1px]">
                      Cryptographic Provenance Chain
                    </div>

                    {/* Source File & Row */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 block uppercase font-medium tracking-[0.5px]">Source File Manifest</span>
                        <strong className="text-slate-900 dark:text-slate-200 truncate block mt-0.5 text-xs font-mono">
                          {data.provenance.source_file_name || 'Direct Portal Transmission'}
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 block uppercase font-medium tracking-[0.5px]">Source Record #</span>
                        <strong className="text-slate-900 dark:text-slate-200 block mt-0.5 text-xs font-mono">
                          Row {data.provenance.source_row_number || '1 (Single Ingest)'}
                        </strong>
                      </div>
                    </div>

                    {/* AI / Rule Classification Method */}
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                      <div className="flex items-center justify-between text-purple-400 font-medium text-[11px] uppercase tracking-[0.5px]">
                        <span>Classification Method: {data.provenance.classification_method}</span>
                        <span className="font-mono">{data.provenance.extraction_confidence}% Confidence</span>
                      </div>
                      <p className="text-[13px] text-slate-300 font-normal leading-relaxed">
                        Model tag: <span className="font-mono">{data.provenance.model_version}</span> • Never claims unverified AI confidence.
                      </p>
                    </div>

                    {/* Raw Payload Hash */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 uppercase block font-medium tracking-[0.5px] flex items-center gap-1">
                        <Hash className="w-3 h-3 text-emerald-500" /> Raw Input SHA-256 Hash
                      </span>
                      <div className="text-[11px] text-emerald-400 font-mono break-all font-medium">
                        {data.provenance.raw_payload_hash}
                      </div>
                    </div>

                    {/* Verification Officer Signoff */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[11px] text-slate-400 uppercase block font-medium tracking-[0.5px] flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-[#22D3EE]" /> Human Reviewer Signoff
                      </span>
                      <div className="text-slate-900 dark:text-slate-200 font-semibold text-xs">
                        {data.provenance.verified_by_name || 'Pending Reviewer Signoff'}
                      </div>
                      <div className="text-[13px] text-slate-400 font-normal">
                        Notes: {data.provenance.transformation_log || 'Raw data normalized and validated.'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-400 font-normal text-[13px]">
                    No explicit provenance record linked for this historical event.
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19] text-center">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black font-semibold text-[11px] uppercase tracking-[0.5px] shadow-glow-cyan cursor-pointer transition-all"
            >
              Close Provenance Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
