import React from 'react';
import RoseIcon from '../icons/RoseIcon';

const Footer: React.FC = () => {
  return (
    <footer className="py-10 bg-gradient-to-b from-[#4A142B] to-[#300C1B] text-[var(--background)] border-t border-[var(--secondary)]/20">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="inline-flex items-center justify-center gap-2 text-xl font-serif font-bold text-white tracking-wide">
          <RoseIcon className="w-6 h-6 text-[#f472b6]" />
          <span>SendFlowers</span>
        </p>
        <p className="text-sm mt-2 text-[#fce7f3]/80 font-serif italic">
          A timeless 3D rose that never wilts. Delivered with your heartfelt words and voice note.
        </p>
        <div className="flex justify-center items-center gap-6 mt-6 text-xs text-[#fce7f3]/60">
          <a href="#how-it-works" className="hover:text-white transition">How it works</a>
          <span>•</span>
          <a href="#features" className="hover:text-white transition">Features</a>
          <span>•</span>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <span>•</span>
          <a href="#faq" className="hover:text-white transition">FAQ</a>
        </div>
        <p className="text-[11px] mt-6 text-[#fce7f3]/40">
          © {new Date().getFullYear()} SendFlowers. All rights reserved.
        </p>
        <p className="text-[10px] mt-1 text-[#fce7f3]/30">
          3D Rose: <a href="https://sketchfab.com/3d-models/red-rose-ninja-d85844b324954542863cf098d5701f3f" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60">"Red Rose ninja"</a> by <a href="https://sketchfab.com/freefireninjagamer" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60">NINJA 55</a> (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/60">CC-BY 4.0</a>).
        </p>
      </div>
    </footer>
  );
};

export default Footer;
