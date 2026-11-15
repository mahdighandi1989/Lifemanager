// تورِ پولیا (دستهٔ ۱، دورِ ۲۷ — سهمِ «dates») — بانکِ مستقلِ VARIANTS_R27 (tests/variants/VARIANTS_R27.json)، خانوادهٔ R3.date_ask_engine: #100–#150.
//  هر قلم همان متن و همان انتظارِ بانک است (ویرایش نشده)؛ D0 روزِ ساعتِ یخ‌زده است و هیچ تاریخی در انتظارها نوشته نشده (همه از ساعت).
//  ⟨D0+N, written yyyy/m/d⟩ از تقویمِ شمسیِ خودِ صفحه (APP.fdate) ساخته می‌شود. ONLY=<شمارهٔ بانک‌ها، با ویرگول>
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = JSON.parse(fs.readFileSync(path.join(__dirname, 'variants', 'VARIANTS_R27.json'), 'utf8'));
const T0 = Date.parse('2026-10-18T10:00:00+03:30');   // یکشنبه — سه‌شنبه +۲، دوشنبه +۱، چهارشنبه +۳، جمعه +۵، شنبه +۶، پنجشنبه +۴

const HELPERS = () => {
  const S = APP.S;
  APP.S.loaded = true; window.__noNav = true; window.__q = [];
  APP.callAI = async (sys, user, opts) => { let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  window.__say = async (text, reply, actions) => { __q.push({ reply: reply || 'خب.', status: 'related', memory: 'm', actions: actions || [{ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical' }] }); await APP.ASSIST.send(text); __q.length = 0; };
  window.__cur = () => APP.ASSIST.cur ? APP.ASSIST.cur() : APP.S.get(localStorage.getItem('lla.assist.cur'));
  window.__wipe = () => { ['practice', 'ex', 'fcast', 'kexp', 'case', 'card', 'sched', 'pr', 'topic', 'knot', 'kcase', 'eprob', 'eprog', 'achat', 'deadline', 'lprob', 'psyans'].forEach(t => { try { S.all(t).forEach(r => S.del(r.id)); } catch (e) { } }); localStorage.removeItem('lla.assist.cur'); APP.go('home'); APP.ASSIST.newSession(); };
  window.__cs = (o) => Object.assign({ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
  window.__sys = () => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text);
  window.__dl = () => APP.S.all('deadline').filter(d => !d.done).map(d => ({ what: d.what, date: d.date }));
  window.__dlAll = () => APP.S.all('deadline').map(d => ({ what: d.what, date: d.date, done: !!d.done }));
  window.__pl = () => (__cur().plans || []).map(q => ({ id: q.id, text: q.text, when: q.when, hist: (q.whenHist || []).length }));
  window.__pend = () => APP.PR.datePends(__cur()).reduce((a, P) => a.concat((P.items || []).map(x => ({ what: x.what, date: x.date, amb: !!x.amb, opts: x.opts || null, free: !!x.free }))), []);
  window.__dq = () => APP.dueList().filter(d => /^📅/.test(d.txt || '')).map(d => d.txt);
  window.__rows = () => APP.dueList().map(d => d.txt || '');
  window.__D = (n) => APP.addDays(APP.today(), n);
  window.__um = (k) => (__cur().msgs || []).filter(x => x.role === 'user' && !/^\[/.test(x.text))[k];
  /* ⟨روز، written yyyy/m/d⟩ از تقویمِ خودِ صفحه */
  window.__jw = (d, latin) => { const M = 'فروردین اردیبهشت خرداد تیر مرداد شهریور مهر آبان آذر دی بهمن اسفند'.split(' '); const f = APP.fdate(d).replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).split(' '); const s = f[2] + '/' + (M.indexOf(f[1]) + 1) + '/' + f[0]; return latin ? s : s.replace(/\d/g, c => '۰۱۲۳۴۵۶۷۸۹'[c]); };
  window.__edit = async (m, nt) => { const s = __cur(); __q.push({ reply: 'درست شد.', status: 'related', memory: 'm', actions: [] }); const r = APP.ASSIST.retractEdit(s, m, nt);
    for (let i = 0; i < 60 && APP.ASSIST.busy(); i++) await new Promise(z => setTimeout(z, 100)); await new Promise(z => setTimeout(z, 400)); __q.length = 0; return !!(r && r.ok); };
  window.__firstDay = (n0) => { for (let k = 1; k < 40; k++) { const d = APP.addDays(APP.today(), k); if (/^۱ /.test(APP.fdate(d))) return d; } return ''; };
  window.__farv = () => { for (let k = 0; k < 400; k++) { const d = APP.addDays(APP.today(), k); if (/^۱ فروردین/.test(APP.fdate(d))) return d; } return ''; };
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
  const CS = (o) => Object.assign({ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
  const B = (n, ok, x) => { const e = BANK[n]; if (!e || !/^R3/.test(e.rc)) { errors.push('bank #' + n + ' is not R3'); return; } res[n] = !!ok; if (!ok) errors.push('bank #' + n + ' «' + e.text.slice(0, 80) + '» :: ' + JSON.stringify(x).slice(0, 1200)); };
  const on = (n) => !process.env.ONLY || process.env.ONLY.split(',').includes(String(n));
  const run = async (n, fn) => { if (!on(n)) return; try { await fn(); } catch (e) { errors.push('bank #' + n + ' exception: ' + String(e && e.message || e).split('\n')[0]); res[n] = false; } };
  /* یک جمله، هیچ پرسش و هیچ سطرِ 📅 */
  const none = async (n, d0, text, acts) => run(n, async () => { await fresh(d0); const r = await E(async (a) => { const n0 = __sys().length; await __say(a.text, 'خب.', a.acts); return { l: __sys().slice(n0), pend: __pend(), dq: __dq(), dl: __dl(), rows: __rows() }; }, { text, acts });
    B(n, !r.l.some(x => /^📅/.test(x)) && r.pend.length === 0 && r.dq.length === 0 && r.dl.length === 0 && !r.rows.some(x => /برنامهٔ خودت/.test(x)), r); });
  /* یک جمله ⇒ یک پرسشِ «… درست است؟» با روزِ D */
  const asks = async (n, d0, text, fd, extra) => run(n, async () => { await fresh(d0); const r = await E(async (a) => { const n0 = __sys().length; await __say(a.text); const o = { l: __sys().slice(n0), pend: __pend(), dl: __dl() }; o.d = eval(a.fd); return o; }, { text, fd });
    B(n, r.l.filter(x => /^📅/.test(x)).length === 1 && r.pend.length === 1 && r.pend[0].date === r.d && !r.pend[0].amb && r.dl.length === 0 && (!extra || extra(r)), r); });

  /* ---------- مثبت‌ها ---------- */
  await run(100, async () => { await fresh(2); const r = await E(async () => { const o = { d: __D(2) }; await __say('پنجشنبه به مادرم سر می‌زنم.'); const n0 = __sys().length; await __say('باشه، ولی صبح زود یادم بنداز'); o.l = __sys().slice(n0); o.dl = __dl(); return o; });
    B(100, r.dl.length === 1 && r.dl[0].date === r.d && r.l.filter(x => /ثبت شد/.test(x)).length === 1 && !r.l.some(x => /بی‌جواب ماند/.test(x)), r); });
  await run(101, async () => { await fresh(1); const r = await E(async () => { const o = { d: __D(1) }; await __say('فردا به داروخانه زنگ می‌زنم.'); const n0 = __sys().length; await __say('بله، لطفاً فردا صبح یادم بیندازید'); o.l = __sys().slice(n0); o.dl = __dl(); return o; });
    B(101, r.dl.length === 1 && r.dl[0].date === r.d && !r.l.some(x => /بی‌جواب ماند|^📅/.test(x)), r); });
  await run(102, async () => { await fresh(2); const r = await E(async () => { const o = { d: __D(4) }; await __say('شنبه کتاب‌ها رو پس میدم.'); await __say('ثبتش کن'); o.dl = __dl(); return o; });
    B(102, r.dl.length === 1 && r.dl[0].date === r.d, r); });
  await run(103, async () => { await fresh(2); const r = await E(async () => { const o = { d3: __D(3), d5: __D(5) }; await __say('جمعه دندانپزشکی وقت دارم.'); await __say('یه سؤال دیگه هم داشتم: یکشنبه کفشِ مدرسه رو می‌خرم.'); await __say('آره'); o.dl = __dl(); o.pend = __pend(); return o; });
    B(103, r.dl.length === 1 && r.dl[0].date === r.d5 && !r.dl.some(x => x.date === r.d3), r); });
  await run(104, async () => { await fresh(1); const r = await E(async () => { const o = { d4: __D(4), d11: __D(11) }; o.fa4 = APP.fdate(o.d4); const n0 = __sys().length; await __say('امضا رو جمعهٔ بعد بذار، این جمعه صاحبخونه نیست'); o.l = __sys().slice(n0); o.pend = __pend(); o.dq = __dq(); o.dl = __dl(); return o; });
    B(104, r.pend.length === 1 && r.pend[0].date === r.d11 && !r.pend[0].amb && !r.dl.length && !r.l.some(x => x.indexOf(r.fa4) >= 0) && !r.dq.some(x => x.indexOf(r.fa4) >= 0), r); });
  await run(105, async () => { await fresh(2); const r = await E(async () => { const o = { thu: __D(2), sat: __D(4) }; await __say('آخرِ هفته کتاب‌ها رو پس میدم.', 'خب.', [__cs({ said: ['plan'], plan: { text: 'آخرِ هفته کتاب‌ها رو پس میدم', when: __D(3) } })]); o.p0 = __pend();
      await __say('جلسه با مشاور: پنجشنبه نه، شنبه'); o.pend = __pend(); o.dl = __dl(); o.pl = __pl(); return o; });
    B(105, r.p0.length === 1 && r.p0[0].amb && r.pend.some(x => x.amb) && r.pend.some(x => !x.amb && x.date === r.sat) && !r.dl.some(x => x.date === r.thu) && r.pl[0].when !== r.thu, r); });
  await run(106, async () => { await fresh(1); const r = await E(async () => { const o = { d1: __D(1), d2: __D(2) }; await __say('فردا میرم آزمایش'); const n0 = __sys().length; o.ok = await __edit(__um(0), 'پس‌فردا میرم آزمایش'); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); return o; });
    B(106, r.ok && !r.l.some(x => /تاریخی ثبت نشد/.test(x)) && r.l.filter(x => /^📅/.test(x)).length === 1 && r.pend.length === 1 && r.pend[0].date === r.d2 && !r.dl.length, r); });
  await run(107, async () => { await fresh(6); const r = await E(async () => { const o = { fri: __D(6), thu: __D(5) }; await __say('جمعه تحویل میدم'); await __say('آره'); o.dl0 = __dl(); const n0 = __sys().length; o.ok = await __edit(__um(0), 'پنجشنبه تحویل میدم'); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); o.all = __dlAll(); return o; });
    B(107, r.dl0.length === 1 && r.dl0[0].date === r.fri && r.ok && r.pend.length === 1 && r.pend[0].date === r.thu && r.dl.length === 0 && r.all.some(x => x.done && x.date === r.fri) && r.l.filter(x => /^📅/.test(x)).length === 1, r); });
  await run(108, async () => { await fresh(1); const r = await E(async () => { const o = { d1: __D(1), d2: __D(2) }; await __say('فردا صبح میرم آزمایش'); await __say('آره'); o.dl0 = __dl(); await __say('فردا نه، پس‌فردا'); o.pend = __pend(); await __say('آره'); o.dl = __dl(); o.all = __dlAll(); return o; });
    B(108, r.dl0.length === 1 && r.dl0[0].date === r.d1 && r.pend.length === 1 && r.pend[0].date === r.d2 && r.dl.length === 1 && r.dl[0].date === r.d2 && !r.dl.some(x => x.date === r.d1), r); });
  await run(109, async () => { await fresh(1); await E(async () => { await __say('سه‌شنبه میرم بانک.'); }); await day(4); const r = await E(async () => { const n0 = __sys().length; await __say('سلام'); return { l: __sys().slice(n0), pend: __pend(), dl: __dl(), dq: __dq(), td: APP.today() }; });
    B(109, !r.l.some(x => /^📅 از حرفِ خودت/.test(x)) && r.l.filter(x => /^📅/.test(x)).length <= 1 && r.pend.length === 0 && r.dq.length === 0 && r.dl.length === 0, r); });
  await run(110, async () => { await fresh(1); const d1 = await E(async () => { await __say('فردا صبح زنگ می‌زنم به لوله‌کش'); return __D(1); }); await day(2); const r = await E(async () => { await __say('صبح بخیر'); return { pend: __pend(), dq: __dq() }; });
    B(110, r.pend.length === 1 && r.pend[0].date === d1 && r.dq.length === 1, { r, d1 }); });
  await run(111, async () => { await fresh(1); await E(async () => { await __say('فردا صبح زنگ می‌زنم به لوله‌کش'); }); await day(2); const r = await E(async () => { const n0 = __sys().length; await __say('زنگ زدم، گفت پس‌فردا میاد'); return { l: __sys().slice(n0), pend: __pend(), dq: __dq(), dl: __dl() }; });
    B(111, r.pend.length === 0 && r.dq.length === 0 && r.dl.length === 0 && !r.l.some(x => /^📅/.test(x)), r); });
  await run(112, async () => { await fresh(2); const r = await E(async () => { await __say('کفشِ مدرسه رو پنجشنبه می‌خریم'); const o = { p0: __pend() }; await __say('خریدیم!'); o.pend = __pend(); o.dq = __dq(); return o; });
    B(112, r.p0.length === 1 && r.pend.length === 0 && r.dq.length === 0, r); });
  await run(113, async () => { await fresh(1); const r = await E(async () => { const o = { d: __D(12) }; const n0 = __sys().length; await __say(__jw(o.d) + ' وام رو تسویه می‌کنم'); o.l = __sys().slice(n0); o.pend = __pend(); return o; });
    B(113, r.pend.length === 1 && r.pend[0].date === r.d && r.l.some(x => /از حرفِ خودت/.test(x)) && !r.l.some(x => /تاریخی نخواندم/.test(x)), r); });
  await run(114, async () => { await fresh(1); const r = await E(async () => { const o = { d: __D(9) }; await __say('تا ' + __jw(o.d, true) + ' پروژه رو می‌فرستم'); o.pend = __pend(); return o; });
    B(114, r.pend.length === 1 && r.pend[0].date === r.d, r); });
  await run(115, async () => { await fresh(10); const r = await E(async () => { const o = { d: __firstDay() }; await __say('سرِ برج اجاره رو می‌ریزم'); o.p = __pend(); await __say('آره'); o.dl = __dl(); return o; });
    B(115, r.p.length === 1 && r.p[0].date === r.d && r.dl.length === 1 && r.dl[0].date === r.d, r); });
  await run(116, async () => { await fresh(10); const r = await E(async () => { const o = { d: __firstDay() }; await __say('سر برج حتما قبضارو میدم'); o.p = __pend(); return o; });
    B(116, r.p.length === 1 && r.p[0].date === r.d && !r.p[0].amb, r); });
  await run(117, async () => { await fresh(10); const r = await E(async () => { const o = { d: APP.addDays(__farv(), -1) }; await __say('آخرِ سال حسابِ صندوق رو می‌بندم'); o.p = __pend(); return o; });
    B(117, r.p.length === 1 && r.p[0].date === r.d && !r.p[0].amb, r); });
  await run(118, async () => { await fresh(40); const r = await E(async () => { const o = { d: __farv() }; await __say('عید میرم دیدنِ مادربزرگم'); o.p = __pend(); o.dl = __dl(); return o; });
    B(118, r.p.length === 1 && r.p[0].date === r.d && r.dl.length === 0, r); });
  await run(119, async () => { await fresh(70); const r = await E(async () => { const o = { d: __farv() }; const n0 = __sys().length; await __say('بعد از عید ثبت‌نامِ کلاسِ شنا می‌کنم'); o.l = __sys().slice(n0); o.p = __pend(); o.dl = __dl(); o.dq = __dq(); return o; });
    B(119, r.p.length === 1 && r.p[0].free && r.p[0].date === r.d && r.dl.length === 0 && r.dq.length === 1 && r.l.some(x => /کدام روز/.test(x)), r); });
  await run(120, async () => { await fresh(10); const r = await E(async () => { const o = { a: __firstDay(), b: APP.addDays(__farv(), -1), c: __farv() }; await __say('قسطِ آخرو سرِ برج میدم، بقیهٔ پولو تا آخرِ سال، کاشی‌کاری هم بعد از عید'); o.p = __pend(); o.dl = __dl(); o.dq = __dq(); return o; });
    B(120, r.p.length === 3 && r.p.some(x => x.date === r.a && !x.amb) && r.p.some(x => x.date === r.b && !x.amb) && r.p.some(x => x.free && x.date === r.c) && r.dl.length === 0 && r.dq.length === 3, r); });
  await run(121, async () => { await fresh(2); const r = await E(async () => { const o = { d: __D(3) }; await __say('جمعه کتاب رو پس میدم.', 'خب.', [__cs({ said: ['plan'], plan: { text: 'جمعه کتاب رو پس میدم', when: o.d } })]); const n0 = __sys().length;
      await __say('باشه', 'پیگیری را می‌گذارم.', [{ do: 'deadline', what: 'پیگیری: پس‌دادنِ کتاب', date: o.d }, __cs({})]); o.l = __sys().slice(n0); o.dl = __dl(); o.pl = __pl(); return o; });
    await day(5); const r2 = await E(() => APP.dueList().filter(d => /کتاب/.test((d.txt || '') + (d.sub || ''))).map(d => d.txt));
    B(121, r.pl[0].when === r.d && r.dl.length <= 1 && r.l.filter(x => /ثبت شد/.test(x)).length === 1 && r2.length === 1, { r, r2 }); });
  await asks(122, 5, 'جمعهٔ بعد میرم کوه', '__D(7)');
  await run(123, async () => { await fresh(3); const r = await E(async () => { const o = { a: __D(2), b: __D(9) }; await __say('جمعه‌ی بعد میرم کوه'); o.p = __pend(); o.dl = __dl(); return o; });
    B(123, r.p.length === 1 && r.p[0].amb && r.p[0].opts && r.p[0].opts[0] === r.a && r.p[0].opts[1] === r.b && r.dl.length === 0, r); });
  await run(124, async () => { await fresh(6); const r = await E(async () => { const o = { a: __D(5), b: __D(6) }; await __say('آخرِ هفته کمد رو مرتب می‌کنم'); o.p = __pend(); return o; });
    B(124, r.p.length === 1 && r.p[0].amb && r.p[0].opts && r.p[0].opts[0] === r.a && r.p[0].opts[1] === r.b, r); });
  await run(125, async () => { await fresh(1); await E(async () => { await __say('فردا میرم بانک.'); }); await day(3); const r = await E(async () => { const n0 = __sys().length; await __say('آره'); return { l: __sys().slice(n0), dl: __dl(), pend: __pend() }; });
    B(125, r.dl.length === 0 && r.pend.length === 0 && r.l.filter(x => /گذشته بود/.test(x)).length === 1, r); });
  await run(126, async () => { await fresh(0); let k = 0; for (; k < 40; k++) { await day(k); const f = await E(() => APP.fdate(APP.today())); if (/^۵ /.test(f)) break; } await E(() => __wipe());
    const r = await E(async () => { const o = { d: __D(15) }; await __say('تا بیستم باید گزارش رو تحویل بدم'); o.p = __pend(); return o; }); B(126, r.p.length === 1 && r.p[0].date === r.d, r); });
  await run(127, async () => { await fresh(2); const r = await E(async () => { await __say('آخرِ هفته کتاب‌ها رو پس میدم.'); const n0 = __sys().length; await __say('باشه'); return { l: __sys().slice(n0), dl: __dl(), p: __pend() }; });
    B(127, r.dl.length === 0 && r.p.length === 1 && r.p[0].amb && r.l.filter(x => /^📅/.test(x)).length === 1, r); });
  await run(128, async () => { await fresh(2); const r = await E(async () => { const o = { thu: __D(2), sat: __D(4) }; o.faT = APP.fdate(o.thu); await __say('جلسه با مشاور: پنجشنبه نه، شنبه'); await __say('آره'); o.dl0 = __dl(); const n0 = __sys().length;
      await __say('باشه، یه یادآور هم بذار.', 'یادآور را برای پنجشنبه می‌گذارم.', [{ do: 'deadline', what: 'پیگیری: آماده‌شدن برای جلسه با مشاور', date: o.thu }, __cs({})]); o.l = __sys().slice(n0); o.dl = __dl(); o.p = __pend(); o.dq = __dq(); return o; });
    B(128, r.dl0.length === 1 && r.dl0[0].date === r.sat && !r.dl.some(x => x.date === r.thu) && !r.p.some(x => x.date === r.thu) && !r.l.some(x => x.indexOf(r.faT) >= 0 && /درست است|ثبت شد/.test(x)), r); });
  await run(129, async () => { await fresh(1); const r = await E(async () => { const o = { a: __D(12), b: __D(14) }; await __say(__jw(o.a) + ' وام رو تسویه می‌کنم'); const n0 = __sys().length; o.ok = await __edit(__um(0), __jw(o.b) + ' وام رو تسویه می‌کنم'); o.l = __sys().slice(n0); o.p = __pend(); o.dl = __dl(); return o; });
    B(129, r.ok && r.p.length === 1 && r.p[0].date === r.b && !r.l.some(x => /تاریخی ثبت نشد/.test(x)) && r.dl.length === 0, r); });

  /* ---------- منفی‌ها ---------- */
  await none(130, 1, 'دو روزه دارم روش کار می‌کنم');
  await none(131, 1, 'سلام، امتحانای بچه‌ها هفته‌ی بعده، خونه خیلی شلوغه');
  await none(132, 4, 'پنجشنبه‌ست، خیلی خسته‌ام');
  await none(133, 1, 'اگه قیمتِ ماهِ بعد ۱۰ درصد بره بالا، چقدر باید بدم؟');
  await none(134, 1, 'ولی موعدِ بعدی رو سه هفته بعد گذاشتی');
  await none(135, 1, 'اگه اولی رو زودتر شروع کنم، شاید جمعه تموم شه', [CS({ said: ['plan'], plan: { text: 'اگه اولی رو زودتر شروع کنم، شاید جمعه تموم شه' } })]);
  await none(136, 1, 'دومی! اگه با یه سنسور نشه، کلِ ایده می‌خوابه', [CS({ said: ['plan'], plan: { text: 'دومی! اگه با یه سنسور نشه، کلِ ایده می‌خوابه' } })]);
  await none(137, 1, 'کلاسِ رباتیکش فقط سه‌شنبه‌هاست');
  await run(138, async () => { await fresh(1); const r = await E(async () => { await __say('جمعه به کافه‌ها زنگ می‌زنم.'); await __say('هزینهٔ مواد هم رفته بالا.', 'این را به‌عنوانِ مسئلهٔ تازه ثبت کنم؟'); await __say('آره ثبتش کن'); return { dl: __dl() }; });
    B(138, r.dl.length === 0, r); });
  await run(139, async () => { await fresh(1); const r = await E(async () => { await __say('چهارشنبه به کافه‌ها زنگ می‌زنم.'); await __say('هنوز مطمئن نیستم قیمت چقدر باشه.', 'یه مثال بزنم؟'); await __say('باشه'); return { dl: __dl() }; });
    B(139, r.dl.length === 0, r); });
  await none(140, 1, 'دیروز رفتم بانک');
  await run(141, async () => { await fresh(1); await E(async () => { await __say('یکشنبه با همسایه‌ها جلسه می‌ذارم'); await __say('خب ببینیم.'); }); await day(21); const r = await E(async () => { const n0 = __sys().length; await __say('یه مسئلهٔ تازه دارم'); return { l: __sys().slice(n0), p: __pend(), dq: __dq() }; });
    B(141, !r.l.some(x => /^📅 از حرفِ خودت/.test(x)) && r.p.length === 0 && r.dq.length === 0, r); });
  await none(142, 1, 'این جمعه نه');
  await none(143, 1, 'مامانم سرِ برج حقوق می‌گیره');
  await none(144, 1, 'عیدِ پارسال رفتیم شمال');
  await none(145, 1, 'رفتیم سرِ برجِ میلاد، خیلی باد میومد');
  await none(146, 1, 'عیدیِ بچه‌ها رو کنار گذاشتم');
  { await day(25); const t147 = await E(() => __jw(APP.addDays(APP.today(), -20)) + ' قسطِ قبلی رو دادم'); await none(147, 25, t147); }
  await none(148, 1, 'یه کلاس سه‌شنبه‌ها و پنجشنبه‌ها تشکیل میشه؛ توی ۱۰ هفته چند جلسه میشه؟');
  await none(149, 1, 'من ۱۳۸۸ به دنیا اومدم');
  await none(150, 1, 'معلمش گفت فردا امتحان دارن');

  await b.close();
  const ks = Object.keys(res); console.log(JSON.stringify({ bank: ks.length, ok: ks.filter(k => res[k]).length, red: ks.filter(k => !res[k]) }));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS — test_tour1_r27_dates_bank');
})();
