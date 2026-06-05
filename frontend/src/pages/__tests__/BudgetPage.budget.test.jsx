import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

const get = vi.fn();
const post = vi.fn();
vi.mock('../../lib/api', () => ({
  default: { get: (...a) => get(...a), post: (...a) => post(...a) },
}));

import BudgetPage from '../BudgetPage';

beforeEach(() => {
  vi.clearAllMocks();
  // URL-aware: account list on mount, finance insights for the AI panel.
  get.mockImplementation((url) => {
    if (url === '/finance/insights') {
      return Promise.resolve({
        data: {
          summary: { total_balance: 200 },
          suggestions: [
            { title: 'خرید لپ‌تاپ', estimated_cost: 50, affordable: true, recommendation: 'اکنون مقرون‌به‌صرفه است' },
          ],
          analysis: 'پیشنهاد بودجه‌ای',
          model_used: 'placeholder',
        },
      });
    }
    return Promise.resolve({
      data: [{ id: 1, name: 'بانک', kind: 'bank', balance: 200, currency: 'USD' }],
    });
  });
});

describe('BudgetPage purchase check + AI insight (task 4ae4b3ca AC 12/13)', () => {
  test('purchase check POSTs to /finance/budget/evaluate and shows result', async () => {
    post.mockResolvedValueOnce({
      data: { affordable: true, priority: 'high', available_budget: 200, requested: 50 },
    });
    render(<BudgetPage />);
    fireEvent.change(screen.getByTestId('purchase-amount-input'), { target: { value: '50' } });
    fireEvent.click(screen.getByTestId('purchase-check-btn'));
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(
        '/finance/budget/evaluate',
        expect.objectContaining({ amount: 50 }),
      ),
    );
    await waitFor(() => expect(screen.getByTestId('purchase-result')).toBeInTheDocument());
  });

  test('AI insight GETs /finance/insights and shows analysis + suggestions', async () => {
    render(<BudgetPage />);
    fireEvent.click(screen.getByTestId('ai-insight-btn'));
    await waitFor(() => expect(get).toHaveBeenCalledWith('/finance/insights'));
    await waitFor(() =>
      expect(screen.getByTestId('ai-insight-text').textContent).toMatch(/پیشنهاد بودجه‌ای/),
    );
    expect(screen.getByTestId('ai-insight-text').textContent).toMatch(/خرید لپ‌تاپ/);
  });

  test('AI insight degrades gracefully on 403', async () => {
    get.mockImplementation((url) => {
      if (url === '/finance/insights') {
        return Promise.reject({ response: { status: 403 }, message: 'forbidden' });
      }
      return Promise.resolve({
        data: [{ id: 1, name: 'بانک', kind: 'bank', balance: 200, currency: 'USD' }],
      });
    });
    render(<BudgetPage />);
    fireEvent.click(screen.getByTestId('ai-insight-btn'));
    await waitFor(() =>
      expect(screen.getByTestId('ai-insight-text').textContent).toMatch(/غیرفعال/),
    );
  });
});
