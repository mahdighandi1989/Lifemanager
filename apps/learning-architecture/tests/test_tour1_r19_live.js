// تورِ پولیا (دستهٔ ۱، دورِ ۱۹ ِ اصلاح، ۲۰۲۶-۱۰-۱۷) — DECISIONS_R19، بخشِ «live» (a38_live.js).
//  قاعدهٔ مالک: ریشه، نه وصله — هر بخش هم جملهٔ عینیِ سناریو (round19X/<sid>) را دارد و هم **همهٔ** واریانت‌های همان سازوکار در بانکِ مستقل
//  (tests/variants/VARIANTS_R19.json = tour1_polya/VARIANTS_R19.json، نوشتهٔ عاملی که کد را ندیده؛ LLA_VARIANTS = مسیرِ دیگر).
//  step  RN2a — نتیجهٔ گامی که در گفت‌وگو گزارش شد همان دم روی گام می‌نشیند: فرمِ اجرا از پیش پر و «از گفت‌وگو»؛ خطِ مربی و دروازه آن را گزارش‌شده می‌دانند
//        (B·D2 s19، C·X3 s23) + بانکِ RN2.step.
//  gate  RN2b — هر نوعِ موردِ پیش از «حل شد» (کمکی، شهودی، گامِ واقعی) واژهٔ خودش را دارد؛ هشدارِ «مسئلهٔ کمکی» فقط وقتی کمکی هست؛ گامِ واقعیِ باز فقط
//        هنگامِ بستن یا گزارش (B·D1 s19، C·X2 s22/s23) + بانکِ RN2.gate.
//  q     RN5 — گزینهٔ q جای خودش را در ترتیبِ گفت‌وگو نگه می‌دارد؛ تکهٔ توضیحیِ q با q می‌ماند (A·D2 s02، D·5 s31) + بانکِ RN5.q.
//  reg   RN6c (سویِ گزینه) — یادداشتِ حدس با ضمیرِ گفت‌وگو: «حدسِ شما» در گفت‌وگوی «شما» (B·D5 s12/s13) + بانکِ RN6.edge (138، 145).
//  kit   RN2c/INF11 — حدسِ گفت‌وگو جعبهٔ حدس را پنهان نمی‌کند؛ از پیش پر است تا اطمینان و آزمون پر شوند (D·1 s30).
//  math  INF13 — فرمول در نماهای ذخیره‌شده هم: فهرستِ گام‌ها، سرِ صفحه (صورت)، خلاصهٔ فهم (B s11).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R19.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R19.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)) || path.join(__dirname, 'variants', 'VARIANTS_R19.json');
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
  chk(bank.length >= 140, 'bank: VARIANTS_R19 must be loaded (got ' + bank.length + ' from ' + BANK + ')');
  const bankRes = {};
  const runBank = async (rc, n, fn) => {
    const E = B(rc); chk(E.length === n, rc + ': ' + n + ' bank entries, got ' + E.length);
    const res = bankRes[rc] = { pass: 0, fail: [] };
    for (const e of E) { let r = { ok: false, got: 'unmapped' }; try { r = await fn(e); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.message || ex).split('\n')[0] }; }
      if (r.ok) res.pass++; else { res.fail.push(e.kind + ' «' + e.text.slice(0, 70) + '» — ' + e.expect.slice(0, 90) + ' got ' + J(r.got).slice(0, 500)); } }
    res.fail.forEach(f => errors.push(rc + ': ' + f));
  };

  /* ---------- مسئلهٔ زنده در مرحلهٔ اجرا با گام‌ها، مسئلهٔ کمکی، گامِ شهودی، سشنِ بسته ---------- */
  const mkLive = (o) => p.evaluate((o) => {
    const now = new Date().toISOString();
    const pid0 = APP.liveCreate(o.title || ('دورِ ۱۹ ' + Math.random().toString(36).slice(2, 7)), o.st || 'می‌خواهم این کار را درست انجام دهم و نتیجه را ببینم', 'find', { by: 'user', nat: o.nat || 'practical' });
    const id = typeof pid0 === 'string' ? pid0 : (pid0 && pid0.p ? pid0.p.id : pid0.id);
    const pg = APP.S.get('eprog_' + id); pg.solve = pg.solve || {}; const so = pg.solve;
    so.u = { 1: { done: true, at: now, one: o.one || 'می‌خواهم ببینم چه می‌شود', u: o.u || 'نتیجهٔ کار', dl: [], c: '', type: 'find', nat: o.nat || 'practical' } };
    so.live = so.live || {}; const L = so.live; ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; });
    L.plan = { t: o.plan || 'گام‌به‌گام انجامش می‌دهم و هر بار نتیجه را می‌سنجم', at: now };
    (o.steps || []).forEach((t, i) => { const x = typeof t === 'string' ? { text: t } : t; const st = Object.assign({ id: 'st' + (i + 1) + Math.random().toString(36).slice(2, 5), text: x.text, pred: x.pred == null ? 'خوب پیش می‌رود' : x.pred, conf: 60, due: x.due || APP.today(), at: now }, x.closed ? { closed: true, out: Object.assign({ at: now, d: APP.today(), done: x.closed, what: 'شد', match: '', prog: 'کمی' }, x.kind ? { kind: x.kind } : {}) } : {});
      if (x.intuitive) st.intuitive = true; if (x.proof) st.proof = x.proof; L.steps.push(st); });
    (o.aux || []).forEach(t => L.aux.push({ k: 'simpler', t, bridge: 'از نتیجه‌اش به اصلی برمی‌گردم', at: now }));
    if (o.closing) L.closing = { at: now };
    if (o.state) { L.state = o.state; L.stateAt = now; }
    APP.S.put(pg);
    let sid = null;
    if (o.chat) { const t0 = Date.now() - 3600e3; let n = 0; const msgs = o.chat.map(m => ({ role: m.role, text: m.text, at: new Date(t0 + (n++) * 60e3).toISOString(), actions: [] }));
      const se = { id: APP.uid('achat'), type: 'achat', title: 't', msgs, steps: [], files: [], reports: [], lprob: o.chatFor === 'other' ? 'pb_none_other' : id }; APP.S.put(se); sid = se.id; }
    const reps = (o.reps || []).map(rp => APP.liveStepReport(id, Object.assign({}, rp, { step: rp.step === undefined ? 1 : rp.step })));
    return { pid: id, sid, reps, steps: L.steps.map(s => s.id) };
  }, o);
  const stepsOf = (pid) => p.evaluate((pid) => APP.S.get('eprog_' + pid).solve.live.steps.map(s => ({ text: s.text, closed: !!s.closed, out: s.out || null })), pid);
  const execView = async (pid) => { await p.evaluate((pid) => APP.go('lprob', pid, 'exec'), pid); await W(220);
    return p.evaluate(() => { const f = document.querySelector('main .lp-out'), v = (id) => { const e = document.getElementById(id); return e ? e.value : null; };
      return { form: !!f, done: v('lpODone'), what: v('lpOWhat'), match: v('lpOMatch'), tag: f ? (f.querySelector('.lp-ochat') || {}).textContent || '' : '', text: f ? f.textContent : '', cur: (document.querySelector('main .lp-cur') || {}).textContent || '',
        list: [...document.querySelectorAll('main .lp-steps li')].map(li => ({ t: li.textContent, mx: li.querySelectorAll('bdi.mx').length })) }; }); };
  const solve = async (pid) => { await p.evaluate((pid) => APP.go('lprob', pid, 'exec'), pid); await W(200); await p.click('main .lp-solved'); await W(220);
    return p.evaluate(() => ({ asked: [...document.querySelectorAll('main .lp-closestep')].map(x => x.querySelector('p').textContent), intro: (document.querySelector('main .lp-close > p') || {}).textContent || '', state: APP.state.sub })); };
  /* بلوکِ «# مسئلهٔ زندهٔ این سشن» برای پیامِ msg در سشنِ بسته به pid */
  const prompt = (pid, msg, sid) => p.evaluate(([pid, msg, sid]) => { APP.state = APP.state || {}; const keep = APP.state.view; APP.state.view = 'today';
    const s = (sid && APP.S.get(sid)) || { id: 'achat_r19p', lprob: pid, msgs: [] }; s.lprob = pid;
    const out = APP.ASSIST.promptHooks.map(f => { try { return f(s, msg) || ''; } catch (e) { return 'ERR ' + e.message; } }).filter(x => /^# مسئلهٔ زندهٔ این سشن/.test(x)).join('\n');
    APP.state.view = keep; return out; }, [pid, msg, sid || null]);
  const mindExec = () => p.evaluate(() => { const R = APP.MIND && APP.MIND.phases ? APP.MIND.phases() : null; const x = R && (R.rows || []).filter(y => y.id === 'exec')[0]; const s = x && x.src && x.src.live; return s ? { n: s.n, k: s.k } : { n: 0, k: 0 }; });
  const OK = (rep) => /^✓/.test(String(rep || ''));
  const SELF_REC = /نتیجه را خودش در صفحه ثبت می‌کند/;
  const GATE = /پیش از «حل شد» باز مانده/;

  /* ---------- step: RN2a ---------- */
  await section('step', async () => {
    const r = info.step = {};
    // B·D2 s19 (عینِ سناریو): «مهمونی بود، یه کیلو هم اضافه کردم» — گزارشِ پذیرفته‌شده باید همان دم روی فرم و فهرست بنشیند
    const m0 = await mindExec();
    const x = await mkLive({ title: 'رژیمِ s19', steps: ['این هفته و هفتهٔ بعد شامِ سبک می‌خورم'], chat: [{ role: 'ai', text: 'این هفته چطور گذشت؟' }, { role: 'user', text: 'مهمونی بود، یه کیلو هم اضافه کردم' }],
      reps: [{ done: 'no', what: 'مهمونی بود، یه کیلو هم اضافه کردم', msg: 1 }] });
    const v = await execView(x.pid), m1 = await mindExec(), pr = await prompt(x.pid, 'خب حالا چی؟', x.sid);
    r.s19 = { rep: x.reps, v, m0, m1, pr: pr.split('\n').filter(l => /گام/.test(l)) };
    chk(OK(x.reps[0]), 'step B·D2 s19: the validated chat report is accepted ' + J(x.reps));
    chk(v.form && v.done === 'no' && /یه کیلو/.test(v.what || '') && /از گفت‌وگو/.test(v.tag), 'step B·D2 s19: the execution form shows her chat report prefilled and tagged «از گفت‌وگو» (not empty fields) ' + J(v));
    chk(m1.n - m0.n === 1 && m1.k === m0.k, 'step B·D2 s19: the mind card books ONE execution failure at once ' + J({ m0, m1 }));
    chk(!SELF_REC.test(pr) && !/شهودی/.test(pr), 'step C·X3: the coach line never asks her to record a reported result on the page ' + J(r.s19.pr));
    // C·X3 s23 (عینِ سناریو): کیک
    const y = await mkLive({ title: 'کیکِ s23', steps: ['فردا کیک رو با قالبِ ۲۵×۳۵ می‌پزم'], chat: [{ role: 'user', text: 'دیروز پختمش، خیلی خوب شد.' }], reps: [{ done: 'yes', what: 'پختمش، خیلی خوب شد', match: 'yes', msg: 1 }] });
    const py = await prompt(y.pid, 'حالا بعدش چی کار کنم؟', y.sid);
    chk(!SELF_REC.test(py) && /گزارش/.test(py), 'step C·X3 s23: the prompt treats the step as reported (no «نتیجه را خودش در صفحه ثبت می‌کند») ' + J(py.split('\n').filter(l => /گام/.test(l))));

    await runBank('RN2.step', 18, async (e) => {
      const T = e.text;
      if (/^open step s1 «فردا با صاحبخونه/.test(T)) { const x = await mkLive({ steps: [{ text: 'فردا با صاحبخونه حرف می‌زنم', due: '2099-01-01' }], chat: [{ role: 'user', text: 'دیروز باهاش صحبت کردم، قبول کرد' }], reps: [{ step: 1, done: 'yes', what: 'قبول کرد', msg: 1 }] });
        const v = await execView(x.pid), pr = await prompt(x.pid, 'خب؟', x.sid), g = await solve(x.pid); return { ok: OK(x.reps[0]) && v.form && v.done === 'yes' && /قبول کرد/.test(v.what) && /از گفت‌وگو/.test(v.tag) && !SELF_REC.test(pr) && g.asked.length === 0, got: { rep: x.reps, v, g } }; }
      if (/^open step «این هفته شام سبک»/.test(T)) { const m0 = await mindExec(); const x = await mkLive({ steps: ['این هفته شام سبک'], chat: [{ role: 'user', text: 'عروسی بود، نیم کیلو اضافه کردم' }], reps: [{ done: 'no', what: 'نیم کیلو اضافه', msg: 1 }] });
        const v = await execView(x.pid), m1 = await mindExec(); return { ok: OK(x.reps[0]) && v.form && v.done === 'no' && /نیم کیلو/.test(v.what) && /از گفت‌وگو/.test(v.tag) && m1.n - m0.n === 1 && m1.k === m0.k, got: { v, m0, m1 } }; }
      if (/^open step «کیک را می‌پزم»/.test(T)) { const x = await mkLive({ steps: ['کیک را می‌پزم'], chat: [{ role: 'user', text: 'دیروز کیک را پختم و خوب درآمد' }], reps: [{ done: 'yes', msg: 1 }] });
        const s0 = await stepsOf(x.pid), g = await solve(x.pid), s1 = await stepsOf(x.pid); return { ok: OK(x.reps[0]) && s0[0].out && s0[0].out.done === 'yes' && s0[0].out.from === 'chat' && g.asked.length === 0 && s1[0].closed && s1[0].out.from === 'chat', got: { s0, g, s1 } }; }
      if (/^open step «فرم ثبت نام»/.test(T)) { const x = await mkLive({ steps: ['فرمِ ثبت‌نام را پر می‌کنم'], chat: [{ role: 'user', text: 'فرم ثبت نام رو پر کردم و فرستادمش' }], reps: [{ step: 'فرم ثبت نام', done: 'yes', msg: 'فرم ثبت نام رو پر کردم' }] });
        const v = await execView(x.pid); return { ok: OK(x.reps[0]) && v.form && v.done === 'yes' && /از گفت‌وگو/.test(v.tag), got: { rep: x.reps, v } }; }
      if (/^open step «تمرین‌های فصل ۳»/.test(T)) { const x = await mkLive({ steps: ['تمرین‌های فصل ۳ را حل می‌کنم'], chat: [{ role: 'user', text: 'نصفشو حل کردم، بقیه‌ش مونده' }], reps: [{ done: 'part', msg: 1 }] });
        const v = await execView(x.pid), s = await stepsOf(x.pid), pr = await prompt(x.pid, 'باشه', x.sid); return { ok: OK(x.reps[0]) && v.form && v.done === 'part' && /نصفشو/.test(v.what) && /از گفت‌وگو/.test(v.tag) && !s[0].closed && !SELF_REC.test(pr), got: { v, s } }; }
      if (/^open step «معادله‌ی دوم/.test(T)) { const x = await mkLive({ nat: 'objective', steps: ['معادله‌ی دوم رو حل کن'], chat: [{ role: 'user', text: 'حلش کردم، y=۳ درمیاد' }], reps: [{ done: 'yes', what: 'y=۳', msg: 1 }] });
        const v = await execView(x.pid), pr = await prompt(x.pid, 'خب', x.sid), isM = await p.evaluate(() => APP.MATH.has('y=۳'));
        /* نمایشِ فرمول با a39 است (RN4 ِ رفع‌کنندهٔ ریاضی): a38 متن را از APP.MATH.nodes می‌گذراند؛ اگر a39 «y=۳» را فرمول نشناسد، همان متن */
        return { ok: OK(x.reps[0]) && v.form && /y=۳/.test(v.what) && v.list.some(li => /y/.test(li.t) && (li.mx > 0 || !isM)) && !SELF_REC.test(pr) && /گزارش/.test(pr), got: { list: v.list, pr: pr.split('\n').filter(l => /گام/.test(l)) } }; }
      if (/^after an applied chat report/.test(T)) { const m0 = await mindExec(); const x = await mkLive({ steps: ['با مدیر حرف می‌زنم'], chat: [{ role: 'user', text: 'با مدیر حرف زدم، گفت فکر می‌کنه' }], reps: [{ done: 'yes', what: 'گفت فکر می‌کنه', msg: 1 }] });
        await execView(x.pid); await p.fill('#lpOWhat', 'گفت هفتهٔ بعد جواب می‌دهد'); await p.selectOption('#lpOMatch', 'part').catch(() => {}); await W(80);
        await p.selectOption('#lpOProg', { index: 2 }); await p.selectOption('#lpOWant', { index: 1 }); await W(60); await p.click('main .lp-outsave'); await W(200);
        const s = await stepsOf(x.pid), m1 = await mindExec(); return { ok: s[0].closed && s[0].out.what === 'گفت هفتهٔ بعد جواب می‌دهد' && s[0].out.from !== 'chat' && m1.n - m0.n === 1, got: { s, m0, m1 } }; }
      if (/^open step s2 «به مامانم/.test(T)) { const x = await mkLive({ steps: ['گامِ اول را برمی‌دارم', 'به مامانم زنگ می‌زنم'], chat: [{ role: 'user', text: 'به مادرم زنگ زدم، گفت آخر هفته میاد' }], reps: [{ step: 2, done: 'yes', msg: 1 }] });
        const pr = await prompt(x.pid, 'خب؟', x.sid), ln = pr.split('\n').filter(l => /مامانم/.test(l)); return { ok: OK(x.reps[0]) && ln.length > 0 && ln.every(l => !/گامِ واقعیِ باز/.test(l) && !SELF_REC.test(l)), got: ln }; }
      if (/^two open steps s1 s2/.test(T)) { const x = await mkLive({ steps: ['اولی را انجام می‌دهم', 'دومی را انجام می‌دهم'], chat: [{ role: 'user', text: 'دومی رو انجام دادم' }], reps: [{ step: 2, done: 'yes', msg: 1 }] });
        const s = await stepsOf(x.pid); return { ok: OK(x.reps[0]) && !s[0].out && !s[0].closed && s[1].out && s[1].out.from === 'chat', got: s }; }
      const neg = async (text, rep, steps) => { const x = await mkLive({ steps: steps || ['با صاحبخونه حرف می‌زنم'], chat: [{ role: 'user', text }], reps: [Object.assign({ done: 'yes', msg: 1 }, rep || {})] });
        const s = await stepsOf(x.pid), v = await execView(x.pid); return { ok: !OK(x.reps[0]) && !s[0].out && !/از گفت‌وگو/.test(v.tag) && !v.done, got: { rep: x.reps, s, v } }; };
      if (/^open step «با صاحبخونه حرف می‌زنم» ‖ U: فردا/.test(T)) return neg('فردا می‌خوام باهاش حرف بزنم');
      if (/^open step «بانک»/.test(T)) return neg('قراره شنبه برم بانک', {}, ['به بانک می‌روم']);
      if (/مسئله‌ی قبلی کیک/.test(T)) return neg('توی اون مسئله‌ی قبلی کیک رو پختم', {}, ['شام سبک می‌خورم']);
      if (/اگه بپزمش/.test(T)) return neg('اگه بپزمش احتمالاً خوب درمیاد', {}, ['کیک را می‌پزم']);
      if (/دارم انجامش میدم/.test(T)) return neg('دارم انجامش میدم');
      if (/^open step ‖ U: انجام دادم ‖ A: \(no coach_state\)/.test(T)) { const x = await mkLive({ steps: ['کار را انجام می‌دهم'], chat: [{ role: 'user', text: 'انجام دادم' }] }); const s = await stepsOf(x.pid), v = await execView(x.pid); return { ok: !s[0].out && !v.done && !/از گفت‌وگو/.test(v.tag), got: { s, v } }; }
      if (/هنوز جواب نداده/.test(T)) return neg('بهش گفتم، هنوز جواب نداده', { what: 'قبول کرد' });
      if (/^step already closed/.test(T)) { const x = await mkLive({ steps: [{ text: 'اون کار', closed: 'yes' }], chat: [{ role: 'user', text: 'اون کارو کردم' }], reps: [{ done: 'yes', msg: 1 }] }); const s = await stepsOf(x.pid); return { ok: !OK(x.reps[0]) && /بسته/.test(x.reps[0]) && s[0].out.what === 'شد', got: { rep: x.reps, s } }; }
      if (/فرض کن انجامش داده‌ای/.test(T)) { const x = await mkLive({ steps: ['کار را انجام می‌دهم'], chat: [{ role: 'ai', text: 'فرض کن انجامش داده‌ای؛ بعد چه؟' }, { role: 'user', text: 'باشه' }], reps: [{ done: 'yes', msg: 1 }] }); const s = await stepsOf(x.pid); return { ok: !OK(x.reps[0]) && !s[0].out, got: { rep: x.reps, s } }; }
      return { ok: false, got: 'unmapped' };
    });
  });

  /* ---------- gate: RN2b ---------- */
  await section('gate', async () => {
    const r = info.gate = {};
    const gl = (pr) => pr.split('\n').filter(l => GATE.test(l)).join('\n');
    // B·D1 s19 (عینِ سناریو): گامِ رژیم «شهودیِ ثابت‌نشده» و «مسئلهٔ کمکی حل شد ≠ …» خوانده می‌شد
    const x = await mkLive({ title: 'رژیم', steps: ['این هفته و هفتهٔ بعد شامِ سبک می‌خورم'], chat: [{ role: 'user', text: 'مهمونی بود، یه کیلو هم اضافه کردم' }] });
    const p19 = await prompt(x.pid, 'مهمونی بود، یه کیلو هم اضافه کردم', x.sid);
    r.s19 = p19.split('\n').filter(l => /گام|کمکی/.test(l));
    chk(!/شهودی/.test(p19) && !/مسئلهٔ کمکی حل شد/.test(p19), 'gate B·D1 s19: a real diet step is never «گامِ شهودیِ ثابت‌نشده» and there is no aux caveat ' + J(r.s19));
    // C·X2 s22 (عینِ سناریو): نوبتِ عادی، گامِ واقعیِ باز
    const y = await mkLive({ title: 'سرایدار', steps: ['فردا ساعت ۱۰ با سرایدار صحبت می‌کنم'] });
    const p22 = await prompt(y.pid, 'به نظرت کی ممکنه بوده باشه؟');
    chk(!GATE.test(p22) && !/مسئلهٔ کمکی حل شد/.test(p22), 'gate C·X2 s22: no gate line in an ordinary turn with an open real step ' + J(gl(p22)));
    // کارتِ بستن: مقدمه به نوعِ موردها
    const z = await mkLive({ steps: ['فردا ساعت ۹ به اداره زنگ می‌زنم'] }); const g = await solve(z.pid);
    chk(g.asked.length === 1 && !/کمکی|شهود|«می‌بینی»/.test(g.intro), 'gate: the closing card intro speaks only of the kinds present (a real step: no aux/intuitive words) ' + J(g));

    await runBank('RN2.gate', 16, async (e) => {
      const T = e.text;
      if (/^auxiliary problem solved, main problem open; she clicks/.test(T)) { const x = await mkLive({ aux: ['حالتِ سادهٔ n=2'], closing: true, nat: 'objective' }); const pr = gl(await prompt(x.pid, 'حل شد')); return { ok: /حالتِ سادهٔ n=2/.test(pr) && (pr.match(/مسئلهٔ کمکی حل شد ≠ مسئلهٔ اصلی حل شد/g) || []).length === 1, got: pr }; }
      if (/^proof problem with one step marked intuitive/.test(T)) { const x = await mkLive({ nat: 'objective', steps: [{ text: 'زاویه‌ها برابرند چون شکل متقارن است', closed: 'yes', kind: 'proof', intuitive: true }] }); const pr = gl(await prompt(x.pid, 'حل شد')); return { ok: /گامِ شهودیِ ثابت‌نشدهٔ «زاویه/.test(pr) && !/کمکی/.test(pr), got: pr }; }
      if (/^practical problem, open real step «فردا ساعت ۹/.test(T)) { const x = await mkLive({ steps: ['فردا ساعت ۹ به اداره زنگ می‌زنم'], closing: true }); const pr = gl(await prompt(x.pid, 'تموم شد دیگه')); return { ok: /گامِ (?:واقعیِ )?باز/.test(pr) && /اداره/.test(pr) && !/شهود|کمکی/.test(pr), got: pr }; }
      if (/^open real step «پیاده‌روی عصرها»/.test(T)) { const x = await mkLive({ steps: ['پیاده‌روی عصرها'] }); const pr = gl(await prompt(x.pid, 'امروز پیاده‌روی نرفتم')); return { ok: /پیاده‌روی عصرها/.test(pr) && /گامِ واقعیِ باز/.test(pr) && !/شهود|کمکی/.test(pr), got: pr }; }
      if (/^at closing: aux problem solved AND an intuitive/.test(T)) { const x = await mkLive({ nat: 'objective', aux: ['مسئلهٔ کمکیِ مثلثِ قائم'], closing: true, steps: [{ text: 'پس دو ضلع برابرند', closed: 'yes', kind: 'proof', intuitive: true }] }); const pr = gl(await prompt(x.pid, 'حل شد')); return { ok: /مثلثِ قائم/.test(pr) && /گامِ شهودیِ ثابت‌نشدهٔ «پس دو ضلع/.test(pr) && (pr.match(/مسئلهٔ کمکی حل شد ≠/g) || []).length === 1, got: pr }; }
      if (/^aux problem added but not solved/.test(T)) { const x = await mkLive({ aux: ['حالتِ ساده‌تر'], closing: true }); const pr = gl(await prompt(x.pid, 'حل شد')); return { ok: /حالتِ ساده‌تر/.test(pr) && /اگر/.test(pr), got: pr, note: 'judged: the page has no record of whether the aux was solved — the caveat is conditional («اگر …»)' }; }
      if (/^open intuitive step in a geometry proof; look-back/.test(T)) { const x = await mkLive({ nat: 'objective', state: 'solved', steps: [{ text: 'نیم‌ساز از مرکز می‌گذرد', closed: 'yes', kind: 'proof', intuitive: true }] }); const pr = gl(await prompt(x.pid, 'فکر کنم تمومه')); return { ok: /نیم‌ساز از مرکز/.test(pr) && /شهودی/.test(pr), got: pr }; }
      if (/^at closing: aux solved, real step already reported/.test(T)) { const x = await mkLive({ aux: ['حالتِ کوچک‌تر'], closing: true, steps: ['با همسایه حرف می‌زنم'], chat: [{ role: 'user', text: 'با همسایه حرف زدم، قبول کرد' }], reps: [{ done: 'yes', msg: 1 }] }); const pr = gl(await prompt(x.pid, 'حل شد', x.sid)); return { ok: OK(x.reps[0]) && /حالتِ کوچک‌تر/.test(pr) && !/همسایه/.test(pr), got: pr }; }
      if (/^practical problem, open real step «فردا ساعت ۱۰/.test(T)) { const x = await mkLive({ steps: ['فردا ساعت ۱۰ با سرایدار صحبت می‌کنم'] }); const pr = await prompt(x.pid, 'به نظرت از کجا شروع کنم؟'); return { ok: !GATE.test(pr), got: gl(pr) }; }
      if (/^diet problem, open real step; any turn/.test(T)) { const x = await mkLive({ steps: ['شام سبک می‌خورم'] }); const a = await prompt(x.pid, 'امروز شام سبک خوردم'); await p.evaluate((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.live.closing = { at: new Date().toISOString() }; APP.S.put(pg); }, x.pid); const c = await prompt(x.pid, 'حل شد'); return { ok: !/شهودی/.test(a + c), got: gl(a + '\n' + c) }; }
      if (/^practical problem with no auxiliary problem; closing/.test(T)) { const x = await mkLive({ steps: ['گامِ عملی را برمی‌دارم'], closing: true }); const pr = await prompt(x.pid, 'حل شد'); return { ok: !/مسئلهٔ کمکی حل شد ≠ مسئلهٔ اصلی حل شد/.test(pr), got: gl(pr) }; }
      if (/^all steps closed, no aux, no intuitive step; closing/.test(T)) { const x = await mkLive({ steps: [{ text: 'گام', closed: 'yes' }], closing: true }); const pr = await prompt(x.pid, 'حل شد'); return { ok: !GATE.test(pr), got: gl(pr) }; }
      if (/^open real step whose outcome was already applied/.test(T)) { const x = await mkLive({ steps: ['نامه را می‌فرستم'], chat: [{ role: 'user', text: 'نامه رو فرستادم' }], reps: [{ done: 'yes', msg: 1 }] }); const pr = await prompt(x.pid, 'خب؟', x.sid); return { ok: OK(x.reps[0]) && !SELF_REC.test(pr), got: pr.split('\n').filter(l => /نامه/.test(l)) }; }
      if (/^open real step «شام سبک»; she writes «امروز خیلی خسته‌م»/.test(T)) { const x = await mkLive({ steps: ['شام سبک'] }); const pr = await prompt(x.pid, 'امروز خیلی خسته‌م'); return { ok: !GATE.test(pr), got: gl(pr) }; }
      if (/^intuitive step later marked proved/.test(T)) { const x = await mkLive({ nat: 'objective', closing: true, steps: [{ text: 'دو مثلث هم‌نهشت‌اند', closed: 'yes', kind: 'proof', proof: 'ض‌ز‌ض' }] }); const pr = await prompt(x.pid, 'حل شد'); return { ok: !/شهودی/.test(pr), got: gl(pr) }; }
      if (/^aux solved, main still being worked mid-turn/.test(T)) { const x = await mkLive({ aux: ['حالتِ n=1'] }); const pr = await prompt(x.pid, 'حالا با n=2 امتحان می‌کنم'); return { ok: !/حل شد ≠/.test(pr), got: gl(pr) }; }
      return { ok: false, got: 'unmapped' };
    });
  });

  /* ---------- q / reg: گزینه‌های 💬 ---------- */
  const opts = (spec) => p.evaluate((spec) => {
    const t0 = Date.parse('2026-10-17T08:00:00Z');
    const pid0 = APP.liveCreate('مسئلهٔ آزمونِ دورِ ۱۹ ' + Math.random().toString(36).slice(2, 7), 'صورتِ آزمونی برای گزینه‌های کدام پرسش کمک کرد', 'find', { by: 'user', nat: 'objective' });
    const id = typeof pid0 === 'string' ? pid0 : (pid0 && pid0.p ? pid0.p.id : pid0.id);
    const r = APP.S.get('eprob_' + id); r.created = new Date(t0 - 3600e3).toISOString(); APP.S.put(r, { keepTime: true });
    let n = 0; const msgs = (spec.msgs || []).map(m => { const a = { role: m.role || 'ai', text: m.text, at: new Date(t0 + (n++) * 60e3).toISOString(), actions: [] }; if (m.guess) a.guess = m.guess; return a; });
    if (!msgs.length || msgs[msgs.length - 1].role === 'ai') msgs.push({ role: 'user', text: 'باشه، فکر می‌کنم.', at: new Date(t0 + (n++) * 60e3).toISOString() });
    const se = { id: APP.uid('achat'), type: 'achat', title: 't', msgs, steps: [], files: [], reports: [], lprob: id }; if (spec.reg) se.coach = { reg: spec.reg };
    APP.S.put(se);
    const out = APP.liveChatQItems(id).map(x => x.t);
    APP.S.del(se.id);
    return out;
  }, spec);
  const NOTE = /\((حدسِ (?:تو|شما)): «(.*)»\)$/;
  const G = 'جواب ۱۲ است';
  const withQ = (aText, q, extra) => opts(Object.assign({ msgs: [{ role: 'user', text: 'حدسم اینه که ' + G }, { role: 'ai', text: aText, guess: q ? { text: G, q } : undefined }] }, extra || {}));
  const bare = (t) => t.replace(NOTE, '').trim();
  const has = (o, s) => bare(o).indexOf(s) >= 0;

  await section('q', async () => {
    const r = info.q = {};
    // A·D2 s02 (عینِ سناریو)
    const a = await opts({ msgs: [{ role: 'user', text: '۳.۲ از ۴ کمتره دیگه، پس جا نمیشه' }, { role: 'ai', text: 'درست است یا نه را نمی‌گویم — این حدسِ توست. حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟', guess: { text: '۳.۲ از ۴ کمتره دیگه، پس جا نمیشه', q: 'حدسی گفتی — چطور می‌آزمایی‌اش؟' } }] });
    r.s02 = a;
    const ia = a.findIndex(o => /می‌آزمایی‌اش/.test(o)), ib = a.findIndex(o => /ردش کند/.test(o));
    chk(ia >= 0 && ib >= 0 && (ia === ib || ia < ib) && NOTE.test(a[ia]), 'q A·D2 s02: the q option keeps its place before «کدام حالتِ خاص … ردش کند؟» (conversation order) ' + J(a));
    // D·5 s31 (عینِ سناریو)
    const d = await opts({ msgs: [{ role: 'user', text: 'فکر کنم بهترین تعداد ۴ تاست' }, { role: 'ai', text: 'خودت پیدایش کردی: فرضِ «دو عدد» در صورت نبود. «۴ جزء بهترین است» حدس است، نه نتیجه — درست یا نادرستش را نمی‌گویم. چطور می‌آزمایی‌اش؟ با کدام وارسی یا حالتِ خاص؟', guess: { text: 'بهترین تعداد ۴ تاست', q: 'چطور می‌آزمایی‌اش؟' } }] });
    r.s31 = d;
    chk(d.length === 1 && /چطور می‌آزمایی‌اش؟ با کدام وارسی یا حالتِ خاص؟/.test(d[0]) && NOTE.test(d[0]), 'q D·5 s31: «چطور می‌آزمایی‌اش؟ با کدام وارسی یا حالتِ خاص؟» stays ONE option (no orphan) ' + J(d));

    await runBank('RN5.q', 16, async (e) => {
      const A0 = e.text.replace(/^A:\s*/, '').replace(/\s*\(بدون guess در coach_state\)\s*$/, ''), C = e.context || '';
      let q = null; const mq = /q=«([^»]+)»/.exec(C);
      if (mq) q = mq[1]; else if (/q=that question/.test(C)) q = A0; else if (/q=first/.test(C)) q = A0.split(/(?<=[؟?])\s+/)[0]; else if (/q=second/.test(C)) q = A0.split(/(?<=[؟?])\s+/)[1];
      if (/q text not in the message/.test(C)) q = 'حدست را با کدام حالت می‌آزمایی؟';
      const o = await withQ(A0, q, /register شما/.test(C) ? { reg: 'shoma' } : {});
      const notes = o.filter(x => NOTE.test(x));
      const ex = []; let m; const re = /«([^»]+)»/g; const E = e.expect.replace(/\(حدسِ (?:تو|شما): …\)/g, ''); while ((m = re.exec(E))) ex.push(m[1].replace(/\s*$/, ''));
      if (/^ONE option/.test(e.expect)) { const ok = o.length === 1 && (!ex[0] || has(o[0], ex[0].replace(/\s*\(.*$/, ''))) && (/no note|\bno\b.*note/.test(e.expect) ? !notes.length : /with the note|حدسِ/.test(e.expect) ? notes.length === 1 && (/حدسِ شما/.test(e.expect) ? /حدسِ شما/.test(o[0]) : true) : true) && (!/including «/.test(e.expect) || has(o[0], ex[0])); return { ok, got: o }; }
      if (/^options in order|^order kept|^\[/.test(e.expect)) { const want = ex.length ? ex : []; const parts = /^\[/.test(e.expect) ? want : want;
        const idx = parts.map(s => o.findIndex(x => has(x, s.replace(/…$/, '').replace(/\s*\(.*$/, '').trim())));
        const ordered = idx.every(i => i >= 0) && idx.every((v, i) => i === 0 || v > idx[i - 1]);
        const nq = q ? o.findIndex(x => has(x, q)) : -1; return { ok: ordered && notes.length === 1 && nq >= 0 && NOTE.test(o[nq]), got: { o, idx } }; }
      /* داوری (DECISIONS_R19 RN5 بر بانک مقدم است): بی q رشتهٔ پرسش‌ها همان یک گزینه می‌ماند (رفتارِ R14–R18)؛ بریدن فقط گردِ q — پس این‌جا فقط «بی یادداشت» سنجیده می‌شود */
      if (/no «حدسِ» note|no note/.test(e.expect)) return { ok: !notes.length && (/two options/.test(e.expect) && q ? o.length === 2 : true) && (/one option/.test(e.expect) ? o.length === 1 : true), got: o };
      if (/two complete questions are split/.test(e.expect)) { const i1 = o.findIndex(x => has(x, 'حدست را چطور می‌آزمایی؟')), i2 = o.findIndex(x => has(x, 'داده‌ها چه هستند؟')); return { ok: o.length === 2 && i1 === 0 && i2 === 1 && NOTE.test(o[0]) && !NOTE.test(o[1]), got: o }; }
      if (/fragment «مثلاً طولِ ضلع؟» stays/.test(e.expect)) { const i1 = o.findIndex(x => has(x, 'داده‌ها چیست؟')), i2 = o.findIndex(x => has(x, 'حدست را چطور می‌آزمایی؟')); return { ok: i1 >= 0 && i2 > i1 && has(o[i1], 'مثلاً طولِ ضلع؟') && !has(o[i2], 'مثلاً') && NOTE.test(o[i2]) && !NOTE.test(o[i1]), got: o }; }
      if (/is a complete question → separate second option/.test(e.expect)) { const i1 = o.findIndex(x => has(x, 'چطور می‌آزمایی‌اش؟')), i2 = o.findIndex(x => has(x, 'کدام شرط')); return { ok: i1 === 0 && i2 === 1 && NOTE.test(o[0]) && !NOTE.test(o[1]), got: o }; }
      if (/^no reorder; note on «مجهول چیست؟»/.test(e.expect)) { const i1 = o.findIndex(x => has(x, 'مجهول چیست؟')), i2 = o.findIndex(x => has(x, 'اگر n=۲ چه؟')); return { ok: i1 === 0 && i2 === 1 && NOTE.test(o[0]) && !NOTE.test(o[1]), got: o }; }
      if (/^one option, no note/.test(e.expect)) return { ok: o.length === 1 && !notes.length, got: o };
      return { ok: false, got: 'unmapped ' + J(o) };
    });
  });

  await section('reg', async () => {
    const r = info.reg = {};
    // B·D5 s12/s13 (عینِ سناریو): گفت‌وگوی «شما» — یادداشت «(حدسِ تو: …)» بود
    const sh = await opts({ reg: 'shoma', msgs: [{ role: 'user', text: 'به نظرم رمهب‌ستان جوابشه' }, { role: 'ai', text: 'حدسِ خوبی است. چطور آن را می‌آزمایید؟', guess: { text: 'رمهب‌ستان', q: 'چطور آن را می‌آزمایید؟' } }] });
    r.shoma = sh;
    chk(sh.length && /\(حدسِ شما: «رمهب‌ستان»\)$/.test(sh[sh.length - 1]), 'reg B·D5: in a «شما» conversation the note reads «(حدسِ شما: …)» ' + J(sh));
    const to = await opts({ reg: 'to', msgs: [{ role: 'user', text: 'به نظرم رمهب‌ستان جوابشه' }, { role: 'ai', text: 'حدسِ خوبی است. چطور می‌آزمایی‌اش؟', guess: { text: 'رمهب‌ستان', q: 'چطور می‌آزمایی‌اش؟' } }] });
    chk(to.length && /\(حدسِ تو: «رمهب‌ستان»\)$/.test(to[to.length - 1]), 'reg 145: in a «تو» conversation the note stays «(حدسِ تو: …)» ' + J(to));
    const E = B('RN6.edge').filter(e => e.role === 'assistant');
    chk(E.length === 2, 'reg: 2 assistant-side RN6.edge entries ' + E.length);
    bankRes['RN6.edge(a38)'] = { pass: (sh.length && /حدسِ شما/.test(sh[sh.length - 1]) ? 1 : 0) + (to.length && /حدسِ تو/.test(to[to.length - 1]) ? 1 : 0), of: E.length };
  });

  /* ---------- kit: RN2c / INF11 ---------- */
  await section('kit', async () => {
    const r = info.kit = {};
    // D·1 s30 (عینِ سناریو): حدسی که در گفت‌وگو گفت به solve.g[1] با conf:null و test:"" نوشته شد و جعبهٔ حدس ناپدید شد
    const pid = await p.evaluate(() => { const p0 = APP.liveCreate('چند راه برای بالا رفتن از ۳۰ پله', 'به چند روش می‌شود از ۳۰ پله بالا رفت اگر هر بار ۱ یا ۲ پله برویم؟', 'find', { by: 'user', nat: 'objective' }); const id = typeof p0 === 'string' ? p0 : (p0 && p0.p ? p0.p.id : p0.id);
      const pg = APP.S.get('eprog_' + id) || { id: 'eprog_' + id, type: 'eprog' }; pg.solve = pg.solve || {}; pg.solve.g = { 1: { guess: 'فکر کنم یه عدد فیبوناچیه', conf: null, test: '', testRes: '', ifRef: '', before: true, seen: false, at: new Date().toISOString(), from: 'chat', sess: 'x', by: 'model' } };
      pg.solve.live = pg.solve.live || {}; pg.solve.live.uDraft = { type: 'find', nat: 'objective', natSet: true, one: 'شمردنِ راه‌های بالا رفتن از ۳۰ پله با گام‌های ۱ و ۲', why: 'کنجکاوم', wholeOk: true, u: '', dl: [], c: '', guess: '', conf: '', test: '' }; APP.S.put(pg); return id; });
    await p.evaluate((pid) => APP.go('lprob', pid, 'u'), pid); await W(250);
    const v = await p.evaluate(() => ({ g: (document.getElementById('lpGuess') || {}).value, conf: !!document.getElementById('lpConf'), test: !!document.getElementById('lpTest'), ifRef: !!document.getElementById('lpIfRef'), want: !!document.getElementById('lpGWant'), tag: [...document.querySelectorAll('main .lp-gchat')].map(x => x.textContent).join(' ') }));
    r.s30 = v;
    chk(v.g === 'فکر کنم یه عدد فیبوناچیه' && v.conf && v.test && v.ifRef && v.want && /گفت‌وگو/.test(v.tag), 'kit D·1 s30: the guess kit stays shown, prefilled with the chat guess and marked as from the chat ' + J(v));
    // پس از پر کردنِ اطمینان و آزمون، حدس همان می‌ماند و کالیبراسیون دارد
    const ok = await p.evaluate((pid) => { const pg = APP.S.get('eprog_' + pid); const g = pg.solve.g[1]; g.conf = 70; g.test = 'برای ۴ پله دستی می‌شمارم'; APP.S.put(pg); APP.go('lprob', pid, 'u'); return true; }, pid); await W(200);
    const v2 = await p.evaluate(() => ({ g: !!document.getElementById('lpGuess') }));
    chk(ok && !v2.g, 'kit: once confidence and test are filled, the kit is not asked again ' + J(v2));
  });

  /* ---------- math: INF13 ---------- */
  await section('math', async () => {
    const r = info.math = {};
    const has = await p.evaluate(() => !!(APP.MATH && APP.MATH.has && APP.MATH.has('x^2 + 1 = 10')));
    chk(has, 'math: APP.MATH is loaded (a39)');
    // B s11 (ارتقای لازم): فهرستِ گام‌ها، سرِ صفحه، خلاصهٔ فهم
    const x = await mkLive({ nat: 'objective', st: 'ثابت کن x^2 + 1 = 10 فقط دو جواب دارد', one: 'معادلهٔ x^2 + 1 = 10 را حل کن', u: 'جواب‌های x^2 + 1 = 10', steps: [{ text: 'x^2 = 9 پس x = 3 یا x = -3', closed: 'yes' }], plan: 'اول x^2 = 9 را می‌گیرم' });
    await p.evaluate((pid) => APP.go('lprob', pid, 'exec'), x.pid); await W(250);
    const v = await p.evaluate(() => ({ head: document.querySelectorAll('main .phead .lead bdi.mx').length, steps: document.querySelectorAll('main .lp-steps li bdi.mx').length,
      usum: document.querySelectorAll('main .lp-usum bdi.mx').length }));
    r.v = v;
    chk(v.head > 0, 'math INF13: the statement header renders the formula ' + J(v));
    chk(v.steps > 0, 'math INF13: the step list renders the formula ' + J(v));
    chk(v.usum > 0, 'math INF13: the saved understanding summary renders the formula ' + J(v));
  });

  info.bankRes = Object.fromEntries(Object.entries(bankRes).map(([k, v]) => [k, { pass: v.pass, fail: (v.fail || []).length, of: v.of }]));
  console.log(JSON.stringify(info, null, 1).slice(0, 6000));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  if (errors.length) process.exitCode = 1;
  await b.close();
})();
