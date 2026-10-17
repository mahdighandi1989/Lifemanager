// تورِ پولیا (دستهٔ ۱، دورِ ۱۰ ِ اصلاح — دورِ «بی‌نقص»، ۲۰۲۶-۱۰-۱۶) — سویِ «live» ِ DECISIONS_R10 (J3 و سویِ بلوکِ زندهٔ J1) روی رابطِ واقعی.
// اصل: یک پرسش در هر نوبت؛ هر سطرِ دیگرِ بلوکِ زنده «زمینه (نه پرسشِ دوم)» و بی «بپرس»؛ «کدام پرسش کمک کرد؟» هر پرسش را کامل و یک بار نشان می‌دهد؛
// وارسیِ واژه‌ای هشدار می‌دهد و سد نمی‌کند (E4).
//  head    lpBBest: سرِ پرسشی با فعلِ ماضیِ نقلیِ دوم‌شخص («… وارسی کرده‌ای —») و دنبالهٔ «و در …» یک پرسش‌اند (s25 c16)؛ پیش‌درآمدِ ستایشی هنوز بریده می‌شود
//  dedupe  lpBBest: پرسشِ صفحه و بازگفتنش در گفت‌وگو یک گزینه‌اند (s05)؛ پرسشِ گفت‌وگوی دیگر گزینهٔ خودش را دارد
//  d5      «دو بچه» در «خانواده‌های دوفرزندی» به کار رفته است؛ دادهٔ به‌کارنرفتهٔ بی‌پاسخ در طرح یک بار هشدار می‌گیرد و «ثبت با همین — دلیل» می‌پذیرد (s28)
//  only    مسئلهٔ زنده: «فقط جواب رو بگو» بی تلاشِ دیدنی ⇒ پرسشِ نوبت «پیش از هر سرنخ: خودت تا کجا رفتی و کجا ماندی؟» (s38 p1، J1)؛ با تلاش ⇒ نه
//  ctx     سطرهای خودِ بلوکِ زنده (عملی، ضرب‌المثل، ردِ حدس، داورِ انتخاب‌نشده) کنارِ پرسشِ نوبت «زمینه (نه پرسشِ دوم)» و بی «بپرس»
//  one     ساختاری: در همهٔ نوبت‌های واقعیِ این آزمون، بلوکِ زنده ≤ ۱ دستورِ پرسشِ بی‌نشان دارد
// همه از رابطِ واقعی (پنجرهٔ دستیار با مدلِ بدل، فرم‌های «🔭»)؛ خطا ⇒ کدِ خروجِ غیرصفر. LLA_FILE = ساختِ دیگر (خطِ قرمز: ساختِ 97f1595)؛ ONLY=head,d5.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0] + ' ' + JSON.stringify(info[name] && info[name].stage || '')); } };
  const W = (ms) => p.waitForTimeout(ms || 90);
  const T0 = '2026-11-02';
  const D = (n) => { const d = new Date(2026, 10, 2 + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const day = async (n) => { await p.evaluate(x => { window.__day = x; }, D(n)); };
  await p.goto(FILE); await p.waitForSelector('.nav'); await W(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0;
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); const r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
  }, T0);
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await W(140); };
  const sel = async (s, v) => { await p.selectOption(s, v); await W(120); };
  const click = async (s) => { await p.click(s); await W(160); };
  const hasEl = (s) => p.locator(s).count();
  const fillIf = async (s, v) => { if (await hasEl(s)) await p.fill(s, v); };
  const selIf = async (s, v) => { if (await hasEl(s)) await sel(s, v); };
  const S = (pid) => p.evaluate(pid => { const pg = APP.S.get('eprog_' + pid); return JSON.parse(JSON.stringify(pg && pg.solve || {})); }, pid);
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
    await p.evaluate(() => APP.ASSIST.toggle(false)); await W(60);
  };
  const lastUser = () => p.evaluate(() => (__calls[__calls.length - 1] || {}).user || '');
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const liveOf = (u) => block(u, '# مسئلهٔ زندهٔ این سشن');
  const next = (reply) => p.evaluate(reply => __q.push(R({ reply })), reply);
  const CTX_RE = /^- زمینه \(نه پرسشِ دوم\)/;
  const turnQ = (u) => { const bl = liveOf(u); const m = /نپرس\): «(.*)»\. اگر/.exec(bl) || /پرسشِ پیشنهادیِ این نوبت: «(.*)»\. اگر/.exec(bl); return m ? m[1] : ''; };
  // ساختاری (J1): دستورِ پرسشِ بی‌نشان در بلوکِ زنده = سطرِ «فقط یک پرسش»، پرسشِ «داور؟»، یا هر سطرِ «- …» ِ بی «زمینه (نه پرسشِ دوم)» که «بپرس» دارد —
  // جز سطرهای شرطیِ رویدادی دیگر («اگر گیر است…» ِ داده‌ها، «اگر مسئلهٔ تازهٔ دیگری آورد…»)
  const directives = (bl) => bl.split('\n').filter(l => /^- /.test(l) && !CTX_RE.test(l) && (/^- در این نوبت فقط \*\*یک\*\* پرسش|^- همهٔ پرسش‌های این مرحله/.test(l) || /بپرس(?![آ-ی])/.test(l))
    && !/^- داده‌هایی که هنوز/.test(l) && !/^- این گفت‌وگو به همین مسئله بسته است/.test(l));
  const blocks = [];   // همهٔ بلوک‌های زندهٔ این آزمون، برای بندِ ساختاری
  const keep = (u, tag) => { const bl = liveOf(u); if (bl) blocks.push({ tag, bl }); return u; };
  const mk = async (o) => { await go('e_prob', null, 'live'); await p.fill('#lpNewT', o.title); await p.fill('#lpNewS', o.st); await W(60); if (o.kind) await sel('#lpNewType', o.kind); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return p.evaluate(() => APP.state.arg); };
  const understand = async (o, beforeSave) => {
    await p.fill('#lpOne', o.one); await p.fill('#lpWhy', 'برایم مهم است و کنجکاوم'); await click('main .lp-onesave');
    if (o.nat && await hasEl('#lpNat')) await sel('#lpNat', o.nat);
    await p.fill('#lpUnk', o.unk);
    for (let i = 0; i < o.data.length; i++) { if (i >= 2) await click('main .lp-dadd'); await p.fill('#lpD_d' + (i + 1), o.data[i]); }
    await p.fill('#lpCond', o.cond);
    if (await hasEl('#lpSat')) await sel('#lpSat', 'yes');
    await sel('#lpSuff', 'ناکافی است — چیزی کم است'); await fillIf('#lpSuffW', 'هنوز همه را نمی‌دانم');
    await fillIf('#lpSuffChal', 'همهٔ داده‌ها با هم آن را معین می‌کنند');
    if (await hasEl('#lpDep')) await sel('#lpDep', 'no');
    await p.fill('#lpGuess', o.guess || 'راهی هست'); await sel('#lpConf', '60'); await p.fill('#lpTest', 'با یک حالتِ خاص می‌آزمایم');
    await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
    if (beforeSave) await beforeSave();
    await click('main .lp-usave'); if (await hasEl('main .lp-u .sv-g2')) await click('main .lp-u .sv-g2');
  };
  const addMove = async () => { await p.selectOption('#lpMv', 'mv_special').catch(() => {}); await fillIf('#lpMvWhy', 'اول فقط یک حالت را دقیق می‌بینم تا دامنه تنگ شود'); if (await hasEl('main .lp-mvadd')) await click('main .lp-mvadd'); };
  const answerUnused = async () => { for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); } };
  const savePlan = async (plan) => { await addMove(); await p.fill('#lpPlan', plan); await W(350); await answerUnused(); await click('main .lp-plansave'); };
  const realStep = async (text, pred) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); await p.fill('#lpPred', pred); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا'); await click('main .lp-stepsave'); };
  const objStep = async (text, proof) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); await fillIf('#lpProof', proof); await click('main .lp-stepsave'); };
  const outcome = async (o) => { await sel('#lpODone', o.done || 'yes'); await p.fill('#lpOWhat', o.what); if (await hasEl('#lpOMatch')) await sel('#lpOMatch', o.match || 'yes'); await sel('#lpOProg', o.prog || 'کمی'); await sel('#lpOWant', 'same'); if (await hasEl('#lpOGuess')) await sel('#lpOGuess', o.grel || 'none'); if (o.more) await o.more(); await click('main .lp-outsave'); };
  const pageSess = async (pid) => { await go('lprob', pid); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; }); };
  const bestOpts = () => p.evaluate(() => [...document.querySelectorAll('#lpBBest option')].map(o => o.textContent));

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  // ================= head — سرِ پرسشی با فعلِ ماضیِ نقلیِ دوم‌شخص و دنبالهٔ «و در …» =================
  await section('head', async () => {
    const r = info.head = {}; r.stage = 'mk';
    await day(0);
    const P = await mk({ title: 'ضلع‌های مثلث', st: 'محیطِ مثلثی ۳۰ است؛ a دو برابرِ b و c دو واحد بیشتر از b است. ضلع‌ها چقدرند؟', nat: 'objective' });
    await understand({ one: 'می‌خواهم سه ضلع را بیابم', unk: 'a و b و c', data: ['محیط ۳۰ است', 'a دو برابرِ b است'], cond: 'a + b + c = 30', guess: 'b حدودِ هفت است', nat: 'objective' });
    r.stage = 'plan'; await savePlan('نخست هر ضلع را برحسبِ b می‌نویسم سپس در محیط جای‌گذاری می‌کنم');
    r.stage = 'chat'; await pageSess(P);
    await next('برای استقرا، حالتِ پایه (کوچک‌ترین n) را جدا وارسی کرده‌ای — و در گامِ استقرا دقیقاً کجا می‌خواهی از فرضِ استقرا (درستیِ حکم برای n) استفاده کنی؟');
    await say('این‌جا استقرا لازم است؟ نمی‌دونم.'); keep(await lastUser(), 'head1');
    await next('آفرین، تا این‌جا خوب پیش رفته‌ای — بخشِ دومِ شرط را کجا به کار بردی؟');
    await say('حالتِ پایه را جدا نوشتم. a = 2b و c = b + 2 را هم نوشتم.'); keep(await lastUser(), 'head2');
    r.stage = 'step'; await go('lprob', P, 'exec');
    await objStep('a = 2b و c = b + 2 پس 4b + 2 = 30 و b = 7', 'از داده‌ها و جای‌گذاری در محیط');
    r.stage = 'back'; await click('main .lp-solved');
    const o = (await bestOpts()).filter(t => /💬/.test(t)); r.chat = o; delete r.stage;
    chk(o.some(t => /^💬 برای استقرا، حالتِ پایه \(کوچک‌ترین n\) را جدا وارسی کرده‌ای — و در گامِ استقرا دقیقاً کجا می‌خواهی از فرضِ استقرا \(درستیِ حکم برای n\) استفاده کنی؟$/.test(t)) && !o.some(t => /^💬 و در/.test(t)),
      'head: lpBBest shows the whole question «… وارسی کرده‌ای — و در گامِ استقرا دقیقاً کجا …؟» — a 2nd-person perfect head and a tail starting «و در» stay one question (s25 c16) ' + JSON.stringify(o));
    // DECISIONS_R15 O1: فقط بندِ ستایشیِ آغاز («آفرین،») بریده می‌شود؛ سرِ پیش از «—» هرگز (پیش‌تر کلِ «آفرین، تا این‌جا خوب پیش رفته‌ای —» می‌افتاد)
    chk(o.some(t => /^💬 تا این‌جا خوب پیش رفته‌ای — بخشِ دومِ شرط را کجا به کار بردی؟$/.test(t)) && !o.some(t => /آفرین/.test(t)), 'head→R15 O1: control — the leading praise «آفرین،» is cut, the head before «—» stays ' + JSON.stringify(o));
  });

  // ================= dedupe — پرسشِ صفحه و بازگفتنش در گفت‌وگو یک گزینه =================
  await section('dedupe', async () => {
    const r = info.dedupe = {}; r.stage = 'mk';
    await day(0);
    const P = await mk({ title: 'ترفیع و مدیر', st: 'مطمئنم مدیرم عمداً جلوی ترفیعم را گرفته؛ دو نفر که دیرتر آمدند ترفیع گرفتند.', nat: 'life' });
    r.stage = 'chat0'; await pageSess(P);
    await next('ایمیل یا مدیرعامل را من جای تو انتخاب نمی‌کنم. پیش از وسیله، خودِ هدف: دقیقاً چه می‌خواهی — اگر این ماجرا «حل» شده بود، از کجا می‌فهمیدی؟');
    await say('فقط بگو ایمیل بزنم یا برم پیش مدیرعامل؟ دو نفر بعد از من اومدن و ترفیع گرفتن.');
    await next('ولی پیش از وسیله، خودِ هدف — کوتاه‌تر: اگر این ماجرا «حل» شده بود، چه داشتی — ترفیع، احترام، یا دانستنِ چراییِ تصمیم؟');
    await say('ترفیع می‌خوام، و بدونم چرا ندادن.');
    r.stage = 'u'; await go('lprob', P);
    await understand({ one: 'می‌خواهم بدانم چرا ترفیع نگرفتم و ترفیع بگیرم', unk: 'ترفیع و دانستنِ دلیلش', data: ['دو همکارِ تازه‌تر ترفیع گرفتند', 'مدیرم با من سرد است'], cond: 'بی ایمیلِ تند', guess: 'مدیرم عمداً جلویش را گرفته', nat: 'life' });
    r.stage = 'plan'; await savePlan('نخست از منابعِ انسانی معیارِ ترفیع را می‌پرسم سپس با مدیرم حرف می‌زنم');
    r.stage = 'step'; await realStep('فردا از منابعِ انسانی معیارِ ترفیع را بپرسم', 'معیار چیزی جز نظرِ مدیر است');
    await day(1); await go('lprob', P, 'exec');
    r.stage = 'out'; await outcome({ what: 'معیار گذراندنِ دورهٔ آموزشی بود و من نگذرانده بودم', match: 'yes' });
    r.stage = 'back'; await click('main .lp-solved');
    const o = await bestOpts(); r.opts = o.map(t => t.slice(0, 90)); delete r.stage;
    chk(o.some(t => /^به مجهول نگاه کن: دقیقاً چه می‌خواهی/.test(t)), 'dedupe setup: the page\'s unknown question is an option ' + JSON.stringify(r.opts));
    chk(!o.some(t => /^💬 .*از کجا می‌فهمیدی؟/.test(t)), 'dedupe: the chat paraphrase «دقیقاً چه می‌خواهی — … از کجا می‌فهمیدی؟» of the page question is not a second option (s05) ' + JSON.stringify(r.opts));
    // DECISIONS_R15 O1: پرسشی که با «اگر» آغاز می‌شود جملهٔ خبریِ پیش از خودش را هم می‌آورد (جای مرجع) — پس گزینه با «پیش از وسیله، خودِ هدف — کوتاه‌تر:» آغاز می‌شود
    chk(o.some(t => /^💬 پیش از وسیله، خودِ هدف — کوتاه‌تر: اگر این ماجرا «حل» شده بود، چه داشتی/.test(t)), 'dedupe: control — a different chat question («… چه داشتی — ترفیع، احترام…؟») keeps its own option ' + JSON.stringify(r.opts));
  });

  // ================= d5 — «دو بچه» ⇄ «دوفرزندی» و دروازهٔ نرمِ «به‌کارنرفته» =================
  await section('d5', async () => {
    const r = info.d5 = {}; r.stage = 'mk';
    await day(0);
    const P = await mk({ title: 'معمای دو بچه', st: 'یه نفر دو بچه داره، حداقل یکیشون پسره. احتمال این‌که هر دو پسر باشن چقدره؟', nat: 'objective' });
    await understand({ one: 'می‌خواهم احتمالِ دو پسر را بیابم', unk: 'احتمالِ این‌که هر دو پسر باشند', data: ['دو بچه', 'حداقل یکی پسر است', 'تولدِ پسر و دختر هم‌احتمال است'], cond: 'دست‌کم یکی پسر است', guess: 'یک دوم', nat: 'objective' });
    r.stage = 'plan'; await addMove();
    await p.fill('#lpPlan', 'نخست همهٔ خانواده‌های دوفرزندی (پپ، پد، دپ، دد) را فهرست می‌کنم، سپس آن‌هایی را که حداقل یک پسر دارند نگه می‌دارم و سهمِ دوپسر را می‌شمارم.'); await W(400);
    const unT = await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.textContent.slice(0, 60)));
    r.un = unT;
    chk(!unT.some(t => /«دو بچه»/.test(t)), 'd5: «دو بچه» is used in «خانواده‌های دوفرزندی» (number + noun, «بچه» ⇄ «فرزند») — not listed as unused (s28) ' + JSON.stringify(unT));
    // دادهٔ دیگری که واژه‌اش در طرح نیامده، بی‌پاسخ ⇒ بار اول هشدار، بار دوم با دلیل ثبت
    r.stage = 'save1'; await click('main .lp-plansave');
    const s1 = await S(P); r.first = { plan: !!(s1.live && s1.live.plan && s1.live.plan.at), soft: await hasEl('#lpPSoftWhy'), miss: (await p.evaluate(() => (document.querySelector('main .lp-planmiss') || {}).textContent || '')).slice(0, 160) };
    if (r.first.soft) await p.fill('#lpPSoftWhy', 'پسر و دختر را در فهرستِ چهار حالت هم‌وزن گرفتم');
    r.stage = 'save2'; await click('main .lp-plansave');
    const s2 = await S(P); const pl = (s2.live && s2.live.plan) || {};
    r.second = { plan: !!pl.at, soft: !!pl.soft, log: ((s2.live && s2.live.softLog) || []).map(x => x.where) }; delete r.stage;
    chk(!r.first.plan && r.first.soft && /تولدِ پسر و دختر/.test(r.first.miss), 'd5: the first save with an unanswered «unused» datum warns once (names it) and offers «ثبت با همین — دلیل» ' + JSON.stringify(r.first));
    chk(r.second.plan && r.second.soft && r.second.log.includes('p'), 'd5: with a one-line reason the plan IS saved and the reason logged (E4: a word-based gate warns, never blocks) ' + JSON.stringify(r.second));
  });

  // ================= only — «فقط جواب» بی تلاشِ دیدنی، کارِ همین نوبت در بلوکِ زنده =================
  await section('only', async () => {
    const r = info.only = {}; r.stage = 'mk';
    await day(0);
    const P = await mk({ title: 'حجمِ چهاروجهی', st: 'حجم چهاروجهی‌ای را پیدا کنید که دو یالِ روبه‌رویش طولِ a دارند، بر هم عمودند و هر دو بر پاره‌خطِ به طولِ b که وسط‌هایشان را وصل می‌کند عمودند.', nat: 'objective' });
    r.stage = 'chat'; await pageSess(P);
    await say('ساعت ۱۱ شبه، فردا ۸ صبح باید تحویل بدم. فقط جواب رو بگو، قول می‌دم بعداً یاد بگیرم.');
    const u1 = keep(await lastUser(), 'only1'); r.q1 = turnQ(u1);
    await pageSess(P);
    await say('فقط جواب رو بگو؛ من تا اینجا قاعده رو مربع به ضلعِ a گرفتم و ارتفاع رو b حساب کردم.');
    const u2 = keep(await lastUser(), 'only2'); r.q2 = turnQ(u2); delete r.stage;
    chk(r.q1 === 'پیش از هر سرنخ: خودت تا کجا رفتی و کجا ماندی؟', 'only: «فقط جواب رو بگو» with no visible attempt on a live problem ⇒ the live block\'s turn question is «پیش از هر سرنخ: خودت تا کجا رفتی و کجا ماندی؟» (s38 p1, J1) ' + JSON.stringify(r));
    chk(r.q2 && !/تا کجا رفتی/.test(r.q2), 'only: control — «فقط جواب» after a visible attempt («تا اینجا … حساب کردم») keeps the list question ' + JSON.stringify(r));
  });

  // ================= ctx — سطرهای خودِ بلوکِ زنده کنارِ پرسشِ نوبت =================
  await section('ctx', async () => {
    const r = info.ctx = {}; r.stage = 'prac';
    await day(0);
    // (۱) مسئلهٔ عملی + ضرب‌المثلِ خودش
    const PP = await mk({ title: 'مخزنِ آب', st: 'می‌خواهم مخزنِ آبِ باران برای باغچه بسازم؛ چند لیتر بس است؟', nat: 'practical' });
    await pageSess(PP);
    await say('به قولِ معروف کار از محکم‌کاری عیب نمی‌کنه؛ می‌خوام مخزن رو بزرگ بگیرم. از کجا شروع کنم؟');
    const u1 = keep(await lastUser(), 'ctx-prac'), b1 = liveOf(u1);
    const prac = b1.split('\n').filter(l => /مسئلهٔ عملی: داده‌ها بی‌شمار/.test(l))[0] || '', prov = b1.split('\n').filter(l => /ضرب‌المثلِ خودش/.test(l))[0] || '';
    r.prac = { tq: turnQ(u1).slice(0, 50), prac: CTX_RE.test(prac) && !/بپرس(?![آ-ی])/.test(prac), prov: CTX_RE.test(prov) && !/بپرس(?![آ-ی])/.test(prov), pracL: prac.slice(0, 60), provL: prov.slice(0, 60) };
    chk(r.prac.tq && r.prac.prac && r.prac.prov, 'ctx: beside the turn question, the live block\'s practical-frame line and his-own-proverb line are «زمینه (نه پرسشِ دوم)» without «بپرس» ' + JSON.stringify(r.prac));
    // (۲) ردِ حدس در همان روز
    r.stage = 'ref';
    const PR = await mk({ title: 'وزن', st: 'می‌خواهم ۸ کیلو کم کنم؛ فکر می‌کنم شامِ دیروقت علت است.', nat: 'life' });
    await understand({ one: 'می‌خواهم ۸ کیلو کم کنم', unk: 'راهِ کم کردنِ ۸ کیلو', data: ['شام ساعتِ ۱۱ می‌خورم', 'هفته‌ای یک بار ورزش'], cond: 'بی رژیمِ سخت', guess: 'شامِ دیروقت علتِ اضافه‌وزن است', nat: 'life' });
    await savePlan('نخست دو هفته شام را ساعتِ ۸ می‌خورم سپس وزن را می‌سنجم');
    await realStep('دو هفته شام را ساعتِ ۸ بخورم', 'یک کیلو کم می‌شود');
    await day(1); await go('lprob', PR, 'exec');
    await outcome({ what: 'وزنم تغییری نکرد', match: 'no', prog: 'نه', grel: 'refute', more: async () => { await fillIf('#lpOReflect', 'شام علت نبود؛ شاید میان‌وعده‌ها علت است'); await selIf('#lpONewG', 'no'); } });
    await pageSess(PR); await say('دیدی؟ شام علت نبود. حالا چی کار کنم؟');
    const u2 = keep(await lastUser(), 'ctx-ref'), b2 = liveOf(u2), refL = b2.split('\n').filter(l => /حدسی که خودش با آزمون رد کرد: «/.test(l))[0] || '';
    r.ref = { tq: turnQ(u2).slice(0, 50), has: !!refL, ctx: CTX_RE.test(refL) && !/بپرس(?![آ-ی])/.test(refL), l: refL.slice(0, 80) };
    chk(r.ref.tq && r.ref.has && r.ref.ctx, 'ctx: the same-day refuted-guess line is «زمینه (نه پرسشِ دوم)» without «بپرس» beside the turn question ' + JSON.stringify(r.ref));
    // (۳) داورِ انتخاب‌نشده: پرسشِ «داور؟» پرسشِ نوبت است و پرسشِ فهرست زمینه
    r.stage = 'kind';
    const PK = await p.evaluate(() => APP.liveCreate('معنا', 'دربارهٔ معنای کارم فکر می‌کنم و به جایی نمی‌رسم.', 'find').p.id);
    await pageSess(PK); await say('ادامه بدیم');
    const u3 = keep(await lastUser(), 'ctx-kind'), b3 = liveOf(u3);
    r.kind = { set: await p.evaluate(pid => APP.liveKindInfo(pid).set, PK), dirs: directives(b3).map(l => l.slice(0, 70)), kindQ: /پیش از هر پرسشِ دیگر بپرس/.test(b3) }; delete r.stage;
    chk(r.kind.set === false && r.kind.kindQ && r.kind.dirs.length === 1, 'ctx: an unset judge ⇒ «پیش از هر پرسشِ دیگر بپرس …» is the ONE question; the list question beside it is context (D4 + one question per block) ' + JSON.stringify(r.kind));
  });

  // ================= one — ساختاری: ≤ ۱ دستورِ پرسشِ بی‌نشان در هر بلوکِ زنده =================
  await section('one', async () => {
    const r = info.one = { n: blocks.length, bad: [] };
    blocks.forEach(x => { const d = directives(x.bl); if (d.length > 1) r.bad.push({ tag: x.tag, d: d.map(l => l.slice(0, 80)) }); });
    chk(r.n >= 5, 'one setup: live blocks were collected from the real turns of this test ' + r.n);
    chk(!r.bad.length, 'one: every live block of every real turn here has at most one unmarked question directive (J1 structural) ' + JSON.stringify(r.bad));
  });

  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 12000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
