import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import React from 'react';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('../../lib/api', () => ({ default: { get } }));

import Header from '../Header';
import { AuthProvider } from '../../context/AuthContext';

const SEARCH_PAYLOAD = {
  ok: true,
  query: 'پروژه',
  total: 2,
  results: [
    { kind: 'task', kind_fa: 'تسک', id: 1, title: 'پروژهٔ رندر', snippet: 'دیپلوی', url: '/tasks' },
    { kind: 'list', kind_fa: 'لیست', id: 9, title: 'لیست پروژه‌ها', snippet: '', url: '/lists/9' },
  ],
};

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location-probe">{location.pathname}</div>;
}

function renderHeader() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/']}>
        <Header />
        <LocationProbe />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('Header global search (phase 4, critic #5/#7)', () => {
  let originalFetch;

  beforeEach(() => {
    vi.clearAllMocks();
    // AuthProvider needs a token for isAuthenticated and calls /auth/me via
    // fetch (NOT the axios lib) — a non-401 failure keeps the token.
    localStorage.setItem('token', 'test-token');
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    get.mockImplementation((url) => {
      if (url === '/search') return Promise.resolve({ data: SEARCH_PAYLOAD });
      return Promise.resolve({ data: [] }); // NotificationBell etc.
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    localStorage.removeItem('token');
  });

  test('typing ≥2 chars debounces, calls /api/search and renders grouped results', async () => {
    renderHeader();
    const input = screen.getByTestId('global-search-input');
    fireEvent.change(input, { target: { value: 'پروژه' } });

    // Debounced 300ms → the call happens after the delay.
    await waitFor(() =>
      expect(get).toHaveBeenCalledWith('/search', { params: { q: 'پروژه' } }),
    );
    await waitFor(() =>
      expect(screen.getByTestId('global-search-results')).toBeInTheDocument(),
    );
    // kind_fa badge + title + snippet
    expect(screen.getByText('تسک')).toBeInTheDocument();
    expect(screen.getByText('پروژهٔ رندر')).toBeInTheDocument();
    expect(screen.getByText('دیپلوی')).toBeInTheDocument();
    expect(screen.getByText('لیست پروژه‌ها')).toBeInTheDocument();
  });

  test('one char does not trigger a search', async () => {
    renderHeader();
    fireEvent.change(screen.getByTestId('global-search-input'), { target: { value: 'پ' } });
    await new Promise((r) => setTimeout(r, 400));
    expect(get).not.toHaveBeenCalledWith('/search', expect.anything());
    expect(screen.queryByTestId('global-search-results')).toBeNull();
  });

  test('clicking a result navigates to its url and clears the box', async () => {
    renderHeader();
    const input = screen.getByTestId('global-search-input');
    fireEvent.change(input, { target: { value: 'پروژه' } });
    await waitFor(() =>
      expect(screen.getByTestId('search-result-list-9')).toBeInTheDocument(),
    );
    // Results use onMouseDown so navigation wins the race against blur.
    fireEvent.mouseDown(screen.getByTestId('search-result-list-9'));
    await waitFor(() =>
      expect(screen.getByTestId('location-probe')).toHaveTextContent('/lists/9'),
    );
    expect(input.value).toBe('');
    expect(screen.queryByTestId('global-search-results')).toBeNull();
  });

  test('unescapes HTML entities in result title/snippet before rendering', async () => {
    get.mockImplementation((url) => {
      if (url === '/search') {
        return Promise.resolve({
          data: {
            ok: true,
            results: [
              { kind: 'task', kind_fa: 'تسک', id: 7, title: 'a &lt;b&gt; &amp; c', snippet: 'x &amp; y', url: '/tasks/7' },
            ],
          },
        });
      }
      return Promise.resolve({ data: [] });
    });
    renderHeader();
    fireEvent.change(screen.getByTestId('global-search-input'), { target: { value: 'ab' } });
    await waitFor(() =>
      expect(screen.getByTestId('search-result-task-7')).toBeInTheDocument(),
    );
    expect(screen.getByText('a <b> & c')).toBeInTheDocument();
    expect(screen.getByText('x & y')).toBeInTheDocument();
  });

  test('Escape closes the dropdown', async () => {
    renderHeader();
    const input = screen.getByTestId('global-search-input');
    fireEvent.change(input, { target: { value: 'پروژه' } });
    await waitFor(() =>
      expect(screen.getByTestId('global-search-results')).toBeInTheDocument(),
    );
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByTestId('global-search-results')).toBeNull();
  });

  test('mobile hamburger toggles a menu listing the sidebar links', () => {
    renderHeader();
    expect(screen.queryByTestId('mobile-menu')).toBeNull();
    fireEvent.click(screen.getByTestId('mobile-menu-button'));
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-sidebar-link-life-file')).toHaveAttribute('href', '/life-file');
    expect(screen.getByTestId('mobile-sidebar-link-system-map')).toHaveAttribute('href', '/system-map');
    // Navigating from the menu closes it.
    fireEvent.click(screen.getByTestId('mobile-sidebar-link-tasks'));
    expect(screen.queryByTestId('mobile-menu')).toBeNull();
  });
});
