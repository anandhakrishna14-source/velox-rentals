export type VehicleCategory = 'Sports' | 'Performance' | 'Luxury' | 'Comfort' | 'Luxury SUV';

export type FuelType = 'Petrol' | 'Twin-Turbo V8' | 'Hybrid V6' | 'Electric';

export type TransmissionType = 'Automatic' | 'Dual-Clutch PDK' | 'Sequential 8-Speed';

export interface VehicleColor {
  name: string;
  hex: string;
}

export interface VehicleReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  verifiedBooking: boolean;
}

export interface Vehicle {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: VehicleCategory;
  seats: number;
  transmission: TransmissionType;
  fuel: FuelType;
  horsepower: number;
  acceleration0To100: number; // in seconds
  topSpeed: number; // km/h
  drivetrain: 'Rear-Wheel Drive' | 'All-Wheel Drive' | 'Four-Wheel Drive' | 'Front-Wheel Drive';
  dailyPrice: number; // INR
  weekendPrice: number; // INR
  securityDeposit: number; // INR
  available: boolean;
  featured?: boolean;
  colors: VehicleColor[];
  imageUrl?: string;
  videoUrl?: string;
  features: string[];
  requirements: string[];
  description: string;
  rating: number;
  reviewsCount: number;
  reviews: VehicleReview[];
}

export type DriverOption = 'SELF_DRIVE' | 'WITH_DRIVER';

export type BookingStatus = 
  | 'PENDING' 
  | 'PAYMENT_PENDING' 
  | 'CONFIRMED' 
  | 'ACTIVE' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'REFUNDED';

export type PaymentStructure = 'FULL' | 'DEPOSIT';

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleCategory: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  durationDays: number;
  driverOption: DriverOption;
  driverFee: number;
  insuranceOption: 'STANDARD' | 'PREMIUM_ZERO_DEP';
  insuranceFee: number;
  baseRental: number;
  taxes: number;
  securityDeposit: number;
  total: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStructure: PaymentStructure;
  status: BookingStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  licenseNumber?: string;
  licenseVerified: boolean;
  createdAt: string;
}

export interface LocationOption {
  id: string;
  name: string;
  type: 'AIRPORT' | 'SHOWROOM' | 'HOTEL' | 'RESIDENCE';
  address: string;
  operatingHours: string;
  deliveryFee: number;
}

export interface PricingSettings {
  taxRate: number; // 0.18 for 18% GST
  insuranceDailyRate: number;
  driverDailyRate: number;
  weekendMultiplier: number;
  depositPercentage: number;
  cancellationHoursLimit: number;
}

export interface VehicleCondition {
  front: boolean;
  rear: boolean;
  leftSide: boolean;
  rightSide: boolean;
  interior: boolean;
  fuelPercent: number;
  odometerKm: number;
  notes?: string;
  inspectionPhotos?: string[];
  inspectedAt?: string;
  inspectorName?: string;
  customerSignature?: string;
}

export interface PickupDetails {
  pickupCode: string;
  terminalDetails: string;
  vehiclePlate: string;
  driverName?: string;
  driverRating?: number;
  driverPhone?: string;
  driverTrips?: number;
  directionsUrl?: string;
}

export interface FeedbackItem {
  id: string;
  author: string;
  location: string;
  carId: string;
  carName: string;
  rentalDurationDays: number;
  rating: number;
  date: string;
  comments: string;
  verifiedRental: boolean;
  suggestedFleet?: string;
  conciergeResponse?: string;
  sentiment?: 'positive' | 'constructive' | 'exceptional';
}

export interface AiRecommendationResult {
  recommendedCarId: string;
  carName?: string;
  reasoning: string;
  routeTip: string;
  suggestedPackage: string;
  estimatedDailyBudget?: number;
}

export type EmergencyIncidentType =
  | 'TIRE_BLOWOUT'
  | 'ENGINE_MECHANICAL'
  | 'BATTERY_ELECTRICAL'
  | 'COLLISION_ACCIDENT'
  | 'FUEL_FLUID_EMPTY'
  | 'MEDICAL_PERSONAL_SAFETY';

export type EmergencyStatus =
  | 'BROADCASTING'
  | 'DISPATCHED'
  | 'EN_ROUTE'
  | 'ON_SCENE'
  | 'RESOLVED'
  | 'CANCELLED';

export interface EmergencyIncident {
  id: string;
  bookingId?: string;
  vehicleName: string;
  incidentType: EmergencyIncidentType;
  incidentDescription: string;
  latitude?: number;
  longitude?: number;
  locationAddress: string;
  status: EmergencyStatus;
  reportedAt: string;
  etaMinutes: number;
  dispatcherName: string;
  dispatcherPhone: string;
  recoveryVehicle: string;
  liveSpeedKmH?: number;
  distanceKm?: number;
  replacementVehicleDispatched?: boolean;
}

export type RewardsTier = 'SILVER' | 'GOLD' | 'PLATINUM';

export interface RewardsTierConfig {
  tier: RewardsTier;
  name: string;
  minPoints: number;
  nextTierPoints: number | null;
  discountPercent: number; // 5%, 10%, 15%
  badgeColor: string;
  accentHex: string;
  perks: string[];
}

export interface RentalPointsRecord {
  id: string;
  bookingId: string;
  vehicleName: string;
  rentalDate: string;
  durationDays: number;
  spendAmount: number;
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  status: 'CREDITED' | 'PENDING';
  reason: string;
}

export interface RewardsProfile {
  clientName: string;
  email: string;
  phone: string;
  membershipId: string;
  memberSince: string;
  totalPoints: number;
  currentTier: RewardsTier;
  records: RentalPointsRecord[];
}


