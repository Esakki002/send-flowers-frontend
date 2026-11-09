/**
 * Utility functions for handling and normalizing share URLs across environments.
 */

/**
 * Normalizes a card share URL so that it always points to the active frontend origin
 * and returns a clean, simple short URL like:
 * https://send-flowers-frontend.mesakkiappan02.workers.dev/receivername
 *
 * Completely strips query strings, ?card= JSON payloads, and legacy /c/ prefixes.
 *
 * @param rawUrl The URL returned by the backend (or stored in database)
 * @param cardId The unique identifier or recipient slug of the card (e.g. 'sandal')
 * @param cardData Optional card data containing recipientName to ensure short recipient name in URL
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

  // 2. Derive target slug (prefer clean recipientName slug if cardId is a long token or missing, otherwise use cardId)
  let target = '';
  if (cardData?.recipientName && (!cardId || cardId.length > 10)) {
    target = cardData.recipientName
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[-\s]+/g, '-');
  } else if (cardId) {
    target = cardId.replace(/^\/+/, '').replace(/^c\//, '');
  } else if (cardData?.recipientName) {
    target = cardData.recipientName
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[-\s]+/g, '-');
  }

  if (target) {
    return `${currentOrigin}/${target}`;
  }

  // 3. Fallback: Parse rawUrl and strip any query parameters or legacy /c/ prefix
  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl, currentOrigin);
      const cleanPath = parsed.pathname.replace(/\/+$/, '').replace(/^\/c\//, '/');
      return `${currentOrigin}${cleanPath || '/'}`;
    } catch {
      const pathOnly = rawUrl.split('?')[0].replace(/\/+$/, '').replace(/^\/c\//, '/');
      return pathOnly.startsWith('/') ? `${currentOrigin}${pathOnly}` : `${currentOrigin}/${pathOnly}`;
    }
  }

  return '';
};
