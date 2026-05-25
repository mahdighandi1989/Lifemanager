/**
 * Behaviour of ProjectContext: fetchProjects populates the cached array,
 * addProject / updateProject / deleteProject keep it in sync without a
 * re-fetch. The api module is mocked so no HTTP happens.
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

const { ProjectProvider, useProjects } = await import('../ProjectContext');

function Harness({ onReady }) {
  const ctx = useProjects();
  React.useEffect(() => {
    onReady(ctx);
  });
  return (
    <ul data-testid="project-list">
      {ctx.projects.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}

function renderWithProvider() {
  let api;
  render(
    <ProjectProvider>
      <Harness onReady={(c) => (api = c)} />
    </ProjectProvider>,
  );
  return () => api;
}

describe('ProjectContext', () => {
  beforeEach(() => {
    apiMock.get.mockReset();
    apiMock.post.mockReset();
    apiMock.put.mockReset();
    apiMock.delete.mockReset();
  });

  test('starts with an empty projects array', () => {
    const get = renderWithProvider();
    expect(get().projects).toEqual([]);
  });

  test('fetchProjects populates the cache', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: [{ id: 1, name: 'alpha' }, { id: 2, name: 'beta' }],
    });
    const get = renderWithProvider();
    await act(async () => {
      await get().fetchProjects();
    });
    expect(apiMock.get).toHaveBeenCalledWith('/projects/');
    expect(get().projects).toEqual([
      { id: 1, name: 'alpha' },
      { id: 2, name: 'beta' },
    ]);
  });

  test('addProject appends the created row to the cache', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { id: 7, name: 'gamma' } });
    const get = renderWithProvider();
    await act(async () => {
      await get().addProject({ name: 'gamma' });
    });
    expect(apiMock.post).toHaveBeenCalledWith('/projects/', { name: 'gamma' });
    expect(get().projects).toContainEqual({ id: 7, name: 'gamma' });
  });

  test('updateProject swaps the matching row in place', async () => {
    apiMock.get.mockResolvedValueOnce({ data: [{ id: 3, name: 'old' }] });
    apiMock.put.mockResolvedValueOnce({ data: { id: 3, name: 'new' } });
    const get = renderWithProvider();
    await act(async () => {
      await get().fetchProjects();
    });
    await act(async () => {
      await get().updateProject(3, { name: 'new' });
    });
    expect(apiMock.put).toHaveBeenCalledWith('/projects/3', { name: 'new' });
    expect(get().projects).toEqual([{ id: 3, name: 'new' }]);
  });

  test('deleteProject removes the row from the cache', async () => {
    apiMock.get.mockResolvedValueOnce({ data: [{ id: 9, name: 'doomed' }] });
    apiMock.delete.mockResolvedValueOnce({ status: 204 });
    const get = renderWithProvider();
    await act(async () => {
      await get().fetchProjects();
    });
    await act(async () => {
      await get().deleteProject(9);
    });
    expect(apiMock.delete).toHaveBeenCalledWith('/projects/9');
    expect(get().projects).toEqual([]);
  });

  test('useProjects outside a provider throws', () => {
    function Bare() {
      useProjects();
      return null;
    }
    expect(() => render(<Bare />)).toThrow(/within ProjectProvider/);
  });

  test('error from the server is captured on context', async () => {
    apiMock.get.mockRejectedValueOnce(
      Object.assign(new Error('network'), {
        response: { data: { detail: 'pool exhausted' } },
      }),
    );
    const get = renderWithProvider();
    await act(async () => {
      await get().fetchProjects();
    });
    expect(get().error).toBe('pool exhausted');
  });
});
