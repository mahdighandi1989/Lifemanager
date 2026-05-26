/**
 * Targeted test asserting the خودسازی link is present in the Sidebar.
 *
 * Kept in its own file so the existing Sidebar.test.jsx (which only
 * knows about the original 5 links) stays untouched and continues to
 * exercise the active-link logic.
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';

import Sidebar from '../Sidebar';

describe('Sidebar — Self-Improvement', () => {
  test('contains the خودسازی link with the right href', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar />
      </MemoryRouter>,
    );
    const link = screen.getByTestId('sidebar-link-self-improvement');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/self-improvement');
    expect(link.textContent).toContain('خودسازی');
  });

  test('marks the خودسازی link active when navigated', () => {
    render(
      <MemoryRouter initialEntries={['/self-improvement']}>
        <Sidebar />
      </MemoryRouter>,
    );
    const active = screen.getByTestId('sidebar-link-self-improvement');
    expect(active.className).toMatch(/text-blue-600/);
  });
});
