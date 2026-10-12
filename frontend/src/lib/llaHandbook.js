/**
 * Helpers for the in-page handbook of «معماری یادگیری عمیق و کارخانه معرفت‌شناسی».
 *
 * The documents live in apps/learning-architecture/docs/ (GitHub) and are copied,
 * content-hashed, into public/assets/lla/docs/ by apps/learning-architecture/build.py;
 * lib/llaBundle.js names the current files. One source, two readers (GitHub + here).
 *
 * slug() MUST stay identical to apps/learning-architecture/tools/handbook.py:slug —
 * the build-time gate checks the table of contents with the Python one, the page
 * scrolls with this one, and GitHub uses the same rule (github-slugger).
 */
import { LLA_BUNDLE } from './llaBundle.js';

export const DOCS = [
  { key: 'HANDBOOK', label: 'دفترچهٔ راهنما' },
  { key: 'PROGRESS', label: 'دفترِ پیشرفت' },
  { key: 'WORKLOG', label: 'دفترِ کار' },
];

export function slug(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N} _-]/gu, '')
    .replace(/ /g, '-');
}

/** Assigns GitHub-identical ids to every heading in `root` (duplicates → -1, -2).
 *  Pass the same `seen` for consecutive parts of ONE document (the handbook is split
 *  around the native chart) so duplicate numbering continues like on GitHub. */
export function assignHeadingIds(root, seen = {}) {
  root.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((h) => {
    let s = slug(h.textContent);
    if (s in seen) { seen[s] += 1; s = `${s}-${seen[s]}`; } else seen[s] = 0;
    h.id = s;
  });
}

const DOC_FILE = /^(HANDBOOK|PROGRESS|WORKLOG)\.md(?:#(.*))?$/;
const REPO_DOCS_DIR = 'apps/learning-architecture/docs/';

/**
 * Where a link inside a document should go:
 *  { kind: 'anchor', id } | { kind: 'doc', doc, id } | { kind: 'external', href }
 */
export function resolveLink(href) {
  if (!href) return null;
  if (href.startsWith('#')) return { kind: 'anchor', id: decodeURIComponent(href.slice(1)) };
  const m = href.match(DOC_FILE);
  if (m) return { kind: 'doc', doc: m[1], id: m[2] ? decodeURIComponent(m[2]) : '' };
  if (/^[a-z]+:/i.test(href)) return { kind: 'external', href };
  // any other repo-relative path → the file on GitHub
  const github = LLA_BUNDLE.github || '';
  const root = github.endsWith(REPO_DOCS_DIR) ? github.slice(0, -REPO_DOCS_DIR.length) : github;
  const path = new URL(href, `https://repo.invalid/${REPO_DOCS_DIR}`).pathname.replace(/^\//, '');
  return { kind: 'external', href: root + path };
}

export function githubUrl(doc) {
  return `${LLA_BUNDLE.github || ''}${doc}.md`;
}

const cache = {};
export function fetchDoc(key) {
  const file = LLA_BUNDLE.docs && LLA_BUNDLE.docs[key];
  if (!file) return Promise.reject(new Error('سند در بسته نیست — build.py را اجرا کن'));
  if (!cache[file]) {
    cache[file] = fetch(`/assets/lla/${file}`).then((r) => {
      if (!r.ok) throw new Error(`سند بارگذاری نشد (${r.status})`);
      return key === 'progress' ? r.json() : r.text();
    }).catch((e) => { delete cache[file]; throw e; });
  }
  return cache[file];
}

/** The handbook's generated chart block is drawn natively here, not as mermaid. */
export const CHART_BEGIN = '<!-- PROGRESS-CHART:BEGIN';
export const CHART_END = '<!-- PROGRESS-CHART:END -->';
export function splitAtChart(md) {
  const a = md.indexOf(CHART_BEGIN);
  const b = md.indexOf(CHART_END);
  if (a < 0 || b < 0) return [md, null];
  return [md.slice(0, a), md.slice(b + CHART_END.length)];
}

/** Heading of a WORKLOG entry, as written in the file, for linking from a chart point. */
export function worklogHeading(n, entry) {
  return `${entry.date} (${n}) — ${entry.title}`;
}
