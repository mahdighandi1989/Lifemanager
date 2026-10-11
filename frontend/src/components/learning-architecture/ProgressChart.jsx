/**
 * The trajectory of «معماری یادگیری عمیق» — drawn from progress.json, which
 * build.py derives from apps/learning-architecture/docs/PROGRESS.md (the same rows
 * the GitHub mermaid chart is generated from; nothing here is hand-entered).
 *
 * One axis (score): a column per event (▲/↩ +1, ▼ −1, ● 0; combos add up) and the
 * running total as a line. Hover/focus a column ⇒ tooltip; click ⇒ the event card
 * with its WORKLOG evidence. State metrics are stat tiles, not a second axis.
 */
import React, { useMemo, useState } from 'react';

import { slug, worklogHeading } from '../../lib/llaHandbook';

const GOOD = '#0ca30c';
const BAD = '#d03b3b';
const FLAT = '#9a9a96';
const INK = '#3d3d3a';
const GRID = '#e6e6e3';
const fa = (v) => String(v).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]).replace(/\./g, '٫').replace(/-/g, '−');
const fd = (v) => String(v).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]).replace(/-/g, '/'); // «/» keeps Persian-digit dates in order (bidi)
const dirWord = (d) => [...d].map((c) => ({ '▲': 'پیشرفت', '▼': 'پسرفت', '↩': 'اصلاح', '●': 'پایه' })[c] || c).join(' ⇒ ');

export default function ProgressChart({ data, onOpenWorklog }) {
  const rows = data?.rows || [];
  const [sel, setSel] = useState(rows.length ? rows[rows.length - 1].n : null);
  const [hover, setHover] = useState(null);

  const g = useMemo(() => {
    const W = 760; const H = 260; const L = 34; const R = 12; const T = 14; const B = 28;
    const lo = Math.min(0, ...rows.map((r) => Math.min(r.score, r.cumulative)));
    const hi = Math.max(1, ...rows.map((r) => Math.max(r.score, r.cumulative)));
    const y = (v) => T + ((hi - v) / (hi - lo || 1)) * (H - T - B);
    const band = (W - L - R) / Math.max(rows.length, 1);
    const x = (i) => L + band * i + band / 2;
    const bw = Math.min(16, band * 0.6);
    const ticks = [];
    const step = hi - lo > 10 ? 2 : 1;
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);
    return { W, H, L, R, T, B, y, x, band, bw, ticks };
  }, [rows]);

  if (!rows.length) return <p className="text-sm text-gray-500">دفترِ پیشرفت هنوز سطری ندارد.</p>;

  const last = rows[rows.length - 1];
  const metrics = data.metrics || {};
  const tiles = ['techniques', 'stations', 'rules', 'cases', 'test1', 'test2'].map((k) => ({
    k, label: metrics[k] || k, v: last[k],
  }));
  const s = rows.find((r) => r.n === sel) || last;
  const linePts = rows.map((r, i) => `${g.x(i).toFixed(1)},${g.y(r.cumulative).toFixed(1)}`).join(' ');
  const h = hover != null ? rows[hover] : null;

  return (
    <div dir="rtl" className="space-y-3" data-report-section="progress-chart" data-report-section-label="دفترچه › نمودارِ روند">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {tiles.map((t) => (
          <div key={t.k} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center">
            <div className="text-[11px] text-gray-500">{t.label}</div>
            <div className="text-lg font-bold text-gray-800">{t.v == null ? '—' : fa(t.k.startsWith('test') ? Number(t.v).toFixed(2) : t.v)}</div>
          </div>
        ))}
      </div>

      <div className="relative rounded-xl border border-gray-200 bg-[#fcfcfb] p-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-gray-600 px-1 pb-1">
          <span className="font-semibold text-gray-800">مسیرِ صفحه: {fa(rows.length)} رویداد · جمعِ جاری {fa(last.cumulative)}</span>
          <span className="inline-flex items-center gap-1"><i className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: GOOD }} />▲ ↩ پیشرفت/اصلاح</span>
          <span className="inline-flex items-center gap-1"><i className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: BAD }} />▼ پسرفت</span>
          <span className="inline-flex items-center gap-1"><i className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: FLAT }} />۰ خنثی</span>
          <span className="inline-flex items-center gap-1"><i className="inline-block w-4 h-0.5" style={{ background: INK }} />جمعِ جاری</span>
        </div>
        <svg viewBox={`0 0 ${g.W} ${g.H}`} className="w-full h-auto" dir="ltr" role="img"
          aria-label={`نمودارِ روند: ${rows.length} رویداد، جمعِ جاری ${last.cumulative}`}
          onMouseLeave={() => setHover(null)}>
          {g.ticks.map((v) => (
            <g key={v}>
              <line x1={g.L} x2={g.W - g.R} y1={g.y(v)} y2={g.y(v)} stroke={v === 0 ? '#b8b8b4' : GRID} strokeWidth="1" />
              <text x={g.L - 6} y={g.y(v) + 4} textAnchor="end" fontSize="10" fill="#6b6b67">{fa(v)}</text>
            </g>
          ))}
          {rows.map((r, i) => {
            const y0 = g.y(0); const y1 = g.y(r.score);
            const top = Math.min(y0, y1); const hgt = Math.max(Math.abs(y1 - y0), r.score === 0 ? 3 : 0);
            const color = r.score > 0 ? GOOD : r.score < 0 ? BAD : FLAT;
            const rr = Math.min(4, hgt / 2);
            const xl = g.x(i) - g.bw / 2;
            const up = r.score >= 0;
            const path = r.score === 0
              ? `M${xl},${y0 - 1.5}h${g.bw}v3h${-g.bw}z`
              : up
                ? `M${xl},${y0}V${top + rr}Q${xl},${top} ${xl + rr},${top}H${xl + g.bw - rr}Q${xl + g.bw},${top} ${xl + g.bw},${top + rr}V${y0}z`
                : `M${xl},${y0}V${top + hgt - rr}Q${xl},${top + hgt} ${xl + rr},${top + hgt}H${xl + g.bw - rr}Q${xl + g.bw},${top + hgt} ${xl + g.bw},${top + hgt - rr}V${y0}z`;
            return (
              <g key={r.n}>
                <path d={path} fill={color} opacity={sel === r.n || hover === i ? 1 : 0.85}
                  stroke={sel === r.n ? INK : 'none'} strokeWidth="1.5" />
                <rect x={g.x(i) - g.band / 2} y={g.T} width={g.band} height={g.H - g.T - g.B} fill="transparent"
                  tabIndex={0} style={{ cursor: 'pointer', outline: 'none' }}
                  onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
                  onClick={() => setSel(r.n)} onKeyDown={(e) => { if (e.key === 'Enter') setSel(r.n); }}>
                  <title>{`#${r.n} · ${r.date} · ${r.dir}\n${r.event}`}</title>
                </rect>
                {(rows.length <= 16 || i % 2 === 0 || i === rows.length - 1) && (
                  <text x={g.x(i)} y={g.H - 10} textAnchor="middle" fontSize="10" fill="#6b6b67">{`#${r.n}`}</text>
                )}
              </g>
            );
          })}
          <polyline points={linePts} fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" pointerEvents="none" />
          {rows.map((r, i) => (
            <circle key={r.n} cx={g.x(i)} cy={g.y(r.cumulative)} r={hover === i || sel === r.n ? 4.5 : 2.5}
              fill={INK} stroke="#fcfcfb" strokeWidth="2" pointerEvents="none" />
          ))}
          <text x={g.x(rows.length - 1)} y={g.y(last.cumulative) - 9} textAnchor="end" fontSize="11" fontWeight="700" fill={INK}>{fa(last.cumulative)}</text>
          {h && (
            <line x1={g.x(hover)} x2={g.x(hover)} y1={g.T} y2={g.H - g.B} stroke="#b8b8b4" strokeDasharray="3 3" pointerEvents="none" />
          )}
        </svg>
        {h && (
          <div className="pointer-events-none absolute top-10 left-3 max-w-xs rounded-lg border border-gray-200 bg-white/95 shadow-sm p-2 text-[12px] text-gray-700" dir="rtl">
            <div className="font-semibold text-gray-900">#{fa(h.n)} · <span dir="ltr">{fd(h.date)}</span> · {h.dir} {dirWord(h.dir)}</div>
            <div className="mt-0.5">{h.event}</div>
            <div className="mt-0.5 text-gray-500">این رویداد {fa(h.score)} · جمعِ جاری {fa(h.cumulative)}</div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm" dir="rtl">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-semibold text-gray-900">رویدادِ #{fa(s.n)}</span>
          <span className="text-gray-500" dir="ltr">{fd(s.date)}</span>
          <span className="rounded bg-gray-100 px-1.5 text-gray-700">{s.dir} {dirWord(s.dir)}</span>
        </div>
        <p className="mt-1 text-gray-800">{s.event}</p>
        <div className="mt-1 flex flex-wrap gap-2 text-[12px]">
          <span className="text-gray-500">سند:</span>
          {(s.refs || []).map((n) => {
            const e = data.worklog?.[String(n)];
            return (
              <button key={n} type="button" className="text-sky-700 hover:underline"
                onClick={() => onOpenWorklog?.(e ? slug(worklogHeading(n, e)) : '')}>
                دفترِ کار ({fa(n)}){e ? ` — ${e.title}` : ''}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-[11px] text-gray-400">روی هر ستون بزن تا رویدادش این‌جا بیاید. داده: دفترِ پیشرفت (همان جدولی که در GitHub است).</p>
      </div>
    </div>
  );
}
