/**
 * Dynamic API Base URL configuration.
 * - In local development (Vite on port 3002), points to local PHP server (http://127.0.0.1:8002).
 * - In production (VPS / aaPanel / live domain), returns empty string '' so all requests use relative paths (/api/...)
 *   which avoids mixed-content or CORS issues and routes directly via Nginx reverse proxy / FastCGI.
 */
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window.location.port === '3002' || window.location.port === '5173')) {
    return 'http://127.0.0.1:8002';
  }
  return '';
};

export const BACKEND_URL = getApiBaseUrl();
