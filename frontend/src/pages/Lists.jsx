/**
 * Lists overview — sidebar-style page showing every TodoList in the
 * user's profile. Selecting a list opens ListDetail (rendered inline
 * when a list is selected, to keep navigation snappy without
 * round-tripping through the router for every click).
 *
 * Backend contract:
 *   GET    /api/lists                  → [{id, name, item_count, …}]
 *   POST   /api/lists                  → {name, description}
 *   PUT    /api/lists/{id}             → partial updates
 *   DELETE /api/lists/{id}             → 204
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SahatChip from '../components/SahatChip';

const API_BASE = '/api';

function NewListForm({ onCreated }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const lst = await res.json();
      setName('');
      onCreated(lst);
    } catch (err) {
      setError('خطا در ایجاد لیست');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex gap-2 mb-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="نام لیست جدید…"
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <button
        type="submit"
        disabled={busy || !name.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {busy ? '…' : 'افزودن لیست'}
      </button>
      {error && <span className="text-red-600 text-xs self-center">{error}</span>}
    </form>
  );
}

function ListRow({ list, onDelete }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
      <Link
        to={`/lists/${list.id}`}
        className="flex-1 flex items-center gap-3 text-right"
        data-testid={`list-row-${list.id}`}
      >
        <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold">
          {list.item_count}
        </span>
        <span className="font-medium text-gray-900 truncate">{list.name}</span>
      </Link>
      <SahatChip
        entityType="list"
        entityId={list.id}
        sahat={list.sahat}
        source={list.sahat_source}
      />
      <button
        onClick={() => onDelete(list.id)}
        className="text-gray-400 hover:text-red-600 text-sm"
        aria-label="حذف لیست"
        data-testid={`list-delete-${list.id}`}
      >
        حذف
      </button>
    </div>
  );
}

function Lists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLists = async () => {
    try {
      const res = await fetch(`${API_BASE}/lists`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLists(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      setError('خطا در دریافت لیست‌ها: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCreated = (lst) => {
    setLists((prev) => [...prev, { ...lst, item_count: 0 }]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('حذف این لیست؟')) return;
    try {
      const res = await fetch(`${API_BASE}/lists/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLists((prev) => prev.filter((l) => l.id !== id));
      }
    } catch {
      setError('خطا در حذف لیست');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">لیست‌ها</h1>
          <p className="text-gray-500 mt-1">لیست‌های تو-دو شما</p>
        </div>

        <NewListForm onCreated={handleCreated} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100 text-sm text-red-600 rounded-t-xl">
              {error}
            </div>
          )}
          {loading ? (
            <div className="p-8 text-center text-gray-400">در حال بارگذاری…</div>
          ) : lists.length === 0 ? (
            <div className="p-8 text-center text-gray-400">لیستی وجود ندارد</div>
          ) : (
            lists.map((lst) => (
              <ListRow key={lst.id} list={lst} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Lists;
