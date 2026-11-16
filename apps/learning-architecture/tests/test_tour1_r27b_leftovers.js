// تورِ پولیا (دستهٔ ۱، دورِ ۲۷ب — سهمِ «leftovers» — ۲۰۲۶-۱۱-۱۶) — آنچه هفت fixer ِ دورِ ۲۷ باز گذاشتند (docs/tours/polya-batch1/runners/FIX27B.md):
//   C58 یک راه (اصلاحِ رکوردِ ثبت‌شده: یک تاریخچه، یک پرسش)، C68 (پذیرفتنِ پیشنهاد خودش اصلاح است)، D27-24 (گامِ فرمِ بی‌زمان)، C63 / C67 / بانکِ R27 #71 (حساب)،
//   جای‌های هم‌طولِ norm (WORKLOG 137)، بانکِ R27 #84 (وابستگیِ فقط‌واژه)، B27·D18 (مرحله از رکوردِ خودِ صفحه)، بانکِ R27 #317.
//   هر مثبت جفتِ منفیِ هم‌شکلش را دارد. ساعتِ صفحه یخ زده است (هیچ تاریخِ تقویمیِ ثابتی در انتظارها نیست). SEC=<نامِ بخش‌ها با ویرگول>
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const T0 = Date.parse('2026-10-18T10:00:00+03:30');   // یکشنبه

const HELPERS = () => {
  const S = APP.S;
  APP.S.loaded = true; window.__noNav = true; window.__q = []; window.__calls = [];
  APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
  APP.callAI = async (sys, user, opts) => { __calls.push({ sys, user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
    const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  window.__cs = (o) => Object.assign({ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
  window.__say = async (text, reply, actions) => { __q.push({ reply: reply || 'خب.', status: 'related', memory: 'm', actions: actions || [__cs({})] }); await APP.ASSIST.send(text); __q.length = 0; };
  window.__cur = () => APP.ASSIST.cur ? APP.ASSIST.cur() : APP.S.get(localStorage.getItem('lla.assist.cur'));
  window.__wipe = () => { ['practice', 'ex', 'fcast', 'kexp', 'case', 'card', 'sched', 'pr', 'topic', 'knot', 'kcase', 'eprob', 'eprog', 'achat', 'deadline', 'lprob', 'psyans', 'mlog'].forEach(t => { try { S.all(t).forEach(r => S.del(r.id)); } catch (e) { } }); localStorage.removeItem('lla.assist.cur'); APP.go('home'); APP.ASSIST.newSession(); __q.length = 0; };
  window.__sys = () => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text);
  window.__dl = () => APP.S.all('deadline').filter(d => !d.done).map(d => ({ what: d.what, date: d.date }));
  window.__dlAll = () => APP.S.all('deadline').map(d => ({ what: d.what, date: d.date, done: !!d.done, hist: (d.fixHist || []).length, corr: (d.corr || []).length, by: d.doneBy ? d.doneBy.kind : '' }));
  window.__pl = () => (__cur().plans || []).map(q => ({ id: q.id, text: q.text, when: q.when, hist: (q.whenHist || []).length, corrW: (q.corr || []).filter(c => c.oldWhen && c.oldWhen !== 'next-session').length, pend: q.whenPend ? q.whenPend.date : '' }));
  window.__pend = () => APP.PR.datePends(__cur()).reduce((a, P) => a.concat((P.items || []).map(x => ({ what: x.what, date: x.date, amb: !!x.amb, free: !!x.free }))), []);
  window.__D = (n) => APP.addDays(APP.today(), n);
  window.__um = (k) => (__cur().msgs || []).filter(x => x.role === 'user' && !/^\[/.test(x.text))[k];
  window.__edit = async (m, nt) => { const s = __cur(); __q.push({ reply: 'درست شد.', status: 'related', memory: 'm', actions: [] }); const r = APP.ASSIST.retractEdit(s, m, nt);
    for (let i = 0; i < 60 && APP.ASSIST.busy(); i++) await new Promise(z => setTimeout(z, 100)); await new Promise(z => setTimeout(z, 400)); __q.length = 0; return !!(r && r.ok); };
  /* مسئلهٔ زنده با دفترِ «کارِ پیشین» (همان شکلِ مهارِ بانکِ correction) */
  window.__okev = () => (__cur().coachEv || []).filter(e => e && e.src === 'chatok').map(e => e.ph + ':' + e.how);
  window.__live = (title, st, o) => { const r = APP.liveCreate(title, st, 'find', Object.assign({ by: 'user' }, o || {})); return r.p.id; };
  window.__setL = (pid, fn) => { const pg = APP.S.get('eprog_' + pid); pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {}; ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L); APP.S.put(pg); };
  window.__ledger = (title, first, steps, deps) => { const s = __cur(); const pid = __live(title, first, { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, APP.S.get(s.id)); APP.liveStampSess(APP.S.get(s.id));
    __setL(pid, (so, L) => { L.prior = { sum: steps.length + ' گام', resume: 0, steps: steps.map((q, i) => ({ n: i + 1, quote: q, verdict: 'ok', why: '', dep: deps[i] || [], depWrong: [] })) }; }); return pid; };
  window.__prior = (pid) => { const L = (APP.S.get('eprog_' + pid).solve || {}).live || {}; return ((L.prior || {}).steps || []).map(x => ({ n: x.n, stale: x.stale ? (x.stale.nums || []).map(q => [q.v, q.re]) : null, fixed: x.fixed ? x.fixed.t : '', was: x.fixed ? x.fixed.was : '', kind: x.fixed ? x.fixed.kind || '' : '' })); };
};

(async () => {
  const b = await chromium.launch(); const errors = []; const res = {};
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'Asia/Tehran' });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('dialog', d => { d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.clock.install({ time: new Date(T0) });
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(150); await p.evaluate(HELPERS);
  const E = (fn, arg) => p.evaluate(fn, arg);
  const day = async (n) => { await p.clock.setSystemTime(new Date(T0 + n * 864e5)); };
  const fresh = async (n) => { await day(n || 0); await E(() => __wipe()); };
  const SEC = (s) => !process.env.SEC || process.env.SEC.split(',').includes(s);
  const X = (name, ok, x) => { res[name] = !!ok; if (!ok) errors.push(name + ' :: ' + JSON.stringify(x).slice(0, 1500)); };
  const T = async (name, fn) => { try { await fn(); } catch (e) { errors.push(name + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); res[name] = false; } };

  /* ===== C58 — یک راه: اصلاحِ روزِ رکوردِ ثبت‌شده (✏️ یا «X نه Y» در گفت‌وگو) از یک تابع می‌گذرد — یک تاریخچه، یک پرسش، هیچ جابه‌جاییِ بی «آره» ===== */
  if (SEC('c58')) {
    /* B27·D10 / بانکِ R27 #107: ✏️ ِ روزِ موعدی که با «آره» ثبت شده بود */
    await T('c58 ✏️ deadline', async () => { await fresh(6); const r = await E(async () => { const o = { fri: __D(6), thu: __D(5) }; await __say('جمعه تحویل میدم'); await __say('آره'); o.dl0 = __dl(); const n0 = __sys().length;
        o.ok = await __edit(__um(0), 'پنجشنبه تحویل میدم'); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); o.all = __dlAll(); return o; });
      const rec = r.all.filter(x => x.date === r.fri);
      X('c58 ✏️ deadline: one history entry, one ask, nothing booked without her yes', r.dl0.length === 1 && r.ok && r.pend.length === 1 && r.pend[0].date === r.thu && r.dl.length === 0 && rec.length === 1 && rec[0].done && rec[0].hist + rec[0].corr === 1 && r.l.filter(x => /^📅/.test(x)).length === 1, r); });
    /* همانندِ منفی (C49): «آره» ِ واقعی به پرسشِ تازه همان روز را ثبت می‌کند */
    await T('c58 yes after', async () => { await fresh(6); const r = await E(async () => { const o = { thu: __D(5) }; await __say('جمعه تحویل میدم'); await __say('آره');
        await __edit(__um(0), 'پنجشنبه تحویل میدم'); await __say('آره'); o.dl = __dl(); o.pend = __pend(); return o; });
      X('c58 negative: a real yes to the new ask books the new day once', r.dl.length === 1 && r.dl[0].date === r.thu && r.pend.length === 0, r); });
    /* ✏️ ِ روزِ برنامه‌ای که با «آره» ثبت شد (A27-10 شکل) */
    await T('c58 ✏️ plan', async () => { await fresh(1); const r = await E(async () => { const o = { thu: __D(3), sat: __D(5) };
        await __say('پنجشنبه با مشاور جلسه دارم', 'خب.', [__cs({ said: ['plan'], plan: { text: 'پنجشنبه با مشاور جلسه دارم', when: __D(3) } })]); await __say('آره'); o.p0 = __pl(); o.dl0 = __dl(); const n0 = __sys().length;
        o.ok = await __edit(__um(0), 'شنبه با مشاور جلسه دارم'); o.l = __sys().slice(n0); o.pl = __pl(); o.pend = __pend(); o.dl = __dl(); o.all = __dlAll(); return o; });
      X('c58 ✏️ plan: one history entry, one ask for the new day, the old booking closed', r.ok && r.p0[0] && r.p0[0].when === r.thu && r.pl[0].hist === 1 && r.pl[0].corrW === 0 && r.pl[0].when !== r.sat && r.pend.filter(x => x.date === r.sat).length === 1 && !r.dl.some(x => x.date === r.thu || x.date === r.sat) && r.l.filter(x => /^📅/.test(x)).length === 1, r); });
    /* همان اصلاح در گفت‌وگو (گزارشِ retract ِ مدل؛ حرفِ خودش روزِ تازه را می‌گوید): همان یک راه، حالتِ «جابه‌جایی» (بانک‌های R22 #69/#73، R25 A25-21) —
       پیش‌تر a27 (corr) و a38 (fixHist) هر دو همان موعد را جابه‌جا می‌کردند: دو سطرِ تاریخچه برای یک اصلاح */
    await T('c58 chat', async () => { await fresh(6); const r = await E(async () => { const o = { fri: __D(6), thu: __D(5) }; await __say('جمعه تحویل میدم'); await __say('آره'); const n0 = __sys().length;
        await __say('اشتباه گفتم، پنجشنبه تحویل میدم نه جمعه', 'باشد.', [__cs({ retract: { msg: 'جمعه تحویل میدم', key: 'deadline', what: 'plan', fix: 'پنجشنبه', old: 'جمعه' } })]);
        o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); o.all = __dlAll(); return o; });
      const rec = r.all.filter(x => x.date === r.thu);
      X('c58 chat correction: one path — the record moves once with ONE history entry, no second record, no ask', r.dl.length === 1 && r.dl[0].date === r.thu && rec.length === 1 && rec[0].hist + rec[0].corr === 1 && r.pend.length === 0 && !r.all.some(x => x.date === r.fri), r); });
    /* همانندِ منفی: ✏️ ای که روز را عوض نمی‌کند ثبت را دست نمی‌زند */
    await T('c58 same day', async () => { await fresh(6); const r = await E(async () => { const o = { fri: __D(6) }; await __say('جمعه تحویل میدم'); await __say('آره');
        await __edit(__um(0), 'جمعه مدارک رو تحویل میدم'); o.dl = __dl(); o.pend = __pend(); o.all = __dlAll(); return o; });
      X('c58 negative: a ✏️ that keeps the day leaves the booking', r.dl.length === 1 && r.dl[0].date === r.fri && r.pend.length === 0, r); });
  }

  /* ===== C68 — پذیرفتنِ پیشنهاد خودش اصلاح است: گام با تاریخچه تازه می‌شود، وابسته‌ها پیشنهادِ خودشان را دارند، هیچ چیز بی‌صدا عوض نمی‌شود (بانکِ R27 #98 شکل) ===== */
  if (SEC('c68')) {
    const TQ = ['کفِ حمام ۲٫۴ متر در ۱٫۵ متر = ۳٫۶ مترمربع', 'هر کارتن ۱٫۲ مترمربع، پس ۳٫۶ ÷ ۱٫۲ = ۳ کارتن', 'هر کارتن ۴۵۰ هزار: ۳ × ۴۵۰ = ۱۳۵۰ هزار', '۲۰ درصد اضافه برای برش: ۳٫۶ × ۱٫۲ = ۴٫۳۲ مترمربع'];
    const tile = (accept) => E(async (a) => { const TQ = a.TQ; await __say(TQ.join('. ') + '.', 'خب.'); const pid = __ledger('مسئلهٔ کاشی', TQ.join('. ') + '.', TQ, [[], [1], [2], [1]]);
      await __say('طولِ کف ۲٫۸ ـه نه ۲٫۴', 'فرستادم.', [__cs({ retract: { msg: 'کفِ حمام ۲٫۴ متر در ۱٫۵ متر', key: 'datum:طولِ کف', what: 'fact', fix: '۲٫۸', old: '۲٫۴' } })]);
      const o = { p0: __prior(pid) }; const n0 = __sys().length; await __say(a.accept, 'باشه.'); o.p = __prior(pid); o.l = __sys().slice(n0); return o; }, { TQ, accept });
    await T('c68 accept', async () => { await fresh(0); const r = await tile('آره، همون ۴٫۲ درسته');
      const s1 = r.p[0], st = (n) => (r.p[n - 1].stale || []);
      X('c68: accepting «۴٫۲» corrects step 1 with history; dependants keep their exact proposals; one line says what changed',
        r.p0[0].stale && !s1.stale && /۴٫۲/.test(s1.fixed) && /۲٫۸/.test(s1.fixed) && /۳٫۶/.test(s1.was) && s1.kind === 'accept' && st(2).some(q => q[0] === 3 && Math.abs(q[1] - 3.5) < 1e-9) && st(4).some(q => Math.abs(q[0] - 4.32) < 1e-9 && Math.abs(q[1] - 5.04) < 1e-9) && r.l.some(x => /پیشنهادِ صفحه را پذیرفتی/.test(x) && /گامِ ۲/.test(x)), r); });
    /* همانندهای منفی: «آره» ِ بی عدد، رد، و عددی که پیشنهادِ هیچ گامی نیست — هیچ گامی عوض نمی‌شود */
    for (const [nm, txt] of [['bare yes', 'آره'], ['negated', 'نه، ۴٫۲ نیست'], ['other number', 'آره، ۵ تا کارتن می‌خرم']]) {
      await T('c68 neg ' + nm, async () => { await fresh(0); const r = await tile(txt);
        X('c68 negative (' + nm + '): no step changes and no acceptance line', r.p.every(x => !x.fixed) && !!r.p[0].stale && !r.l.some(x => /پیشنهادِ صفحه را پذیرفتی/.test(x)), r); });
    }
  }

  /* ===== B27·D18 (tB1z p16) — پرسشِ دربارهٔ صفحه «گذر از مرحله» نیست؛ مرحله از رکوردِ سنجیدهٔ همین نوبت، نه از الگوی «حل شد» ِ درونِ گیومه ===== */
  if (SEC('d18')) {
    await T('d18 meta', async () => { await fresh(0); const r = await E(async () => {
        await __say('یه جعبه‌قرصِ هوشمند برای مادرم می‌خوام بسازم که یادش بندازه قرص‌هاشو بخوره و اگه نخورد به من خبر بده.', 'خب.', [__cs({ ph: 'u', said: [] })]);
        const n0 = __okev().length;
        await __say('یه چیز دیگه: «حل شد» روی نقشه‌ی مسیر، توی پرونده و توی صفحه‌ی خودِ مسئله یه معنا داره؟ الان کدوم‌شون حل‌شده نشونش میده؟', 'نقشه و پرونده از همان رکورد می‌خوانند.', [__cs({ ph: 'r', said: [], nat: 'practical' })]);
        return { ev: __okev().slice(n0), ph: (__cur().coach || {}).ph }; });
      X('d18: a question about the page is not credited as «گذر از مرحله» and does not move the stage', !r.ev.some(x => /pass/.test(x)) && r.ph !== 'b', r); });
    /* همانندِ منفی: بازگوییِ واقعیِ خودش (مجهول، داده، شرط — گزارشِ سنجیدهٔ مدل) همچنان گذر است */
    await T('d18 real pass', async () => { await fresh(0); const r = await E(async () => {
        await __say('یه جعبه‌قرصِ هوشمند برای مادرم می‌خوام بسازم که یادش بندازه قرص‌هاشو بخوره.', 'خب.', [__cs({ ph: 'u', said: [] })]);
        const n0 = __okev().length;
        await __say('مجهولم اینه که جعبه کِی باید زنگ بزنه؛ داده‌هام ساعتِ قرص‌ها و وزنِ جعبه‌ست؛ شرطش اینه که اگه تا نیم ساعت برنداشت به من پیام بده.', 'خب، حالا طرح.', [__cs({ ph: 'p', said: ['u', 'd', 'c'] })]);
        return { ev: __okev().slice(n0) }; });
      X('d18 negative: her own restatement (validated u/d/c) still passes the stage', r.ev.some(x => /^u:(?:pass|own)$/.test(x)), r); });
  }

  /* ===== حساب: بانکِ R27 #71 (عددِ مرکب در موتورِ کهنگی)، C63 (کدام خوانش؟)، C67 (√ در شکلِ او)، جای‌های هم‌طول (WORKLOG 137) ===== */
  if (SEC('arith')) {
    const r = await E(() => { const S = APP.STORY, L = (t) => S.arithLines(S.arithChk(t)), K = (t) => { const a = S.arithChk(t).map(c => ({ ok: c.ok, ask: !!c.ask, kind: c.kind, valT: c.valT })); return a.length ? a : [{ none: true }]; }, slices = (t) => S.arithChk(t).map(c => t.slice(c.pos, c.pe)).concat((S.arithChk(t).unread || []).map(u => t.slice(u.pos, u.pe)));
      return {
        m71: APP.liveRuns25('۸ نفر بودیم، ۲ میلیون و ۸۰۰ هزار ÷ ۸ = ۳۵۰ هزار هر نفر'), m71n: APP.liveRuns25('۲ میلیون و ۸۰۰ ÷ ۸ = ۳۰۰ هزار'), m71s: APP.liveRuns25('۲٫۵ ÷ ۵ = ۰٫۵ میلیون'),
        c63a: K('۲ میلیون و ۸۰۰ ÷ ۸ = ۳۵۰ هزار'), c63b: K('۲ میلیون و ۸۰۰ ÷ ۸ = ۲۵۰۱۰۰'), c63c: K('۲ میلیون و ۸۰۰ ÷ ۸ = ۳۵۰'), c63d: K('۲ میلیون و ۸۰۰ ÷ ۸ = ۳۰۰ هزار'), c63e: K('سودم (۹۰۰ − ۳۸۰) × ۳۲ = ۱۷ میلیون و ۶۴۰ میشه'),
        c67a: K('قطر = √(۱۲² + ۸²) = ۱۵'), c67b: K('قطر = √(۱۲² + ۸²) = ۱۴٫۴۲'), c67c: K('قطر = √(۱۵² + ۸²) = ۱۷'), c67d: K('قطر = √(۱۲² + ۸²) = ۱۴'), c67e: L('۲√۳ = ۳٫۴۶'), c67f: K('√۱۴۴ = ۱۳'),
        pos1: slices('حساب کردم: ۲۰ درصدِ ۱۵۰ میشه ۳۰ و بعد ۱۵۰ منهای ۳۰ میشه ۱۲۰'), pos2: slices('قیمت ۱٬۲۰۰ تومن، ۳ ضرب در ۱٬۲۰۰ = ۳۶۰۰'), norm: APP.STORY.arithNormM ? APP.STORY.arithNormM('۳ ضرب در ۴ میشه ۱۲').t : '(no normM)' };
    });
    X('#71: «۲ میلیون و ۸۰۰ هزار ÷ ۸ = ۳۵۰ هزار» is one written expression for the stale engine', r.m71.length === 1 && r.m71[0].res === '۳۵۰' && Math.abs(r.m71[0].val - 350) < 1e-9, r.m71);
    X('#71 negative: a compound whose result fits no reading gives no result (no proposal from a guessed scale); an expression without magnitude is unchanged', r.m71n.every(x => x.res == null) && !r.m71n.some(x => /^۸۰۰/.test(x.txt)) && r.m71s.length === 1 && r.m71s[0].res === '۰٫۵', { n: r.m71n, s: r.m71s });
    X('C63: the one reading that fits is used (thousand / units)', r.c63a.length === 1 && r.c63a[0].ok && !r.c63a[0].ask && r.c63b[0].ok && !r.c63b[0].ask, { a: r.c63a, b: r.c63b });
    X('C63: when the verdict depends on the reading (fits only up to scale) the page asks which — neither ✓ nor ✗', r.c63c[0].ok && r.c63c[0].ask && r.c63c[0].kind === 'm2', r.c63c);
    X('C63 negative: wrong in every reading stays ✗ (R26 s09 p15), with both values shown', !r.c63d[0].ok && /۲۵۰٫۱ هزار/.test(r.c63d[0].valT) && /۳۵۰ هزار/.test(r.c63d[0].valT) && !r.c63e[0].ok && !r.c63e[0].ask, { d: r.c63d, e: r.c63e });
    X('C67: an irrational recomputation is shown exactly and approximately in her digits («√۲۰۸ ≈ ۱۴٫۴۲»)', !r.c67a[0].ok && /^√۲۰۸ ≈ ۱۴٫۴۲$/.test(r.c67a[0].valT) && r.c67b[0].ok && !r.c67b[0].ask && r.c67c[0].ok && r.c67d[0].ask, { a: r.c67a, b: r.c67b, c: r.c67c, d: r.c67d });
    X('C67 negative: «۲√۳» (implicit product) is «نسنجیده», never ✗ of √۳; a wrong perfect square is ✗ with its exact value', /نسنجیده/.test(r.c67e.join(' ')) && !/^✗/.test(r.c67e.join(' ')) && !r.c67f[0].ok && r.c67f[0].valT === '۱۲', { e: r.c67e, f: r.c67f });
    X('WORKLOG 137: pos/pe point into HER text after the length-changing rewrites («درصدِ»، «میشه»، «منهای»، «ضرب در»، «۱٬۲۰۰»)', r.pos1[0] === '۲۰ درصدِ ۱۵۰ میشه ۳۰' && r.pos1[1] === '۱۵۰ منهای ۳۰ میشه ۱۲۰' && r.pos2[0] === '۳ ضرب در ۱٬۲۰۰ = ۳۶۰۰', { p1: r.pos1, p2: r.pos2 });
    X('WORKLOG 137 negative: the normal form itself is unchanged', r.norm === '3  *  4  ＝  12', r.norm);
  }

  /* ===== بانکِ R27 #317 — گزارشِ خبریِ بی جزءِ مسئله صورتِ گفت‌وگو نمی‌شود؛ همانندِ منفی: «ماشینم صبح روشن نشد» می‌شود ===== */
  if (SEC('narr')) {
    const stmt = (t) => E(async (t) => { __wipe(); await __say(t, 'خوب.'); return { stmt: (__cur().coach || {}).stmt || '', bubble: (__cur().msgs || []).filter(m => m.role === 'user').map(m => m.text)[0] }; }, t);
    await T('narr', async () => { await fresh(0); const a = await stmt('خیابونِ ولیعصر خیلی ترافیک بود'), b = await stmt('ماشینم صبح روشن نشد'), c = await stmt('یه مثلث با ضلع‌های ۳ و ۴ و ۵ داریم'), d = await stmt('قیمتِ بلیت چند برابر شده، چطور سفر رو ارزون‌تر کنم؟');
      X('#317: a narrative remark with no unknown, goal or tie to her is not the talk\'s matter; her bubble byte-exact', !a.stmt && a.bubble === 'خیابونِ ولیعصر خیلی ترافیک بود', a);
      X('#317 negatives: her own trouble, a data statement and a question stay the matter', !!b.stmt && !!c.stmt && !!d.stmt, { b, c, d }); });
  }

  /* ===== D27-24 — گامِ فرمی که زمانِ ثبت ندارد پرسشِ بی‌عدد نمی‌گیرد؛ همانندِ منفی: همان گام با زمانِ پس از داده پرسیده می‌شود، و رابطهٔ نوشته پیشنهادِ دقیقش را دارد ===== */
  if (SEC('d24')) {
    const r = await E(() => { const T1 = '2026-10-18T06:00:00.000Z', T2 = '2026-10-18T07:00:00.000Z', D = { o: '۴', n: '۵' }, st = 'هر جعبه ۴ تا مداد داره، ۶ جعبه داریم و ۲۰ تا مدادِ اضافه';
      const run = (RC) => APP.liveStaleCore(RC, D, null, {}).map(x => ({ k: x.k, v: x.v, re: x.re, ask: x.ask }));
      return { noTime: run([{ k: 'stmt', lab: 's', t: st, zone: 'given', at: T1 }, { k: 'step:st1', lab: 'g', t: 'پس ۲۴ تا مداد', zone: 'work' }]),
        withTime: run([{ k: 'stmt', lab: 's', t: st, zone: 'given', at: T1 }, { k: 'step:st1', lab: 'g', t: 'پس ۲۴ تا مداد', zone: 'work', at: T2 }]),
        written: run([{ k: 'stmt', lab: 's', t: 'هر جعبه ۴ تا مداد داره و ۶ جعبه داریم', zone: 'given', at: T1 }, { k: 'step:st1', lab: 'g', t: '۴ × ۶ = ۲۴ مداد', zone: 'work' }]) }; });
    X('D27-24: a form step with no recorded time is never asked about (no number from a guessed relation)', !r.noTime.some(x => x.k === 'step:st1'), r);
    X('D27-24 negatives: the same step written after the datum is asked; a written expression keeps its exact proposal', r.withTime.some(x => x.k === 'step:st1' && x.ask) && r.written.some(x => x.k === 'step:st1' && x.re === 30), r);
  }

  /* ===== C27-23 (pwC1 p30 «باغ ۲٫۵ هکتاره»): «۹٫۴ ⇒ ۱۰ پنل» گردِ حاصلِ نوشتهٔ خودش است — ردهٔ (د) «۱۰ = ۲ × ۵» جای آن را نمی‌گیرد ===== */
  if (SEC('tier')) {
    const r = await E(() => { const D = { o: '۲ هکتار', n: '۲٫۵ هکتار' }, T1 = '2026-10-18T06:00:00.000Z';
      const run = (RC) => APP.liveStaleCore(RC, D, null, {}).map(x => ({ k: x.k, v: x.v, re: x.re, ask: x.ask }));
      const st = 'باغ ۲ هکتاره و نیاز روزانه ۵ میلی‌متره. پس ۲۰۰۰۰ متر مربع × ۰٫۰۰۵ متر = ۱۰۰ متر مکعب در روز.';
      return { round: run([{ k: 'stmt', lab: 's', t: st, zone: 'given', at: T1 }, { k: 'prior:3', lab: 'g', t: 'هر پنل ۳۵۰ وات × ۶ ساعت = ۲٫۱ کیلووات‌ساعت. پس ۱۹٫۸ ÷ ۲٫۱ ≈ ۹٫۴ ⇒ ۱۰ پنل', zone: 'work' }]),
        bare: run([{ k: 'stmt', lab: 's', t: st, zone: 'given', at: T1 }, { k: 'prior:3', lab: 'g', t: 'برای کلِ باغ ۱۰ ردیف لوله لازمه', zone: 'work' }]) }; });
    X('C27-23: «… ≈ ۹٫۴ ⇒ ۱۰ پنل» keeps its written derivation — no «۱۰ ⇒ ۱۲٫۵» from «۱۰ = ۲ × ۵»', !r.round.some(x => x.v === 10), r.round);
    X('C27-23 negative: the stmt\'s own result «۱۰۰ ⇒ ۱۲۵» is still proposed exactly', r.round.some(x => x.k === 'stmt' && x.v === 100 && x.re === 125), r.round);
  }

  console.log(JSON.stringify(res));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
