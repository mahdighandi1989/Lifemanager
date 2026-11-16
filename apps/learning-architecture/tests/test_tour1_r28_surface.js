// تورِ پولیا (دستهٔ ۱، دورِ ۲۸، سهمِ «surface» — ۲۰۲۶-۱۱-۱۶) — DECISIONS_R28: R7 (loop + classify) — C99، C100، D28-19، A28-32، D28-29/C28-6.
//  c99    D28-10 oD1 c55 «… اگه بعداً بیاد خبرم می‌کنی؟» مقصدِ 🧭 ِ مسئلهٔ گفت‌وگو شد؛ c58 «یه سؤال: … خبرم می‌کنی یا خودم باید بگردم؟» مسئله نیست (C27-6).
//  route  D28-19 tD2 p1–p2 «ماهِ دیگه باید اسباب‌کشی کنم و می‌خوام برنامه‌ش رو درست بچینم …» و برنامه‌های فردا/پس‌فردا ⇒ lla_assistant بی مربی.
//  reg    D28-29 tD2 p23: پاسخِ تمام-«تو» با «۱ فروردین ۱۴۰۶» «دو ضمیر» خوانده شد؛ C28-6 s27/aC4 «شما کجای آنی»، «مسیری که آمدی».
//  tie    A28-32 tA1: «ثبتِ اختراع و جست‌وجوی سابقه» یا «ثبتِ اختراع و جست‌وجوی سابقه» (حوزه‌های خودِ tA1_build3).
//  c100   A28-36 oA1 «(دورِ ۲۷، C53)»؛ A28-39 pwA2 «(اصلاح شد ⇐ «maybe»)»؛ A28-31 aA3 «موعدِ «…» در موعدهای باز نیست».
//  bank   ورودی‌های R7 در بانکِ مستقلِ tests/variants/VARIANTS_R28.json (اگر هست)
// هر مثبت منفیِ هم‌شکلِ خودش را دارد. هیچ تاریخِ تقویمی‌ای ثابت نیست. LLA_FILE = ساختِ دیگر؛ ONLY=c99,route,reg,tie,c100,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R28.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R28.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f));
const BANK = BANKF ? JSON.parse(fs.readFileSync(BANKF, 'utf8')) : [];

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__sheetNo = []; window.__sheets = {}; window.__notes = []; window.__filed = {}; window.__status = [];
    APP.clock.off = 0;
    // میزبانِ آزمون همان رفتارِ میزبانِ واقعی را دارد (app/routes/inspection.py): یادداشتِ مالک برگهٔ answered/approved را «open» می‌کند؛ status فقط open|approved
    window.__mk = (n) => { const id = 'sh' + n, f = __filed[id] || ''; if (!__sheets[id]) __sheets[id] = { id, number: n, status: 'open', title: String(f).split('\n')[0].slice(0, 80), text: f, notes: [{ id: 'n0', by: 'owner', text: f }] }; return __sheets[id]; };
    APP.HOST = { report: async (o) => { const n = __sheetNo.length ? __sheetNo.shift() : 900; __filed['sh' + n] = (o && o.text) || ''; __mk(n); return { id: 'sh' + n, number: n }; },
      sheets: async () => Object.keys(__sheets).map(k => __sheets[k]).map(s => ({ id: s.id, number: s.number, title: s.title, status: s.status, urgent: true })),
      sheet: async (id) => (__sheets[id] ? JSON.parse(JSON.stringify(__sheets[id])) : null),
      note: async (id, t) => { __notes.push({ id, t }); const s = __sheets[id]; if (s) { s.notes.push({ id: 'o' + s.notes.length, by: 'owner', at: APP.nowISO(), text: t }); if (s.status === 'answered' || s.status === 'approved') s.status = 'open'; } return { ok: true }; },
      status: async (id, st) => { if (st !== 'open' && st !== 'approved') throw new Error('422'); __status.push({ id, st }); if (__sheets[id]) __sheets[id].status = st; return { ok: true }; },
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    window.__turn = async (text, reply, actions, extra, more) => {
      const n0 = __calls.length; __q.push(R(Object.assign({ reply: reply || 'باشه.', actions: actions || [] }, more || {}))); (extra || []).forEach(x => __q.push(x));
      await APP.ASSIST.send(text); __q.length = 0;
      const all = __calls.slice(n0), c = all.filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {};
      return { sys: c.sys || '', user: c.user || '', task: c.task || '', n: all.length };
    };
    window.__fresh = (view) => { APP.go(view || 'home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); (window.__added || []).forEach(id => __dropArea(id)); window.__added = []; window.__sheets = {}; window.__filed = {}; window.__notes = []; window.__status = []; APP.clock.off = (APP.clock.off || 0) + 1; };
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
    window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {}; fn(pg.solve, L); APP.S.put(pg); };
    window.__added = [];
    window.__addArea = (sysId, a, first) => { const S0 = (window.SYS_TERR.systems || []).filter(x => x.id === sysId)[0], o = Object.assign({ key_questions_fa: [], tools: [], claims: [] }, a); if (first) S0.groups[0].areas.unshift(o); else S0.groups[0].areas.push(o); __added.push(a.id); };
    window.__dropArea = (id) => { (window.SYS_TERR.systems || []).forEach(m => (m.groups || []).forEach(g => { g.areas = (g.areas || []).filter(a => a.id !== id); })); };
    window.__reply = (n, replies, status) => { const s = __mk(n); replies.forEach((t, i) => s.notes.push(typeof t === 'string' ? { id: 'r' + n + '_' + (s.notes.length + i), by: 'routine', at: APP.nowISO(), text: t } : t)); s.status = status || 'answered'; };
  });
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const turn = (text, reply, actions, extra, more) => p.evaluate(([t, r, a, x, m]) => __turn(t, r, a, x, m), [text, reply || '', actions || [], extra || [], more || null]);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const bind = async (title, stmt) => p.evaluate(([t, stmt]) => { const pid = __live(t, stmt); APP.liveBindSession(pid, __cur()); return pid; }, [title, stmt]);
  const sysMsgs = () => p.evaluate(() => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text));
  const CONSULT = { agree: true, area: 'sys-territory', kind: 'build', dup_of: null, reason: 'در نقشهٔ قلمرو نیست.', fix: {} };
  await p.evaluate((c) => { window.__consult = (g) => Object.assign({}, c, { area: (g && g.area) || c.area, kind: (g && g.kind) || c.kind }); }, CONSULT);
  const gapTurn = (text, g, reply, acts, n, more) => p.evaluate(([t, g, r, a, n, m]) => { __sheetNo.push(n); return __turn(t, r, a, [__consult(g)], Object.assign({ status: 'gap', gap: g }, m || {})); }, [text, g, reply, acts || [], n, more || null]);
  const sysAll = () => p.evaluate(() => APP.PRE.sysAll().map(x => ({ id: x.e.id, n: x.e.number, st: x.e.state, step: x.e.step, late: !!x.e.late, area: x.e.area || '', tool: (x.e.tool || {}).id || '', how: x.e.how || '', ask: x.e.ask ? x.e.ask.id : '', alt: x.e.ask ? (x.e.ask.alt || []) : [], rej: x.e.rejected || [], pid: x.sc.pid || '', moot: (x.e.mootTool || {}).id || '', checks: (x.e.checks || []).map(c => c.mismatch ? (c.byHer ? 'misHer' : 'mis') : c.ask ? 'ask' : c.undo ? 'undo' : c.ok ? 'ok' : c.lag ? 'lag' : c.declined ? 'no' : '?'), why: (x.e.checks || []).map(c => c.reason || '') })));
  const one = async (n) => (await sysAll()).filter(e => e.n === n)[0] || null;
  const todayAll = () => p.evaluate(() => APP.dueList().filter(x => x.sys23 || x.news26).map(x => x.txt + ' | ' + (x.sub || '')));
  const check = () => p.evaluate(() => APP.PRE.sysCheck());
  const notes = (n) => p.evaluate((n) => __notes.filter(x => x.id === 'sh' + n).map(x => x.t), n);
  const sheet = (n) => p.evaluate((n) => { const s = __sheets['sh' + n]; return s ? { status: s.status, last: (s.notes[s.notes.length - 1] || {}).text || '', n: s.notes.length } : null; }, n);
  const adv = (d) => p.evaluate((d) => { APP.clock.off = (APP.clock.off || 0) + d; }, d);
  const dz = (pid) => p.evaluate((pid) => APP.dossier(pid).events.filter(e => /^sys/.test(e.k)).sort((a, b) => String(a.at).localeCompare(String(b.at))).map(e => ({ k: e.k, at: e.at, title: e.title, out: e.out, lines: e.lines })), pid);
  const addArea = (sysId, a, first) => p.evaluate(([s, a, f]) => __addArea(s, a, f), [sysId, a, !!first]);
  const reply = (n, list, st) => p.evaluate(([n, l, st]) => __reply(n, l, st), [n, list, st || null]);
  const setSt = (n, st) => p.evaluate(([n, st]) => { __sheets['sh' + n].status = st; }, [n, st]);
  const card = (pid) => p.evaluate((pid) => { APP.go('lprob', pid); const c = document.querySelector('.lp-syscard'); return c ? { text: c.textContent, btn: [...c.querySelectorAll('[data-fit]')].map(x => x.getAttribute('data-fit')) } : { text: '', btn: [] }; }, pid);
  const click = (pid, fit) => p.evaluate(([pid, fit]) => { APP.go('lprob', pid); const x = document.querySelector('.lp-syscard [data-fit="' + fit + '"]'); if (!x) return false; x.click(); return true; }, [pid, fit]);
  const QI = BANK.map((e, i) => i).filter(i => /^R7\b/.test(String(BANK[i].rc || BANK[i].family || '')));
  const ARR = /🛎 ابزارِ لازم آمد/, ASKED = /❓ برگهٔ/;
  let e, sy, td, u, x;
  const sess = () => p.evaluate(() => { const s = __cur(); return { msgs: (s.msgs || []).map(m => m.role + ': ' + String(m.text || '').slice(0, 300)) }; });
  const now = (u) => (head(u).split(/\n(?=# )/).filter(bl => /^# وضعِ کنونی/.test(bl))[0] || '');

  // ---------------- C99 (F13): a question about the system is never a problem's 🧭 destination and never makes a chat problem ----------------
  await section('c99', async () => {
    const R = info.c99 = {};
    // runners' own sentences: oD1 c55 (D28-10), oD1 c58, tD2 p23; look-alikes are real questions of her problem
    const POS = ['اون برگهٔ کتاب هم که هنوز جواب نگرفته، اگه بعداً بیاد خبرم می‌کنی؟', 'این به همون مسئلهٔ بسته‌شده اضافه میشه یا باید یه مسئلهٔ تازه باز کنم؟', 'و اگه گفتم سرِ برج یا بعد از عید، کدوم روز ثبت شد؟'];
    const NEG = ['دکتر خبرم می‌کنه؟', 'سندِ خونه کی ثبت میشه؟', '۵ رو به ۳ اضافه می‌کنی؟', 'پرانتز رو باز می‌کنی؟', 'همین روش رو میشه برای باتری ماشینم هم زد؟', 'کجاشو اشتباه کردم؟'];
    x = await p.evaluate(([P, N]) => ({ p: P.map(q => !!(APP.ASSIST.sysQ28 && APP.ASSIST.sysQ28(q))), n: N.map(q => !!(APP.ASSIST.sysQ28 && APP.ASSIST.sysQ28(q))) }), [POS, NEG]);
    R.sysq = x.p.every(Boolean) && !x.n.some(Boolean); chk(R.sysq, 'C99: the runners\' system questions are read as such; their look-alikes (another doer, her own problem, arithmetic) are not :: ' + JSON.stringify(x));
    // D28-10: the 🧭 destination of the session whose statement is oD1 c55
    const C55 = 'آها یه چیزی یادم رفت بگم: دیشب مادرم دو تا قرص رو با هم برداشت و سامانه‌م فقط یکی حساب کرد. این به همون مسئلهٔ بسته‌شده اضافه میشه یا باید یه مسئلهٔ تازه باز کنم؟ اون برگهٔ کتاب هم که هنوز جواب نگرفته، اگه بعداً بیاد خبرم می‌کنی؟';
    const NEG55 = 'یه بخاری ۲۰۰۰ واتی دارم که روزی ۳ ساعت روشنه. ماهی چقدر برق می‌خوره؟ اگه حساب کردی خبرم می‌کنی؟';
    const dest = (st) => p.evaluate((st) => { const s = APP.ASSIST.newSession(); s.coach = { stmt: st, pk: 'c:0' }; APP.S.put(s); return APP.STORY.dest({ sess: s.id }); }, st);
    const d1 = await dest(C55), d2 = await dest(NEG55);
    R.dest = !/خبرم|اضافه میشه|مسئلهٔ تازه/.test(d1) && /قرص/.test(d1); chk(R.dest, 'D28-10 oD1 c55: the 🧭 destination is her own content, never «… خبرم می‌کنی؟» or «… مسئلهٔ تازه باز کنم؟» :: ' + d1);
    R.destNeg = /ماهی چقدر برق می‌خوره/.test(d2); chk(R.destNeg, 'C99 negative: a real question of her problem beside a system request stays the destination :: ' + d2);
    // «never makes a chat problem»: a message that is only system questions is not a problem (oD1 c58); one with her problem content is
    x = await p.evaluate(() => ({ a: APP.ASSIST.notProblem('یه سؤال: اون برگهٔ کتاب که گامی از مسئله‌م رو منتظر نذاشته بود، اگه جواب گرفته باشه خبرم می‌کنی یا خودم باید بگردم؟'),
      b: APP.ASSIST.notProblem('یه بخاری ۲۰۰۰ واتی دارم که روزی ۳ ساعت روشنه. ماهی چقدر برق می‌خوره؟ خبرم می‌کنی؟') }));
    R.noProb = x.a === true && x.b === false; chk(R.noProb, 'C99: only-system-question message is no problem (no chat problem); her problem with a request still is :: ' + JSON.stringify(x));
    await wipe(); await fresh(); u = await turn('یه سؤال: اون برگهٔ کتاب که گامی از مسئله‌م رو منتظر نذاشته بود، اگه جواب گرفته باشه خبرم می‌کنی یا خودم باید بگردم؟', 'اگر جواب بیاید در «امروز» می‌بینی.');
    u = await turn('باشه.', 'باشه.'); R.noChat = !/مسئلهٔ گفت‌وگو «/.test(now(u.user)); chk(R.noChat, 'C99 oD1 c58: after a system question the next turn has no «مسئلهٔ گفت‌وگو» :: ' + now(u.user).slice(0, 300));
  });

  // ---------------- D28-19: a life-plan opening is a problem (coach), and so is the next plan turn ----------------
  await section('route', async () => {
    const R = info.route = {};
    await wipe(); await fresh();
    const a = await turn('سلام. ماهِ دیگه باید اسباب‌کشی کنم و می‌خوام برنامه‌ش رو درست بچینم که هیچی جا نمونه: کارتن، کارگر، قطع و وصلِ گاز و تسویه با صاحبخونه.', 'از کدام کار شروع کنیم؟', [cs({ ph: 'u', nat: 'life' })]);
    const b2 = await turn('فردا با شرکتِ باربری تماس می‌گیرم، پس‌فردا هم کارتن‌ها رو می‌خرم.', 'باشه؛ کدام زودتر باید قطعی شود؟', [cs({ ph: 'p' })]);
    R.p1 = a.task === 'lla_coach'; R.p2 = b2.task === 'lla_coach';
    chk(R.p1 && R.p2, 'D28-19 tD2 p1–p2: the life-plan opening and its first plans go to the coach :: ' + JSON.stringify({ p1: a.task, p2: b2.task }));
    await wipe(); await fresh(); const c1 = await turn('برنامهٔ امروزم رو نشون بده', 'باشه.'); await wipe(); await fresh(); const c2 = await turn('می‌خوام برنامهٔ تمرین رو باز کنم', 'باشه.');
    const c3 = await p.evaluate(() => APP.ASSIST.statesProblem('می‌خوام برم خونه'));
    R.neg = c1.task === 'lla_assistant' && c2.task === 'lla_assistant' && c3 === false; chk(R.neg, 'D28-19 negative: page commands about a «برنامه» and a bare wish stay with the assistant :: ' + JSON.stringify({ c1: c1.task, c2: c2.task, c3 }));
  });

  // ---------------- D28-29 / C28-6: one register — no false «two pronouns», no half-converted label ----------------
  await section('reg', async () => {
    const R = info.reg = {};
    const R22 = '«باشه» ِ اول به پرسشِ همان لحظه بود: «فردا تماس با باربری» (۲۶ آبان) و «پس‌فردا کارتن» (۲۷ آبان) — هر دو ثبت شدند. «سرِ برج» را صفحه یکشنبه ۱ آذر خواند ولی چون تأیید نکردی ثبت نشد و در «امروز» پرسش مانده؛ «بعد از عید» برای رنگ‌کاری به‌جای پرسیدنِ روز، ۱ فروردین ۱۴۰۶ ثبت شد. می‌خواهی رنگ‌کاری را روزِ دیگری بگذاری؟';
    x = await p.evaluate((r) => APP.ASSIST.regSigns(r), R22); R.signs = !x.sh && x.to; chk(R.signs, 'D28-29 tD2 r22: «۱ فروردین ۱۴۰۶» is a date, not a «شما» verb :: ' + JSON.stringify(x));
    await wipe(); await fresh();
    await turn('می‌تونی بگی کارتن‌ها رو کی بخرم؟', 'فردا یا پس‌فردا؟'); await turn('تو بگو اول چی کار کنم که هیچی جا نمونه.', 'اول باربری.');
    const g = await turn('وقتی گفتم «باشه»، دقیقاً به کدوم پرسش بله گفتم؟ و اگه گفتم سرِ برج یا بعد از عید، کدوم روز ثبت شد؟', R22);
    const all = await p.evaluate(() => __calls.slice(-3).map(c => String(c.user).split('# نوبتِ تازه').pop().slice(0, 200)));
    R.guard = !all.some(t => /دو ضمیر/.test(t)); chk(R.guard, 'D28-29 tD2 p23: a reply written only in «تو» is not sent back for a rewrite :: ' + JSON.stringify({ n: g.n, all }));
    const g2 = await turn('خب حالا کدوم روز رو بذارم؟', 'لطفاً بفرمایید کدام روز را می‌خواهی؛ ۱ فروردین ثبت شد.');
    const all2 = await p.evaluate(() => __calls.slice(-2).map(c => String(c.user).split('# نوبتِ تازه').pop().slice(0, 300)));
    R.guardNeg = all2.some(t => /دو ضمیر/.test(t)); chk(R.guardNeg, 'D28-29 negative: «بفرمایید … می‌خواهی» (two pronouns) is still sent back :: ' + JSON.stringify(all2));
    // C28-6: the static label under «شما»
    await wipe(); await fresh(); await turn('سلام، لطفاً شما بفرمایید از کجا شروع کنم.', 'بفرمایید.'); await turn('شما بگویید این برنامه چه کار می‌کند.', 'بفرمایید.');
    x = await p.evaluate(async () => { APP.go('whole'); await new Promise(r => setTimeout(r, 400)); return { reg: APP.ASSIST.convRegister(APP.ASSIST.cur(), '', []), t: document.getElementById('main').innerText.slice(0, 600) }; });
    R.label = x.reg === 'shoma' && /جای شما در آن کجاست/.test(x.t) && !/کجای آنی|شما کجای/.test(x.t) && !/مسیری که آمدی(?!د)/.test(x.t);
    chk(R.label, 'C28-6 s27/aC4: under «شما» the guide heading and the trail read in one register (no «شما کجای آنی», no «آمدی») :: ' + JSON.stringify(x));
    await wipe(); await fresh(); await turn('سلام، تو بگو از کجا شروع کنم.', 'باشه.'); await turn('تو بگو این برنامه چه کار می‌کند.', 'باشه.');
    x = await p.evaluate(async () => { APP.go('whole'); await new Promise(r => setTimeout(r, 400)); return document.getElementById('main').innerText.slice(0, 400); });
    R.labelNeg = /جای تو در آن کجاست/.test(x) && /مسیری که آمدی/.test(x); chk(R.labelNeg, 'C28-6 negative: under «تو» the same labels stay «تو» :: ' + x.slice(0, 200));
  });

  // ---------------- A28-32: a tie between two candidates of the same name ----------------
  await section('tie', async () => {
    const R = info.tie = {};
    const G_tA1 = { title: 'جست‌وجوی سابقه: کسی پیش‌تر همین را ساخته یا ثبتِ اختراع کرده؟', area: 'sys-territory', kind: 'build', step: '۶-ب ثبتِ اختراع: کسی قبلاً همین را ساخته یا ثبت کرده؟',
      abstract: 'کسی که ایدهٔ ساختنی دارد باید بداند پیش‌تر کسی همان را ساخته یا ثبتِ اختراع کرده یا نه.', missing: 'حوزه‌ای برای جست‌وجوی سابقه در پایگاه‌های ثبتِ اختراع و بازار و داوریِ نو بودن',
      where: 'قلمروِ سامانه‌ها — حلِ مسئله (s_problem)', how: 'حوزه با پرسش‌های کلیدی', why_not: 'pr_creativity ایده می‌سازد', evidence: 'حوزه‌ای برای ثبتِ اختراع نیست', confidence: 0.85 };
    const D = 'پیش از فروختن یا ثبت کردنِ یک ساخته: آیا کسی همین را ساخته، می‌فروشد یا ثبتِ اختراع کرده است — جست‌وجوی سابقه در پایگاه‌های ثبتِ اختراع و بازار، و داوریِ نو بودن.';
    const KQ = ['کسی همین را می‌فروشد — با چه قیمت و کارایی؟', 'در پایگاه‌های ثبتِ اختراع (مثلِ Google Patents) با کدام واژه‌ها سابقه را می‌جویی؟', 'چه چیزِ طرحِ تو نو است که در سابقه نیست؟'];
    const MK = (id, fa, d) => ({ id, fa, en: 'Patenting and prior-art search', desc_fa: d, key_questions_fa: KQ, claims: [{ fa: d, kind: 'empirical', basis_fa: 'افزودهٔ آزمایشیِ تور', src: ['polya1945'] }] });
    const up = async () => { await wipe(); await fresh(); const pid = await bind('کیتِ آبیاریِ قطره‌ایِ خورشیدی', 'یه کیتِ آبیاریِ قطره‌ای با پمپِ خورشیدی برای باغچهٔ پدر و مادرم می‌خوام بسازم که یک هفته بی برق کار کنه.');
      await gapTurn('برای «۶-ب ثبتِ اختراع: کسی قبلاً همین را ساخته یا ثبت کرده؟» نمی‌دونم کجا بگردم.', G_tA1, 'برای این گام ابزاری نیست — ثبتش می‌کنم.', [cs({ ph: 'c' })], 102); return pid; };
    // tA1 build3: two areas, same name AND same description (only the registry ids differ)
    let pid = await up(); await addArea('s_problem', MK('sp_patent_novelty_check', 'ثبتِ اختراع و جست‌وجوی سابقه', D)); await addArea('s_problem', MK('sp_patent_landscape', 'ثبتِ اختراع و جست‌وجوی سابقه', D));
    await reply(102, ['پاسخ به برگهٔ دستیار #102: ساخته شد؛ قلمروِ حلِ مسئله دوباره به‌روز شد.']); await check();
    e = await one(102); sy = await sysMsgs(); td = await todayAll(); const cd = await card(pid);
    const btn = await p.evaluate((pid) => { APP.go('lprob', pid); return [...document.querySelectorAll('.lp-syscard [data-fit]')].map(b => b.textContent); }, pid);
    const q = sy.filter(t => ASKED.test(t)).pop() || '';
    R.ask = !!e && e.st === 'wait' && !!e.ask && /\(اولی\)/.test(q) && /\(دومی\)/.test(q) && td.some(t => /^❓/.test(t) && /\(اولی\)/.test(t) && /\(دومی\)/.test(t)) && btn.filter(t => /همان است/.test(t)).length === 2 && new Set(btn).size === btn.length;
    chk(R.ask, 'A28-32 tA1: identical names are told apart (order in the question, the Today row and distinct buttons) :: ' + JSON.stringify({ e, q, td, btn }));
    u = await turn('دومی همونه.', 'باشه.'); e = await one(102); sy = await sysMsgs();
    R.pick = !!e && (e.st === 'arrived' || e.st === 'resumed') && e.tool === 'sp_patent_landscape'; chk(R.pick, 'A28-32: «دومی همونه» picks the second of the two same-named tools :: ' + JSON.stringify({ e, sy: sy.slice(-1) }));
    // different descriptions under one name ⇒ her distinct words are shown
    pid = await up(); await addArea('s_problem', MK('sp_x1', 'ثبتِ اختراع و جست‌وجوی سابقه', D)); await addArea('s_problem', MK('sp_x2', 'ثبتِ اختراع و جست‌وجوی سابقه', D + ' با جدولِ مقایسهٔ ادعاها و نقشهٔ رقیبان.'));
    await reply(102, ['پاسخ به برگهٔ دستیار #102: ساخته شد؛ قلمروِ حلِ مسئله دوباره به‌روز شد.']); await check(); sy = await sysMsgs(); const q2 = sy.filter(t => ASKED.test(t)).pop() || '';
    R.distinct = /جدول|مقایسه|نقشه|رقیبان/.test(q2) && /\(دومی\)|— دومی\)/.test(q2); chk(R.distinct, 'A28-32: same name, different descriptions ⇒ the distinct words of each are shown :: ' + q2);
    // negative: two different names stay exactly as named (no ordinal)
    pid = await up(); await addArea('s_problem', MK('sp_y1', 'جست‌وجوی سابقهٔ ثبتِ اختراع', D)); await addArea('s_problem', MK('sp_y2', 'ثبتِ اختراع و جست‌وجوی سابقه در بازار', D));
    await reply(102, ['پاسخ به برگهٔ دستیار #102: ساخته شد؛ قلمروِ حلِ مسئله دوباره به‌روز شد.']); await check(); sy = await sysMsgs(); const q3 = sy.filter(t => ASKED.test(t)).pop() || '';
    R.neg = !/\((?:اولی|دومی)\)/.test(q3); chk(R.neg, 'A28-32 negative: distinct names get no ordinal :: ' + q3);
  });

  // ---------------- C100 (F14): internal labels never in her view ----------------
  await section('c100', async () => {
    const R = info.c100 = {};
    // A28-36 oA1: 🎯 without a due date
    await wipe(); await p.evaluate(() => { APP.S.put({ id: 'fc_t28a', type: 'fcast', q: 'تا جمعه مدیرم پیشنهادِ ترفیع می‌ده', p: 40, due: '' }); APP.S.put({ id: 'fc_t28b', type: 'fcast', q: 'گاز به موقع وصل میشه', p: 60, due: '', live: { pid: 'pb_l_none' } }); });
    x = await p.evaluate(async () => { APP.go('fcast'); await new Promise(r => setTimeout(r, 300)); return document.getElementById('main').innerText; });
    R.fc = /بی موعد — داوری با گزارشِ خودت/.test(x) && !/دورِ\s*[۰-۹0-9]+|C[0-9]{2}/.test(x); chk(R.fc, 'C100 A28-36 oA1: «🎯 دفترِ پیش‌بینی» shows no round/C number :: ' + (x.match(/.{0,60}بی موعد.{0,60}/) || [''])[0]);
    // A28-39 pwA2: the check verdict «maybe» in a change line
    x = await p.evaluate(() => [APP.liveChkVerdFa28 ? APP.liveChkVerdFa28('maybe') : 'NOFN', APP.liveChkVerdFa28 ? APP.liveChkVerdFa28('verified') : 'NOFN']);
    R.verd = !/[a-z]/.test(x.join(' ')) && /شاید/.test(x[0]); chk(R.verd, 'C100 A28-39 pwA2 p7: the check verdict of a change line is Persian («شاید …»), never «maybe» :: ' + JSON.stringify(x));
    // A28-31 aA3 p8: deadline_done for an act that is not an open deadline
    await wipe(); await fresh();
    u = await turn('زنگ زدم.', 'خوب است.', [{ do: 'deadline_done', what: 'پیگیری: تماس با داروخانه دربارهٔ دو دارو' }]); sy = await sysMsgs();
    R.dl = !sy.some(t => /در موعدهای باز نیست|«what»/.test(t)); chk(R.dl, 'C100 A28-31 aA3 p8: a model-only miss («موعدِ … در موعدهای باز نیست») never shows in her bubble :: ' + JSON.stringify(sy));
    x = await p.evaluate(async () => { const r = await APP.ASSIST.run([{ do: 'deadline_done', what: 'نیست' }]); return r; });
    R.dlModel = (x.notes || []).some(t => /در موعدهای باز نیست/.test(t)) && (x.quiet || []).length === 1; chk(R.dlModel, 'C100: the same note still reaches the model (run().notes) :: ' + JSON.stringify(x));
    await wipe(); await fresh(); await p.evaluate(() => APP.S.put({ id: 'dl_t28', type: 'deadline', what: 'تماس با داروخانه', date: APP.addDays(APP.today(), 1), done: false }));
    u = await turn('با داروخانه تماس گرفتم.', 'خوب است.', [{ do: 'deadline_done', what: 'تماس با داروخانه' }]);
    x = await p.evaluate(() => (APP.S.get('dl_t28') || {}).done); R.dlNeg = x === true; chk(R.dlNeg, 'C100 negative: an open deadline is still closed by deadline_done :: ' + x);
  });

  // ---------------- bank R7 (VARIANTS_R28) ----------------
  await section('bank', async () => {
    info.bankN = QI.length;
    for (const i of QI) { const E = BANK[i]; info.bank[i] = null; info.nc[i] = E.text.slice(0, 80); }
  });

  await b.close();
  for (const k of ['c99', 'route', 'reg', 'tie', 'c100']) if (info[k]) console.log(k + ': ' + JSON.stringify(info[k]));
  console.log('bank R7: ' + (QI.length ? Object.values(info.bank).filter(x => x === true).length + '/' + QI.length : 'no R7 entries in the bank yet'));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
