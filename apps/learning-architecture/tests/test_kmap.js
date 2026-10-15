// گره‌گشا: نقشهٔ ذهن، نمودارها و شبیه‌سازهای گره (a18_kmap.js) — روی نسخهٔ مستقلِ ساخته‌شده (dist/learning-architecture.html)
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
const FA = s => String(s).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]);
const EN = s => String(s).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(300);
  const chk = (cond, msg) => { if (!cond) errors.push(msg); };

  // منو
  // از ۲۰۲۶-۱۰-۱۴ (WORKLOG 40) نقشهٔ ذهن در گروهِ «🗺 نقشه‌ها» ِ هر دو منوست (همان نما)
  chk(await p.locator('.navlist[data-sys="learn"] .nav[data-v="kmap"]').count() === 1 && await p.locator('.navlist[data-sys="epi"] .nav[data-v="kmap"]').count() === 1, 'nav kmap missing');
  // ۲۰۲۶-۱۰-۱۳: شش شبیه‌سازِ نمایشی «نمونهٔ آمادهٔ سازنده»اند — در منو نیستند و پیش‌فرض پنهان‌اند
  chk(await p.locator('.nav[data-v="ksims"]').count() === 0, 'nav ksims should be gone');

  // ۱) حالتِ خالی
  await p.click('.nav[data-v="kmap"]'); await p.waitForTimeout(100);
  info.empty = { box: await p.locator('main .km-empty').count(), svg: await p.locator('main .km-svg').count(), text: (await p.locator('main .km-empty').textContent() || '').slice(0, 40) };
  chk(info.empty.box === 1 && info.empty.svg === 0 && /گره‌گشا/.test(await p.locator('main .km-empty').textContent()), 'empty state');

  // ۲) دادهٔ نمونه
  await p.evaluate(() => {
    const S = APP.S, T = '2026-10-01T09:00:00.000Z';
    const K = [['k1', 'اولین راه را تا ته رفتن', 'F3', 'open'], ['k2', 'نگاه نکردن به آخر', 'F3', 'open'], ['k3', 'مفهومِ نسبت', 'F1', 'open'],
      ['k4', 'از جای خودم گفتن', 'F8', 'open'], ['k5', 'نگه‌داشتنِ همه در ذهن', 'F5', 'open'], ['k6', 'قیدِ خودساخته', 'F2', 'open'],
      ['k7', 'همیشه/هیچ‌وقت', 'F9', 'practised'], ['k8', 'ادامه چون وقت گذاشتم', 'F12', 'open']];
    K.forEach(([id, name, fam, status], i) => S.put({ id, type: 'knot', name, fam, status, created: T.replace('01T', '0' + (1 + (i % 3)) + 'T'), links: [], principle: 'ساختارِ ' + name, counter: 'حرکتِ مقابل' }));
    const g = id => S.get(id);
    APP.knotSetStatus(g('k2'), 'working', { at: '2026-10-05T10:00:00.000Z' });
    APP.knotSetStatus(g('k6'), 'working', { at: '2026-10-05T11:00:00.000Z' });
    APP.knotSetStatus(g('k3'), 'working', { at: '2026-10-03T10:00:00.000Z' }); APP.knotSetStatus(g('k3'), 'practised', { at: '2026-10-08T10:00:00.000Z' });
    APP.knotSetStatus(g('k4'), 'practised', { at: '2026-10-04T10:00:00.000Z' }); APP.knotSetStatus(g('k4'), 'returned', { at: '2026-10-09T10:00:00.000Z' });
    window.__noChange = APP.knotSetStatus(g('k4'), 'returned');  // بی‌تغییر ⇒ false
    window.__badStatus = APP.knotSetStatus(g('k4'), 'solved');   // وضعیتِ نامعتبر ⇒ false
    g('k3').links = [{ to: 'k1', rel: 'root-of' }]; S.put(g('k3'));
    const C = [['c1', 'آزمونِ هوشِ شنبه', 'k1', ['k2', 'k6']], ['c2', 'مسئلهٔ فیزیک', 'k1', ['k2']], ['c3', 'جلسهٔ مدیران', 'k4', []], ['c4', 'پروژهٔ دیرکرد', 'k5', ['k8']]];
    // a16 shape: root.primary / root.extra[].fam are FAMILY ids; the knots (primary first, then auxiliary knots) live in kc.knots
    C.forEach(([id, title, primary, extra]) => S.put({ id, type: 'kcase', title, root: { primary: S.get(primary).fam, extra: extra.map(x => ({ fam: S.get(x).fam })) }, knots: [primary].concat(extra), created: T }));
    // a family-only secondary (no auxiliary knot) makes no co-occurrence edge: c3 gets two secondary FAMILIES but keeps one knot
    const c3 = S.get('c3'); c3.root.extra = [{ fam: 'F7' }, { fam: 'F10' }]; S.put(c3);
    const I = [['i1', 'k1', [[95, true], [92, false], [55, true]]], ['i2', 'k2', [[15, false], [100, true], [58, false]]],
      ['i3', 'k3', [[95, true]], true], ['i4', 'k5', [[50, null]]]];
    I.forEach(([id, knot, hs, bad]) => S.put({ id, type: 'kitem', knot, bad: !!bad, atype: 'int', gen: { by: 'code:jars' }, hist: hs.map(([conf, ok]) => ({ at: T, conf, ok })) }));
    // excluded from calibration (Minor7): a self-graded rubric item, a free-text item and an unverified AI item
    S.put({ id: 'i5', type: 'kitem', knot: 'k4', atype: 'rubric', gen: { by: 'user' }, hist: [{ at: T, conf: 90, ok: true, self: { kind: 'rubric' } }] });
    S.put({ id: 'i6', type: 'kitem', knot: 'k4', atype: 'text', gen: { by: 'user' }, hist: [{ at: T, conf: 35, ok: true, self: { kind: 'text' } }] });
    S.put({ id: 'i7', type: 'kitem', knot: 'k1', atype: 'int', gen: { by: 'ai' }, ver: { ok: false }, hist: [{ at: T, conf: 25, ok: true }] });
  });
  info.statusFn = await p.evaluate(() => ({ noChange: window.__noChange, bad: window.__badStatus, hist: APP.S.get('k4').hist, ret: APP.S.get('k4').returnedAt, solved: APP.S.get('k3').solvedAt }));
  chk(info.statusFn.noChange === false && info.statusFn.bad === false && info.statusFn.hist.length === 2 && info.statusFn.hist[1].from === 'practised' && info.statusFn.ret && info.statusFn.solved, 'knotSetStatus ' + JSON.stringify(info.statusFn));

  await p.evaluate(() => APP.go('kmap')); await p.waitForTimeout(150);
  const M = 'main .km-svg';
  info.nodes = await p.locator(M + ' .km-n').count();
  chk(info.nodes === 8, 'node count ' + info.nodes);
  info.st = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('main .km-n')].map(g => [g.dataset.id, g.dataset.st]).sort()));
  chk(JSON.stringify(info.st) === JSON.stringify({ k1: 'open', k2: 'working', k3: 'practised', k4: 'returned', k5: 'open', k6: 'working', k7: 'practised', k8: 'open' }), 'statuses ' + JSON.stringify(info.st));
  info.fills = await p.evaluate(() => { const f = id => getComputedStyle(document.querySelector('main .km-n[data-id="' + id + '"] .km-dot')).fill; return { open: f('k1'), open2: f('k5'), working: f('k2'), practised: f('k3'), returned: f('k4') }; });
  chk(info.fills.open === info.fills.open2 && new Set([info.fills.open, info.fills.working, info.fills.practised, info.fills.returned]).size === 4, 'status colours ' + JSON.stringify(info.fills));
  info.legend = await p.locator('main .km-legend .km-st').allTextContents();
  chk(['باز', 'در حالِ باز شدن', 'ورزیده‌شده', 'بازگشته'].every(t => info.legend.some(x => x.includes(t))), 'legend ' + info.legend);
  info.sizes = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('main .km-n')].map(g => [g.dataset.id, [+g.dataset.cases, +g.querySelector('.km-dot').getAttribute('r')]])));
  chk(info.sizes.k1[0] === 2 && info.sizes.k7[0] === 0 && info.sizes.k1[1] > info.sizes.k6[1] && info.sizes.k6[1] > info.sizes.k7[1], 'sizes ' + JSON.stringify(info.sizes));
  info.co = await p.evaluate(() => [...document.querySelectorAll('main .km-e.co')].map(e => e.dataset.a + '|' + e.dataset.b + ':' + e.dataset.w).sort());
  chk(JSON.stringify(info.co) === JSON.stringify(['k1|k2:2', 'k1|k6:1', 'k2|k6:1', 'k5|k8:1']), 'co edges ' + info.co);
  info.root = await p.evaluate(() => [...document.querySelectorAll('main .km-e.root')].map(e => e.dataset.a + '>' + e.dataset.b + (e.getAttribute('marker-end') ? '+arrow' : '')));
  chk(JSON.stringify(info.root) === '["k3>k1+arrow"]', 'root edge ' + info.root);
  // چیدمان قطعی و بی‌هم‌پوشانی
  info.layout = await p.evaluate(() => {
    const ks = APP.S.all('knot'), a = APP.kmapLayout(ks, k => 2), b2 = APP.kmapLayout(ks.slice().reverse(), k => 2);
    const same = JSON.stringify(a.pos) === JSON.stringify(b2.pos);
    const ids = Object.keys(a.pos); let minGap = 1e9;
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) { const P = a.pos[ids[i]], Q = a.pos[ids[j]]; minGap = Math.min(minGap, Math.hypot(P.x - Q.x, P.y - Q.y) - P.r - Q.r); }
    // ۲۰ گره در یک خانواده: باز هم بی‌هم‌پوشانی
    const many = Array.from({ length: 20 }, (_, i) => ({ id: 'z' + String(i).padStart(2, '0'), fam: 'F4', created: '2026-01-01' }));
    const m = APP.kmapLayout(many, () => 9); let mg = 1e9; const mi = Object.keys(m.pos);
    for (let i = 0; i < mi.length; i++) for (let j = i + 1; j < mi.length; j++) { const P = m.pos[mi[i]], Q = m.pos[mi[j]]; mg = Math.min(mg, Math.hypot(P.x - Q.x, P.y - Q.y) - P.r - Q.r); }
    const inSector = mi.every(id => { const P = m.pos[id]; let ang = Math.atan2(P.y, P.x) + Math.PI / 2; ang = (ang + 4 * Math.PI) % (2 * Math.PI); return ang > 3 * Math.PI / 6 - 1e-9 && ang < 4 * Math.PI / 6 + 1e-9; });
    return { same, minGap: Math.round(minGap), manyGap: Math.round(mg), inSector };
  });
  chk(info.layout.same && info.layout.minGap > 10 && info.layout.manyGap > 10 && info.layout.inSector, 'layout ' + JSON.stringify(info.layout));

  // ۳) صفحه‌کلید: Tab از دکمه‌های زوم به یک گره، Enter ⇒ کشو
  await p.locator('main .km-zoom .km-zb').last().focus(); await p.keyboard.press('Tab');
  info.tabNode = await p.evaluate(() => { const a = document.activeElement; return a && a.classList && a.classList.contains('km-n') ? a.dataset.id : (a && a.className && String(a.className.baseVal || a.className)); });
  chk(/^k\d$/.test(info.tabNode || ''), 'tab to node ' + info.tabNode);
  await p.locator('main .km-n[data-id="k1"]').focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(80);
  info.drawer = { open: await p.locator('main .km-drawer:not([hidden])').count(), title: await p.locator('#kmDrT').textContent(), focus: await p.evaluate(() => document.activeElement && document.activeElement.id),
    cases: await p.locator('main .km-drawer h3:has-text("موقعیت‌ها")').textContent(), open_btn_disabled: await p.locator('main .km-drawer .btn:has-text("باز کن")').isDisabled(),
    why: await p.locator('main .km-drawer .km-why').textContent(), sim: await p.locator('main .km-drawer .linkish:has-text("کوزه‌های آب")').count() };
  chk(info.drawer.open === 1 && info.drawer.title === 'اولین راه را تا ته رفتن' && info.drawer.focus === 'kmDrT' && /۲/.test(info.drawer.cases) && info.drawer.open_btn_disabled === !(await p.evaluate(() => !!APP.V.kpractice)) && info.drawer.sim === 0, 'drawer (no sample-sim link by default) ' + JSON.stringify(info.drawer));
  // ۴) پیوندِ تازه از کشو: دقیقاً یک S.put
  await p.evaluate(() => { const o = APP.S.put; window.__puts = []; APP.S.put = function (r) { window.__puts.push(r.id); return o.apply(this, arguments); }; });
  await p.selectOption('main .km-addlink select[aria-label="نوعِ پیوند"]', 'related');
  await p.selectOption('main .km-addlink select[aria-label="گرهِ مقصد"]', 'k5');
  await p.click('main .km-addlink .btn:has-text("پیوند بده")'); await p.waitForTimeout(80);
  info.link = await p.evaluate(() => ({ puts: window.__puts.slice(), links: APP.S.get('k1').links, rel: document.querySelectorAll('main .km-e.rel').length, drawer: !!document.querySelector('main .km-drawer:not([hidden])') }));
  chk(JSON.stringify(info.link.puts) === '["k1"]' && JSON.stringify(info.link.links) === '[{"to":"k5","rel":"related"}]' && info.link.rel === 1 && info.link.drawer, 'add link ' + JSON.stringify(info.link));
  // تکراری ⇒ رد، بی‌ذخیره
  await p.selectOption('main .km-addlink select[aria-label="نوعِ پیوند"]', 'related'); await p.selectOption('main .km-addlink select[aria-label="گرهِ مقصد"]', 'k5');
  await p.click('main .km-addlink .btn:has-text("پیوند بده")'); await p.waitForTimeout(50);
  // جهتِ وارونه با ریشهٔ موجود (k3 ریشهٔ k1 است) ⇒ رد
  await p.selectOption('main .km-addlink select[aria-label="نوعِ پیوند"]', 'root-of'); await p.selectOption('main .km-addlink select[aria-label="گرهِ مقصد"]', 'k3');
  await p.click('main .km-addlink .btn:has-text("پیوند بده")'); await p.waitForTimeout(50);
  info.link2 = await p.evaluate(() => ({ puts: window.__puts.length, msg: document.querySelector('main .km-addlink .sim-fb.no') && document.querySelector('main .km-addlink .sim-fb.no').textContent }));
  chk(info.link2.puts === 1 && /ریشهٔ همین گره/.test(info.link2.msg || ''), 'link guards ' + JSON.stringify(info.link2));
  // incoming root shown
  chk(await p.locator('main .km-drawer li:has-text("ریشهٔ این گره است")').count() === 1, 'incoming link');
  // Escape ⇒ بسته و فوکوس به گره
  await p.locator('#kmDrT').focus(); await p.keyboard.press('Escape'); await p.waitForTimeout(50);
  info.esc = await p.evaluate(() => ({ hidden: document.querySelector('main .km-drawer').hidden, focus: document.activeElement && document.activeElement.dataset && document.activeElement.dataset.id }));
  chk(info.esc.hidden && info.esc.focus === 'k1', 'escape ' + JSON.stringify(info.esc));
  chk(await p.evaluate(() => getComputedStyle(document.querySelector('main .km-drawer')).display) === 'none', 'hidden drawer still displayed');

  // ۵) پالایش
  const visible = () => p.locator('main .km-n:not(.dim)').count();
  await p.selectOption('main .km-tools select', 'F3'); await p.waitForTimeout(50);
  info.filterFam = await visible();
  await p.selectOption('main .km-tools select', ''); await p.click('main .km-stb[data-st="open"]'); await p.waitForTimeout(50);
  info.filterSt = await visible();
  info.dimTab = await p.evaluate(() => [...document.querySelectorAll('main .km-n.dim')].every(g => g.getAttribute('tabindex') === '-1'));
  await p.click('main .km-stb[data-st="open"]'); await p.waitForTimeout(50);
  info.filterBack = await visible();
  chk(info.filterFam === 2 && info.filterSt === 5 && info.dimTab && info.filterBack === 8, 'filter ' + [info.filterFam, info.filterSt, info.dimTab, info.filterBack]);
  // ۶) زوم و چرخ
  const vbw = () => p.evaluate(() => +document.querySelector('main .km-svg').getAttribute('viewBox').split(' ')[2]);
  const w0 = await vbw(); await p.click('main .km-zb[aria-label="بزرگ‌نمایی"]'); const w1 = await vbw();
  await p.locator(M).hover(); await p.mouse.wheel(0, 300); await p.waitForTimeout(50); const w2 = await vbw();
  await p.click('main .km-zb[aria-label="اندازهٔ اصلی"]'); const w3 = await vbw();
  info.zoom = [w0, w1, w2, w3].map(Math.round);
  chk(w1 < w0 && w2 > w1 && Math.abs(w3 - w0) < 1, 'zoom ' + info.zoom);
  // ۷) نمایشِ موقعیت‌ها
  await p.click('main .km-tools .btn:has-text("نمایشِ موقعیت‌ها")'); await p.waitForTimeout(50);
  info.caseNodes = await p.locator('main .km-c').count();
  chk(info.caseNodes === 4, 'case nodes ' + info.caseNodes);
  await p.click('main .km-tools .btn:has-text("نمایشِ موقعیت‌ها")');

  // ۸) نمودارها
  info.trend = await p.evaluate(() => { const t = APP.kmapTrend(); return { last: t.rows[t.rows.length - 1], approx: t.approx, lines: document.querySelectorAll('main .km-trend .km-line').length }; });
  chk(info.trend.lines === 4 && info.trend.last.open === 3 && info.trend.last.working === 2 && info.trend.last.practised === 2 && info.trend.last.returned === 1 && info.trend.approx === 1, 'trend ' + JSON.stringify(info.trend));
  info.trend5 = await p.evaluate(() => APP.kmapTrend().rows.find(r => r.d === '2026-10-05'));
  chk(info.trend5 && info.trend5.working === 3 && info.trend5.practised === 2 && info.trend5.open === 3 && info.trend5.returned === 0, 'trend day5 ' + JSON.stringify(info.trend5));
  await p.click('main .km-trend .btn:has-text("جدولِ داده")');
  info.trendTab = await p.locator('main .km-trtab tbody tr').count();
  chk(info.trendTab >= 5 && await p.locator('main .km-trend .btn[aria-expanded="true"]').count() === 1, 'trend table ' + info.trendTab);
  info.calib = await p.evaluate(() => [...document.querySelectorAll('main .km-cb')].map(g => g.dataset.bin + ':' + g.dataset.n + '/' + g.dataset.ok));
  chk(JSON.stringify(info.calib) === JSON.stringify(['1:1/0', '5:2/1', '9:3/2']), 'calib bins ' + info.calib);
  chk(await p.locator('main .km-calib .km-diag').count() === 1, 'calib diagonal');
  await p.click('main .km-calib .btn:has-text("جدولِ داده")');
  info.calibTab = await p.evaluate(() => [...document.querySelectorAll('main .km-catab tbody tr')].map(r => r.querySelector('td.n').textContent).join(','));
  chk(info.calibTab === ['۰', '۱', '۰', '۰', '۰', '۲', '۰', '۰', '۰', '۳'].join(','), 'calib table ' + info.calibTab);
  chk(await p.locator('main .km-chart svg[role="img"][aria-label]').count() === 2, 'chart aria');

  // ۹) موبایل ۳۹۰: بی‌سرریز؛ کشو = برگهٔ پایین
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(100);
  await p.locator('main .km-n[data-id="k2"]').click({ force: true }); await p.waitForTimeout(80);
  info.mobile = await p.evaluate(() => ({ ov: document.documentElement.scrollWidth - window.innerWidth, pos: getComputedStyle(document.querySelector('main .km-drawer')).position, svgW: document.querySelector('main .km-svg').getBoundingClientRect().width }));
  chk(info.mobile.ov <= 2 && info.mobile.pos === 'fixed' && info.mobile.svgW <= 390, 'mobile kmap ' + JSON.stringify(info.mobile));
  await p.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_kmap_mobile.png') });
  await p.setViewportSize({ width: 1280, height: 900 });
  await p.evaluate(() => APP.go('kmap')); await p.waitForTimeout(80);
  await p.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_kmap.png'), fullPage: true });

  // ۱۰) شبیه‌سازها — پیش‌فرض پنهان (فقط یادداشت)، سپس با «نمونه‌های آمادهٔ سازنده»
  await p.evaluate(() => { APP.go('ksims'); }); await p.waitForTimeout(100);
  chk(await p.locator('main .ks-sim').count() === 0 && await p.locator('main .samples-note').count() === 1, 'sims hidden by default (note shown)');
  await p.evaluate(() => { const st = APP.S.settings(); st.samples = true; APP.S.saveSettings(st); APP.KSIM_MS = 60; APP.go('ksims'); }); await p.waitForTimeout(100);
  info.sims = await p.evaluate(() => ({ keys: Object.keys(APP.KSIM), f3: APP.knotSimFor('F3'), f8: APP.knotSimFor({ fam: 'F8' }), cards: document.querySelectorAll('main .ks-sim').length, demo: document.querySelectorAll('main .ks-sim .ks-demo').length, notInCourse: !Object.keys(APP.COURSE_SIM || {}).some(k => /jars|w246|curse/.test(k)) }));
  chk(JSON.stringify(info.sims.keys) === '["jars","w246","curse","wm","endstate","ladder"]' && info.sims.cards === 6 && info.sims.demo === 6 && info.sims.f3.includes('jars') && info.sims.f3.includes('ladder') && JSON.stringify(info.sims.f8) === '["curse"]' && info.sims.notInCourse, 'sims ' + JSON.stringify(info.sims));
  const sim = k => p.locator(`main .ks-sim[data-ksim="${k}"]`);
  // کوزه‌های آب
  const J = sim('jars'); const op = async o => J.locator(`[data-op="${o}"]`).click(); const done = async () => J.locator('[data-act="done"]').click();
  for (let i = 0; i < 6; i++) { for (const o of ['+b', '-a', '-c', '-c']) await op(o); await done(); }   // ۵ تمرینی + بحرانیِ ۱ با راهِ بلند
  for (const o of ['+a', '+c']) await op(o); await done();                                             // بحرانیِ ۲ با راهِ کوتاه
  for (const o of ['+b', '-a', '-c', '-c']) await op(o); await done();                                 // خاموشی: راهِ بلند کار نمی‌کند
  info.jarsExtMsg = await J.locator('.sim-fb.no').last().textContent();
  await J.locator('.btn:has-text("از نو")').click(); for (const o of ['+a', '-c']) await op(o); await done();
  for (const o of ['+b', '-a', '-c', '-c']) await op(o); await done();                                 // پس از آن: راهِ بلند
  info.jars = await J.evaluate(el => [...el.querySelectorAll('.ks-jtab tbody tr')].map(r => r.dataset.kind + ':' + r.dataset.path));
  info.jarsFb = await J.locator('.sim-fb').count();
  chk(info.jars.length === 9 && info.jars.slice(5).join(',') === 'crit:long,crit:short,ext:short,post:long' && /همان راهِ همیشگی/.test(info.jarsExtMsg) && info.jarsFb >= 3, 'jars ' + JSON.stringify(info.jars) + ' ' + info.jarsExtMsg);
  info.jarsLongMsg = await J.locator('.sim-fb').filter({ hasText: 'یکی از دو مسئلهٔ بحرانی' }).count();
  chk(info.jarsLongMsg === 1, 'jars crit feedback');
  // ۲-۴-۶
  const W = sim('w246');
  const tri = async (a, b2, c, pred) => { const ins = W.locator('.ks-in input'); await ins.nth(0).fill(a); await ins.nth(1).fill(b2); await ins.nth(2).fill(c); await W.locator(`[data-pred="${pred}"]`).click(); await W.locator('[data-act="test"]').click(); };
  await W.locator('[data-act="announce"]').click(); const r0 = await W.locator('.sim-fb.no').count();
  await W.locator('.ks-in input').nth(0).fill('1'); await W.locator('[data-act="test"]').click(); const noFill = await W.locator('.sim-fb.no:has-text("هر سه خانه")').count();
  await tri('8', '10', '12', 'yes'); await tri('1', '3', '5', 'yes'); await tri('20', '22', '24', 'yes'); await tri('۱۰۰', '۱۰۲', '۱۰۴', 'yes');
  await W.locator('[data-act="announce"]').click();
  const refused = await W.locator('.sim-fb.no:has-text("انتظار داری با قاعده نخواند")').count();
  const choicesBefore = await W.locator('.crs-whyopt').count();
  await tri('1', '5', '90', 'no'); await tri('-3', '0', '7', 'no');
  await W.locator('[data-act="announce"]').click();
  await W.locator('.crs-whyopt:has-text("سه عددِ زوج")').click(); const wrong = await W.locator('.sim-fb.no:has-text("۱، ۵، ۹۰")').count();
  await W.locator('.crs-whyopt:has-text("صعودی")').click();
  info.w246 = { r0, noFill, refused, choicesBefore, wrong, ok: await W.locator('.sim-fb.ok').count(), stat: await W.locator('.ks-stat').textContent(), log: await W.evaluate(el => [...el.querySelectorAll('.ks-log li')].map(l => l.dataset.pred + l.dataset.fit).join(',')), summary: await W.locator('.ks-info').textContent() };
  chk(info.w246.r0 === 1 && info.w246.noFill === 1 && info.w246.refused === 1 && info.w246.choicesBefore === 0 && info.w246.wrong === 1 && info.w246.ok === 1 && info.w246.log === '11,11,11,11,01,01' && /۲ تا را انتظار داشتی نخواند و ۰ تا واقعاً نخواند/.test(info.w246.summary), 'w246 ' + JSON.stringify(info.w246));
  // نفرینِ دانش
  const K = sim('curse');
  await K.locator('[data-act="reveal"]').click(); const cRef = await K.locator('.sim-fb.no').count();
  for (let i = 0; i < 6; i++) { await K.locator('.ks-tapbtn').click(); await p.waitForTimeout(15); }
  await K.locator('.ks-range').fill('80'); await K.locator('[data-act="reveal"]').click();
  info.curse = { cRef, taps: await K.locator('.ks-tap').count(), bars: await K.locator('.ks-bar').count(), fb: await K.locator('.sim-fb.no').last().textContent(), text: await K.textContent() };
  const nums = (info.curse.text.match(/[۰-۹٫]+٪/g) || []).filter((v, i, a) => a.indexOf(v) === i);
  chk(info.curse.cRef === 1 && info.curse.taps === 6 && info.curse.bars === 3 && /ضربه‌زن‌های آن پژوهش/.test(info.curse.fb) && nums.every(n => ['۵۰٪', '۲٫۵٪', '۸۰٪'].includes(n)), 'curse ' + JSON.stringify({ ...info.curse, text: undefined, nums }));
  // حافظهٔ کاری
  const WM = sim('wm');
  const runRound = async (mode, answer) => {
    const R = WM.locator(`.ks-round[data-mode="${mode}"]`);
    await R.evaluate(el => { window.__seq = []; const d = el.querySelector('.ks-disp'); const ob = new MutationObserver(() => { const t = d.textContent.trim(); if (/^[۰-۹]$/.test(t)) window.__seq.push(t); }); ob.observe(d, { childList: true, characterData: true, subtree: true }); window.__ob = ob; });
    await R.locator('[data-act="start"]').click();
    await R.locator('.ks-sum').waitFor({ timeout: 8000 });
    const seq = await p.evaluate(() => { window.__ob.disconnect(); return window.__seq.join(''); });
    await R.locator('.ks-sum').fill('0'); await R.locator('[data-act="sum"]').click();
    await R.locator('.ks-recall').fill(answer === 'echo' ? EN(seq) : answer); await R.locator('[data-act="recall"]').click();
    return { seq, score: await R.getAttribute('data-score') };
  };
  const rh = await runRound('head', '');
  const rp = await runRound('paper', 'echo');
  info.wm = { head: rh, paper: rp, two: await WM.locator('.ks-two').textContent(), fb: await WM.locator('.sim-fb.ok').count() };
  chk(rh.seq.length === 7 && rh.score === '0' && rp.seq.length === 7 && rp.score === '7' && /در ذهن: ۰/.test(info.wm.two) && /با کاغذ: ۷/.test(info.wm.two) && info.wm.fb === 1, 'wm ' + JSON.stringify(info.wm));
  // وضعیتِ پایانی
  const E = sim('endstate');
  await E.locator('[data-plan="start"]').click();
  const lab = await E.locator('svg').getAttribute('aria-label');
  await E.locator('.crs-whyopt:has-text("لحظهٔ پایان")').click();
  info.end = { lab, pressed: await E.locator('[data-plan="start"]').getAttribute('aria-pressed'), ok: await E.locator('.sim-fb.ok').count(), caveat: await E.locator('.ks-caveat').textContent() };
  chk(/شروعِ راحت/.test(info.end.lab) && info.end.pressed === 'true' && info.end.ok === 1 && /قیاسِ حدسی/.test(info.end.caveat) && /قدمِ ۰/.test(info.end.caveat), 'endstate ' + JSON.stringify(info.end));
  // نردبان
  const L = sim('ladder');
  await L.locator('.ks-rung[data-step="3"] button').click(); const l3 = await L.locator('.sim-fb.ok').textContent(); const tried = await L.locator('.ks-rung.tried').count();
  // Minor4: step 0 says exactly what the engine records — weak control evidence (+1) for F4 (stop rule) and F5
  await L.locator('.ks-rung[data-step="0"] button').click(); const l0 = await L.locator('.ks-ladder > div .sim-fb').first().textContent();
  await L.locator('.ks-rung[data-step="6"] button').click(); const l6 = await L.locator('.ks-ladder > div .ks-info').first().textContent();
  await L.locator('.ks-contrast [data-side="a"] .btn:has-text("حل شد")').click(); await L.locator('.ks-contrast [data-side="b"] .btn:has-text("حل نشد")').click();
  const c3 = await L.locator('.ks-contrast .sim-fb.ok').textContent();
  await L.locator('.ks-contrast [data-side="b"] .btn:has-text("حل شد")').click(); const cm3 = await L.locator('.ks-contrast .sim-fb.no').textContent();
  info.ladder = { l3, tried, l0, l6, c3, cm3, rungs: await L.locator('.ks-rung').count() };
  chk(info.ladder.rungs === 7 && /\+۱/.test(l3) && /ظرفیت/.test(l3) && tried === 3 && /کنترل/.test(l0) && /\+۱/.test(l0) && /پایش/.test(l0) && /ظرفیت/.test(l0) && /تشخیصی نیست/.test(l6) && /\+۳/.test(c3) && /−۳/.test(cm3), 'ladder ' + JSON.stringify(info.ladder));
  // یک شبیه‌ساز تنها
  await p.evaluate(() => APP.go('ksims', 'ladder')); await p.waitForTimeout(60);
  chk(await p.locator('main .ks-sim').count() === 1, 'single sim view');
  // موبایل: شبیه‌سازها
  await p.setViewportSize({ width: 390, height: 844 });
  await p.evaluate(() => APP.go('ksims')); await p.waitForTimeout(100);
  await p.locator('main .ks-sim[data-ksim="curse"] .ks-tapbtn').click();
  info.mobSims = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  chk(info.mobSims <= 2, 'mobile sims overflow ' + info.mobSims);
  await p.evaluate(() => APP.go('kmap')); await p.waitForTimeout(60);
  info.mobMap = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  chk(info.mobMap <= 2, 'mobile map overflow ' + info.mobMap);
  await p.setViewportSize({ width: 1280, height: 900 });
  // تم تیره: رنگ‌ها از متغیرها
  await p.evaluate(() => { document.documentElement.setAttribute('data-theme', 'dark'); APP.go('kmap'); }); await p.waitForTimeout(60);
  info.dark = await p.evaluate(() => getComputedStyle(document.querySelector('main .km-n[data-id="k3"] .km-dot')).fill);
  chk(info.dark && info.dark !== info.fills.practised, 'dark theme ' + info.dark);

  console.log(JSON.stringify(info, null, 1).slice(0, 4000));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
