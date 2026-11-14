import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDeviceId } from '../utils/device';
import { getApiUrl } from '../utils/api';
import RoseIcon from '../icons/RoseIcon';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [hasOrders, setHasOrders] = useState<boolean>(false);

  useEffect(() => {
    const checkOrders = () => {
      const deviceId = getDeviceId();
      if (!deviceId) return;
      fetch(getApiUrl(`/api/orders?device_id=${encodeURIComponent(deviceId)}`))
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setHasOrders(true);
          } else {
            setHasOrders(false);
          }
        })
        .catch(() => {});
    };

    checkOrders();
    window.addEventListener('order-completed', checkOrders);
    return () => window.removeEventListener('order-completed', checkOrders);
  }, []);

  const switchLang = () => {
    const newLang = i18n.language === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(newLang);
  };

  const scrollToCompose = () => {
    const el = document.getElementById('create');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[rgba(247,239,234,0.94)] dark:bg-[rgba(19,10,17,0.92)] border-b border-[var(--secondary)]/15 dark:border-rose-400/20 shadow-xs dark:shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 gap-2 sm:gap-4">
        <RouterLink
          to="/"
          className="flex items-center gap-1.5 sm:gap-2 text-[var(--primary)] font-bold text-base sm:text-lg tracking-tight shrink-0 select-none hover:opacity-90 transition-opacity"
        >
          <RoseIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--secondary)] shrink-0" />
          <span>SendFlowers</span>
        </RouterLink>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center space-x-6 text-[var(--text)] text-sm font-medium">
          <li><a href="#how-it-works" className="hover:text-[var(--secondary)] transition-colors">{t('navbar.howItWorks')}</a></li>
          <li><a href="#features" className="hover:text-[var(--secondary)] transition-colors">{t('navbar.features')}</a></li>
          <li><a href="#pricing" className="hover:text-[var(--secondary)] transition-colors">{t('navbar.pricing')}</a></li>
          {hasOrders && (
            <li><a href="#history" className="hover:text-[var(--secondary)] font-semibold text-[var(--primary)] transition-colors">Orders</a></li>
          )}
          <li><a href="#faq" className="hover:text-[var(--secondary)] transition-colors">{t('navbar.faq')}</a></li>
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {hasOrders && (
            <a
              href="#history"
              className="md:hidden inline-flex items-center justify-center h-8 text-xs font-semibold text-[var(--primary)] hover:text-[var(--secondary)] px-2 rounded-md transition"
            >
              Orders
            </a>
          )}
          <ThemeToggle />
          <button
            onClick={switchLang}
            aria-label="Switch language"
            className="inline-flex items-center justify-center h-8 px-2.5 text-xs font-semibold rounded-full border border-[var(--primary)]/15 dark:border-rose-400/25 bg-[rgba(255,250,246,0.85)] dark:bg-white/10 hover:bg-[var(--soft-pink)] dark:hover:bg-white/15 text-[var(--primary)] dark:text-rose-100 shadow-2xs transition-colors"
          >
            {i18n.language === 'en' ? 'தமிழ்' : 'EN'}
          </button>
          <button
            onClick={scrollToCompose}
            className="hidden sm:inline-flex items-center justify-center h-8 sm:h-9 bg-gradient-to-r from-[#831843] to-[#be123c] dark:from-[#9f1239] dark:to-[#e11d48] hover:brightness-110 text-white rounded-lg sm:rounded-xl px-3 sm:px-4 text-xs sm:text-sm font-medium shadow-sm hover:shadow transition active:scale-95 whitespace-nowrap"
          >
            {t('navbar.sendRose')}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

