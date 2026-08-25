import React, { useState } from 'react';
import { X, Shield, ShieldAlert, CheckCircle2, UserCheck, Eye, Sparkles, KeyRound, Search, ArrowRight } from 'lucide-react';
import { playClickSound, playHoverSound } from '../../utils/soundEffects';

export function DemoRolesModal({ isOpen, onClose, onSelectRole, seedAccounts }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Deduplicate or enrich role templates
  const rolePresets = [
    {
      roleKey: 'STATE_ADMIN',
      title: 'State Intelligence Admin',
      username: 'state_admin',
      password: 'Admin@123',
      clearance: 'LEVEL 5 - FULL SOVEREIGN ACCESS',
      badgeColor: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
      icon: Shield,
      description: 'Access to Statewide 3D/2D GIS Command Center, 38-District Risk Matrices, Cartel Link Graphs & Audit Ledger.'
    },
    {
      roleKey: 'DISTRICT_OFFICER',
      title: 'District Field Officer (Coimbatore HQ)',
      username: 'district_cbe',
      password: 'Admin@123',
      clearance: 'LEVEL 4 - DISTRICT TACTICAL',
      badgeColor: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
      icon: UserCheck,
      description: 'Tactical Surveillance Grid, ANPR Border Checkpost Telemetry, Local Seizure Logging & Patrol Directives.'
    },
    {
      roleKey: 'VERIFICATION_OFFICER',
      title: 'Verification & Verification Bureau',
      username: 'officer_chn',
      password: 'Admin@123',
      clearance: 'LEVEL 3 - EVIDENCE VERIFIER',
      badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
      icon: CheckCircle2,
      description: 'Citizen Tip Verification Queue, OCR FIR Document Processing & Tripartite Safeguard Score Calculation.'
    },
    {
      roleKey: 'CITIZEN_REPORTER',
      title: 'Citizen Community Analyst',
      username: 'analyst_priya',
      password: 'Admin@123',
      clearance: 'LEVEL 1 - PUBLIC INTEL',
      badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      icon: Eye,
      description: 'Anonymous Citizen Intelligence Reporting, Token Status Tracker & Community Signal Feeds.'
    }
  ];

  // Merge with any dynamic seed accounts if provided
  const combinedAccounts = seedAccounts && seedAccounts.length > 0 ? seedAccounts : rolePresets;

  const filteredPresets = rolePresets.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.roleKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-inter">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(34,211,238,0.25)] overflow-hidden animate-modal-pop">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white font-space tracking-wide uppercase">
                  Fast Demo Role Presets
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-[#22D3EE] border border-cyan-500/30">
                  ONE-CLICK LOGIN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Select an officer profile to immediately inspect role-based sovereign dashboards
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/30">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search roles by title, key, or username..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Preset Cards List */}
        <div className="p-5 sm:p-6 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {filteredPresets.map((preset) => {
            const Icon = preset.icon || Shield;
            return (
              <div
                key={preset.username}
                onMouseEnter={playHoverSound}
                onClick={() => {
                  playClickSound();
                  onSelectRole(preset);
                  onClose();
                }}
                className="group relative p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer shadow-md hover:shadow-glow-cyan flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-slate-950 text-[#22D3EE] border border-slate-800 group-hover:border-cyan-500/40 group-hover:scale-105 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-white group-hover:text-[#22D3EE] transition-colors">
                        {preset.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono border ${preset.badgeColor}`}>
                        {preset.clearance}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-normal leading-relaxed">{preset.description}</p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                      <span>
                        ID: <strong className="text-cyan-400">{preset.username}</strong>
                      </span>
                      <span>•</span>
                      <span>Password: <strong className="text-slate-300">Admin@123</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="shrink-0 px-4 py-2 rounded-xl bg-cyan-500/15 group-hover:bg-[#22D3EE] text-[#22D3EE] group-hover:text-black font-semibold text-xs border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider cursor-pointer"
                >
                  <span>Auto Fill & Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Zero Password Configuration • Instant SIH Demo Session</span>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
