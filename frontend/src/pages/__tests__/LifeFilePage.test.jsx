import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('../../lib/api', () => ({ default: { get } }));

import LifeFilePage, { daysUntil, parseCardDate } from '../LifeFilePage';

describe('LifeFilePage (phase 4, audit #9 — life routers UI)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('fail-open: every card shows «چیزی ثبت نشده» when all APIs reject', async () => {
    get.mockRejectedValue(new Error('boom'));
    render(<LifeFilePage />);
    expect(screen.getByTestId('life-file-page')).toBeInTheDocument();

    // 6 cards (identity, uae-license, rta, subscriptions, neteller, bank
    // sheets) must each render their own empty state — never a blank page.
    await waitFor(() =>
      expect(screen.getAllByText('چیزی ثبت نشده')).toHaveLength(6),
    );
    expect(screen.getByTestId('life-card-identity-empty')).toBeInTheDocument();
    expect(screen.getByTestId('life-card-uae-license-empty')).toBeInTheDocument();
    expect(screen.getByTestId('life-card-rta-empty')).toBeInTheDocument();
    expect(screen.getByTestId('life-card-subscriptions-empty')).toBeInTheDocument();
    expect(screen.getByTestId('life-card-neteller-empty')).toBeInTheDocument();
    expect(screen.getByTestId('life-card-bank-sheets-empty')).toBeInTheDocument();
  });

  test('renders data + expiry countdown when the identity API answers', async () => {
    const future = new Date();
    future.setDate(future.getDate() + 10); // < 30 → urgent countdown
    const iso = future.toISOString().slice(0, 10);
    get.mockImplementation((url) => {
      if (url === '/documents/identity') {
        return Promise.resolve({
          data: [{ id: 1, full_name: 'Mohamad', emirates_id_number: '784-1988', expiry_date: iso }],
        });
      }
      return Promise.reject(new Error('empty'));
    });
    render(<LifeFilePage />);
    await waitFor(() => expect(screen.getByText('Mohamad')).toBeInTheDocument());
    expect(screen.getByText('10 روز مانده')).toBeInTheDocument();
    // The other five cards still fail-open independently.
    await waitFor(() =>
      expect(screen.getAllByText('چیزی ثبت نشده')).toHaveLength(5),
    );
  });

  test('date helpers parse ISO and DD/MM/YYYY card prints', () => {
    expect(parseCardDate('2027-02-01').getFullYear()).toBe(2027);
    expect(parseCardDate('01/02/2027').getMonth()).toBe(1); // February
    expect(parseCardDate('')).toBeNull();
    expect(parseCardDate('not-a-date')).toBeNull();
    const today = new Date();
    expect(daysUntil(today)).toBe(0);
  });
});
