import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi, beforeEach } from 'vitest';

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));

vi.mock('../../lib/api', () => ({ default: { get, post } }));

import LifeFilePage, { daysUntil, parseCardDate } from '../LifeFilePage';

const renderPage = () =>
  render(
    <MemoryRouter>
      <LifeFilePage />
    </MemoryRouter>,
  );

describe('LifeFilePage (phase 4, audit #9 — life routers UI)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('fail-open: every document card shows «چیزی ثبت نشده» when the APIs reject', async () => {
    get.mockRejectedValue(new Error('boom'));
    renderPage();
    expect(screen.getByTestId('life-file-page')).toBeInTheDocument();

    // 2026-07-25: the four money cards moved to «مالی» (they were a second
    // render of the same endpoints), so two document cards remain — each with
    // its own empty state; a broken router never blanks the page.
    await waitFor(() =>
      expect(screen.getAllByText('چیزی ثبت نشده')).toHaveLength(2),
    );
    expect(screen.getByTestId('life-card-identity-empty')).toBeInTheDocument();
    expect(screen.getByTestId('life-card-uae-license-empty')).toBeInTheDocument();
    // …and the page says plainly where the money went.
    expect(screen.getByTestId('life-file-to-finance')).toHaveAttribute('href', '/budget?tab=others');
    // the money endpoints are no longer fetched twice per page load
    const urls = get.mock.calls.map(([u]) => u);
    expect(urls).not.toContain('/rta/dashboard');
    expect(urls).not.toContain('/subscriptions');
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
    renderPage();
    await waitFor(() => expect(screen.getByText('Mohamad')).toBeInTheDocument());
    expect(screen.getByText('10 روز مانده')).toBeInTheDocument();
    // The licence card still fails open independently.
    await waitFor(() =>
      expect(screen.getAllByText('چیزی ثبت نشده')).toHaveLength(1),
    );
  });

  // The documents are deliberately not auto-read, so without a form this page
  // could only ever stay empty (2026-07-25 survey).
  test('manual entry posts a document and refetches the card', async () => {
    get.mockResolvedValue({ data: [] });
    post.mockResolvedValue({ data: { id: 5 } });
    renderPage();
    await waitFor(() => expect(screen.getByTestId('identity-manual-open')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('identity-manual-open'));
    fireEvent.change(screen.getByTestId('identity-manual-full_name'), { target: { value: 'محمدمهدی' } });
    fireEvent.change(screen.getByTestId('identity-manual-expiry_date'), { target: { value: '2030-01-01' } });
    fireEvent.submit(screen.getByTestId('identity-manual'));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/documents/identity', {
        full_name: 'محمدمهدی',
        expiry_date: '2030-01-01',
      }),
    );
    // the card refetches so the new row shows without a page reload
    await waitFor(() =>
      expect(get.mock.calls.filter(([u]) => u === '/documents/identity').length).toBe(2),
    );
  });

  test('manual entry refuses to post without the required field', async () => {
    get.mockResolvedValue({ data: [] });
    renderPage();
    await waitFor(() => expect(screen.getByTestId('license-manual-open')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('license-manual-open'));
    fireEvent.submit(screen.getByTestId('license-manual'));
    await waitFor(() => expect(screen.getByTestId('license-manual-msg')).toBeInTheDocument());
    expect(post).not.toHaveBeenCalled();
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
