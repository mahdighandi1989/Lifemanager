/**
 * ListDetail — items inside one TodoList.
 *
 * Reads the :listId from the URL, fetches the list + items, and
 * renders each item as a row with:
 *   * a checkbox that toggles is_completed (strike-through)
 *   * a star that toggles is_starred
 *   * a description field shown on expansion
 *   * a "share" picker to add the item to another list (M2M)
 *   * a "move" picker to relocate the item to another list
 *   * a delete button (with confirm)
 *
 * Backend contract:
 *   GET    /api/lists/{id}                       → list + items
 *   POST   /api/lists/{id}/items                 → add item
 *   PATCH  /api/todo-items/{id}                  → update
 *   POST   /api/todo-items/{id}/toggle-complete  → toggle
 *   POST   /api/todo-items/{id}/toggle-star      → toggle
 *   POST   /api/todo-items/{id}/share            → {list_ids}
 *   POST   /api/todo-items/{id}/move             → {from, to}
 *   DELETE /api/todo-items/{id}                  → 204
 */
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const API_BASE = '/api';

function ItemRow({ item, listId, allLists, onChanged, onDeleted }) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);

  const post = async (path, body) => {
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) {
        const updated = await res.json();
        onChanged(updated);
      }
    } finally {
      setBusy(false);
    }
  };

  const toggleComplete = () => post(`/todo-items/${item.id}/toggle-complete`);
  const toggleStar = () => post(`/todo-items/${item.id}/toggle-star`);

  const share = async () => {
    const targetId = window.prompt('شناسهٔ لیست مقصد برای اشتراک:');
    const id = parseInt(targetId, 10);
    if (!id) return;
    await post(`/todo-items/${item.id}/share`, { list_ids: [id] });
  };

  const move = async () => {
    const targetId = window.prompt('شناسهٔ لیست مقصد برای انتقال:');
    const id = parseInt(targetId, 10);
    if (!id) return;
    await post(`/todo-items/${item.id}/move`, {
      from_list_id: listId,
      to_list_id: id,
    });
    onDeleted(item.id); // disappears from current list
  };

  const remove = async () => {
    if (!window.confirm('حذف این آیتم؟')) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/todo-items/${item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) onDeleted(item.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 p-4 hover:bg-gray-50">
        <button
          onClick={toggleComplete}
          disabled={busy}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            item.is_completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-green-400'
          }`}
          aria-label="تغییر وضعیت تکمیل"
          data-testid={`item-toggle-${item.id}`}
        >
          {item.is_completed && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <button
          onClick={toggleStar}
          disabled={busy}
          className={`text-xl ${item.is_starred ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
          aria-label="ستاره‌گذاری"
          data-testid={`item-star-${item.id}`}
        >
          ★
        </button>

        <div className="flex-1 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
          <p className={`font-medium ${item.is_completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {item.content}
          </p>
          {item.list_ids && item.list_ids.length > 1 && (
            <p className="text-xs text-blue-500 mt-0.5">
              در {item.list_ids.length} لیست
            </p>
          )}
        </div>

        <div className="flex gap-2 text-xs text-gray-500">
          <button onClick={share} className="hover:text-blue-600">اشتراک</button>
          <button onClick={move} className="hover:text-blue-600">انتقال</button>
          <button onClick={remove} className="hover:text-red-600">حذف</button>
        </div>
      </div>

      {expanded && (
        <div className="px-12 pb-4 text-sm text-gray-600">
          {item.description ? (
            <p>{item.description}</p>
          ) : (
            <p className="text-gray-300 italic">بدون توضیح</p>
          )}
        </div>
      )}
    </div>
  );
}

function NewItemForm({ listId, onCreated }) {
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        const item = await res.json();
        setContent('');
        onCreated(item);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex gap-2 mb-4">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="آیتم جدید…"
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <button
        type="submit"
        disabled={busy || !content.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        افزودن
      </button>
    </form>
  );
}

function ListDetail() {
  const { listId } = useParams();
  const id = parseInt(listId, 10);
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [allLists, setAllLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    try {
      const [listRes, listsRes] = await Promise.all([
        fetch(`${API_BASE}/lists/${id}`),
        fetch(`${API_BASE}/lists`),
      ]);
      if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);
      const data = await listRes.json();
      setList(data);
      setItems(data.items || []);
      if (listsRes.ok) setAllLists(await listsRes.json());
      setError(null);
    } catch (e) {
      setError('خطا در دریافت لیست: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Number.isFinite(id)) fetchAll();
  }, [id]);

  const onCreated = (item) => setItems((prev) => [...prev, item]);
  const onChanged = (item) =>
    setItems((prev) => prev.map((it) => (it.id === item.id ? item : it)));
  const onDeleted = (itemId) =>
    setItems((prev) => prev.filter((it) => it.id !== itemId));

  if (!Number.isFinite(id)) {
    return <div className="p-8 text-center text-red-500">شناسهٔ لیست نامعتبر</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link to="/lists" className="text-blue-600 text-sm hover:underline">
            ← بازگشت به لیست‌ها
          </Link>
        </div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {list ? list.name : '…'}
          </h1>
          {list && list.description && (
            <p className="text-gray-500 mt-1">{list.description}</p>
          )}
        </div>

        <NewItemForm listId={id} onCreated={onCreated} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100 text-sm text-red-600 rounded-t-xl">
              {error}
            </div>
          )}
          {loading ? (
            <div className="p-8 text-center text-gray-400">در حال بارگذاری…</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-400">آیتمی وجود ندارد</div>
          ) : (
            items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                listId={id}
                allLists={allLists}
                onChanged={onChanged}
                onDeleted={onDeleted}
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-3">
            {items.filter((i) => i.is_completed).length} از {items.length} تکمیل شده
          </p>
        )}
      </div>
    </div>
  );
}

export default ListDetail;
