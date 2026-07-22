import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

// «نقشهٔ ساحت‌ها» — the human-dimensions map: everything in the system bucketed
// under رابطه با خدا / خود (روان، عقل، جسم) / دیگران / محیط, with principled
// weights (حق‌الناس > اضرار به نفس > رشد > لغو). One clean screen; each card is
// also the navigation hub into its pages.

const SAHAT_COLOR = {
  khoda: { bar: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700', ring: 'border-emerald-200' },
  khod_ravan: { bar: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700', ring: 'border-violet-200' },
  khod_aql: { bar: 'bg-blue-500', chip: 'bg-blue-50 text-blue-700', ring: 'border-blue-200' },
  khod_jesm: { bar: 'bg-orange-500', chip: 'bg-orange-50 text-orange-700', ring: 'border-orange-200' },
  digaran: { bar: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700', ring: 'border-rose-200' },
  mohit: { bar: 'bg-teal-500', chip: 'bg-teal-50 text-teal-700', ring: 'border-teal-200' },
};

const LINK_FA = {
  '/writings': 'نوشته‌ها', '/directives': 'فرمان‌ها', '/lists': 'لیست‌ها',
  '/self-portrait': 'خودنگاره', '/brain': 'رشد ذهن', '/tasks': 'کارها',
  '/people-profiles': 'افراد', '/budget': 'مالی', '/projects': 'پروژه‌ها',
  '/life-file': 'پروندهٔ زندگی', '/assets': 'دارایی‌ها', '/merge': 'پاک‌سازی',
};

const WEIGHT_BADGE = (w) => {
  if (w >= 5) return { label: 'حق‌الناس', cls: 'bg-red-100 text-red-700' };
  if (w >= 4) return { label: 'سلامت/سند', cls: 'bg-orange-100 text-orange-700' };
  if (w >= 3) return { label: 'رشد', cls: 'bg-amber-100 text-amber-700' };
  return { label: 'اتلاف', cls: 'bg-gray-100 text-gray-600' };
};

function scoreColor(s) {
  if (s == null) return 'text-gray-300';
  if (s >= 70) return 'text-green-600';
  if (s >= 40) return 'text-amber-600';
  return 'text-red-600';
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

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6" dir="rtl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🧭 نقشهٔ ساحت‌ها</h1>
          <p className="mt-1 text-sm text-gray-500">
            همه‌چیزِ سیستم — کارها، نوشته‌ها، مالی، افراد، اسناد، حتی انباشتگی‌ها — زیرِ
            ساحت‌های انسان: رابطه با خدا، با خود (روان/عقل/جسم)، با دیگران، با محیط.
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
          {/* Balance strip — the at-a-glance visual map */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5" data-testid="sahat-balance">
            <div className="flex items-end justify-around gap-3 h-40">
              {sahats.map((s) => (
                <div key={s.key} className="flex flex-1 flex-col items-center gap-1 min-w-0">
                  <span className={`text-sm font-bold ${scoreColor(s.score)}`} dir="ltr">
                    {s.score == null ? '—' : s.score}
                  </span>
                  <div className="flex h-24 w-6 items-end rounded-t bg-gray-100">
                    <div
                      className={`w-6 rounded-t ${SAHAT_COLOR[s.key]?.bar || 'bg-gray-400'}`}
                      style={{ height: `${s.score || 0}%` }}
                    />
                  </div>
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-[11px] text-gray-600 text-center leading-tight">{s.title}</span>
                </div>
              ))}
            </div>
            {weakest && (
              <p className="mt-3 text-center text-xs text-gray-500">
                ضعیف‌ترین ساحتِ این لحظه:{' '}
                <b>{sahats.find((s) => s.key === weakest)?.title}</b> — محاسبهٔ هفتگی را از همین‌جا شروع کن.
              </p>
            )}
          </div>

          {/* Six sahat cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sahats.map((s) => {
              const color = SAHAT_COLOR[s.key] || {};
              const pct = s.total ? Math.round((s.done / s.total) * 100) : null;
              return (
                <div
                  key={s.key}
                  className={`bg-white rounded-xl shadow-sm border ${color.ring || 'border-gray-100'} p-4 space-y-3`}
                  data-testid={`sahat-card-${s.key}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">{s.icon}</span>
                      <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-gray-900 truncate">{s.title}</h2>
                        <p className="text-[11px] text-gray-400 truncate">{s.desc}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 text-2xl font-extrabold ${scoreColor(s.score)}`} dir="ltr">
                      {s.score == null ? '—' : s.score}
                    </span>
                  </div>

                  {pct != null && (
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>پیشرفت</span>
                        <span dir="ltr">{s.done}/{s.total}</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-gray-100">
                        <div className={`h-2 rounded-full ${color.bar}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}

                  {(s.backbone || []).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-gray-500">نخِ تسبیح:</p>
                      {s.backbone.map((b, i) => (
                        <Link
                          key={i}
                          to={b.link || '/lists'}
                          className="flex items-center justify-between gap-2 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                        >
                          <span className="truncate">{b.label}</span>
                          <span className="shrink-0 text-[10px] text-gray-400" dir="ltr">
                            {b.done}/{b.total}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {(s.attention || []).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-gray-500">نیازمندِ توجه:</p>
                      {s.attention.map((a, i) => {
                        const badge = WEIGHT_BADGE(a.weight);
                        return (
                          <Link
                            key={i}
                            to={a.link || '/'}
                            className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            <span className="truncate">{a.label}</span>
                            <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

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
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${color.chip || 'bg-gray-100 text-gray-600'} hover:opacity-80`}
                      >
                        {LINK_FA[l] || l}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default SahatMap;
