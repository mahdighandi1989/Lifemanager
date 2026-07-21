import React, { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

/**
 * مسیر نهادینه‌سازی — the internalization engine surface (owner vision
 * 2026-07-21: turn the scattered lists/writings/aspirations into daily
 * *commands* that get followed up until they dissolve into habit).
 *
 * Sections: today's commands (done/miss + streak), growth report
 * (نهادینه‌شده / در حال شکل‌گیری / شروع‌نشده), proposals awaiting approval,
 * and the active pool with strength bars. Coach tone = strict (the owner's
 * choice) — misses are shown plainly. Every fetch fail-opens.
 */

const DOMAIN_COLORS = {
  معنوی: 'bg-emerald-50 text-emerald-700',
  خودسازی: 'bg-indigo-50 text-indigo-700',
  دانش: 'bg-sky-50 text-sky-700',
  سلامت: 'bg-rose-50 text-rose-700',
  مالی: 'bg-amber-50 text-amber-700',
  روابط: 'bg-fuchsia-50 text-fuchsia-700',
  آرزو: 'bg-violet-50 text-violet-700',
  کار: 'bg-slate-100 text-slate-700',
};

function DomainChip({ domain }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
        DOMAIN_COLORS[domain] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {domain}
    </span>
  );
}

function StrengthBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const color = v >= 90 ? 'bg-emerald-500' : v >= 40 ? 'bg-indigo-500' : 'bg-amber-400';
  return (
    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${v}%` }} />
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${tone || 'bg-white border-gray-100'}`}>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

export default function DirectivesPage() {
  const [today, setToday] = useState([]);
  const [report, setReport] = useState(null);
  const [proposed, setProposed] = useState([]);
  const [active, setActive] = useState([]);
  const [graduated, setGraduated] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    const safe = (p) => p.then((r) => r.data).catch(() => null);
    const [t, rep, prop, act, grad, cfg] = await Promise.all([
      safe(api.get('/directives/today')),
      safe(api.get('/directives/report')),
      safe(api.get('/directives?status=proposed')),
      safe(api.get('/directives?status=active')),
      safe(api.get('/directives?status=graduated')),
      safe(api.get('/directives/config')),
    ]);
    setToday((t && t.commands) || []);
    setReport((rep && rep.report) || null);
    setProposed((prop && prop.directives) || []);
    setActive((act && act.directives) || []);
    setGraduated((grad && grad.directives) || []);
    setConfig((cfg && cfg.config) || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const act = async (fn, note) => {
    setBusy(true);
    setMsg('');
    try {
      await fn();
      if (note) setMsg(note);
      await reload();
    } catch {
      setMsg('خطا — دوباره تلاش کن.');
    } finally {
      setBusy(false);
    }
  };

  const markDone = (id) => act(() => api.post(`/directives/${id}/done`), 'آفرین — ثبت شد.');
  const markMiss = (id) => act(() => api.post(`/directives/${id}/miss`), 'ثبت شد که جا ماندی.');
  const approve = (id) => act(() => api.post(`/directives/${id}/approve`));
  const reject = (id) => act(() => api.post(`/directives/${id}/reject`));
  const extract = () =>
    act(() => api.post('/directives/extract'), 'از محتوایت فرمان‌های تازه پیشنهاد شد.');
  const addManual = () => {
    const title = newTitle.trim();
    if (!title) return;
    act(async () => {
      await api.post('/directives', { title, cadence: 'daily', kind: 'practice' });
      setNewTitle('');
    }, 'فرمان اضافه شد.');
  };

  const counts = (report && report.counts) || {};
  const todayStat = (report && report.today) || { done: 0, total: 0 };

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="directives-page">
      <div className="max-w-4xl mx-auto px-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">مسیر نهادینه‌سازی</h1>
        <p className="text-sm text-gray-500 mb-4">
          لیست‌ها و آرزوهایت به «فرمان» تبدیل می‌شوند؛ هر روز چندتا را انجام بده تا در تو حل و
          نهادینه شوند — بدون اینکه دونه‌دونه بخوانی‌شان.
          {config && (
            <span className="mx-1 text-gray-400">
              (لحن: {config.mode === 'strict' ? 'مربیِ جدی' : config.mode} — کانال:{' '}
              {config.channel === 'both' ? 'وب و تلگرام' : config.channel})
            </span>
          )}
        </p>

        {/* actions */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <button
            onClick={extract}
            disabled={busy}
            data-testid="directives-extract"
            className="rounded-lg bg-indigo-600 text-white text-sm px-3 py-2 disabled:opacity-50"
          >
            استخراج فرمان از محتوای من
          </button>
          <div className="flex items-center gap-1">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="یک فرمان دستی بنویس…"
              dir="rtl"
              className="rounded-lg border border-gray-200 text-sm px-3 py-2 w-56"
              data-testid="directives-new-title"
            />
            <button
              onClick={addManual}
              disabled={busy || !newTitle.trim()}
              className="rounded-lg bg-gray-800 text-white text-sm px-3 py-2 disabled:opacity-50"
            >
              افزودن
            </button>
          </div>
          {msg && <span className="text-sm text-emerald-600">{msg}</span>}
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">در حال بارگذاری…</p>
        ) : (
          <div className="space-y-6">
            {/* growth report */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="directives-report">
              <StatCard label="نهادینه‌شده" value={counts.graduated ?? 0} tone="bg-emerald-50 border-emerald-100" />
              <StatCard label="در حال شکل‌گیری" value={counts.forming ?? 0} tone="bg-indigo-50 border-indigo-100" />
              <StatCard label="شروع‌نشده" value={counts.not_started ?? 0} tone="bg-amber-50 border-amber-100" />
              <StatCard label="امروز" value={`${todayStat.done}/${todayStat.total}`} />
            </div>

            {/* today's commands */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">🎯 فرمان‌های امروز</h2>
              {today.length === 0 ? (
                <p className="text-gray-400 text-sm bg-white rounded-xl border border-gray-100 p-4">
                  امروز فرمانی نداری. «استخراج» را بزن یا یک فرمان دستی اضافه کن.
                </p>
              ) : (
                <div className="space-y-2" data-testid="directives-today">
                  {today.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 bg-white rounded-xl border border-gray-100 p-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <DomainChip domain={c.domain} />
                          {c.streak > 0 && (
                            <span className="text-xs text-orange-600">🔥 {c.streak}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-800 mt-1 truncate">{c.title}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {c.done === true ? (
                          <span className="text-emerald-600 text-sm font-medium">✓ انجام شد</span>
                        ) : c.done === false ? (
                          <span className="text-red-500 text-sm">جا ماندی</span>
                        ) : null}
                        <button
                          onClick={() => markDone(c.id)}
                          disabled={busy}
                          className="rounded-lg bg-emerald-600 text-white text-xs px-3 py-1.5 disabled:opacity-50"
                        >
                          انجام دادم
                        </button>
                        <button
                          onClick={() => markMiss(c.id)}
                          disabled={busy}
                          className="rounded-lg bg-gray-100 text-gray-600 text-xs px-3 py-1.5 disabled:opacity-50"
                        >
                          جا ماندم
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* proposals */}
            {proposed.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">
                  ✍️ پیشنهادها (منتظر تأیید تو)
                </h2>
                <div className="space-y-2" data-testid="directives-proposed">
                  {proposed.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between gap-3 bg-white rounded-xl border border-gray-100 p-3"
                    >
                      <div className="min-w-0">
                        <DomainChip domain={d.domain} />
                        <div className="text-sm text-gray-800 mt-1 truncate">{d.title}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => approve(d.id)}
                          disabled={busy}
                          className="rounded-lg bg-indigo-600 text-white text-xs px-3 py-1.5 disabled:opacity-50"
                        >
                          تأیید
                        </button>
                        <button
                          onClick={() => reject(d.id)}
                          disabled={busy}
                          className="rounded-lg bg-gray-100 text-gray-500 text-xs px-3 py-1.5 disabled:opacity-50"
                        >
                          رد
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* active pool */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">🌱 کانونِ فعال</h2>
              {active.length === 0 ? (
                <p className="text-gray-400 text-sm bg-white rounded-xl border border-gray-100 p-4">
                  هنوز فرمان فعالی نداری.
                </p>
              ) : (
                <div className="space-y-2" data-testid="directives-active">
                  {active.map((d) => (
                    <div key={d.id} className="bg-white rounded-xl border border-gray-100 p-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <DomainChip domain={d.domain} />
                          <span className="text-sm text-gray-800 truncate">{d.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                          {d.streak > 0 && <span className="text-orange-600">🔥 {d.streak}</span>}
                          <span>قوّت {d.strength}٪</span>
                        </div>
                      </div>
                      <StrengthBar value={d.strength} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* graduated */}
            {graduated.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">
                  ✅ در تو حل شده‌اند (نهادینه)
                </h2>
                <div className="flex flex-wrap gap-2" data-testid="directives-graduated">
                  {graduated.map((d) => (
                    <span
                      key={d.id}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-xs px-3 py-1"
                    >
                      ✓ {d.title}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
