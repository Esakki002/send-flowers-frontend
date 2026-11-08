/**
 * Centralized API configuration for connecting UI to the FastAPI backend.
 */
const rawBaseUrl = (import.meta.env.VITE_API_URL as string) || '';
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

/**
 * Returns the fully qualified URL for an API endpoint.
 * In production (or when VITE_API_URL is set), prefixes with API_BASE_URL.
 * In local dev without VITE_API_URL, returns the relative path which Vite proxies.
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!API_BASE_URL) {
    return cleanEndpoint;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
};

