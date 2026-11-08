import React from 'react';
import CheckIcon from '../icons/CheckIcon';
import RoseIcon from '../icons/RoseIcon';

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)] font-semibold">PRICING</p>
        <h2 className="text-3xl md:text-4xl font-serif text-[var(--primary)] mt-2">
          Simple payment, zero hidden costs
        </h2>
        <p className="text-sm text-[var(--muted)] mt-2">
          One rose to cherish forever. No monthly subscriptions, no app install.
        </p>

        <div className="mt-10 mx-auto max-w-sm rounded-3xl border border-[var(--secondary)]/35 bg-gradient-to-br from-white/95 via-[var(--soft-pink)]/50 to-[var(--soft-pink)] p-7 text-left shadow-[0_20px_50px_rgba(91,24,53,0.12)] sm:p-8 relative overflow-hidden backdrop-blur-sm">
          {/* Subtle top background accent */}
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 rounded-full bg-[var(--secondary)]/10 blur-xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--secondary)]">
              CLASSIC 3D ROSE
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
              <CheckIcon className="w-3 h-3 text-emerald-700" />
              Forever Access
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-serif font-bold text-[var(--primary)]">₹100</span>
            <span className="text-xs text-[var(--muted)] font-medium">one-time payment</span>
          </div>

          <hr className="my-5 border-0 border-t border-[var(--secondary)]/25" />

          <ul className="space-y-3.5 text-sm text-[var(--text)]">
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                <CheckIcon className="w-3 h-3 text-[var(--primary)]" />
              </div>
              <span>Interactive 3D real-time rotating rose</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                <CheckIcon className="w-3 h-3 text-[var(--primary)]" />
              </div>
              <span>Personal romantic note from your heart</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                <CheckIcon className="w-3 h-3 text-[var(--primary)]" />
              </div>
              <span>Voice message with live sound wave player</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                <CheckIcon className="w-3 h-3 text-[var(--primary)]" />
              </div>
              <span>Instant private link, email & QR delivery</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                <CheckIcon className="w-3 h-3 text-[var(--primary)]" />
              </div>
              <span>Full ₹100 refund guarantee if undelivered</span>
            </li>
          </ul>

          <a
            href="#create"
            className="mt-8 flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-[#5B1835] to-[#831843] py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-rose-950/20 transition-all hover:from-[#721e42] hover:to-[#9f1239] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            <RoseIcon className="w-4 h-4 text-[#fce7f3]" />
            <span>Send a rose now • ₹100</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
