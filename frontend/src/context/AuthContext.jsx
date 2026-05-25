import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = '';

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
        setUser(Array.isArray(data) ? data[0] : data);
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