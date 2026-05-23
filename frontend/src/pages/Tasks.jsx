import React, { useState, useEffect } from 'react';

const API_BASE = '';

const STATUS_LABELS = {
  pending: 'در انتظار',
  in_progress: 'در حال انجام',
  completed: 'تکمیل‌شده',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

function TaskRow({ task, onToggle }) {
  const status = task.status || (task.is_completed ? 'completed' : 'pending');
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onToggle(task.id, status)}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            status === 'completed'
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {status === 'completed' && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div>
          <p className={`font-medium ${
            status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'
          }`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
          )}
        </div>
      </div>
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
        {STATUS_LABELS[status] || status}
      </span>
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

  useEffect(() => { fetchTasks(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), status: 'pending' }),
      });
      if (res.ok) {
        const task = await res.json();
        setTasks(prev => [task, ...prev]);
        setNewTitle('');
      }
    } catch (e) {
      setError('خطا در افزودن وظیفه');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
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
    const s = t.status || (t.is_completed ? 'completed' : 'pending');
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
        <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex gap-3">
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
        </form>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-4">
          {[['all', 'همه'], ['pending', 'در انتظار'], ['in_progress', 'در حال انجام'], ['completed', 'تکمیل‌شده']].map(([val, label]) => (
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
            {tasks.filter(t => (t.status || (t.is_completed ? 'completed' : 'pending')) === 'completed').length} از {tasks.length} وظیفه تکمیل شده
          </p>
        )}
      </div>
    </div>
  );
}

export default Tasks;