// تورِ پولیا (دستهٔ ۱، دورِ ۱۱ ِ اصلاح — دورِ «بی‌نقص» ِ دوم، ۲۰۲۶-۱۰-۱۶) — سویِ «live» ِ DECISIONS_R11 (K1 بلوکِ زنده، K3 a38، K4، K6) روی رابطِ واقعی.
// اصل: هر سطرِ دستوریِ بلوکِ زنده یا همان پرسشِ نوبت است یا «زمینه (نه پرسشِ دوم)» بی «بپرس»؛ «فقط جواب» ِ بی‌تلاش در هر شکلش لحظهٔ A073 است؛
// «کدام پرسش کمک کرد؟» پرسشِ دوم‌شخصِ مربی را می‌شناسد و به پرسشِ پولیا نگاشت می‌کند و جملهٔ معترضه مرجعِ پرسش را نمی‌بُرد؛ هشدارِ حدسی فقط بالای فهرستِ خودش.
//  only    K3: «فقط بگو X یا Y؟»، «زود بگو»، «یه راه‌حل بده» بی تلاش ⇒ پرسشِ نوبتِ بلوکِ زنده «پیش از هر سرنخ: خودت تا کجا رفتی و کجا ماندی؟» (s01، s02، s04، s05)؛
//          با تلاش، یا «برم یا بمونم؟» ِ بی «فقط بگو» ⇒ نه
//  qword   K4: پرسشِ A191 «کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟» در «کدام پرسش کمک کرد؟» می‌آید و به پرسشِ u5 ِ همان فهرست («… مسئله را به زبانِ
//          خودت دوباره بگو») نگاشت می‌شود (s21، s23، s24، s28)؛ پرسشِ دوم‌شخصِ دیگر («… می‌نویسی؟») خودش می‌آید
//  paren   K4: «… مهدکودک — که با دلیل کنار گذاشته بودی — هنوز بی‌ربط است؟» کامل می‌ماند، نه «هنوز بی‌ربط است؟» ِ بی‌مرجع (s01 p9)
//  ctx     K1: در بلوکِ زندهٔ نوبت‌های واقعی (سشنِ بسته، گیر با دادهٔ به‌کارنرفته، نردبانِ تمام‌شدهٔ مسئلهٔ عملی، ضرب‌المثلِ خودش، شرطِ متناقض) هیچ سطری جز سطرِ پرسشِ
//          نوبت «بپرس» ندارد یا به «؟» ختم نمی‌شود، مگر «زمینه (نه پرسشِ دوم)» باشد
//  soft    K6: ثبتِ طرح با موردِ سخت («طرحِ دوم») و هشدارِ حدسی (دادهٔ به‌کارنرفته): «هنوز نه» فقط سخت‌ها؛ متنِ «حدس زده شده … دلیل بنویس» با فهرستِ هشدارها و
//          فیلدِ دلیل در یک کارت؛ دلیل از هشدار می‌گذرد و سخت همچنان سد می‌کند (s22، s26، پروبِ p26)؛ کارتِ فهم هم همین (فهرست کنارِ فیلدِ دلیل)
// همه از رابطِ واقعی (پنجرهٔ دستیار با مدلِ بدل، فرم‌های «🔭»)؛ خطا ⇒ کدِ خروجِ غیرصفر. LLA_FILE = ساختِ دیگر (خطِ قرمز: ساختِ 9aa88c9)؛ ONLY=only,soft.
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
  const txt = (s) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent : ''; }, s);
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
  // K1 (ساختاری، سطرهای a38): سطرِ پرسشِ نوبت = «فقط **یک** پرسش» (یا جایگزینِ مربی «همهٔ پرسش‌های این مرحله…»)، یا «داورِ این مسئله هنوز انتخاب نشده: پیش از هر پرسشِ دیگر بپرس»
  // (D4)؛ فهرستِ «پرسش‌های همین مرحله» مرجع است. سطرهایی که خودِ مربی (a27) به بلوک می‌افزاید (دادهٔ «در طرح/گام‌ها به کار نرفته»، شمارِ حدس‌های ردشده) سویِ «coach» اند.
  const TURN_L = /^- در این نوبت فقط \*\*یک\*\* پرسش|^- همهٔ پرسش‌های این مرحله|^- داورِ این مسئله هنوز انتخاب نشده: پیش از هر پرسشِ دیگر بپرس/;
  const COACH_L = /^- داده‌هایی که هنوز در طرح\/گام‌ها به کار نرفته|^- حدسی که خودش با آزمون رد کرد: [۰-۹0-9]/;
  const strays = (bl) => bl.split('\n').filter(l => /^- /.test(l) && !CTX_RE.test(l) && !TURN_L.test(l) && !/^- پرسش‌های همین مرحله/.test(l) && !COACH_L.test(l)
    && (/بپرس(?![آ-ی])/.test(l) || /[؟?]\s*$/.test(l)));
  const blocks = [];
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
    if (o.prac) { for (let i = 0; i < o.data.length; i++) await sel('#lpDE_d' + (i + 1), 'big'); await p.fill('#lpPrVague', '«بس» یعنی همان چیزی که لازم است'); await p.fill('#lpPrLine', o.prLine || 'رنگ و برند را بیرون می‌گذارم چون اثری ندارند'); await p.fill('#lpPrApprox', 'دقتِ ده درصد بس است'); await p.fill('#lpPrPrior', 'پارسال همین کار را کردم'); await p.fill('#lpPrMeasure', o.measure || 'حجمِ لازم ≤ ۲۰۰ لیتر'); await W(80); }
    await p.fill('#lpGuess', o.guess || 'راهی هست'); await sel('#lpConf', '60'); await p.fill('#lpTest', 'با یک حالتِ خاص می‌آزمایم');
    await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
    if (beforeSave) await beforeSave();
    await click('main .lp-usave'); if (o.expectMiss) return; if (await hasEl('main .lp-u .sv-g2')) await click('main .lp-u .sv-g2');
  };
  const addMove = async () => { await p.selectOption('#lpMv', 'mv_special').catch(() => {}); await fillIf('#lpMvWhy', 'اول فقط یک حالت را دقیق می‌بینم تا دامنه تنگ شود'); if (await hasEl('main .lp-mvadd')) await click('main .lp-mvadd'); };
  const answerUnused = async () => { for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); } };
  const savePlan = async (plan, plan2) => { await addMove(); await p.fill('#lpPlan', plan); if (plan2) await p.fill('#lpPlan2', plan2); await W(350); await answerUnused(); await click('main .lp-plansave'); };
  const objStep = async (text, proof) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); await fillIf('#lpProof', proof); await click('main .lp-stepsave'); };
  const pageSess = async (pid) => { await go('lprob', pid); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; }); };
  const bestOpts = () => p.evaluate(() => [...document.querySelectorAll('#lpBBest option')].map(o => o.textContent));
  const Q_ONLY = 'پیش از هر سرنخ: خودت تا کجا رفتی و کجا ماندی؟';

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  // ================= only — خانوادهٔ «فقط جواب» (K3، سویِ a38) =================
  await section('only', async () => {
    const r = info.only = {}; r.stage = 'mk';
    await day(0);
    const cases = [
      ['s05', { title: 'ترفیع و مدیر', st: 'مطمئنم مدیرم عمداً جلوی ترفیعم را گرفته؛ دو نفر که دیرتر آمدند ترفیع گرفتند.', nat: 'life' }, 'دو نفر بعد از من اومدن و ترفیع گرفتن، مدیرم هم باهام سرده. صد در صد کار خودشه. فقط بگو ایمیل یا مدیرعامل؟', true],
      ['s02', { title: 'لوله و وانت', st: 'یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟', nat: 'practical' }, 'جا میشه یا نه؟ زود بگو مشتری منتظره.', true],
      ['s04', { title: 'خانهٔ پدری', st: 'چهار خواهر و برادریم؛ خانهٔ پدری را کسی نمی‌خواهد بفروشد و هر کدام سهمِ برابر می‌خواهیم.', nat: 'life' }, 'خواهرم می‌خواد توش زندگی کنه، برادرم پول نقد می‌خواد همین امسال. یه راه‌حل بده که همه راضی باشن.', true],
      ['s01', { title: 'خرید یا اجاره', st: 'سه ماهه اکسل پر می‌کنم که خونه بخرم یا اجاره‌نشین بمونم؛ ۴۷ ستون دارم و تصمیم نمی‌گیرم.', nat: 'life' }, 'هر روز یه ستون اضافه می‌کنم و هیچ تصمیمی نمی‌گیرم. فقط بگو بخرم یا نه؟', true],
      ['attempt', { title: 'لوله و وانتِ دوم', st: 'لولهٔ ۴ متری در بارِ ۳.۲ در ۱.۸ در ۱.۶ جا می‌شود؟', nat: 'practical' }, 'قطرِ کف رو حساب کردم شد حدودِ ۳.۷. فقط بگو جا میشه یا نه؟', false],
      ['noonly', { title: 'ماندن یا رفتن', st: 'پیشنهادِ کار در شهرِ دیگری دارم و نمی‌دانم بروم یا بمانم.', nat: 'life' }, 'برم یا بمونم؟ هنوز نمی‌دونم از کجا شروع کنم.', false]];
    r.q = {};
    for (const [tag, o, msg, want] of cases) {
      r.stage = tag; const P = await mk(o); await pageSess(P); await say(msg);
      const u = keep(await lastUser(), 'only-' + tag); r.q[tag] = turnQ(u);
      chk(want ? r.q[tag] === Q_ONLY : r.q[tag] !== Q_ONLY, 'only (' + tag + '): ' + (want ? '«فقط جواب» family with no visible attempt («فقط بگو X یا Y؟»، «زود بگو»، «یه راه‌حل بده») ⇒ the live turn question is A073 «' + Q_ONLY + '» (K3)' : 'control — an attempt in the message, or «X یا Y؟» without «فقط بگو», is not «فقط جواب»') + ' ' + JSON.stringify({ tag, q: r.q[tag] }));
    }
    delete r.stage;
  });

  // ================= qword — پرسشِ دوم‌شخصِ مربی در «کدام پرسش کمک کرد؟» و نگاشتِ A191 ⇐ u5 (K4) =================
  await section('qword', async () => {
    const r = info.qword = {}; r.stage = 'mk';
    await day(0);
    const P = await mk({ title: 'ضلع‌های مثلثِ دوم', st: 'محیطِ مثلثی ۳۶ است؛ a دو برابرِ b و c سه واحد بیشتر از b است. ضلع‌ها چقدرند؟', nat: 'objective' });
    r.stage = 'chat'; await pageSess(P);
    await next('پیش از جزئیات: کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟');
    await say('محیطِ مثلثی ۳۶ است و ضلع‌ها به هم وابسته‌اند؛ ضلع‌ها را می‌خواهم.');
    await next('خوب. هر ضلع را برحسبِ b می‌نویسی؟');
    await say('سه ضلع را با یک مجهول می‌نویسم و در محیط می‌گذارم.');
    r.chatQs = await p.evaluate(pid => APP.liveChatQs(pid), P);
    r.stage = 'u'; await go('lprob', P);
    await understand({ one: 'می‌خواهم سه ضلع را بیابم', unk: 'a و b و c', data: ['محیط ۳۶ است', 'a دو برابرِ b است'], cond: 'a + b + c = 36', guess: 'b حدودِ هشت است', nat: 'objective' });
    r.stage = 'plan'; await savePlan('نخست هر ضلع را برحسبِ b می‌نویسم سپس در محیط جای‌گذاری می‌کنم');
    r.stage = 'step'; await go('lprob', P, 'exec');
    await objStep('a = 2b و c = b + 3 پس 4b + 3 = 36 و b = 8.25', 'از داده‌ها و جای‌گذاری در محیط');
    r.stage = 'back'; await click('main .lp-solved');
    const o = await bestOpts(); r.opts = o.map(t => t.slice(0, 80)); delete r.stage;
    const U5 = /^💬 شکلی بکش یا نام‌گذاریِ مناسبی بکن؛ مسئله را به زبانِ خودت دوباره بگو\.$/;
    chk(r.chatQs.some(t => /مسئله را به زبانِ خودت دوباره بگو/.test(t)) && !r.chatQs.some(t => /^کلِ مسئله را در یک جمله/.test(t)), 'qword: the coach\'s A191 «کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟» is a chat question (2nd-person «می‌گویی») and maps to the page\'s u5 «… مسئله را به زبانِ خودت دوباره بگو» (K4) ' + JSON.stringify(r.chatQs));
    chk(o.some(t => U5.test(t)) && !o.some(t => /کلِ مسئله را در یک جمله/.test(t)), 'qword: «کدام پرسش کمک کرد؟» offers that question once, as Pólya\'s u5 (s21 c18, s23 c13, s24 c11, s28 c11) ' + JSON.stringify(r.opts));
    chk(o.some(t => /^💬 خوب\. هر ضلع را برحسبِ b می‌نویسی؟$|^💬 هر ضلع را برحسبِ b می‌نویسی؟$/.test(t)), 'qword: another 2nd-person yes/no question («… می‌نویسی؟») is offered as itself ' + JSON.stringify(r.opts));
  });

  // ================= paren — جملهٔ معترضه مرجعِ پرسش را نمی‌بُرد (K4، s01 p9) =================
  await section('paren', async () => {
    const r = info.paren = {}; r.stage = 'mk';
    await day(0);
    const P = await mk({ title: 'خرید یا اجارهٔ دوم', st: 'می‌خواهم بدانم خانه بخرم یا اجاره کنم؛ قیمتِ متریِ محله‌ها را کنار گذاشته بودم.', nat: 'life' });
    await pageSess(P);
    await next('خوب است که ثبتش کردی. پیش از گامِ بعد، همان پرسش: حالا که حدسِ خرید رد شد، قیمتِ متریِ محله‌های نزدیک مهدکودک — که با دلیل کنار گذاشته بودی — هنوز بی‌ربط است؟');
    await say('حدسم رد شد؛ خرید با این قسط نمی‌شه.');
    await next('آفرین — خوب پیش رفتی — حالا مجهول دقیقاً چیست؟');
    await say('مجهول اینه که کجا زندگی کنیم.');
    r.qs = await p.evaluate(pid => APP.liveChatQs(pid), P); delete r.stage;
    chk(r.qs.some(t => /^حالا که حدسِ خرید رد شد، قیمتِ متریِ محله‌های نزدیک مهدکودک — که با دلیل کنار گذاشته بودی — هنوز بی‌ربط است؟$/.test(t)) && !r.qs.some(t => /^هنوز بی‌ربط است؟$/.test(t)),
      'paren: a head with an inner parenthetical «— … —» keeps its referent — the whole question, never the bare «هنوز بی‌ربط است؟» (K4, s01) ' + JSON.stringify(r.qs));
    chk(r.qs.some(t => /^حالا مجهول دقیقاً چیست؟$/.test(t)), 'paren: control — praise preambles («آفرین — خوب پیش رفتی —») are cut, the question «حالا مجهول دقیقاً چیست؟» stays ' + JSON.stringify(r.qs));
    chk(!r.qs.some(t => /^آفرین/.test(t)), 'paren: the praise word itself is cut ' + JSON.stringify(r.qs));
  });

  // ================= ctx — K1: سطرهای بلوکِ زنده یا پرسشِ نوبت‌اند یا زمینه =================
  await section('ctx', async () => {
    const r = info.ctx = {}; r.stage = 'bound';
    await day(0);
    // (۱) سشنِ بسته به مسئله (ساخته در همین سشن با live_new) ⇒ سطرِ «این گفت‌وگو به همین مسئله بسته است»
    await go('home'); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; });
    await p.evaluate(() => __q.push(R({ reply: 'ثبتش می‌کنم.', actions: [{ do: 'live_new', title: 'جای پارک', statement: 'نمی‌دونم ماشین رو کجا پارک کنم که هر روز جریمه نشم', nat: 'practical' }] })));
    await say('نمی‌دونم چی کار کنم: ماشین رو کجا پارک کنم که هر روز جریمه نشم؟');
    await say('خب، از کجا شروع کنم؟'); keep(await lastUser(), 'bound');
    // (۲) نردبانِ مسئلهٔ عملی تمام شد (همهٔ پرسش‌ها پرسیده) + ضرب‌المثلِ خودش ⇒ بلوک بی پرسشِ فهرست؛ سطرهای عملی/ضرب‌المثل باز هم زمینه
    r.stage = 'ladder';
    const PP = await mk({ title: 'مخزنِ آبِ باغچه', st: 'می‌خواهم مخزنِ آبِ باران برای باغچه بسازم؛ چند لیتر بس است؟', nat: 'practical' });
    await pageSess(PP);
    const QU = await p.evaluate(() => APP.LIVE_QK.practical.u);
    await next(QU.map(q => q.replace(/[.]\s*$/, '؟')).join('\n')); await say('سلام، مخزن.');
    await say('به قولِ معروف کار از محکم‌کاری عیب نمی‌کنه؛ مخزن رو بزرگ بگیرم؟'); keep(await lastUser(), 'ladder');
    // (۳) شرطِ متناقض در طرح
    r.stage = 'contra';
    const PC = await mk({ title: 'سه کار در یک ساعت', st: 'سه کارِ یک‌ساعته دارم و فقط یک ساعت وقت؛ هر سه را کامل می‌خواهم.', nat: 'life' });
    await understand({ one: 'می‌خواهم هر سه کار را در یک ساعت تمام کنم', unk: 'برنامهٔ انجامِ هر سه کار', data: ['هر کار یک ساعت است', 'فقط یک ساعت وقت دارم'], cond: 'هر سه کامل شوند', nat: 'life' }, async () => { await sel('#lpSuff', 'متناقض است'); });
    await pageSess(PC); await say('گیر کردم، نمی‌دونم کدوم رو ول کنم.'); keep(await lastUser(), 'contra');
    // (۴) گیر در اجرا با دادهٔ به‌کارنرفته
    r.stage = 'unused';
    const PU = await mk({ title: 'ضلع‌ها', st: 'محیطِ مثلثی ۳۰ است؛ a دو برابرِ b و c دو واحد بیشتر از b است. ضلع‌ها چقدرند؟', nat: 'objective' });
    await understand({ one: 'می‌خواهم سه ضلع را بیابم', unk: 'a و b و c', data: ['محیط ۳۰ است', 'a دو برابرِ b است', 'c دو واحد بیشتر از b است'], cond: 'a + b + c = 30', nat: 'objective' });
    await addMove(); await p.fill('#lpPlan', 'نخست a را برحسبِ b می‌نویسم سپس در محیط می‌گذارم'); await W(350);
    for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'unknown'); await p.fill('#lpPU_w_' + id, 'هنوز نمی‌دانم این داده کجای حل به کار می‌آید'); }
    await click('main .lp-plansave'); if (await hasEl('#lpPSoftWhy')) { await p.fill('#lpPSoftWhy', 'به نامِ دیگری در طرح آمده است'); await click('main .lp-plansave'); }
    await go('lprob', PU, 'exec');
    await pageSess(PU); await say('گیر کردم، جور نمی‌شه.'); keep(await lastUser(), 'unused');
    delete r.stage;
    if (process.env.DUMP) blocks.forEach(x => console.log("=== " + x.tag + "\n" + x.bl));
    r.n = blocks.length; r.bad = [];
    blocks.forEach(x => { const d = strays(x.bl); if (d.length) r.bad.push({ tag: x.tag, d: d.map(l => l.slice(0, 110)) }); });
    r.tags = blocks.map(x => x.tag);
    chk(['bound', 'ladder', 'contra', 'unused'].every(t => r.tags.includes(t)), 'ctx setup: live blocks were produced on the real turns ' + JSON.stringify(r.tags));
    chk(!r.bad.length, 'ctx: in every live block of every real turn, no line but the turn line says «بپرس» or ends in «؟» unless it is «زمینه (نه پرسشِ دوم)» (K1, live side) ' + JSON.stringify(r.bad));
  });

  // ================= soft — K6: هشدارِ حدسی فقط بالای فهرستِ خودش، کنارِ فیلدِ دلیل =================
  await section('soft', async () => {
    const r = info.soft = {}; r.stage = 'mk';
    await day(0);
    const P = await mk({ title: 'قفسهٔ کتاب', st: 'می‌خواهم برای اتاق قفسهٔ کتاب بسازم؛ ۳۰۰ کتاب دارم و دیوار ۲ متر است. چند طبقه بس است؟', nat: 'practical' });
    await understand({ one: 'می‌خواهم بدانم چند طبقه بس است', unk: 'شمارِ طبقه‌ها', data: ['۳۰۰ کتاب دارم', 'دیوار ۲ متر پهنا دارد', 'تختهٔ چوب ۲۰ سانت عمق دارد'], cond: 'همه در قفسه جا شوند', prac: true, measure: 'شمارِ طبقه = ۳۰۰ کتاب ÷ کتابِ هر طبقه', nat: 'practical' });
    r.stage = 'plan1'; await addMove();
    await p.fill('#lpPlan', 'نخست پهنای یک کتاب را می‌سنجم سپس شمارِ کتابِ هر طبقه را می‌شمارم.'); await W(400);
    await click('main .lp-plansave');   // سخت: «طرحِ دوم» (عملی)؛ نرم: داده‌ای که واژه‌اش در طرح نیامده
    const g1 = await p.evaluate(() => { const box = document.querySelector('main .lp-plan'), sg = box && box.querySelector('.lp-softgate'), hm = box && box.querySelector('.lp-hardmiss'), btn = box && box.querySelector('.lp-plansave');
      return { hard: hm ? hm.textContent : '', card: sg ? sg.textContent : '', items: sg ? [...sg.querySelectorAll('li')].map(x => x.textContent) : [], fieldIn: !!(sg && sg.querySelector('#lpPSoftWhy')), fields: document.querySelectorAll('#lpPSoftWhy').length,
        cardAfterHard: !!(sg && hm && (hm.compareDocumentPosition(sg) & Node.DOCUMENT_POSITION_FOLLOWING)), cardAfterBtn: !!(sg && btn && (btn.compareDocumentPosition(sg) & Node.DOCUMENT_POSITION_FOLLOWING)) }; });
    r.g1 = { hard: g1.hard.slice(0, 160), items: g1.items.map(t => t.slice(0, 60)), fieldIn: g1.fieldIn, fields: g1.fields, after: g1.cardAfterHard, afterBtn: g1.cardAfterBtn, card: g1.card.slice(0, 200) };
    chk(/طرحِ دوم/.test(g1.hard) && !/در طرحت نیافتم/.test(g1.hard), 'soft: «هنوز نه» lists only the hard item(s) («طرحِ دوم»), not the word-based warnings (K6) ' + JSON.stringify(r.g1));
    chk(g1.items.length >= 1 && g1.items.every(t => /در طرحت نیافتم/.test(t)) && /حدس زده شده/.test(g1.card), 'soft: the «guessed from words» wording sits over its OWN list of warnings, inside the same card (K6) ' + JSON.stringify(r.g1));
    chk(g1.fieldIn && g1.fields === 1 && g1.cardAfterHard && g1.cardAfterBtn, 'soft: the one reason field is in that card, next to its list (not above the button while the list is below it) (K6, s26 c5) ' + JSON.stringify(r.g1));
    chk(/فقط از همین هشدارها/.test(g1.card), 'soft: with a hard item still open, the card says the reason only passes these warnings (K6, probe p26) ' + JSON.stringify(r.g1));
    r.stage = 'plan2'; await p.fill('#lpPSoftWhy', 'تخته را در اندازه‌گیریِ طبقه حساب کرده‌ام'); await click('main .lp-plansave');
    const s2 = await S(P); r.g2 = { plan: !!(s2.live && s2.live.plan && s2.live.plan.at), hard: (await txt('main .lp-plan .lp-hardmiss')).slice(0, 120), card: await txt('main .lp-plan .lp-softgate') };
    chk(!r.g2.plan && /طرحِ دوم/.test(r.g2.hard) && /پذیرفته شد/.test(r.g2.card), 'soft: the reason is accepted for the warnings, the hard item still blocks — and the page says so (K6) ' + JSON.stringify(r.g2).slice(0, 400)); r.g2.card = r.g2.card.slice(-90);
    r.stage = 'plan3'; await p.fill('#lpPlan2', 'اگر نشد، دو قفسهٔ کوتاه‌تر کنارِ هم می‌گذارم'); await click('main .lp-plansave');
    const s3 = await S(P); r.g3 = { plan: !!(s3.live && s3.live.plan && s3.live.plan.at), soft: !!(s3.live && s3.live.plan && s3.live.plan.soft) };
    chk(r.g3.plan && r.g3.soft, 'soft: with the hard item done, the plan saves with the logged reason ' + JSON.stringify(r.g3));
    // کارتِ فهم: همان قرارداد — فهرستِ هشدار کنارِ فیلدِ دلیل
    r.stage = 'u';
    const PH = await mk({ title: 'خانهٔ ۴۷ ستون', st: 'سه ماهه اکسل پر می‌کنم که خونه بخرم یا اجاره‌نشین بمونم؛ ۴۷ ستون دارم.', nat: 'practical' });
    await understand({ one: 'می‌خواهم بدانم خانه بخرم یا اجاره کنم', unk: 'خرید یا اجاره', data: ['وام ۲ میلیارد است', 'اجاره ماهی ۳۰ میلیون است'], cond: 'قسط بیشتر از ۴۰٪ درآمد نشود', prac: true, prLine: 'هیچی رو بیرون نمی‌ذارم، همهٔ ۴۷ ستون مهمه چون همه روی تصمیم اثر دارن', expectMiss: true, nat: 'practical' });
    const gu = await p.evaluate(() => { const sg = document.querySelector('main .lp-softgate'); return { items: sg ? [...sg.querySelectorAll('li')].map(x => x.textContent.slice(0, 60)) : [], fieldIn: !!(sg && sg.querySelector('#lpSoftWhy')), n: document.querySelectorAll('#lpSoftWhy').length, umiss: (document.querySelector('main .lp-umiss') || {}).textContent || '' }; });
    r.gu = { items: gu.items, fieldIn: gu.fieldIn, n: gu.n, umiss: gu.umiss.slice(0, 160) }; delete r.stage;
    chk(gu.items.length >= 1 && gu.fieldIn && gu.n === 1 && !/^هنوز نه: [^]*کجا خط می‌کشی[^]*$/.test((await txt('main .lp-u .lp-hardmiss'))), 'soft: the understanding card\'s word-based warnings are listed in the card with the reason field, not in «هنوز نه» (K6) ' + JSON.stringify(r.gu));
  });

  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 14000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
