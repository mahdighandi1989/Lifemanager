// تورِ پولیا (دستهٔ ۱، دورِ ۱۸ ِ اصلاح، ۲۰۲۶-۱۰-۱۷) — DECISIONS_R18، بخشِ «live» (a38_live.js).
//  قاعدهٔ مالک: ریشه، نه وصله — هر بخش هم جملهٔ عینیِ سناریو (round18X/<sid>) را دارد و هم **همهٔ** واریانت‌های همان سازوکار در بانکِ مستقل
//  (tests/variants/VARIANTS_R18.json = tour1_polya/VARIANTS_R18.json، نوشتهٔ عاملی که کد را ندیده؛ LLA_VARIANTS = مسیرِ دیگر).
//  close   RM1d/INF6 — بستن با گامِ باز نتیجهٔ هر گام را می‌پرسد؛ گزارشِ سنجیدهٔ گفت‌وگو بی پرسش (C·W3 s23) + بانک RM1.close.
//  guess   RM4 a/b — «(حدسِ تو: …)» فقط با m.guess.q، فقط روی گزینهٔ q، فقط حدسی که در پیامِ کاربر آمد (A·N2 s03/s04/s05، B·D2 s12/s18) + بانک RM4.guess.
//  head    RM6b — سرِ بی‌فعلی که مرجعِ پرسش را دارد می‌ماند (A·N1 s01) + بانک RM6.head.
//  transf  RM6d — ارزیابیِ عددی تبدیل نیست (A·E1 s03) + بانک RM6.transf.
//  win     RM6e — پنجرهٔ مسئلهٔ بسته‌شده در گفت‌وگو از نخستین آوردنِ صورتش آغاز می‌شود (B·D4 s14).
//  full    INF7 — «پیامِ کامل» کنارِ #lpBBest پیامِ کاملِ گزینهٔ برگزیده را نشان می‌دهد.
//  plain   RM2a/INF2 — گزینه‌های 💬 از APP.MATH.toPlain می‌گذرند (بی آن، همان متن).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R18.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R18.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)) || path.join(__dirname, 'variants', 'VARIANTS_R18.json');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
  const J = (x) => JSON.stringify(x);
  const W = (ms) => p.waitForTimeout(ms || 90);
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => { APP.S.loaded = true; APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) }; });
  const bank = JSON.parse(fs.readFileSync(BANK, 'utf8'));
  const B = (rc) => bank.filter(e => e.rc === rc);
  info.bank = { file: BANK, n: bank.length };
  chk(bank.length >= 200, 'bank: VARIANTS_R18 must be loaded (got ' + bank.length + ' from ' + BANK + ')');
  const firstQuote = (s) => { const i = s.indexOf('«'); if (i < 0) return null; let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === '«') d++; else if (s[j] === '»') { d--; if (!d) return s.slice(i + 1, j); } } return null; };

  /* opts(spec): spec = { msgs: [{ role, text, guess?, actions? }], guesses? } ⇒ گزینه‌های 💬 ِ مسئلهٔ تازه (همان منبعِ #lpBBest) */
  const opts = (spec) => p.evaluate((spec) => {
    const t0 = Date.parse('2026-10-17T08:00:00Z');
    const pid0 = APP.liveCreate('مسئلهٔ آزمونِ دورِ ۱۸ ' + Math.random().toString(36).slice(2, 7), 'صورتِ آزمونی برای گزینه‌های کدام پرسش کمک کرد', 'find', { by: 'user', nat: 'objective' });
    const id = typeof pid0 === 'string' ? pid0 : (pid0 && pid0.p ? pid0.p.id : pid0.id);
    const r = APP.S.get('eprob_' + id); r.created = new Date(t0 - 3600e3).toISOString(); APP.S.put(r, { keepTime: true });
    if (spec.guesses) { const pg = APP.S.get('eprog_' + id) || { id: 'eprog_' + id, type: 'eprog' }; pg.solve = pg.solve || {}; pg.solve.g = {}; Object.keys(spec.guesses).forEach(k => { pg.solve.g[k] = { guess: spec.guesses[k].guess, at: new Date(t0 - 1800e3).toISOString(), from: 'live' }; }); APP.S.put(pg); }
    let n = 0; const msgs = (spec.msgs || []).map(m => { const a = { role: m.role || 'ai', text: m.text, at: new Date(t0 + (n++) * 60e3).toISOString(), actions: m.actions || [] }; if (m.guess) a.guess = m.guess; return a; });
    if (!msgs.length || msgs[msgs.length - 1].role === 'ai') msgs.push({ role: 'user', text: 'باشه، فکر می‌کنم.', at: new Date(t0 + (n++) * 60e3).toISOString() });
    const se = { id: APP.uid('achat'), type: 'achat', title: 't', msgs, steps: [], files: [], reports: [], lprob: id };
    APP.S.put(se);
    const out = APP.liveChatQItems(id).map(x => x.t);
    APP.S.del(se.id);
    return out;
  }, spec);
  /* APP.MATH.toPlain را a39 (رفع‌کنندهٔ ریاضی، موازی) می‌سازد؛ تا ادغام، جانشینِ کمینه فقط برای همین آزمون (و بعد برداشته می‌شود) */
  const STUB = () => { APP.MATH = APP.MATH || {}; APP.MATH.toPlain = (t) => String(t).replace(/\$\\frac\{([^}]*)\}\{([^}]*)\}\$/g, '$1/$2').replace(/\$([^$]*)\$/g, '$1').replace(/_1/g, '₁').replace(/_2/g, '₂').replace(/_3/g, '₃'); };
  const NOTE = /\(حدسِ (?:تو|شما): «(.*)»\)$/;   // دورِ ۱۹ (RN6c، DECISIONS_R19): واژهٔ یادداشت از ضمیرِ گفت‌وگوست — بانکِ R18 در گفت‌وگوی «شما» هم «حدسِ تو» نوشته بود
  const notes = (q) => q.map(t => { const m = NOTE.exec(t); return m ? m[1] : null; }).filter(x => x != null);

  /* ---------- close: مسئلهٔ زنده در مرحلهٔ اجرا با گام‌های باز، سشنِ گفت‌وگوی بسته به آن، گزارشِ مدل با A.liveStepReport ---------- */
  const mkLive = (o) => p.evaluate((o) => {
    const now = new Date().toISOString();
    const pid0 = APP.liveCreate(o.title || ('بستنِ آزمونی ' + Math.random().toString(36).slice(2, 7)), o.st || 'می‌خواهم این کار را درست انجام دهم و نتیجه را ببینم', 'find', { by: 'user', nat: o.nat || 'practical' });
    const id = typeof pid0 === 'string' ? pid0 : (pid0 && pid0.p ? pid0.p.id : pid0.id);
    const pg = APP.S.get('eprog_' + id); pg.solve = pg.solve || {}; const so = pg.solve;
    so.u = { 1: { done: true, at: now, one: 'می‌خواهم ببینم چه می‌شود', u: 'نتیجهٔ کار', dl: [], c: '', type: 'find' } };
    so.live = so.live || {}; const L = so.live; ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; });
    L.plan = { t: 'گام‌به‌گام انجامش می‌دهم و هر بار نتیجه را می‌سنجم', at: now };
    (o.steps || []).forEach((t, i) => { const x = typeof t === 'string' ? { text: t } : t; L.steps.push(Object.assign({ id: 'st' + (i + 1) + Math.random().toString(36).slice(2, 5), text: x.text, pred: x.pred == null ? 'خوب پیش می‌رود' : x.pred, conf: 60, due: APP.today(), at: now }, x.closed ? { closed: true, out: { at: now, d: APP.today(), done: x.closed, what: 'شد', match: '', prog: 'کمی' } } : {})); });
    APP.S.put(pg);
    let sid = null;
    if (o.chat) { const t0 = Date.now() - 3600e3; let n = 0; const msgs = o.chat.map(m => ({ role: m.role, text: m.text, at: new Date(t0 + (n++) * 60e3).toISOString(), actions: [] }));
      const se = { id: APP.uid('achat'), type: 'achat', title: 't', msgs, steps: [], files: [], reports: [], lprob: o.chatFor === 'other' ? 'pb_none_other' : id }; APP.S.put(se); sid = se.id; }
    const reps = (o.reps || []).map(rp => APP.liveStepReport(id, Object.assign({}, rp, { step: rp.step === undefined ? 1 : rp.step }), rp.sess === 'none' ? undefined : undefined));
    return { pid: id, sid, reps, steps: L.steps.map(s => s.id) };
  }, o);
  const stepsOf = (pid) => p.evaluate((pid) => APP.S.get('eprog_' + pid).solve.live.steps.map(s => ({ text: s.text, closed: !!s.closed, out: s.out || null })), pid);
  const solve = async (pid) => { await p.evaluate((pid) => APP.go('lprob', pid, 'exec'), pid); await W(200); await p.click('main .lp-solved'); await W(220);
    return p.evaluate(() => ({ asked: [...document.querySelectorAll('main .lp-closestep')].map(x => x.querySelector('p').textContent), state: APP.state.sub })); };
  const answer = async (pid, ans) => {   // ans: [{ v, t?, m? }] به ترتیبِ کارت‌ها
    const ids = await p.evaluate(() => [...document.querySelectorAll('main .lp-closestep')].map(x => x.getAttribute('data-step')));
    for (let i = 0; i < ids.length; i++) { const a = ans[i]; if (!a) continue; await p.selectOption('#lpXS_' + ids[i], a.v); await W(120);
      if (a.t != null && await p.locator('#lpXSW_' + ids[i]).count()) await p.fill('#lpXSW_' + ids[i], a.t);
      if (a.m && await p.locator('#lpXSM_' + ids[i]).count()) { await p.selectOption('#lpXSM_' + ids[i], a.m); await W(80); } }
    await p.click('main .lp-closego'); await W(220);
  };
  const noAuto = (S0) => S0.every(s => !(s.out && s.out.auto === 'solved') && !(s.out && s.out.done === 'no' && !s.out.from));

  await section('close', async () => {
    const r = info.close = {};
    // C·W3 s23 (عینِ سناریو): «فردا کیک رو می‌پزم» باز؛ در گفت‌وگو: «دیروز پختمش، خیلی خوب شد»؛ مدل گزارش می‌دهد
    let L0 = await mkLive({ steps: ['فردا کیک رو با قالبِ ۲۵×۳۵ و ۱٫۷۵ برابرِ مواد می‌پزم'], chat: [{ role: 'ai', text: 'اندازهٔ قالب را حساب کردی؟' }, { role: 'user', text: 'دیروز پختمش، خیلی خوب شد. ۸ تا تخم‌مرغ زدم.' }],
      reps: [{ done: 'yes', what: 'پخت و خوب شد', match: 'yes', msg: 1 }] });
    r.s23rep = L0.reps;
    let g = await solve(L0.pid), S0 = await stepsOf(L0.pid);
    r.s23 = { g, S0 };
    chk(/✓/.test(L0.reps[0]) && g.asked.length === 0 && S0[0].closed && S0[0].out.done === 'yes' && S0[0].out.from === 'chat' && !S0[0].out.auto, 'close C·W3 s23: the step she reported in chat is recorded done (from chat) without asking; never done:"no", auto:"solved" ' + J(r.s23));
    // bank RM1.close — هر ورودی یک سناریوی مشخص
    const fails = [];
    const C = B('RM1.close'); chk(C.length === 16, 'close: 16 RM1.close bank entries ' + C.length);
    for (const e of C) {
      const T = e.text; let ok = false, got = null;
      try {
        if (/^problem with 2 open steps; she clicks/.test(T)) { const x = await mkLive({ steps: ['گامِ یکم', 'گامِ دوم'] }); g = await solve(x.pid); got = g; ok = g.asked.length === 2 && noAuto(await stepsOf(x.pid)) && (await stepsOf(x.pid)).every(s => !s.closed); }
        else if (/^open step «فردا کیک/.test(T)) { const x = await mkLive({ steps: ['فردا کیک رو می‌پزم'], chat: [{ role: 'user', text: 'دیروز پختمش، خیلی خوب شد' }], reps: [{ done: 'yes', msg: 1 }] }); g = await solve(x.pid); const s = await stepsOf(x.pid); got = { g, s, rep: x.reps }; ok = g.asked.length === 0 && s[0].out && s[0].out.done === 'yes' && s[0].out.from === 'chat' && !s[0].out.auto; }
        else if (/^open step «با صاحبخونه/.test(T)) { const x = await mkLive({ steps: ['با صاحبخونه حرف می‌زنم'], chat: [{ role: 'user', text: 'باهاش حرف زدم ولی قبول نکرد' }], reps: [{ done: 'yes', match: 'no', what: 'حرف زدم ولی قبول نکرد', msg: 'باهاش حرف زدم ولی قبول نکرد' }] }); g = await solve(x.pid); const s = await stepsOf(x.pid); got = { g, s }; ok = g.asked.length === 0 && s[0].out.done === 'yes' && s[0].out.match === 'no' && /قبول نکرد/.test(s[0].out.what); }
        else if (/^3 open steps; chat reported the 1st/.test(T)) { const x = await mkLive({ steps: ['یک', 'دو', 'سه'], chat: [{ role: 'user', text: 'اولی رو انجام دادم' }], reps: [{ step: 1, done: 'yes', msg: 1 }] }); g = await solve(x.pid); const s = await stepsOf(x.pid); got = { g, s }; ok = g.asked.length === 2 && /دو/.test(g.asked[0]) && /سه/.test(g.asked[1]) && s[0].out && s[0].out.from === 'chat'; }
        else if (/^2 open steps; in the dialog she answers/.test(T)) { const x = await mkLive({ steps: ['اولی', 'دومی'] }); g = await solve(x.pid); await answer(x.pid, [{ v: 'yes', t: 'انجامش دادم', m: 'yes' }, { v: 'no' }]); const s = await stepsOf(x.pid); got = { g, s }; ok = g.asked.length === 2 && s[0].out.done === 'yes' && s[0].out.from === 'ask' && s[1].out.done === 'no' && s[1].out.from === 'ask' && !s[0].out.auto && !s[1].out.auto; }
        else if (/^formal chat before closing/.test(T)) { const x = await mkLive({ steps: ['مرحلهٔ اول را اجرا می‌کنم', 'مرحلهٔ دوم را اجرا می‌کنم', 'مرحلهٔ سوم را اجرا می‌کنم'], chat: [{ role: 'user', text: 'مرحلهٔ دوم را اجرا کردم و نتیجه داد.' }], reps: [{ step: 'مرحلهٔ دوم را اجرا می‌کنم', done: 'yes', match: 'yes', msg: 1 }] }); g = await solve(x.pid); const s = await stepsOf(x.pid); got = { g, s }; ok = g.asked.length === 2 && s[1].out && s[1].out.from === 'chat' && !g.asked.some(t => /دوم/.test(t)); }
        else if (/^problem closed via chat_solved/.test(T)) { const x = await mkLive({ steps: ['گامِ باز'] }); await p.evaluate((pid) => { const pg = APP.S.get('eprog_' + pid), L = pg.solve.live; L.state = 'solved'; L.stateAt = new Date().toISOString(); pg.solve.b = { 1: { done: true, from: 'chat', state: 'solved', use: 'درس', at: L.stateAt } }; L.chat = { sess: 'x', at: L.stateAt }; APP.S.put(pg); }, x.pid); const s = await stepsOf(x.pid); got = s; ok = !s[0].closed && noAuto(s); }
        else if (/^open step «تست رو با n=۴/.test(T)) { const x = await mkLive({ steps: ['تست رو با n=۴ امتحان می‌کنم'], chat: [{ role: 'user', text: 'با ۴ امتحان کردم، جواب نداد' }], reps: [{ done: 'yes', match: 'no', what: 'با ۴ امتحان کردم، جواب نداد', msg: 1 }] }); g = await solve(x.pid); const s = await stepsOf(x.pid); got = { g, s }; ok = g.asked.length === 0 && s[0].out.done === 'yes' && s[0].out.match === 'no'; }
        else if (/^problem with zero open steps/.test(T)) { const x = await mkLive({ steps: [] }); g = await solve(x.pid); got = g; ok = g.asked.length === 0 && g.state === 'back'; }
        else if (/^all steps already marked/.test(T)) { const x = await mkLive({ steps: [{ text: 'یک', closed: 'yes' }, { text: 'دو', closed: 'no' }] }); g = await solve(x.pid); got = g; ok = g.asked.length === 0 && g.state === 'back'; }
        else if (/future intention/.test(T)) { const x = await mkLive({ steps: ['انجامش میدم'], chat: [{ role: 'user', text: 'فردا حتماً انجامش میدم' }], reps: [{ done: 'yes', msg: 1 }] }); g = await solve(x.pid); const s = await stepsOf(x.pid); got = { g, s, rep: x.reps }; ok = !/✓/.test(x.reps[0]) && g.asked.length === 1 && !s[0].closed; }
        else if (/chat: A «احتمالاً تا الان/.test(T)) { const x = await mkLive({ steps: ['انجامش میدم'], chat: [{ role: 'ai', text: 'احتمالاً تا الان انجامش دادی' }, { role: 'user', text: 'نمی‌دونم' }], reps: [{ done: 'yes', msg: 'احتمالاً تا الان انجامش دادی' }] }); g = await solve(x.pid); got = { g, rep: x.reps }; ok = !/✓/.test(x.reps[0]) && g.asked.length === 1; }
        else if (/open step of problem B/.test(T)) { const x = await mkLive({ steps: ['گامِ B'], chat: [{ role: 'user', text: 'انجامش دادم' }], chatFor: 'other', reps: [{ done: 'yes', msg: 1 }] }); g = await solve(x.pid); got = { g, rep: x.reps }; ok = !/✓/.test(x.reps[0]) && g.asked.length === 1; }
        else if (/یه کمی شروع کردم/.test(T)) { const x = await mkLive({ steps: ['کار را تمام می‌کنم'], chat: [{ role: 'user', text: 'یه کمی شروع کردم ولی تموم نشد' }], reps: [{ done: 'part', what: 'یه کمی شروع کردم ولی تموم نشد', msg: 1 }] }); g = await solve(x.pid); const s = await stepsOf(x.pid); got = { g, s }; ok = s[0].out && s[0].out.done === 'part' && s[0].out.done !== 'yes' && !s[0].out.auto; }
        else if (/problem abandoned/.test(T)) { const x = await mkLive({ steps: ['گامِ باز'] }); await p.evaluate((pid) => APP.go('lprob', pid, 'exec'), x.pid); await W(200); await p.click('main .lp-abandon'); await W(200); const s = await stepsOf(x.pid); got = s; ok = noAuto(s); }
        else if (/cites a message id that does not exist/.test(T)) { const x = await mkLive({ steps: ['گامِ باز'], chat: [{ role: 'user', text: 'انجامش دادم' }], reps: [{ done: 'yes', msg: 7 }] }); g = await solve(x.pid); got = { g, rep: x.reps }; ok = !/✓/.test(x.reps[0]) && g.asked.length === 1; }
        else got = 'unmapped bank entry';
      } catch (ex) { got = 'exception ' + String(ex && ex.message || ex).split('\n')[0]; }
      if (!ok) fails.push(e.kind + ' «' + T.slice(0, 60) + '» — ' + e.expect.slice(0, 80) + ' got ' + J(got).slice(0, 400));
    }
    r.bankFails = fails.length;
    fails.forEach(f => errors.push('close bank RM1.close: ' + f));
    // INF6: کارتِ بستن در نمای «حالِ بستن» (A.liveClosure.gate) هم دیده می‌شود
    const x = await mkLive({ steps: ['گامِ باز برای حالِ بستن'] }); await solve(x.pid);
    r.gate = await p.evaluate((pid) => APP.liveClosure(pid).gate, x.pid);
    chk(r.gate.length === 1 && r.gate[0].k === 'step', 'close INF6: liveClosure.gate names the open step ' + J(r.gate));
  });

  /* ---------- guess ---------- */
  await section('guess', async () => {
    const r = info.guess = {};
    // A·N2 (عینِ سناریوها): برچسبِ خودِ سامانه، واقعیتِ گزارش‌شده، مَثَل — بی یادداشت
    r.s03 = await opts({ msgs: [{ role: 'user', text: 'هفت شکل کشیدم و همیشه چهارضلعیِ محدب بود.' }, { text: 'فرض و حکم را درست جدا کردی. ولی هفت شکل استدلالِ اکتشافی است، نه برهان: نمونه‌ها حدس را محتمل‌تر می‌کنند، ثابتش نمی‌کنند — پس فعلاً «ناتمام — اکتشافی». برهانش؟ چرا برای هر چیدمانِ پنج‌نقطه‌ای، نه فقط این هفت تا؟' }] });
    chk(notes(r.s03).length === 0, 'guess A·N2 s03: the system\'s own label «ناتمام — اکتشافی» is never «(حدسِ تو: …)» ' + J(r.s03));
    r.s04 = await opts({ msgs: [{ role: 'user', text: 'جلسه خراب شد. خواهرم اجاره نمیده و برادرم گفت دو سال خیلی دیره.' }, { text: 'جلسه تلخ بود، ولی وقتت هدر نرفت: راهت را با واقعیت آزمودی و حالا می‌دانی خواهرت اجاره نمی‌دهد و «دو سال» برای برادرت دیر است — «حدس بزن، ولی حدست را بیازما». پیش از بیانِ تازه: آنچه شد با پیش‌بینی‌ات چه فاصله‌ای داشت — و این فاصله دربارهٔ فهمت از مسئله چه می‌گوید؟' }] });
    chk(notes(r.s04).length === 0, 'guess A·N2 s04: a reported fact «دو سال» is not her guess ' + J(r.s04));
    r.s05 = await opts({ msgs: [{ role: 'user', text: 'ازش پرسیدم، معیار دوره بوده.' }, { text: 'وقتت هدر نرفت: حدسِ «صددرصد» را با یک پرسشِ ساده آزمودی و پیش از ایمیلِ تند فهمیدی معیار دوره بوده — این همان اصلِ پولیاست: «حدس بزن، ولی حدست را بیازما». آنچه شد با پیش‌بینی‌ات چه فاصله‌ای داشت — و این فاصله دربارهٔ فهمت از مسئله چه می‌گوید؟' }] });
    chk(notes(r.s05).length === 0, 'guess A·N2 s05: the proverb «حدس بزن، ولی حدست را بیازما» is not her guess ' + J(r.s05));
    // B·D2 s12/s18 (عینِ سناریو): m.guess بی q ⇒ بی یادداشت
    r.s12 = await opts({ msgs: [{ role: 'user', text: 'آهان، دو تا شرطه … آهان ناوبان؟ حرف دومش با عمودی «ا» درمیاد. هنوز پیدا نکردم.' }, { text: 'شرط را خودتان خیلی خوب دو تکه کردید: معنا و املا. حالا: آیا پیش‌تر خانه‌ای با همین نوع شرط دیده‌اید — یا همین را به شکلی کمی متفاوت؟', guess: { text: 'ناوبان' } }] });
    chk(notes(r.s12).length === 0, 'guess B·D2 s12: m.guess without q puts no note on «… با همین نوع شرط …؟» ' + J(r.s12));
    r.s18 = await opts({ msgs: [{ role: 'user', text: 'فرمولش یادم نیست. حجم مخروط ⅓πr²h = ⅓·π·۱۰۰·۱۲ تقسیم بر ۵ ثانیه؟' }, { text: 'پیش از جایگذاری: مجهول دقیقاً چیست؟ می‌توانی آن را به عبارتِ دیگری بگویی؟', guess: { text: '⅓·π·۱۰۰·۱۲ تقسیم بر ۵ ثانیه' } }] });
    chk(notes(r.s18).length === 0, 'guess B·D2 s18: the restate question never inherits the guess ' + J(r.s18));
    // bank RM4.guess (سمتِ گزینه)
    const hadTP = await p.evaluate(() => !!(APP.MATH && APP.MATH.toPlain)); if (!hadTP) await p.evaluate(STUB);
    const fails = [], E = B('RM4.guess'); chk(E.length === 16, 'guess: 16 RM4.guess bank entries ' + E.length);
    for (const e of E) {
      const parts = e.text.split(' ‖ ').map(s => s.trim()), msgs = [];
      let cs = null; const m = /coach_state\.guess=\{g:"([^"]*)"(?:, q:"((?:[^"\\]|\\.)*)")?\}/.exec(e.context || ''); if (m) cs = { text: m[1], q: m[2] != null ? m[2].replace(/\\\\/g, '\\') : undefined };
      parts.forEach(x => { if (x === '…') return; const mm = /^(U|A)(?: \([^)]*\))?:\s*(.*)$/.exec(x); if (!mm) return; msgs.push({ role: mm[1] === 'U' ? 'user' : 'ai', text: mm[2] }); });
      const lastA = msgs.map(x => x.role).lastIndexOf('ai'); if (cs && lastA >= 0) msgs[lastA].guess = cs.q ? { text: cs.text, q: cs.q } : { text: cs.text };
      const q = await opts({ msgs }), N = notes(q);
      const A0 = lastA >= 0 ? msgs[lastA].text : '', valid = cs && cs.q && A0.indexOf(cs.q) >= 0;
      let ok;
      if (valid) { const noted = q.filter(t => NOTE.test(t)); const plainQ = cs.q.replace(/\$\\frac\{([^}]*)\}\{([^}]*)\}\$/g, '$1/$2').replace(/\$/g, '');
        ok = noted.length === 1 && N[0] === cs.text && noted[0].replace(NOTE, '').trim() === plainQ.trim() && !q.some(t => /\$/.test(t)); }
      else ok = N.length === 0;
      if (!ok) fails.push(e.kind + ' «' + e.text.slice(0, 70) + '» — ' + e.expect.slice(0, 80) + ' got ' + J(q));
    }
    r.bankFails = fails.length; fails.forEach(f => errors.push('guess bank RM4.guess: ' + f));
    if (!hadTP) await p.evaluate(() => { delete APP.MATH.toPlain; });
    // سازگاریِ عقب: m.guess = {g: n} بی q ⇒ بی یادداشت؛ {g: n, q} ⇒ حدسِ ثبت‌شدهٔ خودِ مسئله روی گزینهٔ q
    r.legacy = await opts({ guesses: { 1: { guess: '۴ جزء بهترین است' } }, msgs: [{ text: 'این را چطور می‌آزمایی؟', guess: { g: 1 } }] });
    chk(notes(r.legacy).length === 0, 'guess compat: m.guess {g:1} without q ⇒ no note ' + J(r.legacy));
    r.legacyQ = await opts({ guesses: { 1: { guess: '۴ جزء بهترین است' } }, msgs: [{ text: 'مجهول چیست؟ این را چطور می‌آزمایی؟', guess: { g: 1, q: 'این را چطور می‌آزمایی؟' } }] });
    chk(J(r.legacyQ) === J(['مجهول چیست؟', 'این را چطور می‌آزمایی؟ (حدسِ تو: «۴ جزء بهترین است»)']), 'guess compat: {g:1, q} ⇒ the recorded guess on the q option only ' + J(r.legacyQ));
  });

  /* ---------- head ---------- */
  await section('head', async () => {
    const r = info.head = {};
    r.s01 = await opts({ msgs: [{ text: 'در مسئلهٔ عملی «کافی» را تقریبی تعیین می‌کند که خودت در کارتِ فهم بس دانستی (±۳٪)؛ فاصلهٔ ۲۳٪ تا ۴۰٪ خیلی بیشتر از آن است، پس سرانگشتی برای این مقایسه بس است. حالا پیش از گامِ واقعی با گزینهٔ ج: چه پیش‌بینی می‌کنی و چقدر مطمئنی؟' }] });
    chk(r.s01.length === 1 && r.s01[0] === 'حالا پیش از گامِ واقعی با گزینهٔ ج: چه پیش‌بینی می‌کنی و چقدر مطمئنی؟', 'head A·N1 s01: the head that names the option («با گزینهٔ ج») stays with its question ' + J(r.s01));
    const fails = [], E = B('RM6.head'); chk(E.length === 16, 'head: 16 RM6.head bank entries ' + E.length);
    for (const e of E) { const want = firstQuote(e.expect), q = await opts({ msgs: [{ text: e.text }] }); if (!(q.length === 1 && q[0] === want)) fails.push(e.kind + ' «' + e.text + '» want «' + want + '» got ' + J(q)); }
    r.bankFails = fails.length; fails.forEach(f => errors.push('head bank RM6.head: ' + f));
  });

  /* ---------- transf ---------- */
  await section('transf', async () => {
    const r = info.transf = {};
    r.s03 = await p.evaluate(() => [APP.liveTransf('sqrt((1/2)^2 + (1/2)^2) = sqrt(2)/2'), APP.liveTransf('√(¼+¼)=√۲/۲')]);
    chk(J(r.s03) === J([false, false]), 'transf A·E1 s03: a numeric evaluation (ASCII or Persian) is not an equation transformation ' + J(r.s03));
    const E = B('RM6.transf'); chk(E.length === 16, 'transf: 16 RM6.transf bank entries ' + E.length);
    r.got = await p.evaluate((E) => E.map(e => APP.liveTransf(e.text)), E);
    /* استثنای آگاهانه (گزارشِ رفع‌کننده): Q_EQUIV دربارهٔ تبدیلِ پرخطر است («توانِ دو، ضرب یا تقسیم در عبارتِ متغیر») — زنجیرهٔ خطیِ «2x + 3 = 11 ⇒ …»
       همیشه هم‌ارز است؛ پرسیدنش همان پرسشِ نابجایی است که RM6d برمی‌دارد، و جریان‌های دورهای ۶–۸ (جای‌گذاریِ خطی) را سد می‌کرد */
    const EXC = ['2x + 3 = 11 ⇒ 2x = 8 ⇒ x = 4'];
    const fails = E.filter((e, i) => r.got[i] !== (e.kind === 'pos' && EXC.indexOf(e.text) < 0)).map(e => e.kind + ' «' + e.text + '»');
    r.exc = E.filter((e, i) => EXC.indexOf(e.text) >= 0).map(e => e.text);
    r.bankFails = fails.length; fails.forEach(f => errors.push('transf bank RM6.transf: ' + f));
    // کنترل‌های پیشین: اتحاد (G6 دورِ ۶) تبدیل نیست؛ مربع کردنِ معادله تبدیل است؛ دو جوابِ جدا با «،» زنجیره نیست
    r.ctl = await p.evaluate(() => [APP.liveTransf('n(n+2)+1 = (n+1)^2'), APP.liveTransf('دو طرف را مربع کردم: x+1 = 9'), APP.liveTransf('x = 3، y = 4')]);
    chk(J(r.ctl) === J([false, true, false]), 'transf controls: identity no, squaring yes, two separate answers no ' + J(r.ctl));
  });

  /* ---------- win: B·D4 s14 ---------- */
  await section('win', async () => {
    const r = info.win = {};
    r.q = await p.evaluate(() => {
      const t0 = Date.parse('2026-10-15T08:00:00Z'), day2 = Date.parse('2026-10-16T08:00:00Z'); let n = 0;
      const M = (role, text, base, acts) => ({ role, text, at: new Date(base + (n++) * 60e3).toISOString(), actions: acts || [] });
      const msgs = [
        M('user', 'آمار رو دو بار افتادم. همه‌ی فرمول‌ها رو حفظم، ولی سر جلسه نمی‌دونم کدومو کجا بزنم. یه جزوه‌ی خلاصه بده.', t0),
        M('ai', 'جزوه را می‌دهم، ولی اول: سرِ جلسه، دقیقهٔ اولی که مسئله را می‌خوانی، چه می‌کنی؟', t0),
        M('user', 'عددها رو از صورت سؤال برمی‌دارم و دنبال فرمولی می‌گردم.', t0),
        M('ai', 'یک تمرین: وزنِ بسته‌ها میانگینِ ۹۸۸ و انحرافِ معیارِ ۲۰ دارد. احتمالِ این‌که یک بستهٔ تصادفی کمتر از ۹۶۰ گرم باشد چقدر است؟', t0),
        M('user', 'خب: t = (960-988)/(20/√25) = -7. جواب ۱.۳.', t0),
        M('ai', 'پیش از این‌که «۱.۳» را جواب بدانی: احتمال می‌تواند از ۱ بیشتر شود؟', t0),
        M('user', 'سلام، یه مسئله‌ی دیگه از تمرین‌ها حل کردم. اول مجهول رو نوشتم: «احتمال اینکه میانگین ۳۶ دانشجو بیشتر از ۱۵.۵ باشه، با میانگین جامعه ۱۵ و انحراف معیار ۳». بعد z = 1 و جواب ۰.۱۶. تموم.', day2),
        M('ai', 'آفرین که اول مجهول را نوشتی. نتیجه را در یک حالتِ خاص وارسی کن — اگر به‌جای ۳۶ نفر یک نفر بود، احتمال بیشتر می‌شد یا کمتر؟', day2),
        M('user', 'اگه یه نفر بود انحراف معیار ۳ می‌شد نه ۰.۵، پس احتمال بیشتر. درسم اینه: اول مجهول، آخر وارسی.', day2),
        M('ai', 'ثبتش کردم.', day2, ['chat_solved'])];
      const se = { id: APP.uid('achat'), type: 'achat', title: 't', msgs, steps: [], files: [], reports: [] };
      APP.S.put(se);
      const x = APP.liveCreate('میانگینِ ۳۶ دانشجو', 'احتمال اینکه میانگین ۳۶ دانشجو بیشتر از ۱۵.۵ باشه، با میانگین جامعه ۱۵ و انحراف معیار ۳', 'find', { by: 'assistant', sess: se.id, origin: { type: 'chat', id: se.id }, nat: 'objective' });
      const pid = typeof x === 'string' ? x : (x && x.p ? x.p.id : x.id);
      const rr = APP.S.get('eprob_' + pid); rr.created = new Date(Date.parse(msgs[9].at) + 1000).toISOString(); APP.S.put(rr, { keepTime: true });
      const pg = APP.S.get('eprog_' + pid), so = pg.solve = pg.solve || {}, L = so.live = so.live || {};
      L.state = 'solved'; L.stateAt = rr.created; L.chat = { sess: se.id, at: rr.created }; so.b = { 1: { done: true, from: 'chat', state: 'solved', use: 'اول مجهول، آخر وارسی', at: rr.created } }; APP.S.put(pg);
      se.lprob = pid; se.lprobAt = rr.created; APP.S.put(se);
      return APP.liveChatQItems(pid).map(i => i.t);
    });
    chk(!r.q.some(t => /۹۶۰|دقیقهٔ اولی|۱\.۳|۱٫۳/.test(t)) && r.q.some(t => /به‌جای ۳۶ نفر یک نفر/.test(t)), 'win B·D4 s14: the chat-closed problem\'s list starts at her first statement of it (day 2), not the session start — no parcel-exercise questions ' + J(r.q));
  });

  /* ---------- full: INF7 ---------- */
  await section('full', async () => {
    const r = info.full = {};
    const x = await mkLive({ steps: [] });
    const full = 'در مسئلهٔ عملی «کافی» را تقریبی تعیین می‌کند. حالا پیش از گامِ واقعی با گزینهٔ ج: چه پیش‌بینی می‌کنی و چقدر مطمئنی؟';
    await p.evaluate(([pid, full]) => { const t0 = Date.now() - 3600e3; const se = { id: APP.uid('achat'), type: 'achat', title: 't', msgs: [{ role: 'ai', text: full, at: new Date(t0).toISOString(), actions: [] }, { role: 'user', text: 'فکر کنم ۸۰٪ مطمئنم', at: new Date(t0 + 60e3).toISOString() }], steps: [], files: [], reports: [], lprob: pid }; APP.S.put(se); }, [x.pid, full]);
    await p.evaluate((pid) => APP.go('lprob', pid, 'exec'), x.pid); await W(200); await p.click('main .lp-solved'); await W(250);
    const v = await p.evaluate(() => [...document.querySelectorAll('#lpBBest option')].map(o => o.value).filter(v => /^chat:/.test(v))[0]);
    r.btn = await p.locator('main .lp-bfullbtn').count();
    if (v) { await p.selectOption('#lpBBest', v); await W(100); }
    if (r.btn) { await p.click('main .lp-bfullbtn'); await W(150); }
    r.text = await p.evaluate(() => { const b = document.querySelector('main .lp-bfull'); return b && !b.hidden ? b.textContent : null; });
    chk(r.btn === 1 && v && r.text && r.text.indexOf('در مسئلهٔ عملی «کافی» را تقریبی تعیین می‌کند') >= 0 && r.text.indexOf('با گزینهٔ ج') >= 0, 'full INF7: «پیامِ کامل» next to #lpBBest shows the whole source message of the chosen 💬 option ' + J(r));
  });

  /* ---------- plain: RM2a/INF2 ---------- */
  await section('plain', async () => {
    const r = info.plain = {};
    r.had = await p.evaluate(() => !!(APP.MATH && APP.MATH.toPlain));
    if (!r.had) await p.evaluate(STUB);
    r.q = await opts({ msgs: [{ text: 'در هر چیدمان، $p_1+p_2+p_3$ حداکثر چند است؟' }] });
    chk(r.q.length === 1 && !/\$/.test(r.q[0]) && /p₁\+p₂\+p₃/.test(r.q[0]), 'plain A·X1 s10 / D·D7 s38: a 💬 option is plain Unicode via APP.MATH.toPlain ' + J(r));
    if (!r.had) await p.evaluate(() => { delete APP.MATH.toPlain; });
    // ساختاری: هر چاهکِ گزینهٔ a38 از toPlain می‌گذرد
    const src = fs.readFileSync(path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), 'app', 'a38_live.js'), 'utf8');
    chk(/function toPlain\(x\) \{ return A\.MATH && A\.MATH\.toPlain \? A\.MATH\.toPlain\(x\) : x; \}/.test(src) && /t: toPlain\(e\.g \?/.test(src), 'plain structural: chatItems options call A.MATH && A.MATH.toPlain');
  });

  console.log(JSON.stringify(info).slice(0, 12000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
