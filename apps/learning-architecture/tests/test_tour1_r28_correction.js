// تورِ پولیا (دستهٔ ۱، دورِ ۲۸، ۲۰۲۶-۱۱-۱۶) — DECISIONS_R28 R2 «CORRECTION» (C87، C88، C89؛ خانواده‌های F7، F8؛ fixer «correction»).
//  نقص‌های گروه‌های A، B، C، D با **نوبتِ خودِ دونده** — بازپخشِ همان گام‌های کنترل و همان جواب‌های مدل روی صفحهٔ ساخته‌شده (tests/tour1_r26_replay.js با opt.dir؛
//  fixtureها: tests/fixtures/r28_correction/<گروه>_<سناریو>.json از T/round28X/<sid>/ctl و ai). «Reproduce first»: هر مثبت روی BASE28 (4001c4cf) قرمز بود — «base» ِ هر مورد.
//  LLA_R28_ONLY=نام،نام فقط همان موردها. هیچ تاریخِ تقویمی در انتظارها نیست (ساعتِ صفحه روی روزِ همان اجرا ثابت است).
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r26_replay.js');
const DIR = path.join(__dirname, 'fixtures', 'r28_correction');
const J = (x) => JSON.stringify(x);
const SNAP = () => { const s = APP.ASSIST.cur(), C = s.coach || {}, T = C.story || {};
  const books = []; (APP.liveAll ? APP.liveAll() : []).forEach(r => { const L = ((APP.S.get('eprog_' + r.p.id) || {}).solve || {}).live || {}; if (L.prior) books.push({ pid: r.p.id, steps: L.prior.steps.map(x => ({ n: x.n, t: (x.fixed && x.fixed.t) || x.quote, st: (x.stale || x.stale25 || {}).nums || null })) }); });
  Object.keys(T).forEach(k => { if (T[k] && T[k].prior) books.push({ key: k, steps: T[k].prior.steps.map(x => ({ n: x.n, t: (x.fixed && x.fixed.t) || x.quote, st: (x.stale || {}).nums || null })) }); });
  const stale = (APP.liveAll ? APP.liveAll() : []).reduce((a, r) => a.concat(APP.liveStale(r.p.id).map(x => ({ k: x.k.replace(/achat_\w+:/, ''), v: x.v, re: x.re }))), []);
  return { sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text), books, stale }; };
const near = (a, b) => a != null && b != null && Math.abs(a - b) < 1e-6;
const corrLines = (x) => x.sys.filter(t => /اصلاح شد|پذیرفتی|کدام/.test(t));
const CASES = {
  // A28-14 (s04 p14): «اشتباه گفتم: ما ۵ نفر وارثیم نه ۴ نفر» ⇒ «داده به حرفِ خودت: «۵» (اصلاح شد ⇐ «۱۱ میلیارد تقسیم بر ۴ نفر میشه ۲٫۷۵ میلیارد برای هر»)»
  A_s04_p14: { fx: 'A_s04', upto: 104, name: 'A28-14 s04: the datum line names the smallest fragment «۴ ⇒ ۵», never the whole sentence; proposals stay exact (۲٫۷۵ ⇒ ۲٫۲، ۲۷۵۰ ⇒ ۲۲۰۰، ۲۷۵ ⇒ ۲۲۰)',
    base: '«داده به حرفِ خودت: «۵» (اصلاح شد ⇐ «۱۱ میلیارد تقسیم بر ۴ نفر میشه ۲٫۷۵ میلیارد برای هر»)»',
    check: (x) => { const L = corrLines(x).pop() || ''; return { ok: /داده به حرفِ خودت: «۵(?: نفر)?» \(اصلاح شد ⇐ «۴(?: نفر)?»\)/.test(L) && !/اصلاح شد ⇐ «۱۱ میلیارد/.test(L) && /۲٫۷۵ ⇒ ۲٫۲/.test(L), got: L.slice(0, 500) }; } },
  // A28-16 (s04 p19, no ledger): «آره، همون ۲٫۲ درسته» ⇒ no line, ۲٫۷۵ stayed stale (C68 only in the ledger)
  A_s04_p19: { fx: 'A_s04', upto: 133, name: 'A28-16 s04 (live problem, no ledger): accepting «۲٫۲» is a correction — one line names it and the dependants still stale (۲۷۵۰ ⇒ ۲۲۰۰، ۲۷۵ ⇒ ۲۲۰); the accepted value leaves the stale list',
    base: 'no page line; ۲٫۷۵ stays in «🕰 کهنه»',
    check: (x) => { const L = x.sys[x.sys.length - 1] || ''; return { ok: /پذیرفتی — «۲٫۷۵ ⇒ ۲٫۲»/.test(L) && /۲۷۵۰ ⇒ ۲۲۰۰/.test(L) && !x.stale.some(z => near(z.v, 2.75)) && x.stale.some(z => near(z.v, 2750) && near(z.re, 2200)), got: { L: L.slice(0, 400), stale: x.stale } }; } },
  // … منفی: «نه، ۲۲۰ نیست» چیزی را نمی‌پذیرد
  A_s04_neg: { fx: 'A_s04', upto: 136, name: 'A28-16 look-alike s04: «نه، ۲۲۰ نیست» accepts nothing; ۲۷۵ ⇒ ۲۲۰ stays',
    check: (x) => { const acc = x.sys.filter(t => /پذیرفتی/.test(t)); return { ok: acc.length === 1 && x.stale.some(z => near(z.v, 275) && near(z.re, 220)), got: { acc, stale: x.stale } }; } },
  // A28-16 (pwA2 p8, ledger): «آره، همون ۲۰ درسته» ⇒ nothing (۲۴ ⇒ ۲۰ was proposed in step 1 and step 2 ⇒ two hits ⇒ refused; the mark then vanished silently)
  A_pwA2_p8: { fx: 'A_pwA2', upto: 57, name: 'A28-16 pwA2: «آره، همون ۲۰ درسته» rewrites step 1 to «۱۰ × ۲ = ۲۰» with history (the same quantity proposed in two steps has one home); step 2–4 keep exact proposals',
    base: 'no line; step 1 unchanged and its stale mark silently removed',
    check: (x) => { const b = x.books.filter(k => k.steps.some(s => /روز دوم/.test(s.t)))[0] || { steps: [] }, s1 = b.steps[0] || {}, L = x.sys[x.sys.length - 1] || '';
      return { ok: /۱۰ × ۲ = ۲۰/.test(s1.t) && /پذیرفتی — گامِ ۱/.test(L) && /۳۶ ⇒ ۳۰/.test(L), got: { s1, L: L.slice(0, 400) } }; } },
  // A28-38 (pwA2 p7): «۳ ⇒ ۲٫۵» — آن «۱۲» ِ «۱۲ تقسیم بر ۴ میشه ۳» صفحه‌های مانده بود (هم‌رقمِ «روز اول ۱۲ صفحه» و هم‌رقمِ حاصلِ کهنهٔ «مونده … = ۱۲»)
  A_pwA2_p7: { fx: 'A_pwA2', upto: 54, name: 'A28-38 pwA2: an operand equal both to the corrected datum and to an earlier stale result has two meanings — «۳» is stale but gets no number (never «۳ ⇒ ۲٫۵»); ۲۴ ⇒ ۲۰، ۳۶ ⇒ ۳۰، ۱۲ ⇒ ۱۸ stay exact',
    base: '«… ۱۲ ⇒ ۱۸، ۳ ⇒ ۲٫۵»',
    check: (x) => { const L = corrLines(x).pop() || ''; return { ok: !/۳ ⇒ ۲٫۵/.test(L) && /۲۴ ⇒ ۲۰/.test(L) && /۳۶ ⇒ ۳۰/.test(L) && /۱۲ ⇒ ۱۸/.test(L) && /«۳»/.test(L), got: L.slice(0, 600) }; } },
  // B28·D8 (nB1 p4): «سومی رو قبول دارم …: ۲ میلیون و ۸۰۰ منهای ۵۰۰ هزار میشه ۲ میلیون و ۳۰۰» ⇒ «داده: «۳۰۰» (اصلاح شد ⇐ «۸۰۰»)»
  B_nB1_p4: { fx: 'B_nB1', upto: 4, name: 'B28·D8 nB1: fixing a RESULT changes only the result fragment «۲ میلیون و ۵۰۰ ⇒ ۲ میلیون و ۳۰۰»; the glue datum «۸۰۰» is never touched',
    base: '«داده به حرفِ خودت: «۳۰۰» (اصلاح شد ⇐ «۸۰۰»)»',
    check: (x) => { const L = corrLines(x).pop() || ''; return { ok: !/«۳۰۰» \(اصلاح شد ⇐ «۸۰۰»\)/.test(J(x.sys)) && /۲ میلیون و ۳۰۰» \(اصلاح شد ⇐ «۲ میلیون و ۵۰۰/.test(L), got: L.slice(0, 400) }; } },
  // D28-12 (tD1 p5): «۵ متر نیست، ۵٫۵ متره» ⇒ «۴ متر» replaced; proposals 20⇒27.5 …
  D_tD1_p5: { fx: 'D_tD1', upto: 7, name: 'D28-12 tD1: «۵ متر نیست، ۵٫۵ متره» changes the «۵ متر» she named — proposals ۲۰ ⇒ ۲۲ and ۳۰۰۰ ⇒ ۳۳۰۰; never ۲۷٫۵ / ۴۱۲۵ / «در ۵٫۵ متر»',
    base: '«… در ۵٫۵ متر …» (⇐ «… در ۴ متر …»); ۲۰ ⇒ ۲۷٫۵، ۳۰۰۰ ⇒ ۴۱۲۵',
    check: (x) => { const L = corrLines(x).pop() || ''; return { ok: /۲۰ ⇒ ۲۲(?![٫\d۰-۹])/.test(L) && /۳۰۰۰ ⇒ ۳۳۰۰/.test(L) && !/۲۷٫۵|۴۱۲۵|در ۵٫۵ متر/.test(L), got: L.slice(0, 500) }; } },
  // D28-13 (tD1 p7): «آره، همون ۴۱۲۵ درسته» rewrote step 4 to «۲۷٫۵ × ۱۵۰ = ۴۱۲۵»
  D_tD1_p7: { fx: 'D_tD1', upto: 12, name: 'D28-13 tD1: no step is ever rewritten with the wrong base «۲۷٫۵ × ۱۵۰ = ۴۱۲۵»',
    base: 'step 4 «دستمزدِ نصب متری ۱۵۰ هزار: ۲۷٫۵ × ۱۵۰ = ۴۱۲۵ هزار تومن»',
    check: (x) => { const t = J(x.books); return { ok: !/۲۷٫۵ × ۱۵۰|۴۱۲۵/.test(t) && !/۴۱۲۵/.test(J(x.sys)), got: x.books.map(b => b.steps.map(s => s.t).join(' | ')) }; } },
};
(async () => {
  const b = await chromium.launch(); const errors = [], info = {};
  const names = Object.keys(CASES).filter(n => !process.env.LLA_R28_ONLY || process.env.LLA_R28_ONLY.split(',').includes(n));
  for (const n of names) { const c = CASES[n]; let r;
    try { const R = await replay(b, c.fx, { dir: DIR, upto: c.upto }); const x = await R.p.evaluate(SNAP); if (R.errors.length) errors.push(n + ' page errors: ' + R.errors.join(' | ')); r = c.check(x); await R.close(); }
    catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; }
    info[n] = !!r.ok; if (!r.ok) errors.push(n + ' — ' + c.name.slice(0, 90) + ' got ' + J(r.got).slice(0, 1500)); }
  console.log(J({ runners: info }));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
