import React, { useState, useEffect } from 'react';
import { Search, Heart, User, ShieldAlert, Menu, X, ArrowRight, Scale, ShieldCheck, Radio, Crown, Lock, Sparkles, LogIn } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currency: 'INR' | 'USD';
  wishlistCount: number;
  compareCount: number;
  onToggleCurrency: () => void;
  onOpenMyBookings: () => void;
  onOpenEmergency?: () => void;
  onOpenAdmin: () => void;
  onOpenCompare: () => void;
  onBookNow: () => void;
  onOpenAuth?: () => void;
  onOpenGeminiAi?: (mode?: 'chat' | 'search' | 'maps' | 'voice') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  wishlistCount,
  compareCount,
  onToggleCurrency,
  onOpenMyBookings,
  onOpenEmergency,
  onOpenAdmin,
  onOpenCompare,
  onBookNow,
  onOpenAuth,
  onOpenGeminiAi
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const { isAdmin, requireAdmin, logout } = useAdminAuth();
  const { user, userProfile } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'h-16 bg-[#050505]/85 backdrop-blur-xl border-b border-[#24252D] shadow-2xl'
          : 'h-20 bg-[#050505]/95 backdrop-blur-md border-b border-[#1C1D22]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Zone 1: Single Text Element Wordmark */}
        <a
          href="#top"
          className="text-xl md:text-2xl font-luxury font-bold tracking-tight text-white hover:text-[#C9A45C] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span>VELOX DRIVE</span>
        </a>

        {/* Zone 2: 4-6 Clean Text Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-widest text-[#999999]">
          <a href="#fleet-section" className="hover:text-white transition-colors">
            Cars
          </a>
          <a href="#experiences" className="hover:text-white transition-colors">
            Experiences
          </a>
          <a href="#assembly-section" className="hover:text-white transition-colors">
            3D Assembly
          </a>
          <a href="#how-it-works-section" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#trust-center" className="hover:text-white transition-colors">
            Trust Center
          </a>
          <a href="#feedback-section" className="hover:text-white transition-colors">
            Reviews
          </a>
        </nav>

        {/* Zone 3: 1-2 Primary Actions & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Currency Switcher */}
          <button
            onClick={onToggleCurrency}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 text-xs text-[#CCCCCC] hover:text-white transition-colors cursor-pointer"
            title="Switch Currency"
          >
            <span className="font-mono-num font-semibold">{currency === 'INR' ? '₹ INR' : '$ USD'}</span>
          </button>

          {/* Compare Indicator */}
          {compareCount > 0 && (
            <button
              onClick={onOpenCompare}
              className="p-2 rounded-lg bg-[#C9A45C]/15 border border-[#C9A45C]/50 text-[#C9A45C] hover:bg-[#C9A45C]/25 transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="Compare Vehicles"
            >
              <Scale className="w-4 h-4" />
              <span className="font-mono-num font-bold">{compareCount}</span>
            </button>
          )}

          {/* 24/7 Roadside SOS Button */}
          {onOpenEmergency && (
            <button
              onClick={onOpenEmergency}
              className="p-2 rounded-lg bg-[#E66A6A]/15 hover:bg-[#E66A6A]/25 border border-[#E66A6A]/40 text-[#E66A6A] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="24/7 Emergency Assistance & Roadside Distress Beacon"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline font-mono-num">SOS</span>
            </button>
          )}

          {/* Gemini AI Intelligence Suite Launcher */}
          {onOpenGeminiAi && (
            <button
              type="button"
              onClick={() => onOpenGeminiAi('chat')}
              className="p-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#C9A45C]/15 hover:bg-[#C9A45C]/25 border border-[#C9A45C]/40 text-[#C9A45C] text-xs font-mono-num font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Open Gemini AI Intelligence Suite (Chatbot, Search, Maps & Live Voice)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A45C] animate-pulse" />
              <span className="hidden md:inline">Gemini AI</span>
            </button>
          )}

          {/* Firebase Auth Account Button */}
          {user ? (
            <button
              type="button"
              onClick={onOpenAuth}
              className="p-1.5 sm:px-2.5 sm:py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-[#5ED39A]/40 text-white transition-colors cursor-pointer flex items-center gap-2"
              title={`Logged in as ${user.email}`}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'VIP'} className="w-4 h-4 rounded-full" />
              ) : (
                <User className="w-3.5 h-3.5 text-[#5ED39A]" />
              )}
              <span className="hidden sm:inline text-xs font-semibold truncate max-w-[90px]">
                {userProfile?.displayName?.split(' ')[0] || user.displayName?.split(' ')[0] || 'VIP'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#5ED39A]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="p-1.5 sm:px-3 sm:py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-[#CCCCCC] hover:text-[#C9A45C] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              title="Sign in with Google / Firebase Auth"
            >
              <LogIn className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span className="hidden sm:inline font-mono-num text-[11px]">Sign In</span>
            </button>
          )}

          {/* Client Account / Velox Rewards Profile */}
          <button
            onClick={onOpenMyBookings}
            className="p-1.5 sm:px-2.5 sm:py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#CCCCCC] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            title="Velox Rewards & Client Profile"
            aria-label="My Account & Rewards"
          >
            <Crown className="w-3.5 h-3.5 text-[#C9A45C]" />
            <span className="hidden sm:inline text-xs font-semibold text-[#DFBD78]">Gold VIP</span>
            <span className="hidden xl:inline text-[11px] text-[#888888] font-mono-num">• 10% Off</span>
          </button>

          {/* Admin switch & status indicator */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5 p-1 px-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40">
              <button
                type="button"
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-white cursor-pointer transition-colors"
                title="Open Fleet Admin Console"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline font-mono-num font-bold text-[11px] tracking-wider text-emerald-300">
                  ADMIN
                </span>
              </button>
              <span className="text-white/20">|</span>
              <button
                type="button"
                onClick={logout}
                className="text-[10px] text-white/50 hover:text-white underline cursor-pointer transition-colors font-mono-num"
                title="Logout of Admin Mode"
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => requireAdmin(onOpenAdmin, 'Open Fleet Admin Console')}
              className="p-2 rounded-lg bg-white/5 hover:bg-black/80 border border-white/10 hover:border-amber-500/40 text-[#888888] hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              title="Admin Login & Fleet Console"
              aria-label="Admin Console"
            >
              <ShieldAlert className="w-4 h-4" />
              <Lock className="w-2.5 h-2.5 text-amber-400" />
            </button>
          )}

          {/* Primary Book CTA */}
          <button
            onClick={onBookNow}
            className="py-2 px-5 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] text-xs font-bold tracking-wider uppercase rounded-lg shadow-md shadow-[#C9A45C]/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            Book Now
          </button>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="lg:hidden p-2 rounded-lg bg-white/5 text-[#CCCCCC] hover:text-white"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0B0E] border-b border-[#222222] px-6 py-6 space-y-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-3 text-sm font-semibold uppercase tracking-wider text-[#999999]">
            <a
              href="#fleet-section"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white border-b border-white/5"
            >
              The Fleet
            </a>
            <a
              href="#experiences"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white border-b border-white/5"
            >
              Experiences
            </a>
            <a
              href="#assembly-section"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white border-b border-white/5"
            >
              3D Sports Car Assembly
            </a>
            <a
              href="#trust-center"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white border-b border-white/5"
            >
              Trust Center
            </a>
            <a
              href="#feedback-section"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white border-b border-white/5"
            >
              Reviews & Suggestions
            </a>
          </nav>

          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              onClick={onToggleCurrency}
              className="px-3 py-2 rounded-lg border border-white/10 text-xs text-white"
            >
              Currency: {currency}
            </button>
            {onOpenEmergency && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenEmergency();
                }}
                className="px-3 py-2 rounded-lg bg-[#E66A6A]/15 border border-[#E66A6A]/40 text-xs text-[#E66A6A] font-bold flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>SOS Help</span>
              </button>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMyBookings();
              }}
              className="px-3 py-2 rounded-lg bg-[#C9A45C]/15 border border-[#C9A45C]/30 text-xs font-semibold text-[#DFBD78] flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>Rewards & Profile</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
