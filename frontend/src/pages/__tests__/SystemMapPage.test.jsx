import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// vi.mock is hoisted, so build the mock fns via vi.hoisted to avoid the
// "cannot access before initialization" trap (same idiom as MorePages.test).
const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('../../lib/api', () => ({ default: { get } }));

import SystemMapPage from '../SystemMapPage';

const PAYLOAD = {
  ok: true,
  counts: {
    tasks: 42,
    projects: 3,
    lists: 33,
    todo_items: 812,
    writings: 7,
    people: 19,
    accounts: 4,
    transactions: -1, // unavailable → chip must be hidden
    emails_synced: 120,
    events_synced: 55,
    inbox_pending: 2,
  },
  sections: [
    {
      key: 'capture',
      title: 'ثبت و ورود',
      items: [
        { name: 'کپچر تلگرام', url: null, auto: true, desc: 'هر پیام تلگرام → تسک' },
        { name: 'ایمپورت داده', url: '/import', auto: false, desc: 'ورود فایل/اکسل' },
      ],
    },
    {
      key: 'life',
      title: 'زندگی و دارایی',
      items: [
        { name: 'پروندهٔ زندگی', url: '/life-file', auto: true, desc: 'مدارک و اشتراک‌ها' },
      ],
    },
  ],
};

describe('SystemMapPage (phase 4, critic #8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    get.mockResolvedValue({ data: PAYLOAD });
  });

  test('renders sections, linked items, auto badge and desc', async () => {
    render(
      <MemoryRouter>
        <SystemMapPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('system-map-page')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('ثبت و ورود')).toBeInTheDocument());
    expect(get).toHaveBeenCalledWith('/system-map');

    // Section titles
    expect(screen.getByText('زندگی و دارایی')).toBeInTheDocument();
    // Item with url renders as a react-router link
    expect(screen.getByText('ایمپورت داده').closest('a')).toHaveAttribute('href', '/import');
    expect(screen.getByText('پروندهٔ زندگی').closest('a')).toHaveAttribute('href', '/life-file');
    // Item without url is plain text (no anchor)
    expect(screen.getByText('کپچر تلگرام').closest('a')).toBeNull();
    // auto=true items carry the «خودکار ⚙️» badge (2 of the 3 items)
    expect(screen.getAllByText('خودکار ⚙️')).toHaveLength(2);
    // desc rendered in muted text
    expect(screen.getByText('ورود فایل/اکسل')).toBeInTheDocument();
  });

  test('renders count chips with Persian labels and hides -1 chips', async () => {
    render(
      <MemoryRouter>
        <SystemMapPage />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('system-map-chip-tasks')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('system-map-chip-tasks')).toHaveTextContent('42');
    expect(screen.getByTestId('system-map-chip-tasks')).toHaveTextContent('تسک‌ها');
    expect(screen.getByTestId('system-map-chip-inbox_pending')).toHaveTextContent('در انتظار');
    // transactions is -1 (unavailable) → no chip
    expect(screen.queryByTestId('system-map-chip-transactions')).toBeNull();
  });
});
