// تورِ پولیا (دستهٔ ۱، دورِ ۲۳، سهمِ «prereq» — ۲۰۲۶-۱۰-۱۹) — DECISIONS_R23: Q2 (ریزه‌کاری‌های لایهٔ پیش‌نیاز) و Q6 (حلقهٔ قلمرو، نقشهٔ راهِ منبع‌ها §۱۹.۶).
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۳ — pC2 p1 «… کیلوواتی ۱۵۰۰ … ۲۷۰ میلیون!»، pC3 p1 «مستطیل رو بلدم … ولی این مثلثه»، pA3 (چادرِ هرمی: مساحتِ مثلث ⇐ فیثاغورس ⇐ رادیکال)،
//           bp3 (نردبان: «۵ منهای ۳ چرا نمیشه»)، bp2 p6/p8، dp3 p2 «راستش مغزم دیگه نمی‌کشه»، dp3 p4، bp1 p10 «فکر کردم خنگم»، tA1 (کیتِ آبیاریِ خورشیدی؛ برگهٔ #۱۰۱/#۱۰۲)،
//           tC1 p7 (TRIZ؛ «تو این سامانه چیزی برای این هست؟»)، oD1/tB1 (نقشهٔ سامانه بریده: «بقیهٔ نقشهٔ سامانه جا نشد»، s_comm/s_self نرسید)
//  bank     همهٔ ورودی‌های Q2/Q6 در بانکِ مستقلِ tests/variants/VARIANTS_R23.json (رفتارِ محضِ مدل با دلیل در info.nc)
// LLA_FILE = ساختِ دیگر؛ ONLY=opening,causes,nested,rewrite,ability,follow,territory,manifest,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = JSON.parse(fs.readFileSync(process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R23.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R23.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)), 'utf8'));

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
  const T0 = '2026-10-19';
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0; window.__sheetNo = []; window.__sheets = {}; window.__notes = [];
    APP.today = () => window.__day;
    APP.HOST = { report: async () => { const n = __sheetNo.length ? __sheetNo.shift() : 900; return { id: 'sh' + n, number: n }; }, sheets: async () => [], sheet: async (id) => (__sheets[id] || null),
      note: async (id, t) => { __notes.push({ id, t }); return { ok: true }; }, remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    window.__turn = async (text, reply, actions, extra, more) => {
      const n0 = __calls.length; __q.push(R(Object.assign({ reply: reply || 'باشه.', actions: actions || [] }, more || {}))); (extra || []).forEach(x => __q.push(x));
      await APP.ASSIST.send(text); __q.length = 0;
      const all = __calls.slice(n0), c = all.filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {};
      return { sys: c.sys || '', user: c.user || '', task: c.task || '', n: all.length, all: all.map(x => x.user) };
    };
    window.__fresh = (view) => { APP.go(view || 'home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
    window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {};
      ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L); APP.S.put(pg); };
    window.__pre = (sc) => (APP.PRE.all(sc || APP.PRE.scope(__cur())) || []).map(e => ({ id: e.id, c: e.concept, st: e.state, step: e.step, parent: e.parent, mp: !!e.mastPending, asked: !!e.asked }));
    window.__ph = (pid) => { const Q = APP.MIND.phases(pid ? { pid } : undefined); const r = {}; Q.rows.forEach(X => { r[X.id] = X.k + '/' + X.n; }); return { r, weakest: Q.weakest ? Q.weakest.id : '', pre: Q.causes.prereq.length, unk: Q.causes.unk.length, knot: Q.causes.knot.length, skill: Q.causes.skill.length, sys: (Q.causes.sys || []).length, learned: Q.prereq.learned.map(x => x.concept), text: APP.MIND.phasesText(Q) }; };
    window.__ev = () => (__cur().coachEv || []).map(e => ({ ok: e.ok, ph: e.ph, cause: e.cause || '', pre: e.pre || '', msg: e.msg || '', sheet: e.sheet || '' }));
    window.__addArea = (sysId, a) => { const S0 = (window.SYS_TERR.systems || []).filter(x => x.id === sysId)[0]; S0.groups[0].areas.push(a); };
    window.__dropArea = (id) => { (window.SYS_TERR.systems || []).forEach(m => (m.groups || []).forEach(g => { g.areas = (g.areas || []).filter(a => a.id !== id); })); };
  }, T0);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const blockOf = (u, re) => head(u).split(/\n(?=# )/).filter(bl => re.test(bl.split('\n')[0]))[0] || '';
  const nTQ = (u) => (head(u).match(/\*\*پرسشِ این نوبت همین است:?\*\*|^- در این نوبت فقط \*\*یک\*\* پرسش|پیشنهادِ این نوبت: «/gm) || []).length;
  const turn = (text, reply, actions, extra, more) => p.evaluate(([t, r, a, x, m]) => __turn(t, r, a, x, m), [text, reply || '', actions || [], extra || [], more || null]);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const pre = (sc) => p.evaluate((sc) => __pre(sc), sc || null);
  const ph = (pid) => p.evaluate((pid) => __ph(pid), pid || null);
  const ev = () => p.evaluate(() => __ev());
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const bind = async (title, stmt) => p.evaluate(([t, stmt]) => { const pid = __live(t, stmt); APP.liveBindSession(pid, __cur()); return pid; }, [title, stmt]);
  const sysMsgs = () => p.evaluate(() => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text));
  const rewrites = (u) => u.all.filter(a => /وارسیِ صفحه پیش از نشان دادنِ پاسخ/.test(a));
  const sid = () => p.evaluate(() => __cur().id);
  const E = {}; BANK.forEach((e, i) => { E[i] = e; });
  const T = (i, ok, x) => { info.bank[i] = !!ok; chk(ok, 'bank#' + i + ' [' + E[i].rc + '/' + E[i].kind + '] «' + E[i].text.slice(0, 70) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 700)); };
  const NC = (i, why) => { info.nc[i] = why; };
  const own = (i) => /^Q2\.|^Q6\./.test(E[i].rc);
  const R7 = {};
  const noFail = (x) => Object.values(x.r).every(v => { const q = String(v).split('/').map(Number); return q[0] === q[1]; });   // هیچ «−» در جدولِ چهار مرحله   // جمع‌آوریِ نتیجه‌ها برای ورودی‌های بانک

  // ================= C23-3 — نوبتِ گشایش: قراردادِ «# پیش‌نیاز» از پیامِ نخست =================
  await section('opening', async () => {
    await wipe(); await fresh();
    const PC2 = 'سلام. یه بخاری برقی ۲۰۰۰ واتی دارم که روزی ۳ ساعت روشنه. برق هم کیلوواتی ۱۵۰۰ تومنه. می‌خوام بدونم ماهی چقدر برام آب می‌خوره. حساب کردم: ۲۰۰۰ × ۳ × ۳۰ × ۱۵۰۰ شد ۲۷۰ میلیون تومن! امکان نداره، کلِ قبضم ماهی ۴۰۰ هزار تومنه. کجاشو اشتباه کردم؟';
    let u = await turn(PC2, 'یک پرسش: «کیلوواتی ۱۵۰۰ تومان» دقیقاً بهای چه چیزی است؟', [cs({ ph: 'u', said: ['u', 'd', 'result'], stuck: true, fail: true, nat: 'practical',
      prereq: { concept: 'کیلووات‌ساعت (یکای انرژی = توان × زمان)', step: 'ضربِ توانِ بخاری در ساعت‌ها و قیمت برای هزینهٔ ماه', quote: 'برق هم کیلوواتی ۱۵۰۰ تومنه', q: '«کیلوواتی ۱۵۰۰ تومان» دقیقاً بهای چه چیزی است؟' } })]);
    const bl = blockOf(u.user, /^# پیش‌نیاز \(/);
    chk(/^# پیش‌نیاز \(/.test(bl) && /coach_state/.test(bl), 'C23-3 pC2 p1: the OPENING prompt already carries the «# پیش‌نیاز» contract (no chatFocus yet) :: ' + head(u.user).split('\n').filter(l => /^# /.test(l)).join(' | ').slice(0, 600));
    let st = await pre();
    chk(st.length === 1 && st[0].st === 'diag' && /کیلووات‌ساعت/.test(st[0].c), 'C23-3: a valid prereq reported on turn 1 is accepted onto the stack :: ' + JSON.stringify(st));
    let x = await ph(); chk(x.pre >= 1 && x.unk === 0, 'C23-3: the opening stuck is booked cause «پیش‌نیاز» :: ' + JSON.stringify(x));
    R7.open1 = !!(bl && st.length === 1);
    // pC3 p1 / bank #38 (teen, colloquial, no ZWNJ)
    await wipe(); await fresh();
    u = await turn('مستطیلو بلدم، طول ضربدر عرض… ولی این مثلثه، مساحتشو نمیدونم چجوری', 'اگر مستطیلی را از قطرش ببری، هر تکه چه کسری از آن است؟', [cs({ ph: 'u', stuck: true,
      prereq: { concept: 'مساحتِ مثلث', step: 'مساحتِ مثلثِ باغچه', quote: 'مساحتشو نمیدونم چجوری', q: 'اگر مستطیلی را از قطرش ببری، هر تکه چه کسری از آن است؟' } })]);
    st = await pre();
    R7.b38 = { blk: /^# پیش‌نیاز \(/.test(blockOf(u.user, /^# پیش‌نیاز \(/)), st };
    // a bare greeting is not a problem ⇒ no prerequisite contract
    await wipe(); await fresh();
    u = await turn('سلام', 'سلام! چه کمکی از دستم برمی‌آید؟', []);
    chk(!blockOf(u.user, /^# پیش‌نیاز \(/), 'a bare greeting opens no prerequisite scope :: ' + blockOf(u.user, /^# پیش‌نیاز \(/).slice(0, 100));
  });

  // ================= Q2 — علتِ گیر: پشتهٔ باز ⇒ پیش‌نیاز؛ تشخیص ⇒ بازنگاشتِ گیرهای پیشینِ همان گام؛ کمبودِ سامانه ⇒ سامانه =================
  await section('causes', async () => {
    // bp3 (B·D18): p1 fail «۵ منهای ۳»، p2 ok (کل)، p3 stuck + prereq، p4 diag missing ⇒ p1 هم پیش‌نیاز
    await wipe(); await fresh();
    const BP1 = 'سلام! یه سؤال از کتاب: «نردبانی به طول ۵ متر به دیوار تکیه داده شده و پایه‌اش ۳ متر از دیوار فاصله داره. نردبان تا چه ارتفاعی از دیوار بالا میره؟ و مساحت مثلثی که نردبان و دیوار و زمین درست می‌کنن چقدره؟» من گفتم ارتفاع میشه ۵ منهای ۳، یعنی ۲ متر. ولی جواب آخر کتاب ۴ئه. نمی‌فهمم چرا.';
    await turn(BP1, 'کلِ مسئله را در یک جمله می‌گویی؟', [cs({ ph: 'u', said: ['result'], fail: true, result: 'ارتفاع میشه ۵ منهای ۳، یعنی ۲ متر', nat: 'objective' })]);
    await turn('یه نردبون کج به دیوار تکیه داده، می‌خوایم بدونیم سرش تا کجای دیوار میرسه و اون مثلثه چقدر مساحت داره. ولی خب، ۵ منهای ۳ چرا نمیشه؟', 'خودت فکر می‌کنی چرا؟', [cs({ ph: 'u', said: ['u'], ans: ['u0'] })]);
    await turn('نمی‌دونم... شاید چون نردبون کجه؟ اگه صاف بود ۵ میشد. ولی کج که هست، چطوری حساب کنم؟ معلممون گفت یه قضیه‌ای هست برای مثلث‌ها ولی من اون جلسه نبودم.', 'قضیهٔ فیثاغورس…', [cs({ ph: 'p', stuck: true,
      prereq: { concept: 'قضیهٔ فیثاغورس', step: 'پیدا کردنِ ارتفاعِ سرِ نردبان روی دیوار از طولِ نردبان (۵) و فاصلهٔ پایه (۳)', quote: 'معلممون گفت یه قضیه‌ای هست برای مثلث‌ها ولی من اون جلسه نبودم', q: 'اسمِ فیثاغورس را شنیده‌ای؟' } })]);
    let x0 = await ph(); let st = await pre();
    await turn('اسمشو شنیدم ولی نمی‌دونم چی میگه. یه چیزی با مربع ضلع‌ها بود؟', 'a² + b² = c² …', [cs({ ph: 'p', prereq_res: { id: st[0].id, diag: 'missing', quote: 'اسمشو شنیدم ولی نمی‌دونم چی میگه' } })]);
    let x = await ph();
    chk(x0.unk === 1 && x.unk === 0 && x.pre >= 2, 'B·D18 bp3: the first stuck («۵ منهای ۳»), «نامعلوم» before, is re-attributed to the prerequisite once the diagnosis lands :: ' + JSON.stringify([x0, x]));
    const dzE = await p.evaluate((sid) => APP.dossierSess(sid).events.filter(e => e.k === 'mind' && /نبودِ پیش‌نیازِ «قضیهٔ فیثاغورس»/.test(e.out || '')).map(e => e.lines.join(' ')), await sid());
    const dz = dzE.length;
    chk(dz >= 2 && dzE.every(l => !/−/.test(l)), 'B·D18 / A23-18: the dossier shows the same cause on both stucks and never «طرح‌ریزی −» / «فهم −» for them :: ' + JSON.stringify(dzE));
    R7.b40 = x0.unk === 1 && x.unk === 0 && dz >= 2;
    // pA1/pA3/dp1 (A23-22, D23-14, C23-2 pC3): stucks INSIDE the open detour — wrong diagnostic answer, failed mastery attempt
    st = await pre();
    await turn('۹×۹ = ۸۱، ۱۲×۱۲ = ۱۴۴، جمعشون ۲۲۵. پس وتر ۲۲۵ متره؟ یه کم زیاده...', 'مساحتِ مربع با ضلعش یکی نیست…', [cs({ ph: 'p', stuck: true, fail: true })]);
    await turn('نفهمیدم اصلاً', 'از راهِ دیگری: …', [cs({ ph: 'e', stuck: true })]);
    x = await ph(); const E1 = await ev();
    chk(x.unk === 0 && x.pre >= 4 && !/\/[1-9]/.test(x.r.plan + x.r.exec) && x.weakest === '', 'A23-22 / D23-14 / C23-2: stucks while the stack is open are cause «پیش‌نیاز» (not «طرح‌ریزی −», never «ضعیف‌ترین») :: ' + JSON.stringify([x, E1]));
    R7.b39 = x.unk === 0 && x.pre >= 4 && x.weakest === '';
    // after the return the stack is closed ⇒ a new stuck is booked normally (bank #50)
    await turn('۳ و ۴ و ۵ … آهان! پس وتر = جذرِ ۲۵ = ۵. پس دیوار ۴ متره!', 'آفرین.', [cs({ ph: 'c', said: ['result'], result: 'دیوار ۴ متره', prereq_res: { id: st[0].id, mastery: 'yes', quote: 'دیوار ۴ متره' } })]);
    await turn('اینجا گیر کردم', 'کجای مساحت؟', [cs({ ph: 'c', stuck: true })]);
    x = await ph(); R7.b50 = x.unk === 1; T(50, x.unk === 1, x);
    // bank #49 — a decision, no stack ⇒ no prereq cause
    await wipe(); await fresh();
    await turn('نمی‌دونم کدوم دانشگاه رو انتخاب کنم', 'چه معیارهایی برایت مهم است؟', [cs({ ph: 'u', stuck: true, nat: 'life' })]);
    x = await ph(); T(49, x.pre === 0 && (await pre()).length === 0, x);
    // bank #51 — a stuck on another (closed) live step stays «نامعلوم»; only same-step stucks are re-attributed (pC2 p3: same step ⇒ yes)
    await wipe(); await fresh();
    const pid = await bind('اتحاد و بخش‌پذیری', 'ثابت کن n^2 − 1 برای nِ فرد بر ۸ بخش‌پذیر است.');
    await p.evaluate((pid) => __liveSet(pid, (so, L) => { L.steps.push({ id: 's1', at: new Date().toISOString(), text: 'نوشتنِ n به‌صورتِ 2k+1' }); }), pid);
    await turn('نمی‌دونم', 'n فرد یعنی چه؟', [cs({ ph: 'c', stuck: true })]);
    await p.evaluate((pid) => __liveSet(pid, (so, L) => { const s1 = L.steps[0]; s1.closed = true; s1.out = { done: 'yes', at: new Date().toISOString() };
      L.steps.push({ id: 's2', at: new Date().toISOString(), text: 'بازکردنِ (2k+1)^2' }); L.steps.push({ id: 's3', at: new Date().toISOString(), text: 'تجزیهٔ n^2 − 1' }); }), pid);
    await turn('گیر کردم', 'کجای تجزیه؟', [cs({ ph: 'c', stuck: true })]);
    await turn('n^2 − 1 رو نمی‌دونم چطوری ضرب دو تا پرانتز کنم، اتحادش یادم نیست', 'x^2 − 1 را به ضربِ دو پرانتز می‌نویسی؟', [cs({ ph: 'c', stuck: true,
      prereq: { concept: 'تجزیهٔ اتحادِ مزدوج a²−b²', step: 'گامِ ۳', quote: 'اتحادش یادم نیست', q: 'x^2 − 1 را به ضربِ دو پرانتز می‌نویسی؟' } })]);
    st = await pre({ pid });
    await turn('نه بلد نیستم', 'یاد بگیریم: …', [cs({ ph: 'c', prereq_res: { id: st[0].id, diag: 'missing', quote: 'نه بلد نیستم' } })]);
    x = await ph(pid);
    T(51, x.unk === 1 && x.pre >= 2, x);
    T(40, R7.b40 && x.pre >= 2, { b40: R7.b40, x });
  });

  // ================= A23-23 — پشتهٔ تو‌در‌تو: پدر تا فرزندِ باز بسته نمی‌شود؛ برگشت به نزدیک‌ترین جای منتظرِ باز (pA3) =================
  await section('nested', async () => {
    await wipe(); await fresh();
    const A1 = 'سلام. می‌خوام برای اردوی بچه‌ها یه چادرِ هرمی بدوزم: کفش مربعِ ۲ در ۲ متره و ارتفاعش از وسطِ کف تا نوک ۱٫۵ متر. برای چهار تا دیوارهٔ مثلثیش چقدر پارچه لازمه؟ کف رو جدا می‌خرم.';
    await turn(A1, 'کلِ مسئله را در یک جمله می‌گویی؟', [cs({ ph: 'u', said: ['d'], nat: 'practical' })]);
    await turn('یعنی می‌خوام مساحتِ چهار تا مثلثِ دیواره رو پیدا کنم. هر دیواره یه مثلثه که قاعده‌ش ۲ متره. ولی مساحتِ مثلث رو یادم نیست… قاعده ضربدر ارتفاع بود؟ یا ضلع ضربدر ضلع؟',
      'مستطیلی ۲ در ۳ را از قطرش نصف کن؛ مساحتِ هر نیمه چقدر است؟', [cs({ ph: 'u', said: ['u'], stuck: true, prereq: { concept: 'مساحتِ مثلث', step: 'مساحتِ هر دیوارهٔ مثلثی', quote: 'مساحتِ مثلث رو یادم نیست', q: 'مستطیلی ۲ در ۳ را از قطرش نصف کن؛ مساحتِ هر نیمه چقدر است؟' } })]);
    await turn('مساحتِ مستطیل طول ضربدر عرضه، یعنی ۶. اگه از قطر نصفش کنم، هر نیمه یه مثلثه، پس ۳. آهان! پس مساحتِ مثلث = نصفِ قاعده ضربدر ارتفاع. خب، ارتفاعِ هر دیواره همون ۱٫۵ ـه دیگه؟ پس هر کدوم ۱٫۵ متر مربع.',
      'برگردیم به مسئلهٔ اصلی، گامِ «مساحتِ هر دیوارهٔ مثلثی»: ۱.۵ کجای شکل می‌افتد؟', [cs({ ph: 'p', said: ['plan'], prereq_res: { id: 'pq1', diag: 'missing', mastery: 'yes', quote: 'آهان! پس مساحتِ مثلث = نصفِ قاعده ضربدر ارتفاع' } })]);
    await turn('کشیدم. ۱٫۵ از وسطِ کف تا نوکه، عمودی. ولی ارتفاعِ دیواره از وسطِ لبهٔ کف تا نوکه و کج‌تره، پس بلندتره. یه مثلثِ قائم درست میشه: یه ضلعش ۱ متر (از وسطِ کف تا وسطِ لبه)، یکی ۱٫۵، و کج‌ترینش همون که می‌خوام. ولی نمی‌دونم ضلعِ سوم رو چطوری حساب کنم. اسمِ فیثاغورس رو شنیدم ولی بلد نیستم.',
      'مثلثِ قائمی با دو ضلعِ ۳ و ۴ سانت بکش و وترش را بسنج — چند شد؟', [cs({ ph: 'p', stuck: true, prereq: { concept: 'قضیهٔ فیثاغورس', step: 'ارتفاعِ کجِ دیواره (وترِ مثلثِ قائم با ضلع‌های ۱ و ۱.۵)', quote: 'اسمِ فیثاغورس رو شنیدم ولی بلد نیستم', q: 'مثلثِ قائمی با دو ضلعِ ۳ و ۴ سانت بکش و وترش را با خط‌کش بسنج — چند شد؟' } })]);
    await turn('کشیدم، ضلعِ کج ۵ سانت شد. ۳ و ۴ و ۵… ۳+۴ که ۷ میشه. ولی ۹ + ۱۶ = ۲۵! یعنی مربعِ ضلع‌ها جمع بشه میشه مربعِ ضلعِ کج؟ پس برای چادر: ۱ + ۲٫۲۵ = ۳٫۲۵. یعنی ضلعِ کج رادیکالِ ۳٫۲۵ ـه. حالا رادیکالِ ۳٫۲۵ رو بی ماشین‌حساب چطوری پیدا کنم؟ اینو هم بلد نیستم.',
      'خودت به همان «قضیهٔ فیثاغورس» رسیدی. یک امتحانِ تازه: مثلثِ قائمی با ضلع‌های ۶ و ۸، وترش چند است؟', [cs({ ph: 'p', stuck: true, prereq_res: { id: 'pq2', diag: 'missing', quote: 'یعنی مربعِ ضلع‌ها جمع بشه میشه مربعِ ضلعِ کج؟' },
        prereq: { concept: 'تخمینِ رادیکال (جذر) بی ماشین‌حساب', step: 'ارتفاعِ کجِ دیواره = √۳.۲۵', quote: 'حالا رادیکالِ ۳٫۲۵ رو بی ماشین‌حساب چطوری پیدا کنم؟ اینو هم بلد نیستم', q: 'عددی پیدا کن که در خودش ضرب شود و به ۳.۲۵ نزدیک شود — ۱.۵ × ۱.۵ و ۲ × ۲ چند می‌شوند؟', parent: 'pq2' } })]);
    let st = await pre();
    // p6 — mastery «yes» for pq2 while its child pq3 is open ⇒ NOT closed; no rewrite back to the main problem; the reply going to the child stands
    let u = await turn('۶ به توانِ دو میشه ۳۶، ۸ به توانِ دو ۶۴، جمعش ۱۰۰؛ پس وتر ۱۰ ـه. با خط‌کش هم کشیدم، ۱۰ شد.',
      '۱۰ درست است — «قضیهٔ فیثاغورس» را حالا داری. می‌رویم سراغِ پیش‌نیازِ تو در تو، «تخمینِ رادیکال بی ماشین‌حساب»: ۱.۵ × ۱.۵ و ۲ × ۲ چند می‌شوند؟', [cs({ ph: 'p', prereq_res: { id: 'pq2', mastery: 'yes', quote: '۶ به توانِ دو میشه ۳۶، ۸ به توانِ دو ۶۴، جمعش ۱۰۰؛ پس وتر ۱۰ ـه' } })]);
    const p6 = await pre();
    chk(p6.filter(e => e.id === 'pq2')[0].st === 'teach' && p6.filter(e => e.id === 'pq2')[0].mp && p6.filter(e => e.id === 'pq3')[0].st === 'diag', 'A23-23 pA3 p6: mastery of «فیثاغورس» with its child «رادیکال» still open ⇒ the parent stays open (mastery kept) :: ' + JSON.stringify(p6));
    chk(!rewrites(u).length, 'A23-23 pA3 p6: no rewrite forcing «برگردیم به مسئلهٔ اصلی» while the child is open :: ' + rewrites(u).map(a => a.slice(-300)).join(' ‖ '));
    chk(/پرسشِ تشخیصی هنوز پرسیده نشده/.test(blockOf(u.user, /^# پیش‌نیاز \(/)) && !/«تخمینِ رادیکال[^»]*» \[pq3، پرسشِ تشخیصی پرسیده شد/.test(blockOf(u.user, /^# پیش‌نیاز \(/)), 'A23-23: pq3 is not labelled «پرسیده شد» before it was asked :: ' + blockOf(u.user, /^# پیش‌نیاز \(/).split('\n').filter(l => /پشتهٔ/.test(l)).join(''));
    await turn('با فیثاغورس ضلعِ کج میشه رادیکالِ ۳٫۲۵. ولی گفتم که رادیکال رو بی ماشین‌حساب بلد نیستم.', '۱.۵ × ۱.۵ و ۲ × ۲ چند می‌شوند؟', [cs({ ph: 'p', stuck: true })]);
    await turn('۱٫۵ × ۱٫۵ میشه ۲٫۲۵ و ۲ × ۲ میشه ۴. پس رادیکالِ ۳٫۲۵ بینِ ۱٫۵ و ۲ ـه… ولی دقیقش رو نمی‌دونم چطوری پیدا کنم.', 'عددهای میانه را امتحان کن — √۵ تقریباً چند است؟', [cs({ ph: 'p', prereq_res: { id: 'pq3', diag: 'missing', quote: 'ولی دقیقش رو نمی‌دونم چطوری پیدا کنم' } })]);
    // p10 — child mastered AND she took the parent's step herself (result) ⇒ parent closes too (mastery kept from p6) ⇒ back to the main step; no forced restatement
    u = await turn('۲ × ۲ میشه ۴، ۲٫۲ × ۲٫۲ میشه ۴٫۸۴، ۲٫۳ × ۲٫۳ میشه ۵٫۲۹. پس رادیکالِ ۵ حدودِ ۲٫۲۴. حالا برای ۳٫۲۵: ۱٫۸ × ۱٫۸ = ۳٫۲۴. خیلی نزدیکه! پس ارتفاعِ هر دیواره تقریباً ۱٫۸ متره.',
      '√۵ ≈ ۲.۲۴ را خودت درست تخمین زدی و ارتفاعِ دیواره را ۱.۸ گرفتی. حالا با مساحتِ مثلث، پارچهٔ چهار دیواره چقدر می‌شود؟', [cs({ ph: 'p', said: ['result'], result: 'ارتفاعِ هر دیواره تقریباً ۱٫۸ متره', prereq_res: { id: 'pq3', mastery: 'yes', quote: 'پس رادیکالِ ۵ حدودِ ۲٫۲۴' } })]);
    st = await pre(); const sy = await sysMsgs();
    chk(st.every(e => e.st === 'learned'), 'A23-23 pA3 p10: child learned ⇒ the parent (its mastery shown at p6, and the step taken now) closes too :: ' + JSON.stringify(st));
    chk(!rewrites(u).length, 'A23-23 / B·D10: no rewrite «برگردیم به پیش‌نیازِ «قضیهٔ فیثاغورس»…» after she took the step herself :: ' + rewrites(u).map(a => a.slice(-300)).join(' ‖ '));
    chk(!sy.some(t => /برگشت به پیش‌نیازِ «قضیهٔ فیثاغورس»/.test(t)) && sy.filter(t => /آموخته شد/.test(t)).slice(-2).every(t => /برگشت به مسئلهٔ اصلی/.test(t)), 'A23-23: the page lines return to the MAIN problem, never to the already-closed parent :: ' + JSON.stringify(sy.slice(-3)));
    u = await turn('فیثاغورس که تموم شده بود! ارتفاعِ هر دیواره ۱٫۸ متره. برگردم به مساحت: هر مثلث نصفِ ۲ × ۱٫۸ یعنی ۱٫۸ متر مربع، چهار تا میشه ۷٫۲ متر مربع.', 'آفرین.', [cs({ ph: 'c', said: ['result'], result: '۷٫۲ متر مربع' })]);
    chk(!/برگشت از پیش‌نیاز/.test(blockOf(u.user, /^# پیش‌نیاز \(/)), 'B·D10 / bank #44: she already took the step ⇒ no «برگشت از پیش‌نیاز» turn question afterwards :: ' + blockOf(u.user, /^# پیش‌نیاز \(/).slice(-300));
    R7.b44 = !rewrites(u).length && !/برگشت از پیش‌نیاز/.test(blockOf(u.user, /^# پیش‌نیاز \(/));
    // bank #42/#55/#56 — inner √ re-check: «۴۰٫۵» (no) ⇒ no pop; «۹» (yes) ⇒ ONE level up to «فیثاغورس», restated; parent re-check passes ⇒ parent closes, main step resumes
    await wipe(); await fresh();
    const pid = await bind('نردبان', 'نردبانی ۱۵ متری؛ پایه ۹ متر از دیوار؛ سرِ نردبان کجاست؟');
    await turn('فیثاغورس رو بلد نیستم', 'روی ضلع‌ها مربع بکش…', [cs({ ph: 'p', stuck: true, prereq: { concept: 'قضیهٔ فیثاغورس', step: 'ارتفاعِ دیوار (گامِ ۳)', quote: 'فیثاغورس رو بلد نیستم', q: 'روی ضلع‌های ۳ و ۴ مربع بکش؛ چند خانه؟' } })]);
    await turn('نه نمی‌دونم', 'a²+b²=c² …', [cs({ ph: 'p', prereq_res: { id: 'pq1', diag: 'missing', quote: 'نه نمی‌دونم' } })]);
    await turn('۲۲۵ − ۸۱ = ۱۴۴ ولی جذر گرفتن رو بلد نیستم', 'جذر یعنی …؛ √۸۱؟', [cs({ ph: 'p', stuck: true, prereq: { concept: 'جذر', step: 'رسیدن از ۱۴۴ به ضلع', quote: 'جذر گرفتن رو بلد نیستم', q: '√۸۱؟', parent: 'pq1' } })]);
    await turn('نمی‌دونم اصلاً', 'جذرِ ۸۱ عددی است که در خودش ضرب شود و ۸۱ شود. √۸۱؟', [cs({ ph: 'p', prereq_res: { id: 'pq2', diag: 'missing', quote: 'نمی‌دونم اصلاً' } })]);
    await turn('۴۰٫۵', 'نصف کردن نیست؛ ۹ × ۹ چند است؟', [cs({ ph: 'p', prereq_res: { id: 'pq2', mastery: 'no', quote: '۴۰٫۵' } })]);
    st = await pre({ pid }); T(55, st[1].st === 'teach' && st[0].st === 'teach' && !st[0].mp, st);
    u = await turn('۹', 'درست.', [cs({ ph: 'p', prereq_res: { id: 'pq2', mastery: 'yes', quote: '۹' } })]);
    st = await pre({ pid }); let sy2 = await sysMsgs(); const rw = rewrites(u).join(' ');
    T(42, st[1].st === 'learned' && st[0].st === 'teach' && !st[0].mp && sy2.some(t => /«جذر» آموخته شد .*برگشت به پیش‌نیازِ «قضیهٔ فیثاغورس»/.test(t)) && /برگردیم به پیش‌نیازِ «قضیهٔ فیثاغورس»/.test(rw), { st, sy: sy2.slice(-1), rw: rw.slice(-300) });
    await turn('پس √۱۴۴ = ۱۲ و دیوار ۱۲ متره', 'آفرین.', [cs({ ph: 'c', said: ['result'], result: 'دیوار ۱۲ متره', prereq_res: { id: 'pq1', mastery: 'yes', quote: 'پس √۱۴۴ = ۱۲ و دیوار ۱۲ متره' } })]);
    st = await pre({ pid }); sy2 = await sysMsgs();
    T(56, st.every(e => e.st === 'learned') && /برگشت به مسئلهٔ اصلی/.test(sy2.filter(t => /آموخته شد/.test(t)).pop() || ''), { st, sy: sy2.slice(-1) });
  });

  // ================= D23-13 / B·D10 — بازگوییِ اجباری نه کنارِ پرسشِ تشخیصیِ تازه، نه وقتی خودش گام را برداشت =================
  await section('rewrite', async () => {
    await wipe(); await fresh();
    const DP1 = 'سلام. پسرم یه سؤال آورده که خودمم بلد نیستم و خیلی وقته درس نخوندم: «مساحتِ مثلثی که ضلع‌هاش ۱۳ و ۱۴ و ۱۵ سانتی‌متره رو پیدا کنید.» فقط سه تا ضلع داریم؛ مساحت رو از کجا بیارم؟ می‌خوام اول خودم بفهمم که بتونم بهش یاد بدم.';
    await turn(DP1, 'مستطیل را بلدید؟', [cs({ ph: 'u', said: ['u', 'd'], stuck: true, register: 'شما', nat: 'objective' })]);
    let u = await turn('مستطیل رو بلدم، طول ضربدر عرض. مربع هم همین‌طور. مثلث رو یادم نیست؛ یه چیزی با نصف بود ولی نمی‌دونم نصفِ چی. راستش مغزم دیگه نمی‌کشه.',
      'اگر یک مستطیل را با یک خط از یک گوشه به گوشهٔ روبه‌رو ببُرید، دو تکه چه شکلی‌اند؟', [cs({ ph: 'u', said: ['d'], stuck: true, prereq: { concept: 'مساحتِ مثلث (نصفِ قاعده × ارتفاع)', step: 'مساحتِ مثلثِ ۱۳-۱۴-۱۵ را حساب کن', quote: 'مثلث رو یادم نیست؛ یه چیزی با نصف بود ولی نمی‌دونم نصفِ چی', q: 'اگر یک مستطیل را با یک خط از یک گوشه به گوشهٔ روبه‌رو ببُرید، دو تکه چه شکلی‌اند و هر کدام چه کسری از مستطیل است؟' } })]);
    const ab = blockOf(u.user, /^# پیش‌نیاز \(/);
    chk(/خودش را کم‌توان خواند \(«[^»]*مغزم دیگه نمی‌کشه[^»]*»\)/.test(ab) && !/«سلام\. پسرم/.test(ab.split('\n').filter(l => /کم‌توان/.test(l)).join('')), 'D23-15 dp3 p2: «مغزم دیگه نمی‌کشه» is a self-label; the line quotes the label itself, not the first 80 characters :: ' + ab.split('\n').filter(l => /کم‌توان/.test(l)).join('').slice(0, 300));
    R7.b46 = /مغزم دیگه نمی‌کشه/.test(ab);
    await turn('دو تا مثلثِ مساوی میشه، پس هر کدوم نصفِ مستطیله. ولی این مثلث‌ها گوشهٔ قائمه دارن؛ مثلثِ ۱۳، ۱۴، ۱۵ که گوشهٔ قائمه نداره.', 'یک مستطیلِ ۴ در ۶ …', [cs({ ph: 'e', stuck: true, prereq_res: { id: 'pq1', diag: 'missing', quote: 'ولی این مثلث‌ها گوشهٔ قائمه دارن؛ مثلثِ ۱۳، ۱۴، ۱۵ که گوشهٔ قائمه نداره' } })]);
    // dp3 p4 — mastery yes + a NEW prerequisite in the same report ⇒ the only question is the new diagnostic (no forced «همان گام را چطور برمی‌داری؟»)
    u = await turn('نصفِ ۴ در ۶ میشه ۱۲، نصفِ ۶ در ۶ میشه ۱۸، جمع ۳۰؛ که همون نصفِ ۱۰ ضربدر ۶ ـه. پس برای ۱۳-۱۴-۱۵ باید یه خطِ صاف از رأس روی ضلعِ ۱۴ بکشم؛ ولی طولش رو ندارم، فقط ضلع‌ها رو دارم. تو مثلثِ گوشه‌قائمه یادم نیست از دو ضلع چطوری ضلعِ سوم رو پیدا می‌کنن.',
      'نصفِ قاعده × ارتفاع را خودتان ساختید. یک مثلثِ گوشه‌قائمه با دو ضلعِ ۳ و ۴ بکشید — ضلعِ سوم چند می‌شود؟', [cs({ ph: 'p', said: ['plan'], stuck: true, prereq_res: { id: 'pq1', mastery: 'yes', quote: 'نصفِ ۴ در ۶ میشه ۱۲، نصفِ ۶ در ۶ میشه ۱۸، جمع ۳۰؛ که همون نصفِ ۱۰ ضربدر ۶ ـه' },
        prereq: { concept: 'رابطهٔ فیثاغورس', step: 'ارتفاع روی ضلعِ ۱۴ را از ضلع‌های ۱۳ و ۱۵ پیدا کن', quote: 'تو مثلثِ گوشه‌قائمه یادم نیست از دو ضلع چطوری ضلعِ سوم رو پیدا می‌کنن', q: 'دو ضلعِ ۳ و ۴ — ضلعِ سوم چند؟' } })]);
    chk(!rewrites(u).length, 'D23-13 dp3 p4: no mastery rewrite beside the new diagnostic :: ' + rewrites(u).map(a => a.slice(-300)).join(' ‖ '));
    // bank #43 (teen): «آهان پس فیثاغورس اینه، فهمیدم. ولی حالا این ۱۴۴ رو چطوری رادیکال بگیرم؟»
    await wipe(); await fresh();
    let pid = await bind('نردبانِ ۱۵', 'نردبانی ۱۵ متری؛ پایه ۹ متر؛ ارتفاع؟');
    await turn('فیثاغورس رو بلد نیستم', 'روی ضلع‌ها مربع بکش…', [cs({ ph: 'p', stuck: true, prereq: { concept: 'قضیهٔ فیثاغورس', step: 'ارتفاعِ دیوار', quote: 'فیثاغورس رو بلد نیستم', q: '۳ و ۴ ⇒ ؟' } })]);
    await turn('نه', 'a²+b²=c²؛ ۶ و ۸؟', [cs({ ph: 'p', prereq_res: { id: 'pq1', diag: 'missing', quote: 'نه' } })]);
    u = await turn('آهان پس فیثاغورس اینه، فهمیدم. ولی حالا این ۱۴۴ رو چطوری رادیکال بگیرم؟', '«قضیهٔ فیثاغورس» را داری؛ حالا جذر: √۸۱ چند است؟', [cs({ ph: 'p', prereq_res: { id: 'pq1', mastery: 'yes', quote: 'آهان پس فیثاغورس اینه، فهمیدم' },
      prereq: { concept: 'جذر', step: 'رسیدن از ۱۴۴ به ضلع', quote: 'این ۱۴۴ رو چطوری رادیکال بگیرم؟', q: '√۸۱ چند است؟' } })]);
    const nx = await p.evaluate(() => __turn('بلد نیستم', 'جذر یعنی …', [], [], null));
    T(43, !rewrites(u).length && nTQ(nx.user) === 1 && /پرسشِ تشخیصیِ «جذر»|«جذر»/.test(blockOf(nx.user, /^# پیش‌نیاز \(/).split('\n').filter(l => /\*\*پرسشِ این نوبت همین است/.test(l)).join('')), { rw: rewrites(u).length, nTQ: nTQ(nx.user) });
    // bank #44 — she took the waiting step herself ⇒ no forced restatement (see nested p10–p12)
    T(44, R7.b44 === true, R7.b44);
    // bp2 p6: diag+mastery yes (self-made) + new prereq + said result ⇒ no rewrite
    await wipe(); await fresh();
    pid = await bind('آبِ باران', 'پشت‌بوم ۵۰ متر مربع؛ بارش ۱۵۰ میلی‌متر؛ چند لیتر؟');
    await turn('ولی راستش دقیق یادم نیست یه متر چند میلی‌متره، مدرسه خیلی وقت پیش بود. فکر می‌کردم صدتاست.', 'یک خط‌کش…', [cs({ ph: 'e', stuck: true, prereq: { concept: 'تبدیلِ متر به میلی‌متر', step: 'نوشتنِ ۱۵۰ میلی‌متر بارش به متر', quote: 'دقیق یادم نیست یه متر چند میلی‌متره', q: 'یک متر چند سانتی‌متر است؟' } })]);
    u = await turn('آهان، صد ضرب در ده، میشه هزار میلی‌متر. پس ۱۵۰ میلی‌متر میشه ۰.۱۵ متر. ۵۰ × ۰.۱۵ = ۷.۵ متر مکعب. حالا این چند لیتره؟ اینو دیگه واقعاً نمی‌دونم.',
      '«یک متر = هزار میلی‌متر» را خودتان ساختید و همان گام را هم برداشتید. برای لیتر: مکعبی به ضلعِ ۱۰۰ سانتی‌متر چند مکعبِ ۱۰ سانتی جا می‌دهد؟', [cs({ ph: 'e', said: ['result'], stuck: true, prereq_res: { id: 'pq1', diag: 'missing', mastery: 'yes', quote: 'صد ضرب در ده، میشه هزار میلی‌متر. پس ۱۵۰ میلی‌متر میشه ۰.۱۵ متر' },
        prereq: { concept: 'تبدیلِ مترمکعب به لیتر', step: 'نوشتنِ ۷٫۵ مترمکعب به لیتر', quote: 'حالا این چند لیتره؟ اینو دیگه واقعاً نمی‌دونم', q: 'مکعبی به ضلعِ ۱۰۰ سانتی‌متر چند مکعبِ ۱۰ سانتی جا می‌دهد؟' } })]);
    chk(!rewrites(u).length, 'B·D10 / B·D22 bp2 p6: no forced restatement (the step was taken and a new diagnostic is the one question) :: ' + rewrites(u).map(a => a.slice(-300)).join(' ‖ '));
    // positive control (r22 contract unchanged): mastery yes, nothing taken, reply jumps to look-back ⇒ one rewrite
    u = await turn('مکعب ۱۰۰ سانتی ده‌تا در ده‌تا در ده‌تا، هزارتا! پس یک مترمکعب هزار لیتره.', 'آفرین! حالا کل را بازنگری کنیم.', [cs({ ph: 'e', prereq_res: { id: 'pq2', diag: 'missing', mastery: 'yes', quote: 'پس یک مترمکعب هزار لیتره' } })]);
    chk(rewrites(u).length === 1 && /به جای منتظر برگرد/.test(rewrites(u)[0]), 'control: a mastery that skips the waiting step (nothing taken, no new diagnostic) still gets the one rewrite :: ' + rewrites(u).length);
  });

  // ================= B·D1 / D23-15 — قاعدهٔ «خنگم» پس از بستن هم؛ برچسب‌های تازه؛ ضمیرِ «شما» =================
  await section('ability', async () => {
    await wipe(); await fresh();
    const BP1 = 'سلام. معلممون یه تمرین داده: ثابت کن برای هر nِ فرد، n² − 1 بر ۸ بخش‌پذیره. نمی‌دونم از کجا شروع کنم.';
    await turn(BP1, 'کلِ مسئله در یک جمله؟', [cs({ ph: 'u', said: ['u'], nat: 'objective' })]);
    await turn('نمی‌دونم n² − 1 رو چطوری به ضرب تبدیل کنم، اتحادش یادم نیست', 'x² − 49 را به ضربِ دو پرانتز می‌نویسی؟', [cs({ ph: 'p', stuck: true, prereq: { concept: 'تجزیهٔ a²−b² به (a−b)(a+b)', step: 'نوشتنِ n²−1 به‌صورتِ حاصل‌ضرب', quote: 'اتحادش یادم نیست', q: 'x² − 49 را به ضربِ دو پرانتز می‌نویسی؟' } })]);
    let st = await pre();
    await turn('(x−7)(x+7) چون x×x=x² و −7×7=−49 و بقیه خنثی', 'آفرین؛ پس n²−1 = (n−1)(n+1).', [cs({ ph: 'c', said: ['plan'], prereq_res: { id: st[0].id, diag: 'missing', mastery: 'yes', quote: '(x−7)(x+7)' } })]);
    await turn('دو عددِ زوجِ پشتِ هم، یکیشون بر ۴ بخش‌پذیره، پس ضربشون بر ۸. حل شد! با n=۳ و ۵ هم چک کردم: ۸ و ۲۴.', 'ثبت شد.', [{ do: 'chat_solved', title: 'n²−1 بر ۸', statement: 'ثابت کن برای هر nِ فرد، n² − 1 بر ۸ بخش‌پذیر است.', kind: 'prove', lesson: 'اول تجزیه کنم', check: 'با n=۳ و ۵ هم چک کردم', checkMsgs: ['با n=۳ و ۵ هم چک کردم: ۸ و ۲۴'] }]);
    const sc0 = await p.evaluate(() => JSON.stringify(APP.PRE.scope(__cur()) && { pid: APP.PRE.scope(__cur()).pid || '', sess: !!APP.PRE.scope(__cur()).sess }));
    let u = await turn('ممنون. راستش اولش فکر کردم خنگم.', 'خواهش.', [cs({})]);
    const ab = blockOf(u.user, /^# پیش‌نیاز \(/); let sy = await sysMsgs();
    chk(/خودش را کم‌توان خواند/.test(ab) && /تجزیهٔ a²−b²/.test(ab), 'B·D1 bp1 p10: after closure the ability rule still reaches the prompt, naming the gap :: ' + JSON.stringify(sc0) + ' ' + ab.slice(0, 300));
    chk(sy.some(t => /این کم‌هوشی نیست: گیر از نبودنِ «تجزیهٔ a²−b²/.test(t) && /نه توانِ تو/.test(t)), 'B·D1: the page line names the gap after closure («نه توانِ تو») :: ' + JSON.stringify(sy.slice(-2)));
    // bank #45 (teen, after closure)
    u = await turn('من کلاً خنگم، این چیزا تو کتم نمیره', 'باشه.', [cs({})]); sy = await sysMsgs();
    T(45, /خودش را کم‌توان خواند/.test(blockOf(u.user, /^# پیش‌نیاز \(/)) && sy.filter(t => /این کم‌هوشی نیست/.test(t)).length >= 2 && /دلداریِ کلی نده/.test(blockOf(u.user, /^# پیش‌نیاز \(/)), sy.slice(-1));
    // bank #53 joy / #54 someone else
    u = await turn('وای مغزم کار کرد!! حل شد', 'آفرین!', [cs({})]);
    T(53, !/کم‌توان/.test(blockOf(u.user, /^# پیش‌نیاز \(/)), blockOf(u.user, /^# پیش‌نیاز \(/).slice(0, 200));
    u = await turn('داداشم خنگه، هیچی بلد نیست', 'باشه.', [cs({})]);
    T(54, !/کم‌توان/.test(blockOf(u.user, /^# پیش‌نیاز \(/)) && !(await sysMsgs()).slice(-2).some(t => /کم‌هوشی نیست/.test(t) && /داداش/.test(t)), blockOf(u.user, /^# پیش‌نیاز \(/).slice(0, 200));
    // bank #46 (adult, during an open prerequisite) — «مغزم دیگه نمی‌کشه»
    await wipe(); await fresh();
    let pid = await bind('مساحت', 'مثلثی با قاعدهٔ ۸ و ارتفاعِ ۵؛ مساحت؟');
    await turn('مساحتِ مثلث رو یادم نیست', 'مستطیل را از قطر ببُر…', [cs({ ph: 'p', stuck: true, prereq: { concept: 'مساحتِ مثلث', step: 'گامِ ۱', quote: 'مساحتِ مثلث رو یادم نیست', q: 'نیمهٔ مستطیلِ ۲×۳؟' } })]);
    u = await turn('مغزم دیگه نمی‌کشه', 'باشه.', [cs({ stuck: true })]); sy = await sysMsgs(); let x = await ph(pid);
    T(46, R7.b46 && /خودش را کم‌توان خواند \(«مغزم دیگه نمی‌کشه»\)/.test(blockOf(u.user, /^# پیش‌نیاز \(/)) && sy.some(t => /این کم‌هوشی نیست: گیر از نبودنِ «مساحتِ مثلث»/.test(t)) && x.unk === 0 && x.knot === 0 && x.skill === 0, { sy: sy.slice(-1), x });
    // bank #47 (elder 64, «شما») — «بنده کلاً استعداد ریاضی ندارم»
    await wipe(); await fresh();
    pid = await bind('سود بانکی', 'سپردهٔ ۱۰۰ میلیونی با سودِ ۲۰٪ سالانه؛ ماهی چند؟');
    await turn('درصد گرفتن رو یادم رفته', 'بیست درصد یعنی چند از صد؟', [cs({ ph: 'p', stuck: true, register: 'شما', prereq: { concept: 'درصد گرفتن', step: 'سودِ سالانه', quote: 'درصد گرفتن رو یادم رفته', q: '۲۰٪ ِ ۱۰۰ چند است؟' } })]);
    await p.evaluate(() => { const s = __cur(); s.coach = s.coach || {}; s.coach.reg = 'shoma'; APP.S.put(s); });
    u = await turn('بنده کلاً استعداد ریاضی ندارم', 'باشه.', [cs({})]); sy = await sysMsgs();
    T(47, /خودش را کم‌توان خواند/.test(blockOf(u.user, /^# پیش‌نیاز \(/)) && /با «شما»/.test(blockOf(u.user, /^# پیش‌نیاز \(/)) && sy.some(t => /این کم‌هوشی نیست: گیر از نبودنِ «درصد گرفتن»/.test(t) && /نه استعدادِ شما/.test(t)), sy.slice(-1));
  });

  // ================= D23-16 / B·D22 — مسئلهٔ گفت‌وگو که زنده شد: پشته و 🧩 دنبالش می‌روند =================
  await section('follow', async () => {
    await wipe(); await fresh();
    await turn('سلام. پشت‌بوم انبارم ۵۰ متر مربعه. می‌خوام آب بارون رو جمع کنم برای آبیاری درختای جوون پسته. بارش سالانه‌ی اینجا حدود ۱۵۰ میلی‌متره. چقدر آب جمع میشه؟', 'کل در یک جمله؟', [cs({ ph: 'u', said: ['d'], nat: 'practical' })]);
    await turn('حالا ۷.۵ متر مکعب چند لیتره؟ اینو دیگه واقعاً نمی‌دونم.', 'مکعبِ ۱۰۰ سانتی چند مکعبِ ۱۰ سانتی دارد؟', [cs({ ph: 'e', stuck: true, prereq: { concept: 'تبدیلِ مترمکعب به لیتر', step: 'نوشتنِ ۷٫۵ مترمکعب به لیتر', quote: 'اینو دیگه واقعاً نمی‌دونم', q: 'مکعبِ ۱۰۰ سانتی چند مکعبِ ۱۰ سانتی دارد؟' } })]);
    const s0 = await sid(); const pq = (await pre())[0];
    chk(pq && pq.st === 'diag', 'chat stack opened :: ' + JSON.stringify(pq));
    // bp2 p8 — live_new and the mastery report in the SAME turn ⇒ the report lands (stack followed the problem), 🧩 gets the live pid
    await turn('ده تا در طول، ده تا در عرض، ده تا در ارتفاع... هزارتا! پس هر متر مکعب هزار لیتره و ۷.۵ متر مکعب میشه ۷۵۰۰ لیتر. آره، اینو تو «مسئله‌ی حل‌نشده‌ی خودم» ثبتش کن.', 'ساختم.', [
      { do: 'live_new', title: 'مخزنِ آبِ باران', statement: 'پشت‌بوم انبارم ۵۰ متر مربعه. می‌خوام آب بارون رو جمع کنم برای آبیاری درختای جوون پسته. بارش سالانه‌ی اینجا حدود ۱۵۰ میلی‌متره.', nat: 'practical' },
      cs({ ph: 'e', said: ['result'], result: '۷.۵ متر مکعب میشه ۷۵۰۰ لیتر', prereq_res: { id: pq.id, diag: 'missing', mastery: 'yes', quote: 'پس هر متر مکعب هزار لیتره' } })]);
    const pid = await p.evaluate(() => { const s = __cur(); return s.lprob || ''; });
    const r = await p.evaluate((pid) => { const x = APP.PRE.rec({ pid }); return x ? { pid: x.pid, items: (x.items || []).map(i => i.concept + ':' + i.state) } : null; }, pid);
    const st = await pre({ pid }); const x = await ph(pid);
    chk(!!pid && r && r.pid === pid && st.length === 1 && st[0].st === 'learned' && x.learned.includes('تبدیلِ مترمکعب به لیتر'), 'D23-16 / B·D22 bp2 p8: the chat stack follows the new live problem — the same-turn mastery lands, 🧩 carries the live pid, «پیش‌نیازهای آموخته» lists it :: ' + JSON.stringify({ pid, r, st, learned: x.learned }));
    R7.b48a = !!(r && r.pid === pid);
    // chat_solved path (dp1–dp3): the new (closed) live record also gets the 🧩 link
    await wipe(); await fresh();
    await turn('سلام. مثلثی با ضلع‌های ۵ و ۵ و ۶ داریم؛ مساحتش چنده؟', 'کل در یک جمله؟', [cs({ ph: 'u', said: ['u'], nat: 'objective' })]);
    await turn('ارتفاع رو چطوری پیدا کنم؟ فیثاغورس رو بلد نیستم', 'روی ضلع‌ها مربع بکش…', [cs({ ph: 'p', stuck: true, prereq: { concept: 'قضیهٔ فیثاغورس', step: 'ارتفاع روی ضلعِ ۶', quote: 'فیثاغورس رو بلد نیستم', q: '۳ و ۴ ⇒ ؟' } })]);
    await turn('۵² − ۳² = ۱۶ پس ارتفاع ۴ و مساحت ۱۲. حل شد؛ با کاغذ هم بریدم و جور شد.', 'ثبت شد.', [cs({ ph: 'b', said: ['result'], result: 'مساحت ۱۲', prereq_res: { id: 'pq1', diag: 'missing', mastery: 'yes', quote: '۵² − ۳² = ۱۶ پس ارتفاع ۴' } }),
      { do: 'chat_solved', title: 'مثلثِ ۵-۵-۶', statement: 'مساحتِ مثلثی با ضلع‌های ۵ و ۵ و ۶', kind: 'find', lesson: 'ارتفاع بکشم و فیثاغورس بزنم', check: 'با کاغذ هم بریدم و جور شد', checkMsgs: ['۵² − ۳² = ۱۶ پس ارتفاع ۴ و مساحت ۱۲. حل شد؛ با کاغذ هم بریدم و جور شد.'] }]);
    const pid2 = await p.evaluate(() => { const s = __cur(); return s.lprob || ((s.lprobLog || []).slice(-1)[0] || {}).p || ''; });
    const r2 = await p.evaluate((pid) => { const x = pid && APP.PRE.rec({ pid }); return x ? { pid: x.pid, n: (x.items || []).length } : null; }, pid2);
    chk(!!pid2 && r2 && r2.pid === pid2 && r2.n === 1, 'D23-16 dp1–dp3: after chat_solved the 🧩 record is linked to the new live problem (pid not empty) :: ' + JSON.stringify({ pid2, r2 }));
    T(48, R7.b48a && !!(r2 && r2.pid === pid2), { r2, a: R7.b48a });
  });

  // ================= Q6 — حلقهٔ قلمرو: منتظرِ برگه ⇒ ساخته شد ⇒ وارسی ⇒ «امروز» ⇒ از سر گرفتن (tA1، tB1، tC1، oD1) =================
  const CONSULT = { agree: true, area: 'sys-territory', kind: 'build', dup_of: null, reason: 'در نقشهٔ قلمرو نیست.', fix: {} };
  const G101 = { title: 'سنجشِ ایمنیِ یک ساختهٔ برقیِ خانگی (کم‌ولتاژ، کنارِ آب، بیرون)', area: 'sys-territory', kind: 'build', step: 'سنجشِ ایمنیِ برقِ کیت کنارِ آب',
    abstract: 'وقتی کاربر چیزی برقی می‌سازد که کنارِ آب و بیرون کار می‌کند، روشی منظم برای سنجشِ ایمنیِ برق لازم دارد.', missing: 'هیچ حوزه‌ای برای ایمنیِ برقِ ساخته‌های خانگی کنارِ آب نیست.',
    where: 'قلمروِ سامانه‌ها ‹ حلِ مسئله', how: 'حوزه با منابع و فهرستِ وارسیِ ایمنی', confidence: 0.9 };
  // DECISIONS_R24 R1 (D24-2/A24-6): a gap without gap.step no longer falls back to the «now» step — only gap.step (or a step naming «#n») marks a step waiting; so #102 now carries its step.
  const G102 = { title: 'جست‌وجوی پیشینه و ثبتِ اختراع', area: 'sys-territory', kind: 'build', step: 'جست‌وجوی پیشینه و ثبتِ اختراعِ کیت', abstract: 'پیش از فروشِ یک ساخته باید پیشینهٔ اختراع و راهِ ثبت را بداند.', missing: 'هیچ حوزه‌ای برای جست‌وجوی پیشینهٔ اختراع و ثبت نیست.', where: 'قلمروِ سامانه‌ها', how: 'حوزه + کاربرگ', confidence: 0.9 };
  const gapTurn = (text, g, reply, acts, n) => p.evaluate(([t, g, r, a, n]) => { __sheetNo.push(n); return __turn(t, r, a, [__consult()], { status: 'gap', gap: g }); }, [text, g, reply, acts || [], n]);
  await p.evaluate((c) => { window.__consult = () => c; }, CONSULT);
  const sysAll = () => p.evaluate(() => APP.PRE.sysAll().map(x => ({ id: x.e.id, n: x.e.number, st: x.e.state, step: x.e.step, sc: x.sc.pid ? 'pid' : 'sess', tool: (x.e.tool || {}).id || '', checks: (x.e.checks || []).length })));
  const today = () => p.evaluate(() => APP.dueList().filter(x => x.sys23).map(x => x.txt));
  await section('territory', async () => {
    await wipe(); await fresh();
    // bank #160 / #167 — ordinary stuck, no sheet ⇒ no marker; a gap for an idea with no problem in focus ⇒ no waiting point invented
    await turn('یه ایده دارم ولی نمی‌دونم از کجا', 'کدام ایده؟', [cs({ stuck: true })]);
    T(160, (await sysAll()).length === 0, await sysAll());
    await fresh();
    let u = await gapTurn('می‌خوام یه دفترِ نمودارِ سه‌بعدی برای ایده‌هام داشته باشم؛ اینجا همچین ابزاری هست؟', { title: 'نمودارِ سه‌بعدیِ ایده‌ها', area: 'sys-territory', kind: 'build', abstract: 'دیدنِ ایده‌ها در سه بعد', missing: 'ابزارِ سه‌بعدی نیست', where: 'نقشه‌ها', how: 'نمای تازه', confidence: 0.9 }, 'نیست؛ برای ثبت بررسی می‌کنم.', [], 177);
    const s167 = await p.evaluate(() => ({ rep: (__cur().reports || []).length, route: !!APP.ROUTE.model(__cur().id) && APP.ROUTE.model(__cur().id).dets.filter(d => d.kind === 'sys').length }));
    T(167, (await sysAll()).length === 0 && s167.rep === 1 && !s167.route, { s167, all: await sysAll() });
    // tA1 — live problem; sheet #101 for the safety sub-problem
    await wipe(); await fresh();
    const pid = await bind('کیتِ آبیاریِ خورشیدی', 'برای باغچهٔ پدر و مادرم کیتِ آبیاریِ قطره‌ایِ خورشیدی می‌سازم: آبِ روزانه، مخزن، دبیِ پمپ، پنل و باتری، ایمنیِ برق کنارِ آب و ثبتِ اختراع.');
    await turn('آبِ روزانه رو با داده حساب کردم؛ مخزن ۳۰۰ لیتری بسه.', 'خوب.', [cs({ ph: 'c', said: ['result'], result: 'مخزن ۳۰۰ لیتری' })]);
    const TA1 = 'حالا ایمنیش: پمپ ۱۲ ولته و کنارِ آب و بیرونه. چطوری مطمئن بشم برق‌گرفتگی نمیده؟ تو این صفحه برای سنجشِ ایمنی چیزی هست؟ گیر کردم.';
    u = await gapTurn(TA1, G101, 'نیست — در «🗺 قلمروِ سامانه‌ها» نگاه کردم؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'c', stuck: true })], 101);
    let A = await sysAll();
    chk(A.length === 1 && A[0].n === 101 && A[0].st === 'wait' && A[0].sc === 'pid' && /ایمنی/.test(A[0].step), 'A23-36 tA1: the sub-problem is marked «منتظرِ برگهٔ #۱۰۱» on the live problem :: ' + JSON.stringify(A));
    let x = await ph(pid), E1 = await ev();
    chk(x.sys >= 1 && x.unk === 0 && noFail(x) && E1.some(e => e.cause === 'sys' && String(e.sheet) === '101'), 'C23-2 tC1: the stuck that led to the gap sheet is cause «سامانه», not her weakness :: ' + JSON.stringify([x, E1]));
    R7.b41 = x.sys >= 1 && x.unk === 0;
    // 🔭, route map, dossier (#150)
    const v150 = await p.evaluate((pid) => { APP.go('lprob', pid); const c = document.querySelector('#main .lp-syscard'); const M = APP.ROUTE.model(pid); const d = M.dets.filter(d => d.kind === 'sys')[0];
      const svg = Array.prototype.map.call(APP.ROUTE.box(pid).el.querySelectorAll('[data-full]'), x => x.getAttribute('data-full')).join(' | '); const dz = APP.dossier(pid).events.filter(e => e.k === 'syswait')[0];
      return { card: c ? c.textContent : '', open: d && d.open, remain: M.remain, svg: /⏸ منتظرِ برگهٔ #۱۰۱ — سنجشِ ایمنی/.test(svg), dz: dz ? dz.title + ' @' + dz.at.slice(0, 10) : '' }; }, pid);
    T(150, /منتظرِ برگهٔ #۱۰۱/.test(v150.card) && v150.open && v150.svg && /منتظرِ برگهٔ #۱۰۱/.test(v150.remain) && /#۱۰۱/.test(v150.dz) && /@\d{4}-\d{2}-\d{2}/.test(v150.dz), v150);
    chk(/منتظرِ برگهٔ #۱۰۱/.test(v150.card) && v150.svg && /#۱۰۱/.test(v150.dz), 'A23-36 / D23-24: 🔭 card, route map point and dossier line carry the sheet id :: ' + JSON.stringify(v150));
    // next turn: prompt carries the waiting record (#154 «آمد؟» ⇒ «هنوز نه — برگهٔ #۱۰۱ باز است»; #158 honest «وقتی ساخته شد خودم خبرت می‌کنم»)
    u = await turn('اون ابزاری که منتظرش بودیم بالاخره اومد؟', 'هنوز نه — برگهٔ #۱۰۱ باز است.', [cs({})]);
    const wl = blockOf(u.user, /^# پیش‌نیاز \(/).split('\n').filter(l => /گام‌های منتظرِ برگه/.test(l)).join('');
    T(154, /«سنجشِ ایمنیِ برقِ کیت کنارِ آب» منتظرِ برگهٔ #۱۰۱/.test(wl) && /هنوز نه — برگهٔ #۱۰۱ باز است/.test(wl), wl.slice(0, 400));
    T(158, /وقتی ساخته شد صفحه خودش خبر می‌دهد و همین گام را از سر می‌گیریم/.test(wl) && /انتظار ضعفِ او نیست/.test(wl), wl.slice(0, 400));
    // #164 — an unknown sheet id in her message ⇒ nothing resumed; plain context line
    u = await turn('پاسخ به برگه‌ی دستیار #999', 'چنین گامِ منتظری این‌جا نیست.', [cs({})]);
    T(164, /برگهٔ #۹۹۹ در گام‌های منتظرِ این مسئله نیست/.test(blockOf(u.user, /^# پیش‌نیاز \(/)) && (await sysAll()).every(e => e.st === 'wait'), blockOf(u.user, /^# پیش‌نیاز \(/).slice(-300));
    // tA1 p7–p8 — second sheet #102 (patent search) on the same problem
    u = await gapTurn('سابقه و ثبتِ اختراعش رو چطوری بفهمم؟ کسی قبلاً ساخته؟', G102, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'c' })], 102);
    A = await sysAll(); chk(A.length === 2 && A[1].n === 102 && A[1].st === 'wait', 'second waiting sub-problem #102 :: ' + JSON.stringify(A));
    // #161 — D3: an unrelated registry change ⇒ nothing
    await p.evaluate(() => { __day = '2026-10-22'; __addArea('s_learn', { id: 'ln_sleep_zz', fa: 'خواب و تثبیتِ حافظه', desc_fa: 'نقشِ خوابِ شبانه در یادسپاری', key_questions_fa: ['خواب چه نقشی در یادگیری دارد؟'], tools: ['view:lprob'], claims: [] }); });
    await p.evaluate(() => APP.PRE.sysCheck());
    A = await sysAll(); let td = await today();
    T(161, A.every(e => e.st === 'wait') && !td.length, { A, td });
    // #151 — D3: the registry gains the matching tool ⇒ noticed on load, verified, Today line, resume
    await p.evaluate(() => __addArea('s_problem', { id: 'pr_elec_safety_zz', fa: 'سنجشِ ایمنیِ برقِ ساخته‌های خانگی کنارِ آب', desc_fa: 'فهرستِ وارسیِ ایمنیِ برق برای ساخته‌های کم‌ولتاژ بیرون و کنارِ آب', key_questions_fa: ['برق‌گرفتگی کنارِ آب چطور سنجیده می‌شود؟'], tools: ['view:lprob'], claims: [] }));
    await p.evaluate(() => { APP.go('home'); });   // «on load»: the render sweep notices it
    await p.waitForTimeout(150);
    A = await sysAll(); td = await today(); let sy = await sysMsgs();
    chk(A[0].st === 'arrived' && A[0].tool === 'pr_elec_safety_zz' && A[1].st === 'wait', 'A23-37 / C23-18 / D23-37: the page noticed the built territory (registry change) and verified it answers the waiting step :: ' + JSON.stringify(A));
    chk(td.some(t => /🛎 ابزارِ لازم آمد: «سنجشِ ایمنیِ برقِ ساخته‌های خانگی کنارِ آب» — گامِ «سنجشِ ایمنیِ برقِ کیت کنارِ آب»/.test(t)), 'B·D7: a Today line «ابزارِ لازم آمد» :: ' + JSON.stringify(td));
    chk(sy.some(t => /🛎 ابزارِ لازم آمد/.test(t) && /همان گام را از سر می‌گیریم/.test(t)), 'the same news in the problem\'s conversation :: ' + JSON.stringify(sy.slice(-2)));
    // #156 — she opens the problem / writes ⇒ the turn question resumes exactly at the waiting step, place restated
    u = await turn('سلام، برگشتم.', 'ابزارِ ایمنی آمد؛ برگردیم به گامِ «سنجشِ ایمنیِ برقِ کیت کنارِ آب».', [cs({})]);
    const rb = blockOf(u.user, /^# پیش‌نیاز \(/);
    const okResume = /\*\*پرسشِ این نوبت همین است:\*\* \(از سر گرفتنِ گامِ منتظرِ ابزار\) ابزارِ «سنجشِ ایمنیِ برقِ ساخته‌های خانگی کنارِ آب» برای گامِ «سنجشِ ایمنیِ برقِ کیت کنارِ آب» آمد \(برگهٔ #۱۰۱\)/.test(rb) && /برگردیم به مسئلهٔ «کیتِ آبیاریِ خورشیدی»، گامِ «سنجشِ ایمنیِ برقِ کیت کنارِ آب»/.test(rb) && nTQ(u.user) === 1;
    T(156, okResume, rb.slice(-600) + ' nTQ=' + nTQ(u.user));
    A = await sysAll(); td = await today();
    T(151, A[0].st === 'resumed' && !td.some(t => /ایمنی/.test(t)), { A, td });
    // #159 — dossier history: «منتظرِ #101 (D0) ⇐ ابزار آمد (D3) ⇐ ادامه», nothing deleted
    const h159 = await p.evaluate((pid) => APP.dossier(pid).events.filter(e => /^sys/.test(e.k)).map(e => e.k + '|' + e.title), pid);
    T(159, h159.some(t => /^syswait\|⏸ منتظرِ برگهٔ #۱۰۱/.test(t)) && h159.some(t => /^sysback\|🛎 ابزارِ لازم آمد/.test(t)) && h159.some(t => /^sysresume\|↩ گامِ/.test(t)), h159);
    const rt = await p.evaluate((pid) => { const M = APP.ROUTE.model(pid); return M.dets.filter(d => d.kind === 'sys').map(d => d.sheet + ':' + d.open + ':' + (d.rejoin != null)); }, pid);
    chk(rt.includes('101:false:true') && rt.includes('102:true:false'), 'route map: #101 rejoins the line after the tool came; #102 still open (dotted) :: ' + JSON.stringify(rt));
    // #157 — the waiting days are never booked as her stuck
    x = await ph(pid); T(157, x.unk === 0 && x.sys >= 1 && noFail(x) && x.weakest === '', x);
    // #152 — sheet #102 closed with «پاسخ به برگهٔ دستیار #102» naming the built area ⇒ verify ⇒ Today ⇒ resume
    await p.evaluate(() => { __addArea('s_problem', { id: 'pr_patent_zz', fa: 'جست‌وجوی پیشینهٔ اختراع و ثبتِ آن', desc_fa: 'پیش از فروش: پیشینهٔ اختراع و راهِ ثبت', key_questions_fa: ['کسی پیش‌تر ساخته؟'], tools: [], claims: [] }); });
    await p.evaluate(() => { __sheets.sh102 = { id: 'sh102', number: 102, status: 'answered', notes: [{ id: 'n1', by: 'reviewer', at: new Date().toISOString(), text: 'پاسخ به برگهٔ دستیار #102 — حوزهٔ pr_patent_zz ساخته شد.' }] }; });
    await p.evaluate(() => APP.PRE.sysCheck());
    A = await sysAll(); td = await today();
    T(152, A[1].st === 'arrived' && A[1].tool === 'pr_patent_zz' && td.some(t => /ابزارِ لازم آمد: «جست‌وجوی پیشینهٔ اختراع/.test(t)), { A, td });
    u = await turn('خب حالا پیشینه.', 'برگردیم به گامِ پیشینه.', [cs({})]);
    A = await sysAll(); T(155, A[0].st === 'resumed' && A[1].st === 'resumed', A);
    // #155 — two sheets on one problem: #103 resolves, #104 stays waiting
    await wipe(); await fresh();
    const pidB = await bind('هشدارِ یخ‌زدگی', 'یه دستگاهِ ارزون برای هشدارِ یخ‌زدگیِ باغ می‌سازم.');
    const G103 = { title: 'حلِ تضادِ فنی در طراحیِ اختراع (اصولِ جداسازی / TRIZ)', area: 'sys-territory', kind: 'build', step: 'حلِ تضادِ ارزان ⇄ دقیقِ سنسور', abstract: 'وقتی در طراحیِ یک ابزار یا اختراع دو ویژگیِ مطلوب با هم در تضادند (ارزان ⇄ دقیق، سبک ⇄ محکم)، کاربر روشی منظم لازم دارد که تضاد را به‌جای سازشِ میانه حل کند: جداسازی در زمان، مکان، شرط یا سطح.', missing: 'هیچ حوزه‌ای در قلمروِ «حلِ مسئله» برای «تضادِ فنی» (اصولِ جداسازی، TRIZ) نیست.', where: 'قلمروِ سامانه‌ها ‹ حلِ مسئله', how: 'حوزه با منابعِ معتبر و حرکتِ «جداسازی»', confidence: 0.9 };
    const TC7 = 'قاعده: عصر دما و رطوبت رو می‌گیرم، نقطهٔ شبنم رو حساب می‌کنم؛ اگه زیرِ ۱ درجه بود و آسمون صاف، پیامک می‌دم. ولی گیرِ اصلیم اینجاست: سنسورِ ارزون دقتش ±۲ درجه‌ست؛ دقیقِ ±۰٫۳ حدود ۳ میلیونه. هر چی ارزون‌تر، بی‌دقت‌تر — این دو تا با هم تضاد دارن. شنیدم یه روشی به اسم TRIZ هست برای حلِ همین‌جور تضادهای فنی. تو این سامانه چیزی برای این هست؟';
    await gapTurn(TC7, G103, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'p', stuck: true })], 103);
    await gapTurn('برای سنجشِ ایمنیِ برقِ دستگاه کنارِ آبِ آبیاری هم چیزی نیست؟', Object.assign({}, G101, { step: 'ایمنیِ برقِ دستگاه کنارِ آب' }), 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'p' })], 104);
    x = await ph(pidB); chk(x.sys >= 1 && x.unk === 0 && x.weakest === '', 'C23-2 tC1 p7: the TRIZ stuck is cause «سامانه», «فهمِ مسئله» not lowered :: ' + JSON.stringify(x));
    R7.b41b = x.sys >= 1 && x.unk === 0;
    // tC1 p11 — «اون برگهٔ کمبودی که گفتی ثبت کردی چی شد؟ … خودت می‌فهمی و برمی‌گردی سراغِ مسئلهٔ من؟» ⇒ the prompt carries the waiting record and the page's promise (C23-18)
    u = await turn('آزمایش کردم: نزدیکِ صفر، سنسورِ ارزون همیشه حدودِ ۱٫۸ درجه بالاتر نشون داد. حالا یه سؤال: اون برگهٔ کمبودی که گفتی ثبت کردی چی شد؟ اگه یه روز اون روشِ تضاد رو ساختن، خودت می‌فهمی و برمی‌گردی سراغِ مسئلهٔ من؟',
      'هنوز باز است؛ وقتی ساخته شد صفحه خودش خبر می‌دهد.', [cs({ ph: 'b', said: ['result'], result: 'خطای ثابتِ ۱٫۸ درجه' })]);
    const w11 = blockOf(u.user, /^# پیش‌نیاز \(/).split('\n').filter(l => /گام‌های منتظرِ برگه/.test(l)).join('');
    chk(/«حلِ تضادِ ارزان ⇄ دقیقِ سنسور» منتظرِ برگهٔ #۱۰۳/.test(w11) && /وقتی ساخته شد صفحه خودش خبر می‌دهد و همین گام را از سر می‌گیریم/.test(w11), 'C23-18 tC1 p11: the prompt answers from the waiting record (sheet #103 open; the page notices and resumes) :: ' + w11.slice(0, 400));
    await p.evaluate(() => { __sheets.sh103 = { id: 'sh103', number: 103, status: 'answered', notes: [{ id: 'n3', by: 'reviewer', at: new Date().toISOString(), text: 'پاسخ به برگهٔ دستیار #103 — حوزهٔ pr_contradiction_zz ساخته شد.' }] };
      __addArea('s_problem', { id: 'pr_contradiction_zz', fa: 'حلِ تضادِ فنی با جداسازی (TRIZ)', desc_fa: 'وقتی دو ویژگیِ مطلوب در تضادند: جداسازی در زمان، مکان، شرط یا سطح', key_questions_fa: ['تضاد دقیقاً در کدام شرط لازم است؟'], tools: [], claims: [] }); });
    await p.evaluate(() => APP.PRE.sysCheck());
    A = await sysAll(); const a155 = A.filter(e => e.n === 103)[0], b155 = A.filter(e => e.n === 104)[0];
    chk(a155.st === 'arrived' && b155.st === 'wait', 'bank #155: only #103\'s step resumes; #104 stays waiting :: ' + JSON.stringify(A));
    R7.b155 = a155.st === 'arrived' && b155.st === 'wait';
    // #162 — #104 closed «ساخته نمی‌شود» ⇒ no resume; honest Today/dossier line; step stays open
    await p.evaluate(() => { __sheets.sh104 = { id: 'sh104', number: 104, status: 'closed', notes: [{ id: 'n4', by: 'reviewer', at: new Date().toISOString(), text: 'پاسخ به برگهٔ دستیار #104 — ساخته نمی‌شود: بیرون از قلمروِ این صفحه است.' }] }; });
    await p.evaluate(() => APP.PRE.sysCheck());
    A = await sysAll(); td = await today(); const dz162 = await p.evaluate((pid) => APP.dossier(pid).events.filter(e => e.k === 'sysno').map(e => e.title + ' ' + e.lines.join(' ')), pidB);
    T(162, A.filter(e => e.n === 104)[0].st === 'declined' && td.some(t => /⛔ برگهٔ #۱۰۴ بی ساختن بسته شد/.test(t)) && dz162.some(t => /باز می‌ماند — از راهِ دیگری/.test(t)), { A, td, dz162 });
    // #163 — a tool built for #105 but it does not answer the step ⇒ not resumed, mismatch recorded, note under the sheet
    await gapTurn('برای پیش‌بینیِ آب‌وهوای محلی از روی دادهٔ چند سنسور ابزاری هست؟', { title: 'پیش‌بینیِ آب‌وهوای محلی از دادهٔ سنسور', area: 'sys-territory', kind: 'build', step: 'پیش‌بینیِ دمای شب از دادهٔ سنسور', abstract: 'پیش‌بینیِ کوتاه‌مدتِ آب‌وهوا از دادهٔ محلی', missing: 'حوزهٔ پیش‌بینیِ آب‌وهوا نیست', where: 'قلمرو', how: 'حوزه', confidence: 0.9 }, 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'p' })], 105);
    await p.evaluate(() => { __sheets.sh105 = { id: 'sh105', number: 105, status: 'answered', notes: [{ id: 'n5', by: 'reviewer', at: new Date().toISOString(), text: 'پاسخ به برگهٔ دستیار #105 — حوزهٔ ln_sleep_zz را کامل کردیم.' }] }; });
    const nN = await p.evaluate(() => __notes.length);
    await p.evaluate(() => APP.PRE.sysCheck());
    A = await sysAll(); const e163 = A.filter(e => e.n === 105)[0]; const notes = await p.evaluate(() => __notes.slice());
    T(163, e163.st === 'wait' && e163.checks >= 1 && notes.length === nN + 1 && /جواب نمی‌دهد/.test(notes[notes.length - 1].t), { e163, notes: notes.slice(-1) });
    // #165 — she solves #105's step another way before the tool comes ⇒ marker closed with history; a later arrival never resumes it
    await turn('پیش‌بینیِ دمای شب رو خودم از روی نقطهٔ شبنم درآوردم، دیگه لازم نیست.', 'عالی.', [cs({ ph: 'c', sys_done: { sheet: 105, quote: 'پیش‌بینیِ دمای شب رو خودم از روی نقطهٔ شبنم درآوردم' } })]);
    await p.evaluate(() => { __addArea('s_problem', { id: 'pr_weather_zz', fa: 'پیش‌بینیِ دمای شب و آب‌وهوای محلی از دادهٔ سنسور', desc_fa: 'پیش‌بینیِ کوتاه‌مدت', key_questions_fa: [], tools: [], claims: [] }); });
    await p.evaluate(() => APP.PRE.sysCheck());
    A = await sysAll(); td = await today();
    T(165, A.filter(e => e.n === 105)[0].st === 'other' && !td.some(t => /پیش‌بینیِ دمای شب/.test(t)), { A, td });
    // #166 — a tool arrives for an already-closed problem ⇒ not reopened
    await gapTurn('برای ثبتِ نتیجهٔ آزمایشِ میدانی روزبه‌روز ابزاری هست؟', { title: 'دفترِ آزمایشِ میدانیِ روزانه', area: 'sys-territory', kind: 'build', step: 'ثبتِ روزانهٔ آزمایشِ میدانیِ سنسور', abstract: 'دفترِ آزمایشِ میدانی وصل به گامِ آزمون', missing: 'دفترِ آزمایشِ میدانی نیست', where: 'قلمرو', how: 'کاربرگ', confidence: 0.9 }, 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'c' })], 106);
    await p.evaluate((pid) => __liveSet(pid, (so, L) => { L.state = 'solved'; }), pidB);
    await p.evaluate(() => { __addArea('s_problem', { id: 'pr_fieldlog_zz', fa: 'دفترِ آزمایشِ میدانیِ روزانه برای سنسور', desc_fa: 'ثبتِ روزانهٔ آزمایشِ میدانی', key_questions_fa: [], tools: [], claims: [] }); });
    await p.evaluate(() => APP.PRE.sysCheck());
    A = await sysAll(); const st166 = await p.evaluate((pid) => (APP.S.get('eprog_' + pid).solve.live || {}).state, pidB);
    T(166, A.filter(e => e.n === 106)[0].st === 'moot' && st166 === 'solved', { A, st166 });
    T(41, R7.b41 && R7.b41b, { a: R7.b41, b: R7.b41b });
    // #52 — the tool exists and worked; no sheet ⇒ not cause «سامانه»
    await wipe(); await fresh();
    const pidC = await bind('نمودار', 'نمودارِ y = x² را بکش و ببین چرا متقارن است.');
    await turn('نمودارشو کشیدم ولی نمی‌فهمم چرا اینجوریه', 'x و −x را امتحان کن.', [cs({ ph: 'b', stuck: true })]);
    x = await ph(pidC); T(52, x.sys === 0 && x.unk === 1, x);
    await p.evaluate(() => { ['ln_sleep_zz', 'pr_elec_safety_zz', 'pr_patent_zz', 'pr_contradiction_zz', 'pr_weather_zz', 'pr_fieldlog_zz'].forEach(__dropArea); });
  });

  // ================= B·D16 / D23-36 — «نقشهٔ سامانه» در پرامپت: قلمروها هرگز پیش از تشخیصِ کمبود بریده نمی‌شوند =================
  await section('manifest', async () => {
    await wipe(); await fresh();
    const r = await p.evaluate(() => {
      const s = __cur(); s.msgs.push({ role: 'user', text: 'برای حلِ تضادِ فنی ابزاری هست؟', at: new Date().toISOString() });
      const up = APP.ASSIST.prompt(s, 'برای حلِ تضادِ فنی ابزاری هست؟', APP.ASSIST.scan(), 'متنِ پیوست: ' + 'ا'.repeat(36000));
      const man = up.split('# امروز')[0];
      const full = APP.ASSIST.manifest(), terr = full.slice(full.indexOf('## قلمروِ سامانه‌ها'));
      return { cut: man.length < full.length, hasTerr: man.indexOf(terr.trim()) >= 0, s_comm: /\n- s_social |\n- s_comm /.test(man) || /s_social|s_comm/.test(terr) && man.indexOf(terr.trim()) >= 0, s_self: man.indexOf('- s_self ') >= 0, owner: /## چه کسی مسئولِ چیست/.test(man), lost: /بقیهٔ نقشهٔ سامانه جا نشد/.test(up), n: man.length, f: full.length };
    });
    chk(r.cut && r.hasTerr && r.s_self && r.owner && !r.lost, 'B·D16 / D23-36 tB1/oD1: under pressure the «قلمروِ سامانه‌ها» list (all six systems incl. s_self) and «چه کسی مسئولِ چیست» stay whole; other parts are shortened with notice :: ' + JSON.stringify(r));
    T(153, r.cut && r.hasTerr && r.s_self && r.owner && !r.lost, r);
  });

  // ================= bank: entries checked above or pure model behaviour =================
  await section('bank', async () => {
    T(38, !!(R7.b38 && R7.b38.blk && R7.b38.st.length === 1 && R7.b38.st[0].st === 'diag' && R7.open1), R7.b38);
    T(39, R7.b39 === true, R7.b39);
    const missing = BANK.map((e, i) => i).filter(i => own(i) && info.bank[i] === undefined && info.nc[i] === undefined);
    chk(!missing.length, 'bank: every Q2/Q6 entry is tested or has a reason :: ' + JSON.stringify(missing));
  });

  const nb = Object.keys(info.bank).length, nbOk = Object.values(info.bank).filter(Boolean).length;
  console.log('bank Q2/Q6: ' + nbOk + '/' + nb + ' pass; nc: ' + Object.keys(info.nc).length);
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
