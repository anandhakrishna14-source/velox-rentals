import React, { useState, useMemo } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  UserCheck,
  Shield,
  CreditCard,
  CheckCircle2,
  FileText,
  Upload,
  Camera,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Car,
  Download,
  CalendarPlus,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
  Crown,
  Award
} from 'lucide-react';
import { Vehicle, LocationOption, Booking, DriverOption, PaymentStructure, PricingSettings, RewardsTier } from '../types';
import { REWARDS_TIERS, calculateRentalPoints } from '../utils/rewards';

interface BookingModalProps {
  vehicle: Vehicle | null;
  locations: LocationOption[];
  pricingSettings: PricingSettings;
  currency: 'INR' | 'USD';
  onClose: () => void;
  onBookingConfirmed: (booking: Booking) => void;
  onOpenMyBookings: () => void;
  onOpenPass?: (booking: Booking) => void;
  initialDates?: { pickup: string; returnDate: string; locationId?: string };
}

type BookingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const BookingModal: React.FC<BookingModalProps> = ({
  vehicle,
  locations,
  pricingSettings,
  currency,
  onClose,
  onBookingConfirmed,
  onOpenMyBookings,
  onOpenPass,
  initialDates
}) => {
  if (!vehicle) return null;

  // Step state (1: Car & Dates, 2: Location, 3: Driver, 4: Protection & Extras, 5: Verify, 6: Summary & Payment, 7: Confirmed)
  const [step, setStep] = useState<BookingStep>(1);

  // Form State - Location & Schedule
  const [pickupLocId, setPickupLocId] = useState<string>(
    initialDates?.locationId || locations[0]?.id || 'loc-blr-airport'
  );
  const [sameDropoff, setSameDropoff] = useState<boolean>(true);
  const [dropoffLocId, setDropoffLocId] = useState<string>(locations[0]?.id || 'loc-blr-airport');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const returnD = new Date();
  returnD.setDate(returnD.getDate() + 4);

  const [pickupDate, setPickupDate] = useState<string>(
    initialDates?.pickup || tomorrow.toISOString().split('T')[0]
  );
  const [pickupTime, setPickupTime] = useState<string>('11:30');
  const [returnDate, setReturnDate] = useState<string>(
    initialDates?.returnDate || returnD.toISOString().split('T')[0]
  );
  const [returnTime, setReturnTime] = useState<string>('18:00');

  // Driver Option
  const [driverOption, setDriverOption] = useState<DriverOption>('SELF_DRIVE');

  // Protection & Extras (Build Your Rental - Item 5)
  const [protectionPlan, setProtectionPlan] = useState<'BASIC' | 'PREMIUM'>('PREMIUM');
  const [extraDriver, setExtraDriver] = useState<boolean>(false);
  const [childSeat, setChildSeat] = useState<boolean>(false);
  const [airportDelivery, setAirportDelivery] = useState<boolean>(true);
  const [premiumCleaning, setPremiumCleaning] = useState<boolean>(false);

  // License Verification
  const [licenseNumber, setLicenseNumber] = useState<string>('KA01 20210084920');
  const [driverAge, setDriverAge] = useState<number>(26);
  const [verificationState, setVerificationState] = useState<'IDLE' | 'UPLOADING' | 'SCANNING' | 'VERIFIED' | 'FAILED'>('VERIFIED');
  const [simulatedDocName, setSimulatedDocName] = useState<string | null>('license_ka01_aditya.pdf');

  // Customer Details & Payment
  const [customerName, setCustomerName] = useState<string>('Rahul K.');
  const [customerEmail, setCustomerEmail] = useState<string>('rahul.k@example.com');
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98201 44821');
  const [paymentStructure, setPaymentStructure] = useState<PaymentStructure>('FULL');
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'NETBANKING'>('CARD');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Confirmed booking result
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Active Rewards Tier for discounts
  const userRewardsTier = useMemo<RewardsTier>(() => {
    if (typeof window !== 'undefined') {
      const override = localStorage.getItem('velox_tier_override');
      if (override === 'SILVER' || override === 'GOLD' || override === 'PLATINUM') {
        return override as RewardsTier;
      }
      const savedProfile = localStorage.getItem('velox_rewards_profile');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed.currentTier) return parsed.currentTier;
        } catch {}
      }
    }
    return 'GOLD';
  }, []);

  const tierConfig = REWARDS_TIERS[userRewardsTier as RewardsTier] || REWARDS_TIERS.GOLD;

  // Calculations
  const durationDays = useMemo(() => {
    const p = new Date(`${pickupDate}T${pickupTime}`);
    const r = new Date(`${returnDate}T${returnTime}`);
    const diffMs = r.getTime() - p.getTime();
    if (diffMs <= 0) return 1;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, days);
  }, [pickupDate, pickupTime, returnDate, returnTime]);

  const pricingCalculations = useMemo(() => {
    const baseDaily = vehicle.dailyPrice;
    const baseRental = baseDaily * durationDays;

    // Velox Rewards Tier-based discount (Silver 5%, Gold 10%, Platinum 15%)
    const tierDiscountPercent = tierConfig.discountPercent;
    const tierDiscountAmount = Math.round(baseRental * (tierDiscountPercent / 100));
    const discountedBaseRental = baseRental - tierDiscountAmount;

    const insuranceDaily = protectionPlan === 'PREMIUM' ? pricingSettings.insuranceDailyRate : 0;
    const insuranceFee = insuranceDaily * durationDays;

    const driverDaily = driverOption === 'WITH_DRIVER' ? pricingSettings.driverDailyRate : 0;
    const driverFee = driverDaily * durationDays;

    // Extras (Gold & Platinum get free additional driver fee waiver)
    const extraDriverDailyRate = (userRewardsTier === 'GOLD' || userRewardsTier === 'PLATINUM') ? 0 : 500;
    const extraDriverFee = extraDriver ? extraDriverDailyRate * durationDays : 0;
    const childSeatFee = childSeat ? 300 * durationDays : 0;
    const cleaningFee = premiumCleaning ? 1200 : 0;
    const airportDeliveryFee = airportDelivery ? 0 : 0; // complimentary for airport VIP
    const extrasTotal = extraDriverFee + childSeatFee + cleaningFee + airportDeliveryFee;

    const taxableSubtotal = discountedBaseRental + insuranceFee + driverFee + extrasTotal;
    const taxes = Math.round(taxableSubtotal * pricingSettings.taxRate);

    // Platinum Tier: 100% VIP security deposit waiver
    const securityDeposit = userRewardsTier === 'PLATINUM' ? 0 : vehicle.securityDeposit;
    
    // Total payable today vs Deposit
    const rentalPayableToday = taxableSubtotal + taxes;
    const totalAuthorization = rentalPayableToday + securityDeposit;

    // Deposit structure option
    const advanceBookingAmount = Math.round(taxableSubtotal * pricingSettings.depositPercentage);
    const advancePayableToday = advanceBookingAmount + taxes;
    const balanceDueHandover = rentalPayableToday - advancePayableToday;

    // Points to earn on this rental
    const isExotic = vehicle.category === 'Sports' || vehicle.category === 'Luxury';
    const pointsToEarn = calculateRentalPoints(rentalPayableToday, durationDays, isExotic);

    return {
      baseRental,
      tierDiscountAmount,
      tierDiscountPercent,
      discountedBaseRental,
      insuranceFee,
      driverFee,
      extrasTotal,
      taxes,
      securityDeposit,
      rentalPayableToday,
      totalAuthorization,
      advancePayableToday,
      balanceDueHandover,
      pointsToEarn
    };
  }, [vehicle, durationDays, driverOption, protectionPlan, extraDriver, childSeat, premiumCleaning, airportDelivery, pricingSettings, userRewardsTier, tierConfig]);

  const formatPrice = (priceInr: number) => {
    if (currency === 'USD') {
      const usdPrice = Math.round(priceInr / 85);
      return `$${usdPrice.toLocaleString()}`;
    }
    return `₹${priceInr.toLocaleString('en-IN')}`;
  };

  // Simulate OCR upload
  const handleSimulateUpload = (type: 'upload' | 'camera') => {
    setVerificationState('UPLOADING');
    setSimulatedDocName(type === 'camera' ? 'license_camera_capture.jpg' : 'driving_license_front.pdf');
    
    setTimeout(() => {
      setVerificationState('SCANNING');
      setTimeout(() => {
        setVerificationState('VERIFIED');
      }, 1400);
    }, 1100);
  };

  // Process Booking & Authorization
  const handleProcessPayment = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      const pickupLoc = locations.find(l => l.id === pickupLocId)?.name || 'Bangalore Int. Airport';
      const dropoffLoc = sameDropoff ? pickupLoc : locations.find(l => l.id === dropoffLocId)?.name || pickupLoc;

      const paidAmount = paymentStructure === 'FULL' ? pricingCalculations.rentalPayableToday : pricingCalculations.advancePayableToday;
      const balanceAmount = paymentStructure === 'FULL' ? 0 : pricingCalculations.balanceDueHandover;

      const newBooking: Booking = {
        id: `VX${Math.floor(1000 + Math.random() * 9000)}`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehicleCategory: vehicle.category,
        pickupLocation: pickupLoc,
        dropoffLocation: dropoffLoc,
        pickupDate,
        pickupTime,
        returnDate,
        returnTime,
        durationDays,
        driverOption,
        driverFee: pricingCalculations.driverFee,
        insuranceOption: protectionPlan === 'PREMIUM' ? 'PREMIUM_ZERO_DEP' : 'STANDARD',
        insuranceFee: pricingCalculations.insuranceFee,
        baseRental: pricingCalculations.baseRental,
        taxes: pricingCalculations.taxes,
        securityDeposit: pricingCalculations.securityDeposit,
        total: pricingCalculations.totalAuthorization,
        paidAmount,
        balanceAmount,
        paymentStructure,
        status: 'CONFIRMED',
        customerName,
        customerEmail,
        customerPhone,
        licenseNumber: driverOption === 'SELF_DRIVE' ? licenseNumber : undefined,
        licenseVerified: true,
        createdAt: new Date().toISOString()
      };

      setConfirmedBooking(newBooking);
      onBookingConfirmed(newBooking);

      // Credit Velox Rewards Points to Profile
      try {
        const saved = localStorage.getItem('velox_rewards_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          const pts = pricingCalculations.pointsToEarn;
          const newRecord = {
            id: `REW-${newBooking.id}`,
            bookingId: newBooking.id,
            vehicleName: newBooking.vehicleName,
            rentalDate: newBooking.pickupDate,
            durationDays: newBooking.durationDays,
            spendAmount: newBooking.total,
            basePoints: pts.basePoints,
            bonusPoints: pts.bonusPoints,
            totalPoints: pts.totalPoints,
            status: 'CREDITED',
            reason: `${newBooking.durationDays} Days Rental · ${newBooking.pickupLocation.split('(')[0].trim()}`
          };
          parsed.records = [newRecord, ...(parsed.records || [])];
          parsed.totalPoints = (parsed.totalPoints || 0) + pts.totalPoints;
          localStorage.setItem('velox_rewards_profile', JSON.stringify(parsed));
        }
      } catch {}

      setStep(7); // Confirmed screen
    }, 1600);
  };

  const stepsList = [
    { num: 1, label: 'SCHEDULE' },
    { num: 2, label: 'LOCATION' },
    { num: 3, label: 'DRIVER' },
    { num: 4, label: 'PROTECTION' },
    { num: 5, label: 'VERIFY' },
    { num: 6, label: 'SETTLEMENT' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0B0C0E] border border-[#2B2D35] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#08080A]">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-[#C9A45C] font-semibold">
              BUILD YOUR RENTAL
            </span>
            <span className="text-white/20">|</span>
            <span className="text-xs text-white font-medium">{vehicle.name}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#999999] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Beautiful Highlighted Gold Progress Bar (Item 15) */}
        {step <= 6 && (
          <div className="px-6 py-3 bg-[#0E0F13] border-b border-white/5 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[550px] gap-2">
              {stepsList.map((s, idx) => {
                const isActive = step === s.num;
                const isCompleted = step > s.num;

                return (
                  <React.Fragment key={s.num}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono-num font-bold transition-all ${
                          isActive
                            ? 'bg-[#C9A45C] text-[#050505] ring-2 ring-[#C9A45C]/40'
                            : isCompleted
                            ? 'bg-[#5ED39A] text-[#050505]'
                            : 'bg-white/10 text-[#666666]'
                        }`}
                      >
                        {isCompleted ? '✓' : `0${s.num}`}
                      </div>
                      <span
                        className={`text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap ${
                          isActive
                            ? 'text-[#C9A45C]'
                            : isCompleted
                            ? 'text-[#CCCCCC]'
                            : 'text-[#555555]'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>

                    {idx < stepsList.length - 1 && (
                      <div
                        className={`flex-1 h-px mx-1 transition-all ${
                          isCompleted ? 'bg-[#5ED39A]/60' : 'bg-white/10'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* STEP 1: CAR & DATES */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-luxury text-white mb-1">
                  CHOOSE YOUR RENTAL DURATION
                </h3>
                <p className="text-xs text-[#888888]">
                  Select handover date, return date, and daily privileges.
                </p>
              </div>

              <div className="p-4 bg-[#111216] border border-white/5 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#888888] mb-1">Pickup Date</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={e => setPickupDate(e.target.value)}
                      className="w-full bg-[#181920] border border-[#2B2C33] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#888888] mb-1">Pickup Time</label>
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={e => setPickupTime(e.target.value)}
                      className="w-full bg-[#181920] border border-[#2B2C33] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#888888] mb-1">Return Date</label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={e => setReturnDate(e.target.value)}
                      className="w-full bg-[#181920] border border-[#2B2C33] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#888888] mb-1">Return Time</label>
                    <input
                      type="time"
                      value={returnTime}
                      onChange={e => setReturnTime(e.target.value)}
                      className="w-full bg-[#181920] border border-[#2B2C33] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#17181E] rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-xs text-white">
                    <Clock className="w-4 h-4 text-[#C9A45C]" />
                    <span>Duration:</span>
                    <strong className="font-mono-num text-[#C9A45C]">
                      {durationDays} Days ({durationDays * 24} Hours)
                    </strong>
                  </div>
                  <div className="text-xs font-mono-num text-[#5ED39A]">
                    Complimentary 250km/day included
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-luxury text-white mb-1">
                  HANDOVER LOCATION & LUXURY DELIVERY
                </h3>
                <p className="text-xs text-[#888888]">
                  Select terminal curbside, hotel valet, or private doorstep delivery.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#C9A45C] mb-2">
                    Pickup Location
                  </label>
                  <div className="space-y-2">
                    {locations.map(loc => (
                      <label
                        key={loc.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          pickupLocId === loc.id
                            ? 'bg-[#181920] border-[#C9A45C] text-white shadow-md'
                            : 'bg-[#101115] border-[#222227] text-[#AAAAAA] hover:border-[#3A3A42]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pickupLocation"
                          value={loc.id}
                          checked={pickupLocId === loc.id}
                          onChange={() => setPickupLocId(loc.id)}
                          className="mt-1 accent-[#C9A45C]"
                        />
                        <div className="text-xs">
                          <div className="font-semibold text-white">{loc.name}</div>
                          <div className="text-[11px] text-[#777777] mt-0.5">{loc.operatingHours}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase text-[#C9A45C]">
                      Drop-off Location
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-[#999999] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameDropoff}
                        onChange={e => setSameDropoff(e.target.checked)}
                        className="rounded accent-[#C9A45C]"
                      />
                      <span>Same as pickup</span>
                    </label>
                  </div>

                  {sameDropoff ? (
                    <div className="p-4 bg-[#101115] border border-dashed border-[#2A2B32] rounded-xl text-xs text-[#888888] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#5ED39A]" />
                      <span>Return at the same signature handover terminal.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {locations.map(loc => (
                        <label
                          key={loc.id}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            dropoffLocId === loc.id
                              ? 'bg-[#181920] border-[#C9A45C] text-white shadow-md'
                              : 'bg-[#101115] border-[#222227] text-[#AAAAAA] hover:border-[#3A3A42]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="dropoffLocation"
                            value={loc.id}
                            checked={dropoffLocId === loc.id}
                            onChange={() => setDropoffLocId(loc.id)}
                            className="mt-1 accent-[#C9A45C]"
                          />
                          <div className="text-xs">
                            <div className="font-semibold text-white">{loc.name}</div>
                            <div className="text-[11px] text-[#777777] mt-0.5">{loc.operatingHours}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: DRIVER OPTION */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-luxury text-white mb-1">
                  SELF DRIVE OR CHAUFFEUR ESCORT?
                </h3>
                <p className="text-xs text-[#888888]">
                  Select your preferred command mode.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  onClick={() => setDriverOption('SELF_DRIVE')}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                    driverOption === 'SELF_DRIVE'
                      ? 'bg-[#181920] border-[#C9A45C] shadow-xl shadow-[#C9A45C]/15'
                      : 'bg-[#101115] border-[#222227] hover:border-[#383840]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Car className="w-8 h-8 text-[#C9A45C]" />
                    <span className="text-xs text-[#5ED39A] bg-[#5ED39A]/10 px-2.5 py-1 rounded-md font-semibold">
                      Included
                    </span>
                  </div>
                  <h4 className="text-xl font-luxury text-white mb-2">SELF DRIVE</h4>
                  <p className="text-xs text-[#888888] leading-relaxed mb-4">
                    Full mechanical authority in your hands. Experience the twin-turbo boost, paddle shifters, and sports exhaust firsthand.
                  </p>
                  <div className="p-3 bg-[#1A1813] border border-[#C9A45C]/30 rounded-xl text-xs text-[#C9A45C]">
                    Driving licence verification required. Minimum age: {vehicle.category === 'Performance' ? '24' : '21'} years.
                  </div>
                </div>

                <div
                  onClick={() => setDriverOption('WITH_DRIVER')}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                    driverOption === 'WITH_DRIVER'
                      ? 'bg-[#181920] border-[#C9A45C] shadow-xl shadow-[#C9A45C]/15'
                      : 'bg-[#101115] border-[#222227] hover:border-[#383840]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <UserCheck className="w-8 h-8 text-[#C9A45C]" />
                    <span className="text-xs font-mono-num text-[#C9A45C] bg-[#C9A45C]/10 px-2.5 py-1 rounded-md font-semibold">
                      +{formatPrice(pricingSettings.driverDailyRate)}/day
                    </span>
                  </div>
                  <h4 className="text-xl font-luxury text-white mb-2">WITH CHAUFFEUR</h4>
                  <p className="text-xs text-[#888888] leading-relaxed mb-4">
                    Relax in the executive lounge. Professional, vetted bilingual chauffeur in uniform with airport flight tracking and zero passenger liability.
                  </p>
                  <ul className="text-xs text-[#5ED39A] space-y-1">
                    <li>✓ No driving licence upload required</li>
                    <li>✓ Zero damage excess liability</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PROTECTION & EXTRAS (Build Your Rental) */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-luxury text-white mb-1">
                  PROTECTION & COMPLIMENTARY EXTRAS
                </h3>
                <p className="text-xs text-[#888888]">
                  Customize your coverage and travel conveniences.
                </p>
              </div>

              {/* Protection choice */}
              <div className="space-y-3">
                <label
                  onClick={() => setProtectionPlan('PREMIUM')}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    protectionPlan === 'PREMIUM'
                      ? 'bg-[#181920] border-[#C9A45C] text-white shadow-md'
                      : 'bg-[#101115] border-[#222227] text-[#AAAAAA] hover:border-[#383840]'
                  }`}
                >
                  <input
                    type="radio"
                    name="protectionPlan"
                    checked={protectionPlan === 'PREMIUM'}
                    onChange={() => setProtectionPlan('PREMIUM')}
                    className="mt-1 accent-[#C9A45C]"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-sm">
                        Zero-Depreciation Super Protection (Recommended)
                      </span>
                      <span className="text-[#C9A45C] font-mono-num font-semibold">
                        +{formatPrice(pricingSettings.insuranceDailyRate)}/day
                      </span>
                    </div>
                    <p className="text-[#888888]">
                      Complete peace of mind. Covers bodywork scratches, glass, tyres, and underbody with 0 deductible excess.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setProtectionPlan('BASIC')}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    protectionPlan === 'BASIC'
                      ? 'bg-[#181920] border-[#C9A45C] text-white shadow-md'
                      : 'bg-[#101115] border-[#222227] text-[#AAAAAA] hover:border-[#383840]'
                  }`}
                >
                  <input
                    type="radio"
                    name="protectionPlan"
                    checked={protectionPlan === 'BASIC'}
                    onChange={() => setProtectionPlan('BASIC')}
                    className="mt-1 accent-[#C9A45C]"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-sm">
                        Basic Comprehensive Protection
                      </span>
                      <span className="text-[#5ED39A] font-semibold">Included</span>
                    </div>
                    <p className="text-[#888888]">
                      Standard collision coverage with deductible excess up to the security deposit.
                    </p>
                  </div>
                </label>
              </div>

              {/* Extras checklist */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#C9A45C] block mb-2">
                  Select Optional Conveniences
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center justify-between p-3.5 bg-[#121318] border border-white/5 rounded-xl cursor-pointer">
                    <div>
                      <div className="font-semibold text-white">Additional Registered Driver</div>
                      <div className="text-[11px] text-[#777777]">Allow co-passenger to drive legally</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={extraDriver}
                      onChange={e => setExtraDriver(e.target.checked)}
                      className="rounded accent-[#C9A45C] w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-[#121318] border border-white/5 rounded-xl cursor-pointer">
                    <div>
                      <div className="font-semibold text-white">Child Safety Seat (ISOFIX)</div>
                      <div className="text-[11px] text-[#777777]">Pre-installed & sanitized</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={childSeat}
                      onChange={e => setChildSeat(e.target.checked)}
                      className="rounded accent-[#C9A45C] w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-[#121318] border border-white/5 rounded-xl cursor-pointer">
                    <div>
                      <div className="font-semibold text-white">Airport VIP Curbside Meet & Greet</div>
                      <div className="text-[11px] text-[#777777]">Luggage porter to vehicle door</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={airportDelivery}
                      onChange={e => setAirportDelivery(e.target.checked)}
                      className="rounded accent-[#C9A45C] w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 bg-[#121318] border border-white/5 rounded-xl cursor-pointer">
                    <div>
                      <div className="font-semibold text-white">Premium Valet Detailing</div>
                      <div className="text-[11px] text-[#777777]">Waive drop-off wash requirement</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={premiumCleaning}
                      onChange={e => setPremiumCleaning(e.target.checked)}
                      className="rounded accent-[#C9A45C] w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: LICENCE VERIFICATION */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-luxury text-white mb-1">
                  DIGITAL LICENCE VERIFICATION
                </h3>
                <p className="text-xs text-[#888888]">
                  Automated OCR identity verification. Ephemeral tokens ensure raw document privacy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#C9A45C] mb-1">
                      Driving Licence Number
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={e => setLicenseNumber(e.target.value)}
                      placeholder="e.g. KA01 20210084920"
                      className="w-full bg-[#15161C] border border-[#2B2D38] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#C9A45C] mb-1">
                      Driver Age (Years)
                    </label>
                    <input
                      type="number"
                      value={driverAge}
                      onChange={e => setDriverAge(parseInt(e.target.value) || 21)}
                      min="21"
                      className="w-full bg-[#15161C] border border-[#2B2D38] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSimulateUpload('upload')}
                      className="p-3 bg-[#15171D] hover:bg-[#1E2028] border border-white/10 rounded-xl text-xs text-white flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-5 h-5 text-[#C9A45C]" />
                      <span>Upload File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSimulateUpload('camera')}
                      className="p-3 bg-[#15171D] hover:bg-[#1E2028] border border-white/10 rounded-xl text-xs text-white flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Camera className="w-5 h-5 text-[#C9A45C]" />
                      <span>Take Photo</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-[#111216] border border-white/10 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-[#5ED39A]/10 border border-[#5ED39A]/30 rounded-xl text-[#5ED39A]">
                      <CheckCircle2 className="w-6 h-6 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">VERIFIED APPROVED ✓</div>
                        <div className="text-[11px] text-[#DDDDDD]">Licence valid · Minimum age requirement passed</div>
                      </div>
                    </div>

                    <div className="text-xs text-[#888888] space-y-1 font-mono-num">
                      <div><strong>Doc:</strong> {simulatedDocName || 'license_ka01_aditya.pdf'}</div>
                      <div><strong>Transport Database:</strong> Real-time match verified</div>
                      <div><strong>Retention Policy:</strong> Ephemeral token generated</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#666666] pt-4 border-t border-white/5">
                    <Lock className="w-3.5 h-3.5 text-[#C9A45C]" />
                    <span>256-bit AES transient encryption. No raw documents stored in localStorage.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: SUMMARY & CLEAR DEPOSIT SETTLEMENT (Item 5 & 6) */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-luxury text-white mb-1">
                  RENTAL SUMMARY & AUTHORIZATION
                </h3>
                <p className="text-xs text-[#888888]">
                  Review your itemized ledger with transparent deposit separation.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Customer Info & Settlement Structure (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-4 bg-[#111216] border border-white/5 rounded-2xl space-y-3">
                    <span className="text-xs font-semibold uppercase text-[#C9A45C] tracking-wider block">
                      Customer Handover Contact
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#777777] mb-1">Legal Name</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          className="w-full bg-[#17181F] border border-[#2B2C33] rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#777777] mb-1">Mobile Phone</label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          className="w-full bg-[#17181F] border border-[#2B2C33] rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#777777] mb-1">Email Address</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        className="w-full bg-[#17181F] border border-[#2B2C33] rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Payment structure */}
                  <div className="p-4 bg-[#111216] border border-white/5 rounded-2xl space-y-3">
                    <span className="text-xs font-semibold uppercase text-[#C9A45C] tracking-wider block">
                      Select Settlement Structure
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setPaymentStructure('FULL')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          paymentStructure === 'FULL'
                            ? 'bg-[#181920] border-[#C9A45C] text-white shadow-md'
                            : 'bg-[#121316] border-[#222226] text-[#888888] hover:border-[#38383F]'
                        }`}
                      >
                        <div className="text-xs font-bold text-white mb-0.5">FULL SETTLEMENT</div>
                        <div className="text-[11px] text-[#888888] mb-2">Pay 100% rental now. Zero balance on handover.</div>
                        <div className="text-sm font-mono-num font-bold text-[#C9A45C]">
                          Pay Today: {formatPrice(pricingCalculations.rentalPayableToday)}
                        </div>
                      </div>

                      <div
                        onClick={() => setPaymentStructure('DEPOSIT')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          paymentStructure === 'DEPOSIT'
                            ? 'bg-[#181920] border-[#C9A45C] text-white shadow-md'
                            : 'bg-[#121316] border-[#222226] text-[#888888] hover:border-[#38383F]'
                        }`}
                      >
                        <div className="text-xs font-bold text-white mb-0.5">20% ADVANCE BOOKING</div>
                        <div className="text-[11px] text-[#888888] mb-2">Reserve dates today, pay remainder at delivery.</div>
                        <div className="text-sm font-mono-num font-bold text-[#5ED39A]">
                          Pay Today: {formatPrice(pricingCalculations.advancePayableToday)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Crystal Clear Deposit Separation (Item 6) */}
                <div className="lg:col-span-5 p-6 bg-gradient-to-b from-[#141519] to-[#0D0E11] border border-[#2B2C33] rounded-3xl space-y-4">
                  <div className="border-b border-white/10 pb-3">
                    <span className="text-[10px] font-mono-num text-[#C9A45C] uppercase block">YOUR DRIVE LEDGER</span>
                    <h4 className="text-xl font-luxury text-white">{vehicle.name}</h4>
                    <p className="text-xs text-[#888888]">
                      {durationDays} Days ({pickupDate} → {returnDate})
                    </p>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2 text-xs text-[#CCCCCC]">
                    <div className="flex justify-between">
                      <span className="text-[#888888]">Standard Rental ({durationDays} days)</span>
                      <span className="font-mono-num text-white">{formatPrice(pricingCalculations.baseRental)}</span>
                    </div>

                    {/* Velox Rewards Tier Discount */}
                    {pricingCalculations.tierDiscountAmount > 0 && (
                      <div className="flex justify-between items-center text-[#5ED39A] bg-[#5ED39A]/10 p-2 rounded-lg border border-[#5ED39A]/20">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Crown className="w-3.5 h-3.5 text-[#C9A45C]" />
                          <span>Velox Rewards ({tierConfig.name} {pricingCalculations.tierDiscountPercent}% Off)</span>
                        </span>
                        <span className="font-mono-num font-bold">- {formatPrice(pricingCalculations.tierDiscountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-[#888888]">Protection</span>
                      <span className="font-mono-num text-white">{formatPrice(pricingCalculations.insuranceFee)}</span>
                    </div>

                    {pricingCalculations.extrasTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#888888]">Extras & Privileges</span>
                        <span className="font-mono-num text-white">{formatPrice(pricingCalculations.extrasTotal)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-[#888888]">Taxes (GST 18%)</span>
                      <span className="font-mono-num text-white">{formatPrice(pricingCalculations.taxes)}</span>
                    </div>

                    {/* Rewards Points to Earn on this Trip */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono-num text-[#C9A45C]">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>Trip Points to Earn:</span>
                      </span>
                      <span className="font-bold">+{pricingCalculations.pointsToEarn.totalPoints.toLocaleString()} PTS</span>
                    </div>
                  </div>

                  {/* Item 6 Crystal Clear Deposit Box */}
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <div className="p-3 bg-[#111216] rounded-xl border border-white/10">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs uppercase font-bold text-white tracking-wider">
                          PAYABLE TODAY
                        </span>
                        <span className="text-lg font-luxury font-bold text-[#C9A45C] font-mono-num">
                          {formatPrice(
                            paymentStructure === 'FULL'
                              ? pricingCalculations.rentalPayableToday
                              : pricingCalculations.advancePayableToday
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline text-xs text-[#5ED39A] pt-1 border-t border-white/5 font-mono-num">
                        <span>
                          {userRewardsTier === 'PLATINUM' ? '₹0 (Platinum VIP 100% Waiver)' : `+ ${formatPrice(pricingCalculations.securityDeposit)}`}
                        </span>
                        <span>Refundable Security Deposit</span>
                      </div>
                    </div>

                    {/* Total Authorization */}
                    <div className="flex justify-between items-baseline px-1">
                      <span className="text-xs uppercase font-bold text-[#888888]">
                        TOTAL AUTHORIZATION
                      </span>
                      <span className="text-xl font-luxury font-bold text-white font-mono-num">
                        {formatPrice(
                          paymentStructure === 'FULL'
                            ? pricingCalculations.totalAuthorization
                            : pricingCalculations.advancePayableToday + pricingCalculations.securityDeposit
                        )}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#777777] italic leading-tight px-1">
                      * Security deposit refunded after vehicle inspection, subject to rental terms.
                    </p>
                  </div>

                  {/* Payment CTA */}
                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={isProcessingPayment}
                    className="w-full py-4 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-[#C9A45C]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <span>Authorizing with Gateway...</span>
                    ) : (
                      <>
                        <span>AUTHORIZE & CONFIRM DRIVE</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: CONFIRMATION & DIGITAL RENTAL PASS (Item 8) */}
          {step === 7 && confirmedBooking && (
            <div className="py-6 text-center max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#5ED39A]/15 border-2 border-[#5ED39A] mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8 text-[#5ED39A]" />
              </div>

              <div>
                <h3 className="text-3xl font-luxury text-white mb-1">
                  BOOKING CONFIRMED
                </h3>
                <p className="text-xs text-[#AAAAAA]">
                  Your reservation reference is <strong className="text-[#C9A45C] font-mono-num">#{confirmedBooking.id}</strong>. Handover instructions and digital pass are ready.
                </p>
              </div>

              {/* YOUR PICKUP Experience Card (Item 8) */}
              <div className="p-5 bg-[#101115] border border-white/10 rounded-2xl text-left space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-[#C9A45C] uppercase">YOUR PICKUP</span>
                  <span className="text-xs font-mono-num text-[#5ED39A] font-bold">PASS ISSUED ✓</span>
                </div>

                <div className="space-y-1 text-xs text-[#DDDDDD]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A45C]" />
                    <span>{confirmedBooking.pickupLocation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#C9A45C]" />
                    <span>{confirmedBooking.pickupDate} at {confirmedBooking.pickupTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-[#C9A45C]" />
                    <span>Vehicle: <strong>{confirmedBooking.vehicleName}</strong></span>
                  </div>
                </div>

                <div className="p-3 bg-[#16171E] rounded-xl flex items-center justify-between font-mono-num text-xs">
                  <span className="text-[#777777]">Handover Pickup Code:</span>
                  <span className="text-[#C9A45C] font-bold text-sm">#{confirmedBooking.id}</span>
                </div>
              </div>

              {/* Velox Rewards Points Credited Banner */}
              <div className="p-4 bg-gradient-to-r from-[#171A21] via-[#101217] to-[#171A21] border border-[#C9A45C]/40 rounded-2xl flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C9A45C]/15 border border-[#C9A45C]/30 flex items-center justify-center text-[#C9A45C]">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider">
                      Velox Rewards Points Credited!
                    </div>
                    <div className="text-[11px] text-[#888888]">
                      Tier status: <strong className="text-[#C9A45C]">{tierConfig.name}</strong> • Added to your client profile
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-mono-num font-bold text-[#5ED39A]">
                    +{pricingCalculations.pointsToEarn.totalPoints.toLocaleString()} PTS
                  </div>
                  <span className="text-[10px] text-[#888888] font-mono-num">Credited</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPass?.(confirmedBooking);
                  }}
                  className="py-3 px-4 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View Digital Rental Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMyBookings();
                  }}
                  className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Go to Client Portal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons (Steps 1 to 5) */}
        {step < 6 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#08080A]">
            <button
              type="button"
              onClick={() => setStep(prev => Math.max(1, prev - 1) as BookingStep)}
              disabled={step === 1}
              className="py-2.5 px-4 rounded-xl border border-white/10 text-xs text-[#999999] hover:text-white disabled:opacity-20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(prev => Math.min(6, prev + 1) as BookingStep)}
              className="py-2.5 px-6 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#C9A45C]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
