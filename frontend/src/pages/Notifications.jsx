import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import TelegramSettings from './TelegramSettings';

// Unified notification hub: ONE place for delivery preferences across every
// channel (in-app bell, Telegram, email) plus the inbox. The per-event /
// per-channel prefs are backed by the server (GET/PUT /api/notifications/
// preferences) so toggling them actually changes what notify_event sends —
// the old localStorage-only toggles never reached the backend.

const TYPE_ICONS = {
  info: { bg: 'bg-blue-100', text: 'text-blue-600' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  error: { bg: 'bg-red-100', text: 'text-red-600' },
  success: { bg: 'bg-green-100', text: 'text-green-600' },
};

const PRIORITY_LABELS = { low: 'کم', normal: 'عادی', high: 'مهم', critical: 'بحرانی' };

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
            <button onClick={() => onMarkRead(notification.id)} className="text-xs text-blue-600 hover:underline flex-shrink-0 ml-2">
              خوانده شد
            </button>
          )}
        </div>
        {notification.message && <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>}
        {notification.created_at && (
          <p className="text-xs text-gray-400 mt-1">{new Date(notification.created_at).toLocaleDateString('fa-IR')}</p>
        )}
      </div>
      {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />}
    </div>
  );
}

function Switch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// The unified settings panel — channels + per-event prefs, all server-backed.
function NotificationSettings() {
  const [data, setData] = useState(null); // {prefs, events, channels, priorities}
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/notifications/preferences')
      .then((res) => setData(res.data))
      .catch(() => setMsg({ kind: 'error', text: 'خطا در دریافت تنظیمات اعلان' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const prefs = data?.prefs;

  const patch = async (partial) => {
    // optimistic: reflect immediately, then persist
    setData((d) => (d ? { ...d, prefs: deepMerge(d.prefs, partial) } : d));
    try {
      const res = await api.put('/notifications/preferences', partial);
      setData((d) => (d ? { ...d, prefs: res.data.prefs } : d));
    } catch {
      setMsg({ kind: 'error', text: 'ذخیرهٔ تنظیمات ناموفق بود' });
      load();
    }
  };

  const test = async (channel, label) => {
    setMsg({ kind: 'info', text: `در حال ارسال تست ${label}…` });
    try {
      const res = await api.post('/notifications/test', { channel });
      const ok = res?.data?.ok;
      setMsg({ kind: ok ? 'success' : 'error', text: ok ? `پیام تست ${label} ارسال شد ✅` : (res?.data?.error || 'ارسال تست ناموفق بود') });
    } catch (e) {
      setMsg({ kind: 'error', text: 'خطا در ارسال تست: ' + (e.message || '') });
    }
  };

  if (loading) {
    return (
      <div data-testid="notification-settings" className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-8 text-center text-gray-400">
        در حال بارگذاری تنظیمات…
      </div>
    );
  }

  return (
    <div data-testid="notification-settings" dir="rtl" className="mb-6 space-y-6">
      {msg && (
        <div
          className={`rounded-lg p-3 text-sm ${
            msg.kind === 'success' ? 'bg-green-50 border border-green-100 text-green-700'
            : msg.kind === 'error' ? 'bg-red-50 border border-red-100 text-red-600'
            : 'bg-blue-50 border border-blue-100 text-blue-700'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* ── Channels ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">کانال‌های ارسال</h2>
        <p className="text-sm text-gray-500 mb-4">انتخاب کنید اعلان‌ها از چه راه‌هایی به دست شما برسند.</p>

        {/* in-app (always on) */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-800">درون‌برنامه‌ای (زنگوله)</p>
            <p className="text-xs text-gray-400">همیشه فعال — تاریخچهٔ اعلان‌ها در همین صفحه نگه‌داری می‌شود.</p>
          </div>
          <span className="text-xs font-medium text-green-600">فعال</span>
        </div>

        {/* telegram */}
        <div className="py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">تلگرام</p>
              <p className="text-xs text-gray-400">ربات دوطرفه — هم اعلان می‌فرستد، هم به دستورها پاسخ می‌دهد.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => test('telegram', 'تلگرام')} className="text-xs text-blue-600 hover:underline">ارسال تست</button>
              <Switch
                checked={prefs?.channels?.telegram?.enabled}
                onChange={() => patch({ channels: { telegram: { enabled: !prefs?.channels?.telegram?.enabled } } })}
                label="فعال‌سازی کانال تلگرام"
              />
            </div>
          </div>
          {/* the embedded Telegram connection panel (webhook/status/test) */}
          <details className="mt-3">
            <summary className="text-xs text-blue-600 cursor-pointer select-none">تنظیمات اتصال تلگرام (webhook)</summary>
            <div className="mt-2">
              <TelegramSettings embedded />
            </div>
          </details>
        </div>

        {/* email (optional / future-ready) */}
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">ایمیل</p>
            <p className="text-xs text-gray-400">
              نیازمند تنظیم <span dir="ltr">SMTP_* / NOTIFICATION_EMAIL_TO</span> در سرور است.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => test('email', 'ایمیل')} className="text-xs text-blue-600 hover:underline">ارسال تست</button>
            <Switch
              checked={prefs?.channels?.email?.enabled}
              onChange={() => patch({ channels: { email: { enabled: !prefs?.channels?.email?.enabled } } })}
              label="فعال‌سازی کانال ایمیل"
            />
          </div>
        </div>
      </div>

      {/* ── Minimum priority ───────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">حداقل اولویت</h2>
            <p className="text-sm text-gray-500">اعلان‌های کم‌اهمیت‌تر از این سطح ارسال نمی‌شوند.</p>
          </div>
          <select
            value={prefs?.min_priority || 'low'}
            onChange={(e) => patch({ min_priority: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {(data?.priorities || ['low', 'normal', 'high', 'critical']).map((p) => (
              <option key={p} value={p}>{PRIORITY_LABELS[p] || p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Per-event toggles ──────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">رویدادها</h2>
        <p className="text-sm text-gray-500 mb-4">برای هر رویداد تعیین کنید ارسال شود یا نه، و صدادار باشد یا نه.</p>

        <div className="hidden sm:flex items-center justify-between pb-2 mb-2 border-b border-gray-100 text-xs text-gray-400">
          <span>رویداد</span>
          <span className="flex gap-8"><span className="w-11 text-center">ارسال</span><span className="w-11 text-center">صدا</span></span>
        </div>

        <ul className="space-y-3">
          {(data?.events || []).map((ev) => {
            const enabled = prefs?.events?.[ev.key];
            const sound = prefs?.sound?.[ev.key];
            return (
              <li key={ev.key} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-800">{ev.label}</p>
                  {ev.help && <p className="text-xs text-gray-400 truncate">{ev.help}</p>}
                </div>
                <div className="flex items-center gap-8 flex-shrink-0">
                  <Switch checked={enabled} onChange={() => patch({ events: { [ev.key]: !enabled } })} label={`ارسال ${ev.label}`} />
                  <Switch checked={sound} disabled={!enabled} onChange={() => patch({ sound: { [ev.key]: !sound } })} label={`صدای ${ev.label}`} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// one-level deep merge for optimistic updates (events/sound/channels are nested)
function deepMerge(base, partial) {
  const out = { ...base };
  for (const [k, v] of Object.entries(partial || {})) {
    if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object') {
      out[k] = { ...out[k] };
      for (const [k2, v2] of Object.entries(v)) {
        out[k][k2] = v2 && typeof v2 === 'object' && out[k][k2] && typeof out[k][k2] === 'object'
          ? { ...out[k][k2], ...v2 }
          : v2;
      }
    } else {
      out[k] = v;
    }
  }
  return out;
}

function Notifications({ embedded = false }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch('/notifications/', { headers: { Authorization: `Bearer ${token}` } });
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
      const res = await fetch(`/notifications/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      // silent fail
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-50 py-8'} data-testid="notifications-page">
      <div className={embedded ? '' : 'max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'} dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <div>
            {!embedded && <h1 className="text-3xl font-bold text-gray-900">اعلان‌ها</h1>}
            <p className="text-gray-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} اعلان خوانده‌نشده` : 'همه اعلان‌ها خوانده شده‌اند'}
            </p>
          </div>
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>}

        <NotificationSettings />

        <h2 className="text-lg font-semibold text-gray-900 mb-2">صندوق اعلان‌ها</h2>
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
            notifications.map((n) => <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
