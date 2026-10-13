import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Car,
  Shield,
  Download,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  RotateCcw,
  User,
  Trash2,
  QrCode,
  FileCheck2,
  ShieldCheck,
  Crown,
  Sparkles,
  Award
} from 'lucide-react';
import { Booking, BookingStatus, VehicleCondition } from '../types';
import { EmergencyAssistanceView } from './EmergencyAssistanceView';
import { VeloxRewardsProfile } from './VeloxRewardsProfile';
import { Radio } from 'lucide-react';

interface MyBookingsModalProps {
  bookings: Booking[];
  currency: 'INR' | 'USD';
  initialTab?: TabType;
  onClose: () => void;
  onCancelBooking: (bookingId: string) => void;
  onRescheduleBooking: (bookingId: string, newPickupDate: string, newReturnDate: string) => void;
  onOpenDigitalPass: (booking: Booking) => void;
  onOpenInspection: (booking: Booking) => void;
  onPayDeposit?: (bookingId: string, depositAmount: number) => void;
}

export type TabType = 'UPCOMING' | 'ACTIVE' | 'EMERGENCY' | 'COMPLETED' | 'CANCELLED' | 'PROFILE';

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  bookings,
  currency,
  initialTab = 'UPCOMING',
  onClose,
  onCancelBooking,
  onRescheduleBooking,
  onOpenDigitalPass,
  onOpenInspection,
  onPayDeposit
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<Booking | null>(null);
  const [selectedEmergencyBooking, setSelectedEmergencyBooking] = useState<Booking | null>(null);
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [depositPaymentMethod, setDepositPaymentMethod] = useState<'CARD' | 'UPI' | 'NETBANKING'>('CARD');
  const [isAuthorizingDeposit, setIsAuthorizingDeposit] = useState<boolean>(false);
  const [newPickupDate, setNewPickupDate] = useState<string>('');
  const [newReturnDate, setNewReturnDate] = useState<string>('');

  const formatPrice = (priceInr: number) => {
    if (currency === 'USD') {
      const usdPrice = Math.round(priceInr / 85);
      return `$${usdPrice.toLocaleString()}`;
    }
    return `₹${priceInr.toLocaleString('en-IN')}`;
  };

  const handleConfirmPayDeposit = () => {
    if (!payingBooking) return;
    setIsAuthorizingDeposit(true);
    setTimeout(() => {
      setIsAuthorizingDeposit(false);
      const depositAmt = payingBooking.depositAmount || Math.round(payingBooking.total * 0.2);
      onPayDeposit?.(payingBooking.id, depositAmt);
      setPayingBooking(null);
    }, 1300);
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'UPCOMING') return b.status === 'CONFIRMED' || b.status === 'PENDING' || b.status === 'PAYMENT_PENDING';
    if (activeTab === 'ACTIVE') return b.status === 'ACTIVE';
    if (activeTab === 'COMPLETED') return b.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED' || b.status === 'REFUNDED';
    return true;
  });

  const handleDownloadInvoice = (b: Booking) => {
    const text = `
==============================================================
                    VELOX DRIVE LUXURY RENTALS
                     TAX INVOICE & RECEIPT
==============================================================
Invoice Number:    INV-${b.id}
Booking ID:        #${b.id}
Date:              ${new Date(b.createdAt).toLocaleDateString()}
Status:            ${b.status}

Customer:          ${b.customerName}
Phone:             ${b.customerPhone}
Email:             ${b.customerEmail}

Vehicle Reserved:  ${b.vehicleName} (${b.vehicleCategory})
Driver Option:     ${b.driverOption === 'WITH_DRIVER' ? 'Chauffeur' : 'Self-Drive'}
Pickup Location:   ${b.pickupLocation}
Pickup Schedule:   ${b.pickupDate} at ${b.pickupTime}
Return Schedule:   ${b.returnDate} at ${b.returnTime}
Total Duration:    ${b.durationDays} Days

FINANCIALS:
Base Rental:       ₹${b.baseRental.toLocaleString('en-IN')}
Insurance Cover:   ₹${b.insuranceFee.toLocaleString('en-IN')}
Driver Fee:        ₹${b.driverFee.toLocaleString('en-IN')}
GST Taxes (18%):   ₹${b.taxes.toLocaleString('en-IN')}
Security Deposit:  ₹${b.securityDeposit.toLocaleString('en-IN')} (Refundable)
--------------------------------------------------------------
TOTAL VALUE:       ₹${b.total.toLocaleString('en-IN')}
AMOUNT PAID:       ₹${b.paidAmount.toLocaleString('en-IN')}
BALANCE DUE:       ₹${b.balanceAmount.toLocaleString('en-IN')}
==============================================================
Velox Drive 24/7 VIP Concierge Support & Curbside Operations
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${b.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmReschedule = () => {
    if (!selectedBookingForReschedule || !newPickupDate || !newReturnDate) return;
    onRescheduleBooking(selectedBookingForReschedule.id, newPickupDate, newReturnDate);
    setSelectedBookingForReschedule(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0C0D10] border border-[#26272C] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#08080A]">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-[#C9A45C] font-semibold">
              VELOX DRIVE · CLIENT PORTAL
            </span>
            <span className="text-white/20">|</span>
            <span className="text-xs text-[#CCCCCC]">My Reservations & Rewards</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#999999] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 px-6 pt-4 border-b border-white/5 bg-[#0E0F12] overflow-x-auto">
          {[
            { id: 'UPCOMING', label: 'Upcoming' },
            { id: 'ACTIVE', label: 'Active Drive' },
            { id: 'EMERGENCY', label: 'SOS Emergency Assist', isSos: true },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled / Refunded' },
            { id: 'PROFILE', label: 'Velox Rewards & Profile', isRewards: true }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? tab.isSos
                    ? 'border-[#E66A6A] text-[#E66A6A]'
                    : tab.isRewards
                    ? 'border-[#C9A45C] text-[#C9A45C]'
                    : 'border-[#C9A45C] text-[#C9A45C]'
                  : tab.isSos
                  ? 'border-transparent text-[#E66A6A]/80 hover:text-[#E66A6A]'
                  : tab.isRewards
                  ? 'border-transparent text-[#C9A45C]/70 hover:text-[#C9A45C]'
                  : 'border-transparent text-[#777777] hover:text-white'
              }`}
            >
              {tab.isSos && <span className="w-2 h-2 rounded-full bg-[#E66A6A] animate-ping" />}
              {tab.isRewards && <Crown className="w-3.5 h-3.5 text-[#C9A45C]" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'EMERGENCY' ? (
            <EmergencyAssistanceView
              activeBooking={selectedEmergencyBooking || bookings.find(b => b.status === 'ACTIVE') || bookings[0]}
              allBookings={bookings}
            />
          ) : activeTab !== 'PROFILE' ? (
            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <div className="py-16 text-center text-[#777777] space-y-3">
                  <Car className="w-12 h-12 mx-auto text-[#333333]" />
                  <p className="text-sm">No reservations found in this section.</p>
                </div>
              ) : (
                filteredBookings.map(b => (
                  <div
                    key={b.id}
                    className="p-6 bg-[#111216] border border-[#222227] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#383840] transition-colors"
                  >
                    {/* Left: Booking summary */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-luxury font-bold text-white">
                          {b.vehicleName}
                        </span>
                        <span className="text-xs font-mono-num text-[#C9A45C] bg-[#C9A45C]/10 px-2.5 py-0.5 rounded-full font-bold">
                          #{b.id}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded ${
                            b.status === 'CONFIRMED'
                              ? 'bg-[#5ED39A]/15 text-[#5ED39A] border border-[#5ED39A]/30'
                              : b.status === 'PAYMENT_PENDING'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 font-bold'
                              : b.status === 'ACTIVE'
                              ? 'bg-[#3B82F6]/15 text-[#3B82F6]'
                              : b.status === 'CANCELLED'
                              ? 'bg-[#E66A6A]/15 text-[#E66A6A]'
                              : 'bg-white/10 text-[#AAAAAA]'
                          }`}
                        >
                          {b.status === 'PAYMENT_PENDING' ? 'AWAITING FIRST DEPOSIT · UNCONFIRMED' : b.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#999999]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#C9A45C]" />
                          <span>{b.pickupDate} ({b.pickupTime}) → {b.returnDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C9A45C]" />
                          <span className="truncate max-w-[200px]">{b.pickupLocation}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono-num text-[#CCCCCC] pt-1">
                        <span>Total: {formatPrice(b.total)}</span>
                        <span>Paid: <strong className={b.paidAmount > 0 ? "text-[#5ED39A]" : "text-[#888888]"}>{formatPrice(b.paidAmount)}</strong></span>
                        {b.balanceAmount > 0 && (
                          <span className="text-[#C9A45C]">Due at Handover: {formatPrice(b.balanceAmount)}</span>
                        )}
                      </div>

                      {/* Policy Banner for Payment Pending */}
                      {b.status === 'PAYMENT_PENDING' && (
                        <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1 mt-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                            <span>Booking Policy: Confirmed Only After First Deposit Payment</span>
                          </div>
                          <p className="text-[11px] text-[#DDDDDD] leading-relaxed">
                            This vehicle is currently on temporary grace hold. Complete your first deposit of <strong className="text-amber-300 font-mono-num font-bold">{formatPrice(b.depositAmount || Math.round(b.total * 0.2))}</strong> to officially confirm and lock your reservation.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions (Digital Pass & Inspection & Deposit Payment) */}
                    <div className="flex flex-wrap md:flex-col items-stretch gap-2 shrink-0">
                      {/* If PAYMENT_PENDING: Prominent Pay Deposit CTA */}
                      {b.status === 'PAYMENT_PENDING' && (
                        <>
                          <button
                            onClick={() => setPayingBooking(b)}
                            className="py-2.5 px-3.5 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-[#C9A45C]/25"
                          >
                            <ShieldCheck className="w-4 h-4 text-black" />
                            <span>Pay Deposit to Confirm ({formatPrice(b.depositAmount || Math.round(b.total * 0.2))})</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Release temporary hold for reservation #${b.id}?`)) {
                                onCancelBooking(b.id);
                              }
                            }}
                            className="py-1.5 px-3 bg-[#E66A6A]/10 hover:bg-[#E66A6A]/20 border border-[#E66A6A]/30 text-[#E66A6A] rounded-xl text-xs transition-colors cursor-pointer text-center"
                          >
                            Release Hold
                          </button>
                        </>
                      )}

                      {/* View Digital Rental Pass (Item 8) */}
                      {b.status !== 'PAYMENT_PENDING' && (
                        <button
                          onClick={() => onOpenDigitalPass(b)}
                          className="py-2 px-3 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Rental Pass</span>
                        </button>
                      )}

                      {/* Condition Inspection (Item 7) */}
                      {b.status !== 'PAYMENT_PENDING' && (
                        <button
                          onClick={() => onOpenInspection(b)}
                          className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-[#5ED39A]" />
                          <span>Condition Log</span>
                        </button>
                      )}

                      {/* Emergency Roadside SOS Button */}
                      {(b.status === 'ACTIVE' || b.status === 'CONFIRMED') && (
                        <button
                          onClick={() => {
                            setSelectedEmergencyBooking(b);
                            setActiveTab('EMERGENCY');
                          }}
                          className="py-2 px-3 bg-[#E66A6A]/15 hover:bg-[#E66A6A]/25 border border-[#E66A6A]/40 text-[#E66A6A] font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          title="Trigger Roadside Assistance for this vehicle"
                        >
                          <Radio className="w-3.5 h-3.5 animate-pulse" />
                          <span>Emergency SOS</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadInvoice(b)}
                        className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-[#CCCCCC] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#C9A45C]" />
                        <span>Invoice</span>
                      </button>

                      {b.status === 'CONFIRMED' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedBookingForReschedule(b);
                              setNewPickupDate(b.pickupDate);
                              setNewReturnDate(b.returnDate);
                            }}
                            className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] text-[#AAAAAA] hover:text-white transition-colors cursor-pointer text-center"
                          >
                            Reschedule
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Cancel reservation #${b.id}? Eligible for full refund according to 24h policy.`)) {
                                onCancelBooking(b.id);
                              }
                            }}
                            className="flex-1 py-1.5 px-2 bg-[#E66A6A]/10 hover:bg-[#E66A6A]/20 border border-[#E66A6A]/30 rounded-lg text-[11px] text-[#E66A6A] transition-colors cursor-pointer text-center"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Profile & Velox Rewards View */
            <div className="space-y-6">
              <VeloxRewardsProfile
                bookings={bookings}
                currency={currency}
                onBookNow={onClose}
              />

              <div className="p-6 bg-[#111216] border border-white/5 rounded-2xl space-y-3 text-xs text-[#999999]">
                <h5 className="font-semibold uppercase tracking-wider text-[#C9A45C]">
                  Account Privacy & Security
                </h5>
                <p>
                  Velox Drive adheres to strict data minimization principles. Ephemeral biometric and driver licence OCR hashes are retained only for insurance validity.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to request deletion of all stored profile records?')) {
                        localStorage.removeItem('velox_rewards_profile');
                        localStorage.removeItem('velox_tier_override');
                        alert('Account privacy deletion request recorded. All ephemeral tokens cleared.');
                      }
                    }}
                    className="py-2.5 px-4 bg-[#E66A6A]/10 hover:bg-[#E66A6A]/20 border border-[#E66A6A]/30 text-[#E66A6A] rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Request Data Deletion</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reschedule Modal Overlay */}
        {selectedBookingForReschedule && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#131418] border border-[#C9A45C]/50 rounded-2xl p-6 space-y-4">
              <h4 className="text-lg font-luxury text-white">
                Reschedule {selectedBookingForReschedule.vehicleName}
              </h4>
              <p className="text-xs text-[#888888]">
                Select new dates for booking reference #{selectedBookingForReschedule.id}.
              </p>

              <div>
                <label className="block text-xs text-[#AAAAAA] mb-1">New Pickup Date</label>
                <input
                  type="date"
                  value={newPickupDate}
                  onChange={e => setNewPickupDate(e.target.value)}
                  className="w-full bg-[#1C1D24] border border-[#333] rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-[#AAAAAA] mb-1">New Return Date</label>
                <input
                  type="date"
                  value={newReturnDate}
                  onChange={e => setNewReturnDate(e.target.value)}
                  className="w-full bg-[#1C1D24] border border-[#333] rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedBookingForReschedule(null)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReschedule}
                  className="flex-1 py-2 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-semibold rounded-lg text-xs"
                >
                  Confirm Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* First Deposit Payment Dialog */}
        {payingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-[#111216] border border-[#2B2C33] rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#C9A45C]" />
                  <h4 className="text-base font-luxury text-white">AUTHORIZE FIRST DEPOSIT</h4>
                </div>
                <button
                  onClick={() => setPayingBooking(null)}
                  className="p-1 rounded-lg text-[#888888] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#888888]">
                  <span>Vehicle:</span>
                  <span className="text-white font-semibold">{payingBooking.vehicleName}</span>
                </div>
                <div className="flex justify-between text-[#888888]">
                  <span>Reservation Ref:</span>
                  <span className="text-[#C9A45C] font-mono-num font-bold">#{payingBooking.id}</span>
                </div>
                <div className="flex justify-between text-[#888888]">
                  <span>Rental Schedule:</span>
                  <span className="text-white font-mono-num">{payingBooking.pickupDate} → {payingBooking.returnDate}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                  <span className="font-bold text-white uppercase text-[11px]">First Deposit Payable Today:</span>
                  <span className="text-xl font-bold font-mono-num text-[#5ED39A]">
                    {formatPrice(payingBooking.depositAmount || Math.round(payingBooking.total * 0.2))}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-[11px] text-[#DDDDDD] flex items-center gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Booking Policy: Authorizing this initial deposit will immediately switch status to <strong>CONFIRMED</strong> and guarantee your vehicle schedule.</span>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] text-[#888888]">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositPaymentMethod('CARD')}
                    className={`p-2.5 rounded-xl border text-center text-xs cursor-pointer ${
                      depositPaymentMethod === 'CARD' ? 'border-[#C9A45C] text-[#C9A45C] bg-[#181920]' : 'border-[#222226] text-[#888888]'
                    }`}
                  >
                    VIP Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositPaymentMethod('UPI')}
                    className={`p-2.5 rounded-xl border text-center text-xs cursor-pointer ${
                      depositPaymentMethod === 'UPI' ? 'border-[#C9A45C] text-[#C9A45C] bg-[#181920]' : 'border-[#222226] text-[#888888]'
                    }`}
                  >
                    UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositPaymentMethod('NETBANKING')}
                    className={`p-2.5 rounded-xl border text-center text-xs cursor-pointer ${
                      depositPaymentMethod === 'NETBANKING' ? 'border-[#C9A45C] text-[#C9A45C] bg-[#181920]' : 'border-[#222226] text-[#888888]'
                    }`}
                  >
                    NetBanking
                  </button>
                </div>
              </div>

              <button
                onClick={handleConfirmPayDeposit}
                disabled={isAuthorizingDeposit}
                className="w-full py-3.5 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAuthorizingDeposit ? (
                  <span>Authorizing First Deposit Gateway...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>PAY {formatPrice(payingBooking.depositAmount || Math.round(payingBooking.total * 0.2))} & CONFIRM BOOKING</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
