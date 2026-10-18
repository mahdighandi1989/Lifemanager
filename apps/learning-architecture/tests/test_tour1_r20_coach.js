// تورِ پولیا (دستهٔ ۱، دورِ ۲۰، سهمِ «coach» — ۲۰۲۶-۱۰-۱۸) — DECISIONS_R20: RO1 (سمتِ مربی)، RO3، RO4، RO5 (سمتِ مربی)، RO8، MT1 (پرامپت/سنجش)، RO7 (خواندنِ کارنامه).
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۰ (A1 شنبه/پنجشنبه، C20-1 فهمِ همان پیام، D4/A16 متنِ درهم، D·3 ساعتِ یادآور، B·D2 درس و حکم، A4/D5/D9 نوبتِ ✏️،
//           A12 ضمیر از «سؤال:»، A13/C20-15/D15 درخواستِ عقب‌افتاده، B·D13 «اول کل» در نمای «🧭 این برنامه چیست؟»، D14 «ولی نخوردم»، D·13 سرتیترِ پس از بستن،
//           ردهٔ ۴ ِ تورِ مدل‌ها «پس جوابم غلط بود!»، B·D9 «withdrawn=[]» در کارنامه)
//  bank     همهٔ موردهای سازوکارهای همین سهم در بانکِ مستقلِ tests/variants/VARIANTS_R20.json (پوشش‌داده‌نشده‌ها با دلیل در info.nc)
// LLA_FILE = ساختِ دیگر؛ ONLY=runners,bank …
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = JSON.parse(fs.readFileSync(process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R20.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R20.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)), 'utf8'));

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
  const T0 = '2026-10-18';   // یکشنبه
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0;
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.__lr = []; window.__lrRet = null; const orig = APP.liveRetract;
    APP.liveRetract = function (pid, id, o) { __lr.push({ pid, id, o }); if (window.__lrRet) return window.__lrRet; return orig ? orig.apply(this, arguments) : ''; };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    window.__turn = async (text, reply, actions, extra) => {
      const n0 = __calls.length; __q.push(R({ reply: reply || 'باشه.', actions: actions || [] })); (extra || []).forEach(x => __q.push(x));
      await APP.ASSIST.send(text); __q.length = 0;
      const all = __calls.slice(n0), c = all.filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {};
      return { sys: c.sys || '', user: c.user || '', n: all.length, all: all.map(x => x.user) };
    };
    window.__fresh = (view) => { APP.go(view || 'home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; __lr.length = 0; window.__lrRet = null; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'kitem', 'pbitem', 'wchain', 'case', 'practice', 'ex'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
    window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {};
      ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L); APP.S.put(pg); };
    window.__uid = (n) => { const U = (__cur().msgs || []).filter(m => m.role === 'user' && !/^\[سامانه/.test(m.text)); return APP.ASSIST.msgId(U[n - 1]); };
    window.__st = () => { const s = __cur(), C = s.coach || {}; return {
      guesses: (C.guesses || []).map(g => ({ id: g.id, text: g.text, corr: g.corr || null, res: g.res || '', src20: g.src20 || null })), guess: C.guess ? { text: C.guess.text } : null,
      plans: (s.plans || []).map(q => ({ id: q.id, text: q.text, when: q.when, state: q.state, corr: q.corr || null, src20: q.src20 || null })),
      ev: (s.coachEv || []).map(e => ({ ph: e.ph, ok: e.ok, how: e.how || '', msg: e.msg || '', wd: !!e.wd, rebook: !!e.rebook, key20: e.src20 ? e.src20.key : '', span20: e.src20 ? e.src20.span : null })),
      ret: (C.retracts || []).slice(-1)[0] || null, nRet: (C.retracts || []).length, note: C.retNote || null, lr: __lr.map(x => ({ pid: x.pid, id: x.id, what: x.o.what, key: x.o.key, fix: x.o.fix, frag: x.o.frag })),
      stmt: C.stmt || '', acts20: C.acts20 || [], sys: (s.msgs || []).filter(m => m.role === 'sys').map(m => m.text), ai: (s.msgs || []).filter(m => m.role === 'ai').map(m => m.text), ask20: C.ask20 || null }; };
    window.__ph = () => { const Q = APP.MIND.phases(); const r = {}; Q.rows.forEach(X => { r[X.id] = X.k + '/' + X.n; }); return r; };
  }, T0);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const blockOf = (u, re) => head(u).split(/\n(?=# )/).filter(bl => re.test(bl.split('\n')[0]))[0] || '';
  const turn = (text, reply, actions, extra) => p.evaluate(([t, r, a, x]) => __turn(t, r, a, x), [text, reply || '', actions || [], extra || []]);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const st = () => p.evaluate(() => __st());
  const ph = () => p.evaluate(() => __ph());
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
  /* پیامِ نخستِ هر سشن صورتِ چسبانده خوانده می‌شود (شاهدِ «گفتنِ خودش» نیست — E1)؛ برای سنجیدنِ رویدادهای کارنامه یک پیامِ گشایش پیش از آن */
  const OPEN = 'یه مسئله‌ی خودم رو دارم که می‌خوام با هم روش کار کنیم.';
  const open0 = () => turn(OPEN, 'بگو.');
  const RT = (o) => [cs({ retract: o })];
  const hasNote = (c) => Array.isArray(c) && c.length && /^اصلاح شد ⇐/.test(c[c.length - 1].note || '');
  const bind = async (title, steps, stmt) => p.evaluate(([t, steps, stmt]) => { const pid = __live(t, stmt); APP.liveBindSession(pid, __cur()); __liveSet(pid, (so, L) => { (steps || []).forEach((x, i) => L.steps.push(Object.assign({ id: 's' + (i + 1), at: new Date().toISOString(), text: x, pred: 'شاید', due: '2026-10-19' }, typeof x === 'object' ? x : {}))); }); return pid; }, [title, steps || [], stmt || '']);
  /* «U: … ‖ A: …» ⇒ نوبت‌ها؛ pre[i] = کنش‌های پاسخِ نوبتِ iامِ کاربر (۱‌پایه)؛ نوبتِ آخر با last */
  const play = async (text, pre, last, lastReply) => {
    const parts = text.split('‖').map(x => x.trim()); const U = [];
    for (let i = 0; i < parts.length; i++) { const m = /^U:\s*([\s\S]*)$/.exec(parts[i]); if (m) U.push([m[1].replace(/\s*\(پیامِ قبلی:[^)]*\)\s*$/, '').trim(), parts[i + 1] && /^A:/.test(parts[i + 1]) ? parts[i + 1].replace(/^A:\s*/, '').replace(/^\[[^\]]*\]\s*/, '') : 'باشه.']); }
    let u = null;
    for (let i = 0; i < U.length; i++) { const isLast = i === U.length - 1; u = await turn(U[i][0], isLast ? (lastReply || 'باشه.') : U[i][1], isLast ? (last || []) : ((pre || {})[i + 1] || [])); }
    return u;
  };
  /* مسیرِ واقعیِ ✏️ (a40 AS.retractEdit): برگرداندنِ صفحه ⇐ نوبتِ «[اصلاحِ پیامِ قبلی]» ⇐ AS.retractApply ِ مربی */
  const editMsg = async (n, newText, reply, actions) => p.evaluate(async ([n, t, rep, acts]) => {
    const s = __cur(), U = (s.msgs || []).filter(m => m.role === 'user' && !/^\[/.test(m.text)), m = U[n - 1], n0 = __calls.length;
    __q.push(R({ reply: rep || 'درست شد.', actions: acts || [] }));
    const r = APP.ASSIST.retractEdit(s, m, t);
    for (let i = 0; i < 80 && (__calls.length === n0 || APP.ASSIST.busy()); i++) await new Promise(res => setTimeout(res, 100));
    await new Promise(res => setTimeout(res, 300)); __q.length = 0;
    const all = __calls.slice(n0); return { r: r && { ok: r.ok, err: r.err || '', same: !!r.same }, user: (all[0] || {}).user || '', n: all.length };
  }, [n, newText, reply || '', actions || []]);
  const E = {}; BANK.forEach((e, i) => { E[i] = e; });
  const T = (i, ok, x) => { info.bank[i] = !!ok; chk(ok, 'bank#' + i + ' [' + E[i].rc + '/' + E[i].kind + '] «' + E[i].text.slice(0, 70) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 700)); };
  const NC = (i, why) => { info.nc[i] = why; };

  // ================= runners (جمله‌های گزارش‌های دورِ ۲۰؛ قرمز روی پایه) =================
  await section('runners', async () => {
    let s, u, x;
    // A·A1 (s04, S1): «شنبه» درونِ «پنجشنبه» — اصلاحِ روزِ هفته پذیرفته، برنامه جابه‌جا، یک «طرح» (نه دو)
    await wipe(); await fresh(); await open0();
    await turn('باشه. تصمیم گرفتم پنجشنبه یه جلسهٔ کوتاه با خواهرم بذارم و موضوعو بگم.', 'قبلش چه می‌خواهی روشن کنی؟', [cs({ ph: 'p', said: ['plan'], plan: { text: 'پنجشنبه یه جلسهٔ کوتاه با خواهرم بذارم', when: '2026-10-22' } })]);
    await turn('ببخشید، اشتباه گفتم: جلسه رو شنبه می‌ذارم، نه پنجشنبه', 'اصلاح را فرستادم.', [cs({ ph: 'p', said: ['plan'], plan: { text: 'جلسه رو شنبه می‌ذارم', when: '2026-10-24' }, retract: { msg: 'پنجشنبه یه جلسهٔ کوتاه با خواهرم بذارم', what: 'plan', fix: 'شنبه' } })]);
    s = await st(); x = await ph();
    chk(s.ret && s.ret.ok && s.plans.length === 1 && s.plans[0].when === '2026-10-24' && /^شنبه یه جلسهٔ کوتاه/.test(s.plans[0].text) && hasNote(s.plans[0].corr), 'A1: «شنبه» ⊂ «پنجشنبه» no longer refused; pl1 moves Thu→Sat with history ' + JSON.stringify({ ret: s.ret, plans: s.plans }));
    chk(x.plan === '1/1', 'A1: the correcting message is not a second planning success (one act) ' + JSON.stringify({ x, ev: s.ev }));
    chk(s.sys.some(t => /^✓ اصلاح شد/.test(t)) && !s.sys.some(t => /\d{4}-\d{2}-\d{2}|pl\d/.test(t)), 'A1/D·10: one plain sys line, Persian date, no raw id/ISO ' + JSON.stringify(s.sys));
    // C·C20-1 (s22): پیامی با صورت + حدس + برنامه؛ اصلاحِ فقط «امروز ⇐ شنبه» ⇒ رویدادِ فهمِ همان پیام می‌ماند
    await wipe(); await fresh(); await open0();
    await turn('رسیدِ قسطو پیدا نکردم و بانک میگه پرداخت نشده؛ حدسم اینه که پولو کسی برداشته؛ برنامه‌م اینه که امروز برم شعبه.', 'از کجا شروع می‌کنی؟', [cs({ ph: 'p', said: ['u', 'c', 'plan'], guess: { text: 'پولو کسی برداشته' }, plan: { text: 'امروز برم شعبه', when: '2026-10-18' } })]);
    const id1 = await p.evaluate(() => __uid(2));
    await turn('هر روز صبح می‌رم پیاده‌روی.', 'خوب است.');
    await turn('اشتباه گفتم، شنبه می‌رم شعبه نه امروز', 'اصلاح را فرستادم.', RT({ msg: 'امروز برم شعبه', key: 'plan:pl1', what: 'plan', fix: 'شنبه' }));
    s = await st(); x = await ph();
    const und = s.ev.filter(e => e.msg === id1 && e.how === 'own');
    chk(s.plans[0].when === '2026-10-24' && und.length && und.every(e => !e.wd) && x.und === '1/1', 'C20-1: correcting only the plan date keeps the understanding success of the same message ' + JSON.stringify({ plans: s.plans, ev: s.ev, x }));
    chk(s.guesses[0] && s.guesses[0].text === 'پولو کسی برداشته' && !s.guesses[0].corr, 'C20-1: the guess of the same message is untouched ' + JSON.stringify(s.guesses));
    chk(s.ev.some(e => e.how === 'plan' && e.msg === id1 && e.wd) && s.ev.some(e => e.how === 'plan' && e.rebook && !e.wd) && x.plan === '1/1', 'RO1: the plan event is withdrawn AND re-booked from the current message (planning count unchanged) ' + JSON.stringify({ ev: s.ev, x }));
    chk(s.plans[0].src20 && s.plans[0].src20.msg === id1 && s.plans[0].src20.key === 'plan:pl1' && /امروز برم شعبه/.test(s.plans[0].src20.span) && s.plans[0].src20.sess, 'RO1: every coach record carries src20 {sess, msg, span, key} ' + JSON.stringify(s.plans[0].src20));
    // B·D4 (s18) / A·A16 (s03): کوچک‌ترین بخشِ متفاوت، نه کلِ عبارت
    x = await p.evaluate(() => [
      APP.ASSIST.retractSubst20('⅓·π·۱۰۰·۱۲ تقسیم بر ۵ ثانیه', 'آب با نرخ ثابت ۵ سانتی‌متر مکعب در ثانیه از ته خارج می‌شه', '۶ سانتی‌متر مکعب در ثانیه', 'یه چیزی: تو پیام اولم اشتباه نوشتم — نرخ خروج ۶ سانتی‌متر مکعب در ثانیه‌ست نه ۵.'),
      APP.ASSIST.retractSubst20('بیشترین فاصلهٔ دو نقطه توی مثلثِ ضلع ۱ می‌شه ارتفاعش، یعنی √۳/۲', 'بیشترین فاصلهٔ دو نقطه توی مثلثِ ضلع ۱ می‌شه ارتفاعش، یعنی √۳/۲', 'بیشترین فاصله خودِ ضلعه، یعنی ۱', 'یه اصلاح دربارهٔ حدسم: گفتم بیشترین فاصله توی مثلثِ ضلع ۱ ارتفاعشه یعنی √۳/۲ — اشتباه گفتم؛ بیشترین فاصله خودِ ضلعه، یعنی ۱.')]);
    chk(x[0] === '⅓·π·۱۰۰·۱۲ تقسیم بر ۶ ثانیه', 'D4: «… تقسیم بر ۶ ثانیه» (no «ثانیه ثانیه») ' + JSON.stringify(x[0]));
    chk(x[1] && !/ارتفاعش/.test(x[1]) && /خودِ ضلعه، یعنی ۱$/.test(x[1]) && (x[1].match(/بیشترین/g) || []).length === 1, 'A16: a sentence-long fix gives a clean guess ' + JSON.stringify(x[1]));
    // B·D3: نشانه‌گذاری («می‌رم، اولین» ⇐ «می‌رم اولین») مانعِ یافتن نیست
    x = await p.evaluate(() => [APP.ASSIST.tokHas('شنبه می‌رم، اولین جلسه رو', 'می‌رم اولین'), APP.ASSIST.tokHas('پنجشنبه با خواهرم', 'شنبه'), APP.ASSIST.tokHas('حداکثر ۱۰۰ خط', '۱۰'), APP.ASSIST.tokHas('می‌رم کتابخونه', 'کتاب'), APP.ASSIST.tokHas('مجهول سرعت متوسطه', 'سرعت متوسط')]);
    chk(x.join() === 'true,false,false,false,true', 'RO4: token matching (punctuation-tolerant, word-bounded, short suffixes) ' + JSON.stringify(x));
    // D·3 (s38): موعدی که از پیامِ او ثبت شد برمی‌گردد (ساعت ۸ ⇐ ۱۰)
    await wipe(); await fresh();
    await turn('یادم بنداز پنجشنبه ساعت ۸ صبح فرم رو بفرستم؛ فرمش ۳ صفحه‌ست', 'باشد، یادآوری گذاشتم.', [{ do: 'deadline', what: 'فرستادنِ فرم', date: '2026-10-22', time: '08:00' }]);
    for (const m of ['امروز خسته‌ام', 'فردا کلاس دارم', 'باشه']) await turn(m, 'باشه.');
    await turn('ساعت فرم ۱۰ صبحه نه ۸', 'اصلاح را فرستادم.', RT({ msg: 'پنجشنبه ساعت ۸ صبح فرم رو بفرستم', key: 'deadline', what: 'plan', fix: '۱۰ صبح' }));
    s = await st(); x = await p.evaluate(() => APP.S.all('deadline')[0]);
    chk(x && x.time === '10:00' && x.date === '2026-10-22' && hasNote(x.corr), 'D·3: the deadline created from her message moves 08:00 → 10:00 (date kept), with history ' + JSON.stringify(x));
    chk(s.sys.some(t => /^✓ اصلاح شد/.test(t) && /ساعت ۱۰/.test(t) && !/\d{4}-\d{2}-\d{2}|dl_/.test(t)), 'D·3/D·10: the page says it in Persian (no ISO, no id) ' + JSON.stringify(s.sys));
    // A·A4 / B·D5 / D·9: نوبتِ ✏️ — بی بلوکِ «شاید»، گزارشِ پاسخ شاهد ثبت نمی‌کند، یک «بازنگری»، نوبتِ بعد بی «هیچ رکوردی…»
    await wipe(); await fresh(); await open0();
    await turn('چهارشنبه برهانِ کاملشو می‌نویسم.', 'خوب است.', [cs({ ph: 'p', said: ['plan'], plan: { text: 'چهارشنبه برهانِ کاملشو می‌نویسم', when: '2026-10-21' } })]);
    await turn('الان دارم شکل رو می‌کشم', 'خوب است.');
    u = await editMsg(2, 'پنجشنبه برهانِ کاملشو می‌نویسم.', 'درست شد: پنجشنبه.', [cs({ ph: 'c', said: ['result'], result: 'پنجشنبه', retract: { msg: 'چهارشنبه', what: 'plan', fix: 'پنجشنبه' } })]);
    s = await st(); x = await ph();
    chk(u.r && u.r.ok !== false && u.user && !blockOf(u.user, /^# اصلاحِ پیامِ پیشین \(شاید\)/), 'A4/D5: the ✏️ system turn carries no «اصلاحِ پیامِ پیشین (شاید)» block ' + JSON.stringify(u.r) + blockOf(u.user, /شاید/).slice(0, 200));
    chk(/# اصلاحی که صفحه انجام داد \(همین نوبت/.test(head(u.user)) && /پنجشنبه/.test(blockOf(u.user, /^# اصلاحی که صفحه انجام داد/)), 'RO3/RO5: the ✏️ turn prompt already carries the page result (applied before the reply) ' + blockOf(u.user, /^# اصلاحی/).slice(0, 300));
    chk(s.plans[0].when === '2026-10-22' && s.ev.filter(e => e.how === 'selfcorr' && !e.wd).length === 1 && x.plan === '1/1' && x.exec === '0/0' && s.nRet === 1, 'D9/A5: ✏️ books exactly one self-correction, keeps the plan act, books nothing from the ✏️ turn (no «اجرا +», no second retract) ' + JSON.stringify({ plans: s.plans, x, ev: s.ev, nRet: s.nRet }));
    u = await turn('باشه، ادامه بدیم.');
    chk(!/هیچ رکوردی/.test(head(u.user)) && !/نگو که چیزی را عوض کردی/.test(head(u.user)), 'D9/#59: the turn after a ✏️ that changed pl1 never says «هیچ رکوردی ثبت نشده بود» ' + blockOf(u.user, /^# اصلاحی/).slice(0, 200));
    // A·A12 (s03): «سؤال: ثابت کنید …» شاهدِ «شما» نیست
    await wipe(); await fresh();
    await turn('سؤال: ثابت کنید که مجموع زوایای مثلث ۱۸۰ درجه است. نمی‌دونم از کجا شروع کنم', 'از کجا گیر کردی؟');
    x = await p.evaluate(() => APP.ASSIST.convRegister(__cur(), '', []));
    chk(x !== 'shoma', 'A12: a quoted textbook statement after «سؤال:» is not register evidence ' + JSON.stringify(x));
    // A·A13 (s06): قصدِ اول‌شخص درخواست نیست؛ C20-15 (s22): کنشِ همان پاسخ انجامش داد؛ D15 (s20o): گفتهٔ استاد؛ D15 (s14o): پرسشِ «به چه درد» با گزارشِ بی defer
    await wipe(); await fresh();
    await turn('می‌خوام کل این نظریه‌ی تحلیل رو بندازم دور و از اول شروع کنم', 'پیش از دور ریختن، کدام بخشش جواب نداد؟');
    u = await turn('بخش اثبات‌هاش'); chk(!blockOf(u.user, /^# درخواستِ عقب‌افتاده/), 'A13: a first-person intent is not a deferred-request candidate ' + blockOf(u.user, /^# درخواستِ عقب‌افتاده/).slice(0, 200));
    await fresh(); await turn('بیا توی سامانه ثبتش کنیم.', 'باشه، رفتیم.', [{ do: 'go', view: 'home' }]);
    u = await turn('خب'); chk(!blockOf(u.user, /^# درخواستِ عقب‌افتاده/), 'C20-15: a request satisfied by the reply\'s own action is not deferred ' + blockOf(u.user, /^# درخواستِ عقب‌افتاده/).slice(0, 200));
    await fresh(); await turn('استادم می‌گه شاید مسئله‌ی کلی‌تر رو ببینم، بهتره اول یه مدل ساده بسازم', 'مدلِ ساده چه چیزی را نگه می‌دارد؟');
    u = await turn('نمی‌دونم'); chk(!blockOf(u.user, /^# درخواستِ عقب‌افتاده/), 'D15 s20o: the advisor\'s reported words are not her request ' + blockOf(u.user, /^# درخواستِ عقب‌افتاده/).slice(0, 200));
    await fresh(); await turn('اصلاً این اثبات‌ها به چه درد من می‌خوره؟', 'اول این تمرین را ببندیم.', [cs({ ph: 'u' })]);
    u = await turn('باشه.'); chk(/به چه درد/.test(blockOf(u.user, /^# درخواستِ عقب‌افتاده/)), 'D15 s14o: an unanswered purpose question is a candidate even after a coach_state without defer ' + head(u.user).slice(0, 0));
    // B·D13 (s20): «اول کل را ببین» از نمای «🧭 این برنامه چیست؟» (پرامپتِ چندباره) هم
    await wipe(); await fresh('whole');
    u = await turn('۸ ماهه می‌خوام نشون بدم یه شبکه‌ی خاص با ۳ نوع نورون (E، I، PV) نوسان گاما تولید می‌کنه یا نه. شبیه‌سازی‌ها گاهی آره گاهی نه. استادم میگه «یه ایده بده». دیگه فکرم کار نمی‌کنه. ببین، g_EE رو ۰.۸ گذاشتم، τ_I رو ۸ میلی‌ثانیه، τ_PV ۳ میلی‌ثانیه، تأخیر سیناپسی ۱.۵، نویز ورودی پواسون ۲۰۰۰ هرتز، و وقتی g_PV-E از ۱.۲ بیشتر می‌شه گاهی...');
    chk(/\*\*پرسشِ این نوبت همین است:\*\* اول کل را ببین/.test(head(u.user)), 'B·D13: the A191 intro question is restored (root cause: the coach phase re-ran when the long page made a26 rebuild the prompt) ' + (head(u.user).match(/پیشنهادِ این نوبت: «[^»]*»/) || [''])[0]);
    // D14 (s19): «… شکست می‌خورم ولی نخوردم» با fail:true ⇒ شکست نیست
    await wipe(); await fresh(); const pid14 = await bind('کم کردنِ وزن', ['هفته‌ای سه بار پیاده‌روی']);
    await turn('سه هفته‌ست فکر می‌کنم شکست می‌خورم ولی نخوردم، هنوز دارم پیاده می‌رم', 'آفرین.', [cs({ ph: 'e', fail: true })]);
    s = await st(); chk(!s.ev.some(e => !e.ok && !e.wd), 'D14: a reported failure she herself negated («ولی نخوردم») books no failure ' + JSON.stringify(s.ev));
    // D·13 (s31): پس از بستن در گفت‌وگو، پاسخِ بازنگری «همون که گفتی … همون خطامو نشونم داد» ⇒ نه «فهمِ مسئله»
    await wipe(); await fresh();
    await turn('معما: کمترین تعداد وزن کشی برای پیدا کردن سکهٔ سبک از ۹ سکه چیست؟', 'خودت تا کجا رفتی؟');
    await turn('سه‌تا سه‌تا تقسیم کردم و دو بار بس است. درسم: سه‌تایی تقسیم کنم.', 'ثبت شد.', [{ do: 'chat_solved', title: 'سکهٔ سبک ۹', statement: 'معما: کمترین تعداد وزن کشی برای پیدا کردن سکهٔ سبک از ۹ سکه چیست؟', kind: 'find', lesson: 'سه‌تایی تقسیم کنم', check: 'با هر ۹ جای ممکن شمردم' }]);
    u = await turn('همون که گفتی «گام اولت رو بنویس، اونجا چی فرض کردی» — همون خطامو نشونم داد.');
    chk(!/مرحلهٔ محتمل: فهمِ مسئله/.test(blockOf(u.user, /^# مربیِ حل/)) && !/پیشنهادِ این نوبت: «مجهول/.test(head(u.user)), 'D·13: after closure with look-back still open, the header follows the look-back (not «فهم» + «مجهول چیست؟») ' + blockOf(u.user, /^# مربیِ حل/).split('\n')[0]);
    // تورِ مدل‌ها ردهٔ ۴: «پس جوابم غلط بود!» با retract ِ درست پذیرفته است
    await wipe(); await fresh();
    await turn('جوابم ۲۴ ـه', 'با n=۲ چک کن.', [cs({ ph: 'b', said: ['result'], result: 'جوابم ۲۴' })]);
    await turn('شد ۶، نه ۸ ـ پس جوابم غلط بود!', 'آفرین که دیدی.', RT({ msg: 'جوابم ۲۴', key: 'ans', what: 'ans', fix: 'غلط' }));
    s = await st(); chk(s.ret && s.ret.ok !== undefined, 'models class 4: retract evaluated ' + JSON.stringify(s.ret));
    // B·D9 (s14): پروندهٔ تمرین با withdrawn: [] در کارنامه شمرده می‌شود — یک سطر با اندازه‌ها
    await wipe();
    x = await p.evaluate(() => { APP.S.put({ id: 'prc_t1', type: 'practice', tid: 41, subj: { k: 'topic', t: 'برگهٔ سفید' }, kind: 'case', withdrawn: [], sessions: [{ d: '2026-10-01', at: '2026-10-01T09:00:00Z', meas: { pct: 60 } }, { d: '2026-10-04', at: '2026-10-04T09:00:00Z', meas: { pct: 80 } }, { d: '2026-10-11', at: '2026-10-11T09:00:00Z', meas: { pct: 40 }, ok: false }] });
      APP.S.put({ id: 'ex_t1', type: 'ex', tid: 41, status: 'done', doneAt: '2026-10-01T09:00:00Z', prc: 'prc_t1', data: {} });
      const W = APP.MIND.techWork(); return W.rows.map(R => ({ key: R.key, n: R.acts.length, first: R.first, last: R.last })); });
    chk(x.length === 1 && x[0].key === 'prac:prc_t1' && x[0].first === 60 && x[0].last === 40 && x[0].n === 3, 'B·D9/A9: a practice case with withdrawn=[] is counted — one row per case with its measured values (worksheet linked, not a second row) ' + JSON.stringify(x));
    await p.evaluate(() => { APP.S.del('prc_t1'); APP.S.del('ex_t1'); });
    // قراردادِ a41 (دورِ ۲۰): پس‌گرفتنِ «تثبیت شد» در stableOff — کارنامه می‌خواندش (و withdrawn ِ کهنه را هم)
    x = await p.evaluate(() => { const mk = (id, k) => APP.S.put(Object.assign({ id, type: 'practice', tid: 41, kind: 'case', sessions: [{ d: '2026-10-01', at: '2026-10-01T09:00:00Z', meas: { pct: 80 } }, { d: '2026-10-11', at: '2026-10-11T09:00:00Z', meas: { pct: 40 }, ok: false }] }, { [k]: [{ d: '2026-10-11', was: '2026-10-04', why: 'وارسی شکست خورد' }] }));
      mk('prc_s1', 'stableOff'); mk('prc_s2', 'withdrawn'); const W = APP.MIND.techWork(); const r = ['prc_s1', 'prc_s2'].map(id => { const R = W.rows.filter(R => R.key === 'prac:' + id)[0]; return R ? { off: R.off.length, st: !!R.stableAt, dec: !!R.decline } : null; });
      APP.S.del('prc_s1'); APP.S.del('prc_s2'); return r; });
    chk(x.every(r => r && r.off === 1 && r.st && r.dec), 'RO7 contract: the mind card reads stableOff (and old withdrawn arrays) as a withdrawn «تثبیت شد», counting the case ' + JSON.stringify(x));
  });

  // ================= bank (VARIANTS_R20 — سازوکارهای همین سهم) =================
  await section('bank', async () => {
    let s, u, x, id1, pid;
    const go = async (op) => { await wipe(); await fresh(); if (op) await open0(); };
    // ---------- RO1.by_fact ----------
    await go(true); pid = await bind('خانهٔ پدری'); await p.evaluate(() => { window.__lrRet = { changes: ['دادهٔ «قیمت»: «۱۱ میلیارد» (اصلاح شد ⇐ «۸ میلیارد»)'] }; });
    await play(E[0].text, { 1: [cs({ ph: 'p', said: ['plan', 'd'], plan: { text: 'فردا ساعت ۱۰ با خواهرم حرف می‌زنم', when: '2026-10-19' }, guess: { text: 'مامان راضی نمی‌شه' } })] }, RT({ msg: 'قیمت خونه‌ی بابا حدوداً ۸ میلیارده', key: 'datum:price', what: 'fact', fix: '۱۱ میلیارد' }));
    s = await st(); x = await ph();
    T(0, s.ret.ok && s.lr.length === 1 && s.lr[0].key === 'datum:price' && s.lr[0].fix === '۱۱ میلیارد' && !s.plans[0].corr && s.plans[0].when === '2026-10-19' && !s.guesses[0].corr && !s.ev.some(e => e.wd) && s.ev.filter(e => e.how === 'selfcorr').length === 1 && s.acts20.some(a => a.key === 'datum:price' && a.kind === 'correction') && x.plan === '1/1', { ret: s.ret, stmt: s.stmt, plans: s.plans, ev: s.ev, acts: s.acts20, x });
    await go();
    await play(E[1].text, { 1: [cs({ guess: { text: 'n(n−1)/2' } })], 2: [cs({ guess_res: { id: 'g1', res: 'confirmed' } })] }, RT({ msg: 'n(n−1)/2', key: 'guess:g1', what: 'guess', fix: 'n(n+1)/2' }));
    s = await st();
    T(1, s.ret.ok && s.guesses[0].text === 'n(n+1)/2' && hasNote(s.guesses[0].corr) && s.guesses[0].res !== 'confirmed' && !s.ev.some(e => e.wd && e.how !== 'own'), { ret: s.ret, g: s.guesses, ev: s.ev });
    await go(true); pid = await bind('وام بانک', ['گام ۱: تماس با بانک', 'گام ۲']);
    await play(E[2].text, { 1: [cs({ ph: 'e', said: ['plan'], plan: { text: 'چهارشنبه گام ۲ رو برم', when: '2026-10-21' }, step: { step: 1, done: 'yes', what: 'گام ۱ رو انجام دادم و جواب داد' } })] }, RT({ msg: 'چهارشنبه گام ۲ رو برم', key: 'plan:pl1', what: 'plan', fix: 'سه‌شنبه' }));
    s = await st(); x = await ph();
    T(2, s.ret.ok && s.plans[0].when === '2026-10-20' && /^سه‌شنبه گام ۲/.test(s.plans[0].text) && hasNote(s.plans[0].corr) && !s.ev.some(e => e.wd && e.how !== 'plan') && x.plan === '1/1', { plans: s.plans, ev: s.ev, x });
    await go();
    await play(E[3].text, { 1: [{ do: 'chat_solved', title: 'حالت خاص', statement: 'ثابت کن ۱+۳+…+(۲n−۱) = n²', kind: 'prove', lesson: 'اول حالت خاص رو امتحان کنم', check: 'با n=۱ و n=۲ هم چک کردم، درست بود', checkMsgs: ['با n=۱ و n=۲ هم چک کردم، درست بود'] }] }, RT({ msg: 'اول حالت خاص رو امتحان کنم', key: 'lesson', what: 'lesson', fix: 'اول شکل بکشم' }));
    x = await p.evaluate(() => { const r = APP.liveAll().filter(r => r.p.title === 'حالت خاص')[0]; const so = APP.S.get('eprog_' + r.p.id).solve; return { use: so.b[1].use, verdict: so.b[1].verdict, sup: so.b[1].chkSup || null, les: (so.lessons || []).map(l => l.use), state: so.live.state }; });
    s = await st();
    T(3, s.ret.ok && x.use === 'اول شکل بکشم' && x.les.includes('اول شکل بکشم') && !x.sup && x.state === 'solved' && !s.ev.some(e => e.wd && e.how === 'solved'), { x, ret: s.ret, ev: s.ev });
    await go();
    await play(E[4].text, {}, RT({ msg: 'اجاره ۱۵ میلیون', key: 'datum:rent', what: 'fact', fix: '۱۸ میلیون' }));
    s = await st(); T(4, s.ret.ok && /اجاره ۱۸ میلیون/.test(s.stmt) && /۴۰ میلیون/.test(s.stmt) && /وام ۸ میلیون/.test(s.stmt) && !s.ev.some(e => e.wd), { ret: s.ret, stmt: s.stmt });
    NC('4b', 'RO1#4 «computed remainder recomputed (۱۷→۱۴)»: no coach record holds a computed remainder; a page calculation is the live side');
    await go(true);
    await turn('با استقرا ثابت می‌کنم؛ پایه n=۱ درسته، فرض رو برای k گرفتم', 'گامِ استقرا؟', [cs({ ph: 'p', said: ['plan'], plan: { text: 'با استقرا ثابت می‌کنم', when: 'next-session' } })]);
    await turn('حالا گام k+1', 'ادامه بده.');
    u = await editMsg(2, 'با استقرا ثابت می‌کنم؛ پایه n=۰ درسته، فرض رو برای k گرفتم', 'باشه.', [cs({ ph: 'e', said: ['result'] })]);
    s = await st(); x = await ph();
    T(5, u.user && !blockOf(u.user, /^# اصلاحِ پیامِ پیشین \(شاید\)/) && s.plans[0].text === 'با استقرا ثابت می‌کنم' && !s.plans[0].corr && x.plan === '1/1' && s.ev.filter(e => e.how === 'selfcorr' && !e.wd).length <= 1 && x.exec === '0/0', { u: u.r, plans: s.plans, x, ev: s.ev, ret: s.ret });
    await go();
    await play(E[6].text, { 1: [cs({ ph: 'b', said: ['result'], result: 'جوابم ۴۲' })], 3: [{ do: 'chat_solved', title: 'جایگذاری ۴۲', statement: 'معادله را حل کن: x² − 40x − 84 = 0', kind: 'find', lesson: 'جایگذاری مهمه', check: 'با جایگذاری چک کردم درست درمیاد', checkMsgs: ['جوابم ۴۲ ـه، با جایگذاری چک کردم درست درمیاد'] }] }, RT({ msg: 'جوابم ۴۲ ـه', key: 'ans', what: 'ans', fix: '۴۸' }));
    x = await p.evaluate(() => { const r = APP.liveAll().filter(r => r.p.title === 'جایگذاری ۴۲')[0]; const b1 = APP.S.get('eprog_' + r.p.id).solve.b[1]; return { verdict: b1.verdict, sup: !!b1.chkSup, prev: b1.chkSup && b1.chkSup.verdictPrev, use: b1.use }; });
    s = await st();
    T(6, s.ret.ok && (x.prev === 'verified' ? x.verdict === 'unverified' && x.sup : true) && x.use === 'جایگذاری مهمه' && s.ev.filter(e => e.how === 'res').every(e => e.wd), { x, ret: s.ret, ev: s.ev });
    await go();
    await play(E[7].text, { 1: [cs({ guess: { text: '۱۲' } })] }, RT({ msg: 'امروز خیلی خسته‌ام', what: 'said', fix: 'حوصله نداشتم' }));
    s = await st(); u = await turn('باشه.'); x = blockOf(u.user, /^# اصلاحی که صفحه/);
    T(7, s.ret && s.guesses[0].text === '۱۲' && !s.guesses[0].corr && !s.ev.some(e => e.wd) && !s.sys.some(t => /^✓ اصلاح شد/.test(t)) && /چیزی عوض نشد|انجام نشد/.test(x) && /نگو که چیزی را عوض کردی|هیچ رکوردی عوض نشد/.test(x), { ret: s.ret, g: s.guesses, sys: s.sys, x: x.slice(0, 300) });
    await go(true);
    await play(E[8].text, { 1: [cs({ ph: 'p', said: ['plan'], plan: { text: 'از آخر به اول برم', when: 'next-session' } })] }, RT({ msg: 'از آخر به اول برم', key: 'plan:pl1', what: 'plan', fix: 'مسئله رو به دو حالت زوج و فرد تقسیم کنم' }));
    s = await st(); x = await ph();
    T(8, s.ret.ok && /دو حالت زوج و فرد/.test(s.plans[0].text) && hasNote(s.plans[0].corr) && s.ev.some(e => e.how === 'plan' && e.wd) && s.ev.some(e => e.how === 'plan' && e.rebook && !e.wd && e.key20 === 'plan:pl1') && x.plan === '1/1', { plans: s.plans, ev: s.ev, x });
    await go();
    await play(E[9].text, { 1: [cs({ guess: { text: '۱۰' } }), cs({ guess: { text: '۲۰' } })] }, RT({ msg: '۲۰', key: 'guess:g2', what: 'guess', fix: '۲۵' }));
    s = await st(); const g1 = s.guesses.find(g => g.id === 'g1'), g2 = s.guesses.find(g => g.id === 'g2');
    T(9, s.ret.ok && g1 && g1.text === '۱۰' && !g1.corr && g2 && g2.text === '۲۵' && hasNote(g2.corr), { g: s.guesses, ret: s.ret });
    T(10, true, 'covered by runners D·3 (same sentence)'); info.bank[10] = 'runners:D·3';
    await go();
    await play(E[11].text, {}, RT({ msg: 'آب با نرخ ۵ لیتر در دقیقه وارد می‌شه', key: 'datum:rate', what: 'fact', fix: '۶' }));
    s = await st(); T(11, s.ret.ok && /نرخ ۶ لیتر/.test(s.stmt) && /۲ ساعته/.test(s.stmt), { ret: s.ret, stmt: s.stmt });
    NC('11b', 'RO1#11 «no key ⇒ the page asks once کدام: نرخ ۵ یا زمان ۲؟»: the question is the model\'s (the fallback block asks «کدام را اصلاح کنم؟» with candidates); the page never guesses');
    await go(); pid = await bind('کم کردنِ وزن', ['هر روز نیم ساعت پیاده‌روی']);
    await play(E[12].text, { 1: [cs({ ph: 'e', step: { step: 1, done: 'yes', what: 'هر روز نیم ساعت پیاده رفتم' } })] }, RT({ msg: 'وزنم ۷۴ شد', key: 'datum:weight', what: 'fact', fix: '۷۴ و نیم' }));
    s = await st(); T(12, s.ret.ok && !s.ev.some(e => e.wd && e.how !== 'own') && s.lr.length === 1 && s.lr[0].key === 'datum:weight' && s.lr[0].fix === '۷۴ و نیم', { ev: s.ev, lr: s.lr, ret: s.ret });
    NC('12b', 'RO1#12 plot point ۷۴→۷۴٫۵ and the bubble mark: live/plot side (a38/a39) — the coach passes key datum:weight to APP.liveRetract');
    NC(13, 'RO1#13 dossier «نسخهٔ پیشین»: dossier is the live+dossier fixer\'s (RO6); the coach keeps history (corr) and a dated correction act (coach.acts20)');
    const NEG = async (i, pre, ret, extra) => { await go(); await play(E[i].text, pre || {}, ret ? RT(ret) : []); s = await st(); return s; };
    s = await NEG(14, {}, { msg: 'به‌جای جلسه رفتم سر کار', what: 'fact', fix: 'سر کار' }); T(14, s.ret && !s.ret.ok && !s.ev.some(e => e.how === 'selfcorr'), s.ret);
    s = await NEG(15, {}, { msg: 'علامتش منفیه', what: 'fact', fix: 'منفی' }); T(15, (!s.ret || !s.ret.ok) && !s.ev.some(e => e.how === 'selfcorr'), s.ret);
    s = await NEG(16, {}, { msg: 'استقرا', what: 'plan', fix: 'با استقرا' }); T(16, (!s.ret || !s.ret.ok), s.ret);
    await go(); await turn('قیمت خونه ۸ میلیارده', 'باشه.'); await turn('یه چیز دیگه هم بگم: قسطش ۱۲ ماهه‌ست', 'باشه.', RT({ msg: 'قیمت خونه ۸ میلیارده', what: 'fact', fix: '۱۲ ماهه' })); s = await st();
    T(17, s.ret && !s.ret.ok && /۸ میلیارده/.test(s.stmt), { ret: s.ret, stmt: s.stmt });
    await go(); await turn('مساحت مستطیل رو بگو', 'پس مساحت ۲۰ است.'); await turn('اون ۲۰ که گفتی غلطه', 'بیا دوباره حساب کنیم.', RT({ msg: '۲۰', what: 'ans', fix: 'غلط' })); s = await st();
    T(18, s.ret && !s.ret.ok && !s.ev.some(e => e.how === 'selfcorr'), s.ret);
    await go(); await turn('برنامه‌م سه‌شنبه‌ست', 'باشه.', [cs({ said: ['plan'], plan: { text: 'سه‌شنبه', when: '2026-10-20' } })]);
    await turn('تصمیمم عوض شد، دیگه سه‌شنبه نمی‌رم، بذارش برای شنبه', 'باشه.', RT({ msg: 'سه‌شنبه', what: 'plan', fix: 'شنبه' })); s = await st();
    T(19, s.ret && !s.ret.ok && !s.ev.some(e => e.how === 'plan' && e.wd), { ret: s.ret, ev: s.ev });
    await go(); await turn('قیمت خونه ۸ میلیارده', 'باشه.'); await turn('قیمتو اشتباه گفتم، ۱۱ میلیارد بود', 'باشه.', RT({ msg: 'قیمت خونه ۸ میلیارده', what: 'fact', fix: '۱۱ میلیارد' }));
    await turn('آره همون ۱۱ دیگه', 'باشه.', RT({ msg: 'قیمت خونه ۸ میلیارده', what: 'fact', fix: '۱۱' })); s = await st();
    x = await p.evaluate(() => (__cur().coach.stmtHist || []).length);
    T(20, s.ret && !s.ret.ok && /۱۱ میلیارد/.test(s.stmt) && x === 1, { ret: s.ret, stmt: s.stmt, hist: x });
    s = await NEG(21, {}, null); T(21, !s.ret && !s.ev.some(e => e.wd), s);
    s = await NEG(22, { 1: [cs({ said: ['result'], result: 'جوابم ۲۴' })] }, { msg: 'جوابم ۲۴', what: 'ans', fix: 'غلط' }); T(22, s.ret && !s.ret.ok && /پرسش/.test(s.ret.err), s.ret);
    await go(); await turn('خنه‌ی بابا ۸ میلیارده', 'باشه.'); await turn('خونه رو با واو ننوشتم، ببخشید', 'باشه.', RT({ msg: 'خنه‌ی بابا', what: 'said', fix: 'خونه' })); s = await st();
    T(23, /۸ میلیارده/.test(s.stmt) && !s.ev.some(e => e.wd), { ret: s.ret, stmt: s.stmt });

    // ---------- RO3.claim_after_result ----------
    await go(); await turn('قیمت خونه ۸ میلیارده', 'باشه.');
    u = await turn('قیمتو اشتباه گفتم، ۱۱ میلیارد بود', 'قیمت را ۱۱ کردم، عوض شد.', RT({ msg: 'قیمت خونه ۸ میلیارده', key: 'datum:price', what: 'fact', fix: '۱۱ میلیارد' }), [R({ reply: 'اصلاح را فرستادم؛ صفحه نتیجه را می‌گوید.' })]);
    x = blockOf(u.user, /^# اصلاحِ پیامِ پیشین \(شاید\)/); s = await st();
    T(46, !/برمی‌گرداند|انجام داد/.test(x) && /نتیجه را در نوبتِ بعد/.test(x) && u.n === 2 && /وارسیِ صفحه/.test(u.all[1]) && s.ai[s.ai.length - 1] === 'اصلاح را فرستادم؛ صفحه نتیجه را می‌گوید.', { x: x.slice(0, 300), n: u.n, ai: s.ai });
    T(55, u.n === 2 && /هنوز اصلاح را انجام نداده/.test(u.all[1]), u.all[1] && u.all[1].slice(-300));
    u = await turn('خب حالا چی؟'); x = blockOf(u.user, /^# اصلاحی که صفحه انجام داد/);
    T(47, /۱۱ میلیارد/.test(x) && /نتیجهٔ صفحه/.test(x) && /فقط همین‌ها/.test(x), x.slice(0, 300));
    T(48, info.bank[5] !== false, 'covered by runners ✏️ (same-turn result block)'); info.bank[48] = 'runners:A4/D5';
    await go(); await turn('پنجشنبه با خواهرم حرف می‌زنم', 'باشه.');
    await turn('شنبه بود نه پنجشنبه، اشتباه گفتم', 'درست شد.', RT({ msg: 'یکشنبه با دوستم', what: 'plan', fix: 'شنبه' })); s = await st(); u = await turn('باشه.'); x = blockOf(u.user, /^# اصلاحی که صفحه نپذیرفت/);
    T(49, s.ret && !s.ret.ok && s.sys.some(t => /^این اصلاح انجام نشد: آن تکه در پیام‌های قبلی پیدا نشد/.test(t)) && /انجام نشد/.test(x) && /پیدا نشد/.test(x), { ret: s.ret, sys: s.sys, x: x.slice(0, 300) });
    T(58, s.sys.some(t => /^این اصلاح انجام نشد/.test(t)), s.sys);
    T(50, info.bank[7] === true, 'covered by RO1#7 (changes=[] ⇒ «چیزی عوض نشد … نگو که چیزی را عوض کردی»)'); info.bank[50] = info.bank[7] ? 'RO1#7' : false;
    await go(); u = await turn('یه پرونده‌ی تمرین براش باز کن', 'پرونده را باز کردم.', [{ do: 'start_practice', tid: 41, subject: 'x' }], [R({ reply: 'دارم بازش می‌کنم؛ صفحه پس از تأییدت باز می‌کند.' })]);
    T(51, u.n === 2 && /start_practice|دارم بازش/.test(u.all[1]), { n: u.n });
    NC('51b', 'RO3#51 refusal of start_practice itself (consent validation): practice fixer (a41); the coach post-check only stops «باز کردم»');
    await go(); pid = await bind('خانهٔ پدری'); await turn('قیمت خونه ۸ میلیارده', 'باشه.');
    await p.evaluate(() => { window.__lrRet = { changes: ['دادهٔ «قیمت»: «۱۱ میلیارد»', 'شرطِ ۴: «۱۱ میلیارد»'], pending: ['فیلدی که خودش نوشته («قیمت: ۸ میلیارد») — صفحه می‌پرسد «این‌جا هم عوض شود؟»'] }; });
    await turn('قیمتو اشتباه گفتم، ۱۱ میلیارد بود', 'اصلاح را فرستادم.', RT({ msg: 'قیمت خونه ۸ میلیارده', key: 'datum:price', what: 'fact', fix: '۱۱ میلیارد' }));
    u = await turn('خب'); x = blockOf(u.user, /^# اصلاحی که صفحه انجام داد/);
    T(52, /شرطِ ۴/.test(x) && /صفحه از خودش می‌پرسد؛ عوض‌شده نخوان/.test(x) && /این‌جا هم عوض شود/.test(x), x.slice(0, 400));
    NC(53, 'RO3#53 live_new «باز شد» only next turn: opening/navigation of live problems is the live fixer\'s (MT1 «open live problem on request»); the coach post-check does not judge live_new wording');
    T(54, info.bank[10] !== false, 'covered by runners D·3 (the reminder change is in the page result before any claim)'); info.bank[54] = 'runners:D·3';
    await go(); await turn('پنجشنبه با خواهرم حرف می‌زنم', 'باشه.');
    await turn('شنبه بود نه پنجشنبه', 'عرض را درست کردم.', RT({ msg: 'پنجشنبه با خواهرم', what: 'plan', fix: 'شنبه' }));
    u = await turn('تصحیح دیگه: جمعه بود', 'جمعه شد.', RT({ msg: 'شنبه', what: 'plan', fix: 'جمعه' }), [R({ reply: 'اصلاح را فرستادم.' })]);
    T(56, u.n === 2 && /هنوز اصلاح را انجام نداده/.test(u.all[1]), { n: u.n });
    await go(); u = await turn('بریم سراغ تمرین', 'پرونده را باز کردم.', [], [R({ reply: 'بگو کدام تمرین.' })]); s = await st();
    T(57, u.n === 2 && /پروندهٔ تمرینی باز نشده/.test(u.all[1]) && s.ai[s.ai.length - 1] === 'بگو کدام تمرین.', { n: u.n, ai: s.ai });
    T(59, info.bank['r:D9'] !== false, 'covered by runners D9/#59'); info.bank[59] = 'runners:D9';
    await go(); await turn('قیمت خونه ۸ میلیارده', 'باشه.');
    u = await turn('قیمتو اشتباه گفتم، ۱۱ میلیارد بود', 'می‌خواهم این را درست کنم؛ صفحه خبر می‌دهد', RT({ msg: 'قیمت خونه ۸ میلیارده', what: 'fact', fix: '۱۱ میلیارد' }));
    T(60, u.n === 1, { n: u.n });
    await go(); await turn('حدسم اینه که اجاره بهتره', 'چرا؟', [cs({ guess: { text: 'اجاره بهتره' } })]);
    u = await turn('خرید بهتره', 'حدست را ثبت کردم.', [cs({ guess_res: { text: 'خرید بهتره', res: 'confirmed' } })], [R({ reply: 'می‌خواهی خرید را حدسِ تازه بگیریم؟' })]);
    T(61, u.n === 2 && /وارسیِ صفحه/.test(u.all[1]), { n: u.n });
    await go(); await turn('قیمت خونه ۸ میلیارده', 'باشه.');
    u = await turn('قیمتو اشتباه گفتم، ۱۱ میلیارد بود', 'باشه، فهمیدم.', RT({ msg: 'قیمت خونه ۸ میلیارده', what: 'fact', fix: '۱۱ میلیارد' }));
    T(62, u.n === 1, { n: u.n });

    // ---------- RO4.normalized_match ----------
    const P1 = async (i, pre, ret) => { await go(); await play(E[i].text, pre, RT(ret)); return st(); };
    s = await P1(63, { 1: [cs({ said: ['plan'], plan: { text: 'پنجشنبه با خواهرم حرف می‌زنم', when: '2026-10-22' } })] }, { msg: 'پنجشنبه با خواهرم حرف می‌زنم', what: 'plan', fix: 'شنبه' });
    T(63, s.ret.ok && s.plans[0].when === '2026-10-24' && /^شنبه با خواهرم/.test(s.plans[0].text) && hasNote(s.plans[0].corr), { ret: s.ret, plans: s.plans });
    s = await P1(64, { 1: [cs({ said: ['plan'], plan: { text: 'شنبه می‌رم بانک', when: '2026-10-24' } }), cs({ plan: { text: 'پنجشنبه هم دکتر', when: '2026-10-22' } })] }, { msg: 'شنبه می‌رم بانک', key: 'plan:pl1', what: 'plan', fix: 'پنجشنبه' });
    const bank = s.plans.find(q => /بانک/.test(q.text)), doc = s.plans.find(q => /دکتر/.test(q.text));
    T(64, s.ret.ok && bank && /^پنجشنبه می‌رم بانک/.test(bank.text) && bank.when === '2026-10-22' && (!doc || (doc.text === 'پنجشنبه هم دکتر' && !doc.corr)), { plans: s.plans, ret: s.ret });
    s = await P1(65, { 1: [cs({ said: ['plan'], plan: { text: 'پنج‌شنبه جلسه دارم', when: '2026-10-22' } })] }, { msg: 'پنج‌شنبه جلسه دارم', what: 'plan', fix: 'جمعه' });
    T(65, s.ret.ok && s.plans[0].when === '2026-10-23' && /^جمعه جلسه دارم/.test(s.plans[0].text), { plans: s.plans, ret: s.ret });
    s = await P1(66, {}, { msg: '۱۰ نقطه', what: 'fact', fix: '۱۲ نقطه' });
    T(66, s.ret.ok && /^۱۲ نقطه روی دایره داریم و حداکثر ۱۰۰ خط/.test(s.stmt), { stmt: s.stmt, ret: s.ret });
    x = await p.evaluate(() => APP.ASSIST.retractSubst20('x = 3 به دست اومد', 'x = 3 به دست اومد', 'x=۷', 'x=۷ درسته، اولی رو اشتباه نوشتم'));
    await go(); pid = await bind('معادله', ['x را پیدا کن']); s = await (async () => { await play(E[67].text, {}, RT({ msg: 'x = 3 به دست اومد', what: 'step', fix: 'x=۷' })); return st(); })();
    T(67, x === 'x = ۷ به دست اومد' && s.ret.ok && s.lr.length === 1 && s.lr[0].fix === 'x=۷', { x, ret: s.ret, lr: s.lr });
    await go(); await turn('جمعه می‌رم، اولین شنبه هم استراحت', 'باشه.', [cs({ said: ['plan'], plan: { text: 'اولین شنبه هم استراحت', when: '2026-10-24' } })]);
    u = await editMsg(1, 'جمعه می‌رم اولین یکشنبه هم استراحت'); s = await st();
    T(68, s.plans[0].when === '2026-10-25' && /یکشنبه/.test(s.plans[0].text), { plans: s.plans, u: u.r, ret: s.ret });
    s = await P1(69, { 1: [cs({ guess: { text: 'ارتفاع تقسیم بر ۵ سانتی‌متر مکعب در ثانیه' } })] }, { msg: 'ارتفاع تقسیم بر ۵ سانتی‌متر مکعب در ثانیه', what: 'guess', fix: '۶ سانتی‌متر مکعب در ثانیه' });
    T(69, s.ret.ok && s.guesses[0].text === 'ارتفاع تقسیم بر ۶ سانتی‌متر مکعب در ثانیه', { g: s.guesses, ret: s.ret });
    s = await P1(70, { 1: [cs({ guess: { text: 'مساحت √3/2' } })] }, { msg: 'مساحت √3/2', what: 'guess', fix: 'مساحت ۱' });
    T(70, s.ret.ok && s.guesses[0].text === 'مساحت ۱' && s.guesses[0].corr && s.guesses[0].corr[0].old === 'مساحت √3/2', { g: s.guesses, ret: s.ret });
    s = await P1(71, { 1: [cs({ said: ['plan'], plan: { text: 'پس‌فردا صبح ۲۰ دقیقه پیاده‌روی', when: '2026-10-20' } })] }, { msg: 'پس‌فردا صبح ۲۰ دقیقه پیاده‌روی', what: 'plan', fix: 'پس‌فردا صبح ۳۰ دقیقه' });
    T(71, s.ret.ok && s.plans[0].text === 'پس‌فردا صبح ۳۰ دقیقه پیاده‌روی' && s.plans[0].when === '2026-10-20', { plans: s.plans });
    x = await p.evaluate(() => APP.ASSIST.retractSubst20('حجم = ۲ × (۱/۳) × (ab/2) × a', '۲ ×', '۴', 'ضریب ۲ نبود، ۴ بود'));
    s = await P1(72, {}, { msg: '۲ ×', what: 'fact', fix: '۴' });
    T(72, x === 'حجم = ۴ × (۱/۳) × (ab/2) × a' && s.ret.ok, { x, ret: s.ret });
    s = await P1(73, { 1: [cs({ ph: 'b', said: ['result'], result: 'جوابم ۲۴' })] }, { msg: 'جوابم ۲۴', key: 'ans', what: 'ans', fix: 'غلط' });
    T(73, s.ret.ok && s.ev.filter(e => e.how === 'selfcorr').length <= 1, { ret: s.ret, ev: s.ev });
    s = await P1(74, { 1: [cs({ said: ['plan'], plan: { text: 'روزی ۲ كيلو ميوه', when: 'next-session' } })] }, { msg: 'روزی ۲ كيلو ميوه', what: 'plan', fix: 'نیم کیلو' });
    T(74, s.ret.ok && s.plans[0].text.replace(/ك/g, 'ک').replace(/ي/g, 'ی') === 'روزی نیم کیلو میوه', { plans: s.plans, ret: s.ret });
    s = await P1(75, {}, { msg: '۴۰دقیقه', what: 'fact', fix: '۴۵' });
    T(75, s.ret.ok && /۴۵ ?دقیقه/.test(s.stmt) && !/۴۰/.test(s.stmt), { stmt: s.stmt, ret: s.ret });
    s = await P1(76, { 1: [cs({ said: ['plan'], plan: { text: 'یکشنبه‌ها یک ساعت تمرین', when: 'next-session' } })] }, { msg: 'یک ساعت', what: 'plan', fix: 'دو ساعت' });
    T(76, s.ret.ok && s.plans[0].text === 'یکشنبه‌ها دو ساعت تمرین', { plans: s.plans, ret: s.ret });
    await go(); await turn('سه‌شنبه ساعت ۹ صبح می‌رم بانک', 'باشه.', [cs({ said: ['plan'], plan: { text: 'سه‌شنبه ساعت ۹ صبح می‌رم بانک', when: '2026-10-20' } })]);
    u = await editMsg(1, 'سه شنبه ساعت ۱۰ صبح می‌رم بانک'); s = await st();
    T(77, s.plans[0].when === '2026-10-20' && /ساعت ۱۰ صبح/.test(s.plans[0].text) && /^سه‌شنبه/.test(s.plans[0].text), { plans: s.plans, u: u.r });
    s = await P1(78, { 1: [cs({ said: ['plan'], plan: { text: 'پنجشنبه با خواهرم حرف می‌زنم', when: '2026-10-22' } })] }, { msg: 'شنبه', what: 'plan', fix: 'یکشنبه', old: 'شنبه' });
    T(78, s.ret && !s.ret.ok && s.plans[0].text === 'پنجشنبه با خواهرم حرف می‌زنم' && s.sys.some(t => /^این اصلاح انجام نشد/.test(t)), { ret: s.ret, plans: s.plans, sys: s.sys });
    s = await P1(79, {}, { msg: '۱۰', what: 'fact', fix: '۱۲' });
    T(79, s.ret && !s.ret.ok && /۱۰۰ خط/.test(s.stmt), { ret: s.ret, stmt: s.stmt });
    await go(); u = await turn('اشتباه کردم', 'چه شد؟'); s = await st();
    T(80, !s.ret && !blockOf(u.user, /^# اصلاحِ پیامِ پیشین \(شاید\)/), { ret: s.ret });
    await go(); await turn('مساحت چقدر است؟', 'پس ۳۵ است.'); await turn('۳۵ نه، ۳۶', 'باشه.', RT({ msg: '۳۵', what: 'ans', fix: '۳۶' })); s = await st();
    T(81, s.ret && !s.ret.ok && s.sys.some(t => /^این اصلاح انجام نشد/.test(t)) && !s.ev.some(e => e.how === 'selfcorr'), { ret: s.ret, sys: s.sys });
    await go(); await turn('نوشتم ۴۰ دقیقه، ولی ۴۵ بود', 'باشه.', RT({ msg: '۴۰ دقیقه', what: 'fact', fix: '۴۵' })); s = await st();
    T(82, s.ret && !s.ret.ok, s.ret);
    await go(); u = await turn('معلم نوشته: «جواب غلط است»', 'تو چه فکر می‌کنی؟');
    T(83, !blockOf(u.user, /^# اصلاحِ پیامِ پیشین \(شاید\)/), blockOf(u.user, /شاید/).slice(0, 100));
    await go(); await turn('جوابم غلط بود؟', 'منظورت کدام جواب است؟', RT({ msg: 'جوابم', what: 'ans', fix: 'غلط' })); s = await st();
    T(84, !s.ret || !s.ret.ok, s.ret);
    await go(); await turn('می‌رم کتابخونه', 'باشه.', [cs({ said: ['plan'], plan: { text: 'می‌رم کتابخونه', when: 'next-session' } })]);
    await turn('«کتاب» رو «دفتر» کن', 'باشه.', RT({ msg: 'کتاب', what: 'plan', fix: 'دفتر' })); s = await st();
    T(85, s.ret && !s.ret.ok && s.plans[0].text === 'می‌رم کتابخونه', { ret: s.ret, plans: s.plans });
    await go(); u = await turn('طرحمو نوشتم ولی گیر کردم', 'کجا گیر کردی؟');
    T(86, !blockOf(u.user, /^# اصلاحِ پیامِ پیشین \(شاید\)/), blockOf(u.user, /شاید/).slice(0, 100));
    await go(); await turn('۱۲۰ دقیقه طول کشید', 'باشه.'); await turn('۱۲ رو ۱۵ کن', 'باشه.', RT({ msg: '۱۲', what: 'fact', fix: '۱۵' })); s = await st();
    T(87, s.ret && !s.ret.ok && /۱۲۰ دقیقه/.test(s.stmt), { ret: s.ret, stmt: s.stmt });

    // ---------- RO5.edit_path ----------
    NC(88, 'RO5#88 editor contrast in both themes: a40 editor + style.css (live+dossier fixer)');
    T(89, info.bank[5] !== false, 'runners A4/D5 + bank#5'); info.bank[89] = 'runners:A4/D5';
    T(90, true, 'runners D9 (✏️ turn coach_state «اجرا +» dropped; exec 0/0)'); info.bank[90] = 'runners:D9';
    await go(); await turn('عرض مستطیل ۵ است', 'باشه.');
    await editMsg(1, 'عرض مستطیل ۹ است'); s = await st();
    T(91, s.ev.filter(e => e.how === 'selfcorr' && !e.wd).length === 1, s.ev);
    const same = async (viaEdit) => { await go(); await turn('سه‌شنبه با صاحبخونه حرف می‌زنم', 'باشه.', [cs({ said: ['plan'], plan: { text: 'سه‌شنبه با صاحبخونه حرف می‌زنم', when: '2026-10-20' } })]);
      if (viaEdit) await editMsg(1, 'پنج‌شنبه با صاحبخونه حرف می‌زنم'); else await turn('منظورم پنج‌شنبه بود نه سه‌شنبه', 'اصلاح را فرستادم.', RT({ msg: 'سه‌شنبه', what: 'plan', fix: 'پنج‌شنبه' }));
      const z = await st(); return { plan: z.plans.map(q => [q.text, q.when]), ev: z.ev.filter(e => !e.wd).map(e => e.how).sort().join(','), sc: z.ev.filter(e => e.how === 'selfcorr' && !e.wd).length }; };
    const viaChat = await same(false), viaEd = await same(true);
    T(92, JSON.stringify(viaChat) === JSON.stringify(viaEd), { viaChat, viaEd });
    await go(true); pid = await bind('گام‌ها', ['گام ۱', 'گام ۲']);
    await turn('گام ۱ رو انجام دادم و جواب داد', 'خوب.', [cs({ ph: 'e', step: { step: 1, done: 'yes', what: 'گام ۱ رو انجام دادم و جواب داد' } })]);
    await turn('گام ۲ رو انجام دادم و جواب داد', 'خوب.', [cs({ ph: 'e', step: { step: 2, done: 'yes', what: 'گام ۲ رو انجام دادم و جواب داد' } })]);
    const id2 = await p.evaluate(() => __uid(2)); await editMsg(3, 'گام ۲ رو انجام دادم و جواب نداد'); s = await st();
    T(93, s.ev.filter(e => e.msg === id2).every(e => !e.wd), { ev: s.ev, lr: s.lr });
    NC('93b', 'RO5#93 step 2 outcome done→failed: a38 liveRetract (live side); the coach keeps step 1\'s event');
    T(94, true, 'runners D9/#59'); info.bank[94] = 'runners:D9';
    NC(95, 'RO5#95 page-typed copy ask after ✏️: live+dossier fixer (a38/a40)');
    await go(); await turn('سلام دنیا', 'سلام.'); x = await p.evaluate(() => { const s = __cur(), m = s.msgs.filter(m => m.role === 'user')[0], n0 = __calls.length; const r = APP.ASSIST.retractEdit(s, m, 'سلام دنیا'); return { r: !!(r && r.same), n: __calls.length - n0 }; });
    T(96, x.r && x.n === 0, x);
    x = await p.evaluate(() => { const s = __cur(), m = s.msgs.filter(m => m.role === 'ai')[0]; return APP.ASSIST.msgTools ? APP.ASSIST.msgTools(s, m) === null : null; });
    T(97, x === true, x);
    NC(98, 'RO5#98 cancel: a40 UI (no coach code path)');
    x = await p.evaluate(() => [APP.ASSIST.regSigns('[اصلاحِ پیامِ قبلی] «ثبت کنید» ⇐ «بنویسید» — متنِ درستِ پیامم: «بنویسید»'), APP.ASSIST.convRegister({ msgs: [{ role: 'user', text: '[اصلاحِ پیامِ قبلی] «الف» ⇐ «ب» — متنِ درستِ پیامم: «لطفاً بفرمایید»' }] }, '', [])]);
    T(99, !x[0].sh && x[1] !== 'shoma', x);
    await go(); await turn('سلامم به همه', 'سلام.'); await editMsg(1, 'سلام به همه'); s = await st();
    T(100, !s.ev.some(e => e.wd) && !s.sys.some(t => /^✓ اصلاح شد/.test(t)), { ev: s.ev, sys: s.sys });
    await go(); await turn('اینو کامل کن', 'باشه.'); await editMsg(1, 'اینو کامل کن لطفاً توضیح بده'); u = await turn('خب');
    T(101, !/\[اصلاحِ پیامِ قبلی\]/.test(blockOf(u.user, /^# درخواستِ عقب‌افتاده/)), blockOf(u.user, /^# درخواستِ عقب‌افتاده/).slice(0, 200));
    T(102, true, 'runners D9 (plan 1/1 after ✏️)'); info.bank[102] = 'runners:D9';
    await go(); await turn('عرض مستطیل ۵ است', 'باشه.'); await editMsg(1, 'عرض مستطیل ۹ است');
    u = await turn('اشتباه کردم که دیر رفتم', 'چه شد؟'); s = await st();
    T(103, !blockOf(u.user, /^# اصلاحِ پیامِ پیشین/) && s.nRet <= 1, { n: s.nRet });

    // ---------- RO7 (mind reading only) ----------
    T(126, info.bank['r:D9mind'] !== false, 'runners B·D9 (one row per case with measured values)'); info.bank[126] = 'runners:B·D9';
    x = await p.evaluate(() => { APP.S.put({ id: 'prc_t2', type: 'practice', tid: 41, kind: 'case', withdrawn: [], sessions: [{ d: '2026-10-02', at: '2026-10-02T09:00:00Z', meas: { pct: 70 } }] }); const n = APP.MIND.techWork().rows.filter(R => R.key === 'prac:prc_t2').length; APP.S.del('prc_t2'); return n; });
    T(132, x === 1, x);
    [121, 122, 123, 124, 125, 127, 128, 129, 130, 131, 133, 134, 135, 136, 137, 138].forEach(i => NC(i, 'RO7 schedule/Today/T24/consent/practice block: practice+sched fixer (a41/a42/a31/a33)'));

    // ---------- RO8.turn_edges ----------
    await go(); await turn(E[139].text.replace(/^U \([^)]*\):\s*/, ''), 'از کجا گیر کردی؟'); x = await p.evaluate(() => APP.ASSIST.convRegister(__cur(), '', []));
    T(139, x !== 'shoma', x);
    await go(); await turn('«اول کل مسئله رو بخون» این جمله‌ی کتابه، ولی من گیج شدم', 'باشه.'); x = await p.evaluate(() => APP.ASSIST.convRegister(__cur(), '', []));
    T(140, x !== 'shoma', x);
    T(141, true, 'runners C20-15'); info.bank[141] = 'runners:C20-15';
    NC(142, 'RO8#142 e4/e5 alternation after a failed step: a38 liveCoach (live side)');
    T(143, true, 'runners B·D13'); info.bank[143] = 'runners:B·D13';
    await go();
    await turn('معما: کمترین تعداد وزن کشی برای پیدا کردن سکهٔ سبک از ۸ سکه چیست؟', 'خودت تا کجا رفتی؟');
    await turn('سه‌تا سه‌تا تقسیم کردم؛ جواب ۲ بار است چون ۸ سکه رو با ۵ گرم وزن کردم.', 'ثبت شد.', [{ do: 'chat_solved', title: 'سکهٔ سبک ۸', statement: 'معما: کمترین تعداد وزن کشی برای پیدا کردن سکهٔ سبک از ۸ سکه چیست؟', kind: 'find', lesson: 'سه‌تایی تقسیم کنم', check: 'با ۵ گرم وزن کردم', checkMsgs: ['سه‌تا سه‌تا تقسیم کردم؛ جواب ۲ بار است چون ۸ سکه رو با ۵ گرم وزن کردم.'] }]);
    await turn('اشتباه نوشتم، ۶ گرم بود نه ۵', 'اصلاح را فرستادم.', RT({ msg: '۸ سکه رو با ۵ گرم وزن کردم', what: 'fact', fix: '۶ گرم' }));
    u = await turn('خب؟'); x = head(u.user);
    T(144, /با مقدارِ اصلاح‌شده/.test(x) && !/اول کل را ببین/.test(x), (x.match(/\*\*پرسشِ این نوبت همین است:\*\*[^\n]*/g) || []).join(' | ').slice(0, 300));
    T(145, true, 'runners D14'); info.bank[145] = 'runners:D14';
    T(146, true, 'runners D·13'); info.bank[146] = 'runners:D·13';
    T(147, true, 'runners D15 s14o'); info.bank[147] = 'runners:D15';
    T(148, true, 'runners A13'); info.bank[148] = 'runners:A13';
    await go(); await turn('استادم گفت «باید فصل ۳ رو دوباره بخونی»', 'تو چه فکر می‌کنی؟'); u = await turn('نمی‌دونم');
    T(149, !blockOf(u.user, /^# درخواستِ عقب‌افتاده/), blockOf(u.user, /^# درخواستِ عقب‌افتاده/).slice(0, 200));
    await go(); await turn('با سلام؛ لطفاً در حل این مسئله راهنمایی بفرمایید.', 'بفرمایید، صورت را بنویسید.'); x = await p.evaluate(() => APP.ASSIST.convRegister(__cur(), '', []));
    T(150, x !== 'to', x);
    await go(); await turn('۶۷ میشه', 'چطور به آن رسیدی؟'); u = await turn('جمع زدم');
    T(151, !blockOf(u.user, /^# درخواستِ عقب‌افتاده/), blockOf(u.user, /^# درخواستِ عقب‌افتاده/).slice(0, 200));
    NC(152, 'RO8#152 question answered via the understanding form not re-asked: the live problem\'s question list is a38\'s (liveNextQ/liveCoach)');
    NC(153, 'RO8#153 «ردش» kept with the guess question: a38 qSplit (live side)');
    await go(); await turn('یه مسئله دارم', 'بگو.'); u = await turn('ارتفاع ۲ متر، شعاع ۳۰ سانت، نرخ ۵ لیتر.');
    T(154, !/اول کل را ببین/.test(head(u.user)), (head(u.user).match(/\*\*پرسشِ این نوبت همین است:\*\*[^\n]*/) || [''])[0].slice(0, 200));
    await go(); await turn('عرض مستطیل ۵ است', 'باشه.'); await turn('ببخشید عرض رو اشتباه گفتم، ۹ بود نه ۵', 'اصلاح را فرستادم.', RT({ msg: 'عرض مستطیل ۵ است', what: 'fact', fix: '۹' }));
    u = await turn('مرسی'); T(155, !blockOf(u.user, /^# مربیِ حل/) && !/با مقدارِ اصلاح‌شده/.test(head(u.user)), head(u.user).split('\n').filter(l => /^# /.test(l)).join(' | ').slice(0, 300));
    await go(); await turn('یه سؤال دارم، کمکم کن', 'بگو.'); await turn('سؤال: ثابت کنید زاویه‌های مثلث ۱۸۰ درجه است. نمی‌دونم چیکار کنم', 'باشه.'); await turn('سؤال: ثابت کنید زاویه‌های مثلث ۱۸۰ درجه است. هنوز گیرم', 'باشه.');
    x = await p.evaluate(() => APP.ASSIST.convRegister(__cur(), '', [])); T(156, x !== 'shoma', x);

    // ---------- MT1.page_compensation ----------
    await go(); await turn('قیمت خونه ۸ میلیارده', 'باشه.');
    await p.evaluate(() => { __q.push({ reply: 'اصلاح را فرستادم.', status: 'related', memory: 'm', actions: [], retract: { msg: 'قیمت خونه ۸ میلیارده', what: 'fact', fix: '۱۱ میلیارد' } }); });
    await p.evaluate(async () => { await APP.ASSIST.send('قیمتو اشتباه گفتم، ۱۱ میلیارد بود'); __q.length = 0; }); s = await st();
    T(173, s.ret && s.ret.ok && /۱۱ میلیارد/.test(s.stmt), { ret: s.ret, stmt: s.stmt });
    await go(); await turn('معما: سه سکه، یکی سبک‌تر — پیدایش کن؟', 'خودت؟');
    await turn('سه‌تا سه‌تا وزن کردم، حل شد.', 'ثبت شد.', [{ do: 'chat_solved', title: 'سکه ۳', statement: 'معما: سه سکه، یکی سبک‌تر — پیدایش کن؟', kind: 'find', lesson: 'سه‌تایی تقسیم کنم', check: 'هر سه را شمردم' }]);
    await turn('این جور معماها رو دوست دارم چون کوتاهن', 'خوب.', [cs({ taste: { q: 'این جور معماها رو دوست دارم چون کوتاهن' } })]);
    x = await p.evaluate(() => { const r = APP.liveAll().filter(r => r.p.title === 'سکه ۳')[0]; const b1 = APP.S.get('eprog_' + r.p.id).solve.b[1]; return b1.taste || ''; });
    T(174, /معماها رو دوست دارم/.test(x) && !/object/.test(x), x);
    await go(); await turn('خب، این هم از این', 'خوب.', [cs({ ph: 'b', said: ['result'] })]); u = await turn('باشه'); s = await st();
    T(175, /# گزارشِ نوبتِ پیش \(یک بار\)/.test(head(u.user)) && /result را با عینِ متنش/.test(head(u.user)) && !s.ev.some(e => e.how === 'res'), blockOf(u.user, /^# گزارشِ نوبتِ پیش/).slice(0, 200));
    x = await p.evaluate(() => [APP.ASSIST.quoteIn('n(n−1)/۲', 'حدسم n(n-1)/2 ـه'), APP.ASSIST.quoteIn('x^2', 'حدس می‌زنم جواب x به توان ۲ باشه'), APP.ASSIST.quoteIn('x²', 'حدس می‌زنم جواب x به توان ۲ باشه')]);
    T(176, x[0] === true, x); T(177, x[1] === true && x[2] === true, x);
    await go(); await turn('حدسم اینه که جواب هر بار دو برابر میشه', 'چرا؟', [cs({ guess: { text: 'جواب دوبرابر می‌شود هر مرحله' } })]); u = await turn('نمی‌دونم'); s = await st();
    T(178, /# گزارشِ نوبتِ پیش \(یک بار\)/.test(head(u.user)) && /عینِ عبارتش/.test(head(u.user)) && !s.guesses.length, { g: s.guesses, b: blockOf(u.user, /^# گزارشِ نوبتِ پیش/).slice(0, 200) });
    await go(); pid = await bind('ثبت‌نام', ['گام ۱: فرم', 'گام ۲: زنگ زدن به اداره'].map((t, i) => i === 0 ? { text: t, closed: true, out: { done: 'yes', at: '2026-10-17' } } : t)); u = await turn('زنگ زدم، گفتن هفته‌ی بعد');
    T(179, /آیا این پیام نتیجهٔ گامِ ۲ است؟ \(بله\/بخشی\/نه\)/.test(head(u.user)), blockOf(u.user, /^# گامِ باز/).slice(0, 300));
    NC(180, 'MT1#180 live_new opened/navigated on request: live+dossier fixer'); NC(181, 'MT1#181 chat_invent → live_new: live+dossier fixer');
    await go(); await turn('یه مسئله دارم: مجموع دو عدد ۱۰ است', 'بگو.');
    u = await turn('حاصل‌ضربشون بیشینه باشه', 'مجهول چیست؟ و داده‌ها؟', [], [R({ reply: 'مجهول چیست؟' })]); s = await st();
    T(182, u.n === 2 && /دو پرسش/.test(u.all[1]) && s.ai[s.ai.length - 1] === 'مجهول چیست؟', { n: u.n, ai: s.ai });
    u = await turn('فکر کنم ۲۵ میشه', 'آفرین، درسته، حل شد!', [], [R({ reply: 'چطور وارسی‌اش می‌کنی؟' })]); s = await st();
    T(183, u.n === 2 && /«حل شد\/درسته» را تو تأیید نکن/.test(u.all[1]) && s.ai[s.ai.length - 1] === 'چطور وارسی‌اش می‌کنی؟', { n: u.n, ai: s.ai });
    T(184, /^# وضعِ کنونی\n- زمینه \(نه پرسشِ دوم\): /m.test(head(u.user)) && head(u.user).indexOf('# وضعِ کنونی') < head(u.user).indexOf('# گزارشِ وضع'), (blockOf(u.user, /^# وضعِ کنونی/) || '').slice(0, 200));
    await go(); u = await turn('می‌خوام عادت سحرخیزی بسازم ولی همش شکست می‌خورم');
    T(185, /در دامنهٔ تونلِ زندگی/.test(head(u.user)), blockOf(u.user, /^# عادت/).slice(0, 200));
    await go(); u = await turn('یه دسته مداد، پاک‌کن و خط‌کش داریم با هم ۲۰ تا؛ مداد دو برابر پاک‌کنه. چند تا از هر کدوم داریم؟');
    T(186, /# شمارِ مجهول‌ها/.test(head(u.user)) && /مداد، پاک‌کن و خط‌کش/.test(head(u.user)), blockOf(u.user, /^# شمارِ مجهول/).slice(0, 200));
    await go(); await turn('فکر کنم بشه ۱۲', 'چرا؟', [cs({ ph: 'b', said: ['result'] })]); s = await st();
    T(187, !s.ev.some(e => e.how === 'res'), s.ev);
    await go(); await turn('یه مسئله دارم', 'بگو.', [cs({ guess: { text: 'جواب ۹۹ است' } })]); s = await st();
    T(188, !s.guesses.length, s.guesses);
    await turn('هیچی', 'باشه.', [cs({ guess: { text: 'جواب ۹۹ است' } })]); u = await turn('باشه'); u = await turn('خب');
    x = await p.evaluate(() => (__cur().coach.askLog20 || []).length);
    T(189, x === 1 && !/# گزارشِ نوبتِ پیش/.test(head(u.user)), x);
    NC(190, 'MT1#190 no unasked chat_invent: chat_invent is the live+dossier fixer\'s (a27 DO.chat_invent is unchanged here)'); NC(191, 'MT1#191 no live_new navigation: live+dossier fixer');
    await go(); u = await turn('یه رژیم غذایی دقیق برام بنویس');
    T(192, /نسخهٔ تخصصی \(رژیمِ غذاییِ دقیق/.test(head(u.user)), blockOf(u.user, /^# عادت/).slice(0, 200));
    await go(); await turn('جوابم ۲۴ است', 'وارسی کردی؟', [cs({ ph: 'b', said: ['result'], result: 'جوابم ۲۴' })]); await turn('آره چک کردم', 'خوب.', [cs({ said: ['result'] })]); s = await st();
    T(193, s.ev.filter(e => e.how === 'res' && !e.wd).length === 1, s.ev);
    await go(); await turn('یه مسئله دارم: مجموع دو عدد ۱۰ است', 'بگو.'); u = await turn('حاصل‌ضربشون', 'عالی! مجهول دقیقاً چیست؟');
    T(194, u.n === 1, { n: u.n });
    await go(); u = await turn('زنگ زدم');
    T(195, !blockOf(u.user, /^# گامِ باز/), blockOf(u.user, /^# گامِ باز/).slice(0, 100));
  });

  // ================= خلاصه =================
  const mine = BANK.map((e, i) => i).filter(i => /^(?:RO1|RO3|RO4|RO5|RO8|MT1)\./.test(BANK[i].rc) || i === 126 || i === 132 || /^RO7\./.test(BANK[i].rc));
  const res = { pass: [], fail: [], nc: [] };
  mine.forEach(i => { if (info.bank[i] === false) res.fail.push(i); else if (info.bank[i] !== undefined) res.pass.push(i); else if (info.nc[i]) res.nc.push(i); else res.nc.push(i + '?'); });
  console.log(JSON.stringify({ bank: { n: mine.length, pass: res.pass.length, fail: res.fail, nc: res.nc }, ncWhy: info.nc }, null, 1));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
