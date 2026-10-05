import React from 'react';
import { Eye, FileCheck, KeyRound, ArrowRight } from 'lucide-react';

interface HowItWorksSectionProps {
  onBookNow: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onBookNow }) => {
  const steps = [
    {
      num: '01',
      title: 'Inspect & Select in 3D',
      desc: 'Explore our fleet using the interactive 360° virtual showroom. View horsepower, acceleration figures, and tactile interior features before booking.',
      icon: Eye
    },
    {
      num: '02',
      title: 'Digital Verification & Reservation',
      desc: 'Verify your driving credentials via our automated, privacy-first OCR engine in under 60 seconds. Choose between 100% full payment or a flexible 20% advance deposit.',
      icon: FileCheck
    },
    {
      num: '03',
      title: 'White-Glove Handover',
      desc: 'Your vehicle arrives showroom-detailed with a full tank at your private aviation terminal, hotel valet, or doorstep. Sign digital handover and ignite the engine.',
      icon: KeyRound
    }
  ];

  return (
    <section id="how-it-works-section" className="py-24 bg-[#050505] text-[#F5F5F5] border-t border-[#1C1D22]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs uppercase tracking-[0.25em] text-[#C9A45C] font-semibold mb-2">
            Seamless Journey
          </div>
          <h2 className="text-3xl md:text-5xl font-luxury text-white mb-4">
            HOW IT WORKS
          </h2>
          <p className="text-sm text-[#888888]">
            Three effortless steps between you and the open road.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="relative p-8 bg-[#0D0E12] border border-[#222329] rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-luxury font-bold text-[#C9A45C]/40 font-mono-num">
                      {st.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#C9A45C]" />
                    </div>
                  </div>

                  <h3 className="text-xl font-luxury text-white mb-3">{st.title}</h3>
                  <p className="text-xs text-[#888888] leading-relaxed mb-6">{st.desc}</p>
                </div>

                <div className="text-[11px] font-mono-num text-[#555555]">
                  STEP {st.num} · AVERAGE TIME: {i === 0 ? '2 MIN' : i === 1 ? '1 MIN' : 'CURBSIDE'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={onBookNow}
            className="py-3.5 px-8 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#C9A45C]/20 inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Begin Your Reservation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
