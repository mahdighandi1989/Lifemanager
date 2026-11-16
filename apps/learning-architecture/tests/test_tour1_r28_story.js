// تورِ پولیا (دستهٔ ۱، دورِ ۲۸، سهمِ «story»: R5 — C86، C95، C96، C97؛ F3، F9، F10، F11؛ A28-12، A28-13، A28-27) — قرمزِ نخست با جمله‌های خودِ دونده‌ها
//  (ctl/cN.json و ai/rN.txt ِ T/round28X)، هر مثبت با بدلِ منفیِ خودش. LLA_FILE = ساختِ دیگر (قرمزِ نخست: ساختِ BASE28)؛ ONLY=<پیشوندِ بخش‌ها با ویرگول>.
//  ساعتِ صفحه دست نمی‌خورد و هیچ تاریخِ تقویمی در انتظارها نیست.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0 };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__noNav = true;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => { __calls.push({ user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
    window.__turn = async (text, actions) => { const n0 = __calls.length; __q.push({ reply: 'خوب.', status: 'related', memory: 'm', actions: actions || [] }); await APP.ASSIST.send(text); __q.length = 0;
      const c = __calls.slice(n0).filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {}; return String(c.user || '').split('# نوبتِ تازه')[0]; };
    window.__fresh = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc', 'ex'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__mk = (t, st) => APP.liveCreate(t, st, 'find', { by: 'user', sess: __cur().id }).p.id;
    window.__dos = (pid) => { try { const d = APP.dossier(pid); return (d.events || []).map(e => (e.title || '') + ' ¦ ' + (e.lines || []).join(' ¦ ') + ' ¦ ' + (e.out || '')); } catch (e) { return ['ERR ' + e]; } };
    window.__sdos = (pk) => { try { const d = APP.dossierSess(__cur().id, pk); return (d.events || []).map(e => (e.title || '') + ' ¦ ' + (e.lines || []).join(' ¦ ') + ' ¦ ' + (e.out || '')); } catch (e) { return ['ERR ' + e]; } };
    window.__st = () => { const s = __cur(), C = s.coach || {}; return { lprob: s.lprob || '', focus: APP.STORY.focus26(s), probs: APP.STORY.probs26(s).map(x => ({ id: x.id, t: x.title })),
      fc: APP.S.all('fcast').filter(x => !x.sample).map(x => ({ id: x.id, q: x.q, p: x.p, due: x.due || '', out: x.outcome || '', prob: x.prob || null })),
      preds: (C.preds || []).map(x => ({ t: x.text, p: x.p, out: x.out ? x.out.res : '' })), ask: s.predAsk && s.predAsk.state === 'open' ? s.predAsk.kind : '', sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text) }; };
  });
  const turn = (t) => p.evaluate((t) => __turn(t, []), t);
  const st = () => p.evaluate(() => __st());
  const J = (x) => JSON.stringify(x);
  const fresh1 = () => p.evaluate(() => { __wipe(); __fresh(); const pid = __mk('مسئلهٔ آزمون', 'یه مسئلهٔ واقعی دارم که باید حلش کنم و ببینم چی میشه.'); APP.liveBindSession(pid, __cur(), { force: true }); return pid; });
  const K = {};
  const csx = (o) => Object.assign({ do: 'coach_state', ans: [], said: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
  const turnA = (t, a) => p.evaluate(([t, a]) => __turn(t, a), [t, a]);
  const fa = (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  const evs = (A) => p.evaluate((A) => { const d = APP.dossier(A); return (d.events || []).map(e => ({ k: e.k, t: e.title, l: e.lines || [], out: e.out || '', wd: !!e.withdrawn, h: (e.hist || []).map(x => x.lab || ((x.old || '') + ' → ' + (x.new || ''))), b: (e.btns || []).map(b => b.label) })); }, A);

  /* ---------- F3 / C86 (S1 A28-5, s01 p17–p18): نشانِ ✓/✗ ِ 📜 از متنِ کنونیِ سطر؛ نشانِ پیشین به تاریخچه ---------- */
  const S01_17 = 'حسابِ ودیعه هم: ۲۰۰ میلیون تقسیم بر ۴۸ ماه = ۴٫۱۷ میلیون در ماه. سودِ بانکِ ودیعه هم ۲۰ درصدِ ۳۰۰ میلیون = ۶۰ میلیون در سال. اجارهٔ یک سال هم ۱۸ میلیون × ۱۲ = ۲۱۶ هزار.';
  const S01_17a = [csx({ ph: 'e', said: ['d', 'result'], result: '۱۸ میلیون × ۱۲ = ۲۱۶ هزار' })];
  const S01_18 = 'آهان، ۲۱۶ میلیون، هزار رو اشتباه نوشتم. راستی امضا رو جمعهٔ بعد بذار، این جمعه صاحبخونه نیست.';
  const S01_18a = [csx({ ph: 'e', said: ['d'], retract: { msg: '۲۱۶ هزار', key: 'datum:اجارهٔ یک سال', what: 'said', fix: '۲۱۶ میلیون', rests: [] } })];
  const rentProb = () => p.evaluate(() => { __wipe(); __fresh(); const pid = __mk('خرید یا اجاره', 'خونه بخرم یا اجاره کنم؟ ودیعه ۲۰۰ میلیون، اجاره ماهی ۱۸ میلیون.'); APP.liveBindSession(pid, __cur(), { force: true }); return pid; });
  const marks = (E) => E.filter(e => /^c(?:res|data)$/.test(e.k) && e.l.some(l => /۱۸ میلیون × ۱۲/.test(l))).map(e => ({ k: e.k, l: e.l }));
  K.C86_A28_5 = async () => { const A = await rentProb(); await turnA(S01_17, S01_17a); await turnA(S01_18, S01_18a); const M = marks(await evs(A));
    const ok = M.length >= 1 && M.every(e => /۲۱۶ میلیون/.test(e.l[0]) && e.l.some(l => /^حسابِ صفحه: ✓/.test(l)) && !e.l.some(l => /^حسابِ صفحه: ✗/.test(l)) && e.l.some(l => /^نشانِ پیشینِ صفحه.*✗/.test(l)));
    return [ok, J(M)]; };
  // بدلِ منفی: اصلاحی که هنوز غلط است ✗ ِ تازهٔ خودش را می‌گیرد (از متنِ تازه)، نه ✓
  K.C86_neg_stillwrong = async () => { const A = await rentProb(); await turnA(S01_17, S01_17a);
    await turnA('آهان، ۲۱۷ میلیون، هزار رو اشتباه نوشتم.', [csx({ ph: 'e', said: ['d'], retract: { msg: '۲۱۶ هزار', key: 'datum:اجارهٔ یک سال', what: 'said', fix: '۲۱۷ میلیون', rests: [] } })]); const M = marks(await evs(A));
    return [M.length >= 1 && M.every(e => /۲۱۷ میلیون/.test(e.l[0]) && e.l.some(l => /^حسابِ صفحه: ✗/.test(l)) && !e.l.some(l => /^حسابِ صفحه: ✓/.test(l))), J(M)]; };



  /* ---------- F10 / C95 (A28-33 oA1, B28·D11 nB1, C28-23 s24, D28-18 tD1): «↪» روی هر سطرِ 📜، هر 🎯 و هر گامِ دفتر؛ مقصد با رونوشت و «↩»؛ برچسبِ «جابه‌جا شد» با ساعتِ صفحه ---------- */
  const BIKE = 'سلام، برای تمرینِ دوچرخه خودم حساب کردم: هر دور ۱۵۰ ثانیه طول می‌کشه، ۱۲ دور. ۱۵۰ × ۱۲ = ۱۸۰۰ ثانیه = ۱۸ دقیقه. پس با ۱۸ دقیقه گرم‌کردن کلاً ۳۶ دقیقه. درسته؟';
  const BIKEP = [{ step: 'زمانِ دورها', quote: 'هر دور ۱۵۰ ثانیه طول می‌کشه، ۱۲ دور', verdict: 'ok', why: 'داده' }, { step: 'جمعِ دورها', quote: '۱۵۰ × ۱۲ = ۱۸۰۰ ثانیه = ۱۸ دقیقه', verdict: 'wrong', why: '۱۸۰۰ ثانیه ۳۰ دقیقه است' }, { step: 'کل', quote: 'با ۱۸ دقیقه گرم‌کردن کلاً ۳۶ دقیقه', verdict: 'incomplete', why: 'وابسته به گامِ ۲' }];
  const two = () => p.evaluate(() => { __wipe(); __fresh(); const A = __mk('تمرینِ دوچرخه', 'تمرینِ دوچرخه‌ام چقدر طول می‌کشه؟'); APP.liveBindSession(A, __cur(), { force: true });
    const B = __mk('خریدِ کاشی', 'برای کفِ حمام چند تا کاشی بخرم؟'); return [A, B]; });
  const dmv = (A, re) => p.evaluate(([A, re]) => { APP.go('dossier', A); return [...document.querySelectorAll('#main li.lp-dev')].filter(li => new RegExp(re).test(li.innerText)).map(li => [...li.querySelectorAll('.lp-dmv')].map(b => b.textContent)); }, [A, re]);
  const click = (A, re, bre) => p.evaluate(([A, re, bre]) => { APP.go('dossier', A); const li = [...document.querySelectorAll('#main li.lp-dev')].filter(li => new RegExp(re).test(li.innerText))[0]; const b = li && [...li.querySelectorAll(bre === 'unmv' ? '.lp-dunmv' : '.lp-dmv')].filter(b => bre === 'unmv' || new RegExp(bre).test(b.textContent))[0]; if (b) b.click(); return !!b; }, [A, re, bre]);
  K.C95_step_and_fc = async () => { const [A, B] = await two();
    await turnA(BIKE, [csx({ ph: 'e', said: [], prior: BIKEP })]);
    await turnA('فکر کنم تا جمعه تمرین رو کامل انجام می‌دم، ۷۰ درصد مطمئنم.', []);
    const st = await dmv(A, 'کارِ پیشین'), fc = await dmv(A, '🎯');
    const okB = st.length >= 1 && [1, 2, 3].every(n => st.some(bs => bs.some(t => t.indexOf('گامِ ' + fa(n) + ' مالِ مسئلهٔ «خریدِ کاشی»') >= 0))) && fc.length >= 1 && fc[0].some(t => /خریدِ کاشی/.test(t));
    const hit = await click(A, 'کارِ پیشین', 'گامِ ۱ مالِ');   // گامِ ۱ وابسته ندارد (C124 جدا آزموده می‌شود)
    const R = await p.evaluate(([A, B]) => { const a = APP.dossier(A), b = APP.dossier(B); return { a: a.events.filter(e => e.k === 'cprior').map(e => e.lines.join(' ¦ ')), b: b.events.filter(e => e.mv28).map(e => ({ t: e.title, l: e.lines, out: e.out, h: (e.hist || []).map(x => [x.lab || '', String(x.at || '').slice(0, 10)]), un: (e.btns || []).map(x => x.cls) })), today: APP.today() }; }, [A, B]);
    const ok = okB && hit && R.a.some(l => /گامِ ۱[^¦]*— جابه‌جا شد ⇒ «خریدِ کاشی»/.test(l)) && R.b.length === 1 && /هر دور ۱۵۰ ثانیه/.test(R.b[0].l[0]) && /از «تمرینِ دوچرخه» جابه‌جا شد/.test(R.b[0].out) && R.b[0].un.indexOf('lp-dunmv') >= 0
      && R.b[0].h.length === 1 && /^جابه‌جا شد/.test(R.b[0].h[0][0]) && R.b[0].h[0][1] === R.today;
    return [ok, J({ st, fc, hit, R })]; };
  K.C95_label_undo = async () => { const [A, B] = await two();
    await turnA('فکر کنم تا جمعه تمرین رو کامل انجام می‌دم، ۷۰ درصد مطمئنم.', []);
    const hit = await click(A, '🎯', 'خریدِ کاشی'), un = await click(B, '🎯', 'unmv');
    const R = await p.evaluate(([A, B]) => { APP.go('dossier', A); const t = document.getElementById('main').innerText; const a = APP.dossier(A).events.filter(e => e.k === 'fcast'); return { a: a.map(e => ({ wd: e.withdrawn, h: (e.hist || []).map(x => x.lab || 'OLD:' + x.old) })), hasFix: /اصلاح شد ⇐ «—»/.test(t), b: APP.dossier(B).events.filter(e => e.mv28).map(e => ({ wd: e.withdrawn, out: e.out })) }; }, [A, B]);
    return [hit && un && R.a.length === 1 && !R.a[0].wd && R.a[0].h.length === 2 && /^جابه‌جا شد/.test(R.a[0].h[0]) && /^برگشت به «تمرینِ دوچرخه»/.test(R.a[0].h[1]) && !R.hasFix && R.b.length === 1 && R.b[0].wd && /برگشت به/.test(R.b[0].out), J(R)]; };
  // بدلِ منفی: کسی که مسئلهٔ دیگری ندارد «↪» نمی‌بیند؛ (C123) صورتِ مسئلهٔ او وقتی مسئلهٔ دیگری هست «↪» دارد
  K.C95_neg_alone = async () => { const A = await p.evaluate(() => { __wipe(); __fresh(); const A = __mk('تمرینِ دوچرخه', 'تمرینِ دوچرخه‌ام چقدر طول می‌کشه؟'); APP.liveBindSession(A, __cur(), { force: true }); return A; });
    await turnA('فکر کنم تا جمعه تمرین رو کامل انجام می‌دم، ۷۰ درصد مطمئنم.', []); const n = await p.evaluate((A) => { APP.go('dossier', A); return document.querySelectorAll('#main .lp-dmv').length; }, A);
    const [A2] = await two(); const st = await dmv(A2, 'صورتِ مسئله');
    return [n === 0 && st.length >= 1 && st.every(bs => bs.length >= 1), J({ n, st })]; };

  /* C124: گامِ دفتری که وابسته دارد بی پرسش جابه‌جا نمی‌شود — وابسته‌ها نام برده و پرسیده می‌شوند */
  K.C124_deps_ask = async () => { const [A, B] = await two(); await turnA(BIKE, [csx({ ph: 'e', said: [], prior: BIKEP })]);
    const line3 = await p.evaluate((A) => APP.dossier(A).events.filter(e => e.k === 'cprior').map(e => e.lines.filter(l => /^گامِ ۳/.test(l))).flat(), A);
    await click(A, 'کارِ پیشین', 'گامِ ۲ مالِ');
    const R1 = await p.evaluate(([A, B]) => { APP.go('dossier', A); const t = document.getElementById('main').innerText; return { ask: (t.match(/گامِ ۲ وابسته دارد[^\n]*/) || [''])[0], moved: APP.dossier(B).events.filter(e => e.mv28).length, all: document.querySelectorAll('#main .lp-dmvall').length }; }, [A, B]);
    const ok1 = /گامِ ۳/.test(R1.ask) && R1.moved === 0 && R1.all === 1;
    await p.evaluate((A) => { APP.go('dossier', A); document.querySelector('#main .lp-dmvall').click(); }, A);
    const R2 = await p.evaluate((B) => APP.dossier(B).events.filter(e => e.mv28).map(e => e.lines[0]), B);
    return [ok1 && R2.length === 2 && R2.some(l => /^گامِ ۲/.test(l)) && R2.some(l => /^گامِ ۳/.test(l)), J({ line3, R1, R2 })]; };
  // بدلِ منفی: «فقط گامِ ۲» فقط همان را می‌برد
  K.C124_neg_one = async () => { const [A, B] = await two(); await turnA(BIKE, [csx({ ph: 'e', said: [], prior: BIKEP })]); await click(A, 'کارِ پیشین', 'گامِ ۲ مالِ');
    await p.evaluate((A) => { APP.go('dossier', A); document.querySelector('#main .lp-dmvone').click(); }, A);
    const R2 = await p.evaluate((B) => APP.dossier(B).events.filter(e => e.mv28).map(e => e.lines[0]), B); return [R2.length === 1 && /^گامِ ۲/.test(R2[0]), J(R2)]; };

  /* ---------- F9 / C96 + C125: «کارِ دیگری» فقط وقتی کسِ دیگری کنندهٔ حساب یا ادعاست؛ منبعِ داده = داده با برچسبِ منبع؛ جملهٔ خودش که از کمک‌کننده نام می‌برد مالِ خودش ---------- */
  const one = (t, st) => p.evaluate(([t, st]) => { __wipe(); __fresh(); const A = __mk(t, st); APP.liveBindSession(A, __cur(), { force: true }); return A; }, [t, st]);
  const story = (A) => p.evaluate((A) => ({ it: (((__cur().coach || {}).story || {})['L:' + A] || { items: [] }).items.map(x => x.k + ':' + x.t + (x.who ? '@' + x.who : '')), dos: __dos(A).filter(x => /کارِ دیگری|داده|منبع/.test(x)) }), A);
  const F9 = [
    ['A28-29 aA1 p2', 'تقسیمِ شیرینی‌ها', 'مامانم ۳ جعبه شیرینی خرید، هر جعبه ۸ تا.', 'مامانم کمکم کرد تاریخ رو نوشت. تولدم ۱۲ اسفند ۹۵ ـه. سوال میگه به هر کدوم از ما سه تا بچه چندتا شیرینی رسید', ['d'], false, ''],
    ['A28-30 aA1 p10', 'تقسیمِ شیرینی‌ها', 'مامانم ۳ جعبه شیرینی خرید، هر جعبه ۸ تا.', 'داداشم یه حسابِ دیگه کرد: هر جعبه ۴۰۰ هزار تومن بوده، پس ۳ × ۴۰۰ = ۱۲۰۰ هزار تومن.', [], true, 'داداشم'],
    ['C28-8 aC1 p15', 'سه دفتر', 'سه تا دفتر داریم، هر کدوم ۴۰۰ تومن.', 'داداشم یه حسابِ دیگه هم کرد: ۴ × ۲۵۰ = ۹۰۰. ولی فکر کنم غلطه.', [], true, 'داداشم'],
    ['B28·D12 s20 p1', 'نوسانِ گاما', 'شبکهٔ E–I–PV کی نوسانِ گاما می‌سازد؟', '۸ ماهه می‌خوام نشون بدم یه شبکه‌ی خاص با ۳ نوع نورون نوسان گاما تولید می‌کنه یا نه. استادم میگه «یه ایده بده». دیگه فکرم کار نمی‌کنه. ببین، g_EE رو ۰.۸ گذاشتم، τ_I رو ۸ میلی‌ثانیه، τ_PV ۳ میلی‌ثانیه، تأخیر سیناپسی ۱.۵', ['d'], false, ''],
    ['C125 datum source', 'پارکتِ پذیرایی', 'پذیرایی ۵ در ۴ متره، پارکت می‌خوام.', 'فروشنده گفت پرتِ پارکت ۱۲ درصده.', ['d'], false, 'SRC'],
    ['C125 calc (neg)', 'پارکتِ پذیرایی', 'پذیرایی ۵ در ۴ متره، پارکت می‌خوام.', 'فروشنده گفت ۲۰ × ۱٫۱۲ = ۲۲٫۴ متر پارکت لازمه.', [], true, 'فروشنده'],
  ];
  F9.forEach(([nm, ti, st0, t, said, other, who], i) => { K['C96_' + (i + 1)] = async () => { const A = await one(ti, st0); await turnA(t, [csx({ ph: 'e', said })]); const R = await story(A);
    const isO = R.it.some(x => /^other:/.test(x)), dosO = R.dos.some(x => /کارِ دیگری/.test(x));
    const ok = other ? isO && dosO && R.it.some(x => x.indexOf('@' + who) >= 0) : !isO && !dosO && (who !== 'SRC' || R.dos.some(x => /منبع: به گفتهٔ «فروشنده»/.test(x)));
    return [ok, nm + ' ' + J(R)]; }; });
  /* ---------- A28-12 (s02 p13/p15, s08 p10, s09 p15) و A28-30 (aA1 p10): حساب‌های خودش و کارِ دیگری بی گزارشِ مدل هم به 📜 می‌رسند ---------- */
  const truck = () => one('لوله در بارِ وانت', 'یه لوله‌ی ۴ متری رو باید بذارم پشتِ وانت که کفش ۲ در ۱٫۵ متره.');
  const calcs = (A) => p.evaluate((A) => APP.dossier(A).events.filter(e => /^c(?:calc|res|data|step|other)$/.test(e.k)).map(e => e.k + ' ¦ ' + e.lines.join(' ¦ ')), A);
  K.A28_12_said_empty = async () => { const A = await truck();
    await turnA('اگه بار رو سه قسمت کنم: ۴ تقسیم بر ۳ = ۱٫۳۳ متر هر تکه، ۸ ÷ ۳ = ۳ تا میله برای هر تکه. نسبتِ طول به عرضِ بار هم ۱۳/۱۲ = ۱ میشه.', [csx({ ph: 'e', said: [] })]);
    const R = await calcs(A); return [R.filter(x => /^ccalc/.test(x)).length >= 2 && R.some(x => /۱۳\/۱۲ = ۱[^¦]*¦ حسابِ صفحه: ✗/.test(x)), J(R)]; };
  K.A28_12_no_state = async () => { const A = await truck();
    await turnA('یه وانتِ دیگه هم هست: کفش ۱۵ دسی‌متر در ۸ دسی‌متره، پس قطرش √(۱۵² + ۸²) ≈ ۱۷ دسی‌متر.', []);
    const R = await calcs(A); return [R.some(x => /^ccalc ¦ .*√\(۱۵² \+ ۸²\) ≈ ۱۷/.test(x)), J(R)]; };
  K.A28_30_no_state = async () => { const A = await one('تقسیمِ شیرینی‌ها', 'مامانم ۳ جعبه شیرینی خرید، هر جعبه ۸ تا.');
    await turnA('داداشم یه حسابِ دیگه کرد: هر جعبه ۴۰۰ هزار تومن بوده، پس ۳ × ۴۰۰ = ۱۲۰۰ هزار تومن.', []);
    const R = await calcs(A); return [R.some(x => /^cother ¦ داداشم یه حسابِ دیگه کرد/.test(x)) && !R.some(x => /^ccalc/.test(x)), J(R)]; };
  // بدلِ منفی: نتیجه‌ای که مدل گزارش کرد دوباره «حسابِ تو» نمی‌شود؛ عددِ بی‌حساب هم سطر نمی‌گیرد
  K.A28_12_neg = async () => { const A = await truck();
    await turnA('۴ تقسیم بر ۲ = ۲ متر. کفِ وانت هم ۲ متره.', [csx({ ph: 'e', said: ['result'], result: '۴ تقسیم بر ۲ = ۲ متر' })]);
    await turnA('فردا ساعت ۸ می‌برمش.', [csx({ ph: 'e', said: [] })]);
    const R = await calcs(A); return [!R.some(x => /^ccalc/.test(x)) && R.some(x => /^cres/.test(x)), J(R)]; };
  /* ---------- F11 / C97 (B28·D10 oB1 c21) و A28-27 (s08 p8): مسئلهٔ جدا رکوردِ خودش؛ پیامی که سراسر مسئلهٔ تازه است در مسئلهٔ مادر نمی‌نشیند ---------- */
  const closed = (t, st) => p.evaluate(([t, st]) => { __wipe(); __fresh(); const A = __mk(t, st); APP.liveBindSession(A, __cur(), { force: true }); const pg = APP.S.get('eprog_' + A); pg.solve = pg.solve || {}; pg.solve.live = pg.solve.live || {}; pg.solve.live.state = 'solved'; pg.solve.live.stateAt = APP.nowISO(); APP.S.put(pg); return A; }, [t, st]);
  const lives = () => p.evaluate(() => APP.S.all('eprob', r => r && r.live && r.p).map(r => r.p.title));
  const newp = (A) => p.evaluate((A) => ((((APP.S.get('eprog_' + A).solve.b || {})[1] || {}).newProbs) || []).map(x => x.title || x.t), A);
  const OB1 = 'راستی یه مسئله‌ی دیگه هم دارم که به همین بیداری ربط داره ولی جداست: شب‌ها شام رو ساعت ۱۰ می‌خوریم و بعدش خوابم نمی‌بره. می‌خوام اینم حل کنم.';
  K.C97_oB1 = async () => { const A = await closed('بیدار شدنِ ساعتِ ۶', 'می‌خوام هر روز ساعت ۶ بیدار شم.');
    await turnA(OB1, [{ do: 'chat_invent', statement: 'شب‌ها شام رو ساعت ۱۰ می‌خوریم و بعدش خوابم نمی‌بره. می‌خوام اینم حل کنم.', title: 'شامِ ساعت ۱۰ و بی‌خوابی', nat: 'life', kind: 'find', from: A }, csx({ ph: 'u', said: [], nat: 'life' })]);
    const L = await lives(), N = await newp(A); return [L.some(t => /شامِ ساعت ۱۰/.test(t)) && !N.some(t => /شام/.test(t)), J({ L, N })]; };
  // بدلِ منفی (C126): «اگه … چی؟» در بازنگری همان مسئله می‌ماند — رکوردِ تازه نمی‌شود
  K.C97_neg_whatif = async () => { const A = await closed('بیدار شدنِ ساعتِ ۶', 'می‌خوام هر روز ساعت ۶ بیدار شم.');
    await turnA('اگه ساعت ۵ بخوام بیدار شم چی؟ همین روش جواب میده؟', [{ do: 'chat_invent', statement: 'اگه ساعت ۵ بخوام بیدار شم چی؟ همین روش جواب میده؟', title: 'بیداری ساعت ۵', nat: 'life', kind: 'find', from: A }, csx({ ph: 'b', said: [] })]);
    const L = await lives(); return [!L.some(t => /ساعت ۵/.test(t)), J(L)]; };
  K.A28_27_s08 = async () => { const A = await closed('ساعت‌شنیِ ۷ و ۱۱ برای ۱۵ دقیقه', 'با ساعت‌شنیِ ۷ و ۱۱ دقیقه‌ای چطور ۱۵ دقیقه اندازه بگیرم؟');
    await turnA('خودم یه معما ساختم: ساعت‌های ۵ و ۹ دقیقه، چطوری ۱۳ دقیقه؟ حلش کردم: ۹−۵=۴، بعد ۹+۴=۱۳.', [{ do: 'chat_invent', statement: 'خودم یه معما ساختم: ساعت‌های ۵ و ۹ دقیقه، چطوری ۱۳ دقیقه؟', title: 'ساعت‌شنیِ ۵ و ۹ برای ۱۳ دقیقه', nat: 'objective', kind: 'find', from: A }, csx({ ph: 'b', said: ['result'], nat: 'objective' })]);
    const D = await p.evaluate((A) => __dos(A).filter(x => /۹−۵|۹ − ۵/.test(x)), A), N = await newp(A); return [!D.length && N.length === 1, J({ D, N })]; };
  /*@@MORE@@*/
  for (const k of Object.keys(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').some(o => k.indexOf(o) === 0)) continue; info.n++;
    try { const r = await K[k](); if (r[0]) info.ok++; else errors.push(k + ' ⇒ ' + String(r[1]).slice(0, 900)); } catch (e) { errors.push(k + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
