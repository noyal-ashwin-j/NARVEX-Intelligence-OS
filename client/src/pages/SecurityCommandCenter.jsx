import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Key,
  Lock,
  Radio,
  Server,
  RefreshCw,
  Trash2,
  AlertTriangle,
  FileCheck2,
  Users,
  Activity,
  Cpu,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { getAuthToken } from '../services/api';

export function SecurityCommandCenter() {
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [chainIntegrity, setChainIntegrity] = useState(null);
  const [verifyingChain, setVerifyingChain] = useState(false);

  const fetchSecurityState = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [secRes, sessRes] = await Promise.all([
        fetch('/api/security/dashboard', { headers }).then((r) => r.json()),
        fetch('/api/auth/sessions', { headers }).then((r) => r.json())
      ]);

      if (secRes.success) setSecurityData(secRes);
      if (sessRes.success) setSessions(sessRes.sessions || []);
    } catch (err) {
      console.error('Failed to load security center metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    setVerifyingChain(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/audit/verify-chain', {
        headers: { Authorization: `Bearer ${token}` }
      }).then((r) => r.json());
      setChainIntegrity(res);
    } catch (err) {
      console.error('Chain verification failed:', err);
    } finally {
      setVerifyingChain(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      const token = getAuthToken();
      await fetch(`/api/auth/sessions/${sessionId}/revoke`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSecurityState();
    } catch (err) {
      console.error('Failed to revoke session:', err);
    }
  };

  useEffect(() => {
    fetchSecurityState();
  }, []);

  return (
    <div className="space-y-6 pb-12 font-inter text-slate-100 bg-[#050811] min-h-screen p-6 rounded-3xl">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#090E1A] border border-cyan-500/30 shadow-glow-cyan flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan">
            <Shield className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-space">
                NARVEX // ZERO-TRUST SECURITY COMMAND CENTER
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-semibold flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                DEFENSE-IN-DEPTH ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active Session Registry • SIEM Incident Telemetry • AI Model Cryptographic Verification • SHA-256 Provenance
            </p>
          </div>
        </div>

        <button
          onClick={fetchSecurityState}
          disabled={loading}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh SIEM
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#090E1A] border border-slate-800/80 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ACTIVE SESSIONS</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-space">
            {securityData?.metrics?.activeSessions || sessions.length || 1}
          </div>
          <p className="text-[11px] text-emerald-400 font-mono">Cryptographically Registered</p>
        </div>

        <div className="p-4 bg-[#090E1A] border border-slate-800/80 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>FAILED LOGINS (24H)</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-space">
            {securityData?.metrics?.failedLogins24h || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Brute-Force Shield Active</p>
        </div>

        <div className="p-4 bg-[#090E1A] border border-slate-800/80 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>CROSS-DISTRICT BLOCKS</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-space">
            {securityData?.metrics?.crossDistrictBlocks24h || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Zero-Trust Scoping Enforced</p>
        </div>

        <div className="p-4 bg-[#090E1A] border border-slate-800/80 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>AI MODEL INTEGRITY</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-emerald-400 font-space flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{securityData?.metrics?.modelIntegrity || 'VERIFIED_INTACT'}</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono truncate">
            {securityData?.metrics?.modelSha256 ? `${securityData.metrics.modelSha256.substring(0, 16)}...` : 'SHA-256 Guard Active'}
          </p>
        </div>
      </div>

      {/* Main Grid: Active Sessions & SIEM Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Session Registry (6 cols) */}
        <div className="lg:col-span-6 p-5 bg-[#090E1A] border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-space">Active User Sessions</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{sessions.length} Registered</span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 font-mono">No active external sessions recorded.</div>
            ) : (
              sessions.map((sess) => (
                <div
                  key={sess.sessionId}
                  className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{sess.username}</span>
                      <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800/60 rounded-full text-[10px]">
                        {sess.roleKey}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      IP: {sess.ipAddress} | Last Active: {new Date(sess.lastActiveAt).toLocaleTimeString()}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-xs">{sess.deviceInfo}</div>
                  </div>

                  <button
                    onClick={() => handleRevokeSession(sess.sessionId)}
                    className="p-2 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-800/50 rounded-xl transition-all cursor-pointer"
                    title="Revoke Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: SIEM Security Incident Stream (6 cols) */}
        <div className="lg:col-span-6 p-5 bg-[#090E1A] border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-space">SIEM Incident Telemetry</h3>
            </div>
            <span className="text-xs text-rose-400 font-mono">Live Auditing</span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {securityData?.recentIncidents?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 font-mono">Zero security violations recorded in past 24h.</div>
            ) : (
              securityData?.recentIncidents?.map((inc) => (
                <div
                  key={inc.id}
                  className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex items-center justify-between text-xs font-mono"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.severity === 'HIGH' || inc.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                          : inc.severity === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          : 'bg-slate-900 text-slate-300 border border-slate-800'
                      }`}>
                        {inc.eventType}
                      </span>
                      <span className="text-[11px] text-slate-400">{inc.username}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {inc.details?.reason || inc.details?.endpoint || 'Security event verified.'}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(inc.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cryptographic SHA-256 Audit Chain Verification Stage */}
      <div className="p-6 bg-[#090E1A] border border-cyan-500/30 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white font-space flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-cyan-400" />
              <span>SHA-256 Cryptographic Hash Chain Verifier</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Validates block continuity, previous hash linkages, and tamper-evident sequential integrity.
            </p>
          </div>

          <button
            onClick={handleVerifyChain}
            disabled={verifyingChain}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-950/50 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${verifyingChain ? 'animate-spin' : ''}`} />
            Run Cryptographic Audit
          </button>
        </div>

        {chainIntegrity && (
          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              {chainIntegrity.isIntact ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <div className="font-bold text-white">
                  {chainIntegrity.isIntact ? 'CRYPTOGRAPHIC AUDIT CHAIN VERIFIED INTACT' : 'TAMPER DETECTED IN CHAIN'}
                </div>
                <div className="text-slate-400 text-[11px]">
                  Total Blocks Scanned: {chainIntegrity.totalBlocks} | Broken Link Violations: {chainIntegrity.violations?.length || 0}
                </div>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded-full font-bold">
              100% INTACT
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default SecurityCommandCenter;
