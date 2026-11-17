// تورِ پولیا (دستهٔ ۱، دورِ ۲۹ — سهمِ «dates»، DECISIONS_R29 R4/F6؛ C117، C144–C147، C133، C165–C167) — قرمزِ اول از **جمله‌های خودِ دونده‌ها**.
//  C134: هر مورد روی هفت روزِ هفته اجرا می‌شود (ساعتِ صفحه یخ‌زده: دوشنبه ۲۵ آبان ۱۴۰۵ + k) و هر روزِ انتظار از تقویمِ خودِ صفحه ساخته می‌شود؛ نامِ روزهای هفته در جمله‌ها
//  نسبت به همان روز (نه نامِ ثابت) تا هیچ موردی در روزِ هم‌نامش دوپهلو نشود. ابزارهای صفحه (HELPERS) همان ابزارهای test_tour1_r29_dates_bank.js اند (از همان فایل خوانده می‌شوند).
//  هر مورد یک منفیِ هم‌شکل از رونوشت‌های واقعی هم دارد (C136). ONLY=<نام‌ها> WD=<k‌ها>
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const SRC = fs.readFileSync(path.join(__dirname, 'test_tour1_r29_dates_bank.js'), 'utf8');
const HELPERS = eval('(' + SRC.split('const HELPERS = ')[1].split('\n};\n')[0] + '\n})');
const T0 = Date.parse('2026-11-16T10:00:00+03:30');

(async () => {
  let b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const errors = [], res = {};
  let ctx = null, p = null, K = 0;
  const open = async (ms) => { if (ctx) await ctx.close().catch(() => { }); if (!b.isConnected()) b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'Asia/Tehran' }); p = await ctx.newPage();
    p.on('pageerror', e => errors.push('pageerror: ' + e.message)); p.on('dialog', d => { d.dismiss(); }); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.clock.install({ time: new Date(ms) }); await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(150); await p.evaluate(HELPERS); };
  const E = (fn, arg) => p.evaluate(fn, arg);
  const fresh = async (n) => { await open(T0 + (K + (n || 0)) * 864e5); };
  const day = async (n) => { await p.clock.setSystemTime(new Date(T0 + (K + n) * 864e5)); };
  const WDS = (process.env.WD ? process.env.WD.split(',').map(Number) : [0, 1, 2, 3, 4, 5, 6]);
  const X = (name, ok, x) => { res[name] = (res[name] === undefined ? true : res[name]) && !!ok; if (!ok) errors.push(name + ' (k=' + K + ') :: ' + JSON.stringify(x).slice(0, 1400)); };
  const run = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').some(o => name.indexOf(o) === 0)) return; for (const k of WDS) { K = k; for (let t = 0; t < 2; t++) { try { await fn(); break; } catch (e) { const m = String(e && e.message || e).split('\n')[0]; if (t === 0 && /crashed|ERR_|closed/i.test(m)) { try { await b.close(); } catch (e2) { } b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); ctx = null; continue; } errors.push(name + ' k=' + k + ' exception: ' + m); res[name] = false; break; } } } };

  /* B29·D18 + D19 (dB2 c7–c10): «آره، فردا و پس‌فردا» ⇒ هر دو؛ «زنگ زدم» ⇒ «کدام؟»؛ «به بانک. صاحب‌خونه بمونه برای فردا» ⇒ فقط بانک */
  await run('B29·D18/D19 dB2', async () => { await fresh(0);
    const r = await E(async () => { const o = { d1: __D(1), d2: __D(2) };
      await __say('طرحم: هر روز یه تسک ۲ رایتینگ می‌نویسم. فردا هم به بانک زنگ می‌زنم برای پولِ ثبت‌نام، پس‌فردا هم به صاحب‌خونه زنگ می‌زنم برای تمدید.');
      let n0 = __sys().length; await __say('آره، فردا و پس‌فردا. نشانه‌ش اینه که استادم دیگه نگه «پرش داری».'); o.l8 = __sys().slice(n0); o.wb = __when(/بانک/); o.wl = __when(/صاحب/); return o; });
    X('B29·D18 C145 «آره، فردا و پس‌فردا» ⇒ بانک D0+1، صاحب‌خانه D0+2', r.wb === r.d1 && r.wl === r.d2 && !r.l8.some(x => /به‌جای/.test(x)), r);
    await day(1);
    const r2 = await E(async () => { let n0 = __sys().length; await __say('روی پاراگرافِ دوم. سلام، امروز سه‌شنبه‌ست. زنگ زدم.'); const o = { l9: __sys().slice(n0), ob: __open(/بانک/), ol: __open(/صاحب/) };
      n0 = __sys().length; await __say('به بانک. صاحب‌خونه بمونه برای فردا. ایمیلِ استاد رو هم دیروز زدم.'); o.l10 = __sys().slice(n0); o.db = __done(/بانک/); o.ol2 = __open(/صاحب/); o.wl = __when(/صاحب/); o.d1 = __D(1); return o; });
    X('B29·D19 C117 «زنگ زدم» ⇒ «کدام؟» و هیچ‌کدام بسته نشد', r2.l9.some(x => /«زنگ زدم\.?» — کدام؟/.test(x)) && r2.ob && r2.ol, r2);
    X('B29·D19 پاسخ ⇒ بانک «انجام شد»، صاحب‌خانه باز روی همان روزِ خودش (C167: «فردا» = روزِ ثبت‌شده ⇒ بی تغییر، بی پرسش)', r2.db && r2.ol2 && r2.wl === r2.d1 && !r2.l10.some(x => /^📅|↻/.test(x)), r2);
  });
  /* C167 دیگرسو: «بمونه برای فردا» وقتی روزِ ثبت‌شده فردا نیست ⇒ با تاریخچه به فردا */
  await run('C167 move', async () => { await fresh(0);
    await E(async () => { await __say('پس‌فردا هم به صاحب‌خونه زنگ می‌زنم برای تمدید'); await __say('آره'); await __say('سه روز دیگه هم به بانک زنگ می‌زنم'); await __say('آره'); });
    const r = await E(async () => { const n0 = __sys().length; await __say('صاحب‌خونه بمونه برای فردا.'); return { l: __sys().slice(n0), wl: __when(/صاحب/), d1: __D(1) }; });
    X('C167 «صاحب‌خونه بمونه برای فردا» (ثبت: D0+2) ⇒ همان رکورد به D0+1 با سطرِ «↻»', r.wl === r.d1 && r.l.some(x => /^↻/.test(x)), r); });
  /* D29-18 (tD2 c34–c37): دو تماس هنوز در پرسش + برنامهٔ گزارش‌شدهٔ مدل */
  await run('D29-18 tD2', async () => { await fresh(0);
    const r = await E(async () => { const o = { d1: __D(1), d2: __D(2) };
      await __say('فردا به شرکتِ گاز زنگ می‌زنم، پس‌فردا هم به مدرسهٔ دخترم زنگ می‌زنم.', 'خب.', __plan('فردا به شرکتِ گاز زنگ می‌زنم'));
      let n0 = __sys().length; await __say('زنگ زدم.'); o.lz = __sys().slice(n0); o.dg = __done(/گاز/); o.p1 = __pend();
      n0 = __sys().length; await __say(__dm(o.d1) + ' و ' + __dm(o.d2) + ' درسته.'); o.ld = __sys().slice(n0); o.wg = __when(/گاز/); o.ws = __when(/مدرسه/); return o; });
    X('D29-18 C117: «زنگ زدم.» ⇒ «کدام؟» (گاز/مدرسه)؛ گاز بسته نشد؛ پرسش‌ها ماندند', r.lz.some(x => /کدام؟/.test(x) && /گاز/.test(x) && /مدرسه/.test(x)) && !r.dg && r.p1.length === 2, r);
    X('D29-18 C145: «⟨D0+1⟩ و ⟨D0+2⟩ درسته» ⇒ هر دو ثبت', r.wg === r.d1 && r.ws === r.d2, r); });
  /* منفیِ C117 (C136، bank #160 و A27-19 aA3 «سلام. زنگ زدم …»): یک تماس ⇒ همان بسته، بی «کدام؟» */
  await run('C117 neg one call', async () => { await fresh(0); await E(async () => { await __say('فردا به داروخانه زنگ می‌زنم'); await __say('آره'); }); await day(1);
    const r = await E(async () => { const n0 = __sys().length; await __say('سلام. زنگ زدم، گفتن دارو رسیده.'); return { l: __sys().slice(n0), d: __done(/داروخانه/) }; });
    X('C117 منفی: یک تماس ⇒ «انجام شد» بی «کدام؟»', r.d && !r.l.some(x => /کدام؟/.test(x)), r); });
  /* B29·D20 (dB2 c12–c15): ✏️ به سه‌شنبه‌ای که گذشته؛ پاسخِ «سه‌شنبه‌ی هفته‌ی بعد، ⟨روز⟩. وسطِ ماه هم کارگر میاد …» */
  await run('B29·D20 dB2', async () => { await fresh(0);
    const r0 = await E(async () => { const t = 'سلام. مسئله‌م اینه که رایتینگم بره بالا. ' + __wn(__D(3)) + ' هم با استادم جلسه دارم.'; await __say(t, 'خب.', __plan(__wn(__D(3)) + ' هم با استادم جلسه دارم')); await __say('آره'); return { t }; });
    await day(3);
    const r = await E(async (a) => { const o = { d8: __D(5) }; let n0 = __sys().length; o.ok = await __edit(__um(0), a.t.replace(/(\S+) هم با استادم/, __wn(__D(-2)) + ' هم با استادم')); o.le = __sys().slice(n0);
      n0 = __sys().length; /* «X‌ی هفته‌ی بعد، ⟨روز⟩» فقط وقتی هر دو یک روزند (هفتهٔ شنبه–جمعه)؛ وگرنه فقط خودِ روز — دو روزِ ناهمسان را صفحه حدس نمی‌زند (درست است که بی‌جواب بماند) */
      const nw = APP.PR.whenInfo(__wn(o.d8) + '‌ی هفته‌ی بعد'); const ans = (nw && nw.date === o.d8 ? __wn(o.d8) + '‌ی هفته‌ی بعد، ' : '') + __dm(o.d8);
      await __say(ans + '. وسطِ ماه هم کارگر میاد برای تعمیرِ بخاری.'); o.l = __sys().slice(n0); o.w = __when(/استاد/); o.pend = __pend(); return o; }, r0);
    X('B29·D20 ✏️ ⇒ فقط «این روز گذشته — کدام روز؟» (یک ردیف)', r.ok && r.le.filter(x => /^📅/.test(x)).length === 1 && r.le.some(x => /گذشته — کدام روز؟/.test(x)) && !r.le.some(x => /از حرفِ خودت/.test(x)), r);
    X('B29·D20 C145 پاسخِ روزِ تنها در پیامِ چندجمله‌ای ⇒ جلسه همان روز ثبت؛ «کارگر» پرسشی نساخت', r.w === r.d8 && !r.l.some(x => /بی‌جواب ماند|کارگر/.test(x)) && !r.pend.length, r); });
  /* D29-25 (s34 p4–p5) و منفیِ آن (bank #167) */
  await run('D29-25 s34', async () => { await fresh(0);
    const r = await E(async () => { const o = { d2: __D(2) }; /* اصلاحِ «منظورم پس‌فردا صبح بود» را در اجرای واقعی مدل گزارش کرد و صفحه همان پس‌فردا را دوباره پرسید (بازپخشِ D_s34)؛ این‌جا همان پرسش مستقیم */
      await __say('نمی‌دونم... فقط دلسردم. شاید یه اسکیس سایت. فقط یه اسکیس دستی از زمین پروژه، پس‌فردا صبح ۲۰ دقیقه.', 'خب.', __plan('یه اسکیس دستی از زمین پروژه، پس‌فردا صبح ۲۰ دقیقه')); o.p = __pend(); const n0 = __sys().length; await __say('ثبتش کردم. پس‌فردا صبح انجامش میدم.'); o.l = __sys().slice(n0); o.w = __when(/اسکیس/); return o; });
    X('D29-25 C49/C145 «ثبتش کردم. پس‌فردا صبح انجامش میدم» ⇒ ثبت D0+2 و هیچ پرسشِ دوم', r.w === r.d2 && !r.l.some(x => /بی‌جواب ماند|^📅/.test(x)), r); });
  /* B29·D21 (dB2 c12–c14) — C144 */
  await run('B29·D21 dB2', async () => { await fresh(0);
    const r = await E(async () => { const o = { m: __m15(), wa: __wn(__D(3)), wb: __wn(__D(4)) }; const t = 'آزمونِ آیلتسم وسطِ ماهِ دیگه‌ست، یعنی حدودِ ' + __dm(o.m) + '. ' + o.wa + ' هم با استادم جلسه دارم.';
      await __say(t); await __say('آره'); o.ex0 = __when(/آیلتس/); const n0 = __sys().length; o.ok = await __edit(__um(0), t.replace(o.wa + ' هم', o.wb + ' هم')); o.l = __sys().slice(n0); o.ex = __when(/آیلتس/); o.dl = __dlAll(); return o; });
    X('B29·D21 C144 ✏️ ِ روزِ جلسه موعدِ آزمون را نبست و نپرسید', r.ok && r.ex0 === r.m && r.ex === r.m && !r.dl.some(x => /آیلتس/.test(x.what) && x.by === 'replaced') && !r.l.some(x => /آیلتس/.test(x)), r); });
  /* C146 (aC3 c85 ✏️ «۲۰ آبان رفتم») و منفی (bank #170: ✏️ به روزِ گذشته بی فعلِ گذشته ⇒ C93) */
  await run('C146 edit', async () => { await fresh(0);
    const r = await E(async () => { const o = { dp: __D(-5) }; await __say('پنجشنبه نه، ' + __wn(__D(4)) + ' می‌رم بانک که حسابِ پس‌انداز رو جدا کنم.', 'خب.', __plan(__wn(__D(4)) + ' می‌رم بانک که حسابِ پس‌انداز رو جدا کنم')); await __say('آره');
      const n0 = __sys().length; o.ok = await __edit(__um(0), 'پنجشنبه نه، ' + __dm(o.dp) + ' رفتم بانک که حسابِ پس‌انداز رو جدا کنم.'); o.l = __sys().slice(n0); o.pl = __pl(); o.pend = __pend(); return o; });
    X('C146 ✏️ ِ «⟨روزِ گذشته⟩ رفتم بانک» ⇒ «انجام شد» در همان روز؛ هیچ «کدام روز؟»', r.ok && r.pl.some(q => /بانک/.test(q.text) && q.state === 'done' && q.day === r.dp) && !r.l.some(x => /کدام روز؟/.test(x)) && !r.pend.length, r); });
  await run('C146 chat', async () => { await fresh(-6); await E(async () => { await __say(__dm(__D(2)) + ' می‌رم بانک که حسابِ پس‌انداز رو جدا کنم'); await __say('آره'); }); await day(0);
    const r = await E(async () => { const o = { dp: __D(-3) }; const n0 = __sys().length; await __say(__dm(o.dp) + ' رفتم بانک و حساب رو جدا کردم.'); o.l = __sys().slice(n0); o.dl = __dlAll(); return o; });
    X('C146 گفت‌وگو: کارِ گذشته با روزِ گذشته ⇒ «انجام شد» در همان روز؛ بی پرسش', r.dl.some(x => /بانک/.test(x.what) && x.done && x.day === r.dp) && !r.l.some(x => /^📅/.test(x)), r); });
  await run('C93 neg (not past act)', async () => { await fresh(0);
    const r = await E(async () => { await __say('فردا می‌رم بانک', 'خب.', __plan('فردا می‌رم بانک')); await __say('آره'); const n0 = __sys().length; await __edit(__um(0), __dm(__D(-2)) + ' می‌رم بانک'); return { l: __sys().slice(n0), pl: __pl() }; });
    X('C146 منفی: ✏️ به روزِ گذشته با فعلِ آینده ⇒ C93 «این روز گذشته — کدام روز؟»', r.l.some(x => /گذشته — کدام روز؟/.test(x)) && !r.pl.some(q => q.state === 'done'), r); });
  /* C29-6 (aC3 p42) و منفیِ آن (همان کار با روزِ تازه پرسش را جواب می‌دهد — C92 B28·D6 «وسطِ ماه یعنی …») */
  await run('C29-6 aC3', async () => { await fresh(0);
    const r = await E(async () => { const o = { d2: __D(2) }; await __say('یه برنامه: ' + __wn(__D(6)) + ' می‌رم داروخونه دفترچه‌م رو تمدید کنم.', 'خب.', __plan(__wn(__D(6)) + ' می‌رم داروخونه دفترچه‌م رو تمدید کنم')); await __say(__wn(__D(6)) + ' درسته.');
      await __edit(__um(0), 'یه برنامه: ' + __dm(__D(-1)) + ' می‌رم داروخونه دفترچه‌م رو تمدید کنم.'); const n0 = __sys().length; await __say('پسفردا می‌رم بیمه رو تمدید کنم؛ امروز صبح فرمش رو پر کردم.'); o.l = __sys().slice(n0); o.pl = __pl(); o.pend = __pend();
      const n1 = __sys().length; await __say('داروخونه رو پسفردا می‌رم.'); o.l2 = __sys().slice(n1); o.wp = __when(/داروخونه/); return o; });
    X('C29-6 C147 «پسفردا … بیمه» پرسشِ داروخانه را جواب نداد؛ بیمه پرسشِ خودش', !r.l.some(x => /ثبت شد/.test(x) && /داروخونه/.test(x)) && r.pend.some(x => /داروخونه/.test(x.what) && x.past) && r.pend.some(x => /بیمه/.test(x.what) && x.date === r.d2), r);
    X('C29-6 منفی: «داروخونه رو پسفردا می‌رم» همان پرسش را جواب داد (D0+2)', r.wp === r.d2, r); });
  /* A29-12 (s03 c103) و منفی (C147: روزِ کار در جملهٔ دیگری همان پیام هنوز خوانده می‌شود) */
  await run('A29-12 s03', async () => { await fresh(0);
    const r = await E(async () => { const o = { th: __D(3), td: APP.today() }; await __say(__wn(o.th) + ' برهانِ کاملشو می‌نویسم.'); const n0 = __sys().length;
      await __say('اشتباه کردم که دیشب تا دیروقت بیدار موندم، امروز خسته‌ام. معلمم هم گفت «اشتباه گفتی، ۱۲ نقطه لازمه»، ولی من مطمئن نیستم حق با اون باشه.'); o.l = __sys().slice(n0); o.pend = __pend(); return o; });
    X('A29-12 C147 جملهٔ حال روزِ برنامه را جابه‌جا نکرد', !r.l.some(x => /به‌جای/.test(x)) && !r.pend.some(x => x.date === r.td), r); });
  /* A29-17 (s07 p11) و منفی (C147 نزدیک‌ترین رخداد: «۱ فروردین» در اسفند سالِ بعد است) */
  await run('A29-17 s07', async () => { await fresh(0);
    const r = await E(async () => { const n0 = __sys().length; const t = 'با عددهای درست: میانگینِ قدها (۴ + ۸ + ۱۳ + ۱۵ + ۱۶) / ۵ = ۱۱٫۲ سانت. اندازه‌گیریِ بعدی ' + __dm(__D(-33)) + 'ه.'; await __say(t); return { t, l: __sys().slice(n0), ny: __D(200) }; });
    X('A29-17 C93 روزِ گذشتهٔ بی‌سال ⇒ «این روز گذشته — کدام روز؟»؛ هرگز سالِ بعد', r.l.some(x => /این روز \([^)]*\) گذشته — کدام روز؟/.test(x)) && !r.l.some(x => /۱۴۰۶/.test(x)), r); });
  await run('A29-17 neg next', async () => { await fresh(0);
    const r = await E(async () => { const d = __D(20); const n0 = __sys().length; await __say('اندازه‌گیریِ بعدی ' + __dm(d) + 'ه، اون روز دوباره قد رو می‌سنجم.'); return { d, l: __sys().slice(n0), pend: __pend() }; });
    X('A29-17 منفی: روزِ آینده ⇒ پرسشِ عادیِ همان روز (نه «گذشته»)', r.pend.some(x => x.date === r.d && !x.free) && !r.l.some(x => /گذشته/.test(x)), r); });
  /* A29-5 (s01 p33–p36، C133) */
  await run('A29-5 s01', async () => { await fresh(0);
    const r = await E(async () => { const o = { m: __m15() }; await __say('وسطِ ماهِ دیگه یه سر به خونهٔ قبلی می‌زنم که کنتور رو ببینم.'); await __say('آخرِ سالِ تحصیلی هم کارم سبک‌تر میشه؛ اون موقع اسباب‌کشیِ اصلی رو انجام می‌دیم.');
      const n0 = __sys().length; await __say('وسطِ ماهِ دیگه یعنی حدودِ ' + __dm(o.m) + '؛ همون موقع کنتور رو می‌بینم.'); o.l = __sys().slice(n0); o.w = __when(/کنتور/); o.pend = __pend(); return o; });
    X('A29-5 C133 «… یعنی حدودِ ⟨۱۵⟩؛ همون موقع کنتور رو می‌بینم» ⇒ ردیفِ کنتور همان روز ثبت؛ بی ردیفِ دوم', r.w === r.m && !r.l.some(x => /^📅/.test(x)) && !r.pend.some(x => /کنتور/.test(x.what)), r); });
  /* B29·D22 (dB2 p16) */
  await run('B29·D22 dB2', async () => { await fresh(0);
    await E(async () => { await __say('اینو ثبتش کن: ' + __wn(__D(4)) + ' ساعت ۱۰ کلاسِ رفعِ اشکالِ رایتینگ دارم. فکر می‌کنم واژه‌ها زودتر دیده میشن.'); await __say('آره درسته.'); });
    await day(5); const r = await E(async () => ({ rows: __rows(), pr: ((__cur() || {}).promises || []).filter(x => !x.done).map(x => x.ask) }));
    X('B29·D22 «ثبتش کن: ⟨روز⟩ … کلاس» ⇒ هیچ خواستهٔ عقب‌افتادهٔ جدا', !r.pr.length && !r.rows.some(x => /خواسته‌ای که گذاشتی برای بعد/.test(x)), r); });
  await run('B29·D22 neg later', async () => { await fresh(0);
    const r = await E(async () => { await __say('آره جدا ثبتش کن ولی بعداً، الان وقت ندارم.'); return { pr: ((__cur() || {}).promises || []).map(x => x.ask) }; });
    X('B29·D22 منفی: «ثبتش کن ولی بعداً» هنوز خواستهٔ عقب‌افتاده است', r.pr.length === 1, r); });

  try { await b.close(); } catch (e) { }
  const ks = Object.keys(res); console.log(JSON.stringify({ cases: ks.length, ok: ks.filter(k => res[k]).length, red: ks.filter(k => !res[k]) }));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS — test_tour1_r29_dates');
})();
