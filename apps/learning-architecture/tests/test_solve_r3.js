// دورِ سومِ پوششِ کتابِ حلِ مسئله (ممیزیِ مستقلِ دورِ دوم، ۲۰۲۶-۱۰-۱۵) — همه در تونل‌های موجود، روی dist/learning-architecture.html.
// هر بخش یکی از ایرادهای ممیزی را در صفحهٔ واقعی می‌سنجد:
//  ۱) خطاهای واقعی: AS.probPhaseOf کارتِ فهم/بازنگریِ شبیه‌ساز (eprog.solve.u/b) را می‌خواند ⇒ مرحلهٔ معلم و نشانه‌های تور جلو می‌روند؛
//     udc ِ {unknown,data,condition} و {u,d,c} با یک خواننده (A.udcOf) ⇒ «خوانشِ مرجع» در کارتِ فهم.
//  ۲) «پرسشِ همین لحظه» بی‌مدل روی کارتِ گام (از فهرست‌های ثابتِ SOLVE_PHASES/PLAN_QS/BACK_QS، کلی ⇐ خاص، «نمی‌خواند ⇒ بعدی»)، پاسخِ
//     data-own، انگیزهٔ گام پس از دیدنِ حرکتِ واقعی + خودداوری ⇒ نوبتِ «t» روی نردبان؛ توصیه‌های معلم در قلاب.
//  ۳) موفقیتِ کوچک در خودِ شبیه‌ساز وقتی (k+1)/(n+2) < ½ و آخرین تلاش غلط — گامِ آسان‌ترِ کلیددار، ثبت، حال، لذتِ کشف.
//  ۴) حدس در نخستین برخورد (نه سطحِ ۳)؛ مولدِ «حدس را بیازما» از کارتِ حدس و بازنگری، فاصله‌دار.
//  ۵) قابِ مسئلهٔ عملی: وارسیِ کدی (شش جزء از قلمِ خودت) + کارتِ مرور در گره‌گشا؛ در غربال، کارت با کد و ورودیِ بی‌مدل در کشوی تور.
//  ۶) محتوا: ورزشِ همهٔ حرکت‌ها، گام برای همهٔ حرکت‌ها با مسئله‌های تمرینیِ پیش‌فرض، شکل/نماد/تعریف/برهانِ خلف/ابعاد/هم‌ریختی/بازنگری/…
//  ۷) گامِ درستِ شبیه‌ساز فردا برنمی‌گردد (همان نردبان).
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
  const ownCheck = (sel, lab) => p.evaluate(sel => { const els = [...document.querySelectorAll(sel + ' input, ' + sel + ' textarea, ' + sel + ' select')]; return { n: els.length, notOwn: els.filter(e => !e.closest('[data-own]')).length, noLabel: els.filter(e => !(e.labels && e.labels.length) && !e.getAttribute('aria-label')).map(e => e.id) }; }, sel)
    .then(r => { chk(r.n > 0, lab + ': no fields'); chk(r.notOwn === 0, lab + ': ' + r.notOwn + ' fields outside data-own'); chk(!r.noLabel.length, lab + ': unlabelled ' + r.noLabel.join(',')); return r; });
  try {
    await p.goto(FILE); await p.waitForSelector('.nav'); await W(300);
    // «مسئله‌های کوتاهِ تمرینی» روشن (همان گزینهٔ پیش‌فرضِ یک‌کلیکی)؛ نمونه‌های بزرگِ سازنده خاموش
    await p.evaluate(() => { APP.S.loaded = true; APP.practiceEnable(); });
    const T = await p.evaluate(() => ({ today: APP.today(), d1: APP.addDays(APP.today(), 1), d3: APP.addDays(APP.today(), 3) }));

    /* ===== ۶) هر حرکت: ورزش و گامِ تمرینی با مسئله‌های تمرینیِ پیش‌فرض ===== */
    info.moves = await p.evaluate(() => APP.MOVE_LIST.map(m => ({ id: m.id, drills: m.drills.length, stages: APP.moveStages(m.id).length })).filter(x => x.drills < 2 || x.stages < 1));
    chk(!info.moves.length, 'moves without drills or a practice stage (default practice problems): ' + JSON.stringify(info.moves));
    info.drillShape = await p.evaluate(() => APP.MOVE_LIST.flatMap(m => m.drills.map((d, k) => (d.opts.length !== 4 || new Set(d.opts).size !== 4 || d.a < 0 || d.a > 3 || !d.why) ? m.id + ':' + k : null)).filter(Boolean));
    chk(!info.drillShape.length, 'malformed drills ' + info.drillShape);
    // محتوای ممیزی در ورزش‌ها (هر کدام کلیددار و فاصله‌دار مثلِ بقیه)
    info.content = await p.evaluate(() => { const D = id => APP.MOVES[id].drills.map(d => d.q + ' ' + d.opts[d.a] + ' ' + d.why).join(' | ');
      return { impossible: /ثابت کن نیست|مسئلهٔ اثباتیِ تازه/.test(D('mv_impossible')) && APP.MOVES.mv_impossible.drills.length >= 2,
        contra: /توضیح/.test(D('mv_contra')) && /بازآرایی/.test(D('mv_contra')) && /تنگ/.test(D('mv_contra')),
        definition: /لغت‌نامه/.test(D('mv_definition')) && /اولیه/.test(D('mv_definition')) && /وضعِ دانشت/.test(D('mv_definition')) && /اصطلاحِ کهنه/.test(D('mv_definition')),
        figure: /ویژگیِ نادرستی القا/.test(D('mv_represent')) && /کمک است، نه مبنای نتیجه/.test(D('mv_represent')) && /نقطه‌چین/.test(D('mv_represent')) && /مدل/.test(D('mv_represent')),
        notation: /دو نام برای یک چیز/.test(D('mv_equation')) && /حرفِ اول/.test(D('mv_equation')) && /با دلیل/.test(D('mv_equation')) && /مستقل/.test(D('mv_equation')),
        vary: /ذوزنقه/.test(D('mv_vary')) && /پلِ برگشت/.test(D('mv_vary')), aux: /وسیله را توجیه/.test(D('mv_auxproblem')) }; });
    chk(Object.values(info.content).every(Boolean), 'content gaps in move drills ' + JSON.stringify(info.content));
    // صفحهٔ حرکت: پاسخ به ورزشِ تازه ⇒ نوبتِ همان حرکت (نردبان)
    await p.evaluate(() => APP.go('move', 'mv_impossible')); await W(120);
    await p.locator('main .mv-drill').first().locator('.mv-dopt[data-ok]').click(); await W();
    info.impProg = await p.evaluate(() => (APP.S.get('moves_prog').by || {}).mv_impossible);
    chk(info.impProg && info.impProg.dok === 1 && info.impProg.iv === 1 && info.impProg.due === T.d1, 'mv_impossible drill not spaced ' + JSON.stringify(info.impProg));
    // «از تجربهٔ خودت» روی صفحهٔ حرکت (به قلمِ خودت؛ کنارِ همان حرکت می‌ماند)
    await ownCheck('main .mv-exp', 'own experience card');
    await p.fill('#mvExp_mv_impossible', 'سالِ پیش ثابت کردم برنامه‌ریزیِ آن هفته با آن قیدها ناممکن است'); await p.click('main .mv-expsave'); await W();
    chk(await p.evaluate(() => ((APP.S.get('moves_prog').by.mv_impossible || {}).exp || []).length === 1) && /برنامه‌ریزی/.test(await p.locator('main .mv-explist').innerText()), 'own experience with the move not saved/shown');
    // جدولِ ترجمه: «این کمیت‌ها مستقل‌اند؟»
    await p.evaluate(() => APP.go('move', 'mv_equation')); await W(120);
    chk(await p.locator('#mvEqIndep').count() === 1, 'independence question missing in the translation table');
    await p.selectOption('#mvEqIndep', 'no'); await W(40);
    chk(/از بقیه به دست می‌آید رابطهٔ تازه نیست/.test(await p.locator('main .mv-eqcount').innerText()), 'dependent relation not flagged');
    // مولدهای کدی روی صفحهٔ حرکت: «شکلِ قانون از ابعاد» (C112)
    await p.evaluate(() => APP.go('move', 'mv_dimcheck')); await W(120);
    await p.click('main .mv-genbtn[data-gen="dimform"]'); await W();
    chk(await p.locator('main .mv-gen[data-gen="dimform"] .mv-dopt').count() === 4, 'dimensional-form generator not on the move page');
    await p.locator('main .mv-gen[data-gen="dimform"] .mv-dopt[data-ok]').click(); await W(40);
    info.dimProg = await p.evaluate(() => (APP.S.get('moves_prog').by || {}).mv_dimcheck);
    chk(info.dimProg && info.dimProg.dn >= 1, 'generated law-form drill not spaced ' + JSON.stringify(info.dimProg));

    /* ===== ۱ب) udc: یک خواننده برای هر دو شکل ===== */
    info.udc = await p.evaluate(() => { const P = window.EPI_PROBLEMS.find(x => x.id === 'pb_p4_bear'), u = APP.udcOf(P), u2 = APP.udcOf({ udc: { u: 'x', d: ' ', c: 'z' } });
      const v = APP.probValid(JSON.parse(JSON.stringify(P))); return { u, u2, v: v.udc }; });
    chk(info.udc.u && /رنگِ خرس/.test(info.udc.u.u) && info.udc.u.d && info.udc.u.c && info.udc.u2.u === 'x' && !info.udc.u2.d && info.udc.v && info.udc.v.u === info.udc.u.u, 'udc not normalised in one place ' + JSON.stringify(info.udc));

    /* ===== ۱الف + ۴: مسئلهٔ خودِ کاربر (شبیه‌ساز) — حدس در نخستین برخورد؛ کارتِ فهم ⇒ probPhaseOf ⇒ مرحلهٔ معلم و نشانه‌های تور ===== */
    const PID = 'pb_u_r3';
    await p.evaluate(() => { const src = window.EPI_PROBLEMS.find(x => x.id === 'pb_p4_bear'), o = JSON.parse(JSON.stringify(src)); o.id = 'pb_u_r3'; o.title = 'مسئلهٔ خودم: رنگِ خرس'; delete o.set; delete o.neutral;
      APP.S.put({ id: 'eprob_pb_u_r3', type: 'eprob', status: 'approved', by: 'me', p: o }); });
    const sv = () => p.evaluate(pid => JSON.parse(JSON.stringify((APP.S.get('eprog_' + pid) || {}).solve || null)), PID);
    const pg = () => p.evaluate(pid => JSON.parse(JSON.stringify(APP.S.get('eprog_' + pid) || null)), PID);
    const open = (pid, lv, i) => p.evaluate(([pid, lv, i]) => { APP.simState = { pid, lv, order: 'hist', i }; APP.go('e_prob', pid, 'sim'); }, [pid, lv, i]).then(() => W(120));
    info.tour0 = await p.evaluate(pid => { const AS = APP.ASSIST, s = AS.newSession(); AS._turnSession = s; AS.DO.tour_plan({ goal: 'حل', facets: [{ key: 'f1', kind: 'problem', title: 'خرس' }] }); AS.DO.tour_link({ facet: 'f1', id: 'eprob_' + pid }); APP.S.put(s); window.__s = s;
      const P = APP.getProb(pid), ms = AS.tourMilestones(s.tour.facets[0]); return { ph: AS.probPhaseOf(pid), tut: AS.tutorPhase({ kind: 'prob', pid, p: P }, 'سلام'), und: (ms.find(m => /فهمِ مسئله/.test(m.t)) || {}).ok, back: (ms.find(m => /بازنگری پس از حل/.test(m.t)) || {}).ok }; }, PID);
    chk(!info.tour0.ph.und && info.tour0.tut === 'und' && !info.tour0.und, 'before the understanding card: ' + JSON.stringify(info.tour0));
    await open(PID, 1, 0);
    info.g1 = await p.evaluate(() => ['svGuess1', 'svConf1', 'svTest1', 'svTestR1', 'svIfRef1', 'svOne1'].map(id => !!document.getElementById(id)).concat([!!document.querySelector('main .sv-u .sv-gdrill')]));
    chk(info.g1.every(Boolean), 'first-attempt card lacks guess / test / one-sentence / guess drill ' + JSON.stringify(info.g1));
    await ownCheck('main .sv-u', 'understanding card');
    await p.fill('#svU1', 'جای نقطهٔ آغاز، که رنگِ خرس را معین می‌کند'); await p.fill('#svD1', 'سه پارهٔ یک‌کیلومتری'); await p.fill('#svC1', 'پایان همان آغاز است'); await p.selectOption('#svSuff1', 'کافی است');
    await p.fill('#svOne1', 'می‌خواهم بدانم شکارچی کجای زمین بوده که سه پاره او را به همان جا برگرداند');
    await p.click('main .sv-usave'); await W(60);
    chk(!(await p.locator('main .sv-ucmp').count()), 'first attempt accepted without a guess');
    await p.fill('#svGuess1', 'سفید — قطبِ شمال'); await p.selectOption('#svConf1', '70'); await p.click('main .sv-usave'); await W(60);
    chk(!(await p.locator('main .sv-ucmp').count()), 'guess accepted without a test');
    await p.fill('#svTest1', 'قطب را بیازما: جنوب، شرق روی مدار، شمال ⇒ برمی‌گردد'); await p.selectOption('#svTestR1', 'حدس سالم ماند'); await p.selectOption('#svIfRef1', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
    // تمرینِ «حدس را بیازما» از خودِ کارتِ حدس (ساختهٔ کد ⇒ موعدِ حرکتِ «حالتِ خاص»)
    await p.evaluate(() => { const d = document.querySelector('main .sv-u .sv-gdrill'); d.open = true; d.dispatchEvent(new Event('toggle')); }); await W(60);
    await p.click('main .sv-u .sv-gdrill .mv-genbtn[data-gen="guesstest"]'); await W(60);
    chk(await p.locator('main .sv-u .sv-gdrill .mv-dopt').count() === 4, 'guess-test generator not reachable from the guess card');
    await p.locator('main .sv-u .sv-gdrill .mv-dopt[data-ok]').click(); await W(60);
    info.gprog = await p.evaluate(() => (APP.S.get('moves_prog').by || {}).mv_special);
    chk(info.gprog && info.gprog.dok >= 1 && info.gprog.due, 'guess-test answer not spaced on «special case» ' + JSON.stringify(info.gprog));
    await p.click('main .sv-usave'); await W(60);
    info.udcShown = await p.locator('main .sv-udcref').innerText().catch(() => '');
    chk(/رنگِ خرس/.test(info.udcShown) && /سه پارهٔ/.test(info.udcShown), 'reference reading (udc) not shown for {unknown,data,condition} ' + info.udcShown);
    await p.click('main .sv-u .sv-g2'); await W(100);
    let s = await sv();
    chk(s.g[1] && s.g[1].before === true && !s.g[1].seen && /قطب/.test(s.g[1].test) && s.u[1].one && /سه پاره/.test(s.u[1].one), 'first-attempt guess / one sentence not saved ' + JSON.stringify({ g: s.g, u: s.u[1] }));
    info.tour1 = await p.evaluate(pid => { const AS = APP.ASSIST, s = window.__s, P = APP.getProb(pid), ms = AS.tourMilestones(s.tour.facets[0]); return { ph: AS.probPhaseOf(pid), tut: AS.tutorPhase({ kind: 'prob', pid, p: P }, 'سلام'), und: (ms.find(m => /فهمِ مسئله/.test(m.t)) || {}).ok }; }, PID);
    chk(info.tour1.ph.und && info.tour1.tut === 'plan' && info.tour1.und, 'understanding card does not advance the tutor phase / tour checkmark ' + JSON.stringify(info.tour1));

    /* ===== ۲) پرسشِ همین لحظه (بی‌مدل) + انگیزهٔ گام ===== */
    info.ask = await p.evaluate(() => { const a = document.querySelector('main .simcard .sv-ask'); return a && { own: !!a.closest('[data-own]'), open: a.open, ph: a.dataset.ph, sum: a.querySelector('summary').textContent, goal: !!a.querySelector('.sv-goal'), q0: APP.SOLVE_PHASES.u.q[0], q1: APP.SOLVE_PHASES.u.q[1] }; });
    chk(info.ask && info.ask.own && info.ask.open && info.ask.ph === 'u' && info.ask.sum.includes(info.ask.q0) && info.ask.goal, 'phase question card on step 1 ' + JSON.stringify(info.ask));
    await ownCheck('main .simcard .sv-ask', 'question card');
    await p.click('main .simcard .sv-asknext'); await W();
    info.ask2 = await p.evaluate(() => document.querySelector('main .simcard .sv-ask summary').textContent);
    chk(info.ask2.includes(info.ask.q1), 'next question (more specific) not shown after «does not fit» ' + info.ask2);
    await p.fill('main .simcard .sv-ask input[type=text]', 'شرط کافی است اگر جای نقطه را روی کره بگیرم');
    await p.click('main .simcard .sv-askgo'); await W();
    let G = await pg();
    chk(G.tut && G.tut.und && G.tut.und.length === 2 && G.tut.und[0].skip && G.tut.und[1].src === 'sim' && /کافی/.test(G.tut.und[1].text) && G.tut.qi.und === 2, 'question answer not recorded ' + JSON.stringify(G.tut));
    // گامِ ۱ درست ⇒ انگیزهٔ گام + مقایسه ⇒ خودداوری ۲ ⇒ نوبتِ t پس از پلهٔ «فردا»
    const pick = async (pid, i, right) => p.evaluate(([pid, i, right]) => { const s = APP.getProb(pid).stages[i]; const b = [...document.querySelectorAll('main .simcard .pb-opts .dopt')].find(x => s.opts.find(o => o.t === x.textContent && !!o.ok === right)); b.click(); }, [pid, i, right]);
    await pick(PID, 0, true); await W();
    chk(await p.locator('main .simcard .sv-mot').count() === 1, 'motive card not shown after the real move');
    await ownCheck('main .simcard .sv-mot', 'motive card');
    await p.fill('main .simcard .sv-mot input[type=text]', 'رنگ را به جای نقطه برگرداندم تا داده‌ها به مجهول وصل شوند');
    await p.click('main .simcard .sv-motgo'); await W(40); await p.click('main .simcard .sv-mot .sv-g2'); await W();
    s = await sv(); G = await pg();
    chk(G.tut.und[1].self === 2 && /جای نقطه/.test(G.tut.und[1].motive) && s.rev.t && s.rev.t.due === T.d3, 'motive / self-grade / spacing (correct ⇒ beyond tomorrow) ' + JSON.stringify([G.tut.und[1], s.rev.t]));
    // گامِ نادرست (فاز «طرح» ⇒ پرسش از PLAN_QS) ⇒ نوبتِ t فردا
    await p.click('main .simcard button:has-text("گام بعد")'); await W(120);
    info.askP = await p.evaluate(() => { const a = document.querySelector('main .simcard .sv-ask'); return { ph: a && a.dataset.ph, sum: a && a.querySelector('summary').textContent, plan0: APP.PLAN_QS[0].t }; });
    chk(info.askP.ph === 'p' && info.askP.sum.includes(info.askP.plan0), 'planning question card from PLAN_QS ' + JSON.stringify(info.askP));
    await pick(PID, 1, false); await W(40); await pick(PID, 1, true); await W();
    await p.fill('main .simcard .sv-mot input[type=text]', 'مدلِ کره تا جهت‌ها تعریف شوند'); await p.click('main .simcard .sv-motgo'); await W(40); await p.click('main .simcard .sv-mot .sv-g0'); await W();
    s = await sv(); chk(s.rev.t.due === T.d1, 'weak motive not back tomorrow ' + JSON.stringify(s.rev.t));
    // اجرا: «ثابت کن» فقط از سطحِ ۳ (برهانِ صوری برای آماده)
    info.execQ = await p.evaluate(() => ({ l1: APP.solveAskList('c', 1), l3: APP.solveAskList('c', 3), prove: APP.SOLVE_PHASES.c.q[1] }));
    chk(!info.execQ.l1.includes(info.execQ.prove) && info.execQ.l3.includes(info.execQ.prove) && /پیش از اجرا/.test(info.execQ.l1[0]) && /پیش از محاسبه/.test(info.execQ.l1[1]), 'execution questions ' + JSON.stringify(info.execQ));
    // ۷) گامِ درست فردا برنمی‌گردد؛ گامِ نادرست فردا
    info.sp = await p.evaluate(pid => { APP.simSpaceSync(); const r = APP.S.get('simsp_' + pid).by; return { n1: r.n1, n2: r.n2 }; }, PID);
    chk(info.sp.n1 && info.sp.n1.ok && info.sp.n1.iv === 3 && info.sp.n1.due === T.d3 && info.sp.n2 && !info.sp.n2.ok && info.sp.n2.due === T.d1, 'sim step spacing ' + JSON.stringify(info.sp));
    // پایانِ سطح ⇒ بازنگری (با پیوندِ مولدِ حدس و فیلدهای تازه) ⇒ probPhaseOf.back ⇒ نشانهٔ تور
    await p.click('main .simcard button:has-text("گام بعد")'); await W(100);
    await pick(PID, 2, true); await W(); await p.click('main .simcard button:has-text("پایان سطح")'); await W(150);
    info.lb = await p.evaluate(() => ['svLb_ana1', 'svLb_mono1', 'svLb_num1', 'svLbShort1', 'svLbBetter1', 'svLbCrit1', 'svLbClumsy1', 'svLbTaste1', 'svLbHit1'].map(id => !!document.getElementById(id)).concat([!!document.querySelector('main .sv-lb .sv-gdrill')]));
    chk(info.lb.every(Boolean), 'looking-back additions (analogy/monotone/numeric checks, shorten, improve, critical values, clumsy try, taste, guess judgement, guess drill) ' + JSON.stringify(info.lb));
    await ownCheck('main .sv-lb', 'looking-back');
    await p.check('#svLb_mono1'); await p.selectOption('#svLbRes1', 'نتیجه سالم ماند');
    await p.fill('#svLbUse1', 'مجهولِ غیرریاضی را به جای/عددی برگردان'); await p.fill('#svLbNew1', 'اگر پاره‌ها دو کیلومتر بودند، کجاها ممکن بود؟');
    await p.fill('#svLbCrit1', 'محیطِ مدار = ۱ کیلومتر تقسیم بر k'); await p.fill('#svLbTaste1', 'مدل‌سازی را دوست داشتم'); await p.selectOption('#svLbHit1', 'درست بود');
    await p.click('main .sv-lbsave'); await W(150);
    s = await sv();
    chk(s.b[1] && s.b[1].done && /بر k/.test(s.b[1].crit) && s.b[1].taste && s.g[1].hit === 'درست بود', 'looking-back extras not saved ' + JSON.stringify(s.b[1]));
    info.card = await p.evaluate(pid => APP.S.all('card', c => c.pb === pid).map(c => c.a), PID);
    chk(info.card.length === 1 && /مقدارهای بحرانی/.test(info.card[0]) && /سلیقه/.test(info.card[0]), 'looking-back extras not in the review card ' + JSON.stringify(info.card));
    info.tour2 = await p.evaluate(pid => { const AS = APP.ASSIST, s = window.__s, ms = AS.tourMilestones(s.tour.facets[0]); return { ph: AS.probPhaseOf(pid), back: (ms.find(m => /بازنگری پس از حل/.test(m.t)) || {}).ok }; }, PID);
    chk(info.tour2.ph.back && info.tour2.back, 'looking-back card does not tick the tour milestone ' + JSON.stringify(info.tour2));
    info.mind = await p.evaluate(() => APP.MIND.model().dims.find(x => x.id === 's_problem').cal.filter(c => c.p === 0.7 && c.ok === true).length);
    chk(info.mind === 1, 'first-attempt guess not in calibration ' + info.mind);
    // مرورِ «t»: موعد ⇒ همان پرسش بی‌نگاه
    await p.evaluate(pid => { const g = APP.S.get('eprog_' + pid); g.solve.rev.t.due = APP.today(); APP.S.put(g); }, PID); await open(PID, 1, 0);
    chk(await p.locator('main .sv-rev .sv-rph[data-ph="t"]').count() === 1, 'teacher-question review not due in the simulator');
    info.todayT = await p.evaluate(() => APP.dueList().filter(x => /مرورِ حلِ مسئله/.test(x.txt)).map(x => x.sub).join(' | '));
    chk(/پرسشی که پیش از گام/.test(info.todayT), 'teacher-question review not in Today ' + info.todayT);

    /* قلاب (فقط وقتی حل می‌کند): توصیه‌های معلم A113/A135/B258 + A129/C117 */
    info.hook = await p.evaluate(pid => { APP.simState = { pid, lv: 1, order: 'hist', i: 0 }; APP.go('e_prob', pid, 'sim'); const AS = APP.ASSIST, s = window.__s; return AS.promptHooks.map(f => { try { return f(s, 'سلام دوباره') || ''; } catch (e) { return ''; } }).join('\n'); }, PID);
    chk(/از تجربهٔ حل‌کردنِ خودت/.test(info.hook) && /برهانِ صوری نخواه/.test(info.hook) && /از جبر یا نمادگذاری بیزار/.test(info.hook) && /از بیرون/.test(info.hook), 'teacher advice missing from the hook');

    /* ===== ۳) موفقیتِ کوچک (بی‌مدل) ===== */
    await open('pb_p4_land', 1, 0);
    await pick('pb_p4_land', 0, false); await W(40); await pick('pb_p4_land', 0, true); await W();
    await p.click('main .simcard button:has-text("گام بعد")'); await W(120);
    info.win = await p.evaluate(() => { const w = document.querySelector('main .sv-win'); return w && { own: !!w.closest('[data-own]'), opts: w.querySelectorAll('.sv-winopts .dopt').length, txt: w.textContent, before: !!(w.compareDocumentPosition(document.querySelector('main .simcard')) & Node.DOCUMENT_POSITION_FOLLOWING) }; });
    chk(info.win && info.win.own && info.win.opts === 3 && /k\+1\)\/\(n\+2\)/.test(info.win.txt) && info.win.before, 'small-win card not offered by the simulator ' + JSON.stringify(info.win));
    const mvBefore = await p.evaluate(() => { const st = window.EPI_PROBLEMS.find(x => x.id === 'pb_p4_land').stages[1]; return { mv: st.mv[0], dn: (((APP.S.get('moves_prog') || {}).by || {})[st.mv[0]] || {}).dn || 0 }; });
    await p.click('main .sv-win .sv-winopts .dopt[data-ok]'); await W();
    await p.selectOption('#svWinMood_1', 'دلسردم'); await W(40);
    info.win2 = await p.evaluate(mv => { const s = APP.S.get('eprog_pb_p4_land').solve; return { wins: s.wins, moods: s.moods, dn: APP.S.get('moves_prog').by[mv].dn, knot: !!document.querySelector('main .sv-win .sv-winknot') }; }, mvBefore.mv);
    chk(info.win2.wins.length === 1 && info.win2.wins[0].ok && info.win2.wins[0].kind === 'move' && info.win2.dn === mvBefore.dn + 1 && info.win2.moods[0].v === 'دلسردم' && info.win2.knot, 'small win not recorded/spaced, or no knot link for discouragement ' + JSON.stringify(info.win2));
    await pick('pb_p4_land', 1, true); await W();
    info.joy = await p.evaluate(() => ({ joy: !!document.querySelector('main .simcard .sv-joy'), step: APP.S.get('eprog_pb_p4_land').solve.wins.some(w => w.kind === 'step') }));
    chk(info.joy.joy && info.joy.step, 'joy of discovery not named after the hard stretch ' + JSON.stringify(info.joy));
    // گامِ بی‌برچسب ⇒ همان گام با یک گزینهٔ کمتر؛ هزینهٔ سرنخ (بار اول نادرست)
    await p.evaluate(() => { const P = { id: 'pb_k_r3', title: 'تقسیمِ ارث', field: 'شخصی', statement: 'هفده شتر میانِ سه پسر', answer: '۹، ۶، ۲', why_hard: 'w', stages: [{ id: 'n1', q: 'نخستین حرکت؟', ctx: 'c', lvl: 1, opts: [{ t: 'قرض گرفتنِ یک شتر', ok: true }, { t: 'تقسیمِ مستقیم', ok: false }, { t: 'فروختنِ شترها', ok: false }] }, { id: 'n2', q: 'بعد؟', ctx: 'c', lvl: 1, opts: [{ t: 'پس دادنِ شتر', ok: true }, { t: 'نگه داشتن', ok: false }] }], dead: [], drills: [], lessons: [], src: [] };
      APP.S.put({ id: 'eprob_pb_k_r3', type: 'eprob', status: 'approved', by: 'me', p: P }); APP.S.put({ id: 'eprog_pb_k_r3', type: 'eprog', lv: { 1: { n2: { first: false, at: new Date().toISOString() } } } }); });
    await open('pb_k_r3', 1, 0);
    info.fewer = await p.evaluate(() => document.querySelectorAll('main .sv-win .sv-winopts .dopt').length);
    chk(info.fewer === 2, 'untagged step: easier version with one option fewer ' + info.fewer);
    await p.click('main .sv-win .sv-winopts .dopt[data-ok]'); await W(40);
    await p.evaluate(() => { [...document.querySelectorAll('main .simcard .pb-opts .dopt')].find(b => b.textContent === 'قرض گرفتنِ یک شتر').click(); }); await W();
    info.fewerCost = await p.evaluate(() => APP.S.get('eprog_pb_k_r3').lv[1].n1);
    chk(info.fewerCost && info.fewerCost.first === false, 'easier version with fewer options must cost the first try (like a hint) ' + JSON.stringify(info.fewerCost));

    /* ===== ۵) قابِ مسئلهٔ عملی ===== */
    const kid = await p.evaluate(() => { const kc = APP.knotNewCase(); kc.kinds = ['behavior']; kc.title = 'تصمیمِ تغییرِ شغل'; APP.S.put(kc); APP.go('kcase', kc.id, 'in'); return kc.id; }); await W(200);
    chk(await p.locator('main .kn-prac[data-own]:not(.hidden)').count() === 1, 'practical frame not owner-only/visible for a behaviour situation');
    await ownCheck('main .kn-prac', 'practical frame');
    for (const [id, v] of [['knPWant', 'شغلی که با دو فرزند جور شود'], ['knPHave', 'دو پیشنهادِ کار، پس‌اندازِ شش ماه'], ['knPCond', 'رفت‌وآمد کمتر از یک ساعت'], ['knPVague', '«جور شدن» یعنی ساعتِ ۵ خانه باشم'], ['knPIgnore', 'شایعه‌های شرکت را کنار می‌گذارم؛ تا دو گفت‌وگو']]) await p.fill('#' + id, v);
    await W(300); await p.click('main .kn-pracchk'); await W(150);
    info.pr1 = await p.evaluate(id => ({ chk: APP.S.get(id).intake.prac.chk, out: document.querySelector('main .kn-pracout').textContent, cards: APP.S.all('card', c => c.src === 'knot:practical').length }), kid);
    chk(info.pr1.chk && !info.pr1.chk.ok && info.pr1.chk.missing.join() === 'approx' && /تقریبِ کافی/.test(info.pr1.out) && info.pr1.cards === 0, 'incomplete practical frame not caught by code ' + JSON.stringify(info.pr1));
    await p.fill('#knPApprox', 'اگر درآمد ده درصد کمتر شود هم قبول است'); await W(300); await p.click('main .kn-pracchk'); await W(150);
    await p.click('main .kn-pracchk'); await W(100);
    info.pr2 = await p.evaluate(id => { const kc = APP.S.get(id), cs = APP.S.all('card', c => c.src === 'knot:practical'); return { ok: kc.intake.prac.chk.ok, card: kc.intake.prac.card, n: cs.length, due: cs[0] && cs[0].due, a: cs[0] && cs[0].a }; }, kid);
    chk(info.pr2.ok && info.pr2.card && info.pr2.n === 1 && info.pr2.due === T.d1 && /ده درصد/.test(info.pr2.a), 'complete practical frame ⇒ one review card from code ' + JSON.stringify(info.pr2));
    info.prDup = await p.evaluate(() => APP.practicalFrameCheck({ want: 'الف', have: 'الف', cond: 'ب', vague: 'پ', ignore: 'ت', approx: 'ث' }, APP.KPRAC_KEYS));
    chk(!info.prDup.ok && info.prDup.dup.length === 1, 'a part copied from another part accepted ' + JSON.stringify(info.prDup));
    // غربال: جزءِ مانده را خودِ کاربر در کشوی تور می‌نویسد (بی‌مدل) ⇒ کارت با کد
    info.sieve = await p.evaluate(async () => {
      const AS = APP.ASSIST, s = AS.newSession(); AS._turnSession = s; AS.DO.tour_plan({ goal: 'تصمیمِ خرید', facets: [{ key: 'f1', kind: 'claim', title: 'تصمیم' }] });
      AS.DO.tour_diag({ layers: [{ id: 'practical', st: 'ask', why: '' }] }); APP.S.put(s);
      const dr = AS.tourDrawer(s), ins = [...dr.querySelectorAll('.as-practin')];
      const o = { inputs: ins.length, own: ins.every(x => x.closest('[data-own]')), labels: ins.every(x => dr.querySelector('label[for="' + x.id + '"]')) };
      [['unknown', 'کدام ماشین'], ['data', 'دو آگهی'], ['cond', 'بودجه'], ['vague', 'به‌صرفه یعنی هزینهٔ ماهانه'], ['ignore', 'رنگ؛ تا دو بازدید']].forEach(([k, v]) => AS.sievePracticalSet(s, k, v));
      o.before = !s.tour.diag.practical.card;
      AS.sievePracticalSet(s, 'approx', 'تفاوتِ کمتر از هزینهٔ یک ماه');
      const c = APP.S.get(s.tour.diag.practical.card); o.card = !!c && c.src === 'sieve:practical' && c.due === APP.addDays(APP.today(), 1); o.st = s.tour.diag.practical.st;
      AS.sievePracticalSet(s, 'approx', 'دوباره'); o.once = APP.S.all('card', x => x.src === 'sieve:practical').length === 1;
      return o; });
    chk(info.sieve.inputs === 6 && info.sieve.own && info.sieve.labels && info.sieve.before && info.sieve.card && info.sieve.st === 'found' && info.sieve.once, 'sieve practical frame without the model ' + JSON.stringify(info.sieve));

    /* ===== ۶) محتوای دیگرِ ممیزی در تونل‌های موجود ===== */
    // کارتِ فهمِ اثباتی: پرسش‌های تازهٔ طرح‌ریزی و «حکمی که به فرض/حکم شکسته نمی‌شود»
    info.prove = await p.evaluate(() => ({ plan: APP.SOLVE_TYPES.prove.plan.join(' '), note: APP.SOLVE_TYPES.prove.note }));
    chk(/فرضِ دیگری/.test(info.prove.plan) && /قوی‌تر، ضعیف‌تر/.test(info.prove.plan) && /یافتنی یا اثباتیِ دیگری/.test(info.prove.plan) && /برای هر/.test(info.prove.note) && /محوری‌تر/.test(info.prove.note), 'proof template additions ' + JSON.stringify(info.prove));
    // ایستِ پیشرفت: حسِ هماهنگی؛ «تغییرِ مسئله» ⇒ پلِ برگشت
    await open('pb_p4_invoice', 1, 1);
    await p.click('main .simcard .sv-cpbtn'); await W();
    chk(await p.locator('#svCpFeel').count() === 1, 'aesthetic sign missing in the progress checkpoint');
    await p.selectOption('#svCpP', 'کمی'); await p.selectOption('#svCpFeel', 'ناهماهنگ — چیزی جا نمی‌افتد'); await p.click('main .sv-cpchg'); await W();
    await p.fill('#svCpBridge', 'حالتِ خاص را حل می‌کنم و همان روش را به قبضِ اصلی برمی‌گردانم'); await W(40);
    info.cp = await p.evaluate(() => APP.S.get('eprog_pb_p4_invoice').solve.cps.slice(-1)[0]);
    chk(info.cp && info.cp.feel && /قبضِ اصلی/.test(info.cp.bridge || ''), 'checkpoint feel / bridge back ' + JSON.stringify(info.cp));
    // وارسیِ گام‌ها: خطِ اصلی و جزئیات
    info.main = await p.evaluate(() => { const box = APP.solveStepCheck(() => 'گام اول\nگام دوم', APP.S.get('eprog_pb_p4_invoice') || { id: 'eprog_pb_p4_invoice', type: 'eprog', lv: {} }, 'r3', APP.getProb('pb_p4_invoice'), 't'); document.querySelector('main').appendChild(box);
      box.querySelector('.sv-chkopen').click(); const rows = box.querySelectorAll('.sv-row'); const set = (el, v) => { el.value = v; el.dispatchEvent(new Event('change')); };
      set(rows[1].querySelector('select[id$="r"]'), 'گامِ اصلی (خطِ اصلی)'); box.querySelector('.sv-chkrun').click(); return { roles: rows[0].querySelectorAll('select[id$="r"]').length, line: (box.querySelector('.sv-mainline') || {}).textContent || '' }; });
    chk(info.main.roles === 1 && /خطِ اصلی: گامِ ۲/.test(info.main.line) && /پیش از جزئیاتِ/.test(info.main.line), 'main-line ordering in the step check ' + JSON.stringify(info.main));
    // شبیه‌سازِ درسِ ۶: هم‌ریختیِ کامل/ناقص پرسیده و کلیددار
    info.iso = await p.evaluate(() => { const box = APP.COURSE_SIM[6].draw(); document.querySelector('main').appendChild(box); for (let i = 0; i < 60; i++) { const b = [...box.querySelectorAll('button:not([disabled])')]; if (!b.length) break; b[0].click(); } return { right: box.querySelectorAll('.sim-right').length, iso: /هم‌ریختیِ ناقص/.test(box.textContent) }; });
    chk(info.iso.right === 5 && info.iso.iso, 'isomorphism step in course sim 6 ' + JSON.stringify(info.iso));
    // واژهٔ «پولیا» در متنِ صفحه نیست
    await open(PID, 1, 0);
    chk(!/پولیا|Polya|Pólya/i.test(await p.evaluate(() => document.querySelector('main').innerText)), '«پولیا» in the simulator UI');
    // بی سرریزِ افقی در پهنای گوشی
    await p.setViewportSize({ width: 390, height: 800 }); await W(150);
    chk(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'horizontal overflow at 390px');
  } catch (e) { errors.push('SCRIPT ' + e.stack); }
  console.log(JSON.stringify(info, null, 1).slice(0, 6000));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
