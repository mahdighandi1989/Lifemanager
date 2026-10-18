// تورِ پولیا (دستهٔ ۱، دورِ ۲۱ — سهمِ «practice» — ۲۰۲۶-۱۰-۱۸) — DECISIONS_R21: R2 (شروعِ پرونده از گفت‌وگو) و R5 (قاعده‌های زمانِ تمرین) + افزودهٔ گروهِ A (R5+ A21-9/10/11/16/17/18، «آزاد»).
//  هر موردِ R2.practice_from_chat (#38–#54) و R5.practice_time (#110–#130) ِ بانکِ مستقلِ tests/variants/VARIANTS_R21.json، با ساعتِ Playwright و بازبارگذاری،
//  و دنباله‌های اجراکننده‌ها: s29 (T41: 80,80,✗30,80,✗40,85 ⇒ «تثبیت شد» نباید)، s23 (T28: ✗ سپس یک ✓ ِ دیر)، s31 (T24: «ادامه با کاربرگ» ⇒ همان ردیف = همان 🎯)،
//  s14/s19 (درخواستِ صریح در گفت‌وگو)، s05/s07 (تاریخِ «۱۵ آبان»، داوریِ 🎯 از گفت‌وگو با اطمینانِ خودش).
//  #111: بانک «۳ موفقیت با فاصله‌های ۲→۷→۱۴ روز» را فرض کرده بود؛ این فرضِ نویسندهٔ بانک است. قاعدهٔ خودِ T41 «چرخه روز ۱، ۳ و ۷» است، شمرده
//  از آخرین شکست (۲۲ اکتبر): ۲۳ (روزِ ۱)، ۲۵ (روزِ ۳)، ۱ نوامبر (درونِ پنجرهٔ روزِ ۷) ⇒ «تثبیت شد» در ۱ نوامبر، نه زودتر؛ ۱۵ نوامبر وارسیِ ماندگاری است.
// LLA_FILE = ساختِ دیگر (قرمزِ اول)؛ ONLY=r2a,r5a …
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = require('./variants/VARIANTS_R21.json');

const T0 = Date.parse('2026-10-18T10:00:00+03:30');   // یکشنبه ۲۶ مهر — D0 ِ بانک
const ymd = (n) => new Date(Date.UTC(2026, 9, 18 + n)).toISOString().slice(0, 10);

const HELPERS = () => {
  const S = APP.S, PR = APP.PR;
  APP.S.loaded = true; window.__noNav = true;
  window.__q = []; window.__sys = [];
  APP.callAI = async (sys, user, opts) => { __sys.push(String(sys || '') + '\n' + String(user || '')); let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  window.__say = async (text, reply, actions) => { __sys.length = 0; __q.push({ reply: reply || 'باشه.', status: 'related', memory: 'm', actions: actions || [] }); await APP.ASSIST.send(text); __q.length = 0; return __sys.join('\n'); };
  window.__cur = () => APP.S.get(localStorage.getItem('lla.assist.cur'));
  window.__freshChat = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); return APP.ASSIST.newSession().id; };
  window.__wipe = () => { ['practice', 'ex', 'fcast', 'kexp', 'case', 'card', 'sched', 'pr', 'topic', 'knot', 'kcase', 'eprob', 'eprog', 'achat', 'deadline', 'lprob'].forEach(t => { try { S.all(t).forEach(r => S.del(r.id)); } catch (e) { } }); localStorage.removeItem('lla.assist.cur'); APP.go('home'); };
  window.__topic = (t) => (S.all('topic', x => x.title === t)[0]) || S.put({ id: APP.uid('tp'), type: 'topic', title: t });
  window.__ex = (tid, data, o) => { o = o || {}; const ex = APP.newEx(tid, o.topic || ''); Object.assign(ex, o.f || {}); ex.data = Object.assign(ex.data || {}, data || {}); ex.rubric = o.rubric || ex.rubric || []; if (o.draft) { S.put(ex); return ex.id; } ex.status = 'done'; S.put(ex); APP.onExDone(ex); return ex.id; };
  window.__case = (id) => { const c = S.get(id); if (!c) return null; const R = PR.eval(c); return { id: c.id, tid: c.tid, subj: c.subj, state: c.state, due: c.due, until: c.until, reason: c.reason, dueText: PR.dueText(c), run: R.run,
    sessions: (c.sessions || []).map(s => ({ d: s.d, ok: s.ok, role: (c.roles || {})[s.d], late: (c.late || {})[s.d], meas: s.meas })), stable: c.stable, off: c.stableOff || [], crit: R.crit, calib: R.calib, urhythm: c.urhythm || null, udue: c.udue || '' }; };
  window.__one = (tid) => PR.cases({ tid })[0] ? __case(PR.cases({ tid })[0].id) : null;
  window.__today = () => APP.dueList().map(d => (d.txt || '') + ' ‖ ' + (d.sub || ''));
  window.__live = (title) => { const now = new Date().toISOString(); const r = APP.liveCreate(title, title + ' — صورتِ کاملِ مسئله برای آزمون.', 'find', { by: 'user' }); const id = r.p ? r.p.id : r.id;
    const pg = S.get('eprog_' + id); pg.solve = pg.solve || {}; const so = pg.solve; so.u = { 1: { done: true, at: now, one: 'می‌خواهم ببینم', u: 'نتیجه', dl: [], c: '', type: 'find', nat: 'practical' } };
    so.live = so.live || {}; const L = so.live; ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); L.plan = { t: 'گام‌به‌گام', at: now }; S.put(pg); return id; };
  window.__sess = (id, ds) => { ds.forEach(([d, pct, ok]) => { const o = { d, what: 'برگهٔ سفید', meas: pct == null ? {} : { pct } }; if (ok != null) o.ok = ok; PR.session(id, o); }); return __case(id); };
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
  const T = (gi, ok, x) => { res[gi] = !!ok; chk(ok, 'R21#' + gi + ' «' + BANK[gi].text.slice(0, 90) + '» → ' + BANK[gi].expect.slice(0, 120) + ' :: ' + JSON.stringify(x).slice(0, 900)); };
  const X = (name, ok, x) => { info[name] = !!ok; chk(ok, name + ' :: ' + JSON.stringify(x).slice(0, 900)); };
  await load();
  chk(BANK[38].rc === 'R2.practice_from_chat' && BANK[110].rc === 'R5.practice_time' && BANK[130].rc === 'R5.practice_time', 'bank layout changed');

  /* ===================== R2 — شروعِ پرونده از گفت‌وگو ===================== */
  // #38 #46 — مسئلهٔ گفت‌وگو در کانون، بی پرونده: start_practice در پرامپت؛ خواستهٔ خودش ⇒ پرونده باز می‌شود (با و بی نیم‌فاصله)
  // #41 — فهرستِ کاملِ تکنیک‌ها (۱ تا ۴۵؛ ۴۱ دیده می‌شود)
  await section('r2a', async () => {
    await fresh();
    const r = await E(async () => {
      const id = __freshChat(); const s = APP.S.get(id); s.coach = { stmt: 'سه جعبه با برچسبِ غلط؛ با برداشتنِ یک میوه همه را درست کن', ph: 'p' }; APP.S.put(s);
      const sys = await __say('یه پرونده‌ی تمرین براش باز کن', 'باز می‌کنم.', [{ do: 'start_practice', tid: 41, consent: { quote: 'یه پرونده‌ی تمرین براش باز کن', kind: 'request' } }]);
      const c1 = APP.PR.cases().map(c => ({ tid: c.tid, k: c.subj.k, t: c.subj.t, sess: c.sess }));
      const all45 = APP.T.every(t => sys.indexOf(t.id + ' ' + t.fa) >= 0);
      const id2 = __freshChat(); const s2 = APP.S.get(id2); s2.coach = { stmt: 'دو شیر آب، مخزن در ۳ و ۶ ساعت', ph: 'u' }; APP.S.put(s2);
      const sys2 = await __say('یه پرونده تمرین براش باز کن', 'باشه.', [{ do: 'start_practice', tid: 28, consent: { quote: 'یه پرونده تمرین براش باز کن', kind: 'request' } }]);
      return { blk: /start_practice/.test(sys) && /پروندهٔ تازه/.test(sys), all45, has41: /41 تمرین بازیابی فعال/.test(sys), c1, blk2: /start_practice/.test(sys2), n2: APP.PR.cases({ tid: 28 }).length, chatSub: /مسئلهٔ گفت‌وگو/.test(sys) };
    });
    T(38, r.blk && r.chatSub && r.c1.length === 1 && r.c1[0].tid === 41 && r.c1[0].k !== 'free', r);
    T(46, r.blk2 && r.n2 === 1, r);
    T(41, r.all45 && r.has41, { all45: r.all45, has41: r.has41 });
  });

  // #39 — «برای سنجیدنِ پیش‌بینی‌هام یه پرونده‌ی تمرین باز کن» (بی مسئله): T24 از نامِ خودِ تکنیک در حرفش ⇒ start_practice؛ پرونده؛ سطرِ «امروز»
  // A21-18 — بلوکِ «عادت و برنامه» روی خواستِ تمرین نمی‌آید (ولی روی خواستِ عادت می‌آید)
  await section('r2b', async () => {
    await fresh();
    const r = await E(async () => { __freshChat();
      const sys = await __say('برای سنجیدن پیش‌بینی‌هام یه پرونده‌ی تمرین باز کن', 'باز شد.', [{ do: 'start_practice', tid: 24, topic: 'پیش‌بینی‌های روزانه', consent: { quote: 'برای سنجیدن پیش‌بینی‌هام یه پرونده‌ی تمرین باز کن', kind: 'request' } }]);
      const sysH = await __say('می‌خوام تکنیک کالیبراسیون اعتماد رو برای ورزش کردنم تمرین کنم', 'باشه.', []);
      __freshChat(); const sysH2 = await __say('می‌خوام هر روز صبح ورزش کنم ولی همیشه ول می‌کنم', 'باشه.', []);
      return { blk: /start_practice/.test(sys) && /تکنیکِ 24/.test(sys), c: __one(24), t: __today().filter(t => /کالیبراسیون اعتماد/.test(t)), habit: /# عادت و برنامه/.test(sysH), habit2: /# عادت و برنامه/.test(sysH2) }; });
    T(39, r.blk && r.c && r.t.length === 1, { blk: r.blk, c: r.c && r.c.subj, t: r.t });
    X('A21-18 habit block not on a practice request', !r.habit && r.habit2, { habit: r.habit, habit2: r.habit2 });
  });

  // #40 — «می‌خوام تکنیک «اول حالت خاص» رو تمرین کنم»: حرکتِ «حالتِ خاص» از ثبت‌گاه ⇒ موضوع ⇒ start_practice با فهرستِ کامل
  // #48 — «سلام» بی موضوع ⇒ start_practice نیست
  await section('r2c', async () => {
    await fresh();
    const r = await E(async () => { __freshChat(); const a = await __say('سلام', 'سلام!', []);
      __freshChat(); const b2 = await __say('می‌خوام تکنیک «اول حالت خاص» رو تمرین کنم', 'کدام تکنیک؟', []);
      return { hello: /start_practice/.test(a), spec: /start_practice/.test(b2) && /حالتِ خاص/.test(b2) && /45 پرسشگری توضیحی/.test(b2) }; });
    T(48, !r.hello, r); T(40, r.spec, r);
  });

  // #42 #43 #47 #49 — بازنگری: پیشنهاد یک بار؛ «آره بازش کن» ⇒ یک پرونده روی همان مسئله؛ «نه» ⇒ دیگر پیشنهاد نیست؛ start_practice ِ بی‌رضایت رد و گفته می‌شود
  await section('r2d', async () => {
    await fresh();
    const r = await E(async () => {
      const pid = __live('مساحتِ بیشینه'); const pg = APP.S.get('eprog_' + pid); pg.solve.live.state = 'solved'; APP.S.put(pg);
      const id = __freshChat(); const s = APP.S.get(id); s.lprob = pid; APP.S.put(s);
      const a = await __say('حالا که حل شد درسم اینه که اول شکل بکشم', 'می‌خواهی تمرینش کنیم؟', [{ do: 'start_practice', tid: 26, pid }]);   // #49: بی رضایت
      const n0 = APP.PR.cases().length, notes = JSON.stringify(APP.S.get(id).msgs.slice(-3));
      const b2 = await __say('آره بازش کن', 'باز شد.', [{ do: 'start_practice', tid: 26, pid, consent: { quote: 'آره بازش کن', kind: 'yes' } }]);
      const L = APP.PR.cases().map(c => ({ tid: c.tid, k: c.subj.k, id: c.subj.id }));
      const id2 = __freshChat(); const s2 = APP.S.get(id2); s2.lprob = pid; APP.S.put(s2);
      const c1 = await __say('درسم اینه که حالت‌های کوچک رو امتحان کنم', 'می‌خواهی تمرینش کنیم؟', []);
      const c2 = await __say('ممنون، فعلاً نه', 'باشه.', []);
      return { offerA: /بازنگری: اگر درسی گفت/.test(a), n0, notes, offerB: /بازنگری: اگر درسی گفت/.test(b2), L, offer1: /بازنگری: اگر درسی گفت/.test(c1), offer2: /بازنگری: اگر درسی گفت/.test(c2), n2: APP.PR.cases().length, desc2: /start_practice/.test(c2), next49: /پرونده ساخته نشد/.test(b2) };
    });
    T(42, r.offerA, r);
    T(49, r.n0 === 0 && /پرونده ساخته نشد/.test(r.notes) && r.next49, { n0: r.n0, next49: r.next49, notes: r.notes.slice(0, 300) });
    T(43, r.L.length === 1 && r.L[0].k === 'live', r.L);
    T(47, r.offer1 && !r.offer2 && r.n2 === 1 && r.desc2, r);
  });

  // #44 #52 — «🧪» بی پرونده: دکمهٔ «شروعِ تمرین»؛ بی تکنیک ⇒ می‌پرسد و پرونده نمی‌سازد؛ با تکنیک ⇒ پرونده
  await section('r2e', async () => {
    await fresh();
    const r = await E(() => { __go('practice'); const btn = document.querySelector('.prc-start0'); if (!btn) return { btn: false };
      btn.click(); const n0 = APP.PR.cases().length, toast = (document.querySelector('.toast') || {}).textContent || '';
      __go('practice'); const sel = document.querySelector('.prc-tsel0'); sel.value = '41'; document.querySelector('.prc-tp0').value = 'قضیهٔ فیثاغورس'; document.querySelector('.prc-start0').click();
      return { btn: true, n0, toast, c: APP.PR.cases().map(c => ({ tid: c.tid, t: APP.PR.subjTitle(c.subj) })), view: APP.state.view }; });
    T(52, r.btn && r.n0 === 0 && /کدام تکنیک/.test(r.toast), r);
    T(44, r.btn && r.c.length === 1 && r.c[0].tid === 41 && /فیثاغورس/.test(r.c[0].t), r);
  });

  // #45 — رسمی، با مسئلهٔ زنده: start_practice؛ #50 «پروندهٔ کارخونه» — پرامپت تمایز را می‌گوید و صفحه چیزی نمی‌سازد؛ #51 تکراری ⇒ همان پرونده
  // #53 «تمرین‌هام کجان؟» ⇒ پروندهٔ تازه نه؛ #54 «دیروز تمرینمو کردم، ۷۰ درصد» ⇒ practice_log روی پروندهٔ موجود
  // افزودهٔ A: پیشنهادِ دستیار بی موضوعِ صریح ⇒ همان مسئلهٔ سشن، نه «آزاد»
  await section('r2f', async () => {
    await fresh();
    const r = await E(async () => {
      const pid = __live('برنامهٔ مطالعهٔ فیزیک'); const id = __freshChat(); const s = APP.S.get(id); s.lprob = pid; APP.S.put(s);
      const a = await __say('لطفاً برای این روش یک برنامهٔ تمرین بسازید', 'چشم.', [{ do: 'start_practice', tid: 41, consent: { quote: 'لطفاً برای این روش یک برنامهٔ تمرین بسازید', kind: 'request' } }]);
      const c0 = APP.PR.cases().map(c => ({ k: c.subj.k, id: c.subj.id, sess: c.sess }));
      const f = await __say('پرونده‌ی کارخونه رو باز کن', 'باز کردم.', []);
      const n1 = APP.PR.cases().length;
      await __say('یه پرونده‌ی تمرین براش باز کن', 'همان پرونده.', [{ do: 'start_practice', tid: 41, pid, consent: { quote: 'یه پرونده‌ی تمرین براش باز کن', kind: 'request' } }]);
      const n2 = APP.PR.cases().length, note = APP.ASSIST._prcNote || '';
      await __say('تمرین‌هام کجان؟', 'در «🧪».', []); const n3 = APP.PR.cases().length;
      return { blk: /start_practice/.test(a), c0, pid, sid: id, fac: /«پرونده» ِ کارخانه\/معرفتی پروندهٔ تمرین نیست/.test(f), n1, n2, note, n3 };
    });
    T(45, r.blk && r.c0.length === 1 && r.c0[0].k === 'live' && r.c0[0].id === r.pid, r);
    X('A21 assistant-suggested case linked to her problem/session (never «آزاد»)', r.c0[0] && r.c0[0].k === 'live' && r.c0[0].sess === r.sid, r.c0);
    T(50, r.fac && r.n1 === 1, r); T(51, r.n2 === 1 && /ادامه یافت/.test(r.note), r); T(53, r.n3 === 1, r);
    await day(1); await reload();
    const r2 = await E(async (x) => { const id = __freshChat(); const s = APP.S.get(id); s.lprob = x.pid; APP.S.put(s); const c = APP.PR.cases()[0];
      await __say('دیروز تمرینمو کردم، ۷۰ درصد', 'دیدم.', [{ do: 'practice_log', prc: c.id, what: 'برگهٔ سفید', quote: 'دیروز تمرینمو کردم، ۷۰ درصد' }]);
      return { n: APP.PR.cases().length, c: __case(c.id) }; }, r);
    T(54, r2.n === 1 && r2.c.sessions.some(s => s.d === ymd(0) && s.meas.pct === 70), r2);
  });

  /* ===================== R5 — قاعده‌های زمان ===================== */
  // #110 #111 — پسرفت دنباله را از نو می‌چیند؛ «تثبیت شد» فقط با دنبالهٔ خودِ T41 پس از ۲۲ اکتبر (۲۳، ۲۵، ۱ نوامبر)
  await section('r5a', async () => {
    await fresh();
    const id = await E(() => { const tp = __topic('قضیهٔ کسینوس').id; __ex(41, { topic: 'قضیهٔ کسینوس', actual: '80' }, { topic: tp }); return APP.PR.cases({ tid: 41 })[0].id; });
    const a = await E((id) => __sess(id, [['2026-10-20', 80], ['2026-10-22', 30], ['2026-10-23', 80]]), id);
    T(110, a.state !== 'stable' && a.run === 1 && a.sessions.filter(s => s.d === '2026-10-22')[0].role === 'fail', { st: a.state, run: a.run, s: a.sessions });
    const b1 = await E((id) => __sess(id, [['2026-10-25', 85]]), id);
    const b2 = await E((id) => __sess(id, [['2026-11-01', 85]]), id);
    const b3 = await E((id) => __sess(id, [['2026-11-15', 90]]), id);
    T(111, b1.state !== 'stable' && b2.state === 'stable' && b2.stable.d === '2026-11-01' && b3.state === 'stable' && b3.sessions.filter(s => s.d === '2026-11-15')[0].role === 'checkin',
      { b1: [b1.state, b1.run], b2: [b2.state, b2.stable && b2.stable.d], b3: b3.sessions.slice(-1) });
  });

  // #112 — ✗ پیش از موعد شکست است، نه «زودتر از موعد»؛ #123 — سه ✓ در یک روز ⇒ یک نشست، بی تثبیت؛ #125 — ✓ ِ به‌موقع ⇒ بی برچسبِ دیرکرد
  await section('r5b', async () => {
    await fresh();
    const id = await E(() => { const tp = __topic('مثلثات').id; __ex(41, { topic: 'مثلثات', actual: '80' }, { topic: tp }); return APP.PR.cases({ tid: 41 })[0].id; });
    await day(1); await reload();
    const pre = await E(() => __today().filter(t => /مثلثات/.test(t)));
    const a = await E((id) => __sess(id, [['2026-10-19', 80]]), id);
    const b2 = await E((id) => { const r = __sess(id, [['2026-10-20', 40]]); __go('practice', id); return { c: r, page: __main() }; }, id);
    const s20 = b2.c.sessions.filter(s => s.d === '2026-10-20')[0];
    T(112, s20.role === 'fail' && s20.ok === false && b2.c.state !== 'stable' && !/زودتر از موعد/.test(b2.page.split('جلسه‌ها')[1] || ''), { s20, st: b2.c.state });
    T(125, pre.length === 1 && !/عقب‌افتاده|زودتر از موعد/.test(pre[0]) && a.sessions[1].role === 'step', { pre, role: a.sessions[1].role });
    await fresh();
    const same = await E(() => { const tp = __topic('هندسه').id; __ex(41, { topic: 'هندسه', actual: '80' }, { topic: tp }); const c = APP.PR.cases({ tid: 41 })[0]; APP.PR.session(c.id, { what: 'دوباره', meas: { pct: 85 } }); APP.PR.session(c.id, { what: 'سه‌باره', meas: { pct: 90 } }); return __case(c.id); });
    T(123, same.sessions.length === 1 && same.state !== 'stable', same);
  });

  // دنبالهٔ اجراکنندهٔ C (s29): T41 روی مسئلهٔ زنده — 80، 80، ✗30 (دیر)، 80 (دیر و درست)، ✗40، 85 ⇒ «تثبیت شد» نه (یک موفقیت پس از پسرفت)
  // دنبالهٔ s23: T28 — ✗ در ۲۹ اکتبر، سپس یک ✓ ِ دیر در ۹ نوامبر ⇒ «تثبیت شد» نه
  await section('runner_s29_s23', async () => {
    await fresh();
    const r = await E(() => { const pid = __live('مرکزِ حوض'); const c = APP.PR.startFrom(41, APP.PR.subj('live', pid), 'live', false);
      return __sess(c.id, [['2026-10-18', 80], ['2026-10-19', 80], ['2026-10-23', 30], ['2026-10-26', 80], ['2026-11-02', 40], ['2026-11-09', 85]]); });
    X('C21-11 s29 no «تثبیت شد» on one success after a regression', r.state !== 'stable' && !r.stable && r.run === 1 && /^\d{4}-\d\d-\d\d$/.test(r.due), { st: r.state, run: r.run, due: r.due, s: r.sessions.map(s => s.d + ':' + s.role) });
    const t = await E(() => { const pid = __live('کیکِ قالبِ مستطیل'); const c = APP.PR.startFrom(28, APP.PR.subj('live', pid), 'live', false);
      ['2026-10-19', '2026-10-20'].forEach((d, i) => APP.PR.session(c.id, { d, what: 'بازنویسی', ok: true }));
      APP.PR.session(c.id, { d: '2026-10-29', what: 'یادم نبود', ok: false }); APP.PR.session(c.id, { d: '2026-11-09', what: 'کامل یادم بود', ok: true }); return __case(c.id); });
    X('C21-11 s23 T28 no «تثبیت شد» after ✗ + one late ✓', t.state !== 'stable' && t.run === 1, { st: t.state, run: t.run, s: t.sessions.map(s => s.d + ':' + s.role) });
  });

  // #113 — T24: ردیفِ کاربرگ (موعدِ «سه‌شنبه» — یک خوانندهٔ تاریخ) همان 🎯؛ داوری روی صفحه سه‌شنبه (از «ادامه با کاربرگ» ⇒ همان کاربرگ، s31)
  // A21-9 — «۱۵ آبان» در موعدِ ردیف ⇒ 🎯 با ۶ نوامبر
  await section('r5c', async () => {
    await fresh();
    const pid = await E(() => __live('تصمیمِ باشگاه'));
    const exId = await E((pid) => { const c = APP.PR.startFrom(24, APP.PR.subj('live', pid), 'live', false); const ex = APP.PR.openWS(c); APP.go('home');
      ex.data.preds = [{ st: 'پیش‌بینی: باشگاه سه‌شنبه می‌رم', conf: '70', why: 'تجربه', due: 'سه‌شنبه' }, { st: 'تا پانزدهم آبان وزنم یک کیلو کم می‌شه', conf: '60', why: 'حس', due: '۱۵ آبان' }];
      APP.S.put(ex); ex.data.selfguess = 60; ex.data.pattern = 'x'; ex.data.rule = 'y'; ex.status = 'done'; APP.S.put(ex); APP.onExDone(ex); return ex.id; }, pid);
    const d0 = await E(() => APP.S.all('fcast').map(f => ({ q: f.q, due: f.due })));
    X('A21-9 Persian dates in T24 due fields («سه‌شنبه», «۱۵ آبان»)', d0.length === 2 && d0.some(f => f.due === '2026-10-20') && d0.some(f => f.due === '2026-11-06'), d0);
    await day(2); await reload();
    const pre = await E(() => __today().filter(t => /🎯/.test(t)));
    const r = await E(async (x) => { const c = APP.PR.cases({ tid: 24 })[0]; __go('practice', c.id); const b0 = [...document.querySelectorAll('#main button')].find(b => /ادامه با کاربرگ/.test(b.textContent)); b0.click();
      const same = (APP.state.sub || '').indexOf(x) >= 0; return { same, sub: APP.state.sub }; }, exId);
    await p.locator('table.wt tbody tr').nth(0).locator('td').nth(5).locator('select').selectOption('درست');
    await p.waitForTimeout(200);
    const after = await E(() => { const b2 = [...document.querySelectorAll('#main button')].find(b => /ثبت مجدد|ثبت نهایی/.test(b.textContent)); b2 && b2.click();
      const F = APP.S.all('fcast'); return { n: F.length, out: F.map(f => f.outcome || ''), t: __today().filter(t => /🎯/.test(t)), c: __one(24) }; });
    T(113, pre.length === 1 && r.same && after.n === 2 && after.out.filter(o => o === 'شد').length === 1 && after.t.length === 0 && after.c.due > ymd(2) && after.c.calib && after.c.calib.n === 1,
      { pre, same: r, n: after.n, out: after.out, t: after.t, due: after.c.due, calib: after.c.calib });
    X('A21-11 calibration session carries its measurement (p + outcome) for the mind card', after.c.sessions.some(s => s.meas && s.meas.p === 70 && s.meas.ok === true), after.c.sessions);
  });

  // #114 — T24 از گفت‌وگو «باشگاه رفتم (درست)» ⇒ همان یک 🎯 داوری می‌شود؛ 🎯 ِ دوم نه؛ «امروز» بی عقب‌افتاده
  // A21-10 — پیش‌بینیِ تازه با «۶۰٪» در گفت‌وگو ⇒ 🎯 ِ داوری‌شده با ۶۰، نه «۰٪»
  await section('r5d', async () => {
    await fresh();
    const pid = await E(() => { const pid = __live('برنامهٔ باشگاه'); const c = APP.PR.startFrom(24, APP.PR.subj('live', pid), 'live', false);
      APP.S.put({ id: APP.uid('fc'), type: 'fcast', q: 'جلسهٔ اولِ باشگاه را چهارشنبه می‌روم', p: 70, due: APP.addDays(APP.today(), 3), dim: 's_decision', tid: 24, prc: c.id }); APP.PR.save(c); return pid; });
    await day(3); await reload();
    const r = await E(async (pid) => { const id = __freshChat(); const s = APP.S.get(id); s.lprob = pid; APP.S.put(s); const c = APP.PR.cases({ tid: 24 })[0];
      const pre = __today().filter(t => /🎯/.test(t));
      await __say('باشگاه رفتم (درست)', 'عالی.', [{ do: 'practice_log', prc: c.id, what: 'جلسهٔ اول باشگاه', ok: true, quote: 'باشگاه رفتم (درست)' }]);
      const F = APP.S.all('fcast'); const one = { n: F.length, out: F.map(f => f.outcome), t: __today().filter(t => /🎯|کالیبراسیون/.test(t) && /عقب‌افتاده/.test(t)), pre };
      await __say('یه پیش‌بینیِ تازه هم کرده بودم: «برای جمع ۳۰ بهترین تعداد جزء ۱۱ است» با ۶۰٪ اطمینان — امروز حساب کردم، درست بود.', 'دیدم.', [{ do: 'practice_log', prc: c.id, what: 'برای جمع ۳۰ بهترین تعداد جزء ۱۱ است', pct: 60, ok: true, quote: 'امروز حساب کردم، درست بود' }]);
      const msgs = APP.S.get(id).msgs.map(m => m.text).join('\n'); const F2 = APP.S.all('fcast');
      return { one, n2: F2.length, p2: F2.map(f => f.p), out2: F2.map(f => f.outcome), zero: /اطمینانِ اعلام‌شده \(۰٪\)/.test(msgs), c: __one(24) }; }, pid);
    T(114, r.one.pre.length === 1 && r.one.n === 1 && r.one.out[0] === 'شد' && r.one.t.length === 0, r.one);
    X('A21-10 chat log of a new prediction keeps her 60% and judges it', r.n2 === 2 && r.p2.indexOf(60) >= 0 && r.out2.every(o => o === 'شد') && !r.zero && r.c.calib.n === 2, r);
  });

  // #115 — T41 موعدِ سه‌شنبه ۲۰ اکتبر؛ تا جمعه کاری نمی‌کند ⇒ هر روز یک سطر با «عقب‌افتاده از ۲۸ مهر» (A21-17)
  await section('r5e', async () => {
    await fresh(); await day(1);
    await E(() => { const tp = __topic('انتگرال').id; __ex(41, { topic: 'انتگرال', actual: '75' }, { topic: tp }); });
    const out = [];
    for (const n of [2, 3, 4, 5]) { await day(n); await reload(); out.push(await E(() => __today().filter(t => /انتگرال/.test(t)))); }
    T(115, out[0].length === 1 && !/عقب‌افتاده/.test(out[0][0]) && out.slice(1).every(x => x.length === 1 && /عقب‌افتاده از ۲۸ مهر/.test(x[0])), out);
  });

  // #116 #117 #128 #124 — روزِ جلسه از حرفِ خودش («دیروز»، «پریروز»، نیمه‌شب)؛ عددِ تایپ‌شده؛ «فردا تمرین می‌کنم» جلسه نیست
  await section('r5f', async () => {
    await fresh(); await day(-3);
    const id = await E(() => { const tp = __topic('لگاریتم').id; __ex(41, { topic: 'لگاریتم', actual: '80' }, { topic: tp }); return APP.PR.cases({ tid: 41 })[0].id; });
    await day(1); await reload();
    const a = await E(async (id) => { __freshChat(); const r = await __say('دیروز تمرین کردم، ۷۰ درصد', 'دیدم.', [{ do: 'practice_log', prc: id, what: 'برگهٔ سفید', pct: 70, quote: 'دیروز تمرین کردم، ۷۰ درصد' }]); return __case(id); }, id);
    T(116, a.sessions.some(s => s.d === ymd(0) && s.meas.pct === 70) && !a.sessions.some(s => s.d === ymd(1)), a.sessions);
    await day(2); await reload();
    const b2 = await E(async (id) => { __freshChat(); await __say('پریروز ۶۰ درصدش یادم بود', 'دیدم.', [{ do: 'practice_log', prc: id, what: 'برگهٔ سفید', quote: 'پریروز ۶۰ درصدش یادم بود' }]); return __case(id); }, id);
    T(117, b2.sessions.filter(s => s.d === ymd(0)).length === 1 && b2.sessions.filter(s => s.d === ymd(0))[0].meas.pct === 60 && !b2.sessions.some(s => s.d === ymd(2)), b2.sessions);
    await day(3); await reload();
    const f = await E(async (id) => { __freshChat(); const n0 = APP.S.get(id).sessions.length, d0 = APP.S.get(id).due; await __say('فردا تمرین می‌کنم', 'باشه.', [{ do: 'practice_log', prc: id, what: 'برگهٔ سفید', quote: 'فردا تمرین می‌کنم' }]); return { n0, n1: APP.S.get(id).sessions.length, d0, d1: APP.S.get(id).due }; }, id);
    T(124, f.n0 === f.n1 && f.d0 === f.d1, f);   // روزِ ۳ هنوز جلسه‌ای ندارد ⇒ ثبتِ نادرست شمارِ جلسه‌ها را بالا می‌برد
    await fresh();
    const id2 = await E(() => { const tp = __topic('مشتق').id; __ex(41, { topic: 'مشتق', actual: '70' }, { topic: tp }); return APP.PR.cases({ tid: 41 })[0].id; });
    await day(0, 23.8); await E((id) => APP.PR.session(id, { what: 'شب', meas: { pct: 72 } }), id2);
    await day(1, 0.34); await reload();
    const m = await E(async (id) => { __freshChat(); await __say('دیروز ۷۰ درصد', 'دیدم.', [{ do: 'practice_log', prc: id, what: 'برگهٔ سفید', pct: 70, quote: 'دیروز ۷۰ درصد' }]); return __case(id); }, id2);
    T(128, m.sessions.filter(s => s.d === ymd(0)).length === 1 && !m.sessions.some(s => s.d === ymd(1)), m.sessions);
  });

  // #118 #130 — «من هر دو هفته یه بار تمرین می‌کنم» ⇒ موعدِ همان پرونده ۱ نوامبر؛ پروندهٔ دیگر دست نمی‌خورد
  await section('r5g', async () => {
    await fresh();
    const ids = await E(() => { const t1 = __topic('آمار').id, t2 = __topic('احتمال').id; __ex(41, { topic: 'آمار', actual: '80' }, { topic: t1 }); __ex(41, { topic: 'احتمال', actual: '80' }, { topic: t2 });
      const L = APP.PR.cases({ tid: 41 }); return { a: L.filter(c => c.subj.t === 'آمار' || APP.PR.subjTitle(c.subj) === 'آمار')[0].id, b: L.filter(c => APP.PR.subjTitle(c.subj) === 'احتمال')[0].id }; });
    const r = await E(async (ids) => { const bDue = APP.S.get(ids.b).due; __freshChat();
      await __say('من هر دو هفته یه بار تمرین می‌کنم', 'باشه.', [{ do: 'practice_rhythm', prc: ids.a, quote: 'من هر دو هفته یه بار تمرین می‌کنم' }]);
      return { a: __case(ids.a), bDue, bDue2: APP.S.get(ids.b).due, t: __today() }; }, ids);
    T(118, r.a.due === '2026-11-01' && r.a.urhythm && r.a.urhythm.every === 14 && r.a.udue === '2026-11-01', { due: r.a.due, rh: r.a.urhythm, udue: r.a.udue, reason: r.a.reason });
    T(130, r.bDue === r.bDue2, r);
  });

  // #119 — T23 (steps:[1]، معیارِ گره): جلسهٔ دیرِ گفت‌وگو و جلسهٔ به‌موقع ⇒ موعد همیشه تاریخِ معتبر (هرگز NaN / «Invalid Date»)؛ پرونده در «امروز»
  await section('r5h', async () => {
    await fresh();
    const r = await E(() => { const tp = __topic('واژه‌های زیست').id; const c = APP.PR.start(23, APP.PR.subj('topic', tp), { src: 'page' });
      APP.PR.session(c.id, { d: '2026-10-18', what: 'آزمونک', meas: { correct: 3 } }); APP.PR.session(c.id, { d: '2026-10-19', what: 'بازآزمایی', meas: { correct: 4 } });
      const a = __case(c.id); APP.PR.session(c.id, { d: '2026-10-28', what: 'بازآزمایی دیر', ok: true, src: 'assistant' }); const b2 = __case(c.id); return { a, b2 }; });
    const ok = (c) => /^\d{4}-\d\d-\d\d$/.test(c.due) && !/NaN|Invalid/.test(c.dueText + c.reason);
    await day(31); await reload(); const t = await E(() => __today().filter(x => /حلقه‌های بازخورد سریع|واژه‌های زیست/.test(x)));
    T(119, ok(r.a) && ok(r.b2) && t.length === 1 && !/NaN|Invalid/.test(t[0]), { a: [r.a.due, r.a.dueText], b: [r.b2.due, r.b2.dueText], t });
  });

  // #120 — شش جلسهٔ سنجیدهٔ پرونده ⇒ نمودارِ «روند درصد بازیابی» شش نقطه دارد، نه «هنوز داده‌ای نیست»
  await section('r5i', async () => {
    await fresh();
    const r = await E(() => { const tp = __topic('شیمی').id; __ex(41, { topic: 'شیمی', actual: '60' }, { topic: tp }); const c = APP.PR.cases({ tid: 41 })[0];
      [['2026-10-19', 65], ['2026-10-21', 70], ['2026-10-25', 75], ['2026-11-01', 80], ['2026-11-08', 85]].forEach(([d, pct]) => APP.PR.session(c.id, { d, what: 'برگه', meas: { pct } }));
      APP.go('home'); const card = [...document.querySelectorAll('#main .stat')].find(x => /روند درصد بازیابی/.test(x.textContent)); return { n: APP.recallTrend().length, txt: card ? card.textContent : 'no card' }; });
    T(120, r.n === 6 && !/هنوز داده‌ای نیست/.test(r.txt), r);
  });

  // #121 — 🌱 «امشب شامِ سبک» (D0) ⇒ فقط ۱۹ اکتبر پرسیده می‌شود؛ ۲۰ اکتبر نیست (بسته با دلیل، پاک نه)
  await section('r5j', async () => {
    await fresh();
    const pid = await E(() => { const pid = __live('وزنِ سالم'); const pg = APP.S.get('eprog_' + pid), now = new Date().toISOString(); const W = APP.willWhen('امشب ساعتِ ۸'), dd = APP.willDueOf(W, 1);
      pg.solve.will = { steps: [{ id: 'ws0', at: now, step: 'شامِ سبک تا ساعتِ ۸', when: 'امشب ساعتِ ۸', iv: 1, due: dd.due, dueFrom: dd.from, checks: [] }], log: [] }; APP.S.put(pg); return pid; });
    const seen = [];
    for (const n of [0, 1, 2, 60]) { await day(n); await reload(); seen.push(await E(() => __today().filter(t => /شامِ سبک/.test(t)).length)); }
    const rec = await E((pid) => APP.S.get('eprog_' + pid).solve.will.steps[0], pid);
    T(121, seen[0] === 0 && seen[1] === 1 && seen[2] === 0 && seen[3] === 0 && rec.closed && rec.expired && rec.step === 'شامِ سبک تا ساعتِ ۸', { seen, rec });
  });

  // #122 — کالیبراسیون پیش از هر داوری ⇒ هیچ عدد («۰٪ … ۵۰٪ ± ۲۹») نه در پرونده، نه «امروز»
  await section('r5k', async () => {
    await fresh();
    const r = await E(() => { const c = APP.PR.start(24, APP.PR.subj('topic', '', 'پیش‌بینی‌های کار'), { src: 'page' }); APP.S.put({ id: APP.uid('fc'), type: 'fcast', q: 'جلسه به فردا نمی‌کشد', p: 70, due: APP.addDays(APP.today(), 2), tid: 24, prc: c.id }); APP.PR.save(c);
      const page = __go('practice', c.id); return { page, t: __today().join(' | '), crit: __case(c.id).crit }; });
    T(122, !/± |۰٪\)|درونِ بازهٔ نرخِ درستی/.test(r.page + r.t) && r.crit.length === 0, { crit: r.crit, t: r.t });
  });

  // #126 — پروندهٔ T28 روی مسئلهٔ زنده با کارتِ درسِ بازنگری (tutor:back) و کارتِ قابِ مسئلهٔ عملی (A21-16) ⇒ «امروز» یک سطر (پرونده)
  await section('r5l', async () => {
    await fresh();
    const pid = await E(() => { const pid = __live('کیکِ مادرم'); const due = APP.addDays(APP.today(), 1);
      APP.newCard('بازنگری — «کیکِ مادرم»: چه آموختی؟', 'زمانِ پخت به ضخامت بند است', { due, src: 'tutor:back:' + pid });
      const fc = APP.practicalFrameCard('کیکِ مادرم', [['مجهول', 'زمانِ پخت']], 'lprob:practical'); fc.due = due; APP.S.put(fc); const pg = APP.S.get('eprog_' + pid); pg.solve.u[1].pracCard = fc.id; APP.S.put(pg);
      APP.PR.startFrom(28, APP.PR.subj('live', pid), 'live', false); return pid; });
    const out = [];
    for (const n of [1, 2, 9]) { await day(n); await reload(); out.push(await E(() => __today().filter(t => /🧪.*کیکِ مادرم|کارت مرور|بازنگری — «کیکِ مادرم»|قابِ مسئلهٔ عملیِ «کیکِ مادرم»/.test(t)))); }
    T(126, out.every(x => x.length <= 1) && out[0].length === 1 && !out.some(x => x.some(t => /کارت مرور/.test(t))), out);
    X('A21-16 frame card owned by the retrieval case', !out.some(x => x.some(t => /کارت مرور/.test(t))), out);
  });

  // #127 — برنامهٔ «سه‌شنبه باشگاه» و 🎯 ِ همان رفتن ⇒ پیوندِ هنگامِ ساخت، یک سطرِ «امروز»؛ سرانجامِ 🎯 ⇒ برنامه
  await section('r5m', async () => {
    await fresh();
    const x = await E(() => { const now = new Date().toISOString(), tue = APP.addDays(APP.today(), 2);
      const s = { id: APP.uid('achat'), type: 'achat', title: 't', msgs: [{ role: 'user', text: 'سه‌شنبه باشگاه می‌رم', at: now, id: 'u1' }], steps: [], files: [], reports: [],
        plans: [{ id: 'pl1', text: 'سه‌شنبه باشگاه برم', when: tue, at: now, d: APP.today(), key: 'k1', done: false, state: 'open' }] }; s.plans[0].sess = s.id; APP.S.put(s);
      APP.S.put({ id: APP.uid('fc'), type: 'fcast', q: 'سه‌شنبه باشگاه می‌رم', p: 70, due: tue, dim: 's_decision' }); APP.PR.planStateSync(); return { sid: s.id, q: APP.S.get(s.id).plans[0], f: APP.S.all('fcast')[0] }; });
    await day(2); await reload();
    const t = await E(() => __today().filter(t => /باشگاه/.test(t)));
    const done = await E((sid) => { const f = APP.S.all('fcast')[0]; f.outcome = 'شد'; f.outcomeAt = new Date().toISOString(); APP.S.put(f); APP.PR.planStateSync(); return { q: APP.S.get(sid).plans[0], t: __today().filter(t => /باشگاه/.test(t)) }; }, x.sid);
    T(127, x.q.fc === x.f.id && x.f.plan && t.length === 1 && done.q.state === 'done' && done.t.length === 0, { q: x.q, f: x.f.plan, t, done });
  });

  // #129 — «خفته تا» هرگز تاریخِ گذشته نیست
  await section('r5n', async () => {
    await fresh();
    const r = await E(() => { const pid = __live('مسئلهٔ خفته'); const rec = APP.liveRec(pid); rec.dormant = APP.addDays(APP.today(), -3); APP.S.put(rec);
      const D = JSON.stringify(APP.dossier ? APP.dossier(pid) : {}); const page = __go('lprob', pid); return { D: /خفته تا/.test(D), page: /خفته تا/.test(page) }; });
    T(129, !r.D && !r.page, r);
  });

  info.bankSummary = { pass: Object.keys(res).filter(k => res[k]).map(Number), fail: Object.keys(res).filter(k => !res[k]).map(Number) };
  console.log(JSON.stringify(info.bankSummary));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
