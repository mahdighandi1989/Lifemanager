import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

const get = vi.fn();
vi.mock('../../lib/api', () => ({ default: { get: (...a) => get(...a) } }));

import DriveFiles from '../../pages/DriveFiles';

beforeEach(() => vi.clearAllMocks());

describe('DriveFiles page (task 7367c6f0 AC8)', () => {
  test('marks Drive-stored files with a badge + download link', async () => {
    get.mockResolvedValue({
      data: [
        { id: 1, filename: 'old.pdf', storage_location: 'drive', drive_file_id: 'd1', drive_link: 'https://drive.google.com/file/d/d1/view' },
        { id: 2, filename: 'fresh.txt', storage_location: 'local' },
      ],
    });
    render(<DriveFiles />);
    await waitFor(() => expect(screen.getByTestId('drive-file-1')).toBeInTheDocument());
    // Drive file has the badge + download link; local file does not.
    expect(screen.getByTestId('drive-badge')).toBeInTheDocument();
    expect(screen.getByTestId('drive-download-1')).toHaveAttribute(
      'href',
      'https://drive.google.com/file/d/d1/view',
    );
    expect(screen.queryByTestId('drive-download-2')).not.toBeInTheDocument();
  });

  test('shows empty state with no files', async () => {
    get.mockResolvedValue({ data: [] });
    render(<DriveFiles />);
    await waitFor(() => expect(screen.getByTestId('drive-empty')).toBeInTheDocument());
  });
});
