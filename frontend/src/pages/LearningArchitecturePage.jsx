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
 * The app itself is a vanilla-JS bundle built from its own sources
 * (public/assets/lla/*, see lib/llaBundle.js), styled under `.lla` only.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import api from '../lib/api';
import { LLA_BUNDLE } from '../lib/llaBundle';
import MiniAppPage from './MiniAppPage';

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
    s.onerror = () => { bundlePromise = null; reject(new Error('بستهٔ برنامه بارگذاری نشد')); };
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
  const legacy = new URLSearchParams(location.search).get('legacy') === '1';
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
      ai: (system, user) => api.post(`/app-records/${APP}/ai`, { system, user }).then((r) => {
        if (!r.data.ok) throw new Error(r.data.error || 'هوش مصنوعی پاسخ نداد');
        return r.data.text;
      }),
      navigate: ({ tab, a, s }) => {
        const q = new URLSearchParams();
        if (tab) q.set('tab', tab);
        if (a) q.set('a', a);
        if (s) q.set('s', s);
        const next = `${BASE}?${q.toString()}`;
        if (`${window.location.pathname}${window.location.search}` !== next) navRef.current(next);
      },
      initial: () => readQuery(window.location.search),
    };
    loadBundle()
      .then(() => {
        if (!alive || !mount.current) return;
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
    if (legacy || !ready || !window.APP || !window.APP.goFromURL) return;
    window.APP.goFromURL(readQuery(location.search));
  }, [location.search, ready, legacy]);

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
      {err && <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700 mb-3">{err}</div>}
      {!ready && !err && <div className="p-10 text-center text-sm text-gray-500">در حالِ بارگذاری…</div>}
      <div className="lla rounded-xl overflow-hidden border border-gray-200">
        <div id="app" dir="rtl" ref={mount} />
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        <button type="button" className="hover:underline" onClick={() => navigate(`${BASE}?legacy=1`)}>نسخهٔ قبلی (بایگانی)</button>
      </p>
    </div>
  );
}
