import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';
import DevProjectsOverview from '../components/DevProjectsOverview';
import DevSyncSettings from '../components/DevSyncSettings';
import ActivityLogPanel from '../components/ActivityLogPanel';

// «مرکز توسعه» — live Render logs + stats + کارنامهٔ روزانه + token settings.
// Modeled on the sibling PM app's Render panel (service chips, level filter,
// live dark viewer, 10s polling) but scoped to the life-management view.

const TABS = [
  { id: 'overview', label: 'نمای کلی' },
  { id: 'live', label: 'لاگ زنده' },
  { id: 'errors', label: 'خطاها' },
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

// ── خطاها (ماندگار — با وضعیت رفع‌شده) ───────────────────────────────────────
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

function ErrorCard({ issue, onSetStatus }) {
  const border =
    issue.status === 'open' ? 'border-red-200' : issue.status === 'resolved' ? 'border-emerald-200' : 'border-gray-200';
  return (
    <div className={`bg-white rounded-xl border ${border} p-3`}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {issue.status === 'resolved' && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                ✓ رفع شد {issue.resolved_by === 'auto' ? '(خودکار)' : '(دستی)'}
              </span>
            )}
            {issue.status === 'muted' && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">🔇 بی‌صدا</span>
            )}
            <span dir="ltr" className="text-[11px] text-sky-700">{issue.service_name || issue.service_id}</span>
            <span className="text-[11px] text-gray-400">{issue.occurrences} بار</span>
            {issue.reopened_count > 0 && (
              <span className="text-[11px] text-amber-600">{issue.reopened_count} بار برگشته</span>
            )}
          </div>
          <p dir="ltr" className="text-xs font-mono text-gray-800 break-all text-left" title={issue.sample_message || ''}>
            {issue.title}
          </p>
          <div className="text-[11px] text-gray-400 mt-1">
            اولین بار: {relTimeFa(issue.first_seen_at)} — آخرین بار: {relTimeFa(issue.last_seen_at)}
            {issue.resolved_at && <> — رفع: {relTimeFa(issue.resolved_at)}</>}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {issue.status !== 'resolved' && (
            <button
              onClick={() => onSetStatus(issue, 'resolved')}
              className="px-2 py-1 text-[11px] rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              رفع شد
            </button>
          )}
          {issue.status === 'open' && (
            <button
              onClick={() => onSetStatus(issue, 'muted')}
              className="px-2 py-1 text-[11px] rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              بی‌صدا
            </button>
          )}
          {issue.status !== 'open' && (
            <button
              onClick={() => onSetStatus(issue, 'open')}
              className="px-2 py-1 text-[11px] rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50"
            >
              بازگشایی
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorsTab() {
  const [errors, setErrors] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [showResolved, setShowResolved] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get('/dev/errors', { params: { limit: 500 } })
      .then((res) => {
        setErrors(res.data?.errors || []);
        setCounts(res.data?.counts || {});
      })
      .catch(() => setNotice('خطا در دریافت فهرست خطاها'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (issue, status) => {
    try {
      await api.patch(`/dev/errors/${issue.id}`, { status });
      load();
    } catch (e) {
      setNotice('تغییر وضعیت ناموفق: ' + (e.response?.data?.detail || e.message || ''));
    }
  };

  const open = errors.filter((e) => e.status === 'open');
  const resolved = errors.filter((e) => e.status === 'resolved');
  const muted = errors.filter((e) => e.status === 'muted');

  return (
    <div data-testid="dev-errors-tab">
      <p className="text-sm text-gray-500 mb-3">
        هر خطای متمایز از لاگ‌ها این‌جا برای همیشه ثبت می‌شود؛ اگر دیگر تکرار نشود (در حالی که
        سرویس فعال است) خودش «رفع‌شده» علامت می‌خورد تا سراغ خطای حل‌شده نروی؛ اگر برگردد،
        دوباره باز می‌شود.
      </p>
      {notice && (
        <div className="mb-3 bg-red-50 border border-red-100 rounded-lg p-2.5 text-sm text-red-600 flex justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-red-400">✕</button>
        </div>
      )}
      <div className="flex gap-3 mb-4">
        <span className="text-sm text-red-600 font-medium">{counts.open || 0} باز</span>
        <span className="text-sm text-emerald-600">{counts.resolved || 0} رفع‌شده</span>
        <span className="text-sm text-gray-400">{counts.muted || 0} بی‌صدا</span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400">در حال بارگذاری…</div>
      ) : (
        <>
          <h3 className="font-semibold text-gray-800 text-sm mb-2">خطاهای باز</h3>
          <div className="space-y-2 mb-6" data-testid="dev-errors-open">
            {open.length === 0 ? (
              <div className="p-6 text-center text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">
                ✓ هیچ خطای باز و حل‌نشده‌ای نیست
              </div>
            ) : (
              open.map((issue) => <ErrorCard key={issue.id} issue={issue} onSetStatus={setStatus} />)
            )}
          </div>

          <button
            onClick={() => setShowResolved((v) => !v)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            {showResolved ? '▾' : '◂'} رفع‌شده‌ها و بی‌صداها ({resolved.length + muted.length})
          </button>
          {showResolved && (
            <div className="space-y-2" data-testid="dev-errors-resolved">
              {[...resolved, ...muted].map((issue) => (
                <ErrorCard key={issue.id} issue={issue} onSetStatus={setStatus} />
              ))}
            </div>
          )}
        </>
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
        {tab === 'errors' && <ErrorsTab />}
        {tab === 'stats' && <StatsTab />}
        {tab === 'summaries' && <SummariesTab />}
        {tab === 'settings' && <DevSyncSettings />}

        {tab === 'overview' && (
          <ActivityLogPanel entityType="dev_project,dev_service,dev_integration" title="لاگ مرکز توسعه" />
        )}
      </div>
    </div>
  );
}

export default DevCenter;
