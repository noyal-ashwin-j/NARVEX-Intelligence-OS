import React, { useState } from 'react';
import { Search, ShieldCheck, CheckCircle2, Clock, ArrowRight, Lock, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export function CitizenTrackingPage({ initialToken = '' }) {
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportStatus, setReportStatus] = useState(null);

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.trackCitizenReport(token);
      if (res.success) {
        setReportStatus(res.reportStatus);
      } else {
        setError(res.message || 'Tracking token not found.');
        setReportStatus(null);
      }
    } catch (err) {
      setError(err.message || 'Token not found.');
      setReportStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { key: 'RECEIVED', label: '1. Received', desc: 'Securely logged in repository' },
    { key: 'UNDER_REVIEW', label: '2. Under Review', desc: 'Triage by verification analyst' },
    { key: 'CORROBORATED', label: '3. Corroboration', desc: 'Cross-checked with telemetry' },
    { key: 'REFERRED', label: '4. Referred', desc: 'Assigned for preventive action' },
    { key: 'CLOSED', label: '5. Completed', desc: 'Monitoring active or closed' }
  ];

  const getStageIndex = (stage) => {
    switch (stage) {
      case 'RECEIVED': return 0;
      case 'UNDER_REVIEW': return 1;
      case 'CORROBORATED': return 2;
      case 'REFERRED': return 3;
      case 'CLOSED': return 4;
      default: return 0;
    }
  };

  const currentStageIdx = reportStatus ? getStageIndex(reportStatus.current_stage) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 font-sans">
      <DisclaimerBanner />

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100 uppercase tracking-tight">
          Anonymous Token Status Verification
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Track the lifecycle of your reported signal securely without exposing any confidential officer actions.
        </p>
      </div>

      {/* Search Token Input */}
      <form onSubmit={handleLookup} className="command-card p-4 flex gap-2 shadow-sm">
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter Token (e.g. TN-7X9K-42PQ)"
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-blue-700 dark:text-cyan-400 font-mono font-bold tracking-wider placeholder-slate-400 uppercase text-xs focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/30 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          {loading ? 'Verifying...' : 'Check Status'}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Status Progress Display */}
      {reportStatus && (
        <div className="command-card p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2 font-mono">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase block font-bold">Tracking Token</span>
              <span className="text-xl font-black text-blue-700 dark:text-cyan-400">{reportStatus.token_code}</span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase block font-bold">Date Logged</span>
              <span className="text-slate-800 dark:text-slate-300 font-bold">{reportStatus.report_date}</span>
            </div>
          </div>

          {/* Stepper Progression */}
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase block font-mono">
              Intelligence Lifecycle Progression
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {stages.map((stg, idx) => {
                const isPassed = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;

                return (
                  <div
                    key={stg.key}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      isCurrent
                        ? 'bg-blue-50 dark:bg-cyan-950/40 border-blue-400 dark:border-cyan-500 text-blue-900 dark:text-cyan-300 shadow-sm'
                        : isPassed
                        ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300'
                        : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-900 text-slate-400 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs font-mono">{stg.label}</span>
                        {isPassed && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight font-sans font-medium">{stg.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Public Status Message Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-inner">
            <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block font-mono">
              Official Intelligence Desk Response
            </span>
            <p className="text-sm font-sans text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
              "{reportStatus.public_status_message}"
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400 block pt-1 font-sans font-medium">
              Location reference: {reportStatus.district_name} ({reportStatus.approximate_location})
            </span>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 text-xs text-emerald-950 dark:text-slate-400 flex items-center gap-2 font-medium">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>To protect public operations, confidential officer deployment notes are not displayed here.</span>
          </div>
        </div>
      )}
    </div>
  );
}
