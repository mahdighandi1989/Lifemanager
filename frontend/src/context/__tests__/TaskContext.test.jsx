/**
 * Mirror of ProjectContext.test.jsx for TaskContext. Same shape: api
 * mocked, fetch populates, mutations stay in sync.
 */
import { act, render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const apiMock = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};
vi.mock('../../lib/api', () => ({ default: apiMock }));

const { TaskProvider, useTasks } = await import('../TaskContext');

function Harness({ onReady }) {
  const ctx = useTasks();
  React.useEffect(() => {
    onReady(ctx);
  });
  return null;
}

function renderWithProvider() {
  let ctxRef;
  render(
    <TaskProvider>
      <Harness onReady={(c) => (ctxRef = c)} />
    </TaskProvider>,
  );
  return () => ctxRef;
}

describe('TaskContext', () => {
  beforeEach(() => {
    apiMock.get.mockReset();
    apiMock.post.mockReset();
    apiMock.put.mockReset();
    apiMock.delete.mockReset();
  });

  test('starts with an empty tasks array', () => {
    const get = renderWithProvider();
    expect(get().tasks).toEqual([]);
  });

  test('fetchTasks fills the cache', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: [{ id: 1, title: 'a' }, { id: 2, title: 'b' }],
    });
    const get = renderWithProvider();
    await act(async () => {
      await get().fetchTasks();
    });
    expect(apiMock.get).toHaveBeenCalledWith('/tasks/');
    expect(get().tasks).toHaveLength(2);
  });

  test('addTask appends', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { id: 5, title: 'fresh' } });
    const get = renderWithProvider();
    await act(async () => {
      await get().addTask({ title: 'fresh' });
    });
    expect(apiMock.post).toHaveBeenCalledWith('/tasks/', { title: 'fresh' });
    expect(get().tasks[0]).toEqual({ id: 5, title: 'fresh' });
  });

  test('updateTask replaces the row in place', async () => {
    apiMock.get.mockResolvedValueOnce({ data: [{ id: 4, title: 'old' }] });
    apiMock.put.mockResolvedValueOnce({ data: { id: 4, title: 'new' } });
    const get = renderWithProvider();
    await act(async () => {
      await get().fetchTasks();
    });
    await act(async () => {
      await get().updateTask(4, { title: 'new' });
    });
    expect(apiMock.put).toHaveBeenCalledWith('/tasks/4', { title: 'new' });
    expect(get().tasks).toEqual([{ id: 4, title: 'new' }]);
  });

  test('deleteTask drops the row', async () => {
    apiMock.get.mockResolvedValueOnce({ data: [{ id: 8, title: 'bye' }] });
    apiMock.delete.mockResolvedValueOnce({ status: 204 });
    const get = renderWithProvider();
    await act(async () => {
      await get().fetchTasks();
    });
    await act(async () => {
      await get().deleteTask(8);
    });
    expect(apiMock.delete).toHaveBeenCalledWith('/tasks/8');
    expect(get().tasks).toEqual([]);
  });

  test('useTasks outside a provider throws', () => {
    function Bare() {
      useTasks();
      return null;
    }
    expect(() => render(<Bare />)).toThrow(/within TaskProvider/);
  });
});
