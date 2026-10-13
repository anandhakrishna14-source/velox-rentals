import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Shield, Award, Sparkles, ChevronDown, Play, Pause, Volume2, VolumeX, Upload, Film, Lock, Unlock, MessageSquare } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { persistMediaItem, retrieveMediaItem } from '../utils/persistentStorage';
import { openWhatsAppEnquiry } from '../utils/whatsapp';

interface HeroSectionProps {
  onExploreCars: () => void;
  onBookDrive: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCars,
  onBookDrive
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [customVideoUrl, setCustomVideoUrl] = useState<string>('');

  const { isAdmin, requireAdmin } = useAdminAuth();

  // Default opening frame video
  const [videoSrc, setVideoSrc] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('velox_opening_video') || localStorage.getItem('velox_custom_3d_video');
      if (saved) return saved;
    }
    return 'https://assets.mixkit.co/videos/preview/mixkit-super-car-driving-through-the-city-41270-large.mp4';
  });

  // Retrieve persisted video from IndexedDB/Cloud on boot
  useEffect(() => {
    retrieveMediaItem('velox_opening_video').then(url => {
      if (url && url !== videoSrc) {
        setVideoSrc(url);
        if (videoRef.current) {
          videoRef.current.src = url;
          videoRef.current.play().catch(() => {});
        }
      }
    });
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleSound = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const persistedUrl = await persistMediaItem('velox_opening_video', file);
        setVideoSrc(persistedUrl);
        if (videoRef.current) {
          videoRef.current.src = persistedUrl;
          videoRef.current.play().catch(() => {});
        }
      } catch {
        const url = URL.createObjectURL(file);
        setVideoSrc(url);
      }
      setShowVideoModal(false);
      setIsPlaying(true);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customVideoUrl.trim()) {
      const url = customVideoUrl.trim();
      await persistMediaItem('velox_opening_video', url);
      setVideoSrc(url);
      setShowVideoModal(false);
      setCustomVideoUrl('');
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <section id="top" className="relative min-h-[95vh] flex items-center justify-center bg-[#050505] text-[#F5F5F5] overflow-hidden pt-10 pb-20">
      {/* ================= OPENING FRAME VIDEO BACKGROUND ================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover filter brightness-[0.45] contrast-110 scale-105 transition-all duration-700"
        />

        {/* Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1)_0%,rgba(5,5,5,0.85)_80%)] pointer-events-none" />
      </div>

      {/* Floating Video Controls in Opening Frame (Top Right) */}
      <div className="absolute top-5 right-6 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          style={{ paddingLeft: '10px' }}
          className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white hover:text-[#C9A45C] transition-colors cursor-pointer shadow-lg"
          title={isPlaying ? 'Pause Opening Video' : 'Play Opening Video'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <button
          type="button"
          onClick={toggleSound}
          className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white hover:text-[#C9A45C] transition-colors cursor-pointer shadow-lg"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => {
            requireAdmin(() => setShowVideoModal(true), 'Change Hero Opening Video');
          }}
          className={`px-3 py-2 rounded-full backdrop-blur-md text-xs font-mono-num transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
            isAdmin
              ? 'bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300'
              : 'bg-black/80 hover:bg-black/95 border border-amber-500/50 text-amber-300 hover:text-white'
          }`}
          title={
            isAdmin
              ? 'Admin Active • Click to change opening video'
              : 'Admin Login Required • Click to authenticate and change opening video'
          }
        >
          {isAdmin ? (
            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="hidden sm:inline">Change Opening Video</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono-num font-bold uppercase tracking-wider ${
              isAdmin
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isAdmin ? 'ADMIN' : 'ADMIN ONLY'}
          </span>
        </button>
      </div>

      {/* Hero Content Container */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex flex-col items-center text-center mt-8">
        {/* Brand Kicker */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/15 bg-black/50 backdrop-blur-md mb-6 shadow-xl">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
          <span className="text-xs uppercase tracking-[0.25em] text-[#C9A45C] font-semibold">
            The Pinnacle of Luxury Automotive Rentals
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-luxury font-bold tracking-tight text-white max-w-5xl leading-[1.08] mb-6 drop-shadow-2xl">
          DRIVE SOMETHING <br />
          <span className="champagne-gradient-text">WORTH REMEMBERING.</span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg md:text-xl text-[#CCCCCC] max-w-2xl font-normal leading-relaxed mb-8 drop-shadow">
          Hand-delivered luxury sports cars, executive saloons, and sovereign grand tourers. Curbside airport VIP lane, 5-star hotel valet, or private doorstep delivery.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-8">
          <button
            onClick={onBookDrive}
            className="w-full sm:w-auto py-4 px-9 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs md:text-sm tracking-wider uppercase rounded-xl transition-all shadow-xl shadow-[#C9A45C]/30 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <span>Book Your Drive</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreCars}
            className="w-full sm:w-auto py-4 px-8 bg-black/60 hover:bg-black/80 border border-white/20 hover:border-white/40 text-white font-semibold text-xs md:text-sm tracking-wider uppercase rounded-xl backdrop-blur-md transition-all cursor-pointer"
          >
            Explore Fleet
          </button>

          <button
            type="button"
            onClick={() => openWhatsAppEnquiry({
              vehicleName: 'Porsche 911 GT3 (992)',
              category: 'Flagship Sports',
              enquiryType: 'FULL_ENQUIRY'
            })}
            className="w-full sm:w-auto py-4 px-6 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-white font-semibold text-xs md:text-sm tracking-wider uppercase rounded-xl backdrop-blur-md transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            title="Chat with VIP Concierge on WhatsApp"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>VIP WhatsApp Enquiry</span>
          </button>
        </div>

        {/* Accurate Fleet Lineup Ticker with Authentic Car Marques */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-4xl text-[11px] font-mono-num text-[#999999] bg-black/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
          <span className="text-[#C9A45C] font-semibold uppercase tracking-wider">Fleet Lineup:</span>
          {[
            'Porsche 911 GT3 (992)',
            'Rolls-Royce Ghost Extended',
            'Bentley Continental GT Speed',
            'BMW M5 Competition (F90)',
            'Toyota Fortuner Legender 4x4',
            'Mercedes-AMG A 35 4MATIC+',
            'MINI Cooper S (3-Door)'
          ].map((c, i) => (
            <span key={c} className="flex items-center gap-2">
              <span className="text-white hover:text-[#C9A45C] transition-colors">{c}</span>
              {i < 6 && <span className="text-white/20">·</span>}
            </span>
          ))}
        </div>

        {/* Hero Visual Spotlight Box */}
        <div className="w-full max-w-5xl relative mt-2">
          <div className="relative rounded-2xl bg-[#0E0F14]/90 border border-white/10 p-6 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#C9A45C] to-transparent" />

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
              <div className="border-l-2 border-[#C9A45C] pl-4">
                <div className="text-xs text-[#888888] uppercase tracking-wider">Fleet Power</div>
                <div className="text-2xl font-luxury font-bold text-white mt-0.5">204–650 HP</div>
                <div className="text-[11px] text-[#AAAAAA] mt-0.5">Naturally Aspirated & V12</div>
              </div>

              <div className="border-l-2 border-white/20 pl-4">
                <div className="text-xs text-[#888888] uppercase tracking-wider">Live Locations</div>
                <div className="text-2xl font-luxury font-bold text-white mt-0.5">4 Metros</div>
                <div className="text-[11px] text-[#AAAAAA] mt-0.5">BLR · BOM · DEL · GOA</div>
              </div>

              <div className="border-l-2 border-white/20 pl-4">
                <div className="text-xs text-[#888888] uppercase tracking-wider">Zero Liability</div>
                <div className="text-2xl font-luxury font-bold text-white mt-0.5">100% Insured</div>
                <div className="text-[11px] text-[#AAAAAA] mt-0.5">Zero-depreciation cover</div>
              </div>

              <div className="border-l-2 border-white/20 pl-4">
                <div className="text-xs text-[#888888] uppercase tracking-wider">Client Rating</div>
                <div className="text-2xl font-luxury font-bold text-[#C9A45C] mt-0.5">4.98 / 5.0</div>
                <div className="text-[11px] text-[#AAAAAA] mt-0.5">Verified patron drives</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll down prompt */}
        <a
          href="#fleet-section"
          className="inline-flex flex-col items-center gap-1.5 text-xs text-[#888888] hover:text-[#C9A45C] transition-colors mt-8 cursor-pointer"
        >
          <span className="uppercase tracking-[0.2em] text-[10px]">Explore Luxury Fleet</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-[#C9A45C]" />
        </a>
      </div>

      {/* Modal to upload or change opening video */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#0E0F14] border border-[#C9A45C]/50 rounded-2xl p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-[#C9A45C]" />
                <h4 className="text-base font-luxury font-bold text-white">
                  Change Opening Frame Video
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#AAAAAA] mb-4 leading-relaxed">
              Upload a video file or paste a video link to play as the cinematic opening frame page background:
            </p>

            {/* File Upload Option */}
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#C9A45C]/40 hover:border-[#C9A45C] rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-center group">
                <Upload className="w-8 h-8 text-[#C9A45C] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-white mb-1">
                  Upload Video File (MP4, WebM, MOV)
                </span>
                <span className="text-[11px] text-[#888888]">
                  Select from device to play as opening frame
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleUrlSubmit} className="mb-2">
              <label className="block text-[11px] font-mono-num uppercase tracking-wider text-[#888888] mb-1.5">
                Or Paste Video URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={customVideoUrl}
                  onChange={(e) => setCustomVideoUrl(e.target.value)}
                  placeholder="https://example.com/opening-supercar.mp4"
                  className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C9A45C]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-semibold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
