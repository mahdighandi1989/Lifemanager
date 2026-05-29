import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

const get = vi.fn();
const post = vi.fn();
vi.mock('../../lib/api', () => ({
  default: { get: (...a) => get(...a), post: (...a) => post(...a) },
}));

import RecommendationPanel from '../RecommendationPanel';
import NotificationBell from '../NotificationBell';
import LocationTracker from '../LocationTracker';
import Recommendations from '../../pages/Recommendations';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RecommendationPanel (task 2165524b AC 5)', () => {
  test('renders recommendations with accept/reject; accept dismisses', async () => {
    get.mockResolvedValue({
      data: [{ recommendation_type: 'behavioral', text: 'یک کار باز را شروع کن' }],
    });
    render(<RecommendationPanel />);
    await waitFor(() => expect(screen.getByTestId('rec-item-0')).toBeInTheDocument());
    expect(screen.getByTestId('rec-accept-0')).toBeInTheDocument();
    expect(screen.getByTestId('rec-reject-0')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('rec-accept-0'));
    await waitFor(() => expect(screen.queryByTestId('rec-item-0')).not.toBeInTheDocument());
  });

  test('shows empty state when there are no recommendations', async () => {
    get.mockResolvedValue({ data: [] });
    render(<RecommendationPanel />);
    await waitFor(() => expect(screen.getByTestId('rec-empty')).toBeInTheDocument());
  });
});

describe('NotificationBell (task 2165524b AC 9)', () => {
  test('renders a location icon for recommendation-type notifications', async () => {
    get.mockResolvedValue({
      data: [{ id: 5, type: 'recommendation', title: 'نزدیک فروشگاه هستی' }],
    });
    render(<NotificationBell />);
    await waitFor(() =>
      expect(screen.getByTestId('notification-bell-count')).toHaveTextContent('1'),
    );
    fireEvent.click(screen.getByTestId('notification-bell-btn'));
    expect(screen.getByTestId('notif-icon-recommendation')).toHaveTextContent('📍');
  });
});

describe('LocationTracker (task 2165524b AC 6)', () => {
  test('posts geolocation to /context/location on mount', async () => {
    const getCurrentPosition = vi.fn((ok) =>
      ok({ coords: { latitude: 1.1, longitude: 2.2, accuracy: 5 } }),
    );
    global.navigator.geolocation = { getCurrentPosition };
    post.mockResolvedValue({ data: { status: 'ok' } });

    render(<LocationTracker />);
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith(
        '/context/location',
        expect.objectContaining({ lat: 1.1, lng: 2.2 }),
      ),
    );
  });
});

describe('Recommendations page (task 2165524b AC 10)', () => {
  test('renders priority toggles + the panel, and toggles work', async () => {
    get.mockResolvedValue({ data: [] });
    render(<Recommendations />);
    expect(screen.getByTestId('recommendations-page')).toBeInTheDocument();
    expect(screen.getByTestId('rec-priorities')).toBeInTheDocument();
    expect(screen.getByTestId('rec-toggle-location')).toBeInTheDocument();
    expect(screen.getByTestId('rec-toggle-physiological')).toBeInTheDocument();
    expect(screen.getByTestId('rec-toggle-behavioral')).toBeInTheDocument();

    const toggle = screen.getByTestId('rec-toggle-location');
    expect(toggle.checked).toBe(true);
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
  });
});
