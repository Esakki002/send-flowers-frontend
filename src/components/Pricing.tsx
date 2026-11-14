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

        <div className="mt-10 mx-auto max-w-sm rounded-3xl border border-[var(--secondary)]/25 dark:border-rose-300/30 bg-gradient-to-br from-[#FFFDFC] via-[#FAF3EE] to-[#EFE2D8] dark:from-white/[0.12] dark:via-white/[0.06] dark:to-white/[0.02] backdrop-blur-md p-7 text-left shadow-[0_16px_40px_rgba(74,18,43,0.07)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:p-8 relative overflow-hidden transition-all">
          {/* Subtle top background accent */}
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 rounded-full bg-rose-400/15 blur-xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--secondary)]">
              CLASSIC 3D ROSE
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-400/30">
              <CheckIcon className="w-3 h-3 text-emerald-700 dark:text-emerald-300" />
              Forever Access
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-serif font-bold text-[var(--primary)] tracking-tight">₹99</span>
            <span className="text-xs text-[var(--muted)] font-semibold">one-time payment</span>
          </div>

          <hr className="my-5 border-0 border-t border-[var(--secondary)]/20 dark:border-rose-300/20" />

          <ul className="space-y-3.5 text-sm font-medium text-[var(--text)]">
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 dark:bg-rose-400/20 border border-[var(--secondary)]/20 dark:border-rose-300/25 text-[var(--primary)] dark:text-rose-200 flex items-center justify-center shrink-0">
                <CheckIcon className="w-3 h-3 text-[var(--primary)] dark:text-rose-200" />
              </div>
              <span>Interactive 3D real-time rotating rose</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 dark:bg-rose-400/20 border border-[var(--secondary)]/20 dark:border-rose-300/25 text-[var(--primary)] dark:text-rose-200 flex items-center justify-center shrink-0">
                <CheckIcon className="w-3 h-3 text-[var(--primary)] dark:text-rose-200" />
              </div>
              <span>Personal romantic note from your heart</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 dark:bg-rose-400/20 border border-[var(--secondary)]/20 dark:border-rose-300/25 text-[var(--primary)] dark:text-rose-200 flex items-center justify-center shrink-0">
                <CheckIcon className="w-3 h-3 text-[var(--primary)] dark:text-rose-200" />
              </div>
              <span>Voice message with live sound wave player</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 dark:bg-rose-400/20 border border-[var(--secondary)]/20 dark:border-rose-300/25 text-[var(--primary)] dark:text-rose-200 flex items-center justify-center shrink-0">
                <CheckIcon className="w-3 h-3 text-[var(--primary)] dark:text-rose-200" />
              </div>
              <span>Instant private link, email & QR delivery</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 dark:bg-rose-400/20 border border-[var(--secondary)]/20 dark:border-rose-300/25 text-[var(--primary)] dark:text-rose-200 flex items-center justify-center shrink-0">
                <CheckIcon className="w-3 h-3 text-[var(--primary)] dark:text-rose-200" />
              </div>
              <span>Full ₹99 refund guarantee if undelivered</span>
            </li>
          </ul>

          <a
            href="#create"
            className="mt-8 flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-[#831843] to-[#be123c] dark:from-[#e0597d] dark:to-[#a0325d] py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-rose-950/20 dark:shadow-rose-950/40 transition-all hover:brightness-110 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            <RoseIcon className="w-4 h-4 text-[#fce7f3]" />
            <span>Send a rose now • ₹99</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
