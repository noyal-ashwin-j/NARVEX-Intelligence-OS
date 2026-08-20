import React, { useState, useEffect } from 'react';
import {
  Ticket,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Send,
  Building,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge, RiskBadge } from '../components/common/Badge';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';

export function ActionManagementPage() {
  const [activeTab, setActiveTab] = useState('tickets'); // 'alerts' or 'tickets'
  const [alerts, setAlerts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create ticket modal
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [assignedDept, setAssignedDept] = useState('District Flying Squad Unit');
  const [priority, setPriority] = useState('HIGH');
  const [actionType, setActionType] = useState('CHECKPOST_INSPECTION_ENHANCEMENT');
  const [opNotes, setOpNotes] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Update outcome modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketStatus, setTicketStatus] = useState('ACTION_TAKEN');
  const [outcomeType, setOutcomeType] = useState('PREVENTIVE_INTERVENTION_COMPLETED');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [updatingTicket, setUpdatingTicket] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [alRes, tkRes] = await Promise.all([api.getAlerts(), api.getActionTickets()]);
      if (alRes.success) setAlerts(alRes.alerts || []);
      if (tkRes.success) setTickets(tkRes.tickets || []);
    } catch (err) {
      console.error('Error loading actions data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAlert) return;

    setCreatingTicket(true);
    try {
      const res = await api.createActionTicket({
        alertId: selectedAlert.id,
        assignedDepartment: assignedDept,
        priority,
        actionType,
        operationalNotes: opNotes
      });
      if (res.success) {
        setSelectedAlert(null);
        setActiveTab('tickets');
        loadData();
      }
    } catch (err) {
      alert(`Ticket creation error: ${err.message}`);
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleUpdateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setUpdatingTicket(true);
    try {
      const res = await api.updateActionTicket(selectedTicket.id, {
        verificationStatus: ticketStatus,
        outcomeType,
        outcomeNotes
      });
      if (res.success) {
        setSelectedTicket(null);
        loadData();
      }
    } catch (err) {
      alert(`Update error: ${err.message}`);
    } finally {
      setUpdatingTicket(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-inter text-xs">
      <DisclaimerBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2 font-space">
            <Ticket className="w-5 h-5 text-[#22D3EE]" />
            Alert Early-Warning & Preventive Action Management
          </h2>
          <p className="text-[13px] text-slate-600 dark:text-slate-400 font-normal mt-0.5">
            Convert intelligence alerts into accountable preventive action tickets and log field outcomes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-1.5 rounded-lg text-[11px] uppercase tracking-[0.5px] font-medium transition-all cursor-pointer ${
              activeTab === 'tickets' ? 'bg-[#22D3EE] text-black shadow-glow-cyan font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Action Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-1.5 rounded-lg text-[11px] uppercase tracking-[0.5px] font-medium transition-all cursor-pointer ${
              activeTab === 'alerts' ? 'bg-[#22D3EE] text-black shadow-glow-cyan font-semibold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Active Alerts ({alerts.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 font-mono text-xs animate-pulse">
          Loading operations data...
        </div>
      ) : activeTab === 'tickets' ? (
        /* Action Tickets Ledger */
        <div className="space-y-3.5">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-inter bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800">
              No action tickets created yet. Check active alerts to dispatch interventions.
            </div>
          ) : (
            tickets.map((tk) => (
              <div key={tk.id} className="p-5 rounded-2xl bg-white dark:bg-[#111827] space-y-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 font-mono">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-sm text-[#22D3EE]">{tk.ticket_code}</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">Alert: {tk.alert_code}</span>
                    <StatusBadge status={tk.verification_status} />
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 text-xs">
                    Priority: <strong className="text-red-500">{tk.priority}</strong> • District: <strong className="text-slate-900 dark:text-slate-200">{tk.district_name}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase block font-medium tracking-[0.5px]">Assigned Department</span>
                    <span className="text-slate-900 dark:text-slate-200 font-medium text-xs font-inter">{tk.assigned_department}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase block font-medium tracking-[0.5px]">Intervention Action</span>
                    <span className="text-amber-500 font-medium text-xs font-mono">{tk.action_type}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase block font-medium tracking-[0.5px]">Created Timestamp</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-mono">{tk.created_at}</span>
                  </div>
                </div>

                {tk.operational_notes && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 text-[13px] text-slate-800 dark:text-slate-300 font-inter font-normal">
                    <strong>Operational Deployment Notes:</strong> {tk.operational_notes}
                  </div>
                )}

                {tk.outcome_notes && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[13px] text-emerald-900 dark:text-emerald-300 font-inter font-normal">
                    <strong>Recorded Outcome ({tk.outcome_type}):</strong> {tk.outcome_notes}
                  </div>
                )}

                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() => setSelectedTicket(tk)}
                    className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-[#22D3EE] hover:text-black text-[#22D3EE] text-[11px] font-semibold uppercase tracking-[0.5px] border border-cyan-500/30 cursor-pointer shadow-sm transition-all"
                  >
                    Update Intervention Outcome
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Alerts List */
        <div className="space-y-3.5">
          {alerts.map((al) => (
            <div key={al.id} className="command-card p-5 space-y-3.5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 font-mono">
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-sm text-amber-800 dark:text-amber-400">{al.alert_code}</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-bold">{al.alert_type}</span>
                  <StatusBadge status={al.status} />
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-xs font-bold">
                  District: <strong className="text-slate-900 dark:text-slate-200">{al.district_name}</strong>
                </div>
              </div>

              <div>
                <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm font-mono">{al.title}</h4>
                <p className="text-slate-700 dark:text-slate-300 text-xs mt-1.5 font-sans leading-relaxed font-medium">{al.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 font-mono">
                <div className="flex items-center gap-2.5">
                  <RiskBadge level={al.risk_level} />
                  <span className="text-blue-700 dark:text-cyan-300 font-bold text-xs">{al.confidence_level} CONF</span>
                </div>

                {al.status !== 'TICKET_CREATED' && (
                  <button
                    onClick={() => setSelectedAlert(al)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Dispatch Action Ticket
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Action Ticket */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div onClick={() => setSelectedAlert(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-10 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 font-mono">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase">
                Dispatch Preventive Action Ticket: {selectedAlert.alert_code}
              </h3>
              <button onClick={() => setSelectedAlert(null)} className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3.5 font-mono">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-bold">Assigned Department / Unit</label>
                <input
                  type="text"
                  required
                  value={assignedDept}
                  onChange={(e) => setAssignedDept(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-bold">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-bold">Action Type</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="FIELD_VERIFICATION">FIELD VERIFICATION</option>
                    <option value="CHECKPOST_INSPECTION_ENHANCEMENT">CHECKPOST INSPECTION</option>
                    <option value="SPECIAL_PATROL_MONITORING">SPECIAL PATROL</option>
                    <option value="COMMUNITY_AWARENESS">COMMUNITY AWARENESS</option>
                    <option value="DEPT_COORDINATION">INTER-DEPT COORDINATION</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-bold">Operational Instructions</label>
                <textarea
                  rows={3}
                  value={opNotes}
                  onChange={(e) => setOpNotes(e.target.value)}
                  placeholder="Specific checkpoint orders, drone reconnaissance, or joint task force coordination notes..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-slate-100 font-sans font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {creatingTicket ? 'Dispatching...' : 'Dispatch Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Outcome */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div onClick={() => setSelectedTicket(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-10 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 font-mono">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase">
                Log Outcome: {selectedTicket.ticket_code}
              </h3>
              <button onClick={() => setSelectedTicket(null)} className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTicketSubmit} className="space-y-3.5 font-mono">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-bold">Ticket Status</label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="UNDER_VERIFICATION">UNDER VERIFICATION</option>
                  <option value="ACTION_TAKEN">ACTION TAKEN</option>
                  <option value="MONITORING">MONITORING ONGOING</option>
                  <option value="CLOSED">CLOSED (Completed)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-bold">Outcome Classification</label>
                <select
                  value={outcomeType}
                  onChange={(e) => setOutcomeType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="PREVENTIVE_INTERVENTION_COMPLETED">PREVENTIVE INTERVENTION COMPLETED</option>
                  <option value="EVIDENCE_CORROBORATED">EVIDENCE CORROBORATED & SECURED</option>
                  <option value="REFERRED_TO_REHAB">REFERRED TO HEALTH / COUNSELING WING</option>
                  <option value="FALSE_ALARM_RESOLVED">FALSE ALARM / DISMISSED SAFELY</option>
                  <option value="MONITORING_ONGOING">MONITORING ONGOING</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1 font-bold">Outcome Observations & Findings</label>
                <textarea
                  rows={3}
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="Record factual observations, checkpost logs verified, or intervention results..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-slate-100 font-sans font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingTicket}
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {updatingTicket ? 'Saving...' : 'Commit Outcome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
