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
      <main className="flex min-h-dvh flex-col items-center justify-center bg-[#150c12] px-4 text-white gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#5B1835] to-[#c65b75] flex items-center justify-center text-[#fce7f3] shadow-lg shadow-pink-950/40 animate-bounce">
          <RoseIcon className="w-6 h-6" />
        </div>
        <p className="text-center font-serif text-sm tracking-wide text-[#d0a6b2] animate-pulse">
          Opening your rose card...
        </p>
      </main>
    );
  }

  if (invalidLink || !card) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#150c12] px-4 text-white">
        <p role="alert" className="text-center text-[#d0a6b2]">
          This rose card link is invalid or incomplete.
        </p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-[radial-gradient(ellipse_at_50%_0%,#321522_0%,#1d1018_38%,#100b0e_100%)] p-2 sm:p-3">
      <article className="flex min-h-[calc(100dvh-1rem)] w-full max-w-[500px] flex-col gap-3 overflow-hidden rounded-[1.75rem] border border-[#c65b75]/20 bg-[#160e12] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.7)] sm:min-h-[calc(100dvh-1.5rem)] sm:gap-4 sm:p-4">
        {/* 3D Rose Canvas */}
        <section className="relative min-h-[45vh] flex-1 overflow-hidden rounded-[1.35rem] bg-[#180e13]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(112,38,64,0.24),transparent_68%)]" />
          <div className="absolute inset-0 p-2 sm:p-4">
            <RoseViewer className="h-full w-full" loadingClassName="bg-[#180e13]" />
          </div>

          {/* Quick Voice Note Floating Pill if voice attached */}
          
        </section>

        {/* Message Card */}
        <section className="rounded-[1.35rem] border border-[#c65b75]/20 bg-[#1d1117] px-5 py-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-6 sm:py-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartIcon className="h-3 w-3 shrink-0 text-[#b58b54]" />
              <p className="truncate text-[0.6rem] uppercase tracking-[0.28em] text-[#b08491]">
                {card?.recipientName ?? 'Someone special'}
              </p>
            </div>
          </div>

          <p className="text-base text-[#eee7e5] sm:text-lg">
            <span className="font-serif italic text-[#d0a6b2]">{card?.senderName ?? 'Someone'}</span>
            {' sent you a rose'}
          </p>

          <hr className="my-4 border-0 border-t border-[#c65b75]/45" />

          <p className="whitespace-pre-wrap break-words font-serif text-sm italic leading-relaxed text-[#c5b5ba] sm:text-base">
            {card?.message ?? 'A message for that special person...'}
          </p>

          <div className="mt-2 text-right">
            <span className="font-serif italic text-xs sm:text-sm text-[#b08491]">
              — {card?.senderName ?? 'Someone'}
            </span>
          </div>

          {/* Voice Message Player embedded in card matching design */}
          {card.audioData && (
            <div id="voice-message-container" className="mt-4 pt-1">
              <VoicePlayer audioSrc={card.audioData} />
            </div>
          )}
        </section>
      </article>
    </main>
  );
};

export default Receiver;
