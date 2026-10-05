import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Eye, Sun, Maximize2, RefreshCw, Sparkles, Volume2, X } from 'lucide-react';
import { Vehicle } from '../../types';

interface VehicleViewer3DProps {
  vehicle: Vehicle;
  selectedColor?: string;
  onColorChange?: (colorHex: string) => void;
  className?: string;
}

type ViewMode = 'EXTERIOR' | 'INTERIOR' | 'FRONT_3_4' | 'REAR_PROFILE';

interface Hotspot {
  id: string;
  name: string;
  category: string;
  title: string;
  spec: string;
  description: string;
  camDistance: number;
  camPolar: number;
  camAzimuth: number;
  lookAt: [number, number, number];
}

const VEHICLE_HOTSPOTS: Hotspot[] = [
  {
    id: 'engine',
    name: 'ENGINE',
    category: 'Powertrain',
    title: 'Twin-Turbo Flat-Six Powerplant',
    spec: '350–550 HP · 7,500 RPM Redline',
    description: 'Bespoke rear-mounted boxer architecture with titanium exhaust bypass valves and direct high-pressure injection delivering instantaneous torque.',
    camDistance: 3.4,
    camPolar: Math.PI / 2.8,
    camAzimuth: Math.PI * 0.95,
    lookAt: [0, 0.45, -0.6]
  },
  {
    id: 'brakes',
    name: 'BRAKES',
    category: 'Chassis',
    title: 'Carbon-Ceramic Composite Rotors',
    spec: '410mm Front / 390mm Rear · 6-Piston Calipers',
    description: 'Formula 1 derived carbon-silicon carbide discs paired with gold monobloc calipers, offering fade-free deceleration under intense highway driving.',
    camDistance: 2.8,
    camPolar: Math.PI / 2.3,
    camAzimuth: Math.PI * 0.35,
    lookAt: [-0.95, 0.36, 1.35]
  },
  {
    id: 'headlights',
    name: 'LED HEADLIGHTS',
    category: 'Lighting',
    title: '4-Point Matrix Crystal Optics',
    spec: '600m Laser High-Beam Beam throw',
    description: 'Dynamic cornering illumination with 84 individually controllable LEDs per headlight, ensuring optimal visibility on nocturnal coastal drives.',
    camDistance: 3.2,
    camPolar: Math.PI / 2.5,
    camAzimuth: Math.PI * 0.1,
    lookAt: [0, 0.55, 1.8]
  },
  {
    id: 'interior',
    name: 'INTERIOR',
    category: 'Cockpit',
    title: '18-Way Adaptive Carbon Sport Seats',
    spec: 'Alcantara Wheel · Burmester Surround',
    description: 'Hand-stitched leather upholstery with champagne gold contrast piping, active pneumatic side bolsters, and tactile milled aluminium switchgear.',
    camDistance: 1.8,
    camPolar: Math.PI / 2.4,
    camAzimuth: 0.15,
    lookAt: [0, 0.65, 0.1]
  },
  {
    id: 'aero',
    name: 'AERODYNAMICS',
    category: 'Exterior',
    title: 'Active Aerodynamic Downforce Wing',
    spec: '140 kg Downforce at 200 km/h',
    description: 'Integrated ducktail rear wing and functional underfloor ground-effect diffuser channels that plant the vehicle firmly through high-speed turns.',
    camDistance: 3.6,
    camPolar: Math.PI / 2.9,
    camAzimuth: Math.PI * 0.82,
    lookAt: [0, 0.7, -1.8]
  }
];

export const VehicleViewer3D: React.FC<VehicleViewer3DProps> = ({
  vehicle,
  selectedColor = '#15171C',
  onColorChange,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentColor, setCurrentColor] = useState<string>(selectedColor);
  const [viewMode, setViewMode] = useState<ViewMode>('EXTERIOR');
  const [headlightsOn, setHeadlightsOn] = useState<boolean>(true);
  const [doorsOpen, setDoorsOpen] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [pointerStart, setPointerStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    carGroup: THREE.Group;
    doors: { left: THREE.Mesh; right: THREE.Mesh };
    bodyMesh: THREE.Mesh;
    materials: {
      bodyMat: THREE.MeshPhysicalMaterial;
      glassMat: THREE.MeshPhysicalMaterial;
      headlightMat: THREE.MeshStandardMaterial;
      tailLightMat: THREE.MeshStandardMaterial;
    };
    headlights: THREE.PointLight[];
    camDistance: number;
    camPolar: number;
    camAzimuth: number;
    targetCamPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    animFrameId: number | null;
  } | null>(null);

  useEffect(() => {
    setCurrentColor(selectedColor);
  }, [selectedColor]);

  // Initialize Three.js 360 viewer
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090909);
    scene.fog = new THREE.FogExp2(0x090909, 0.05);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(3.8, 1.6, 3.8);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8fa8cf, 1.2);
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    const goldRim = new THREE.DirectionalLight(0xc9a45c, 2.6);
    goldRim.position.set(0, 3, -6);
    scene.add(goldRim);

    // Headlight point lights
    const hlLeft = new THREE.PointLight(0xe8f4ff, 2.8, 8);
    hlLeft.position.set(-0.65, 0.6, 2.2);
    const hlRight = new THREE.PointLight(0xe8f4ff, 2.8, 8);
    hlRight.position.set(0.65, 0.6, 2.2);
    scene.add(hlLeft, hlRight);

    // Reflective floor
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c0c0e,
      roughness: 0.22,
      metalness: 0.7
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Radial gold ring on floor
    const ringGeo = new THREE.RingGeometry(3.2, 3.23, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xc9a45c, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    scene.add(ring);

    // Materials
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(currentColor),
      roughness: 0.16,
      metalness: 0.88,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08
    });

    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1f2127,
      roughness: 0.45,
      metalness: 0.7
    });

    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x141416,
      roughness: 0.28,
      metalness: 0.92
    });

    const caliperMat = new THREE.MeshStandardMaterial({
      color: 0xc9a45c,
      roughness: 0.3,
      metalness: 0.8
    });

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x121214,
      roughness: 0.92,
      metalness: 0.05
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0e131d,
      transmission: 0.88,
      opacity: 0.38,
      transparent: true,
      roughness: 0.04,
      ior: 1.52
    });

    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xdff0ff,
      emissiveIntensity: 2.2
    });

    const tailLightMat = new THREE.MeshStandardMaterial({
      color: 0x990000,
      emissive: 0xff1111,
      emissiveIntensity: 2.5
    });

    // Master Car Group
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    // Base chassis plate
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.25, 4.0), chassisMat);
    chassis.position.set(0, 0.26, 0);
    chassis.castShadow = true;
    carGroup.add(chassis);

    // Main sculpted aerodynamic body shell
    const bodyGeo = new THREE.BoxGeometry(1.7, 0.48, 4.0);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 0.58, 0);
    bodyMesh.castShadow = true;
    carGroup.add(bodyMesh);

    // Curved front hood
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.15, 1.45), bodyMat);
    hood.position.set(0, 0.68, 1.3);
    hood.rotation.x = -0.09;
    carGroup.add(hood);

    // Cabin Greenhouse & Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.42, 1.7), bodyMat);
    roof.position.set(0, 1.05, -0.2);
    carGroup.add(roof);

    // Front Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.04, 0.9), glassMat);
    windshield.position.set(0, 0.94, 0.72);
    windshield.rotation.x = 0.58;
    carGroup.add(windshield);

    // Rear Windshield
    const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.04, 0.88), glassMat);
    rearGlass.position.set(0, 0.96, -1.05);
    rearGlass.rotation.x = -0.46;
    carGroup.add(rearGlass);

    // Doors with hinge pivot
    const doorGeo = new THREE.BoxGeometry(0.12, 0.5, 1.5);
    const doorLeft = new THREE.Mesh(doorGeo, bodyMat);
    doorLeft.position.set(-0.84, 0.6, 0.0);
    const doorRight = new THREE.Mesh(doorGeo, bodyMat);
    doorRight.position.set(0.84, 0.6, 0.0);
    carGroup.add(doorLeft, doorRight);

    // Headlights (4-point LED matrix)
    const hlGeo = new THREE.BoxGeometry(0.28, 0.1, 0.08);
    const hlL = new THREE.Mesh(hlGeo, headlightMat);
    hlL.position.set(-0.62, 0.58, 2.02);
    const hlR = new THREE.Mesh(hlGeo, headlightMat);
    hlR.position.set(0.62, 0.58, 2.02);
    carGroup.add(hlL, hlR);

    // Continuous rear taillight blade
    const tailBlade = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.05, 0.06), tailLightMat);
    tailBlade.position.set(0, 0.72, -2.02);
    carGroup.add(tailBlade);

    // 4 Wheels
    const addWheel = (x: number, y: number, z: number, isLeft: boolean) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(x, y, z);

      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.28, 32), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.26, 24), wheelMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      const goldLip = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.015, 16, 32), caliperMat);
      goldLip.rotation.y = Math.PI / 2;
      goldLip.position.x = isLeft ? -0.13 : 0.13;
      wheelGroup.add(goldLip);

      const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.14), caliperMat);
      caliper.position.set(isLeft ? 0.02 : -0.02, 0.18, 0);
      wheelGroup.add(caliper);

      carGroup.add(wheelGroup);
    };

    addWheel(-0.95, 0.36, 1.35, true);
    addWheel(0.95, 0.36, 1.35, false);
    addWheel(-0.96, 0.38, -1.35, true);
    addWheel(0.96, 0.38, -1.35, false);

    // Save Three context
    threeRef.current = {
      scene,
      camera,
      renderer,
      carGroup,
      doors: { left: doorLeft, right: doorRight },
      bodyMesh,
      materials: {
        bodyMat,
        glassMat,
        headlightMat,
        tailLightMat
      },
      headlights: [hlLeft, hlRight],
      camDistance: 5.6,
      camPolar: Math.PI / 2.7,
      camAzimuth: Math.PI / 4,
      targetCamPos: new THREE.Vector3(3.8, 1.6, 3.8),
      targetLookAt: new THREE.Vector3(0, 0.5, 0),
      animFrameId: null
    };

    const handleResize = () => {
      if (!containerRef.current || !threeRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      threeRef.current.camera.aspect = w / h;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      if (threeRef.current) {
        const { camera, renderer, scene, carGroup, doors } = threeRef.current;

        // Auto rotate if active
        if (isRotating && !isDragging) {
          threeRef.current.camAzimuth += 0.005;
        }

        // Calculate spherical camera position
        const dist = threeRef.current.camDistance;
        const polar = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, threeRef.current.camPolar));
        const azim = threeRef.current.camAzimuth;

        const targetX = dist * Math.sin(polar) * Math.sin(azim);
        const targetY = dist * Math.cos(polar);
        const targetZ = dist * Math.sin(polar) * Math.cos(azim);

        threeRef.current.targetCamPos.set(targetX, targetY, targetZ);
        camera.position.lerp(threeRef.current.targetCamPos, 0.08);
        camera.lookAt(threeRef.current.targetLookAt);

        // Smooth door animation
        const targetDoorAngle = doorsOpen ? 0.45 : 0;
        doors.left.rotation.y = THREE.MathUtils.lerp(doors.left.rotation.y, targetDoorAngle, 0.1);
        doors.right.rotation.y = THREE.MathUtils.lerp(doors.right.rotation.y, -targetDoorAngle, 0.1);

        renderer.render(scene, camera);
      }
      threeRef.current!.animFrameId = requestAnimationFrame(animate);
    };

    threeRef.current.animFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeRef.current?.animFrameId) {
        cancelAnimationFrame(threeRef.current.animFrameId);
      }
      renderer.dispose();
    };
  }, []);

  // Update color
  useEffect(() => {
    if (threeRef.current?.materials.bodyMat) {
      threeRef.current.materials.bodyMat.color.set(currentColor);
    }
  }, [currentColor]);

  // Update headlights
  useEffect(() => {
    if (threeRef.current) {
      threeRef.current.headlights.forEach(hl => {
        hl.intensity = headlightsOn ? 2.8 : 0;
      });
      threeRef.current.materials.headlightMat.emissiveIntensity = headlightsOn ? 2.2 : 0;
      threeRef.current.materials.tailLightMat.emissiveIntensity = headlightsOn ? 2.5 : 0.2;
    }
  }, [headlightsOn]);

  // Switch camera view modes
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setIsRotating(false);
    setActiveHotspot(null);
    if (!threeRef.current) return;

    if (mode === 'EXTERIOR') {
      threeRef.current.camDistance = 5.6;
      threeRef.current.camPolar = Math.PI / 2.7;
      threeRef.current.camAzimuth = Math.PI / 4;
      threeRef.current.targetLookAt.set(0, 0.5, 0);
    } else if (mode === 'INTERIOR') {
      threeRef.current.camDistance = 1.6;
      threeRef.current.camPolar = Math.PI / 2.5;
      threeRef.current.camAzimuth = 0.1;
      threeRef.current.targetLookAt.set(0, 0.65, 0.2);
    } else if (mode === 'FRONT_3_4') {
      threeRef.current.camDistance = 4.8;
      threeRef.current.camPolar = Math.PI / 2.6;
      threeRef.current.camAzimuth = Math.PI * 0.15;
      threeRef.current.targetLookAt.set(0, 0.45, 0.5);
    } else if (mode === 'REAR_PROFILE') {
      threeRef.current.camDistance = 4.8;
      threeRef.current.camPolar = Math.PI / 2.8;
      threeRef.current.camAzimuth = Math.PI * 0.85;
      threeRef.current.targetLookAt.set(0, 0.45, -0.5);
    }
  };

  // Hotspot Click Handler
  const handleSelectHotspot = (hotspot: Hotspot) => {
    setActiveHotspot(hotspot);
    setIsRotating(false);
    if (!threeRef.current) return;

    threeRef.current.camDistance = hotspot.camDistance;
    threeRef.current.camPolar = hotspot.camPolar;
    threeRef.current.camAzimuth = hotspot.camAzimuth;
    threeRef.current.targetLookAt.set(...hotspot.lookAt);
  };

  const handleResetCamera = () => {
    handleViewModeChange('EXTERIOR');
    setDoorsOpen(false);
    setActiveHotspot(null);
  };

  // Drag listeners
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setIsRotating(false);
    setPointerStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !threeRef.current) return;
    const dx = e.clientX - pointerStart.x;
    const dy = e.clientY - pointerStart.y;
    setPointerStart({ x: e.clientX, y: e.clientY });

    threeRef.current.camAzimuth -= dx * 0.006;
    threeRef.current.camPolar -= dy * 0.005;
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!threeRef.current) return;
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.003;
    threeRef.current.camDistance = Math.max(1.8, Math.min(8.5, threeRef.current.camDistance + zoomDelta));
  };

  return (
    <div className={`relative w-full h-[520px] md:h-[620px] rounded-2xl bg-[#090909] border border-[#222222] overflow-hidden select-none ${className}`}>
      {/* 3D Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Top Left: 360 Badge & Hint */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#050505]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-[#F5F5F5] font-medium">
          <RotateCw className="w-3.5 h-3.5 text-[#C9A45C]" />
          <span>Interactive 360° Studio Viewer</span>
        </div>
        <span className="text-[11px] text-[#888888] pl-2 font-mono-num">
          Drag to explore · Click hotspots below
        </span>
      </div>

      {/* Top Right: Color Selector */}
      <div className="absolute top-4 right-4 z-10 bg-[#050505]/85 backdrop-blur-md p-2 rounded-xl border border-white/10 flex items-center gap-1.5">
        <span className="text-[11px] text-[#999999] px-1 font-medium">Finish:</span>
        {vehicle.colors.map(col => (
          <button
            key={col.name}
            onClick={() => {
              setCurrentColor(col.hex);
              onColorChange?.(col.hex);
            }}
            className={`w-6 h-6 rounded-full transition-all ${
              currentColor === col.hex ? 'ring-2 ring-[#C9A45C] scale-110' : 'opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: col.hex }}
            title={col.name}
          />
        ))}
      </div>

      {/* Interactive Feature Hotspots Bar (Item 4) */}
      <div className="absolute top-16 left-4 z-10 flex flex-wrap gap-1.5 max-w-sm sm:max-w-md">
        {VEHICLE_HOTSPOTS.map(h => (
          <button
            key={h.id}
            onClick={() => handleSelectHotspot(h)}
            className={`px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-full border transition-all cursor-pointer ${
              activeHotspot?.id === h.id
                ? 'bg-[#C9A45C] text-[#050505] border-[#C9A45C] shadow-lg shadow-[#C9A45C]/30 scale-105'
                : 'bg-[#0A0B0E]/80 text-[#999999] border-white/10 hover:text-white hover:border-[#C9A45C]/40 backdrop-blur-md'
            }`}
          >
            ● {h.name}
          </button>
        ))}
      </div>

      {/* Active Hotspot Detail Card Overlay */}
      {activeHotspot && (
        <div className="absolute top-28 left-4 right-4 md:right-auto md:max-w-sm z-20 bg-[#090A0D]/95 backdrop-blur-xl border border-[#C9A45C]/50 p-4 rounded-xl shadow-2xl animate-in fade-in zoom-in-95">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] font-mono-num font-bold uppercase tracking-wider text-[#C9A45C]">
                {activeHotspot.category} INSPECTION
              </span>
              <h4 className="text-base font-luxury font-bold text-white leading-tight">
                {activeHotspot.title}
              </h4>
            </div>
            <button
              onClick={() => setActiveHotspot(null)}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-[#888888] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs font-mono-num text-[#5ED39A] font-semibold mb-2">
            {activeHotspot.spec}
          </div>

          <p className="text-xs text-[#CCCCCC] leading-relaxed mb-3">
            {activeHotspot.description}
          </p>

          <div className="text-[10px] text-[#777777] flex items-center gap-1.5 pt-2 border-t border-white/5">
            <Sparkles className="w-3 h-3 text-[#C9A45C]" />
            <span>Telemetry calibrated to factory specification</span>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-xl bg-[#070707]/90 backdrop-blur-md border border-[#2A2A2A] rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 shadow-2xl">
        {/* Preset Camera Views */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewModeChange('EXTERIOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'EXTERIOR'
                ? 'bg-[#C9A45C] text-[#050505]'
                : 'text-[#999999] hover:text-white hover:bg-white/5'
            }`}
          >
            360° View
          </button>
          <button
            onClick={() => handleViewModeChange('INTERIOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'INTERIOR'
                ? 'bg-[#C9A45C] text-[#050505]'
                : 'text-[#999999] hover:text-white hover:bg-white/5'
            }`}
          >
            Interior
          </button>
          <button
            onClick={() => handleViewModeChange('FRONT_3_4')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'FRONT_3_4'
                ? 'bg-[#C9A45C] text-[#050505]'
                : 'text-[#999999] hover:text-white hover:bg-white/5'
            }`}
          >
            Front
          </button>
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setHeadlightsOn(prev => !prev)}
            className={`p-2 rounded-lg text-xs border transition-colors flex items-center gap-1.5 ${
              headlightsOn
                ? 'bg-[#C9A45C]/15 border-[#C9A45C]/40 text-[#C9A45C]'
                : 'bg-white/5 border-transparent text-[#888888] hover:text-white'
            }`}
            title="Toggle Headlights"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Lights</span>
          </button>

          <button
            onClick={() => setDoorsOpen(prev => !prev)}
            className={`p-2 rounded-lg text-xs border transition-colors flex items-center gap-1.5 ${
              doorsOpen
                ? 'bg-[#C9A45C]/15 border-[#C9A45C]/40 text-[#C9A45C]'
                : 'bg-white/5 border-transparent text-[#888888] hover:text-white'
            }`}
            title="Open / Close Doors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{doorsOpen ? 'Close' : 'Doors'}</span>
          </button>

          <button
            onClick={() => setIsRotating(prev => !prev)}
            className={`p-2 rounded-lg text-xs border transition-colors ${
              isRotating
                ? 'bg-[#C9A45C]/15 border-[#C9A45C]/40 text-[#C9A45C]'
                : 'bg-white/5 border-transparent text-[#888888] hover:text-white'
            }`}
            title="Auto Rotate 360"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleResetCamera}
            className="p-2 rounded-lg text-xs bg-white/5 text-[#888888] hover:text-white hover:bg-white/10 transition-colors"
            title="Reset View"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
