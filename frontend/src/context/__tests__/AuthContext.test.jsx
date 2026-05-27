/**
 * AuthContext: exposes user/token/isAuthenticated and login/register/logout.
 * We stub fetch() globally so no HTTP fires.
 */
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { AuthProvider, useAuth } from '../AuthContext';

function Harness({ onReady }) {
  const ctx = useAuth();
  React.useEffect(() => {
    onReady(ctx);
  });
  return null;
}

function renderWithProvider() {
  let ctxRef;
  render(
    <AuthProvider>
      <Harness onReady={(c) => (ctxRef = c)} />
    </AuthProvider>,
  );
  return () => ctxRef;
}

describe('AuthContext', () => {
  let originalFetch;

  beforeEach(() => {
    localStorage.clear();
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('exposes user, token, isAuthenticated and the action callables', () => {
    const get = renderWithProvider();
    const ctx = get();
    expect(ctx).toHaveProperty('user');
    expect(ctx).toHaveProperty('token');
    expect(ctx).toHaveProperty('isAuthenticated');
    expect(typeof ctx.login).toBe('function');
    expect(typeof ctx.register).toBe('function');
    expect(typeof ctx.logout).toBe('function');
  });

  test('login() persists the token to localStorage', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'tkn-1' }),
    });
    const get = renderWithProvider();
    await act(async () => {
      await get().login('a@b.com', 'longenough');
    });
    expect(localStorage.getItem('token')).toBe('tkn-1');
    expect(get().token).toBe('tkn-1');
  });

  test('login() rejects with the server detail on a bad response', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Invalid email or password' }),
    });
    const get = renderWithProvider();
    await expect(
      act(async () => {
        await get().login('a@b.com', 'wrong');
      }),
    ).rejects.toThrow(/Invalid email or password/);
  });

  test('logout() clears the token and resets the user', async () => {
    localStorage.setItem('token', 'preset');
    const get = renderWithProvider();
    await act(async () => {
      get().logout();
    });
    expect(localStorage.getItem('token')).toBeNull();
    expect(get().token).toBeNull();
    expect(get().user).toBeNull();
  });

  test('useAuth outside a provider throws', () => {
    function Bare() {
      useAuth();
      return null;
    }
    expect(() => render(<Bare />)).toThrow(/within AuthProvider/);
  });

  test('login() targets a same-origin-relative URL — proves API_BASE="" is correct', async () => {
    // Audit guard: the auto-tool flags `API_BASE = ''` in
    // AuthContext.jsx as a "threshold-outcome mismatch". This test
    // pins the deliberate behavior: every AuthContext fetch must
    // start with "/", not with an absolute http(s):// URL. That's
    // what makes the single-origin Render deployment work — the
    // SPA bundle and the FastAPI backend share an origin, so a
    // relative path resolves to the right host automatically.
    const calls = [];
    global.fetch = vi.fn().mockImplementation((url, opts) => {
      calls.push({ url, opts });
      return Promise.resolve({
        ok: true,
        json: async () => ({ access_token: 'tok' }),
      });
    });
    const get = renderWithProvider();
    await act(async () => {
      await get().login('a@b.com', 'longenough');
    });
    const loginCall = calls.find((c) => String(c.url).includes('/auth/login'));
    expect(loginCall).toBeTruthy();
    const u = String(loginCall.url);
    expect(u.startsWith('/')).toBe(true);
    expect(u).not.toMatch(/^https?:\/\//);
    expect(u).toBe('/auth/login');
    expect(loginCall.opts?.method).toBe('POST');
  });

  test('register() also uses same-origin-relative URL', async () => {
    const calls = [];
    global.fetch = vi.fn().mockImplementation((url, opts) => {
      calls.push({ url, opts });
      return Promise.resolve({
        ok: true,
        json: async () => ({ access_token: 'tok' }),
      });
    });
    const get = renderWithProvider();
    await act(async () => {
      await get().register('a@b.com', 'longenough');
    });
    const registerCall = calls.find((c) =>
      String(c.url).includes('/auth/register'),
    );
    expect(registerCall).toBeTruthy();
    expect(String(registerCall.url)).toBe('/auth/register');
    expect(String(registerCall.url)).not.toMatch(/^https?:\/\//);
  });
});
