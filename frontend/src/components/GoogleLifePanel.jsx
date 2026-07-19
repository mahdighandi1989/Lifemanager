import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// «جیمیل و تقویم» — the personal Google mirror panel, rendered inside the
// Drive settings tab (one Google connection, one place). Shows sync status,
// upcoming events, action-needed emails (+ file-as-task), digest controls.

function relTimeFa(iso) {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 60) return `${mins} دقیقه پیش`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} ساعت پیش`;
  return `${Math.round(hours / 24)} روز پیش`;
}

function fmtEventTime(iso, allDay) {
  if (allDay) return 'تمام‌روز';
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('fa-IR', { weekday: 'short', hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  } catch {
    return iso.slice(5, 16);
  }
}

function GoogleLifePanel() {
  const [status, setStatus] = useState(null);
  const [events, setEvents] = useState([]);
  const [actionEmails, setActionEmails] = useState([]);
  const [settings, setSettings] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState('');

  const load = useCallback(() => {
    api.get('/google/status').then((res) => {
      setStatus(res.data);
      setSettings(res.data?.settings || null);
    }).catch(() => {});
    api.get('/google/events', { params: { days: 7 } })
      .then((res) => setEvents(res.data?.events || []))
      .catch(() => {});
    api.get('/google/emails', { params: { needs_action: true, days: 14, limit: 10 } })
      .then((res) => setActionEmails(res.data?.emails || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (kind, path, okText) => {
    setBusy(kind);
    setMsg(null);
    try {
      const res = await api.post(path);
      const data = res.data || {};
      if (data.ok === false) {
        setMsg({ kind: 'error', text: data.detail || data.error || 'ناموفق بود' });
      } else {
        setMsg({ kind: 'success', text: okText + (data.email ? '' : '') });
      }
      load();
    } catch (e) {
      setMsg({ kind: 'error', text: 'خطا: ' + (e.response?.data?.detail || e.message || '') });
    } finally {
      setBusy('');
    }
  };

  const createTask = async (email) => {
    try {
      const res = await api.post(`/google/emails/${email.id}/create-task`, {});
      setMsg({ kind: 'success', text: `وظیفه ساخته شد: ${res.data?.title || ''}` });
      load();
    } catch (e) {
      setMsg({ kind: 'error', text: 'ساخت وظیفه ناموفق: ' + (e.message || '') });
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    const payload = {};
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'boolean') payload[key] = value;
      else if (typeof value === 'number' && Number.isFinite(value)) payload[key] = value;
    }
    try {
      const res = await api.put('/google/settings', payload);
      setSettings(res.data?.settings || settings);
      setMsg({ kind: 'success', text: 'تنظیمات ذخیره شد.' });
    } catch (e) {
      setMsg({ kind: 'error', text: 'ذخیره ناموفق: ' + (e.message || '') });
    }
  };

  const setNum = (key, raw) => {
    const value = raw === '' ? '' : Number(raw);
    setSettings((s) => ({ ...s, [key]: value === '' ? '' : value }));
  };

  const counts = status?.counts || {};

  return (
    <div className="mt-8" dir="rtl" data-testid="google-life-panel">
      <h2 className="text-xl font-bold text-gray-900 mb-1">جیمیل و تقویم</h2>
      <p className="text-gray-500 text-sm mb-4">
        با همین اتصال گوگل، ایمیل‌ها و رویدادهای تقویمت هر نیم‌ساعت خوانده و تحلیل می‌شوند؛
        موارد مهم یادآوری می‌شوند و هر شب «گزارش روز» برایت ارسال می‌شود (داخل برنامه، تلگرام
        و ایمیل). اگر تازه دسترسی جیمیل/تقویم اضافه شده، یک بار «قطع اتصال» و «اتصال» دوباره
        لازم است تا گوگل اجازهٔ جدید بدهد.
      </p>

      {msg && (
        <div
          className={`mb-4 rounded-xl p-3 text-sm ${
            msg.kind === 'success'
              ? 'bg-green-50 border border-green-100 text-green-700'
              : 'bg-red-50 border border-red-100 text-red-600'
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <div className="text-xl font-bold text-gray-900">{counts.emails ?? '—'}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">ایمیل همگام‌شده</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <div className={`text-xl font-bold ${counts.action_emails > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {counts.action_emails ?? '—'}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">منتظر اقدام</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <div className="text-xl font-bold text-gray-900">{counts.events_7d ?? '—'}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">رویداد ۷ روز آینده</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => run('test', '/google/test', 'دسترسی جیمیل سالم است ✅')}
          disabled={busy === 'test'}
          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 disabled:opacity-50"
          data-testid="google-test-btn"
        >
          {busy === 'test' ? '...' : 'بررسی دسترسی جیمیل'}
        </button>
        <button
          onClick={() => run('sync', '/google/sync', 'همگام‌سازی گوگل انجام شد')}
          disabled={busy === 'sync'}
          className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
          data-testid="google-sync-btn"
        >
          {busy === 'sync' ? 'در حال همگام‌سازی…' : 'همگام‌سازی اکنون'}
        </button>
        <button
          onClick={() => run('digest', '/google/digest/run', 'گزارش روز ارسال شد 📒')}
          disabled={busy === 'digest'}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
          data-testid="google-digest-btn"
        >
          {busy === 'digest' ? '...' : 'ارسال گزارش روز همین حالا'}
        </button>
      </div>
      <div className="text-[11px] text-gray-400 mb-4">
        آخرین خواندن ایمیل: {relTimeFa(status?.last_gmail_poll_at)} — آخرین خواندن تقویم:{' '}
        {relTimeFa(status?.last_calendar_poll_at)}
      </div>

      {actionEmails.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-100 p-4 mb-4">
          <h3 className="font-semibold text-amber-700 text-sm mb-2">📧 ایمیل‌های منتظر اقدام</h3>
          <div className="space-y-2">
            {actionEmails.map((e) => (
              <div key={e.id} className="flex items-start justify-between gap-2 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 truncate" dir="auto">{e.subject || 'بدون موضوع'}</p>
                  <p className="text-[11px] text-gray-500">
                    {e.ai_summary || ''} <span dir="ltr">{(e.from_addr || '').slice(0, 40)}</span>
                  </p>
                </div>
                <button
                  onClick={() => createTask(e)}
                  className="shrink-0 px-2 py-1 text-[11px] rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  ساخت وظیفه
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-2">🗓 رویدادهای پیشِ رو</h3>
        {events.length === 0 ? (
          <p className="text-xs text-gray-400">
            رویدادی همگام نشده — بعد از اتصال و همگام‌سازی این‌جا پر می‌شود.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {events.slice(0, 8).map((ev) => (
              <li key={ev.id} className="text-sm flex items-start gap-2">
                <span className="text-[11px] text-gray-400 shrink-0 pt-0.5">
                  {fmtEventTime(ev.start_at, ev.all_day)}
                </span>
                <span className={`${ev.status === 'cancelled' ? 'line-through text-gray-400' : 'text-gray-700'}`} dir="auto">
                  {ev.summary}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {settings && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm">تنظیمات همگام‌سازی گوگل</h3>
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!settings.enabled}
                onChange={(e) => setSettings((s) => ({ ...s, enabled: e.target.checked }))}
              />
              فعال
            </label>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            <label className="block text-sm">
              <span className="text-gray-600">خواندن ایمیل هر (دقیقه)</span>
              <input type="number" value={settings.gmail_poll_minutes ?? ''} onChange={(e) => setNum('gmail_poll_minutes', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
            </label>
            <label className="block text-sm">
              <span className="text-gray-600">خواندن تقویم هر (دقیقه)</span>
              <input type="number" value={settings.calendar_poll_minutes ?? ''} onChange={(e) => setNum('calendar_poll_minutes', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
            </label>
            <label className="block text-sm">
              <span className="text-gray-600">ساعت گزارش شبانه (محلی)</span>
              <input type="number" value={settings.digest_hour ?? ''} onChange={(e) => setNum('digest_hour', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
            </label>
            <label className="block text-sm">
              <span className="text-gray-600">یادآوری رویداد از چند ساعت قبل</span>
              <input type="number" value={settings.event_remind_hours ?? ''} onChange={(e) => setNum('event_remind_hours', e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
            </label>
          </div>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!settings.digest_enabled}
                onChange={(e) => setSettings((s) => ({ ...s, digest_enabled: e.target.checked }))}
              />
              گزارش شبانهٔ خودکار
            </label>
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!settings.digest_email_enabled}
                onChange={(e) => setSettings((s) => ({ ...s, digest_email_enabled: e.target.checked }))}
              />
              نسخهٔ ایمیلی گزارش هم بفرست
            </label>
            <button
              onClick={saveSettings}
              className="px-4 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 mr-auto"
            >
              ذخیرهٔ تنظیمات
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoogleLifePanel;
