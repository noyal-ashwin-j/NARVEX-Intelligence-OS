import React, { useEffect, useState, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Zap,
  Activity,
  Shield,
  RotateCcw,
  Radio,
  ChevronRight,
  HelpCircle,
  Cpu,
  Layers,
  Globe,
  Flame,
  RadioTower,
  UserCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { playClickSound, playHoverSound, playModalSound } from '../../utils/soundEffects';

/**
 * Advanced Interactive Holographic Quantum Visualizer Canvas Component
 */
function HolographicAvatarCanvas({ avatarState, isListening }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = (canvas.width = 64);
    const height = (canvas.height = 64);
    const cx = width / 2;
    const cy = height / 2;

    let angle1 = 0;
    let angle2 = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // State-based theme colors
      let primaryColor = '#22D3EE'; // Cyan (IDLE)
      let secondaryColor = '#818CF8'; // Indigo
      let speed = 0.02;

      if (avatarState === 'LISTENING' || isListening) {
        primaryColor = '#EF4444'; // Red
        secondaryColor = '#F87171';
        speed = 0.08;
      } else if (avatarState === 'THINKING') {
        primaryColor = '#38BDF8'; // Blue
        secondaryColor = '#F59E0B'; // Gold
        speed = 0.15;
      } else if (avatarState === 'SPEAKING') {
        primaryColor = '#10B981'; // Emerald
        secondaryColor = '#34D399';
        speed = 0.04;
      } else if (avatarState === 'ALERT') {
        primaryColor = '#F59E0B'; // Amber
        secondaryColor = '#EF4444';
        speed = 0.12;
      }

      angle1 += speed;
      angle2 -= speed * 1.5;

      // 1. Outer Orbiting Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle1);
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 1.6);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 8;
      ctx.shadowColor = primaryColor;
      ctx.stroke();
      ctx.restore();

      // 2. Counter-Rotating Inner Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle2);
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 1.4);
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      // 3. Central Energy Core Pulse
      const pulse = Math.sin(Date.now() * 0.005) * 3 + 12;
      ctx.beginPath();
      ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
      ctx.fillStyle = primaryColor;
      ctx.shadowBlur = 14;
      ctx.shadowColor = primaryColor;
      ctx.fill();

      // 4. Equalizer frequency spikes if speaking or listening
      if (avatarState === 'SPEAKING' || avatarState === 'LISTENING' || isListening) {
        const barCount = 8;
        for (let i = 0; i < barCount; i++) {
          const a = (i / barCount) * Math.PI * 2 + angle1;
          const h = Math.random() * 8 + 4;
          const x1 = cx + Math.cos(a) * 16;
          const y1 = cy + Math.sin(a) * 16;
          const x2 = cx + Math.cos(a) * (16 + h);
          const y2 = cy + Math.sin(a) * (16 + h);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [avatarState, isListening]);

  return <canvas ref={canvasRef} className="w-16 h-16 pointer-events-none" />;
}

export function NarvexAvatarCore({
  activeDistrictId = 2,
  onNavigateTab,
  onSelectDistrict,
  onOpenWhyFlagged
}) {
  const [avatarState, setAvatarState] = useState('IDLE'); // IDLE, LISTENING, THINKING, SPEAKING, ALERT
  const [input, setInput] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [handsFreeMode, setHandsFreeMode] = useState(true); // Always-On Hands Free Voice
  const [latestResponse, setLatestResponse] = useState(null);

  const recognitionRef = useRef(null);

  // Auto-speak greeting on mount & startup
  useEffect(() => {
    const hour = new Date().getHours();
    let greetingPrefix = 'Good morning';
    if (hour >= 12 && hour < 17) {
      greetingPrefix = 'Good afternoon';
    } else if (hour >= 17 || hour < 5) {
      greetingPrefix = 'Good evening';
    }

    const spokenGreeting = `${greetingPrefix} Boss! Welcome to NARVEX State Command Center. What would you like to know today?`;

    const initialGreeting = {
      success: true,
      response: `👋 **${greetingPrefix} Boss!** Welcome to the NARVEX Sovereign Command Center.\n\nAll 38 district intelligence nodes, border checkpost ANPR telemetry, and SHA-256 audit chains are online.\n\n*Hands-free mic is active. Just speak your query anytime.*`,
      spokenText: spokenGreeting,
      actions: [
        { label: '⚡ What Changed Today?', query: 'What changed today?' },
        { label: '📈 Highest Escalating Risk', query: 'Innaiku entha district worst-ah iruku?' },
        { label: '🟣 First-Time Signals', query: 'Show first-time signals' },
        { label: '🛣️ Inter-State Corridors', query: 'Show inter-state transit corridors' }
      ]
    };

    setLatestResponse(initialGreeting);

    const timer = setTimeout(() => {
      speakText(spokenGreeting, 'en-IN');
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLang === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        setAvatarState('THINKING');
        handleSendQuery(transcript);
      };

      recognition.onerror = (err) => {
        setIsListening(false);
        if (avatarState === 'LISTENING') setAvatarState('IDLE');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (avatarState === 'LISTENING') setAvatarState('IDLE');
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  // Continuous Hands-Free Listening Loop
  useEffect(() => {
    if (handsFreeMode && !isListening && avatarState === 'IDLE' && !loading) {
      const autoListenTimer = setTimeout(() => {
        if (recognitionRef.current && handsFreeMode && !isListening && avatarState === 'IDLE') {
          try {
            recognitionRef.current.start();
            setIsListening(true);
            setAvatarState('LISTENING');
          } catch {
            // Already listening or starting
          }
        }
      }, 1200);
      return () => clearTimeout(autoListenTimer);
    }
  }, [handsFreeMode, isListening, avatarState, loading]);

  // Speech Synthesis Playback
  const speakText = (text, langCode = 'en-IN') => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setAvatarState('SPEAKING');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (langCode.startsWith('ta')) {
      const taVoice = voices.find((v) => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil'));
      if (taVoice) utterance.voice = taVoice;
      utterance.lang = 'ta-IN';
    } else {
      const inVoice = voices.find((v) => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india'));
      if (inVoice) utterance.voice = inVoice;
      utterance.lang = 'en-IN';
    }

    utterance.onend = () => setAvatarState('IDLE');
    utterance.onerror = () => setAvatarState('IDLE');

    window.speechSynthesis.speak(utterance);
  };

  const toggleMic = () => {
    playClickSound();
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setAvatarState('IDLE');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setAvatarState('LISTENING');
      } catch (err) {
        console.error('Speech recognition error:', err);
        setIsListening(false);
        setAvatarState('IDLE');
      }
    }
  };

  const toggleHandsFree = () => {
    playClickSound();
    setHandsFreeMode(!handsFreeMode);
  };

  const handleSendQuery = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    playClickSound();
    if (!queryText) setInput('');
    setLoading(true);
    setAvatarState('THINKING');

    try {
      const res = await api.queryAssistant({
        query: textToSend,
        activeDistrictId
      });

      if (res.success) {
        playModalSound();
        setLatestResponse(res);

        if (res.spokenText) {
          const speechLang = res.language === 'ta' ? 'ta-IN' : 'en-IN';
          speakText(res.spokenText, speechLang);
        } else {
          setAvatarState('IDLE');
        }

        // Execute Tab Switching
        if (res.tabAction && onNavigateTab) {
          onNavigateTab(res.tabAction);
        }

        // Execute District Selection
        if (res.mapAction?.districtId && onSelectDistrict) {
          onSelectDistrict(res.mapAction.districtId);
        }
      } else {
        setLatestResponse({
          success: false,
          response: `⚠️ **Intelligence Query Processing**: ${res.message || 'System busy'}`
        });
        setAvatarState('ALERT');
        setTimeout(() => setAvatarState('IDLE'), 3000);
      }
    } catch (err) {
      console.error('NARVEX query error:', err);
      setAvatarState('ALERT');
      setTimeout(() => setAvatarState('IDLE'), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between p-5 rounded-3xl bg-[#080D1A]/95 backdrop-blur-2xl border border-cyan-500/40 shadow-[0_0_40px_rgba(34,211,238,0.15)] font-inter text-slate-100 space-y-4 overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Holographic Canvas Avatar & Telemetry Controls */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 z-10">
        <div className="flex items-center gap-3.5">
          {/* Animated 3D Quantum Canvas Visualizer Avatar */}
          <div className="relative flex items-center justify-center">
            <HolographicAvatarCanvas avatarState={avatarState} isListening={isListening} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-space">
                NARVEX AI CORE
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border ${
                  avatarState === 'LISTENING' || isListening
                    ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                    : avatarState === 'THINKING'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-spin'
                    : avatarState === 'SPEAKING'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                }`}
              >
                ● {avatarState}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
              <span>Autonomous Copilot</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">ALWAYS-HANDS-FREE ON</span>
            </div>
          </div>
        </div>

        {/* Controls: Hands-Free & Mute Toggle */}
        <div className="flex items-center gap-2">
          {/* Hands-free mode indicator button */}
          <button
            onClick={toggleHandsFree}
            onMouseEnter={playHoverSound}
            className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              handsFreeMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={handsFreeMode ? 'Hands-Free Always Listening is ON' : 'Click to enable Hands-Free mic'}
          >
            <RadioTower className={`w-3.5 h-3.5 ${handsFreeMode ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">{handsFreeMode ? 'HANDS-FREE' : 'MANUAL'}</span>
          </button>

          {/* Voice Mute Toggle */}
          <button
            onClick={() => {
              playClickSound();
              if (voiceEnabled) window.speechSynthesis?.cancel();
              setVoiceEnabled(!voiceEnabled);
            }}
            onMouseEnter={playHoverSound}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              voiceEnabled
                ? 'bg-cyan-500/15 text-[#22D3EE] border-cyan-500/40 shadow-glow-cyan'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={voiceEnabled ? 'Voice output active' : 'Voice output muted'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Suggested Quick Intelligence Prompts Grid */}
      <div className="space-y-1.5 z-10">
        <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">
          ⚡ Quick Intelligence Directives
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {[
            { label: '⚡ What Changed Today?', q: 'What changed today?', icon: Sparkles },
            { label: '📈 Highest Escalating Risk', q: 'Innaiku entha district worst-ah iruku?', icon: Flame },
            { label: '🟣 First-Time Signals', q: 'Show first-time signals', icon: Layers },
            { label: '🛣️ Inter-State Corridors', q: 'Show inter-state transit corridors', icon: Globe }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onMouseEnter={playHoverSound}
                onClick={() => handleSendQuery(item.q)}
                className="group p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-300 transition-all cursor-pointer font-mono text-left flex items-center gap-2 truncate shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Latest Agent Intelligence Response Card */}
      <div className="flex-1 overflow-y-auto custom-scrollbar z-10 my-1">
        {latestResponse ? (
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/40 space-y-3 animate-fade-in text-xs shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  Directive Output
                </span>
              </div>
              {latestResponse.spokenText && (
                <button
                  onClick={() => {
                    playClickSound();
                    speakText(latestResponse.spokenText, latestResponse.language === 'ta' ? 'ta-IN' : 'en-IN');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 text-[10px] font-mono cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Replay Speech
                </button>
              )}
            </div>

            <div className="whitespace-pre-wrap leading-relaxed text-slate-200 text-[11.5px] font-inter">
              {latestResponse.response}
            </div>

            {/* Quick Action Pills */}
            {latestResponse.actions && latestResponse.actions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {latestResponse.actions.map((act, idx) => (
                  <button
                    key={idx}
                    onMouseEnter={playHoverSound}
                    onClick={() => {
                      playClickSound();
                      if (act.query) handleSendQuery(act.query);
                      if (act.tab && onNavigateTab) onNavigateTab(act.tab);
                      if (act.districtId && onSelectDistrict) onSelectDistrict(act.districtId);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-glow-cyan"
                  >
                    <span>{act.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full min-h-[140px] flex flex-col items-center justify-center p-4 text-center rounded-2xl bg-slate-950/40 border border-slate-800/60 text-slate-400 font-mono text-xs space-y-2">
            <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <p className="text-slate-300 font-medium">Ready for Natural Language Command</p>
            <p className="text-[10px] text-slate-400">Speak or type queries in Tamil, English, or Tanglish</p>
          </div>
        )}
      </div>

      {/* Voice & Text Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        className="space-y-2 z-10 pt-1 border-t border-slate-800/80"
      >
        <div className="flex items-center gap-2">
          {/* Push-to-Talk / Hands-Free Voice Mic */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white border-red-400 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                : 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border-slate-700'
            }`}
            title={isListening ? 'Listening to your voice...' : 'Hands-Free mic active - speak anytime'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? '🎙️ Listening... speak now' : 'Command NARVEX (Tamil / English / Tanglish)...'}
              disabled={loading}
              className="w-full bg-slate-950 border border-slate-800 focus:border-[#22D3EE] rounded-2xl pl-4 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono transition-all"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              onMouseEnter={playHoverSound}
              className="absolute right-1.5 top-1.5 p-2 rounded-xl bg-[#22D3EE] hover:bg-[#06B6D4] disabled:opacity-20 text-black font-bold transition-all cursor-pointer shadow-glow-cyan"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
