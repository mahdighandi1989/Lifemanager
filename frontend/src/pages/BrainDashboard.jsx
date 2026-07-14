import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

// رشد ذهن و هوش — the consolidated cognitive-growth dashboard.
// • Upload the weekly Brilliant export zip (here or via the Telegram bot)
// • Multi-source sections (Brilliant / tasks / self-improvement / finance),
//   each with an explicit «مرجع داده» provenance block
// • Reminder settings (weekly Telegram reminder: day/hour/silent/refollow)

const WEEKDAYS = ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه', 'یکشنبه'];

function Provenance({ p }) {
  const [open, setOpen] = useState(false);
  if (!p) return null;
  return (
    <div className="mt-3 border-t border-gray-100 pt-2">
      <button onClick={() => setOpen(!open)} className="text-xs text-blue-600 hover:underline">
        📌 مرجع داده {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="mt-2 text-xs text-gray-500 leading-6 space-y-1">
          {p.tables && <p>جدول‌ها: <span dir="ltr">{p.tables.join(', ')}</span></p>}
          {p.rule && <p>قاعدهٔ محاسبه: {p.rule}</p>}
          {p.authored_by_you && <p className="text-green-700">🔎 تشخیص «دادهٔ خودم»: {p.authored_by_you}</p>}
          {p.rows && p.rows.length > 0 && (
            <p>ردیف‌ها: {p.rows.slice(0, 8).join('، ')}{p.rows.length > 8 ? ' …' : ''}</p>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, suffix }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-xl font-bold text-gray-900">{value ?? '—'}{value != null && suffix ? suffix : ''}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function BrainDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [reminder, setReminder] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/brain/dashboard')
      .then((res) => { setData(res.data); setReminder(res.data?.reminder || null); })
      .catch((e) => setMsg({ kind: 'error', text: 'خطا در دریافت داشبورد: ' + (e.message || '') }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    setMsg(null);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await api.post('/brain/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const ok = res?.data?.ok;
      const ver = res?.data?.verified_owner;
      setMsg({
        kind: ok ? 'success' : 'error',
        text: ok
          ? `فایل تحلیل شد ✅${ver === false ? ' — ⚠️ ایمیل داخل فایل با ایمیل شما فرق دارد (با پرچم ثبت شد)' : ''}`
          : (res?.data?.detail || 'ناموفق'),
      });
      load();
    } catch (e) {
      setMsg({ kind: 'error', text: 'خطا در آپلود: ' + (e.response?.data?.detail || e.message || '') });
    } finally {
      setUploading(false);
    }
  };

  const saveReminder = async (partial) => {
    const next = { ...reminder, ...partial };
    setReminder(next);
    try {
      const res = await api.put('/brain/reminder', partial);
      setReminder(res.data.reminder);
      setMsg({ kind: 'success', text: 'تنظیمات یادآور ذخیره شد ✅' });
    } catch (e) {
      setMsg({ kind: 'error', text: 'ذخیرهٔ یادآور ناموفق بود: ' + (e.response?.data?.detail || e.message || '') });
      load();
    }
  };

  const sections = data?.sections || [];
  const brilliant = sections.find((s) => s.key === 'brilliant');

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 py-8" data-testid="brain-dashboard-page">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">رشد ذهن و هوش</h1>
        <p className="text-sm text-gray-500 mb-6">
          تحلیل یکپارچهٔ رشد هوش، منطق و رفتارهای شما — از دادهٔ تمرین هوش (Brilliant) تا کارها،
          خودسازی و ثبت‌های مالی؛ هر عدد با مرجع دقیق داده.
        </p>

        {msg && (
          <div className={`mb-4 rounded-lg p-3 text-sm ${
            msg.kind === 'success' ? 'bg-green-50 border border-green-100 text-green-700'
              : 'bg-red-50 border border-red-100 text-red-600'}`}>
            {msg.text}
          </div>
        )}

        {/* آپلود */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">آپلود دادهٔ جدید</h2>
          <p className="text-sm text-gray-500 mb-3">
            فایل zip خروجی Brilliant را اینجا آپلود کن — یا همان فایل را در تلگرام برای ربات بفرست
            (خودش تشخیص می‌دهد و تحلیل می‌کند).
          </p>
          <label className={`inline-block px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${
            uploading ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {uploading ? 'در حال تحلیل…' : '📤 انتخاب فایل zip'}
            <input type="file" accept=".zip" className="hidden" disabled={uploading}
                   onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        </div>

        {/* یادآور */}
        {reminder && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6" data-testid="brain-reminder-settings">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">یادآور هفتگی تلگرام</h2>
            <p className="text-xs text-gray-400 mb-4">
              در روز و ساعت تعیین‌شده پیام یادآوری می‌آید؛ اگر فایل آپلود نشود هر
              «{reminder.refollow_hours} ساعت» دوباره یادآوری می‌شود تا فایل برسد (از تلگرام یا همین‌جا).
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!reminder.enabled}
                       onChange={(e) => saveReminder({ enabled: e.target.checked })} />
                فعال
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!reminder.silent}
                       onChange={(e) => saveReminder({ silent: e.target.checked })} />
                بی‌صدا
              </label>
              <label className="flex items-center gap-2">
                روز:
                <select value={reminder.weekday} onChange={(e) => saveReminder({ weekday: Number(e.target.value) })}
                        className="border border-gray-200 rounded-lg px-2 py-1 bg-white">
                  {WEEKDAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2">
                ساعت (UTC):
                <input type="number" min="0" max="23" value={reminder.hour}
                       onChange={(e) => saveReminder({ hour: Number(e.target.value) })}
                       className="w-16 border border-gray-200 rounded-lg px-2 py-1" />
              </label>
              <label className="flex items-center gap-2">
                یادآوری مجدد (ساعت):
                <input type="number" min="1" max="72" value={reminder.refollow_hours}
                       onChange={(e) => saveReminder({ refollow_hours: Number(e.target.value) })}
                       className="w-16 border border-gray-200 rounded-lg px-2 py-1" />
              </label>
            </div>
            {reminder.awaiting_since && (
              <p className="mt-3 text-xs text-amber-600">
                ⏳ منتظر آپلود این هفته — با رسیدن فایل، یادآوری‌های مجدد خودکار قطع می‌شود.
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">در حال بارگذاری…</div>
        ) : (
          <div className="space-y-6">
            {/* Brilliant */}
            {brilliant && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5" data-testid="brain-section-brilliant">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{brilliant.title}</h2>
                {brilliant.latest ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <Metric label="دقت پاسخ‌ها" value={brilliant.latest.accuracy_pct} suffix="٪" />
                      <Metric label="تعامل با مسئله" value={brilliant.latest.problem_interactions} />
                      <Metric label="درس کامل‌شده" value={brilliant.latest.lessons_completed} />
                      <Metric label="بلندترین استریک" value={brilliant.latest.longest_streak_days} suffix=" روز" />
                    </div>
                    {/* روند ماهانه: interactions + دقت */}
                    {brilliant.latest.monthly && Object.keys(brilliant.latest.monthly).length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-2">روند ماهانه (تعامل / دقت):</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(brilliant.latest.monthly).map(([m, v]) => (
                            <div key={m} className="bg-gray-50 rounded-lg px-2 py-1 text-xs text-gray-600" dir="ltr">
                              {m}: {v.interactions}🧩
                              {v.total > 0 ? ` ${Math.round((100 * v.correct) / v.total)}%` : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {brilliant.series?.length > 1 && (
                      <p className="text-xs text-gray-500">
                        روند آپلودها: {brilliant.series.map((u) => `${(u.uploaded_at || '').slice(0, 10)} → ${u.accuracy_pct ?? '—'}٪`).join(' | ')}
                      </p>
                    )}
                    {brilliant.latest_note && (
                      <div className="mt-3 bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap leading-7">
                        {brilliant.latest_note}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400">هنوز فایلی آپلود نشده — اولین zip را بفرست تا تحلیل شروع شود.</p>
                )}
                <Provenance p={brilliant.provenance} />
              </div>
            )}

            {/* سایر بخش‌ها */}
            {sections.filter((s) => s.key !== 'brilliant').map((s) => (
              <div key={s.key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                   data-testid={`brain-section-${s.key}`}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{s.title}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(s.metrics || {}).map(([k, v]) => (
                    <Metric key={k} label={{
                      total: 'کل', done: 'انجام‌شده', open: 'باز', done_ratio_pct: 'نرخ انجام',
                      checkins: 'چک‌این‌ها', items_completed: 'آیتم تیک‌خورده',
                      live_transactions: 'تراکنش جاری',
                    }[k] || k} value={v} suffix={k.endsWith('_pct') ? '٪' : ''} />
                  ))}
                </div>
                <Provenance p={s.provenance} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrainDashboard;
