import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

const get = vi.fn();
const post = vi.fn();
vi.mock('../../../lib/api', () => ({
  default: { get: (...a) => get(...a), post: (...a) => post(...a) },
}));

import DeduplicationPanel from '../DeduplicationPanel';

beforeEach(() => {
  vi.clearAllMocks();
});

const GROUP = {
  entity_type: 'task',
  entity_ids: [1, 2],
  items: [
    { id: 1, label: 'A' },
    { id: 2, label: 'B' },
  ],
};

describe('DeduplicationPanel (task fbd9bd36 AC4)', () => {
  test('scan lists similar groups with a merge button per item', async () => {
    post.mockResolvedValueOnce({ data: { job_id: 'j1', status: 'completed', group_count: 1 } });
    get.mockResolvedValueOnce({ data: { groups: [GROUP] } });

    render(<DeduplicationPanel />);
    fireEvent.click(screen.getByTestId('dedup-scan-btn'));

    await waitFor(() => expect(screen.getByTestId('dedup-group-0')).toBeInTheDocument());
    expect(screen.getByTestId('dedup-merge-0-1')).toBeInTheDocument();
    expect(screen.getByTestId('dedup-merge-0-2')).toBeInTheDocument();
  });

  test('clicking merge POSTs source/target/entity_type', async () => {
    post.mockResolvedValueOnce({ data: { job_id: 'j1', group_count: 1 } }); // scan
    get.mockResolvedValue({ data: { groups: [GROUP] } });

    render(<DeduplicationPanel />);
    fireEvent.click(screen.getByTestId('dedup-scan-btn'));
    await waitFor(() => expect(screen.getByTestId('dedup-merge-0-1')).toBeInTheDocument());

    post.mockResolvedValueOnce({ data: { ok: true } }); // merge
    post.mockResolvedValueOnce({ data: { job_id: 'j2', group_count: 0 } }); // re-scan
    fireEvent.click(screen.getByTestId('dedup-merge-0-1'));

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(
        '/deduplication/merge',
        expect.objectContaining({ source_id: 1, target_id: 2, entity_type: 'task' }),
      ),
    );
  });
});
