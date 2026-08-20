import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Shield,
  Download,
  Info,
  Layers,
  Database,
  RefreshCw,
  Sparkles,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  GitMerge,
  Filter,
  Check,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export function DataIngestionPage({ onIngestionComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [batchResult, setBatchResult] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [signalFilter, setSignalFilter] = useState('ALL'); // ALL, VERIFIED, NEEDS_REVIEW, DUPLICATES
  const [duplicateResolving, setDuplicateResolving] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  const sampleTemplates = [
    {
      id: 'police',
      name: 'Police FIR & Seizure Log Template',
      desc: 'Standardized format for enforcement intercepts, narcotics quantities & charges.',
      content: `event_date,district_name,taluk_name,location_name,category,severity,source_department,description
2026-08-15,Coimbatore,Coimbatore North,Gandhipuram Cross Cut Road,SEIZURE_ENFORCEMENT,HIGH,State Police STF,Commercial consignment intercept containing synthetic stimulant tablets.
2026-08-16,Chennai,Egmore,Egmore Railway Goods Terminal,SEIZURE_ENFORCEMENT,HIGH,RPF & City Police,Seizure of unmanifested parcel crates containing prescription narcotics.`
    },
    {
      id: 'checkpost',
      name: 'Checkpost & Toll Telemetry Template',
      desc: 'Highway checkposts, vehicle border scans, and transit waypoint data.',
      content: `event_date,district_name,checkpost_name,border_type,transport_mode,contraband_type,description
2026-08-14,Krishnagiri,Zuzuvadi Interstate Checkpost,INTER_STATE,ROAD_HIGHWAY,Synthetic Pills,Vehicle inspection flagged suspicious hidden floor compartment.
2026-08-16,Coimbatore,Walayar Border Toll Post,INTER_STATE,ROAD_HIGHWAY,Commercial Ganja,Heavy goods carrier detained during routine automated weight scan.`
    },
    {
      id: 'hospital',
      name: 'Hospital / De-Addiction Registry Template',
      desc: 'Healthcare aggregate admission numbers (strictly non-individual/anonymized).',
      content: `report_date,district_name,hospital_name,patient_age_group,primary_substance,intake_count,description
2026-08-10,Coimbatore,Coimbatore Medical College Hospital,18-25,SYNTHETIC_MDMA,7,Aggregate admissions flagged for acute synthetic stimulant intoxication.
2026-08-12,Chennai,Kilpauk Institute of Mental Health,19-28,PRESCRIPTION_OPIOIDS,12,Spike in weekly voluntary counseling and withdrawal admissions.`
    }
  ];

  const handleDownloadTemplate = (template) => {
    const blob = new Blob([template.content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.id}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setLoading(true);
    setBatchResult(null);
    setSelectedSignal(null);
    setPipelineStep(1);

    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
      formData.append('files', fileList[i]);
    }

    const interval = setInterval(() => {
      setPipelineStep((prev) => (prev < 6 ? prev + 1 : prev));
    }, 400);

    try {
      const res = await api.feedUniversalIntelligence(formData);
      clearInterval(interval);
      setPipelineStep(7);
      if (res.success) {
        setBatchResult(res.summary);
        if (onIngestionComplete) onIngestionComplete(res.summary);
      } else {
        alert(res.message || 'Ingestion error');
      }
    } catch (err) {
      clearInterval(interval);
      console.error('Universal feed error:', err);
      alert(`Ingestion failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDuplicateAction = async (signalId, action, mergeTargetId = null) => {
    setDuplicateResolving(signalId);
    try {
      await api.resolveDuplicateSignal(signalId, { action, mergeIntoEventId: mergeTargetId });
      setBatchResult((prev) => {
        if (!prev) return prev;
        const updatedSignals = prev.createdSignals.map((s) => {
          if (s.signalId === signalId) {
            return {
              ...s,
              isDuplicate: false,
              verificationStatus: action === 'MERGE' ? 'MERGED' : 'VERIFIED'
            };
          }
          return s;
        });
        return { ...prev, createdSignals: updatedSignals };
      });
      if (selectedSignal?.signalId === signalId) {
        setSelectedSignal((prev) => ({
          ...prev,
          isDuplicate: false,
          verificationStatus: action === 'MERGE' ? 'MERGED' : 'VERIFIED'
        }));
      }
    } catch (err) {
      alert(`Duplicate resolution error: ${err.message}`);
    } finally {
      setDuplicateResolving(null);
    }
  };

  const filteredSignals = (batchResult?.createdSignals || []).filter((sig) => {
    if (signalFilter === 'VERIFIED' && sig.verificationStatus !== 'VERIFIED') return false;
    if (signalFilter === 'NEEDS_REVIEW' && sig.verificationStatus !== 'NEEDS_VERIFICATION') return false;
    if (signalFilter === 'DUPLICATES' && !sig.isDuplicate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        sig.eventCode.toLowerCase().includes(q) ||
        sig.location.toLowerCase().includes(q) ||
        sig.districtName.toLowerCase().includes(q) ||
        sig.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-inter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight font-space">
              Universal Intelligence Feed & AI Ingestion
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-cyan-500/20 text-[#22D3EE] border border-cyan-500/30">
              ZERO-FORMAT INGESTION
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Drop any authorized file (Excel, CSV, PDF FIR, Written Complaint, Scanned Image OCR, Word DOCX) to automatically generate structured state intelligence signals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black text-xs font-semibold uppercase tracking-tight flex items-center gap-2 shadow-glow-cyan cursor-pointer transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>+ FEED INTELLIGENCE</span>
          </button>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Main Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-[#22D3EE] bg-cyan-500/10 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-[#22D3EE]/70 bg-white dark:bg-slate-900/50 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          accept=".csv,.xlsx,.xls,.pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.webp"
        />

        <div className="flex flex-col items-center justify-center gap-4">
          <div className="p-4 rounded-2xl bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan">
            <UploadCloud className="w-10 h-10" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 font-space uppercase tracking-tight">
              DROP ANY INTELLIGENCE FILE OR BATCH HERE
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto">
              Drop 1 file or 100 files at once. System automatically detects format, extracts entities, maps districts, checks duplicates, logs SHA-256 provenance, and updates state risk models.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
            {['Excel (.xlsx, .xls)', 'CSV Data', 'Police FIR (PDF)', 'Written Complaints', 'Scanned Photos (OCR)', 'Word Docs (.docx)', 'Text Logs'].map((fmt, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Ingestion Progress */}
      {loading && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-cyan-500/40 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-[#22D3EE] animate-spin" />
              <div>
                <h4 className="font-semibold text-sm font-space uppercase text-slate-900 dark:text-white">
                  UNIVERSAL INGESTION PIPELINE RUNNING...
                </h4>
                <p className="text-xs text-slate-400">Processing documents through multi-engine AI extraction</p>
              </div>
            </div>
            <span className="font-mono text-sm font-bold text-[#22D3EE]">STEP {pipelineStep} / 7</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#22D3EE] h-full transition-all duration-300 shadow-glow-cyan"
              style={{ width: `${(pipelineStep / 7) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Batch Ingestion Summary & Signal Grid */}
      {batchResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">TOTAL FILES INGESTED</div>
              <div className="text-2xl font-bold font-space text-slate-900 dark:text-white mt-1">
                {batchResult.totalFiles}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-xs text-emerald-500 dark:text-emerald-400 uppercase font-medium">SIGNALS GENERATED</div>
              <div className="text-2xl font-bold font-space text-emerald-400 mt-1">
                {batchResult.totalSignalsCreated}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="text-xs text-amber-500 dark:text-amber-400 uppercase font-medium">NEEDS VERIFICATION / DUPLICATES</div>
              <div className="text-2xl font-bold font-space text-amber-400 mt-1">
                {batchResult.needsReviewFiles}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <div className="text-xs text-cyan-500 dark:text-cyan-400 uppercase font-medium">STATE RISK SYNC</div>
              <div className="text-sm font-bold font-space text-[#22D3EE] mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> UPDATED & RECALCULATED
              </div>
            </div>
          </div>

          {/* Signals Table with Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-xs font-space uppercase text-slate-900 dark:text-white">
                  GENERATED SIGNALS ({filteredSignals.length})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search location, code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-medium">
                  {['ALL', 'VERIFIED', 'NEEDS_REVIEW', 'DUPLICATES'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setSignalFilter(f)}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        signalFilter === f
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {f.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-96 overflow-y-auto">
              {filteredSignals.map((sig, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSignal(sig)}
                  className={`p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-xs ${
                    selectedSignal?.signalId === sig.signalId ? 'bg-cyan-500/10 border-l-4 border-l-[#22D3EE]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-cyan-400 font-bold text-xs">{sig.eventCode}</span>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {sig.location} • <span className="text-slate-400">{sig.districtName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5">
                        <span>Category: {sig.category}</span>
                        <span>•</span>
                        <span>Severity: {sig.severity}</span>
                        {sig.isDuplicate && (
                          <span className="text-amber-400 font-bold">⚠ Duplicate ({sig.duplicateScore}%)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        sig.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {sig.verificationStatus}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Provenance Dossier when row clicked */}
          {selectedSignal && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-5 h-5 text-[#22D3EE]" />
                  <span className="font-semibold text-sm uppercase font-space text-slate-900 dark:text-white">
                    PROVENANCE & AUDIT DOSSIER
                  </span>
                </div>
                <span className="font-mono text-xs text-cyan-400 font-bold">{selectedSignal.eventCode}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Source Document</div>
                  <div className="font-medium text-slate-900 dark:text-slate-100 mt-1 truncate">{selectedSignal.provenance?.fileName}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Location: {selectedSignal.provenance?.row || 'Page 1'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">SHA-256 Hash</div>
                  <div className="font-mono text-cyan-400 mt-1 text-[11px] truncate">{selectedSignal.provenance?.hash}</div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">✓ Cryptographic Trail Recorded</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Confidence & Privacy</div>
                  <div className="font-medium text-slate-900 dark:text-slate-100 mt-1">{selectedSignal.confidence}% Extraction Confidence</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{selectedSignal.piiRedactedCount} PII elements sanitized</div>
                </div>
              </div>

              {/* Duplicate Action Banner */}
              {selectedSignal.isDuplicate && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-xs text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      SIMILAR EXISTING SIGNAL DETECTED ({selectedSignal.duplicateScore}% Match)
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Matched spatial vicinity and time window. Choose whether to merge into the existing master event or confirm as a separate signal.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      disabled={duplicateResolving === selectedSignal.signalId}
                      onClick={() => handleDuplicateAction(selectedSignal.signalId, 'MERGE', 1)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold cursor-pointer"
                    >
                      Merge Signal
                    </button>
                    <button
                      disabled={duplicateResolving === selectedSignal.signalId}
                      onClick={() => handleDuplicateAction(selectedSignal.signalId, 'KEEP_SEPARATE')}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium cursor-pointer"
                    >
                      Keep Separate
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Standardized Format Templates */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white uppercase tracking-tight font-space">
          Pre-Formatted Ingestion Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase font-space">
                  <FileSpreadsheet className="w-4 h-4" />
                  {tpl.name}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{tpl.desc}</p>
              </div>
              <button
                onClick={() => handleDownloadTemplate(tpl)}
                className="mt-4 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample CSV</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
