import React, { useState } from 'react';
import { X, QrCode, Phone, MessageSquare, Download, MapPin, Calendar, Clock, ShieldCheck, Car, Share2, AlertCircle } from 'lucide-react';
import { Booking } from '../types';

interface DigitalRentalPassModalProps {
  booking: Booking | null;
  onClose: () => void;
  onViewVehicle?: () => void;
}

export const DigitalRentalPassModal: React.FC<DigitalRentalPassModalProps> = ({
  booking,
  onClose,
  onViewVehicle
}) => {
  if (!booking) return null;

  const [activeTab, setActiveTab] = useState<'PASS' | 'CHAUFFEUR' | 'INSPECTION'>('PASS');
  const [copied, setCopied] = useState<boolean>(false);
  const [contactNotification, setContactNotification] = useState<string | null>(null);

  const isChauffeur = booking.driverOption === 'WITH_DRIVER';
  const isPendingDeposit = booking.status === 'PAYMENT_PENDING';

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `Velox Drive VIP Rental Pass: ${booking.vehicleName} (Ref: ${booking.id}) - Pickup at ${booking.pickupLocation} on ${booking.pickupDate}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0C0D11] border border-[#2B2D35] rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Pass Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#08080A]">
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${isPendingDeposit ? 'bg-amber-400 animate-ping' : 'bg-[#5ED39A] animate-pulse'}`} />
            <span className="text-xs uppercase tracking-widest text-[#C9A45C] font-semibold">
              {isPendingDeposit ? 'VELOX DRIVE · TENTATIVE PASS (AWAITING DEPOSIT)' : 'VELOX DRIVE · VIP DIGITAL PASS'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#888888] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Boarding Pass Card Structure */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="relative bg-gradient-to-b from-[#15161C] to-[#0E0F14] border border-[#2C2E38] rounded-2xl p-6 shadow-xl text-left overflow-hidden">
            {/* Top gold bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#997635] via-[#C9A45C] to-[#E9D59E]" />

            {/* Pass Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-mono-num uppercase tracking-widest text-[#888888]">
                  OFFICIAL HANDOVER PASS
                </span>
                <h3 className="text-2xl font-luxury font-bold text-white mt-0.5">
                  VELOX DRIVE
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono-num text-[#888888] block">BOOKING REF</span>
                <span className={`text-sm font-mono-num font-bold px-2 py-0.5 rounded ${
                  isPendingDeposit ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30' : 'text-[#C9A45C] bg-[#C9A45C]/10'
                }`}>
                  #{booking.id}
                </span>
              </div>
            </div>

            {/* Vehicle Block */}
            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-wider text-[#888888]">RESERVED VEHICLE</span>
              <div className="text-xl font-luxury font-bold text-white flex items-center justify-between">
                <span>{booking.vehicleName}</span>
                <span className="text-xs font-mono-num text-[#C9A45C]">{booking.vehicleCategory}</span>
              </div>
              <div className="text-[11px] text-[#777777] mt-0.5">
                Full Tank · 150-Point Pre-Delivery Inspection Cleared
              </div>
            </div>

            {/* Deposit Policy Notice for Pending Reservations */}
            {isPendingDeposit && (
              <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-center gap-2 mb-4 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-amber-200 text-[11px] leading-tight">
                  <strong>Tentative Pass:</strong> Booking confirmed only after first deposit payment is received.
                </span>
              </div>
            )}

            {/* Route / Schedule Boarding Grid */}
            <div className="p-3.5 bg-[#090A0D] rounded-xl border border-white/5 space-y-3 mb-5 font-mono-num text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#666666] block">PICKUP SCHEDULE</span>
                  <span className="text-white font-semibold">{booking.pickupDate} · {booking.pickupTime}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#666666] block">RETURN SCHEDULE</span>
                  <span className="text-white font-semibold">{booking.returnDate} · {booking.returnTime}</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#666666] block">LOCATION</span>
                  <span className="text-white truncate max-w-[200px] block">{booking.pickupLocation}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#666666] block">MODE</span>
                  <span className="text-[#5ED39A] font-semibold">
                    {booking.driverOption === 'WITH_DRIVER' ? 'CHAUFFEURED' : 'SELF DRIVE'}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code & Barcode Section */}
            <div className="flex items-center justify-between pt-2 border-t border-dashed border-white/15">
              <div className="space-y-1">
                <span className="text-[10px] font-mono-num text-[#777777] uppercase block">
                  SHOW TO VALET / AIRPORT CONCIERGE
                </span>
                <div className="text-xs text-[#DDDDDD] font-mono-num font-semibold">
                  SECURITY CODE: <span className="text-[#C9A45C]">{isPendingDeposit ? 'PENDING DEPOSIT' : `#VX-${booking.id.slice(-4)}`}</span>
                </div>
                <div className={`text-[10px] flex items-center gap-1 ${isPendingDeposit ? 'text-amber-400' : 'text-[#5ED39A]'}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isPendingDeposit ? 'Deposit Pending Verification' : 'Identity Verified ✓'}</span>
                </div>
              </div>

              {/* Vector Simulated QR Code */}
              <div className="p-2 bg-white rounded-lg shadow-md shrink-0">
                <svg viewBox="0 0 100 100" className="w-16 h-16">
                  <rect x="5" y="5" width="28" height="28" fill="#000" />
                  <rect x="9" y="9" width="20" height="20" fill="#fff" />
                  <rect x="13" y="13" width="12" height="12" fill="#000" />

                  <rect x="67" y="5" width="28" height="28" fill="#000" />
                  <rect x="71" y="9" width="20" height="20" fill="#fff" />
                  <rect x="75" y="13" width="12" height="12" fill="#000" />

                  <rect x="5" y="67" width="28" height="28" fill="#000" />
                  <rect x="9" y="71" width="20" height="20" fill="#fff" />
                  <rect x="13" y="75" width="12" height="12" fill="#000" />

                  <rect x="38" y="8" width="6" height="6" fill="#000" />
                  <rect x="48" y="8" width="12" height="6" fill="#000" />
                  <rect x="38" y="20" width="18" height="6" fill="#000" />
                  <rect x="40" y="38" width="20" height="20" fill="#000" />
                  <rect x="45" y="45" width="10" height="10" fill="#fff" />
                  <rect x="10" y="42" width="18" height="6" fill="#000" />
                  <rect x="70" y="42" width="22" height="8" fill="#000" />
                  <rect x="38" y="68" width="10" height="14" fill="#000" />
                  <rect x="54" y="72" width="16" height="6" fill="#000" />
                  <rect x="75" y="68" width="18" height="18" fill="#000" />
                </svg>
              </div>
            </div>
          </div>

          {contactNotification && (
            <div className="p-3 bg-[#C9A45C]/15 border border-[#C9A45C]/40 text-[#C9A45C] text-xs rounded-xl text-center font-medium animate-fadeIn">
              {contactNotification}
            </div>
          )}

          {/* Section 8: YOUR PICKUP Spec Box */}
          <div className="p-4 bg-[#111217] border border-[#2A2B33] rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A45C]">
                YOUR PICKUP
              </span>
              <span className={`text-[11px] font-mono-num px-2 py-0.5 rounded ${
                isPendingDeposit ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30' : 'text-[#5ED39A] bg-[#5ED39A]/10'
              }`}>
                {isPendingDeposit ? 'Awaiting First Deposit' : 'Confirmed & Ready'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C9A45C] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">{booking.pickupLocation}</div>
                  <div className="text-[11px] text-[#777777]">Terminal 2 VIP Valet Bay / Handover Zone 4</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#CCCCCC] pl-6 font-mono-num">
                <span>{booking.pickupDate}</span>
                <span>·</span>
                <span>{booking.pickupTime}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 pl-6">
                <div>
                  <span className="text-[10px] text-[#777777] block uppercase">Vehicle:</span>
                  <span className="font-semibold text-white">{booking.vehicleName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#777777] block uppercase">Pickup code:</span>
                  <span className="font-mono-num font-bold text-[#C9A45C] text-sm">
                    {isPendingDeposit ? 'PENDING DEPOSIT' : `#VX${booking.id.replace(/[^0-9]/g, '') || '7284'}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Prompt Action Buttons: [ GET DIRECTIONS ], [ CONTACT DRIVER ], [ VIEW VEHICLE ] */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(booking.pickupLocation)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-2 bg-white/5 hover:bg-white/10 text-center rounded-lg text-[11px] text-[#DDDDDD] border border-white/10 hover:border-white/20 transition-colors"
              >
                GET DIRECTIONS
              </a>

              <button
                type="button"
                onClick={() => {
                  setContactNotification(`Connecting to Velox Concierge Dispatch for booking #${booking.id}...`);
                  setTimeout(() => setContactNotification(null), 3000);
                }}
                className="py-2 px-2 bg-white/5 hover:bg-white/10 text-center rounded-lg text-[11px] text-[#DDDDDD] border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
              >
                CONTACT DRIVER
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onViewVehicle) {
                    onViewVehicle();
                  } else {
                    onClose();
                  }
                }}
                className="py-2 px-2 bg-[#C9A45C]/15 hover:bg-[#C9A45C]/25 text-center rounded-lg text-[11px] text-[#C9A45C] border border-[#C9A45C]/30 transition-colors cursor-pointer font-medium"
              >
                VIEW VEHICLE
              </button>
            </div>
          </div>

          {/* Assigned Driver Box (if Chauffeur) */}
          {isChauffeur && (
            <div className="p-4 bg-[#111217] border border-[#C9A45C]/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#C9A45C]/20 border border-[#C9A45C] flex items-center justify-center text-sm font-bold text-[#C9A45C]">
                  AS
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#C9A45C] font-semibold">
                    YOUR DRIVER
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Arjun</span>
                    <span className="text-xs text-[#C9A45C]">★★★★★</span>
                  </div>
                  <div className="text-[11px] text-[#888888]">{booking.vehicleName} · White-Glove Trained</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="tel:+918008356900"
                  className="py-2 px-3 bg-[#C9A45C] text-[#050505] font-bold text-xs rounded-xl hover:bg-[#DFBD78] transition-colors flex items-center gap-1.5"
                  title="Call Chauffeur"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>CALL</span>
                </a>
                <button
                  type="button"
                  onClick={() => alert('Opening encrypted concierge message thread with Chauffeur Arjun...')}
                  className="py-2 px-3 bg-white/10 text-white font-bold text-xs rounded-xl hover:bg-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Message Chauffeur"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>CHAT</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleShare}
              className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#C9A45C]" />
              <span>{copied ? 'Pass Copied!' : 'Share Pass'}</span>
            </button>

            <button
              onClick={() => {
                window.print();
              }}
              className="py-3 px-4 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Save / Print Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
