/**
 * Utility functions for handling and normalizing share URLs across environments.
 */

/**
 * Normalizes a card share URL so that it always points to the active frontend origin.
 * Fixes issues where the backend configured FRONTEND_URL with multiple comma-separated domains
 * (e.g., "https://your-frontend-domain.vercel.app,http://localhost:5173"), localhost, or outdated domains.
 *
 * @param rawUrl The URL returned by the backend (or stored in database)
 * @param cardId The unique identifier of the card (e.g., '9jzuv_IH3Bo')
 * @param cardData Optional card data to reconstruct query params if rawUrl is missing
 */
export const resolveProperShareUrl = (
  rawUrl?: string,
  cardId?: string,
  cardData?: {
    senderName?: string;
    recipientName?: string;
    message?: string;
    language?: string;
  }
): string => {
  // 1. Determine active frontend origin
  const currentOrigin = (
    (typeof window !== 'undefined' && window.location.origin) ||
    (import.meta.env.VITE_FRONTEND_URL as string) ||
    'https://send-flowers-frontend.mesakkiappan02.workers.dev'
  ).replace(/\/+$/, '');

  // 2. If rawUrl contains '/c/', extract path and query starting at '/c/'
  if (rawUrl) {
    const cIndex = rawUrl.indexOf('/c/');
    if (cIndex !== -1) {
      const pathAndQuery = rawUrl.substring(cIndex);
      return `${currentOrigin}${pathAndQuery}`;
    }
  }

  // 3. If rawUrl didn't contain '/c/' but we have cardId, construct clean share URL
  if (cardId) {
    let query = '';
    if (cardData) {
      const payload = {
        senderName: cardData.senderName || '',
        recipientName: cardData.recipientName || '',
        message: cardData.message || '',
        language: cardData.language || 'en',
      };
      query = `?card=${encodeURIComponent(JSON.stringify(payload))}`;
    }
    return `${currentOrigin}/c/${cardId}${query}`;
  }

  // 4. Fallback: if rawUrl is relative or a simple string
  if (rawUrl) {
    if (rawUrl.startsWith('/')) {
      return `${currentOrigin}${rawUrl}`;
    }
    return rawUrl;
  }

  return '';
};

