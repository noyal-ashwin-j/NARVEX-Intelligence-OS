import React, { useState, useEffect } from 'react';
import { FileText, Printer, Shield, CheckCircle, AlertTriangle, X, Download } from 'lucide-react';

export default function GenerateBriefing({ districtId = null, onClose }) {
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState(null);

  useEffect(() => {
    const fetchBriefing = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/briefing/generate${districtId ? `?districtId=${districtId}` : ''}`);
        const data = await res.json();
        setBriefing(data);
      } catch (err) {
        console.error('Failed to load briefing:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBriefing();
  }, [districtId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:m-0 print:border-none print:shadow-none print:w-full print:max-h-full print:bg-white print:text-black">
        {/* Header (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">State Tactical Intelligence Briefing Dossier</h2>
              <p className="text-xs text-slate-400">DGP / ADGP Executive Decision-Support Summary</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-950/50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Briefing Document Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 print:p-0 print:space-y-4">
          {loading ? (
            <div className="py-24 text-center text-slate-500">Compiling executive intelligence dossier from live ledger...</div>
          ) : briefing ? (
            <div className="space-y-6">
              {/* Document Classification Header */}
              <div className="text-center border-b border-slate-800 pb-4 print:border-black">
                <div className="text-[10px] font-mono tracking-widest text-rose-400 font-bold uppercase print:text-red-700">
                  {briefing.briefingMetadata.classification}
                </div>
                <h1 className="text-xl font-extrabold text-white mt-1 print:text-black">
                  {briefing.briefingMetadata.title}
                </h1>
                <div className="text-xs text-slate-400 mt-1 print:text-gray-600">
                  Generated: {new Date(briefing.briefingMetadata.generatedAt).toLocaleString()} | Dossier ID: {briefing.briefingMetadata.briefingId}
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 print:bg-gray-50 print:border-gray-300">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 print:text-blue-800">
                  1. Executive Summary & Core Signals
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300 print:text-gray-800 list-disc list-inside">
                  {briefing.executiveSummary.keyFindings.map((finding, idx) => (
                    <li key={idx}>{finding}</li>
                  ))}
                </ul>
              </div>

              {/* What Changed Today */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black">
                  2. 24-Hour Telemetry Deltas (What Changed?)
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg print:border-gray-300">
                    <span className="text-slate-400">Newly Ingested Observations:</span>
                    <span className="font-bold text-white ml-2 print:text-black">{briefing.whatChangedToday.today?.newSignalsCount || 0} Records</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg print:border-gray-300">
                    <span className="text-slate-400">Velocity Surge Districts:</span>
                    <span className="font-bold text-rose-400 ml-2 print:text-red-700">{briefing.whatChangedToday.velocitySurges?.length || 0} Districts</span>
                  </div>
                </div>
              </div>

              {/* Priority District Matrix */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black">
                  3. Priority Attention Matrix (Top Districts by Signal Velocity)
                </h3>
                <div className="border border-slate-800 rounded-xl overflow-hidden print:border-gray-300">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 print:bg-gray-100 print:text-black print:border-gray-300">
                      <tr>
                        <th className="p-2.5">District</th>
                        <th className="p-2.5">Risk Level</th>
                        <th className="p-2.5">30D Velocity</th>
                        <th className="p-2.5">Conf %</th>
                        <th className="p-2.5">Coverage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 print:divide-gray-300 print:text-black">
                      {briefing.districtMatrix.map((d) => (
                        <tr key={d.id}>
                          <td className="p-2.5 font-semibold text-white print:text-black">{d.name}</td>
                          <td className="p-2.5">{d.risk_level}</td>
                          <td className="p-2.5 font-mono">{d.velocity_30d}x</td>
                          <td className="p-2.5 font-mono">{d.confidence_score}%</td>
                          <td className="p-2.5">{d.coverage_status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cryptographic SHA-256 Provenance Block */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-400 space-y-1 print:border-gray-300 print:text-gray-600">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Tamper-Proof Provenance Audit Block</span>
                </div>
                <div>Sequence #{briefing.briefingMetadata.provenanceAuditBlock.sequenceNumber} | SHA-256 Block Hash:</div>
                <div className="text-slate-500 break-all">{briefing.briefingMetadata.provenanceAuditBlock.sha256BlockHash}</div>
              </div>

              {/* Responsible AI Disclaimer */}
              <div className="text-[10px] text-slate-500 italic border-t border-slate-800 pt-3 print:text-gray-600 print:border-gray-300">
                {briefing.responsibleAiGovernance.disclaimer}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
