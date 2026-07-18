import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';
import DevProjectsOverview from '../components/DevProjectsOverview';
import ActivityLogPanel from '../components/ActivityLogPanel';

// «مرکز توسعه» — live Render logs + stats + کارنامهٔ روزانه + token settings.
// Modeled on the sibling PM app's Render panel (service chips, level filter,
// live dark viewer, 10s polling) but scoped to the life-management view.

const TABS = [
  { id: 'overview', label: 'نمای کلی' },
  { id: 'live', label: 'لاگ زنده' },
  { id: 'stats', label: 'آمار' },
  { id: 'summaries', label: 'کارنامهٔ روزانه' },
  { id: 'settings', label: 'تنظیمات' },
];

const LEVELS = [
  { id: 'error', label: 'error', chip: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'warn', label: 'warn', chip: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'info', label: 'info', chip: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'debug', label: 'debug', chip: 'bg-gray-100 text-gray-500 border-gray-200' },
];

const LEVEL_TEXT = {
  error: 'text-red-400',
  warn: 'text-amber-300',
  info: 'text-emerald-300',
  debug: 'text-gray-400',
};

const RANGES = [
  { minutes: 10, label: '۱۰ دقیقه' },
  { minutes: 30, label: '۳۰ دقیقه' },
  { minutes: 60, label: '۱ ساعت' },
  { minutes: 360, label: '۶ ساعت' },
  { minutes: 1440, label: '۲۴ ساعت' },
];

function initialTab() {
  try {
    const q = new URLSearchParams(window.location.search).get('tab');
    if (q && TABS.some((t) => t.id === q)) return q;
  } catch { /* no window */ }
  return 'overview';
}

// ── لاگ زنده ─────────────────────────────────────────────────────────────────
function LiveLogsTab() {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null); // null = همه
  const [levels, setLevels] = useState(['error', 'warn', 'info']);
  const [range, setRange] = useState(30);
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState([]);
  const [polling, setPolling] = useState(true);
  const [lastError, setLastError] = useState(null);
  const panelRef = useRef(null);
  const stateRef = useRef({});
  stateRef.current = { selected, levels, range, search };

  useEffect(() => {
    api
      .get('/dev/services')
      .then((res) => {
        const list = res.data?.services || [];
        setServices(list);
        setSelected(null);
      })
      .catch(() => setLastError('خطا در دریافت سرویس‌ها'));
  }, []);

  const refresh = useCallback(async (fetchRemote) => {
    const s = stateRef.current;
    // an explicitly empty selection means «هیچ سرویسی» — show nothing,
    // fetch nothing (null still means "all").
    if (s.selected !== null && s.selected.length === 0) {
      setLogs([]);
      setLastError(null);
      return;
    }
    try {
      if (fetchRemote) {
        await api.post('/dev/logs/fetch', {
          service_ids: s.selected && s.selected.length ? s.selected : null,
        });
      }
      const params = {
        since_minutes: s.range,
        limit: 500,
      };
      if (s.selected && s.selected.length) params.service_ids = s.selected.join(',');
      if (s.levels.length) params.levels = s.levels.join(',');
      if (s.search.trim()) params.q = s.search.trim();
      const res = await api.get('/dev/logs', { params });
      const rows = (res.data?.logs || []).slice().reverse(); // oldest → newest
      const el = panelRef.current;
      // only stick to the bottom if the user is already there — a background
      // poll must not yank them out of scrollback.
      const nearBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 60;
      setLogs(rows);
      setLastError(null);
      requestAnimationFrame(() => {
        if (el && nearBottom) el.scrollTop = el.scrollHeight;
      });
    } catch (e) {
      setLastError('خطا در دریافت لاگ‌ها: ' + (e.message || ''));
    }
  }, []);

  // filter changes re-read from the DB (debounced — the search box fires per
  // keystroke); the first render is covered by the polling effect below.
  const firstFilterRun = useRef(true);
  useEffect(() => {
    if (firstFilterRun.current) {
      firstFilterRun.current = false;
      return undefined;
    }
    const t = setTimeout(() => refresh(false), 350);
    return () => clearTimeout(t);
  }, [refresh, selected, levels, range, search]);

  useEffect(() => {
    if (!polling) {
      refresh(false); // paused: still show the current window once
      return undefined;
    }
    refresh(true);
    const id = setInterval(() => refresh(true), 10000);
    return () => clearInterval(id);
  }, [polling, refresh]);

  const toggleService = (id) => {
    setSelected((prev) => {
      const base = prev === null ? services.map((s) => s.id) : prev;
      return base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    });
  };

  const toggleLevel = (id) => {
    setLevels((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const download = () => {
    const text = logs
      .map((l) => `${l.timestamp} [${l.level}] [${l.service_name || l.service_id}] ${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dev-logs-${new Date().toISOString().slice(0, 16)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedSet = selected === null ? services.map((s) => s.id) : selected;

  return (
    <div data-testid="dev-live-tab">
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
        <div className="flex items-start gap-2 flex-wrap mb-3">
          <span className="text-sm text-gray-500 pt-1">سرویس‌ها:</span>
          <div className="flex gap-2 flex-wrap">
            {services.map((s) => (
              <button
                key={s.id}
                dir="ltr"
                onClick={() => toggleService(s.id)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                  selectedSet.includes(s.id)
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
                title={s.status}
              >
                {s.name}
              </button>
            ))}
            {services.length === 0 && (
              <span className="text-xs text-gray-400 pt-1">
                سرویسی همگام نشده — در تنظیمات، توکن رندر را بگذار و همگام‌سازی کن.
              </span>
            )}
          </div>
          <div className="mr-auto flex gap-2">
            <button
              onClick={() => setSelected(services.map((s) => s.id))}
              className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              انتخاب همه
            </button>
            <button
              onClick={() => setSelected([])}
              className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              پاک کردن
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">سطح:</span>
          {LEVELS.map((lv) => (
            <button
              key={lv.id}
              dir="ltr"
              onClick={() => toggleLevel(lv.id)}
              className={`px-2.5 py-1 text-xs rounded-lg border ${
                levels.includes(lv.id) ? lv.chip : 'bg-white border-gray-200 text-gray-400'
              }`}
            >
              {lv.label}
            </button>
          ))}
          <span className="text-sm text-gray-500 mr-2">بازه:</span>
          <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600"
          >
            {RANGES.map((r) => (
              <option key={r.minutes} value={r.minutes}>
                {r.label}
              </option>
            ))}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در لاگ‌ها…"
            className="flex-1 min-w-[160px] text-sm border border-gray-200 rounded-lg px-3 py-1.5"
          />
          <button
            onClick={() => setPolling((p) => !p)}
            className={`px-3 py-1.5 text-xs rounded-lg text-white ${
              polling ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400 hover:bg-gray-500'
            }`}
            data-testid="dev-live-toggle"
          >
            {polling ? '⏸ توقف' : '▶ ادامه'}
          </button>
          <button
            onClick={() => refresh(true)}
            className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            🔄 بروزرسانی
          </button>
          <button
            onClick={download}
            disabled={logs.length === 0}
            className="px-3 py-1.5 text-xs rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40"
          >
            دانلود
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-1 px-1">
        <span>{logs.length} لاگ نمایش داده می‌شود</span>
        {polling && <span className="text-emerald-600">● دریافت زنده هر ۱۰ ثانیه</span>}
      </div>
      {lastError && (
        <div className="mb-2 bg-red-50 border border-red-100 rounded-lg p-2 text-xs text-red-600">{lastError}</div>
      )}
      <div
        ref={panelRef}
        dir="ltr"
        className="bg-gray-950 rounded-xl p-3 h-[28rem] overflow-y-auto font-mono text-[11px] leading-relaxed text-left"
        data-testid="dev-live-panel"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center pt-16">لاگی در این بازه نیست</div>
        ) : (
          logs.map((l) => (
            <div key={l.id} className="whitespace-pre-wrap break-all">
              <span className="text-gray-500">{(l.timestamp || '').slice(11, 19)} </span>
              <span className={`${LEVEL_TEXT[l.level] || 'text-gray-300'}`}>[{l.level}] </span>
              <span className="text-sky-400">[{l.service_name || l.service_id}] </span>
              <span className="text-gray-200">{l.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── آمار ────────────────────────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState(null);
  const [hours, setHours] = useState(24);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/dev/logs/stats', { params: { since_hours: hours } })
      .then((res) => setStats(res.data))
      .catch((e) => setError('خطا در دریافت آمار: ' + (e.message || '')));
  }, [hours]);

  if (error) {
    return <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error}</div>;
  }
  if (!stats) return <div className="p-8 text-center text-gray-400">در حال بارگذاری…</div>;

  const byLevel = stats.by_level || {};
  const levelTotal = Math.max(1, stats.total || 0);
  const hourMax = Math.max(1, ...(stats.by_hour || []).map((h) => h.total));

  const LEVEL_BAR = {
    error: 'bg-red-500',
    warn: 'bg-amber-400',
    info: 'bg-blue-500',
    debug: 'bg-gray-400',
  };

  return (
    <div data-testid="dev-stats-tab">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">بازهٔ آمار:</span>
        {[24, 72, 168].map((h) => (
          <button
            key={h}
            onClick={() => setHours(h)}
            className={`px-2.5 py-1 text-xs rounded-lg border ${
              hours === h ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-500'
            }`}
          >
            {h === 24 ? '۲۴ ساعت' : h === 72 ? '۳ روز' : '۷ روز'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">کل لاگ‌ها</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className={`text-2xl font-bold ${byLevel.error ? 'text-red-600' : 'text-emerald-600'}`}>
            {byLevel.error || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">خطا</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-amber-500">{byLevel.warn || 0}</div>
          <div className="text-xs text-gray-500 mt-1">هشدار</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{(stats.by_service || []).length}</div>
          <div className="text-xs text-gray-500 mt-1">سرویس دارای لاگ</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">توزیع سطح‌ها</h3>
        <div className="space-y-2">
          {['error', 'warn', 'info', 'debug'].map((lv) => (
            <div key={lv} className="flex items-center gap-2">
              <span dir="ltr" className="w-12 text-xs text-gray-500 text-left">{lv}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden" dir="ltr">
                <div
                  className={`h-3 rounded-full ${LEVEL_BAR[lv]}`}
                  style={{ width: `${Math.round(((byLevel[lv] || 0) / levelTotal) * 100)}%` }}
                />
              </div>
              <span className="w-14 text-xs text-gray-600">{byLevel[lv] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">روند ساعتی (کل / خطا)</h3>
        {(stats.by_hour || []).length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-6">داده‌ای نیست</div>
        ) : (
          <div dir="ltr" className="flex items-end gap-[3px] h-32 overflow-x-auto pb-1">
            {stats.by_hour.map((h) => (
              <div
                key={h.hour}
                className="flex flex-col justify-end items-center shrink-0 w-4 h-full"
                title={`${h.hour} | logs: ${h.total} | errors: ${h.error}`}
              >
                {/* stacked: errors are PART of total, so blue = total-error */}
                {h.total - h.error > 0 && (
                  <div
                    className="w-3 rounded-t bg-blue-400"
                    style={{ height: `${Math.max(2, Math.round(((h.total - h.error) / hourMax) * 100))}%` }}
                  />
                )}
                {h.error > 0 && (
                  <div
                    className={`w-3 bg-red-500 ${h.total === h.error ? 'rounded-t' : ''}`}
                    style={{ height: `${Math.max(2, Math.round((h.error / hourMax) * 100))}%` }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">به تفکیک سرویس</h3>
        <div className="space-y-1.5">
          {(stats.by_service || []).map((s) => (
            <div key={s.service_id} className="flex items-center justify-between text-xs">
              <span dir="ltr" className="text-gray-700">{s.service_name || s.service_id}</span>
              <span className="text-gray-500">
                {s.total} لاگ{s.error > 0 && <span className="text-red-600"> — {s.error} خطا</span>}
              </span>
            </div>
          ))}
          {(stats.by_service || []).length === 0 && (
            <div className="text-xs text-gray-400 text-center py-4">داده‌ای نیست</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── کارنامهٔ روزانه ──────────────────────────────────────────────────────────
function SummariesTab() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/dev/summaries', { params: { days: 30 } })
      .then((res) => setSummaries(res.data?.summaries || []))
      .catch(() => setNotice('خطا در دریافت کارنامه‌ها'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const generate = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const res = await api.post('/dev/summaries/generate', {});
      setNotice(`کارنامهٔ امروز برای ${res.data?.count ?? 0} سرویس ساخته/به‌روز شد.`);
      load();
    } catch (e) {
      setNotice('تولید کارنامه ناموفق: ' + (e.response?.data?.detail || e.message || ''));
    } finally {
      setBusy(false);
    }
  };

  const byDate = summaries.reduce((acc, s) => {
    (acc[s.summary_date] = acc[s.summary_date] || []).push(s);
    return acc;
  }, {});

  return (
    <div data-testid="dev-summaries-tab">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-gray-500">
          خلاصهٔ فارسی روزانهٔ هر سرویس از روی لاگ‌ها — «امروز در هر پروژه چه گذشت». در لاگ
          فعالیت‌ها هم ثبت می‌شود.
        </p>
        <button
          onClick={generate}
          disabled={busy}
          className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          data-testid="dev-generate-summary"
        >
          {busy ? 'در حال تولید…' : 'تولید کارنامهٔ امروز'}
        </button>
      </div>
      {notice && (
        <div className="mb-3 bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-sm text-blue-700">{notice}</div>
      )}
      {loading ? (
        <div className="p-8 text-center text-gray-400">در حال بارگذاری…</div>
      ) : Object.keys(byDate).length === 0 ? (
        <div className="p-10 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
          هنوز کارنامه‌ای ساخته نشده. موتور هر شب خودش می‌سازد؛ یا همین حالا دکمهٔ بالا را بزن.
        </div>
      ) : (
        Object.entries(byDate).map(([day, items]) => (
          <div key={day} className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2" dir="ltr">📅 {day}</h3>
            <div className="space-y-2">
              {items.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <span dir="ltr" className="text-xs font-medium text-sky-700">{s.service_name || s.service_id}</span>
                    <span className="text-[10px] text-gray-400" dir="rtl">
                      {s.ai_model ? <span dir="ltr">🤖 {s.ai_model}</span> : 'خلاصهٔ خودکار (بدون AI)'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{s.summary}</p>
                  {s.stats && (
                    <div className="text-[11px] text-gray-400 mt-2">
                      {s.stats.total} لاگ — {(s.stats.by_level || {}).error || 0} خطا،{' '}
                      {(s.stats.by_level || {}).warn || 0} هشدار
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── تنظیمات ──────────────────────────────────────────────────────────────────
function SettingsTab() {
  const [integrations, setIntegrations] = useState(null);
  const [settings, setSettings] = useState(null);
  const [tokenInputs, setTokenInputs] = useState({ github: '', render: '' });
  const [notice, setNotice] = useState(null);
  const [testResult, setTestResult] = useState({});

  const load = useCallback(() => {
    api.get('/dev/integrations').then((res) => setIntegrations(res.data)).catch(() => {});
    api.get('/dev/settings').then((res) => setSettings(res.data?.settings || null)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveToken = async (provider, clear = false) => {
    try {
      await api.put(`/dev/integrations/${provider}`, {
        api_key: clear ? '' : tokenInputs[provider],
      });
      setTokenInputs((t) => ({ ...t, [provider]: '' }));
      setNotice(clear ? 'کلید پاک شد.' : 'کلید ذخیره شد (رمزنگاری‌شده).');
      load();
    } catch (e) {
      setNotice('ذخیرهٔ کلید ناموفق: ' + (e.response?.data?.detail || e.message || ''));
    }
  };

  const testConnection = async (provider) => {
    setTestResult((r) => ({ ...r, [provider]: { pending: true } }));
    try {
      const res = await api.post(`/dev/integrations/${provider}/test`);
      setTestResult((r) => ({ ...r, [provider]: res.data }));
    } catch (e) {
      setTestResult((r) => ({ ...r, [provider]: { ok: false, error: e.message } }));
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    const payload = {};
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'boolean') payload[key] = value;
      else if (typeof value === 'number' && Number.isFinite(value)) payload[key] = value;
      // stamps / strings are never sent back (settings-echo lesson)
    }
    try {
      const res = await api.put('/dev/settings', payload);
      setSettings(res.data?.settings || settings);
      setNotice('تنظیمات ذخیره شد.');
    } catch (e) {
      setNotice('ذخیرهٔ تنظیمات ناموفق: ' + (e.response?.data?.detail || e.message || ''));
    }
  };

  const setNum = (key, raw) => {
    const value = raw === '' ? '' : Number(raw);
    setSettings((s) => ({ ...s, [key]: value === '' ? '' : value }));
  };

  const PROVIDER_META = {
    github: {
      title: 'گیت‌هاب',
      envHint: 'GITHUB_TOKEN (یا GH_TOKEN)',
      desc: 'برای همگام‌سازی مخزن‌ها. یک Personal Access Token با دسترسی خواندن repo کافی است.',
    },
    render: {
      title: 'رندر',
      envHint: 'RENDER_API_KEY',
      desc: 'برای فهرست سرویس‌ها و دریافت لاگ‌ها. از Render → Account Settings → API Keys بساز.',
    },
  };

  const numField = (key, label, hint) => (
    <label className="block text-sm">
      <span className="text-gray-600">{label}</span>
      <input
        type="number"
        value={settings?.[key] ?? ''}
        onChange={(e) => setNum(key, e.target.value)}
        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
      />
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </label>
  );

  return (
    <div data-testid="dev-settings-tab">
      {notice && (
        <div className="mb-3 bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-sm text-blue-700 flex justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-blue-400">✕</button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {['github', 'render'].map((provider) => {
          const st = integrations?.[provider] || {};
          const meta = PROVIDER_META[provider];
          const test = testResult[provider];
          return (
            <div key={provider} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-800">
                  کلید {meta.title}
                </h3>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    st.source
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {st.source === 'db' ? 'ذخیره در برنامه' : st.source === 'env' ? 'از متغیر محیطی' : 'تنظیم نشده'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{meta.desc}</p>
              <div className="text-[11px] text-gray-400 mb-2" dir="rtl">
                راه ساده‌تر: در Render متغیر محیطی <code dir="ltr" className="bg-gray-100 px-1 rounded">{meta.envHint}</code> را بگذار — بدون نیاز به این فرم.
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  dir="ltr"
                  value={tokenInputs[provider]}
                  onChange={(e) => setTokenInputs((t) => ({ ...t, [provider]: e.target.value }))}
                  placeholder={st.has_api_key ? '•••••••• (کلید ذخیره شده)' : 'توکن را اینجا بچسبان'}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                />
                <button
                  onClick={() => saveToken(provider)}
                  disabled={!tokenInputs[provider]}
                  className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white disabled:opacity-40"
                >
                  ذخیره
                </button>
              </div>
              <div className="flex gap-2 mt-2 items-center flex-wrap">
                <button
                  onClick={() => testConnection(provider)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  بررسی اتصال
                </button>
                {st.has_api_key && (
                  <button
                    onClick={() => saveToken(provider, true)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    پاک کردن کلید
                  </button>
                )}
                {test && !test.pending && (
                  <span className={`text-xs ${test.ok ? 'text-emerald-600' : 'text-red-600'}`} dir="rtl">
                    {test.ok
                      ? `✓ متصل${test.login || test.owner ? ' — ' : ''}${test.login || test.owner || ''}`
                      : `✗ ${test.detail || test.error || 'ناموفق'}`}
                  </span>
                )}
                {test?.pending && <span className="text-xs text-gray-400">در حال بررسی…</span>}
              </div>
              {st.last_sync_at && (
                <div className="text-[11px] text-gray-400 mt-2">
                  آخرین همگام‌سازی: <span dir="ltr">{st.last_sync_at.slice(0, 19).replace('T', ' ')}</span>
                  {st.last_sync_ok === false && (
                    <span className="text-red-500"> — ناموفق: <span dir="ltr">{st.last_sync_error}</span></span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {settings && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">موتور همگام‌سازی</h3>
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
            {numField('repo_sync_interval_minutes', 'فاصلهٔ همگام‌سازی مخزن‌ها (دقیقه)')}
            {numField('service_sync_interval_minutes', 'فاصلهٔ همگام‌سازی سرویس‌ها (دقیقه)')}
            {numField('log_poll_seconds', 'فاصلهٔ دریافت لاگ در پس‌زمینه (ثانیه)')}
            {numField('retention_hours', 'نگهداری لاگ خام (ساعت)', 'قدیمی‌ترها حذف می‌شوند؛ کارنامهٔ روزانه می‌ماند')}
            {numField('summary_hour', 'ساعت تولید کارنامهٔ شبانه (محلی)')}
            {numField('error_attention_threshold', 'آستانهٔ خطا برای «نیازمند رسیدگی»')}
            {numField('stale_repo_days', 'آستانهٔ رکود مخزن (روز)')}
            {numField('tz_offset_minutes', 'اختلاف منطقهٔ زمانی (دقیقه)', 'مثلاً ۲۴۰ برای امارات')}
          </div>
          <label className="text-sm flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              checked={!!settings.summary_enabled}
              onChange={(e) => setSettings((s) => ({ ...s, summary_enabled: e.target.checked }))}
            />
            تولید خودکار کارنامهٔ شبانه
          </label>
          <div className="mt-4">
            <button
              onClick={saveSettings}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              ذخیرهٔ تنظیمات
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── صفحهٔ اصلی ───────────────────────────────────────────────────────────────
function DevCenter() {
  const [tab, setTab] = useState(initialTab());

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="dev-center-page">
      <div className="max-w-5xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">مرکز توسعه</h1>
        <p className="text-gray-500 text-sm mb-4">
          وضعیت زندهٔ پروژه‌های نرم‌افزاری من — مخزن‌های گیت‌هاب، سرویس‌های رندر، لاگ زنده و
          کارنامهٔ روزانه
        </p>
        <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto" data-testid="dev-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`dev-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 whitespace-nowrap transition-colors ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <DevProjectsOverview embedded />}
        {tab === 'live' && <LiveLogsTab />}
        {tab === 'stats' && <StatsTab />}
        {tab === 'summaries' && <SummariesTab />}
        {tab === 'settings' && <SettingsTab />}

        {tab === 'overview' && (
          <ActivityLogPanel entityType="dev_project,dev_service,dev_integration" title="لاگ مرکز توسعه" />
        )}
      </div>
    </div>
  );
}

export default DevCenter;
