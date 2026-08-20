import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  MapPin,
  Shield,
  FileCheck2,
  ChevronRight,
  Eye,
  GitMerge,
  HelpCircle,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

export function FeedIntelligenceModal({ isOpen, onClose, onIngestionComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0); // 0 to 7
  const [batchResult, setBatchResult] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [duplicateResolving, setDuplicateResolving] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const pipelineStages = [
    { title: 'File Format Auto-Detection', desc: 'Zero-config MIME & structural classification' },
    { title: 'Text Extraction & OCR Engine', desc: 'Digital PDF stream / Tesseract OCR / Spreadsheet parser' },
    { title: 'AI Document Understanding', desc: 'Extracting FIR, contraband, dates, PII redaction' },
    { title: 'District & Locality Mapping', desc: 'Strict resolution across 38 Tamil Nadu districts' },
    { title: 'Duplicate & Burst Detection', desc: 'Spatial-temporal and semantic similarity scoring' },
    { title: 'SHA-256 Provenance Registration', desc: 'Cryptographic hash logging for verifiable audit' },
    { title: 'State Intelligence Recalculation', desc: 'Real-time update of risk zones, map & alerts' }
  ];

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    setErrorMsg(null);
    setBatchResult(null);
    setSelectedSignal(null);
    setPipelineStep(1);

    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
      formData.append('files', fileList[i]);
    }

    // Visual step progression simulator for high-fidelity command center experience
    const interval = setInterval(() => {
      setPipelineStep((prev) => (prev < 6 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await api.feedUniversalIntelligence(formData);
      clearInterval(interval);
      setPipelineStep(7);
      if (res.success) {
        setBatchResult(res.summary);
        if (onIngestionComplete) onIngestionComplete(res.summary);
      } else {
        setErrorMsg(res.message || 'Ingestion failed');
      }
    } catch (err) {
      clearInterval(interval);
      console.error('Universal feed upload error:', err);
      setErrorMsg(err.message || 'Failed to upload files to intelligence engine');
    } finally {
      setUploading(false);
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
      // Update local state
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

  const getFileIcon = (type = '') => {
    if (type.includes('SPREADSHEET') || type.includes('CSV') || type.includes('EXCEL')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    }
    if (type.includes('IMAGE') || type.includes('SCAN')) {
      return <ImageIcon className="w-5 h-5 text-purple-500" />;
    }
    return <FileText className="w-5 h-5 text-cyan-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn font-inter">
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#1E293B]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg font-space text-slate-900 dark:text-white uppercase tracking-tight">
                  FEED INTELLIGENCE
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/30">
                  AI UNIVERSAL INGESTION
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Zero-format automated ingestion • Multi-file batch OCR • Provenance hash-chain registration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Universal Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-[#22D3EE] bg-cyan-500/10 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 hover:border-[#22D3EE]/70 bg-slate-50/50 dark:bg-slate-900/40'
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

            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-4 rounded-2xl bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan animate-pulse">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 font-space uppercase tracking-tight">
                  DROP ANY INTELLIGENCE DOCUMENT OR DATA FILE HERE
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto">
                  Drag 1 file or 100 files simultaneously. NARVEX automatically detects format, runs OCR, extracts entities, maps districts, checks duplicates, and updates state intelligence.
                </p>
              </div>

              {/* Supported Format Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {['Excel (.xlsx, .xls)', 'CSV Data', 'Police FIR (PDF)', 'Written Complaint', 'Scanned Photo (OCR)', 'Word (.docx)', 'Text / Logs'].map((fmt, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Processing Animation & Pipeline Steps */}
          {uploading && (
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-cyan-500/30 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-5 h-5 text-[#22D3EE] animate-spin" />
                  <span className="font-semibold text-sm text-slate-900 dark:text-white font-space uppercase">
                    AI INGESTION PIPELINE EXECUTING...
                  </span>
                </div>
                <span className="text-xs font-mono text-[#22D3EE] font-bold">
                  STEP {pipelineStep} OF {pipelineStages.length}
                </span>
              </div>

              {/* Step checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                {pipelineStages.map((stage, idx) => {
                  const stepNum = idx + 1;
                  const isDone = pipelineStep > stepNum;
                  const isCurrent = pipelineStep === stepNum;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : isCurrent
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-glow-cyan'
                          : 'bg-slate-800/20 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px]">
                            {stepNum}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-xs truncate">{stage.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{stage.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Batch Summary & Results */}
          {batchResult && (
            <div className="space-y-5 animate-fadeIn">
              {/* Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-medium">FILES INGESTED</div>
                  <div className="text-2xl font-bold font-space text-slate-900 dark:text-white mt-1">
                    {batchResult.totalFiles}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="text-[11px] text-emerald-500 dark:text-emerald-400 uppercase font-medium">SIGNALS CREATED</div>
                  <div className="text-2xl font-bold font-space text-emerald-400 mt-1">
                    {batchResult.totalSignalsCreated}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="text-[11px] text-amber-500 dark:text-amber-400 uppercase font-medium">NEEDS REVIEW / DUPLICATES</div>
                  <div className="text-2xl font-bold font-space text-amber-400 mt-1">
                    {batchResult.needsReviewFiles}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <div className="text-[11px] text-cyan-500 dark:text-cyan-400 uppercase font-medium">STATE RISK SYNC</div>
                  <div className="text-sm font-bold font-space text-[#22D3EE] mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> RECALCULATED
                  </div>
                </div>
              </div>

              {/* Signals Generated Table / List */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/60">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                  <div className="font-semibold text-xs text-slate-900 dark:text-white uppercase font-space">
                    STRUCTURED INTELLIGENCE SIGNALS ({batchResult.createdSignals.length})
                  </div>
                  <span className="text-[11px] text-slate-400">Click any row to inspect provenance & audit</span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-60 overflow-y-auto">
                  {batchResult.createdSignals.map((sig, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedSignal(sig)}
                      className={`p-3 px-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-xs ${
                        selectedSignal?.signalId === sig.signalId ? 'bg-cyan-500/10 border-l-4 border-l-[#22D3EE]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-cyan-400 font-bold text-[11px]">{sig.eventCode}</span>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {sig.location} • <span className="text-slate-400">{sig.districtName}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate flex items-center gap-2">
                            <span>Category: {sig.category}</span>
                            <span>•</span>
                            <span>Severity: {sig.severity}</span>
                            {sig.isDuplicate && (
                              <span className="text-amber-400 font-bold">⚠ Duplicate ({sig.duplicateScore}%)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sig.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
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

              {/* Signal Detail / Provenance Drawer */}
              {selectedSignal && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-[#22D3EE]" />
                      <span className="font-semibold text-xs uppercase font-space text-slate-900 dark:text-white">
                        INTELLIGENCE SIGNAL PROVENANCE DOSSIER
                      </span>
                    </div>
                    <span className="font-mono text-xs text-cyan-400 font-bold">{selectedSignal.eventCode}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Source Origin</div>
                      <div className="font-medium text-slate-200 mt-0.5 truncate">{selectedSignal.provenance?.fileName}</div>
                      <div className="text-[10px] text-slate-400">Row/Page: {selectedSignal.provenance?.row || 'Page 1'}</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">SHA-256 Payload Hash</div>
                      <div className="font-mono text-cyan-300 mt-0.5 text-[11px] truncate">{selectedSignal.provenance?.hash}</div>
                      <div className="text-[10px] text-emerald-400">✓ Cryptographically Registered</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">AI Confidence & PII</div>
                      <div className="font-medium text-slate-200 mt-0.5">{selectedSignal.confidence}% Confidence</div>
                      <div className="text-[10px] text-slate-400">{selectedSignal.piiRedactedCount} PII elements redacted</div>
                    </div>
                  </div>

                  {/* Duplicate Resolution Banner if flagged */}
                  {selectedSignal.isDuplicate && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold text-xs text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          POSSIBLE DUPLICATE DETECTED ({selectedSignal.duplicateScore}% Similarity)
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          Matches spatial proximity and temporal window of an existing signal.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          disabled={duplicateResolving === selectedSignal.signalId}
                          onClick={() => handleDuplicateAction(selectedSignal.signalId, 'MERGE', 1)}
                          className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold cursor-pointer"
                        >
                          Merge Signal
                        </button>
                        <button
                          disabled={duplicateResolving === selectedSignal.signalId}
                          onClick={() => handleDuplicateAction(selectedSignal.signalId, 'KEEP_SEPARATE')}
                          className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium cursor-pointer"
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#1E293B]/50">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Authorized Law Enforcement & State Intelligence Directorate Access Only</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            {batchResult && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black text-xs font-semibold uppercase tracking-tight flex items-center gap-1.5 shadow-glow-cyan cursor-pointer transition-all"
              >
                <span>View on Intelligence Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
