import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  Radio,
  MapPin,
  ShieldAlert,
  Car,
  Clock,
  Compass,
  CheckCircle2,
  X,
  Phone,
  MessageSquare,
  RefreshCw,
  Navigation,
  Wrench,
  Zap,
  BatteryCharging,
  LifeBuoy,
  Volume2,
  VolumeX,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Booking, EmergencyIncident, EmergencyIncidentType, EmergencyStatus } from '../types';

interface EmergencyAssistanceViewProps {
  activeBooking?: Booking | null;
  allBookings?: Booking[];
  onClose?: () => void;
  isStandaloneModal?: boolean;
}

export const EmergencyAssistanceView: React.FC<EmergencyAssistanceViewProps> = ({
  activeBooking,
  allBookings = [],
  onClose,
  isStandaloneModal = false
}) => {
  // Available bookings to link to emergency
  const targetBooking = activeBooking || allBookings.find(b => b.status === 'ACTIVE') || allBookings[0];
  const [selectedBookingId, setSelectedBookingId] = useState<string>(targetBooking?.id || '');
  const [selectedVehicleName, setSelectedVehicleName] = useState<string>(targetBooking?.vehicleName || 'Porsche 911 GT3 (992)');

  // Incident parameters
  const [incidentType, setIncidentType] = useState<EmergencyIncidentType>('TIRE_BLOWOUT');
  const [notes, setNotes] = useState<string>('');
  const [gpsLocation, setGpsLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
    accuracy: number;
  }>({
    address: 'Bangalore-Mysore Expressway (NH 275), KM 42.8 near Bidadi',
    lat: 12.7984,
    lng: 77.3821,
    accuracy: 8
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Signal Trigger States
  const [isArmed, setIsArmed] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(() => {
    const saved = localStorage.getItem('velox_active_incident');
    return saved ? JSON.parse(saved) : null;
  });

  // Sound toggle (synthesized oscillator for SOS beacon)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Real-time simulated progression of roadside assistance
  useEffect(() => {
    if (!activeIncident || activeIncident.status === 'RESOLVED' || activeIncident.status === 'CANCELLED') {
      return;
    }

    const interval = setInterval(() => {
      setActiveIncident(prev => {
        if (!prev) return null;

        // Reduce ETA and update status smoothly
        let nextEta = Math.max(1, prev.etaMinutes - 1);
        let nextStatus: EmergencyStatus = prev.status;
        let nextDistance = Math.max(0.4, Number((((prev.distanceKm || 6.2) - 0.5)).toFixed(1)));
        let nextSpeed = Math.floor(55 + Math.random() * 15);

        if (prev.status === 'BROADCASTING') {
          nextStatus = 'DISPATCHED';
          nextEta = 18;
          nextDistance = 7.4;
        } else if (prev.status === 'DISPATCHED') {
          nextStatus = 'EN_ROUTE';
          nextEta = 14;
          nextDistance = 5.8;
        } else if (prev.status === 'EN_ROUTE' && prev.etaMinutes <= 3) {
          nextStatus = 'ON_SCENE';
          nextEta = 0;
          nextDistance = 0.1;
        }

        const updated: EmergencyIncident = {
          ...prev,
          etaMinutes: nextEta,
          status: nextStatus,
          distanceKm: nextDistance,
          liveSpeedKmH: nextSpeed
        };
        localStorage.setItem('velox_active_incident', JSON.stringify(updated));
        return updated;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [activeIncident?.status]);

  // Audio SOS beeper
  const playSosTone = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Ignore if blocked by browser policy
    }
  };

  // Get current device GPS
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsLocating(false);
        setGpsLocation({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
          address: `Current GPS Coordinates: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E (Near High-Speed Corridor)`,
          accuracy: Math.round(pos.coords.accuracy)
        });
      },
      err => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        // Fallback already set
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Countdown timer when armed
  useEffect(() => {
    let timer: any = null;
    if (isArmed && countdown > 0) {
      playSosTone();
      timer = setTimeout(() => {
        setCountdown(c => c - 1);
      }, 1000);
    } else if (isArmed && countdown === 0) {
      // Trigger dispatch
      handleCommitDistressSignal();
      setIsArmed(false);
      setCountdown(3);
    }
    return () => clearTimeout(timer);
  }, [isArmed, countdown]);

  const handleArmTrigger = () => {
    setIsArmed(true);
    setCountdown(3);
  };

  const handleAbortArm = () => {
    setIsArmed(false);
    setCountdown(3);
  };

  // Execute distress signal broadcast
  const handleCommitDistressSignal = () => {
    const newIncident: EmergencyIncident = {
      id: `SOS-${Math.floor(10000 + Math.random() * 90000)}`,
      bookingId: selectedBookingId || targetBooking?.id,
      vehicleName: selectedVehicleName,
      incidentType,
      incidentDescription: notes || 'Automated high-priority roadside distress beacon triggered by driver.',
      latitude: gpsLocation.lat,
      longitude: gpsLocation.lng,
      locationAddress: gpsLocation.address,
      status: 'BROADCASTING',
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      etaMinutes: 16,
      dispatcherName: 'Master Tech Vikram Sen',
      dispatcherPhone: '+91 800 835 6911',
      recoveryVehicle: 'Heavy-Duty Hydraulic Low-Bed Transporter #04',
      liveSpeedKmH: 64,
      distanceKm: 6.8,
      replacementVehicleDispatched: true
    };

    setActiveIncident(newIncident);
    localStorage.setItem('velox_active_incident', JSON.stringify(newIncident));
    playSosTone();
  };

  const handleCancelIncident = () => {
    if (!window.confirm('Are you sure you want to stand down this emergency assistance request?')) return;
    setActiveIncident(null);
    localStorage.removeItem('velox_active_incident');
  };

  const incidentOptions: {
    type: EmergencyIncidentType;
    label: string;
    icon: any;
    desc: string;
    priority: string;
  }[] = [
    {
      type: 'TIRE_BLOWOUT',
      label: 'Tire Puncture / Blowout',
      icon: Wrench,
      desc: 'Mobile tire-mount crew dispatched with Michelin Pilot Sport OEM replacement.',
      priority: 'P1 HIGH'
    },
    {
      type: 'ENGINE_MECHANICAL',
      label: 'Powertrain / Mechanical',
      icon: Flame,
      desc: 'Master technician with OBD diagnostics & flatbed recovery unit.',
      priority: 'CRITICAL'
    },
    {
      type: 'BATTERY_ELECTRICAL',
      label: 'Battery / Electrical Drain',
      icon: BatteryCharging,
      desc: 'Rapid booster jump unit or high-voltage battery service van.',
      priority: 'P2 RAPID'
    },
    {
      type: 'COLLISION_ACCIDENT',
      label: 'Traffic Collision / Impact',
      icon: AlertTriangle,
      desc: 'First responders, insurance surveyor, and emergency flatbed transporter.',
      priority: 'URGENT'
    },
    {
      type: 'FUEL_FLUID_EMPTY',
      label: 'Fuel / Coolant Depleted',
      icon: Zap,
      desc: 'Delivery of 20L 98-Octane RON high-performance fuel / factory fluids.',
      priority: 'P2 RAPID'
    },
    {
      type: 'MEDICAL_PERSONAL_SAFETY',
      label: 'Medical / Security SOS',
      icon: ShieldAlert,
      desc: 'Immediate emergency concierge link, paramedic dispatch, and highway escort.',
      priority: 'LIFE SAFETY'
    }
  ];

  return (
    <div className="relative text-[#F5F5F5] w-full">
      {/* Top Banner Alert Bar */}
      <div className="bg-gradient-to-r from-[#1E0E0E] via-[#2A1212] to-[#1E0E0E] border border-[#E66A6A]/40 rounded-2xl p-4 md:p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E66A6A]/15 border border-[#E66A6A]/50 text-[#E66A6A] shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E66A6A] rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-num font-bold tracking-widest text-[#E66A6A] uppercase bg-[#E66A6A]/10 px-2 py-0.5 rounded">
                24/7 VELOX RESCUE NETWORK
              </span>
              <span className="text-xs text-[#888888]">Satellite & Cellular Telemetry</span>
            </div>
            <h3 className="text-lg md:text-xl font-luxury font-bold text-white mt-0.5">
              Rapid Emergency Roadside Assistance
            </h3>
            <p className="text-xs text-[#AAAAAA]">
              Guaranteed nationwide response for Velox drivers with dedicated flatbed transporters and roadside technicians.
            </p>
          </div>
        </div>

        {/* 24/7 Direct Call Direct-Connect Button */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <a
            href="tel:+918008356900"
            className="flex-1 sm:flex-none py-3 px-5 bg-gradient-to-r from-[#C9A45C] to-[#E5C788] hover:from-[#DFBD78] hover:to-[#F2DEC0] text-[#050505] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#C9A45C]/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-[#050505]" />
            <span>Call 24/7 Support Hotline</span>
          </a>

          <button
            type="button"
            onClick={() => setSoundEnabled(s => !s)}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[#AAAAAA] hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute SOS sound' : 'Enable SOS sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#C9A45C]" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Active Incident Status vs Trigger Console */}
      {activeIncident ? (
        /* ================= ACTIVE DISTRESS SIGNAL COCKPIT ================= */
        <div className="space-y-6 animate-in fade-in">
          {/* Status Stepper Header */}
          <div className="bg-[#101217] border border-[#2B2D38] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient Pulse Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#E66A6A]/10 blur-[100px] pointer-events-none rounded-full" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#E66A6A] animate-ping" />
                  <span className="text-xs font-mono-num font-bold text-[#E66A6A] tracking-wider uppercase">
                    INCIDENT ACTIVE · {activeIncident.id}
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="text-xs font-mono-num text-[#888888]">
                    Reported at {activeIncident.reportedAt}
                  </span>
                </div>
                <h4 className="text-2xl md:text-3xl font-luxury text-white">
                  Roadside Support Status: <span className="text-[#C9A45C]">{activeIncident.status.replace('_', ' ')}</span>
                </h4>
                <p className="text-xs text-[#999999]">
                  Vehicle: <strong className="text-white">{activeIncident.vehicleName}</strong> · Incident:{' '}
                  <strong className="text-white">{activeIncident.incidentType.replace('_', ' ')}</strong>
                </p>
              </div>

              {/* Live ETA Ticker */}
              <div className="flex items-center gap-4 bg-[#090A0D] border border-white/10 rounded-2xl p-4 shrink-0">
                <div className="text-center px-2">
                  <span className="text-[10px] text-[#777777] uppercase tracking-wider block">LIVE ETA</span>
                  <span className="text-3xl font-luxury font-bold text-[#5ED39A] font-mono-num">
                    {activeIncident.status === 'ON_SCENE' ? 'ARRIVED' : `${activeIncident.etaMinutes} min`}
                  </span>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-center px-2">
                  <span className="text-[10px] text-[#777777] uppercase tracking-wider block">DISTANCE</span>
                  <span className="text-xl font-mono-num font-bold text-white">
                    {activeIncident.distanceKm} km
                  </span>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-center px-2">
                  <span className="text-[10px] text-[#777777] uppercase tracking-wider block">DISPATCH SPEED</span>
                  <span className="text-xl font-mono-num font-bold text-[#C9A45C]">
                    {activeIncident.liveSpeedKmH} km/h
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Multi-Stage Progress Stepper */}
            <div className="py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    step: 1,
                    title: '1. Broadcast Logged',
                    desc: 'Coordinates & telemetry locked',
                    active: true,
                    completed: true
                  },
                  {
                    step: 2,
                    title: '2. Unit Dispatched',
                    desc: 'Flatbed recovery assigned',
                    active: activeIncident.status !== 'BROADCASTING',
                    completed: activeIncident.status !== 'BROADCASTING'
                  },
                  {
                    step: 3,
                    title: '3. En Route (Live)',
                    desc: `${activeIncident.distanceKm} km away via Highway`,
                    active: activeIncident.status === 'EN_ROUTE' || activeIncident.status === 'ON_SCENE',
                    completed: activeIncident.status === 'ON_SCENE'
                  },
                  {
                    step: 4,
                    title: '4. On-Scene Arrival',
                    desc: 'Handover & Courtesy Vehicle',
                    active: activeIncident.status === 'ON_SCENE',
                    completed: activeIncident.status === 'ON_SCENE'
                  }
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      s.completed
                        ? 'bg-[#5ED39A]/10 border-[#5ED39A]/40 text-white'
                        : s.active
                        ? 'bg-[#C9A45C]/15 border-[#C9A45C] text-white shadow-lg shadow-[#C9A45C]/15'
                        : 'bg-[#15161C] border-white/5 text-[#666666]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{s.title}</span>
                      {s.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#5ED39A]" />
                      ) : s.active ? (
                        <Radio className="w-4 h-4 text-[#C9A45C] animate-pulse" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#555555]" />
                      )}
                    </div>
                    <div className="text-[11px] text-[#999999]">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar Telemetry Card & Map Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
              {/* Unit Info */}
              <div className="p-4 bg-[#14151C] border border-white/5 rounded-2xl space-y-2">
                <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#C9A45C] block">
                  ASSIGNED RECOVERY VEHICLE
                </span>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#C9A45C]" />
                  <span>{activeIncident.recoveryVehicle}</span>
                </div>
                <div className="text-xs text-[#888888] space-y-1">
                  <div>Lead: <strong className="text-white">{activeIncident.dispatcherName}</strong></div>
                  <div>Direct Phone: <strong className="text-[#C9A45C]">{activeIncident.dispatcherPhone}</strong></div>
                </div>

                <div className="pt-2 flex gap-2">
                  <a
                    href={`tel:${activeIncident.dispatcherPhone}`}
                    className="flex-1 py-2 px-3 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Tech</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => alert(`Connecting securely to dispatch chat for incident ${activeIncident.id}...`)}
                    className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Live Chat</span>
                  </button>
                </div>
              </div>

              {/* GPS Coordinates & Location */}
              <div className="p-4 bg-[#14151C] border border-white/5 rounded-2xl space-y-2">
                <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#C9A45C] block">
                  INCIDENT COORDINATES
                </span>
                <div className="text-xs text-white flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-[#E66A6A] shrink-0 mt-0.5" />
                  <span className="leading-snug">{activeIncident.locationAddress}</span>
                </div>
                <div className="text-[11px] font-mono-num text-[#888888] pt-1">
                  GPS: {activeIncident.latitude}° N, {activeIncident.longitude}° E
                </div>
                <a
                  href={`https://maps.google.com/?q=${activeIncident.latitude},${activeIncident.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#C9A45C] hover:underline pt-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open in Google Maps Navigation</span>
                </a>
              </div>

              {/* Courtesy Replacement Vehicle Privilege */}
              <div className="p-4 bg-gradient-to-br from-[#1C1812] to-[#121319] border border-[#C9A45C]/30 rounded-2xl space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#5ED39A] block font-bold">
                    ✓ VIP COURTESY SWAP ACTIVATED
                  </span>
                  <div className="text-xs font-bold text-white mt-1">
                    Zero-Interruption Guarantee
                  </div>
                  <p className="text-[11px] text-[#999999] mt-1 leading-snug">
                    A showroom-conditioned courtesy vehicle will arrive simultaneously on the flatbed to ensure your itinerary continues uninterrupted.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs text-[#DDDDDD] font-mono-num font-semibold">Porsche 911 GT3 Courtesy Replacement</span>
                  <span className="text-[10px] text-[#5ED39A] bg-[#5ED39A]/15 px-2 py-0.5 rounded">Complimentary</span>
                </div>
              </div>
            </div>

            {/* Actions: Cancel Beacon */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-[#777777]">
                Beacon transmitting high-frequency pings every 5 seconds. Dispatch operations are monitoring telemetry.
              </div>

              <button
                type="button"
                onClick={handleCancelIncident}
                className="py-2 px-4 rounded-xl border border-white/10 text-xs text-[#AAAAAA] hover:text-[#E66A6A] hover:border-[#E66A6A]/40 transition-colors cursor-pointer"
              >
                Stand Down / Cancel Signal (Issue Resolved)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= DISTRESS TRIGGER & DISPATCH CONSOLE ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Incident Selector & Location (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Select Active Vehicle */}
            <div className="p-5 bg-[#101217] border border-[#24252E] rounded-2xl space-y-3">
              <label className="block text-xs font-mono-num font-bold uppercase tracking-wider text-[#C9A45C] flex items-center gap-2">
                <Car className="w-4 h-4 text-[#C9A45C]" />
                <span>1. Select Impacted Vehicle</span>
              </label>

              {allBookings.length > 0 ? (
                <select
                  value={selectedBookingId}
                  onChange={e => {
                    const id = e.target.value;
                    setSelectedBookingId(id);
                    const found = allBookings.find(b => b.id === id);
                    if (found) setSelectedVehicleName(found.vehicleName);
                  }}
                  className="w-full bg-[#161720] border border-[#2B2D38] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
                >
                  {allBookings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.vehicleName} (#{b.id}) — {b.pickupLocation} ({b.status})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-[#888888] bg-[#161720] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <span>Selected Vehicle: <strong>{selectedVehicleName}</strong> (Enthusiast Coupe)</span>
                  <span className="text-[10px] text-[#5ED39A]">Fleet Telemetry Active</span>
                </div>
              )}
            </div>

            {/* Step 2: Select Nature of Emergency */}
            <div className="p-5 bg-[#101217] border border-[#24252E] rounded-2xl space-y-3">
              <label className="block text-xs font-mono-num font-bold uppercase tracking-wider text-[#C9A45C] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#C9A45C]" />
                <span>2. Select Incident Classification</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {incidentOptions.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = incidentType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setIncidentType(opt.type)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#1C1814] border-[#C9A45C] text-white shadow-md'
                          : 'bg-[#14151C] border-[#22232B] text-[#999999] hover:border-[#383946] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#C9A45C]' : 'text-[#888888]'}`} />
                          <span className="text-xs font-bold text-white">{opt.label}</span>
                        </div>
                        <span className={`text-[9px] font-mono-num font-bold px-1.5 py-0.5 rounded ${
                          opt.priority === 'CRITICAL' || opt.priority === 'URGENT'
                            ? 'bg-[#E66A6A]/20 text-[#E66A6A]'
                            : 'bg-[#C9A45C]/20 text-[#C9A45C]'
                        }`}>
                          {opt.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#777777] leading-relaxed">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Exact Location & GPS Coordinates */}
            <div className="p-5 bg-[#101217] border border-[#24252E] rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono-num font-bold uppercase tracking-wider text-[#C9A45C] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C9A45C]" />
                  <span>3. Verified Roadside Location</span>
                </label>

                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="text-[11px] text-[#C9A45C] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Locating...' : 'Refresh GPS Coordinates'}</span>
                </button>
              </div>

              <input
                type="text"
                value={gpsLocation.address}
                onChange={e => setGpsLocation(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter current highway, kilometer stone, or nearest landmark"
                className="w-full bg-[#161720] border border-[#2B2D38] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
              />

              <div className="flex items-center justify-between text-[11px] font-mono-num text-[#888888] px-1">
                <span>Lat: {gpsLocation.lat}° N, Lng: {gpsLocation.lng}° E</span>
                <span className="text-[#5ED39A]">GPS Accuracy: ±{gpsLocation.accuracy}m</span>
              </div>
            </div>

            {/* Additional details */}
            <div className="p-5 bg-[#101217] border border-[#24252E] rounded-2xl space-y-2">
              <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider">
                Specific Condition / Hazards (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Left rear tire deflated after highway debris. Vehicle parked safely on outer paved shoulder with hazard lights on."
                className="w-full bg-[#161720] border border-[#2B2D38] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
              />
            </div>
          </div>

          {/* Right Column: High-Priority Trigger Cockpit (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* The Big Red/Gold Distress Signal Trigger */}
            <div className="p-6 md:p-8 bg-gradient-to-b from-[#180F0F] via-[#120B0B] to-[#0A0707] border border-[#E66A6A]/50 rounded-3xl shadow-2xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E66A6A] via-[#C9A45C] to-[#E66A6A]" />

              <div>
                <span className="text-[10px] font-mono-num uppercase tracking-widest text-[#E66A6A] font-bold block mb-1">
                  IMMEDIATE TELEMETRY LINK
                </span>
                <h4 className="text-2xl font-luxury font-bold text-white">
                  BROADCAST DISTRESS SIGNAL
                </h4>
                <p className="text-xs text-[#AAAAAA] mt-1">
                  Dispatches closest emergency recovery flatbed with replacement vehicle privilege.
                </p>
              </div>

              {/* Pulsing Trigger Button with Armed Countdown Safeguard */}
              <div className="py-4 flex flex-col items-center justify-center">
                {!isArmed ? (
                  <button
                    type="button"
                    onClick={handleArmTrigger}
                    className="relative group w-44 h-44 rounded-full bg-gradient-to-tr from-[#991B1B] via-[#DC2626] to-[#EF4444] border-4 border-[#FCA5A5]/40 shadow-2xl shadow-[#DC2626]/40 flex flex-col items-center justify-center text-white cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
                  >
                    <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-25" />
                    <Radio className="w-10 h-10 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-base font-luxury font-bold tracking-wider">
                      TRIGGER SOS
                    </span>
                    <span className="text-[10px] font-mono-num uppercase tracking-widest opacity-80 mt-0.5">
                      HOLD 3S OR TAP
                    </span>
                  </button>
                ) : (
                  <div className="w-44 h-44 rounded-full bg-[#180A0A] border-4 border-[#E66A6A] flex flex-col items-center justify-center text-white animate-pulse">
                    <span className="text-4xl font-luxury font-bold text-[#E66A6A] font-mono-num">
                      {countdown}
                    </span>
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider mt-1">
                      Broadcasting...
                    </span>
                    <button
                      type="button"
                      onClick={handleAbortArm}
                      className="mt-2 text-[10px] font-bold uppercase text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full cursor-pointer"
                    >
                      ABORT
                    </button>
                  </div>
                )}
              </div>

              {isArmed && (
                <div className="text-xs text-[#E66A6A] font-semibold animate-pulse">
                  Emergency beacon arming! Tap Abort if pressed by mistake.
                </div>
              )}

              {/* Instant Direct Trigger Override */}
              <button
                type="button"
                onClick={handleCommitDistressSignal}
                className="w-full py-3.5 px-4 bg-[#E66A6A] hover:bg-[#F87171] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#E66A6A]/30 cursor-pointer flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>Instant Distress Dispatch (No Wait)</span>
              </button>

              <div className="text-[11px] text-[#777777] italic leading-tight">
                * By triggering, Velox Central Command instantly receives your vehicle health diagnostic, tire pressures, and live telemetry coordinates.
              </div>
            </div>

            {/* Direct Connect Speed Dials */}
            <div className="p-6 bg-[#101217] border border-white/10 rounded-3xl space-y-4">
              <span className="text-xs font-mono-num font-bold uppercase tracking-wider text-[#C9A45C] block">
                DIRECT SPEED-DIAL CONNECTIONS
              </span>

              <div className="space-y-2.5">
                <a
                  href="tel:+918008356900"
                  className="flex items-center justify-between p-3.5 bg-[#171822] hover:bg-[#1F212D] border border-white/5 hover:border-[#C9A45C]/40 rounded-xl transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#C9A45C]/15 text-[#C9A45C]">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Velox 24/7 Priority Hotline</div>
                      <div className="text-[11px] text-[#888888]">Instant Dispatch & Roadside Assistance (One-Touch)</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#C9A45C]" />
                </a>

                <a
                  href="tel:112"
                  className="flex items-center justify-between p-3.5 bg-[#171822] hover:bg-[#1F212D] border border-white/5 hover:border-[#E66A6A]/40 rounded-xl transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#E66A6A]/15 text-[#E66A6A]">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">National Highway Police & SOS</div>
                      <div className="text-[11px] text-[#888888]">Speed Dial: 112</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#E66A6A]" />
                </a>

                <a
                  href="tel:108"
                  className="flex items-center justify-between p-3.5 bg-[#171822] hover:bg-[#1F212D] border border-white/5 hover:border-[#5ED39A]/40 rounded-xl transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#5ED39A]/15 text-[#5ED39A]">
                      <LifeBuoy className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Trauma & Paramedic Ambulance</div>
                      <div className="text-[11px] text-[#888888]">Speed Dial: 108</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#5ED39A]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
