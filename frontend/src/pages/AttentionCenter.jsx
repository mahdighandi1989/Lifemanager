import React, { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

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

const WEEKDAYS_FA = [
  { value: 0, label: 'دوشنبه' },
  { value: 1, label: 'سه‌شنبه' },
  { value: 2, label: 'چهارشنبه' },
  { value: 3, label: 'پنجشنبه' },
  { value: 4, label: 'جمعه' },
  { value: 5, label: 'شنبه' },
  { value: 6, label: 'یکشنبه' },
];

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

function NumberField({ label, value, onChange, min, max, suffix }) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm text-gray-700">
      <span>{label}</span>
      <span className="flex items-center gap-1">
        <input
          type="number"
          value={value ?? ''}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
          dir="ltr"
        />
        {suffix && <span className="text-xs text-gray-400">{suffix}</span>}
      </span>
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-2 text-sm text-gray-700 cursor-pointer">
      <span>{label}</span>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
    </label>
  );
}

function AttentionCenter() {
  const [scan, setScan] = useState(null);
  const [ruleTitles, setRuleTitles] = useState({});
  const [settings, setSettings] = useState(null);
  const [weeklySettings, setWeeklySettings] = useState(null);
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
      const [scanRes, setRes, wkRes, revRes] = await Promise.all([
        api.get('/attention/scan'),
        api.get('/attention/settings'),
        api.get('/weekly-review/settings'),
        api.get('/weekly-review'),
      ]);
      setScan(scanRes.data);
      setRuleTitles(scanRes.data.rule_titles || {});
      setSettings(setRes.data.settings);
      setWeeklySettings(wkRes.data.settings);
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
                      <span className="shrink-0 text-xs text-gray-500">{f.detail}</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attention engine settings */}
          <Card
            title="⚙️ تنظیمات موتور توجه"
            action={
              <button
                type="button"
                disabled={busy === 'saveAttention'}
                onClick={() => act('saveAttention', () => api.put('/attention/settings', settings), 'ذخیره شد')}
                className="rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50"
              >
                ذخیره
              </button>
            }
          >
            {settings ? (
              <div className="space-y-3">
                <Toggle label="موتور توجه فعال باشد" checked={settings.enabled} onChange={(v) => setSettings({ ...settings, enabled: v })} />
                <Toggle label="پیام صبحگاهی فعال باشد" checked={settings.brief_enabled} onChange={(v) => setSettings({ ...settings, brief_enabled: v })} />
                <NumberField label="ساعت پیام صبحگاهی (محلی)" value={settings.brief_hour} min={0} max={23} onChange={(v) => setSettings({ ...settings, brief_hour: v })} />
                <NumberField label="اختلاف با UTC" value={settings.tz_offset_minutes} min={-720} max={840} suffix="دقیقه" onChange={(v) => setSettings({ ...settings, tz_offset_minutes: v })} />
                <NumberField label="افق هشدار انقضای مدارک" value={settings.expiry_days} min={1} max={365} suffix="روز" onChange={(v) => setSettings({ ...settings, expiry_days: v })} />
                <NumberField label="افق موعد پرداخت اشتراک" value={settings.subscription_days} min={1} max={90} suffix="روز" onChange={(v) => setSettings({ ...settings, subscription_days: v })} />
                <NumberField label="آستانهٔ ماندگی صندوق ورودی" value={settings.inbox_stale_hours} min={1} max={720} suffix="ساعت" onChange={(v) => setSettings({ ...settings, inbox_stale_hours: v })} />
              </div>
            ) : (
              <p className="text-sm text-gray-400">در حال بارگذاری…</p>
            )}
          </Card>

          {/* Weekly review settings */}
          <Card
            title="📒 تنظیمات مرور هفتگی"
            action={
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy === 'runReview'}
                  onClick={() => act('runReview', () => api.post('/weekly-review/run'), 'مرور هفتگی ساخته شد')}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {busy === 'runReview' ? 'در حال تولید…' : 'تولید مرور الان'}
                </button>
                <button
                  type="button"
                  disabled={busy === 'saveWeekly'}
                  onClick={() => act('saveWeekly', () => api.put('/weekly-review/settings', weeklySettings), 'ذخیره شد')}
                  className="rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50"
                >
                  ذخیره
                </button>
              </div>
            }
          >
            {weeklySettings ? (
              <div className="space-y-3">
                <Toggle label="مرور هفتگی خودکار" checked={weeklySettings.enabled} onChange={(v) => setWeeklySettings({ ...weeklySettings, enabled: v })} />
                <label className="flex items-center justify-between gap-2 text-sm text-gray-700">
                  <span>روز هفته</span>
                  <select
                    value={weeklySettings.weekday}
                    onChange={(e) => setWeeklySettings({ ...weeklySettings, weekday: Number(e.target.value) })}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                  >
                    {WEEKDAYS_FA.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </label>
                <NumberField label="ساعت (محلی)" value={weeklySettings.hour} min={0} max={23} onChange={(v) => setWeeklySettings({ ...weeklySettings, hour: v })} />
                <p className="text-xs text-gray-400">
                  گزارش شامل آمار هفته + تحلیل و سه پیشنهاد هوش مصنوعی است؛ بدون مدلِ فعال، خلاصهٔ آماری ذخیره می‌شود.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">در حال بارگذاری…</p>
            )}
          </Card>
        </div>

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
