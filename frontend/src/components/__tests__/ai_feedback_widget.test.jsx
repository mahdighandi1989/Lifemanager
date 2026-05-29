import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

const get = vi.fn();
const post = vi.fn();
vi.mock('../../lib/api', () => ({
  default: { get: (...a) => get(...a), post: (...a) => post(...a) },
}));

import AIFeedbackWidget from '../AIFeedbackWidget';

beforeEach(() => {
  vi.clearAllMocks();
  get.mockResolvedValue({ data: { ai_response_quality_score: 4.2, ai_response_quality_target: 4.0, feedback_likes: 3, feedback_dislikes: 1 } });
  post.mockResolvedValue({ data: { accepted: true } });
});

describe('AIFeedbackWidget (task 97867b277c1b)', () => {
  test('renders metrics and posts a like', async () => {
    render(<AIFeedbackWidget />);
    await waitFor(() => expect(screen.getByTestId('ai-metrics')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('ai-like-btn'));
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/ai/feedback', expect.objectContaining({ liked: true })),
    );
  });

  test('posts a 1-5 score', async () => {
    render(<AIFeedbackWidget />);
    fireEvent.click(screen.getByTestId('ai-score-5'));
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/ai/feedback', expect.objectContaining({ score: 5 })),
    );
  });
});
