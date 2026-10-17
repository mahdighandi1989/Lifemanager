// تورِ دستهٔ ۱ ِ پولیا — دورِ ۶ ِ اصلاح («live»): تونلِ «🔭 مسئلهٔ حل‌نشدهٔ خودم» با کنترل‌های واقعیِ صفحه (پهنای ۳۹۰، ساعتِ ساختگی).
// بندها تصمیم‌های DECISIONS_R6 اند (G2 اولویتِ پرسشِ نوبت و کارتِ روی صفحه، G5 داور/نوع/واژه‌ها، G6 حکم‌های صادقانه). هر بند روی مسیرِ واقعیِ کاربر و رکوردِ واقعی آزموده می‌شود.
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
  const section = async (name, fn) => { if (process.env.ONLY && name.indexOf(process.env.ONLY) !== 0) return; try { await fn(); } catch (e) { const m = String(e && e.message || e); errors.push(name + ' — exception: ' + m.split('\n')[0] + ' ' + ((m.match(/locator\([^)]*\)/) || [''])[0]) + ' · last toasts: ' + (await toasts().catch(() => '')).slice(-200) + ' · umiss: ' + (await txt('main .lp-umiss').catch(() => '')).slice(0, 300)); } };
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
  const objSetup = async (o) => {
    const P0 = await mk({ title: o.title, st: o.st, nat: 'objective', kind: o.kind });
    await understand(Object.assign({ depNo: true }, o.u));
    await addMove('mv_equation', 'هر کمیت را با نماد می‌نویسم تا شرط معادله شود');
    await savePlan(o.plan || 'نخست هر کمیت را با نماد می‌نویسم سپس در شرط جای‌گذاری می‌کنم');
    for (const st of o.steps || ['هر کمیت را با نماد نوشتم و در شرط جای‌گذاری کردم']) await objStep(st, 'از داده‌ها و جای‌گذاری');
    return P0;
  };
  // پرسشِ پیشنهادیِ قلابِ بخشِ مسئله (همان که مدل می‌بیند)
  const suggested = (t) => ((t || '').match(/پرسشِ پیشنهادیِ این نوبت: «([^\n]*)»\. اگر/) || ['', ''])[1];
  const lifeSetup = async (o) => {
    const P0 = await mk({ title: o.title, st: o.st, nat: o.nat || 'life', kind: o.kind });
    await understand(Object.assign({ one: 'می‌خواهم این را درست بفهمم و حلش کنم', unk: 'راهِ درست', data: ['داده‌ی نخست روشن است', 'داده‌ی دوم هم هست'], cond: 'بی آسیب به کسی' }, o.u || {}));
    if (o.noPlan) return P0;
    await addMove('mv_special', 'اول فقط یک حالتِ کوچک را می‌آزمایم تا دامنه تنگ شود');
    if (o.beforePlan) await o.beforePlan();
    await savePlan(o.plan || 'نخست یک گامِ کوچک را می‌آزمایم سپس نتیجه را می‌سنجم');
    return P0;
  };
  try {
    await p.goto(FILE); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(T0 => { window.__day = T0; APP.today = () => window.__day; APP.S.loaded = true; window.__rem = []; APP.HOST = Object.assign({}, APP.HOST || {}, { remind: async (pl) => { window.__rem.push(pl); return { ok: true }; }, unremind: async () => ({ ok: true }) }); }, T0);

    /* ===================== G2 — پرسشِ نوبت: کارِ همین نوبت ⇐ کارتِ خاص ⇐ گیر ⇐ کارتِ صفحه ⇐ نردبان ===================== */
    await section('G2-related', async () => {
      await day(0);
      // s35: «نمی‌دونم چطور از اون استفاده کنم» با مسئلهٔ مرتبطِ حل‌شده ⇒ «نتیجه یا روشش؟ عنصرِ کمکی؟»، نه «از خواسته به عقب»
      const PR = await lifeSetup({ title: 'محله', st: 'می‌خواهم طرحِ تمیز نگه داشتنِ کوچه‌های محله‌مان پایدار بماند؛ دو بار شروع شد و خوابید.', noPlan: true,
        u: { one: 'می‌خواهم طرحِ تمیزی این بار پایدار بماند', unk: 'راهِ پایدار ماندنِ طرحِ تمیزی', data: ['دو بار شروع شد و خوابید', 'داوطلب‌ها خسته شدند'], cond: 'بی پولِ زیاد' } });
      const msg = 'یادم اومد محلهٔ ولیعصر همین طرح رو موفق اجرا کرده. ولی نمی‌دونم چطور از اون استفاده کنم';
      const hk = await hookText({ id: 'ach_g2r', lprob: PR, msgs: [] }, msg);
      info.g2rel = { q: suggested(hk), co: await p.evaluate(([pid, m]) => { const c = APP.liveCoach(pid, { stuck: true, turn: { stuck: true, text: m } }); return { src: c.src, ph: c.ph }; }, [PR, msg]) };
      chk(/نتیجه/.test(info.g2rel.q) && /روش/.test(info.g2rel.q) && /کمکی/.test(info.g2rel.q) && !/به\s*عقب/.test(info.g2rel.q) && info.g2rel.co.src === 'turn-related', 'G2: «I don\'t know how to use the related solved problem» ⇒ the turn question is «its result or its method? an auxiliary element?» (s35), not «work backwards» ' + JSON.stringify(info.g2rel));
    });

    await section('G2-turnfields', async () => {
      await day(0);
      // فیلدهای تازهٔ نوبت از مربی: turn.guess («…درسته؟» پس از مقدار) ⇒ «چطور می‌آزمایی‌اش؟»؛ turn.related (بی گیر) ⇒ «نتیجه یا روشش؟»
      const PT = await lifeSetup({ title: 'کابینت', st: 'می‌خواهم کابینتِ آشپزخانه را خودم بسازم؛ نمی‌دانم چند ورق تخته لازم است.', noPlan: true });
      info.g2tf = await p.evaluate(pid => { const a = APP.liveCoach(pid, { turn: { guess: true, text: 'پس ۶ ورق؛ درسته؟' } }), b = APP.liveCoach(pid, { turn: { related: true, stuck: false, text: 'یادم اومد کمدِ اتاق رو همین‌جوری ساختم' } }); return { a: a.q, as: a.src, b: b.q, bs: b.src }; }, PT);
      chk(info.g2tf.as === 'turn-guess' && /چطور می‌آزمایی/.test(info.g2tf.a) && info.g2tf.bs === 'turn-related' && /روش/.test(info.g2tf.b), 'G2: turn.guess ⇒ «how will you test it?»; turn.related ⇒ «its result or method? auxiliary element?» (coach fields) ' + JSON.stringify(info.g2tf));
      // سطرِ «حدسی که خودش با آزمون رد کرد» فقط در نخستین نوبت پس از رد
      const PR2 = await mk({ title: 'خوابِ کودک', st: 'بچه‌ام شب‌ها دیر می‌خوابد؛ می‌خواهم علتش را بفهمم.', nat: 'life' });
      await understand({ one: 'دنبالِ علتِ دیر خوابیدنِ بچه‌ام هستم', unk: 'علتِ دیر خوابیدن', data: ['عصرها چرت می‌زند', 'شب کارتون می‌بیند'], cond: 'علت را با آزمون بیابم', guess: 'کارتونِ شب علت است', test: 'یک هفته بی کارتون' });
      await addMove('mv_special', 'اول فقط یک هفته کارتون را حذف می‌کنم');
      await savePlan('نخست یک هفته کارتونِ شب را حذف می‌کنم سپس ساعتِ خواب را می‌نویسم');
      await realStep('از امشب یک هفته کارتونِ شب را حذف کنم', 'زودتر می‌خوابد', 'امشب');
      await day(1); await go('lprob', PR2, 'exec');
      await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', 'باز هم دیر خوابید'); await sel('#lpOMatch', 'no'); await sel('#lpOProg', 'کمی'); await sel('#lpOWant', 'same');
      await sel('#lpOGuess', 'refute'); await p.fill('#lpOReflect', 'کارتون علت نبود؛ شاید چرتِ عصر است'); await selIf('#lpONewG', 'no');
      await click('main .lp-outsave');
      info.g2ref = await p.evaluate(pid => { const se = { id: 'ach_g2ref', lprob: pid, msgs: [] }, run = (m) => APP.ASSIST.promptHooks.map(f => { try { return f(se, m) || ''; } catch (e) { return ''; } }).join('\n');
        return [run('حدسم غلط بود'), run('حدسم غلط بود'), run('حالا چی کار کنم؟')].map(t => /حدسی که خودش با آزمون رد کرد/.test(t)); }, PR2);
      chk(info.g2ref[0] === true && info.g2ref[1] === true && info.g2ref[2] === false, 'G2: the refuted-guess line appears in the first turn after the refutation (and its re-prompt), not on every later turn ' + JSON.stringify(info.g2ref));
    });

    await section('G2-cards', async () => {
      await day(0);
      // s26: حکمِ کارتِ معادله‌ها (کارتِ خاص) بر «به شکلِ دیگری بیان کن» ِ عام مقدم است
      const PE = await objSetup({ title: 'موتورِ دونفره', st: 'سه نفریم و یک موتورِ دونفره؛ موتور ۴۰ و پیاده ۵ کیلومتر در ساعت؛ ایستگاه ۳۰ کیلومتر دورتر است. زودترین زمانِ رسیدنِ هر سه؟',
        u: { one: 'می‌خواهم زودترین زمانِ رسیدن را بیابم', unk: 'زمانِ رسیدنِ هر سه', data: ['سرعتِ موتور ۴۰ است', 'سرعتِ پیاده ۵ است'], cond: 'هر سه با هم برسند\nموتور دو نفر می‌برد' },
        steps: ['x + y = 30 و 40a = x و 5a = y را نوشتم'] });
      await fillIf('#lpEqUnk', '۴'); await clickIf('main .lp-eqsave');
      chk(/معادله کم است/.test(await txt('main .lp-eqs .lp-eqmsg')), 'G2 setup: the equations card says «معادله کم است» (3 equations, 4 unknowns)');
      const hkE = await hookText({ id: 'ach_g2e', lprob: PE, msgs: [] }, 'صفحه میگه معادله کمه. ۴ مجهول دارم ۳ معادله. گیر کردم');
      info.g2eq = { q: suggested(hkE), co: await p.evaluate(pid => { const c = APP.liveCoach(pid, { stuck: true, turn: { stuck: true, text: 'گیر کردم' } }); return { q: c.q, src: c.src, card: c.card, same: c.samePage }; }, PE) };
      chk(/معادله کم است/.test(info.g2eq.q) && !/شکلِ? ?دیگری بیان/.test(info.g2eq.q) && info.g2eq.co.same === true, 'G2: stuck exactly at the equations-card verdict ⇒ that verdict is the turn question (s26), and it IS the card on screen ' + JSON.stringify(info.g2eq));
      // s36: بعد از گامِ «توانِ دو» و «کجا اشتباه کردم؟» ⇒ پرسشِ هم‌ارزی (کارتِ صفحه)، نه «این گام جواب نداد؟»
      const PQ = await objSetup({ title: 'رادیکال', st: 'ریشهٔ معادلهٔ √(x+6) = x را بیابید.', u: { one: 'می‌خواهم x را بیابم', unk: 'مقدارِ x', data: ['√(x+6) = x'], cond: 'x در معادله صدق کند' }, plan: 'نخست دو طرف را به توان دو می‌رسانم سپس x را می‌یابم',
        steps: ['دو طرف را به توان دو رساندم: x + 6 = x^2 پس x = 3 یا x = -2'] });
      chk(await has('main .lp-equivq') === 1, 'G2 setup: the squaring step shows the equivalence card');
      const hkQ = await hookText({ id: 'ach_g2q', lprob: PQ, msgs: [] }, 'یعنی چی؟ کجا اشتباه کردم؟ گیر کردم');
      info.g2eqv = { q: suggested(hkQ), card: await p.evaluate(pid => APP.liveCoach(pid).card, PQ) };
      chk(/هم‌ارزِ شرطِ اصلی/.test(info.g2eqv.q) && /هم‌ارزِ شرطِ اصلی/.test(info.g2eqv.card), 'G2: after a squaring step, «where did I go wrong?» ⇒ the equivalence question on the page (s36) ' + JSON.stringify(info.g2eqv));
      // s37: «شرط کافی نبود؟ چند جواب؟» کارتی است که روی صفحه است ⇒ card و «هم‌گام با صفحه» همان
      const PM = await objSetup({ title: 'گوسفند', st: 'دفتر: «۳۶ رأس گوسفند: ؟۴۸۷؟ ریال» — رقمِ اول و آخر محو است. قیمتِ هر گوسفند؟', u: { one: 'می‌خواهم قیمت را بیابم', unk: 'قیمتِ هر گوسفند', data: ['۳۶ رأس', 'کل به شکلِ ؟۴۸۷؟ است'], cond: 'کل بر ۳۶ بخش‌پذیر است' }, plan: 'نخست رقم‌های عددِ کل را با بخش‌پذیری می‌یابم سپس جواب‌ها را می‌شمارم',
        steps: ['عددِ کل یا 64872 یا 24876 است پس دو جواب داریم'] });
      chk(await has('main .lp-multi') === 1, 'G2 setup: «دو جواب» shows the sufficiency card');
      info.g2multi = await p.evaluate(pid => { const c = APP.liveCoach(pid, { turn: { text: 'شرط کافی بود؟ نه… کدومه؟' } }); return { q: c.q, card: c.card, same: c.samePage, src: c.src }; }, PM);
      chk(/شرط کافی نبود/.test(info.g2multi.card) && info.g2multi.q === info.g2multi.card && info.g2multi.same === true, 'G2: the card actually on screen («شرط کافی نبود؟ چند جواب؟») is the returned card and the turn question (s37) ' + JSON.stringify(info.g2multi));
      // s34: «😴 چه چیزی به ذهنت رسید؟» و «میانهٔ راه» کارت‌هایی‌اند که روی صفحه‌اند
      const PI = await lifeSetup({ title: 'پایان‌نامه', st: 'پروژهٔ پایانیِ ارشدم جلو نمی‌رود و نمی‌دانم از کجا ادامه بدهم.', plan: 'نخست یک اسکیسِ دستی از زمینِ پروژه می‌کشم سپس ایده‌ها را می‌نویسم' });
      await realStep('فردا صبح بیست دقیقه یک اسکیسِ دستی از زمینِ پروژه بکشم', 'دست‌کم یک ایده روی کاغذ می‌آید', 'فردا');
      await day(1); await go('lprob', PI, 'exec');
      await outcome({ what: 'اسکیس را کشیدم ولی ایده‌ای نیامد', match: 'no', prog: 'کمی' });
      await clickIf('main .lp-incub');
      chk(!!(await S(PI)).live.incub, 'G2 setup: incubation started after serious effort');
      await day(2); await go('lprob', PI, 'exec');
      chk(await has('main .lp-incubback') === 1, 'G2 setup: the incubation card is on screen');
      info.g2inc = await p.evaluate(pid => { const c = APP.liveCoach(pid); return { q: c.q, card: c.card, same: c.samePage }; }, PI);
      chk(/چه چیزی به ذهنت رسید/.test(info.g2inc.card) && info.g2inc.same === true, 'G2: back after incubation ⇒ card = «چه چیزی به ذهنت رسید؟» and it is the turn question (s34) ' + JSON.stringify(info.g2inc));
      await p.fill('#lpIncubT', 'شاید باید از نقشهٔ سایت شروع کنم'); await click('main .lp-incubgo');
      await day(4); await go('lprob', PI, 'exec');
      chk(await has('main .lp-checkin') === 1, 'G2 setup: the mid-course check-in card is on screen');
      info.g2ck = await p.evaluate(pid => { const c = APP.liveCoach(pid); return { q: c.q, card: c.card, same: c.samePage }; }, PI);
      chk(/میانهٔ راه/.test(info.g2ck.card) && info.g2ck.same === true, 'G2: mid-course check-in due ⇒ card = «میانهٔ راه: چه آموختی؟» (s34) ' + JSON.stringify(info.g2ck));
    });

    await section('G2-stuck', async () => {
      await day(0);
      // s02: گیر در طرح با دادهٔ به‌کارنرفته ⇒ «همهٔ داده‌ها؟»؛ آغازِ طرح بی گیر ⇒ نه
      const PA = await mk({ title: 'کمد', st: 'کمدِ ۲ متری را می‌خواهم از درِ اتاقم رد کنم؛ در ۹۰ سانت پهنا و ۲۰۰ سانت ارتفاع دارد. جا می‌شود؟', nat: 'practical' });
      await understand({ one: 'می‌خواهم بدانم کمد از در رد می‌شود', unk: 'رد شدن یا نشدنِ کمد', data: ['کمد ۲ متر بلندی دارد', 'در ۹۰ سانت پهنا دارد', 'ارتفاعِ در ۲۰۰ سانت است'], cond: 'کمد آسیب نبیند', prac: true, measure: 'قطرِ کمد ≤ ۲۰۰ سانت' });
      info.g2b3 = await p.evaluate(pid => { const a = APP.liveCoach(pid), b = APP.liveCoach(pid, { stuck: true, turn: { stuck: true, text: 'گیر کردم' } }); return { a: a.q, b: b.q, src: b.src, ph: b.ph }; }, PA);
      chk(info.g2b3.ph === 'p' && /همه.{0,6}داده|اثرِ محسوس دارند همه/.test(info.g2b3.b) && info.g2b3.src === 'stuck-alldata' && !/همه.{0,6}داده|اثرِ محسوس دارند همه/.test(info.g2b3.a), 'G2: stuck devising the plan with an unused datum ⇒ «همهٔ داده‌ها را به کار برده‌ای؟» (s02); not at the start of planning without being stuck ' + JSON.stringify(info.g2b3));
      // همهٔ داده‌ها در پیش‌نویسِ طرح آمده ⇒ گیر ⇒ «از خواسته به عقب»
      await go('lprob', PA, 'plan');
      await p.fill('#lpPlan', 'کمد ۲ متر بلندی دارد؛ در ۹۰ سانت پهنا دارد و ارتفاعِ در ۲۰۰ سانت است؛ کمد را کج رد می‌کنم'); await W(500);
      info.g2back = await p.evaluate(pid => { const b = APP.liveCoach(pid, { stuck: true, turn: { stuck: true, text: 'گیر کردم' } }); return { q: b.q, src: b.src, un: APP.liveUnused(pid).length }; }, PA);
      chk(/به\s*عقب/.test(info.g2back.q) && info.g2back.un === 0, 'G2: stuck in plan with every datum used ⇒ «از خواسته به عقب» ' + JSON.stringify(info.g2back));
      // s25: گیر پیش از هر گامی ⇒ هرگز «این گام جواب نداد؟»
      const PI = await objSetup({ kind: 'prove', title: 'جمعِ کسرها', st: 'ثابت کنید برای هر n ≥ 1 جمعِ ۱/(k(k+1)) از k=1 تا n برابرِ n/(n+1) است.', u: { one: 'می‌خواهم فرمولِ جمع را ثابت کنم', unk: 'جمع برابرِ n/(n+1) است', data: ['n ≥ 1 طبیعی است', 'جملهٔ k ام برابرِ ۱/(k(k+1)) است'], cond: 'جمع = n/(n+1)', guess: 'درست است' }, steps: [] });
      info.g2nostep = await p.evaluate(pid => { const c = APP.liveCoach(pid, { stuck: true, turn: { stuck: true, fail: true, text: 'نشد، گیر کردم' } }); return { q: c.q, src: c.src, ph: c.ph, n: APP.S.get('eprog_' + pid).solve.live.steps.length }; }, PI);
      chk(info.g2nostep.n === 0 && !/این گام جواب نداد/.test(info.g2nostep.q), 'G2: stuck with no step taken yet ⇒ never «این گام جواب نداد؟» (s25) ' + JSON.stringify(info.g2nostep));
      // پس از گامی واقعی که پیشرفتی نداشت ⇒ «به شکلِ دیگری بیان کن»
      const PF = await lifeSetup({ title: 'جلسه', st: 'با خواهرم سرِ ارث به توافق نمی‌رسیم؛ می‌خواهم راهی پیدا کنم که هر دو بپذیریم.', plan: 'نخست با خواهرم جلسه می‌گذارم و پیشنهادِ تقسیم را می‌گویم سپس پاسخش را می‌سنجم' });
      await realStep('فردا با خواهرم جلسه بگذارم و پیشنهادِ تقسیم را بگویم', 'می‌پذیرد', 'فردا');
      await day(1); await go('lprob', PF, 'exec');
      await outcome({ what: 'جلسه به دعوا کشید', match: 'no', prog: 'نه' });
      info.g2rest = await p.evaluate(pid => { const c = APP.liveCoach(pid, { stuck: true, turn: { stuck: true, text: 'گیر کردم' } }); return { q: c.q, src: c.src }; }, PF);
      chk(/شکلِ دیگری بیان/.test(info.g2rest.q) && info.g2rest.src === 'fail-restate', 'G2: stuck in execution AFTER a failed step ⇒ restate the problem ' + JSON.stringify(info.g2rest));
    });

    await section('G2-abandon-aside', async () => {
      await day(0);
      // s04: «پس راهی نیست، ولش کنم» ⇒ مسئلهٔ کمکیِ کوچک‌تر (بخشی از شرط / حالتِ خاص) — همان که 🌱 می‌خواهد، نه «از خواسته به عقب»
      const PB = await lifeSetup({ title: 'ارث', st: 'سه وارثیم و هر کدام خانهٔ پدری را می‌خواهیم؛ می‌خواهم تقسیمی پیدا کنم که همه بپذیرند.', noPlan: true });
      const hkA = await hookText({ id: 'ach_g2a', lprob: PB, msgs: [] }, 'پس راهی نیست، ولش کنم');
      info.g2ab = suggested(hkA);
      chk(/بخشی از شرط|حالتِ خاص/.test(info.g2ab) && !/به\s*عقب/.test(info.g2ab), 'G2: wanting to give up ⇒ the turn question is the smaller auxiliary problem (part of the condition / special case) (s04) ' + info.g2ab);
      // s06: در زنجیرهٔ «از آخر به عقب» ⇒ «کدام حلقه دقیقاً شکست؟»
      await go('lprob', PB, 'plan');
      await fillIf('#lpBkS', 'هر سه امضا کرده‌ایم و خانه تقسیم شده'); await fillIf('#lpBk1', 'هر سه روی ارزشِ خانه توافق کرده‌ایم'); await fillIf('#lpBk2', 'یک کارشناسِ بی‌طرف قیمت داده است');
      await clickIf('main .lp-bksave');
      const hkL = await hookText({ id: 'ach_g2l', lprob: PB, msgs: [] }, 'می‌خوام کل این تحلیل رو بندازم دور');
      info.g2link = { q: suggested(hkL), back: !!(await S(PB)).live.back };
      chk(info.g2link.back && /کدام حلقه/.test(info.g2link.q), 'G2: giving up inside a backward chain ⇒ «which link exactly failed?» (s06; C095/C096) ' + JSON.stringify(info.g2link));
      // s21: گیر در اجرا با دادهٔ کنارگذاشته (بی حدسِ ردشده) ⇒ همان داده پرسشِ نوبت است؛ سطرِ دومِ «بپرس…» نیست
      const PC = await mk({ title: 'مات در دو', st: 'سفید: شاه g1، وزیر d1، رخ a1؛ سیاه: شاه h8، پیاده‌های g7 و h7. سفید در دو حرکت مات می‌کند — حرکتِ نخست؟', nat: 'objective' });
      await understand({ one: 'می‌خواهم حرکتِ نخستِ ماتِ دوحرکتی را بیابم', unk: 'حرکتِ نخستِ سفید', data: ['وزیر سفید در d1', 'رخ سفید در a1', 'شاه سیاه در h8'], cond: 'سیاه هر جواب بدهد در حرکتِ دوم مات شود', depNo: true });
      await addMove('mv_special', 'اول کیش‌های وزیر را یکی‌یکی می‌آزمایم');
      await p.fill('#lpPlan', 'نخست با وزیر کیش می‌دهم سپس مات می‌کنم'); await W(400);
      for (let rep = 0; rep < 2; rep++) for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) {
        const t = await p.evaluate(id => (document.querySelector('main .lp-plan .lp-un[data-d="' + id + '"]') || {}).textContent || '', id);
        if (/رخ/.test(t)) { await sel('#lpPU_a_' + id, 'skip'); await p.fill('#lpPU_w_' + id, 'رخ دور است و در ماتِ دوحرکتی نقشی ندارد'); } else { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); }
      }
      await click('main .lp-plansave');
      await objStep('وزیر d8 کیش می‌دهد ولی شاه به h7 فرار می‌کند', 'از جایِ مهره‌ها');
      const hkC = await hookText({ id: 'ach_g2c', lprob: PC, msgs: [] }, 'گیر کردم');
      info.g2aside = { q: suggested(hkC), second: /بپرس هنوز بی‌ربط است/.test(hkC) };
      chk(/رخ سفید در a1/.test(info.g2aside.q) && !info.g2aside.second, 'G2: stuck in execution with a datum set aside ⇒ that datum is THE turn question; no competing «بپرس…» line (s21) ' + JSON.stringify(info.g2aside));
    });

    /* ===================== G5 — داور، نوع و واژه‌ها ===================== */
    await section('G5-kinds', async () => {
      await day(0);
      await go('e_prob', null, 'live');
      const read = async (t) => { await p.fill('#lpNewS', t); await W(80); return p.evaluate(() => [document.getElementById('lpNewNat').value, document.getElementById('lpNewType').value]); };
      info.g5k = {
        tank: await read('می‌خوام آب بارون پشت‌بوم انبار رو جمع کنم برای آبیاری قطره‌ای تابستون باغ پسته. مخزن چقدر بزرگ بسازم؟ بتنی بسازم یا پلاستیکی بخرم؟ کجا بذارم؟'),
        glass: await read('فقط دوتا ساعت شنی داریم، یکی ۷ دقیقه یکی ۱۱ دقیقه. تخم‌مرغ باید دقیقاً ۱۵ دقیقه بپزه. چطوری؟'),
        guess: await read('حدسم اینه که جمعش میشه ۱/۴ − ۱/((n+1)(n+2))؛ سه تاشو چک کردم.')
      };
      await p.fill('#lpNewS', '');
      chk(info.g5k.tank[0] === 'practical', 'G5: own rain tank «… چقدر بزرگ بسازم؟» ⇒ practical, even with «بتنی بسازم یا پلاستیکی؟» (s17) ' + JSON.stringify(info.g5k.tank));
      chk(info.g5k.glass[0] === 'objective', 'G5: a third-person puzzle with numbers («دو ساعت‌شنی داریم… چطوری؟») ⇒ objective (s08) ' + JSON.stringify(info.g5k.glass));
      chk(info.g5k.guess[1] === 'pod', 'G5: «حدسم اینه که …» ⇒ type pod (s25) ' + JSON.stringify(info.g5k.guess));
      // chat_solved ِ همان معما ⇒ داورِ عینی (نه «زندگی» ِ پیش‌فرض)
      info.g5cs = await p.evaluate(() => { const se = { id: 'ach_g5cs', msgs: [] }; APP.ASSIST._turnSession = se;
        APP.ASSIST.DO.chat_solved({ title: 'ساعت‌شنیِ ۷ و ۱۱', statement: 'فقط دوتا ساعت شنی داریم، یکی ۷ دقیقه یکی ۱۱ دقیقه. تخم‌مرغ باید دقیقاً ۱۵ دقیقه بپزه. چطوری؟', kind: 'find', lesson: 'از جواب به عقب برگشتم', check: '۴ + ۱۱ = ۱۵' });
        APP.ASSIST._turnSession = null; const r = APP.liveAll().find(x => /ساعت شنی/.test(x.p.statement)); return r ? APP.liveKindInfo(r.p.id) : null; });
      chk(info.g5cs && info.g5cs.kind === 'objective', 'G5: a puzzle saved via chat_solved gets the code\'s guess (objective), not «life» (s08) ' + JSON.stringify(info.g5cs));
      // live_new بی nat ⇒ ردهٔ مربیِ همین گفت‌وگو (زندگی) پیش‌انتخاب می‌شود
      info.g5ln = await p.evaluate(() => { const se = { id: 'ach_g5ln', msgs: [], coach: { cls: 'life' } }; APP.ASSIST._turnSession = se;
        APP.ASSIST.DO.live_new({ title: 'توقفِ فاکتورها', statement: 'دیشب فکر کردم. سؤالم اشتباه بود. سؤال واقعیم اینه: چطور جلوی ادامه‌ش رو بگیرم بی‌آنکه دوستم رو نابود کنم؟' });
        APP.ASSIST._turnSession = null; const r = APP.liveAll().find(x => /سؤال واقعیم/.test(x.p.statement)); return r ? { id: r.p.id, nat: r.p.nat, by: r.p.natBy } : null; });
      chk(info.g5ln && info.g5ln.nat === 'life' && info.g5ln.by === 'guess', 'G5: live_new without nat carries the chat\'s judge as a suggestion (s13/s30) ' + JSON.stringify(info.g5ln));
      if (info.g5ln) { await go('lprob', info.g5ln.id, 'u'); await whole('می‌خواهم جلوی ادامهٔ کار را بگیرم', 'دوستم برایم مهم است');
        chk(await p.evaluate(() => (document.getElementById('lpNat') || {}).value) === 'life', 'G5: …and the understanding card pre-selects it'); }
    });

    await section('G5-wording', async () => {
      await day(0);
      // s03: اثباتی — «فرض/حکم»، نه «مجهول»؛ «اجرا روی واقعیت» نه
      const PP = await mk({ title: 'زاویه‌ها', st: 'ثابت کنید مجموعِ زاویه‌های داخلیِ هر مثلث ۱۸۰ درجه است.', kind: 'prove' });
      info.g5p = { prov: await txt('main .lp-u .lp-prov') };
      await understand({ one: 'می‌خواهم ثابت کنم جمعِ زاویه‌ها ۱۸۰ است', unk: 'جمعِ زاویه‌های هر مثلث ۱۸۰ درجه است', data: ['مثلثی دلخواه', 'خطِ موازی از یک رأس'], cond: 'جمعِ سه زاویه = ۱۸۰', suff: 'هنوز نمی‌دانم', suffW: 'هنوز نمی‌دانم همه لازم است', guess: 'درست است' });
      await go('lprob', PP, 'plan');
      Object.assign(info.g5p, { suffq: await txt('main .lp-suffq h4'), rel: await txt('main .lp-rel h4'), seen: await p.evaluate(() => { const l = document.querySelector('label[for="lpSeen"]'); return l ? l.textContent : ''; }) });
      chk(!/مجهول/.test(info.g5p.prov) && /حکم/.test(info.g5p.prov) && !/تعیینِ مجهول/.test(info.g5p.suffq) && /حکم/.test(info.g5p.rel) && /حکم/.test(info.g5p.seen) && !/مجهول/.test(info.g5p.seen), 'G5: a prove problem speaks of hypothesis/claim, never «مجهول» (proverb, «کافی است؟» card, related card, lpSeen) (s03) ' + JSON.stringify(info.g5p));
      if (await has('#lpSuffQ_p')) { await sel('#lpSuffQ_p', await p.evaluate(() => [...document.querySelectorAll('#lpSuffQ_p option')].map(o => o.value).filter(Boolean)[0])); await p.fill('#lpSuffQW_p', 'هر بخشِ فرض در برهان لازم است'); await click('main .lp-suffqgo'); }
      await addMove('mv_special', 'اول یک مثلثِ خاص را می‌کشم و خطِ موازی را می‌آزمایم');
      await savePlan('نخست خطِ موازی از یک رأس می‌کشم سپس زاویه‌های متبادل را برابر می‌گذارم');
      info.g5ph = { main: await txt('main'), hook: ((await hookText({ id: 'ach_g5p', lprob: PP, msgs: [] }, 'ادامه')).match(/# مسئلهٔ زندهٔ[^\n]*/) || [''])[0] };
      chk(!/اجرا روی واقعیت/.test(info.g5ph.main) && !/اجرا روی واقعیت/.test(info.g5ph.hook) && /اجرای طرح/.test(info.g5ph.hook), 'G5: an objective proof\'s execution is «اجرای طرح», not «اجرا روی واقعیت» (page and hook header) ' + info.g5ph.hook);
      // s10: معمای «آیا چیدمانی هست…؟» (اثبات یا رد کن) ⇒ «حکم تهی» نه
      const PZ = await mk({ title: 'چیدمان', st: 'اثبات یا رد کن: آیا چیدمانی هست که ۹ نفر سرِ سه میزِ سه‌نفره بنشینند و هر عمه کنارِ دقیقاً یک پسرعمو باشد؟', kind: 'pod' });
      await whole('می‌خواهم ببینم چنین چیدمانی هست یا نه', 'کنجکاوم');
      info.g5sat = await p.evaluate(() => { const l = document.querySelector('label[for="lpSat"]'); return l ? l.textContent : ''; });
      chk(info.g5sat && !/حکم تهی/.test(info.g5sat), 'G5: an existence puzzle («آیا چیدمانی هست…؟») gets no «حکم تهی» (s10) ' + info.g5sat);
      // s05: «اثبات یا رد کن» ِ زندگی ⇒ «فرضیه» و «طرحِ آزمودن»، نه «حکم» و «طرحِ اثبات»
      const PL = await mk({ title: 'بدگمانی', st: 'همکارم اطلاعات را عمداً از من پنهان می‌کند — اثبات یا رد کن.', kind: 'pod', nat: 'life' });
      await understand({ one: 'می‌خواهم بدانم بدگمانی‌ام درست است یا نه', unk: 'همکارم عمداً اطلاعات را پنهان می‌کند', data: ['دو بار گزارش دیر رسید', 'در جلسه چیزی نگفت'], cond: 'شاهدِ واقعی داشته باشم', sat: 'yes', suff: 'کافی است', suffW: 'دو شاهد دارم و می‌سنجم', guess: 'درست است' });
      await go('lprob', PL, 'plan');
      info.g5lp = { goal: await txt('main .lp-ask .sv-goal'), why: await txt('main .lp-ask') };
      chk(/فرضیه/.test(info.g5lp.goal) && !/حکم/.test(info.g5lp.goal) && !/طرحِ اثبات/.test(info.g5lp.why), 'G5: a life pod plan card says «فرضیه»/«آزمودن», never «حکم»/«طرحِ اثبات» (s05) ' + JSON.stringify({ g: info.g5lp.goal }));
    });

    await section('G5-closing', async () => {
      await day(0);
      // s06: مسئلهٔ یافتنی «✅ حل شد» می‌شود، نه «اثبات شد»
      const PD = await objSetup({ title: 'ضلع‌ها', st: 'محیطِ مثلثی ۳۰ است؛ a دو برابرِ b و c دو واحد بیشتر از b است. ضلع‌ها؟', u: { one: 'می‌خواهم سه ضلع را بیابم', unk: 'a و b و c', data: ['محیط ۳۰ است', 'a دو برابرِ b است'], cond: 'a + b + c = 30\nهر سه ضلع مثبت‌اند' }, steps: ['a = 2b و c = b + 2 پس 4b + 2 = 30 و b = 7'] });
      // lpBBest: پرسشِ گفت‌وگو که پیش‌درآمدش خودِ پرسش است بریده نمی‌شود (s23/s29)
      await p.evaluate(pid => { APP.S.put({ id: 'ach_g5bb', type: 'achat', lprob: pid, msgs: [{ role: 'ai', text: 'ثابتش می‌کنی یا با یک مثالِ نقض ردش می‌کنی — کدام را اول امتحان می‌کنی؟' }, { role: 'ai', text: 'ولی محیط فقط یک عدد نیست — از همهٔ داده‌ها استفاده کردی؟' }] }); }, PD);
      await click('main .lp-solved');
      info.g5bb = await p.evaluate(() => [...document.querySelectorAll('#lpBBest option')].map(o => o.textContent));
      chk(info.g5bb.some(t => /ثابتش می‌کنی یا با یک مثالِ نقض ردش می‌کنی — کدام را اول امتحان می‌کنی؟/.test(t)) && !info.g5bb.some(t => /^💬 کدام را اول امتحان می‌کنی؟/.test(t)) && info.g5bb.some(t => /^💬 محیط فقط یک عدد نیست — از همهٔ داده‌ها استفاده کردی؟/.test(t)),
        // DECISIONS_R15 O1: سرِ خبریِ پیش از «—» دیگر بریده نمی‌شود (پیش‌تر G5 آن را می‌برید) — فقط «ولی» ِ آغاز
        'G5→R15 O1: lpBBest keeps a question whose part before «—» carries its object, and keeps a declarative head too (only the leading «ولی» goes) (s23/s29) ' + JSON.stringify(info.g5bb.filter(t => /💬/.test(t))));
      await fillBack({ chk: 'ضلع‌ها ۷ و ۱۴ و ۹ شد و جمعشان ۳۰ است' }); await setParts('yes');
      await click('main .lp-lbsave');
      info.g5find = await p.evaluate(pid => APP.liveClosure(pid), PD);
      chk(info.g5find.state === 'solved' && /حل شد/.test(info.g5find.label) && !/اثبات شد/.test(info.g5find.label) && !/اثبات شد/.test(await txt('main .lp-lbsum')), 'G5: a find problem closes «✅ حل شد», never «اثبات شد» (s06) ' + JSON.stringify({ v: info.g5find.verdict, l: info.g5find.label }));
      // s01: قانون یعنی رابطهٔ یافته، نه معیارِ نابرابری یا «رابطه با صاحبخانه»
      const PH = await mk({ title: 'خانه', st: 'باید تا آخرِ ماه خانه اجاره کنم؛ سه گزینه دارم و می‌خواهم بهترینش را انتخاب کنم.', nat: 'practical' });
      await understand({ one: 'می‌خواهم بهترین خانه را انتخاب کنم', unk: 'گزینهٔ مناسب', data: ['درآمدِ ماهانه ۶۰ میلیون است', 'سه گزینه دارم'], cond: 'اجاره کمتر از ۴۰ درصدِ درآمد باشد', prac: true, measure: 'اجارهٔ ماهانه ≤ ۲۴ میلیون تومان' });
      await addMove('mv_special', 'اول فقط دو شرطِ اصلی را می‌سنجم');
      await fillIf('#lpPlan2', 'اگر نشد از یک مشاورِ آشنا می‌پرسم');
      await savePlan('نخست سه گزینه را با دو شرط مقایسه می‌کنم سپس با صاحبخانهٔ بهترین تماس می‌گیرم');
      await realStep('رابطه‌ام را با صاحبخانهٔ گزینهٔ ج خوب نگه دارم و قرارداد را بپرسم', 'قرارداد ۵ ساله می‌دهد', 'فردا');
      await day(1); await go('lprob', PH, 'exec');
      await outcome({ what: 'صاحبخانه قرارداد ۵ ساله را قبول کرد', match: 'yes', prog: 'بله، روشن' });
      await click('main .lp-solved');
      chk(await has('#lpBLaw') === 0, 'G5: a housing choice with an inequality criterion and «رابطه با صاحبخانه» gets no «قانون… حالتِ حدی» (s01)');
      info.g5res = await p.evaluate(pid => APP.liveResult ? APP.liveResult(pid) : '', PH);
      chk(/قرارداد ۵ ساله/.test(info.g5res), 'G5: the related-solved «نتیجه» is the result reached (last real outcome), not the glance sentence (s01) ' + info.g5res);
    });

    await section('G5-lpod-guess', async () => {
      await day(0);
      // s05: سرانجامِ «رد شد» ِ فرضیهٔ زندگی ⇒ liveClosure.refuted
      const PL = await mk({ title: 'بدگمانی ۲', st: 'همکارم عمداً گزارش‌ها را دیر می‌فرستد — اثبات یا رد کن.', kind: 'pod', nat: 'life' });
      await understand({ one: 'می‌خواهم بدانم بدگمانی‌ام درست است', unk: 'همکارم عمداً گزارش‌ها را دیر می‌فرستد', data: ['سه گزارش دیر رسید', 'او پروژهٔ دیگری هم دارد'], cond: 'شاهدِ واقعی داشته باشم', sat: 'yes', suff: 'کافی است', suffW: 'سه مورد را می‌سنجم', guess: 'درست است' });
      await addMove('mv_special', 'اول فقط یک هفته زمانِ رسیدنِ گزارش‌ها را می‌نویسم');
      await savePlan('نخست یک هفته زمانِ گزارش‌ها را می‌نویسم سپس با خودش حرف می‌زنم');
      await realStep('یک هفته زمانِ رسیدنِ هر گزارش را بنویسم', 'بیشترشان دیر می‌رسد', 'فردا');
      await day(1); await go('lprob', PL, 'exec');
      await outcome({ what: 'گزارش‌ها به‌موقع رسید؛ دیرکردِ پیشین از پروژهٔ دیگرش بود', match: 'no', prog: 'بله، روشن' });
      await click('main .lp-solved');
      await fillBack({ chk: 'یک هفته زمان‌ها را نوشتم؛ همه به‌موقع بود' }); await setParts('no'); await selIf('#lpBPodL', 'ref');
      await click('main .lp-lbsave');
      info.g5lref = await p.evaluate(pid => APP.liveClosure(pid), PL);
      chk(info.g5lref.verdict === 'liferef' && info.g5lref.refuted === true, 'G5: a life hypothesis closed «رد شد» reports refuted:true (s05) ' + JSON.stringify({ v: info.g5lref.verdict, r: info.g5lref.refuted, l: info.g5lref.label }));
      // s01/s22: حدسِ تازه اطمینان و آزمونِ خودش را می‌خواهد؛ s11: پروندهٔ کارخانهٔ حدسِ ردشده بسته می‌شود
      const PG = await mk({ title: 'فروشِ عصر', st: 'فروشِ عصرهای مغازه‌ام کم شده؛ می‌خواهم علتش را بفهمم.', nat: 'life' });
      await go('lprob', PG, 'u');
      await whole('دنبالِ علتِ افتِ فروشِ عصر هستم', 'درآمدم به آن بسته است');
      await sel('#lpNat', 'life');
      await p.fill('#lpUnk', 'علتِ کم شدنِ فروشِ عصر');
      await p.fill('#lpD_d1', 'عصرها کمتر فروختیم'); await p.fill('#lpD_d2', 'مغازهٔ روبه‌رو تخفیف داده');
      await p.fill('#lpCond', 'علت را با شاهد بیابم');
      if (await has('#lpSat')) await sel('#lpSat', 'yes');
      await sel('#lpSuff', 'ناکافی است — چیزی کم است'); await p.fill('#lpSuffW', 'هنوز همه را نمی‌دانم');
      await p.fill('#lpGuess', 'تخفیفِ مغازهٔ روبه‌رو علت است'); await sel('#lpConf', '90'); await p.fill('#lpTest', 'یک عصر مشتری‌ها را می‌شمارم');
      await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
      await sel('#lpGWant', 'yes'); await fillIf('#lpGContra', 'اگر مشتری‌ها همان قدر بیایند ولی کمتر بخرند');
      await click('main .lp-usave'); await clickIf('main .lp-u .sv-g2');
      const caseId = (await S(PG)).g[1].caseId;
      chk(!!caseId, 'G6 setup: a wanted, confident guess opened a factory case');
      await addMove('mv_special', 'اول فقط یک عصر را دقیق می‌شمارم');
      await savePlan('نخست مشتری‌های عصر را می‌شمارم سپس از چند مشتری می‌پرسم');
      await realStep('فردا عصر مشتری‌ها را بشمارم', 'مشتری‌ها به مغازهٔ روبه‌رو رفته‌اند', 'فردا');
      await day(2); await go('lprob', PG, 'exec');
      await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', 'مشتری‌ها همان قدر آمدند ولی کمتر خریدند'); await sel('#lpOMatch', 'no'); await sel('#lpOProg', 'کمی'); await sel('#lpOWant', 'same');
      await sel('#lpOGuess', 'refute'); await p.fill('#lpOReflect', 'تخفیف علت نبود؛ شاید قیمتِ عصر علت است');
      await selIf('#lpONewG', 'yes'); await fillIf('#lpONewGT', 'گران‌تر بودنِ قیمت‌های عصر علت است');
      await click('main .lp-outsave');
      info.g5ng0 = await p.evaluate(pid => APP.S.get('eprog_' + pid).solve.g[1].guess, PG);
      chk(info.g5ng0 === 'تخفیفِ مغازهٔ روبه‌رو علت است', 'G5: a new guess without its own confidence and refuting test is not saved (s22) ' + info.g5ng0);
      await selIf('#lpONewGC', '60'); await fillIf('#lpONewGTest', 'یک عصر قیمت‌ها را مثلِ صبح می‌کنم و فروش را می‌شمارم');
      await click('main .lp-outsave');
      info.g5ng = await p.evaluate(([pid, cid]) => { const g = APP.S.get('eprog_' + pid).solve.g[1], cs = APP.S.get(cid); return { g: g.guess, conf: g.conf, test: g.test, ifRef: g.ifRef, cs: cs && cs.status, res: cs && cs.liveResult && cs.liveResult.v }; }, [PG, caseId]);
      chk(info.g5ng.g === 'گران‌تر بودنِ قیمت‌های عصر علت است' && info.g5ng.conf === 60 && /قیمت/.test(info.g5ng.test) && !info.g5ng.ifRef, 'G5: the new guess carries its OWN confidence and test (no inherited 90% / ifRef) (s01/s22) ' + JSON.stringify(info.g5ng));
      chk(info.g5ng.cs === 'closed' && info.g5ng.res === 'نادرست', 'G6: the refuted guess\'s factory case is closed with its outcome (s11) ' + JSON.stringify(info.g5ng));
    });

    /* ===================== G6 — حکم‌های صادقانه ===================== */
    await section('G6-range', async () => {
      await day(0);
      // s09: جوابِ صادقانهٔ مسئلهٔ عملی بازه/«دست‌نیافتنی» است ⇒ «✅ حل شد — جواب: بازه»، نه ایراد
      const PK = await mk({ title: 'کیک‌فروشی', st: 'می‌خواهم کیک‌فروشی‌ام ماهی ۲۰ میلیون سود بدهد؛ قیمتِ هر کیک را چقدر بگذارم؟', nat: 'practical' });
      await understand({ one: 'می‌خواهم قیمتِ کیک را بیابم', unk: 'قیمتِ هر کیک', data: ['هزینهٔ هر کیک ۳۰۰ هزار است', 'ماهی ۶۰۰ تا ۸۰۰ کیک می‌فروشم'], cond: 'سودِ ماه دست‌کم ۲۰ میلیون باشد', prac: true, measure: 'سود = (قیمت − ۳۰۰) × تعداد' });
      await addMove('mv_special', 'اول دو سناریوی فروش را جدا حساب می‌کنم');
      await fillIf('#lpPlan2', 'اگر نشد از یک مشاورِ آشنا می‌پرسم');
      await savePlan('نخست سود را برای ۶۰۰ و ۸۰۰ کیک حساب می‌کنم سپس قیمت را می‌سنجم');
      await realStep('این هفته با دو قیمت کیک بفروشم و سود را حساب کنم', 'سود به ۲۰ می‌رسد', 'فردا');
      await day(1); await go('lprob', PK, 'exec');
      await outcome({ what: 'با بالاترین قیمتی که مشتری می‌پذیرد سود ۱۷٫۵ میلیون شد', match: 'no', prog: 'بله، روشن' });
      await click('main .lp-solved');
      await fillBack({ chk: 'با ۶۰۰ و ۸۰۰ کیک حساب کردم؛ سود ۱۷٫۵ میلیون شد و به ۲۰ نرسید' });
      info.g6opts = await p.evaluate(() => [...document.querySelectorAll('#lpBCP_0 option')].map(o => o.value));
      chk(info.g6opts.includes('range'), 'G6: a practical problem\'s per-part check offers «the honest answer is a range / unreachable» (s09) ' + JSON.stringify(info.g6opts));
      if (info.g6opts.includes('range')) {
        await fillIf('#lpBApprox', 'تقریبِ ده درصد بس بود'); await fillIf('#lpBUnits', 'تومان با تومان، کیک با کیک');
        await setParts('range'); await fillIf('#lpBRangeW', 'با سقفِ قیمتی که مشتری می‌پذیرد سود بینِ ۱۲ تا ۱۷٫۵ میلیون است؛ ۲۰ با این فروش دست‌نیافتنی است');
        chk(await has('main .lp-bdefect') === 0, 'G6: a range/unreachable answer is not forced into a defect');
        await click('main .lp-lbsave');
      }
      info.g6r = await p.evaluate(pid => APP.liveClosure(pid), PK);
      info.g6rT = (await toasts()).slice(-400);
      chk(info.g6r.state === 'solved' && info.g6r.verdict === 'range' && /بازه/.test(info.g6r.label) && /دست‌نیافتنی/.test(info.g6r.label), 'G6: closes «✅ حل شد — جواب: بازه/دست‌نیافتنی (با دلیل)» (s09) ' + JSON.stringify({ s: info.g6r.state, v: info.g6r.verdict, l: info.g6r.label }));
    });

    await section('G6-goal-mentions-equiv', async () => {
      await day(0);
      // s35: زیرِ چرخشِ اعلام‌شده، گامی که هدف را نمی‌برد ⇒ «🎯 هدف را گم نکن» — حتی وقتی برچسبِ گام «از طرح» است
      const PN = await lifeSetup({ title: 'تمیزیِ محله', st: 'می‌خواهم طرحِ تمیزیِ محله این بار پایدار بماند.', u: { one: 'می‌خواهم طرح پایدار بماند', unk: 'پایداریِ طرحِ تمیزی', data: ['داوطلب‌ها خسته شدند', 'پیمانکار گران است'], cond: 'بی پولِ زیاد' },
        plan: 'نخست جمعه‌ها با داوطلب‌ها زباله جمع می‌کنیم سپس پیمانکار را امتحان می‌کنیم', beforePlan: async () => { await p.fill('#lpPlanRot', 'هر هفته یکی از دو مسیر (داوطلبِ جمعه یا پیمانکار) را عوض می‌کنیم'); } });
      chk(!!((await S(PN)).live.plan || {}).rot, 'G6 setup: plan with a declared rotation');
      // R7 H2 (s35): نخستین گامِ کار خودِ طرح است و دروازهٔ هدف ندارد — دروازه از وقتی است که چرخش راه افتاده
      await realStep('جمعه با داوطلب‌ها زباله جمع می‌کنیم', 'کوچه‌ها تمیز می‌ماند', 'فردا');
      await day(1); await go('lprob', PN, 'exec'); await outcome({ what: 'کوچه‌ها تمیز شد', match: 'yes', prog: 'کمی' });
      await p.fill('#lpStep', 'این هفته مسیر را عوض می‌کنیم: پیمانکار جمع می‌کند و جایزهٔ ماهانه می‌گذاریم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'کوچه‌ها تمیز می‌ماند'); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا');
      await click('main .lp-stepsave');
      info.g6goal = { tag: await p.evaluate(pid => APP.liveStepFollowsTag(pid, 'این هفته مسیر را عوض می‌کنیم: پیمانکار جمع می‌کند و جایزهٔ ماهانه می‌گذاریم'), PN), goal: await has('#lpGoalW'), steps: (await S(PN)).live.steps.length };
      chk(info.g6goal.goal === 1 && info.g6goal.steps === 1, 'G6: under a declared rotation a step that does not reach the goal asks «🎯 هدف را گم نکن» whatever its plan tag (s35) ' + JSON.stringify(info.g6goal));
      // s25: «۱/((n+1)(n+2))» نمونهٔ دادهٔ «۱/(k(k+1))» است ⇒ داده به کار رفته
      const PI = await mk({ title: 'جمعِ کسرها ۲', st: 'ثابت کنید برای هر n ≥ 1 جمعِ ۱/(k(k+1)) از k=1 تا n برابرِ n/(n+1) است.', kind: 'prove' });
      await understand({ one: 'می‌خواهم فرمولِ جمع را ثابت کنم', unk: 'جمع برابرِ n/(n+1) است', data: ['جملهٔ k ام برابرِ ۱/(k(k+1)) است', 'n عددی طبیعی است'], cond: 'جمع = n/(n+1)', guess: 'درست است' });
      await go('lprob', PI, 'plan');
      await p.fill('#lpPlan', 'با استقرا: فرض می‌کنم برای n درست است و با افزودنِ جملهٔ ۱/((n+1)(n+2)) برای n+1 نشان می‌دهم'); await W(500);
      info.g6men = { un: await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.textContent)), m: await p.evaluate(() => APP.liveMentions('با افزودنِ جملهٔ ۱/((n+1)(n+2)) برای n+1', 'جملهٔ k ام برابرِ ۱/(k(k+1)) است')) };
      chk(info.g6men.m === true && !info.g6men.un.some(t => /k\(k\+1\)|جملهٔ k/.test(t)), 'G6: a plan using «۱/((n+1)(n+2))» uses the datum «۱/(k(k+1))» (pattern instance, s25) ' + JSON.stringify(info.g6men));
      // s25: سادهٔ‌سازیِ یک اتحاد («(a+1)^2 − a^2 = 2a + 1») تبدیلِ شرط نیست ⇒ کارتِ هم‌ارزی نه؛ توانِ دو ِ واقعی ⇒ هست
      const PS = await objSetup({ title: 'مربع‌های پیاپی', st: 'تفاضلِ مربع‌های دو عددِ پیاپی را بیابید.', u: { one: 'می‌خواهم تفاضل را بیابم', unk: 'تفاضلِ مربع‌ها', data: ['دو عددِ پیاپی a و a+1'], cond: 'تفاضل برحسبِ a' }, plan: 'نخست تفاضلِ مربع‌ها را باز می‌کنم سپس ساده می‌کنم تا تفاضل بماند',
        steps: ['(a+1)^2 - a^2 = 2a + 1 پس تفاضل همیشه فرد است'] });
      info.g6eq = { id: await has('main .lp-equivq'), fn: await p.evaluate(() => APP.liveTransf ? [APP.liveTransf('(a+1)^2 - a^2 = 2a + 1'), APP.liveTransf('دو طرف را به توان دو رساندم: x + 6 = x^2')] : null) };
      chk(info.g6eq.id === 0 && info.g6eq.fn && info.g6eq.fn[0] === false && info.g6eq.fn[1] === true, 'G6: simplifying an identity is not a condition transform (no equivalence card); real squaring still is (s25) ' + JSON.stringify(info.g6eq));
      // s29: پیامِ «هنوز نه: بگو مجهول چگونه تغییر می‌کند» یک بار
      await go('lprob', PI, 'plan');
      await sel('#lpAuxK', 'part'); await p.fill('#lpAuxT', 'فقط جملهٔ نخست را نگه می‌دارم'); await p.fill('#lpAuxB', 'بعد جمله‌ها را یکی‌یکی می‌افزایم');
      await click('main .lp-auxsave');
      info.g6dup = await p.evaluate(() => (document.body.innerText.match(/بگو مجهول چگونه تغییر می‌کند/g) || []).length);
      chk(info.g6dup === 1, 'G6: the aux refusal «بگو مجهول چگونه تغییر می‌کند» appears once, not twice (s29) ' + info.g6dup);
      // s17: ردِ صفحه تا رفع نشده به دستیار می‌رسد — به هر سنی
      info.g6toast = await p.evaluate(() => { APP.toast('اول این‌ها: «آزمونِ ساختگیِ دورِ ۶»', 'bad'); APP.toast('پیامِ عادیِ دورِ ۶'); const now0 = Date.now; Date.now = () => now0() + 20 * 60000; let o; try { o = APP.ASSIST.recentToasts(); } finally { Date.now = now0; } return o; });
      chk(info.g6toast.some(t => /آزمونِ ساختگیِ دورِ ۶/.test(t)) && !info.g6toast.some(t => /پیامِ عادیِ دورِ ۶/.test(t)), 'G6: an unresolved page refusal still reaches the assistant 20 minutes later; an ordinary message does not (s17) ' + JSON.stringify(info.g6toast));
      await p.evaluate(() => APP.ASSIST.dropBadToasts());
    });
  } catch (e) { errors.push('exception: ' + (e && e.stack || e)); }
  console.log(JSON.stringify(info));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
