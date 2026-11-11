// تورِ پولیا (دستهٔ ۱، دورِ ۲۵ — سهمِ «today» — ۲۰۲۶-۱۱-۱۱) — DECISIONS_R25: P7 «امروز، پرونده، کارتِ ذهن، پیش‌بینی‌ها» + روشن‌سازی‌های C1 و C12.
//  جمله‌های خودِ اجراکننده‌ها (round25{A,B,C,D,B_s})، هر کدام قرمز روی ساختِ پایه (eeb11d1f):
//   A25-14 (oA1 p24: یک پیش‌بینی دو 🎯؛ «پس پیش‌بینیم غلط بود» هنوز در «امروز») · A25-15 (oA1: موعدِ «تا جمعه» از برنامهٔ بی‌ربط) · C22-11 STILL (s21، s28؛ s24 با دلیلِ خودش)
//   A23-8 (pwA1، pA2: حدسِ آزموده «آزموده نشده»؛ نقطه‌های هم‌نام) · D25-22 (aD1: «اسم مدرسمون هم شهید بهشتیه») · C25-17 (aC1: «معمای امروز را جواب داده‌ای» بی معما)
//   B24·D18 (aB4: «نتیجه (از گفت‌وگو)» ×۳) · A25-21 (s09 p17: دلیلِ اصلاحِ موعد = مقدارِ پیشین) · B_s·D7 = U15 (برنامه با موعدِ ساختگیِ «هفت روز بعد») · A23-25 (s06: گیر از «آره ثبتش کن.»)
//   A21-11 (s05: ردیفِ T24 «— (اندازه‌ای نیست)») · A23-26 («تا تا ریشه»)
//  و بانکِ مستقلِ VARIANTS_R25 (tests/variants/VARIANTS_R25.json، P7 = #216–#241).
//  هیچ تاریخی در انتظارها نوشته نشده: همه از ساعتِ یخ‌زدهٔ T0 حساب می‌شوند.
// LLA_FILE = ساختِ دیگر (قرمزِ اول)؛ ONLY=pred,dates …
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = path.join(__dirname, 'variants', 'VARIANTS_R25.json');
const BANK = fs.existsSync(BANKF) ? JSON.parse(fs.readFileSync(BANKF, 'utf8')) : [];
const P7 = BANK.map((x, i) => Object.assign({ n: i + 1 }, x)).filter(x => /^P7\./.test(x.rc));

const csPlan = (t) => ({ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical', plan: { text: t } });
const T0 = Date.parse('2026-10-18T10:00:00+03:30');   // یکشنبه — روزهای هفته از همین حساب می‌شوند

const HELPERS = () => {
  const S = APP.S;
  APP.S.loaded = true; window.__noNav = true;
  window.__q = []; window.__sys = [];
  APP.callAI = async (sys, user, opts) => { __sys.push(String(sys || '') + '\n' + String(user || '')); let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  window.__say = async (text, reply, actions, more) => { __sys.length = 0; __q.push({ reply: reply || 'باشه.', status: 'related', memory: 'm', actions: actions || [] }); (more || []).forEach(m => __q.push(m)); await APP.ASSIST.send(text); __q.length = 0; return __sys.join('\n'); };
  window.__cur = () => APP.ASSIST.cur ? APP.ASSIST.cur() : APP.S.get(localStorage.getItem('lla.assist.cur'));
  window.__freshChat = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); return APP.ASSIST.newSession().id; };
  window.__wipe = () => { ['practice', 'ex', 'fcast', 'kexp', 'case', 'card', 'sched', 'pr', 'topic', 'knot', 'kcase', 'eprob', 'eprog', 'achat', 'deadline', 'lprob', 'psyans'].forEach(t => { try { S.all(t).forEach(r => S.del(r.id)); } catch (e) { } }); localStorage.removeItem('lla.assist.cur'); APP.go('home'); };
  window.__today = () => APP.dueList().map(d => (d.txt || '') + ' ‖ ' + (d.sub || ''));
  window.__cs = (o) => Object.assign({ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
  window.__g = () => ((__cur().coach || {}).guesses || []).map(g => ({ text: g.text, res: g.res || '', from: g.resFrom || '', ground: (g.ground || {}).from || '' }));
  window.__sysLines = () => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text);
  window.__fc = () => APP.S.all('fcast').map(f => ({ q: f.q, p: f.p, due: f.due, out: f.outcome || '', prc: f.prc || '' }));
  window.__dl = () => APP.S.all('deadline').map(d => ({ what: d.what, date: d.date, done: !!d.done }));
  window.__birth = (v) => { const st = APP.S.settings(); st.profile = st.profile || {}; if (v) st.profile.birth = v; else delete st.profile.birth; delete st.profile.ageSaid; delete st.profile.birthMD; APP.S.saveSettings(st); };
  window.__dos = (sid) => { const D = APP.dossierSess(sid || __cur().id); return (D.events || []).map(e => ({ k: e.k, title: e.title, lines: e.lines || [], out: e.out || '', src: e.src && e.src.text || '' })); };
  window.__wd = (d) => { const p = d.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).getDay(); };
  /* نخستین روزِ هفتهٔ dow پس از امروز (۱ تا ۷ روز بعد) */
  window.__nextDow = (dow) => { const t = APP.today(); let k = (dow - __wd(t) + 7) % 7; if (!k) k = 7; return APP.addDays(t, k); };
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
  const fresh = async () => { await day(0); await E(() => { __wipe(); __birth(''); }); };
  const X = (name, ok, x) => { info.runners[name] = !!ok; if (!ok) errors.push(name + ' :: ' + JSON.stringify(x).slice(0, 1500)); };
  const BK = (n, ok, x) => { info.bank[n] = !!ok; if (!ok) errors.push('bank #' + n + ' :: ' + JSON.stringify(x).slice(0, 1300)); };
  await load();

  /* ===== A25-14 / A25-15 (oA1) + بانک #216–#219، #230، #231، #241 — یک پیش‌بینی، یک 🎯؛ داوری‌شده از «امروز» می‌رود ===== */
  await section('pred', async () => {
    await fresh();
    /* oA1: پیش‌بینیِ ۷۰٪ ِ بی‌موعد که خودش «غلط بود» گفت؛ پروندهٔ T24؛ پیش‌بینیِ ۴۰٪ «تا جمعه» با نقلِ مدل که «تا جمعه» را انداخته و برنامهٔ بی‌ربطِ بازِ همان سشن */
    const a = await E(async () => { __freshChat(); const o = { fri: __nextDow(5) };
      await __say('پیش‌بینیم: گزارشِ مالیشون باثباته، حدودِ ۷۰٪ مطمئنم. تا یکشنبه با اون دو نفر حرف می‌زنم و گزارش رو می‌خونم، بعد برمی‌گردم.', 'خوبه.', [__cs({ guess: { text: 'گزارشِ مالیشون باثباته، حدودِ ۷۰٪ مطمئنم' } })]);
      await __say('برگشتم. با هر دو نفر حرف زدم و گزارش رو خوندم: دو فصلِ آخر زیان دادن و یکیشون گفت تیمش نصف شده. پس پیش‌بینیم غلط بود.', 'پس رد شد.', [__cs({})]);
      o.preds1 = (__cur().coach.preds || []).map(x => x.text); o.fc1 = __fc();
      /* برنامهٔ بازِ بی‌ربط با روزِ امروز — پیش‌تر موعدِ پیش‌بینیِ بعدی همین می‌شد (روزِ نوشتن) */
      const s = __cur(); s.plans = (s.plans || []).concat([{ id: 'plX', text: 'پنج‌شنبه رسماً جواب می‌دم', when: APP.today(), at: 'x', d: APP.today(), done: false, state: 'open', sess: s.id }]); APP.S.put(s);
      await __say('می‌خوام این عادت رو که «قبل از هر تصمیم پیش‌بینی با درصد بنویسم و بعد بسنجم» واقعاً جا بندازم. اگه هست، برام بازش کن.', 'باز کردم.', [__cs({}), { do: 'start_practice', tid: 24, consent: { quote: 'برام بازش کن', kind: 'request' } }]);
      o.cases = APP.PR.cases().length;
      await __say('پیش‌بینیم: تا جمعه مدیرم برای موندنم یه پیشنهادِ ترفیع می‌ده — ۴۰٪ مطمئنم.', 'ثبت شد.', [__cs({ guess: { text: 'مدیرم برای موندنم یه پیشنهادِ ترفیع می‌ده' } })]);
      o.fc2 = __fc(); o.today0 = __today().filter(x => /🎯/.test(x));
      return o; });
    const f70 = a.fc1.filter(f => f.p === 70), f40 = a.fc2.filter(f => f.p === 40);
    X('A25-14 oA1 p18: «پس پیش‌بینیم غلط بود» ⇒ همان پیش‌بینیِ ۷۰٪ «نشد» می‌شود (یک 🎯)، پیش‌بینیِ تازه ساخته نمی‌شود', a.preds1.length === 1 && f70.length === 1 && f70[0].out === 'نشد' && a.fc1.length === 1, a);
    X('A25-15 oA1: موعدِ «تا جمعه» = نخستین جمعهٔ پس از امروز (از جملهٔ خودش)، نه روزِ برنامهٔ بی‌ربط', a.cases === 1 && f40.length === 1 && f40[0].due === a.fri && !a.today0.length, a);
    await day(5);
    const c = await E(async () => { const o = { before: __today().filter(x => /🎯/.test(x)) };
      await __say('جمعه شد: دیروز مدیرم پیشنهادِ ترفیع داد. پس اون پیش‌بینیِ ۴۰ درصدیم درست درومد — هرچند فکر می‌کردم بعیده.', 'آفرین.', [__cs({}), { do: 'practice_log', tid: 24, ok: true, what: 'داوریِ پیش‌بینیِ ترفیع تا جمعه (۴۰٪): شد', quote: 'اون پیش‌بینیِ ۴۰ درصدیم درست درومد' }]);
      o.sys = __sysLines().slice(-1); o.fc = __fc(); o.after = __today().filter(x => /🎯/.test(x)); o.cal = APP.PR.calib ? APP.PR.calib() : null;
      o.dos = __dos().filter(e => /پیش‌بینی/.test(e.title)).map(e => e.lines[0] + ' ⇒ ' + e.out);
      /* روزِ بعد همان را دوباره در پرونده داوری می‌کند (بانک #218) */
      return o; });
    const g40 = c.fc.filter(f => f.p === 40);
    X('A25-14 oA1 p24: داوری با practice_log همان 🎯 را می‌بندد — «🎯 تازه» ساخته نمی‌شود و «امروز» دیگر «شد یا نشد؟» نمی‌پرسد', c.before.length === 1 && /۱ پیش‌بینی|به موعد رسید/.test(c.before[0]) && c.fc.length === 2 && g40.length === 1 && g40[0].out === 'شد' && !!g40[0].prc && !/🎯 تازه/.test(c.sys.join(' ')) && !c.after.length, c);
    BK(216, c.fc.length === 2 && g40.length === 1 && g40[0].out === 'شد' && !c.after.length, c);
    BK(241, c.dos.length >= 2 && c.dos.some(x => /شد/.test(x)) && c.fc.every(f => f.out), c);
    await day(6);
    const d = await E(async () => { await __say('اون پیش‌بینیِ ۴۰ درصدیم شد، اینم تو پرونده‌م بزن.', 'باشه.', [__cs({}), { do: 'practice_log', tid: 24, ok: true, what: 'پیش‌بینیِ ترفیع (۴۰٪): شد', quote: 'اون پیش‌بینیِ ۴۰ درصدیم شد' }]);
      return { fc: __fc(), sys: __sysLines().slice(-1) }; });
    BK(218, d.fc.length === 2 && d.fc.filter(f => f.p === 40).length === 1 && !/🎯 تازه/.test(d.sys.join(' ')), d);
    /* بانک #217: پیش‌بینیِ ۷۰٪ ِ موعدرسیده، داوری در گفت‌وگو با عددِ واژه‌ای */
    await fresh();
    const e = await E(async () => { __freshChat(); const o = {};
      await __say('پیش‌بینیم: تا فردا جوابِ آزمایش میاد، ۷۰ درصد مطمئنم.', 'ثبت شد.', [__cs({})]); o.fc0 = __fc(); return o; });
    await day(2);
    const e2 = await E(async () => { const o = { before: __today().filter(x => /🎯/.test(x)) };
      await __say('اون پیش‌بینیِ هفتاد درصدیم غلط از آب دراومد، نشد', 'باشه.', [__cs({})]);
      o.fc = __fc(); o.after = __today().filter(x => /🎯/.test(x)); o.dos = __dos().filter(x => /پیش‌بینی/.test(x.title)).map(x => x.out); return o; });
    BK(217, e.fc0.length === 1 && e2.before.length === 1 && e2.fc.length === 1 && e2.fc[0].out === 'نشد' && !e2.after.length && e2.dos.some(x => /نشد/.test(x)), { e, e2 });
    /* بانک #219 / #231: بی واژهٔ «پیش‌بینی»، با اطمینانِ خودش؛ تا خودش داوری نکند در «امروز» می‌ماند */
    await fresh();
    const h = await E(async () => { __freshChat(); const o = { fri: __nextDow(5), t0: APP.today() };
      await __say('تا جمعه معلوم میشه قبولم کردن یا نه، ۵۵ درصد احتمال میدم', 'باشه.', [__cs({})]); o.fc = __fc(); o.today0 = __today().filter(x => /🎯/.test(x)); return o; });
    await day(5); const h5 = await E(() => __today().filter(x => /🎯/.test(x)));
    await day(8); const h8 = await E(() => __today().filter(x => /🎯/.test(x)));
    BK(219, h.fc.length === 1 && h.fc[0].due === h.fri && h.fc[0].due !== h.t0 && h.fc[0].p === 55 && !h.today0.length && h5.length === 1, { h, h5 });
    BK(231, h8.length === 1, h8);
    /* بانک #230: دو پیش‌بینیِ جدا در یک پیام ⇒ دو 🎯 */
    await fresh();
    const m2 = await E(async () => { __freshChat(); await __say('دو تا پیش‌بینی دارم: تا جمعه جوابِ وام میاد (۶۰٪)، و تا فردا خونه رو می‌فروشیم (۳۰٪)', 'باشه.', [__cs({})]); return __fc(); });
    BK(230, m2.length === 2 && m2.some(f => f.p === 60) && m2.some(f => f.p === 30), m2);
  });

  /* ===== C1 / C12 / B_s·D7 + بانک #220، #228، #229، #232، #233، #240 — تاریخِ خودش، با «آره» ِ خودش ===== */
  await section('dates', async () => {
    const ask = async (d0, msgs, acts) => { await day(d0); return E(async ([msgs, acts]) => { __wipe(); __freshChat(); const o = { t0: APP.today() };
      for (let i = 0; i < msgs.length; i++) await __say(msgs[i], 'باشه.', (acts && acts[i]) || [__cs({})]);
      o.sys = __sysLines(); o.fc = __fc(); o.dl = __dl(); o.plans = (__cur().plans || []).map(q => ({ t: q.text, when: q.when })); o.due = __today(); o.pend = (__cur().datePend || {}).state || ''; return o; }, [msgs, acts || null]); };
    await fresh();
    /* C1: «تا جمعه» در خودِ جمعه — صفحه حدس نمی‌زند */
    const c1 = await ask(5, ['پیش‌بینیم: تا جمعه مدیرم پیشنهادِ ترفیع می‌ده — ۴۰٪ مطمئنم.']);
    X('C1: «تا جمعه» در خودِ جمعه ⇒ 🎯 ساخته نمی‌شود؛ صفحه یک بار می‌پرسد «همین امروز یا جمعهٔ بعد؟»', !c1.fc.length && c1.sys.some(x => /همین امروز یا جمعهٔ بعد/.test(x)) && c1.pend === 'open', c1);
    const c1a = await ask(5, ['پیش‌بینیم: تا جمعه مدیرم پیشنهادِ ترفیع می‌ده — ۴۰٪ مطمئنم.', 'جمعهٔ بعد']);
    const c1b = await ask(5, ['پیش‌بینیم: تا جمعه مدیرم پیشنهادِ ترفیع می‌ده — ۴۰٪ مطمئنم.', 'همین امروز']);
    const c1c = await ask(5, ['پیش‌بینیم: تا جمعه مدیرم پیشنهادِ ترفیع می‌ده — ۴۰٪ مطمئنم.', 'یه چیزِ دیگه بپرسم؟', 'جمعهٔ بعد']);
    const plus = (o, n) => new Date(Date.parse(o.t0 + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);
    X('C1: پاسخِ خودش ثبت می‌شود — «جمعهٔ بعد» ⇒ هفت روز بعد؛ «همین امروز» ⇒ امروز؛ پرسش فقط یک بار (بی جواب ⇒ کنار می‌رود)',
      c1a.fc.length === 1 && c1a.fc[0].due === plus(c1a, 7) && c1b.fc.length === 1 && c1b.fc[0].due === c1b.t0 && !c1c.fc.length && c1c.sys.filter(x => /همین امروز یا/.test(x)).length === 1, { c1a, c1b, c1c });
    /* بانک #220 */
    const b220 = await ask(0, ['تا پنجشنبه تمومش می‌کنم']);
    const b220y = await ask(0, ['تا پنجشنبه تمومش می‌کنم', 'آره']);
    const thu = await E(() => __nextDow(4));
    BK(220, !b220.dl.length && b220.sys.some(x => /درست است؟/.test(x) && /پنجشنبه/.test(x) && !/20\d\d-\d\d/.test(x)) && b220y.dl.length === 1 && b220y.dl[0].date === thu && thu !== b220y.t0 && thu !== plus(b220y, 7), { b220, b220y, thu });
    X('C12: تاریخِ خودش فقط با «آره» ِ خودش ثبت می‌شود؛ «نه» ⇒ هیچ', (await ask(0, ['فردا امتحان دارم', 'نه، پس‌فرداست'])).dl.length === 0, {});
    /* بانک #228 */
    const b228 = await ask(0, ['سه‌شنبه به دکتر زنگ می‌زنم و ۱۴ اسفند هم نوبتِ آزمایش دارم', 'آره درسته']);
    const tue = await E(() => __nextDow(2)), esf = await E(() => APP.PR.parseWhen('۱۴ اسفند'));
    BK(228, b228.dl.length === 2 && b228.dl.some(d => d.date === tue) && b228.dl.some(d => d.date === esf) && esf > b228.t0 && !b228.plans.some(q => q.when === plus(b228, 7)) && b228.due.some(x => /دکتر/.test(x)) && !b228.due.some(x => /📌/.test(x)), { b228, tue, esf });
    await day(2); const b228t = await E(() => __today()); BK('228b', b228t.some(x => /دکتر/.test(x) && /موعد: امروز/.test(x)), b228t);
    /* بانک #229 */
    const b229 = await ask(0, ['یه هفته دیگه دوباره وزن می‌کنم', 'بله']);
    BK(229, b229.dl.length === 1 && b229.dl[0].date === plus(b229, 7) && b229.due.some(x => /وزن/.test(x) && /[۰-۹]+ (?:مهر|آبان)/.test(x)), b229);
    /* بانک #232: «جمعهٔ هفتهٔ بعد» = جمعهٔ هفتهٔ (شنبه تا جمعه) پس از هفتهٔ امروز */
    const b232 = await ask(0, ['جمعهٔ هفتهٔ بعد جواب میدم', 'آره']);
    const want232 = await E(() => { const t = APP.today(), sat = APP.addDays(t, 7 - ((__wd(t) + 1) % 7)); return { d: APP.addDays(sat, 6), near: __nextDow(5) }; });
    BK(232, b232.dl.length === 1 && b232.dl[0].date === want232.d && want232.d !== want232.near, { b232, want232 });
    /* بانک #233 / #240 */
    const b233 = await ask(0, ['جمعه‌ها معمولاً کوه میرم']);
    BK(233, !b233.dl.length && !b233.fc.length && !b233.sys.length && !b233.due.some(x => /کوه/.test(x)), b233);
    const b240 = await ask(0, ['یه روزی شروعش می‌کنم'], [[csPlan('یه روزی شروعش می‌کنم')]]);
    BK(240, !b240.dl.length && !b240.plans.some(q => /^\d{4}-/.test(q.when)) && !b240.due.some(x => /موعد: [۰-۹]/.test(x) && /شروعش/.test(x)), b240);
    /* B_s·D7 = U15: برنامهٔ بی‌زمان تاریخِ ساختگی نمی‌گیرد؛ برنامهٔ زمان‌دار همان روزِ خودش را */
    const u15 = await ask(0, ['با مدیرم حرف می‌زنم که ببینم دورکاری می‌شه یا نه', 'پنجشنبه با مدیرم دربارهٔ دورکاری حرف می‌زنم'], [[csPlan('با مدیرم حرف می‌زنم که ببینم دورکاری می‌شه یا نه')], [csPlan('پنجشنبه با مدیرم دربارهٔ دورکاری حرف می‌زنم')]]);
    X('B_s·D7 pwB2: برنامهٔ بی‌زمان ⇒ «جلسهٔ بعد» (نه «هفت روز بعد» ِ ساختگی)؛ برنامهٔ «پنجشنبه …» ⇒ همان پنجشنبه', u15.plans.length === 2 && u15.plans[0].when === 'next-session' && u15.plans[1].when === thu && !u15.plans.some(q => q.when === plus(u15, 7)), u15);
  });

  /* ===== C22-11 STILL / A23-8 + بانک #221، #222، #234 — سرانجامِ حدس به حرفِ خودش ===== */
  await section('guess', async () => {
    await fresh();
    const g = await E(async () => { const o = {}; const G = (t) => __cs({ guess: { text: t } });
      __freshChat();
      await __say('شاه سفید f6، وزیر سفید d1، رخ سفید a1 گوشه، شاه سیاه f8. معمولاً اول همه‌ی کیش‌ها رو امتحان می‌کنم: وزیر d8 کیش، وزیر d7 کیش، رخ a8 کیش. هر دفعه شاه میره e8 یا g8. اون رخ گوشه به نظرم بی‌فایده‌ست، فقط تزئینیه. می‌خوام خودم حلش کنم، جوابو نگو. بیا تو سامانه ثبتش کنیم.', 'باشه.', [G('اون رخ گوشه به نظرم بی‌فایده‌ست، فقط تزئینیه')]);
      await __say('کیش با وزیر d7 رو ثبت کردم، شاه میره g8. گیر کردم. هیچ کیشی جواب نمیده. رخ هم که به درد نمی‌خوره.', 'از آخر فکر کن.', [__cs({ stuck: true })]); o.s21mid = __g();
      await __say('آها! از آخر فکر کردم: مات چه شکلیه؟ اگه شاه سیاه g8 باشه و رخ بره a8، ردیف هشتم بسته میشه؛ اگه ردیف هفتم هم بسته باشه مات میشه. پس اول وزیر d7 بدون کیش... نه صبر کن، وزیر d7 کیشه. پس اول وزیر یه جای آروم که ردیف هفتم رو بگیره، مثلاً وزیر d7 نه، وزیر b7! اونوقت شاه سیاه فقط e8 یا g8 داره و رخ a8 مات. رخ اصلاً بی‌فایده نبود!', 'آفرین.', [__cs({})]);
      o.s21 = __g(); o.s21dos = __dos().filter(e => e.k === 'guess').map(e => e.out);
      __freshChat();
      await __say('این معما رو برای همکارام گذاشتم: «یه نفر دو بچه داره، حداقل یکیشون پسره. احتمال این‌که هر دو پسر باشن؟» معلومه ۱/۲ دیگه. همکارم میگه ۱/۳. بهش بگو اشتباه می‌کنه.', 'چرا ۱/۲؟', [G('معلومه ۱/۲ دیگه')]);
      await __say('فهرست کردم: پپ، پد، دپ، دد. با حداقل یه پسر سه تا می‌مونه: پپ، پد، دپ. فقط یکیش دوپسره... یعنی ۱/۳! همکارم راست می‌گفت. واقعاً خجالت کشیدم، جلوی همه گفته بودم ۱/۲.', 'خوب دیدی.', [__cs({})]);
      await __say('جلسه دوم: نسخه‌ی سه‌شنبه رو آوردم. این بار با احتیاط: فهرست کردم ۱۴×۱۴ حالت، با حداقل یه پسرِ سه‌شنبه ۲۷ حالت، دوپسر ۱۳ تا ⇒ ۱۳/۲۷. فکر کنم درسته.', 'خوب.', [G('۱۳/۲۷')]);
      o.s28 = __g();
      __freshChat();
      await __say('جلسه دوم. این مسئله‌ی کاشی‌کاری دقیقاً همون مسئله‌ی پله‌هاست! هر پله یه خونه‌ی نوار، هر گام یه کاشی. پس جوابش همون رابطه‌ست: a_n = a_(n−1) + a_(n−2) + a_(n−3) با a_1 = 1، a_2 = 2، a_3 = 4.', 'چطور می‌آزمایی؟', [G('پس جوابش همون رابطه‌ست: a_n = a_(n−1) + a_(n−2) + a_(n−3)')]);
      o.s24 = __g(); o.s24dos = __dos().filter(e => e.k === 'guess').map(e => e.out);
      __freshChat();
      await __say('از راهِ دیگه: حدس می‌زنم توانِ ۲ در n! دقیقاً برابرِ n منهای تعدادِ یک‌های n در مبنای ۲ باشه. برای n=6: ۶ = 110 دو تا یک، ۶ − ۲ = ۴، و 6! = 720 = 16 × 45، پس توان ۴ ✓. برای n=5: 101 دو تا یک، ۳؛ و 5! = 120 = 8 × 15 ✓. اگه درست باشه، چون n دست‌کم یه یک داره، توان ≤ n − 1 < n.', 'خوب.', [G('توانِ ۲ در n! دقیقاً برابرِ n منهای تعدادِ یک‌های n در مبنای ۲ باشه')]);
      o.pwA1 = __g();
      __freshChat();
      await __say('خب ۲۵٪ اضافه کردم، ۲۵٪ هم کم می‌کنم، پس برمی‌گرده همون یک میلیون دیگه. خرید هم شده ۷۰۰ به‌علاوهٔ ۲۵٪ … یعنی ۷۲۵؟ نه… راستش وقتی دو تا درصد پشتِ سرِ هم میاد گیج میشم، کلاً با درصد خنگم. سودم چقدر میشه؟', 'با ۱۰۰ تومن امتحان کن.', [G('۲۵٪ اضافه کردم، ۲۵٪ هم کم می‌کنم، پس برمی‌گرده همون یک میلیون')]);
      await __say('اول فروش: یک میلیون و ۲۵۰، ۲۵٪ِ همین میشه ۳۱۲ و نیم، پس با تخفیف ۹۳۷ و نیم — به یک میلیون برنمی‌گرده. خریدِ تازه: ۲۵٪ِ ۷۰۰ میشه ۱۷۵، پس ۸۷۵ هزار.', 'خوب.', [__cs({})]);
      o.pA2 = __g();
      __freshChat();
      await __say('حدسم اینه که مشکل از کم‌خوابیه', 'چطور می‌آزمایی؟', [G('مشکل از کم‌خوابیه')]);
      await __say('باشه، یه هفته امتحانش می‌کنم.', 'خوبه.', [__cs({})]);
      await __say('یه هفته زودتر خوابیدم و هیچ فرقی نکرد، پس کم‌خوابی نبود', 'خب.', [__cs({ guess: { text: 'مشکل از کم‌خوابیه' } })]);
      o.b221 = __g(); o.b221dos = __dos().filter(e => e.k === 'guess').map(e => e.out); o.b221route = (APP.ROUTE.model(__cur().id).pts || []).filter(p => p.k === 'guess').map(p => p.title + ' — ' + p.out);
      __freshChat();
      await __say('فکر کنم با ۵ تا کاشی پر میشه', 'امتحان کن.', [G('با ۵ تا کاشی پر میشه')]);
      await __say('چیدم، با ۵ تا شد', 'خوب.', [__cs({})]); o.b222 = __g();
      __freshChat();
      await __say('حدسم اینه که مشکل از قهوه‌ست. هنوز امتحانش نکردم.', 'باشه.', [G('مشکل از قهوه‌ست')]); o.b234 = __g(); o.b234dos = __dos().filter(e => e.k === 'guess').map(e => e.out);
      return o; });
    X('C22-11 s21: «رخ اصلاً بی‌فایده نبود!» ⇒ حدسِ «رخ … بی‌فایده‌ست» رد شد (با نقلِ همان جمله)؛ «رخ هم که به درد نمی‌خوره» سرانجام نیست', !g.s21mid[0].res && g.s21[0].res === 'refuted' && /بی‌فایده نبود/.test(g.s21[0].from) && g.s21dos[0] === 'رد شد', g);
    X('C22-11 s28: «فهرست کردم … یعنی ۱/۳!» ⇒ حدسِ «۱/۲» رد؛ «فهرست کردم … ⇒ ۱۳/۲۷» ⇒ تأیید (از آزمونِ خودش در همان پیام)', g.s28[0].res === 'refuted' && /۱\/۳|فهرست/.test(g.s28[0].from) && g.s28[1].res === 'confirmed' && /فهرست کردم/.test(g.s28[1].from), g.s28);
    X('C22-11 s24: حدسی که فقط دلیلِ همان پیام را دارد «آزموده» خوانده نمی‌شود، ولی 📜 دلیلِ خودش را کنارش می‌آورد', !g.s24[0].res && /پله/.test(g.s24[0].ground) && /هنوز آزموده نشده — دلیلِ خودت/.test(g.s24dos[0]), { g: g.s24, d: g.s24dos });
    X('A23-8 pwA1: حدسی که همان پیام با «✓» آزمود ⇒ تأیید', g.pwA1[0].res === 'confirmed' && /✓/.test(g.pwA1[0].from), g.pwA1);
    X('A23-8 pA2: «به یک میلیون برنمی‌گرده» ⇒ حدسِ «برمی‌گرده همون یک میلیون» رد', g.pA2[0].res === 'refuted' && /برنمی‌گرده/.test(g.pA2[0].from), g.pA2);
    BK(221, g.b221.length === 1 && g.b221[0].res === 'refuted' && g.b221dos.length === 1 && g.b221dos[0] === 'رد شد' && g.b221route.length === 1 && /رد شد/.test(g.b221route[0]) && !/آزموده نشده/.test(g.b221route[0]), { b: g.b221, d: g.b221dos, r: g.b221route });
    BK(222, g.b222[0].res === 'confirmed', g.b222);
    BK(234, !g.b234[0].res && /^هنوز آزموده نشده$/.test(g.b234dos[0]), { g: g.b234, d: g.b234dos });
  });

  /* ===== D25-22 + بانک #223، #224، #235، #236 — نامِ مدرسه و برچسبِ کلاسِ کم‌سال در 📜 ===== */
  await section('priv', async () => {
    await fresh();
    const r = await E(async () => { const o = {}; const yr = +APP.today().slice(0, 4);
      __birth((yr - 9) + '-05-01'); __freshChat();
      await __say('سلام من کیانم کلاس سومم. معلممون این سوالو داده: تو مزرعه مرغ و گوسفند هست. روی هم ۱۰ تا سر دارن و ۲۸ تا پا. چند تا گوسفنده؟', 'خودت تا کجا رفتی؟', [__cs({})]);
      await __say('هیچی نرفتم. نمیدونم از کجا شروع کنم. تازه اسم مدرسمون هم شهید بهشتیه', 'باشه.', [__cs({ stuck: true })]);
      o.aD1 = JSON.stringify(__dos()); o.aD1txt = APP.AGE.privText('هیچی نرفتم. نمیدونم از کجا شروع کنم. تازه اسم مدرسمون هم شهید بهشتیه');
      o.b223 = APP.AGE.privText('من کلاس چهارمم، مدرسمون اسمش پروینه. یه مسئله دارم که ۱۲ تا سیب رو بین ۴ نفر تقسیم کنم');
      o.b224 = APP.AGE.privText('توی دبستانِ نرگس، کلاسِ دوم ج هستم');
      o.b236 = APP.AGE.privText('من بچهٔ کرمانم و کلاس پنجمم');
      o.keep = APP.AGE.privText('کلاسِ دوم و سوم با هم مسابقه دادن');
      __birth((yr - 40) + '-05-01');
      o.b235 = APP.AGE.privText('من دبیرِ دبیرستانِ فرهنگ هستم و یک مسئله برای کلاسم می‌خواهم');
      return o; });
    X('D25-22 aD1: «تازه اسم مدرسمون هم شهید بهشتیه» ⇒ نامِ مدرسه در 📜 نمی‌ماند (شکلِ گفتاری)', !/شهید|بهشتی/.test(r.aD1) && !/شهید|بهشتی/.test(r.aD1txt) && /نامِ مدرسه/.test(r.aD1txt) && /نمیدونم از کجا شروع کنم/.test(r.aD1txt), r);
    BK(223, !/پروین/.test(r.b223) && /۱۲ تا سیب رو بین ۴ نفر/.test(r.b223) && /کلاس چهارمم/.test(r.b223), r.b223);
    BK(224, !/نرگس/.test(r.b224) && !/دوم ج/.test(r.b224) && /کلاسِ دوم/.test(r.b224), r.b224);
    BK(235, r.b235 === 'من دبیرِ دبیرستانِ فرهنگ هستم و یک مسئله برای کلاسم می‌خواهم', r.b235);
    BK(236, r.b236 === 'من بچهٔ کرمانم و کلاس پنجمم' && r.keep === 'کلاسِ دوم و سوم با هم مسابقه دادن', r);
  });

  /* ===== C25-17 + بانک #225، #237 — کارنامهٔ کم‌سالِ بی‌هنجار ===== */
  await section('psy', async () => {
    await fresh();
    const r = await E(async () => { const o = {}; const yr = +APP.today().slice(0, 4);
      __birth((yr - 9) + '-05-01'); APP.go('mind'); await new Promise(r => setTimeout(r, 300));
      const t = document.getElementById('main').innerText; o.kid = { ans: /معمای امروز را جواب داده‌ای/.test(t), no: /هنجارِ معتبر در دست نیست — معمایی پیشنهاد نمی‌شود/.test(t), blocked: APP.PSY.ageBlocked(), btn: !!document.querySelector('#main .psy-open') };
      __birth((yr - 40) + '-05-01');
      const it = APP.PSY.pending()[0]; APP.S.put({ id: APP.uid('psa'), type: 'psyans', item: it.id, ok: true, at: APP.nowISO(), conf: 70 });
      APP.go('home'); APP.go('mind'); await new Promise(r => setTimeout(r, 300));
      const t2 = document.getElementById('main').innerText; o.adult = { ans: /معمای امروز را جواب داده‌ای؛ معمای بعدی فردا/.test(t2), today: APP.PSY.answeredToday() };
      return o; });
    X('C25-17 aC1: کارنامهٔ کودکِ ۹ ساله «معمای امروز را جواب داده‌ای» نمی‌گوید؛ سطرِ بی‌هنجاری را می‌گوید', r.kid.blocked && !r.kid.ans && r.kid.no && !r.kid.btn, r);
    BK(225, !r.kid.ans && r.kid.no, r.kid);
    BK(237, r.adult.today && r.adult.ans, r.adult);
  });

  /* ===== B24·D18 / A23-8 + بانک #226، #238 — هر رویداد یک نقطه؛ برچسب با محتوای خودش ===== */
  await section('route', async () => {
    await fresh();
    const r = await E(async () => { const o = {}; const R = (t, x) => __cs(Object.assign({ ph: 'e', said: ['result'], result: t }, x || {}));
      const pts = () => { const M = APP.ROUTE.model(__cur().id); return (M.pts || []).map(p => ({ k: p.k, title: p.title, short: p.short || '', l: (p.lines || [])[0] || '' })); };
      __freshChat();
      await __say('می‌خوام مساحت و محیطِ یه زمینِ مستطیلیِ ۸ در ۵ متر رو حساب کنم که بدونم چقدر چمن و چقدر نرده بخرم.', 'از کدام شروع می‌کنی؟', [__cs({ ph: 'u', said: ['u', 'd'] })]);
      await __say('۸ ضربدر ۵: مساحت شد ۴۰', 'خوب.', [R('مساحت شد ۴۰')]);
      await __say('۸ و ۵ میشه ۱۳، دو برابرش: محیط شد ۲۶', 'خوب.', [R('محیط شد ۲۶')]);
      o.two = pts().filter(p => p.k === 'cres');
      /* همان نتیجه دوباره در دفتر (همان متن) ⇒ هنوز یک نقطه */
      const s = __cur(), EV = (s.evlog || []), c0 = EV.filter(e => e.k === 'cres')[0];
      if (c0) { s.evlog = EV.concat([Object.assign({}, c0, { id: c0.id + '_dup', at: APP.nowISO() })]); APP.S.put(s); }
      o.hasEv = !!c0; o.dup = pts().filter(p => p.k === 'cres');
      APP.go('route', s.id); o.txt = (document.getElementById('main').innerText.match(/نتیجه[^\n]*/g) || []);
      return o; });
    X('B24·D18 aB4 / A23-8: دو نتیجهٔ جدا دو نقطه با برچسبِ خودشان («نتیجه: مساحت شد ۴۰»)، نه دو «نتیجه (از گفت‌وگو)» ِ هم‌نام', r.two.length === 2 && /مساحت شد ۴۰/.test(r.two[0].short) && /محیط شد ۲۶/.test(r.two[1].short) && r.txt.some(x => /مساحت شد ۴۰/.test(x)) && r.txt.some(x => /محیط شد ۲۶/.test(x)), r);
    BK(226, r.hasEv && r.dup.length === 2, r);
    BK(238, r.two.length === 2, r.two);
  });

  /* ===== A25-21 + بانک #227، #239 — دلیلِ اصلاحِ موعد حرفِ خودش است ===== */
  await section('why', async () => {
    await fresh();
    const r = await E(async () => { const o = {}; __freshChat();
      const d15 = APP.PR.parseWhen('۱۵ آذر');
      await __say('سلام. یه کارِ تازه: باید تا ۱۵ آذر قیمتِ ماهِ بعد رو به سه تا کافه‌ای که ازم کیک می‌گیرن اعلام کنم. یادم بنداز.', 'ثبت شد.', [__cs({}), { do: 'deadline', what: 'اعلامِ قیمتِ ماهِ بعد به کافه‌ها', date: d15 }]);
      o.dl0 = __dl();
      await __say('یه اصلاح: اولش گفتم «تا ۱۵ آذر» باید قیمت رو اعلام کنم — اشتباه گفتم، تا ۲۰ آذره.', 'درست شد.', [__cs({ retract: { msg: 'تا ۱۵ آذر', what: 'deadline', fix: 'تا ۲۰ آذر', old: '۱۵ آذر' } })]);
      o.dl1 = __dl(); o.d20 = APP.PR.parseWhen('۲۰ آذر'); o.res = ((__cur().coach || {}).retNote || {}).res || null;
      o.hist = (APP.S.all('deadline')[0].fixHist || []).map(h => h.why);
      return o; });
    const ch = ((r.res || {}).changed || []);
    X('A25-21 s09 p17: موعد ۱۵ ⇐ ۲۰ آذر — «چرا» ِ تغییر حرفِ خودش است («به گفتهٔ خودش: «… تا ۲۰ آذره»»)، نه «اصلاح شد ⇐ «یکشنبه ۱۵ آذر …»»', r.dl1[0] && r.dl1[0].date === r.d20 && ch.length >= 1 && ch.every(c => /^به گفتهٔ خودش: «/.test(c.why) && /۲۰ آذر/.test(c.why)) && r.hist.every(w => !/^اصلاح شد ⇐/.test(w)), r);
    BK(227, ch.length >= 1 && ch.every(c => /^به گفتهٔ خودش/.test(c.why) && !/^اصلاح شد ⇐ «/.test(c.why)), ch);
    /* بانک #239: ✏️ ِ خودش روی همان پیام («سه‌شنبه» ⇐ «پنجشنبه»)، بی هیچ حرفی */
    await fresh();
    const e = await E(async () => { __freshChat(); const tue = __nextDow(2), o = { thu: __nextDow(4) };
      await __say('سه‌شنبه باید فرمِ ثبت‌نام رو تحویل بدم. یادم بنداز.', 'ثبت شد.', [__cs({}), { do: 'deadline', what: 'تحویلِ فرمِ ثبت‌نام', date: tue }]);
      const s = __cur(), m = s.msgs.filter(x => x.role === 'user')[0]; __q.push({ reply: 'درست شد.', status: 'related', memory: 'm', actions: [] });
      const r = APP.ASSIST.retractEdit(s, m, 'پنجشنبه باید فرمِ ثبت‌نام رو تحویل بدم. یادم بنداز.');
      for (let i = 0; i < 60 && APP.ASSIST.busy(); i++) await new Promise(z => setTimeout(z, 100)); await new Promise(z => setTimeout(z, 400));
      o.dl = __dl(); o.hist = (APP.S.all('deadline')[0].fixHist || []).map(h => h.why); o.res = ((__cur().coach || {}).retNote || {}).res || null; o.ok = r && r.ok; return o; });
    const whys = e.hist.concat((((e.res || {}).changed) || []).map(c => c.why));
    BK(239, e.dl[0] && e.dl[0].date === e.thu && whys.length >= 1 && whys.every(w => w === 'با ✏️ ِ خودش روی همان پیام'), e);
  });

  /* ===== A23-25 (s06)، A21-11 (s05)، A23-26 — کارنامه ===== */
  await section('mind', async () => {
    await fresh();
    const r = await E(async () => { const o = {}; __freshChat();
      await __say('یه باگ دارم که هفته‌ای یه بار پرداخت دوبار ثبت میشه. سه روزه لاگ اضافه می‌کنم، کد رو عوض می‌کنم. ۹ تا تغییر دادم. تغییر دهم چی باشه؟', 'ثبتش کنیم؟', [__cs({ ph: 'u' })]);
      await __say('آره ثبتش کن.', 'ثبت شد.', [__cs({ ph: 'u', stuck: true })]);
      o.ev = (__cur().coachEv || []).filter(e => !e.ok).map(e => e.key);
      await __say('داده: دو رکورد پرداخت با یک order_id. نمی‌دونم چی‌کار کنم.', 'باشه.', [__cs({ ph: 'u', stuck: true })]);
      o.ev2 = (__cur().coachEv || []).filter(e => !e.ok).map(e => e.key);
      o.typo = /تا تا ریشه/.test(JSON.stringify(APP.VIEW_META || {}));
      return o; });
    X('A23-25 s06: «آره ثبتش کن.» گیر نیست (هر چه مدل گزارش کند)؛ «نمی‌دونم چی‌کار کنم» گیر است', !r.ev.length && r.ev2.length === 1 && /نمی‌دونم/.test(r.ev2[0]), r);
    X('A23-26: «تا تا ریشه» در متنِ نماها نیست', !r.typo, r);
    await fresh();
    const t = await E(async () => { const o = {}; __freshChat();
      await __say('می‌خوام یاد بگیرم این‌قدر «صد در صد» مطمئن حرف نزنم — یه تمرینِ سنجیدنِ اطمینان برام راه بنداز که هر بار پیش‌بینی کنم و بعد ببینم درست درمیاد یا نه.', 'باز کردم.', [__cs({}), { do: 'start_practice', tid: 24, consent: { quote: 'یه تمرینِ سنجیدنِ اطمینان برام راه بنداز', kind: 'request' } }]);
      await __say('پیش‌بینیم: تا فردا جلسهٔ هفتگی بیشتر از یک ساعت طول می‌کشه — ۷۰٪ مطمئنم.', 'ثبت شد.', [__cs({})]);
      return { cases: APP.PR.cases().length, fc: __fc() }; });
    await day(2);
    const t2 = await E(async () => {
      await __say('سلام. جلسه یک ساعت و نیم طول کشید؛ اون پیش‌بینیِ ۷۰ درصدیم درست درومد.', 'آفرین.', [__cs({}), { do: 'practice_log', tid: 24, ok: true, what: 'جلسه بیش از یک ساعت شد', quote: 'اون پیش‌بینیِ ۷۰ درصدیم درست درومد' }]);
      APP.go('mind'); await new Promise(r => setTimeout(r, 300)); document.querySelectorAll('#main details').forEach(d => { d.open = true; });
      const all = [...document.querySelectorAll('#main .mind-techtable tbody tr')].map(tr => tr.innerText.replace(/\s+/g, ' ')), row = all.filter(x => /T24|کالیبراسیون/.test(x));
      return { row, all, fc: __fc() }; });
    X('A21-11 s05: ردیفِ T24 در کارنامه پیش‌بینیِ داوری‌شده‌اش را می‌شمارد، نه «— (اندازه‌ای نیست)»', t.cases === 1 && t2.row.length === 1 && !/اندازه‌ای نیست/.test(t2.row[0]) && /۱ از ۱ پیش‌بینیِ داوری‌شده درست/.test(t2.row[0]) && t2.fc.length === 1, { t, t2 });
  });

  await b.close();
  const exp = [216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241];
  if (!process.env.ONLY) { if (P7.length !== 26) errors.push('bank: P7 entries = ' + P7.length + ' (expected 26)'); exp.forEach(n => { if (info.bank[n] === undefined) errors.push('bank #' + n + ' not run'); }); }
  const rn = Object.keys(info.runners), bn = Object.keys(info.bank);
  console.log(JSON.stringify({ runners: rn.length, runnersOk: rn.filter(k => info.runners[k]).length, bank: bn.length, bankOk: bn.filter(k => info.bank[k]).length }));
  if (errors.length) { console.log('ERRORS\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS — test_tour1_r25_today');
})();
