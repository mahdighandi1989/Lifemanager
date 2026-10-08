/**
 * The filed boxes, drawn back onto the very spot they were drawn on.
 *
 * «همون‌جایی که کادر کشیدم … یه هایلایت مانند همون ابعاد در همون مختصات باشه که
 *  بتونم ببینم کجاها گزارش ثبت شده و چی نوشته شده» — ALLIN1 v150, ported.
 *
 * THE CONSTRAINT THAT SHAPES IT: «وقتی روشون میایم باید متنِ گزارش ظاهر بشه» needs
 * hover, «نباید مانع بشه که کلیک‌های زیر … قابلِ کلیک کردن نباشن» needs NO hover —
 * an element that gets `mouseenter` also gets `click`. So the layer is
 * `pointer-events: none` throughout and the hover is a document-level mousemove
 * hit-tested against the stored rectangles. Nothing is ever intercepted.
 *
 * THE COLOUR is whose turn it is (owner's rule, ALLIN1 v166): amber open (also
 * after the owner writes again), green answered, blue approved — and a sheet
 * disappears from the page once a round FILES it.
 *
 * Follow-up notes drawn on the page carry their own box; those are drawn too,
 * in the sheet's colour, because every box the owner drew should show where.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';

import {
  HL_DEFAULT_OPACITY, PREFS_EVT, SHEETS_EVT, TONE_RGB, inspectionApi,
  readHighlightOpacity, readHighlightsEnabled,
} from '../../lib/inspection/api';
import { placeSpot, sheetOnScreen } from '../../lib/inspection/spot';

export const toneOf = (r) => TONE_RGB[r.status] || TONE_RGB[r.glow?.tone] || TONE_RGB.open;

/** Every box of every live sheet that belongs on THIS screen. */
export function boxesFor(reports, location) {
  const out = [];
  for (const r of reports || []) {
    if (r.status === 'filed') continue;
    if (r.geometry && sheetOnScreen(r.reopen, location)) {
      out.push({ key: r.id, report: r, geometry: r.geometry, noteIndex: 0 });
    }
    (r.notes || []).forEach((n, i) => {
      if (i === 0 || !n.spot?.geometry) return;
      if (sheetOnScreen(n.spot.reopen, location)) {
        out.push({ key: `${r.id}:${n.id}`, report: r, geometry: n.spot.geometry, noteIndex: i });
      }
    });
  }
  return out;
}

export default function InspectionHighlights() {
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [enabled, setEnabled] = useState(true);
  const [opacity, setOpacity] = useState(HL_DEFAULT_OPACITY);
  const [placed, setPlaced] = useState([]);
  const [hover, setHover] = useState(null);
  const raf = useRef(null);

  useEffect(() => {
    const read = () => { setEnabled(readHighlightsEnabled()); setOpacity(readHighlightOpacity()); };
    read();
    window.addEventListener(PREFS_EVT, read);
    window.addEventListener('storage', read);
    return () => { window.removeEventListener(PREFS_EVT, read); window.removeEventListener('storage', read); };
  }, []);

  // Fetched more than once ON PURPOSE: a single fetch on mount fails silently
  // and permanently when the page painted before the token was in place.
  useEffect(() => {
    if (!enabled) { setReports([]); return undefined; }
    let alive = true;
    let attempt = 0;
    let timer;
    const load = async () => {
      try {
        const d = await inspectionApi.list();
        if (alive) setReports(d.reports || []);
      } catch {
        if (!alive || attempt >= 4) return;
        attempt += 1;
        timer = window.setTimeout(load, 700 * attempt);
      }
    };
    void load();
    const again = () => { attempt = 0; void load(); };
    window.addEventListener('focus', again);
    window.addEventListener(SHEETS_EVT, again);
    return () => {
      alive = false;
      if (timer) window.clearTimeout(timer);
      window.removeEventListener('focus', again);
      window.removeEventListener(SHEETS_EVT, again);
    };
  }, [enabled]);

  const boxes = useMemo(() => boxesFor(reports, location), [reports, location]);

  const remeasure = useCallback(() => {
    if (raf.current !== null) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      const lookup = (sel) => {
        try {
          const el = document.querySelector(sel);
          if (!el) return null;
          const b = el.getBoundingClientRect();
          return { x: b.left + window.scrollX, y: b.top + window.scrollY, w: b.width, h: b.height };
        } catch { return null; }
      };
      const out = [];
      for (const b of boxes) {
        const place = placeSpot(b.geometry, lookup);
        if (place) out.push({ ...b, place });
      }
      setPlaced(out);
    });
  }, [boxes]);

  useEffect(() => {
    remeasure();
    window.addEventListener('resize', remeasure);
    window.addEventListener('scroll', remeasure, true);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(remeasure) : null;
    try { ro?.observe(document.body); } catch { /* old browser */ }
    const t = window.setInterval(remeasure, 2000);       // late-loading content
    return () => {
      window.removeEventListener('resize', remeasure);
      window.removeEventListener('scroll', remeasure, true);
      ro?.disconnect();
      window.clearInterval(t);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [remeasure]);

  useEffect(() => {
    if (!enabled || !placed.length) { setHover(null); return undefined; }
    const onMove = (e) => {
      let best = null;
      let bestArea = Infinity;
      for (const p of placed) {
        const r = p.place.rect;
        if (e.pageX >= r.x && e.pageX <= r.x + r.w && e.pageY >= r.y && e.pageY <= r.y + r.h) {
          const area = r.w * r.h;               // smallest wins, so a box inside a box is reachable
          if (area < bestArea) { best = p; bestArea = area; }
        }
      }
      setHover(best ? { p: best, x: e.clientX, y: e.clientY } : null);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [placed, enabled]);

  if (!enabled || !placed.length || typeof document === 'undefined') return null;

  const tip = hover && (() => {
    const r = hover.p.report;
    const notes = r.notes || [];
    const last = [...notes].reverse().find((n) => n.by === 'reviewer');
    const note = notes[hover.p.noteIndex] || notes[0];
    return {
      number: r.number, title: r.title || '', label: r.glow?.label || r.status,
      outcome: r.glow?.outcome_label || '', noteIndex: hover.p.noteIndex,
      text: note?.text || '', answer: last?.text || '',
      approximate: hover.p.place.approximate, tone: toneOf(r),
    };
  })();

  // Portalled into <body>: `position:absolute` must resolve against the document,
  // not against some `relative` wrapper that would silently re-base every box.
  return createPortal(
    <>
      <div data-inspection-layer="1" data-testid="inspection-highlight-layer" aria-hidden="true"
        style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, pointerEvents: 'none', zIndex: 60 }}>
        {placed.map(({ key, report, place }) => {
          const tone = toneOf(report);
          return (
            <div key={key} data-inspection-highlight={report.number}
              style={{
                position: 'absolute', left: place.rect.x, top: place.rect.y,
                width: place.rect.w, height: place.rect.h, pointerEvents: 'none',
                background: `rgba(${tone}, ${opacity})`,
                border: `1.5px ${place.approximate ? 'dashed' : 'solid'} rgba(${tone}, ${Math.min(1, opacity + 0.45)})`,
                borderRadius: 4, boxShadow: '0 0 0 1px rgba(255,255,255,0.25) inset',
              }} />
          );
        })}
      </div>
      {tip && (
        <div dir="rtl" data-inspection-layer="1"
          style={{
            position: 'fixed',
            left: Math.min(hover.x + 14, window.innerWidth - 330),
            top: Math.min(hover.y + 14, window.innerHeight - 200),
            width: 310, pointerEvents: 'none', zIndex: 61,
            background: 'rgba(17,17,17,0.94)', color: '#fff', borderRadius: 10,
            padding: '9px 11px', fontSize: 12, lineHeight: 1.8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)', borderRight: `4px solid rgb(${tip.tone})`,
          }}>
          <div style={{ fontWeight: 700 }}>
            گزارشِ {tip.number}{tip.title ? ` — ${tip.title}` : ''}
            {tip.noteIndex > 0 ? ` · یادداشتِ ${tip.noteIndex + 1}` : ''}
          </div>
          <div style={{ opacity: 0.85 }}>وضعیت: {tip.label}{tip.outcome ? ` · ${tip.outcome}` : ''}</div>
          {!!tip.text && (
            <div style={{ marginTop: 4 }}>{tip.text.length > 160 ? `${tip.text.slice(0, 160)}…` : tip.text}</div>
          )}
          {!!tip.answer && (
            <div style={{ marginTop: 4, opacity: 0.8 }}>
              پاسخِ ناظر: {tip.answer.length > 120 ? `${tip.answer.slice(0, 120)}…` : tip.answer}
            </div>
          )}
          {tip.approximate && (
            <div style={{ marginTop: 4, color: '#fbbf24' }}>
              ⚠ جای تقریبی — عنصرِ اصلی پیدا نشد، از مختصاتِ ذخیره‌شده استفاده شد
            </div>
          )}
        </div>
      )}
    </>,
    document.body,
  );
}
