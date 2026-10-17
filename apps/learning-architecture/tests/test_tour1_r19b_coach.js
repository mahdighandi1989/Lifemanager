// تورِ پولیا (دستهٔ ۱، دورِ ۱۹b — زیرساختِ پیش از دورِ ۲۰، سهمِ «coach» — ۲۰۲۶-۱۰-۱۷) — DECISIONS_R19b: INF15 (سمتِ مدل) و INF17.
//  inf15   اصلاحِ پیامِ پیشین: coach_state.retract {msg, what, fix} سنجیده ⇒ هر رکوردِ لایهٔ مربی که از آن پیام آمد برمی‌گردد و درست می‌نشیند
//          (حدس، برنامه + موعد + یادآور، قول، شاهدِ پاسخ، فرمی که کنشِ دستیار پر کرد، رویدادهای کارنامه)؛ تاریخچه «اصلاح شد ⇐»؛ هیچ چیز پاک نمی‌شود؛
//          رکوردهای مسئلهٔ زنده با APP.liveRetract (سمتِ live — اگر نیست، فقط در آزمون جاسوس/جانشین)؛ خود-اصلاح = بازنگری (+)، هرگز شکست؛
//          زمینهٔ نوبتِ بعد دقیقاً می‌گوید چه عوض شد؛ پشتیبانِ بی‌گزارش فقط «کدام را اصلاح کنم؟» می‌پرسد.
//  bank15  همهٔ موردهای INF15.retract ِ بانکِ مستقل (tests/variants/VARIANTS_R19b.json)
//  inf17   «از کجا؟» ِ هر سطرِ مرحله و بُعد در کارنامه: کارها با منبع، تاریخ، +/−، پیوند به «📜 پرونده»؛ هر کار یک بار؛ کارِ پس‌گرفته بیرون
//  bank17  همهٔ موردهای INF17.trace ِ بانکِ مستقل
//  strict  کنترل: یک پرسشِ نوبت در هر بلوک
// LLA_FILE = ساختِ دیگر؛ ONLY=inf15,bank15 …
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
/* بانک: کنارِ همین آزمون، یا (اجرای دروازهٔ pytest از کپیِ موقت) کنارِ منبعِ واقعی از راهِ پیوندِ src */
const BANK = JSON.parse(require('fs').readFileSync(process.env.LLA_VARIANTS || [require('path').join(__dirname, 'variants', 'VARIANTS_R19b.json'), (() => { try { return require('path').join(require('fs').realpathSync(require('path').join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R19b.json'); } catch (e) { return ''; } })()].find(f => f && require('fs').existsSync(f)), 'utf8'));

const SKIP = /^# (?:سشن|گفت‌وگو تا این لحظه|نوبتِ تازه|صفحهٔ فعلی|امروز|نقشهٔ سامانه|برگه‌های بازِ|پیام‌های اخیرِ صفحه|متنِ فایل‌ها|کارنامهٔ ذهن|مسئلهٔ زندهٔ این سشن)/;
const isTurnLine = (l) => /\*\*پرسشِ این نوبت همین است:?\*\*/.test(l) || /^- پرسش‌های «/.test(l) || /^- در این نوبت فقط \*\*یک\*\* پرسش/.test(l);
const isCtxLine = (l) => /^- زمینه \(نه پرسشِ دوم\)/.test(l) || /^- \(زمینه، نه پرسشِ دوم/.test(l);
const ASK = /(?:^|[^آ-ی])بپرس(?![آ-ی])/;
const ENDQ = /[؟?][»"')\].\s*]*$/;
function strictScan(user) {
  const head = String(user || '').split('# نوبتِ تازه')[0], bad = [];
  for (const bl of head.split(/\n(?=# )/)) {
    const h = bl.split('\n')[0]; if (!/^# /.test(h) || SKIP.test(h)) continue;
    const blockCtx = /\n- \(زمینه، نه پرسشِ دوم/.test(bl);
    for (const l of bl.split('\n')) {
      if (isTurnLine(l)) continue;
      const nq = l.replace(/«[^»]*»/g, '«»');
      if (ASK.test(nq)) bad.push('ASK  [' + h.slice(0, 30) + '] ' + l.slice(0, 160));
      else if (ENDQ.test(l.trim()) && !isCtxLine(l) && !blockCtx) bad.push('ENDQ [' + h.slice(0, 30) + '] ' + l.slice(0, 160));
    }
  }
  return bad;
}

(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
  const T0 = '2026-10-17';
  const setup = async () => {
    await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
    await p.evaluate(T0 => {
      APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0; window.__noNav = true;
      APP.today = () => window.__day;
      APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
        remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
      APP.callAI = async (sys, user, opts) => {
        __calls.push({ sys, user: String(user || '') }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
        const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
        const text = typeof t === 'string' ? t : JSON.stringify(t);
        return opts && opts.withMeta ? { text, files: [] } : text;
      };
      /* سمتِ live (a38) در موازی APP.liveRetract را می‌سازد؛ این‌جا فقط جاسوس است — اگر نیست، جانشینِ آزمون (فقط در آزمون) که چیزی را عوض نمی‌کند */
      window.__lr = []; window.__lrNative = typeof APP.liveRetract === 'function'; const orig = APP.liveRetract;
      APP.liveRetract = function (pid, id, o) { __lr.push({ pid, id, o }); return orig ? orig.apply(this, arguments) : '✓ (جانشینِ آزمون) رکوردهای مسئلهٔ زنده'; };
      window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
      window.__turn = async (text, reply, actions) => {
        const n0 = __calls.length; __q.push(R({ reply: reply || 'باشه.', actions: actions || [] }));
        await APP.ASSIST.send(text); __q.length = 0;
        const c = __calls.slice(n0).filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {};
        return { sys: c.sys || '', user: c.user || '' };
      };
      window.__fresh = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; __lr.length = 0; return s.id; };
      window.__cur = () => APP.ASSIST.cur();
      window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'kitem', 'pbitem', 'wchain', 'case'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
      window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
      window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {};
        ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L); APP.S.put(pg); };
      window.__uid = (n) => { const U = (__cur().msgs || []).filter(m => m.role === 'user' && !/^\[سامانه/.test(m.text)); return (APP.ASSIST.msgId ? APP.ASSIST.msgId(U[n - 1]) : U[n - 1] && 'u' + U[n - 1].seq); };
      /* فرمی که کنشِ دستیار در نوبتِ n پر کرد (دفترِ s.fills) — برای موردهایی که فرمش در صفحهٔ دیگری است */
      window.__fill = (n, label, val, view) => { const s = __cur(); s.fills = s.fills || []; const U = (s.msgs || []).filter(m => m.role === 'user' && !/^\[سامانه/.test(m.text)); s.fills.push({ src: (APP.ASSIST.msgId ? APP.ASSIST.msgId(U[n - 1]) : U[n - 1] && 'u' + U[n - 1].seq), at: new Date().toISOString(), view: view || 'lprob', arg: 'zz', sig: label, label, old: '', val }); APP.S.put(s); };
      window.__st = () => { const s = __cur(), C = s.coach || {}; return { guesses: (C.guesses || []).map(g => ({ id: g.id, text: g.text, corr: g.corr || null, src: g.src })), guess: C.guess ? { text: C.guess.text } : null,
        plans: (s.plans || []).map(q => ({ id: q.id, text: q.text, when: q.when, state: q.state, corr: q.corr || null, src: q.src })), fills: (s.fills || []).map(f => ({ label: f.label, val: f.val, pending: f.pending || null, corr: f.corr || null })),
        promises: (s.promises || []).map(x => ({ id: x.id, ask: x.ask, done: x.done, corr: x.corr || null })), ev: (s.coachEv || []).map(e => ({ ph: e.ph, ok: e.ok, src: e.src, how: e.how || '', msg: e.msg || '', wd: !!e.wd, pend: !!e.pend, act: e.act || '', pid: e.pid || '' })),
        ret: (C.retracts || []).slice(-1)[0] || null, nRet: (C.retracts || []).length, note: C.retNote || null, lr: __lr.map(x => ({ pid: x.pid, id: x.id, what: x.o.what, fix: x.o.fix, n: x.o.n })), stmt: C.stmt || '', sys: (s.msgs || []).filter(m => m.role === 'sys').map(m => m.text) }; };
    }, T0);
  };
  await setup();
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const lines = (u) => head(u).split('\n');
  const strictAll = [];
  const turn = async (text, reply, actions) => { const u = await p.evaluate(([t, r, a]) => __turn(t, r, a), [text, reply || '', actions || []]); strictAll.push([String(text).slice(0, 24), strictScan(u.user)]); return u; };
  const fresh = () => p.evaluate(() => __fresh());
  const wipe = () => p.evaluate(() => __wipe());
  const st = () => p.evaluate(() => __st());
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const bind = async (title, steps) => { const pid = await p.evaluate(([t, steps]) => { const pid = __live(t); APP.liveBindSession(pid, __cur()); __liveSet(pid, (so, L) => { (steps || []).forEach((x, i) => L.steps.push({ id: 's' + (i + 1), at: new Date().toISOString(), text: x, pred: 'شاید', due: '2026-10-16' })); }); return pid; }, [title, steps || []]); return pid; };
  const hasNote = (c) => Array.isArray(c) && c.length && /^اصلاح شد ⇐/.test(c[c.length - 1].note || '');
  const blockOf = (u, re) => head(u).split(/\n(?=# )/).filter(bl => re.test(bl.split('\n')[0]))[0] || '';
  /* اجرای مکالمهٔ «U: … ‖ A: …»: پیش‌کنش‌ها (pre[i] = کنش‌های پاسخِ نوبتِ iامِ کاربر، ۱‌پایه)؛ نوبتِ آخر با last */
  const play = async (text, pre, last, hook) => {
    const parts = text.split('‖').map(x => x.trim()); const U = []; for (let i = 0; i < parts.length; i++) { const m = /^U:\s*([\s\S]*)$/.exec(parts[i]); if (m) U.push([m[1], parts[i + 1] && /^A:/.test(parts[i + 1]) ? parts[i + 1].replace(/^A:\s*/, '').replace(/^\[[^\]]*\]\s*/, '') : 'باشه.']); }
    let u = null;
    for (let i = 0; i < U.length; i++) { const isLast = i === U.length - 1; if (hook && isLast) await hook(); u = await turn(U[i][0], isLast ? 'باشه؛ درستش کردم.' : U[i][1], isLast ? (last || []) : ((pre || {})[i + 1] || [])); }
    return u;
  };

  // ================= inf15 (جمله‌های DECISIONS_R19b) =================
  await section('inf15', async () => {
    let s, u, x;
    // ۱) حدسِ یک نوبت پیش: حدس اصلاح، تاریخچه، رویدادِ پیام پس گرفته، خود-اصلاح = بازنگری (+)، زمینهٔ نوبتِ بعد، سطرِ «✓ اصلاح شد»
    await wipe(); await fresh(); const pid = await bind('توان‌های دو');
    await turn('حدسم اینه که جواب ۲^n هست', 'چرا این حدس؟', [cs({ ph: 'u', said: ['u'], guess: { text: '۲^n' } })]);
    const id1 = await p.evaluate(() => __uid(1));
    await turn('نه اشتباه نوشتم، منظورم ۲^n − ۱ بود', 'درست شد: حدست «۲^n − ۱» است.', [cs({ ph: 'u', retract: { msg: 'جواب ۲^n هست', what: 'guess', fix: '۲^n − ۱' } })]);
    s = await st();
    chk(s.guesses.length === 1 && s.guesses[0].text === '۲^n − ۱' && hasNote(s.guesses[0].corr) && s.guesses[0].corr[0].old === '۲^n', 'inf15 guess 1 back: g1 corrected with history «اصلاح شد ⇐», not duplicated ' + JSON.stringify(s.guesses));
    chk(s.guess && s.guess.text === '۲^n − ۱', 'inf15: coach.guess follows the fix ' + JSON.stringify(s.guess));
    chk(s.ev.filter(e => e.msg === id1).length > 0 && s.ev.filter(e => e.msg === id1).every(e => e.wd), 'inf15: every mind-card event derived from the corrected message is withdrawn (wd), not deleted ' + JSON.stringify(s.ev));
    chk(s.ev.some(e => e.how === 'selfcorr' && e.ok && e.ph === 'b') && !s.ev.some(e => !e.ok && !e.wd), 'inf15: the self-correction is look-back evidence (+), never a failure ' + JSON.stringify(s.ev));
    chk(s.lr.length === 1 && s.lr[0].pid === pid && s.lr[0].id === id1 && s.lr[0].what === 'guess' && s.lr[0].fix === '۲^n − ۱' && s.lr[0].n === 1, 'inf15: live-problem records go through APP.liveRetract(pid, msgId, {what, fix}) ' + JSON.stringify(s.lr));
    chk(s.sys.some(t => /^✓ اصلاح شد: /.test(t)), 'inf15: the page says what changed (one sys line) ' + JSON.stringify(s.sys));
    u = await turn('خب حالا چی؟');
    x = blockOf(u.user, /^# اصلاحی که صفحه انجام داد/);
    chk(/۲\^n − ۱/.test(x) && /اصلاح شد ⇐/.test(x) && /در یک جمله/.test(x), 'inf15: next-turn context states exactly what changed ' + x.slice(0, 400));
    u = await turn('باشه.'); chk(!blockOf(u.user, /^# اصلاحی که صفحه انجام داد/), 'inf15: the change context is shown once');
    const ph = await p.evaluate(() => { const Q = APP.MIND.phases(); const r = {}; Q.rows.forEach(X => { r[X.id] = X.k + '/' + X.n; }); return r; });
    chk(ph.back === '1/1' && ph.und === '0/0', 'inf15: mind card — the withdrawn «own restatement» is not counted; the self-correction counts as look-back + ' + JSON.stringify(ph));
    // ۲) پیامِ کنونی بی نشانهٔ اصلاح ⇒ رد؛ تکه‌ای که فقط دستیار گفت ⇒ رد؛ درست = پیشین ⇒ رد
    await wipe(); await fresh();
    await turn('حدسم اینه که جواب فیبوناچیه', 'چطور امتحانش می‌کنی؟', [cs({ guess: { text: 'فیبوناچیه' } })]);
    await turn('یه فکر دیگه: شاید بشه با استقرا رفت', 'خوب است.', [cs({ retract: { msg: 'جواب فیبوناچیه', what: 'guess', fix: 'استقرا' } })]);
    s = await st(); chk(s.guesses[0].text === 'فیبوناچیه' && s.ret && !s.ret.ok, 'inf15: no correction signal ⇒ retract refused ' + JSON.stringify(s.ret));
    // ۳) برنامهٔ سه نوبت پیش: متن، موعد، یادآورِ پیگیری؛ تاریخچه
    await wipe(); await fresh();
    await turn('برنامه‌م اینه که سه‌شنبه با صاحبخونه حرف بزنم', 'قبلش چه می‌خواهی بگویی؟', [cs({ plan: { text: 'سه‌شنبه با صاحبخونه حرف بزنم', when: '2026-10-20' } })]);
    await p.evaluate(() => APP.S.put({ id: 'dl_r19b', type: 'deadline', what: 'پیگیری: سه‌شنبه با صاحبخونه حرف بزنم', date: '2026-10-20', sess: __cur().id, done: false }));
    await turn('اینکه اجاره زیاده', 'عددی داری؟'); await turn('آره، ۱۵ درصد بالاتر از محله', 'خوب است.');
    await turn('اون برنامه رو اصلاح کن، منظورم پنج‌شنبه بود', 'باشه، پنج‌شنبه.', [cs({ retract: { msg: 'سه‌شنبه با صاحبخونه حرف بزنم', what: 'plan', fix: 'پنج‌شنبه' } })]);
    s = await st(); x = await p.evaluate(() => APP.S.get('dl_r19b'));
    chk(s.plans.length === 1 && /^پنج‌شنبه با صاحبخونه/.test(s.plans[0].text) && s.plans[0].when === '2026-10-22' && hasNote(s.plans[0].corr) && s.plans[0].corr[0].oldWhen === '2026-10-20', 'inf15 plan 3 back: text + date move (Tue → Thu), Tue kept as history ' + JSON.stringify(s.plans));
    chk(x && x.date === '2026-10-22' && hasNote(x.corr), 'inf15: the follow-up reminder tied to the plan moves too, with history ' + JSON.stringify(x));
    // ۴) فرمی که کنشِ دستیار در صفحه پر کرد (دفترِ واقعیِ fill) ⇒ همان فیلد در همان صفحه برمی‌گردد و درست می‌نشیند
    await wipe(); await fresh(); await p.evaluate(() => APP.go('home')); await p.waitForTimeout(100);
    const k = await p.evaluate(() => { const i = document.createElement('input'); i.id = 'r19b_unk'; i.setAttribute('aria-label', 'مجهولِ آزمون'); document.getElementById('main').appendChild(i); APP.ASSIST.scan(); return i.getAttribute('data-ai-k'); });
    await turn('مجهول سرعت متوسطه', 'داده‌ها؟', [{ do: 'fill', k, value: 'سرعت متوسط' }, cs({ ph: 'u' })]);
    await turn('مسافت ۱۲۰ کیلومتر', 'و زمان؟');
    x = await p.evaluate(() => { const i = document.getElementById('r19b_unk'); return i ? i.value : null; });
    await turn('منظورم زمان کل بود نه سرعت متوسط، اون مجهول رو اصلاح کن', 'باشه.', [cs({ retract: { msg: 'مجهول سرعت متوسطه', what: 'form', fix: 'زمان کل' } })]);
    s = await st(); const v2 = await p.evaluate(() => { const i = document.getElementById('r19b_unk'); return i ? i.value : null; });
    chk(x === 'سرعت متوسط' && s.fills.length === 1 && s.fills[0].val === 'زمان کل' && hasNote(s.fills[0].corr) && (v2 === 'زمان کل' || v2 === null), 'inf15 form: the field the assistant filled from that turn is re-set to the fix, old value kept ' + JSON.stringify({ x, v2, f: s.fills }));
    // ۵) قرنطینه / فهرستِ کنش: retract در «# گزارشِ وضع» مستند است
    chk(/retract \{"msg"/.test(await p.evaluate(() => APP.ASSIST.COACH_STATE_X || '')), 'inf15: coach_state.retract is documented in «# گزارشِ وضع»');
  });

  // ================= bank15 =================
  await section('bank15', async () => {
    const r = info.bank15 = { res: [] }; const E = BANK.filter(e => e.rc === 'INF15.retract');
    const T = (i, ok, x) => { r.res.push([i, ok]); chk(ok, 'bank15#' + i + ' «' + E[i].text.slice(0, 80) + '» → ' + E[i].expect.slice(0, 100) + ' :: ' + JSON.stringify(x).slice(0, 600)); };
    const RT = (msg, what, fix) => [cs({ retract: { msg, what, fix } })];
    const noChange = (s0, s1) => JSON.stringify([s0.guesses, s0.plans, s0.fills, s0.promises]) === JSON.stringify([s1.guesses, s1.plans, s1.fills, s1.promises]);
    let s, u, id1, pid;
    const go = async (i, pre, last, opt) => { await wipe(); await fresh(); pid = opt && opt.live ? await bind('مسئلهٔ آزمون', opt.steps) : null; const hk = opt && opt.hook ? opt.hook : null; u = await play(E[i].text, pre, last, hk); s = await st(); id1 = await p.evaluate(() => __uid(1)); return s; };
    const okBase = (s) => s.ret && s.ret.ok && s.ret.src === id1;
    // 0 — guess 1 back
    await go(0, { 1: [cs({ guess: { text: '۲^n' } })] }, RT('جواب ۲^n هست', 'guess', '۲^n − ۱'), { live: true });
    T(0, okBase(s) && s.guesses[0].text === '۲^n − ۱' && hasNote(s.guesses[0].corr) && s.guess.text === '۲^n − ۱' && s.ev.some(e => e.how === 'selfcorr' && e.ok) && s.lr.length === 1 && s.lr[0].what === 'guess', s);
    // 1 — fact 3 back (form «داده‌ها» filled from that turn; later turns untouched)
    await go(1, {}, RT('عرضش ۵', 'fact', '۹'), { live: true, hook: () => p.evaluate(() => { __fill(1, 'داده‌ها', 'طول ۱۲، عرض ۵'); __fill(3, 'قضیه', 'فیثاغورس'); }) });
    T(1, okBase(s) && s.fills[0].pending === 'طول ۱۲، عرض ۹' && hasNote(s.fills[0].corr) && s.fills[1].val === 'فیثاغورس' && !s.fills[1].corr && s.lr.length === 1 && s.lr[0].n === 1, s);
    // 2 — plan 3 back
    await go(2, { 1: [cs({ plan: { text: 'سه‌شنبه با صاحبخونه حرف بزنم', when: '2026-10-20' } })] }, RT('سه‌شنبه با صاحبخونه حرف بزنم', 'plan', 'پنج‌شنبه'));
    T(2, okBase(s) && s.plans[0].when === '2026-10-22' && /^پنج‌شنبه/.test(s.plans[0].text) && hasNote(s.plans[0].corr) && s.plans[0].corr[0].oldWhen === '2026-10-20', s);
    // 3 — step 1 back (via a38); «اجرا» event of the wrong message withdrawn
    await go(3, { 1: [cs({ ph: 'e', step: { step: 2, done: 'yes', what: 'جواب داد' } })] }, RT('گام دوم رو انجام دادم و جواب داد', 'step', 'جواب نداد، فقط شروعش کردم'), { live: true, steps: ['گام اول', 'گام دوم'] });
    T(3, okBase(s) && s.lr.length === 1 && s.lr[0].what === 'step' && s.lr[0].id === id1 && s.ev.filter(e => e.msg === id1).every(e => e.wd), s);
    // 4 — answer 5 back; answer evidence + the verdict-bearing event withdrawn
    await go(4, { 1: [cs({ ph: 'b', said: ['result'], result: 'جواب نهایی ۸۹ است' })] }, RT('جواب نهایی ۸۹ است', 'ans', '۵۵'));
    T(4, okBase(s) && s.ev.filter(e => e.msg === id1).every(e => e.wd) && s.ret.n === 1 && s.note && s.note.ch.some(t => /۵۵/.test(t)) && /۵۵/.test(s.stmt), s);
    // 5 — formula 5+ back; fragment matched on the EARLIER message
    await go(5, {}, RT('S = πr', 'fact', 'S = πr²'), { hook: () => p.evaluate(() => __fill(1, 'فرمول', 'S = πr')) });
    T(5, okBase(s) && s.ret.n === 1 && (s.fills[0].pending === 'S = πr²') && hasNote(s.fills[0].corr), s);
    // 6 — form filled by an assistant action
    await go(6, {}, RT('مجهول سرعت متوسطه', 'form', 'زمان کل'), { hook: () => p.evaluate(() => __fill(1, 'مجهول', 'سرعت متوسط')) });
    T(6, okBase(s) && s.fills[0].pending === 'زمان کل' && hasNote(s.fills[0].corr), s);
    // 7 — condition (said) 1 back
    await go(7, { 1: [cs({ ph: 'u', said: ['c'] })] }, RT('عددا مثبت باشن', 'said', 'عددا صحیح باشن'));
    T(7, okBase(s) && s.ev.filter(e => e.msg === id1).every(e => e.wd) && s.ev.some(e => e.how === 'selfcorr'), s);
    // 8 — loan amount only; «قسط ۸» untouched
    await go(8, {}, RT('مبلغ وام ۲۰۰ میلیون', 'fact', '۱۲۰ میلیون'), { hook: () => p.evaluate(() => { __fill(1, 'مبلغ وام', '۲۰۰ میلیون تومان'); __fill(1, 'قسط ماهانه', '۸ میلیون'); }) });
    T(8, okBase(s) && s.fills[0].pending === '۱۲۰ میلیون تومان' && s.fills[1].val === '۸ میلیون' && !s.fills[1].pending && !s.fills[1].corr, s);
    // 9 — plan 5 back: «روزی یک ساعت», date unchanged
    await go(9, { 1: [cs({ plan: { text: 'روزی دو ساعت درس بخونم', when: '2026-10-18' } })] }, RT('روزی دو ساعت درس بخونم', 'plan', 'یک ساعت'));
    T(9, okBase(s) && s.plans[0].text === 'روزی یک ساعت درس بخونم' && s.plans[0].when === '2026-10-18' && hasNote(s.plans[0].corr), s);
    // 10 — guess 3 back (life): only «سرایدار» replaced; on_guess plan stays linked to g1
    await go(10, { 1: [cs({ guess: { text: 'سرایدار کلید رو برداشته' } })] }, RT('سرایدار کلید رو برداشته', 'guess', 'همسایه‌ی طبقه‌ی دوم'));
    T(10, okBase(s) && s.guesses.length === 1 && s.guesses[0].id === 'g1' && s.guesses[0].text === 'همسایه‌ی طبقه‌ی دوم کلید رو برداشته' && hasNote(s.guesses[0].corr), s);
    // 11 — her own promise (plan) Fri → next Sat
    await go(11, { 1: [cs({ plan: { text: 'جمعه بهت خبر می‌دم', when: '2026-10-23' } })] }, RT('جمعه بهت خبر می‌دم', 'plan', 'شنبه‌ی بعد'));
    T(11, okBase(s) && s.plans[0].when === '2026-10-24' && hasNote(s.plans[0].corr), s);
    // 12 — step 3 back, mixed digits
    await go(12, { 1: [cs({ ph: 'e', step: { step: 1, done: 'yes', what: 'x = 3 به دست اومد' } })] }, RT('x = 3 به دست اومد', 'step', 'x = ۷'), { live: true, steps: ['گام اول: x را پیدا کن'] });
    T(12, okBase(s) && s.lr.length === 1 && s.lr[0].what === 'step' && s.lr[0].fix === 'x = ۷', s);
    // 13 — the current message repeats the old value: target is the EARLIER message
    await go(13, {}, RT('۴۰ دقیقه راهه', 'fact', '۴۵ دقیقه'), { hook: () => p.evaluate(() => __fill(1, 'زمانِ راه', '۴۰ دقیقه')) });
    T(13, okBase(s) && s.ret.n === 1 && s.fills[0].pending === '۴۵ دقیقه', s);
    // 14 — one message → guess + data; only data changes, g1 not duplicated
    await go(14, { 1: [cs({ guess: { text: '۱۲۰' } })] }, RT('داده‌ها ۵ و ۴ ان', 'fact', '۵ و ۳'), { hook: () => p.evaluate(() => __fill(1, 'داده‌ها', '۵ و ۴')) });
    T(14, okBase(s) && s.fills[0].pending === '۵ و ۳' && s.guesses.length === 1 && s.guesses[0].text === '۱۲۰' && !s.guesses[0].corr, s);
    // ---- negatives: the model's (wrong) report is refused by the page; nothing reversed; no correction prompt for non-corrections
    const neg = async (i, pre, bad, wantPrompt) => { await go(i, pre, bad ? [cs({ retract: bad })] : []); const s1 = s; return { s: s1, refused: !s1.nRet || (s1.ret && !s1.ret.ok), prompt: !!blockOf(u.user, /^# اصلاحِ پیامِ پیشین/), want: wantPrompt }; };
    let n;
    n = await neg(15, {}, { msg: 'کلید رو تو ماشین', what: 'fact', fix: 'ماشین' }); T(15, n.refused && !n.prompt && !n.s.ev.some(e => e.how === 'selfcorr') && !n.s.ev.some(e => !e.ok && !e.wd && !e.pend), n);
    n = await neg(16, {}, { msg: 'علامت منفی', what: 'fact', fix: 'منفی' }); T(16, n.refused && !n.prompt && !n.s.ev.some(e => !e.ok && !e.wd && !e.pend), n);
    n = await neg(17, { 1: [cs({ guess: { text: 'جواب فیبوناچیه' } })] }, { msg: 'جواب فیبوناچیه', what: 'guess', fix: 'با استقرا' }); T(17, n.refused && !n.prompt && n.s.guesses[0].text === 'جواب فیبوناچیه' && !n.s.guesses[0].corr, n);
    n = await neg(18, {}, { msg: 'جواب ۲۰ هست', what: 'ans', fix: '۲۰' }); T(18, n.refused && !n.prompt, n);
    n = await neg(19, {}, { msg: 'جواب ۸۹ه', what: 'ans', fix: '۸۹' }); T(19, n.refused && !n.prompt && !n.s.ev.some(e => e.wd), n);
    n = await neg(20, {}, { msg: 'عرضش ۹ه', what: 'fact', fix: '۹' }); T(20, n.refused && !n.prompt, n);
    n = await neg(21, {}, null); T(21, n.refused && !n.prompt, n);
    n = await neg(22, {}, null); T(22, n.refused && !n.prompt, n);
    // 23 — correction of something never stored: accepted, nothing changed, no «changed» claim, no mind-card event
    await go(23, {}, RT('خیلی خسته‌ام', 'said', 'خواب‌آلودم'));
    u = await turn('باشه.'); const nb = blockOf(u.user, /^# اصلاحی که صفحه انجام داد/);
    T(23, s.ret && s.ret.ok && !s.ret.changes.length && !s.ev.some(e => e.how === 'selfcorr') && !s.sys.some(t => /^✓ اصلاح شد/.test(t)) && /چیزی عوض نشد/.test(nb), { s, nb });
    // 24 — fragment only the assistant said
    n = await neg(24, {}, { msg: '۵', what: 'fact', fix: '۷' }); T(24, n.refused && /پیامِ پیشینِ خودِ او/.test((n.s.ret || {}).err || ''), n);
    // 25 — fallback: no coach_state ⇒ ask «کدام را اصلاح کنم؟» with the candidates; nothing reversed (this turn and the next)
    await wipe(); await fresh();
    await turn('حدسم ۲^n', '...', [cs({ guess: { text: '۲^n' } })]); await turn('برنامه‌م فردا', '...', [cs({ plan: { text: 'برنامه‌م فردا', when: '2026-10-18' } })]);
    const s0 = await st(); const u3 = await turn('اشتباه گفتم', 'کدام را؟', []); const u4 = await turn('همون', 'باشه.', []); s = await st();
    const b3 = blockOf(u3.user, /^# اصلاحِ پیامِ پیشین \(شاید\)/), b4 = blockOf(u4.user, /^# اصلاحِ پیامِ پیشین \(پشتیبان/);
    T(25, /«کدام را اصلاح کنم؟»/.test(b3) && /حدسِ g1 «۲(?:\^n|ⁿ)»/.test(b3) && /برنامهٔ pl1 «برنامه‌م فردا»/.test(b3) && /«کدام را اصلاح کنم؟»/.test(b4) && /g1/.test(b4) && noChange(s0, s) && !s.nRet && !s.ev.some(e => e.wd), { b3, b4 });
    // 26 — fix not in the current message
    n = await neg(26, {}, { msg: 'عرضش ۵', what: 'fact', fix: '۹' }); T(26, n.refused && /در همین پیامِ او نیست/.test((n.s.ret || {}).err || ''), n);
    // 27 — «نه، ۵۵ درسته» confirms her own value
    n = await neg(27, {}, { msg: 'جواب ۵۵ه', what: 'ans', fix: '۵۵' }); T(27, n.refused && !n.s.ev.some(e => e.wd), n);
  });

  // ================= inf17 + bank17 =================
  await section('bank17', async () => {
    const r = info.bank17 = { res: [] }; const E = BANK.filter(e => e.rc === 'INF17.trace');
    const T = (j, ok, x) => { r.res.push([69 + j, ok]); chk(ok, 'bank17#' + (69 + j) + ' «' + E[j].text.slice(0, 80) + '» → ' + E[j].expect.slice(0, 100) + ' :: ' + JSON.stringify(x).slice(0, 600)); };
    const rows = (opt) => p.evaluate(opt => { const Q = APP.MIND.phases(opt || undefined); const o = {}; Q.rows.forEach(X => { o[X.id] = { k: X.k, n: X.n, acts: (X.acts || []).map(a => ({ id: a.id, ok: a.ok, at: a.at, fa: a.fa, pid: a.pid, src: a.src })) }; }); return o; }, opt || null);
    const dims = () => p.evaluate(() => { const m = APP.MIND.model(), o = {}; m.dims.forEach(d => { o[d.id] = APP.MIND.dimActs ? APP.MIND.dimActs(d) : []; }); return o; });
    const out = (pid, sid, o) => p.evaluate(([pid, sid, o]) => __liveSet(pid, (so, L) => { let s0 = L.steps.find(x => x.id === sid); if (!s0) { s0 = { id: sid, at: o.at, text: 'گامِ ' + sid, pred: 'شاید' }; L.steps.push(s0); } s0.out = Object.assign({ d: o.at.slice(0, 10), what: '', match: '' }, o); s0.closed = true; }), [pid, sid, o]);
    await wipe(); await fresh(); const P1 = await bind('۲۰ پله');
    /* اگر نمای پرونده (سمتِ live) هنوز نیست، فقط در آزمون یک نمای خالی تا پیوند سنجیده شود */
    const dosNative = await p.evaluate(() => !!(APP.V && APP.V.dossier)); if (!dosNative) await p.evaluate(() => { APP.V.dossier = () => APP.h('div', { class: 'page dossier-stub' }, 'dossier'); });
    // 69 — s2 done ⇒ «اجرا» lists s2 · date · + · link
    await out(P1, 's2', { at: '2026-10-17T10:00:00.000Z', done: 'yes', prog: 'آره' }); let R = await rows();
    let a = R.exec.acts.find(x => x.id === 'lstep:' + P1 + ':s2');
    await p.evaluate(() => APP.go('mind')); await p.waitForTimeout(300);
    let dom = await p.evaluate(id => { const li = document.querySelector('#main details.mind-from[data-row="ph:exec"] li[data-act="' + id + '"]'); return li ? { t: li.textContent, ok: li.getAttribute('data-ok'), btn: !!li.querySelector('.mind-act-go') } : null; }, 'lstep:' + P1 + ':s2');
    T(0, a && a.ok && a.pid === P1 && /2026-10-17/.test(a.at) && dom && dom.ok === '1' && dom.btn && /\+/.test(dom.t), { a, dom });
    // 77 — clicking opens the dossier at that act
    await p.evaluate(id => { const bt = document.querySelector('#main li[data-act="' + id + '"] .mind-act-go'); if (bt) bt.click(); }, 'lstep:' + P1 + ':s2'); await p.waitForTimeout(200);
    const at77 = await p.evaluate(() => ({ v: APP.state.view, arg: APP.state.arg }));
    T(8, at77.v === 'dossier' && at77.arg === P1, at77);
    await p.evaluate(() => APP.go('home'));
    // 70 — two validated guesses on two problems ⇒ the guessing (s_problem calibration) row lists both with problem + date
    const P2 = await p.evaluate(() => __live('مسئلهٔ دوم'));
    await p.evaluate(([a1, a2]) => { __liveSet(a1, so => { so.g = { 1: { guess: '۸۹', conf: 70, hit: 'درست بود', at: '2026-10-17T09:00:00.000Z', hitAt: '2026-10-17T09:30:00.000Z', from: 'live' } }; }); __liveSet(a2, so => { so.g = { 1: { guess: '۵۵', conf: 60, hit: 'نادرست بود', at: '2026-10-18T09:00:00.000Z', hitAt: '2026-10-18T09:30:00.000Z', from: 'live' } }; }); }, [P1, P2]);
    let D = await dims(); const gs = (D.s_problem || []).filter(x => /^g:/.test(x.id));
    T(1, gs.length === 2 && gs.some(x => x.pid === P1 && /2026-10-17/.test(x.at)) && gs.some(x => x.pid === P2 && /2026-10-18/.test(x.at) && !x.ok), gs);
    // 72 — check verdict pass ⇒ look-back row + with date
    await p.evaluate(a1 => __liveSet(a1, so => { so.b = { 1: { done: true, chkRes: 'نتیجه سالم ماند', at: '2026-10-16T12:00:00.000Z' } }; }), P1);
    R = await rows(); a = R.back.acts.find(x => x.id === 'lb:' + P1 + ':1'); T(3, a && a.ok && /2026-10-16/.test(a.at), a);
    // 73 — understand form completed ⇒ «فهمِ مسئله» row lists the form act
    await p.evaluate(a1 => __liveSet(a1, so => { so.u = { 1: { done: true, self: 2, at: '2026-10-17T08:00:00.000Z' } }; }), P1);
    R = await rows(); a = R.und.acts.find(x => /^uc:/.test(x.id) && x.pid === P1); T(4, a && a.ok, R.und);
    // 74 — a step act in a stage row is listed once; the card has no step→ability mapping (no invented link) ⇒ listed once in its row only
    R = await rows(); T(5, R.exec.acts.filter(x => x.id === 'lstep:' + P1 + ':s2').length === 1, { note: 'no ability mapping for live steps exists (not invented); listed once in «اجرا»', acts: R.exec.acts });
    // 75 — «اجرا» +3 −1 ⇒ exactly 4 acts, signs sum to the aggregate
    await out(P1, 's3', { at: '2026-10-17T11:00:00.000Z', done: 'yes', prog: 'آره' }); await out(P1, 's4', { at: '2026-10-17T12:00:00.000Z', done: 'yes', prog: 'آره' }); await out(P1, 's5', { at: '2026-10-17T13:00:00.000Z', done: 'no' });
    R = await rows(); T(6, R.exec.n === 4 && R.exec.acts.length === 4 && R.exec.acts.filter(x => x.ok).length === 3 && R.exec.k === 3, R.exec);
    // 78 — failed step listed with − , date and source
    a = R.exec.acts.find(x => x.id === 'lstep:' + P1 + ':s5'); T(9, a && !a.ok && /2026-10-17/.test(a.at) && /گامِ/.test(a.fa), a);
    // 76 — step s1 corrected 3→۷ (a38 keeps the act, changes the value, history in corr) ⇒ listed once with the corrected value
    await out(P1, 's1', { at: '2026-10-17T07:00:00.000Z', done: 'yes', prog: 'آره', what: 'x = ۷', corr: [{ old: 'x = 3', note: 'اصلاح شد ⇐ «x = 3»' }] });
    R = await rows(); const s1 = R.exec.acts.filter(x => x.id === 'lstep:' + P1 + ':s1'); T(7, s1.length === 1 && /x = ۷/.test(s1[0].fa) && !/x = 3/.test(s1[0].fa), s1);
    // 79 — same step via chat and via the form (same act id) ⇒ once
    await p.evaluate(a1 => { const s = __cur(); s.coachEv = (s.coachEv || []).concat([{ at: '2026-10-17T10:00:01.000Z', ph: 'c', ok: true, src: 'chatok', key: 'x|c|گام دوم انجام شد', act: 'lstep:' + a1 + ':s2', pid: a1 }]); APP.S.put(s); }, P1);
    R = await rows(); T(10, R.exec.acts.filter(x => x.id === 'lstep:' + P1 + ':s2').length === 1 && R.exec.n === 5, R.exec);
    // 80 — a step outcome withdrawn by a chat retract ⇒ not a counted act
    await out(P1, 's6', { at: '2026-10-17T14:00:00.000Z', done: 'yes', prog: 'آره', wd: { at: '2026-10-17T15:00:00.000Z', why: 'اصلاحِ پیامِ منبع' } });
    R = await rows(); T(11, !R.exec.acts.some(x => x.id === 'lstep:' + P1 + ':s6') && R.exec.n === 5, R.exec);
    // 81 — a guess withdrawn by ✏️ edit ⇒ not counted under the guessing row
    await p.evaluate(a2 => __liveSet(a2, so => { so.g[1].wd = { at: '2026-10-18T10:00:00.000Z', why: '✏️' }; }), P2);
    D = await dims(); T(12, !(D.s_problem || []).some(x => x.pid === P2 && /^g:/.test(x.id)), D.s_problem);
    // 82 — sample/tour data never enters the owner's card (sample records are excluded at source)
    await p.evaluate(() => APP.S.put({ id: 'kc_sample19b', type: 'kcase', sample: true, title: 'نمونه', tut: { und: [{ self: 2, at: '2026-10-17T01:00:00.000Z' }] } }));
    R = await rows(); T(13, !R.und.acts.some(x => /kc_sample19b/.test(x.id)), R.und);
    // 83 — the assistant's own words are never acts
    await p.evaluate(() => { const s = __cur(); s.tut = { plan: [{ self: 2, by: 'assistant', at: '2026-10-17T02:00:00.000Z' }] }; APP.S.put(s); });
    R = await rows(); T(14, !R.plan.acts.some(x => /^tut:/.test(x.id)), R.plan);
    // 84 — an ask-only deferred candidate is not an act
    const nEv0 = await p.evaluate(() => (__cur().coachEv || []).length);
    await turn('میشه آخرش یه خلاصه بهم بدی؟', 'اول بگو مجهول چیست؟'); await turn('باشه.');
    R = await rows(); T(15, !Object.values(R).some(X => X.acts.some(a => /خلاصه/.test(a.fa))), { nEv0 });
    // 85 — reloaded twice ⇒ no act twice
    const before = JSON.stringify(await rows());
    await setup(); await setup(); const after = await rows(); const dup = Object.values(after).some(X => new Set(X.acts.map(a => a.id)).size !== X.acts.length);
    T(16, !dup && JSON.stringify(after) === before, { dup });
    // 71 / 86 / 87 — retract: old act withdrawn, new act (selfcorr) listed as +, never −
    await wipe(); await fresh(); await turn('جواب نهایی ۸۹ است', 'چطور چک می‌کنی؟', [cs({ ph: 'b', said: ['result'], result: 'جواب نهایی ۸۹ است' })]);
    const idOld = await p.evaluate(() => __uid(1));
    await turn('جوابی که اول نوشتم اشتباه بود، منظورم ۵۵ بود', 'باشه.', [cs({ ph: 'b', said: ['result'], result: '۵۵', retract: { msg: 'جواب نهایی ۸۹ است', what: 'ans', fix: '۵۵' } })]);
    R = await rows(); const all = Object.values(R).flatMap(X => X.acts);
    const sc = R.back.acts.filter(x => /بازنگری|اصلاح/.test(x.fa) && x.ok);
    T(2, sc.length >= 1, R.back);
    T(17, !all.some(x => x.id.indexOf(':' + idOld + ':') >= 0) && all.some(x => /۵۵/.test(x.fa)), all);
    T(18, !all.some(x => !x.ok && /اصلاح/.test(x.fa)), all);
    // 88 — filtered to problem A ⇒ B's acts not listed
    await wipe(); await fresh(); const A1 = await bind('مسئلهٔ الف'); const B1 = await p.evaluate(() => __live('مسئلهٔ ب'));
    await out(A1, 's1', { at: '2026-10-17T10:00:00.000Z', done: 'yes', prog: 'آره' }); await out(B1, 's1', { at: '2026-10-17T10:00:00.000Z', done: 'no' });
    R = await rows({ pid: A1 }); T(19, R.exec.acts.length === 1 && R.exec.acts[0].pid === A1 && R.exec.n === 1, R.exec);
    // control: the stage-row details exist for every row with data, and the count equals n
    await p.evaluate(() => APP.go('mind')); await p.waitForTimeout(300);
    dom = await p.evaluate(() => [...document.querySelectorAll('#main details.mind-from[data-row^="ph:"]')].map(d => ({ row: d.getAttribute('data-row'), n: +d.getAttribute('data-n'), li: d.querySelectorAll('li').length })));
    chk(dom.length >= 1 && dom.every(x => x.n === x.li), 'inf17: every stage row with data has «از کجا؟» with one line per counted act ' + JSON.stringify(dom));
    if (!dosNative) await p.evaluate(() => { delete APP.V.dossier; });
    await p.evaluate(() => APP.go('home'));
  });

  // ================= strict =================
  await section('strict', async () => {
    const bad = strictAll.filter(x => x[1].length);
    chk(!bad.length, 'strict: one turn question per block across every prompt of this test ' + JSON.stringify(bad).slice(0, 900));
  });

  const sum = (k) => info[k] && info[k].res ? { n: info[k].res.length, fail: info[k].res.filter(x => !x[1]).map(x => x[0]) } : null;
  console.log(JSON.stringify({ bank15: sum('bank15'), bank17: sum('bank17'), liveRetractNative: await p.evaluate(() => window.__lrNative).catch(() => null) }));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  if (errors.length) process.exitCode = 1;
  await b.close();
})();
