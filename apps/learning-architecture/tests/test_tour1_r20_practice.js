// تورِ پولیا (دستهٔ ۱، دورِ ۲۰ — سهمِ «practice + sched» — ۲۰۲۶-۱۰-۱۸) — DECISIONS_R20: RO7 (یک کار، یک رکورد، یک سطرِ «امروز») و RO9 (نشانِ ساعت).
//  هر موردِ RO7.one_act_one_record ِ بانکِ مستقلِ tests/variants/VARIANTS_R20.json (#121–#138) و سه موردِ نشانِ ساعتِ RO9 (#159 #164 #168)،
//  روی روزهای شبیه‌سازی‌شده (page.clock + بازبارگذاری؛ #128 با APP.clock ِ حالتِ توسعه) و صفحهٔ واقعی (Today، صفحهٔ پرونده، صفحهٔ مسئله، «📜 پرونده»، پرامپت).
//  بی وصله: موردی که سهمِ لایهٔ دیگری است (کارنامهٔ #126 — a29) فقط از سویِ خودِ پرونده سنجیده می‌شود و این در گزارش گفته می‌شود.
// LLA_FILE = ساختِ دیگر (مثلاً ساختِ پایه برای «قرمز اول»)؛ ONLY=b121,b123 …
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = require('./variants/VARIANTS_R20.json');

const T0 = Date.parse('2026-10-18T10:00:00+03:30');   // یکشنبه ۲۶ مهر — همان D0 ِ بانک (Sun 18)
const ymd = (n) => new Date(Date.UTC(2026, 9, 18 + n)).toISOString().slice(0, 10);

const HELPERS = () => {
  const S = APP.S, PR = APP.PR;
  APP.S.loaded = true; window.__noNav = true;
  window.__q = []; window.__sys = [];
  APP.callAI = async (sys, user, opts) => { __sys.push(String(sys || '') + '\n' + String(user || '')); let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  window.__say = async (text, reply, actions) => { __sys.length = 0; __q.push({ reply: reply || 'باشه.', status: 'related', memory: 'm', actions: actions || [] }); await APP.ASSIST.send(text); __q.length = 0; return __sys.join('\n'); };
  window.__freshChat = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); return APP.ASSIST.newSession().id; };
  window.__wipe = () => { ['practice', 'ex', 'fcast', 'kexp', 'case', 'card', 'sched', 'pr', 'topic', 'knot', 'kcase', 'eprob', 'eprog', 'achat', 'deadline', 'lprob'].forEach(t => { try { S.all(t).forEach(r => S.del(r.id)); } catch (e) { } }); localStorage.removeItem('lla.assist.cur'); APP.go('home'); };
  window.__topic = (t) => (S.all('topic', x => x.title === t)[0]) || S.put({ id: APP.uid('tp'), type: 'topic', title: t });
  window.__ex = (tid, data, o) => { o = o || {}; const ex = APP.newEx(tid, o.topic || ''); Object.assign(ex, o.f || {}); ex.data = Object.assign(ex.data || {}, data || {}); ex.rubric = o.rubric || ex.rubric || []; if (o.draft) { S.put(ex); return ex.id; } ex.status = 'done'; S.put(ex); APP.onExDone(ex); return ex.id; };
  window.__case = (id) => { const c = S.get(id); if (!c) return null; const R = PR.eval(c); return { id: c.id, tid: c.tid, state: c.state, due: c.due, until: c.until, reason: c.reason, dueText: PR.dueText(c),
    sessions: (c.sessions || []).map(s => ({ d: s.d, ok: s.ok, role: (c.roles || {})[s.d], late: (c.late || {})[s.d], meas: s.meas })), stable: c.stable, off: c.stableOff || [], hasWd: Object.prototype.hasOwnProperty.call(c, 'withdrawn'), links: c.links || {}, crit: R.crit }; };
  window.__one = (tid) => PR.cases({ tid })[0] ? __case(PR.cases({ tid })[0].id) : null;
  window.__today = () => APP.dueList().map(d => (d.txt || '') + ' ‖ ' + (d.sub || ''));
  window.__p3 = (id) => { const c = S.get(id); return ((c.links || {}).p3 || []).map(x => S.get(x)).filter(Boolean).map(s => ({ label: s.label, due: s.due, done: !!s.done, hold: s.hold || '', sup: !!s.superseded })); };
  window.__live = (title, o) => { o = o || {}; const now = new Date().toISOString(); const r = APP.liveCreate(title, title + ' — صورتِ کاملِ مسئله برای آزمون.', 'find', { by: 'user' }); const id = r.p ? r.p.id : r.id;
    const pg = S.get('eprog_' + id); pg.solve = pg.solve || {}; const so = pg.solve; so.u = { 1: { done: true, at: now, one: 'می‌خواهم ببینم', u: 'نتیجه', dl: [], c: '', type: 'find', nat: 'practical' } };
    so.live = so.live || {}; const L = so.live; ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); L.plan = { t: 'گام‌به‌گام', at: now }; S.put(pg); return id; };
  window.__main = () => (document.querySelector('#main') || document.body).innerText;
  window.__go = (v, a, s) => { APP.go(v, a, s); return __main(); };
};

(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'Asia/Tehran' });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.clock.install({ time: new Date(T0) });
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
  const E = (fn, arg) => p.evaluate(fn, arg);
  const day = async (n, hour) => { await p.clock.setSystemTime(new Date(T0 + n * 864e5 + ((hour == null ? 10 : hour) - 10) * 36e5)); };
  const load = async () => { await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(150); await E(HELPERS); };
  const reload = async () => { await E(() => APP.S.flushNow && APP.S.flushNow()); await p.reload(); await p.waitForSelector('.nav'); await p.waitForTimeout(150); await E(HELPERS); };
  const fresh = async () => { await day(0); await E(() => __wipe()); };
  const res = info.bank = {};
  const T = (gi, ok, x) => { res[gi] = !!ok; chk(ok, 'R20#' + gi + ' «' + BANK[gi].text.slice(0, 90) + '» → ' + BANK[gi].expect.slice(0, 120) + ' :: ' + JSON.stringify(x).slice(0, 900)); };
  await load();
  chk(await E(() => !!(window.APP && APP.PR && APP.PR.events && APP.PR.promptBlock && APP.ASSIST.DO.practice_log)), 'APP.PR.events / APP.PR.promptBlock / practice_log are missing');

  // #121 — T41: D0 80%، D1/D3 جا افتاد، D7 دیر و ناموفق (۴۵٪) ⇒ سطرهای روز ۱/۳ بسته، چرخه از D7، موعد D8، هرگز «موعدی ندارد»، D14 بی سطرِ کهنه
  await section('b121', async () => {
    await fresh();
    const id = await E(() => { const tp = __topic('قضیهٔ پنج نقطه').id; __ex(41, { topic: 'قضیهٔ پنج نقطه', actual: '80' }, { topic: tp }); return APP.PR.cases({ tid: 41 })[0].id; });
    await day(5); await reload();
    const d5 = await E(() => __today().filter(t => /برگه سفید/.test(t)));
    await day(7); await reload();
    await E((id) => APP.PR.session(id, { what: 'برگهٔ سفیدِ دیر', meas: { pct: 45 } }), id);
    const d7 = await E((id) => ({ c: __case(id), t: __today().filter(t => /برگه سفید|پنج نقطه/.test(t)), p3: __p3(id), page: __go('practice', id) }), id);
    await day(8); await reload(); const d8 = await E(() => __today().filter(t => /برگه سفید|پنج نقطه/.test(t)));
    await day(14); await reload(); const d14 = await E(() => __today().filter(t => /برگه سفید|پنج نقطه/.test(t)));
    const last = d7.c.sessions[d7.c.sessions.length - 1];
    T(121, d5.length === 1 && last.role === 'late' && last.ok === false && d7.c.due === ymd(8) && !/موعدی ندارد/.test(d7.page) && d7.t.length === 0 && d8.length === 1 && /روز ۱/.test(d8[0]) && d14.length === 1 && !/روز ۳/.test(d14.join()) && d7.p3.filter(x => !x.done && !x.hold).length === 1,
      { d5, last, due: d7.c.due, today7: d7.t, d8, d14, p3: d7.p3 });
    // افزوده (RO7): بازیابیِ دیرِ موفق فاصلهٔ بلندتر می‌گیرد (۵ روز دیر و ۹۰٪ ⇒ پله‌های ۱ و ۳ گذشته؛ پلهٔ بعد ۷ روز پس از همان روز)
    await fresh();
    const id2 = await E(() => { const tp = __topic('اتحادها').id; __ex(41, { topic: 'اتحادها', actual: '70' }, { topic: tp }); return APP.PR.cases({ tid: 41 })[0].id; });
    await day(5); await E((id) => APP.PR.session(id, { what: 'برگهٔ سفید', meas: { pct: 90 } }), id2);
    const r2 = await E((id) => __case(id), id2);
    chk(r2.sessions[1].role === 'lateok' && r2.due === ymd(12) && r2.state === 'stabilising', 'RO7 late success earns a longer interval (next due D12, not a day-1 restart) ' + JSON.stringify(r2));
  });

  // #122 — 🔭 مرورِ مسئله موعدِ D3 و پروندهٔ T41 روی همان مسئله ⇒ یک سطر؛ جلسهٔ پرونده مرور را هم برآورده می‌کند
  await section('b122', async () => {
    await fresh();
    const pid = await E(() => { const pid = __live('مثلثِ ده نقطه'); const U = APP.solveUI, pg = U.prog(pid), so = U.sol(pg); so.rev = so.rev || {}; so.rev.u = { iv: 3, due: APP.addDays(APP.today(), 3), hist: [] }; so.rev.b = { iv: 3, due: APP.addDays(APP.today(), 3), hist: [] }; so.live.state = 'solved'; so.live.stateAt = new Date().toISOString(); so.b = so.b || {}; so.b[1] = { done: true, at: new Date().toISOString(), verdict: 'proved' }; APP.S.put(pg);
      APP.newCard('بازسازی — «مثلثِ ده نقطه»: بی‌نگاه دوباره حلش کن', 'درس', { pb: pid, due: APP.addDays(APP.today(), 3) }); return pid; });
    await E((pid) => { const c = APP.PR.startFrom(41, APP.PR.subj('live', pid), 'live', false); APP.PR.session(c, { what: 'برگهٔ نخست', meas: { pct: 80 } }); }, pid);
    await day(3); await reload();
    const t3 = await E(() => __today().filter(t => /مثلثِ ده نقطه|مرورِ حلِ مسئله|کارت مرور/.test(t)));
    await E((pid) => { const c = APP.PR.cases({ subj: APP.PR.subj('live', pid) })[0]; APP.PR.session(c, { what: 'بازیابیِ روزِ سوم', meas: { pct: 85 } }); }, pid);
    const after = await E((pid) => { const so = APP.solveUI.sol(APP.solveUI.prog(pid)); const cd = APP.S.all('card', x => x.pb === pid)[0]; return { u: so.rev.u, b: so.rev.b, card: { due: cd.due, h: cd.hist.length, prc: !!(cd.hist[0] || {}).prc }, t: __today().filter(t => /مثلثِ ده نقطه|مرورِ حلِ مسئله|کارت مرور/.test(t)) }; }, pid);
    T(122, t3.length === 1 && after.u.due > ymd(3) && after.u.hist.some(h => h.prc) && after.b.hist.some(h => h.prc) && after.card.h === 1 && after.card.prc && after.t.length === 0, { t3, after });
  });

  // #123 — T24 دو مرحله‌ای: هر پیش‌بینی همان لحظه 🎯 ِ تاریخ‌دار؛ D1–D4 بی «جلسهٔ نخست … عقب‌افتاده»؛ D5 🎯ها؛ تأمل پس از نتیجه؛ نوبتِ بعد D6 از معیارِ باز
  // #138 — ردیفِ بی‌موعد: 🎯 ساخته نمی‌شود و صفحه تاریخ را می‌خواهد
  await section('b123', async () => {
    await fresh();
    const pid = await E(() => __live('تصمیمِ خریدِ خانه'));
    const exId = await E((pid) => { const c = APP.PR.startFrom(24, APP.PR.subj('live', pid), 'live', false); const ex = APP.PR.openWS(c); APP.go('home');
      ex.data.preds = [{ st: 'تا جمعه بانک وام را تأیید می‌کند', conf: '70', why: 'تجربه', due: '۵ روز دیگر' }, { st: 'فروشنده قیمت را پایین می‌آورد', conf: '60', why: 'آشنایی', due: '۵ روز دیگر' }, { st: 'کارشناس ایرادِ سازه نمی‌گیرد', conf: '80', why: 'داده', due: '۵ روز دیگر' }, { st: 'همسایه خانه‌اش را می‌فروشد', conf: '55', why: 'آشنایی', due: '' }];
      APP.S.put(ex); return ex.id; }, pid);
    const d0 = await E((x) => { const ex = APP.S.get(x); const F = APP.S.all('fcast'); const sh = (k) => APP.wsShown(APP.TM[24].ws.filter(f => f.k === k)[0], ex.data);
      APP.go('tech', 24, 'ws:' + x); return { n: F.length, due: F.map(f => f.due), cr: F.map(f => APP.localDay(f.created)), nd: APP.PR.t24NoDate(ex), ask: !!document.querySelector('.prc-t24nd'), refl: [sh('pattern'), sh('rule'), sh('selfguess')], c: __one(24) }; }, exId);
    const quiet = [];
    for (const n of [1, 2, 4]) { await day(n); await reload(); quiet.push(await E(() => __today().filter(t => /جلسهٔ نخست|کالیبراسیون|پیش‌بینی/.test(t)))); }
    await day(5); await reload();
    const d5 = await E(() => __today().filter(t => /پیش‌بینی/.test(t)));
    const refl = await E((x) => { APP.S.all('fcast').filter(f => f.due).forEach((f) => { f.outcome = /فروشنده/.test(f.q) ? 'نشد' : 'شد'; f.outcomeAt = new Date().toISOString(); APP.S.put(f); }); const ex = APP.S.get(x); const sh = (k) => APP.wsShown(APP.TM[24].ws.filter(f => f.k === k)[0], ex.data); return { outs: ex.data.preds.map(r => r.out || ''), refl: [sh('pattern'), sh('rule')], c: __one(24) }; }, exId);
    await day(6); await reload();
    const d6 = await E(() => ({ t: __today().filter(t => /کالیبراسیون/.test(t)), c: __one(24) }));
    T(123, d0.n === 3 && d0.due.every(d => d === ymd(5)) && d0.cr.every(d => d === ymd(0)) && d0.refl.every(x => x === false) && d0.c && d0.c.sessions.length === 0 && quiet.every(q => q.length === 0) && d5.length === 1 &&
      refl.outs.slice(0, 3).join() === 'درست,نادرست,درست' && refl.refl.every(Boolean) && d6.t.length === 1 && d6.c.due === ymd(6) && /روزِ جدا/.test(d6.c.reason) && !/موعدی ندارد/.test(d6.c.dueText), { d0: [d0.n, d0.due, d0.cr, d0.refl, d0.c && d0.c.sessions.length], quiet, d5, outs: refl.outs, refl: refl.refl, d6t: d6.t, d6due: d6.c.due, d6r: d6.c.reason.slice(0, 60) });
    T(138, d0.n === 3 && d0.nd.join() === '3' && d0.ask, { n: d0.n, nd: d0.nd, ask: d0.ask });
  });

  // #124 — برنامهٔ گفت‌وگو و گامِ زندهٔ هم‌محتوا ⇒ «همان برنامه؟» یک‌کلیکی؛ پس از «بله» یک وضع (گام ⇒ برنامه ⇒ 🌱)، D1 یک سطر، چت دیگر «انجام شد؟» نمی‌پرسد
  // #136 — برنامهٔ نامربوط ⇒ نه پیوندِ خودکار، نه پیشنهاد
  await section('b124', async () => {
    await fresh();
    const x = await E(() => { const pid = __live('سلامتیِ قلب'); const now = new Date().toISOString();
      const s = { id: APP.uid('achat'), type: 'achat', title: 't', msgs: [{ role: 'user', text: 'فردا صبح ۲۰ دقیقه پیاده‌روی می‌کنم. فردا هم به بانک زنگ بزنم.', at: now, id: 'u1' }], steps: [], files: [], reports: [], lprob: pid,
        plans: [{ id: 'pl1', text: 'فردا صبح ۲۰ دقیقه پیاده‌روی', when: APP.addDays(APP.today(), 1), at: now, d: APP.today(), key: 'k1', done: false, state: 'open', sess: '' }, { id: 'pl2', text: 'فردا به بانک زنگ بزنم', when: APP.addDays(APP.today(), 1), at: now, d: APP.today(), key: 'k2', done: false, state: 'open', sess: '' }] };
      s.plans.forEach(q => { q.sess = s.id; }); APP.S.put(s);
      const pg = APP.S.get('eprog_' + pid), L = pg.solve.live, t1 = new Date(Date.now() + 60e3).toISOString();
      L.steps.push({ id: 'ls1', text: 'پیاده‌روی ۲۰ دقیقه', pred: 'نفسم کم نمی‌آید', conf: 60, due: APP.addDays(APP.today(), 1), at: t1 }, { id: 'ls2', text: 'شکل را بکش', pred: 'روشن می‌شود', conf: 60, due: APP.today(), at: t1, closed: true, out: { at: t1, d: APP.today(), done: 'yes', what: 'کشیدم', match: 'yes' } });
      pg.solve.will = { steps: [{ id: 'ws0', at: t1, step: 'پیاده‌روی ۲۰ دقیقهٔ صبح', when: 'فردا صبح', iv: 1, due: APP.addDays(APP.today(), 1), dueFrom: 'when', checks: [] }], log: [] }; APP.S.put(pg);
      const page = __go('lprob', pid), C = APP.PR.planCands(pid).map(c => c.x.p.id + ':' + c.kind + ':' + c.item.id);
      return { pid, sid: s.id, page, C, btn: document.querySelectorAll('.prc-same .plan-same-yes').length }; });
    T(136, !x.C.some(c => /^pl2:/.test(c)) && !x.C.some(c => /ls2/.test(c)), x.C);
    await E(() => { document.querySelectorAll('.prc-same .plan-same-yes').forEach(b => b.click()); });
    await E(() => { const b2 = document.querySelector('.prc-same .plan-same-yes'); if (b2) b2.click(); });
    await day(1); await reload();
    const d1 = await E(() => __today().filter(t => /پیاده‌روی/.test(t)));
    const done = await E((x) => { const pg = APP.S.get('eprog_' + x.pid), st = pg.solve.live.steps.filter(y => y.id === 'ls1')[0]; st.out = { at: new Date().toISOString(), d: APP.today(), done: 'yes', what: 'رفتم، ۲۰ دقیقه', match: 'yes', prog: 'کمی', from: 'page' }; st.closed = true; APP.S.put(pg); const rep = 'page'; const q = APP.S.get(x.sid).plans[0]; const sy = APP.ASSIST.planSync({ p: q, s: APP.S.get(x.sid) }); APP.PR.planStateSync();
      const ws = APP.S.get('eprog_' + x.pid).solve.will.steps[0]; const due = APP.ASSIST.plansDue ? APP.ASSIST.plansDue(APP.S.get(x.sid), 'خب؟').map(z => z.id) : []; return { rep, q: APP.S.get(x.sid).plans[0], sy, ws: { closed: !!ws.closed, by: (ws.checks[0] || {}).by }, due, t: __today().filter(t => /پیاده‌روی/.test(t)) }; }, x);
    T(124, x.btn >= 1 && x.C.some(c => /^pl1:step:ls1/.test(c)) && d1.length === 1 && /🔭/.test(d1[0]) && done.q.step && done.q.step.id === 'ls1' && done.q.will && done.sy === 'done' && done.ws.closed && done.ws.by === 'plan' && done.due.indexOf('pl1') < 0 && done.t.length === 0, { x: { C: x.C, btn: x.btn }, d1, done });
  });

  // #125 — حدسِ ردشده در کیتِ حدس و سپس مسئلهٔ «ناممکن» ⇒ بخشِ تمرین «رد شد»، هرگز «هنوز آزموده نشده»
  await section('b125', async () => {
    await fresh();
    const r = await E(() => { const pid = __live('پوششِ صفحهٔ ۹۸ خانه'); const U = APP.solveUI, pg = U.prog(pid), s = U.sol(pg), now = new Date().toISOString();
      s.g = s.g || {}; s.g[1] = { guess: 'پوشش هست؛ فقط کدم کند است', conf: 70, at: now, before: true, hit: 'نادرست بود', hitAt: now, refuted: now }; s.b = s.b || {}; s.b[1] = { verdict: 'refuted', at: now }; APP.S.put(pg);
      APP.PR.startFrom(31, APP.PR.subj('live', pid), 'live', false);
      const pid2 = __live('مسئلهٔ دوم'); const pg2 = U.prog(pid2), s2 = U.sol(pg2); s2.g = s2.g || {}; s2.g[1] = { guess: 'جواب ۱۴ است', conf: 60, at: now }; s2.live.steps.push({ id: 'q1', text: 'آزمونِ حالتِ خاص', at: now, due: APP.today(), out: { at: now, done: 'yes', guess: { rel: 'refute' } } }); APP.S.put(pg2);
      return { gs: APP.PR.guessStatus(pid), gs2: APP.PR.guessStatus(pid2), page: __go('lprob', pid) }; });
    T(125, r.gs.refuted && /رد شد/.test(r.gs.label) && r.gs2.refuted && !/هنوز آزموده نشده/.test(r.page) && /حدس رد شد/.test(r.page), { gs: r.gs.label, gs2: r.gs2.label });
  });

  // #126 / #132 — پرونده با «تثبیت شد» و پس‌گرفتنش: رکورد «withdrawn» ِ خالی/پر ندارد (آن نام یعنی «خودِ رکورد پس گرفته شد»)، پس کارنامه آن را می‌شمرد
  await section('b126', async () => {
    await fresh();
    const id = await E(() => { const tp = __topic('قضیهٔ چینی').id; __ex(41, { topic: 'قضیهٔ چینی', actual: '60' }, { topic: tp }); return APP.PR.cases({ tid: 41 })[0].id; });
    for (const [d, pct] of [[1, 70], [3, 80], [7, 85]]) { await day(d); await E(([id, pct]) => APP.PR.session(id, { what: 'برگهٔ سفید', meas: { pct } }), [id, pct]); }
    const st = await E((id) => __case(id), id);
    await day(14); await E((id) => APP.PR.session(id, { what: 'وارسی', meas: { pct: 40 } }), id);
    const r = await E((id) => { const c = __case(id); const W = APP.MIND && APP.MIND.techWork ? APP.MIND.techWork() : null; const js = JSON.stringify(W || {}); return { c, inMind: js.indexOf('prac:' + id) >= 0, rec: Object.keys(APP.S.get(id)) }; }, id);
    T(132, !r.c.hasWd && r.c.off.length === 1 && r.inMind, { hasWd: r.c.hasWd, off: r.c.off, inMind: r.inMind });
    T(126, st.state === 'stable' && r.c.state !== 'stable' && r.c.off.length === 1 && r.inMind && r.c.sessions.map(s => (s.meas || {}).pct).join() === '60,70,80,85,40', { st: st.state, c: r.c.state, pct: r.c.sessions.map(s => (s.meas || {}).pct), inMind: r.inMind });
  });

  // #127 — کاربرِ تازه: روال‌های آماده («بازیابی پیش از نگاه به پاسخ»، قرائتِ روزانه، برگهٔ سفیدِ هفتگی…) تا خودش شروع نکرده در «امروز» نیستند
  await section('b127', async () => {
    await fresh();
    await E(() => { APP.newCard('نمونه: چرا بازخوانی حسِ فهمیدن می‌دهد؟', 'روانی', { tid: 41, sample: true }); });
    const quiet = [];
    for (const n of [0, 1, 2]) { await day(n); await reload(); quiet.push(await E(() => __today().filter(t => /بازیابی پیش از نگاه|قرائت ۱۰ دقیقه|جلسه هفتگی برگه سفید|تولید هفتگی|ممیزی دوحلقه/.test(t)))); }
    await day(3); await reload();
    const cd = await E(() => { const c = APP.S.all('card')[0]; APP.srsGrade(c, 4, 70); APP.S.put(c); APP.S.put({ id: APP.uid('pr'), type: 'pr', pid: 'P2', status: 'done', data: {} }); return c.due; });
    await day(4); await reload(); const d4 = await E(() => __today().filter(t => /قرائت ۱۰ دقیقه/.test(t)));
    await day(9); await reload(); const d9 = await E(() => __today().filter(t => /بازیابی پیش از نگاه/.test(t)));
    T(127, quiet.every(q => q.length === 0) && d4.length === 1 && cd === ymd(9) && d9.length === 1, { quiet, d4, cd, d9 });
  });

  // #128 — ساعتِ آزمایشی +۱۰ روز (APP.clock، حالتِ توسعه): جلسه با روزِ شبیه‌سازی‌شده؛ «📜 پرونده» و «امروز» یکی‌اند
  await section('b128', async () => {
    await fresh();
    const pid = await E(() => { const pid = __live('مسئلهٔ ساعت'); APP.PR.startFrom(28, APP.PR.subj('live', pid), 'live', false); localStorage.setItem('lla.dev', '1'); return pid; });
    await reload(); await E(() => { APP.clock.advance(10); }); await reload();
    const r = await E((pid) => { const c = APP.PR.cases({ subj: APP.PR.subj('live', pid) })[0]; __go('practice', c.id); const q = document.querySelector('.prc-quick'); const inp = q.querySelector('input[aria-label="جلسهٔ امروز: چه کردی؟"]'); inp.value = 'بازنویسیِ بی‌منبع'; q.querySelector('button').click();
      const c2 = APP.S.get(c.id); const D = APP.dossier(pid); const ev = (D.events || []).filter(e => e.k === 'practice' && /جلسهٔ تمرین/.test(e.title));
      return { today: APP.today(), sd: c2.sessions.map(s => s.d), at: c2.sessions.map(s => APP.localDay(s.at)), ev: ev.map(e => APP.localDay(e.at)), pe: APP.PR.events(pid).filter(e => e.kind === 'prc:session').map(e => e.d), due: c2.due, t: __today().filter(t => /🧪|برگه سفید|فاینمن/.test(t)) }; }, pid);
    await E(() => { APP.clock.reset(); localStorage.removeItem('lla.dev'); }); await reload();
    T(128, r.today === ymd(10) && r.sd.join() === ymd(10) && r.at.join() === ymd(10) && r.ev.join() === ymd(10) && r.pe.join() === ymd(10) && r.due === ymd(11) && r.t.length === 0, r);
  });

  // #129 / #135 — رضایتِ start_practice از گزارشِ سنجیدهٔ مدل (نه کلیدواژه در آغاز)؛ «نه، فعلاً …» بی پرونده
  await section('b129', async () => {
    await fresh(); await E(() => __freshChat());
    const a = await E(async () => { await __say('یه پرونده‌ی تمرین براش باز کن', 'باشه.', [{ do: 'start_practice', tid: 41, topic: 'مثلث‌ها', consent: { quote: 'یه پرونده‌ی تمرین براش باز کن', kind: 'request' } }]); return APP.PR.cases({ tid: 41 }).length; });
    const b2 = await E(async () => { await __say('فکر کنم برای اتحادها هم لازمه', 'برای «اتحادها» هم یک چرخهٔ بازیابی باز کنم؟', []); await __say('آره، بازش کن دیگه', 'باز شد.', [{ do: 'start_practice', tid: 41, topic: 'اتحادها', consent: { quote: 'آره، بازش کن دیگه', kind: 'yes' } }]); return { n: APP.PR.cases({ tid: 41 }).length, note: APP.ASSIST._prcNote || '' }; });
    const neg = await E(async () => { const n0 = APP.PR.cases().length; await __say('نه، فعلاً پرونده نمی‌خوام', 'باشه.', []); const n1 = APP.PR.cases().length;
      await __say('فعلاً نه', 'باشه.', [{ do: 'start_practice', tid: 28, topic: 'مشتق' }]); const n2 = APP.PR.cases().length;
      await __say('شاید', 'باشه.', [{ do: 'start_practice', tid: 28, topic: 'مشتق', consent: { quote: 'آره حتماً', kind: 'yes' } }]); const n3 = APP.PR.cases().length;
      const r0 = APP.ASSIST.DO.start_practice({ tid: 28, topic: 'مشتق' }); return { n0, n1, n2, n3, r0 }; });
    T(129, a === 1 && b2.n === 2 && /باز شد/.test(b2.note), { a, b2 });
    T(135, neg.n1 === neg.n0 && neg.n2 === neg.n0 && neg.n3 === neg.n0, neg);
  });

  // #130 — بازگشتِ D7 با پروندهٔ باز: بلوکِ پرونده در پرامپت بی کلیدواژه؛ کنشِ practice_log جلسه را (D7، ۴۰٪) ثبت می‌کند؛ سطرِ «امروز» ِ آن موعد بسته می‌شود
  // #131 — بی پروندهٔ باز: «ذهنم داره می‌چرخه» / «بیا تمرین کنیم» بلوکِ پرونده نمی‌آورد
  await section('b130', async () => {
    await fresh(); await E(() => __freshChat());
    const neg = await E(async () => { const a = await __say('ذهنم داره می‌چرخه', 'باشه.', []); const b2 = await __say('بیا تمرین کنیم', 'باشه.', []); return [/# پرونده‌های تمرینِ باز/.test(a), /# پرونده‌های تمرینِ باز/.test(b2)]; });
    T(131, neg.every(x => !x), neg);
    const id = await E(() => { const tp = __topic('فرمول‌های مثلثات').id; __ex(41, { topic: 'فرمول‌های مثلثات', actual: '80' }, { topic: tp }); return APP.PR.cases({ tid: 41 })[0].id; });
    await day(7); await reload(); await E(() => __freshChat());
    const before = await E(() => __today().filter(t => /فرمول‌های مثلثات/.test(t)).length);
    const r = await E(async (id) => { const sys = await __say('امروز دوباره امتحان کردم، ۴۰٪ شد', 'دیدم.', [{ do: 'practice_log', prc: id, what: 'برگهٔ سفید', pct: 40, quote: 'امروز دوباره امتحان کردم، ۴۰٪ شد' }]);
      const bad = APP.ASSIST.DO.practice_log({ prc: id, what: 'x', pct: 90, quote: 'این را نگفته' }); return { blk: /# پرونده‌های تمرینِ باز/.test(sys) && sys.indexOf(id) >= 0, c: __case(id), t: __today().filter(t => /فرمول‌های مثلثات/.test(t)), bad }; }, id);
    const last = r.c.sessions[r.c.sessions.length - 1];
    T(130, r.blk && before === 1 && last.d === ymd(7) && last.meas.pct === 40 && last.ok === false && r.t.length === 0 && r.c.due === ymd(8) && /ثبت نشد/.test(r.bad), { blk: r.blk, before, last, t: r.t, due: r.c.due, bad: r.bad });
  });

  // #133 — جلسهٔ فرمِ سریعِ پرونده در D3: سطرِ دوم نمی‌سازد؛ برگهٔ «روز ۳» ِ P3 بسته می‌شود
  // #134 — یک جلسهٔ ۸۰٪ «تثبیت شد» نمی‌دهد
  await section('b133', async () => {
    await fresh();
    const id = await E(() => { const tp = __topic('هندسه').id; __ex(41, { topic: 'هندسه', actual: '80' }, { topic: tp }); return APP.PR.cases({ tid: 41 })[0].id; });
    const one = await E((id) => __case(id), id);
    T(134, one.state !== 'stable' && !one.stable, { st: one.state });
    await day(1); await E((id) => APP.PR.session(id, { what: 'روز ۱', meas: { pct: 75 } }), id);
    await day(3); await reload();
    const pre = await E(() => __today().filter(t => /هندسه/.test(t)));
    const r = await E((id) => { __go('practice', id); const q = document.querySelector('.prc-quick'); q.querySelector('input[aria-label="جلسهٔ امروز: چه کردی؟"]').value = 'از حافظه بازنوشتم'; q.querySelector('input[aria-label="درصدِ بازیابیِ سنجیده"]').value = '۷۰'; q.querySelector('button').click();
      return { p3: __p3(id), t: __today().filter(t => /هندسه/.test(t)), c: __case(id) }; }, id);
    const d3 = r.p3.filter(x => x.label === 'روز ۳')[0];
    T(133, pre.length === 1 && /روز ۳/.test(pre[0]) && d3 && d3.done && !d3.sup && r.t.length === 0 && r.c.due === ymd(7) && r.p3.filter(x => !x.done && !x.hold).length === 1, { pre, p3: r.p3, t: r.t, due: r.c.due });
  });

  // #137 — پروندهٔ بسته در D10 ⇒ پس از آن هیچ سطرِ «امروز»
  await section('b137', async () => {
    await fresh();
    const id = await E(() => { const tp = __topic('جبر').id; __ex(41, { topic: 'جبر', actual: '80' }, { topic: tp }); return APP.PR.cases({ tid: 41 })[0].id; });
    await day(10); await E((id) => APP.PR.close(id, 'خودم بستم'), id);
    const out = [];
    for (const n of [10, 11, 20]) { await day(n); await reload(); out.push(await E(() => __today().filter(t => /جبر/.test(t)))); }
    const p3 = await E((id) => __p3(id), id);
    T(137, out.every(x => x.length === 0) && p3.every(x => x.done), { out, p3 });
  });

  // RO9 #159 #164 #168 — نشانِ «⏱ ساعتِ آزمایشی» روی «↩ برگرد» نمی‌افتد (صفحهٔ باریک، تمِ تیره)؛ ساعتِ خاموش ⇒ بی نشان
  await section('b159', async () => {
    await fresh();
    await p.setViewportSize({ width: 390, height: 760 });
    await E(() => { localStorage.setItem('lla.dev', '1'); }); await reload(); await E(() => { APP.clock.advance(2); }); await reload();
    const geo = async () => E(() => { APP.go('home'); APP.go('lib'); APP.go('tech', 41); APP.render && APP.render(); const f = document.getElementById('llaClockFlag'), b2 = document.querySelector('.backfab'); if (!f || !b2) return { f: !!f, b: !!b2 };
      b2.scrollIntoView({ block: 'end' }); const rf = f.getBoundingClientRect(), rb = b2.getBoundingClientRect(); const ov = !(rf.right <= rb.left || rb.right <= rf.left || rf.bottom <= rb.top || rb.bottom <= rf.top);
      const cx = rb.left + rb.width / 2, cy = rb.top + rb.height / 2, hit = document.elementFromPoint(cx, cy); const cs = getComputedStyle(f);
      return { f: true, b: true, ov, hitBack: !!(hit && hit.closest('.backfab')), color: cs.color, bg: cs.backgroundColor, txt: f.textContent }; });
    const light = await geo();
    await p.emulateMedia({ colorScheme: 'dark' }); await E(() => { document.documentElement.setAttribute('data-theme', 'dark'); });
    const dark = await geo();
    await p.emulateMedia({ colorScheme: 'light' }); await E(() => { document.documentElement.removeAttribute('data-theme'); APP.clock.reset(); localStorage.removeItem('lla.dev'); }); await reload();
    const off = await E(() => { APP.go('tech', 41); return !!document.getElementById('llaClockFlag'); });
    await p.setViewportSize({ width: 1280, height: 900 });
    T(159, light.f && light.b && !light.ov && light.hitBack, light);
    T(164, dark.f && dark.b && !dark.ov && dark.hitBack && dark.color === 'rgb(255, 255, 255)' && /rgb\(122, 31, 31\)/.test(dark.bg), dark);
    T(168, off === false, { off });
  });

  info.bankSummary = { pass: Object.keys(res).filter(k => res[k]).map(Number), fail: Object.keys(res).filter(k => !res[k]).map(Number) };
  console.log(JSON.stringify(info.bankSummary));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
