import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

const get = vi.fn();
const post = vi.fn();
const del = vi.fn();
vi.mock('../../lib/api', () => ({
  default: {
    get: (...a) => get(...a),
    post: (...a) => post(...a),
    delete: (...a) => del(...a),
  },
}));

import DataSafetyPanel from '../DataSafetyPanel';

const mockHappyGets = ({ trash } = {}) => {
  get.mockImplementation((url) => {
    if (url === '/settings/owner-actions') {
      return Promise.resolve({
        data: {
          ok: true,
          pending_count: 1,
          actions: [
            { key: 'telegram_token', title: 'توکن بات تلگرام', done: false, how: 'ست کن', detail: 'بدون آن خاموش است' },
            { key: 'google_connection', title: 'اتصال گوگل', done: true, how: 'وصل کن', detail: '' },
            { key: 'keepalive', title: 'پینگ بیدارباش', done: null, how: 'GitHub Actions', detail: '' },
          ],
        },
      });
    }
    if (url === '/backup/status') {
      return Promise.resolve({
        data: {
          ok: true,
          status: {
            last_ok_at: '2026-07-19T22:00:00+00:00',
            last_attempt_at: '2026-07-19T22:00:00+00:00',
            last_error: null,
            last_file_name: 'lifemanager-backup.json.gz',
            last_size_bytes: 2048,
            is_stale: false,
            drive_configured: true,
          },
        },
      });
    }
    if (url === '/trash') {
      return Promise.resolve({
        data:
          trash || {
            ok: true,
            items: [{ id: 5, content: 'خرید نان', description: null, due_date: null, is_completed: false, deleted_at: '2026-07-18T10:00:00+00:00' }],
            writings: [{ id: 9, title: 'یادداشت سفر', category: 'خاطره', body_chars: 120, deleted_at: '2026-07-17T09:00:00+00:00' }],
          },
      });
    }
    return Promise.resolve({ data: {} });
  });
};

beforeEach(() => vi.clearAllMocks());

describe('DataSafetyPanel (تنظیمات → ایمنی داده)', () => {
  test('renders the three cards with owner actions, backup status and trash rows', async () => {
    mockHappyGets();
    render(<DataSafetyPanel />);

    expect(screen.getByTestId('data-safety-panel')).toBeInTheDocument();
    expect(screen.getByTestId('owner-actions-card')).toBeInTheDocument();
    expect(screen.getByTestId('backup-card')).toBeInTheDocument();
    expect(screen.getByTestId('trash-card')).toBeInTheDocument();

    // owner actions: rows + pending badge + the not-checkable hint
    await waitFor(() =>
      expect(screen.getByTestId('owner-action-row-telegram_token')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('owner-actions-pending')).toHaveTextContent('1');
    expect(screen.getByText('قابل بررسی از داخل اپ نیست')).toBeInTheDocument();

    // «چطور؟» expands to the how/detail lines
    fireEvent.click(screen.getByTestId('owner-action-how-telegram_token'));
    expect(screen.getByText('ست کن')).toBeInTheDocument();
    expect(screen.getByText('بدون آن خاموش است')).toBeInTheDocument();

    // backup: run button + plain export link (browser navigation, not XHR)
    await waitFor(() => expect(screen.getByTestId('backup-run-btn')).toBeInTheDocument());
    expect(screen.getByTestId('backup-export-link')).toHaveAttribute('href', '/api/backup/export');

    // trash rows for both sections
    await waitFor(() => expect(screen.getByTestId('trash-item-5')).toBeInTheDocument());
    expect(screen.getByTestId('trash-writing-9')).toBeInTheDocument();
  });

  test('«بکاپ فوری» POSTs /backup/run and shows detail_fa', async () => {
    mockHappyGets();
    post.mockResolvedValue({
      data: { ok: true, detail_fa: 'پشتیبان‌گیری کامل شد و روی گوگل درایو ذخیره شد.' },
    });
    render(<DataSafetyPanel />);

    await waitFor(() => expect(screen.getByTestId('backup-run-btn')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('backup-run-btn'));

    await waitFor(() => expect(post).toHaveBeenCalledWith('/backup/run'));
    await waitFor(() =>
      expect(screen.getByTestId('backup-msg')).toHaveTextContent(
        'پشتیبان‌گیری کامل شد و روی گوگل درایو ذخیره شد.',
      ),
    );
  });

  test('«بازیابی» POSTs the restore endpoint and refreshes the trash', async () => {
    mockHappyGets();
    post.mockResolvedValue({ data: { ok: true, id: 5 } });
    render(<DataSafetyPanel />);

    await waitFor(() => expect(screen.getByTestId('trash-restore-item-5')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('trash-restore-item-5'));

    await waitFor(() => expect(post).toHaveBeenCalledWith('/trash/todo-items/5/restore'));
  });

  test('«حذف قطعی» only DELETEs after window.confirm approval', async () => {
    mockHappyGets();
    del.mockResolvedValue({ status: 204 });
    const confirmSpy = vi.spyOn(window, 'confirm');
    render(<DataSafetyPanel />);

    await waitFor(() => expect(screen.getByTestId('trash-purge-item-5')).toBeInTheDocument());

    confirmSpy.mockReturnValueOnce(false);
    fireEvent.click(screen.getByTestId('trash-purge-item-5'));
    expect(del).not.toHaveBeenCalled();

    confirmSpy.mockReturnValueOnce(true);
    fireEvent.click(screen.getByTestId('trash-purge-item-5'));
    await waitFor(() => expect(del).toHaveBeenCalledWith('/trash/todo-items/5'));

    confirmSpy.mockRestore();
  });

  test('empty trash shows the celebratory empty state', async () => {
    mockHappyGets({ trash: { ok: true, items: [], writings: [] } });
    render(<DataSafetyPanel />);

    await waitFor(() => expect(screen.getByTestId('trash-empty')).toBeInTheDocument());
    expect(screen.getByTestId('trash-empty')).toHaveTextContent('سطل زباله خالی است');
  });
});
