// تورِ دستهٔ ۱ ِ پولیا — اصلاح‌های تونلِ «🔭 مسئلهٔ حل‌نشدهٔ خودم» و ابزارهای حدس (a38_live.js، a36_solve.js، a17_kpractice.js)، با کنترل‌های واقعیِ صفحه
// روی dist/learning-architecture.html، پهنای ۳۹۰، ساعتِ ساختگی. هر بخش یک یافتهٔ تور را می‌آزماید (شمارهٔ ردیف = بندِ دستورِ اصلاح):
//  ۱الف) مسئلهٔ عملی: قابِ عملی در تونل («کدام داده‌ها اثرِ محسوس دارند؟»، کجا خط بکشیم، تقریبِ کافی، دانشِ پیشین، ریاضی‌کردن با وارسیِ کد، طرحِ دوم)؛
//  ۱ب) مسئلهٔ کامل‌بیان‌شده: «روشن می‌بینی؟ می‌توانی ثابت کنی؟» به جای پیش‌بینی/موعد؛ قلاب بی «هیچ‌کس نمی‌داند»؛ data-lp-nat؛
//  ۲) دادهٔ کنارگذاشته با دلیل = رسیدگی‌شده؛ تطبیقِ جمعِ مکسر، چندواژه‌ای، بازگفت (≥۲ واژه)، و قاعدهٔ نفی؛
//  ۳) کفایت: «هنوز نمی‌دانم» در طرح و پس از نخستین گام؛ چالشِ «کافی است» با یک داده؛ چند جواب ⇒ پیوند به کفایت؛ «شرط برآوردنی است؟»؛
//  ۴) مقایسهٔ بیان‌ها؛ ۵) ابزارهای حدسِ کامل و دقتِ جدول/کسر/حرفِ فارسی/خانهٔ ناخوانا؛ ۶) چالشِ حدسِ ۱۰۰٪ و «اگر رد شد…» در نتیجه؛
//  ۷) حدس/ادعای دلخواه ⇒ «اثبات یا رد کن» + شاهدِ خلاف + پرونده؛ ۸) کار به عقب: چند پله، شاخهٔ رقیب، بن‌بست، برگزیدن، نخستین گام ⇐ آخرین حلقه؛
//  ۹) جدولِ نمادگذاری و کارتِ شکل؛ ۱۰) خواندنِ مکانیکی؛ ۱۱) شروعِ کم‌اصطکاک؛ ۱۲) بازنگری بر حسبِ نوع و «کدام پرسش/ابزار/پرسشِ دستیار»؛
//  ۱۳) عوض کردنِ طرح؛ ۱۴) یادآورِ ساعت‌دار، خودداوریِ ماندگار، پیوند به سشنِ دستیار، عنوانِ ناخالی؛ ۱۵) مربیگری؛ ۱۶) حکمتِ ضرب‌المثل‌ها؛
//  ۱۷) بردهای کوچک و «کنار بگذار تا فردا»؛ ۱۸) سقفِ T_plausible کنارِ حدس.
// خطا ⇒ کدِ خروجِ غیرصفر.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const W = (ms) => p.waitForTimeout(ms || 90);
  const T0 = '2026-11-02';
  const D = (n) => { const d = new Date(2026, 10, 2 + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const day = async (n) => { await p.evaluate(x => { window.__day = x; }, D(n)); };
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await W(140); };
  const sel = async (s, v) => { await p.selectOption(s, v); await W(120); };
  const click = async (s) => { await p.click(s); await W(160); };
  const txt = (s) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent : ''; }, s);
  const has = (s) => p.locator(s).count();
  const S = (pid) => p.evaluate(pid => { const pg = APP.S.get('eprog_' + pid); return JSON.parse(JSON.stringify(pg && pg.solve || {})); }, pid);
  const todayTxt = () => p.evaluate(() => APP.dueList().map(x => x.txt));
  const noOverflow = async (lab) => { const w = await p.evaluate(() => Math.max(document.scrollingElement.scrollWidth, document.body.scrollWidth)); if (w > 392) chk(false, lab + ': horizontal overflow at 390px (' + w + ')'); };
  const bidi = async (lab) => { const bad = await p.evaluate(() => [...document.querySelectorAll('#main .lp-page *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && /[؀-ۿ]/.test(n.textContent) && /[A-Za-z0-9%]/.test(n.textContent)) && !e.closest('[dir=rtl]')).length); chk(bad === 0, lab + ': mixed Persian/Latin text without an rtl ancestor: ' + bad); };
  const unlabelled = async (scope, lab) => { const r = await p.evaluate(s => [...document.querySelectorAll(s + ' input, ' + s + ' textarea, ' + s + ' select')].filter(e => e.type !== 'radio' && e.type !== 'checkbox' ? !(e.labels && e.labels.length) && !e.getAttribute('aria-label') : !(e.labels && e.labels.length)).map(e => e.id), scope); chk(!r.length, lab + ': unlabelled fields ' + r.join(',')); };
  const hookText = (sess, msg) => p.evaluate(([sess, msg]) => APP.ASSIST.promptHooks.map(f => { try { return f(sess, msg) || ''; } catch (e) { return 'ERR ' + e.message; } }).join('\n'), [sess, msg]);
  // ساختن از فرمِ برچسب‌دارِ «🔭»
  const mk = async (o) => {
    await go('e_prob', null, 'live');
    if (o.title != null) await p.fill('#lpNewT', o.title);
    await p.fill('#lpNewS', o.st);
    if (o.kind) await sel('#lpNewType', o.kind);
    if (o.nat) await sel('#lpNewNat', o.nat);
    if (o.hope) await sel('#lpNewHope', o.hope);
    if (o.coach) { await p.check('#lpNewCoach'); await W(60); await p.fill('#lpNewWho', o.coach); }
    await click('main .lp-create');
    return p.evaluate(() => APP.state.arg);
  };
  const whole = async (one, why) => { await p.fill('#lpOne', one); await p.fill('#lpWhy', why); await click('main .lp-onesave'); };
  try {
    await p.goto(FILE); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(T0 => { window.__day = T0; APP.today = () => window.__day; APP.S.loaded = true; window.__rem = []; window.__unrem = [];
      APP.HOST = Object.assign({}, APP.HOST || {}, { remind: async (pl) => { window.__rem.push(pl); return { ok: true }; }, unremind: async (k) => { window.__unrem.push(k); return { ok: true }; } }); }, T0);

    /* ===== ۱۶) ثبت‌گاهِ ضرب‌المثل‌ها ===== */
    info.prov = await p.evaluate(() => { const P = APP.HEUR_WISDOM || []; return { n: P.length, ok: P.every(x => /^C1[5-6]\d$/.test(x.id) && x.ph && x.t && x.q && /^§/.test(x.sec)), phs: [...new Set(P.map(x => x.ph))].length, lim: /C150/.test(APP.HEUR_WISDOM_LIMIT || ''), fn: typeof APP.heurWisdom === 'function' && APP.heurWisdom('back').id === 'C163', noBook: !('POLYA_PROVERBS' in APP) }; });
    chk(info.prov.n >= 10 && info.prov.ok && info.prov.phs >= 8 && info.prov.lim && info.prov.fn && info.prov.noBook, '16: proverb registry (book items, section, supported question, phase; with its limit) ' + JSON.stringify(info.prov));

    /* ===== ۱۴) ساختن از فرم ⇒ سشنِ دستیار، عنوانِ ناخالی ===== */
    const SID = await p.evaluate(() => APP.ASSIST.newSession().id);
    const PA = await mk({ title: '', st: 'یک لوله به طولِ ۲۴۰ سانتی‌متر دارم و نمی‌دانم در بارِ ونِ کوچکم جا می‌شود یا نه؛ فردا باید ببرمش.', nat: 'practical' });
    info.bind = await p.evaluate(([pid, sid]) => { const r = APP.S.get('eprob_' + pid), s = APP.ASSIST.cur(); return { title: r.title, ptitle: r.p.title, nat: r.p.nat, cur: s && s.id === sid && s.lprob === pid, stored: (APP.S.get(sid) || {}).lprob === pid }; }, [PA, SID]);
    chk(info.bind.title && info.bind.title === info.bind.ptitle && info.bind.nat === 'practical' && info.bind.cur && info.bind.stored, '14: form creation binds ASSIST.cur().lprob; title never empty (top-level title for «ثبت‌های تازه») ' + JSON.stringify(info.bind));
    chk(await p.evaluate(() => typeof APP.liveBindSession === 'function' && APP.liveLinkSession === APP.liveBindSession), '14: APP.liveLinkSession exported for the assistant');
    // ۱) قلابِ دستیار: «مسئلهٔ واقعی» در گفت‌وگو شناخته می‌شود — جمله‌های تور (s01/s02/s05/s09)
    info.liveRe = await p.evaluate(() => { const H = APP.ASSIST.promptHooks; const f = (m) => H.map(h => { try { return h({ id: 'x', msgs: [] }, m) || ''; } catch (e) { return ''; } }).join('').indexOf('مسئلهٔ واقعیِ حل‌نشده') >= 0;
      return { buy: f('خونه بخرم یا نه؟'), fit: f('این لوله تو ون جا میشه یا نه؟'), price: f('هر کیک رو چند بفروشم؟'), go: f('بزنم یا برم'), font: f('فونتِ صفحه ریز است'), card: f('کارتِ مرور حل نشده') }; });
    chk(info.liveRe.buy && info.liveRe.fit && info.liveRe.price && info.liveRe.go && !info.liveRe.font && !info.liveRe.card, '1: live-problem phrases from the tour are recognised (and not UI complaints) ' + JSON.stringify(info.liveRe));

    /* ===== ۱الف + ۹) مسئلهٔ عملی و فضایی: قابِ عملی، نمادگذاری، شکل ===== */
    chk(await p.evaluate(() => document.getElementById('lpNat').value) === 'practical' && /کامل بیان نشده/.test(await txt('main .lp-natnote')), '1a: kind chosen in understanding, practical vs perfectly-stated distinction shown');
    chk(await has('main .lp-u .lp-prov[data-prov="C151"]') === 1, '16: «who understands ill answers ill» shown with its question in understanding');
    await whole('می‌خواهم بدانم لوله در بارِ ون جا می‌شود یا نه', 'فردا باید ببرمش و کرایهٔ وانت گران است');
    await p.fill('#lpUnk', 'آیا لوله در فضای بار جا می‌شود');
    await p.fill('#lpD_d1', 'طولِ لوله ۲۴۰ سانتی‌متر است');
    await p.fill('#lpD_d2', 'ابعادِ داخلیِ بار ۲۰۰ در ۱۲۰ در ۱۱۰ سانتی‌متر است');
    await click('main .lp-dadd'); await p.fill('#lpD_d3', 'رنگِ لوله سفید است');
    chk(/اثرِ محسوس/.test(await txt('main .lp-effq')) && await has('#lpDE_d1') === 1 && await has('#lpPrLine') === 1 && await has('#lpPrApprox') === 1 && await has('#lpPrPrior') === 1 && await has('#lpPrMeasure') === 1 && await has('#lpPrVague') === 1, '1a: practical frame inside the tunnel: noticeable-effect data, where to draw the line, approximation, prior knowledge, mathematising');
    // دورِ ۲ (R2): «فضایی» با انتخابِ صریح — واژه‌ها فقط پیشنهاد می‌دهند
    chk(!(await p.evaluate(() => document.getElementById('lpSpatial').checked)) && await has('main .lp-spathint') === 1, 'R2: spatial is suggested, not forced');
    await p.check('#lpSpatial'); await W(160);
    chk(await p.evaluate(() => document.getElementById('lpSpatial').checked) && await has('main .lp-figc .lp-figwarn') === 1, '9: spatial problem ⇒ figure card with the general-figure warning');
    await p.fill('#lpCond', 'لوله خم نشود\nدرِ ون بسته شود');
    await sel('#lpSat', 'unknown'); await sel('#lpSuff', 'کافی است');
    await p.fill('#lpGuess', 'اگر قطری بگذارم جا می‌شود'); await sel('#lpConf', '100'); await p.fill('#lpTest', 'هیچ چیز ردش نمی‌کند');
    chk(await has('main .lp-gchal') === 1, '6: a 100% guess shows «چه چیزی حدست را رد می‌کند؟ آن را بیازما»');
    await click('main .lp-usave');
    info.umissA = await txt('main .lp-umiss');
    chk(/مفهومِ مبهم/.test(info.umissA) && /ریاضی‌کردن/.test(info.umissA) && /اثرِ «طولِ لوله/.test(info.umissA) && /فرض کن ساخته شده/.test(info.umissA) && /حدست را رد می‌کند/.test(info.umissA), '1a/9/6: practical frame, data effect, figure and guess challenge are required ' + info.umissA);
    await sel('#lpDE_d1', 'big'); await sel('#lpDE_d2', 'big'); await sel('#lpDE_d3', 'small');
    chk(await has('#lpDW_d3') === 1, '1a: «اثرش ناچیز است» asks for a reason');
    await p.fill('#lpDW_d3', 'رنگ روی جا شدن هیچ اثری ندارد');
    await p.fill('#lpPrVague', '«جا شدن» یعنی درِ ون بسته شود');
    await p.fill('#lpPrLine', 'وزن و رنگ را بیرون می‌گذارم چون فقط اندازه مهم است');
    await p.fill('#lpPrApprox', 'دقتِ یک سانتی‌متر بس است');
    await p.fill('#lpPrPrior', 'بارِ قبلی یک نردبانِ دومتری قطری جا شد');
    await p.fill('#lpPrMeasure', 'قطر فضای بار');
    await W(150);
    chk(/هنوز سنجیدنی نیست/.test(await txt('main .lp-measout')), '1a: mathematising checked by code (A.measurableCheck): no number/relation ⇒ not measurable');
    await p.fill('#lpPrMeasure', 'طولِ لوله ۲۴۰ ≤ قطرِ فضای بار');
    await W(150);
    chk(/سنجیدنی است/.test(await txt('main .lp-measout')), '1a: «۲۴۰ ≤ قطر» is measurable');
    // ۹) نمادگذاری: یک نماد برای دو چیز ممنوع؛ دو نماد برای یک چیز هشدار
    await p.fill('#lpNS_0', 'L'); await p.fill('#lpNM_0', 'طولِ لوله');
    await click('main .lp-nadd'); await p.fill('#lpNS_1', 'L'); await p.fill('#lpNM_1', 'طولِ فضای بار');
    await p.fill('#lpFigDone', 'لوله از گوشهٔ پایینِ جلو تا گوشهٔ بالای عقب کشیده شده است');
    await sel('#lpFigGen', 'special');
    chk(await has('#lpFigGenW') === 1, '9: a special figure must say which property and why');
    await p.fill('#lpFigGenW', 'بار مکعب‌مستطیل است چون واقعاً همین است');
    await p.fill('#lpFigLab', 'L طول لوله، a b c ابعاد بار');
    await p.fill('#lpGChal', 'اگر قطرِ فضای بار کمتر از ۲۴۰ سانتی‌متر درآید');
    await click('main .lp-usave');
    chk(/برای دو چیزِ متفاوت/.test(await txt('main .lp-umiss')), '9: one symbol naming two things is refused');
    await p.fill('#lpNS_1', 'B'); await click('main .lp-nadd'); await p.fill('#lpNS_2', 'T'); await p.fill('#lpNM_2', 'طولِ لوله');
    await click('main .lp-usave');
    chk(/دو نماد برای یک چیز/.test(await txt('main .lp-uout')) && await has('main .lp-u .sv-g2') === 1, '9: two symbols for one thing ⇒ warning only; grading offered');
    // ۱۴) خودداوری پس از «ثبتِ فهم» با بارگذاریِ دوباره نمی‌رود
    await W(500);
    await p.reload(); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(x => { window.__day = x; APP.today = () => window.__day; APP.S.loaded = true; window.__rem = window.__rem || []; window.__unrem = []; APP.HOST = Object.assign({}, APP.HOST || {}, { remind: async (pl) => { (window.__rem = window.__rem || []).push(pl); return { ok: true }; }, unremind: async (k) => { window.__unrem.push(k); return { ok: true }; } }); }, D(0));
    await go('lprob', PA, 'u');
    chk(await has('main .lp-u .lp-ugrade') === 1 && await has('main .lp-u .sv-g2') === 1, '14: the 0/1/2 self-rating after «ثبتِ فهم» persists across a reload');
    await click('main .lp-u .sv-g2');
    let sA = await S(PA);
    info.uA = { nat: sA.u[1].nat, prac: sA.u[1].prac, eff: sA.u[1].dl.map(x => x.eff), nota: sA.u[1].nota.length, figc: sA.u[1].figc && sA.u[1].figc.gen, chal: sA.g[1].chal, card: !!sA.u[1].pracCard };
    chk(info.uA.nat === 'practical' && info.uA.prac.measure && info.uA.eff.join() === 'big,big,small' && info.uA.nota === 3 && info.uA.figc === 'special' && /۲۴۰/.test(info.uA.chal) && info.uA.card, 'understanding saved with kind, practical frame, data effects, notation, figure, guess challenge; frame review card made ' + JSON.stringify(info.uA));
    chk(await p.evaluate(pid => APP.liveUsed(pid).d3, PA) === 'aside', '2: a datum set aside WITH a reason counts as handled');

    /* ===== ۸) کار به عقب: چند پله، شاخهٔ رقیب، بن‌بست ===== */
    chk(await has('main .lp-bk .lp-prov[data-prov="C163"]') === 1, '16: «order of execution is the reverse of invention» beside the backwards card');
    await p.fill('#lpBkS', 'لوله در ون است و در بسته شده');
    await p.fill('#lpBk1', 'لوله قطری از گوشهٔ پایین تا گوشهٔ بالای بار گذاشته شده');
    await p.fill('#lpBk2', 'قطرِ فضای بار را حساب کرده‌ام');
    await click('main .lp-bk .lp-bkdeeper');
    await p.fill('#lpBk_0_2', 'سه بعدِ بار را با متر اندازه گرفته‌ام');
    await click('main .lp-bkbranch');
    await p.fill('#lpBk_1_0', 'لوله را دو تکه کرده‌ام'); await p.fill('#lpBk_1_1', 'اره و بست دارم');
    await click('main .lp-bksave');
    chk(!(await S(PA)).live.back, '8: two live competing branches ⇒ choose one first');
    await p.check('#lpBkDead_1'); await W(160);
    await click('main .lp-bksave');
    chk(!(await S(PA)).live.back, '8: a dead end needs its reason');
    await p.fill('#lpBkDeadW_1', 'لوله نباید بریده شود چون یک‌تکه لازم است');
    await click('main .lp-bksave');
    sA = await S(PA);
    chk(sA.live.back && sA.live.back.chains.length === 2 && sA.live.back.chains[1].dead && sA.live.back.chosen === 0 && sA.live.back.chains[0].links.length === 3 && /قطری/.test(sA.live.back.before1), '8: multi-level chain + dead competing branch + chosen branch saved ' + JSON.stringify(sA.live.back));
    chk(/سه بعدِ بار را با متر/.test(await txt('main .lp-bkok')), '8: the first execution step = last link of the chosen chain, shown');
    // ۲) طرح: داده‌ای که با دلیل کنار رفت پرسیده نمی‌شود؛ طرحِ دوم برای مسئلهٔ عملی
    chk(!(await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))).includes('d3'), '2: set-aside datum not asked again in the plan');
    await p.fill('#lpPlan', 'نخست سه بُعدِ داخلیِ بار را اندازه می‌گیرم و قطر را حساب می‌کنم، سپس با طولِ لوله مقایسه می‌کنم');
    await W(400);
    chk(await has('main .lp-plan .lp-un') === 0, '2: data named in the draft plan text count as used (incl. «ابعاد» ⇐ «بعد»)');
    await click('main .lp-plansave');
    chk(!(await S(PA)).live.plan, '1a: practical plan needs a second plan (two strings to the bow)');
    chk(await has('main .lp-plan .lp-prov[data-prov="C157"]') === 1, '16: «have two strings to your bow» beside the second plan');
    await p.fill('#lpPlan2', 'اگر جا نشد، از همسایه وانت قرض می‌گیرم');
    await click('main .lp-plansave');
    sA = await S(PA);
    chk(sA.live.plan && /وانت/.test(sA.live.plan.t2), '1a: second plan saved');
    // قلابِ دستیار: عملی، دادهٔ کنارگذاشته نه، ضرب‌المثلِ همین مرحله
    info.hookA = await hookText({ id: 'hA', lprob: PA, msgs: [] }, 'حالا چه کنم؟');
    chk(/مسئلهٔ عملی: داده‌ها بی‌شمار/.test(info.hookA) && /داور: مسئلهٔ عملی/.test(info.hookA) && !/رنگِ لوله/.test(info.hookA) && /حکمتِ ضرب‌المثل‌ها/.test(info.hookA), '1a/2/16: assistant hook — practical frame, set-aside data not listed as unused, stage proverb');
    // ۱۴ + ۸ + ۱۳) گام: آخرین حلقه، یادآورِ ساعت‌دار
    await p.fill('#lpStep', 'با متر سه بعدِ بار را اندازه بگیرم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'قطر حدودِ ۲۵۵ سانتی‌متر درمی‌آید'); await sel('#lpConf', '70'); await p.fill('#lpWhen', 'فردا ۸ صبح');
    chk(/سه بعدِ بار را با متر/.test(await txt('main .lp-bkmatch')), '8: the first real step is checked against the last link of the chosen chain');
    await click('main .lp-stepsave');
    chk((await S(PA)).live.steps.length === 0 && /آخرین حلقه/.test(await txt('main .lp-stepmiss')), '8: the last-link question is required');
    await sel('#lpBkMatch', 'yes');
    await p.fill('#lpPred', 'قطر حدودِ ۲۵۵ سانتی‌متر درمی‌آید');
    await click('main .lp-stepsave');
    sA = await S(PA);
    info.rem = await p.evaluate(() => window.__rem.filter(x => /^lprob:/.test(x.key)));
    chk(sA.live.steps.length === 1 && sA.live.steps[0].backLink.match === 'yes' && info.rem.length === 1 && info.rem[0].hour === 7 && info.rem[0].due_date === D(1) && /exec/.test(info.rem[0].link), '14: dated step ⇒ HOST.remind before the user\'s own hour («فردا ۸ صبح» ⇒ 7:00) ' + JSON.stringify(info.rem));
    // ۱۷ + ۱۸ + ۶) نتیجه: برد، پیامدِ تأییدشده، سقفِ T_plausible
    await day(1); await go('lprob', PA, 'exec');
    await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', 'قطر ۲۵۶ سانتی‌متر درآمد'); await sel('#lpOMatch', 'yes'); await sel('#lpOProg', 'بله، روشن'); await sel('#lpOWant', 'same');
    await sel('#lpOGuess', 'confirm');
    await click('main .lp-outsave');
    info.winA = await txt('main .lp-win');
    chk(/پیش‌بینی‌ات درست درآمد|به مجهول نزدیک‌تر/.test(info.winA) && !/امتیاز/.test(info.winA), '17: a real small win acknowledged with a specific line (no points) ' + info.winA);
    chk(await p.evaluate(() => window.__unrem.some(k => /^lprob:/.test(k))), '14: reminder withdrawn when the outcome is saved');
    info.plaus = await p.evaluate(pid => ({ api: APP.livePlausible(pid), txt: (document.querySelector('main .lp-guess .lp-plaus') || {}).textContent || '', over: !!document.querySelector('main .lp-guess .lp-plausover') }), PA);
    chk(info.plaus.api.n === 1 && Math.round(info.plaus.api.cap) === 67 && /۶۷٪/.test(info.plaus.txt) && info.plaus.over, '18: conjecture with n confirmed consequences shows the factory ceiling (n+1)/(n+2) from the engine; 100% start flagged above it ' + JSON.stringify(info.plaus));
    // ۱۳) گامی که از طرح نمی‌آید
    await p.fill('#lpStep', 'به یک نجار زنگ بزنم و قیمتِ میز بپرسم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'قیمت را می‌گوید'); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا');
    await click('main .lp-stepsave');
    chk(await has('main .lp-switch #lpSwitch') === 1 && (await S(PA)).live.steps.length === 1, '13: a step not following the saved plan asks «طرح را عوض کردی؟»');
    await sel('#lpSwitch', 'new');
    await click('main .lp-stepsave');
    chk((await S(PA)).live.steps.length === 1, '13: changing the plan needs a reason');
    await p.fill('#lpSwitchW', 'لوله جا شد، حالا مسئلهٔ تازه‌ام میز است');
    await click('main .lp-stepsave');
    sA = await S(PA);
    chk(sA.live.switches && sA.live.switches[0].to === 'new' && /میز/.test(sA.live.switches[0].why) && sA.live.steps.length === 2, '13: plan switch recorded with its reason ' + JSON.stringify(sA.live.switches));
    // ۱۲) بازنگری: فضایی + عملی + «کدام پرسش/ابزار/پرسشِ دستیار»
    await p.evaluate(pid => APP.S.put({ id: 'ach_t1', type: 'achat', lprob: pid, msgs: [{ role: 'user', text: 'کمک' }, { role: 'ai', text: 'خوب است. آیا از قطرِ فضای بار استفاده کردی؟' }] }), PA);
    await click('main .lp-solved');
    info.lbA = await p.evaluate(() => ({ sym: !!document.getElementById('lpBSym'), units: !!document.getElementById('lpBUnits'), approx: !!document.getElementById('lpBApprox'), aside: (document.querySelector('main .lp-basides') || {}).textContent || '', opts: [...document.querySelectorAll('#lpBBest option')].map(o => o.value), tools: [...document.querySelectorAll('#lpBTool option')].map(o => o.value) }));
    chk(info.lbA.sym && info.lbA.units, '12: spatial look-back asks symmetry and units/dimensions explicitly');
    chk(info.lbA.approx && /رنگِ لوله/.test(info.lbA.aside), '12: practical look-back asks about approximation and what was left out');
    // دورِ ۲ (R8): «کدام پرسش کمک کرد؟» فقط پرسش‌ها؛ ابزارها در فهرستِ جدا
    chk(info.lbA.opts.includes('chat:0') && !info.lbA.opts.some(o => /^card:/.test(o)) && info.lbA.tools.includes('back'), '12: «which question helped most» lists only questions (chat questions included); tools are a separate list ' + JSON.stringify(info.lbA));
    await p.fill('#lpBChk', 'لوله را واقعاً گذاشتم و در بسته شد'); await sel('#lpBRes', 'نتیجه سالم ماند');
    await p.fill('#lpBOther', 'با قضیهٔ فیثاغورس در سه بعد'); await p.fill('#lpBGlance', 'قطرِ جعبه از طولِ لوله بیشتر بود'); await p.fill('#lpBWorked', 'اندازه‌گیریِ دقیقِ سه بعد');
    await p.fill('#lpBUse', 'برای جا دادنِ هر بارِ بلند، قطرِ جعبه را بسنج'); await p.fill('#lpBNew', 'یک لولهٔ سه‌متری در صندوقِ ماشینِ سواری جا می‌شود؟');
    await sel('#lpBHit', 'درست بود'); await sel('#lpBBest', 'chat:0'); await sel('#lpBWant', 'same');
    await p.fill('#lpBTaste', 'اندازه‌گیری را دوست داشتم، حسابِ قطر را کمتر');
    await sel('#lpBNewS', 'method'); await p.fill('#lpBNewW', 'همان سنجیدنِ قطرِ جعبه برای بارِ بلند');
    await click('main .lp-lbsave');
    chk(!(await S(PA)).b[1], '12: symmetry/units/approximation are required');
    await p.fill('#lpBSym', 'سه بعد نقشِ یکسان دارند و جابه‌جایی‌شان قطر را عوض نمی‌کند'); await p.fill('#lpBUnits', 'با متر هم همان درمی‌آید و دو طرف طول‌اند');
    await p.fill('#lpBApprox', 'یک سانتی‌متر بس بود و رنگ اثری نداشت');
    await p.fill('#lpBLimit', 'اگر ارتفاع صفر شود قطر همان قطرِ کف می‌شود که درست است');
    await click('main .lp-lbsave');
    sA = await S(PA);
    chk(sA.b[1] && sA.b[1].bestKind === 'chat' && /قطرِ فضای بار/.test(sA.b[1].bestQ) && sA.b[1].sym && sA.b[1].units && sA.b[1].approx, '12: look-back saved with the chosen chat question and type-specific checks ' + JSON.stringify(sA.b[1] && { k: sA.b[1].bestKind, q: sA.b[1].bestQ }));
    await noOverflow('practical look-back'); await bidi('practical look-back');

    /* ===== ۱ب + ۳ + ۴ + ۷ + ۱۰) مسئلهٔ کامل‌بیان‌شده (اثبات) ===== */
    const PB = await mk({ title: 'مجموعِ اعدادِ فرد', st: 'ثابت کن مجموعِ n عددِ فردِ نخست برابرِ n به توانِ دو است؛ تمرینِ کلاس است و هنوز حلش نکرده‌ام.', kind: 'prove', nat: 'objective' });
    await whole('می‌خواهم ثابت کنم مجموعِ فردهای نخست مربعِ کامل است', 'می‌خواهم استقرا را بفهمم');
    await p.fill('#lpUnk', 'مجموعِ n فردِ نخست برابرِ n² است'); await p.fill('#lpD_d1', 'n عددی طبیعی است');
    await p.fill('#lpCond', 'فردها از ۱ پشتِ هم');
    await sel('#lpSuff', 'کافی است');
    chk(/با همین یک داده مجهول معین می‌شود/.test(await txt('main .lp-suffchal')), '3: «کافی است» with a single datum is challenged');
    await p.fill('#lpGuess', 'درست است'); await sel('#lpConf', '90'); await p.fill('#lpTest', 'برای n = ۵ حساب کنم'); await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
    await sel('#lpGWant', 'yes');
    chk(await has('main .lp-gwant .lp-prov[data-prov="C161"]') === 1 && await has('#lpGContra') === 1, '7: a guess one wants true at ≥80% ⇒ «we soon believe what we desire» + strongest contrary evidence');
    await click('main .lp-usave');
    info.umissB = await txt('main .lp-umiss');
    chk(/با همین یک داده/.test(info.umissB) && /شاهدِ خلاف/.test(info.umissB), '3/7: the sufficiency challenge and contrary evidence are required ' + info.umissB);
    await p.fill('#lpSuffChal', 'با n داده، مجموع یک عدد معین است و فقط باید برابری را نشان دهم');
    await p.fill('#lpGContra', 'اگر برای یک n مجموع با n² فرق کند');
    await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    let sB = await S(PB);
    info.caseB = await p.evaluate(pid => { const pg = APP.S.get('eprog_' + pid), c = pg.solve.live.claims[0], cs = c && APP.S.get(c.caseId); return { pod: c && c.pod, contra: c && c.contra, input: cs && cs.st.st_intake.data.input, gcase: pg.solve.g[1].caseId === (c && c.caseId) }; }, PB);
    chk(sB.u[1].nat === 'objective' && sB.u[1].suffChal && info.caseB.pod && /اثبات یا رد کن/.test(info.caseB.input) && /قوی‌ترین شاهدِ خلاف/.test(info.caseB.input) && info.caseB.gcase, '7: conjecture ⇒ prove-or-disprove + contrary evidence + factory case ' + JSON.stringify(info.caseB));
    chk(await p.evaluate(() => document.querySelector('main .lp-page').getAttribute('data-lp-nat')) === 'objective' && await p.evaluate(() => document.querySelector('main .lp-page').getAttribute('data-lp-kind')) === 'objective', '1b: page exposes data-lp-nat / data-lp-kind for hooks');
    chk(await p.evaluate(([a, b]) => APP.liveKind(a) === 'practical' && APP.liveKind(b) === 'objective' && APP.liveKind('nope') === null, [PA, PB]), '1b: APP.liveKind(pid) exported');
    // ۱۰) خواندنِ مکانیکی
    for (let k = 0; k < 3; k++) {
      if (await has('main .lp-ask .lp-asknext')) await click('main .lp-ask .lp-asknext');
      await p.fill('#lpAsk', 'کمک نکرد'); await click('main .lp-askgo'); if (k < 2) await click('main .lp-ask .sv-g0');
    }
    chk(await has('main .lp-rote') === 1 && /مکانیکی نخوان/.test(await txt('main .lp-rote')), '10: three identical/empty answers ⇒ «پرسش‌ها را مکانیکی نخوان» (no silent wrap)');
    info.hookRote = await hookText({ id: 'hB', lprob: PB, msgs: [] }, 'سؤالِ بعد');
    chk(/مکانیکی نخوان/.test(info.hookRote), '10: the hook tells the assistant too');
    await sel('#lpRotePick', '3'); await click('main .lp-rotego');
    chk(await has('main .lp-rote') === 1, '10: picking needs a reason');
    await p.fill('#lpRoteWhy', 'باید از حکم به عقب بروم و لم بسازم');
    await click('main .lp-rotego');
    info.rote = await p.evaluate(pid => ({ L: APP.S.get('eprog_' + pid).solve.live.rote, qi: +document.querySelector('main .lp-ask').getAttribute('data-qi') }), PB);
    chk(info.rote.L && info.rote.L.length === 1 && info.rote.qi === 3 && /عقب/.test(info.rote.L[0].why), '10: the chosen fitting question is recorded and shown ' + JSON.stringify(info.rote));
    // ۴) فهمِ دوباره ⇒ مقایسه
    await p.evaluate(() => { document.querySelector('main details[data-sec="u"]').open = true; }); await W(60); await click('main .lp-reu2');
    await p.fill('#lpUnk', 'مجموعِ n فردِ نخست برابرِ n² است، برای هر n طبیعی');
    await click('main .lp-usave');
    chk(/بیانِ تازه نسبت به پیشین/.test(await txt('main .lp-umiss')), '4: re-understanding asks equivalent / wider / narrower');
    await sel('#lpRestate', 'eq'); await p.fill('#lpRestateW', 'فقط «برای هر n» را صریح کردم');
    await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    sB = await S(PB);
    chk(sB.u[1].restate && sB.u[1].restate.rel === 'eq' && sB.live.restates.length === 1, '4: comparison recorded');
    await go('lprob', PB, 'u');
    chk(/هم‌ارز/.test(await txt('main .lp-restsum')), '4: comparison shown in the summary');
    await go('lprob', PB, 'plan');
    await sel('#lpMv', 'mv_special'); await p.fill('#lpMvWhy', 'حالت‌های n = ۱، ۲، ۳ الگو را نشان می‌دهد'); await click('main .lp-mvadd');
    await p.fill('#lpPlan', 'نخست حالت‌های کوچک، سپس استقرا روی n که عددی طبیعی است'); await W(400); await click('main .lp-plansave');
    chk(!!(await S(PB)).live.plan, '1b/2: proof plan saved (the datum named in the plan is credited)');
    // ۱ب) اجرای برهانی
    info.stepB = await p.evaluate(() => ({ proof: !!document.getElementById('lpProof'), pred: !!document.getElementById('lpPred'), when: !!document.getElementById('lpWhen'), q: (document.querySelector('label[for="lpClear"]') || {}).textContent, prov: !!document.querySelector('main .lp-stepf .lp-prov[data-prov="C162"]') }));
    chk(info.stepB.proof && !info.stepB.pred && !info.stepB.when && /روشن می‌بینی که این گام درست است/.test(info.stepB.q) && info.stepB.prov, '1b: objective execution asks «روشن می‌بینی؟ می‌توانی ثابت کنی؟», no prediction/date ' + JSON.stringify(info.stepB));
    await p.check('#lpReal'); await W(160);
    chk(await has('#lpPred') === 1 && await has('#lpWhen') === 1, '1b: the user may still check against reality where meaningful');
    await p.uncheck('#lpReal'); await W(160);
    await p.fill('#lpStep', 'برای n = ۱ مجموع ۱ است و ۱ = ۱²'); await sel('#lpClear', 'بله');
    await click('main .lp-stepsave');
    chk((await S(PB)).live.steps.length === 0 && /ثابت کنی/.test(await txt('main .lp-stepmiss')), '1b: «بله» needs the premise that proves it');
    await p.fill('#lpProof', 'تعریفِ مجموع: فقط یک جمله، یعنی ۱');
    await click('main .lp-stepsave');
    sB = await S(PB);
    chk(sB.live.steps.length === 1 && sB.live.steps[0].closed && sB.live.steps[0].out.kind === 'proof' && !sB.live.steps[0].fc && !sB.live.steps[0].intuitive, '1b: proof step saved closed, no event forecast');
    chk(/ثابتش کردی/.test(await txt('main .lp-win')), '17: a proven step is a small win');
    info.hookB = await hookText({ id: 'hB2', lprob: PB, msgs: [] }, 'گامِ بعد را چطور ببینم؟');
    chk(!/هیچ‌کس نمی‌داند/.test(info.hookB) && /پاسخِ عینی دارد/.test(info.hookB) && /روشن می‌بینی که این گام درست است؟/.test(info.hookB) && /داور: مسئلهٔ کامل‌بیان‌شده/.test(info.hookB), '1b: hook for an objective problem: no «nobody knows», step check from TQ.exec');
    await click('main .lp-solved');
    chk(await has('#lpBHyp') === 1 && await has('#lpBConcl') === 1 && await has('main .lp-lb .lp-prov[data-prov="C164"]') === 1, '12: proof look-back asks «all hypotheses used? claimed vs rule conclusion?»; second-thoughts proverb');
    await noOverflow('proof look-back'); await bidi('proof look-back');

    /* ===== ۵) ابزارهای حدس: جدول، دقتِ رقم‌ها، کسر، حرفِ فارسی، خانهٔ ناخوانا ===== */
    const PC = await mk({ title: 'بیشینهٔ حاصل‌ضرب', st: 'عددِ ده را به چند قسمتِ برابر بشکنم تا حاصل‌ضربِ قسمت‌ها بیشینه شود؟ هنوز نمی‌دانم.', nat: 'objective' });
    await whole('بهترین تعدادِ قسمت‌ها برای ده', 'المپیاد');
    await p.click('main .lp-u .sv-kit > summary'); await W(120);
    chk(await has('main .lp-u .sv-kit .sv-kx') >= 3 && await has('main .lp-u .sv-kit input[id$="_f"]') === 1 && await has('main .lp-u .sv-kit .sv-krivals') === 1 && await has('main .lp-u .sv-kit [id$="_ana"]') === 1, '5: full guess kit in «🔭» (table, formula, rivals, analogy)');
    const kx = p.locator('main .lp-u .sv-kit .sv-kx'), ky = p.locator('main .lp-u .sv-kit .sv-ky');
    for (const [i, x, y] of [[0, '2', '25'], [1, '3', '37.04'], [2, '4', '39.0625']]) { await kx.nth(i).fill(x); await ky.nth(i).fill(y); }
    await p.fill('main .lp-u .sv-kit input[id$="_f"]', '(10/n)^n');
    await click('main .lp-u .sv-kchk');
    info.kit1 = await txt('main .lp-u .sv-kout');
    chk(/فرمولت با هر ۳ حالتِ جدول می‌خواند/.test(info.kit1) && !/رد شد/.test(info.kit1), '5: tolerance from the table\'s own digits (37.04 ⇐ 37.037…) ' + info.kit1);
    await ky.nth(1).fill('۱۰۰۰/۲۷'); await p.fill('main .lp-u .sv-kit input[id$="_f"]', '(۱۰/ن)^ن');
    await click('main .lp-u .sv-kchk');
    info.kit2 = await txt('main .lp-u .sv-kout');
    chk(/فرمولت با هر ۳ حالتِ جدول می‌خواند/.test(info.kit2), '5: fraction «۱۰۰۰/۲۷», Persian digits and the Persian variable «ن» are read ' + info.kit2);
    await click('main .lp-u .sv-kaddrow'); await ky.nth(3).fill('حدودِ چهل');
    await click('main .lp-u .sv-kchk');
    info.kit3 = await txt('main .lp-u .sv-kout');
    chk(/حالتِ ۴: «حدودِ چهل» خوانده نشد/.test(info.kit3), '5: an unreadable cell is never dropped silently ' + info.kit3);
    await ky.nth(3).fill('40'); await click('main .lp-u .sv-kchk');
    chk(/نمی‌خواند/.test(await txt('main .lp-u .sv-kout')), '5: an integer is read exactly (40 vs 32 refutes)');
    await noOverflow('kit'); await bidi('kit');

    /* ===== ۳ + ۶ + ۷ + ۱۷) مسئلهٔ زندگی: کفایت پیگیری می‌شود، «اگر رد شد…»، ادعای دلخواه، کنار بگذار تا فردا ===== */
    const PD = await mk({ title: 'کلاسِ شبانه', st: 'نمی‌دانم کلاسِ شبانهٔ برنامه‌نویسی را ثبت‌نام کنم یا نه؛ کارم سنگین است.' });
    await whole('تصمیم دربارهٔ ثبت‌نام در کلاسِ شبانه', 'می‌خواهم شغلم را عوض کنم');
    await p.fill('#lpUnk', 'ثبت‌نام بکنم یا نه'); await p.fill('#lpD_d1', 'کلاس هفته‌ای دو شب است'); await p.fill('#lpD_d2', 'شهریه را هنوز نمی‌دانم');
    await p.fill('#lpCond', 'کارم آسیب نبیند'); await sel('#lpSat', 'yes'); await sel('#lpSuff', 'کافی است');
    chk(/هنوز معلوم نیست/.test(await txt('main .lp-suffchal')), '3: «کافی است» with a datum not yet known is challenged');
    await sel('#lpSuff', 'هنوز نمی‌دانم'); await p.fill('#lpSuffW', 'شهریه را نمی‌دانم');
    await p.fill('#lpGuess', 'ثبت‌نام می‌کنم'); await sel('#lpConf', '70'); await p.fill('#lpTest', 'اگر دو هفته پشتِ هم خسته به کلاس برسم'); await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
    await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    chk(await has('main .lp-suffq[data-ph="p"]') === 1, '3: «هنوز نمی‌دانم» returns at the plan');
    // ۷) ادعای دلخواهِ مطمئن ⇒ اثبات یا رد کن
    await p.fill('#lpClaim', 'فکر می‌کنم کلاس به عوض کردنِ شغلم کمک می‌کند');
    await sel('#lpClaimWant', 'yes'); await sel('#lpClaimConf', '90');
    chk(await has('main .lp-claimpod #lpClaimContra') === 1, '7: a claim one wants true at ≥80% asks for the strongest contrary evidence');
    await click('main .lp-claimgo');
    chk(!(await S(PD)).live.claims.length, '7: contrary evidence required before the case');
    await p.fill('#lpClaimContra', 'بیشترِ همکلاسی‌های دورهٔ قبل شغل عوض نکردند');
    await click('main .lp-claimgo');
    info.claimD = await p.evaluate(() => { const cs = APP.S.get(APP.state.arg); return { view: APP.state.view, input: cs && cs.st.st_intake.data.input }; });
    chk(info.claimD.view === 'e_case' && /اثبات یا رد کن/.test(info.claimD.input) && /همکلاسی/.test(info.claimD.input), '7: the claim becomes a prove-or-disprove factory case ' + JSON.stringify(info.claimD));
    await go('lprob', PD, 'plan');
    await p.fill('#lpAsk', 'دوستم پارسال همین کلاس را رفت'); await click('main .lp-askgo'); await click('main .lp-ask .sv-g1');
    await sel('#lpMv', 'mv_special'); await p.fill('#lpMvWhy', 'یک جلسهٔ آزمایشی حالتِ ساده‌تر است'); await click('main .lp-mvadd');
    await p.fill('#lpAuxT', 'اگر فقط یک ماه بروم'); await sel('#lpAuxK', 'special'); await p.fill('#lpAuxB', 'نتیجهٔ یک ماه را به ترم تعمیم می‌دهم'); await click('main .lp-auxsave');
    // ۱۷) کنار بگذار تا فردا پس از تلاشِ جدی
    chk(await has('main .lp-incub') === 1, '17: «کنار بگذار تا فردا» offered after serious effort');
    await click('main .lp-incub');
    await day(2);
    chk((await todayTxt()).some(t => /😴 دیروز «کلاسِ شبانه» را کنار گذاشتی/.test(t)), '17: incubation returns next day in «امروز»');
    await go('lprob', PD);
    await p.fill('#lpIncubT', 'می‌توانم اول یک جلسهٔ آزمایشی بروم'); await click('main .lp-incubgo');
    let sD0 = await S(PD);
    chk(sD0.live.incub.back && /آزمایشی/.test(sD0.live.incub.back.t) && sD0.live.wins.some(w => w.kind === 'idea'), '17: «چه چیزی به ذهنت رسید؟» recorded');
    await go('lprob', PD, 'plan');
    await p.fill('#lpPlan', 'نخست یک جلسهٔ آزمایشی، سپس تصمیم'); await W(400);
    await click('main .lp-plansave');
    chk(!(await S(PD)).live.plan, '3: plan refused until sufficiency is re-asked');
    await sel('#lpSuffQ_p', 'ناکافی است — چیزی کم است'); await p.fill('#lpSuffQW_p', 'شهریه را باید بپرسم');
    await click('main .lp-suffqgo');
    if (await has('main .lp-plan .lp-un')) { for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'unknown'); await p.fill('#lpPU_w_' + id, 'هنوز نمی‌دانم کجا به کار می‌آید'); } }
    await click('main .lp-plansave');
    chk((await S(PD)).live.plan && (await S(PD)).live.suffLog[0].ph === 'p', '3: plan saved after the sufficiency follow-up');
    await p.fill('#lpStep', 'در یک جلسهٔ آزمایشیِ کلاس شرکت کنم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'خسته نمی‌شوم'); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا');
    for (const id of await p.evaluate(() => [...document.querySelectorAll('main select[id^="lpSU_"]')].map(x => x.id))) await sel('#' + id, 'notyet');
    await click('main .lp-stepsave');
    chk((await S(PD)).live.steps.length === 1, 'life step saved ' + await txt('main .lp-stepmiss'));
    if (await has('#lpSwitch')) { await sel('#lpSwitch', 'same'); await click('main .lp-stepsave'); }
    await day(3); await go('lprob', PD, 'exec');
    await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', 'خیلی خسته شدم و دو جواب برایم ماند: بروم یا آنلاین بخوانم'); await sel('#lpOMatch', 'no'); await sel('#lpOProg', 'کمی'); await sel('#lpOWant', 'same');
    await sel('#lpOGuess', 'refute');
    chk(/حدس را کنار می‌گذارم یا اصلاحش می‌کنم/.test(await txt('main .lp-ifref')), '6: when the outcome contradicts the guess, the user\'s own earlier «اگر رد شد…» is shown');
    await click('main .lp-outsave');
    chk(!(await S(PD)).live.steps[0].closed, '6: reflection on the refuted guess is required');
    await p.fill('#lpOReflect', 'حدس را اصلاح می‌کنم: شاید آنلاین بهتر باشد');
    await click('main .lp-outsave');
    sD0 = await S(PD);
    chk(sD0.live.steps[0].out.guess.rel === 'refute' && /آنلاین/.test(sD0.live.steps[0].out.guess.reflect), '6: refutation + reflection recorded');
    chk(await has('main .lp-multi .lp-multigo') === 1, '3: multiple answers in an outcome ⇒ link to the sufficiency question');
    // دورِ ۲ (R3): نام بردنِ داده در گفت‌وگو با دستیار «به کار بردن» نیست (اغلب برای کنار گذاشتنش است) — فقط کارِ خودِ حل
    chk(!(await p.evaluate(pid => APP.liveUsed(pid).d2, PD)), '2: «شهریه» not yet used');
    await p.evaluate(pid => APP.S.put({ id: 'ach_pd', type: 'achat', lprob: pid, msgs: [{ role: 'ai', text: 'شهریه چقدر است؟' }, { role: 'user', text: 'شهریهٔ کلاس را پرسیدم، سه میلیون است' }] }), PD);
    chk(!(await p.evaluate(pid => APP.liveUsed(pid).d2, PD)), 'R3: a datum named in the linked assistant chat is NOT credited as used');
    chk(await has('main .lp-suffq[data-ph="c"]') === 0, '3: after-first-step follow-up only while still «هنوز نمی‌دانم» (answered «ناکافی» at plan)');
    await noOverflow('life exec'); await bidi('life exec');

    /* ===== ۳) پس از نخستین گام (هنوز «نمی‌دانم») ===== */
    const PE = await p.evaluate(() => APP.liveCreate('خرید یا اجاره', 'خانه بخرم یا اجاره کنم؟ پس‌اندازم کم است.').p.id);
    await go('lprob', PE);
    await whole('تصمیمِ خرید یا اجارهٔ خانه', 'آرامشِ خانواده');
    await p.fill('#lpUnk', 'بخرم یا اجاره کنم'); await p.fill('#lpD_d1', 'پس‌انداز ۳۰۰ میلیون است'); await p.fill('#lpD_d2', 'اجاره ماهی ۲۰ میلیون است');
    await p.fill('#lpCond', 'بدهی سنگین نشود'); await sel('#lpSat', 'yes'); await sel('#lpSuff', 'هنوز نمی‌دانم'); await p.fill('#lpSuffW', 'قیمتِ خانه را نمی‌دانم');
    await p.fill('#lpGuess', 'اجاره بهتر است'); await sel('#lpConf', '60'); await p.fill('#lpTest', 'اگر قسط از اجاره کمتر شود');
    await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    await sel('#lpSuffQ_p', 'هنوز نمی‌دانم'); await p.fill('#lpSuffQW_p', 'قیمتِ خانه را هنوز نپرسیده‌ام'); await click('main .lp-suffqgo');
    await sel('#lpMv', 'mv_special'); await p.fill('#lpMvWhy', 'یک خانهٔ مشخص را حساب کنم'); await click('main .lp-mvadd');
    await p.fill('#lpPlan', 'نخست قیمتِ یک خانه و قسطش را می‌پرسم، سپس با اجاره و پس‌انداز مقایسه می‌کنم'); await W(400);
    await click('main .lp-plansave');
    chk((await S(PE)).live.plan, '2: plan saved (rent-vs-buy) — single distinctive word of a datum credits it');
    await p.fill('#lpStep', 'از بانک قسطِ وامِ مسکن را بپرسم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'قسط بیش از ۲۵ میلیون است'); await sel('#lpConf', '70'); await p.fill('#lpWhen', 'فردا ساعت ۱۷');
    await click('main .lp-stepsave');
    if (await has('#lpSwitch')) { await sel('#lpSwitch', 'same'); await click('main .lp-stepsave'); }
    info.rem17 = await p.evaluate(pid => window.__rem.filter(x => x.key.indexOf(pid) > 0).map(x => x.hour), PE);
    chk(info.rem17[0] === 16, '14: «ساعت ۱۷» ⇒ reminder at 16 ' + JSON.stringify(info.rem17));
    await day(4); await go('lprob', PE, 'exec');
    await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', 'قسط ۲۸ میلیون است'); await sel('#lpOMatch', 'yes'); await sel('#lpOProg', 'کمی'); await sel('#lpOWant', 'same'); await sel('#lpOGuess', 'confirm');
    await click('main .lp-outsave');
    chk(await has('main .lp-suffq[data-ph="c"]') === 1, '3: «هنوز نمی‌دانم» returns after the first step');
    // ۲) تطبیقِ واژه‌ها (همان تابعی که طرح، بازنگری و قلاب می‌خوانند)
    info.men = await p.evaluate(() => ({ plural: APP.liveMentions('دو نقطه اتصال را محکم می‌کنم', 'نقاطِ اتصالِ لوله'), multi: APP.liveMentions('اقساطِ وامِ خانه را می‌پرسم', 'قسطِ وامِ مسکن ۲۸ میلیون است'), para: APP.liveMentions('برای یادآوری به مردم یک گروهِ پیام‌رسان می‌سازم', 'بار دوم کسی یادآوری نکرد و مردم خسته شدند'), neg: APP.liveMentions('قیمتِ بلیت اصلاً مهم نیست', 'قیمتِ بلیتِ هواپیما') }));
    chk(info.men.plural && info.men.multi && info.men.para && !info.men.neg, '2: robust matching — broken plural, multiword, paraphrase (≥2 shared words); negation kept ' + JSON.stringify(info.men));
    chk(await p.evaluate(pid => APP.liveUsed(pid).d1, PE) === 'text', '2: a datum named in the step / plan text is credited');

    /* ===== ۱۱) شروعِ کم‌اصطکاک ===== */
    const PF = await mk({ title: 'پایان‌نامه', st: 'شش ماه است پایان‌نامه‌ام را رها کرده‌ام و دیگر حوصله‌اش را ندارم.', hope: 'low' });
    info.low = await p.evaluate(() => { const l = document.querySelector('main .lp-lowstart'), u = document.querySelector('main details[data-sec="u"]'); return { low: !!l, will: !!(l && l.querySelector('.sv-willf')), first: !!(l && u && (l.compareDocumentPosition(u) & Node.DOCUMENT_POSITION_FOLLOWING)), uClosed: u && !u.open, prov: !!(l && l.querySelector('.lp-prov[data-prov="C153"]')) }; });
    chk(info.low.low && info.low.will && info.low.first && info.low.uClosed && info.low.prov, '11: low hope at creation ⇒ «🌱 کوچک‌ترین گامِ بعد» FIRST, understanding closed ' + JSON.stringify(info.low));
    await sel('main .lp-lowstart .sv-willf select[id$="des"]', 'some'); await sel('main .lp-lowstart .sv-willf select[id$="hope"]', 'unsure');
    await p.fill('main .lp-lowstart .sv-willf input[id$="step"]', 'فقط فهرستِ فصل‌های پایان‌نامه را باز کنم و بخوانم'); await p.fill('main .lp-lowstart .sv-willf input[id$="when"]', 'فردا ساعتِ ۷ صبح، ده دقیقه');
    await click('main .lp-lowstart .sv-willsave');
    await go('lprob', PF, 'u');
    chk(/حالا بفهمیمش/.test(await txt('main .lp-lowgo')), '11: after the small step, the page leads into understanding');
    await click('main .lp-lowgo');
    chk(await has('main .lp-lowstart') === 0 && await p.evaluate(() => document.querySelector('main details[data-sec="u"]').open) && await has('#lpOne') === 1, '11: understanding card opens next');

    /* ===== ۱۵) مربیگری ===== */
    const PG = await mk({ title: 'تکلیفِ کسرِ پسرم', st: 'پسرم در جمعِ کسرهای با مخرجِ متفاوت گیر کرده و از من جواب می‌خواهد.', coach: 'پسرم', nat: 'objective' });
    info.coach = await p.evaluate(() => ({ card: !!document.querySelector('main .lp-coach'), one: /فقط یک پرسش یا یک ایده/.test((document.querySelector('main .lp-coach1') || {}).textContent || ''), k: (document.querySelector('main .lp-coachq') || {}).getAttribute && document.querySelector('main .lp-coachq').getAttribute('data-k'), attr: document.querySelector('main .lp-page').getAttribute('data-lp-coach') }));
    chk(info.coach.card && info.coach.one && info.coach.k === '0' && info.coach.attr === '1', '15: coach mode: question ladder from the most general, one idea per message ' + JSON.stringify(info.coach));
    await click('main .lp-coachmore');
    chk(await p.evaluate(() => document.querySelector('main .lp-coachq').getAttribute('data-k')) === '1', '15: no answer ⇒ the next, more specific question');
    await click('main .lp-coachok');
    let sG = await S(PG);
    chk(sG.live.coach.log.some(x => x.needed && x.k === 1) && sG.live.coach.due === D(7), '15: which question the learner needed is recorded; spaced return set ' + JSON.stringify(sG.live.coach.due));
    info.hookG = await hookText({ id: 'hG', lprob: PG, msgs: [] }, 'چه بپرسم؟');
    chk(/مربیِ «پسرم»/.test(info.hookG) && /هرگز پاسخ/.test(info.hookG), '15: the hook tells the assistant the user is the coach');
    await day(7);
    chk((await todayTxt()).some(t => /🧑‍🏫 پیگیریِ مربیگری/.test(t)), '15: the spaced follow-up returns in «امروز»');
    await go('lprob', PG);
    await sel('#lpCoachBack', 'alone'); await click('main .lp-coachbackgo');
    sG = await S(PG);
    chk(sG.live.coach.log.some(x => x.kind === 'back' && x.v === 'alone') && sG.live.coach.due > D(7), '15: follow-up recorded; next return further on the ladder');
    await noOverflow('coach'); await bidi('coach');
    await unlabelled('main .lp-page', 'coach page');
    await go('lprob', PA); await unlabelled('main .lp-page', 'practical page');
  } catch (e) { errors.push('exception: ' + (e && e.stack || e)); }
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close();
  if (errors.length) process.exitCode = 1;
})();
