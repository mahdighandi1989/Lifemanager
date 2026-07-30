/**
 * Axios HTTP client for the Lifemanager backend.
 *
 * Why this lives in lib/ and not in each page:
 *   - One place to set baseURL ('/api' — the FastAPI app serves data there;
 *     '/tasks' and '/projects' are SPA URLs handled by React Router).
 *   - Attaches the JWT from localStorage on every request, so call sites
 *     don't have to repeat that bookkeeping.
 *   - Handles 401 in one place: drop the stale token and bounce the user
 *     to /login so the AuthContext can reset.
 */
import axios from 'axios';

import { matchRoutePattern } from './routesMeta';

// Backend mounts the JSON routes under /api. baseURL is the same origin
// when the SPA is served by FastAPI in production, and Vite's dev server
// can be configured to proxy /api to the backend.
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// --- Request interceptor: attach the JWT + the originating page ---------
// X-LM-Page carries the ROUTE PATTERN (e.g. /lists/:listId, not /lists/5)
// of the page issuing the call. The backend's pulse middleware aggregates
// these into the live system diagram's page→router wires, learned from
// real traffic. Best-effort: any failure here must never block a request.
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      if (typeof window !== 'undefined') {
        const page = matchRoutePattern(window.location.pathname) || window.location.pathname;
        config.headers = config.headers ?? {};
        config.headers['X-LM-Page'] = page;
      }
    } catch {
      // observer only — never let the pulse header break a real call
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Response interceptor: drop stale tokens on 401 ---------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem('token');
      } catch {
        // ignore — private-mode browsers can block localStorage
      }
      // Avoid a redirect loop if we're already on /login.
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login')
      ) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
