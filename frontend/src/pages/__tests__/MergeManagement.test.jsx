import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('../../lib/api', () => ({ default: { post } }));

import MergeManagement from '../MergeManagement';

describe('MergeManagement (task fbd9bd36 AC5/AC7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    post.mockImplementation((url) => {
      if (url === '/merge/suggestions') {
        return Promise.resolve({
          data: {
            suggestions: [
              { entity_ids: [1, 2], tasks: [{ id: 1, title: 'task a' }, { id: 2, title: 'task b' }] },
            ],
          },
        });
      }
      return Promise.resolve({ data: { ok: true, merged_ids: [2] } });
    });
  });

  test('renders suggestions and confirms a merge', async () => {
    render(<MergeManagement />);
    expect(screen.getByTestId('merge-page')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('task a')).toBeInTheDocument());
    expect(screen.getByTestId('merge-suggestion')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('merge-confirm-btn'));
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(
        '/merge/execute',
        expect.objectContaining({ entity_ids: [1, 2] }),
      ),
    );
  });
});
