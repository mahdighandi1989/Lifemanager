// تورِ پولیا (دستهٔ ۱، دورِ ۲۹، ۲۰۲۶-۱۱-۱۷) — DECISIONS_R29 R2 «CORRECTION» (خانوادهٔ F8: C89 با یک تابعِ پیشنهاد و قرنطینهٔ راهِ نسبت، C142، C143، C160، C162؛ D29-5، D29-23، D29-26؛ fixer «correction»).
//  نقص‌های گروه‌های A، B، C، D با **نوبتِ خودِ دونده** — بازپخشِ همان گام‌های کنترل و همان جواب‌های مدل روی صفحهٔ ساخته‌شده (tests/tour1_r26_replay.js با opt.dir؛
//  fixtureها: tests/fixtures/r29_correction/<گروه>_<سناریو>.json از T/round29X/<sid>/ctl و ai). «Reproduce first»: هر مثبت روی BASE29 (40b34a51) قرمز بود — «base» ِ هر مورد
//  (LLA_FILE=<صفحهٔ ساخته از BASE29> همین آزمون را قرمز می‌کند). LLA_R29_ONLY=نام،نام فقط همان موردها. هیچ تاریخِ تقویمی در انتظارها نیست (ساعتِ صفحه روی روزِ همان اجرا ثابت است).
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r26_replay.js');
const DIR = path.join(__dirname, 'fixtures', 'r29_correction');
const J = (x) => JSON.stringify(x);
const SNAP = () => { const s = APP.ASSIST.cur(), C = s.coach || {}, T = C.story || {};
  const books = []; (APP.liveAll ? APP.liveAll() : []).forEach(r => { const L = ((APP.S.get('eprog_' + r.p.id) || {}).solve || {}).live || {}; if (L.prior) books.push({ pid: r.p.id, steps: L.prior.steps.map(x => ({ n: x.n, t: (x.fixed && x.fixed.t) || x.quote, st: (x.stale || x.stale25 || {}).nums || null })) }); });
  Object.keys(T).forEach(k => { if (T[k] && T[k].prior) books.push({ key: k, steps: T[k].prior.steps.map(x => ({ n: x.n, t: (x.fixed && x.fixed.t) || x.quote, st: (x.stale || {}).nums || null })) }); });
  const story = Object.keys(T).reduce((a, k) => a.concat(((T[k] && T[k].items) || []).map(it => it.k + ':' + it.t)), []);
  const ev = (s.coachEv || []).filter(e => e && !e.wd && (e.how === 'res' || e.how === 'solved')).map(e => ({ span: (e.src20 || {}).span || '', rej: !!e.rej29 }));
  return { sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text), stmt: C.stmt || '', books, story, ev }; };
const lastCorr = (x) => x.sys.filter(t => /اصلاح شد|پذیرفتی|کدام|جاری/.test(t)).pop() || '';
const CASES = {
  // B29·D13 (nB2 p8): «ببخشید باز اصلاح: ۱۸ هم نه، ۲۰ هزار تومنه» ⇒ «۴۵۰ ⇒ ۴۸۰، ۶ ⇒ ۶٫۴، ۳۰ ⇒ ۳۲»
  B_nB2_p8: { fx: 'B_nB2', upto: 8, name: 'B29·D13 nB2: a second correction of the same datum (C142) is recomputed from the datum\'s first value with its current value — ۴۵۰ ⇒ ۶۰۰ (30 × 20); never 480 (32 × 15), never «۳۰ ⇒ ۳۲» (her count) or «۶ ⇒ ۶٫۴» (ratio, C89)',
    base: '«عددهای حساب‌شده از «۱۸ هزار»: «۴۵۰، ۶، ۳۰» … (۴۵۰ ⇒ ۴۸۰، ۶ ⇒ ۶٫۴، ۳۰ ⇒ ۳۲)»',
    check: (x) => { const L = lastCorr(x); return { ok: /۴۵۰ ⇒ ۶۰۰/.test(L) && !/۴۸۰|۶ ⇒ ۶٫۴|۳۰ ⇒ ۳۲/.test(L), got: L.slice(0, 500) }; } },
  // B29·D13 (nB2 p9): «آره، همون ۵۴۰ هزار درسته» ⇒ «… پیشنهادِ دقیقِ جاری: ۴۵۰ ⇒ ۴۸۰»
  B_nB2_p9: { fx: 'B_nB2', upto: 9, name: 'B29·D13 nB2: accepting the proposal built on the superseded 18 names the stale base and shows the exact current proposal ۴۵۰ ⇒ ۶۰۰ (C87/C111)',
    base: '«پیشنهادِ دقیقِ جاری: ۴۵۰ ⇒ ۴۸۰»',
    check: (x) => { const L = x.sys[x.sys.length - 1] || ''; return { ok: /جاری: ۴۵۰ ⇒ ۶۰۰/.test(L) && /کهنه/.test(L), got: L.slice(0, 400) }; } },
  // D29-11 (tD1 p29): «دستمزدِ نصب متری ۱۵۰ نیست، ۱۸۰ هزاره» ⇒ «۱۸ ⇒ ۱۵، ۲ ⇒ ≈ ۱٫۶۷، ۶ ⇒ ۵» و «۳۰۰۰ ⇒ ۳۶۰۰»
  D_tD1_p29: { fx: 'D_tD1', upto: 53, name: 'D29-11 tD1: the installation step uses the current area (5.5 × 4 = 22): ۳۰۰۰ ⇒ ۳۹۶۰ (C89, current value of every datum); no ratio-scaled count (۱۸ ⇒ ۱۵، ۶ ⇒ ۵، ۲ ⇒ ≈ ۱٫۶۷), no «۶ تا می‌مونه … بنا بود»',
    base: '«۳ ⇒ ۳٫۶، ۳۰۰۰ ⇒ ۳۶۰۰، ۱۸ ⇒ ۱۵، ۲ ⇒ ≈ ۱٫۶۷، ۶ ⇒ ۵» (runner) / «۳۰۰۰ ⇒ ۳۶۰۰ … ۶ ⇒ ۷٫۲» (replay)',
    check: (x) => { const L = x.sys.filter(t => /از «۱۵۰»/.test(t)).pop() || ''; return { ok: /۳۰۰۰ ⇒ ۳۹۶۰/.test(L) && !/۱۸ ⇒ ۱۵|۶ ⇒ ۵|۱٫۶۷|۶ ⇒ ۷٫۲|۶ تا می‌مونه/.test(L), got: L.slice(0, 600) }; } },
  // D29-5 (tD1 p8): «نه، ۲۷٫۵ نیست. منظورم طول بود: ۵٫۵ متر در ۴ متر میشه ۲۲ مترمربع.» ⇒ «… گام ۵٫۵: جمع …»
  D_tD1_p8: { fx: 'D_tD1', upto: 14, name: 'D29-5 tD1: a step label «گام ۵» is never rewritten by a correction of the value 5',
    base: '«صورتِ مسئلهٔ گفت‌وگو: «… گام ۵٫۵: جمع …» (اصلاح شد ⇐ «… گام ۵: جمع …»)»',
    check: (x) => ({ ok: !/گام ۵٫۵/.test(J([x.sys, x.stmt])), got: x.sys.slice(-2).map(t => t.slice(0, 300)) }) },
  // D29-26 (arD2 p2/p3): «عرضِ حیاط ۵ نیست، ۴ متره» ⇒ statement unchanged; «ارتفاعِ تیرِ چراغ هم ۱۵ متر نیست، ۱۲ متره» ⇒ «چراغ ۱۲ متر و»
  D_arD2_p3: { fx: 'D_arD2', upto: 3, name: 'D29-26 arD2: «عرض ۵ نیست، ۴» changes the «۵» of the fragment she named in the statement (C88); «۱۵ متره ⇒ ۱۲» changes only the digits — «متره» stays byte-exact',
    base: 'statement keeps «حیاط ۵ متر»; «… چراغ ۱۲ متر و …» (⇐ «… چراغ ۱۵ متره و …»)',
    check: (x) => ({ ok: /حیاط ۴ متر در ۸ متره/.test(x.stmt) && /چراغ ۱۲ متره و/.test(x.stmt) && /\(۵ \+ ۸\)/.test(x.stmt), got: x.stmt.slice(0, 400) }) },
  // D29-23 (s31 p9): «… پس جوابم غلط بود!» ⇒ the record «۵×۵=۲۵» was rewritten
  D_s31_p9: { fx: 'D_s31', upto: 9, name: 'D29-23 s31: «پس جوابم غلط بود» marks her result as rejected by her (C142/C74) — the record «۵×۵=۲۵» is never rewritten with her new numbers',
    base: 'the result record rewritten «… (اصلاح شد ⇐ «۵×۵=۲۵»)»',
    check: (x) => { const t = J([x.sys, x.story, x.ev]); return { ok: !/اصلاح شد ⇐ «[^»]*۵×۵=۲۵/.test(J(x.sys)) && !/۲\.۵\^۴ حدود ۳۹/.test(J(x.ev.map(e => e.span))), got: { sys: x.sys.slice(-2), ev: x.ev } }; } },
  // A29-14 (s04 p21): «ای وای، باز یکی جا افتاد: خاله‌م هم سهم داره، پس ۶ نفریم نه ۵.» ⇒ «از آن بخشِ پیامت چیزی در صفحه ثبت نشده بود»
  A_s04_p21: { fx: 'A_s04', upto: 147, name: 'A29-14 s04: a second (fourth) correction of the same datum is accepted (C142) and every share is recomputed from her own writing with 6 (11 ÷ 6); never «چیزی ثبت نشده بود»',
    base: '«اصلاحت رسید، ولی از آن بخشِ پیامت چیزی در صفحه ثبت نشده بود»',
    check: (x) => { const L = x.sys.filter(t => /۶ نفر/.test(t)).pop() || ''; return { ok: /۲٫۷۵ ⇒ ≈ ۱٫۸۳/.test(L) && !/√/.test(L) && !/ثبت نشده بود/.test(x.sys[x.sys.length - 1] || ''), got: x.sys.slice(-2).map(t => t.slice(0, 400)) }; } },
  // A29-15 (s04 p24): «قیمتِ خونه ۱۱ میلیارد نیست، ۱۲ میلیارده» ⇒ proposals with the stale 4/5 heirs
  A_s04_p24: { fx: 'A_s04', upto: 150, name: 'A29-15 s04: after «۱۲ میلیارد» the shares use the current heirs (6): ۲٫۷۵ ⇒ ۲ and ۲٫۲ ⇒ ۲ (12 ÷ 6); never ۲٫۴ (12 ÷ 5) or ۳ (12 ÷ 4)',
    base: '«۲٫۲ ⇒ ۲٫۴» / no proposals',
    check: (x) => { const L = x.sys.filter(t => /۱۲ میلیارد/.test(t)).pop() || ''; return { ok: /۲٫۷۵ ⇒ ۲(?![٫\d۰-۹])/.test(L) && /۲٫۲ ⇒ ۲(?![٫\d۰-۹])/.test(L) && !/۲٫۷۵ ⇒ ۳|عددهای[^·]*۲٫۲ ⇒ ۲٫۴/.test(L), got: L.slice(0, 700) }; } },
  // C29-14 (s23 p14): «قطرِ قالبِ گردِ مادرم ۲۰ نیست، ۲۲ سانته» ⇒ «۱٫۷۵ ⇒ ≈ ۱٫۵۹۰۹» = 35/22 with the stale 35
  C_s23_p14: { fx: 'C_s23', upto: 162, name: 'C29-14 s23: the factor uses the current mould length 30 (corrected from 35 earlier): ۱٫۵ ⇒ ≈ ۱٫۳۶۴ (30/22); never 35/22 ≈ ۱٫۵۹',
    base: '«۱٫۷۵ ⇒ ≈ ۱٫۵۹۰۹»',
    check: (x) => { const L = x.sys.filter(t => /۲۲ سانت/.test(t)).pop() || ''; return { ok: /۱٫۵ ⇒ ≈ ۱٫۳۶/.test(L) && !/۱٫۵۹/.test(L), got: L.slice(0, 700) }; } },
  // C29-13 (s23 p18): «یه اصلاحِ دیگه: هر کیک ۸ تیکه نمیشه، ۱۰ تیکه میشه» ⇒ refused «نشانهٔ اصلاح … نبود»
  C_s23_p18: { fx: 'C_s23', upto: 170, name: 'C29-13 s23: «X نمیشه، Y میشه» after «یه اصلاحِ دیگه:» is a correction (C142) — never «این اصلاح انجام نشد … نشانهٔ اصلاح … نبود»',
    base: '«این اصلاح انجام نشد: در این پیام نشانهٔ اصلاحِ حرفِ قبلی نبود»',
    check: (x) => { const L = x.sys[x.sys.length - 1] || ''; return { ok: !/انجام نشد|نشانهٔ اصلاح/.test(L) && /کهنه|اصلاح شد/.test(L), got: L.slice(0, 400) }; } },
  // C29-15 (s25 p25): «منظورم n از ۱ تا ۲۰ بود، نه از ۱ تا ۱۰» ⇒ «… ۱/(n(n+2)) n از ۱ تا ۲۰ n = ۱ تا ۱۰ …» (garbled)
  C_s25_p25: { fx: 'C_s25', upto: 151, name: 'C29-15 s25: a range is replaced as one unit (C143) — «از n = ۱ تا ۲۰»; never the garbled «n از ۱ تا ۲۰ n = ۱ تا ۱۰»',
    base: '«صورتِ مسئلهٔ گفت‌وگو: «۱/(n(n+2)) n» (اصلاح شد ⇐ …)، «از ۱ تا ۲۰» (اصلاح شد ⇐ «از»)»',
    check: (x) => { const L = x.sys[x.sys.length - 1] || ''; return { ok: /«… تا ۲۰ چند …» \(اصلاح شد ⇐ «… تا ۱۰ چند …»\)/.test(L) && /از n = ۱ تا ۲۰/.test(x.stmt), got: { L: L.slice(0, 300), stmt: x.stmt.slice(0, 200) } }; } },
  // C29-10 (pwC1 p31): «و برای هزینه‌ها: آره، همون ۶۰ میلیون درسته» ⇒ refused «… بر «۵» بنا بود که بعداً «۶ میلی‌متر» شد»
  C_pwC1_p31: { fx: 'C_pwC1', upto: 91, name: 'C29-10 pwC1: accepting «۵۴ ⇒ ۶۰» (panel price 5) is not refused by the later «۵ ⇒ ۶ میلی‌متر» (another quantity, C143)',
    base: '«پیشنهادِ «۵۴ ⇒ ۶۰» بر «۵» بنا بود که بعداً «۶ میلی‌متر» شد»',
    check: (x) => { const L = x.sys[x.sys.length - 1] || ''; return { ok: !/بعداً «۶ میلی‌متر» شد/.test(J(x.sys)), got: L.slice(0, 400) }; } },
  // C29-11 (pwC1 p33): «آره، همون ۱۲۰ درسته» after «۲٫۵ هکتار نبود، ۳ هکتاره» ⇒ accepted «۱۰۰ ⇒ ۱۲۰»
  C_pwC1_p33: { fx: 'C_pwC1', upto: 102, name: 'C29-11 pwC1: a proposal built on the superseded 2.5 ha is not accepted; the page names the stale base and the current exact value (100 ⇒ 180)',
    base: '«✓ پیشنهادِ صفحه را پذیرفتی — «۱۰۰ ⇒ ۱۲۰»»',
    check: (x) => { const L = x.sys[x.sys.length - 1] || ''; return { ok: !/پذیرفتی — «۱۰۰ ⇒ ۱۲۰»/.test(J(x.sys)) && /۱۰۰ ⇒ ۱۸۰/.test(L) && /کهنه/.test(L), got: L.slice(0, 400) }; } },
  // C29-12 (pwC1 p32): «مساحتِ باغ ۲٫۵ هکتار نبود، ۳ هکتاره» ⇒ only «داده به حرفِ خودت»
  C_pwC1_p32: { fx: 'C_pwC1', upto: 100, name: 'C29-12 pwC1: a second correction of the area re-marks the dependants with exact proposals (۱۰۰ ⇒ ۱۸۰ = 3 ha × 6 mm); «۲ × (۳ + ۴) = ۱۴» of the pump room is not the area',
    base: 'only «داده به حرفِ خودت: «۳ هکتار»»',
    check: (x) => { const L = x.sys.filter(t => /۳ هکتار/.test(t)).pop() || ''; return { ok: /۱۰۰ ⇒ ۱۸۰/.test(L) && !/۱۴ ⇒/.test(L), got: L.slice(0, 600) }; } },
};
(async () => {
  const b = await chromium.launch(); const errors = [], info = {};
  const names = Object.keys(CASES).filter(n => !process.env.LLA_R29_ONLY || process.env.LLA_R29_ONLY.split(',').includes(n));
  for (const n of names) { const c = CASES[n]; let r;
    try { const R = await replay(b, c.fx, { dir: DIR, upto: c.upto }); const x = await R.p.evaluate(SNAP); if (R.errors.length) errors.push(n + ' page errors: ' + R.errors.join(' | ')); r = c.check(x); await R.close(); }
    catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; }
    info[n] = !!r.ok; if (!r.ok) errors.push(n + ' — ' + c.name.slice(0, 90) + ' got ' + J(r.got).slice(0, 1500)); }
  console.log(J({ runners: info }));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
