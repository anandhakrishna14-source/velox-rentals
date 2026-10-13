import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface FooterProps {
  onOpenMyBookings: () => void;
  onOpenAdmin: () => void;
  onBookNow: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenMyBookings,
  onOpenAdmin,
  onBookNow
}) => {
  const { requireAdmin } = useAdminAuth();
  return (
    <footer className="bg-[#030304] text-[#888888] border-t border-[#1C1D22] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          {/* Col 1 & 2: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-2xl font-luxury font-bold text-white tracking-tight">
              VELOX DRIVE
            </span>
            <p className="text-xs text-[#999999] max-w-sm leading-relaxed">
              DRIVE SOMETHING WORTH REMEMBERING. Premium cars, flexible rentals, and exceptional experiences across premier destinations.
            </p>
            <div className="text-[11px] text-[#666666] pt-2 flex items-center gap-2">
              <span>Dedicated VIP Concierge · 24/7 Premium Handover Operations</span>
            </div>
          </div>

          {/* Col 3: Fleet */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-white">
              The Fleet
            </div>
            <ul className="text-xs space-y-2">
              <li>
                <a href="#fleet-section" className="hover:text-[#C9A45C] transition-colors">
                  Porsche 911 GT3 (992)
                </a>
              </li>
              <li>
                <a href="#fleet-section" className="hover:text-[#C9A45C] transition-colors">
                  Rolls-Royce Ghost Extended
                </a>
              </li>
              <li>
                <a href="#fleet-section" className="hover:text-[#C9A45C] transition-colors">
                  Bentley Continental GT Speed
                </a>
              </li>
              <li>
                <a href="#fleet-section" className="hover:text-[#C9A45C] transition-colors">
                  BMW M5 Competition (F90)
                </a>
              </li>
              <li>
                <a href="#fleet-section" className="hover:text-[#C9A45C] transition-colors">
                  Toyota Fortuner Legender 4x4
                </a>
              </li>
              <li>
                <a href="#fleet-section" className="hover:text-[#C9A45C] transition-colors">
                  Mercedes-AMG A 35 4MATIC+
                </a>
              </li>
              <li>
                <a href="#fleet-section" className="hover:text-[#C9A45C] transition-colors">
                  MINI Cooper S (3-Door)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Services */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-white">
              Privileges
            </div>
            <ul className="text-xs space-y-2">
              <li>
                <button onClick={onBookNow} className="hover:text-[#C9A45C] transition-colors text-left cursor-pointer">
                  Reserve Online
                </button>
              </li>
              <li>
                <a href="#experience-section" className="hover:text-[#C9A45C] transition-colors">
                  Chauffeur Escort
                </a>
              </li>
              <li>
                <a href="#experience-section" className="hover:text-[#C9A45C] transition-colors">
                  Airport VIP Curbside
                </a>
              </li>
              <li>
                <button onClick={onOpenMyBookings} className="hover:text-[#C9A45C] transition-colors text-left cursor-pointer">
                  Client Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => requireAdmin(onOpenAdmin, 'Open Admin Management')}
                  className="hover:text-[#C9A45C] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <span>Admin Management</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Policy */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-white">
              Integrity & Trust
            </div>
            <ul className="text-xs space-y-2">
              <li className="hover:text-[#C9A45C] cursor-pointer">Zero-Dep Insurance Policy</li>
              <li className="hover:text-[#C9A45C] cursor-pointer">24-Hour Free Cancellation</li>
              <li className="hover:text-[#C9A45C] cursor-pointer">Privacy & Document Policy</li>
              <li className="hover:text-[#C9A45C] cursor-pointer">Terms of Rental Agreement</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666666]">
          <div>
            © {new Date().getFullYear()} Velox Drive Luxury Rentals Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Encrypted Tokenization</span>
            <span>·</span>
            <span>Zero Data Selling</span>
            <span>·</span>
            <span>WCAG 2.2 AA Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
