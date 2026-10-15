// حلِ مسئله در تونل‌های موجود (a36_solve.js + قلاب‌های a8_prob/a20_similar/a29_mind) — ممیزیِ پوششِ ۲۰۲۶-۱۰-۱۵، تغییرهای
// ت۱ (کارتِ فهم پیش از گامِ ۱ و در «افزودنِ مسئلهٔ تو»)، ت۱۴ (یافتنی/اثباتی)، ت۱۰ (حدس با اطمینان و آزمونش)، ت۸ (وارسیِ گام‌به‌گام با
// واژگانِ «راه عقل و برهان» + پروندهٔ کارخانه)، ت۹ (ایستِ پیشرفت، کنارگذاشتن، برگشت در «امروز» و شاهدِ s_later)، ت۲ (بازنگری ⇒ درسِ خودت،
// کارتِ مرور، بذرِ هم‌ساختارها) و مرورِ فاصله‌دار روی نردبانِ ۱/۳/۷/۲۱/۶۰ — روی dist/learning-architecture.html. خطا ⇒ کدِ خروجِ غیرصفر.
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
  try {
    await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(300);
    await p.evaluate(() => { const st = APP.S.settings(); st.samples = true; APP.S.saveSettings(st); });
    const PID = 'pb_greek';
    const sv = () => p.evaluate(pid => JSON.parse(JSON.stringify((APP.S.get('eprog_' + pid) || {}).solve || null)), PID);
    const open = (lv, i) => p.evaluate(([pid, lv, i]) => { APP.simState = { pid, lv, order: 'hist', i }; APP.go('e_prob', pid, 'sim'); }, [PID, lv, i]).then(() => p.waitForTimeout(80));
    const unlock = upto => p.evaluate(([pid, upto]) => { const P = window.EPI_PROBLEMS.find(x => x.id === pid); const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog', lv: {} }; for (let l = 1; l <= upto; l++) { pg.lv[l] = {}; P.stages.forEach(s => { pg.lv[l][s.id] = { first: true }; }); } APP.S.put(pg); }, [PID, upto]);
    // هر فیلدِ کارت‌ها به قلمِ کاربر است (data-own) و برچسب دارد؛ واژهٔ «پولیا» در صفحه نیست
    const ownCheck = (sel, lab) => p.evaluate(sel => { const els = [...document.querySelectorAll(sel + ' input, ' + sel + ' textarea, ' + sel + ' select')]; return { n: els.length, notOwn: els.filter(e => !e.closest('[data-own]')).length, noLabel: els.filter(e => !(e.labels && e.labels.length) && !e.getAttribute('aria-label')).map(e => e.id) }; }, sel)
      .then(r => { chk(r.n > 0, lab + ': no fields'); chk(r.notOwn === 0, lab + ': ' + r.notOwn + ' fields outside data-own'); chk(!r.noLabel.length, lab + ': unlabelled ' + r.noLabel.join(',')); return r; });
    const noPolya = async lab => { const t = await p.evaluate(() => document.querySelector('main').innerText); chk(!/پولیا|Polya|Pólya/i.test(t), lab + ': «پولیا» in UI'); };

    /* ===== ت۱ + ت۱۴: کارتِ فهم پیش از گامِ ۱ ِ سطحِ ۱ ===== */
    await open(1, 0);
    info.u1 = await p.evaluate(() => { const u = document.querySelector('main .sv-u'), c = document.querySelector('main .simcard'); return { u: !!u, before: !!(u && c && (u.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING)), own: !!(u && u.closest('[data-own]')), stmt: !!(u && u.querySelector('.sv-stmt')), hint: !!document.querySelector('main .simcard .sv-uhint') }; });
    chk(info.u1.u && info.u1.before && info.u1.own && info.u1.stmt && info.u1.hint, 'understanding card before step 1 ' + JSON.stringify(info.u1));
    await ownCheck('main .sv-u', 'u-card'); await noPolya('sim lv1');
    // نوع ⇒ قالب و پرسش‌های طرح‌ریزی عوض می‌شوند
    await p.selectOption('#svType1', 'prove'); await p.waitForTimeout(60);
    info.prove = await p.evaluate(() => ({ u: document.querySelector('label[for="svU1"]').textContent, d: document.querySelector('label[for="svD1"]').textContent, plan: document.querySelector('main .sv-u .sv-plan').textContent }));
    chk(/حکم/.test(info.prove.u) && /فرض/.test(info.prove.d) && /به حکم نگاه کن/.test(info.prove.plan) && /بخشی از فرض/.test(info.prove.plan), 'prove template ' + JSON.stringify(info.prove));
    await p.selectOption('#svType1', 'find'); await p.waitForTimeout(60);
    info.find = await p.evaluate(() => ({ u: document.querySelector('label[for="svU1"]').textContent, plan: document.querySelector('main .sv-u .sv-plan').textContent, suff: document.querySelector('label[for="svSuff1"]').textContent }));
    chk(/مجهول/.test(info.find.u) && /به مجهول نگاه کن/.test(info.find.plan) && /کافی/.test(info.find.suff) && /متناقض/.test(info.find.suff), 'find template ' + JSON.stringify(info.find));
    // ثبتِ ناقص رد می‌شود؛ کامل ⇒ مقایسه با صورت ⇒ خودداوری ⇒ ذخیره + نوبتِ فردا
    await p.click('main .sv-usave'); await p.waitForTimeout(60);
    chk(!(await p.locator('main .sv-ucmp').count()), 'incomplete understanding accepted');
    await p.fill('#svU1', 'مربعی هم‌مساحتِ دایره با خط‌کش و پرگار'); await p.fill('#svD1', 'یک دایره با شعاعِ معلوم'); await p.fill('#svC1', 'فقط خط‌کشِ بی‌درجه و پرگار\nشمارِ گام‌ها متناهی');
    await p.selectOption('#svSuff1', 'هنوز نمی‌دانم'); await p.fill('#svFig1', 'r = شعاع، s = ضلعِ مربع، s² = πr²'); await p.check('#svDrawn1');
    await p.click('main .sv-usave'); await p.waitForTimeout(60);
    chk(await p.locator('main .sv-ucmp').count() === 1, 'no comparison with statement after save');
    chk(await p.locator('main .sv-u .sv-grade[data-own]').count() === 1, 'self-grade not owner-only');
    await p.click('main .sv-u .sv-g2'); await p.waitForTimeout(80);
    let s = await sv();
    const tmr = await p.evaluate(() => APP.addDays(APP.today(), 1));
    chk(s && s.u[1] && s.u[1].done && s.u[1].self === 2 && s.u[1].type === 'find' && /متناهی/.test(s.u[1].c) && s.u[1].drawn === true, 'u[1] not saved ' + JSON.stringify(s && s.u));
    chk(s.rev.u && s.rev.u.due === tmr && s.rev.u.iv === 0, 'understanding not scheduled for tomorrow ' + JSON.stringify(s.rev));
    chk(!(await p.locator('main .sv-u').count()) && await p.locator('main .simcard .sv-usum').count() === 1, 'card not replaced by summary in step');
    // گامِ n1 گامِ «وارسی/داوری» بی‌برچسب است ⇒ پس از پاسخ برچسبِ «بازنگری»
    await p.evaluate(() => { const s = window.EPI_PROBLEMS.find(x => x.id === 'pb_greek').stages[0]; [...document.querySelectorAll('.simcard .dopt')].find(b => s.opts.find(o => o.t === b.textContent).ok).click(); });
    await p.waitForTimeout(60);
    chk(await p.locator('main .simcard .sv-lbchip').count() === 1, 'untagged judging stage not labelled «بازنگری»');

    /* ===== ت۹: ایستِ پیشرفت (دستی و خودکار)، کنارگذاشتن، «امروز»، برگشت ===== */
    await open(1, 1);
    chk(await p.locator('main .simcard .sv-cpbtn').count() === 1, 'no progress checkpoint button');
    await p.evaluate(() => { APP.SOLVE_CP_MIN = 0.003; APP.render(); }); await p.waitForTimeout(400);
    chk(await p.locator('main .sv-cp').count() === 1, 'checkpoint did not appear by itself after the timer');
    await p.evaluate(() => { APP.SOLVE_CP_MIN = 10; });
    await ownCheck('main .sv-cp', 'checkpoint');
    await p.click('main .sv-cpaside'); await p.waitForTimeout(40);
    chk((await sv()).aside == null, 'aside accepted without «پیشرفتی داشته‌ای؟»');
    await p.selectOption('#svCpP', 'کمی'); await p.fill('#svCpG', 'فهمیدم با هلال‌ها فقط بخشی حل می‌شود');
    await p.click('main .sv-cpaside'); await p.waitForTimeout(80);
    s = await sv();
    chk(s.aside && s.aside.due === tmr && s.aside.lv === 1 && s.aside.i === 1 && /هلال/.test(s.aside.gain) && s.cps.some(x => x.choice === 'کنار گذاشتن'), 'aside not recorded ' + JSON.stringify(s.aside));
    info.todayBefore = await p.evaluate(() => APP.dueList().filter(x => /کنارگذاشته/.test(x.txt)).length);
    chk(info.todayBefore === 0, 'set-aside problem in Today before tomorrow');
    await p.evaluate(pid => { const pg = APP.S.get('eprog_' + pid); pg.solve.aside.due = APP.today(); APP.S.put(pg); }, PID);   // «فردا» شد
    info.todayAside = await p.evaluate(() => { const it = APP.dueList().filter(x => /کنارگذاشته/.test(x.txt)); if (it[0]) it[0].go(); return it.map(x => x.txt); });
    await p.waitForTimeout(80);
    chk(info.todayAside.length === 1 && /بازگرداندنِ|برگشت/.test(info.todayAside[0]), 'set-aside not back in Today ' + JSON.stringify(info.todayAside));
    chk(await p.locator('main .sv-back').count() === 1, 'return card not shown');
    await p.selectOption('#svBackF', 'بله — راه باز شد'); await p.fill('#svBackW', 'دیدم مساحتِ هلال را می‌شود با مثلث سنجید');
    await p.click('main .sv-backgo'); await p.waitForTimeout(80);
    s = await sv();
    chk(!s.aside && s.incub.length === 1 && /^بله/.test(s.incub[0].fresh), 'incubation outcome not recorded ' + JSON.stringify(s.incub));
    chk(await p.evaluate(() => APP.simState.i) === 1, 'did not resume at the set-aside step');

    /* ===== ت۱۰ + ت۸: سطحِ ۳ — حدس با اطمینان، آزمونِ حدس، وارسیِ گام‌به‌گامِ حرکتِ خودت ===== */
    await unlock(2); await open(3, 0);
    info.g = await p.evaluate(() => ['svGuess3', 'svConf3', 'svTest3', 'svTestR3'].map(id => !!document.getElementById(id)));
    chk(info.g.every(Boolean), 'level 3 guess fields missing ' + JSON.stringify(info.g));
    await ownCheck('main .sv-u', 'u-card lv3');
    chk(!(await p.isVisible('main .sv-u .sv-stmt')), 'level 3 understanding shows the statement (should be without looking)');
    await p.fill('#svU3', 'مربعِ هم‌مساحتِ دایره'); await p.fill('#svD3', 'دایرهٔ معلوم'); await p.fill('#svC3', 'فقط خط‌کش و پرگار'); await p.selectOption('#svSuff3', 'کافی است');
    await p.click('main .sv-usave'); await p.waitForTimeout(40);
    chk(!(await p.locator('main .sv-ucmp').count()), 'level 3 saved without a guess');
    await p.fill('#svGuess3', 'به نظرم ناممکن است'); await p.selectOption('#svConf3', '80'); await p.fill('#svTest3', 'حالتِ خاص: اگر π گویا بود ساختنی می‌شد؛ پس همه‌چیز به ماهیتِ π بسته است'); await p.selectOption('#svTestR3', 'حدس سالم ماند');
    await p.click('main .sv-usave'); await p.waitForTimeout(40); await p.click('main .sv-u .sv-g1'); await p.waitForTimeout(80);
    s = await sv();
    chk(s.g[3] && s.g[3].conf === 80 && /ناممکن/.test(s.g[3].guess) && /π/.test(s.g[3].test) && s.rev.g && s.rev.g.due === tmr, 'guess not saved/scheduled ' + JSON.stringify(s.g));
    chk(await p.locator('main .simcard .sv-plan-step').count() === 1, 'type questions not next to «حرکتِ پیشنهادیِ تو»');
    await p.fill('.simcard #pbMine', 'اول هلال‌ها را مربع می‌کنم.\nپس دایره هم مربع می‌شود چون شبیهِ هلال است.');
    await p.click('main .simcard .sv-chkopen'); await p.waitForTimeout(60);
    info.rows = await p.locator('main .simcard .sv-row').count();
    chk(info.rows === 2, 'step-check rows ' + info.rows);
    await ownCheck('main .simcard .sv-chk', 'step-check');
    info.aqlOpts = await p.evaluate(() => { const st = window.EPI_ST.find(x => x.id === 'st_aql'); const want = st.ws.find(f => f.k === 'prem').cols.find(c => c.k === 'st').opts; const got = [...document.querySelector('main .simcard .sv-row select[id$="s"]').options].map(o => o.value).filter(Boolean); return JSON.stringify(want) === JSON.stringify(got); });
    chk(info.aqlOpts, 'step-check premise status not the st_aql vocabulary');
    const rowSel = async (i, suf, v) => p.selectOption(`main .simcard .sv-row[data-i="${i}"] select[id$="${suf}"]`, v);
    await rowSel(0, 'c', 'بله'); await rowSel(0, 'p', 'بله'); await rowSel(0, 'k', 'صوری'); await rowSel(0, 's', 'نظریِ منتهی به بدیهی (زنجیره روشن)');
    await p.fill('main .simcard .sv-row[data-i="0"] input[id$="m"]', 'قضیهٔ بقراط دربارهٔ هلال‌ها');
    await rowSel(1, 'c', 'بله'); await rowSel(1, 'p', 'نه'); await rowSel(1, 'k', 'شهودی');
    await p.click('main .simcard .sv-chkrun'); await p.waitForTimeout(80);
    info.weak = await p.locator('main .simcard .sv-weak').innerText().catch(() => '');
    chk(/گامِ ۲/.test(info.weak) && /ثابت/.test(info.weak), 'first weak step not located ' + info.weak);
    s = await sv();
    const ck = Object.keys(s.chk).find(k => /^mv_3_/.test(k));
    chk(ck && s.chk[ck].weak && s.chk[ck].weak.i === 1 && s.rev.c && s.rev.c.due === tmr, 'step-check not saved/scheduled ' + JSON.stringify(s.chk));
    info.weakRule = await p.evaluate(() => [APP.solveWeakOf([{ t: 'a', clear: 'بله', prove: 'بله', prem: 'x', st: 'بدیهی اولی', kind: 'صوری' }], 'قیاس معتبر — نتیجه ضرورتاً لازم می‌آید'), APP.solveWeakOf([{ t: 'a', clear: 'بله', prove: 'بله', prem: 'x', st: 'بدیهی اولی' }], 'تمثیلی (از شباهت)'), APP.solveWeakOf([{ t: 'a', clear: 'بله', prove: 'بله', prem: '', st: '' }], '')]);
    chk(info.weakRule[0] === null && info.weakRule[1] && info.weakRule[1].i === -1 && info.weakRule[2] && info.weakRule[2].i === 0, 'weak-step rule ' + JSON.stringify(info.weakRule));
    // همان گام‌ها در کاربرگِ واقعیِ ایستگاهِ «راه عقل و برهان»
    await p.click('main .simcard .sv-tocase'); await p.waitForTimeout(150);
    info.cs = await p.evaluate(() => { const v = APP.state; const cs = APP.S.get(v.arg); const d = cs && cs.st && cs.st.st_aql && cs.st.st_aql.data; return { view: v.view, sub: v.sub, func: d && d.func, arg: d && d.arg, prem: d && d.prem, ws: !!document.querySelector('main textarea') }; });
    chk(info.cs.view === 'e_case' && info.cs.sub === 'st_aql' && /استدلال/.test(info.cs.func || '') && (info.cs.arg || []).length === 2 && (info.cs.prem || []).length >= 1, 'factory case not opened with the steps ' + JSON.stringify(info.cs));

    /* ===== ت۲: بازنگری پس از آخرین گام ===== */
    const nSt = await p.evaluate(pid => window.EPI_PROBLEMS.find(x => x.id === pid).stages.length, PID);
    await open(3, nSt);
    info.lb = await p.evaluate(() => { const l = document.querySelector('main .sv-lb'), v = document.querySelector('main .verdict'); return { lb: !!l, before: !!(l && v && (l.compareDocumentPosition(v) & Node.DOCUMENT_POSITION_FOLLOWING)), hit: !!document.getElementById('svLbHit3'), chk: !!(l && l.querySelector('.sv-chk')) }; });
    chk(info.lb.lb && info.lb.before && info.lb.hit && info.lb.chk, 'looking-back card ' + JSON.stringify(info.lb));
    await ownCheck('main .sv-lb', 'looking-back'); await noPolya('looking back');
    await p.click('main .sv-lbsave'); await p.waitForTimeout(40);
    chk(!(await sv()).b[3] || !(await sv()).b[3].done, 'empty looking-back accepted');
    await p.check('#svLb_sp3'); await p.check('#svLb_all3'); await p.fill('#svLbHow3', 'با شعاعِ ۱ آزمودم؛ همهٔ داده‌ها (دایره، ابزار) در استدلال آمده‌اند');
    await p.selectOption('#svLbRes3', 'نتیجه سالم ماند'); await p.fill('#svLbArg3', 'ساختنی‌ها جبری‌اند\nπ متعالی است\nپس مربع ساختنی نیست');
    await p.fill('#svLbOther3', 'از راهِ نظریهٔ گالوا هم می‌شود'); await p.fill('#svLbGlance3', 'ابزار فقط اعدادِ جبری می‌سازد و π جبری نیست');
    await p.fill('#svLbUse3', 'برای ناممکن‌بودن، نشان بده ابزار به مجموعه‌ای بسته است که جواب در آن نیست');
    await p.fill('#svLbNew3', 'آیا با خط‌کش و پرگار می‌شود زاویهٔ ۲۰ درجه ساخت؟');
    await p.selectOption('#svLbHit3', 'درست بود');
    await p.click('main .sv-lbsave'); await p.waitForTimeout(100);
    s = await sv();
    chk(s.b[3] && s.b[3].done && s.lessons.length === 1 && /بسته/.test(s.lessons[0].use) && s.rev.b && s.rev.b.due === tmr && s.g[3].hit === 'درست بود', 'looking-back not saved ' + JSON.stringify({ b: s.b, l: s.lessons }));
    info.card = await p.evaluate(() => APP.S.all('card', c => c.pb === 'pb_greek').map(c => ({ q: c.q, a: c.a, due: c.due })));
    chk(info.card.length === 1 && /۲۰ درجه/.test(info.card[0].a) && info.card[0].due === tmr, 'review card from the lesson ' + JSON.stringify(info.card));
    chk(!(await p.locator('main .sv-lb').count()) && await p.locator('main .verdict').count() === 1, 'looking-back still shown after save');
    await p.evaluate(pid => APP.go('e_prob', pid, 'lessons'), PID); await p.waitForTimeout(80);
    chk(/۲۰ درجه/.test(await p.locator('main .sv-lessons').innerText().catch(() => '')), 'own lesson not in «درس‌ها»');
    info.seed = await p.evaluate(pid => APP.pbAsk(APP.getProb(pid), 4), PID);
    chk(/بذرهای حل‌کننده/.test(info.seed) && /۲۰ درجه/.test(info.seed), 'similar-problems request not seeded by the lesson');
    await p.evaluate(pid => APP.go('e_prob', pid, 'similar'), PID); await p.waitForTimeout(80);
    chk(await p.locator('main .pbs-seed').count() === 1, 'similar panel does not show the learner seed');
    // کالیبراسیونِ حدس ⇒ «🧠 کارنامهٔ ذهن»
    info.mind = await p.evaluate(() => { const m = APP.MIND.model(); const d = m.dims.find(x => x.id === 's_problem'); return { cal: d.cal.filter(c => c.p === 0.8 && c.ok === true).length, ev: m.events.filter(e => /بازنگریِ/.test(e.fa)).length }; });
    chk(info.mind.cal === 1 && info.mind.ev === 1, 'guess calibration / looking-back event not in mind card ' + JSON.stringify(info.mind));
    // «بعداً» ⇒ ناتمام ⇒ «امروز»
    await open(2, nSt);
    await p.click('main .sv-lblater'); await p.waitForTimeout(60);
    s = await sv(); chk(s.b[2] && s.b[2].skipped, 'later not recorded');

    /* ===== مرورِ فاصله‌دار: «امروز» ⇒ بی‌نگاه ⇒ مقایسه ⇒ نردبانِ ۱/۳/۷/۲۱/۶۰ ===== */
    info.todayRev0 = await p.evaluate(() => APP.dueList().filter(x => /مرورِ حلِ مسئله/.test(x.txt)).map(x => x.sub));
    chk(info.todayRev0.length === 1 && /بازنگریِ ناتمام/.test(info.todayRev0[0]), 'pending looking-back not in Today ' + JSON.stringify(info.todayRev0));
    await p.evaluate(pid => { const pg = APP.S.get('eprog_' + pid); ['u', 'b', 'g', 'c'].forEach(k => { pg.solve.rev[k].due = APP.today(); }); APP.S.put(pg); }, PID);
    info.todayRev = await p.evaluate(() => { const it = APP.dueList().filter(x => /مرورِ حلِ مسئله/.test(x.txt)); return it.map(x => x.txt + ' | ' + x.sub); });
    chk(info.todayRev.length === 1 && /فهمِ مسئله/.test(info.todayRev[0]) && /گامِ ضعیف/.test(info.todayRev[0]), 'due reviews not in Today ' + JSON.stringify(info.todayRev));
    await open(1, 2);
    info.rph = await p.evaluate(() => [...document.querySelectorAll('main .sv-rev .sv-rph')].map(x => x.dataset.ph));
    chk(['u', 'b', 'g', 'c'].every(k => info.rph.includes(k)), 'review panel phases ' + JSON.stringify(info.rph));
    await ownCheck('main .sv-rev', 'review');
    chk(!/کارتِ پیشینت/.test(await p.locator('main .sv-rev .sv-rph[data-ph="u"]').innerText()), 'review shows the old answer before recall');
    await p.fill('#svRU', 'مربعِ هم‌مساحت'); await p.fill('#svRD', 'دایره'); await p.fill('#svRC', 'خط‌کش و پرگار');
    await p.click('main .sv-rph[data-ph="u"] .sv-rshow'); await p.waitForTimeout(40);
    chk(/کارتِ پیشینت: .*دایرهٔ معلوم/.test(await p.locator('main .sv-rph[data-ph="u"]').innerText()), 'review does not reveal the earlier card after recall');
    await p.click('main .sv-rph[data-ph="u"] .sv-g2'); await p.waitForTimeout(60);
    s = await sv(); const d1 = await p.evaluate(() => APP.addDays(APP.today(), 1)), d3 = await p.evaluate(() => APP.addDays(APP.today(), 3));
    chk(s.rev.u.iv === 1 && s.rev.u.due === d1 && s.rev.u.hist.length === 1 && s.rev.u.hist[0].self === 2, 'ladder step 1 ' + JSON.stringify(s.rev.u));
    await p.evaluate(pid => { const pg = APP.S.get('eprog_' + pid); pg.solve.rev.u.due = APP.today(); APP.S.put(pg); }, PID); await open(1, 2);
    await p.fill('#svRU', 'مربع'); await p.fill('#svRD', 'دایره'); await p.fill('#svRC', 'ابزار'); await p.click('main .sv-rph[data-ph="u"] .sv-rshow'); await p.click('main .sv-rph[data-ph="u"] .sv-g2'); await p.waitForTimeout(60);
    s = await sv(); chk(s.rev.u.iv === 3 && s.rev.u.due === d3, 'ladder step 3 ' + JSON.stringify(s.rev.u));
    await p.fill('#svRW', 'به‌جای «شبیه است»: قضیهٔ لیندمان که π متعالی است'); await p.click('main .sv-rph[data-ph="c"] .sv-rshow'); await p.click('main .sv-rph[data-ph="c"] .sv-g0'); await p.waitForTimeout(60);
    s = await sv(); chk(s.rev.c.iv === 1 && s.rev.c.due === d1, 'failed review not back to 1 day ' + JSON.stringify(s.rev.c));

    /* ===== گذر بی کارتِ فهم ⇒ «ناتمام» (شبیه‌ساز بسته نمی‌شود) ===== */
    await p.evaluate(() => { APP.simState = { pid: 'pb_quintic', lv: 1, order: 'hist', i: 0 }; APP.go('e_prob', 'pb_quintic', 'sim'); }); await p.waitForTimeout(60);
    chk(await p.locator('main .sv-u').count() === 1 && await p.locator('main .simcard .dopt').count() > 1, 'sim blocked or card missing on another problem');
    await p.evaluate(() => { APP.simState.i = 1; APP.render(); }); await p.waitForTimeout(60);
    chk(await p.evaluate(() => { const s = APP.S.get('eprog_pb_quintic').solve; return s.u[1] && s.u[1].skipped; }), 'skipped understanding not recorded');

    /* ===== مسئلهٔ خودت از گره‌گشا: «بعداً در آرامش حل شد» ⇒ شاهدِ s_later ===== */
    info.own = await p.evaluate(() => {
      const kc = { id: 'kc_sv', type: 'kcase', title: 'مسئلهٔ آزمون', kinds: ['problem'], intake: { stmts: [] } }; APP.S.put(kc);
      const P = { id: 'pb_k_sv', title: 'تقسیمِ شترها', field: 'مسئلهٔ شخصی', statement: 'هفده شتر', answer: '۹، ۶، ۲', why_hard: 'w', origin: { type: 'kcase', id: 'kc_sv' }, stages: [{ id: 'n1', q: 'حرکت؟', opts: [{ t: 'قرض گرفتنِ یک شتر', ok: true }, { t: 'تقسیمِ مستقیم', ok: false }] }], dead: [], drills: [], lessons: [], src: [] };
      APP.S.put({ id: 'eprob_pb_k_sv', type: 'eprob', status: 'approved', by: 'ai', personal: true, origin: P.origin, p: P });
      APP.S.put({ id: 'eprog_pb_k_sv', type: 'eprog', lv: {}, solve: { aside: { lv: 1, i: 0, sid: 'n1', at: new Date().toISOString(), due: APP.today(), gain: 'g' } } });
      const it = APP.dueList().filter(x => /تقسیمِ شترها/.test(x.txt)); if (it[0]) it[0].go(); return it.length;
    });
    await p.waitForTimeout(80);
    await p.selectOption('#svBackF', 'بله — راه باز شد'); await p.click('main .sv-backgo'); await p.waitForTimeout(60);
    chk(info.own === 1 && await p.evaluate(() => APP.S.get('kc_sv').intake.stmts.includes('s_later')), 's_later evidence not written to the knot case');

    /* ===== ت۱ + ت۱۴ + ت۸ در «افزودنِ مسئلهٔ تو» ===== */
    await p.evaluate(() => APP.go('e_prob', null, 'inject')); await p.waitForTimeout(100);
    chk(await p.locator('main .sv-inj[data-own]').count() === 1, 'inject understanding card missing');
    await ownCheck('main .sv-inj', 'inject card'); await noPolya('inject');
    await p.selectOption('#svInType', 'prove'); await p.waitForTimeout(60);
    info.inj = await p.evaluate(() => ({ ans: document.querySelector('label[for="pbIn_answer"]').textContent, u: document.querySelector('label[for="svInU"]').textContent }));
    chk(/برهان/.test(info.inj.ans) && /حکم/.test(info.inj.u), 'inject type switch ' + JSON.stringify(info.inj));
    await p.fill('#pbIn_title', 'مجموعِ زاویه‌های مثلث'); await p.fill('#pbIn_statement', 'ثابت کن مجموعِ زاویه‌های هر مثلث ۱۸۰ درجه است');
    await p.fill('#pbIn_answer', 'از یک رأس خطی موازیِ ضلعِ روبه‌رو بکش.\nزاویه‌های متبادل برابرند.\nپس مجموع یک زاویهٔ نیم‌صفحه است');
    await p.fill('#svInU', 'مجموعِ زاویه‌ها ۱۸۰ است'); await p.fill('#svInD', 'یک مثلثِ دلخواه در صفحه'); await p.fill('#svInC', 'هندسهٔ اقلیدسی (اصلِ توازی)');
    chk(await p.locator('main .sv-inj .sv-chkopen').count() === 1, 'no step-check under own solution');
    await p.click('main .sv-inj .sv-chkopen'); await p.waitForTimeout(60);
    chk(await p.locator('main .sv-inj .sv-row').count() === 3, 'own-solution steps not split');
    await p.click('main .pb-formmanual'); await p.waitForTimeout(100);
    info.injRec = await p.evaluate(() => { const r = APP.S.all('eprob', x => x.p && x.p.title === 'مجموعِ زاویه‌های مثلث')[0]; const pg = r && APP.S.get('eprog_' + r.p.id); return { kind: r && r.p.kind, u0: pg && pg.solve && pg.solve.u[0], type: pg && pg.solve && pg.solve.type }; });
    chk(info.injRec.kind === 'prove' && info.injRec.type === 'prove' && info.injRec.u0 && /۱۸۰/.test(info.injRec.u0.u) && info.injRec.u0.from === 'inject', 'inject understanding not stored ' + JSON.stringify(info.injRec));
    // هوش مصنوعی هیچ‌کدام از این‌ها را نمی‌بیند (نه در درخواستِ تجزیه، نه در بازبینی)
    chk(!/مجموعِ زاویه‌ها ۱۸۰ است|اصلِ توازی/.test(await p.evaluate(() => (window.EPI_BT || {}).PROB_SYS || '')), 'learner understanding leaked into AI prompt');
    // پس از تأیید، کارتِ گامِ ۱ با همان نوشتهٔ تو پر می‌شود (برای مقایسه)
    await p.evaluate(() => { const r = APP.S.all('eprob', x => x.p && x.p.title === 'مجموعِ زاویه‌های مثلث')[0]; r.status = 'approved'; APP.S.put(r); APP.simState = { pid: r.p.id, lv: 1, order: 'hist', i: 0 }; APP.go('e_prob', r.p.id, 'sim'); });
    await p.waitForTimeout(80);
    info.pref = await p.evaluate(() => ({ t: document.getElementById('svType1').value, u: document.getElementById('svU1').value, lab: document.querySelector('label[for="svU1"]').textContent }));
    chk(info.pref.t === 'prove' && /۱۸۰/.test(info.pref.u) && /حکم/.test(info.pref.lab), 'sim card not prefilled from inject ' + JSON.stringify(info.pref));

    /* ===== گوشی: بی سرریزِ افقی ===== */
    await p.setViewportSize({ width: 390, height: 844 }); await open(1, 0); await p.waitForTimeout(80);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    chk(ov <= 1, 'horizontal overflow on phone ' + ov);
  } catch (e) { errors.push('exception: ' + (e && e.stack || e)); }
  console.log(JSON.stringify(info, null, 1).slice(0, 4000));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close();
  if (errors.length) process.exitCode = 1;
})();
