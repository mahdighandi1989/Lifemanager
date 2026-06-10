import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

// User-management page (admin only). Lists every Google sign-in user and lets
// an admin set each one's status, access level and admin flag, or delete them.
// All mutations go through the role-gated backend endpoints under /auth/users.

const STATUS_LABELS = {
  approved: { text: 'تأیید شده', cls: 'bg-green-100 text-green-700' },
  pending: { text: 'در انتظار', cls: 'bg-yellow-100 text-yellow-700' },
  rejected: { text: 'رد شده', cls: 'bg-red-100 text-red-700' },
  active: { text: 'فعال', cls: 'bg-blue-100 text-blue-700' },
};

function authHeaders() {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [levels, setLevels] = useState([
    { key: 'read-only', label: 'فقط خواندنی' },
    { key: 'editor', label: 'ویرایشگر' },
    { key: 'admin', label: 'ادمین (دسترسی کامل)' },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/auth/users', { headers: authHeaders() });
      if (res.status === 403) { setError('دسترسی فقط برای مدیران مجاز است.'); return; }
      if (!res.ok) { setError('بارگذاری کاربران ناموفق بود.'); return; }
      const data = await res.json();
      setUsers(data.users || []);
      if (Array.isArray(data.access_levels)) setLevels(data.access_levels);
    } catch {
      setError('خطا در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2500);
  };

  const patchUser = async (id, patch) => {
    setBusyId(id);
    try {
      const res = await fetch(`/auth/users/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { showToast(data.detail || 'به‌روزرسانی ناموفق بود', 'error'); return; }
      setUsers((prev) => prev.map((u) => (u.id === id ? data.user : u)));
      showToast('ذخیره شد');
    } catch {
      showToast('خطا در ارتباط با سرور', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm('این کاربر حذف شود؟')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/auth/users/${id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { showToast(data.detail || 'حذف ناموفق بود', 'error'); return; }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('کاربر حذف شد');
    } catch {
      showToast('خطا در ارتباط با سرور', 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (!user?.is_admin) {
    return (
      <div className="max-w-3xl mx-auto mt-10 bg-white rounded-xl shadow-sm p-8 text-center" dir="rtl">
        <p className="text-gray-600">این صفحه فقط برای مدیران در دسترس است.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مدیریت کاربران</h1>
          <p className="text-sm text-gray-500 mt-1">نقش، سطح دسترسی و وضعیت هر کاربر را تعیین کنید.</p>
        </div>
        <button onClick={load} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">به‌روزرسانی</button>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="text-center text-gray-400 py-16">در حال بارگذاری...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-right p-3 font-medium">ایمیل</th>
                <th className="text-right p-3 font-medium">نام</th>
                <th className="text-right p-3 font-medium">وضعیت</th>
                <th className="text-right p-3 font-medium">سطح دسترسی</th>
                <th className="text-right p-3 font-medium">ادمین</th>
                <th className="text-right p-3 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan="6" className="p-10 text-center text-gray-400">هنوز کاربری وارد نشده است.</td></tr>
              )}
              {users.map((u) => {
                const st = STATUS_LABELS[u.status] || STATUS_LABELS.active;
                const locked = u.is_super_admin || busyId === u.id;
                return (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-3 text-gray-800">
                      {u.email}
                      {u.is_super_admin && <span className="mr-2 text-xs text-purple-600">(مالک)</span>}
                    </td>
                    <td className="p-3 text-gray-600">{u.name || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${st.cls}`}>{st.text}</span>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.permissions || 'read-only'}
                        disabled={locked}
                        onChange={(e) => patchUser(u.id, { permissions: e.target.value })}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm disabled:opacity-50"
                      >
                        {levels.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={!!u.is_admin}
                        disabled={locked}
                        onChange={(e) => patchUser(u.id, { role: e.target.checked ? 'admin' : 'user' })}
                        className="w-4 h-4 accent-blue-600 disabled:opacity-50"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {u.status !== 'approved' && (
                          <button onClick={() => patchUser(u.id, { status: 'approved' })} disabled={locked}
                            className="px-2.5 py-1 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">تأیید</button>
                        )}
                        {u.status !== 'rejected' && (
                          <button onClick={() => patchUser(u.id, { status: 'rejected' })} disabled={locked}
                            className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-yellow-50 disabled:opacity-50">رد</button>
                        )}
                        <button onClick={() => removeUser(u.id)} disabled={locked}
                          className="px-2.5 py-1 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50">حذف</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-lg text-white text-sm font-medium z-50 ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
