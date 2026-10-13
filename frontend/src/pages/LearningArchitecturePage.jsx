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
  const doc = ['HANDBOOK', 'PROGRESS', 'WORKLOG'].includes(query.get('doc')) ? query.get('doc') : '';
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
      // opts.maxTokens: answer budget for large JSON (whole decompositions, batches of problems) — the server default (2500) cut them off (2026-10-13)
      ai: (system, user, opts) => api.post(`/app-records/${APP}/ai`, { system, user, file_ids: (opts && opts.fileIds) || [], ...(opts && opts.maxTokens ? { max_tokens: Math.min(8192, opts.maxTokens) } : {}) }).then((r) => {
        if (!r.data.ok) throw new Error(r.data.error || 'هوش مصنوعی پاسخ نداد');
        return r.data.text;
      }),
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
      delFile: (id) => api.delete(`/app-records/${APP}/files/${id}`).then((r) => r.data),
      usage: () => api.get(`/app-records/${APP}/usage`).then((r) => r.data),
      // «گره‌گشا» follow-ups: the page decides what is due; the server delivers by Telegram / e-mail
      remind: (payload) => api.post(`/app-records/${APP}/reminders`, payload).then((r) => r.data),
      unremind: (key) => api.delete(`/app-records/${APP}/reminders/${encodeURIComponent(key)}`).then((r) => r.data),
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
  const openDoc = (key, anchor) => {
    if (!doc) appIdx.current = histIdx();
    navigate(`${BASE}?doc=${key}${anchor ? `#${encodeURIComponent(anchor)}` : ''}`);
  };
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
