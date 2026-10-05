import React from 'react';
import { ShieldCheck, Sparkles, Key, Compass, Award, Clock } from 'lucide-react';

export const ExperienceSection: React.FC = () => {
  const experiences = [
    {
      icon: Key,
      title: 'White-Glove Delivery',
      desc: 'Delivered curbside at VIP airport aviation terminals, 5-star hotel valets, or private residences with full tank and immaculately sanitized cabins.'
    },
    {
      icon: ShieldCheck,
      title: 'Zero-Depreciation Insurance',
      desc: 'Drive with total freedom. Comprehensive collision damage protection covering glass, wheels, and bodywork with zero customer deductible liability.'
    },
    {
      icon: Clock,
      title: '24/7 Dedicated Concierge',
      desc: 'Direct access to your assigned mobility specialist for bespoke route recommendations, emergency assistance, and reservations management.'
    },
    {
      icon: Compass,
      title: 'Unlimited Curated Routes',
      desc: 'Complimentary high-speed GPS guidance preloaded with the most picturesque coastal curves and open highway stretches across the region.'
    }
  ];

  return (
    <section id="experience-section" className="py-24 bg-[#090A0D] text-[#F5F5F5] border-t border-[#1C1D22]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#C9A45C] font-semibold mb-2">
              The Velox Standard
            </div>
            <h2 className="text-3xl md:text-5xl font-luxury text-white">
              Bespoke Service. <br />
              Uncompromising Quality.
            </h2>
          </div>
          <p className="text-sm md:text-base text-[#888888] max-w-md">
            We do not just rent cars; we orchestrate flawless motoring journeys tailored to discerning executives, collectors, and travellers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.map((exp, idx) => {
            const Icon = exp.icon;
            return (
              <div
                key={idx}
                className="p-8 bg-[#101116] border border-[#222329] hover:border-[#C9A45C]/50 rounded-2xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#C9A45C]/10 border border-[#C9A45C]/30 flex items-center justify-center mb-6 group-hover:bg-[#C9A45C] transition-colors">
                  <Icon className="w-6 h-6 text-[#C9A45C] group-hover:text-[#050505] transition-colors" />
                </div>
                <h3 className="text-xl font-luxury text-white mb-2">{exp.title}</h3>
                <p className="text-xs text-[#888888] leading-relaxed">{exp.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
