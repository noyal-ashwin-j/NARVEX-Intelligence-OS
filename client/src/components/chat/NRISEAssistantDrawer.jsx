import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  ChevronRight,
  ArrowRight,
  Database,
  Shield,
  HelpCircle,
  MessageSquare,
  MapPin,
  TrendingUp,
  Radio,
  Layers,
  Clock,
  CheckCircle2,
  Scale,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';
import { api } from '../../services/api';

export function NRISEAssistantDrawer({
  isOpen,
  onClose,
  activeDistrictId = 2,
  activeTab = 'command-center',
  onNavigateTab,
  onSelectDistrict
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello Officer. I am the **NARVEX Intelligence Assistant**, connected directly to the Tamil Nadu State Narcotic Intelligence Ledger (38 Districts).\n\nYou can speak or type in **Tamil (தமிழ்), Tanglish, or English**:\n• *"Innaiku entha district worst-ah iruku?"*\n• *"What changed today?"*\n• *"Show first-time signals in zero-history areas"*\n• *"Show inter-state transit corridors from Kerala & Karnataka"*\n• *"Show Coimbatore last 30 days"*`,
      actions: [
        { label: '⚡ What Changed Today?', query: 'What changed today?' },
        { label: '📈 Highest Increasing Risk', query: 'Which district has highest increasing risk?' },
        { label: '🟣 First-Time Signals', query: 'Show first-time signals' },
        { label: '🛣️ Inter-State Corridors', query: 'Show inter-state transit corridors' }
      ],
      metadata: {
        dataSource: 'State Central Repository (Real-time MySQL)',
        confidence: '95.0% Grounded Query'
      },
      timestamp: 'Just now'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speakingId, setSpeakingId] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // accepts Tamil/English blend

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Text-to-Speech Function
  const speakText = (text, langCode = 'en-IN', msgId = null) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // stop previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick appropriate voice
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

    if (msgId) setSpeakingId(msgId);

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      }
    }
  };

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.queryAssistant({
        query: textToSend,
        activeDistrictId,
        activeTab
      });

      if (res.success) {
        const botMsgId = `bot-${Date.now()}`;
        const botMsg = {
          id: botMsgId,
          sender: 'assistant',
          text: res.response,
          spokenText: res.spokenText,
          language: res.language,
          actions: res.actions || [],
          dataPayload: res.dataPayload,
          metadata: res.metadata,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);

        // Speak the response aloud if voice output is enabled
        if (res.spokenText) {
          const speechLang = res.language === 'ta' ? 'ta-IN' : 'en-IN';
          speakText(res.spokenText, speechLang, botMsgId);
        }

        // Execute Tab Directives
        if (res.tabAction && onNavigateTab) {
          onNavigateTab(res.tabAction);
        }

        // Execute District Selection Directives
        if (res.mapAction?.districtId && onSelectDistrict) {
          onSelectDistrict(res.mapAction.districtId);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ Query processing error: ${err.message}. Please try a different query.`,
          timestamp: 'Now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 shadow-2xl flex flex-col font-inter ${
        isFullScreen
          ? 'inset-4 rounded-3xl bg-[#0B0F19]/95 backdrop-blur-xl border border-cyan-500/30'
          : 'bottom-4 right-4 w-[460px] max-w-[95vw] h-[640px] max-h-[85vh] rounded-3xl bg-[#0B0F19]/95 backdrop-blur-xl border border-slate-800 shadow-glow-cyan'
      }`}
    >
      {/* Header */}
      <div className="p-4 rounded-t-3xl bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white uppercase tracking-wider font-space">
                NARVEX Assistant
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono">
                Multilingual
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">
              State Intelligence Natural-Language Interface
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          {/* Voice Output Toggle */}
          <button
            onClick={() => {
              if (voiceEnabled) window.speechSynthesis?.cancel();
              setVoiceEnabled(!voiceEnabled);
            }}
            title={voiceEnabled ? 'Voice output enabled' : 'Voice output muted'}
            className={`p-1.5 rounded-xl hover:bg-slate-800 transition-colors ${voiceEnabled ? 'text-cyan-400' : 'text-slate-500'}`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Full Screen Toggle */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user';

          return (
            <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl ${
                  isUser
                    ? 'bg-cyan-500 text-slate-950 font-medium rounded-br-none shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

                {/* Speech Replay Button on Assistant Messages */}
                {!isUser && m.spokenText && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <button
                      onClick={() => speakText(m.spokenText, m.language === 'ta' ? 'ta-IN' : 'en-IN', m.id)}
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Speak Aloud
                    </button>
                    {m.language && (
                      <span className="uppercase font-mono text-[9px] text-slate-500">
                        Language: {m.language}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Action Chips */}
              {m.actions && m.actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                  {m.actions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (act.query) {
                          handleSend(act.query);
                        } else if (act.tab && onNavigateTab) {
                          if (act.districtId && onSelectDistrict) {
                            onSelectDistrict(act.districtId);
                          }
                          onNavigateTab(act.tab);
                        }
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 text-[11px] font-medium transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <span>{act.label}</span>
                      <ChevronRight className="w-3 h-3 opacity-60" />
                    </button>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs w-fit">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>NARVEX Assistant analyzing state repository...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box with Voice Recognition */}
      <div className="p-3.5 rounded-b-3xl bg-slate-900/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Mic Button */}
          <button
            type="button"
            onClick={toggleVoiceListening}
            className={`p-2.5 rounded-2xl border transition-all ${
              isListening
                ? 'bg-red-500 text-white border-red-400 animate-pulse shadow-lg'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Speak voice command in Tamil/English/Tanglish'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Listening to voice command...' : 'Ask in Tamil, English, or Tanglish...'}
            disabled={loading}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 transition-all font-semibold cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
