import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Check,
  Video,
  Film,
  Crosshair,
  Gauge,
  Radio,
  Sliders,
  RotateCcw,
  Lock,
  Unlock
} from 'lucide-react';
import { Vehicle } from '../types';
import { useAdminAuth } from '../context/AdminAuthContext';
import { persistMediaItem, retrieveMediaItem } from '../utils/persistentStorage';

interface BlueprintVideoViewerProps {
  vehicle: Vehicle;
  compact?: boolean;
  onBookNow?: (vehicle: Vehicle) => void;
  className?: string;
  onUpdateVideo?: (url: string) => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
}

const BLUEPRINT_PRESETS = [
  {
    id: 'track-run',
    name: '4K Supercar High Speed Performance',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-at-high-speed-on-a-highway-41584-large.mp4'
  },
  {
    id: 'studio-turntable',
    name: '360° Studio Turntable Showcase',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-super-car-driving-through-the-city-41270-large.mp4'
  },
  {
    id: 'night-urban',
    name: 'Midnight Architectural Roll',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-car-in-a-dark-parking-lot-43632-large.mp4'
  }
];

export const BlueprintVideoViewer: React.FC<BlueprintVideoViewerProps> = ({
  vehicle,
  compact = false,
  onBookNow,
  className = '',
  onUpdateVideo
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Storage key for vehicle blueprint video
  const storageKey = `velox_blueprint_video_${vehicle.id}`;
  const { isAdmin, requireAdmin } = useAdminAuth();

  const [videoSrc, setVideoSrc] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) return saved;
      const globalSaved = localStorage.getItem('velox_custom_3d_video');
      if (globalSaved) return globalSaved;
    }
    return vehicle.videoUrl || BLUEPRINT_PRESETS[0].url;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'CYAN' | 'GOLD' | 'EMERALD'>('CYAN');
  const [showWireframeOverlay, setShowWireframeOverlay] = useState<boolean>(true);
  const [showTelemetryHUD, setShowTelemetryHUD] = useState<boolean>(true);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // Sync video source if vehicle prop changes
  useEffect(() => {
    retrieveMediaItem(storageKey).then(persistedUrl => {
      if (persistedUrl) {
        setVideoSrc(persistedUrl);
      } else if (vehicle.videoUrl) {
        setVideoSrc(vehicle.videoUrl);
      }
    });
  }, [vehicle.id, storageKey]);

  // Color theme palettes for CAD Blueprint
  const themeStyles = {
    CYAN: {
      accent: '#00F0FF',
      accentGlow: 'rgba(0, 240, 255, 0.4)',
      gridBorder: 'rgba(0, 240, 255, 0.15)',
      badgeBg: 'rgba(0, 240, 255, 0.12)',
      text: '#5CE1E6',
      scanline: 'rgba(0, 240, 255, 0.35)'
    },
    GOLD: {
      accent: '#C9A45C',
      accentGlow: 'rgba(201, 164, 92, 0.4)',
      gridBorder: 'rgba(201, 164, 92, 0.15)',
      badgeBg: 'rgba(201, 164, 92, 0.12)',
      text: '#E5C07B',
      scanline: 'rgba(201, 164, 92, 0.35)'
    },
    EMERALD: {
      accent: '#00FF9D',
      accentGlow: 'rgba(0, 255, 157, 0.4)',
      gridBorder: 'rgba(0, 255, 157, 0.15)',
      badgeBg: 'rgba(0, 255, 157, 0.12)',
      text: '#5ED39A',
      scanline: 'rgba(0, 255, 157, 0.35)'
    }
  }[theme];

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const persistedUrl = await persistMediaItem(storageKey, file);
        setVideoSrc(persistedUrl);
        if (onUpdateVideo) onUpdateVideo(persistedUrl);
      } catch {
        const fallback = URL.createObjectURL(file);
        setVideoSrc(fallback);
        if (onUpdateVideo) onUpdateVideo(fallback);
      }
      setUploadSuccess(`Uploaded "${file.name}" to Blueprint!`);
      setTimeout(() => {
        setUploadSuccess(null);
        setShowUploadModal(false);
      }, 1400);
      setIsPlaying(true);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      const url = customUrlInput.trim();
      await persistMediaItem(storageKey, url);
      setVideoSrc(url);
      if (onUpdateVideo) onUpdateVideo(url);
      setUploadSuccess('Custom Video URL applied to Blueprint!');
      setTimeout(() => {
        setUploadSuccess(null);
        setShowUploadModal(false);
        setCustomUrlInput('');
      }, 1400);
      setIsPlaying(true);
    }
  };

  const handleSelectPreset = (url: string) => {
    setVideoSrc(url);
    try {
      localStorage.setItem(storageKey, url);
    } catch {}
    if (onUpdateVideo) onUpdateVideo(url);
    setUploadSuccess('Blueprint Video Preset Applied!');
    setTimeout(() => {
      setUploadSuccess(null);
      setShowUploadModal(false);
    }, 1000);
    setIsPlaying(true);
  };

  const handleResetToDefault = () => {
    localStorage.removeItem(storageKey);
    const def = vehicle.videoUrl || BLUEPRINT_PRESETS[0].url;
    setVideoSrc(def);
    if (onUpdateVideo) onUpdateVideo(def);
    setUploadSuccess('Reset to factory default video');
    setTimeout(() => {
      setUploadSuccess(null);
      setShowUploadModal(false);
    }, 1000);
    setIsPlaying(true);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${
        compact ? 'h-56 md:h-64' : 'h-[380px] md:h-[480px]'
      } rounded-2xl overflow-hidden bg-[#05070B] border border-white/10 select-none group ${className}`}
    >
      {/* Background HTML5 Video Layer */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover filter contrast-125 brightness-90"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Subtle Dark Vignette Border */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      {/* TOP HEADER: Vehicle Identity & Status */}
      <div className="absolute top-3 inset-x-3.5 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/15 text-[11px] font-mono-num font-bold tracking-wider uppercase text-white bg-black/80 pointer-events-auto"
          >
            <Video className="w-3.5 h-3.5 text-[#C9A45C]" />
            <span>{vehicle.name}</span>
          </div>

          {!compact && (
            <span
              className="hidden lg:inline-block px-2 py-0.5 rounded text-[10px] font-mono-num uppercase tracking-wider backdrop-blur-md border border-white/10 bg-black/75 text-[#5ED39A]"
            >
              1080P HD · 60 FPS
            </span>
          )}
        </div>

        {/* Top Right Quick Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Add / Change Video Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              requireAdmin(
                () => setShowUploadModal(true),
                `Change ${vehicle.name} Stream Video`
              );
            }}
            className={`px-2.5 py-1 rounded-md backdrop-blur-md text-[11px] font-mono-num font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
              isAdmin
                ? 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300'
                : 'bg-black/80 hover:bg-black/95 border border-amber-500/50 text-amber-300 hover:text-white'
            }`}
            title={
              isAdmin
                ? 'Admin Active • Upload or Change Blueprint Video'
                : 'Admin Login Required • Click to authenticate and change video'
            }
          >
            {isAdmin ? (
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">Add / Change Video</span>
            <span
              className={`text-[9px] font-mono-num font-bold uppercase tracking-wider px-1 py-0.2 rounded ${
                isAdmin
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isAdmin ? 'ADMIN' : 'ADMIN ONLY'}
            </span>
          </button>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-md bg-black/80 hover:bg-black backdrop-blur-md border border-white/15 text-white hover:text-[#C9A45C] transition-all cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#5ED39A]" />}
          </button>

          {/* Fullscreen (non-compact) */}
          {!compact && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md bg-black/80 hover:bg-black backdrop-blur-md border border-white/15 text-white hover:text-[#C9A45C] transition-all cursor-pointer"
              title="Fullscreen Blueprint"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* CENTER PLAY/PAUSE BIG BUTTON ON HOVER */}
      <div
        onClick={togglePlay}
        className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
      >
        <div
          className={`p-3.5 rounded-full bg-black/60 backdrop-blur-md border transition-all duration-300 ${
            isPlaying ? 'opacity-0 group-hover:opacity-85 scale-90 group-hover:scale-100' : 'opacity-100 scale-100'
          }`}
          style={{
            borderColor: themeStyles.accent,
            boxShadow: `0 0 25px ${themeStyles.accentGlow}`
          }}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" style={{ color: themeStyles.accent }} />
          ) : (
            <Play className="w-6 h-6 ml-0.5" style={{ color: themeStyles.accent }} />
          )}
        </div>
      </div>

      {/* INTERACTIVE CAD BLUEPRINT TELEMETRY HOTSPOTS (non-compact) */}
      {!compact && showTelemetryHUD && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Hotspot 1: Aerodynamics / Wing */}
          <div
            className="absolute top-[28%] right-[18%] pointer-events-auto cursor-pointer"
            onClick={() => setActiveHotspot(activeHotspot === 'aero' ? null : 'aero')}
          >
            <div
              className="relative flex items-center justify-center w-6 h-6 rounded-full border animate-pulse"
              style={{
                borderColor: themeStyles.accent,
                backgroundColor: themeStyles.badgeBg
              }}
            >
              <Crosshair className="w-3.5 h-3.5" style={{ color: themeStyles.accent }} />
            </div>
            {activeHotspot === 'aero' && (
              <div
                className="absolute top-full right-0 mt-2 w-48 p-2.5 rounded-lg bg-black/90 backdrop-blur-xl border text-[11px] shadow-2xl animate-in fade-in"
                style={{ borderColor: themeStyles.accent }}
              >
                <div className="font-bold uppercase tracking-wider" style={{ color: themeStyles.accent }}>
                  Downforce Aero
                </div>
                <div className="text-white/80 mt-1">
                  Active rear aerodynamic profile generating up to 385 kg of lateral grip at speed.
                </div>
              </div>
            )}
          </div>

          {/* Hotspot 2: Powertrain */}
          <div
            className="absolute bottom-[36%] left-[32%] pointer-events-auto cursor-pointer"
            onClick={() => setActiveHotspot(activeHotspot === 'engine' ? null : 'engine')}
          >
            <div
              className="relative flex items-center justify-center w-6 h-6 rounded-full border animate-pulse"
              style={{
                borderColor: themeStyles.accent,
                backgroundColor: themeStyles.badgeBg
              }}
            >
              <Gauge className="w-3.5 h-3.5" style={{ color: themeStyles.accent }} />
            </div>
            {activeHotspot === 'engine' && (
              <div
                className="absolute bottom-full left-0 mb-2 w-52 p-2.5 rounded-lg bg-black/90 backdrop-blur-xl border text-[11px] shadow-2xl animate-in fade-in"
                style={{ borderColor: themeStyles.accent }}
              >
                <div className="font-bold uppercase tracking-wider" style={{ color: themeStyles.accent }}>
                  Powertrain Spec
                </div>
                <div className="text-white/80 mt-1 font-mono-num">
                  {vehicle.horsepower} HP · {vehicle.topSpeed} km/h top velocity. Direct-injection tuned.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM TELEMETRY BAR & HUD */}
      <div className="absolute bottom-3 inset-x-3.5 z-20 flex items-end justify-between pointer-events-none">
        {/* Left: Engineering telemetry readout */}
        <div
          className="flex flex-wrap items-center gap-2 p-1.5 px-3 rounded-lg backdrop-blur-md border text-[10px] md:text-xs font-mono-num pointer-events-auto"
          style={{
            backgroundColor: 'rgba(5, 7, 11, 0.85)',
            borderColor: themeStyles.gridBorder,
            color: themeStyles.text
          }}
        >
          <span className="font-bold text-white tracking-wider">
            {vehicle.horsepower} HP
          </span>
          <span className="text-white/30">|</span>
          <span>0-100: {vehicle.acceleration0To100}s</span>
          <span className="text-white/30">|</span>
          <span>{vehicle.topSpeed} KM/H</span>
          {!compact && (
            <>
              <span className="text-white/30">|</span>
              <span className="text-white/70">{vehicle.drivetrain}</span>
            </>
          )}
        </div>

        {/* Right: Theme picker & Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {!compact && (
            <div className="hidden sm:flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setTheme('CYAN')}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  theme === 'CYAN' ? 'scale-125 ring-2 ring-white' : 'opacity-60'
                }`}
                style={{ backgroundColor: '#00F0FF' }}
                title="Cyan CAD Blueprint"
              />
              <button
                type="button"
                onClick={() => setTheme('GOLD')}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  theme === 'GOLD' ? 'scale-125 ring-2 ring-white' : 'opacity-60'
                }`}
                style={{ backgroundColor: '#C9A45C' }}
                title="Gold Velox Blueprint"
              />
              <button
                type="button"
                onClick={() => setTheme('EMERALD')}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  theme === 'EMERALD' ? 'scale-125 ring-2 ring-white' : 'opacity-60'
                }`}
                style={{ backgroundColor: '#00FF9D' }}
                title="Emerald Telemetry"
              />
            </div>
          )}

          {/* Play/Pause small button */}
          <button
            type="button"
            onClick={togglePlay}
            className="p-1.5 rounded-md bg-black/80 hover:bg-black backdrop-blur-md border border-white/15 text-white hover:text-[#C9A45C] transition-all cursor-pointer"
            title={isPlaying ? 'Pause Video' : 'Play Video'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* CORNER BRACKET CROSSHAIRS */}
      {/* Clean border styling */}

      {/* ADD / CHANGE BLUEPRINT VIDEO MODAL DRAWER */}
      {showUploadModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-2 md:inset-x-6 top-3 bottom-3 z-50 p-4 md:p-6 bg-[#080A10]/95 backdrop-blur-2xl border rounded-xl overflow-y-auto flex flex-col justify-between shadow-2xl animate-in fade-in"
          style={{
            borderColor: themeStyles.accent,
            boxShadow: `0 0 40px ${themeStyles.accentGlow}`
          }}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#C9A45C]" />
                <span className="text-xs md:text-sm font-bold font-mono-num uppercase tracking-wider text-white">
                  Add or Change Blueprint Video — {vehicle.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-sm text-white/50 hover:text-white px-2 py-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            {uploadSuccess && (
              <div className="mb-4 p-2.5 rounded-lg bg-[#5ED39A]/20 border border-[#5ED39A]/40 text-[#5ED39A] text-xs font-mono-num flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Upload Video File */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#C9A45C]" />
                    <span>Upload Local Video File</span>
                  </div>
                  <p className="text-[11px] text-[#888888] mb-3">
                    Select an MP4, WebM, or MOV video from your computer or phone.
                  </p>
                </div>
                <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-dashed border-[#C9A45C]/50 bg-[#C9A45C]/10 hover:bg-[#C9A45C]/20 text-xs font-semibold text-[#DFBD78] cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Choose Video File</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Option B: Custom URL */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-[#5ED39A]" />
                    <span>Paste Video URL</span>
                  </div>
                  <p className="text-[11px] text-[#888888] mb-2">
                    Enter direct link to any MP4 or WebM video stream.
                  </p>
                </div>
                <form onSubmit={handleUrlSubmit} className="flex items-center gap-1.5">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://example.com/car-video.mp4"
                    className="flex-1 bg-black/60 border border-white/20 rounded-lg px-2.5 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#C9A45C]"
                  />
                  <button
                    type="submit"
                    className="py-2 px-3 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              </div>
            </div>

            {/* Presets Gallery */}
            <div className="mt-4">
              <span className="text-[11px] font-mono-num uppercase tracking-wider text-white/60 mb-2 block">
                Or Select High-Octane Supercar Preset:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {BLUEPRINT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className="p-2.5 rounded-lg bg-black/50 hover:bg-white/10 border border-white/10 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[11px] font-semibold text-white truncate">{preset.name}</div>
                    <div className="text-[9px] text-[#C9A45C] mt-0.5">Click to Load Preset</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-3">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-[11px] text-white/50 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Default Video</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="py-1.5 px-4 bg-white/10 hover:bg-white/20 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
