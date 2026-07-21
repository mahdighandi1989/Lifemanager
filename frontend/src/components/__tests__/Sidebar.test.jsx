import { render, screen, fireEvent } from '@testing-library/react';
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

  test('shows daily + life pages, but keeps tools/system behind «بیشتر»', () => {
    renderAt('/');
    // Daily + life stay visible at rest (per-link testids stay stable).
    expect(screen.getByTestId('sidebar-link-dashboard')).toHaveAttribute('href', '/');
    expect(screen.getByTestId('sidebar-link-tasks')).toHaveAttribute('href', '/tasks');
    expect(screen.getByTestId('sidebar-link-projects')).toHaveAttribute('href', '/projects');
    // Tools/system (incl. Settings) are collapsed by default — not rendered.
    expect(screen.queryByTestId('sidebar-link-settings')).toBeNull();
    expect(screen.queryByTestId('sidebar-link-dev-center')).toBeNull();
    // Opening «بیشتر» reveals them.
    fireEvent.click(screen.getByTestId('sidebar-more-toggle'));
    expect(screen.getByTestId('sidebar-link-settings')).toHaveAttribute('href', '/settings');
    expect(screen.getByTestId('sidebar-link-dev-center')).toHaveAttribute('href', '/dev-center');
    // The standalone AI/notifications links were never in the sidebar.
    expect(screen.queryByTestId('sidebar-link-ai-settings')).toBeNull();
    expect(screen.queryByTestId('sidebar-link-notifications')).toBeNull();
  });

  test('auto-opens «بیشتر» when the current page lives inside it', () => {
    renderAt('/settings');
    // On a tools/system route, the drawer is open so the active entry shows.
    expect(screen.getByTestId('sidebar-link-settings')).toHaveAttribute('href', '/settings');
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
