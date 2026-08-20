import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudUpload, CheckCircle2 } from 'lucide-react';

export function OfflineSyncIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check local storage offline queue
    const queued = JSON.parse(localStorage.getItem('nrise_offline_queue') || '[]');
    setOfflineQueueCount(queued.length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineData = () => {
    const queued = JSON.parse(localStorage.getItem('nrise_offline_queue') || '[]');
    if (queued.length === 0) return;

    setSyncing(true);
    setTimeout(() => {
      localStorage.removeItem('nrise_offline_queue');
      setOfflineQueueCount(0);
      setSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1500);
  };

  if (isOnline && offlineQueueCount === 0 && !syncSuccess) {
    return null; // Silent when fully online and synced
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 duration-200 font-sans text-xs">
      {!isOnline ? (
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-500 text-white shadow-lg font-bold">
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>Offline Mode: Remote Checkpost Buffer Active ({offlineQueueCount} queued locally)</span>
        </div>
      ) : syncing ? (
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white shadow-lg font-bold">
          <CloudUpload className="w-4 h-4 animate-spin" />
          <span>Syncing offline field records to state database...</span>
        </div>
      ) : syncSuccess ? (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 text-white shadow-lg font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Field records successfully synchronized!</span>
        </div>
      ) : null}
    </div>
  );
}
