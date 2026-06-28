import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import Sidebar from '../Sidebar';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar />
    </MemoryRouter>,
  );
}

describe('Sidebar', () => {
  test('exposes the sidebar testid for the UI probe', () => {
    renderAt('/');
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  test('contains links to every primary page', () => {
    renderAt('/');
    // Per-link testids guarantee selectors stay stable across copy changes.
    expect(screen.getByTestId('sidebar-link-dashboard')).toHaveAttribute('href', '/');
    expect(screen.getByTestId('sidebar-link-tasks')).toHaveAttribute('href', '/tasks');
    expect(screen.getByTestId('sidebar-link-projects')).toHaveAttribute('href', '/projects');
    // AI settings + notifications are consolidated into the Settings tabs, so
    // Settings is the primary nav entry for them now.
    expect(screen.getByTestId('sidebar-link-settings')).toHaveAttribute('href', '/settings');
    // The standalone AI/notifications links were removed from the sidebar.
    expect(screen.queryByTestId('sidebar-link-ai-settings')).toBeNull();
    expect(screen.queryByTestId('sidebar-link-notifications')).toBeNull();
  });

  test('marks the active link based on the current route', () => {
    renderAt('/tasks');
    const active = screen.getByTestId('sidebar-link-tasks');
    expect(active.className).toMatch(/text-blue-600/);
    // Dashboard should NOT be active when we are on /tasks.
    const dashboard = screen.getByTestId('sidebar-link-dashboard');
    expect(dashboard.className).not.toMatch(/font-semibold/);
  });
});
