/**
 * Tests for the SelfImprovement (خودسازی) dashboard page.
 *
 * Stubs the api client so we don't hit the network; asserts the
 * page renders the four category sections, surfaces the AI badge
 * on auto-ticked rows, and posts the right body on a single tick
 * and on a bulk tick.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the api client BEFORE the component imports it.
vi.mock('../../lib/api', () => {
  const post = vi.fn().mockResolvedValue({ data: { applied: 1, checkins: [] } });
  const get = vi.fn();
  return { default: { get, post } };
});

import api from '../../lib/api';
import SelfImprovement from '../SelfImprovement';

const OVERVIEW = {
  as_of: '2026-05-26',
  completed_today_total: 2,
  items_total: 90,
  sections: [
    {
      category: 'muhasebe',
      label_fa: 'محاسبه میان و پایان هفته',
      list_id: 1,
      list_name: 'خودسازی - محاسبه میان و پایان هفته',
      completed_today: 0,
      total: 1,
      items: [
        { item_id: 100, content: 'سوال هفتگی', status: 'pending', is_auto: false, position: 0 },
      ],
    },
    {
      category: 'willpower',
      label_fa: 'تقویت اراده',
      list_id: 2,
      list_name: 'خودسازی - تقویت اراده',
      completed_today: 1,
      total: 2,
      items: [
        { item_id: 200, content: 'برنامه روزانه', status: 'done', is_auto: false, position: 0 },
        { item_id: 201, content: 'تمرین تمرکز', status: 'pending', is_auto: false, position: 1 },
      ],
    },
    {
      category: 'love_god',
      label_fa: 'عشق به خدا',
      list_id: 3,
      list_name: 'خودسازی - عشق به خدا',
      completed_today: 1,
      total: 1,
      items: [
        { item_id: 300, content: 'نماز اول وقت', status: 'auto_done', is_auto: true,
          ai_reason: 'planner log entry', position: 0 },
      ],
    },
    {
      category: 'fears',
      label_fa: 'ترس‌ها و شجاعت',
      list_id: 4,
      list_name: 'خودسازی - ترس‌ها و شجاعت',
      completed_today: 0,
      total: 1,
      items: [
        { item_id: 400, content: 'نوشتن لیست ترس‌ها', status: 'pending', is_auto: false, position: 0 },
      ],
    },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter>
      <SelfImprovement />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  api.get.mockResolvedValue({ data: OVERVIEW });
  api.post.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('SelfImprovement page', () => {
  test('renders the four category sections after loading', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByTestId('self-improvement-page')).toBeInTheDocument());
    expect(screen.getByTestId('si-section-muhasebe')).toBeInTheDocument();
    expect(screen.getByTestId('si-section-willpower')).toBeInTheDocument();
    expect(screen.getByTestId('si-section-love_god')).toBeInTheDocument();
    expect(screen.getByTestId('si-section-fears')).toBeInTheDocument();
  });

  test('header shows aggregate completion', async () => {
    renderPage();
    await waitFor(() => screen.getByTestId('si-summary-total'));
    expect(screen.getByTestId('si-summary-total').textContent).toMatch(/2 \/ 90/);
  });

  test('AI badge appears on auto-ticked rows', async () => {
    renderPage();
    await waitFor(() => screen.getByTestId('si-section-love_god'));
    const row = screen.getByTestId('si-item-300');
    expect(row.textContent).toMatch(/AI/);
  });

  test('clicking a tick posts a single update', async () => {
    renderPage();
    await waitFor(() => screen.getByTestId('si-tick-201'));
    fireEvent.click(screen.getByTestId('si-tick-201'));
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/self-improvement/daily-update', {
        updates: [{ item_id: 201, status: 'done' }],
      }),
    );
  });

  test('bulk-tick posts every selected id in one call', async () => {
    renderPage();
    await waitFor(() => screen.getByTestId('si-select-100'));
    fireEvent.click(screen.getByTestId('si-select-100'));
    fireEvent.click(screen.getByTestId('si-select-201'));
    await waitFor(() => screen.getByTestId('si-bulk-done'));
    fireEvent.click(screen.getByTestId('si-bulk-done'));
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith(
        '/self-improvement/daily-update',
        expect.objectContaining({
          updates: expect.arrayContaining([
            { item_id: 100, status: 'done' },
            { item_id: 201, status: 'done' },
          ]),
        }),
      ),
    );
  });

  test('link to profile page is rendered', async () => {
    renderPage();
    await waitFor(() => screen.getByTestId('si-link-profile'));
    expect(screen.getByTestId('si-link-profile')).toHaveAttribute('href', '/self-improvement/profile');
  });
});
