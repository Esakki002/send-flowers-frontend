/**
 * Utility functions for handling and normalizing share URLs across environments.
 */

/**
 * Normalizes a card share URL so that it always points to the active frontend origin
 * and returns a clean, short URL without bulky JSON query parameters.
 *
 * @param rawUrl The URL returned by the backend (or stored in database)
 * @param cardId The unique identifier or recipient slug of the card (e.g. 'sandal')
 */
export const resolveProperShareUrl = (
  rawUrl?: string,
  cardId?: string,
  _cardData?: {
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

  // 2. If cardId is provided, the short link is ${currentOrigin}/${cardId}
  if (cardId) {
    const cleanId = cardId.replace(/^\/+/, '');
    return `${currentOrigin}/${cleanId}`;
  }

  // 3. If rawUrl is provided, extract its pathname without query strings
  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl, currentOrigin);
      const cleanPath = parsed.pathname.replace(/\/+$/, '');
      return `${currentOrigin}${cleanPath || '/'}`;
    } catch {
      const pathOnly = rawUrl.split('?')[0].replace(/\/+$/, '');
      if (pathOnly.startsWith('/')) {
        return `${currentOrigin}${pathOnly}`;
      }
      return `${currentOrigin}/${pathOnly}`;
    }
  }

  return '';
};
