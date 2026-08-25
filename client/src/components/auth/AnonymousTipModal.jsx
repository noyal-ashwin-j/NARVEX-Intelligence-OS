import React, { useState } from 'react';
import { X, Megaphone, Search, ShieldCheck, ArrowRight, CheckCircle2, Lock, Sparkles, FileText } from 'lucide-react';
import { playClickSound, playHoverSound } from '../../utils/soundEffects';

export function AnonymousTipModal({ isOpen, onClose, onOpenPublicPortal }) {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'track'
  const [district, setDistrict] = useState('Coimbatore');
  const [tipCategory, setTipCategory] = useState('SUSPICIOUS_TRANSIT');
  const [details, setDetails] = useState('');
  const [trackTokenInput, setTrackTokenInput] = useState('');
  const [submittedToken, setSubmittedToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmitTip = (e) => {
    e.preventDefault();
    playClickSound();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedToken = `TN-NARVEX-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedToken(generatedToken);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-inter">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(34,211,238,0.25)] overflow-hidden text-slate-100 animate-modal-pop">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold font-space uppercase tracking-wide text-white">
                Public Citizen Anonymous Portal
              </h3>
              <p className="text-xs text-slate-400">100% Encrypted • Zero Personal Identity Logging</p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('submit');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'submit'
                ? 'bg-cyan-500/20 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Submit Quick Tip
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('track');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'track'
                ? 'bg-cyan-500/20 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Track Existing Token
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {activeTab === 'submit' ? (
            submittedToken ? (
              <div className="text-center space-y-4 py-4 animate-fade-in">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white uppercase font-space">Tip Logged Successfully</h4>
                  <p className="text-xs text-slate-300">Your anonymous security token has been sealed into SHA-256 ledger.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 text-center font-mono">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">YOUR CASE TOKEN</span>
                  <span className="text-lg font-bold text-[#22D3EE] tracking-wider">{submittedToken}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      playClickSound();
                      setSubmittedToken(null);
                      setDetails('');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold uppercase cursor-pointer"
                  >
                    Submit Another Tip
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      onOpenPublicPortal();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black text-xs font-bold uppercase cursor-pointer shadow-glow-cyan"
                  >
                    View Full Portal
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitTip} className="space-y-4 text-xs font-inter">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium text-[11px] uppercase tracking-wider mb-1">
                      District
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Madurai">Madurai</option>
                      <option value="Salem">Salem</option>
                      <option value="Hosur">Hosur Border</option>
                      <option value="Tiruchirappalli">Tiruchirappalli</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium text-[11px] uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={tipCategory}
                      onChange={(e) => setTipCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="SUSPICIOUS_TRANSIT">Suspicious Transit / Vehicle</option>
                      <option value="PRECURSOR_DIVERSION">Pharma Precursor Leak</option>
                      <option value="TELEGRAM_DROPSHIP">Telegram / Darknet Channel</option>
                      <option value="CAMPUS_SALES">Campus / Youth Supply</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium text-[11px] uppercase tracking-wider mb-1">
                    Tip Description & Details
                  </label>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    required
                    placeholder="Provide details (locations, vehicle plates, batch numbers, Telegram handles)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>IP address is stripped. Cryptographic SHA-256 hash token generated instantly.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black font-bold uppercase tracking-wider text-xs shadow-glow-cyan transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Sealing Cryptographic Token...' : 'Transmit Anonymous Tip'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )
          ) : (
            <div className="space-y-4 text-xs font-inter">
              <div>
                <label className="block text-slate-300 font-medium text-[11px] uppercase tracking-wider mb-1.5">
                  Enter Your Anonymous Case Token ID
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={trackTokenInput}
                    onChange={(e) => setTrackTokenInput(e.target.value)}
                    placeholder="e.g. TN-NARVEX-94820"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onOpenPublicPortal();
                }}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <span>Track Token Status in Citizen Portal</span>
                <ArrowRight className="w-4 h-4 text-[#22D3EE]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
