/**
 * «نظارت و سرکشی» — the whole board.
 *
 * Every sheet the owner filed (from a box on a page, or as a «درخواستِ عمومی»),
 * what the supervisor routine answered under it, the dependency walk behind
 * that answer, the files and whether the supervisor actually READ them, and the
 * owner's tick. Ported from ALLIN1's `/inspection` page (read-only reference),
 * with the owner's Lifemanager asks on top:
 *
 *   • «بشه ذیل هر گزارش دوباره چیزی ثبت کرد و فایل متعلق به اون ثبت جدید الصاق کرد»
 *     → the follow-up form under every sheet takes its own files + screenshot,
 *       claimed by THAT note only;
 *   • «رنگ ها با ثبت درخواست و گزارش جدید تغییر کنه» → a follow-up sends the
 *     sheet back to amber, the board says so, and the page highlights repaint;
 *   • «وقتی تایید مالک میشه روتین بعدی دوره‌ای بایگانی کنه» → ✓ تأیید makes it
 *     blue; the next round (urgent or full) files it into a binder;
 *   • «همه صفحات و زیر صفحات … رو بشناسه و ثبت کنه» → the «نقشهٔ صفحه‌ها» tab,
 *     derived live from the app's own registries.
 *
 * The colour of a sheet is WHOSE TURN it is; the supervisor's verdict (fixed /
 * partial / needs-owner / not-done) is a separate word — a reply is never
 * mistaken for a fix.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import {
  HL_DEFAULT_OPACITY, OUTCOME_BG, STATUS_LABEL, TONE_BG, apiError, authedObjectUrl,
  inspectionApi, notifySheetsChanged, readHighlightOpacity, readHighlightsEnabled,
  writeHighlightOpacity, writeHighlightsEnabled,
} from '../lib/inspection/api';
import { everyText, fa, humanGap, localClock, rushMessage } from '../lib/inspection/nextRound';
import { shrinkShot } from '../lib/inspection/shots';
import { geometryLabel } from '../lib/inspection/spot';
import { toast } from '../lib/inspection/toast';
import { MINI_APPS_EVT, miniAppsApi } from '../lib/miniApps';

// The page's own sub-pages — in the `TABS` convention, so the live inventory
// (and the supervisor) discover them exactly like every other hub's tabs.
const TABS = [
  { id: 'board', label: 'کارتابل' },
  { id: 'pages', label: 'نقشهٔ صفحه‌ها و زیرصفحه‌ها' },
  { id: 'binders', label: 'زونکن‌ها (بایگانی)' },
  { id: 'how', label: 'روتین‌ها و راهنما' },
];

const FILTERS = [
  { key: '', label: 'همهٔ باز‌ها' },
  { key: 'open', label: 'در انتظارِ ناظر' },
  { key: 'answered', label: 'ناظر پاسخ داد' },
  { key: 'approved', label: 'تأییدشده' },
  { key: 'filed', label: 'بایگانی' },
  { key: 'all', label: 'همه' },
];

const PAGE_SIZES = [5, 10, 20, 50, 100];

export default function InspectionPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'board';
  const setTab = (id) => setParams(id === 'board' ? {} : { tab: id });

  return (
    <div dir="rtl" className="p-4 md:p-6 max-w-6xl mx-auto space-y-4" data-testid="inspection-page">
      <div className="flex items-center gap-2 flex-wrap border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            data-testid={`inspection-tab-${t.id}`}
            className={`px-3 py-2 text-sm -mb-px border-b-2 ${tab === t.id
              ? 'border-amber-600 text-amber-800 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'board' && <Board />}
      {tab === 'pages' && <PagesMap />}
      {tab === 'binders' && <Binders />}
      {tab === 'how' && <HowItWorks />}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// کارتابل
// ────────────────────────────────────────────────────────────────────────────
function Board() {
  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({});
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [rounds, setRounds] = useState(null);
  const [tick, setTick] = useState(0);
  const [generalOpen, setGeneralOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [done, setDone] = useState([]);
  const seen = useRef({});

  useEffect(() => {
    try {
      const v = Number(localStorage.getItem('lm.inspection.pageSize'));
      if (PAGE_SIZES.includes(v)) setPageSize(v);
    } catch { /* default stays */ }
  }, []);
  useEffect(() => { setPage(1); }, [filter, pageSize]);

  const query = useCallback(() => {
    if (filter === 'all') return { include_filed: true };
    if (filter) return { status: filter };
    return {};
  }, [filter]);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const d = await inspectionApi.list(query());
      setReports(d.reports || []);
      setCounts(d.counts || {});
      // every action here changes a colour on some page — tell the highlights
      notifySheetsChanged();
      try { setRounds(await inspectionApi.rounds()); } catch { /* the countdown is a courtesy */ }
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setBusy(false);
    }
  }, [query]);
  useEffect(() => { void load(); }, [load]);

  // a countdown is only true while it moves
  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => window.clearInterval(t);
  }, []);

  // ⚡ WATCH THE FAST QUEUE and say what happened — polling only while something
  // is actually rushed (an idle board must not poll forever).
  const watching = useMemo(() => reports.filter((r) => r.urgent).map((r) => r.id).join(','), [reports]);
  useEffect(() => {
    for (const r of reports) {
      if (r.urgent || r.urgent_done_at) seen.current[r.id] = `${r.status}|${r.notes?.length || 0}`;
    }
  }, [reports]);
  useEffect(() => {
    if (!watching) return undefined;
    let alive = true;
    const poll = async () => {
      try {
        const d = await inspectionApi.list(query());
        if (!alive) return;
        const changed = [];
        for (const r of d.reports || []) {
          const before = seen.current[r.id];
          const now = `${r.status}|${r.notes?.length || 0}`;
          if (before && before !== now && (r.urgent_done_at || r.status === 'answered')) {
            changed.push({ number: r.number, title: r.title || '', label: r.glow?.outcome_label || r.glow?.label });
          }
          seen.current[r.id] = now;
        }
        setReports(d.reports || []);
        setCounts(d.counts || {});
        if (changed.length) { setDone((prev) => [...changed, ...prev].slice(0, 5)); notifySheetsChanged(); }
      } catch { /* offline — next tick tries again */ }
    };
    const t = window.setInterval(poll, 20_000);
    const onFocus = () => void poll();
    window.addEventListener('focus', onFocus);
    return () => { alive = false; window.clearInterval(t); window.removeEventListener('focus', onFocus); };
  }, [watching, query]);

  const pageCount = Math.max(1, Math.ceil(reports.length / pageSize));
  const cur = Math.min(page, pageCount);
  const shown = reports.slice((cur - 1) * pageSize, cur * pageSize);

  const tiles = [
    ['open', 'در انتظارِ ناظر', 'border-amber-200 bg-amber-50 text-amber-800'],
    ['answered', 'ناظر پاسخ داد', 'border-emerald-200 bg-emerald-50 text-emerald-800'],
    ['approved', 'تأییدِ تو — دورِ بعد بایگانی', 'border-blue-200 bg-blue-50 text-blue-800'],
    ['filed', 'بایگانی‌شده', 'border-gray-200 bg-gray-50 text-gray-700'],
  ];

  return (
    <div className="space-y-4">
      {!!done.length && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-900">
          <div className="flex items-start gap-2">
            <span className="text-lg leading-none">⚡</span>
            <div className="flex-1">
              <div className="font-semibold">ناظر روی موردهای فوری کار کرد:</div>
              <ul className="mt-1 space-y-0.5">
                {done.map((d) => (
                  <li key={`${d.number}-${d.label}`}>گزارشِ {fa(d.number)}{d.title ? ` — ${d.title}` : ''}
                    <span className="text-emerald-700"> · {d.label}</span></li>
                ))}
              </ul>
              <div className="mt-1 text-[11px] text-emerald-700">صفحه خودش به‌روز شد — بازش کن و ببین.</div>
            </div>
            <button type="button" onClick={() => setDone([])} className="rounded px-1 text-emerald-700 hover:bg-emerald-100">×</button>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">نظارت و سرکشی</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            ایراد و پیشنهادی که خودت روی صفحه‌ها ثبت کرده‌ای، و آنچه ناظر زیرش نوشته. برای گزارشِ تازه
            دکمهٔ 📝 بالای صفحه را روشن کن و دورِ همان چیز کادر بکش (یا Alt را نگه دار و بکش). برای چیزی که
            جای مشخصی ندارد، «درخواستِ عمومی» بزن.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {rounds?.urgent && <RoundChip kind="urgent" nr={rounds.urgent} tick={tick} />}
          {rounds?.full && <RoundChip kind="full" nr={rounds.full} tick={tick} />}
          <button type="button" onClick={() => setGeneralOpen((o) => !o)} data-testid="inspection-general-toggle"
            className="rounded-lg bg-gray-900 text-white px-3 py-1.5 text-sm hover:bg-gray-800">＋ درخواستِ عمومی</button>
          <button type="button" onClick={() => void load()} disabled={busy}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-60">
            {busy ? '…' : '↻ تازه‌سازی'}
          </button>
        </div>
      </div>

      {generalOpen && <GeneralRequest onDone={() => { setGeneralOpen(false); void load(); }} />}

      <StorageLine />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map(([k, label, cls]) => (
          <button type="button" key={k} onClick={() => setFilter(k)}
            className={`rounded-xl border p-3 text-center ${cls} ${filter === k ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}>
            <div className="text-2xl font-bold">{fa(counts[k] || 0)}</div>
            <div className="text-[11px]">{label}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {FILTERS.map((f) => (
          <button key={f.key || 'live'} type="button" onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1 text-xs ${filter === f.key
              ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {f.label}
          </button>
        ))}
        <HighlightPrefs />
      </div>

      {!reports.length && !busy && (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
          برگه‌ای اینجا نیست. 📝 بالای صفحه را روشن کن، برو هر جای برنامه که ایراد یا خواسته‌ای دیدی، و دورش کادر بکش.
        </div>
      )}

      {reports.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
          <label className="flex items-center gap-1">
            تعداد در هر صفحه
            <select value={pageSize} className="border border-gray-300 rounded px-1 py-[2px]"
              onChange={(e) => {
                const v = Number(e.target.value);
                setPageSize(v);
                try { localStorage.setItem('lm.inspection.pageSize', String(v)); } catch { /* ignore */ }
              }}>
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <span>· {fa(reports.length)} برگه · صفحهٔ {fa(cur)} از {fa(pageCount)}</span>
          <button type="button" disabled={cur <= 1} onClick={() => setPage(cur - 1)}
            className="rounded border border-gray-300 px-2 py-[2px] disabled:opacity-40">قبلی</button>
          <button type="button" disabled={cur >= pageCount} onClick={() => setPage(cur + 1)}
            className="rounded border border-gray-300 px-2 py-[2px] disabled:opacity-40">بعدی</button>
        </div>
      )}

      <div className="space-y-3">
        {shown.map((r) => (
          <SheetCard key={r.id} r={r} expanded={openId === r.id}
            onToggle={() => setOpenId(openId === r.id ? null : r.id)} reload={load} />
        ))}
      </div>
    </div>
  );
}

/** «⚡ دورِ بعدیِ ناظر: ۱۰:۵۳ (۴۲ دقیقهٔ دیگر)» — on the owner's own clock. */
function RoundChip({ kind, nr, tick }) {
  void tick;
  const left = Math.round((new Date(nr.at).getTime() - Date.now()) / 60000);
  const name = kind === 'urgent' ? 'صفِ فوری' : 'بازرسیِ کامل';
  const icon = kind === 'urgent' ? '⚡' : '🔎';
  if (nr.basis === 'stale') {
    return (
      <span dir="rtl" title={`آخرین دور: ${localClock(nr.last_seen || nr.at)}`}
        className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-800">
        {icon} {name} مدتی است سر نزده — روتینش را بررسی کن
      </span>
    );
  }
  if (nr.basis === 'due' || left <= 0) {
    return (
      <span dir="rtl" className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
        {icon} {name} ({localClock(nr.at)}) در راه است — هر لحظه می‌رسد
      </span>
    );
  }
  const hint = kind === 'urgent'
    ? (nr.basis === 'assumed' ? 'تخمینی — هنوز دوری ثبت نشده' : `${everyText(nr.every_minutes)} · آخرین دور: ${localClock(nr.last_seen || nr.at)}`)
    : `زمان‌بندی ${nr.schedule} (UTC)${nr.last_seen ? ` · آخرین دور: ${localClock(nr.last_seen)}` : ''}`;
  return (
    <span dir="rtl" title={hint} data-testid={`inspection-round-${kind}`}
      className={`rounded-lg border px-2.5 py-1.5 text-xs ${kind === 'urgent'
        ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-sky-200 bg-sky-50 text-sky-800'}`}>
      {icon} {name}: {localClock(nr.at)} ({humanGap(left)}){nr.basis === 'assumed' ? ' — تخمینی' : ''}
    </span>
  );
}

/** Show/hide the page highlights and their strength — this viewer only. */
/** Where the sheets' files and pictures live — the project's Drive folder —
 *  and what is still waiting in the database (moved by the supervisor's round,
 *  or right now with the button). */
function StorageLine() {
  const [st, setSt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const load = useCallback(() => { inspectionApi.storage().then(setSt).catch(() => setSt(null)); }, []);
  useEffect(() => { load(); }, [load]);
  if (!st) return null;
  const waiting = (st.files?.db || 0) + (st.files?.local || 0) + (st.shots?.db || 0);
  const move = async () => {
    setBusy(true); setMsg('');
    try {
      const r = await inspectionApi.offload();
      setMsg(r.drive ? `${fa(r.files_moved)} فایل و ${fa(r.shots_moved)} تصویر به درایو رفت`
        + (r.failed?.length ? ` — ${fa(r.failed.length)} مورد نشد` : '') : (r.reason || 'درایو در دسترس نیست'));
      load();
    } catch (e) { setMsg(apiError(e)); } finally { setBusy(false); }
  };
  return (
    <div dir="rtl" data-testid="inspection-storage"
      className={`rounded-lg border px-3 py-2 text-xs flex flex-wrap items-center gap-2 ${st.drive?.connected
        ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
      {st.drive?.connected ? (
        <span>
          📁 فایل‌ها و تصویرها در گوگل درایو، پوشهٔ{' '}
          <a href={st.drive.folder_link} target="_blank" rel="noreferrer" className="underline font-medium">
            <span dir="ltr">LifeManagerData/inspection</span>
          </a>{' '}
          — هر گزارش زیرپوشهٔ خودش را دارد ({fa(st.files?.drive || 0)} فایل، {fa(st.shots?.drive || 0)} تصویر).
        </span>
      ) : (
        <span>⚠ درایو الان در دسترس نیست ({st.drive?.reason}) — فایل‌ها موقتاً در پایگاه‌داده می‌مانند و بعد منتقل می‌شوند.</span>
      )}
      {waiting > 0 && (
        <>
          <span>· {fa(waiting)} مورد هنوز در پایگاه‌داده</span>
          {st.drive?.connected && (
            <button type="button" disabled={busy} onClick={() => void move()} data-testid="inspection-offload"
              className="rounded border border-current px-2 py-0.5 hover:bg-white/60 disabled:opacity-60">
              {busy ? '…' : 'انتقال به درایو'}
            </button>
          )}
        </>
      )}
      {msg && <span className="text-gray-700">{msg}</span>}
    </div>
  );
}

function HighlightPrefs() {
  const [on, setOn] = useState(true);
  const [op, setOp] = useState(HL_DEFAULT_OPACITY);
  useEffect(() => { setOn(readHighlightsEnabled()); setOp(readHighlightOpacity()); }, []);
  return (
    <div className="ms-auto flex items-center gap-2 text-[11px] text-gray-600"
      title="هر جا گزارشی ثبت کرده‌ای، یک هایلایتِ شفاف دقیقاً روی همان کادر و به رنگِ وضعیتش دیده می‌شود. کلیک‌های زیرش مثلِ قبل کار می‌کنند.">
      <label className="flex items-center gap-1">
        <input type="checkbox" checked={on} onChange={(e) => { setOn(e.target.checked); writeHighlightsEnabled(e.target.checked); }} />
        هایلایت روی صفحه‌ها
      </label>
      <input type="range" min="0.04" max="0.9" step="0.02" value={op} disabled={!on} aria-label="پررنگیِ هایلایت"
        onChange={(e) => { const v = Number(e.target.value); setOp(v); writeHighlightOpacity(v); }} />
      <span className="flex items-center gap-1">
        <i className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500" />منتظرِ ناظر
        <i className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-600 ms-2" />پاسخ داد
        <i className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-600 ms-2" />تأییدِ تو
      </span>
    </div>
  );
}

/** «درخواستِ عمومی» — for what points at no place on screen, or at one not
 *  built yet (a new feature, a general change, a question). Same queue. */
function GeneralRequest({ onDone }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [shot, setShot] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(null);
  const submit = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const { report } = await inspectionApi.create({ text: text.trim(), shot: shot || undefined });
      const failed = [];
      for (const f of files) {
        try {
          setPct({ name: f.name, pct: 0 });
          await inspectionApi.upload(report.id, f, { onProgress: (p) => setPct({ name: f.name, pct: p }) });
        } catch (e) { failed.push(`${f.name} (${apiError(e)})`); }
      }
      setPct(null);
      if (failed.length) toast.error(`درخواست ثبت شد ولی این فایل‌ها بالا نرفتند: ${failed.join(' · ')}`);
      else toast.success(`درخواستِ ${fa(report.number)} ثبت شد و در صفِ ناظر است`);
      onDone();
    } catch (e) { toast.error(apiError(e)); } finally { setBusy(false); setPct(null); }
  };
  return (
    <div className="rounded-xl border border-gray-300 bg-white p-4 space-y-2" data-testid="inspection-general">
      <div className="text-sm font-semibold text-gray-800">درخواستِ عمومی</div>
      <p className="text-xs text-gray-500">
        برای چیزی که به جای مشخصی از صفحه‌ها اشاره نمی‌کند، یا جایی برایش هنوز ساخته نشده (قابلیتِ تازه، تغییرِ
        کلی، سؤال). مثلِ بقیهٔ برگه‌ها در صفِ ناظر می‌رود و همین‌جا پیگیری می‌شود.
      </p>
      <textarea value={text} dir="auto" rows={4} autoFocus onChange={(e) => setText(e.target.value)}
        onPaste={(e) => pasteShot(e, setShot)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void submit(); }}
        placeholder="درخواستت را بنویس… (Ctrl+Enter برای ثبت · اسکرین‌شات را می‌توانی Ctrl+V کنی)"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" data-testid="inspection-general-text" />
      <FilePicker files={files} setFiles={setFiles} shot={shot} setShot={setShot} pct={pct} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">انصراف</button>
        <button type="button" onClick={() => void submit()} disabled={busy || !text.trim()} data-testid="inspection-general-submit"
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
          {busy ? 'در حال ثبت…' : 'ثبتِ درخواست'}
        </button>
      </div>
    </div>
  );
}

function pasteShot(e, setShot) {
  const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith('image/'));
  const file = item?.getAsFile();
  if (!file) return;
  e.preventDefault();
  const fr = new FileReader();
  fr.onload = () => { void shrinkShot(String(fr.result || '')).then(setShot); };
  fr.readAsDataURL(file);
}

/** Files of ANY type (no `accept` filter, on purpose) + an optional pasted shot. */
function FilePicker({ files, setFiles, shot, setShot, pct }) {
  return (
    <div className="space-y-1">
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-600 hover:border-amber-400 hover:bg-amber-50/40">
        <span>📎 فایل پیوست کن (هر نوعی — ورد، PDF، عکس، اکسل، صوت، زیپ…)</span>
        <input type="file" multiple className="hidden"
          onChange={(e) => { const l = Array.from(e.target.files || []); if (l.length) setFiles((p) => [...p, ...l]); e.target.value = ''; }} />
      </label>
      {files.map((f, i) => (
        <div key={`${f.name}-${i}`} dir="rtl" className="flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 text-[11px] text-gray-700">
          <span className="truncate">{f.name}</span>
          <span className="text-gray-400">{(f.size / (1024 * 1024)).toFixed(1)} مگابایت</span>
          <span className="flex-1" />
          <button type="button" className="text-red-600" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      {shot && (
        <div className="flex items-center gap-2 text-[11px] text-emerald-700">
          <img src={shot} alt="اسکرین‌شات" className="h-10 rounded border border-gray-300" />
          ✓ اسکرین‌شات پیوست شد
          <button type="button" className="text-red-600" onClick={() => setShot(null)}>×</button>
        </div>
      )}
      {pct && <div dir="rtl" className="text-[11px] text-amber-800">در حالِ بالا رفتن: {pct.name} — {fa(pct.pct)}٪</div>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// One sheet
// ────────────────────────────────────────────────────────────────────────────
function SheetCard({ r, expanded, onToggle, reload }) {
  const lastReviewer = [...(r.notes || [])].reverse().find((n) => n.by === 'reviewer');
  const filed = r.status === 'filed';

  const act = async (fn, ok) => {
    try { const res = await fn(); if (ok) toast.success(typeof ok === 'function' ? ok(res) : ok); await reload(); }
    catch (e) { toast.error(apiError(e)); }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4" data-testid={`inspection-sheet-${r.number}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`rounded px-2 py-[2px] text-[11px] text-white ${TONE_BG[r.status] || 'bg-gray-500'}`}>
              {r.glow?.label || STATUS_LABEL[r.status]}
            </span>
            {!!r.glow?.outcome && (
              <span className={`rounded px-2 py-[2px] text-[11px] text-white ${OUTCOME_BG[r.glow.outcome] || 'bg-gray-500'}`}
                title="نتیجه‌ای که ناظر دربارهٔ کارِ خودش ثبت کرد">
                {r.glow.outcome_label}
              </span>
            )}
            <span className="text-sm font-semibold text-gray-900">گزارشِ {fa(r.number)} — {r.title}</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            {r.general ? '📨 درخواستِ عمومی' : `${r.page_label}${r.section_label ? ` ← ${r.section_label}` : ''}`}
            {!r.general && (
              <> · <Link to={r.reopen || r.page || '/'} className="text-blue-600 hover:underline">رفتن به همان‌جا ↗</Link></>
            )}
            {r.binder && <> · زونکنِ {fa(r.binder.number)}، برگهٔ {fa(r.binder.page)}</>}
            {' · '}{new Date(r.created_at).toLocaleString('fa-IR')}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {!filed && r.status !== 'approved' && (
            <button type="button" data-testid={`inspection-rush-${r.number}`}
              onClick={() => act(async () => (r.urgent ? inspectionApi.unrush(r.id) : inspectionApi.rush(r.id)),
                (res) => (r.urgent ? 'از صفِ فوری بیرون آمد' : rushMessage(res.position, res.next_round)))}
              title={r.urgent ? 'در صفِ فوری است — برای بیرون‌آوردن بزن' : 'ناظر خارج از نوبت (در دورِ بعدیِ صفِ فوری) سراغش برود'}
              className={`rounded-lg px-2.5 py-1 text-xs ${r.urgent
                ? 'bg-orange-600 text-white hover:bg-orange-700' : 'border border-orange-300 text-orange-700 hover:bg-orange-50'}`}>
              {r.urgent ? (r.urgent_in_progress ? '⚡ در دستِ ناظر' : '⚡ در صفِ فوری') : '⚡ فوری'}
            </button>
          )}
          {!!r.urgent_done_at && !r.urgent && (
            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">⚡ جواب گرفت</span>
          )}
          <button type="button" onClick={onToggle} className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-50">
            {expanded ? 'بستن' : 'جزئیات'}
          </button>
          {!filed && (
            <button type="button" data-testid={`inspection-approve-${r.number}`}
              onClick={() => act(() => inspectionApi.setStatus(r.id, r.status === 'approved' ? 'open' : 'approved'),
                r.status === 'approved' ? 'تأیید برداشته شد' : 'تأیید شد (آبی) — دورِ بعدِ ناظر بایگانی‌اش می‌کند')}
              title="تأیید — فقط دستِ توست"
              className={`rounded-lg px-2.5 py-1 text-xs ${r.status === 'approved'
                ? 'bg-blue-600 text-white' : 'border border-blue-300 text-blue-700 hover:bg-blue-50'}`}>
              ✓ {r.status === 'approved' ? 'تأییدشده' : 'تأیید'}
            </button>
          )}
          <button type="button" title="حذف"
            onClick={() => { if (window.confirm(`گزارشِ ${fa(r.number)} حذف شود؟`)) void act(() => inspectionApi.remove(r.id), 'حذف شد'); }}
            className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">🗑</button>
        </div>
      </div>

      {!expanded && lastReviewer && (
        <div className="mt-2 line-clamp-2 rounded-lg bg-gray-50 p-2 text-[12px] text-gray-700">🤖 {lastReviewer.text}</div>
      )}
      {expanded && <SheetDetail r={r} reload={reload} act={act} />}
    </div>
  );
}

function SheetDetail({ r, reload, act }) {
  const [editing, setEditing] = useState(null);
  const [peek, setPeek] = useState(null);
  const filed = r.status === 'filed';
  const notes = r.notes || [];

  const groups = useMemo(() => {
    const files = r.files || [];
    const own = files.filter((f) => !f.note_id);
    const byNote = new Map();
    for (const f of files) {
      if (f.note_id) byNote.set(f.note_id, [...(byNote.get(f.note_id) || []), f]);
    }
    return { own, byNote };
  }, [r.files]);

  const openPeek = async (f) => {
    setPeek({ file: f, text: '', loading: true });
    try {
      let out = '';
      let offset = 0;
      for (let guard = 0; guard < 400; guard++) {
        const got = await inspectionApi.fileText(f.id, offset);
        out += got.text;
        if (!got.has_more || got.next_offset === null) break;
        offset = got.next_offset;
      }
      setPeek({ file: f, text: out, loading: false });
    } catch (e) { toast.error(apiError(e)); setPeek(null); }
  };

  return (
    <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
      {!r.general && (
        <div className="rounded-lg bg-gray-50 p-2 text-[11px] text-gray-600 space-y-0.5">
          <div><b>نشانیِ دقیق:</b> <span dir="ltr">{r.reopen}</span></div>
          {!!r.drive_folder_link && (
            <div><b>پوشهٔ این گزارش در درایو:</b>{' '}
              <a href={r.drive_folder_link} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">باز کن ↗</a>
            </div>
          )}
          {!!r.geometry && (
            <>
              <div><b>مختصات و ابعاد:</b> {geometryLabel(r.geometry)}</div>
              <div><b>گره:</b>{' '}
                {r.geometry.anchor?.path
                  ? <span dir="ltr">{r.geometry.anchor.path}</span>
                  : 'به عنصری گره نخورد — فقط مختصاتِ سند'}</div>
            </>
          )}
          {!!r.dom_path && <div dir="ltr" className="text-gray-500">{r.dom_path}</div>}
          {!!r.covered_text && <div>آنچه در کادر بود: {r.covered_text}</div>}
        </div>
      )}

      {notes.map((n, i) => (
        <div key={n.id} className={`rounded-lg border p-2.5 ${n.by === 'reviewer'
          ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
          <div className="mb-1 flex items-center gap-2 text-[11px] flex-wrap">
            <b>{n.by === 'reviewer' ? '🤖 ناظر' : '👤 تو'}</b>
            <span className="text-gray-400">یادداشتِ {fa(i + 1)} · {new Date(n.at).toLocaleString('fa-IR')}</span>
            {n.outcome && (
              <span className={`rounded px-1.5 text-[10px] text-white ${OUTCOME_BG[n.outcome] || 'bg-gray-500'}`}>{n.outcome}</span>
            )}
            {n.by === 'owner' && !filed && editing?.noteId !== n.id && (
              <button type="button" title="ویرایشِ همین متن" className="text-gray-500 hover:text-gray-800"
                onClick={() => setEditing({ noteId: n.id, text: n.text })}>✏️</button>
            )}
            {!!n.edited_at && (
              <span className="text-[10px] text-gray-400" title={n.original_text ? `متنِ اول: ${n.original_text}` : ''}>ویرایش شد</span>
            )}
          </div>
          {editing?.noteId === n.id ? (
            <div>
              <textarea value={editing.text} rows={4} autoFocus className="w-full rounded-lg border border-gray-300 p-2 text-[12.5px]"
                onChange={(e) => setEditing({ noteId: n.id, text: e.target.value })} />
              <div className="mt-1 flex items-center gap-2">
                <button type="button" disabled={!editing.text.trim()}
                  onClick={() => act(async () => { await inspectionApi.editNote(r.id, n.id, editing.text.trim()); setEditing(null); },
                    'ویرایش ذخیره شد — متنِ اولیه هم نگه داشته شد')}
                  className="rounded-lg bg-gray-900 px-3 py-1 text-xs text-white disabled:opacity-50">ذخیرهٔ ویرایش</button>
                <button type="button" onClick={() => setEditing(null)} className="px-2 py-1 text-xs text-gray-600 hover:underline">انصراف</button>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-[12.5px] text-gray-800" dir="auto">{n.text}</div>
          )}
          {!!n.spot && i > 0 && (
            <div className="mt-1 text-[10.5px] text-amber-800">
              📍 این یادداشت کادرِ خودش را دارد: {n.spot.page_label}{n.spot.section_label ? ` ← ${n.spot.section_label}` : ''}
              {' · '}<Link to={n.spot.reopen || '/'} className="text-blue-600 hover:underline">رفتن ↗</Link>
            </div>
          )}
          {!!n.commits?.length && <div dir="ltr" className="mt-1 text-[10px] text-gray-500">{n.commits.join(' · ')}</div>}
          <div className="mt-2 flex gap-2 flex-wrap">
            {n.shot_id && <AuthedImage path={inspectionApi.shotUrl(n.shot_id)} caption={n.by === 'reviewer' ? 'تصویرِ ناظر' : 'چیزی که دیدی'} />}
            {n.after_shot_id && <AuthedImage path={inspectionApi.shotUrl(n.after_shot_id)} caption="بعد از کارِ ناظر" good />}
          </div>
          {!!groups.byNote.get(n.id)?.length && (
            <div className="mt-2 space-y-1">
              <div className="text-[10px] font-semibold text-sky-800">فایل‌های همین یادداشت</div>
              {groups.byNote.get(n.id).map((f) => <FileRow key={f.id} f={f} filed={filed} onPeek={openPeek} act={act} />)}
            </div>
          )}
        </div>
      ))}

      <div className="rounded-lg border border-sky-200 bg-sky-50/40 p-2.5">
        <div className="mb-1.5 text-[11px] font-semibold text-sky-900">📎 فایل‌های خودِ گزارش {groups.own.length ? `(${fa(groups.own.length)})` : ''}</div>
        {!groups.own.length && <div className="mb-1.5 text-[11px] text-gray-500">فایلی پیوست نشده. هر نوع فایلی می‌شود.</div>}
        <div className="space-y-1.5">
          {groups.own.map((f) => <FileRow key={f.id} f={f} filed={filed} onPeek={openPeek} act={act} />)}
        </div>
        {!filed && <AttachToSheet r={r} reload={reload} />}
        {!!r.read_debt?.length && (
          <div className="mt-1.5 rounded-md bg-amber-100/70 px-2 py-1 text-[11px] text-amber-900">
            ناظر تا این فایل‌ها را کامل نخواند نمی‌تواند برگه را جواب بدهد: {r.read_debt.map((d) => d.filename).join(' · ')}
          </div>
        )}
      </div>

      {!!r.dependencies?.length && (
        <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-2.5">
          <div className="mb-1 text-[11px] font-semibold text-purple-900">وابستگی‌هایی که ناظر بررسی کرد</div>
          <ul className="space-y-0.5 text-[11.5px]">
            {r.dependencies.map((d, i) => (
              <li key={i} className="flex gap-1.5">
                <span>{d.status === 'ok' ? '✅' : d.status === 'missing' ? '❌' : '⚠️'}</span>
                <span className="text-gray-800" dir="auto">{d.name}</span>
                {!!d.note && <span className="text-gray-500">— {d.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!filed && <FollowUp r={r} reload={reload} />}

      {peek && (
        <div dir="rtl" className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setPeek(null); }}>
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl">
            <div className="flex items-center gap-2 border-b border-gray-200 p-3">
              <span className="truncate text-sm font-bold text-gray-900">{peek.file.filename}</span>
              <span className="text-[11px] text-gray-500">{peek.file.size_label}</span>
              <span className="flex-1" />
              <button type="button" onClick={() => setPeek(null)} className="rounded px-2 hover:bg-gray-100">×</button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-3">
              {peek.loading ? <div className="text-sm text-gray-500">در حالِ خواندن…</div> : (
                <pre dir="auto" className="whitespace-pre-wrap break-words text-[12.5px] leading-6 text-gray-800">{peek.text || '(متنی استخراج نشد)'}</pre>
              )}
            </div>
            <div className="border-t border-gray-200 p-2 text-[11px] text-gray-500">این همان متنی است که ناظر می‌خواند — تکه‌تکه، تا آخر.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function FileRow({ f, filed, onPeek, act }) {
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true);
    try {
      const url = await authedObjectUrl(inspectionApi.rawUrl(f.id));
      const a = document.createElement('a');
      a.href = url; a.download = f.filename || 'file';
      document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (e) { toast.error(apiError(e)); } finally { setBusy(false); }
  };
  // «صفحه‌های افزوده»: the attachment becomes a page as DATA (no code commit)
  const installAsPage = async () => {
    const title = window.prompt('نامِ صفحه در منو:', (f.filename || '').replace(/\.html?$/i, ''));
    if (!title) return;
    setBusy(true);
    try {
      const app = await miniAppsApi.install({ file_id: f.id, title, after: '/import' });
      window.dispatchEvent(new Event(MINI_APPS_EVT));
      toast.success(`نصب شد: ${app.path}`);
    } catch (e) { toast.error(apiError(e)); } finally { setBusy(false); }
  };
  return (
    <div dir="rtl" className="rounded-md border border-sky-100 bg-white px-2 py-1.5 text-[11px]">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-gray-800 truncate max-w-[16rem]">{f.filename}</span>
        <span className="text-gray-400">{f.size_label}</span>
        {f.extract_status === 'ok' ? (
          <span className={f.fully_read ? 'text-emerald-700' : 'text-amber-700'}>
            {f.fully_read ? '✓ ناظر کاملش را خواند' : `ناظر ${fa(f.read_percent ?? 0)}٪ خوانده`}
          </span>
        ) : (
          <span className={f.viewed_at ? 'text-emerald-700' : 'text-amber-700'}>
            {f.viewed_at ? '✓ ناظر بازش کرد' : 'ناظر هنوز بازش نکرده'}
          </span>
        )}
        {!f.durable && <span className="text-red-700" title={f.store_note}>⚠ در درایو ذخیره نشد — با دیپلویِ بعدی پاک می‌شود</span>}
        {f.store === 'db' && <span className="text-slate-500" title={f.store_note}>در پایگاه‌داده — منتظرِ انتقال به درایو</span>}
        <span className="flex-1" />
        {f.extract_status === 'ok' && <button type="button" onClick={() => onPeek(f)} className="text-sky-700 hover:underline">متن</button>}
        {f.extract_status !== 'ok' && f.extract_status !== 'image' && (
          <button type="button" disabled={busy} title="دوباره بخوان — صوت/ویدیو: رونویسیِ کامل"
            onClick={() => { setBusy(true); void act(() => inspectionApi.extract(f.id), 'خوانده شد').finally(() => setBusy(false)); }}
            className="text-violet-700 hover:underline">{busy ? '…' : 'خواندنِ دوباره'}</button>
        )}
        <button type="button" disabled={busy} onClick={() => void download()} className="text-sky-700 hover:underline">{busy ? '…' : 'دانلود'}</button>
        {!!f.drive_link && <a href={f.drive_link} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">درایو</a>}
        {/\.html?$/i.test(f.filename || '') && (
          <button type="button" disabled={busy} onClick={() => void installAsPage()} data-testid={`install-app-${f.id}`}
            className="text-emerald-700 hover:underline" title="همین فایل، بی‌تغییر، به‌عنوانِ یک صفحه در منوی «ابزار»">نصب به‌عنوانِ صفحه</button>
        )}
        {!filed && (
          <button type="button" className="text-red-600 hover:underline" title="برداشتن (نسخهٔ درایو می‌ماند)"
            onClick={() => { if (window.confirm(`«${f.filename}» برداشته شود؟`)) void act(() => inspectionApi.removeFile(f.id), 'برداشته شد'); }}>×</button>
        )}
      </div>
      <div className="mt-0.5 text-gray-500">{f.extract_label}{f.extract_note ? ` — ${f.extract_note}` : ''}</div>
      {!!f.caption && <div className="mt-0.5 text-gray-700" dir="auto">توضیح: {f.caption}</div>}
    </div>
  );
}

function AttachToSheet({ r, reload }) {
  const [pct, setPct] = useState(null);
  const attach = async (list) => {
    for (const f of list) {
      try {
        setPct({ name: f.name, pct: 0 });
        await inspectionApi.upload(r.id, f, { onProgress: (p) => setPct({ name: f.name, pct: p }) });
        toast.success(`«${f.name}» پیوست شد — ناظر باید کاملش را بخواند`);
      } catch (e) { toast.error(`${f.name}: ${apiError(e)}`); }
    }
    setPct(null);
    await reload();
  };
  return (
    <>
      <label className="mt-1.5 flex cursor-pointer items-center gap-1.5 text-[11px] text-sky-800 hover:underline">
        <span>📎 پیوستِ فایل به خودِ همین گزارش (هر نوعی)</span>
        <input type="file" multiple className="hidden"
          onChange={(e) => { const l = Array.from(e.target.files || []); if (l.length) void attach(l); e.target.value = ''; }} />
      </label>
      {pct && <div className="mt-1 text-[11px] text-amber-800">{pct.name} — {fa(pct.pct)}٪</div>}
    </>
  );
}

/** A new entry UNDER this sheet — its own text, screenshot and files. */
function FollowUp({ r, reload }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [shot, setShot] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(null);
  const submit = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const ids = [];
      const failed = [];
      for (const f of files) {
        try {
          setPct({ name: f.name, pct: 0 });
          const up = await inspectionApi.upload(r.id, f, { onProgress: (p) => setPct({ name: f.name, pct: p }) });
          if (up?.file?.id) ids.push(up.file.id);
        } catch (e) { failed.push(`${f.name} (${apiError(e)})`); }
      }
      setPct(null);
      await inspectionApi.note(r.id, { text: text.trim(), shot: shot || undefined, file_ids: ids });
      setText(''); setFiles([]); setShot(null);
      if (failed.length) toast.error(`یادداشت ثبت شد ولی این فایل‌ها بالا نرفتند: ${failed.join(' · ')}`);
      else toast.success('ثبت شد — این برگه دوباره نارنجی و در صفِ ناظر است');
      await reload();
    } catch (e) { toast.error(apiError(e)); } finally { setBusy(false); setPct(null); }
  };
  return (
    <div className="rounded-lg border border-gray-200 p-2.5 space-y-1.5" data-testid={`inspection-followup-${r.number}`}>
      <div className="text-[11px] font-semibold text-gray-700">ثبتِ تازه ذیلِ همین گزارش</div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} dir="auto"
        onPaste={(e) => pasteShot(e, setShot)}
        placeholder="یادداشتِ تازه — متنِ گزارش را عوض نمی‌کند (برای اصلاحِ خودِ گزارش ✏️ را بزن). اسکرین‌شات را می‌توانی Ctrl+V کنی."
        className="w-full rounded-lg border border-gray-300 p-2 text-sm" />
      <FilePicker files={files} setFiles={setFiles} shot={shot} setShot={setShot} pct={pct} />
      <button type="button" onClick={() => void submit()} disabled={busy || !text.trim()}
        className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white disabled:opacity-50">
        {busy ? '…' : 'افزودن به همین برگه'}
      </button>
    </div>
  );
}

function AuthedImage({ path, caption, good }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let url = null;
    let alive = true;
    authedObjectUrl(path).then((u) => { url = u; if (alive) setSrc(u); }).catch(() => {});
    return () => { alive = false; if (url) URL.revokeObjectURL(url); };
  }, [path]);
  return (
    <figure className="max-w-xs">
      {src
        ? <a href={src} target="_blank" rel="noreferrer"><img src={src} alt={caption} className={`rounded border max-w-full ${good ? 'border-emerald-300' : 'border-gray-300'}`} /></a>
        : <div className="h-16 w-28 animate-pulse rounded bg-gray-100" />}
      <figcaption className={`text-[10px] ${good ? 'text-emerald-700' : 'text-gray-500'}`}>{caption}</figcaption>
    </figure>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// نقشهٔ صفحه‌ها و زیرصفحه‌ها — derived live; a page added later appears here.
// ────────────────────────────────────────────────────────────────────────────
function PagesMap() {
  const [inv, setInv] = useState(null);
  const [q, setQ] = useState('');
  useEffect(() => { inspectionApi.inventory().then(setInv).catch((e) => toast.error(apiError(e))); }, []);
  if (!inv) return <div className="text-sm text-gray-500">در حالِ خواندنِ نقشه…</div>;
  const t = inv.totals || {};
  const rows = (inv.pages || []).filter((p) => !q || `${p.path} ${p.label}`.includes(q));
  return (
    <div className="space-y-3" data-testid="inspection-pages-map">
      <p className="text-sm text-gray-600">
        همهٔ صفحه‌ها و زیرصفحه‌های برنامه، همین الان و از روی خودِ کد — هر صفحه یا تبی که بعداً اضافه شود خودکار
        این‌جا می‌آید. ناظر در هر بازرسیِ کامل همین فهرست را بازتولید می‌کند و اگر عددی <b>کم</b> شده باشد
        (قابلیتی حذف شده؟) با صدای بلند گزارش می‌دهد. مختصاتِ دقیقِ هر کنترل را ناظر با مرورگر اندازه می‌گیرد
        (<span dir="ltr">docs/supervisor/page_map.json</span>).
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
        {[['صفحه', t.pages], ['زیرصفحه (تب)', t.subpages], ['دکمه', t.buttons], ['ورودی', t.inputs],
          ['مسیرِ API', t.api_routes ?? '⚠ اندازه‌گیری نشد']].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-gray-200 bg-white p-2">
            <div className="text-lg font-bold text-gray-900">{typeof v === 'number' ? fa(v) : v}</div>
            <div className="text-[11px] text-gray-500">{k}</div>
          </div>
        ))}
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی صفحه…"
        className="w-full md:w-72 rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-[12px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-2 text-right">صفحه</th><th className="p-2 text-right">مسیر</th>
              <th className="p-2 text-right">زیرصفحه‌ها</th><th className="p-2">دکمه</th><th className="p-2">ورودی</th>
              <th className="p-2">API</th><th className="p-2">برگه‌ها</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const rc = p.reports || {};
              const live = (rc.open || 0) + (rc.answered || 0) + (rc.approved || 0);
              return (
                <tr key={p.path} className="border-t border-gray-100 align-top">
                  <td className="p-2 font-medium text-gray-800">{p.label}
                    {p.alias_of && <div className="text-[10px] text-gray-400">درِ دیگرِ {p.alias_of}</div>}</td>
                  <td className="p-2" dir="ltr">
                    {p.parametric || p.group === 'public' ? <span className="text-gray-500">{p.path}</span>
                      : <Link to={p.path} className="text-blue-600 hover:underline">{p.path}</Link>}
                  </td>
                  <td className="p-2">
                    {(p.subpages || []).map((s) => (
                      <div key={s.url}>
                        <Link to={s.url} className={`hover:underline ${s.quarantined ? 'text-gray-400' : 'text-blue-600'}`}>
                          {s.label.split(' ← ').pop()}</Link>
                        {s.quarantined && <span className="text-[10px] text-gray-400"> (قرنطینه)</span>}
                      </div>
                    ))}
                  </td>
                  <td className="p-2 text-center">{fa(p.buttons)}</td>
                  <td className="p-2 text-center">{fa(p.inputs)}</td>
                  <td className="p-2 text-center">{fa(p.api_calls)}</td>
                  <td className="p-2 text-center">
                    {live ? <span className="rounded bg-amber-100 px-1.5 text-amber-800">{fa(live)} باز</span> : ''}
                    {rc.filed ? <span className="ms-1 text-gray-400">{fa(rc.filed)} بایگانی</span> : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Binders() {
  const [binders, setBinders] = useState(null);
  const [filed, setFiled] = useState([]);
  useEffect(() => {
    inspectionApi.binders().then((d) => setBinders(d.binders || [])).catch((e) => toast.error(apiError(e)));
    inspectionApi.list({ status: 'filed', limit: 2000 }).then((d) => setFiled(d.reports || [])).catch(() => {});
  }, []);
  if (!binders) return <div className="text-sm text-gray-500">…</div>;
  if (!binders.length) {
    return <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
      هنوز زونکنی نیست. برگه‌ای که تأیید کنی (آبی)، در دورِ بعدِ ناظر این‌جا بایگانی می‌شود.</div>;
  }
  return (
    <div className="space-y-3">
      {[...binders].reverse().map((b) => (
        <details key={b.id} className="rounded-xl border border-gray-200 bg-white p-3">
          <summary className="cursor-pointer text-sm font-semibold text-gray-800">
            🗂 {b.label} — {fa(b.count)} از {fa(b.capacity)} برگه {b.closed_at ? '· بسته' : '· باز'}
          </summary>
          <ul className="mt-2 space-y-1 text-[12px]">
            {filed.filter((r) => r.binder?.id === b.id).sort((x, y) => x.binder.page - y.binder.page).map((r) => (
              <li key={r.id} className="flex gap-2">
                <span className="text-gray-400">برگهٔ {fa(r.binder.page)}</span>
                <span className="text-gray-800">گزارشِ {fa(r.number)} — {r.title}</span>
                {r.glow?.outcome_label && <span className="text-gray-500">· {r.glow.outcome_label}</span>}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}

function HowItWorks() {
  const [rounds, setRounds] = useState(null);
  useEffect(() => { inspectionApi.rounds().then(setRounds).catch(() => {}); }, []);
  return (
    <div className="prose-sm max-w-3xl space-y-3 text-sm leading-7 text-gray-700">
      <h2 className="text-lg font-bold text-gray-900">چطور کار می‌کند</h2>
      <ol className="list-decimal pr-5 space-y-1">
        <li>📝 را بالای صفحه روشن کن، دورِ هر ایراد یا خواسته کادر بکش (یا Alt را نگه دار و بکش). آدرسِ دقیق، مختصات و تصویر خودکار ثبت می‌شوند؛ اسکرین‌شاتِ خودت را هم می‌توانی Ctrl+V کنی و هر نوع فایلی پیوست کنی.</li>
        <li>در همان پنجره انتخاب کن «گزارشِ جدید» باشد یا «ذیلِ» یکی از گزارش‌های باز.</li>
        <li>برگه <b className="text-amber-700">نارنجی</b> است: منتظرِ ناظر. ناظر که جواب داد <b className="text-emerald-700">سبز</b> می‌شود؛ اگر دوباره زیرش بنویسی دوباره نارنجی می‌شود.</li>
        <li>اگر راضی بودی ✓ تأیید بزن (<b className="text-blue-700">آبی</b>) — دورِ بعدیِ ناظر (فوری یا کامل) آن را در زونکن بایگانی می‌کند و هایلایتش از صفحه می‌رود.</li>
        <li>⚡ فوری: برگه به صفِ جدایی می‌رود که روتینش هر چند ساعت یک بار سر می‌زند، به ترتیبی که زدی.</li>
      </ol>
      <h3 className="font-semibold text-gray-900">روتین‌ها</h3>
      <ul className="list-disc pr-5 space-y-1">
        <li>⚡ صفِ فوری — {rounds?.urgent ? <>دورِ بعد {localClock(rounds.urgent.at)} ({humanGap(rounds.urgent.in_minutes)}) · {everyText(rounds.urgent.every_minutes)}</> : '…'}</li>
        <li>🔎 بازرسیِ کامل — {rounds?.full ? <>دورِ بعد {localClock(rounds.full.at)} ({humanGap(rounds.full.in_minutes)}) · زمان‌بندی <span dir="ltr">{rounds.full.schedule}</span> UTC</> : '…'}</li>
      </ul>
      <p>دستورِ هر روتین در مخزن است و همان‌جا نسخه‌بندی می‌شود: <span dir="ltr">docs/supervisor/URGENT_PROMPT.md</span> و <span dir="ltr">docs/supervisor/PROMPT.md</span> (نسخه‌های قبلی در <span dir="ltr">docs/supervisor/archive/</span>). پرامپتِ خودِ روتین عمداً کوتاه است و فقط به این فایل‌ها اشاره می‌کند.</p>
      <p>قواعدی که سرور اجرا می‌کند: «درست شد» بدونِ تصویرِ بعدش پذیرفته نمی‌شود؛ ناظر تا فایل‌های پیوست را کامل نخواند نمی‌تواند جواب بدهد؛ تیکِ تأیید، حذف و ⚡ فقط دستِ توست.</p>
    </div>
  );
}
