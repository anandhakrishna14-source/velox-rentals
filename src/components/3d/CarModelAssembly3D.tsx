import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Upload,
  Video,
  Box,
  Layers,
  Check,
  Maximize2,
  Film,
  Lock,
  Unlock
} from 'lucide-react';
import * as THREE from 'three';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface CarModelAssembly3DProps {
  onBookCar: (vehicleId: string) => void;
  onExploreFleet: () => void;
}

interface AssemblyStage {
  step: number;
  stageNumber: string;
  title: string;
  subtitle: string;
  description: string;
  videoPercent: number; // 0 to 100% video timeline position
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

const STAGES: AssemblyStage[] = [
  {
    step: 1,
    stageNumber: '01',
    title: 'THE FOUNDATION',
    subtitle: 'Motorsport Monocoque Chassis',
    description: 'Aircraft-grade lightweight aluminum-steel composite architecture engineered for 9,000 RPM lateral stability and instantaneous steering fidelity.',
    videoPercent: 0,
    cameraPosition: [0, 2.2, 5.5],
    cameraTarget: [0, 0.4, 0]
  },
  {
    step: 2,
    stageNumber: '02',
    title: 'THE HEART',
    subtitle: '4.0L Naturally Aspirated Boxer-6',
    description: 'Rear-mounted 502 HP high-revving thoroughbred breathing through titanium valved sport exhaust with lightning-fast 7-speed PDK dual-clutch transmission.',
    videoPercent: 16,
    cameraPosition: [2.5, 2.8, -3.2],
    cameraTarget: [0, 0.5, -0.6]
  },
  {
    step: 3,
    stageNumber: '03',
    title: 'THE CONNECTION',
    subtitle: 'Forged Alloys & Ceramic PCCB Brakes',
    description: 'Staggered 20/21-inch center-lock forged magnesium alloy wheels housing 410mm carbon-ceramic composite brake discs with 6-piston yellow monobloc calipers.',
    videoPercent: 33,
    cameraPosition: [-3.8, 1.2, 2.8],
    cameraTarget: [-1.2, 0.4, 1.2]
  },
  {
    step: 4,
    stageNumber: '04',
    title: 'THE FORM',
    subtitle: 'Jet Black Aerodynamic Flyline',
    description: 'Sculpted in high-gloss Jet Black Metallic with wind-tunnel honed rear quarter haunches, front hood nostrils, and functional underfloor ground-effect channels.',
    videoPercent: 50,
    cameraPosition: [4.5, 1.8, 2.8],
    cameraTarget: [0, 0.5, 0]
  },
  {
    step: 5,
    stageNumber: '05',
    title: 'THE DETAILS',
    subtitle: 'Matrix LED Optics & Rear Lightblade',
    description: 'Dark-contoured 4-point Matrix LED headlights, swan-neck carbon aerodynamic rear wing, and continuous three-dimensional glowing red LED taillight blade.',
    videoPercent: 68,
    cameraPosition: [1.2, 1.4, 4.2],
    cameraTarget: [0, 0.6, 1.5]
  },
  {
    step: 6,
    stageNumber: '06',
    title: 'THE EXPERIENCE',
    subtitle: 'Artisanal Motorsport Cockpit',
    description: '18-way adaptive carbon bucket seats, tactile Alcantara sports steering wheel, Sport Chrono precision lap dial, and immersive acoustic driver telemetry.',
    videoPercent: 84,
    cameraPosition: [0.8, 1.3, 0.5],
    cameraTarget: [0, 0.7, 0.1]
  },
  {
    step: 7,
    stageNumber: '07',
    title: 'READY TO DRIVE',
    subtitle: 'Porsche 911 GT3 (992) Fully Assembled',
    description: '502 horsepower, 0-100 km/h in 3.4 seconds, 318 km/h top velocity. Fully inspected, fuel-primed, and ready for instant VIP handover at your terminal or doorstep.',
    videoPercent: 100,
    cameraPosition: [4.2, 1.6, 3.8],
    cameraTarget: [0, 0.4, 0]
  }
];

export const CarModelAssembly3D: React.FC<CarModelAssembly3DProps> = ({ onBookCar, onExploreFleet }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Active Stage & Engine mode
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [targetStep, setTargetStep] = useState<number>(1);
  const [engineMode, setEngineMode] = useState<'VIDEO' | 'WEBGL'>('VIDEO');

  // Video turntable playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [videoProgress, setVideoProgress] = useState<number>(0); // 0 to 100%
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartProgress, setDragStartProgress] = useState<number>(0);
  const [showVideoUploadModal, setShowVideoUploadModal] = useState<boolean>(false);
  const [customVideoUrlInput, setCustomVideoUrlInput] = useState<string>('');
  const { isAdmin, requireAdmin } = useAdminAuth();

  // Video source: Porsche 911 360 Studio Turntable video
  const [videoSrc, setVideoSrc] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('velox_porsche_stages_video') || localStorage.getItem('velox_custom_3d_video');
      if (saved) return saved;
    }
    return 'https://assets.mixkit.co/videos/preview/mixkit-super-car-driving-through-the-city-41270-large.mp4';
  });

  // WebGL 3D states
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [bodyColor, setBodyColor] = useState<string>('#15171C');
  const threeRef = useRef<any>(null);

  // Synchronize video timeline when target step changes
  useEffect(() => {
    const stage = STAGES[targetStep - 1];
    if (!stage) return;
    setCurrentStep(targetStep);

    if (videoRef.current && videoRef.current.duration) {
      const targetTime = (stage.videoPercent / 100) * videoRef.current.duration;
      videoRef.current.currentTime = targetTime;
      setVideoProgress(stage.videoPercent);
    }
  }, [targetStep]);

  // Video Time Update listener
  const handleVideoTimeUpdate = () => {
    if (isDragging || !videoRef.current || !videoRef.current.duration) return;
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setVideoProgress(progress);

    // Auto-update current step matching timeline progress
    const matched = STAGES.reduce((prev, curr) => {
      return Math.abs(curr.videoPercent - progress) < Math.abs(prev.videoPercent - progress) ? curr : prev;
    });
    if (matched && matched.step !== currentStep) {
      setCurrentStep(matched.step);
    }
  };

  // Video Drag Scrubbing
  const handleVideoPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartProgress(videoProgress);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const width = containerRef.current.clientWidth || 800;
    const deltaX = e.clientX - dragStartX;
    let deltaPercent = (deltaX / width) * 100 * 1.5;
    let newProgress = (dragStartProgress + deltaPercent) % 100;
    if (newProgress < 0) newProgress += 100;

    setVideoProgress(newProgress);
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = (newProgress / 100) * videoRef.current.duration;
    }
  };

  const handleVideoPointerUp = () => {
    setIsDragging(false);
  };

  // Toggle Video Play/Pause
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

  // Acoustic Boxer-6 Sound Effect
  const toggleSound = () => {
    setIsMuted(prev => !prev);
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(360, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.4);
    } catch {
      // Audio policy
    }
  };

  // Video Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      try {
        localStorage.setItem('velox_porsche_stages_video', url);
        localStorage.setItem('velox_custom_3d_video', url);
      } catch {
        // quota
      }
      setShowVideoUploadModal(false);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customVideoUrlInput.trim()) {
      const url = customVideoUrlInput.trim();
      setVideoSrc(url);
      try {
        localStorage.setItem('velox_porsche_stages_video', url);
        localStorage.setItem('velox_custom_3d_video', url);
      } catch {
        // quota
      }
      setShowVideoUploadModal(false);
      setCustomVideoUrlInput('');
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // WebGL 3D Initialization
  useEffect(() => {
    if (engineMode !== 'WEBGL' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050505');
    scene.fog = new THREE.FogExp2('#050505', 0.04);

    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 2.2, 5.5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xc9a45c, 3.5);
    spotLight.position.set(0, 8, 4);
    scene.add(spotLight);

    // Car Body Representation
    const carGroup = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(2, 0.6, 4.2);
    const bodyMat = new THREE.MeshPhysicalMaterial({ color: bodyColor, metalness: 0.8, roughness: 0.2 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.6;
    carGroup.add(bodyMesh);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.1 });
    const positions = [
      [-1, 0.35, 1.4],
      [1, 0.35, 1.4],
      [-1, 0.35, -1.4],
      [1, 0.35, -1.4]
    ];
    positions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      carGroup.add(wheel);
    });

    scene.add(carGroup);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isRotating) {
        carGroup.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
    };
    animate();

    threeRef.current = { scene, camera, renderer, carGroup, bodyMat };

    const handleResize = () => {
      if (!canvas) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [engineMode]);

  // Update WebGL color
  useEffect(() => {
    if (threeRef.current?.bodyMat) {
      threeRef.current.bodyMat.color.set(bodyColor);
    }
  }, [bodyColor]);

  const currentStageInfo = STAGES[targetStep - 1] || STAGES[0];

  return (
    <div id="assembly-section" className="relative w-full bg-[#050505] text-[#F5F5F5] border-t border-b border-[#222222]">
      {/* Top Header kicker */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-[#C9A45C] font-semibold uppercase mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C9A45C] animate-pulse" />
            STAGES 1 TO 7 · BESPOKE ASSEMBLY EXPERIENCE
          </div>
          <h2 className="text-3xl md:text-5xl font-luxury text-white">
            Seven Stages of Precision.
          </h2>
          <p className="text-sm md:text-base text-[#999999] mt-2 max-w-xl">
            Explore the bespoke anatomy of our flagship Porsche 911 GT3 (992). From bare motorsport chassis to howling 4.0L flat-six powertrain.
          </p>
        </div>

        {/* Engine mode switcher & video controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Video / WebGL Toggle */}
          <div className="flex items-center bg-[#111114] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setEngineMode('VIDEO')}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                engineMode === 'VIDEO'
                  ? 'bg-[#C9A45C] text-[#050505] shadow-md shadow-[#C9A45C]/20'
                  : 'text-[#999999] hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>360° Video Turntable</span>
            </button>

            <button
              type="button"
              onClick={() => setEngineMode('WEBGL')}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                engineMode === 'WEBGL'
                  ? 'bg-[#C9A45C] text-[#050505] shadow-md shadow-[#C9A45C]/20'
                  : 'text-[#999999] hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>WebGL 3D</span>
            </button>
          </div>

          {/* Change Video Button */}
          {engineMode === 'VIDEO' && (
            <button
              type="button"
              onClick={() => {
                requireAdmin(() => setShowVideoUploadModal(true), 'Change 3D Turntable Assembly Video');
              }}
              className={`px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-mono-num flex items-center gap-1.5 transition-all cursor-pointer shadow-lg ${
                isAdmin
                  ? 'bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300'
                  : 'bg-black/80 hover:bg-black/95 border border-amber-500/50 text-amber-300 hover:text-white'
              }`}
              title={
                isAdmin
                  ? 'Admin Active • Click to change 3D assembly video'
                  : 'Admin Login Required • Click to authenticate and change 3D assembly video'
              }
            >
              {isAdmin ? (
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden sm:inline">Change Video</span>
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
          )}
        </div>
      </div>

      {/* Main Interactive Stage Canvas / Video Container */}
      <div
        ref={containerRef}
        onPointerDown={engineMode === 'VIDEO' ? handleVideoPointerDown : undefined}
        onPointerMove={engineMode === 'VIDEO' ? handleVideoPointerMove : undefined}
        onPointerUp={engineMode === 'VIDEO' ? handleVideoPointerUp : undefined}
        onPointerLeave={engineMode === 'VIDEO' ? handleVideoPointerUp : undefined}
        className="relative w-full h-[620px] md:h-[720px] cursor-grab active:cursor-grabbing overflow-hidden select-none bg-[#050608]"
      >
        {engineMode === 'VIDEO' ? (
          /* ================= 360 VIDEO TURNTABLE PRESENTATION ================= */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onTimeUpdate={handleVideoTimeUpdate}
              className="w-full h-full object-contain pointer-events-none filter brightness-105 contrast-105 drop-shadow-[0_25px_35px_rgba(0,0,0,0.9)]"
            />

            {/* Dark Studio Floor and Vignette Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40 pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-44 bg-[radial-gradient(ellipse_at_50%_100%,rgba(201,164,92,0.12)_0%,transparent_75%)] pointer-events-none" />
          </div>
        ) : (
          /* ================= WEBGL 3D MODEL CANVAS ================= */
          <canvas ref={canvasRef} className="w-full h-full block" />
        )}

        {/* Floating HUD: Current Stage Card */}
        <div className="absolute top-6 left-6 md:left-12 max-w-md pointer-events-none z-30">
          <div className="bg-[#0B0B0E]/90 backdrop-blur-xl border border-[#C9A45C]/40 p-6 rounded-2xl shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between text-xs text-[#999999] mb-2 font-mono-num">
              <span className="text-[#C9A45C] font-bold tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#5ED39A] animate-pulse" />
                STAGE {currentStageInfo.stageNumber} / 07
              </span>
              <span className="text-white/60">PORSCHE 911 GT3 (992)</span>
            </div>
            <h3 className="text-2xl font-luxury text-white mb-1">
              {currentStageInfo.title}
            </h3>
            <div className="text-xs uppercase tracking-wider text-[#C9A45C] mb-3 font-semibold">
              {currentStageInfo.subtitle}
            </div>
            <p className="text-xs md:text-sm text-[#CCCCCC] leading-relaxed">
              {currentStageInfo.description}
            </p>
          </div>
        </div>

        {/* Video Floating Controls (Top Right) */}
        {engineMode === 'VIDEO' && (
          <div className="absolute top-6 right-6 md:right-12 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="p-2.5 rounded-xl bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white hover:text-[#C9A45C] transition-colors cursor-pointer shadow-lg"
              title={isPlaying ? 'Pause Auto-Spin' : 'Auto-Spin 360°'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              type="button"
              onClick={toggleSound}
              className="p-2.5 rounded-xl bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white hover:text-[#C9A45C] transition-colors cursor-pointer shadow-lg"
              title={isMuted ? 'Acoustic Exhaust Sound On' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-[#999999] bg-black/70 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 font-mono-num">
              <RotateCcw className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>Drag to scrub 360°</span>
            </div>
          </div>
        )}

        {/* Stage 7 Call to Action overlay */}
        {targetStep === 7 && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-4 w-full px-6 pointer-events-auto">
            <button
              onClick={() => onBookCar('porsche-911-gt3')}
              className="px-8 py-3.5 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-sm tracking-wider uppercase rounded-xl shadow-2xl shadow-[#C9A45C]/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-3 cursor-pointer"
            >
              <span>Book Porsche 911 GT3 (992) Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreFleet}
              className="px-6 py-3.5 bg-black/80 hover:bg-black border border-white/20 text-white font-semibold text-sm tracking-wider uppercase rounded-xl backdrop-blur-md transition-all cursor-pointer"
            >
              Explore Full Fleet
            </button>
          </div>
        )}

        {/* Bottom Interactive 7-Step Navigation Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-4xl bg-[#0B0B0E]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-3 md:p-4 shadow-2xl">
          <div className="flex items-center justify-between gap-2">
            {/* Prev button */}
            <button
              onClick={() => setTargetStep(prev => Math.max(1, prev - 1))}
              disabled={targetStep === 1}
              className="p-2 rounded-xl text-[#999999] hover:text-white disabled:opacity-30 disabled:hover:text-[#999999] transition-colors cursor-pointer"
              aria-label="Previous assembly stage"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* 7 Interactive Stage Tabs */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 flex-1">
              {STAGES.map(stage => {
                const isActive = targetStep === stage.step;
                const isPast = targetStep > stage.step;

                return (
                  <button
                    key={stage.step}
                    onClick={() => setTargetStep(stage.step)}
                    className={`group relative text-center py-2 px-1 md:px-2 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#C9A45C] text-[#050505] shadow-lg shadow-[#C9A45C]/30 font-bold'
                        : isPast
                        ? 'bg-[#18181F] text-[#C9A45C] border border-[#C9A45C]/30 hover:bg-[#22222B]'
                        : 'bg-[#101115] text-[#777777] border border-white/5 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="text-[10px] md:text-xs font-mono-num">
                      STAGE {stage.stageNumber}
                    </div>
                    <div className="hidden md:block text-[11px] font-semibold truncate mt-0.5">
                      {stage.title.split(' ')[1] || stage.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <button
              onClick={() => setTargetStep(prev => Math.min(7, prev + 1))}
              disabled={targetStep === 7}
              className="p-2 rounded-xl text-[#999999] hover:text-white disabled:opacity-30 disabled:hover:text-[#999999] transition-colors cursor-pointer"
              aria-label="Next assembly stage"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Upload / URL Modal for Stages 1 to 7 */}
      {showVideoUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#0E0F14] border border-[#C9A45C]/50 rounded-2xl p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-[#C9A45C]" />
                <h4 className="text-base font-luxury font-bold text-white">
                  Stages 1 to 7 Turntable Video
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoUploadModal(false)}
                className="text-white/50 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#AAAAAA] mb-4 leading-relaxed">
              Upload a 360° video rotation for the Porsche 911 GT3 (992) to map across Stages 1 to 7:
            </p>

            {/* File Upload Option */}
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#C9A45C]/40 hover:border-[#C9A45C] rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-center group">
                <Upload className="w-8 h-8 text-[#C9A45C] mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-white mb-1">
                  Upload Video File (MP4, WebM, MOV)
                </span>
                <span className="text-[11px] text-[#888888]">
                  Select the Porsche 360 video from your computer
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
                  value={customVideoUrlInput}
                  onChange={(e) => setCustomVideoUrlInput(e.target.value)}
                  placeholder="https://example.com/porsche-turntable.mp4"
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
    </div>
  );
};
