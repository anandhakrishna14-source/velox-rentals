import React from 'react';
import { ArrowRight, Compass, Sparkles, Key, Crown, Flame, Plane, HeartHandshake } from 'lucide-react';
import { Vehicle } from '../types';

interface ExperiencePillarsSectionProps {
  onSelectExperience: (categoryName: string) => void;
  onBookNow: () => void;
}

export const ExperiencePillarsSection: React.FC<ExperiencePillarsSectionProps> = ({
  onSelectExperience,
  onBookNow
}) => {
  const experiences = [
    {
      id: 'weekend',
      title: 'Weekend Escapes',
      subtitle: 'Porsche 911 GT3 (992) · 502 HP',
      desc: 'Unplug and carve scenic mountain passes or coastal state highways with pure 9,000 RPM motorsport acoustics.',
      icon: Flame,
      category: 'Sports',
      badge: 'POPULAR'
    },
    {
      id: 'performance',
      title: 'Track Performance Drives',
      subtitle: 'BMW M5 Competition · 617 HP M xDrive',
      desc: 'Uncompromising downforce and blistering acceleration for purist automotive connoisseurs.',
      icon: Compass,
      category: 'Performance',
      badge: 'TRACK BRED'
    },
    {
      id: 'continental',
      title: 'Continental Grand Touring',
      subtitle: 'Bentley Continental GT Speed · British Green',
      desc: 'Silk-smooth 650 HP W12 muscle with bespoke diamond quilted hides for interstate grand tours.',
      icon: Crown,
      category: 'Luxury',
      badge: 'CONTINENTAL'
    },
    {
      id: 'chauffeur',
      title: 'Royal Chauffeur Collection',
      subtitle: 'Rolls-Royce Ghost Extended · Sovereign V12',
      desc: 'Whisper-quiet sanctuary with starlight fiber optics and uniformed white-glove executive escort.',
      icon: HeartHandshake,
      category: 'Luxury',
      badge: 'PRESIDENTIAL'
    },
    {
      id: 'airport',
      title: 'VIP Airport Collection',
      subtitle: 'Toyota Fortuner & AMG A 35 Curbside',
      desc: 'Skip rental desks entirely. Your chosen vehicle waits curbside at Bangalore or Mumbai Airport as your flight touches down.',
      icon: Plane,
      category: 'Comfort',
      badge: 'AIRSIDE'
    }
  ];

  return (
    <section id="experiences" className="py-24 bg-[#050505] text-[#F5F5F5] border-t border-[#1C1D22]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Brand Kicker & Statement */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-wider text-[#C9A45C]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Driving Journeys</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-luxury text-white leading-tight">
            MORE THAN A RENTAL.
          </h2>

          <p className="text-base sm:text-lg text-[#CCCCCC] italic font-serif">
            "It's the road. The sound. The first turn. The feeling."
          </p>

          <p className="text-xs sm:text-sm text-[#888888] max-w-xl mx-auto leading-relaxed">
            Every booking is architected around an emotion. Choose your driving intention below to filter the optimal collection.
          </p>
        </div>

        {/* Experience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {experiences.map(exp => {
            const Icon = exp.icon;
            return (
              <div
                key={exp.id}
                onClick={() => onSelectExperience(exp.category)}
                className="group relative p-7 bg-[#0E0F14] border border-[#22232A] hover:border-[#C9A45C]/60 rounded-3xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#C9A45C]/10 border border-[#C9A45C]/20 flex items-center justify-center text-[#C9A45C] group-hover:bg-[#C9A45C] group-hover:text-[#050505] transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono-num font-bold tracking-widest text-[#C9A45C] bg-[#C9A45C]/10 px-2.5 py-1 rounded-full">
                      {exp.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-luxury font-bold text-white mb-1 group-hover:text-[#C9A45C] transition-colors">
                    {exp.title}
                  </h3>
                  <div className="text-xs text-[#C9A45C] font-mono-num mb-3">
                    {exp.subtitle}
                  </div>
                  <p className="text-xs text-[#888888] leading-relaxed mb-6">
                    {exp.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#AAAAAA] group-hover:text-white">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 text-[#C9A45C] transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
