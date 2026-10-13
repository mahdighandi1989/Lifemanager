// «مسئله‌ها را من می‌دهم» (مالک، ۲۰۲۶-۱۰-۱۳) — روی نسخهٔ مستقلِ ساخته‌شده (dist/learning-architecture.html)
// ۱) نمونه‌های آمادهٔ سازنده پیش‌فرض پنهان‌اند (۱۳ مسئله، حرکت‌ها، سازنده‌های کد) و با تنظیمات برمی‌گردند
// ۲) تزریقِ بی‌منبع + وارسیِ پاسخ‌ها با سه حلِ مستقل: پرچم ⇒ تأیید بسته؛ قلمِ تغییرکرده ⇒ وارسیِ دوباره
// ۳) «حرکت‌ها» از مسئلهٔ تأییدشدهٔ خودِ مالک پر می‌شود
// ۴) «مسئله‌های هم‌ساختار»: ساخت، ردِ «همان مسئله» و نشت، سه حلِ مستقل (وارسی‌نشده پنهان)، تمرین و موعد در «امروز»
// ۵) نمونه‌های ورزشِ گره از روی مسئلهٔ خودِ مالک (دانه در درخواست) و ردِ کپیِ مسئلهٔ اصلی
// ۶) «🧪 شبیه‌سازِ همین مسئله» از موقعیتِ گره‌گشا: فقط پس از دیدنِ پاسخ؛ بی بازبینِ تاریخی؛ با وارسیِ پاسخ‌ها؛ پیوندِ دوطرفه
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(300);
  const chk = (cond, msg) => { if (!cond) errors.push(msg); };
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await p.waitForTimeout(120); };
  const sendGate = async () => { await p.waitForSelector('.kn-ai button:has-text("بفرست")'); await p.click('.kn-ai button:has-text("بفرست")'); };
  await p.evaluate(() => { const st = APP.S.settings(); st.ai = { provider: 'gemini', model: 'm', key: 'test-key' }; APP.S.saveSettings(st); });

  // ---------- ۱) پیش‌فرض: هیچ مسئلهٔ آماده‌ای دیده نمی‌شود ----------
  await go('e_prob');
  info.d = { empty: await p.locator('main .pb-empty').count(), samples: await p.locator('main .pb-sample').count(), note: await p.locator('main .samples-note').count(), probs: await p.evaluate(() => APP.probs().length), getSample: await p.evaluate(() => !!APP.getProb('pb_flt')) };
  chk(info.d.empty === 1 && info.d.samples === 0 && info.d.note === 1 && info.d.probs === 0 && info.d.getSample, 'default problem list ' + JSON.stringify(info.d));
  await go('moves');
  chk(await p.locator('main .mv-empty').count() === 1, 'moves empty state by default');
  chk(await p.evaluate(() => APP.moveStages('mv_represent').length) === 0, 'moves must not come from sample problems by default');
  await go('settings');
  chk(await p.locator('#showSamples').count() === 1 && !(await p.locator('#showSamples').isChecked()), 'samples toggle present and off');
  await p.check('#showSamples'); await go('e_prob');
  info.on = { samples: await p.locator('main .pb-sample').count(), stages: await p.evaluate(() => APP.moveStages('mv_represent').length) };
  chk(info.on.samples === 13 && info.on.stages > 0, 'samples back with toggle ' + JSON.stringify(info.on));
  await go('settings'); await p.uncheck('#showSamples');
  chk(await p.evaluate(() => APP.probs().length) === 0, 'samples hidden again');

  // ---------- ۲) تزریقِ بی‌منبع + وارسیِ پاسخ‌ها ----------
  await p.evaluate(() => {
    window.__ai = []; window.__wrongOn = 'n2';
    const decomp = { title: 'مسئلهٔ خودم: تقسیمِ ارث', field: 'ریاضی', open: '', statement: 'سه برادر ۱۷ شتر را باید به نسبت‌های ۱/۲، ۱/۳ و ۱/۹ قسمت کنند.', why_hard: 'w', answer: 'با قرض گرفتنِ یک شتر: ۹، ۶ و ۲', src: [],
      stages: [{ id: 'n1', ctx: 'هفده بخش‌پذیر نیست', q: 'حرکتِ بعدی؟', opts: [{ t: 'یک شتر قرض بگیر', ok: true, why: 'w' }, { t: 'شتر را نصف کن', ok: false, why: 'w' }, { t: 'بی‌خیال', ok: false, why: 'w' }], move: 'قرض', idea: 'i', lvl: 2, mv: ['mv_represent'] },
        { id: 'n2', ctx: 'هجده شتر', q: 'سهم‌ها؟', opts: [{ t: '۹، ۶، ۲', ok: true, why: 'w' }, { t: '۸، ۶، ۳', ok: false, why: 'w' }], move: 'تقسیم', idea: 'i', lvl: 1, mv: ['mv_compute'] }],
      dead: [], lessons: ['جمعِ کسرها یک نیست'], drills: [{ lvl: 1, q: 'جمعِ ۱/۲ و ۱/۳ و ۱/۹؟', opts: ['۱', '۱۷/۱۸'], a: 1, why: 'w' }] };
    window.__answerCheck = (user, si) => { const r = APP.S.all('eprob', x => x.status === 'pending').slice(-1)[0]; const items = APP.probCheckItems(r.p);
      return JSON.stringify(user.split(/\n(?=\[)/).map(b => { const m = /^\[([^\]]+)\]/.exec(b); if (!m) return null; const it = items.find(x => x.id === m[1]);
        let want = it ? it.opts[it.ok] : null; if (m[1] === window.__wrongOn && si === 1) want = it.opts.find((o, i) => i !== it.ok);
        const ln = b.split('\n').find(l => /^[a-h]\) /.test(l) && l.slice(3) === want); return { id: m[1], pick: ln ? ln[0] : 'z', multi: false }; }).filter(Boolean)); };
    APP.callAI = function (sys, user) {
      window.__ai.push({ sys, user });
      if (sys.indexOf(APP.PROB_CHECK_TAIL) >= 0) { const si = window.__ai.filter(x => x.sys.indexOf(APP.PROB_CHECK_TAIL) >= 0).length - 1; return Promise.resolve(window.__answerCheck(user, si % 3)); }
      if (sys === APP.PROB_VERIFY_SYS) return Promise.resolve(JSON.stringify([{ sid: 'n1', ok: true }, { sid: 'n2', ok: true }]));
      return Promise.resolve(JSON.stringify(decomp));
    };
  });
  await go('e_prob', null, 'inject');
  chk(/اختیاری/.test(await p.locator('label[for="pbIn_src"]').textContent()), 'source label says optional');
  await p.fill('#pbIn_title', 'مسئلهٔ خودم: تقسیمِ ارث'); await p.fill('#pbIn_statement', 'صورت'); await p.fill('#pbIn_answer', 'پاسخ');
  await p.click('main .pb-ai'); await p.waitForTimeout(800);
  info.inj = await p.evaluate(() => { const r = APP.S.all('eprob', x => x.p && x.p.title === 'مسئلهٔ خودم: تقسیمِ ارث')[0]; return { calls: window.__ai.length, nosrc: r && r.nosrc, check: r && r.check && r.check.flags.map(f => f.sid + ':' + f.state).join(), res: r && r.check && r.check.res }; });
  chk(info.inj.calls === 5 && info.inj.nosrc === true && info.inj.check === 'n2:open' && info.inj.res.n1.agree === 3 && info.inj.res['drill:1'].agree === 3, 'inject + check ' + JSON.stringify(info.inj));
  chk(await p.evaluate(() => window.__ai.slice(2).every(c => !/"ok"/.test(c.user) && /\[n1\]/.test(c.user) && /\[drill:1\]/.test(c.user))), 'solvers never see the ok labels');
  await go('e_prob', null, 'pending');
  const C = () => p.locator('main section.pb-pending', { hasText: 'تقسیمِ ارث' });
  chk(await C().locator('.pb-nosrc').count() === 1, 'no-source chip');
  chk(await C().locator('.pb-check .mv-flagged[data-sid="n2"]').count() === 1, 'check flag shown on n2');
  chk(/گزینهٔ «درست»: «یک شتر قرض بگیر»/.test(await C().locator('li[data-sid="n1"] .pb-qa').textContent()), 'stage question + right option visible for review');
  chk(await C().locator('.mv-approve').isDisabled(), 'approve blocked by answer-check flag');
  await C().locator('.pb-checkaccept').click(); await p.waitForTimeout(100);
  chk(!(await C().locator('.mv-approve').isDisabled()), 'approve open after conscious accept');
  // تغییرِ متنِ گزینهٔ درستِ n1 ⇒ «تغییرکرده» ⇒ بسته؛ وارسیِ دوباره ⇒ باز
  await C().locator('details').evaluate(d => { d.open = true; });
  const ta = C().locator('textarea.mono'); const js = JSON.parse(await ta.inputValue()); js.stages[0].opts[0].t = 'یک شتر از همسایه قرض بگیر'; await ta.fill(JSON.stringify(js, null, 1));
  await C().locator('.mv-approve').click(); await p.waitForTimeout(150);
  chk(await p.evaluate(() => APP.S.all('eprob', x => x.p.title === 'مسئلهٔ خودم: تقسیمِ ارث')[0].status) === 'pending', 'edited right option cannot be approved without re-check');
  chk(await C().locator('.pb-check li[data-sid="n1"]').count() === 1, 'changed item listed');
  await p.evaluate(() => { window.__wrongOn = null; });
  await C().locator('.pb-runcheck').click(); await p.waitForTimeout(600);
  chk(await C().locator('.pb-check .mv-flagged').count() === 0, 'answer check clean after re-check');
  // همان قلم برای بازبینِ تاریخی هم «تغییرکرده» است (طرحِ قبلی، دست‌نخورده) ⇒ آگاهانه پذیرفته می‌شود
  chk(await C().locator('.pb-changed li[data-sid="n1"]').count() === 1, 'historical reviewer also sees the change');
  await C().locator('.pb-changed li[data-sid="n1"] .pb-chaccept').click(); await p.waitForTimeout(100);
  chk(!(await C().locator('.mv-approve').isDisabled()), 'approve open after successful re-check');
  await C().locator('.mv-approve').click(); await p.waitForTimeout(150);
  const pid = await p.evaluate(() => APP.S.all('eprob', x => x.p.title === 'مسئلهٔ خودم: تقسیمِ ارث')[0].p.id);
  chk(await p.evaluate(() => APP.S.all('eprob', x => x.p.title === 'مسئلهٔ خودم: تقسیمِ ارث')[0].status) === 'approved', 'approved');

  // ---------- ۳) حرکت‌ها از مسئلهٔ خودِ مالک ----------
  await go('moves');
  info.mv = { empty: await p.locator('main .mv-empty').count(), rep: await p.evaluate(() => APP.moveStages('mv_represent').map(x => x.p.title).join()) };
  chk(info.mv.empty === 0 && info.mv.rep === 'مسئلهٔ خودم: تقسیمِ ارث', 'moves from own problem ' + JSON.stringify(info.mv));

  // ---------- ۴) مسئله‌های هم‌ساختار ----------
  await p.evaluate(() => {
    window.__ai = [];
    window.__gen = [
      { form: 'numeric', decoy: false, level: 1, prompt: 'یازده گوسفند به نسبت‌های ۱/۲ و ۱/۳ و ۱/۱۲ میان سه نفر؛ سهمِ نفرِ اول چند است؟', atype: 'int', answer: '6', moves: ['mv_represent'], deep: 'جمعِ کسرها کمتر از یک است', trap: 'تقسیمِ مستقیم', explain: 'با یکی قرض: ۱۲ ⇒ ۶' },
      { form: 'verbal', decoy: false, level: 2, prompt: 'کدام راه مسئلهٔ تقسیمِ ارثیِ بی‌بخش‌پذیر را باز می‌کند؟', atype: 'choice', choices: [{ id: 'a', t: 'افزودنِ موقتِ یک واحد' }, { id: 'b', t: 'گرد کردن' }, { id: 'c', t: 'قرعه' }], answer: 'a', moves: ['mv_represent'], deep: 'd', trap: 't', explain: 'e' },
      { form: 'real', decoy: true, level: 2, prompt: 'دوازده کتاب به نسبت‌های ۱/۲ و ۱/۳ و ۱/۶ میان سه نفر؛ سهمِ نفرِ دوم؟', atype: 'int', answer: '4', moves: [], deep: 'جمعِ کسرها یک است', trap: 'قرض لازم نیست', explain: 'مستقیم' },
      { form: 'numeric', decoy: false, level: 1, prompt: 'سه برادر ۱۷ شتر را باید به نسبت‌های ۱/۲، ۱/۳ و ۱/۹ قسمت کنند.', atype: 'int', answer: '9', moves: [] },
      { form: 'numeric', decoy: false, level: 1, prompt: 'اگر پاسخ ۷ باشد، هفت چند است؟', atype: 'int', answer: '7', moves: [] },
      { form: 'abstract', decoy: false, level: 3, prompt: 'مسئلهٔ دوپهلو دربارهٔ نسبت‌ها با دو پاسخ ممکن', atype: 'int', answer: '5', moves: [] }];
    APP.callAI = function (sys, user) {
      window.__ai.push({ sys, user });
      if (sys === APP.PB_SIM_SYS) return Promise.resolve(JSON.stringify({ items: window.__gen }));
      const it = window.__gen.find(g => user.indexOf(g.prompt) >= 0); const si = APP.KSOLVERS.findIndex(x => sys.indexOf(x) === 0);
      if (!it) return Promise.resolve('{}');
      const ans = /دوپهلو/.test(it.prompt) && si === 1 ? '6' : it.answer;
      return Promise.resolve(JSON.stringify({ answer: ans, multi: false, deep: !it.decoy, why: 'w' }));
    };
  });
  await go('e_prob', pid, 'similar');
  chk(await p.locator('main .pbs-make').count() === 1, 'similar tab has the make button');
  await p.click('main .pbs-make'); await sendGate(); await p.waitForTimeout(1200);
  info.sim = await p.evaluate(pid => { const all = APP.pbItemsOf(pid); return { n: all.length, ok: all.filter(x => x.ver && x.ver.ok).length, serv: all.filter(APP.pbServable).length, rej: (APP._pbLastRep || {}).rejected.map(x => x.why.slice(0, 12)) }; }, pid);
  chk(info.sim.n === 4 && info.sim.ok === 3 && info.sim.serv === 3 && info.sim.rej.length === 2, 'similar items ' + JSON.stringify(info.sim));
  chk(await p.evaluate(() => window.__ai[0].sys === APP.PB_SIM_SYS && /حرکت‌های قاطعِ حل/.test(window.__ai[0].user) && /تقسیمِ ارث/.test(window.__ai[0].user)), 'generator sees the own problem and its moves');
  await go('e_prob', pid, 'similar');
  await p.click('main .pbs-start'); await p.waitForTimeout(100);
  let answered = 0;
  for (let i = 0; i < 3; i++) {
    const it = await p.evaluate(pid => { const all = APP.pbItemsOf(pid).filter(APP.pbServable); const txt = document.querySelector('main .pbs-prompt').textContent; return all.find(x => txt.indexOf(x.prompt) >= 0); }, pid);
    if (!it) { errors.push('practice item not found'); break; }
    if (it.atype === 'choice') await p.click(`main .pbs-ans button:has-text("${it.choices.find(c => c.id === it.answer).t}")`);
    else { await p.fill('#pbsAns', it.answer); await p.click('main .pbs-ans button'); }
    await p.waitForTimeout(80);
    chk(/درست\./.test(await p.locator('main .pbs-fb').textContent()), 'right answer recognised');
    answered++; await p.click('main .pbs-next'); await p.waitForTimeout(80);
  }
  info.after = await p.evaluate(pid => APP.pbItemsOf(pid).filter(APP.pbServable).map(x => x.iv + '@' + x.due + ':' + x.hist.length), pid);
  chk(answered === 3 && info.after.every(x => /^1@/.test(x) && /:1$/.test(x)), 'spacing after first right answers ' + JSON.stringify(info.after));
  await p.evaluate(() => { APP.S.all('pbitem').forEach(x => { x.due = APP.today(); APP.S.put(x); }); });
  chk(await p.evaluate(() => APP.dueList().filter(x => /مسئلهٔ هم‌ساختار موعد/.test(x.txt)).length) === 1, 'similar dues in Today');

  // ---------- ۵) ورزشِ گره: دانه = مسئلهٔ خودِ مالک ----------
  await p.evaluate(() => {
    APP.S.put({ id: 'knot_s1', type: 'knot', name: 'قرض‌نگرفتن', fam: 'F3', principle: 'وقتی تقسیم جور درنمی‌آید، فقط مستقیم تقسیم می‌کنم', signals: 's', counter: 'c', example: 'e', cases: ['kc_s1'], status: 'open' });
    APP.S.put({ id: 'kc_s1', type: 'kcase', title: 'گیر در هفده شتر', kinds: ['problem'], knots: ['knot_s1'], intake: { stmts: [], statement: 'هفده شتر میان سه برادر به نسبت‌های نیم، یک‌سوم و یک‌نهم تقسیم شود', answer: '۹ و ۶ و ۲', stuckAt: 'هفده بخش‌پذیر نیست', what: 'w', thoughts: 't', seen: 'yes' }, premise: {}, rank: {}, ev: [], pans: {}, ladder: {}, root: { extra: [], why5: [] }, acts: [], hyps: [], status: 'open', step: 'in', created: '2026-10-10T08:00:00.000Z' });
  });
  info.ask = await p.evaluate(() => APP.kAsk(APP.S.get('knot_s1')));
  chk(/هفده شتر میان سه برادر/.test(info.ask) && /هفده بخش‌پذیر نیست/.test(info.ask) && /مسئلهٔ اصلیِ ۱/.test(info.ask), 'knot AI request carries the own problem');
  chk(await p.evaluate(() => APP.KGEN_SYS.indexOf('کوزه‌های آب') >= 0 && /دانه است/.test(APP.KGEN_SYS)), 'generator told the own problem is the seed (no textbook swaps)');
  await p.evaluate(() => {
    window.__ai = [];
    APP.callAI = function (sys, user) {
      window.__ai.push({ sys, user });
      if (sys === APP.KGEN_SYS) return Promise.resolve(JSON.stringify({ items: [
        { form: 'numeric', level: 1, prompt: 'هفده شتر میان سه برادر به نسبت‌های نیم، یک‌سوم و یک‌نهم تقسیم شود؛ سهمِ اولی؟', atype: 'int', answer: '9' },
        { form: 'verbal', level: 2, prompt: 'هفت سکه را باید به نسبت‌های نیم، یک‌چهارم و یک‌هشتم قسمت کرد؛ سهمِ دومی چند است؟', atype: 'int', answer: '2' }] }));
      return Promise.resolve(JSON.stringify({ answer: '2', multi: false, deep: true, why: 'w' }));
    };
  });
  info.km = await p.evaluate(() => APP.kmakeAI(APP.S.get('knot_s1'), {}).then(r => ({ acc: r.accepted.length, rej: r.rejected.map(x => x.why) })));
  chk(info.km.acc === 1 && info.km.rej.length === 1 && /همان مسئلهٔ اصلی/.test(info.km.rej[0]), 'near-copy of the own problem rejected ' + JSON.stringify(info.km));
  await go('kpractice', 'knot_s1', 'items');
  chk(await p.locator('main [data-gen]').count() === 0, 'no textbook generators by default');
  chk(/دانه: ۱ موقعیتِ خودت/.test(await p.locator('main').textContent()), 'seed line shown');

  // ---------- ۶) «🧪 شبیه‌سازِ همین مسئله» از گره‌گشا ----------
  await p.evaluate(() => { const kc = APP.S.get('kc_s1'); kc.intake.seen = 'no'; APP.S.put(kc); });
  await go('kcase', 'kc_s1', 'in');
  chk(await p.locator('main .pb-casebox').count() === 1 && await p.locator('main .pb-fromcase').count() === 0, 'before seeing the answer: box without build button');
  await p.evaluate(() => {
    const kc = APP.S.get('kc_s1'); kc.intake.seen = 'yes'; APP.S.put(kc);
    window.__ai = []; window.__wrongOn = null;
    const pers = { title: 'هفده شتر', field: 'ریاضی', statement: 'هفده شتر…', why_hard: 'بخش‌پذیر نیست', answer: '۹، ۶، ۲', era: { known: 'x' }, src: ['s'],
      stages: [{ id: 'n1', year: 1900, who: 'کسی', ctx: 'ج', q: 'حرکت؟', opts: [{ t: 'قرض', ok: true }, { t: 'نصف', ok: false }], move: 'm', idea: 'i', lvl: 1, mv: ['mv_represent'] }], dead: [], lessons: [], drills: [] };
    APP.callAI = function (sys, user) {
      window.__ai.push({ sys, user });
      if (sys.indexOf(APP.PROB_CHECK_TAIL) >= 0) return Promise.resolve(window.__answerCheck(user, 0));
      return Promise.resolve(JSON.stringify(pers));
    };
  });
  await go('kcase', 'kc_s1', 'in');
  await p.click('main .pb-fromcase'); await sendGate(); await p.waitForTimeout(800);
  info.pers = await p.evaluate(() => { const r = APP.S.all('eprob', x => x.origin && x.origin.id === 'kc_s1')[0]; return r && { personal: r.personal, st: r.status, era: !!r.p.era, year: r.p.stages[0].year, who: r.p.stages[0].who, src: r.p.src.length, calls: window.__ai.map(c => c.sys === APP.PROB_VERIFY_SYS ? 'V' : c.sys.indexOf(APP.PROB_CHECK_TAIL) >= 0 ? 'C' : 'G').join(''), flags: r.check.flags.length, user0: /هفده شتر میان سه برادر/.test(window.__ai[0].user) && /پاسخِ درست/.test(window.__ai[0].user) }; });
  chk(info.pers && info.pers.personal && info.pers.st === 'pending' && !info.pers.era && info.pers.year === '' && info.pers.who === '' && info.pers.src === 0 && info.pers.calls === 'GCCC' && info.pers.flags === 0 && info.pers.user0, 'own-problem simulator ' + JSON.stringify(info.pers));
  chk(await p.evaluate(() => APP.state.view === 'e_prob' && APP.state.sub === 'pending'), 'lands in pending');
  const P2 = p.locator('main section.pb-pending', { hasText: 'شبیه‌سازِ مسئلهٔ خودت' });
  chk(await P2.count() === 1 && await P2.locator('.mv-rever').count() === 0, 'personal pending card, no historical re-review');
  await P2.locator('.mv-approve').click(); await p.waitForTimeout(150);
  const ppid = await p.evaluate(() => APP.S.all('eprob', x => x.origin && x.origin.id === 'kc_s1')[0].p.id);
  await go('e_prob');
  chk(await p.locator('main .pb-own').count() === 1, 'listed with «از گره‌گشا» chip');
  await go('e_prob', ppid, 'about');
  chk(await p.locator('main .pb-tocase').count() === 1 && await p.locator('main .tabs button:has-text("دوره و زمانه")').count() === 0, 'back-link to the case, no era tab');
  await go('kcase', 'kc_s1', 'in');
  chk(await p.locator('main .pb-casebox button:has-text("باز کردنِ شبیه‌ساز")').count() === 1, 'case box links to the approved simulator');

  // موبایل: بی‌سرریزِ افقی در صفحه‌های تازه
  await p.setViewportSize({ width: 390, height: 800 });
  for (const [v, a, s] of [['e_prob', null, null], ['e_prob', pid, 'similar'], ['e_prob', null, 'pending'], ['settings', null, null]]) {
    await go(v, a, s);
    const ov = await p.evaluate(() => document.querySelector('main').scrollWidth - document.querySelector('main').clientWidth);
    chk(ov <= 2, 'overflow ' + v + ' ' + (s || '') + ': ' + ov);
  }
  console.log(JSON.stringify(info, null, 1).slice(0, 1500));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
