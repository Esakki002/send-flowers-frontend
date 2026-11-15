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
    <main className="relative min-h-dvh w-full flex flex-col justify-between bg-[radial-gradient(ellipse_at_50%_25%,#4a2238_0%,#2c1825_55%,#1c1019_100%)] text-white overflow-x-hidden">
      {/* 3D Rose Canvas Area - Occupies upper viewport full-width */}
      <section className="relative w-full flex-1 min-h-[46vh] sm:min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(244,114,147,0.22),transparent_70%)] pointer-events-none" />
        <RoseViewer className="h-full w-full" loadingClassName="bg-transparent" />
      </section>

      {/* Message and Controls Section - Seamless full-screen flow without a floating box */}
      <section className="relative z-10 w-full px-5 pb-8 pt-2 sm:px-8 sm:pb-12">
        <div className="mx-auto max-w-xl text-left">
          {/* Recipient badge */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartIcon className="h-3.5 w-3.5 shrink-0 text-[#fae0b2]" />
              <p className="truncate text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-[#fae0b2]">
                {card?.recipientName ?? 'Someone special'}
              </p>
            </div>
          </div>

          <p className="text-lg text-white sm:text-xl">
            <span className="font-sans italic font-medium text-[#fae0b2]">{card?.senderName ?? 'Someone'}</span>
            {' sent you a rose'}
          </p>

          <hr className="my-4 border-0 border-t border-[#f47293]/25" />

          <p className="whitespace-pre-wrap break-words font-sans text-sm sm:text-base italic leading-relaxed text-[#fceef2]">
            {card?.message ?? 'A message for that special person...'}
          </p>

          <div className="mt-3 text-right">
            <span className="font-sans italic text-xs sm:text-sm text-[#fae0b2]">
              — {card?.senderName ?? 'Someone'}
            </span>
          </div>

          {/* Voice Message Player */}
          {card.audioData && (
            <div id="voice-message-container" className="mt-5 pt-1">
              <VoicePlayer audioSrc={card.audioData} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Receiver;
