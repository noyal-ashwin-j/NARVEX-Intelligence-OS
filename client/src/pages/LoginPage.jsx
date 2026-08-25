import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Megaphone,
  Phone,
  KeyRound,
  Volume2,
  VolumeX,
  Sparkles,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CyberCanvasBackground } from '../components/auth/CyberCanvasBackground';
import { NarvexCoreVisualizer } from '../components/auth/NarvexCoreVisualizer';
import { DemoRolesModal } from '../components/auth/DemoRolesModal';
import { SecurityClearanceModal } from '../components/auth/SecurityClearanceModal';
import { AnonymousTipModal } from '../components/auth/AnonymousTipModal';
import { playClickSound, playHoverSound, setMuted, getMuted } from '../utils/soundEffects';

/**
 * NARVEX 2.0 Sovereign Intelligence Command System — Ultra-Sleek Gateway
 * Clean, Spacious, Majestic Architecture & GPU-Optimized Motion
 */
export function LoginPage({ onLoginSuccess, onOpenPublicPortal }) {
  const { login, error } = useAuth();

  const [username, setUsername] = useState('state_admin');
  const [password, setPassword] = useState('Admin@123');
  const [totpCode, setTotpCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [seedAccounts, setSeedAccounts] = useState([]);

  // Modals state
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [audioMuted, setAudioMuted] = useState(getMuted());
  const [pendingLoginRoleTitle, setPendingLoginRoleTitle] = useState('');

  // Assembly Timeline Step (0 -> 4)
  const [assemblyStep, setAssemblyStep] = useState(0);

  // Authentication States
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStepText, setAuthStepText] = useState('');
  const [isAccessGranted, setIsAccessGranted] = useState(false);

  // 3D Parallax Mouse Tilt
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0 });

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

  // System Assembly Timeline on Mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAssemblyStep(4);
      return;
    }

    const t1 = setTimeout(() => setAssemblyStep(1), 200);  // Core initializes
    const t2 = setTimeout(() => setAssemblyStep(2), 500);  // Panel materializes
    const t3 = setTimeout(() => setAssemblyStep(3), 800);  // Fields resolve
    const t4 = setTimeout(() => setAssemblyStep(4), 1100); // Channel SECURE

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Subtle Mouse 3D Tilt Response
  const handleMouseMove = (e) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || isAuthenticating || isAccessGranted) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const mouseX = (e.clientX / windowWidth - 0.5) * 2;
    const mouseY = (e.clientY / windowHeight - 0.5) * 2;

    setCardTilt({
      rotateX: -mouseY * 3,
      rotateY: mouseX * 3
    });
  };

  // Keyboard Shortcuts (Alt + D for demo roles, Alt + T for tip modal)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        playClickSound();
        setIsDemoModalOpen((prev) => !prev);
      } else if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        playClickSound();
        setIsTipModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsDemoModalOpen(false);
        setIsTipModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSound = () => {
    const nextState = !audioMuted;
    setAudioMuted(nextState);
    setMuted(nextState);
    if (!nextState) playClickSound();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    playClickSound();
    setIsScanModalOpen(true);
  };

  const handleSelectRoleFromModal = (rolePreset) => {
    setUsername(rolePreset.username);
    setPassword('Admin@123');
    setPendingLoginRoleTitle(rolePreset.title);
    setIsScanModalOpen(true);
  };

  // Real Authentication Execution
  const executeActualLogin = async () => {
    setLoading(true);
    setIsAuthenticating(true);
    setAuthStepText('VERIFYING CREDENTIALS…');

    await new Promise((r) => setTimeout(r, 400));
    setAuthStepText('AUTHENTICATING COMMAND NODE…');

    const res = await login(username, password, totpCode);
    setLoading(false);
    setIsScanModalOpen(false);

    if (res.success) {
      setAuthStepText('SECURE CHANNEL ESTABLISHED');
      await new Promise((r) => setTimeout(r, 400));
      setIsAccessGranted(true);
      setAuthStepText('ACCESS GRANTED — EXPANDING COMMAND FIELD');

      await new Promise((r) => setTimeout(r, 650));
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setIsAuthenticating(false);
      setIsAccessGranted(false);
      setMfaRequired(Boolean(res.mfaRequired));
      setLocalError(res.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#040711] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-inter text-slate-100 overflow-hidden select-none"
    >
      {/* Planetary Command Intelligence Canvas */}
      <CyberCanvasBackground />

      {/* Radial Field Expansion Effect (Fires on Access Granted) */}
      {isAccessGranted && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-cyan-950/20 backdrop-blur-md animate-[ping_1s_cubic-bezier(0,0,0.2,1)_forwards]">
          <div className="w-96 h-96 rounded-full border-2 border-cyan-400 opacity-80 animate-ping" />
        </div>
      )}

      {/* Top Clean Header Navigation */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-20 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-space tracking-wide text-white uppercase">
                NARVEX <span className="text-[#22D3EE]">INTELLIGENCE OS</span>
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SOVEREIGN NODE ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">
              Statewide Narcotics Intelligence & Risk Monitoring Platform
            </p>
          </div>
        </div>

        {/* Action Controls Header Pills */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setIsDemoModalOpen(true);
            }}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium transition-all cursor-pointer shadow-glow-cyan"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Fast Demo Roles</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              setIsTipModalOpen(true);
            }}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Anonymous Tip</span>
          </button>

          <button
            onClick={toggleSound}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Toggle UI Sound Effects"
          >
            {audioMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-[#22D3EE]" />}
            <span className="hidden sm:inline">{audioMuted ? 'SFX OFF' : 'SFX ON'}</span>
          </button>

          <a
            href="tel:1058"
            onMouseEnter={playHoverSound}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>1058 (24x7)</span>
          </a>
        </div>
      </header>

      {/* Main Center Stage: NARVEX Core Anchor + Command Access Card */}
      <main className="w-full max-w-md mx-auto my-auto z-20 space-y-5 py-6">
        {/* NARVEX Central Intelligence Core */}
        {assemblyStep >= 1 && (
          <div className="transition-all duration-700 animate-fade-in">
            <NarvexCoreVisualizer
              stateText={authStepText}
              isAuthenticating={isAuthenticating}
              isAccessGranted={isAccessGranted}
            />
          </div>
        )}

        {/* AUTHORIZED AUTHORITY ACCESS CARD */}
        {assemblyStep >= 2 && (
          <div
            style={{
              transform: `perspective(1000px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), filter 0.7s ease, opacity 0.7s ease'
            }}
            className={`relative p-6 sm:p-8 rounded-3xl bg-[#0A101D]/90 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_70px_rgba(0,0,0,0.8)] space-y-6 transition-all duration-700 ${
              assemblyStep >= 2 ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-95'
            }`}
          >
            {/* Tactical Laser Corner Brackets */}
            <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400/70 pointer-events-none" />
            <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400/70 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400/70 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400/70 pointer-events-none" />

            {/* Title Header */}
            <div className="text-center space-y-1.5">
              <h2 className="text-base font-bold font-space text-white uppercase tracking-wider">
                Authorized Authority Access
              </h2>
              <div className="flex items-center justify-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">
                  SYSTEM CHANNEL:
                </span>
                <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30 uppercase">
                  {assemblyStep >= 4 ? 'SECURE' : 'INITIALIZING…'}
                </span>
              </div>
            </div>

            {/* Error Message Display */}
            {(localError || error) && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 font-medium animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-inter">
              {/* Username Field */}
              <div
                className={`transition-all duration-500 ${
                  assemblyStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <label className="block text-slate-300 font-semibold text-[11px] uppercase tracking-wider mb-1.5">
                  Officer Username / ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="e.g. state_admin"
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] transition-all"
                  />
                </div>
              </div>

              {mfaRequired && (
                <div>
                  <label className="block text-slate-300 font-semibold text-[11px] uppercase tracking-wider mb-1.5">
                    Authenticator TOTP Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    placeholder="6-digit code"
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-[#22D3EE]"
                  />
                </div>
              )}

              {/* Password Field */}
              <div
                className={`transition-all duration-500 ${
                  assemblyStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <label className="block text-slate-300 font-semibold text-[11px] uppercase tracking-wider mb-1.5">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] transition-all"
                  />
                </div>
              </div>

              {/* High-Impact Command Login Button */}
              <button
                type="submit"
                disabled={loading || isAuthenticating}
                onMouseEnter={playHoverSound}
                className="relative group overflow-hidden w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-[#22D3EE] hover:from-[#06B6D4] hover:to-cyan-400 text-black font-bold uppercase tracking-wider text-xs shadow-glow-cyan transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer mt-2"
              >
                {/* Light Sweep Shimmer Effect */}
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                <span>{loading ? 'Verifying SHA-256 Clearance…' : 'Enter Command System'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Keyboard Shortcuts Footer Hint */}
            <div className="pt-1 text-center text-[10px] font-mono text-slate-500 flex items-center justify-center gap-3">
              <span>Press <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400">Alt+D</kbd> for Roles</span>
              <span>•</span>
              <span>Press <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400">Alt+T</kbd> for Tip</span>
            </div>
          </div>
        )}
      </main>

      {/* Sovereign Audit Ledger Footer */}
      <footer className="w-full max-w-6xl mx-auto z-20 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>SHA-256 AUDIT LEDGER: <strong className="text-emerald-400">INTACT</strong></span>
          <span className="hidden md:inline">• 38 DISTRICT COMMAND NODES ACTIVE</span>
        </div>

        <div className="text-right text-slate-500">
          TAMIL NADU STATEWIDE NARCOTIC INTELLIGENCE PLATFORM
        </div>
      </footer>

      {/* Modals */}
      <DemoRolesModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectRole={handleSelectRoleFromModal}
        seedAccounts={seedAccounts}
      />

      <SecurityClearanceModal
        isOpen={isScanModalOpen}
        username={username}
        roleTitle={pendingLoginRoleTitle}
        onComplete={executeActualLogin}
      />

      <AnonymousTipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        onOpenPublicPortal={onOpenPublicPortal}
      />
    </div>
  );
}
