// تورِ پولیا (دستهٔ ۱، دورِ ۲) — ادغامِ G1 (تونلِ «🔭»، a38) و G2 (دستیار/مربی/تور، a26/a27/a28/a32): هر سیم از راهِ APIهای **واقعیِ** a38، یک منبعِ حقیقت.
//  W1 پیوند: AS.sessLink / پوششِ S.put فقط A.liveBindSession(pid, s, {force}) را صدا می‌زنند و برگشتِ false را محترم می‌دارند؛ خواندنِ پیوند A.liveSessionPid؛
//     پوششِ دوم (bindGuard) دیگر نیست؛ فرمِ «🔭» پیوندِ باز را عوض نمی‌کند؛ رفتن به صفحهٔ مسئلهٔ دیگر و حرف زدن ⇒ force.
//  W2 liveCtx: سشنِ بسته همیشه بلوکِ زنده را می‌گیرد، بی شرطِ واژهٔ مشترک؛ مسئلهٔ بسته‌شده دیگر «مسئلهٔ زندهٔ این سشن» نیست.
//  W3 مربی: مرحله، رده و فهرست از A.liveCoach/A.livePhaseQs؛ در هر نوبت فقط **یک** پرسش (همان liveCoach.q)، مربی پرسشِ دومی پیشنهاد نمی‌کند؛
//     «حل شد» ِ گفت‌وگو مرحلهٔ صفحه را عوض نمی‌کند؛ مسئلهٔ فقط‌درگفت‌وگو هنوز فهرستِ خودِ مربی را می‌گیرد.
//  W4 تور: نشانه‌های وجهِ عینی از A.liveKind و step.out.kind === "proof"؛ «سرانجام» از A.liveClosure (ناتمام ≠ حل شد)؛ بازنگریِ دستیار ≠ بازنگریِ کاربر.
//  W5 پیوست: پیوستِ گفت‌وگو از راهِ A.liveAttach به همان مسئله (بی تکرار)؛ سشنِ نابسته نه.
//  W6 نوع/فضایی: A.liveKindInfo؛ chat_invent با origin {type:"lprob", id} ⇒ ارثِ a38 (by: parent، فضایی)، نه حدسِ دستیار.
//  W7 «امروز»: یک منبع (a38)؛ «و k تای دیگر»، «n روز پیش»، «ساخته‌شده در گفت‌وگو»؛ لایهٔ رونویسِ a27 نیست؛ هر سطر یک بار در صفحهٔ خانه.
//  W8 دادهٔ «به کار رفته»: بلوکِ زنده/مربی فقط از A.liveUnused؛ یک سطر؛ نام بردن در گفت‌وگو نه.
// رابطِ واقعی (پنجرهٔ دستیار، صفحهٔ خانه)، مدلِ بدلی؛ هر سیم با نمونهٔ منفی. خروج با کدِ غیرصفر در خطا.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  await p.goto(FILE); await p.waitForSelector('.nav');
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__up = []; window.__day = APP.today();
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }),
      upload: async (rid, f) => { __up.push({ rid, name: f.name }); return { id: 'f' + __up.length, name: f.name, mime: f.type || '', link: 'https://drive.example/f' + __up.length }; } };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); const r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    // جاسوس (نه جایگزین): هر صدا زدنِ A.liveBindSession ِ واقعیِ a38 ثبت می‌شود و همان را برمی‌گرداند
    window.__bind = []; const raw = APP.liveBindSession;
    APP.liveBindSession = function (pid, sess, o) { const r = raw.apply(this, arguments); __bind.push({ pid, sess: sess && sess.id, force: !!(o && o.force), r }); return r; };
    APP.liveLinkSession = APP.liveBindSession;
  });
  // گفت‌وگو از راهِ رابطِ واقعیِ پنجرهٔ دستیار
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
  };
  const newSess = () => p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => (__calls[__calls.length - 1] || {}).user || '');
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const LIVE = '# مسئلهٔ زندهٔ این سشن (', COACH = '# مربیِ حل';

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  // ---------- W1) پیوند: یک منطق (a38)، false محترم ----------
  await newSess(); await p.evaluate(() => APP.go('home'));
  await p.evaluate(() => { __bind.length = 0; __q.push(R({ reply: 'ثبتش کردم.', actions: [{ do: 'live_new', title: 'قفسهٔ کتاب', statement: 'نمی‌دونم قفسهٔ کتاب رو کنارِ پنجره بذارم یا کنارِ در؛ نورِ آفتاب کتاب‌ها رو زرد می‌کنه.', nat: 'life' }] })); });
  await say('نمی‌دونم قفسهٔ کتاب رو کنارِ پنجره بذارم یا کنارِ در؛ نور کتاب‌ها رو زرد می‌کنه');
  info.w1 = await p.evaluate(() => { const s = APP.ASSIST.cur(); return { sid: s.id, pid: s.lprob, read: APP.liveSessionPid(s), viaA38: __bind.some(x => x.pid === s.lprob && x.r === true), noG2Wrap: !APP.liveBindSession._g2 && !APP.dueList._r2 }; });
  // chat_solved ِ مسئلهٔ دیگر در همین سشن: سشن به مسئلهٔ بازِ دیگری بسته است ⇒ a38 «false» می‌دهد و پیوند می‌ماند
  await p.evaluate(() => { __bind.length = 0; __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'chat_solved', title: 'مجموعِ زاویه‌ها', statement: 'مجموعِ زاویه‌های داخلیِ پنج‌ضلعی چند درجه است؟', kind: 'find', lesson: 'به سه مثلث می‌شکنم', check: 'با مربع امتحان کردم' }] })); });
  await say('یه چیزِ دیگه: مجموعِ زاویه‌های پنج‌ضلعی رو حل کردم، به سه مثلث می‌شکنم');
  Object.assign(info.w1, await p.evaluate((pid) => { const s = APP.ASSIST.cur(), refused = __bind.filter(x => x.r === false && !x.force); return { kept: s.lprob === pid && APP.liveSessionPid(s) === pid, refused: refused.length >= 1 }; }, info.w1.pid));
  // sessLink: برگشتِ false (سشنِ بسته به مسئلهٔ باز، بی force) ⇒ false و بی دست‌کاری؛ با force ⇒ true از راهِ a38
  Object.assign(info.w1, await p.evaluate((pid) => {
    const AS = APP.ASSIST, s = AS.cur(), other = APP.liveCreate('دیگری', 'مسئلهٔ دیگری برای آزمونِ پیوند که نباید سشن را بدزدد.', 'find');
    __bind.length = 0; const soft = AS.sessLink(s, other.p.id, false), keep = s.lprob === pid;
    const formKeep = (APP.liveBindSession(other.p.id), AS.cur().lprob === pid);   // فرمِ «🔭» (بی سشنِ صریح)
    const hard = AS.sessLink(s, other.p.id, true), moved = s.lprob === other.p.id, back = AS.sessLink(s, pid, true);
    return { soft, keep, formKeep, hard, moved, back, allA38: __bind.length >= 4 && __bind.every(x => typeof x.r === 'boolean'), forceFlag: __bind.filter(x => x.force).length === 2 };
  }, info.w1.pid));
  // رفتن به صفحهٔ مسئلهٔ دیگر و حرف زدن از آن‌جا ⇒ خودِ کاربر عوض کرد (force)
  info.w1.page = await p.evaluate(async () => {
    const AS = APP.ASSIST, s = AS.cur(), o = APP.liveCreate('صفحهٔ دیگر', 'مسئله‌ای که کاربر صفحه‌اش را باز می‌کند و از همان‌جا حرف می‌زند.', 'find');
    APP.go('lprob', o.p.id); __bind.length = 0; await AS.send('از همین‌جا ادامه بدیم');
    const r = { moved: AS.cur().lprob === o.p.id, forced: __bind.some(x => x.pid === o.p.id && x.force && x.r) };
    APP.go('home'); return r;
  });
  {
    const w = info.w1;
    chk(w.pid && w.read === w.pid && w.viaA38 && w.noG2Wrap, 'W1: live_new binds through the real A.liveBindSession; A.liveSessionPid reads it; no G2 wrapper/overlay left ' + JSON.stringify(w));
    chk(w.kept && w.refused, 'W1: a chat_solved of another problem in a bound session is refused by a38 (false) and the binding stays ' + JSON.stringify(w));
    chk(w.soft === false && w.keep && w.formKeep && w.hard === true && w.moved && w.back === true && w.allA38 && w.forceFlag, 'W1: AS.sessLink returns a38\'s answer (false without force keeps the open binding; force switches); the 🔭 form keeps it ' + JSON.stringify(w));
    chk(w.page.moved && w.page.forced, 'W1: talking from another live problem\'s page switches the session (force) ' + JSON.stringify(w.page));
  }

  // ---------- W2) liveCtx: بی شرطِ واژه برای سشنِ بسته؛ منفی: مسئلهٔ بسته‌شده ----------
  await p.evaluate(() => APP.go('home'));
  await say('امروز هوا ابری بود و حوصله نداشتم');
  info.w2 = await p.evaluate(() => { const AS = APP.ASSIST, s = AS.cur(), u = __calls[__calls.length - 1].user; return { block: u.indexOf('# مسئلهٔ زندهٔ این سشن (' + s.lprob + ')') >= 0, ctx: (AS.liveCtx(s, 'x') || {}).bound === true }; });
  info.w2.closed = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S; localStorage.removeItem('lla.assist.cur'); const s = AS.newSession();
    const r = APP.liveCreate('بسته‌شده', 'مسئله‌ای که حل و بازنگری شده و بسته است.', 'find'), pg = S.get('eprog_' + r.p.id);
    pg.solve.u = { 1: { done: true, u: 'x', dl: [], c: '' } }; pg.solve.live.state = 'solved'; pg.solve.b = { 1: { done: true, state: 'solved', at: new Date().toISOString() } }; S.put(pg);
    s.lprob = r.p.id; S.put(s); __calls.length = 0; await AS.send('بسته‌شده رو یادته؟');
    const u = __calls[0].user; return { pid: APP.liveSessionPid(s), noBlock: u.indexOf('# مسئلهٔ زندهٔ این سشن (') < 0, ctx: AS.liveCtx(s, 'x') };
  });
  chk(info.w2.block && info.w2.ctx, 'W2: a bound session always gets the live block (no shared-word gate) ' + JSON.stringify(info.w2));
  chk(info.w2.closed.pid === null && info.w2.closed.noBlock && info.w2.closed.ctx === null, 'W2 (neg): a closed problem is no longer «the live problem of this session» ' + JSON.stringify(info.w2.closed));

  // ---------- W3) مربی: یک منبعِ پرسش، مرحله از صفحه ----------
  await newSess();
  info.w3 = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S, s = AS.cur();
    const r = APP.liveCreate('مجموعِ فردها', 'ثابت کن مجموعِ n عددِ فردِ نخست برابرِ n² است.', 'prove'), pid = r.p.id, pg = S.get('eprog_' + pid);
    pg.solve.u = { 1: { done: true, one: 'مجموعِ فردها مربع است', u: 'مجموع = n²', dl: [{ id: 'd1', t: 'عددهای فردِ نخست' }], c: 'n عددِ طبیعی است', type: 'prove' } };
    pg.solve.live.plan = { t: 'با استقرا روی n', at: new Date().toISOString(), heur: ['move'] }; S.put(pg);
    APP.liveBindSession(pid, s, { force: true }); APP.go('home');
    const co = APP.liveCoach(pid);
    __calls.length = 0; await AS.send('گامِ استقرا رو نوشتم ولی مطمئن نیستم');
    const u = __calls[0].user;
    const one = (u.match(/در این نوبت فقط \*\*یک\*\* پرسش/g) || []).length, q = (/هم‌گام با صفحه[^«]*«([^»]+)»/.exec(u) || [])[1];
    const c0 = u.indexOf('# مربیِ حل'), coach = c0 >= 0 ? u.slice(c0) : '';
    const list = (/^- پرسش‌های همین مرحله \(برای همین نوعِ مسئله\): (.*)$/m.exec(u) || [])[1] || '';
    // «حل شد» در گفت‌وگو: مرحلهٔ صفحه (اجرا) می‌ماند
    __calls.length = 0; await AS.send('حلش کردم!');
    const u2 = __calls[0].user, coach2 = u2.slice(u2.indexOf('# مربیِ حل'));
    return { ph: co.ph, coQ: co.q, q, one, objQ: !/پیش‌بینی/.test(co.q), coachPointer: /پرسشِ این نوبت: \*\*فقط\*\* همان یک پرسشی که «مسئلهٔ زندهٔ این سشن»/.test(coach), noSecond: !/پیشنهادِ این نوبت/.test(coach) && !/^- پرسش‌های «/m.test(coach),
      prove: /مرحلهٔ محتمل: اجرای طرح · اثباتی/.test(coach), list: co.list.slice(0, 7).every(x => list.indexOf(x.slice(0, 40)) >= 0), sameList: JSON.stringify(APP.livePhaseQs(pid)) === JSON.stringify(co.list),
      claimStays: /مرحلهٔ محتمل: اجرای طرح/.test(coach2) && /می‌گوید حل شد، ولی صفحه هنوز «اجرای طرح» است/.test(coach2) && APP.livePhase(pid) === 'c', one2: (u2.match(/در این نوبت فقط \*\*یک\*\* پرسش/g) || []).length };
  });
  // منفی: مسئلهٔ فقط‌درگفت‌وگو ⇒ فهرستِ خودِ مربی با «پیشنهادِ این نوبت»، بی بلوکِ زنده
  await newSess(); await say('یه معما: با سه بار وزن کردن سکهٔ تقلبی رو از ۱۲ سکه پیدا کنم');
  info.w3.chat = await p.evaluate(() => { const u = __calls[__calls.length - 1].user, c = u.slice(u.indexOf('# مربیِ حل')); return { list: /^- پرسش‌های «[^»]+» \(کلی ⇐ خاص\): 1\) \S/m.test(c) && /پیشنهادِ این نوبت: «/.test(c), noLive: u.indexOf('# مسئلهٔ زندهٔ این سشن (') < 0, noPointer: !/«مسئلهٔ زندهٔ این سشن» \(بالا\)/.test(c) }; });
  {
    const w = info.w3;
    chk(w.ph === 'c' && w.q === w.coQ && w.one === 1 && w.objQ, 'W3: the one-question line carries exactly A.liveCoach(pid).q (objective exec: no prediction question), once per turn ' + JSON.stringify(w));
    chk(w.coachPointer && w.noSecond && w.prove, 'W3: the coach points to that single question (no second «suggested» question, no second list), with phase/kind from a38 ' + JSON.stringify(w));
    chk(w.list && w.sameList, 'W3: the phase list in the live block is A.livePhaseQs/A.liveCoach(pid).list ' + JSON.stringify(w));
    chk(w.claimStays && w.one2 === 1, 'W3: «حل شد» in chat does not move the page phase; the coach says so and does not celebrate ' + JSON.stringify(w));
    chk(w.chat.list && w.chat.noLive && w.chat.noPointer, 'W3 (neg): a chat-only problem keeps the coach\'s own phase list and suggestion ' + JSON.stringify(w.chat));
  }

  // ---------- W4) تور: داور و برهان از G1؛ بستن از A.liveClosure ----------
  info.w4 = await p.evaluate(() => {
    const AS = APP.ASSIST, S = APP.S;
    const mk = (title, kind, ex, steps, extra) => { const r = APP.liveCreate(title, 'صورتِ آزمایشیِ ' + title + ' برای نشانه‌های تور در ادغام.', kind, ex); const pg = S.get('eprog_' + r.p.id);
      pg.solve.u = { 1: { done: true, u: 'x', dl: [], c: '' } }; pg.solve.live.plan = { t: 'طرح', at: new Date().toISOString(), heur: ['move'] }; pg.solve.live.steps = steps; if (extra) extra(pg); S.put(pg);
      return { f: { kind: 'problem', key: 'x', refs: [{ id: r.id, type: 'eprob' }], status: 'now' }, pid: r.p.id }; };
    const ms = (f) => AS.tourMilestones(f).map(m => m.t + (m.ok ? '✓' : ''));
    // یافتنیِ عینی (نه اثباتی) با داورِ صریحِ کاربر: نشانهٔ برهان، نه پیش‌بینی — از A.liveKind
    const o = mk('عینی', 'find', { nat: 'objective' }, [{ id: 'ls1', text: 'گام', closed: true, proof: 'چون فرض', intuitive: false, out: { done: 'yes', kind: 'proof' } }]);
    // زندگی، با گامِ «proof»‌نما نه — نشانهٔ پیش‌بینی
    const l = mk('زندگی', 'find', { nat: 'life' }, [{ id: 'ls1', text: 'گام', closed: true, pred: 'x', out: { done: 'yes', match: 'yes' } }]);
    // ناتمام: «حل شد» با ایرادِ بازِ بازنگری ⇒ A.liveClosure = incomplete ⇒ «سرانجام» ✓ نمی‌خورد
    const inc = mk('ناتمام', 'prove', null, [], (pg) => { pg.solve.live.state = 'solved'; pg.solve.live.defects = [{ why: 'بخشی از فرض به کار نرفت', to: 'c', at: new Date().toISOString() }]; });
    // بسته با بازنگریِ کاربر ⇒ ✓
    const ok = mk('بسته', 'find', { nat: 'life' }, [], (pg) => { pg.solve.live.state = 'solved'; pg.solve.b = { 1: { done: true, state: 'solved', at: new Date().toISOString() } }; });
    // عینیِ بی هیچ گامی: نشانه‌ها از خودِ داور (A.liveKind)، نه از گامِ برهانیِ موجود
    const o0 = mk('عینیِ بی‌گام', 'find', { nat: 'objective' }, []), mo0 = ms(o0.f);
    const mo = ms(o.f), ml = ms(l.f), mi = ms(inc.f), mk2 = ms(ok.f);
    return { noStep: mo0.some(t => /^گامی را ثابت کردی/.test(t)) && !mo0.some(t => /پیش‌بینی/.test(t)), kindO: APP.liveKind(o.pid), objProof: mo.some(t => /گامی را ثابت کردی.*✓/.test(t)) && !mo.some(t => /پیش‌بینی/.test(t)), lifePred: ml.some(t => /با پیش‌بینی‌ات سنجیدی.*✓/.test(t)) && !ml.some(t => /گامی را ثابت کردی/.test(t)),
      incState: APP.liveClosure(inc.pid).state, incNot: mi.some(t => /^سرانجام: حل شد یا آگاهانه کنار رفت \(هنوز نه: ناتمام/.test(t)) && !mi.some(t => /^سرانجام.*✓$/.test(t)), okDone: mk2.some(t => /^سرانجام: حل شد یا آگاهانه کنار رفت✓$/.test(t)) };
  });
  // بازنگریِ ساختهٔ دستیار (chat_solved با درسی که در حرفِ کاربر نیست) ⇒ حکمِ «وارسی نشد» و نشانهٔ بازنگری ✓ نمی‌خورد
  await newSess();
  info.w4.chat = await p.evaluate(async () => {
    const AS = APP.ASSIST, st = 'کوچک‌ترین عددی که بر ۲ و ۳ و ۵ بخش‌پذیر است و مربعِ کامل است.';
    __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'chat_solved', title: 'مربعِ بخش‌پذیر', statement: st, lesson: 'هر عامل باید توانِ زوج داشته باشد پس ۹۰۰', check: 'با تقسیم وارسی کردم' }] }));
    await AS.send('پیداش کردم!');
    const r = APP.liveAll().filter(x => x.p.statement === st)[0], f = { kind: 'problem', key: 'y', refs: [{ id: r.id, type: 'eprob' }], status: 'now' };
    return { verdict: APP.liveClosure(r.p.id).verdict, back: AS.tourMilestones(f).some(m => /^بازنگری پس از حل/.test(m.t) && m.ok) };
  });
  chk(info.w4.noStep && info.w4.kindO === 'objective' && info.w4.objProof && info.w4.lifePred, 'W4: tour milestones read A.liveKind and step.out.kind === "proof" (objective: proof, life: prediction) ' + JSON.stringify(info.w4));
  chk(info.w4.incState === 'incomplete' && info.w4.incNot && info.w4.okDone, 'W4: «سرانجام» follows A.liveClosure — incomplete is not solved; a page look-back closes it ' + JSON.stringify(info.w4));
  chk(info.w4.chat.verdict === 'unverified' && !info.w4.chat.back, 'W4 (R5/R7): an assistant-written chat_solved look-back is «وارسی نشد» and not the user\'s look-back milestone ' + JSON.stringify(info.w4.chat));

  // ---------- W5) پیوست ⇒ A.liveAttach ----------
  await newSess();
  info.w5 = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S, s = AS.cur(), r = APP.liveCreate('کاشیِ آشپزخانه', 'چند کاشی برای دیوارِ آشپزخانهٔ ۳ در ۲ متری لازم است.', 'find');
    APP.liveBindSession(r.p.id, s, { force: true }); APP.go('home');
    const f = new File(['x'], 'wall.jpg', { type: 'image/jpeg' });
    await AS.send('این عکسِ دیواره', [f]); await AS.send('دوباره همون عکس', [f]);
    const at = APP.liveAttachments(r.p.id);
    // منفی: سشنِ نابسته ⇒ هیچ پیوستی به هیچ مسئلهٔ زنده
    localStorage.removeItem('lla.assist.cur'); AS.newSession(); const before = APP.liveAll().reduce((n, x) => n + APP.liveAttachments(x.p.id).length, 0);
    await AS.send('یه عکسِ دیگه', [new File(['y'], 'cat.jpg', { type: 'image/jpeg' })]);
    const after = APP.liveAll().reduce((n, x) => n + APP.liveAttachments(x.p.id).length, 0);
    return { n: at.length, name: at[0] && at[0].name, id: at[0] && at[0].id, url: at[0] && at[0].url, sess: at[0] && at[0].sess === s.id, unbound: after === before };
  });
  chk(info.w5.n === 1 && info.w5.name === 'wall.jpg' && info.w5.id && /^https:/.test(info.w5.url || '') && info.w5.sess && info.w5.unbound, 'W5: a chat attachment is linked to the bound live problem through A.liveAttach (once, with id/url/session); an unbound session links nothing ' + JSON.stringify(info.w5));
  // صفحهٔ مسئله فهرستِ پیوست را نشان می‌دهد (رابطِ واقعی)
  info.w5.ui = await p.evaluate(async () => { const r = APP.liveAll().filter(x => x.p.title === 'کاشیِ آشپزخانه')[0]; APP.go('lprob', r.p.id); await new Promise(z => setTimeout(z, 50)); const el = document.querySelector('#main .lp-attach'); const t = el ? el.textContent : ''; APP.go('home'); return /wall\.jpg/.test(t); });
  chk(info.w5.ui, 'W5: the problem page lists the linked attachment');

  // ---------- W6) نوع و فضایی از a38؛ chat_invent با origin lprob ⇒ ارث ----------
  await newSess();
  info.w6 = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S, s = AS.cur();
    const par = APP.liveCreate('چیدمانِ انبار', 'جعبه‌ها را چطور در انبارِ ۴ در ۳ متری بچینم که راه باز بماند.', 'find', { nat: 'practical', spatial: true });
    APP.liveBindSession(par.p.id, s, { force: true });
    // مدل داورِ دیگری پیشنهاد می‌دهد («life») — ارثِ a38 برنده است (R2: فرزند داور و فضایی بودنِ پدر را می‌گیرد)
    __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'chat_invent', statement: 'اگر انبار ۵ در ۳ بود چند جعبهٔ بیشتر جا می‌شد؟', nat: 'life' }] }));
    await AS.send('یه مسئلهٔ تازه ساختم: اگر انبار ۵ در ۳ بود چند جعبهٔ بیشتر جا می‌شد؟');
    const ch = APP.liveAll().filter(x => /انبار ۵ در ۳/.test(x.p.statement))[0], ki = ch && APP.liveKindInfo(ch.p.id);
    // منفی: بی مسئلهٔ بسته ⇒ origin «chat» و داورِ صریحِ مدل با by: assistant
    localStorage.removeItem('lla.assist.cur'); AS.newSession();
    __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'chat_invent', statement: 'چند راه برای چیدنِ ۴ کتابِ متفاوت در یک ردیف هست؟', kind: 'find', nat: 'objective' }] }));
    await AS.send('مسئلهٔ تازه: چند راه برای چیدنِ ۴ کتابِ متفاوت در یک ردیف هست؟');
    const c2 = APP.liveAll().filter(x => /۴ کتابِ متفاوت/.test(x.p.statement))[0], k2 = c2 && APP.liveKindInfo(c2.p.id);
    // ردهٔ مربی از liveKindInfo: مسئلهٔ عملیِ بسته با واژهٔ «ثابت» در صورت ⇒ همچنان «تصمیم/کارِ واقعی» (نه حدسِ واژه)
    localStorage.removeItem('lla.assist.cur'); const s3 = AS.newSession();
    const pr = APP.liveCreate('قفسهٔ ثابت', 'قفسهٔ ثابت را کجای دیوارِ ۳ متری نصب کنم که درِ کمد باز شود؛ ثابت کن به خودم که جا هست.', 'find', { nat: 'practical' });
    APP.liveBindSession(pr.p.id, s3, { force: true }); __calls.length = 0; await AS.send('شروع کنیم');
    const cu = __calls[0].user.slice(__calls[0].user.indexOf('# مربیِ حل'));
    return { origin: ch && ch.origin, by: ki && ki.by, kind: ki && ki.kind, spatial: ki && ki.spatial, same: ki && ki.kind === APP.liveKind(par.p.id),
      o2: c2 && c2.origin.type, by2: k2 && k2.by, kind2: k2 && k2.kind, prac: /تصمیم\/کارِ واقعی/.test(cu) && !/· اثباتی/.test(cu.split('\n')[0]) };
  });
  {
    const w = info.w6;
    chk(w.origin && w.origin.type === 'lprob' && w.by === 'parent' && w.kind === 'practical' && w.spatial === true && w.same, 'W6: chat_invent from a bound problem passes origin {type:"lprob", id}; a38 inheritance sets kind and spatial (by: parent), not the model\'s guess ' + JSON.stringify(w));
    chk(w.o2 === 'chat' && w.by2 === 'assistant' && w.kind2 === 'objective', 'W6 (neg): without a bound problem the child is chat-made and the model\'s explicit kind is recorded as by: assistant ' + JSON.stringify(w));
    chk(w.prac, 'W6: the coach class of a bound problem comes from A.liveKindInfo, not from words in the statement ' + JSON.stringify(w));
  }

  // ---------- W7) «امروز»: یک منبع (a38) در صفحهٔ خانه ----------
  info.w7 = await p.evaluate(async () => {
    const S = APP.S, t = APP.today();
    APP.liveAll().forEach(r => { if (r.dormant && !r.woke) { r.woke = new Date().toISOString(); S.put(r); } });
    const par = APP.liveCreate('پدرِ گفت‌وگو', 'مسئلهٔ پدری که فرزندش در گفت‌وگو ساخته شد.', 'find');
    APP.liveCreate('فرزندِ گفت‌وگو', 'فرزندی که در گفت‌وگو از مسئلهٔ پدر ساخته شد.', 'find', { origin: { type: 'lprob', id: par.p.id, via: 'chat' }, dormant: t });
    const single = (APP.dueList().filter(x => /^🧩 مسئلهٔ تازه‌ای که خودت ساختی برگشت/.test(x.txt))[0] || {}).sub;
    APP.liveAll().forEach(r => { if (r.dormant && !r.woke) { r.woke = new Date().toISOString(); S.put(r); } });
    APP.liveCreate('چتی', 'مسئله‌ای که فقط در گفت‌وگو ساختم و امروز برمی‌گردد.', 'find', { origin: { type: 'chat', id: 'x' }, dormant: t });
    const chat = (APP.dueList().filter(x => /^🧩 مسئلهٔ تازه‌ای که خودت ساختی برگشت/.test(x.txt))[0] || {}).sub;
    for (let i = 0; i < 4; i++) APP.liveCreate('چندتایی ' + i, 'مسئلهٔ ساختهٔ شمارهٔ ' + i + ' که امروز برمی‌گردد.', 'find', { origin: { type: 'chat', id: 'x' }, dormant: t });
    const many = APP.dueList().filter(x => /مسئلهٔ تازه‌ای که خودت ساختی برگشت/.test(x.txt))[0];
    const r = APP.liveCreate('کنارگذاشتهٔ ادغام', 'مسئله‌ای که پس از تلاشِ جدی کنار گذاشتم.', 'find'), pg = S.get('eprog_' + r.p.id);
    pg.solve.live.incub = { at: new Date().toISOString(), d: APP.addDays(t, -3), due: APP.addDays(t, -2), ph: 'p' }; S.put(pg);
    APP.go('home'); await new Promise(z => setTimeout(z, 50));
    const main = document.querySelector('#main').textContent;
    const occ = (re) => (main.match(re) || []).length;
    return { single, chat, many: many && [many.txt, many.sub], incub: occ(/😴 ۳ روز پیش «کنارگذاشتهٔ ادغام»/g), yday: occ(/😴 دیروز «کنارگذاشتهٔ ادغام»/g), manyUI: occ(/و ۲ تای دیگر/g), noOverlay: !APP.dueList._r2 };
  });
  {
    const w = info.w7;
    chk(/^ساخته از «پدرِ گفت‌وگو» در گفت‌وگو با دستیار — حالا حلش کن$/.test(w.single || '') && /^ساخته‌شده در گفت‌وگو با دستیار — حالا حلش کن$/.test(w.chat || ''), 'W7: «امروز» labels come from a38 by real origin (look-back / chat / chat from a problem) ' + JSON.stringify(w));
    chk(w.many && /^🧩 ۵ مسئلهٔ تازه/.test(w.many[0]) && / و ۲ تای دیگر$/.test(w.many[1]) && (w.many[1].match(/تای دیگر/g) || []).length === 1, 'W7: the count matches the list («و k تای دیگر» exactly once) ' + JSON.stringify(w.many));
    chk(w.incub === 1 && w.yday === 0 && w.manyUI === 1 && w.noOverlay, 'W7: «n روز پیش» (not «دیروز») and «و k تای دیگر» each appear once on the home page; no a27 overlay ' + JSON.stringify(w));
  }

  // ---------- W8) دادهٔ «به کار رفته» فقط از A.liveUnused ----------
  await newSess();
  info.w8 = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S, s = AS.cur(), r = APP.liveCreate('میزِ تحریر', 'میزِ ۱۴۰ سانتی کنارِ کمد در اتاقِ ۳ متری جا می‌شود یا نه.', 'find', { nat: 'practical' }), pid = r.p.id;
    const pg = S.get('eprog_' + pid);
    pg.solve.u = { 1: { done: true, u: 'جا می‌شود یا نه', dl: [{ id: 'd1', t: 'طولِ میز ۱۴۰ سانت' }, { id: 'd2', t: 'پنکهٔ سقفی' }, { id: 'd3', t: 'رنگِ پرده' }], c: 'راه باز بماند' } };
    pg.solve.live.plan = { t: 'طولِ میز ۱۴۰ سانت را با دیوار مقایسه می‌کنم', at: new Date().toISOString(), heur: ['move'] }; S.put(pg);
    APP.liveBindSession(pid, s, { force: true }); APP.go('home');
    const un0 = APP.liveUnused(pid).map(d => d.t);
    __calls.length = 0; await AS.send('پنکهٔ سقفی به نظرم بی‌فایده‌ست؛ رنگِ پرده هم');
    const u = __calls[0].user, lines = u.match(/^- داده‌هایی که هنوز [^\n]*/mg) || [];
    // گامی که «پنکهٔ سقفی» را به کار می‌برد ⇒ از فهرست بیرون می‌رود (همان A.liveUnused)
    pg.solve.live.steps = [{ id: 'ls1', text: 'ارتفاعِ پنکهٔ سقفی را می‌سنجم', data: ['d2'], closed: true, out: { done: 'yes', match: 'yes' } }]; S.put(pg);
    __calls.length = 0; await AS.send('بعدش چی');
    const u2 = __calls[0].user, lines2 = u2.match(/^- داده‌هایی که هنوز [^\n]*/mg) || [];
    return { un0, one: lines.length === 1, exact: lines.length === 1 && un0.every(t => lines[0].indexOf('«' + t + '»') >= 0) && lines[0].indexOf('«طولِ میز ۱۴۰ سانت»') < 0,
      after: APP.liveUnused(pid).map(d => d.t), one2: lines2.length === 1, gone: lines2.length === 1 && lines2[0].indexOf('«پنکهٔ سقفی»') < 0 && lines2[0].indexOf('«رنگِ پرده»') >= 0 };
  });
  chk(JSON.stringify(info.w8.un0) === JSON.stringify(['پنکهٔ سقفی', 'رنگِ پرده']) && info.w8.one && info.w8.exact, 'W8: the live block carries one unused-data line, exactly A.liveUnused (chat dismissal is not use; a plan-used datum is not listed) ' + JSON.stringify(info.w8));
  chk(info.w8.one2 && info.w8.gone && JSON.stringify(info.w8.after) === JSON.stringify(['رنگِ پرده']), 'W8: a datum used in a step leaves the list on the next turn (same source) ' + JSON.stringify(info.w8));

  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 6000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
