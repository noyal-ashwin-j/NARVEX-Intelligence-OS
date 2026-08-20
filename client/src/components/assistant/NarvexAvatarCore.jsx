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
  HelpCircle
} from 'lucide-react';
import { api } from '../../services/api';

/**
 * NARVEX AI Core Avatar & Centralized Intelligence Copilot
 * 
 * Avatar Visual States:
 * - 'IDLE': Ambient floating quantum intelligence rings
 * - 'LISTENING': Audio waveform reactive equalizer pulse
 * - 'THINKING': High-speed orbital data acceleration
 * - 'ALERT': Amber/red threat beacon pulse
 * - 'SPEAKING': Harmonic soundwave expansion
 */

export function NarvexAvatarCore({
  activeDistrictId = 2,
  onNavigateTab,
  onSelectDistrict,
  onOpenWhyFlagged
}) {
  const [avatarState, setAvatarState] = useState('IDLE'); // IDLE, LISTENING, THINKING, SPEAKING, ALERT
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [latestResponse, setLatestResponse] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        setAvatarState('THINKING');
        handleSendQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setAvatarState('IDLE');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (avatarState === 'LISTENING') setAvatarState('IDLE');
      };

      recognitionRef.current = recognition;
    }
  }, [avatarState]);

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

  const handleSendQuery = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    if (!queryText) setInput('');
    setLoading(true);
    setAvatarState('THINKING');

    try {
      const res = await api.queryAssistant({
        query: textToSend,
        activeDistrictId
      });

      if (res.success) {
        setLatestResponse(res);
        setExpanded(true);

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
    <div className="p-4 rounded-3xl bg-[#090E1A] border border-cyan-500/30 shadow-glow-cyan space-y-4 font-inter text-slate-100">
      {/* Header with Avatar & Status */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {/* Animated Holographic NARVEX AI Core Avatar */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Outer Rotating Quantum Ring */}
            <div
              className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-700 ${
                avatarState === 'LISTENING'
                  ? 'border-red-400 animate-ping'
                  : avatarState === 'THINKING'
                  ? 'border-cyan-400 animate-spin'
                  : avatarState === 'SPEAKING'
                  ? 'border-emerald-400 animate-pulse scale-110'
                  : avatarState === 'ALERT'
                  ? 'border-amber-400 animate-bounce'
                  : 'border-cyan-500/40 animate-spin-slow'
              }`}
              style={{ animationDuration: avatarState === 'THINKING' ? '1.5s' : '10s' }}
            />

            {/* Inner Core Halo */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                avatarState === 'LISTENING'
                  ? 'bg-red-500 shadow-lg shadow-red-500/50'
                  : avatarState === 'THINKING'
                  ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50'
                  : avatarState === 'SPEAKING'
                  ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                  : avatarState === 'ALERT'
                  ? 'bg-amber-500 shadow-lg shadow-amber-500/50'
                  : 'bg-gradient-to-tr from-cyan-600 to-purple-600 shadow-glow-cyan'
              }`}
            >
              <Zap className="w-4 h-4 text-white animate-pulse" />
            </div>

            {/* Small State Beacon */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#090E1A] ${
                avatarState === 'LISTENING'
                  ? 'bg-red-500 animate-ping'
                  : avatarState === 'THINKING'
                  ? 'bg-cyan-400 animate-spin'
                  : avatarState === 'SPEAKING'
                  ? 'bg-emerald-400'
                  : avatarState === 'ALERT'
                  ? 'bg-amber-400'
                  : 'bg-cyan-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider font-space">
                NARVEX AI CORE
              </h3>
              <span className="px-2 py-0.2 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono uppercase">
                {avatarState}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Autonomous Intelligence Agent • State Copilot
            </p>
          </div>
        </div>

        {/* Voice Toggle */}
        <button
          onClick={() => {
            if (voiceEnabled) window.speechSynthesis?.cancel();
            setVoiceEnabled(!voiceEnabled);
          }}
          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
            voiceEnabled ? 'bg-cyan-950 text-cyan-300 border-cyan-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
          title={voiceEnabled ? 'Voice output active' : 'Voice output muted'}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Suggested Quick Natural Language Intelligence Queries */}
      <div className="flex flex-wrap gap-1.5 text-[10px]">
        {[
          { label: '⚡ What Changed Today?', q: 'What changed today?' },
          { label: '📈 Highest Increasing Risk', q: 'Innaiku entha district worst-ah iruku?' },
          { label: '🟣 First-Time Signals', q: 'Show first-time signals' },
          { label: '🛣️ Inter-State Corridors', q: 'Show inter-state transit corridors' }
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(item.q)}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 transition-all cursor-pointer font-mono flex items-center gap-1"
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Latest Agent Intelligence Response Card */}
      {latestResponse && (
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-2.5 animate-in fade-in text-xs">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase">
              Intelligence Directive Output
            </span>
            {latestResponse.spokenText && (
              <button
                onClick={() => speakText(latestResponse.spokenText, latestResponse.language === 'ta' ? 'ta-IN' : 'en-IN')}
                className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 text-[10px] cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Replay Speech
              </button>
            )}
          </div>

          <div className="whitespace-pre-wrap leading-relaxed text-slate-200 text-[11px]">
            {latestResponse.response}
          </div>

          {/* Quick Action Buttons */}
          {latestResponse.actions && latestResponse.actions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {latestResponse.actions.map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (act.tab && onNavigateTab) onNavigateTab(act.tab);
                    if (act.districtId && onSelectDistrict) onSelectDistrict(act.districtId);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-all"
                >
                  <span>{act.label}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Voice & Text Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        className="flex items-center gap-2 pt-1"
      >
        {/* Push-to-Talk Voice Mic */}
        <button
          type="button"
          onClick={toggleMic}
          className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
            isListening
              ? 'bg-red-500 text-white border-red-400 animate-pulse shadow-lg'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
          }`}
          title={isListening ? 'Listening... click to stop' : 'Speak in Tamil, English, or Tanglish'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'Listening to voice query...' : 'Command NARVEX (Tamil / English / Tanglish)...'}
          disabled={loading}
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-2xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-slate-950 font-bold transition-all cursor-pointer shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
