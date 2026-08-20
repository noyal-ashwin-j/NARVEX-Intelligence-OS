import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Copy,
  ArrowRight,
  ShieldAlert,
  Clock,
  Filter,
  Lock,
  PlusCircle,
  X,
  Phone,
  MessageSquare,
  Mail,
  Globe,
  Radio
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/Badge';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export function VerificationQueuePage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState(null);

  // Triage modal state
  const [triageStatus, setTriageStatus] = useState('CORROBORATING');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [promoteToEvent, setPromoteToEvent] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Simulate multichannel submission modal
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simChannel, setSimChannel] = useState('PHONE_IVR_1058');
  const [simDistrict, setSimDistrict] = useState('2');
  const [simLocation, setSimLocation] = useState('Gandhipuram Bus Stand Highway Bypass');
  const [simText, setSimText] = useState('Caller reported suspicious nighttime parcel exchanges between two vans near bypass overbridge.');
  const [simLoading, setSimLoading] = useState(false);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await api.getVerificationQueue({
        status: statusFilter,
        intakeChannel: channelFilter !== 'ALL' ? channelFilter : undefined
      });
      if (res.success) {
        setReports(res.reports || []);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Queue load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [statusFilter, channelFilter]);

  const handleOpenTriage = (report) => {
    setSelectedReport(report);
    setTriageStatus(report.status === 'RECEIVED' ? 'UNDER_REVIEW' : 'CORROBORATING');
    setReviewerNotes(report.reviewer_notes || '');
    setPromoteToEvent(true);
  };

  const handleExecuteTriage = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setSubmitting(true);
    try {
      const res = await api.triageCitizenReport(selectedReport.id, {
        newStatus: triageStatus,
        reviewerNotes,
        promoteToEvent
      });
      if (res.success) {
        setSelectedReport(null);
        loadQueue();
      }
    } catch (err) {
      alert(`Triage failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateIntake = async (e) => {
    e.preventDefault();
    setSimLoading(true);
    try {
      const res = await api.submitCitizenReport({
        approximateDistrictId: simDistrict,
        approximateLocation: simLocation,
        description: simText,
        intakeChannel: simChannel,
        categoryId: '4'
      });
      if (res.success) {
        setShowSimulateModal(false);
        loadQueue();
        alert(`Signal registered via ${simChannel}! Tracking Token: ${res.trackingToken}`);
      }
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setSimLoading(false);
    }
  };

  const getChannelBadge = (channel) => {
    switch (channel) {
      case 'PHONE_IVR_1058':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium font-inter uppercase tracking-[0.5px] bg-blue-500/10 text-blue-500 border border-blue-500/30">
            <Phone className="w-3 h-3 text-blue-500" /> Helpline 1058 (IVR Call)
          </span>
        );
      case 'WHATSAPP_BOT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium font-inter uppercase tracking-[0.5px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            <MessageSquare className="w-3 h-3 text-emerald-500" /> WhatsApp Tip Bot
          </span>
        );
      case 'ENCRYPTED_EMAIL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium font-inter uppercase tracking-[0.5px] bg-purple-500/10 text-[#A855F7] border border-purple-500/30">
            <Mail className="w-3 h-3 text-purple-400" /> Encrypted Email
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium font-inter uppercase tracking-[0.5px] bg-cyan-500/10 text-[#22D3EE] border border-cyan-500/30">
            <Globe className="w-3 h-3 text-[#22D3EE]" /> Web Anonymous Portal
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 font-inter text-xs">
      <DisclaimerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2 font-space">
            <UserCheck className="w-5 h-5 text-[#22D3EE]" />
            Omnichannel Intelligence Verification & Triage Queue
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            Incoming multi-source citizen observations (Web, Phone Helpline 1058, WhatsApp, Secure Email) awaiting analyst review.
          </p>
        </div>

        {/* Action: Simulate Incoming Signal */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black font-semibold text-xs shadow-glow-cyan uppercase tracking-[0.5px] cursor-pointer transition-all"
          >
            <Radio className="w-4 h-4" />
            <span>Simulate Incoming Signal</span>
          </button>
        </div>
      </div>

      {/* 1. Multi-Channel Intake Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Intake Channel Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-[11px] uppercase tracking-[0.5px]">
            <span className="text-slate-400 font-medium">Channel:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-transparent border-0 text-slate-900 dark:text-slate-100 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Intake Channels</option>
              <option value="WEB_PORTAL">🌐 Web Anonymous Portal</option>
              <option value="PHONE_IVR_1058">📞 Helpline 1058 (IVR Call)</option>
              <option value="WHATSAPP_BOT">💬 WhatsApp Tip Line</option>
              <option value="ENCRYPTED_EMAIL">✉️ Encrypted Email Gateway</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-[11px] uppercase tracking-[0.5px]">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 text-slate-900 dark:text-slate-100 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses ({total})</option>
              <option value="RECEIVED">Received (Unreviewed)</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="CORROBORATING">Corroborating</option>
              <option value="REFERRED_FOR_PREVENTION">Referred for Prevention</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-mono font-medium text-[#22D3EE]">
          Showing {reports.length} Queued Records
        </span>
      </div>

      {/* 2. Reports List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs animate-pulse">
            Scanning verification queue...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-slate-400 font-medium">
            No signals in queue matching the selected filter.
          </div>
        ) : (
          reports.map((rep) => {
            const hasRedFlags = rep.redFlags && rep.redFlags.length > 0;

            return (
              <div
                key={rep.id}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border space-y-3.5 shadow-sm transition-all ${
                  hasRedFlags
                    ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-extrabold text-sm text-blue-600">{rep.report_code}</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                      Token: {rep.tracking_token}
                    </span>
                    {getChannelBadge(rep.intake_channel)}
                    <StatusBadge status={rep.status} />
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
                    <span>District: <strong className="text-slate-900 dark:text-slate-100">{rep.district_name}</strong></span>
                    <span>Date: {rep.report_date}</span>
                  </div>
                </div>

                {/* Red Flag Warning */}
                {hasRedFlags && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs space-y-1 font-medium">
                    <div className="flex items-center gap-1.5 font-bold uppercase text-amber-900 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      Automated Quality Flags Detected:
                    </div>
                    {rep.redFlags.map((rf, idx) => (
                      <div key={idx} className="pl-5 text-slate-800 dark:text-slate-200 text-xs">
                        • <strong className="text-amber-900 dark:text-amber-300">{rf.flagType}:</strong> {rf.reason}
                      </div>
                    ))}
                  </div>
                )}

                {/* Content & Location */}
                <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 font-bold uppercase">
                    Approximate Area: {rep.approximate_location} ({rep.category_name})
                  </div>
                  <p className="mt-1 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {rep.redacted_content}
                  </p>
                </div>

                {/* Reviewer Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500 font-medium">
                    Corroboration Confidence: <strong className="text-blue-600 font-bold">{rep.confidence_score}%</strong>
                  </span>

                  <button
                    onClick={() => handleOpenTriage(rep)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Review & Triage Signal</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Triage Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div
            onClick={() => setSelectedReport(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 z-10 animate-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase">
                  Analyst Signal Triage: {selectedReport.report_code}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Token: {selectedReport.tracking_token} • {selectedReport.district_name}
                </span>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTriage} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1.5 uppercase">
                  Target Verification Lifecycle Stage
                </label>
                <select
                  value={triageStatus}
                  onChange={(e) => setTriageStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="UNDER_REVIEW">UNDER REVIEW (Triage Ongoing)</option>
                  <option value="CORROBORATING">CORROBORATING (Matched with Telemetry)</option>
                  <option value="REFERRED_FOR_PREVENTION">REFERRED FOR PREVENTIVE ACTION</option>
                  <option value="CLOSED">CLOSED / DISMISSED</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1.5 uppercase">
                  Analyst Operational Verification Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Record verification methodology, checkpost corroboration, or reason for status update..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* Checkbox to promote to full intelligence event */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30 cursor-pointer shadow-sm">
                <input
                  type="checkbox"
                  checked={promoteToEvent}
                  onChange={(e) => setPromoteToEvent(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 mt-0.5"
                />
                <div>
                  <span className="text-blue-900 dark:text-blue-200 font-extrabold block">
                    Promote Signal to Official Intelligence Ledger
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                    Generates permanent Provenance record and updates spatial risk clustering metrics.
                  </p>
                </div>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Applying Decision...' : 'Commit Verification Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Multichannel Simulator Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div
            onClick={() => setShowSimulateModal(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 z-10 font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 uppercase">
                  Simulate Multi-Channel Reception
                </h3>
              </div>
              <button onClick={() => setShowSimulateModal(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimulateIntake} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1.5 uppercase">
                  Select Reception Channel
                </label>
                <select
                  value={simChannel}
                  onChange={(e) => setSimChannel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold"
                >
                  <option value="PHONE_IVR_1058">📞 Voice Helpline 1058 (IVR Call Recording)</option>
                  <option value="WHATSAPP_BOT">💬 Encrypted WhatsApp Tip Line (+91 94981 10580)</option>
                  <option value="ENCRYPTED_EMAIL">✉️ Encrypted Intelligence Email (tips.narcotics@tn.gov.in)</option>
                  <option value="WEB_PORTAL">🌐 Public Web Anonymous Form</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1.5 uppercase">
                  Target District & Location
                </label>
                <input
                  type="text"
                  required
                  value={simLocation}
                  onChange={(e) => setSimLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1.5 uppercase">
                  Raw Signal Description (Includes Test PII)
                </label>
                <textarea
                  rows={3}
                  required
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={simLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-50"
                >
                  {simLoading ? 'Transmitting...' : 'Ingest Simulated Signal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
