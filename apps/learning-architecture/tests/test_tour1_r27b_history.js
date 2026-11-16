// تورِ پولیا (دستهٔ ۱، دورِ ۲۷b، سهمِ «history» — ۲۰۲۶-۱۱-۱۶): نیمهٔ 📜 ِ R6 و باقی‌ماندهٔ «story» (FIX27B).
//  هر بخش از جملهٔ خودِ دونده‌ها یا ورودیِ بانکِ مستقلِ tests/variants/VARIANTS_R27.json (شمارهٔ ۱-مبنا) ساخته شده و «شبیهِ منفی» ِ خودش را دارد.
//  قرمزِ نخست: LLA_FILE=<ساختِ BASE27B> — بخش‌های مثبت باید قرمز شوند. ساعتِ صفحه دست نمی‌خورد؛ هیچ تاریخِ تقویمی در انتظارها نیست.
//  ONLY=<نامِ بخش‌ها با ویرگول>.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BF = process.env.LLA_VARIANTS || path.join(__dirname, 'variants', 'VARIANTS_R27.json');
const BANK = fs.existsSync(BF) ? JSON.parse(fs.readFileSync(BF, 'utf8')) : [];

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('dialog', d => { d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__noNav = true;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => { __calls.push({ user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
    window.__turn = async (text, actions, reply) => { const n0 = __calls.length; __q.push({ reply: reply || 'خوب.', status: 'related', memory: 'm', actions: actions || [] }); await APP.ASSIST.send(text); __q.length = 0; const c = __calls.slice(n0)[0] || {}; return String(c.user || '').split('# نوبتِ تازه')[0]; };
    window.__fresh = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc', 'ex'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__mk = (t, st) => APP.liveCreate(t, st, 'find', { by: 'user', sess: __cur().id }).p.id;
    window.__dos = (pid) => { try { return (APP.dossier(pid).events || []).map(e => e.k + ' | ' + (e.title || '') + ' ¦ ' + (e.lines || []).join(' ¦ ') + ' ¦ ' + (e.out || '')); } catch (e) { return ['ERR ' + e]; } };
    window.cs = (o) => Object.assign({ do: 'coach_state', ans: [], said: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
    window.__base3 = () => { __wipe(); __fresh();
      const A = __mk('قفسه‌های انباری', 'انباری ۲ متر ارتفاع داره. چند طبقه قفسه توش جا میشه و چوبش رو چقدر بخرم؟'); APP.liveBindSession(A, __cur(), { force: true });
      const B = __mk('مهره‌های رنگی', 'سه رنگ مهره داریم و از هر رنگ چند تا؛ به چند حالت می‌شه دو مهره برداشت؟'); APP.liveBindSession(B, __cur(), { force: true });
      APP.liveBindSession(A, __cur(), { force: true }); return [A, B]; };
    window.__one = (t, st) => { __wipe(); __fresh(); const A = __mk(t, st); APP.liveBindSession(A, __cur(), { force: true }); return A; };
  });
  const J = (x) => JSON.stringify(x);
  const ev = (f, a) => p.evaluate(f, a);
  const E = {};      // بانک: شماره ⇒ async () => [ok, why] | { nc }
  const K = {};      // بخش‌های جمله‌های دونده‌ها

  /* ---------- #230 (A27-4): ✓/✗/؟ ِ صفحه کنارِ سطرِ خودش در 📜 ---------- */
  E[230] = async () => { const D = await ev(async () => { const [A] = __base3(); await __turn('۴ × ۶ = ۲۴ قفسه، ولی ۲۴ ÷ ۵ = ۴ ردیف', [cs({ ph: 'c', said: ['d'] })]); return __dos(A); });
    const l1 = D.filter(x => /۴ × ۶ = ۲۴ قفسه/.test(x) && !/^udraft/.test(x))[0] || '', l2 = D.filter(x => /۲۴ ÷ ۵ = ۴ ردیف/.test(x) && !/^udraft/.test(x))[0] || '';
    return [/حسابِ صفحه: ✓/.test(l1) && /حسابِ صفحه: ؟/.test(l2) && /۴٫۸/.test(l2), J([l1, l2])]; };
  K.A27_4 = async () => {   // s02 📜 (A27-4): «۳٫۹۷ − ۳٫۹ = ۰٫۷» ✗ بی نشان؛ منفی: سطرِ بی‌حساب نشانی نمی‌گیرد و عددِ درستِ ✗ لو نمی‌رود
    const D = await ev(async () => { const A = __one('زمانِ دویدن', 'زمانِ دویدنم رو مقایسه کنم.'); await __turn('۳٫۹۷ − ۳٫۹ = ۰٫۷ دقیقه بهتر شدم', [cs({ ph: 'c', said: ['result'], result: '۳٫۹۷ − ۳٫۹ = ۰٫۷ دقیقه بهتر شدم' })]);
      await __turn('مسیرِ پارک رو انتخاب کردم', [cs({ ph: 'c', said: ['d'] })]); return __dos(A); });
    const bad = D.filter(x => /۳٫۹۷ − ۳٫۹/.test(x) && /^cres/.test(x))[0] || '', plain = D.filter(x => /مسیرِ پارک/.test(x) && /^c/.test(x))[0] || '';
    return [/حسابِ صفحه: ✗/.test(bad) && !/۰٫۰۷/.test(bad) && (!plain || !/حسابِ صفحه/.test(plain)), J([bad, plain])]; };

  /* ---------- #232 (D26-2): «برنامهٔ خودت» + «طرح» ِ همان جمله = یک سطر ---------- */
  E[232] = async () => { const D = await ev(async () => { const [A] = __base3(); const t = 'نتیجه رو هم از گزارشِ دو هفته وارسی می‌کنم'; await __turn(t, [cs({ ph: 'p', said: ['plan'], plan: t })]); return __dos(A); });
    const n = D.filter(x => /گزارشِ دو هفته/.test(x) && /^c(?:plan|plan23)\b/.test(x)).length; return [n === 1, J(D)]; };
  K.D26_2_neg = async () => {   // منفی: دو برنامهٔ جدا در دو پیام دو سطر می‌مانند
    const D = await ev(async () => { const [A] = __base3(); const t1 = 'فردا چوب‌ها رو اندازه می‌گیرم', t2 = 'پس‌فردا قفسه‌ها رو رنگ می‌زنم'; await __turn(t1, [cs({ ph: 'p', said: ['plan'], plan: t1 })]); await __turn(t2, [cs({ ph: 'p', said: ['plan'], plan: t2 })]); return __dos(A); });
    return [D.filter(x => /اندازه می‌گیرم/.test(x) && /^cplan/.test(x)).length === 1 && D.filter(x => /رنگ می‌زنم/.test(x) && /^cplan/.test(x)).length === 1, J(D)]; };

  /* ---------- #168 (D27-15 pwD2): گامِ دفترِ «کارِ پیشین» نوعِ خودش را دارد؛ جملهٔ گیر «گیر» است ---------- */
  E[168] = async () => { const D = await ev(async () => { const A = __one('حکمِ n', 'می‌خوام ثابت کنم برای هر n حکم برقراره.');
      const t = 'کافیه حکم رو برای nهای کوچیک ثابت کنم، بعد استقرا. گیرِ من اینجاست که n = 73 جور درنمیاد';
      await __turn(t, [cs({ ph: 'e', said: ['plan', 'guess'], stuck: true, plan: { text: 'کافیه حکم رو برای nهای کوچیک ثابت کنم، بعد استقرا' }, guess: { text: 'گیرِ من اینجاست که n = 73 جور درنمیاد' },
        prior: [{ step: 'روش', quote: 'کافیه حکم رو برای nهای کوچیک ثابت کنم، بعد استقرا', verdict: 'unchecked' }, { step: 'گیر', quote: 'گیرِ من اینجاست که n = 73 جور درنمیاد', verdict: 'unchecked' }] })]); return __dos(A); });
    const pr = D.filter(x => /^cprior/.test(x))[0] || '';
    return [/گامِ ۱ ·[^¦]*کافیه حکم/.test(pr) && /گیر \(گامِ ۲\)[^¦]*n = 73/.test(pr) && !D.some(x => /^(?:cplan|cplan23|guess) /.test(x) && /(?:کافیه حکم|n = 73)/.test(x)), J(D)]; };
  K.D27_15_neg = async () => {   // منفی: حدسی که در دفترِ «کارِ پیشین» نیست «حدس» می‌ماند؛ گامی بی «گیر» «گامِ N» است
    const D = await ev(async () => { const A = __one('حکمِ n', 'می‌خوام ثابت کنم برای هر n حکم برقراره.');
      await __turn('گامِ ۱: برای n = 2 درسته. حدسم اینه که برای همهٔ nهای فرد هم درسته', [cs({ ph: 'e', said: ['guess'], guess: { text: 'برای همهٔ nهای فرد هم درسته' }, prior: [{ step: 'n = 2', quote: 'برای n = 2 درسته', verdict: 'ok' }] })]); return __dos(A); });
    return [D.some(x => /^guess/.test(x) && /nهای فرد/.test(x)) && D.some(x => /^cprior/.test(x) && /گامِ ۱ ·/.test(x) && !/گیر \(/.test(x)), J(D)]; };

  /* ---------- B27·D2 (pwB3 p2–p3) و #167: نتیجهٔ «ابعاد» مرحله را جلو می‌برد ---------- */
  const RUNS = JSON.parse(fs.readFileSync(path.join(__dirname, 'variants', 'R27_prior_runs.json'), 'utf8'));
  const strip = () => ev(() => { APP.go('home'); const g = document.querySelector('#main .rt-geo'); return g ? g.textContent : ''; });
  const replay = async (sid, upto) => { await ev(() => { __wipe(); __fresh(); }); for (const t of RUNS[sid].turns.filter(t => t.p <= upto && !t.sys)) await ev(async ([u, r]) => { __q = [JSON.stringify(r)]; await APP.ASSIST.send(u); __q.length = 0; }, [t.u, t.r]); };
  K.B27_D2 = async () => { await replay('pwB3', 2); const s2 = await strip(); await replay('pwB3', 3); const s3 = await strip();
    return [/اکنون: بازنگری/.test(s2) && /اکنون: بازنگری/.test(s3) && !/اکنون: فهمِ مسئله/.test(s3), J([s2.slice(0, 200), s3.slice(0, 200)])]; };
  K.B27_D2_neg = async () => {   // منفی: یک اندازهٔ تنها («عرض ۶ سانت») هنوز جوابِ «ابعاد» نیست
    await replay('pwB3', 1); await ev(async () => { __q = [JSON.stringify({ reply: 'خوب.', status: 'related', memory: 'm', actions: [cs({ ph: 'e', said: ['result'], result: 'عرض ۶ سانت' })] })]; await APP.ASSIST.send('خب، پس عرض ۶ سانت میاد.'); __q.length = 0; });
    const s = await strip(); return [!/اکنون: بازنگری/.test(s), s.slice(0, 200)]; };
  E[167] = async () => { await ev(async () => { __wipe(); __fresh();
      __q = [JSON.stringify({ reply: 'خوب.', status: 'related', memory: 'm', actions: [cs({ ph: 'u', said: ['u'], prior: [{ step: 'نصفِ محیط', quote: 'نصفِ محیط میشه طول + عرض = ۲۲ سانت', verdict: 'ok' }] })] })];
      await APP.ASSIST.send('یه قاب عکس با ۴۴ سانت چوب می‌خوام بسازم؛ طولش سه برابرِ عرضش باشه. ابعادش چند میشه؟ گامِ اول رو خودم رفتم: نصفِ محیط میشه طول + عرض = ۲۲ سانت.');
      __q = [JSON.stringify({ reply: 'خوب.', status: 'related', memory: 'm', actions: [cs({ ph: 'e', said: ['result'], result: 'عرض ۵٫۵ و طول ۱۶٫۵ سانت' })] })];
      await APP.ASSIST.send('جواب شد عرض ۵٫۵ و طول ۱۶٫۵ سانت؛ گذاشتم تو معادله، جور درومد'); __q.length = 0; });
    const s = await strip(), ck = await ev(() => [APP.STORY.arithChk('۵٫۵ + ۱۶٫۵ = ۲۲'), APP.STORY.arithChk('۱۶٫۵ = ۳ × ۵٫۵')].map(c => c.length > 0 && c.every(x => x.ok && !x.ask)));
    return [/اکنون: بازنگری/.test(s) && !/فهمِ مسئله/.test(s) && ck.every(Boolean), J([s.slice(0, 200), ck])]; };

  /* ---------- #231 (A27-14 s07): یک ✏️ یک رویدادِ 📜، یک قراردادِ پیکان ---------- */
  const S07 = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'r27b_history', 's07.json'), 'utf8')).r.map(r => [null, r]);   // پاسخ‌های ضبط‌شدهٔ مدل در s07 (r1، r2، r7)
  const S07_U1 = '۵ تا گلدون لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور گذاشتم. قدشون بعد از ۳ هفته: ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. استادم گفت «یه قانون پیدا کن». قانونش چیه؟ فکر کنم خطیه، هر ۲ ساعت ۴ سانت.';
  const S07_U2 = 'تفاضل‌ها ۵، ۴، ۳، ۱ شدن، پس خطی نیست، کند میشه. حدسم اشباعه. یه مقاله هم پیدا کردم دربارهٔ اشباع فتوسنتز. پس ثابت شد دیگه، قانونش اشباعه!';
  const edit = (n, t, rep) => ev(async ([n, t, rep]) => { const s = __cur(), m = s.msgs.filter(m => m.role === 'user' && !/^\[/.test(m.text))[n - 1]; __q = [rep]; const r = APP.ASSIST.retractEdit(s, m, t);
    for (let i = 0; i < 80 && APP.ASSIST.busy(); i++) await new Promise(res => setTimeout(res, 100)); await new Promise(res => setTimeout(res, 300)); __q.length = 0; return r && r.ok; }, [n, t, rep]);
  const retEv = () => ev(() => (APP.dossier(__cur().id).events || []).filter(e => e.k === 'retract').map(e => e.lines));
  const s07 = async () => { await ev(() => { __wipe(); __fresh(); });
    const rep = (i) => S07 ? S07[i][1] : JSON.stringify({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] });
    for (const [u, i] of [[S07_U1, 0], [S07_U2, 1]]) await ev(async ([u, r]) => { __q = [r]; await APP.ASSIST.send(u); __q.length = 0; }, [u, rep(i)]);
    return rep(2); };
  E[231] = async () => { const r7 = await s07(); await edit(1, S07_U1.replace('۴، ۹، ۱۳، ۱۶، ۱۷', '۴، ۸، ۱۳، ۱۵، ۱۷'), r7); const R = await retEv(); const all = R.flat().join(' | ');
    return [R.length === 1 && !/[0-9۰-۹]\s*⇒/.test(all) && !/،»\s*\(اصلاح شد/.test(all) && /«۸، ۱۳، ۱۵» \(اصلاح شد ⇐ «۹، ۱۳، ۱۶»\)/.test(all) && /اندازهٔ ۲/.test(all) && /اندازهٔ ۴/.test(all), J(R)]; };
  K.A27_14_neg = async () => {   // منفی: دو ✏️ روی دو پیامِ جدا دو رویدادند
    const r7 = await s07(); await edit(1, S07_U1.replace('۴، ۹، ۱۳، ۱۶، ۱۷', '۴، ۸، ۱۳، ۱۵، ۱۷'), r7);
    await edit(2, S07_U2.replace('یه مقاله هم', 'دو تا مقاله هم'), JSON.stringify({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] })); const R = await retEv();
    return [R.length === 2, J(R)]; };

  /* ---------- B27·D11 (s19 p15): سرِ رویدادِ اصلاح همان تغییری است که صفحه اعمال کرد ---------- */
  const S19 = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'r27b_history', 's19.json'), 'utf8'));
  K.B27_D11 = async () => { await ev(() => { __wipe(); __fresh(); });
    for (let i = 0; i < 2; i++) await ev(async ([u, r]) => { __q = [r]; await APP.ASSIST.send(u); __q.length = 0; }, [S19.u[i], S19.r[i]]);
    const R = await retEv(); const h = (R[0] || [])[0] || '';
    return [R.length === 1 && /^«۱۸ هفته/.test(h) && /⇐ «۱۶ هفته/.test(h) && !/عروسی ۱۵ اسفنده/.test(h), J(R)]; };
  K.B27_D11_neg = async () => {   // منفی: «درست» ِ مدل که همان تغییرِ اعمال‌شده است سر می‌ماند
    await ev(() => { __wipe(); __fresh(); });
    await ev(async ([u, r]) => { __q = [r]; await APP.ASSIST.send(u); __q.length = 0; }, [S19.u[0], S19.r[0]]);
    await ev(async () => { __q = [JSON.stringify({ reply: 'باشه.', status: 'related', memory: 'm', actions: [cs({ ph: 'e', said: ['d'], retract: { msg: '۱۶ هفته تا عروسی برادرم مونده', what: 'fact', fix: '۱۸ هفته تا عروسی برادرم مونده', old: '۱۶ هفته' } })] })];
      await APP.ASSIST.send('اشتباه گفتم: ۱۸ هفته تا عروسی برادرم مونده نه ۱۶.'); __q.length = 0; });
    const R = await retEv(); const h = (R[0] || [])[0] || ''; return [/^«۱۸ هفته تا عروسی برادرم مونده»/.test(h), J(R)]; };

  /* ---------- C52/C73 (گزارشِ dates «📜 still lists it separately»): ⏰ ِ پیوسته به 📌 در 📜 سطرِ همان برنامه است ---------- */
  await ev(() => { window.__wd = (d) => { const p = d.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).getDay(); };
    window.__nextDow = (dow) => { const t = APP.today(); let k = (dow - __wd(t) + 7) % 7; if (!k) k = 7; return APP.addDays(t, k); }; });
  const sdos = () => ev(() => (APP.dossier(__cur().id).events || []).map(e => e.k + ' | ' + (e.title || '') + ' ¦ ' + (e.lines || []).join(' ¦ ')));
  K.C52_attached = async () => { await ev(async () => { __wipe(); __fresh(); const thu = __nextDow(4), fri = __nextDow(5);
      await __turn('جمعه قرارداد رو امضا می‌کنم.', [cs({ said: ['plan'], plan: { text: 'جمعه قرارداد رو امضا می‌کنم', when: fri } })]); await __turn('آره', [cs({})]);
      await __turn('پنجشنبه یادم بنداز که مدارکِ امضا رو آماده کنم.', [{ do: 'deadline', what: 'یادآور: آماده‌کردنِ مدارکِ امضا', date: thu }, cs({})]); await __turn('آره', [cs({})]); });
    const D = await sdos(), dl = await ev(() => APP.S.all('deadline').filter(d => !d.done && d.plan).length);
    return [dl === 1 && !D.some(x => /^deadline/.test(x)) && D.filter(x => /^cplan/.test(x) && /قرارداد/.test(x) && /⏰ یادآور \(همین برنامه\)/.test(x)).length === 1, J([dl, D])]; };
  K.C52_neg = async () => {   // منفی: یادآورِ بی برنامه رویدادِ خودش را دارد
    await ev(async () => { __wipe(); __fresh(); const thu = __nextDow(4); await __turn('پنجشنبه یادم بنداز قبضِ برق رو بدم.', [{ do: 'deadline', what: 'یادآور: قبضِ برق', date: thu }, cs({})]); await __turn('آره', [cs({})]); });
    const D = await sdos(); return [D.some(x => /^deadline/.test(x) && /قبضِ برق/.test(x)), J(D)]; };

  /* ---------- D27-9 (arD1): 📜 و کارنامهٔ ذهن یک صدا — نتیجهٔ ✗دار «اجرا +» نمی‌گیرد ---------- */
  K.D27_9 = async () => { const r = await ev(async () => { __wipe(); __fresh();
      await __turn('قبضِ برقمون ۵۰۰ هزار تومن شده، می‌خوام بفهمم سهمِ بخاری چقدره.', [cs({ ph: 'u', said: ['u'] })]);
      await __turn('بخاری ۲ کیلوواته، روزی ۶ ساعت. پس ماهی ۲ × ۶ × ۳۰ = ۳۰۰ کیلووات ساعت', [cs({ ph: 'c', said: ['result'], result: '۲ × ۶ × ۳۰ = ۳۰۰ کیلووات ساعت' })]);
      await __turn('بخاری اتاق ۲ کیلوواته، ۶ ساعت روزی، ماهی ۲ × ۶ × ۳۰ = ۳۶۰ کیلووات ساعت', [cs({ ph: 'c', said: ['result'], result: '۲ × ۶ × ۳۰ = ۳۶۰ کیلووات ساعت' })]);
      const s = __cur(), row = (APP.MIND.phases({}).rows || []).filter(x => /اجرا/.test(x.fa))[0] || {};
      return { plus: (row.acts || []).filter(a => a.ok).length, d: (APP.dossier(s.id).events || []).filter(e => e.k === 'mind').map(e => e.lines.join(' / ') + ' :: ' + (e.out || '')) }; });
    const plus = r.d.filter(x => /^اجرا \+/.test(x)).length;   // منفی در همین بخش: نتیجهٔ درست (۳۶۰) «+» می‌ماند
    return [r.plus === 1 && plus === 1 && r.d.some(x => /شمرده نشد/.test(x) && /✗/.test(x)), J(r)]; };

  /* ---------- D27-10 (arD1): نقطه‌های 🧭 ِ «کارِ پیشین» برای ردِ حکم و پس‌گرفتن یکسان نیستند ---------- */
  K.D27_10 = async () => { const pts = await ev(async () => { __wipe(); __fresh();
      const pr1 = [{ step: 'مصرف', quote: '۲ × ۶ × ۳۰ = ۳۶۰ کیلووات ساعت', verdict: 'ok' }, { step: 'سهم', quote: '۳۶۰ تقسیم بر ۵۰۰ میشه ۰٫۷۲', verdict: 'wrong', why: 'واحد' }];
      await __turn('خودم حساب کردم: بخاری ۲ کیلوواته و روزی ۶ ساعت، پس ۲ × ۶ × ۳۰ = ۳۶۰ کیلووات ساعت؛ ۳۶۰ تقسیم بر ۵۰۰ میشه ۰٫۷۲. درسته؟', [cs({ ph: 'e', said: [], prior: pr1 })]);
      await __turn('نه، گامِ ۲ درسته، ۰٫۷۲ همون سهمه', [cs({ ph: 'e', said: [] })]);
      await __turn('ببخشید، حرفمو پس می‌گیرم، گامِ ۲ غلطه', [cs({ ph: 'e', said: [] })]);
      const M = APP.ROUTE.model(__cur().id); return M ? M.pts.filter(q => q.k === 'cprior').map(q => q.title) : []; });
    const T = pts.filter(t => !/^کارِ پیشین — گامِ/.test(t));   // منفی: نقطه‌های گام‌ها همان‌اند
    return [T.length >= 2 && new Set(T).size === T.length && !T.includes('کارِ پیشینِ تو (از گفت‌وگو)') && pts.filter(t => /^کارِ پیشین — گامِ/.test(t)).length === 2, J(pts)]; };

  /* ---------- A27-5 (s02 p8–p14): پس از «حل شد — کنار رفت، اجرا دوباره باز شد» مرحله «اجرا» است، تا جوابِ کلِ تازه ---------- */
  K.A27_5 = async () => { const r = await ev(async () => { const A = __one('لوله در بارِ وانت', 'یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟');
      await __turn('قطر کف با ارتفاع: sqrt(3.67^2 + 1.6^2) ≈ 4.005. جا میشه! حلش کردم دیگه، حل شد!', [cs({ ph: 'b', said: ['result'], result: 'جا میشه' })]);
      const o = { ph0: APP.liveStoryPhase(A) };
      /* همان کاری که a38 setAsideDeps با اصلاحِ «۱.۶ ⇒ ۱۵۰ سانت» می‌کند (L.state باز، L.reopened) — بی تغییرِ دیگر */
      const pg = APP.S.get('eprog_' + A), L = pg.solve.live; await new Promise(res => setTimeout(res, 5)); L.reopened = { at: new Date().toISOString(), why: 'یک داده‌ای که به کار رفته بود عوض شد' }; L.state = 'open'; APP.S.put(pg);
      o.ph1 = APP.liveStoryPhase(A);
      await __turn('یه لولهٔ کوتاه‌تر هم دارم، ۳٫۹۵ متری؛ ۳٫۹۷ − ۳٫۹۵ = ۰٫۰۲ متر جا دارم', [cs({ ph: 'b', said: ['d'] })]); o.ph2 = APP.liveStoryPhase(A);
      await __turn('دوباره حساب کردم: sqrt(3.2^2 + 1.8^2 + 1.5^2) ≈ 3.97 — از ۴ کمتره، پس جواب شد: لوله جا نمیشه.', [cs({ ph: 'b', said: ['result'], result: 'جواب شد: لوله جا نمیشه' })]); o.ph3 = APP.liveStoryPhase(A);
      return o; });
    return [r.ph0 === 'b' && r.ph1 === 'c' && r.ph2 === 'c' && r.ph3 === 'b', J(r)]; };   // منفی در همان بخش: جوابِ کلِ تازه پس از بازشدن دوباره «بازنگری» است

  /* ---------- #200 (C37 ⇐ C53): پیش‌بینیِ مبهم دربارهٔ خواستهٔ مسئله ⇒ یک بار پرسشِ عدد؛ «شصت» ⇒ 🎯 ۶۰٪ ---------- */
  const fcs = () => ev(() => ({ fc: APP.S.all('fcast').filter(x => !x.sample).map(x => ({ q: x.q, p: x.p })), preds: ((__cur().coach || {}).preds || []).map(x => ({ t: x.text, p: x.p })), sys: __cur().msgs.filter(m => m.role === 'sys').map(m => m.text) }));
  E[200] = async () => { await ev(() => __one('کنکور', 'می‌خوام کنکور قبول شم.')); await ev(() => __turn('فکر کنم قبول شم', [])); const S1 = await fcs(); await ev(() => __turn('شصت', [])); const S2 = await fcs();
    return [S1.fc.filter(f => f.p != null).length === 0 && S1.sys.filter(x => /چند درصد مطمئنی/.test(x)).length === 1 && S2.fc.some(f => f.p === 60) && S2.sys.filter(x => /چند درصد مطمئنی/.test(x)).length === 1, J([S1, S2])]; };
  K.C37_neg = async () => {   // منفی: «فکر کنم» دربارهٔ چیزی جز خواستهٔ صورت، یا حدسِ عددیِ جواب، پیش‌بینی نیست و پرسیده نمی‌شود
    const out = [];
    for (const t of ['فکر کنم فردا بارون بیاد', 'فکر کنم جوابش ۱۲ باشه', 'به نظرم این سؤال سخته؟']) { await ev(() => __one('کنکور', 'می‌خوام کنکور قبول شم.')); await ev((t) => __turn(t, []), t); out.push(await fcs()); }
    return [out.every(S => !S.preds.length && !S.sys.some(x => /چند درصد مطمئنی/.test(x))), J(out)]; };

  /*__MORE__*/

  // ---------- اجرا ----------
  for (const [nm, f] of Object.entries(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').includes(nm)) continue; info.n++;
    try { const r = await f(); if (r[0]) info.ok++; else errors.push(nm + ' ⇒ ' + String(r[1]).slice(0, 900)); } catch (e) { errors.push(nm + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  for (const n of Object.keys(E).map(Number).sort((a, c) => a - c)) { if (process.env.ONLY && !process.env.ONLY.split(',').includes('#' + n)) continue; info.n++;
    const be = BANK[n - 1]; if (!be) { info.nc[n] = 'bank entry missing'; continue; }
    try { const r = await E[n](); if (r && r.nc) { info.nc[n] = r.nc; continue; } if (r[0]) info.ok++; else errors.push('#' + n + ' [' + be.rc + '] «' + String(be.text).slice(0, 60) + '» ⇒ ' + String(r[1]).slice(0, 900)); } catch (e) { errors.push('#' + n + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  console.log(JSON.stringify({ n: info.n, ok: info.ok, nc: Object.keys(info.nc).length }));
  if (Object.keys(info.nc).length) console.log('NC: ' + JSON.stringify(info.nc, null, 1));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
