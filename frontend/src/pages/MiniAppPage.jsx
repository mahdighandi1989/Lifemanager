/**
 * /apps/:slug — one «صفحهٔ افزوده»: the owner's own HTML app, installed from an
 * inspection attachment, shown unchanged in a sandboxed iframe. See
 * lib/miniApps.js for the isolation and the localStorage shim.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buildSrcDoc, miniAppsApi, readStore, sanitizeStore, storeKey } from '../lib/miniApps';

export default function MiniAppPage() {
  const { slug } = useParams();
  const [app, setApp] = useState(null);
  const [doc, setDoc] = useState('');
  const [err, setErr] = useState('');
  const frame = useRef(null);
  const wrap = useRef(null);

  useEffect(() => {
    let alive = true;
    setDoc(''); setErr('');
    Promise.all([miniAppsApi.list(), miniAppsApi.source(slug)])
      .then(([apps, html]) => {
        if (!alive) return;
        setApp(apps.find((a) => a.slug === slug) || null);
        setDoc(buildSrcDoc(String(html || ''), readStore(slug)));
      })
      .catch((e) => { if (alive) setErr(e?.response?.data?.detail || e?.message || 'بارگذاری نشد'); });
    return () => { alive = false; };
  }, [slug]);

  useEffect(() => {
    const onMsg = (e) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;
      const clean = sanitizeStore(e.data?.lmMiniAppStore);
      if (!clean) return;
      try { localStorage.setItem(storeKey(slug), JSON.stringify(clean)); } catch { /* private mode */ }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [slug]);

  const fullscreen = () => { try { wrap.current?.requestFullscreen?.(); } catch { /* not allowed */ } };

  return (
    <div dir="rtl" className="space-y-3" data-testid="mini-app-page">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{app ? `${app.icon ? `${app.icon} ` : ''}${app.title}` : 'صفحهٔ افزوده'}</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            همان فایلی که پیوست کرده‌ای، بدونِ تغییر و جدا از بقیهٔ برنامه
            {app?.report_number ? <> — از <Link to="/inspection" className="text-sky-700 hover:underline">گزارشِ {app.report_number}</Link></> : null}
          </p>
        </div>
        <button type="button" onClick={fullscreen}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">⛶ تمام‌صفحه</button>
      </div>
      {err && <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{String(err)}</div>}
      <div ref={wrap} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {doc ? (
          <iframe ref={frame} title={app?.title || slug} srcDoc={doc}
            sandbox="allow-scripts allow-popups allow-forms allow-modals allow-downloads"
            data-testid="mini-app-frame"
            className="w-full block" style={{ height: 'calc(100vh - 150px)', minHeight: 600, border: 0 }} />
        ) : !err && <div className="p-10 text-center text-sm text-gray-500">در حالِ بارگذاری…</div>}
      </div>
    </div>
  );
}
