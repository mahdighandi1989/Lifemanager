// تورِ پولیا (دستهٔ ۱، دورِ ۲۹، سهمِ «surface») — آزمونِ قرمز-نخست از جمله‌های خودِ دونده‌ها (C101 الف) + همهٔ مدخل‌های R7 ِ بانکِ مستقلِ VARIANTS_R29 که در واحد سنجیدنی‌اند.
//  F13  پرسش دربارهٔ سامانه مسئله / مقصدِ 🧭 نمی‌شود (A29-26، D28-10، B27·D14، C27-6) — AS.sysQ28/sysQ29، AS.onlySysQ28، AS.backRef29 (a27)
//  F14  «(C57)» و «(it1_…)» در نمای او و سطرهای نقل‌شده نیست (C100/C151/C174) — A.noLabels29 (a27) در regSys، A.EVLOG.add/clean (a40) و حبابِ پاسخ (a26)
//  F19  «خودِ سامانه» از ثبت‌گاهِ قاعده‌ها (C150) — A.PAGE_RULES / A.pageRule / A.ruleBy (a1_base)، AS.ruleLines + AS.manifest (a26)
//  loop B27·D16 — PRE.sysSweep (a44): گذرِ بی میزبانِ برگه نوبتِ دو دقیقه را نمی‌گیرد
//  C175 — AS.seeOnly29 (a27) + پیگیریِ پس از بازشدنِ نما (a26)
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errors = [], pe = [];
  p.on('pageerror', e => pe.push(e.message)); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav');
  const chk = (c, m) => { if (!c) errors.push(m); };
  const ev = (f, ...a) => p.evaluate(f, ...a);
  /* قرمز-نخست روی BASE29: نبودنِ یک صادرشده خودش خطاست، نه شکستنِ آزمون */
  const miss = await ev(() => { const o = []; const st = (obj, k, v, n) => { if (typeof obj[k] !== 'function') { o.push(n); obj[k] = v; } };
    st(APP.ASSIST, 'backRef29', () => false, 'AS.backRef29'); st(APP.ASSIST, 'seeOnly29', () => false, 'AS.seeOnly29'); st(APP, 'noLabels29', (t) => t, 'A.noLabels29');
    st(APP, 'pageRule', () => null, 'A.pageRule'); st(APP, 'ruleBy', () => null, 'A.ruleBy'); if (!APP.PAGE_RULES) { APP.PAGE_RULES = []; o.push('A.PAGE_RULES'); } return o; });
  if (miss.length) errors.push('missing exports: ' + miss.join(', '));

  /* ---------- F13: جمله‌های خودِ دونده‌ها + بانک (#262–#266، #281–#283، #288، #290، #292، #293، #295، #297) ---------- */
  const POS = [   // پیامِ تنها ⇒ مسئله نیست (notProblem) و پرسشِ دربارهٔ سامانه است
    ['A29-26 pwA1', 'یه نقشه از این که از کجا شروع کردم، کجاها اشتباه داشتم و الان کجام نشونم میدی؟'],
    ['B27·D14 oB1 c17', 'سلام، یه روز گذشت. چند تا سؤالِ دیگه دارم که برام مهمه، یکی‌یکی: اگه یه روز اینترنت نداشتم یا نخواستم داده‌هام از گوشیم بیرون بره، این صفحه آفلاین هم کار می‌کنه؟ و شما دارید یه مدلِ خودتون می‌سازید که روی گوشیِ خودم کار کنه؟'],
    ['A oA1 c143', 'سه تا سؤال دربارهٔ خودِ سامانه: اون گامِ ۱ که جابه‌جا کردم، گام‌های ۲ و ۳ که بهش تکیه داشتن چی شدن؟ اگه به پیشنهادی که روی یه عددِ غلط ساخته شده «آره» بگم، گامم با همون غلط بازنویسی میشه؟ و وقتی میگم «فروشنده گفت ۱۲٪ گرون میشه»، این دادهٔ منه یا کارِ یه نفر دیگه؟'],
    ['bank #262', 'یه نقشه از همه‌ی پرونده‌هام نشونم میدی؟'],
    ['bank #263', 'این برنامه اصلاً برای این‌جور حساب‌کتابا ساخته شده؟'],
    ['bank #264', 'سه تا سؤال دربارهٔ خودِ سامانه: اون گامی که جابه‌جا کردم، گام‌هایی که بهش تکیه داشتن چی شدن؟'],
    ['bank #265', 'این برگه‌ای که الان ثبت کردی کِی جواب می‌گیره؟ از کجا بفهمم؟'],
    ['bank #292', 'دفترِ پیش‌بینی کجاست؟ می‌خوام فقط ببینمشون'],
    ['bank #297', 'این مسئله‌ی جدول رو کجای پرونده‌م ببینم؟'],
    ['C27-6 shape', 'سامانه روشی برای این داره؟'],
    ['D28-10 shape', 'این سامانه اصلاً برای این‌جور کارها ساخته شده یا فقط برای مسئله‌های ریاضی؟']];
  const R = await ev((L) => L.map(([k, t]) => ({ k, np: APP.ASSIST.notProblem(t), st: APP.ASSIST.statesProblem(t) })), POS);
  R.forEach(x => chk(x.np && !x.st, 'F13 ' + x.k + ': a question about the system is not a problem :: ' + JSON.stringify(x)));
  /* جملهٔ پرسشیِ دربارهٔ سامانه درونِ پیامی که مسئله دارد ⇒ مقصدِ 🧭 نیست (D28-10 oD1، pwC1 c9) — همان یک آشکارساز */
  const SQ = ['راستی قبلش بگو: این سامانه اصلاً برای این‌جور کارها ساخته شده یا فقط برای مسئله‌های ریاضی؟', 'تو سامانه چیزی برای این هست؟', 'تو به یه مدلِ خاص وابسته‌ای؟', 'اگه فردا مدلت عوض شه، این روش و حرف‌هات عوض میشه؟'];
  (await ev((L) => L.map(t => APP.ASSIST.sysQ28(t)), SQ)).forEach((v, i) => chk(v, 'F13 sentence is a system question :: ' + SQ[i]));
  const NEG = [   // مسئلهٔ واقعیِ او یا یادآور — پرسشِ دربارهٔ سامانه نیست (C136: نمونه‌های منفیِ واقعی + بانک)
    ['bank #281', 'نقشه‌ی آپارتمان ۸۰ متره؛ اگه ۶۵ درصدش کاشی بشه چند متر کاشی لازمه؟', true],
    ['bank #282', 'سامانه‌ی آبیاریِ قطره‌ای ۲۰ تا نازل داره، هر کدوم ساعتی ۴ لیتر؛ ۳ ساعت چند لیتر میشه؟', true],
    ['bank #290', 'می‌خوام یه برنامه‌ی پس‌انداز بچینم؛ ماهی ۳ میلیون کنار بذارم، ۱۰ ماه میشه ۳۰ میلیون', true],
    ['bank #295', 'یه نقشه‌ی راه برای یادگیریِ آمار می‌خوام بچینم', true],
    ['r28 s11', 'یه صفحه ۱۰×۱۰ که دو گوشه‌ی مقابلش رو برداشتن. می‌خوام با دومینوهای ۱×۲ کاملش کنم. برنامه‌ی backtracking نوشتم، یه ساعته داره می‌چرخه. کجای کدم اشتباهه؟', true],
    ['bank #283', 'فردا ساعت ۹ یادم بنداز به بانک زنگ بزنم', null],
    ['bank #288', 'چرا کارت‌های Anki رو زود فراموش می‌کنم؟', null],
    ['no-ezafe', 'سامانه آبیاری قطره‌ای بهتره یا بارانی؟', null],
    ['trip map', 'نقشهٔ مسیرِ سفر به شیراز رو نشونم میدی؟', null],
    ['bank R26 #245', 'چطور از همین صفحه برای کنکورم برنامه بریزم؟', null]];
  const RN = await ev((L) => L.map(([k, t, st]) => ({ k, sq: APP.ASSIST.sysQ28(t.split(/(?<=[؟?])/).pop().trim() || t), only: APP.ASSIST.onlySysQ28(t), st: APP.ASSIST.statesProblem(t), want: st })), NEG);
  RN.forEach(x => chk(!x.only && !x.sq && (x.want !== true || x.st), 'F13 negative look-alike stays hers :: ' + JSON.stringify(x)));
  /* C27-6: بازگشت با وصف به مسئلهٔ بسته (بانک #266 بی پرسش؛ pC2 p13 با وصف) */
  chk(await ev(() => APP.ASSIST.backRef29('راستی دربارهٔ همون بخاری که حلش کردیم و بستیم: یه تیکهٔ تازه دارم.')), 'C27-6 backRef29 reads «دربارهٔ همون … که حلش کردیم و بستیم»');
  chk(!(await ev(() => APP.ASSIST.backRef29('یه مسئلهٔ تازه دارم: بخاریِ جدیدم ۱۵۰۰ واته.'))), 'C27-6 backRef29: a new problem is not a back-reference');
  chk(!(await ev(() => APP.ASSIST.statesProblem('آها یه چیزی یادم رفت بگم: دیشب مادرم دو تا قرص رو با هم برداشت'))), 'bank #266: a piece after closure is not a new problem by itself');
  chk(!(await ev(() => APP.ASSIST.statesProblem('الان که گفتم «بله»، دقیقاً به کدوم پرسش بله گفتم؟'))), 'bank #293: no problem record');

  /* ---------- F14 (C151/C174) ---------- */
  const L = await ev(() => [
    APP.noLabels29('از زبانِ «برادرم» — صفحه می‌سنجد و نشان می‌دهد، ولی نتیجه یا گامِ تو شمرده نمی‌شود (C57)'),
    APP.noLabels29('✓ در «فهرستِ ابهام‌های باز» نگه داشته شد: ««شریکِ جرم» برام هنوز مبهمه» (it1_o4sv) · مسئله: «توقف»'),
    APP.noLabels29('🎯 بی موعد (دورِ ۲۷، C53)'), APP.noLabels29('طبقِ قاعدهٔ C124 صفحه پرسید'), APP.noLabels29('مورد it1_drm4 به‌روز شد'),
    APP.noLabels29('✓ یادداشت شد: «کدِ کلاسم C57 ـه»'), APP.noLabels29('✓ نگه داشته شد: «مدلِ دستگاه it1_x200 ـه»'), APP.noLabels29('«نسخه‌ی C۲ و C۳ گزارش رو مقایسه کردم» (C57)')]);
  chk(L[0] === 'از زبانِ «برادرم» — صفحه می‌سنجد و نشان می‌دهد، ولی نتیجه یا گامِ تو شمرده نمی‌شود', 'F14 (C57) removed :: ' + L[0]);
  chk(!/it1_/.test(L[1]) && /«توقف»/.test(L[1]), 'F14 (it1_…) removed :: ' + L[1]);
  chk(L[2] === '🎯 بی موعد', 'F14 (دورِ ۲۷، C53) removed :: ' + L[2]);
  chk(L[3] === 'طبقِ قاعدهٔ صفحه پرسید' || L[3] === 'طبقِ قاعدهٔ  صفحه پرسید' || !/C124/.test(L[3]), 'F14 «قاعدهٔ C124» in a reply :: ' + L[3]);
  chk(!/it1_/.test(L[4]), 'F14 bare id :: ' + L[4]);
  chk(L[5] === '✓ یادداشت شد: «کدِ کلاسم C57 ـه»', 'bank #284: her own «C57» stays byte-exact :: ' + L[5]);
  chk(L[6] === '✓ نگه داشته شد: «مدلِ دستگاه it1_x200 ـه»', 'bank #285: her own id-like text stays :: ' + L[6]);
  chk(L[7] === '«نسخه‌ی C۲ و C۳ گزارش رو مقایسه کردم»', 'bank #296: her C۲/C۳ stay :: ' + L[7]);
  /* گذرگاه‌ها: سطرِ صفحه (regSys) و 📜 (EVLOG.add) */
  const G = await ev(() => { const s = { id: 'achat_t29', msgs: [], coach: {} }; const a = APP.ASSIST.regSys(s, 'نگه داشته شد: «x» (it1_ab12)');
    APP.S.put({ id: 'achat_t29', type: 'achat', msgs: [], coach: {} }); const e = APP.EVLOG.add({ sess: 'achat_t29', k: 'other', at: new Date().toISOString(), title: 'کارِ دیگری', lines: ['۲۲ × ۵۰ = ۱۱۰۰', 'از زبانِ «داداشم» — … شمرده نمی‌شود (C57)'] });
    return { a, l: e ? e.lines.join(' | ') : 'NO EV' }; });
  chk(!/it1_/.test(G.a), 'F14 regSys sink :: ' + G.a); chk(!/C57/.test(G.l) && /۱۱۰۰/.test(G.l), 'bank #267/#269 EVLOG sink :: ' + G.l);

  /* ---------- F19 (C150; بانک #271، #275، #298) ---------- */
  const M = await ev(() => { const man = APP.ASSIST.manifest(); const self = man.split('\n## ').find(x => /^## خودِ سامانه|^خودِ سامانه/.test(x)) || '';
    APP.pageRule({ id: 'T29', fa: 'قاعدهٔ آزمونیِ دورِ ۲۹ که فقط این‌جا ثبت شد', by: 'AS.sysQ28' }); APP.pageRule({ id: 'T29x', fa: 'قاعده‌ای که تابعش نیست', by: 'AS.nope29' });
    const man2 = APP.ASSIST.manifest(); APP.PAGE_RULES = APP.PAGE_RULES.filter(r => !/^T29/.test(r.id)); return { self, has: /قاعدهٔ آزمونیِ دورِ ۲۹/.test(man2), ghost: /تابعش نیست/.test(man2), unresolved: APP.PAGE_RULES.filter(r => r.by && !APP.ruleBy(r.by)).map(r => r.id + ':' + r.by) }; });
  [[/\[C124\][^\n]*وابسته[^\n]*همه با هم[^\n]*فقط همین[^\n]*هیچ/, 'C124 move with dependants'], [/\[C87\/C111\][^\n]*کهنه[^\n]*بازنویسی نمی/, 'C87/C111 stale-base proposal'],
    [/\[C96\/C125\][^\n]*منبع: به گفتهٔ/, 'C96/C125 datum with source'], [/\[C57\][^\n]*کارِ دیگری/, 'C57 another person\'s work'], [/\[C138\/C139\][^\n]*نسنجیده/, 'C138 one mark per clause'],
    [/\[42\][^\n]*✏️[^\n]*«نه»[^\n]*↩/, 'bank 42 undo']].forEach(([re, k]) => chk(re.test(M.self), 'F19 «خودِ سامانه» carries ' + k + ' :: ' + M.self.slice(0, 200)));
  chk(M.has && !M.ghost, 'bank #275: a registry entry added appears; one whose function is absent does not :: ' + JSON.stringify({ has: M.has, ghost: M.ghost }));
  chk(!M.unresolved.length, 'F19: every registered rule resolves to the function that enforces it :: ' + M.unresolved.join(', '));
  chk(!/it[0-9]+_|sk-|api[_-]?key/i.test(M.self), 'bank #298: no raw ids or secrets in the block');

  /* ---------- loop B27·D16: گذرِ بی میزبانِ برگه نوبت را نمی‌گیرد ---------- */
  const W = await ev(async () => { let n = 0; const orig = APP.PRE.sysCheck, h0 = APP.HOST; APP.PRE.sysCheck = () => { n++; return Promise.resolve(); };
    const ld = APP.S.loaded; APP.S.loaded = true;   /* میزبان‌ها (و هارنسِ دونده‌ها) S.loaded را می‌نشانند */
    try { APP.HOST = {}; await APP.PRE.sysSweep(true); const a = n; await APP.PRE.sysSweep(); const b = n; APP.HOST = { sheet: async () => null }; await APP.PRE.sysSweep(); const c = n; await APP.PRE.sysSweep(); const d = n; APP.go('today'); await new Promise(r => setTimeout(r, 300)); const e = n; await APP.PRE.sysSweep(); const f = n; return [a, b, c, d, e, f]; }
    finally { APP.PRE.sysCheck = orig; APP.HOST = h0; APP.S.loaded = ld; } });
  chk(W.join() === '1,1,2,2,3,3', 'B27·D16: the first sweep after the sheet host arrives reads the sheets; opening a view (her look) reads them at once; the throttle still holds for automatic renders :: ' + W.join());

  /* ---------- C175 (C29-23 pwC2 p50) ---------- */
  const V = await ev(() => ['پیش‌بینی‌هام کدوما بازه و کدوما داوری شده؟', 'دفترِ پیش‌بینی کجاست؟ می‌خوام فقط ببینمشون', 'یه پیش‌بینی تازه ثبت کن: فردا بارون میاد، ۷۰ درصد', 'بازش کن و ثبتش کن'].map(t => APP.ASSIST.seeOnly29(t)));
  chk(V.join() === 'true,true,false,false', 'C175 seeOnly29 :: ' + V.join());

  if (pe.length) errors.push('page errors: ' + pe.slice(0, 3).join(' | '));
  await b.close();
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
