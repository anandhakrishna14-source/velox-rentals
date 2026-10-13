import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, AlertCircle, X, Check } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLoginModal: React.FC = () => {
  const { showLoginModal, closeLoginModal, login, pendingActionName } = useAdminAuth();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!showLoginModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the administrative key or PIN.');
      return;
    }

    const isValid = login(passcode);
    if (isValid) {
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        setSuccess(false);
        setPasscode('');
      }, 500);
    } else {
      setError('Invalid admin credentials. Please enter a valid security passcode.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={closeLoginModal}
    >
      <div
        className="relative w-full max-w-md bg-[#090A0E] border border-[#C9A45C]/40 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 0 50px rgba(201, 164, 92, 0.15)'
        }}
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#C9A45C]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeLoginModal}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close admin login modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#C9A45C]/15 border border-[#C9A45C]/40 flex items-center justify-center shadow-inner">
            <Lock className="w-6 h-6 text-[#C9A45C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-num uppercase tracking-widest text-[#C9A45C] font-semibold">
                RESTRICTED ACCESS
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-luxury font-bold text-white tracking-wide">
              Admin Login Required
            </h2>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs sm:text-sm text-[#AAAAAA] leading-relaxed mb-4">
          Uploading or changing vehicle media (hero videos, 3D turntable videos, and car photos) is reserved for authorized fleet administrators.
        </p>

        {pendingActionName && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate">
              Action pending: <strong>{pendingActionName}</strong>
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono-num uppercase tracking-wider text-[#C9A45C] mb-1.5 font-semibold">
              Admin Password / Security PIN
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter admin passcode"
                autoFocus
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-white/15 focus:border-[#C9A45C] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#C9A45C] transition-all tracking-wider font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-xs text-red-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Authentication successful! Unlocking controls...</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={closeLoginModal}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#CCCCCC] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#C9A45C]/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In as Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
