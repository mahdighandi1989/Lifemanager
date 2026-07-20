import React, { useState, useEffect } from 'react';
import ActivityLogPanel from '../components/ActivityLogPanel';

// All task data lives under /api/tasks. The bare /tasks path is the SPA
// route that renders this page.
const API_BASE = '/api';

// STATUS_LABELS must mirror app/models/task.py::TaskStatus (the
// source of truth). The backend serialises `t.status.value`, so a
// task whose status is TaskStatus.TODO arrives here as the literal
// string "todo" — not "pending". Keep the four backend enum values
// (todo / in_progress / done / cancelled) as the canonical keys, and
// alias the older "pending" / "completed" strings to the same labels
// so any legacy task rows or hand-crafted payloads still render.
const STATUS_LABELS = {
  todo: 'در انتظار',
  pending: 'در انتظار',
  in_progress: 'در حال انجام',
  done: 'تکمیل‌شده',
  completed: 'تکمیل‌شده',
  cancelled: 'لغو شده',
};

const STATUS_COLORS = {
  todo: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

// Treat both "done" (current backend) and "completed" (legacy) as
// "finished" when filtering progress widgets. Centralised so the
// Dashboard summary, the per-page filter, and the "X of Y done"
// caption stay in sync.
const COMPLETED_STATUSES = new Set(['done', 'completed']);

// Priority ints as the backend speaks them (app/routes/tasks.py):
// _priority_to_int maps LOW→1, MEDIUM→2, HIGH→4, CRITICAL→5, and an
// unset priority serialises as 2 (MEDIUM). On the way in, 0..1→LOW,
// 2..3→MEDIUM, 4→HIGH, 5→CRITICAL — so the form sends 1/2/4 for
// کم/متوسط/زیاد to survive the round-trip unchanged.
const PRIORITY_LABELS = { 1: 'کم', 2: 'متوسط', 3: 'متوسط', 4: 'زیاد', 5: 'بحرانی' };
const PRIORITY_COLORS = {
  1: 'bg-gray-100 text-gray-600',
  4: 'bg-orange-100 text-orange-700',
  5: 'bg-red-100 text-red-700',
};

// Local (not UTC) today as YYYY-MM-DD, for the «موعد گذشته» tint.
const localTodayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function TaskRow({ task, onToggle }) {
  // Default to the backend's canonical "todo" sentinel when no
  // status is set (e.g. a task created before the column existed).
  const status = task.status || (task.is_completed ? 'done' : 'todo');
  const isDone = COMPLETED_STATUSES.has(status);
  const overdue = task.due_date && !isDone && task.due_date < localTodayISO();
  // Backend serialises an unset priority as 2 (MEDIUM), so a
  // «متوسط» badge on every legacy row would be pure noise — only
  // non-default priorities get a badge.
  const priorityBadge =
    task.priority != null && task.priority !== 2 && task.priority !== 3
      ? task.priority
      : null;
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onToggle(task.id, status)}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            isDone
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {isDone && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div>
          <p className={`font-medium ${
            isDone ? 'line-through text-gray-400' : 'text-gray-900'
          }`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {task.due_date && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              overdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}
            dir="ltr"
            data-testid={`task-due-badge-${task.id}`}
          >
            📅 {task.due_date}
          </span>
        )}
        {priorityBadge && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[priorityBadge] || 'bg-gray-100 text-gray-600'}`}
            data-testid={`task-priority-badge-${task.id}`}
          >
            {PRIORITY_LABELS[priorityBadge] || priorityBadge}
          </span>
        )}
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
          {STATUS_LABELS[status] || status}
        </span>
      </div>
    </div>
  );
}

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('all');
  // Person picker (audit task 3cc09436, AC8): pick people to link to the task.
  const [persons, setPersons] = useState([]);
  const [selectedPersonIds, setSelectedPersonIds] = useState([]);
  // Optional create-form fields (audit #12) — hidden behind «جزئیات
  // بیشتر» so the one-keystroke quick-add stays untouched.
  const [showDetails, setShowDetails] = useState(false);
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newCost, setNewCost] = useState('');
  const [projects, setProjects] = useState([]);

  const fetchPersons = async () => {
    try {
      const res = await fetch(`${API_BASE}/persons`);
      if (res.ok) {
        const data = await res.json();
        setPersons(Array.isArray(data) ? data : []);
      }
    } catch {
      // non-fatal — the task form still works without the picker
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch {
      // non-fatal — the task form still works without the project picker
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      setError('خطا در دریافت وظایف: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); fetchPersons(); fetchProjects(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      // Optional fields ride along only when the user actually set
      // them — a bare title still posts the same minimal payload as
      // before (quick-add unchanged).
      const payload = { title: newTitle.trim(), status: 'todo' };
      if (newDueDate) payload.due_date = newDueDate;
      if (newPriority) payload.priority = Number(newPriority);
      if (newProjectId) payload.project_id = Number(newProjectId);
      if (newCost !== '' && Number.isFinite(Number(newCost))) {
        payload.estimated_cost = Number(newCost);
      }
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const task = await res.json();
        setTasks(prev => [task, ...prev]);
        setNewTitle('');
        setNewDueDate('');
        setNewPriority('');
        setNewProjectId('');
        setNewCost('');
        // Link any picked people to the new task (AC8).
        if (selectedPersonIds.length && task?.id) {
          try {
            await fetch(`${API_BASE}/tasks/${task.id}/persons`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ person_ids: selectedPersonIds }),
            });
          } catch {
            // association is best-effort; the task is already created
          }
          setSelectedPersonIds([]);
        }
      }
    } catch (e) {
      setError('خطا در افزودن وظیفه');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    // Cycle between the backend's two canonical "open" / "closed"
    // states. Accept any legacy `completed` value as already-done.
    const newStatus = COMPLETED_STATUSES.has(currentStatus) ? 'todo' : 'done';
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      }
    } catch {
      setError('خطا در به‌روزرسانی وظیفه');
    }
  };

  const filtered = tasks.filter(t => {
    if (filter === 'all') return true;
    const s = t.status || (t.is_completed ? 'done' : 'todo');
    // "done" filter button also catches the legacy "completed" value.
    if (filter === 'done') return COMPLETED_STATUSES.has(s);
    return s === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">وظایف</h1>
          <p className="text-gray-500 mt-1">مدیریت و پیگیری وظایف روزانه</p>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col gap-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="وظیفه جدید را بنویسید..."
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={adding || !newTitle.trim()}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {adding ? 'در حال افزودن...' : 'افزودن'}
            </button>
          </div>
          {/* Optional fields (audit #12) — collapsed by default so the
              one-keystroke quick-add flow stays intact. dir="rtl" on the
              block keeps the Persian labels bidi-safe (document root is
              dir="ltr"). */}
          <div dir="rtl">
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="text-xs text-blue-600 hover:underline"
              data-testid="task-details-toggle"
              aria-expanded={showDetails}
            >
              {showDetails ? 'جزئیات کمتر ▲' : 'جزئیات بیشتر ▼'}
            </button>
            {showDetails && (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="task-details-fields">
                <label className="block text-xs text-gray-500">
                  موعد
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    dir="ltr"
                    data-testid="task-due-input"
                  />
                </label>
                <label className="block text-xs text-gray-500">
                  اولویت
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    data-testid="task-priority-select"
                  >
                    {/* Ints per app/routes/tasks.py: LOW=1, MEDIUM=2, HIGH=4. */}
                    <option value="">بدون</option>
                    <option value="1">کم</option>
                    <option value="2">متوسط</option>
                    <option value="4">زیاد</option>
                  </select>
                </label>
                <label className="block text-xs text-gray-500">
                  پروژه
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    data-testid="task-project-select"
                  >
                    <option value="">بدون پروژه</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs text-gray-500">
                  هزینهٔ تقریبی
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    placeholder="مثلاً ۵۰۰۰۰"
                    className="mt-1 w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    dir="ltr"
                    data-testid="task-cost-input"
                  />
                </label>
              </div>
            )}
          </div>
          {persons.length > 0 && (
            <div data-testid="task-person-picker">
              <label className="text-xs text-gray-500">افراد مرتبط (اختیاری):</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {persons.map((p) => {
                  const checked = selectedPersonIds.includes(p.id);
                  return (
                    <button
                      type="button"
                      key={p.id}
                      data-testid={`task-person-${p.id}`}
                      aria-pressed={checked}
                      onClick={() =>
                        setSelectedPersonIds((prev) =>
                          checked ? prev.filter((id) => id !== p.id) : [...prev, p.id],
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                        checked
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </form>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-4">
          {[['all', 'همه'], ['todo', 'در انتظار'], ['in_progress', 'در حال انجام'], ['done', 'تکمیل‌شده']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === val
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100 text-sm text-red-600 rounded-t-xl">{error}</div>
          )}
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <svg className="w-8 h-8 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              در حال بارگذاری...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>وظیفه‌ای یافت نشد</p>
            </div>
          ) : (
            filtered.map(task => (
              <TaskRow key={task.id} task={task} onToggle={handleToggle} />
            ))
          )}
        </div>

        {tasks.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-3">
            {tasks.filter(t => COMPLETED_STATUSES.has(t.status || (t.is_completed ? 'done' : 'todo'))).length} از {tasks.length} وظیفه تکمیل شده
          </p>
        )}

        {/* لاگ بخش وظایف — فقط رویدادهای همین بخش. */}
        <div dir="rtl">
          <ActivityLogPanel entityType="task" title="لاگ وظایف" />
        </div>
      </div>
    </div>
  );
}

export default Tasks;