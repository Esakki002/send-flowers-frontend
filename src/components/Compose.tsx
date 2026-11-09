import React, { useEffect, useState, useRef, ChangeEvent, FormEvent } from 'react';
import RoseViewer from './RoseViewer';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';
import * as QRCode from 'qrcode';

import HeartIcon from '../icons/HeartIcon';
import SendIcon from '../icons/SendIcon';
import VoiceIcon from '../icons/VoiceIcon';
import RoseIcon from '../icons/RoseIcon';
import CloseIcon from '../icons/CloseIcon';
import StopIcon from '../icons/StopIcon';
import VoicePlayer from './VoicePlayer';
import { getDeviceId } from '../utils/device';
import { getApiUrl } from '../utils/api';
import { resolveProperShareUrl } from '../utils/url';

interface FormData {
  senderName: string;
  recipientName: string;
  message: string;
  language: 'en' | 'ta';
  email: string;
  delivery: 'email' | 'qr' | 'link';
  consent1: boolean;
  consent2: boolean;
}

interface EmailResult {
  success: boolean;
  status?: string;
  message?: string;
  to?: string;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Compose: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<FormData>({
    senderName: '',
    recipientName: '',
    message: '',
    language: 'en',
    email: '',
    delivery: 'link',
    consent1: true,
    consent2: true,
  });
  const [shareUrl, setShareUrl] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [shareError, setShareError] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [emailResult, setEmailResult] = useState<EmailResult | null>(null);

  // Voice recording state
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      setPaymentError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioData(reader.result as string);
        };
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 59) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      setPaymentError('Could not access microphone. Please check browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const deleteRecording = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setAudioData(null);
    setIsPlayingPreview(false);
  };

  const togglePlayPreview = () => {
    if (!audioData) return;
    if (isPlayingPreview && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      const audio = new Audio(audioData);
      previewAudioRef.current = audio;
      audio.onended = () => setIsPlayingPreview(false);
      audio.play().then(() => setIsPlayingPreview(true)).catch(() => setIsPlayingPreview(false));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setShareUrl('');
    setQrImage('');
    setShareError('');
    setPaymentError('');
  };

  const isValid = Boolean(
    data.senderName.trim() &&
    data.recipientName.trim() &&
    data.message.trim() &&
    (data.delivery !== 'email' || data.email.trim()) &&
    data.consent1 &&
    data.consent2
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isProcessing) return;

    if (!isValid) {
      if (!data.senderName.trim()) {
        setPaymentError('Please enter your name.');
      } else if (!data.recipientName.trim()) {
        setPaymentError("Please enter recipient's name.");
      } else if (!data.message.trim()) {
        setPaymentError('Please enter your message.');
      } else if (data.delivery === 'email' && !data.email.trim()) {
        setPaymentError("Please enter recipient's email address.");
      } else if (!data.consent1 || !data.consent2) {
        setPaymentError('Please accept the delivery consent and terms.');
      }
      return;
    }

    setIsProcessing(true);
    setPaymentError('');
    setShareError('');

    try {
      const frontendOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      console.log('Sending order request to backend...');
      // 1. Create order on FastAPI backend
      const res = await fetch(getApiUrl('/api/payment/create-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: data.senderName,
          recipientName: data.recipientName,
          message: data.message,
          language: data.language,
          email: data.email,
          delivery: data.delivery,
          amount: 100,
          deviceId: getDeviceId(),
          audioData: audioData || undefined,
          frontendUrl: frontendOrigin,
          origin: frontendOrigin,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to create payment order. Please ensure the backend is running.');
      }

      const orderData = await res.json();
      console.log('Order created on backend:', orderData);

      // 2. Ensure Razorpay SDK script is loaded
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        throw new Error('Could not load Razorpay SDK. Please check your internet connection or adblocker.');
      }

      // 3. Check if we are in mock mode (placeholder Razorpay keys)
      if (orderData.isMock) {
        console.warn('Running mock payment verification...');
        const verifyRes = await fetch(getApiUrl('/api/payment/verify-payment'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_mock_${nanoid(8)}`,
            razorpay_signature: 'mock_signature',
            senderName: data.senderName,
            recipientName: data.recipientName,
            message: data.message,
            language: data.language,
            email: data.email,
            delivery: data.delivery,
            deviceId: getDeviceId(),
            audioData: audioData || undefined,
            frontendUrl: frontendOrigin,
            origin: frontendOrigin,
          }),
        });

        if (!verifyRes.ok) {
          const verifyErr = await verifyRes.json().catch(() => ({}));
          throw new Error(verifyErr.detail || 'Payment verification failed.');
        }

        const result = await verifyRes.json();
        if (result.cardId && audioData) {
          try {
            sessionStorage.setItem(`sf_card_audio_${result.cardId}`, audioData);
            localStorage.setItem(`sf_card_audio_${result.cardId}`, audioData);
          } catch {}
        }
        const properShareUrl = resolveProperShareUrl(result.shareUrl, result.cardId, data);
        setShareUrl(properShareUrl);
        setEmailResult(result.emailResult || null);
        window.dispatchEvent(new Event('order-completed'));
        setIsShareModalOpen(true);
        setIsProcessing(false);
        return;
      }

      // 4. Real Razorpay Checkout popup
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SendFlowers',
        description: 'Send a 3D Rose Gift',
        order_id: orderData.orderId,
        prefill: {
          name: data.senderName,
          email: data.email || undefined,
        },
        theme: {
          color: '#831843',
        },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            console.log('Razorpay payment response received:', response);
            const verifyRes = await fetch(getApiUrl('/api/payment/verify-payment'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                senderName: data.senderName,
                recipientName: data.recipientName,
                message: data.message,
                language: data.language,
                email: data.email,
                delivery: data.delivery,
                deviceId: getDeviceId(),
                audioData: audioData || undefined,
                frontendUrl: frontendOrigin,
                origin: frontendOrigin,
              }),
            });

            if (!verifyRes.ok) {
              const verifyErr = await verifyRes.json().catch(() => ({}));
              throw new Error(verifyErr.detail || 'Payment verification failed.');
            }

            const result = await verifyRes.json();
            console.log('Payment verified successfully:', result);
            if (result.cardId && audioData) {
              try {
                sessionStorage.setItem(`sf_card_audio_${result.cardId}`, audioData);
                localStorage.setItem(`sf_card_audio_${result.cardId}`, audioData);
              } catch {}
            }
            const properShareUrl = resolveProperShareUrl(result.shareUrl, result.cardId, data);
            setShareUrl(properShareUrl);
            setEmailResult(result.emailResult || null);
            window.dispatchEvent(new Event('order-completed'));
            setIsShareModalOpen(true);
          } catch (err: any) {
            console.error('Payment verification failed:', err);
            setPaymentError(err.message || 'Error verifying payment.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Razorpay modal dismissed');
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (resp: any) => {
        setPaymentError(resp.error?.description || 'Payment failed.');
        setIsProcessing(false);
      });
      razorpayInstance.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      setPaymentError(err.message || 'Something went wrong while initiating payment.');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!shareUrl || data.delivery !== 'qr') return;

    const qr = QRCode.create(shareUrl, { errorCorrectionLevel: 'H' });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      setShareError('Could not create the QR code in this browser.');
      return;
    }

    const quietZone = 4;
    const moduleCount = qr.modules.size;
    const cellSize = 8;
    const size = (moduleCount + quietZone * 2) * cellSize;

    canvas.width = size;
    canvas.height = size;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, size, size);
    context.fillStyle = '#5B1835';
    for (let y = 0; y < moduleCount; y += 1) {
      for (let x = 0; x < moduleCount; x += 1) {
        const index = y * moduleCount + x;
        if (!qr.modules.data[index]) continue;
        context.fillRect((x + quietZone) * cellSize, (y + quietZone) * cellSize, cellSize, cellSize);
      }
    }

    setQrImage(canvas.toDataURL('image/png'));
  }, [data.delivery, shareUrl]);

  useEffect(() => {
    if (!isShareModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsShareModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShareModalOpen]);

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareError('Link copied to clipboard! 📋');
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Could not copy the link. Copy it from the field instead.');
    }
  };

  return (
    <section id="create" className="compose-section py-12" aria-labelledby="compose-heading">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-4 mb-8">
          <p className="text-sm uppercase text-[var(--accent)]">{t('navbar.sendRose')}</p>
          <h2 id="compose-heading" className="text-3xl font-bold text-[var(--primary)]">
            {t('hero.title')}
          </h2>
          <p className="text-lg text-[var(--text)]">
            {t('hero.subtitle')}
          </p>
        </div>
        <div className="mx-auto grid max-w-6xl items-start gap-8 md:grid-cols-2">
          <div className="min-w-0 space-y-6">
            {/* Form */}
            <form className="glass-panel space-y-4 p-5 md:p-6" onSubmit={handleSubmit}>
              {/* Name fields side‑by‑side */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-[var(--muted)] text-sm mb-1">Your name *</label>
                  <input
                    type="text"
                    name="senderName"
                    value={data.senderName}
                    onChange={handleChange}
                    className="glass-control w-full rounded-md p-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[var(--muted)] text-sm mb-1">Recipient&apos;s name *</label>
                  <input
                    type="text"
                    name="recipientName"
                    value={data.recipientName}
                    onChange={handleChange}
                    className="glass-control w-full rounded-md p-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                    required
                  />
                </div>
              </div>

              {/* Message textarea */}
              <div>
                <label className="block text-[var(--muted)] text-sm mb-1">Your message *</label>
                <textarea
                  name="message"
                  value={data.message}
                  onChange={handleChange}
                  maxLength={500}
                  rows={4}
                  className="glass-control w-full rounded-md p-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                  required
                />
                <p className="text-right text-[var(--muted)] text-xs">
                  {data.message.length} / 500
                </p>
              </div>

              {/* Optional Voice Note Recorder */}
              <div className="rounded-xl border border-[var(--secondary)]/30 bg-[var(--soft-pink)]/40 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <VoiceIcon className="w-4 h-4 text-[var(--secondary)]" />
                    <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wider">
                      Voice Note (Optional)
                    </span>
                  </div>
                  {audioData && (
                    <span className="text-[0.65rem] text-emerald-700 font-semibold bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full">
                      ✓ Attached
                    </span>
                  )}
                </div>

                {!audioData ? (
                  isRecording ? (
                    <div className="rounded-2xl border border-rose-500/40 bg-[#1e151b] p-3.5 sm:p-4 text-white shadow-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] text-[#b58b54] uppercase select-none">
                            RECORDING VOICE NOTE
                          </span>
                        </div>
                        <span className="text-xs font-mono text-[#a59199] tabular-nums">
                          0:{recordingTime < 10 ? `0${recordingTime}` : recordingTime} / 1:00
                        </span>
                      </div>

                      {/* Dynamic Animated Recording Waveform */}
                      <div className="flex items-center justify-center gap-[2.5px] h-10 px-3 bg-black/30 rounded-xl overflow-hidden">
                        {[32, 55, 40, 85, 95, 70, 45, 90, 65, 100, 80, 50, 75, 45, 85, 60, 92, 40, 70, 50, 80, 60, 40, 70, 95, 55, 35].map(
                          (baseH, i) => (
                            <div key={i} className="flex-1 flex items-center justify-center h-full">
                              <div
                                className="w-full max-w-[3px] rounded-full bg-gradient-to-t from-[#be123c] via-[#ec4899] to-[#fce7f3] animate-recording-wave"
                                style={{
                                  height: `${baseH}%`,
                                  animationDelay: `${(i % 7) * 0.1}s`,
                                  animationDuration: `${0.65 + (i % 4) * 0.14}s`,
                                }}
                              />
                            </div>
                          )
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[11px] text-[#b08491]">Speak into your mic</span>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-lg text-xs font-medium transition shadow flex items-center gap-1.5 active:scale-95"
                        >
                          <span>Done / Stop</span>
                          <StopIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-dashed border-[var(--secondary)] text-xs text-[var(--primary)] font-medium hover:bg-[var(--soft-pink)] transition"
                    >
                      <VoiceIcon className="w-4 h-4 text-[var(--secondary)]" />
                      <span>Click to record voice message (up to 60s)</span>
                    </button>
                  )
                ) : (
                  <VoicePlayer
                    audioSrc={audioData}
                    onDelete={deleteRecording}
                    label="YOUR VOICE NOTE"
                  />
                )}
              </div>

              {/* Language toggle pills */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setData((p) => ({ ...p, language: 'en' }))}
                  className={`glass-choice flex-1 py-2 rounded-md ${data.language === 'en' ? 'glass-toggle-selected text-[var(--background)]' : 'text-[var(--primary)]'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setData((p) => ({ ...p, language: 'ta' }))}
                  className={`glass-choice flex-1 py-2 rounded-md ${data.language === 'ta' ? 'glass-toggle-selected text-[var(--background)]' : 'text-[var(--primary)]'}`}
                >
                  தமிழ்
                </button>
              </div>

              {/* Email field */}
              <div>
                <label className="block text-[var(--muted)] text-sm mb-1">Recipient&apos;s email {data.delivery === 'email' ? '*' : '(Optional)'}</label>
                <input
                  type="email"
                  name="email"
                  placeholder="recipient@example.com"
                  value={data.email}
                  onChange={handleChange}
                  className="glass-control w-full rounded-md p-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                  required={data.delivery === 'email'}
                />
              </div>

              {/* Delivery method tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label="Choose how to share">
                <button
                  type="button"
                  aria-pressed={data.delivery === 'email'}
                  onClick={() => setData((p) => ({ ...p, delivery: 'email' }))}
                  className={`glass-choice p-4 border rounded-md text-left transition ${data.delivery === 'email' ? 'glass-choice-selected' : ''}`}
                >
                  <p className="font-medium text-[var(--primary)]">Email</p>
                  <p className="text-xs text-[var(--muted)]">Send directly to recipient&apos;s inbox.</p>
                </button>
                <button
                  type="button"
                  aria-pressed={data.delivery === 'qr'}
                  onClick={() => setData((p) => ({ ...p, delivery: 'qr' }))}
                  className={`glass-choice p-4 border rounded-md text-left transition ${data.delivery === 'qr' ? 'glass-choice-selected' : ''}`}
                >
                  <p className="font-medium text-[var(--primary)]">Pink QR code</p>
                  <p className="text-xs text-[var(--muted)]">Create a heart-style QR code to scan.</p>
                </button>
                <button
                  type="button"
                  aria-pressed={data.delivery === 'link'}
                  onClick={() => setData((p) => ({ ...p, delivery: 'link' }))}
                  className={`glass-choice p-4 border rounded-md text-left transition ${data.delivery === 'link' ? 'glass-choice-selected' : ''}`}
                >
                  <p className="font-medium text-[var(--primary)]">Link</p>
                  <p className="text-xs text-[var(--muted)]">Copy and share your rose card link.</p>
                </button>
              </div>

              {/* Consents */}
              <div className="space-y-2">
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    name="consent1"
                    checked={data.consent1}
                    onChange={handleChange}
                    className="mt-1"
                    required
                  />
                  <span className="text-[var(--muted)] text-sm">
                    I consent to the immediate delivery of digital content and acknowledge that I thereby lose my right of withdrawal from the contract.
                  </span>
                </label>
                <label className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    name="consent2"
                    checked={data.consent2}
                    onChange={handleChange}
                    className="mt-1"
                    required
                  />
                  <span className="text-[var(--muted)] text-sm">
                    I accept the Terms of Service and acknowledge the Privacy Policy.
                  </span>
                </label>
              </div>

              {/* Payment Error Alert */}
              {paymentError && (
                <div role="alert" className="p-3 text-sm text-rose-200 bg-rose-950/60 border border-rose-500/50 rounded-lg">
                  {paymentError}
                </div>
              )}

              {/* Send button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-md bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold shadow-lg shadow-rose-900/20"
              >
                <span className="flex items-center justify-center space-x-2">
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing Payment & Rose...</span>
                    </>
                  ) : (
                    <>
                      <SendIcon className="w-4 h-4" />
                      <span>{t('hero.ctaSend')} • ₹100</span>
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          <div className="glass-panel flex min-w-0 flex-col items-center gap-4 p-5 md:sticky md:top-24 md:p-6">
            <h3 className="text-xl font-semibold text-[var(--primary)]">Live preview</h3>
            <div className="glass-preview aspect-square w-full max-w-md overflow-hidden rounded-2xl">
              <RoseViewer className="h-full w-full" />
            </div>
            <div className="glass-card w-full max-w-md rounded-xl p-4 text-left">
              <div className="mb-2 flex items-center gap-2">
                <HeartIcon className="h-6 w-6 shrink-0 text-[var(--secondary)]" />
                <p className="truncate text-sm text-[var(--muted)]">
                  {data.recipientName || 'Someone special'}
                </p>
              </div>
              <p className="italic text-[var(--primary)]">
                {data.senderName || 'You'} sent you a rose
              </p>
              <hr className="my-3 border-0 border-t-2 border-dotted border-[var(--secondary)] opacity-60" />
              <p className="whitespace-pre-wrap break-words italic text-[var(--text)]">
                {data.message || 'Your message will appear here.'}
              </p>
              <div className="mt-2 text-right">
                <span className="italic text-xs sm:text-sm text-[var(--muted)]">
                  — {data.senderName || 'You'}
                </span>
              </div>
              {audioData && (
                <div className="mt-4 pt-1">
                  <VoicePlayer audioSrc={audioData} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share / Success Modal */}
      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsShareModalOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            className="glass-panel relative my-auto flex w-full max-w-lg flex-col items-center gap-4 p-6 text-center md:p-8"
          >
            <button
              type="button"
              onClick={() => setIsShareModalOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-2 text-[var(--muted)] hover:bg-[var(--soft-pink)] hover:text-[var(--primary)] transition"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
            <div className="p-3 bg-rose-500/10 rounded-full">
              <HeartIcon className="h-10 w-10 text-[var(--secondary)]" />
            </div>
            <h3 id="share-modal-title" className="text-2xl font-serif font-semibold text-[var(--primary)] flex items-center justify-center gap-2">
              <span>Payment Successful!</span>
              <RoseIcon className="w-6 h-6 text-[var(--secondary)] inline-block" />
            </h3>

            {data.delivery === 'email' ? (
              <div className="space-y-3 w-full">
                <p className="text-[var(--text)] font-medium">
                  Your rose for <span className="text-[var(--primary)] font-semibold">{data.recipientName}</span> has been created!
                </p>
                {data.email && (
                  <div className="p-3 bg-[var(--soft-pink)] rounded-lg text-sm text-[var(--text)]">
                    Recipient Email: <span className="font-semibold text-[var(--primary)]">{data.email}</span>
                    {emailResult?.status === 'sent' && (
                      <p className="text-emerald-400 mt-1">✓ Email sent directly to inbox!</p>
                    )}
                    {emailResult?.status === 'simulated' && (
                      <p className="text-xs text-[var(--muted)] mt-1">
                        (SMTP simulated in local dev — check console or set SMTP credentials in backend/.env)
                      </p>
                    )}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-[var(--secondary)]/20 text-left">
                  <p className="text-xs uppercase tracking-wider text-[var(--muted)] mb-1">Direct link also available:</p>
                  <div className="flex w-full gap-2">
                    <input
                      aria-label="Rose card link"
                      readOnly
                      value={shareUrl}
                      className="glass-control min-w-0 flex-1 rounded-md p-2.5 text-xs text-[var(--text)]"
                      onFocus={(event) => event.currentTarget.select()}
                    />
                    <button
                      type="button"
                      onClick={copyShareUrl}
                      className="rounded-md bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-[var(--background)] hover:bg-[var(--secondary)]"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ) : data.delivery === 'qr' ? (
              <div className="space-y-4">
                <p className="text-sm text-[var(--muted)]">
                  Scan this heart QR code to open the rose card for {data.recipientName}.
                </p>
                {qrImage ? (
                  <div className="p-2 bg-white rounded-xl shadow-lg inline-block">
                    <img
                      src={qrImage}
                      alt="QR code linking to your rose card"
                      className="h-64 w-64 max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <p role="status" className="flex h-64 items-center justify-center text-sm text-[var(--muted)]">
                    {shareError || 'Creating QR code…'}
                  </p>
                )}
                <div className="flex w-full gap-2">
                  <input
                    aria-label="Rose card link"
                    readOnly
                    value={shareUrl}
                    className="glass-control min-w-0 flex-1 rounded-md p-2.5 text-xs text-[var(--text)]"
                    onFocus={(event) => event.currentTarget.select()}
                  />
                  <button
                    type="button"
                    onClick={copyShareUrl}
                    className="rounded-md bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--background)] hover:bg-[var(--secondary)]"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 w-full">
                <p className="text-sm text-[var(--muted)]">
                  Share this private link with {data.recipientName} to open the 3D rose!
                </p>
                <div className="flex w-full gap-2">
                  <input
                    aria-label="Rose card link"
                    readOnly
                    value={shareUrl}
                    className="glass-control min-w-0 flex-1 rounded-md p-3 text-sm text-[var(--text)]"
                    onFocus={(event) => event.currentTarget.select()}
                  />
                  <button
                    type="button"
                    onClick={copyShareUrl}
                    className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--background)] hover:bg-[var(--secondary)]"
                  >
                    Copy
                  </button>
                </div>
                <div className="pt-2">
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs text-[var(--accent)] hover:underline"
                  >
                    Preview Rose Card in new tab →
                  </a>
                </div>
              </div>
            )}

            {shareError && <p role="status" className="text-sm text-[var(--primary)] font-medium">{shareError}</p>}

            <div className="pt-3 border-t border-[var(--secondary)]/15 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsShareModalOpen(false);
                  const el = document.getElementById('history');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>📜 View your paid roses in Order History ↓</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

export default Compose;