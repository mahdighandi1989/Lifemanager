// تورِ دستهٔ ۱ ِ پولیا — دورِ ۷ ِ اصلاح («live»): DECISIONS_R7 بندهای H2 (اولویتِ پرسشِ نوبت در coachCore) و H3 (واژه‌ها و پرچم‌ها).
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
  try {
    await p.goto(FILE); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(T0 => { window.__day = T0; APP.today = () => window.__day; APP.S.loaded = true; window.__calls = []; window.__q = [];
      APP.HOST = Object.assign({}, APP.HOST || {}, { remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }) });
      APP.callAI = async (sys, user, opts) => { __calls.push({ user }); const r = __q.shift(); const t = JSON.stringify(r || { reply: 'باشه.', status: 'related', memory: 'm', actions: [] }); return opts && opts.withMeta ? { text: t, files: [] } : t; }; }, T0);

    /* ===================== H2 — پرسشِ نوبت ===================== */
    await section('H2-seq', async () => {
      await day(0);
      // s02: گیرهای پیاپی در طرح ⇒ از کلی به خاص؛ هرگز همان پرسش دو بار پشتِ سرِ هم
      const PA = await mk({ title: 'کمد', st: 'کمدِ ۲ متری را می‌خواهم از درِ اتاقم رد کنم؛ در ۹۰ سانت پهنا و ۲۰۰ سانت ارتفاع دارد. جا می‌شود؟', nat: 'practical' });
      await understand({ one: 'می‌خواهم بدانم کمد از در رد می‌شود', unk: 'رد شدن یا نشدنِ کمد', data: ['کمد ۲ متر بلندی دارد', 'در ۹۰ سانت پهنا دارد', 'ارتفاعِ در ۲۰۰ سانت است'], cond: 'کمد آسیب نبیند', prac: true, measure: 'قطرِ کمد ≤ ۲۰۰ سانت' });
      await go('lprob', PA, 'plan');
      await newSess();
      const qs = [];
      for (const m of ['نمی‌دونم از کجا شروع کنم.', 'نمی‌دونم.', 'نمی‌دونم.', 'نمی‌دونم، باز هم گیرم.']) { await say(m); qs.push(turnQ(await lastUser())); }
      info.seq = qs.map(q => q.slice(0, 90));
      chk(/اثرِ محسوس دارند همه|همه.{0,6}داده/.test(qs[0]), 'H2: first stuck in plan with an unused datum ⇒ the general «همهٔ داده‌ها؟» (s02) ' + JSON.stringify(info.seq));
      chk(qs.every((q, i) => q && (i === 0 || q !== qs[i - 1])), 'H2: never the identical stuck question twice in a row (s02) ' + JSON.stringify(info.seq));
      chk(/دادهٔ «[^»]+» را کجا به کار برده‌ای/.test(qs[1]), 'H2: the second consecutive stuck turn names the unused datum (more specific) (s02) ' + JSON.stringify(info.seq));
      chk(/به\s*عقب/.test(qs[2]), 'H2: the third consecutive stuck turn ⇒ «از خواسته به عقب» (s02) ' + JSON.stringify(info.seq));
      chk(/کمکی|بخشی از شرط|مرتبط/.test(qs[3]), 'H2: the fourth ⇒ an auxiliary/related problem (s02) ' + JSON.stringify(info.seq));
      // سشنِ تازه (روزی دیگر) دنباله را از کلی‌ترین پرسش آغاز می‌کند
      await newSess(); await say('امروز هم نمی‌دونم.');
      info.seqNew = turnQ(await lastUser()).slice(0, 90);
      chk(/اثرِ محسوس دارند همه|همه.{0,6}داده/.test(info.seqNew), 'H2: a new session restarts the sequence from the most general question ' + info.seqNew);
    });

    await section('H2-aside', async () => {
      await day(0);
      // s30: دادهٔ کنارگذاشته با دلیل «رسیدگی‌شده» است — با دادهٔ به‌کارنرفتهٔ دیگر، گیر ⇒ «همهٔ داده‌ها؟»، نه آن داده
      const PC = await mk({ title: 'جابه‌جایی', st: 'باید وسایلِ خانه را با یک وانت به خانهٔ تازه ببرم؛ ۴۰ کارتن داریم، وانت ۱۵ کارتن می‌برد و رنگِ کارتن‌ها فرق دارد. چند سفر؟', nat: 'practical' });
      await understand({ one: 'می‌خواهم بدانم چند سفر لازم است', unk: 'شمارِ سفرهای وانت', data: ['۴۰ کارتن داریم', 'وانت ۱۵ کارتن می‌برد', 'رنگِ کارتن‌ها فرق دارد'], cond: 'همه در یک روز برسد', prac: true, measure: 'سفرها ≤ ۴' });
      await addMove('mv_special', 'اول یک سفر را حساب می‌کنم');
      await fillIf('#lpPlan2', 'اگر نشد یک وانتِ دوم کرایه می‌کنم');
      await p.fill('#lpPlan', 'نخست ظرفیتِ وانت را می‌سنجم سپس تقسیم می‌کنم'); await W(350);
      const ids = await unusedIds(); const how = {};
      for (const id of ids) { const t = await p.evaluate(id => (document.querySelector('main .lp-plan .lp-un[data-d="' + id + '"]') || {}).textContent || '', id); how[id] = /رنگ/.test(t) ? ['skip', 'رنگِ کارتن در شمارِ سفرها هیچ اثری ندارد'] : /۴۰|40/.test(t) ? ['unknown', 'هنوز نمی‌دانم کجای حساب می‌آید'] : ['use', 'در گامِ تقسیم به کار می‌رود']; }
      await answerUnused(how); await click('main .lp-plansave');
      info.asideSet = { aside: await p.evaluate(pid => Object.keys(APP.liveAside(pid)).length, PC), un: await p.evaluate(pid => APP.liveUnused(pid).map(x => x.t), PC), ids, how, plan: !!((await S(PC)).live.plan || {}).at, t: (await toasts()).slice(-200), miss: await txt('main .lp-planmiss, main .lp-plan .bad') };
      chk(info.asideSet.aside === 1 && info.asideSet.un.length >= 1, 'H2 setup: one datum set aside with a reason, another still unused ' + JSON.stringify(info.asideSet));
      info.asideApi = await p.evaluate(pid => { const c = APP.liveCoach(pid, { stuck: true, turn: { stuck: true, text: 'تو طرح گیر کردم' } }); return { q: c.q.slice(0, 80), src: c.src }; }, PC);
      chk(info.asideApi.src !== 'stuck-aside' && info.asideApi.src === 'stuck-alldata', 'H2: liveCoach — stuck with another datum unused ⇒ stuck-alldata, not the handled aside datum (s30) ' + JSON.stringify(info.asideApi));
      await newSess(); await say('تو طرح گیر کردم.');
      info.asideQ = turnQ(await lastUser()).slice(0, 120);
      chk(!/کنار گذاشته بودی/.test(info.asideQ) && /همه.{0,6}داده|اثرِ محسوس دارند همه/.test(info.asideQ), 'H2: a datum set aside WITH a reason is «handled» — stuck with another datum unused ⇒ «همهٔ داده‌ها؟», not the aside datum (s30) ' + info.asideQ);
    });

    await section('H2-cards', async () => {
      await day(0);
      // s36: کارتِ هم‌ارزی (پس از تبدیل) بر «میانهٔ راه» مقدم است؛ «میانهٔ راه» از نخستین گامِ کار شمرده می‌شود، نه از ساختنِ مسئله
      const st = 'معادلهٔ √(x+3) = x − 3 را حل کنید.';
      const PQ = await mk({ title: 'رادیکال', st, nat: 'objective' });
      await understand({ one: 'می‌خواهم جوابِ معادله را بیابم', unk: 'مقدارِ x که معادله را برقرار کند', data: ['√(x+3) = x − 3'], cond: 'x حقیقی و زیرِ رادیکال نامنفی', depNo: true });
      await addMove('mv_equation', 'دو طرف را مربع می‌کنم تا رادیکال برود');
      await savePlan('نخست دو طرف را به توانِ دو می‌رسانم سپس معادلهٔ درجهٔ دو را حل می‌کنم');
      await day(4); await go('lprob', PQ, 'exec');
      await objStep('دو طرف را مربع کردم: x + 3 = (x − 3)^2 پس x^2 − 7x + 6 = 0 و x = 1 یا x = 6', 'از مربع کردنِ دو طرفِ داده و حلِ درجهٔ دو');
      info.cardsA = { co: await lastCo(PQ), ck: await has('main .lp-checkin') };
      chk(info.cardsA.ck === 0 && info.cardsA.co && info.cardsA.co.cardWhy === 'equiv', 'H2: the mid-course card is not due on the first day of work (counted from the first step, not creation), and the equivalence card is on screen (s36) ' + JSON.stringify(info.cardsA));
      // روزِ بعد از ۳ روز کار: هر دو کارت ⇒ هم‌ارزی پرسشِ نوبت، «میانهٔ راه» نه
      await day(8); await go('lprob', PQ, 'exec');
      info.cardsB = { ck: await has('main .lp-checkin'), co: await lastCo(PQ) };
      await newSess(); await say('کجا اشتباه کردم؟');
      info.cardsB.q = turnQ(await lastUser()).slice(0, 100);
      chk(info.cardsB.ck === 1 && /هم‌ارز/.test(info.cardsB.q) && !/میانهٔ راه/.test(info.cardsB.q), 'H2: with both on screen, the specific equivalence card outranks the mid-course card (s36) ' + JSON.stringify(info.cardsB));
    });

    await section('H2-checkin', async () => {
      await day(0);
      // s01/s04: «میانهٔ راه» پرسشِ نوبت فقط در یک نوبت؛ پرسشِ صریحِ خودِ کاربر در همان نوبت بر آن مقدم است
      const PK = await lifeSetup({ title: 'باشگاه', st: 'می‌خواهم سه ماه مرتب باشگاه بروم؛ دو بار شروع کردم و ول کردم.', plan: 'نخست هفته‌ای دو بار صبح می‌روم سپس سه بار' });
      await realStep('دوشنبه صبح ساعتِ هفت باشگاه بروم', 'می‌روم', 'فردا');
      await day(1); await go('lprob', PK, 'exec'); await outcome({ what: 'رفتم', match: 'yes', prog: 'کمی' });
      await day(6); await go('lprob', PK, 'exec');
      chk(await has('main .lp-checkin') === 1, 'H2 setup: the mid-course card is due');
      await newSess();
      await say('این حساب سرانگشتی کافیه؟'); const q0 = turnQ(await lastUser());
      await say('سلام، ادامه بدیم.'); const q1 = turnQ(await lastUser());
      await say('باشه، بعدش چی؟'); const q2 = turnQ(await lastUser());
      await say('خب.'); const q3 = turnQ(await lastUser());
      info.ck = [q0, q1, q2, q3].map(q => q.slice(0, 60));
      chk(!/میانهٔ راه/.test(q0), 'H2: the user\'s own explicit question in that turn outranks the mid-course card (s01/s04) ' + JSON.stringify(info.ck));
      chk(/میانهٔ راه/.test(q1), 'H2: the mid-course card is the turn question on its first turn ' + JSON.stringify(info.ck));
      chk(!/میانهٔ راه/.test(q3), 'H2: …and holds the turn question for ONE turn only (s01/s04) ' + JSON.stringify(info.ck));
      chk(await has('main .lp-checkin') === 1, 'H2: the card itself stays on the page');
    });

    await section('H2-refuse', async () => {
      await day(0);
      // s35: نخستین گامِ چرخش (خودِ طرح) دروازهٔ هدف ندارد؛ ردِ حل‌نشدهٔ صفحه (دروازهٔ هدف) بر «میانهٔ راه» مقدم است
      const PN = await lifeSetup({ title: 'تفکیکِ زباله', st: 'می‌خواهم تفکیکِ زباله در محله‌مان این بار پایدار بماند.', u: { one: 'می‌خواهم تفکیک پایدار بماند', unk: 'پایداریِ تفکیکِ زباله', data: ['داوطلب‌ها خسته شدند', 'پیمانکار گران است'], cond: 'بی پولِ زیاد' },
        plan: 'نخست با شهرداری قرارِ کتبیِ جمع‌آوریِ جدا می‌بندیم سپس جمعه‌ها داوطلب‌ها جمع می‌کنند', beforePlan: async () => { await p.fill('#lpPlanRot', 'هر هفته یکی از دو مسیرِ جمع‌آوری (داوطلبِ جمعه یا پیمانکار) را عوض می‌کنیم'); } });
      await realStep('با شهرداری قرارِ کتبیِ جمع‌آوریِ جدا را امضا می‌کنیم و جمعه داوطلب‌ها جمع می‌کنند', 'سه هفته بعد نیمی از خانه‌ها جدا می‌کنند', 'فردا');
      info.rf1 = { steps: (await S(PN)).live.steps.length, goal: await has('#lpGoalW') };
      chk(info.rf1.steps === 1 && info.rf1.goal === 0, 'H2: the first rotation step (the plan\'s own action) is not gated by word overlap with the unknown (s35) ' + JSON.stringify(info.rf1));
      await day(1); await go('lprob', PN, 'exec'); await outcome({ what: 'نیمی جدا کردند', match: 'yes', prog: 'کمی' });
      await day(9); await go('lprob', PN, 'exec');
      chk(await has('main .lp-checkin') === 1, 'H2 setup: mid-course card due on day 9');
      await p.fill('#lpStep', 'این هفته مسیر را عوض می‌کنیم: پیمانکار جمع می‌کند و برای کوچهٔ برتر جایزهٔ ماهانه می‌گذاریم'); await sel('#lpClear', 'بله'); await p.fill('#lpPred', 'درصدِ جداکننده‌ها بالا می‌رود'); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا');
      await click('main .lp-stepsave');
      chk(await has('#lpGoalW') === 1, 'H2 setup: the prize step (rotation already under way) is gated by «🎯 هدف را گم نکن»');
      await newSess(); await say('جایزه هم اضافه کنم خوبه دیگه؟');
      info.rf2 = turnQ(await lastUser()).slice(0, 120);
      chk(/هدف را گم نکن|نزدیکت می‌کند/.test(info.rf2) && !/میانهٔ راه/.test(info.rf2), 'H2: an unresolved page refusal (goal gate) outranks the mid-course card (s35) ' + info.rf2);
    });

    await section('H2-overcollect', async () => {
      await day(0);
      // s01: گردآوریِ بی‌پایان در مسئلهٔ عملی ⇒ «کجا خط می‌کشی؟»، هرگز «همهٔ داده‌ها؟»
      const PH = await mk({ title: 'خانهٔ تازه', st: 'باید تا آخرِ ماه خانه اجاره کنم؛ سه گزینه دارم و می‌خواهم بهترینش را انتخاب کنم.', nat: 'practical' });
      await understand({ one: 'می‌خواهم بهترین خانه را انتخاب کنم', unk: 'گزینهٔ مناسب', data: ['درآمدِ ماهانه ۶۰ میلیون است', 'سه گزینه دارم', 'محلِ کارم در شمال است'], cond: 'اجاره کمتر از ۴۰ درصدِ درآمد باشد', prac: true, measure: 'اجارهٔ ماهانه ≤ ۲۴ میلیون تومان' });
      await go('lprob', PH, 'plan');
      await newSess(); await say('می‌ترسم یه چیز مهم رو جا انداخته باشم. از کجا بدونم کِی دیگه بسه؟ گیر کردم.');
      info.oc = turnQ(await lastUser()).slice(0, 120);
      chk(/کجا خط می‌کشی/.test(info.oc) && !/همه.{0,6}داده|اثرِ محسوس دارند همه/.test(info.oc), 'H2: practical over-collecting ⇒ «کجا خط می‌کشی؟», never «همهٔ داده‌ها؟» (s01) ' + info.oc);
    });

    await section('H2-execstuck', async () => {
      await day(0);
      // s25: گیر در اجرا پیش از هر گام، با همهٔ داده‌ها به کار رفته ⇒ نردبانِ اجرای همان نوع (استقرا: حالتِ پایه/جای فرضِ استقرا) یا از حکم به عقب — نه «هر گام را وارسی کن»
      const PI = await mk({ title: 'تلسکوپی', st: 'ثابت کنید برای هر n ≥ 1 جمعِ ۱/(k(k+1)) از k=1 تا n برابرِ n/(n+1) است.', nat: 'objective', kind: 'prove' });
      await understand({ one: 'می‌خواهم فرمولِ جمع را ثابت کنم', unk: 'جمع برابرِ n/(n+1) است', data: ['n ≥ 1 طبیعی است', 'جملهٔ k ام برابرِ ۱/(k(k+1)) است'], cond: 'جمع = n/(n+1)', depNo: true });
      await addMove('mv_descent', 'برای هر عددِ طبیعیِ n با استقرا از n به n+1 می‌روم');
      await savePlan('نخست حالتِ n = 1 را می‌سنجم سپس با استقرا از n به n+1 می‌روم و جملهٔ ۱/(k(k+1)) را می‌افزایم');
      info.ex0 = { t: (await toasts()).slice(-160), ph: (await lastCo(PI)).ph, un: await p.evaluate(pid => APP.liveUnused(pid).length, PI), n: (await S(PI)).live.steps.length };
      await newSess(); await say('گیر کردم، نمی‌دونم از کجا شروع کنم.');
      info.ex = turnQ(await lastUser()).slice(0, 120);
      chk(info.ex0.ph === 'c' && info.ex0.un === 0 && info.ex0.n === 0, 'H2 setup: exec, no step, every datum used ' + JSON.stringify(info.ex0));
      chk(!/هر گام را وارسی کن/.test(info.ex) && /حالتِ پایه|به\s*عقب/.test(info.ex), 'H2: exec stuck with no step and all data used ⇒ the kind\'s exec ladder (induction base case) or backwards, not «هر گام را وارسی کن» (s25) ' + info.ex);
    });

    await section('H2-twoq', async () => {
      await day(0);
      // s25: پرسشِ نوبت «چطور می‌آزمایی‌اش؟» ⇒ C145 «برهانش؟» زمینه است، نه پرسشِ دوم
      const PT = await mk({ title: 'الگوی جمع', st: 'جمعِ ۱/(k(k+1)) از k=1 تا n چند است؟', nat: 'objective' });
      await understand({ one: 'می‌خواهم فرمولِ جمع را بیابم', unk: 'جمع برحسبِ n', data: ['جملهٔ k ام ۱/(k(k+1)) است', 'n طبیعی است'], cond: 'جمع از ۱ تا n', depNo: true });
      await newSess(); await say('حدسم اینه که n/(n+1) میشه. ۱۰ تاشو چک کردم، ثابت شد دیگه، درسته؟');
      const u = await lastUser(), co = coachOf(u);
      info.tq = { guess: /چطور می‌آزمایی‌اش/.test(u), c145: (co.match(/[^\n]*C145[^\n]*/) || [''])[0].slice(0, 200) };
      chk(info.tq.guess && info.tq.c145 && /زمینه \(نه پرسشِ دوم\)/.test(info.tq.c145) && !/بپرس «برهانش؟/.test(info.tq.c145), 'H2: when the turn question is the guess test, the C145 «برهانش؟» line is context, not a second question (s25) ' + JSON.stringify(info.tq));
      // s24: سطرِ نگاشتِ مسئلهٔ فرزند زمینه است، نه پرسشِ دوم
      const PF = await mk({ title: 'ضلع‌های مثلث', st: 'محیطِ مثلثی ۳۰ است؛ a دو برابرِ b و c دو واحد بیشتر از b است. ضلع‌ها؟', nat: 'objective' });
      await understand({ one: 'می‌خواهم سه ضلع را بیابم', unk: 'a و b و c', data: ['محیط ۳۰ است', 'a دو برابرِ b است'], cond: 'a + b + c = 30\nهر سه ضلع مثبت‌اند', depNo: true });
      await addMove('mv_equation', 'هر کمیت را با نماد می‌نویسم تا شرط معادله شود');
      await savePlan('نخست هر کمیت را برحسبِ b می‌نویسم سپس در محیط جای‌گذاری می‌کنم');
      await objStep('a = 2b و c = b + 2 پس 4b + 2 = 30 و b = 7', 'از داده‌ها و جای‌گذاری در محیط');
      await click('main .lp-solved');
      await fillBack({ chk: 'ضلع‌ها ۷ و ۱۴ و ۹ شد و جمعشان ۳۰ است', newProb: 'چهارضلعی‌ای با محیطِ ۴۰ که هر ضلعش برحسبِ یک ضلع داده شده', share: 'form', map: 'ضلع‌های مثلث ⇐ ضلع‌های چهارضلعی، محیطِ ۳۰ ⇐ محیطِ ۴۰' });
      await setParts('yes'); await selIf('#lpBDefTo', 'c');
      await click('main .lp-lbsave');
      const CH = ((await S(PF)).b[1] || {}).newPid;
      chk(!!CH, 'H2 setup: the child problem with the user\'s mapping was made');
      if (CH) {
        await go('lprob', CH); await newSess(); await say('شروع کنیم.');
        const bl = block(await lastUser(), '# مسئلهٔ زندهٔ این سشن'), ml = (bl.match(/[^\n]*نگاشتِ هم‌ریختیِ خودِ کاربر[^\n]*/) || [''])[0];
        info.map = ml.slice(0, 260);
        chk(ml && /زمینه \(نه پرسشِ دوم/.test(ml) && !/بپرس/.test(ml), 'H2: the child problem\'s mapping line is context, not a second question (s24) ' + info.map);
      }
    });

    await section('H2-abandonbool', async () => {
      await day(0);
      // پیامِ هماهنگ‌کننده (R7): turn.abandon ِ بولیِ مربی بر آزمونِ دوبارهٔ ABANDON_L روی متن مقدم است — «ولش نمی‌کنم»/«کنار بذارم» (درنگ) رها کردن نیست
      const PB = await lifeSetup({ title: 'کتاب', st: 'می‌خواهم کتابم را تا آخرِ سال تمام کنم؛ دو فصل مانده و گیرم.', noPlan: true });
      info.ab = await p.evaluate(pid => { const f = (t, a) => APP.liveCoach(pid, { turn: { text: t, abandon: a } }).src;
        return { neg: f('ولش نمی‌کنم، فقط امروز خسته‌ام', false), inc: f('می‌خوام یه هفته کنار بذارم ببینم چی به ذهنم می‌رسه', false), yes: f('دیگه می‌خوام بی‌خیالش بشم', true), legacy: f('پس راهی نیست، ولش کنم') }; }, PB);
      chk(info.ab.neg !== 'turn-abandon' && info.ab.inc !== 'turn-abandon' && info.ab.yes === 'turn-abandon' && info.ab.legacy === 'turn-abandon', 'H2: a boolean turn.abandon from the coach is used as is (negated «ولش نمی‌کنم» / incubation «کنار بذارم» ⇒ no turn-abandon); without it the text rule still works ' + JSON.stringify(info.ab));
    });

    await section('H3-reffresh', async () => {
      await day(0);
      // s19: سطرِ a38 «بپرس از ردش چه آموخت» فقط در روزِ خودِ رد — نه در نخستین نوبتِ شش هفته بعد
      const PR = await lifeSetup({ title: 'وزن', st: 'می‌خواهم ۸ کیلو کم کنم؛ فکر می‌کنم شام دیروقت علت است.', u: { one: 'می‌خواهم ۸ کیلو کم کنم', unk: 'راهِ کم کردنِ ۸ کیلو', data: ['شام ساعتِ ۱۱ می‌خورم', 'هفته‌ای یک بار ورزش'], cond: 'بی رژیمِ سخت', guess: 'شامِ دیروقت علتِ اضافه‌وزن است', test: 'دو هفته شام را ساعتِ ۸ می‌خورم' } });
      await realStep('دو هفته شام را ساعتِ ۸ بخورم', 'یک کیلو کم می‌شود', 'فردا');
      await day(1); await go('lprob', PR, 'exec');
      await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', 'وزنم تغییری نکرد'); await sel('#lpOMatch', 'no'); await sel('#lpOProg', 'نه'); await sel('#lpOWant', 'same');
      await sel('#lpOGuess', 'refute'); await p.fill('#lpOReflect', 'شام علت نبود؛ شاید میان‌وعده‌ها علت است'); await selIf('#lpONewG', 'no');
      await click('main .lp-outsave');
      const line = (u) => /حدسی که خودش با آزمون رد کرد: «[^\n]*بپرس از ردش چه آموخت/.test(block(u, '# مسئلهٔ زندهٔ این سشن'));   // سطرِ خودِ a38 (با متنِ حدس)؛ سطرِ شمارشیِ مربی (a27) جداست
      await newSess(); await say('دیدی؟ شام علت نبود.');
      const same = line(await lastUser());
      await day(43); await go('lprob', PR, 'exec'); await newSess(); await say('شش هفته گذشت، ۴ کیلو کم کردم با حذفِ میان‌وعده.');
      info.rf = { same, late: line(await lastUser()) };
      chk(info.rf.same, 'H3: on the day of the refutation the line is there ' + JSON.stringify(info.rf));
      chk(!info.rf.late, 'H3: the refuted-guess «بپرس از ردش چه آموخت» line is not fresh six weeks after the refutation (s19) ' + JSON.stringify(info.rf));
    });

    await section('H3-headnew', async () => {
      await day(0);
      // s25/s12: حدسِ تازه پس از مسئلهٔ بسته‌شده ⇒ سرواژه «فهم» (مسئلهٔ تازه)، نه «بازنگری»؛ نوبتِ ردِ حدس هم «بازنگری» نیست
      const phOf = (c) => (/مرحلهٔ محتمل: ([^·—(]+?)\s*(?:·|—|\()/.exec(c) || [])[1] || '';
      await go('e_home');   // نه روی صفحهٔ مسئلهٔ زندهٔ بندِ پیشین
      await newSess();
      await p.evaluate(() => __q.push({ reply: 'ثبت شد.', status: 'related', memory: 'm', actions: [{ do: 'chat_solved', title: 'جمعِ تلسکوپیِ دوتایی', statement: 'جمعِ ۱/(1·2) + ۱/(2·3) + … تا n جمله را پیدا کن', kind: 'find', lesson: 'هر جمله را به تفاضلِ دو کسر شکستم', check: 'برای n = ۳ حساب کردم' }] }));
      await say('حلش کردم: هر جمله را به تفاضلِ دو کسر شکستم؛ برای n = ۳ حساب کردم');
      await say('خودم الگوی ۱/(1·2·3) + ۱/(2·3·4) + … رو ساختم. حدسم اینه که میشه ۱/۴ − ۱/(2(n+1)(n+2)). سه تاشو چک کردم.');
      info.hn = { g: phOf(coachOf(await lastUser())) };
      await say('حدسم غلط بود؛ برای n = ۴ جور درنیومد.');
      info.hn.r = phOf(coachOf(await lastUser()));
      // همان تابعِ سرواژهٔ مربی (AS.coachLines) در وضعِ گزارش‌شده: سشنِ سوم که مرحلهٔ «بازنگری» را از مسئلهٔ بسته‌شده به ارث برده (s25 p8) و نوبتِ رد (s12 p5)
      info.hn.cl = await p.evaluate(() => { const AS = APP.ASSIST, hd = (o) => (AS.coachLines(Object.assign({ ph: 'b', cls: 'obj', qs: [], dry: true }, o)).split('\n')[0] || '');
        return { g: hd({ closed: 'جمعِ تلسکوپیِ دوتایی', mt: 'جلسه سوم: خودم الگوی ۱/(1·2·3) + … رو ساختم. حدسم اینه که میشه ۱/۴ − ۱/(2(n+1)(n+2)). سه تاشو چک کردم.' }), r: hd({ mt: 'سبزیجات؟ نه. اشتباه بود؛ حدسم غلط درآمد.', refuted: true }) }; });
      chk(/مرحلهٔ محتمل: فهم/.test(info.hn.cl.g) && !/مرحلهٔ محتمل: بازنگری/.test(info.hn.cl.r), 'H3: coach header — new guess after a closed problem ⇒ «فهم»; refutation turn ⇒ not «بازنگری» (s25/s12) ' + JSON.stringify(info.hn.cl).slice(0, 400));
      // دورِ ۷ (پیگیریِ نشستِ اصلی): فهرستِ پرسش‌ها هم از همان مرحلهٔ سرواژه — نه فهرستِ بازنگری (b1…) زیرِ سرواژهٔ «فهم»/«طرح»
      info.hn.ls = await p.evaluate(() => { const AS = APP.ASSIST, all = (o) => AS.coachLines(Object.assign({ ph: 'b', cls: 'obj', qs: [], dry: true }, o));
        return { g: all({ closed: 'جمعِ تلسکوپیِ دوتایی', mt: 'خودم الگو رو ساختم. حدسم اینه که میشه ۱/۴ − ۱/(2(n+1)(n+2)).' }), r: all({ mt: 'حدسم غلط بود؛ برای n = ۴ جور درنیومد.', refuted: 1 }) }; });
      chk(/(?:^|\s)u1\) /.test(info.hn.ls.g) && !/(?:^|\s)b1\) /.test(info.hn.ls.g), 'H3: the question list follows the «فهم» header for a new guess (u1…, not b1…) (s25) ' + info.hn.ls.g.slice(0, 200));
      chk(/(?:^|\s)p1\) /.test(info.hn.ls.r) && !/(?:^|\s)b1\) /.test(info.hn.ls.r), 'H3: the question list follows the «طرح» header on the refutation turn (p1…, not b1…) (s12) ' + info.hn.ls.r.slice(0, 200));
      chk(info.hn.g && !/بازنگری/.test(info.hn.g) && /فهم/.test(info.hn.g), 'H3: a new guess starting a new problem has header «فهم», not «بازنگری» (s25) ' + JSON.stringify(info.hn));
      chk(info.hn.r && !/بازنگری/.test(info.hn.r), 'H3: the refutation turn is not headed «بازنگری» (s12 p5) ' + JSON.stringify(info.hn));
    });

    /* ===================== H3 — واژه‌ها و پرچم‌ها ===================== */
    await section('H3-proverb', async () => {
      await day(0);
      // s03: ضرب‌المثلِ فهم در گفت‌وگو برای مسئلهٔ اثباتی «فرض چیست؟ حکم چیست؟» می‌پرسد، نه «مجهول چیست؟»
      const PZ = await mk({ title: 'زاویه‌های مثلث', st: 'ثابت کنید مجموعِ زاویه‌های داخلیِ هر مثلث ۱۸۰ درجه است.', nat: 'objective', kind: 'prove' });
      await newSess(); await say('این مسئله رو می‌خوام ثابت کنم، از کجا شروع کنم؟');
      const pl = (coachOf(await lastUser()).match(/[^\n]*کسی که بد می‌فهمد[^\n]*/) || [''])[0];
      info.prov = pl.slice(0, 260);
      chk(pl && /فرض چیست؟ حکم چیست؟/.test(pl) && !/مجهول چیست/.test(pl), 'H3: the chat proverb of a prove problem asks «فرض چیست؟ حکم چیست؟» (proofLike rewrite, s03) ' + info.prov);
      void PZ;
    });

    await section('H3-law', async () => {
      await day(0);
      // s01: تصمیمِ عملی (انتخابِ خانه) با «=» در مقدمهٔ گام ⇒ بی «قانون… حالتِ حدی»
      const PH = await mk({ title: 'خرید یا اجاره', st: 'خانه بخرم یا اجاره کنم؟ پس‌اندازم ۲ میلیارد است.', nat: 'practical' });
      await understand({ one: 'می‌خواهم بین خرید و اجاره تصمیم بگیرم', unk: 'خرید یا اجاره', data: ['پس‌انداز ۲ میلیارد است', 'اجارهٔ ماهانه ۲۰ میلیون است'], cond: 'بدهکار نشوم', prac: true, measure: 'قسطِ ماهانه ≤ ۲۵ میلیون' });
      await addMove('mv_special', 'اول قسطِ یک خانهٔ کوچک را می‌سنجم');
      await fillIf('#lpPlan2', 'اگر نشد با یک مشاور حرف می‌زنم');
      await savePlan('نخست قسطِ خرید را با اجاره مقایسه می‌کنم سپس با بانک حرف می‌زنم');
      await realStep('فردا با بانک دربارهٔ وامِ ۷ ساله حرف بزنم', 'قسط کمتر از اجاره می‌شود', 'فردا', 'مدتِ وام = 7 سال');
      await day(1); await go('lprob', PH, 'exec');
      await outcome({ what: 'قسطِ ۷ ساله ۲۳ میلیون شد', match: 'yes', prog: 'بله، روشن' });
      await click('main .lp-solved');
      info.law = { prem: ((await S(PH)).live.steps[0] || {}).prem, law: await has('#lpBLaw') };
      chk(/=/.test(info.law.prem || '') && info.law.law === 0, 'H3: lpBLaw never for a practical DECISION, even with «=» in a step premise (s01) ' + JSON.stringify(info.law));
    });

    await section('H3-lifepod', async () => {
      await day(0);
      // s05: فرضیهٔ زندگی — کارت‌های طرح و اجرا بی «مجهول»
      const PL = await mk({ title: 'بدگمانی', st: 'همکارم عمداً اطلاعات را از من پنهان می‌کند — اثبات یا رد کن.', kind: 'pod', nat: 'life' });
      await understand({ one: 'می‌خواهم بدانم بدگمانی‌ام درست است', unk: 'همکارم عمداً اطلاعات را پنهان می‌کند', data: ['دو بار گزارش دیر رسید', 'در جلسه چیزی نگفت'], cond: 'شاهدِ واقعی داشته باشم', sat: 'yes', suff: 'کافی است', suffW: 'دو مورد را می‌سنجم' });
      await go('lprob', PL, 'plan');
      info.lp = { rel: await txt('main .lp-rel'), plan: await p.evaluate(pid => APP.livePhaseQs(pid, 'p').filter(q => /مجهول/.test(q)), PL) };
      await addMove('mv_special', 'اول فقط یک هفته گزارش‌ها را می‌نویسم');
      await savePlan('نخست یک هفته زمانِ گزارش‌ها را می‌نویسم سپس با خودش حرف می‌زنم');
      info.lp.exec = await p.evaluate(pid => APP.livePhaseQs(pid, 'c').filter(q => /مجهول/.test(q)), PL);
      info.lp.clear = await p.evaluate(() => { const e = document.getElementById('lpClear'); const l = e && e.closest('label, .field, div'); return l ? l.textContent.slice(0, 120) : ''; });
      chk(!/مجهول/.test(info.lp.rel) && /فرضیه/.test(info.lp.rel) && !info.lp.plan.length && !info.lp.exec.length && !/مجهول/.test(info.lp.clear), 'H3: life-pod plan/exec cards say «فرضیه», never «مجهول» (s05) ' + JSON.stringify({ rel: (info.lp.rel.match(/.{0,60}مجهول.{0,60}/) || [''])[0], plan: info.lp.plan, exec: info.lp.exec, clear: info.lp.clear }));
    });

    await section('H3-best', async () => {
      await day(0);
      // s02: lpBBest همهٔ پرسش‌های گفت‌وگو را که کاربر پاسخ داد دارد — حتی «همهٔ داده‌ها را به کار برده‌ای؟» (بی واژهٔ پرسشی)
      const PB = await mk({ title: 'قفسه', st: 'قفسه‌ای ۱۸۰ سانتی را می‌خواهم در راهروی ۹۵ سانتی بچرخانم؛ ارتفاعِ سقف ۲۴۰ است. می‌چرخد؟', nat: 'practical' });
      await understand({ one: 'می‌خواهم بدانم قفسه می‌چرخد', unk: 'چرخیدن یا نچرخیدنِ قفسه', data: ['قفسه ۱۸۰ سانت است', 'راهرو ۹۵ سانت است', 'سقف ۲۴۰ سانت است'], cond: 'به دیوار نخورد', prac: true, measure: 'قطر ≤ ۲۴۰ سانت' });
      await go('lprob', PB, 'plan'); await newSess();
      for (let i = 0; i < 4; i++) await say('اول قطر رو حساب کنم؟ نمی‌دونم ' + (i + 1), 'از کجا شروع می‌کنی — چطور می‌آزمایی‌اش؟');
      await say('نمی‌دونم.', 'قطرِ کف را درست حساب کردی — این یک گامِ واقعی است. حالا: داده‌هایی که اثرِ محسوس دارند همه در طرح آمده‌اند؟ کلِ قیدها را؟');
      await say('آهان، ارتفاعِ سقف رو یادم رفته بود؛ قفسه رو عمودی می‌چرخونم.', 'خوب است.');
      for (let i = 0; i < 6; i++) await say('حساب کردم ' + (i + 1), 'کدام حالتِ خاص را می‌سنجی ' + (i + 1) + '؟');
      await addMove('mv_special', 'اول قطرِ قفسه را با سقف می‌سنجم'); await fillIf('#lpPlan2', 'اگر نشد قفسه را باز می‌کنم');
      await savePlan('نخست قطرِ قفسه را با ارتفاعِ سقف مقایسه می‌کنم سپس در راهرو عمودی می‌چرخانم');
      await realStep('فردا قفسه را عمودی در راهرو بچرخانم', 'می‌چرخد', 'فردا');
      await day(1); await go('lprob', PB, 'exec'); await outcome({ what: 'چرخید', match: 'yes', prog: 'بله، روشن' });
      await click('main .lp-solved');
      info.best = await p.evaluate(() => [...document.querySelectorAll('#lpBBest option')].map(o => o.textContent).filter(t => /💬/.test(t)));
      chk(info.best.some(t => /اثرِ محسوس دارند همه در طرح/.test(t)), 'H3: lpBBest includes the chat question the user answered — «همهٔ داده‌ها؟» (s02) ' + JSON.stringify(info.best));
    });

    await section('H3-refhist', async () => {
      await day(0);
      // s01: «ثبت به‌عنوانِ حدس» حدسِ ردشده را در تاریخچه نگه می‌دارد ⇒ «دوباره پیشنهاد نکن» در گفت‌وگو می‌ماند
      const PG = await mk({ title: 'فروشِ صبح', st: 'فروشِ صبح‌های مغازه‌ام کم شده؛ می‌خواهم علتش را بفهمم.', nat: 'life' });
      await go('lprob', PG, 'u');
      await whole('دنبالِ علتِ افتِ فروشِ صبح هستم', 'درآمدم به آن بسته است');
      await sel('#lpNat', 'life');
      await p.fill('#lpUnk', 'علتِ کم شدنِ فروشِ صبح');
      await p.fill('#lpD_d1', 'صبح‌ها کمتر فروختیم'); await p.fill('#lpD_d2', 'نانوایی کناری بسته شده');
      await p.fill('#lpCond', 'علت را با شاهد بیابم');
      if (await has('#lpSat')) await sel('#lpSat', 'yes');
      await sel('#lpSuff', 'ناکافی است — چیزی کم است'); await p.fill('#lpSuffW', 'هنوز همه را نمی‌دانم');
      await p.fill('#lpGuess', 'بسته شدنِ نانوایی علت است'); await sel('#lpConf', '70'); await p.fill('#lpTest', 'یک صبح مشتری‌ها را می‌شمارم');
      await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
      await click('main .lp-usave'); await clickIf('main .lp-u .sv-g2');
      await addMove('mv_special', 'اول فقط یک صبح را دقیق می‌شمارم');
      await savePlan('نخست مشتری‌های صبح را می‌شمارم سپس از چند مشتری می‌پرسم');
      await realStep('فردا صبح مشتری‌ها را بشمارم', 'کمتر از ماهِ پیش‌اند', 'فردا');
      await day(2); await go('lprob', PG, 'exec');
      await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', 'مشتری‌ها همان قدر آمدند ولی کمتر خریدند'); await sel('#lpOMatch', 'no'); await sel('#lpOProg', 'کمی'); await sel('#lpOWant', 'same');
      await sel('#lpOGuess', 'refute'); await p.fill('#lpOReflect', 'نانوایی علت نبود؛ شاید قیمتِ صبح علت است');
      await selIf('#lpONewG', 'yes'); await fillIf('#lpONewGT', 'گران‌تر بودنِ قیمت‌های صبح علت است'); await selIf('#lpONewGC', '60'); await fillIf('#lpONewGTest', 'یک صبح قیمت‌ها را کم می‌کنم و فروش را می‌شمارم');
      await click('main .lp-outsave');
      info.rh = { g: (await S(PG)).g[1].guess, pl: await p.evaluate(pid => APP.livePlausible(pid), PG) };
      await newSess(); await say('حدسم که نانوایی علت باشه غلط درآمد. حالا چی؟');
      const u = await lastUser();
      info.rh.line = (u.match(/[^\n]*دوباره پیشنهاد(?:ش)? نکن[^\n]*/) || [''])[0].slice(0, 200);
      chk(/قیمت/.test(info.rh.g) && info.rh.pl.refuted >= 1 && info.rh.line, 'H3: after «ثبت به‌عنوانِ حدس» the refuted guess stays in history ⇒ «دوباره پیشنهاد نکن» stays (s01) ' + JSON.stringify(info.rh));
    });

    await section('H3-header', async () => {
      await day(0);
      // s22: سرواژهٔ مربی برای اجرای مسئلهٔ عملی همان «اجرا روی واقعیت» ِ بلوکِ مسئله است
      const PR = await mk({ title: 'رنگ', st: 'برای رنگ‌کردنِ دیوارهای اتاقم چند لیتر رنگ بخرم؟ هر لیتر ۱۰ مترمربع را می‌پوشاند.', nat: 'practical' });
      await understand({ one: 'می‌خواهم بدانم چند لیتر رنگ بخرم', unk: 'لیترهای رنگ', data: ['هر لیتر ۱۰ مترمربع می‌پوشاند', 'دیوارها حدودِ ۴۰ مترمربع است'], cond: 'کم نیاید', prac: true, measure: 'لیترِ لازم = مساحت ÷ ۱۰' });
      await addMove('mv_special', 'اول یک دیوار را حساب می‌کنم');
      await fillIf('#lpPlan2', 'اگر نشد از فروشنده می‌پرسم');
      await savePlan('نخست مساحتِ دیوارها را اندازه می‌گیرم سپس بر پوششِ هر لیتر تقسیم می‌کنم');
      await newSess(); await say('حلش کردم! چهار لیتر کافیه.');
      const u = await lastUser(), hd = (coachOf(u).split('\n')[0] || '');
      info.hd = hd.slice(0, 220);
      chk(!/اجرای طرح/.test(hd) && /اجرا روی واقعیت/.test(hd + block(u, '# مسئلهٔ زندهٔ این سشن').split('\n')[0]), 'H3: the coach header for a practical exec phase says «اجرا روی واقعیت», like the live block (s22) ' + info.hd);
    });

    await section('H3-present', async () => {
      await day(0);
      // s10: «چطوری بگم؟» در بازنگریِ برهان ⇒ پرسشِ «مستقیمش می‌کنی؟» (b6)
      const PP = await mk({ title: 'بی‌نهایت اول', st: 'ثابت کنید بی‌نهایت عددِ اول وجود دارد.', nat: 'objective', kind: 'prove' });
      await understand({ one: 'می‌خواهم ثابت کنم عددهای اول تمام نمی‌شوند', unk: 'بی‌نهایت عددِ اول هست', data: ['هر عدد بزرگ‌تر از ۱ مقسوم‌علیهِ اول دارد'], cond: 'شمارِ عددهای اول متناهی نیست', depNo: true });
      await addMove('mv_contra', 'فرض می‌کنم عددهای اول متناهی‌اند تا به تناقض برسم');
      await savePlan('نخست فرض می‌کنم عددهای اول متناهی‌اند سپس حاصل‌ضربشان به‌علاوهٔ یک را می‌سازم');
      await objStep('فرض خلف: اگر اول‌ها p1 تا pn باشند، N = p1…pn + 1 بر هیچ‌کدام بخش‌پذیر نیست، پس تناقض', 'هر عدد بزرگ‌تر از ۱ مقسوم‌علیهِ اول دارد');
      await click('main .lp-solved');
      info.pr0 = (await lastCo(PP) || {}).ph;
      await newSess(); await say('برای خانواده توضیح دادم و نفهمیدن؛ با خلف گیج می‌شن. چطوری بگم؟');
      info.pr = turnQ(await lastUser()).slice(0, 140);
      chk(info.pr0 === 'b' && /مستقیم/.test(info.pr), 'H3: «چطوری بگم؟» in a proof look-back ⇒ the direct-proof question (b6) is the turn question (s10) ' + JSON.stringify({ ph: info.pr0, q: info.pr }));
    });
  } catch (e) { errors.push('fatal: ' + (e && e.message || e)); }
  console.log(JSON.stringify(info));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.map((e, i) => (i + 1) + ': ' + e).join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
