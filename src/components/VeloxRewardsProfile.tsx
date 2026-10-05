import React, { useState, useEffect } from 'react';
import {
  Award,
  Crown,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Percent,
  Gift,
  ArrowRight,
  CheckCircle2,
  Clock,
  Car,
  ChevronRight,
  Download,
  Flame,
  Zap,
  Info,
  Sliders,
  RotateCcw,
  Check
} from 'lucide-react';
import { Booking, RewardsTier, RentalPointsRecord, RewardsProfile } from '../types';
import {
  REWARDS_TIERS,
  getTierFromPoints,
  getTierProgress,
  getInitialRewardsProfile,
  calculateRentalPoints
} from '../utils/rewards';

interface VeloxRewardsProfileProps {
  bookings: Booking[];
  currency: 'INR' | 'USD';
  onBookNow?: () => void;
  onSelectBooking?: (booking: Booking) => void;
}

export const VeloxRewardsProfile: React.FC<VeloxRewardsProfileProps> = ({
  bookings,
  currency,
  onBookNow,
  onSelectBooking
}) => {
  // Load rewards profile or initialize
  const [profile, setProfile] = useState<RewardsProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('velox_rewards_profile');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return getInitialRewardsProfile(bookings);
  });

  // Tier override for live demonstration / testing
  const [tierOverride, setTierOverride] = useState<RewardsTier | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('velox_tier_override');
      if (saved === 'SILVER' || saved === 'GOLD' || saved === 'PLATINUM') return saved;
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RENTALS' | 'PERKS'>('OVERVIEW');
  const [filterType, setFilterType] = useState<'ALL' | 'CREDITED' | 'PENDING'>('ALL');
  const [redeemedRewardNotice, setRedeemedRewardNotice] = useState<string | null>(null);

  // Sync with incoming bookings
  useEffect(() => {
    // Check if new bookings have been added that aren't in records
    const existingBookingIds = new Set(profile.records.map(r => r.bookingId));
    let pointsToAdd = 0;
    const newRecords: RentalPointsRecord[] = [];

    bookings.forEach(b => {
      if (!existingBookingIds.has(b.id)) {
        const isSports = b.vehicleCategory === 'Sports' || b.vehicleCategory === 'Luxury';
        const pts = calculateRentalPoints(b.total, b.durationDays, isSports);
        const status = b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'CREDITED' : 'PENDING';
        newRecords.push({
          id: `REW-${b.id}`,
          bookingId: b.id,
          vehicleName: b.vehicleName,
          rentalDate: b.pickupDate,
          durationDays: b.durationDays,
          spendAmount: b.total,
          basePoints: pts.basePoints,
          bonusPoints: pts.bonusPoints,
          totalPoints: pts.totalPoints,
          status,
          reason: `${b.durationDays} Days · ${b.pickupLocation.split('(')[0].trim()}`
        });
        if (status === 'CREDITED') {
          pointsToAdd += pts.totalPoints;
        }
      }
    });

    if (newRecords.length > 0) {
      setProfile(prev => {
        const updated = {
          ...prev,
          totalPoints: prev.totalPoints + pointsToAdd,
          currentTier: getTierFromPoints(prev.totalPoints + pointsToAdd),
          records: [...prev.records, ...newRecords]
        };
        localStorage.setItem('velox_rewards_profile', JSON.stringify(updated));
        return updated;
      });
    }
  }, [bookings]);

  // Save to localStorage when profile changes
  useEffect(() => {
    localStorage.setItem('velox_rewards_profile', JSON.stringify(profile));
  }, [profile]);

  const effectiveTier = tierOverride || profile.currentTier;
  const currentTierConfig = REWARDS_TIERS[effectiveTier];
  const progressInfo = getTierProgress(profile.totalPoints);

  const formatCurrency = (amt: number) => {
    if (currency === 'USD') {
      return `$${Math.round(amt / 85).toLocaleString()}`;
    }
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  const filteredRecords = profile.records.filter(r => {
    if (filterType === 'CREDITED') return r.status === 'CREDITED';
    if (filterType === 'PENDING') return r.status === 'PENDING';
    return true;
  });

  const handleSimulateTier = (t: RewardsTier) => {
    if (tierOverride === t) {
      setTierOverride(null);
      localStorage.removeItem('velox_tier_override');
    } else {
      setTierOverride(t);
      localStorage.setItem('velox_tier_override', t);
    }
  };

  const handleRedeemPerk = (perkName: string, cost: number) => {
    if (profile.totalPoints < cost) {
      alert(`Insufficient balance. You need ${cost.toLocaleString()} points for this reward.`);
      return;
    }
    const updatedPoints = profile.totalPoints - cost;
    const redemptionRecord: RentalPointsRecord = {
      id: `REW-RED-${Date.now()}`,
      bookingId: `VOUCHER-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleName: perkName,
      rentalDate: new Date().toISOString().split('T')[0],
      durationDays: 1,
      spendAmount: 0,
      basePoints: -cost,
      bonusPoints: 0,
      totalPoints: -cost,
      status: 'CREDITED',
      reason: `VIP Privilege Voucher Redemption`
    };

    setProfile(prev => ({
      ...prev,
      totalPoints: updatedPoints,
      records: [redemptionRecord, ...prev.records]
    }));

    setRedeemedRewardNotice(`Redeemed "${perkName}"! Voucher code generated and applied to your account.`);
    setTimeout(() => setRedeemedRewardNotice(null), 3500);
  };

  const handleExportStatement = () => {
    const lines = [
      '==============================================================',
      '                 VELOX REWARDS · PRIVILEGE STATEMENT           ',
      '==============================================================',
      `Member:          ${profile.clientName}`,
      `Membership ID:   ${profile.membershipId}`,
      `Tier Level:      ${currentTierConfig.name} (${currentTierConfig.discountPercent}% Active Discount)`,
      `Total Points:    ${profile.totalPoints.toLocaleString()} PTS`,
      `Generated:       ${new Date().toLocaleDateString()}`,
      '--------------------------------------------------------------',
      'RENTAL POINTS EARNED PER RESERVATION:',
      ...profile.records.map(
        r =>
          `[${r.status}] ${r.rentalDate} | ${r.vehicleName.padEnd(28)} | ${r.totalPoints > 0 ? '+' : ''}${r.totalPoints.toLocaleString()} PTS (${r.reason})`
      ),
      '==============================================================',
      'Velox Drive Concierge: concierge@veloxdrive.luxury'
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Velox_Rewards_Statement_${profile.membershipId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. CLIENT PROFILE & TIER STATUS BANNER */}
      <div className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#14151C] via-[#0E0F14] to-[#08090C] border border-[#2B2C33] overflow-hidden shadow-2xl">
        {/* Subtle decorative glow */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: currentTierConfig.accentHex }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Client Monogram & Core Credentials */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div
                className="w-18 h-18 rounded-2xl flex items-center justify-center text-2xl font-luxury font-bold border-2 shadow-xl"
                style={{
                  backgroundColor: 'rgba(18, 19, 24, 0.9)',
                  borderColor: currentTierConfig.accentHex,
                  color: currentTierConfig.accentHex
                }}
              >
                RK
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#08090C] border border-white/10">
                <Crown className="w-4 h-4" style={{ color: currentTierConfig.accentHex }} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-2xl font-luxury font-bold text-white tracking-tight">
                  {profile.clientName}
                </h3>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-num font-bold tracking-wider uppercase border"
                  style={{
                    backgroundColor: `${currentTierConfig.accentHex}15`,
                    borderColor: currentTierConfig.accentHex,
                    color: currentTierConfig.accentHex
                  }}
                >
                  {currentTierConfig.name}
                </span>
              </div>

              <div className="text-xs text-[#888888] font-mono-num mt-1 flex flex-wrap items-center gap-2">
                <span>{profile.email}</span>
                <span>•</span>
                <span>{profile.phone}</span>
                <span>•</span>
                <span className="text-[#C9A45C]">ID: {profile.membershipId}</span>
              </div>

              <div className="flex items-center gap-2 mt-2.5">
                <span className="text-[11px] bg-[#5ED39A]/15 text-[#5ED39A] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Driving Licence Verified ✓</span>
                </span>
                <span className="text-[11px] bg-white/5 text-[#AAAAAA] px-2.5 py-0.5 rounded-full font-mono-num">
                  Member since {profile.memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Current Tier Benefit Callout */}
          <div className="flex flex-col items-start md:items-end bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
            <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#888888]">
              Active Tier Privilege
            </span>
            <div className="text-xl font-luxury font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span style={{ color: currentTierConfig.accentHex }}>
                {currentTierConfig.discountPercent}% Off
              </span>
              <span>Every Rental</span>
            </div>
            <span className="text-[11px] text-[#5ED39A] font-medium mt-0.5">
              Auto-applied at checkout
            </span>
          </div>
        </div>

        {/* 2. PROGRESS BAR TOWARDS NEXT REWARDS LEVEL */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-num uppercase tracking-wider text-[#999999]">
                  Velox Rewards Points Balance:
                </span>
                <span className="text-xl font-mono-num font-bold text-white">
                  {profile.totalPoints.toLocaleString()} <span className="text-xs text-[#C9A45C]">PTS</span>
                </span>
              </div>
            </div>

            <div className="text-xs font-mono-num text-right">
              {progressInfo.nextTier ? (
                <span className="text-[#DDDDDD]">
                  <strong style={{ color: currentTierConfig.accentHex }}>
                    {progressInfo.pointsNeeded.toLocaleString()} PTS
                  </strong>{' '}
                  needed for{' '}
                  <span className="text-white font-semibold">
                    {REWARDS_TIERS[progressInfo.nextTier].name} ({REWARDS_TIERS[progressInfo.nextTier].discountPercent}% Off)
                  </span>
                </span>
              ) : (
                <span className="text-[#38BDF8] font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pinnacle Distinction Achieved — Platinum Elite</span>
                </span>
              )}
            </div>
          </div>

          {/* Luxury Animated Progress Bar */}
          <div className="relative w-full h-3.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{
                width: `${Math.max(5, progressInfo.progressPercent)}%`,
                background:
                  effectiveTier === 'PLATINUM'
                    ? 'linear-gradient(90deg, #38BDF8, #E0F2FE)'
                    : effectiveTier === 'GOLD'
                    ? 'linear-gradient(90deg, #C9A45C, #FFE082)'
                    : 'linear-gradient(90deg, #94A3B8, #E2E8F0)'
              }}
            >
              {/* Shimmer light effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>

          {/* Tier Milestones Roadmap */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-2 text-[11px] font-mono-num text-[#888888]">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  profile.totalPoints >= 0 ? 'bg-[#94A3B8]' : 'bg-white/20'
                }`}
              />
              <span className="font-semibold text-white">Silver (0+)</span>
              <span className="text-[10px] text-[#C9A45C]">• 5% Off</span>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  profile.totalPoints >= 5000 ? 'bg-[#C9A45C]' : 'bg-white/20'
                }`}
              />
              <span className="font-semibold text-white">Gold (5k PTS)</span>
              <span className="text-[10px] text-[#C9A45C]">• 10% Off</span>
            </div>

            <div className="flex items-center justify-end gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  profile.totalPoints >= 15000 ? 'bg-[#38BDF8]' : 'bg-white/20'
                }`}
              />
              <span className="font-semibold text-white">Platinum (15k PTS)</span>
              <span className="text-[10px] text-[#38BDF8]">• 15% Off</span>
            </div>
          </div>
        </div>
      </div>

      {redeemedRewardNotice && (
        <div className="p-3.5 rounded-xl bg-[#5ED39A]/15 border border-[#5ED39A]/40 text-[#5ED39A] text-xs font-mono-num flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{redeemedRewardNotice}</span>
          </div>
        </div>
      )}

      {/* SUB-NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-[#C9A45C] text-[#050505] shadow-md shadow-[#C9A45C]/20'
                : 'text-[#888888] hover:text-white bg-white/5'
            }`}
          >
            Tier Privilege Matrix
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RENTALS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'RENTALS'
                ? 'bg-[#C9A45C] text-[#050505] shadow-md shadow-[#C9A45C]/20'
                : 'text-[#888888] hover:text-white bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Points Earned Per Rental</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono-num">
              {profile.records.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PERKS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PERKS'
                ? 'bg-[#C9A45C] text-[#050505] shadow-md shadow-[#C9A45C]/20'
                : 'text-[#888888] hover:text-white bg-white/5'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Privilege Perks Wallet</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleExportStatement}
          className="text-xs text-[#888888] hover:text-[#C9A45C] flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Download Rewards Statement"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Statement</span>
        </button>
      </div>

      {/* 3. TAB CONTENT: TIER PRIVILEGE MATRIX */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-num uppercase tracking-wider text-[#888888]">
              Tier Benefits & Discount Entitlements
            </span>
            <span className="text-[11px] text-[#C9A45C] font-mono-num">
              Click any tier to preview / simulate discounts in booking checkout
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['SILVER', 'GOLD', 'PLATINUM'] as RewardsTier[]).map(tKey => {
              const tierConf = REWARDS_TIERS[tKey];
              const isCurrent = effectiveTier === tKey;
              const isActualUnlocked = profile.totalPoints >= tierConf.minPoints;

              return (
                <div
                  key={tKey}
                  onClick={() => handleSimulateTier(tKey)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#15161C] border-[#C9A45C] shadow-xl shadow-[#C9A45C]/10 ring-1 ring-[#C9A45C]/40'
                      : 'bg-[#0E0F13] border-white/5 hover:border-white/20'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#C9A45C] text-[#050505] text-[10px] font-mono-num font-bold tracking-wider uppercase">
                      Active Tier
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${tierConf.accentHex}20` }}
                      >
                        <Crown className="w-4 h-4" style={{ color: tierConf.accentHex }} />
                      </div>
                      <div>
                        <h4 className="text-base font-luxury font-bold text-white">
                          {tierConf.name}
                        </h4>
                        <span className="text-[10px] font-mono-num text-[#888888]">
                          {tierConf.minPoints.toLocaleString()}+ Points Requirement
                        </span>
                      </div>
                    </div>

                    <div className="my-4 p-3 rounded-xl bg-black/40 border border-white/5 flex items-baseline justify-between">
                      <span className="text-xs text-[#AAAAAA]">Rental Discount:</span>
                      <span
                        className="text-2xl font-luxury font-bold"
                        style={{ color: tierConf.accentHex }}
                      >
                        {tierConf.discountPercent}% OFF
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs text-[#999999]">
                      {tierConf.perks.map((perk, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2
                            className="w-3.5 h-3.5 mt-0.5 shrink-0"
                            style={{ color: tierConf.accentHex }}
                          />
                          <span className="text-[11px] leading-relaxed">{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-5 mt-5 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-[#777777]">
                      {isActualUnlocked ? '✓ Status Earned' : 'Locked Tier'}
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: isCurrent ? tierConf.accentHex : '#888888' }}
                    >
                      {isCurrent ? 'Selected for Booking' : 'Click to Test'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: POINTS EARNED PER RENTAL */}
      {activeTab === 'RENTALS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-luxury text-white">Rental Points History</h4>
              <p className="text-xs text-[#888888]">
                Every completed journey earns 10 points per ₹100 spent plus luxury duration bonuses.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#111216] p-1 rounded-xl border border-white/5">
              {(['ALL', 'CREDITED', 'PENDING'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono-num font-semibold transition-colors cursor-pointer ${
                    filterType === f
                      ? 'bg-[#C9A45C] text-[#050505]'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  {f === 'ALL' ? 'All Records' : f === 'CREDITED' ? 'Credited' : 'Pending'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="p-12 text-center text-[#777777] bg-[#111216] rounded-2xl border border-white/5">
                <Car className="w-10 h-10 mx-auto text-[#333333] mb-2" />
                <p className="text-xs">No points records found in this category.</p>
              </div>
            ) : (
              filteredRecords.map(record => {
                const isCredited = record.status === 'CREDITED';
                const isDeduction = record.totalPoints < 0;

                return (
                  <div
                    key={record.id}
                    className="p-4 md:p-5 rounded-2xl bg-[#111216] border border-[#222227] hover:border-[#383842] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                          isDeduction
                            ? 'bg-[#E66A6A]/10 border-[#E66A6A]/30 text-[#E66A6A]'
                            : isCredited
                            ? 'bg-[#5ED39A]/10 border-[#5ED39A]/30 text-[#5ED39A]'
                            : 'bg-[#C9A45C]/10 border-[#C9A45C]/30 text-[#C9A45C]'
                        }`}
                      >
                        {isDeduction ? (
                          <Gift className="w-5 h-5" />
                        ) : isCredited ? (
                          <Award className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-semibold text-white">
                            {record.vehicleName}
                          </h5>
                          <span
                            className={`text-[9px] font-mono-num font-bold px-2 py-0.5 rounded-full uppercase ${
                              isCredited
                                ? 'bg-[#5ED39A]/15 text-[#5ED39A]'
                                : 'bg-[#C9A45C]/15 text-[#C9A45C]'
                            }`}
                          >
                            {isCredited ? 'Credited to Balance' : 'Pending Handover'}
                          </span>
                        </div>

                        <div className="text-xs text-[#888888] font-mono-num mt-1 flex flex-wrap items-center gap-2">
                          <span>Ref: {record.bookingId}</span>
                          <span>•</span>
                          <span>{record.rentalDate}</span>
                          {record.spendAmount > 0 && (
                            <>
                              <span>•</span>
                              <span>Spend: {formatCurrency(record.spendAmount)}</span>
                            </>
                          )}
                        </div>

                        <p className="text-[11px] text-[#777777] mt-1">{record.reason}</p>
                      </div>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <div
                        className={`text-lg font-mono-num font-bold ${
                          isDeduction
                            ? 'text-[#E66A6A]'
                            : isCredited
                            ? 'text-[#5ED39A]'
                            : 'text-[#C9A45C]'
                        }`}
                      >
                        {record.totalPoints > 0 ? `+${record.totalPoints.toLocaleString()}` : record.totalPoints.toLocaleString()}{' '}
                        <span className="text-xs">PTS</span>
                      </div>

                      {record.bonusPoints > 0 && (
                        <div className="text-[10px] font-mono-num text-[#888888]">
                          ({record.basePoints.toLocaleString()} Base + {record.bonusPoints.toLocaleString()} Bonus)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: PRIVILEGE PERKS WALLET */}
      {activeTab === 'PERKS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-luxury text-white">Instant Privilege Redemptions</h4>
              <p className="text-xs text-[#888888]">
                Redeem your earned points for complimentary vehicle upgrades, track telemetry, or airport amenities.
              </p>
            </div>
            <div className="text-xs font-mono-num text-[#C9A45C]">
              Available: <strong>{profile.totalPoints.toLocaleString()} PTS</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 'fuel-prime',
                title: 'Full Tank 98 Octane Fuel',
                desc: 'Complimentary full tank of premium high-octane fuel pre-primed at delivery.',
                cost: 2500,
                icon: Flame
              },
              {
                id: 'chauffeur-day',
                title: 'Chauffeur Upgrade (1 Day)',
                desc: 'White-glove chauffeur driver for 24 hours of executive luxury touring.',
                cost: 3000,
                icon: Crown
              },
              {
                id: 'vip-airport',
                title: 'VIP T2 Curbside Fast-Track',
                desc: 'Airport concierge curbside delivery with baggage assistance and terminal greeting.',
                cost: 1500,
                icon: Zap
              }
            ].map(perk => (
              <div
                key={perk.id}
                className="p-5 rounded-2xl bg-[#111216] border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#C9A45C]/15 border border-[#C9A45C]/30 flex items-center justify-center text-[#C9A45C] mb-3">
                    <perk.icon className="w-5 h-5" />
                  </div>
                  <h5 className="text-sm font-semibold text-white mb-1">{perk.title}</h5>
                  <p className="text-xs text-[#888888] leading-relaxed mb-4">{perk.desc}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-mono-num font-bold text-[#C9A45C]">
                    {perk.cost.toLocaleString()} PTS
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRedeemPerk(perk.title, perk.cost)}
                    className="py-1.5 px-3 rounded-lg bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Redeem Voucher
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
