/**
 * Lists page — delete-button end-to-end behavior.
 *
 * The audit flagged the "حذف" button in Lists.jsx as a "button
 * without handler". It's a stale-detector false positive — the
 * JSX clearly has `onClick={() => onDelete(list.id)}` and a
 * working `handleDelete` that calls `DELETE /api/lists/{id}` and
 * updates state. This test pins that behavior so the next audit
 * run, or any future refactor that accidentally drops the
 * handler, fails loudly instead of silently.
 *
 * Steps:
 *   1. Mock /api/lists to return two lists.
 *   2. Render <Lists/> inside a MemoryRouter.
 *   3. Wait for the rows to appear.
 *   4. Stub window.confirm to return true so the deletion goes
 *      through.
 *   5. Click the delete button on list id=1.
 *   6. Assert fetch was called with DELETE /api/lists/1.
 *   7. Assert the row disappears from the DOM (state update).
 */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import Lists from '../Lists';

function renderLists() {
  return render(
    <MemoryRouter>
      <Lists />
    </MemoryRouter>,
  );
}

describe('Lists.jsx — delete button', () => {
  let originalFetch;
  let originalConfirm;
  let fetchCalls;

  beforeEach(() => {
    fetchCalls = [];
    originalFetch = global.fetch;
    originalConfirm = window.confirm;
    global.fetch = vi.fn().mockImplementation((url, opts = {}) => {
      fetchCalls.push({ url: String(url), opts });
      const method = (opts.method || 'GET').toUpperCase();
      if (method === 'GET' && /\/lists$/.test(String(url))) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 1, name: 'لیست اول', item_count: 3 },
            { id: 2, name: 'لیست دوم', item_count: 5 },
          ],
        });
      }
      if (method === 'DELETE' && /\/lists\/1$/.test(String(url))) {
        return Promise.resolve({ ok: true, json: async () => ({}) });
      }
      return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
    });
    window.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    window.confirm = originalConfirm;
  });

  test('click on the delete button fires DELETE /api/lists/{id} and removes the row', async () => {
    renderLists();

    // Wait for the list to load.
    const firstRow = await screen.findByText('لیست اول');
    expect(firstRow).toBeInTheDocument();

    // The delete button is keyed by `data-testid="list-delete-${id}"`
    // — the same hook the JSX declares at Lists.jsx:84.
    const deleteBtn = screen.getByTestId('list-delete-1');
    expect(deleteBtn).toBeInTheDocument();
    // The button is reachable via the aria-label "حذف لیست" too —
    // accessibility check.
    expect(deleteBtn).toHaveAttribute('aria-label', 'حذف لیست');

    fireEvent.click(deleteBtn);

    // confirm() must have been asked first (the page guards against
    // accidental deletions).
    expect(window.confirm).toHaveBeenCalled();

    // The DELETE request fires.
    await waitFor(() => {
      const del = fetchCalls.find(
        (c) =>
          (c.opts.method || 'GET').toUpperCase() === 'DELETE' &&
          /\/lists\/1$/.test(c.url),
      );
      expect(del).toBeTruthy();
    });

    // The row is removed from the DOM after the optimistic update.
    await waitFor(() => {
      expect(screen.queryByText('لیست اول')).not.toBeInTheDocument();
    });
    // The other row sticks around — the delete is surgical.
    expect(screen.getByText('لیست دوم')).toBeInTheDocument();
  });

  test('rejecting the confirm dialog cancels the DELETE', async () => {
    window.confirm = vi.fn(() => false);
    renderLists();
    await screen.findByText('لیست اول');

    const deleteBtn = screen.getByTestId('list-delete-1');
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    // No DELETE request fired.
    const del = fetchCalls.find(
      (c) => (c.opts.method || 'GET').toUpperCase() === 'DELETE',
    );
    expect(del).toBeUndefined();
    // The row stays.
    expect(screen.getByText('لیست اول')).toBeInTheDocument();
  });
});
