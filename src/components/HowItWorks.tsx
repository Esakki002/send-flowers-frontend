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
          <div className="rounded-2xl border border-[var(--secondary)]/25 bg-gradient-to-br from-white via-[var(--soft-pink)]/40 to-[var(--soft-pink)] p-7 text-left shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                STEP 01
              </span>
              <div className="w-9 h-9 rounded-full bg-[var(--secondary)]/15 text-[var(--secondary)] flex items-center justify-center">
                <VoiceIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-serif font-semibold text-[var(--primary)] mb-2">
              {t('howItWorks.step1')}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {t('howItWorks.step1Desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-[var(--secondary)]/25 bg-gradient-to-br from-white via-[var(--soft-pink)]/40 to-[var(--soft-pink)] p-7 text-left shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                STEP 02
              </span>
              <div className="w-9 h-9 rounded-full bg-[var(--secondary)]/15 text-[var(--secondary)] flex items-center justify-center">
                <LinkIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-serif font-semibold text-[var(--primary)] mb-2">
              {t('howItWorks.step2')}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {t('howItWorks.step2Desc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
