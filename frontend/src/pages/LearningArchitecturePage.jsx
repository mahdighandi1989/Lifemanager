/**
 * /apps/learning-architecture — «معماری یادگیری عمیق» و «کارخانه معرفت‌شناسی».
 *
 * Replaces the earlier mini-app of the same name (an uploaded HTML in a
 * sandboxed iframe — kept, quarantined, reachable with `?legacy=1`). This one is
 * part of the repo and mounts INSIDE the page, so:
 *   • records live in the database (`/api/app-records/learning-architecture`),
 *     not in the iframe's 20 KB storage shim;
 *   • «نظارت و سرکشی» sees and boxes everything inside it: every view is a
 *     `data-report-section` with a Persian label, and the view is in the URL
 *     (`?tab=<view>&a=<arg>&s=<sub>`), so a sheet's «reopen» lands on the same spot;
 *   • its AI critic goes through Lifemanager's own AI layer (task
 *     «learning_architecture»), never with a provider key in the browser.
 * The app itself is a vanilla-JS bundle built from its own sources in
 * apps/learning-architecture/src (public/assets/lla/*, see lib/llaBundle.js),
 * styled under `.lla` only. NEVER edit the bundle — edit the source and run
 * `python apps/learning-architecture/build.py` (see apps/learning-architecture/AGENTS.md).
 *
 * «📘 دفترچهٔ راهنما» (`?doc=HANDBOOK|PROGRESS|WORKLOG#anchor`) shows the page's
 * handbook, progress ledger and work log — the same files as on GitHub — while
 * the app stays mounted (hidden) underneath, so closing it returns to the same spot.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import api from '../lib/api';
import { LLA_BUNDLE } from '../lib/llaBundle';
import MiniAppPage from './MiniAppPage';
import HandbookView from '../components/learning-architecture/HandbookView';

const APP = 'learning-architecture';
const BASE = `/apps/${APP}`;
const FONTS = 'https://fonts.googleapis.com/css2?family=Lalezar&family=Vazirmatn:wght@400;600;700;800&display=swap';

function readQuery(search) {
  const q = new URLSearchParams(search || '');
  return { tab: q.get('tab') || '', a: q.get('a') || '', s: q.get('s') || '' };
}

function ensureLink(id, href) {
  if (document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id; l.rel = 'stylesheet'; l.href = href;
  document.head.appendChild(l);
}

let bundlePromise = null;
function loadBundle() {
  if (window.APP && window.APP.boot) return Promise.resolve();
  if (bundlePromise) return bundlePromise;
  bundlePromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `/assets/lla/${LLA_BUNDLE.js}`;
    s.async = true;
    s.onload = () => resolve();
    // usual cause: a new version was deployed while this tab was open (bundle names are content-hashed)
    s.onerror = () => { bundlePromise = null; reject(new Error('stale-bundle')); };
    document.body.appendChild(s);
  });
  return bundlePromise;
}

export default function LearningArchitecturePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const mount = useRef(null);
  const [err, setErr] = useState('');
  const [ready, setReady] = useState(false);
  const query = new URLSearchParams(location.search);
  const legacy = query.get('legacy') === '1';
  const doc = ['HANDBOOK', 'PROGRESS', 'WORKLOG', 'VERIFIED_BOOKLET', 'TERRITORY'].includes(query.get('doc')) ? query.get('doc') : '';
  // a malformed %-escape in a pasted/old link must not crash the whole page
  const hash = (() => { const raw = (location.hash || '').replace(/^#/, ''); try { return decodeURIComponent(raw); } catch { return raw; } })();
  const appQuery = useRef('');
  const navRef = useRef(navigate);
  navRef.current = navigate;

  useEffect(() => {
    if (legacy) return undefined;
    let alive = true;
    ensureLink('lla-fonts', FONTS);
    ensureLink('lla-css', `/assets/lla/${LLA_BUNDLE.css}`);
    // the host contract the app reads at boot (see a1_base.js «میزبان»)
    window.LLA_HOST = {
      load: () => api.get(`/app-records/${APP}`).then((r) => r.data.records || []),
      saveMany: (records) => api.post(`/app-records/${APP}/bulk`, { records }).then((r) => r.data),
      del: (id) => api.delete(`/app-records/${APP}/${encodeURIComponent(id)}`).then((r) => r.data),
      // opts.fileIds: the caller's own image/PDF attachments (≤4) for a vision-capable model — e.g. the photo of an IQ item
      // opts.maxTokens: answer budget. The server default (2500) cut decompositions and batches mid-JSON, and the gateway accepts a reply
      // stopped at MAX_TOKENS as success — so long critiques/«بیان دیگر» were silently truncated too. Default 6000 when the caller sets none;
      // callers ask more for big JSON (8192) or less for short checks (4000) (2026-10-13).
      // opts.fileIds: since 2026-10-14 ANY attachment (≤40, every format) — the server reads each one COMPLETELY
      // (app_reading) and returns a per-file manifest; opts.withMeta ⇒ resolve {text, files, mode} instead of text
      // ≤40 per request (the server's limit) — never dropped silently: beyond 40 the page shows a Persian warning naming
      // the files not sent (APP.aiFileCap in the bundle; this host-side check is the last line, review 2026-10-15).
      // withMeta also carries reading/reading_note («chunked» ⇒ answered chunk by chunk) and files_not_sent.
      ai: (system, user, opts) => {
        const all = (opts && opts.fileIds) || [];
        const app = typeof window !== 'undefined' ? window.APP : null;
        const ids = app && typeof app.aiFileCap === 'function' ? app.aiFileCap(all, 'میزبان') : all.slice(0, 40);
        const notSent = all.slice(ids.length);
        if (notSent.length && !(app && typeof app.aiFileCap === 'function')) console.warn(`از ${all.length} پیوست فقط ۴۰ تای اول فرستاده شد؛ فرستاده‌نشده: ${notSent.join('، ')}`);
        return api.post(`/app-records/${APP}/ai`, { system, user, file_ids: ids, max_tokens: Math.min(8192, (opts && opts.maxTokens) || 6000), task: (opts && opts.task) || undefined }).then((r) => {
          if (!r.data.ok) { const e = new Error(r.data.error || 'هوش مصنوعی پاسخ نداد'); e.files = r.data.files || []; throw e; }
          return opts && opts.withMeta ? { text: r.data.text, files: r.data.files || [], mode: r.data.mode, reading: r.data.reading || 'single', reading_note: r.data.reading_note || '', files_not_sent: notSent } : r.data.text;
        });
      },
      navigate: ({ tab, a, s, replace }) => {
        const q = new URLSearchParams();
        if (tab) q.set('tab', tab);
        if (a) q.set('a', a);
        if (s) q.set('s', s);
        const next = `${BASE}?${q.toString()}`;
        // sub-tab changes inside one page REPLACE the entry, so one history step = one page (the app's
        // «↩ برگرد» then uses historyBack and agrees with the browser's Back button)
        if (`${window.location.pathname}${window.location.search}` !== next) navRef.current(next, { replace: !!replace });
      },
      historyBack: (n) => window.history.go(-Math.max(1, n | 0)),
      // the app's own «📜 جزوهٔ متقن» link (e_bt › بک‌تستِ پیوسته) opens the generated document in the handbook viewer
      openDoc: (key) => { if (openDocRef.current) openDocRef.current(key); },
      initial: () => readQuery(window.location.search),
      // «آینهٔ درایو»: each case/topic/course → its own folder + spreadsheet under LifeManagerData
      mirror: (payload) => api.post(`/app-records/${APP}/mirror`, payload).then((r) => r.data),
      mirrorList: () => api.get(`/app-records/${APP}/mirror`).then((r) => r.data),
      mirrorSync: () => api.post(`/app-records/${APP}/mirror/sync`).then((r) => r.data),
      // «پیوست‌ها»: the bytes go straight to the record's Drive folder; the server keeps only a pointer
      files: (recId) => api.get(`/app-records/${APP}/files`, { params: { rec_id: recId } }).then((r) => r.data.files || []),
      upload: (recId, file, meta) => {
        const fd = new FormData();
        fd.append('rec_id', recId);
        fd.append('group', (meta && meta.group) || '');
        fd.append('title', (meta && meta.title) || '');
        fd.append('file', file);
        return api.post(`/app-records/${APP}/files`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data.file);
      },
      // «دستیار»: the open «نظارت و سرکشی» sheets of THIS page — so the chat never files a duplicate and knows what is already pending
      sheets: () => api.get('/inspection', { params: { page: '/apps/learning-architecture', limit: 200 } }).then((r) => (r.data.reports || []).map((x) => ({
        id: x.id, number: x.number, title: x.title, status: x.status, urgent: !!x.urgent_at, section: x.section_label || '', created: x.created_at || '' }))),
      // «🧭 تور»: one sheet with its notes (to verify a routine's answer) and an owner note under it (reopens an answered sheet)
      sheet: (id) => api.get(`/inspection/${encodeURIComponent(id)}`).then((r) => r.data.report || null),
      note: (id, text) => api.post(`/inspection/${encodeURIComponent(id)}/notes`, { text }).then((r) => r.data),
      // «دستیار»: a capability gap the chat found → a «نظارت و سرکشی» sheet (urgent when asked), with the issue's files attached
      report: async ({ text, spot, urgent, files }) => {
        const r = await api.post('/inspection', { text, spot });
        const rep = r.data && r.data.report;
        if (!rep || !rep.id) throw new Error('برگه ثبت نشد');
        if (urgent) { try { await api.post(`/inspection/${rep.id}/urgent`); } catch (e) { /* the sheet exists; urgency can be set by hand */ } }
        for (const f of (files || []).slice(0, 6)) {
          try { const fd = new FormData(); fd.append('file', f); await api.post(`/inspection/${rep.id}/files`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); } catch (e) { /* best effort */ }
        }
        return { id: rep.id, number: rep.number };
      },
      delFile: (id) => api.delete(`/app-records/${APP}/files/${id}`).then((r) => r.data),
      usage: () => api.get(`/app-records/${APP}/usage`).then((r) => r.data),
      // «گره‌گشا» follow-ups: the page decides what is due; the server delivers by Telegram / e-mail
      remind: (payload) => api.post(`/app-records/${APP}/reminders`, payload).then((r) => r.data),
      unremind: (key) => api.delete(`/app-records/${APP}/reminders/${encodeURIComponent(key)}`).then((r) => r.data),
      // «📧 گزارشِ تور»: گزارشِ HTML با نمودارهای PNG به ایمیلِ مالک (Gmail ِ متصل یا SMTP) — وضعِ صادقانه برمی‌گردد
      mail: (payload) => api.post(`/app-records/${APP}/report-email`, payload, { timeout: 60000 }).then((r) => r.data),
      remindStatus: () => api.get(`/app-records/${APP}/reminders`).then((r) => ({ ...(r.data.channels || {}), items: r.data.items || [] })),
    };
    loadBundle()
      .then(() => {
        if (!alive || !mount.current) return;
        // the bundle bound A.HOST on its first load; a remount must hand it THIS mount's host (fresh navigate ref)
        window.APP.HOST = window.LLA_HOST;
        window.APP.mountEl = mount.current;
        window.APP.boot();
        setReady(true);
      })
      .catch((e) => { if (alive) setErr(e.message || String(e)); });
    return () => {
      alive = false;
      if (mount.current) mount.current.innerHTML = '';
      if (window.APP) window.APP.mountEl = null;
    };
  }, [legacy]);

  // back/forward, or «نظارت و سرکشی» reopening a sheet: follow the URL
  useEffect(() => {
    if (legacy || doc || !ready || !window.APP || !window.APP.goFromURL) return;
    appQuery.current = location.search;
    window.APP.goFromURL(readQuery(location.search));
  }, [location.search, ready, legacy, doc]);

  // «بازگشت به برنامه» goes BACK to the history entry the handbook was opened from (React Router keeps
  // the entry index in history.state.idx), so the browser's Back doesn't lead into the handbook again.
  // A deep link straight into ?doc= has no such entry: then the app is opened forward, as before.
  const appIdx = useRef(null);
  const histIdx = () => (window.history.state && typeof window.history.state.idx === 'number' ? window.history.state.idx : null);
  const openDocRef = useRef(null);
  const openDoc = (key, anchor) => {
    if (!doc) appIdx.current = histIdx();
    navigate(`${BASE}?doc=${key}${anchor ? `#${encodeURIComponent(anchor)}` : ''}`);
  };
  openDocRef.current = openDoc;
  const closeDoc = () => {
    const from = appIdx.current; const cur = histIdx();
    appIdx.current = null;
    if (from != null && cur != null && cur > from) { navigate(from - cur); return; }
    let back = appQuery.current || '';
    const st = window.APP && window.APP.state;
    if (!back && st && st.view) {
      const q = new URLSearchParams({ tab: st.view });
      if (st.arg != null) q.set('a', String(st.arg));
      if (st.sub) q.set('s', st.sub);
      back = `?${q.toString()}`;
    }
    navigate(`${BASE}${back}`);
  };

  if (legacy) {
    return (
      <div dir="rtl" className="space-y-2">
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          نسخهٔ قبلیِ این صفحه (بایگانی‌شده؛ فقط برای مراجعه). نسخهٔ جاری:{' '}
          <button type="button" className="text-sky-700 hover:underline" onClick={() => navigate(BASE)}>معماری یادگیری عمیق</button>
        </div>
        <MiniAppPage slug={APP} />
      </div>
    );
  }

  return (
    <div dir="rtl" data-testid="learning-architecture-page">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm" data-report-section="lla-toolbar" data-report-section-label="نوارِ بالای صفحه (دفترچه)">
        <button type="button" onClick={() => (doc ? closeDoc() : openDoc('HANDBOOK'))}
          className={`rounded-lg border px-3 py-1.5 font-medium ${doc ? 'border-sky-300 bg-sky-50 text-sky-800' : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'}`}>
          {doc ? '↩ بازگشت به برنامه' : '📘 دفترچهٔ راهنما'}
        </button>
        {!doc && (
          <>
            <button type="button" onClick={() => openDoc('PROGRESS')} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50">📈 نمودارِ پیشرفت</button>
            <button type="button" onClick={() => openDoc('WORKLOG')} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50">🗒️ دفترِ کار</button>
            <button type="button" onClick={() => openDoc('VERIFIED_BOOKLET')} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50">📜 جزوهٔ متقن</button>
            <button type="button" onClick={() => openDoc('TERRITORY')} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50">🗺 قلمرو</button>
            <span className="text-[12px] text-gray-500">چیست، چرا، چطور کار می‌کند، و چه سیری داشته</span>
          </>
        )}
      </div>
      {doc && <HandbookView doc={doc} hash={hash} onDoc={openDoc} onClose={closeDoc} />}
      {err && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700 mb-3">
          {err === 'stale-bundle' ? 'بستهٔ برنامه بارگذاری نشد — احتمالاً نسخهٔ تازه‌ای منتشر شده است.' : err}{' '}
          <button type="button" className="underline font-medium" onClick={() => window.location.reload()}>تازه‌کردنِ صفحه</button>
        </div>
      )}
      {!ready && !err && !doc && <div className="p-10 text-center text-sm text-gray-500">در حالِ بارگذاری…</div>}
      <div className="lla rounded-xl overflow-hidden border border-gray-200" style={doc ? { display: 'none' } : undefined}>
        <div id="app" dir="rtl" ref={mount} />
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        <button type="button" className="hover:underline" onClick={() => navigate(`${BASE}?legacy=1`)}>نسخهٔ قبلی (بایگانی)</button>
      </p>
    </div>
  );
}
