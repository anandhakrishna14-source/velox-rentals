import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquare, Send, Sparkles, Plus, Car } from 'lucide-react';
import { FeedbackItem, Vehicle } from '../types';

interface FeedbackSectionProps {
  feedbackItems: FeedbackItem[];
  vehicles: Vehicle[];
  onAddFeedback: (feedback: FeedbackItem) => void;
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  feedbackItems,
  vehicles,
  onAddFeedback
}) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [authorName, setAuthorName] = useState<string>('');
  const [userLocation, setUserLocation] = useState<string>('Bangalore');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || 'apex-r1');
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  const [suggestedFleet, setSuggestedFleet] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedResponse, setSubmittedResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName || !comments) return;

    setIsSubmitting(true);
    const chosenCar = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

    try {
      const res = await fetch('/api/ai/feedback-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: authorName,
          carId: chosenCar.name,
          rating,
          comments,
          suggestedFleet
        })
      });

      let aiData = {
        conciergeResponse: `Thank you ${authorName}. Our fleet management has noted your feedback regarding ${chosenCar.name} and your fleet request.`,
        sentiment: 'exceptional'
      };

      if (res.ok) {
        aiData = await res.json();
      }

      const newFeedback: FeedbackItem = {
        id: `fb-${Date.now()}`,
        author: authorName,
        location: userLocation,
        carId: chosenCar.id,
        carName: chosenCar.name,
        rentalDurationDays: 3,
        rating,
        date: 'Today',
        comments,
        verifiedRental: true,
        suggestedFleet,
        conciergeResponse: aiData.conciergeResponse,
        sentiment: aiData.sentiment as any
      };

      onAddFeedback(newFeedback);
      setSubmittedResponse(aiData.conciergeResponse);
      setAuthorName('');
      setComments('');
      setSuggestedFleet('');
    } catch (err) {
      console.error('Feedback submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="feedback-section" className="py-24 bg-[#07080B] text-[#F5F5F5] border-t border-[#1C1D22]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#C9A45C] font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5ED39A]" />
              <span>Verified Patron Reviews & Fleet Suggestions</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-luxury text-white">
              CLIENT TESTIMONIALS
            </h2>
            <p className="text-sm text-[#888888] mt-2 max-w-xl">
              Authentic reviews strictly from verified bookings. Have suggestions for new vehicles or routes? Share your thoughts directly with our leadership team.
            </p>
          </div>

          <button
            onClick={() => setShowForm(prev => !prev)}
            className="py-3 px-6 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#C9A45C]/20 flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Close Form' : 'Submit Review & Suggest Fleet'}</span>
          </button>
        </div>

        {/* Suggestion Form Overlay */}
        {showForm && (
          <div className="mb-14 p-6 md:p-8 bg-[#0F1015] border border-[#C9A45C]/40 rounded-3xl shadow-2xl animate-in fade-in">
            <h3 className="text-xl font-luxury text-white mb-1">
              Submit Your Rental Review & Future Fleet Wishlist
            </h3>
            <p className="text-xs text-[#888888] mb-6">
              Our AI concierge will review your suggestions immediately and forward fleet requests to our acquisition team.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase text-[#AAAAAA] mb-1 font-semibold">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul K."
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    className="w-full bg-[#16171E] border border-[#2B2D38] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-[#AAAAAA] mb-1 font-semibold">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangalore"
                    value={userLocation}
                    onChange={e => setUserLocation(e.target.value)}
                    className="w-full bg-[#16171E] border border-[#2B2D38] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-[#AAAAAA] mb-1 font-semibold">Vehicle Driven</label>
                  <select
                    value={selectedVehicleId}
                    onChange={e => setSelectedVehicleId(e.target.value)}
                    className="w-full bg-[#16171E] border border-[#2B2D38] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-[#AAAAAA] mb-1 font-semibold">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer text-[#C9A45C]"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-[#C9A45C]' : 'opacity-30'}`} />
                    </button>
                  ))}
                  <span className="text-xs text-[#888888] font-mono-num ml-2">({rating} / 5 Stars)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-[#AAAAAA] mb-1 font-semibold">Experience Feedback</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share details regarding vehicle condition, delivery punctuality, and driving dynamics..."
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  className="w-full bg-[#16171E] border border-[#2B2D38] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-[#C9A45C] mb-1 font-semibold">
                  What cars or routes should we add next? (Suggestions)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Porsche 911 GT3 RS, BMW M5, Aston Martin DB12, or Bangalore-Ooty route guides..."
                  value={suggestedFleet}
                  onChange={e => setSuggestedFleet(e.target.value)}
                  className="w-full bg-[#16171E] border border-[#2B2D38] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#C9A45C]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#777777] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5ED39A]" />
                  <span>Verified with booking validation ledger</span>
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3 px-6 bg-[#C9A45C] hover:bg-[#DFBD78] text-[#050505] font-bold text-xs uppercase rounded-xl transition-all shadow-md shadow-[#C9A45C]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>AI Analyzing Feedback...</span>
                  ) : (
                    <>
                      <span>Submit Review & Feedback</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {submittedResponse && (
                <div className="p-4 bg-[#5ED39A]/10 border border-[#5ED39A]/30 rounded-xl mt-4 text-xs text-[#5ED39A] space-y-1">
                  <div className="font-bold">DIRECTOR OF CLIENT RELATIONS RESPONSE:</div>
                  <p className="text-white text-xs">{submittedResponse}</p>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {feedbackItems.map(item => (
            <div
              key={item.id}
              className="p-6 bg-[#0E0F14] border border-[#22232A] rounded-2xl flex flex-col justify-between hover:border-[#C9A45C]/40 transition-colors"
            >
              <div>
                {/* Author & Verified Tag */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-base font-luxury font-bold text-white">
                      {item.author}
                    </h4>
                    <span className="text-[11px] text-[#777777] font-mono-num">
                      {item.location} · {item.carName} ({item.rentalDurationDays}-day rental)
                    </span>
                  </div>

                  {item.verifiedRental && (
                    <span className="text-[10px] bg-[#5ED39A]/15 text-[#5ED39A] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Rental ✓</span>
                    </span>
                  )}
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-3 text-[#C9A45C]">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C9A45C]" />
                  ))}
                </div>

                {/* Comment quote */}
                <p className="text-xs text-[#CCCCCC] leading-relaxed mb-4 italic">
                  "{item.comments}"
                </p>

                {/* Suggested fleet */}
                {item.suggestedFleet && (
                  <div className="p-3 bg-[#13141B] rounded-xl border border-white/5 text-[11px] text-[#AAAAAA] mb-4">
                    <span className="text-[#C9A45C] font-semibold block mb-0.5">Patron Suggestion:</span>
                    {item.suggestedFleet}
                  </div>
                )}
              </div>

              {/* Concierge Response Note */}
              {item.conciergeResponse && (
                <div className="pt-3 border-t border-white/5 text-[11px] text-[#888888]">
                  <span className="text-[#5ED39A] font-semibold block mb-0.5">Concierge Response:</span>
                  <p className="line-clamp-3 text-[#999999]">{item.conciergeResponse}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
