import React, { useState, useEffect } from 'react';
import { Shield, Filter, Search, Sun, Moon, LogOut, UserCheck, ChevronDown, Activity, Database, Info, Bot, Sparkles, UploadCloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFilters } from '../../context/FilterContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export function Navbar({ onOpenSearch, onOpenAbout, onOpenAssistant, onOpenFeed }) {
  const { user, logout, login } = useAuth();
  const { isDrawerOpen, setIsDrawerOpen, activeFilterCount } = useFilters();
  const { theme, toggleTheme, isDark } = useTheme();

  const [timeStr, setTimeStr] = useState('');
  const [seedAccounts, setSeedAccounts] = useState([]);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const handleQuickSwitchRole = async (username) => {
    await login(username, 'Admin@123');
    setShowRoleMenu(false);
  };

  const isCitizen = user?.roleKey === 'CITIZEN_REPORTER';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm font-inter">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white uppercase font-space">
                NARVEX <span className="text-[#22D3EE]">INTELLIGENCE</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium font-inter uppercase tracking-[0.5px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {user?.roleKey === 'DISTRICT_OFFICER' ? `${user?.districtName || 'DISTRICT'} NODE` : 'STATE COMMAND NODE'}
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-normal">
              State-Level Narcotic Intelligence & Preventive Risk Monitoring Platform
            </p>
          </div>
        </div>

        {/* Center: Live Time */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.5px]">STATE CLOCK:</span>
            <span className="font-medium font-mono text-slate-900 dark:text-slate-100 text-[13px]">{timeStr}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* + FEED INTELLIGENCE Universal Ingestion Button */}
          {!isCitizen && onOpenFeed && (
            <button
              onClick={onOpenFeed}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black font-semibold text-[11px] uppercase tracking-[0.5px] shadow-glow-cyan transition-all cursor-pointer"
              title="Feed Any Intelligence Document / Data File"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">+ Feed Intelligence</span>
            </button>
          )}

          {/* AI Assistant Trigger */}
          {!isCitizen && onOpenAssistant && (
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-[#A855F7] border border-purple-500/30 font-medium text-[11px] uppercase tracking-[0.5px] shadow-glow-purple transition-all cursor-pointer"
              title="Open NARVEX Assistant (Ctrl+/)"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">NARVEX AI</span>
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
            </button>
          )}

          {/* Search Button (Hidden for Citizen) */}
          {!isCitizen && onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-200 font-medium uppercase tracking-[0.5px] transition-colors cursor-pointer"
              title="Global Search (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Search records...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 text-slate-400 font-mono font-medium">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Filter Drawer Toggle (Hidden for Citizen) */}
          {!isCitizen && (
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-[11px] font-medium uppercase tracking-[0.5px] transition-all cursor-pointer ${
                activeFilterCount > 0
                  ? 'bg-[#22D3EE] text-black border-cyan-400 shadow-glow-cyan font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-black text-[#22D3EE] text-[11px] font-mono font-medium">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Toggle Dark/Light Mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 font-bold cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="truncate max-w-[130px] font-bold">
                {user?.roleKey || 'ROLE'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 text-xs">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Switch Active Role (Demo)
                </div>
                <div className="py-1 space-y-1">
                  {seedAccounts.map((acc) => (
                    <button
                      key={acc.username}
                      onClick={() => handleQuickSwitchRole(acc.username)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex flex-col transition-colors cursor-pointer ${
                        user?.username === acc.username
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{acc.role_key}</span>
                        {user?.username === acc.username && <UserCheck className="w-4 h-4 text-blue-600" />}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{acc.full_name}</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1 space-y-1">
                  {/* About Link */}
                  {onOpenAbout && (
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onOpenAbout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>About Platform</span>
                    </button>
                  )}

                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-bold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
