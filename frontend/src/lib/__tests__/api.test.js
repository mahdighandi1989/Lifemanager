/**
 * Unit tests for lib/api.js.
 *
 * Axios' `interceptors.request.use` / `interceptors.response.use` accept
 * a (config, error) pair and store them on the returned instance. We
 * intercept axios.create() with vi.mock and capture the handlers that
 * api.js registers, then drive them directly with synthetic configs and
 * error objects. No real HTTP is exercised — the only behaviour we
 * verify here is the bookkeeping the interceptors do on the way in/out.
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Capture handlers registered against the axios instance so the tests can
// invoke them with arbitrary inputs.
const captured = {
  requestSuccess: null,
  requestError: null,
  responseSuccess: null,
  responseError: null,
  createConfig: null,
};

vi.mock('axios', () => {
  const instance = {
    interceptors: {
      request: {
        use: (success, error) => {
          captured.requestSuccess = success;
          captured.requestError = error;
        },
      },
      response: {
        use: (success, error) => {
          captured.responseSuccess = success;
          captured.responseError = error;
        },
      },
    },
  };
  return {
    default: {
      create: (config) => {
        captured.createConfig = config;
        return instance;
      },
    },
  };
});

// Import after the mock so api.js sees the stubbed axios.
await import('../api');

describe('lib/api.js', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset jsdom URL to a stable starting point.
    window.history.replaceState({}, '', '/');
  });

  test('creates an axios instance with baseURL=/api', () => {
    expect(captured.createConfig).toBeTruthy();
    expect(captured.createConfig.baseURL).toBe('/api');
  });

  test('request interceptor attaches the JWT when present in localStorage', () => {
    localStorage.setItem('token', 'jwt-token-xyz');
    const out = captured.requestSuccess({ headers: {} });
    expect(out.headers.Authorization).toBe('Bearer jwt-token-xyz');
  });

  test('request interceptor leaves Authorization unset when no token', () => {
    const out = captured.requestSuccess({ headers: {} });
    expect(out.headers.Authorization).toBeUndefined();
  });

  test('request interceptor stamps X-LM-Page with the ROUTE PATTERN', () => {
    // /lists/5 must be reported as its pattern, not the concrete URL —
    // the live system diagram learns its page→router wires from this.
    window.history.replaceState({}, '', '/lists/5');
    const out = captured.requestSuccess({ headers: {} });
    expect(out.headers['X-LM-Page']).toBe('/lists/:listId');
  });

  test('X-LM-Page falls back to the raw pathname off the route table', () => {
    window.history.replaceState({}, '', '/no-such-page');
    const out = captured.requestSuccess({ headers: {} });
    expect(out.headers['X-LM-Page']).toBe('/no-such-page');
  });

  test('request interceptor rejects on error', async () => {
    const boom = new Error('boom');
    await expect(captured.requestError(boom)).rejects.toBe(boom);
  });

  test('response success interceptor returns the response unchanged', () => {
    const resp = { status: 200, data: { ok: true } };
    expect(captured.responseSuccess(resp)).toBe(resp);
  });

  test('401 response clears the stored token and triggers a /login redirect', async () => {
    localStorage.setItem('token', 'stale');
    // Replace assign with a no-op spy. Using a plain assignment avoids
    // jsdom versions where location properties are non-configurable for
    // vi.spyOn.
    const originalAssign = window.location.assign;
    const assignSpy = vi.fn();
    window.location.assign = assignSpy;
    try {
      await expect(
        captured.responseError({ response: { status: 401 } }),
      ).rejects.toMatchObject({ response: { status: 401 } });
      expect(localStorage.getItem('token')).toBeNull();
      expect(assignSpy).toHaveBeenCalledWith('/login');
    } finally {
      window.location.assign = originalAssign;
    }
  });

  test('401 while already on /login does not redirect (no loop)', async () => {
    window.history.replaceState({}, '', '/login');
    localStorage.setItem('token', 'stale');
    const originalAssign = window.location.assign;
    const assignSpy = vi.fn();
    window.location.assign = assignSpy;
    try {
      await expect(
        captured.responseError({ response: { status: 401 } }),
      ).rejects.toBeTruthy();
      expect(assignSpy).not.toHaveBeenCalled();
    } finally {
      window.location.assign = originalAssign;
    }
  });

  test('non-401 errors pass through untouched (token stays put)', async () => {
    localStorage.setItem('token', 'keep-me');
    await expect(
      captured.responseError({ response: { status: 500 } }),
    ).rejects.toBeTruthy();
    expect(localStorage.getItem('token')).toBe('keep-me');
  });
});
