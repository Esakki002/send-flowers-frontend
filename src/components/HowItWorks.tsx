import React from 'react';
import { useTranslation } from 'react-i18next';
import VoiceIcon from '../icons/VoiceIcon';
import LinkIcon from '../icons/LinkIcon';

const HowItWorks: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section id="how-it-works" className="py-20 bg-[var(--background)]" aria-labelledby="how-it-works-heading">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)] font-semibold">
          {t('howItWorks.eyebrow')}
        </p>
        <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-serif font-bold text-[var(--primary)]">
          {t('howItWorks.title')}
        </h2>
        <p className="text-base text-[var(--muted)] max-w-lg mx-auto">
          {t('howItWorks.subtitle')}
        </p>
        <div className="grid md:grid-cols-2 gap-6 pt-8">
          {/* Step 1 */}
          <div className="rounded-2xl border border-[var(--secondary)]/25 dark:border-rose-300/30 bg-gradient-to-br from-[#FFFDFC] via-[#FAF3EE] to-[#EFE3D9] dark:from-white/[0.14] dark:via-white/[0.08] dark:to-white/[0.04] backdrop-blur-md p-7 text-left shadow-[0_12px_32px_rgba(74,18,43,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:border-[var(--secondary)]/45 dark:hover:border-rose-300/50 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 dark:bg-rose-400/25 border border-[var(--primary)]/15 dark:border-rose-300/35 text-[var(--primary)] dark:text-rose-100">
                STEP 01
              </span>
              <div className="w-9 h-9 rounded-full bg-[var(--secondary)]/15 dark:bg-rose-400/20 text-[var(--secondary)] dark:text-rose-200 flex items-center justify-center">
                <VoiceIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-serif font-semibold text-[var(--primary)] mb-2">
              {t('howItWorks.step1')}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--muted)] font-medium">
              {t('howItWorks.step1Desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-[var(--secondary)]/25 dark:border-rose-300/30 bg-gradient-to-br from-[#FFFDFC] via-[#FAF3EE] to-[#EFE3D9] dark:from-white/[0.14] dark:via-white/[0.08] dark:to-white/[0.04] backdrop-blur-md p-7 text-left shadow-[0_12px_32px_rgba(74,18,43,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:border-[var(--secondary)]/45 dark:hover:border-rose-300/50 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 dark:bg-rose-400/25 border border-[var(--primary)]/15 dark:border-rose-300/35 text-[var(--primary)] dark:text-rose-100">
                STEP 02
              </span>
              <div className="w-9 h-9 rounded-full bg-[var(--secondary)]/15 dark:bg-rose-400/20 text-[var(--secondary)] dark:text-rose-200 flex items-center justify-center">
                <LinkIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-serif font-semibold text-[var(--primary)] mb-2">
              {t('howItWorks.step2')}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--muted)] font-medium">
              {t('howItWorks.step2Desc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
