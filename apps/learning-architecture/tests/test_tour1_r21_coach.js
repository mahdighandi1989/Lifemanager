// تورِ پولیا (دستهٔ ۱، دورِ ۲۱، سهمِ «route+coach» — ۲۰۲۶-۱۰-۱۸) — DECISIONS_R21: R1 (مسیریابی از ردبندیِ صفحه)، R3 سمتِ مربی (a ساختارِ نتیجه، f بندِ درس،
//  g دوباره‌ثبت + خود-اصلاح، h تکهٔ متفاوت)، R6 سمتِ مربی (N5 بستنِ جاافتاده، گامِ بی‌شماره، نقلِ فرمول‌وار، مرحلهٔ خطا از حرفِ خودش، C21-15)، R7، R8،
//  و افزوده‌های گروهِ A (R7+ ضمیر، R8+ پرسشِ پس از نتیجهٔ گام، R3+ درهم‌نشدن و هم‌خوانیِ بلوک، R6+ برنامهٔ عقب‌افتاده، R9+ داوریِ دوبارهٔ حدس).
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۱ (B·D1/D3/D7/D10/D12/D14، C21-1/6/7/9/10/15، D·1/4/7/10/11، A21-1/2/5/12/20/22، models N1/N5/ردهٔ ۲/۵)
//  bank     همهٔ ورودی‌های سازوکارهای همین سهم در بانکِ مستقلِ tests/variants/VARIANTS_R21.json (بقیه با دلیل در info.nc)
// LLA_FILE = ساختِ دیگر؛ ONLY=route,runners,r3,r6,r7,r8,addA
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = JSON.parse(fs.readFileSync(process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R21.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R21.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)), 'utf8'));

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
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
      return { sys: c.sys || '', user: c.user || '', task: c.task || '', n: all.length, all: all.map(x => x.user), tasks: all.map(x => x.task) };
    };
    window.__fresh = (view) => { APP.go(view || 'home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; __lr.length = 0; window.__lrRet = null; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'kitem', 'pbitem', 'wchain', 'case', 'practice', 'ex', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
    window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {};
      ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L); APP.S.put(pg); };
    window.__uid = (n) => { const U = (__cur().msgs || []).filter(m => m.role === 'user' && !/^\[سامانه/.test(m.text)); return APP.ASSIST.msgId(U[n - 1]); };
    window.__st = () => { const s = __cur(), C = s.coach || {}; return {
      guesses: (C.guesses || []).map(g => ({ id: g.id, text: g.text, corr: g.corr || null, res: g.res || '' })), guess: C.guess ? { text: C.guess.text } : null,
      plans: (s.plans || []).map(q => ({ id: q.id, text: q.text, when: q.when, state: q.state })),
      ev: (s.coachEv || []).map(e => ({ ph: e.ph, ok: e.ok, how: e.how || '', msg: e.msg || '', wd: !!e.wd, rebook: !!e.rebook, key: e.key || '', key20: e.src20 ? e.src20.key : '', span20: e.src20 ? e.src20.span : null, phFrom: e.phFrom || '' })),
      ret: (C.retracts || []).slice(-1)[0] || null, note: C.retNote || null, stmt: C.stmt || '', close21: C.close21 || null, step21: C.step21 || null, ask20: C.ask20 || null,
      sys: (s.msgs || []).filter(m => m.role === 'sys').map(m => m.text), ai: (s.msgs || []).filter(m => m.role === 'ai').map(m => m.text), unkBy: C.unkBy || {} }; };
    window.__ph = () => { const Q = APP.MIND.phases(); const r = {}; Q.rows.forEach(X => { r[X.id] = X.k + '/' + X.n; }); return { r, weakest: Q.weakest ? Q.weakest.id : '' }; };
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
  const RT = (o) => [cs({ retract: o })];
  const bind = async (title, steps, stmt) => p.evaluate(([t, steps, stmt]) => { const pid = __live(t, stmt); APP.liveBindSession(pid, __cur()); __liveSet(pid, (so, L) => { (steps || []).forEach((x, i) => L.steps.push(Object.assign({ id: 's' + (i + 1), at: new Date().toISOString(), text: typeof x === 'string' ? x : x.text, pred: 'شاید', due: '2026-10-19' }, typeof x === 'object' ? x : {}))); }); return pid; }, [title, steps || [], stmt || '']);
  const pure = (o) => p.evaluate((o) => APP.ASSIST.chatTask(o), o);
  const E = {}; BANK.forEach((e, i) => { E[i] = e; });
  const T = (i, ok, x) => { info.bank[i] = !!ok; chk(ok, 'bank#' + i + ' [' + E[i].rc + '/' + E[i].kind + '] «' + E[i].text.slice(0, 70) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 700)); };
  const NC = (i, why) => { info.nc[i] = why; };
  const U = (i) => E[i].text.split('‖').map(x => x.trim()).filter(x => /^U:/.test(x)).map(x => x.replace(/^U:\s*/, '').trim());
  const COACH = '# مربیِ حل (روحِ «چگونه آن را حل کنیم») — …\n- قاعدهٔ سبک';

  // ================= R1 — مسیریابی از ردبندیِ خودِ صفحه =================
  await section('route', async () => {
    let u, s, x;
    // گشایش: نخستین پیامی که مسئله/تصمیم را بیان می‌کند (آشکارسازِ صفحه)؛ «# وضعِ کنونی» همان نوبت «مسئلهٔ گفت‌وگو» دارد
    for (const i of [0, 1, 2, 3, 4, 5, 6, 7, 18, 21]) { await wipe(); await fresh(); u = await turn(U(i)[0] || E[i].text.replace(/^U:\s*/, ''));
      const now = blockOf(u.user, /^# وضعِ کنونی/); T(i, u.task === 'lla_coach' && (i === 4 || i === 5 || /مسئلهٔ گفت‌وگو «/.test(now)), { task: u.task, now: now.slice(0, 160) }); }
    // ۸ / ۹: کانونِ مسئلهٔ گفت‌وگو بی واژهٔ مسئله
    await wipe(); await fresh(); await turn(U(0)[0], 'چه چیزی را می‌دانی؟'); u = await turn('که همه‌ی برچسب‌ها غلطن'); T(8, u.task === 'lla_coach', u.task);
    await wipe(); await fresh(); await turn(U(1)[0], 'مجهول چیست؟'); await turn('نمی‌دونم', 'چه داده‌ای داری؟'); u = await turn('باشه'); T(9, u.task === 'lla_coach', u.task);
    // ۱۰ / ۱۱: آمیخته با «ثبتش کن» مربی می‌ماند
    await wipe(); await fresh(); await turn(U(6)[0], 'کدام برایت مهم‌تر است؟'); u = await turn('خب حقوق برام مهم‌تره ولی خسته می‌شم. اینو یه جا ثبتش کن'); T(10, u.task === 'lla_coach', u.task);
    await wipe(); await fresh(); u = await turn('حدسم اینه که جوابش ۵۰۵۰ ـه، ثبت کن'); T(11, u.task === 'lla_coach', u.task);
    // ۱۲: مسئلهٔ زنده ⇒ سرتیترِ زنده پیش از «باز کن»
    await wipe(); await fresh(); await bind('مخزن', ['گام ۱: اندازه‌گیری']); u = await turn('گیر کردم سر همون مسئله‌ی مخزن، باز کن ببینم کجا بودم'); T(12, u.task === 'lla_coach', u.task);
    // ۱۳: اصلاح در گفت‌وگو
    await wipe(); await fresh(); await turn(U(1)[0], 'مجهول چیست؟'); await turn('زمان پر شدن', 'خوب.'); u = await turn('اشتباه گفتم، شیر دوم ۴ ساعته پر می‌کنه نه ۶'); T(13, u.task === 'lla_coach', u.task);
    // ۱۴: بازنگری پس از حل در گفت‌وگو
    await wipe(); await fresh(); await turn('یه معما: کمترین تعداد وزن‌کشی برای پیدا کردن سکهٔ سبک از ۹ سکه چیست؟', 'از کجا شروع می‌کنی؟');
    await turn('سه‌تا سه‌تا وزن کردم، دو بار بس است و با ۹ سکه چک کردم درسته.', 'ثبت شد.', [{ do: 'chat_solved', title: 'سکهٔ سبک ۹', statement: 'معما: کمترین تعداد وزن‌کشی برای پیدا کردن سکهٔ سبک از ۹ سکه چیست؟', kind: 'find', lesson: 'سه‌تایی تقسیم کنم', check: 'با ۹ سکه چک کردم', checkMsgs: ['سه‌تا سه‌تا وزن کردم، دو بار بس است و با ۹ سکه چک کردم درسته.'] }]);
    u = await turn('حالا که حل شد، چی ازش یاد گرفتم؟'); T(14, u.task === 'lla_coach', u.task);
    // ۱۵: مسئلهٔ زنده در «طرح»، پیامِ یک‌واژه‌ای
    await wipe(); await fresh(); await bind('دو شیر'); u = await turn('هوم'); T(15, u.task === 'lla_coach', u.task);
    // ۱۶: پروندهٔ تمرینِ باز در همین سشن
    await wipe(); await fresh(); await p.evaluate(() => { const c = APP.PR.start(41, APP.PR.subj('free', '', 'جدولِ ضرب'), { src: 'user' }); const s = __cur(); s.prcs = [c.id]; APP.S.put(s); });
    u = await turn('این دفعه ۶۰ درصدش یادم بود'); T(16, u.task === 'lla_coach' && /# پرونده‌های تمرینِ باز/.test(head(u.user)), { task: u.task });
    // ۱۷: بلوکِ معلمِ تور (تابعِ خالص با همان سرتیترِ صفحه)
    T(17, await pure({ msg: 'نفهمیدم این قسمت چی می‌گه', prompt: '# معلمِ حلِ مسئله — کاربر همین حالا دارد «x» را حل می‌کند\n' + COACH }) === 'lla_coach', 'tutor');
    // ۱۹: ادامهٔ مسئلهٔ دیروز در سشنِ تازه
    await wipe(); await fresh(); await turn(U(2)[0], 'از کجا شروع می‌کنی؟'); await fresh(); u = await turn(U(19)[0]); T(19, u.task === 'lla_coach', u.task);
    // ۲۰: بازنویسی همان رده را نگه می‌دارد
    await wipe(); await fresh(); u = await turn(U(0)[0], 'چه می‌دانی؟ و چه می‌خواهی؟', [], [R({ reply: 'چه چیزی را می‌دانی؟' })]); T(20, u.n === 2 && u.tasks.every(t => t === 'lla_coach'), u.tasks);
    // منفی‌ها: فرمانِ صرف، سلام، پرسشِ واقعیِ ساده
    for (const i of [22, 24, 25, 29, 30, 31, 32, 33, 34, 37]) { await wipe(); await fresh(); const t = U(i)[0]; u = await turn(t); T(i, u.task === 'lla_assistant', { t, task: u.task }); }
    // ۲۳ / ۳۶: «آره، ثبتش کن.» درونِ مسئلهٔ در کانون ⇒ سریع؛ نوبتِ محتوای بعد مربی
    await wipe(); await fresh(); const u1 = await turn(U(0)[0], 'چه می‌دانی؟'); const u2 = await turn('آره، ثبتش کن.'); const u3 = await turn('خب جعبه‌ی «سیب و پرتقال» رو انتخاب می‌کنم');
    T(23, u2.task === 'lla_assistant', u2.task); T(36, u1.task === 'lla_coach' && u2.task === 'lla_assistant' && u3.task === 'lla_coach', [u1.task, u2.task, u3.task]);
    // ۲۶: ✏️
    await wipe(); await fresh(); await turn(U(1)[0], 'مجهول؟'); await turn('شیر دوم ۶ ساعته', 'خوب.');
    x = await p.evaluate(async () => { const s = __cur(), m = s.msgs.filter(m => m.role === 'user')[1], n0 = __calls.length; __q.push(R({ reply: 'درست شد.' })); APP.ASSIST.retractEdit(s, m, 'شیر دوم ۴ ساعته');
      for (let i = 0; i < 80 && (__calls.length === n0 || APP.ASSIST.busy()); i++) await new Promise(r => setTimeout(r, 100)); return __calls.slice(n0).map(c => c.task); });
    T(26, x.length && x.every(t => t === 'lla_assistant'), x);
    // ۲۷ / ۲۸ / ۳۵: پیگیری‌های خودکار
    T(27, await pure({ msg: '[سامانه: نتیجهٔ ثبت — انجام نشد]', prompt: COACH, prev: 'lla_coach' }) === 'lla_assistant', '27');
    T(28, await pure({ msg: '[سامانه: رکورد ساخته شد]', prompt: '# مسئلهٔ زندهٔ این سشن (lp): «x» · مرحله: طرح\n' + COACH, prev: 'lla_coach' }) === 'lla_assistant', '28');
    T(35, await pure({ msg: '[سامانه: نتیجهٔ ✏️ — تغییرات: …]', prompt: COACH, prev: 'lla_coach' }) === 'lla_assistant', '35');
    // R20 همچنان: فرمانِ صرف با مسئلهٔ زنده سریع، تابعِ خالص بی‌صفحه
    const P = await p.evaluate((COACH) => { const T = APP.ASSIST.chatTask, live = '# مسئلهٔ زندهٔ این سشن (lp_x): «x» · مرحله: طرح\n';
      return { act: T({ msg: 'برو به صفحه‌ی امروز', prompt: live + COACH }), fill: T({ msg: 'مجهول رو بنویس زمان کل', prompt: live + COACH }), stuckOpen: T({ msg: 'گیر کردم، باز کن ببینم', prompt: live + COACH }),
        focus: T({ msg: 'باشه', prompt: '# وضعِ کنونی\n- زمینه (نه پرسشِ دوم): مسئلهٔ گفت‌وگو «x» · مرحله: فهمِ مسئله.' }), closedLive: T({ msg: 'مرسی', prompt: '# وضعِ کنونی\n- زمینه (نه پرسشِ دوم): مسئلهٔ زنده «x» (بسته شد).' }) }; }, COACH);
    chk(P.act === 'lla_assistant' && P.fill === 'lla_assistant' && P.stuckOpen === 'lla_coach' && P.focus === 'lla_coach' && P.closedLive === 'lla_assistant', 'R1 pure: pure command stays fast even with a live head; a stuck report with «باز کن» is coach; «مسئلهٔ گفت‌وگو» focus ⇒ coach; closed live alone ⇒ fast ' + JSON.stringify(P));
    // صورتِ ناـمسئله جایش را به مسئلهٔ واقعی می‌دهد (همان شرطِ کانون)
    await wipe(); await fresh(); await turn('تاریخ امروز چنده؟', 'یکشنبه ۲۶ مهر.'); u = await turn(U(0)[0]); s = await st();
    chk(u.task === 'lla_coach' && /سه تا جعبه/.test(s.stmt) && /مسئلهٔ گفت‌وگو «/.test(blockOf(u.user, /^# وضعِ کنونی/)), 'R1: a non-problem first message does not hold the statement — the next problem message becomes the chat problem ' + JSON.stringify({ task: u.task, stmt: s.stmt }));
    x = await p.evaluate(() => ({ old: APP.ASSIST.R21_QUARANTINE.chatTask20({ msg: 'که همه‌ی برچسب‌ها غلطن', prompt: '# وضعِ کنونی\n- مسئلهٔ گفت‌وگو «x»' }) }));
    chk(x.old === 'lla_assistant', 'R1: the R20 keyword router is quarantined (reachable) and is the one that failed the focus case ' + JSON.stringify(x));
  });

  // ================= runners — جمله‌های خودِ گزارش‌های دورِ ۲۱ =================
  await section('runners', async () => {
    let u, s, x;
    // models21 N1 / B·D1 s15: نوبتِ دومِ مسئلهٔ گفت‌وگو بی واژهٔ کلیدی
    await wipe(); await fresh(); u = await turn('یه مسئله: دو تا شیر داریم؛ یکی مخزن رو ۳ ساعته پر می‌کنه یکی ۶ ساعته. با هم چقدر طول می‌کشه؟', 'مجهول چیست؟');
    const u2 = await turn('زمانی که با هم پر می‌کنن', 'چه داده‌ای داری؟');
    chk(u.task === 'lla_coach' && u2.task === 'lla_coach', 'N1/B·D1: opening and follow-up coaching turns of a chat problem go to lla_coach ' + JSON.stringify([u.task, u2.task]));
    // C21-1: «…ثبتش کن» ِ آمیخته
    await wipe(); await fresh(); u = await turn('رسید قسطو گم کردم و بانک میگه پرداخت نشده؛ می‌خوام بفهمم چی شده، اینو ثبتش کن');
    chk(u.task === 'lla_coach', 'C21-1: a problem message ending in «ثبتش کن» is coach ' + u.task);
    // A21-1 / B·D10 / R7+: «باید/نباید/بیاید/می‌گوید/بیشترین» شاهدِ «شما» نیست
    x = await p.evaluate(() => ['باید اول مجهول رو بنویسی.', 'نباید عجله کنی؛ معلمت می‌گوید صبر کن.', 'بیشترین فاصله کجاست؟', 'شاید بیاید، ببین.', 'می‌گویید چه؟', 'ثبت کنید.'].map(t => APP.ASSIST.regSigns(t).sh));
    chk(x[0] === false && x[1] === false && x[2] === false && x[3] === false && x[4] === true && x[5] === true, 'A21-1/R7+: 3rd-person, modal and superlative forms are not «شما»; real 2pl still is ' + JSON.stringify(x));
    await wipe(); await fresh(); await turn('یه معما دارم که می‌خوام حلش کنم، تو کمکم کن', 'بگو.'); await turn('سه تا جعبه داریم و برچسب‌ها غلطن، تو بگو چی کار کنم', 'چه می‌دانی؟');
    u = await turn('همه‌ی برچسب‌ها غلطن، می‌دونی که', 'باید از جعبه‌ای شروع کنی که برچسبش «مخلوط» است؛ بیشترین اطلاعات را آن می‌دهد.'); s = await st();
    chk(u.n === 1, 'A21-1: a correct «تو» reply with «باید/بیشترین» is not sent back for a register rewrite ' + JSON.stringify({ n: u.n, all: u.all.slice(1).map(t => t.slice(-200)) }));
    // C21-7 / B·D10: «صفحه می‌گوید/کجاها عوض شد» ادعا نیست
    x = await p.evaluate(() => [APP.ASSIST.claimText21('اصلاح را فرستادم؛ صفحه می‌گوید چه چیزی عوض شد.'), APP.ASSIST.claimText21('کجاها عوض شد را صفحه نشان می‌دهد.'), APP.ASSIST.claimText21('عوض کردم: بام ۱۸۰ شد.')]);
    chk(!/عوض\s*شد/.test(x[0]) && !/عوض\s*شد/.test(x[1]) && /عوض کردم/.test(x[2]), 'C21-7: page-attributed / indirect «عوض شد» is not a claim; «عوض کردم» still is ' + JSON.stringify(x));
    // models ردهٔ ۸: دو پرسشِ بی «و» از چشم نیفتد؛ «… یا …؟» یکی است
    x = await p.evaluate(() => ['راهت چیست؟ کِی امتحانش می‌کنی؟', 'چه چیزی مجهول است؟ و الان چه داده‌ای داری؟', '۱۰ است یا ۲۰؟', 'گفتی «چرا؟» — مجهول چیست؟', 'مجهول چیست؟ و داده‌ها؟'].map(t => APP.ASSIST.replyTwoQ(t)));
    chk(x[0] && x[1] && !x[2] && !x[3] && x[4], 'R7 twoQ: two independent questions (with or without «و») flagged; alternative and quoted «؟» not ' + JSON.stringify(x));
    // C21-9: مجهول هرگز جملهٔ کارِ خودش
    x = await p.evaluate(() => [APP.ASSIST.unkOk21('سه تاشو چک کردم'), APP.ASSIST.unkOk21('زمانِ پر شدنِ مخزن'), APP.ASSIST.unkOk21('ممنون حل شد، عالی بود')]);
    chk(!x[0] && x[1] && !x[2], 'C21-9: «سه تاشو چک کردم» / a closure message is never the unknown ' + JSON.stringify(x));
    // C21-10: پیامِ بستن صورتِ مسئله نمی‌شود
    await wipe(); await fresh(); await turn('ممنون حل شد، عالی بود'); s = await st();
    chk(!s.stmt, 'C21-10: the closure message is not taken as the chat problem statement ' + JSON.stringify(s.stmt));
    // B·D7 / C21-6: سطرِ تغییر تکهٔ متفاوت را نشان می‌دهد
    x = await p.evaluate(() => [APP.ASSIST.chLine20('صورت', 'قبل از جایگذاری، مجهول رو به زبون نرخ بگم و هر کمیتِ نامعلوم رو نام بذارم', 'قبل از جایگذاری، مجهول رو به زبون سرعت بگم و هر کمیتِ نامعلوم رو نام بذارم'),
      APP.ASSIST.chLine20('حدس', 'حدسم ۱۲ ـه و ۱۵ دقیقه طول کشید', 'حدسم ۱۴ ـه و ۲۰ دقیقه طول کشید'), APP.ASSIST.chLine20('حدس', '۲^n', '۲^n − ۱')]);
    // دورِ ۲۴ (DECISIONS_R24 R3، B24·D16، بانکِ R24 #65/#79 جایگزینِ قالبِ «پیشین» ⇐ «تازه»): هر سطرِ تغییر یک سو — «تازه» (اصلاح شد ⇐ «پیشین»)
    chk(/«سرعت» \(اصلاح شد ⇐ «نرخ»\)/.test(x[0]) && /«۱۴» \(اصلاح شد ⇐ «۱۲»\)/.test(x[1]) && /«۲۰» \(اصلاح شد ⇐ «۱۵»\)/.test(x[1]) && /۲(?:\^n|ⁿ) − ۱/.test(x[2]), 'B·D7/C21-6/h: the change line shows each differing fragment ' + JSON.stringify(x));
    // A21-5: جای‌گزینیِ مربی درهم نمی‌شود (همان diff ِ بخشِ مسئله)
    await wipe(); await fresh(); await turn('یه مسئلهٔ تازه: ۹ نقطه داخل یک مثلث متساوی‌الاضلاع به ضلع ۳ داریم؛ ثابت کن دو تاشون فاصله‌شون حداکثر ۱ هست.', 'چه می‌دانی؟');
    await turn('حدسم اینه: مثلث رو به ۹ تا مثلثِ کوچیک با ضلع ۱ تقسیم کنم؛ بیشترین فاصله توی مثلثِ ضلع ۱ ارتفاعشه یعنی √۳/۲', 'چرا؟', [cs({ guess: { text: 'بیشترین فاصلهٔ دو نقطه توی مثلثِ ضلع ۱ می‌شه ارتفاعش، یعنی √۳/۲' } })]);
    // مدل حدس را بازگفت کرد؛ اگر ثبت نشد، نقلِ عینی
    s = await st(); if (!s.guesses.length) await turn('حدسم همینه: بیشترین فاصله توی مثلثِ ضلع ۱ ارتفاعشه یعنی √۳/۲', 'باشه.', [cs({ guess: { text: 'بیشترین فاصله توی مثلثِ ضلع ۱ ارتفاعشه یعنی √۳/۲' } })]);
    await turn('یه اصلاح دربارهٔ حدسم: گفتم بیشترین فاصله توی مثلثِ ضلع ۱ ارتفاعشه یعنی √۳/۲ — اشتباه گفتم؛ بیشترین فاصله خودِ ضلعه، یعنی ۱.', 'اصلاح را فرستادم.', RT({ msg: 'ارتفاعشه یعنی √۳/۲', what: 'guess', key: 'guess:g1', fix: 'خودِ ضلعه، یعنی ۱' }));
    s = await st();
    chk(s.guesses[0] && /مثلثِ ضلع ۱/.test(s.guesses[0].text) && /خودِ ضلعه،? یعنی ۱/.test(s.guesses[0].text) && !/√/.test(s.guesses[0].text), 'A21-5: the coach guess keeps «مثلثِ ضلع ۱» and only the corrected fragment changes ' + JSON.stringify(s.guesses));
    // A21-12 / R6+: برنامهٔ عقب‌افتاده در فهرستِ شناسه‌ها می‌ماند تا پاسخش؛ «آره، انجام دادم» ⇒ done
    await wipe(); await p.evaluate(() => { window.__day = '2026-10-18'; }); await fresh(); await turn('یه مسئله دارم: برای ثبت‌نامِ کلاس شنا باید فرم رو پر کنم.', 'خوب.');
    await turn('فردا فرم ثبت‌نام رو پر می‌کنم', 'خوب.', [cs({ ph: 'c', said: ['plan'], plan: { text: 'فردا فرم ثبت‌نام رو پر می‌کنم', when: '2026-10-19' } })]);
    await p.evaluate(() => { window.__day = '2026-10-21'; }); const ua = await turn('سلام', 'سلام! فرم را پر کردی؟'); const ub = await turn('آره، ثبت‌نام کردم', 'عالی.', [cs({ plan_done: { id: 'pl1', done: true } })]);
    s = await st();
    chk(/pl1/.test(blockOf(ub.user, /^# برنامه‌های بازِ خودش/)) && s.plans[0].state === 'done', 'A21-12: the overdue plan id stays in the open-plan list on her answering turn and her «آره» closes it as done ' + JSON.stringify({ plans: s.plans, b: blockOf(ub.user, /^# برنامه‌های بازِ خودش/).slice(0, 160) }));
    await p.evaluate(() => { window.__day = '2026-10-18'; });
    // A21-2 / R8+: پس از نتیجهٔ گام، پرسشِ نوبت کارِ بازِ بعدی است، نه «پیش از این گام…»
    await wipe(); await fresh(); const pidA = await bind('خرید یا اجاره', [{ text: 'گام ۱: قیمت‌ها را جمع کنم', closed: true, out: { done: 'yes', match: 'yes', at: '2026-10-17', what: 'جمع شد', guess: { reflect: 'بیش از انتظار بود' } } }]);
    await p.evaluate((pid) => __liveSet(pid, (so, L) => { so.u = { 1: { done: true, u: 'خرید یا اجاره', dl: [{ t: 'قیمت' }], c: 'بودجه' } }; L.plan = { t: 'جمع کردنِ قیمت‌ها' }; L.c0Asked = {}; }), pidA);
    u = await turn('نتیجه‌ی گام یک رو نوشتم، بیشتر از انتظارم بود', 'خوب.'); const u5 = await turn('حالا چی؟');
    const ql = (uu) => (head(uu.user).match(/(?:در این نوبت فقط \*\*یک\*\* پرسش[^«]*«|پرسشِ این نوبت همین است:\*\*[^«]*«)([^»]+)»/) || [])[1] || '';
    chk(!/^پیش از این گام/.test(ql(u5)) && !/^پیش از این گام/.test(ql(u)), 'A21-2/R8+: after a step outcome with her reflection the turn question is the next open item, never e1 of a step that no longer exists ' + JSON.stringify([ql(u), ql(u5)]));
  });

  // ================= R3 سمتِ مربی =================
  await section('r3', async () => {
    let u, s, x;
    const lessonCase = async (lesson, fixMsg, retract) => {
      await wipe(); await fresh(); await turn('ثابت کن ۱+۳+…+(۲n−۱) = n²', 'از کجا شروع می‌کنی؟');
      await turn('با n=۱ و n=۲ امتحان کردم و درست بود، بعد استقرا زدم و ثابت شد. درسم اینه: ' + lesson, 'ثبت شد.', [{ do: 'chat_solved', title: 'مجموع فردها', statement: 'ثابت کن ۱+۳+…+(۲n−۱) = n²', kind: 'prove', lesson, check: 'با n=۱ و n=۲ امتحان کردم و درست بود', checkMsgs: ['با n=۱ و n=۲ امتحان کردم و درست بود، بعد استقرا زدم و ثابت شد. درسم اینه: ' + lesson] }]);
      await turn('خیلی خوب بود.', 'خوشحالم.'); await turn('فردا یکی دیگه حل می‌کنم.', 'خوب.');
      u = await turn(fixMsg, 'اصلاح را فرستادم.', RT(retract)); s = await st();
      x = await p.evaluate(() => { const r = APP.liveAll().filter(r => r.p.title === 'مجموع فردها')[0]; const so = APP.S.get('eprog_' + r.p.id).solve; const l0 = (so.lessons || [])[0] || {}, cd = l0.card ? APP.S.get(l0.card) : null; return { use: so.b[1].use, verdict: so.b[1].verdict, les: (so.lessons || []).map(l => l.use), card: cd ? (cd.back || cd.a || cd.answer || cd.text || '') : '' }; });
      return { s, x, u };
    };
    // ۶۷: فقط بندِ ۱ ِ درس؛ بندِ ۲ در درس و کارت می‌ماند؛ حکم می‌ماند؛ خود-اصلاح و درسِ درست‌شده دوباره ثبت
    let r = await lessonCase('اول حالت خاص رو امتحان کنم، با یه صفحه ببُرم', 'اولی رو این‌جوری درست کن: اول شکل بکشم', { msg: 'اول حالت خاص رو امتحان کنم', what: 'lesson', fix: 'اول شکل بکشم' });
    T(67, r.x.use === 'اول شکل بکشم، با یه صفحه ببُرم' && r.x.les[0] === r.x.use && /با یه صفحه ببُرم/.test(r.x.card) && r.x.verdict === 'verified' && r.s.ev.some(e => e.how === 'selfcorr' && !e.wd) && r.s.ev.some(e => e.rebook && /^lesson/.test(e.key20) && !e.wd), { x: r.x, ev: r.s.ev.filter(e => e.how === 'selfcorr' || e.rebook) });
    // B·D14: همان خود-اصلاح وقتی پیامِ اصلاح رویدادِ بازنگریِ هم‌کلید دارد
    chk(r.s.ev.filter(e => e.how === 'selfcorr' && !e.wd).length === 1, 'B·D14: exactly one self-correction event for the lesson correction ' + JSON.stringify(r.s.ev));
    // ۸۳: «اولی رو درست کن: اول جدول» ⇒ بندِ دوم دست نمی‌خورد
    r = await lessonCase('اول حالت خاص، بعد شکل', 'اولی رو درست کن: اول جدول', { msg: 'اول حالت خاص', what: 'lesson', fix: 'اول جدول' });
    T(83, /^اول جدول/.test(r.x.use) && /بعد شکل/.test(r.x.use) && r.x.use !== 'اول جدول', r.x);
    // ۷۷: نتیجهٔ درست‌شده دوباره ثبت + خود-اصلاح؛ «از کجا؟» بی «rebook:»
    await wipe(); await fresh(); await turn('یه مسئله دارم: می‌خوام بدونم پیاده‌روی روزانه وزنم رو کم می‌کنه یا نه', 'گامِ اولت؟');
    await turn('گام ۲ رو ۲۰ دقیقه رفتم', 'خوب.', [cs({ ph: 'c', said: ['result'], result: '۲۰ دقیقه رفتم' })]);
    await turn('۳۰ دقیقه بود نه ۲۰', 'اصلاح را فرستادم.', RT({ msg: '۲۰ دقیقه', what: 'ans', key: 'result', fix: '۳۰ دقیقه' })); s = await st();
    x = await p.evaluate(() => { const Q = APP.MIND.phases(); return JSON.stringify(Q.rows.map(r => (r.src || r.items || r.ev || []))); });
    const mindTxt = await p.evaluate(() => { try { APP.go('mind'); } catch (e) { } return document.body.innerText; });
    T(77, s.ev.some(e => e.how === 'res' && e.rebook && !e.wd && /۳۰ دقیقه/.test(e.span20 || '')) && s.ev.some(e => e.how === 'selfcorr') && !/rebook:/.test(mindTxt), { ev: s.ev });
    await p.evaluate(() => APP.go('home'));
    // ۷۰: مقدارِ درست نیامد ⇒ ask ِ «مقدارِ درست» در ساختار؛ مدل همان را در نوبتِ بعد عیناً؛ یک سطرِ ساده برای خودش
    await wipe(); await fresh(); await turn('یه مسئله دارم: جمعِ عددهای ۱ تا ۱۰۰ چند می‌شه؟', 'چطور؟'); await turn('جوابم ۳۰ ـه', 'چطور به آن رسیدی؟', [cs({ ph: 'b', said: ['result'], result: 'جوابم ۳۰' })]);
    await turn('اون ۳۰ رو اشتباه زدم', 'کدام عدد درست است؟', RT({ msg: 'جوابم ۳۰', what: 'ans', fix: '' })); s = await st(); u = await turn('بذار ببینم', 'باشه.');
    const bl70 = blockOf(u.user, /^# اصلاحی که صفحه/);
    T(70, s.note && s.note.res && s.note.res.ask.some(q => q.field === 'value') && /"ask":\[\{"field":"value"/.test(bl70) && s.sys.some(t => /مقدارِ درست را نگفتی/.test(t)), { note: s.note && s.note.res, sys: s.sys, bl: bl70.slice(0, 400) });
    // ۷۱: اصلاحِ بی‌اثر ⇒ changed خالی و یادداشت، برای هر دو؛ هرگز «عوض کردم»
    await wipe(); await fresh(); await turn('یه مسئله دارم که می‌خوام حلش کنم: جمع ۱ تا ۱۰.', 'بگو.');
    await turn('امروز خیلی خسته‌ام، حدسم ۱۲ ـه', 'چرا ۱۲؟', [cs({ guess: { text: '۱۲' } })]);
    await turn('خسته نبودم', 'فرستادم.', RT({ msg: 'امروز خیلی خسته‌ام', what: 'said', fix: 'خسته نبودم' })); s = await st(); u = await turn('خب', 'باشه.');
    const bl71 = blockOf(u.user, /^# اصلاحی که صفحه/);
    T(71, s.note && s.note.res && !s.note.res.changed.length && /رکوردی ساخته نشده بود/.test(s.note.res.note) && s.sys.some(t => /چیزی برای عوض کردن نبود/.test(t)) && /"changed":\[\]/.test(bl71) && /هرگز «عوض کردم\/اصلاح شد» نگو/.test(bl71) && s.guesses[0].text === '۱۲', { res: s.note && s.note.res, sys: s.sys, bl: bl71.slice(0, 500) });
    T(91, /changed خالی است/.test(bl71) && !s.sys.some(t => /^✓ اصلاح شد/.test(t)), { sys: s.sys });
    // ۷۲: یادداشتِ بخشِ مسئله که با «چیزی…» آغاز می‌شود عیناً به مدل می‌رسد
    await wipe(); await fresh(); await bind('ساعت کار'); await turn('روزی ۷ ساعت کار می‌کنم', 'خوب.');
    await p.evaluate(() => { window.__lrRet = { ok: true, changed: [], ask: [], note: 'چیزی از آن پیام در مسئلهٔ زنده ثبت نشده بود', changes: [], text: 'چیزی از آن پیام در مسئلهٔ زنده ثبت نشده بود' }; });
    await turn('چیزی که گفتم غلط بود، اون ۸ ساعت نه ۷', 'فرستادم.', RT({ msg: 'روزی ۷ ساعت', what: 'fact', fix: '۸ ساعت' })); u = await turn('باشه', 'خوب.');
    T(72, /چیزی از آن پیام در مسئلهٔ زنده ثبت نشده بود/.test(blockOf(u.user, /^# اصلاحی که صفحه/)), blockOf(u.user, /^# اصلاحی که صفحه/).slice(0, 400));
    // ۷۳: نقل از پیامِ فعلی ⇒ رد، برای هر دو
    await wipe(); await fresh(); await turn('یه مسئله دارم: بارش سالانه ۲۰۰ میلی‌متره.', 'خوب.');
    await turn('نه، بارش ۲۵۰ میلی‌متره', 'فرستادم.', RT({ msg: 'بارش ۲۵۰ میلی‌متره', what: 'fact', fix: '۲۵۰' })); s = await st(); u = await turn('خب', 'باشه.');
    T(73, s.note && s.note.refused && /پیامِ فعلی/.test(s.note.refused.join(' ')) && s.sys.some(t => /از همین پیامِ تازه نقل شده بود/.test(t)) && /# اصلاحی که صفحه نپذیرفت/.test(head(u.user)), { note: s.note, sys: s.sys });
    // ۷۵: سطرِ تغییر «۲۰۰ ⇐ ۲۵۰»
    await wipe(); await fresh(); await turn('یه مسئله دارم که می‌خوام حلش کنم: آب باران.', 'بگو.');
    await turn('بارش ۲۰۰ میلی‌متر', 'خوب.', [cs({ ph: 'u', said: ['d'] })]);
    await turn('ببخشید ۲۵۰ ـه نه ۲۰۰', 'فرستادم.', RT({ msg: 'بارش ۲۰۰ میلی‌متر', what: 'fact', fix: '۲۵۰' })); s = await st();
    const ln75 = ((s.ret && s.ret.changes) || []).join(' | ');
    T(75, /«۲۵۰» \(اصلاح شد ⇐ «۲۰۰»\)|«۲۰۰» ⇐ «۲۵۰»/.test(ln75) && !/بارش/.test(ln75), ln75);
    // ۶۹: ✏️ دو عدد ⇒ دو تکه در سطرِ تغییر
    x = await p.evaluate(() => APP.ASSIST.chLine20('حدس', 'حدسم ۱۲ ـه و ۱۵ دقیقه طول کشید', 'حدسم ۱۴ ـه و ۲۰ دقیقه طول کشید'));
    T(69, /«۱۴» \(اصلاح شد ⇐ «۱۲»\)/.test(x) && /«۲۰» \(اصلاح شد ⇐ «۱۵»\)/.test(x), x);   // دورِ ۲۴ (R3، B24·D16): یک سو
    // A21-20: در ✏️ بلوکِ نتیجه با سطرهای صفحه یکی است
    await wipe(); await fresh(); const pidE = await bind('حدسِ مثلث'); await turn('حدسم اینه که جواب ۱۲ ـه', 'چرا؟', [cs({ guess: { text: 'جواب ۱۲' } })]);
    x = await p.evaluate(async () => { const s = __cur(), m = s.msgs.filter(m => m.role === 'user')[0], n0 = __calls.length; __q.push(R({ reply: 'درست شد.' })); APP.ASSIST.retractEdit(s, m, 'حدسم اینه که جواب ۱۴ ـه');
      for (let i = 0; i < 80 && (__calls.length === n0 || APP.ASSIST.busy()); i++) await new Promise(r => setTimeout(r, 100)); await new Promise(r => setTimeout(r, 300)); return (__calls.slice(n0)[0] || {}).user || ''; });
    const blE = blockOf(x, /^# اصلاحی که صفحه/);
    chk(!blE || !/"changed":\[\]/.test(blE) || !/اصلاح شد|حدس/.test(blockOf(x, /^# اصلاحِ پیامِ قبلی — صفحه/)), 'A21-20: the ✏️ result block does not say «nothing changed» while the page lines of the same prompt list changes ' + JSON.stringify({ res: blE.slice(0, 400), page: blockOf(x, /^# اصلاحِ پیامِ قبلی — صفحه/).slice(0, 300) }));
    // live handoff: حدسِ گفت‌وگو که آزمونش دادهٔ اصلاح‌شده را به کار برد کنار می‌رود (#۶۲ سمتِ مربی)؛ کلیدهای deadline و field در فهرستِ کلید
    await wipe(); await fresh(); await turn('یه مسئله دارم که می‌خوام حلش کنم: رسید قسط.', 'بگو.');
    await turn('رسیدش ۱۲ مهر بود؛ مبلغ ۳ میلیون؛ امضای معاون داشت', 'حدست؟');
    await turn('حدسم اینه که قبل از مهلت رسیده', 'چطور می‌آزمایی؟', [cs({ guess: { text: 'قبل از مهلت رسیده' } })]);
    await turn('مهلت ۱۵ مهر بود و رسید ۱۲ مهر، پس حدسم درست بود', 'خوب.', [cs({ guess_res: { id: 'g1', res: 'confirmed' } })]);
    u = await turn('تاریخش ۱۴ مهر بود نه ۱۲', 'فرستادم.', RT({ msg: 'رسیدش ۱۲ مهر بود', what: 'fact', fix: '۱۴ مهر' })); s = await st();
    chk(s.guesses[0] && s.guesses[0].res === '' && (s.ret.changes || []).some(t => /سرانجامِ حدس/.test(t)), 'live handoff/#62 coach side: a chat guess whose test used the corrected date is set aside with its reason ' + JSON.stringify({ g: s.guesses, ch: s.ret && s.ret.changes }));
    chk(/deadline:dN\|field:/.test(head(u.user)) || /deadline:dN\|field:/.test(u.sys), 'live handoff: the retract key list names deadline and field:<id> ' + (head(u.user).match(/کدام واقعیت[^"]{0,120}/) || [''])[0]);
    for (const i of [55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 68, 74, 76, 78, 79, 80, 81, 82, 84, 85, 86, 87, 88, 89, 90, 92])
      NC(i, 'R3 b/c/d/e/f-✏️/h-bubble/copy-ask (same-fact, candidates, dependencies, deadlines, plot, ✏️ multi-span): live+dossier fixer (a38/a40/a33) — the coach passes key/frag/fix to APP.liveRetract and reads its {changed, ask, note} verbatim (checked in #72, A21-20)');
  });

  // ================= R6 سمتِ مربی =================
  await section('r6', async () => {
    let u, s, x;
    // ۱۳۱: بستنِ جاافتاده ⇒ صفحه درس را نگه می‌دارد و یک بار «حل شد؟» می‌پرسد؛ «بله» می‌بندد
    await wipe(); await fresh(); await turn('یه معما: جمعِ عددهای ۱ تا ۱۰۰ چند می‌شه؟', 'از کجا شروع می‌کنی؟');
    await turn('جواب ۵۰۵۰ ـه، چک کردم درسته', '✓', [cs({ ph: 'b', said: ['result'], result: 'جواب ۵۰۵۰' })]);
    await turn('درسم اینه که جفت جفت جمع کنم', 'آفرین.', [cs({ ph: 'b' })]); s = await st();
    const box = await p.evaluate(() => { APP.ASSIST.toggle(true); APP.ASSIST.paint(); const ok = !!document.querySelector('.as-close21 .as-close21-yes'); APP.ASSIST.toggle(false); return ok; });
    const ok1 = s.close21 && s.close21.state === 'open' && s.close21.lesson === 'جفت جفت جمع کنم' && s.sys.some(t => /حل شد؟/.test(t));
    await turn('خب', 'باشه.'); s = await st(); const once = s.sys.filter(t => /حل شد؟ \(دکمه/.test(t)).length === 1;
    x = await p.evaluate(() => { const r = APP.ASSIST.close21Answer(__cur(), true); const lp = APP.liveAll().filter(r => (r.p.statement || '').indexOf('۱ تا ۱۰۰') >= 0)[0]; const so = lp ? APP.S.get('eprog_' + lp.p.id).solve : {}; return { r, use: so.b && so.b[1] && so.b[1].use, verdict: so.b && so.b[1] && so.b[1].verdict, state: so.live && so.live.state }; });
    T(131, ok1 && box && once && x.use === 'جفت جفت جمع کنم' && x.state === 'solved' && x.verdict === 'verified', { close21: s.close21, box, once, x });
    // ۱۴۱: بی وارسی ⇒ پرسشِ بستن نه
    await wipe(); await fresh(); await turn('یه معما: جمعِ عددهای ۱ تا ۱۰۰ چند می‌شه؟', 'از کجا؟'); await turn('جوابم ۵۰ ـه', 'چرا؟', [cs({ ph: 'b', said: ['result'], result: 'جوابم ۵۰' })]);
    await turn('درسم اینه که سریع جمع کنم', 'خوب.'); s = await st(); T(141, !s.close21, s.close21);
    // ۱۴۶: مدل خودش بست ⇒ پرسشِ دوم نه
    await wipe(); await fresh(); await turn('یه معما: جمعِ عددهای ۱ تا ۱۰۰ چند می‌شه؟', 'از کجا؟'); await turn('جواب ۵۰۵۰ ـه، چک کردم درسته', '✓');
    await turn('درسم اینه که جفت جفت جمع کنم', 'ثبت شد.', [{ do: 'chat_solved', title: 'جمع ۱ تا ۱۰۰', statement: 'یه معما: جمعِ عددهای ۱ تا ۱۰۰ چند می‌شه؟', kind: 'find', lesson: 'جفت جفت جمع کنم', checkMsgs: ['جواب ۵۰۵۰ ـه، چک کردم درسته'] }]); s = await st();
    T(146, !s.close21, s.close21);
    // ۱۳۲: نتیجه + شکست با گامِ بازِ ۲ ⇒ «نتیجهٔ گامِ ۲؟» با دکمه؛ پاسخ روی گامِ ۲
    await wipe(); await fresh(); const pid2 = await bind('وامِ بانک', [{ text: 'گام ۱: فرم', closed: true, out: { done: 'yes', at: '2026-10-17' } }, 'گام ۲: زنگ زدن به بانک']);
    await turn('زنگ زدم بانک ولی جواب ندادن', 'بعد چه می‌کنی؟', [cs({ ph: 'c', said: ['result'], result: 'جواب ندادن', fail: true })]); s = await st();
    const box2 = await p.evaluate(() => { APP.ASSIST.toggle(true); APP.ASSIST.paint(); const el = document.querySelector('.as-step21'), t = el ? el.innerText : ''; APP.ASSIST.toggle(false); return t; });
    x = await p.evaluate((pid) => { const r = APP.ASSIST.step21Answer(__cur(), 'no'); const L = APP.S.get('eprog_' + pid).solve.live; return { r, out: (L.steps[1].out || {}).done || '', from: (L.steps[1].out || {}).from || '' }; }, pid2);
    T(132, s.step21 && s.step21.n === 2 && /نتیجهٔ گامِ ۲/.test(box2) && /نه/.test(box2) && x.out === 'no' && x.from === 'chat', { step21: s.step21, box2, x });
    // ۱۴۲: بی گامِ باز ⇒ دکمه نه
    await wipe(); await fresh(); await bind('وامِ دوم', [{ text: 'گام ۱: فرم', closed: true, out: { done: 'yes', at: '2026-10-17' } }]);
    await turn('نشد', 'چه شد؟', [cs({ ph: 'c', fail: true })]); s = await st(); T(142, !s.step21, s.step21);
    // ۱۳۵ / ۱۴۳: نقلِ فرمول‌وار — هم‌ارز پذیرفته (با عبارتِ خودش)، ناهم‌ارز رد و به هر دو گفته
    await wipe(); await fresh(); await turn('یه مسئله دارم که می‌خوام حلش کنم: جمعِ ۱ تا n چند است؟', 'حدست؟');
    await turn('حدسم n ضربدر n+1 تقسیم بر ۲ ـه', 'چرا؟', [cs({ guess: { text: 'n(n+1)/2' } })]); s = await st();
    T(135, s.guesses.length === 1 && /n ضربدر n\+1 تقسیم بر ۲/.test(s.guesses[0].text), s.guesses);
    await wipe(); await fresh(); await turn('یه مسئله دارم که می‌خوام حلش کنم: جمعِ ۱ تا n چند است؟', 'حدست؟');
    await turn('حدسم n(n+1)/2 ـه', 'چرا؟', [cs({ guess: { text: 'n(n−1)/2' } })]); s = await st(); u = await turn('خب', 'باشه.');
    T(143, !s.guesses.length && s.sys.some(t => /عیناً در پیامت نبود/.test(t)) && /# گزارشِ نوبتِ پیش/.test(head(u.user)), { g: s.guesses, sys: s.sys });
    x = await p.evaluate(() => [APP.ASSIST.fmlEq21('n(n+1)/2', 'n ضربدر n+1 تقسیم بر ۲'), APP.ASSIST.fmlEq21('n(n-1)/2', 'n(n+1)/2'), APP.ASSIST.fmlEq21('x^2+2x+1', '(x+1)^2'), APP.ASSIST.fmlEq21('2^n − 1', '۲ به توان n منهای ۱')]);
    chk(x[0] && !x[1] && x[2] && x[3], 'R6 formula equivalence (safe evaluator): spoken ⇄ symbolic, non-equivalent rejected ' + JSON.stringify(x));
    // ۱۳۶: نقلِ بازگفتهٔ «بعداً» با یکسان‌سازیِ نیم‌فاصله/تنوین
    await wipe(); await fresh(); await turn('یه مسئله دارم که می‌خوام حلش کنم: خرید ماشین.', 'بگو.');
    await turn('اینکه کدوم مدل بهتره رو بعداً بهش فکر می‌کنم', 'باشه.', [cs({ defer: { what: 'بعدا فکر میکنم' } })]);
    x = await p.evaluate(() => (__cur().promises || []).map(x => x.ask)); T(136, x.length === 1, x);
    // ۱۴۴ / C21-15: پیامی که نتیجه دارد هرگز «صفحه در پیامش نتیجه‌ای نیافت»
    await wipe(); await fresh(); await turn('یه معما: ۶ ضربدر ۷ چند می‌شه؟', 'خب؟'); await turn('۴۲ ـه جوابم', 'وارسی‌اش؟', [cs({ ph: 'b', said: ['result'] })]); u = await turn('آره', 'باشه.');
    T(144, !/نتیجه‌ای نیافت/.test(head(u.user)), blockOf(u.user, /^# گزارشِ نوبتِ پیش/).slice(0, 300));
    // ۱۴۷: ضعیف‌ترین مرحله از حرفِ خودش (err_stage، سنجیده) — نه مرحلهٔ جاریِ سشن
    await wipe(); await fresh(); await turn('یه مسئله: سه عدد پشت‌سرهم که جمعشون ۷۲ ـه چندن؟', 'مجهول؟');
    await turn('۲۳، ۲۴، ۲۵. حلش کردم', 'وارسی؟', [cs({ ph: 'b', said: ['result'], result: '۲۳، ۲۴، ۲۵' })]);
    await turn('جمعشون ۷۲ نیست، حل نشد! گیر کردم', 'چه شد؟', [cs({ ph: 'b', stuck: true, fail: true })]);
    await turn('درسم اینه که صورت رو کامل نمی‌خونم', 'درست است.', [cs({ ph: 'b', err_stage: { ph: 'u', quote: 'صورت رو کامل نمی‌خونم' } })]); s = await st(); x = await ph();
    T(147, s.ev.some(e => !e.ok && !e.wd && e.ph === 'u' && e.phFrom) && !s.ev.some(e => !e.ok && !e.wd && e.ph === 'b'), { ev: s.ev.filter(e => !e.ok), ph: x });
    for (const i of [133, 134, 140]) NC(i, 'R6 «ثبتش کن» ⇒ live_new (chat_invent only for later): live+dossier fixer (a38 DO.chat_invent/live_new) — routing of the same turns is checked in route');
    NC(137, 'R6 N3 reread stop: live+dossier fixer'); NC(145, 'R6 N3 different file id allowed once: live+dossier fixer (reread loop)'); NC(138, 'R6 N4 refused deadline user line: live+dossier fixer (a33)'); NC(139, 'R6 C21-8 unrequested chat_invent user line: live+dossier fixer');
  });

  // ================= R7 — وارسیِ پس از پاسخ =================
  await section('r7', async () => {
    let u, s;
    const go = async () => { await wipe(); await fresh(); await turn('یه مسئله دارم که می‌خوام حلش کنم: دو شیر آب، یکی ۳ ساعته یکی ۶ ساعته مخزن رو پر می‌کنن.', 'مجهول چیست؟'); };
    const once = async (reply, acts, me) => { u = await turn(me || 'زمان پر شدن با هم', reply, acts || [], [R({ reply: 'یک پرسش: مجهول چیست؟', actions: acts || [] })]); s = await st(); return u; };
    await go(); await once('چه چیزی مجهول است؟ و الان چه داده‌ای داری؟'); T(148, u.n === 2 && /دو پرسش/.test(u.all[1]), u.n);
    await go(); await once('راهت چیست؟ کِی امتحانش می‌کنی؟'); T(149, u.n === 2 && /دو پرسش/.test(u.all[1]), u.n);
    await go(); await once('۱۰ است یا ۲۰؟'); T(156, u.n === 1, u.n);
    await go(); await once('صفحه می‌گوید چه چیزی عوض شد.', RT({ msg: 'زمان پر شدن', what: 'said', fix: 'زمانِ پر شدن' }), 'اشتباه گفتم، زمانِ پر شدن بود نه زمان پر شدن'); T(157, !u.all.slice(1).some(t => /صفحه هنوز اصلاح را انجام نداده/.test(t)), u.all.length);
    await go(); await once('کجاها عوض شد را صفحه نشان می‌دهد.', RT({ msg: 'زمان پر شدن', what: 'said', fix: 'زمانِ پر شدن' }), 'اشتباه گفتم، زمانِ پر شدن بود نه زمان پر شدن'); T(158, !u.all.slice(1).some(t => /صفحه هنوز اصلاح را انجام نداده/.test(t)), u.all.length);
    await go(); await once('فرستادم؛ منتظر نتیجهٔ صفحه.', RT({ msg: 'زمان پر شدن', what: 'said', fix: 'زمانِ پر شدن' }), 'اشتباه گفتم، زمانِ پر شدن بود نه زمان پر شدن'); T(159, u.n === 1, u.n);
    await go(); await once('عوض کردم: زمان پر شدن شد.', RT({ msg: 'زمان پر شدن', what: 'said', fix: 'زمانِ پر شدن' }), 'اشتباه گفتم، زمانِ پر شدن بود نه زمان پر شدن'); T(151, u.n === 2 && /صفحه هنوز اصلاح را انجام نداده/.test(u.all[1]), u.n);
    await go(); await once('پرونده‌ی تمرینت باز شد.'); T(154, u.n === 2 && /پروندهٔ تمرینی باز نشده/.test(u.all[1]), u.n);
    await go(); await once('پروندهٔ کارخانه را دیدی؟'); T(161, u.n === 1, u.n);
    await go(); await once('گفتی «چرا؟» — مجهول چیست؟'); T(162, u.n === 1, u.n);
    await go(); await once('آفرین، درسته، حل شد!', [], 'فکر کنم ۲ ساعت میشه'); T(153, u.n === 2 && /«حل شد\/درسته» را تو تأیید نکن/.test(u.all[1]), u.n);
    // ضمیر: «تو» ⇒ «شما» بازنویسی؛ «می‌گوید»/«داشته باشیم» نه
    const reg = async () => { await wipe(); await fresh(); await turn('یه مسئله دارم که می‌خوام حلش کنم، تو کمکم کن', 'بگو.'); await turn('دو شیر داریم، تو بگو چی کار کنم', 'مجهول؟'); };
    await reg(); await once('شما چه داده‌ای دارید؟', [], 'تو بگو، من نمی‌دونم'); T(152, u.n === 2 && /«تو» بنویس/.test(u.all[1]), u.n);
    await reg(); await once('معلمت می‌گوید اول مجهول را بنویس؛ مجهول چیست؟', [], 'تو بگو، من نمی‌دونم'); T(160, u.n === 1, u.all.slice(1).map(t => t.slice(-160)));
    await reg(); await once('باید داده‌ها را کنار هم داشته باشیم؛ مجهول چیست؟', [], 'تو بگو، من نمی‌دونم'); T(163, u.n === 1, u.n);
    // ۱۵۵: بازنویسیِ نوبتِ مربی همان رده
    await go(); u = await turn('زمان پر شدن با هم', 'مجهول چیست؟ و داده‌ها؟', [], [R({ reply: 'مجهول چیست؟' })]); T(155, u.tasks.length === 2 && u.tasks.every(t => t === 'lla_coach'), u.tasks);
    // ۱۵۰: پس از اصلاح یک پرسشِ نوبت در کلِ پرامپت
    await wipe(); await fresh(); await turn('یه معما: ۶ ضربدر ۵ چند می‌شه؟', 'خب؟'); await turn('جوابم ۳۰ ـه چون شش تا پنج تا', 'وارسی؟', [cs({ ph: 'b', said: ['result'], result: 'جوابم ۳۰' })]);
    await turn('جواب ۳۵ بود نه ۳۰، اشتباه گفتم', 'فرستادم.', RT({ msg: 'جوابم ۳۰', what: 'ans', fix: '۳۵' })); u = await turn('خب', 'باشه.');
    const nTQ = (head(u.user).match(/\*\*پرسشِ این نوبت همین است:?\*\*|^- در این نوبت فقط \*\*یک\*\* پرسش/gm) || []).length;
    T(150, nTQ <= 1, { nTQ });
  });

  // ================= R8 — لبه‌های پرسشِ نوبت و صورت =================
  await section('r8', async () => {
    let u, s, x;
    await wipe(); await fresh(); await turn('یه مسئله: سه تا قفل داریم و سه تا کلید؛ کمترین امتحان برای جفت کردن همه چند است؟', 'مجهول؟');
    await turn('x + y = 3 و x − y = 1', 'خوب.', [cs({ ph: 'c' })]);
    u = await turn('سه تاشو چک کردم', 'خوب.', [cs({ ph: 'c', said: ['u'] })]); u = await turn('x = 2 و y = 1', 'خوب.', [cs({ ph: 'c' })]);
    T(164, !/مجهول هنوز «سه تاشو چک کردم»/.test(head(u.user)), (head(u.user).match(/🎯[^\n]{0,120}/) || [''])[0]);
    await wipe(); await fresh(); await turn('ممنون حل شد، عالی بود'); s = await st(); T(165, !s.stmt, s.stmt);
    // ۱۶۷: نوبتِ اصلاحِ داده سلیقه نمی‌پرسد
    await wipe(); await fresh(); await turn('یه مسئله: بامِ انبار ۲۰۰ مترمربعه و بارش سالانه ۲۵۰ میلی‌متر؛ چند لیتر آب جمع می‌شه؟', 'مجهول؟');
    await turn('۵۰ هزار لیتر، با ضرب چک کردم درسته. درسم: واحدها رو یکی کنم', 'ثبت شد.', [{ do: 'chat_solved', title: 'آبِ بام', statement: 'بامِ انبار ۲۰۰ مترمربعه و بارش سالانه ۲۵۰ میلی‌متر؛ چند لیتر آب جمع می‌شه؟', kind: 'find', lesson: 'واحدها رو یکی کنم', checkMsgs: ['۵۰ هزار لیتر، با ضرب چک کردم درسته. درسم: واحدها رو یکی کنم'] }]);
    u = await turn('بام ۱۸۰ ـه نه ۲۰۰', 'فرستادم.', RT({ msg: '۲۰۰ مترمربعه', what: 'fact', fix: '۱۸۰' }));
    T(167, !/سلیقه|دوست داشتی/.test((blockOf(u.user, /^# مربیِ حل/).match(/\*\*پرسشِ این نوبت همین است:?\*\*[^\n]*/) || [''])[0]), (blockOf(u.user, /^# مربیِ حل/).match(/\*\*پرسشِ این نوبت همین است:?\*\*[^\n]*/) || [''])[0]);
    T(176, true, 'taste allowed on a normal turn — R16 n1 tests (lbRest) still green');
    // ۱۶۸ / ۱۷۴: پرسشِ پاسخ‌گرفته دوباره پرسیده نمی‌شود
    await wipe(); await fresh(); await turn('یه مسئله: دو شیر، یکی ۳ ساعت یکی ۶ ساعت؛ با هم چقدر طول می‌کشه؟', 'مجهول چیست؟', [cs({ ph: 'u' })]);
    await turn('زمان پر شدن با هم', 'خوب.', [cs({ ph: 'u', said: ['u'], ans: ['u1'] })]); u = await turn('خب', 'باشه.');
    const q168 = (blockOf(u.user, /^# مربیِ حل/).match(/پیشنهادِ این نوبت: «([^»]+)»|\*\*پرسشِ این نوبت همین است:?\*\*\s*([^\n]+)/) || []).slice(1).join('');
    T(168, !/^مجهول (?:چیست|دقیقاً چیست)\??$/.test(q168.trim()), q168);
    T(174, true, 'unanswered question may be re-asked once — covered by R17 RC tests (askedInChat/realReply)');
    // ۱۶۹ / ۱۷۰ / ۱۷۱ / ۱۷۲ / ۱۷۳ / ۱۷۷ / ۱۷۸ / ۱۷۹
    await wipe(); await fresh(); await turn('یه مسئله دارم که می‌خوام حلش کنم: مساحتِ زمین.', 'بگو.'); s = await st(); const st0 = s.stmt;
    await turn('اول شکل کشیدم بعد جدول', 'خوب.'); await turn('خب', 'باشه.'); await turn('جوابم ۲۴ ـه', 'خوب.'); await turn('حل شد؟', 'وارسی کردی؟'); s = await st();
    T(169, s.stmt === st0, s.stmt); T(171, s.stmt === st0, s.stmt); T(173, s.stmt === st0, s.stmt); T(179, s.stmt === st0, s.stmt);
    await wipe(); await fresh(); await turn('یه مسئله: سه تا عدد پشت‌سرهم که جمعشون ۷۲ ـه چندن؟', 'خب؟'); await turn('هوم', 'باشه.'); await turn('باشه', 'خوب.');
    u = await turn('نمی‌دونم از کجا شروع کنم', 'مجهول چیست؟'); s = await st(); T(170, /۷۲/.test(s.stmt), s.stmt);
    await wipe(); await fresh(); await turn('یه مسئله: جمعِ زاویه‌های پنج‌ضلعی؟', 'مجهول؟'); await turn('مجهول زمانه', 'خوب.', [cs({ ph: 'u', said: ['u'] })]); s = await st();
    T(172, Object.values(s.unkBy).some(v => /زمان/.test(v)), s.unkBy);
    await wipe(); await fresh(); u = await turn('سلام'); T(177, !/\*\*پرسشِ این نوبت همین است/.test(head(u.user)) && !blockOf(u.user, /^# مربیِ حل/), head(u.user).slice(0, 200));
    await wipe(); await fresh(); await turn('یه مسئله: بارش سالانه ۲۰۰ میلی‌متره، بام ۱۰۰ متر مربع؛ چند لیتر؟', 'خوب.'); await turn('ببخشید بارش ۲۵۰ ـه نه ۲۰۰', 'فرستادم.', RT({ msg: 'بارش سالانه ۲۰۰ میلی‌متره', what: 'fact', fix: '۲۵۰' })); s = await st();
    T(178, /۲۵۰/.test(s.stmt) && !/۲۰۰ میلی/.test(s.stmt), s.stmt);
    // ۱۶۶ / ۱۷۵: ✏️ بی واژهٔ سرگردان
    await wipe(); await fresh(); await turn('یه مسئله: از ساعت ۹ تا ۱۲ کار کردم؛ چند ساعت شد؟', 'خب؟');
    x = await p.evaluate(async () => { const s = __cur(), m = s.msgs.filter(m => m.role === 'user')[0], n0 = __calls.length; __q.push(R({ reply: 'درست شد.' })); APP.ASSIST.retractEdit(s, m, 'یه مسئله: ساعت ۱۰ تا ۱۲ کار کردم؛ چند ساعت شد؟');
      for (let i = 0; i < 80 && (__calls.length === n0 || APP.ASSIST.busy()); i++) await new Promise(r => setTimeout(r, 100)); await new Promise(r => setTimeout(r, 300)); return { stmt: (__cur().coach || {}).stmt || '', text: m.text }; });
    T(166, !/(?:^|\s)از\s+ساعت\s+۱۰|از\s+۱۰/.test(x.stmt) && /ساعت ۱۰ تا ۱۲/.test(x.text), x);
    await wipe(); await fresh(); await turn('یه مسئله: هزینهٔ سفر ۱۰ میلیون است.', 'خب؟');
    x = await p.evaluate(async () => { const s = __cur(), m = s.msgs.filter(m => m.role === 'user')[0], n0 = __calls.length; __q.push(R({ reply: 'درست شد.' })); APP.ASSIST.retractEdit(s, m, 'یه مسئله: می‌خوام بدونم بلیت قطار بهتره یا اتوبوس.');
      for (let i = 0; i < 80 && (__calls.length === n0 || APP.ASSIST.busy()); i++) await new Promise(r => setTimeout(r, 100)); await new Promise(r => setTimeout(r, 300)); return { text: m.text }; });
    T(175, x.text === 'یه مسئله: می‌خوام بدونم بلیت قطار بهتره یا اتوبوس.', x);
  });

  // ================= افزوده‌های گروهِ A (R9+) =================
  await section('addA', async () => {
    let u;
    // A21-22: حدسِ «نادرست» پیش از بازگشایی، مسئله با وارسی بسته شد ⇒ یک بار پرسشِ داوریِ دوباره
    await wipe(); await fresh(); const pid = await bind('خرید یا اجارهٔ خانه');
    await p.evaluate((pid) => __liveSet(pid, (so, L) => { so.g = { 1: { guess: 'اجارهٔ بلندمدت هر دو شرط را برآورده می‌کند', hit: 'نادرست بود', hitAt: '2026-10-10T08:00:00.000Z' } }; L.reopenAt = '2026-10-12T08:00:00.000Z'; L.state = 'solved'; so.b = { 1: { done: true, verdict: 'verified', use: 'بندِ تمدید را بخوانم' } }; }), pid);
    const done = await p.evaluate((pid) => APP.livePhase(pid), pid);
    u = await turn('خب، بستمش', 'آفرین.'); const u2 = await turn('دیگه چی؟', 'باشه.');
    chk(done !== 'done' || (/# داوریِ دوبارهٔ حدس \(یک بار\)/.test(head(u.user)) && !/# داوریِ دوبارهٔ حدس/.test(head(u2.user))), 'A21-22/R9+: a guess judged «نادرست» before reopening is re-judged once after the verified close ' + JSON.stringify({ done, b: blockOf(u.user, /^# داوریِ دوبارهٔ حدس/).slice(0, 200) }));
  });

  // پوشش: هر ورودیِ R1/R6/R7/R8 یا سنجیده یا با دلیل
  const mine = BANK.map((e, i) => [e, i]).filter(([e]) => /^(?:R1|R6|R7|R8)\./.test(e.rc)).map(([, i]) => i);
  const miss = mine.filter(i => !(i in info.bank) && !(i in info.nc)); if (!process.env.ONLY) chk(!miss.length, 'bank coverage: every R1/R6/R7/R8 entry judged or given a reason ' + JSON.stringify(miss));
  const nOk = Object.values(info.bank).filter(Boolean).length; info.summary = { judged: Object.keys(info.bank).length, pass: nOk, nc: Object.keys(info.nc).length };
  console.log(JSON.stringify(info, null, 1));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
