import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../lib/api';
import SahatChip from '../components/SahatChip';
import ActivityLogPanel from '../components/ActivityLogPanel';

/**
 * صفحهٔ یک پروژه — «پروژه‌های من» finally has somewhere to go.
 *
 * 2026-07-25 survey: the projects tab listed a name and a description with no
 * detail page and no way to edit, so a project could not actually hold work.
 * This page reads GET /api/projects/:id + /api/projects/:id/tasks, lets the
 * owner rename/describe it (PUT), shows its sahat chip, and adds a task
 * straight into the project (POST /api/tasks with project_id).
 */

const STATUS_LABELS = {
  todo: 'در انتظار',
  in_progress: 'در حال انجام',
  done: 'انجام شد',
  cancelled: 'لغو شد',
};
const STATUS_COLORS = {
  todo: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};
const PROJECT_STATUS_LABELS = {
  active: 'فعال',
  completed: 'تکمیل‌شده',
  on_hold: 'متوقف',
  archived: 'آرشیو',
};

function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState(null); // null → loading
  const [form, setForm] = useState({ name: '', description: '', status: 'active' });
  const [newTask, setNewTask] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(null);

  const load = useCallback(() => {
    api
      .get(`/projects/${id}`)
      .then((res) => {
        setProject(res.data);
        setForm({
          name: res.data?.name || '',
          description: res.data?.description || '',
          status: res.data?.status || 'active',
        });
      })
      .catch((e) => setError('پروژه پیدا نشد: ' + (e.message || '')));
    api
      .get(`/projects/${id}/tasks`)
      .then((r) => setTasks(Array.isArray(r.data?.tasks) ? r.data.tasks : []))
      .catch(() => setTasks([]));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const say = (text) => {
    setFlash(text);
    setTimeout(() => setFlash(null), 4000);
  };

  const save = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    api
      .put(`/projects/${id}`, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        status: form.status,
      })
      .then((res) => {
        setProject(res.data);
        say('ذخیره شد');
      })
      .catch((err) => setError('ذخیره نشد: ' + (err.message || '')))
      .finally(() => setBusy(false));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim() || busy) return;
    setBusy(true);
    api
      .post('/tasks', { title: newTask.trim(), project_id: Number(id) })
      .then(() => {
        setNewTask('');
        load();
        say('کار به پروژه اضافه شد');
      })
      .catch((err) => setError('کار اضافه نشد: ' + (err.message || '')))
      .finally(() => setBusy(false));
  };

  const done = (tasks || []).filter((t) => t.status === 'done').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="project-detail-page">
      <div className="max-w-3xl mx-auto px-4" dir="rtl">
        <Link to="/projects" className="text-xs text-gray-500 hover:text-blue-600">← همهٔ پروژه‌ها</Link>
        <div className="mt-2 mb-4 flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900" data-testid="project-title">
            {project?.name || 'پروژه'}
          </h1>
          {project && (
            <span className="flex items-center gap-1.5">
              <SahatChip
                entityType="project"
                entityId={project.id}
                sahat={project.sahat}
                source={project.sahat_source}
              />
              <span className="text-xs text-gray-500">
                {PROJECT_STATUS_LABELS[project.status] || project.status}
              </span>
            </span>
          )}
        </div>
        {error && <p className="text-red-600 text-sm mb-3" data-testid="project-error">{error}</p>}
        {flash && <p className="text-green-600 text-sm mb-3" data-testid="project-flash">{flash}</p>}

        {/* ویرایش — the projects list had no edit path at all */}
        <form onSubmit={save} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4" data-testid="project-edit-form">
          <label className="block text-sm text-gray-600 mb-1">نام پروژه</label>
          <input
            data-testid="project-name-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
          />
          <label className="block text-sm text-gray-600 mb-1">توضیح</label>
          <textarea
            data-testid="project-desc-input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
          />
          <div className="flex items-center gap-2">
            <select
              data-testid="project-status-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border border-gray-200 rounded-lg px-2 py-2 text-sm"
            >
              {Object.entries(PROJECT_STATUS_LABELS).map(([k, fa]) => (
                <option key={k} value={k}>{fa}</option>
              ))}
            </select>
            <button
              type="submit"
              data-testid="project-save-btn"
              disabled={busy}
              className="bg-blue-600 text-white text-sm rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-60"
            >
              ذخیره
            </button>
          </div>
        </form>

        {/* کارهای پروژه — the container the project never was */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4" data-testid="project-tasks">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">کارهای این پروژه</h2>
            {tasks !== null && tasks.length > 0 && (
              <span className="text-xs text-gray-500" data-testid="project-tasks-progress">
                {done} از {tasks.length} انجام شد
              </span>
            )}
          </div>

          <form onSubmit={addTask} className="flex gap-2 mb-3">
            <input
              data-testid="project-new-task-input"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="یک کار تازه در این پروژه…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              data-testid="project-add-task-btn"
              disabled={busy}
              className="bg-green-600 text-white text-sm rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-60"
            >
              افزودن
            </button>
          </form>

          {tasks === null ? (
            <p className="text-gray-400 text-sm">در حال بارگذاری…</p>
          ) : tasks.length === 0 ? (
            <p className="text-gray-400 text-sm" data-testid="project-tasks-empty">هنوز کاری به این پروژه وصل نشده</p>
          ) : (
            <ul className="space-y-1.5 text-sm" data-testid="project-tasks-list">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2">
                  <Link to="/tasks" className="truncate text-gray-800 hover:text-blue-600">{t.title}</Link>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {t.status && (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[t.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[t.status] || t.status}
                      </span>
                    )}
                    {t.due_date && (
                      <span className="text-[11px] text-gray-400" dir="ltr">{String(t.due_date).slice(0, 10)}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <ActivityLogPanel entityType="project" entityId={id} title="لاگ این پروژه" />
      </div>
    </div>
  );
}

export default ProjectDetailPage;
