// «🧱 مبنای درجه‌ها» (مالک ۲۰۲۶-۱۰-۱۳: «هیچ عددی نباید قراردادی باشد … به بدیهیات منتقل کن، طبقِ جزوه»).
// ۱) اشتقاق: هر سقفِ عددی دقیقاً یک گونه دارد (B/S/O/X)، هر قضیه از اصولِ تعریف‌شده برهان دارد، هر اصل بخشِ جزوه دارد،
//    کرانِ B با سقف سازگار یا «سخت‌گیرتر» علامت خورده؛ X فقط همان سه قاعده؛ درجه‌ها با مرزهای ½ و ۱.
// ۲) پیش‌فرضِ موتور دست نخورده: حالت‌های deg/derived فقط با گزینه؛ بی گزینه حکم‌ها همان.
// ۳) پایه‌ها: نمونهٔ گزینش‌شده هرگز شمرده نمی‌شود؛ زیرِ آستانه ⇒ بی عدد؛ با ۴۰ گروهِ بی‌گزینش ⇒ عدد، و هرگز ۱۰۰.
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
chk(rep.filter(r => r.k === 'X').map(r => r.id).sort().join() === 'r_istiqra_incomplete,r_istiqra_small_n,r_tajrobe_no_vazraf', 'the three inconsistent caps');
chk(rep.filter(r => r.stricterThanTheorem).every(r => r.cap < 50), 'stricter-than-theorem flags only the sub-half caps');
chk(F.degreeOf(100) === 'yaqin' && F.degreeOf(0) === 'kidhb' && F.degreeOf(50) === 'shakk' && F.degreeOf(51) === 'zann' && F.degreeOf(49) === 'wahm', 'degree boundaries');
// ۲) پیش‌فرض
const cs = T.loadCorpus(), base = X.DEFAULT_CFG('mesbah');
chk(!base.deg && !base.derived, 'default config has no experimental mode');
const same = cs.every(c => { const a = T.verdict(c, base), b = T.verdict(c, Object.assign({}, base, { deg: false, derived: false })); return a.kind === b.kind && a.flagged.join() === b.flagged.join(); });
chk(same, 'experimental options off ⇒ identical verdicts');
const fnd = T.foundation(cs);
chk(fnd.modes.derived.kinds.health_alarm === 0 && fnd.modes.derived.changed.every(c => c.to === 'ok'), 'theorem bounds break no correct verdict ' + JSON.stringify(fnd.modes.derived.changed));
chk(fnd.impacts.p_found_vazraf && fnd.impacts.p_found_vazraf.broken.length === 0 && fnd.impacts.p_found_scope === null, 'proposal impacts measured');
// ۳) پایه‌ها
const mk = (n, sample, t) => Array.from({ length: n }, (_, i) => ({ id: 'g' + i, grp: 'g' + i, sample, claims: [{ truth: t(i), f: { way: 'نقل', narrator: 'موثق' } }] }));
chk(F.measure(mk(500, 'curated', () => true)).p_thiqa.sufficient === false, 'curated sample never counted, however large');
chk(F.measure(mk(12, 'unselected', () => true)).p_thiqa.p === null, 'too few groups ⇒ no number');
const m40 = F.measure(mk(100, 'unselected', () => true)).p_thiqa;
chk(m40.sufficient && m40.p < 100, 'enough unselected groups ⇒ a number, still below certainty ' + JSON.stringify(m40));
const m2 = F.measure(mk(40, 'unselected', i => i % 2 === 0)).p_thiqa;
chk(!m2.sufficient, 'wide interval (p≈½, 40 groups) ⇒ still insufficient');
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
  chk(info.page.ax === 5 && info.page.rows === 42 && info.page.x === 3 && info.page.modes === 4 && info.page.base === 8 && info.page.th >= 10, 'found tab content ' + JSON.stringify(info.page));
  await p.selectOption('main .card select', 'X'); await p.waitForTimeout(80);
  chk(await p.locator('main .found-rules tbody tr').count() === 3, 'filter by class');
  await p.evaluate(() => APP.go('e_bt', null, 'live')); await p.waitForTimeout(200);
  info.props = await p.evaluate(() => [...document.querySelectorAll('main .bt-proposal')].map(x => x.dataset.id + (x.classList.contains('superseded') ? '*' : '')));
  chk(info.props.indexOf('p_tajrobe_none*') >= 0 && info.props.indexOf('p_found_vazraf') >= 0, 'superseded proposal marked, foundation proposals listed ' + info.props);
  await p.click('main .bt-proposal[data-id="p_found_half"] button:has-text("مبنایش")'); await p.waitForTimeout(150);
  chk(await p.locator('main .found-rules').count() === 1, 'proposal links to its foundation');
  await p.setViewportSize({ width: 390, height: 800 }); await p.waitForTimeout(150);
  chk(await p.evaluate(() => document.documentElement.scrollWidth <= 392), 'no horizontal overflow at 390px');
  console.log(JSON.stringify(info));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
