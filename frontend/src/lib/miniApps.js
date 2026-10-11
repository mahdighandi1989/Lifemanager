/**
 * «صفحه‌های افزوده» — owner-attached HTML apps shown as pages (as DATA).
 *
 * The HTML is the owner's attachment, byte for byte, fetched from
 * /api/mini-apps/<slug>/source and rendered in an iframe sandboxed WITHOUT
 * `allow-same-origin`: such apps often render model output with innerHTML, and
 * on the app's own origin a hostile string could read the session token. With
 * an opaque origin the real localStorage throws, so a small shim (prepended at
 * runtime, the file itself untouched) gives the app an in-memory localStorage
 * seeded from — and saved back to — `lm.miniapp.<slug>` in the app via
 * postMessage. Installing a page is an API call, never a code commit.
 */
import { useEffect, useState } from 'react';
import api from './api';

export const miniAppsApi = {
  list: () => api.get('/mini-apps').then((r) => r.data.apps || []),
  source: (slug) => api.get(`/mini-apps/${slug}/source`, { responseType: 'text', transformResponse: (d) => d })
    .then((r) => r.data),
  install: (body) => api.post('/mini-apps', body).then((r) => r.data.app),
  retire: (slug) => api.delete(`/mini-apps/${slug}`).then((r) => r.data),
};

export const MINI_APPS_EVT = 'lm:mini-apps-changed';

/** An HTML file the owner can turn into a page while attaching it. */
export const isHtmlFile = (f) => /\.html?$/i.test(f?.name || f?.filename || '') || (f?.type || '').startsWith('text/html');

/**
 * Install an uploaded attachment as a page — the OWNER's own action, done the
 * moment the file goes up («این فایل صفحه شود» ticked). The unattended review
 * routine is never the one that installs: its safety check refuses publishing
 * an attachment as a running page (sheets 1 and 3), so the owner's tick is the
 * install and the routine only verifies and wires it in.
 * Placed right after the last installed page (else after «/import»).
 */
export async function installUploaded(fileId, filename) {
  const title = (filename || '').replace(/\.html?$/i, '').replace(/[-_]+/g, ' ').trim() || 'صفحهٔ افزوده';
  let after = '/import';
  try {
    const apps = await miniAppsApi.list();
    if (apps.length) after = apps[apps.length - 1].path;
  } catch { /* the default place is fine */ }
  const app = await miniAppsApi.install({ file_id: fileId, title, after });
  window.dispatchEvent(new Event(MINI_APPS_EVT));
  return app;
}
const MAX_STORE_CHARS = 20000;

export const storeKey = (slug) => `lm.miniapp.${slug}`;

export function readStore(slug) {
  try {
    const v = JSON.parse(localStorage.getItem(storeKey(slug)) || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch { return {}; }
}

/** Only a flat {string: string} object, small — the sandbox is untrusted input. */
export function sanitizeStore(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (k.length > 100 || typeof v !== 'string') return null;
    out[k] = v;
  }
  return JSON.stringify(out).length <= MAX_STORE_CHARS ? out : null;
}

export function buildSrcDoc(html, initial) {
  const seed = JSON.stringify(initial || {}).replace(/</g, '\\u003c');
  const shim = `<script>(function(){var mem=${seed};
function save(){try{parent.postMessage({lmMiniAppStore:mem},'*')}catch(e){}}
var s={getItem:function(k){return Object.prototype.hasOwnProperty.call(mem,k)?mem[k]:null},
setItem:function(k,v){mem[k]=String(v);save()},removeItem:function(k){delete mem[k];save()},
clear:function(){mem={};save()},key:function(i){return Object.keys(mem)[i]||null},
get length(){return Object.keys(mem).length}};
try{Object.defineProperty(window,'localStorage',{value:s,configurable:true})}catch(e){}})();</script>`;
  const at = html.search(/<head[^>]*>/i);
  if (at < 0) return shim + html;
  const end = html.indexOf('>', at) + 1;
  return html.slice(0, end) + shim + html.slice(end);
}

/** Installed pages as sidebar links. Silent for anyone who is not the owner. */
export function useMiniAppLinks() {
  const [apps, setApps] = useState([]);
  useEffect(() => {
    let alive = true;
    const load = () => miniAppsApi.list().then((a) => { if (alive) setApps(a); }).catch(() => {});
    load();
    window.addEventListener(MINI_APPS_EVT, load);
    return () => { alive = false; window.removeEventListener(MINI_APPS_EVT, load); };
  }, []);
  return apps.map((a) => ({
    to: a.path, label: `${a.icon ? `${a.icon} ` : ''}${a.title}`, testid: `sidebar-link-app-${a.slug}`,
    group: a.group || 'tools', after: a.after || '',
  }));
}

/**
 * Pages that are part of the repo but live under /apps/ (they replaced an
 * installed page of the same path). If the installed row is still there its
 * sidebar place is kept; if it was retired, the link is still shown.
 */
export const BUILTIN_APP_LINKS = [
  { to: '/apps/learning-architecture', label: '🧠 معماری یادگیری عمیق', testid: 'sidebar-link-app-learning-architecture', group: 'tools', after: '' },
];

/** Static links + installed pages, each page right after its `after` link. */
export function mergeLinks(links, extra) {
  const out = [...links];
  const seen = new Set(out.map((l) => l.to));
  const all = [...extra, ...BUILTIN_APP_LINKS.filter((b) => !extra.some((e) => e.to === b.to))];
  for (const e of all) {
    if (seen.has(e.to)) continue;
    seen.add(e.to);
    let at = e.after ? out.findIndex((l) => l.to === e.after) : -1;
    if (at < 0) {
      const lastInGroup = out.map((l) => l.group).lastIndexOf(e.group);
      at = lastInGroup;
    }
    out.splice(at + 1, 0, e);
  }
  return out;
}
