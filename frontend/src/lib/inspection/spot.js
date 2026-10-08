/**
 * A dragged rectangle over a screen → an ADDRESS the supervisor can walk back
 * to, and GEOMETRY precise enough to put the box back on the same control.
 *
 * Ported from ALLIN1's `inspectionSpot.ts` (v150–v177, read-only reference). The
 * owner there asked: «صرفاً آدرسِ اون صفحه ثبت نشه بلکه مختصاتِ فوق‌العاده دقیقِ
 * جایی که کادر کشیده شده و ابعاد … ذکر بشه». A box carries four things,
 * strongest first:
 *
 *   1. `anchor.path` + `anchor.rel` — the box as FRACTIONS of the element it
 *      landed on. Survives resizing, reflow and scrolling because it is not a
 *      pixel measurement. The selector is ROUND-TRIP VERIFIED at capture; one
 *      that does not resolve back to the same element is not stored.
 *   2. `doc` — absolute document pixels (viewport + scroll). The fallback.
 *   3. `view` + `scroll` + `viewport` + `dpr` — what the owner literally saw.
 *   4. `doc_size` — the document at capture time.
 *
 * Lifemanager-specific: hubs (مالی، داده، تنظیمات…) are TABS selected by
 * `?tab=`, so the way back is the full URL with its query, and the tab is the
 * section unless the page marks a finer `data-report-section`.
 *
 * Pure on purpose: elements in, record out — a test can stand a fake DOM up.
 */

export const CROP_MIN_PX = 24;
const MAX_TEXT = 600;
const JOIN = ' · ';
const MAX_DEPTH = 4;

function attrUp(el, name) {
  let node = el;
  while (node) {
    const v = node.getAttribute?.(name);
    if (v) return { el: node, value: v };
    node = node.parentElement;
  }
  return null;
}

/** `section#filters > div.row > button` — short, for a human to read. */
export function domPath(el, depth = 4) {
  const parts = [];
  let node = el;
  while (node && parts.length < depth) {
    const tag = node.tagName?.toLowerCase();
    if (!tag || tag === 'body' || tag === 'html') break;
    const id = node.id ? `#${node.id}` : '';
    const cls = !id && typeof node.className === 'string' && node.className.trim()
      ? `.${node.className.trim().split(/\s+/).slice(0, 2).join('.')}`
      : '';
    parts.unshift(`${tag}${id}${cls}`);
    node = node.parentElement;
  }
  return parts.join(' > ');
}

/**
 * A selector that can actually be queried back. `nth-of-type`, not classes —
 * Tailwind classes repeat everywhere and change between builds. A
 * `data-testid` or an id ends the walk: unique and stable enough to anchor on.
 */
export function querySelectorPath(el, maxDepth = 9) {
  if (!el || !el.tagName) return '';
  const parts = [];
  let node = el;
  while (node && parts.length < maxDepth) {
    const tag = node.tagName.toLowerCase();
    if (tag === 'html') break;
    if (tag === 'body') { parts.unshift('body'); break; }
    if (node.id && /^[A-Za-z][\w-]*$/.test(node.id)) { parts.unshift(`#${node.id}`); break; }
    const tid = node.getAttribute?.('data-testid');
    if (tid && /^[\w-]+$/.test(tid)) { parts.unshift(`[data-testid="${tid}"]`); break; }
    const parent = node.parentElement;
    if (!parent) { parts.unshift(tag); break; }
    const same = Array.from(parent.children).filter((c) => c.tagName === node.tagName);
    const idx = same.indexOf(node) + 1;
    parts.unshift(same.length > 1 ? `${tag}:nth-of-type(${idx})` : tag);
    node = parent;
  }
  return parts.join(' > ');
}

/** `querySelectorPath`, kept only if re-querying it returns the same element. */
export function verifiedSelector(el, root) {
  if (!el) return '';
  const path = querySelectorPath(el);
  if (!path) return '';
  try {
    const scope = root ?? (typeof document !== 'undefined' ? document : null);
    if (!scope) return '';
    return scope.querySelector(path) === el ? path : '';
  } catch {
    return '';
  }
}

const round2 = (n) => Math.round(n * 100) / 100;
const round4 = (n) => Math.round(n * 10000) / 10000;

/** Measure the box every way that survives something different. */
export function measureSpot({ rect, viewport, scroll, docSize, dpr, anchorRect, anchorPath }) {
  const doc = {
    x: round2(rect.x + scroll.x), y: round2(rect.y + scroll.y),
    w: round2(rect.w), h: round2(rect.h),
  };
  const ar = anchorRect;
  const usable = !!(anchorPath && ar && ar.w > 0 && ar.h > 0);
  const rel = usable
    ? { x: round4((doc.x - ar.x) / ar.w), y: round4((doc.y - ar.y) / ar.h),
        w: round4(doc.w / ar.w), h: round4(doc.h / ar.h) }
    : { x: 0, y: 0, w: 0, h: 0 };
  return {
    doc,
    view: { x: round2(rect.x), y: round2(rect.y), w: round2(rect.w), h: round2(rect.h) },
    scroll: { x: round2(scroll.x), y: round2(scroll.y) },
    viewport,
    doc_size: docSize,
    dpr,
    anchor: {
      path: usable ? anchorPath : '',
      rect: usable ? { x: round2(ar.x), y: round2(ar.y), w: round2(ar.w), h: round2(ar.h) }
        : { x: 0, y: 0, w: 0, h: 0 },
      rel,
    },
  };
}

/**
 * Put a stored box back on the page, in DOCUMENT coordinates. Prefers the
 * anchor (follows the content); falls back to stored pixels and SAYS so — a
 * highlight that silently drifted points the owner at the wrong control.
 */
export function placeSpot(geom, lookup) {
  if (!geom) return null;
  const path = geom.anchor?.path;
  if (path && lookup) {
    const now = lookup(path);
    if (now && now.w > 0 && now.h > 0) {
      const rel = geom.anchor.rel;
      return {
        rect: { x: now.x + rel.x * now.w, y: now.y + rel.y * now.h, w: rel.w * now.w, h: rel.h * now.h },
        basis: 'anchor',
        approximate: false,
      };
    }
  }
  if (!geom.doc || geom.doc.w <= 0 || geom.doc.h <= 0) return null;
  return { rect: { ...geom.doc }, basis: 'document', approximate: true };
}

/** Tags whose text is code, not something anyone can see. */
const UNSEEN = new Set(['STYLE', 'SCRIPT', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'HEAD', 'TITLE']);

/**
 * The visible text of what was covered, collapsed and capped. Walks the tree
 * joining siblings with a separator (`textContent` ran a filter bar together
 * as «جستجونوع حسابشعبه») and skips `<style>` (ALLIN1 v172: one sheet reported
 * a STYLESHEET as «what was in the box»).
 */
export function visibleText(el, depth = MAX_DEPTH) {
  if (!el || UNSEEN.has(el.tagName)) return '';
  const kids = Array.from(el.children ?? []).filter((k) => !UNSEEN.has(k.tagName));
  if (depth > 0 && kids.length > 1) {
    const raw = kids.map((k) => visibleText(k, depth - 1)).filter(Boolean).join(JOIN);
    return raw.length > MAX_TEXT ? `${raw.slice(0, MAX_TEXT)}…` : raw;
  }
  const own = Array.from(el.childNodes ?? [])
    .filter((n) => n.nodeType === 3 || (n.nodeType === 1 && !UNSEEN.has(n.tagName)))
    .map((n) => n.textContent ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return own.length > MAX_TEXT ? `${own.slice(0, MAX_TEXT)}…` : own;
}

function nearestTelling(el, stop) {
  const MIN = 8;
  let cur = el;
  let best = null;
  for (let i = 0; cur && i < 6; i++) {
    const t = visibleText(cur, 1);
    if (t.length >= MIN) return cur;
    if (t && !best) best = cur;
    if (cur === stop) break;
    cur = cur.parentElement;
  }
  return best ?? el ?? stop;
}

/**
 * Resolve WHERE a box is. `location` = { pathname, search }; `tabLabel` turns a
 * `?tab=` id into its Persian name (from the live inventory).
 */
export function resolveSpot({ rect, viewport, stack, geometry, location, tabLabel }) {
  const innermost = stack[0] ?? null;
  const surface = attrUp(innermost, 'data-report-surface');
  const section = attrUp(innermost, 'data-report-section');
  const page = surface?.value ?? (location?.pathname || 'ui');
  const search = location?.search || '';
  const tab = new URLSearchParams(search).get('tab') || '';
  const sectionId = section?.value ?? tab;
  const sectionLabel = section?.el.getAttribute('data-report-section-label')
    ?? (tab ? (tabLabel?.(tab) || tab) : '');
  // The EXACT way back: the concrete URL with its query (`/lists/5`,
  // `/settings?tab=drive`), plus `#section` when the page marks a finer block.
  const base = `${location?.pathname || page}${search}`;
  const reopen = section?.value ? `${base}#${section.value}` : base;
  const textFrom = nearestTelling(innermost, section?.el ?? surface?.el ?? null);
  return {
    page,
    page_label: surface?.el.getAttribute('data-report-surface-label') ?? 'جایی در رابط',
    section_id: sectionId,
    section_label: sectionLabel,
    reopen,
    dom_path: domPath(innermost),
    covered_text: visibleText(textFrom),
    rect,
    viewport,
    ...(geometry ? { geometry } : {}),
  };
}

/** The geometry as one line a human can read. */
export function geometryLabel(g) {
  if (!g || !g.doc) return '';
  const d = g.doc;
  const dpr = g.dpr && g.dpr !== 1 ? ` · dpr ${g.dpr}` : '';
  return `${Math.round(d.w)}×${Math.round(d.h)} پیکسل در x=${Math.round(d.x)} y=${Math.round(d.y)} `
    + `(مختصاتِ سند) · پنجره ${g.viewport?.w}×${g.viewport?.h}${dpr}`;
}

export function spotAddress(s) {
  return s.section_label ? `${s.page_label} ← ${s.section_label}` : s.page_label;
}

/** One spelling per route, so `/tasks/` and `/Tasks` are one page. */
export function normalizePath(p) {
  const raw = (p || '').trim();
  if (!raw) return '/';
  const [path] = raw.split(/[?#]/);
  const cut = path.replace(/\/+$/, '');
  return (cut || '/').toLowerCase();
}

/**
 * Does a stored sheet belong on the screen being shown? A sheet filed on a
 * hub's tab is drawn only on THAT tab — on another tab its anchor would land on
 * an unrelated control. The concrete path is compared (so `/lists/5` is not
 * `/lists/6`), plus the `tab` when the sheet recorded one.
 */
export function sheetOnScreen(reopen, location) {
  if (!reopen) return false;
  const [pathAndQuery] = reopen.split('#');
  const [p, q = ''] = pathAndQuery.split('?');
  if (normalizePath(p) !== normalizePath(location?.pathname)) return false;
  const want = new URLSearchParams(q).get('tab') || '';
  const now = new URLSearchParams(location?.search || '').get('tab') || '';
  return !want || want === now;
}

// ── what belongs to us, and what belongs to the page ──────────────────
// Everything this feature draws carries `data-inspection-layer` on its ROOT,
// and `closest` asks about the element AND its ancestors (ALLIN1 v171: the
// dialog's own card passed an `hasAttribute` check and the capture photographed
// the dialog's surroundings instead of the page).
export function isOurOverlay(el) {
  return !!el?.closest?.('[data-inspection-layer]');
}

export function pageElementsAt(x, y, doc = document) {
  return doc.elementsFromPoint(x, y).filter((el) => !isOurOverlay(el));
}

// ── a capture must never be able to kill the tab (ALLIN1 v176/v177) ────
export const CAPTURE_MAX_PX = 6_000_000;
export const CAPTURE_MAX_SIDE = 8000;
export const CAPTURE_MIN_H = 160;
/** The real cost of a capture is NODES, paid synchronously (9165 nodes → 16 s). */
export const CAPTURE_MAX_NODES = 5000;
export const CAPTURE_DEADLINE_MS = 7000;

/** From the chain OUTERMOST → innermost, the first that fits the budget. */
export function boundedCaptureTarget(chain, sizeOf, budget = CAPTURE_MAX_PX, maxSide = CAPTURE_MAX_SIDE) {
  if (!chain.length) return null;
  const fits = (s) => s && s.w > 0 && s.h > 0
    && s.w * s.h <= budget && s.w <= maxSide && s.h <= maxSide
    && s.h >= CAPTURE_MIN_H && (s.nodes ?? 0) <= CAPTURE_MAX_NODES;
  for (const t of chain) if (fits(sizeOf(t))) return t;
  let best = null;
  let bestArea = -1;
  for (const t of chain) {
    const s = sizeOf(t);
    if (!s || !(s.w > 0) || s.h < CAPTURE_MIN_H) continue;
    if ((s.nodes ?? 0) > CAPTURE_MAX_NODES) continue;
    const area = s.w * s.h;
    if (area > bestArea) { bestArea = area; best = t; }
  }
  return best;
}

export function captureRatio(size, budget = CAPTURE_MAX_PX, maxSide = CAPTURE_MAX_SIDE) {
  const w = size?.w || 0;
  const h = size?.h || 0;
  if (!(w > 0) || !(h > 0)) return 1;
  return Math.min(1, Math.sqrt(budget / (w * h)), maxSide / Math.max(w, h));
}

export function captureChain(el, target) {
  const out = [];
  let cur = el ?? null;
  while (cur) {
    out.push(cur);
    if (cur === target) break;
    cur = cur.parentElement;
  }
  if (target && !out.includes(target)) out.push(target);
  return out.reverse();
}

/** A band around the box, full width — a long page cropped to where it matters. */
export function bandAround(box, image, viewportH = 700) {
  if (!image.width || !image.height) return null;
  const want = Math.min(image.height, Math.max(box.h * 3, viewportH, CAPTURE_MIN_H * 2));
  if (want >= image.height * 0.9) return null;
  const centre = box.y + box.h / 2;
  let y = Math.round(centre - want / 2);
  y = Math.max(0, Math.min(y, image.height - want));
  return { x: 0, y, w: image.width, h: Math.round(want) };
}

/** Run `work`, or give up after `ms` (cannot interrupt synchronous work — the
 *  node budget above is the bound that actually protects the page). */
export function withDeadline(work, ms) {
  return new Promise((resolve) => {
    let done = false;
    const t = setTimeout(() => { if (!done) { done = true; resolve(null); } }, ms);
    work.then(
      (v) => { if (!done) { done = true; clearTimeout(t); resolve(v); } },
      () => { if (!done) { done = true; clearTimeout(t); resolve(null); } },
    );
  });
}
