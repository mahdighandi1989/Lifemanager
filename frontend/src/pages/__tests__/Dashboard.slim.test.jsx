/**
 * لاغرکردنِ میز فرمان (2026-07-25).
 *
 * Four «چیزی نیست» boxes plus three big counter tiles plus four link cards
 * pushed the things that actually need the owner below the fold. The rule this
 * pins: a domain with content is ALWAYS shown; a quiet one collapses into one
 * line and opens on demand; and nothing — no number, no link — was removed.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();
vi.mock('../../lib/api', () => ({
  default: {
    get: (...a) => get(...a),
    post: (...a) => post(...a),
    put: () => Promise.reject(new Error('not mocked')),
  },
}));

import Dashboard from '../Dashboard';

const quietPayload = {
  today: '2026-07-25',
  calendar: { events: [] },
  finance: { balances_by_currency: [], subscriptions: [] },
  people: { reminders: [], reminders_count: 0 },
  growth: { today_total: 0, today_done: 0 },
  tasks: {
    overdue: [{ id: 1, title: 'کارِ عقب‌افتاده', due_date: '2026-07-20' }],
    due_today: [], upcoming: [],
    overdue_count: 1, due_today_count: 0, upcoming_count: 0, open_count: 1,
  },
  todo: { due: [], starred: [] },
  notifications: { unread_count: 0, latest: [] },
  inbox: { pending_count: 0, latest: [] },
  stats: { tasks_total: 12, tasks_done: 5, projects_total: 3 },
};

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );

describe('Dashboard slimming', () => {
  let originalFetch;

  beforeEach(() => {
    vi.clearAllMocks();
    get.mockImplementation((url) =>
      url === '/command-center/today'
        ? Promise.resolve({ data: quietPayload })
        : Promise.reject(new Error(`not mocked: ${url}`)),
    );
    post.mockRejectedValue(new Error('not mocked'));
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('quiet domains collapse into one line and open on demand', async () => {
    renderDashboard();
    const strip = await screen.findByTestId('dashboard-quiet-domains');
    expect(strip).toHaveTextContent('تقویم');
    expect(strip).toHaveTextContent('مالی');
    expect(strip).toHaveTextContent('افراد');
    expect(strip).toHaveTextContent('رشد');

    // …and the empty cards themselves are gone from the page
    expect(screen.queryByText(/🗓 تقویم امروز/)).toBeNull();
    expect(screen.queryByText(/👥 افراد/)).toBeNull();

    // one click brings every one of them back — nothing was removed
    fireEvent.click(screen.getByTestId('dashboard-quiet-toggle'));
    await screen.findByText(/🗓 تقویم امروز/);
    expect(screen.getByText(/💰 مالی/)).toBeInTheDocument();
    expect(screen.getByText(/👥 افراد/)).toBeInTheDocument();
    expect(screen.getByText(/رشد امروز/)).toBeInTheDocument();
  });

  test('what needs attention is never collapsed', async () => {
    renderDashboard();
    await screen.findByText('کارِ عقب‌افتاده');
    expect(screen.getByText(/نیازمند توجه/)).toBeInTheDocument();
    // «صندوق ورودی» appears in both the section title and the scan button copy
    expect(screen.getAllByText(/صندوق ورودی/).length).toBeGreaterThan(0);
  });

  test('a domain WITH content is shown even while others are quiet', async () => {
    get.mockImplementation((url) =>
      url === '/command-center/today'
        ? Promise.resolve({
            data: {
              ...quietPayload,
              finance: {
                balances_by_currency: [{ currency: 'AED', accounts: 1, total: 500 }],
                subscriptions: [],
              },
            },
          })
        : Promise.reject(new Error('not mocked')),
    );
    renderDashboard();
    await screen.findByTestId('finance-currency-AED');       // shown, not collapsed
    const strip = screen.getByTestId('dashboard-quiet-domains');
    expect(strip).not.toHaveTextContent('مالی');             // …and not listed as quiet
    expect(strip).toHaveTextContent('تقویم');
  });

  test('the counters and every quick link survive in the compact strip', async () => {
    renderDashboard();
    const strip = await screen.findByTestId('dashboard-summary-strip');
    await waitFor(() => expect(strip).toHaveTextContent('کل وظایف'));
    expect(strip).toHaveTextContent('پروژه‌های فعال');
    expect(strip).toHaveTextContent('تکمیل‌شده');
    // the two links other surfaces link to by testid must keep working
    expect(screen.getByTestId('dashboard-attention-link')).toHaveAttribute('href', '/attention');
    expect(screen.getByTestId('dashboard-merge-link')).toHaveAttribute('href', '/merge');
  });

  test('a failed fetch never collapses anything (no false «آرام»)', async () => {
    get.mockRejectedValue(new Error('offline'));
    renderDashboard();
    await waitFor(() => expect(get).toHaveBeenCalled());
    expect(screen.queryByTestId('dashboard-quiet-domains')).toBeNull();
    expect(screen.getByText(/🗓 تقویم امروز/)).toBeInTheDocument();
  });
});
