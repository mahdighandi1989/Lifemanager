// تورِ دستهٔ ۱ ِ پولیا — دورِ ۳ ِ اصلاح («live»): تونلِ «🔭 مسئلهٔ حل‌نشدهٔ خودم» با کنترل‌های واقعیِ صفحه (پهنای ۳۹۰، ساعتِ ساختگی).
// بندها همان تصمیم‌های دورِ ۳ اند (DECISIONS_R3: D1–D4 در بخشِ a38، و A1–A13). هر بند با مسیرِ واقعیِ کاربر روی رکوردِ واقعی آزموده می‌شود.
// خطا ⇒ کدِ خروجِ غیرصفر. LLA_FILE (اختیاری) = مسیرِ html ِ دیگری (برای دیدنِ خطِ قرمزِ پیش از اصلاح روی ساختِ پیشین).
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const W = (ms) => p.waitForTimeout(ms || 90);
  const T0 = '2026-11-02';
  const D = (n) => { const d = new Date(2026, 10, 2 + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const day = async (n) => { await p.evaluate(x => { window.__day = x; }, D(n)); };
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await W(140); };
  const sel = async (s, v) => { await p.selectOption(s, v); await W(120); };
  const click = async (s) => { await p.click(s); await W(160); };
  const txt = (s) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent : ''; }, s);
  const has = (s) => p.locator(s).count();
  const S = (pid) => p.evaluate(pid => { const pg = APP.S.get('eprog_' + pid); return JSON.parse(JSON.stringify(pg && pg.solve || {})); }, pid);
  const R = (pid) => p.evaluate(pid => JSON.parse(JSON.stringify(APP.S.get('eprob_' + pid))), pid);
  const toasts = () => p.evaluate(() => (document.getElementById('toasts') || { textContent: '' }).textContent);
  const hookText = (sess, msg) => p.evaluate(([sess, msg]) => APP.ASSIST.promptHooks.map(f => { try { return f(sess, msg) || ''; } catch (e) { return 'ERR ' + e.message; } }).join('\n'), [sess, msg]);
  // در ساختِ پیش از اصلاح (LLA_FILE) کنترلِ تازه نیست — بی‌آن، بندهای بعدیِ همان جریان هم باید خطِ قرمزِ خودشان را نشان دهند
  const fillIf = async (s, v) => { if (await has(s)) await p.fill(s, v); };
  const selIf = async (s, v) => { if (await has(s)) await sel(s, v); };
  const clickIf = async (s) => { if (await has(s)) await click(s); };
  const section = async (name, fn) => { try { await fn(); } catch (e) { const m = String(e && e.message || e); errors.push(name + ' — exception: ' + m.split('\n')[0] + ' ' + ((m.match(/locator\([^)]*\)/) || [''])[0])); } };
  const mk = async (o) => {
    await go('e_prob', null, 'live');
    if (o.title != null) await p.fill('#lpNewT', o.title);
    await p.fill('#lpNewS', o.st); await W(60);
    if (o.kind) await sel('#lpNewType', o.kind);
    if (o.nat) await sel('#lpNewNat', o.nat);
    await click('main .lp-create');
    return p.evaluate(() => APP.state.arg);
  };
  const whole = async (one, why) => { await p.fill('#lpOne', one); await p.fill('#lpWhy', why); await click('main .lp-onesave'); };
  const understand = async (o) => {
    await whole(o.one, o.why || 'برایم مهم است و کنجکاوم');
    if (o.nat) await sel('#lpNat', o.nat);
    await p.fill('#lpUnk', o.unk);
    for (let i = 0; i < o.data.length; i++) { if (i >= 2) await click('main .lp-dadd'); await p.fill('#lpD_d' + (i + 1), o.data[i]); }
    await p.fill('#lpCond', o.cond);
    if (await has('#lpSat')) await sel('#lpSat', o.sat || 'yes');
    await sel('#lpSuff', o.suff || 'ناکافی است — چیزی کم است'); await p.fill('#lpSuffW', o.suffW || 'هنوز همه را نمی‌دانم');
    if (await has('#lpSuffChal')) await p.fill('#lpSuffChal', 'همهٔ داده‌ها با هم آن را معین می‌کنند');
    if (o.dep) { await sel('#lpDep', 'yes'); await p.fill('#lpDepW', o.dep); } else if (o.depNo && await has('#lpDep')) await sel('#lpDep', 'no');
    if (o.prac) { for (let i = 0; i < o.data.length; i++) await sel('#lpDE_d' + (i + 1), 'big'); await p.fill('#lpPrVague', '«بس» یعنی همان چیزی که لازم است'); await p.fill('#lpPrLine', o.prLine || 'رنگ و برند را بیرون می‌گذارم چون اثری ندارند'); await p.fill('#lpPrApprox', o.prApprox || 'دقتِ ده درصد بس است'); await p.fill('#lpPrPrior', 'پارسال همین کار را کردم'); await p.fill('#lpPrMeasure', o.measure || 'حجمِ لازم ≤ ۲۰۰ لیتر'); await W(80); }
    await p.fill('#lpGuess', o.guess || 'درست است'); await sel('#lpConf', o.conf || '60'); await p.fill('#lpTest', o.test || 'با یک حالتِ خاص می‌آزمایم');
    await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
    await click('main .lp-usave');
    if (o.expectMiss) return txt('main .lp-umiss');
    await click('main .lp-u .sv-g2');
    return '';
  };
  const answerUnused = async () => { for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); } };
  const addMove = async (mv, why) => { await sel('#lpMv', mv); await p.fill('#lpMvWhy', why); await click('main .lp-mvadd'); };
  const savePlan = async (plan) => { await p.fill('#lpPlan', plan); await W(350); await answerUnused(); await click('main .lp-plansave'); };
  const objStep = async (text, proof) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); if (await has('#lpProof')) await p.fill('#lpProof', proof); await click('main .lp-stepsave'); };
  // بازنگری: هر فیلدی که هست با پاسخِ مشخص پر می‌شود (o: انتخاب‌های ویژهٔ هر بند)
  const fillBack = async (o) => {
    o = o || {};
    const f = async (id, v) => { if (await has(id)) await p.fill(id, v); };
    const s2 = async (id, v) => { if (await has(id)) await sel(id, v); };
    await s2('#lpBWant', 'same');
    await f('#lpBChk', o.chk || 'جواب را در همهٔ شرط جای‌گذاری کردم'); await s2('#lpBRes', o.res || 'نتیجه سالم ماند');
    if (o.pod) await s2('#lpBPod', o.pod);
    await s2('#lpBHyp', 'all'); await s2('#lpBConcl', 'same');
    await f('#lpBOther', 'با حسابِ جداگانهٔ هر حالت به همین می‌رسیدم'); await f('#lpBGlance', 'جای‌گذاری و حلِ دستگاهِ ساده');
    await f('#lpBWorked', 'نوشتنِ هر کمیت برحسبِ یک مجهول'); await f('#lpBUse', 'هر جا چند مجهولِ وابسته دارم، همه را برحسبِ یکی می‌نویسم');
    await f('#lpBTaste', 'نمادگذاری را دوست داشتم، حسابِ طولانی را نه'); await s2('#lpBMulti', 'one');
    await f('#lpBLimit', 'اگر محیط به صفر برسد همهٔ ضلع‌ها صفر می‌شوند و فرمول همین را می‌گوید');
    await f('#lpBCond', 'هر بخشِ شرط در گامِ جای‌گذاری آمد'); await s2('#lpBDep', 'no');
    await f('#lpBDef', 'تعریفِ اول بودن در گامِ مثالِ نقض به کار رفت');
    await f('#lpBSym', 'نقش‌های یکسان در نتیجه هم یکسان‌اند'); await f('#lpBUnits', 'طول با طول');
    await f('#lpBDirect', 'بخشِ مستقیمِ برهان جداست');
    if (await has('#lpBHit')) { await sel('#lpBHit', o.hit || 'درست بود'); if (await has('#lpBHitW')) await p.fill('#lpBHitW', o.hitWhy || 'فرضِ پنهانِ تقارن مرا فریب داد'); }
    if (await has('#lpBBest')) await sel('#lpBBest', await p.evaluate(() => document.querySelector('#lpBBest option:nth-child(2)').value));
    await f('#lpBNew', o.newProb || 'همین روش برای چهارضلعی با محیطِ ۴۰ و شرط‌های تازه');
    await s2('#lpBNewS', o.share || 'method'); await f('#lpBNewW', 'نوشتنِ همه برحسبِ یک مجهول و جای‌گذاری در محیط');
    if (o.map != null) await f('#lpBNewM', o.map);
  };
  try {
    await p.goto(FILE); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(T0 => { window.__day = T0; APP.today = () => window.__day; APP.S.loaded = true; window.__rem = []; APP.HOST = Object.assign({}, APP.HOST || {}, { remind: async (pl) => { window.__rem.push(pl); return { ok: true }; }, unremind: async () => ({ ok: true }) }); }, T0);

    /* ===================== D4 — پیشنهادِ داور با واژهٔ کامل؛ مسئلهٔ کتابی با واحد ⇐ کامل‌بیان‌شده ===================== */
    await section('D4', async () => {
      await go('e_prob', null, 'live');
      const typeAndRead = async (t) => { await p.fill('#lpNewS', t); await W(80); return p.evaluate(() => document.getElementById('lpNewNat').value); };
      info.d4 = { tas: await typeAndRead('یه جعبه دارم که توش ۱۰۰۰ تاست؛ بفروشمش یا نگهش دارم؟'), less: await typeAndRead('اون ۲۴ که کمتره رو بخرم یا اون ۳۰ تایی رو؟'),
        book: await typeAndRead('مخزنی ۳۰۰ لیتری با شیری که دقیقه‌ای ۱۵ لیتر آب می‌ریزد در چند دقیقه پر می‌شود؟'), own: await typeAndRead('مخزنِ ٣٠٠ لیتری برای باغ بخرم'),
        prob: await typeAndRead('احتمالاً فردا باران می‌آید؛ چتر ببرم یا نه؟'), dice: await typeAndRead('دو تاس می‌ریزیم؛ احتمالِ جمعِ هفت چقدر است؟') };
      chk(info.d4.tas !== 'objective' && info.d4.less === 'life' && info.d4.book === 'objective' && info.d4.own === 'practical' && info.d4.prob !== 'objective' && info.d4.dice === 'objective',
        'D4: whole words only («تاست»≠تاس، «کمتره»≠متر، «احتمالاً»≠احتمال); textbook problem with units ⇒ objective; own purchase ⇒ practical ' + JSON.stringify(info.d4));
      await p.fill('#lpNewS', '');
    });

    /* ===================== D1 — «اثبات یا رد کن» پیش‌فرضِ کامل‌بیان‌شده، نه اجبار ===================== */
    let PH = null;
    await section('D1', async () => {
      await go('e_prob', null, 'live');
      await p.fill('#lpNewS', 'همکارم اطلاعاتِ پروژه را عمداً از من پنهان می‌کند — اثبات یا رد کن.'); await W(60);
      await sel('#lpNewType', 'pod');
      info.d1form = await p.evaluate(() => ({ v: document.getElementById('lpNewNat').value, dis: document.getElementById('lpNewNat').disabled }));
      chk(info.d1form.v === 'objective' && !info.d1form.dis, 'D1: pod preselects objective in the form but the picker stays editable ' + JSON.stringify(info.d1form));
      PH = await mk({ title: 'بدگمانی', st: 'همکارم اطلاعاتِ پروژه را عمداً از من پنهان می‌کند — اثبات یا رد کن.', kind: 'pod', nat: 'life' });
      info.d1 = await p.evaluate(pid => ({ k: APP.liveKind(pid), ki: APP.liveKindInfo(pid), rec: APP.S.get('eprob_' + pid).p.nat }), PH);
      chk(info.d1.k === 'life' && info.d1.ki.by === 'user' && info.d1.ki.set && info.d1.rec === 'life', 'D1: a life hypothesis in pod shape keeps the user\'s «life» judge ' + JSON.stringify(info.d1));
      await whole('می‌خواهم بدانم بدگمانی‌ام درست است یا نه', 'آرامشِ کار');
      info.d1u = await p.evaluate(() => ({ v: document.getElementById('lpNat').value, dis: document.getElementById('lpNat').disabled }));
      chk(info.d1u.v === 'life' && !info.d1u.dis, 'D1: understanding card keeps «life» for this pod and is not locked ' + JSON.stringify(info.d1u));
      chk(await p.evaluate(pid => APP.liveLookFlags(pid).proof, PH) === false, 'D1: a life pod gets no proof checks in look-back (no «همهٔ فرض/نتیجه = حکم» defect trap)');
      const PD = await mk({ title: 'زوج و فرد', st: 'اثبات یا رد کن: حاصل‌ضربِ دو عددِ فرد همیشه فرد است.', kind: 'pod' });
      info.d1def = await p.evaluate(pid => APP.liveKindInfo(pid), PD);
      chk(info.d1def.kind === 'objective' && info.d1def.by === 'type', 'D1: pod without an explicit judge ⇒ objective by default ' + JSON.stringify(info.d1def));
    });

    /* ===================== D4 — داورِ انتخاب‌نشده ⇒ قابِ خنثی در پرامپت ===================== */
    await section('D4-neutral', async () => {
      const P0 = await mk({ title: 'معنا', st: 'دربارهٔ معنای کارم فکر می‌کنم و به جایی نمی‌رسم.' });
      info.neu = await hookText({ id: 'ach_neu', lprob: P0, msgs: [] }, 'ادامه بدیم');
      chk(/داور: هنوز انتخاب نشده/.test(info.neu) && /پیش از هر پرسشِ دیگر بپرس/.test(info.neu) && !/هیچ‌کس نمی‌داند/.test(info.neu) && !/داور: تصمیم/.test(info.neu), 'D4: unset judge ⇒ neutral frame (ask the kind first), not the life frame ' + info.neu.slice(0, 260));
    });

    /* ===================== A11 + A2 + A13(c,e) — مسئلهٔ عملی ===================== */
    let PR = null;
    await section('A11/A2/A13c', async () => {
      PR = await mk({ title: 'کف‌سازی', st: 'برای کفِ حیاطِ خانه‌ام بتن بخرم؛ چقدر سفارش بدهم که کم نیاید و زیاد هم نماند؟', nat: 'practical' });
      info.a11 = await p.evaluate(pid => ({ u: APP.livePhaseQs(pid, 'u'), p: APP.livePhaseQs(pid, 'p') }), PR);
      chk(info.a11.u.some(q => /اثرِ محسوس/.test(q)) && !info.a11.u.concat(info.a11.p).some(q => /قضیه|عنصرِ کمکی/.test(q)), 'A11: practical ⇒ the practical (QK.pract) understand/plan lists, not the math list ' + JSON.stringify(info.a11));
      // A13c: قابِ عملی پاسخِ تهی نمی‌پذیرد
      const miss = await understand({ one: 'می‌خواهم بدانم چند مترمکعب بتن سفارش بدهم', unk: 'حجمِ بتن', data: ['حیاط ۲۰۰ مترمربع است', 'ضخامتِ کف ۱۲ سانت است'], cond: 'کم نیاید', prac: true,
        prLine: 'هیچی رو بیرون نمی‌ذارم', prApprox: 'نمی‌دونم، دلم می‌خواد دقیق باشه', measure: '۲۰۰ مترمربع × ۰.۱۲ متر = ۲۴ مترمکعب', expectMiss: true });
      chk(/کجا خط می‌کشی/.test(miss) && /کدام تقریب بس است/.test(miss), 'A13: practical frame rejects empty answers («هیچی رو بیرون نمی‌ذارم»، «نمی‌دونم، دلم می‌خواد دقیق باشه») ' + miss);
      // A2: واحدِ مرکبِ چسبیده درست شناخته می‌شود
      info.a2 = { out: await txt('main .lp-measout'), cls: await p.evaluate(() => document.querySelector('main .lp-measout').className), api: await p.evaluate(() => [APP.liveUnitsCheck('۲۰۰ مترمربع × ۰.۱۲ متر = ۲۴ مترمکعب').ok, APP.liveUnitsCheck('200 m^2 × 0.12 m = 24 m^3').ok, APP.liveUnitsCheck('۲۰۰ متر مربع × ۱۲ = ۲۴ متر مکعب').ok]) };
      chk(/good/.test(info.a2.cls) && !/واحد/.test(miss) && info.a2.api[0] && info.a2.api[1] && !info.a2.api[2], 'A2: compound units («مترمربع/مترمکعب»، m^2) accepted; a bare factor still asked ' + JSON.stringify(info.a2));
      await p.fill('#lpPrLine', 'رنگ و جنسِ سیمان را بیرون می‌گذارم چون در حجم اثری ندارند'); await p.fill('#lpPrApprox', 'ده درصد بیشتر بس است');
      await click('main .lp-usave'); await clickIf('main .lp-u .sv-g2');
      chk((await S(PR)).u[1] && (await S(PR)).u[1].prac && /مترمربع/.test((await S(PR)).u[1].prac.measure), 'A2: understanding with compound units saved');
      if (!(await S(PR)).u[1]) { await p.fill('#lpPrMeasure', 'حجم = ۲۰۰ متر مربع × ۰٫۱۲ متر'); await W(80); await click('main .lp-usave'); await clickIf('main .lp-u .sv-g2'); }
      // A11: کارتِ «پرسشِ همین لحظه» ِ صفحه همان فهرستِ نوع‌دار است
      info.a11ask = await txt('main .lp-ask .lp-q');
      chk(info.a11.p.some(q => info.a11ask.indexOf(q) >= 0), 'A11: the page\'s plan question comes from the same kind-aware list ' + info.a11ask);
    });

    /* ===================== A13(e) — حالتِ حدی پیش از آزمایش ===================== */
    await section('A13e', async () => {
      await go('lprob', PR, 'plan');
      await addMove('mv_special', 'اول یک مترمربع را حساب می‌کنم تا حجمِ کل را ببینم');
      await p.fill('#lpPlan2', 'اگر نشد از فروشندهٔ بتن می‌پرسم که معمولاً چقدر اضافه می‌دهند');
      await savePlan('نخست حجمِ یک مترمربع را حساب می‌کنم سپس برای کلِ حیاط ضرب می‌کنم');
      chk(await has('main .lp-stepf .lp-stlim') === 1, 'A13: a real (predicted) step in a quantity problem suggests the limiting case before the experiment');
    });

    /* ===================== A6 — دلیلِ «کافی است» که مجهول را پیش‌فرض می‌گیرد ===================== */
    await section('A6', async () => {
      const PT = await mk({ title: 'صندوق', st: 'پولِ صندوقِ مغازه کم شده؛ می‌خواهم بفهمم چه کسی برداشته.', nat: 'life' });
      const miss = await understand({ one: 'می‌خواهم بفهمم چه کسی پول را برداشته', unk: 'کسی که پول را برداشته', data: ['صبح صندوق را شمردم', 'عصر کمتر بود'], cond: 'بی‌گناهی را متهم نکنم',
        sat: 'yes', suff: 'کافی است', suffW: 'فقط سه نفر کلید داشتند پس کارِ یکی از آن‌هاست', expectMiss: true });
      chk(await has('main .lp-suffcirc #lpSuffCirc') === 1 && /پیش‌فرض/.test(miss), 'A6: a sufficiency reason that presupposes the unknown is challenged ' + miss);
      await fillIf('#lpSuffCirc', 'هیچ داده‌ای نمی‌گوید؛ پیش‌فرض است که کسِ دیگری کلید نداشت');
      if (!(await has('main .lp-u .sv-g2'))) await click('main .lp-usave'); await clickIf('main .lp-u .sv-g2');
      info.a6 = (await S(PT)).u[1];
      chk(info.a6 && info.a6.presup === true && /پیش‌فرض/.test(info.a6.suffCirc), 'A6: the presupposition is recorded as such ' + JSON.stringify(info.a6 && { p: info.a6.presup }));
    });

    /* ===================== A1 + A4 + A5 + A9 + A12 + A13(a,f,g,h,j) — مسئلهٔ یافتنیِ کامل‌بیان‌شده ===================== */
    let PF = null;
    await section('PF', async () => {
      // A13a: «؟۴۸۷؟» پایانِ جمله نیست
      const PX = await mk({ title: 'رقم‌ها', st: 'معمای رقمی: ؟۴۸۷؟ را طوری پر کن که بر ۹ بخش‌پذیر باشد.', nat: 'objective' });
      await whole('می‌خواهم رقم‌های ؟۴۸۷؟ را بیابم', 'معمای رقمی دوست دارم');
      chk(await has('#lpUnk') === 1 && !/فقط یک جمله/.test(await txt('main .lp-onemiss')), 'A13: «؟۴۸۷؟» is not a sentence end ' + await txt('main .lp-onemiss'));
      PF = await mk({ title: 'ضلع‌های مثلث', st: 'محیطِ مثلثی ۳۰ است؛ ضلعِ a دو برابرِ b و ضلعِ c دو واحد بیشتر از b است. ضلع‌ها چقدرند؟', nat: 'objective' });
      await understand({ one: 'می‌خواهم سه ضلعِ مثلث را بیابم', unk: 'طولِ ضلع‌های a و b و c', data: ['محیط ۳۰ است', 'a دو برابرِ b است', 'c دو واحد بیشتر از b است'], cond: 'a + b + c = 30', depNo: true, guess: 'هر سه ضلع برابرند' });
      // A13h: طرح بی ابزار ⇒ پیامِ دیدنی؛ پاسخِ مشخص به پرسشِ طرح ابزار است
      await p.fill('#lpPlan', 'نخست هر ضلع را برحسبِ b می‌نویسم سپس در محیط جای‌گذاری می‌کنم'); await W(300); await answerUnused(); await click('main .lp-plansave');
      chk(!(await S(PF)).live.plan && /ابزارِ طرح/.test(await txt('main .lp-planmiss')), 'A13: the plan refusal is visible on the card, not only in aria-live ' + await txt('main .lp-planmiss'));
      info.askQ = (await txt('main .lp-ask .lp-q')).replace(/^پرسش:\s*/, '');
      await p.fill('#lpAsk', 'بله، دستگاهِ معادله‌های خطی که همه را برحسبِ یک مجهول می‌نویسم'); await click('main .lp-askgo'); await click('main .lp-ask .sv-g2');
      chk((await p.evaluate(pid => APP.liveHeur(pid), PF)).includes('ask'), 'A13: an answered plan question counts as a used plan tool');
      if (!(await p.evaluate(pid => APP.liveHeur(pid), PF)).length) await addMove('mv_equation', 'هر ضلع را با نماد می‌نویسم تا شرطِ محیط معادله شود');
      await savePlan('نخست هر ضلع را برحسبِ b می‌نویسم سپس در محیط جای‌گذاری می‌کنم');
      chk((await S(PF)).live.plan && (await S(PF)).live.plan.heur.includes('ask'), 'A13: plan saved with the plan question as its tool');
      // A9: فقط معادله‌های واقعی؛ زنجیره یکی؛ «b = 7» جواب است
      await objStep('با جای‌گذاری در محیط: پس 30−x=y. با سه معادلهٔ قبلی: x=4.5y ⇒ y≈5.45', 'از جای‌گذاری در محیط');
      await objStep('هر ضلع برحسبِ b: a = 2b و c = b + 2 = 3b − 4', 'از داده‌های دوم و سوم');
      await objStep('جای‌گذاری در محیط: پس b = 7', 'از جمعِ ضلع‌ها');
      info.eqs = await p.evaluate(pid => APP.liveEquations(pid), PF);
      chk((await S(PF)).live.steps.length === 3 && info.eqs.length === 4 && info.eqs.includes('30−x=y') && info.eqs.includes('x=4.5y') && info.eqs.includes('a=2b') && info.eqs.some(e => /^c=b\+2=3b/.test(e)) && !info.eqs.some(e => /[ء-ی]/.test(e) || e === 'b=7'),
        'A9: only real equations (no prose, a chain counted once, «b = 7» is a result) ' + JSON.stringify(info.eqs));
      await fillIf('#lpEqUnk', '۵'); await clickIf('main .lp-eqsave');
      chk(/کم است/.test(await txt('main .lp-eqmsg')), 'A9: fewer equations than unknowns ⇒ «which part of the condition is not an equation yet?»');
      // A12: «✅ حل شد» بی بازنگری «حل شد» نیست
      await click('main .lp-solved');
      info.a12 = await p.evaluate(pid => APP.liveClosure(pid), PF);
      info.a12h = await hookText({ id: 'ach_pf', lprob: PF, msgs: [] }, 'حل شد فکر کنم');
      chk(info.a12.state === 'review' && !/^حل شد/.test(info.a12.label) && /در بازنگری/.test(info.a12h) && !/وضع: حل شد/.test(info.a12h), 'A12: before the look-back is saved the closure is «در بازنگری», never «حل شد» ' + JSON.stringify(info.a12));
      // A5: حالتِ حدی برای مسئلهٔ عددی، نه فقط فضایی؛ A13f: «داده‌ها ثابت‌اند» دوباره پرسیده می‌شود
      chk(await has('#lpBLimit') === 1 && await has('#lpBDep') === 1, 'A5/A13: non-spatial numeric problem asks the limiting case; «data fixed» from understanding is revisited');
      // A13g: «کدام پرسش کمک کرد؟» کلِ پرسش را نشان می‌دهد
      info.best = await p.evaluate(() => [...document.querySelectorAll('#lpBBest option')].map(o => o.textContent));
      chk(info.best.includes(info.askQ), 'A13: «which question helped?» lists the whole question ' + JSON.stringify({ q: info.askQ, opts: info.best }));
      // A13j: رونوشت (فقط فاصله/نیم‌فاصله/خطِ رقم) رد می‌شود؛ تغییرِ داده یا شرط مسئلهٔ تازه است
      await fillBack({ hit: 'نادرست بود', hitWhy: 'فرضِ پنهانِ تقارن مرا به حدسِ برابری برد', newProb: 'محیطِ  مثلثی 30 است؛ ضلعِ a دو برابرِ b و ضلعِ c دو واحد بیشتر از b است. ضلع‌ها چقدرند؟' });
      await click('main .lp-lbsave');
      chk(!(await S(PF)).b[1] && /همان مسئلهٔ اصلی/.test(await toasts()), 'A13: a copy that differs only in spacing/digit script is refused');
      await W(3200);
      // A4: «ساختار — هم‌ریخت» نگاشت می‌خواهد
      await p.fill('#lpBNew', 'محیطِ چهارضلعی‌ای ۴۰ است؛ هر ضلع چند واحد از قبلی بیشتر است. ضلع‌ها چقدرند؟'); await sel('#lpBNewS', 'form');
      chk(await has('#lpBNewM') === 1, 'A4: «structure — isomorphic» asks for the mapping');
      await fillIf('#lpBNewM', 'دقیقاً همان مسئله است'); await clickIf('main .lp-lbsave');
      chk(!(await S(PF)).b[1] && /نگاشت/.test(await toasts()) && !/همان مسئلهٔ اصلی/.test(await toasts()), 'A4: «it is exactly the same problem» is not a mapping (A.liveMapOk); A13: changed data/condition is a new problem');
      await fillIf('#lpBNewM', 'ضلع‌های مثلث ⇐ ضلع‌های چهارضلعی، محیطِ ۳۰ ⇐ محیطِ ۴۰'); await clickIf('main .lp-lbsave');
      info.pf = await S(PF);
      if (!info.pf.b[1]) { await p.fill('#lpBNew', 'محیطِ چهارضلعی‌ای ۴۰ است و ضلع‌ها به نسبتِ ۱، ۲، ۳، ۴ اند — ضلع‌ها چقدرند؟'); await sel('#lpBNewS', 'method'); await clickIf('main .lp-lbsave'); info.pf = await S(PF); }
      chk(info.pf.b[1] && info.pf.b[1].done && info.pf.b[1].newShare === 'form' && /⇐/.test(info.pf.b[1].newMap) && info.pf.b[1].limit && info.pf.b[1].depAgain === 'no', 'A4/A5/A13: look-back saved with mapping, limiting case and the revisited dependence ' + JSON.stringify(info.pf.b[1] && { v: info.pf.b[1].verdict, m: info.pf.b[1].newMap }));
      // A1: حدسِ ردشده «اثبات شد» نمی‌شود
      chk(info.pf.b[1].verdict === 'proved' && await has('main .lp-proved') === 0 && await has('main .lp-guessrefuted') === 1 && /رد شد/.test(await txt('main .lp-guessrefuted')) && /تقارن/.test(await txt('main .lp-guessrefuted')) && !info.pf.g[1].proved && info.pf.g[1].refuted,
        'A1: a refuted guess is shown «رد شد» with «why intuition failed», never «اثبات شد» ' + await txt('main .lp-lbsum'));
    });

    /* ===================== A3 + A7 — پلِ «خاص ⇐ عام» و حدِ قیاس ===================== */
    await section('A3/A7', async () => {
      const PA = await mk({ title: 'زاویه‌های چهارضلعی', st: 'ثابت کن مجموعِ زاویه‌های درونیِ هر چهارضلعیِ محدب ۳۶۰ درجه است.', kind: 'prove' });
      await understand({ one: 'می‌خواهم نشان دهم جمعِ زاویه‌ها همیشه ۳۶۰ است', unk: 'مجموعِ زاویه‌ها ۳۶۰ درجه است', data: ['چهارضلعی محدب است', 'چهار زاویهٔ درونی دارد'], cond: 'مجموعِ زاویه‌ها ۳۶۰ درجه است', suff: 'کافی است', suffW: 'همهٔ فرض آمده است' });
      // A7: قیاس بی حدش پذیرفته نمی‌شود
      await sel('#lpAuxK', 'analog'); await W(100);
      await p.fill('#lpAuxT', 'مثلث: جمعِ زاویه‌هایش ۱۸۰ است'); await p.fill('#lpAuxB', 'چهارضلعی را با یک قطر به دو مثلث می‌بُرم');
      await click('main .lp-auxsave');
      chk((await S(PA)).live.aux.length === 0 && /شباهت می‌شکند/.test(await txt('main .lp-auxmiss')), 'A7: an analogy needs its limits («کجا این شباهت می‌شکند؟») ' + await txt('main .lp-auxmiss'));
      await fillIf('#lpAuxLim', 'مثلث همیشه محدب است ولی چهارضلعی شاید مقعر باشد');
      if (!(await S(PA)).live.aux.length) await click('main .lp-auxsave');
      chk((await S(PA)).live.aux.length === 1 && /مقعر/.test((await S(PA)).live.aux[0].lim), 'A7: the analogy\'s limits saved');
      await sel('#lpMv', 'mv_analogy'); await W(100); await p.fill('#lpMvWhy', 'ساختارِ مثلث‌ها در چهارضلعی تکرار می‌شود');
      await click('main .lp-mvadd');
      chk(!(await S(PA)).live.moves.length && await has('#lpMvLim') === 1, 'A7: the «analogy» move asks where the analogy breaks');
      await fillIf('#lpMvLim', 'زاویه‌های بیرونی در قیاس نمی‌آیند'); if (!(await S(PA)).live.moves.length) await click('main .lp-mvadd');
      chk((await S(PA)).live.moves.length === 1, 'A7: analogy move saved with its limits');
      // A3: «خاص ⇐ عام» بی استدلالِ تعمیم
      await sel('#lpAuxK', 'special'); await W(100);
      chk(await has('main .lp-auxgenq') === 1, 'A3: a special auxiliary problem is told the bridge must generalise');
      await p.fill('#lpAuxT', 'مربع و مستطیل: هر زاویه ۹۰ درجه است'); await p.fill('#lpAuxB', 'پس برای همهٔ چهارضلعی‌ها هم درست است'); await click('main .lp-auxsave');
      info.a3aux = (await S(PA)).live.aux[1];
      chk(info.a3aux && info.a3aux.gen === false && await has('main .lp-auxnogen') === 1, 'A3: special ⇒ general without an argument is flagged «از حالت خاص به عام بدون استدلال» ' + JSON.stringify(info.a3aux));
      await savePlan('نخست مربع و مستطیل را می‌بینم سپس به همهٔ چهارضلعی‌ها می‌رسم');
      info.a7q = await p.evaluate(pid => APP.livePhaseQs(pid, 'c'), PA);
      chk(info.a7q.some(q => /کجا این شباهت می‌شکند/.test(q)), 'A7: execution questions ask where the analogy breaks');
      await objStep('در مربع و مستطیل هر زاویه ۹۰ درجه و مجموع ۳۶۰ است', 'تعریفِ مستطیل: چهار زاویهٔ قائمه');
      await click('main .lp-solved');
      await selIf('#lpXC_0', 'unused'); await fillIf('#lpXCW_0', 'حلِ اصلی از مستطیل‌ها آمد');
      await selIf('#lpXC_1', 'crossed'); await fillIf('#lpXCW_1', 'نتیجهٔ مستطیل‌ها همان نتیجهٔ همهٔ چهارضلعی‌هاست');
      chk(await has('main .lp-closegen') === 1, 'A3: the closing gate warns about special ⇒ general');
      await clickIf('main .lp-closego');
      await fillBack({ newProb: 'جمعِ زاویه‌های پنج‌ضلعیِ محدب' });
      await click('main .lp-lbsave');
      info.a3 = await S(PA);
      chk(info.a3.b[1] && info.a3.b[1].verdict === 'special' && info.a3.live.aux[1].crossed.gen === false && await has('main .lp-nogen') === 1 && !/✅ اثبات شد/.test(await txt('main .lp-lbsum')),
        'A3: special ⇒ general without argument cannot close as «اثبات شد» ' + JSON.stringify({ v: info.a3.b[1] && info.a3.b[1].verdict, s: await txt('main .lp-lbsum') }));
    });

    /* ===================== A10 + A13(d) — «اثبات یا رد کن» ===================== */
    await section('A10', async () => {
      const PP = await mk({ title: 'فرد و اول', st: 'اثبات یا رد کن: هر عددِ فردِ بزرگ‌تر از ۱ اول است.', kind: 'pod' });
      await whole('می‌خواهم ببینم هر فردی اول است یا نه', 'کنجکاوم');
      chk(await has('#lpSat') === 1 && /فرض برآوردنی/.test(await p.evaluate(() => document.querySelector('label[for="lpSat"]').textContent)), 'A13: pod card asks «is the hypothesis satisfiable?»');
      await p.fill('#lpUnk', 'هر عددِ فردِ بزرگ‌تر از ۱ اول است'); await p.fill('#lpD_d1', 'عدد فرد است'); await p.fill('#lpD_d2', 'عدد بزرگ‌تر از ۱ است');
      await p.fill('#lpCond', 'عدد اول است'); await selIf('#lpSat', 'yes'); await sel('#lpSuff', 'کافی است'); await p.fill('#lpSuffW', 'همهٔ فرض داده شده');
      if (await has('#lpSuffChal')) await p.fill('#lpSuffChal', 'فرد بودن و بزرگ‌تر بودن همه چیز را معین می‌کنند');
      await p.fill('#lpGuess', 'درست است'); await sel('#lpConf', '60'); await p.fill('#lpTest', 'چند عددِ فرد را می‌آزمایم'); await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
      await click('main .lp-usave'); await click('main .lp-u .sv-g2');
      await addMove('mv_special', 'چند عددِ فردِ کوچک را یکی‌یکی می‌آزمایم تا مثالِ نقض پیدا شود');
      await savePlan('نخست چند عددِ فرد را می‌آزمایم سپس مثالِ نقض می‌یابم');
      await objStep('عددِ ۹ فرد است ولی اول نیست — مثالِ نقض برای فرد', 'نه بر سه بخش‌پذیر است');
      await click('main .lp-solved');
      chk(await has('#lpBPod') === 1, 'A10: pod look-back first asks whether the claim was proved or refuted');
      await selIf('#lpBPod', 'refuted');
      info.a10l = await p.evaluate(() => document.querySelector('label[for="lpBHyp"]').textContent + ' | ' + document.querySelector('label[for="lpBConcl"]').textContent);
      chk(/مثالِ نقض/.test(info.a10l) && /خلافِ همان حکم/.test(info.a10l), 'A10: after «refuted» the checks are about YOUR refutation, not the refuted claim ' + info.a10l);
      await fillBack({ pod: 'refuted', hit: 'نادرست بود', hitWhy: 'فرد بودن را با اول بودن یکی گرفتم', newProb: 'اثبات یا رد کن: هر عددِ اولِ بزرگ‌تر از ۲ فرد است' });
      await selIf('#lpBPod', 'refuted'); await sel('#lpBHyp', 'all'); await sel('#lpBConcl', 'same');
      await click('main .lp-lbsave');
      info.a10 = { b: (await S(PP)).b[1], cl: await p.evaluate(pid => APP.liveClosure(pid), PP), sum: await txt('main .lp-lbsum') };
      chk(info.a10.b && info.a10.b.verdict === 'refuted' && info.a10.cl.refuted && !info.a10.cl.proved && /رد شد/.test(info.a10.sum) && !/اثبات شد/.test(info.a10.sum), 'A10: a refuted pod closes as «رد شد», not «اثبات شد» ' + JSON.stringify({ v: info.a10.b && info.a10.b.verdict, s: info.a10.sum.slice(0, 120) }));
      // A13d: «برآوردنی نیست» در pod ⇒ کارتِ شل کردنِ بخشی از فرض
      const PQ = await mk({ title: 'تهی', st: 'اثبات یا رد کن: هر عددی که هم زوج و هم فرد است بر ۷ بخش‌پذیر است.', kind: 'pod' });
      await understand({ one: 'می‌خواهم ببینم این حکم معنا دارد', unk: 'حکمِ بخش‌پذیری بر ۷', data: ['عدد زوج است', 'عدد فرد است'], cond: 'بر ۷ بخش‌پذیر است', sat: 'no' });
      await go('lprob', PQ, 'plan');
      info.a13d = await p.evaluate(() => ({ relax: !!document.querySelector('main .lp-relax'), opts: [...document.querySelectorAll('#lpRelax option')].map(o => o.textContent) }));
      chk(info.a13d.relax && info.a13d.opts.some(t => /زوج/.test(t)), 'A13: pod with an unsatisfiable hypothesis gets the relax-a-part card over its hypothesis parts ' + JSON.stringify(info.a13d));
    });

    /* ===================== A8 — «از طرح می‌آید؟» در هر دو سو ===================== */
    await section('A8', async () => {
      const PI = await mk({ title: 'جمعِ اعداد', st: 'ثابت کن برای هر n طبیعی 1 + 2 + … + n = n(n+1)/2 است.', kind: 'prove' });
      await understand({ one: 'می‌خواهم فرمولِ جمع را ثابت کنم', unk: 'فرمولِ جمع برای هر n', data: ['n طبیعی است', 'جمع از ۱ تا n است'], cond: 'جمع برابرِ n(n+1)/2 است', suff: 'کافی است', suffW: 'همهٔ فرض آمده است' });
      await addMove('mv_special', 'اول n های کوچک را حساب می‌کنم تا الگو را ببینم');
      await savePlan('نخست درستیِ حکم را برای n=1 وارسی می‌کنم، سپس فرض می‌کنم برای n درست است و برای n+1 نشان می‌دهم');
      info.a8 = await p.evaluate(pid => ({ ind: APP.liveStepFollowsTag(pid, 'پایه: n=1 درست است؛ گذر: از n به n+1 با افزودنِ n+1 به دو طرف'), chk: APP.liveStepFollowsTag(pid, 'درستیِ گامِ قبل را دوباره وارسی کردم') }), PI);
      chk(info.a8.ind === 'ind' && info.a8.chk === 'check', 'A8: an induction plan without the word «استقرا» accepts base+step; a checking step is part of any plan ' + JSON.stringify(info.a8));
      const PC = await mk({ title: 'مات در دو', st: 'در این وضعِ شطرنج سفید در دو حرکت مات می‌کند؛ حرکتِ اول چیست؟', nat: 'objective' });
      await understand({ one: 'می‌خواهم حرکتِ اولِ مات را بیابم', unk: 'حرکتِ اولِ سفید', data: ['شاهِ سیاه در گوشه است', 'سفید وزیر و رخ دارد'], cond: 'مات در دو حرکت' });
      await addMove('mv_special', 'اول کیش‌های ممکنِ وزیر را یکی‌یکی می‌سنجم');
      await savePlan('نخست با وزیر کیشِ دیگری می‌دهم سپس با رخ مات می‌کنم');
      info.a8b = await p.evaluate(pid => ({ neg: APP.liveStepFollowsTag(pid, 'وزیر را به b7 می‌برم؛ کیش نیست'), pos: APP.liveStepFollowsTag(pid, 'وزیر را به b7 می‌برم و کیش می‌دهم') }), PC);
      chk(info.a8b.neg === '' && info.a8b.pos === 'p1', 'A8: a step that negates the plan\'s move («کیش نیست») does not «follow» it by shared words ' + JSON.stringify(info.a8b));
    });

    /* ===================== D2 + D3 + A12(mind) + A13(b,l) — مسئلهٔ زندگی ===================== */
    await section('D2/D3/A12/A13b', async () => {
      const PL = await mk({ title: 'ویولن', st: 'هر روز ویولن تمرین کنم یا یک روز در میان؟ نمی‌دانم کدام بهتر است.', nat: 'life' });
      await understand({ one: 'می‌خواهم بهترین بسامدِ تمرین را بیابم', unk: 'هر روز یا یک روز در میان', data: ['روزی نیم ساعت وقت دارم', 'سه ماه است می‌نوازم'], cond: 'خسته نشوم', guess: 'هر روز تمرین بهتر است' });
      info.lifeQ = await p.evaluate(pid => ({ u: APP.livePhaseQs(pid, 'u'), p: APP.livePhaseQs(pid, 'p') }), PL);
      chk(!info.lifeQ.u.concat(info.lifeQ.p).some(q => /قضیه|عنصرِ کمکی|اثرِ محسوس|تقریب/.test(q)) && info.lifeQ.p.some(q => /قیدهای واقعی/.test(q)), 'A11: life ⇒ the life list (no math, no quantity-only questions) ' + JSON.stringify(info.lifeQ));
      // D2: ترتیب بر پایهٔ پله؛ پرسیده‌شده دوباره نه؛ پایانِ نردبان ⇒ C188
      info.d2 = await p.evaluate(pid => { const Q = APP.livePhaseQs(pid, 'p'); const a = APP.liveCoach(pid), b = APP.liveCoach(pid, { asked: [Q[0]] }), c = APP.liveCoach(pid, { asked: Q.slice() }); return { Q, a: a.q, b: b.q, br: b.rung, c: c.q, end: c.ladderEnd }; }, PL);
      chk(info.d2.a === info.d2.Q[0] && info.d2.b === info.d2.Q[1] && info.d2.br === 1 && !info.d2.c && info.d2.end, 'D2: coach order by rung — asked questions skipped, ladder end flagged ' + JSON.stringify(info.d2));
      info.d2h = await hookText({ id: 'ach_d2', lprob: PL, msgs: [{ role: 'user', text: 'سلام' }, { role: 'ai', text: info.d2.Q[0] }, { role: 'user', text: 'نه ندیده‌ام' }] }, 'خب');
      chk(info.d2h.indexOf('پرسشِ پیشنهادیِ این نوبت: «' + info.d2.Q[1] + '»') >= 0 && /پلهٔ ۲/.test(info.d2h), 'D2: the hook suggests the next rung after a question already asked in chat (not by message count) ' + info.d2h.slice(0, 200));
      info.d3h = await hookText({ id: 'ach_d3', lprob: PL, msgs: info.d2.Q.map(q => ({ role: 'ai', text: q })) }, 'باز هم گیرم');
      chk(/ایدهٔ کلیدی را جدا کن و فقط گامِ بعد را بگو، سپس «کتاب را ببند و خودت دوباره حل کن»/.test(info.d3h) && !/هرگز کلِ حل/.test(info.d3h), 'D3: end of the ladder ⇒ C188 wording (key idea + only the next step, then «close the book»)');
      // A12: گامِ ناموفق در کارنامهٔ ذهن ناموفق است
      await addMove('mv_special', 'یک هفته هر روز تمرین را می‌آزمایم تا ببینم چه می‌شود');
      await savePlan('نخست یک هفته هر روز تمرین می‌کنم سپس یک هفته یک روز در میان');
      const m0 = await p.evaluate(() => { const r = APP.MIND.phases().rows.find(x => x.id === 'exec'); const s = r.src.live || { k: 0, n: 0 }; return { k: s.k, n: s.n }; });
      await p.fill('#lpStep', 'این هفته هر روز نیم ساعت تمرین کنم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'آخرِ هفته قطعه را روان‌تر می‌زنم'); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا');
      await click('main .lp-stepsave');
      await day(1); await go('lprob', PL, 'exec');
      // A13l: پیامِ کهنهٔ «اول این‌ها» پس از ثبتِ موفق پاک می‌شود
      await click('main .lp-outsave');
      chk(await has('#toasts .toast.bad') >= 1, 'A13: a refused save shows «اول این‌ها»');
      await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', 'قطعه همان‌قدر سخت ماند'); await sel('#lpOMatch', 'no'); await sel('#lpOProg', 'نه'); await sel('#lpOWant', 'same'); await sel('#lpOGuess', 'refute');
      await p.fill('#lpOReflect', 'حدسم را اصلاح می‌کنم: کیفیتِ تمرین مهم‌تر از بسامد است');
      await click('main .lp-outsave');
      chk(await has('#toasts .toast.bad') === 0, 'A13: the stale «اول این‌ها» toast is cleared after the successful save');
      const m1 = await p.evaluate(() => { const r = APP.MIND.phases().rows.find(x => x.id === 'exec'); const s = r.src.live || { k: 0, n: 0 }; return { k: s.k, n: s.n }; });
      chk(m1.n === m0.n + 1 && m1.k === m0.k, 'A12 (R7): a live step done without progress counts as a FAILED execution in the mind card ' + JSON.stringify({ m0, m1 }));
      // A13b: سطرِ «حدسِ ردشده» خودِ حدس را می‌گوید، نه یک عدد
      info.refH = await hookText({ id: 'ach_ref', lprob: PL, msgs: [] }, 'حالا چی');
      chk(/حدسی که خودش با آزمون رد کرد: «هر روز تمرین بهتر است»/.test(info.refH) && !/رد کرد: [۰-۹]/.test(info.refH), 'A13: the refuted-guess line prints the claim, not a count ' + (info.refH.match(/حدسی که[^\n]*/) || [''])[0]);
    });

    /* ===================== A13(m) — bidi: پیکان و نتیجه در همان جداساز ===================== */
    await section('A13m', async () => {
      info.bidi = await p.evaluate(() => { const f = (t) => APP.ASSIST.bidiNodes(t).filter(x => x && x.tagName === 'BDI').map(x => x.textContent); return { u: f('واحدش: cm³/s ÷ cm² = ۲۴ cm/s است'), y: f('وقتی y→۰ می‌رود چه می‌شود؟') }; });
      chk(info.bidi.u.length === 1 && /cm³\/s ÷ cm² = ۲۴ cm\/s/.test(info.bidi.u[0]) && info.bidi.y.length === 1 && info.bidi.y[0] === 'y→۰', 'A13: a formula with Persian digits stays in ONE isolate (result and arrow included) ' + JSON.stringify(info.bidi));
    });
  } catch (e) { errors.push('exception: ' + (e && e.stack || e)); }
  console.log(JSON.stringify(info));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
