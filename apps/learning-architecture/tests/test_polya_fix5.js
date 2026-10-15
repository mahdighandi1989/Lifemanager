// ممیزیِ مستقلِ یکپارچگیِ «چگونه آن را حل کنیم» (۲۰۲۶-۱۰-۱۵) — رفعِ یافته‌ها، روی صفحهٔ واقعی (dist/learning-architecture.html):
//  M2 انگیزهٔ گام جدا از پاسخ‌های «❔ پرسشِ همین لحظه» (+ جابه‌جاییِ رکوردهای پیشین؛ مرورِ «t» هرگز «انگیزهٔ گام» نمی‌پرسد؛ نوبتِ جدای «m»)
//  M3 روزِ وارسیِ 🌱 از «کِی» ِ خودِ کاربر (شمسی/نسبی/روزِ هفته؛ ناخوانا ⇒ فردا و می‌گوید)؛ یک تاریخ؛ «بعدا» پذیرفته نیست
//  M4 گام‌های 🌱 در «امروز» یک سطر؛ گامِ مبهم («سعی می‌کنم بهتر باشم»، «تلاش کنم.») رد؛ پاسخِ کوتاهِ پرسش («۱۲»)
//  M5 کیتِ خالی «وارسی شد» نیست؛ قیاس با وارسیِ کدی؛ M6 حالتِ جداکننده بیرون از جدول / «جدول هر دو را رد کرده»؛ L4 فرمولِ مبهم
//  M7 دستیار سطحی‌ها و جای هر مورد را می‌بیند؛ L2 قلاب‌ها؛ M1 هیچ موردِ «عمیق» جزیره نیست؛ L3 پیوندها به جای واقعی؛ L5 نردبان؛ L6؛ L7
//  و A.measurableCheck (عدد به واژه، سالِ تنها کمیت نیست).
// خطا ⇒ کدِ خروجِ غیرصفر.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const W = (ms) => p.waitForTimeout(ms || 80);
  const sel = async (s, v) => { await p.selectOption(s, v); await W(30); };
  try {
    await p.goto(FILE); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(() => { APP.S.loaded = true; });
    const T = await p.evaluate(() => ({ today: APP.today(), d1: APP.addDays(APP.today(), 1), d3: APP.addDays(APP.today(), 3), d21: APP.addDays(APP.today(), 21) }));
    const open = (pid, lv, i) => p.evaluate(([pid, lv, i]) => { APP.simState = { pid, lv, order: 'hist', i }; APP.go('e_prob', pid, 'sim'); }, [pid, lv, i]).then(() => W(150));
    const pick = (pid, i, right) => p.evaluate(([pid, i, right]) => { const s = APP.getProb(pid).stages[i]; const b = [...document.querySelectorAll('main .simcard .pb-opts .dopt')].find(x => s.opts.find(o => o.t === x.textContent && !!o.ok === right)); b.click(); }, [pid, i, right]);
    const clone = (id, title) => p.evaluate(([id, title]) => { const src = window.EPI_PROBLEMS.find(x => x.id === 'pb_p4_bear'), o = JSON.parse(JSON.stringify(src)); o.id = id; o.title = title; delete o.set; delete o.neutral;
      APP.S.put({ id: 'eprob_' + id, type: 'eprob', status: 'approved', by: 'me', p: o }); }, [id, title]);
    /* فهم و حدس از پیش نوشته شده (کارتِ فهم موضوعِ این آزمون نیست) */
    const understood = (pid) => p.evaluate(pid => { const g = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog', lv: {} }; g.solve = g.solve || {};
      g.solve.u = { 1: { type: 'find', u: 'رنگِ خرس', d: 'سه پاره', c: 'برگشت به همان نقطه', suff: 'کافی است', self: 2, done: true, at: new Date().toISOString() } }; g.solve.g = { 1: { guess: 'سفید', conf: 70, test: 'قطب', at: new Date().toISOString() } }; APP.S.put(g); }, pid);

    /* ===== M2: انگیزهٔ گام بی پاسخِ «پرسشِ همین لحظه» ===== */
    const P1 = 'pb_fx5_m2';
    await clone(P1, 'مسئلهٔ خودم: انگیزه'); await understood(P1); await open(P1, 1, 0);
    info.ask0 = await p.evaluate(() => { const a = document.querySelector('main .simcard .sv-ask'); return a && a.querySelector('summary').textContent; });
    chk(info.ask0 && /❔/.test(info.ask0), 'ask card on step 1 ' + info.ask0);
    await pick(P1, 0, true); await W();
    chk(await p.locator('main .simcard .sv-mot').count() === 1, 'motive card after the real move');
    await p.fill('main .simcard .sv-mot input[type=text]', 'رنگ را به جای نقطه برگرداندم'); await p.click('main .simcard .sv-motgo'); await W(40); await p.click('main .simcard .sv-mot .sv-g0'); await W(120);
    info.m2 = await p.evaluate(pid => { const g = APP.S.get('eprog_' + pid), T = g.tut || {}, all = [].concat(T.und || [], T.plan || [], T.exec || [], T.back || []);
      const a = document.querySelector('main .simcard .sv-ask');
      return { inTut: all.filter(e => e.k === 'motive' || e.q === 'انگیزهٔ گام').length, mot: (g.solve.mot || []).length, motSelf: (g.solve.mot || [])[0] && g.solve.mot[0].self, revT: !!g.solve.rev.t, revM: g.solve.rev.m && g.solve.rev.m.due,
        sum: a ? a.querySelector('summary').textContent : '', mine: a ? !!a.querySelector('.sv-askmine') : null, motShown: (document.querySelector('main .simcard .sv-mot') || {}).textContent || '' }; }, P1);
    chk(info.m2.inTut === 0 && info.m2.mot === 1 && info.m2.motSelf === 0 && !info.m2.revT && info.m2.revM === T.d1 && !/انگیزهٔ گام/.test(info.m2.sum) && info.m2.mine === false && /ثبت شد/.test(info.m2.motShown),
      'M2: motive stored apart (solve.mot), ask card still asks its real question, weak motive back tomorrow on its own «m» ladder, no «t» ' + JSON.stringify(info.m2));
    // پاسخِ کوتاه («۱۲») به پرسشِ گامِ بعد پذیرفته است
    await p.click('main .simcard button:has-text("گام بعد")'); await W(120);
    await p.evaluate(() => { document.querySelector('main .simcard .sv-ask').open = true; });
    await p.fill('main .simcard .sv-ask input[type=text]', '۱۲'); await p.click('main .simcard .sv-askgo'); await W();
    info.short = await p.evaluate(pid => { const T = APP.S.get('eprog_' + pid).tut || {}; return [].concat(T.und || [], T.plan || [], T.exec || [], T.back || []).filter(e => e.text === '۱۲').length; }, P1);
    chk(info.short === 1, 'short answer «۱۲» to the question of the moment accepted ' + info.short);
    // مرورِ «m» در روزِ موعد: پرسش دربارهٔ همان گام، نه «پرسش: انگیزهٔ گام»
    await p.evaluate(pid => { const g = APP.S.get('eprog_' + pid); g.solve.rev.m.due = APP.today(); APP.S.put(g); }, P1); await open(P1, 1, 1);
    info.m2rev = await p.evaluate(() => [...document.querySelectorAll('main .sv-rev .sv-rph')].map(x => x.dataset.ph + ':' + x.textContent.slice(0, 120)));
    chk(info.m2rev.some(x => /^m:/.test(x)) && !info.m2rev.some(x => /پرسش: «انگیزهٔ گام»/.test(x)), 'M2: due motive review is its own card ' + JSON.stringify(info.m2rev));
    // جابه‌جاییِ رکوردِ پیشین (k: motive در tut) — fill-empty، بی اتلاف
    const P2 = 'pb_fx5_mig';
    await clone(P2, 'مسئلهٔ خودم: رکوردِ قدیمی'); await understood(P2);
    await p.evaluate(pid => { const g = APP.S.get('eprog_' + pid), sid = APP.getProb(pid).stages[0].id;
      g.tut = { und: [{ at: '2026-10-01T10:00:00Z', q: 'مجهول چیست؟', skip: true, lv: 1, sid: 'zz', src: 'sim' }], plan: [{ at: '2026-10-02T10:00:00Z', q: 'انگیزهٔ گام', text: '', lv: 1, sid: sid, ph: 'p', src: 'sim', k: 'motive', motive: 'انگیزهٔ قدیمی', self: 1, selfAt: '2026-10-02T10:00:00Z' }] };
      g.solve.rev = { t: { iv: 1, due: APP.today(), hist: [] } }; APP.S.put(g); }, P2);
    await open(P2, 1, 0);
    info.mig = await p.evaluate(pid => { const g = APP.S.get('eprog_' + pid); const a = document.querySelector('main .simcard .sv-ask');
      return { plan: (g.tut.plan || []).length, und: (g.tut.und || []).length, mot: (g.solve.mot || []).map(m => m.motive + '|' + m.self + '|' + m.from).join(), revM: !!g.solve.rev.m, sum: a ? a.querySelector('summary').textContent : '', mine: a ? (a.querySelector('.sv-askmine') || {}).textContent || '' : '',
        rph: [...document.querySelectorAll('main .sv-rev .sv-rph')].map(x => x.dataset.ph + ':' + x.textContent.slice(0, 80)) }; }, P2);
    chk(info.mig.plan === 0 && info.mig.und === 1 && info.mig.mot === 'انگیزهٔ قدیمی|1|tut' && info.mig.revM && !/انگیزهٔ گام/.test(info.mig.sum) && !/پاسخت: «»/.test(info.mig.mine) && !info.mig.rph.some(x => /انگیزهٔ گام»/.test(x) && /^t:/.test(x)),
      'M2: legacy motive record migrated out of the answers list; review no longer asks «انگیزهٔ گام» ' + JSON.stringify(info.mig));

    /* ===== L5: نخستین «درست» یک پله جلوتر (۱ ⇐ ۳)، نه دوباره ۱ ===== */
    const P3 = 'pb_fx5_l5';
    await clone(P3, 'مسئلهٔ خودم: نردبان'); await open(P3, 1, 0);
    await p.fill('#svU1', 'رنگِ خرس'); await p.fill('#svD1', 'سه پاره'); await p.fill('#svC1', 'برگشت'); await sel('#svSuff1', 'کافی است');
    await p.fill('#svGuess1', 'سفید'); await p.fill('#svTest1', 'قطب'); await p.click('main .sv-usave'); await W(60); await p.click('main .sv-u .sv-g2'); await W(120);
    info.l5a = await p.evaluate(pid => APP.S.get('eprog_' + pid).solve.rev.u, P3);
    chk(info.l5a && info.l5a.iv === 1 && info.l5a.due === T.d1, 'L5: first review tomorrow on rung 1 ' + JSON.stringify(info.l5a));
    await p.evaluate(pid => { const g = APP.S.get('eprog_' + pid); g.solve.rev.u.due = APP.today(); g.solve.rev.g = { iv: 0, due: APP.today(), hist: [] }; APP.S.put(g); }, P3);   // g: رکوردِ پیشین با iv: 0
    await open(P3, 1, 0);
    await p.fill('#svRU', 'رنگِ خرسی که برمی‌گردد'); await p.click('main .sv-rph[data-ph="u"] .sv-rshow'); await W(40); await p.click('main .sv-rph[data-ph="u"] .sv-g2'); await W(120);
    await p.fill('#svRG', 'در قطب شمال آزمودم'); await p.click('main .sv-rph[data-ph="g"] .sv-rshow'); await W(40); await p.click('main .sv-rph[data-ph="g"] .sv-g2'); await W(120);
    info.l5 = await p.evaluate(pid => { const r = APP.S.get('eprog_' + pid).solve.rev; return { u: [r.u.iv, r.u.due], g: [r.g.iv, r.g.due] }; }, P3);
    chk(info.l5.u[0] === 3 && info.l5.u[1] === T.d3 && info.l5.g[0] === 3 && info.l5.g[1] === T.d3, 'L5: success after the first review ⇒ +3 (also for legacy iv: 0) ' + JSON.stringify(info.l5));

    /* ===== M5/M6: کیتِ حدس ===== */
    const P4 = 'pb_fx5_kit';
    await clone(P4, 'مسئلهٔ خودم: کیت'); await open(P4, 1, 0);
    const kitIds = await p.evaluate(() => [...document.querySelectorAll('main .sv-u .sv-kit input, main .sv-u .sv-kit select, main .sv-u .sv-kit textarea')].map(e => e.id));
    const K = pre => '#' + kitIds.find(id => new RegExp('^svGK1\\d+_' + pre + '$').test(id));
    await p.click('main .sv-u .sv-kchk'); await W(60);
    info.empty = await p.evaluate(() => ({ ok: !!document.querySelector('main .sv-u .sv-kok'), txt: document.querySelector('main .sv-u .sv-kout').textContent }));
    chk(!info.empty.ok && !/وارسی شد/.test(info.empty.txt) && /هنوز چیزی ننوشته‌ای/.test(info.empty.txt), 'M5: empty kit is not «وارسی شد» ' + JSON.stringify(info.empty));
    // جدولِ ۱، ۲، ۳، ۵ و رقیب‌های n و 2^(n−1): هر دو با جدول رد شده‌اند — حالتِ «n = 3» ِ درونِ جدول پیشنهاد نمی‌شود
    await p.fill(K('y0'), '1'); await p.fill(K('y1'), '3'); await p.fill(K('y2'), '6'); await p.click('main .sv-u .sv-kaddrow'); await W(40);
    const kit2 = await p.evaluate(() => [...document.querySelectorAll('main .sv-u .sv-kit input')].map(e => e.id));
    const K2 = pre => '#' + kit2.find(id => new RegExp('^svGK1\\d+_' + pre + '$').test(id));
    await p.fill(K2('x3'), '5'); await p.fill(K2('y3'), '15');
    await p.fill(K2('r0'), 'n'); await p.fill(K2('rt0'), 'n = 4'); await p.fill(K2('r1'), '2^(n-1)'); await p.fill(K2('rt1'), 'n = 4');
    await p.click('main .sv-u .sv-kchk'); await W(60);
    info.m6 = await p.evaluate(() => { const o = document.querySelector('main .sv-u .sv-kout'); return { t: o.textContent, sep: !!o.querySelector('.sv-ksep'), ok: !!o.querySelector('.sv-kok') }; });
    chk(!info.m6.sep && !/n = 3/.test(info.m6.t) && /هر دو حدسِ رقیب را رد کرده/.test(info.m6.t) && !info.m6.ok, 'M6: both rivals refuted by the table ⇒ said so, no separating case from inside the table ' + JSON.stringify(info.m6));
    // رقیب‌های سازگار با جدول ⇒ حالتِ جداکننده بیرون از جدول (۱، ۲، ۳، ۵ ⇒ ۴ نه ۳)
    await p.fill(K2('r0'), 'n(n+1)/2'); await p.fill(K2('r1'), 'n(n+1)/2 + (n-1)(n-2)(n-3)(n-5)');
    await p.click('main .sv-u .sv-kchk'); await W(60);
    info.m6b = await p.evaluate(() => { const o = document.querySelector('main .sv-u .sv-kout .sv-ksep'); return o ? o.textContent.replace(/[\u2066-\u2069]/g, '').replace(/\u00a0/g, ' ') : ''; });
    chk(/n = 4/.test(info.m6b), 'M6: separating case is the first untested n ' + info.m6b);
    // قیاس: رونوشتِ خودِ مسئله یا بی آزمون ⇒ وارسی نشده
    const stmt = await p.evaluate(pid => APP.getProb(pid).statement, P4);
    await p.fill(K2('ana'), stmt); await p.fill(K2('anag'), 'همان'); await p.click('main .sv-u .sv-kchk'); await W(60);
    info.ana = await p.evaluate(() => document.querySelector('main .sv-u .sv-kout').textContent);
    chk(/قیاس همان خودِ مسئله است/.test(info.ana) && /آزمونی بنویس که انتقال را بسنجد/.test(info.ana) && !/ابزارهای حدس وارسی شد/.test(info.ana), 'M5: analogy copied from the problem / without a test is not accepted ' + info.ana.slice(0, 300));
    await p.fill(K2('ana'), 'شکارچیِ روی صفحه: برگشت به نقطه با سه پاره روی سطحِ تخت ناممکن است'); await p.fill(K2('anag'), 'روی کره فقط نزدیکِ قطب شدنی است'); await p.fill(K2('anat'), 'یک نقطهٔ دیگر روی استوا را بیازمایم');
    await p.click('main .sv-u .sv-kchk'); await W(60);
    info.ana2 = await p.evaluate(() => ({ t: document.querySelector('main .sv-u .sv-kout').textContent, ok: !!document.querySelector('main .sv-u .sv-kout .sv-kok') }));
    chk(!/قیاس:/.test(info.ana2.t.replace(/قیاس: نوشته شده/, '')) && /قیاس: نوشته شده/.test(info.ana2.t), 'M5: a stated analogy with transfer and test passes the structural check ' + info.ana2.t.slice(0, 300));
    // L4 فرمول
    info.l4 = await p.evaluate(() => ['2 3', 'n n', 'nx', 'n2', 'n+x', '۱٫۵n', 'n × n', '2^n - 1'].map(t => { const f = APP.kformula(t); return f ? f(4) : null; }));
    chk(JSON.stringify(info.l4) === JSON.stringify([null, null, null, null, null, 6, 16, 15]), 'L4: ambiguous formulas rejected, Persian decimal accepted ' + JSON.stringify(info.l4));
    info.l4b = await p.evaluate(() => { const r = APP.kguessCheck({ rivals: [{ t: 'n+n', test: 'n = 3' }, { t: '2n', test: 'n = 4' }] }); return [r.ok, r.issues.join(' ')]; });
    chk(info.l4b[0] === false && /یکی‌اند/.test(info.l4b[1]), 'L4: identical rivals rejected ' + JSON.stringify(info.l4b));

    /* ===== گامِ مشخص، «کِی» و M3: روزِ وارسی از «کِی» ِ کاربر ===== */
    info.vague = await p.evaluate(() => ['بیشتر تلاش کنم', 'سعی می‌کنم بهتر باشم', 'بیشتر درس بخونم', 'تلاش خواهم کرد', 'یه کاری می‌کنم', 'بهتر می‌شم', 'تلاش کنم.', 'باید بیشتر تمرکز کنم', 'از فردا جدی‌تر', '۲۰ دقیقه تلاش کنم']
      .filter(st => APP.willStepCheck({ desire: 'want', hope: 'yes', step: st, when: 'فردا ساعتِ ۷' }, null, 'قبولی').ok));
    chk(!info.vague.length, 'vague / intent-only steps rejected by code ' + JSON.stringify(info.vague));
    info.concrete = await p.evaluate(() => ['۲۰ دقیقه فصل ۳ را بخوانم', 'جمعِ ۱/۲ و ۱/۳ را روی کاغذ حساب کنم', 'در جلسهٔ دوشنبه یک جمله دربارهٔ ایده بگویم'].filter(st => !APP.willStepCheck({ desire: 'want', hope: 'yes', step: st, when: 'فردا ساعتِ ۷' }, null, 'قبولی').ok));
    chk(!info.concrete.length, 'concrete steps accepted ' + JSON.stringify(info.concrete));
    info.when = await p.evaluate(() => ['بعدا', 'یه وقتی', '', '۲ روز پیش'].map(w => APP.willStepCheck({ desire: 'want', hope: 'yes', step: 'فصل ۳ را بخوانم', when: w }, null, 'x').ok));
    chk(info.when.every(x => x === false), 'a «when» that is not a time (or missing) is rejected ' + JSON.stringify(info.when));
    // تبدیلِ مستقلِ شمسی (Intl، تقویمِ persian) برای «۲۵ آبان»
    const jal = await p.evaluate(() => { const f = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', { month: 'numeric', day: 'numeric' }); for (let i = 1; i < 400; i++) { const d = APP.addDays(APP.today(), i), q = d.split('-'); if (f.format(new Date(+q[0], +q[1] - 1, +q[2], 12)) === '8/25') return d; } return null; });
    const PRS = await p.evaluate(() => APP.probs().filter(x => x.set === 'book4' || x.set === 'practice').slice(0, 3).map(x => x.id));
    const willOn = async (pid, step, when) => {
      await open(pid, 1, 1); await p.click('main .simcard .sv-cpbtn'); await W(60); await sel('#svCpP', 'نه'); await W(40);
      const ids = await p.evaluate(() => [...document.querySelectorAll('main .sv-cpwill .sv-willf select, main .sv-cpwill .sv-willf input')].map(e => e.id));
      const Q = pre => '#' + ids.find(id => new RegExp('^wl\\d+_' + pre + '$').test(id));
      await sel(Q('des'), 'want'); await sel(Q('hope'), 'yes'); await p.fill(Q('step'), step); await p.fill(Q('when'), when);
      await p.click('main .sv-cpwill .sv-willsave'); await W(80);
      return p.evaluate(pid => ({ out: (document.querySelector('main .sv-cpwill .sv-willf') || {}).textContent || '', st: ((APP.S.get('eprog_' + pid) || {}).solve || {}).will }), pid);
    };
    let r = await willOn(PRS[0], 'فصل ۳ را بخوانم', 'بعدا');
    chk(/زمان نیست/.test(r.out) && !(r.st && r.st.steps.length), '«بعدا» rejected in the UI ' + r.out.slice(-200));
    r = await willOn(PRS[0], 'سعی می‌کنم بهتر باشم', 'فردا');
    chk(/آرزوست/.test(r.out), 'intent-only step rejected in the UI');
    r = await willOn(PRS[0], 'دو مسئلهٔ فصلِ کسرها را روی کاغذ حل کنم', '۲۵ آبان، ۱۰ دقیقه');
    info.m3a = r.st && r.st.steps[0];
    chk(info.m3a && info.m3a.due === jal && info.m3a.dueFrom === 'when' && /از همان «کِی»/.test(r.out), 'M3: «۲۵ آبان» ⇒ check on that (gregorian) day ' + JSON.stringify([jal, info.m3a, r.out.slice(-160)]));
    await open(PRS[0], 1, 1); await p.click('main .simcard .sv-cpbtn'); await W(60); await sel('#svCpP', 'نه'); await W(40);
    info.cur = await p.evaluate(() => (document.querySelector('main .sv-cpwill .sv-willcur') || {}).textContent || '');
    info.curDates = await p.evaluate(([t, d]) => [APP.fdate(t), APP.fdate(d)], [T.d1, jal]);
    chk(info.cur.includes(info.curDates[1]) && !info.cur.includes(info.curDates[0]) && /همان روز/.test(info.cur), 'M3: current step shows one date — the user\'s ' + info.cur);
    r = await willOn(PRS[1], 'یک جدولِ سه‌ستونه برای حالت‌ها بکشم', 'سه هفته دیگر');
    chk(r.st && r.st.steps[0].due === T.d21, 'M3: «سه هفته دیگر» ⇒ +21 days ' + JSON.stringify(r.st && r.st.steps[0]));
    r = await willOn(PRS[2], 'صورتِ مسئله را با کلماتِ خودم بنویسم', 'ساعت ۸ صبح، ده دقیقه');
    chk(r.st && r.st.steps[0].due === T.d1 && r.st.steps[0].dueFrom === 'ladder' && /روزی خوانده نشد/.test(r.out), 'M3: time without a day ⇒ tomorrow and says so ' + JSON.stringify([r.st && r.st.steps[0], r.out.slice(-160)]));
    // رکوردِ پیشین (بی dueFrom) با «کِی» ِ خوانا: موعد از همان «کِی» و روزِ ثبت دوباره ساخته می‌شود
    info.fix = await p.evaluate(() => { const w = { steps: [{ id: 'ws0', at: new Date().toISOString(), step: 'x', when: 'سه هفته دیگر', iv: 1, due: APP.addDays(APP.today(), 1), checks: [] }] }; APP.willFix(w); return w.steps[0]; });
    chk(info.fix.due === T.d21 && info.fix.dueFrom === 'when', 'M3: legacy open step re-dated from its own «when» ' + JSON.stringify(info.fix));

    /* ===== M4: همهٔ گام‌های 🌱 ِ موعد یک سطر در «امروز» ===== */
    await p.evaluate(ids => ids.forEach(pid => { const g = APP.S.get('eprog_' + pid); g.solve.will.steps[0].due = APP.today(); APP.S.put(g); }), PRS);
    info.m4 = await p.evaluate(() => APP.dueList().filter(x => /🌱/.test(x.txt)).map(x => x.txt));
    chk(info.m4.length === 1 && /۳ گامِ کوچک/.test(info.m4[0]), 'M4: due 🌱 steps grouped into one «امروز» entry ' + JSON.stringify(info.m4));
    await p.evaluate(() => APP.go('home')); await W(200);
    info.m4ui = await p.evaluate(() => document.getElementById('main').innerText.split('\n').filter(l => /🌱/.test(l) && /گامِ کوچک|قول دادی|رها کردی/.test(l)).length);
    chk(info.m4ui === 1, 'M4: one 🌱 line on the Today page ' + info.m4ui);

    /* ===== L6: خاموش‌کردنِ مسئله‌های تمرینی مرورهای مسئله‌های کارشده را گم نمی‌کند ===== */
    await p.evaluate(pid => { const g = APP.S.get('eprog_' + pid); g.solve.rev = g.solve.rev || {}; g.solve.rev.u = { iv: 1, due: APP.today(), hist: [] }; g.solve.u = g.solve.u || {}; g.solve.u[1] = { u: 'a', d: 'b', c: 'c', done: true }; APP.S.put(g); }, PRS[0]);
    await p.evaluate(() => APP.go('settings')); await W(150); await p.uncheck('#practiceProbs'); await W(80);
    info.l6 = await p.evaluate(pid => ({ off: !APP.practiceOn(), due: APP.solveDue().some(x => x.p.id === pid), list: APP.dueList().some(x => /مرورِ حلِ مسئله/.test(x.txt)), will: APP.dueList().some(x => /🌱/.test(x.txt)) }), PRS[0]);
    chk(info.l6.off && info.l6.due && info.l6.list && info.l6.will, 'L6: practice off keeps the pending reviews and 🌱 steps of problems already worked on ' + JSON.stringify(info.l6));
    await p.check('#practiceProbs'); await W(60);

    /* ===== قلاب‌های دستیار (L2) و A.measurableCheck ===== */
    info.l2 = await p.evaluate(() => ({ src: ['منبعِ درآمدم کم است', 'پوشش بیمه چطور است', 'کتابِ حسابداری را خواندم', 'روش‌های حل مسئله', 'این کتاب در سامانه هست؟', 'کتاب تازه‌ای فرستادم'].map(m => APP.SOURCES.hookOn(m)),
      will: ['ترسیم شکل را بلد نیستم', 'پرداخت نقدی', 'از نقدِ مدیرم ترسیدم', 'می‌ترسم اشتباه کنم'].map(m => APP.willHookOn(m)) }));
    chk(JSON.stringify(info.l2.src) === '[false,false,false,true,true,true]' && JSON.stringify(info.l2.will) === '[false,false,true,true]', 'L2: hook triggers ' + JSON.stringify(info.l2));
    info.meas = await p.evaluate(() => ['دست کم یک بار در روز', 'حداقل ۳ بار در هفته', 'سال ۱۳۹۸ برابر بود', 'بیشتر از قبل', 'خیلی بهتر', '۵ کیلو', 'وزن > ۷۰', 'نه بیشتر از قبل'].map(x => APP.measurableCheck(x).ok));
    chk(JSON.stringify(info.meas) === '[true,true,false,false,false,false,true,false]', 'measurable check: number words count, a bare year does not ' + JSON.stringify(info.meas));

    /* ===== منبع‌ها: M1، M7، L3، L7 ===== */
    info.src = await p.evaluate(async () => {
      const SR = APP.SOURCES, o = {}, src = SR.get('polya_how_to_solve_it'), V = src.coverage.verdicts;
      const M = APP.GRAPH.build(), cov = {}; M.edges.forEach(e => { if (e.rel === 'covers') cov[e.a] = 1; });
      o.islands = src.items.filter(it => (V[it.id] || {}).verdict === 'عمیق' && !cov['srcitem:' + src.id + '/' + it.id]).map(it => it.id);
      o.viewCovers = M.edges.filter(e => e.rel === 'covers' && /^view:e_prob$/.test(e.b)).length;
      o.a013 = M.edges.filter(e => e.rel === 'covers' && e.a === 'srcitem:' + src.id + '/A013').map(e => e.b);
      // هر شناسهٔ تونل: پیوند یا دلیلِ صریح
      const ids = new Set(); Object.values(V).forEach(v => (v.system || []).forEach(s => ids.add(s)));
      o.unexplained = [...ids].filter(s => !SR.go(s) && !(SR.target(s) || {}).none);
      // دستیار (M7): سطحی‌ها و جای موردِ پرسیده
      const hk = msg => APP.ASSIST.promptHooks.map(f => { try { return f({ msgs: [] }, msg) || ''; } catch (e) { return ''; } }).join('\n');
      const H = hk('کار به عقب در سامانه کجاست؟'), sh = src.items.filter(it => /^(سطحی|ندارد)$/.test((V[it.id] || {}).verdict || ''));
      o.shallowSeen = sh.filter(it => H.includes(it.id + ' ')).length; o.nShallow = sh.length;
      // جای موردِ پرسیده — از دادهٔ پوشش، نه از شناسه‌ای ثابت (پوشش در هر دور عوض می‌شود)
      const asked = APP.SOURCES.matchItems('کار به عقب در سامانه کجاست؟').map(x => x.it.id), withPlace = asked.filter(id => ((V[id] || {}).system || []).length);
      o.where = withPlace.length > 0 && withPlace.every(id => new RegExp(id + ' «[^\\n]*⇐ ').test(H)); o.quiet = !/# منبع‌ها و پوشش/.test(hk('سلام، امروز چه کنم؟')) && !/# منبع‌ها و پوشش/.test(hk('منبعِ درآمد'));
      o.sysLen = APP.ASSIST.SYS.length;
      // L7: پیش‌فرض = تازه‌ترین سنجش، نه نخستینِ فهرست (منبعِ «aaa_…» با سنجشِ کهنه‌تر اول قرار می‌گیرد)
      const fake = { id: 'aaa_old_book', title: 'کتابِ آزمونیِ کهنه', author: 'آزمون', method: '', items: [{ id: 'X001', section: 'س', name_fa: 'مورد', what: '' }], coverage: { audited: '2020-01-01', verdicts: { X001: { verdict: 'سطحی', system: ['tech:1'] } } } };
      window.SRC_COV.unshift(fake); APP.go('sources'); await new Promise(r => setTimeout(r, 200));
      o.defOld = /چگونه آن را حل کنیم/.test(document.querySelector('#main .src-head h2').textContent);
      fake.coverage.audited = '2999-01-01'; APP.go('sources', 'x'); APP.go('sources'); await new Promise(r => setTimeout(r, 200));
      o.defNew = /کتابِ آزمونیِ کهنه/.test(document.querySelector('#main .src-head h2').textContent);
      window.SRC_COV.splice(window.SRC_COV.indexOf(fake), 1);
      // L3: پیوندها
      // پیوندها از همان حل‌کنندهٔ دکمه‌ها (SR.go) — مستقل از این‌که پوششِ این دور کدام شناسه را دارد؛ دکمه‌ها همین را صدا می‌زنند
      const click = async (sid) => { APP.go('sources', src.id, ''); await new Promise(r => setTimeout(r, 120)); const fn = APP.SOURCES.go(sid); if (!fn) return 'nolink'; fn(); await new Promise(r => setTimeout(r, 250)); return APP.state.view + '|' + APP.state.arg; };
      o.btnUsesGo = (() => { const b = document.querySelector('#main .src-it button.linkish'); return !!b; })();
      o.p11 = await click('proto:P11 (حالتِ مسئله)'); o.p11Body = document.getElementById('main').innerText.includes(APP.C.PROTOCOLS.find(x => x.id === 'P11').fa);
      o.eq = await click('move:eq-table indep (a19)'); o.eqTab = !!document.querySelector('#main .mv-eqtab');
      o.fam = await click('kfam:F2'); o.famSel = (document.getElementById('kcfam') || {}).value;
      o.sim = await click('course:sim:36');
      o.probWhere = (APP.SOURCES.target('prob:ask-now') || {}).where || '';
      o.codeWhy = /کدِ خالص/.test((APP.SOURCES.target('code:A.kseqDiffs') || {}).none || '') && !APP.SOURCES.go('code:A.kseqDiffs');
      return o;
    });
    const S = info.src;
    chk(!S.islands.length && S.viewCovers > 0 && S.a013.length > 0, 'M1: every «عمیق» item has a covers edge to where it lives (prob:* ⇒ view:e_prob) ' + JSON.stringify({ isl: S.islands.slice(0, 10), n: S.islands.length, v: S.viewCovers, a013: S.a013 }));
    chk(!S.unexplained.length, 'L3: every tunnel id has a link or an explicit reason ' + JSON.stringify(S.unexplained));
    chk(S.shallowSeen === S.nShallow && S.nShallow > 0 && S.where && S.quiet && S.sysLen <= 20000, 'M7: assistant sees the shallow items and where an asked item lives; quiet otherwise; SYS ≤ 20000 ' + JSON.stringify({ seen: S.shallowSeen, n: S.nShallow, where: S.where, quiet: S.quiet, sys: S.sysLen }));
    chk(S.defOld && S.defNew, 'L7: default source = most recently audited, not the first in the list ' + JSON.stringify([S.defOld, S.defNew]));
    chk(S.p11 === 'proto|P11' && S.p11Body && S.eq === 'move|mv_equation' && S.eqTab && S.fam === 'kcases|null' && S.famSel === 'F2' && /^(tech|lesson)\|36$/.test(S.sim) && /پرسشِ همین لحظه/.test(S.probWhere) && S.codeWhy,
      'L3: links open the real place ' + JSON.stringify({ p11: S.p11, body: S.p11Body, eq: S.eq, tab: S.eqTab, fam: S.fam, famSel: S.famSel, sim: S.sim, where: S.probWhere.slice(0, 120), code: S.codeWhy }));
  } catch (e) { errors.push('exception: ' + (e && e.stack || e)); }
  console.log(JSON.stringify(info).slice(0, 4000));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
