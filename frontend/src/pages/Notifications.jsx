import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TYPE_ICONS = {
  info: { bg: 'bg-blue-100', text: 'text-blue-600' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  error: { bg: 'bg-red-100', text: 'text-red-600' },
  success: { bg: 'bg-green-100', text: 'text-green-600' },
};

function NotificationItem({ notification, onMarkRead }) {
  const colors = TYPE_ICONS[notification.type] || TYPE_ICONS.info;
  return (
    <div className={`flex items-start space-x-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/30' : ''}`}>
      <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="text-xs text-blue-600 hover:underline flex-shrink-0 ml-2"
            >
              خوانده شد
            </button>
          )}
        </div>
        {notification.message && (
          <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
        )}
        {notification.created_at && (
          <p className="text-xs text-gray-400 mt-1">
            {new Date(notification.created_at).toLocaleDateString('fa-IR')}
          </p>
        )}
      </div>
      {!notification.is_read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

// Notification event types the user can opt in/out of from the settings
// tab. `verify_failed` (audit task task_92fa5ea15e2b, AC8) is the
// failed-login/verification alert — it must be toggleable here. Each
// preference persists to localStorage under `notif_pref_<event>` so the
// choice survives reloads without a backend round-trip.
const EVENT_TYPES = [
  { key: 'verify_failed', label: 'ورود ناموفق / تأیید ناموفق' },
  { key: 'login_succeeded', label: 'ورود موفق' },
  { key: 'task_done', label: 'انجام کار' },
  { key: 'system', label: 'سیستم' },
  { key: 'warning', label: 'هشدار' },
  { key: 'error', label: 'خطا' },
  { key: 'info', label: 'اطلاع‌رسانی' },
];

function readPref(key) {
  try {
    const stored = localStorage.getItem(`notif_pref_${key}`);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

function NotificationSettings() {
  const [prefs, setPrefs] = useState(() => {
    const init = {};
    for (const ev of EVENT_TYPES) init[ev.key] = readPref(ev.key);
    return init;
  });

  const toggle = (key) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(`notif_pref_${key}`, String(next[key]));
      } catch {
        // localStorage unavailable (private mode) — keep in-memory only.
      }
      return next;
    });
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-5"
      data-testid="notification-settings"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-1">تنظیمات اعلان‌ها</h2>
      <p className="text-sm text-gray-500 mb-4">
        انتخاب کنید برای کدام رویدادها اعلان دریافت کنید.
      </p>
      <ul className="space-y-3">
        {EVENT_TYPES.map((ev) => (
          <li key={ev.key} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{ev.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[ev.key]}
              aria-label={ev.label}
              data-testid={`notif-toggle-${ev.key}`}
              onClick={() => toggle(ev.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                prefs[ev.key] ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  prefs[ev.key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Notifications({ embedded = false }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch('/notifications/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      setError('خطا در دریافت اعلان‌ها: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, [token]);

  const handleMarkRead = async (id) => {
    try {
      const res = await fetch(`/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch {
      // silent fail
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'} data-testid="notifications-page">
      <div className={embedded ? '' : 'max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'}>
        <div className="flex items-center justify-between mb-6">
          <div>
            {!embedded && <h1 className="text-3xl font-bold text-gray-900">اعلان‌ها</h1>}
            <p className="text-gray-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} اعلان خوانده‌نشده` : 'همه اعلان‌ها خوانده شده‌اند'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>
        )}

        <NotificationSettings />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <svg className="w-8 h-8 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              در حال بارگذاری...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-gray-500 font-medium">اعلانی وجود ندارد</p>
            </div>
          ) : (
            notifications.map(n => (
              <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;