import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

const SunIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const SystemIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const options: { mode: ThemeMode; label: string; icon: React.FC<{ className?: string }>; description: string }[] = [
    {
      mode: 'light',
      label: 'Light',
      icon: SunIcon,
      description: 'Warm cream & romantic burgundy',
    },
    {
      mode: 'dark',
      label: 'Dark',
      icon: MoonIcon,
      description: 'Deep velvet & glowing rose',
    },
    {
      mode: 'system',
      label: 'System',
      icon: SystemIcon,
      description: 'Follow your device settings',
    },
  ];

  const currentIcon =
    theme === 'system' ? (
      <SystemIcon className="w-4 h-4 text-[var(--accent)]" />
    ) : resolvedTheme === 'dark' ? (
      <MoonIcon className="w-4 h-4 text-pink-300" />
    ) : (
      <SunIcon className="w-4 h-4 text-amber-500" />
    );

  const getDisplayLabel = () => {
    if (theme === 'system') return 'Auto';
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Current theme: ${theme}. Click to change theme.`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full border border-[var(--primary)]/15 dark:border-rose-400/25 bg-[rgba(255,250,246,0.85)] dark:bg-white/10 hover:bg-[var(--soft-pink)] dark:hover:bg-white/15 text-[var(--primary)] dark:text-rose-100 shadow-2xs transition-all duration-200 active:scale-95"
      >
        <span className="shrink-0">{currentIcon}</span>
        <span className="hidden sm:inline text-xs font-semibold tracking-tight">{getDisplayLabel()}</span>
        <svg
          className={`w-3 h-3 text-[var(--muted)] dark:text-rose-300/70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-48 sm:w-52 rounded-2xl border border-[var(--secondary)]/25 dark:border-rose-400/35 bg-[#fcf8f5]/95 dark:bg-[#1a0c16]/95 backdrop-blur-xl shadow-xl shadow-rose-950/10 dark:shadow-black/50 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
        >
          <div className="px-3 py-1.5 border-b border-[var(--secondary)]/15 dark:border-rose-500/20 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)] dark:text-rose-300/60">
              Appearance
            </span>
          </div>

          {options.map(({ mode, label, icon: Icon, description }) => {
            const isSelected = theme === mode;
            return (
              <button
                key={mode}
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme(mode);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                  isSelected
                    ? 'bg-rose-500/15 dark:bg-rose-500/25 text-[var(--primary)] dark:text-white font-semibold'
                    : 'text-[var(--text)] dark:text-rose-100/90 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-[var(--secondary)]/20 dark:bg-rose-500/30 text-[var(--primary)] dark:text-rose-200'
                        : 'text-[var(--muted)] dark:text-rose-300/70'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-[10px] text-[var(--muted)] dark:text-rose-300/60 font-normal">
                      {description}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <CheckIcon className="w-3.5 h-3.5 text-[var(--secondary)] dark:text-rose-400 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
