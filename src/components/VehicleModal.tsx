import React, { useState, useEffect } from 'react';
import { X, Heart, Shield, Check, Star, Gauge, Users, Zap, Fuel, Calendar, Compass, ArrowRight, Award, Layers, Play, Camera, Video, Upload, Film, MessageSquare } from 'lucide-react';
import { Vehicle } from '../types';
import { StudioTurntable3DSpace } from './StudioTurntable3DSpace';
import { BlueprintVideoViewer } from './BlueprintVideoViewer';
import { openWhatsAppEnquiry, getUpcomingDateString } from '../utils/whatsapp';
import { persistMediaItem, retrieveMediaItem } from '../utils/persistentStorage';
import { INITIAL_VEHICLES } from '../data/vehicles';

interface VehicleModalProps {
  vehicle: Vehicle | null;
  currency: 'INR' | 'USD';
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (id: string) => void;
  onBookNow: (vehicle: Vehicle) => void;
  activeDates?: { pickup?: string; returnDate?: string; location?: string; };
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onUpdateImage?: (vehicleId: string, newImageUrl: string) => void;
  onUpdateVideo?: (vehicleId: string, newVideoUrl: string) => void;
}

type TabType = 'OVERVIEW' | 'SPECS' | 'FEATURES' | 'REQUIREMENTS' | 'REVIEWS';
type ViewerMode = 'PHOTO' | 'VIDEO' | 'TURNTABLE_VIDEO';

export const VehicleModal: React.FC<VehicleModalProps> = ({
  vehicle,
  currency,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onBookNow,
  activeDates,
  isAdmin = false,
  onOpenAdminLogin,
  onUpdateImage,
  onUpdateVideo
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [viewerMode, setViewerMode] = useState<ViewerMode>('PHOTO');
  const [selectedColorHex, setSelectedColorHex] = useState<string>(
    vehicle?.colors[0]?.hex || '#0E0F12'
  );

  // Photo modal admin upload state
  const [showPhotoUpload, setShowPhotoUpload] = useState<boolean>(false);
  const [customPhotoInput, setCustomPhotoInput] = useState<string>('');
  const [photoError, setPhotoError] = useState<boolean>(false);

  // Fallback high-res static photo
  const fallbackPhoto = vehicle
    ? (INITIAL_VEHICLES.find(iv => iv.id === vehicle.id)?.imageUrl ||
       (vehicle.imageUrl && !vehicle.imageUrl.startsWith('blob:') ? vehicle.imageUrl : '') ||
       'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80')
    : '';

  const imgKey = vehicle ? `velox_car_img_${vehicle.id}` : '';

  const [activePhotoUrl, setActivePhotoUrl] = useState<string>(() => {
    if (!vehicle) return '';
    if (typeof window !== 'undefined' && imgKey) {
      const stored = localStorage.getItem(imgKey);
      if (stored && !stored.startsWith('blob:')) return stored;
    }
    if (vehicle.imageUrl && !vehicle.imageUrl.startsWith('blob:')) {
      return vehicle.imageUrl;
    }
    return fallbackPhoto;
  });

  // Load persisted photo from IndexedDB on modal open
  useEffect(() => {
    if (!vehicle || !imgKey) return;
    let isMounted = true;
    retrieveMediaItem(imgKey).then(url => {
      if (isMounted && url) {
        setActivePhotoUrl(url);
        setPhotoError(false);
      }
    });
    return () => { isMounted = false; };
  }, [vehicle?.id, imgKey]);

  // Keep in sync with vehicle prop
  useEffect(() => {
    if (vehicle?.imageUrl && !vehicle.imageUrl.startsWith('blob:')) {
      setActivePhotoUrl(vehicle.imageUrl);
      setPhotoError(false);
    }
  }, [vehicle?.imageUrl]);

  if (!vehicle) return null;

  const currentPhotoUrl = (!photoError && activePhotoUrl) ? activePhotoUrl : fallbackPhoto;

  const formatPrice = (priceInr: number) => {
    if (currency === 'USD') {
      const usdPrice = Math.round(priceInr / 85);
      return `$${usdPrice.toLocaleString()}`;
    }
    return `₹${priceInr.toLocaleString('en-IN')}`;
  };

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (file) {
      const sessionUrl = URL.createObjectURL(file);
      setActivePhotoUrl(sessionUrl);
      setPhotoError(false);
      setShowPhotoUpload(false);
      if (onUpdateImage) onUpdateImage(vehicle.id, sessionUrl);
      try {
        await persistMediaItem(imgKey, file);
      } catch (err) {
        console.warn('Error saving photo:', err);
      }
    }
  };

  const handlePhotoUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (customPhotoInput.trim()) {
      const url = customPhotoInput.trim();
      setActivePhotoUrl(url);
      setPhotoError(false);
      setShowPhotoUpload(false);
      setCustomPhotoInput('');
      if (onUpdateImage) onUpdateImage(vehicle.id, url);
      try {
        await persistMediaItem(imgKey, url);
      } catch (err) {
        console.warn('Error saving photo url:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#0C0D10] border border-[#2A2A2D] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Close Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#08080A]">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-[#C9A45C] font-semibold">
              VELOX DRIVE · SHOWROOM SPECIFICATION
            </span>
            <span className="text-white/20">|</span>
            <span className="text-xs text-[#888888] font-mono-num">{vehicle.slug.toUpperCase()}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#999999] hover:text-white transition-colors cursor-pointer"
            aria-label="Close vehicle modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two column layout on desktop */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: 3D Vehicle Interactive Viewer (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Multi-Mode Showcase Selector: Photo, Real Car Video, 3D View Space */}
              <div className="flex items-center justify-between bg-[#111216] p-1.5 rounded-xl border border-white/10 overflow-x-auto">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoError(false);
                      setViewerMode('PHOTO');
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      viewerMode === 'PHOTO'
                        ? 'bg-[#C9A45C] text-[#050505] shadow-md shadow-[#C9A45C]/20 font-bold'
                        : 'text-[#999999] hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewerMode('VIDEO')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      viewerMode === 'VIDEO'
                        ? 'bg-[#C9A45C] text-[#050505] shadow-md shadow-[#C9A45C]/20 font-bold'
                        : 'text-[#999999] hover:text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Real Car Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewerMode('TURNTABLE_VIDEO')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      viewerMode === 'TURNTABLE_VIDEO'
                        ? 'bg-[#C9A45C] text-[#050505] shadow-md shadow-[#C9A45C]/20 font-bold'
                        : 'text-[#999999] hover:text-white'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>3D View Space</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono-num text-[#5ED39A] hidden sm:inline px-2 whitespace-nowrap">
                  {viewerMode === 'PHOTO'
                    ? 'High-Res Photo'
                    : viewerMode === 'VIDEO'
                    ? 'Pure Video Player'
                    : '3D Studio Space'}
                </span>
              </div>

              {/* Active Space Viewer */}
              {viewerMode === 'PHOTO' ? (
                <div className="relative w-full h-[380px] md:h-[480px] rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center group select-none">
                  {/* Vehicle Image */}
                  <img
                    src={currentPhotoUrl}
                    alt={vehicle.name}
                    referrerPolicy="no-referrer"
                    loading="eager"
                    decoding="async"
                    onError={() => {
                      if (!photoError && currentPhotoUrl !== fallbackPhoto) {
                        setPhotoError(true);
                        setActivePhotoUrl(fallbackPhoto);
                      }
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Left Badge */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-mono-num font-bold text-white uppercase tracking-wider">
                      {vehicle.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-num uppercase tracking-wider bg-[#C9A45C]/20 text-[#DFBD78] border border-[#C9A45C]/40">
                      Showroom Still
                    </span>
                  </div>

                  {/* Top Right Admin Photo Upload Button */}
                  {isAdmin && (
                    <div className="absolute top-4 right-4 z-20">
                      <button
                        type="button"
                        onClick={() => setShowPhotoUpload(prev => !prev)}
                        className="px-2.5 py-1 rounded-md bg-[#C9A45C]/20 hover:bg-[#C9A45C]/30 backdrop-blur-md border border-[#C9A45C]/60 text-[#DFBD78] hover:text-white text-[11px] font-mono-num font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#C9A45C]" />
                        <span>Change Photo</span>
                      </button>
                    </div>
                  )}

                  {/* Admin Photo Upload Drawer */}
                  {isAdmin && showPhotoUpload && (
                    <div
                      onClick={e => e.stopPropagation()}
                      className="absolute inset-x-4 top-4 z-30 p-4 bg-[#0D0E13]/95 backdrop-blur-xl border border-[#C9A45C]/50 rounded-xl shadow-2xl animate-in fade-in"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono-num font-bold text-[#C9A45C] uppercase tracking-wider">
                          Admin: Update {vehicle.name} Photo
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPhotoUpload(false)}
                          className="text-xs text-white/50 hover:text-white cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-dashed border-[#C9A45C]/50 bg-white/5 hover:bg-white/10 text-xs text-white cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5 text-[#C9A45C]" />
                          <span>Choose New Image File (JPG/PNG)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoFileUpload}
                            className="hidden"
                          />
                        </label>

                        <form onSubmit={handlePhotoUrlSubmit} className="flex items-center gap-1.5">
                          <input
                            type="url"
                            value={customPhotoInput}
                            onChange={e => setCustomPhotoInput(e.target.value)}
                            placeholder="Or paste car picture URL..."
                            className="flex-1 bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
                          />
                          <button
                            type="submit"
                            className="py-1.5 px-3 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Save
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Bottom Specs and Color Swatches */}
                  <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2 p-1.5 px-3 rounded-lg backdrop-blur-md border border-white/10 bg-black/80 text-xs font-mono-num text-[#CCCCCC]">
                      <span className="font-bold text-white">{vehicle.horsepower} HP</span>
                      <span className="text-white/20">|</span>
                      <span>0-100: {vehicle.acceleration0To100}s</span>
                      <span className="text-white/20">|</span>
                      <span>{vehicle.topSpeed} KM/H</span>
                    </div>

                    <div className="pointer-events-auto flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                      {vehicle.colors.map(col => (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => setSelectedColorHex(col.hex)}
                          className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                            selectedColorHex === col.hex ? 'scale-125 ring-2 ring-[#C9A45C]' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : viewerMode === 'VIDEO' ? (
                <BlueprintVideoViewer
                  vehicle={vehicle}
                  compact={false}
                  onBookNow={onBookNow}
                  isAdmin={isAdmin}
                  onOpenAdminLogin={onOpenAdminLogin}
                  onUpdateVideo={newVid => {
                    if (onUpdateVideo) onUpdateVideo(vehicle.id, newVid);
                  }}
                />
              ) : (
                <StudioTurntable3DSpace
                  vehicle={vehicle}
                  onBookNow={onBookNow}
                />
              )}

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-[#111215] border border-white/5 rounded-xl text-center">
                <div className="flex flex-col items-center">
                  <Shield className="w-4 h-4 text-[#C9A45C] mb-1" />
                  <span className="text-xs font-semibold text-white">100% Insured</span>
                  <span className="text-[10px] text-[#777777]">Zero-dep policy</span>
                </div>
                <div className="flex flex-col items-center">
                  <Award className="w-4 h-4 text-[#C9A45C] mb-1" />
                  <span className="text-xs font-semibold text-white">Concierge Delivery</span>
                  <span className="text-[10px] text-[#777777]">Airport or Doorstep</span>
                </div>
                <div className="flex flex-col items-center">
                  <Zap className="w-4 h-4 text-[#C9A45C] mb-1" />
                  <span className="text-xs font-semibold text-white">Full Tank Guaranteed</span>
                  <span className="text-[10px] text-[#777777]">Premium 98 Octane</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Vehicle Details & Booking CTA (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Category & Status */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#C9A45C]">
                    {vehicle.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${vehicle.available ? 'bg-[#5ED39A]' : 'bg-[#E66A6A]'}`} />
                    <span className="text-xs font-medium text-[#AAAAAA]">
                      {vehicle.available ? 'Ready for Handover' : 'Reserved'}
                    </span>
                  </div>
                </div>

                {/* Vehicle Name & Tagline */}
                <h2 className="text-3xl md:text-4xl font-luxury text-white mb-2">
                  {vehicle.name}
                </h2>
                <p className="text-sm text-[#888888] leading-relaxed mb-6">
                  {vehicle.tagline}
                </p>

                {/* Pricing Banner */}
                <div className="p-5 bg-gradient-to-r from-[#17181D] to-[#121316] border border-[#2B2D33] rounded-xl mb-6 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-luxury font-bold text-white tracking-tight">
                      {formatPrice(vehicle.dailyPrice)}
                    </span>
                    <span className="text-xs text-[#888888] ml-1.5">/ 24-hour day</span>
                    <div className="text-[11px] text-[#777777] mt-1">
                      Weekend rate: {formatPrice(vehicle.weekendPrice)} · Security deposit: {formatPrice(vehicle.securityDeposit)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#5ED39A] font-medium bg-[#5ED39A]/10 px-2.5 py-1 rounded-md">
                      Instant Booking
                    </span>
                  </div>
                </div>

                {/* Primary Specs Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-[#131417] border border-white/5 rounded-lg flex items-center gap-3">
                    <Users className="w-4 h-4 text-[#C9A45C]" />
                    <div>
                      <div className="text-[10px] text-[#777777] uppercase">Capacity</div>
                      <div className="text-xs font-semibold text-white">{vehicle.seats} Seats</div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#131417] border border-white/5 rounded-lg flex items-center gap-3">
                    <Gauge className="w-4 h-4 text-[#C9A45C]" />
                    <div>
                      <div className="text-[10px] text-[#777777] uppercase">Power</div>
                      <div className="text-xs font-semibold text-white">{vehicle.horsepower} Horsepower</div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#131417] border border-white/5 rounded-lg flex items-center gap-3">
                    <Zap className="w-4 h-4 text-[#C9A45C]" />
                    <div>
                      <div className="text-[10px] text-[#777777] uppercase">0–100 km/h</div>
                      <div className="text-xs font-semibold text-white">{vehicle.acceleration0To100} seconds</div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#131417] border border-white/5 rounded-lg flex items-center gap-3">
                    <Compass className="w-4 h-4 text-[#C9A45C]" />
                    <div>
                      <div className="text-[10px] text-[#777777] uppercase">Drivetrain</div>
                      <div className="text-xs font-semibold text-white">{vehicle.drivetrain}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onBookNow(vehicle)}
                    className="flex-1 py-3.5 px-6 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-semibold text-sm tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-[#C9A45C]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Book This Car</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onToggleWishlist(vehicle.id)}
                    className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
                      isWishlisted
                        ? 'bg-[#C9A45C]/15 border-[#C9A45C] text-[#C9A45C]'
                        : 'bg-white/5 border-white/10 text-[#999999] hover:text-white'
                    }`}
                    aria-label="Wishlist toggle"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#C9A45C]' : ''}`} />
                  </button>
                </div>

                {/* Direct WhatsApp VIP Enquiry Button */}
                <button
                  type="button"
                  onClick={() => openWhatsAppEnquiry({
                    vehicleName: vehicle.name,
                    category: vehicle.category,
                    dailyPrice: vehicle.dailyPrice,
                    pickupDate: activeDates?.pickup || getUpcomingDateString(1),
                    returnDate: activeDates?.returnDate || getUpcomingDateString(3),
                    pickupLocation: activeDates?.location || 'Bangalore VIP Hub',
                    currency,
                    enquiryType: 'FULL_ENQUIRY'
                  })}
                  className="w-full py-3 px-4 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 hover:border-emerald-500 text-emerald-200 hover:text-white font-mono-num font-semibold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950/30"
                  title="Direct enquiry to VIP Concierge on WhatsApp"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Full Enquiry on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Tabs: Overview, Specs, Features, Requirements, Reviews */}
          <div className="mt-10 border-t border-white/10 pt-6">
            <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-3 mb-6">
              {[
                { id: 'OVERVIEW', label: 'Overview' },
                { id: 'SPECS', label: 'Detailed Specifications' },
                { id: 'FEATURES', label: 'Features & Audio' },
                { id: 'REQUIREMENTS', label: 'Rental Requirements' },
                { id: 'REVIEWS', label: `Verified Reviews (${vehicle.reviewsCount})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#18191E] text-[#C9A45C] border border-[#C9A45C]/30'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'OVERVIEW' && (
              <div className="text-sm text-[#CCCCCC] leading-relaxed max-w-4xl space-y-4">
                <p>{vehicle.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-[#111215] rounded-xl border border-white/5">
                    <h4 className="text-xs uppercase font-semibold text-[#C9A45C] mb-2 tracking-wider">
                      Included with Every Booking
                    </h4>
                    <ul className="text-xs text-[#999999] space-y-1.5">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#5ED39A]" /> 250 kilometers complimentary daily mileage
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#5ED39A]" /> 24/7 dedicated Velox Concierge road assistance
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#5ED39A]" /> Professional interior sanitation & full fuel tank
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-[#111215] rounded-xl border border-white/5">
                    <h4 className="text-xs uppercase font-semibold text-[#C9A45C] mb-2 tracking-wider">
                      Booking Confirmation & Deposit Policy
                    </h4>
                    <p className="text-xs text-[#999999] leading-relaxed">
                      Booking is confirmed only after the first deposit payment (20% advance booking deposit or 100% full settlement) is authorized. Dates and car availability remain tentative until the initial deposit is received. Full cancellation refund available up to 24 hours prior to handover.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Specs */}
            {activeTab === 'SPECS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Powertrain', value: vehicle.fuel },
                  { label: 'Transmission', value: vehicle.transmission },
                  { label: 'Horsepower', value: `${vehicle.horsepower} HP` },
                  { label: 'Acceleration', value: `0–100 km/h in ${vehicle.acceleration0To100}s` },
                  { label: 'Top Speed', value: `${vehicle.topSpeed} km/h` },
                  { label: 'Drivetrain', value: vehicle.drivetrain },
                  { label: 'Seating Capacity', value: `${vehicle.seats} Passengers` },
                  { label: 'Fuel Category', value: 'High Octane 98 RON' },
                  { label: 'Security Deposit', value: formatPrice(vehicle.securityDeposit) }
                ].map(spec => (
                  <div key={spec.label} className="p-3.5 bg-[#111215] rounded-lg border border-white/5 flex items-center justify-between">
                    <span className="text-xs text-[#777777]">{spec.label}</span>
                    <span className="text-xs font-semibold text-white font-mono-num">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Features */}
            {activeTab === 'FEATURES' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vehicle.features.map(f => (
                  <div key={f} className="flex items-center gap-3 p-3 bg-[#111215] rounded-lg border border-white/5 text-xs text-[#DDDDDD]">
                    <Check className="w-4 h-4 text-[#C9A45C] shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Requirements */}
            {activeTab === 'REQUIREMENTS' && (
              <div className="max-w-2xl space-y-3">
                {vehicle.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 bg-[#111215] rounded-lg border border-white/5 text-xs text-[#CCCCCC]">
                    <Shield className="w-4 h-4 text-[#C9A45C] shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 5: Reviews */}
            {activeTab === 'REVIEWS' && (
              <div className="space-y-4 max-w-3xl">
                {vehicle.reviews.map(rev => (
                  <div key={rev.id} className="p-4 bg-[#111215] rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{rev.author}</span>
                        <span className="text-[10px] text-[#777777]">({rev.location})</span>
                        {rev.verifiedBooking && (
                          <span className="text-[10px] bg-[#5ED39A]/10 text-[#5ED39A] px-2 py-0.5 rounded-full font-medium">
                            Verified Booking
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[#C9A45C]">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#C9A45C]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#AAAAAA] leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-[#666666] block mt-2">{rev.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
