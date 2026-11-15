import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import RoseViewer from '../components/RoseViewer';
import HeartIcon from '../icons/HeartIcon';
import VoiceIcon from '../icons/VoiceIcon';
import RoseIcon from '../icons/RoseIcon';
import VoicePlayer from '../components/VoicePlayer';
import { getApiUrl } from '../utils/api';

interface SharedRoseCard {
  senderName: string;
  recipientName: string;
  message: string;
  language: 'en' | 'ta';
  audioData?: string;
}

const isSharedRoseCard = (value: unknown): value is SharedRoseCard => {
  if (!value || typeof value !== 'object') return false;
  const card = value as Record<string, unknown>;
  return (
    typeof card.senderName === 'string' &&
    typeof card.recipientName === 'string' &&
    typeof card.message === 'string' &&
    (card.language === 'en' || card.language === 'ta')
  );
};

const Receiver: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<SharedRoseCard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [invalidLink, setInvalidLink] = useState<boolean>(false);

  useEffect(() => {
    const encodedCard = new URLSearchParams(window.location.search).get('card');
    let cachedAudio: string | null = null;
    let hasInitialCard = false;

    if (id) {
      try {
        cachedAudio =
          sessionStorage.getItem(`sf_card_audio_${id}`) ||
          localStorage.getItem(`sf_card_audio_${id}`);
      } catch {}
    }

    if (encodedCard) {
      try {
        const parsed: unknown = JSON.parse(encodedCard);
        if (isSharedRoseCard(parsed)) {
          setCard({
            ...parsed,
            audioData: parsed.audioData || cachedAudio || undefined,
          });
          hasInitialCard = true;
          setLoading(false);
        }
      } catch {
        // Fall back to API fetch
      }
    }

    if (id) {
      fetch(getApiUrl(`/api/card/${id}`))
        .then((res) => {
          if (!res.ok) throw new Error('Card not found');
          return res.json();
        })
        .then((data) => {
          if (isSharedRoseCard(data)) {
            const finalAudio = data.audioData || cachedAudio || undefined;
            if (data.audioData) {
              try {
                sessionStorage.setItem(`sf_card_audio_${id}`, data.audioData);
              } catch {}
            }
            setCard((prev) => ({
              ...(prev || {}),
              ...data,
              audioData: finalAudio,
            }));
            setInvalidLink(false);
          } else if (!hasInitialCard) {
            setInvalidLink(true);
          }
        })
        .catch((err) => {
          console.warn('API card fetch error, using fallback:', err);
          if (!hasInitialCard) {
            setInvalidLink(true);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!hasInitialCard) {
      setInvalidLink(true);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-[#251722] px-4 text-white gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#831843] to-[#f47293] flex items-center justify-center text-[#fce7f3] shadow-lg shadow-pink-950/40 animate-bounce">
          <RoseIcon className="w-6 h-6" />
        </div>
        <p className="text-center font-sans text-sm tracking-wide text-[#fceef2] animate-pulse">
          Opening your rose card...
        </p>
      </main>
    );
  }

  if (invalidLink || !card) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#251722] px-4 text-white">
        <p role="alert" className="text-center text-[#fceef2]">
          This rose card link is invalid or incomplete.
        </p>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col justify-between bg-[radial-gradient(ellipse_at_50%_25%,#4a2238_0%,#2c1825_55%,#1c1019_100%)] text-white overflow-x-hidden overflow-y-auto">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(244,114,147,0.25),transparent_75%)] pointer-events-none" />

      {/* Main Responsive Layout:
          - Mobile / Tablet Portrait: Full 100dvh flex stack with Rose expanding in upper space and Message Box docked to the bottom with zero dead space
          - Laptop / Desktop / Tablet Landscape: Balanced side-by-side view with large canvas and zero scroll needed
      */}
      <div className="relative z-10 w-full max-w-7xl mx-auto min-h-[100dvh] flex flex-col justify-between lg:flex-row lg:items-center lg:justify-between lg:gap-8 xl:gap-14 px-3 sm:px-6 lg:px-10 py-3 sm:py-6 lg:py-10">
        
        {/* 3D Rose Canvas Area - Expands vertically and fills available screen across Mobile, Tablet & Laptop */}
        <section className="relative w-full lg:w-[55%] flex-1 flex items-center justify-center overflow-hidden min-h-[380px] sm:min-h-[460px] lg:h-[82vh] lg:min-h-[580px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(244,114,147,0.28),transparent_70%)] pointer-events-none" />
          <RoseViewer
            className="h-full w-full"
            loadingClassName="bg-transparent"
            interactive={true}
            cameraDistanceMultiplier={0.76}
          />
          {/* Subtle Interactive Rotation Hint */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-rose-300/25 text-[11px] font-medium tracking-wide text-[#fceef2]/90 pointer-events-none select-none shadow-md">
            <span>Drag to rotate 3D rose</span>
            <span className="text-xs">↻</span>
          </div>
        </section>

        {/* Name and Message Box - Fitted directly to the screen */}
        <section className="w-full lg:w-[45%] max-w-xl mx-auto lg:mx-0 shrink-0 pb-1 sm:pb-0">
          <div className="rounded-2xl sm:rounded-3xl border border-[#f47293]/30 bg-[#2c1825]/90 backdrop-blur-md p-5 sm:p-7 lg:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.5)] text-left space-y-3.5">
            {/* Recipient badge */}
            <div className="flex items-center gap-2">
              <HeartIcon className="h-3.5 w-3.5 shrink-0 text-[#fae0b2]" />
              <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-[#fae0b2]">
                {card?.recipientName ?? 'Someone special'}
              </p>
            </div>

            {/* Sender headline */}
            <p className="text-lg text-white sm:text-xl font-medium">
              <span className="font-sans italic font-semibold text-[#fae0b2]">{card?.senderName ?? 'Someone'}</span>
              {' sent you a rose'}
            </p>

            <hr className="border-0 border-t border-[#f47293]/20" />

            {/* Heartfelt message */}
            <p className="whitespace-pre-wrap break-words font-sans text-base sm:text-lg italic leading-relaxed text-[#fceef2]">
              {card?.message ?? 'A message for that special person...'}
            </p>

            {/* Signature */}
            <div className="text-right pt-0.5">
              <span className="font-sans italic text-sm sm:text-base text-[#fae0b2]">
                — {card?.senderName ?? 'Someone'}
              </span>
            </div>

            {/* Voice Message Player */}
            {card.audioData && (
              <div id="voice-message-container" className="pt-2 border-t border-[#f47293]/15">
                <VoicePlayer audioSrc={card.audioData} />
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
};

export default Receiver;
