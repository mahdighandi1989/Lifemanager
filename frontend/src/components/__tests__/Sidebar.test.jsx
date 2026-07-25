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

  test('shows daily + the sahat map; life pages/tools/system live behind «بیشتر»', () => {
    renderAt('/');
    // Daily stays visible at rest; the sahat MAP is the single door for life
    // (2026-07-22 menu redesign — the map's cards link into every life page).
    expect(screen.getByTestId('sidebar-link-dashboard')).toHaveAttribute('href', '/');
    expect(screen.getByTestId('sidebar-link-tasks')).toHaveAttribute('href', '/tasks');
    expect(screen.getByTestId('sidebar-link-sahat')).toHaveAttribute('href', '/sahat');
    // Life pages + tools/system are collapsed by default — not rendered.
    expect(screen.queryByTestId('sidebar-link-projects')).toBeNull();
    expect(screen.queryByTestId('sidebar-link-settings')).toBeNull();
    expect(screen.queryByTestId('sidebar-link-dev-center')).toBeNull();
    // Opening «بیشتر» reveals them all (quarantine-not-delete: routes intact).
    fireEvent.click(screen.getByTestId('sidebar-more-toggle'));
    expect(screen.getByTestId('sidebar-link-projects')).toHaveAttribute('href', '/projects');
    expect(screen.getByTestId('sidebar-link-settings')).toHaveAttribute('href', '/settings');
    expect(screen.getByTestId('sidebar-link-dev-center')).toHaveAttribute('href', '/dev-center');
    // The standalone AI/notifications links were never in the sidebar.
    expect(screen.queryByTestId('sidebar-link-ai-settings')).toBeNull();
    expect(screen.queryByTestId('sidebar-link-notifications')).toBeNull();
  });

  test('auto-opens «بیشتر» on a demoted life page so its entry stays visible', () => {
    renderAt('/projects');
    expect(screen.getByTestId('sidebar-link-projects')).toHaveAttribute('href', '/projects');
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

  // 2026-07-25: seven alias routes render an existing hub. Landing on one used
  // to leave the drawer shut and no entry lit — the page looked unrelated to
  // the menu.
  test.each([
    ['/people/7/profile', 'sidebar-link-people'],
    ['/notifications', 'sidebar-link-settings'],
    ['/merge', 'sidebar-link-data'],
    ['/finance', 'sidebar-link-finance'],
    ['/personality', 'sidebar-link-assistant'],
  ])('alias %s lights up (and opens the drawer for) %s', (path, testid) => {
    renderAt(path);
    const entry = screen.getByTestId(testid); // present ⇒ drawer auto-opened
    expect(entry.className).toMatch(/text-blue-600/);
  });

  // «پاک‌سازی و ادغام» was a second door to the tab inside «داده».
  test('the merge tool has one menu door, not two', () => {
    renderAt('/');
    fireEvent.click(screen.getByTestId('sidebar-more-toggle'));
    expect(screen.queryByTestId('sidebar-link-merge')).toBeNull();
    expect(screen.getByTestId('sidebar-link-data')).toHaveAttribute('href', '/import');
  });
});
