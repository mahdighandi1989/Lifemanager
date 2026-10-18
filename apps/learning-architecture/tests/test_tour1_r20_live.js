// تورِ پولیا (دستهٔ ۱، دورِ ۲۰، ۲۰۲۶-۱۰-۱۸) — DECISIONS_R20، سهمِ «live + dossier» (a38_live.js، a40_dossier.js، قلاب‌های حبابِ a26، a39 برای RO9).
//  دو منبعِ شاهد، هر دو قرمز پیش از اصلاح:
//   (۱) نقلِ عینیِ دونده‌ها (round20{A,B,C,D}): A·A1/A2/A3/A6/A7/A15/A17، B·D1/D2/D3/D7/D17، C·C20-2/C20-6/C20-10، D·2/3/4/5/6/14/15.
//   (۲) بانکِ مستقلِ VARIANTS_R20 (tests/variants/VARIANTS_R20.json = tour1_polya/VARIANTS_R20.json؛ LLA_VARIANTS = مسیرِ دیگر) — هر ورودیِ سازوکارهای این سهم
//       (RO1.by_fact و RO2.src_everywhere سویِ صفحه، RO5.edit_path سویِ صفحه، RO6.dossier_log، RO9.small جز نشانِ ساعت، MT1 بندهای ۷/۸/۱۷/۱۸) یک بررسی دارد؛
//       ورودی‌هایی که مالِ مربی (a27/a29)، تمرین (a41/a42) یا مسیریابی‌اند با دلیل «not covered» چاپ می‌شوند و این آزمون را قرمز نمی‌کنند.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R20.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R20.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)) || path.join(__dirname, 'variants', 'VARIANTS_R20.json');
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
  chk(bank.length >= 200, 'bank: VARIANTS_R20 must be loaded (got ' + bank.length + ')');
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

  /* ================= نقلِ دونده‌ها ================= */
  // A·A1 / B·D3 / D·10: تکه و اصلاحِ ✏️ عینِ متنِ پیام‌اند (با ویرگول/پرانتز) تا مربی همان را بیابد
  await T('B·D3 ✏️ frag keeps punctuation', async () => { const x = await setup({ chat: 'U: شنبه می‌رم، اولین قدم رو برمی‌دارم ‖ A: خوب.' }); const r = await rEdit(x.sid, 0, 'یکشنبه می‌رم، اولین قدم رو برمی‌دارم'); return { ok: r.ok && r.inOld && r.inNew && r.frag === 'شنبه' && r.fix === 'یکشنبه', got: r }; });
  await T('D·10 ✏️ frag keeps parentheses', async () => { const x = await setup({ chat: 'U: حجم = ۲ × ۱/۳ × (ab/2) × a ‖ A: خوب.' }); const r = await rEdit(x.sid, 0, 'حجم = ۲ × ۱/۳ × (ab/2) × b'); return { ok: r.ok && r.inOld && r.inNew, got: r }; });
  // A·A2 / RO2.5: نسخهٔ دست‌نوشتِ صفحه ⇒ «این‌جا هم عوض شود؟»، هرگز بی‌صدا
  await T('A·A2 page-typed copy asks', async () => { const x = await setup({ chat: 'U: قیمت خونه‌ی بابا حدوداً ۸ میلیارده ‖ A: خب. ‖ U: قیمتو اشتباه گفتم، ۱۱ میلیارد بود', rec: { dl: [[null, '۸ میلیارد']] } });
    const r = await rChat(x.sid, { msg: 'قیمت خونه‌ی بابا حدوداً ۸ میلیارده', what: 'fact', fix: '۱۱ میلیارد' }, 'قیمتو اشتباه گفتم، ۱۱ میلیارد بود'); const s = await snap(x.pid, x.sid);
    const ok1 = r.ok && s.dl[0] === '۸ میلیارد' && s.asks.length === 1 && s.asks[0].new === '۱۱ میلیارد' && /این‌جا هم عوض شود/.test(r.note);
    const ui = await p.evaluate((sid) => { APP.go('today'); APP.ASSIST.store('cur', sid); APP.ASSIST.toggle(true); APP.ASSIST.paint(); const box = document.querySelector('.as-copyask'); return box ? box.textContent : ''; }, x.sid);
    await p.evaluate((sid) => { document.querySelector('.as-copyask .as-askyes').click(); }, x.sid); const s2 = await snap(x.pid, x.sid);
    return { ok: ok1 && /۸ میلیارد/.test(ui) && /۱۱ میلیارد/.test(ui) && s2.dl[0] === '۱۱ میلیارد' && s2.dlH === 1 && s2.asks[0].state === 'yes', got: { r, s: s.asks, ui, s2 } }; });
  // B·D1 / RO2.1: مسئلهٔ بسته‌شده در گفت‌وگو — منبعِ هر رکورد پیامِ خودش، نه پیامِ پایانی؛ اصلاحِ ۵⇒۶ صورت و فرم را می‌برد و حکم را کنار می‌زند
  let SOLN = 0; const solvedSess = async () => { const tk = ['مخزنِ استوانه‌ای', 'قیفِ مخروطیِ باغچه', 'سطلِ رنگِ کارگاه'][SOLN++] || 'دیگر'; const x = await setup({ chat: 'U: نرخ خروج آب از ' + tk + ' ۵ سانتی‌متر مکعب در ثانیه‌ست، عمق چقدر سریع پایین میاد؟ ‖ A: چه داری؟ ‖ U: dV/dt=۵ پس dh/dt=۵/(πr²) ‖ A: چک کردی؟ ‖ U: با واحدها چک کردم درست درمیاد ‖ A: درس؟ ‖ U: مرسی، حل شد' });
    await p.evaluate((x) => { const se = APP.S.get(x.sid); se.lprob = ''; APP.S.put(se); }, x);
    await actTurn(x.sid, '', [{ do: 'chat_solved', title: tk, statement: 'نرخ خروج آب از ' + tk + ' ۵ سانتی‌متر مکعب در ثانیه‌ست، عمق چقدر سریع پایین میاد؟', solution: 'dh/dt=۵/(πr²)', lesson: 'همیشه با واحدها چک کنم', check: 'با واحدها چک کردم درست درمیاد', checkMsgs: ['با واحدها چک کردم درست درمیاد'], unknown: 'سرعت پایین آمدنِ عمق' }]);
    return p.evaluate((x) => { const r = APP.liveAll().filter(y => y.sess === x.sid).pop(); return Object.assign({}, x, { pid: r && r.p.id }); }, x); };
  await T('B·D1 chat-closed src is the first message', async () => { const x = await solvedSess(); if (!x.pid) return { ok: false, got: 'no problem' };
    const d = await dos(x.pid), u = d.evs.find(e => e.k === 'u'), st = d.evs.find(e => e.k === 'stmt');
    return { ok: u && /نرخ خروج آب/.test(u.src) && !/حل شد/.test(u.src) && st && /نرخ خروج آب/.test(st.src), got: { u, st } }; });
  await T('B·D1/RO2.1 datum correction follows chat-closed records', async () => { const x = await solvedSess();
    const r = await rLive(x.pid, x.sid, 0, { frag: '۵ سانتی‌متر مکعب', fix: '۶ سانتی‌متر مکعب', what: 'fact', by: x.mids[4] }); const s = await snap(x.pid, x.sid);
    return { ok: r.ok && /۶ سانتی/.test(s.stmt) && /۶ سانتی/.test(s.one) && s.verdict && s.verdict.v !== 'verified', got: { r, s } }; });
  // B·D2 / D·2 / RO1.3: درسِ بازنگری عوض می‌شود (با کارتش) و حکمِ وارسی که داده‌اش دست نخورد می‌ماند
  await T('D·2 lesson correction keeps the verdict', async () => { const x = await setup({ chat: 'U: درسی که گرفتم: اول حالت خاص رو امتحان کنم. با n=۱ و n=۲ هم چک کردم، درست بود. ‖ A: کجا به کار می‌بری؟ ‖ U: تو هندسه ‖ A: خوب. ‖ U: اون درسی که گفتم رو این‌جوری درست کن: اول شکل بکشم', rec: { verdict: [0, 'با n=۱ و n=۲ هم چک کردم'], lesson: [0, 'اول حالت خاص رو امتحان کنم'] } });
    const r = await rLive(x.pid, x.sid, 0, { frag: 'اول حالت خاص رو امتحان کنم', fix: 'اول شکل بکشم', what: 'said', by: x.mids[2] }); const s = await snap(x.pid, x.sid);
    return { ok: r.ok && s.use === 'اول شکل بکشم' && s.verdict.v === 'verified' && !s.verdict.sup, got: { r, s } }; });
  // D·3 / RO1.10: یادآورِ ساخته از پیام برمی‌گردد (۸ ⇐ ۱۰ صبح)، با برچسبِ فارسی
  const dlSess = async (txt, act) => { const x = await setup({ chat: 'U: سلام ‖ A: سلام.' }); await actTurn(x.sid, txt, [act]); return x; };
  await T('D·3 deadline from her message is reversible', async () => { const th = nextWd(5); const x = await dlSess('یادم بنداز پنجشنبه ساعت ۸ صبح فرم رو بفرستم؛ فرمش ۳ صفحه‌ست', { do: 'deadline', what: 'فرستادنِ فرم', date: th, time: '08:00' });
    await p.evaluate((sid) => { const se = APP.S.get(sid); se.msgs.push({ role: 'user', text: 'ساعت فرم ۱۰ صبحه نه ۸', at: new Date().toISOString(), actions: [] }); APP.S.put(se); }, x.sid);
    const r = await rChat(x.sid, { msg: 'پنجشنبه ساعت ۸ صبح', what: 'plan', fix: '۱۰ صبحه' }, 'ساعت فرم ۱۰ صبحه نه ۸');
    const dl = await p.evaluate((sid) => APP.S.all('deadline', y => y.src && y.src.sess === sid).map(y => ({ date: y.date, time: y.time, h: (y.fixHist || []).length })), x.sid);
    return { ok: r.ok && dl.length === 1 && dl[0].time === '10:00' && dl[0].date === th && dl[0].h === 1 && /۱۰:۰۰/.test(r.note) && !/\d{4}-\d{2}-\d{2}/.test(r.note), got: { r, dl } }; });
  // C20-2 / RO2.0: chat_invent منبع دارد و پیرو می‌شود
  await T('C20-2 chat_invent follows the correction', async () => { const x = await setup({ chat: 'U: سلام ‖ A: سلام.' }); await p.evaluate((sid) => { const se = APP.S.get(sid); se.lprob = ''; APP.S.put(se); }, x.sid);
    await actTurn(x.sid, 'یه مسئله برای خودم بساز: ۱۰ نقطه روی دایره، چند تا مثلث؟', [{ do: 'chat_invent', title: 'مثلث‌های دایره', statement: '۱۰ نقطه روی دایره، چند تا مثلث؟' }]);
    await p.evaluate((sid) => { const se = APP.S.get(sid); se.msgs.push({ role: 'user', text: 'ببخشید، ۱۰ نه، ۸ نقطه — اشتباه گفتم', at: new Date().toISOString(), actions: [] }); APP.S.put(se); }, x.sid);
    const r = await rChat(x.sid, { msg: '۱۰ نقطه روی دایره', what: 'fact', fix: '۸ نقطه' }, 'ببخشید، ۱۰ نه، ۸ نقطه — اشتباه گفتم');
    const st = await p.evaluate((sid) => APP.liveAll().filter(y => y.sess === sid).map(y => ({ s: y.p.statement, src: !!y.src })), x.sid);
    return { ok: r.ok && st.length === 1 && st[0].src && /^۸ نقطه/.test(st[0].s) && !/چیزی در صفحه ثبت نشده/.test(r.note), got: { r, st } }; });
  // D·4: صورتی که دستیار در فرمِ «ساختن» از پیامش پر کرد، پیرو؛ اگر خودش ویرایش کرد ⇒ پرسش
  await T('D·4 assistant-filled statement follows; self-edited asks', async () => {
    const out = await p.evaluate(() => { const S = APP.S, t0 = Date.now() - 6e5; const mk = (txt) => { const m = { role: 'user', text: txt, at: new Date(t0).toISOString() }; const se = { id: APP.uid('achat'), type: 'achat', msgs: [m, { role: 'ai', text: 'ثبت کردم.', at: new Date(t0 + 1e3).toISOString() }], steps: [], files: [], reports: [] };
      se.fills = [{ src: APP.liveMsgId(m), sig: 'lpNewS', at: new Date(t0 + 500).toISOString(), val: 'قرارداد سه ماهه است و نمی‌دانم تمدید کنم یا نه' }]; S.put(se); return se; };
      const a = mk('قرارداد سه ماهه است و نمی‌دانم تمدید کنم یا نه'), r1 = APP.liveCreate('قرارداد', 'قرارداد سه ماهه است و نمی‌دانم تمدید کنم یا نه', 'find', { by: 'user', nat: 'life' });
      const auto = !!r1.src && !r1.src.edited; return { auto, pid: r1.p.id, sid: a.id }; });
    const out2 = await p.evaluate(() => { const S = APP.S, t0 = Date.now() - 5e5; const m = { role: 'user', text: 'قرارداد سه ماهه است، تمدید کنم؟', at: new Date(t0).toISOString() }; const se = { id: APP.uid('achat'), type: 'achat', msgs: [m], steps: [], files: [], reports: [] };
      se.fills = [{ src: APP.liveMsgId(m), sig: 'lpNewS', at: new Date(t0 + 500).toISOString(), val: 'قرارداد سه ماهه است، تمدید کنم؟' }]; S.put(se);
      const r2 = APP.liveCreate('قرارداد ۲', 'قرارداد سه ماهه است، تمدید کنم؟ صاحب‌کار هم عجله دارد', 'find', { by: 'user', nat: 'life' }); se.lprob = r2.p.id; S.put(se); return { edited: !!(r2.src && r2.src.edited), pid: r2.p.id, sid: se.id }; });
    const r = await rLive(out2.pid, out2.sid, 0, { frag: 'سه ماهه', fix: 'شش ماهه', what: 'fact' }); const s = await snap(out2.pid, out2.sid);
    return { ok: out.auto && out2.edited && /سه ماهه/.test(s.stmt) && s.asks.length === 1 && /شش ماهه/.test(s.asks[0].new), got: { out, out2, r, s } }; });
  // A·A3 / B·D17 / C20-6 / RO5.0: ویرایشگرِ ✏️ در هر دو پوسته خوانا
  const contrast = () => p.evaluate(() => { const ta = document.querySelector('.as-edtx'); if (!ta) return null; const cs = getComputedStyle(ta);
    const rgb = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number), lum = (c) => { const a = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; };
    const f = lum(rgb(cs.color)), bg = lum(rgb(cs.backgroundColor)); return { c: cs.color, b: cs.backgroundColor, ratio: (Math.max(f, bg) + 0.05) / (Math.min(f, bg) + 0.05) }; });
  await T('A·A3/RO5.0 editor visible in both themes', async () => { const x = await setup({ chat: 'U: جواب ۵۵ه ‖ A: خب.' });
    await p.evaluate((sid) => { APP.go('today'); APP.ASSIST.store('cur', sid); APP.ASSIST.toggle(true); APP.ASSIST.paint(); document.querySelector('.as-msg.user .as-editb').click(); }, x.sid); await W(60);
    const light = await contrast(); await p.evaluate(() => { document.documentElement.setAttribute('data-theme', 'dark'); }); await W(40); const dark = await contrast();
    await p.evaluate(() => { document.documentElement.removeAttribute('data-theme'); const c = document.querySelector('.as-edcancel'); if (c) c.click(); });
    return { ok: light && dark && light.ratio >= 4.5 && dark.ratio >= 4.5, got: { light, dark } }; });
  // A·A7 / RO6.4: «حل شد» پیش از بازنگری؛ ذخیرهٔ دوباره ترتیب را عوض نمی‌کند
  await T('A·A7 solved before look-back', async () => { const x = await setup({ chat: 'U: حل شد ‖ A: آفرین.' });
    await p.evaluate((pid) => { const pg = APP.S.get('eprog_' + pid), so = pg.solve, L = so.live, at = new Date(Date.now() - 7200e3).toISOString(); L.state = 'solved'; L.stateAt = at; so.b = { 1: { done: true, at: at, use: 'حالت‌های کوچک', from: 'page' } }; APP.S.put(pg); const r = APP.S.get('eprob_' + pid); r.updated = new Date().toISOString(); APP.S.put(r); }, x.pid);
    const d = await dos(x.pid), ks = d.evs.map(e => e.k).filter(k => k === 'state' || k === 'back'); return { ok: J(ks) === J(['state', 'back']), got: ks }; });
  // A·A6 / C20-10 / RO6.0: برنامهٔ گفت‌وگو و سرانجامش در پرونده، پیش از گامی که از آن آمد؛ بی شناسهٔ خام
  await T('A·A6 chat plans in the dossier, in event order', async () => { const x = await setup({ chat: 'U: برنامه‌م اینه که سه‌شنبه با صاحبخونه حرف بزنم ‖ A: باشه. ‖ U: حرف زدم، ۵ درصد کم کرد' });
    await p.evaluate((x) => { const S = APP.S, se = S.get(x.sid), U = se.msgs.filter(m => m.role === 'user'); se.plans = [{ id: 'pl1', text: 'سه‌شنبه با صاحبخونه حرف بزنم', when: APP.addDays(APP.today(), 2), at: U[0].at, src: APP.liveMsgId(U[0]), done: true, state: 'done', doneAt: U[1].at }]; S.put(se);
      const pg = S.get('eprog_' + x.pid); pg.solve.live.steps.push({ id: 'stX', text: 'حرف زدن با صاحبخونه', at: new Date(Date.parse(U[0].at) + 30e3).toISOString(), due: APP.today() }); S.put(pg); }, x);
    const d = await dos(x.pid), ks = d.evs.map(e => e.k), ip = ks.indexOf('cplan'), is = ks.indexOf('step'), idn = ks.indexOf('cplandone');
    return { ok: ip >= 0 && is > ip && idn > ip && !/\bpl1\b/.test(d.text) && !/\d{4}-\d{2}-\d{2}/.test(d.text), got: ks }; });
  // D·5: «بازگشت: [object Object]» هرگز
  await T('D·5 typed rendering of the return', async () => { const x = await setup({ chat: 'U: فردا برمی‌گردم ‖ A: باشه.' });
    await p.evaluate((pid) => { const pg = APP.S.get('eprog_' + pid), L = pg.solve.live, at = new Date(Date.now() - 864e5).toISOString(); L.incub = { at: at, d: at.slice(0, 10), back: { at: new Date().toISOString(), d: APP.today(), t: 'راهِ تازه‌ای به ذهنم رسید' } }; L.checkins = [{ at: new Date().toISOString(), d: APP.today(), prob: 'داده‌ها کم بود', self: 'عجله دارم', want: 'yes' }]; APP.S.put(pg); }, x.pid);
    const d = await dos(x.pid); return { ok: !/object Object/.test(d.text + d.md) && /راهِ تازه‌ای/.test(d.text) && d.evs.some(e => e.k === 'checkin') && d.evs.some(e => e.k === 'incubback'), got: d.evs.map(e => e.k) }; });
  // B·D7 / RO6.7: یک منبعِ وضع
  await T('B·D7 one status source', async () => { const x = await setup({ chat: 'U: شروع ‖ A: خوب.', rec: { dl: [[0, 'داده']], plan: [null, 'گام‌به‌گام'], steps: [{ text: 'گامِ اول' }] } });
    const d = await dos(x.pid); return { ok: /اجرای طرح/.test(d.state) && d.stages.some(s => /اجرا/.test(s) && /در جریان/.test(s)) && !d.stages.some(s => /اجرا/.test(s) && /هنوز نرسیده/.test(s)), got: { s: d.state, st: d.stages } }; });
  // D·15 / RO6.8: نشانهٔ پرونده همان کارنامهٔ ذهن
  await T('D·15 dossier sign equals the mind card', async () => { const x = await setup({ chat: 'U: انجام دادم ولی جلو نرفت ‖ A: خب.', rec: { dl: [[0, 'داده']], plan: [null, 'طرح'], steps: [{ text: 'گامِ اول', closed: 'yes', prog: 'نه' }] } });
    const d = await dos(x.pid), o = d.evs.find(e => e.k === 'out'); return { ok: o && o.mind.length === 1 && /−$/.test(o.mind[0]), got: o }; });
  // C20-10 / RO6.14: حدسِ ردنشده «رد شد» نمی‌خورد
  await T('C20-10 a never-refuted guess is not «رد شد»', async () => { const x = await setup({ chat: 'U: حدسم اینه که کمبود همان برداشتِ ثبت‌نشده است ‖ A: چطور می‌آزمایی؟', rec: { g: [0, 'کمبود همان برداشتِ ثبت‌نشده است'] } });
    await p.evaluate((pid) => { const pg = APP.S.get('eprog_' + pid), L = pg.solve.live; L.steps.push({ id: 'sR', text: 'رسید را دیدم', at: new Date(Date.now() - 7200e3).toISOString(), closed: true, out: { at: new Date(Date.now() - 7000e3).toISOString(), done: 'yes', match: 'no', what: 'نخواند', guess: { rel: 'refute', g: 'کارِ سرایدار است' } } }); APP.S.put(pg); }, x.pid);
    const d = await dos(x.pid), g = d.evs.find(e => e.k === 'guess'); return { ok: g && !/رد شد/.test(g.out) && !g.mind.some(m => /−/.test(m)), got: g }; });
  // B·D7 / D·6 / RO6.10: «وارسی نشد» کنارِ «نتیجه سالم ماند» فقط با پیوندِ توضیح
  await T('D·6 verdict explanation', async () => { const x = await setup({ chat: 'U: جواب ۴۲، با جایگذاری چک کردم ‖ A: ✓ ‖ U: صبر کن جواب ۴۸ بود نه ۴۲', rec: { chat: [0, 'جواب ۴۲'], verdict: [0, 'با جایگذاری چک کردم'] } });
    await rChat(x.sid, { msg: 'جواب ۴۲', what: 'ans', fix: '۴۸' }, 'صبر کن جواب ۴۸ بود نه ۴۲'); const d = await dos(x.pid), v = d.evs.find(e => e.k === 'verdict');
    return { ok: v && /وارسی نشد/.test(v.lines[0]) && v.lines.some(l => /گزارشِ گفت‌وگو/.test(l) && /کنار رفت/.test(l)) && v.hist >= 1, got: v }; });
  // RO6.3 / D·6 s32: پروندهٔ سشنِ بی مسئلهٔ زنده
  await T('D·6 session dossier without a live problem', async () => { const x = await setup({ chat: 'U: نمی‌دونم کار رو عوض کنم یا نه ‖ A: چه چیزی مهم است؟ ‖ U: برنامه‌م اینه که فردا با مدیرم حرف بزنم' });
    await p.evaluate((x) => { const S = APP.S, se = S.get(x.sid), U = se.msgs.filter(m => m.role === 'user'); se.lprob = ''; se.plans = [{ id: 'pl1', text: 'فردا با مدیرم حرف بزنم', when: APP.addDays(APP.today(), 1), at: U[1].at, src: APP.liveMsgId(U[1]) }]; S.put(se);
      APP.EVLOG.add({ sess: x.sid, k: 'checkin', at: new Date().toISOString(), title: 'میانهٔ راه: چه آموختی؟', lines: ['ترس از تغییر بود'] }); }, x);
    const d = await dos(x.sid), tools = await p.evaluate((sid) => { APP.go('today'); APP.ASSIST.store('cur', sid); APP.ASSIST.toggle(true); APP.ASSIST.paint(); return !!document.querySelector('.as-dossess'); }, x.sid);
    return { ok: d && d.evs.some(e => e.k === 'cplan') && d.evs.some(e => e.k === 'checkin') && tools, got: { d: d && d.evs.map(e => e.k), tools } }; });
  // D·14: مرزِ رشتهٔ فرمول
  const segs = (t) => p.evaluate((t) => APP.MATH.segments ? APP.MATH.segments(t) : null, t);
  await T('D·14 «y=۲ (۳۵۲)» run boundary', async () => { const r = await p.evaluate(() => { const d = document.createElement('div'); APP.MATH.nodes('سه رقم آخر ۳۵y بر ۸ ⇒ y=۲ (۳۵۲). بر ۳: x+۳+۵+۲ بر ۳ ⇒ x=۲').forEach(n => d.appendChild(typeof n === 'string' ? document.createTextNode(n) : n)); return { txt: d.textContent, mx: [...d.querySelectorAll('[data-src]')].map(e => e.getAttribute('data-src')) }; });
    return { ok: r.mx[0] === 'y=۲' && !r.mx.some(m => /۳۵۲/.test(m)) && /\(۳۵۲\)/.test(r.txt), got: r }; });
  // A·A15: «➕ افزودنِ نقطه» فقط فرمِ همان نمودار
  await T('A·A15 add-point form scoped to its plot', async () => { const x = await setup({ chat: 'U: طول‌ها: ۴، ۷، ۹، ۱۰، ۱۱ ‖ A: خب. ‖ U: وزن‌ها: ۷۴، ۷۳، ۷۱، ۷۰ ‖ A: خب.' });
    await p.evaluate((sid) => { APP.go('today'); APP.ASSIST.store('cur', sid); APP.ASSIST.toggle(true); APP.ASSIST.paint(); }, x.sid); await W(400);
    const r = await p.evaluate(() => { const vis = () => [...document.querySelectorAll('.mx-addf')].map(f => getComputedStyle(f).display !== 'none'); const n = document.querySelectorAll('.mx-addf').length, before = vis(); const t = document.querySelectorAll('.mx-add-tog'); if (t[0]) t[0].click(); const after = vis(); return { n, before, after }; });
    return { ok: r.n >= 2 && r.before.every(v => !v) && r.after[0] === true && r.after.slice(1).every(v => !v), got: r }; });
  // A·A17: «ردش» با پرسشِ حدس می‌ماند
  await T('A·A17 «ردش» stays with the guess question', async () => { const r = await p.evaluate(() => [APP.liveAnaQ('کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟'), APP.liveAnaQ('مجهول چیست؟'), APP.liveAnaQ('اگر ردش کند چه؟')]); return { ok: J(r) === J([true, false, false]), got: r }; });
  // MT1: مسئله‌ای که خواست باز می‌شود؛ chat_invent فقط به خواستش و «همین الان» ⇒ live_new
  await T('MT1 live_new opens on her request', async () => { const x = await setup({ chat: 'U: سلام ‖ A: سلام.' }); await p.evaluate((sid) => { const se = APP.S.get(sid); se.lprob = ''; APP.S.put(se); APP.go('today'); }, x.sid);
    await actTurn(x.sid, 'یه مسئله‌ی جدید باز کن برای انتخاب رشته', [{ do: 'live_new', title: 'انتخاب رشته', statement: 'نمی‌دانم کدام رشته را انتخاب کنم؛ بین ریاضی و تجربی مانده‌ام' }]);
    const v = await p.evaluate(() => APP.state.view + '|' + (APP.liveRec(APP.state.arg) ? 'ok' : '')); return { ok: v === 'lprob|ok', got: v }; });

  /* ================= بانکِ VARIANTS_R20 ================= */
  const B = (rc) => bank.filter(e => e.rc === rc);
  const NC = (why) => ({ nc: why });
  const runBank = async (rc, map) => {
    const E = B(rc), R = bankRes[rc] = { n: E.length, pass: 0, fail: [], nc: [] };
    for (let i = 0; i < E.length; i++) { const e = E[i], f = map[i]; if (!f) { R.nc.push('#' + i + ' (no check)'); continue; }
      let r; try { r = typeof f === 'function' ? await f(e) : f; } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.message || ex).split('\n')[0] }; }
      if (r.nc) { R.nc.push('#' + i + ' ' + r.nc); continue; }
      if (r.ok) R.pass++; else { R.fail.push('#' + i + ' ' + e.kind + ' «' + e.text.slice(0, 50) + '» got ' + J(r.got).slice(0, 400)); errors.push(rc + ' #' + i + ' ' + e.kind + ' — ' + e.expect.slice(0, 100) + ' got ' + J(r.got).slice(0, 500)); } }
  };
  const ref = (name) => ({ ok: !!res[name], got: 'see ' + name });
  /* ---- RO1.by_fact (سویِ صفحه) ---- */
  await runBank('RO1.by_fact', {
    0: async () => { const x = await setup({ chat: 'U: فردا ساعت ۱۰ با خواهرم حرف می‌زنم؛ قیمت خونه‌ی بابا حدوداً ۸ میلیارده؛ حدسم اینه که مامان راضی نمی‌شه ‖ A: قبل از حرف زدن چه چیزی را می‌خواهی روشن کنی؟ ‖ U: قیمتو اشتباه گفتم، ۱۱ میلیارد بود', rec: { dl: [[0, 'قیمت خونه‌ی بابا حدوداً ۸ میلیارده']], g: [0, 'مامان راضی نمی‌شه'], plan: [0, 'فردا ساعت ۱۰ با خواهرم حرف می‌زنم'] } });
      const r = await rChat(x.sid, { msg: 'قیمت خونه‌ی بابا حدوداً ۸ میلیارده', what: 'fact', fix: '۱۱ میلیارد' }, 'قیمتو اشتباه گفتم، ۱۱ میلیارد بود'); const s = await snap(x.pid, x.sid);
      return { ok: r.ok && /۱۱ میلیارد/.test(s.dl[0]) && s.dlH === 1 && s.g.t === 'مامان راضی نمی‌شه' && s.g.h === 0 && s.plan.t === 'فردا ساعت ۱۰ با خواهرم حرف می‌زنم' && s.plan.h === 0, got: { r, s } }; },
    1: async () => { const x = await setup({ chat: 'U: حدسم n(n−1)/2 ـه؛ برای n=۴ شمردم و شد ۶ تا ‖ A: n=۵ را هم می‌شماری؟ ‖ U: هنوز نه ‖ A: باشد. ‖ U: شکل رو کشیدم ‖ A: خب؟ ‖ U: حدسمو بد نوشتم، منظورم n(n+1)/2 بود', rec: { g: [0, 'n(n−1)/2'], dl: [[0, 'برای n=۴ شمردم و شد ۶ تا']] } });
      const r = await rChat(x.sid, { msg: 'حدسم n(n−1)/2', what: 'guess', fix: 'n(n+1)/2' }, 'حدسمو بد نوشتم، منظورم n(n+1)/2 بود'); const s = await snap(x.pid, x.sid);
      return { ok: r.ok && s.g.t === 'n(n+1)/2' && s.g.h === 1 && s.dl[0] === 'برای n=۴ شمردم و شد ۶ تا' && s.dlH === 0, got: { r, s } }; },
    2: async () => { const wed = nextWd(4); const x = await setup({ chat: 'U: گام ۱ رو انجام دادم و جواب داد؛ برنامه‌م اینه که چهارشنبه گام ۲ رو برم ‖ A: گام ۲ دقیقاً چیست؟ ‖ U: زنگ زدن به بانک ‖ A: ساعتش؟ ‖ U: صبح ‖ A: باشد. ‖ U: منظورم سه‌شنبه بود نه چهارشنبه', rec: { plan: [0, 'چهارشنبه گام ۲ رو برم'], planDue: wed, steps: [{ text: 'گام ۱', closed: 'yes' }] } });
      const r = await rChat(x.sid, { msg: 'چهارشنبه گام ۲ رو برم', what: 'plan', fix: 'سه‌شنبه' }, 'منظورم سه‌شنبه بود نه چهارشنبه'); const s = await snap(x.pid, x.sid);
      return { ok: r.ok && /^سه‌شنبه/.test(s.plan.t) && s.plan.due === addD(wed, -1) && s.steps[0].out && s.steps[0].out.done === 'yes' && s.steps[0].h === 0, got: { r, s } }; },
    3: () => ref('D·2 lesson correction keeps the verdict'),
    4: async () => { const x = await setup({ chat: 'U: حقوق ماهانه‌ام ۴۰ میلیون تومان است، اجاره ۱۵ میلیون و قسط وام ۸ میلیون. ‖ A: چه مقدار پس‌انداز در نظر دارید؟ ‖ U: تصحیح می‌کنم: اجاره ۱۸ میلیون تومان است، نه ۱۵.', rec: { dl: [[0, 'حقوق ماهانه ۴۰ میلیون تومان'], [0, 'اجاره ۱۵ میلیون'], [0, 'قسط وام ۸ میلیون']] } });
      const r = await rChat(x.sid, { msg: 'اجاره ۱۵ میلیون', what: 'fact', fix: '۱۸ میلیون' }, 'تصحیح می‌کنم: اجاره ۱۸ میلیون تومان است، نه ۱۵.'); const s = await snap(x.pid, x.sid);
      return { ok: r.ok && J(s.dl) === J(['حقوق ماهانه ۴۰ میلیون تومان', 'اجاره ۱۸ میلیون', 'قسط وام ۸ میلیون']) && s.dlH === 1, got: { r, s, note: 'remainder recompute + «شما» reply: coach' } }; },
    5: async () => { const x = await setup({ chat: 'U: با استقرا ثابت می‌کنم؛ پایه n=۱ درسته، فرض رو برای k گرفتم ‖ A: ادامه بده.', rec: { plan: [0, 'با استقرا ثابت می‌کنم'], steps: [{ text: 'پایه n=۱ درسته', src: 0 }, { text: 'فرض رو برای k گرفتم', src: 0 }] } });
      const r = await rEdit(x.sid, 0, 'با استقرا ثابت می‌کنم؛ پایه n=۰ درسته، فرض رو برای k گرفتم'); const s = await snap(x.pid, x.sid);
      return { ok: r.ok && s.steps[0].text === 'پایه n=۰ درسته' && s.steps[1].text === 'فرض رو برای k گرفتم' && s.steps[1].h === 0 && s.plan.h === 0, got: { r, s } }; },
    6: async () => { const x = await setup({ chat: 'U: جوابم ۴۲ ـه، با جایگذاری چک کردم درست درمیاد ‖ A: ✓ ‖ U: حالا بازنگری ‖ A: چه چیزی آموختی؟ ‖ U: که جایگذاری مهمه ‖ A: باشد. ‖ U: صبر کن جواب ۴۸ بود نه ۴۲', rec: { chat: [0, 'جوابم ۴۲'], verdict: [0, 'با جایگذاری چک کردم'], lesson: [2, 'جایگذاری مهمه'] } });
      const r = await rChat(x.sid, { msg: 'جوابم ۴۲', what: 'ans', fix: '۴۸' }, 'صبر کن جواب ۴۸ بود نه ۴۲'); const s = await snap(x.pid, x.sid);
      return { ok: r.ok && s.chat.s === 'جوابم ۴۸' && s.verdict.v !== 'verified' && s.verdict.sup && s.use === 'جایگذاری مهمه', got: { r, s } }; },
    7: async () => { const x = await setup({ chat: 'U: امروز خیلی خسته‌ام، ولی حدسم ۱۲ ـه ‖ A: چرا ۱۲؟ ‖ U: خسته نبودم راستش، فقط حوصله نداشتم، اشتباه گفتم', rec: { g: [0, '۱۲'] } });
      const r = await rChat(x.sid, { msg: 'امروز خیلی خسته‌ام', what: 'said', fix: 'فقط حوصله نداشتم' }, 'خسته نبودم راستش، فقط حوصله نداشتم، اشتباه گفتم'); const s = await snap(x.pid, x.sid);
      return { ok: (!r.ok || r.n === 0) && s.g.t === '۱۲' && s.g.h === 0 && !/^اصلاح شد/.test(r.note), got: { r, s } }; },
    8: async () => { const x = await setup({ chat: 'U: طرحم اینه که از آخر به اول برم ‖ A: از کجا شروع می‌کنی؟ ‖ U: از حالت n ‖ A: بعد؟ ‖ U: n−۱ ‖ A: ادامه بده. ‖ U: صبر کن ‖ A: بله؟ ‖ U: نه، طرحم این بود که مسئله رو به دو حالت زوج و فرد تقسیم کنم، اشتباه گفتم', rec: { plan: [0, 'از آخر به اول برم'], steps: [{ text: 'از حالت n', src: 1 }] } });
      const r = await rChat(x.sid, { msg: 'از آخر به اول برم', what: 'plan', fix: 'مسئله رو به دو حالت زوج و فرد تقسیم کنم' }, 'نه، طرحم این بود که مسئله رو به دو حالت زوج و فرد تقسیم کنم، اشتباه گفتم'); const s = await snap(x.pid, x.sid);
      return { ok: r.ok && /زوج و فرد/.test(s.plan.t) && s.plan.h === 1 && s.steps[0].text === 'از حالت n' && s.steps[0].h === 0, got: { r, s, note: 'withdraw+re-book of the planning mind event: coach' } }; },
    9: NC('two guesses in one message are coach records (s.coach.guesses g1/g2); the page has one guess slot'),
    10: () => ref('D·3 deadline from her message is reversible'),
    11: async () => { const x = await setup({ chat: 'U: آب با نرخ ۵ لیتر در دقیقه وارد می‌شه و مخزن ۲ ساعته پر می‌شه ‖ A: حجم مخزن؟ ‖ U: عددشو اشتباه گفتم، ۶ بود', rec: { dl: [[0, 'نرخ ۵ لیتر در دقیقه'], [0, 'مخزن ۲ ساعته پر می‌شه']] } });
      const r = await rLive(x.pid, x.sid, 0, { frag: 'آب با نرخ ۵ لیتر', fix: '۶', what: 'fact', key: 'datum:rate', by: x.mids[1] }); const s = await snap(x.pid, x.sid);
      return { ok: r.ok && s.dl[0] === 'نرخ ۶ لیتر در دقیقه' && s.dl[1] === 'مخزن ۲ ساعته پر می‌شه', got: { r, s, note: 'no-key «کدام؟» ask: coach (liveRetractCands)' } }; },
    12: NC('the plot point and bubble come from the message text; a chat correction leaves her bubble text (only «✏️» edits it) — moving the plotted point on a chat correction is not implemented (open)'),
    13: async () => { const x = await setup({ chat: 'U: طرحم: حالت‌های کوچک ‖ A: خوب.', rec: { plan: [0, 'طرحم: حالت‌های کوچک'] } });
      await rEdit(x.sid, 0, 'طرحم: حالت‌های زوج و فرد'); const d = await dos(x.pid), pl = d.evs.find(e => e.k === 'plan'), corr = d.evs.filter(e => e.k === 'retract');
      return { ok: pl && pl.hist === 1 && corr.length === 1, got: { pl, corr: corr.length } }; },
    14: async () => { const x = await setup({ chat: 'U: اشتباه کردم، دیروز به‌جای جلسه رفتم سر کار ‖ A: بعدش چه شد؟' }); const r = await rChat(x.sid, { msg: 'دیروز به‌جای جلسه رفتم سر کار', what: 'fact', fix: 'جلسه' }, 'اشتباه کردم، دیروز به‌جای جلسه رفتم سر کار'); return { ok: !r.ok, got: r }; },
    15: async () => { const x = await setup({ chat: 'U: علامتش مثبته ‖ A: مطمئنی؟ ‖ U: معلممون گفت «اشتباه نوشتی، علامتش منفیه»', rec: { dl: [[0, 'علامتش مثبته']] } }); const r = await rChat(x.sid, { msg: 'علامتش مثبته', what: 'fact', fix: 'منفیه' }, 'معلممون گفت «اشتباه نوشتی، علامتش منفیه»'); const s = await snap(x.pid, x.sid); return { ok: !r.ok && s.dl[0] === 'علامتش مثبته', got: r }; },
    16: async () => { const x = await setup({ chat: 'U: طرحم اینه که حالت‌ها رو بشمارم ‖ A: خب. ‖ U: یه راه دیگه هم به ذهنم رسید: شاید با استقرا بشه', rec: { plan: [0, 'حالت‌ها رو بشمارم'] } }); const r = await rChat(x.sid, { msg: 'حالت‌ها رو بشمارم', what: 'plan', fix: 'با استقرا' }, 'یه راه دیگه هم به ذهنم رسید: شاید با استقرا بشه'); const s = await snap(x.pid, x.sid); return { ok: !r.ok && s.plan.h === 0, got: r }; },
    17: async () => { const x = await setup({ chat: 'U: قیمت خونه ۸ میلیارده ‖ A: … ‖ U: یه چیز دیگه هم بگم: قسطش ۱۲ ماهه‌ست', rec: { dl: [[0, 'قیمت خونه ۸ میلیارده']] } }); const r = await rChat(x.sid, { msg: 'قیمت خونه ۸ میلیارده', what: 'fact', fix: '۱۲ ماهه' }, 'یه چیز دیگه هم بگم: قسطش ۱۲ ماهه‌ست'); const s = await snap(x.pid, x.sid); return { ok: !r.ok && s.dlH === 0, got: r }; },
    18: async () => { const x = await setup({ chat: 'U: مساحت رو حساب کن ‖ A: پس مساحت ۲۰ است. ‖ U: اون ۲۰ که گفتی غلطه' }); const r = await rChat(x.sid, { msg: 'مساحت ۲۰', what: 'ans', fix: 'غلطه' }, 'اون ۲۰ که گفتی غلطه'); return { ok: !r.ok, got: r }; },
    19: async () => { const x = await setup({ chat: 'U: برنامه‌م سه‌شنبه‌ست ‖ A: … ‖ U: تصمیمم عوض شد، دیگه سه‌شنبه نمی‌رم، بذارش برای شنبه', rec: { plan: [0, 'برنامه‌م سه‌شنبه‌ست'] } }); const r = await rChat(x.sid, { msg: 'برنامه‌م سه‌شنبه‌ست', what: 'plan', fix: 'شنبه' }, 'تصمیمم عوض شد، دیگه سه‌شنبه نمی‌رم، بذارش برای شنبه'); const s = await snap(x.pid, x.sid); return { ok: !r.ok && s.plan.h === 0, got: { r, note: 'the plan move as a new act: coach' } }; },
    20: async () => { const x = await setup({ chat: 'U: قیمت خونه ۸ میلیارده ‖ A: … ‖ U: قیمتو اشتباه گفتم، ۱۱ میلیارد بود ‖ A: … ‖ U: آره همون ۱۱ دیگه', rec: { dl: [[0, 'قیمت خونه ۸ میلیارده']] } });
      await rChat(x.sid, { msg: 'قیمت خونه ۸ میلیارده', what: 'fact', fix: '۱۱ میلیارد' }, 'قیمتو اشتباه گفتم، ۱۱ میلیارد بود'); const r2 = await rChat(x.sid, { msg: 'قیمت خونه ۸ میلیارده', what: 'fact', fix: '۱۱' }, 'آره همون ۱۱ دیگه'); const s = await snap(x.pid, x.sid);
      return { ok: /۱۱ میلیارد/.test(s.dl[0]) && s.dlH === 1 && (!r2.ok || r2.n === 0), got: { r2, s } }; },
    21: async () => { const x = await setup({ chat: 'U: سلام ‖ A: سلام! ‖ U: اون سلامو بی‌خیال' }); const r = await rChat(x.sid, { msg: 'سلام', what: 'said', fix: 'بی‌خیال' }, 'اون سلامو بی‌خیال'); return { ok: !r.ok || r.n === 0, got: r }; },
    22: async () => { const x = await setup({ chat: 'U: جوابم ۲۴ ـه ‖ A: چطور چک می‌کنی؟ ‖ U: جوابم غلط بود؟', rec: { chat: [0, 'جوابم ۲۴'] } }); const r = await rChat(x.sid, { msg: 'جوابم ۲۴', what: 'ans', fix: 'غلط' }, 'جوابم غلط بود؟'); const s = await snap(x.pid, x.sid); return { ok: !r.ok && s.chat.s === 'جوابم ۲۴', got: r }; },
    23: async () => { const x = await setup({ chat: 'U: خنه‌ی بابا ۸ میلیارده ‖ A: خب. ‖ U: خونه رو با واو ننوشتم، ببخشید، اشتباه نوشتم', rec: { dl: [[0, 'خنه‌ی بابا ۸ میلیارده']], g: [0, '۸ میلیارد کمه'] } });
      const r = await rChat(x.sid, { msg: 'خنه‌ی بابا', what: 'said', fix: 'خونه' }, 'خونه رو با واو ننوشتم، ببخشید، اشتباه نوشتم'); const s = await snap(x.pid, x.sid);
      return { ok: /۸ میلیارد/.test(s.dl[0]) && s.g.t === '۸ میلیارد کمه' && !s.g.wd, got: { r, s } }; },
  });
  /* ---- RO2.src_everywhere ---- */
  await runBank('RO2.src_everywhere', {
    0: () => ref('C20-2 chat_invent follows the correction'),
    1: () => ({ ok: !!(res['B·D1 chat-closed src is the first message'] && res['B·D1/RO2.1 datum correction follows chat-closed records']), got: 'see B·D1' }),
    2: async () => { const x = await setup({ chat: 'U: مجهول زمانِ کل رفت‌وبرگشته ‖ A: ثبت شد. ‖ U: منظورم فقط زمانِ رفت بود' });
      await p.evaluate((x) => { const S = APP.S, pg = S.get('eprog_' + x.pid), se = S.get(x.sid), U = se.msgs.filter(m => m.role === 'user'); pg.solve.live.uDraft = { type: 'find', nat: 'practical', one: '', u: 'زمانِ کل رفت‌وبرگشت', dl: [{ id: 'd1', t: '' }], c: '', src: { u: APP.liveSrc(x.sid, APP.liveMsgId(U[0]), 'unknown', 'زمانِ کل رفت‌وبرگشت') } }; S.put(pg); }, x);
      const r = await rChat(x.sid, { msg: 'زمانِ کل رفت‌وبرگشت', what: 'form', fix: 'زمانِ رفت' }, 'منظورم فقط زمانِ رفت بود'); const s = await snap(x.pid, x.sid), dr = await p.evaluate((pid) => APP.S.get('eprog_' + pid).solve.live.uDraft.u, x.pid);
      return { ok: r.ok && dr === 'زمانِ رفت' && s.asks.length === 0, got: { r, dr, asks: s.asks } }; },
    3: async () => { const x = await setup({ chat: 'U: درسم اینه که همیشه واحدها رو چک کنم ‖ A: درس و کارت ساخته شد. ‖ U: نه، درسم این بود که اول حالت خاص رو امتحان کنم، اشتباه گفتم', rec: { verdict: [0, ''], lesson: [0, 'همیشه واحدها رو چک کنم'] } });
      await p.evaluate((x) => { const S = APP.S, pg = S.get('eprog_' + x.pid), so = pg.solve; const c = APP.newCard('بازسازی — «آزمون»', 'همیشه واحدها رو چک کنم', { pb: x.pid }); so.lessons = [{ lv: 1, use: 'همیشه واحدها رو چک کنم', card: c.id, chat: true }]; S.put(pg); window.__card = c.id; }, x);
      const r = await rLive(x.pid, x.sid, 0, { frag: 'همیشه واحدها رو چک کنم', fix: 'اول حالت خاص رو امتحان کنم', what: 'said', by: x.mids[1] }); const s = await snap(x.pid, x.sid), ca = await p.evaluate(() => APP.S.get(window.__card).a);
      return { ok: r.ok && s.use === 'اول حالت خاص رو امتحان کنم' && ca === 'اول حالت خاص رو امتحان کنم', got: { r, s, ca } }; },
    4: async () => { const mon = nextWd(2); const x = await dlSess('مهلت تحویل پروژه دوشنبه‌ست', { do: 'deadline', what: 'تحویل پروژه', date: mon });
      await p.evaluate((sid) => { const se = APP.S.get(sid); se.msgs.push({ role: 'user', text: 'مهلتش سه‌شنبه‌ست نه دوشنبه، اشتباه گفتم', at: new Date().toISOString(), actions: [] }); APP.S.put(se); }, x.sid);
      const r = await rChat(x.sid, { msg: 'دوشنبه', what: 'plan', fix: 'سه‌شنبه' }, 'مهلتش سه‌شنبه‌ست نه دوشنبه، اشتباه گفتم');
      const dl = await p.evaluate((sid) => APP.S.all('deadline', y => y.src && y.src.sess === sid).map(y => y.date), x.sid); return { ok: r.ok && J(dl) === J([addD(mon, 1)]), got: { r, dl } }; },
    5: () => ref('A·A2 page-typed copy asks'),
    6: async () => { const x = await setup({ chat: 'U: امسال باید بفروشیم ‖ A: چرا؟', rec: { c: [null, 'باید امسال بفروشیم'] } }); const r = await rEdit(x.sid, 0, 'تا آخرِ سالِ بعد باید بفروشیم'); const s = await snap(x.pid, x.sid);
      return { ok: r.ok && s.c === 'باید امسال بفروشیم' && s.asks.length === 1 && s.asks[0].path === 'u.c', got: { r, s, note: 'contradiction flag recompute after «بله»: not covered' } }; },
    7: () => ref('D·4 assistant-filled statement follows; self-edited asks'),
    8: async () => { const x = await setup({ chat: 'U: قیمت ۸ میلیارده ‖ A: خب. ‖ U: قیمتو اشتباه گفتم، ۱۱ بود', rec: { stmt: [null, 'خانهٔ پدری؛ قیمت ۸ میلیارد است و نمی‌دانم بفروشیم یا نه'], dl: [[null, 'قیمت ۸ میلیارد']] } });
      const r = await rChat(x.sid, { msg: 'قیمت ۸ میلیارده', what: 'fact', fix: '۱۱' }, 'قیمتو اشتباه گفتم، ۱۱ بود'); const s = await snap(x.pid, x.sid);
      return { ok: r.ok && s.asks.length === 2 && /۸ میلیارد/.test(s.stmt) && s.dl[0] === 'قیمت ۸ میلیارد', got: { r, s } }; },
    9: NC('practice case topic from chat is a41 (practice+sched fixer)'),
    10: NC('the 🌱 habit reminder is not a live/chat record of this area (a31/a42 hooks — practice+sched)'),
    11: async () => { const x = await setup({ chat: 'U: قیمت خونه‌ی بابا حدوداً ۸ میلیارده ‖ A: خب. ‖ U: قیمتو اشتباه گفتم، ۱۱ میلیارد بود', rec: { dl: [[0, 'قیمت خونه‌ی بابا حدوداً ۸ میلیارده'], [null, '۸ میلیارد']] } });
      await rChat(x.sid, { msg: 'قیمت خونه‌ی بابا حدوداً ۸ میلیارده', what: 'fact', fix: '۱۱ میلیارد' }, 'قیمتو اشتباه گفتم، ۱۱ میلیارد بود'); const s = await snap(x.pid, x.sid);
      await p.evaluate(([sid, id]) => APP.liveCopyAnswer(sid, id, false), [x.sid, s.asks[0] && s.asks[0].id]); const d = await dos(x.pid);
      return { ok: d.evs.some(e => e.k === 'retract') && d.evs.some(e => e.k === 'copyans' && /نگه داشته شد/.test(e.out) && /۸ میلیارد/.test(e.out)), got: d.evs.map(e => e.k + ':' + e.out) }; },
    12: async () => { const x = await setup({ chat: 'U: قیمت خونه‌ی بابا ۸ میلیارده ‖ A: خب. ‖ U: قیمتو اشتباه گفتم، ۱۱ میلیارد بود', rec: { dl: [[0, 'قیمت خونه‌ی بابا ۸ میلیارده'], [null, 'قیمت آپارتمان خواهرم ۸ میلیارد']] } });
      await rChat(x.sid, { msg: 'قیمت خونه‌ی بابا ۸ میلیارده', what: 'fact', fix: '۱۱ میلیارد' }, 'قیمتو اشتباه گفتم، ۱۱ میلیارد بود'); const s = await snap(x.pid, x.sid); return { ok: s.asks.length === 0 && s.dl[1] === 'قیمت آپارتمان خواهرم ۸ میلیارد', got: s }; },
    13: async () => { const x = await setup({ chat: 'U: قیمت ۸ میلیارده ‖ A: خب. ‖ U: قیمتو اشتباه گفتم، ۱۱ بود', rec: { dl: [[null, '۱۸ میلیارد']] } }); await rChat(x.sid, { msg: 'قیمت ۸ میلیارده', what: 'fact', fix: '۱۱' }, 'قیمتو اشتباه گفتم، ۱۱ بود'); const s = await snap(x.pid, x.sid); return { ok: s.asks.length === 0 && s.dl[0] === '۱۸ میلیارد', got: s }; },
    14: async () => { const x = await setup({ chat: 'U: قیمت ۸ میلیارده و عرض ۵ متره ‖ A: خب. ‖ U: قیمتو اشتباه گفتم، ۱۱ بود ‖ A: خب. ‖ U: عرض رو هم اشتباه گفتم، ۶ بود', rec: { stmt: [null, 'قیمت ۸ میلیارد'], dl: [[null, 'عرض ۵ متر']] } });
      await rChat(x.sid, { msg: 'قیمت ۸ میلیارده', what: 'fact', fix: '۱۱' }, 'قیمتو اشتباه گفتم، ۱۱ بود'); let s = await snap(x.pid, x.sid); const q = s.asks.find(a => a.path === 'stmt'); if (q) await p.evaluate(([sid, id]) => APP.liveCopyAnswer(sid, id, false), [x.sid, q.id]);
      await rChat(x.sid, { msg: 'قیمت ۸ میلیارده', what: 'fact', fix: '۱۱' }, 'قیمتو اشتباه گفتم، ۱۱ بود');
      await rChat(x.sid, { msg: 'عرض ۵ متره', what: 'fact', fix: '۶' }, 'عرض رو هم اشتباه گفتم، ۶ بود'); s = await snap(x.pid, x.sid);
      return { ok: !!q && s.asks.filter(a => a.path === 'stmt').length === 1 && s.asks.some(a => a.path === 'dl:d1' && a.state === 'open'), got: s.asks }; },
    15: async () => { const x = await setup({ chat: 'U: عرض ۵ متره ‖ A: خب. ‖ U: عرض رو اشتباه گفتم، ۶ بود', rec: { dl: [[null, 'عرض ۵ متر']] } }); const r = await rChat(x.sid, { msg: 'عرض ۵ متره', what: 'fact', fix: '۶' }, 'عرض رو اشتباه گفتم، ۶ بود'); const s = await snap(x.pid, x.sid);
      return { ok: s.dl[0] === 'عرض ۵ متر' && s.asks.length === 1 && /این‌جا هم عوض شود/.test(r.note), got: { r, s } }; },
    16: async () => { const x = await setup({ chat: 'U: سلام، امروز چیکار کنیم؟ ‖ A: … ‖ U: اون پیامِ اولمو بی‌خیال، اشتباه نوشتم' }); const r = await rChat(x.sid, { msg: 'سلام، امروز چیکار کنیم؟', what: 'said', fix: 'بی‌خیال' }, 'اون پیامِ اولمو بی‌خیال، اشتباه نوشتم'); return { ok: !r.ok || r.n === 0, got: r }; },
    17: async () => { const x = await setup({ chat: 'U: قیمت ۱۱ میلیارده ‖ A: «… پس قیمت ۸ میلیارد است.» ‖ U: نه، اون ۸ رو تو گفتی، من گفتم ۱۱', rec: { dl: [[0, 'قیمت ۱۱ میلیارده']] } }); const r = await rChat(x.sid, { msg: 'قیمت ۸ میلیارد', what: 'fact', fix: '۱۱' }, 'نه، اون ۸ رو تو گفتی، من گفتم ۱۱'); const s = await snap(x.pid, x.sid); return { ok: !r.ok && s.dl[0] === 'قیمت ۱۱ میلیارده' && s.asks.length === 0, got: r }; },
    18: async () => { const x = await setup({ chat: 'U: این مسئله رو انتخاب کردم ‖ A: خب. ‖ U: اشتباه کردم که این مسئله رو انتخاب کردم' }); const r = await rChat(x.sid, { msg: 'این مسئله رو انتخاب کردم', what: 'said', fix: 'اشتباه' }, 'اشتباه کردم که این مسئله رو انتخاب کردم'); return { ok: !r.ok, got: r }; },
    19: async () => { const x = await setup({ chat: 'U: عرض ۵ متره ‖ A: خب. ‖ U: عرض رو اشتباه گفتم، ۶ بود ‖ A: خب. ‖ U: باشه ‖ A: . ‖ U: بعدی', rec: { dl: [[null, 'عرض ۵ متر']] } }); await rChat(x.sid, { msg: 'عرض ۵ متره', what: 'fact', fix: '۶' }, 'عرض رو اشتباه گفتم، ۶ بود');
      const hk = await p.evaluate((sid) => { const s = APP.S.get(sid); return APP.ASSIST.promptHooks.map(f => { try { return f(s, 'بعدی') || ''; } catch (e) { return ''; } }).filter(x => /این‌جا هم عوض شود/.test(x)).join('\n'); }, x.sid); const s = await snap(x.pid, x.sid);
      return { ok: s.dl[0] === 'عرض ۵ متر' && s.asks.length === 1 && s.asks[0].state === 'open' && /دوباره نپرس/.test(hk), got: { s, hk } }; },
    20: async () => { const x = await setup({ chat: 'U: قیمت ۸ میلیارده ‖ A: خب. ‖ U: قیمتو اشتباه گفتم، ۱۱ بود', rec: { dl: [[0, 'قیمت ۸ میلیارده']] } }); const y = await setup({ chat: 'U: سلام ‖ A: سلام.', rec: { dl: [[null, 'قیمت ۸ میلیارد']] } });
      await rChat(x.sid, { msg: 'قیمت ۸ میلیارده', what: 'fact', fix: '۱۱' }, 'قیمتو اشتباه گفتم، ۱۱ بود'); const s = await snap(x.pid, x.sid), t = await snap(y.pid, y.sid); return { ok: s.asks.length === 0 && t.dl[0] === 'قیمت ۸ میلیارد' && t.dlH === 0, got: { s: s.asks, t } }; },
    21: async () => { const x = await setup({ chat: 'U: یه چیزی پرسیدم ‖ A: خب. ‖ U: مرسی، حل شد' }); await p.evaluate((x) => { const se = APP.S.get(x.sid); se.lprob = ''; APP.S.put(se); }, x);
      await actTurn(x.sid, '', [{ do: 'chat_solved', title: 'مسئلهٔ بی‌منبع', statement: 'مسئله‌ای که دستیار به واژه‌های دیگر نوشت درباره‌ی کسرها و مخرج مشترک', solution: 'سه چهارم' }]);
      const pid = await p.evaluate((sid) => { const r = APP.liveAll().filter(y => y.sess === sid).pop(); return r && r.p.id; }, x.sid); const d = await dos(pid), u = d.evs.find(e => e.k === 'u');
      return { ok: u && u.src === 'UNKNOWN' && /منبع: نامعلوم/.test(d.text), got: u }; },
  });
  /* ---- RO5.edit_path (سویِ صفحه) ---- */
  await runBank('RO5.edit_path', {
    0: () => ref('A·A3/RO5.0 editor visible in both themes'),
    1: NC('the «(شاید)» fallback block on the ✏️ turn is a27 (coach fixer)'),
    2: NC('evidence booking from the ✏️ turn coach_state is a27/a29 (coach fixer)'),
    3: NC('the self-correction look-back event is a27/a29 (coach fixer)'),
    4: async () => { const mk = () => setup({ chat: 'U: عرض ۵ متره ‖ A: خب. ‖ U: عرضو اشتباه گفتم، ۹ بود', rec: { dl: [[0, 'عرض ۵ متره']] } }); const a = await mk(), c = await mk();
      await rChat(a.sid, { msg: 'عرض ۵ متره', what: 'fact', fix: '۹' }, 'عرضو اشتباه گفتم، ۹ بود'); await rEdit(c.sid, 0, 'عرض ۹ متره'); const sa = await snap(a.pid, a.sid), sc = await snap(c.pid, c.sid);
      return { ok: J(sa.dl) === J(sc.dl) && sa.dlH === sc.dlH && sa.dl[0] === 'عرض ۹ متره', got: { a: sa.dl, c: sc.dl } }; },
    5: async () => { const x = await setup({ chat: 'U: گام ۱ انجام شد ‖ A: خوب. ‖ U: گام ۲ رو انجام دادم و جواب داد ‖ A: عالی.', rec: { steps: [{ text: 'گام ۱', closed: 'yes' }, { text: 'گام ۲' }], reps: [{ step: 2, done: 'yes', match: 'yes', what: 'جواب داد', msg: 2 }] } });
      const r = await rEdit(x.sid, 1, 'گام ۲ رو انجام دادم و جواب نداد'); const s = await snap(x.pid, x.sid);
      return { ok: r.ok && s.steps[1].out && s.steps[1].out.match === 'no' && s.steps[0].h === 0 && s.steps[0].out.done === 'yes', got: { r, s } }; },
    6: async () => { const x = await setup({ chat: 'U: طرحم: شنبه با مدیر حرف بزنم ‖ A: خوب.', rec: { plan: [0, 'شنبه با مدیر حرف بزنم'] } }); await rEdit(x.sid, 0, 'طرحم: یکشنبه با مدیر حرف بزنم');
      const hk = await p.evaluate((sid) => { const s = APP.S.get(sid); return APP.ASSIST.promptHooks.map(f => { try { return f(s, '') || ''; } catch (e) { return ''; } }).filter(x => /^# اصلاحِ پیامِ قبلی/.test(x)).join('\n'); }, x.sid);
      return { ok: /طرح/.test(hk) && !/هیچ رکوردی/.test(hk), got: hk }; },
    7: async () => { const x = await setup({ chat: 'U: قیمت ۸ میلیارده ‖ A: خب.', rec: { dl: [[null, 'قیمت ۸ میلیارد']] } }); const r = await rEdit(x.sid, 0, 'قیمت ۱۱ میلیارده'); return { ok: r.ok && r.ask === 1, got: r }; },
    8: async () => { const x = await setup({ chat: 'U: جواب ۵۵ه ‖ A: خب.' }); const r = await p.evaluate((sid) => { const se = APP.S.get(sid); return APP.ASSIST.retractEdit(se, se.msgs[0], 'جواب ۵۵ه'); }, x.sid); const n = await p.evaluate((sid) => APP.S.get(sid).msgs.length, x.sid); return { ok: !r.ok && r.same && n === 2, got: r }; },
    9: async () => { const x = await setup({ chat: 'U: سلام ‖ A: سلام، چه کمکی؟' }); const n = await p.evaluate((sid) => { APP.go('today'); APP.ASSIST.store('cur', sid); APP.ASSIST.toggle(true); APP.ASSIST.paint(); return [document.querySelectorAll('.as-msg.ai .as-editb').length, document.querySelectorAll('.as-msg.user .as-editb').length]; }, x.sid); return { ok: n[0] === 0 && n[1] >= 1, got: n }; },
    10: async () => { const x = await setup({ chat: 'U: جواب ۵۵ه ‖ A: خب.', rec: { chat: [0, 'جواب ۵۵ه'] } }); await p.evaluate((sid) => { APP.go('today'); APP.ASSIST.store('cur', sid); APP.ASSIST.toggle(true); APP.ASSIST.paint(); document.querySelector('.as-msg.user .as-editb').click(); }, x.sid); await W(40);
      await p.evaluate(() => { const ta = document.querySelector('.as-edtx'); ta.value = 'جواب ۴۴ه'; ta.dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('.as-edcancel').click(); }); const s = await snap(x.pid, x.sid), n = await p.evaluate((sid) => APP.S.get(sid).msgs.length, x.sid); return { ok: s.chat.s === 'جواب ۵۵ه' && s.chat.h === 0 && n === 2, got: { s, n } }; },
    11: NC('register evidence from the ✏️ turn is a27 (coach fixer)'),
    12: async () => { const x = await setup({ chat: 'U: سلام، خسته‌ام ‖ A: سلام.' }); const r = await rEdit(x.sid, 0, 'سلام، خواب‌آلودم'); return { ok: r.ok && r.n === 0 && /ثبت نشده بود/.test(r.note), got: r }; },
    13: NC('deferred-request candidates are a27 (coach fixer)'),
    14: NC('planning-success booking is a27/a29 (coach fixer)'),
    15: NC('fallback/retract on an ordinary later message is a27 (coach fixer)'),
  });
  /* ---- RO6.dossier_log ---- */
  await runBank('RO6.dossier_log', {
    0: () => ref('A·A6 chat plans in the dossier, in event order'),
    1: async () => { const x = await setup({ chat: 'U: قیمت ۸ میلیارده؛ شنبه می‌رم ‖ A: خب. ‖ U: قیمتو اشتباه گفتم، ۱۱ بود', rec: { dl: [[0, 'قیمت ۸ میلیارده']], plan: [0, 'شنبه می‌رم'] } });
      await rChat(x.sid, { msg: 'قیمت ۸ میلیارده', what: 'fact', fix: '۱۱' }, 'قیمتو اشتباه گفتم، ۱۱ بود'); await rEdit(x.sid, 0, 'قیمت ۸ میلیارده؛ یکشنبه می‌رم'); const d = await dos(x.pid), c = d.evs.filter(e => e.k === 'retract');
      return { ok: c.length === 2 && c.every(e => e.at && /⇐/.test(e.lines[0])), got: c }; },
    2: () => ({ ok: !!res['B·D1 chat-closed src is the first message'], got: 'see B·D1' }),
    3: () => ref('D·6 session dossier without a live problem'),
    4: () => ref('A·A7 solved before look-back'),
    5: NC('practice sessions dated by A.now are a41 (practice+sched fixer); the dossier lists a41 sessions at their own at'),
    6: () => ref('D·5 typed rendering of the return'),
    7: () => ref('B·D7 one status source'),
    8: () => ref('D·15 dossier sign equals the mind card'),
    9: async () => { const x = await setup({ chat: 'U: شروع ‖ A: خوب.' }); await p.evaluate((pid) => { const pg = APP.S.get('eprog_' + pid), L = pg.solve.live, u = { done: true, at: new Date().toISOString(), one: 'کل', u: 'مجهول', dl: [], c: '' }; L.uHist = [u, JSON.parse(JSON.stringify(u))]; pg.solve.u = { 1: Object.assign({}, u, { one: 'کلِ تازه' }) }; APP.S.put(pg); }, x.pid);
      const d = await dos(x.pid); return { ok: d.evs.filter(e => e.k === 'uold').length === 1, got: d.evs.map(e => e.k) }; },
    10: () => ref('D·6 verdict explanation'),
    11: async () => { const x = await setup({ chat: 'U: فکر کنم کلید دستِ سرایداره ‖ A: چرا؟', rec: { g: [0, 'کلید دستِ سرایداره'] } }); await rEdit(x.sid, 0, 'کلید رو دیروز خودم گم کردم'); const d = await dos(x.pid), g = d.evs.find(e => e.k === 'guess'); return { ok: g && g.wd && /پس گرفته شد/.test(g.out), got: g }; },
    12: async () => { const a = await setup({ chat: 'U: مسئلهٔ الف ‖ A: خب.', title: 'الفِ آزمون', rec: { plan: [0, 'طرحِ الف'] } }); const bb = await setup({ chat: 'U: مسئلهٔ ب ‖ A: خب.', title: 'بِ آزمون', rec: { plan: [0, 'طرحِ ب'] } }); const d = await dos(a.pid); return { ok: !/طرحِ ب/.test(d.text), got: d.evs.map(e => e.lines.join('|')) }; },
    13: () => ref('A·A6 chat plans in the dossier, in event order'),
    14: () => ref('C20-10 a never-refuted guess is not «رد شد»'),
    15: async () => { const x = await setup({ chat: 'U: شروع ‖ A: خوب.', rec: { plan: [0, 'طرح'] } }); const n1 = (await dos(x.pid)).evs.length; await p.evaluate(() => { APP.render(); APP.render(); }); const n2 = (await dos(x.pid)).evs.length;
      const id = await p.evaluate((pid) => { const e1 = APP.EVLOG.add({ pid, k: 'act', at: new Date().toISOString(), title: 'یک کنش', id: 'fixed1' }); APP.EVLOG.add({ pid, k: 'act', at: e1.at, title: 'یک کنش', id: 'fixed1' }); return APP.EVLOG.of({ pid }).filter(e => e.id === 'fixed1').length; }, x.pid);
      return { ok: n1 === n2 && id === 1, got: { n1, n2, id } }; },
    16: async () => { const x = await setup({ chat: 'U: شروع ‖ A: این یک پیامِ دستیار است بی هیچ کنش.' }); const d = await dos(x.pid); return { ok: !/پیامِ دستیار است/.test(d.text), got: d.evs.map(e => e.k) }; },
  });
  /* ---- RO9.small ---- */
  const formulas = (t) => p.evaluate((t) => { const d = document.createElement('div'); APP.MATH.nodes(t).forEach(n => d.appendChild(typeof n === 'string' ? document.createTextNode(n) : n)); return { mx: [...d.querySelectorAll('[data-src]')].map(e => e.getAttribute('data-src')), txt: d.textContent }; }, t);
  await runBank('RO9.small', {
    0: async () => { const r = await formulas('در سال ۱۳۵۲ مقدار y=۲ (۳۵۲) بود'); return { ok: !!res['D·14 «y=۲ (۳۵۲)» run boundary'] && !r.mx.some(m => /۳۵۲/.test(m)), got: { r, note: 'alone, a single relation «y=۲» stays text (R18 «n = ۳۰» rule); with other formulas it is «y=۲» + text «(۳۵۲)»' } }; },
    1: () => ref('A·A15 add-point form scoped to its plot'),
    2: NC('the ⏱ test-clock badge is created and placed by a42 (practice+sched fixer)'),
    3: () => ref('A·A17 «ردش» stays with the guess question'),
    4: NC('adding a point from chat («نقطه‌ی (۲، ۵) رو اضافه کن») has no chat action — the ➕ form is the path; ticks in Persian digits already tested in r19'),
    5: async () => { const r = await formulas('y = 2x + 1 (خط اول)'); return { ok: r.mx.length === 1 && /2x/.test(r.mx[0]) && !/خط/.test(r.mx[0]) && /\(خط اول\)/.test(r.txt), got: r }; },
    6: () => ref('A·A15 add-point form scoped to its plot'),
    7: NC('badge in dark theme: a42 (practice+sched fixer)'),
    8: async () => { const r = await formulas('y=2(x+1)'); return { ok: J(r.mx) === J(['y=2(x+1)']), got: r }; },
    9: async () => { const r = await formulas('۲(۳+۵)=۱۶'); return { ok: r.mx.length === 1 && /\(۳\+۵\)/.test(r.mx[0]), got: r }; },
    10: async () => { const r = await formulas('f(x) = x² (برای x مثبت)'); return { ok: r.mx.length >= 1 && /f\(x\)/.test(r.mx[0]) && !/برای/.test(r.mx.join('')), got: r }; },
    11: NC('badge off: a42 (practice+sched fixer)'),
    12: async () => { const x = await setup({ chat: 'U: فاصله‌ها: ۳، ۵، ۸، ۱۲ ‖ A: خب.' }); await p.evaluate((sid) => { APP.go('today'); APP.ASSIST.store('cur', sid); APP.ASSIST.toggle(true); APP.ASSIST.paint(); }, x.sid); await W(300);
      const r = await p.evaluate(() => { const ms = [...document.querySelectorAll('.as-msg')], last = ms.filter(m => m.querySelector('.mx-add-tog')).pop(); if (!last) return 'no plot'; last.querySelector('.mx-add-tog').click(); return getComputedStyle(last.querySelector('.mx-addf')).display; }); return { ok: r === 'inline-flex', got: r }; },
    13: NC('«ردش کن» is her own message; only assistant questions become «کدام پرسش کمک کرد؟» options (anaQ applies there only)'),
    14: async () => { const r = await formulas('سال (۱۳۵۲)'); return { ok: r.mx.length === 0, got: r }; },
    15: async () => { const r = await formulas('(a+b)² = a² + 2ab + b²'); return { ok: r.mx.length === 1, got: r }; },
  });
  /* ---- MT1.page_compensation (سهمِ live: ۷، ۸، ۱۷، ۱۸) ---- */
  const MTC = 'model-output aliases, re-asks, post-checks, prompt lines are a27 (coach fixer)';
  await runBank('MT1.page_compensation', {
    0: NC(MTC), 1: NC(MTC), 2: NC(MTC), 3: NC(MTC), 4: NC(MTC), 5: NC(MTC), 6: NC(MTC),
    7: () => ref('MT1 live_new opens on her request'),
    8: async () => { const x = await setup({ chat: 'U: سلام ‖ A: سلام.' }); await p.evaluate((sid) => { const se = APP.S.get(sid); se.lprob = ''; APP.S.put(se); APP.go('today'); }, x.sid);
      await actTurn(x.sid, 'یه مسئله شبیه این برام بساز، همین الان روش کار کنیم', [{ do: 'chat_invent', title: 'مسئلهٔ شبیه', statement: 'به چند راه می‌شود ۱۲ پله را یکی‌یکی یا دوتادوتا بالا رفت؟' }]);
      const v = await p.evaluate((sid) => { const r = APP.liveAll().filter(y => y.sess === sid).pop(); return { view: APP.state.view, arg: APP.state.arg, pid: r && r.p.id, dorm: r && r.dormant || '' }; }, x.sid);
      return { ok: v.pid && v.view === 'lprob' && v.arg === v.pid && !v.dorm, got: v }; },
    9: NC(MTC), 10: NC(MTC), 11: NC(MTC), 12: NC(MTC), 13: NC(MTC), 14: NC(MTC), 15: NC(MTC), 16: NC(MTC),
    17: async () => { const x = await setup({ chat: 'U: سلام ‖ A: سلام.' }); await p.evaluate((sid) => { const se = APP.S.get(sid); se.lprob = ''; APP.S.put(se); }, x.sid);
      const r = await actTurn(x.sid, 'این مسئله رو خودم ساختم: مجموع زاویه‌های یک پنج‌ضلعی چند است؟', [{ do: 'chat_invent', title: 'پنج‌ضلعی', statement: 'مجموع زاویه‌های یک پنج‌ضلعی چند است؟' }]);
      const n = await p.evaluate((sid) => APP.liveAll().filter(y => y.sess === sid).length, x.sid); return { ok: n === 0 && r.notes.some(t => /پیشنهاد/.test(t)), got: { n, r } }; },
    18: async () => { const x = await setup({ chat: 'U: سلام ‖ A: سلام.' }); await p.evaluate((sid) => { const se = APP.S.get(sid); se.lprob = ''; APP.S.put(se); APP.go('today'); }, x.sid);
      await actTurn(x.sid, 'یه مسئله باز کن برای خرید ماشین ولی فقط ببینم چیه، فعلاً نمی‌خوام کار کنم', [{ do: 'live_new', title: 'خرید ماشین', statement: 'نمی‌دانم ماشین بخرم یا نه؛ پولم کم است' }]);
      const v = await p.evaluate(() => APP.state.view); return { ok: v !== 'lprob', got: v }; },
    19: NC(MTC), 20: NC(MTC), 21: NC(MTC), 22: NC(MTC),
  });

  info.res = res; info.bank = Object.assign(info.bank, bankRes);
  console.log(JSON.stringify(info, null, 1));
  Object.keys(bankRes).forEach(k => { const R = bankRes[k]; console.log(k + ': ' + R.pass + ' pass / ' + R.fail.length + ' fail / ' + R.nc.length + ' not covered of ' + R.n); R.nc.forEach(x => console.log('   not covered ' + x)); });
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  if (errors.length) process.exitCode = 1;
  await b.close();
})();
