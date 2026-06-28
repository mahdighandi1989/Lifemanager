import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

// The task-aware AI feedback panel on the Smart Assistant page (task e606cca6):
// it must TRIGGER the existing backend POST /api/ai/analyze-tasks and render the
// returned feedback + context counts. (The backend was complete + tested; the
// gap was that no UI surfaced it.)
const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('../../lib/api', () => ({ default: { post } }));

import SmartAssistant from '../SmartAssistant';

beforeEach(() => vi.clearAllMocks());

describe('SmartAssistant task-feedback panel (task e606cca6)', () => {
  test('triggers /ai/analyze-tasks and renders feedback + context', async () => {
    post.mockResolvedValue({
      data: {
        feedback: 'دو کار عقب‌افتاده داری؛ امروز یکی را تمام کن.',
        context: { total: 5, completed: 2, pending: 3, overdue: 2 },
      },
    });
    render(<SmartAssistant />);
    expect(screen.getByTestId('task-feedback-card')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('task-feedback-btn'));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/ai/analyze-tasks', { task_id: null }),
    );
    await waitFor(() =>
      expect(screen.getByTestId('task-feedback-text')).toHaveTextContent('دو کار عقب‌افتاده'),
    );
    // the context counts render
    expect(screen.getByTestId('task-feedback-context')).toHaveTextContent('5');
  });
});
