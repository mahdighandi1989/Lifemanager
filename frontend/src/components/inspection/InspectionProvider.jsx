/**
 * «نظارت و سرکشی» on every page: the owner switches 📝 on, draws a box around
 * what is wrong (or holds Alt and drags), writes a line, and the sheet is filed
 * with the way BACK to that exact spot. Ported from ALLIN1's `inspection.tsx`
 * (v141–v177) and Detective-1, both read-only references.
 *
 * Two pieces of evidence, and the difference matters:
 *   • the ADDRESS + GEOMETRY — always taken, always true (`lib/inspection/spot`);
 *   • the PICTURE — a real screenshot the owner PASTES (Ctrl+V; the honest one),
 *     or a render of the region marked with the box. The dialog says which,
 *     because a near-miss render offered as «this is what I saw» is worse
 *     evidence than none.
 *
 * The owner's requests this answers, verbatim from the sibling projects:
 *   «بتونم انتخاب کنم که به عنوان گزارش جدید باشه یا بره ذیل گزارشی که هنوز تایید
 *    مالک روش انجام نشده و بایگانی نشده» → the «کجا ثبت کنم؟» list;
 *   «هر نوع فایلی» → the 📎 input has no `accept` filter;
 *   capture starts AT ONCE (v154: a second button press cost a report its picture).
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import {
  apiError, inspectionApi, notifySheetsChanged,
} from '../../lib/inspection/api';
import { annotate, boxInImage, shrinkShot } from '../../lib/inspection/shots';
import {
  CAPTURE_DEADLINE_MS, CROP_MIN_PX, bandAround, boundedCaptureTarget, captureChain,
  captureRatio, geometryLabel, measureSpot, pageElementsAt, resolveSpot, spotAddress,
  verifiedSelector, withDeadline,
} from '../../lib/inspection/spot';
import { TOAST_EVT, toast } from '../../lib/inspection/toast';

const Ctx = createContext(null);
export const useInspection = () => useContext(Ctx);

const LS_ACTIVE = 'lm.inspection.active';

export default function InspectionProvider({ children }) {
  const location = useLocation();
  const [active, setActiveRaw] = useState(false);
  const [armed, setArmed] = useState(false);
  const [rect, setRect] = useState(null);
  const [spot, setSpot] = useState(null);
  const [shot, setShot] = useState(null);          // { data, kind: 'pasted' | 'rendered' }
  const [shooting, setShooting] = useState(false);
  const [text, setText] = useState('');
  const [picked, setPicked] = useState([]);
  const [target, setTarget] = useState('');        // '' = new sheet; else the sheet it goes under
  const [upPct, setUpPct] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reports, setReports] = useState([]);
  const [tabLabels, setTabLabels] = useState({});  // `${path}|${tab}` → Persian label
  const start = useRef(null);

  useEffect(() => {
    try { setActiveRaw(localStorage.getItem(LS_ACTIVE) === '1'); } catch { /* private mode */ }
  }, []);
  const setActive = useCallback((v) => {
    setActiveRaw(v);
    try { localStorage.setItem(LS_ACTIVE, v ? '1' : '0'); } catch { /* private mode */ }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setReports((await inspectionApi.list()).reports || []);
      notifySheetsChanged();
    } catch { /* not signed in yet */ }
  }, []);

  useEffect(() => {
    if (!active) return;
    void refresh();
    // the tab names come from the live inventory — the same source that knows
    // every sub-page, so a tab added tomorrow is named here with no edit
    inspectionApi.inventory().then((inv) => {
      const m = {};
      for (const p of inv.pages || []) {
        for (const t of p.tabs || []) m[`${p.path}|${t.id}`] = t.label;
      }
      setTabLabels(m);
    }).catch(() => {});
  }, [active, refresh]);

  const arm = useCallback(() => setArmed(true), []);

  // Alt is the other way in; Escape always gets out.
  useEffect(() => {
    if (!active) return undefined;
    const down = (e) => {
      if (e.key === 'Alt' && !spot) setArmed(true);
      if (e.key === 'Escape') { setArmed(false); setRect(null); setSpot(null); setPicked([]); }
    };
    const up = (e) => { if (e.key === 'Alt' && !start.current) setArmed(false); };
    window.addEventListener('keydown', down, true);
    window.addEventListener('keyup', up, true);
    return () => {
      window.removeEventListener('keydown', down, true);
      window.removeEventListener('keyup', up, true);
    };
  }, [active, spot]);

  const onDown = (e) => {
    start.current = { x: e.clientX, y: e.clientY };
    setRect({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
  };
  const onMove = (e) => {
    const s = start.current;
    if (!s) return;
    setRect({ x: Math.min(s.x, e.clientX), y: Math.min(s.y, e.clientY),
              w: Math.abs(e.clientX - s.x), h: Math.abs(e.clientY - s.y) });
  };

  /** Render the covered region — labelled as a render, never as a photo. */
  const renderRegion = useCallback(async (sp) => {
    if (!sp) return;
    setShooting(true);
    try {
      const { toJpeg } = await import('html-to-image');
      const el = pageElementsAt(sp.rect.x + sp.rect.w / 2, sp.rect.y + sp.rect.h / 2)[0];
      const surface = el?.closest?.('[data-report-surface]') || document.querySelector('[data-report-surface]');
      if (!el || !surface) return;
      // the largest ancestor of the box that is affordable to rasterise — a
      // 20-megapixel page or a 9000-node subtree can freeze or kill the tab
      const tgt = boundedCaptureTarget(captureChain(el, surface), (n) => ({
        w: n.offsetWidth, h: n.offsetHeight, nodes: n.querySelectorAll('*').length,
      }));
      if (!tgt) {
        setShot(null);
        toast('این صفحه برای تصویربرداریِ خودکار سنگین است — اسکرین‌شاتِ خودت را Ctrl+V کن', 'info', 7000);
        return;
      }
      const ratio = captureRatio({ w: tgt.offsetWidth, h: tgt.offsetHeight });
      // JPEG needs a background (transparent → black negative) and `margin: 0`
      // (a centred element's auto margins shifted every mark by ~36px)
      const data = await withDeadline(toJpeg(tgt, {
        quality: 0.82, pixelRatio: ratio, cacheBust: true, backgroundColor: '#ffffff',
        style: { margin: '0' },
      }), CAPTURE_DEADLINE_MS);
      if (!data) {
        setShot(null);
        toast('تصویرِ خودکار گرفته نشد — اسکرین‌شاتِ خودت را Ctrl+V کن', 'info', 7000);
        return;
      }
      let out = data;
      try {
        const tr = tgt.getBoundingClientRect();
        const probe = new Image();
        await new Promise((res, rej) => { probe.onload = res; probe.onerror = rej; probe.src = data; });
        const geom = { left: tr.left, top: tr.top, width: tr.width, height: tr.height,
                       layoutWidth: tgt.offsetWidth, layoutHeight: tgt.offsetHeight };
        const image = { width: probe.naturalWidth, height: probe.naturalHeight };
        const box = boxInImage(sp.rect, geom, image);
        if (box) out = await annotate(data, box, bandAround(box, image, window.innerHeight));
      } catch { /* marking failed — keep the plain capture rather than lose it */ }
      out = await shrinkShot(out);
      // a pasted screenshot always wins over a render
      setShot((prev) => (prev?.kind === 'pasted' ? prev : { data: out, kind: 'rendered' }));
    } catch {
      toast('تصویربرداری از این بخش ممکن نشد — می‌توانی اسکرین‌شاتِ خودت را بچسبانی', 'info', 7000);
    } finally {
      setShooting(false);
    }
  }, []);

  const onUp = () => {
    const s = start.current;
    start.current = null;
    const r = rect;
    setRect(null);
    setArmed(false);
    if (!s || !r || r.w < CROP_MIN_PX || r.h < CROP_MIN_PX) return;
    const stack = pageElementsAt(r.x + r.w / 2, r.y + r.h / 2);
    const anchor = stack[0] ?? null;
    const anchorPath = verifiedSelector(anchor);
    const ab = anchor?.getBoundingClientRect();
    const sx = window.scrollX || 0;
    const sy = window.scrollY || 0;
    const geometry = measureSpot({
      rect: r,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      scroll: { x: sx, y: sy },
      docSize: {
        w: Math.max(document.documentElement.scrollWidth, window.innerWidth),
        h: Math.max(document.documentElement.scrollHeight, window.innerHeight),
      },
      dpr: window.devicePixelRatio || 1,
      anchorRect: ab ? { x: ab.left + sx, y: ab.top + sy, w: ab.width, h: ab.height } : null,
      anchorPath,
    });
    const resolved = resolveSpot({
      rect: r, viewport: { w: window.innerWidth, h: window.innerHeight }, stack, geometry,
      location,
      tabLabel: (tab) => {
        const pattern = anchor?.closest?.('[data-report-surface]')?.getAttribute('data-report-surface');
        return tabLabels[`${pattern}|${tab}`] || '';
      },
    });
    setSpot(resolved);
    setText('');
    setShot(null);
    // capture AT ONCE, while the owner types — a picture that depends on a second
    // press is missing exactly when it matters (ALLIN1 v154)
    void renderRegion(resolved);
  };

  /** A real screenshot from the owner's own OS — the best evidence. */
  const onPaste = useCallback((e) => {
    const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith('image/'));
    const file = item?.getAsFile();
    if (!file) return;
    e.preventDefault();
    const fr = new FileReader();
    fr.onload = () => {
      const raw = String(fr.result || '');
      setShot({ data: raw, kind: 'pasted' });
      void shrinkShot(raw).then((small) => {
        if (small !== raw) setShot((prev) => (prev?.data === raw ? { data: small, kind: 'pasted' } : prev));
      });
    };
    fr.readAsDataURL(file);
  }, []);

  // only sheets still in play are offered — a ticked or archived conversation is over
  const openSheets = useMemo(
    () => reports.filter((r) => r.status === 'open' || r.status === 'answered'), [reports]);

  const close = () => { setSpot(null); setPicked([]); setTarget(''); setText(''); setShot(null); };

  const submit = async () => {
    if (!spot || !text.trim() || busy) return;
    setBusy(true);
    try {
      const under = target && openSheets.some((r) => r.id === target) ? target : '';
      const rep = under
        ? openSheets.find((r) => r.id === under)
        : (await inspectionApi.create({ text: text.trim(), spot, shot: shot?.data })).report;
      // each sample is its own request: one failure loses neither the sheet nor
      // the other files, and the owner is told exactly which one did not go up
      const failed = [];
      const uploaded = [];
      for (const f of picked) {
        try {
          setUpPct({ name: f.name, pct: 0 });
          const up = await inspectionApi.upload(rep.id, f, {
            onProgress: (pct) => setUpPct({ name: f.name, pct }),
          });
          if (up?.file?.id) uploaded.push(up.file.id);
        } catch (e) { failed.push(`${f.name} (${apiError(e)})`); }
      }
      setUpPct(null);
      if (under) {
        // the follow-up carries its OWN box and picture, and claims only the
        // files uploaded with it — the parent's samples stay the parent's
        await inspectionApi.note(under, { text: text.trim(), shot: shot?.data, spot, file_ids: uploaded });
      }
      if (failed.length) {
        toast.error(`${under ? 'یادداشت' : 'گزارش'} ثبت شد ولی این فایل‌ها بالا نرفتند: ${failed.join(' · ')}`);
      } else if (under) {
        toast.success(`ذیلِ گزارشِ ${rep.number} ثبت شد — آن برگه دوباره نارنجی (بازِ رسیدگی) شد`);
      } else {
        toast.success(picked.length
          ? `گزارشِ ${rep.number} با ${picked.length} فایل ثبت شد — ناظر باید کاملشان را بخواند`
          : `گزارشِ ${rep.number} ثبت شد — ناظر در دورِ بعد جواب می‌دهد`);
      }
      close();
      await refresh();
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setBusy(false);
      setUpPct(null);
    }
  };

  const value = useMemo(() => ({ active, setActive, arm, reports, refresh }),
    [active, setActive, arm, reports, refresh]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <Toasts />
      {active && !spot && (
        <button
          type="button"
          onClick={arm}
          data-inspection-layer="1"
          data-testid="inspection-arm"
          className="fixed bottom-5 left-5 z-[80] rounded-full bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-amber-700"
          title="یک کادر دورِ همان چیزی بکش که ایراد دارد (یا کلید Alt را نگه دار و بکش)"
        >
          📝 ثبت گزارش
        </button>
      )}
      {armed && (
        <div
          dir="rtl"
          data-inspection-layer="1"
          className="fixed inset-0 z-[90]"
          style={{ cursor: 'crosshair', background: 'rgba(15,12,8,0.18)' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
        >
          {rect && rect.w > 2 && (
            <div className="pointer-events-none absolute border-2 border-amber-400 bg-amber-200/10"
              style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} />
          )}
          <div className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-lg bg-black/85 px-4 py-2 text-sm text-amber-100">
            دورِ همان چیز کادر بکش · Esc انصراف
          </div>
        </div>
      )}
      {spot && (
        <div
          dir="rtl"
          data-inspection-layer="1"
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-2xl max-h-[92vh] overflow-y-auto"
            data-testid="inspection-compose">
            <div className="mb-2 text-sm font-bold text-gray-900">گزارشِ نظارت و سرکشی</div>
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900">
              <div className="font-semibold">{spotAddress(spot)}</div>
              <div className="mt-1 text-amber-800" dir="ltr">{spot.reopen}</div>
              {!!spot.covered_text && (
                <div className="mt-1 line-clamp-3 text-amber-700">آنچه در کادر بود: {spot.covered_text}</div>
              )}
              {!!spot.geometry && (
                <div className="mt-1 text-amber-800">
                  مختصات: {geometryLabel(spot.geometry)}
                  {spot.geometry.anchor.path
                    ? ' · به عنصرِ زیرش گره خورد (با تغییرِ چیدمان هم سرِ جایش می‌ماند)'
                    : ' · گره به عنصر ممکن نشد — فقط مختصاتِ سند ذخیره می‌شود'}
                </div>
              )}
            </div>

            {openSheets.length > 0 && (
              <div className="mb-2">
                <label className="mb-1 block text-[11px] font-semibold text-gray-700" htmlFor="ins-target">
                  این را کجا ثبت کنم؟
                </label>
                <select
                  id="ins-target"
                  data-testid="inspection-target"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">گزارشِ جدید</option>
                  {openSheets.map((r) => (
                    <option key={r.id} value={r.id}>
                      ذیلِ گزارشِ {r.number} — {(r.title || '').slice(0, 48)}
                      {r.status === 'answered' ? ' (پاسخ گرفته)' : ''}
                    </option>
                  ))}
                </select>
                {!!target && (
                  <div className="mt-1 text-[11px] text-amber-800">
                    ذیلِ آن برگه ثبت می‌شود، با کادر و تصویرِ خودش؛ فایل‌هایی که اینجا پیوست کنی فقط مالِ
                    همین یادداشت‌اند و با پیوست‌های قبلی قاتی نمی‌شوند. آن برگه دوباره «بازِ رسیدگی» (نارنجی) می‌شود.
                  </div>
                )}
              </div>
            )}

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPaste={onPaste}
              rows={4}
              autoFocus
              data-testid="inspection-text"
              placeholder="چه ایرادی دارد، یا چه می‌خواهی؟ (اسکرین‌شاتِ خودت را می‌توانی همین‌جا Ctrl+V کنی)"
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-600 hover:border-amber-400 hover:bg-amber-50/40">
              <span>📎 فایل پیوست کن (هر نوعی — ورد، PDF، عکس، اکسل، صوت، زیپ…)</span>
              <input
                type="file"
                multiple
                className="hidden"
                data-testid="inspection-files"
                onChange={(e) => {
                  const list = Array.from(e.target.files || []);
                  if (list.length) setPicked((prev) => [...prev, ...list]);
                  e.target.value = '';
                }}
              />
            </label>
            {!!picked.length && (
              <div className="mt-1.5 space-y-1">
                {picked.map((f, i) => (
                  <div key={`${f.name}-${i}`} dir="rtl"
                    className="flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 text-[11px] text-gray-700">
                    <span className="truncate">{f.name}</span>
                    <span className="text-gray-400">{(f.size / (1024 * 1024)).toFixed(1)} مگابایت</span>
                    <span className="flex-1" />
                    <button type="button" title="برداشتن" className="text-red-600 hover:underline"
                      onClick={() => setPicked((prev) => prev.filter((_, j) => j !== i))}>×</button>
                  </div>
                ))}
                <div className="text-[11px] text-emerald-700">
                  ناظر موظف است محتوای کاملِ این فایل‌ها را بخواند — تا نخواند نمی‌تواند برگه را جواب بدهد.
                </div>
              </div>
            )}
            {upPct && (
              <div dir="rtl" className="mt-1.5 text-[11px] text-amber-800">
                در حالِ بالا رفتن: {upPct.name} — {upPct.pct}٪
              </div>
            )}

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <button type="button" onClick={() => void renderRegion(spot)} disabled={shooting}
                className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-50 disabled:opacity-50">
                {shooting ? '… در حالِ گرفتنِ تصویر' : '📷 گرفتنِ دوبارهٔ تصویر'}
              </button>
              {shot && (
                <img src={shot.data} alt="پیش‌نمایشِ تصویر" className="h-12 w-auto rounded border border-gray-300" />
              )}
              {shot && (
                <span className={`text-[11px] ${shot.kind === 'pasted' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {shot.kind === 'pasted'
                    ? '✓ اسکرین‌شاتِ واقعیِ خودت پیوست شد'
                    : '⚠ تصویرِ بازسازی‌شده با کادرِ تو علامت‌خورده (عکسِ واقعی نیست) — اگر دقیق نبود اسکرین‌شاتِ خودت را Ctrl+V کن'}
                </span>
              )}
              {shooting && !shot && (
                <span className="text-[11px] text-gray-600">تصویر در حالِ گرفته‌شدن است… می‌توانی هم‌زمان بنویسی</span>
              )}
              <span className="flex-1" />
              <button type="button" onClick={close}
                className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">انصراف</button>
              <button type="button" onClick={() => void submit()}
                disabled={busy || shooting || !text.trim()}
                data-testid="inspection-submit"
                title={shooting ? 'تا آماده‌شدنِ تصویر صبر کن' : ''}
                className="rounded-lg bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
                {busy ? '…' : shooting ? 'تصویر…' : (target ? 'ثبت ذیلِ گزارش' : 'ثبت گزارش')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

/** The announcements, wherever they come from. Its own dir="rtl" — the text
 *  mixes Persian with numbers and file names (the project's bidi rule). */
function Toasts() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const on = (e) => {
      const t = e.detail;
      setItems((prev) => [...prev.slice(-3), t]);
      window.setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), t.ms || 5000);
    };
    window.addEventListener(TOAST_EVT, on);
    return () => window.removeEventListener(TOAST_EVT, on);
  }, []);
  if (!items.length) return null;
  const tone = { success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
                 error: 'border-red-300 bg-red-50 text-red-900',
                 info: 'border-gray-300 bg-white text-gray-800' };
  return (
    <div dir="rtl" data-inspection-layer="1" className="fixed bottom-20 left-5 z-[100] flex max-w-sm flex-col gap-2">
      {items.map((t) => (
        <div key={t.id} role="status" className={`rounded-lg border px-3 py-2 text-xs shadow-lg ${tone[t.kind] || tone.info}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

/** The 📝 switch, in the header beside the bell. */
export function InspectionToggle() {
  const ins = useInspection();
  if (!ins) return null;
  return (
    <button
      type="button"
      data-testid="inspection-toggle"
      onClick={() => ins.setActive(!ins.active)}
      title={ins.active
        ? 'نظارت و سرکشی روشن است — کادر بکش تا گزارش ثبت شود (یا Alt را نگه دار)'
        : 'نظارت و سرکشی: ایراد و پیشنهاد را همان‌جا که می‌بینی ثبت کن'}
      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-sm transition ${
        ins.active ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-400' : 'text-gray-500 hover:text-gray-700'}`}
    >
      <span>📝</span>
      <span className="hidden sm:inline text-xs">{ins.active ? 'نظارت روشن' : 'نظارت'}</span>
    </button>
  );
}
