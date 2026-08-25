import React, { useState, useEffect } from 'react';
import { Radio, AlertTriangle, ShieldCheck, Camera, Bell, X } from 'lucide-react';

/**
 * Real-Time Notification Ticker Component (Server-Sent Events)
 * Listens to /api/stream/live-intelligence and displays live checkpost ANPR telemetry
 */
export function RealtimeNotificationTicker() {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventCount, setEventCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let eventSource = null;
    try {
      eventSource = new EventSource('/api/stream/live-intelligence');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ANPR_TELEMETRY') {
            setCurrentEvent(data);
            setEventCount(prev => prev + 1);
            setDismissed(false);
          }
        } catch (err) {
          // ignore stream parse errors
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch (err) {
      console.error('SSE Live Stream connection error:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  if (!currentEvent || dismissed) return null;

  const isWatchlist = currentEvent.status === 'WATCHLIST_MATCH' || currentEvent.status === 'CONVOY_ALERT';

  return (
    <div className={`p-2.5 px-4 rounded-xl border font-inter text-xs shadow-lg transition-all flex items-center justify-between gap-3 animate-pulse ${
      isWatchlist
        ? 'bg-red-950/90 text-red-200 border-red-800'
        : 'bg-slate-900/90 text-cyan-200 border-slate-700'
    }`}>
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-lg ${isWatchlist ? 'bg-red-600 text-white' : 'bg-cyan-600 text-white'}`}>
          {isWatchlist ? <AlertTriangle className="size-3.5" /> : <Camera className="size-3.5" />}
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Radio className="size-3 text-cyan-400 animate-spin" /> LIVE ANPR TELEMETRY STREAM #{eventCount}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {new Date(currentEvent.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <p className="font-medium text-slate-100 text-[11px] leading-tight">
            <strong>{currentEvent.checkpost}</strong>: Vehicle <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300 border border-slate-800">{currentEvent.plate}</span> ({currentEvent.vehicleType}) — <span className={isWatchlist ? 'text-red-400 font-bold' : 'text-emerald-400'}>{currentEvent.alert}</span>
          </p>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
        title="Dismiss Ticker"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
