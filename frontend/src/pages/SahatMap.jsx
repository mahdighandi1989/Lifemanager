import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { SAHAT_META, ATTENTION_KIND_CLS, scoreColor } from '../lib/sahat';

// «خداشهر» — the God-city map. NOT a mosque: the God-relation is the قبله the
// whole city faces (the top band), and the body of the city is everything
// else — work, trade, hobbies, errands, همهٔ مباحات — each in its own
// district with dignity. Every card drills into its district page
// (/sahat/:key) where the full chain نقشه → محله → نخ → صفحه lives.

const LINK_FA = {
  '/writings': 'نوشته‌ها', '/directives': 'فرمان‌ها', '/lists': 'لیست‌ها',
  '/self-portrait': 'خودنگاره', '/brain': 'رشد ذهن', '/tasks': 'کارها',
  '/people-profiles': 'افراد', '/budget': 'مالی', '/projects': 'پروژه‌ها',
  '/life-file': 'پروندهٔ زندگی', '/assets': 'دارایی‌ها', '/merge': 'پاک‌سازی',
};

function MassLine({ s }) {
  const parts = [];
  if (s.writings > 0) parts.push(`📝 ${s.writings} نوشته`);
  if (s.projects > 0) parts.push(`📁 ${s.projects} پروژه`);
  if (s.assets > 0) parts.push(`🗃 ${s.assets} فایل/رسانه`);
  if (parts.length === 0) return null;
  return (
    <p className="text-[11px] text-gray-400" dir="rtl">
      {parts.join(' · ')}
    </p>
  );
}

function Threads({ s }) {
  if (!(s.threads || []).length) return null;
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium text-gray-500">نخ‌های تسبیح:</p>
      {s.threads.map((t) => {
        const empty = !t.total && !t.writings && !t.directives && !t.lists;
        return (
          <Link
            key={t.key}
            to={`/sahat/${s.key}`}
            className={`flex items-center justify-between gap-2 rounded-md px-2 py-1 text-xs hover:bg-gray-100 ${
              empty ? 'bg-gray-50/50 text-gray-400' : 'bg-gray-50 text-gray-700'
            }`}
          >
            <span className="truncate">{t.title}</span>
            <span className="flex shrink-0 items-center gap-1.5 text-[10px] text-gray-400">
              {t.total > 0 && <span dir="ltr">{t.done}/{t.total}</span>}
              {t.writings > 0 && <span>📝{t.writings}</span>}
              {t.directives > 0 && <span>🧭{t.directives}</span>}
              {empty && <span>خالی</span>}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function Attention({ s }) {
  if (!(s.attention || []).length) return null;
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium text-gray-500">نیازمندِ توجه:</p>
      {s.attention.map((a, i) => (
        <Link
          key={i}
          to={a.link || '/'}
          className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
        >
          <span className="truncate">{a.label}</span>
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
            ATTENTION_KIND_CLS[a.kind] || 'bg-amber-100 text-amber-700'
          }`}>
            {a.kind_fa || 'رشد'}
          </span>
        </Link>
      ))}
    </div>
  );
}

function Progress({ s, color }) {
  const pct = s.total ? Math.round((s.done / s.total) * 100) : null;
  if (pct == null) return null;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <span>پیگیریِ عمل</span>
        <span dir="ltr">{s.done}/{s.total}</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
        <div className={`h-2 rounded-full ${color.bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DistrictCard({ s, wide }) {
  const color = SAHAT_META[s.key] || {};
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border ${color.ring || 'border-gray-100'} p-4 space-y-3 ${
        wide ? 'md:col-span-2 xl:col-span-3' : ''
      }`}
      data-testid={`sahat-card-${s.key}`}
    >
      <div className="flex items-center justify-between gap-2">
        <Link to={`/sahat/${s.key}`} className="flex items-center gap-2 min-w-0 hover:opacity-80">
          <span className="text-xl">{s.icon}</span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">{s.title}</h2>
            <p className="text-[11px] text-gray-400 truncate">{s.desc}</p>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`text-2xl font-extrabold ${scoreColor(s.score)}`} dir="ltr">
            {s.score == null ? '—' : s.score}
          </span>
          <Link
            to={`/sahat/${s.key}`}
            className="rounded-md bg-gray-50 px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-100"
          >
            محله ←
          </Link>
        </div>
      </div>

      <Progress s={s} color={color} />
      <MassLine s={s} />

      {(s.backbone || []).length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-gray-500">ستون‌فقرات:</p>
          {s.backbone.map((b, i) => (
            <Link
              key={i}
              to={b.link || '/lists'}
              className="flex items-center justify-between gap-2 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
            >
              <span className="truncate">{b.label}</span>
              <span className="shrink-0 text-[10px] text-gray-400" dir="ltr">
                {b.doc ? '📄' : `${b.done}/${b.total}`}
              </span>
            </Link>
          ))}
        </div>
      )}

      <Threads s={s} />
      <Attention s={s} />

      {(s.finance_lines || []).length > 0 && (
        <div className="rounded-md bg-gray-50 p-2 text-[11px] text-gray-600 space-y-0.5">
          {s.finance_lines.map((ln, i) => (
            <p key={i} dir="rtl">{ln}</p>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1 pt-1 border-t border-gray-50">
        {(s.links || []).map((l) => (
          <Link
            key={l}
            to={l}
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium border ${color.chip || 'bg-gray-100 text-gray-600'} hover:opacity-80`}
          >
            {LINK_FA[l] || l}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SahatMap() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const r = await api.get('/sahat/map');
      setData(r.data || {});
    } catch {
      setData({});
    }
  };
  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setBusy(true);
    try {
      await api.post('/sahat/refresh');
      await load();
    } catch { /* best-effort */ } finally {
      setBusy(false);
    }
  };

  const sahats = data?.sahats || [];
  const weakest = data?.weakest;
  const qibla = sahats.filter((s) => s.group === 'qibla');
  const khod = sahats.filter((s) => s.group === 'khod');
  const rel = sahats.filter((s) => s.group === 'rel');

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6" dir="rtl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏙 خداشهر — نقشهٔ زندگی</h1>
          <p className="mt-1 text-sm text-gray-500">
            همه‌چیز — از عبادت تا مباح‌ترین کارِ روزمره — ذیلِ ساحت‌های انسان: قبلهٔ شهر
            رابطه با خداست و بدنهٔ شهر، خود و دیگران و محیط. ماشین فقط عمل و پیگیری را
            می‌سنجد؛ <b>نیت هرگز امتیاز نمی‌گیرد</b> و هیچ برچسبِ فقهی‌ای حکمِ قطعی نیست.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={busy}
          data-testid="sahat-refresh"
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? '…' : '🔄 محاسبه و ثبت'}
        </button>
      </div>

      {data === null && <p className="text-gray-400">در حال بارگذاری…</p>}

      {data !== null && sahats.length > 0 && (
        <>
          {/* Balance strip — the at-a-glance visual map; each bar opens its district */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5" data-testid="sahat-balance">
            <div className="flex items-end justify-around gap-3 h-40">
              {sahats.map((s) => (
                <Link key={s.key} to={`/sahat/${s.key}`} className="flex flex-1 flex-col items-center gap-1 min-w-0 hover:opacity-80">
                  <span className={`text-sm font-bold ${scoreColor(s.score)}`} dir="ltr">
                    {s.score == null ? '—' : s.score}
                  </span>
                  <div className="flex h-24 w-6 items-end rounded-t bg-gray-100">
                    <div
                      className={`w-6 rounded-t ${SAHAT_META[s.key]?.bar || 'bg-gray-400'}`}
                      style={{ height: `${s.score || 0}%` }}
                    />
                  </div>
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-[11px] text-gray-600 text-center leading-tight">{s.title}</span>
                </Link>
              ))}
            </div>
            {weakest && (
              <p className="mt-3 text-center text-xs text-gray-500">
                ضعیف‌ترین ساحتِ این لحظه:{' '}
                <b>{sahats.find((s) => s.key === weakest)?.title}</b> — محاسبهٔ هفتگی را از همین‌جا شروع کن.
              </p>
            )}
          </div>

          {/* قبلهٔ شهر — the orientation band (full width, not a corner) */}
          {qibla.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {qibla.map((s) => <DistrictCard key={s.key} s={s} wide />)}
            </div>
          )}

          {/* خود — the three facets of self */}
          <div>
            <h2 className="mb-2 text-sm font-semibold text-gray-500">خود — جان و تن و ذهن</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {khod.map((s) => <DistrictCard key={s.key} s={s} />)}
            </div>
          </div>

          {/* شهرِ بیرون — دیگران و محیط */}
          <div>
            <h2 className="mb-2 text-sm font-semibold text-gray-500">شهرِ بیرون — دیگران و محیط</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rel.map((s) => <DistrictCard key={s.key} s={s} />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SahatMap;
