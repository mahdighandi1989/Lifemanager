// تورِ پولیا (دستهٔ ۱، دورِ ۱۹c — تکنیک‌های طولی، سهمِ «practice» — ۲۰۲۶-۱۰-۱۷) — DECISIONS_R19c: LT2 LT3 LT5 LT6 LT7.
//  policy  آهنگِ هر ۴۵ تکنیک از متنِ خودش (نقلِ عینی در dose/ws) + ثبت برای دستیار/منو + قرنطینهٔ تسلطِ شمارشی
//  reload  چندروزه با ساعتِ Playwright و بازبارگذاری: پرونده می‌ماند و سطرِ «امروز» در روزِ موعد می‌آید (نه پیش از آن)
//  sched   موعدها از راهِ A.SCHED (register/unregister/due؛ اگر a40 نیست، جانشینِ آزمون فقط در همین آزمون)
//  graph   پرونده در «🗺 نقشه‌ها» به تکنیک و موضوعش وصل است
//  lt2 lt3 lt5 lt6 lt7  همهٔ موردهای LT2.case / LT3.stable / LT5.one / LT6.link / LT7.list ِ بانکِ مستقل (tests/variants/VARIANTS_R19c.json)،
//                      هر کدام روی روزهای شبیه‌سازی‌شده (page.clock) — بازگشتِ دیر، فراموشی، پسرفت، تکرارِ همان روز، فروکشِ پس از «تثبیت شد»
// LLA_FILE = ساختِ دیگر؛ ONLY=lt2,lt3 …
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = require('./variants/VARIANTS_R19c.json');

const T0 = Date.parse('2026-10-17T10:00:00+03:30');
const ymd = (n) => new Date(Date.UTC(2026, 9, 17 + n)).toISOString().slice(0, 10);

const HELPERS = () => {
  const S = APP.S, PR = APP.PR;
  APP.S.loaded = true; window.__noNav = true;
  window.__q = [];
  APP.callAI = async (sys, user, opts) => { let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  window.__say = async (text, reply, actions) => { __q.push({ reply: reply || 'باشه.', status: 'related', memory: 'm', actions: actions || [] }); await APP.ASSIST.send(text); __q.length = 0; };
  window.__freshChat = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); return APP.ASSIST.newSession().id; };
  window.__wipe = () => { ['practice', 'ex', 'fcast', 'kexp', 'case', 'card', 'sched', 'pr', 'topic', 'knot', 'kcase', 'eprob', 'eprog', 'achat', 'deadline'].forEach(t => S.all(t).forEach(r => S.del(r.id))); localStorage.removeItem('lla.assist.cur'); APP.go('home'); };
  window.__topic = (t) => (S.all('topic', x => x.title === t)[0]) || S.put({ id: APP.uid('tp'), type: 'topic', title: t });
  window.__ex = (tid, data, o) => { o = o || {}; const ex = APP.newEx(tid, o.topic || ''); Object.assign(ex, o.f || {}); ex.data = Object.assign(ex.data || {}, data || {}); ex.rubric = o.rubric || ex.rubric || []; if (o.draft) { S.put(ex); return ex.id; } ex.status = 'done'; S.put(ex); APP.onExDone(ex); return ex.id; };
  window.__finish = (exId, data, o) => { const ex = S.get(exId); Object.assign(ex.data, data || {}); if (o && o.rubric) ex.rubric = o.rubric; ex.status = 'done'; S.put(ex); APP.onExDone(ex); return ex.prc; };
  window.__case = (id) => { const c = S.get(id); if (!c) return null; const R = PR.eval(c); return { id: c.id, tid: c.tid, subj: c.subj, state: c.state, due: c.due, until: c.until, reason: c.reason, src: c.src, next: R.next || null,
    sessions: (c.sessions || []).map(s => ({ d: s.d, ok: s.ok, role: (c.roles || {})[s.d], late: (c.late || {})[s.d], meas: s.meas, ex: s.ex, what: s.what })), stable: c.stable, withdrawn: c.withdrawn || [], hist: (c.hist || []).map(e => ({ d: e.d, ev: e.ev, from: e.from, to: e.to, why: e.why })),
    claim: c.claim || null, links: c.links || {}, sample: !!c.sample, crit: R.crit, calib: R.calib || null, verdict: R.verdict || null, suggest: R.suggest || null, occ: c.occ || [] }; };
  window.__one = (tid) => PR.cases({ tid })[0] ? __case(PR.cases({ tid })[0].id) : null;
  window.__due = (day) => PR.due(day).map(e => ({ id: e.id, due: e.due, reason: e.reason }));
  window.__live = (title) => APP.liveCreate(title, title + ' — صورتِ کاملِ مسئله برای آزمون.', 'find', { by: 'user' }).p.id;
  window.__guess = (pid, g) => { const U = APP.solveUI, pg = U.prog(pid), s = U.sol(pg); s.g[1] = { guess: g, conf: 60, test: '', testRes: '', before: true, at: new Date().toISOString(), from: 'live' }; S.put(pg); };
  window.__knot = (name) => APP.newKnot({ name, fam: (APP.KF && APP.KF[0] && APP.KF[0].id) || '' }).id;
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
  const fresh = async () => { await day(0); await E(() => __wipe()); };
  await load();
  const native = await E(() => ({ pr: !!(window.APP && APP.PR), sched: !!(APP.SCHED && typeof APP.SCHED.due === 'function') }));
  info.native = native;
  chk(native.pr, 'APP.PR (a41_practice.js) is missing — practice dossiers do not exist');
  const bankT = (key, rc) => { const r = info[key] = { res: [] }; const L = BANK.map((e, i) => Object.assign({ gi: i }, e)).filter(e => e.rc === rc);
    return { L, T: (j, ok, x) => { r.res.push([L[j].gi, !!ok]); chk(ok, key + '#' + L[j].gi + ' «' + L[j].text.slice(0, 90) + '» → ' + L[j].expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 700)); } }; };

  // ================= policy =================
  await section('policy', async () => {
    const r = await E(() => ({ bad: APP.T.filter(t => !APP.PR.citeOk(t.id)).map(t => t.id), n: Object.keys(APP.PR.POLICY).length, meta: !!(APP.VIEW_META.practice && APP.VIEW_META.practice.what), sub: APP.SUB_VIEWS.practice,
      quar: typeof APP.masteryCountOnly === 'function', act: typeof APP.ASSIST.DO.start_practice === 'function' }));
    info.policy = r;
    chk(r.n === 45 && !r.bad.length, 'policy: every one of the 45 techniques has a time shape quoted verbatim from its own text ' + JSON.stringify(r));
    chk(r.meta && r.sub === 'lib' && r.quar && r.act, 'policy: VIEW_META/SUB_VIEWS for «practice», quarantined count-only mastery, assistant action start_practice ' + JSON.stringify(r));
  });

  // ================= reload (Playwright clock + reload, multi-day) =================
  await section('reload', async () => {
    await fresh();
    const id = await E(() => { const tp = __topic('مشتق').id; __ex(28, { concept: 'مشتق چیست؟', explain: 'مشتق یعنی آهنگِ تغییر چون شیبِ خطِ مماس است.', rewrite: 'مشتق یعنی آهنگِ تغییر چون شیب است.' }, { topic: tp }); return APP.PR.cases({ tid: 28 })[0].id; });
    await E(() => APP.S.flushNow());
    const d0 = await E(() => __main().includes('تکنیک فاینمن') ? 'x' : APP.dueList().filter(d => d.prc).length);
    await day(1); await p.reload(); await p.waitForSelector('.nav'); await E(HELPERS);
    const d1 = await E((id) => ({ c: __case(id), home: (APP.go('home'), __main()), due: __due(APP.today()) }), id);
    info.reload = { d0, d1: { due: d1.due, st: d1.c && d1.c.state } };
    chk(d0 === 0 && d1.c && d1.c.sessions.length === 1 && d1.due.some(e => e.id === id && e.due === ymd(1)), 'reload: the case survives a reload; its day-1 rewrite is due on day 1 and not on day 0 ' + JSON.stringify(info.reload));
    if (!native.sched) chk(/تکنیک فاینمن — مشتق/.test(d1.home), 'reload: the Today page shows the practice line on its due day (fallback path, no A.SCHED) ' + d1.home.slice(0, 300));
  });

  // ================= sched (A.SCHED contract; stub only when a40 is absent) =================
  await section('sched', async () => {
    await fresh();
    const r = await E((nat) => {
      const calls = [];
      if (!nat) APP.SCHED = { E: {}, register(o) { calls.push(['reg', o.kind, o.id, o.due]); this.E[o.kind + ':' + o.id] = o; }, unregister(o) { calls.push(['unreg', o.kind, o.id]); delete this.E[o.kind + ':' + o.id]; }, due(day) { return Object.values(this.E).filter(e => e.due <= day); } };
      const tp = __topic('انتگرال').id; __ex(28, { concept: 'انتگرال', explain: 'انتگرال جمعِ تکه‌های کوچک است چون مساحت را می‌سازد.' }, { topic: tp });
      const c = APP.PR.cases({ tid: 28 })[0];
      const reg = APP.SCHED.due(APP.addDays(APP.today(), 1)).filter(e => e.kind === 'practice' && e.id === c.id);
      const lines = APP.dueList().filter(d => d.prc).length;
      APP.PR.pause(c, 'سفر'); const after = APP.SCHED.due('2099-01-01').filter(e => e.kind === 'practice' && e.id === c.id).length;
      if (!nat) delete APP.SCHED;
      return { calls, reg: reg.map(e => ({ due: e.due, reason: e.reason, policy: e.policy })), lines, after };
    }, native.sched);
    info.sched = r;
    chk(r.reg.length === 1 && r.reg[0].due === ymd(1) && r.reg[0].policy && r.reg[0].policy.tid === 28 && /۱ روز و ۱ هفته بعد/.test(r.reg[0].policy.cite) && r.after === 0 && r.lines === 0,
      'sched: the case registers ONE dated entry with A.SCHED (due, reason, policy from the technique text), a pause unregisters it, and the page adds no second Today line when A.SCHED feeds Today ' + JSON.stringify(r));
  });

  // ================= graph =================
  await section('graph', async () => {
    await fresh();
    const r = await E(() => { const k = __knot('گرهِ گراف'); const c = APP.PR.start(2, APP.PR.subj('knot', k), { src: 'knot' }); const M = APP.GRAPH.build(); const key = 'practice:' + c.id; const nb = (M.adj[key] || []).map(i => M.edges[i]).map(e => e.a === key ? e.b : e.a); return { node: !!M.nodes[key], nb, k }; });
    chk(r.node && r.nb.includes('tech:2') && r.nb.includes('knot:' + r.k), 'graph: the practice case is a node linked to its technique and its knot ' + JSON.stringify(r));
  });

  // ================= LT2.case =================
  await section('lt2', async () => {
    const { T } = bankT('lt2', 'LT2.case'); let r;
    // 0 — Maryam T28 «مشتق», 3 dated sessions, versions, due d1 then d7, open → stabilising
    await fresh();
    const tp = await E(() => __topic('مشتق').id);
    const w28 = (txt, gaps) => ({ concept: 'مشتق چیست؟', audience: 'پدر یا مادری بدون دانش تخصصی', explain: txt, rewrite: txt, gaps: gaps || [] });
    await E(([tp, w]) => __ex(28, w, { topic: tp }), [tp, w28('مشتق یعنی derivative و limit؛ آهنگِ تغییر است چون شیبِ مماس را می‌دهد.', ['حد'])]);
    const a0 = await E(() => __one(28));
    await day(1); await E(([tp, w]) => __ex(28, w, { topic: tp }), [tp, w28('مشتق یعنی limit؛ آهنگِ تغییر است چون شیبِ مماس را می‌دهد.')]);
    const a1 = await E(() => __one(28));
    await day(7); await E(([tp, w]) => __ex(28, w, { topic: tp }), [tp, w28('مشتق آهنگِ تغییر است چون شیبِ مماس را می‌دهد و اگر سرعت ثابت باشد صفر است.', ['مماس'])]);
    r = await E(() => ({ c: __one(28), n: APP.PR.cases({ tid: 28 }).length, v: APP.PR.versions(APP.PR.cases({ tid: 28 })[0]) }));
    T(0, r.n === 1 && r.c.sessions.length === 3 && a0.state === 'open' && a0.due === ymd(1) && a1.due === ymd(7) && a1.state === 'stabilising' && r.v.length === 3 && r.v[1].dJargon != null && r.v[2].dLen != null && r.v.every(x => x.jargon != null && x.len != null), { a0: [a0.state, a0.due], a1: [a1.state, a1.due], n: r.n, v: r.v });
    // 1 — Kaveh: live-problem button «T21», day-1 library save continues the case
    await fresh();
    const pid = await E(() => __live('به چند طریق از ۲۰ پله با گامِ ۱ یا ۲؟'));
    await E((pid) => APP.go('lprob', pid), pid);
    await p.selectOption('.prc-sec select.prc-tsel', '21'); await p.click('.prc-sec .prc-start');
    const ex1 = await E(() => APP.state.sub && APP.state.sub.split(':')[1]);
    await E((x) => __finish(x, { belief: 'جواب فیبوناچی است', hyp: 'اگر n=۴ آنگاه ۵ راه چون f(n)=f(n-1)+f(n-2)', criteria: '۵ یعنی تأیید', result: '', verdict: '' }), ex1);
    await day(1); await E(() => APP.go('tech', 21, 'ws'));
    const cid = await E(() => APP.PR.cases({ tid: 21 })[0].id);
    await p.click('.prc-cont .prc-contb[data-prc="' + cid + '"]');
    const ex2 = await E(() => APP.state.sub && APP.state.sub.split(':')[1]);
    await E((x) => __finish(x, { belief: 'جواب فیبوناچی است', hyp: 'اگر n=۵ آنگاه ۸ راه', criteria: '۸ یعنی تأیید' }), ex2);
    r = await E(([cid, pid]) => ({ c: __case(cid), n: APP.PR.cases({ tid: 21 }).length, pid }), [cid, pid]);
    T(1, r.n === 1 && r.c.subj.k === 'live' && r.c.subj.id === pid && r.c.src === 'live' && r.c.sessions.length === 2 && r.c.sessions[1].d === ymd(1) && ex1 !== ex2, r);
    // 2 — Pouya: T22 from the epistemic case; day-8 observation is session 2; case appears inside the epistemic case
    await fresh();
    const cs = await E(() => APP.newCase({ title: 'مهاجرت یعنی موفقیتِ شغلی', input: 'مهاجرت یعنی موفقیتِ شغلی' }).id);
    await E((cs) => APP.go('e_case', cs), cs);
    await p.selectOption('.prc-sec select.prc-tsel', '22'); await p.click('.prc-sec .prc-start');
    let exx = await E(() => APP.state.sub.split(':')[1]);
    await E((x) => __finish(x, { belief: 'مهاجرت یعنی موفقیتِ شغلی', kind: 'علّی (X باعث Y)', steelman: 'بازارِ کار در مقصد هم سخت است' }), exx);
    await day(8); exx = await E(() => { const c = APP.PR.cases({ tid: 22 })[0]; return APP.PR.openWS(c).id; });
    await E((x) => __finish(x, { found: 'دو همکارِ مهاجر هنوز کار پیدا نکرده‌اند' }), exx);
    r = await E((cs) => ({ c: __one(22), page: __go('e_case', cs) }), cs);
    T(2, r.c.subj.k === 'case' && r.c.subj.id === cs && r.c.sessions.length === 2 && r.c.sessions[1].d === ymd(8) && /همکار/.test(r.c.sessions[1].meas.obs || '') && r.page.includes('ابطال‌گرایی') && r.page.includes('پرونده‌های تمرین روی این پرونده'), { c: r.c, page: r.page.slice(-400) });
    // 3 — Mahsa: T23 from the knot; ex carries the case id; day-1 retest = session 2
    await fresh();
    const k3 = await E(() => __knot('عجله در خواندنِ صورتِ مسئله'));
    await E((k) => APP.go('knot', k), k3);
    await p.selectOption('.prc-sec select.prc-tsel', '23'); await p.click('.prc-sec .prc-start');
    exx = await E(() => APP.state.sub.split(':')[1]);
    await E((x) => __finish(x, { target: 'خواندنِ کاملِ صورت', unit: 'یک مسئله' }), exx);
    await day(1); exx = await E(() => APP.PR.openWS(APP.PR.cases({ tid: 23 })[0]).id);
    await E((x) => __finish(x, { target: 'بازآزمایی', unit: 'یک مسئله' }), exx);
    r = await E(([k, x]) => ({ c: __one(23), exPrc: APP.S.get(x).prc, k }), [k3, exx]);
    T(3, r.c.subj.k === 'knot' && r.c.subj.id === k3 && r.exPrc === r.c.id && r.c.sessions.length === 2 && r.c.sessions[1].d === ymd(1), r);
    // 4 — Hoda: assistant start_practice only after «آره»; day 1 shows the retrieval line
    await fresh(); await E(() => __freshChat());
    await E(() => __say('بیا برای قضیهٔ فیثاغورس یه برنامهٔ بازیابی بچینیم', 'یک چرخهٔ بازیابیِ ۱، ۳ و ۷ روزه برای «فیثاغورس» شروع کنم؟', []));
    const n1 = await E(() => APP.PR.cases({ tid: 41 }).length);
    await E(() => __say('آره', 'شروع شد.', [{ do: 'start_practice', tid: 41, topic: 'فیثاغورس' }]));
    await day(1);
    r = await E(() => ({ c: __one(41), n: APP.PR.cases({ tid: 41 }).length, today: APP.dueList().map(d => d.txt) }));
    T(4, n1 === 0 && r.n === 1 && r.c.src === 'assistant' && r.c.subj.k === 'topic' && /فیثاغورس/.test(r.c.subj.t) && r.today.some(t => /برگه سفید روز ۱/.test(t) && /فیثاغورس/.test(t)), { n1, r });
    // 5 — Leila: T4 from the course; redraws on day 3 and 7 (not 1-then-3), versions diffed against map 1
    await fresh();
    const tp5 = await E(() => __topic('تابع نمایی').id);
    await E((tp) => __ex(4, { focus: 'تابع نمایی چرا سریع رشد می‌کند؟', nodes: ['پایه', 'توان'], map1: 'پایه -> رشد\nتوان -> رشد\nرشد -> انفجار' }, { topic: tp, f: { course: true } }), tp5);
    const c5a = await E(() => __one(4));
    await day(3); await E((tp) => __ex(4, { focus: 'تابع نمایی', map1: 'پایه -> رشد\nتوان -> رشد\nرشد -> نمودار' }, { topic: tp }), tp5);
    await day(7); await E((tp) => __ex(4, { focus: 'تابع نمایی', map1: 'پایه -> رشد\nتوان -> رشد\nرشد -> انفجار\nلگاریتم -> وارون' }, { topic: tp }), tp5);
    r = await E(() => ({ c: __one(4), v: APP.PR.versions(APP.PR.cases({ tid: 4 })[0]) }));
    T(5, c5a.src === 'course' && c5a.due === ymd(3) && r.c.sessions.length === 3 && r.c.sessions[1].role === 'step' && r.c.sessions[2].role === 'step' && r.v[1].added === 1 && r.v[1].removed === 1 && r.v[2].added === 1 && r.v[2].removed === 0, { c5a: [c5a.src, c5a.due], roles: r.c.sessions.map(s => s.role), v: r.v });
    // 6 — Reza T31 pause/resume: window recomputed from resume
    await fresh();
    await E(() => __ex(31, { task: 'مسائلِ شمارشی', voice: 'من آدمِ ترکیبیات نیستم', errors: [{ err: 'شمردنِ دوباره', type: 'راهبرد نامناسب', cause: 'جدول نکشیدم' }], yet: 'هنوز …', strat: ['اول حالت‌های کوچک را جدول کن'] }, { f: { freeT: 'شمارش' } }));
    await day(2); await E(() => APP.PR.pause(APP.PR.cases({ tid: 31 })[0], 'بیمارستان'));
    const p6 = await E(() => __one(31));
    await day(9); await E(() => APP.PR.resume(APP.PR.cases({ tid: 31 })[0]));
    r = await E(() => { const c = __one(31); return { c, d10: __due('2026-10-27').filter(e => e.id === c.id).length, d11: __due('2026-10-28').filter(e => e.id === c.id).length, d16: __due('2026-11-02').filter(e => e.id === c.id).length }; });
    T(6, p6.state === 'paused' && r.c.due === ymd(11) && r.c.until === ymd(16) && r.d10 === 0 && r.d11 === 1 && r.d16 === 1 && r.c.hist.some(e => e.ev === 'pause' && e.d === ymd(2) && /بیمارستان/.test(e.why)) && r.c.hist.some(e => e.ev === 'resume' && e.d === ymd(9)), { p6: p6.state, c: [r.c.state, r.c.due, r.c.until], d: [r.d10, r.d11, r.d16] });
    const r36 = { p6, c: r.c };
    // 7 — Nima T26: day-20 redraw logged on its date as 19 days late, not a day+1 redraw; case open
    await fresh();
    const tp7 = await E(() => __topic('چرخهٔ آب').id);
    await E((tp) => __ex(26, { nodes: ['تبخیر', 'بارش'], edges: 'تبخیر -> ابر\nابر -> بارش' }, { topic: tp }), tp7);
    await day(20); await E((tp) => __ex(26, { edges: 'تبخیر -> ابر\nابر -> بارش\nبارش -> رود' }, { topic: tp }), tp7);
    r = await E(() => { const c = __one(26); return { c, page: __go('practice', c.id) }; });
    T(7, r.c.sessions.length === 2 && r.c.sessions[1].d === ymd(20) && r.c.sessions[1].role === 'late' && r.c.sessions[1].late === 19 && r.c.state === 'open' && /۱۹ روز دیرتر از موعد/.test(r.page), { s: r.c.sessions.map(s => [s.d, s.role, s.late]), st: r.c.state });
    // 8 — Hoda: key is technique × subject
    await fresh();
    r = await E(() => { const a = __topic('فیثاغورس').id, b2 = __topic('اتحادهای مثلثاتی').id; __ex(41, { topic: 'فیثاغورس' }, { topic: a }); __ex(28, { concept: 'فیثاغورس', explain: 'مربعِ وتر برابرِ جمعِ مربع‌هاست چون مساحت‌ها جور درمی‌آیند.' }, { topic: a }); __ex(41, { topic: 'اتحادها' }, { topic: b2 });
      return APP.PR.cases().map(c => c.key); });
    T(8, r.length === 3 && new Set(r).size === 3, r);
    // 9 — Samira T30 (free subject): weekly walk due day 7 and day 14; each walk a session
    await fresh();
    await E(() => __ex(30, { source: 'جلسهٔ آمارِ بیزی', recall: 'پیشین و پسین' }, { f: { freeT: 'آمارِ بیزی' } }));
    const c9a = await E(() => __one(30));
    await day(7); await E(() => APP.PR.session(APP.PR.cases({ tid: 30 })[0], { what: 'گشت‌وگذارِ ۲۰ دقیقه‌ای' }));
    const c9b = await E(() => __one(30));
    await day(14); await E(() => APP.PR.session(APP.PR.cases({ tid: 30 })[0], { what: 'گشت‌وگذارِ ۲۰ دقیقه‌ای' }));
    r = await E(() => __one(30));
    T(9, c9a.subj.k === 'free' && c9a.due === ymd(7) && c9b.due === ymd(14) && r.sessions.length === 3, { a: c9a.due, b: c9b.due, n: r.sessions.length, subj: c9a.subj });
    // 10 — Maryam duplicate: library «شروع تمرین» on «مشتق» opens the existing case (session 2), no unlinked ex
    await fresh();
    const tp10 = await E(() => __topic('مشتق').id);
    await E((tp) => __ex(28, { concept: 'مشتق', explain: 'مشتق آهنگِ تغییر است چون شیب است.' }, { topic: tp }), tp10);
    await day(1); await E(() => APP.go('tech', 28, 'ws'));
    await p.selectOption('#wsTopic', tp10); await p.click('.workshop .start button.btn:not(.ghost)');
    const ex10 = await E(() => APP.state.sub.split(':')[1]);
    await E((x) => __finish(x, { concept: 'مشتق', explain: 'مشتق آهنگِ تغییر است چون شیب است.' }), ex10);
    r = await E((x) => ({ n: APP.PR.cases({ tid: 28 }).length, c: __one(28), exPrc: APP.S.get(x).prc, unlinked: APP.S.all('ex', e => e.tid === 28 && e.status === 'done' && !e.prc).length }), ex10);
    T(10, r.n === 1 && r.c.sessions.length === 2 && r.exPrc === r.c.id && r.unlinked === 0, r);
    // 11 — Kaveh: assistant start_practice on the same problem continues the T21 case
    await fresh();
    const pid11 = await E(() => __live('به چند طریق از ۲۰ پله؟'));
    await E((pid) => { const c = APP.PR.startFrom(21, APP.PR.subj('live', pid), 'live', false); }, pid11);
    await day(2); await E(() => __freshChat());
    await E((pid) => __say('یه آزمون برای حدسِ فیبوناچی بذار', 'باشه.', [{ do: 'start_practice', tid: 21, pid }]), pid11);
    r = await E(() => ({ n: APP.PR.cases({ tid: 21 }).length, note: APP.ASSIST._prcNote || '', prcs: (APP.ASSIST.cur() || {}).prcs || [], id: APP.PR.cases({ tid: 21 })[0].id }));
    T(11, r.n === 1 && /ادامه یافت/.test(r.note) && r.prcs.includes(r.id), r);
    // 12 — Pouya: viewing a closed case adds no session and does not reopen it
    await fresh();
    await E(() => { const cs = APP.newCase({ title: 'باورِ آزمون' }); const c = APP.PR.start(22, APP.PR.subj('case', cs.id), { src: 'case' }); APP.PR.session(c, { what: 'کاربرگ' }); APP.PR.close(c, 'تمام'); });
    await day(40);
    r = await E(() => { const id = APP.PR.cases({ tid: 22 })[0].id; __go('tech', 22); __go('tech', 22, 'prc'); __go('practice', id); return __case(id); });
    T(12, r.state === 'closed' && r.sessions.length === 1, { st: r.state, n: r.sessions.length });
    // 13 — Leila: a draft is not a session
    await fresh();
    r = await E(() => { __ex(23, { target: 'نیمه‌کاره' }, { draft: true }); const c = APP.PR.cases({ tid: 23 })[0]; return c ? { n: (c.sessions || []).length, due: c.due, st: c.state } : { none: true }; });
    T(13, r.none || (r.n === 0 && !r.due && r.st === 'open'), r);
    // 14 — Hoda: a second subject is never appended to the first case
    await fresh();
    await E(() => __ex(41, { topic: 'فیثاغورس' }, { topic: __topic('فیثاغورس').id }));
    await day(1); await E(() => __ex(41, { topic: 'اتحادها' }, { topic: __topic('اتحادهای مثلثاتی').id }));
    r = await E(() => APP.PR.cases({ tid: 41 }).map(c => ({ t: c.subj.t, n: c.sessions.length })));
    T(14, r.length === 2 && r.every(x => x.n === 1), r);
    // 15 — Hoda: an offer answered «بعداً» creates no case even if the model sends start_practice
    await fresh(); await E(() => __freshChat());
    await E(() => __say('حس می‌کنم فرمول‌ها یادم می‌ره', 'می‌خواهی برایش یک چرخهٔ بازیابی بگذاریم؟', []));
    await E(() => __say('بعداً', 'باشه.', [{ do: 'start_practice', tid: 41, topic: 'فرمول‌ها' }]));
    r = await E(() => APP.PR.cases().length);
    T(15, r === 0, r);
    // 16 — Reza: pause keeps the day-0 session; no overdue badge on days 2–8
    await fresh();
    await E(() => __ex(31, { task: 'شمارش', errors: [{ err: 'شمردنِ دوباره' }], strat: ['جدول'] }, { f: { freeT: 'شمارش' } }));
    await day(2); await E(() => APP.PR.pause(APP.PR.cases({ tid: 31 })[0], 'بیمارستان'));
    const od = [];
    for (const n of [4, 8]) { await day(n); od.push(await E(() => { const c = __one(31); return { due: c.due, lines: APP.dueList().filter(d => d.prc).length, inDue: __due(APP.today()).length }; })); }
    r = await E(() => __one(31));
    T(16, r.sessions.length === 1 && r.sessions[0].d === ymd(0) && od.every(x => !x.due && x.lines === 0 && x.inDue === 0) && r36.c.sessions.some(s => s.d === ymd(0)), { od, n: r.sessions.length });
    // 17 — Maryam: two saves the same day are one session
    await fresh();
    const tp17 = await E(() => __topic('مشتق').id);
    await E((tp) => __ex(28, { concept: 'مشتق', explain: 'مشتق آهنگِ تغییر است چون شیب است.' }, { topic: tp }), tp17);
    await day(0, 22); await E((tp) => __ex(28, { concept: 'مشتق', explain: 'مشتق آهنگِ تغییر است چون شیبِ مماس است.' }, { topic: tp }), tp17);
    r = await E(() => __one(28));
    T(17, r.sessions.length === 1 && r.sessions[0].ex.length === 2, { n: r.sessions.length, ex: r.sessions[0] && r.sessions[0].ex });
  });

  // ================= LT3.stable =================
  await section('lt3', async () => {
    const { T } = bankT('lt3', 'LT3.stable'); let r;
    // 0 — Kaveh T41: «تثبیت شد» day 7 with dated evidence (via the P3 cycle runs), day-14 blank page 40% withdraws it
    await fresh();
    const tp = await E(() => __topic('قضیهٔ چینی').id);
    await E((tp) => __ex(41, { topic: 'قضیهٔ چینی' }, { topic: tp }), tp);
    const runP3 = (pct) => E((pct) => { const c = APP.PR.cases({ tid: 41 })[0]; const sc = APP.S.all('sched', s => s.prc === c.id && !s.done).sort((a, b) => a.due.localeCompare(b.due))[0]; const r = APP.S.put({ id: APP.uid('pr'), type: 'pr', pid: 'P3', topic: c.subj.id, sched: sc.id, status: 'done', data: { pct } }); APP.onProtoDone(r); sc.done = true; APP.S.put(sc); return sc.label; }, pct);
    await day(1); await runP3(80); await day(3); await runP3(85); await day(7); const l7 = await runP3(90);
    const s7 = await E(() => __one(41));
    await day(14); await E((tp) => { const r = APP.S.put({ id: APP.uid('pr'), type: 'pr', pid: 'P4', topic: tp, status: 'done', data: { pct: 40 } }); APP.onProtoDone(r); }, tp);
    r = await E(() => { const c = __one(41); return { c, d15: __due('2026-11-01').filter(e => e.id === c.id).length }; });
    T(0, s7.state === 'stable' && s7.stable.d === ymd(7) && JSON.stringify(s7.stable.ev.map(e => e.d)) === JSON.stringify([ymd(1), ymd(3), ymd(7)]) && s7.stable.ev.map(e => e.meas.pct).join() === '80,85,90' && s7.stable.next === ymd(14) &&
      r.c.state === 'stabilising' && r.c.withdrawn.length === 1 && r.c.withdrawn[0].d === ymd(14) && r.c.hist.some(e => e.ev === 'withdraw' && e.d === ymd(14)) && r.d15 === 1, { l7, s7: [s7.state, s7.stable], c: [r.c.state, r.c.withdrawn, r.c.due], d15: r.d15 });
    // 1 — Mahsa T23 knot criterion: stable day 4
    await fresh();
    r = await E(() => { const k = __knot('عجله'); const c = APP.PR.start(23, APP.PR.subj('knot', k), { src: 'knot' }); APP.PR.session(c, { what: 'ورزش', meas: { correct: 3, forms: ['عددی', 'تصویری', 'کلامی'] } }); return c.id; });
    await day(4); r = await E((id) => { APP.PR.session(id, { what: 'ورزش', meas: { correct: 3, forms: ['زندگیِ واقعی', 'انتزاعی'], decoys: 2 } }); return __case(id); }, r);
    T(1, r.state === 'stable' && r.stable.d === ymd(4) && r.stable.ev.map(e => e.d).join() === [ymd(0), ymd(4)].join(), { st: r.state, stable: r.stable, crit: r.crit });
    // 2 — Arash T24 calibration: 11/15 inside 70% across three days ⇒ stable day 9
    await fresh();
    const preds = (n, tag) => Array.from({ length: n }, (_, i) => ({ st: tag + ' گزارهٔ ' + (i + 1), conf: '70', why: 'تجربه', due: '', out: '' }));
    const resolve = (tag, k) => E(([tag, k]) => { APP.S.all('fcast', x => (x.q || '').startsWith(tag)).sort((a, b) => a.q.localeCompare(b.q)).forEach((x, i) => { x.outcome = i < k ? 'شد' : 'نشد'; x.outcomeAt = new Date().toISOString(); APP.S.put(x); }); }, [tag, k]);
    await E((rows) => __ex(24, { preds: rows }), preds(5, 'الف'));
    await day(1); await resolve('الف', 3);
    await day(4); await E((rows) => __ex(24, { preds: rows }), preds(5, 'ب')); await day(5); await resolve('ب', 4);
    const s2a = await E(() => __one(24));
    await day(9); await E((rows) => __ex(24, { preds: rows }), preds(5, 'ج')); await resolve('ج', 4);
    r = await E(() => __one(24));
    T(2, r.state === 'stable' && r.stable.d === ymd(9) && r.calib.n === 15 && r.calib.k === 11 && r.calib.days.length === 3 && s2a.state !== 'stable', { st: r.state, stable: r.stable && r.stable.d, calib: r.calib, before: s2a.state });
    // 3 — Sara T21: 3 complete experiments over 15 days ⇒ stable day 15
    await fresh();
    const x21 = { belief: 'قهوه خوابم را خراب می‌کند', hyp: 'اگر بعد از ۲ قهوه نخورم آنگاه زودتر می‌خوابم', criteria: 'اگر ۳۰ دقیقه زودتر یعنی تأیید', result: 'خوابِ ۲۵ دقیقه زودتر', verdict: 'تأیید شد', update: 'ادامه' };
    await E((x) => __ex(21, x, { f: { freeT: 'خواب' } }), x21);
    await day(6); await E((x) => __ex(21, x, { f: { freeT: 'خواب' } }), x21); const s3a = await E(() => __one(21));
    await day(15); await E((x) => __ex(21, x, { f: { freeT: 'خواب' } }), x21);
    r = await E(() => __one(21));
    T(3, r.state === 'stable' && r.stable.d === ymd(15) && s3a.state !== 'stable', { st: r.state, d: r.stable && r.stable.d, before: s3a.state, crit: r.crit });
    // 4 — Negar T42: day-22 lapse resets to 1 day and revokes the stability mark with its date; history keeps earlier successes
    await fresh();
    const cardId = await E(() => APP.newCard('مشتقِ sin x چیست؟', 'cos x', { tid: 42, topic: __topic('حسابان').id }).id);
    const grade = (g, conf) => E(([id, g, conf]) => { const c = APP.S.get(id); APP.srsGrade(c, g, conf); APP.S.put(c); return c.due; }, [cardId, g, conf]);
    await day(1); await grade(4); await day(7); await grade(4); const s4a = await E(() => __one(42));
    await day(22); const due22 = await grade(1);
    r = await E(() => __one(42));
    T(4, s4a.state === 'stable' && due22 === ymd(23) && r.state !== 'stable' && r.withdrawn.some(w => w.d === ymd(22)) && r.sessions.length === 3 && r.sessions.filter(s => s.ok).length === 2, { s4a: s4a.state, due22, st: r.state, w: r.withdrawn });
    // 5 — Reza T31: confirmed on two different problems ≥3 days apart ⇒ stable day 11, evidence names both
    await fresh();
    await E(() => __ex(31, { task: 'مسائلِ شمارشی', errors: [{ err: 'شمردنِ دوباره' }], strat: ['اول حالت‌های کوچک را جدول کن'] }, { f: { freeT: 'شمارشی' } }));
    await day(4); await E(() => APP.PR.session(APP.PR.cases({ tid: 31 })[0], { what: 'جواب داد', ok: true, meas: { problem: 'رنگ‌آمیزیِ صفحه' } }));
    await day(11); await E(() => APP.PR.session(APP.PR.cases({ tid: 31 })[0], { what: 'جواب داد', ok: true, meas: { problem: 'مسیرهای شبکه' } }));
    r = await E(() => __one(31));
    T(5, r.state === 'stable' && r.stable.d === ymd(11) && r.stable.ev.map(e => e.problem).join('|') === 'رنگ‌آمیزیِ صفحه|مسیرهای شبکه', { st: r.state, stable: r.stable });
    // 6 — Maryam T28: stable day 7 (jargon down), day-14 check-in with 5 terms and stuck «حد» reopens to stabilising; Today turn returns
    await fresh();
    const tp6 = await E(() => __topic('حد و مشتق').id);
    const fe = (txt, gaps) => ({ concept: 'مشتق چیست؟', explain: txt, rewrite: txt, gaps: gaps || [] });
    const base = 'مشتق آهنگِ تغییر است چون شیبِ مماس را می‌دهد';
    await E(([tp, w]) => __ex(28, w, { topic: tp }), [tp6, fe(base + ' derivative slope', ['حد'])]);
    await day(1); await E(([tp, w]) => __ex(28, w, { topic: tp }), [tp6, fe(base + ' slope')]);
    await day(7); await E(([tp, w]) => __ex(28, w, { topic: tp }), [tp6, fe(base)]);
    const s6 = await E(() => __one(28));
    await day(14); await E(([tp, w]) => __ex(28, w, { topic: tp }), [tp6, fe(base + ' limit epsilon delta derivative tangent', ['حد'])]);
    r = await E(() => { const c = __one(28); return { c, d15: __due('2026-11-01').filter(e => e.id === c.id).length, page: __go('practice', c.id) }; });
    T(6, s6.state === 'stable' && s6.stable.d === ymd(7) && s6.stable.next === ymd(14) && r.c.state === 'stabilising' && (r.c.sessions[3].meas.stuck || []).includes('حد') && r.d15 === 1, { s6: [s6.state, s6.stable && s6.stable.next], c: [r.c.state, r.c.sessions.map(s => s.meas && s.meas.jargon)], d15: r.d15 });
    const r54 = r;
    // 7 — Pouya T22: verdict «رد شد» day 10 with the dated observation; re-review day 17; revision kept as history
    await fresh();
    await E(() => __ex(22, { belief: 'مهاجرت یعنی موفقیت', kind: 'علّی (X باعث Y)', falsifiers: [{ obs: 'همکارِ مهاجرِ بی‌کار', thr: 'دو نفر', where: 'لینکدین' }] }, { f: { freeT: 'مهاجرت' } }));
    await day(10); await E(() => { const c = APP.PR.cases({ tid: 22 })[0]; const ex = APP.newEx(22, ''); ex.prc = c.id; ex.data = { belief: 'مهاجرت یعنی موفقیت', found: 'دو همکارِ مهاجر هنوز کار پیدا نکرده‌اند', status: 'باطل شد' }; ex.status = 'done'; APP.S.put(ex); APP.onExDone(ex); });
    const s7a = await E(() => { const c = __one(22); return { c, d16: __due('2026-11-02').filter(e => e.id === c.id).length, d17: __due('2026-11-03').filter(e => e.id === c.id).length, cs: APP.PR.ecaseOf(APP.S.get(c.id)) }; });
    await day(17); await E(() => APP.PR.session(APP.PR.cases({ tid: 22 })[0], { what: 'بازبینی پس از نتیجه' }));
    r = await E(() => __one(22));
    T(7, s7a.c.verdict && s7a.c.verdict.fa === 'رد شد' && s7a.c.verdict.d === ymd(10) && s7a.c.due === ymd(17) && s7a.d16 === 0 && s7a.d17 === 1 && s7a.cs && (s7a.cs.prcHist || []).some(e => e.d === ymd(10) && e.v === 'رد شد') && r.stable && r.stable.ev.length === 2, { v: s7a.c.verdict, due: s7a.c.due, d: [s7a.d16, s7a.d17], hist: s7a.cs && s7a.cs.prcHist, st: r.state });
    // 8 — Ladan T16: admitted on day 12 after 3 real uses on 3 days
    await fresh();
    await E(() => APP.PR.modelUse('هزینهٔ فرصت', { where: 'خرید خودرو' })); await day(5); await E(() => APP.PR.modelUse('هزینهٔ فرصت', { where: 'انتخابِ دوره' }));
    const s8 = await E(() => APP.PR.listItem('models', 'هزینهٔ فرصت').status);
    await day(12); r = await E(() => APP.PR.modelUse('هزینهٔ فرصت', { where: 'قبولِ پروژه' }));
    T(8, s8 === 'نامزد' && r.status === 'پذیرفته' && r.admitted === ymd(12) && r.realDays === 3, { s8, r });
    // 9 — Bahram T39: third recurrence suggests double-loop with three dates; then monthly review day 50
    await fresh();
    const subj39 = await E(() => APP.PR.subj('free', '', 'تأخیر در تحویلِ سفارش'));
    await E((s) => APP.PR.recur(s), subj39); await day(9); await E((s) => APP.PR.recur(s), subj39); await day(20);
    const s9 = await E((s) => __case(APP.PR.recur(s).id), subj39);
    await E(() => { const c = APP.PR.cases({ tid: 39 })[0]; const ex = APP.newEx(39, ''); ex.prc = c.id; ex.data = { prob: 'تأخیر در تحویل', gov: 'من فرض کرده‌ام که…' }; ex.status = 'done'; APP.S.put(ex); APP.onExDone(ex); });
    r = await E(() => __one(39));
    T(9, s9.due === ymd(20) && s9.suggest && s9.suggest.dates.join() === [ymd(0), ymd(9), ymd(20)].join() && r.due === ymd(50), { s9: [s9.due, s9.suggest], due: r.due });
    // 10 — Negar: six T43 sheets at 100% the same day = one session, never «روان»/«تثبیت شد»
    await fresh();
    r = await E(() => { const t = APP.TM[43]; for (let i = 0; i < 6; i++) __ex(43, { x: i }, { rubric: t.rubric.map(() => 2), f: { freeT: 'مثلثات' } }); const m = APP.mastery(43); return { c: __one(43), m }; });
    T(10, r.c.sessions.length === 1 && r.c.state !== 'stable' && r.m.lvl < 3 && r.m.n === 1, { n: r.c.sessions.length, st: r.c.state, m: r.m });
    // 11 — Kaveh: three retrievals on day 1 are one session; no jump to the day-3/day-7 step
    await fresh();
    const id11 = await E(() => APP.PR.start(41, APP.PR.subj('topic', __topic('قضیهٔ چینی').id), { src: 'library' }).id);
    for (const hr of [8, 13, 21]) { await day(1, hr); await E((id) => APP.PR.session(id, { what: 'بازیابی', meas: { pct: 80 } }), id11); }
    r = await E((id) => __case(id), id11);
    T(11, r.sessions.length === 1 && r.next === ymd(3) && r.state !== 'stable', { n: r.sessions.length, next: r.next, st: r.state });
    // 12 — Leila: «تثبیت شد» without any session is only her claim; case stays open with a Today turn
    await fresh();
    r = await E(() => { const c = APP.PR.start(4, APP.PR.subj('topic', __topic('لگاریتم').id), { src: 'library' }); APP.PR.claim(c); return { c: __case(c.id), page: __go('practice', c.id), due: __due(APP.today()).filter(e => e.id === c.id).length }; });
    T(12, r.c.state === 'open' && !r.c.stable && r.c.claim && r.due === 1 && /ادعای خودت/.test(r.page), { st: r.c.state, claim: r.c.claim, due: r.due });
    // 13 — Arash: 52 predictions from one day — hit rate shown, «across days» unmet
    await fresh();
    await E(() => { const rows = Array.from({ length: 52 }, (_, i) => ({ st: 'یک‌روزه ' + i, conf: '70', due: '', out: '' })); __ex(24, { preds: rows }); });
    await day(1); await resolve('یک‌روزه', 37);
    r = await E(() => __one(24));
    T(13, r.state !== 'stable' && r.calib.n === 52 && r.calib.hit === 71 && r.crit.some(x => !x.ok && /روزِ جدا/.test(x.t)), { st: r.state, calib: r.calib, crit: r.crit });
    // 14 — Sara: span 10 < 14 ⇒ not stable
    await fresh();
    for (const n of [0, 4, 10]) { await day(n); await E((x) => __ex(21, x, { f: { freeT: 'خواب' } }), x21); }
    r = await E(() => __one(21));
    T(14, r.state !== 'stable' && r.crit.some(x => !x.ok && /۱۴ روز/.test(x.t)), { st: r.state, crit: r.crit });
    // 15 — Kaveh: self 2/2 but measured 30% ⇒ measured wins, cycle steps back
    await fresh();
    const tp15 = await E(() => __topic('قضیهٔ چینی').id);
    await E((tp) => __ex(41, { topic: 'قضیهٔ چینی' }, { topic: tp }), tp15);
    await day(7); await E((tp) => __ex(41, { topic: 'قضیهٔ چینی', actual: '30' }, { topic: tp, rubric: APP.TM[41].rubric.map(() => 2) }), tp15);
    r = await E(() => __one(41));
    T(15, r.state !== 'stable' && r.sessions[1].ok === false && r.next === ymd(8), { st: r.state, s: r.sessions.map(s => [s.d, s.ok, s.role]), next: r.next });
    // 16 — Maryam: after the failed check-in neither the case nor its page shows «تثبیت شد»
    T(16, r54.c.state !== 'stable' && !r54.c.stable && !/✓ تثبیت شد —/.test(r54.page) && /پس گرفته شد/.test(r54.page), { st: r54.c.state });
    // 17 — Ladan: three hypothetical uses on one day = one use, not admitted
    await fresh();
    r = await E(() => { ['سؤالِ فرضیِ ۱', 'سؤالِ فرضیِ ۲', 'سؤالِ فرضیِ ۳'].forEach(w => APP.PR.modelUse('هزینهٔ فرصت', { where: w, real: false })); return APP.PR.listItem('models', 'هزینهٔ فرصت'); });
    T(17, r.count === 1 && r.status === 'نامزد' && r.realDays === 0, r);
    // 18 — Negar: a late failure (due day 1, failed day 4) is not success at a longer interval; interval resets to 1
    await fresh();
    const cid18 = await E(() => APP.newCard('مشتقِ e^x؟', 'e^x', { tid: 42, topic: __topic('حسابان').id }).id);
    await day(4); const due18 = await E((id) => { const c = APP.S.get(id); APP.srsGrade(c, 1); APP.S.put(c); return c.due; }, cid18);
    r = await E(() => __one(42));
    T(18, due18 === ymd(5) && r.sessions.length === 1 && r.sessions[0].ok === false && !r.stable, { due18, s: r.sessions });
  });

  // ================= LT5.one =================
  await section('lt5', async () => {
    const { T } = bankT('lt5', 'LT5.one'); let r;
    const t24 = (st, due, out) => E(([st, due, out]) => __ex(24, { preds: [{ st, conf: '70', why: 'فرم', due, out: out || '' }] }), [st, due, out]);
    const t24page = () => E(() => { __go('tech', 24, 'prc'); return Array.from(document.querySelectorAll('.prc-linked li[data-kind="fcast"]')).map(li => li.innerText); });
    // 0 — Arash: one fcast; the T24 page opens that dated record and shows the outcome set in 🎯
    await fresh();
    await t24('برزیل بازی را می‌برد', '2026-10-20');
    const f0 = await E(() => APP.S.all('fcast').map(x => ({ q: x.q, due: x.due, prc: !!x.prc })));
    await day(3); await E(() => APP.go('fcast'));
    await p.selectOption('select[aria-label^="نتیجهٔ «برزیل"]', 'شد');
    r = { li: await t24page(), row: await E(() => APP.S.all('ex', e => e.tid === 24)[0].data.preds[0].out), n: await E(() => APP.S.all('fcast').length) };
    T(0, f0.length === 1 && f0[0].due === '2026-10-20' && f0[0].prc && r.n === 1 && r.li.length === 1 && /برزیل/.test(r.li[0]) && /— شد/.test(r.li[0]) && r.row === 'درست', { f0, r });
    // 1 — Mahsa: T21 from the knot IS the knot's kexp; the T21 page opens it with plan/predict/observe/outcome
    await fresh();
    const k1 = await E(() => __knot('حواس‌پرتی'));
    await E((k) => { const c = APP.PR.start(21, APP.PR.subj('knot', k), { src: 'knot' }); const ex = APP.newEx(21, ''); ex.prc = c.id; ex.knot = k; ex.data = { belief: 'با موسیقی تمرکز ندارم', hyp: 'اگر بی‌موسیقی بخوانم آنگاه ۲ صفحه بیشتر', criteria: '۲ صفحه یعنی تأیید' }; ex.status = 'done'; APP.S.put(ex); APP.onExDone(ex); }, k1);
    await day(5); await E(() => { const x = APP.S.all('kexp')[0]; x.observe = 'سه صفحه بیشتر خواندم'; x.outcome = 'same'; x.reflect = 'بی‌موسیقی بهتر است'; x.status = 'done'; x.doneAt = APP.today() + 'T10:00:00Z'; APP.S.put(x); });
    r = await E((k) => { __go('tech', 21, 'prc'); return { n: APP.S.all('kexp', x => x.knot === k).length, li: Array.from(document.querySelectorAll('.prc-linked li[data-kind="kexp"]')).map(li => li.innerText) }; }, k1);
    T(1, r.n === 1 && r.li.length === 1 && /بی‌موسیقی بخوانم/.test(r.li[0]) && /پیش‌بینی/.test(r.li[0]) && /سه صفحه بیشتر/.test(r.li[0]) && /همان شد/.test(r.li[0]), r);
    const r83 = r;
    // 2 — Kaveh: the T21 page shows the live-problem step itself (with its fcast)
    await fresh();
    const pid2 = await E(() => __live('۲۰ پله'));
    await E((pid) => { const fc = APP.S.put({ id: 'fc_ls1', type: 'fcast', q: 'n=4 پنج راه — گامِ «آزمونِ n=4»', p: 70, due: APP.addDays(APP.today(), 1), dim: 's_problem', live: { pid, step: 'ls1' } });
      const U = APP.solveUI, pg = U.prog(pid), s = U.sol(pg); s.live = s.live || {}; s.live.steps = [{ id: 'ls1', at: new Date().toISOString(), d: APP.today(), text: 'آزمونِ n=4', pred: 'پنج راه', conf: 70, due: fc.due, fc: fc.id }]; APP.S.put(pg); }, pid2);
    await day(1); await E((pid) => { const fc = APP.S.get('fc_ls1'); fc.outcome = 'شد'; fc.outcomeAt = new Date().toISOString(); APP.S.put(fc); const U = APP.solveUI, pg = U.prog(pid), s = U.sol(pg); s.live.steps[0].out = { done: 'yes', what: 'پنج راه درآمد' }; APP.S.put(pg); }, pid2);
    r = await E(() => { __go('tech', 21, 'prc'); return { li: Array.from(document.querySelectorAll('.prc-linked li[data-kind="step"]')).map(li => li.innerText), fc: APP.S.all('fcast').length }; });
    T(2, r.li.length === 1 && /آزمونِ n=4/.test(r.li[0]) && /پنج راه درآمد/.test(r.li[0]) && r.fc === 1, r);
    // 3 — Pouya: T22 from the library creates/attaches ONE epistemic case with revdate; both pages show the same record
    await fresh();
    await E(() => __ex(22, { belief: 'مهاجرت یعنی موفقیتِ شغلی', kind: 'علّی (X باعث Y)' }, { f: { freeT: 'مهاجرت' } }));
    r = await E(() => { const cs = APP.S.all('case'); const c = __one(22); __go('tech', 22, 'prc'); const li = Array.from(document.querySelectorAll('.prc-linked li[data-kind="case"]')).map(x => x.getAttribute('data-id'));
      return { n: cs.length, id: cs[0] && cs[0].id, rev: cs[0] && cs[0].st.st_final.data.revdate, li, link: c.links.ecase, page: cs[0] ? __go('e_case', cs[0].id) : '' }; });
    T(3, r.n === 1 && r.rev === ymd(7) && r.li.includes(r.id) && r.link === r.id && /پرونده‌های تمرین روی این پرونده/.test(r.page) && /ابطال‌گرایی/.test(r.page), { n: r.n, rev: r.rev, li: r.li, link: r.link });
    // 4 — Farzaneh: T9 final estimate ⇒ ONE fcast due 2026-11-16; day 30 scores inside vs base there
    await fresh();
    await E(() => __ex(9, { q: 'چند ماه تا پیدا کردنِ کار؟', inside: '۲', base: '۶', final: '۴ ماه تا پیدا کردنِ کار' }, { f: { freeT: 'کار' } }));
    const f4 = await E(() => APP.S.all('fcast').map(x => ({ id: x.id, due: x.due, est: x.est, tid: x.tid })));
    await day(30); r = await E((id) => APP.PR.t9Score(id, '5'), f4[0] && f4[0].id);
    T(4, f4.length === 1 && f4[0].due === '2026-11-16' && f4[0].est && r && r.gapIn === 3 && r.gapBase === 1 && r.closer === 'base', { f4, r });
    // 5 — Arash: outcome recorded from the T24 page ⇒ the 🎯 ledger shows it at once (same record)
    await fresh();
    await t24('برزیل بازی را می‌برد', '2026-10-20');
    await day(3); r = await E(() => { const ex = APP.S.all('ex', e => e.tid === 24)[0]; ex.data.preds[0].out = 'درست'; APP.S.put(ex); return APP.S.all('fcast').map(x => x.outcome); });
    T(5, r.length === 1 && r[0] === 'شد', r);
    // 6 — Kaveh: T41 from the technique page starts the existing P3 1/3/7 schedule for that topic; the page opens it
    await fresh();
    r = await E(() => { const tp = __topic('قضیهٔ چینی').id; __ex(41, { topic: 'قضیهٔ چینی' }, { topic: tp }); __go('tech', 41, 'prc'); return { sc: APP.S.all('sched', s => s.topic === tp).map(s => s.due).sort(), li: document.querySelectorAll('.prc-linked li[data-kind="sched"]').length, link: (__one(41).links.p3 || []).length }; });
    T(6, r.sc.join() === [ymd(1), ymd(3), ymd(7)].join() && r.li === 3 && r.link === 3, r);
    // 7 — Negar: card confidence is ONE calibration point, listed once on the T24 page as «مرور کارت»
    await fresh();
    r = await E(() => { const c = APP.newCard('مشتقِ sin؟', 'cos', {}); APP.srsGrade(c, 4, 80); APP.S.put(c); const pts = APP.PR.calib().filter(x => x.id.startsWith('card:' + c.id)); __go('tech', 24, 'prc'); const li = document.querySelector('.prc-calib li[data-src="مرور کارت"]'); return { n: pts.length, src: pts[0] && pts[0].src, li: li && li.innerText }; });
    T(7, r.n === 1 && r.src === 'مرور کارت' && /مرور کارت: ۱/.test(r.li || ''), r);
    // 8 — Arash: the same prediction typed into 🎯 makes no second record — the form offers the existing one
    await fresh();
    await t24('برزیل بازی را می‌برد', '2026-10-20');
    await E(() => APP.go('fcast')); await p.fill('#fcQ', 'برزیل بازی را می‌برد'); await p.fill('#fcP', '70'); await p.click('#fcQ ~ * button.btn, section:has(#fcQ) button.btn');
    r = await E(() => ({ n: APP.S.all('fcast').length, note: (document.querySelector('.prc-dupfc:not(.hidden)') || {}).innerText || '' }));
    T(8, r.n === 1 && /پیش‌تر ثبت شده/.test(r.note), r);
    // 9 — Mahsa: the T21 page never shows an older copy without the day-5 observation
    T(9, r83.li.length === 1 && !/برنامه · تا/.test(r83.li[0]) && /مشاهده/.test(r83.li[0]), r83);
    // 10 — Farzaneh: not two Today lines for one estimate
    await fresh();
    await E(() => __ex(9, { q: 'چند ماه؟', inside: '۲', base: '۶', final: '۴ ماه' }, { f: { freeT: 'کار' } }));
    await day(30); r = await E(() => ({ mine: __due(APP.today()).length, fc: APP.S.all('fcast', x => x.tid === 9).length, lines: APP.dueList().filter(d => /استدلال کلاس مرجع/.test(d.txt)).length }));
    T(10, r.mine === 0 && r.fc === 1 && r.lines <= 1, r);
    // 11 — Pouya: T22 started from the case, then from the library ⇒ no second epistemic case
    await fresh();
    await E(() => { const cs = APP.newCase({ title: 'مهاجرت یعنی موفقیت', input: 'مهاجرت یعنی موفقیت' }); const c = APP.PR.start(22, APP.PR.subj('case', cs.id), { src: 'case' }); const ex = APP.newEx(22, ''); ex.prc = c.id; ex.ecase = cs.id; ex.data = { belief: 'مهاجرت یعنی موفقیت' }; ex.status = 'done'; APP.S.put(ex); APP.onExDone(ex); });
    await day(2); await E(() => __ex(22, { belief: 'مهاجرت یعنی موفقیت' }, { f: { freeT: 'مهاجرت' } }));
    r = await E(() => APP.S.all('case').length);
    T(11, r === 1, r);
    // 12 — Arash: an outcome changed in 🎯 (شد → نشد) — the T24 page never keeps the old one
    await fresh();
    await t24('برزیل بازی را می‌برد', '2026-10-20');
    await day(3); await E(() => APP.go('fcast')); await p.selectOption('select[aria-label^="نتیجهٔ «برزیل"]', 'شد');
    await E(() => APP.go('fcast')); await p.selectOption('select[aria-label^="نتیجهٔ «برزیل"]', 'نشد');
    r = { li: await t24page(), row: await E(() => APP.S.all('ex', e => e.tid === 24)[0].data.preds[0].out) };
    T(12, r.li.length === 1 && /— نشد/.test(r.li[0]) && !/— شد/.test(r.li[0]) && r.row === 'نادرست', r);
    // 13 — Kaveh: a live step with prediction is counted once in calibration (step + fcast are one record)
    await fresh();
    const pid13 = await E(() => __live('۲۰ پله'));
    r = await E((pid) => { APP.S.put({ id: 'fc_ls2', type: 'fcast', q: 'گامِ پیش‌بینی‌دار', p: 60, due: APP.today(), dim: 's_problem', live: { pid, step: 'ls2' }, outcome: 'شد', outcomeAt: new Date().toISOString() });
      const U = APP.solveUI, pg = U.prog(pid), s = U.sol(pg); s.live = s.live || {}; s.live.steps = [{ id: 'ls2', text: 'گام', pred: 'می‌شود', conf: 60, due: APP.today(), fc: 'fc_ls2', out: { done: 'yes', match: 'yes' } }]; APP.S.put(pg);
      const pts = APP.PR.calib(); return { n: pts.length, ids: pts.map(x => x.id), legacy: APP.calibPoints().length }; }, pid13);
    T(13, r.n === 1 && r.ids[0] === 'fcast:fc_ls2' && r.legacy === 0, r);
    // 14 — Kaveh: T41 and P3 on the same topic are ONE 1/3/7 cycle (either order)
    await fresh();
    r = await E(() => { const a = __topic('الف').id, b2 = __topic('ب').id; __ex(41, { topic: 'الف' }, { topic: a }); APP.start137(a, 'الف'); APP.start137(b2, 'ب'); __ex(41, { topic: 'ب' }, { topic: b2 });
      return { a: APP.S.all('sched', s => s.topic === a).length, b: APP.S.all('sched', s => s.topic === b2).length }; });
    T(14, r.a === 3 && r.b === 3, r);
    // 15 — owner: a tour's prediction does not appear on the owner's T24 page
    await fresh();
    await E(() => __ex(24, { preds: [{ st: 'پیش‌بینیِ تور', conf: '60', due: '2026-10-20', out: '' }] }, { f: { sample: true } }));
    r = { li: await t24page(), fc: await E(() => APP.S.all('fcast').map(x => !!x.sample)) };
    T(15, r.li.length === 0 && r.fc.length === 1 && r.fc[0] === true, r);
  });

  // ================= LT6.link =================
  await section('lt6', async () => {
    const { T } = bankT('lt6', 'LT6.link'); let r;
    // 0 — Kaveh: the case shows in the problem's page/dossier with sessions; the guess shows «تأیید در ۲ آزمون» with dates
    await fresh();
    const pid = await E(() => { const pid = __live('به چند طریق از ۲۰ پله؟'); __guess(pid, 'فیبوناچی'); APP.PR.startFrom(21, APP.PR.subj('live', pid), 'live', false); return pid; });
    await day(1); await E(() => APP.PR.guessTest(APP.PR.cases({ tid: 21 })[0], 'confirm', 'n=4 ⇒ ۵ راه'));
    await day(2); await E(() => APP.PR.guessTest(APP.PR.cases({ tid: 21 })[0], 'confirm', 'n=5 ⇒ ۸ راه'));
    r = await E((pid) => { const page = __go('lprob', pid); const dos = APP.V.dossier ? __go('dossier', pid) : null; const md = APP.dossierMd ? APP.dossierMd(pid) : null; return { page, dos, md, gs: APP.PR.guessStatus(pid), id: APP.PR.cases({ tid: 21 })[0].id, row: !!document.querySelector('.prc-sec [data-prc]') }; }, pid);
    T(0, /تأیید در ۲ آزمون/.test(r.gs.label) && r.gs.tests.map(t => t.d).join() === [ymd(1), ymd(2)].join() && /پرونده‌های تمرین روی این مسئله/.test(r.page) && /تأیید در ۲ آزمون/.test(r.page) && /n=5/.test(r.page) && (r.dos == null || (/تأیید در ۲ آزمون/.test(r.dos) && /جلسهٔ تمرین/.test(r.dos) && /n=5/.test(r.md))), { gs: r.gs, dossier: r.dos != null });
    // 1 — Hoda: «رد شد» updates the problem's guess (dated, linked to the case); problem stays open
    await fresh();
    const pid1 = await E(() => { const pid = __live('مسئلهٔ دایره'); __guess(pid, 'جواب π است'); APP.PR.startFrom(21, APP.PR.subj('live', pid), 'live', false); return pid; });
    await day(2); r = await E((pid) => { const st = APP.PR.guessTest(APP.PR.cases({ tid: 21 })[0], 'refute', 'π درنیامد'); const g = APP.solveUI.sol(APP.solveUI.prog(pid)).g[1]; return { st, g: { refuted: g.refuted, testRes: g.testRes, guess: g.guess }, live: !!APP.liveRec(pid), status: (APP.liveRec(pid) || {}).status, id: APP.PR.cases({ tid: 21 })[0].id }; }, pid1);
    T(1, r.st.refuted && r.g.refuted && r.g.refuted.d === ymd(2) && r.g.refuted.prc === r.id && r.g.testRes === 'حدس رد شد' && r.live, r);
    const st1 = r.status;
    // 9 — Hoda: after «رد شد» the problem is not solved or closed; on day 3 it is still a live, open problem with its guess history
    await day(3); const r99 = await E((pid) => { const L = APP.solveUI.sol(APP.solveUI.prog(pid)).live || {}; return { live: !!APP.liveRec(pid), status: (APP.liveRec(pid) || {}).status, solved: L.state === 'solved', closed: L.state === 'abandoned', page: /حدس رد شد/.test(__go('lprob', pid)) }; }, pid1);
    // 2 — Pouya: the epistemic case page lists the practice case and its next due
    await fresh();
    r = await E(() => { const cs = APP.newCase({ title: 'باورِ مهاجرت' }); const c = APP.PR.start(22, APP.PR.subj('case', cs.id), { src: 'case' }); APP.PR.session(c, { what: 'کاربرگ' }); APP.PR.setDue(c, APP.addDays(APP.today(), 8)); return { page: __go('e_case', cs.id), row: !!document.querySelector('.prc-sec [data-prc="' + c.id + '"]') }; });
    T(2, r.row && /موعدِ بعد/.test(r.page), { row: r.row });
    // 3..7 — techniques that could not start from a knot: T2, T39, T42, T30, T16
    await fresh();
    const kk = await E(() => __knot('عجله'));
    await E((k) => APP.go('knot', k), kk); await p.selectOption('.prc-sec select.prc-tsel', '2'); await p.click('.prc-sec .prc-start');
    r = await E(() => __one(2));
    T(3, r && r.subj.k === 'knot' && r.subj.id === kk, r && r.subj);
    await fresh();
    r = await E(() => { const k = __knot('تکرار مشکلات تحویل'); const c = APP.PR.startFrom(39, APP.PR.subj('knot', k), 'knot', false); const kn = APP.S.get(k); kn.status = 'returned'; kn.returnedAt = new Date().toISOString(); APP.S.put(kn); return { sg: APP.PR.knotSuggest(k), id: c.id, page: __go('knot', k), el: !!document.querySelector('.prc-sug') }; });
    T(4, r.sg && r.sg.tid === 39 && r.sg.prc === r.id && r.el, { sg: r.sg, el: r.el });
    await fresh();
    r = await E(() => { const k = __knot('فراموشیِ فرمول‌ها'); const c = APP.newCard('فرمولِ مساحتِ دایره؟', 'πr²', { tid: 42, knot: k }); APP.srsGrade(c, 4); APP.S.put(c); return { c: __one(42), k }; });
    T(5, r.c && r.c.subj.k === 'knot' && r.c.subj.id === r.k, r.c && r.c.subj);
    await fresh();
    const k6 = await E(() => { const k = __knot('پراکندگیِ یادداشت‌ها'); APP.PR.startFrom(30, APP.PR.subj('knot', k), 'knot', false); APP.PR.session(APP.PR.cases({ tid: 30 })[0], { what: 'یادداشت‌های جلسه' }); return k; });
    await day(7); r = await E((k) => { APP.PR.session(APP.PR.cases({ tid: 30 })[0], { what: 'گشت‌وگذارِ هفتگی' }); __go('knot', k); return Array.from(document.querySelectorAll('.prc-sec .prc-sess li')).map(x => x.innerText); }, k6);
    T(6, r.length === 2 && r.some(t => /گشت‌وگذارِ هفتگی/.test(t)), r);
    await fresh();
    r = await E(() => { const k = __knot('تصمیم‌های عجولانه'); const c = APP.PR.startFrom(16, APP.PR.subj('knot', k), 'knot', false); const x = APP.PR.modelUse('هزینهٔ فرصت', { where: 'خریدِ عجولانه', link: { k: 'knot', id: k } }); return { c: __case(c.id), use: x.uses[0], k }; });
    T(7, r.c.subj.k === 'knot' && r.use.link && r.use.link.id === r.k, r);
    // 8 — Pouya: T22 «رد شد» updates the epistemic case's own outcome/revdate
    await fresh();
    const cs8 = await E(() => { const cs = APP.newCase({ title: 'مهاجرت یعنی موفقیت' }); const c = APP.PR.start(22, APP.PR.subj('case', cs.id), { src: 'case' }); APP.PR.session(c, { what: 'پیش‌بینی' }); return cs.id; });
    await day(10);
    const fin10 = async () => E((cs) => { const c = APP.PR.cases({ tid: 22 })[0]; const ex = APP.newEx(22, ''); ex.prc = c.id; ex.ecase = cs; ex.data = { belief: 'مهاجرت یعنی موفقیت', found: 'همکارانِ بی‌کار', status: 'باطل شد' }; ex.status = 'done'; APP.S.put(ex); APP.onExDone(ex); return ex.id; }, cs8);
    const ex8 = await fin10();
    r = await E((cs) => { const x = APP.S.get(cs); return { o: x.outcome, rev: x.st.st_final.data.revdate, h: x.prcHist }; }, cs8);
    T(8, r.o['1'] === 'نادرست' && r.rev === ymd(17) && r.h.length === 1, r);
    // 16 (global 106) — re-saving the same page the same day does not write the outcome twice
    await E((x) => { const ex = APP.S.get(x); APP.onExDone(ex); }, ex8); await fin10();
    const h106 = await E((cs) => APP.S.get(cs).prcHist.length, cs8);
    T(9, r99.live && r99.status === st1 && !r99.solved && !r99.closed, r99);
    // 10 — Kaveh: wrong link — the case never appears in the other problem's dossier
    await fresh();
    r = await E(() => { const a = __live('۲۰ پله'), b2 = __live('دست‌دادن‌ها'); __guess(a, 'فیبوناچی'); const c = APP.PR.startFrom(21, APP.PR.subj('live', a), 'live', false); APP.PR.session(c, { what: 'نتیجه' }); const pg = __go('lprob', b2); return { inB: !!document.querySelector('.prc-sec [data-prc="' + c.id + '"]'), list: APP.PR.cases({ subj: APP.PR.subj('live', b2) }).length }; });
    T(10, !r.inB && r.list === 0, r);
    // 11 — Leila: closing the practice case does not close the knot
    await fresh();
    r = await E(() => { const k = __knot('فراموشیِ قواعد لگاریتم'); const st0 = APP.S.get(k).status; const c = APP.PR.start(41, APP.PR.subj('knot', k), { src: 'knot' }); APP.PR.close(c, 'تثبیت شد'); return { st0, st1: APP.S.get(k).status, c: __case(c.id).state }; });
    T(11, r.st0 === r.st1 && r.c === 'closed', r);
    // 12 — Samira: free subject — labelled «آزاد», no fake link
    await fresh();
    r = await E(() => { __ex(30, { source: 'جلسه' }, { f: { freeT: '' } }); const c = APP.PR.cases({ tid: 30 })[0]; const M = APP.GRAPH.build(); const key = 'practice:' + c.id; const nb = (M.adj[key] || []).map(i => M.edges[i]).map(e => e.a === key ? e.b : e.a); return { k: c.subj.k, label: APP.PR.subjLabel(c.subj), nb }; });
    T(12, r.k === 'free' && /آزاد/.test(r.label) && r.nb.every(x => /^tech:/.test(x)), r);
    // 13 — a tour's T21 case is never linked into the owner's dossier
    await fresh();
    r = await E(() => { const pid = __live('مسئلهٔ نمونه'); __ex(21, { hyp: 'آزمونِ تور' }, { f: { lprob: pid, sample: true } }); const c = APP.PR.all(x => x.tid === 21)[0]; __go('lprob', pid); return { smp: c && c.sample, inPage: !!document.querySelector('.prc-sec [data-prc]'), own: APP.PR.cases({ subj: APP.PR.subj('live', pid) }).length }; });
    T(13, r.smp && !r.inPage && r.own === 0, r);
    // 14 — Kaveh: one confirming test is not a proof
    await fresh();
    r = await E(() => { const pid = __live('۲۰ پله'); __guess(pid, 'فیبوناچی'); const c = APP.PR.startFrom(21, APP.PR.subj('live', pid), 'live', false); return APP.PR.guessTest(c, 'confirm', 'n=4'); });
    T(14, /تأیید در ۱ آزمون/.test(r.label) && !/اثبات شد/.test(r.label), r);
    // 15 — Mahsa: renamed knot — the case keeps its link by id and shows the new name
    await fresh();
    r = await E(() => { const k = __knot('حواس‌پرتی'); const c = APP.PR.start(21, APP.PR.subj('knot', k), { src: 'knot' }); const kn = APP.S.get(k); kn.name = 'پرش ذهن هنگام خواندن'; APP.S.put(kn); return { id: c.subj.id === k, label: APP.PR.subjLabel(APP.S.get(c.id).subj), page: __go('practice', c.id) }; });
    T(15, r.id && /پرش ذهن هنگام خواندن/.test(r.label) && /پرش ذهن هنگام خواندن/.test(r.page), { id: r.id, label: r.label });
    T(16, h106 === 1, h106);
  });

  // ================= LT7.list =================
  await section('lt7', async () => {
    const { T } = bankT('lt7', 'LT7.list'); let r;
    const dueOf = (name, day) => E(([name, day]) => { const c = APP.PR.list(name); return APP.PR.due(day).filter(e => e.id.indexOf(c.id) === 0).map(e => ({ id: e.id.replace(c.id, ''), due: e.due })); }, [name, day]);
    // 0 — Bahram T15: major event ⇒ immediate review of load-bearing assumptions; monthly review day 30
    await fresh();
    await E(() => APP.PR.listAdd('assumptions', { text: 'مشتری‌ها به قیمت حساس نیستند', load: true }));
    const a7 = await dueOf('assumptions', ymd(7));
    await day(12); await E(() => APP.PR.listEvent('assumptions', 'رقیب قیمت را ۲۰٪ کم کرد'));
    const a12 = await dueOf('assumptions', ymd(12)), a30 = await dueOf('assumptions', ymd(30));
    const kind = await E(() => APP.PR.list('assumptions').kind);
    T(0, kind === 'list' && a7.length === 0 && a12.some(e => e.id === ':ev' && e.due === ymd(12)) && a30.some(e => e.id === '' && e.due === ymd(30)), { a7, a12, a30 });
    const r121 = a7;
    // 1 — Ladan T16 shelf: counter 1→2→3 with dates; weekly review day 7; «نامزد» → «پذیرفته» day 12
    await fresh();
    const cnt = [];
    await E(() => APP.PR.modelUse('هزینهٔ فرصت', { where: 'خرید خودرو' })); cnt.push(await E(() => APP.PR.listItem('models', 'هزینهٔ فرصت').count));
    await day(5); await E(() => APP.PR.modelUse('هزینهٔ فرصت', { where: 'انتخابِ دوره' })); cnt.push(await E(() => APP.PR.listItem('models', 'هزینهٔ فرصت').count));
    const m7 = await dueOf('models', ymd(7)); await day(7); await E(() => APP.PR.listReview('models', 'مرورِ هفتگی'));
    await day(12); r = await E(() => APP.PR.modelUse('هزینهٔ فرصت', { where: 'قبولِ پروژه' })); cnt.push(r.count);
    T(1, cnt.join() === '1,2,3' && m7.some(e => e.due === ymd(7)) && r.status === 'پذیرفته' && r.admitted === ymd(12) && r.uses.map(u => u.d).join() === [ymd(0), ymd(5), ymd(12)].join(), { cnt, m7, r: [r.status, r.admitted] });
    // 2 — Reza: mistakes folder item with its T31 strategy case linked; monthly reread day 30
    await fresh();
    await E(() => APP.PR.listAdd('mistakes', { text: 'تعمیم از یک نمونه', from: 34 }));
    await day(4); await E(() => __ex(31, { task: 'تعمیم', errors: [{ err: 'تعمیم از یک نمونه', type: 'مفهوم غلط', cause: 'یک مثال دیدم' }], strat: ['سه مثال پیش از قاعده'] }, { f: { freeT: 'تعمیم' } }));
    r = await E(() => ({ it: APP.PR.listItem('mistakes', 'تعمیم از یک نمونه'), c: APP.PR.cases({ tid: 31 })[0].id, n: APP.PR.list('mistakes').items.length }));
    const m30 = await dueOf('mistakes', ymd(30));
    T(2, r.n === 1 && r.it.prc === r.c && r.it.froms.join() === '34,31' && m30.some(e => e.due === ymd(30)), { it: r.it, m30 });
    // 3 — Samira T35: weekly reviews day 7 & 14; day-9 data logs 50→70 with date and reason (history kept)
    await fresh();
    await E(() => APP.PR.listAdd('ambiguities', { text: 'آیا تغییر رشته به آمار درست است؟', p: 50 }));
    const b6 = await dueOf('ambiguities', ymd(6)), b7 = await dueOf('ambiguities', ymd(7));
    await day(7); await E(() => APP.PR.listReview('ambiguities', 'مرور'));
    await day(9); await E(() => APP.PR.ambUpdate('آیا تغییر رشته به آمار درست است؟', 70, 'پذیرش از دانشگاه ب'));
    const b13 = await dueOf('ambiguities', ymd(13)), b14 = await dueOf('ambiguities', ymd(14));
    r = await E(() => APP.PR.listItem('ambiguities', 'آیا تغییر رشته به آمار درست است؟'));
    T(3, b6.length === 0 && b7.some(e => e.due === ymd(7)) && b13.length === 0 && b14.some(e => e.due === ymd(14)) && r.p === 70 && r.hist.length === 2 && r.hist[0].p === 50 && r.hist[1].p === 70 && r.hist[1].d === ymd(9) && /دانشگاه ب/.test(r.hist[1].why), { b6, b7, b13, b14, h: r.hist });
    const r120 = { b6, b7 }, r122 = r.hist;
    // 4 — Bahram T3: monthly review day 30 records the new shares; trend 60 → 45
    await fresh();
    await E(() => APP.PR.paretoShare('۳ مشتریِ بزرگ', 60));
    const c29 = await dueOf('pareto', ymd(29)), c30 = await dueOf('pareto', ymd(30));
    await day(30); r = await E(() => APP.PR.paretoShare('۳ مشتریِ بزرگ', 45));
    T(4, c29.length === 0 && c30.some(e => e.due === ymd(30)) && r.shares.map(s => s.v).join() === '60,45' && r.shares[1].d === ymd(30), { c30, s: r.shares });
    // 5 — Ali T10: the recheck date he wrote («۲۱ روز بعد») is a real due on day 21; the out-of-sample result gives a verdict
    await fresh();
    await E(() => __ex(10, { claim: 'فروشِ این هفته به‌خاطرِ تبلیغ بالا رفت', action: 'اگر سیگنال باشد بودجه را بالا می‌برم؛ دوباره بررسی: ۲۱ روز بعد' }, { f: { freeT: 'فروش' } }));
    const d20 = await dueOf('claims', ymd(20)), d21 = await dueOf('claims', ymd(21));
    await day(21); r = await E(() => { const x = APP.PR.claimResult('فروشِ این هفته به‌خاطرِ تبلیغ بالا رفت', 'فروش به حالتِ قبل برگشت', 'نویز'); return { x, after: APP.PR.due('2026-12-31').length }; });
    T(5, d20.length === 0 && d21.length === 1 && d21[0].due === '2026-11-07' && r.x.verdict === 'نویز' && r.x.result && r.after === 0, { d21, x: r.x, after: r.after });
    // 6 — Pouya T34: belief revision history with dates; weekly cue day 7 and 14; linked to the mistakes folder
    await fresh();
    await E(() => APP.PR.listAdd('beliefs', { text: 'بدونِ ارشد پیشرفت نمی‌کنم', conf: 80 }));
    const e7 = await dueOf('beliefs', ymd(7)); await day(7); await E(() => APP.PR.listReview('beliefs', 'باورِ هفتگی'));
    const e14 = await dueOf('beliefs', ymd(14)); await day(14);
    r = await E(() => { const x = APP.PR.beliefRevise('بدونِ ارشد پیشرفت نمی‌کنم', 40, 'تا حدی نادرست', true); return { x, m: APP.PR.listItem('mistakes', 'بدونِ ارشد پیشرفت نمی‌کنم') }; });
    T(6, e7.some(e => e.due === ymd(7)) && e14.some(e => e.due === ymd(14)) && r.x.hist.length === 2 && r.x.hist[1].d === ymd(14) && r.x.hist[1].verdict === 'تا حدی نادرست' && r.m && r.x.mistakeId === r.m.id, { e7, e14, h: r.x.hist, m: !!r.m });
    // 7 — Ladan: a use from the live problem page increments the shelf counter and links the problem
    await fresh();
    await E(() => APP.PR.modelUse('هزینهٔ فرصت', { where: 'خرید' }));
    const pid7 = await E(() => __live('انتخابِ دوره'));
    await day(5); await E((pid) => APP.go('lprob', pid), pid7);
    await p.fill('.prc-sec input[aria-label="مدلِ ذهنی که در این مسئله به کار بردی"]', 'هزینهٔ فرصت'); await p.click('.prc-sec button:has-text("کاربستِ مدل")');
    r = await E(() => APP.PR.listItem('models', 'هزینهٔ فرصت'));
    T(7, r.count === 2 && r.uses[1].link && r.uses[1].link.id === pid7, { count: r.count, use: r.uses[1] });
    // 8 — Samira: closing an ambiguity moves it out of the open list with its dated resolution; weekly review continues
    await fresh();
    await E(() => { APP.PR.listAdd('ambiguities', { text: 'تغییر رشته؟', p: 50 }); APP.PR.listAdd('ambiguities', { text: 'کدام شهر؟', p: 40 }); });
    await day(20); r = await E(() => { const x = APP.PR.itemClose('ambiguities', 'تغییر رشته؟', 'تصمیم گرفتم: آمار'); const c = APP.PR.list('ambiguities'); return { x, open: c.items.filter(i => !i.closed).length, due: APP.PR.listEval(c).length }; });
    T(8, r.x.closed.d === ymd(20) && r.open === 1 && r.due === 1, r);
    // 9 — Ali: a claim decided on day 15 gets no reminder on day 21
    await fresh();
    await E(() => APP.PR.listAdd('claims', { claim: 'تبلیغ فروش را بالا برد', text: 'تبلیغ فروش را بالا برد', recheck: APP.addDays(APP.today(), 21) }));
    await day(15); await E(() => APP.PR.claimResult('تبلیغ فروش را بالا برد', 'دادهٔ تازه', 'سیگنال'));
    r = await dueOf('claims', ymd(21));
    T(9, r.length === 0, r);
    // 10 — Ladan: 2 real uses < 3 ⇒ not admitted
    await fresh();
    await E(() => APP.PR.modelUse('اثرِ شبکه', { where: 'تصمیمِ الف' })); await day(2); r = await E(() => APP.PR.modelUse('اثرِ شبکه', { where: 'تصمیمِ ب' }));
    T(10, r.status === 'نامزد' && r.realDays === 2, r);
    // 11 — Ladan: two uses the same day in one decision = +1
    await fresh();
    await day(5); r = await E(() => { APP.PR.modelUse('هزینهٔ فرصت', { where: 'یک تصمیم' }); return APP.PR.modelUse('هزینهٔ فرصت', { where: 'یک تصمیم' }); });
    T(11, r.count === 1 && r.uses.length === 1, r);
    // 12 — Reza: the same mistake from T31 and again from T34 is ONE item
    await fresh();
    await E(() => { __ex(31, { task: 'الف', errors: [{ err: 'تعمیم از یک نمونه' }], strat: ['x'] }, { f: { freeT: 'الف' } }); __ex(34, { belief: 'یک مثال کافی است', log: 'تعمیم از یک نمونه' }); });
    r = await E(() => APP.PR.list('mistakes').items.filter(x => x.text === 'تعمیم از یک نمونه').map(x => x.froms));
    T(12, r.length === 1 && r[0].includes(31) && r[0].includes(34), r);
    // 13 — Samira: T35 review is weekly — no lines days 1–6
    T(13, r120.b6.length === 0 && r120.b7.length === 1, r120);
    // 14 — Bahram: assumptions — no 1/3/7 lines, only monthly or event
    await fresh();
    await E(() => APP.PR.listAdd('assumptions', { text: 'فرضِ باربر', load: true }));
    r = [await dueOf('assumptions', ymd(1)), await dueOf('assumptions', ymd(3)), await dueOf('assumptions', ymd(7))];
    T(14, r.every(x => x.length === 0) && r121.length === 0, r);
    // 15 — Samira: 50% is not overwritten without trace
    T(15, r122.length === 2 && r122[0].p === 50, r122);
    // 16 — a tour's assumptions never appear in the owner's register
    await fresh();
    r = await E(() => { APP.PR.listAdd('assumptions', { text: 'فرضِ آزمایشیِ ۱' }, { sample: true }); APP.PR.listAdd('assumptions', { text: 'فرضِ آزمایشیِ ۲' }, { sample: true }); return { own: APP.PR.list('assumptions').items.length, tour: APP.PR.list('assumptions', { sample: true }).items.length, due: __due('2099-01-01').length }; });
    T(16, r.own === 0 && r.tour === 2 && r.due === 0, r);
    // 17 — Ali: a claim without a date gets no invented due — the log asks T10's own question
    await fresh();
    r = await E(() => { const x = APP.PR.listAdd('claims', { claim: 'این الگو واقعی است', text: 'این الگو واقعی است' }); const c = APP.PR.list('claims'); return { x, due: APP.PR.listEval(c).length, page: __go('practice', c.id) }; });
    T(17, r.x.needDate && r.due === 0 && /چه زمانی دوباره بررسی‌اش می‌کنم/.test(r.page), { x: r.x, due: r.due });
  });

  const sum = (k) => info[k] && info[k].res ? { n: info[k].res.length, fail: info[k].res.filter(x => !x[1]).map(x => x[0]) } : null;
  console.log(JSON.stringify({ native: info.native, lt2: sum('lt2'), lt3: sum('lt3'), lt5: sum('lt5'), lt6: sum('lt6'), lt7: sum('lt7') }));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  if (errors.length) process.exitCode = 1;
  await b.close();
})();
