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
});
