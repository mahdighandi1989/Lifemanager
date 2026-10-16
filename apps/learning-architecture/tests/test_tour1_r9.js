// تورِ پولیا (دستهٔ ۱، دورِ ۹ ِ اصلاح، ۲۰۲۶-۱۰-۱۶) — اصلاح‌های دورِ ۹ (round9A–D) روی رابطِ واقعی.
// اصل: یک پرسش در هر نوبت؛ هر سطرِ پولیای دیگری «زمینه (نه پرسشِ دوم)»؛ پرسشی که پرسیده نشد هرگز «پرسیده‌شده» نیست.
//  mid     «میانهٔ راه» ِ مربی نه وقتی مسئلهٔ زنده دیگر «باز» نیست (بازنگری/بستن/ناتمام) (s06 p5، s30 p5، s35 p7)
//  a044    پیامی که خودش چند مجهولِ باز را با هم می‌خواهد و بلوک پرسشِ دیگری ندارد ⇒ پرسشِ نوبت A044 «کدام را اول می‌گشایی و چرا؟» (s17)؛
//          نه وقتی خودش ترتیب/حدس داده (s29) یا فقط مقدارهای خودش را می‌پرسد (s23)
//  ctx     B14 «سلیقه و درنگ»، A191 و A073 کنارِ پرسشِ نوبت «زمینه (نه پرسشِ دوم)» (s12 p1/p5، s21)
//  a129    لحظهٔ A129 («اقتدار ⇐ فراموشی») پیامِ آغاز نیست — فهرست پیشنهادش را دارد (s15 p1، s16 شبِ ۱)
//  prov    «گفتن سطل‌های آبی کمه» گزارش است نه ضرب‌المثل؛ «به قولِ معروف …» هست (s35x)
//  rel     «مسئلهٔ مرتبط — نتیجه یا روشش؟» دوباره پرسیده نمی‌شود وقتی آنچه در «پیش‌تر دیده‌ای؟» گفته در طرح آمده (s35x)
//  c107    «دامنه‌اش را تنگ کن» (C107) فقط برای حدسِ **ردشدهٔ** کلی؛ «قانونیِ» ِ حدسِ تازه ادعای کلی نیست (s22)
//  best    «کدام پرسش کمک کرد؟»: پرسشِ گفت‌وگو جای پرسشِ فهرستی که هرگز پرسیده نشد نمی‌نشیند (s28)
// همه از رابطِ واقعی (پنجرهٔ دستیار با مدلِ بدلیِ «میانگینِ لفظی»، فرم‌های «🔭»)؛ داوری روی پرامپتِ فرستاده‌شده و وضعِ صفحه. خطا ⇒ کدِ خروجِ غیرصفر.
// LLA_FILE = ساختِ دیگر (خطِ قرمز: ساختِ 936b50d)؛ ONLY=mid,a044 (نامِ بخش‌ها، با ویرگول) برای اجرای بخشی.
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
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
    await p.evaluate(() => APP.ASSIST.toggle(false)); await W(60);
  };
  const newSess = () => p.evaluate(() => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => (__calls[__calls.length - 1] || {}).user || '');
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const coachOf = (u) => block(u, '# مربیِ حل');
  const liveOf = (u) => block(u, '# مسئلهٔ زندهٔ این سشن');
  const phOf = (c) => (/مرحلهٔ محتمل: ([^·—(]+?)\s*(?:·|—|\()/.exec(c) || [])[1] || '';
  const sugOf = (c) => (/پیشنهادِ این نوبت: «([^»]+)»/.exec(c) || [])[1] || '';
  const next = (reply) => p.evaluate(reply => __q.push(R({ reply })), reply);
  const has = (c, ids) => ids.every(id => c.indexOf(id) >= 0);
  const first = async (msg) => { await newSess(); await say(msg); return coachOf(await lastUser()); };
  const lineOf = (c, re) => (c.split('\n').filter(l => re.test(l))[0] || '');
  const isCtx = (l) => /^- زمینه \(نه پرسشِ دوم\)/.test(l);
  // «یک پرسش» ِ بلوکِ مسئلهٔ زنده ⇒ متنِ پرسشِ نوبت
  const turnQ = (u) => { const bl = liveOf(u); const m = /نپرس\): «(.*)»\. اگر/.exec(bl) || /پرسشِ پیشنهادیِ این نوبت: «(.*)»\. اگر/.exec(bl); return m ? m[1] : ''; };
  // مسئلهٔ زندهٔ ساخته در صفحه (فهم ثبت ⇒ مرحلهٔ طرح)، و سشنی که روی صفحه‌اش با دستیار حرف می‌زند
  const mk = async (o) => { await go('e_prob', null, 'live'); await p.fill('#lpNewT', o.title); await p.fill('#lpNewS', o.st); await W(60); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return p.evaluate(() => APP.state.arg); };
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
    await click('main .lp-usave'); if (await hasEl('main .lp-u .sv-g2')) await click('main .lp-u .sv-g2');
    if (beforeSave) { await beforeSave(); await click('main .lp-usave'); if (await hasEl('main .lp-u .sv-g2')) await click('main .lp-u .sv-g2'); }
  };
  const savePlan = async (plan) => { await p.selectOption('#lpMv', 'mv_special').catch(() => {}); await fillIf('#lpMvWhy', 'اول فقط یک حالت را دقیق می‌بینم تا دامنه تنگ شود'); if (await hasEl('main .lp-mvadd')) await click('main .lp-mvadd');
    await p.fill('#lpPlan', plan); await W(350);
    for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); }
    await click('main .lp-plansave'); };
  const realStep = async (text, pred) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); await p.fill('#lpPred', pred); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا'); await click('main .lp-stepsave'); };
  const outcome = async (o) => { await sel('#lpODone', o.done || 'yes'); await p.fill('#lpOWhat', o.what); if (await hasEl('#lpOMatch')) await sel('#lpOMatch', o.match || 'yes'); await sel('#lpOProg', o.prog || 'کمی'); await sel('#lpOWant', 'same'); if (await hasEl('#lpOGuess')) await sel('#lpOGuess', o.grel || 'none'); if (o.more) await o.more(); await click('main .lp-outsave'); };
  const pageSess = async (pid) => { await go('lprob', pid); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; }); };
  const pracFrame = async () => {
    await sel('#lpDE_d1', 'big'); await sel('#lpDE_d2', 'big');
    await p.fill('#lpPrVague', '«کم بود» یعنی دفتر بیش از پولِ صندوق نشان داد'); await p.fill('#lpPrLine', 'فقط همان عصر را می‌سنجم، روزهای دیگر را بیرون می‌گذارم');
    await p.fill('#lpPrApprox', 'دقتِ صد هزار تومان بس است'); await p.fill('#lpPrPrior', 'پارسال هم یک خریدِ ثبت‌نشده بود'); await p.fill('#lpPrMeasure', 'کمبود = دفتر − پولِ صندوق ≥ ۳ میلیون تومان');
    if (await hasEl('#lpGWant')) await sel('#lpGWant', 'فرقی نمی‌کند');
  };

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  // ================= mid — مسئلهٔ زنده در بازنگری =================
  await section('mid', async () => {
    const r = info.mid = {}; r.stage = 'mk';
    await day(0);
    const P = await mk({ title: 'قفسهٔ انباری', st: 'می‌خواهم انباریِ ۴ متری را طوری قفسه بزنم که همهٔ جعبه‌ها جا شوند؛ چند طبقه و کجا؟', nat: 'life' });
    await understand({ one: 'دنبالِ چیدمانِ قفسهٔ انباری هستم', unk: 'چیدمانِ قفسه', data: ['انباری ۴ متر است', 'بیست جعبه داریم'], cond: 'همهٔ جعبه‌ها جا شوند', guess: 'سه طبقه کنارِ دیوارِ بلند', nat: 'life' });
    r.stage = 'plan'; await savePlan('نخست جعبه‌ها را می‌شمارم سپس سه طبقه کنارِ دیوارِ بلند می‌زنم');
    r.stage = 'step'; await realStep('فردا جعبه‌ها را بشمارم و سه طبقه بزنم', 'همهٔ جعبه‌ها جا می‌شوند');
    await day(1); await go('lprob', P, 'exec');
    r.stage = 'out'; await outcome({ what: 'سه طبقه زدم و همهٔ جعبه‌ها جا شدند', match: 'yes' });
    r.stage = 'solved'; await click('main .lp-solved');
    r.state = await p.evaluate(pid => (APP.liveClosure(pid) || {}).state, P);
    r.stage = 'chat'; await day(10); await pageSess(P);
    await say('تموم شد، همه چیز جا شد. حالا برای بازنگری چی کار کنم؟');
    const u = await lastUser(), c = coachOf(u);
    r.d10 = { coachMid: /^- میانهٔ راه/m.test(c), tq: turnQ(u).slice(0, 90) };
    delete r.stage;
    chk(r.state && r.state !== 'open' && !!r.d10.tq, 'mid setup: after «✅ حل شد» the live problem is past «open» and the live block has its own (look-back) turn question ' + JSON.stringify(r));
    chk(!r.d10.coachMid, 'mid: on day 10 a problem in «' + r.state + '» gets NO coach «میانهٔ راه … به‌جای پرسشِ مرحله» line beside the page\'s look-back turn question (s06 p5, s30 p5, s35 p7) ' + JSON.stringify(r));
  });

  // ================= a044 — پرسشِ نوبت وقتی همین پیام چند مجهولِ باز را با هم می‌خواهد =================
  await section('a044', async () => {
    const r = info.a044 = {};
    const c17 = await first('می‌خوام آب بارون پشت‌بوم انبار رو جمع کنم برای آبیاری قطره‌ای تابستون باغ پسته. مخزن چقدر بزرگ بسازم؟ بتنی بسازم یا پلاستیکی بخرم؟ کجا بذارم؟ هر سه رو با هم بگو.');
    const l17 = lineOf(c17, /A044/);
    r.s17 = { sug: sugOf(c17).slice(0, 90), turn: /^- \*\*پرسشِ این نوبت همین است:\*\*/.test(l17), ctx: isCtx(l17) };
    chk(/کدام را اول می‌گشایی/.test(r.s17.sug) && r.s17.turn && !r.s17.ctx, 'a044: «مخزن چقدر…؟ … کجا بذارم؟ هر سه رو با هم بگو» ⇒ the turn suggestion IS the A044 question «کدام را اول می‌گشایی و چرا؟» and the A044 line says it is the turn question (s17) ' + JSON.stringify(r.s17));
    // کنترل: خودش حدس زد و ترتیب گذاشت (s29) / فقط مقدارهای خودش را پرسید (s23) ⇒ A044 زمینه، پرسشِ نوبت از فهرست (DECISIONS_R8 I-coach 3)
    const c29 = await first('۴۰ متر لبه‌ی سنگی دارم برای یه باغچه‌ی چهارضلعی. بزرگ‌ترین باغچه چه شکلیه؟ به نظرم مستطیل باریک و بلند چون جای گل بیشتر داره. بعد هم می‌خوام یه حوض گرد بذارم که به سه تا مسیر باغ مماس باشه، جای مرکزشو چطوری پیدا کنم؟ اول باغچه رو ثبت کن.');
    const c23 = await first('کیک رو پختم و خوب شد! ولی زمان پختو نمی‌دونستم، دستور مادرم ۳۵ دقیقه بود. زمان پخت هم ۲.۸ برابر میشه؟ یعنی ۱۰۰ دقیقه؟ ۸ تا تخم‌مرغ زدم یا ۹ بهتر بود؟');
    r.ctl = { s29: isCtx(lineOf(c29, /A044/)), s29sug: sugOf(c29).slice(0, 40), s23: isCtx(lineOf(c23, /A044/)), s23sug: sugOf(c23).slice(0, 40) };
    chk(r.ctl.s29 && r.ctl.s23 && r.ctl.s29sug && r.ctl.s23sug && !/کدام را اول/.test(r.ctl.s29sug + r.ctl.s23sug), 'a044: control — he ordered/guessed himself (s29) or only asks about his own values (s23) ⇒ A044 stays «زمینه (نه پرسشِ دوم)» beside the list suggestion ' + JSON.stringify(r.ctl));
  });

  // ================= ctx — B14، A191، A073 کنارِ پرسشِ نوبت =================
  await section('ctx', async () => {
    const r = info.ctx = {};
    // B14 در «طرح» (s12 p5: نوبتِ رد ⇒ طرح؛ پرسشِ نوبت B231)
    await newSess();
    await say('جدول امروز: «از جلو و عقب یکی است، در دریا راه می‌رود» — ۵ حرفی. و یه افقی دیگه: حروف «ر ا ت س م ن ه ب» رو مرتب کن، یه کلمه ۸ حرفی. نیم ساعته موندم. شما که ماشینی، بگو.');
    const c1 = coachOf(await lastUser());
    await say('با املا: ناوبان برعکسش نابوان میشه، نه. پس باید اول پالیندروم‌های پنج حرفی رو بشمارم بعد ببینم کدوم دریاییه. «ناخدا» نه... «تخت»؟ نه... آهان! پیداش کردم، با «ا» هم درمیاد. حالا آناگرام. فکر کنم آخرش «ستان» باشه.');
    await say('ر م ه ب ... رمهب‌ستان؟ نه. اشتباه بود. پس «ستان» نیست. اعصابم خورد شد، نیم ساعت دیگه هم رفت.');
    const c5 = coachOf(await lastUser()), b14 = lineOf(c5, /سلیقه و درنگ \(B14\)/);
    r.b14 = { ph: phOf(c5), has: !!b14, ctx: isCtx(b14), turnB231: /پرسشِ این نوبت همین است/.test(lineOf(c5, /B231/)) };
    chk(r.b14.has && r.b14.ctx && r.b14.turnB231, 'ctx: B14 «سلیقه و درنگ … بپرس» is «زمینه (نه پرسشِ دوم)» beside the refutation turn question B231 (s12 p5) ' + JSON.stringify(r.b14));
    // A073 «فقط جواب» در گشایشی که پیشنهادِ فهرست دارد (s12 p1)
    const ans = lineOf(c1, /«فقط جواب» خواست/);
    r.only = { has: !!ans, ctx: isCtx(ans), sug: sugOf(c1).slice(0, 40) };
    chk(r.only.has && r.only.sug && r.only.ctx, 'ctx: the A073 «فقط جواب» line is «زمینه (نه پرسشِ دوم)» beside the list suggestion (s12 p1) ' + JSON.stringify(r.only));
    // A073 «چرا …؟» در گشایش با پیشنهادِ فهرست
    const cw = await first('چرا وقتی بطری آب پر رو تو فریزر گذاشتم ترکید ولی بطری نیمه‌پر سالم موند؟');
    const why = lineOf(cw, /«چرا …؟» پرسید/);
    r.why = { has: !!why, ctx: isCtx(why), sug: sugOf(cw).slice(0, 40) };
    chk(r.why.has && r.why.sug && r.why.ctx, 'ctx: the A073 «چرا …؟ — حدسِ خودش را بپرس» line is «زمینه (نه پرسشِ دوم)» beside the list suggestion ' + JSON.stringify(r.why));
    // A191 در معرفیِ مسئله با پیشنهادِ فهرست (s21)
    const c21 = await first('سلام. من بردیا هستم ۱۲ سالمه، تیم شطرنج مدرسه. مسئله: سفید بازی می‌کند و در دو حرکت مات می‌کند. FEN: 5k2/8/5K2/8/8/8/8/R2Q4 w - - 0 1 . من کیش با وزیر رو زدم ولی شاه فرار می‌کنه. یه رخ سفید گوشه‌ی صفحه هست که اصلاً نمی‌دونم چرا اونجاست.');
    const a191 = lineOf(c21, /A191/);
    r.a191 = { has: !!a191, ctx: isCtx(a191), sug: sugOf(c21).slice(0, 40) };
    chk(r.a191.has && r.a191.sug && r.a191.ctx, 'ctx: A191 «اول کل را ببین» is «زمینه (نه پرسشِ دوم)» beside the list suggestion (s21 p1) ' + JSON.stringify(r.a191));
  });

  // ================= a129 — نه در پیامِ آغاز =================
  await section('a129', async () => {
    const r = info.a129 = {};
    const f = (c) => ({ a129list: /بازنگریِ او دربارهٔ یاد دادن/.test(c), sug: sugOf(c).slice(0, 40) });
    r.s15 = f(await first('شاگردام سر مسئله‌ها ساکت می‌مونن. من هم آخرش خودم حل می‌کنم روی تخته. یه همکار گفت «سؤال بپرس» ولی سؤال‌های من یا جوابو لو میده یا کسی جواب نمیده. چیکار کنم؟'));
    r.s16 = f(await first('دخترم یه مسئله داره: «باغچه‌ای مستطیلی دورش ۲۴ متر حصار داره، طولش دو برابر عرضشه، طول و عرض چقدره؟» خودم بلدم، فقط بگو چطوری بهش بگم که زود تموم شه بریم بخوابیم.'));
    chk(!r.s15.a129list && !r.s16.a129list && !!r.s15.sug && !!r.s16.sug, 'a129: an OPENING message (teacher s15 p1, parent s16 night 1) keeps its list suggestion — no «این نوبت پیشنهادی… بازنگریِ او دربارهٔ یاد دادن» (that is the later reflective turn) ' + JSON.stringify(r));
  });

  // ================= prov — «گفتن» گزارش است، نه ضرب‌المثل =================
  await section('prov', async () => {
    const r = info.prov = {}; r.stage = 'mk';
    await day(0);
    const P = await mk({ title: 'تفکیکِ کوچه', st: 'می‌خواهم تفکیکِ زباله در کوچه‌مان بعد از ماهِ اول هم بماند.', nat: 'life' });
    await understand({ one: 'می‌خواهم تفکیک پایدار بماند', unk: 'راهی که تفکیک بماند', data: ['بارِ اول کسی مسئولِ جمع‌آوری نبود', 'سطل‌ها کم بود'], cond: 'بی بودجهٔ تازه', guess: 'مسئولِ کوچه لازم است', nat: 'life' });
    r.stage = 'plan'; await savePlan('نخست برای هر کوچه یک مسئول می‌گذاریم سپس سطل‌ها را می‌شماریم');
    r.stage = 'chat'; await pageSess(P);
    await say('سلام. امروز با دو تا از همسایه‌ها حرف زدم؛ گفتن سطل‌های آبی کمه و پر میشه. بعدش چی کار کنم؟');
    const u1 = await lastUser(); r.live = !!liveOf(u1); r.said = /ضرب‌المثلِ خودش/.test(u1);
    await say('به قولِ معروف کار از محکم‌کاری عیب نمی‌کنه؛ می‌خوام دو تا سطل اضافه بذارم.');
    r.marker = /ضرب‌المثلِ خودش/.test(liveOf(await lastUser())); delete r.stage;
    chk(r.live && !r.said, 'prov: «گفتن سطل‌های آبی کمه» (a neighbour\'s report) is not read as his own proverb — no «ضرب‌المثل … درست است یا ضدش» ask (s35x) ' + JSON.stringify(r));
    chk(r.marker, 'prov: control — «به قولِ معروف …» is still his proverb (C150) ' + JSON.stringify(r));
  });

  // ================= rel — مسئلهٔ مرتبطی که در طرح به کار رفته =================
  await section('rel', async () => {
    const r = info.rel = {}; r.stage = 'mk';
    await day(0);
    const P = await mk({ title: 'تفکیکِ محله', st: 'می‌خواهم تفکیکِ زباله در محله‌مان این بار بعد از ماهِ اول بماند.', nat: 'life' });
    await understand({ one: 'می‌خواهم تفکیک در محله بماند', unk: 'روشی که تفکیک بماند', data: ['بارِ اول کسی مسئولِ جمع‌آوری نبود', 'سطل‌ها دزدیده شد'], cond: 'بی بودجهٔ تازه', guess: 'مسئولِ کوچه لازم است', nat: 'life' });
    r.stage = 'seen';
    if (!await hasEl('#lpSeen')) await go('lprob', P, 'plan');
    await sel('#lpSeen', 'yes'); await sel('#lpSeenS', 'method');
    await p.fill('#lpSeenW', 'محلهٔ ولیعصر با مسئولِ هر کوچه و جمع‌آوریِ هفتگی تفکیک را نگه داشت'); await click('main .lp-seensave');
    r.stage = 'plan';
    await savePlan('روشِ محلهٔ ولیعصر: برای هر کوچه یک مسئول و جمع‌آوریِ هفتگی می‌گذاریم سپس سطل‌ها را زنجیر می‌کنیم');
    r.seen = await p.evaluate(pid => { const L = (((APP.S.get('eprog_' + pid) || {}).solve || {}).live || {}); return L.seen ? L.seen.ans : null; }, P);
    r.ph = await p.evaluate(pid => APP.livePhase(pid), P);
    r.stage = 'chat'; await pageSess(P);
    const qs = [];
    await say('نمی‌دونم از کجا شروع کنم. گیر کردم.'); qs.push(turnQ(await lastUser()));
    await say('هنوز نمی‌دونم. گیرم.'); qs.push(turnQ(await lastUser()));
    await say('باز هم گیر کردم، جلو نمی‌رم.'); qs.push(turnQ(await lastUser()));
    r.qs = qs.map(q => q.slice(0, 80)); delete r.stage;
    chk(r.seen === 'yes' && qs.every(Boolean), 'rel setup: «پیش‌تر دیده‌ای؟ — بله» recorded and every stuck turn has a turn question ' + JSON.stringify(r));
    chk(!qs.some(q => /مسئلهٔ مرتبطِ حل‌شده داری|نتیجه‌اش را به کار می‌گیری یا روشش/.test(q)), 'rel: the related-problem question «نتیجه‌اش یا روشش؟» is not asked once the method he named («ولیعصر … مسئولِ هر کوچه») is already in his plan (s35x) ' + JSON.stringify(r));
  });

  // ================= c107 — فقط حدسِ ردشده؛ «قانونیِ» واژهٔ کلی نیست =================
  await section('c107', async () => {
    const r = info.c107 = {}; r.stage = 'mk';
    await day(0);
    const P = await mk({ title: 'کمبودِ صندوقِ مدرسه', st: 'صندوقِ مدرسه عصر ۳ میلیون کم بود؛ می‌خواهم بفهمم چه شد.', nat: 'practical' });
    await understand({ one: 'دنبالِ علتِ کمبودِ صندوق هستم', unk: 'علتِ کمبود', data: ['عصر صندوق ۳ میلیون کمتر بود', 'سرایدار دیر رفت'], cond: 'علت را با شاهد بیابم', guess: 'کارِ سرایدار است', nat: 'practical' }, pracFrame);
    r.stage = 'plan'; await fillIf('#lpPlan2', 'اگر دفتر و رسیدها جور بود، از خزانه‌دار می‌پرسم');
    await savePlan('نخست دفترِ صندوق را با رسیدها می‌سنجم سپس از سرایدار می‌پرسم');
    r.stage = 'step'; await realStep('فردا دفترِ صندوق را با رسیدها بسنجم', 'رسیدها کمتر از دفتر است');
    await day(1); await go('lprob', P, 'exec');
    r.stage = 'out';
    await outcome({ what: 'رسیدها با دفتر جور بود؛ یک برداشتِ قانونیِ ثبت‌نشده بود', match: 'no', grel: 'refute', more: async () => {
      await fillIf('#lpOReflect', 'حدسم را کنار می‌گذارم چون دفتر چیزِ دیگری نشان داد');
      if (await hasEl('#lpONewG')) { await sel('#lpONewG', 'yes'); await fillIf('#lpONewGT', 'کمبود همان برداشتِ قانونیِ ثبت‌نشده است'); await selIf('#lpONewGC', '60'); await fillIf('#lpONewGTest', 'دفترِ بانک را می‌بینم'); await fillIf('#lpONewGIf', 'دوباره می‌گردم'); }
    } });
    const g = await p.evaluate(pid => { const so = (APP.S.get('eprog_' + pid) || {}).solve || {}; const g1 = so.g && so.g[1]; return { guess: g1 && g1.guess, prev: g1 && g1.prev, pl: APP.livePlausible(pid) }; }, P);
    r.g = { guess: String(g.guess || '').slice(0, 50), prev: g.prev, refutedG: g.pl.refutedG, refuted: g.pl.refuted };
    r.stage = 'chat'; await pageSess(P);
    await say('دفتر رو با رسیدها سنجیدم. رسیدها جور بود، یه برداشت قانونی ثبت نشده بود. پس حدسم غلط بود.');
    const u = await lastUser(); r.c107 = has(u, ['C107']); delete r.stage;
    chk(/قانونیِ/.test(r.g.guess) && r.g.refuted > 0, 'c107 setup: «کارِ سرایدار است» refuted on the page and replaced by a new guess containing «قانونیِ» ' + JSON.stringify(r));
    chk(!r.c107, 'c107: no «دامنه‌اش را تنگ کن» (C107) — the refuted guess «کارِ سرایدار است» is a one-off hypothesis, and «قانونیِ» in the NEW guess is an adjective, not a general law (s22) ' + JSON.stringify(r));
  });

  // ================= best — نگاشتِ دوسویهٔ پرسشِ گفت‌وگو =================
  await section('best', async () => {
    const r = info.best = {};
    await day(0);
    const P = await mk({ title: 'معمای دو بچه', st: 'خانواده‌ای دو بچه دارد و دست‌کم یکی پسر است. احتمالِ اینکه هر دو پسر باشند چقدر است؟', nat: 'objective' });
    await pageSess(P);
    await next('طرفِ هیچ‌کدام را نمی‌گیرم. پیش از عددها، اول کلِ معما: آن را در یک جمله با زبانِ خودت دوباره بگو — دقیقاً چه چیزی داده شده و چه خواسته شده؟');
    await say('من می‌گم ۱/۲ ئه، همکارم می‌گه ۱/۳. کدوم درسته؟');
    r.qs = await p.evaluate(pid => APP.liveChatQs(pid), P);
    chk(r.qs.length > 0, 'best setup: the assistant\'s question was recorded for «کدام پرسش کمک کرد؟» ' + JSON.stringify(r));
    chk(!r.qs.some(t => /دادهٔ دیگری لازم است/.test(t)), 'best: «دقیقاً چه چیزی داده شده و چه خواسته شده؟» is NOT replaced by the never-asked list question «دادهٔ دیگری لازم است — چه چیزی را باید بپرسی…» (only >½ of BOTH sides\' words map) (s28) ' + JSON.stringify(r));
  });

  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 12000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
