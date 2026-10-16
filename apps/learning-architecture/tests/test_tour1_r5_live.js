// تورِ دستهٔ ۱ ِ پولیا — دورِ ۵ ِ اصلاح («live»): تونلِ «🔭 مسئلهٔ حل‌نشدهٔ خودم» با کنترل‌های واقعیِ صفحه (پهنای ۳۹۰، ساعتِ ساختگی).
// بندها تصمیم‌های DECISIONS_R5 اند (F2 اولویتِ پرسشِ نوبت و کارتِ صفحه، F4 پیشنهادِ داور/نوع، F5 صداقتِ بازنگری، F7). هر بند روی مسیرِ واقعیِ کاربر و رکوردِ واقعی آزموده می‌شود.
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
  // گامِ واقعی (زندگی/عملی) با پیش‌بینی و موعد
  const realStep = async (text, pred, when) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); await p.fill('#lpPred', pred); await sel('#lpConf', '60'); await p.fill('#lpWhen', when || 'فردا'); await click('main .lp-stepsave'); };
  const outcome = async (o) => { await sel('#lpODone', o.done || 'yes'); await p.fill('#lpOWhat', o.what); if (await has('#lpOMatch')) await sel('#lpOMatch', o.match || 'yes'); await sel('#lpOProg', o.prog || 'کمی'); await sel('#lpOWant', 'same'); if (await has('#lpOGuess')) { await sel('#lpOGuess', o.grel || 'none'); if (o.grel === 'refute') await p.fill('#lpOReflect', o.reflect || 'حدسم را کنار می‌گذارم چون فیلم چیزِ دیگری نشان داد'); } await click('main .lp-outsave'); };
  const setParts = async (v) => { for (const id of await p.evaluate(() => [...document.querySelectorAll('select[id^="lpBCP_"]')].map(x => x.id))) await sel('#' + id, v); };
  try {
    await p.goto(FILE); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(T0 => { window.__day = T0; APP.today = () => window.__day; APP.S.loaded = true; window.__rem = []; APP.HOST = Object.assign({}, APP.HOST || {}, { remind: async (pl) => { window.__rem.push(pl); return { ok: true }; }, unremind: async () => ({ ok: true }) }); }, T0);

    /* ===================== F2 — یک پرسش در نوبت، یک منبع: نوبت ⇐ شکست ⇐ کارتِ صفحه ⇐ نردبان ===================== */
    await section('F2-turn', async () => {
      await day(0);
      const PA = await mk({ title: 'کیکِ مستطیلی', st: 'دستورِ کیکِ مادرم برای قالبِ گردِ ۲۰ سانتی است؛ قالبِ من ۲۵ در ۳۵ است. مواد را چند برابر کنم؟', nat: 'practical' });
      await understand({ one: 'می‌خواهم بدانم مواد را چند برابر کنم', unk: 'ضریبِ مواد', data: ['قالبِ گرد ۲۰ سانتی است', 'قالبِ من ۲۵ در ۳۵ است'], cond: 'کیک همان ارتفاع را داشته باشد', prac: true, measure: 'خمیر ≥ ۸۷۵ سانتی‌متر مربع کفِ قالب را بپوشاند' });
      // B3 («همهٔ داده‌ها؟») پیش از وجودِ طرح هرگز — نه پرسشِ نوبت، نه کارتِ صفحه
      const QP = await p.evaluate(pid => APP.livePhaseQs(pid, 'p'), PA);
      const b3i = QP.findIndex(q => /همه.{0,3}داده|اثرِ محسوس دارند همه/.test(q));
      info.f2b3 = await p.evaluate(([pid, QP, b3i]) => { const others = QP.filter((q, i) => i !== b3i); const c = APP.liveCoach(pid, { asked: others }); const pg = APP.S.get('eprog_' + pid); pg.tut = pg.tut || {}; pg.tut.qi = pg.tut.qi || {}; pg.tut.qi.lplan = b3i; APP.S.put(pg); return { q: c.q, b3: QP[b3i] }; }, [PA, QP, b3i]);
      await go('lprob', PA, 'plan');
      info.f2b3.card = await txt('main .lp-ask .lp-q');
      chk(b3i >= 0 && info.f2b3.q !== info.f2b3.b3 && info.f2b3.card.indexOf(info.f2b3.b3) < 0, 'F2: «همهٔ داده‌ها؟» (B3) is never the turn question nor the page card before a plan exists ' + JSON.stringify(info.f2b3));
      await addMove('mv_special', 'اول مساحتِ هر دو قالب را حساب می‌کنم تا نسبت را ببینم');
      await p.fill('#lpPlan2', 'اگر نشد از مادرم می‌پرسم برای قالبِ بزرگ چه می‌کرد');
      await savePlan('نخست مساحتِ دو قالب را حساب می‌کنم سپس مواد را به همان نسبت زیاد می‌کنم');
      await realStep('فردا مساحتِ دو قالب را حساب کنم و کیک را بپزم', 'ضریب حدودِ ۲٫۸ می‌شود', 'فردا');
      // پیش‌بینیِ گامِ باز ثبت شده ⇒ پرسشِ پیش‌بینی دوباره نه (s35)
      info.f2pred = await p.evaluate(pid => APP.liveCoach(pid).q, PA);
      chk(!/چه پیش‌بینی می‌کنی|فکر می‌کنی چه می‌شود/.test(info.f2pred) && !/کی انجامش می‌دهی/.test(info.f2pred), 'F2: once the open step\'s prediction (and day) is recorded, the prediction question is not suggested again ' + info.f2pred);
      await day(1); await go('lprob', PA, 'exec');
      info.f2due = await p.evaluate(pid => { const c = APP.liveCoach(pid); return { q: c.q, src: c.src, page: c.pageQ, same: c.samePage }; }, PA);
      chk(/موعدِ گامِ/.test(info.f2due.q) && info.f2due.same === true && info.f2due.src === 'page', 'F2: with nothing new this turn, the turn question is the page card\'s open question (and says so: samePage) ' + JSON.stringify(info.f2due));
      // (۱) نوبت: نسبتی که به کمیتِ تازه برده شد ⇒ حدِ قیاس، حتی وقتی گامی سررسیده است (s23)
      info.f2ana = await p.evaluate(pid => { const c = APP.liveCoach(pid, { turn: { text: 'زمانِ پختن هم ۲٫۸ برابر میشه؟' } }); const d = APP.liveCoach(pid, { turn: { analogy: true } }); return { q: c.q, src: c.src, same: c.samePage, q2: d.q }; }, PA);
      chk(/شباهت می‌شکند/.test(info.f2ana.q) && /شباهت می‌شکند/.test(info.f2ana.q2) && info.f2ana.src === 'turn-analogy' && info.f2ana.same === false, 'F2: a ratio carried to a new quantity THIS turn wins over the due-step question (analogy limit) ' + JSON.stringify(info.f2ana));
      info.f2hook = await hookText({ id: 'ach_f2a', lprob: PA, msgs: [] }, 'زمانِ پختن هم ۲٫۸ برابر میشه؟');
      chk(/پرسشِ پیشنهادیِ این نوبت: «قیاس را به کار بردی: کجا این شباهت می‌شکند/.test(info.f2hook), 'F2: the live hook suggests the analogy-limit question for that turn ' + (info.f2hook.match(/پرسشِ پیشنهادیِ این نوبت: «[^»]{0,60}/) || ['—'])[0]);
      // (۱) نوبت: نتیجه‌ای که کاربر گفت ⇒ «از راهِ دیگر؟ وارسی کن» پیش از ثبت در صفحه (s28)
      info.f2res = await p.evaluate(pid => { const c = APP.liveCoach(pid, { turn: { result: true } }); return { q: c.q, src: c.src, ph: c.ph }; }, PA);
      chk(/راهِ دیگری/.test(info.f2res.q) && /وارسی|سنجیدی/.test(info.f2res.q) && info.f2res.src === 'turn-result' && info.f2res.ph === 'c', 'F2: a result stated this turn ⇒ the look-back question «از راهِ دیگر؟ نتیجه را وارسی کن» while the page is still in execution ' + JSON.stringify(info.f2res));
      // امضای پیشین هنوز کار می‌کند
      chk(await p.evaluate(pid => { const c = APP.liveCoach(pid, { asked: [] }); return !!(c && c.q && c.list && c.list.length); }, PA), 'F2: the old call signature liveCoach(pid, {asked}) still works');
    });

    await section('F2-fail', async () => {
      await day(0);
      // پیش‌فرضِ شکسته هم در کارتِ نتیجهٔ صفحه (s22)
      const PT = await mk({ title: 'صندوق', st: 'پولِ صندوقِ مغازه کم شده؛ می‌خواهم بفهمم چه کسی برداشته.', nat: 'life' });
      await understand({ one: 'می‌خواهم بفهمم چه کسی پول را برداشته', unk: 'کسی که پول را برداشته', data: ['صبح صندوق را شمردم', 'عصر کمتر بود'], cond: 'بی‌گناهی را متهم نکنم', sat: 'yes', suff: 'کافی است', suffW: 'فقط سه نفر کلید داشتند پس کارِ یکی از آن‌هاست', expectMiss: true });
      await fillIf('#lpSuffCirc', 'هیچ داده‌ای نمی‌گوید؛ پیش‌فرض است که کسِ دیگری کلید نداشت');
      if (!(await has('main .lp-u .sv-g2'))) await click('main .lp-usave'); await clickIf('main .lp-u .sv-g2');
      await addMove('mv_special', 'اول فقط شیفتِ عصر را بررسی می‌کنم تا دامنه تنگ شود');
      await savePlan('نخست دوربینِ مغازه را نگاه می‌کنم سپس با هر سه نفر جدا حرف می‌زنم');
      await realStep('فیلمِ دوربینِ عصر را نگاه کنم', 'یکی از سه نفر را سرِ صندوق می‌بینم');
      await day(1); await go('lprob', PT, 'exec');
      await outcome({ what: 'نفرِ چهارمی که کلید نداشت سرِ صندوق رفت', match: 'no' });
      chk(await has('main .lp-presupback') === 1 && /کسِ دیگری کلید نداشت/.test(await txt('main .lp-presupback')), 'F2: the page outcome card raises the broken presupposition too (same as the turn question)');
      info.f2pre = await p.evaluate(pid => { const c = APP.liveCoach(pid); return { q: c.q, src: c.src }; }, PT);
      chk(info.f2pre.src === 'fail-presup' && /پیش‌فرضی که نگه داشتی/.test(info.f2pre.q), 'F2: the broken presupposition is the turn question ' + JSON.stringify(info.f2pre));
      // دادهٔ کنارگذاشته پس از حدسِ ردشده (s22)
      await day(0);
      const PS = await mk({ title: 'فروشِ کم', st: 'فروشِ مغازه‌ام در عصرها کم شده؛ می‌خواهم بفهمم چرا.', nat: 'life' });
      await understand({ one: 'دنبالِ دلیلِ افتِ درآمدِ عصرها هستم تا درستش کنم', unk: 'علتِ کم شدنِ فروشِ عصر', data: ['عصرها ۳ میلیون کمتر فروختیم', 'مغازهٔ روبه‌رو تخفیف داده', 'رنگِ تابلوی مغازه آبی است'], cond: 'علت را با شاهد بیابم', guess: 'تخفیفِ مغازهٔ روبه‌رو علت است' });
      await addMove('mv_special', 'اول فقط یک عصر را دقیق می‌شمارم تا دامنه تنگ شود');
      await p.fill('#lpPlan', 'نخست مشتری‌های عصر را می‌شمارم سپس از چند مشتری می‌پرسم'); await W(350);
      for (let rep = 0; rep < 2; rep++) for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) {
        const t = await p.evaluate(id => (document.querySelector('main .lp-plan .lp-un[data-d="' + id + '"]') || {}).textContent || '', id);
        if (/میلیون|تابلو|آبی/.test(t)) { await sel('#lpPU_a_' + id, 'skip'); await p.fill('#lpPU_w_' + id, /تابلو|آبی/.test(t) ? 'رنگِ تابلو سال‌هاست همین است و تغییری نکرده' : 'این عدد فقط اندازهٔ افت است و علت را نمی‌گوید'); } else { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); }
      }
      await click('main .lp-plansave');
      await realStep('فردا عصر مشتری‌ها را بشمارم', 'مشتری‌ها به مغازهٔ روبه‌رو رفته‌اند');
      await day(1); await go('lprob', PS, 'exec');
      await outcome({ what: 'مشتری‌ها همان قدر آمدند ولی کمتر خریدند', match: 'no', grel: 'refute' });
      chk(await has('main .lp-asideback') === 1, 'F2: after the guess is refuted, the page raises the data set aside earlier (s22)');
      info.f2asd = await p.evaluate(pid => { const c = APP.liveCoach(pid); return { q: c.q, src: c.src }; }, PS);
      chk(info.f2asd.src === 'fail-aside' && /کنار گذاشته بودی/.test(info.f2asd.q), 'F2: the set-aside datum after a refuted guess is the turn question ' + JSON.stringify(info.f2asd));
    });

    /* ===================== F4 — پیشنهادِ داور و نوع ===================== */
    await section('F4', async () => {
      await day(0);
      await go('e_prob', null, 'live');
      const read = async (t) => { await p.fill('#lpNewS', t); await W(80); return p.evaluate(() => [document.getElementById('lpNewNat').value, document.getElementById('lpNewType').value]); };
      info.f4 = {
        right: await read('صاحبخونه میگه طبق بند ۹ قرارداد اگر یک روز دیر کنم کل ماه جریمه داره؛ حق داره؟'),
        always: await read('فکر کنم همیشه n/(n+1) میشه… درسته دیگه؟'),
        cake: await read('دستور کیک مادرم برای قالب گرد ۲۰ سانتیه: ۳ تخم‌مرغ، ۱ پیمونه شکر، ۱۰۰ گرم کره. قالب من مستطیل ۲۵ در ۳۵ه. همه چی رو چند برابر کنم؟'),
        moto: await read('سه نفریم، یه موتور داریم که فقط دو نفر سوار می‌شن، سرعتش ۴۰ کیلومتر، پیاده هم ۵ کیلومتر. ایستگاه ۳۰ کیلومتره. قطار ۲ ساعت دیگه حرکت می‌کنه. می‌رسیم؟'),
        boss: await read('مطمئنم مدیرم عمداً جلوی ترفیع منو گرفته. می‌خوام بهش ایمیل تند بزنم یا برم پیش مدیرعامل. کدوم بهتره؟'),
        brine: await read('۲۰ لیتر آب‌نمک داریم. چند لیتر آب اضافه کنیم تا غلظت نصف شود؟')
      };
      const F = info.f4;
      chk(F.right[1] === 'pod' && F.always[1] === 'pod', 'F4: «حق داره؟» and «فکر کنم همیشه … میشه… درسته؟» ⇒ type pod ' + JSON.stringify([F.right, F.always]));
      chk(F.cake[0] === 'practical' && F.moto[0] === 'practical', 'F4: the user\'s own real resource («قالبِ من»، «سه نفریم… می‌رسیم؟») ⇒ practical ' + JSON.stringify([F.cake, F.moto]));
      chk(F.boss[0] === 'life' && F.boss[1] === 'find' && F.brine[0] === 'objective', 'F4: a workplace conflict stays life (a decision, not pod); the textbook brine stays objective ' + JSON.stringify([F.boss, F.brine]));
      await p.fill('#lpNewS', '');
      // معمای نشستن ⇒ «شاید فضایی» نه
      const PZ = await mk({ title: 'چیدمان', st: '۹ نفر، سه میزِ سه‌نفره؛ هر عمه کنارِ دقیقاً یک پسرعمو، هیچ دو پسرعمو سرِ یک میز نه. آیا چیدمانی هست که همهٔ قوانین را برآورد؟', nat: 'objective' });
      await whole('می‌خواهم ببینم چیدمانِ درست هست یا نه', 'کنجکاوم');
      chk(await has('main .lp-spathint') === 0, 'F4: a seating puzzle («میز… چیدمان») is not suggested as spatial');
      const PC = await mk({ title: 'قالب', st: 'قالبِ دایره‌ای ۲۰ سانتی و مستطیلِ ۲۵ در ۳۵ — مساحتشان چه نسبتی دارد؟', nat: 'objective' });
      await whole('می‌خواهم نسبتِ مساحتِ دو قالب را بیابم', 'کنجکاوم');
      chk(await has('main .lp-spathint') === 1, 'F4: a real shape problem still gets the spatial hint');
      // داورِ کارتِ فهم همان لحظه ذخیره می‌شود (s13)
      const PN = await mk({ title: 'یک پرسش', st: 'یه چیزی ذهنمو مشغول کرده و می‌خوام روشن بشم.' });
      await whole('می‌خواهم این موضوع برایم روشن شود', 'ذهنم را مشغول کرده');
      await sel('#lpNat', 'life');
      info.f4nat = await p.evaluate(pid => ({ ki: APP.liveKindInfo(pid), r: APP.S.get('eprob_' + pid).p.nat }), PN);
      const hk = await hookText({ id: 'ach_f4n', lprob: PN, msgs: [] }, 'سلام');
      chk(info.f4nat.ki.set === true && info.f4nat.r === 'life' && !/داورِ این مسئله هنوز انتخاب نشده/.test(hk), 'F4: the judge picked on the understanding card is saved at once (hook no longer says «هنوز انتخاب نشده») ' + JSON.stringify(info.f4nat));
      // chat_invent ِ همان مسئلهٔ تازه با صورتِ تازه ⇒ نوع دوباره حدس زده می‌شود (s25)
      info.f4inv = await p.evaluate(() => {
        const par = APP.liveCreate('جمعِ کسرها', 'جمعِ ۱/(1·2) + ۱/(2·3) + … + ۱/(n(n+1)) را بیابید.', 'find', { nat: 'objective' });
        const se = { id: 'ach_f4inv', msgs: [] }; APP.ASSIST._turnSession = se;
        APP.ASSIST.DO.chat_invent({ title: 'جمعِ کسرها تا n', statement: 'جمعِ ۱/(1·2) + … + ۱/(n(n+1)) برای هر n چند است؟', from: par.p.id });
        const ch = APP.liveAll().find(x => x.origin && x.origin.id === par.p.id); const k0 = ch && ch.p.kind;
        APP.ASSIST.DO.chat_invent({ title: 'جمعِ کسرها تا n', statement: 'فکر کنم همیشه n/(n+1) میشه… درسته دیگه؟', from: par.p.id });
        APP.ASSIST._turnSession = null;
        const kids = APP.liveAll().filter(x => x.origin && x.origin.id === par.p.id);
        return { k0, n: kids.length, k1: kids[0] && APP.S.get('eprob_' + kids[0].p.id).p.kind };
      });
      chk(info.f4inv.n === 1 && info.f4inv.k0 === 'find' && info.f4inv.k1 === 'pod', 'F4: a chat_invent update of the same new problem re-guesses its type (conjecture ⇒ pod) ' + JSON.stringify(info.f4inv));
    });

    /* ===================== F5 — صداقتِ بازنگری ===================== */
    const objSetup = async (o) => {
      const P0 = await mk({ title: o.title, st: o.st, nat: 'objective' });
      await understand(Object.assign({ depNo: true }, o.u));
      await addMove('mv_equation', 'هر کمیت را با نماد می‌نویسم تا شرط معادله شود');
      await savePlan(o.plan || 'نخست هر کمیت را با نماد می‌نویسم سپس در شرط جای‌گذاری می‌کنم');
      for (const st of o.steps || ['هر کمیت را با نماد نوشتم و در شرط جای‌گذاری کردم']) await objStep(st, 'از داده‌ها و جای‌گذاری');
      return P0;
    };
    await section('F5-neg', async () => {
      const P1 = await objSetup({ title: 'سود و قرارداد', st: 'مغازه‌ای با اجارهٔ معلوم؛ سودِ ماه و مدتِ قرارداد را حساب کن.', u: { one: 'می‌خواهم سود و مدت را بیابم', unk: 'سودِ ماه و مدتِ قرارداد', data: ['اجاره معلوم است', 'فروش معلوم است'], cond: 'سودِ ماه دست‌کم ۲۰ میلیون باشد\nپسرم تا ۷ سال اسباب‌کشی نکنه' } });
      await click('main .lp-solved');
      await fillBack({ chk: 'سود ۱۷٫۵ میلیون؛ به ۲۰ نرسید. قرارداد ۵ ساله است نه ۷ ساله' });
      info.f5neg = await p.evaluate(() => [...document.querySelectorAll('main .lp-bpneg')].map(x => x.getAttribute('data-part')));
      chk(info.f5neg.includes('0') && info.f5neg.includes('1'), 'F5: a check whose number contradicts a part («۱۷٫۵… به ۲۰ نرسید» vs «دست‌کم ۲۰»; «۵ ساله نه ۷» vs «تا ۷ سال») is flagged next to it ' + JSON.stringify(info.f5neg));
      await setParts('yes');
      await click('main .lp-lbsave');
      chk(!(await S(P1)).b[1] && await has('#lpBSoftWhy') === 1, 'F5: ticking «بله» against a contradicting check is a soft challenge (not a silent «سالم»)');
    });
    await section('F5-imp', async () => {
      const P2 = await objSetup({ title: 'پوشش', st: 'صفحهٔ ۸×۸ ِ بی دو خانهٔ گوشهٔ مقابل را با دومینوها بپوشان؛ پوشش را بیاب.', u: { one: 'می‌خواهم پوشش را بیابم یا نشان دهم نیست', unk: 'یک پوششِ کامل با دومینو', data: ['صفحه ۸ در ۸ است', 'دو خانهٔ گوشهٔ مقابل برداشته شده'], cond: 'هر دومینو دو خانهٔ کنارِ هم را بپوشاند\nهمهٔ ۶۲ خانه پوشیده شوند' }, steps: ['هر دومینو یک خانهٔ سیاه و یک سفید می‌پوشاند؛ دو گوشهٔ مقابل هم‌رنگ‌اند پس ۳۰ و ۳۲ می‌ماند و پوشش ناممکن است'] });
      await click('main .lp-solved');
      info.f5imp = await p.evaluate(() => [...document.querySelectorAll('#lpBCP_0 option')].map(o => o.value));
      chk(info.f5imp.includes('imp'), 'F5: each condition part offers «جوابی نیست — ثابت کردم این شرط‌ها با هم برآوردنی نیستند» ' + JSON.stringify(info.f5imp));
      await fillBack({ chk: 'شمارِ خانه‌های سیاه و سفید را شمردم: ۳۰ و ۳۲' }); await selIf('#lpBMulti', 'none');
      await setParts('imp');
      chk(await has('main .lp-bdefect') === 0, 'F5: an impossibility result is not forced into a defect');
      await click('main .lp-lbsave');
      info.f5impV = await p.evaluate(pid => APP.liveClosure(pid), P2);
      chk(info.f5impV.state === 'solved' && info.f5impV.verdict === 'impossible' && /ناممکن/.test(info.f5impV.label), 'F5: closes as «✅ ناممکن (اثبات شد)» ' + JSON.stringify({ s: info.f5impV.state, v: info.f5impV.verdict, l: info.f5impV.label }));
    });
    await section('F5-many', async () => {
      const P3 = await objSetup({ title: 'قیمتِ گوسفند', st: 'دفتر: «۳۶ رأس گوسفند: ؟۴۸۷؟ ریال» — رقمِ اول و آخر محو است. قیمتِ هر گوسفند؟', u: { one: 'می‌خواهم قیمتِ هر گوسفند را بیابم', unk: 'قیمتِ هر گوسفند', data: ['۳۶ رأس', 'کل به شکلِ ؟۴۸۷؟ است'], cond: 'کل بر ۳۶ بخش‌پذیر است', suff: 'کافی است', suffW: 'بخش‌پذیری یکتا می‌کند' }, steps: ['بخش‌پذیری بر ۴ و ۹: دو عدد 64872 و 24876 هر دو جوابند'] });
      await click('main .lp-solved');
      await fillBack({ chk: 'هر دو را بر ۳۶ تقسیم کردم' }); await sel('#lpBMulti', 'many'); await fillIf('#lpBMultiW', 'رقمِ اول را هیچ بخشی از شرط جدا نمی‌کند');
      await setParts('yes');
      chk(await has('#lpBMultiAll') === 1, 'F5: «بیش از یکی» asks «همه را یافتی، یا شرط را کامل کردی؟»');
      await selIf('#lpBMultiAll', 'no');
      await click('main .lp-lbsave');
      info.f5many = await p.evaluate(pid => ({ c: APP.liveClosure(pid), suff: APP.liveSuffNow(pid) }), P3);
      chk(info.f5many.c.verdict !== 'proved' && info.f5many.c.verdict === 'partial' && /ناکافی/.test(info.f5many.suff || ''), 'F5: «بیش از یکی» + not all found ⇒ never «اثبات شد»; the understanding «کافی است» is updated to insufficient ' + JSON.stringify({ v: info.f5many.c.verdict, l: info.f5many.c.label, suff: info.f5many.suff }));
    });
    await section('F5-defect', async () => {
      const P4 = await objSetup({ title: 'ضلع‌ها', st: 'محیطِ مثلثی ۳۰ است؛ a دو برابرِ b و c دو واحد بیشتر از b است. ضلع‌ها؟', u: { one: 'می‌خواهم سه ضلع را بیابم', unk: 'a و b و c', data: ['محیط ۳۰ است', 'a دو برابرِ b است'], cond: 'a + b + c = 30\nهر سه ضلع مثبت‌اند' }, steps: ['a = 2b و c = b + 2 پس 4b + 2 = 30'] });
      await click('main .lp-solved');
      await p.fill('#lpBChk', 'جمع را دوباره حساب کردم'); await sel('#lpBRes', 'ایرادی یافتم'); await sel('#lpBWant', 'same');
      await p.fill('#lpBDefW', 'جمعِ ضلع‌ها ۳۰ نشد — گامِ جای‌گذاری را دوباره حساب می‌کنم'); await sel('#lpBDefTo', 'c');
      await click('main .lp-lbsave');
      info.f5def = await p.evaluate(pid => APP.liveClosure(pid), P4);
      chk(info.f5def.state === 'incomplete', 'F5: filing a defect is not blocked by unanswered per-part checks (s03) ' + JSON.stringify({ s: info.f5def.state, l: info.f5def.label }) + ' ' + (await toasts()).slice(-160));
      // دوباره «✅ حل شد» ⇒ «در بازنگری»، نه «ناتمام» با برچسبِ ایرادِ کهنه (s30)
      await go('lprob', P4, 'exec'); await objStep('a = 14 و b = 7 و c = 9؛ جمع ۳۰ است', 'جای‌گذاری'); await click('main .lp-solved');
      info.f5def2 = await p.evaluate(pid => APP.liveClosure(pid), P4);
      const hk = await hookText({ id: 'ach_f5d', lprob: P4, msgs: [] }, 'حل شد فکر کنم');
      chk(info.f5def2.state === 'review' && !/ناتمام/.test(info.f5def2.label) && !/بازنگری ایراد یافت و مسئله ناتمام است/.test(hk), 'F5: a second «✅ حل شد» after the fix ⇒ state «review», old defect label dropped ' + JSON.stringify({ s: info.f5def2.state, l: info.f5def2.label }));
    });
    await section('F5-life', async () => {
      await day(0);
      const PL = await mk({ title: 'مدیرم', st: 'اثبات یا رد کن: مدیرم عمداً جلوی ترفیعم را گرفته.', kind: 'pod', nat: 'life' });
      await understand({ one: 'می‌خواهم ببینم مدیرم عمداً جلوی ترفیعم را گرفته یا نه', unk: 'مدیرم عمداً جلوی ترفیعم را گرفته', data: ['دو نفر دیرتر آمدند و ترفیع گرفتند', 'مدیرم با من سرد است'], cond: 'مدیرم عمداً کاری کرده\nبه ترفیعِ من ربط دارد', suff: 'کافی است', suffW: 'شواهد را می‌سنجم' });
      await addMove('mv_special', 'اول فقط یک شاهد را می‌سنجم تا دامنه تنگ شود');
      await savePlan('نخست از منابعِ انسانی معیارهای ترفیع را می‌پرسم سپس با مدیرم حرف می‌زنم');
      await realStep('فردا از منابعِ انسانی معیارهای ترفیع را بپرسم', 'معیارها مبهم است');
      await day(1); await go('lprob', PL, 'exec');
      await outcome({ what: 'معیار سابقه در پروژهٔ بزرگ بود و آن دو نفر داشتند', match: 'no' });
      await click('main .lp-solved');
      chk(await has('#lpBPodL') === 1 && await has('#lpBCP_0') === 1, 'F5: a life hypothesis look-back has the verdict select and a per-part check');
      await fillBack({ chk: 'معیارِ منابعِ انسانی را با کارنامهٔ خودم سنجیدم' });
      await setParts('no'); await selIf('#lpBPodL', 'ref');
      chk(await has('main .lp-bdefect') === 0, 'F5: «شواهد این بخش را رد کرد» on a hypothesis is a refutation, not a defect');
      await click('main .lp-lbsave');
      info.f5life = await p.evaluate(pid => APP.liveClosure(pid), PL);
      chk(info.f5life.state === 'solved' && info.f5life.verdict === 'liferef' && /رد شد/.test(info.f5life.label) && !/نتیجه سالم ماند/.test(info.f5life.label), 'F5: a refuted life hypothesis closes «رد شد», never «نتیجه سالم ماند» ' + JSON.stringify({ v: info.f5life.verdict, l: info.f5life.label }));
    });
    await section('F5-line-eq-step', async () => {
      await day(0);
      // «کجا خط می‌کشی = هیچی رو بیرون نمی‌ذارم، همه مهمه» ⇒ چالشِ نرم
      const PH = await mk({ title: 'خانه', st: 'سه ماهه اکسل پر می‌کنم که خونه بخرم یا اجاره‌نشین بمونم؛ ۴۷ ستون دارم.', nat: 'practical' });
      await understand({ one: 'می‌خواهم بدانم خانه بخرم یا اجاره کنم', unk: 'خرید یا اجاره', data: ['وام ۲ میلیارد است', 'اجاره ماهی ۳۰ میلیون است'], cond: 'قسط بیشتر از ۴۰٪ درآمد نشود', prac: true, prLine: 'هیچی رو بیرون نمی‌ذارم، همهٔ ۴۷ ستون مهمه چون همه روی تصمیم اثر دارن', expectMiss: true });
      chk(!(await S(PH)).u[1] && await has('#lpSoftWhy') === 1, 'F5: «هیچی رو بیرون نمی‌ذارم، همه مهمه» as the line is a soft challenge (s01)');
      // معادلهٔ برآمده از جای‌گذاری شمرده نمی‌شود (s26)
      const PE = await objSetup({ title: 'موتور', st: 'دو نفر با موتور و پیاده؛ x و y را بیابید.', u: { one: 'می‌خواهم x و y را بیابم', unk: 'x و y', data: ['x + y = 30', '2x = 9y'], cond: 'x + y = 30\n2x = 9y' }, steps: ['از داده‌ها: x + y = 30 و 2x = 9y', 'پس x = 4.5y و از رابطهٔ زمان x - y = 40(y/5) - x'] });
      info.f5eq = await p.evaluate(pid => ({ e: APP.liveEquations(pid), d: APP.liveEquationsDerived ? APP.liveEquationsDerived(pid) : null }), PE);
      chk(info.f5eq.e.length === 2, 'F5: equations obtained by substituting earlier ones are not counted as new («۴ معادله» ⇒ 2 independent) ' + JSON.stringify(info.f5eq));
      // نفیِ پیامد («مات نمی‌شود») پیوندِ گامی را که کنشِ طرح را اجرا می‌کند نمی‌بُرد (s21)
      const PC = await mk({ title: 'مات در دو', st: 'سفید در دو حرکت مات می‌کند؛ حرکتِ اول چیست؟', nat: 'objective' });
      await understand({ one: 'می‌خواهم حرکتِ اولِ مات را بیابم', unk: 'حرکتِ اولِ سفید', data: ['شاهِ سیاه در گوشه است', 'سفید وزیر و رخ دارد'], cond: 'مات در دو حرکت' });
      await addMove('mv_special', 'اول کیش‌های ممکنِ وزیر را یکی‌یکی می‌سنجم');
      await savePlan('نخست با وزیر کیشِ دیگری می‌دهم سپس با رخ مات می‌کنم');
      info.f5step = await p.evaluate(pid => ({ out: APP.liveStepFollowsTag(pid, 'وزیر به d7 کیش می‌دهد؛ ولی با حرکتِ دوم مات نمی‌شود'), neg: APP.liveStepFollowsTag(pid, 'وزیر را به b7 می‌برم؛ کیش نیست'), neg2: APP.liveStepFollowsTag(pid, 'حرکتِ اول: وزیر b7 (کیش نیست) و بعد رخ a8 مات') }), PC);
      chk(info.f5step.out === 'p1' && info.f5step.neg === '' && info.f5step.neg2 === '', 'F5: a negated OUTCOME («مات نمی‌شود») keeps a step that executes the plan\'s action; a negated ACTION («کیش نیست») still unlinks ' + JSON.stringify(info.f5step));
      await p.fill('#lpStep', 'وزیر را به b7 می‌برم؛ کیش نیست'); await sel('#lpClear', 'بله'); await fillIf('#lpProof', 'حسابِ مستقیم'); await click('main .lp-stepsave');
      chk(/کنشِ طرح/.test(await txt('main .lp-switch')), 'F5: the «not from the plan» message names the real reason (the plan\'s action is negated) ' + (await txt('main .lp-switch')).slice(0, 160));
    });

    /* ===================== F7 — بندهای کوچکِ «live» ===================== */
    await section('F7-plan', async () => {
      await day(0);
      // «فقط بخشی از شرط» و کارتِ شل کردن ⇒ «مجهول چگونه تغییر می‌کند؟» (s04)
      const PX = await mk({ title: 'چیدمانِ مهمان‌ها', st: 'شش مهمان دورِ یک میز؛ هیچ دو دوستی کنارِ هم ننشینند و هر زوجی کنارِ هم باشد. چند چیدمان هست؟', nat: 'objective' });
      await understand({ one: 'می‌خواهم شمارِ چیدمان‌ها را بیابم', unk: 'شمارِ چیدمان‌ها', data: ['شش مهمان', 'یک میزِ گرد'], cond: 'هیچ دو دوستی کنارِ هم نباشند\nهر زوجی کنارِ هم باشد', sat: 'no', depNo: true });
      chk(await has('main .lp-relax') === 1 && await has('#lpRelaxVary') === 1, 'F7: the relax card asks «مجهول چگونه تغییر می‌کند؟»');
      await sel('#lpAuxK', 'part');
      chk(await has('#lpAuxVary') === 1, 'F7: the «فقط بخشی از شرط را نگه دار» aux box asks how the unknown varies');
      await fillIf('#lpAuxT', 'فقط شرطِ زوج‌ها را نگه می‌دارم'); await fillIf('#lpAuxB', 'بعد شرطِ دوستان را برمی‌گردانم');
      await click('main .lp-auxsave');
      chk(await p.evaluate(pid => (APP.S.get('eprog_' + pid).solve.live.aux || []).length, PX) === 0, 'F7: the part-only aux problem is not saved without «مجهول چگونه تغییر می‌کند؟»');
      await fillIf('#lpAuxVary', 'بی شرطِ دوستان چیدمان‌ها ۴۸ تاست و با برگرداندنش کم می‌شود');
      await click('main .lp-auxsave');
      chk(await p.evaluate(pid => ((APP.S.get('eprog_' + pid).solve.live.aux || [])[0] || {}).vary || '', PX), 'F7: the aux problem stores how the unknown varies');
      // lpBBest: پرسشِ طرح که در کارتِ خودش («پیش‌تر دیده‌ای؟») پاسخ گرفت؛ پیش‌درآمدِ پیامِ دستیار جدا (s01/s23)
      await selIf('#lpSeen', 'no'); await fillIf('#lpSeenF', 'مسئلهٔ نشستنِ دورِ میز در کتاب'); await clickIf('main .lp-seensave');
      info.f7seen = await p.evaluate(pid => ({ seen: !!APP.S.get('eprog_' + pid).solve.live.seen, qs: APP.livePageQs ? APP.livePageQs(pid) : [] }), PX);
      chk(info.f7seen.seen && info.f7seen.qs.some(q => /پیش‌تر[^؟]*دیده/.test(q)), 'F7: «کدام پرسش کمک کرد؟» lists the plan question answered on its own card («پیش‌تر … دیده‌ای؟») ' + JSON.stringify(info.f7seen));
      await p.evaluate(pid => { const se = APP.ASSIST.newSession(); APP.liveBindSession(pid, se, { force: true }); se.msgs.push({ role: 'ai', text: 'ولی بار فقط یک میز نیست — از «یک میزِ گرد» هم استفاده کردی؟', at: new Date().toISOString() }); APP.S.put(se); }, PX);
      info.f7chat = await p.evaluate(pid => APP.liveChatQs(pid), PX);
      chk(info.f7chat.includes('از «یک میزِ گرد» هم استفاده کردی؟') && !info.f7chat.some(q => /^ولی/.test(q)), 'F7: a chat question is listed without its preamble ' + JSON.stringify(info.f7chat));
      // mentions: برچسبِ فهرست، عدد کنارِ اسم، نامِ تک‌حرفی (s23/s24/s29)
      info.f7m = await p.evaluate(() => [APP.liveMentions('همهٔ موادِ دستور را دو برابر می‌کنم', 'دستور: ۳ تخم‌مرغ، ۱ پیمانه شکر'), APP.liveMentions('گامِ اول یک یا دو پله، بعد پله‌های باقی‌مانده', '۳۰ پله', ['هر گام ۱، ۲ یا ۳ پله است']), APP.liveMentions('دایره‌ای مماس بر A و B', 'مسیرِ A/B/C'), APP.liveMentions('هیچ ربطی ندارد', 'دستور: ۳ تخم‌مرغ')]);
      chk(info.f7m[0] && info.f7m[1] && info.f7m[2] && !info.f7m[3], 'F7: mentions() matches a list label, number+noun and single-letter names (negation still excluded) ' + JSON.stringify(info.f7m));
    });
    await section('F7-prac', async () => {
      await day(0);
      // تقریبِ بس در برابرِ فاصلهٔ واقعی (s02)
      info.f7avm = await p.evaluate(() => [APP.liveApproxMargin('تا یک سانتی‌متر', ['نیم سانت جا کم بود']), APP.liveApproxMargin('تا یک سانتی‌متر', ['سه سانت جا اضافه بود'])]);
      chk(info.f7avm[0] && !info.f7avm[1], 'F7: an approximation coarser than the actual margin is detected (1 cm vs 0.5 cm), a finer one is not ' + JSON.stringify(info.f7avm));
      const PK = await mk({ title: 'کمد', st: 'کمدی که می‌خواهم بخرم در اتاقم جا می‌شود؟ دیوار ۲۴۰ سانت است.', nat: 'practical' });
      await understand({ one: 'می‌خواهم بدانم کمد در اتاقم جا می‌شود', unk: 'جا شدنِ کمد', data: ['دیوار ۲۴۰ سانت است', 'کمد ۲۳۹٫۵ سانت است'], cond: 'کمد کنارِ دیوار جا شود', prac: true, prApprox: 'تا یک سانتی‌متر', measure: 'پهنای کمد ≤ ۲۴۰ سانتی‌متر' });
      await addMove('mv_special', 'اول فقط پهنای دیوار را دوباره می‌سنجم تا دامنه تنگ شود');
      await p.fill('#lpPlan2', 'اگر نشد از فروشنده اندازهٔ دقیق را می‌پرسم');
      await savePlan('نخست دیوار را با متر می‌سنجم سپس با پهنای کمد مقایسه می‌کنم');
      await realStep('فردا دیوار را با متر بسنجم', 'جا می‌شود');
      await day(1); await go('lprob', PK, 'exec');
      await outcome({ what: 'دیوار ۲۴۰ سانت بود؛ فقط نیم سانت جا اضافه بود' });
      await click('main .lp-solved');
      chk(await has('main .lp-bapproxm') === 1, 'F7: the look-back says the 1 cm approximation is coarser than the 0.5 cm actual margin');
      info.f7date = await p.evaluate(pid => APP.liveClosure(pid).date, PK);
      chk(info.f7date === await p.evaluate(() => APP.today()), 'F7: the closure date follows APP.today (simulated day), not the wall clock ' + info.f7date);
    });
    await section('F7-life', async () => {
      await day(0);
      // زندگی: ابزارِ x/n و فرمول نه (s13)؛ حدسِ تازه پس از رد ⇒ «ثبت به‌عنوانِ حدس» (s22)
      const PL = await mk({ title: 'باشگاه', st: 'عضوِ باشگاهِ نزدیک بشوم یا باشگاهِ ارزان؟', nat: 'life' });
      await whole('می‌خواهم باشگاهِ مناسبِ خودم را برگزینم', 'سلامتی');
      chk(await has('#lpGKx0') === 0 && await has('#lpGKf') === 0, 'F7: a life decision\'s guess kit has no x/n table or formula');
      const PG = await mk({ title: 'خواب', st: 'چرا شب‌ها دیر خوابم می‌برد؟ می‌خواهم علتش را بفهمم.', nat: 'life' });
      await understand({ one: 'دنبالِ علتِ دیر خوابیدنم هستم', unk: 'علتِ دیر خوابیدن', data: ['شب‌ها قهوه نمی‌خورم', 'تا دیروقت با گوشی‌ام'], cond: 'علت را با آزمون بیابم', guess: 'گوشیِ دیروقت علت است' });
      await addMove('mv_special', 'اول فقط یک هفته گوشی را کنار می‌گذارم تا ببینم');
      await savePlan('نخست یک هفته گوشی را ساعتِ ده کنار می‌گذارم سپس ساعتِ خوابم را می‌نویسم');
      await realStep('از امشب گوشی را ساعتِ ده کنار بگذارم', 'زودتر خوابم می‌برد', 'امشب');
      await day(1); await go('lprob', PG, 'exec');
      await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', 'باز هم تا یک دیر خوابم برد'); await sel('#lpOMatch', 'no'); await sel('#lpOProg', 'کمی'); await sel('#lpOWant', 'same');
      await sel('#lpOGuess', 'refute'); await p.fill('#lpOReflect', 'گوشی علت نبود؛ شاید چرتِ عصر علت است');
      chk(await has('#lpONewG') === 1, 'F7: a refuted guess\'s reflection offers «ثبت به‌عنوانِ حدس»');
      await selIf('#lpONewG', 'yes'); await fillIf('#lpONewGT', 'چرتِ عصر علتِ دیر خوابیدن است');
      await click('main .lp-outsave');
      info.f7g = await p.evaluate(pid => { const s = APP.S.get('eprog_' + pid).solve; return { g: s.g[1].guess, hist: (s.live.guessHist || []).length, plaus: APP.livePlausible(pid) }; }, PG);
      chk(info.f7g.g === 'چرتِ عصر علتِ دیر خوابیدن است' && info.f7g.hist === 1 && info.f7g.plaus.refuted === 0, 'F7: the new guess becomes the problem\'s guess (old one kept in history; its tally starts fresh) ' + JSON.stringify(info.f7g));
    });
  } catch (e) { errors.push('exception: ' + (e && e.stack || e)); }
  console.log(JSON.stringify(info));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
