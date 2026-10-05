import React from 'react';
import { ShieldCheck, Lock, UserCheck, DollarSign, LifeBuoy, FileText, CheckCircle2 } from 'lucide-react';

export const TrustCenterSection: React.FC = () => {
  const trustPoints = [
    {
      icon: ShieldCheck,
      title: 'Verified Fleet Audit',
      desc: 'Every vehicle undergoes a 150-point diagnostic inspection, factory fluid renewal, and laser alignment prior to every handover.'
    },
    {
      icon: Lock,
      title: 'Tokenized Secure Payments',
      desc: 'We never store card numbers or banking passwords. All settlements are processed through Level 1 PCI-DSS tokenized gateways.'
    },
    {
      icon: UserCheck,
      title: 'Verified Chauffeurs',
      desc: 'All professional chauffeurs are police background-verified, commercially licensed, defensive-driving certified, and bilingual.'
    },
    {
      icon: DollarSign,
      title: 'Transparent Deposits',
      desc: 'No arbitrary deductions or delays. Pre-authorized deposits are auto-released within 24–48 hours following standard return inspection.'
    },
    {
      icon: LifeBuoy,
      title: '24/7 Roadside Assistance',
      desc: 'Dedicated rapid-response flatbed trucks and replacement performance vehicles stationed across all operating territories.'
    },
    {
      icon: FileText,
      title: 'Digital Rental Agreement',
      desc: 'Encrypted digital contracts with explicit terms, zero fine-print surprises, and instant email receipts generated for tax filings.'
    }
  ];

  return (
    <section id="trust-center" className="py-24 bg-[#08090C] text-[#F5F5F5] border-t border-[#1C1D22]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs uppercase tracking-[0.25em] text-[#C9A45C] font-semibold mb-2">
            Absolute Integrity & Transparency
          </div>
          <h2 className="text-3xl md:text-5xl font-luxury text-white mb-4">
            DRIVE WITH CONFIDENCE.
          </h2>
          <p className="text-sm text-[#888888] leading-relaxed">
            The foundation of luxury mobility is trust. Here is how Velox Drive protects your security, privacy, and peace of mind on every journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustPoints.map((pt, i) => {
            const Icon = pt.icon;
            return (
              <div
                key={i}
                className="p-6 bg-[#0E0F14] border border-[#222329] rounded-2xl flex flex-col justify-between hover:border-[#C9A45C]/40 transition-colors"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#C9A45C]/10 border border-[#C9A45C]/30 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#C9A45C]" />
                  </div>
                  <h3 className="text-lg font-luxury font-bold text-white mb-2">
                    {pt.title}
                  </h3>
                  <p className="text-xs text-[#888888] leading-relaxed">
                    {pt.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-[#5ED39A]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Velox Standard Compliant</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
