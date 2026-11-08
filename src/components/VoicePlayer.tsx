import React, { useState, useRef, useEffect, useCallback } from 'react';

interface VoicePlayerProps {
  audioSrc: string;
  onDelete?: () => void;
  className?: string;
  label?: string;
  autoPlay?: boolean;
}

// 42 natural speech-like waveform bar height percentages matching the design
const WAVEFORM_HEIGHTS = [
  24, 32, 75, 48, 52, 38, 32, 24, 40, 22,
  26, 20, 56, 30, 72, 88, 44, 82, 52, 92,
  70, 76, 56, 38, 30, 24, 18, 14, 20, 14,
  62, 42, 34, 22, 46, 58, 32, 42, 24, 22,
  16, 14,
];

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  audioSrc,
  onDelete,
  className = '',
  label = 'VOICE MESSAGE',
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioSrc) return;

    const audio = new Audio(audioSrc);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      } else {
        // Chromium workaround for WebM blob duration
        audio.currentTime = 1e101;
        audio.ontimeupdate = () => {
          audio.ontimeupdate = null;
          if (isFinite(audio.duration)) {
            setDuration(audio.duration);
          }
          audio.currentTime = 0;
        };
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    if (autoPlay) {
      audio.play().catch(() => {});
    }

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audioRef.current = null;
    };
  }, [audioSrc, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.error('Audio play error:', err));
    }
  };

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current || !waveformRef.current) return;
      const rect = waveformRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const targetDuration = duration || audioRef.current.duration || 0;
      if (isFinite(targetDuration) && targetDuration > 0) {
        const targetTime = ratio * targetDuration;
        audioRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    },
    [duration]
  );

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressRatio = duration > 0 ? Math.min(1, currentTime / duration) : 0;
  const activeBarIndex = Math.floor(progressRatio * WAVEFORM_HEIGHTS.length);

  return (
    <div
      className={`relative w-full rounded-2xl border border-[#44333b]/60 bg-[#1e151b]/90 p-3 sm:p-4 text-left shadow-lg backdrop-blur-md transition-all ${className}`}
    >
      {/* Header Label and optional Delete button */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] text-[#b58b54] uppercase select-none">
          {label}
        </span>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-[11px] text-[#c65b75] hover:text-[#f472b6] font-medium transition px-1.5 py-0.5 rounded hover:bg-[#321522]"
            title="Delete Voice Note"
          >
            ✕ Delete
          </button>
        )}
      </div>

      {/* Audio Controls Row */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Circular Play / Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white/90 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
          aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
        >
          {isPlaying ? (
            <svg
              className="w-3.5 h-3.5 text-white/90 fill-current"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg
              className="w-3.5 h-3.5 text-white/90 fill-current translate-x-0.5"
              viewBox="0 0 24 24"
            >
              <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z" />
            </svg>
          )}
        </button>

        {/* Sound Wave Bars with scrubber interaction */}
        <div
          ref={waveformRef}
          onClick={handleSeek}
          className="flex items-center gap-[2px] sm:gap-[2.5px] h-8 sm:h-9 flex-1 cursor-pointer select-none group py-1"
          title="Click to seek"
        >
          {WAVEFORM_HEIGHTS.map((baseHeight, idx) => {
            const isPlayed = idx <= activeBarIndex;
            const isCurrent = idx === activeBarIndex;

            return (
              <div
                key={idx}
                className="flex-1 flex items-center justify-center h-full"
              >
                <div
                  className={`w-full max-w-[3px] rounded-full transition-all duration-150 origin-bottom ${
                    isPlayed
                      ? 'bg-gradient-to-t from-[#c59a63] to-[#fce7f3] shadow-[0_0_6px_rgba(229,197,144,0.35)]'
                      : 'bg-white/20 group-hover:bg-white/30'
                  } ${
                    isPlaying && isPlayed
                      ? 'animate-soundwave-bar'
                      : ''
                  }`}
                  style={{
                    height: `${baseHeight}%`,
                    animationDelay: `${(idx % 8) * 0.12}s`,
                    animationDuration: `${0.7 + (idx % 4) * 0.18}s`,
                    transform: isCurrent && isPlaying ? 'scaleY(1.2)' : undefined,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Time Stamp (0:00 / 0:06) */}
        <div className="text-[11px] sm:text-xs font-mono text-[#8c7b83] shrink-0 tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};

export default VoicePlayer;

