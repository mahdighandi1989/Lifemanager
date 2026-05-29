import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

// vi.mock is hoisted, so build the mock fns via vi.hoisted to avoid the
// "cannot access before initialization" trap.
const { post, get } = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn() }));

vi.mock('../../lib/api', () => ({ default: { post, get } }));

import SmartAssistant from '../SmartAssistant';
import AssetsPage from '../AssetsPage';

describe('SmartAssistant + AssetsPage (tasks 2165524b / 217909d2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    post.mockResolvedValue({ data: { suggestions: [{ kind: 'focus', text: 'زمان تمرکز است' }] } });
    get.mockResolvedValue({
      data: [{ id: 1, name: 'Inception.mp4', asset_type: 'movie', path: '/m/Inception.mp4' }],
    });
  });

  test('SmartAssistant analyzes and renders suggestions', async () => {
    render(<SmartAssistant />);
    expect(screen.getByTestId('smart-assistant-page')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('assistant-analyze-btn'));
    await waitFor(() => expect(screen.getByText('زمان تمرکز است')).toBeInTheDocument());
    expect(post).toHaveBeenCalledWith('/v1/context/analyze', expect.any(Object));
  });

  test('AssetsPage renders assets grouped by type', async () => {
    render(<AssetsPage />);
    expect(screen.getByTestId('assets-page')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Inception.mp4')).toBeInTheDocument());
    expect(screen.getByTestId('assets-by-type')).toBeInTheDocument();
  });
});
