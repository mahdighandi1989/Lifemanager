import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';

// The notification list needs an auth token; the settings panel does not.
// Mock useAuth so the component renders without a real AuthProvider — with
// token=null fetchNotifications short-circuits, so no network is touched.
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ token: null }),
}));

import Notifications from '../Notifications';

describe('Notification settings — verify_failed toggle (task task_92fa5ea15e2b, AC8)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders a notification-settings panel with a verify_failed toggle', () => {
    render(<Notifications />);
    expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
    expect(screen.getByTestId('notif-toggle-verify_failed')).toBeInTheDocument();
  });

  test('verify_failed defaults to enabled', () => {
    render(<Notifications />);
    const toggle = screen.getByTestId('notif-toggle-verify_failed');
    expect(toggle.getAttribute('aria-checked')).toBe('true');
  });

  test('toggling verify_failed flips state and persists to localStorage', () => {
    render(<Notifications />);
    const toggle = screen.getByTestId('notif-toggle-verify_failed');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(localStorage.getItem('notif_pref_verify_failed')).toBe('false');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(localStorage.getItem('notif_pref_verify_failed')).toBe('true');
  });

  test('a previously-disabled preference is restored from localStorage', () => {
    localStorage.setItem('notif_pref_verify_failed', 'false');
    render(<Notifications />);
    expect(
      screen.getByTestId('notif-toggle-verify_failed').getAttribute('aria-checked'),
    ).toBe('false');
  });
});
