import React, { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import AttentionSettingsPanel from '../components/AttentionSettingsPanel';

/**
 * «مراقبت و مرور» — the control room of phases 3-4:
 *  • موتور توجه: live dry-scan of every reminder rule, run-now, and the
 *    engine settings (brief hour, thresholds, timezone offset).
 *  • مرور هفتگی: schedule settings, generate-now, and the stored reports.
 * The engine itself runs server-side on a background loop; this page only
 * inspects and configures it.
 */

const RULE_COLORS = {
  task_overdue: 'bg-red-100 text-red-700',
  task_due_today: 'bg-blue-100 text-blue-700',
  todo_overdue: 'bg-orange-100 text-orange-700',
  license_expiry: 'bg-purple-100 text-purple-700',
  document_expiry: 'bg-purple-100 text-purple-700',
  subscription_renewal: 'bg-amber-100 text-amber-700',
  inbox_stale: 'bg-emerald-100 text-emerald-700',
};

// Rules where «ساخت تسک» makes no sense: an inbox nudge isn't actionable as a
// task, and overdue/due-today findings ARE tasks already — a copy would only
// duplicate them.
const NO_TASK_RULES = new Set(['inbox_stale', 'task_overdue', 'task_due_today']);

function unescapeHtml(value) {
  if (!value) return value;
  return String(value)
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&amp;', '&');
}

function Card({ title, children, action }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

// Save payloads + the settings fields now live in AttentionSettingsPanel — the
// single implementation mounted here AND in «تنظیمات ← مراقبت و مرور».

function AttentionCenter() {
  const [scan, setScan] = useState(null);
  const [ruleTitles, setRuleTitles] = useState({});
  const [reviews, setReviews] = useState([]);
  const [openReview, setOpenReview] = useState(null);
  const [busy, setBusy] = useState('');
  const [flash, setFlash] = useState(null);

  const say = (ok, text) => {
    setFlash({ ok, text });
    setTimeout(() => setFlash(null), 5000);
  };

  const refresh = useCallback(async () => {
    try {
      const [scanRes, revRes] = await Promise.all([
        api.get('/attention/scan'),
        api.get('/weekly-review'),
      ]);
      setScan(scanRes.data);
      setRuleTitles(scanRes.data.rule_titles || {});
      setReviews(revRes.data.reviews || []);
    } catch {
      say(false, 'خطا در بارگذاری اطلاعات');
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const act = async (key, fn, okText) => {
    setBusy(key);
    try {
      await fn();
      if (okText) say(true, okText);
      await refresh();
    } catch {
      say(false, 'عملیات ناموفق بود');
    } finally {
      setBusy('');
    }
  };

  // «دیدن → اقدام» (audit #10): turn a finding into a real task. Labels come
  // HTML-escaped from the scan payload, so unescape before they become a title.
  const createTaskFrom = async (f, key) => {
    setBusy(key);
    try {
      const res = await api.post('/attention/create-task', {
        rule: f.rule,
        label: unescapeHtml(f.label),
        detail: unescapeHtml(f.detail),
        date: f.date || null,
      });
      say(true, `تسک ساخته شد: ${res.data?.title || ''}`);
    } catch {
      say(false, 'ساخت تسک ناموفق بود');
    } finally {
      setBusy('');
    }
  };

  const groupedFindings = {};
  (scan?.findings || []).forEach((f) => {
    (groupedFindings[f.rule] = groupedFindings[f.rule] || []).push(f);
  });

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🛡 مراقبت و مرور</h1>
          <p className="text-gray-500 mt-1">
            موتور توجه هر نیم‌ساعت همهٔ بخش‌ها را می‌گردد، هشدار و پیام صبحگاهی می‌فرستد؛ مرور هفتگی هم گزارش هفته را می‌سازد.
          </p>
        </div>

        {flash && (
          <div className={`rounded-lg px-4 py-2 text-sm ${flash.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {flash.text}
          </div>
        )}

        {/* Current findings (dry scan) */}
        <Card
          title="🔍 وضعیت فعلی (اسکن زنده)"
          action={
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy === 'run'}
                onClick={() => act('run', () => api.post('/attention/run'), 'هشدارهای تازه ارسال شد')}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busy === 'run' ? 'در حال ارسال…' : 'ارسال هشدارها'}
              </button>
              <button
                type="button"
                disabled={busy === 'brief'}
                onClick={() => act('brief', () => api.post('/attention/morning-brief'), 'پیام صبحگاهی ارسال شد')}
                className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {busy === 'brief' ? '…' : '☀️ پیام صبحگاهی الان'}
              </button>
            </div>
          }
        >
          {!scan && <p className="text-sm text-gray-400">در حال بارگذاری…</p>}
          {scan && scan.count === 0 && (
            <p className="text-sm text-gray-400">🌿 هیچ موردی نیازمند توجه نیست.</p>
          )}
          <div className="space-y-3">
            {Object.entries(groupedFindings).map(([rule, items]) => (
              <div key={rule}>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${RULE_COLORS[rule] || 'bg-gray-100 text-gray-600'}`}>
                  {ruleTitles[rule] || rule} ({items.length})
                </span>
                <ul className="mt-1 space-y-1">
                  {items.map((f, i) => (
                    <li key={`${rule}${i}`} className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
                      <span className="truncate text-gray-800">{unescapeHtml(f.label)}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-xs text-gray-500">{f.detail}</span>
                        {!NO_TASK_RULES.has(rule) && (
                          <button
                            type="button"
                            data-testid={`attention-create-task-${rule}-${i}`}
                            disabled={busy === `mk-${rule}-${i}`}
                            onClick={() => createTaskFrom(f, `mk-${rule}-${i}`)}
                            className="rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {busy === `mk-${rule}-${i}` ? '…' : '➕ ساخت تسک'}
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            «ارسال هشدارها» فقط موارد تازه را می‌فرستد؛ هر مورد تا پایان دورهٔ خودش (روزانه/هفتگی) دوباره تکرار نمی‌شود.
          </p>
        </Card>

        {/* تنظیمات — همان کامپوننتی که در «تنظیمات ← مراقبت و مرور» هم رندر
            می‌شود (۱۴۰۵/۰۵/۰۳: یک پیاده‌سازی، دو جا). */}
        <AttentionSettingsPanel onSaved={refresh} />

        {/* Stored reviews */}
        <Card title="🗂 مرورهای هفتگی قبلی">
          {reviews.length === 0 && (
            <p className="text-sm text-gray-400">هنوز مروری ساخته نشده — «تولید مرور الان» را بزن.</p>
          )}
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenReview(openReview === r.id ? null : r.id)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-800" dir="ltr">
                    {r.week_start} → {r.week_end}
                  </span>
                  <span className="text-xs text-gray-500">
                    {r.ai_model ? `مدل: ${r.ai_model}` : 'خلاصهٔ آماری'} {openReview === r.id ? '▲' : '▼'}
                  </span>
                </button>
                {openReview === r.id && (
                  <div className="border-t border-gray-100 px-3 py-2">
                    <pre className="whitespace-pre-wrap break-words font-sans text-sm text-gray-700">
                      {unescapeHtml(r.narrative)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AttentionCenter;
