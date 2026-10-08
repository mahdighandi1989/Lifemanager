/**
 * The pure halves of «نظارت و سرکشی» — the parts that can be wrong in a way
 * nobody notices on screen: a box placed 36px off, a highlight drawn on the
 * wrong tab, a countdown on the wrong clock, a squashed screenshot.
 */
import { describe, expect, it } from 'vitest';

import { boxesFor } from '../../../components/inspection/InspectionHighlights';
import { humanGap, rushMessage } from '../nextRound';
import { boxInImage, clampCrop, planSize } from '../shots';
import {
  boundedCaptureTarget, captureRatio, measureSpot, normalizePath, placeSpot,
  querySelectorPath, resolveSpot, sheetOnScreen, verifiedSelector, visibleText,
} from '../spot';

describe('measure + place: the box follows its content', () => {
  const geom = measureSpot({
    rect: { x: 110, y: 50, w: 40, h: 20 },
    viewport: { w: 1400, h: 900 },
    scroll: { x: 0, y: 300 },
    docSize: { w: 1400, h: 3000 },
    dpr: 2,
    anchorRect: { x: 100, y: 340, w: 200, h: 100 },
    anchorPath: 'main > div',
  });

  it('stores document pixels and fractions of the anchor', () => {
    expect(geom.doc).toEqual({ x: 110, y: 350, w: 40, h: 20 });
    expect(geom.anchor.rel).toEqual({ x: 0.05, y: 0.1, w: 0.2, h: 0.2 });
  });

  it('re-places by the anchor when it moved, and says it is exact', () => {
    const p = placeSpot(geom, () => ({ x: 500, y: 1000, w: 400, h: 200 }));
    expect(p.basis).toBe('anchor');
    expect(p.approximate).toBe(false);
    expect(p.rect).toEqual({ x: 520, y: 1020, w: 80, h: 40 });
  });

  it('falls back to document pixels and ADMITS it', () => {
    const p = placeSpot(geom, () => null);
    expect(p.basis).toBe('document');
    expect(p.approximate).toBe(true);
  });

  it('a zero-sized anchor carries no fractions (no divide by zero)', () => {
    const g = measureSpot({ ...{ rect: { x: 0, y: 0, w: 10, h: 10 }, viewport: {}, scroll: { x: 0, y: 0 }, docSize: {}, dpr: 1 },
      anchorRect: { x: 0, y: 0, w: 0, h: 0 }, anchorPath: 'x' });
    expect(g.anchor.path).toBe('');
  });
});

describe('selectors are verified, not assumed', () => {
  it('round-trips through querySelector', () => {
    document.body.innerHTML = '<main><div><button>a</button><button>b</button></div></main>';
    const b = document.querySelectorAll('button')[1];
    const sel = verifiedSelector(b);
    expect(sel).toContain('nth-of-type(2)');
    expect(document.querySelector(sel)).toBe(b);
  });

  it('anchors on a data-testid', () => {
    document.body.innerHTML = '<div data-testid="panel"><span><b>x</b></span></div>';
    expect(querySelectorPath(document.querySelector('b'))).toMatch(/^\[data-testid="panel"\]/);
  });
});

describe('what was in the box', () => {
  it('skips stylesheets and separates neighbours', () => {
    document.body.innerHTML = '<div><style>.a{color:red}</style><span>جستجو</span><span>نوع حساب</span></div>';
    const t = visibleText(document.querySelector('div'));
    expect(t).not.toContain('color');
    expect(t).toContain('جستجو · نوع حساب');
  });
});

describe('the way back includes the tab', () => {
  it('reopen is the concrete URL with its query, section is the tab', () => {
    document.body.innerHTML = '<main data-report-surface="/settings" data-report-surface-label="تنظیمات"><p>کلیدِ درایو</p></main>';
    const s = resolveSpot({
      rect: { x: 0, y: 0, w: 50, h: 50 }, viewport: { w: 1, h: 1 },
      stack: [document.querySelector('p')],
      location: { pathname: '/settings', search: '?tab=drive' },
      tabLabel: (t) => (t === 'drive' ? 'گوگل درایو' : ''),
    });
    expect(s.page).toBe('/settings');
    expect(s.reopen).toBe('/settings?tab=drive');
    expect(s.section_id).toBe('drive');
    expect(s.section_label).toBe('گوگل درایو');
  });

  it('a highlight is drawn only on its own tab and its own record', () => {
    expect(sheetOnScreen('/settings?tab=drive', { pathname: '/settings', search: '?tab=drive' })).toBe(true);
    expect(sheetOnScreen('/settings?tab=drive', { pathname: '/settings', search: '?tab=ai' })).toBe(false);
    expect(sheetOnScreen('/lists/5', { pathname: '/lists/6', search: '' })).toBe(false);
    expect(sheetOnScreen('/tasks', { pathname: '/tasks/', search: '?x=1' })).toBe(true);
    expect(normalizePath('/Tasks/')).toBe('/tasks');
  });

  it('filed sheets leave the page; follow-up boxes are drawn too', () => {
    const g = { doc: { x: 1, y: 1, w: 5, h: 5 }, anchor: {} };
    const reports = [
      { id: 'a', status: 'open', reopen: '/tasks', geometry: g, notes: [{ id: 'n0' },
        { id: 'n1', spot: { reopen: '/tasks', geometry: g } }, { id: 'n2', spot: { reopen: '/lists', geometry: g } }] },
      { id: 'b', status: 'filed', reopen: '/tasks', geometry: g, notes: [] },
    ];
    const keys = boxesFor(reports, { pathname: '/tasks', search: '' }).map((b) => b.key);
    expect(keys).toEqual(['a', 'a:n1']);
  });
});

describe('a capture must never kill the tab', () => {
  it('picks the largest affordable ancestor, never a 9000-node one', () => {
    const chain = ['surface', 'card', 'row'];
    const sizes = { surface: { w: 1200, h: 19000, nodes: 9000 }, card: { w: 1200, h: 800, nodes: 900 }, row: { w: 1200, h: 40, nodes: 5 } };
    expect(boundedCaptureTarget(chain, (t) => sizes[t])).toBe('card');
  });
  it('draws an enormous element at less than 1:1', () => {
    expect(captureRatio({ w: 4000, h: 4000 })).toBeLessThan(1);
    expect(captureRatio({ w: 800, h: 600 })).toBe(1);
  });
});

describe('pictures', () => {
  it('moves the box into image pixels through a transform and a density', () => {
    const b = boxInImage({ x: 150, y: 100, w: 50, h: 20 },
      { left: 100, top: 50, width: 500, height: 500, layoutWidth: 1000, layoutHeight: 1000 },
      { width: 2000, height: 2000 });
    expect(b).toEqual({ x: 200, y: 200, w: 200, h: 80 });
  });
  it('keeps the shape when shrinking', () => {
    expect(planSize(5200, 2600)).toEqual({ w: 2600, h: 1300 });
    expect(planSize(800, 600)).toEqual({ w: 800, h: 600 });
  });
  it('drops a crop that is the whole picture or degenerate', () => {
    expect(clampCrop({ x: 0, y: 0, w: 100, h: 100 }, 100, 100)).toBeNull();
    expect(clampCrop({ x: 10, y: 10, w: 5, h: 5 }, 100, 100)).toBeNull();
    expect(clampCrop({ x: -5, y: 10, w: 50, h: 300 }, 100, 100)).toEqual({ x: 0, y: 10, w: 50, h: 90 });
  });
});

describe('the countdown speaks honestly', () => {
  it('says late, not «three hours away», when the slot just passed', () => {
    expect(rushMessage(1, { at: new Date().toISOString(), basis: 'due', in_minutes: 0 })).toContain('هر لحظه');
  });
  it('flags a routine that stopped coming', () => {
    expect(rushMessage(2, { at: new Date().toISOString(), basis: 'stale', last_seen: new Date().toISOString() }))
      .toContain('خاموش');
  });
  it('hedges an estimate', () => {
    expect(rushMessage(1, { at: new Date(Date.now() + 3600e3).toISOString(), basis: 'assumed', in_minutes: 60 }))
      .toContain('تخمینی');
  });
  it('reads gaps in Persian', () => {
    expect(humanGap(90)).toBe('۱ ساعت و ۳۰ دقیقهٔ دیگر');
  });
});
