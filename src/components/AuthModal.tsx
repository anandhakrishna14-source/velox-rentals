import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User as UserIcon, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, userProfile, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    if (isSignUp && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (isSignUp) {
        await signUpWithEmail(email, password, fullName);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#090A0E] border border-[#C9A45C]/40 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 0 50px rgba(201, 164, 92, 0.15)' }}
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#C9A45C]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* If already authenticated, show user profile card */}
        {user ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#C9A45C]/20 border border-[#C9A45C] flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-6 h-6 text-[#C9A45C]" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono-num uppercase tracking-wider text-[#5ED39A] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED VIP CLIENT
                </span>
                <h3 className="text-lg font-luxury font-bold text-white">
                  {userProfile?.displayName || user.displayName || 'VIP Member'}
                </h3>
                <p className="text-xs text-[#888888]">{user.email}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 mb-6 space-y-2 text-xs">
              <div className="flex justify-between text-[#AAAAAA]">
                <span>Account Status:</span>
                <span className="text-[#C9A45C] font-semibold">Priority Concierge Tier</span>
              </div>
              <div className="flex justify-between text-[#AAAAAA]">
                <span>Cloud Sync:</span>
                <span className="text-[#5ED39A] font-semibold">Firestore Active</span>
              </div>
              <div className="flex justify-between text-[#AAAAAA]">
                <span>Firebase UID:</span>
                <span className="font-mono-num text-[11px] text-white/70">{user.uid.slice(0, 12)}...</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await signOut();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[#C9A45C]/15 border border-[#C9A45C]/40 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-6 h-6 text-[#C9A45C]" />
              </div>
              <div>
                <span className="text-[11px] font-mono-num uppercase tracking-widest text-[#C9A45C] font-semibold">
                  VELOX DRIVE VIP ACCESS
                </span>
                <h2 className="text-lg sm:text-xl font-luxury font-bold text-white tracking-wide">
                  {isSignUp ? 'Create Client Account' : 'Client Authentication'}
                </h2>
              </div>
            </div>

            {/* Google One-Click Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-[#1F1F1F] font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer mb-4"
            >
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#090A0E] px-2 text-[10px] uppercase font-mono-num text-[#888888]">
                or email credentials
              </span>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {isSignUp && (
                <div>
                  <label className="block text-[10px] font-mono-num uppercase tracking-wider text-[#C9A45C] mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Adrian Vance"
                      className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/15 focus:border-[#C9A45C] rounded-xl text-xs text-white placeholder-white/30 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono-num uppercase tracking-wider text-[#C9A45C] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@luxury.com"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/15 focus:border-[#C9A45C] rounded-xl text-xs text-white placeholder-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono-num uppercase tracking-wider text-[#C9A45C] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/15 focus:border-[#C9A45C] rounded-xl text-xs text-white placeholder-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#C9A45C]/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>{isSignUp ? 'Create VIP Account' : 'Sign In to Account'}</span>
              </button>
            </form>

            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-xs text-[#C9A45C] hover:underline cursor-pointer"
              >
                {isSignUp ? 'Already registered? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
