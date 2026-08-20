import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Map,
  UploadCloud,
  UserCheck,
  Megaphone,
  SearchCode,
  Network,
  Cpu,
  Ticket,
  FileCheck2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();
  const role = user?.roleKey || 'STATE_ADMIN';

  // Navigation Items with strictly enforced role filters
  const allNavItems = [
    // Super Admin Only
    {
      id: 'command-center',
      label: 'State Command Center',
      icon: LayoutDashboard,
      roles: ['STATE_ADMIN']
    },
    // Super Admin & District Officer
    {
      id: 'district-intel',
      label: role === 'DISTRICT_OFFICER' ? `${user?.districtName || 'My District'} Intel` : 'District Intelligence',
      icon: Building2,
      roles: ['STATE_ADMIN', 'DISTRICT_OFFICER']
    },
    // Super Admin, District Officer & Verification Officer
    {
      id: 'gis-map',
      label: role === 'DISTRICT_OFFICER' ? 'District Tactical Map' : 'Tactical GIS Map',
      icon: Map,
      roles: ['STATE_ADMIN', 'DISTRICT_OFFICER', 'VERIFICATION_OFFICER']
    },
    // Super Admin & Verification Officer
    {
      id: 'data-ingestion',
      label: '+ Feed Intelligence',
      icon: UploadCloud,
      roles: ['STATE_ADMIN', 'VERIFICATION_OFFICER']
    },
    // Super Admin, District Officer & Verification Officer
    {
      id: 'citizen-queue',
      label: role === 'DISTRICT_OFFICER' ? 'District Verification Queue' : 'Verification Queue',
      icon: UserCheck,
      roles: ['STATE_ADMIN', 'DISTRICT_OFFICER', 'VERIFICATION_OFFICER']
    },
    // Super Admin Only
    {
      id: 'spatial-associations',
      label: 'Spatial Corridors',
      icon: Network,
      roles: ['STATE_ADMIN']
    },
    // Super Admin Only
    {
      id: 'forecast-governance',
      label: 'Forecast & Responsible AI',
      icon: Cpu,
      roles: ['STATE_ADMIN']
    },
    // Super Admin & District Officer
    {
      id: 'action-tickets',
      label: role === 'DISTRICT_OFFICER' ? 'District Action Tickets' : 'Preventive Action Tickets',
      icon: Ticket,
      roles: ['STATE_ADMIN', 'DISTRICT_OFFICER']
    },
    // Super Admin Only
    {
      id: 'audit-trail',
      label: 'SHA-256 Audit Trail',
      icon: FileCheck2,
      roles: ['STATE_ADMIN']
    },
    // Citizen Portal (Public & Citizen Role Only)
    {
      id: 'citizen-portal',
      label: 'Report a Concern',
      icon: Megaphone,
      roles: ['CITIZEN_REPORTER']
    },
    {
      id: 'citizen-track',
      label: 'Anonymous Token Lookup',
      icon: SearchCode,
      roles: ['CITIZEN_REPORTER']
    }
  ];

  const visibleItems = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 shadow-sm font-inter">
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-[1px] text-slate-400">
          {role === 'DISTRICT_OFFICER' ? `${user?.districtName || 'DISTRICT'} WORKSPACE` : 'NAVIGATION'}
        </div>

        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/30 shadow-glow-cyan font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#22D3EE]' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Calm Status Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19]">
        <div className="p-3 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-xs shadow-sm space-y-1">
          <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-medium uppercase tracking-[0.5px]">Authorized Protocol</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight font-normal">
            Human-in-the-loop verification required. PII redaction active.
          </p>
        </div>
      </div>
    </aside>
  );
}
