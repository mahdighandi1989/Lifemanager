// رتبه‌بندیِ گره‌گشا برگشته به اصل‌ها (مالک ۲۰۲۶-۱۰-۱۵: «همه چیز باید به بدیهیاتِ یقینی برگردد»):
// A0 — پاسخ فقط تبیینی را رد می‌کند که با آن تناقض دارد؛ «ندیدن» و حدس دربارهٔ حالتِ فرضی چیزی را رد نمی‌کند.
// A1 — خانواده فقط با ردِ همهٔ تبیین‌های فرعی‌اش کنار می‌رود.
// A4 — نشانهٔ مشترکِ چند خانواده «زمینه» است نه شاهد؛ «هیچ‌وقت» ِ متنِ معما دربارهٔ تو نیست.
// بی هیچ عددِ قراردادی: وضع‌ها «شاهد دارد» / «هنوز معلوم نیست» / «کنار رفت».
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = [];
  const p = await b.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  await p.goto(FILE); await p.waitForSelector('.nav');
  const o = await p.evaluate(() => {
    APP.S.loaded = true;
    const mk = (kinds, intake, ev, pans) => ({ id: 'kc_t' + Math.random(), kinds, intake: Object.assign({ stmts: [] }, intake), ev: ev || [], pans: pans || {} });
    const fam = (kc, f) => APP.knotRank(kc).find(r => r.fam === f);
    const pr = id => APP.KF.flatMap(F => F.probes).find(x => x.id === id);
    const ans = (id, v) => { const P = pr(id); const a = { v }; return { pans: { [id]: a }, ev: P.scoreFrom(a).map(e => ({ fam: e.fam, dir: e.dir, sub: e.sub, kind: P.kind, text: P.fa + ' — ' + v, src: 'probe:' + id })) }; };
    const out = {};
    // A4: «هیچ‌وقت» دربارهٔ آشیل ≠ باور دربارهٔ خود؛ «من هیچ‌وقت…» = شاهد
    out.zeno = fam(mk(['problem'], { what: 'آشیل هیچ‌وقت به لاک‌پشت نمی‌رسد؟ چرا؟' }), 'F9').state;
    out.self = fam(mk(['problem'], { thoughts: 'من هیچ‌وقت این معماها را حل نمی‌کنم' }), 'F9').state;
    // A4: نوعِ موقعیت زمینه است
    const k0 = mk(['problem'], {}); out.ctx = ['F1', 'F2', 'F3'].map(f => fam(k0, f).state).join(',');
    // A0: «درست بازگفتم» فقط «بدخوانی» را رد می‌کند
    const a1 = ans('f2_restate', 'ok'); const r1 = fam(mk(['problem'], {}, a1.ev, a1.pans), 'F2');
    out.restate = r1.state + '|' + r1.refSubs.join(',') + '|' + r1.openSubs.includes('rep');
    // A0: «هیچ قیدی پیدا نکردم» (ندیدن) و حدسِ خلافِ واقع چیزی را رد نمی‌کنند
    const a2 = ans('f2_selfcon', 'none'); out.unseen = fam(mk(['problem'], {}, a2.ev, a2.pans), 'F2').refSubs.length;
    const a3 = ans('f7_unseen', 'same'); out.cf = fam(mk(['social'], {}, a3.ev, a3.pans), 'F7').refSubs.length;
    // A1: کنار رفتنِ خانواده فقط با ردِ همهٔ زیرنوع‌ها (F9 با «بی‌طرف‌ها هم همین را می‌گویند»)
    const a4 = ans('f9_neutral', 'agree'); out.allOut = fam(mk(['inference'], {}, a4.ev, a4.pans), 'F9').state;
    const a5 = ans('f4_where', 'some'); out.partOut = fam(mk(['problem'], {}, a5.ev, a5.pans), 'F4').state;
    // ناسازگاری: شاهدِ «بدخوانی» + «درست بازگفتم»
    const a6 = ans('f2_restate', 'ok'); const evx = a6.ev.concat([{ fam: 'F2', dir: 1, sub: 'read', kind: 'manual', src: 'manual', text: 'بعد دیدم بد خوانده بودم' }]);
    out.conflict = fam(mk(['problem'], {}, evx, a6.pans), 'F2').conflict;
    // پروندهٔ قدیمی (شاهدِ ذخیره‌شدهٔ بی‌زیرنوع) با منطقِ تازه سنجیده می‌شود
    const old = mk(['problem'], {}, [{ fam: 'F2', dir: -1, sub: '', w: 1, kind: 'fact', text: 'قدیمی', src: 'probe:f2_restate' }], { f2_restate: { v: 'ok' } });
    out.legacy = fam(old, 'F2').refSubs.join(',');
    // یافتهٔ غربالِ تور (با نقلِ حرفِ کاربر) شاهد است
    const kc = mk(['problem'], {}); APP.S.put(Object.assign({ type: 'kcase' }, kc));
    APP.S.put({ id: 'achat_t', type: 'achat', msgs: [], tour: { facets: [{ key: 'f1', refs: [{ type: 'kcase', id: kc.id }] }], diag: { F4: { st: 'found', why: 'سه بار جمع زدم و وارسی نکردم' } } } });
    out.sieve = fam(kc, 'F4').state + '|' + fam(kc, 'F4').why.some(w => /وارسی نکردم/.test(w));
    // هیچ عددی جز وضع: score فقط −۱/۰/۱
    out.noNums = APP.knotRank(k0).every(r => [-1, 0, 1].includes(r.score) && /^(شاهد دارد|هنوز معلوم نیست|کنار رفت)$/.test(r.stateFa));
    return out;
  });
  chk(o.zeno === 'open' && o.self === 'ev', '«never» about the puzzle is not self-evidence; about oneself it is: ' + o.zeno + '/' + o.self);
  chk(o.ctx === 'open,open,open', 'situation type is context, not evidence: ' + o.ctx);
  chk(o.restate === 'open|read|true', 'restating correctly rules out only misreading (wrong model stays open): ' + o.restate);
  chk(o.unseen === 0 && o.cf === 0, 'not finding / a counterfactual guess rules nothing out: ' + o.unseen + ',' + o.cf);
  chk(o.allOut === 'out' && o.partOut !== 'out', 'a family is out only when every sub-explanation is contradicted: ' + o.allOut + '/' + o.partOut);
  chk(o.conflict === true, 'support and contradiction on the same sub-explanation are flagged');
  chk(o.legacy === 'read', 'stored old evidence is re-read with the current rule: ' + o.legacy);
  chk(o.sieve === 'ev|true', 'a sieve finding with the user\'s words counts as evidence: ' + o.sieve);
  chk(o.noNums, 'no conventional numbers: only the three states');
  console.log(JSON.stringify(o));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
