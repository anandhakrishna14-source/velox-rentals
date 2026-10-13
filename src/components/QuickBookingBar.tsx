import React, { useState } from 'react';
import { MapPin, Calendar, Users, Car, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { LocationOption, DriverOption } from '../types';
import { openWhatsAppEnquiry } from '../utils/whatsapp';

interface QuickBookingBarProps {
  locations: LocationOption[];
  onFindCars: (params: {
    pickupLocId: string;
    dropoffLocId: string;
    pickupDate: string;
    returnDate: string;
    driverOption: DriverOption;
  }) => void;
  availableCount: number;
  totalCount: number;
}

export const QuickBookingBar: React.FC<QuickBookingBarProps> = ({
  locations,
  onFindCars,
  availableCount,
  totalCount
}) => {
  const [pickupLocId, setPickupLocId] = useState<string>(locations[0]?.id || 'loc-blr-airport');
  const [dropoffLocId, setDropoffLocId] = useState<string>('same');
  
  // Date defaults: tomorrow to +3 days
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const returnD = new Date();
  returnD.setDate(returnD.getDate() + 4);

  const [pickupDate, setPickupDate] = useState<string>(tomorrow.toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState<string>(returnD.toISOString().split('T')[0]);
  const [driverOption, setDriverOption] = useState<DriverOption>('SELF_DRIVE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFindCars({
      pickupLocId,
      dropoffLocId: dropoffLocId === 'same' ? pickupLocId : dropoffLocId,
      pickupDate,
      returnDate,
      driverOption
    });
  };

  return (
    <div className="relative z-30 max-w-7xl mx-auto px-6 -mt-10 mb-8">
      {/* Container */}
      <div className="bg-[#0D0E12] border border-[#2B2D35] rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          {/* 1. Pickup Location */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#C9A45C] mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>PICKUP</span>
            </label>
            <select
              value={pickupLocId}
              onChange={e => setPickupLocId(e.target.value)}
              className="w-full bg-[#15161C] border border-[#282932] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A45C] transition-colors truncate"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name.split('(')[0] || loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Drop-off Location */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#C9A45C] mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>DROP-OFF</span>
            </label>
            <select
              value={dropoffLocId}
              onChange={e => setDropoffLocId(e.target.value)}
              className="w-full bg-[#15161C] border border-[#282932] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A45C] transition-colors truncate"
            >
              <option value="same">Same as pickup ▾</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name.split('(')[0] || loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Dates */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#C9A45C] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>DATES</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="date"
                value={pickupDate}
                onChange={e => setPickupDate(e.target.value)}
                className="w-full bg-[#15161C] border border-[#282932] rounded-xl px-2 py-2 text-[11px] text-white focus:outline-none focus:border-[#C9A45C]"
              />
              <input
                type="date"
                value={returnDate}
                onChange={e => setReturnDate(e.target.value)}
                className="w-full bg-[#15161C] border border-[#282932] rounded-xl px-2 py-2 text-[11px] text-white focus:outline-none focus:border-[#C9A45C]"
              />
            </div>
          </div>

          {/* 4. Driver Option */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#C9A45C] mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>DRIVER</span>
            </label>
            <select
              value={driverOption}
              onChange={e => setDriverOption(e.target.value as DriverOption)}
              className="w-full bg-[#15161C] border border-[#282932] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A45C] transition-colors"
            >
              <option value="SELF_DRIVE">Self Drive (Verified) ▾</option>
              <option value="WITH_DRIVER">With VIP Chauffeur ▾</option>
            </select>
          </div>

          {/* 5. CTA Button & WhatsApp Direct Enquiry */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-3 px-3.5 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#C9A45C]/25 flex items-center justify-center gap-1.5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>FIND CARS</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => openWhatsAppEnquiry({
                vehicleName: 'Velox Luxury Fleet Reservation',
                pickupDate,
                returnDate,
                pickupLocation: locations.find(l => l.id === pickupLocId)?.name || 'Bangalore VIP Hub',
                dropoffLocation: dropoffLocId === 'same'
                  ? locations.find(l => l.id === pickupLocId)?.name
                  : locations.find(l => l.id === dropoffLocId)?.name,
                driverOption,
                enquiryType: 'FULL_ENQUIRY'
              })}
              className="py-3 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Full WhatsApp Enquiry with Selected Dates"
            >
              <MessageSquare className="w-4 h-4 fill-black text-transparent" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </form>

        {/* Real-Time Availability Ticker */}
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-[#888888]">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5ED39A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5ED39A]"></span>
            </span>
            <span className="text-[#DDDDDD] font-medium">
              <strong className="text-white font-mono-num">{availableCount} cars</strong> available for your dates
            </span>
            <span className="text-[#555555]">|</span>
            <span className="text-[11px] text-[#C9A45C] font-medium">
              Booking confirmed only after first deposit payment
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#C9A45C]">
            <span className="hidden md:inline">✓ Transparent Security Deposit</span>
            <span className="hidden sm:inline">✓ Free 24h Cancellation</span>
            <span>✓ 100% Insured</span>
          </div>
        </div>
      </div>
    </div>
  );
};
