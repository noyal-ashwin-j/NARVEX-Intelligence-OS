import React, { useState, useEffect } from 'react';
import {
  Shield,
  Send,
  Mic,
  Copy,
  Check,
  Lock,
  Phone,
  MessageSquare,
  QrCode,
  ChevronRight,
  MapPin,
  Tag,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

export function CitizenReportingPage({ onTrackToken }) {
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [language, setLanguage] = useState('EN'); // EN or TA
  const [formData, setFormData] = useState({
    approximateDistrictId: '2',
    approximateLocation: '',
    categoryId: '4',
    description: '',
    audioTranscript: ''
  });

  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

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
        console.error('Error loading metadata:', err);
      }
    }
    loadMeta();
  }, []);

  const handleVoiceSimulate = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const voiceSample = language === 'TA'
        ? '[குரல் பதிவு] இரவு நேரங்களில் பாலத்திற்கு அருகில் சந்தேகத்திற்கிடமான வாகனங்கள் கூடுகின்றன.'
        : '[Voice Note] Late-night suspicious cargo drops observed near the bypass terminal.';
      setFormData((prev) => ({
        ...prev,
        description: prev.description ? `${prev.description}\n${voiceSample}` : voiceSample
      }));
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.approximateLocation || !formData.description) return;

    setLoading(true);
    try {
      const res = await api.submitCitizenReport(formData);
      if (res.success) {
        setResult(res);
      }
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const publicShareUrl = `${window.location.origin}/?view=report`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  const copyToken = () => {
    if (result?.trackingToken) {
      navigator.clipboard.writeText(result.trackingToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12 font-sans text-slate-900 dark:text-slate-100">
      {/* 1. Thin Quiet Banner Strip */}
      <div className="py-2 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Anonymous Tip Gateway • Automatic PII Redaction Active</span>
        </div>
        <span className="text-[11px] text-slate-500">Tamil Nadu</span>
      </div>

      {/* 2. Compact Helplines Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-blue-600" />
          <span>Helpline:</span>
          <a href="tel:1058" className="font-bold text-blue-600 hover:underline">1058 (24x7)</a>
        </div>

        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp:</span>
          <a href="https://wa.me/919498110580" target="_blank" rel="noreferrer" className="font-bold text-emerald-600 hover:underline">+91 94981 10580</a>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyShareLink}
            className="text-blue-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            {copiedShareLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedShareLink ? 'Copied' : 'Share Link'}</span>
          </button>

          <button
            onClick={() => setShowQRModal(true)}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            title="QR Code"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Title & Language Selector */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Report an Anonymous Concern
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Zero identity collection. No personal names, phone numbers, or passwords required.
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLanguage('EN')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              language === 'EN' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('TA')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              language === 'TA' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500'
            }`}
          >
            தமிழ்
          </button>
        </div>
      </div>

      {result ? (
        /* Success Screen */
        <div className="p-6 sm:p-8 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Concern Registered Anonymously
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your observation has been encrypted and queued for state preventive verification.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-w-sm mx-auto space-y-2">
            <span className="text-xs text-slate-500 block font-medium">Your Anonymous Tracking Token</span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-extrabold text-blue-600 tracking-wider">
                {result.trackingToken}
              </span>
              <button
                onClick={copyToken}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                title="Copy Token"
              >
                {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[11px] text-slate-400 block">Save this token to track progress.</span>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => onTrackToken && onTrackToken(result.trackingToken)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Track Status Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setResult(null);
                setFormData({ approximateDistrictId: '2', approximateLocation: '', categoryId: '4', description: '', audioTranscript: '' });
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
            >
              Submit Another
            </button>
          </div>
        </div>
      ) : (
        /* 4. The Form (Primary Visual Focus) */
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target District */}
            <div className="space-y-1.5">
              <label className="text-slate-600 dark:text-slate-400 font-medium block">
                Target District
              </label>
              <select
                value={formData.approximateDistrictId}
                onChange={(e) => setFormData({ ...formData, approximateDistrictId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Concern Category */}
            <div className="space-y-1.5">
              <label className="text-slate-600 dark:text-slate-400 font-medium block">
                Concern Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Approximate Landmark */}
          <div className="space-y-1.5">
            <label className="text-slate-600 dark:text-slate-400 font-medium block">
              Approximate Landmark / Area
            </label>
            <input
              type="text"
              required
              value={formData.approximateLocation}
              onChange={(e) => setFormData({ ...formData, approximateLocation: e.target.value })}
              placeholder="e.g. Near town bus stand bypass road, student hostel area"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Observations & Details */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-600 dark:text-slate-400 font-medium block">
                Observations & Details
              </label>
              <button
                type="button"
                onClick={handleVoiceSimulate}
                disabled={isRecording}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                <Mic className={`w-3.5 h-3.5 ${isRecording ? 'text-red-600 animate-ping' : ''}`} />
                <span>{isRecording ? 'Listening...' : 'Voice Note'}</span>
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={
                language === 'TA'
                  ? 'சந்தேகத்திற்கிடமான நடமாட்டங்கள், நேரம், அல்லது இட விபரங்களை இங்கே உள்ளிடவும்...'
                  : 'Describe vehicle patterns, times, or neighborhood concerns without mentioning innocent individuals...'
              }
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-medium leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Submitting...' : 'Submit Anonymous Report'}</span>
          </button>
        </form>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div onClick={() => setShowQRModal(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-3 z-10">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Scan to Report
            </h3>
            <p className="text-xs text-slate-500">Scan with any mobile camera to open anonymous form.</p>
            <div className="p-3 bg-white border border-slate-200 rounded-xl max-w-[150px] mx-auto shadow-sm">
              <QrCode className="w-32 h-32 mx-auto text-slate-900" />
            </div>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
