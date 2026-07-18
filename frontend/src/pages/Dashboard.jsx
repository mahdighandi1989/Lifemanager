import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

// Use /api so the fetches reach the JSON endpoints, not the SPA route.
const API_BASE = '/api';

// Server stores text HTML-escaped (stored-XSS defence); React re-escapes on
// render, so display needs the entities folded back to characters.
function unescapeHtml(value) {
  if (!value) return value;
  return String(value)
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&amp;', '&');
}

const TYPE_FA = {
  task: 'تسک',
  todo: 'آیتم لیست',
  note: 'یادداشت',
  person: 'شخص',
  unknown: 'نامشخص',
};

const TYPE_COLOR = {
  task: 'bg-blue-100 text-blue-700',
  todo: 'bg-emerald-100 text-emerald-700',
  note: 'bg-amber-100 text-amber-700',
  person: 'bg-purple-100 text-purple-700',
  unknown: 'bg-gray-100 text-gray-600',
};

function StatCard({ title, value, icon, color, linkTo }) {
  return (
    <Link to={linkTo} className="block">
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </div>
    </Link>
  );
}

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
function InboxRow({ item, onFile, onDismiss, busy }) {
  const [target, setTarget] = useState('');
  const suggested = item.suggested_type || 'unknown';
  const reason = item.suggestion?.reason;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-2" data-testid="inbox-row">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
          {unescapeHtml(item.content)}
        </p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLOR[suggested] || TYPE_COLOR.unknown}`}>
          {TYPE_FA[suggested] || suggested}
        </span>
      </div>
      {reason && <p className="text-xs text-gray-500">{unescapeHtml(reason)}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onFile(item, null)}
          className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          ✔ تأیید ({TYPE_FA[suggested] || suggested})
        </button>
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
    </div>
  );
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
  const [captureText, setCaptureText] = useState('');
  const [captureBusy, setCaptureBusy] = useState(false);
  const [captureFeedback, setCaptureFeedback] = useState(null);
  const [inboxBusyId, setInboxBusyId] = useState(null);

  const fetchToday = useCallback(async () => {
    try {
      const res = await api.get('/command-center/today');
      setToday(res.data);
    } catch {
      setToday(null);
    } finally {
      setTodayLoading(false);
    }
  }, []);

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
    try {
      await api.post(`/inbox/${item.id}/file`, target ? { target_type: target } : {});
      fetchToday();
    } catch {
      // keep the row; the next refresh shows its real state
    } finally {
      setInboxBusyId(null);
    }
  };

  const handleDismiss = async (item) => {
    setInboxBusyId(item.id);
    try {
      await api.post(`/inbox/${item.id}/dismiss`);
      fetchToday();
    } catch {
      // keep the row
    } finally {
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
  const hasAttention =
    (tasksBuckets?.overdue_count || 0) +
      (tasksBuckets?.due_today_count || 0) +
      (tasksBuckets?.upcoming_count || 0) >
    0;

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
            {!todayLoading && !hasAttention && (
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
          >
            {todayLoading && <p className="text-sm text-gray-400">در حال بارگذاری…</p>}
            {!todayLoading && !(inbox?.latest?.length) && (
              <p className="text-sm text-gray-400">خالی است — هرچه از وب یا تلگرام (/inbox) بفرستی این‌جا می‌آید.</p>
            )}
            {inbox?.latest?.map((item) => (
              <InboxRow
                key={item.id}
                item={item}
                busy={inboxBusyId === item.id}
                onFile={handleFile}
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
                <Link to="/notifications" className="mt-3 block text-xs font-medium text-blue-600 hover:text-blue-700">
                  همهٔ اعلان‌ها ←
                </Link>
              }
            >
              {!todayLoading && !(notifications?.latest?.length) && (
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
              {!todayLoading && !(todo?.due?.length || todo?.starred?.length) && (
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="کل وظایف"
            value={loading ? '...' : stats.tasks}
            linkTo="/tasks"
            color="bg-blue-100"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            title="پروژه‌های فعال"
            value={loading ? '...' : stats.projects}
            linkTo="/projects"
            color="bg-purple-100"
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            }
          />
          <StatCard
            title="وظایف تکمیل‌شده"
            value={loading ? '...' : stats.completed}
            linkTo="/tasks"
            color="bg-green-100"
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">دسترسی سریع</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/tasks"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">مدیریت وظایف</p>
                <p className="text-sm text-gray-500">ایجاد و پیگیری وظایف روزانه</p>
              </div>
            </Link>
            <Link
              to="/projects"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">مدیریت پروژه‌ها</p>
                <p className="text-sm text-gray-500">سازماندهی و پیشرفت پروژه‌ها</p>
              </div>
            </Link>
            {/* Dedup / consolidation entry (audit task fbd9bd36 AC4 — reachable
                from the Dashboard, not only the sidebar). */}
            <Link
              to="/merge"
              data-testid="dashboard-merge-link"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">ادغام موارد مشابه</p>
                <p className="text-sm text-gray-500">شناسایی و تلفیق تسک/پروژه/لیست‌های مشابه</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
