import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCw,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  ChevronRight,
  Upload,
  Video,
  Film,
  Check,
  RefreshCw,
  Sliders,
  Lock,
  Unlock
} from 'lucide-react';
import { Vehicle } from '../types';
import { useAdminAuth } from '../context/AdminAuthContext';

interface StudioTurntable3DSpaceProps {
  vehicle: Vehicle;
  onBookNow?: (vehicle: Vehicle) => void;
  className?: string;
  initialMode?: 'VIDEO' | 'WEBGL';
}

interface HotspotItem {
  id: string;
  name: string;
  category: string;
  title: string;
  spec: string;
  description: string;
  anglePercent: number; // approximate 0-100% position on the turntable rotation
  x: number; // percentage in frame (0-100)
  y: number; // percentage in frame (0-100)
}

// Built-in video presets for the 3D space
const VIDEO_PRESETS = [
  {
    id: 'studio-turntable',
    name: '4K Studio 360° Turntable',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-super-car-driving-through-the-city-41270-large.mp4'
  },
  {
    id: 'midnight-roll',
    name: 'Midnight Highway Performance',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-at-high-speed-on-a-highway-41584-large.mp4'
  },
  {
    id: 'showroom-cinematic',
    name: 'Exotic Showroom Showcase',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-car-in-a-dark-parking-lot-43632-large.mp4'
  }
];

export const StudioTurntable3DSpace: React.FC<StudioTurntable3DSpaceProps> = ({
  vehicle,
  onBookNow,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isAdmin, requireAdmin } = useAdminAuth();

  // Playback & Interaction States
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [rotationProgress, setRotationProgress] = useState<number>(0); // 0 to 100%
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartProgress, setDragStartProgress] = useState<number>(0);
  const [activeHotspot, setActiveHotspot] = useState<HotspotItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(false);
  const [studioLight, setStudioLight] = useState<'OBSIDIAN' | 'CHAMPAGNE' | 'NEON_CYBER'>('CHAMPAGNE');
  const [cameraPreset, setCameraPreset] = useState<string>('Front 3/4');

  // Video source state: Check if custom video exists for this vehicle or global custom video
  const [videoSrc, setVideoSrc] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const vehicleSpecific = localStorage.getItem(`velox_3d_video_${vehicle.id}`);
      if (vehicleSpecific) return vehicleSpecific;
      const globalCustom = localStorage.getItem('velox_custom_3d_video');
      if (globalCustom) return globalCustom;
    }
    return vehicle.videoUrl || VIDEO_PRESETS[0].url;
  });

  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [customVideoUrlInput, setCustomVideoUrlInput] = useState<string>('');
  const [videoUploadSuccess, setVideoUploadSuccess] = useState<string | null>(null);

  // Dynamic hotspots tailored accurately to the current vehicle
  const getVehicleHotspots = (): HotspotItem[] => {
    return [
      {
        id: 'powertrain',
        name: 'POWERTRAIN',
        category: 'Engine & Performance',
        title: `${vehicle.name} Powerplant`,
        spec: `${vehicle.horsepower} HP · ${vehicle.fuel} · 0–100 km/h: ${vehicle.acceleration0To100}s`,
        description: `Precision-tuned engineering delivering instantaneous response, paired with ${vehicle.transmission} and ${vehicle.drivetrain} architecture.`,
        anglePercent: 15,
        x: 35,
        y: 48
      },
      {
        id: 'optics',
        name: 'OPTICS & RADAR',
        category: 'Lighting & Sensors',
        title: 'High-Precision Optical Signature',
        spec: 'Adaptive Dynamic Matrix LED · Multi-Stage Cornering Beam',
        description: 'Advanced illumination with automatic anti-glare high beam assist, dark-tinted crystalline lenses, and integrated telemetry sensors.',
        anglePercent: 5,
        x: 28,
        y: 42
      },
      {
        id: 'brakes',
        name: 'WHEELS & BRAKES',
        category: 'Chassis & Dynamics',
        title: 'High-Friction Braking Assembly',
        spec: `${vehicle.category === 'Sports' ? 'Carbon Ceramic (PCCB)' : 'Ventilated Slotted Rotors'} · Monobloc Calipers`,
        description: 'Engineered for zero brake fade under aggressive canyon and track deceleration with lightweight forged aerodynamic wheels.',
        anglePercent: 30,
        x: 72,
        y: 62
      },
      {
        id: 'aero',
        name: 'AERODYNAMICS',
        category: 'Airflow & Downforce',
        title: 'Active Aero Venting & Rear Diffuser',
        spec: `${vehicle.topSpeed} km/h Maximum Track Velocity · Wind-Tunnel Hone`,
        description: 'Ground-effect underfloor channels and aerodynamic rear profile optimizing high-speed stability and cooling airflow.',
        anglePercent: 55,
        x: 65,
        y: 38
      },
      {
        id: 'cockpit',
        name: 'VIP COCKPIT',
        category: 'Cabin & Telemetry',
        title: 'Artisanal Handcrafted Interior',
        spec: `${vehicle.seats} Luxury Seats · Digital Glass Cockpit · Premium Surround Audio`,
        description: 'Supple leather, ambient fiber-optic illumination, wireless charging, and custom acoustics configured for long-distance grand touring.',
        anglePercent: 80,
        x: 48,
        y: 45
      }
    ];
  };

  const hotspots = getVehicleHotspots();

  // Sync video time with rotation progress
  const updateVideoTime = useCallback((percent: number) => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const targetTime = (percent / 100) * videoRef.current.duration;
    if (Math.abs(videoRef.current.currentTime - targetTime) > 0.05) {
      videoRef.current.currentTime = targetTime;
    }
  }, []);

  // Continuous playback loop handling
  const handleTimeUpdate = () => {
    if (isDragging || !videoRef.current || !videoRef.current.duration) return;
    const currentPercent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setRotationProgress(currentPercent);
  };

  // Mouse / Touch Drag Scrubbing for 360 Rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartProgress(rotationProgress);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const deltaX = e.clientX - dragStartX;
    let deltaPercent = (deltaX / width) * 100 * 1.5;
    let newProgress = (dragStartProgress + deltaPercent) % 100;
    if (newProgress < 0) newProgress += 100;

    setRotationProgress(newProgress);
    updateVideoTime(newProgress);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Toggle playback
  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Cycle speed (0.5x -> 1x -> 1.5x -> 2x)
  const handleCycleSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  // Change camera presets (0%, 25%, 50%, 75%)
  const handlePresetSelect = (percent: number, presetName: string) => {
    setCameraPreset(presetName);
    setRotationProgress(percent);
    updateVideoTime(percent);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Video upload via local file
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setVideoSrc(blobUrl);
      try {
        localStorage.setItem(`velox_3d_video_${vehicle.id}`, blobUrl);
        localStorage.setItem('velox_custom_3d_video', blobUrl);
      } catch {
        // quota
      }
      setVideoUploadSuccess(`Loaded 3D video file: ${file.name}`);
      setTimeout(() => setVideoUploadSuccess(null), 4000);
      setShowVideoModal(false);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.src = blobUrl;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Video set via custom URL
  const handleCustomVideoUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customVideoUrlInput.trim()) {
      const url = customVideoUrlInput.trim();
      setVideoSrc(url);
      try {
        localStorage.setItem(`velox_3d_video_${vehicle.id}`, url);
        localStorage.setItem('velox_custom_3d_video', url);
      } catch {
        // quota
      }
      setVideoUploadSuccess('Custom 3D view space video loaded!');
      setTimeout(() => setVideoUploadSuccess(null), 4000);
      setShowVideoModal(false);
      setCustomVideoUrlInput('');
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Sound engine effect (simulated purr / turbo whistle)
  const handleToggleSound = () => {
    setSoundOn(prev => !prev);
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch {
      // Audio context policy
    }
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`relative w-full bg-[#050608] rounded-3xl overflow-hidden border border-[#22242D] shadow-2xl select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'h-[500px] md:h-[620px]'
      } ${className}`}
    >
      {/* Dynamic Studio Lighting Ambient Backdrops */}
      <div
        className={`absolute inset-0 transition-all duration-700 pointer-events-none ${
          studioLight === 'CHAMPAGNE'
            ? 'bg-[radial-gradient(ellipse_at_50%_40%,rgba(201,164,92,0.12)_0%,rgba(5,6,8,0.98)_75%)]'
            : studioLight === 'NEON_CYBER'
            ? 'bg-[radial-gradient(ellipse_at_50%_40%,rgba(94,211,154,0.14)_0%,rgba(5,6,8,0.98)_75%)]'
            : 'bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.06)_0%,rgba(5,6,8,0.98)_75%)]'
        }`}
      />

      {/* Grid Floor with Reflective Lineation */}
      <div className="absolute inset-x-0 bottom-0 h-44 pointer-events-none opacity-40">
        <div className="w-full h-full bg-[linear-gradient(to_bottom,transparent_0%,rgba(201,164,92,0.06)_40%,rgba(5,6,8,0.95)_100%)]" />
        <div className="absolute bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A45C]/30 to-transparent" />
        <div className="absolute bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ================= 360° VIDEO TURNTABLE CANVAS / PLAYER ================= */}
      <div
        onPointerDown={handlePointerDown}
        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover md:object-contain pointer-events-none filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] brightness-105"
        />

        {/* Ambient Darkened Studio Frame Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* ================= INTERACTIVE HOTSPOTS ON 360 VEHICLE ================= */}
        {hotspots.map(h => {
          const isSelected = activeHotspot?.id === h.id;
          return (
            <div
              key={h.id}
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`
              }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            >
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setActiveHotspot(isSelected ? null : h);
                }}
                className={`group relative flex items-center justify-center p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#C9A45C] text-[#050505] border-[#C9A45C] scale-125 shadow-xl shadow-[#C9A45C]/50'
                    : 'bg-[#090A0D]/80 text-white border-white/20 hover:border-[#C9A45C] hover:scale-110'
                }`}
                title={`Inspect ${h.name}`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
                <span className="sr-only">{h.name}</span>

                {/* Hotspot Floating Label */}
                <span className="absolute left-full ml-2 px-2 py-0.5 rounded bg-black/85 text-[10px] font-mono-num uppercase tracking-wider text-white border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {h.name}
                </span>
              </button>
            </div>
          );
        })}

        {/* Drag To Rotate Helper Cue */}
        {!isDragging && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-[#CCCCCC] animate-pulse">
            <RotateCw className="w-3.5 h-3.5 text-[#C9A45C]" />
            <span>Drag horizontally to scrub 360° Video Space</span>
          </div>
        )}
      </div>

      {/* ================= TOP CONTROLS BAR ================= */}
      <div className="absolute top-5 inset-x-5 flex items-center justify-between z-30 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3.5 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-xs text-white flex items-center gap-2 font-mono-num shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#5ED39A] animate-ping" />
            <span className="font-bold text-[#C9A45C] tracking-wide">3D VIEW SPACE</span>
            <span className="text-white/20">|</span>
            <span className="text-[11px] text-[#E0E0E0] font-semibold">{vehicle.name}</span>
          </div>
        </div>

        {/* Action icons right: Use Video / Upload Video, Sound, Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Change or Upload 3D Space Video */}
          <button
            type="button"
            onClick={() => {
              requireAdmin(
                () => setShowVideoModal(true),
                `Change ${vehicle.name} 3D View Space Video`
              );
            }}
            className={`px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-mono-num flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
              isAdmin
                ? 'bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300'
                : 'bg-black/80 hover:bg-black/95 border border-amber-500/50 text-amber-300 hover:text-white'
            }`}
            title={
              isAdmin
                ? 'Admin Active • Click to change 3D view space video'
                : 'Admin Login Required • Click to authenticate and change 3D view space video'
            }
          >
            {isAdmin ? (
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">Use Video</span>
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

          {/* Sound simulation */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-colors cursor-pointer ${
              soundOn
                ? 'bg-[#C9A45C] text-[#050505] border-[#C9A45C]'
                : 'bg-black/60 text-white border-white/10 hover:border-white/30'
            }`}
            title="Acoustic Engine Exhaust"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:border-[#C9A45C] transition-colors cursor-pointer"
            title="Fullscreen Inspection"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ================= ANGLE PRESETS SELECTOR ================= */}
      <div className="absolute top-16 left-5 z-30 flex flex-wrap items-center gap-1.5 pointer-events-auto">
        {[
          { label: 'Front 3/4', percent: 10 },
          { label: 'Profile', percent: 30 },
          { label: 'Rear Lightblade', percent: 55 },
          { label: 'Frontal Grille', percent: 90 }
        ].map(p => (
          <button
            key={p.label}
            type="button"
            onClick={() => handlePresetSelect(p.percent, p.label)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-num uppercase tracking-wider backdrop-blur-md border transition-all cursor-pointer ${
              cameraPreset === p.label
                ? 'bg-[#C9A45C] text-[#050505] border-[#C9A45C] font-bold shadow-md'
                : 'bg-black/50 text-[#888888] border-white/5 hover:text-white hover:border-white/20'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Success banner if video was uploaded */}
      {videoUploadSuccess && (
        <div className="absolute top-28 left-5 z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#5ED39A]/20 border border-[#5ED39A]/40 text-[#5ED39A] text-xs font-mono-num animate-in fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>{videoUploadSuccess}</span>
        </div>
      )}

      {/* ================= ACTIVE HOTSPOT SPECIFICATION POPUP ================= */}
      {activeHotspot && (
        <div className="absolute top-20 right-5 z-40 max-w-sm w-full bg-[#0E0F14]/95 border border-[#C9A45C]/50 rounded-2xl p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-right-4 text-left">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] font-mono-num uppercase tracking-widest text-[#C9A45C] font-semibold block">
                {activeHotspot.category}
              </span>
              <h5 className="text-lg font-luxury font-bold text-white mt-0.5">
                {activeHotspot.title}
              </h5>
            </div>
            <button
              type="button"
              onClick={() => setActiveHotspot(null)}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#888888] hover:text-white cursor-pointer"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2.5 bg-black/50 rounded-xl border border-white/5 text-xs text-[#5ED39A] font-mono-num font-semibold mb-3">
            {activeHotspot.spec}
          </div>

          <p className="text-xs text-[#AAAAAA] leading-relaxed mb-4">
            {activeHotspot.description}
          </p>

          {onBookNow && (
            <button
              type="button"
              onClick={() => onBookNow(vehicle)}
              className="w-full py-2.5 px-3 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Book {vehicle.name}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ================= USE VIDEO MODAL / DROPZONE ================= */}
      {showVideoModal && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#0E0F14] border border-[#C9A45C]/50 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#C9A45C]" />
                <h4 className="text-base font-luxury font-bold text-white">
                  Use Video as 3D View Space
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="text-white/50 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#AAAAAA] mb-4 leading-relaxed">
              Upload a 360-degree rotation or showroom video for <strong className="text-white">{vehicle.name}</strong>. It will be mapped directly into the interactive 3D view space with rotational scrubbing, lighting presets, and hotspots.
            </p>

            {/* File Upload Option */}
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#C9A45C]/40 hover:border-[#C9A45C] rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-center group">
                <Upload className="w-8 h-8 text-[#C9A45C] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-white mb-1">
                  Click to Upload Video File
                </span>
                <span className="text-[11px] text-[#888888]">
                  Supports MP4, WebM, MOV (Drag & Drop or Click)
                </span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleCustomVideoUrlSubmit} className="mb-4">
              <label className="block text-[11px] font-mono-num uppercase tracking-wider text-[#888888] mb-1.5">
                Or Paste Video URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={customVideoUrlInput}
                  onChange={(e) => setCustomVideoUrlInput(e.target.value)}
                  placeholder="https://example.com/car-turntable.mp4"
                  className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C9A45C]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-semibold text-xs rounded-xl transition-colors shrink-0"
                >
                  Load URL
                </button>
              </div>
            </form>

            {/* Quick Presets */}
            <div>
              <span className="block text-[11px] font-mono-num uppercase tracking-wider text-[#888888] mb-2">
                Or Select High-Res Turntable Presets
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {VIDEO_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setVideoSrc(p.url);
                      try {
                        localStorage.setItem(`velox_3d_video_${vehicle.id}`, p.url);
                      } catch {
                        // quota
                      }
                      setVideoUploadSuccess(`Switched to: ${p.name}`);
                      setTimeout(() => setVideoUploadSuccess(null), 3000);
                      setShowVideoModal(false);
                      setIsPlaying(true);
                      if (videoRef.current) {
                        videoRef.current.src = p.url;
                        videoRef.current.play().catch(() => {});
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      videoSrc === p.url
                        ? 'bg-[#C9A45C]/15 border-[#C9A45C] text-white'
                        : 'bg-white/5 border-white/10 text-[#CCCCCC] hover:border-white/30'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5 text-[#C9A45C] mb-1" />
                    <span className="block font-semibold text-[11px]">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= BOTTOM TIMELINE & TURNTABLE SCRUBBER ================= */}
      <div className="absolute bottom-4 inset-x-5 z-30 flex items-center justify-between gap-4 pointer-events-auto bg-black/75 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-2xl">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className="p-2.5 rounded-xl bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] transition-colors cursor-pointer shrink-0 shadow-md"
          title={isPlaying ? 'Pause Auto-Spin' : 'Auto-Spin 360°'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        {/* 360 Scrubbing Slider Bar */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-[11px] font-mono-num text-[#888888] shrink-0">0°</span>
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const percent = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
              setRotationProgress(percent);
              updateVideoTime(percent);
              if (videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
              }
            }}
            className="relative flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
          >
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#997635] via-[#C9A45C] to-[#FFE082] rounded-full transition-all duration-75"
              style={{ width: `${rotationProgress}%` }}
            />
          </div>
          <span className="text-[11px] font-mono-num text-[#C9A45C] shrink-0 font-bold min-w-[36px] text-right">
            {Math.round(rotationProgress * 3.6)}°
          </span>
        </div>

        {/* Speed / Lighting Mood Switches */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Speed Toggle */}
          <button
            type="button"
            onClick={handleCycleSpeed}
            className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono-num text-[#CCCCCC] transition-colors cursor-pointer"
            title="Playback Speed"
          >
            {playbackSpeed}x
          </button>

          {/* Lighting Mood */}
          <button
            type="button"
            onClick={() => {
              setStudioLight(prev => (prev === 'CHAMPAGNE' ? 'NEON_CYBER' : prev === 'NEON_CYBER' ? 'OBSIDIAN' : 'CHAMPAGNE'));
            }}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono-num text-[#CCCCCC] transition-colors cursor-pointer flex items-center gap-1"
            title="Cycle Studio Lighting Tone"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
            <span className="hidden sm:inline">{studioLight}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
