// تورِ پولیا (دستهٔ ۱، دورِ ۲۲ — سهمِ «practice» — ۲۰۲۶-۱۰-۱۸) — DECISIONS_R22: P6 (تمرین)، P7 (چرخهٔ عمرِ فهرست‌های جاری) و بخش‌های تمرین/فهرست/«امروز» ِ P8.
//  هر موردِ P6.practice (#136–#153)، P7.running_lists (#154–#171) و P8 ِ این سهم (#173، #178، #182) ِ بانکِ مستقلِ tests/variants/VARIANTS_R22.json،
//  و جمله‌های خودِ اجراکننده‌ها: A22-10 (s05: «۹۰٪ ⇐ نشد» ِ صفحه پنهان؛ s07: «در حالِ تثبیت» با ۰ جلسه)، A22-15 (s07: «کدام؟» با این‌که «گلدانِ ۲۴ ساعت … ۶۰٪» یکی را
//  نام برد)، B·D22 (s19: «۱ جلسه» با ۳ داوری)، B·D18 (s14: برنامه و پرونده دو سطرِ «امروز» برای یک کار)، D·s35 (T15: ۲۴ آبان موعد، ۲۷ آبان آمد ⇒ «دیرتر»؛ T15 به فهرستِ فرض‌ها
//  وصل نیست)، D·s36 («یه ماه دیگه» آهنگ نشد)، D·s34 (T23 روی پروژه — معیارها نمی‌خوانند)، D·s31 (متنِ معیارِ T24 «قاعدهٔ گره»)، A22-28/B·D8/C22-15/C22-16/D·s32/D·s36 (فهرست‌ها جزیره‌اند)،
//  C22-14 (موعدِ گذشته بی «تحویل دادی؟»)، B·D20 («۴۵ تکنیک ›»).
// LLA_FILE = ساختِ دیگر (قرمزِ اول)؛ ONLY=r6a,r7b …
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = require('./variants/VARIANTS_R22.json');

const T0 = Date.parse('2026-10-18T10:00:00+03:30');   // یکشنبه ۲۶ مهر — D0 ِ بانک
const ymd = (n) => new Date(Date.UTC(2026, 9, 18 + n)).toISOString().slice(0, 10);

const HELPERS = () => {
  const S = APP.S, PR = APP.PR;
  APP.S.loaded = true; window.__noNav = true;
  window.__q = []; window.__sys = []; window.__res = [];
  APP.callAI = async (sys, user, opts) => { __sys.push(String(sys || '') + '\n' + String(user || '')); let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  const D = APP.ASSIST && APP.ASSIST.DO;
  if (D) ['list_add', 'list_update', 'practice_log', 'practice_rhythm', 'start_practice', 'deadline_done'].forEach(k => { const f = D[k]; if (!f || f._w) return; D[k] = function (a) { const r = f.apply(this, arguments); __res.push({ k, r: String(r == null ? '' : r) }); return r; }; D[k]._w = true; });
  window.__say = async (text, reply, actions) => { __sys.length = 0; __res.length = 0; __q.push({ reply: reply || 'باشه.', status: 'related', memory: 'm', actions: actions || [] }); await APP.ASSIST.send(text); __q.length = 0; return __sys.join('\n'); };
  window.__cur = () => APP.S.get(localStorage.getItem('lla.assist.cur'));
  window.__freshChat = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); return APP.ASSIST.newSession().id; };
  window.__wipe = () => { ['practice', 'ex', 'fcast', 'kexp', 'case', 'card', 'sched', 'pr', 'topic', 'knot', 'kcase', 'eprob', 'eprog', 'achat', 'deadline', 'lprob'].forEach(t => { try { S.all(t).forEach(r => S.del(r.id)); } catch (e) { } }); localStorage.removeItem('lla.assist.cur'); APP.go('home'); };
  window.__topic = (t) => (S.all('topic', x => x.title === t)[0]) || S.put({ id: APP.uid('tp'), type: 'topic', title: t });
  window.__case = (id) => { const c = S.get(id); if (!c) return null; const R = PR.eval(c); return { id: c.id, tid: c.tid, subj: c.subj, state: c.state, due: c.due, until: c.until, reason: c.reason, dueText: PR.dueText(c), run: R.run, misfit: c.misfit || '', links: c.links || {},
    sessions: (c.sessions || []).map(s => ({ d: s.d, ok: s.ok, role: (c.roles || {})[s.d], late: (c.late || {})[s.d], meas: s.meas, src: s.src, auto: !!s.calibAuto })), stable: c.stable, crit: R.crit, calib: R.calib, urhythm: c.urhythm || null }; };
  window.__today = () => APP.dueList().map(d => (d.txt || '') + ' ‖ ' + (d.sub || ''));
  window.__live = (title) => { const now = new Date().toISOString(); const r = APP.liveCreate(title, title + ' — صورتِ کاملِ مسئله برای آزمون.', 'find', { by: 'user' }); const id = r.p ? r.p.id : r.id;
    const pg = S.get('eprog_' + id); pg.solve = pg.solve || {}; const so = pg.solve; so.u = { 1: { done: true, at: now, one: 'می‌خواهم ببینم', u: 'نتیجه', dl: [], c: '', type: 'find', nat: 'practical' } };
    so.live = so.live || {}; const L = so.live; ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); L.plan = { t: 'گام‌به‌گام', at: now }; S.put(pg); return id; };
  window.__fc = (cid, q, p, due) => S.put({ id: APP.uid('fc'), type: 'fcast', q, p, due: due || APP.today(), dim: 's_decision', tid: 24, prc: cid, created: new Date().toISOString() });
  window.__judge = (id, out) => { const f = S.get(id); f.outcome = out; f.outcomeAt = new Date().toISOString(); S.put(f); return f; };
  window.__main = () => (document.querySelector('#main') || document.body).innerText;
  window.__go = (v, a, s) => { APP.go(v, a, s); return __main(); };
  window.__chatS = (pid) => { const id = __freshChat(); const s = APP.S.get(id); if (pid) s.lprob = pid; APP.S.put(s); return id; };
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
  const T = (gi, ok, x) => { res[gi] = !!ok; chk(ok, 'R22#' + gi + ' «' + BANK[gi].text.slice(0, 90) + '» → ' + BANK[gi].expect.slice(0, 120) + ' :: ' + JSON.stringify(x).slice(0, 900)); };
  const X = (name, ok, x) => { info[name] = !!ok; chk(ok, name + ' :: ' + JSON.stringify(x).slice(0, 900)); };
  await load();
  chk(BANK[136].rc === 'P6.practice' && BANK[154].rc === 'P7.running_lists' && BANK[173].rc === 'P8.small' && BANK[188].rc === 'P8.small', 'bank layout changed');

  /* ===================== P6 — تمرین ===================== */
  // #136 + A22-10 (s05): 🎯 ِ کاربرگِ T24 روی صفحهٔ 🎯 «نشد» زده می‌شود ⇒ جلسهٔ همان روزِ پرونده با همان خطا؛ کالیبراسیون آن را دارد (۹۰٪ ِ نادرست پنهان نیست)؛
  // A22-10 (s07): پرونده‌ای که با داوریِ صفحه «در حالِ تثبیت» شد هرگز «۰ جلسه» نیست؛ کارنامه نشستِ آن روز را دارد
  await section('r6a', async () => {
    await fresh();
    const ids = await E(() => { const pid = __live('قانونِ رشدِ لوبیا'); const c = APP.PR.startFrom(24, APP.PR.subj('live', pid), 'live', false);
      const f1 = __fc(c.id, 'برگ‌های گلدانِ ۲۴ ساعت تا جمعه زرد می‌شود', 60, APP.today()), f2 = __fc(c.id, 'تا ۱۵ آبان ثبت‌نامم در دورهٔ تابستانی قطعی می‌شود', 90, APP.today()); return { c: c.id, f1: f1.id, f2: f2.id }; });
    const before = await E((id) => __case(id), ids.c);
    await E(() => __go('fcast'));
    const sel = p.locator('select[aria-label="نتیجهٔ «برگ‌های گلدانِ ۲۴ ساعت تا جمعه زرد می‌شود»"]');
    const hasSel = await sel.count();
    if (hasSel) { await sel.selectOption('نشد'); await p.waitForTimeout(150); } else await E((id) => __judge(id, 'نشد'), ids.f1);
    await E((id) => __judge(id, 'نشد'), ids.f2);
    const r = await E((x) => { const c = __case(x.c); const W = APP.MIND.techWork(); const R = W.rows.find(z => z.key === 'prac:' + x.c); return { c, row: R ? R.acts.map(a => ({ day: a.day, ok: a.ok, fa: a.fa })) : null }; }, ids);
    const s0 = r.c.sessions.find(s => s.d === ymd(0));
    T(136, hasSel && before.sessions.length === 0 && s0 && s0.meas && s0.meas.fcs && s0.meas.fcs.indexOf(ids.f1) >= 0 && s0.meas.fcs.indexOf(ids.f2) >= 0 && r.c.calib && r.c.calib.n === 2 && r.c.calib.k === 0 && s0.ok === false, { hasSel, before: before.sessions, c: r.c.sessions, calib: r.c.calib });
    X('A22-10 s05 page-judged 90% miss is a case session (not hidden)', s0 && s0.meas.p != null && r.c.sessions.length === 1 && r.row && r.row.some(a => a.day === ymd(0)), { s: r.c.sessions, row: r.row });
    X('A22-10 s07 «در حالِ تثبیت» never with zero sessions', r.c.state !== 'stabilising' || r.c.sessions.length > 0, { st: r.c.state, n: r.c.sessions.length });
    // برداشتنِ داوری (اصلاح) ⇒ جلسه‌ای که فقط از داوری ساخته شد برداشته می‌شود
    const un = await E((x) => { const f = APP.S.get(x.f1); f.outcome = ''; APP.S.put(f); const g = APP.S.get(x.f2); g.outcome = ''; APP.S.put(g); return __case(x.c); }, ids);
    X('calib auto session goes when its judgements are withdrawn', un.sessions.length === 0, un.sessions);
  });

  // #137 + A22-15 (s07): practice_log با «۲۴ ساعت» و «۶۰٪» همان 🎯 را برمی‌گزیند — «کدام؟» نه؛ #147 دو 🎯 ِ ۶۰٪ بی عددِ دیگر ⇒ «کدام؟» با متنِ هر دو، 🎯 ِ تازه نه؛
  // #146 داوریِ صفحه و گزارشِ گفت‌وگو در همان روز ⇒ یک جلسه، یک 🎯
  await section('r6b', async () => {
    await fresh();
    const r = await E(async () => { const pid = __live('گلدان‌های لوبیا'); const c = APP.PR.startFrom(24, APP.PR.subj('live', pid), 'live', false); const sid = __chatS(pid); const s = APP.S.get(sid); s.prcs = [c.id]; APP.S.put(s);
      const a = __fc(c.id, 'برگ‌های گلدانِ ۲۴ ساعت زرد می‌شود', 60), b2 = __fc(c.id, 'قدِ گلدانِ ۸ ساعت از ۱۲ سانت بیشتر می‌شود', 70), c3 = __fc(c.id, 'گلدانِ ۱۲ ساعت گل می‌دهد', 60);
      const q1 = 'برگ‌های گلدانِ ۲۴ ساعت زرد شد — اون پیش‌بینیِ ۶۰ درصدیم';
      await __say(q1, 'دیدم.', [{ do: 'practice_log', prc: c.id, what: 'برگ‌های گلدانِ ۲۴ ساعت زرد شد', pct: 60, ok: true, quote: q1 }]);
      const res1 = __res.slice(), A1 = APP.S.get(a.id).outcome, B1 = APP.S.get(b2.id).outcome, C1 = APP.S.get(c3.id).outcome;
      return { res1, A1, B1, C1, c: c.id, nfc: APP.S.all('fcast').length }; });
    X('A22-15 s07 practice_log picks the 🎯 by «۲۴ ساعت» + «۶۰٪» (no «کدام؟»)', r.A1 === 'شد' && !r.B1 && !r.C1 && /^✓/.test(r.res1[0].r) && !/کدام/.test(r.res1[0].r) && r.nfc === 3, r);
    await fresh();
    const r2 = await E(async () => { const pid = __live('گلدان‌ها'); const c = APP.PR.startFrom(24, APP.PR.subj('live', pid), 'live', false); const sid = __chatS(pid); const s = APP.S.get(sid); s.prcs = [c.id]; APP.S.put(s);
      const a = __fc(c.id, 'برگ‌های گلدانِ ۲۴ ساعت زرد می‌شود', 60), b2 = __fc(c.id, 'گلدانِ ۸ ساعت گل می‌دهد', 60);
      const q = 'اون پیش‌بینی گلدونِ ۲۴ ساعت که ۶۰٪ گفته بودم، شد';
      await __say(q, 'دیدم.', [{ do: 'practice_log', prc: c.id, what: 'گلدونِ ۲۴ ساعت', ok: true, quote: q }]);
      const out = { r: __res.slice(), A: APP.S.get(a.id).outcome, B: APP.S.get(b2.id).outcome, n: APP.S.all('fcast').length };
      // #147: دو 🎯 ِ ۶۰٪، بی عددِ دیگر
      const c2 = APP.PR.startFrom(24, APP.PR.subj('topic', '', 'پیش‌بینی‌های کار'), 'page', false); s.prcs.push(c2.id); APP.S.put(s);
      const x1 = __fc(c2.id, 'جلسهٔ شنبه به یکشنبه می‌افتد', 60), x2 = __fc(c2.id, 'رئیس گزارش را برمی‌گرداند', 60); const n0 = APP.S.all('fcast').length;
      const q2 = 'اون که ۶۰٪ گفته بودم شد';
      await __say(q2, 'کدام؟', [{ do: 'practice_log', prc: c2.id, what: 'اون که ۶۰٪ گفته بودم', ok: true, quote: q2 }]);
      return Object.assign(out, { r2: __res.slice(), x1: APP.S.get(x1.id).outcome, x2: APP.S.get(x2.id).outcome, n0, n1: APP.S.all('fcast').length }); });
    T(137, r2.A === 'شد' && !r2.B && /^✓/.test(r2.r[0].r) && r2.n === 2, r2);
    T(147, !r2.x1 && !r2.x2 && r2.n1 === r2.n0 && /کدام/.test(r2.r2[0].r) && /جلسهٔ شنبه/.test(r2.r2[0].r) && /رئیس گزارش/.test(r2.r2[0].r), r2);
    await fresh();
    const r3 = await E(async () => { const pid = __live('پیش‌بینیِ باران'); const c = APP.PR.startFrom(24, APP.PR.subj('live', pid), 'live', false); const sid = __chatS(pid); const s = APP.S.get(sid); s.prcs = [c.id]; APP.S.put(s);
      const f = __fc(c.id, 'فردا در تهران باران می‌بارد', 70); __judge(f.id, 'شد'); const n0 = APP.S.all('fcast').length;
      const q = 'پیش‌بینیِ بارون که ۷۰٪ گفته بودم درست بود';
      await __say(q, 'دیدم.', [{ do: 'practice_log', prc: c.id, what: 'بارون اومد', pct: 70, ok: true, quote: q }]);
      return { c: __case(c.id), n0, n1: APP.S.all('fcast').length, r: __res.slice() }; });
    T(146, r3.c.sessions.filter(s => s.d === ymd(0)).length === 1 && r3.n1 === r3.n0, r3);
  });

  // #138: D0، D2، D5 هر روز یک 🎯 داوری ⇒ ۳ جلسه در ۳ روزِ جدا؛ B·D22 (s19): یک داوری از گفت‌وگو + دو داوریِ بعدی در کاربرگ (یکی دیر، یکی پسرفت) ⇒ ۳ جلسه
  await section('r6c', async () => {
    await fresh();
    const cid = await E(() => { const c = APP.PR.start(24, APP.PR.subj('topic', '', 'پیش‌بینی‌های روزانه'), { src: 'page' }); ['اتوبوس سرِ وقت می‌آید', 'جلسه کوتاه است', 'نامه امروز می‌رسد'].forEach((q, i) => __fc(c.id, q, 70, APP.addDays(APP.today(), [0, 2, 5][i]))); return c.id; });
    for (const [n, q] of [[0, 'اتوبوس سرِ وقت می‌آید'], [2, 'جلسه کوتاه است'], [5, 'نامه امروز می‌رسد']]) { await day(n); await reload(); await E((q) => { const f = APP.S.all('fcast').find(x => x.q === q); __judge(f.id, 'شد'); }, q); }
    const r = await E((id) => __case(id), cid);
    T(138, r.sessions.length === 3 && r.sessions.map(s => s.d).join(',') === [ymd(0), ymd(2), ymd(5)].join(',') && r.calib && r.calib.n === 3, { s: r.sessions.map(s => s.d), calib: r.calib });
    await fresh();
    const x = await E(async () => { const pid = __live('کاهشِ وزن تا عروسی'); const c = APP.PR.startFrom(24, APP.PR.subj('live', pid), 'live', false); const ex = APP.PR.openWS(c); APP.go('home');
      ex.data.preds = [{ st: 'تا آخرِ این هفته یک کیلو کم می‌کنم', conf: '70', due: '۳ روز دیگر' }, { st: 'هفتهٔ بعد شب‌ها شیرینی نمی‌خورم', conf: '80', due: '۵ روز دیگر' }, { st: 'تا ۱۰ آبان وزنم زیرِ ۷۵ است', conf: '60', due: '۱۰ آبان' }];
      ex.status = 'done'; APP.S.put(ex); APP.onExDone(ex);
      const sid = __chatS(pid); const s = APP.S.get(sid); s.prcs = [c.id]; APP.S.put(s); return { c: c.id, ex: ex.id }; });
    await day(3); await reload();
    await E(async (x) => { const s = APP.S.get(__chatS(APP.S.get(x.c).subj.id)); s.prcs = [x.c]; APP.S.put(s); const q = 'یه کیلو کم کردم — همون که ۷۰٪ گفته بودم'; await __say(q, 'آفرین.', [{ do: 'practice_log', prc: x.c, what: 'یه کیلو کم کردم', pct: 70, ok: true, quote: q }]); }, x);
    await day(9); await reload();
    await E((x) => { const ex = APP.S.get(x.ex); ex.data.preds[1].out = 'درست'; APP.S.put(ex); }, x);
    await day(24); await reload();
    await E((x) => { const ex = APP.S.get(x.ex); ex.data.preds[2].out = 'نادرست'; APP.S.put(ex); }, x);
    const y = await E((id) => __case(id), x.c);
    const judged = y.calib ? y.calib.n : 0;
    X('B·D22 s19 three judgements (chat + two on the worksheet) = three case sessions', judged === 3 && y.sessions.filter(s => s.meas && s.meas.fc).length === 3, { s: y.sessions.map(s => [s.d, s.src, s.meas && s.meas.fc ? 1 : 0]), calib: y.calib });
  });

  // #139: برنامهٔ «هر شب ۱۰ دقیقه مرورِ T41» همان کارِ پروندهٔ T41 ⇒ پیوند و یک سطرِ «امروز»؛ B·D18 (s14): «تا میان‌ترم ۲۰ آبان … با برگه‌ی سفید … تمرین کنم» کنارِ پرونده ⇒ یک سطر
  await section('r6d', async () => {
    await fresh();
    const x = await E(async () => { const sid = __chatS(); const s = APP.S.get(sid); s.coach = { stmt: 'فرمول‌های مثلثات را برای میان‌ترم یاد بگیرم', ph: 'p' }; APP.S.put(s);
      await __say('یه پرونده‌ی تمرین براش باز کن', 'باز شد.', [{ do: 'start_practice', tid: 41, consent: { quote: 'یه پرونده‌ی تمرین براش باز کن', kind: 'request' } }]);
      const c = APP.PR.cases({ tid: 41 })[0]; const s2 = APP.S.get(sid);
      (s2.plans = s2.plans || []).push({ id: 'pl1', text: 'تا میان‌ترم ۲۰ آبان هر روز با برگه‌ی سفید فرمول‌ها رو تمرین کنم', when: APP.addDays(APP.today(), 1), at: new Date().toISOString(), d: APP.today(), done: false, state: 'open', sess: sid }); APP.S.put(s2);
      APP.PR.planStateSync(); return { c: c.id, sid }; });
    await day(3); await reload();
    const t = await E((x) => { const pl = APP.S.get(x.sid).plans[0]; const c = APP.S.get(x.c); return { prc: pl.prc, t: __today().filter(t => /برگه|بازیابی|مثلثات|📌/.test(t)), due: c.due, plans: c.plans || [] }; }, x);
    X('B·D18 s14 plan that IS the practice act links to the case; one Today line', t.prc === x.c && t.t.filter(l => /📌/.test(l)).length === 0 && t.t.length === 1 && t.plans.length === 1, t);
    await fresh();
    const y = await E(() => { const c = APP.PR.start(41, APP.PR.subj('topic', '', 'واژه‌های زیست'), { src: 'page' }); const sid = __chatS(); const s = APP.S.get(sid);
      s.plans = [{ id: 'pl1', text: 'هر شب ۱۰ دقیقه مرورِ T41', when: APP.today(), at: new Date().toISOString(), d: APP.today(), done: false, state: 'open', sess: sid }]; APP.S.put(s);
      APP.PR.planStateSync(); return { c: c.id, sid }; });
    await day(1); await reload();
    const y2 = await E((x) => { const pl = APP.S.get(x.sid).plans[0]; return { prc: pl.prc, t: __today().filter(t => /T41|زیست|بازیابی|📌/.test(t)) }; }, y);
    T(139, y2.prc === y.c && y2.t.length === 1 && !/📌/.test(y2.t[0]), y2);
  });

  // #140 + D·s35: T15 با آهنگِ خودش (هر ۷ روز) — موعد D7، ثبت D10 ⇒ «دیرتر از موعد» ۳ روز؛ #150 ثبت در همان روزِ موعد ⇒ برچسبِ دیر نه؛
  // #141: کاربرگِ T15 ِ همان پرونده دو فرض ⇒ هر دو در «فهرستِ فرض‌ها» با پیوندِ پرونده و مسئله؛ جلسهٔ پرونده = مرورِ همان فهرست
  await section('r6e', async () => {
    await fresh();
    const x = await E(async () => { const pid = __live('برنامهٔ کافه'); const sid = __chatS(pid);
      await __say('یه پرونده براش باز کن، هر هفته یه بار فرض‌هامو چک می‌کنم', 'باز شد.', [{ do: 'start_practice', tid: 15, pid, rhythm: 'هر هفته یه بار', consent: { quote: 'یه پرونده براش باز کن', kind: 'request' } }]);
      const c = APP.PR.cases({ tid: 15 })[0]; return { c: c.id, pid, sid, due: c.due }; });
    await day(10); await reload();
    const a = await E(async (x) => { const s = APP.S.get(__chatS(x.pid)); s.prcs = [x.c]; APP.S.put(s); const q = 'امروز فرض‌هامو چک کردم، یکیش غلط بود';
      await __say(q, 'دیدم.', [{ do: 'practice_log', prc: x.c, what: 'فرض‌ها را چک کردم', quote: q }]); const L = APP.PR.list('assumptions');
      return { c: __case(x.c), rev: L.reviews.slice(), linked: (L.cases || []).indexOf(x.c) >= 0, link: (APP.S.get(x.c).links || {}).list === L.id }; }, x);
    const s10 = a.c.sessions.find(s => s.d === ymd(10));
    T(140, x.due === ymd(7) && s10 && s10.role === 'late' && s10.late === 3, { due: x.due, s: a.c.sessions });
    X('D·s35 T15 case feeds its list (session = review of «فهرستِ فرض‌ها»; linked)', a.rev.indexOf(ymd(10)) >= 0 && a.linked && a.link, a);
    await day(17); await reload();
    const b2 = await E(async (x) => { const s = APP.S.get(__chatS(x.pid)); s.prcs = [x.c]; APP.S.put(s); const q = 'امروز دوباره فرض‌هامو مرور کردم';
      await __say(q, 'دیدم.', [{ do: 'practice_log', prc: x.c, what: 'مرور', quote: q }]); return __case(x.c); }, x);
    const s17 = b2.sessions.find(s => s.d === ymd(17));
    T(150, s17 && s17.role !== 'late' && !s17.late, b2.sessions);
    const w = await E((x) => { const c = APP.S.get(x.c); const ex = APP.PR.openWS(c); APP.go('home'); ex.data = Object.assign(ex.data || {}, { assum: [{ a: 'مشتری‌ها هفته‌ای یک بار می‌آیند', load: 'اگر غلط باشد نقشه فرو می‌ریزد' }, { a: 'قیمتِ قهوه ثابت می‌ماند', load: '' }] });
      ex.status = 'done'; APP.S.put(ex); APP.onExDone(ex); const L = APP.PR.list('assumptions');
      return { items: L.items.map(i => ({ t: i.text, prc: i.prc, pid: i.pid, load: !!i.load })), exPrc: APP.S.get(ex.id).prc, c: __case(x.c) }; }, x);
    T(141, w.items.length === 2 && w.items.every(i => i.prc === x.c && i.pid === x.pid) && w.items.some(i => i.load) && w.exPrc === x.c, w);
  });

  // #142 «یه ماه دیگه دوباره امتحانم کن» ⇒ موعد ۲۰۲۶-۱۱-۱۷؛ #143 «هر دو هفته یه بار مرور کنیم» ⇒ ۲۰۲۶-۱۱-۰۱ و سپس هر ۱۴ روز؛ #149 «یه ماه پیش …» آهنگ نیست؛ #153 «هر روز نه، فقط امروز …» آهنگ نیست
  await section('r6f', async () => {
    await fresh();
    const r = await E(async () => { const t1 = __topic('ذهنیت رشد').id, t2 = __topic('واژه‌های فرانسه').id;
      const a = APP.PR.start(31, APP.PR.subj('topic', t1), { src: 'page' }), c = APP.PR.start(17, APP.PR.subj('topic', t2), { src: 'page' }); const s = APP.S.get(__chatS()); s.prcs = [a.id, c.id]; APP.S.put(s);
      const out = {};
      await __say('یه ماه دیگه دوباره امتحانم کن', 'باشه.', [{ do: 'practice_rhythm', prc: a.id, quote: 'یه ماه دیگه دوباره امتحانم کن' }]); out.a = __case(a.id); out.ra = __res.slice();
      await __say('هر دو هفته یه بار مرور کنیم', 'باشه.', [{ do: 'practice_rhythm', prc: c.id, quote: 'هر دو هفته یه بار مرور کنیم' }]); out.c = __case(c.id);
      const d0 = APP.S.get(a.id).due, u0 = JSON.stringify(APP.S.get(a.id).urhythm);
      await __say('یه ماه پیش اینو تمرین کرده بودم', 'باشه.', [{ do: 'practice_rhythm', prc: a.id, quote: 'یه ماه پیش اینو تمرین کرده بودم' }]); out.r149 = __res.slice(); out.d149 = APP.S.get(a.id).due === d0 && JSON.stringify(APP.S.get(a.id).urhythm) === u0;
      await __say('هر روز نه، فقط امروز وقت داشتم', 'باشه.', [{ do: 'practice_rhythm', prc: a.id, quote: 'هر روز نه، فقط امروز وقت داشتم' }]); out.r153 = __res.slice(); out.d153 = APP.S.get(a.id).due === d0 && JSON.stringify(APP.S.get(a.id).urhythm) === u0;
      APP.PR.session(c.id, { d: '2026-11-01', what: 'مرور', ok: true }); out.c2 = __case(c.id);
      return out; });
    T(142, r.a.due === '2026-11-17' && r.a.urhythm && r.a.urhythm.every === 30, { due: r.a.due, rh: r.a.urhythm, res: r.ra });
    T(143, r.c.due === '2026-11-01' && r.c2.due === '2026-11-15', { due: r.c.due, due2: r.c2.due });
    T(149, r.d149 && /ثبت نشد/.test((r.r149[0] || {}).r || ''), r.r149);
    T(153, r.d153 && /ثبت نشد/.test((r.r153[0] || {}).r || ''), r.r153);
  });

  // #144: شروعِ T23 روی پروژه («راه‌اندازی کارگاه») ⇒ هشدار که معیارهای تثبیتِ T23 با موضوع جور نیست؛ D·s34 همین از گفت‌وگو (نتیجهٔ کنش آن را می‌گوید)؛ #152 T24 روی پیش‌بینی ⇒ هشدار نه
  await section('r6g', async () => {
    await fresh();
    const r = await E(async () => { __go('practice'); document.querySelector('.prc-tsel0').value = '23'; document.querySelector('.prc-tp0').value = 'راه‌اندازی کارگاه'; document.querySelector('.prc-start0').click();
      const c = APP.PR.cases({ tid: 23 })[0]; const page = __go('practice', c.id);
      const pid = __live('پروژهٔ یک‌ماههٔ نقاشی'); __chatS(pid);
      await __say('یه پرونده براش باز کن که پیگیرش باشم', 'باز شد.', [{ do: 'start_practice', tid: 23, pid, rhythm: 'هر روز', consent: { quote: 'یه پرونده براش باز کن که پیگیرش باشم', kind: 'request' } }]);
      const res = __res.slice();
      const c24 = APP.PR.start(24, APP.PR.subj('topic', '', 'پیش‌بینی‌های بازار'), { src: 'page' }); const p24 = __go('practice', c24.id);
      return { page, misfit: __case(c.id).misfit, res, p24, m24: __case(c24.id).misfit }; });
    T(144, /جور نیست/.test(r.misfit) && /جور نیست/.test(r.page) && /پروژه|کارگاه/.test(r.misfit), { misfit: r.misfit });
    X('D·s34 T23 from chat on a project: the page result says the criteria do not fit', r.res.some(x => x.k === 'start_practice' && /جور نیست/.test(x.r)), r.res);
    T(152, !r.m24 && !/جور نیست/.test(r.p24), { m24: r.m24 });
  });

  // #145 T41 پس از چرخه: متنِ پایداری به «چرخه روز ۱، ۳ و ۷» استناد می‌کند، هرگز «قاعدهٔ گره»؛ #151 + D·s31 خطِ پایداریِ T24 هرگز «قاعدهٔ گره» (و به متنِ خودِ تکنیک استناد می‌کند)؛
  // #148 T41: پسرفت D9، یک موفقیت D10 ⇒ «تثبیت شد» نه
  await section('r6h', async () => {
    await fresh();
    const r = await E(() => { const tp = __topic('قضیهٔ فیثاغورس').id; const c = APP.PR.start(41, APP.PR.subj('topic', tp), { src: 'page' });
      [['2026-10-19', 80], ['2026-10-21', 85], ['2026-10-25', 90]].forEach(([d, v]) => APP.PR.session(c.id, { d, what: 'برگهٔ سفید', meas: { pct: v } }));
      const page = __go('practice', c.id); const st = __case(c.id);
      const c2 = APP.PR.start(41, APP.PR.subj('topic', __topic('مشتق').id), { src: 'page' });
      [['2026-10-19', 80], ['2026-10-21', 80], ['2026-10-27', 30], ['2026-10-28', 85]].forEach(([d, v]) => APP.PR.session(c2.id, { d, what: 'برگهٔ سفید', meas: { pct: v } }));
      const c24 = APP.PR.start(24, APP.PR.subj('topic', '', 'پیش‌بینی‌های روزانه'), { src: 'page' }); const f = __fc(c24.id, 'اتوبوس سرِ وقت می‌آید', 70); __judge(f.id, 'شد');
      const p24 = __go('practice', c24.id), k24 = __case(c24.id);
      return { page, st, s2: __case(c2.id), p24, crit24: k24.crit.map(x => x.t), reason24: k24.reason }; });
    T(145, r.st.state === 'stable' && /چرخه روز ۱، ۳ و ۷/.test(r.page) && !/قاعدهٔ گره/.test(r.page), { st: r.st.state, page: r.page.slice(0, 600) });
    T(151, !/قاعدهٔ گره/.test(r.p24) && !r.crit24.some(t => /قاعدهٔ گره/.test(t)) && !/قاعدهٔ گره/.test(r.reason24), r.crit24);
    X('D·s31 T24 stability text cites the technique\'s own text', r.crit24.some(t => /روزانه ۳ تا ۵ پیش‌بینی/.test(t)), r.crit24);
    T(148, r.s2.state !== 'stable', { st: r.s2.state, s: r.s2.sessions.map(s => s.d + ':' + s.role) });
  });

  /* ===================== P7 — فهرست‌های جاری ===================== */
  // #154: «فرضم اینه که مشتری‌ها هفته‌ای یه بار میان، اینو بذار تو فرض‌هام» ⇒ list_add با نقلِ او، پیوند به مسئلهٔ زنده و سشن؛ #164 «شاید … نمی‌دونم» بی خواسته ⇒ چیزی افزوده نمی‌شود؛
  // #171 «فرض کن قیمت ثابت بمونه، اون وقت؟» (فرضِ ریاضی) ⇒ به فهرستِ فرض‌ها نمی‌رود
  await section('r7a', async () => {
    await fresh();
    const r = await E(async () => { const pid = __live('قیمتِ کیکِ ماهِ بعد'); const sid = __chatS(pid);
      const q = 'فرضم اینه که مشتری‌ها هفته‌ای یه بار میان، اینو بذار تو فرض‌هام';
      await __say(q, 'باشه.', [{ do: 'list_add', list: 'assumptions', text: 'مشتری‌ها هفته‌ای یه بار میان', quote: q, consent: { quote: 'اینو بذار تو فرض‌هام', kind: 'request' } }]);
      const r154 = __res.slice(), L = APP.PR.list('assumptions'), it = L.items[0];
      const q2 = 'شاید مشتری‌ها کمتر بیان، نمی‌دونم';
      await __say(q2, 'هوم.', [{ do: 'list_add', list: 'assumptions', text: 'مشتری‌ها کمتر بیان', quote: q2 }]); const r164 = __res.slice(), n164 = APP.PR.list('assumptions').items.length;
      const q3 = 'فرض کن قیمت ثابت بمونه، اون وقت؟';
      await __say(q3, 'خب.', [{ do: 'list_add', list: 'assumptions', text: 'قیمت ثابت بمونه', quote: q3 }]); const r171 = __res.slice(), n171 = APP.PR.list('assumptions').items.length;
      return { r154, it, pid, sid, r164, n164, r171, n171 }; });
    T(154, r.it && r.it.text === 'مشتری‌ها هفته‌ای یه بار میان' && r.it.pid === r.pid && r.it.sess === r.sid && /اینو بذار تو فرض‌هام/.test(r.it.quote) && /^✓/.test(r.r154[0].r), r);
    T(164, r.n164 === 1 && /نگه داشته نشد/.test(r.r164[0].r), r.r164);
    T(171, r.n171 === 1 && /نگه داشته نشد/.test(r.r171[0].r), r.r171);
  });

  // #155: ابهامِ «منظورِ رئیس از گزارشِ کامل» با فرضیه‌ها ‖ «حل شد» در صفحه ⇒ بسته با تاریخ، تاریخچه می‌ماند؛ #165 بستن ≠ پاک کردن
  await section('r7b', async () => {
    await fresh();
    const r = await E(() => { const x = APP.PR.listAdd('ambiguities', { text: 'منظورِ رئیس از گزارشِ کامل', hyps: [{ t: 'همهٔ عددهای فصل', p: 60 }, { t: 'فقط خلاصهٔ یک‌صفحه‌ای', p: 40 }] });
      const c = APP.PR.list('ambiguities'); __go('practice', c.id);
      const li = document.querySelector('li[data-item="' + x.id + '"]'); const btn = li && [...li.querySelectorAll('button.prc-iclose')].find(b => b.dataset.kind === 'resolved');
      const w = li && li.querySelector('.prc-iwhy'); if (w) w.value = 'رئیس گفت همهٔ عددها'; btn && btn.click();
      const it = APP.PR.list('ambiguities').items[0]; return { btn: !!btn, it, page: (document.querySelector('#main') || document.body).textContent }; });
    T(155, r.btn && r.it.closed && r.it.closed.kind === 'resolved' && r.it.closed.d === ymd(0) && r.it.hyps.length === 2 && r.it.hist.some(e => e.ev === 'close'), r.it);
    T(165, APP_KEPT(r), r.page.slice(0, 300));
    function APP_KEPT(x) { return x.it && x.it.text === 'منظورِ رئیس از گزارشِ کامل' && /بسته‌شده/.test(x.page) && /منظورِ رئیس/.test(x.page); }
  });

  // #156: «فرضِ اینکه همه ساعت ۸ میان غلط از آب دراومد» ⇒ list_update با نقلِ او: «رد شد»، پاک نه
  await section('r7c', async () => {
    await fresh();
    const r = await E(async () => { const pid = __live('برنامهٔ صبحِ کافه'); __chatS(pid); APP.PR.listAdd('assumptions', { text: 'همه ساعت ۸ میان', pid });
      const q = 'فرضِ اینکه همه ساعت ۸ میان غلط از آب دراومد';
      await __say(q, 'ثبت می‌کنم.', [{ do: 'list_update', list: 'assumptions', item: 'همه ساعت ۸ میان', quote: q, how: 'refuted' }]);
      return { it: APP.PR.list('assumptions').items[0], res: __res.slice() }; });
    T(156, r.it && r.it.closed && r.it.closed.kind === 'refuted' && /غلط از آب دراومد/.test(r.it.closed.how) && r.it.text === 'همه ساعت ۸ میان', r);
  });

  // #157: ابهام H1 ۶۰٪، H2 ۴۰٪ ‖ «الان بیشتر فکر می‌کنم H1 درسته، ۸۰٪» ⇒ H1 ۶۰⇐۸۰ با تاریخچه؛ H2 دیده می‌شود («—» نه)؛ #168 مقدارِ پیشین بازنویسی نمی‌شود؛ C22-15 (s22: سه فرضیه با احتمال)
  await section('r7d', async () => {
    await fresh();
    const r = await E(async () => { const pid = __live('مصاحبهٔ کاری'); __chatS(pid); const x = APP.PR.listAdd('ambiguities', { text: 'چرا جواب ندادند', pid, hyps: [{ t: 'H1', p: 60 }, { t: 'H2', p: 40 }] });
      const q = 'الان بیشتر فکر می‌کنم H1 درسته، ۸۰٪';
      await __say(q, 'باشه.', [{ do: 'list_update', list: 'ambiguities', item: x.id, quote: q, hyp: 'H1', p: 80 }]);
      const c = APP.PR.list('ambiguities'); const page = __go('practice', c.id); const it = c.items[0];
      return { it, page, res: __res.slice() }; });
    const h1 = r.it.hyps.find(h => h.t === 'H1'), h2 = r.it.hyps.find(h => h.t === 'H2');
    T(157, h1 && h1.p === 80 && h1.hist.length === 2 && h1.hist[0].p === 60 && h2 && h2.p === 40 && /«H2» — ۴۰٪/.test(r.page), { it: r.it, res: r.res });
    T(168, h1 && h1.hist[0].p === 60 && h1.hist[1].from === 60 && h1.hist[1].p === 80 && /۶۰٪[^←]*←[^←]*۸۰٪/.test(r.page), h1);
  });

  // #158: فرض «باربر» در صفحه ⇒ ذخیره و نمایش؛ #159 پارتو «سه مشتری ۷۰٪ درآمد» ⇒ سهمِ ۷۰٪؛ #167 سهم‌های ۷۰٪ + ۵۰٪ ⇒ نشان داده می‌شود، بی‌صدا پذیرفته نمی‌شود
  await section('r7e', async () => {
    await fresh();
    const r = await E(() => { const x = APP.PR.listAdd('assumptions', { text: 'کافه‌ها همون ۳۵ تا رو می‌خرن' }); const c = APP.PR.list('assumptions'); __go('practice', c.id);
      const cb = document.querySelector('li[data-item="' + x.id + '"] .prc-iload'); cb.checked = true; cb.dispatchEvent(new Event('change'));
      const page = __main(), it = APP.PR.list('assumptions').items[0];
      const P = APP.PR.list('pareto'); __go('practice', P.id); document.querySelector('input[aria-label="مورد تازه برای ' + APP.PR.LISTS.pareto.fa + '"]').value = 'سه مشتری'; document.querySelector('.prc-addshare').value = '70'; document.querySelector('.prc-add').click();
      const p1 = APP.PR.list('pareto').items[0];
      __go('practice', P.id); document.querySelector('input[aria-label="مورد تازه برای ' + APP.PR.LISTS.pareto.fa + '"]').value = 'فروشِ آنلاین'; document.querySelector('.prc-addshare').value = '50'; document.querySelector('.prc-add').click();
      const pp = __go('practice', P.id), toast = [...document.querySelectorAll('.toast')].map(t => t.textContent).join(' | ');
      return { load: it.load, page, p1, pp, toast, sum: APP.PR.paretoSum() }; });
    T(158, r.load === true && /باربر/.test(r.page), { load: r.load });
    T(159, r.p1 && r.p1.shares && r.p1.shares[0].v === 70 && /۷۰٪/.test(r.pp), r.p1);
    T(167, r.sum.over && r.sum.sum === 120 && /بیش از ۱۰۰٪/.test(r.pp) && /بیش از ۱۰۰٪/.test(r.toast), { sum: r.sum, toast: r.toast });
  });

  // #160: حکمِ سیگنال/نویز «سیگنال» با تاریخِ بررسیِ دوباره ⇒ موعد و برگشت در «امروز»؛ #170 موعدِ D30 در D10 ⇒ هنوز در «امروز» نه؛ D·s32 «یه ماه دیگه دوباره نگاه می‌کنم» از گفت‌وگو ⇒ موعد
  await section('r7f', async () => {
    await fresh();
    const r = await E(() => { const x = APP.PR.listAdd('claims', { claim: 'فروشِ جمعه‌ها بیشتر است', text: 'فروشِ جمعه‌ها بیشتر است', recheck: APP.addDays(APP.today(), 5) }); const c = APP.PR.list('claims'); __go('practice', c.id);
      const li = document.querySelector('li[data-item="' + x.id + '"]'); li.querySelector('.prc-iverd').value = 'سیگنال'; li.querySelector('.prc-ires').value = 'سه جمعهٔ پیاپی بیشتر بود'; li.querySelector('.prc-irc').value = APP.addDays(APP.today(), 30); li.querySelector('.prc-ivb').click();
      const it = APP.PR.list('claims').items[0]; return { it, E: APP.PR.listEval(APP.PR.list('claims')) }; });
    await day(10); await reload();
    const t10 = await E(() => __today().filter(t => /سیگنال و نویز|جمعه/.test(t)));
    await day(30); await reload();
    const t30 = await E(() => __today().filter(t => /سیگنال و نویز|جمعه/.test(t)));
    T(160, r.it.verdict === 'سیگنال' && r.it.recheck === ymd(30) && r.E.some(e => e.due === ymd(30)) && t30.length === 1, { it: r.it, E: r.E, t30 });
    T(170, t10.length === 0, t10);
    await fresh();
    const s = await E(async () => { const pid = __live('فروشِ کافه'); __chatS(pid); const x = APP.PR.listAdd('claims', { claim: 'تبلیغِ اینستاگرام فروش را بالا برد', text: 'تبلیغِ اینستاگرام فروش را بالا برد', pid });
      const q = 'دادهٔ این ماه نشون داد سیگنال بود؛ یه ماه دیگه دوباره نگاه می‌کنم';
      await __say(q, 'باشه.', [{ do: 'list_update', list: 'claims', item: x.id, quote: q, verdict: 'سیگنال', result: 'دادهٔ این ماه', recheck: 'یه ماه دیگه' }]);
      return { it: APP.PR.list('claims').items[0], E: APP.PR.listEval(APP.PR.list('claims')), res: __res.slice() }; });
    X('D·s32 claim verdict + «یه ماه دیگه» ⇒ a due re-check', s.it.verdict === 'سیگنال' && s.it.recheck === '2026-11-17' && s.E.some(e => e.due === '2026-11-17'), s);
  });

  // #161: هر موردِ فهرست در پروندهٔ مسئلهٔ خودش و در کارنامه؛ #169 موردِ مسئلهٔ P2 در پروندهٔ P4 نیست؛ A22-28 (s09): فرض در صفحهٔ 🔭 ِ همان مسئله؛ پروندهٔ گفت‌وگو هم
  await section('r7g', async () => {
    await fresh();
    const r = await E(async () => { const p2 = __live('قیمتِ کیکِ ماهِ بعد'), p4 = __live('برنامهٔ ورزش'); const sid = __chatS(p2);
      const q = 'اینو بذار تو فرض‌هام: کافه‌ها همون ۳۵ تا رو می‌خرن';
      await __say(q, 'باشه.', [{ do: 'list_add', list: 'assumptions', text: 'کافه‌ها همون ۳۵ تا رو می‌خرن', quote: q, consent: { quote: 'اینو بذار تو فرض‌هام', kind: 'request' } }]);
      const D2 = JSON.stringify(APP.dossier(p2).events.map(e => e.title + ' ' + (e.lines || []).join(' '))), D4 = JSON.stringify(APP.dossier(p4).events.map(e => e.title + ' ' + (e.lines || []).join(' ')));
      const W = APP.MIND.techWork(); const row = W.rows.find(x => /^list:/.test(x.key));
      const live = __go('lprob', p2); const DS = APP.dossierSess ? JSON.stringify((APP.dossierSess(sid) || {}).events || []) : '';
      __go('mind'); const mind = __main();
      return { D2, D4, row: row ? row.acts.map(a => a.fa) : null, live, DS, mind }; });
    T(161, /کافه‌ها همون ۳۵ تا/.test(r.D2) && r.row && r.row.some(t => /کافه‌ها همون ۳۵ تا/.test(t)) && /فهرستِ فرض‌ها/.test(r.mind), { D2: r.D2.slice(0, 300), row: r.row });
    T(169, !/کافه‌ها همون ۳۵ تا/.test(r.D4), r.D4.slice(0, 300));
    X('A22-28 s09 assumption appears on the 🔭 page of its problem and in the session dossier', /فهرست‌های جاریِ همین مسئله/.test(r.live) && /کافه‌ها همون ۳۵ تا/.test(r.live) && /کافه‌ها همون ۳۵ تا/.test(r.DS), { live: /کافه‌ها/.test(r.live), DS: /کافه‌ها/.test(r.DS) });
  });

  // #162 + C22-16 (s25): کاربستِ «حالتِ خاص» ِ قفسهٔ مدل‌ها در مسئلهٔ تازهٔ P9 ⇒ روی P9 ثبت می‌شود؛ #166 روی مسئلهٔ قدیمی نه؛ از گفت‌وگو هم روی مسئلهٔ همان سشن
  await section('r7h', async () => {
    await fresh();
    const r = await E(async () => { const old = __live('مسئلهٔ کاشی‌ها'), p9 = __live('مجموعِ اعدادِ فرد'); APP.PR.modelUse('حالتِ خاص', { where: 'مسئلهٔ «مسئلهٔ کاشی‌ها»', real: true, link: { k: 'live', id: old } });
      const c = APP.PR.list('models'); const x = c.items[0]; __go('practice', c.id);
      const li = document.querySelector('li[data-item="' + x.id + '"]'); li.querySelector('.prc-lpid').value = p9; li.querySelector('.prc-iuse').click();
      const it = APP.PR.list('models').items[0]; const D9 = JSON.stringify(APP.dossier(p9).events.map(e => e.title + ' ' + (e.lines || []).join(' '))), Dold = APP.dossier(old).events.filter(e => e.kind === 'list:use').length;
      const p10 = __live('بزرگ‌ترین مستطیل'); __chatS(p10); const q = 'این‌جا هم از حالتِ خاص استفاده کردم، بذارش تو قفسه';
      await __say(q, 'باشه.', [{ do: 'list_add', list: 'models', text: 'حالتِ خاص', quote: q, use: true, consent: { quote: 'بذارش تو قفسه', kind: 'request' } }]);
      const it2 = APP.PR.list('models').items[0];
      return { uses: it.uses.map(u => u.link && u.link.id), p9, old, D9, Dold, uses2: it2.uses.map(u => u.link && u.link.id), p10 }; });
    T(162, r.uses.indexOf(r.p9) >= 0 && /حالتِ خاص/.test(r.D9), r);
    T(166, r.uses.filter(u => u === r.old).length === 1 && r.Dold === 1, r);
    X('C22-16 chat use is booked on the session problem', r.uses2.indexOf(r.p10) >= 0, r.uses2);
  });

  // #163: «یه جایی می‌خوام فرض‌هامو بنویسم که بعداً چکشون کنم» ⇒ سطرِ پرامپت او را به فهرستِ فرض‌ها می‌برد
  await section('r7i', async () => {
    await fresh();
    const r = await E(async () => { const pid = __live('برنامهٔ کافه'); __chatS(pid); const sys = await __say('یه جایی می‌خوام فرض‌هامو بنویسم که بعداً چکشون کنم', 'باشه.', []);
      const blk = (sys.split('# فهرست‌های جاری')[1] || '').split('\n# ')[0]; return { blk }; });
    T(163, /assumptions = «فهرستِ فرض‌ها»/.test(r.blk) && /list_add/.test(r.blk) && !/؟/.test(r.blk.replace(/«[^»]*»/g, '')), r.blk.slice(0, 600));
  });

  /* ===================== P8 (سهمِ تمرین/فهرست/«امروز») ===================== */
  // #173: موعدِ d1 پنجشنبه ۲۰۲۶-۱۰-۲۲ گذشت، D5 = جمعه ۲۳ ⇒ «امروز» می‌پرسد «تحویل دادی؟»؛ #182 موعدِ فردا ⇒ «تحویل دادی؟» نه
  await section('r8a', async () => {
    await fresh();
    await E(() => { APP.S.put({ id: 'dl_t1', type: 'deadline', what: 'تحویلِ گزارشِ فصل', date: '2026-10-22', done: false }); APP.S.put({ id: 'dl_t2', type: 'deadline', what: 'ارائهٔ کلاس', date: '2026-10-24', done: false }); });
    await day(5); await reload();
    const r = await E(() => { const items = APP.dueList(); const t = items.filter(i => /تحویل دادی/.test(i.txt || '')).map(i => i.txt);
      const it = items.find(i => /گزارشِ فصل/.test(i.txt || '') && /تحویل دادی/.test(i.txt || '')); it && it.acts && it.acts[0].fn();
      return { t, done: APP.S.get('dl_t1').done, after: APP.dueList().filter(i => /تحویل دادی/.test(i.txt || '')).length }; });
    T(173, r.t.length === 1 && /گزارشِ فصل/.test(r.t[0]) && r.done === true && r.after === 0, r);
    T(182, !r.t.some(x => /ارائهٔ کلاس/.test(x)), r.t);
  });

  // #178 + B·D20: نامِ نمای «🧪» در پیام‌های سامانه همان سرِ صفحه است، نه «۴۵ تکنیک ›»
  await section('r8b', async () => {
    await fresh();
    const r = await E(() => { const c = APP.PR.start(41, APP.PR.subj('topic', '', 'آمار'), { src: 'page' }); return { a: APP.viewLabel('practice'), b: APP.viewLabel('practice', c.id), l: APP.viewLabel('practice', APP.PR.list('models').id) }; });
    T(178, [r.a, r.b, r.l].every(x => x && !/۴۵ تکنیک/.test(x) && /پرونده‌های تمرین/.test(x)), r);
  });

  info.bankSummary = { pass: Object.keys(res).filter(k => res[k]).map(Number), fail: Object.keys(res).filter(k => !res[k]).map(Number) };
  console.log(JSON.stringify(info.bankSummary));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
