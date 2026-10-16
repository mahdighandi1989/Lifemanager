// تورِ دستهٔ ۱ ِ پولیا — دورِ ۸ ِ اصلاح («live»): DECISIONS_R8 بندهای I-live ۱–۱۰ (پرسشِ نوبت در coachCore، دروازهٔ هدف، واژه‌ها).
// هر بند روی مسیرِ واقعیِ کاربر: فرم‌های «🔭 مسئلهٔ حل‌نشدهٔ خودم» و پنجرهٔ واقعیِ دستیار با مدلِ بدلیِ «میانگینِ لفظی» (پرسشِ نوبت از خودِ پرامپتِ ساخته‌شده خوانده می‌شود).
// خطا ⇒ کدِ خروجِ غیرصفر. LLA_FILE (اختیاری) = مسیرِ html ِ ساختِ دیگر (خطِ قرمزِ پیش از اصلاح). ONLY=<پیشوندِ بند> فقط همان بند.
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
  const toasts = () => p.evaluate(() => (document.getElementById('toasts') || { textContent: '' }).textContent);
  const fillIf = async (s, v) => { if (await has(s)) await p.fill(s, v); };
  const selIf = async (s, v) => { if (await has(s)) await sel(s, v); };
  const clickIf = async (s) => { if (await has(s)) await click(s); };
  const section = async (name, fn) => { if (process.env.ONLY && name.indexOf(process.env.ONLY) !== 0) return; try { await fn(); } catch (e) { const m = String(e && e.message || e); errors.push(name + ' — exception: ' + m.split('\n')[0] + ' ' + ((m.match(/locator\([^)]*\)/) || [''])[0]) + ' · miss: ' + (await txt('main .lp-umiss, main .lp-planmiss, main .lp-stepmiss').catch(() => '')).slice(0, 200) + ' · last toasts: ' + (await toasts().catch(() => '')).slice(-200)); } };
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
    await click('main .lp-u .sv-g2');
  };
  const unusedIds = () => p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')));
  const answerUnused = async (how) => { for (const id of await unusedIds()) { const a = (how && how[id]) || ['use', 'در گامِ بعد به کار می‌رود']; await sel('#lpPU_a_' + id, a[0]); if (a[1] != null && await has('#lpPU_w_' + id)) await p.fill('#lpPU_w_' + id, a[1]); } };
  const addMove = async (mv, why) => { await sel('#lpMv', mv); await p.fill('#lpMvWhy', why); await click('main .lp-mvadd'); };
  const savePlan = async (plan, how) => { await p.fill('#lpPlan', plan); await W(350); await answerUnused(how); await click('main .lp-plansave'); };
  const objStep = async (text, proof) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); if (await has('#lpProof')) await p.fill('#lpProof', proof); await click('main .lp-stepsave'); };
  const realStep = async (text, pred, when, prem) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); if (prem) await fillIf('#lpPrem', prem); await p.fill('#lpPred', pred); await sel('#lpConf', '60'); await p.fill('#lpWhen', when || 'فردا'); await click('main .lp-stepsave'); };
  const outcome = async (o) => { await sel('#lpODone', o.done || 'yes'); await p.fill('#lpOWhat', o.what); if (await has('#lpOMatch')) await sel('#lpOMatch', o.match || 'yes'); await sel('#lpOProg', o.prog || 'کمی'); await sel('#lpOWant', 'same'); if (await has('#lpOGuess')) await sel('#lpOGuess', o.grel || 'none'); await click('main .lp-outsave'); };
  const lifeSetup = async (o) => {
    const P0 = await mk({ title: o.title, st: o.st, nat: o.nat || 'life', kind: o.kind });
    await understand(Object.assign({ one: 'می‌خواهم این را درست بفهمم و حلش کنم', unk: 'راهِ درست', data: ['داده‌ی نخست روشن است', 'داده‌ی دوم هم هست'], cond: 'بی آسیب به کسی' }, o.u || {}));
    if (o.noPlan) return P0;
    await addMove('mv_special', 'اول فقط یک حالتِ کوچک را می‌آزمایم تا دامنه تنگ شود');
    if (o.beforePlan) await o.beforePlan();
    await savePlan(o.plan || 'نخست یک گامِ کوچک را می‌آزمایم سپس نتیجه را می‌سنجم');
    return P0;
  };
  const fillBack = async (o) => {
    o = o || {};
    const f = async (id, v) => { if (await has(id)) await p.fill(id, v); };
    const s2 = async (id, v) => { if (await has(id)) await sel(id, v); };
    await s2('#lpBWant', 'same');
    await f('#lpBChk', o.chk || 'جواب را در همهٔ شرط جای‌گذاری کردم'); await s2('#lpBRes', 'نتیجه سالم ماند');
    await s2('#lpBHyp', 'all'); await s2('#lpBConcl', 'same');
    await f('#lpBOther', 'با حسابِ جداگانهٔ هر حالت به همین می‌رسیدم'); await f('#lpBGlance', 'جای‌گذاری و حلِ دستگاهِ ساده');
    await f('#lpBWorked', 'نوشتنِ هر کمیت برحسبِ یک مجهول'); await f('#lpBUse', 'هر جا چند مجهولِ وابسته دارم، همه را برحسبِ یکی می‌نویسم');
    await f('#lpBTaste', 'نمادگذاری را دوست داشتم، حسابِ طولانی را نه'); await s2('#lpBMulti', 'one');
    await f('#lpBLimit', 'اگر محیط به صفر برسد همهٔ ضلع‌ها صفر می‌شوند و فرمول همین را می‌گوید');
    await f('#lpBCond', 'هر بخشِ شرط در گامِ جای‌گذاری آمد'); await s2('#lpBDep', 'no');
    await f('#lpBDef', 'تعریفِ اول بودن در گامِ مثالِ نقض به کار رفت');
    await f('#lpBSym', 'نقش‌های یکسان در نتیجه هم یکسان‌اند'); await f('#lpBUnits', 'طول با طول');
    await f('#lpBDirect', 'بخشِ مستقیمِ برهان جداست');
    if (await has('#lpBHit')) { await sel('#lpBHit', 'درست بود'); await fillIf('#lpBHitW', 'فرضِ پنهانِ تقارن مرا فریب داد'); }
    if (await has('#lpBBest')) await sel('#lpBBest', await p.evaluate(() => document.querySelector('#lpBBest option:nth-child(2)').value));
    await f('#lpBNew', o.newProb || 'همین روش برای چهارضلعی با محیطِ ۴۰ و شرط‌های تازه');
    await s2('#lpBNewS', o.share || 'method'); await f('#lpBNewW', 'نوشتنِ همه برحسبِ یک مجهول و جای‌گذاری در محیط');
    if (o.map != null) await f('#lpBNewM', o.map);
  };
  const setParts = async (v) => { for (const id of await p.evaluate(() => [...document.querySelectorAll('select[id^="lpBCP_"]')].map(x => x.id))) await sel('#' + id, v); };
  // پنجرهٔ واقعیِ دستیار با مدلِ بدلی؛ پرسشِ نوبت از خودِ پرامپتی که به مدل رفت
  const say = async (text, reply) => {
    if (reply) await p.evaluate(r => __q.push({ reply: r, status: 'related', memory: 'm', actions: [] }), reply);
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
    await p.evaluate(() => APP.ASSIST.toggle(false)); await W(80);
  };
  const newSess = () => p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => (__calls[__calls.length - 1] || {}).user || '');
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  // «یک پرسش» ِ بلوکِ مسئلهٔ زنده (سطرِ مربی یا سطرِ خودِ بخشِ مسئله) ⇒ متنِ پرسش
  const turnQ = (u) => { const bl = block(u, '# مسئلهٔ زندهٔ این سشن'); const m = /نپرس\): «(.*)»\. اگر/.exec(bl) || /پرسشِ پیشنهادیِ این نوبت: «(.*)»\. اگر/.exec(bl); return m ? m[1] : ''; };
  const coachOf = (u) => block(u, '# مربیِ حل');
  const lastCo = (pid) => p.evaluate(pid => { const c = APP.liveCoach(pid); return c ? { ph: c.ph, card: c.card, cardWhy: c.cardWhy } : null; }, pid);
  const objSetup = async (o) => {
    const P0 = await mk({ title: o.title, st: o.st, nat: 'objective', kind: o.kind });
    await understand(Object.assign({ depNo: true }, o.u));
    await addMove('mv_equation', 'هر کمیت را با نماد می‌نویسم تا شرط معادله شود');
    await savePlan(o.plan || 'نخست هر کمیت را با نماد می‌نویسم سپس در شرط جای‌گذاری می‌کنم');
    for (const st of o.steps || ['هر کمیت را با نماد نوشتم و در شرط جای‌گذاری کردم']) await objStep(st, 'از داده‌ها و جای‌گذاری');
    return P0;
  };
  // «پیشنهادِ این نوبت» ِ بلوکِ مربی (مسئلهٔ فقط‌درگفت‌وگو)
  const coachSug = (u) => ((coachOf(u).match(/پیشنهادِ این نوبت: «(.*?)»\. اگر/) || ['', ''])[1]);
  const callsUsers = () => p.evaluate(() => __calls.map(c => c.user || ''));
  try {
    await p.goto(FILE); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(T0 => { window.__day = T0; APP.today = () => window.__day; APP.S.loaded = true; window.__calls = []; window.__q = [];
      APP.HOST = Object.assign({}, APP.HOST || {}, { remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }) });
      APP.callAI = async (sys, user, opts) => { __calls.push({ user }); const r = __q.shift(); const t = JSON.stringify(r || { reply: 'باشه.', status: 'related', memory: 'm', actions: [] }); return opts && opts.withMeta ? { text: t, files: [] } : t; }; }, T0);


    /* ===================== I-live — پرسشِ نوبت ===================== */
    await section('L1-name', async () => {
      await day(0);
      // s02: پلهٔ «نامِ داده» دادهٔ به‌کارنرفته را نام می‌برد — نه داده‌ای که کاربر در گفت‌وگو با عددش به کار برد
      const PA = await mk({ title: 'بار وانت', st: 'باری به طول ۳.۲ و عرض ۱.۸ و ارتفاع ۱.۵ متر را باید در وانتی با کفِ ۳.۵ متری ببرم. جا می‌شود؟', nat: 'practical' });
      await understand({ one: 'می‌خواهم بدانم بار در وانت جا می‌شود', unk: 'جا شدن یا نشدنِ بار', data: ['طول بار ۳.۲ متر (a)', 'عرض بار ۱.۸ متر (b)', 'ارتفاع بار ۱.۵ متر (c)', 'طول کف وانت ۳.۵ متر (L)'], cond: 'بار آسیب نبیند', prac: true, measure: 'بزرگ‌ترین قطرِ بار ≤ ۳.۵ متر' });
      await go('lprob', PA, 'plan');
      await newSess();
      await say('کف رو حساب کردم: رادیکال ۳.۲² + ۱.۸² ≈ ۳.۶۷… از ۳.۵ بیشتره. گیر کردم.'); const q0 = turnQ(await lastUser());
      await say('همینو حساب کردم دیگه. نمی‌دونم.'); const q1 = turnQ(await lastUser());
      info.l1 = [q0, q1].map(q => q.slice(0, 90));
      chk(/همه.{0,6}داده|اثرِ محسوس دارند همه/.test(q0), 'L1 setup: first stuck turn ⇒ all-data ' + JSON.stringify(info.l1));
      chk(/دادهٔ «[^»]+» را کجا به کار برده‌ای/.test(q1) && !/۳\.۲|۱\.۸|۳\.۵/.test(q1) && /ارتفاع/.test(q1), 'L1: the second stuck turn names a datum the user has NOT used anywhere (height c), never a/b which she used in chat (s02) ' + JSON.stringify(info.l1));
      // همهٔ داده‌ها در گفت‌وگو آمده‌اند ⇒ پلهٔ «نامِ داده» کنار می‌رود: از خواسته به عقب
      const PB = await mk({ title: 'بار دوم', st: 'باری به طول ۲.۴ و عرض ۱.۲ متر را در وانتی با کفِ ۲.۶ متری ببرم؟', nat: 'practical' });
      await understand({ one: 'می‌خواهم بدانم بار جا می‌شود', unk: 'جا شدن یا نشدنِ بار', data: ['طول بار ۲.۴ متر', 'عرض بار ۱.۲ متر', 'طول کف وانت ۲.۶ متر'], cond: 'بار آسیب نبیند', prac: true, measure: 'قطرِ بار ≤ ۲.۶ متر' });
      await go('lprob', PB, 'plan');
      await newSess();
      await say('۲.۴ و ۱.۲ رو با ۲.۶ مقایسه کردم، گیر کردم.'); const r0 = turnQ(await lastUser());
      await say('نمی‌دونم.'); const r1 = turnQ(await lastUser());
      info.l1b = [r0, r1].map(q => q.slice(0, 90));
      chk(!/دادهٔ «[^»]+» را کجا به کار برده‌ای/.test(r1) && /به\s*عقب/.test(r1), 'L1: when every unused datum already appears in the user\'s own messages, the name rung is skipped ⇒ backwards (s02) ' + JSON.stringify(info.l1b));
    });

    await section('L2-refuse', async () => {
      await day(0);
      // s19: ردِ صفحه («از طرحت نمی‌آید») همان روز پرسشِ نوبت است؛ هفته‌ها بعد زمینه — «دیگه برنامه عوض نکردم» پاسخِ آن است
      const PS = await lifeSetup({ title: 'هشت کیلو', st: 'می‌خواهم تا سه ماهِ دیگر هشت کیلو کم کنم؛ قبلاً دو بار شروع کردم و ول کردم.', u: { one: 'می‌خواهم هشت کیلو کم کنم', unk: 'راهِ پایدارِ کم کردنِ وزن', data: ['شب‌ها پرخوری می‌کنم', 'صبحانه نمی‌خورم'], cond: 'بی رژیمِ سخت' },
        plan: 'نخست شام را زودتر و سبک‌تر می‌خورم سپس صبحانه را اضافه می‌کنم' });
      await p.fill('#lpStep', 'حذفِ کاملِ قند از امروز'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'وزنم کم می‌شود'); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا');
      await click('main .lp-stepsave');
      chk(await has('main .lp-switch') === 1, 'L2 setup: the off-plan step is refused («طرح را عوض کردی؟»)');
      await newSess(); await say('باشه، حالا چی؟'); const q0 = turnQ(await lastUser());
      await day(42); await go('lprob', PS, 'exec');
      await newSess(); await say('دیگه برنامه عوض نکردم.'); const q1 = turnQ(await lastUser());
      info.l2 = { q0: q0.slice(0, 80), q1: q1.slice(0, 80), card: await has('main .lp-switch'), ck: await has('main .lp-checkin') };
      chk(/از طرحت نمی‌آید/.test(q0), 'L2: on the refusal day the unresolved refusal is the turn question ' + JSON.stringify(info.l2));
      chk(q1 && !/از طرحت نمی‌آید/.test(q1), 'L2: six weeks later the stale refusal is context, not the turn question (s19) ' + JSON.stringify(info.l2));
      chk(info.l2.ck !== 1 || /میانهٔ راه/.test(q1), 'L2: …the due mid-course card is the turn question instead (one question, same as the coach) ' + JSON.stringify(info.l2));
    });

    await section('L3-cardmore', async () => {
      await day(0);
      // s26: گیرِ دومِ پیاپی روی کارتِ معادله‌ها ⇒ پلهٔ خاص‌ترِ همان کارت (نامِ بخشِ شرطِ بی‌معادله)، نه همان پرسش
      const PE = await objSetup({ title: 'موتورِ دونفره', st: 'سه نفریم و یک موتورِ دونفره؛ موتور ۴۰ و پیاده ۵ کیلومتر در ساعت؛ ایستگاه ۳۰ کیلومتر دورتر است. زودترین زمانِ رسیدنِ هر سه؟',
        u: { one: 'می‌خواهم زودترین زمانِ رسیدن را بیابم', unk: 'زمانِ رسیدنِ هر سه', data: ['سرعتِ موتور ۴۰ است', 'سرعتِ پیاده ۵ است'], cond: 'هر سه با هم برسند\nموتور دو نفر می‌برد' },
        steps: ['x + y = 30 و 40a = x و 5a = y را نوشتم'] });
      await fillIf('#lpEqUnk', '۴'); await clickIf('main .lp-eqsave');
      await newSess();
      await say('صفحه میگه معادله کمه. گیر کردم.'); const q0 = turnQ(await lastUser());
      await say('هنوز نمی‌دونم. گیرم.'); const q1 = turnQ(await lastUser());
      await say('باز هم نمی‌دونم.'); const q2 = turnQ(await lastUser());
      info.l3 = [q0, q1, q2].map(q => q.slice(0, 100));
      chk(/معادله کم است/.test(q0), 'L3 setup: first stuck turn on the equations card ⇒ its verdict ' + JSON.stringify(info.l3));
      chk(q1 && q1 !== q0 && /هر سه با هم برسند|موتور دو نفر/.test(q1), 'L3: the second consecutive stuck turn escalates within the card — names the condition part still without an equation (s26) ' + JSON.stringify(info.l3));
      chk(q2 && q2 !== q1 && q2 !== q0, 'L3: …and the third goes on to the next rung — neither a repeat nor back to the card\'s general verdict ' + JSON.stringify(info.l3));
    });

    await section('L4-chatdata', async () => {
      await day(0);
      // s18: مسئلهٔ فقط‌درگفت‌وگو، گیر در اجرا با دادهٔ به‌کارنرفته (۳۰) ⇒ «همهٔ داده‌ها؟» پرسشِ نوبت است و سطرِ 🎯 زمینه
      await go('home');
      await newSess();
      await say('یه قیف مخروطی (نوک پایین) با شعاع دهانه ۱۰ سانت و ارتفاع ۳۰ سانت داریم. آب با نرخ ثابت ۵ سانتی‌متر مکعب در ثانیه از ته خارج می‌شه. وقتی عمق آب ۱۲ سانته، سطح آب با چه سرعتی پایین میاد؟ فرمولش یادم نیست. حجم مخروط ⅓πr²h = ⅓·π·۱۰۰·۱۲ تقسیم بر ۵ ثانیه؟', 'پیش از جایگذاری: مجهول دقیقاً چیست؟ می‌توانی آن را به عبارتِ دیگری بگویی؟');
      await say('مجهول؟ «سرعت پایین اومدن سطح آب». یعنی «تغییر عمق در واحد زمان»، اون لحظه که عمق ۱۲ه. پس نرخ تغییر عمق، dy/dt.', 'عالی. حالا داده‌ها: چه چیزهایی در دست داری و هر کدام به چه کمیتی مربوط است؟');
      await say('نرخ حجم داده شده: V با سرعت ۵ کم می‌شه. حجم آب V = ⅓πr²y. ولی r رو نمی‌دونم! شعاع سطح آب که ۱۰ نیست، فقط شعاع دهانه‌ست. داده کمه.', 'همهٔ داده‌ها را به کار برده‌ای؟');
      const u3 = await lastUser();
      await say('V = ⅓πr²y رو نوشتم ولی باز نمی‌دونم r چیه. گیر کردم.');
      const u4 = await lastUser();
      info.l4 = { s3: coachSug(u3).slice(0, 90), g3: ((coachOf(u3).match(/[^\n]*🎯[^\n]*/) || [''])[0]).slice(0, 120), s4: coachSug(u4).slice(0, 90) };
      chk(/همهٔ داده‌ها را به کار برده‌ای/.test(info.l4.s3) && /زمینه \(نه پرسشِ دوم\)/.test(info.l4.g3), 'L4: stuck in exec with an unused datum ⇒ «همهٔ داده‌ها؟» is the turn question and the 🎯 goal line is context (s18) ' + JSON.stringify(info.l4));
      chk(/دادهٔ «[^»]*۳۰[^»]*» را کجا به کار برده‌ای/.test(info.l4.s4), 'L4: …after «همهٔ داده‌ها؟» was asked, the next stuck turn names the unused datum (۳۰) ' + JSON.stringify(info.l4));
    });

    await section('L5-goalgate', async () => {
      await day(0);
      // s35: گامِ چرخش که به یک علتِ ثبت‌شده می‌پردازد («مسئولِ هر کوچه» ⇐ «کسی مسئولِ جمع‌آوری نبود») رو به هدف است؛ گامِ جایزه هنوز دروازه دارد
      const PN = await lifeSetup({ title: 'تفکیکِ پایدار', nat: 'practical', st: 'می‌خواهم تفکیکِ زباله در محله‌مان این بار بعد از ماهِ اول بماند.', u: { one: 'می‌خواهم تفکیک پایدار بماند', unk: 'روشی که تفکیک بعد از ماهِ اول هم ادامه پیدا کند', data: ['بارِ اول کسی مسئولِ جمع‌آوریِ کیسه‌های جدا نبود و شهرداری قاطی برد', 'بارِ دوم سطل‌ها دزدیده شد و مردم دلسرد شدند'], cond: 'بی بودجهٔ تازه', prac: true, measure: 'درصدِ خانوارِ جداکننده بعد از سه ماه ≥ نیم' },
        plan: 'نخست با شهرداری قرارِ کتبیِ جمع‌آوریِ جدا می‌بندیم سپس سطل‌ها را با زنجیر نگه می‌داریم', beforePlan: async () => { await fillIf('#lpPlan2', 'اگر شهرداری قرار نبست، با یک پیمانکارِ بازیافت قرار می‌گذاریم'); await p.fill('#lpPlanRot', 'هر هفته یکی از دو مسیرِ جمع‌آوری (داوطلبِ جمعه یا پیمانکار) را عوض می‌کنیم'); } });
      await realStep('با شهرداری قرارِ کتبیِ جمع‌آوریِ جدا را امضا می‌کنیم', 'سه هفته بعد نیمی از خانه‌ها جدا می‌کنند', 'فردا');
      await day(1); await go('lprob', PN, 'exec'); await outcome({ what: 'نیمی جدا کردند', match: 'yes', prog: 'کمی' });
      const n0 = (await S(PN)).live.steps.length;
      await p.fill('#lpStep', 'این هفته مسیر را عوض می‌کنیم: پیمانکار جمع می‌کند و برای کوچهٔ برتر جایزهٔ ماهانه می‌گذاریم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'درصدِ جداکننده‌ها بالا می‌رود'); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا');
      await click('main .lp-stepsave');
      const g1 = { gate: await has('#lpGoalW'), n: (await S(PN)).live.steps.length };
      await p.fill('#lpStep', 'این هفته مسیر را عوض می‌کنیم: پیمانکار جمع می‌کند و مسئولِ هر کوچه پیگیری می‌کند'); await W(80);
      await click('main .lp-stepsave');
      info.l5 = { n0, g1, n2: (await S(PN)).live.steps.length, miss: (await txt('main .lp-stepmiss')).slice(0, 160) };
      chk(g1.gate === 1 && g1.n === n0, 'L5 setup: the prize step (no cause addressed) is still gated by «🎯 هدف را گم نکن» ' + JSON.stringify(info.l5));
      chk(info.l5.n2 === n0 + 1, 'L5: a rotation step that addresses a recorded cause («مسئولِ هر کوچه» ⇐ «کسی مسئولِ جمع‌آوری نبود») is goal-directed — saved without the gate (s35) ' + JSON.stringify(info.l5));
    });

    await section('L6-overcol', async () => {
      await day(0);
      // s17: «باید دقیق‌تر بشه… رو هم دربیارم… از کجا پیدا کنم؟» گردآوریِ بی‌پایان است ⇒ «کجا خط می‌کشی؟»
      const PT = await mk({ title: 'مخزنِ باران', st: 'می‌خواهم برای آبیاریِ باغچه مخزنِ آبِ باران بگذارم؛ سقف ۸۰ مترمربع است و باران سالانه ۲۵۰ میلی‌متر. مخزن چند لیتری؟', nat: 'practical' });
      await understand({ one: 'می‌خواهم اندازهٔ مخزن را بدانم', unk: 'حجمِ مناسبِ مخزن', data: ['سقف ۸۰ مترمربع است', 'باران سالانه ۲۵۰ میلی‌متر است'], cond: 'آبِ تابستان را بدهد', prac: true, measure: 'حجمِ لازم ≤ ۲۰ هزار لیتر' });
      await go('lprob', PT, 'plan');
      await newSess(); await say('باید دقیق‌تر بشه: تبخیر، شیب سقف و ضریب رواناب رو هم دربیارم. از کجا پیدا کنم؟');
      info.l6 = turnQ(await lastUser()).slice(0, 100);
      chk(/کجا خط می‌کشی/.test(info.l6), 'L6: «باید دقیق‌تر بشه… رو هم دربیارم» ⇒ «کجا خط می‌کشی؟» (s17) ' + info.l6);
    });

    await section('L7-systurn', async () => {
      await day(0);
      // s34: نگه‌داشتِ یک‌نوبتیِ «میانهٔ راه» با نوبتِ «[سامانه: …]» مصرف نمی‌شود — نوبتِ بعدیِ کاربر آن را می‌گیرد
      const PK = await lifeSetup({ title: 'باشگاهِ دوم', st: 'می‌خواهم سه ماه مرتب باشگاه بروم؛ دو بار شروع کردم و ول کردم.', plan: 'نخست هفته‌ای دو بار صبح می‌روم سپس سه بار' });
      await realStep('دوشنبه صبح ساعتِ هفت باشگاه بروم', 'می‌روم', 'فردا');
      await day(1); await go('lprob', PK, 'exec'); await outcome({ what: 'رفتم', match: 'yes', prog: 'کمی' });
      await day(6); await go('lprob', PK, 'exec');
      chk(await has('main .lp-checkin') === 1, 'L7 setup: the mid-course card is due');
      await newSess();
      await p.evaluate(pid => __q.push({ reply: 'بریم صفحهٔ طرح.', status: 'related', memory: 'm', actions: [{ do: 'go', view: 'lprob', arg: pid, sub: 'plan' }] }), PK);
      await say('این حساب سرانگشتی کافیه؟ بریم طرح رو ببینیم.');
      const U = await callsUsers();
      const sysQ = U.length > 1 ? turnQ(U[U.length - 1]) : '';
      const sys = U.length > 1 && /\[سامانه/.test(U[U.length - 1].slice(-1500));
      await say('خب، ادامه بدیم.'); const q1 = turnQ(await lastUser());
      info.l7 = { calls: U.length, sys, sysQ: sysQ.slice(0, 60), q1: q1.slice(0, 80) };
      chk(sys, 'L7 setup: the go action produced a «[سامانه: …]» follow-up turn ' + JSON.stringify(info.l7));
      chk(/میانهٔ راه/.test(q1), 'L7: the user\'s next real message gets the mid-course card — the one-turn hold was not spent on the system turn (s34) ' + JSON.stringify(info.l7));
    });

    /* ===================== I-live — واژه‌ها ===================== */
    await section('L8-tags', async () => {
      await day(0);
      // s24: هیچ برچسبِ درونی («H2 دورِ ۷، s24») در متنِ پرامپت — سطرِ نگاشتِ مسئلهٔ فرزند
      const PF = await mk({ title: 'ضلع‌های مثلثِ دوم', st: 'محیطِ مثلثی ۳۰ است؛ a دو برابرِ b و c دو واحد بیشتر از b است. ضلع‌ها؟', nat: 'objective' });
      await understand({ one: 'می‌خواهم سه ضلع را بیابم', unk: 'a و b و c', data: ['محیط ۳۰ است', 'a دو برابرِ b است'], cond: 'a + b + c = 30\nهر سه ضلع مثبت‌اند', depNo: true });
      await addMove('mv_equation', 'هر کمیت را با نماد می‌نویسم تا شرط معادله شود');
      await savePlan('نخست هر کمیت را برحسبِ b می‌نویسم سپس در محیط جای‌گذاری می‌کنم');
      await objStep('a = 2b و c = b + 2 پس 4b + 2 = 30 و b = 7', 'از داده‌ها و جای‌گذاری در محیط');
      await click('main .lp-solved');
      await fillBack({ chk: 'ضلع‌ها ۷ و ۱۴ و ۹ شد و جمعشان ۳۰ است', newProb: 'چهارضلعی‌ای با محیطِ ۴۰ که هر ضلعش برحسبِ یک ضلع داده شده', share: 'form', map: 'ضلع‌های مثلث ⇐ ضلع‌های چهارضلعی، محیطِ ۳۰ ⇐ محیطِ ۴۰' });
      await setParts('yes'); await selIf('#lpBDefTo', 'c');
      await click('main .lp-lbsave');
      const CH = ((await S(PF)).b[1] || {}).newPid;
      chk(!!CH, 'L8 setup: the child problem was created');
      if (CH) { await go('lprob', CH, 'u'); await newSess(); await say('بریم سراغِ چهارضلعی.'); }
      const u = await lastUser(), bl = block(u, '# مسئلهٔ زندهٔ این سشن');
      info.l8 = { map: /نگاشتِ هم‌ریختیِ خودِ کاربر/.test(bl), leak: (u.match(/[^\n]{0,40}(?:دورِ\s*[0-9۰-۹]+|(?:^|[^a-zA-Z0-9])s[0-9]{2}(?![0-9]))[^\n]{0,40}/) || [''])[0] };
      chk(info.l8.map && !info.l8.leak, 'L8: no internal tag («دورِ ۷»، «s24») reaches the prompt; the mapping line is there (s24) ' + JSON.stringify(info.l8));
    });

    await section('L9-best', async () => {
      await day(0);
      // s25/s29: «کدام پرسش کمک کرد؟» سرِ پرسش را نگه می‌دارد («مجهول دقیقاً چیست —»، «… — و آن از چه…؟»)
      const PB = await mk({ title: 'نقطه', st: 'نقطه‌ای روی خط بیابید که مجموعِ فاصله‌اش از دو نقطهٔ داده‌شده کمینه باشد.', nat: 'objective' });
      await understand({ one: 'می‌خواهم نقطهٔ کمینه را بیابم', unk: 'نقطهٔ روی خط', data: ['دو نقطه داده شده', 'یک خط داده شده'], cond: 'مجموعِ فاصله کمینه', depNo: true });
      await go('lprob', PB, 'plan'); await newSess();
      await say('از کجا شروع کنم؟', 'مجهول دقیقاً چیست — نقطه‌ای که دنبالش هستی چه ویژگی‌ای دارد؟');
      await say('نقطه‌ای که جمعِ فاصله‌ها کمترین باشه.', 'از حکم به عقب: خواسته از چه چیزی نتیجه می‌شد — و آن از چه چیزی نتیجه می‌شد؟');
      await say('از قرینهٔ یکی از نقطه‌ها نسبت به خط.', 'خوب است.');
      info.l9 = await p.evaluate(pid => APP.liveChatQs(pid), PB);
      chk(info.l9.some(t => /^مجهول دقیقاً چیست — نقطه‌ای/.test(t)), 'L9: the chat question keeps its head «مجهول دقیقاً چیست —» (s29) ' + JSON.stringify(info.l9));
      chk(info.l9.some(t => /از چه چیزی نتیجه می‌شد — و آن از چه/.test(t)) && !info.l9.some(t => /^و آن از چه/.test(t)), 'L9: a tail starting «و آن از چه…» is not cut from its head (s25) ' + JSON.stringify(info.l9));
    });

    await section('L10-lifeplan', async () => {
      await day(0);
      // s05: کارتِ طرحِ فرضیهٔ زندگی بی «داده و مجهول»
      const PL = await mk({ title: 'بدگمانیِ دوم', st: 'همکارم عمداً اطلاعات را از من پنهان می‌کند — اثبات یا رد کن.', kind: 'pod', nat: 'life' });
      await understand({ one: 'می‌خواهم بدانم بدگمانی‌ام درست است', unk: 'همکارم عمداً اطلاعات را پنهان می‌کند', data: ['دو بار گزارش دیر رسید', 'در جلسه چیزی نگفت'], cond: 'شاهدِ واقعی داشته باشم', sat: 'yes', suff: 'کافی است', suffW: 'دو مورد را می‌سنجم' });
      await go('lprob', PL, 'plan');
      info.l10 = { hint: (await txt('main .lp-plan > p.small')).slice(0, 140), gw: await p.evaluate(pid => (APP.liveCoach(pid) || {}).list, PL) };
      chk(info.l10.hint && !/داده و مجهول/.test(info.l10.hint) && /فرضیه/.test(info.l10.hint), 'L10: the life-pod plan hint is worded with «فرضیه», not «داده و مجهول» (s05) ' + JSON.stringify(info.l10.hint));
    });
  } catch (e) { errors.push('fatal: ' + (e && e.message || e)); }
  console.log(JSON.stringify(info));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.map((e, i) => (i + 1) + ': ' + e).join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
