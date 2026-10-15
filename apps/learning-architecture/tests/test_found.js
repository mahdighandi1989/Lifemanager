// «🧱 مبنای درجه‌ها» (مالک ۲۰۲۶-۱۰-۱۳: «هیچ عددی نباید قراردادی باشد … به بدیهیات منتقل کن، طبقِ جزوه»).
// ۱) اشتقاق: هر سقفِ عددی دقیقاً یک گونه دارد (B/S/O/X)، هر قضیه از اصولِ تعریف‌شده برهان دارد، هر اصل بخشِ جزوه دارد،
//    کرانِ B با سقف سازگار یا «سخت‌گیرتر» علامت خورده؛ X فقط همان سه قاعده؛ درجه‌ها با مرزهای ½ و ۱.
// ۲) پیش‌فرضِ موتور دست نخورده: حالت‌های deg/derived فقط با گزینه؛ بی گزینه حکم‌ها همان.
// ۳) پایه‌ها: (k+1)/(n+2) روی نمونه‌های بی‌گزینش؛ بی‌داده ½؛ احرازنشده شمرده نمی‌شود؛ قابِ گزینش‌شده رد؛ مقدارِ سنجیده همان سقف؛ هرگز ۱۰۰.
// ۴) صفحه: زبانهٔ «🧱 مبنای درجه‌ها» با اصول، قضیه‌ها، جدولِ ۴۲ سقف، حالت‌ها و پایه‌ها؛ پیشنهادهای مبنایی پیوند دارند.
const path = require('path');
const errors = []; const chk = (c, m) => { if (!c) errors.push(m); };
const T = require(path.join(__dirname, '..', 'tools', 'epi_backtest.js'));
const F = global.EPI_FOUND, X = global.EPIX, RULES = global.EPI_RULES;
const caps = RULES.filter(r => r.eff === 'cap');
chk(caps.every(r => F.DER[r.id] && 'BSOX'.indexOf(F.DER[r.id].k) >= 0), 'every cap rule classified');
chk(Object.keys(F.DER).every(id => caps.some(r => r.id === id)), 'no derivation for a non-existent rule');
const AX = F.AX.map(a => a.id);
chk(Object.values(F.TH).every(t => t.proof && t.from.length && t.from.every(a => AX.indexOf(a) >= 0)), 'every theorem proved from defined axioms');
chk(F.AX.every(a => a.sec.length) && F.AX.some(a => /کل از جزء/.test(a.fa)), 'axioms cite the booklet (incl. its own example of a primary truth)');
chk(Object.values(F.DER).every(d => F.TH[d.th]), 'every derivation names a real theorem');
chk(Object.values(F.DER).filter(d => d.k === 'S').every(d => F.BASE[d.base]), 'every S rule names a base parameter');
const rep = F.report();
chk(rep.filter(r => r.k === 'B').every(r => r.consistent === true), 'B caps never exceed their theorem bound');
chk(rep.filter(r => r.k === 'X').length === 0, 'no cap inconsistent with its theorem');
chk(rep.filter(r => r.conventional).length === 0 && T.axiomAudit().length === 0, 'no conventional number; axiom audit clean ' + JSON.stringify(T.axiomAudit()));
chk(X.COURT.tol === 0, 'no conventional tolerance');
chk(EPI_RULES.filter(r => r.capf).every(r => F.CAPF[r.capf]) && F.CAPF.next({ ind_n: 9 }) === 100 * 10 / 11 && F.CAPF.finite({ ind_n: 30, dom_n: 30 }) === 100 && F.CAPF.finite({ ind_n: 4, dom_n: 99 }) === 5, 'formula caps are the theorems');
chk(F.report().filter(r => r.stricterThanTheorem).length === 0, 'accepted: no cap is stricter than its theorem without proof');
chk(F.degreeOf(100) === 'yaqin' && F.degreeOf(0) === 'kidhb' && F.degreeOf(50) === 'shakk' && F.degreeOf(51) === 'zann' && F.degreeOf(49) === 'wahm', 'degree boundaries');
// ۲) پیش‌فرض
const cs = T.loadCorpus(), base = X.DEFAULT_CFG('mesbah');
chk(!base.deg && !base.derived, 'default config has no experimental mode');
const same = cs.every(c => { const a = T.verdict(c, base), b = T.verdict(c, Object.assign({}, base, { deg: false, derived: false })); return a.kind === b.kind && a.flagged.join() === b.flagged.join(); });
chk(same, 'experimental options off ⇒ identical verdicts');
const fnd = T.foundation(cs);
chk(fnd.modes.derived.changed.every(c => c.to === 'ok'), 'theorem bounds break no correct verdict ' + JSON.stringify(fnd.modes.derived.changed));
chk(fnd.impacts.p_found_vazraf && fnd.impacts.p_found_vazraf.broken.length === 0, 'proposal impacts measured');
// گسترهٔ ادعا: «کلی نامحدود» ⇒ صفرِ حدی، «موردِ بعدی» ⇒ (n+1)/(n+2)؛ تصدیقِ بی‌گستره همان قاعدهٔ گذرا
const run1 = f => X.runClaim({ id: 'k', f: Object.assign({ way: 'استقراء', ind_complete: false, conf: 60 }, f) }, base);
chk(run1({ scope: 'کلی نامحدود', ind_n: 4000 }).bind === 'r_istiqra_universal' && run1({ scope: 'کلی نامحدود' }).over, 'universal from counting ⇒ limit-zero cap');
chk(run1({ scope: 'مورد بعدی', ind_n: 9, conf: 90 }).ceil === 91 && !run1({ scope: 'مورد بعدی', ind_n: 9, conf: 90 }).over && run1({ scope: 'مورد بعدی', ind_n: 9, conf: 92 }).over, 'next case ⇒ (n+1)/(n+2)');
chk(run1({ ind_n: 5 }).fired.indexOf('r_istiqra_small_n') >= 0 && run1({ scope: 'مورد بعدی', ind_n: 5 }).fired.indexOf('r_istiqra_small_n') < 0, 'transitional rules only for claims without scope');
chk(run1({ ind_n: 5, conf: 100 }).over && !run1({ ind_n: 5, conf: 99 }).over, 'unscoped induction ⇒ only «less than certainty»');
chk(X.runClaim({ id: 'k', f: { way: 'یادآوری', mem_orig: 40, mem_doc: true, conf: 45 } }, base).over && X.runClaim({ id: 'k', f: { way: 'یادآوری', mem_orig: 40, mem_doc: false, conf: 46 } }, base).over
  && !X.runClaim({ id: 'k', f: { way: 'یادآوری', mem_orig: 40, mem_doc: false, conf: 45 } }, base).over && !X.runClaim({ id: 'k', f: { way: 'یادآوری', mem_orig: 100, mem_doc: false, conf: 75 } }, base).over
  && X.runClaim({ id: 'k', f: { way: 'یادآوری', mem_orig: 100, mem_doc: false, conf: 76 } }, base).over,
  'memory (p_found_mixture, T_support): documented ⇒ ≤ original; undocumented ⇒ q·original + (1−q)·½ with q = measured reliability (½ without data)');
// ۳) پایه‌ها: قضیهٔ (k+1)/(n+2) روی نمونه‌های بی‌گزینش؛ بی‌داده ½؛ موردِ احرازنشده شمرده نمی‌شود؛ قاب بی «frame» رد
const fr = (n, t, extra) => [{ id: 'fr1', frame: 'همهٔ خبرهای واحدِ ثقهٔ یک بایگانیِ معین در یک بازهٔ معین', src: ['s'], selected_by_outcome: false,
  items: Array.from({ length: n }, (_, i) => Object.assign({ id: 'i' + i, txt: 't', f: { way: 'نقل', narrator: 'موثق' }, truth: t(i), verified_by: ['سند'] }, extra ? extra(i) : {})) }];
chk(F.measure([]).p_mem.p === 50 && !F.measure([]).p_mem.measured && F.measure([]).p_thiqa.p === 99.9 && !F.measure([]).p_thiqa.measured, 'no data ⇒ ½ (T_pop n = 0) for a neutral class; favourable class (p_thiqa: s47 + s80 + T_null) ⇒ only T_below1');
chk(F.measure(fr(20, i => i < 18)).p_thiqa.p === +(100 * 19 / 22).toFixed(1), '18 of 20 ⇒ (k+1)/(n+2)');
chk(F.measure(fr(500, () => true)).p_thiqa.p < 100, 'never certainty');
chk(F.measure(fr(10, () => true, () => ({ verified_by: [] }))).p_thiqa.n === 0, 'unverified items are not counted');
chk(T.validateFrame({ id: 'x', frame: 'کوتاه', src: [], items: [] }).length >= 3 && T.validateFrame(fr(2, () => true)[0]).length === 0, 'frame validation');
chk(T.validateFrame(Object.assign({}, fr(2, () => true)[0], { selected_by_outcome: true })).some(e => /selected_by_outcome/.test(e)), 'outcome-selected frames refused');
const savedLed = global.EPI_BT_LEDGER; global.EPI_BT_LEDGER = { baseval: { p_thiqa: 86.4 } };
chk(X.runClaim({ id: 'k', f: { way: 'نقل', narrator: 'موثق', tawatur: false, conf: 85 } }, base).ceil === 86 && X.runClaim({ id: 'k', f: { way: 'نقل', narrator: 'موثق', tawatur: false, conf: 87 } }, base).over, 'measured base value becomes the cap');
global.EPI_BT_LEDGER = savedLed;
chk(T.validate(Object.assign({}, cs.find(c => c.tier === 'real' && c.src), { sample: 'random' })).some(e => /sample/.test(e)), 'sample value validated');

(async () => {
  const { chromium } = require('playwright');
  const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
  const b = await chromium.launch(); const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav');
  await p.evaluate(() => APP.go('e_bt', null, 'found')); await p.waitForTimeout(300);
  info.page = await p.evaluate(() => ({ ax: document.querySelectorAll('main .found-ax li').length, rows: document.querySelectorAll('main .found-rules tbody tr').length,
    x: document.querySelectorAll('main .found-rules tbody tr[data-k="X"]').length, modes: document.querySelectorAll('main .found-modes tbody tr').length,
    base: document.querySelectorAll('main .found-base tbody tr').length, th: document.querySelectorAll('main .found-th li').length }));
  chk(info.page.ax === 5 && info.page.rows === caps.length && info.page.x === 0 && info.page.modes === 4 && info.page.base === Object.keys(F.BASE).length && info.page.th >= 10, 'found tab content ' + JSON.stringify(info.page));
  await p.selectOption('main .card select', 'O'); await p.waitForTimeout(80);
  chk(await p.locator('main .found-rules tbody tr').count() === rep.filter(r => r.k === 'O').length, 'filter by class');
  chk(/۰/.test(await p.locator('main .found-conv .bt-num').innerText()), 'page shows zero conventional numbers');
  await p.evaluate(() => APP.go('e_bt', null, 'live')); await p.waitForTimeout(200);
  info.props = await p.evaluate(() => [...document.querySelectorAll('main .bt-proposal')].map(x => x.dataset.id + (x.classList.contains('superseded') ? '*' : '')));
  chk(info.props.indexOf('p_tajrobe_none*') >= 0 && info.props.indexOf('p_found_vazraf') >= 0 && await p.locator('main .bt-applied').count() === require(path.join(__dirname, '..', 'backtest', 'proposals.json')).proposals.filter(x => x.applied).length, 'superseded proposal marked, foundation proposals listed ' + info.props);
  await p.click('main .bt-proposal[data-id="p_found_half"] button:has-text("مبنایش")'); await p.waitForTimeout(150);
  chk(await p.locator('main .found-rules').count() === 1, 'proposal links to its foundation');
  await p.setViewportSize({ width: 390, height: 800 }); await p.waitForTimeout(150);
  chk(await p.evaluate(() => document.documentElement.scrollWidth <= 392), 'no horizontal overflow at 390px');
  console.log(JSON.stringify(info));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
