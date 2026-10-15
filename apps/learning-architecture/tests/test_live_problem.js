// «🔭 مسئلهٔ حل‌نشدهٔ خودم» (a38_live.js + a36_solve.js) — تونلِ حل روی مسئلهٔ واقعیِ بی‌پاسخ، روی dist/learning-architecture.html، با کنترل‌های واقعیِ صفحه
// مسئلهٔ واقعیِ این آزمون: «پیشنهادِ کار در شیراز را بپذیرم یا در تهران بمانم؟» (حقوق، اجاره، کارِ همسر، مادرِ بیمار، مهلتِ پاسخ).
// پهنای ۳۹۰ (گوشی)؛ ساعتِ ساختگی +۱/+۳/+۷/+۱۰/+۱۳/+۲۱ روز.
//  A) ورود: زبانهٔ «🔭 مسئلهٔ حل‌نشدهٔ خودم» در «مسئله‌های من»، فرمِ برچسب‌دار، همان نوعِ رکورد (eprob، mode: live)، fill-empty ِ mode، کارِ دستیار live_new.
//  B) فهم: کل پیش از جزء، داده‌ها فهرستِ جدا، شرط، کفایت، حدس با اطمینان و آزمون؛ مرورِ فاصله‌دار.
//  C) طرح: یک پرسش در هر نوبت با «چرا» و «پرسشِ بعد»؛ مسئلهٔ مرتبط از کارهای خودت (کد)؛ کار به عقب؛ مسئلهٔ کمکی؛ حرکت‌ها؛ دادهٔ به‌کارنرفته با نامش.
//  D) اجرا روی واقعیت: گام + پیش‌بینی + اطمینان + روز (willWhen)؛ «امروز» در موعد؛ نتیجه با داوریِ خودت ⇒ fcast ⇒ کالیبراسیونِ پیش‌بینیِ رویداد؛
//     غافلگیری ⇒ گره‌گشا / دوباره فهم؛ بی‌پیشرفت ⇒ 🌱؛ گیر ⇒ گره‌گشا.
//  E) ادعا ⇒ پروندهٔ کارخانه با یک کلیک، پیوندِ برگشت، درجهٔ موتور کنارِ ادعا.
//  F) بازنگری (حل شد / کنار گذاشتن)؛ درس ⇒ کارتِ مرور؛ مسئلهٔ تازه ⇒ برمی‌گردد؛ کنار گذاشتن ⇒ 🌱 ِ رها کردن و بازگشت.
//  G) درونی‌سازیِ پرسش: پلهٔ ۳ ِ نردبان ⇒ «الان از خودت چه می‌پرسی؟» پیش از پرسش — در همین مسئله و در شبیه‌ساز؛ زیرِ آن پله رفتارِ پیشین.
//  H) «امروز» یک سطر برای هر نوع؛ گراف؛ دستیار؛ VIEW_META؛ پهنای ۳۹۰ بی سرریز؛ bidi.
//  + یافته‌های بازبینِ بدبین (۲۰۲۶-۱۰-۱۵): شناسهٔ داده هرگز دوباره نه؛ بستنِ گامِ باز با «حل شد/کنار گذاشتن»؛ پیش‌بینی و حدسِ زنده فقط مسیرِ پیش‌بینی؛
//    گرافِ بی‌جزیره؛ نشانیِ بلند در ۳۹۰؛ روزِ پاسخ در پله؛ قلاب‌های دستیار تنگ‌تر؛ «پرسشِ بعد» در پلهٔ ۳ و آغاز از کم‌ورزیده‌ترین پرسش؛ مرورِ g؛ دفترِ 🎯؛
//    «فعلاً نه»؛ پیش‌نویسِ فهم پس از بارگذاری؛ تاریخ‌ها؛ نفی؛ و عمقِ پولیا (ابزارِ طرح لازم و مرورش، کل/چرا در مرور و خواستن در ایست‌ها، A130، B089، A157).
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
  const sel = async (s, v) => { await p.selectOption(s, v); await W(60); };
  const click = async (s) => { await p.click(s); await W(140); };
  const ownCheck = (s, lab) => p.evaluate(s => { const els = [...document.querySelectorAll(s + ' input, ' + s + ' textarea, ' + s + ' select')]; return { n: els.length, notOwn: els.filter(e => !e.closest('[data-own]')).map(e => e.id), noLabel: els.filter(e => !(e.labels && e.labels.length) && !e.getAttribute('aria-label')).map(e => e.id) }; }, s)
    .then(r => { chk(r.n > 0, lab + ': no fields'); chk(!r.notOwn.length, lab + ': fields outside data-own ' + r.notOwn.join(',')); chk(!r.noLabel.length, lab + ': unlabelled ' + r.noLabel.join(',')); return r; });
  const noOverflow = async (lab) => { const w = await p.evaluate(() => Math.max(document.scrollingElement.scrollWidth, document.body.scrollWidth)); if (w > 392) { const who = await p.evaluate(() => [...document.querySelectorAll('#main *')].filter(e => e.getBoundingClientRect().right > 392 || e.getBoundingClientRect().left < -2).slice(-3).map(e => e.tagName + '.' + e.className + ':' + (e.textContent || '').slice(0, 40))); chk(false, lab + ': horizontal overflow at 390px (' + w + ') ' + JSON.stringify(who)); } };
  const bidi = async (lab) => { const bad = await p.evaluate(() => [...document.querySelectorAll('#main .lp-page *, #main .lp-new *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && /[؀-ۿ]/.test(n.textContent) && /[A-Za-z0-9%]/.test(n.textContent)) && !e.closest('[dir=rtl]')).length); chk(bad === 0, lab + ': mixed Persian/Latin text without an rtl ancestor: ' + bad); };
  const S = (pid) => p.evaluate(pid => { const pg = APP.S.get('eprog_' + pid); return JSON.parse(JSON.stringify(pg && pg.solve || {})); }, pid);
  const todayTxt = () => p.evaluate(() => APP.dueList().map(x => x.txt));
  try {
    await p.goto(FILE); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(T0 => { window.__day = T0; APP.today = () => window.__day; APP.S.loaded = true; }, T0);

    /* ===== A) ورود ===== */
    // رکوردِ پیشینِ مسئله بی «mode» ⇒ fill-empty («solved») بی تغییرِ زمان
    await p.evaluate(() => { const src = window.EPI_PROBLEMS.find(x => x.id === 'pb_p4_bear'), o = JSON.parse(JSON.stringify(src)); o.id = 'pb_u_old'; o.title = 'مسئلهٔ قدیمیِ من'; delete o.set; delete o.neutral;
      APP.S.put({ id: 'eprob_pb_u_old', type: 'eprob', status: 'approved', by: 'me', p: o }); window.__oldUpd = APP.S.get('eprob_pb_u_old').updated; });
    // کارهای پیشینِ خودت که «مسئلهٔ مرتبط» باید پیدا کند (کد، واژه‌های مشترک) — و یکی بی‌ربط
    await p.evaluate(() => {
      const kc = APP.knotNewCase(); kc.kinds = ['social']; kc.title = 'دلخوری از پیشنهادِ حقوق در تهران'; kc.titleSet = true; kc.intake.what = 'مدیرم پیشنهادِ افزایشِ حقوق را رد کرد و حس کردم در تهران ماندن بی‌فایده است'; APP.S.put(kc); window.__kc0 = kc.id;
      APP.S.put({ id: 'idea_unrel', type: 'idea', what: 'کانالِ آموزشِ آشپزی', title: 'کانالِ آشپزی', parts: [] });
    });
    await go('e_prob');
    info.listCta = await p.locator('main .lp-listcta').count();
    chk(info.listCta === 1, 'list shows the «🔭 مسئلهٔ حل‌نشدهٔ خودم» entry when there is none');
    info.mig = await p.evaluate(() => { const r = APP.S.get('eprob_pb_u_old'); return { mode: r.mode, same: r.updated === window.__oldUpd }; });
    chk(info.mig.mode === 'solved' && info.mig.same, 'fill-empty migration of «mode» on old records, time kept ' + JSON.stringify(info.mig));
    await click('main [role=tab]:has-text("مسئلهٔ حل‌نشدهٔ خودم")');
    chk(await p.locator('main .lp-new #lpNewT').count() === 1, 'creation form in its own tab');
    chk(await p.evaluate(() => ['lpNewT', 'lpNewS', 'lpNewType'].every(id => { const e = document.getElementById(id); return e && e.labels && e.labels.length && !e.closest('[data-own]'); })), 'creation form labelled (assistant can fill it), not data-own');
    await click('main .lp-create');
    chk(await p.locator('main .lp-new .small').filter({ hasText: 'هنوز' }).count() + await p.locator('main .lp-new [aria-live]').filter({ hasText: 'عنوان' }).count() >= 1, 'empty creation refused');
    const TITLE = 'پیشنهادِ کار در شیراز را بپذیرم یا در تهران بمانم؟';
    await p.fill('#lpNewT', TITLE);
    await p.fill('#lpNewS', 'شرکتی در شیراز به من پیشنهادِ کار داده با حقوقِ ۴۰٪ بیشتر. همسرم در تهران شاغل است، مادرم بیمار است و هفته‌ای دو بار به او سر می‌زنم، و تا ده روزِ دیگر باید جواب بدهم. نمی‌دانم بروم یا بمانم.');
    await click('main .lp-create');
    const P1 = await p.evaluate(t => { const r = APP.S.all('eprob', x => x.live && x.p.title === t)[0]; return r && r.p.id; }, TITLE);
    info.rec = await p.evaluate(pid => { const r = APP.S.get('eprob_' + pid); return { type: r.type, mode: r.mode, live: r.live, status: r.status, inProbs: APP.probs().some(x => x.id === pid), getProb: !!APP.getProb(pid), view: APP.state.view, sub: APP.state.sub }; }, P1);
    chk(P1 && info.rec.type === 'eprob' && info.rec.mode === 'live' && info.rec.live === true && !info.rec.inProbs && info.rec.getProb && info.rec.view === 'lprob', 'same record type, live mode, not in the simulator list ' + JSON.stringify(info.rec));
    // دستیار: live_new فقط از حرفِ خودِ کاربر
    info.asNew = await p.evaluate(() => { const AS = APP.ASSIST; const s = { id: 'ach_lp', msgs: [] }; AS._turnSession = s; const bad = AS.DO.live_new({ statement: 'کوتاه' }); const ok = AS.DO.live_new({ title: 'کلاسِ زبان را ادامه بدهم؟', statement: 'سه ماه است کلاسِ آلمانی می‌روم و وقتم کم شده؛ نمی‌دانم ادامه بدهم یا نه.' }); AS._turnSession = null; const r = APP.S.get('eprob_' + s.lprob); return { bad, ok, by: r && r.by, mode: r && r.mode, sess: r && r.sess }; });
    chk(/statement/.test(info.asNew.bad) && info.asNew.ok === '' && info.asNew.by === 'assistant' && info.asNew.mode === 'live' && info.asNew.sess === 'ach_lp', 'assistant do:live_new ' + JSON.stringify(info.asNew));

    /* ===== B) فهم ===== */
    chk(await p.locator('main .lp-u').count() === 1, 'understanding card first');
    await ownCheck('main .lp-u', 'understanding card');
    info.gate0 = await p.evaluate(() => ({ one: !!document.getElementById('lpOne'), unk: !!document.getElementById('lpUnk'), d: !!document.querySelector('main .lp-dl'), polya: /پولیا/.test(document.querySelector('main .lp-u').textContent), seq: (APP.S.get('eprog_' + APP.state.arg) || { solve: {} }).solve }));
    chk(info.gate0.one && !info.gate0.unk && !info.gate0.d && !info.gate0.polya, '«اول کل»: parts open only after the whole is saved; no book name in the card ' + JSON.stringify(info.gate0));
    chk(!(info.gate0.seq && info.gate0.seq.live && (info.gate0.seq.live.dSeq || info.gate0.seq.live.uDraft)), 'opening the card without typing consumes no datum ids ' + JSON.stringify(info.gate0.seq && info.gate0.seq.live));
    await click('main .lp-onesave');
    chk(await p.locator('main .lp-onemiss').count() === 1, 'empty whole refused');
    await p.fill('#lpOne', await p.evaluate(pid => APP.S.get('eprob_' + pid).p.statement, P1));
    await p.fill('#lpWhy', 'آیندهٔ کاری‌ام و آرامشِ خانواده هر دو برایم مهم‌اند');
    await click('main .lp-onesave');
    info.onemiss = await p.locator('main .lp-onemiss').textContent();
    chk(/رونوشت/.test(info.onemiss) && /کوتاه‌تر/.test(info.onemiss) && /یک جمله/.test(info.onemiss) && !(await p.locator('#lpUnk').count()), 'the whole sentence: no near-copy, shorter than the statement, one sentence ' + info.onemiss);
    await p.fill('#lpOne', 'می‌خواهم بین رفتن به شیراز و ماندن در تهران تصمیم بگیرم، با درآمد، خانواده و مهلتی که دارم.');
    await click('main .lp-onesave');
    info.order = await p.evaluate(() => [...document.querySelectorAll('main .lp-u label')].map(l => l.getAttribute('for')).filter(Boolean).slice(0, 4));
    chk(info.order.indexOf('lpOne') >= 0 && info.order.indexOf('lpOne') < info.order.indexOf('lpUnk'), 'whole-in-one-sentence comes before the parts ' + info.order.join(','));
    await click('main .lp-usave');
    chk(await p.locator('main .lp-umiss').count() === 1, 'empty understanding refused');
    await p.fill('#lpUnk', 'تصمیم: پیشنهادِ شیراز را بپذیرم یا نه');
    await p.fill('#lpD_d1', 'حقوقِ پیشنهادی ۴۰٪ بیشتر از حقوقِ فعلی است');
    await p.fill('#lpD_d2', 'اجارهٔ خانه در شیراز تقریباً نصفِ تهران است');
    await click('main .lp-dadd');
    await p.fill('#lpD_d3', 'مادرم بیمار است و هفته‌ای دو بار به او سر می‌زنم');
    await p.fill('#lpCond', 'همسرم کارش را از دست ندهد\nتا ده روزِ دیگر جواب بدهم');
    await sel('#lpSuff', 'هنوز نمی‌دانم'); await p.fill('#lpSuffW', 'نمی‌دانم دورکاری ممکن است یا نه');
    await p.fill('#lpDead', '۱۰ روزِ دیگر');
    await p.fill('#lpGuess', 'بهتر است بمانم'); await sel('#lpConf', '60'); await p.fill('#lpTest', 'اگر شرکت دورکاریِ دو روز در هفته بدهد، حدسم رد می‌شود');
    await noOverflow('understanding');
    await click('main .lp-usave');
    await click('main .lp-u .sv-g2');
    let s1 = await S(P1);
    chk(s1.u && s1.u[1] && s1.u[1].done && s1.u[1].dl.length === 3 && s1.u[1].dl[2].t.indexOf('مادرم') === 0 && s1.u[1].one && s1.u[1].why, 'understanding saved with a LIST of data ' + JSON.stringify(s1.u && s1.u[1] && s1.u[1].dl));
    chk(s1.u[1].deadline === D(10) && s1.live.dSeq === 3, 'own deadline parsed; datum id counter on the record ' + JSON.stringify([s1.u[1].deadline, s1.live.dSeq]));
    chk(s1.rev && s1.rev.u && s1.rev.u.due === D(1) && s1.rev.g && s1.g[1].conf === 60 && s1.g[1].guess, 'understanding + guess go on the spaced ladder ' + JSON.stringify(s1.rev));
    chk(await p.evaluate(() => APP.state.view === 'lprob' && APP.state.sub === 'plan'), 'after understanding ⇒ plan');

    /* ===== C) طرح ===== */
    const Q = await p.evaluate(() => APP.solveAskList('p', 1, 'find'));
    await ownCheck('main .lp-ask', 'ask-now card');
    info.ask0 = await p.evaluate(() => ({ q: document.querySelector('main .lp-ask .lp-q').textContent, why: /چرا این پرسش/.test(document.querySelector('main .lp-ask').textContent), one: document.querySelectorAll('main .lp-ask').length }));
    chk(info.ask0.one === 1 && info.ask0.q.indexOf(Q[0]) >= 0 && info.ask0.why, 'one question at a time, first (most general) from PLAN_QS, with «چرا این پرسش» ' + JSON.stringify(info.ask0));
    chk(await p.evaluate(() => !document.querySelector('main .lp-ask .sv-selfask')), 'G: below rung ⇒ the question is shown directly');
    await p.fill('#lpAsk', 'آدم‌هایی را دیده‌ام که برای حقوقِ بیشتر شهر عوض کردند؛ معیارشان درآمد و اجاره بود');
    await p.check('#lpAD_d1');
    await click('main .lp-askgo'); await click('main .lp-ask .sv-g2');
    await click('main .lp-asknext');
    info.ask1 = await p.evaluate(() => document.querySelector('main .lp-ask .lp-q').textContent);
    chk(info.ask1.indexOf(Q[1]) >= 0, '«پرسشِ بعد» ⇒ the next, more specific question');
    await click('main .lp-askskip');
    chk((await p.evaluate(() => document.querySelector('main .lp-ask .lp-q').textContent)).indexOf(Q[2]) >= 0, '«این پرسش حالا نمی‌خواند» ⇒ next');
    // مسئلهٔ مرتبط (کد)
    info.rel = await p.evaluate(kc0 => ({ rows: [...document.querySelectorAll('main .lp-relrow')].map(r => r.getAttribute('data-id')), kc: kc0 }), await p.evaluate(() => window.__kc0));
    chk(info.rel.rows.length >= 1 && info.rel.rows.length <= 3 && info.rel.rows.indexOf(info.rel.kc) >= 0 && info.rel.rows.indexOf('idea_unrel') < 0, 'related search over own records (≤3, shared words; unrelated idea out) ' + JSON.stringify(info.rel));
    await click('main .lp-relrow[data-id="' + info.rel.kc + '"] .lp-rellink');
    chk((await p.evaluate(pid => APP.liveHeur(pid), P1)).indexOf('rel') < 0, 'clicking «مرتبط است» alone is not a heuristic used');
    await p.fill('#lpRelC_0', 'پ'); await click('main .lp-relcsave');
    chk((await p.evaluate(pid => APP.liveHeur(pid), P1)).indexOf('rel') < 0, 'a non-specific «what carries over» is refused');
    await p.fill('#lpRelC_0', 'روشِ مذاکره برای افزایشِ حقوق را به شرطِ دورکاری منتقل می‌کنم');
    await click('main .lp-relcsave');
    chk((await p.evaluate(pid => APP.liveHeur(pid), P1)).indexOf('rel') >= 0, 'a written, specific link counts as the related-problem heuristic');
    info.relGen = await p.evaluate(() => { APP.S.put({ id: 'idea_gen', type: 'idea', what: 'دو روز در هفته ماهانه کمتر', title: 'دو روز در هفته کم', parts: [] }); const r = APP.liveRelated(APP.state.arg, 9).map(x => x.c.id); APP.S.del('idea_gen'); return r; });
    chk(info.relGen.indexOf('idea_gen') < 0, 'numbers and generic quantity/time words do not make a «related» suggestion ' + JSON.stringify(info.relGen));
    await sel('#lpSeen', 'no');
    chk(await p.locator('#lpSeenF').count() === 1, 'a «no» to «have you seen it?» gets a follow-up (what is familiar then?)');
    await p.fill('#lpSeenF', 'سبک‌سنگین کردنِ پول و خانواده را در خریدِ خانه هم داشتیم');
    await click('main .lp-seensave');
    // کار به عقب
    await p.fill('#lpBkS', 'در شهری کار می‌کنم که هم درآمدم بیشتر است و هم خانواده آرام است');
    await p.fill('#lpBk1', 'شرایطِ دورکاری یا رفت‌وآمد روشن شده باشد');
    await p.fill('#lpBkH', 'حقوق و اجارهٔ خانه در شیراز و تهران را می‌دانم');
    await click('main .lp-bksave');
    // مسئلهٔ کمکی
    await sel('#lpAuxK', 'special'); await p.fill('#lpAuxT', 'اگر فقط سه ماهِ آزمایشی بروم چه می‌شود؟'); await p.fill('#lpAuxB', 'نتیجهٔ سه ماه را به تصمیمِ دائمی تعمیم می‌دهم');
    await click('main .lp-auxsave');
    // حرکت
    await sel('#lpMv', 'mv_special'); await p.fill('#lpMvWhy', 'یک حالتِ ساده‌تر (سه ماه) خطرِ تصمیم را کم می‌کند');
    await click('main .lp-mvadd');
    chk(await p.locator('main .lp-mvlist .mv-chip').count() === 1, 'chosen move shown with a link to its page');
    // دادهٔ به‌کارنرفته — با نامش
    info.un = await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d') + ':' + x.querySelector('label').textContent));
    chk(info.un.length === 1 && /^d3:/.test(info.un[0]) && info.un[0].indexOf('«مادرم بیمار است') >= 0 && /استفاده کردی؟ اگر نه، چرا؟/.test(info.un[0]), 'plan asks about each UNUSED datum by name (mother; salary ticked, rent by text) ' + JSON.stringify(info.un));
    await p.fill('#lpPlan', 'نخست شرایطِ دورکاری را از شرکت بپرسم، سپس هزینهٔ زندگی را مقایسه کنم');
    await click('main .lp-plansave');
    chk((await S(P1)).live.plan == null, 'plan refused while an unused datum is unanswered');
    await sel('#lpPU_a_d3', 'unknown'); await p.fill('#lpPU_w_d3', 'نمی‌دانم سر زدن به مادرم را چطور در طرح بگذارم');
    await noOverflow('plan');
    await click('main .lp-plansave');
    s1 = await S(P1);
    chk(s1.live.plan && s1.live.plan.unused.d3 && s1.live.plan.unused.d3.ans === 'unknown' && s1.live.related.some(x => x.id === info.rel.kc) && s1.live.back && s1.live.aux.length === 1 && s1.live.moves[0].mv === 'mv_special', 'plan record ' + JSON.stringify(s1.live.plan));
    chk(await p.evaluate(() => APP.state.sub === 'exec'), 'after plan ⇒ execute');

    /* ===== E) ادعا ⇒ پروندهٔ کارخانه ===== */
    await p.fill('#lpClaim', 'فکر می‌کنم حقوقِ بیشتر هزینهٔ رفت‌وآمد برای سر زدن به مادرم را جبران می‌کند');
    await click('main .lp-claimgo');
    info.case = await p.evaluate(() => { const cs = APP.S.get(APP.state.arg); return { view: APP.state.view, src: cs && cs.src, input: cs && cs.st.st_intake.data.input, back: !!document.querySelector('main .lp-caseback') }; });
    chk(info.case.view === 'e_case' && info.case.src && info.case.src.type === 'lprob' && info.case.src.id === P1 && /رفت‌وآمد/.test(info.case.input) && info.case.back, 'claim ⇒ factory case prefilled, linked back ' + JSON.stringify(info.case));
    await click('main .lp-caseback');
    info.grade = await p.evaluate(() => (document.querySelector('main .lp-claim .lp-grade') || {}).textContent || '');
    chk(/شک/.test(info.grade) && /½/.test(info.grade), 'engine standing shown next to the claim (unfinished case ⇒ doubt ½, no AI) ' + info.grade);

    /* ===== D) اجرا روی واقعیت ===== */
    await click('main details[data-sec="c"] > summary');   // بخشِ «اجرا» را خودت باز می‌کنی
    await ownCheck('main .lp-stepf', 'step form');
    // B089: دادهٔ «نمی‌دانم کجا به کار می‌آید» با نامش در گامِ بعد برمی‌گردد
    chk(/مادرم بیمار است/.test(await p.locator('label[for="lpSU_d3"]').textContent()), 'B089: the «don\'t know where it fits» datum returns BY NAME at the next step');
    await p.fill('#lpStep', 'بیشتر فکر کنم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'x'); await sel('#lpConf', '70'); await p.fill('#lpWhen', 'ساعت ۹');
    await click('main .lp-stepsave');
    info.miss = await p.evaluate(() => (document.querySelector('main .lp-stepmiss') || {}).textContent || '');
    chk(/آرزوست/.test(info.miss) && /پیش‌بینی/.test(info.miss) && /روزش/.test(info.miss) && /مادرم/.test(info.miss), 'vague step / no prediction / time-only / unanswered unknown datum refused by code: ' + info.miss);
    await p.fill('#lpStep', 'با منابعِ انسانیِ شرکتِ شیراز تماس بگیرم و دربارهٔ دورکاریِ دو روز در هفته بپرسم');
    // A130: «روشن نمی‌بینی» گام را می‌بندد تا بنویسی چه روشن نیست
    await sel('#lpClear', 'نه');
    chk(await p.locator('#lpUnclear').count() === 1, 'A130 «نه» opens «which part is unclear?»');
    await p.fill('#lpPred', 'می‌گویند دورکاری فقط پس از شش ماه ممکن است');
    await p.fill('#lpWhen', '۲۰ روزِ دیگر');
    await sel('#lpSU_d3', 'use');
    await click('main .lp-stepsave');
    info.miss2 = await p.evaluate(() => (document.querySelector('main .lp-stepmiss') || {}).textContent || '');
    chk(/روشن نمی‌بینی/.test(info.miss2) && /مهلتِ خودِ مسئله/.test(info.miss2) && (await S(P1)).live.steps.length === 0, 'A130 «نه» blocks; a day after the problem\'s own deadline is refused: ' + info.miss2);
    await sel('#lpClear', 'بله'); await click('main .lp-stepsave');
    chk((await S(P1)).live.steps.length === 0 && /پیش‌تر گفتی روشن نمی‌بینی‌اش/.test(await p.locator('main .lp-stepmiss').textContent()), 'A130 compared: flipping «نه» to «بله» without naming the unclear part or rewriting the step smaller is refused');
    await sel('#lpClear', 'نه');
    await p.fill('#lpUnclear', 'نمی‌دانم با چه کسی در شرکت باید حرف بزنم');
    await click('main .lp-stepsave');
    chk((await S(P1)).live.steps.length === 0, 'A130: naming the unclear part is not enough — «روشن می‌بینی؟» must be answered again');
    await sel('#lpClear', 'مطمئن نیستم');
    await p.fill('#lpWhen', '۳ روزِ دیگر');
    await p.fill('#lpPrem', 'شرط: سر زدن به مادرم');
    await click('main .lp-stepsave');
    s1 = await S(P1);
    const st1 = s1.live.steps[0];
    info.fc = await p.evaluate(id => { const f = APP.S.get(id); return f && { p: f.p, due: f.due, dim: f.dim, live: f.live }; }, st1 && st1.fc);
    chk(st1 && st1.due === D(3) && st1.conf === 70 && st1.data.indexOf('d3') >= 0 && st1.reclear && /چه کسی/.test(st1.reclear.unclear) && st1.reclear.clear === 'مطمئن نیستم' && st1.unknownAsk.d3 === 'use' && info.fc && info.fc.p === 70 && info.fc.due === D(3) && info.fc.dim === 's_problem' && info.fc.live.pid === P1, 'step with prediction ⇒ event forecast record ' + JSON.stringify(info.fc));
    chk(!(await todayTxt()).some(t => /🔭|🎯/.test(t)), 'nothing due on day 0');
    await day(1); chk(!(await todayTxt()).some(t => /🔭/.test(t)), 'step not due on day +1');
    info.d1rev = await todayTxt();
    chk(info.d1rev.some(t => /مرورِ حلِ مسئله/.test(t)), 'day +1: understanding/guess reviews of the live problem in the existing «مرورِ حلِ مسئله» line');
    await day(3);
    let tt = await todayTxt();
    chk(tt.filter(t => /🔭/.test(t)).length === 1 && tt.some(t => /🔭 گامِ واقعی: «با منابعِ انسانیِ/.test(t)) && !tt.some(t => /🎯/.test(t)), 'day +3: one «امروز» line for the real step; the generic forecast line does not duplicate it ' + JSON.stringify(tt));
    await go('home');
    await click('main .dueb:has-text("🔭")');
    chk(await p.locator('main .lp-out').count() === 1, '«امروز» ⇒ «انجامش دادی؟ چه شد؟»');
    await ownCheck('main .lp-out', 'outcome card');
    await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', 'گفتند دورکاریِ دو روز از همان ماهِ اول ممکن است'); await sel('#lpOMatch', 'no'); await sel('#lpOProg', 'کمی');
    chk(/آینده/.test(await p.locator('main .lp-out .lp-owhy').textContent()), 'checkpoint: the initial «why» shown again');
    await click('main .lp-outsave');
    chk(!(await S(P1)).live.steps[0].closed, 'checkpoint asks «how much do you want it now?» (required)');
    await sel('#lpOWant', 'more');
    await click('main .lp-outsave');
    info.out1 = await p.evaluate(([pid]) => { const pg = APP.S.get('eprog_' + pid), st = pg.solve.live.steps[0], f = APP.S.get(st.fc); const FC = APP.PSY.answers().FC.filter(x => x.src === 'fcast'); const d = APP.MIND.model().dims.find(x => x.id === 's_problem');
      return { closed: st.closed, match: st.out.match, want: st.out.want, fco: f.outcome, fc: FC.map(x => x.p + ':' + x.ok), est: APP.PSY.forecastEst(FC).n, mind: d ? { fc: d.cal.filter(c => c.fc).length, est: d.est && d.est.fc && d.est.fc.n, ans: d.ans.length } : null }; }, [P1]);
    chk(info.out1.closed && info.out1.match === 'no' && info.out1.want === 'more' && info.out1.fco === 'نشد' && info.out1.fc.indexOf('0.7:false') >= 0 && info.out1.est >= 1 && info.out1.mind && info.out1.mind.fc >= 1 && info.out1.mind.est >= 1, 'outcome judged by the user ⇒ forecast calibration data path (P.forecastEst) ' + JSON.stringify(info.out1));
    chk(info.out1.mind.ans === 0, 'a live forecast is NOT an answer: «حلِ مسئله» accuracy list stays empty ' + JSON.stringify(info.out1.mind));
    info.genFc = await p.evaluate(() => { const before = APP.MIND.model().dims.find(x => x.id === 's_decision'); const a0 = before.ans.length, c0 = before.cal.length;
      APP.S.put({ id: 'fc_gen_t', type: 'fcast', q: 'آزمونِ پیش‌بینیِ عادی', p: 80, due: APP.today(), dim: 's_decision', outcome: 'شد' });
      const d = APP.MIND.model().dims.find(x => x.id === 's_decision'); const o = { ans: d.ans.length - a0, cal: d.cal.length - c0, fc: d.cal.filter(c => c.fc).length }; APP.S.del('fc_gen_t'); return o; });
    chk(info.genFc.ans === 0 && info.genFc.cal === 1 && info.genFc.fc >= 1, 'every «🎯» event forecast feeds forecast calibration only, not answer accuracy ' + JSON.stringify(info.genFc));
    chk(await p.locator('main .lp-surprise .lp-toknot').count() === 1 && await p.locator('main .lp-surprise .lp-reu').count() === 1, 'surprise ⇒ knot solver + «دوباره فهمِ مسئله»');
    await click('main .lp-surprise .lp-toknot');
    info.kc = await p.evaluate(pid => { const kc = APP.S.get(APP.state.arg); const pg = APP.S.get('eprog_' + pid); return { view: APP.state.view, exp: kc.intake.expected, act: kc.intake.actual, src: kc.src, inL: pg.solve.live.knots.indexOf(kc.id) >= 0, back: !!document.querySelector('main .lp-kback') }; }, P1);
    chk(info.kc.view === 'kcase' && /شش ماه/.test(info.kc.exp) && /ماهِ اول/.test(info.kc.act) && info.kc.src.live && info.kc.src.pid === P1 && info.kc.inL && info.kc.back, 'surprise ⇒ knot situation prefilled (expected vs actual), linked back ' + JSON.stringify(info.kc));
    await go('lprob', P1, 'exec');
    // غافلگیری ⇒ «دوباره فهمِ مسئله»: همان کارت با نوشته‌های پیشین؛ دادهٔ پاک‌شده شناسه‌اش را به دادهٔ تازه نمی‌دهد
    await click('main .lp-surprise .lp-reu');
    info.reu = await p.evaluate(() => ({ sub: APP.state.sub, one: (document.getElementById('lpOne') || {}).value, d3: (document.getElementById('lpD_d3') || {}).value }));
    chk(info.reu.sub === 'u' && /شیراز/.test(info.reu.one) && /مادرم/.test(info.reu.d3), 'surprise ⇒ re-understand with your previous card ' + JSON.stringify(info.reu));
    await p.fill('#lpD_d1', '');   // حقوق دیگر داده نیست
    await p.fill('#lpCond', 'همسرم کارش را از دست ندهد\nتا ده روزِ دیگر جواب بدهم\nدورکاری از ماهِ اول ممکن است');
    await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    s1 = await S(P1);
    chk(s1.live.uHist.length === 1 && /دورکاری/.test(s1.u[1].c) && s1.u[1].dl.map(x => x.id).join() === 'd2,d3', 're-understanding saved, earlier version kept, removed datum gone ' + JSON.stringify(s1.u[1].dl.map(x => x.id)));
    await go('lprob', P1, 'u'); await click('main .lp-reu2'); await click('main .lp-dadd');
    info.newId = await p.evaluate(() => [...document.querySelectorAll('main .lp-dl input')].map(e => e.id));
    chk(info.newId.indexOf('lpD_d4') >= 0 && info.newId.indexOf('lpD_d1') < 0, 'datum ids are never reused (new datum gets d4, not the deleted d1) ' + JSON.stringify(info.newId));
    await p.fill('#lpD_d4', 'یک مشاورِ شغلی را می‌شناسم');
    // پیش‌نویسِ کارتِ فهم با بارگذاریِ دوباره نمی‌رود
    await W(600);
    await p.reload(); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(x => { window.__day = x; APP.today = () => window.__day; APP.S.loaded = true; }, D(3));
    await go('lprob', P1, 'u');
    chk(await p.evaluate(() => (document.getElementById('lpD_d4') || {}).value) === 'یک مشاورِ شغلی را می‌شناسم', 'understanding draft survives a reload');
    await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    chk((await S(P1)).live.uDraft == null && (await S(P1)).u[1].dl.map(x => x.id).join() === 'd2,d3,d4', 'draft cleared on save');
    await go('lprob', P1, 'exec');
    // گامِ دوم، این‌بار انجام‌نشده ⇒ 🌱
    await p.fill('#lpStep', 'هزینهٔ ماهانهٔ زندگی در شیراز را با دو نفر از ساکنانش بررسی کنم');
    await sel('#lpClear', 'مطمئن نیستم'); await p.fill('#lpPred', 'هزینهٔ کل حدودِ یک‌سوم کمتر از تهران درمی‌آید'); await sel('#lpConf', '80'); await p.fill('#lpWhen', '۴ روزِ دیگر');
    await click('main .lp-stepsave');
    chk(await p.locator('main .lp-cur').count() === 1, 'current step shown with its check date');
    // ===== مسئلهٔ دوم (از کارِ دستیار، با همان فرم‌ها) =====
    const P2 = info.asNew && await p.evaluate(() => APP.S.all('eprob', x => x.live && x.by === 'assistant')[0].p.id);
    await go('lprob', P2);
    await p.fill('#lpOne', 'می‌خواهم تصمیم بگیرم کلاسِ آلمانی را ادامه بدهم یا نه'); await p.fill('#lpWhy', 'شاید روزی برای کار به آلمان بروم'); await click('main .lp-onesave'); await p.fill('#lpUnk', 'ادامه بدهم یا نه');
    await p.fill('#lpD_d1', 'سه ماه است می‌روم'); await p.fill('#lpD_d2', 'هفته‌ای شش ساعت وقت می‌گیرد');
    await p.fill('#lpCond', 'وقتِ کارم کم نشود'); await sel('#lpSuff', 'کافی است');
    await p.fill('#lpGuess', 'ادامه می‌دهم'); await sel('#lpConf', '70'); await p.fill('#lpTest', 'اگر یک ماه بی کلاس پیشرفتم نخوابد');
    await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    // G/9: مسئلهٔ تازه از کم‌ورزیده‌ترین پرسش آغاز می‌کند (نه همیشه پرسشِ ۱)
    chk(await p.evaluate(q => APP.qRung(q), Q[0]) === 2, 'G: one helpful use ⇒ rung 2');
    info.p2start = await p.evaluate(() => document.querySelector('main .lp-ask .lp-q').textContent);
    chk(info.p2start.indexOf(Q[1]) >= 0, 'a new problem starts at the least-practised question (Q2), not always Q1 ' + info.p2start);
    for (let k = 0; k < Q.length && (await p.evaluate(() => document.querySelector('main .lp-ask .lp-q').textContent)).indexOf(Q[0]) < 0; k++) await click('main .lp-askskip');
    chk(await p.evaluate(() => !document.querySelector('main .lp-ask .sv-selfask')), 'G: rung 2 ⇒ still shown directly');
    await p.fill('#lpAsk', 'تصمیمِ ادامهٔ باشگاه را دیده‌ام: شش ساعت در هفته'); await click('main .lp-askgo'); await click('main .lp-ask .sv-g2');
    chk(await p.evaluate(q => APP.qRung(q), Q[0]) === 3, 'G: second helpful SPACED use ⇒ rung 3');
    // ۷: روزِ کاربست = روزِ پاسخ، نه روزِ داوری
    chk(await p.evaluate(() => { APP.S.put({ id: 'eprog_qtest', type: 'eprog', lv: {}, tut: { plan: [{ src: 'live', q: '__q', d: '2026-11-02', at: 'x', self: 2, selfD: '2026-11-02' }, { src: 'live', q: '__q', d: '2026-11-03', at: 'y', self: 2, selfD: '2026-11-05' }] } }); const r = APP.qRung('__q'); APP.S.del('eprog_qtest'); return r; }) === 2, 'rung counts the answer day, not a later grading day');
    // ۱۶: طرح بی هیچ ابزارِ طرحِ به‌کاررفته پذیرفته نمی‌شود
    await p.fill('#lpPlan', 'نخست پس از سه ماه کلاس، یک ماه شش ساعت را می‌سنجم، سپس تصمیم می‌گیرم');
    await click('main .lp-plansave');
    chk((await S(P2)).live.plan == null && await p.locator('main .lp-plan .lp-heur.warnline').count() === 1, 'plan refused until at least one heuristic card was actually used');
    await sel('#lpMv', 'mv_special'); await p.fill('#lpMvWhy', 'یک ماه آزمایش، حالتِ ساده‌ترِ تصمیمِ همیشگی است'); await click('main .lp-mvadd');
    await p.fill('#lpPlan', 'نخست پس از سه ماه کلاس، یک ماه شش ساعت را می‌سنجم، سپس تصمیم می‌گیرم');
    await click('main .lp-plansave');
    chk((await S(P2)).live.plan && (await S(P2)).live.plan.heur.indexOf('move') >= 0 && (await S(P2)).rev.h, 'plan saved with the heuristic used; it goes on the spaced ladder (h)');
    await p.fill('#lpStep', 'یک ماه بی کلاس، هر روز ۲۰ دقیقه با اپ تمرین کنم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'سطحم افت نمی‌کند'); await sel('#lpConf', '60'); await p.fill('#lpWhen', '۴ روزِ دیگر');
    await click('main .lp-stepsave');

    /* ===== H) «امروز»: یک سطر برای دو گامِ موعد ===== */
    await day(7);
    tt = await todayTxt();
    chk(tt.filter(t => /🔭/.test(t)).length === 1 && tt.some(t => /🔭 ۲ گامِ واقعی موعدِ وارسی است/.test(t)), 'H: two due steps ⇒ ONE grouped «امروز» line ' + JSON.stringify(tt.filter(t => /🔭/.test(t))));
    await go('lprob', P1, 'exec');
    await sel('#lpODone', 'no'); await p.fill('#lpOWhat', 'وقت نشد'); await sel('#lpOProg', 'نه'); await sel('#lpOWant', 'same');
    await click('main .lp-outsave');
    info.noprog = await p.evaluate(pid => { const st = APP.S.get('eprog_' + pid).solve.live.steps[1]; return { fco: APP.S.get(st.fc).outcome, will: !!document.querySelector('main .lp-after .sv-will .sv-willf') }; }, P1);
    chk(info.noprog.fco === 'انجام نشد' && info.noprog.will, 'not done / no progress ⇒ 🌱 smallest-next-step card; undone forecast stays out of calibration ' + JSON.stringify(info.noprog));
    await click('main .lp-stuck');
    info.stuck = await p.evaluate(pid => { const kc = APP.S.get(APP.state.arg); return { v: APP.state.view, st: kc.intake.statement, src: kc.src, kinds: kc.kinds }; }, P1);
    chk(info.stuck.v === 'kcase' && /شیراز/.test(info.stuck.st) && /مادرم/.test(info.stuck.st) && info.stuck.src.live && !info.stuck.src.step && info.stuck.kinds[0] === 'problem', 'stuck ⇒ knot solver with the problem prefilled ' + JSON.stringify(info.stuck));
    await go('lprob', P1, 'exec');
    // گامِ بازی که با «حل شد» بسته می‌شود
    await p.fill('#lpStep', 'با همسرم یک جلسهٔ نیم‌ساعته دربارهٔ رفتن بگذاریم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'او موافقِ رفتن است'); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا');
    await click('main .lp-stepsave');

    /* ===== F) بازنگری — حل شد ===== */
    await click('main .lp-solved');
    await ownCheck('main .lp-lb', 'look-back card');
    info.lbun = await p.evaluate(() => [...document.querySelectorAll('main .lp-lb .lp-un')].map(x => x.getAttribute('data-d')));
    chk(/آینده/.test(await p.locator('main .lp-lb .lp-bwhy0').textContent()), 'look-back shows the initial «why» to compare with the end');
    chk(info.lbun.join() === 'd4', 'look-back asks only about data still unused (d4 added later; mother used in a step) ' + JSON.stringify(info.lbun));
    await p.fill('#lpBChk', 'با همسرم و مدیرِ شیراز جمع‌بندی را چک کردم');
    await sel('#lpBRes', 'نتیجه سالم ماند');
    await p.fill('#lpBUse', 'پیش از تصمیمِ بزرگ، شرطِ پنهان (دورکاری) را مستقیم بپرس، نه حدس');
    await p.fill('#lpBNew', 'شرکتی در شیراز به من پیشنهادِ کار داده با حقوقِ ۴۰٪ بیشتر. همسرم در تهران شاغل است، مادرم بیمار است و هفته‌ای دو بار به او سر می‌زنم.');
    await p.fill('#lpBWorked', 'پرسیدنِ مستقیم از منابعِ انسانی');
    await click('main .lp-lbsave');
    chk(!(await S(P1)).b[1], 'look-back: «راهِ دیگر» and «در یک نگاه» are required');
    await p.fill('#lpBOther', 'با فهرستِ هزینه‌ها و سود به همان تصمیم می‌رسیدم'); await p.fill('#lpBGlance', 'شرطِ پنهان را پرسیدم و تصمیم روشن شد');
    await sel('#lpBHit', 'نادرست بود'); await sel('#lpBBest', '0'); await sel('#lpBWant', 'same');
    await sel('#lpBU_a_d4', 'skip'); await p.fill('#lpBU_w_d4', 'تصمیم پیش از دیدنِ مشاور گرفته شد');
    await click('main .lp-lbsave');
    chk(!(await S(P1)).b[1], 'A157: an «invented» problem that is a near-copy of the original is refused');
    await p.fill('#lpBNew', 'چطور آشپزیِ غذای ایتالیایی را یاد بگیرم؟'); await click('main .lp-lbsave');
    chk(!(await S(P1)).b[1], 'A157: an invented problem that shares nothing with the original is refused (near but different)');
    await p.fill('#lpBNew', 'اگر همسرم پیشنهادِ کار در شهرِ دیگری بگیرد، چطور تصمیم بگیریم؟');
    await noOverflow('look-back');
    await click('main .lp-lbsave');
    s1 = await S(P1);
    info.lb = await p.evaluate(pid => { const made = APP.S.all('eprob', x => x.live && x.origin && x.origin.id === pid)[0]; const cards = APP.S.all('card', c => c.pb === pid); const A2 = APP.PSY.answers(); const pg = APP.S.get('eprog_' + pid), st = pg.solve.live.steps[2];
      return { made: made && { dorm: made.dormant, pid: made.p.id }, cards: cards.length, meta: A2.META.filter(x => x.src === 'eprog').length, fcLive: A2.FC.filter(x => x.src === 'eprog-live').map(x => x.p + ':' + x.ok), st3: st && { closed: st.closed, auto: st.out && st.out.auto, fco: APP.S.get(st.fc).outcome } }; }, P1);
    chk(s1.b[1] && s1.b[1].done && s1.b[1].bestQ === Q[0] && s1.b[1].want === 'same' && s1.rev.b && s1.lessons.length === 1 && info.lb.cards === 1, 'look-back: lesson ⇒ review card, most helpful question, want compared ' + JSON.stringify({ b: s1.b[1] && s1.b[1].bestQ, cards: info.lb.cards }));
    chk(s1.g[1].hit === 'نادرست بود' && info.lb.meta === 0 && info.lb.fcLive.indexOf('0.6:false') >= 0, 'live guess judged against reality ⇒ FORECAST path, not answer-confidence META ' + JSON.stringify(info.lb));
    chk(info.lb.st3 && info.lb.st3.closed && info.lb.st3.auto === 'solved' && info.lb.st3.fco === 'انجام نشد', 'solving closes the open step and its forecast (out of calibration, not pending) ' + JSON.stringify(info.lb.st3));
    chk(info.lb.made && info.lb.made.dorm === D(10), 'invented problem saved as a live problem, dormant until the ladder rung ' + JSON.stringify(info.lb.made));
    const P3 = info.lb.made && info.lb.made.pid;
    await go('e_prob', null, 'list');
    chk(await p.locator('main .lp-list .lp-item[data-pid="' + P3 + '"] .lp-dorm').count() === 1, 'invented problem listed with «برمی‌گردد …»');
    // مسئلهٔ دوم: نتیجهٔ «تاحدی»، گامِ بازِ دیگر، و آگاهانه کنار گذاشتن ⇒ گام و پیش‌بینی‌اش بسته
    await go('lprob', P2, 'exec');
    await sel('#lpODone', 'part'); await p.fill('#lpOWhat', 'دو هفته تمرین کردم'); await sel('#lpOMatch', 'part'); await sel('#lpOProg', 'کمی'); await sel('#lpOWant', 'less'); await click('main .lp-outsave');
    chk(await p.evaluate(pid => APP.S.get(APP.S.get('eprog_' + pid).solve.live.steps[0].fc).outcome, P2) === 'تاحدی', 'partial match ⇒ stays out of the binary forecast calibration');
    await p.fill('#lpStep', 'از معلم یک آزمونِ تعیینِ سطح بگیرم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'سطحم B1 است'); await sel('#lpConf', '60'); await p.fill('#lpWhen', '۵ روزِ دیگر');
    await click('main .lp-stepsave');
    await click('main .lp-abandon');
    await click('main .lp-lbsave');
    chk((await S(P2)).b[1] == null, 'abandon needs a reason');
    await p.fill('#lpBWhy', 'معلمم گفت پیشرفتم کند است'); await sel('#lpBSrc', 'crit'); await sel('#lpBBest', 'none'); await sel('#lpBWant', 'less');
    await click('main .lp-lbsave');
    info.ab = await S(P2);
    info.abFc = await p.evaluate(pid => { const st = APP.S.get('eprog_' + pid).solve.live.steps[1]; return { closed: st.closed, auto: st.out && st.out.auto, fco: APP.S.get(st.fc).outcome }; }, P2);
    chk(info.ab.b[1] && info.ab.b[1].state === 'abandoned' && info.ab.will && info.ab.will.drop && info.ab.will.drop.due === D(10), 'abandon ⇒ conscious drop on the 🌱 ladder ' + JSON.stringify(info.ab.will && info.ab.will.drop));
    chk(info.abFc.closed && info.abFc.auto === 'abandoned' && info.abFc.fco === 'انجام نشد', 'abandon closes the open step + its forecast ' + JSON.stringify(info.abFc));
    // ۱۱: دفترِ پیش‌بینی: پیش‌بینیِ گامِ زنده با نتیجهٔ درست و پیوند به گام، بی منوی ویرایش
    await go('fcast');
    info.led = await p.evaluate(() => ({ outs: [...document.querySelectorAll('main .fc-live .fc-liveout')].map(e => e.textContent), sel: document.querySelectorAll('main .fc-live select').length, go: document.querySelectorAll('main .fc-live .fc-golive').length }));
    chk(info.led.outs.indexOf('تاحدی') >= 0 && info.led.outs.indexOf('انجام نشد') >= 0 && info.led.outs.indexOf('نشد') >= 0 && info.led.sel === 0 && info.led.go === info.led.outs.length, '🎯 ledger shows live outcomes (incl. تاحدی/انجام نشد), not editable there, linked to the step ' + JSON.stringify(info.led));
    await day(12);
    chk(!(await todayTxt()).some(t => /🔭|🎯/.test(t)), 'closed steps of abandoned/solved problems never come back as due');

    /* ===== روزِ +۱۰ ⇒ ۱۲: مسئلهٔ ساخته‌شده برمی‌گردد؛ «فعلاً نه» پله‌ای دورتر ===== */
    await day(10);
    tt = await todayTxt();
    chk(tt.some(t => /🧩 مسئلهٔ تازه‌ای که خودت ساختی برگشت: «اگر همسرم/.test(t)), 'day +10: invented problem RETURNS in «امروز» ' + JSON.stringify(tt));
    chk(tt.some(t => /🌱 چیزی که آگاهانه رها کردی/.test(t)), 'day +10: conscious drop re-asked');
    await go('home');
    await click('main .dueb:has-text("خودت ساختی برگشت")');
    chk(await p.locator('main .lp-wake .lp-snooze').count() === 1, 'returned problem asks «شروع می‌کنم / فعلاً نه»');
    await click('main .lp-snooze');
    chk(await p.evaluate(pid => APP.S.get('eprob_' + pid).dormant, P3) === D(17) && !(await todayTxt()).some(t => /خودت ساختی برگشت/.test(t)), '«فعلاً نه» ⇒ next ladder rung (+7), no daily nagging');
    // رها کردن ⇒ «هنوز همان دلیل؟» ⇒ «نه — دوباره پیش می‌برمش» ⇒ مسئله دوباره باز
    await go('lprob', P2);
    chk(await p.locator('main .sv-willdropchk').count() === 1, 'drop re-check card on the problem page');
    await sel('main .sv-willdropchk select', 'back'); await click('main .sv-willdropgo');
    await go('lprob', P2);
    chk(await p.evaluate(pid => APP.livePhase(pid), P2) === 'c', 'brought back ⇒ the problem is open again');
    // ۱۴: افقِ بیش از یک سال فقط با تأییدِ صریح؛ «دهم آذر»، «آخرِ هفته»، «فرداها»
    await go('lprob', P2, 'exec');
    await p.fill('#lpStep', 'در آزمونِ رسمیِ گوته ثبت‌نام کنم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'قبول می‌شوم'); await sel('#lpConf', '50'); await p.fill('#lpWhen', '۴۰۰ روزِ دیگر');
    await click('main .lp-stepsave');
    chk(await p.locator('#lpFarOk').count() === 1 && (await S(P2)).live.steps.length === 2, 'a day beyond one year asks for explicit confirmation');
    await p.check('#lpFarOk'); await click('main .lp-stepsave');
    chk((await S(P2)).live.steps.length === 3 && (await S(P2)).live.steps[2].due === D(410), 'confirmed far step saved');
    info.when = await p.evaluate(T => ['دهم آذر', 'آخرِ هفته', 'فرداها', 'بیست و یکم آبان'].map(w => { const x = APP.willWhen(w, T); return x && x.date; }), D(10));
    chk(info.when[0] === '2026-12-01' && info.when[1] === '2026-11-13' && info.when[2] === null && info.when[3] === '2026-11-12', 'date words: «دهم آذر», «آخرِ هفته» (coming Friday), «فرداها» rejected ' + JSON.stringify(info.when));

    /* ===== روزِ +۱۷: مسئلهٔ ساخته‌شده دوباره؛ پرسشِ پلهٔ ۳ اول از خودت ===== */
    await day(17);
    chk((await todayTxt()).some(t => /خودت ساختی برگشت/.test(t)), 'day +17: returns again on the ladder');
    await go('home');
    await click('main .dueb:has-text("خودت ساختی برگشت")');
    await click('main .lp-wakego');
    chk(await p.evaluate(pid => APP.state.view === 'lprob' && !!APP.S.get('eprob_' + pid).woke, P3), 'returned problem opens for solving');
    await p.fill('#lpOne', 'روشِ تصمیمِ مشترک برای کارِ همسر در شهرِ دیگر'); await p.fill('#lpWhy', 'تا آن روز غافلگیر نشویم'); await click('main .lp-onesave'); await p.fill('#lpUnk', 'روشِ تصمیمِ مشترک');
    await p.fill('#lpD_d1', 'تجربهٔ تصمیمِ شیراز'); await p.fill('#lpCond', 'هر دو راضی باشیم'); await sel('#lpSuff', 'هنوز نمی‌دانم');
    await p.fill('#lpGuess', 'همان روش جواب می‌دهد'); await sel('#lpConf', '70'); await p.fill('#lpTest', 'اگر شرطِ پنهانِ تازه‌ای پیدا شود');
    await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    for (let k = 0; k < Q.length && !(await p.evaluate(() => !!document.querySelector('main .lp-ask .sv-selfask'))); k++) await click('main .lp-askskip');
    info.gate = await p.evaluate(() => ({ gate: !!document.querySelector('main .lp-ask .sv-selfask'), q: !!document.querySelector('main .lp-ask .lp-q'), skip: !!document.querySelector('main .lp-ask .sv-selfskip') }));
    chk(info.gate.gate && !info.gate.q && info.gate.skip, 'G: rung ≥ 3 ⇒ «الان از خودت چه می‌پرسی؟» BEFORE the canonical question, with «پرسشِ بعد» still available ' + JSON.stringify(info.gate));
    await ownCheck('main .lp-ask', 'self-ask gate');
    await click('main .sv-selfshow');
    chk(await p.locator('main .sv-selfq').count() === 0, 'canonical question not revealed before writing your own');
    await p.fill('main .sv-selfask input', 'شرطِ پنهانی هست که هنوز نپرسیده‌ام؟');
    await click('main .sv-selfshow');
    chk((await p.locator('main .sv-selfq').textContent()).indexOf(Q[0]) >= 0, 'then the canonical question is revealed to compare');
    await click('main .lp-ask .sv-g1');
    info.self = await p.evaluate(pid => { const pg = APP.S.get('eprog_' + pid); return { rec: (pg.tut.selfAsk || [])[0], q: !!document.querySelector('main .lp-ask .lp-q'), note: !!document.querySelector('main .lp-ask .sv-selfdone') }; }, P3);
    chk(info.self.rec && info.self.rec.match === 1 && /شرطِ پنهان/.test(info.self.rec.mine) && info.self.rec.src === 'live' && info.self.q && info.self.note, 'self-judged comparison recorded, then the usual card ' + JSON.stringify(info.self));
    // همین دروازه در شبیه‌ساز (a36) — فقط برای پرسشِ پلهٔ ۳؛ کارتِ مرحله‌ای دیگر بی‌تغییر؛ «پرسشِ بعد» در دروازه هم هست
    const SIM = await p.evaluate(Q0 => { const all = APP.probs(); let pP = null, pO = null; all.forEach(pr => { const s0 = pr.stages[0]; if (!s0) return; const ph = APP.stagePhase(pr, s0); if (ph === 'p' && !pP) pP = pr.id; if (ph !== 'p' && !pO) pO = pr.id; }); return { pP, pO }; }, Q[0]);
    await p.evaluate(pid => { APP.simState = { pid, lv: 1, order: 'hist', i: 0 }; APP.go('e_prob', pid, 'sim'); }, SIM.pP); await W(180);
    info.simP = await p.evaluate(() => { const a = document.querySelector('main .sv-ask'); return { gate: !!(a && a.querySelector('.sv-selfask')), sum: a && a.querySelector('summary').textContent, skip: !!(a && a.querySelector('.sv-selfskip')) }; });
    chk(info.simP.gate && info.simP.skip && /اول خودت بپرس/.test(info.simP.sum), 'G in the simulator: plan-phase ask card asks you first at rung 3 ' + JSON.stringify(info.simP));
    await p.evaluate(pid => { APP.simState = { pid, lv: 1, order: 'hist', i: 0 }; APP.go('e_prob', pid, 'sim'); }, SIM.pO); await W(180);
    info.simO = await p.evaluate(() => { const a = document.querySelector('main .sv-ask'); return { gate: !!(a && a.querySelector('.sv-selfask')), field: !!(a && a.querySelector('input[id^="svAsk_"]')), sum: a && a.querySelector('summary').textContent }; });
    chk(!info.simO.gate && info.simO.field && /❔ پرسشِ همین لحظه \(/.test(info.simO.sum), 'G behaviour-preserving below the rung (other phases unchanged) ' + JSON.stringify(info.simO));

    /* ===== ۶ + ۱۵: دادهٔ بسیار بلند (نشانی) در ۳۹۰px؛ نفی، به‌کاربردن نیست؛ فهرستِ «به‌کارنرفته» هنگامِ تایپ تازه می‌شود ===== */
    const LONG = 'https://example.org/' + 'a'.repeat(160) + '/b';
    const P4 = await p.evaluate(() => APP.liveCreate('سفرِ نوروز را با قطار برویم یا با هواپیما؟', 'برای نوروز می‌خواهیم به مشهد برویم و نمی‌دانم قطار بهتر است یا هواپیما.').p.id);
    await go('lprob', P4);
    await p.fill('#lpOne', 'می‌خواهم بین قطار و هواپیما برای سفرِ نوروز انتخاب کنم'); await p.fill('#lpWhy', 'سفر با بچه‌ها آرام باشد'); await click('main .lp-onesave'); await p.fill('#lpUnk', 'وسیلهٔ سفر');
    await p.fill('#lpD_d1', 'قیمتِ بلیتِ هواپیما دو میلیون است'); await p.fill('#lpD_d2', LONG);
    await p.fill('#lpCond', 'بچه‌ها خسته نشوند'); await sel('#lpSuff', 'کافی است');
    await p.fill('#lpGuess', 'قطار'); await sel('#lpConf', '60'); await p.fill('#lpTest', 'اگر قطار جا نداشته باشد');
    await noOverflow('understanding with a long URL datum');
    await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    await p.fill('#lpBkS', 'با بچه‌ها آرام و بی‌خستگی به مشهد رسیده‌ایم'); await p.fill('#lpBk1', 'وسیلهٔ مناسب رزرو شده'); await click('main .lp-bksave');
    await noOverflow('plan with a long URL datum');
    chk(await p.locator('main .lp-plan .lp-un[data-d="d1"]').count() === 1, 'price datum unused before typing the plan');
    // «لازم نیست» دلیل می‌خواهد: سه واژهٔ معنادار، و یک دلیلِ یکسان برای دو داده پذیرفته نیست
    await p.fill('#lpPlan', 'نخست جای قطار را می‌پرسم، سپس تصمیم می‌گیرم'); await W(400);
    await sel('#lpPU_a_d1', 'skip'); await p.fill('#lpPU_w_d1', 'این داده برای تصمیمِ سفر لازم نیست');
    await sel('#lpPU_a_d2', 'skip'); await p.fill('#lpPU_w_d2', 'این داده برای تصمیمِ سفر لازم نیست');
    await click('main .lp-plansave');
    chk(!(await S(P4)).live.plan, 'the same «not needed» reason for two data is refused');
    await p.fill('#lpPU_w_d2', 'ب ب'); await click('main .lp-plansave');
    chk(!(await S(P4)).live.plan, 'a «not needed» reason of fewer than three meaningful words is refused');
    await sel('#lpPU_a_d1', ''); await sel('#lpPU_a_d2', '');
    await p.fill('#lpPlan', 'قیمتِ بلیتِ هواپیما اصلاً مهم نیست؛ نخست جای قطار را می‌پرسم'); await W(450);
    chk(await p.locator('main .lp-plan .lp-un[data-d="d1"]').count() === 1, 'negation («اصلاً مهم نیست») does not count as using the datum');
    await p.fill('#lpPlan', 'نخست قیمتِ بلیتِ هواپیما (دو میلیون) را با قطار مقایسه می‌کنم، سپس جای قطار را می‌پرسم'); await W(450);
    chk(await p.locator('main .lp-plan .lp-un[data-d="d1"]').count() === 0 && await p.locator('main .lp-plan .lp-un[data-d="d2"]').count() === 1, 'the unused list updates live while typing the plan');
    await bidi('plan long');
    await sel('#lpPU_a_d2', 'skip'); await p.fill('#lpPU_w_d2', 'فقط نشانیِ سایت است'); await click('main .lp-plansave');
    await click('main .lp-abandon');
    await noOverflow('look-back with a long URL datum');

    /* ===== ۶: مسئلهٔ اثباتی ⇒ «چرا این پرسش» با زبانِ اثبات ===== */
    const P5 = await p.evaluate(() => APP.liveCreate('ادعای همکارم دربارهٔ شیفت‌ها', 'همکارم می‌گوید هر برنامهٔ شیفتِ منصفانه دست‌کم یک نفر را دو شبِ پیاپی سرِ کار می‌گذارد؛ می‌خواهم ثابت یا رد کنم.', 'prove').p.id);
    await go('lprob', P5);
    await p.fill('#lpOne', 'می‌خواهم ببینم این حکم دربارهٔ شیفت‌ها درست است'); await p.fill('#lpWhy', 'برنامهٔ شیفتِ تیم را من می‌چینم'); await click('main .lp-onesave');
    await p.fill('#lpUnk', 'هر برنامهٔ منصفانه دو شبِ پیاپی می‌خواهد'); await p.fill('#lpD_d1', 'پنج نفر و هفت شب'); await p.fill('#lpCond', 'هر نفر هفته‌ای حداکثر دو شب'); await sel('#lpSuff', 'هنوز نمی‌دانم');
    await p.fill('#lpGuess', 'حکم نادرست است'); await sel('#lpConf', '60'); await p.fill('#lpTest', 'یک برنامهٔ هفت‌شبه بی شبِ پیاپی بسازم');
    await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    info.prove = await p.evaluate(() => document.querySelector('main .lp-ask').textContent);
    chk(/طرحِ اثبات از پیوندِ فرض و حکم/.test(info.prove) && /حکم/.test(info.prove), 'prove-type live ask card uses proof wording in «چرا این پرسش؟»');

    /* ===== H) گراف، دستیار، نما ===== */
    info.g = await p.evaluate(([p1, p3, kc0]) => { const M = APP.GRAPH.build(), nb = k => (M.adj[k] || []).map(i => M.edges[i]).map(e => e.a === k ? e.b : e.a), k = 'lprob:' + p1, n = nb(k);
      const pg = APP.S.get('eprog_' + p1), cs = pg.solve.live.claims[0].caseId, fc = APP.S.get(pg.solve.live.steps[0].fc).id, card = APP.S.all('card', c => c.pb === p1)[0];
      const lps = Object.keys(M.nodes).filter(x => /^lprob:/.test(x)), iso = lps.filter(x => nb(x).indexOf('ssys:s_problem') < 0);
      return { node: !!M.nodes[k], move: n.indexOf('move:mv_special') >= 0, ecase: n.indexOf('ecase:' + cs) >= 0, kcase: pg.solve.live.knots.every(id => n.indexOf('kcase:' + id) >= 0), rel: n.indexOf('kcase:' + kc0) >= 0, made: nb('lprob:' + p3).indexOf(k) >= 0,
        fcast: nb('fcast:' + fc).indexOf(k) >= 0, card: !!card && nb('card:' + card.id).indexOf(k) >= 0, ssysAll: lps.length >= 4 && !iso.length, broken: APP.GRAPH.gaps(M).broken.filter(x => /lprob/.test(x.a + x.missing)).length, ty: !!APP.GRAPH.TM.lprob }; }, [P1, P3, info.rel.kc]);
    chk(Object.values(info.g).every(v => v === true || v === 0), 'graph: live problem ↔ s_problem, moves, cases, knots, related, invented problem, its forecasts and lesson card — no islands ' + JSON.stringify(info.g));
    await go('lprob', P2, 'exec');
    info.as = await p.evaluate(([pid, p1]) => { const AS = APP.ASSIST, s = { id: 'ach_x', msgs: [{ role: 'user', text: 'کمکم کن' }] }; const run = (ss, m) => AS.promptHooks.map(f => { try { return f(ss, m) || ''; } catch (e) { return 'ERR ' + e.message; } }).join('\n');
      const t = run(s, 'کمکم کن'), r2 = run({ id: 'z', msgs: [] }, 'نمی‌دونم چیکار کنم، باید بین دو کار تصمیم بگیرم');
      const o = { live: /مسئلهٔ زندهٔ این سشن \(/.test(t) && t.indexOf(pid) >= 0, one: /فقط \*\*یک\*\* پرسش/.test(t), noJudge: /داوری نکن/.test(t), phase: /مرحله: اجرا روی واقعیت/.test(t), ctxNull: AS.solvingCtx(s) === null, rules: /live_new/.test(r2), err: /ERR/.test(t), meta: !!(APP.VIEW_META.lprob && APP.VIEW_META.lprob.what && APP.VIEW_META.lprob.why), sub: APP.SUB_VIEWS.lprob === 'e_prob' };
      APP.go('home');
      const s2 = { id: 'y', lprob: pid, msgs: [] };
      o.offTopic = !/مسئلهٔ زنده|🔭/.test(run(s2, 'فونتِ صفحه ریز است') + run(s2, 'کارت مرور حل نشده'));
      o.onTopic = /مسئلهٔ زندهٔ این سشن/.test(run(s2, 'دربارهٔ کلاسِ آلمانی و ادامه دادنش یک سؤال دارم'));
      o.closed = !/مسئلهٔ زندهٔ این سشن/.test(run({ id: 'w', lprob: p1, msgs: [] }, 'دربارهٔ پیشنهادِ کار در شیراز و تهران'));
      return o; }, [P2, P1]);
    chk(Object.values(info.as).every((v, i) => Object.keys(info.as)[i] === 'err' ? !v : v), 'assistant: conditional hooks (phase, one question, never judges; not for off-topic or closed problems); VIEW_META/SUB_VIEWS ' + JSON.stringify(info.as));
    info.sysLen = await p.evaluate(() => (APP.ASSIST.SYS || '').length);
    chk(info.sysLen <= 20000, 'assistant SYS ≤ 20000 chars');
    for (const [pid, sub] of [[P1, 'plan'], [P1, 'back'], [P2, 'exec'], [P3, 'plan']]) { await go('lprob', pid, sub); await noOverflow('lprob ' + sub); await bidi('lprob ' + sub); }
    await go('e_prob', null, 'live'); await noOverflow('live tab'); await bidi('live tab');
    await go('home'); await noOverflow('home');

    /* ===== روزِ +۲۱: مرورِ فاصله‌دار — کل/چرا، حدس با آنچه شد، ابزارِ طرح از حافظه ===== */
    await day(21);
    tt = await todayTxt();
    chk(tt.some(t => /مرورِ حلِ مسئله/.test(t)), 'day +21: spaced reviews of live problems still on the ladder');
    await go('lprob', P1); await W(100);
    chk(await p.locator('main .sv-rev').count() === 1, 'review panel on the live problem page');
    chk(await p.locator('main .sv-rev #svRU1').count() === 1 && await p.locator('main .sv-rev #svRUW').count() === 1, 'u review asks the whole-in-one-sentence and the «why» from memory');
    await p.fill('main .sv-rev #svRG', 'اگر دورکاری بدهند، ماندن بهتر نیست'); await click('main .sv-rph[data-ph="g"] .sv-rshow');
    info.grev = await p.evaluate(() => document.querySelector('main .sv-rph[data-ph="g"]').textContent);
    chk(/داوری‌ات پس از آنچه شد: نادرست بود/.test(info.grev) && /حدست رد شد/.test(info.grev) && !/یک حالتِ خاص یا مثالِ نقضِ تازه/.test(info.grev), 'g review on a closed problem: shows the verdict; a rejected guess is not re-tested with a new special case');
    chk(!/پاسخِ مسئله: —/.test(info.grev) && /آنچه واقعاً شد/.test(info.grev), 'g review on a live problem shows what actually happened, not «پاسخِ مسئله: —»');
    await p.fill('main .sv-rev #svRB', 'شرطِ پنهان را مستقیم بپرس'); await p.fill('main .sv-rev #svRBG', 'پرسیدنِ شرطِ پنهان، یا فهرستِ هزینه‌ها');
    await click('main .sv-rph[data-ph="b"] .sv-rshow');
    chk(/شرطِ پنهان را پرسیدم/.test(await p.locator('main .sv-rph[data-ph="b"] .sv-rbwas').textContent()), 'b review returns «در یک نگاه / راهِ دیگر / چه کار کرد» from memory');
    await p.fill('main .sv-rev #svRH', 'وضعِ حل‌شده: درآمد بیشتر و خانواده آرام'); await click('main .sv-rph[data-ph="h"] .sv-rshow');
    chk(/خانواده آرام است/.test(await p.locator('main .sv-rph[data-ph="h"] .sv-rhwas').textContent()), 'the heuristic used (work backwards) returns from memory and is compared with what you wrote');
    await day(62); await go('lprob', P4); await noOverflow('+60 with a long URL datum'); await go('home'); await noOverflow('home +60');
  } catch (e) { errors.push('exception: ' + (e && e.stack || e)); }
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close();
  if (errors.length) process.exitCode = 1;
})();
