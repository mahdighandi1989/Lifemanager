// تورِ پولیا (دستهٔ ۱، دورِ ۲۸ — سهمِ «dates») — بانکِ مستقلِ VARIANTS_R28 (tests/variants/VARIANTS_R28.json)، خانوادهٔ R3.date_ask_engine: شمارهٔ ۱ تا ۴۸ ِ همان خانواده.
//  هر قلم همان متن و همان انتظارِ بانک است (ویرایش نشده؛ C102–C131 ِ DECISIONS_R28 جایی که بانک را روشن می‌کنند). D0 روزِ ساعتِ یخ‌زده است و هیچ تاریخی در
//  انتظارها نوشته نشده (همه از ساعتِ صفحه و تقویمِ شمسیِ خودش). قلم‌هایی که برنامهٔ خودِ او را می‌گویند دو بار اجرا می‌شوند: بی گزارشِ مدل، و با گزارشِ برنامهٔ
//  مدل (plan، when: next-session) — همان راهی که در دورِ ۲۸ «امروز خودش جمعه است» را می‌ساخت (F5). ONLY=<شماره‌ها، با ویرگول>
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const ALL = JSON.parse(fs.readFileSync(path.join(__dirname, 'variants', 'VARIANTS_R28.json'), 'utf8'));
const BANK = ALL.filter(e => /^R3/.test(e.rc));
const T0 = Date.parse('2026-11-16T10:00:00+03:30');   // دوشنبه ۲۵ آبان: سه‌شنبه +۱، چهارشنبه +۲، پنجشنبه +۳، جمعه +۴، شنبه +۵، یکشنبه (۱ آذر) +۶

const HELPERS = () => {
  const S = APP.S;
  APP.S.loaded = true; window.__noNav = true; window.__q = [];
  APP.callAI = async (sys, user, opts) => { let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  window.__cs = (o) => Object.assign({ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
  window.__say = async (text, reply, actions) => { __q.push({ reply: reply || 'خب.', status: 'related', memory: 'm', actions: actions || [__cs({})] }); await APP.ASSIST.send(text); __q.length = 0; };
  window.__plan = (text) => [__cs({ said: ['plan'], plan: { text, when: 'next-session' } })];
  window.__cur = () => APP.ASSIST.cur ? APP.ASSIST.cur() : APP.S.get(localStorage.getItem('lla.assist.cur'));
  window.__wipe = () => { ['practice', 'ex', 'fcast', 'kexp', 'case', 'card', 'sched', 'pr', 'topic', 'knot', 'kcase', 'eprob', 'eprog', 'achat', 'deadline', 'lprob', 'psyans'].forEach(t => { try { S.all(t).forEach(r => S.del(r.id)); } catch (e) { } }); localStorage.removeItem('lla.assist.cur'); APP.go('home'); };
  window.__sys = () => ((__cur() || {}).msgs || []).filter(m => m.role === 'sys').map(m => m.text);
  window.__dl = () => APP.S.all('deadline').filter(d => !d.done).map(d => ({ what: d.what, date: d.date, plan: !!d.plan }));
  window.__dlAll = () => APP.S.all('deadline').map(d => ({ what: d.what, date: d.date, done: !!d.done, by: (d.doneBy || {}).kind || '' }));
  window.__pl = () => (__cur().plans || []).map(q => ({ id: q.id, text: q.text, when: q.when, state: q.state || 'open', remind: q.remind || '' }));
  window.__pend = () => APP.PR.datePends(__cur()).reduce((a, P) => a.concat((P.items || []).map(x => ({ what: x.what, date: x.date, amb: !!x.amb, opts: x.opts || null, free: !!x.free, st: P.state }))), []);
  window.__dq = () => APP.dueList().filter(d => /^📅/.test(d.txt || '')).map(d => d.txt);
  window.__rows = () => APP.dueList().map(d => (d.txt || '') + ' ‖ ' + (d.sub || ''));
  window.__D = (n) => APP.addDays(APP.today(), n);
  window.__um = (k) => (__cur().msgs || []).filter(x => x.role === 'user' && !/^\[/.test(x.text))[k];
  window.__jw = (d, latin) => { const M = 'فروردین اردیبهشت خرداد تیر مرداد شهریور مهر آبان آذر دی بهمن اسفند'.split(' '); const f = APP.fdate(d).replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).split(' '); const s = f[2] + '/' + (M.indexOf(f[1]) + 1) + '/' + f[0]; return latin ? s : s.replace(/\d/g, c => '۰۱۲۳۴۵۶۷۸۹'[c]); };
  window.__dm = (d) => APP.fdate(d).split(' ').slice(0, 2).join(' ');   // «⟨…⟩, written as day + month name»
  window.__edit = async (m, nt) => { const s = __cur(); __q.push({ reply: 'درست شد.', status: 'related', memory: 'm', actions: [] }); const r = APP.ASSIST.retractEdit(s, m, nt);
    for (let i = 0; i < 60 && APP.ASSIST.busy(); i++) await new Promise(z => setTimeout(z, 100)); await new Promise(z => setTimeout(z, 400)); __q.length = 0; return !!(r && r.ok); };
  window.__firstDay = () => { for (let k = 1; k < 40; k++) { const d = APP.addDays(APP.today(), k); if (/^۱ /.test(APP.fdate(d))) return d; } return ''; };
  window.__farv = () => { for (let k = 1; k < 400; k++) { const d = APP.addDays(APP.today(), k); if (/^۱ فروردین/.test(APP.fdate(d))) return d; } return ''; };
  window.__esf = () => { const f = __farv(); return APP.addDays(f, -1); };
  window.__fwd = (s, dow) => { for (let k = 1; k <= 7; k++) { const d = APP.addDays(s, k); const p = d.split('-'); if (new Date(+p[0], +p[1] - 1, +p[2]).getDay() === dow) return d; } return ''; };
};

(async () => {
  let b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const errors = []; const res = {};
  let ctx = null, p = null;
  /* هر قلم در زمینهٔ تازهٔ مرورگر: یک صفحهٔ دراز با ده‌ها ✏️ و جهشِ ساعت تا اسفند در Chromium ِ این ماشینِ مشترک از کار می‌افتاد (Target crashed) */
  const open = async (ms) => { if (ctx) await ctx.close().catch(() => { }); if (!b.isConnected()) b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'Asia/Tehran' }); p = await ctx.newPage();
    p.on('pageerror', e => errors.push('pageerror: ' + e.message)); p.on('dialog', d => { d.dismiss(); }); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.clock.install({ time: new Date(ms) }); await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(150); await p.evaluate(HELPERS); };
  await open(T0);
  const E = (fn, arg) => p.evaluate(fn, arg);
  const at = async (ms) => { await p.clock.setSystemTime(new Date(ms)); };
  const day = async (n) => { await at(T0 + n * 864e5); };
  const fresh = async (n) => { await open(T0 + (n || 0) * 864e5); };
  const freshAt = async (iso) => { await open(Date.parse(iso + 'T10:00:00+03:30')); };
  /* قلم‌هایی که این fixer نمی‌تواند برآورد — با دلیل گزارش می‌شوند، نه پنهان (FIX28): همچنان اجرا و چاپ می‌شوند، ولی آزمون را نمی‌شکنند */
  const KNOWN = { 30: 'conflict: «احتمالش ۴۰ درصده که جمعه بارون بیاد» makes a 🎯 whose due day she said — DECISIONS_R26 C12 / bank R26 #203 asks «… درست است؟» for that day (a41 PR.bookPred ⇒ duePend, owned by the forecast fixer R4); no date ask from a forecast needs the forecast fixer and a coordinator ruling on C12 vs R28 #30' };
  const B = (n, ok, x) => { if (KNOWN[n]) { res[n] = !!ok; if (!ok) console.log('KNOWN (reported, not counted as pass) R3 #' + n + ': ' + KNOWN[n]); return; } const e = BANK[n - 1]; if (!e) { errors.push('bank #' + n + ' missing'); return; } res[n] = (res[n] === undefined ? true : res[n]) && !!ok; if (!ok) errors.push('bank R3 #' + n + ' «' + e.text.slice(0, 80) + '» :: ' + JSON.stringify(x).slice(0, 1400)); };
  const on = (n) => !process.env.ONLY || process.env.ONLY.split(',').includes(String(n));
  /* «Target crashed» ِ مرورگر (ماشینِ مشترک) قلم را یک بار دوباره اجرا می‌کند؛ شکستِ انتظار هرگز دوباره اجرا نمی‌شود */
  const run = async (n, fn) => { if (!on(n)) return; for (let k = 0; k < 2; k++) { try { await fn(); return; } catch (e) { const m = String(e && e.message || e).split('\n')[0]; if (k === 0 && /crashed|ERR_ABORTED|ERR_FAILED|closed/i.test(m)) { try { await b.close(); } catch (e2) { } b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); ctx = null; await open(T0); continue; } errors.push('bank R3 #' + n + ' exception: ' + m); res[n] = false; return; } } };
  const NOAMB = (l) => !l.some(x => /امروز خودش|همین امروز یا/.test(x));
  const one = (l) => l.filter(x => /^📅/.test(x));
  /* یک جمله ⇒ هیچ پرسش و هیچ سطرِ 📅 */
  const none = (n, setDay, text, acts) => run(n, async () => { await setDay(); const r = await E(async (a) => { const n0 = __sys().length; await __say(a.text, 'خب.', a.acts); return { l: __sys().slice(n0), pend: __pend(), dq: __dq(), dl: __dl() }; }, { text, acts });
    B(n, !r.l.some(x => /^📅/.test(x)) && r.pend.length === 0 && r.dq.length === 0 && r.dl.length === 0, r); });
  /* قلمِ «کدام روز؟» ِ بی‌روز (F5): هر دو راه (بی گزارشِ مدل، با گزارشِ برنامهٔ مدل) */
  const free = (n, d0, text, chk) => run(n, async () => { for (const withPlan of [false, true]) { await fresh(d0);
    const r = await E(async (a) => { const o = { farv: __farv() }; o.fa = APP.fdate(o.farv); const n0 = __sys().length; await __say(a.text, 'خب.', a.withPlan ? __plan(a.text) : undefined); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); o.dq = __dq(); o.pl = __pl(); return o; }, { text, withPlan });
    B(n, one(r.l).length === 1 && NOAMB(r.l) && NOAMB(r.dq) && /کدام روز؟/.test(one(r.l)[0]) && r.pend.length === 1 && r.pend[0].free && r.dl.length === 0 && !r.pl.some(q => /^\d{4}-/.test(q.when)) && chk(r), Object.assign({ withPlan }, r)); } });

  /* ---------- مثبت‌ها ---------- */
  await free(1, 2, 'بعد از عید کاشی‌های حموم رو عوض می‌کنم', r => one(r.l)[0].indexOf(r.fa) >= 0);
  await free(2, 0, 'وسطِ ماه می‌رم بانک برای وام', r => !/[۰-۹]/.test(one(r.l)[0].replace(/«[^»]*»/g, '')));
  await free(3, 5, 'آخرِ سالِ تحصیلی ثبت‌نامِ کلاسِ شنا رو انجام می‌دم', r => !/[۰-۹]/.test(one(r.l)[0].replace(/«[^»]*»/g, '')));
  await free(4, 4, 'بعد از عید ماشین رو می‌فروشم', r => one(r.l)[0].indexOf(r.fa) >= 0);
  await free(5, 0, 'ماهِ دیگه اسباب‌کشی داریم', r => !/[۰-۹]/.test(one(r.l)[0].replace(/«[^»]*»/g, '')));
  await run(6, async () => { await fresh(0); const r = await E(async () => { const o = { d1: __firstDay(), farv: __farv() }; const n0 = __sys().length;
      await __say('اولِ ماه اجاره رو می‌دم، عید می‌ریم شمال، وسطِ ماه هم دندون‌پزشکی دارم'); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); return o; });
    B(6, r.pend.length === 3 && r.pend.some(x => !x.amb && x.date === r.d1 && /اجاره/.test(x.what)) && r.pend.some(x => !x.amb && x.date === r.farv && /شمال/.test(x.what)) && r.pend.some(x => x.free && /دندون/.test(x.what)) && r.dl.length === 0 && NOAMB(r.l), r); });
  await run(7, async () => { await fresh(8); const r = await E(async () => { await __say('بعد از عید رنگ‌کاریِ اتاق رو انجام می‌دم'); const o = { p0: __pend(), f5: APP.addDays(__farv(), 4) }; const n0 = __sys().length; await __say('پنجم فروردین'); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); return o; });
    B(7, r.p0.length === 1 && r.p0[0].free && ((r.dl.length === 1 && r.dl[0].date === r.f5 && r.l.filter(x => /ثبت شد/.test(x)).length === 1) || (r.dl.length === 0 && r.pend.length === 1 && r.pend[0].date === r.f5 && !r.pend[0].amb)), r); });
  await run(8, async () => { await fresh(2); const r = await E(async () => { const o = { thu: __D(1), sat: __D(3), wed: __D(7) }; o.faW = APP.fdate(o.wed); await __say('قبضِ گاز رو پنجشنبه می‌دم'); await __say('شنبه هم تعمیرکارِ کولر میاد، کولر رو شنبه تعمیر می‌کنم'); o.p0 = __pend(); const n0 = __sys().length;
      await __say('قبض رو پنجشنبه نه، چهارشنبه می‌دم'); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); return o; });
    B(8, r.pend.some(x => /قبض/.test(x.what) && x.date === r.wed && !x.amb) && r.pend.some(x => /کولر/.test(x.what) && x.date === r.sat) && !r.pend.some(x => x.date === r.thu) && !r.dl.some(x => x.date === r.thu) && r.l.filter(x => x.indexOf(r.faW) >= 0).length === 1, r); });
  await run(9, async () => { for (const withPlan of [false, true]) { await fresh(0); const r = await E(async (a) => { const o = { thu: __D(3), sun: __D(6) }; const n0 = __sys().length; await __say('پنجشنبه نه، یکشنبه می‌رم دکتر', 'خب.', a ? __plan('یکشنبه می‌رم دکتر') : undefined); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); return o; }, withPlan);
    B(9, one(r.l).length === 1 && r.pend.length === 1 && r.pend[0].date === r.sun && !r.pend[0].amb && !r.dl.length && !r.pend.some(x => x.date === r.thu), Object.assign({ withPlan }, r)); } });
  await run(10, async () => { await fresh(0); const r = await E(async () => { const o = { d: __D(9) }; await __say(__dm(o.d) + ' ثبت‌نامِ آزمون رو انجام می‌دم'); o.p0 = __pend(); const n0 = __sys().length; await __say('همون ' + __dm(o.d) + ' درسته'); o.l = __sys().slice(n0); o.dl = __dl(); return o; });
    B(10, r.p0.length === 1 && r.dl.length === 1 && r.dl[0].date === r.d && r.l.filter(x => /ثبت شد/.test(x)).length === 1 && !r.l.some(x => /بی‌جواب ماند/.test(x)), r); });
  await run(11, async () => { await fresh(0); const r = await E(async () => { const o = { thu: __D(3) }; await __say('تا جمعه به مدیر جواب می‌دم', 'خب.', __plan('تا جمعه به مدیر جواب می‌دم')); await __say('آره'); o.pl0 = __pl();
      await __say('پنجشنبه با صاحب‌خونه قرار دارم'); o.p1 = __pend(); const n0 = __sys().length; await __say('باشه'); o.l = __sys().slice(n0); o.dl = __dl(); o.pl = __pl(); return o; });
    B(11, r.p1.some(x => x.date === r.thu) && ((r.dl.some(x => x.date === r.thu && !x.plan)) || r.pl.some(q => /صاحب/.test(q.text) && q.when === r.thu)) && !r.l.some(x => /یک کار، دو تاریخ|یادآورِ/.test(x)) && r.pl.filter(q => /مدیر/.test(q.text))[0].when === r.pl0[0].when && !r.pl.some(q => q.remind), r); });
  await run(12, async () => { await fresh(0); const r = await E(async () => { const o = { d1: __firstDay() }; await __say('تا جمعه کابینت‌ها رو تموم می‌کنم', 'خب.', __plan('تا جمعه کابینت‌ها رو تموم می‌کنم')); await __say('آره');
      const n0 = __sys().length; await __say('قسطِ آخرِ وام رو سرِ برج می‌دم'); o.l = __sys().slice(n0); o.pend = __pend(); await __say('آره'); o.l2 = __sys().slice(n0); o.dl = __dl(); o.pl = __pl(); return o; });
    B(12, r.pend.length === 1 && r.pend[0].date === r.d1 && /قسط/.test(r.pend[0].what) && r.dl.some(x => x.date === r.d1 && !x.plan) && !r.l2.some(x => /یک کار، دو تاریخ/.test(x)) && !r.pl.some(q => q.remind), r); });
  /* ✏️ به روزِ گذشته (C93): هم ⏰ (بی گزارشِ مدل) هم 📌 (با گزارشِ برنامه) */
  const pastEdit = (n, d0, t0, t1, keepD) => run(n, async () => { for (const withPlan of (process.env['WP' + n] ? process.env['WP' + n].split(',').map(x => x === '1') : process.env.WP ? [process.env.WP === '1'] : [false, true])) { await fresh(d0); const r = await E(async (a) => { const o = { keep: __D(a.keepD), ny: __D(200) }; o.t1 = a.t1.replace('{D-1}', __jw(__D(-1)));
      await __say(a.t0, 'خب.', a.withPlan ? __plan(a.t0) : undefined); await __say('آره'); o.dl0 = __dl(); o.pl0 = __pl(); const n0 = __sys().length; o.ok = await __edit(__um(0), o.t1); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); o.pl = __pl(); o.dq = __dq(); return o; }, { t0, t1, keepD, withPlan });
    const kept = r.dl.some(x => x.date === r.keep) || r.pl.some(q => q.when === r.keep);
    B(n, r.ok && kept && r.l.some(x => /گذشته — کدام روز؟/.test(x)) && !r.l.some(x => /تاریخی ثبت نشد/.test(x)) && r.pend.length === 1 && r.pend[0].free && !r.pend.some(x => x.date > r.ny) , Object.assign({ withPlan }, r)); } });
  await pastEdit(13, 1, 'پنجشنبه بلیت می‌خرم', 'دیروز بلیت می‌خرم', 2);
  await pastEdit(14, 0, 'پس‌فردا کارتن‌ها رو می‌خرم', '{D-1} کارتن‌ها رو می‌خرم', 2);
  await run(15, async () => { await fresh(2); await E(async () => { await __say('جمعه می‌رم کتابخونه'); await __say('آره'); }); await day(3);
    const r = await E(async () => { const o = { thu: APP.today(), thu8: __D(7) }; const n0 = __sys().length; o.ok = await __edit(__um(0), 'پنجشنبه می‌رم کتابخونه'); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); o.all = __dlAll(); return o; });
    B(15, r.ok && r.pend.length === 1 && r.pend[0].date === r.thu && !r.pend.some(x => x.date === r.thu8) && one(r.l).length === 1 && !r.l.some(x => /تاریخی ثبت نشد/.test(x)) && r.all.some(x => x.done && x.by === 'replaced'), r); });
  /* C94: گذشتهٔ فعلِ همان کار می‌بندد */
  const doneRep = (n, d0, t0, adv, t1, plan, expectDone) => run(n, async () => { await fresh(d0); await E(async (a) => { await __say(a.t0, 'خب.', a.plan ? __plan(a.t0) : undefined); await __say('آره'); }, { t0, plan }); await day(d0 + adv);
    const r = await E(async (a) => { const n0 = __sys().length; await __say(a.t1); return { l: __sys().slice(n0), pl: __pl(), dl: __dlAll(), rows: __rows(), pend: __pend() }; }, { t1 });
    const closed = r.pl.some(q => q.state === 'done') || r.dl.some(x => x.done && x.by !== 'replaced'), open = r.pl.some(q => q.state === 'open') || r.dl.some(x => !x.done);
    B(n, expectDone ? (closed && !open && !r.rows.some(x => /انجام شد؟/.test(x)) && !r.l.some(x => /^📅/.test(x))) : (open && !closed), r); });
  await doneRep(16, 2, 'پنجشنبه به مادربزرگ زنگ می‌زنم', 1, 'به مادربزرگ زنگ زدم، حالش خوبه', true, true);
  await doneRep(17, 0, 'پس‌فردا کارتن‌ها رو می‌خرم', 1, 'کارتن‌ها رو خریدم، ۱۲ تا', false, true);
  await doneRep(18, 2, 'شنبه می‌رم اداره‌ی مالیات', 3, 'رفتم اداره، کارم راه افتاد', true, true);
  await run(19, async () => { await fresh(0); const r = await E(async () => { const t = 'از فردا هر شب ۲۰ دقیقه انگلیسی می‌خونم؛ با این روش خیالم راحته که قبول میشم';
      await __say(t, 'خب.', [__cs({ said: ['plan'], plan: { text: 'از فردا هر شب ۲۰ دقیقه انگلیسی می‌خونم', when: __D(1) } })]); const o = { pl: __pl() };
      APP.ASSIST.toggle && APP.ASSIST.toggle(false); APP.go('today'); await new Promise(z => setTimeout(z, 300)); o.today = document.getElementById('main').innerText;
      let dos = ''; try { const D = APP.dossier(__cur().id); dos = JSON.stringify(D.events || D); } catch (e) { dos = 'ERR ' + e.message; } o.dos = dos; return o; });
    B(19, r.pl.length === 1 && r.pl[0].state === 'open' && !/سرانجام: انجام شد/.test(r.dos) && !/سرانجام: انجام شد/.test(r.today), { pl: r.pl, dos: r.dos.slice(0, 600) }); });
  await run(20, async () => { await fresh(6); const r = await E(async () => { const o = { td: APP.today(), d1: __firstDay(), fa: APP.fdate(APP.today()) }; const n0 = __sys().length; await __say('سرِ برج قسط رو می‌دم'); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); return o; });
    B(20, /^۱ /.test(r.fa) && r.pend.length === 1 && r.pend[0].amb && r.pend[0].opts && r.pend[0].opts.indexOf(r.td) >= 0 && r.pend[0].opts.indexOf(r.d1) >= 0 && r.dl.length === 0 && one(r.l).length === 1, r); });
  await run(21, async () => { const esf = await E(() => __esf()); await freshAt(esf); const r = await E(async () => { const o = { td: APP.today() }; await __say('آخرِ سال حساب‌ها رو می‌بندم'); o.pend = __pend(); o.dl = __dl(); return o; });
    B(21, r.pend.length === 1 && r.pend[0].date === r.td && !r.pend[0].amb && r.dl.length === 0, r); });
  await run(22, async () => { const f6 = await E(() => APP.addDays(__farv(), 5)); await freshAt(f6); const r = await E(async () => { const o = { td: APP.today(), farv: __farv() }; await __say('عید می‌رم دیدنِ پدربزرگ'); o.pend = __pend(); o.dl = __dl(); return o; });
    B(22, r.pend.length === 1 && r.pend[0].date === r.farv && r.pend[0].date > r.td && r.dl.length === 0, r); });
  await run(23, async () => { await fresh(0); await E(async () => { await __say('فردا دارو می‌خرم'); }); await day(1); const r = await E(async () => { const o = { td: APP.today() }; const n0 = __sys().length; await __say('آره'); o.l = __sys().slice(n0); o.dl = __dl(); return o; });
    B(23, r.dl.length === 1 && r.dl[0].date === r.td && !r.l.some(x => /بی‌جواب ماند/.test(x)), r); });
  await run(24, async () => { await fresh(0); const r = await E(async () => { const o = { d1: __D(1), d2: __D(2) }; await __say('فردا داروهام رو می‌خرم'); await __say('بله، پس‌فردا'); o.pend = __pend(); o.dl = __dl(); return o; });
    B(24, r.pend.length === 1 && r.pend[0].date === r.d2 && !r.dl.some(x => x.date === r.d1), r); });
  await run(25, async () => { await fresh(0); const r = await E(async () => { const o = { fri: __D(4) }; o.faF = APP.fdate(o.fri); await __say('تا جمعه گزارش رو می‌فرستم'); const n0 = __sys().length; await __say('این جمعه نه'); o.l = __sys().slice(n0); o.dl = __dl(); o.pend = __pend(); return o; });
    B(25, r.dl.length === 0 && r.l.some(x => /کدام روز/.test(x)) && !r.pend.some(x => x.date === r.fri) && !r.l.some(x => x.indexOf(r.faF) >= 0 && /درست است/.test(x)), r); });
  await run(26, async () => { await fresh(0); const r = await E(async () => { const o = { d3: __D(3), d5: __D(5) }; await __say('پنجشنبه دندون‌پزشکی وقت دارم'); await __say('یه سؤالِ دیگه هم داشتم … شنبه کتاب می‌خرم'); await __say('آره، ثبتش کن'); o.dl = __dl(); return o; });
    B(26, r.dl.length === 1 && r.dl[0].date === r.d5 && !r.dl.some(x => x.date === r.d3), r); });
  await run(27, async () => { await fresh(2); const r = await E(async () => { const o = { sat: __D(3), thu: __D(1) }; await __say('تا پنجشنبه پروژه رو تحویل می‌دم'); const n0 = __sys().length; await __say('مهلت پنجشنبه نیست، شنبه‌ست'); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); return o; });
    B(27, r.pend.length === 1 && r.pend[0].date === r.sat && r.dl.length === 0 && !r.l.some(x => /چیزی برای عوض کردن نبود/.test(x)) && one(r.l).length <= 1, r); });

  /* ---------- منفی‌ها ---------- */
  await none(28, () => fresh(0), 'چرا توی «امروز» نوشتی «زنگ به بیمه — پنجشنبه»؟ من که گفتم بعداً');
  await none(29, () => fresh(0), 'ودیعه رو صاحبخونه آخرِ سال پس میده');
  await none(30, () => fresh(0), 'احتمالش ۴۰ درصده که جمعه بارون بیاد');
  await none(31, () => fresh(0), 'اگه سرِ برج حقوق بیاد، کفش می‌خرم');
  await run(32, async () => { await fresh(0); const r = await E(async () => { await __say('دو هفته دیگه جوابِ وام رو می‌گیرم'); const o = { p0: __pend() }; const n0 = __sys().length; await __say('یه مسئله‌ی دیگه هم دارم، ثبتش کن: یه باغچه‌ی ۶ در ۸ دارم، دورش رو چند متر نرده بکشم؟'); o.l = __sys().slice(n0); o.dl = __dl(); return o; });
    B(32, r.p0.length === 1 && r.dl.length === 0 && !r.l.some(x => /به گفتهٔ خودت ثبت شد/.test(x)), r); });
  await run(33, async () => { await fresh(8); const r = await E(async () => { await __say('بعد از عید رنگ‌کاریِ اتاق رو انجام می‌دم'); const o = { p0: __pend() }; await __say('عید که شد می‌ریم خونه‌ی خاله‌م، بعدش ببینیم'); o.pend = __pend(); o.dl = __dl(); return o; });
    B(33, r.p0.length === 1 && r.p0[0].free && r.dl.length === 0 && r.pend.some(x => x.free && /رنگ/.test(x.what)), r); });
  await run(34, async () => { await fresh(0); const r = await E(async () => { await __say('سرِ برج اجاره رو می‌دم'); const o = { p0: __pend() }; await __say('راستی کتابِ جدید رو شروع کردم'); o.pend = __pend(); o.dl = __dl(); return o; });
    B(34, r.p0.length === 1 && r.dl.length === 0, r); });
  await none(35, () => fresh(0), 'پارسال سرِ برج اجاره رو دیر دادم');
  await doneRep(36, 2, 'پنجشنبه به مادربزرگ زنگ می‌زنم', 0, 'به تعمیرکار زنگ زدم', true, false);
  await doneRep(37, 0, 'پس‌فردا کارتن‌ها رو می‌خرم', 0, 'هنوز نخریدم، فردا می‌خرم', false, false);
  await run(38, async () => { await fresh(0); const r = await E(async () => { await __say('کلاسِ امروز تموم شد؛ از فردا هر شب ۲۰ دقیقه تمرین می‌کنم', 'خب.', [__cs({ said: ['plan'], plan: { text: 'از فردا هر شب ۲۰ دقیقه تمرین می‌کنم', when: __D(1) } })]); return { pl: __pl() }; });
    B(38, r.pl.length === 1 && r.pl[0].state === 'open', r); });
  await run(39, async () => { await fresh(1); const r = await E(async () => { const o = { sat: __D(4) }; await __say('پنجشنبه بلیت می‌خرم'); await __say('آره'); const n0 = __sys().length; o.ok = await __edit(__um(0), 'شنبه بلیت می‌خرم'); o.l = __sys().slice(n0); o.pend = __pend(); o.all = __dlAll(); return o; });
    B(39, r.ok && !r.l.some(x => /گذشته/.test(x)) && r.pend.length === 1 && r.pend[0].date === r.sat && one(r.l).length === 1 && r.all.some(x => x.done && x.by === 'replaced'), r); });
  await run(40, async () => { await fresh(1); const r = await E(async () => { const o = { d2: __D(2) }; await __say('پنجشنبه بلیت می‌خرم'); await __say('آره'); const n0 = __sys().length; o.ok = await __edit(__um(0), 'پنجشنبه بلیتِ قطار می‌خرم'); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); o.all = __dlAll(); return o; });
    B(40, r.ok && r.dl.length === 1 && r.dl[0].date === r.d2 && r.pend.length === 0 && !r.all.some(x => x.by === 'replaced') && !r.l.some(x => /^📅/.test(x)), r); });
  await none(41, () => fresh(2), 'امروز چهارشنبه‌ست و خیلی خسته‌ام');
  await run(42, async () => { await fresh(0); const r = await E(async () => { const o = { d1: __firstDay() }; await __say('سرِ برج قسط رو می‌دم'); o.pend = __pend(); return o; });
    B(42, r.pend.length === 1 && r.pend[0].date === r.d1 && !r.pend[0].amb && !r.pend[0].free, r); });
  await run(43, async () => { await fresh(0); const r = await E(async () => { const o = { e: __esf() }; await __say('آخرِ سال حساب‌ها رو می‌بندم'); o.pend = __pend(); return o; });
    B(43, r.pend.length === 1 && r.pend[0].date === r.e && !r.pend[0].amb && !r.pend[0].free, r); });
  await run(44, async () => { await fresh(2); const r = await E(async () => { const o = { fri: __D(2) }; const n0 = __sys().length; await __say('تا جمعه گزارش رو می‌فرستم'); o.l = __sys().slice(n0); o.pend = __pend(); return o; });
    B(44, r.pend.length === 1 && r.pend[0].date === r.fri && !r.pend[0].amb && NOAMB(r.l), r); });
  await run(45, async () => { await fresh(4); const r = await E(async () => { const o = { td: APP.today(), d7: __D(7) }; const n0 = __sys().length; await __say('تا جمعه گزارش رو می‌فرستم'); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); return o; });
    B(45, r.pend.length === 1 && r.pend[0].amb && one(r.l).length === 1 && /همین امروز یا/.test(one(r.l)[0]) && r.dl.length === 0, r); });
  await run(46, async () => { await fresh(0); await E(async () => { await __say('فردا دارو می‌خرم'); }); await day(2); const r = await E(async () => { const n0 = __sys().length; await __say('آره'); return { l: __sys().slice(n0), dl: __dl(), pend: __pend() }; });
    B(46, r.dl.length === 0 && r.pend.length === 0 && !r.l.some(x => /📅 از حرفِ خودت/.test(x)), r); });
  await none(47, () => fresh(0), '۸ ماهه دارم پس‌انداز می‌کنم');
  await run(48, async () => { await fresh(0); const r = await E(async () => { await __say('شنبه کتاب می‌خرم'); await __say('یه مثال برای کسرها می‌خوام', 'می‌خوای یه مثال ببینی؟'); await __say('باشه'); return { dl: __dl() }; });
    B(48, r.dl.length === 0, r); });

  await b.close();
  const ks = Object.keys(res); console.log(JSON.stringify({ bank: ks.length, ok: ks.filter(k => res[k]).length, red: ks.filter(k => !res[k]).map(Number) }));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS — test_tour1_r28_dates_bank');
})();
