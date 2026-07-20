/**
 * Dashboard — phase-2 domain cards (audit #5).
 *
 * GET /api/command-center/today grew four buckets (calendar / finance /
 * people / growth); the dashboard renders one compact card per bucket.
 * These tests pin:
 *   1. All four cards render from a mocked /command-center/today payload
 *      — one balance row PER currency (never summed together), the
 *      calendar event with its HH:MM time, the people reminder, and the
 *      growth «X از Y» progress.
 *   2. The «ایمیل و تقویم گوگل» section is collapsed by default —
 *      GoogleLifePanel stays unmounted (its /google/* calls must not
 *      fire on page load) and mounts on toggle, fail-open even when
 *      every google API call rejects.
 *
 * lib/api is mocked with the DriveSettings.test.jsx idiom; the legacy
 * stats fetches (/api/tasks, /api/projects) use a plain fetch mock.
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
    put: (...a) => Promise.reject(new Error('not mocked')),
  },
}));

import Dashboard from '../Dashboard';

const todayPayload = {
  today: '2026-07-20',
  calendar: {
    events: [
      {
        id: 1,
        summary: 'جلسه کاری',
        start_at: '2026-07-20T09:30:00+00:00',
        all_day: false,
        location: null,
      },
      { id: 2, summary: 'روز تعطیل', start_at: '2026-07-21T00:00:00+00:00', all_day: true, location: null },
    ],
  },
  finance: {
    balances_by_currency: [
      { currency: 'IRR', accounts: 2, total: 1500000 },
      { currency: 'USD', accounts: 1, total: 250 },
    ],
    subscriptions: [
      { id: 7, provider: 'Netflix', plan: 'Premium', next_payment_date: '2026-08-01' },
    ],
  },
  people: {
    reminders: [{ person_id: 3, person_name: 'مریم', note: 'هدیه تولد' }],
    reminders_count: 1,
  },
  growth: { today_total: 5, today_done: 2 },
  tasks: {
    overdue: [], due_today: [], upcoming: [],
    overdue_count: 0, due_today_count: 0, upcoming_count: 0, open_count: 0,
  },
  todo: { due: [], starred: [] },
  notifications: { unread_count: 0, latest: [] },
  inbox: { pending_count: 0, latest: [] },
  stats: { tasks_total: 0, tasks_done: 0, projects_total: 0 },
};

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard — phase-2 domain cards (audit #5)', () => {
  let originalFetch;

  beforeEach(() => {
    vi.clearAllMocks();
    get.mockImplementation((url) => {
      if (url === '/command-center/today') {
        return Promise.resolve({ data: todayPayload });
      }
      // Everything else (e.g. GoogleLifePanel's /google/*) rejects —
      // the components under test must stay fail-open regardless.
      return Promise.reject(new Error(`not mocked: ${url}`));
    });
    post.mockRejectedValue(new Error('not mocked'));
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('renders the four new cards from /command-center/today', async () => {
    renderDashboard();

    // Card titles.
    await screen.findByText(/تقویم امروز/);
    expect(screen.getByText(/💰 مالی/)).toBeInTheDocument();
    expect(screen.getByText(/👥 افراد/)).toBeInTheDocument();
    expect(screen.getByText(/رشد امروز/)).toBeInTheDocument();

    // Calendar: the event row with an HH:MM time, and the all-day row.
    const eventRow = await screen.findByText('جلسه کاری');
    expect(eventRow).toBeInTheDocument();
    expect(screen.getByText(/^\d{2}:\d{2}$/)).toBeInTheDocument();
    expect(screen.getByText('تمام‌روز')).toBeInTheDocument();

    // Finance: one row PER currency — totals are never summed together.
    expect(screen.getByTestId('finance-currency-IRR')).toBeInTheDocument();
    expect(screen.getByTestId('finance-currency-USD')).toBeInTheDocument();
    expect(screen.getByText('Netflix — Premium')).toBeInTheDocument();
    expect(screen.getByText('2026-08-01')).toBeInTheDocument();

    // People: reminders_count badge content + the reminder row.
    expect(screen.getByText(/مریم/)).toBeInTheDocument();
    expect(screen.getByText(/هدیه تولد/)).toBeInTheDocument();

    // Growth: X از Y + progress bar.
    expect(screen.getByText('2 از 5 انجام شد')).toBeInTheDocument();
    expect(screen.getByTestId('growth-progress')).toBeInTheDocument();
  });

  test('«ایمیل و تقویم گوگل» is collapsed by default and mounts fail-open on toggle', async () => {
    renderDashboard();
    await screen.findByText(/تقویم امروز/);

    // Collapsed: the panel is NOT mounted, so no /google/* call fired.
    expect(screen.queryByTestId('google-life-panel')).not.toBeInTheDocument();
    expect(get).not.toHaveBeenCalledWith('/google/status');

    fireEvent.click(screen.getByTestId('dashboard-google-toggle'));

    // Mounted after the toggle — and it survives every google API call
    // rejecting (fail-open), without blanking the dashboard.
    await screen.findByTestId('google-life-panel');
    await waitFor(() =>
      expect(get).toHaveBeenCalledWith('/google/status'),
    );
    expect(screen.getByText(/تقویم امروز/)).toBeInTheDocument();
  });
});
