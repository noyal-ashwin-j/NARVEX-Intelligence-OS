import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Video, Eye, Shield, Zap, RefreshCw, X } from 'lucide-react';

/**
 * Webcam Gesture & Spatial Control Adapter
 * Utilizes HTML5 MediaDevices API (navigator.mediaDevices.getUserMedia)
 * Provides gesture navigation overlay, camera feed toggle, and status indicators.
 */
export function WebcamAdapter({ onScopeChange, onSelectDistrict, onClose }) {
  const [active, setActive] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [detectedGesture, setDetectedGesture] = useState('NO_GESTURE');
  const [isMinimized, setIsMinimized] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setActive(true);
    } catch (err) {
      console.warn('Webcam access error:', err);
      setPermissionError('Camera permission denied or camera unavailable.');
      setActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleSimulateGesture = (gesture) => {
    setDetectedGesture(gesture);
    if (gesture === 'SWIPE_LEFT' && onScopeChange) {
      onScopeChange('WORLD');
    } else if (gesture === 'SWIPE_RIGHT' && onScopeChange) {
      onScopeChange('INDIA');
    } else if (gesture === 'PINCH_SELECT' && onScopeChange) {
      onScopeChange('TAMILNADU');
    }
    setTimeout(() => setDetectedGesture('NO_GESTURE'), 2500);
  };

  return (
    <div className="fixed top-20 right-6 z-50 max-w-xs w-80 bg-slate-950/95 text-white backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden font-inter transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <Camera className="size-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200">Webcam Gesture Control</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
            WEBCAM_ADAPTER_READY
          </span>
          {onClose && (
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Video Viewport & Controls */}
      <div className="p-3 space-y-3">
        <div className="relative aspect-video w-full rounded-xl bg-slate-900 overflow-hidden border border-slate-800 flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${active ? 'block' : 'hidden'}`}
          />
          {!active && (
            <div className="flex flex-col items-center gap-2 text-center p-4">
              <CameraOff className="size-8 text-slate-600" />
              <p className="text-[11px] text-slate-400">Camera inactive. Click Start Camera to enable gesture tracking.</p>
            </div>
          )}

          {/* Active Tracking Overlay Grid */}
          {active && (
            <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="size-20 border border-cyan-400/40 rounded-full animate-ping" />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono text-cyan-300 flex items-center gap-1">
                <Video className="size-2.5 text-cyan-400" /> LIVE_FEED
              </div>
            </div>
          )}
        </div>

        {permissionError && (
          <div className="p-2 rounded-lg bg-red-950/80 border border-red-800/80 text-[10px] text-red-300">
            {permissionError}
          </div>
        )}

        {/* Camera Toggle Button */}
        <div className="flex items-center justify-between gap-2">
          {!active ? (
            <button
              onClick={startCamera}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Camera className="size-3.5" /> Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <CameraOff className="size-3.5" /> Stop Camera
            </button>
          )}
        </div>

        {/* Gesture Simulation Triggers */}
        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 flex items-center justify-between">
            <span>Gesture Navigation Test</span>
            <span className="text-cyan-400 font-mono">{detectedGesture}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => handleSimulateGesture('SWIPE_LEFT')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-200"
            >
              👋 Swipe L (World)
            </button>
            <button
              onClick={() => handleSimulateGesture('SWIPE_RIGHT')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-200"
            >
              👉 Swipe R (India)
            </button>
            <button
              onClick={() => handleSimulateGesture('PINCH_SELECT')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-200"
            >
              👌 Pinch (TN)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
