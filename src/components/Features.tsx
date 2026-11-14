import React from 'react';
import RoseIcon from '../icons/RoseIcon';
import LinkIcon from '../icons/LinkIcon';
import VoiceIcon from '../icons/VoiceIcon';

type IconProps = { className?: string };

const GlobeIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const features: { Icon: React.FC<IconProps>; title: string; desc: string }[] = [
  {
    Icon: RoseIcon,
    title: 'Stunning 3D Rose',
    desc: 'An authentic botanically sculpted rose rotating gracefully in real-time 3D.',
  },
  {
    Icon: VoiceIcon,
    title: 'Live Voice & Soundwave',
    desc: 'Speak from your heart. Includes interactive waveform scrubbing and dynamic audio waves.',
  },
  {
    Icon: LinkIcon,
    title: 'Private Link & QR',
    desc: 'Zero app installation or login. Opens instantly on iOS, Android, and desktop browsers.',
  },
  {
    Icon: GlobeIcon,
    title: 'Multilingual Cards',
    desc: 'Available in English and Tamil with personalized poetic formatting.',
  },
];

const Features: React.FC = () => (
  <section id="features" className="py-20 bg-[var(--background)]">
    <div className="max-w-6xl mx-auto px-4 text-center">
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)] font-semibold">FEATURES</p>
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-[var(--primary)] mt-2">
        Crafted with love and precision
      </h2>
      <p className="text-sm text-[var(--muted)] mt-2 max-w-md mx-auto">
        Every detail is tailored to make your gift feel genuinely magical.
      </p>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map(({ Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-[var(--secondary)]/25 dark:border-rose-300/30 bg-gradient-to-b from-[#FFFDFC] via-[#FAF3EE] to-[#EFE3D9] dark:from-white/[0.14] dark:to-white/[0.04] backdrop-blur-md p-6 text-center shadow-[0_12px_32px_rgba(74,18,43,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:border-[var(--secondary)]/45 dark:hover:border-rose-300/50 hover:-translate-y-1 transition-all group"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--soft-pink)] to-[#FFFDFC] dark:from-white/25 dark:to-white/10 text-[var(--secondary)] dark:text-rose-200 border border-[var(--secondary)]/20 dark:border-rose-300/30 shadow-sm group-hover:scale-110 transition-transform">
              <Icon className="h-6 w-6 text-[var(--secondary)] dark:text-rose-200" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-[var(--primary)] mt-4">{title}</h3>
            <p className="text-xs leading-relaxed text-[var(--muted)] font-medium mt-2">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
