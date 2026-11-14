import React from 'react';
import StarIcon from '../icons/StarIcon';
import CheckIcon from '../icons/CheckIcon';

const Reviews: React.FC = () => {
  const reviews = [
    {
      name: 'Priya M.',
      city: 'Chennai',
      text: 'My husband was completely moved when he opened the link. Hearing my voice note while turning the 3D rose was so romantic and unforgettable!',
      rating: 5,
    },
    {
      name: 'Karthik R.',
      city: 'Bangalore',
      text: 'Sent one to my girlfriend for our anniversary. The sound wave visualizer and 3D petal details are top-notch. Best ₹99 I ever spent!',
      rating: 5,
    },
    {
      name: 'Ananya S.',
      city: 'Coimbatore',
      text: 'Sent one to my mom for Mother’s Day. No apps or signups needed—she just clicked the WhatsApp link and saw the rose floating. She called me in tears!',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[var(--background)] via-[var(--soft-pink)]/40 to-[var(--background)] dark:from-[var(--background)] dark:via-[#1e0e1a]/60 dark:to-[var(--background)] transition-colors">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)] font-semibold">
          LOVED BY THOUSANDS
        </p>
        <h2 className="text-3xl md:text-4xl font-serif text-[var(--primary)] mt-2">
          Real love stories, shared with a rose
        </h2>
        <p className="text-sm text-[var(--muted)] mt-2">
          Read how SendFlowers helps people express love, apology, and gratitude.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--secondary)]/25 dark:border-rose-300/30 bg-[#FFFDFC]/90 dark:bg-white/[0.12] backdrop-blur-md p-6 shadow-[0_12px_32px_rgba(74,18,43,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:border-[var(--secondary)]/45 dark:hover:border-rose-300/50 transition-all text-left flex flex-col justify-between"
            >
              <div>
                {/* 5-Star Rating rendered via SVG */}
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, starIdx) => (
                    <StarIcon
                      key={starIdx}
                      className="w-4 h-4 text-amber-400"
                      filled={starIdx < r.rating}
                    />
                  ))}
                </div>

                <p className="text-sm text-[var(--text)] mt-4 italic leading-relaxed font-serif">
                  "{r.text}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--secondary)]/15 dark:border-rose-300/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e0597d] to-[#f47293] text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--primary)]">{r.name}</p>
                    <p className="text-[10px] text-[var(--muted)]">{r.city}</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-400/30">
                  <CheckIcon className="w-2.5 h-2.5" />
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
