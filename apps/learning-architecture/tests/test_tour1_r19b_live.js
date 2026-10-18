// تورِ پولیا (دستهٔ ۱، دورِ ۱۹b ِ زیرساخت، ۲۰۲۶-۱۰-۱۷) — DECISIONS_R19b، بخشِ «live» (a38_live.js + دکمهٔ ✏️ ِ حبابِ a26 + a40_dossier.js).
//  قاعدهٔ مالک: هر سازوکار با **همهٔ** واریانت‌های بانکِ مستقلِ خودش (tests/variants/VARIANTS_R19b.json = tour1_polya/VARIANTS_R19b.json، نوشتهٔ عاملی که
//  کد را ندیده؛ LLA_VARIANTS = مسیرِ دیگر) سنجیده می‌شود:
//  retract  INF15 سویِ صفحه — گزارشِ مدل coach_state.retract {msg, what, fix} را صفحه می‌سنجد (تکه در پیامِ پیشینِ خودِ او، اصلاح در پیامِ کنونی، نشانهٔ
//           اصلاحِ اول‌شخص، اصلاح ≠ همان مقدار) و هر رکوردِ ساخته از آن پیام را برمی‌گرداند و اصلاح را می‌نشاند؛ پیشین در تاریخچه «اصلاح شد ⇐» (۲۸ ورودی).
//  edit     INF15 ✏️ — «✏️ اصلاح» فقط روی حبابِ خودِ کاربر؛ ذخیره ⇒ برگرداندنِ مستقیم (بی مدل) + نوبتِ «[اصلاحِ پیامِ قبلی] …»؛ یکسان/خالی/انصراف ⇒ هیچ (۲۰).
//  dossier  INF16 — «📜 پروندهٔ کامل»: ترتیبِ زمانی، تاریخچه، پیام‌های منبع، اثرِ کارنامه، فرمول، فهرستِ همهٔ کارها، برون‌بُرد، سه ورودی، فقط‌خواندنی (۲۱).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R19b.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R19b.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)) || path.join(__dirname, 'variants', 'VARIANTS_R19b.json');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const J = (x) => JSON.stringify(x);
  const W = (ms) => p.waitForTimeout(ms || 90);
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => { APP.S.loaded = true; window.__rem = []; window.__prompts = [];
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async (x) => { window.__rem.push(x); return { ok: true }; }, unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user) => { window.__prompts.push(String(user)); if (window.__aiDown) throw new Error('مدل در دسترس نیست'); return { text: JSON.stringify({ reply: 'باشه، اصلاح را دیدم.', status: 'related', actions: [] }) }; }; });
  const bank = JSON.parse(fs.readFileSync(BANK, 'utf8'));
  const B = (rc) => bank.filter(e => e.rc === rc);
  info.bank = { file: BANK, n: bank.length };
  chk(bank.length >= 80, 'bank: VARIANTS_R19b must be loaded (got ' + bank.length + ' from ' + BANK + ')');
  const bankRes = {};
  const runBank = async (rc, n, specs, fn) => {
    const E = B(rc); chk(E.length === n, rc + ': ' + n + ' bank entries, got ' + E.length);
    const res = bankRes[rc] = { pass: 0, fail: [] };
    for (let i = 0; i < E.length; i++) { const e = E[i]; let r = { ok: false, got: 'unmapped' }; try { r = await fn(e, specs[i], i); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.message || ex).split('\n')[0] }; }
      if (r.ok) res.pass++; else res.fail.push('#' + i + ' ' + e.kind + ' «' + e.text.slice(0, 60) + '» — ' + e.expect.slice(0, 90) + ' got ' + J(r.got).slice(0, 600)); }
    res.fail.forEach(f => errors.push(rc + ': ' + f));
  };
  /* تاریخِ روزِ هفتهٔ بعدی (شنبه = ۰ ِ هفتهٔ فارسی) */
  const nextWd = (pw) => { const d = new Date(); d.setUTCHours(12, 0, 0, 0); for (let k = 1; k <= 7; k++) { const x = new Date(d.getTime() + k * 864e5); if ((x.getUTCDay() + 1) % 7 === pw) return x.toISOString().slice(0, 10); } };
  const addD = (iso, n) => new Date(new Date(iso + 'T12:00:00Z').getTime() + n * 864e5).toISOString().slice(0, 10);

  /* مسئلهٔ زنده + سشنِ بسته به آن، با پیام‌های بانک («U: … ‖ A: …») و رکوردهای ساخته از پیامِ کاربرِ شمارهٔ ui (۰‌پایه) */
  const setup = (o) => p.evaluate((o) => {
    const now = new Date().toISOString(), S = APP.S;
    const pid0 = APP.liveCreate(o.title || ('دورِ ۱۹b ' + Math.random().toString(36).slice(2, 7)), o.st || 'می‌خواهم این مسئله را درست حل کنم و نتیجه را ببینم', 'find', { by: 'user', nat: o.nat || 'practical' });
    const pid = typeof pid0 === 'string' ? pid0 : (pid0 && pid0.p ? pid0.p.id : pid0.id);
    const t0 = Date.now() - 3600e3; let n = 0;
    const msgs = (o.chat || '').split(' ‖ ').filter(Boolean).map(x => { const m = /^\s*([UA]):\s*([\s\S]*)$/.exec(x); return { role: m && m[1] === 'A' ? 'ai' : 'user', text: m ? m[2].trim() : x.trim(), at: new Date(t0 + (n++) * 60e3).toISOString(), actions: [] }; });
    (o.extra || []).forEach(t => msgs.push({ role: 'user', text: t, at: new Date(t0 + (n++) * 60e3).toISOString(), actions: [] }));
    const se = { id: APP.uid('achat'), type: 'achat', title: o.sessTitle || 'گفت‌وگوی آزمون', msgs, steps: [], files: [], reports: [], lprob: pid }; S.put(se);
    const U = msgs.filter(m => m.role === 'user'), mid = (i) => APP.liveMsgId(U[i]), src = (i) => ({ sess: se.id, mid: mid(i) });
    const pg = S.get('eprog_' + pid); pg.solve = pg.solve || {}; const so = pg.solve; so.live = so.live || {}; const L = so.live; ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; });
    const R = o.rec || {};
    if (R.dl || R.c || R.u || R.uDone) so.u = { 1: { done: true, at: now, one: 'کلِ مسئله', u: R.u ? R.u[1] : 'مجهول', dl: (R.dl || []).map((x, i) => ({ id: 'd' + (i + 1), t: x[1], src: x[0] == null ? undefined : src(x[0]) })), c: R.c ? R.c[1] : '', type: 'find', nat: 'practical', from: 'live', src: Object.assign({}, R.c ? { c: src(R.c[0]) } : {}, R.u ? { u: src(R.u[0]) } : {}) } };
    if (so.u && so.u[1]) { so.u[1].d = so.u[1].dl.map(x => x.t).join(' · '); L.plan = L.plan || { t: 'گام‌به‌گام', at: now }; }
    if (R.draftU) L.uDraft = { type: 'find', nat: 'practical', one: '', u: R.draftU[1], dl: [{ id: 'd1', t: '' }], c: '', src: { u: src(R.draftU[0]) } };
    if (R.g) so.g = { 1: { guess: R.g[1], conf: null, test: '', testRes: '', ifRef: '', before: true, seen: false, at: U[R.g[0]].at, from: 'chat', sess: se.id, by: 'model', src: src(R.g[0]) } };
    if (R.plan) { L.plan = { t: R.plan[1], at: now, src: src(R.plan[0]) }; if (R.planStart) L.plan.start = R.planStart; }
    (R.steps || []).forEach((x, i) => { const st = { id: 'st' + (i + 1) + Math.random().toString(36).slice(2, 5), text: x.text, pred: 'خوب پیش می‌رود', conf: 60, due: x.due || APP.today(), at: now };
      if (x.src != null) st.src = src(x.src); if (x.closed) { st.closed = true; st.out = { at: now, d: APP.today(), done: x.closed, what: 'شد', match: 'yes', prog: 'کمی' }; } if (x.remind) st.remind = { hour: 9, at: now }; L.steps.push(st); });
    if (!L.plan && (R.steps || []).length) L.plan = { t: 'گام‌به‌گام', at: now };
    if (R.chat) L.chat = { sess: se.id, at: U[R.chat[0]].at, solution: R.chat[1], mid: mid(R.chat[0]) };
    if (R.verdict) so.b = { 1: { verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkBy: 'msgs', chkMsgs: [R.verdict], at: now, from: 'chat', state: 'solved' } };
    S.put(pg);
    const reps = (R.reps || []).map(rp => APP.liveStepReport(pid, Object.assign({}, rp)));
    return { pid, sid: se.id, mids: U.map((m, i) => mid(i)), reps };
  }, o);
  const snap = (pid, sid) => p.evaluate(([pid, sid]) => {
    const pg = APP.S.get('eprog_' + pid), so = pg.solve, L = so.live, g = so.g && so.g[1], u1 = so.u && so.u[1], b = so.b && so.b[1], se = APP.S.get(sid);
    return { g: g ? { t: g.guess, h: (g.fixHist || []).length, wd: !!g.withdrawn, hist: (g.fixHist || []).map(x => x.old) } : null, gCount: so.g ? Object.keys(so.g).length : 0,
      dl: u1 ? u1.dl.map(x => x.t) : [], dlH: u1 ? (u1.fixHist || []).length : 0, dlHist: u1 ? (u1.fixHist || []).map(x => x.old) : [], c: u1 ? u1.c : '', u: u1 ? u1.u : '', d: u1 ? u1.d : '',
      draftU: L.uDraft ? L.uDraft.u : null, draftH: L.uDraft ? (L.uDraft.fixHist || []).length : 0,
      steps: L.steps.map(st => ({ due: st.due, closed: !!st.closed, out: st.out ? { done: st.out.done, match: st.out.match, what: st.out.what, pending: !!st.out.pending } : null, h: (st.fixHist || []).length })),
      plan: L.plan ? { t: L.plan.t, start: L.plan.start || '', h: (L.plan.fixHist || []).length } : null,
      chat: L.chat ? { s: L.chat.solution, h: (L.chat.fixHist || []).length } : null, verdict: b ? { v: b.verdict, sup: !!b.superseded } : null,
      msgs: (se.msgs || []).map(m => ({ role: m.role, text: m.text, corr: (m.corr || []).length, th: (m.textHist || []).length })), retracts: (L.retracts || []).length };
  }, [pid, sid]);
  const mindExec = () => p.evaluate(() => { const R = APP.MIND && APP.MIND.phases ? APP.MIND.phases() : null; const x = R && (R.rows || []).filter(y => y.id === 'exec')[0]; const s = x && x.src && x.src.live; return s ? { n: s.n, k: s.k } : { n: 0, k: 0 }; });
  const retractChat = (sid, rt, cur) => p.evaluate(([sid, rt, cur]) => { const r = APP.liveRetractChat(sid, rt, cur); return { ok: r.ok, err: r.err || '', n: (r.changed || []).length, note: r.note || '', mid: r.mid || '' }; }, [sid, rt, cur]);
  const hookOut = (sid) => p.evaluate((sid) => { const s = APP.S.get(sid); return APP.ASSIST.promptHooks.map(f => { try { return f(s, '') || ''; } catch (e) { return ''; } }).filter(x => /^# اصلاحِ پیامِ قبلی/.test(x)).join('\n'); }, sid);
  const lastU = (e) => { const U = e.text.split(' ‖ ').filter(x => /^\s*U:/.test(x)); return U[U.length - 1].replace(/^\s*U:\s*/, ''); };
  const has = APP => true;

  /* ================= INF15.retract (۲۸) ================= */
  const TUE = nextWd(3), FRI = nextWd(6);
  const RS = [
    { rec: { g: [0, '۲^n'] }, rt: { msg: 'جواب ۲^n هست', what: 'guess', fix: '۲^n − ۱' }, ok: (s, r, x) => s.g.t === '۲^n − ۱' && s.g.h === 1 && s.g.hist[0] === '۲^n' && /۲\^n/.test(x.hook) },
    { rec: { dl: [[0, 'طول مستطیل ۱۲'], [0, 'عرض ۵']] }, rt: { msg: 'عرضش ۵', what: 'fact', fix: '۹' }, ok: (s, r, x) => J(s.dl) === J(['طول مستطیل ۱۲', 'عرض ۹']) && s.dlH === 1 && s.dlHist[0] === 'عرض ۵' && s.msgs.filter(m => m.role === 'user').slice(1, 3).every((m, i) => m.th === 0) && /۵/.test(x.hook) && /۹/.test(x.hook) },
    { rec: { plan: [0, 'سه‌شنبه با صاحبخونه حرف بزنم'], steps: [{ text: 'سه‌شنبه با صاحبخونه حرف بزنم', src: 0, due: TUE, remind: true }] }, rt: { msg: 'سه‌شنبه با صاحبخونه حرف بزنم', what: 'plan', fix: 'پنج‌شنبه' },
      ok: (s, r, x) => s.steps[0].due === addD(TUE, 2) && s.steps[0].h >= 1 && s.plan.t === 'پنج‌شنبه با صاحبخونه حرف بزنم' && s.plan.h === 1 && x.rem.some(y => y.due_date === addD(TUE, 2)) },
    { rec: { steps: [{ text: 'گامِ اول', closed: 'yes' }, { text: 'گامِ دوم' }], reps: [{ step: 2, done: 'yes', match: 'yes', what: 'جواب داد', msg: 1 }] }, rt: { msg: 'گام دوم رو انجام دادم و جواب داد', what: 'step', fix: 'جواب نداد، فقط شروعش کردم' },
      ok: (s, r, x) => s.steps[1].out && s.steps[1].out.done === 'part' && s.steps[1].out.match === 'no' && s.steps[1].h === 1 && x.m1.k < x.m0.k },
    { rec: { chat: [0, 'جواب نهایی ۸۹'], verdict: 'با n کوچک' }, rt: { msg: 'جواب نهایی ۸۹ است', what: 'ans', fix: '۵۵' }, ok: (s) => s.chat.s === 'جواب نهایی ۵۵' && s.chat.h === 1 && s.verdict.v !== 'verified' && s.verdict.sup },
    { rec: { dl: [[0, 'S = πr']] }, rt: { msg: 'S = πr', what: 'fact', fix: 'S = πr²' }, ok: (s, r, x) => s.dl[0] === 'S = πr²' && s.dlH === 1 && r.mid === x.mids[0] && x.math },
    { rec: { draftU: [0, 'سرعت متوسط'] }, rt: { msg: 'مجهول سرعت متوسطه', what: 'form', fix: 'زمان کل' }, ok: (s, r, x) => s.draftU === 'زمان کل' && s.draftH === 1 && x.tag === true },
    { rec: { c: [0, 'عددا مثبت باشن'] }, rt: { msg: 'عددا مثبت باشن', what: 'said', fix: 'عددا صحیح باشن' }, ok: (s) => s.c === 'عددا صحیح باشن' && s.dlH === 1 },
    { rec: { dl: [[0, 'مبلغ وام ۲۰۰ میلیون تومان'], [0, 'قسط ماهانه ۸ میلیون']] }, rt: { msg: 'مبلغ وام ۲۰۰ میلیون', what: 'fact', fix: '۱۲۰ میلیون' }, ok: (s) => J(s.dl) === J(['مبلغ وام ۱۲۰ میلیون تومان', 'قسط ماهانه ۸ میلیون']) && s.dlH === 1 },
    { rec: { plan: [0, 'روزی دو ساعت درس بخونم'], planStart: '2026-10-18' }, rt: { msg: 'روزی دو ساعت درس بخونم', what: 'plan', fix: 'یک ساعت' }, ok: (s) => s.plan.t === 'روزی یک ساعت درس بخونم' && s.plan.start === '2026-10-18' && s.plan.h === 1 },
    { rec: { g: [0, 'سرایدار کلید رو برداشته'] }, rt: { msg: 'سرایدار کلید رو برداشته', what: 'guess', fix: 'همسایه‌ی طبقه‌ی دوم' }, ok: (s) => s.g.t === 'همسایه‌ی طبقه‌ی دوم کلید رو برداشته' && s.g.h === 1 },
    { rec: {}, rt: { msg: 'جمعه بهت خبر می‌دم', what: 'plan', fix: 'شنبه‌ی بعد' }, ok: (s, r, x) => r.ok && x.ev && x.ev.what === 'plan' && x.ev.frag === 'جمعه بهت خبر می‌دم' && x.ev.fix === 'شنبه‌ی بعد' && x.shift === addD(FRI, 1) },
    { rec: { steps: [{ text: 'حلِ معادلهٔ اول' }], reps: [{ step: 1, done: 'yes', match: 'yes', what: 'x = 3 به دست اومد', msg: 1 }] }, rt: { msg: 'x = 3 به دست اومد', what: 'step', fix: 'x = ۷' }, ok: (s) => s.steps[0].out && s.steps[0].out.what === 'x = ۷ به دست اومد' && s.steps[0].out.done === 'yes' && s.steps[0].h === 1 },
    { rec: { dl: [[0, 'تا محل کار ۴۰ دقیقه راهه']] }, rt: { msg: '۴۰ دقیقه راهه', what: 'fact', fix: '۴۵ دقیقه' }, ok: (s, r, x) => s.dl[0] === 'تا محل کار ۴۵ دقیقه راهه' && r.mid === x.mids[0] },
    { rec: { g: [0, '۱۲۰'], dl: [[0, '۵'], [0, '۴']] }, rt: { msg: 'داده‌ها ۵ و ۴ ان', what: 'fact', fix: '۵ و ۳' }, ok: (s) => J(s.dl) === J(['۵', '۳']) && s.g.t === '۱۲۰' && s.g.h === 0 && s.gCount === 1 && s.dlH === 1 },
    /* منفی‌ها: هر گزارشِ ساختگیِ محتملِ مدل را صفحه رد می‌کند؛ رکوردها دست نمی‌خورند */
    { rec: {}, rt: { msg: 'کلید رو تو ماشین جا گذاشتم', what: 'fact', fix: 'تو ماشین' }, neg: true },
    { rec: {}, rt: { msg: 'علامت منفی رو جا انداختم', what: 'step', fix: 'علامت منفی' }, neg: true },
    { rec: { g: [0, 'فیبوناچی'] }, rt: { msg: 'جواب فیبوناچیه', what: 'guess', fix: 'با استقرا' }, neg: true, ok: (s) => s.g.t === 'فیبوناچی' && s.g.h === 0 },
    { rec: {}, rt: { msg: 'جواب ۲۰ هست', what: 'ans', fix: '۲۰' }, neg: true },
    { rec: { chat: [0, '۸۹'] }, rt: { msg: '۸۹', what: 'ans', fix: '۸۹' }, neg: true, ok: (s) => s.chat.s === '۸۹' && s.chat.h === 0 },
    { rec: { dl: [[0, 'عرض ۹']] }, rt: { msg: '۹', what: 'fact', fix: '۹' }, rt2: { msg: '۵', what: 'fact', fix: '۹' }, neg: true, ok: (s) => s.dl[0] === 'عرض ۹' && s.dlH === 0 },
    { rec: {}, rt: { msg: 'همون مسئله‌ی پله‌هاست', what: 'fact', fix: 'پله' }, neg: true },
    { rec: {}, rt: { msg: 'جواب ۵۵ میشه', what: 'ans', fix: '۵۵' }, neg: true },
    { rec: {}, rt: { msg: 'خسته', what: 'said', fix: 'خواب‌آلودم' }, nothing: true },
    { rec: {}, rt: { msg: '۵', what: 'fact', fix: '۷' }, neg: true },
    { rec: { g: [0, '۲^n'], plan: [1, 'برنامه‌م فردا'] }, rt: null, neg: true, cands: 2, ok: (s) => s.g.t === '۲^n' && s.plan.t === 'برنامه‌م فردا' },
    { rec: { dl: [[0, 'عرض ۵']] }, rt: { msg: 'عرضش ۵', what: 'fact', fix: '۹' }, neg: true, ok: (s) => s.dl[0] === 'عرض ۵' && s.dlH === 0 },
    { rec: { chat: [0, 'جواب ۵۵'] }, rt: { msg: '۵۵', what: 'ans', fix: '۵۵' }, neg: true, ok: (s) => s.chat.s === 'جواب ۵۵' && s.chat.h === 0 },
  ];
  await runBank('INF15.retract', 28, RS, async (e, sp, i) => {
    const x = await setup({ chat: e.text, rec: sp.rec, title: 'r19b-rt-' + i });
    const cur = lastU(e), m0 = await mindExec();
    await p.evaluate(() => { window.__ev = null; window.__off = APP.onRetract(ev => { window.__ev = { what: ev.what, frag: ev.frag, fix: ev.fix }; }); window.__rem = []; });
    if (i === 6) {   /* فیلدی که دستیار در نوبتِ همان پیام پر کرد ⇒ شناسهٔ همان پیام (برچسبِ منبع) */
      x.tag = await p.evaluate(([pid, sid, mid]) => { const J0 = (o) => JSON.stringify({ u: o.u, src: o.src, view: APP.state.view, sub: APP.state.sub }); const pg = APP.S.get('eprog_' + pid), L = pg.solve.live; L.uDraft = { type: 'find', nat: 'practical', natSet: true, one: 'کلِ مسئله', u: '', dl: [{ id: 'd1', t: '' }], c: '', wholeOk: true, prac: {}, nota: [{ s: '', m: '' }], figc: {} }; APP.S.put(pg); const AS = APP.ASSIST, rb = AS.busy; AS.busy = () => true; const se0 = APP.S.get(sid); AS._turnSession = { id: se0.id, msgs: se0.msgs.slice(0, 1) };   /* نوبتی که پاسخِ نخستین پیام بود */
        APP.go('lprob', pid, 'u'); return new Promise(res0 => setTimeout(res0, 250)).then(() => { const f = document.getElementById('lpUnk'); if (!f) { AS.busy = rb; return 'no field ' + J0({}); } f.value = 'سرعت متوسط'; f.dispatchEvent(new Event('input', { bubbles: true })); return new Promise(res => setTimeout(() => { AS.busy = rb; const d = APP.S.get('eprog_' + pid).solve.live.uDraft || {}; res(!!(d.src && d.src.u && d.src.u.mid === mid) && d.u === 'سرعت متوسط' ? true : J0(d)); }, 600)); }); }, [x.pid, x.sid, x.mids[0]]);
    }
    let r;
    if (sp.rt === null) { r = await p.evaluate((sid) => { const c = APP.liveRetractCheck(sid, null, null); return { ok: c.ok, err: c.err, cands: APP.liveRetractCands(sid) }; }, x.sid); }
    else r = await retractChat(x.sid, sp.rt, cur);
    let r2 = null; if (sp.rt2) r2 = await retractChat(x.sid, sp.rt2, cur);
    const s = await snap(x.pid, x.sid), m1 = await mindExec();
    const extra = Object.assign(x, { m0, m1, hook: await hookOut(x.sid), ev: await p.evaluate(() => { window.__off && window.__off(); return window.__ev; }), rem: await p.evaluate(() => window.__rem),
      shift: await p.evaluate((f) => APP.retractShiftDate(f, 'جمعه', 'شنبه‌ی بعد'), FRI),
      math: await p.evaluate((pid) => { APP.go('lprob', pid, 'exec'); const li = [...document.querySelectorAll('main .lp-usum li')].map(x => x.querySelectorAll('bdi.mx, math, .mx').length); return APP.MATH.has('S = πr²') ? li.some(n => n > 0) : true; }, x.pid) });
    if (sp.neg) { const okN = !r.ok && (!r2 || !r2.ok) && s.retracts === 0 && (!sp.cands || (r.cands || []).length >= sp.cands) && (!sp.ok || sp.ok(s, r, extra));
      return { ok: okN, got: { r, r2, s: { g: s.g, dl: s.dl, chat: s.chat, plan: s.plan, retracts: s.retracts } } }; }
    if (sp.nothing) return { ok: r.ok && r.n === 0 && /نگو چیزی را عوض کردی/.test(extra.hook), got: { r, hook: extra.hook } };
    return { ok: r.ok && sp.ok(s, r, extra), got: { tag: x.tag, r, s, ev: extra.ev, tag: x.tag, hook: extra.hook.slice(0, 200), m0, m1, shift: extra.shift, math: extra.math } };
  });

  /* ================= INF15.edit (۲۰) — از راهِ خودِ حباب ================= */
  const openSess = (sid) => p.evaluate((sid) => { APP.go('today'); APP.ASSIST.store('cur', sid); APP.ASSIST.toggle(true); APP.ASSIST.paint(); }, sid);
  const waitIdle = async () => { for (let k = 0; k < 60; k++) { const bz = await p.evaluate(() => APP.ASSIST.busy()); if (!bz) return; await W(100); } };
  /* ✏️ روی حبابِ کاربری که متنش old است؛ act: 'save' | 'cancel' */
  const edit = async (old, nt, act) => {
    const ok = await p.evaluate(([old]) => { const se = APP.ASSIST.cur(), m = se && se.msgs.filter(y => y.role === 'user' && y.text === old).pop(); if (!m) return 'no message'; const w = document.querySelector('.as-mtools[data-mid="' + APP.liveMsgId(m) + '"]'); const bub = w && w.closest('.as-msg'); if (!bub) return 'no bubble'; const bt = bub.querySelector('.as-editb'); if (!bt) return 'no ✏️'; bt.click(); return true; }, [old]);
    if (ok !== true) return ok; await W(80);
    return p.evaluate(([nt, act]) => { const ta = document.querySelector('.as-edtx'); if (!ta) return 'no editor'; const lab = document.querySelector('label[for="' + ta.id + '"]'); if (!lab && !ta.getAttribute('aria-label')) return 'unlabelled';
      ta.value = nt; ta.dispatchEvent(new Event('input', { bubbles: true })); const b = document.querySelector(act === 'cancel' ? '.as-edcancel' : '.as-edsave'); b.click(); return true; }, [nt, act || 'save']);
  };
  const corrTurns = (s) => s.msgs.filter(m => m.role === 'user' && /^\[اصلاحِ پیامِ قبلی\]/.test(m.text)).length;
  const bubbleNote = (txt0) => p.evaluate((t) => { const se = APP.ASSIST.cur(), m = se && se.msgs.filter(y => y.role === 'user' && y.text === t).pop(), w = m && document.querySelector('.as-mtools[data-mid="' + APP.liveMsgId(m) + '"]'), bub = w && w.closest('.as-msg'); return bub ? { note: (bub.querySelector('.as-corr') || {}).textContent || '', mx: bub.querySelectorAll('.as-tx bdi.mx, .as-tx math, .as-tx .mx').length } : null; }, txt0);
  const ES = [
    { chat: 'U: حدسم اینه که جواب ۲^n هست ‖ A: چرا؟', rec: { g: [0, '۲^n'] }, old: 'حدسم اینه که جواب ۲^n هست', nt: 'حدسم اینه که جواب ۲^n − ۱ هست', ok: (s, x) => s.g.t === '۲^n − ۱' && s.g.h === 1 && corrTurns(s) === 1 && /اصلاح شد ⇐/.test(x.note.note) && /۲\^?n/.test(x.note.note) },
    { chat: 'U: سه‌شنبه با صاحبخونه حرف می‌زنم ‖ A: باشه. ‖ U: یک ‖ A: . ‖ U: دو ‖ A: . ‖ U: سه ‖ A: . ‖ U: چهار ‖ A: . ‖ U: پنج ‖ A: .', rec: { steps: [{ text: 'سه‌شنبه با صاحبخونه حرف می‌زنم', src: 0, due: TUE, remind: true }] }, old: 'سه‌شنبه با صاحبخونه حرف می‌زنم', nt: 'چهارشنبه با صاحبخونه حرف می‌زنم',
      ok: (s, x) => s.steps[0].due === addD(TUE, 1) && s.steps[0].h >= 1 && x.rem.some(y => y.due_date === addD(TUE, 1)) && /سه‌شنبه/.test(x.note.note) },
    { chat: 'U: گام دوم انجام شد و جواب داد ‖ A: عالی.', rec: { steps: [{ text: 'گامِ اول', closed: 'yes' }, { text: 'گامِ دوم' }], reps: [{ step: 2, done: 'yes', match: 'yes', what: 'جواب داد', msg: 1 }] }, old: 'گام دوم انجام شد و جواب داد', nt: 'گام دوم رو هنوز انجام ندادم',
      ok: (s, x) => !s.steps[1].out && !s.steps[1].closed && s.steps[1].h === 1 && x.m1.n < x.m0.n },
    { chat: 'U: طول ۱۲ متر ‖ A: عرض؟', rec: { dl: [[0, 'طول ۱۲ متر']] }, old: 'طول ۱۲ متر', nt: 'طول ۱۵ متر', ok: (s, x) => s.dl[0] === 'طول ۱۵ متر' && /۱۲/.test(x.note.note) && /اصلاح شد ⇐[^)]*۱۲/.test(x.form) },
    { chat: 'U: مجهول سرعت متوسطه ‖ A: داده‌ها؟', rec: { draftU: [0, 'سرعت متوسط'] }, old: 'مجهول سرعت متوسطه', nt: 'مجهول زمان کله', ok: (s) => s.draftU === 'زمان کل' && s.draftH === 1 },
    { chat: 'U: جواب نهایی ۸۹ ‖ A: چک کن.', rec: { chat: [0, 'جواب نهایی ۸۹'], verdict: 'جواب نهایی ۸۹' }, old: 'جواب نهایی ۸۹', nt: 'جواب نهایی ۵۵', ok: (s) => s.chat.s === 'جواب نهایی ۵۵' && s.verdict.sup && s.verdict.v !== 'verified' && s.chat.h === 1 },
    { chat: 'U: عرض ۵ ‖ A: باشه.', rec: { dl: [[0, 'عرض ۵']] }, old: 'عرض ۵', nt: 'عرض ۹', then: ['عرض ۹', 'عرض ۸'], ok: (s) => s.dl[0] === 'عرض ۸' && J(s.dlHist) === J(['عرض ۵', 'عرض ۹']) && corrTurns(s) === 2 },
    { chat: 'U: فکر کنم کلید دستِ سرایداره ‖ A: چرا؟', rec: { g: [0, 'کلید دستِ سرایداره'] }, old: 'فکر کنم کلید دستِ سرایداره', nt: 'کلید رو دیروز خودم گم کردم', ok: (s) => s.g.wd && s.g.t === '' && s.g.hist[0] === 'کلید دستِ سرایداره' },
    { chat: 'U: S = πr ‖ A: واحد؟', rec: { dl: [[0, 'S = πr']] }, old: 'S = πr', nt: 'S = πr²', ok: (s, x) => s.dl[0] === 'S = πr²' && s.dlHist[0] === 'S = πr' && (x.mxOk) },
    { chat: 'U: حدسم اینه که جواب ۲^n هست ‖ A: چرا؟', rec: { g: [0, '۲^n'] }, old: 'حدسم اینه که جواب ۲^n هست', nt: 'حدسم اینه که جواب ۲^n − ۱ هست', aiDown: true, ok: (s) => s.g.t === '۲^n − ۱' && corrTurns(s) === 1 },
    { chat: 'U: جواب ۵۵ه ‖ A: خب.', rec: { chat: [0, 'جواب ۵۵ه'] }, old: 'جواب ۵۵ه', nt: 'جواب ۵۵ه', none: true },
    { chat: 'U: جواب ۵۵ه ‖ A: خب.', rec: { chat: [0, 'جواب ۵۵ه'] }, old: 'جواب ۵۵ه', nt: 'جواب ۵۵ه ', none: true },
    { chat: 'U: سلام، خسته‌ام ‖ A: سلام.', rec: {}, old: 'سلام، خسته‌ام', nt: 'سلام، خواب‌آلودم', ok: (s, x) => s.msgs[0].text === 'سلام، خواب‌آلودم' && s.msgs[0].th === 1 && s.retracts === 0 && corrTurns(s) === 1 && /نگو چیزی را عوض کردی/.test(x.prompt) },
    { chat: 'U: سلام ‖ A: سلام، چه کمکی؟', rec: {}, look: 'ai' },
    { chat: 'U: [سامانه: گام «۱» ثبت شد] ‖ A: ثبت شد.', rec: {}, look: 'sys' },
    { chat: 'U: جواب ۵۵ه ‖ A: خب.', rec: { chat: [0, 'جواب ۵۵ه'] }, old: 'جواب ۵۵ه', nt: 'جواب ۴۴ه', act: 'cancel', none: true },
    { chat: 'U: جواب ۵۵ه ‖ A: خب.', rec: { chat: [0, 'جواب ۵۵ه'] }, old: 'جواب ۵۵ه', nt: '   ', none: true, toast: true },
    { chat: 'U: حدسم ۲^n ‖ A: چرا؟', rec: { g: [0, '۲^n'] }, old: 'حدسم ۲^n', nt: 'حدسم ۲^n − ۱', ok: (s, x) => s.g.t === '۲^n − ۱' && s.g.hist[0] === '۲^n' && /۲\^?n/.test(x.dossierHist) },
    { chat: 'U: عرضش ۵ ‖ A: خب. ‖ U: عرض رو اشتباه گفتم، ۹ بود نه ۵', rec: { dl: [[0, 'عرض ۵']] }, pre: { rt: { msg: 'عرضش ۵', what: 'fact', fix: '۹' }, cur: 'عرض رو اشتباه گفتم، ۹ بود نه ۵' }, old: 'عرضش ۵', nt: 'عرضش ۹', ok: (s) => s.dl[0] === 'عرض ۹' && s.dlH === 1 && corrTurns(s) === 0 },
    { chat: 'U: عرض ۵ ‖ A: خب.', rec: { dl: [[0, 'عرض ۵']] }, other: true, old: 'عرض ۵', nt: 'عرض ۷', ok: (s, x) => s.dl[0] === 'عرض ۷' && x.otherS.dl[0] === 'عرض ۵' && x.otherS.dlH === 0 },
  ];
  await runBank('INF15.edit', 20, ES, async (e, sp, i) => {
    await waitIdle();
    const x = await setup({ chat: sp.chat, rec: sp.rec, title: 'r19b-ed-' + i });
    let other = null; if (sp.other) other = await setup({ chat: sp.chat, rec: sp.rec, title: 'r19b-ed-A-' + i });
    if (sp.pre) { const r0 = await retractChat(x.sid, sp.pre.rt, sp.pre.cur); if (!r0.ok) return { ok: false, got: 'pre ' + J(r0) }; }
    const before = await snap(x.pid, x.sid), m0 = await mindExec();
    await p.evaluate((d) => { window.__aiDown = !!d; window.__rem = []; window.__prompts = []; }, !!sp.aiDown);
    await openSess(x.sid); await W(120);
    if (sp.look) { const n = await p.evaluate((look) => look === 'ai' ? document.querySelectorAll('.as-msg.ai .as-editb').length : [...document.querySelectorAll('.as-msg')].filter(b => /\[سامانه/.test(b.textContent)).reduce((t, b) => t + b.querySelectorAll('.as-editb').length, 0), sp.look);
      const own = await p.evaluate(() => document.querySelectorAll('.as-msg.user .as-editb').length);
      return { ok: n === 0 && (sp.look === 'sys' || own >= 1), got: { n, own } }; }
    const toasts0 = 0;
    let r = await edit(sp.old, sp.nt, sp.act); if (r !== true) return { ok: false, got: r };
    const edOpen = await p.evaluate(() => !!document.querySelector('.as-edtx')), toastT = await p.evaluate(() => (document.getElementById('toasts') || {}).textContent || '');
    await W(150); await waitIdle();
    if (sp.then) { await openSess(x.sid); await W(80); r = await edit(sp.then[0], sp.then[1]); if (r !== true) return { ok: false, got: 'second ' + r }; await W(150); await waitIdle(); }
    await p.evaluate(() => { window.__aiDown = false; });
    const s = await snap(x.pid, x.sid), m1 = await mindExec();
    await openSess(x.sid); await W(80);
    const note = (await bubbleNote(sp.then ? sp.then[1] : sp.none ? sp.old : sp.nt)) || { note: '', mx: 0 };
    if (sp.none) { const same = J(s.chat) === J(before.chat) && corrTurns(s) === 0 && s.msgs.every((m, k) => m.th === 0 && m.text === before.msgs[k].text) && s.retracts === 0 && s.msgs.length === before.msgs.length;
      return { ok: same && (!sp.toast || (edOpen && /خالی/.test(toastT))), got: { s, edOpen, toastT: toastT.slice(-120) } }; }
    const extra = { note, m0, m1, rem: await p.evaluate(() => window.__rem), prompt: await p.evaluate(() => window.__prompts.join('\n')),
      form: await p.evaluate((pid) => { APP.go('lprob', pid, 'exec'); return (document.querySelector('main .lp-usum') || {}).textContent || ''; }, x.pid),
      mxOk: await p.evaluate(() => !APP.MATH.has('S = πr²')) || note.mx > 0,
      dossierHist: await p.evaluate((pid) => { APP.go('dossier', pid); return [...document.querySelectorAll('main .lp-dhist')].map(e => e.textContent).join(' | '); }, x.pid),
      otherS: other ? await snap(other.pid, other.sid) : null };
    return { ok: sp.ok(s, extra), got: { pr: (extra.prompt.match(/# اصلاحِ پیامِ قبلی[^\n]*\n[^\n]*/) || ['none ' + extra.prompt.length])[0].slice(0, 200), s: { g: s.g, dl: s.dl, dlHist: s.dlHist, steps: s.steps, chat: s.chat, verdict: s.verdict, draftU: s.draftU, corr: corrTurns(s), msgs0: s.msgs[0] }, note, m0, m1, form: extra.form.slice(0, 200), rem: extra.rem.map(y => y.due_date), dh: extra.dossierHist.slice(0, 200), other: extra.otherS && extra.otherS.dl } };
  });
  await p.evaluate(() => { APP.ASSIST.toggle(false); });

  /* ================= INF16.dossier (۲۱) ================= */
  const T = (hhmm, d) => { const x = new Date((d || new Date().toISOString().slice(0, 10)) + 'T00:00:00'); const [hh, mm] = hhmm.split(':').map(Number); x.setHours(hh, mm, 0, 0); return x.toISOString(); };
  /* مسئلهٔ «۲۰ پله» با رویدادهای زمان‌دار */
  const mkStairs = (o) => p.evaluate(([o, TT]) => {
    const S = APP.S, title = o.title || '۲۰ پله', pid0 = APP.liveCreate(title, 'به چند راه می‌شود ۲۰ پله را یکی‌یکی یا دوتادوتا بالا رفت؟', 'find', { by: 'user', nat: 'objective' });
    const pid = typeof pid0 === 'string' ? pid0 : (pid0.p ? pid0.p.id : pid0.id), r = S.get('eprob_' + pid); r.created = TT.s0; S.put(r);
    const se = { id: APP.uid('achat'), type: 'achat', title: 'گفت‌وگوی پله‌ها', msgs: [{ role: 'user', text: 'مجهول تعداد راه‌هاست', at: TT.m1, actions: [] }, { role: 'ai', text: 'داده‌ها؟', at: TT.m1b, actions: [] }, { role: 'user', text: 'حدسم ۲^n', at: TT.m2, actions: [] }], lprob: pid, steps: [], files: [], reports: [] }; S.put(se);
    const mid = (i) => APP.liveMsgId(se.msgs[i]);
    const pg = S.get('eprog_' + pid), so = pg.solve = pg.solve || {}; so.live = so.live || {}; const L = so.live; ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; });
    so.u = { 1: { done: true, at: TT.u, one: 'شمارشِ راه‌ها', u: 'تعداد راه‌ها', dl: [{ id: 'd1', t: '۲۰ پله' }, { id: 'd2', t: 'گامِ ۱ یا ۲' }], c: '', type: 'find', nat: 'objective', from: 'live', src: { u: { sess: se.id, mid: mid(0) } },
      fixHist: [{ at: TT.ufix, field: 'u', old: 'تعداد پله‌ها', new: 'تعداد راه‌ها', why: 'اصلاح شد ⇐ «تعداد پله‌ها»', src: mid(0), sess: se.id, by: 'user' }] } };
    so.g = { 1: { guess: '۲^n', conf: 60, test: 'n=۳', at: TT.g, from: 'chat', sess: se.id, src: { sess: se.id, mid: mid(2) }, hit: 'نادرست بود', testRes: 'رد شد' } };
    L.plan = { t: 'حالت‌های کوچک', at: TT.pl };
    L.steps.push({ id: 'st1', text: 'n=۳ را بشمار', pred: '۳ راه', conf: 60, due: APP.today(), at: TT.st, closed: true, out: { at: TT.o1, done: 'yes', match: 'yes', what: '۳ راه', guess: { rel: 'refute', g: '۲^n' } } });
    L.steps.push({ id: 'st2', text: 'n=۴ را بشمار', pred: '۵ راه', conf: 60, due: APP.today(), at: TT.st, closed: true, out: { at: TT.o2, done: 'yes', match: 'yes', what: '۵ راه' } });
    so.b = { 1: { verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkMsgs: ['n=۴ ⇒ ۵'], at: TT.v, done: true, glance: 'فیبوناچی', use: 'حالت‌های کوچک', from: 'chat' } };
    S.put(pg); return { pid, sid: se.id };
  }, [o || {}, { s0: T('10:00'), m1: T('10:04'), m1b: T('10:04'), m2: T('10:09'), u: T('10:05'), ufix: T('10:20'), g: T('10:10'), pl: T('10:32'), st: T('10:35'), o1: T('10:40'), o2: T('10:50'), v: T('11:00') }]);
  const dview = (pid) => p.evaluate((pid) => { APP.go('dossier', pid); const main = document.querySelector('main .lp-dossier'); if (!main) return null;
    return { evs: [...main.querySelectorAll('.lp-dev')].map(li => ({ k: li.dataset.ev, t: li.dataset.title, text: li.textContent, wd: li.classList.contains('lp-dwd'), chips: [...li.querySelectorAll('.lp-dmind .chip')].map(c => ({ row: c.dataset.row, sign: c.dataset.sign, wd: c.classList.contains('lp-dwd') })), src: !!li.querySelector('.lp-dsrc button') })),
      days: main.querySelectorAll('.lp-dday').length, text: main.textContent, state: (main.querySelector('.lp-dstate') || {}).textContent || '', stages: [...main.querySelectorAll('.lp-dstages .chip')].map(c => c.textContent), sess: main.querySelectorAll('.lp-dsess button').length,
      inputs: main.querySelectorAll('input, textarea, select, [contenteditable="true"]').length, mx: main.querySelectorAll('bdi.mx, math, .mx').length }; }, pid);
  const DS = [
    async () => { const x = await mkStairs(); const v = await dview(x.pid); const ks = v.evs.map(e => e.k).filter(k => ['stmt', 'u', 'guess', 'plan', 'out', 'verdict', 'back'].includes(k));
      const g = v.evs.find(e => e.k === 'guess'), u = v.evs.find(e => e.k === 'u');
      return { ok: J(ks) === J(['stmt', 'u', 'guess', 'plan', 'out', 'out', 'verdict', 'back']) && /رد شد|نادرست/.test(g.text) && /اصلاح شد ⇐/.test(u.text), got: { ks, g: g && g.text.slice(0, 120) } }; },
    async () => { const x = await setup({ chat: 'U: برنامه‌م اینه که سه‌شنبه با صاحبخونه حرف بزنم ‖ A: باشه.', rec: {}, title: 'اجاره' }); const d2 = addD(new Date().toISOString().slice(0, 10), 3);
      await p.evaluate(([pid, sid, d2, T2]) => { const S = APP.S, pg = S.get('eprog_' + pid), L = pg.solve.live; L.plan = { t: 'حرف زدن با صاحبخونه', at: new Date().toISOString(), due: d2 };
        L.steps.push({ id: 'sA', text: 'حرف زدن با صاحبخونه', pred: 'کمی کم کند', conf: 50, due: d2, at: new Date().toISOString(), closed: true, out: { at: T2, d: d2, done: 'yes', match: 'yes', what: '۵ درصد کم کرد' } }); S.put(pg);
        S.put({ id: APP.uid('achat'), type: 'achat', title: 'سشنِ دوم', msgs: [{ role: 'user', text: 'حرف زدم', at: T2, actions: [] }], lprob: pid, steps: [], files: [], reports: [] }); }, [x.pid, x.sid, d2, T('11:00', d2)]);
      const v = await dview(x.pid); const pl = v.evs.find(e => e.k === 'plan'), o = v.evs.find(e => e.k === 'out');
      return { ok: v.days >= 2 && v.sess === 2 && pl && /موعد/.test(pl.text) && o && /۵ درصد کم کرد/.test(o.text), got: { days: v.days, sess: v.sess, pl: pl && pl.text, o: o && o.text } }; },
    async () => { const x = await setup({ chat: 'U: مسافت ۱۲۰ کیلومتر ‖ A: [فرمِ فهم: داده‌ها ← «مسافت ۱۲۰ کیلومتر»]', rec: { dl: [[0, 'مسافت ۱۲۰ کیلومتر']] } }); const v = await dview(x.pid); const u = v.evs.find(e => e.k === 'u');
      return { ok: !!u && u.src && /از پیامِ گفت‌وگو: «مسافت ۱۲۰ کیلومتر»/.test(u.text), got: u }; },
    async () => { const x = await setup({ chat: 'U: S = πr² ‖ A: خوب.', rec: { dl: [[0, 'S = πr²']], g: [0, '۲^n − ۱'] } }); const v = await dview(x.pid); const can = await p.evaluate(() => APP.MATH.has('S = πr²') || APP.MATH.has('۲^n − ۱'));
      return { ok: !can || v.mx >= 1, got: { mx: v.mx, can } }; },
    async () => { const x = await mkStairs(); const v = await dview(x.pid); const o = v.evs.filter(e => e.k === 'out'), g = v.evs.find(e => e.k === 'guess');
      return { ok: o.some(e => e.chips.some(c => /^اجرا/.test(c.row) && c.sign === '+'))   /* دورِ ۲۰ (D·15): نامِ سطر همان کارنامهٔ ذهن («اجرای طرح») */ && g.chips.some(c => /حدس/.test(c.row) && c.sign === '−'), got: { o: o.map(e => e.chips), g: g.chips } }; },
    async () => { const x = await setup({ chat: 'U: حدسم اینه که جواب ۲^n هست ‖ A: چرا؟ ‖ U: نه اشتباه نوشتم، منظورم ۲^n − ۱ بود', rec: { g: [0, '۲^n'] } }); await retractChat(x.sid, { msg: 'جواب ۲^n هست', what: 'guess', fix: '۲^n − ۱' }, 'نه اشتباه نوشتم، منظورم ۲^n − ۱ بود');
      const v = await dview(x.pid); const g = v.evs.find(e => e.k === 'guess'), rt = v.evs.find(e => e.k === 'retract');
      return { ok: g && /اصلاح شد ⇐ «۲\^?n»/.test(g.text) && rt && rt.src && /منظورم ۲\^?n ?[−-] ?۱ بود/.test(rt.text), got: { g: g && g.text, rt: rt && rt.text } }; },
    async () => { const ids = await p.evaluate(() => { const S = APP.S; const keep = { keepTime: true };
        const pid0 = APP.liveCreate('P1 قدیمی', 'یک مسئلهٔ آزمونیِ فهرست برای ترتیب', 'find', { by: 'user', nat: 'practical' }); const pid = typeof pid0 === 'string' ? pid0 : (pid0.p ? pid0.p.id : pid0.id);
        const r = S.get('eprob_' + pid); r.created = '2026-10-15T09:00:00.000Z'; r.updated = '2026-10-15T10:00:00.000Z'; S.put(r, keep); const pg = S.get('eprog_' + pid); pg.updated = '2026-10-15T10:00:00.000Z'; S.put(pg, keep);
        const I1 = { id: APP.uid('idea'), type: 'idea', what: 'ایدهٔ آزمون', title: 'I1', parts: [], created: '2026-10-17T08:00:00.000Z', updated: '2026-10-17T08:00:00.000Z' }; S.put(I1, keep);
        const F1 = { id: APP.uid('case'), type: 'case', title: 'F1', created: '2026-10-16T10:00:00.000Z', updated: '2026-10-16T10:00:00.000Z', st: {} }; S.put(F1, keep);
        const S9 = { id: APP.uid('achat'), type: 'achat', title: 'S9', msgs: [{ role: 'user', text: 'سلام', at: '2026-10-17T09:00:00.000Z' }], steps: [], files: [], reports: [], updated: '2026-10-17T09:00:00.000Z' }; S.put(S9, keep);
        return { P1: pid, I1: I1.id, F1: F1.id, S9: S9.id }; });
      const order = await p.evaluate((ids) => APP.workIndex().map(x => x.id).filter(id => Object.values(ids).includes(id)), ids);
      const dom = await p.evaluate((ids) => { APP.go('dossier'); return [...document.querySelectorAll('main .lp-wlist li')].map(li => li.dataset.id).filter(id => Object.values(ids).includes(id)); }, ids);
      const want = [ids.S9, ids.I1, ids.F1, ids.P1]; return { ok: J(order) === J(want) && J(dom) === J(want), got: { order, dom, want } }; },
    async () => { const x = await mkStairs({ title: '۲۰ پله برون‌بُرد' }); await p.evaluate((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.u[1].dl.push({ id: 'd3', t: '\\frac{n(n+1)}{2}' }); APP.S.put(pg); }, x.pid);
      const v = await dview(x.pid); const md = await p.evaluate((pid) => APP.dossierMd(pid), x.pid), html = await p.evaluate((pid) => APP.dossierHtml(pid), x.pid);
      let pos = -1, inOrder = true; v.evs.forEach(e => { const k = md.indexOf(e.t, pos + 1); if (k < 0 || k < pos) inOrder = false; else pos = k; });
      const hk = [...html.matchAll(/data-ev="([a-z]+)"/g)].map(m => m[1]);
      return { ok: inOrder && J(hk) === J(v.evs.map(e => e.k)) && /اصلاح شد ⇐/.test(md) && /اصلاح شد ⇐/.test(html) && !/\\frac/.test(md) && !/\\frac/.test(html.replace(/<[^>]*>/g, '')), got: { inOrder, hk: hk.slice(0, 12), dom: v.evs.map(e => e.k).slice(0, 12), frac: /\\frac/.test(md) || /\\frac/.test(html.replace(/<[^>]*>/g, '')) } }; },
    async () => { const x = await mkStairs({ title: '۲۰ پله ورودی' }); await p.evaluate((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.lessons = [{ at: new Date().toISOString(), use: 'حالت‌های کوچک را اول بشمار' }]; APP.S.put(pg); }, x.pid);
      const a = await p.evaluate((pid) => { APP.go('lprob', pid); const b0 = document.querySelector('main .lp-dossier'); if (!b0) return 'no header button'; b0.click(); return APP.state.view + '|' + APP.state.arg; }, x.pid);
      const bq = await p.evaluate(([pid, sid]) => { APP.go('today'); APP.ASSIST.store('cur', sid); APP.ASSIST.toggle(true); APP.ASSIST.paint(); const b0 = document.querySelector('.as-doslink'); if (!b0) return 'no session link'; b0.click(); APP.ASSIST.toggle(false); return APP.state.view + '|' + APP.state.arg; }, [x.pid, x.sid]);
      const c = await p.evaluate((pid) => { APP.go('mind'); const t = APP.liveRec(pid).p.title; const li = [...document.querySelectorAll('main details li')].filter(l => l.textContent.indexOf('«' + t + '»') >= 0 && l.querySelector('.lp-dlink')).pop(); if (!li) return 'no timeline link'; li.querySelector('.lp-dlink').click(); return APP.state.view + '|' + APP.state.arg; }, x.pid);
      const want = 'dossier|' + x.pid; return { ok: a === want && bq === want && c === want, got: { a, bq, c } }; },
    async () => { const x = await setup({ chat: 'U: مسئله رو فهمیدم ‖ A: خوب.', rec: { uDone: true } }); await p.evaluate((pid) => { const pg = APP.S.get('eprog_' + pid), L = pg.solve.live; L.plan = { t: 'اول حالت‌های کوچک', at: new Date().toISOString() }; L.incub = { at: new Date().toISOString(), d: APP.today(), due: APP.today() }; APP.S.put(pg); }, x.pid);
      const v = await dview(x.pid); /* دورِ ۲۰ (RO6، B·D7): مرحلهٔ جاری (اجرا، پس از طرح) «در جریان» است نه «هنوز نرسیده» — یک منبعِ وضع */ return { ok: /مکث/.test(v.state) && v.stages.filter(t => /هنوز نرسیده/.test(t)).length === 1 && v.stages.some(t => /اجرا/.test(t) && /در جریان/.test(t)) && !v.evs.some(e => e.k === 'back' || e.k === 'verdict' || e.k === 'out'), got: { state: v.state, stages: v.stages } }; },
    async () => { const x = await setup({ chat: 'U: گام سوم انجام شد ‖ A: خوب.', rec: { steps: [{ text: 'گامِ اول', closed: 'yes' }, { text: 'گامِ دوم', closed: 'yes' }, { text: 'گامِ سوم' }], reps: [{ step: 3, done: 'yes', match: 'yes', what: 'انجام شد', msg: 1 }] } });
      await p.evaluate(([sid]) => { const se = APP.S.get(sid); APP.retractMsg(sid, se.msgs[0], 'گام سوم رو هنوز انجام ندادم', { by: 'user' }); }, [x.sid]);
      const v = await dview(x.pid); const old = v.evs.filter(e => e.k === 'stepold'), outs = v.evs.filter(e => e.k === 'out' && /گامِ ۳/.test(e.t));
      return { ok: old.length === 1 && old[0].wd && outs.length === 0 && old[0].chips.every(c => c.wd), got: { old, outs: outs.length } }; },
    async () => { const x = await mkStairs({ title: '۲۰ پله جدا' }); const y = await setup({ chat: 'U: حدسم اینه که صاحبخونه قبول می‌کنه ‖ A: چرا؟', rec: { g: [0, 'صاحبخونه قبول می‌کنه'], steps: [{ text: 'تماس با صاحبخونهٔ اجاره' }] }, title: 'اجاره' });
      await p.evaluate(([sid, pid2]) => { const se = APP.S.get(sid); se.lprobLog = [{ p: pid2, at: new Date().toISOString() }]; APP.S.put(se); }, [x.sid, y.pid]);
      const v = await dview(x.pid); return { ok: !/صاحبخونه/.test(v.text) && !/اجاره/.test(v.text), got: v.text.slice(0, 200) }; },
    async () => { const ids = await p.evaluate(() => { const S = APP.S; const pid0 = APP.liveCreate('مسئلهٔ دونده', 'مسئلهٔ ساختهٔ اجراکنندهٔ تور برای آزمون', 'find', { by: 'user', nat: 'practical' }); const pid = typeof pid0 === 'string' ? pid0 : (pid0.p ? pid0.p.id : pid0.id); const r = S.get('eprob_' + pid); r.test = true; S.put(r);
        const s = { id: APP.uid('achat'), type: 'achat', title: 'سشنِ دونده', test: true, msgs: [{ role: 'user', text: 'آزمون', at: new Date().toISOString() }], steps: [], files: [], reports: [] }; S.put(s); return [pid, s.id]; });
      const idx = await p.evaluate(() => APP.workIndex().map(x => x.id)); return { ok: !idx.includes(ids[0]) && !idx.includes(ids[1]), got: ids.filter(i => idx.includes(i)) }; },
    async () => { const x = await mkStairs({ title: '۲۰ پله فقط‌خواندنی' }); const v = await dview(x.pid); return { ok: v.inputs === 0, got: v.inputs }; },
    async () => { const x = await setup({ chat: 'U: شروع کردم ‖ A: خوب.', rec: { uDone: true } }); const v = await dview(x.pid); return { ok: !v.evs.some(e => e.k === 'back') && v.stages.some(t => /بازنگری/.test(t) && /هنوز نرسیده/.test(t)), got: v.evs.map(e => e.k) }; },
    async () => { const x = await setup({ chat: 'U: حدسم ۲^n ‖ A: چرا؟', rec: { g: [0, '۲^n'] } }); await p.evaluate(() => { APP.S.put({ id: APP.uid('achat'), type: 'achat', title: 'گپِ بی‌ربط', msgs: [{ role: 'user', text: 'هوا امروز چطوره؟', at: new Date().toISOString() }], steps: [], files: [], reports: [] }); });
      const v = await dview(x.pid); return { ok: v.sess === 1 && !/گپِ بی‌ربط|هوا امروز/.test(v.text), got: { sess: v.sess } }; },
    async () => { const x = await setup({ chat: 'U: گام اول انجام شد و جواب داد ‖ A: ثبت شد.', rec: { steps: [{ text: 'گامِ اول' }], reps: [{ step: 1, done: 'yes', match: 'yes', what: 'جواب داد', msg: 1 }] } });
      await p.evaluate((pid) => { const pg = APP.S.get('eprog_' + pid), st = pg.solve.live.steps[0]; st.out = Object.assign({}, st.out, { from: 'chat', confirmed: true, pending: false, at: new Date().toISOString() }); st.closed = true; APP.S.put(pg); }, x.pid);
      const v = await dview(x.pid); const n = v.evs.filter(e => e.k === 'out').length; return { ok: n === 1, got: n }; },
    async () => { const ids = await p.evaluate(() => { const S = APP.S, keep = { keepTime: true }; const pid0 = APP.liveCreate('P1 کهنه با گامِ امروز', 'مسئلهٔ کهنه‌ای که امروز گامِ تازه گرفت', 'find', { by: 'user', nat: 'practical' }); const pid = typeof pid0 === 'string' ? pid0 : (pid0.p ? pid0.p.id : pid0.id);
        const r = S.get('eprob_' + pid); r.created = '2026-09-01T10:00:00.000Z'; r.updated = '2026-09-01T10:00:00.000Z'; S.put(r, keep);
        const pg = S.get('eprog_' + pid); pg.solve = pg.solve || {}; pg.solve.live = pg.solve.live || { steps: [] }; (pg.solve.live.steps = pg.solve.live.steps || []).push({ id: 'sx', text: 'گامِ امروز', at: new Date().toISOString(), due: APP.today() }); S.put(pg);
        const y = new Date(Date.now() - 864e5).toISOString(); const I = { id: APP.uid('idea'), type: 'idea', title: 'ایدهٔ دیروز', parts: [], created: y, updated: y }; S.put(I, keep); return [pid, I.id]; });
      const idx = await p.evaluate(() => APP.workIndex().map(x => x.id)); return { ok: idx.indexOf(ids[0]) >= 0 && idx.indexOf(ids[0]) < idx.indexOf(ids[1]), got: { p: idx.indexOf(ids[0]), i: idx.indexOf(ids[1]) } }; },
    async () => { const x = await setup({ chat: 'U: گام اول انجام شد و جواب داد ‖ A: ثبت شد.', rec: { steps: [{ text: 'گامِ اول' }], reps: [{ step: 1, done: 'yes', match: 'yes', what: 'جواب داد', msg: 1 }] } });
      await p.evaluate(([sid]) => { const se = APP.S.get(sid); APP.retractMsg(sid, se.msgs[0], 'گام اول رو هنوز انجام ندادم', { by: 'user' }); }, [x.sid]);
      const v = await dview(x.pid); const act = v.evs.flatMap(e => e.chips).filter(c => !c.wd && c.row === 'اجرا'), wd = v.evs.flatMap(e => e.chips).filter(c => c.wd);
      return { ok: act.length === 0 && wd.length >= 1 && /پس گرفته شد/.test(v.text), got: { act, wd } }; },
    async () => { const x = await setup({ chat: 'U: جمع برابر \\frac{n(n+1)}{2} ‖ A: خوب.', rec: { dl: [[0, '\\frac{n(n+1)}{2}']] } }); const v = await dview(x.pid); const md = await p.evaluate((pid) => APP.dossierMd(pid) + APP.dossierHtml(pid).replace(/<[^>]*>/g, ''), x.pid);
      return { ok: !/\\frac/.test(v.text) && !/\\frac/.test(md), got: { dom: /\\frac/.test(v.text), exp: /\\frac/.test(md) } }; },
    async () => { const x = await setup({ chat: 'U: میشه آخرش یه خلاصه از همه‌ی روش‌ها بهم بدی؟ ‖ A: اول بگو مجهول چیست؟', rec: { uDone: true } });
      await p.evaluate((sid) => { const se = APP.S.get(sid); se.coach = Object.assign({}, se.coach, { deferCand: { t: 'یه خلاصه از همه‌ی روش‌ها', at: new Date().toISOString() } }); APP.S.put(se); }, x.sid);
      const v = await dview(x.pid); return { ok: !/خلاصه از همه/.test(v.text), got: v.evs.map(e => e.k) }; },
  ];
  await runBank('INF16.dossier', 21, DS, async (e, fn) => fn());

  /* ================= پیوند با مربی (a27 retractApply ⇒ APP.liveRetract ِ بومی) — فقط وقتی مربی هست ================= */
  {
    const x = await setup({ chat: 'U: حدسم اینه که جواب ۲^n هست ‖ A: چرا؟ ‖ U: نه اشتباه نوشتم، منظورم ۲^n − ۱ بود', rec: { g: [0, '۲^n'], dl: [[0, 'n پله']] }, title: 'r19b-coach-link' });
    const r = await p.evaluate((sid) => { const AS = APP.ASSIST; if (typeof AS.retractApply !== 'function') return { skip: true };
      const o = AS.retractApply(APP.S.get(sid), { msg: 'جواب ۲^n هست', what: 'guess', fix: '۲^n − ۱' }); return { ch: (o && o.ch) || [], err: o && o.err }; }, x.sid);
    if (!r.skip) { const s = await snap(x.pid, x.sid); const r2 = await p.evaluate(([pid, id]) => APP.liveRetract(pid, id, { what: 'guess', fix: '۲^n − ۱', frag: 'جواب ۲^n هست' }), [x.pid, x.mids[0]]);
      info.coachLink = { ch: r.ch, g: s.g, again: r2.text };
      chk(s.g && s.g.t === '۲^n − ۱' && s.g.h === 1 && r.ch.some(t => /حدس/.test(t)), 'coach link: retractApply reverses the live guess through APP.liveRetract and reports it ' + J(info.coachLink));
      chk(r2.ok && r2.changes.length === 0 && /^چیزی/.test(r2.text), 'coach link: the same correction again changes nothing and says so (no false «changed») ' + J(r2)); }
    else info.coachLink = 'coach absent (live branch alone)';
  }
  info.bankRes = Object.fromEntries(Object.entries(bankRes).map(([k, v]) => [k, v.pass + '/' + (v.pass + v.fail.length)]));
  console.log(JSON.stringify(info, null, 1));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
