// تورِ پولیا (دستهٔ ۱، دورِ ۱۶ ِ اصلاح، ۲۰۲۶-۱۰-۱۷) — DECISIONS_R16 (L1–L3، بخشِ «live») روی رابطِ واقعی (پنلِ دستیار با مدلِ ساختگی، فرمِ «🔭»).
//  هر شناسه = یک ایرادِ گزارش‌شدهٔ دورِ ۱۶، با پیامِ عینیِ دستیار در همان سناریو (round16X/<sid>/ai/r*.txt):
//  colon  L1a — «:» فقط پس از برچسبِ تنها («یک پرسش:»، «یک پرسشِ بازنگری:»، «… از همین فهرست:») جمله را می‌بندد؛ وگرنه بندِ پیش از «:» سرِ پرسش است
//         و می‌ماند: A·F5 (s06 «پیش از رها کردنِ کلِ راه:»، s10 «… حالت‌های خاص و حدی را بیازما:»)، C·U1 (s25 «از آخر شروع کن:»)، و s21/s23/s25 ِ بی‌ضرر.
//  mask   L1b — «؟» ِ چسبیده به رقم/حرف («؟۴۸۷؟») نویسهٔ محوشده است، نه پایانِ جمله (D·D1 s37).
//  runs   L1c — دو رشتهٔ پرسشیِ جدا (با جملهٔ ناپرسشی میانشان) دو گزینه‌اند، مگر رشتهٔ دوم با ضمیر/پیوند آغاز شود (A·F2 s03)؛ رشتهٔ پیوسته یک گزینه (کنترل).
//  ref    L1d — گزینه‌ای که مرجعِ اصلی‌اش ضمیر/اشاره به حدسِ ثبت‌شدهٔ مسئله است («…اش؟»، «این حدس…») مرجع را از رکورد در پرانتز دارد (C، مشاهده: s23، s21/s29)؛
//         گزینه‌ها از مسئله‌ای به مسئلهٔ دیگر نمی‌روند (کنترل).
//  rep    L1e — دو گزینهٔ 💬 ِ یک مسئله که واژه‌های معنادارِ یکی زیرمجموعهٔ دیگری است یکی می‌شوند، تازه‌ترین (D·D2 s31) — بی آستانهٔ عددی.
//  live   L2 — پیامِ تازهٔ دستیار وقتی کارتِ بازنگری باز است #lpBBest را همان‌جا تازه می‌کند (A·F3 s06، s10)؛ گزینهٔ برگزیده می‌ماند.
//  kind   L3 — گزینه‌های 📄 ِ فهم همان برچسب‌های کارتی که واقعاً دید: اثباتی (حکم/فرض/«آیا همهٔ فرض لازم است؟») و «اثبات یا رد کن» ِ زندگی (A·F1 s03، s05، s10)؛
//         پرسشِ صفحه که در صفحه پاسخ گرفت 💬 نیست (کنترل).
// کنترل‌های دورِ ۱۵ در test_tour1_r15_live.js می‌مانند. LLA_FILE = ساختِ دیگر (خطِ قرمز: ساختِ 96322acd)؛ ONLY=colon,runs …
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
      __calls.push({ sys, user, opts }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
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
  const bestOpts = () => p.evaluate(() => [...document.querySelectorAll('#lpBBest option')].map(o => o.textContent));
  const understand = async (o) => {
    await p.fill('#lpOne', o.one); await p.fill('#lpWhy', 'برایم مهم است و کنجکاوم'); await click('main .lp-onesave');
    if (o.nat && await hasEl('#lpNat')) await sel('#lpNat', o.nat);
    await p.fill('#lpUnk', o.unk);
    for (let i = 0; i < o.data.length; i++) { if (i >= 2) await click('main .lp-dadd'); await p.fill('#lpD_d' + (i + 1), o.data[i]); }
    await p.fill('#lpCond', o.cond);
    if (await hasEl('#lpSat')) await sel('#lpSat', (await p.locator('#lpSat option').evaluateAll(xs => xs.map(x => x.value))).find(v => v && v !== 'no') || 'yes');
    await sel('#lpSuff', (await p.locator('#lpSuff option').allTextContents()).find(t => /ناکافی|کم است/.test(t)) || (await p.locator('#lpSuff option').allTextContents())[1]);
    await fillIf('#lpSuffW', 'هنوز همه را نمی‌دانم'); await fillIf('#lpSuffChal', 'همهٔ داده‌ها با هم آن را معین می‌کنند');
    if (await hasEl('#lpSuffCirc')) await p.fill('#lpSuffCirc', 'پیش‌فرض است');
    if (await hasEl('#lpDep')) await sel('#lpDep', 'no');
    if (await hasEl('#lpGuess')) { await p.fill('#lpGuess', o.guess || 'راهی هست'); await sel('#lpConf', '60'); await p.fill('#lpTest', 'با یک حالتِ خاص می‌آزمایم'); await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم'); }
    await fillIf('#lpGContra', 'اگر حالتِ خاص خلافش را نشان دهد'); await fillIf('#lpGChal', 'قوی‌ترین شاهدِ خلاف را هم می‌نویسم');
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
  const outcome = async (what) => { await sel('#lpODone', 'yes'); await p.fill('#lpOWhat', what); if (await hasEl('#lpOMatch')) await sel('#lpOMatch', 'yes'); await sel('#lpOProg', (await p.locator('#lpOProg option').evaluateAll(xs => xs.map(x => x.value))).filter(Boolean)[0]); await sel('#lpOWant', 'same'); if (await hasEl('#lpOGuess')) await sel('#lpOGuess', (await p.locator('#lpOGuess option').evaluateAll(xs => xs.map(x => x.value))).filter(Boolean)[0]); await click('main .lp-outsave'); };
  const has = (qs, re) => (qs || []).some(t => re.test(t));
  const one = (qs, ...parts) => (qs || []).filter(t => parts.every(x => t.indexOf(x) >= 0)).length === 1;   // یک گزینه که همهٔ تکه‌ها را با هم دارد
  const eq = (qs, s) => (qs || []).some(t => t === s);
  const starts = (qs, s) => (qs || []).some(t => t.indexOf(s) === 0);
  const J = (x) => JSON.stringify(x);

  // ================= colon — L1a: سرِ پیش از «:» می‌ماند، مگر برچسبِ تنها =================
  await section('colon', async () => {
    const r = info.colon = {}; r.stage = 'mk';
    const P = await mk({ title: 'گزینه‌های دونقطه', st: 'مسئلهٔ آزمونیِ دورِ ۱۶: کدام پرسشِ گفت‌وگو کمک کرد، با سرِ پیش از دونقطه.', nat: 'objective' });
    await fresh('lprob', P);
    const M = {
      s06: 'در صفحه‌ات فقط یک شاخه بن‌بست شد، نه کلِ تحلیل — نشانه‌ها گاهی در یک مورد فریب می‌دهند ولی بیشترِ وقت‌ها درست راه می‌برند. پیش از رها کردنِ کلِ راه: کدام حلقه دقیقاً شکست؟ شاید فقط همان یکی باید عوض شود و بقیهٔ زنجیره درست است.',
      s10: 'سؤالِ خوبی است: همهٔ قوانین را باور نمی‌کنیم، «فرضاً» برقرار می‌گیریم تا ببینیم به کجا می‌رسد — ذهنِ باز؛ اگر به تناقض رسید، همان فرض نادرست است. شمردنِ جفت‌ها راهِ خوبی است؛ پیش از اثبات، حالت‌های خاص و حدی را بیازما: مثالِ نقضی پیدا می‌شود؟',
      s25: 'از آخر شروع کن: حکم برای n+1 چه می‌گوید — و آن از چه چیزی نتیجه می‌شد، و آن از چه، تا به فرضِ استقرا برسی؟',
      s25b: 'ثبتش می‌کنیم — به «🔭 مسئلهٔ حل‌نشدهٔ خودم» می‌رویم. ولی ده نمونه اثبات نیست: برهانش چیست — چرا برای هر n، نه فقط این ده‌تا؟',
      s21: 'گامِ کیشِ وزیر را با برهانش درست ثبت کردی — حالا می‌دانی آن کیش شاه را به g8 می‌فرستد؛ این خودش یک راه را بست. رخِ a1 را اول «تزئینی» کنار گذاشتی. حالا که گیر کرده‌ای: هنوز مطمئنی رخ در این مسئله بی‌ربط است؟',
      s23: 'خوب که کیک درآمد! برای زمان: مقدارها را با نسبتِ مساحتِ کف ۲٫۸ برابر کردی و حالا می‌خواهی همان نسبت را به زمان ببری. قیاس را به کار بردی: کجا این شباهت می‌شکند — زمانِ پخت به کدام جزءِ قالب بند است که در «مساحتِ کف» متناظری ندارد؟',
      lab1: 'ثبتش می‌کنم؛ قدم‌به‌قدم در صفحهٔ خودش جلو می‌رویم. اول یک پرسش: فرض را بخش‌بخش جدا بنویس — هر بخش چه می‌گوید؟',
      lab2: 'روشِ گوسفندها را خودت به گندم بردی. صفحهٔ این مدخل هنوز در «فهم» است — حلت را آن‌جا ثبت کن و با «✅ حل شد» به بازنگری برو. یک پرسش: این سه جواب را وارسی کرده‌ای — هر سه را بر ۲۴ تقسیم کردی، یا از راهِ دیگری هم به همین سه می‌رسی؟',
      lab3: 'استدلالت حالا کامل‌تر است: هم مثالِ ردکننده برای ۵ جزء، هم دلیل برای مساوی‌ها. یک پرسشِ بازنگری: استدلال را در نقطه‌های حساسش وارسی کن — در گامِ حسابی-هندسی، همهٔ شرط‌هایش این‌جا برقرار است؟',
      lab4: 'صفحه همین را می‌پرسد. یک پرسش از همین فهرست: مسئلهٔ کمکیِ ساده‌تری هست — حالتِ خاص‌تر، کلی‌تر یا مشابه؟'
    };
    r.stage = 'chat';
    for (const k of Object.keys(M)) { await next(M[k]); await say('باشه، فکر می‌کنم: ' + k); }
    const q = r.qs = await cq(P); delete r.stage;
    chk(q.length === Object.keys(M).length, 'colon: one option per message (each has one question run) — ' + Object.keys(M).length + ' messages, got ' + q.length + ' ' + J(q));
    chk(one(q, 'پیش از رها کردنِ کلِ راه: کدام حلقه دقیقاً شکست؟') && !eq(q, 'کدام حلقه دقیقاً شکست؟'), 'colon A·F5 s06: the head «پیش از رها کردنِ کلِ راه:» stays with «کدام حلقه دقیقاً شکست؟» (L1a) ' + J(q));
    chk(one(q, 'پیش از اثبات، حالت‌های خاص و حدی را بیازما: مثالِ نقضی پیدا می‌شود؟') && !eq(q, 'مثالِ نقضی پیدا می‌شود؟'), 'colon A·F5 s10: «… حالت‌های خاص و حدی را بیازما:» stays with «مثالِ نقضی پیدا می‌شود؟» (L1a) ' + J(q));
    chk(starts(q, 'از آخر شروع کن: حکم برای n+1 چه می‌گوید'), 'colon C·U1 s25: «از آخر شروع کن:» (the heuristic itself) heads the option (L1a) ' + J(q));
    chk(starts(q, 'ده نمونه اثبات نیست: برهانش چیست') && !starts(q, 'برهانش چیست'), 'colon s25: «ده نمونه اثبات نیست:» stays; only the discourse «ولی» goes (L1a) ' + J(q));
    chk(one(q, 'حالا که گیر کرده‌ای: هنوز مطمئنی رخ در این مسئله بی‌ربط است؟'), 'colon s21: «حالا که گیر کرده‌ای:» stays (L1a) ' + J(q));
    chk(one(q, 'قیاس را به کار بردی: کجا این شباهت می‌شکند'), 'colon s23: «قیاس را به کار بردی:» stays (L1a) ' + J(q));
    chk(eq(q, 'فرض را بخش‌بخش جدا بنویس — هر بخش چه می‌گوید؟'), 'colon label: «اول یک پرسش:» is a bare label and is not part of the option (L1a) ' + J(q));
    chk(eq(q, 'این سه جواب را وارسی کرده‌ای — هر سه را بر ۲۴ تقسیم کردی، یا از راهِ دیگری هم به همین سه می‌رسی؟'), 'colon label: «یک پرسش:» is a bare label (L1a) ' + J(q));
    chk(eq(q, 'استدلال را در نقطه‌های حساسش وارسی کن — در گامِ حسابی-هندسی، همهٔ شرط‌هایش این‌جا برقرار است؟'), 'colon label: «یک پرسشِ بازنگری:» is a bare label (L1a) ' + J(q));
    chk(eq(q, 'مسئلهٔ کمکیِ ساده‌تری هست — حالتِ خاص‌تر، کلی‌تر یا مشابه؟'), 'colon label: «یک پرسش از همین فهرست:» is a bare label (L1a) ' + J(q));
  });

  // ================= mask — L1b: «؟۴۸۷؟» پایانِ جمله نیست =================
  await section('mask', async () => {
    const r = info.mask = {}; r.stage = 'mk';
    const P = await mk({ title: 'قیمت گوسفند در دفتر کاروانسرا', st: 'در دفتر نوشته «۳۶ رأس گوسفند: ؟۴۸۷؟ ریال» — رقمِ اول و آخر محو شده. قیمتِ هر گوسفند چقدر بوده؟', nat: 'objective' });
    await fresh('lprob', P);
    await next('این بازبیانِ خودت است: «کل بر ۳۶ بخش‌پذیر است» — داده‌ها همان ۳۶ و ؟۴۸۷؟ هستند و این، شرط است. شرط را می‌توانی به بخش‌هایش جدا بنویسی — و کدام بخش را اول، جدا، به کار می‌بری؟');
    await say('کل بر ۳۶ بخش‌پذیره.');
    await next('رقم‌های محوِ ؟۴۸۷؟ دو تا هستند — اولی و آخری را با کدام بخشِ شرط معین می‌کنی؟');
    await say('با بخش‌پذیری بر ۴ و ۹.');
    const q = r.qs = await cq(P); delete r.stage;
    chk(eq(q, 'شرط را می‌توانی به بخش‌هایش جدا بنویسی — و کدام بخش را اول، جدا، به کار می‌بری؟'), 'mask D·D1 s37: the faded-digit «؟» of «؟۴۸۷؟» is not a question end — the option is the clean «شرط را …؟» (L1b) ' + J(q));
    chk(!q.some(t => /…/.test(t)) && !q.some(t => /^«کل بر ۳۶/.test(t)), 'mask D·D1 s37: no fake run and no « … » join (L1b) ' + J(q));
    chk(eq(q, 'رقم‌های محوِ ؟۴۸۷؟ دو تا هستند — اولی و آخری را با کدام بخشِ شرط معین می‌کنی؟'), 'mask control: a question that carries the masked number inside it is one whole option (L1b) ' + J(q));
  });

  // ================= runs — L1c: دو رشتهٔ جدا دو گزینه؛ رشتهٔ پیوسته یک گزینه =================
  await section('runs', async () => {
    const r = info.runs = {}; r.stage = 'mk';
    const P = await mk({ title: 'پنج نقطه در مربعِ واحدِ شانزدهم', st: 'ثابت کن از هر پنج نقطه در مربعِ واحد، دو تا فاصله‌ای حداکثر √۲/۲ دارند.', kind: 'prove', nat: 'objective' });
    await fresh('lprob', P);
    const M = {
      s03: 'ایدهٔ کلیدی را خودت پیدا کردی، ولی «حل شد» را صفحه هنوز ندیده — هنوز «طرح‌ریزی» است. برهانی گفتی — از راهِ دیگری هم به همین حکم می‌رسی؟ وارسی‌اش کن: هر بخشِ فرض — پنج نقطه، ضلعِ ۱، «داخلِ مربع» — کجا به کار رفت و نتیجه دقیقاً همان حکم است؟ بعد در صفحه «✅ حل شد» و بازنگری.',
      cont: 'خودت پیدایش کردی: فرضِ «دو عدد» در صورت نبود. «۴ جزء بهترین است» حدس است، نه نتیجه — درست یا نادرستش را نمی‌گویم. چطور می‌آزمایی‌اش؟ با کدام وارسی یا حالتِ خاص؟',
      conn: '«فرض کنیم ممکن است…» برای کشف خوب بود، ولی برای توضیح گیج‌کننده است. استدلالت غیرمستقیم (خلف) بود — مستقیمش می‌کنی؟ یعنی بخشِ مثبتش را جدا بگو: هر چیدمانی حداکثر چند جفتِ عمه–پسرعموی کناری دارد، و قانون چند تا می‌خواهد؟',
      ana: 'قطرِ مربعِ کوچک را درست حساب کردی؟ این گامِ اصلی است. و آن را در کدام سطرِ برهانت نوشتی؟'
    };
    r.stage = 'chat';
    for (const k of Object.keys(M)) { await next(M[k]); await say('باشه: ' + k); }
    const q = r.qs = await cq(P); delete r.stage;
    chk(eq(q, 'برهانی گفتی — از راهِ دیگری هم به همین حکم می‌رسی؟'), 'runs A·F2 s03: «… از راهِ دیگری هم به همین حکم می‌رسی؟» is its own option (L1c) ' + J(q));
    chk(eq(q, 'وارسی‌اش کن: هر بخشِ فرض — پنج نقطه، ضلعِ ۱، «داخلِ مربع» — کجا به کار رفت و نتیجه دقیقاً همان حکم است؟'), 'runs A·F2 s03: the hypothesis-use check (the question that found her gap) can be chosen alone, with its head «وارسی‌اش کن:» (L1c + L1a) ' + J(q));
    chk(!q.some(t => t.indexOf('از راهِ دیگری هم به همین حکم') >= 0 && t.indexOf('کجا به کار رفت') >= 0), 'runs A·F2 s03: the two different look-back questions are never glued into one option (L1c) ' + J(q));
    // دورِ ۱۷ (RC2c): همان پیام حدس را نقل کرد («۴ جزء بهترین است» حدس است) ⇒ یادداشتِ مرجع از همان نقل
    // دورِ ۱۸ (RM4a): نقلِ پیامِ دستیار یادداشت نمی‌سازد — گزینه همان رشتهٔ یک‌پارچه، بی یادداشت
    chk(eq(q, 'چطور می‌آزمایی‌اش؟ با کدام وارسی یا حالتِ خاص؟'), 'runs control: one contiguous run stays ONE option (L1c; R18 no note from the assistant\'s quote) ' + J(q));
    chk(one(q, 'استدلالت غیرمستقیم (خلف) بود — مستقیمش می‌کنی؟', 'یعنی بخشِ مثبتش را جدا بگو: هر چیدمانی حداکثر چند جفت'), 'runs control: a run whose head starts with the connective «یعنی» stays with the previous run (L1c) ' + J(q));
    chk(one(q, 'قطرِ مربعِ کوچک را درست حساب کردی؟', 'و آن را در کدام سطرِ برهانت نوشتی؟') && !starts(q, 'و آن'), 'runs control: a second run that starts with «و آن» (anaphor/connective) joins the first (L1c) ' + J(q));
  });

  // ================= ref — L1d: مرجعِ «…اش»/«این حدس» از رکورد؛ گزینه‌ها از مسئله‌ای به دیگری نمی‌روند =================
  const notes = (q) => q.map(t => { const m = /\(حدسِ تو: «(.*)»\)$/.exec(t); return m ? m[1] : null; }).filter(x => x != null);
  await section('ref', async () => {
    const r = info.ref = {}; r.stage = 'mk1';
    const G1 = await mk({ title: 'زمانِ پختِ کیکِ بزرگ', st: 'دستورِ کیک برای قالبِ ۲۰ سانتی ۴۰ دقیقه است؛ برای قالبِ بزرگ‌تر زمانِ پخت چقدر است؟', nat: 'objective' });
    await fresh('lprob', G1);
    await next('به «🔭 مسئلهٔ حل‌نشدهٔ خودم» می‌رویم تا ثبتش کنیم. دربارهٔ ۱٫۷۵ داوری نمی‌کنم — فعلاً حدس است. یک پرسش: چطور می‌آزمایی‌اش — با کدام وارسی یا حالتِ خاص؟');
    await say('فکر کنم زمان ۱٫۷۵ برابر می‌شه.');
    await next('زمانِ پخت به کدام جزءِ قالب بند است — مساحتِ کف یا ضخامتِ خمیر؟');
    await say('فکر کنم ضخامت.');
    r.stage = 'u1'; await go('lprob', G1);
    await understand({ one: 'می‌خواهم زمانِ پختِ کیک در قالبِ بزرگ را بیابم', unk: 'زمانِ پخت', data: ['قالبِ ۲۰ سانتی ۴۰ دقیقه', 'مقدارها ۲٫۸ برابر شد'], cond: 'کیک نسوزد و خام نماند', guess: 'زمان ۱٫۷۵ برابر می‌شود', nat: 'objective' });
    r.stage = 'mk2';
    const G2 = await mk({ title: 'رخِ تزئینی در مسئلهٔ شطرنج', st: 'سفید در سه حرکت مات می‌کند؛ رخِ a1 در این مسئله چه نقشی دارد؟', nat: 'objective' });
    await fresh('lprob', G2);
    await next('باشه، جواب را نمی‌گویم. «رخ بی‌فایده است» را درست یا غلط نمی‌گویم — فعلاً حدس است. تو را به «🔭 مسئلهٔ حل‌نشدهٔ خودم» می‌برم تا ثبتش کنیم. یک پرسش: این حدس را چطور می‌آزمایی — با کدام وارسی یا حالتِ خاص؟');
    await say('فکر کنم رخ بی‌فایده است.');
    r.stage = 'u2'; await go('lprob', G2);
    await understand({ one: 'می‌خواهم مات در سه حرکت را بیابم', unk: 'سه حرکتِ مات', data: ['سفید شروع می‌کند', 'رخ در a1 است'], cond: 'مات در سه حرکت', guess: 'رخِ a1 بی‌فایده است', nat: 'objective' });
    const q1 = r.q1 = await cq(G1), q2 = r.q2 = await cq(G2); delete r.stage;
    // دورِ ۱۷ (RC2c، DECISIONS_R17): مرجع فقط از حدسی که **همان پیام** گفت — نه حدسِ ثبت‌شدهٔ رکورد (که این‌جا پس از پیام ثبت شد)
    // دورِ ۱۸ (RM4، DECISIONS_R18): یادداشت فقط با m.guess.q ِ مربی و حدسی که در پیامِ کاربر آمد — نقلِ خودِ دستیار (و حدسِ ثبت‌شدهٔ پس از پیام) نه
    chk(eq(q1, 'چطور می‌آزمایی‌اش — با کدام وارسی یا حالتِ خاص؟') && !notes(q1).length, 'ref C s23 (R18): no note from the assistant\'s own words; the meta head «یک پرسش:» still goes ' + J(q1));
    chk(eq(q2, 'این حدس را چطور می‌آزمایی — با کدام وارسی یا حالتِ خاص؟') && !notes(q2).length, 'ref C s21/s29 (R18): no note from the assistant\'s quote ' + J(q2));
    chk(eq(q1, 'زمانِ پخت به کدام جزءِ قالب بند است — مساحتِ کف یا ضخامتِ خمیر؟'), 'ref control: an option without a clitic/demonstrative referent is unchanged (L1d) ' + J(q1));
    chk(!has(q1, /رخ/) && !has(q2, /کیک|۱٫۷۵|ضخامت/), 'ref control: options never cross problems (each problem keeps its own questions and its own guess) ' + J({ q1, q2 }));
  });

  // ================= rep — L1e: پرسشِ تکراری به واژه‌های دیگر یک گزینه (تازه‌ترین) =================
  await section('rep', async () => {
    const r = info.rep = {}; r.stage = 'mk';
    const P = await mk({ title: 'بیشینهٔ حاصل‌ضرب با جمع ۱۰ ِ شانزدهم', st: 'عدد ۱۰ را به جمعِ چند عددِ مثبت بشکن که حاصل‌ضربشان بیشینه شود.', nat: 'objective' });
    await fresh('lprob', P);
    const M = [
      'پیش از سؤالِ بعد، مهم‌ترین بخشِ کار مانده: نگاه به راه‌حلِ تمام‌شده. می‌توانی نتیجه را وارسی کنی — و آیا همهٔ داده‌ها و کلِ شرطِ صورت در جوابت آمده‌اند؟',
      'داوری نمی‌کنم که درست است یا نه. وارسیِ عددی کردی؛ حالا نیمهٔ دیگرِ وارسی: صورت را دوباره بخوان — همهٔ داده‌ها و کلِ شرطِ صورت در جوابت آمده‌اند؟',
      'سرعتت خوب است؛ سؤالِ بعد پس از همین یک وارسی. صورت را کلمه‌به‌کلمه دوباره بخوان: هر چه صورت گفته — همهٔ داده‌ها و کلِ شرط — در جوابت به کار رفته؟',
      'برای ریاضیدانِ آینده مهم‌ترین بخشِ کار همین نگاه به راه‌حلِ تمام‌شده است، و هیچ مسئله‌ای کاملاً تمام نمی‌شود. همان پرسش از زاویهٔ دیگر: گامِ اولِ حلت را بنویس — آنجا چه چیزی را فرض کردی که صورت نگفته بود؟',
      'خودت پیدایش کردی: فرضِ «دو عدد» در صورت نبود. «۴ جزء بهترین است» حدس است، نه نتیجه — درست یا نادرستش را نمی‌گویم. چطور می‌آزمایی‌اش؟ با کدام وارسی یا حالتِ خاص؟',
      'استدلالت حالا کامل‌تر است: هم مثالِ ردکننده برای ۵ جزء، هم دلیل برای مساوی‌ها. یک پرسشِ بازنگری: استدلال را در نقطه‌های حساسش وارسی کن — در گامِ حسابی-هندسی، همهٔ شرط‌هایش این‌جا برقرار است؟',
      '«حل شد» را خودت با بازنگری می‌بندی، نه من. یک پرسشِ دیگر پیش از سؤالِ بعد: می‌توانی همین نتیجه را از راهِ دیگری به دست آوری — یا در یک نگاه ببینی چرا جزءها باید نزدیکِ هم باشند؟',
      'سریع، ولی یکی‌یکی. وارسی و نقطه‌های حساس را دیروز خودت انجام دادی. حالا: می‌توانی همین نتیجه را از راهِ دیگری به دست آوری — یا در یک نگاه ببینی چرا جزءها باید نزدیکِ هم باشند؟',
      'این همان «در یک نگاه» است — شکستنِ جزءِ بزرگ. «تموم» را خودت با بازنگری می‌بندی؛ یک پرسشِ دیگر: می‌توانی نتیجه یا روش را در مسئلهٔ دیگری به کار ببری — یک مسئلهٔ تازه بساز؟',
      'سه مسئلهٔ خوب ساختی — هر سه را ثبت کردم؛ سومی سخت است و همان‌جا می‌ماند تا بعداً سراغش بروی. یک پرسشِ دیگرِ بازنگری: این نوع مسئله برایت چطور بود — کدام بخشش را دوست داشتی و کدامش را نه؟',
      'درسِ دقیقی است: زود فرض کردن و کامل نخواندنِ صورت. بازنگری‌ات را با درس و وارسیِ خودت ثبت کردم؛ مسئله‌های تازه‌ات در «🔭» منتظرند. هر وقت خواستی بگو: این نوع مسئله را دوست داشتی یا نه؟'
    ];
    r.stage = 'chat';
    for (let i = 0; i < M.length; i++) { await next(M[i]); await say('جواب ' + (i + 1) + ': فکر کردم و نوشتم.'); }
    const q = r.qs = await cq(P); delete r.stage;
    chk(q.filter(t => /همهٔ داده‌ها و کلِ شرط/.test(t)).length === 1 && one(q, 'هر چه صورت گفته — همهٔ داده‌ها و کلِ شرط — در جوابت به کار رفته؟'), 'rep D·D2 s31: the three wordings of «همهٔ داده‌ها و کلِ شرط … در جوابت؟» are ONE option, the most recent wording (L1e) ' + J(q));
    // دورِ ۱۷ (RC2b): پرسشِ سلیقه پرسشِ بازنگریِ خودِ گفت‌وگوست و هرگز گزینه نیست (جای «یک گزینه، تازه‌ترین» ِ L1e)
    chk(q.filter(t => /این نوع مسئله/.test(t)).length === 0, 'rep D·D2 s31 → R17 RC2b: the taste questions are never options ' + J(q));
    chk(one(q, 'گامِ اولِ حلت را بنویس — آنجا چه چیزی را فرض کردی که صورت نگفته بود؟') && one(q, 'چطور می‌آزمایی‌اش؟ با کدام وارسی یا حالتِ خاص؟') && one(q, 'استدلال را در نقطه‌های حساسش وارسی کن') && one(q, 'می‌توانی همین نتیجه را از راهِ دیگری به دست آوری') && one(q, 'می‌توانی نتیجه یا روش را در مسئلهٔ دیگری به کار ببری'), 'rep control: different questions are never merged (L1e only on content-word subsets) ' + J(q));
    chk(q.length === 6, 'rep: 11 messages ⇒ 6 options (3 «همهٔ داده‌ها» ⇒ 1, 2 taste ⇒ 0 [R17 RC2b], the repeated «از راهِ دیگری» ⇒ 1) ' + J(q));
  });

  // ================= live — L2: پیامِ تازه وقتی بازنگری باز است =================
  await section('live', async () => {
    const r = info.live = {}; r.stage = 'mk';
    const P = await mk({ title: 'ضلع‌های مثلثِ شانزدهم', st: 'محیطِ مثلثی ۳۶ است؛ a دو برابرِ b و c سه واحد بیشتر از b است. ضلع‌ها چقدرند؟', nat: 'objective' });
    await fresh('lprob', P);
    await next('کدام ضلع را اول برحسبِ b می‌نویسی — و چرا همان؟'); await say('a را، چون دو برابرِ b است.');
    r.stage = 'u'; await go('lprob', P);
    await understand({ one: 'می‌خواهم سه ضلعِ مثلثی با محیطِ ۳۶ را بیابم', unk: 'a و b و c', data: ['محیط ۳۶ است', 'a دو برابرِ b است'], cond: 'a + b + c = 36', guess: 'b حدودِ هشت است', nat: 'objective' });
    r.stage = 'plan'; await savePlan('نخست هر ضلع را برحسبِ b می‌نویسم سپس در محیط جای‌گذاری می‌کنم');
    r.stage = 'step'; await go('lprob', P, 'exec'); await objStep('a = 2b و c = b + 3 پس 4b + 3 = 36 و b = 8.25', 'از داده‌ها و جای‌گذاری در محیط');
    r.stage = 'back'; await click('main .lp-solved');
    const o0 = r.before = await bestOpts();
    const pick = o0.find(t => /^💬 کدام ضلع را اول/.test(t));
    chk(!!pick, 'live setup: the earlier chat question is on the look-back list ' + J(o0));
    if (pick) await p.selectOption('#lpBBest', { label: pick });
    r.stage = 'chat';
    await next('جوابت را در شرط جای‌گذاری کن — a، b و c با هم دقیقاً ۳۶ می‌شوند؟ همهٔ شرط برقرار است؟');
    await say('بازنگری چی کار کنم؟');
    const o1 = r.after = await bestOpts();
    const v = await p.evaluate(() => { const s = document.getElementById('lpBBest'); return s ? s.options[s.selectedIndex].textContent : null; });
    r.sel = v; delete r.stage;
    chk(o1.includes('💬 جوابت را در شرط جای‌گذاری کن — a، b و c با هم دقیقاً ۳۶ می‌شوند؟ همهٔ شرط برقرار است؟'), 'live A·F3 s06/s10: a question the assistant asks while the look-back is open appears in #lpBBest at once, without leaving the page (L2) ' + J(o1));
    chk(v === pick, 'live A·F3: the option she had already picked stays picked after the list refreshes (L2) ' + J({ pick, v }));
    chk(o1.filter(t => /کدام ضلع را اول/.test(t)).length === 1, 'live: the refresh adds, it does not duplicate (L2) ' + J(o1));
  });

  // ================= kind — L3: گزینه‌های 📄 ِ فهم با برچسب‌های کارتی که دید =================
  await section('kind', async () => {
    const r = info.kind = {}; r.stage = 'mk';
    const P = await mk({ title: 'پنج نقطه در مربعِ واحدِ هفدهم', st: 'ثابت کن از هر پنج نقطه در مربعِ واحد، دو تا فاصله‌ای حداکثر √۲/۲ دارند.', kind: 'prove', nat: 'objective' });
    await fresh('lprob', P);
    await next('حکم (آنچه باید ثابت شود) چیست؟'); await say('دو نقطه با فاصلهٔ حداکثر √۲/۲.');
    r.stage = 'u'; await go('lprob', P);
    await understand({ one: 'می‌خواهم ثابت کنم دو نقطه از پنج نقطه نزدیک‌اند', unk: 'دو نقطه با فاصلهٔ حداکثر √۲/۲ هست', data: ['پنج نقطه داریم', 'نقطه‌ها داخل یا روی مرزِ مربعِ واحدند'], cond: 'برای هر چیدمان: دو نقطه با فاصلهٔ ≤ √۲/۲', nat: 'objective' });
    r.stage = 'plan'; await savePlan('مربع را به چهار مربعِ کوچک تقسیم می‌کنم و اصلِ لانهٔ کبوتری را به کار می‌برم');
    r.stage = 'step'; await go('lprob', P, 'exec'); await objStep('چهار مربعِ کوچک با ضلعِ ۱/۲؛ پنج نقطه ⇒ دو نقطه در یک مربعِ کوچک ⇒ فاصله ≤ قطرِ آن = √۲/۲', 'اصلِ لانهٔ کبوتری و قطرِ مربعِ کوچک');
    r.stage = 'back'; await click('main .lp-solved');
    const o = await bestOpts(); r.opts = o.map(t => t.slice(0, 90));
    const pg = o.filter(t => t.indexOf('💬') < 0);
    chk(pg.includes('حکم (آنچه باید ثابت شود) چیست؟') && pg.includes('فرض (آنچه داده شده) چیست؟') && pg.some(t => t.indexOf('حکم را به بخش‌هایش بشکن') === 0) && pg.some(t => t.indexOf('آیا همهٔ فرض لازم است؟') === 0), 'kind A·F1 s03: the understanding 📄 options are the prove card\'s own labels (حکم / فرض / بخش‌های حکم / «آیا همهٔ فرض لازم است؟») (L3) ' + J(r.opts));
    chk(!pg.some(t => /تعیینِ مجهول|^مجهول \(یا حکمی|^داده‌ها \(یا فرض\)|^شرط چیست/.test(t)), 'kind A·F1 s03: no generic find-list wording («مجهول/شرط») among the 📄 options of a prove problem (L3) ' + J(r.opts));
    chk(!o.some(t => /^💬 حکم \(آنچه باید ثابت شود\) چیست؟/.test(t)) && o.filter(t => /حکم \(آنچه باید ثابت شود\) چیست؟/.test(t)).length === 1, 'kind control: a page question answered on the page (and asked in chat) is ONE option, the page one — never a 💬 ' + J(r.opts));
    // s05: «اثبات یا رد کن» ِ زندگی — کارت «حکم/فرض» نشان داد و «فرضیه» واژهٔ مسئله است، نه «مجهول»
    r.stage = 'pod-mk';
    const PL = await mk({ title: 'ترفیع و مدیرِ شانزدهم', st: 'مدیرم عمداً جلوی ترفیعم را گرفته — اثبات یا رد کن.', kind: 'pod', nat: 'life' });
    r.stage = 'pod-u'; await go('lprob', PL);
    await understand({ one: 'می‌خواهم بدانم بدگمانی‌ام به مدیرم درست است', unk: 'مدیرم عمداً اسمم را پیشنهاد نکرده', data: ['پارسال مرا برای پروژهٔ مهم معرفی کرد', 'امسال ترفیع نگرفتم'], cond: 'شاهدِ واقعی داشته باشم', guess: 'مدیرم عمداً مخالفت کرده', nat: 'life' });
    r.stage = 'pod-plan'; await savePlan('نخست از منابعِ انسانی معیارِ ترفیع را می‌پرسم سپس با پیش‌بینی‌ام مقایسه می‌کنم');
    r.stage = 'pod-step'; await go('lprob', PL, 'exec'); await realStep('فردا از منابعِ انسانی معیارِ ترفیع را بپرسم', 'می‌گویند معیار دوره است');
    r.stage = 'pod-out'; await p.evaluate(x => { window.__day = x; }, D(1)); await go('lprob', PL, 'exec'); await outcome('پرسیدم؛ معیار گذراندنِ یک دوره بود');
    r.stage = 'pod-back'; await click('main .lp-solved');
    const ol = await bestOpts(); r.pod = ol.map(t => t.slice(0, 90)); delete r.stage;
    const pl = ol.filter(t => t.indexOf('💬') < 0);
    chk(pl.length > 0 && pl.includes('حکمی که باید درستی یا نادرستی‌اش را نشان بدهی چیست؟') && pl.includes('فرض (آنچه داده شده) چیست؟'), 'kind A·F1 s05: a life «اثبات یا رد کن» look-back offers the pod card\'s own labels (L3) ' + J(r.pod));
    chk(!pl.some(t => /مجهول/.test(t)), 'kind A·F1 s05: no 📄 option of a life hypothesis says «مجهول» (L3) ' + J(r.pod));
  });

  console.log(JSON.stringify(info).slice(0, 16000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
