// تورِ پولیا (دستهٔ ۱، دورِ ۱۵ ِ اصلاح، ۲۰۲۶-۱۰-۱۷) — DECISIONS_R15 (O1، O2) روی رابطِ واقعی (پنلِ دستیار با مدلِ ساختگی، فرمِ «🔭»).
//  O1 — هر پیامِ دستیار حداکثر **یک** گزینهٔ «کدام پرسش کمک کرد؟» می‌دهد: بخشِ پرسشیِ همان پیام — از آغازِ جمله‌ای که نخستین پرسش در آن است
//       (سرِ پیش از «—»، «مثلاً»، «و»، «اگر» و جملهٔ معترضه همه در آن) تا پایانِ آخرین جملهٔ پرسشیِ پیوسته؛ جملهٔ پرسشی = به «؟» ختم می‌شود (هر فعل
//       و هر شخص). پرسشی که با ضمیر/پیوند/اشاره آغاز می‌شود («آنجا»، «از آن») جملهٔ خبریِ پیش از خودش را (جای مرجع) هم می‌آورد.
//       هر شناسه = یک ایرادِ گزارش‌شدهٔ دورِ ۱۵، با پیامِ عینیِ دستیار در همان سناریو:
//  split   A·E2 (s10، s08، s03)، A·E3 (s02)، B·D2 (s11)، B·D3 (s13)، D1 (s34)، D2 (s31)، D3 (s31، s35، s38)، D4 (s30)، D5 (s37)
//  O2 — کلید = مجموعهٔ پرسش‌های صفحه در گزینه (فهرست‌های مرحله، فهرستِ اثباتی/عملیِ تور)؛ «پاسخ‌گرفته در صفحه» = پاسخِ فهرست یا **فیلدِ خودش**
//       (lpOne ⇐ «اول کل»)؛ گزینه فقط وقتی می‌افتد که همهٔ جمله‌های پرسشی‌اش کلید دارند و همهٔ کلیدها در صفحه پاسخ گرفته‌اند؛ هم‌کلیدها یکی (تازه‌ترین).
//  e1s03   A·E1 (s03): «فرض چیست؟ حکم (آنچه باید ثابت شود) چیست؟» (فهرستِ اثباتیِ تور، پیش از ثبت) در #lpBBest دو تکه نمی‌شود و نیمه‌اش نمی‌ماند
//  e1s01   A·E1 (s01): پرسشِ دوجمله‌ایِ «چه داری…؟ از این ۴۷ ستون…؟» یک گزینه است؛ نیمهٔ عامش تنها نمی‌ماند
//  t1      C·T1 (s21/s24/s28): «اول کل» ِ کوتاه (پیش از ثبت) و بلند (پس از ثبت) با lpOne ِ پرشده ⇒ یک گزینه در #lpBBest (گزینهٔ صفحه)
//  ctl     کنترل‌ها: دو پرسش دربارهٔ دو مسئلهٔ جدا هر کدام در فهرستِ خودش؛ پرسشِ صفحه که در صفحه پاسخ گرفت 💬 نیست؛ پرسش‌های پیش از ساخت
//          (R14 N1) با واژه‌های خودِ دستیار (R14 N2)؛ «آفرین، ادامه بده.» گزینه نیست.
// LLA_FILE = ساختِ دیگر (خطِ قرمز: ساختِ fac11d42)؛ ONLY=split,t1 …
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
  const NOW = new Date(); const D = (n) => { const d = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const T0 = D(0);
  await p.goto(FILE); await p.waitForSelector('.nav'); await W(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0;
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      // DECISIONS_R21 R7: پاسخِ چندپرسشی یک بار بازنویسی خواسته می‌شود — مدلِ ساختگی همان پاسخ را تکرار می‌کند (این آزمون گزینه‌سازیِ پرسش‌هاست، نه بازنویسی)
      if (/وارسیِ صفحه پیش از نشان دادنِ پاسخ؛ یک بار بازنویسی کن/.test(String(user || '')) && window.__lastText != null) { const tx = window.__lastText; return opts && opts.withMeta ? { text: tx, files: [] } : tx; }
      __calls.push({ sys, user, opts }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t); window.__lastText = text;
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
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
  const next = (reply) => p.evaluate(reply => __q.push(R({ reply })), reply);
  const mk = async (o) => { await go('e_prob', null, 'live'); await p.fill('#lpNewT', o.title); await p.fill('#lpNewS', o.st); await W(60); if (o.kind) await sel('#lpNewType', o.kind); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return p.evaluate(() => APP.state.arg); };
  const fresh = async (v, a) => { await go(v || 'home', a); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; }); };
  const cq = (pid) => p.evaluate(pid => APP.liveChatQs(pid), pid);
  const items = (pid) => p.evaluate(pid => APP.liveChatQItems(pid), pid);
  const bestOpts = () => p.evaluate(() => [...document.querySelectorAll('#lpBBest option')].map(o => o.textContent));
  const understand = async (o) => {
    await p.fill('#lpOne', o.one); await p.fill('#lpWhy', 'برایم مهم است و کنجکاوم'); await click('main .lp-onesave');
    if (o.nat && await hasEl('#lpNat')) await sel('#lpNat', o.nat);
    await p.fill('#lpUnk', o.unk);
    for (let i = 0; i < o.data.length; i++) { if (i >= 2) await click('main .lp-dadd'); await p.fill('#lpD_d' + (i + 1), o.data[i]); }
    await p.fill('#lpCond', o.cond);
    if (await hasEl('#lpSat')) await sel('#lpSat', 'yes');
    await sel('#lpSuff', (await p.locator('#lpSuff option').allTextContents()).find(t => /ناکافی|کم است/.test(t)) || (await p.locator('#lpSuff option').allTextContents())[1]);
    await fillIf('#lpSuffW', 'هنوز همه را نمی‌دانم'); await fillIf('#lpSuffChal', 'همهٔ داده‌ها با هم آن را معین می‌کنند');
    if (await hasEl('#lpSuffCirc')) await p.fill('#lpSuffCirc', 'پیش‌فرض است');
    if (await hasEl('#lpDep')) await sel('#lpDep', 'no');
    if (o.prac) { for (let i = 0; i < o.data.length; i++) await sel('#lpDE_d' + (i + 1), 'big'); await p.fill('#lpPrVague', '«بس» یعنی همان چیزی که لازم است'); await p.fill('#lpPrLine', 'رنگ و برند را بیرون می‌گذارم چون اثری ندارند'); await p.fill('#lpPrApprox', 'دقتِ ده درصد بس است'); await p.fill('#lpPrPrior', 'پارسال همین کار را کردم'); await p.fill('#lpPrMeasure', o.measure || 'قسط ≤ ۴۰٪ درآمد'); await W(80); }
    if (await hasEl('#lpGuess')) { await p.fill('#lpGuess', o.guess || 'راهی هست'); await sel('#lpConf', '60'); await p.fill('#lpTest', 'با یک حالتِ خاص می‌آزمایم'); await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم'); }
    if (await hasEl('#lpGWant')) await sel('#lpGWant', 'فرقی نمی‌کند');
    await click('main .lp-usave'); if (await hasEl('main .lp-u .sv-g2')) await click('main .lp-u .sv-g2');
  };
  const savePlan = async (plan, plan2) => {
    await p.selectOption('#lpMv', 'mv_special').catch(() => {}); await fillIf('#lpMvWhy', 'اول فقط یک حالت را دقیق می‌بینم تا دامنه تنگ شود'); if (await hasEl('main .lp-mvadd')) await click('main .lp-mvadd');
    await p.fill('#lpPlan', plan); if (plan2) await fillIf('#lpPlan2', plan2); await W(350);
    for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); }
    await click('main .lp-plansave'); if (await hasEl('#lpPSoftWhy')) { await p.fill('#lpPSoftWhy', 'به نامِ دیگری در طرح آمده است'); await click('main .lp-plansave'); }
  };
  const objStep = async (text, proof) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); await fillIf('#lpProof', proof); await click('main .lp-stepsave'); };
  const realStep = async (text, pred) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); await fillIf('#lpPred', pred); if (await hasEl('#lpConf')) await sel('#lpConf', '60'); await fillIf('#lpWhen', 'فردا'); await click('main .lp-stepsave'); };
  const outcome = async (what) => { await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', what); if (await hasEl('#lpOMatch')) await sel('#lpOMatch', 'yes'); await sel('#lpOProg', 'کمی'); await sel('#lpOWant', 'same'); if (await hasEl('#lpOGuess')) await sel('#lpOGuess', 'none'); await click('main .lp-outsave'); };
  const day1 = async () => { await p.evaluate(x => { window.__day = x; }, D(1)); };
  const has = (qs, re) => (qs || []).some(t => re.test(t));
  const one = (qs, ...parts) => (qs || []).filter(t => parts.every(x => t.indexOf(x) >= 0)).length === 1;   // یک گزینه که همهٔ تکه‌ها را با هم دارد
  const eq = (qs, s) => (qs || []).some(t => t === s);
  const starts = (qs, s) => (qs || []).some(t => t.indexOf(s) === 0);

  // ================= split — O1: یک گزینه برای بخشِ پرسشیِ هر پیام (پیام‌های عینیِ دورِ ۱۵) =================
  await section('split', async () => {
    const r = info.split = {}; r.stage = 'mk';
    const P = await mk({ title: 'گزینه‌های گفت‌وگو', st: 'می‌خواهم ببینم کدام پرسشِ گفت‌وگو کمک کرد؛ مسئلهٔ آزمونیِ همین دور با چند پیامِ عینیِ دستیار.', nat: 'objective' });
    await fresh('lprob', P);
    const M = {
      s10: '«فرض کنیم ممکن است…» برای کشف خوب بود، ولی برای توضیح گیج‌کننده است. استدلالت غیرمستقیم (خلف) بود — مستقیمش می‌کنی؟ یعنی بخشِ مثبتش را جدا بگو: هر چیدمانی حداکثر چند جفتِ عمه–پسرعموی کناری دارد، و قانون چند تا می‌خواهد؟',
      s08: 'از آخر شروع کن: فرض کن تخم‌مرغ همین حالا دقیقاً ۱۵ دقیقه پخته است — یک لحظه پیش از آن، روی میز و در ساعت‌ها چه دیده می‌شد که از آن به ۱۵ می‌رسیدی؟',
      s03: 'ثبتش می‌کنم؛ قدم‌به‌قدم در صفحهٔ خودش جلو می‌رویم. اول یک پرسش: فرض را بخش‌بخش جدا بنویس — هر بخش چه می‌گوید؟',
      s02: 'قطرِ کف را دیده‌ای. حالا خاص‌تر: دادهٔ «ارتفاع بار ۱.۶ متر (c)» را کجا به کار برده‌ای؟ اگر هنوز نه، در کدام گام جا دارد — یا با دلیل کنارش می‌گذاری؟',
      s11: 'گیر کردن همین‌جا طبیعی است. یک پرسش: همهٔ داده‌ها و کلِ شرط را به کار بردی؟ مثلاً این‌که «کدام» دو گوشه برداشته شده‌اند — دو گوشهٔ مقابل — در کجای استدلالت آمده؟',
      s13: 'درستی‌اش را نه من می‌دانم نه صفحه؛ داورش واقعیت و داوریِ خودتان است. گزینه‌تان را با تک‌تکِ بخش‌های شرطِ خودتان بسنجید — «جلوی ادامه‌اش گرفته شود» و «دوستم نابود نشود» — هر بخش را برآورده می‌کند؟',
      s34: 'پلان و مقطع‌ها تقریباً آماده — یک ماه پیش حتی لپ‌تاپ باز نمی‌ماند. میانهٔ راه: چه آموختی؟ — دربارهٔ مسئله چه آموختی که روزِ اول نمی‌دانستی، و دربارهٔ خودت چه دیدی؟ کارتِ «🔭 میانهٔ راه» را باز می‌کنم تا همان‌جا به قلمِ خودت بنویسی.',
      s31g: 'خودت پیدایش کردی: فرضِ «دو عدد» در صورت نبود. «۴ جزء بهترین است» حدس است، نه نتیجه — درست یا نادرستش را نمی‌گویم. چطور می‌آزمایی‌اش؟ با کدام وارسی یا حالتِ خاص؟',
      s31a: 'برای ریاضیدانِ آینده مهم‌ترین بخشِ کار همین نگاه به راه‌حلِ تمام‌شده است، و هیچ مسئله‌ای کاملاً تمام نمی‌شود. همان پرسش از زاویهٔ دیگر: گامِ اولِ حلت را بنویس — آنجا چه چیزی را فرض کردی که صورت نگفته بود؟',
      s35a: 'محلهٔ ولیعصر مسئلهٔ مرتبطی است که حل شده — فرق داشتنش اشکالی ندارد. از آن، نتیجه‌اش را به کار می‌بری یا روشش را — آن‌ها با همان دو مشکلِ تو (جمع‌آوریِ جدا و نگه‌داشتنِ سطل‌ها) چه کردند، و برای آوردنش این‌جا چه عنصرِ کمکی‌ای (آدم، قرار، گامِ میانی) لازم است؟',
      s35b: 'دربارهٔ «خوبه» حکم نمی‌دهم — داورش واقعیت است. صفحه پیش از ثبتِ این گام همان را می‌پرسد که من: مجهولت «پایداری، نه شروع» است — این گام (پیمانکار و جایزهٔ کوچهٔ برتر) چطور به آن نزدیکت می‌کند؟ همان‌جا به قلمِ خودت بنویس.',
      s38: 'یک پلهٔ دیگر، از آخر به عقب: فرض کن حجم را داری — یک گام مانده به آخر چه وضعی بود؟ مثلاً حجمِ چه تکه‌های ساده‌تری را که قاعده و ارتفاعشان روشن است جمع می‌زدی؟',
      s30: '«قبلاً دیدیش؟» به این درد می‌خورد که طرح معمولاً از روشِ مسئلهٔ آشنایی درمی‌آید — اگر جایی گلوگاه پیدا کرده‌ای، همان روش این‌جا هم به کار می‌آید. ولی حالا که گیر کرده‌ای، بلند فکر می‌کنم: «از خودم می‌پرسم: همهٔ چیزهایی را که می‌دانم به کار برده‌ام؟» تو بگو: داده‌هایی که اثرِ محسوس دارند — ظرفیتِ هر ایستگاه، ۸۰۰ و ۱۰۰۰ — همه در طرحت آمده‌اند؟ کلِ قیدها را؟',
      s37: 'پیش از «کدوم»، نتیجه را وارسی کن: هر دو عدد واقعاً بر ۳۶ بخش‌پذیرند — تقسیم را انجام دادی؟ و همهٔ داده‌های دفتر در جوابت آمده‌اند؟ برای ادامهٔ گام‌به‌گام می‌توانی آن را در «🔭 مسئلهٔ حل‌نشدهٔ خودم» بسازی.',
      praise: 'آفرین، ادامه بده.'
    };
    r.stage = 'chat';
    for (const k of Object.keys(M)) { await next(M[k]); await say('باشه، فکر می‌کنم و جواب می‌دهم: ' + k); }
    const q = r.qs = await cq(P); r.n = q.length; delete r.stage;
    const QA = Object.keys(M).filter(k => k !== 'praise').length;
    chk(q.length === QA, 'split: one option per assistant message with a question — ' + QA + ' messages, got ' + q.length + ' (O1) ' + JSON.stringify(q));
    // A·E2
    chk(one(q, 'استدلالت غیرمستقیم (خلف) بود — مستقیمش می‌کنی؟', 'هر چیدمانی حداکثر چند جفتِ عمه–پسرعموی کناری دارد') && !eq(q, 'مستقیمش می‌کنی؟'), 'split A·E2 s10: «… (خلف) بود — مستقیمش می‌کنی؟» keeps its head, and the message\'s second question is in the same option (O1) ' + JSON.stringify(q));
    chk(one(q, 'فرض کن تخم‌مرغ همین حالا دقیقاً ۱۵ دقیقه پخته است — یک لحظه پیش از آن') && !starts(q, 'یک لحظه پیش از آن'), 'split A·E2 s08: the dash head «فرض کن تخم‌مرغ …» that «آن» points to is kept (O1) ' + JSON.stringify(q));
    chk(one(q, 'فرض را بخش‌بخش جدا بنویس — هر بخش چه می‌گوید؟') && !eq(q, 'هر بخش چه می‌گوید؟'), 'split A·E2 s03: the imperative head «فرض را بخش‌بخش جدا بنویس —» is kept (O1) ' + JSON.stringify(q));
    // A·E3
    chk(one(q, 'را کجا به کار برده‌ای؟', 'اگر هنوز نه، در کدام گام جا دارد — یا با دلیل کنارش می‌گذاری؟') && !starts(q, 'اگر هنوز نه'), 'split A·E3 s02: the dynamic two-sentence stuck question is one option, never «اگر هنوز نه، …» alone (O1) ' + JSON.stringify(q));
    // B·D2، B·D3
    chk(one(q, 'همهٔ داده‌ها و کلِ شرط را به کار بردی؟', 'مثلاً این‌که «کدام» دو گوشه برداشته شده‌اند') && !starts(q, 'مثلاً'), 'split B·D2 s11: the «مثلاً …» follow-up stays with its question (O1) ' + JSON.stringify(q));
    chk(one(q, 'گزینه‌تان را با تک‌تکِ بخش‌های شرطِ خودتان بسنجید', 'هر بخش را برآورده می‌کند؟'), 'split B·D3 s13: the page\'s condition check «… هر بخش را برآورده می‌کند؟» (third-person verb) is offered (O1: a question is a sentence ending in «؟») ' + JSON.stringify(q));
    // D1–D5
    chk(one(q, 'چه آموختی؟ — دربارهٔ مسئله چه آموختی که روزِ اول نمی‌دانستی') && !eq(q, 'چه آموختی؟') && !starts(q, '—'), 'split D1 s34: the mid-course question is one option, no «—»-led fragment (O1) ' + JSON.stringify(q));
    chk(one(q, 'چطور می‌آزمایی‌اش؟ با کدام وارسی یا حالتِ خاص؟') && !eq(q, 'با کدام وارسی یا حالتِ خاص؟') && !eq(q, 'چطور می‌آزمایی‌اش؟'), 'split D2 s31: the guess-test turn question is one option (O1) ' + JSON.stringify(q));
    chk(one(q, 'گامِ اولِ حلت را بنویس', 'آنجا چه چیزی را فرض کردی که صورت نگفته بود؟') && !starts(q, 'آنجا'), 'split D3 s31: «آنجا …» keeps its referent «گامِ اولِ حلت» (O1) ' + JSON.stringify(q));
    chk(one(q, 'محلهٔ ولیعصر', 'از آن، نتیجه‌اش را به کار می‌بری یا روشش را') && !starts(q, 'از آن'), 'split D3 s35: «از آن، …» brings the sentence its «آن» points to (O1 anaphor rule) ' + JSON.stringify(q));
    chk(one(q, 'مجهولت «پایداری، نه شروع» است — این گام', 'چطور به آن نزدیکت می‌کند؟') && !starts(q, 'این گام'), 'split D3 s35: the head «مجهولت «پایداری، نه شروع» است —» (the referent of «آن») is kept (O1) ' + JSON.stringify(q));
    chk(one(q, 'فرض کن حجم را داری — یک گام مانده به آخر چه وضعی بود؟', 'مثلاً حجمِ چه تکه‌های ساده‌تری') && !starts(q, 'یک گام مانده') && !starts(q, 'مثلاً'), 'split D3 s38: «فرض کن حجم را داری —» (the working-backwards move) and its «مثلاً …» example are one option (O1) ' + JSON.stringify(q));
    chk(one(q, 'داده‌هایی که اثرِ محسوس دارند — ظرفیتِ هر ایستگاه، ۸۰۰ و ۱۰۰۰ — همه در طرحت آمده‌اند؟ کلِ قیدها را؟') && !has(q, /از خودم می‌پرسم/), 'split D4 s30: «کلِ قیدها را؟» is not lost, and the quoted think-aloud is not an option (O1) ' + JSON.stringify(q));
    chk(one(q, 'تقسیم را انجام دادی؟ و همهٔ داده‌های دفتر در جوابت آمده‌اند؟') && !starts(q, 'و '), 'split D5 s37: the yes/no check «… تقسیم را انجام دادی؟» is offered, and «و …» stays with it (O1) ' + JSON.stringify(q));
    chk(!has(q, /ادامه بده/), 'split: control — the praise-only «آفرین، ادامه بده.» is not an option ' + JSON.stringify(q));
  });

  // ================= e1s03 — A·E1 (s03): فهرستِ اثباتیِ تور و پاسخِ فیلد در صفحه =================
  await section('e1s03', async () => {
    const r = info.e1s03 = {}; r.stage = 'chat';
    await fresh('home');
    await next('این مسئلهٔ اثباتی است: مجهول ندارد؛ به‌جایش فرض دارد و حکمی که باید ثابت شود. خودت بگو: فرض چیست؟ حکم (آنچه باید ثابت شود) چیست؟');
    await say('پنج نقطه در یک مربعِ واحد دارم؛ می‌خوام ثابت کنم دو تاشون فاصله‌شون حداکثر رادیکال دو تقسیم بر دوئه.');
    r.stage = 'form';
    const P = await mk({ title: 'پنج نقطه در مربعِ واحد', st: 'ثابت کن از هر پنج نقطه در مربعِ واحد، دو تا فاصله‌ای حداکثر √۲/۲ دارند.', kind: 'prove', nat: 'objective' });
    await next('ثبتش می‌کنم؛ قدم‌به‌قدم در صفحهٔ خودش جلو می‌رویم. اول یک پرسش: فرض را بخش‌بخش جدا بنویس — هر بخش چه می‌گوید؟');
    await say('فرض: پنج نقطه، داخل یا روی مرزِ مربعِ واحد.');
    r.qs = await cq(P);
    r.stage = 'u'; await go('lprob', P);
    await understand({ one: 'می‌خواهم ثابت کنم دو نقطه از پنج نقطه نزدیک‌اند', unk: 'دو نقطه با فاصلهٔ حداکثر √۲/۲ هست', data: ['پنج نقطه داریم', 'نقطه‌ها داخل یا روی مرزِ مربعِ واحدند'], cond: 'برای هر چیدمان: دو نقطه با فاصلهٔ ≤ √۲/۲', nat: 'objective' });
    r.stage = 'plan'; await savePlan('مربع را به چهار مربعِ کوچک تقسیم می‌کنم و اصلِ لانهٔ کبوتری را به کار می‌برم');
    r.stage = 'step'; await go('lprob', P, 'exec'); await objStep('چهار مربعِ کوچک با ضلعِ ۱/۲؛ پنج نقطه ⇒ دو نقطه در یک مربعِ کوچک ⇒ فاصله ≤ قطرِ آن = √۲/۲', 'اصلِ لانهٔ کبوتری و قطرِ مربعِ کوچک');
    r.stage = 'back'; await click('main .lp-solved');
    const o = await bestOpts(); r.opts = o.map(t => t.slice(0, 100)); delete r.stage;
    chk(o.length > 0, 'e1s03 setup: the look-back shows «کدام پرسش کمک کرد؟» ' + JSON.stringify(r.opts));
    chk(!o.some(t => /^💬 (?:حکم \(آنچه باید ثابت شود\) چیست؟|فرض چیست؟)$/.test(t)), 'e1s03 A·E1: the tour list question «فرض چیست؟ حکم (…) چیست؟» is never split into a half option (O1 + O2: keyed against the prove list in force when asked) ' + JSON.stringify(r.opts));
    chk(!o.some(t => /^💬 .*حکم \(آنچه باید ثابت شود\) چیست؟/.test(t)), 'e1s03 A·E1: both its halves were answered on the page (مجهول/حکم and داده/فرض fields of the understanding card) ⇒ no 💬 duplicate (O2) ' + JSON.stringify(r.opts));
    chk(o.includes('💬 فرض را بخش‌بخش جدا بنویس — هر بخش چه می‌گوید؟') && !o.includes('💬 هر بخش چه می‌گوید؟'), 'e1s03 A·E2: the imperative-headed question is one whole option in #lpBBest (O1) ' + JSON.stringify(r.opts));
  });

  // ================= e1s01 — A·E1 (s01): پرسشِ دوجمله‌ایِ عملی یک گزینه است؛ نیمهٔ عامش تنها نمی‌ماند =================
  await section('e1s01', async () => {
    const r = info.e1s01 = {}; r.stage = 'mk';
    const P = await mk({ title: 'خرید یا اجارهٔ خانه', st: 'سه ماهه اکسل پر می‌کنم که خونه بخرم یا اجاره‌نشین بمونم؛ ۴۷ ستون دارم و تصمیم نمی‌گیرم.', nat: 'practical' });
    await fresh('lprob', P);
    const MSG = 'پس کلِ مسئله در یک جمله این است: جایی پیدا کنی که پسرت تا هفت سال جای امن و ثابت داشته باشد، بی آنکه خرجِ خانه از ۴۰٪ درآمدتان بالاتر برود. حالا چه داری — دانسته‌ها، منابع، امکان‌ها (داده‌ها)؟ از این ۴۷ ستون کدام روی همین دو شرط اثرِ محسوس دارد و کدام را با دلیل کنار می‌گذاری؟';
    await next(MSG); await say('قسط، اجاره، فاصله تا مدرسه مهم‌ان؛ رنگ کابینت و طبقه نه.');
    r.it = await items(P); const q = r.it.map(e => e.t);
    chk(one(q, 'چه داری — دانسته‌ها، منابع، امکان‌ها (داده‌ها)؟', 'از این ۴۷ ستون کدام روی همین دو شرط اثرِ محسوس دارد'), 'e1s01 A·E1: the two-sentence question is ONE option (O1) ' + JSON.stringify(r.it));
    chk(!q.some(t => /^(?:حالا )?چه داری — دانسته‌ها، منابع، امکان‌ها \(داده‌ها\)؟$/.test(t)), 'e1s01 A·E1: never the generic first half alone (O1) ' + JSON.stringify(r.it));
    r.stage = 'u'; await go('lprob', P);
    await understand({ one: 'می‌خواهم جای ثابتی برای هفت سال بیابم با خرجِ زیرِ ۴۰٪ درآمد', unk: 'خرید یا اجاره', data: ['درآمد ماهانه', 'پسرم هفت سال مدرسه دارد'], cond: 'خرج ≤ ۴۰٪ درآمد', nat: 'practical', prac: true });
    r.stage = 'plan'; await savePlan('نخست قسط و اجاره را برای هفت سال مقایسه می‌کنم سپس فاصله تا مدرسه را', 'اگر نشد، اجارهٔ نزدیکِ مدرسه را برای دو سال می‌گیرم و دوباره می‌سنجم');
    r.stage = 'step'; await go('lprob', P, 'exec'); await realStep('فردا قسط و اجاره را برای هفت سال حساب کنم', 'اجاره ارزان‌تر است');
    r.stage = 'out'; await day1(); await go('lprob', P, 'exec'); await outcome('حساب کردم؛ اجاره ارزان‌تر بود');
    r.stage = 'back'; await click('main .lp-solved');
    const o = await bestOpts(); r.opts = o.map(t => t.slice(0, 100)); delete r.stage;
    chk(o.length > 0, 'e1s01 setup: the look-back shows «کدام پرسش کمک کرد؟» ' + JSON.stringify(r.opts));
    chk(!o.some(t => /^💬 (?:حالا )?چه داری — دانسته‌ها، منابع، امکان‌ها \(داده‌ها\)؟$/.test(t)), 'e1s01 A·E1: #lpBBest never keeps the generic half of the two-sentence question (O1/O2) ' + JSON.stringify(r.opts));
    chk(o.some(t => t.indexOf('💬 ') === 0 && t.indexOf('از این ۴۷ ستون') >= 0 && t.indexOf('چه داری') >= 0) || o.some(t => t.indexOf('💬') < 0 && /چه داری — دانسته‌ها/.test(t) && /اثرِ محسوس/.test(t)), 'e1s01 A·E1: the question is represented whole — either the assistant\'s whole two-sentence option or the page question she answered (O2) ' + JSON.stringify(r.opts));
  });

  // ================= t1 — C·T1 (s21/s24/s28): «اول کل» ِ کوتاه و بلند + lpOne ⇒ یک گزینه =================
  await section('t1', async () => {
    const r = info.t1 = {}; r.stage = 'chat';
    await fresh('home');
    await next('پیش از هر حالت و جزئیات: کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟');
    await say('محیطِ مثلثی ۳۶ است؛ a دو برابرِ b و c سه واحد بیشتر از b. ضلع‌ها رو می‌خوام.');
    r.stage = 'form';
    const P = await mk({ title: 'ضلع‌های مثلثِ پنجم', st: 'محیطِ مثلثی ۳۶ است؛ a دو برابرِ b و c سه واحد بیشتر از b است. ضلع‌ها چقدرند؟', nat: 'objective' });
    await next('ثبت شد. اول کل، بعد جزءها: کلِ مسئله را بی‌جزئیات، در یک جملهٔ کامل و به زبانِ خودت، می‌گویی؟');
    await say('سه ضلعِ مثلثی با محیطِ ۳۶ را می‌خواهم.');
    r.qs = await cq(P);
    r.stage = 'u'; await go('lprob', P);
    await understand({ one: 'می‌خواهم سه ضلعِ مثلثی با محیطِ ۳۶ را بیابم', unk: 'a و b و c', data: ['محیط ۳۶ است', 'a دو برابرِ b است'], cond: 'a + b + c = 36', guess: 'b حدودِ هشت است', nat: 'objective' });
    r.stage = 'plan'; await savePlan('نخست هر ضلع را برحسبِ b می‌نویسم سپس در محیط جای‌گذاری می‌کنم');
    r.stage = 'step'; await go('lprob', P, 'exec'); await objStep('a = 2b و c = b + 3 پس 4b + 3 = 36 و b = 8.25', 'از داده‌ها و جای‌گذاری در محیط');
    r.stage = 'back'; await click('main .lp-solved');
    const o = await bestOpts(); r.opts = o.map(t => t.slice(0, 100)); delete r.stage;
    chk(has(r.qs, /^کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟$/) || has(r.qs, /کلِ مسئله را بی‌جزئیات/), 't1 setup: both whole-first wordings were asked about this problem (pre- and post-creation) ' + JSON.stringify(r.qs));
    chk(r.qs.filter(t => /کلِ مسئله/.test(t)).length === 1, 't1 C·T1: the short and the long whole-first wording share the key «اول کل» (Q_WHOLE) ⇒ one chat option, the most recent wording (O2) ' + JSON.stringify(r.qs));
    chk(o.filter(t => /کلِ مسئله/.test(t)).length === 1, 't1 C·T1: #lpBBest shows the whole-first question exactly once (O2) ' + JSON.stringify(r.opts));
    chk(!o.some(t => /^💬 .*کلِ مسئله/.test(t)) && o.some(t => /^اول کل، بعد جزءها: کلِ مسئله/.test(t)), 't1 C·T1: lpOne answered it on the page ⇒ the page option, not a 💬 copy (O2: answered by its own field) ' + JSON.stringify(r.opts));
  });

  // ================= ctl — کنترل‌ها =================
  await section('ctl', async () => {
    const r = info.ctl = {}; r.stage = 'two';
    // دو مسئلهٔ جدا، هر کدام در سشنِ خودش: پرسشِ هر یک فقط در فهرستِ خودش
    const A1 = await mk({ title: 'قفسهٔ انباریِ پانزدهم', st: 'می‌خواهم انباریِ ۴ متری را طوری قفسه بزنم که همهٔ جعبه‌ها جا شوند؛ چند طبقه و کجا؟', nat: 'life' });
    await fresh('lprob', A1); await next('جعبه‌ها چند اندازهٔ مختلف دارند — و بلندترینشان چقدر است؟'); await say('سه اندازه، بلندترین ۶۰ سانت.');
    const B1 = await mk({ title: 'باغچهٔ پشتِ خانه', st: 'گوجه‌های باغچه هر سال کوچک می‌مانند؛ علتش خاک است یا آفتاب؟', nat: 'practical' });
    await fresh('lprob', B1); await next('باغچه روزی چند ساعت آفتابِ مستقیم می‌گیرد؟'); await say('حدودِ چهار ساعت.');
    r.qa = await cq(A1); r.qb = await cq(B1);
    chk(has(r.qa, /بلندترینشان/) && !has(r.qa, /آفتابِ مستقیم/), 'ctl: the shelf list has its own question and never the garden\'s ' + JSON.stringify(r.qa));
    chk(has(r.qb, /آفتابِ مستقیم/) && !has(r.qb, /بلندترینشان/), 'ctl: the garden list has its own question and never the shelf\'s ' + JSON.stringify(r.qb));
    // R14 N1 + N2: پرسش‌های پیش از ساخت (بی موضوعِ پیشین) با واژه‌های خودِ دستیار
    r.stage = 'pre'; await fresh('home');
    await next('داده‌ها را روشن گفتی. «۹۸ زوج است» فقط تعداد را می‌سنجد، نه کلِ شرط را؛ پس مجهولت دقیقاً چیست — یک چیدمانِ کامل، یا دانستنِ این‌که اصلاً چنین چیدمانی هست یا نه؟');
    await say('می‌خوام صفحه‌ی ۱۰ در ۱۰ بی دو گوشه‌ی مقابل رو با دومینو بپوشونم، ۹۸ خونه می‌مونه.');
    const C1 = await mk({ title: 'دومینو روی صفحهٔ بی دو گوشهٔ پانزدهم', st: 'صفحهٔ ۱۰×۱۰ که دو گوشهٔ مقابلش برداشته شده را می‌شود با دومینوهای ۱×۲ کامل پوشاند؟', nat: 'objective' });
    await next('هر دومینو چند خانهٔ سیاه و چند خانهٔ سفید می‌پوشاند؟'); await say('یکی سیاه یکی سفید.');
    r.qc = await cq(C1);
    chk(has(r.qc, /مجهولت دقیقاً چیست — یک چیدمانِ کامل/) && has(r.qc, /خانهٔ سیاه/), 'ctl: the pre-creation question (R14 N1) is offered, in the assistant\'s own words (R14 N2), next to the later one ' + JSON.stringify(r.qc));
    // پرسشِ صفحه که در صفحه پاسخ گرفت 💬 نیست (و یک گزینه می‌ماند)
    r.stage = 'page';
    const E1 = await mk({ title: 'ضلع‌های مثلثِ ششم', st: 'محیطِ مثلثی ۳۶ است؛ a دو برابرِ b و c سه واحد بیشتر از b است. ضلع‌ها چقدرند؟', nat: 'objective' });
    await fresh('lprob', E1);
    await next('مجهول (یا حکمی که باید ثابت شود) چیست؟'); await say('سه ضلعِ a و b و c.');
    await go('lprob', E1);
    await understand({ one: 'می‌خواهم سه ضلع را بیابم', unk: 'a و b و c', data: ['محیط ۳۶ است', 'a دو برابرِ b است'], cond: 'a + b + c = 36', guess: 'b حدودِ هشت است', nat: 'objective' });
    await savePlan('نخست هر ضلع را برحسبِ b می‌نویسم سپس در محیط جای‌گذاری می‌کنم');
    await go('lprob', E1, 'exec'); await objStep('a = 2b و c = b + 3 پس 4b + 3 = 36 و b = 8.25', 'از داده‌ها و جای‌گذاری در محیط');
    await click('main .lp-solved');
    const o = await bestOpts(); r.opts = o.map(t => t.slice(0, 90)); delete r.stage;
    chk(o.filter(t => /مجهول \(یا حکمی که باید ثابت شود\) چیست؟/.test(t)).length === 1 && !o.some(t => /^💬 مجهول \(یا حکمی/.test(t)), 'ctl: a page question answered on the page and also asked in chat is ONE option, the page one — never a 💬 ' + JSON.stringify(r.opts));
  });

  console.log(JSON.stringify(info).slice(0, 16000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
