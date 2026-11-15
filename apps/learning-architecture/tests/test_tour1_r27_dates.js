// تورِ پولیا (دستهٔ ۱، دورِ ۲۷ — سهمِ «dates» — ۲۰۲۶-۱۱-۱۵) — DECISIONS_R27 R3 «موتورِ پرسشِ تاریخ»: C49–C52، C58؛ C19/C35 دوباره؛ تاریخ‌های اصطلاحی.
//  جمله‌های خودِ اجراکننده‌ها (round27{A,B,C,D}/<sid>/ai/pN.json)، هر مثبت قرمز روی BASE27 = 4273c7f1، هر مثبت با همانندِ منفی‌اش:
//   C49 «آره» فقط پاسخِ تازه‌ترین پرسشِ زیرِ پاسخِ پیشینِ صفحه — A27-1 (s01 p16، aA3 p7) · A27-15 (s09 p8) · A27-17 (s10 p11) · B27·D5 (pwB2، oB1 «آره، ثبتش کن»)
//   C49 سرآمدنِ پرسش، لنگرِ روزِ نسبی — A27-19 (aA3، aA4، oA1) · B27·D5 (s13، s14 p11) · C27-5 (aC4) · C27-11 (aC3 p8، p11) · D27-22 (s35)
//   C51 روزِ نفی‌شده — A27-2 (s01 p18) · C27-1/C27-2 (s22 p22) · A27-7 (s04 p8)
//   C58 ✏️ ِ روز — A27-10 (s05 p8، s10 p7) · B27·D10 (s19 p11) · D27-21 (s34 p4، گفت‌وگو)
//   C19/C35 دوباره — B27·D1 (s15 «سلام، هفته‌ی بعده»، oB1 «دو روز») · A27-15 (s09 p6) · A27-17 (s10 p9) · D27-29 (s34 p17) · A27-20 (aA3) · C27-27 (tC1 p3)
//   C50 تاریخِ نوشته و اصطلاحی — D27-4 (arD1 p9) · D27-32 (arD2 p10)
//   C52 یک تعهد، یک سطر — C27-17 / U50 (pwC2 p20–p21)
//  هیچ تاریخی در انتظارها نوشته نشده: همه از ساعتِ یخ‌زدهٔ T0 حساب می‌شوند. LLA_FILE = ساختِ دیگر (قرمزِ اول)؛ ONLY=yes,lapse,neg,edit,trig,idiom,one
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const T0 = Date.parse('2026-10-18T10:00:00+03:30');   // یکشنبه: دوشنبه +۱، سه‌شنبه +۲، چهارشنبه +۳، پنجشنبه +۴، جمعه +۵، شنبه +۶

const HELPERS = () => {
  const S = APP.S;
  APP.S.loaded = true; window.__noNav = true;
  window.__q = []; window.__sys = [];
  APP.callAI = async (sys, user, opts) => { __sys.push(String(sys || '') + '\n' + String(user || '')); let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  window.__say = async (text, reply, actions) => { __sys.length = 0; __q.push({ reply: reply || 'خب.', status: 'related', memory: 'm', actions: actions || [] }); await APP.ASSIST.send(text); __q.length = 0; return __sys.join('\n'); };
  window.__cur = () => APP.ASSIST.cur ? APP.ASSIST.cur() : APP.S.get(localStorage.getItem('lla.assist.cur'));
  window.__freshChat = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); return APP.ASSIST.newSession().id; };
  window.__wipe = () => { ['practice', 'ex', 'fcast', 'kexp', 'case', 'card', 'sched', 'pr', 'topic', 'knot', 'kcase', 'eprob', 'eprog', 'achat', 'deadline', 'lprob', 'psyans'].forEach(t => { try { S.all(t).forEach(r => S.del(r.id)); } catch (e) { } }); localStorage.removeItem('lla.assist.cur'); APP.go('home'); };
  window.__today = () => APP.dueList().map(d => (d.txt || '') + ' ‖ ' + (d.sub || ''));
  window.__cs = (o) => Object.assign({ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
  window.__sysLines = () => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text);
  window.__dl = () => APP.S.all('deadline').map(d => ({ what: d.what, date: d.date, done: !!d.done, by: d.by || '', plan: !!d.plan }));
  window.__pl = () => (__cur().plans || []).map(q => ({ id: q.id, text: q.text, when: q.when, state: q.state }));
  window.__birth = (v) => { const st = APP.S.settings(); st.profile = st.profile || {}; if (v) st.profile.birth = v; else delete st.profile.birth; delete st.profile.ageSaid; delete st.profile.birthMD; delete st.profile.reg; APP.S.saveSettings(st); };
  window.__wd = (d) => { const p = d.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).getDay(); };
  window.__nextDow = (dow) => { const t = APP.today(); let k = (dow - __wd(t) + 7) % 7; if (!k) k = 7; return APP.addDays(t, k); };
  window.__pend = () => APP.PR.datePends(__cur()).reduce((a, P) => a.concat((P.items || []).map(x => ({ what: x.what, date: x.date, amb: !!x.amb, opts: x.opts || null, free: !!x.free, st: P.state }))), []);
  window.__dq = () => APP.dueList().filter(d => /^📅/.test(d.txt || '')).map(d => d.txt);
  window.__ask = () => __sysLines().filter(x => /^📅/.test(x));
  window.__fa = (d) => APP.fdate(d);
  window.__edit = async (m, nt) => { const s = __cur(); __q.push({ reply: 'درست شد.', status: 'related', memory: 'm', actions: [] }); const r = APP.ASSIST.retractEdit(s, m, nt);
    for (let i = 0; i < 60 && APP.ASSIST.busy(); i++) await new Promise(z => setTimeout(z, 100)); await new Promise(z => setTimeout(z, 400)); __q.length = 0; return !!(r && r.ok); };
  window.__um = (k) => (__cur().msgs || []).filter(x => x.role === 'user' && !/^\[/.test(x.text))[k];
};

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { runners: {}, bank: {} };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'Asia/Tehran' });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.clock.install({ time: new Date(T0) });
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
  const E = (fn, arg) => p.evaluate(fn, arg);
  const day = async (n, hour) => { await p.clock.setSystemTime(new Date(T0 + n * 864e5 + ((hour == null ? 10 : hour) - 10) * 36e5)); };
  const load = async () => { await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(150); await E(HELPERS); };
  const fresh = async (n) => { await day(n || 0); await E(() => { __wipe(); __birth(''); __freshChat(); }); };
  const __CS = (o) => Object.assign({ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
  const X = (name, ok, x) => { if (process.env.DUMP && name.indexOf(process.env.DUMP) >= 0) console.log('DUMP ' + name + ' :: ' + JSON.stringify(x)); info.runners[name] = !!ok; if (!ok) errors.push(name + ' :: ' + JSON.stringify(x).slice(0, 1600)); };
  await load();

  /* ===== C49 — «آره/باشه/بله» فقط پاسخِ تازه‌ترین پرسشِ زیرِ پاسخِ پیشینِ صفحه ===== */
  await section('yes', async () => {
    /* s01 p15→p16 (چهارشنبه): «باشه، جمعه پیگیری کن. …» با متنِ بیشتر ⇒ همان پرسشِ جمعه ثبت می‌شود */
    await fresh(3);
    let r = await E(async () => { const o = { fri: __nextDow(5) };
      await __say('سلام. قراردادِ اجارهٔ پنج‌ساله رو دارم نهایی می‌کنم. تا جمعه امضاش می‌کنم.', 'گامِ بعدیِ خودت پیش از امضا چیست؟', [__cs({ said: ['plan'], plan: { text: 'تا جمعه امضاش می‌کنم', when: o.fri } })]);
      o.ask0 = __ask(); const n0 = __sysLines().length;
      await __say('باشه، جمعه پیگیری کن. یه مقایسه هم کردم: اتاقِ پسرم این‌جا ۳ متر در ۴ متر = ۱۲ مترمربعه، توی خونهٔ قبلی ۳ متر در ۳ متر = ۱۲ مترمربع بود، پس فرقی نکرده.', 'باشه.', [__cs({})]);
      o.l1 = __sysLines().slice(n0); o.pl = __pl(); o.dq = __dq(); return o; });
    X('A27-1 s01 p16: «باشه، جمعه پیگیری کن. …» (بله با متنِ بیشتر) ⇒ برنامه همان جمعه ثبت شد؛ «بی‌جواب ماند» نیامد', r.ask0.length === 1 && r.pl[0].when === r.fri && !r.l1.some(x => /بی‌جواب ماند|تاریخی ثبت نشد/.test(x)) && r.dq.length === 0, r);
    /* aA3 p6→p7 (جمعه): «… هفتاد درصد مطمئنم. بله، لطفاً فردا یادم بیندازید.» — «بله» در جملهٔ دوم */
    await fresh(5);
    r = await E(async () => { const o = { tom: APP.addDays(APP.today(), 1) };
      await __say('می‌پرسم که نیم ساعت دیر و زود اشکال دارد یا نه، و این‌که داروی اول را هم با غذا بخورم یا فرقی نمی‌کند. فردا صبح به داروخانهٔ سرِ کوچه زنگ می‌زنم.', 'چه پیش‌بینی می‌کنید و چقدر مطمئنید؟', [__cs({ said: ['plan'], plan: { text: 'فردا صبح به داروخانهٔ سرِ کوچه زنگ می‌زنم', when: o.tom } })]);
      const n0 = __sysLines().length;
      await __say('فکر می‌کنم بگوید نیم ساعت اشکالی ندارد؛ هفتاد درصد مطمئنم. بله، لطفاً فردا یادم بیندازید.', 'پیش‌بینی‌تان را با درصدش گفتید.', [__cs({ ans: ['e1'] })]);
      o.l1 = __sysLines().slice(n0); o.pl = __pl(); return o; });
    X('A27-1 aA3 p7: «بله، لطفاً فردا یادم بیندازید» (بله در جملهٔ دوم) ⇒ «فردا صبح … زنگ می‌زنم» ثبت شد', r.pl[0].when === r.tom && !r.l1.some(x => /بی‌جواب ماند/.test(x)), r);
    /* A27-15 s09 p6→p8 + B27·D5 oB1: «آره ثبتش کن» زیرِ پرسشِ دیگری، پرسشِ تاریخِ کهنه را ثبت نمی‌کند (جمله‌های خودِ s09) */
    await fresh(1);
    r = await E(async () => { const o = {};
      await __say('کلش اینه: قیمتِ ماهِ بعد رو طوری بذارم که سودِ ماهانه به ۲۰ میلیون نزدیک بشه. قیمتِ فعلیم ۸۰۰ هزاره و این ماه ۳۵ تا فروختم.', 'چه چیزهای دیگری داری؟', [__cs({ ph: 'u', said: ['u', 'd'] })]);
      await __say('هزینهٔ مواد هم رفته بالا: هر کیک الان ۳۸۰ هزار تموم میشه.', 'اگر بخواهی قیمتِ ماهِ بعد را قدم‌به‌قدم پیدا کنی، می‌شود آن را در «🔭 مسئلهٔ حل‌نشدهٔ خودم» ثبت کرد. شرط چیست؟', [__cs({ ph: 'u' })]);
      const n0 = __sysLines().length;
      await __say('آره ثبتش کن؛ می‌خوام قیمتِ ماهِ بعد رو قدم به قدم پیدا کنم.', 'ثبتش می‌کنم.', [__cs({ ph: 'u' })]);
      o.l2 = __sysLines().slice(n0); o.dl = __dl(); o.dq = __dq(); return o; });
    X('A27-15 s09 p8: «آره ثبتش کن؛ …» که پاسخِ پرسشِ ثبتِ مسئله بود، هیچ تاریخی ثبت نمی‌کند', r.dl.length === 0 && !r.l2.some(x => /ثبت شد/.test(x)), r);
    /* B27·D5 (oB1 p23): پرسشِ تاریخِ کهنه‌تر (بی‌جواب، «waiting») با «آره، ثبتش کن» ِ زیرِ پاسخی دیگر ثبت نمی‌شود */
    await fresh(1);
    r = await E(async () => { const o = { fri: __nextDow(5) };
      await __say('جمعه به سه تا کافه زنگ می‌زنم و قیمت رو می‌گم.', 'خب.', [__cs({})]);
      o.ask0 = __ask();
      await __say('هزینهٔ مواد هم رفته بالا: هر کیک الان ۳۸۰ هزار تموم میشه.', 'می‌شود آن را ثبت کرد. ثبتش کنم؟', [__cs({})]);
      const n0 = __sysLines().length;
      await __say('آره، ثبتش کن.', 'ثبتش می‌کنم.', [__cs({})]);
      o.l2 = __sysLines().slice(n0); o.dl = __dl(); return o; });
    X('B27·D5 oB1 p23: «آره، ثبتش کن» زیرِ پرسشِ دیگرِ دستیار، پرسشِ تاریخِ کهنه (جمعه) را ثبت نمی‌کند', r.ask0.length === 1 && r.dl.length === 0 && !r.l2.some(x => /ثبت شد/.test(x)), r);
    /* همانندِ منفی (C49): «آره» درست زیرِ همان پرسش ⇒ ثبت می‌شود */
    await fresh(1);
    r = await E(async () => { const o = { fri: __nextDow(5) };
      await __say('جمعه به سه تا کافه زنگ می‌زنم و قیمت رو می‌گم.', 'خب.', [__cs({})]);
      await __say('آره ثبتش کن.', 'باشه.', [__cs({})]); o.dl = __dl(); return o; });
    X('C49 همانندِ منفی: «آره ثبتش کن» درست زیرِ تازه‌ترین پرسشِ تاریخ ⇒ همان ثبت می‌شود', r.dl.length === 1 && r.dl[0].date === r.fri, r);
    /* A27-17 s10 p11 (پنجشنبه): «جمعهٔ بعد.» فقط تازه‌ترین پرسش را جواب می‌دهد، نه پرسشِ دوپهلوِ کهنه‌تر */
    await fresh(4);
    r = await E(async () => { const o = { fri: __nextDow(5), thu7: APP.addDays(APP.today(), 7) };
      await __say('پنجشنبه با خواهرم جلسه دارم.', 'خب.', [__cs({})]);
      o.ask0 = __ask();
      await __say('با میزهای چهارنفره شمردم و چیدمان درومد. تا جمعه چیدمانِ نهایی رو برای خواهرم می‌فرستم.', 'روزِ جمعه پیگیرِ فرستادن می‌شوم.', [__cs({ said: ['plan'], plan: { text: 'تا جمعه چیدمانِ نهایی رو برای خواهرم می‌فرستم', when: o.fri } })]);
      await __say('جمعهٔ بعد.', 'باشه، برای جمعهٔ بعد.', [__cs({})]);
      o.dl = __dl(); o.pl = __pl(); o.pend = __pend(); return o; });
    X('A27-17 s10 p11: «جمعهٔ بعد.» پرسشِ دوپهلوِ کهنه‌ترِ «پنجشنبه … جلسه» را جواب نمی‌گیرد (هیچ ⏰ ِ پنجشنبه)', r.ask0.length === 1 && !r.dl.some(x => /جلسه/.test(x.what)), r);
  });

  /* ===== C49 — پرسش سر می‌آید (روزش گذشت / کار انجام شد)؛ روزِ نسبی به روزِ گفتن لنگر است ===== */
  await section('lapse', async () => {
    /* aA3 (جمعه ⇒ شنبه): پرسشِ بی‌جوابِ «فردا صبح … زنگ می‌زنم» فردایش با «یکشنبه» دوباره پرسیده نمی‌شود و پس از «زنگ زدم» در «امروز» نمی‌ماند */
    await fresh(5);
    let r = await E(async () => { const o = { tom: APP.addDays(APP.today(), 1) };
      await __say('فردا صبح به داروخانهٔ سرِ کوچه زنگ می‌زنم.', 'چقدر مطمئنید؟', [__cs({ said: ['plan'], plan: { text: 'فردا صبح به داروخانهٔ سرِ کوچه زنگ می‌زنم', when: o.tom } })]);
      await __say('فکر می‌کنم بگوید نیم ساعت اشکالی ندارد؛ هفتاد درصد مطمئنم.', 'پیش‌بینی‌تان را گفتید.', [__cs({ ans: ['e1'] })]); return o; });
    await day(6);
    r = await E(async (o) => { o.td = APP.today(); o.dqBefore = __dq(); const n0 = __sysLines().length;
      await __say('سلام. زنگ زدم. داروساز گفت تا یک ساعت دیر و زود اشکالی ندارد. پیش‌بینی‌ام درست بود!', 'تماس را گرفتید.', [__cs({ ph: 'b', said: ['result'], result: 'داروساز گفت تا یک ساعت دیر و زود اشکالی ندارد', plan_done: { id: 'pl1', done: true } })]);
      o.l = __sysLines().slice(n0); o.dq = __dq(); o.pend = __pend(); return o; }, r);
    X('A27-19 aA3: روزِ بعد پرسشِ «فردا صبح …» با «فردا» ِ تازه (یکشنبه) دوباره پرسیده نمی‌شود', !r.l.some(x => /^📅/.test(x)) && !r.pend.some(x => x.date > r.td), r);
    X('A27-19 / C27-5: پس از «زنگ زدم» (برنامه انجام شد) پرسشِ تاریخ در «امروز» نمی‌ماند', r.dq.length === 0, r);
    /* C27-11 aC3 p6→p8: «از اولِ آبان هر ماه ۶ میلیون می‌ذارم کنار» ⇒ روزِ ۱ آبان، با گزارشِ «گذاشتم کنار»، با «۱ آبان ِ سالِ بعد» دوباره پرسیده نمی‌شود */
    await fresh(1);
    r = await E(async () => { const o = { d: APP.PR.whenInfo('از اولِ آبان هر ماه ۶ میلیون می‌ذارم کنار').date };
      await __say('دفترچه‌م رو نگاه کردم: مهر ۸.۵ میلیون خرج کردم، شهریور ۱۰.۲ — چون شهریور تعمیرِ کولر داشتم. پس ۹.۷ تنگه ولی میشه. از اولِ آبان هر ماه ۶ میلیون می‌ذارم کنار.', 'پیش از شروع چه فکر می‌کنید؟', [__cs({ said: ['plan', 'd'], plan: { text: 'از اولِ آبان هر ماه ۶ میلیون می‌ذارم کنار', when: o.d } })]);
      await __say('اگه دارو بیشتر گرون شد، از اون ۹.۷ کم می‌کنم؛ یه ۵ میلیون هم تو حساب دارم برای روزِ مبادا. پس جا داره.', 'این طرحِ دومِ شماست.', [__cs({ ph: 'p' })]);
      o.gap = Math.round((Date.parse(o.d + 'T10:00:00+03:30') - Date.parse(APP.today() + 'T10:00:00+03:30')) / 864e5); return o; });
    await day(1 + r.gap);
    r = await E(async (o) => { o.td = APP.today(); const n0 = __sysLines().length;
      await __say('سلام دوباره. اولِ آبان ۶ میلیون رو گذاشتم کنار، طبقِ برنامه.', 'قدمِ اول را برداشتید.', [__cs({ said: ['result'], result: 'اولِ آبان ۶ میلیون رو گذاشتم کنار', plan_done: { id: 'pl1', done: true } })]);
      o.l = __sysLines().slice(n0); o.pend = __pend(); o.dq = __dq(); return o; }, r);
    X('C27-11 aC3 p8: روزِ ۱ آبان، پس از «گذاشتم کنار»، برنامهٔ «از اولِ آبان …» با «۱ آبان ِ سالِ بعد» دوباره پرسیده نمی‌شود و در «امروز» پرسش نمی‌ماند', r.gap > 0 && !r.l.some(x => /^📅/.test(x)) && !r.pend.some(x => x.date > r.td) && r.dq.length === 0, r);
    /* D27-22 s35: «یکشنبه … جلسه می‌ذارم» که هفته‌ها پیش گفته شد، در روزهای بعد با یکشنبهٔ تازه پرسیده نمی‌شود */
    await fresh(1);
    await E(async () => { const sun = __nextDow(0);
      await __say('یکشنبه با مسئولای کوچه‌ها جلسه می‌ذارم تا هر کدوم کیسه‌های جدا رو تحویل بگیرن.', 'خب.', [__cs({ said: ['plan'], plan: { text: 'یکشنبه با مسئولای کوچه‌ها جلسه می‌ذارم تا هر کدوم کیسه‌های جدا رو تحویل بگیرن', when: sun } })]);
      await __say('یکی از اعضای شورا گفت سطل‌ها مشکل بودن.', 'خب.', [__cs({})]); });
    await day(15);
    r = await E(async () => { const o = { td: APP.today() }; const n0 = __sysLines().length;
      await __say('دو هفته گذشت. امروز نشستم و فرض‌هام رو سنجیدم.', 'خب.', [__cs({ said: ['plan'], plan: { text: 'یکشنبه با مسئولای کوچه‌ها جلسه می‌ذارم تا هر کدوم کیسه‌های جدا رو تحویل بگیرن' } })]);
      o.l = __sysLines().slice(n0); o.pend = __pend(); o.dq = __dq(); return o; });
    X('D27-22 s35: جملهٔ کهنهٔ «یکشنبه … جلسه می‌ذارم» با یکشنبهٔ تازه دوباره پرسیده نمی‌شود', !r.l.some(x => /^📅/.test(x)) && !r.pend.some(x => x.date > r.td) && r.dq.length === 0, r);
    /* همانندِ منفی: پرسشِ تازه‌ای که روزش نرسیده و کارش انجام نشده در «امروز» می‌ماند */
    await fresh(1);
    r = await E(async () => { const o = { fri: __nextDow(5) };
      await __say('جمعه به سه تا کافه زنگ می‌زنم.', 'خب.', [__cs({})]);
      await __say('هزینهٔ مواد هم رفته بالا.', 'خب.', [__cs({})]); o.dq = __dq(); return o; });
    X('C49 همانندِ منفی: پرسشی که روزش نرسیده و کارش گزارش نشده در «امروز» می‌ماند', r.dq.length === 1, r);
  });

  /* ===== C51 — روزِ نفی‌شده هرگز ثبت، پیشنهاد یا پاسخِ پرسشِ دیگر نمی‌شود ===== */
  await section('neg', async () => {
    /* s01 p18 (چهارشنبه): «امضا رو جمعهٔ بعد بذار، این جمعه صاحبخونه نیست» ⇒ جمعهٔ همین هفته نه؛ جمعهٔ بعد پرسیده می‌شود */
    await fresh(3);
    let r = await E(async () => { const o = { fri: __nextDow(5), fri2: APP.addDays(__nextDow(5), 7) }; o.friFa = APP.fdate(o.fri);
      await __say('تا جمعه امضاش می‌کنم.', 'گامِ بعدیِ خودت پیش از امضا چیست؟', [__cs({ said: ['plan'], plan: { text: 'تا جمعه امضاش می‌کنم', when: o.fri } })]);
      await __say('اجارهٔ یک سال هم ۱۸ میلیون × ۱۲ = ۲۱۶ میلیون.', 'خب.', [__cs({})]);
      const n0 = __sysLines().length;
      await __say('آهان، ۲۱۶ میلیون، هزار رو اشتباه نوشتم. راستی امضا رو جمعهٔ بعد بذار، این جمعه صاحبخونه نیست.', 'امضا را به جمعهٔ بعد بردم.', [__cs({ said: ['plan'], plan: { text: 'امضا رو جمعهٔ بعد بذار، این جمعه صاحبخونه نیست', when: o.fri2, same: 'pl1' } })]);
      o.l = __sysLines().slice(n0); o.pl = __pl(); o.pend = __pend(); o.dq = __dq(); o.dl = __dl(); return o; });
    X('A27-2 s01 p18: «جمعهٔ بعد بذار، این جمعه … نیست» ⇒ جمعهٔ نفی‌شده نه ثبت است و نه در «امروز» پیشنهاد می‌شود؛ جمعهٔ بعد یک بار پرسیده می‌شود', r.pl[0].when !== r.fri && !r.dl.some(x => x.date === r.fri) && !r.dq.some(x => x.indexOf(r.fri) >= 0 || x.indexOf(r.friFa) >= 0) && r.pend.some(x => x.date === r.fri2 && !x.amb) && !r.pend.some(x => x.date === r.fri), r);
    /* s22 p21–p22 (دوشنبه): «اول گفتم مهلت گزارش تا پنجشنبه‌ست — اشتباه گفتم، تا شنبه‌ست» */
    await fresh(1);
    r = await E(async () => { const o = { thu: __nextDow(4), fri: __nextDow(5), sat: __nextDow(6) };
      await __say('یه چیز دیگه: باید یه گزارش کتبی از این ماجرا به هیئت‌امنا تحویل بدم. مهلتش تا پنجشنبه‌ست.', 'مهلتِ گزارش را می‌پرسم.', [__cs({}), { do: 'deadline', what: 'گزارشِ کتبی به هیئت‌امنا', date: o.thu }]);
      await __say('تا آخر هفته همه‌ی این‌ها رو جمع می‌کنم.', 'می‌خواهی جمع‌کردن را پیش از پنجشنبه بگذاری؟', [__cs({ said: ['plan'], plan: { text: 'تا آخر هفته همه‌ی این‌ها رو جمع می‌کنم', when: o.fri } })]);
      o.ask1 = __ask().slice(-1); const n0 = __sysLines().length;
      await __say('یه اصلاح: اول گفتم مهلت گزارش تا پنجشنبه‌ست — اشتباه گفتم، تا شنبه‌ست.', 'گرفتم: مهلتِ گزارش شنبه است.', [__cs({})]);
      o.l = __sysLines().slice(n0); o.pl = __pl(); o.dl = __dl(); o.pend = __pend(); o.dq = __dq(); return o; });
    X('C27-1 s22 p22: «پنجشنبه» ِ نفی‌شده پاسخِ پرسشِ «کدام روز؟» ِ برنامهٔ دیگر نمی‌شود (برنامه ثبت نشد)', r.pl[0].when !== r.thu && r.pend.some(x => x.amb), r);
    X('C27-2 s22 p22: پرسشِ بازِ مهلتِ پنجشنبه به شنبه می‌رود؛ پنجشنبه نه ثبت است نه در «امروز»', !r.dl.some(x => x.date === r.thu) && !r.pend.some(x => !x.amb && x.date === r.thu) && r.pend.some(x => !x.amb && x.date === r.sat), r);
    /* A27-7 s04 p8: پرسشِ شنبه نقلِ «پنجشنبه» را ندارد */
    await fresh(1);
    r = await E(async () => { const o = { thu: __nextDow(4), sat: __nextDow(6) };
      await __say('باشه. تصمیم گرفتم پنجشنبه یه جلسهٔ کوتاه با خواهر و برادرم بذارم، این بار فقط دربارهٔ زمانِ پرداختِ سهمِ برادرم.', 'پیش از انجامش فکر می‌کنی چه می‌شود؟', [__cs({ said: ['plan'], plan: { text: 'تصمیم گرفتم پنجشنبه یه جلسهٔ کوتاه با خواهر و برادرم بذارم', when: o.thu } })]);
      const n0 = __sysLines().length;
      await __say('ببخشید، اشتباه گفتم: جلسه رو شنبه می‌ذارم، نه پنجشنبه — پنجشنبه برادرم سرِ کاره.', 'اصلاحِ روزِ جلسه را فرستادم.', [__cs({ said: ['plan'], retract: { msg: 'تصمیم گرفتم پنجشنبه یه جلسهٔ کوتاه با خواهر و برادرم بذارم', key: 'plan:pl1', what: 'plan', fix: 'شنبه', old: 'پنجشنبه' } })]);
      o.l = __sysLines().slice(n0); o.pend = __pend(); return o; });
    const satAsk = r.pend.filter(x => x.date === r.sat);
    X('A27-7 s04 p8: پرسشِ شنبه با متنی که «پنجشنبه» ِ نفی‌شده را ندارد', satAsk.length === 1 && !/پنج ?‌?شنبه/.test(satAsk[0].what) && !r.pend.some(x => x.date === r.thu), r);
    /* همانندِ منفی (C51): «X نه، Y» وقتی Y همان روزِ پرسیده است ⇒ ثبت می‌شود */
    await fresh(1);
    r = await E(async () => { const o = { sat: __nextDow(6) };
      await __say('شنبه میرم بازار و مخزن رو می‌خرم.', 'خب.', [__cs({})]);
      await __say('آره، شنبه؛ پنجشنبه نه.', 'باشه.', [__cs({})]); o.dl = __dl(); return o; });
    X('C51 همانندِ منفی: «آره، شنبه؛ پنجشنبه نه» زیرِ پرسشِ شنبه ⇒ شنبه ثبت می‌شود', r.dl.length === 1 && r.dl[0].date === r.sat, r);
  });

  /* ===== C58 — ✏️ ِ روز: روز دوباره خوانده و یک بار پرسیده می‌شود؛ پرسشِ پیشین «جایگزین شد» ===== */
  await section('edit', async () => {
    /* s05 p7→p8: ✏️ «فردا» ⇐ «پنجشنبه» وقتی پرسشِ فردا باز است */
    await fresh(1);
    let r = await E(async () => { const o = { tom: APP.addDays(APP.today(), 1), thu: __nextDow(4) }; o.thuFa = APP.fdate(o.thu);
      await __say('فردا تو سایت شرکت برای دورهٔ آموزشیِ بعدی ثبت‌نام می‌کنم.', 'فکر می‌کنی چه می‌شود؟', [__cs({ ph: 'p', said: ['plan'], plan: { text: 'فردا تو سایت شرکت برای دورهٔ آموزشیِ بعدی ثبت‌نام می‌کنم', when: o.tom } })]);
      const n0 = __sysLines().length; o.ok = await __edit(__um(0), 'پنجشنبه تو سایت شرکت برای دورهٔ آموزشیِ بعدی ثبت‌نام می‌کنم.');
      o.l = __sysLines().slice(n0); o.pend = __pend(); o.pl = __pl(); o.dq = __dq(); return o; });
    X('A27-10 s05 p8: ✏️ «فردا ⇐ پنجشنبه» ⇒ «تاریخی ثبت نشد» نمی‌آید؛ پنجشنبه یک بار پرسیده می‌شود؛ فردا نه ثبت و نه پرسیده', r.ok && !r.l.some(x => /تاریخی ثبت نشد|بی‌جواب ماند/.test(x)) && r.l.filter(x => /^📅/.test(x) && x.indexOf(r.thuFa) >= 0).length === 1 && r.pend.filter(x => x.date === r.thu).length === 1 && !r.pend.some(x => x.date === r.tom) && r.pl[0].when !== r.tom, r);
    /* s19 p11: ✏️ «شنبه …» ⇐ «یکشنبه …» ⇒ شنبهٔ قدیم بی «آره» ثبت نمی‌شود */
    await fresh(1);
    r = await E(async () => { const o = { sat: __nextDow(6), sun: __nextDow(0) };
      await __say('آموختم که مهمونی‌ها حلقه‌ی ضعیفم بودن نه خود رژیم. برای نیمه‌ی دوم: از شنبه هفته‌ای سه بار باشگاه می‌رم، اولین جلسه شنبه ساعت ۶ عصر.', 'پیش از اولین جلسه چه پیش‌بینی می‌کنی؟', [__cs({ said: ['plan'], plan: { text: 'از شنبه هفته‌ای سه بار باشگاه می‌رم، اولین جلسه شنبه ساعت ۶ عصر', when: o.sat } })]);
      await __say('فکر می‌کنم جلسه‌ی اول خسته می‌شم ولی می‌رم، هفتاد درصد مطمئنم. امروز هم ۴۰ دقیقه پیاده‌روی رفتم.', 'شنبه می‌بینیم.', [__cs({ ans: ['e1'] })]);
      const n0 = __sysLines().length; o.ok = await __edit(__um(0), 'آموختم که مهمونی‌ها حلقه‌ی ضعیفم بودن نه خود رژیم. برای نیمه‌ی دوم: از یکشنبه هفته‌ای سه بار باشگاه می‌رم، اولین جلسه یکشنبه ساعت ۶ عصر.');
      o.l = __sysLines().slice(n0); o.pend = __pend(); o.pl = __pl(); o.dl = __dl(); return o; });
    X('B27·D10 s19 p11: ✏️ «شنبه ⇐ یکشنبه» ⇒ شنبهٔ قدیم بی «آره» ِ او ثبت نمی‌شود؛ یکشنبه یک بار پرسیده می‌شود', r.ok && r.pl.every(q => q.when !== r.sat) && !r.dl.some(x => x.date === r.sat) && !r.l.some(x => /ثبت شد/.test(x)) && r.pend.filter(x => x.date === r.sun).length === 1 && !r.pend.some(x => x.date === r.sat), r);
    /* s34 p4 (گفت‌وگو): «نه ببخشید، اشتباه گفتم: فردا صبح کلاس دارم. منظورم پس‌فردا صبح بود» ⇒ فردا ثبت نمی‌شود؛ پس‌فردا پرسیده می‌شود */
    await fresh(1);
    r = await E(async () => { const o = { tom: APP.addDays(APP.today(), 1), d2: APP.addDays(APP.today(), 2) };
      await __say('فردا صبح ۲۰ دقیقه یه اسکیس دستی از زمینِ پروژه می‌زنم.', 'خوب است.', [__cs({ ph: 'p', said: ['plan'], plan: { text: 'فردا صبح ۲۰ دقیقه یه اسکیس دستی از زمینِ پروژه می‌زنم', when: o.tom } })]);
      const n0 = __sysLines().length;
      await __say('نه ببخشید، اشتباه گفتم: فردا صبح کلاس دارم. منظورم پس‌فردا صبح بود، همون ۲۰ دقیقه.', 'اصلاحت را به صفحه می‌دهم.', [__cs({ ph: 'p', said: ['plan'], plan: { text: 'پس‌فردا صبح بود، همون ۲۰ دقیقه', when: o.d2, same: 'pl1' }, retract: { msg: 'فردا صبح ۲۰ دقیقه', key: 'plan:pl1', what: 'plan', fix: 'پس‌فردا صبح', old: 'فردا صبح' } })]);
      o.l = __sysLines().slice(n0); o.pl = __pl(); o.pend = __pend(); o.dl = __dl(); return o; });
    X('D27-21 s34 p4: «… منظورم پس‌فردا صبح بود» ⇒ برنامه روی فردا ثبت نمی‌شود؛ پس‌فردا یک بار پرسیده می‌شود', r.pl[0].when !== r.tom && !r.dl.some(x => x.date === r.tom) && r.pend.filter(x => x.date === r.d2).length === 1 && !r.pend.some(x => x.date === r.tom), r);
    /* همانندِ منفی: ✏️ ِ متنی که روز را عوض نمی‌کند پرسشِ باز را نمی‌بندد */
    await fresh(1);
    r = await E(async () => { const o = { tom: APP.addDays(APP.today(), 1) };
      await __say('فردا تو سایت شرکت برای دورهٔ آموزشی ثبت‌نام می‌کنم.', 'خب.', [__cs({ ph: 'p', said: ['plan'], plan: { text: 'فردا تو سایت شرکت برای دورهٔ آموزشی ثبت‌نام می‌کنم', when: o.tom } })]);
      o.ok = await __edit(__um(0), 'فردا تو سایت دانشگاه برای دورهٔ آموزشی ثبت‌نام می‌کنم.'); o.pend = __pend(); return o; });
    X('C58 همانندِ منفی: ✏️ ِ «شرکت ⇐ دانشگاه» روز را عوض نمی‌کند ⇒ پرسشِ فردا باز می‌ماند', r.pend.filter(x => x.date === r.tom).length === 1, r);
  });

  /* ===== C19/C35 دوباره — شمارش، روایت، روزِ امروز، صورتِ مسئله، زمان‌بندیِ صفحه، شرط ===== */
  await section('trig', async () => {
    const one = async (dayN, msg, acts) => { await fresh(dayN); return E(async (a) => { const n0 = __sysLines().length; await __say(a.msg, 'خب.', a.acts || [__cs({})]); return { l: __sysLines().slice(n0), pend: __pend(), today: __today(), pl: __pl() }; }, { msg, acts }); };
    let r = await one(0, 'سلام، هفته‌ی بعده. هر روز دو ساعت گوشی رو کنار گذاشتم.');
    X('B27·D1 s15 p5: «سلام، هفته‌ی بعده» (روایتِ گذشتِ زمان) ⇒ پرسشِ تاریخ نیست', !r.l.some(x => /^📅/.test(x)) && r.pend.length === 0, r);
    r = await one(0, 'یه هفته گوشی رو شبا کنار می‌ذارم. ولی الان فقط دو روز موفق می‌شم.');
    X('B27·D1 oB1 s1: «ولی الان فقط دو روز موفق می‌شم» (شمارش) ⇒ پرسشِ تاریخ نیست', !r.l.some(x => /^📅/.test(x) && /دو روز/.test(x)), r);
    r = await one(0, 'دو روز دیگه پروژه رو تحویل می‌دم.');
    X('C19 همانندِ مثبت: «دو روز دیگه … تحویل می‌دم» ⇒ پرسیده می‌شود', r.pend.length === 1, r);
    r = await one(4, 'پنجشنبه‌ست. با میزهای چهارنفره دوباره شمردم: حالا هر میز یه صندلیِ خالی داره.');
    X('A27-17 s10 p9: «پنجشنبه‌ست.» در خودِ پنجشنبه (خبرِ امروز) ⇒ پرسشِ «همین امروز یا پنجشنبهٔ بعد؟» نیست', !r.l.some(x => /^📅/.test(x)) && r.pend.length === 0, r);
    r = await one(4, 'پنجشنبه با خواهرم جلسه دارم.');
    X('C19 همانندِ مثبت: «پنجشنبه … جلسه دارم» در پنجشنبه ⇒ پرسیده می‌شود (C1)', r.pend.length === 1 && r.pend[0].amb, r);
    r = await one(1, 'کلش اینه: قیمتِ ماهِ بعد رو طوری بذارم که سودِ ماهانه به ۲۰ میلیون نزدیک بشه. قیمتِ فعلیم ۸۰۰ هزاره و این ماه ۳۵ تا فروختم.');
    X('A27-15 s09 p6: «قیمتِ ماهِ بعد رو …» (صورتِ مسئله) ⇒ پرسشِ تاریخ نیست', !r.l.some(x => /^📅/.test(x)) && r.pend.length === 0, r);
    r = await one(1, 'ماهِ بعد قیمت‌ها رو عوض می‌کنم.');
    X('C19 همانندِ مثبت: «ماهِ بعد قیمت‌ها رو عوض می‌کنم» ⇒ پرسیده می‌شود', r.pend.length === 1, r);
    r = await one(2, 'یه سؤال دربارهٔ پروندهٔ تمرینم: یه روز کلاً یادم رفت، ولی موعدِ بعدی رو سه هفته بعد گذاشته. بعد از یه بار فراموشی چرا یادآورِ بعدیم سه هفته بعده؟');
    X('D27-29 s34 p17: «موعدِ بعدی رو سه هفته بعد گذاشته» (زمان‌بندیِ صفحه) ⇒ پرسشِ تاریخ نیست', !r.l.some(x => /^📅/.test(x)) && r.pend.length === 0, r);
    r = await one(2, 'سه هفته بعد دوباره امتحان می‌دم.');
    X('C19 همانندِ مثبت: «سه هفته بعد دوباره امتحان می‌دم» ⇒ پرسیده می‌شود', r.pend.length === 1, r);
    r = await one(1, 'کلِ برنامه را جابه‌جا می‌کردیم! پس اگر اولی را زودتر شروع کنم، همان ۶ و نیم که بیدار می‌شوم: ۶ و نیم صبح، ۲ و نیم بعدازظهر، ۱۰ و نیم شب — هر سه بیدارم.', [__CS({ ph: 'p', said: ['plan'], plan: { text: 'اگر اولی را زودتر شروع کنم، همان ۶ و نیم که بیدار می‌شوم: ۶ و نیم صبح، ۲ و نیم بعدازظهر، ۱۰ و نیم شب' } })]);
    X('A27-20 aA3 p4: «اگر اولی را زودتر شروع کنم…» (شرط) ⇒ نه 📌 در «امروز»، نه برنامه (C35)', r.pl.length === 0 && !r.today.some(x => /اگر اولی/.test(x)), r);
    r = await one(1, 'دومی! اگه با یه سنسور نشه چند ساعت زودتر پیش‌بینی کرد، کلِ ایده می‌خوابه. سومی هم مهمه ولی بعدش.', [__CS({ ph: 'p', said: ['d', 'plan'], plan: { text: 'دومی! اگه با یه سنسور نشه چند ساعت زودتر پیش‌بینی کرد، کلِ ایده می‌خوابه' } })]);
    X('C27-27 tC1 p3: «دومی! اگه … نشه …، کلِ ایده می‌خوابه» ⇒ «📌 قولِ بی‌تاریخ» نمی‌شود (C35)', r.pl.length === 0 && !r.today.some(x => /قولِ بی‌تاریخ/.test(x)), r);
    r = await one(1, 'همین هفته نمونهٔ اول رو با یه سنسور می‌سازم.', [__CS({ ph: 'p', said: ['plan'], plan: { text: 'همین هفته نمونهٔ اول رو با یه سنسور می‌سازم' } })]);
    X('C35 همانندِ مثبت: برنامهٔ بی‌شرط ثبت می‌شود', r.pl.length === 1, r);
  });

  /* ===== C50 — تاریخِ نوشته و تاریخ‌های اصطلاحی ===== */
  await section('idiom', async () => {
    await fresh(1);
    let r = await E(async () => { const o = { d: APP.PR.parseWhen('۱۴۰۵/۹/۱۵') }; const n0 = __sysLines().length;
      await __say('قبضِ بعدی ۱۴۰۵/۹/۱۵ میاد. دیشب بازی ۳-۲ شد و بخاری تا ۱۰:۳۰ روشن موند.', 'تاریخِ قبضِ بعدی را می‌گذارم.', [{ do: 'deadline', what: 'قبضِ بعدیِ برق', date: o.d }, __cs({})]);
      o.l = __sysLines().slice(n0); return o; });
    X('D27-4 arD1 p9: «۱۴۰۵/۹/۱۵» در حرفِ خودش ⇒ پرسش «از حرفِ خودت» است، نه «در حرفِ خودت تاریخی نخواندم»', r.l.some(x => /^📅/.test(x)) && !r.l.some(x => /تاریخی نخواندم/.test(x)), r);
    /* «سرِ برج» = یکمِ ماهِ شمسیِ بعد؛ «آخرِ سال» = آخرین روزِ اسفندِ همین سال؛ «عید» = ۱ فروردین؛ «بعد از عید» ⇒ کدام روز؟ */
    r = await E(() => { const t = APP.today(); const o = {}; let first = ''; for (let k = 1; k < 40; k++) { const d = APP.addDays(t, k); if (/^۱ /.test(APP.fdate(d))) { first = d; break; } } o.first = first;
      let farv = ''; for (let k = 1; k < 400; k++) { const d = APP.addDays(t, k); if (/^۱ فروردین/.test(APP.fdate(d))) { farv = d; break; } } o.farv = farv; o.esf = APP.addDays(farv, -1);
      o.w1 = APP.PR.whenInfo('قسطِ آخر رو سرِ برج میدم'); o.w2 = APP.PR.whenInfo('بقیهٔ پول رو تا آخرِ سال میدم'); o.w3 = APP.PR.whenInfo('عید میرم شیراز'); o.w4 = APP.PR.whenInfo('نصبِ چراغ بمونه برای بعد از عید');
      o.n1 = APP.PR.whenInfo('سرِ برجِ پیش اجاره رو دادم'); return o; });
    X('C50 «سرِ برج» = یکمِ ماهِ شمسیِ بعد', r.w1 && r.w1.date === r.first && !r.w1.amb, r);
    X('C50 «آخرِ سال» = آخرین روزِ اسفندِ همین سال', r.w2 && r.w2.date === r.esf && !r.w2.amb, r);
    X('C50 «عید» = ۱ فروردین', r.w3 && r.w3.date === r.farv && !r.w3.amb, r);
    X('C50 «بعد از عید» ⇒ روزِ معین نیست: پرسشِ «کدام روز؟» با لنگرِ ۱ فروردین', r.w4 && r.w4.free && r.w4.date === r.farv, r);
    await fresh(1);
    r = await E(async () => { const o = {}; const n0 = __sysLines().length;
      await __say('قسطِ آخرِ حصار رو سرِ برج میدم، بقیهٔ پول رو تا آخرِ سال، و نصبِ چراغ بمونه برای بعد از عید.', 'تاریخ‌ها را صفحه زیرِ همین پیام از خودت می‌پرسد.', [__cs({})]);
      o.l = __sysLines().slice(n0); o.pend = __pend(); o.dq = __dq();
      await __say('باشه', 'خوب.', [__cs({})]); o.dl = __dl(); o.pend2 = __pend(); o.dq2 = __dq(); return o; });
    X('D27-32 arD2 p10: سه موعدِ اصطلاحی ⇒ یک پرسش با سه قلم («سرِ برج»، «آخرِ سال»، «بعد از عید — کدام روز؟»)', r.l.filter(x => /^📅/.test(x)).length === 1 && r.pend.length === 3 && r.pend.filter(x => x.free).length === 1, r);
    X('D27-32 arD2 p11: «باشه» دو روزِ معین را ثبت می‌کند و «بعد از عید» را — که روز ندارد — ثبت نمی‌کند و همچنان «کدام روز؟» می‌پرسد', r.dl.length === 2 && r.pend2.length === 1 && r.pend2[0].free && r.dq2.length === 1, r);
    r = await E(async () => { const o = { d: '' }; for (let k = 1; k < 400; k++) { const d = APP.addDays(APP.today(), k); if (/^۵ فروردین/.test(APP.fdate(d))) { o.d = d; break; } }
      await __say('۵ فروردین.', 'باشه.', [__cs({})]); o.dl = __dl(); o.pend = __pend(); return o; });
    X('C50 «بعد از عید» ⇐ «۵ فروردین» ⇒ همان روز ثبت می‌شود', r.dl.some(x => x.date === r.d) && r.pend.length === 0, r);
    r = await E(() => ({ n1: APP.PR.whenInfo('سرِ برجِ پیش اجاره رو دادم'), h: APP.PR.herDates('سرِ برجِ پیش اجاره رو دادم') }));
    X('C50 همانندِ منفی: «سرِ برجِ پیش … دادم» (گذشته) ⇒ پرسیده نمی‌شود', r.h.length === 0, r);
  });

  /* ===== C52 — یک تعهد، یک سطر: ⏰ ِ پیگیری به 📌 ِ همان برنامه می‌چسبد ===== */
  await section('one', async () => {
    await fresh(1);
    const r = await E(async () => { const o = { sat: __nextDow(6) };
      await __say('شنبه هم منبعِ اون خبرِ خواب رو پیدا می‌کنم.', 'پیگیری‌اش می‌تواند همان روز در «امروز» بیاید.', [__cs({ ph: 'p', said: ['plan'], plan: { text: 'شنبه هم منبعِ اون خبرِ خواب رو پیدا می‌کنم', when: o.sat } })]);
      const n0 = __sysLines().length;
      await __say('باشه', 'پیگیری را برای شنبه می‌گذارم.', [{ do: 'deadline', what: 'پیگیری: پیدا کردنِ منبعِ خبرِ خواب', date: o.sat }, __cs({ ph: 'p' })]);
      o.l = __sysLines().slice(n0); o.pl = __pl(); o.dl = __dl(); o.rows = APP.dueList().filter(d => /منبع/.test((d.txt || '') + (d.sub || ''))).map(d => d.txt);
      for (let k = 0; k < 6; k++) { /* روزِ خودِ شنبه */ }
      return o; });
    await day(6);
    const r2 = await E(() => ({ rows: APP.dueList().filter(d => /منبع/.test((d.txt || '') + (d.sub || ''))).map(d => d.txt) }));
    X('C27-17 / U50 pwC2 p21: «باشه» ⇒ یک برنامه با پیگیریِ چسبیده؛ روزِ شنبه در «امروز» یک سطر، نه 📌 و ⏰ ِ جدا', r.pl[0].when === r.sat && r.dl.filter(x => !x.done).length <= 1 && r.l.filter(x => /ثبت شد/.test(x)).length === 1 && !r.l.some(x => /ثبت شد[^]*⏰/.test(x) && !/📌/.test(x)) && r.rows.length <= 1 && r2.rows.length === 1, { r, r2 });
  });

  await b.close();
  const R = Object.values(info.runners);
  console.log(JSON.stringify({ runners: R.length, runnersOk: R.filter(Boolean).length, red: Object.keys(info.runners).filter(k => !info.runners[k]).length }));
  if (process.env.NAMES) console.log('GREEN:\n' + Object.keys(info.runners).filter(k => info.runners[k]).join('\n'));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS — test_tour1_r27_dates');
})();
