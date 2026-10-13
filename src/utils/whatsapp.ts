/**
 * Velox Drive VIP Concierge WhatsApp Service
 * Direct inquiry line: +91 9633001939
 */

export const CONCIERGE_DISPLAY_PHONE = '+91 9633001939';
export const CONCIERGE_RAW_PHONE = '9633001939';
export const CONCIERGE_WA_NUMBER = '919633001939';

export interface WhatsAppEnquiryDetails {
  vehicleName?: string;
  category?: string;
  dailyPrice?: number;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  driverOption?: string;
  totalAmount?: string | number;
  currency?: 'INR' | 'USD';
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  bookingId?: string;
  customNote?: string;
  depositPaid?: boolean;
  depositAmount?: number;
  enquiryType?: 'FULL_ENQUIRY' | 'QUICK_QUOTE' | 'BOOKING_CONFIRMATION' | 'DIRECT_CHAT';
}

// Helper to get formatted default date (YYYY-MM-DD)
export function getUpcomingDateString(daysFromNow: number = 1): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export function buildWhatsAppEnquiryUrl(details: WhatsAppEnquiryDetails): string {
  const lines: string[] = [];

  // Autofill car name if not provided
  const carName = details.vehicleName || 'Porsche 911 GT3 (992)';
  
  // Autofill rental dates if not provided
  const effectivePickupDate = details.pickupDate || getUpcomingDateString(1);
  const effectiveReturnDate = details.returnDate || getUpcomingDateString(3);

  lines.push('👑 *VELOX DRIVE LUXURY FLEET — VIP ENQUIRY*');
  lines.push('----------------------------------------');

  if (details.bookingId) {
    lines.push(`🔖 *Booking Reference:* #${details.bookingId}`);
  }

  // Always autofill selected vehicle
  lines.push(`🏎️ *Vehicle Selected:* ${carName}${details.category ? ` (${details.category})` : ''}`);

  // Always autofill selected dates
  const pickupStr = `${effectivePickupDate}${details.pickupTime ? ` at ${details.pickupTime}` : ''}`;
  const returnStr = `${effectiveReturnDate}${details.returnTime ? ` at ${details.returnTime}` : ''}`;
  lines.push(`📅 *Rental Dates Selected:* ${pickupStr} ➔ ${returnStr}`);

  if (details.pickupLocation) {
    lines.push(`📍 *Pickup Hub:* ${details.pickupLocation}`);
  }

  if (details.dropoffLocation && details.dropoffLocation !== details.pickupLocation) {
    lines.push(`🏁 *Drop-off Hub:* ${details.dropoffLocation}`);
  }

  if (details.driverOption) {
    const driverLabel = details.driverOption === 'CHAUFFEUR' ? 'White-Glove Chauffeur' : 'Self-Drive';
    lines.push(`👔 *Drive Preference:* ${driverLabel}`);
  }

  if (details.totalAmount !== undefined && details.totalAmount !== null) {
    const curr = details.currency === 'USD' ? '$' : '₹';
    const amountStr = typeof details.totalAmount === 'number'
      ? `${curr}${details.totalAmount.toLocaleString('en-IN')}`
      : `${curr}${details.totalAmount}`;
    lines.push(`💰 *Total Amount:* ${amountStr}`);
  }

  if (details.depositPaid !== undefined) {
    const curr = details.currency === 'USD' ? '$' : '₹';
    const depStr = details.depositAmount
      ? `${curr}${details.depositAmount.toLocaleString('en-IN')}`
      : 'Initial Deposit';
    if (details.depositPaid) {
      lines.push(`💳 *First Deposit Status:* Received & Authorized (${depStr}) ✓ [BOOKING CONFIRMED]`);
    } else {
      lines.push(`⚠️ *First Deposit Status:* Pending (${depStr}) · Note: Booking confirmed only after first deposit payment`);
    }
  }

  if (details.customerName || details.customerPhone) {
    lines.push('----------------------------------------');
    if (details.customerName) lines.push(`👤 *Guest Name:* ${details.customerName}`);
    if (details.customerPhone) lines.push(`📞 *Contact:* ${details.customerPhone}`);
    if (details.customerEmail) lines.push(`✉️ *Email:* ${details.customerEmail}`);
  }

  if (details.customNote) {
    lines.push(`💬 *Special Request:* ${details.customNote}`);
  } else {
    lines.push('----------------------------------------');
    lines.push('✨ *Requirement:* Please confirm immediate availability, best quote, and VIP handover details.');
  }

  lines.push('----------------------------------------');
  lines.push('_Sent via Velox Drive Luxury Portal_');

  const text = lines.join('\n');
  return `https://wa.me/${CONCIERGE_WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function openWhatsAppEnquiry(details: WhatsAppEnquiryDetails): void {
  const url = buildWhatsAppEnquiryUrl(details);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
