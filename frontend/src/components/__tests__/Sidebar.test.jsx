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
    expect(screen.getByTestId('sidebar-link-notifications')).toHaveAttribute(
      'href',
      '/notifications',
    );
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
