import React, { useState, useRef } from 'react';
import { Vehicle } from '../types';
import { Camera, Play, Pause, Volume2, VolumeX, Upload, Check, Film, RefreshCw, Lock, Unlock } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface VehicleVisualCardProps {
  vehicle: Vehicle;
  activeColor?: string;
  isHovered?: boolean;
  onUpdateImage?: (vehicleId: string, newImageUrl: string) => void;
  onUpdateVideo?: (vehicleId: string, newVideoUrl: string) => void;
}

const DEFAULT_VIDEO_URL = 'https://assets.mixkit.co/videos/preview/mixkit-super-car-driving-through-the-city-41270-large.mp4';

export const VehicleVisualCard: React.FC<VehicleVisualCardProps> = ({
  vehicle,
  activeColor,
  isHovered = false,
  onUpdateImage,
  onUpdateVideo
}) => {
  const color = activeColor || vehicle.colors[0]?.hex || '#0E0F12';
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mode: PHOTO (default) or VIDEO
  const [viewMode, setViewMode] = useState<'PHOTO' | 'VIDEO'>('PHOTO');

  // Photo states
  const [imgError, setImgError] = useState<boolean>(false);
  const [showImageUpload, setShowImageUpload] = useState<boolean>(false);
  const [customImageUrlInput, setCustomImageUrlInput] = useState<string>('');

  // Video states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showVideoUpload, setShowVideoUpload] = useState<boolean>(false);
  const [customVideoUrlInput, setCustomVideoUrlInput] = useState<string>('');
  const { isAdmin, requireAdmin } = useAdminAuth();

  // Storage keys per vehicle
  const imgStorageKey = `velox_car_img_${vehicle.id}`;
  const videoStorageKey = `velox_car_video_${vehicle.id}`;

  const currentImageUrl =
    typeof window !== 'undefined' && localStorage.getItem(imgStorageKey)
      ? localStorage.getItem(imgStorageKey)!
      : vehicle.imageUrl;

  const currentVideoUrl =
    typeof window !== 'undefined' && localStorage.getItem(videoStorageKey)
      ? localStorage.getItem(videoStorageKey)!
      : vehicle.videoUrl || DEFAULT_VIDEO_URL;

  // Image Upload Handlers
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      if (onUpdateImage) onUpdateImage(vehicle.id, blobUrl);
      try {
        localStorage.setItem(imgStorageKey, blobUrl);
      } catch {}
      setImgError(false);
      setViewMode('PHOTO');
      setShowImageUpload(false);
    }
  };

  const handleImageUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customImageUrlInput.trim()) {
      const url = customImageUrlInput.trim();
      if (onUpdateImage) onUpdateImage(vehicle.id, url);
      try {
        localStorage.setItem(imgStorageKey, url);
      } catch {}
      setImgError(false);
      setViewMode('PHOTO');
      setShowImageUpload(false);
      setCustomImageUrlInput('');
    }
  };

  // Video Upload Handlers
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      if (onUpdateVideo) onUpdateVideo(vehicle.id, blobUrl);
      try {
        localStorage.setItem(videoStorageKey, blobUrl);
      } catch {}
      setViewMode('VIDEO');
      setShowVideoUpload(false);
      setIsPlaying(true);
    }
  };

  const handleVideoUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customVideoUrlInput.trim()) {
      const url = customVideoUrlInput.trim();
      if (onUpdateVideo) onUpdateVideo(vehicle.id, url);
      try {
        localStorage.setItem(videoStorageKey, url);
      } catch {}
      setViewMode('VIDEO');
      setShowVideoUpload(false);
      setCustomVideoUrlInput('');
      setIsPlaying(true);
    }
  };

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

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative w-full h-56 md:h-64 bg-[#08090B] rounded-2xl overflow-hidden flex items-center justify-center group border border-white/5 select-none">
      {/* Studio radial spotlight behind vehicle */}
      <div
        className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-85 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 60%, ${color}55 0%, transparent 70%)`
        }}
      />

      {/* Grid line on studio floor */}
      <div className="absolute bottom-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A45C]/35 to-transparent pointer-events-none" />
      <div className="absolute bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

      {/* TOP FLOATING CONTROLS: PHOTO / VIDEO TOGGLE & MEDIA UPLOAD (TOP OF THE IMAGE) */}
      <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
        {/* Segmented Switcher: Photo vs Video */}
        <div className="flex items-center bg-black/85 backdrop-blur-md p-0.5 rounded-xl border border-white/15 shadow-xl">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setImgError(false);
              setViewMode('PHOTO');
            }}
            className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'PHOTO'
                ? 'bg-[#C9A45C] text-[#050505] shadow'
                : 'text-[#999999] hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photo</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('VIDEO');
              setIsPlaying(true);
            }}
            className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'VIDEO'
                ? 'bg-[#C9A45C] text-[#050505] shadow'
                : 'text-[#999999] hover:text-white'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Video</span>
          </button>
        </div>

        {/* Upload Button based on active mode with Admin Access Control */}
        {viewMode === 'PHOTO' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              requireAdmin(
                () => setShowImageUpload(prev => !prev),
                `Change ${vehicle.name} Photo`
              );
            }}
            className={`px-2 py-1.5 rounded-lg backdrop-blur-md transition-all cursor-pointer shadow-md flex items-center gap-1.5 translate-y-0.5 ${
              isAdmin
                ? 'bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300'
                : 'bg-black/80 hover:bg-black/95 border border-amber-500/50 text-amber-300 hover:text-white'
            }`}
            title={
              isAdmin
                ? `Admin Active • Upload or change ${vehicle.name} photo`
                : `Admin Login Required • Click to authenticate and change ${vehicle.name} photo`
            }
          >
            {isAdmin ? (
              <Upload className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span
              className={`text-[9px] font-mono-num font-bold uppercase tracking-wider px-1 py-0.5 rounded ${
                isAdmin
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isAdmin ? 'EDIT' : 'ADMIN'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              requireAdmin(
                () => setShowVideoUpload(prev => !prev),
                `Change ${vehicle.name} Video`
              );
            }}
            className={`px-2 py-1.5 rounded-lg backdrop-blur-md transition-all cursor-pointer shadow-md flex items-center gap-1.5 translate-y-0.5 ${
              isAdmin
                ? 'bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300'
                : 'bg-black/80 hover:bg-black/95 border border-amber-500/50 text-amber-300 hover:text-white'
            }`}
            title={
              isAdmin
                ? `Admin Active • Upload or change ${vehicle.name} video`
                : `Admin Login Required • Click to authenticate and change ${vehicle.name} video`
            }
          >
            {isAdmin ? (
              <Film className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span
              className={`text-[9px] font-mono-num font-bold uppercase tracking-wider px-1 py-0.5 rounded ${
                isAdmin
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isAdmin ? 'EDIT' : 'ADMIN'}
            </span>
          </button>
        )}
      </div>

      {/* Picture Upload Drawer Popup */}
      {showImageUpload && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-3 top-3.5 z-40 p-3 bg-[#0D0E13]/95 backdrop-blur-xl border border-[#C9A45C]/50 rounded-xl shadow-2xl animate-in fade-in"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono-num font-bold text-[#C9A45C] uppercase tracking-wider">
              Change {vehicle.name} Photo
            </span>
            <button
              type="button"
              onClick={() => setShowImageUpload(false)}
              className="text-xs text-white/50 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-dashed border-[#C9A45C]/40 bg-white/5 hover:bg-white/10 text-xs text-white cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>Choose Image File (JPG/PNG)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileUpload}
                className="hidden"
              />
            </label>

            <form onSubmit={handleImageUrlSubmit} className="flex items-center gap-1.5">
              <input
                type="url"
                value={customImageUrlInput}
                onChange={(e) => setCustomImageUrlInput(e.target.value)}
                placeholder="Or paste car image URL..."
                className="flex-1 bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
              />
              <button
                type="submit"
                className="p-1.5 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] rounded-lg transition-colors cursor-pointer"
                title="Apply Image URL"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Video Upload Drawer Popup */}
      {showVideoUpload && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-3 top-3.5 z-40 p-3 bg-[#0D0E13]/95 backdrop-blur-xl border border-[#C9A45C]/50 rounded-xl shadow-2xl animate-in fade-in"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono-num font-bold text-[#C9A45C] uppercase tracking-wider">
              Change {vehicle.name} Video
            </span>
            <button
              type="button"
              onClick={() => setShowVideoUpload(false)}
              className="text-xs text-white/50 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-dashed border-[#C9A45C]/40 bg-white/5 hover:bg-white/10 text-xs text-white cursor-pointer transition-colors">
              <Film className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>Choose Video File (MP4/WebM)</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoFileUpload}
                className="hidden"
              />
            </label>

            <form onSubmit={handleVideoUrlSubmit} className="flex items-center gap-1.5">
              <input
                type="url"
                value={customVideoUrlInput}
                onChange={(e) => setCustomVideoUrlInput(e.target.value)}
                placeholder="Or paste video MP4 URL..."
                className="flex-1 bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
              />
              <button
                type="submit"
                className="p-1.5 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] rounded-lg transition-colors cursor-pointer"
                title="Apply Video URL"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 1. PHOTOGRAPHIC REAL CAR VIEW */}
      {viewMode === 'PHOTO' ? (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <img
            src={imgError ? (vehicle.imageUrl || DEFAULT_VIDEO_URL) : (currentImageUrl || vehicle.imageUrl)}
            alt={vehicle.name}
            referrerPolicy="no-referrer"
            onError={() => {
              if (!imgError && vehicle.imageUrl && currentImageUrl !== vehicle.imageUrl) {
                setImgError(true);
              }
            }}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out filter drop-shadow-2xl ${
              isHovered ? 'scale-108 brightness-105' : 'scale-100 brightness-95'
            }`}
          />
          {/* Subtle cinematic gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-transparent to-black/30 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#08090B] to-transparent pointer-events-none" />
        </div>
      ) : (
        /* 2. REAL HIGH-DEFINITION AUTOMOTIVE VIDEO - NO BLUE TINT, NO BLUE GRID */
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={currentVideoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover filter contrast-105 brightness-95"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Center Play/Pause button on hover */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
          >
            <div
              className={`p-3.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 transition-all duration-300 ${
                isPlaying ? 'opacity-0 group-hover:opacity-85 scale-90 group-hover:scale-100' : 'opacity-100 scale-100'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-[#C9A45C] ml-0.5 fill-[#C9A45C]" />
              )}
            </div>
          </div>

          {/* Quick Audio Mute/Unmute in top left of video */}
          <div className="absolute top-3 left-3 z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white hover:text-[#C9A45C] transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white/70" /> : <Volume2 className="w-3.5 h-3.5 text-[#5ED39A]" />}
            </button>
          </div>

          {/* Bottom subtle shadow */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Model Name Stamp in Subtle Watermark */}
      <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-none flex items-center justify-between">
        <span className="text-[10px] font-mono-num font-bold text-white/70 tracking-wider uppercase bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
          {vehicle.name}
        </span>
        <span className="text-[10px] font-mono-num text-[#C9A45C] tracking-widest uppercase bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
          {vehicle.horsepower} HP
        </span>
      </div>
    </div>
  );
};
