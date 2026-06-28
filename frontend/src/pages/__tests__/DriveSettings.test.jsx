import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

const get = vi.fn();
const post = vi.fn();
vi.mock('../../lib/api', () => ({
  default: { get: (...a) => get(...a), post: (...a) => post(...a) },
}));

import DriveSettings from '../DriveSettings';

beforeEach(() => vi.clearAllMocks());

describe('DriveSettings (Google Drive connection panel)', () => {
  test('shows the Connect button when configured but not connected', async () => {
    get.mockResolvedValue({
      data: {
        configured: true,
        enabled: true,
        connected: false,
        account_email: null,
        root_folder_name: 'LifeManagerData',
        subfolders: ['audio', 'images'],
      },
    });
    render(<DriveSettings />);
    expect(screen.getByTestId('drive-settings-page')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('drive-connect-btn')).toBeInTheDocument());
  });

  test('shows Disconnect / Sync / Test when connected', async () => {
    get.mockResolvedValue({
      data: {
        configured: true,
        connected: true,
        account_email: 'me@gmail.com',
        root_folder_name: 'LifeManagerData',
        root_folder_id: 'root-123',
        subfolders: [],
      },
    });
    render(<DriveSettings />);
    await waitFor(() => expect(screen.getByTestId('drive-disconnect-btn')).toBeInTheDocument());
    expect(screen.getByTestId('drive-sync-btn')).toBeInTheDocument();
    expect(screen.getByTestId('drive-test-btn')).toBeInTheDocument();
    expect(screen.getByText('me@gmail.com')).toBeInTheDocument();
  });
});
