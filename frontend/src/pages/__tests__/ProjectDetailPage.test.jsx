import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test, vi, beforeEach } from 'vitest';

// صفحهٔ یک پروژه (2026-07-25): «پروژه‌های من» جایی برای رفتن نداشت — نه ویرایش،
// نه کارهای وصل‌شده. این صفحه هر دو را می‌دهد.
const { get, post, put } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
vi.mock('../../lib/api', () => ({ default: { get, post, put } }));
vi.mock('../../components/SahatChip', () => ({ default: () => <span data-testid="sahat-chip" /> }));
vi.mock('../../components/ActivityLogPanel', () => ({ default: () => <div data-testid="activity-log-panel" /> }));

import ProjectDetailPage from '../ProjectDetailPage';

const renderAt = (id = '3') =>
  render(
    <MemoryRouter initialEntries={[`/projects/${id}`]}>
      <Routes>
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  get.mockImplementation((url) => {
    if (url === '/projects/3') {
      return Promise.resolve({
        data: { id: 3, name: 'مهاجرت', description: 'کارهای اقامت', status: 'active', sahat: 'digaran' },
      });
    }
    if (url === '/projects/3/tasks') {
      return Promise.resolve({
        data: {
          tasks: [
            { id: 1, title: 'ترجمهٔ مدارک', status: 'done', due_date: null },
            { id: 2, title: 'وقت سفارت', status: 'todo', due_date: '2026-09-01' },
          ],
        },
      });
    }
    return Promise.resolve({ data: {} });
  });
});

describe('ProjectDetailPage', () => {
  test('shows the project, its tasks and the progress line', async () => {
    renderAt();
    await waitFor(() => expect(screen.getByTestId('project-title')).toHaveTextContent('مهاجرت'));
    expect(screen.getByTestId('project-name-input')).toHaveValue('مهاجرت');
    await waitFor(() => expect(screen.getByTestId('project-tasks-list')).toBeInTheDocument());
    expect(screen.getByText('ترجمهٔ مدارک')).toBeInTheDocument();
    expect(screen.getByTestId('project-tasks-progress')).toHaveTextContent('1 از 2');
  });

  test('saves a rename through PUT', async () => {
    put.mockResolvedValue({ data: { id: 3, name: 'مهاجرت ۲', status: 'on_hold' } });
    renderAt();
    await waitFor(() => expect(screen.getByTestId('project-name-input')).toHaveValue('مهاجرت'));
    fireEvent.change(screen.getByTestId('project-name-input'), { target: { value: 'مهاجرت ۲' } });
    fireEvent.change(screen.getByTestId('project-status-select'), { target: { value: 'on_hold' } });
    fireEvent.submit(screen.getByTestId('project-edit-form'));
    await waitFor(() =>
      expect(put).toHaveBeenCalledWith('/projects/3', {
        name: 'مهاجرت ۲',
        description: 'کارهای اقامت',
        status: 'on_hold',
      }),
    );
  });

  test('adds a task straight into the project and refetches', async () => {
    post.mockResolvedValue({ data: { id: 9 } });
    renderAt();
    await waitFor(() => expect(screen.getByTestId('project-new-task-input')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('project-new-task-input'), { target: { value: 'بیمه' } });
    fireEvent.submit(screen.getByTestId('project-new-task-input').closest('form'));
    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/tasks', { title: 'بیمه', project_id: 3 }),
    );
    await waitFor(() =>
      expect(get.mock.calls.filter(([u]) => u === '/projects/3/tasks').length).toBe(2),
    );
  });

  test('empty project says so instead of rendering nothing', async () => {
    get.mockImplementation((url) =>
      url === '/projects/3'
        ? Promise.resolve({ data: { id: 3, name: 'خالی', status: 'active' } })
        : Promise.resolve({ data: { tasks: [] } }),
    );
    renderAt();
    await waitFor(() => expect(screen.getByTestId('project-tasks-empty')).toBeInTheDocument());
  });
});
