import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import GoogleLifePanel from '../components/GoogleLifePanel';
import { unescapeHtml } from '../lib/text';

// Use /api so the fetches reach the JSON endpoints, not the SPA route.
const API_BASE = '/api';

const TYPE_FA = {
  task: 'تسک',
  todo: 'آیتم لیست',
  note: 'یادداشت',
  person: 'شخص',
  subscription: 'اشتراک',
  finance_account: 'حساب مالی',
  transaction: 'خرید/هزینه',
  document: 'سند',
  password_request: 'رمز لازم',
  password_components: 'اطلاعاتِ رمز',
  unknown: 'نامشخص',
};

const TYPE_COLOR = {
  task: 'bg-blue-100 text-blue-700',
  todo: 'bg-emerald-100 text-emerald-700',
  note: 'bg-amber-100 text-amber-700',
  person: 'bg-purple-100 text-purple-700',
  subscription: 'bg-rose-100 text-rose-700',
  finance_account: 'bg-teal-100 text-teal-700',
  document: 'bg-indigo-100 text-indigo-700',
  password_request: 'bg-orange-100 text-orange-700',
  password_components: 'bg-orange-100 text-orange-700',
  unknown: 'bg-gray-100 text-gray-600',
};

// (StatCard — the three big counter tiles — was folded into the compact
// summary strip at the bottom of the page on 2026-07-25. Every number and
// every link it carried is still there, in one row instead of three cards.)

// One task row inside the «عقب‌افتاده / امروز / پیش‌رو» buckets.
function TaskRow({ task, tone }) {
  const toneCls =
    tone === 'overdue'
      ? 'border-red-200 bg-red-50'
      : tone === 'today'
        ? 'border-blue-200 bg-blue-50'
        : 'border-gray-200 bg-white';
  return (
    <Link
      to="/tasks"
      className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm hover:shadow-sm transition-shadow ${toneCls}`}
    >
      <span className="truncate text-gray-800">{unescapeHtml(task.title)}</span>
      <span className="shrink-0 text-xs text-gray-500" dir="ltr">
        {task.due_date || (task.deadline ? task.deadline.slice(0, 10) : '')}
      </span>
    </Link>
  );
}

// «صندوق ورودی» pending row: suggestion chip + one-tap file / retarget / dismiss.
function InboxRow({ item, onFile, onDismiss, onPassword, onComponents, busy }) {
  const [target, setTarget] = useState('');
  const [pw, setPw] = useState('');
  const [comp, setComp] = useState({});
  const suggested = item.suggested_type || 'unknown';
  const reason = item.suggestion?.reason;
  const isPasswordReq = suggested === 'password_request';
  const isComponentsReq = suggested === 'password_components';
  const isLocked = isPasswordReq || isComponentsReq;
  const missing = item.suggestion?.missing || [];
  const srcKey = item.suggestion?.source_key;
  const fname = item.suggestion?.filename;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-2" data-testid="inbox-row" dir="rtl">
      <div className="flex items-start justify-between gap-2">
        {isLocked ? (
          // A locked-file row: keep the long Latin filename on its OWN LTR line
          // so it never scrambles the Persian phrase around it (bidi rule).
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800">
              🔒 فایلِ رمزدار{srcKey ? ' — از ' : ''}
              {srcKey && <span dir="ltr">{srcKey}</span>}
            </p>
            {fname && (
              <p className="mt-0.5 text-xs text-gray-500 break-all" dir="ltr">{fname}</p>
            )}
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            {fname && (
              <p className="text-xs text-gray-500 break-all" dir="ltr">{fname}</p>
            )}
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words overflow-wrap-anywhere">
              {unescapeHtml(item.content)}
            </p>
          </div>
        )}
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLOR[suggested] || TYPE_COLOR.unknown}`}>
          {TYPE_FA[suggested] || suggested}
        </span>
      </div>
      {isComponentsReq && (
        <p className="text-xs text-gray-500">برای ساختِ رمز، این‌ها را وارد کن:</p>
      )}
      {reason && !isLocked && (
        <p className="text-xs text-gray-500 break-words">{unescapeHtml(reason)}</p>
      )}
      {isPasswordReq ? (
        <div className="space-y-1.5">
          {item.suggestion?.password_hint && (
            <p className="rounded-md bg-amber-50 border border-amber-100 px-2 py-1 text-xs text-amber-800" dir="auto" data-testid="password-hint">
              💡 بانک نوشته: {item.suggestion.password_hint}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="رمزِ فایل"
            data-testid="inbox-password-input"
            className="flex-1 min-w-[8rem] rounded-md border border-gray-300 px-2 py-1 text-xs"
          />
          <button
            type="button"
            disabled={busy || !pw.trim()}
            onClick={() => { onPassword(item, pw.trim()); setPw(''); }}
            data-testid="inbox-password-submit"
            className="rounded-md bg-orange-600 px-3 py-1 text-xs font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            🔓 باز کن و ذخیرهٔ رمز
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDismiss(item)}
            className="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            ✖ رد
          </button>
          </div>
        </div>
      ) : isComponentsReq ? (
        <div className="space-y-2" dir="rtl">
          {missing.map((c) => (
            <input
              key={c.key}
              type={c.kind === 'digits' ? 'text' : 'text'}
              inputMode={c.kind === 'digits' ? 'numeric' : 'text'}
              value={comp[c.key] || ''}
              onChange={(e) => setComp((s) => ({ ...s, [c.key]: e.target.value }))}
              placeholder={c.label || c.key}
              data-testid={`inbox-component-${c.key}`}
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs"
            />
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy || !missing.every((c) => (comp[c.key] || '').trim())}
              onClick={() => { onComponents(item, comp); setComp({}); }}
              data-testid="inbox-components-submit"
              className="rounded-md bg-orange-600 px-3 py-1 text-xs font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
              🔐 ذخیره کن و رمز را بساز
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDismiss(item)}
              className="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              ✖ رد
            </button>
          </div>
        </div>
      ) : (
      <div className="flex flex-wrap items-center gap-2">
        {/* No one-tap confirm when the classifier produced nothing — a
            «تأیید (نامشخص)» button would silently file as a task; the user
            must pick a real destination instead. */}
        {TYPE_FA[suggested] && suggested !== 'unknown' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onFile(item, null)}
            className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            ✔ تأیید ({TYPE_FA[suggested]})
          </button>
        )}
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700"
        >
          <option value="">ارسال به…</option>
          <option value="task">تسک</option>
          <option value="todo">آیتم لیست</option>
          <option value="note">یادداشت</option>
          <option value="person">شخص</option>
          <option value="transaction">خرید / هزینه</option>
          <option value="finance_account">حساب مالی</option>
          <option value="document">سند</option>
        </select>
        <button
          type="button"
          disabled={busy || !target}
          onClick={() => onFile(item, target)}
          className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          انتقال
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDismiss(item)}
          className="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          ✖ رد
        </button>
      </div>
      )}
    </div>
  );
}

// "2026-07-20T09:30:00+00:00" → "09:30" (local clock) for the calendar
// card; all-day events render as «تمام‌روز».
function eventTimeHHMM(ev) {
  if (ev.all_day) return 'تمام‌روز';
  if (!ev.start_at) return '—';
  const d = new Date(ev.start_at);
  if (Number.isNaN(d.getTime())) return String(ev.start_at).slice(11, 16);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function SectionCard({ title, badge, badgeCls, children, footer }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {badge != null && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeCls || 'bg-gray-100 text-gray-600'}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-2">{children}</div>
      {footer}
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({ tasks: 0, projects: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking');

  // «امروز من» aggregate + quick-capture state.
  const [today, setToday] = useState(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [captureText, setCaptureText] = useState('');
  const [captureBusy, setCaptureBusy] = useState(false);
  const [captureFeedback, setCaptureFeedback] = useState(null);
  const [inboxBusyId, setInboxBusyId] = useState(null);
  // Google mirror panel — collapsed (and unmounted) by default so its
  // /google/* calls only fire when the user opens the section.
  const [showGooglePanel, setShowGooglePanel] = useState(false);
  // «بخش‌های آرام» — the domain cards with nothing in them today (see below).
  const [showQuietDomains, setShowQuietDomains] = useState(false);

  const [cmdBusyId, setCmdBusyId] = useState(null);

  const fetchToday = useCallback(async () => {
    try {
      const res = await api.get('/command-center/today');
      setToday(res.data);
      setTodayError(false);
    } catch {
      // Keep whatever data we already had; a failed refresh must NOT make
      // the page claim «هیچ موعدی نیست» — that reads as all-clear.
      setTodayError(true);
    } finally {
      setTodayLoading(false);
    }
  }, []);

  // «فرمان‌های امروز» — mark a directive done/missed straight from the command
  // desk, then refresh so strength/streak update in place. The full engine
  // (steps, schedule, growth report) lives at /directives; this is the daily
  // touch-point surfaced on the first screen.
  const markCommand = useCallback(async (id, done) => {
    setCmdBusyId(id);
    try {
      await api.post(`/directives/${id}/${done ? 'done' : 'miss'}`);
      await fetchToday();
    } catch {
      setActionError(true);
    } finally {
      setCmdBusyId(null);
    }
  }, [fetchToday]);

  // Opt-in auto-ingest toggle (Gmail → subscription review candidates).
  const [autoIngest, setAutoIngest] = useState(null);
  useEffect(() => {
    api.get('/inbox/auto-ingest')
      .then((r) => setAutoIngest(!!r.data?.enabled))
      .catch(() => setAutoIngest(null));
  }, []);
  const toggleAutoIngest = async () => {
    const next = !autoIngest;
    setAutoIngest(next);
    try {
      await api.put('/inbox/auto-ingest', { enabled: next });
    } catch {
      setAutoIngest(!next); // revert on failure
    }
  };

  // One-time catch-up over emails that synced before the detectors existed.
  const [backfilling, setBackfilling] = useState(false);
  const [backfillMsg, setBackfillMsg] = useState(null);
  // Re-read the dead «خوانده نشد» notes with the deterministic extractor.
  const [retrying, setRetrying] = useState(false);
  const runRetryUnreadable = async () => {
    setRetrying(true);
    setBackfillMsg(null);
    try {
      const r = await api.post('/inbox/retry-unreadable');
      const d = r.data || {};
      setBackfillMsg(
        `${d.retried || 0} فایلِ خوانده‌نشده دوباره بررسی شد؛ ${d.reread || 0} تا این‌بار خوانده شد.`,
      );
      await fetchToday();
    } catch {
      setBackfillMsg('خواندنِ دوباره ناموفق بود.');
    } finally {
      setRetrying(false);
    }
  };

  const runBackfill = async () => {
    setBackfilling(true);
    setBackfillMsg(null);
    try {
      const r = await api.post('/inbox/backfill');
      const d = r.data || {};
      const locked = d.locked_files ? `، ${d.locked_files} فایلِ رمزدار` : '';
      setBackfillMsg(
        `از ${d.scanned || 0} ایمیل و ${d.drive_scanned || 0} فایلِ درایو: ` +
          `${d.subscription_candidates || 0} اشتراک، ${d.person_candidates || 0} فرد، ` +
          `${d.attachment_candidates || 0} پیوست، ${d.drive_candidates || 0} فایلِ درایو پیشنهاد شد${locked}.`,
      );
      await fetchToday();
    } catch {
      setBackfillMsg('خطا در اسکن.');
    } finally {
      setBackfilling(false);
    }
  };

  // «خواندنِ همه» — clear the whole unread backlog (the owner's 106-pile) in one
  // tap, then refresh so the badge drops to zero.
  const [markingRead, setMarkingRead] = useState(false);
  const markAllRead = async () => {
    setMarkingRead(true);
    try {
      await api.post('/notifications/mark-all-read');
      await fetchToday();
    } catch {
      /* best-effort */
    } finally {
      setMarkingRead(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          fetch(`${API_BASE}/tasks`),
          fetch(`${API_BASE}/projects`),
        ]);
        if (tasksRes.ok && projectsRes.ok) {
          const tasks = await tasksRes.json();
          const projects = await projectsRes.json();
          const taskList = Array.isArray(tasks) ? tasks : [];
          const projectList = Array.isArray(projects) ? projects : [];
          // Backend's TaskStatus enum uses "done" as the finished
          // marker (see app/models/task.py). Older rows may still
          // carry the legacy "completed" string — treat both as
          // finished here so the dashboard counter doesn't silently
          // misreport progress.
          const completed = taskList.filter(
            t => t.status === 'done' || t.status === 'completed',
          ).length;
          setStats({ tasks: taskList.length, projects: projectList.length, completed });
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch {
        setApiStatus('offline');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    fetchToday();
  }, [fetchToday]);

  const handleCapture = async () => {
    const content = captureText.trim();
    if (!content || captureBusy) return;
    setCaptureBusy(true);
    setCaptureFeedback(null);
    try {
      const res = await api.post('/inbox', { content });
      const item = res.data?.item;
      setCaptureText('');
      setCaptureFeedback({
        ok: true,
        type: item?.suggested_type,
        reason: item?.suggestion?.reason,
      });
      fetchToday();
    } catch {
      setCaptureFeedback({ ok: false });
    } finally {
      setCaptureBusy(false);
    }
  };

  const handleFile = async (item, target) => {
    setInboxBusyId(item.id);
    setActionError(false);
    try {
      await api.post(`/inbox/${item.id}/file`, target ? { target_type: target } : {});
    } catch {
      // e.g. 409: filed from another tab/Telegram — surface it; the refresh
      // below reconciles the stale row either way.
      setActionError(true);
    } finally {
      fetchToday();
      setInboxBusyId(null);
    }
  };

  const handleDismiss = async (item) => {
    setInboxBusyId(item.id);
    setActionError(false);
    try {
      await api.post(`/inbox/${item.id}/dismiss`);
    } catch {
      setActionError(true);
    } finally {
      fetchToday();
      setInboxBusyId(null);
    }
  };

  const handlePassword = async (item, password) => {
    setInboxBusyId(item.id);
    setActionError(false);
    try {
      const sug = item.suggestion || {};
      await api.post('/inbox/password', {
        source_ref: sug.source_ref,
        source_key: sug.source_key,
        password,
      });
    } catch {
      setActionError(true);
    } finally {
      fetchToday();
      setInboxBusyId(null);
    }
  };

  // «رمزِ هوشمند»: send the identity components the email asked for; the backend
  // stores them (encrypted, reusable), derives the password, and opens the file.
  const handleComponents = async (item, values) => {
    setInboxBusyId(item.id);
    setActionError(false);
    try {
      const sug = item.suggestion || {};
      await api.post('/inbox/password-components', {
        source_ref: sug.source_ref,
        source_key: sug.source_key,
        values,
      });
    } catch {
      setActionError(true);
    } finally {
      fetchToday();
      setInboxBusyId(null);
    }
  };

  const faDate = new Date().toLocaleDateString('fa-IR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const tasksBuckets = today?.tasks;
  const inbox = today?.inbox;
  const notifications = today?.notifications;
  const todo = today?.todo;
  // Phase-2 domain buckets (audit #5): مالی، تقویم، افراد، رشد.
  const calendarBucket = today?.calendar;
  const finance = today?.finance;
  const people = today?.people;
  const growth = today?.growth;
  const growthPct = growth?.today_total
    ? Math.round((100 * (growth.today_done || 0)) / growth.today_total)
    : 0;
  // Calm zero-states are only truthful when we actually HAVE fresh data —
  // a failed fetch with no data must not render as «همه‌چیز آرام است».
  const showEmptyStates = !todayLoading && !(todayError && !today);
  const hasAttention =
    (tasksBuckets?.overdue_count || 0) +
      (tasksBuckets?.due_today_count || 0) +
      (tasksBuckets?.upcoming_count || 0) >
    0;

  // لاغرکردنِ میز فرمان (2026-07-25): a domain card with nothing in it is not
  // information — four «چیزی نیست» boxes push the things that DO need the owner
  // below the fold. Quiet domains collapse into one line and open on demand.
  // Nothing is removed: every card is one click away, and while data is still
  // loading (or a fetch failed) they all render as before.
  const quietDomains = [
    { key: 'calendar', label: 'تقویم', has: !!calendarBucket?.events?.length },
    {
      key: 'finance',
      label: 'مالی',
      has: !!(finance?.balances_by_currency?.length || finance?.subscriptions?.length),
    },
    { key: 'people', label: 'افراد', has: !!people?.reminders?.length },
    { key: 'growth', label: 'رشد', has: (growth?.today_total || 0) > 0 },
  ];
  const quiet = quietDomains.filter((d) => !d.has);
  // Only collapse once we KNOW a domain is quiet — never while loading/failed.
  const canCollapse = showEmptyStates && quiet.length > 0;
  const showDomain = (key) =>
    !canCollapse || showQuietDomains || quietDomains.find((d) => d.key === key)?.has;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">میز فرمان — امروز من</h1>
          <p className="text-gray-500 mt-1">{faDate}</p>
        </div>

        {/* API Status Banner */}
        {apiStatus === 'offline' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-yellow-700">اتصال به پایگاه داده برقرار نیست — برخی قابلیت‌ها محدود هستند.</p>
          </div>
        )}

        {/* Quick capture — the front door of the universal inbox */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5" data-testid="quick-capture">
          <h2 className="text-base font-semibold text-gray-900 mb-1">📥 ثبت سریع — هر چیزی، بدون فکر کردن به جایش</h2>
          <p className="text-xs text-gray-500 mb-3">
            فکر، کار، اسم آدم، پرداخت، ایده… بنویس و ثبت کن؛ سیستم خودش تشخیص می‌دهد کجا تعلق دارد و برای تأیید همین‌جا نشانش می‌دهد.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <textarea
              value={captureText}
              onChange={(e) => setCaptureText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleCapture();
              }}
              rows={2}
              placeholder="مثلاً: فردا قبض برق را پرداخت کنم / شماره آقای رضایی ۰۹۱۲... / ایده: …"
              className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCapture}
              disabled={captureBusy || !captureText.trim()}
              className="shrink-0 self-end rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {captureBusy ? 'در حال ثبت…' : 'ثبت در صندوق ورودی'}
            </button>
          </div>
          {captureFeedback && (
            <p className={`mt-2 text-xs ${captureFeedback.ok ? 'text-green-700' : 'text-red-600'}`}>
              {captureFeedback.ok
                ? `ثبت شد ✔ — پیشنهاد: ${TYPE_FA[captureFeedback.type] || 'نامشخص'}${captureFeedback.reason ? ` (${unescapeHtml(captureFeedback.reason)})` : ''}`
                : 'ثبت نشد — دوباره تلاش کن.'}
            </p>
          )}
        </div>

        {/* فرمان‌های امروز — the internalization engine, surfaced on the first
            screen (audit «کمتر ولی زنده», move 3). The commands bucket is
            already computed in build_today; here we render it with انجام
            دادم/جا ماندم, and when nothing is active yet we nudge toward the
            waiting proposals so the first open is never a dead empty card. */}
        {today?.commands && (() => {
          const cb = today.commands;
          const items = cb.items || [];
          const proposed = cb.proposed || 0;
          return (
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5" data-testid="dashboard-commands">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">🎯 فرمان‌های امروز</h2>
                <Link to="/directives" className="text-xs text-blue-600 hover:underline shrink-0">مسیرِ نهادینه‌سازی ›</Link>
              </div>
              {items.length > 0 ? (
                <div className="space-y-2" data-testid="dashboard-commands-list">
                  {items.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3">
                      <div className="min-w-0">
                        <div className="text-sm text-gray-800 truncate">{c.title}</div>
                        {c.current_step && (
                          <div className="text-xs text-indigo-600 mt-0.5 truncate">👉 {c.current_step}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {c.streak > 0 && <span className="text-xs text-orange-600">🔥 {c.streak}</span>}
                        {c.done === true ? (
                          <span className="text-emerald-600 text-sm font-medium">✓ انجام شد</span>
                        ) : c.done === false ? (
                          <span className="text-red-500 text-sm">جا ماندی</span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => markCommand(c.id, true)}
                              disabled={cmdBusyId === c.id}
                              className="rounded-lg bg-emerald-600 text-white text-xs px-3 py-1.5 hover:bg-emerald-700 disabled:opacity-50"
                            >
                              انجام دادم
                            </button>
                            <button
                              type="button"
                              onClick={() => markCommand(c.id, false)}
                              disabled={cmdBusyId === c.id}
                              className="rounded-lg bg-gray-100 text-gray-600 text-xs px-3 py-1.5 hover:bg-gray-200 disabled:opacity-50"
                            >
                              جا ماندم
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : proposed > 0 ? (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-indigo-50 border border-indigo-100 p-3" data-testid="dashboard-commands-proposed">
                  <p className="text-sm text-indigo-800">
                    {proposed} فرمانِ پیشنهادی از نوشته‌ها و لیست‌هایت آماده است — بررسی و تأیید کن تا وارد روال روزانه شوند.
                  </p>
                  <Link to="/directives" className="shrink-0 rounded-lg bg-indigo-600 text-white text-xs px-3 py-1.5 hover:bg-indigo-700">
                    بررسی و تأیید ›
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  هنوز فرمانی نداری — از نوشته‌ها و لیست‌هایت فرمانِ روزانه بساز.{' '}
                  <Link to="/directives" className="text-blue-600 hover:underline">شروع کن ›</Link>
                </p>
              )}
            </div>
          );
        })()}

        {/* Today fetch failed → say so; silence would read as all-clear. */}
        {todayError && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              دریافت اطلاعات «امروز من» ناموفق بود — ممکن است موارد نیازمند توجه نمایش داده نشوند.
            </p>
            <button
              type="button"
              onClick={() => { setTodayLoading(true); fetchToday(); }}
              className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              تلاش دوباره
            </button>
          </div>
        )}
        {actionError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-700">
              عملیات روی آن مورد انجام نشد (شاید قبلاً از جای دیگری تعیین‌تکلیف شده) — فهرست به‌روز شد.
            </p>
          </div>
        )}

        {/* Today grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Attention: overdue / today / upcoming tasks */}
          <SectionCard
            title="⏰ نیازمند توجه"
            badge={todayLoading ? '…' : (tasksBuckets ? tasksBuckets.overdue_count + tasksBuckets.due_today_count : 0)}
            badgeCls="bg-red-100 text-red-700"
            footer={
              <Link to="/tasks" className="mt-3 block text-xs font-medium text-blue-600 hover:text-blue-700">
                همهٔ تسک‌ها ←
              </Link>
            }
          >
            {todayLoading && <p className="text-sm text-gray-400">در حال بارگذاری…</p>}
            {showEmptyStates && !hasAttention && (
              <p className="text-sm text-gray-400">هیچ موعد نزدیکی نیست — آسوده باش 🌿</p>
            )}
            {tasksBuckets?.overdue?.map((t) => <TaskRow key={`o${t.id}`} task={t} tone="overdue" />)}
            {tasksBuckets?.due_today?.map((t) => <TaskRow key={`t${t.id}`} task={t} tone="today" />)}
            {tasksBuckets?.upcoming?.map((t) => <TaskRow key={`u${t.id}`} task={t} tone="upcoming" />)}
          </SectionCard>

          {/* Inbox pending review */}
          <SectionCard
            title="📥 صندوق ورودی — منتظر تصمیم"
            badge={todayLoading ? '…' : inbox?.pending_count || 0}
            badgeCls="bg-blue-100 text-blue-700"
            footer={
              autoIngest !== null && (
                <div className="mt-3 space-y-2">
                  <label className="flex items-center justify-between gap-2 text-xs text-gray-500 cursor-pointer">
                    <span>اسکنِ خودکار (ایمیل، پیوست‌ها، درایو)</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoIngest}
                      onClick={toggleAutoIngest}
                      data-testid="auto-ingest-toggle"
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                        autoIngest ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoIngest ? '-translate-x-4' : '-translate-x-0.5'
                        }`}
                      />
                    </button>
                  </label>
                  <button
                    type="button"
                    onClick={runBackfill}
                    disabled={backfilling}
                    data-testid="inbox-backfill-btn"
                    className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                  >
                    {backfilling ? 'در حال اسکن…' : 'اسکنِ همه‌چیزِ موجود (ایمیل + پیوست + درایو)'}
                  </button>
                  <button
                    type="button"
                    onClick={runRetryUnreadable}
                    disabled={retrying}
                    data-testid="inbox-retry-unreadable-btn"
                    className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                  >
                    {retrying ? 'در حال خواندنِ دوباره…' : 'دوباره بخوان (فایل‌هایی که «خوانده نشد» شدند)'}
                  </button>
                  {backfillMsg && <p className="text-xs text-gray-500 break-words">{backfillMsg}</p>}
                </div>
              )
            }
          >
            {todayLoading && <p className="text-sm text-gray-400">در حال بارگذاری…</p>}
            {showEmptyStates && !(inbox?.latest?.length) && (
              <p className="text-sm text-gray-400">خالی است — هرچه از وب یا تلگرام (/inbox) بفرستی این‌جا می‌آید.</p>
            )}
            {inbox?.latest?.map((item) => (
              <InboxRow
                key={item.id}
                item={item}
                busy={inboxBusyId === item.id}
                onFile={handleFile}
                onPassword={handlePassword}
                onComponents={handleComponents}
                onDismiss={handleDismiss}
              />
            ))}
          </SectionCard>

          {/* Alerts + list items */}
          <div className="space-y-6">
            <SectionCard
              title="🔔 اعلان‌های خوانده‌نشده"
              badge={todayLoading ? '…' : notifications?.unread_count || 0}
              badgeCls="bg-amber-100 text-amber-700"
              footer={
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Link to="/notifications" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                    همهٔ اعلان‌ها ←
                  </Link>
                  {(notifications?.unread_count || 0) > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      disabled={markingRead}
                      data-testid="mark-all-read-btn"
                      className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                    >
                      {markingRead ? '…' : 'خواندنِ همه'}
                    </button>
                  )}
                </div>
              }
            >
              {showEmptyStates && !(notifications?.latest?.length) && (
                <p className="text-sm text-gray-400">اعلان خوانده‌نشده‌ای نیست.</p>
              )}
              {notifications?.latest?.map((n) => (
                <div key={n.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <p className="text-sm font-medium text-gray-800 truncate">{unescapeHtml(n.title)}</p>
                  {n.message && (
                    <p className="text-xs text-gray-500 truncate">{unescapeHtml(n.message)}</p>
                  )}
                </div>
              ))}
            </SectionCard>

            <SectionCard
              title="✅ آیتم‌های لیستی (موعددار / ستاره‌دار)"
              badge={todayLoading ? '…' : (todo ? todo.due.length + todo.starred.length : 0)}
              badgeCls="bg-emerald-100 text-emerald-700"
              footer={
                <Link to="/lists" className="mt-3 block text-xs font-medium text-blue-600 hover:text-blue-700">
                  همهٔ لیست‌ها ←
                </Link>
              }
            >
              {showEmptyStates && !(todo?.due?.length || todo?.starred?.length) && (
                <p className="text-sm text-gray-400">آیتم موعددار یا ستاره‌داری نیست.</p>
              )}
              {todo?.due?.map((i) => (
                <div key={`d${i.id}`} className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <span className="truncate text-sm text-gray-800">{unescapeHtml(i.content)}</span>
                  <span className="shrink-0 text-xs text-gray-500" dir="ltr">{i.due_date}</span>
                </div>
              ))}
              {todo?.starred?.map((i) => (
                <div key={`s${i.id}`} className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <span className="truncate text-sm text-gray-800">⭐ {unescapeHtml(i.content)}</span>
                </div>
              ))}
            </SectionCard>
          </div>
        </div>

        {/* Phase-2 domain cards (audit #5): تقویم / مالی / افراد / رشد —
            the domains that previously had no presence on «امروز من».
            2026-07-25: quiet ones collapse into the one line below. */}
        {canCollapse && (
          <div
            className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2.5"
            data-testid="dashboard-quiet-domains"
          >
            <p className="text-sm text-gray-500">
              آرام امروز: {quiet.map((d) => d.label).join(' · ')}
            </p>
            <button
              type="button"
              data-testid="dashboard-quiet-toggle"
              onClick={() => setShowQuietDomains((v) => !v)}
              className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {showQuietDomains ? 'جمع کن ▲' : 'نمایش ▼'}
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {showDomain('calendar') && (
          <SectionCard
            title="🗓 تقویم امروز"
            badge={todayLoading ? '…' : calendarBucket?.events?.length || 0}
            badgeCls="bg-indigo-100 text-indigo-700"
          >
            {todayLoading && <p className="text-sm text-gray-400">در حال بارگذاری…</p>}
            {showEmptyStates && !(calendarBucket?.events?.length) && (
              <p className="text-sm text-gray-400">رویدادی نیست</p>
            )}
            {calendarBucket?.events?.slice(0, 5).map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <span className="truncate text-sm text-gray-800" dir="auto">
                  {ev.summary}
                </span>
                <span className="shrink-0 text-xs text-gray-500" dir="ltr">
                  {eventTimeHHMM(ev)}
                </span>
              </div>
            ))}
          </SectionCard>
          )}

          {showDomain('finance') && (
          <SectionCard
            title="💰 مالی"
            badge={todayLoading ? '…' : finance?.balances_by_currency?.length || 0}
            badgeCls="bg-emerald-100 text-emerald-700"
            footer={
              <Link to="/finance" className="mt-3 block text-xs font-medium text-blue-600 hover:text-blue-700">
                بخش مالی ←
              </Link>
            }
          >
            {todayLoading && <p className="text-sm text-gray-400">در حال بارگذاری…</p>}
            {showEmptyStates && !(finance?.balances_by_currency?.length || finance?.subscriptions?.length) && (
              <p className="text-sm text-gray-400">حسابی ثبت نشده است.</p>
            )}
            {/* One row per currency — totals are NEVER summed across
                currencies (audit #20). */}
            {finance?.balances_by_currency?.map((b) => (
              <div
                key={b.currency}
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
                data-testid={`finance-currency-${b.currency}`}
              >
                <span className="text-sm font-medium text-gray-800">
                  {Number(b.total || 0).toLocaleString('fa-IR')}{' '}
                  <span className="text-xs text-gray-500" dir="ltr">{b.currency}</span>
                </span>
                <span className="shrink-0 text-xs text-gray-400">
                  {b.accounts} حساب
                </span>
              </div>
            ))}
            {finance?.subscriptions?.slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2"
              >
                <span className="truncate text-xs text-gray-700" dir="auto">
                  {s.provider}
                  {s.plan ? ` — ${s.plan}` : ''}
                </span>
                {s.next_payment_date && (
                  <span className="shrink-0 text-xs text-gray-500" dir="ltr">
                    {s.next_payment_date}
                  </span>
                )}
              </div>
            ))}
          </SectionCard>
          )}

          {showDomain('people') && (
          <SectionCard
            title="👥 افراد"
            badge={todayLoading ? '…' : people?.reminders_count || 0}
            badgeCls="bg-purple-100 text-purple-700"
            footer={
              <Link to="/people-profiles" className="mt-3 block text-xs font-medium text-blue-600 hover:text-blue-700">
                همهٔ افراد ←
              </Link>
            }
          >
            {todayLoading && <p className="text-sm text-gray-400">در حال بارگذاری…</p>}
            {showEmptyStates && !(people?.reminders?.length) && (
              <p className="text-sm text-gray-400">یادآوری‌ای برای افراد نیست.</p>
            )}
            {people?.reminders?.slice(0, 3).map((r, i) => (
              <div
                key={`${r.person_id}-${i}`}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <p className="text-sm text-gray-800 truncate">
                  <span className="font-medium">{unescapeHtml(r.person_name)}</span>
                  {r.note ? `: ${unescapeHtml(r.note)}` : ''}
                </p>
              </div>
            ))}
          </SectionCard>
          )}

          {showDomain('growth') && (
          <SectionCard
            title="🌱 رشد امروز"
            badge={todayLoading ? '…' : `${growth?.today_done || 0} از ${growth?.today_total || 0}`}
            badgeCls="bg-green-100 text-green-700"
          >
            {todayLoading && <p className="text-sm text-gray-400">در حال بارگذاری…</p>}
            {showEmptyStates && !growth?.today_total && (
              <p className="text-sm text-gray-400">امروز چک‌اینی ثبت نشده است.</p>
            )}
            {growth?.today_total > 0 && (
              <div data-testid="growth-progress">
                <p className="text-sm text-gray-700 mb-2">
                  {`${growth.today_done || 0} از ${growth.today_total} انجام شد`}
                </p>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-green-500 transition-all"
                    style={{ width: `${Math.min(100, growthPct)}%` }}
                  />
                </div>
              </div>
            )}
          </SectionCard>
          )}
        </div>

        {/* شمارنده‌ها + دسترسی سریع — 2026-07-25: سه کارتِ بزرگ و چهار کارتِ
            لینک، نصفِ ارتفاعِ صفحه را می‌گرفتند بدون آنکه چیزی به «امروزِ من»
            اضافه کنند (سایدبار همان لینک‌ها را دارد). هیچ عدد و هیچ لینکی حذف
            نشد — همه در یک نوارِ فشرده جمع شدند. */}
        <div
          className="mb-8 rounded-xl border border-gray-100 bg-white px-4 py-3"
          data-testid="dashboard-summary-strip"
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Link to="/tasks" className="text-gray-600 hover:text-blue-600">
              کل وظایف: <span className="font-semibold text-gray-900">{loading ? '…' : stats.tasks}</span>
            </Link>
            <Link to="/tasks" className="text-gray-600 hover:text-blue-600">
              تکمیل‌شده: <span className="font-semibold text-gray-900">{loading ? '…' : stats.completed}</span>
            </Link>
            <Link to="/projects" className="text-gray-600 hover:text-blue-600">
              پروژه‌های فعال: <span className="font-semibold text-gray-900">{loading ? '…' : stats.projects}</span>
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-2 text-xs">
            <Link to="/tasks" className="text-blue-600 hover:underline">وظایف</Link>
            <Link to="/projects" className="text-blue-600 hover:underline">پروژه‌ها</Link>
            <Link to="/sahat" className="text-blue-600 hover:underline">نقشهٔ خداشهر</Link>
            <Link
              to="/attention"
              data-testid="dashboard-attention-link"
              className="text-blue-600 hover:underline"
            >
              مراقبت و مرور
            </Link>
            <Link
              to="/merge"
              data-testid="dashboard-merge-link"
              className="text-blue-600 hover:underline"
            >
              ادغام موارد مشابه
            </Link>
          </div>
        </div>

        {/* «ایمیل و تقویم گوگل» — the same GoogleLifePanel that lives in
            DriveSettings, mirrored here behind a collapsed toggle. It stays
            unmounted until opened, so its /google/* calls only fire on
            demand, and the panel itself swallows every API failure
            (.catch(() => {})) — a broken Google mirror can never blank the
            dashboard. */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6" data-testid="dashboard-google-section">
          <button
            type="button"
            onClick={() => setShowGooglePanel((v) => !v)}
            className="flex w-full items-center justify-between gap-2"
            aria-expanded={showGooglePanel}
            data-testid="dashboard-google-toggle"
          >
            <h2 className="text-lg font-semibold text-gray-900">📧 ایمیل و تقویم گوگل</h2>
            <span className="text-sm font-medium text-blue-600">
              {showGooglePanel ? 'بستن ▲' : 'نمایش ▼'}
            </span>
          </button>
          {showGooglePanel && <GoogleLifePanel />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
