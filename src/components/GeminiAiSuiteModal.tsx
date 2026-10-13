import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Search,
  MapPin,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  Bot,
  User,
  ShieldCheck,
  Zap,
  Compass,
  Cpu,
  RefreshCw,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
  mode?: 'chat' | 'search' | 'maps' | 'voice';
  modelUsed?: string;
  sources?: Array<{ title: string; uri: string }>;
  mapSources?: Array<{ title: string; uri: string }>;
}

interface GeminiAiSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'chat' | 'search' | 'maps' | 'voice';
  onBookCar?: (carId: string) => void;
}

export const GeminiAiSuiteModal: React.FC<GeminiAiSuiteModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'chat',
  onBookCar
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'search' | 'maps' | 'voice'>(initialMode);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'concierge' | 'technical_advisor' | 'trip_curator'>('concierge');
  const [selectedComplexity, setSelectedComplexity] = useState<'fast' | 'general' | 'complex'>('general');

  // Voice recording / Live API state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceAudioActive, setVoiceAudioActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Chat conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'model',
      text: 'Welcome to the Velox Drive Intelligence Suite. I am powered by Google Gemini to assist you with bespoke vehicle selection, live Google Search insights, precise Google Maps routing, or real-time voice conversations. How may I curate your experience today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: 'chat',
      modelUsed: 'gemini-3.5-flash'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  // Handle Chat Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: activeTab
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      if (activeTab === 'search') {
        // Feature 3: Search Grounding with gemini-3.5-flash & googleSearch
        const res = await fetch('/api/ai/search-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: userText })
        });
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            sender: 'model',
            text: data.reply || 'No search results found.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mode: 'search',
            modelUsed: data.modelUsed || 'gemini-3.5-flash',
            sources: data.sources || []
          }
        ]);
      } else if (activeTab === 'maps') {
        // Feature 5: Maps Grounding with gemini-3.5-flash & googleMaps
        const res = await fetch('/api/ai/maps-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: userText,
            latitude: 12.9716,
            longitude: 77.5946
          })
        });
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            sender: 'model',
            text: data.reply || 'No map information retrieved.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mode: 'maps',
            modelUsed: data.modelUsed || 'gemini-3.5-flash',
            mapSources: data.mapSources || []
          }
        ]);
      } else {
        // Feature 4: Multi-turn Chatbot with Roles & Model Selection
        // Format conversation history
        const history = messages.slice(-8).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text
        }));

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            history,
            role: selectedRole,
            complexity: selectedComplexity
          })
        });
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: `model-${Date.now()}`,
            sender: 'model',
            text: data.reply || 'Our concierge team is at your disposal.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mode: 'chat',
            modelUsed: data.modelUsed
          }
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          sender: 'model',
          text: 'Unable to reach the concierge network. Please check your network connection or tap Connect on WhatsApp VIP.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Feature 2: Live Voice Conversations with gemini-3.8-live
  const toggleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setVoiceAudioActive(false);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        setVoiceAudioActive(true);
        setVoiceTranscript('Listening... Speak naturally with Gemini Live API');

        // Speech recognition if browser supported
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            setVoiceTranscript(`You: "${transcript}"`);
            setIsRecording(false);
            setLoading(true);

            // Send to Live Voice endpoint
            const res = await fetch('/api/ai/live-voice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: transcript })
            });
            const data = await res.json();

            setMessages((prev) => [
              ...prev,
              {
                id: `user-${Date.now()}`,
                sender: 'user',
                text: transcript,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                mode: 'voice'
              },
              {
                id: `model-${Date.now()}`,
                sender: 'model',
                text: data.replyText || 'I am ready to assist.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                mode: 'voice',
                modelUsed: 'gemini-3.8-live'
              }
            ]);
            setLoading(false);

            // Spoken voice reply via browser synthesis
            if ('speechSynthesis' in window) {
              const utter = new SpeechSynthesisUtterance(data.replyText);
              utter.rate = 1.0;
              window.speechSynthesis.speak(utter);
            }
          };
          recognition.start();
        }
      } catch (err) {
        alert('Microphone permission required for Live Voice conversations.');
        setIsRecording(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[90vh] max-h-[750px] bg-[#0A0B0E] border border-[#C9A45C]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 0 60px rgba(201, 164, 92, 0.15)' }}
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#0E0F14] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A45C]/15 border border-[#C9A45C]/40 flex items-center justify-center text-[#C9A45C] shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-num uppercase tracking-widest text-[#C9A45C] font-bold">
                  VELOX INTELLIGENCE SUITE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono-num font-bold bg-[#5ED39A]/20 text-[#5ED39A] border border-[#5ED39A]/30">
                  GEMINI 3.5 & LIVE API
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-luxury font-bold text-white tracking-wide">
                AI Concierge, Search & Maps Grounding
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="px-6 py-2.5 bg-[#07080A] border-b border-white/5 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-[#C9A45C] text-[#050505] shadow'
                  : 'text-[#999999] hover:text-white hover:bg-white/5'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Multi-turn Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-[#C9A45C] text-[#050505] shadow'
                  : 'text-[#999999] hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Google Search</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('maps')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'maps'
                  ? 'bg-[#C9A45C] text-[#050505] shadow'
                  : 'text-[#999999] hover:text-white hover:bg-white/5'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('voice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'voice'
                  ? 'bg-[#5ED39A] text-[#050505] shadow'
                  : 'text-[#999999] hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Live Voice (gemini-3.8-live)</span>
            </button>
          </div>

          {/* Chat Settings (Roles & Models) */}
          {activeTab === 'chat' && (
            <div className="hidden sm:flex items-center gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="bg-black/60 border border-white/15 rounded-lg px-2.5 py-1 text-[11px] font-mono-num text-[#C9A45C] focus:outline-none"
              >
                <option value="concierge">Role: Executive Concierge</option>
                <option value="technical_advisor">Role: Technical Specialist</option>
                <option value="trip_curator">Role: Route Curator</option>
              </select>

              <select
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value as any)}
                className="bg-black/60 border border-white/15 rounded-lg px-2.5 py-1 text-[11px] font-mono-num text-white/80 focus:outline-none"
              >
                <option value="fast">Model: gemini-3.1-flash-lite (Fast)</option>
                <option value="general">Model: gemini-3.5-flash (General)</option>
                <option value="complex">Model: gemini-3.1-pro-preview (Complex)</option>
              </select>
            </div>
          )}
        </div>

        {/* Scrollable Conversation Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              }`}
            >
              {msg.sender === 'model' && (
                <div className="w-8 h-8 rounded-lg bg-[#C9A45C]/15 border border-[#C9A45C]/40 flex items-center justify-center text-[#C9A45C] shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#C9A45C] text-[#050505] font-medium rounded-tr-none'
                    : 'bg-[#121318] text-[#ECECEC] border border-white/10 rounded-tl-none shadow-md'
                }`}
              >
                {/* Mode Tag & Model Badge */}
                {msg.sender === 'model' && (
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/5 text-[10px] font-mono-num text-[#888888]">
                    <span className="text-[#C9A45C] font-semibold uppercase">
                      {msg.mode === 'search'
                        ? 'Google Search Grounding'
                        : msg.mode === 'maps'
                        ? 'Google Maps Grounding'
                        : msg.mode === 'voice'
                        ? 'Live Voice Response'
                        : 'Gemini Assistant'}
                    </span>
                    {msg.modelUsed && <span>• {msg.modelUsed}</span>}
                  </div>
                )}

                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Google Search Grounding Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/10 space-y-1.5">
                    <span className="text-[10px] font-mono-num text-[#C9A45C] uppercase tracking-wider block font-semibold">
                      Verified Web Citations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-black/50 hover:bg-black border border-white/15 text-[10px] text-[#5ED39A] hover:text-white transition-colors"
                        >
                          <span className="truncate max-w-[180px]">{s.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Maps Grounding Sources */}
                {msg.mapSources && msg.mapSources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/10 space-y-1.5">
                    <span className="text-[10px] font-mono-num text-[#C9A45C] uppercase tracking-wider block font-semibold">
                      Google Maps Location Links:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.mapSources.map((m, idx) => (
                        <a
                          key={idx}
                          href={m.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E1520] hover:bg-[#152030] border border-[#5ED39A]/40 text-xs text-white transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#5ED39A]" />
                          <span className="font-semibold">{m.title}</span>
                          <ExternalLink className="w-3 h-3 text-white/50" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <span
                  className={`text-[9px] font-mono-num mt-2 block text-right ${
                    msg.sender === 'user' ? 'text-black/60' : 'text-white/40'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#C9A45C] animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>Analyzing automotive telemetry with Gemini...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Live Voice Banner (Active when in Voice Mode) */}
        {activeTab === 'voice' && (
          <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-black to-emerald-950/40 border-t border-emerald-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`p-3 rounded-full transition-all cursor-pointer shadow-lg ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[#5ED39A] hover:bg-[#7BE0AF] text-[#050505]'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <div>
                <span className="text-xs font-semibold text-white block">
                  {isRecording ? 'Listening to speech...' : 'Press Mic to Start Live Voice Conversation'}
                </span>
                <span className="text-[11px] text-[#888888]">
                  Powered by model gemini-3.8-live with real-time speech responses
                </span>
              </div>
            </div>

            {voiceTranscript && (
              <div className="px-3 py-1 rounded bg-black/60 border border-white/10 text-xs text-[#CCCCCC] max-w-sm truncate">
                {voiceTranscript}
              </div>
            )}
          </div>
        )}

        {/* Bottom Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-[#0E0F14] border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              activeTab === 'search'
                ? 'Ask anything with Google Search Grounding (e.g. "Latest 2026 Porsche GT3 reviews")...'
                : activeTab === 'maps'
                ? 'Ask for locations or routes with Google Maps Grounding (e.g. "Best scenic roads Bangalore to Coorg")...'
                : activeTab === 'voice'
                ? 'Type or speak to the Live API concierge...'
                : 'Ask our Gemini concierge about fleet specs, bookings, or VIP deliveries...'
            }
            className="flex-1 bg-black/60 border border-white/15 focus:border-[#C9A45C] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="p-2.5 rounded-xl bg-[#C9A45C] hover:bg-[#DFBD78] disabled:opacity-40 text-[#050505] transition-all cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
