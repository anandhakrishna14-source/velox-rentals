import React, { useState } from 'react';
import { Heart, Users, Gauge, Fuel, Zap, ArrowRight, ShieldCheck, Check, Star, Scale, AlertCircle, LayoutGrid, MessageSquare } from 'lucide-react';
import { Vehicle } from '../types';
import { VehicleVisualCard } from './VehicleVisualCard';
import { openWhatsAppEnquiry, getUpcomingDateString } from '../utils/whatsapp';

interface FleetSectionProps {
  vehicles: Vehicle[];
  currency: 'INR' | 'USD';
  wishlist: string[];
  selectedCompareIds: string[];
  onToggleWishlist: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onOpenCompare: () => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onBookVehicle: (vehicle: Vehicle) => void;
  onUpdateVehicle?: (vehicle: Vehicle) => void;
  filterDates?: { pickup: string; returnDate: string; location: string };
}

export const FleetSection: React.FC<FleetSectionProps> = ({
  vehicles,
  currency,
  wishlist,
  selectedCompareIds,
  onToggleWishlist,
  onToggleCompare,
  onOpenCompare,
  onSelectVehicle,
  onBookVehicle,
  onUpdateVehicle,
  filterDates
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [hoveredCarId, setHoveredCarId] = useState<string | null>(null);

  const categories = ['ALL', 'Sports', 'Performance', 'Luxury', 'Comfort', 'Luxury SUV'];

  const filteredVehicles = vehicles.filter(v => {
    if (selectedCategory === 'ALL') return true;
    return v.category === selectedCategory;
  });

  const availableCars = filteredVehicles.filter(v => v.available);
  const unavailableCars = filteredVehicles.filter(v => !v.available);

  const formatPrice = (priceInr: number) => {
    if (currency === 'USD') {
      const usdPrice = Math.round(priceInr / 85);
      return `$${usdPrice.toLocaleString()}`;
    }
    return `₹${priceInr.toLocaleString('en-IN')}`;
  };

  const renderCard = (vehicle: Vehicle, isAvailable: boolean) => {
    const isHovered = hoveredCarId === vehicle.id;
    const isWishlisted = wishlist.includes(vehicle.id);
    const isCompared = selectedCompareIds.includes(vehicle.id);

    return (
      <div
        key={vehicle.id}
        onMouseEnter={() => setHoveredCarId(vehicle.id)}
        onMouseLeave={() => setHoveredCarId(null)}
        className={`relative bg-[#0E0F12] border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col group ${
          !isAvailable ? 'opacity-85' : ''
        } ${
          isHovered
            ? 'border-[#C9A45C] shadow-xl shadow-[#C9A45C]/10 -translate-y-1.5'
            : 'border-[#222225] hover:border-[#38383F]'
        }`}
      >
        {/* Visual Area */}
        <div className="relative">
          <VehicleVisualCard
            vehicle={vehicle}
            isHovered={isHovered}
            onUpdateImage={(vId, newImg) => {
              const updated = { ...vehicle, imageUrl: newImg };
              if (onUpdateVehicle) onUpdateVehicle(updated);
            }}
            onUpdateVideo={(vId, newVid) => {
              const updated = { ...vehicle, videoUrl: newVid };
              if (onUpdateVehicle) onUpdateVehicle(updated);
            }}
          />

          {/* Top Overlay: Category & Actions (Left Aligned) */}
          <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 pointer-events-auto">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C9A45C] bg-[#050505]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {vehicle.category}
            </span>

            {/* Compare Checkbox */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onToggleCompare(vehicle.id);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md border text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                isCompared
                  ? 'bg-[#C9A45C] text-[#050505] border-[#C9A45C]'
                  : 'bg-[#050505]/80 text-[#888888] border-white/10 hover:text-white'
              }`}
              title={isCompared ? 'Remove from comparison' : 'Compare this car'}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>

            {/* Wishlist button */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onToggleWishlist(vehicle.id);
              }}
              className="p-1.5 rounded-full bg-[#050505]/80 backdrop-blur-md border border-white/10 text-[#999999] hover:text-[#C9A45C] transition-colors cursor-pointer"
              aria-label="Add to wishlist"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isWishlisted ? 'fill-[#C9A45C] text-[#C9A45C]' : ''
                }`}
              />
            </button>
          </div>

          {/* Availability Status Badge */}
          <div className="absolute bottom-3 left-4 flex items-center gap-1.5 z-20 pointer-events-none">
            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-[#5ED39A]' : 'bg-[#E66A6A]'}`} />
            <span className="text-[11px] text-[#DDDDDD] font-medium drop-shadow">
              {isAvailable ? 'Available Now' : 'Reserved for Selected Dates'}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-xl md:text-2xl font-luxury text-white group-hover:text-[#C9A45C] transition-colors">
                {vehicle.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-[#C9A45C] font-mono-num font-medium">
                <Star className="w-3.5 h-3.5 fill-[#C9A45C]" />
                <span>{vehicle.rating}</span>
              </div>
            </div>

            <p className="text-xs text-[#888888] line-clamp-1 mb-4">
              {vehicle.tagline}
            </p>

            {/* Specifications */}
            <div className="grid grid-cols-4 gap-2 py-3 border-t border-b border-white/5 mb-5 text-center">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#777777] uppercase tracking-wider mb-0.5">Seats</span>
                <span className="text-xs font-semibold text-[#EEEEEE] font-mono-num">{vehicle.seats}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#777777] uppercase tracking-wider mb-0.5">Power</span>
                <span className="text-xs font-semibold text-[#EEEEEE] font-mono-num">{vehicle.horsepower} HP</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#777777] uppercase tracking-wider mb-0.5">0-100</span>
                <span className="text-xs font-semibold text-[#EEEEEE] font-mono-num">{vehicle.acceleration0To100}s</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-[#777777] uppercase tracking-wider mb-0.5">Gear</span>
                <span className="text-xs font-semibold text-[#EEEEEE] truncate w-full">Auto</span>
              </div>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span className="text-2xl font-luxury font-bold text-white tracking-tight">
                  {formatPrice(vehicle.dailyPrice)}
                </span>
                <span className="text-xs text-[#777777] ml-1">/ day</span>
              </div>
              <span className="text-[11px] text-[#C9A45C] font-medium">
                Deposit: {formatPrice(vehicle.securityDeposit)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onSelectVehicle(vehicle)}
                className="py-2.5 px-3 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-lg text-[#DDDDDD] hover:text-[#C9A45C] border border-white/10 hover:border-[#C9A45C]/40 transition-all cursor-pointer text-center"
              >
                3D VIEW SPACE
              </button>

              {isAvailable ? (
                <button
                  type="button"
                  onClick={() => onBookVehicle(vehicle)}
                  className="py-2.5 px-3 bg-[#C9A45C] hover:bg-[#DFBD78] text-xs font-semibold rounded-lg text-[#050505] transition-all cursor-pointer text-center shadow-md shadow-[#C9A45C]/20 flex items-center justify-center gap-1.5 group/btn"
                >
                  <span>BOOK NOW</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onBookVehicle(vehicle)}
                  className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg text-[#CCCCCC] transition-all cursor-pointer text-center"
                >
                  PRE-BOOK NEXT
                </button>
              )}
            </div>

            {/* Direct WhatsApp VIP Enquiry Button - No phone number shown on button */}
            <button
              type="button"
              onClick={() => openWhatsAppEnquiry({
                vehicleName: vehicle.name,
                category: vehicle.category,
                dailyPrice: vehicle.dailyPrice,
                pickupDate: filterDates?.pickup || getUpcomingDateString(1),
                returnDate: filterDates?.returnDate || getUpcomingDateString(3),
                pickupLocation: filterDates?.location || 'Bangalore VIP Hub',
                currency,
                enquiryType: 'FULL_ENQUIRY'
              })}
              className="mt-2.5 w-full py-2 px-3 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 hover:text-white text-xs font-mono-num rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              title="Direct VIP WhatsApp enquiry"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Enquiry via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="fleet-section" className="relative py-24 bg-[#050505] text-[#F5F5F5]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#C9A45C]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-[#C9A45C] font-semibold uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A45C]" />
              The Velox Collection
            </div>
            <h2 className="text-3xl md:text-5xl font-luxury text-white">
              CHOOSE YOUR DRIVE
            </h2>
            <p className="text-sm md:text-base text-[#999999] mt-2 max-w-xl">
              From weekend escapes to unforgettable nights. Hand-inspected, showroom-conditioned performance and grand touring vehicles.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0D0D0E] p-1.5 rounded-xl border border-[#222222]">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-[#999999] hover:text-white hover:bg-white/5'
                }`}
              >
                {cat === 'ALL' ? 'All Fleet' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Availability Status Header (Item 2) */}
        {filterDates && (
          <div className="mb-8 p-4 bg-[#0F1014] border border-[#2A2B33] rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#5ED39A] animate-ping" />
              <div className="text-xs">
                <span className="text-white font-bold text-sm block">
                  {availableCars.length} of {filteredVehicles.length} vehicles available for your dates
                </span>
                <span className="text-[#888888]">
                  Schedule: {filterDates.pickup} to {filterDates.returnDate} · Handover: {filterDates.location}
                </span>
              </div>
            </div>

            {selectedCompareIds.length > 0 && (
              <button
                type="button"
                onClick={onOpenCompare}
                className="py-2 px-4 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>Compare {selectedCompareIds.length} Vehicles</span>
              </button>
            )}
          </div>
        )}

        {/* Group 1: AVAILABLE NOW */}
        {availableCars.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5ED39A]" />
              <h3 className="text-lg font-luxury font-bold text-white tracking-wider uppercase">
                AVAILABLE NOW ({availableCars.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableCars.map(car => renderCard(car, true))}
            </div>
          </div>
        )}

        {/* Group 2: UNAVAILABLE FOR SELECTED DATES */}
        {unavailableCars.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6 pt-6 border-t border-white/5">
              <AlertCircle className="w-4 h-4 text-[#E66A6A]" />
              <h3 className="text-lg font-luxury font-bold text-[#AAAAAA] tracking-wider uppercase">
                RESERVED FOR SELECTED DATES ({unavailableCars.length})
              </h3>
              <span className="text-xs text-[#777777] ml-2">
                (Available on alternate dates or next week)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {unavailableCars.map(car => renderCard(car, false))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Compare Button when items are selected */}
      {selectedCompareIds.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4">
          <button
            type="button"
            onClick={onOpenCompare}
            className="py-3 px-5 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs uppercase tracking-wider rounded-full shadow-2xl shadow-[#C9A45C]/40 flex items-center gap-2 cursor-pointer transform hover:scale-105 transition-all"
          >
            <Scale className="w-4 h-4" />
            <span>Compare Vehicles ({selectedCompareIds.length})</span>
          </button>
        </div>
      )}
    </section>
  );
};
