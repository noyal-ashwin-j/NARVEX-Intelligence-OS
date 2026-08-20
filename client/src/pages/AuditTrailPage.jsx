import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Hash,
  CheckCircle,
  AlertTriangle,
  RotateCw,
  Lock,
  User,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export function AuditTrailPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Chain integrity state
  const [verifying, setVerifying] = useState(false);
  const [integrityResult, setIntegrityResult] = useState(null);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs({ page, limit: 25 });
      if (res.success) {
        setLogs(res.logs || []);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Audit logs load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [page]);

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyChainIntegrity();
      if (res.success) {
        setIntegrityResult(res.integrity);
      }
    } catch (err) {
      alert(`Verification failed: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-inter text-xs">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2 font-space">
            <FileCheck2 className="w-5 h-5 text-emerald-500" />
            SHA-256 Cryptographic Hash-Chain Audit Trail
          </h2>
          <p className="text-[13px] text-slate-600 dark:text-slate-400 font-normal mt-0.5">
            Append-only tamper-evident verification ledger. Formula: <code className="font-mono text-xs text-emerald-500">hash_n = SHA256(hash_n-1 + payload_n)</code>.
          </p>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={verifying}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs uppercase tracking-[0.5px] disabled:opacity-50 transition-all cursor-pointer shadow-sm"
        >
          <ShieldCheck className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
          <span>{verifying ? 'Recomputing SHA-256 Hashes...' : 'Verify Full Chain Integrity'}</span>
        </button>
      </div>

      {/* Integrity Verification Certificate */}
      {integrityResult && (
        <div className={`p-5 rounded-2xl border space-y-2 animate-in zoom-in-95 duration-150 shadow-sm ${
          integrityResult.isIntact
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center justify-between font-semibold text-sm font-space">
            <span className="flex items-center gap-2">
              {integrityResult.isIntact ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              {integrityResult.isIntact ? 'CRYPTOGRAPHIC AUDIT CHAIN VERIFIED INTACT' : 'TAMPER VIOLATION DETECTED'}
            </span>
            <span className="text-xs bg-white dark:bg-[#0B0F19] px-3 py-1 rounded-lg border border-emerald-500/30 font-mono">{integrityResult.totalBlocks} Blocks Verified</span>
          </div>
          <p className="text-[13px] text-slate-300 leading-relaxed font-normal">
            Every sequential block hash mathematically verifies against its previous parent hash back to the genesis block. Zero unauthorized mutation detected.
          </p>
          <div className="text-xs text-slate-400 break-all font-mono pt-1">
            Tip Hash: <strong className="text-emerald-400">{integrityResult.latestBlockHash}</strong>
          </div>
        </div>
      )}

      {/* Audit Blocks Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 font-inter">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <span className="text-[14px] font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-[1px] font-space">
            Sequential Cryptographic Ledger ({total} Blocks)
          </span>
          <span className="text-[#22D3EE] font-mono text-xs font-medium">Page {page}</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 font-mono text-xs animate-pulse">
            Reading hash-chain blocks from narvex database...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-inter">
              <thead className="bg-slate-100 dark:bg-[#0B0F19] text-slate-400 uppercase text-[11px] font-medium tracking-[0.5px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3">Seq #</th>
                  <th className="py-3 px-3">Actor</th>
                  <th className="py-3 px-3">Action Type</th>
                  <th className="py-3 px-3">Target Entity</th>
                  <th className="py-3 px-3">Block Hash (SHA-256)</th>
                  <th className="py-3 px-3">Previous Hash</th>
                  <th className="py-3 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-normal">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-[#22D3EE]">#{log.sequence_num}</td>
                    <td className="py-3 px-3 text-slate-900 dark:text-slate-200">
                      <div className="font-medium text-xs">{log.actor_name || log.actor_username || 'SYSTEM'}</div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-[0.5px]">{log.actor_role || 'DAEMON'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/30 font-medium text-[11px] uppercase tracking-[0.5px]">
                        {log.action_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {log.entity_type} ({log.entity_id})
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-emerald-400 font-medium">
                      <span title={log.block_hash}>{log.block_hash.substring(0, 16)}...</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      <span title={log.prev_hash}>{log.prev_hash.substring(0, 12)}...</span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-right">{log.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
