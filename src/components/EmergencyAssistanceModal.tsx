import React from 'react';
import { X, ShieldAlert, Radio } from 'lucide-react';
import { Booking } from '../types';
import { EmergencyAssistanceView } from './EmergencyAssistanceView';

interface EmergencyAssistanceModalProps {
  bookings: Booking[];
  activeBooking?: Booking | null;
  onClose: () => void;
}

export const EmergencyAssistanceModal: React.FC<EmergencyAssistanceModalProps> = ({
  bookings,
  activeBooking,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0C0D11] border border-[#381B1B] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#140A0A]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E66A6A] animate-ping" />
              <span className="text-xs uppercase tracking-widest text-[#E66A6A] font-bold">
                VELOX DRIVE · EMERGENCY ROADSIDE RESPONSE
              </span>
            </div>
            <span className="text-white/20">|</span>
            <span className="text-xs text-[#888888] font-mono-num">
              Priority Tier P1 Dispatch
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#888888] hover:text-white transition-colors cursor-pointer"
            aria-label="Close emergency modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <EmergencyAssistanceView
            activeBooking={activeBooking}
            allBookings={bookings}
            onClose={onClose}
            isStandaloneModal={true}
          />
        </div>
      </div>
    </div>
  );
};
