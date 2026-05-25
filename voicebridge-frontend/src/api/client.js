/**
 * Centralised API client.
 *
 * - Adds the `Authorization: Bearer <access>` header to every request.
 * - On 401, transparently refreshes the access token using the refresh
 *   token, then replays the original request (only once — to prevent loops).
 * - Concurrent 401s share a single refresh promise so we don't spam the
 *   server when, say, three tabs all trigger a refresh in parallel.
 *
 * Tokens live in localStorage (acceptable for a caregiver tool; for higher
 * security, move to httpOnly cookies + CSRF tokens in a future iteration).
 */
import axios from 'axios';

const ACCESS_KEY  = 'vb_access';
const REFRESH_KEY = 'vb_refresh';

export const tokens = {
  get access()  { return localStorage.getItem(ACCESS_KEY);  },
  get refresh() { return localStorage.getItem(REFRESH_KEY); },
  set(access, refresh) {
    if (access)  localStorage.setItem(ACCESS_KEY,  access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

const BASE_URL =
  process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:8000/api/v1`;

const api = axios.create({ baseURL: BASE_URL });

// ---- request: attach access token --------------------------------------
api.interceptors.request.use((config) => {
  const t = tokens.access;
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// ---- response: refresh on 401 ------------------------------------------
let refreshingPromise = null;

api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const original = error.config;
    const status   = error.response?.status;

    // Don't try to refresh on /auth/login or /auth/refresh
    const isAuthEndpoint =
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/refresh');

    if (status !== 401 || original._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    const refresh = tokens.refresh;
    if (!refresh) {
      tokens.clear();
      return Promise.reject(error);
    }

    original._retry = true;

    // De-duplicate concurrent refreshes
    if (!refreshingPromise) {
      refreshingPromise = axios
        .post(`${BASE_URL}/auth/refresh/`, { refresh })
        .then((r) => {
          tokens.set(r.data.access, r.data.refresh || refresh);
          return r.data.access;
        })
        .catch((err) => { tokens.clear(); throw err; })
        .finally(() => { refreshingPromise = null; });
    }

    try {
      const newAccess = await refreshingPromise;
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (e) {
      return Promise.reject(error);
    }
  }
);

export default api;
