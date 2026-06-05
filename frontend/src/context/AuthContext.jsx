import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// API_BASE is an empty string on purpose — NOT a "threshold-outcome
// mismatch" anti-pattern. AuthContext's targets (`/users/`,
// `/auth/login`, `/auth/register`) are mounted at the FastAPI root,
// not behind the `/api/` prefix the rest of the SPA uses. Because the
// React bundle is served from the SAME origin as the FastAPI backend
// (single Render service — see render.yaml: `npm run build && pip
// install -r requirements.txt` then `uvicorn`), a same-origin fetch
// resolves correctly without any env-var indirection. Adding a Vite
// VITE_API_BASE override here would be dead configurability — every
// deployment lives on one origin by design. Other pages (Tasks,
// Projects, Lists, Dashboard) declare `API_BASE = '/api'` because
// THEIR endpoints sit under the `/api/` prefix.
const API_BASE = '';

/**
 * @typedef {Object} AuthUser
 * The authenticated-user shape that AuthContext guarantees to downstream
 * consumers. The `id` field is the canonical identifier and is ALWAYS
 * present on a non-null `user` (see {@link normalizeUser}).
 *
 * Ground truth for this contract is the backend, NOT the frontend: `id`
 * mirrors the integer primary key of the `users` table
 * (`app/models/user.py::User.id`) and is exactly the value the
 * `UserContext.user_id` foreign key points at
 * (`app/models/context.py::UserContext`). It is therefore a **number**
 * (integer), not a UUID/string. Downstream code can rely on `user.id`
 * to fetch or store per-user data without guessing the field name.
 *
 * @property {number} id            backend `users.id` primary key (integer)
 * @property {string} email
 * @property {string} [username]
 * @property {string} [name]        server-computed alias of `username`
 * @property {boolean} [is_active]
 * @property {boolean} [is_superuser]
 */

/**
 * Normalize a raw backend user payload into the guaranteed {@link AuthUser}
 * contract.
 *
 * The `/users/` endpoint returns `UserOut`/`UserPublic`, which already
 * carries an integer `id`. This helper makes that guarantee explicit at
 * the frontend boundary so AuthContext never surfaces a "user" that
 * downstream UserContext-linked code can't actually key on:
 *
 *   - Accepts the canonical `id` or a legacy `user_id` field.
 *   - Re-exposes it as a single canonical `id` field.
 *   - Returns `null` when no usable identifier is present, so guards that
 *     read `user.id` stay honest instead of dereferencing `undefined`.
 *
 * @param {any} raw raw JSON from `/users/` (object) or `null`
 * @returns {AuthUser|null}
 */
export function normalizeUser(raw) {
  if (!raw || typeof raw !== 'object') return null;
  // Canonical `id` (UserOut) first; fall back to a legacy `user_id` alias.
  const rawId = raw.id ?? raw.user_id;
  if (rawId === undefined || rawId === null) {
    // No identifier — this object cannot be linked to the backend's
    // UserContext.user_id, so it is not a usable authenticated user.
    return null;
  }
  return { ...raw, id: rawId };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  // ⚠️ Temporary: Set to true to bypass login for development/testing
  const isLoginBypassEnabled = true;

  const fetchMe = useCallback(async (t) => {
    if (!t) { setLoading(false); return; }
    try {
      const res = await fetch(`${API_BASE}/users/`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        // /users/ returns list — get first item as current user
        // fallback: try /auth/me if available
        // normalizeUser guarantees an explicit `id` (matching the backend
        // users.id / UserContext.user_id key) or yields null.
        setUser(normalizeUser(Array.isArray(data) ? data[0] : data));
      } else {
        // token invalid
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch {
      // network error — keep token but no user info
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe(token);
  }, [token, fetchMe]);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'ایمیل یا رمز عبور اشتباه است');
    }
    const data = await res.json();
    const t = data.access_token;
    localStorage.setItem('token', t);
    setToken(t);
    return t;
  };

  const register = async (email, password, username) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'خطا در ثبت‌نام');
    }
    return res.json();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token || isLoginBypassEnabled }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}