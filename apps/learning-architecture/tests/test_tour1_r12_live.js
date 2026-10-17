// تورِ پولیا (دستهٔ ۱، دورِ ۱۲ ِ اصلاح — دورِ «بی‌نقص» ِ چهارم، ۲۰۲۶-۱۰-۱۷) — سویِ «live» ِ DECISIONS_R12 (L2 بخشِ زنده، L4، L5) روی رابطِ واقعی.
//  incub   L4: پیامی که خودش ایدهٔ رسیده را گزارش می‌کند («… یه ایده برای پلان به ذهنم رسید: …») ⇒ کارتِ «😴 … چه چیزی به ذهنت رسید؟» پرسشِ نوبت نیست —
//          نه در بلوکِ زندهٔ صفحه، نه در پیشنهادِ «مسئلهٔ بازِ تو» بیرون از صفحه (s34 p6)؛ پیامِ بی ایده ⇒ همان کارت (کنترل)
//  whole   L4: تا کارتِ «اول کل، بعد جزءها» باز است، پرسشِ صفحه (pageQ) همان کارت است و «هم‌گام با صفحه» هرگز «مجهول … چیست؟» نیست (s21…s29)؛
//          پس از «ثبتِ کل» پرسشِ صفحه پرسشِ نخستِ جزءهاست (کنترل)
//  chat    L5: «کدام پرسش کمک کرد؟» فقط از پیام‌های دستیار دربارهٔ همین مسئله — پرسشِ باغچه در همان سشن، پیش از ساختنِ مسئلهٔ حوض، نه (s29 c23)؛
//          پرسشِ پیش از ساخت که نوبتش از همین مسئله می‌گفت، و پرسشِ پاسخِ سازنده، می‌مانند (کنترل)
//  multi   L5: پرسشِ نوبتِ چندجمله‌ایِ صفحه («حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟») یک گزینه است — با پیش‌درآمد،
//          بی سرِ «حدسی گفتی —»، و در #lpBBest (s02 c18، s11 c33/c37، s01 c39)
//  strict  L2: بلوکِ زندهٔ خامِ a38 (پیش از پالایهٔ مربی) و بلوکِ نهاییِ پرامپت: هر سطری که «؟» یا «بپرس» دارد یا سطرِ پرسشِ نوبت است یا «زمینه (نه پرسشِ دوم)»؛
//          قابِ مسئلهٔ عینی پرسشِ «روشن می‌بینی…؟ می‌توانی ثابت کنی؟» را بی‌نشان نمی‌آورد؛ سطرِ کتاب («به تعریف‌ها برگرد»، …) زمینه است؛
//          سطرِ «# امروز» ِ a26 («… یک بار بپرس») هم زمینه است
// همه از رابطِ واقعی (پنجرهٔ دستیار با مدلِ بدل، فرم‌های «🔭»)؛ خطا ⇒ کدِ خروجِ غیرصفر. LLA_FILE = ساختِ دیگر (خطِ قرمز: ساختِ 53d0fc6)؛ ONLY=whole,multi.
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
  // روزِ صفحه همان روزِ واقعیِ ساعت (r.created با ساعتِ واقعی است) — وگرنه «میانهٔ راه» ِ مسئلهٔ تازه‌ساخته به‌خطا سررسیده می‌شود
  const NOW = new Date(); const D = (n) => { const d = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const day = async (n) => { await p.evaluate(x => { window.__day = x; }, D(n)); };
  const T0 = D(0);
  await p.goto(FILE); await p.waitForSelector('.nav'); await W(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0; window.__raw = [];
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); const r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    // بلوکِ خامِ بخشِ مسئله (خروجیِ قلابِ a38 پیش از هر پالایه) — نخستین پالایه فقط رونوشت برمی‌دارد و چیزی را عوض نمی‌کند
    APP.ASSIST.promptFilters = APP.ASSIST.promptFilters || [];
    APP.ASSIST.promptFilters.unshift(function (outs) { const x = outs.filter(o => /^# مسئلهٔ زندهٔ این سشن \(/.test(o))[0]; window.__raw.push(x || ''); return outs; });
  }, T0);
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await W(140); };
  const sel = async (s, v) => { await p.selectOption(s, v); await W(120); };
  const click = async (s) => { await p.click(s); await W(160); };
  const hasEl = (s) => p.locator(s).count();
  const fillIf = async (s, v) => { if (await hasEl(s)) await p.fill(s, v); };
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
    await p.evaluate(() => APP.ASSIST.toggle(false)); await W(60);
  };
  const lastUser = () => p.evaluate(() => (__calls[__calls.length - 1] || {}).user || '');
  const lastRaw = () => p.evaluate(() => __raw[__raw.length - 1] || '');
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const liveOf = (u) => block(u, '# مسئلهٔ زندهٔ این سشن');
  const next = (reply) => p.evaluate(reply => __q.push(R({ reply })), reply);
  const CTX_RE = /^- زمینه \(نه پرسشِ دوم\)/;
  const turnQ = (u) => { const bl = liveOf(u); const m = /نپرس\): «(.*)»\. اگر/.exec(bl) || /پرسشِ پیشنهادیِ این نوبت: «(.*)»\. اگر/.exec(bl) || /صفحه همین حالا می‌پرسد[^«]*«(.*)»\. اگر/.exec(bl); return m ? m[1] : ''; };
  const mk = async (o) => { await go('e_prob', null, 'live'); await p.fill('#lpNewT', o.title); await p.fill('#lpNewS', o.st); await W(60); if (o.kind) await sel('#lpNewType', o.kind); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return p.evaluate(() => APP.state.arg); };
  const understand = async (o) => {
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
    await click('main .lp-usave'); if (await hasEl('main .lp-u .sv-g2')) await click('main .lp-u .sv-g2');
  };
  const addMove = async () => { await p.selectOption('#lpMv', 'mv_special').catch(() => {}); await fillIf('#lpMvWhy', 'اول فقط یک حالت را دقیق می‌بینم تا دامنه تنگ شود'); if (await hasEl('main .lp-mvadd')) await click('main .lp-mvadd'); };
  const answerUnused = async () => { for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); } };
  const savePlan = async (plan, plan2) => { await addMove(); await p.fill('#lpPlan', plan); if (plan2) await p.fill('#lpPlan2', plan2); await W(350); await answerUnused(); await click('main .lp-plansave'); if (await hasEl('#lpPSoftWhy')) { await p.fill('#lpPSoftWhy', 'به نامِ دیگری در طرح آمده است'); await click('main .lp-plansave'); } };
  const objStep = async (text, proof) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); await fillIf('#lpProof', proof); await click('main .lp-stepsave'); };
  const pageSess = async (pid) => { await go('lprob', pid); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; }); };
  const homeSess = async () => { await go('home'); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; }); };
  const bestOpts = () => p.evaluate(() => [...document.querySelectorAll('#lpBBest option')].map(o => o.textContent));
  const Q_GUESST = 'حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟';
  const INCUB = /کنارش گذاشتی — چه چیزی به ذهنت رسید/;

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  // ================= incub — L4: ایدهٔ گزارش‌شده پاسخِ کارتِ «😴» است (s34 p6). نخستین بخش: «مسئلهٔ بازِ تو» فقط با یک مسئلهٔ باز می‌آید =================
  await section('incub', async () => {
    const r = info.incub = {}; r.stage = 'mk';
    await day(0);
    const P = await mk({ title: 'پلانِ خانهٔ ویلایی', st: 'باید پلانِ یک خانهٔ ویلایی را برای مسابقهٔ معماری طراحی کنم و هنوز ایده‌ای برای حیاط و ورودی ندارم.', nat: 'life' });
    await understand({ one: 'می‌خواهم پلانِ خانهٔ ویلایی را برای مسابقه بکشم', unk: 'پلانِ خانه', data: ['زمین ۳۰۰ متر است', 'دو خیابان دورِ زمین است'], cond: 'تا آخرِ ماه تحویل شود', nat: 'life' });
    // پیش‌شرط (نه مسیرِ زیرِ آزمون): «کنار بگذار تا فردا» دو روز پیش — کارتِ «😴» امروز سررسیده است
    await p.evaluate(([pid, d0, d1]) => { const pg = APP.S.get('eprog_' + pid); pg.solve.live.incub = { at: new Date().toISOString(), d: d0, due: d1, ph: 'p' }; APP.S.put(pg); }, [P, D(0), D(1)]);
    await day(2);
    const IDEA = 'دیروز تو مترو یهو یه ایده برای پلان به ذهنم رسید: حیاط رو کنار خیابون فرعی بذارم که ورودی آروم‌تر باشه.';
    r.stage = 'page-ctl'; await pageSess(P); await say('سلام، برگشتم سراغِ پلان.'); r.ctl = turnQ(await lastUser());
    chk(INCUB.test(r.ctl), 'incub: control — a message with no idea, on the page: the due «😴» card is the turn question ' + JSON.stringify(r.ctl));
    r.stage = 'page-idea'; await pageSess(P); await say(IDEA); const u1 = await lastUser(); r.idea = turnQ(u1);
    r.coachIdea = await p.evaluate(([pid, t]) => (APP.liveCoach(pid, { turn: { text: t } }) || {}).q, [P, IDEA]);
    chk(!INCUB.test(r.idea) && !INCUB.test(r.coachIdea || ''), 'incub: the message already reports the idea ⇒ the «😴 … چه چیزی به ذهنت رسید؟» card is NOT the turn question (L4, s34 p6) ' + JSON.stringify({ q: r.idea, coach: r.coachIdea }));
    r.cardStays = await p.evaluate(pid => (APP.liveCoach(pid) || {}).card || '', P);
    chk(INCUB.test(r.cardStays), 'incub: the card itself stays on the page (to record the idea) ' + JSON.stringify(r.cardStays));
    // بیرون از صفحه، سشنِ نابسته و تنها مسئلهٔ باز ⇒ «# مسئلهٔ بازِ تو» (s34 p6 دقیقاً همین مسیر بود)
    // سطرهای پرسشِ نوبت در کلِ پرامپت (بلوکِ «مسئلهٔ بازِ تو» یا لحظهٔ «openOn» ِ مربی — هر کدام که پرسشِ نوبت را حمل می‌کند)
    const turnLines = (u) => u.split('\n').filter(l => /پرسشِ این نوبت همین است|فقط \*\*یک\*\* پرسش/.test(l) && !/^- زمینه/.test(l));
    r.stage = 'off-ctl'; await homeSess(); await say('دربارهٔ پلانِ خانهٔ ویلایی هنوز کاری نکردم، حوصله نداشتم.'); const u0 = await lastUser();
    r.offCtl = turnLines(u0).map(l => l.slice(0, 200)); r.offBlk = !!block(u0, '# مسئلهٔ بازِ تو');
    chk(r.offBlk && r.offCtl.some(l => INCUB.test(l)), 'incub: control — off the page, a message about the only open problem with no idea: the «😴» card is the turn question ' + JSON.stringify(r.offCtl));
    r.stage = 'off-idea'; await homeSess(); await say('دیروز تو مترو یهو یه ایده برای پلانِ خانهٔ ویلایی به ذهنم رسید: حیاط رو کنار خیابون فرعی بذارم.'); const u1b = await lastUser();
    r.offIdea = turnLines(u1b).map(l => l.slice(0, 200)); r.offBlk2 = !!block(u1b, '# مسئلهٔ بازِ تو');
    chk(r.offBlk2 && !r.offIdea.some(l => INCUB.test(l)), 'incub: off the page, the message reports the idea ⇒ «😴 … چه چیزی به ذهنت رسید؟» is not the turn question (L4, s34 p6) ' + JSON.stringify(r.offIdea));
    delete r.stage;
  });

  // ================= whole — L4: کارتِ «اول کل، بعد جزءها» همان پرسشِ صفحه است (s21…s29) =================
  await section('whole', async () => {
    const r = info.whole = {}; r.cases = {};
    await day(0);
    for (const [tag, o] of [['obj', { title: 'موتور و قطار', st: 'یک موتورسوار و یک قطار هم‌زمان از دو شهر به سوی هم راه می‌افتند؛ فاصله ۱۲۰ کیلومتر است. کجا به هم می‌رسند؟', nat: 'objective' }],
      ['life', { title: 'معنای موفقیت', st: 'نمی‌دانم موفقیت در کارم یعنی چه؛ هر بار یک چیز را می‌سنجم و راضی نیستم.', nat: 'life' }]]) {
      const c = r.cases[tag] = {}; r.stage = tag;
      const P = await mk(o); await pageSess(P);
      c.card = await p.evaluate(() => { const b = document.querySelector('main .lp-u'); return b ? !!b.querySelector('.lp-onesave') && !document.querySelector('#lpUnk') : false; });
      await say('سلام، از کجا شروع کنم؟'); const u = await lastUser(); const bl = liveOf(u);
      c.pageQ = await p.evaluate(pid => (APP.liveCoach(pid) || {}).pageQ, P); c.q = turnQ(u);
      c.same = (/هم‌گام با صفحه[^\n]*/.exec(bl) || [''])[0].slice(0, 220);
      chk(c.card, 'whole (' + tag + ') setup: right after creation the page shows only the «اول کل، بعد جزءها» card ' + JSON.stringify(c));
      chk(/اول کل/.test(c.pageQ || '') && /کلِ مسئله/.test(c.pageQ || ''), 'whole (' + tag + '): while the whole-first card is open, the page question IS that card, not «مجهول … چیست؟» (L4) ' + JSON.stringify(c));
      chk(!/مجهول|چه چیزی را باید بیابی|خواسته/.test(c.same) && (!c.same || /کلِ مسئله/.test(c.same)), 'whole (' + tag + '): the live block never claims «هم‌گام با صفحه» for a parts question the page does not show (L4, s21 p5…s29 p6) ' + JSON.stringify(c.same));
      chk(/کلِ مسئله/.test(c.q), 'whole (' + tag + '): the turn question is the whole-first question (the page asks it now; Pólya A191) ' + JSON.stringify(c.q));
      r.stage = tag + '-ctl';
      await p.fill('#lpOne', tag === 'obj' ? 'می‌خواهم جای دیدارِ موتور و قطار را بیابم' : 'می‌خواهم بفهمم موفقیت در کارم برایم چیست'); await p.fill('#lpWhy', 'برایم مهم است'); await click('main .lp-onesave');
      c.pageQ2 = await p.evaluate(pid => (APP.liveCoach(pid) || {}).pageQ, P);
      chk(!!c.pageQ2 && !/اول کل/.test(c.pageQ2), 'whole (' + tag + '): control — after «ثبتِ کل» the page question is the first parts question ' + JSON.stringify(c.pageQ2));
    }
    delete r.stage;
  });

  // ================= chat — L5: فقط پیام‌های همین مسئله (s29 c23) =================
  await section('chat', async () => {
    const r = info.chat = {}; r.stage = 'garden';
    await day(0); await homeSess();
    await next('این حدس را چطور می‌آزمایی که گلدان‌ها از کم‌آبی زرد شده‌اند؟');
    await say('گلدون‌های باغچه زرد شدن، فکر کنم کم‌آبی باشه.');
    // DECISIONS_R14 N1: موضوعِ پیشین مرز دارد — در s29 باغچه خودش مسئلهٔ ثبت‌شدهٔ همین سشن بود (این‌جا: حل و ثبت در گفت‌وگو، chat_solved)
    r.stage = 'garden-solved';
    await p.evaluate(() => __q.push(R({ reply: 'بازنگری‌ات را ثبت کردم.', actions: [{ do: 'chat_solved', title: 'زرد شدنِ گلدان‌های باغچه', statement: 'گلدان‌های باغچه زرد شده‌اند؛ علتش کم‌آبی است یا چیزِ دیگری؟', kind: 'find', lesson: 'اول ساده‌ترین علت را بیازما', check: 'یک هفته آبِ روزانه و گلدان‌ها سبز شدند' }] })));
    await say('یه هفته هر روز آب دادم سبز شدن؛ درسم: اول ساده‌ترین علت رو بیازما.');
    r.stage = 'pre'; await next('عمقِ حوضِ حیاط را از کجا می‌دانی؟');
    await say('یه حوضِ حیاط دارم که آبش هر هفته کم میشه و نمی‌دونم نشتی داره یا تبخیره.');
    r.stage = 'create';
    await p.evaluate(() => __q.push(R({ reply: 'ثبتش کردم. نشتی یا تبخیر — مجهول دقیقاً چیست؟', actions: [{ do: 'live_new', title: 'آبِ حوضِ حیاط', statement: 'یه حوضِ حیاط دارم که آبش هر هفته کم میشه و نمی‌دونم نشتی داره یا تبخیره.', nat: 'practical' }] })));
    await say('آره، می‌خوام حلش کنم.');
    const P = await p.evaluate(() => APP.liveSessionPid(APP.ASSIST.cur()));
    r.stage = 'after'; await next('در یک هفتهٔ بی‌باران، سطحِ آب چند سانت پایین می‌رود؟'); await say('هر هفته حدودِ سه سانت.');
    r.qs = P ? await p.evaluate(pid => APP.liveChatQs(pid), P) : [];
    delete r.stage;
    chk(!!P, 'chat setup: the pond problem was created in the same session (live_new) ' + JSON.stringify(P));
    chk(!r.qs.some(t => /گلدان/.test(t)), 'chat: the garden question asked in the same session BEFORE the pond problem existed is not offered for the pond (L5, s29 c23) ' + JSON.stringify(r.qs));
    chk(r.qs.some(t => /سطحِ آب چند سانت/.test(t)), 'chat: control — a question about this problem after it was created is offered ' + JSON.stringify(r.qs));
    chk(r.qs.some(t => /مجهول/.test(t)), 'chat: control — the creating reply\'s own question is about this problem and is offered ' + JSON.stringify(r.qs));
    // DECISIONS_R14 N1 (یک قاعده با مرز): پنجره از پیامِ رفتن از موضوعِ پیشین (نخستین پیامِ کاربر پس از باغچه که حوض را نام می‌برد) — نوبتِ پیش از ساختِ حوض مالِ حوض است
    chk(r.qs.some(t => /عمقِ حوضِ حیاط/.test(t)), 'chat: a pre-creation turn after the switch message that names the pond keeps its question (R14 N1, restores the R12 control that R13 M1 had inverted) ' + JSON.stringify(r.qs));
  });

  // ================= multi — L5: پرسشِ نوبتِ چندجمله‌ای یک گزینه است (s02، s11، s01) =================
  await section('multi', async () => {
    const r = info.multi = {}; r.stage = 'mk';
    await day(0);
    const P = await mk({ title: 'ضلع‌های مثلثِ سوم', st: 'محیطِ مثلثی ۳۶ است؛ a دو برابرِ b و c سه واحد بیشتر از b است. ضلع‌ها چقدرند؟', nat: 'objective' });
    r.stage = 'chat'; await pageSess(P);
    await next('«b حدودِ هشت است» را درست یا غلط نمی‌خوانم؛ ' + Q_GUESST);
    await say('فکر کنم b حدودِ هشت باشه.');
    await next('خوب. چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟');
    await say('b رو هشت می‌ذارم و محیط رو حساب می‌کنم.');
    await next(Q_GUESST);
    await say('حساب کردم، ۳۵ شد نه ۳۶.');
    r.qs = await p.evaluate(pid => APP.liveChatQs(pid), P);
    chk(r.qs.filter(t => t === Q_GUESST).length === 1, 'multi: the page\'s two-sentence turn question echoed by the assistant (with a preamble, without its «حدسی گفتی —» head, or verbatim) is ONE option, the whole question (L5, s02/s11/s01) ' + JSON.stringify(r.qs));
    chk(!r.qs.some(t => /^کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟$/.test(t) || /^چطور می‌آزمایی‌اش؟$/.test(t)), 'multi: never the two referent-less halves «چطور می‌آزمایی‌اش؟» / «کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟» (s02 c18, s11 c33/c37) ' + JSON.stringify(r.qs));
    chk(!r.qs.some(t => /درست یا غلط نمی‌خوانم/.test(t)), 'multi: the non-question preamble «… را درست یا غلط نمی‌خوانم؛» is not part of the option (s01 c39) ' + JSON.stringify(r.qs));
    r.stage = 'back'; await go('lprob', P);
    await understand({ one: 'می‌خواهم سه ضلع را بیابم', unk: 'a و b و c', data: ['محیط ۳۶ است', 'a دو برابرِ b است'], cond: 'a + b + c = 36', guess: 'b حدودِ هشت است', nat: 'objective' });
    await savePlan('نخست هر ضلع را برحسبِ b می‌نویسم سپس در محیط جای‌گذاری می‌کنم');
    await go('lprob', P, 'exec'); await objStep('a = 2b و c = b + 3 پس 4b + 3 = 36 و b = 8.25', 'از داده‌ها و جای‌گذاری در محیط');
    await click('main .lp-solved');
    const o = await bestOpts(); r.opts = o.map(t => t.slice(0, 90)); delete r.stage;
    chk(o.filter(t => t === '💬 ' + Q_GUESST).length === 1 && !o.some(t => /^💬 (?:کدام حالتِ خاص یا شاهد|چطور می‌آزمایی‌اش؟$)/.test(t)), 'multi: «کدام پرسش کمک کرد؟» (#lpBBest) offers it once, whole (L5) ' + JSON.stringify(r.opts));
  });

  // ================= strict — L2 (سویِ زنده): هر سطرِ پرسش‌دارِ بلوکِ زنده یا سطرِ نوبت است یا زمینه =================
  await section('strict', async () => {
    const r = info.strict = {}; r.stage = 'exec'; const raws = [], finals = [];
    await day(0);
    const keep = async (tag) => { raws.push({ tag, bl: await lastRaw() }); finals.push({ tag, bl: liveOf(await lastUser()) }); };
    // (۱) اجرای مسئلهٔ عینی — قابِ «پاسخِ عینی»، بخش‌های شرطِ به‌کارنرفته، سطرِ کتاب
    const PO = await mk({ title: 'ضلع‌های مثلثِ چهارم', st: 'محیطِ مثلثی ۴۲ است؛ a دو برابرِ b و c شش واحد بیشتر از b است. ضلع‌ها چقدرند؟', nat: 'objective' });
    await understand({ one: 'می‌خواهم سه ضلع را بیابم', unk: 'a و b و c', data: ['محیط ۴۲ است', 'a دو برابرِ b است'], cond: 'a + b + c = 42', nat: 'objective' });
    await savePlan('نخست هر ضلع را برحسبِ b می‌نویسم سپس در محیط جای‌گذاری می‌کنم');
    await go('lprob', PO, 'exec'); await pageSess(PO); await say('گامِ اول را می‌نویسم؛ a را برحسبِ b گذاشتم.'); await keep('exec-obj');
    // (۲) طرح‌ریزی (کتاب: پارادوکسِ مخترع، «به تعریف‌ها برگرد») + ضرب‌المثلِ خودش + گیر
    r.stage = 'plan';
    const PP = await mk({ title: 'برنامهٔ هفتگی', st: 'هر هفته برنامه می‌ریزم و اجرا نمی‌کنم؛ نمی‌دانم برنامهٔ خوب یعنی چه.', nat: 'life' });
    await understand({ one: 'می‌خواهم برنامه‌ای بسازم که اجرایش کنم', unk: 'برنامهٔ هفتگیِ اجراشدنی', data: ['هر هفته برنامه می‌ریزم', 'اجرا نمی‌کنم'], cond: 'دست‌کم سه هفته پیاپی اجرا شود', nat: 'life' });
    await pageSess(PP); await say('به قولِ معروف کار از محکم‌کاری عیب نمی‌کنه؛ گیر کردم، نمی‌دونم از کجا طرح بریزم.'); await keep('plan-life');
    // (۳) فهم، تازه ساخته (کارتِ «اول کل»)
    r.stage = 'u';
    const PU = await mk({ title: 'دو شیر', st: 'دو شیرِ آب یک مخزن را به‌ترتیب در ۳ و ۶ ساعت پر می‌کنند. با هم چقدر طول می‌کشد؟', nat: 'objective' });
    await pageSess(PU); await say('سلام، این مسئله رو دارم.'); await keep('u-obj');
    delete r.stage;
    const TURN_L = /^- در این نوبت فقط \*\*یک\*\* پرسش|^- همهٔ پرسش‌های این مرحله|^- داورِ این مسئله هنوز انتخاب نشده: پیش از هر پرسشِ دیگر بپرس/;
    // سطرهایی که پالایهٔ مربی (a27) همیشه برمی‌دارد یا جایگزین می‌کند — در بلوکِ نهایی وارسی می‌شوند که نمانده‌اند/جایگزین شده‌اند
    const A27_DROP = /^- حکمتِ ضرب‌المثل‌ها برای همین مرحله/;
    const COACH_L = /^- داده‌هایی که هنوز در طرح\/گام‌ها به کار نرفته|^- حدسی که خودش با آزمون رد کرد: [۰-۹0-9]|^- (?:این مسئله پاسخِ عینی دارد \(ریاضی، برهان|پاسخِ این مسئله را هیچ‌کس از پیش|اگر پاسخِ عینی دارد)/;
    const asks = (l) => /[؟?]/.test(l) || /بپرس(?:د)?(?![آ-ی])/.test(l);
    const strays = (bl, final) => bl.split('\n').filter(l => /^- /.test(l) && !CTX_RE.test(l) && !TURN_L.test(l) && !/^- پرسش‌های همین مرحله/.test(l) && !(final ? COACH_L.test(l) : A27_DROP.test(l)) && asks(l));
    r.tags = raws.filter(x => x.bl).map(x => x.tag);
    chk(['exec-obj', 'plan-life', 'u-obj'].every(t => r.tags.includes(t)), 'strict setup: the a38 live block was produced on every real turn ' + JSON.stringify(r.tags));
    r.bad = raws.map(x => ({ tag: x.tag, d: strays(x.bl, false).map(l => l.slice(0, 120)) })).filter(x => x.d.length);
    chk(!r.bad.length, 'strict: in the raw a38 live block, every line carrying a question («؟») or «بپرس» is the turn line, the reference list, or «زمینه (نه پرسشِ دوم)» — incl. the objective frame «روشن می‌بینی… ثابت کنی؟» (L2, s11 p3/p4) ' + JSON.stringify(r.bad));
    r.badF = finals.map(x => ({ tag: x.tag, d: strays(x.bl, true).map(l => l.slice(0, 120)) })).filter(x => x.d.length);
    chk(!r.badF.length, 'strict: same rule on the final prompt\'s live block (lines a27 adds are the coach\'s and skipped) ' + JSON.stringify(r.badF));
    const rawObj = (raws.find(x => x.tag === 'exec-obj') || {}).bl || '';
    r.frame = (/^- [^\n]*این مسئله پاسخِ عینی دارد[^\n]*/m.exec(rawObj) || [''])[0].slice(0, 220);
    chk(!!r.frame && !/[؟?]/.test(r.frame), 'strict: a38\'s objective frame line carries no unmarked question (L2, a38 ~3014) ' + JSON.stringify(r.frame));
    r.book = raws.map(x => (/^- [^\n]*از کتاب برای همین مرحله[^\n]*/m.exec(x.bl) || [''])[0]).filter(Boolean).map(l => l.slice(0, 90));
    chk(r.book.length >= 1 && r.book.every(l => CTX_RE.test(l)), 'strict: the book line («پارادوکسِ مخترع · به تعریف‌ها برگرد …») is «زمینه (نه پرسشِ دوم)», a candidate, not a directive beside the turn question (L2) ' + JSON.stringify(r.book));
    // a26 (سویِ زنده): بلوکِ «# امروز» ِ پرامپت دستورِ پرسشِ دوم ندارد (L2 — کلِ پرامپت)
    r.today = (block(await lastUser(), '# امروز').split('\n')[1] || '').slice(0, 200);
    chk(!!r.today && !/بپرس(?![آ-ی])/.test(r.today), 'strict: the a26 «# امروز» line has no unmarked «بپرس» — the date check is a candidate for the turn question, not a second one (L2, whole prompt) ' + JSON.stringify(r.today));
    chk(finals.every(x => !x.bl.split('\n').some(l => A27_DROP.test(l))), 'strict: the a38 stage-proverb line never reaches the final prompt (the coach filters it) ' + JSON.stringify(finals.map(x => x.tag)));
  });

  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 14000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
