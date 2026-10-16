// تورِ پولیا (دستهٔ ۱، دورِ ۷ ِ اصلاح، ۲۰۲۶-۱۰-۱۶) — سهمِ «coach» از DECISIONS_R7 (H1: دقتِ نشانه‌های نوبت).
// اصل: نشانه‌ای که پرسشِ نوبت را **جایگزین** می‌کند باید شاهدِ مثبتِ همان کار از **خودِ کاربر** در **همین پیام** داشته باشد (نه متنِ نقل‌شده/نقش‌آفرینی).
//  guess    «…یا نه؟» ِ پرسشِ تصمیمِ خودش حدس نیست (s01، s02)؛ «فکر کنم آخرش «ستان» باشه» حدس است (s12)؛ خودوارسیِ معلم «باز لو دادم نه؟» حدس نیست (s15)
//  abandon  turn.abandon و turn.text به A.liveCoach ⇒ «پیش از رها کردن…» در گفت‌وگو (s04، s06)؛ رها کردنِ نقل‌شده نه
//  fresh    یافتهٔ تازه («پس … هیچ‌جا استفاده نکرده!»، «پیدا شد») گیرِ حمل‌شده را پاک می‌کند (s33)؛ «# پس از شکست» نه در نوبتِ موفقیت (s12)
//  why      A073 نه روی «چرا»ی خودپاسخ (s31)، نه روی نوبتی که خودش حدس است (s14)؛ در قابِ پدر/معلم A129 بر A073 مقدم (s16)؛ TA_RE «من گفتم/چون من باباشم»
//  a191     نه روی پیامِ سلیقه (s31 هفتهٔ ۴)؛ ابعاد و بازه‌ها («۱۰×۱۰»، «۵۰-۱۰۰») داده‌اند نه فرمولِ خودش (s11، s13)
//  a263     نه روی «حالت کلی» ِ جملهٔ گیر (s38)؛  b162 روی شمارِ شاهد «۳۸ تاش جور درمیاد» (s20)؛  claim «راست میگی» ادعا نیست (s11)
//  result   «پس + عدد» پیش از فهمِ مسئله نتیجه نیست (s28)؛ «X تموم شد. حالا Y» / «پیداش کردم … حالا Y» مسئلهٔ تازه از فهم (s29، s12)
//  a044     «چطوری…؟»، «چه شکلیه؟» و پرسشِ بله/نهِ کمیت (s23، s29)؛  plan27  «با معنی سوم کار می‌کنم … این شرط» هنوز فهم (s27)
//  refday   سطرهای رد فقط همان روزِ رد (s19)؛ C107 نه برای فرضیهٔ یک‌بارهٔ زندگی (s05)
//  goal     🎯 آخرین بازگوییِ مجهول به حرفِ خودش (s18)؛ نوبتِ varEq همان‌دم اجراست؛  nat  قالبِ live_new با "nat" (s19)
// همه از رابطِ واقعی (پنجرهٔ دستیار با مدلِ بدلیِ «میانگینِ لفظی»، کنش‌های مدل، فرم‌های «🔭»). خطا ⇒ کدِ خروجِ غیرصفر.
// LLA_FILE = ساختِ دیگر (خطِ قرمزِ پیش از اصلاح)؛ ONLY=guess,abandon (نامِ بخش‌ها، با ویرگول) برای اجرای بخشی.
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
    // هر فراخوانِ liveCoach با نشانه‌های نوبت ضبط می‌شود (رفتار دست نمی‌خورد)
    const orig = APP.liveCoach; window.__lc = [];
    APP.liveCoach = function (pid, opts) { if (opts && opts.turn) window.__lc.push(Object.assign({ pid }, JSON.parse(JSON.stringify(opts.turn)))); return orig.apply(this, arguments); };
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
  const newSess = () => p.evaluate(() => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => (__calls[__calls.length - 1] || {}).user || '');
  const lastTurn = () => p.evaluate(() => __lc[__lc.length - 1] || null);
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const coachOf = (u) => block(u, '# مربیِ حل');
  const liveOf = (u) => block(u, '# مسئلهٔ زندهٔ این سشن');
  const oneOf = (u) => (/^- در این نوبت فقط \*\*یک\*\* پرسش[^\n]*$/m.exec(liveOf(u)) || [''])[0];
  const phOf = (c) => (/مرحلهٔ محتمل: ([^·—(]+?)\s*(?:·|—|\()/.exec(c) || [])[1] || '';
  const sugOf = (c) => (/پیشنهادِ این نوبت: «([^»]+)»/.exec(c) || [])[1] || '';
  const next = (reply, st) => p.evaluate(([reply, st]) => __q.push(R({ reply, actions: st ? [Object.assign({ do: 'coach_state' }, st)] : [] })), [reply, st || null]);
  const act = (o) => p.evaluate(o => __q.push(R(o)), o);
  const ST = (o) => Object.assign({ ph: 'u', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' }, o);
  const has = (c, ids) => ids.every(id => c.indexOf(id) >= 0);
  const GUESS_LINE = /همین پیام حدس است/;
  const WHY_LINE = /«چرا …؟» پرسید/;
  const first = async (msg) => { await newSess(); await say(msg); return coachOf(await lastUser()); };
  const pair = async (open, msg, pre) => { await newSess(); if (pre) await next('بگو.', pre); await say(open); await say(msg); return coachOf(await lastUser()); };
  // مسئلهٔ زندهٔ ساخته در صفحه (فهم ثبت ⇒ مرحلهٔ طرح)، و سشنی که روی صفحه‌اش با دستیار حرف می‌زند
  const mk = async (o) => { await go('e_prob', null, 'live'); await p.fill('#lpNewT', o.title); await p.fill('#lpNewS', o.st); await W(60); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return p.evaluate(() => APP.state.arg); };
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
  const savePlan = async (plan) => { await p.selectOption('#lpMv', 'mv_special').catch(() => {}); await fillIf('#lpMvWhy', 'اول فقط یک حالت را دقیق می‌بینم تا دامنه تنگ شود'); if (await hasEl('main .lp-mvadd')) await click('main .lp-mvadd');
    await p.fill('#lpPlan', plan); await W(350);
    for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); }
    await click('main .lp-plansave'); };
  const realStep = async (text, pred) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); await p.fill('#lpPred', pred); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا'); await click('main .lp-stepsave'); };
  const outcome = async (o) => { await sel('#lpODone', o.done || 'yes'); await p.fill('#lpOWhat', o.what); if (await hasEl('#lpOMatch')) await sel('#lpOMatch', o.match || 'yes'); await sel('#lpOProg', o.prog || 'کمی'); await sel('#lpOWant', 'same'); if (await hasEl('#lpOGuess')) { await sel('#lpOGuess', o.grel || 'none'); if (o.grel === 'refute') { await p.fill('#lpOReflect', 'حدسم را کنار می‌گذارم چون شمارش چیزِ دیگری نشان داد'); if (await hasEl('#lpONewG')) await sel('#lpONewG', 'no'); } } await click('main .lp-outsave'); };
  const pageSess = async (pid) => { await go('lprob', pid); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; }); };

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  // ================= guess — شاهدِ مثبتِ حدس از خودِ کاربر =================
  await section('guess', async () => {
    const g = info.guess = {};
    // پرسشِ تصمیمِ خودش با «…یا نه؟» حدس نیست (s01، s02) ⇒ نخستین پرسش «مجهول چیست؟»، نه «چطور می‌آزمایی‌اش؟»
    const c01 = await first('سلام. سه ماهه دارم فایل اکسل پر می‌کنم که خونه بخرم یا اجاره‌نشین بمونم. ۴۷ تا ستون داره: نرخ تورم، قیمت متری محله‌ها، وام، اجاره، فاصله تا مهدکودک، ... هر روز یه ستون اضافه می‌کنم و هیچ تصمیمی نمی‌گیرم. فقط بگو بخرم یا نه؟');
    const c02 = await first('یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟ زود بگو مشتری منتظره.');
    g.s01 = { guess: GUESS_LINE.test(c01), sug: sugOf(c01).slice(0, 40) }; g.s02 = { guess: GUESS_LINE.test(c02), sug: sugOf(c02).slice(0, 40) };
    chk(!g.s01.guess && !/می‌آزمایی/.test(g.s01.sug) && !g.s02.guess && !/می‌آزمایی/.test(g.s02.sug), 'guess: «…بخرم یا نه؟» / «…جا میشه یا نه؟» (a question about his own decision, with numbers) is NOT a guess (s01, s02) ' + JSON.stringify(g));
    // قابِ معلم: خطِ نقش‌آفرینیِ نقل‌شده + «باز لو دادم نه؟» ⇒ بازخوردِ نردبانِ سرنخ، نه حدس (s15)
    await newSess();
    await say('شاگردام سر مسئله‌ها ساکت می‌مونن. من هم آخرش خودم حل می‌کنم روی تخته. یه همکار گفت «سؤال بپرس» ولی سؤال‌های من یا جوابو لو میده یا کسی جواب نمیده. چیکار کنم؟');
    await say('«خب... ببین این دو تا مثلث متشابهن چون ضلع‌ها موازی‌ان، پس نسبت ضلع‌ها رو بنویس.» — اوه، باز لو دادم نه؟');
    const c15 = coachOf(await lastUser()); g.s15 = { guess: GUESS_LINE.test(c15), sug: sugOf(c15).slice(0, 40) };
    chk(!g.s15.guess && !/می‌آزمایی/.test(g.s15.sug), 'guess: a teacher\'s self-check on her own (quoted, role-play) hint «باز لو دادم نه؟» is hint-ladder feedback, not a guess (s15) ' + JSON.stringify(g.s15));
    // حدسِ خبری «فکر کنم آخرش «ستان» باشه» پس از «پیداش کردم… حالا آناگرام» ⇒ حدسِ مسئلهٔ تازه (s12)
    const c12 = await pair('جدول امروز: «از جلو و عقب یکی است، در دریا راه می‌رود» — ۵ حرفی. و یه افقی دیگه: حروف «ر ا ت س م ن ه ب» رو مرتب کن، یه کلمه ۸ حرفی. نیم ساعته موندم. شما که ماشینی، بگو.',
      'با املا: ناوبان برعکسش نابوان میشه، نه. پس باید اول پالیندروم‌های پنج حرفی رو بشمارم بعد ببینم کدوم دریاییه. «ناخدا» نه... «تخت»؟ نه... آهان! پیداش کردم، با «ا» هم درمیاد. حالا آناگرام. فکر کنم آخرش «ستان» باشه.');
    g.s12 = { guess: GUESS_LINE.test(c12), ph: phOf(c12), sug: sugOf(c12).slice(0, 40) };
    chk(g.s12.guess && /می‌آزمایی/.test(g.s12.sug) && g.s12.ph === 'فهمِ مسئله', 'guess: «… پیداش کردم … حالا آناگرام. فکر کنم آخرش «ستان» باشه» = a declarative guess on a NEW sub-problem (from understanding), tested this turn (s12) ' + JSON.stringify(g.s12));
    // کنترلِ مثبت: «… پس جا نمیشه. درسته؟» هنوز حدس است (دورِ ۶)
    const cc = await pair('یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول داره. جا میشه؟', 'خب ۳.۲ از ۴ کمتره دیگه، پس جا نمیشه. درسته؟');
    g.ctl = GUESS_LINE.test(cc);
    chk(g.ctl, 'guess: control — «… پس جا نمیشه. درسته؟» after a value stays a guess (round 6) ' + JSON.stringify(g));
  });

  // ================= abandon / fresh — نشانه‌های نوبت به A.liveCoach =================
  let PA = null;
  await section('abandon', async () => {
    const a = info.abandon = {};
    await day(0);
    PA = await mk({ title: 'خانهٔ پدری', st: 'چهار خواهر و برادریم؛ خانهٔ پدری فروخته نشود، سهم‌ها مساوی باشد، خواهرم در آن بماند و برادرم امسال پولِ نقد بگیرد. چه کنیم؟', nat: 'objective' });
    await understand({ one: 'راهی می‌خواهم که هر چهار خواسته با هم برآورده شود', unk: 'راهِ تقسیمِ خانه', data: ['خانه ۸ میلیارد می‌ارزد', 'خواهرم پس‌انداز ندارد'], cond: 'خانه فروخته نشود\nسهم‌ها مساوی\nبرادر امسال نقد بگیرد' });
    a.ph = await p.evaluate(pid => APP.livePhase(pid), PA);
    await pageSess(PA);
    await say('دیشب نشستم حساب کردم. خونه فروخته نشه ولی برادرم امسال نقد بخواد، خواهرم هم پولی نداره که سهمشو بخره... پس راهی نیست. ولش کنم دیگه، هیچ کاری نمیشه کرد.');
    const t1 = await lastTurn(), u1 = await lastUser();
    a.s04 = { abandon: t1 && t1.abandon, text: !!(t1 && t1.text), one: oneOf(u1).slice(0, 260) };
    chk(a.ph === 'p' && a.s04.abandon === true && a.s04.text, 'abandon: turnSig carries abandon:true and the text to A.liveCoach (s04) ' + JSON.stringify(a));
    chk(/پیش از رها کردن/.test(a.s04.one), 'abandon: from chat, «ولش کنم … راهی نیست» gives the a38 abandon question «پیش از رها کردن…» as the ONE turn question, not «از خواسته به عقب» (s04, s06) ' + JSON.stringify(a.s04));
    await say('مدیرم گفت «کل این طرح رو بنداز دور». ولی من فقط گیر کردم.');
    const t2 = await lastTurn(); a.quoted = { abandon: t2 && t2.abandon, stuck: t2 && t2.stuck };
    chk(a.quoted.abandon === false && a.quoted.stuck === true, 'abandon: a QUOTED «بنداز دور» (someone else\'s words) is no abandon signal by the user ' + JSON.stringify(a.quoted));
  });
  await section('fresh', async () => {
    const f = info.fresh = {};
    if (!PA) { errors.push('fresh: needs the abandon section\'s problem'); return; }
    await pageSess(PA);
    await next('بگو.', ST({ ph: 'p', stuck: true }));
    await say('تو طرح این پرسش اول رو نمی‌دونم چی بنویسم. از کجا شروع کنم؟');
    await say('برادرم فقط پول امسال رو می‌خواد، نه سهم خونه رو. پس شرطِ «سهم مساوی» رو هیچ‌جا با «زمانِ پرداخت» جدا نکرده بودم! تازه می‌شه سهمشو قسطی از خواهرم بگیره.');
    const t = await lastTurn(); f.s33 = { stuck: t && t.stuck };
    chk(f.s33.stuck === false, 'fresh: a fresh finding «پس … هیچ‌جا … نکرده بودم!» clears the carried stuck of the previous turn (s33) ' + JSON.stringify(f.s33));
    // «# پس از شکست» نه در نوبتِ موفقیت (s12)
    await newSess();
    await say('جدول امروز: یه افقی ۸ حرفی با حروف «ر ا ت س م ن ه ب». نیم ساعته موندم.');
    await say('ر م ه ب ... رمهب‌ستان؟ نه. اشتباه بود. پس «ستان» نیست. اعصابم خورد شد، نیم ساعت دیگه هم رفت.');
    const w0 = /^# پس از شکست، نقد یا میلِ رها کردن/m.test(await lastUser());
    await say('خونه سوم از عمودی «ه» است. با هشت تا خونه و «ه» سوم... آهان! پیدا شد، با حرف تقاطع هم می‌خونه. ممنون، خودم حلش کردم.');
    f.will = { failTurn: w0, success: /^# پس از شکست، نقد یا میلِ رها کردن/m.test(await lastUser()) };
    chk(f.will.failTurn && !f.will.success, 'fresh: «# پس از شکست» (🌱) is on the failure turn but not on the success turn right after it (s12) ' + JSON.stringify(f.will));
  });

  // ================= why / teacher (A073، A129) =================
  await section('why', async () => {
    const w = info.why = {};
    const c31 = await pair('حلش کردم! بیشترین حاصل‌ضرب اعداد مثبتی که جمعشون ۱۰ ه وقتیه که همه‌شون مساوی‌ان، ۵×۵=۲۵. سؤال بعدی رو بده.',
      'اول رد: با ۵ تا ۲^۵=۳۲ کمتره، با ۴ تا ۳۹. ولی چرا مساوی بهتره؟ از نابرابری حسابی-هندسی. پس با n=4 جواب 39.0625.');
    w.s31 = WHY_LINE.test(c31);
    await newSess();
    await say('سلام! راستش حالا یه کم از آمار خوشم میاد. یه سؤال: چرا توی فرمول واریانس نمونه تقسیم بر n−1 می‌کنیم نه n؟ استاد گفت ولی یادم نموند.');
    w.s14ask = WHY_LINE.test(coachOf(await lastUser()));
    await say('حدسم... میانگین نمونه وسط همون داده‌هاست، پس فاصله‌ها ازش کوچیک‌تر از فاصله تا میانگین واقعیه. پس کوچیک‌تر نشون می‌ده، و برای جبران تقسیم بر عدد کوچیک‌تر می‌کنیم؟ ولی چرا دقیقاً یکی کمتر؟');
    w.s14guess = WHY_LINE.test(coachOf(await lastUser()));
    chk(!w.s31, 'why: A073 «ask his guess first» not on a self-answered «چرا X؟ از Y.» (s31) ' + JSON.stringify(w));
    chk(w.s14ask && !w.s14guess, 'why: A073 on «چرا…؟» with no attempt (control), but not on the turn that already IS his guess (s14) ' + JSON.stringify(w));
    // قابِ پدر: اقتدار ⇒ فراموشی (A129) بر «اول حدسش را بپرس» (A073) مقدم؛ «من گفتم … چون من باباشم» هم لحظهٔ A129 است (s16)
    await newSess();
    await say('دخترم یه مسئله داره: «باغچه‌ای مستطیلی دورش ۲۴ متر حصار داره، طولش دو برابر عرضشه، طول و عرض چقدره؟» خودم بلدم، فقط بگو چطوری بهش بگم که زود تموم شه بریم بخوابیم.');
    await say('سلام، دو شب گذشته. جالبه: یه روشی رو که هفته‌ی پیش خودم بهش «گفته بودم» (برای مسئله‌ی سن) کاملاً یادش رفته، ولی روش نخ رو یادشه و امروز خودش برای یه مسئله‌ی دیگه نخ آورد. چرا این‌طوریه؟');
    const c4 = coachOf(await lastUser());
    await say('خب... روش سن رو من گفتم، اون فقط قبول کرد چون من باباشم. نخ رو خودش ساخت. یعنی چیزی که خودش بسازه می‌مونه؟');
    const c5 = coachOf(await lastUser());
    w.s16 = { a129_4: has(c4, ['A129']), why4: WHY_LINE.test(c4), a129_5: has(c5, ['A129']) };
    chk(w.s16.a129_4 && !w.s16.why4, 'why: in the parent frame the authority⇒forgetting moment (A129) outranks A073 — no «ask his guess first» line next to it (s16) ' + JSON.stringify(w.s16));
    chk(w.s16.a129_5, 'why: TA_RE — «روش سن رو من گفتم … قبول کرد چون من باباشم» is the A129 moment (s16) ' + JSON.stringify(w.s16));
  });

  // ================= سطرهای لحظه (A191، A263، B162، ادعا) =================
  await section('lines', async () => {
    const l = info.lines = {};
    l.a191 = {
      s31w4: has(await first('سلام! این چند هفته فهمیدم از مسئله‌های نابرابری خیلی بیشتر از هندسه لذت می‌برم. حالا چی کار کنم؟'), ['A191']),
      s11: has(await first('یه صفحه ۱۰×۱۰ که دو گوشه‌ی مقابلش رو برداشتن. می‌خوام با دومینوهای ۱×۲ کاملش کنم. برنامه‌ی backtracking نوشتم، یه ساعته داره می‌چرخه. کجای کدم اشتباهه؟'), ['A191']),
      s13: has(await first('همکارم فاکتورهای ناهار رو هر بار ۵۰-۱۰۰ هزار تومن بیشتر ثبت می‌کنه. دوست صمیمیمه، بچه مریض داره. اگه گزارش بدم اخراج می‌شه. اگه ندم خودم شریک جرمم. قانون چی میگه؟ درستش چیه؟'), ['A191']),
    };
    chk(!l.a191.s31w4, 'lines: A191 not on a taste/talk first message of a session (s31 week 4) ' + JSON.stringify(l.a191));
    chk(l.a191.s11 && l.a191.s13, 'lines: A191 on openings that introduce a problem — dimensions/ranges «۱۰×۱۰»، «۵۰-۱۰۰» are data, not his own formula (s11, s13) ' + JSON.stringify(l.a191));
    const c38 = await pair('ساعت ۱۱ شبه، فردا ۸ صبح باید تحویل بدم. یه تکلیف هندسه دارم.', 'یه تکلیف دیگه: «ثابت کنید مجموع زاویه‌های خارجی هر چندضلعی محدب ۳۶۰ درجه است.» یک ساعت و نیمه روش کار کردم: برای مثلث و مربع امتحان کردم درسته، ولی برای حالت کلی نمی‌دونم چطور ثابت کنم.');
    const c20 = await pair('۸ ماهه می‌خوام نشون بدم یه شبکه‌ی خاص با ۳ نوع نورون نوسان گاما تولید می‌کنه یا نه. استادم می‌گه شاید مسئله‌ی کلی‌تر رو ببینم.', 'یک جمله: «تحت چه شرایطی شبکه نوسان گاما می‌سازه؟» ولی کلی‌تر که سخت‌تره!');
    l.a263 = { s38: has(c38, ['A263']), s20: has(c20, ['A263']) };
    chk(!l.a263.s38 && l.a263.s20, 'lines: A263 not on «برای حالت کلی نمی‌دونم» (the proof\'s general case, s38); still on generalising talk «کلی‌تر که سخت‌تره» (s20) ' + JSON.stringify(l.a263));
    const c20b = await pair('۸ ماهه می‌خوام نشون بدم یه شبکه‌ی خاص با ۳ نوع نورون نوسان گاما تولید می‌کنه یا نه.', 'هفته‌ی سوم. ایده رو با ۴۰ تا شبیه‌سازی قبلی آزمودم: ۳۸ تاش جور درمیاد، نشونه‌ها خیلی زیاده! ولی یه حالت، وقتی g_PV-E خیلی بزرگه، با وجود نسبت بالا نوسان نمی‌ده. اونو نادیده بگیرم؟ استثناست دیگه.');
    l.b162 = has(c20b, ['B162']);
    chk(l.b162, 'lines: B162 «heuristic evidence guides, not proves» on evidence counts «۳۸ تاش جور درمیاد، نشونه‌ها خیلی زیاده» (s20)');
    const c01r = await pair('سه ماهه دارم فایل اکسل پر می‌کنم که خونه بخرم یا اجاره‌نشین بمونم.', 'صاحبخونه قبول کرد: ۵ ساله با افزایش ۲۲٪. حدسم که خرید بهتره غلط درآمد.');
    l.b231 = has(c01r, ['B231']);
    chk(l.b231, 'lines: B231 on «حدسم که X … غلط درآمد» (words between «حدسم» and «غلط», s01)');
    const c11 = await pair('یه صفحه ۱۰×۱۰ که دو گوشه‌ی مقابلش رو برداشتن. می‌خوام با دومینوهای ۱×۲ کاملش کنم.', 'راست میگی، زوج بودن فقط تعداد رو میگه. ولی «کنار هم بودن» دو خونه رو چطوری بشمارم؟ گیر کردم.');
    const c33 = await pair('صاحبخونه میگه طبق بند ۷ قرارداد کل ودیعه مال اونه.', 'حق داره؟ بگو نه دیگه.');
    l.claim = { s11: /همین پیام چنین ادعایی است/.test(c11), ctl: /همین پیام چنین ادعایی است/.test(c33) };
    chk(!l.claim.s11 && l.claim.ctl, 'lines: agreement «راست میگی» is not a disputed claim (s11); «حق داره؟» still is (control) ' + JSON.stringify(l.claim));
  });

  // ================= result / new problem / A044 / s27 =================
  await section('result', async () => {
    const r = info.result = {};
    await newSess();
    await say('این معما رو برای همکارام گذاشتم: «یه نفر دو بچه داره، حداقل یکیشون پسره. احتمال این‌که هر دو پسر باشن؟» معلومه ۱/۲ دیگه. همکارم میگه ۱/۳. بهش بگو اشتباه می‌کنه.');
    await say('همین که گفتم! دو بچه، یکی پسره، اون یکی یا پسره یا دختر، پس ۱/۲. باشه ثبتش کن ببینیم.');
    r.s28 = phOf(coachOf(await lastUser()));
    chk(r.s28 && r.s28 !== 'بازنگری', 'result: «… پس ۱/۲» before the problem is understood is not a stated result — no look-back (s28) ' + JSON.stringify(r));
    // باغچه (بسته از گفت‌وگو) ⇒ «باغچه تموم شد. حالا حوض: …» مسئلهٔ تازه از فهم (s29)
    await newSess();
    await act({ reply: 'ثبت شد.', actions: [{ do: 'chat_solved', title: 'باغچهٔ ۴۰ متری', statement: 'با ۴۰ متر لبهٔ سنگی بزرگ‌ترین باغچهٔ چهارضلعی چه شکلی است؟', kind: 'find', lesson: 'مربع با ضلعِ ۱۰ بیشترین مساحت را دارد', check: 'با مستطیلِ ۹ در ۱۱ مقایسه کردم کمتر شد' }] });
    await say('باغچه رو با ۴۰ متر لبه حل کردم: مربع ۱۰ در ۱۰ بهترینه. مستطیل ۹ در ۱۱ رو هم امتحان کردم کمتر شد. درسش اینه که مربع با ضلعِ ۱۰ بیشترین مساحت را دارد.');
    r.bound = await p.evaluate(() => { const s = APP.ASSIST.cur(); return s.lprob ? APP.livePhase(s.lprob) : ''; });
    await say('باغچه تموم شد. حالا حوض: یه حوض گرد می‌خوام که به سه تا مسیر باغ مماس باشه؛ جای مرکزشو چطوری پیدا کنم؟ ثبتش کن.');
    r.s29 = phOf(coachOf(await lastUser()));
    chk(r.bound === 'done' && r.s29 === 'فهمِ مسئله', 'result: «باغچه تموم شد. حالا حوض: …» after the garden was closed = NEW problem from understanding, not the garden\'s look-back (s29, R5/N3) ' + JSON.stringify(r));
    // A044 (s23، s29)
    r.a044 = {
      s29: has(await first('۴۰ متر لبه‌ی سنگی دارم برای یه باغچه‌ی چهارضلعی. بزرگ‌ترین باغچه چه شکلیه؟ به نظرم مستطیل باریک و بلند چون جای گل بیشتر داره. بعد هم می‌خوام یه حوض گرد بذارم که به سه تا مسیر باغ مماس باشه، جای مرکزشو چطوری پیدا کنم؟ اول باغچه رو ثبت کن.'), ['A044']),
      s23: has(await first('کیک رو پختم و خوب شد! ولی زمان پختو نمی‌دونستم، دستور مادرم ۳۵ دقیقه بود. زمان پخت هم ۲.۸ برابر میشه؟ یعنی ۱۰۰ دقیقه؟ ۸ تا تخم‌مرغ زدم یا ۹ بهتر بود؟'), ['A044']),
      s18: has(await first('یه قیف مخروطی (نوک پایین) با شعاع دهانه ۱۰ سانت و ارتفاع ۳۰ سانت داریم. آب با نرخ ثابت ۵ سانتی‌متر مکعب در ثانیه از ته خارج می‌شه. وقتی عمق آب ۱۲ سانته، سطح آب با چه سرعتی پایین میاد؟ فرمولش یادم نیست. حجم مخروط ⅓πr²h = ⅓·π·۱۰۰·۱۲ تقسیم بر ۵ ثانیه؟'), ['A044']),
    };
    chk(r.a044.s29 && r.a044.s23, 'result: A044 on two different unknowns asked with «چه شکلیه؟ … چطوری پیدا کنم؟» and yes/no quantity questions «۱۰۰ دقیقه؟ … ۸ یا ۹؟» (s29, s23) ' + JSON.stringify(r.a044));
    chk(!r.a044.s18, 'result: … but not on one unknown plus his own formula attempt «… = ⅓·π·۱۰۰·۱۲ تقسیم بر ۵ ثانیه؟» (s18) ' + JSON.stringify(r.a044));
    // s27: «با معنی سوم کار می‌کنم … این شرط رو برآورده می‌کنن؟» پیش از نوشتنِ حکم/فرض هنوز فهم
    await newSess();
    await next('بگو.', ST({ ph: 'u', said: ['u'], ans: ['u1'] }));
    await say('سؤال مقاله‌ام: «آیا ماشین می‌تونه زبان رو بفهمه؟» هر چی می‌خونم یه نفر میگه آره یه نفر میگه نه. شما خودت که ماشینی، بگو می‌فهمی یا نه؟');
    await next('بگو.', ST({ ph: 'u', said: ['d'], ans: ['u2'] }));
    await say('خب «فهمیدن» یعنی... یه بار فکر می‌کنم یعنی درست جواب دادن، یه بار یعنی تجربه‌ی درونی داشتن، یه بار یعنی وصل کردن معنی کلمه‌ها به چیزای دنیا. نمی‌دونم کدوم.');
    await say('با معنی سوم کار می‌کنم چون برای مقاله‌ام همین مهمه: اگه فهمیدن = وصل کردن معنای واژه‌ها به چیزهای جهان، آیا مدل‌های زبانی امروز این شرط رو برآورده می‌کنن؟ بیا ثبتش کنیم.');
    r.s27 = phOf(coachOf(await lastUser()));
    chk(r.s27 === 'فهمِ مسئله', 'result: «با معنی سوم کار می‌کنم … این شرط رو برآورده می‌کنن؟» (a word «شرط» inside his question, before the claim/assumptions are written) stays in understanding (s27) ' + JSON.stringify(r));
  });

  // ================= goal (s18) و nat (s19) =================
  await section('goal', async () => {
    const g = info.goal = {};
    await newSess();
    await say('یه قیف مخروطی (نوک پایین) با شعاع دهانه ۱۰ سانت و ارتفاع ۳۰ سانت داریم. آب با نرخ ثابت ۵ سانتی‌متر مکعب در ثانیه از ته خارج می‌شه. وقتی عمق آب ۱۲ سانته، سطح آب با چه سرعتی پایین میاد؟');
    await next('بگو.', ST({ ph: 'u', said: ['u'], ans: ['u1'] }));
    await say('مجهول؟ «سرعت پایین اومدن سطح آب». به زبون دیگه... «چقدر سطح آب در یک ثانیه پایین میاد». یعنی... «تغییر عمق در واحد زمان»، اون لحظه که عمق ۱۲ه. پس نرخ تغییر عمق، dy/dt.');
    await say('نرخ حجم داده شده: V با سرعت ۵ کم می‌شه. حجم آب V = ⅓πr²y. ولی r رو نمی‌دونم! شعاع سطح آب که ۱۰ نیست، فقط شعاع دهانه‌ست. داده کمه.');
    const c3 = coachOf(await lastUser()), gl = (/🎯 مجهول هنوز «([^»]*)»/.exec(c3) || [])[1] || '';
    g.s18 = { ph: phOf(c3), goal: gl };
    chk(g.s18.ph === 'اجرای طرح' && /dy\/dt/.test(gl) && !/مجهول؟/.test(gl), 'goal: a new relation with variables (varEq) is exec at once, and the 🎯 line quotes his LATEST restatement of the unknown («… dy/dt»), not the raw earlier message (s18) ' + JSON.stringify(g.s18));
    // قالبِ live_new با "nat" در همان نوبتِ نخست (s19)
    await newSess();
    await say('۱۶ هفته تا عروسیم مونده، می‌خوام ۸ کیلو کم کنم. یه مسئله دارم، می‌خوام حلش کنم.');
    const u = await lastUser(), T = u.match(/\{\\?"do\\?":\\?"live_new\\?"[^}]*\}/g) || [];
    g.nat = { n: T.length, all: T.every(t => /"nat"/.test(t)) };
    chk(g.nat.n >= 1 && g.nat.all, 'goal: every live_new template in the turn-1 hook carries "nat" (s19) ' + JSON.stringify(g.nat));
  });

  // ================= refday — سطرهای رد فقط همان روز؛ C107 نه برای فرضیهٔ زندگی =================
  await section('refday', async () => {
    const r = info.refday = {};
    // (۱) فرضیهٔ یک‌بارهٔ زندگی، رد در همان روز ⇒ B231 آری، C107 نه (s05)
    await day(0);
    const PL = await mk({ title: 'ترفیعِ همکار', st: 'مدیرم عمداً ترفیعِ من را نداد؟ می‌خواهم بفهمم چرا ترفیع نگرفتم.', nat: 'life' });
    await understand({ one: 'دنبالِ دلیلِ نگرفتنِ ترفیع هستم', unk: 'علتِ ترفیع نگرفتنم', data: ['دیگران ترفیع گرفتند', 'مدیرم با من سرد است'], cond: 'علت را با شاهد بیابم', guess: 'مدیرم عمداً ترفیعم را نداد', nat: 'life' });
    await savePlan('نخست از منابع انسانی می‌پرسم سپس با مدیرم حرف می‌زنم');
    await realStep('فردا از منابع انسانی بپرسم معیارِ ترفیع چه بود', 'می‌گویند مدیرم مخالفت کرد');
    await day(1); await go('lprob', PL, 'exec');
    await outcome({ what: 'سیاستِ تازه بود: فقط کسانی که دوره رفتند ترفیع گرفتند', match: 'no', grel: 'refute' });
    r.refL = await p.evaluate(pid => APP.livePlausible(pid).refuted, PL);
    await pageSess(PL);
    await say('رفتم پرسیدم. سیاست جدید بوده: فقط کسایی که دوره آموزشی رفتن ترفیع گرفتن، منم نرفته بودم.');
    const cL = coachOf(await lastUser());
    r.life = { b231: has(cL, ['B231']), c107: has(cL, ['C107']) };
    chk(r.refL > 0 && r.life.b231 && !r.life.c107, 'refday: a refuted one-off LIFE hypothesis gets B231 but not C107 «narrow the domain» (s05) ' + JSON.stringify(r));
    // (۲) ردِ روزِ ۱، نخستین گفت‌وگو شش هفته بعد ⇒ نه B231 و نه «بپرس از ردش چه آموخت»؛ «دوباره پیشنهاد نکن» می‌ماند (s19)
    await day(0);
    r.stage = 'mkP'; const PP = await mk({ title: 'فروشِ عصر', st: 'فروشِ مغازه‌ام در عصرها کم شده؛ می‌خواهم بفهمم چرا.', nat: 'life' });
    await understand({ one: 'دنبالِ دلیلِ افتِ فروشِ عصرها هستم', unk: 'علتِ کم شدنِ فروشِ عصر', data: ['عصرها کمتر فروختیم', 'مغازهٔ روبه‌رو تخفیف داده'], cond: 'علت را با شاهد بیابم', guess: 'تخفیفِ مغازهٔ روبه‌رو علت است', nat: 'life' });
    r.stage = 'planP'; await savePlan('نخست مشتری‌های عصر را می‌شمارم سپس از چند مشتری می‌پرسم');
    r.stage = 'stepP'; await realStep('فردا عصر مشتری‌ها را بشمارم', 'مشتری‌ها به مغازهٔ روبه‌رو رفته‌اند');
    r.stage = 'outP'; await day(1); await go('lprob', PP, 'exec');
    await outcome({ what: 'مشتری‌ها همان قدر آمدند ولی کمتر خریدند', match: 'no', grel: 'refute' });
    r.refP = await p.evaluate(pid => APP.livePlausible(pid).refuted, PP);
    await day(43); await pageSess(PP);
    await say('هفته‌ی ششم! فروش عصر برگشت. ویترین رو عوض کردم و نورش رو بیشتر کردم.');
    const u6 = await lastUser(), c6 = coachOf(u6);
    r.late = { b231: has(c6, ['B231']) || /B231/.test(liveOf(u6)), ask: /بپرس از ردش چه آموخت/.test(c6), keep: /دوباره پیشنهاد نکن/.test(u6) };
    chk(r.refP > 0 && !r.late.b231 && !r.late.ask && r.late.keep, 'refday: a refutation six weeks old is not «fresh» on the first chat turn after it — no B231 (coach or the coach\'s live extra) / coach «ask what he learnt from it»; «don\'t re-propose» stays (s19; a38\'s own refK line is «live»\'s) ' + JSON.stringify(r.late));
  });

  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 9000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
