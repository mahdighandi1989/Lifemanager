/**
 * ProjectContext — global project list + mutations.
 *
 * Why: the Projects page used to fetch on mount with bespoke state. With
 * this context the same `projects` array is available app-wide (so e.g.
 * the Dashboard summary and a future ProjectPicker can read the same
 * cache without duplicate requests), and `addProject` / `updateProject`
 * / `deleteProject` keep that cache in sync after each mutation.
 *
 * Backing API: app/routes/projects.py — /api/projects.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import api from '../lib/api';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/projects/');
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProject = useCallback(async (payload) => {
    const res = await api.post('/projects/', payload);
    setProjects((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateProject = useCallback(async (id, payload) => {
    const res = await api.put(`/projects/${id}`, payload);
    setProjects((prev) => prev.map((p) => (p.id === id ? res.data : p)));
    return res.data;
  }, []);

  const deleteProject = useCallback(async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      projects,
      loading,
      error,
      fetchProjects,
      addProject,
      updateProject,
      deleteProject,
    }),
    [projects, loading, error, fetchProjects, addProject, updateProject, deleteProject],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
}
