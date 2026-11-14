import React, { useState } from 'react';
import ChevronDownIcon from '../icons/ChevronDownIcon';

const faqItems = [
  {
    q: 'How much does it cost to send a rose?',
    a: 'Sending a personalized 3D rose with message and voice note costs a simple one-time payment of ₹99.',
  },
  {
    q: 'Will I get a refund if the rose is not delivered?',
    a: 'Yes. If your rose delivery fails or cannot be reached, the ₹99 payment will be promptly refunded.',
  },
  {
    q: 'Does the recipient need an app or account?',
    a: 'No apps, downloads, or logins are required. The recipient simply opens the private link in any mobile or desktop browser to reveal their interactive 3D rose.',
  },
  {
    q: 'Can I add a voice message?',
    a: 'Yes! You can record a heartfelt voice message up to 60 seconds. The recipient will be able to listen with a live interactive soundwave right inside their romantic card.',
  },
  {
    q: 'How long does the rose link last?',
    a: 'Links never expire. Your digital rose and heartfelt message live forever, so they can revisit it anytime.',
  },
];

const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-[var(--background)]">
      <div className="max-w-3xl mx-auto px-4">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)] font-semibold text-center">
          QUESTIONS & ANSWERS
        </p>
        <h2 className="text-3xl md:text-4xl font-serif text-[var(--primary)] mt-2 text-center">
          Frequently asked questions
        </h2>
        <p className="text-center text-sm text-[var(--muted)] mt-2">
          Everything you need to know about sending a digital 3D rose.
        </p>
        <div className="mt-10 space-y-3.5">
          {faqItems.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`rounded-xl border transition-all duration-200 ${
                  isOpen
                    ? 'border-[var(--secondary)]/40 dark:border-rose-400/40 bg-[var(--soft-pink)]/60 dark:bg-rose-950/30 shadow-sm'
                    : 'border-[var(--secondary)]/20 dark:border-rose-400/20 bg-[#FFFDFC]/80 dark:bg-white/[0.06] hover:bg-[#FFFDFC] dark:hover:bg-white/[0.12] hover:border-[var(--secondary)]/35 dark:hover:border-rose-400/35'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left px-5 py-4 flex justify-between items-center font-medium text-[var(--primary)] gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-serif">{item.q}</span>
                  <div
                    className={`shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[var(--secondary)]' : 'text-[var(--muted)]'
                    }`}
                  >
                    <ChevronDownIcon className="w-5 h-5" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-[var(--text)] border-t border-[var(--secondary)]/10 dark:border-rose-400/15">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
