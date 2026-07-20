/**
 * Tasks page — create-form optional fields (audit #12).
 *
 * The quick-add form historically posted only {title, status}. Phase 2
 * added collapsible optional inputs (موعد / اولویت / پروژه / هزینهٔ
 * تقریبی). These tests pin the payload contract:
 *   1. With the «جزئیات بیشتر» fields set, POST /api/tasks carries
 *      due_date / priority / project_id / estimated_cost.
 *   2. Title-only quick-add still posts the minimal payload (no
 *      optional keys) — the one-keystroke flow is unchanged.
 *
 * fetch is mocked with the same idiom as Lists.delete.test.jsx; the
 * axios lib (used only by the embedded ActivityLogPanel) is mocked to
 * a resolved-null so the panel renders its empty state quietly.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../lib/api', () => ({
  default: {
    get: () => Promise.resolve({ data: null }),
    post: () => Promise.resolve({ data: null }),
  },
}));

import Tasks from '../Tasks';

function renderTasks() {
  return render(
    <MemoryRouter>
      <Tasks />
    </MemoryRouter>,
  );
}

describe('Tasks.jsx — create form optional fields (audit #12)', () => {
  let originalFetch;
  let fetchCalls;

  beforeEach(() => {
    fetchCalls = [];
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((url, opts = {}) => {
      fetchCalls.push({ url: String(url), opts });
      const method = (opts.method || 'GET').toUpperCase();
      if (method === 'GET' && /\/api\/tasks$/.test(String(url))) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (method === 'GET' && /\/api\/persons$/.test(String(url))) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (method === 'GET' && /\/api\/projects$/.test(String(url))) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 5, name: 'پروژه الف' }],
        });
      }
      if (method === 'POST' && /\/api\/tasks$/.test(String(url))) {
        const body = JSON.parse(opts.body || '{}');
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 99, status: 'todo', ...body }),
        });
      }
      return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('payload includes due_date / priority / project_id / estimated_cost when set', async () => {
    renderTasks();

    // The optional fields hide behind the «جزئیات بیشتر» toggle.
    const toggle = await screen.findByTestId('task-details-toggle');
    fireEvent.click(toggle);
    await screen.findByTestId('task-details-fields');

    fireEvent.change(screen.getByPlaceholderText('وظیفه جدید را بنویسید...'), {
      target: { value: 'خرید بلیط' },
    });
    fireEvent.change(screen.getByTestId('task-due-input'), {
      target: { value: '2026-08-01' },
    });
    // «زیاد» = 4 — mirrors _priority_to_int(HIGH) in app/routes/tasks.py.
    fireEvent.change(screen.getByTestId('task-priority-select'), {
      target: { value: '4' },
    });
    // The project select is populated from GET /api/projects.
    await waitFor(() =>
      expect(screen.getByText('پروژه الف')).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByTestId('task-project-select'), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByTestId('task-cost-input'), {
      target: { value: '50000' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'افزودن' }));

    await waitFor(() => {
      const post = fetchCalls.find(
        (c) =>
          (c.opts.method || 'GET').toUpperCase() === 'POST' &&
          /\/api\/tasks$/.test(c.url),
      );
      expect(post).toBeTruthy();
      const body = JSON.parse(post.opts.body);
      expect(body).toMatchObject({
        title: 'خرید بلیط',
        status: 'todo',
        due_date: '2026-08-01',
        priority: 4,
        project_id: 5,
        estimated_cost: 50000,
      });
    });
  });

  test('title-only quick-add still posts the minimal payload (no optional keys)', async () => {
    renderTasks();

    fireEvent.change(
      await screen.findByPlaceholderText('وظیفه جدید را بنویسید...'),
      { target: { value: 'فقط عنوان' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'افزودن' }));

    await waitFor(() => {
      const post = fetchCalls.find(
        (c) =>
          (c.opts.method || 'GET').toUpperCase() === 'POST' &&
          /\/api\/tasks$/.test(c.url),
      );
      expect(post).toBeTruthy();
      const body = JSON.parse(post.opts.body);
      expect(body).toEqual({ title: 'فقط عنوان', status: 'todo' });
      expect(body).not.toHaveProperty('due_date');
      expect(body).not.toHaveProperty('priority');
    });
  });
});
