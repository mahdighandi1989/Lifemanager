// تورِ پولیا (دستهٔ ۱، دورِ ۲۹ — سهمِ «dates») — بانکِ مستقلِ VARIANTS_R29 (tests/variants/VARIANTS_R29.json)، خانوادهٔ R4.date_ask_engine: هر ۳۸ قلم (#138–#175 ِ فایل).
//  هر قلم همان متن و همان انتظارِ بانک است (ویرایش نشده؛ C144–C147 و C165–C167 ِ DECISIONS_R29 جایی که بانک را روشن می‌کنند). C134: هر قلم روی **هفت روزِ هفته**
//  اجرا می‌شود (ساعتِ صفحه یخ‌زده: دوشنبه ۲۵ آبان ۱۴۰۵ + k، k = ۰…۶) و هیچ تاریخی در انتظارها نوشته نشده — D0 روزِ ساعتِ صفحه است و هر روز از تقویمِ خودِ صفحه
//  ساخته می‌شود. قلم‌هایی که بانک روزِ هفته‌شان را بسته است (#144 «دوشنبه»، #153 «سه‌شنبه»، #173 «چهارشنبه») یک بار در همان روز و شش بار در شکلِ هم‌ارزِ
//  روزهای دیگر (نامِ روزها نسبت به D0) اجرا می‌شوند. ONLY=<شماره‌ها> WD=<k‌ها>
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const ALL = JSON.parse(fs.readFileSync(path.join(__dirname, 'variants', 'VARIANTS_R29.json'), 'utf8'));
const BASE = ALL.findIndex(e => /^R4/.test(e.rc));   // #138 در فایل
const T0 = Date.parse('2026-11-16T10:00:00+03:30');   // دوشنبه

const HELPERS = () => {
  const S = APP.S;
  APP.S.loaded = true; window.__noNav = true; window.__q = [];
  APP.callAI = async (sys, user, opts) => { let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  window.__cs = (o) => Object.assign({ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
  window.__say = async (text, reply, actions) => { __q.push({ reply: reply || 'خب.', status: 'related', memory: 'm', actions: actions || [__cs({})] }); await APP.ASSIST.send(text); __q.length = 0; };
  window.__plan = (text) => [__cs({ said: ['plan'], plan: { text, when: 'next-session' } })];
  window.__cur = () => APP.ASSIST.cur ? APP.ASSIST.cur() : APP.S.get(localStorage.getItem('lla.assist.cur'));
  window.__sys = () => ((__cur() || {}).msgs || []).filter(m => m.role === 'sys').map(m => m.text);
  window.__dlAll = () => APP.S.all('deadline').map(d => ({ what: d.what, date: d.date, done: !!d.done, by: (d.doneBy || {}).kind || '', day: (d.doneBy || {}).day || '' }));
  window.__pl = () => ((__cur() || {}).plans || []).map(q => ({ text: q.text, when: q.when, state: q.state || 'open', day: (q.doneBy || {}).day || '' }));
  window.__pend = () => APP.PR.datePends(__cur()).reduce((a, P) => a.concat((P.items || []).map(x => ({ what: x.what, date: x.date, amb: !!x.amb, free: !!x.free, past: x.past || '', st: P.state }))), []);
  window.__rows = () => APP.dueList().map(d => (d.txt || '') + ' ‖ ' + (d.sub || ''));
  window.__D = (n) => APP.addDays(APP.today(), n);
  window.__um = (k) => (__cur().msgs || []).filter(x => x.role === 'user' && !/^\[/.test(x.text))[k];
  window.__dm = (d) => APP.fdate(d).split(' ').slice(0, 2).join(' ');   // «⟨…⟩, written as day + month name»
  window.__wn = (d) => { const p = d.split('-'); return ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'][new Date(+p[0], +p[1] - 1, +p[2]).getDay()]; };
  window.__dow = (d) => { const p = d.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).getDay(); };
  window.__fwd = (dow) => { for (let k = 1; k <= 7; k++) { const d = __D(k); if (__dow(d) === dow) return d; } return ''; };
  window.__m15 = () => { for (let k = 1; k < 70; k++) { const d = __D(k); if (/^۱۵ /.test(APP.fdate(d)) && APP.fdate(d).split(' ')[1] !== APP.fdate(APP.today()).split(' ')[1]) return d; } return ''; };
  window.__firstDay = () => { for (let k = 1; k < 40; k++) { const d = __D(k); if (/^۱ /.test(APP.fdate(d))) return d; } return ''; };
  window.__lastDay = () => { const f = __firstDay(); return APP.addDays(f, -1); };
  window.__edit = async (m, nt) => { const s = __cur(); __q.push({ reply: 'درست شد.', status: 'related', memory: 'm', actions: [] }); const r = APP.ASSIST.retractEdit(s, m, nt);
    for (let i = 0; i < 60 && APP.ASSIST.busy(); i++) await new Promise(z => setTimeout(z, 100)); await new Promise(z => setTimeout(z, 400)); __q.length = 0; return !!(r && r.ok); };
  window.__st = (n0) => ({ l: __sys().slice(n0 || 0), pl: __pl(), dl: __dlAll(), pend: __pend(), rows: __rows() });
  /* «باز» و «بسته»ی یک کار در همهٔ فهرست‌ها (برنامه، موعد) */
  window.__open = (re) => __pl().some(q => re.test(q.text) && q.state === 'open') || __dlAll().some(x => re.test(x.what) && !x.done);
  window.__done = (re) => __pl().some(q => re.test(q.text) && q.state === 'done') || __dlAll().some(x => re.test(x.what) && x.done && x.by !== 'replaced');
  window.__when = (re) => (__pl().filter(q => re.test(q.text) && q.state === 'open')[0] || {}).when || (__dlAll().filter(x => re.test(x.what) && !x.done)[0] || {}).date || '';
};

(async () => {
  let b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const errors = []; const res = {};
  let ctx = null, p = null;
  const open = async (ms) => { if (ctx) await ctx.close().catch(() => { }); if (!b.isConnected()) b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'Asia/Tehran' }); p = await ctx.newPage();
    p.on('pageerror', e => errors.push('pageerror: ' + e.message)); p.on('dialog', d => { d.dismiss(); }); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.clock.install({ time: new Date(ms) }); await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(150); await p.evaluate(HELPERS); };
  const E = (fn, arg) => p.evaluate(fn, arg);
  let K = 0;   // روزِ هفتهٔ این اجرا
  const fresh = async (n) => { await open(T0 + (K + (n || 0)) * 864e5); };
  const day = async (n) => { await p.clock.setSystemTime(new Date(T0 + (K + n) * 864e5)); };
  const WDS = (process.env.WD ? process.env.WD.split(',').map(Number) : [0, 1, 2, 3, 4, 5, 6]);
  const B = (n, ok, x) => { const e = ALL[BASE + n - 1]; if (!e) { errors.push('bank #' + n + ' missing'); return; } const key = n; res[key] = (res[key] === undefined ? true : res[key]) && !!ok;
    if (!ok) errors.push('bank R4 #' + n + ' (file #' + (BASE + n - 1) + ', k=' + K + ') «' + e.text.slice(0, 80) + '» :: ' + JSON.stringify(x).slice(0, 1400)); };
  const on = (n) => !process.env.ONLY || process.env.ONLY.split(',').includes(String(n));
  const run = async (n, fn, ks) => { if (!on(n)) return; for (const k of (ks || WDS)) { K = k; for (let t = 0; t < 2; t++) { try { await fn(k); break; } catch (e) { const m = String(e && e.message || e).split('\n')[0]; if (t === 0 && /crashed|ERR_ABORTED|ERR_FAILED|closed/i.test(m)) { try { await b.close(); } catch (e2) { } b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); ctx = null; continue; } errors.push('bank R4 #' + n + ' k=' + k + ' exception: ' + m); res[n] = false; break; } } } };
  const NOAMB = (l) => !l.some(x => /امروز خودش|همین امروز یا/.test(x));

  /* دو تماسِ ثبت‌شده (📌 با گزارشِ برنامهٔ مدل، و ⏰ ِ حرفِ خودش) — #138–#140، #160 */
  const twoCalls = async (withPlan) => E(async (wp) => {
    if (wp) { await __say('فردا به بانک زنگ می‌زنم', 'خب.', __plan('فردا به بانک زنگ می‌زنم')); await __say('آره'); await __say('پس‌فردا به صاحب‌خونه زنگ می‌زنم', 'خب.', __plan('پس‌فردا به صاحب‌خونه زنگ می‌زنم')); await __say('آره'); }
    else { await __say('فردا به بانک زنگ می‌زنم، پس‌فردا به صاحب‌خونه زنگ می‌زنم'); await __say('آره'); }
    return { bank: __when(/بانک/), land: __when(/صاحب/), d1: __D(1), d2: __D(2) }; }, withPlan);
  for (const wp of [false, true]) {
    await run(1, async () => { await fresh(0); const b0 = await twoCalls(wp); await day(1);
      const r = await E(async () => { const n0 = __sys().length; await __say('زنگ زدم'); return Object.assign(__st(n0), { ob: __open(/بانک/), ol: __open(/صاحب/) }); });
      B(1, b0.bank === b0.d1 && b0.land === b0.d2 && r.l.some(x => /کدام؟/.test(x) && /بانک/.test(x) && /صاحب/.test(x)) && r.ob && r.ol, Object.assign({ wp, b0 }, r)); });
    await run(2, async () => { await fresh(0); const b0 = await twoCalls(wp); await day(1);
      const r = await E(async () => { await __say('زنگ زدم'); const n0 = __sys().length; await __say('به بانک'); return Object.assign(__st(n0), { db: __done(/بانک/), ol: __open(/صاحب/), wl: __when(/صاحب/), d1: __D(1) }); });
      B(2, r.db && r.ol && r.wl === b0.d2 && !r.rows.some(x => /بانک/.test(x) && /انجام شد؟/.test(x)) && r.pl.concat(r.dl.map(x => ({ text: x.what, state: x.done ? 'done' : 'open' }))).some(q => /صاحب/.test(q.text) && q.state === 'open') && r.l.some(x => /انجام شد/.test(x)), Object.assign({ wp, b0 }, r)); });
    await run(3, async () => { await fresh(0); const b0 = await twoCalls(wp); await day(1);
      const r = await E(async () => { const n0 = __sys().length; await __say('به بانک زنگ زدم. صاحب‌خونه بمونه برای فردا'); return Object.assign(__st(n0), { db: __done(/بانک/), ol: __open(/صاحب/), wl: __when(/صاحب/) }); });
      B(3, r.db && r.ol && r.wl === b0.d2 && !r.l.some(x => /^📅/.test(x) && /کدام|درست است/.test(x)), Object.assign({ wp, b0 }, r)); });
  }
  /* #141–#142: یک ردیفِ پرسش برای دو کار (D29-18) */
  const gasAsk = () => E(async () => { const o = { d2: __D(2), d3: __D(3) }; await __say('پس‌فردا به شرکتِ گاز زنگ می‌زنم، ' + __dm(__D(3)) + ' هم به مدرسه زنگ می‌زنم'); o.p0 = __pend(); return o; });
  await run(4, async () => { await fresh(0); const a = await gasAsk();
    const r = await E(async () => { const n0 = __sys().length; await __say('زنگ زدم'); return Object.assign(__st(n0), { og: __done(/گاز/), os: __done(/مدرسه/) }); });
    const kept = r.pend.some(x => /گاز/.test(x.what)) && r.pend.some(x => /مدرسه/.test(x.what));
    B(4, a.p0.length === 2 && r.l.some(x => /کدام؟/.test(x) && /گاز/.test(x) && /مدرسه/.test(x)) && !r.og && !r.os && (kept || r.l.some(x => /بی‌جواب ماند/.test(x) && /مدرسه/.test(x))), Object.assign({ a }, r)); });
  await run(5, async () => { await fresh(0); const a = await gasAsk();
    const r = await E(async (a) => { await __say('زنگ زدم'); const n0 = __sys().length; await __say(__dm(a.d2) + ' و ' + __dm(a.d3) + ' درسته'); return Object.assign(__st(n0), { wg: __when(/گاز/), ws: __when(/مدرسه/) }); }, a);
    B(5, r.wg === a.d2 && r.ws === a.d3 && r.l.some(x => /ثبت شد/.test(x)), Object.assign({ a }, r)); });
  /* #143: دو پرسشِ مانده + «آره، فردا و پس‌فردا» (هم دو پرسشِ جدا، هم یک پرسشِ دوقلمی) */
  for (const sep of [true, false]) await run(6, async () => { await fresh(0);
    const r = await E(async (sep) => { const o = { d1: __D(1), d2: __D(2) }; if (sep) { await __say('فردا به بانک زنگ می‌زنم'); await __say('پس‌فردا هم به صاحب‌خونه زنگ می‌زنم'); } else await __say('فردا به بانک زنگ می‌زنم، پس‌فردا هم به صاحب‌خونه زنگ می‌زنم');
      o.p0 = __pend(); const n0 = __sys().length; await __say('آره، فردا و پس‌فردا'); Object.assign(o, __st(n0)); o.wb = __when(/بانک/); o.wl = __when(/صاحب/); return o; }, sep);
    await day(1); const r2 = await E(async () => { const n0 = __sys().length; await __say('امروز کارِ خاصی ندارم.'); return { l: __sys().slice(n0), wb: __when(/بانک/) }; });
    B(6, r.p0.length === 2 && r.wb === r.d1 && r.wl === r.d2 && r2.wb === r.d1 && !r2.l.some(x => /به‌جای/.test(x)) && !r.l.some(x => /به‌جای/.test(x)), Object.assign({ sep, r2 }, r)); });
  /* #144: ✏️ به سه‌شنبه‌ای که گذشته، سپس «سه‌شنبه‌ی هفته‌ی بعد، ⟨D0+8⟩» — دوشنبهٔ بانک (k=0) و شکلِ هم‌ارز در روزهای دیگر (نامِ روزِ D0+1 و پاسخِ «… هفته‌ی بعد، ⟨D0+8⟩» از روزِ D0+3) */
  for (const wp of [true, false]) await run(7, async (k) => { await fresh(0); await E(async (wp) => { const t = __wn(__D(3)) + ' جلسه با مدیر دارم'; await __say(t, 'خب.', wp ? __plan(t) : undefined); await __say('آره'); }, wp); await day(3);
    const r = await E(async () => { const o = { d8: __D(5) }; const n0 = __sys().length; o.ok = await __edit(__um(0), __wn(__D(-2)) + ' جلسه با مدیر دارم'); o.l1 = __sys().slice(n0); o.p1 = __pend();
      const n1 = __sys().length; await __say(__wn(__D(5)) + '‌ی هفته‌ی بعد، ' + __dm(__D(5))); Object.assign(o, __st(n1)); o.wm = __when(/مدیر/); o.om = __open(/مدیر/); return o; });
    B(7, r.ok && r.l1.some(x => /گذشته — کدام روز؟/.test(x)) && r.wm === r.d8 && !r.l.some(x => /بی‌جواب ماند/.test(x)) && !r.rows.some(x => /مدیر/.test(x) && /هنوز تأیید نشده/.test(x)) && r.om, Object.assign({ wp }, r)); });
  /* #145–#146: بازگفتنِ روزِ پرسیده */
  for (const [n, t] of [[8, 'باشه، پس‌فردا صبح انجامش میدم'], [9, 'یادداشتش کردم. پس‌فردا صبح انجامش میدم']]) await run(n, async () => { await fresh(0);
    const r = await E(async (t) => { const o = { d2: __D(2) }; await __say('پس‌فردا کارتن‌ها رو می‌خرم'); const n0 = __sys().length; await __say(t); Object.assign(o, __st(n0)); o.w = __when(/کارتن/); return o; }, t);
    B(n, r.w === r.d2 && !r.l.some(x => /بی‌جواب ماند/.test(x)) && r.pend.length === 0 && !r.l.some(x => /^📅 از حرفِ خودت/.test(x)) && !r.pl.some(q => q.state === 'done'), r); });
  /* #147: ✏️ ِ روزِ جلسه موعدِ آزمونِ همان پیام را دست نمی‌زند */
  await run(10, async () => { await fresh(0);
    const r = await E(async () => { const o = { d30: __D(30), wa: __wn(__D(3)), wb: __wn(__D(5)) }; await __say(o.wa + ' با مدیرم جلسه دارم و تا ' + __dm(o.d30) + ' باید امتحانِ آیلتس بدم'); await __say('آره'); o.dl0 = __dlAll();
      const n0 = __sys().length; o.ok = await __edit(__um(0), o.wb + ' با مدیرم جلسه دارم و تا ' + __dm(o.d30) + ' باید امتحانِ آیلتس بدم'); Object.assign(o, __st(n0)); o.ex = __when(/آیلتس/); return o; });
    B(10, r.ok && r.dl0.some(x => /آیلتس/.test(x.what) && x.date === r.d30) && r.ex === r.d30 && !r.dl.some(x => /آیلتس/.test(x.what) && x.by === 'replaced') && r.l.some(x => /مدیر/.test(x) && /^📅/.test(x)) && !r.l.some(x => /آیلتس/.test(x) && /^📅/.test(x)) && r.rows.some(x => /آیلتس/.test(x)), r); });
  /* #148: دو برنامه در یک جمله؛ ✏️ فقط داروخانه */
  for (const [t0, t1] of [['فردا بانک، پس‌فردا داروخونه', 'فردا بانک، سه روز دیگه داروخونه'], ['فردا می‌رم بانک، پس‌فردا می‌رم داروخونه', 'فردا می‌رم بانک، سه روز دیگه می‌رم داروخونه']]) await run(11, async () => { await fresh(0);
    const r = await E(async (a) => { const o = { t0: a[0], d1: __D(1), d3: __D(3), fd3: APP.fdate(__D(3)) }; await __say(a[0]); o.p0 = __pend(); await __say('آره'); o.dl0 = __dlAll();
      const n0 = __sys().length; o.ok = await __edit(__um(0), a[1]); Object.assign(o, __st(n0)); o.wb = __when(/بانک/); return o; }, [t0, t1]);
    const ph = r.l.filter(x => /^📅/.test(x) && /داروخونه/.test(x));
    B(11, r.ok && r.wb === r.d1 && !r.dl.some(x => /بانک/.test(x.what) && x.by === 'replaced') && !r.l.some(x => /^📅/.test(x) && /بانک/.test(x)) && ph.length === 1 && ph[0].indexOf(r.fd3) >= 0, r); });
  /* #149–#150 (C146) */
  await run(12, async () => { await fresh(-6); await E(async () => { await __say(__dm(__D(1)) + ' می‌رم بانک فرم رو می‌دم'); await __say('آره'); }); await day(0);
    const r = await E(async () => { const o = { dm3: __D(-3) }; const n0 = __sys().length; await __say(__dm(__D(-3)) + ' رفتم بانک و فرم رو دادم'); Object.assign(o, __st(n0)); return o; });
    const done = r.pl.some(q => /بانک/.test(q.text) && q.state === 'done' && q.day === r.dm3) || r.dl.some(x => /بانک/.test(x.what) && x.done && x.day === r.dm3);
    B(12, done && !r.l.some(x => /کدام روز؟|گذشته/.test(x) && /^📅/.test(x)) && !r.pend.length, r); });
  await run(13, async () => { await fresh(0);
    const r = await E(async () => { const o = { dm2: __D(-2) }; await __say('فردا می‌رم بانک', 'خب.', __plan('فردا می‌رم بانک')); await __say('آره'); const n0 = __sys().length; o.ok = await __edit(__um(0), __dm(__D(-2)) + ' رفتم بانک'); Object.assign(o, __st(n0)); return o; });
    B(13, r.ok && r.pl.some(q => /بانک/.test(q.text) && q.state === 'done' && q.day === r.dm2) && !r.l.some(x => /گذشته — کدام روز؟/.test(x)) && !r.pend.length, r); });
  /* #151 (C29-6) */
  await run(14, async () => { await fresh(0);
    const r = await E(async () => { const o = { d2: __D(2) }; await __say(__dm(__D(3)) + ' می‌رم داروخونه دفترچه‌م رو تمدید کنم', 'خب.', __plan(__dm(__D(3)) + ' می‌رم داروخونه دفترچه‌م رو تمدید کنم')); await __say('آره');
      o.ok = await __edit(__um(0), __dm(__D(-1)) + ' می‌رم داروخونه دفترچه‌م رو تمدید کنم'); o.p0 = __pend(); const n0 = __sys().length; await __say('پسفردا می‌رم بیمه رو تمدید کنم'); Object.assign(o, __st(n0)); return o; });
    B(14, r.ok && r.p0.some(x => x.past) && r.pend.some(x => /داروخونه/.test(x.what) && x.past) && r.pend.some(x => /بیمه/.test(x.what) && x.date === r.d2) && !r.l.some(x => /داروخونه/.test(x) && /ثبت شد/.test(x)) && !r.pl.some(q => /داروخونه/.test(q.text) && q.when === r.d2), r); });
  /* #152 (A29-17) */
  await run(15, async () => { await fresh(0);
    const r = await E(async () => { const o = { ny: __D(300) }; const n0 = __sys().length; await __say('اندازه‌گیریِ بعدی ' + __dm(__D(-20)) + 'ـه'); Object.assign(o, __st(n0)); return o; });
    B(15, r.l.some(x => /این روز \([^)]*\) گذشته — کدام روز؟/.test(x)) && !r.pend.some(x => !x.free && x.date > r.ny) && !r.dl.length, r); });
  /* #153: «بنگاه پنجشنبه، بانک هم پنجشنبه» ‖ «بانک پنجشنبه نه، شنبه» — سه‌شنبهٔ بانک و هم‌ارزها (روزِ D0+2 و D0+4) */
  for (const vb of [false, true]) await run(16, async () => { await fresh(0);
    const r = await E(async (vb) => { const o = { vb, a: __D(2), s: __D(4), wa: __wn(__D(2)), ws: __wn(__D(4)) }; await __say(vb ? ('بنگاه ' + o.wa + ' می‌رم، بانک هم ' + o.wa + ' می‌رم') : ('بنگاه ' + o.wa + '، بانک هم ' + o.wa)); o.p0 = __pend(); const n0 = __sys().length; await __say('بانک ' + o.wa + ' نه، ' + o.ws); Object.assign(o, __st(n0)); return o; }, vb);
    B(16, r.p0.length === 2 && r.pend.some(x => /بنگاه/.test(x.what) && x.date === r.a) && r.pend.some(x => /بانک/.test(x.what) && x.date === r.s) && !r.pend.some(x => /بانک/.test(x.what) && x.date === r.a) && !r.dl.some(x => /بانک/.test(x.what) && x.date === r.a), r); });
  /* #154–#156 (C133) */
  await run(17, async () => { await fresh(0);
    const r = await E(async () => { const o = { m: __m15() }; const n0 = __sys().length; await __say('وسطِ ماهِ دیگه، یعنی حدودِ ' + __dm(o.m) + '، کولر رو سرویس می‌کنم'); Object.assign(o, __st(n0)); o.w = __when(/کولر/); return o; });
    B(17, r.w === r.m && r.l.some(x => /از حرفِ خودت: «[^»]*حدودِ/.test(x)) && !r.l.some(x => /کدام روز؟|درست است؟/.test(x)) && !r.pend.length, r); });
  await run(18, async () => { await fresh(0);
    const r = await E(async () => { const o = { m: __m15() }; await __say('وسطِ ماه بیمه رو تمدید می‌کنم'); o.p0 = __pend(); const n0 = __sys().length; await __say('وسطِ ماه یعنی حدودِ ' + __dm(o.m)); Object.assign(o, __st(n0)); o.w = __when(/بیمه/);
      APP.go('today'); await new Promise(z => setTimeout(z, 300)); o.today = (document.getElementById('main') || {}).innerText || ''; return o; });
    const rowsB = r.rows.filter(x => /بیمه/.test(x));
    B(18, r.p0.length === 1 && r.p0[0].free && r.w === r.m && !r.pend.length && r.l.filter(x => /ثبت شد/.test(x)).length === 1 && !r.l.some(x => /^📅/.test(x)), r);
    B(19, rowsB.length <= 1 && !rowsB.some(x => /کدام روز؟/.test(x)) && !/بیمه[^\n]*کدام روز؟/.test(r.today), { rowsB, today: r.today.slice(0, 800) }); });
  /* #157 (C49 منفی) */
  await run(20, async () => { await fresh(0);
    const r = await E(async () => { await __say('فردا به بانک زنگ می‌زنم'); await __say('پس‌فردا هم به صاحب‌خونه زنگ می‌زنم'); const o = { d2: __D(2) }; const n0 = __sys().length; await __say('آره'); Object.assign(o, __st(n0)); o.wl = __when(/صاحب/); o.wb = __when(/بانک/); return o; });
    B(20, r.wl === r.d2 && !r.wb && r.pend.some(x => /بانک/.test(x.what)), r); });
  /* #158 (A29-12) */
  await run(21, async () => { await fresh(0);
    const r = await E(async () => { const o = { th: __fwd(4) }; if (o.th === APP.today()) o.th = __D(7); await __say(__wn(o.th) + ' برهانِ دوم رو می‌نویسم'); o.p0 = __pend(); const n0 = __sys().length; await __say('امروز خیلی خسته‌ام، دیشب بد خوابیدم'); Object.assign(o, __st(n0)); o.td = APP.today(); return o; });
    B(21, r.p0.length === 1 && !r.l.some(x => /به‌جای/.test(x)) && !r.pend.some(x => x.date === r.td) && !r.dl.some(x => x.date === r.td), r); });
  /* #159 (C152، سهمِ تاریخ) */
  await run(22, async () => { await fresh(0);
    const r = await E(async () => { const n0 = __sys().length; await __say('۶۰ درصد مطمئنم جمعه بارون میاد و کوه کنسل میشه'); return __st(n0); });
    B(22, !r.l.some(x => /^📅 از حرفِ خودت/.test(x) && !/🎯|موعدِ داوری/.test(x)) && !r.pl.length && !r.dl.length, r); });
  /* #160–#162 (C94/C146 منفی‌ها) */
  await run(23, async () => { await fresh(0); await E(async () => { await __say('فردا به بانک زنگ می‌زنم', 'خب.', __plan('فردا به بانک زنگ می‌زنم')); await __say('آره'); }); await day(1);
    const r = await E(async () => { const n0 = __sys().length; await __say('زنگ زدم'); return Object.assign(__st(n0), { db: __done(/بانک/) }); });
    B(23, r.db && !r.l.some(x => /کدام؟/.test(x)), r); });
  for (const [n, t, pl] of [[24, 'هفتهٔ پیش به مامانم زنگ زدم، حالش خوب بود', 'فردا به بانک زنگ می‌زنم'], [25, 'داداشم دیروز رفت بانک', 'فردا می‌رم بانک']]) await run(n, async () => { await fresh(0);
    const r = await E(async (a) => { await __say(a.pl, 'خب.', __plan(a.pl)); await __say('آره'); const n0 = __sys().length; await __say(a.t); return Object.assign(__st(n0), { ob: __open(/بانک/) }); }, { t, pl });
    B(n, r.ob && !r.l.some(x => /^📅|انجام شد/.test(x)), r); });
  /* #163، #165، #166، #171: هیچ پرسش و هیچ ثبت */
  for (const [n, f] of [[26, () => 'دیروز رفتم کتابخونه، کتابِ آمار رو گرفتم'], [28, () => 'اگه شنبه برم بانک، فرم رو هم می‌برم'], [29, () => 'وسطِ ماه کارگر میاد کولر رو ببینه'], [34, 'yyyy']]) await run(n, async () => { await fresh(0);
    const r = await E(async (n) => { let t = n === 26 ? 'دیروز رفتم کتابخونه، کتابِ آمار رو گرفتم' : n === 28 ? 'اگه شنبه برم بانک، فرم رو هم می‌برم' : n === 29 ? 'وسطِ ماه کارگر میاد کولر رو ببینه' : '';
      if (n === 34) { const M = 'فروردین اردیبهشت خرداد تیر مرداد شهریور مهر آبان آذر دی بهمن اسفند'.split(' '); const f = APP.fdate(__D(5)).replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).split(' '); t = (f[2] + '/' + (M.indexOf(f[1]) + 1) + '/' + f[0]).replace(/\d/g, c => '۰۱۲۳۴۵۶۷۸۹'[c]) + ' تحویلِ پروژه‌ی همکارمه'; }
      const n0 = __sys().length; await __say(t); return Object.assign(__st(n0), { t }); }, n);
    B(n, !r.l.some(x => /^📅|ثبت شد|انجام شد/.test(x)) && !r.pend.length && !r.dl.length && !r.pl.some(q => /^\d{4}-/.test(q.when)), r); });
  /* #164: کارِ کسِ دیگر پرسشِ داروخانه را جواب نمی‌دهد */
  await run(27, async () => { await fresh(0);
    const r = await E(async () => { await __say('وسطِ ماه می‌رم داروخونه دفترچه رو تمدید کنم'); const o = { p0: __pend() }; const n0 = __sys().length; await __say('پسفردا مامانم می‌ره داروخونه'); Object.assign(o, __st(n0)); return o; });
    B(27, r.p0.length === 1 && r.p0[0].free && r.pend.some(x => /داروخونه/.test(x.what) && x.free) && !r.l.some(x => /ثبت شد/.test(x)) && !r.dl.length, r); });
  /* #167 */
  await run(30, async () => { await fresh(0);
    const r = await E(async () => { const o = { d2: __D(2) }; await __say('پس‌فردا کارتن‌ها رو می‌خرم'); const n0 = __sys().length; await __say('نه، پس‌فردا نمی‌تونم'); Object.assign(o, __st(n0)); return o; });
    B(30, !r.dl.some(x => x.date === r.d2) && !r.pl.some(q => q.when === r.d2) && r.l.some(x => /کدام روز؟/.test(x)), r); });
  /* #168 */
  await run(31, async () => { await fresh(0);
    const r = await E(async () => { const o = { d30: __D(30), wa: __wn(__D(3)), d3: __D(3) }; await __say(o.wa + ' با مدیرم جلسه دارم و تا ' + __dm(o.d30) + ' باید امتحان بدم'); await __say('آره'); o.dl0 = __dlAll();
      const n0 = __sys().length; o.ok = await __edit(__um(0), o.wa + ' با مدیرِ بخش جلسه دارم و تا ' + __dm(o.d30) + ' باید امتحان بدم'); Object.assign(o, __st(n0)); return o; });
    B(31, r.ok && r.dl0.length === 2 && !r.l.some(x => /^📅/.test(x)) && !r.dl.some(x => x.by === 'replaced') && r.dl.some(x => /امتحان/.test(x.what) && x.date === r.d30 && !x.done) && r.dl.some(x => /مدیر/.test(x.what) && x.date === r.d3 && !x.done), r); });
  /* #169 */
  await run(32, async () => { await fresh(0);
    const r = await E(async () => { const o = { d1: __D(1) }; await __say('فردا دارو می‌خرم'); const n0 = __sys().length; await __say('آره، راستی کتابی که گفتی رو خریدم'); Object.assign(o, __st(n0)); o.w = __when(/دارو/); return o; });
    B(32, r.w === r.d1 && !r.dl.some(x => x.done) && !r.pl.some(q => q.state === 'done'), r); });
  /* #170 (C93، نه C146) */
  await run(33, async () => { await fresh(0);
    const r = await E(async () => { const o = { d1: __D(1) }; await __say('فردا می‌رم بانک', 'خب.', __plan('فردا می‌رم بانک')); await __say('آره'); const n0 = __sys().length; o.ok = await __edit(__um(0), __dm(__D(-2)) + ' می‌رم بانک'); Object.assign(o, __st(n0)); return o; });
    B(33, r.ok && r.l.some(x => /گذشته — کدام روز؟/.test(x)) && r.pl.some(q => /بانک/.test(q.text) && q.state === 'open' && q.when === r.d1) && !r.pl.some(q => q.state === 'done'), r); });
  /* #172 (B29·D22) */
  await run(35, async () => { await fresh(0);
    await E(async () => { await __say('اینو ثبتش کن: فردا ساعت ۱۰ کلاس دارم', 'خب.', __plan('فردا ساعت ۱۰ کلاس دارم')); await __say('آره'); }); await day(2);
    const r = await E(async () => { APP.go('today'); await new Promise(z => setTimeout(z, 300)); return { rows: __rows(), today: (document.getElementById('main') || {}).innerText || '' }; });
    B(35, !r.rows.some(x => /خواسته‌ای که گذاشتی برای بعد/.test(x) && /کلاس/.test(x)) && !/خواسته‌ای که گذاشتی برای بعد[^\n]*کلاس/.test(r.today), r); });
  /* #173: «فردا آره، پس‌فردا نه، شنبه» — چهارشنبهٔ بانک و هم‌ارزها (روزِ D0+3 به‌جای شنبه) */
  await run(36, async () => { await fresh(0);
    const r = await E(async () => { const o = { d1: __D(1), d2: __D(2), s: __D(3) }; await __say('فردا به بانک زنگ می‌زنم، پس‌فردا هم به صاحب‌خونه زنگ می‌زنم'); const n0 = __sys().length; await __say('فردا آره، پس‌فردا نه، ' + __wn(o.s)); Object.assign(o, __st(n0)); o.wb = __when(/بانک/); return o; });
    B(36, r.wb === r.d1 && r.pend.some(x => /صاحب/.test(x.what) && x.date === r.s) && !r.dl.some(x => /صاحب/.test(x.what) && x.date === r.d2) && !r.pend.some(x => /صاحب/.test(x.what) && x.date === r.d2), r); });
  /* #174 (C145/C165) */
  await run(37, async () => { await fresh(0);
    const r = await E(async () => { const o = { f: __firstDay(), e: __lastDay() }; await __say('سرِ برج قسطِ بیمه رو می‌دم و آخرِ ماه هم اجاره رو'); o.p0 = __pend(); const n0 = __sys().length; await __say('آره، هر دو'); Object.assign(o, __st(n0)); o.wq = __when(/بیمه|قسط/); o.wa = __when(/اجاره/); return o; });
    B(37, r.p0.length === 2 && r.wq === r.f && r.wa === r.e && !r.pend.length, r); });
  /* #175 */
  await run(38, async () => { await fresh(0);
    const r = await E(async () => { await __say('فردا بانک می‌رم'); await __say('آره'); const o = { dl0: __dlAll() }; const n0 = __sys().length; await __say('آره، فردا می‌رم'); Object.assign(o, __st(n0)); return o; });
    B(38, r.dl0.length === 1 && r.dl.length === 1 && !r.l.some(x => /^📅|ثبت شد/.test(x)) && !r.pend.length, r); });

  try { await b.close(); } catch (e) { }
  const ks = Object.keys(res); console.log(JSON.stringify({ bank: ks.length, ok: ks.filter(k => res[k]).length, red: ks.filter(k => !res[k]).map(Number).map(n => n + '(#' + (BASE + n - 1) + ')') }));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS — test_tour1_r29_dates_bank');
})();
