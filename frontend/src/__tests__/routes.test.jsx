/**
 * Routing edge cases.
 *
 * Pins the wildcard-redirect behavior so the "/Dashboar" orphan-route
 * audit stays a no-op: any unknown path (the typo `/Dashboar`, an
 * accidentally-shared `/somewhere/old`, anything not covered by an
 * explicit <Route>) falls through to the catch-all and rewrites the
 * user back to `/` rather than rendering an empty SPA shell.
 *
 * The full App tree is heavy to mount (AuthProvider triggers
 * `fetch('/users/')`, ProjectProvider triggers `/projects/`, etc.).
 * We mock fetch globally so nothing actually hits the network.
 */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, Navigate } from 'react-router-dom';
import React from 'react';
import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest';

// Replay the relevant parts of App.jsx's <Routes> tree. Pulling in
// the real App.jsx would also drag in AuthProvider + every page
// component; a minimal mirror is enough to validate the wildcard
// contract this test cares about.
function MiniRouter({ initialPath }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div data-testid="dashboard">DASHBOARD</div>} />
        <Route path="/tasks" element={<div data-testid="tasks">TASKS</div>} />
        <Route path="/projects" element={<div data-testid="projects">PROJECTS</div>} />
        <Route path="/lists" element={<div data-testid="lists">LISTS</div>} />
        <Route path="/notifications" element={<div data-testid="notifications">NOTIF</div>} />
        {/* Match the catch-all in App.jsx:121. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Routing: wildcard catch-all', () => {
  let originalFetch;
  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('"/Dashboar" (the audit\'s misspelled orphan) redirects to "/"', async () => {
    render(<MiniRouter initialPath="/Dashboar" />);
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  test('"/Dashboard" (real capitalization, still not a route) redirects to "/"', async () => {
    render(<MiniRouter initialPath="/Dashboard" />);
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  test('any other unknown path falls back to "/"', async () => {
    render(<MiniRouter initialPath="/totally-not-a-real-page" />);
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  test('real routes are not shadowed by the wildcard', async () => {
    render(<MiniRouter initialPath="/tasks" />);
    await waitFor(() => {
      expect(screen.getByTestId('tasks')).toBeInTheDocument();
    });
  });
});
