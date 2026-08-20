import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { FilterDrawer } from './components/layout/FilterDrawer';
import { ProvenanceDrawer } from './components/layout/ProvenanceDrawer';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { AboutModal } from './components/layout/AboutModal';
import { OfflineSyncIndicator } from './components/common/OfflineSyncIndicator';
import { NRISEAssistantDrawer } from './components/chat/NRISEAssistantDrawer';
import { Bot, Sparkles } from 'lucide-react';

import { FeedIntelligenceModal } from './components/ingestion/FeedIntelligenceModal';
import { LoginPage } from './pages/LoginPage';
import { StateCommandCenter } from './pages/StateCommandCenter';
import { DistrictIntelligencePage } from './pages/DistrictIntelligencePage';
import { GISMapPage } from './pages/GISMapPage';
import { CitizenReportingPage } from './pages/CitizenReportingPage';
import { CitizenTrackingPage } from './pages/CitizenTrackingPage';
import { VerificationQueuePage } from './pages/VerificationQueuePage';
import { DataIngestionPage } from './pages/DataIngestionPage';
import { SpatialTemporalPage } from './pages/SpatialTemporalPage';
import { ForecastGovernancePage } from './pages/ForecastGovernancePage';
import { ActionManagementPage } from './pages/ActionManagementPage';
import { AuditTrailPage } from './pages/AuditTrailPage';

function getDefaultTabForRole(roleKey) {
  switch (roleKey) {
    case 'STATE_ADMIN':
      return 'command-center';
    case 'DISTRICT_OFFICER':
      return 'district-intel';
    case 'VERIFICATION_OFFICER':
      return 'citizen-queue';
    case 'CITIZEN_REPORTER':
      return 'citizen-portal';
    default:
      return 'command-center';
  }
}

function MainAppShell() {
  const { user, isAuthenticated, loading } = useAuth();

  const [activeTab, setActiveTab] = useState('command-center');
  const [selectedDistrictId, setSelectedDistrictId] = useState(2); // Coimbatore default
  const [inspectEventId, setInspectEventId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [trackingTokenPreload, setTrackingTokenPreload] = useState('');
  const [isPublicMode, setIsPublicMode] = useState(false);

  // Global Keyboard Shortcuts (Ctrl+/ or Cmd+/ or Cmd+J for Assistant, Ctrl+K for Search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsAssistantOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        setIsAssistantOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check URL query parameters for direct shared links (e.g. ?view=report or ?district=2)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const districtParam = params.get('district');

    if (viewParam === 'report') {
      setIsPublicMode(true);
      setActiveTab('citizen-portal');
    } else if (viewParam === 'track') {
      setIsPublicMode(true);
      setActiveTab('citizen-track');
    }

    if (districtParam) {
      setSelectedDistrictId(parseInt(districtParam, 10));
    }
  }, []);

  // Sync role-based home landing whenever user/role changes
  useEffect(() => {
    if (user?.roleKey && !isPublicMode) {
      const defaultTab = getDefaultTabForRole(user.roleKey);
      setActiveTab(defaultTab);

      // If district officer, lock to their assigned district
      if (user.roleKey === 'DISTRICT_OFFICER' && user.districtId) {
        setSelectedDistrictId(user.districtId);
      }
    }
  }, [user?.roleKey, user?.districtId, isPublicMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center font-mono text-[#22D3EE] text-xs font-medium">
        <div className="flex items-center gap-3">
          <div className="w-3.5 h-3.5 rounded-full bg-[#22D3EE] animate-ping" />
          <span>INITIALIZING TAMIL NADU COMMAND NODE...</span>
        </div>
      </div>
    );
  }

  // If in public citizen mode (from direct link or login page button)
  if (isPublicMode) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-inter">
        {/* Simple Public Header */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-[#22D3EE] border border-cyan-500/30">
              <span className="font-mono font-bold text-xs">TN</span>
            </div>
            <div>
              <h1 className="font-semibold text-sm font-space uppercase tracking-tight text-slate-900 dark:text-slate-100">
                State Anonymous Citizen Intelligence Portal
              </h1>
              <p className="text-[11px] text-slate-500">Government of Tamil Nadu Anti-Narcotics Initiative</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'citizen-portal' ? 'citizen-track' : 'citizen-portal')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium font-inter uppercase tracking-[0.5px] cursor-pointer"
            >
              {activeTab === 'citizen-portal' ? 'Track My Token' : 'Submit New Tip'}
            </button>

            <button
              onClick={() => setIsPublicMode(false)}
              className="px-3.5 py-1.5 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] text-black text-xs font-semibold font-inter uppercase tracking-[0.5px] cursor-pointer shadow-glow-cyan"
            >
              Officer Login
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
          {activeTab === 'citizen-portal' && (
            <CitizenReportingPage onTrackToken={(tok) => {
              setTrackingTokenPreload(tok);
              setActiveTab('citizen-track');
            }} />
          )}

          {activeTab === 'citizen-track' && (
            <CitizenTrackingPage initialToken={trackingTokenPreload} />
          )}
        </main>
      </div>
    );
  }

  // If unauthenticated, show login with Public Citizen Portal button
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          if (user?.roleKey) {
            setActiveTab(getDefaultTabForRole(user.roleKey));
          }
        }}
        onOpenPublicPortal={() => {
          setIsPublicMode(true);
          setActiveTab('citizen-portal');
        }}
      />
    );
  }

  // Role guard for activeTab
  const role = user?.roleKey || 'STATE_ADMIN';

  // Ensure District Officer cannot land on statewide command center
  if (role === 'DISTRICT_OFFICER' && activeTab === 'command-center') {
    setActiveTab('district-intel');
  }

  // Ensure Citizen Reporter cannot browse intelligence tabs
  if (role === 'CITIZEN_REPORTER' && !['citizen-portal', 'citizen-track'].includes(activeTab)) {
    setActiveTab('citizen-portal');
  }

  const handleSelectDistrict = (dtId) => {
    // Only State Admin can change to another district
    if (role === 'DISTRICT_OFFICER') {
      setSelectedDistrictId(user.districtId || 2);
    } else {
      setSelectedDistrictId(dtId);
    }
    setActiveTab('district-intel');
  };

  const handleSelectEvent = (evtId) => {
    setInspectEventId(evtId);
  };

  const handleTrackCitizenToken = (token) => {
    setTrackingTokenPreload(token);
    setActiveTab('citizen-track');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-inter selection:bg-[#22D3EE] selection:text-black">
      {/* Top Navbar with About modal and Assistant trigger */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenFeed={() => setIsFeedModalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Main Stage View */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {activeTab === 'command-center' && role === 'STATE_ADMIN' && (
            <StateCommandCenter onSelectDistrict={handleSelectDistrict} />
          )}

          {activeTab === 'district-intel' && (
            <DistrictIntelligencePage
              districtId={role === 'DISTRICT_OFFICER' ? (user.districtId || 2) : selectedDistrictId}
              onBackToState={role === 'STATE_ADMIN' ? () => setActiveTab('command-center') : undefined}
              onSelectEvent={handleSelectEvent}
              onSelectZone={(z) => console.log('Selected zone:', z)}
            />
          )}

          {activeTab === 'gis-map' && (
            <GISMapPage onSelectEvent={handleSelectEvent} />
          )}

          {activeTab === 'data-ingestion' && (
            <DataIngestionPage onIngestionComplete={() => setActiveTab(role === 'STATE_ADMIN' ? 'command-center' : 'district-intel')} />
          )}

          {activeTab === 'citizen-queue' && (
            <VerificationQueuePage />
          )}

          {activeTab === 'citizen-portal' && (
            <CitizenReportingPage onTrackToken={handleTrackCitizenToken} />
          )}

          {activeTab === 'citizen-track' && (
            <CitizenTrackingPage initialToken={trackingTokenPreload} />
          )}

          {activeTab === 'spatial-associations' && role === 'STATE_ADMIN' && (
            <SpatialTemporalPage />
          )}

          {activeTab === 'forecast-governance' && role === 'STATE_ADMIN' && (
            <ForecastGovernancePage onSelectDistrict={handleSelectDistrict} />
          )}

          {activeTab === 'action-tickets' && (
            <ActionManagementPage />
          )}

          {activeTab === 'audit-trail' && role === 'STATE_ADMIN' && (
            <AuditTrailPage />
          )}
        </main>
      </div>

      {/* Multi-Dimensional Filter Drawer */}
      <FilterDrawer />

      {/* Provenance Drawer ("Why is this here?") */}
      <ProvenanceDrawer
        eventId={inspectEventId}
        onClose={() => setInspectEventId(null)}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectDistrict={handleSelectDistrict}
        onSelectEvent={handleSelectEvent}
      />

      {/* Universal Feed Intelligence Modal */}
      <FeedIntelligenceModal
        isOpen={isFeedModalOpen}
        onClose={() => setIsFeedModalOpen(false)}
        onIngestionComplete={() => {
          // If in command center or district intel, refresh data
        }}
      />

      {/* About NARC-INTEL Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Centralized N-RISE Intelligence Assistant Drawer */}
      <NRISEAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        activeDistrictId={selectedDistrictId}
        activeTab={activeTab}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onSelectDistrict={handleSelectDistrict}
      />

      {/* Floating Global "Ask N-RISE" Assistant Trigger Button */}
      {role !== 'CITIZEN_REPORTER' && !isAssistantOpen && (
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium text-xs shadow-glow-purple hover:scale-105 active:scale-95 transition-all cursor-pointer border border-purple-400/30 uppercase tracking-[0.5px]"
          title="Open N-RISE Intelligence Assistant (Ctrl+/)"
        >
          <Bot className="w-5 h-5 animate-pulse text-purple-200" />
          <span>Ask N-RISE</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
        </button>
      )}

      {/* Offline Sync Indicator for Remote Field Operations */}
      <OfflineSyncIndicator />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FilterProvider>
          <MainAppShell />
        </FilterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
