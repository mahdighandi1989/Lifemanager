// تورِ پولیا (دستهٔ ۱، دورِ ۲۱، ۲۰۲۶-۱۰-۱۸) — DECISIONS_R21 (+ ADDENDUM)، سهمِ «live + dossier» (a38_live.js، a40_dossier.js، a33 موعد، a39 نمودار، نشانِ حباب).
//  دو منبعِ شاهد، هر دو قرمز پیش از اصلاح:
//   (۱) نقلِ عینیِ دونده‌ها (round21{A,B,C,D}): B·D3/D4/D5/D13، C21-3/4/13/14/16، D·3/4/5/6/11/s31، A21-2/3/4/6/7/14/19/21.
//   (۲) بانکِ مستقلِ VARIANTS_R21 (tests/variants/VARIANTS_R21.json = tour1_polya/VARIANTS_R21.json؛ LLA_VARIANTS = مسیرِ دیگر) — هر ورودیِ R3، R4، R6 (سویِ صفحه) و R9 یک بررسی
//       دارد؛ ورودی‌هایی که مالِ مربی (a27/a29) یا تمرین (a41) اند با دلیل «not covered» چاپ می‌شوند و این آزمون را قرمز نمی‌کنند.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R21.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R21.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)) || path.join(__dirname, 'variants', 'VARIANTS_R21.json');
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
    APP.callAI = async (sys, user) => { window.__prompts.push(String(user)); return { text: JSON.stringify({ reply: 'باشه.', status: 'related', actions: [] }) }; }; });
  const bank = JSON.parse(fs.readFileSync(BANK, 'utf8'));
  info.bank = { file: BANK, n: bank.length };
  chk(bank.length >= 190, 'bank: VARIANTS_R21 must be loaded (got ' + bank.length + ')');
  const nextWd = (pw) => { const d = new Date(); d.setUTCHours(12, 0, 0, 0); for (let k = 1; k <= 7; k++) { const x = new Date(d.getTime() + k * 864e5); if ((x.getUTCDay() + 1) % 7 === pw) return x.toISOString().slice(0, 10); } };
  const addD = (iso, n) => new Date(new Date(iso + 'T12:00:00Z').getTime() + n * 864e5).toISOString().slice(0, 10);

  /* سشن + مسئله؛ chat: «U: … ‖ A: …»؛ rec: رکوردهای ساخته از پیامِ ui با span (src = APP.liveSrc) یا دست‌نوشتِ صفحه (page) */
  const setup = (o) => p.evaluate((o) => {
    const S = APP.S, now = new Date().toISOString();
    const r0 = APP.liveCreate(o.title || ('r20 ' + Math.random().toString(36).slice(2, 7)), o.st || 'می‌خواهم این مسئله را درست حل کنم و نتیجه را ببینم', 'find', { by: 'user', nat: o.nat || 'practical' });
    const pid = r0.p.id, t0 = Date.now() - 3600e3; let n = 0;
    const msgs = (o.chat || '').split(' ‖ ').filter(Boolean).map(x => { const m = /^\s*([UA]):\s*([\s\S]*)$/.exec(x); return { role: m && m[1] === 'A' ? 'ai' : 'user', text: m ? m[2].trim() : x.trim(), at: new Date(t0 + (n++) * 60e3).toISOString(), actions: [] }; });
    const se = { id: APP.uid('achat'), type: 'achat', title: 'گفت‌وگوی آزمون', msgs, steps: [], files: [], reports: [], lprob: pid }; S.put(se);
    const U = msgs.filter(m => m.role === 'user'), src = (i, key, v) => APP.liveSrc(se.id, APP.liveMsgId(U[i]), key, v);
    const pg = S.get('eprog_' + pid), so = pg.solve; const L = so.live; ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; });
    const R = o.rec || {};
    if (R.dl || R.c || R.u) { so.u = { 1: { done: true, at: now, one: 'کلِ مسئله', u: R.u ? R.u[1] : 'مجهول', dl: (R.dl || []).map((x, i) => ({ id: 'd' + (i + 1), t: x[1], src: x[0] == null ? undefined : src(x[0], 'datum:d' + (i + 1), x[1]) })), c: R.c ? R.c[1] : '', type: 'find', nat: 'practical', from: 'live', src: Object.assign({}, R.c && R.c[0] != null ? { c: src(R.c[0], 'cond', R.c[1]) } : {}, R.u && R.u[0] != null ? { u: src(R.u[0], 'unknown', R.u[1]) } : {}) } }; so.u[1].d = so.u[1].dl.map(x => x.t).join(' · '); }
    if (R.g) so.g = { 1: { guess: R.g[1], conf: null, test: '', at: U[R.g[0]].at, from: 'chat', sess: se.id, by: 'model', src: src(R.g[0], 'guess:g1', R.g[1]) } };
    if (R.plan) L.plan = { t: R.plan[1], at: now, src: R.plan[0] == null ? undefined : src(R.plan[0], 'plan', R.plan[1]), due: R.planDue || undefined };
    (R.steps || []).forEach((x, i) => { const st = { id: 'st' + (i + 1) + Math.random().toString(36).slice(2, 5), text: x.text, pred: 'خوب پیش می‌رود', conf: 60, due: x.due || APP.today(), at: now };
      if (x.src != null) st.src = src(x.src, 'step:' + (i + 1), x.text); if (x.closed) { st.closed = true; st.out = { at: now, d: APP.today(), done: x.closed, what: x.what || 'شد', match: 'yes', prog: x.prog || 'کمی' }; } L.steps.push(st); });
    if (R.stmt) { const r = S.get('eprob_' + pid); r.p.statement = R.stmt[1]; if (R.stmt[0] != null) { r.src = src(R.stmt[0], 'stmt', R.stmt[1]); r.srcMid = r.src.mid; } S.put(r); }
    if (R.chat) L.chat = { sess: se.id, at: U[R.chat[0]].at, solution: R.chat[1], mid: APP.liveMsgId(U[R.chat[0]]), src: src(R.chat[0], 'ans', R.chat[1]), srcSet: true };
    if (R.verdict) so.b = { 1: { verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkBy: 'msgs', chkHow: R.verdict[1] || '', chkMsgs: [U[R.verdict[0]].text], at: now, from: 'chat', state: 'solved', done: true, use: R.lesson ? R.lesson[1] : '', src: R.lesson ? { use: src(R.lesson[0], 'lesson', R.lesson[1]) } : {}, srcSet: true } };
    S.put(pg);
    (R.reps || []).forEach(rp => APP.liveStepReport(pid, Object.assign({}, rp)));
    return { pid, sid: se.id, mids: U.map(m => APP.liveMsgId(m)) };
  }, o);
  const snap = (pid, sid) => p.evaluate(([pid, sid]) => {
    const pg = APP.S.get('eprog_' + pid), so = pg.solve, L = so.live, g = so.g && so.g[1], u1 = so.u && so.u[1], b = so.b && so.b[1], se = APP.S.get(sid), r = APP.S.get('eprob_' + pid);
    return { g: g ? { t: g.guess, h: (g.fixHist || []).length, wd: !!g.withdrawn } : null, dl: u1 ? u1.dl.map(x => x.t) : [], dlH: u1 ? (u1.fixHist || []).length : 0, c: u1 ? u1.c : '', u: u1 ? u1.u : '', one: u1 ? u1.one : '',
      steps: L.steps.map(st => ({ text: st.text, due: st.due, out: st.out ? { done: st.out.done, match: st.out.match, what: st.out.what } : null, h: (st.fixHist || []).length })),
      plan: L.plan ? { t: L.plan.t, due: L.plan.due || '', h: (L.plan.fixHist || []).length } : null, chat: L.chat ? { s: L.chat.solution, h: (L.chat.fixHist || []).length } : null,
      verdict: b ? { v: b.verdict, sup: !!b.superseded } : null, use: b ? b.use : '', stmt: r.p.statement, stmtH: (r.fixHist || []).length, asks: (se.copyAsk || []).map(q => ({ id: q.id, path: q.path, old: q.old, new: q.new, state: q.state })) };
  }, [pid, sid]);
  const rChat = (sid, rt, cur, extra) => p.evaluate(([sid, rt, cur]) => { const r = APP.liveRetractChat(sid, rt, cur); return { ok: r.ok, err: r.err || '', n: (r.changed || []).length, changed: (r.changed || []).map(c => c.kind + ':' + c.label), note: r.note || '', ask: (r.ask || []).length, frag: r.frag || '', fix: r.fix || '' }; }, [sid, rt, cur]);
  const rLive = (pid, sid, i, o) => p.evaluate(([pid, sid, i, o]) => { const se = APP.S.get(sid), U = se.msgs.filter(m => m.role === 'user'); const r = APP.liveRetract(pid, APP.liveMsgId(U[i]), Object.assign({ sess: sid }, o)); return { ok: r.ok, n: (r.changed || []).length, changed: (r.changed || []).map(c => c.kind + ':' + c.label), text: r.text || '', ask: (r.ask || []).length }; }, [pid, sid, i, o]);
  const rEdit = (sid, i, nt) => p.evaluate(([sid, i, nt]) => { const se = APP.S.get(sid), U = se.msgs.filter(m => m.role === 'user'); const old = U[i].text; const r = APP.retractMsg(sid, U[i], nt, { by: 'user', keepText: true }); return { ok: r.ok, n: (r.changed || []).length, changed: (r.changed || []).map(c => c.kind + ':' + c.label), frag: r.frag, fix: r.fix, inOld: old.indexOf(r.frag) >= 0, inNew: nt.indexOf(r.fix) >= 0, ask: (r.ask || []).length, note: r.note }; }, [sid, i, nt]);
  /* یک نوبتِ دستیار با کنش‌ها (همان AS.run ِ صفحه؛ busy مثلِ نوبتِ واقعی) */
  const actTurn = (sid, userText, actions) => p.evaluate(async ([sid, userText, actions]) => { const AS = APP.ASSIST, se = APP.S.get(sid); if (userText) { se.msgs.push({ role: 'user', text: userText, at: new Date().toISOString(), actions: [] }); APP.S.put(se); }
    const ob = AS.busy; AS.busy = () => true; AS._turnSession = APP.S.get(sid); let res; try { res = await AS.run(actions); } finally { AS.busy = ob; } const s2 = APP.S.get(sid); s2.msgs.push({ role: 'ai', text: 'باشه.', at: new Date().toISOString(), actions: [] }); APP.S.put(s2); return { notes: res && res.notes || [], infos: res && res.infos || [] }; }, [sid, userText, actions]);
  const dos = (id) => p.evaluate((id) => { const D = APP.dossier(id); if (!D) return null; APP.go('dossier', id); const main = document.querySelector('main .lp-dossier');
    return { state: D.state, stages: D.stages.map(s => s.fa + (s.now ? ' — در جریان' : s.reached ? '' : ' — هنوز نرسیده')), evs: D.events.map(e => ({ k: e.k, at: e.at, title: e.title, lines: e.lines, out: e.out || '', src: e.src ? (e.src.unknown ? 'UNKNOWN' : e.src.text || '') : '', mind: (e.mind || []).map(m => m.row + m.sign), wd: !!e.withdrawn, hist: (e.hist || []).length })), text: main ? main.textContent : '', md: APP.dossierMd(id) }; }, id);

  const res = {}; const bankRes = {}; const cover = {};
  const T = async (name, fn) => { let r; try { r = await fn(); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.message || ex).split('\n')[0] }; } res[name] = r.ok; if (!r.ok) errors.push(name + ' got ' + J(r.got).slice(0, 700)); return r.ok; };
  const dlSess = async (txt, act) => { const x = await setup({ chat: 'U: سلام ‖ A: سلام.' }); await actTurn(x.sid, txt, [act]); return x; };
  const asks = (sid) => p.evaluate((sid) => (APP.S.get(sid).copyAsk || []).map(q => ({ id: q.id, path: q.path, field: q.field, label: q.label, old: q.old, new: q.new, state: q.state })), sid);
  const ev = (f, a) => p.evaluate(f, a);
  const pushU = (sid, text) => p.evaluate(([sid, text]) => { const se = APP.S.get(sid); se.msgs.push({ role: 'user', text, at: new Date().toISOString(), actions: [] }); APP.S.put(se); return APP.liveMsgId(se.msgs[se.msgs.length - 1]); }, [sid, text]);
  /* سشنِ بی مسئلهٔ زنده */
  const bare = async (chat) => { const x = await setup({ chat }); await ev((sid) => { const se = APP.S.get(sid); se.lprob = ''; APP.S.put(se); }, x.sid); return x; };
  const rSess = (sid, rt, cur) => p.evaluate(([sid, rt, cur]) => { const r = APP.liveRetractSess(sid, rt, cur); return { ok: r.ok, err: r.err || '', changed: (r.changed || []).map(c => ({ rec: c.rec, kind: c.kind, old: c.old, new: c.new, why: c.why })), ask: r.ask || [], note: r.note || '' }; }, [sid, rt, cur]);
  const rFull = (sid, rt, cur) => p.evaluate(([sid, rt, cur]) => { const r = APP.liveRetractChat(sid, rt, cur); return { ok: r.ok, err: r.err || '', changed: (r.changed || []).map(c => ({ rec: c.rec, kind: c.kind, label: c.label, old: typeof c.old === 'string' ? c.old : '', new: typeof c.new === 'string' ? c.new : '', why: c.why })), ask: (r.ask || []).map(q => ({ field: q.field, label: q.label, old: q.old, new: q.new })), note: r.note || '', parts: r.parts || null }; }, [sid, rt, cur]);
  const shapeOk = (r) => Array.isArray(r.changed) && Array.isArray(r.ask) && typeof r.note === 'string' && r.note.length > 0 && r.changed.every(c => 'rec' in c && 'why' in c) && r.ask.every(q => 'field' in q && 'label' in q);
  const RAW = /chat\||chatok\||rebook:|\bmore\b|\bintuitive\b|\blp[A-Z][A-Za-z]+\b|\bdl:|\bu\.(?:one|u|c)\b/;

  /* ================= نقلِ دونده‌ها (round21{A,B,C,D}) — قرمز پیش از اصلاح ================= */
  // B·D3 s17 «بام ۱۸۰ نه ۲۰۰»: نسخهٔ فرم «۲۰۰ مترمربع» و نقلِ گفت‌وگو «200 m^2» ⇒ پرسیده می‌شود (نامِ فیلدِ خودش، نه شناسه)
  await T('B·D3 s17 units: 200 m^2 ≡ ۲۰۰ مترمربع asks', async () => { const x = await setup({ chat: 'U: بام انبار 200 m^2 ـه و بارش سالانه ۲۵۰ میلی‌متر ‖ A: خب. ‖ U: بام ۱۸۰ ـه نه ۲۰۰', rec: { dl: [[null, 'سطحِ بامِ انبار ۲۰۰ مترمربع'], [null, 'بارشِ سالانه ۲۵۰ میلی‌متر']] } });
    await ev((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.u[1].prac = { measure: 'حجمِ آب = ۲۰۰ مترمربع × ۰٫۲۵ متر' }; APP.S.put(pg); }, x.pid);
    /* «خطِ ریاضی‌کردن» هم نسخهٔ خودش است — مدل فیلد را نام می‌برد (key = field:<id>) */
    const r = await rFull(x.sid, { msg: 'بام انبار 200 m^2', what: 'fact', fix: '۱۸۰', key: 'field:lpPrMeasure' }, 'بام ۱۸۰ ـه نه ۲۰۰'); const q = await asks(x.sid), d1 = q.filter(a => a.path === 'dl:d1')[0], ms = q.filter(a => a.path === 'prac.measure')[0];
    return { ok: q.length === 2 && d1 && /۲۰۰ مترمربع/.test(d1.old) && /۱۸۰ مترمربع/.test(d1.new) && /داده/.test(d1.label) && ms && /۱۸۰ مترمربع/.test(ms.new) && q.every(a => !RAW.test(a.label) && a.field) && shapeOk(r), got: { r, q } }; });
  // B·D3 s19 «نیم کیلو نه یه کیلو»: نتیجهٔ گامی که خودش نوشت «یک کیلو اضافه شد» ⇒ پرسیده می‌شود؛ شکستِ گام می‌ماند
  await T('B·D3 s19 step outcome copy (یه ≡ یک) asks', async () => { const x = await setup({ chat: 'U: گام ۱ رو رفتم، یه کیلو اضافه شد ‖ A: خب. ‖ U: نیم کیلو بود نه یه کیلو', rec: { steps: [{ text: 'رژیمِ هفتهٔ اول', closed: 'no', what: 'یک کیلو اضافه شد' }] } });
    await ev((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.live.steps[0].out.from = 'page'; APP.S.put(pg); }, x.pid);
    const r = await rFull(x.sid, { msg: 'یه کیلو اضافه شد', what: 'step', fix: 'نیم کیلو' }, 'نیم کیلو بود نه یه کیلو'); const q = await asks(x.sid), s = await snap(x.pid, x.sid);
    return { ok: q.some(a => /^out:/.test(a.path) && /نیم کیلو/.test(a.new)) && s.steps[0].out.done === 'no', got: { r, q, s: s.steps } }; });
  // D·6 s34: نسخهٔ خودش در کارتِ 🌱 پرسیده می‌شود
  await T('D·6 s34 🌱 check-in copy asks', async () => { const x = await setup({ chat: 'U: امروز سه تا اسکیس کشیدم ‖ A: آفرین. ‖ U: سه تا نه، دو تا بود' });
    await ev((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.will = { steps: [{ id: 'ws0', at: new Date().toISOString(), step: 'هر روز اسکیس', when: 'امروز', due: APP.today(), checks: [{ at: new Date().toISOString(), done: 'yes', what: 'امروز سه تا اسکیس کشیدم' }] }], log: [] }; APP.S.put(pg); }, x.pid);
    const r = await rFull(x.sid, { msg: 'سه تا اسکیس کشیدم', what: 'fact', fix: 'دو تا' }, 'سه تا نه، دو تا بود'); const q = await asks(x.sid);
    return { ok: q.some(a => /^willck:/.test(a.path) && /دو تا اسکیس/.test(a.new) && /🌱/.test(a.label)), got: { r, q } }; });
  // C21-4 s22 «صبح ⇐ ظهر»: صورتی که از دو پیام ساخته شد یک span برای هر پیام دارد؛ فقط بندِ پیامِ ۱ عوض می‌شود
  await T('C21-4 s22 composed statement follows only its span', async () => { const x = await setup({ chat: 'U: ساعت ۹ صبح نگهبان دیدم ‖ A: کی گزارشش رو نوشت؟ ‖ U: همون صبح. ‖ A: خب. ‖ U: ظهر بود نه صبح' });
    const st = await ev((x) => { const r = APP.S.get('eprob_' + x.pid); r.p.statement = 'نگهبان صبح ساعت ۹ دید و همان صبح گزارش نوشت'; r.src = APP.liveSrcMulti(x.sid, r.p.statement, 'stmt'); r.srcMid = r.src && r.src.mid; APP.S.put(r); return r.src; }, x);
    const r = await rLive(x.pid, x.sid, 0, { frag: 'صبح', fix: 'ظهر', what: 'fact', by: x.mids[2] }); const s = await snap(x.pid, x.sid);
    return { ok: st && (st.parts || []).length === 2 && s.stmt === 'نگهبان ظهر ساعت ۹ دید و همان صبح گزارش نوشت' && s.stmtH === 1, got: { st, r, stmt: s.stmt } }; });
  // C21-16 s25 + C21-4: صورتی که در نوبتِ «[سامانه]» پر شد منبعش پیامِ خودِ اوست، نه نوبتِ سامانه
  await T('C21-16 fill in a «[سامانه]» turn ⇒ src = her message', async () => { const o = await ev(() => { const S = APP.S, t0 = Date.now() - 6e5, mk = (role, text, k) => ({ role, text, at: new Date(t0 + k * 1e3).toISOString() });
      const m1 = mk('user', 'تابه‌م ۲۵ در ۳۵ ـه و نمی‌دونم کیک چقدر بپزه', 0), m2 = mk('ai', 'باشه.', 1), m3 = mk('user', '[سامانه: «🔭» باز شد؛ فیلدها را پر کن]', 2);
      const se = { id: APP.uid('achat'), type: 'achat', msgs: [m1, m2, m3], steps: [], files: [], reports: [] }; se.fills = [{ src: APP.liveMsgId(m3), sig: 'lpNewS', at: new Date(t0 + 2500).toISOString(), val: 'تابه‌ام ۲۵ در ۳۵ است و نمی‌دانم کیک چقدر بپزد' }]; S.put(se);
      const r = APP.liveCreate('تابه‌ی ۲۵×۳۵', 'تابه‌ام ۲۵ در ۳۵ است و نمی‌دانم کیک چقدر بپزد', 'find', { by: 'user', nat: 'practical' }); return { mid: r.src && r.src.mid, want: APP.liveMsgId(m1), sys: APP.liveMsgId(m3) }; });
    return { ok: o.mid === o.want, got: o }; });
  // C21-4 s23 «۲۵×۳۵ ⇐ ۳۰×۴۰»: عنوان و صورت پیرو؛ «حل شد» ِ بر پایهٔ همان داده کنار می‌رود و اجرا باز می‌شود
  await T('C21-4 s23 title+statement follow; «حل شد» set aside', async () => { const x = await setup({ chat: 'U: تابه‌م ۲۵ در ۳۵ ـه ‖ A: خب. ‖ U: تابه ۳۰ در ۴۰ بود، اشتباه گفتم', rec: { stmt: [0, 'تابه‌م ۲۵ در ۳۵ ـه'], plan: [null, 'ضریبِ مساحت را حساب کنم'], dl: [[null, 'زمانِ پخت']] } });
    await ev((pid) => { const r = APP.S.get('eprob_' + pid); r.p.title = 'تابه‌ی ۲۵×۳۵'; APP.S.put(r); const pg = APP.S.get('eprog_' + pid), L = pg.solve.live; L.state = 'solved'; L.stateAt = new Date().toISOString(); L.chat = { sess: '', solution: 'ضریب ۲٫۸', at: new Date().toISOString(), srcSet: true }; APP.S.put(pg); }, x.pid);
    const r = await rLive(x.pid, x.sid, 0, { frag: '۲۵ در ۳۵', fix: '۳۰ در ۴۰', what: 'fact', by: x.mids[1] });
    const o = await ev((pid) => { const r = APP.S.get('eprob_' + pid), L = APP.S.get('eprog_' + pid).solve.live; return { st: r.p.statement, ti: r.p.title, state: L.state, ph: APP.livePhase(pid), why: (L.reopened || {}).why || '' }; }, x.pid);
    return { ok: /۳۰ در ۴۰/.test(o.st) && /۳۰×۴۰/.test(o.ti) && o.state === 'open' && o.ph === 'c' && /عوض شد/.test(o.why), got: { r, o } }; });
  // D·5 s37: «بله» به نسخهٔ صفحه حکمِ بر پایهٔ همان داده را کنار می‌زند (A21-6: حکمِ «اثبات شد» هم)
  await T('D·5/A21-6 copy-yes sets aside the dependent verdict', async () => { const x = await setup({ chat: 'U: تیم سه نفره است ‖ A: خب. ‖ U: سه نفره نه، چهار نفره بود', rec: { dl: [[null, 'تیمِ سه نفره']] } });
    await ev((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.b = { 1: { verdict: 'proved', chkHow: 'با تیمِ سه نفره همهٔ حالت‌ها را شمردم', chkMsgs: [], at: new Date().toISOString(), done: true } }; APP.S.put(pg); }, x.pid);
    const r = await rFull(x.sid, { msg: 'تیم سه نفره است', what: 'fact', fix: 'چهار نفره' }, 'سه نفره نه، چهار نفره بود'); const q = await asks(x.sid);
    const a = q[0] ? await ev(([sid, id]) => APP.liveCopyAnswer(sid, id, true), [x.sid, q[0].id]) : null; const s = await snap(x.pid, x.sid);
    return { ok: q.length === 1 && a && a.ok && /چهار نفره/.test(s.dl[0]) && s.verdict && s.verdict.v === 'unverified' && s.verdict.sup, got: { r, q, a, s: s.verdict } }; });
  // D·3 s38: موعد — span بندِ خودِ او، یادآور پیرو، سطرِ فارسی با نامِ روز
  const nextWdL = (pw) => nextWd(pw);
  await T('D·3 s38 deadline span is her clause; reminder follows', async () => { const th = nextWdL(5); const x = await dlSess('یادم بنداز پنجشنبه فرم رو بفرستم، فرمش سه صفحه‌ست', { do: 'deadline', what: 'فرستادنِ فرم', date: th });
    for (let i = 0; i < 4; i++) await pushU(x.sid, 'پیامِ دیگر ' + i);
    await pushU(x.sid, 'فرم رو جمعه باید بفرستم نه پنجشنبه'); await ev(() => { window.__rem = []; });
    const r = await rFull(x.sid, { msg: 'پنجشنبه فرم رو بفرستم', what: 'plan', fix: 'جمعه' }, 'فرم رو جمعه باید بفرستم نه پنجشنبه');
    const d = await ev((sid) => APP.S.all('deadline', y => y.src && y.src.sess === sid).map(y => ({ date: y.date, span: y.src.span, h: (y.fixHist || []).length })), x.sid), rem = await ev(() => window.__rem.map(y => y.due_date || y.date || ''));
    return { ok: d.length === 1 && d[0].date === addD(th, 1) && /پنجشنبه/.test(d[0].span) && !/سه صفحه/.test(d[0].span) && d[0].h === 1 && /جمعه/.test(r.note), got: { d, r, rem } }; });
  // D·4 s37 / C21-14: نتیجه به مدل همان ساختار است — رد هم note دارد و در دفترِ سشن می‌ماند
  await T('D·4 refusal has the one result shape and is logged', async () => { const x = await bare('U: جوابم ۴۲ ـه ‖ A: خب.'); const r = await rFull(x.sid, { msg: 'جوابم ۴۲ ـه', what: 'ans', fix: '۴۲' }, 'جوابم ۴۲ ـه');
    const lg = await ev((sid) => (APP.S.get(sid).retracts || []).filter(y => y.refused).length, x.sid); return { ok: !r.ok && shapeOk(r) && /^ثبت نشد/.test(r.note) && lg === 1, got: { r, lg } }; });
  // C21-13 / D·11: پروندهٔ سشن — عنوانِ مسئلهٔ زنده و پیوند؛ بی کلیدِ خام
  await T('C21-13 session dossier names the live problem; no raw keys', async () => { const x = await setup({ title: 'مسئلهٔ مهلتِ رسید', chat: 'U: رسیدش ۱۲ مهر بود ‖ A: خب.' });
    await ev((sid) => { const se = APP.S.get(sid); se.coachEv = [{ at: new Date().toISOString(), ph: 'u', ok: true, src: 'chatok', key: 'chatok|u|رسیدش ۱۲ مهر بود', msg: APP.liveMsgId(se.msgs[0]) }, { at: new Date().toISOString(), ph: 'c', ok: true, src: 'chat', key: 'chat|c|x|rebook:u5', rebook: { from: 'u1' } }]; APP.S.put(se); }, x.sid);
    const D = await ev((sid) => { const D = APP.dossierSess(sid); return { st: D.statement, lives: D.lives, md: APP.dossierMd(sid) }; }, x.sid);
    return { ok: /مسئلهٔ مهلتِ رسید/.test(D.st) && !/بی مسئلهٔ زنده/.test(D.st) && D.lives.length === 1 && !RAW.test(D.md), got: D }; });
  // A21-2: پس از نتیجهٔ گام با تأملِ خودش، پرسشِ نوبت به گامِ بعد می‌رود — نه e1 ِ «پیش از این گام» ِ گامی که نیست
  await T('A21-2 turn question after an outcome moves on', async () => { const x = await setup({ chat: 'U: انجام دادم ‖ A: خب.', rec: { dl: [[null, 'داده']], plan: [null, 'طرح'] }, nat: 'life' });
    const qs = await ev((pid) => { const pg = APP.S.get('eprog_' + pid), L = pg.solve.live, t0 = new Date(Date.now() - 3600e3).toISOString();
      L.steps.push({ id: 'sA', text: 'با صاحبخونه حرف بزنم', pred: 'قبول می‌کند', conf: 60, at: t0, due: APP.today(), closed: true, out: { at: t0, d: APP.today(), done: 'yes', what: 'قبول نکرد', match: 'no', prog: 'کمی', reflect: 'فاصله زیاد بود چون فرضم غلط بود', gapWhy: 'فرضم غلط بود' } }); APP.S.put(pg);
      const o = []; ['خب', 'بعدش چی؟', 'باشه'].forEach(t => { const c = APP.liveCoach(pid, { turn: { text: t } }); o.push(c && c.q || ''); }); return o; }, x.pid);
    return { ok: qs.every(q => !/پیش از این گام|کی انجامش/.test(q)), got: qs }; });
  // A21-4: محاوره ⇄ نوشتار («خونه» ≡ «خانه»)
  await T('A21-4 colloquial vs written copy asks', async () => { const x = await setup({ chat: 'U: قیمت خونه‌ی بابا حدوداً ۸ میلیارده ‖ A: خب. ‖ U: ۸ نه، ۱۱ میلیارد بود', rec: { dl: [[null, 'قیمتِ خانهٔ پدر ۸ میلیارد']] } });
    const r = await rFull(x.sid, { msg: 'قیمت خونه‌ی بابا حدوداً ۸ میلیارده', what: 'fact', fix: '۱۱ میلیارد' }, '۸ نه، ۱۱ میلیارد بود'); const q = await asks(x.sid);
    return { ok: q.length === 1 && /۱۱ میلیارد/.test(q[0].new), got: { r, q } }; });
  // A21-7: شرطی که همان واقعیت را دارد پرسیده می‌شود؛ داوریِ «متناقض است» دوباره سنجیده می‌شود
  await T('A21-7 condition copy asks; «متناقض» set aside', async () => { const x = await setup({ chat: 'U: سه نفر باید هر روز بیان ‖ A: خب. ‖ U: سه نفر نه، دو نفر، اشتباه گفتم', rec: { dl: [[0, 'سه نفر']], c: [null, 'سه نفر هر روز حاضر باشند'] } });
    await ev((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.live.suffLog = [{ at: new Date().toISOString(), ans: 'متناقض است', why: 'x', where: 'u' }]; APP.S.put(pg); }, x.pid);
    const r = await rFull(x.sid, { msg: 'سه نفر باید هر روز بیان', what: 'fact', fix: 'دو نفر' }, 'سه نفر نه، دو نفر، اشتباه گفتم'); const q = await asks(x.sid);
    const sf = await ev((pid) => { const L = APP.S.get('eprog_' + pid).solve.live; return L.suffLog[L.suffLog.length - 1].ans; }, x.pid);
    return { ok: q.some(a => a.path === 'u.c') && sf === 'هنوز نمی‌دانم', got: { r, q, sf } }; });
  // A21-14: برنامهٔ یک مسئله در پروندهٔ مسئلهٔ دیگر نیست؛ سرتیترِ دوتایی نیست
  await T('A21-14 plan scoped to its problem; no doubled heading', async () => { const x = await setup({ title: 'مسئلهٔ الف', chat: 'U: برنامه‌م اینه که فردا زنگ بزنم ‖ A: خب.' });
    const o = await ev((x) => { const S = APP.S, se = S.get(x.sid), t0 = Date.parse(se.msgs[0].at); const r2 = APP.liveCreate('مسئلهٔ ب', 'مسئلهٔ دومِ همین گفت‌وگو را می‌خواهم حل کنم', 'find', { by: 'user', nat: 'life' });
      se.lprobLog = [{ p: x.pid, at: new Date(t0 - 1e3).toISOString() }, { p: r2.p.id, at: new Date(t0 + 5e3).toISOString() }]; se.lprob = r2.p.id;
      se.plans = [{ id: 'pl1', text: 'فردا زنگ بزنم', at: se.msgs[0].at, src: APP.liveMsgId(se.msgs[0]), when: APP.addDays(APP.today(), 1) }]; S.put(se);
      const a = APP.dossier(x.pid).events.filter(e => e.k === 'cplan').length, b = APP.dossier(r2.p.id).events.filter(e => e.k === 'cplan').length;
      APP.go('dossier', x.pid); const t = document.querySelector('main .lp-dossier').textContent; return { a, b, dbl: /از گفت‌وگو\s*—\s*از گفت‌وگو|\(از گفت‌وگو\)\s*—\s*از گفت‌وگو/.test(t) }; }, x);
    return { ok: o.a === 1 && o.b === 0 && !o.dbl, got: o }; });
  // A21-19: پیامِ اصلاح نامزدِ «کدام را اصلاح کنم؟» نیست؛ ✏️ ِ تکراری «پیش‌تر اصلاح شده بود»
  await T('A21-19 correction message is no candidate; repeated ✏️ honest', async () => { const x = await setup({ chat: 'U: پنجشنبه می‌رم بانک ‖ A: خب. ‖ U: پنجشنبه نه، شنبه می‌رم بانک، اشتباه گفتم', rec: { plan: [0, 'پنجشنبه می‌رم بانک'] } });
    const c = await ev((sid) => APP.liveRetractCands(sid).map(y => y.msg), x.sid);
    const e1 = await rEdit(x.sid, 0, 'شنبه می‌رم بانک'); await ev((sid) => { const se = APP.S.get(sid), m = se.msgs[0]; APP.liveEditCommit(sid, APP.liveMsgId(m), 'شنبه می‌رم بانک', {}); }, x.sid);
    const e2 = await rEdit(x.sid, 0, 'شنبه می‌رم بانک!');
    const hook = await ev((sid) => { const s = APP.S.get(sid); return APP.ASSIST.promptHooks.map(f => { try { return f(s, '') || ''; } catch (e) { return ''; } }).join('\n'); }, x.sid);
    return { ok: !c.some(t => /اشتباه گفتم/.test(t)) && e1.n >= 1 && !/هیچ رکوردی ساخته نشده/.test(hook), got: { c, e1, e2, hook: hook.slice(0, 300) } }; });
  // A21-21: ساختهٔ ساعتِ آزمایشی در حالتِ توسعه پس از برگشت به صفر دیده می‌ماند
  await T('A21-21 simClock records stay visible in dev', async () => { const o = await ev(() => { const C = APP.clock, d0 = C.dev, o0 = C.off; C.dev = true; C.off = 3; const r = APP.S.put({ id: 'r21sim', type: 'note', t: 'x' }); C.off = 0; const seen = APP.S.all('note').some(y => y.id === 'r21sim'); C.dev = false; const hid = !APP.S.all('note').some(y => y.id === 'r21sim'); C.dev = d0; C.off = o0; APP.S.del('r21sim'); return { sim: r.simClock, seen, hid }; });
    return { ok: !!o.sim && o.seen && o.hid, got: o }; });
  // D·s31 (R9): مسئله‌های تازهٔ بازنگری در خودِ بازنگری می‌مانند
  const backSess = async () => { const x = await setup({ chat: 'U: حل شد ‖ A: آفرین. بازنگری کنیم؟', rec: { plan: [null, 'طرح'] } });
    await ev((pid) => { const pg = APP.S.get('eprog_' + pid), L = pg.solve.live; L.state = 'solved'; L.stateAt = new Date().toISOString(); pg.solve.b = { 1: { done: true, at: new Date().toISOString(), use: 'حالت‌های کوچک', from: 'chat' } }; APP.S.put(pg); }, x.pid); return x; };
  await T('D·s31 look-back new problems kept', async () => { const x = await backSess();
    const r = await actTurn(x.sid, 'سه تا مسئله‌ی جدید به ذهنم رسید: بیشترین حاصل‌ضرب با جمع ۱۲، با جمع ۱۰ و سه عدد، و با جمع ۱۰ و اعدادِ اعشاری', [{ do: 'chat_invent', title: 'جمع ۱۲', statement: 'بیشترین حاصل‌ضربِ دو عدد با جمعِ ۱۲ چیست؟' }, { do: 'chat_invent', title: 'سه عدد', statement: 'بیشترین حاصل‌ضربِ سه عدد با جمعِ ۱۰ چیست؟' }, { do: 'chat_invent', title: 'اعشاری', statement: 'بیشترین حاصل‌ضرب با جمعِ ۱۰ وقتی اعدادِ اعشاری هم مجازند؟' }]);
    const o = await ev((x) => ({ n: (APP.S.get('eprog_' + x.pid).solve.b[1].newProbs || []).length, lives: APP.liveAll().filter(y => y.origin && y.origin.id === x.pid).length, ev: APP.dossier(x.pid).events.filter(e => e.k === 'newprobs').length }), x);
    return { ok: o.n === 3 && o.lives === 0 && o.ev === 1, got: { o, r } }; });

  /* ================= بانکِ VARIANTS_R21 (هر ورودیِ سازوکارهای این سهم) ================= */
  const NC = (why) => ({ nc: why });
  const runBank = async (rc, map) => {
    const R = bankRes[rc] = { n: 0, pass: 0, fail: [], nc: [] };
    for (let gi = 0; gi < bank.length; gi++) { const e = bank[gi]; if (e.rc !== rc) continue; R.n++; const f = map[gi]; if (!f) { R.nc.push('#' + gi + ' (no check)'); continue; }
      let r; try { r = typeof f === 'function' ? await f(e) : f; } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.message || ex).split('\n')[0] }; }
      if (r.nc) { R.nc.push('#' + gi + ' ' + r.nc); continue; }
      if (r.ok) R.pass++; else { R.fail.push('#' + gi); errors.push(rc + ' #' + gi + ' ' + e.kind + ' — ' + e.expect.slice(0, 110) + ' got ' + J(r.got).slice(0, 500)); } }
  };
  const ref = (name) => ({ ok: !!res[name], got: 'see ' + name });
  const COACH = 'coach (a27/a29) — model-side signal, chat-store or prompt wording';
  await runBank('R3.correction_reach', {
    55: ref('B·D3 s17 units: 200 m^2 ≡ ۲۰۰ مترمربع asks'),
    56: async () => { const x = await setup({ chat: 'U: مساحت ۲۰۰ مترمربعه ‖ A: خب. ‖ U: مساحت‌و ۲۰۰ مترمربع گفته بودم، ۲۲۰ ـه، اشتباه گفتم', rec: { dl: [[null, 'مساحت: ۲۰۰ متر مربع']] } });
      await rFull(x.sid, { msg: 'مساحت ۲۰۰ مترمربعه', what: 'fact', fix: '۲۲۰' }, 'مساحت‌و ۲۰۰ مترمربع گفته بودم، ۲۲۰ ـه، اشتباه گفتم'); const q = await asks(x.sid);
      const a = q[0] ? await ev(([sid, id]) => APP.liveCopyAnswer(sid, id, true), [x.sid, q[0].id]) : null; const s = await snap(x.pid, x.sid); return { ok: q.length === 1 && /۲۲۰/.test(s.dl[0]) && s.dlH === 1, got: { q, s: s.dl } }; },
    57: ref('B·D3 s19 step outcome copy (یه ≡ یک) asks'),
    58: ref('D·6 s34 🌱 check-in copy asks'),
    59: async () => { const x = await setup({ chat: 'U: روزی ۸ ساعت کار می‌کنم ‖ A: خب. ‖ U: ۹ ساعته، ببخشید اشتباه گفتم', rec: { dl: [[null, '۸ ساعت کار در روز']] } });
      await rFull(x.sid, { msg: 'روزی ۸ ساعت کار می‌کنم', what: 'fact', fix: '۹ ساعت' }, '۹ ساعته، ببخشید اشتباه گفتم'); const q = await asks(x.sid);
      const y = await setup({ chat: 'U: روزی ۸ ساعت کار می‌کنم ‖ A: خب. ‖ U: ۹ ساعته، ببخشید اشتباه گفتم', rec: { dl: [[null, 'کارِ روزانهٔ من: ۸']] } });
      await rFull(y.sid, { msg: 'روزی ۸ ساعت کار می‌کنم', what: 'fact', fix: '۹', key: 'field:lpD_d1' }, '۹ ساعته، ببخشید اشتباه گفتم'); const q2 = await asks(y.sid);
      return { ok: q.length === 1 && /داده‌ها/.test(q[0].label) && q[0].field === 'dl:d1' && q2.length === 1, got: { q, q2 } }; },
    60: ref('C21-4 s22 composed statement follows only its span'),
    61: ref('C21-4 s23 title+statement follow; «حل شد» set aside'),
    62: async () => { const x = await setup({ chat: 'U: رسیدش ۱۲ مهر بود؛ مبلغ ۳ میلیون؛ امضای معاون داشت ‖ A: خب. ‖ U: تاریخش ۱۴ مهر بود، اشتباه گفتم', rec: { dl: [[0, 'رسیدش ۱۲ مهر بود'], [0, 'مبلغ ۳ میلیون'], [0, 'امضای معاون داشت']], g: [0, 'قبل از مهلت رسیده'] } });
      await ev((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.g[1].test = 'تاریخِ رسید (۱۲ مهر) را با مهلت سنجیدم'; pg.solve.g[1].hit = 'درست بود'; APP.S.put(pg); }, x.pid);
      const r = await rFull(x.sid, { msg: 'رسیدش ۱۲ مهر بود', what: 'fact', fix: '۱۴ مهر' }, 'تاریخش ۱۴ مهر بود، اشتباه گفتم'); const s = await snap(x.pid, x.sid);
      const g = await ev((pid) => { const g = APP.S.get('eprog_' + pid).solve.g[1]; return { hit: g.hit || '', sup: !!g.outSup }; }, x.pid);
      return { ok: /۱۴ مهر/.test(s.dl[0]) && s.dl[1] === 'مبلغ ۳ میلیون' && s.dl[2] === 'امضای معاون داشت' && g.sup && !g.hit, got: { r, s: s.dl, g } }; },
    63: async () => { const x = await setup({ chat: 'U: ۵ تا تخم مرغ لازمه؛ فر ۱۸۰ درجه ‖ A: خب. ‖ U: ۴ تا تخم مرغ بود، اشتباه گفتم', rec: { dl: [[0, '۵ تا تخم مرغ لازمه'], [0, 'فر ۱۸۰ درجه']] } });
      await ev((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.b = { 1: { verdict: 'verified', chkHow: 'با ۵ تا تخم‌مرغ شمردم و درست درآمد', chkMsgs: [], at: new Date().toISOString(), done: true } }; APP.S.put(pg); }, x.pid);
      await rFull(x.sid, { msg: '۵ تا تخم مرغ لازمه', what: 'fact', fix: '۴ تا' }, '۴ تا تخم مرغ بود، اشتباه گفتم'); const s = await snap(x.pid, x.sid);
      return { ok: /۴ تا/.test(s.dl[0]) && s.dl[1] === 'فر ۱۸۰ درجه' && s.verdict.v === 'unverified' && s.verdict.sup, got: s }; },
    64: async () => { const x = await setup({ chat: 'U: ۵ تا تخم مرغ؛ فر ۱۸۰ ‖ A: خب. ‖ U: ۴ تا تخم مرغ بود، اشتباه گفتم', rec: { dl: [[0, '۵ تا تخم مرغ'], [0, 'فر ۱۸۰']] } });
      await ev((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.b = { 1: { verdict: 'verified', chkHow: 'دمای فر ۱۸۰ را با دماسنج دیدم', chkMsgs: [], at: new Date().toISOString(), done: true, use: 'دمای فر مهمه' } }; APP.S.put(pg); }, x.pid);
      await rFull(x.sid, { msg: '۵ تا تخم مرغ', what: 'fact', fix: '۴ تا' }, '۴ تا تخم مرغ بود، اشتباه گفتم'); const s = await snap(x.pid, x.sid);
      return { ok: /۴ تا/.test(s.dl[0]) && s.use === 'دمای فر مهمه' && s.verdict.v === 'verified', got: s }; },
    65: ref('D·3 s38 deadline span is her clause; reminder follows'),
    66: async () => { const iso = await ev(() => APP.liveFaDateIso('۳۰ مهر', APP.today())); if (!iso || iso < await ev(() => APP.today())) return NC('the date ۳۰ مهر is already past on this machine');
      const x = await dlSess('مهلت ثبت‌نام تا ۳۰ مهره', { do: 'deadline', what: 'ثبت‌نام', date: iso }); await pushU(x.sid, 'مهلتش تا ۲ آبانه، اشتباه گفتم');
      const r = await rFull(x.sid, { msg: 'مهلت ثبت‌نام تا ۳۰ مهره', what: 'plan', fix: '۲ آبان' }, 'مهلتش تا ۲ آبانه، اشتباه گفتم');
      const d = await ev((sid) => APP.S.all('deadline', y => y.src && y.src.sess === sid).map(y => y.date), x.sid);
      return { ok: d.length === 1 && d[0] === addD(iso, 2) && /شنبه/.test(r.note) && /آبان/.test(r.note), got: { d, r } }; },
    67: async () => { const x = await setup({ chat: 'U: درسم اینه: اول حالت خاص رو امتحان کنم، با یه صفحه ببُرم ‖ A: خوب. ‖ U: اولی رو این‌جوری درست کن: اول شکل بکشم', rec: { verdict: [0, 'با n=۱ چک کردم'], lesson: [0, 'اول حالت خاص رو امتحان کنم، با یه صفحه ببُرم'] } });
      await rLive(x.pid, x.sid, 0, { frag: 'اول حالت خاص رو امتحان کنم', fix: 'اول شکل بکشم', what: 'lesson', by: x.mids[1] }); const s = await snap(x.pid, x.sid);
      return { ok: /اول شکل بکشم/.test(s.use) && /با یه صفحه ببُرم/.test(s.use) && s.verdict.v === 'verified', got: s }; },
    68: async () => { const x = await setup({ chat: 'U: مخزن بتنی ۲۰ مترمکعبی، دیوار ۳ متر، ۴ ستون ‖ A: خب.', rec: { plan: [0, 'مخزن بتنی ۲۰ مترمکعبی'], dl: [[0, 'دیوار ۳ متر']] } });
      const r = await rEdit(x.sid, 0, 'مخزن بتنی ۲۵ مترمکعبی، دیوار ۳ متر، ۶ ستون'); const s = await snap(x.pid, x.sid);
      const parts = await ev((sid) => (APP.S.get(sid).msgs[0].corr || []).map(c => c.frag + '>' + c.fix), x.sid);
      return { ok: s.plan.t === 'مخزن بتنی ۲۵ مترمکعبی' && s.dl[0] === 'دیوار ۳ متر' && parts.length === 2 && r.changed.some(c => /طرح/.test(c)), got: { r, s: s.plan, parts } }; },
    69: async () => { const x = await setup({ chat: 'U: حدسم ۱۲ ـه و ۱۵ دقیقه طول کشید ‖ A: خب.', rec: { g: [0, '۱۲'] } });
      await rEdit(x.sid, 0, 'حدسم ۱۴ ـه و ۲۰ دقیقه طول کشید'); const s = await snap(x.pid, x.sid); const parts = await ev((sid) => (APP.S.get(sid).msgs[0].corr || []).map(c => c.frag + '>' + c.fix), x.sid);
      return { ok: s.g.t === '۱۴' && parts.length === 2 && parts.some(t => /۱۲.*۱۴/.test(t)) && parts.some(t => /۱۵.*۲۰/.test(t)), got: { g: s.g, parts } }; },
    70: async () => { const x = await bare('U: جوابم ۳۰ ـه ‖ A: خب. ‖ U: اون ۳۰ رو اشتباه زدم'); const r = await rFull(x.sid, { msg: 'جوابم ۳۰ ـه', what: 'ans', fix: '' }, 'اون ۳۰ رو اشتباه زدم');
      return { ok: !r.ok && shapeOk(r) && r.ask.length === 1 && r.ask[0].field === 'value' && /مقدارِ درست/.test(r.note), got: r }; },
    71: async () => { const x = await setup({ chat: 'U: امروز خیلی خسته‌ام، حدسم ۱۲ ـه ‖ A: خب. ‖ U: خسته نبودم، اشتباه گفتم', rec: { g: [0, '۱۲'] } });
      const r = await rFull(x.sid, { msg: 'امروز خیلی خسته‌ام', what: 'said', fix: 'خسته نبودم' }, 'خسته نبودم، اشتباه گفتم'); const s = await snap(x.pid, x.sid);
      return { ok: r.ok && r.changed.length === 0 && /رکوردی ساخته نشده بود/.test(r.note) && s.g.t === '۱۲' && shapeOk(r), got: r }; },
    72: async () => { const x = await setup({ chat: 'U: روزی ۸ ساعت کار می‌کنم ‖ A: خب. ‖ U: چیزی که گفتم غلط بود، اون ۸ ساعت نه ۷', rec: { dl: [[0, 'روزی ۸ ساعت کار']] } });
      await rFull(x.sid, { msg: 'روزی ۸ ساعت کار می‌کنم', what: 'fact', fix: '۷' }, 'چیزی که گفتم غلط بود، اون ۸ ساعت نه ۷');
      const h = await ev((sid) => { const s = APP.S.get(sid); s.msgs.push({ role: 'user', text: 'خب', at: new Date(Date.now() + 1000).toISOString() }); return APP.ASSIST.promptHooks.map(f => { try { return f(s, 'خب') || ''; } catch (e) { return ''; } }).join('\n'); }, x.sid);
      return { ok: /نتیجهٔ صفحه/.test(h) && /۷/.test(h), got: h.slice(0, 400) }; },
    73: ref('D·4 refusal has the one result shape and is logged'),
    74: ref('D·5/A21-6 copy-yes sets aside the dependent verdict'),
    75: async () => { const x = await setup({ chat: 'U: بارش ۲۰۰ میلی‌متر ‖ A: خب. ‖ U: ببخشید ۲۵۰ ـه، اشتباه گفتم', rec: { dl: [[0, 'بارش ۲۰۰ میلی‌متر']] } });
      const r = await rFull(x.sid, { msg: 'بارش ۲۰۰ میلی‌متر', what: 'fact', fix: '۲۵۰' }, 'ببخشید ۲۵۰ ـه، اشتباه گفتم'); return { ok: r.changed.some(c => /۲۰۰/.test(c.old) && /۲۵۰/.test(c.new)) && /۲۰۰/.test(r.note) && /۲۵۰/.test(r.note), got: r }; },
    76: async () => { const x = await bare('U: هفته‌ی هشتم وزنم ۷۴ شد ‖ A: خب. ‖ U: ۷۴ و نیم بود، اشتباه گفتم'); await ev((x) => APP.liveMeasBook(x.sid, x.mids[0]), x);
      const r = await rSess(x.sid, { msg: 'هفته‌ی هشتم وزنم ۷۴ شد', what: 'fact', fix: '۷۴ و نیم' }, '۷۴ و نیم بود، اشتباه گفتم');
      const o = await ev((sid) => { const se = APP.S.get(sid); return { y: APP.liveMeasLog(sid).map(l => l.pts.map(p => p.y)), corr: (se.msgs[0].corr || []).length }; }, x.sid);
      return { ok: r.changed.some(c => c.kind === 'measure') && J(o.y) === J([[74.5]]) && o.corr === 1, got: { r, o } }; },
    77: NC(COACH + ' (re-book of the result act and «از کجا؟»)'),
    78: async () => { const x = await setup({ chat: 'U: پیشنهادِ کارِ دوم ۳۲ میلیونه ‖ A: خب. ‖ U: ۳۲ نه، ۳۵ بود، اشتباه گفتم', rec: { dl: [[null, 'پیشنهادِ کارِ دوم ۳۲ میلیون']] } });
      await ev((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.u[1].prac = { vague: 'مثلاً «پیشنهادِ کارِ دوم ۳۲ میلیون»', measure: '' }; APP.S.put(pg); }, x.pid);
      await rFull(x.sid, { msg: 'پیشنهادِ کارِ دوم ۳۲ میلیونه', what: 'fact', fix: '۳۵' }, '۳۲ نه، ۳۵ بود، اشتباه گفتم'); const q = await asks(x.sid);
      return { ok: q.length === 1 && q[0].path === 'dl:d1' && q.every(a => !RAW.test(a.label)), got: q }; },
    79: async () => { const x = await setup({ chat: 'U: بام ۲۰۰ مترمربع ‖ A: خب. ‖ U: اگه بام ۱۵۰ بود چی می‌شد؟', rec: { dl: [[null, 'بام ۲۰۰ مترمربع']] } }); const r = await rFull(x.sid, { msg: 'بام ۲۰۰ مترمربع', what: 'fact', fix: '۱۵۰' }, 'اگه بام ۱۵۰ بود چی می‌شد؟'); const q = await asks(x.sid); return { ok: !r.ok && q.length === 0, got: { r, q } }; },
    80: async () => { const x = await setup({ chat: 'U: ۲۰۰ لیتر آب ریختم ‖ A: خب. ‖ U: ۱۸۰ لیتر بود، اشتباه گفتم', rec: { dl: [[null, 'مساحت ۲۰۰ مترمربع']] } }); await rFull(x.sid, { msg: '۲۰۰ لیتر آب ریختم', what: 'fact', fix: '۱۸۰ لیتر' }, '۱۸۰ لیتر بود، اشتباه گفتم'); const q = await asks(x.sid); return { ok: q.length === 0, got: q }; },
    81: async () => { const x = await setup({ chat: 'U: پیشنهادِ کارِ دوم ۳۲ میلیونه ‖ A: خب. ‖ U: ۳۲ نه ۳۵' }); await ev((sid) => { const se = APP.S.get(sid); se.fills = [{ src: APP.liveMsgId(se.msgs[0]), sig: 'lpNewS', at: new Date().toISOString(), val: 'پیشنهادِ کارِ دوم ۳۲ میلیون' }]; APP.S.put(se); }, x.sid);
      await rFull(x.sid, { msg: 'پیشنهادِ کارِ دوم ۳۲ میلیونه', what: 'fact', fix: '۳۵' }, '۳۲ نه ۳۵'); const q = await asks(x.sid); return { ok: q.length === 0, got: q }; },
    82: async () => { const x = await setup({ chat: 'U: تابه ۲۵ در ۳۵؛ فر ۱۸۰ درجه ‖ A: خب. ‖ U: تابه ۳۰ در ۴۰ بود، اشتباه گفتم', rec: { dl: [[0, 'تابه ۲۵ در ۳۵'], [0, 'فر ۱۸۰ درجه']] } });
      await ev((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.b = { 1: { verdict: 'verified', chkHow: 'پخت ۴۰ دقیقه کافیه — با دمای فر ۱۸۰ درجه سنجیدم', chkMsgs: [], at: new Date().toISOString(), done: true } }; APP.S.put(pg); }, x.pid);
      await rFull(x.sid, { msg: 'تابه ۲۵ در ۳۵', what: 'fact', fix: '۳۰ در ۴۰' }, 'تابه ۳۰ در ۴۰ بود، اشتباه گفتم'); const s = await snap(x.pid, x.sid);
      return { ok: /۳۰ در ۴۰/.test(s.dl[0]) && s.verdict.v === 'verified', got: s }; },
    83: async () => { const x = await setup({ chat: 'U: درسم: اول حالت خاص، بعد شکل ‖ A: خوب. ‖ U: اولی رو درست کن: اول جدول', rec: { verdict: [0, 'چک'], lesson: [0, 'اول حالت خاص، بعد شکل'] } });
      await rLive(x.pid, x.sid, 0, { frag: 'اول حالت خاص', fix: 'اول جدول', what: 'lesson', by: x.mids[1] }); const s = await snap(x.pid, x.sid); return { ok: /بعد شکل/.test(s.use) && /جدول/.test(s.use), got: s.use }; },
    84: async () => { const x = await setup({ chat: 'U: جواب ۵۵ ـه ‖ A: خب.', rec: { chat: [0, 'جواب ۵۵ ـه'] } }); const r = await rEdit(x.sid, 0, 'جواب، ۵۵ ـه'); const s = await snap(x.pid, x.sid); return { ok: r.ok && r.n === 0 && !r.frag && s.chat.h === 0, got: r }; },
    85: async () => { const x = await dlSess('مهلت ۳۰ مهره', { do: 'deadline', what: 'فرستادن', date: addD(new Date().toISOString().slice(0, 10), 5) }); await pushU(x.sid, 'تصمیم گرفتم زودتر بفرستم، چهارشنبه');
      const r = await rFull(x.sid, { msg: 'مهلت ۳۰ مهره', what: 'plan', fix: 'چهارشنبه' }, 'تصمیم گرفتم زودتر بفرستم، چهارشنبه'); return { ok: !r.ok, got: r }; },
    86: async () => { const x = await setup({ chat: 'U: نیم ساعت طول کشید ‖ A: پس ۲۰ دقیقه. ‖ U: اون ۲۰ که گفتی غلطه' }); const r = await rFull(x.sid, { msg: 'پس ۲۰ دقیقه', what: 'fact', fix: '۳۰' }, 'اون ۲۰ که گفتی غلطه'); return { ok: !r.ok, got: r }; },
    87: async () => { const x = await setup({ chat: 'U: بام ۲۰۰ مترمربع ‖ A: خب. ‖ U: معلمم گفت «۲۰۰ نه، ۱۸۰ مترمربعه»', rec: { dl: [[0, 'بام ۲۰۰ مترمربع']] } }); const r = await rFull(x.sid, { msg: 'بام ۲۰۰ مترمربع', what: 'fact', fix: '۱۸۰' }, 'معلمم گفت «۲۰۰ نه، ۱۸۰ مترمربعه»'); const s = await snap(x.pid, x.sid); return { ok: !r.ok && s.dlH === 0, got: r }; },
    88: async () => { const x = await setup({ chat: 'U: بام ۲۰۰ ـه ‖ A: خب. ‖ U: بام ۱۸۰ ـه نه ۲۰۰', rec: { dl: [[null, 'بامِ انبار ۲۰۰ مترمربع']] } }); await rFull(x.sid, { msg: 'بام ۲۰۰ ـه', what: 'fact', fix: '۱۸۰' }, 'بام ۱۸۰ ـه نه ۲۰۰'); const q = await asks(x.sid);
      if (!q[0]) return { ok: false, got: 'no ask' }; await ev(([sid, id]) => APP.liveCopyAnswer(sid, id, false), [x.sid, q[0].id]); await rFull(x.sid, { msg: 'بام ۲۰۰ ـه', what: 'fact', fix: '۱۸۰' }, 'بام ۱۸۰ ـه نه ۲۰۰'); const q2 = await asks(x.sid), s = await snap(x.pid, x.sid);
      return { ok: q2.length === 1 && q2[0].state === 'no' && /۲۰۰/.test(s.dl[0]), got: { q2, s: s.dl } }; },
    89: async () => { const x = await setup({ chat: 'U: وزنم ۷۴ ـه ‖ A: خب. ‖ U: ۷۴ و نیم بود نه ۷۴ ‖ A: خب. ‖ U: آره همون ۷۴ و نیم', rec: { dl: [[0, 'وزنم ۷۴']] } });
      await rFull(x.sid, { msg: 'وزنم ۷۴ ـه', what: 'fact', fix: '۷۴ و نیم' }, '۷۴ و نیم بود نه ۷۴'); const r2 = await rFull(x.sid, { msg: 'وزنم ۷۴ ـه', what: 'fact', fix: '۷۴ و نیم' }, 'آره همون ۷۴ و نیم'); const s = await snap(x.pid, x.sid); return { ok: s.dlH === 1, got: { r2, s: s.dl, h: s.dlH } }; },
    90: async () => { const x = await setup({ chat: 'U: قند خوردم ‖ A: خب. ‖ U: دیروز اشتباه کردم و قند زیاد خوردم' }); const r = await rFull(x.sid, { msg: 'قند خوردم', what: 'fact', fix: 'قند زیاد' }, 'دیروز اشتباه کردم و قند زیاد خوردم'); return { ok: !r.ok, got: r }; },
    91: NC(COACH + ' (reply claim check)'),
    92: NC(COACH + ' (a spelling remark is not a value change — model-side signal)'),
  });
  await runBank('R4.dossier', {
    93: async () => { const x = await bare('U: یه معما: سه جعبه با برچسبِ غلط ‖ A: حدست؟ ‖ U: حدسم اینه از جعبهٔ «مخلوط» بردارم'); await ev((sid) => { const se = APP.S.get(sid), t = new Date().toISOString();
        se.coach = { guesses: [{ id: 'g1', text: 'از جعبهٔ «مخلوط» بردارم', at: t, res: 'confirmed' }, { id: 'g2', text: 'از جعبهٔ «سیب» بردارم', at: t, res: 'refuted' }], retracts: [] };
        se.plans = [{ id: 'pl1', text: 'فردا دوباره امتحان کنم', at: t }]; se.retracts = [{ at: t, mid: APP.liveMsgId(se.msgs[0]), by: 'model', frag: 'سه جعبه', fix: 'چهار جعبه', changed: [{ kind: 'stmt', label: 'صورت', old: 'سه جعبه', new: 'چهار جعبه' }] }];
        se.coachEv = [{ at: t, ph: 'p', ok: true, src: 'chatok', key: 'chatok|p|حدسم' }, { at: t, ph: 'b', ok: true, src: 'chat', key: 'chat|b|x|rebook:u5', how: 'selfcorr' }]; APP.S.put(se); }, x.sid);
      const D = await ev((sid) => { const D = APP.dossierSess(sid); return { ks: D.events.map(e => e.k), md: APP.dossierMd(sid) }; }, x.sid);
      return { ok: D.ks.filter(k => k === 'guess').length === 2 && D.ks.includes('cplan') && D.ks.includes('retract') && /رد شد/.test(D.md) && /تأیید شد/.test(D.md) && !RAW.test(D.md), got: D }; },
    94: ref('C21-13 session dossier names the live problem; no raw keys'),
    95: async () => { const x = await setup({ chat: 'U: مثلث‌های متشابه: h/r ثابت است ‖ A: بعد؟ ‖ U: از V=πr²h/3 مشتق گرفتم: dV/dt=πr²·dh/dt ‖ A: چک؟ ‖ U: حل شد' });
      await ev((x) => { const pg = APP.S.get('eprog_' + x.pid), L = pg.solve.live, se = APP.S.get(x.sid); L.chat = { sess: x.sid, solution: 'dh/dt = ۵/(πr²)', at: se.msgs[4].at, mid: APP.liveMsgId(se.msgs[4]), srcSet: true }; L.state = 'solved'; L.stateAt = se.msgs[4].at; APP.S.put(pg); }, x);
      const D = await dos(x.pid); const cw = D.evs.filter(e => e.k === 'chatwork').map(e => e.lines.join(' ')).join(' | ');
      return { ok: /متشابه/.test(cw) && /مشتق/.test(cw), got: cw }; },
    96: async () => { const x = await bare('U: امروز خسته‌ام ‖ A: خب. ‖ U: خسته نبودم، اشتباه گفتم'); await rFull(x.sid, { msg: 'امروز خسته‌ام', what: 'said', fix: 'خسته نبودم' }, 'خسته نبودم، اشتباه گفتم'); await rFull(x.sid, { msg: 'خسته نبودم، اشتباه گفتم', what: 'said', fix: 'خسته' }, 'خسته نبودم، اشتباه گفتم');
      const md = await ev((sid) => APP.dossierMd(sid), x.sid); return { ok: /رکوردی ساخته نشده بود/.test(md) && /صفحه نپذیرفت/.test(md), got: md.slice(0, 600) }; },
    97: async () => { const x = await bare('U: دیروز برگهٔ سفید رو زدم، ۷۰ درصدش یادم بود ‖ A: آفرین.'); const o = await ev((sid) => { const PR = APP.PR; if (!PR || !PR.start) return null; const c = PR.start(41, PR.subj('free'), { src: 'assistant' }); const sx = PR.session(c, { what: 'برگهٔ سفید', meas: { pct: 70 }, ok: null, src: 'assistant' }); if (sx) sx.chat = { sess: sid, quote: '۷۰ درصدش یادم بود', at: new Date().toISOString() }; APP.S.put(c); const se = APP.S.get(sid); se.prcs = [c.id]; APP.S.put(se);
        const D = APP.dossierSess(sid); return D.events.filter(e => e.k === 'practice').map(e => e.title + ' ' + e.lines.join(' ')); }, x.sid);
      return o === null ? NC('practice engine absent') : { ok: o.some(t => /جلسهٔ تمرین/.test(t) && /۷۰/.test(t)), got: o }; },
    98: NC('practice fixer (a41 t24Sync: the worksheet row IS the 🎯 record); the session dossier lists 🎯 of the session\'s cases once (fcast loop)'),
    99: async () => { const x = await setup({ chat: 'U: حل شد ‖ A: خوب.' }); await ev((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.b = { 1: { verdict: 'intuitive', at: new Date().toISOString(), done: true } }; APP.S.put(pg); }, x.pid); const D = await dos(x.pid); return { ok: !/intuitive/.test(D.md) && /شهودی/.test(D.md), got: D.md.slice(0, 500) }; },
    100: ref('C21-16 fill in a «[سامانه]» turn ⇒ src = her message'),
    101: async () => { const x = await setup({ chat: 'U: معادله x² − 5x + 6 = 0 ‖ A: خب.', rec: { dl: [[0, 'x² − 5x + 6 = 0']] } }); const D = await dos(x.pid); return { ok: /5x/.test(D.md), got: D.md.slice(0, 400) }; },
    102: NC(COACH + ' (a27 decides «مسئلهٔ گفت‌وگو»)'),
    103: async () => { const x = await bare('U: سلام ‖ A: سلام!'); const D = await ev((sid) => APP.dossierSess(sid).events.map(e => e.k), x.sid); return { ok: D.length <= 1, got: D }; },
    104: async () => { const x = await setup({ chat: 'U: گام ۱ رو انجام دادم و جواب داد ‖ A: خب.', rec: { steps: [{ text: 'گام', closed: 'yes', what: 'جواب داد', src: 0 }] } });
      await ev((x) => { const pg = APP.S.get('eprog_' + x.pid); const st = pg.solve.live.steps[0]; st.chatRep = { mid: x.mids[0], what: 'جواب داد', done: 'yes' }; st.out.from = 'chat'; st.out.mid = x.mids[0]; APP.S.put(pg); }, x);
      await rEdit(x.sid, 0, 'گام ۱ رو هنوز انجام ندادم'); const D = await dos(x.pid); return { ok: D.evs.filter(e => e.k === 'stepold').length === 1, got: D.evs.map(e => e.k) }; },
    105: NC('practice fixer (one 🎯 judged by practice_log and page = one record); dossier reads that one record'),
    106: ref('A21-14 plan scoped to its problem; no doubled heading'),
    107: async () => { const x = await setup({ chat: 'U: ادامه ‖ A: خب.' }); await ev((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.live.checkins = [{ at: new Date().toISOString(), d: APP.today(), prob: 'سخت‌تر از فکرم', self: 'عجولم', want: 'more' }]; APP.S.put(pg); }, x.pid); const D = await dos(x.pid); return { ok: !/\bmore\b/.test(D.md) && /بیشتر می‌خواهم/.test(D.md), got: D.md.slice(0, 500) }; },
    108: NC(COACH + ' (a29 mind card «از کجا؟»)'),
    109: async () => { const x = await bare('U: سلام ‖ A: پیشنهادم اینه که هر روز ده دقیقه بدوی.'); const md = await ev((sid) => APP.dossierMd(sid), x.sid); return { ok: !/بدوی/.test(md), got: md.slice(0, 300) }; },
  });
  await runBank('R6.floor_compensation', {
    131: NC(COACH), 132: NC(COACH), 135: NC(COACH), 136: NC(COACH), 141: NC(COACH), 142: NC(COACH), 143: NC(COACH), 144: NC(COACH), 146: NC(COACH), 147: NC(COACH),
    133: async () => { const x = await bare('U: دو شیر داریم، یکی حوض رو ۳ ساعته پر می‌کنه یکی ۶ ساعته؛ با هم چقدر؟ ‖ A: چه داری؟'); await ev(() => APP.go('today'));
      await actTurn(x.sid, 'همین مسئله‌ی دو شیر رو ثبتش کن', [{ do: 'chat_invent', title: 'دو شیر', statement: 'دو شیر داریم، یکی حوض را ۳ ساعته پر می‌کند و دیگری ۶ ساعته؛ با هم چقدر طول می‌کشد؟' }]);
      const o = await ev((sid) => ({ n: APP.liveAll().filter(y => y.sess === sid).length, v: APP.state.view, dorm: APP.liveAll().filter(y => y.sess === sid && y.dormant).length }), x.sid); return { ok: o.n === 1 && o.v === 'lprob' && o.dorm === 0, got: o }; },
    134: async () => { const x = await bare('U: می‌خوام بدونم با ۱۰ میلیون پس‌انداز کدوم وام بهتره ‖ A: چه گزینه‌هایی داری؟'); await ev(() => APP.go('today'));
      await actTurn(x.sid, 'اینو ثبت کن', [{ do: 'chat_invent', title: 'انتخابِ وام', statement: 'با ۱۰ میلیون پس‌انداز کدام وام بهتر است' }]);
      const o = await ev((sid) => ({ n: APP.liveAll().filter(y => y.sess === sid).length, v: APP.state.view, src: !!(APP.liveAll().filter(y => y.sess === sid)[0] || {}).src }), x.sid); return { ok: o.n === 1 && o.v === 'lprob' && o.src, got: o }; },
    137: async () => { const x = await bare('U: فایل رو بخون ‖ A: باشه.'); const o = await ev((sid) => { const AS = APP.ASSIST, se = APP.S.get(sid); se.files = [{ id: 'F1', name: 'قرارداد.pdf' }, { id: 'F2', name: 'رسید.pdf' }]; APP.S.put(se); AS._turnSession = se;
        const a = { reply: 'می‌خوانم.', reread: ['F1'] }; AS.replyFix(a); const b = { reply: 'فایل را دریافت نکردم.', reread: ['F1'] }; AS.replyFix(b); const c = { reply: 'باز هم بده', reread: ['F1'] }; AS.replyFix(c);
        const d = { reply: 'آن یکی را بده', reread: ['F2'] }; AS.replyFix(d); AS._turnSession = null; return { a: a.reread, b: b.reread, c: c.reread, d: d.reread, sys: se.msgs.filter(m => m.role === 'sys').map(m => m.text) }; }, x.sid);
      return { ok: J(o.a) === '["F1"]' && J(o.b) === '[]' && J(o.c) === '[]' && J(o.d) === '["F2"]' && o.sys.some(t => /قرارداد\.pdf/.test(t) && /خوانده نشد/.test(t)), got: o }; },
    138: async () => { const x = await bare('U: یادم بنداز ‖ A: کی؟'); const o = await ev((sid) => { const AS = APP.ASSIST, se = APP.S.get(sid); AS._turnSession = se; const w = AS.replyCheck({ reply: 'باشه، یادت می‌اندازم.', status: 'related', actions: [{ do: 'deadline', what: 'فرم', date: '2020-01-01' }] }, { task: 'lla_assistant' }); const r = AS.DO.deadline({ what: 'فرم', date: '2020-01-01' }); AS._turnSession = null; return { w, r }; }, x.sid);
      return { ok: /\[سامانه/.test(o.w) && /ثبت نشد/.test(o.r) && !/YYYY|HH:MM|کاربر/.test(String(o.r)), got: o }; },
    139: async () => { const x = await bare('U: سلام ‖ A: سلام.'); const o = await ev((sid) => { const AS = APP.ASSIST, se = APP.S.get(sid); se.msgs.push({ role: 'user', text: 'این مسئله رو خودم ساختم: مجموع زاویه‌های ده‌ضلعی؟', at: new Date().toISOString() }); APP.S.put(se); AS._turnSession = se; const ob = AS.busy; AS.busy = () => true;
        const w = AS.replyCheck({ reply: 'نگهش می‌دارم برات.', status: 'related', actions: [{ do: 'chat_invent', title: 'ده‌ضلعی', statement: 'مجموعِ زاویه‌های یک ده‌ضلعی چند است؟' }] }, { task: 'lla_coach' }); AS.busy = ob; AS._turnSession = null; return w; }, x.sid);
      const r = await actTurn(x.sid, '', [{ do: 'chat_invent', title: 'ده‌ضلعی', statement: 'مجموعِ زاویه‌های یک ده‌ضلعی چند است؟' }]);
      return { ok: /\[سامانه/.test(o) && r.notes.concat(r.infos).every(t => !/کاربر نخواسته|پیشنهاد بده/.test(t)) && r.notes.concat(r.infos).some(t => /ثبت نکردم/.test(t)), got: { o, r } }; },
    140: async () => { const x = await bare('U: سلام ‖ A: سلام.'); await ev(() => APP.go('today')); await actTurn(x.sid, 'یه مسئله‌ی دیگه هم دارم، بذارش برای بعد ثبتش کن: کدوم شهر برای کار بهتره', [{ do: 'chat_invent', title: 'شهرِ کار', statement: 'کدام شهر برای کار بهتر است؟ تهران یا شیراز' }]);
      const o = await ev((sid) => ({ n: APP.liveAll().filter(y => y.sess === sid || (APP.S.get(sid).invented || []).indexOf(y.p.id) >= 0).length, v: APP.state.view }), x.sid); return { ok: o.n >= 1 && o.v !== 'lprob', got: o }; },
    145: async () => ({ ok: !(bankRes['R6.floor_compensation'].fail || []).includes('#137'), got: 'same mechanism as #137 (F2 allowed once after F1 stopped)' }),
  });
  await runBank('R9.small', {
    180: ref('D·s31 look-back new problems kept'),
    181: async () => { const x = await setup({ chat: 'U: بعداً ‖ A: خب.' }); const st = await ev((pid) => { const r = APP.S.get('eprob_' + pid); r.dormant = APP.addDays(APP.today(), 3); APP.S.put(r); return APP.dossier(pid).state; }, x.pid); const f = await ev(() => APP.fdate(APP.addDays(APP.today(), 3))); return { ok: st.indexOf('خفته تا ' + f) >= 0, got: st }; },
    182: async () => { const x = await bare('U: هفته‌ی ۱: ۷۸، هفته‌ی ۲: ۷۷٫۵، هفته‌ی ۳: ۷۷ ‖ A: خب.'); await ev((x) => APP.liveMeasBook(x.sid, x.mids[0]), x); const o = await ev((sid) => ({ pts: (APP.S.get(sid).msgs[0].pts || []).map(p => p.y), log: APP.liveMeasLog(sid).map(l => l.pts.length) }), x.sid); return { ok: J(o.pts) === J([78, 77.5, 77]) && J(o.log) === '[3]', got: o }; },
    183: async () => { const x = await bare('U: هفته‌ی ۱: ۷۸، هفته‌ی ۲: ۷۷٫۵، هفته‌ی ۳: ۷۷ ‖ A: خب. ‖ U: هفته ۲ ۷۷ بود نه ۷۷٫۵'); await ev((x) => APP.liveMeasBook(x.sid, x.mids[0]), x);
      const r = await rSess(x.sid, { msg: 'هفته‌ی ۲: ۷۷٫۵', what: 'fact', fix: '۷۷' }, 'هفته ۲ ۷۷ بود نه ۷۷٫۵');
      const o = await ev((sid) => { APP.go('today'); APP.ASSIST.store('cur', sid); APP.ASSIST.toggle(true); APP.ASSIST.paint(); return { pts: APP.S.get(sid).msgs[0].pts.map(p => p.y), corr: (APP.S.get(sid).msgs[0].corr || []).length }; }, x.sid); await W(400);
      const plot = await ev(() => { const b = document.querySelector('.as-msg.user .mx-plot svg'); return b ? b.getAttribute('aria-label') : ''; }); await ev(() => APP.ASSIST.toggle(false));
      return { ok: J(o.pts) === J([78, 77, 77]) && o.corr === 1 && /۳|3/.test(plot), got: { r, o, plot } }; },
    184: async () => { const x = await backSess(); await actTurn(x.sid, 'یه مسئله‌ی جدید به ذهنم رسید: با جمع ۱۲ چی؟', [{ do: 'chat_invent', title: 'جمع ۱۲', statement: 'بیشترین حاصل‌ضربِ دو عدد با جمعِ ۱۲ چیست؟' }]);
      const o = await ev((pid) => { const b = APP.S.get('eprog_' + pid).solve.b[1], id = b.newProbs[0].id, np = APP.livePromoteNew(pid, id); return { np: !!np, live: !!APP.liveRec(np), again: APP.livePromoteNew(pid, id) === np }; }, x.pid); return { ok: o.np && o.live && o.again, got: o }; },
    185: async () => { const x = await setup({ chat: 'U: بعداً ‖ A: خب.' }); const st = await ev((pid) => { const r = APP.S.get('eprob_' + pid); r.dormant = APP.today(); APP.S.put(r); return APP.dossier(pid).state; }, x.pid); return { ok: !/خفته تا/.test(st), got: st }; },
    186: async () => { const x = await bare('U: وزنم امروز ۷۶ ‖ A: خب.'); await ev((x) => APP.liveMeasBook(x.sid, x.mids[0]), x); const o = await ev((sid) => APP.liveMeasLog(sid).map(l => l.pts.map(p => [p.y, p.d])), x.sid); const td = await ev(() => APP.today()); return { ok: J(o) === J([[[76, td]]]), got: o }; },
    187: ref('D·s31 look-back new problems kept'),
    188: async () => { const x = await backSess(); const n = await ev((pid) => APP.dossier(pid).events.filter(e => e.k === 'newprobs').length, x.pid); return { ok: n === 0, got: n }; },
    189: async () => { const x = await setup({ chat: 'U: بعداً ‖ A: خب.' }); const st = await ev((pid) => { const r = APP.S.get('eprob_' + pid); r.dormant = APP.addDays(APP.today(), -8); APP.S.put(r); return APP.dossier(pid).state; }, x.pid); return { ok: !/خفته تا/.test(st), got: st }; },
    190: async () => { const x = await bare('U: وزن بابام ۹۰ ـه ‖ A: خب.'); await ev((x) => APP.liveMeasBook(x.sid, x.mids[0]), x); const n = await ev((sid) => APP.liveMeasLog(sid).length, x.sid); return { ok: n === 0, got: n }; },
    191: async () => { const x = await bare('U: اگه وزنم ۷۰ بشه خوبه ‖ A: خب.'); await ev((x) => APP.liveMeasBook(x.sid, x.mids[0]), x); const n = await ev((sid) => APP.liveMeasLog(sid).length, x.sid); return { ok: n === 0, got: n }; },
    192: async () => { const x = await backSess(); const a = { do: 'chat_invent', title: 'مربعِ محیط ۴۰', statement: 'آیا مربع با محیطِ ۴۰ متر بیشترین مساحتِ زمین را می‌دهد؟' }; await actTurn(x.sid, 'یه مسئله‌ی تازه: مربع با محیط ۴۰', [a]); await actTurn(x.sid, 'همون مسئله‌ی مربع', [a]);
      const n = await ev((pid) => (APP.S.get('eprog_' + pid).solve.b[1].newProbs || []).length, x.pid); return { ok: n === 1, got: n }; },
    193: async () => { const x = await bare('U: وزنم امروز ۷۶ کیلو ‖ A: خب. ‖ U: وزنم الان ۱۶۸ پوند'); await ev((x) => { APP.liveMeasBook(x.sid, x.mids[0]); APP.liveMeasBook(x.sid, x.mids[1]); }, x); const o = await ev((sid) => ({ logs: APP.liveMeasLog(sid).map(l => l.unit + ':' + l.pts.length), sys: APP.S.get(sid).msgs.filter(m => m.role === 'sys').map(m => m.text) }), x.sid);
      return { ok: o.logs.length === 2 && o.sys.some(t => /پوند/.test(t)), got: o }; },
    194: async () => { const x = await backSess(); await ev(() => APP.go('today')); await actTurn(x.sid, 'یه مسئله‌ی تازه: با جمع ۱۴', [{ do: 'chat_invent', title: 'جمع ۱۴', statement: 'بیشترین حاصل‌ضربِ دو عدد با جمعِ ۱۴ چیست؟' }]); const v = await ev(() => APP.state.view); return { ok: v !== 'lprob', got: v }; },
    195: async () => { const x = await bare('U: وزنم امروز ۷۶ ‖ A: خب. ‖ U: ۷۶ بود، اشتباه گفتم'); await ev((x) => APP.liveMeasBook(x.sid, x.mids[0]), x); await rSess(x.sid, { msg: 'وزنم امروز ۷۶', what: 'fact', fix: '۷۶' }, '۷۶ بود، اشتباه گفتم'); const h = await ev((sid) => APP.liveMeasLog(sid)[0].pts[0].fixHist || [], x.sid); return { ok: h.length === 0, got: h }; },
  });
  info.res = res; info.bank = Object.assign(info.bank, bankRes);
  console.log(JSON.stringify(info, null, 1));
  Object.keys(bankRes).forEach(k => { const R = bankRes[k]; console.log(k + ': ' + R.pass + ' pass / ' + R.fail.length + ' fail / ' + R.nc.length + ' not covered of ' + R.n); R.nc.forEach(x => console.log('   not covered ' + x)); });
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  if (errors.length) process.exitCode = 1;
  await b.close();
})();
