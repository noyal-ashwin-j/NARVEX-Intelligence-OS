import React, { useState } from 'react';
import { Share2, Copy, Check, Download, MapPin, ShieldAlert, FileText, X, ExternalLink } from 'lucide-react';
import { RiskBadge, CoverageBadge } from './Badge';

export function LocationDossierModal({ isOpen, onClose, district }) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !district) return null;

  const directUrl = `${window.location.origin}/?district=${district.id}&view=district-intel`;

  const dossierText = `=== NARC-INTEL (N-RISE) TACTICAL LOCATION DOSSIER ===
JURISDICTION: ${district.name} (${district.code})
HEADQUARTERS: ${district.headquarters || district.name}
COORDINATES: ${district.center_lat || '11.0168'}, ${district.center_lng || '76.9558'}
POPULATION BASELINE: ${Number(district.baseline_population || 0).toLocaleString()}

--- INTELLIGENCE STATUS ---
OBSERVED RISK LEVEL: ${district.risk_level}
EVIDENCE QUALITY: ${district.confidence_score}% Confidence
DATA COVERAGE: ${district.coverage_status}
ACTIVE ALERTS: ${district.active_alerts_count || 0}
EMERGING RISK ZONES: ${district.emerging_zones_count || 0}
VERIFIED SIGNALS: ${district.verified_events_count || 0}

--- MANDATORY SAFEGUARD ---
Notice: AI decision-support indicator. All field actions require authorized human officer verification.
TIMESTAMP: ${new Date().toISOString()}
DIRECT ACCESS LINK: ${directUrl}
=====================================================`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(dossierText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([dossierText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NARC_INTEL_DOSSIER_${district.code || district.name}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center font-inter text-xs">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0B0F19]/70 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[18px] font-space text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                Extract Location Dossier
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal">
                Export and share sanitized tactical intelligence brief
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location Metadata Preview */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 space-y-3 font-inter">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#22D3EE]" />
              <strong className="text-sm font-space text-slate-900 dark:text-slate-100">{district.name} <span className="font-mono text-slate-400">({district.code})</span></strong>
            </div>
            <div className="flex items-center gap-2">
              <RiskBadge level={district.risk_level} />
              <CoverageBadge coverage={district.coverage_status} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 text-slate-600 dark:text-slate-400 font-mono">
            <div>GPS: <strong className="text-slate-900 dark:text-slate-200">{district.center_lat}, {district.center_lng}</strong></div>
            <div>Confidence: <strong className="text-[#22D3EE]">{district.confidence_score}%</strong></div>
            <div>Alerts: <strong className="text-amber-500">{district.active_alerts_count || 0}</strong></div>
            <div>Verified: <strong className="text-emerald-500">{district.verified_events_count || 0}</strong></div>
          </div>
        </div>

        {/* Formatted Dossier Textbox */}
        <div className="space-y-1.5 font-mono">
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.5px] block font-inter">
            Generated Tactical Brief (Ready to Dispatch)
          </label>
          <textarea
            readOnly
            rows={7}
            value={dossierText}
            className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-slate-200 text-xs font-mono select-all focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black font-semibold text-[11px] uppercase tracking-[0.5px] shadow-glow-cyan cursor-pointer transition-all"
          >
            {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedText ? 'Brief Copied!' : 'Copy Brief'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-medium text-[11px] uppercase tracking-[0.5px] border border-slate-300 dark:border-slate-700 cursor-pointer transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-medium text-[11px] uppercase tracking-[0.5px] border border-slate-300 dark:border-slate-700 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download .TXT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
