import { RewardsTier, RewardsTierConfig, RentalPointsRecord, RewardsProfile, Booking } from '../types';

export const REWARDS_TIERS: Record<RewardsTier, RewardsTierConfig> = {
  SILVER: {
    tier: 'SILVER',
    name: 'Silver Club',
    minPoints: 0,
    nextTierPoints: 5000,
    discountPercent: 5,
    badgeColor: 'from-[#94A3B8] via-[#E2E8F0] to-[#64748B]',
    accentHex: '#E2E8F0',
    perks: [
      '5% Exclusive Member Discount on all vehicle rentals',
      'Priority terminal airport pickup & handover',
      'Complimentary premium interior ozone sanitization',
      'Earn 10 points per ₹100 spend on every journey'
    ]
  },
  GOLD: {
    tier: 'GOLD',
    name: 'Gold VIP',
    minPoints: 5000,
    nextTierPoints: 15000,
    discountPercent: 10,
    badgeColor: 'from-[#DFBD78] via-[#FFE082] to-[#A37B2C]',
    accentHex: '#C9A45C',
    perks: [
      '10% Exclusive VIP Discount on all vehicle rentals',
      'Free additional driver waiver (saves ₹500/day)',
      'Flexible cancellation up to 12 hours before pickup',
      'Complimentary 2-hour grace period on return check-in',
      'Priority hotline access to senior concierge dispatch'
    ]
  },
  PLATINUM: {
    tier: 'PLATINUM',
    name: 'Platinum Elite',
    minPoints: 15000,
    nextTierPoints: null,
    discountPercent: 15,
    badgeColor: 'from-[#BAE6FD] via-[#E0F2FE] to-[#7DD3FC]',
    accentHex: '#38BDF8',
    perks: [
      '15% Top-Tier Elite Discount on all vehicle rentals',
      'Zero security deposit requirement (100% VIP waiver)',
      'Dedicated 24/7 VIP Personal Concierge officer',
      'Complimentary enclosed flatbed delivery to your doorstep',
      'First priority access to newly arrived track & exotic hypercars'
    ]
  }
};

/**
 * Calculates points earned for a rental
 */
export function calculateRentalPoints(
  spendAmount: number,
  durationDays: number,
  isExoticOrSports: boolean = true
): { basePoints: number; bonusPoints: number; totalPoints: number } {
  // 10 points per ₹100 spent
  const basePoints = Math.round((spendAmount * 0.1));
  // Bonus: +500 for sports/exotics, +300 for 3+ days
  const bonusPoints = (isExoticOrSports ? 500 : 200) + (durationDays >= 3 ? 350 : 0);
  return {
    basePoints,
    bonusPoints,
    totalPoints: basePoints + bonusPoints
  };
}

/**
 * Derives current tier from points
 */
export function getTierFromPoints(points: number): RewardsTier {
  if (points >= 15000) return 'PLATINUM';
  if (points >= 5000) return 'GOLD';
  return 'SILVER';
}

/**
 * Progress calculation towards next level
 */
export function getTierProgress(points: number): {
  currentTier: RewardsTier;
  nextTier: RewardsTier | null;
  progressPercent: number;
  pointsNeeded: number;
  tierMin: number;
  tierTarget: number;
} {
  const currentTier = getTierFromPoints(points);

  if (currentTier === 'PLATINUM') {
    return {
      currentTier,
      nextTier: null,
      progressPercent: 100,
      pointsNeeded: 0,
      tierMin: 15000,
      tierTarget: 15000
    };
  }

  if (currentTier === 'GOLD') {
    const tierMin = 5000;
    const tierTarget = 15000;
    const range = tierTarget - tierMin; // 10,000
    const pointsInRange = Math.max(0, points - tierMin);
    const progressPercent = Math.min(100, Math.round((pointsInRange / range) * 100));
    const pointsNeeded = Math.max(0, tierTarget - points);
    return {
      currentTier,
      nextTier: 'PLATINUM',
      progressPercent,
      pointsNeeded,
      tierMin,
      tierTarget
    };
  }

  // SILVER
  const tierMin = 0;
  const tierTarget = 5000;
  const progressPercent = Math.min(100, Math.round((points / tierTarget) * 100));
  const pointsNeeded = Math.max(0, tierTarget - points);
  return {
    currentTier,
    nextTier: 'GOLD',
    progressPercent,
    pointsNeeded,
    tierMin,
    tierTarget
  };
}

/**
 * Generates initial rewards profile from existing client bookings
 */
export function getInitialRewardsProfile(bookings: Booking[] = []): RewardsProfile {
  // Built-in initial history for client Rahul K.
  const welcomeBonusRecord: RentalPointsRecord = {
    id: 'REW-WEL-001',
    bookingId: 'MEMBERSHIP-WELCOME',
    vehicleName: 'Velox Welcome Privilege Grant',
    rentalDate: '2026-09-15',
    durationDays: 0,
    spendAmount: 0,
    basePoints: 1000,
    bonusPoints: 0,
    totalPoints: 1000,
    status: 'CREDITED',
    reason: 'VIP Membership Activation Bonus'
  };

  const pastBookingRecord: RentalPointsRecord = {
    id: 'REW-PAST-002',
    bookingId: 'VLX-2026-6410',
    vehicleName: 'BMW M5 Competition (F90)',
    rentalDate: '2026-09-22',
    durationDays: 2,
    spendAmount: 42000,
    basePoints: 4200,
    bonusPoints: 500,
    totalPoints: 4700,
    status: 'CREDITED',
    reason: 'Weekend Escape to Chikmagalur'
  };

  // Convert current confirmed/active bookings to points records
  const dynamicRecords: RentalPointsRecord[] = bookings.map((b, idx) => {
    const isSports = b.vehicleCategory === 'Sports' || b.vehicleCategory === 'Luxury';
    const pts = calculateRentalPoints(b.total, b.durationDays, isSports);
    return {
      id: `REW-${b.id || idx}`,
      bookingId: b.id,
      vehicleName: b.vehicleName,
      rentalDate: b.pickupDate,
      durationDays: b.durationDays,
      spendAmount: b.total,
      basePoints: pts.basePoints,
      bonusPoints: pts.bonusPoints,
      totalPoints: pts.totalPoints,
      status: b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'CREDITED' : 'PENDING',
      reason: `${b.durationDays} Days Rental · ${b.pickupLocation.split('(')[0].trim()}`
    };
  });

  const allRecords = [welcomeBonusRecord, pastBookingRecord, ...dynamicRecords];

  // Sum credited points
  const totalPoints = allRecords
    .filter(r => r.status === 'CREDITED')
    .reduce((sum, r) => sum + r.totalPoints, 0);

  const currentTier = getTierFromPoints(totalPoints);

  return {
    clientName: 'Rahul K.',
    email: 'rahul.k@example.com',
    phone: '+91 98201 44821',
    membershipId: 'VLX-ELITE-88402',
    memberSince: 'September 2026',
    totalPoints,
    currentTier,
    records: allRecords
  };
}
