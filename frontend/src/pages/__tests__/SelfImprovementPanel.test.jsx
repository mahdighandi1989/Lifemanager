import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React from 'react';

import { SelfImprovementPanel } from '../ListDetail';

// The re-lit خودسازی daily-tracking strip (audit «کمتر ولی زنده», move 2).
// It fetches /api/self-improvement/overview, shows a check-in row per
// checklist item for the matching list, and posts /daily-update on toggle.
// Detection is data-driven: no matching section → renders nothing.

const OVERVIEW = {
  as_of: '2026-07-21',
  completed_today_total: 1,
  items_total: 2,
  sections: [
    {
      list_id: 42,
      list_name: 'مرد الهی',
      completed_today: 1,
      total: 2,
      items: [
        { item_id: 100, content: 'نمازِ اول وقت', status: 'done', kind: 'checklist', is_auto: false },
        { item_id: 101, content: 'ورزش', status: 'pending', kind: 'checklist', is_auto: false },
        { item_id: 102, content: 'یک یادداشتِ فلسفی', status: 'pending', kind: 'note', is_auto: false },
      ],
    },
  ],
};

describe('SelfImprovementPanel (re-lit daily check-in)', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url, opts) => {
      if (url.endsWith('/self-improvement/overview')) {
        return Promise.resolve({ ok: true, json: async () => OVERVIEW });
      }
      if (url.endsWith('/self-improvement/daily-update')) {
        return Promise.resolve({ ok: true, json: async () => ({ applied: 1, checkins: [] }) });
      }
      return Promise.resolve({ ok: false, json: async () => ({}) });
    });
  });
  afterEach(() => vi.restoreAllMocks());

  test('renders the daily strip for a matching self-improvement list', async () => {
    render(<SelfImprovementPanel listId={42} />);
    await waitFor(() => expect(screen.getByTestId('si-daily-panel')).toBeInTheDocument());
    // Both checklist rows show; the note row is excluded (not a habit).
    expect(screen.getByTestId('si-checkin-100')).toBeInTheDocument();
    expect(screen.getByTestId('si-checkin-101')).toBeInTheDocument();
    expect(screen.queryByTestId('si-checkin-102')).toBeNull();
    // Progress reflects the section totals.
    expect(screen.getByText('امروز 1 از 2')).toBeInTheDocument();
  });

  test('renders nothing for a list the engine does not manage', async () => {
    render(<SelfImprovementPanel listId={999} />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.queryByTestId('si-daily-panel')).toBeNull();
  });

  test('toggling a pending item posts a done check-in', async () => {
    render(<SelfImprovementPanel listId={42} />);
    await waitFor(() => expect(screen.getByTestId('si-checkin-101')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('si-checkin-101'));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/self-improvement/daily-update',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ item_id: 101, status: 'done' }),
        }),
      ),
    );
  });
});
