import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

// «دیدن → اقدام» (audit #10): each actionable scan finding gets a «➕ ساخت تسک»
// button that POSTs the finding's {rule,label,detail,date} to
// /api/attention/create-task; inbox_stale (not actionable) gets no button.
const { get, post, put } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
vi.mock('../../lib/api', () => ({ default: { get, post, put } }));

import AttentionCenter from '../AttentionCenter';

beforeEach(() => {
  vi.clearAllMocks();
  get.mockImplementation((url) => {
    if (url === '/attention/scan') {
      return Promise.resolve({
        data: {
          count: 2,
          findings: [
            {
              rule: 'license_expiry',
              label: 'گواهینامه رانندگی',
              detail: '۱۰ روز مانده',
              date: '2026-08-01',
            },
            { rule: 'inbox_stale', label: 'صندوق ورودی', detail: '۳ مورد مانده', date: null },
          ],
          rule_titles: { license_expiry: 'انقضای مدرک', inbox_stale: 'صندوق ورودی' },
        },
      });
    }
    if (url === '/attention/settings') {
      return Promise.resolve({
        data: {
          settings: {
            enabled: true,
            brief_enabled: true,
            brief_hour: 8,
            tz_offset_minutes: 210,
            expiry_days: 30,
            subscription_days: 7,
            inbox_stale_hours: 48,
          },
        },
      });
    }
    if (url === '/weekly-review/settings') {
      return Promise.resolve({ data: { settings: { enabled: true, weekday: 0, hour: 9 } } });
    }
    if (url === '/weekly-review') {
      return Promise.resolve({ data: { reviews: [] } });
    }
    return Promise.resolve({ data: {} });
  });
});

describe('AttentionCenter create-task from finding (audit #10)', () => {
  test('button posts the finding payload and shows the created task title', async () => {
    post.mockResolvedValue({
      data: { ok: true, task_id: 7, title: 'تمدید گواهینامه — گواهینامه رانندگی' },
    });
    render(<AttentionCenter />);

    const btn = await screen.findByTestId('attention-create-task-license_expiry-0');
    fireEvent.click(btn);

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/attention/create-task', {
        rule: 'license_expiry',
        label: 'گواهینامه رانندگی',
        detail: '۱۰ روز مانده',
        date: '2026-08-01',
      }),
    );
    // brief success note with the created task's title
    await waitFor(() =>
      expect(screen.getByText(/تسک ساخته شد: تمدید گواهینامه/)).toBeInTheDocument(),
    );
  });

  test('inbox_stale findings get no create-task button', async () => {
    render(<AttentionCenter />);
    await screen.findByTestId('attention-create-task-license_expiry-0');
    expect(screen.queryByTestId('attention-create-task-inbox_stale-0')).toBeNull();
  });
});
