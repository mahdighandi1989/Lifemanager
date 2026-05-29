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
  get.mockResolvedValue({
    data: [{ id: 1, name: 'بانک', kind: 'bank', balance: 200, currency: 'USD' }],
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

  test('AI insight POSTs to /ai/analyze and shows text', async () => {
    post.mockResolvedValueOnce({ data: { insights: 'پیشنهاد بودجه‌ای' } });
    render(<BudgetPage />);
    fireEvent.click(screen.getByTestId('ai-insight-btn'));
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(
        '/ai/analyze',
        expect.objectContaining({ prompt: expect.any(String) }),
      ),
    );
    await waitFor(() => expect(screen.getByTestId('ai-insight-text')).toBeInTheDocument());
  });

  test('AI insight degrades gracefully on 403', async () => {
    post.mockRejectedValueOnce({ response: { status: 403 }, message: 'forbidden' });
    render(<BudgetPage />);
    fireEvent.click(screen.getByTestId('ai-insight-btn'));
    await waitFor(() =>
      expect(screen.getByTestId('ai-insight-text').textContent).toMatch(/غیرفعال/),
    );
  });
});
