import React, { useState } from 'react';
import { Sparkles, ArrowRight, Bot, Compass, Shield, Send, CheckCircle2, Star, Search, MapPin, Radio, MessageSquare } from 'lucide-react';
import { Vehicle, AiRecommendationResult } from '../types';

interface AiDriveAssistantProps {
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onBookVehicle: (vehicle: Vehicle) => void;
  onOpenGeminiAi?: (mode?: 'chat' | 'search' | 'maps' | 'voice') => void;
}

export const AiDriveAssistant: React.FC<AiDriveAssistantProps> = ({
  vehicles,
  onSelectVehicle,
  onBookVehicle,
  onOpenGeminiAi
}) => {
  const [selectedPurpose, setSelectedPurpose] = useState<string>('Weekend Escape');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [preferredCity, setPreferredCity] = useState<string>('Bangalore');
  const [customQuery, setCustomQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<AiRecommendationResult | null>({
    recommendedCarId: 'porsche-911-gt3',
    carName: 'Porsche 911 GT3 (992)',
    reasoning: 'Engineered for driver-focused performance with a howling 502HP naturally aspirated flat-six and telepathic 7-speed dual-clutch transmission.',
    routeTip: 'For your Bangalore escape, the early morning drive along the Mysore Expressway towards Coorg offers open multi-lane curves and pristine tarmac.',
    suggestedPackage: 'Zero-Depreciation Super Protection with 5G In-Car Wi-Fi',
    estimatedDailyBudget: 16999
  });

  const purposes = [
    { id: 'Weekend Escape', label: 'Weekend Escape', icon: '⚡' },
    { id: 'Business Trip', label: 'Business Milestone', icon: '💼' },
    { id: 'Date Night', label: 'Romantic Evening', icon: '✨' },
    { id: 'Wedding', label: 'Royal Wedding', icon: '👑' },
    { id: 'Road Trip', label: 'Coastal Road Trip', icon: '🌊' },
    { id: 'Performance', label: 'Track & Hill Dyno', icon: '🏁' }
  ];

  const handleGetRecommendation = async (purposeToUse?: string) => {
    setIsLoading(true);
    const purpose = purposeToUse || selectedPurpose;

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose,
          guests: guestCount,
          location: preferredCity,
          preferences: customQuery || 'Driver-focused luxury and refined aesthetics'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRecommendation(data);
      }
    } catch (err) {
      console.error('AI matchmaker fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const matchedVehicle = vehicles.find(v => v.id === recommendation?.recommendedCarId) || vehicles[0];

  return (
    <section id="ai-advisor" className="py-24 bg-[#060709] text-[#F5F5F5] border-t border-[#1C1D22]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A45C]/10 border border-[#C9A45C]/30 text-xs font-semibold uppercase tracking-wider text-[#C9A45C] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Powered Concierge & Matchmaker</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-luxury text-white mb-3">
            WHAT ARE YOU DRIVING FOR?
          </h2>
          <p className="text-sm text-[#888888] leading-relaxed">
            Tell our AI concierge your occasion, passengers, and route preferences. We will calculate the optimal automotive pairing and custom privileges.
          </p>
        </div>

        {/* Purpose Cards Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {purposes.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPurpose(p.id);
                handleGetRecommendation(p.id);
              }}
              className={`p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                selectedPurpose === p.id
                  ? 'bg-[#181920] border-[#C9A45C] text-white shadow-xl shadow-[#C9A45C]/20 scale-105'
                  : 'bg-[#0E0F14] border-[#222329] text-[#888888] hover:text-white hover:border-[#383944]'
              }`}
            >
              <span className="text-xl">{p.icon}</span>
              <span className="text-xs font-semibold uppercase tracking-wider">{p.label}</span>
            </button>
          ))}
        </div>

        {/* AI Result & Car Recommendation Card */}
        {recommendation && matchedVehicle && (
          <div className="p-6 md:p-8 bg-gradient-to-r from-[#121318] via-[#0E0F14] to-[#14151C] border border-[#2B2D38] rounded-3xl shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Recommendation Insights (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono-num font-semibold text-[#5ED39A]">
                  <CheckCircle2 className="w-4 h-4 text-[#5ED39A]" />
                  <span>AI MATCH SCORE: 99.4% FOR {selectedPurpose.toUpperCase()}</span>
                </div>

                <div className="text-xs font-mono-num uppercase tracking-wider text-[#C9A45C]">
                  PERFECT FOR YOUR {selectedPurpose.toUpperCase()}
                </div>

                <h3 className="text-3xl md:text-4xl font-luxury text-white">
                  {matchedVehicle.name}
                </h3>

                <p className="text-xs md:text-sm text-[#DDDDDD] leading-relaxed">
                  {recommendation.reasoning}
                </p>

                {/* Scenic Route Tip */}
                <div className="p-4 bg-[#090A0D] border border-white/5 rounded-xl space-y-1">
                  <div className="text-[10px] font-mono-num uppercase tracking-wider text-[#C9A45C] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Curated Route & Vibe Recommendation</span>
                  </div>
                  <p className="text-xs text-[#AAAAAA] leading-relaxed">
                    {recommendation.routeTip}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono-num text-[#888888]">
                  <span>Package: <strong className="text-white">{recommendation.suggestedPackage}</strong></span>
                  <span>·</span>
                  <span>Seats: <strong className="text-white">{matchedVehicle.seats}</strong></span>
                  <span>·</span>
                  <span>Power: <strong className="text-white">{matchedVehicle.horsepower} HP</strong></span>
                </div>
              </div>

              {/* Right: Quick Action & Price Card (5 cols) */}
              <div className="lg:col-span-5 p-6 bg-[#090A0D]/90 border border-[#222228] rounded-2xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#C9A45C] uppercase">Daily Privilege Rate</span>
                    <div className="flex items-center gap-1 text-xs text-[#C9A45C]">
                      <Star className="w-3.5 h-3.5 fill-[#C9A45C]" />
                      <span>{matchedVehicle.rating} / 5.0</span>
                    </div>
                  </div>
                  <div className="text-3xl font-luxury font-bold text-white font-mono-num">
                    ₹{matchedVehicle.dailyPrice.toLocaleString('en-IN')}
                    <span className="text-xs text-[#777777] font-normal"> / 24 hours</span>
                  </div>
                  <div className="text-[11px] text-[#777777] mt-1">
                    Refundable Deposit: ₹{matchedVehicle.securityDeposit.toLocaleString('en-IN')} · Free 24h Cancellation
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => onBookVehicle(matchedVehicle)}
                    className="w-full py-3.5 px-6 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#C9A45C]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Reserve {matchedVehicle.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectVehicle(matchedVehicle)}
                    className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  >
                    Inspect in 3D Showroom
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
