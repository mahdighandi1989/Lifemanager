/**
 * «📘 دفترچهٔ راهنما» inside /apps/learning-architecture — renders the three
 * documents of apps/learning-architecture/docs/ (HANDBOOK, PROGRESS, WORKLOG)
 * exactly as they are on GitHub (same files, copied by build.py).
 *
 *   • table of contents from the rendered headings (ids = GitHub anchors);
 *   • mermaid diagrams rendered in place (lazy-loaded, strict security);
 *   • the generated progress-chart block is replaced by the native ProgressChart;
 *   • every `##` section is wrapped in a `data-report-section` whose value is the
 *     heading's anchor, so a «نظارت و سرکشی» sheet boxed here reopens at
 *     `?doc=HANDBOOK#<anchor>` and lands on that very section.
 * Content comes only from this repository (never user input), so the HTML is trusted.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';

import {
  DOCS, assignHeadingIds, fetchDoc, githubUrl, resolveLink, splitAtChart,
} from '../../lib/llaHandbook';
import ProgressChart from './ProgressChart';

const PROSE = [
  'text-[15px] leading-8 text-gray-800',
  '[&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:mt-2 [&_h1]:mb-3 [&_h1]:text-gray-900',
  '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:pb-1 [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:text-gray-900',
  '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h2]:scroll-mt-20 [&_h3]:scroll-mt-20 [&_section]:scroll-mt-20',
  '[&_p]:my-2 [&_ul]:my-2 [&_ul]:pr-6 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pr-6 [&_ol]:list-decimal [&_li]:my-1',
  '[&_a]:text-sky-700 hover:[&_a]:underline',
  '[&_blockquote]:border-r-4 [&_blockquote]:border-amber-300 [&_blockquote]:bg-amber-50 [&_blockquote]:px-3 [&_blockquote]:py-1 [&_blockquote]:my-3 [&_blockquote]:rounded',
  '[&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded',
  '[&_pre]:bg-gray-50 [&_pre]:border [&_pre]:border-gray-200 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:text-left [&_pre]:my-3',
  '[&_table]:w-full [&_table]:text-sm [&_table]:my-3 [&_table]:border-collapse',
  '[&_th]:bg-gray-50 [&_th]:font-semibold [&_th]:text-right [&_th]:p-2 [&_th]:border [&_th]:border-gray-200',
  '[&_td]:p-2 [&_td]:border [&_td]:border-gray-200 [&_td]:align-top',
  '[&_hr]:my-6',
].join(' ');

let mermaidPromise = null;
function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((m) => {
      const mermaid = m.default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'neutral',
        fontFamily: 'Vazirmatn, Tahoma, sans-serif',
        flowchart: { htmlLabels: false },
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}
let mermaidSeq = 0;

function wrapSections(root, docLabel) {
  const kids = Array.from(root.childNodes);
  let cur = null;
  kids.forEach((n) => {
    if (n.nodeType === 1 && n.tagName === 'H2') {
      cur = document.createElement('section');
      cur.setAttribute('data-report-section', n.id);
      cur.setAttribute('data-report-section-label', `${docLabel} › ${n.textContent.trim()}`);
      root.insertBefore(cur, n);
    }
    if (cur) cur.appendChild(n);
  });
}

function Part({ md, docLabel, onReady, seen }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = marked.parse(md || '', { gfm: true });
    assignHeadingIds(el, { ...(seen || {}) });  // a copy: re-running this effect never double-counts
    wrapSections(el, docLabel);
    el.querySelectorAll('table').forEach((t) => {
      const box = document.createElement('div');
      box.className = 'overflow-x-auto';
      t.parentNode.insertBefore(box, t);
      box.appendChild(t);
    });
    const blocks = Array.from(el.querySelectorAll('pre > code.language-mermaid'));
    if (blocks.length) {
      loadMermaid().then(async (mermaid) => {
        for (const code of blocks) {
          const pre = code.parentElement;
          const holder = document.createElement('div');
          holder.className = 'my-4 overflow-x-auto rounded-lg border border-gray-200 bg-white p-2 text-center';
          holder.setAttribute('dir', 'ltr');
          try {
            mermaidSeq += 1;
            const { svg } = await mermaid.render(`lla-mmd-${mermaidSeq}`, code.textContent);
            holder.innerHTML = svg;
            const s = holder.querySelector('svg');
            if (s) { s.style.maxWidth = '100%'; s.style.height = 'auto'; }
          } catch (e) {
            holder.className += ' text-right text-xs text-rose-700';
            holder.textContent = `نمودار رسم نشد: ${e.message || e}`;
          }
          if (pre.parentNode) pre.parentNode.replaceChild(holder, pre);
        }
        onReady?.();
      });
    } else onReady?.();
  }, [md, docLabel, onReady, seen]);
  return <div ref={ref} className={PROSE} />;
}

export default function HandbookView({ doc, hash, onDoc, onClose }) {
  const [text, setText] = useState('');
  const [progress, setProgress] = useState(null);
  const [err, setErr] = useState('');
  const [toc, setToc] = useState([]);
  const [filter, setFilter] = useState('');
  const body = useRef(null);
  const docLabel = (DOCS.find((d) => d.key === doc) || DOCS[0]).label;

  useEffect(() => {
    let alive = true;
    setErr(''); setText(''); setToc([]);
    Promise.all([fetchDoc(doc), fetchDoc('progress')])
      .then(([t, p]) => { if (alive) { setText(t); setProgress(p); } })
      .catch((e) => { if (alive) setErr(e.message || String(e)); });
    return () => { alive = false; };
  }, [doc]);

  const scrollTo = useCallback((id, smooth = true) => {
    if (!id || !body.current) return;
    const el = body.current.querySelector(`[id="${CSS.escape(id)}"]`)
      || body.current.querySelector(`[data-report-section="${CSS.escape(id)}"]`);
    if (el) el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  }, []);

  // stable callback (hash read through a ref): changing the anchor must only SCROLL — it used to
  // re-parse the markdown and re-render every mermaid diagram on each TOC click
  const hashRef = useRef(hash);
  hashRef.current = hash;
  const onReady = useCallback(() => {
    if (!body.current) return;
    const hs = Array.from(body.current.querySelectorAll('h2,h3'))
      .map((h) => ({ id: h.id, text: h.textContent.trim(), lvl: h.tagName === 'H2' ? 2 : 3 }))
      .filter((t) => t.text !== 'فهرست');
    setToc(hs);
    if (hashRef.current) setTimeout(() => scrollTo(hashRef.current, false), 30);
  }, [scrollTo]);

  useEffect(() => { if (hash && toc.length) scrollTo(hash); }, [hash, toc.length, scrollTo]);

  const onClick = (e) => {
    const a = e.target.closest && e.target.closest('a');
    if (!a || !body.current?.contains(a)) return;
    const r = resolveLink(a.getAttribute('href'));
    if (!r) return;
    if (r.kind === 'external') { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); return; }
    e.preventDefault();
    if (r.kind === 'anchor') onDoc(doc, r.id);
    else onDoc(r.doc, r.id);
  };

  const [before, after] = doc === 'HANDBOOK' ? splitAtChart(text) : [text, null];
  // the part after the chart continues the duplicate-heading numbering of the part before it (as on GitHub)
  const seenAfter = useMemo(() => {
    if (after == null) return {};
    const tmp = document.createElement('div');
    tmp.innerHTML = marked.parse(before || '', { gfm: true });
    const seen = {};
    assignHeadingIds(tmp, seen);
    return seen;
  }, [before, after]);
  const shown = toc.filter((t) => !filter || t.text.includes(filter));

  return (
    <div dir="rtl" className="grid gap-4 lg:grid-cols-[16rem_1fr]" data-report-section={`handbook-${doc}`} data-report-section-label={`دفترچهٔ راهنما — ${docLabel}`}>
      <aside className="lg:sticky lg:top-20 lg:self-start space-y-3">
        <div className="rounded-xl border border-gray-200 bg-white p-2 space-y-1">
          {DOCS.map((d) => (
            <button key={d.key} type="button" onClick={() => onDoc(d.key, '')}
              className={`block w-full text-right rounded-lg px-3 py-1.5 text-sm ${d.key === doc ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
              {d.label}
            </button>
          ))}
          <div className="flex gap-2 px-1 pt-1 text-[12px]">
            <a href={githubUrl(doc)} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline">همین سند در GitHub ↗</a>
            <button type="button" onClick={onClose} className="mr-auto text-gray-600 hover:underline">↩ بازگشت به برنامه</button>
          </div>
        </div>
        {toc.length > 0 && (
          <nav className="rounded-xl border border-gray-200 bg-white p-2 max-h-[60vh] overflow-y-auto">
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="جست‌وجو در فهرست…"
              className="w-full mb-2 rounded-lg border border-gray-200 px-2 py-1 text-sm" />
            {shown.map((t) => (
              <button key={t.id} type="button" onClick={() => onDoc(doc, t.id)}
                className={`block w-full text-right rounded px-2 py-1 text-[13px] hover:bg-gray-50 ${t.lvl === 3 ? 'pr-5 text-gray-500' : 'text-gray-800'}`}>
                {t.text}
              </button>
            ))}
          </nav>
        )}
      </aside>
      <article ref={body} onClick={onClick} className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        {err && <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{err}</div>}
        {!text && !err && <div className="p-10 text-center text-sm text-gray-500">در حالِ بارگذاریِ سند…</div>}
        {text && doc === 'PROGRESS' && progress && (
          <div className="mb-6"><ProgressChart data={progress} onOpenWorklog={(id) => onDoc('WORKLOG', id)} /></div>
        )}
        {text && <Part md={before} docLabel={docLabel} onReady={onReady} />}
        {text && after != null && (
          <>
            <div className="my-4">{progress && <ProgressChart data={progress} onOpenWorklog={(id) => onDoc('WORKLOG', id)} />}</div>
            <Part md={after} docLabel={docLabel} onReady={onReady} seen={seenAfter} />
          </>
        )}
      </article>
    </div>
  );
}
