import React, { useState } from 'react';
import { ChevronDown, Phone, Mail, MapPin, ShieldCheck, Clock, MessageSquare } from 'lucide-react';
import { openWhatsAppEnquiry } from '../utils/whatsapp';

export const AboutSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'When is my luxury reservation officially confirmed?',
      a: 'Your booking is confirmed only after the first deposit payment (20% advance booking deposit or 100% full settlement) is successfully authorized. Unpaid holds remain tentative for a 30-minute grace window before vehicle dates are released back to our fleet availability.'
    },
    {
      q: 'How does the refundable security deposit work?',
      a: 'The security deposit is temporarily pre-authorized on your credit or debit card at the time of booking. Upon vehicle inspection at drop-off, the authorization is released automatically within 24–48 hours, provided no municipal traffic violations were incurred.'
    },
    {
      q: 'What are the minimum age and driving licence requirements?',
      a: 'For luxury models (Toyota Fortuner Legender, Mercedes-AMG A 35, MINI Cooper S), drivers must be at least 21 years old and hold a valid full driving license for a minimum of 2 years. For exotic and sovereign models like the Porsche 911 GT3, Rolls-Royce Ghost Extended, Bentley Continental GT Speed, and BMW M5 Competition, the minimum age is 23–24. International visitors may present an International Driving Permit (IDP) alongside their national licence.'
    },
    {
      q: 'Can I choose between Self-Drive and an Executive Chauffeur?',
      a: 'Yes. Every vehicle can be booked either for pure self-drive or accompanied by a professional, uniformed chauffeur. If opting for a chauffeur, licence verification is waived, and all parking, routing, and fueling logistics are handled on your behalf.'
    },
    {
      q: 'What is your cancellation and rescheduling policy?',
      a: 'We offer full 100% refunds on all reservations cancelled at least 24 hours prior to your scheduled handover time. Rescheduling dates within a 6-month window is complimentary and can be performed directly through your client portal.'
    },
    {
      q: 'Where can the car be delivered?',
      a: 'We provide complimentary curbside delivery to Mumbai T2 VIP arrivals, our BKC Signature Pavilion, luxury partner hotels (Taj Mahal Palace, St. Regis, Four Seasons), or direct private doorstep delivery across the metropolitan territory.'
    }
  ];

  return (
    <section id="about-section" className="py-24 bg-[#08090C] text-[#F5F5F5] border-t border-[#1C1D22]">
      <div className="max-w-7xl mx-auto px-6">
        {/* About Brand Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs uppercase tracking-[0.25em] text-[#C9A45C] font-semibold">
              Heritage of Excellence
            </div>
            <h2 className="text-3xl md:text-5xl font-luxury text-white leading-tight">
              Crafted for Those Who Value the Journey.
            </h2>
            <p className="text-sm md:text-base text-[#AAAAAA] leading-relaxed">
              Founded on the belief that travel should be an emotional experience, Velox Drive curates an elite fleet of sports coupes, performance grand tourers, and executive SUVs.
            </p>
            <p className="text-sm text-[#888888] leading-relaxed">
              Each vehicle in our collection represents a benchmark in performance, engineering, and craftsmanship. Supported by our 24/7 dedicated concierge and transparent zero-depreciation coverage, every drive is an occasion worth remembering.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <div className="text-2xl font-luxury font-bold text-[#C9A45C]">100%</div>
                <div className="text-xs text-[#777777] mt-0.5">Showroom Condition Fleet</div>
              </div>
              <div>
                <div className="text-2xl font-luxury font-bold text-[#C9A45C]">&lt; 60 Sec</div>
                <div className="text-xs text-[#777777] mt-0.5">Automated Digital Approval</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 p-8 bg-[#111216] border border-[#24252D] rounded-2xl space-y-6">
            <h3 className="text-xl font-luxury text-white">Concierge & VIP Enquiries</h3>
            <p className="text-xs text-[#888888]">
              Have bespoke requirements, interstate touring plans, or wedding motorcade requests? Speak directly with our head of client relations.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 text-[#CCCCCC]">
                <Phone className="w-4 h-4 text-[#C9A45C]" />
                <span>Dedicated 24/7 VIP Concierge Hotline</span>
              </div>
              <div className="flex items-center gap-3 text-[#CCCCCC]">
                <Mail className="w-4 h-4 text-[#C9A45C]" />
                <span>concierge@veloxdrive.com</span>
              </div>
              <div className="flex items-center gap-3 text-[#CCCCCC]">
                <MapPin className="w-4 h-4 text-[#C9A45C]" />
                <span>Grand Pavilion Towers, Financial District, BKC, Mumbai 400051</span>
              </div>
              <div className="flex items-center gap-3 text-[#CCCCCC]">
                <Clock className="w-4 h-4 text-[#C9A45C]" />
                <span>Operating 24 Hours / 365 Days a Year</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openWhatsAppEnquiry({
                enquiryType: 'DIRECT_CHAT',
                customNote: 'VIP Concierge Enquiry: Requesting consultation for bespoke luxury car rental requirements.'
              })}
              className="w-full py-3 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 hover:border-emerald-500 text-emerald-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <MessageSquare className="w-4 h-4 text-[#5ED39A]" />
              <span>Connect on WhatsApp VIP</span>
            </button>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.25em] text-[#C9A45C] font-semibold mb-2">
              Common Questions
            </div>
            <h3 className="text-2xl md:text-4xl font-luxury text-white">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-[#222226] bg-[#0E0F13] rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                  >
                    <span className="text-sm font-semibold text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#C9A45C] transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-[#999999] leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
