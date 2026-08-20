import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, AlertCircle, ArrowRight, CheckCircle2, Database, Megaphone, Phone, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function LoginPage({ onLoginSuccess, onOpenPublicPortal }) {
  const { login, error } = useAuth();

  const [username, setUsername] = useState('state_admin');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [seedAccounts, setSeedAccounts] = useState([]);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await api.getSeedAccounts();
        if (res.success) setSeedAccounts(res.accounts || []);
      } catch {
        // ignore
      }
    }
    loadAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setLocalError(res.message || 'Authentication failed.');
    }
  };

  const handleSelectDemoUser = (userAcc) => {
    setUsername(userAcc.username);
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0B0F19] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-inter text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold font-space tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              NARC-INTEL <span className="text-[#22D3EE]">N-RISE</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">
              Statewide Narcotic Intelligence & Preventive Risk Monitoring Platform
            </p>
          </div>
        </div>

        {/* Public Hotline Strip */}
        <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
          <a
            href="tel:1058"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111827] border border-cyan-500/30 text-cyan-600 dark:text-[#22D3EE] font-medium hover:bg-cyan-500/10 transition-colors"
          >
            <Phone className="w-4 h-4 text-[#22D3EE]" />
            <span>HELPLINE: 1058 (24x7)</span>
          </a>
        </div>
      </div>

      {/* Center Container with Officer Login + Public Citizen Box */}
      <div className="w-full max-w-md mx-auto my-8 z-10 space-y-4">
        {/* PUBLIC CITIZEN TIP PORTAL CARD (NO LOGIN REQUIRED) */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-lg border border-cyan-500/30 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-[#22D3EE]">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm uppercase font-space tracking-wide">
                  Public Citizen Anonymous Portal
                </h3>
                <p className="text-xs text-slate-300 font-normal">
                  Report concerns anonymously • Zero login or name needed
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onOpenPublicPortal}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-black font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-[0.5px]"
            >
              <span>Submit Anonymous Tip / Track Token</span>
              <ArrowRight className="w-4 h-4 text-[#22D3EE]" />
            </button>
          </div>
        </div>

        {/* AUTHORIZED OFFICER ACCESS CARD */}
        <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-slate-100 dark:bg-[#0B0F19] text-slate-700 dark:text-[#22D3EE] mb-2 border border-slate-200 dark:border-slate-800">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-[18px] font-semibold font-space text-slate-900 dark:text-slate-100 uppercase tracking-tight">
              Authorized Authority Access
            </h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
              Strictly restricted to intelligence & verification officers.
            </p>
          </div>

          {(localError || error) && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start gap-2.5 font-inter font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-inter">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium text-[11px] uppercase tracking-[0.5px] mb-1.5">
                Officer Username / ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="e.g. state_admin"
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 font-mono text-[13px] focus:outline-none focus:border-[#22D3EE]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium text-[11px] uppercase tracking-[0.5px] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 font-mono text-[13px] focus:outline-none focus:border-[#22D3EE]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black font-semibold uppercase tracking-[0.5px] text-xs shadow-glow-cyan transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Enter Command Center'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Fast Demo Role Switcher */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-[1px] text-center mb-2">
              ⚡ Fast Demo Login (Select Role)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {seedAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleSelectDemoUser(acc)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    username === acc.username
                      ? 'bg-cyan-500/15 text-[#22D3EE] border-cyan-500/40 shadow-glow-cyan font-medium'
                      : 'bg-slate-50 dark:bg-[#0B0F19] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="font-semibold truncate text-[11px] uppercase tracking-[0.5px]">{acc.role_key}</div>
                  <div className="text-slate-400 text-[10px] font-mono truncate">{acc.username}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl mx-auto text-center text-xs font-mono text-slate-500 z-10 font-normal">
        NARC-INTEL (N-RISE) STATEWIDE INTELLIGENCE PLATFORM • TAMIL NADU PROTOTYPE
      </div>
    </div>
  );
}
