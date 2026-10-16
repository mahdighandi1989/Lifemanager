// تورِ پولیا (دستهٔ ۱، دورِ ۴ ِ اصلاح، ۲۰۲۶-۱۰-۱۶) — سهمِ «coach» از DECISIONS_R4:
//  E1  مدل وضعِ نوبت را گزارش می‌کند ({"do":"coach_state",…})، صفحه آن را با حرفِ خودِ کاربر می‌سنجد و دفتر را نگه می‌دارد؛
//      الگوهای متنی فقط پشتیبان‌اند (وقتی گزارش نیامد) و سخت‌تر شدند. دو مدلِ بدلیِ «میانگینِ لفظی»: یکی گزارش می‌دهد، یکی نه.
//  E3  ترتیب/پیشنهاد/برش: «از خواسته به عقب» نخست وقتی در طرح رو به جلو گیر است؛ فهرستِ قلاب بریده نمی‌شود؛ «همهٔ داده‌ها؟» نه در آغازِ طرح
// همه از رابطِ واقعی (پنجرهٔ دستیار، فرم‌های صفحه) با مدلِ بدلی. خروج با کدِ غیرصفر در خطا.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(200);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = APP.today();
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); const r = __q.shift(); const t = typeof r === 'function' ? r(user) : r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
  });
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
  };
  const newSess = () => p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => (__calls[__calls.length - 1] || {}).user || '');
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const coachOf = (u) => block(u, '# مربیِ حل');
  const phOf = (c) => (/مرحلهٔ محتمل: ([^·—]+?)\s*(?:·|—)/.exec(c) || [])[1] || '';
  const sugOf = (c) => (/پیشنهادِ این نوبت: «([^»]+)»/.exec(c) || [])[1] || '';
  // مدلِ بدلیِ «میانگینِ لفظی»: پاسخ با یک پرسش؛ اگر st داده شد، گزارشِ وضع را هم می‌فرستد (همان شکلی که قلاب گفته)
  const next = (reply, st) => p.evaluate(([reply, st]) => __q.push(R({ reply, actions: st ? [Object.assign({ do: 'coach_state' }, st)] : [] })), [reply, st || null]);
  const ev = () => p.evaluate(() => ((APP.ASSIST.cur() || {}).coachEv || []).length);
  const mind = () => p.evaluate(() => { const Q = APP.MIND.phases(); return Q ? Q.n : 0; });

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  // ---------- E1-0) قلاب کنشِ گزارش را به زبانی می‌گوید که مدلِ لفظی بفرستدش؛ پرسش‌ها شناسه دارند ----------
  await newSess();
  await say('یه معما دارم: سه جعبه با برچسبِ غلط، یکی سیب یکی پرتقال یکی قاطی');
  { const c = coachOf(await lastUser());
    info.hook = { act: /"do":"coach_state"/.test(c), ids: /\bu1\) /.test(c) && /\bu2\) /.test(c), user: /فقط دربارهٔ \*\*آخرین پیامِ کاربر\*\*/.test(c) };
    chk(info.hook.act && info.hook.ids && info.hook.user, 'E1: the coach hook tells the model to end every coaching reply with a coach_state action about the USER\'s last message, and lists question ids ' + JSON.stringify(info.hook)); }

  // ---------- E1-a) پشتیبان (بی گزارش): صورتِ چسبانده با «؟»، رقم و «فقط» فهمِ گفته‌شده نیست ----------
  await newSess();
  await say('یه زمین دارم که دورش ۴۷ تا ستون لازم داره، هر ستون ۱۲۰ هزار تومن. فقط بگو بخرم یا نه؟');
  { const c = coachOf(await lastUser());
    info.e1a = { ph: phOf(c), marked: /\[در گفت‌وگو پاسخ گرفته/.test(c), sug: sugOf(c), rung: await p.evaluate(() => APP.qRung(APP.ASSIST.tutorQuestions.und.qs[0])) };
    chk(info.e1a.ph === 'فهمِ مسئله' && !info.e1a.marked, 'E1 fallback: a pasted opening with «؟», digits and «فقط» is not «unknown/data/condition stated» — the coach stays in understanding and marks nothing answered (s01) ' + JSON.stringify(info.e1a));
    chk(info.e1a.rung === 0, 'E1 fallback: the opening statement credits no rung on a fresh profile (s16) ' + JSON.stringify(info.e1a)); }

  // ---------- E1-b) پشتیبان: «نمی‌دونم» پاسخِ پرسش نیست ----------
  await newSess();
  await next('شرط چیست؟ می‌توانی بخش‌هایش را جدا بنویسی؟');
  await say('معما: سه جعبه با برچسبِ غلط داریم؛ یکی سیب، یکی پرتقال، یکی قاطی.');
  await say('نه… نمی‌دونم');
  { const c = coachOf(await lastUser());
    info.e1b = { marked: /شرط چیست؟[^\n]*?\[در گفت‌وگو پاسخ گرفته/.test(c), rung: await p.evaluate(() => APP.qRung(APP.ASSIST.tutorQuestions.und.qs[2])) };
    chk(!info.e1b.marked && info.e1b.rung === 0, 'E1 fallback: a «نمی‌دونم» reply does not mark the asked question answered nor raise its rung (s01/s02/s08) ' + JSON.stringify(info.e1b)); }

  // ---------- E1-c) مسیرِ گزارش: مدل وضع را می‌گوید، صفحه می‌سنجد (گزارشِ هر پاسخ دربارهٔ پیامی است که پاسخ به آن است) ----------
  const cph = () => p.evaluate(() => (APP.ASSIST.cur().coach || {}).ph || '');
  await newSess();
  await next('دقیقاً دنبالِ چه هستی؟', { ph: 'u', said: ['u', 'd', 'c'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' });
  await say('۲۰ لیتر آب‌نمک ۱۰٪ داریم. چند لیتر آب‌نمک ۲۵٪ اضافه کنیم تا ۱۵٪ بشه؟');
  info.e1c = { ph0: await cph() };
  await next('حالا داده‌ها چیست؟', { ph: 'u', said: ['u'], ans: ['u1'], stuck: false, fail: false, role: 'self', nat: 'objective' });
  await say('حجمِ آب‌نمکِ ۲۵ درصدی که اضافه می‌شه');
  let c2 = coachOf(await lastUser());
  info.e1c.ph1 = phOf(c2); info.e1c.frame = /پاسخِ عینی/.test(c2);
  await next('بگو.', { ph: 'u', said: [], ans: ['u2'], stuck: true, fail: false, role: 'self', nat: 'objective' });
  await say('نمی‌دونم');
  c2 = coachOf(await lastUser());
  info.e1c.uMarked = /u1\) [^\n]*?\[در گفت‌وگو پاسخ گرفته/.test(c2); info.e1c.sug1 = sugOf(c2);
  await next('خب.', { ph: 'b', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' });
  await say('باشه بذار فکر کنم');
  c2 = coachOf(await lastUser());
  info.e1c.dkMarked = /u2\) [^\n]*?\[در گفت‌وگو پاسخ گرفته/.test(c2); info.e1c.sug2 = sugOf(c2);
  info.e1c.jump = await cph();
  await next('خب.', { ph: 'e', said: ['plan'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' });
  await say('مجهول مقدارِ آب‌نمکِ اضافه است؛ طرحم اینه که مقدارِ نمکِ دو طرف رو برابر بذارم');
  info.e1c.ph2 = await cph();
  const ev0 = await ev(), m0 = await mind();
  await next('جوابت را وارسی کن.', { ph: 'b', said: ['result'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' });
  await say('پس x = ۱۰ لیتر');
  info.e1c.ph3 = await cph();
  await next('کجا؟', { ph: 'e', said: [], ans: [], stuck: false, fail: true, role: 'self', nat: 'objective' });
  await say('اوه ۱۰ نمی‌شه! کلاً اشتباهه');
  info.e1c.ph4 = await cph();
  info.e1c.ev = (await ev()) - ev0; info.e1c.mind = (await mind()) - m0;
  chk(info.e1c.ph0 === 'u' && info.e1c.ph1 === 'فهمِ مسئله', 'E1: the model\'s «said u,d,c» about the pasted opening is rejected by the page (a pasted statement before any problem is not the user stating the parts) ' + JSON.stringify(info.e1c));
  chk(info.e1c.frame, 'E1: the model\'s nat (objective) is used as the chat-only coach\'s kind suggestion ' + JSON.stringify(info.e1c));
  chk(info.e1c.uMarked && /^داده‌ها/.test(info.e1c.sug1), 'E1: the model\'s «ans: u1» on a real answer marks the unknown question answered by id and moves the suggestion on ' + JSON.stringify(info.e1c));
  chk(!info.e1c.dkMarked && /^داده‌ها/.test(info.e1c.sug2), 'E1: the model\'s «ans: u2» on a «نمی‌دونم» reply is rejected — the question stays the suggestion ' + JSON.stringify(info.e1c));
  chk(info.e1c.jump === 'u', 'E1: a claimed jump to look-back without a stated result is not accepted ' + JSON.stringify(info.e1c));
  chk(info.e1c.ph2 === 'c', 'E1: the user\'s stated plan (claimed by the model, validated against his text) moves the coach to execution ' + JSON.stringify(info.e1c));
  chk(info.e1c.ph3 === 'b' && info.e1c.ph4 === 'c' && info.e1c.ev === 1 && info.e1c.mind === 1, 'E1: result ⇒ look-back, then the model\'s «fail» ⇒ back to execution and ONE failure in A.MIND.phases (R7) ' + JSON.stringify(info.e1c));
  // ادعای نقشِ مربی بی یادگیرنده‌ای در حرفِ کاربر پذیرفته نیست؛ با یادگیرنده پذیرفته است
  await newSess();
  await next('بگو.', { ph: 'u', said: [], ans: [], stuck: false, fail: false, role: 'teacher', nat: '?' });
  await say('یه معما دارم دربارهٔ سه جعبه');
  await say('خب ادامه');
  info.e1c.teachNo = !/کاربر مربیِ یادگیرنده است/.test(coachOf(await lastUser()));
  await newSess();
  await next('بگو.', { ph: 'u', said: [], ans: [], stuck: false, fail: false, role: 'teacher', nat: '?' });
  await say('کلاسم سرِ این معمای سه جعبه هیچ‌کدوم جواب نمیدن، چیکار کنم');
  await say('خب ادامه');
  info.e1c.teachYes = /کاربر مربیِ یادگیرنده است/.test(coachOf(await lastUser()));
  chk(info.e1c.teachNo && info.e1c.teachYes, 'E1: the model\'s «role: teacher» counts only when the user\'s own words name a learner ' + JSON.stringify(info.e1c));

  // ---------- E1-d) پشتیبان (بی گزارش): الگوهای سخت‌تر و کامل‌تر ----------
  info.e1d = [];
  for (const said of ['جواب ۱.۳', 'پس حجم = ۵۰۰ سی‌سی', 'رسید به عرض ۴', 'تموم شد دیگه!', 'اثر هست… پرونده رو بستم', 'خودم ساختمش']) {
    await newSess(); await say('معما: مجموعِ دو عدد ۱۰ است و تفاضلشان ۲؛ آن دو عدد کدام‌اند؟'); await say(said);
    info.e1d.push([said, phOf(coachOf(await lastUser()))]);
  }
  chk(info.e1d.every(x => x[1] === 'بازنگری'), 'E1 fallback: RESULT_RE catches «جواب X», «پس X = …», «رسید به …», «تموم شد دیگه», «پرونده رو بستم», «خودم ساختمش» ' + JSON.stringify(info.e1d));
  await newSess(); await say('معما: آهنگِ رشدِ یه جمعیت رو حساب کن'); await say('جواب ۱.۳');
  { const e0 = await ev(), q0 = await mind(); await say('۱.۳ نمی‌شه! کلاً غلطه'); info.e1d14 = { ev: (await ev()) - e0, mind: (await mind()) - q0 };
    chk(info.e1d14.ev === 1 && info.e1d14.mind === 1, 'E1 fallback: «نمی‌شه! کلاً غلطه» after a stated result is a failure recorded in A.MIND.phases (s14) ' + JSON.stringify(info.e1d14)); }
  info.e1stuck = [];
  for (const t of ['پس راهی نیست', 'هیچ کاری نمیشه کرد']) { await newSess(); await say('معما: با دو ساعت‌شنیِ ۷ و ۱۱ دقیقه، ۱۵ دقیقه را اندازه بگیر'); const e0 = await ev(); await say(t); info.e1stuck.push([t, (await ev()) - e0]); }
  chk(info.e1stuck.every(x => x[1] === 1), 'E1 fallback: STUCK_RE catches «پس راهی نیست», «هیچ کاری نمیشه کرد» ' + JSON.stringify(info.e1stuck));
  info.e1teach = [];
  for (const t of ['شاگردام وقتی ازشون می‌پرسم مجهول چیه ساکت می‌مونن', 'تو شاگرد باش من معلم؛ این معما رو ازت می‌پرسم', 'دخترم یه مسئله داره دربارهٔ کسرها، چطوری بهش بگم که خودش بفهمه؟']) {
    await newSess(); await say(t); info.e1teach.push([t, /کاربر مربیِ یادگیرنده است/.test(coachOf(await lastUser()))]);
  }
  chk(info.e1teach.every(x => x[1]), 'E1 fallback: TEACH_RE catches «شاگردام…», «تو شاگرد باش من معلم», «دخترم یه مسئله داره… چطوری بهش بگم» ' + JSON.stringify(info.e1teach));
  info.e1live = [];
  for (const t of ['یه مسئلهٔ واقعی دارم، با هم حلش کنیم', 'می‌خوام اینو مسئله‌ی حل‌نشده‌ی خودم کنم', 'یه برنامه‌ی دقیق می‌خوام برای ورزشِ صبح']) {
    await newSess(); await say(t); info.e1live.push([t, /# مسئلهٔ واقعیِ حل‌نشده/.test(await lastUser())]);
  }
  chk(info.e1live.every(x => x[1]), 'E1 fallback: LIVE_ASK catches «یه مسئلهٔ واقعی دارم… با هم حلش کنیم», «مسئلهٔ حل‌نشدهٔ خودم», «یه برنامهٔ دقیق می‌خوام» ' + JSON.stringify(info.e1live));
  info.e1will = await p.evaluate(() => ({ tired: APP.willHookOn('خیلی خسته‌ام… تو رو خدا یه راهِ ساده بگو'), neutral: APP.willHookOn('یه معمای ساده دارم') }));
  chk(info.e1will.tired && !info.e1will.neutral, 'E1 fallback: the will hook catches the fatigue plea «خیلی خسته‌ام… تو رو خدا» ' + JSON.stringify(info.e1will));

  // ---------- E3) گیر در طرح رو به جلو ⇒ «از خواسته به عقب» نخست (s08)؛ فهرستِ قلاب بریده نمی‌شود ----------
  await newSess();
  await say('معما: فقط دو ساعت‌شنیِ ۷ و ۱۱ دقیقه‌ای داریم؛ تخم‌مرغ باید دقیقاً ۱۵ دقیقه بپزد.');
  await next('مجهول چیست؟');
  await say('مجهول اینه که چطور ۱۵ دقیقه رو اندازه بگیرم؛ داده‌ها دو ساعت‌شنیِ ۷ و ۱۱ دقیقه است؛ شرط اینه که فقط همین دو تا رو داریم');
  await say('از اول شروع کردم: ۷+۷=۱۴، ۱۱+۷=۱۸ … گیر کردم، رو به جلو هیچی جور نمی‌شه');
  { const c = coachOf(await lastUser()); info.e3 = { ph: phOf(c), sug: sugOf(c) };
    chk(info.e3.ph === 'طرح‌ریزی' && /به عقب/.test(info.e3.sug), 'E3: stuck going forward in planning ⇒ «از خواسته به عقب» is the suggested question (s08) ' + JSON.stringify(info.e3)); }

  // ---------- E6) قلمرو (بارِ سوم ِ R6): بی تطبیقِ تک‌واژه؛ دو واژهٔ متمایز (A4 > ½) یا پیوندِ صریح — جفت‌های پرنویزِ گزارش‌های دورِ ۴ ----------
  const NOISY = [
    ['هوم... راستش اگه فکر کنم، مهم‌ترینش اینه که پسرم تا هفت سال آینده یه جای امن و ثابت داشته باشه که هی اسباب‌کشی نکنیم، و قسط یا اجاره بیشتر از ۴۰ درصد درآمدمون نشه. سود بیشتر اونقدرا مهم نیست.', ['md_avoidance', 'dc_premortem_redteam']],
    ['سلام دوباره. دو روز گذشت. راستش ۵ تا ستون جدید هم اضافه کردم: قیمت طلا، قیمت دلار، پیش‌بینی انتخابات، نرخ بهره بانکی، شاخص بورس. فایلمو هم گذاشتم. هنوز حس می‌کنم داده کم دارم که تصمیم بگیرم.', ['ln_forgetting_consolidation']],
    ['فرض: ۵ نقطه، مربع ضلع ۱، نقطه‌ها داخلش. حکم: دو تا فاصله‌شون ≤ √۲/۲. هفت تا شکل کشیدم با ۵ نقطه، همیشه دو تا نزدیک بودن. پس درسته، ثابت شد دیگه!', ['md_attribution']],
    ['آهان، دو تا شرطه: یکی معنا — یه چیزی که تو دریا راه میره، یکی املا — کلمه‌ی پنج حرفی که برعکسش هم همونه، پالیندروم. واژه‌های دریایی پنج حرفی: ناخدا، کشتی‌ها نه... لنج؟ نه... آهان ناوبان؟ حرف دومش با عمودی «ا» درمیاد. هنوز پیدا نکردم.', ['ln_dual_coding']],
    ['سه بار دیدم، فاکتورها دست منه. ولی من فقط یه قاعده می‌خوام. یکی بگه قانون اینه، منم همونو انجام بدم که تقصیرش گردن من نباشه. اگه گزارش ندم شریک جرمم دیگه، نه؟', ['ln_attention']],
    ['سلام، دو شب گذشته. جالبه: یه روشی رو که هفته‌ی پیش خودم بهش «گفته بودم» (برای مسئله‌ی سن) کاملاً یادش رفته، ولی روش نخ رو یادشه و امروز خودش برای یه مسئله‌ی دیگه نخ آورد. چرا این‌طوریه؟', ['sf_personality']],
    ['روز سوم. صفحه گیر داده به واحدها، من نوشتم ۲۰۰ مترمربع ضرب در ۰.۱۲ متر میشه ۲۴ مترمکعب ولی باز میگه واحد ۲۰۰ رو بنویس! تازه فکر کردم باید دقیق‌تر بشه: داده‌ی تبخیر ماهانه، شیب بام، کیفیت آب بارون، و قیمت سیمان تا ۵ سال آینده رو هم دربیارم. از کجا پیدا کنم؟', ['dc_premortem_redteam', 'ln_forgetting_consolidation', 'dc_habits']],
    ['یک جمله... «تحت چه شرایطی شبکه‌ی E-I-PV نوسان گاما می‌سازه؟» ولی خب جزئیات مهمه، مثلاً g_PV-I هم... اوکی. استادم می‌گه شاید مسئله‌ی کلی‌تر رو ببینم، شبکه‌ی دو جمعیتی عمومی. ولی کلی‌تر که سخت‌تره!', ['sf_intelligence_g']],
    ['دو هفته گذشت. هفته‌ی اول دیوانه‌وار شبیه‌سازی کردم، هیچی. بعد چند روز رفتم سفر. توی اتوبوس یهو به ذهنم رسید: شاید فقط نسبت ثابت‌های زمانی مهمه، یعنی τ_I به τ_E! وقتی بیشتر از یه حدی باشه نوسان میاد. حس می‌کنم درسته.', ['dc_sunk_cost', 'dc_habits']],
  ];
  info.e6 = await p.evaluate((NOISY) => {
    const ids = (t) => APP.SYST.related(t, 4).map(r => r.a.id);
    const bad = NOISY.map(([t, no]) => [t.slice(0, 30), ids(t).filter(id => no.indexOf(id) >= 0)]).filter(x => x[1].length);
    const one = ids('یه جای امن می‌خوام');   // تک‌واژه هرگز
    const pos = { coll: ids('تو جلسه‌ها اطلاعاتِ پنهانِ هر نفر گفته نمی‌شه و استدلالِ جمعی خراب می‌شه'), neg: ids('می‌خوام سرِ حقوقم مذاکره کنم؛ محدودهٔ توافق چیه و بهترین جایگزینم کدومه؟'), ret: ids('بازیابی و یادآوری برای امتحان مرورِ فاصله‌دار و آزمونِ خود') };
    const link = /sc_collective_reasoning/.test(APP.SYST.knowledge({ know: [], tour: { facets: [{ key: 'f1', kind: 'area', area: 'sc_collective_reasoning', status: 'now' }] } }, 'سلام'));
    return { bad, one, pos: { coll: pos.coll.includes('sc_collective_reasoning'), neg: pos.neg.includes('sc_negotiation'), ret: pos.ret.includes('ln_retrieval') }, link };
  }, NOISY);
  chk(!info.e6.bad.length && !info.e6.one.length, 'E6: no territory from single words or non-distinctive shared words (the round-4 noisy pairs) ' + JSON.stringify(info.e6));
  chk(info.e6.pos.coll && info.e6.pos.neg && info.e6.pos.ret && info.e6.link, 'E6: a full multi-word area name, two distinctive shared words, or an explicit link still bring the area ' + JSON.stringify(info.e6));

  // ---------- E7) chat_invent: دادهٔ دیگر = مسئلهٔ دیگر (s31)؛ بازگفتِ فرزندِ بازنگری = همان مسئله (s11، s25) ----------
  const nLive = () => p.evaluate(() => APP.liveAll().length);
  const act = (o) => p.evaluate(o => __q.push(R(o)), o);
  await newSess();
  { const n0 = await nLive();
    await act({ reply: 'هر دو را نگه داشتم.', actions: [{ do: 'chat_invent', title: 'صحیح‌های متمایز با جمعِ ۱۰', statement: 'بیشترین حاصل‌ضربِ صحیح‌های مثبتِ متمایز با جمعِ ۱۰ چیست؟', nat: 'objective' }, { do: 'chat_invent', title: 'صحیح‌های متمایز با جمعِ ۱۰۰۰', statement: 'بیشترین حاصل‌ضربِ صحیح‌های مثبتِ متمایز با جمعِ ۱۰۰۰ چیست؟', nat: 'objective' }] });
    await say('دو تا مسئله ساختم: یکی با جمعِ ۱۰ و یکی سخت‌ترش با جمعِ ۱۰۰۰');
    info.e7 = { s31: (await nLive()) - n0 }; }
  await newSess();
  await act({ reply: 'ثبت شد.', actions: [{ do: 'chat_solved', title: 'پوشش با دومینو', statement: 'صفحهٔ شطرنجِ ۸×۸ که دو گوشهٔ مقابلش برداشته شده را می‌شود با دومینو پوشاند؟', kind: 'pod', lesson: 'رنگ‌آمیزی نشان داد دو گوشهٔ هم‌رنگ برداشته شده', check: 'شمردم: ۳۲ سفید و ۳۰ سیاه', newProb: 'کدام دو خانه را از صفحهٔ ۱۰×۱۰ بردارم که پوشش با دومینو ممکن شود؟' }] });
  await say('حلش کردم: رنگ‌آمیزی نشان داد دو گوشهٔ هم‌رنگ برداشته شده؛ شمردم: ۳۲ سفید و ۳۰ سیاه');
  { const par = await p.evaluate(() => APP.ASSIST.cur().lprob), n0 = await nLive();
    await act({ reply: 'نگهش داشتم.', actions: [{ do: 'chat_invent', statement: 'کدوم دو خونه رو بردارم که بشه پوشوند؟ فکر کنم هر دو خونه‌ای که رنگشون فرق داره کافیه.', title: 'کدام دو خانه را بردارم که پوشش ممکن شود', from: par, nat: 'objective' }] });
    await say('کدوم دو خونه رو بردارم که بشه پوشوند؟ فکر کنم هر دو خونه‌ای که رنگشون فرق داره کافیه.');
    info.e7.s11 = (await nLive()) - n0; }
  await newSess();
  await act({ reply: 'ثبت شد.', actions: [{ do: 'chat_solved', title: 'جمعِ تلسکوپیِ دوتایی', statement: 'جمعِ ۱/(1·2) + ۱/(2·3) + … تا n جمله را پیدا کن', kind: 'find', lesson: 'هر جمله را به تفاضلِ دو کسر شکستم', check: 'برای n = ۳ حساب کردم', newProb: 'جمعِ ۱/(1·2·3) + … تا n جمله چند می‌شود؟' }] });
  await say('حلش کردم: هر جمله را به تفاضلِ دو کسر شکستم؛ برای n = ۳ حساب کردم');
  { const par = await p.evaluate(() => APP.ASSIST.cur().lprob), n0 = await nLive();
    await act({ reply: 'نگهش داشتم.', actions: [{ do: 'chat_invent', statement: 'خودم الگوی ۱/(1·2·3) + ۱/(2·3·4) + … رو ساختم. حدسم اینه که میشه ۱/۴ − ۱/(2(n+1)(n+2)). سه تاشو چک کردم.', title: 'جمعِ ۱/(k(k+1)(k+2))', from: par }] });
    await say('خودم الگوی ۱/(1·2·3) + ۱/(2·3·4) + … رو ساختم. حدسم اینه که میشه ۱/۴ − ۱/(2(n+1)(n+2)). سه تاشو چک کردم.');
    info.e7.s25 = (await nLive()) - n0; }
  chk(info.e7.s31 === 2, 'E7: «… جمعِ ۱۰۰۰» is a different problem from «… جمعِ ۱۰» (changed data) — two records (s31) ' + JSON.stringify(info.e7));
  chk(info.e7.s11 === 0 && info.e7.s25 === 0, 'E7: a paraphrase of the look-back child (same parent, no conflicting data; shared words or the same formula) updates it instead of a second record (s11, s25) ' + JSON.stringify(info.e7));

  // ---------- E8) قلّابِ «💡 ایده» نه برای ایدهٔ حل؛ سطرهای منبع در مرحلهٔ خودشان؛ ضرب‌المثلِ خودِ کاربر؛ میانهٔ راه بی تعارض ----------
  await newSess();
  await say('معما: با دو ساعت‌شنیِ ۷ و ۱۱ دقیقه، ۱۵ دقیقه را اندازه بگیر');
  await say('یه ایده برای پلان به ذهنم رسید: از آخر شروع کنم');
  info.e8 = { ideaPlan: !/# ایده \(«💡 جایگاهِ ایده»\)/.test(await lastUser()) };
  await newSess(); await say('یه ایده دارم: یه کانال آموزش آشپزی بزنم'); info.e8.ideaBiz = /# ایده \(«💡 جایگاهِ ایده»\)/.test(await lastUser());
  info.e8.lines = await p.evaluate(() => { const AS = APP.ASSIST, P = AS.coachLines({ ph: 'p', cls: 'pract', qs: [], dry: true }), C = AS.coachLines({ ph: 'c', cls: 'obj', qs: [], dry: true }), B = AS.coachLines({ ph: 'b', cls: 'obj', qs: [], dry: true }), CP = AS.coachLines({ ph: 'c', cls: 'pract', qs: [], dry: true });
    return { defLife: /به تعریف‌ها برگرد/.test(P) && /شریکِ جرم/.test(P), inventor: /پارادوکسِ مخترع/.test(P), heur: /ناتمام — اکتشافی/.test(C) && !/ناتمام — اکتشافی/.test(CP), mush: /قارچ‌ها خوشه‌ای/.test(B) }; });
  info.e8.prov = await p.evaluate(() => { const AS = APP.ASSIST; return { own: /ضرب‌المثل یا قاعدهٔ عامیانهٔ خودش/.test(AS.coachLines({ ph: 'p', cls: 'pract', qs: [], dry: true, mt: 'دیگه آب که از سر گذشت، چه یک وجب چه صد وجب' })), none: !/ضرب‌المثل یا قاعدهٔ عامیانهٔ خودش/.test(AS.coachLines({ ph: 'p', cls: 'pract', qs: [], dry: true, mt: 'طرحم اینه که اول کیسه‌ها رو جدا کنم' })),
    will: (/ضرب‌المثلِ همین مرحله \(پولیا، «حکمتِ ضرب‌المثل‌ها»\): «([^»]+)»/.exec(AS.coachLines({ ph: 'c', cls: 'pract', qs: [], dry: true, mt: 'خسته شدم، ول می‌کنم' })) || [])[1] || '' }; });
  chk(info.e8.ideaPlan && info.e8.ideaBiz, 'E8: «یه ایده برای پلان به ذهنم رسید» while solving does not bring the 💡 idea hook; a real business idea still does ' + JSON.stringify(info.e8));
  chk(Object.values(info.e8.lines).every(Boolean), 'E8: «back to definitions» (every kind), inventor\'s paradox (plan), «label heuristic proof incomplete» (exec/look-back, not practical), «mushrooms grow in clusters» (look-back) from the source items ' + JSON.stringify(info.e8.lines));
  chk(info.e8.prov.own && info.e8.prov.none && info.e8.prov.will && !/سخت‌کوشی/.test(info.e8.prov.will), 'E8: the user\'s own proverb gets a prompt line; explicit giving-up gets the will proverb before incubation ' + JSON.stringify(info.e8.prov));

  // ================= صفحهٔ «🔭»: E3 فهرستِ کامل و بی‌برش؛ «همهٔ داده‌ها؟» نه در آغازِ طرح؛ E1 شناسهٔ پرسشِ مسئلهٔ زنده؛ میانهٔ راه =================
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const q = await ctx.newPage();
    q.on('pageerror', e => errors.push('pageerror(live): ' + e.message));
    q.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
    await q.route('**/fonts.googleapis.com/**', r => r.abort());
    const Wq = (ms) => q.waitForTimeout(ms || 90);
    const go = async (v, a, s) => { await q.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await Wq(140); };
    const sel = async (s, v) => { await q.selectOption(s, v); await Wq(120); };
    const click = async (s) => { await q.click(s); await Wq(160); };
    const has = (s) => q.locator(s).count();
    const mk = async (o) => { await go('e_prob', null, 'live'); if (o.title != null) await q.fill('#lpNewT', o.title); await q.fill('#lpNewS', o.st); await Wq(60); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return q.evaluate(() => APP.state.arg); };
    const understand = async (o) => {
      await q.fill('#lpOne', o.one); await q.fill('#lpWhy', 'برایم مهم است و کنجکاوم'); await click('main .lp-onesave');
      await q.fill('#lpUnk', o.unk);
      for (let i = 0; i < o.data.length; i++) { if (i >= 2) await click('main .lp-dadd'); await q.fill('#lpD_d' + (i + 1), o.data[i]); }
      await q.fill('#lpCond', o.cond);
      if (await has('#lpSat')) await sel('#lpSat', 'yes');
      await sel('#lpSuff', 'کافی است'); if (await has('#lpSuffW')) await q.fill('#lpSuffW', 'همین‌ها بس است');
      await q.fill('#lpGuess', 'شدنی است'); await sel('#lpConf', '60'); await q.fill('#lpTest', 'با یک حالتِ خاص می‌آزمایم');
      await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
      await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    };
    const sayQ = async (text, st) => { await q.evaluate(st => { if (st) __q.push({ reply: 'بگو.', status: 'related', memory: 'm', actions: [Object.assign({ do: 'coach_state' }, st)] }); }, st || null); await q.evaluate(() => APP.ASSIST.toggle(true)); await q.fill('.as-panel .as-in', text); await q.click('.as-panel .as-send'); await q.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 }); };
    await q.goto(FILE); await q.waitForSelector('.nav'); await Wq(300);
    await q.evaluate(() => { APP.S.loaded = true; window.__calls = []; window.__q = [];
      APP.callAI = async (sys, user, opts) => { __calls.push({ user }); const r = __q.shift(); const t = JSON.stringify(r || { reply: 'باشه.', status: 'related', memory: 'm', actions: [] }); return opts && opts.withMeta ? { text: t, files: [] } : t; }; });
    const P1 = await mk({ title: 'لوله در بار', st: 'یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟', nat: 'objective' });
    await understand({ one: 'می‌خواهم بدانم بلندترین پاره‌خطِ درونِ بار از چهار متر بلندتر است یا نه', unk: 'بلندترین پاره‌خطِ درونِ بار', data: ['طول ۳.۲ متر', 'عرض ۱.۸ متر', 'ارتفاع ۱.۶ متر'], cond: 'لوله صاف است و باید کامل درونِ بار باشد' });
    await q.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); });
    await sayQ('خب حالا طرح چی باشه؟', { ph: 'p', said: [], ans: ['p1'], stuck: false, fail: false, role: 'self', nat: 'objective' });
    const u1 = await q.evaluate(() => __calls[__calls.length - 1].user);
    const L = await q.evaluate(pid => APP.livePhaseQs(pid, 'p'), P1);
    const line = (/^- پرسش‌های همین مرحله[^\n]*$/m.exec(u1) || [''])[0];
    info.e3live = { n: L.length, full: L.every((x, k) => line.indexOf('p' + (k + 1) + ') «' + x + '»') >= 0), dataLine: /^- داده‌هایی که هنوز/m.test(u1) };
    await sayQ('آره یه چیزی شبیهش دیدم، قطرِ مستطیل');
    const u2 = await q.evaluate(() => __calls[__calls.length - 1].user);
    info.e3live.p1Marked = new RegExp('p1\\) «[^»]*» \\[در گفت‌وگو پاسخ گرفته').test(u2);
    await sayQ('نمی‌دونم، گیر کردم');
    info.e3live.dataStuck = /^- داده‌هایی که هنوز/m.test(await q.evaluate(() => __calls[__calls.length - 1].user));
    chk(info.e3live.full, 'E3: the live block lists the WHOLE phase list (not cut at 7, no clipped question), with ids ' + JSON.stringify(info.e3live) + ' ' + line.slice(0, 300));
    chk(!info.e3live.dataLine && info.e3live.dataStuck, 'E3: «have you used all the data?» is not raised at the start of planning (no plan, not stuck) — only when stuck or once a plan exists ' + JSON.stringify(info.e3live));
    chk(info.e3live.p1Marked, 'E1: the model\'s «ans: p1» on the live problem\'s list marks that page question answered in chat ' + JSON.stringify(info.e3live));
    await ctx.close();
  }

  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 8000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
