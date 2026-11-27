// تورِ پولیا (دستهٔ ۱، دورِ ۲۷b، سهمِ «history» — ۲۰۲۶-۱۱-۱۶): نیمهٔ 📜 ِ R6 و باقی‌ماندهٔ «story» (FIX27B).
//  هر بخش از جملهٔ خودِ دونده‌ها یا ورودیِ بانکِ مستقلِ tests/variants/VARIANTS_R27.json (شمارهٔ ۱-مبنا) ساخته شده و «شبیهِ منفی» ِ خودش را دارد.
//  قرمزِ نخست: LLA_FILE=<ساختِ BASE27B> — بخش‌های مثبت باید قرمز شوند. ساعتِ صفحه روی «اکنون» نصب می‌شود (بخش‌ها همان روزِ واقعی را می‌بینند)؛ فقط بخشِ پایانیِ C52 آن را روزبه‌روز جلو می‌برد تا هر هفت روزِ هفته سنجیده شود. هیچ تاریخِ تقویمی در انتظارها نیست.
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
  await p.clock.install({ time: new Date() });   // «اکنون» — رفتارِ بخش‌ها بی‌تغییر؛ فقط C52_week (پایان) روز را جلو می‌برد
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
  /* ۲۰۲۶-۱۱-۲۷ (دست‌به‌دستِ h…ff12): جملهٔ «جمعه …» در خودِ جمعه دوپهلوست و صفحه — درست — می‌پرسد «همین امروز یا جمعهٔ بعد؟» و «آره» را جواب نمی‌شمرد
     (دورِ ۲۵/۲۶). پس در جمعه جوابِ او خودِ روز است («جمعهٔ بعد») و راهِ بی‌حدس هم سنجیده می‌شود: تا جوابِ روشن، هیچ برنامه‌ای با تاریخ ثبت نشده است. */
  K.C52_attached = async () => { const noGuess = await ev(async () => { __wipe(); __fresh(); const fri = __nextDow(5), same = __wd(APP.today()) === 5;
      await __turn('جمعه قرارداد رو امضا می‌کنم.', [cs({ said: ['plan'], plan: { text: 'جمعه قرارداد رو امضا می‌کنم', when: fri } })]);
      const asked = String(((__cur().msgs || []).slice(-1)[0] || {}).text || '');
      const dated = () => (APP.dossier(__cur().id).events || []).some(e => e.k === 'cplan' && !(e.lines || []).some(l => /موعد: جلسهٔ بعد/.test(l)));
      if (!same) { await __turn('آره', [cs({})]); return [true, 'not friday']; }
      const q1 = /همین امروز یا جمعهٔ بعد/.test(asked) && !dated();
      await __turn('آره', [cs({})]); const q2 = !dated();   // «آره» جوابِ پرسشِ دوگزینه‌ای نیست ⇒ هنوز بی‌تاریخ
      await __turn('جمعهٔ بعد', [cs({})]); return [q1 && q2 && dated(), JSON.stringify([asked.slice(0, 120), q1, q2, dated()])]; });
    await ev(async () => { const thu = __nextDow(4);
      await __turn('پنجشنبه یادم بنداز که مدارکِ امضا رو آماده کنم.', [{ do: 'deadline', what: 'یادآور: آماده‌کردنِ مدارکِ امضا', date: thu }, cs({})]); await __turn('آره', [cs({})]); });
    const D = await sdos(), dl = await ev(() => APP.S.all('deadline').filter(d => !d.done && d.plan).length);
    return [noGuess[0] && dl === 1 && !D.some(x => /^deadline/.test(x)) && D.filter(x => /^cplan/.test(x) && /قرارداد/.test(x) && /⏰ یادآور \(همین برنامه\)/.test(x)).length === 1, J([noGuess, dl, D])]; };
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
      /* دورِ ۲۸ (arith، A28-7 «sqrt(…)» حالا خوانده می‌شود): «۳.۶۷» گردِ خودِ او از پیامِ پیشینِ همین اجرا است (s02 p4: «sqrt(3.2^2 + 1.8^2) ≈ 3.67») — بی آن پیام
         «≈ 4.005» با ۳.۶۷ ِ دقیق (۴٫۰۰۳۶) به حکمِ C9 نادرست است و «حل شد» به حساب نمی‌آید؛ با آن (C13 در همان گفت‌وگو) همان جمله درست است. انتظارِ مرحله‌ها همان است */
      await __turn('کف رو حساب کردم: sqrt(3.2^2 + 1.8^2) ≈ 3.67. باز هم از ۴ کمتره! گیر کردم.', [cs({ ph: 'u', stuck: true })]);
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

  /* ---------- #243 (C26-1): مسئلهٔ بازگفته رکوردِ تازه نیست؛ داده در A می‌نشیند (روی BASE27B هم سبز بود) ---------- */
  E[243] = async () => { const r = await ev(async () => { const [A] = __base3(); const n0 = APP.S.all('eprob').length;
      await __turn('یعنی همون مسئلهٔ قفسه‌ها، فقط با ۶ طبقه بجای ۵', [cs({ ph: 'u', said: ['d'] }), { do: 'chat_invent', title: 'قفسه‌ها با ۶ طبقه', statement: 'همون مسئلهٔ قفسه‌ها، فقط با ۶ طبقه بجای ۵' }]);
      return { n0, n1: APP.S.all('eprob').length, probs: APP.STORY.probs26(__cur()).length, dA: __dos(A) }; });
    return [r.n1 === r.n0 && r.probs === 2 && r.dA.some(x => /۶ طبقه/.test(x)), J(r)]; };
  /* ---------- #239: پروندهٔ گفت‌وگو سه مسئله را با نامِ خودشان و پروندهٔ تمرین را جدا می‌شمارد ---------- */
  E[239] = async () => { const D = await ev(async () => { const [A, B] = __base3(); await __turn('عرضِ هر طبقه ۸۰ سانته', [cs({ ph: 'u', said: ['d'] })]);
      APP.liveBindSession(B, __cur(), { force: true }); await __turn('سه رنگ داریم، پس ۶ حالت', [cs({ ph: 'b', said: ['result'], result: 'پس ۶ حالت' })]);
      const C = __mk('جلسهٔ ۴۵ دقیقه‌ای', 'جلسهٔ هفتگی‌مون ۴۵ دقیقه‌ست و ۶ نفر باید حرف بزنن؛ به هر کی چقدر می‌رسه؟'); APP.liveBindSession(C, __cur(), { force: true }); await __turn('۴۵ ÷ ۶ = ۷٫۵ دقیقه', [cs({ ph: 'b', said: ['result'], result: '۴۵ ÷ ۶ = ۷٫۵ دقیقه' })]);
      const tp = APP.S.put({ id: APP.uid('tp'), type: 'topic', title: 'خوابِ زود' }), c = APP.PR.start(41, APP.PR.subj('topic', tp.id)); const s = __cur(); s.prcs = [c.id]; APP.S.put(s);
      for (let i = 0; i < 3; i++) await __turn('خوب.', []);
      const d = APP.dossierSess(s.id); APP.go('dossier', s.id); const btn = document.querySelectorAll('#main .lp-dprc').length; return { pks: (d.pks || []).map(x => x.title), prcs: (d.prcs || []).map(x => x.title), btn }; });
    return [D.pks.length === 3 && ['قفسه‌های انباری', 'مهره‌های رنگی', 'جلسهٔ ۴۵ دقیقه‌ای'].every(t => D.pks.includes(t)) && D.prcs.length === 1 && D.btn === 1, J(D)]; };

  /* ---------- #234/#235/#250 (C78، مالک بانکِ ۴۲): جابه‌جایی و برگرداندنِ سطرِ بدجای 📜 ---------- */
  const mv = async () => ev(async () => { const [A, B] = __base3(); await __turn('شد ۱۲ حالت، درست درومد', [cs({ ph: 'b', said: ['result'], result: 'شد ۱۲ حالت' })]);
    const o = { A, B, ph0: APP.liveStoryPhase(A), ev0: ((APP.S.get('eprog_' + A).solve.live.evlog) || []).map(e => e.id) };
    APP.go('dossier', A); const btn = [...document.querySelectorAll('#main li.lp-dev')].filter(li => /۱۲ حالت/.test(li.innerText)).flatMap(li => [...li.querySelectorAll('.lp-dmv')]).filter(b => /مهره‌های رنگی/.test(b.textContent))[0]; o.btn = !!btn; if (btn) btn.click();   // دورِ ۲۸ (C123): صورت هم «↪» دارد — دکمهٔ همان سطر
    o.dA = __dos(A); o.dB = __dos(B); o.phA = APP.liveStoryPhase(A); o.phB = APP.liveStoryPhase(B); o.ev1 = ((APP.S.get('eprog_' + A).solve.live.evlog) || []).map(e => e.id);
    o.stB = (((__cur().coach || {}).story || {})['L:' + B] || { items: [] }).items.map(x => x.k + ':' + x.t); return o; });
  E[234] = async () => { const o = await mv(); const a = o.dA.filter(x => /۱۲ حالت/.test(x)), b = o.dB.filter(x => /۱۲ حالت/.test(x));
    return [o.btn && o.ph0 === 'b' && a.length === 1 && /جابه‌جا شد ⇒ «مهره‌های رنگی»/.test(a[0]) && b.length === 1 && /از «قفسه‌های انباری» جابه‌جا شد/.test(b[0]) && o.stB.some(x => /^res:.*۱۲ حالت/.test(x)) && o.phA !== 'b' && o.phB === 'b', J(o)]; };
  E[235] = async () => { await mv(); const o = await ev(async () => { const s = __cur(), [A, B] = APP.STORY.probs26(s).map(x => x.id).map(id => id.replace(/^L:/, ''));
      const pa = APP.S.all('eprob').map(r => r.p.id), A0 = pa.filter(id => APP.liveRec(id).p.title === 'قفسه‌های انباری')[0], B0 = pa.filter(id => APP.liveRec(id).p.title === 'مهره‌های رنگی')[0];
      APP.go('dossier', B0); const btn = document.querySelector('#main .lp-dunmv'); const had = !!btn; if (btn) btn.click();
      const evA = (APP.S.get('eprog_' + A0).solve.live.evlog || []).filter(e => /۱۲ حالت/.test((e.lines || []).join(' ')))[0] || {};
      return { had, dA: __dos(A0).filter(x => /۱۲ حالت/.test(x)), dB: __dos(B0).filter(x => /۱۲ حالت/.test(x)), hist: evA.mvHist || [], phA: APP.liveStoryPhase(A0), phB: APP.liveStoryPhase(B0) }; });
    return [o.had && o.dA.length === 1 && !/جابه‌جا شد ⇒/.test(o.dA[0].split(' ¦ ').slice(-1)[0]) && o.hist.length === 2 && o.dB.length === 1 && /برگشت به «قفسه‌های انباری»/.test(o.dB[0]) && o.phA === 'b' && o.phB !== 'b', J(o)]; };
  E[250] = async () => { const o = await mv(); return [o.ev0.every(id => o.ev1.includes(id)) && o.dA.some(x => /جابه‌جا شد ⇒/.test(x)), J([o.ev0, o.ev1])]; };   // منفی: سطرِ اصلی هرگز پاک نمی‌شود
  K.C78_neg = async () => {   // منفی: سطرِ بی مسئلهٔ دیگر در همان گفت‌وگو دکمهٔ جابه‌جایی ندارد؛ صورتِ مسئله هرگز
    const n = await ev(async () => { const A = __one('تنها', 'یه مسئلهٔ تنها دارم که ۲ متره.'); await __turn('شد ۱۲ حالت', [cs({ ph: 'b', said: ['result'], result: 'شد ۱۲ حالت' })]); APP.go('dossier', A); return document.querySelectorAll('#main .lp-dmv').length; });
    return [n === 0, n]; };

  /* ---------- #224 / #244 (D27-17 s30): برنامه و گزارشِ تمرین مالِ پروندهٔ تمرین‌اند، نه مسئلهٔ A ---------- */
  const withPrc = () => ev(() => { const [A, B] = __base3(); const tp = APP.S.put({ id: APP.uid('tp'), type: 'topic', title: 'خوابِ زود' }), c = APP.PR.start(41, APP.PR.subj('topic', tp.id)); const s = __cur(); s.prcs = [c.id]; APP.S.put(s); return [A, B, c.id]; });
  E[224] = async () => { const [A, , cid] = await withPrc(); const t = 'برنامهٔ تمرین: هر شب ساعت ۱۰ و نیم گوشی رو می‌ذارم کنار';
    const o = await ev(async ([A, cid, t]) => { await __turn(t, [cs({ ph: 'p', said: ['plan'], plan: 'هر شب ساعت ۱۰ و نیم گوشی رو می‌ذارم کنار' })]); const c = APP.S.get(cid);
      APP.go('practice', cid); const n = [...document.querySelectorAll('#main .prc-plan')].filter(x => /گوشی/.test(x.textContent)).length;
      return { dA: __dos(A).filter(x => /گوشی/.test(x)), plans: (c.plans || []).map(x => x.text), n, ph: APP.liveStoryPhase(A) }; }, [A, cid, t]);
    return [!o.dA.length && o.plans.length === 1 && o.n === 1 && o.ph !== 'c', J(o)]; };
  K.D27_17_neg = async () => {   // منفی: برنامه‌ای بی برچسبِ «تمرین» (کارِ خودِ مسئله) زیرِ همان مسئله می‌ماند
    const [A] = await withPrc(); const o = await ev(async (A) => { await __turn('فردا چوب‌ها رو اندازه می‌گیرم', [cs({ ph: 'p', said: ['plan'], plan: 'فردا چوب‌ها رو اندازه می‌گیرم' })]); return __dos(A).filter(x => /اندازه می‌گیرم/.test(x)); }, A);
    return [o.length === 1, J(o)]; };
  E[244] = async () => { const [A, , cid] = await withPrc(); const o = await ev(async ([A, cid]) => { const n0 = APP.STORY.probs26(__cur()).length, e0 = APP.S.all('eprob').length;
      await __turn('دیشب ساعت ۱۰ و نیم خوابیدم', [{ do: 'practice_log', prc: cid, quote: 'دیشب ساعت ۱۰ و نیم خوابیدم', ok: true }, cs({ ph: 'c' })]);
      const c = APP.S.get(cid); return { sess: (c.sessions || []).length, n1: APP.STORY.probs26(__cur()).length, n0, e0, e1: APP.S.all('eprob').length, dA: __dos(A).filter(x => /خوابیدم/.test(x)) }; }, [A, cid]);
    return [o.sess === 1 && o.n1 === o.n0 && o.e1 === o.e0 && !o.dA.length, J(o)]; };

  /* ---------- #223 (aB2): 📜 ِ مسئلهٔ تازه‌ثبت‌شده از نخستین صورتِ خودش آغاز می‌شود؛ سطرهای گفت‌وگوی A فقط مالِ A ---------- */
  const chatA = async () => ev(async () => { __wipe(); __fresh();
    await __turn('انباری ۲ متر ارتفاع داره. چند طبقه قفسه توش جا میشه؟', [cs({ ph: 'u', said: ['u', 'd'] })]);
    await __turn('هر طبقه ۴۰ سانت فاصله می‌خواد', [cs({ ph: 'u', said: ['d'] })]);
    await __turn('پس ۲۰۰ ÷ ۴۰ = ۵ طبقه، جواب شد ۵ طبقه', [cs({ ph: 'b', said: ['result'], result: 'جواب شد ۵ طبقه' })]);
    await __turn('برنامه‌م اینه که فردا چوب بخرم', [cs({ ph: 'p', said: ['plan'], plan: 'فردا چوب بخرم' })]); });
  E[223] = async () => { await chatA(); const o = await ev(async () => { const B = __mk('مهره‌های رنگی', 'سه رنگ مهره داریم؛ به چند حالت می‌شه دو مهره برداشت؟'); APP.liveBindSession(B, __cur(), { force: true });
      await __turn('سه رنگ مهره داریم؛ به چند حالت می‌شه دو مهره برداشت؟', [cs({ ph: 'u', said: ['u'] })]); const L = APP.S.get('eprog_' + B).solve.live;
      return { dB: __dos(B), ph: APP.liveStoryPhase(B), draft: JSON.stringify(L.uDraft || null), sd: (APP.dossier(__cur().id).events || []).map(e => (e.lines || [])[0]).filter(x => /۴۰ سانت|۵ طبقه|چوب بخرم/.test(x || '')) }; });
    return [!o.dB.some(x => /۴۰ سانت|۵ طبقه|چوب بخرم/.test(x)) && !/۴۰ سانت/.test(o.draft) && o.ph !== 'b' && o.sd.length >= 3, J(o)]; };
  K.B_D5_neg = async () => {   // منفی (B·D5): مسئلهٔ زنده‌ای که از همین گفت‌وگو ساخته شد کارِ گفت‌وگو را می‌گیرد
    await chatA(); const o = await ev(async () => { const A = __mk('قفسه‌های انباری', 'انباری ۲ متر ارتفاع داره. چند طبقه قفسه توش جا میشه؟'); APP.liveBindSession(A, __cur(), { force: true }); return __dos(A); });
    return [o.some(x => /۴۰ سانت/.test(x)) && o.some(x => /۵ طبقه/.test(x)), J(o)]; };

  /* ---------- #238: مسئلهٔ تازه در بازنگریِ B ⇒ ردیفِ «مسئله‌های تازه» یک بار، B بسته می‌ماند (روی BASE27B هم سبز بود) ---------- */
  E[238] = async () => { const o = await ev(async () => { const [A, B] = __base3(); APP.liveBindSession(B, __cur(), { force: true });
      await __turn('سه رنگ داریم، پس ۶ حالت. جواب شد ۶ حالت. حل شد!', [cs({ ph: 'b', said: ['result'], result: 'جواب شد ۶ حالت' }), { do: 'chat_solved', solution: '۶ حالت' }]);
      await __turn('یه مسئلهٔ تازه از مهره‌ها درومد: اگه ۵ رنگ باشه چی؟', [cs({ ph: 'b', said: [] }), { do: 'chat_invent', title: 'مهره‌ها با ۵ رنگ', statement: 'اگه ۵ رنگ مهره باشه، به چند حالت می‌شه دو مهره برداشت؟' }]);
      return { st: APP.S.get('eprog_' + B).solve.live.state, rows: __dos(B).filter(x => /۵ رنگ/.test(x)) }; });
    return [o.st === 'solved' && o.rows.length === 1 && /^newprobs/.test(o.rows[0]), J(o)]; };
  /* ورودی‌هایی که این دور ساخته نشد — با دلیل (هرگز بی‌صدا) */
  E[233] = async () => ({ nc: 'not built: chronological placement of a line backfilled by ✏️ (B24·D18) needs the ✏️ path to stamp story items with the time of the edited message instead of the edit turn (the ✏️ turn is a system turn that a45 onState skips); a multi-day replay with a moving page clock was not built this round.' });
  E[236] = async () => ({ nc: 'not built: a facet («خبرِ خواب») has no record of its own in the session model (C27-19); a plan cannot land in a record that does not exist — building facet records is a new capability left to the coordinator.' });

  /* ---------- C27-6 (pC2 p13): مقصدِ 🧭 ِ مسئلهٔ گفت‌وگو هرگز پرسشِ دربارهٔ سامانه نیست ---------- */
  K.C27_6 = async () => { const d = await ev(async () => { __wipe(); __fresh();
      await __turn('یه تیکهٔ تازه دارم. کنتورِ خونه‌مون هوشمنده و مصرفِ ساعت‌به‌ساعتِ کلِ خونه رو میده؛ می‌خوام سهمِ خودِ بخاری رو از این مصرفِ کل جدا کنم که ببینم واقعاً ماهی ۲۷۰ هزار میشه یا نه. سامانه روشی برای این داره؟', [cs({ ph: 'u', said: [] })]);
      return APP.STORY.dest({ sess: __cur().id }); });
    return [!/سامانه/.test(d) && /بخاری/.test(d), d]; };
  K.C27_6_neg = async () => {   // منفی: پرسشِ خودِ مسئله مقصد می‌ماند
    const d = await ev(async () => { __wipe(); __fresh(); await __turn('قبضِ برقمون ۵۰۰ هزار تومن شده. سهمِ بخاری از این قبض چقدره؟', [cs({ ph: 'u', said: [] })]); return APP.STORY.dest({ sess: __cur().id }); });
    return [/سهمِ بخاری از این قبض چقدره/.test(d), d]; };

  /*__MORE__*/

  // ---------- اجرا ----------
  for (const [nm, f] of Object.entries(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').includes(nm)) continue; info.n++;
    try { const r = await f(); if (r[0]) info.ok++; else errors.push(nm + ' ⇒ ' + String(r[1]).slice(0, 900)); } catch (e) { errors.push(nm + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  for (const n of Object.keys(E).map(Number).sort((a, c) => a - c)) { if (process.env.ONLY && !process.env.ONLY.split(',').includes('#' + n)) continue; info.n++;
    const be = BANK[n - 1]; if (!be) { info.nc[n] = 'bank entry missing'; continue; }
    try { const r = await E[n](); if (r && r.nc) { info.nc[n] = r.nc; continue; } if (r[0]) info.ok++; else errors.push('#' + n + ' [' + be.rc + '] «' + String(be.text).slice(0, 60) + '» ⇒ ' + String(r[1]).slice(0, 900)); } catch (e) { errors.push('#' + n + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  /* C52 در شش روزِ دیگرِ هفته (experiences/one-clock-one-scheduler…، ۲۰۲۶-۱۱-۱۷: هر انتظارِ وابسته به روزِ هفته در هر هفت روز). فقط رو به جلو و در پایان — پس از آن بخشی اجرا نمی‌شود. */
  if (!process.env.ONLY || process.env.ONLY.split(',').includes('C52_week')) { const t0 = Date.now(), WD = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
    for (let n = 1; n < 7; n++) { await p.clock.setSystemTime(new Date(t0 + n * 864e5)); const wd = WD[new Date(t0 + n * 864e5).getDay()];
      for (const nm of ['C52_attached', 'C52_neg']) { info.n++;
        try { const r = await K[nm](); if (r[0]) info.ok++; else errors.push(nm + ' @' + wd + ' ⇒ ' + String(r[1]).slice(0, 900)); } catch (e) { errors.push(nm + ' @' + wd + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } } } }
  console.log(JSON.stringify({ n: info.n, ok: info.ok, nc: Object.keys(info.nc).length }));
  if (Object.keys(info.nc).length) console.log('NC: ' + JSON.stringify(info.nc, null, 1));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
