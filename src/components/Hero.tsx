import React from 'react';
import { useTranslation } from 'react-i18next';
import RoseViewer from '../components/RoseViewer';
import RoseIcon from '../icons/RoseIcon';
import HeartIcon from '../icons/HeartIcon';

const Hero: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section id="hero" className="hero-section">
      <div className="hero-content max-w-7xl mx-auto px-4 pt-24 pb-12 min-h-screen flex flex-col md:flex-row items-center justify-between">
        {/* Left Text */}
        <div className="hero-copy md:w-1/2 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--secondary)]/10 border border-[var(--secondary)]/25 text-[var(--secondary)] text-xs font-semibold tracking-wider uppercase">
            <HeartIcon className="w-3.5 h-3.5 text-[var(--secondary)]" />
            <span>{t('hero.eyebrow')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[var(--primary)] leading-[1.15]">
            {t('hero.title')}
          </h1>

          <p className="text-base sm:text-lg text-[var(--text)]/85 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a href="#create" className="hero-primary-cta py-3 px-7 rounded-xl font-medium gap-2 shadow-lg">
              <RoseIcon className="w-4 h-4 text-[#fce7f3]" />
              <span>{t('hero.ctaSend')} • ₹100</span>
            </a>
            <a href="#how-it-works" className="hero-secondary-cta py-3 px-6 rounded-xl font-medium">
              {t('hero.ctaHow')}
            </a>
          </div>

          <div className="flex items-center gap-6 pt-3 text-xs text-[var(--muted)] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Instant Delivery
            </span>
            <span>•</span>
            <span>No App or Login</span>
            <span>•</span>
            <span>Voice & Soundwave</span>
          </div>
        </div>

        {/* Right Visual */}
        <div className="hero-visual md:w-1/2 mt-8 md:mt-0 flex justify-center items-center">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-square">
            <RoseViewer className="w-full h-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
