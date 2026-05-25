/**
 * TaskContext — global task list + mutations.
 *
 * Mirrors ProjectContext: one cache, one mutation surface
 * (addTask/updateTask/deleteTask), available app-wide so the Dashboard
 * and Tasks page read from the same source without re-fetching on every
 * mount.
 *
 * Backing API: app/routes/tasks.py — /api/tasks.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import api from '../lib/api';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/tasks/');
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback(async (payload) => {
    const res = await api.post('/tasks/', payload);
    setTasks((prev) => [...prev, res.data]);
    return res.data;
  }, []);

  const updateTask = useCallback(async (id, payload) => {
    const res = await api.put(`/tasks/${id}`, payload);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    return res.data;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      loading,
      error,
      fetchTasks,
      addTask,
      updateTask,
      deleteTask,
    }),
    [tasks, loading, error, fetchTasks, addTask, updateTask, deleteTask],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
