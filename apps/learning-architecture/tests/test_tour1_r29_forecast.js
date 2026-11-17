// تورِ پولیا (دستهٔ ۱، دورِ ۲۹، سهمِ «forecast»: R5 🎯؛ خانوادهٔ F4؛ DECISIONS_R29 C148/C168، C152، C119، C121، C90، C91) — قرمزِ نخست با جمله‌های خودِ دونده‌های
// هر چهار گروه (ai/pN.json ِ T/round29X)، هر مثبت با بدلِ منفیِ خودش از همان رونوشت‌ها (C136). روی ساختِ BASE29 (40b34a51) قرمز.
//  ساعتِ صفحه روی «دوشنبهٔ بعد از امروزِ خودِ اجرا، ۹ صبح» ثابت است (روزهای هفته دوپهلو نیستند)؛ هیچ تاریخِ تقویمی در انتظارها نیست.
//  LLA_FILE = ساختِ دیگر؛ ONLY=<نامِ بخش‌ها با ویرگول>.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const D0 = (() => { const d = new Date(); d.setHours(9, 0, 0, 0); do { d.setDate(d.getDate() + 1); } while (d.getDay() !== 1); return d; })();
const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const wd = (n) => { const d = new Date(D0); do { d.setDate(d.getDate() + 1); } while (d.getDay() !== n); return iso(d); };

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0 };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('dialog', d => { d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.clock.install({ time: D0 });
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__q = []; window.__noNav = true;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => { let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
    window.__turn = async (text, acts) => { __q.push({ reply: 'خوب.', status: 'related', memory: 'm', actions: acts || [] }); await APP.ASSIST.send(text); __q.length = 0; };
    window.__live = (T, St) => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc', 'ex'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur');
      APP.go('home'); APP.ASSIST.newSession(); const pid = APP.liveCreate(T || 'مسئلهٔ آزمون', St || 'یه مسئلهٔ واقعی دارم که باید حلش کنم و ببینم چی میشه.', 'find', { by: 'user', sess: APP.ASSIST.cur().id }).p.id; APP.liveBindSession(pid, APP.ASSIST.cur(), { force: true }); return pid; };
    window.__live2 = (T, St) => { const pid = APP.liveCreate(T, St, 'find', { by: 'user', sess: APP.ASSIST.cur().id }).p.id; APP.liveBindSession(pid, APP.ASSIST.cur(), { force: true }); return pid; };
    window.__st = () => { const s = APP.ASSIST.cur(); return { fc: APP.S.all('fcast').filter(x => !x.sample).map(x => ({ q: x.q, p: x.p, due: x.due || '', out: x.outcome || '', prob: x.prob ? (x.prob.pid || x.prob.pk) : '' })),
      ask: s.predAsk && s.predAsk.state === 'open' ? s.predAsk.kind : '', sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text) }; };
  });
  const run = async (turns, T, St) => { await p.evaluate(([T, St]) => __live(T, St), [T || '', St || '']); const out = []; for (const t of turns) { const [x, a] = Array.isArray(t) ? t : [t, null]; await p.evaluate(([x, a]) => __turn(x, a), [x, a]); out.push(await p.evaluate(() => __st())); } return out; };
  const J = (x) => JSON.stringify(x);
  const nz = (x) => String(x || '').replace(/[‌\s]+/g, ' ').trim();
  const newSys = (A, i) => A[i].sys.slice(i ? A[i - 1].sys.length : 0);
  const planAsk = (L) => L.some(x => /در «امروز» بیاید/.test(x));
  const K = {};

  /* ---------- C148: درصدِ داده هرگز اطمینان نیست (A29-4 s01 p15، pA3 p10؛ B29·D6 pwB1 c17؛ C29-9 pwC1 p2؛ D29-3 tD1 p1/p2، s36 p2) ---------- */
  K.C148_data = async () => { const bad = [];
    const cases = [['سلام. قراردادِ اجارهٔ پنج‌ساله رو دارم نهایی می‌کنم و می‌خوام مطمئن شم سالِ دوم هم زیرِ شرطِ ۴۰٪ می‌مونم. خودم حساب کردم: اجاره الان ۱۸ میلیونه، با ۲۲٪ افزایش میشه ۱۸ × ۱٫۲۲ = ۲۱٫۹۶ میلیون. درآمدمون ۶۰ میلیونه، پس ۲۱٫۹۶ / ۶۰ = ۰٫۳۷، یعنی ۳۷٪. تا جمعه امضاش می‌کنم.'],
      ['فیثاغورس که تموم شده بود! ارتفاعِ هر دیواره ۱٫۸ متره. برگردم به مساحت: هر مثلث نصفِ ۲ × ۱٫۸ یعنی ۱٫۸ متر مربع، چهار تا میشه ۷٫۲ متر مربع. با ده درصد برای درز و دوخت حدودِ ۸ متر پارچه می‌خرم.', 'برای خرید یادداشت کردم: ۷٫۲ متر مربع = ۷۲۰۰۰ سانتی‌متر مربع. پارچه عرضش ۱٫۵ متره، پس ۸ / ۱٫۵ = ۵٫۳۳ متر طول می‌خوام.'],
      ['سلام، با فروشنده حرف زدم: پمپِ ۱۲ ولتِ ۱۲۰ واتی دارن و پنلِ ۱۵۰ واتی. حسابش: ۱۲۰ × ۰٫۵ = ۶۰ وات هیدرولیکی؛ با ۲۰٪ اصطکاک ۴۸ وات مفید؛ 294300 ÷ 48 = 6131 ثانیه، حدودِ ۱۰۲ دقیقه.', 'با مخرجِ ۱۲: ۶ و ۴ و ۳ میشه ۱۳ دوازدهم، نه یک. پس گامِ ۱۶ غلط بود و سهمِ کابل باید ۱/۶ باشه.'],
      ['آره راست میگی، راندمان! پمپ‌های خورشیدی حدودِ ۵۰ تا ۶۰ درصدن. با ۵۵٪ میشه ۱۳۶۰ ÷ ۰٫۵۵ ≈ ۲۴۷۰ وات.', 'پس با ۲٫۵ هکتار: پمپ باید ۱۲۵ متر مکعب رو تو ۸ ساعت بده، یعنی ۱۵٫۶ متر مکعب در ساعت؛ توانِ آبی ≈ ۱۷۰۰ وات، با راندمانِ ۵۵٪ ≈ ۳۱۰۰ وات.'],
      ['سلام. می‌خوام کفِ پذیرایی رو پارکت کنم. | گام ۱: پذیرایی ۵ متر در ۴ متر = ۲۰ مترمربع. | گام ۲: با ۱۰ درصد پرت، ۲۰ × ۱٫۱ = ۲۲ مترمربع پارکت لازمه.', 'اگه پرت ۱۰ درصد نباشه چی؟ آهان، اصلاً فروشنده پرت رو ۱۲ درصد گفته بود، نه ۱۰.'],
      ['۲۰ لیتر با ۱۰٪ یعنی ۲ لیتر نمک. بعد یه مقدار ۲۵٪ اضافه می‌کنیم. حدس زدم ۵ لیتر: ۲+۱.۲۵=۳.۲۵ از ۲۵ میشه ۱۳٪. کمه.', '۸ لیتر رو هم امتحان کردم: ۲+۲=۴ از ۲۶ میشه ۱۵٪. پس ۸ لیتر جوابه؟']];
    for (const T of cases) { const A = await run(T), L = A[A.length - 1]; if (L.fc.length || L.sys.some(x => /🎯/.test(x))) bad.push(T[0].slice(0, 40) + ' ' + J([L.fc, L.sys.filter(x => /🎯/.test(x))])); }
    return [!bad.length, bad.join(' | ')]; };
  /* بدل‌های مثبتِ C148 از رونوشت‌ها (همان حکمِ دونده): گزارش بر 🎯 ِ موجود و «با N٪ اطمینان» پس از نقل */
  K.C148_pos = async () => { const bad = [];
    let A = await run(['دو تا پیش‌بینیِ دیگه: تا آخرِ همین هفته ۴ تا قفسه رو توی اتاقِ کار سوار می‌کنم؛ ۷۰ درصد. امتحانِ پایانیِ دوره رو هم بالای ۱۷ میشم؛ ۹۰ درصد.', 'قفسه‌ها: گفته بودم ۴ تا با ۷۰ درصد، شد ۳ تا.', 'امتحان رو ۱۸ شدم، همون‌طور که با ۹۰ درصد گفته بودم.']);
    if (A[2].fc.length !== 2 || !A[2].fc.some(f => /قفسه/.test(f.q) && f.out === 'نشد') || !A[2].fc.some(f => /امتحان/.test(f.q) && f.out === 'شد')) bad.push('s05 ' + J(A[2].fc));
    A = await run(['یه پیش‌بینیِ تازه هم کرده بودم: «برای جمع ۳۰ بهترین تعداد جزء ۱۱ است» با ۷۰٪ اطمینان — امروز حساب کردم، درست بود.']);
    if (A[0].fc.length > 1) bad.push('s31 ' + J(A[0].fc));
    A = await run(['یه پیش‌بینی: «برای ۴۰ بهترین تعداد ۱۵ است» با ۶۵٪ اطمینان']); if (!(A[0].fc.length === 1 && A[0].fc[0].p === 65)) bad.push('quoted ' + J(A[0].fc));
    /* C168: واژهٔ باور برنده است */
    A = await run(['فکر کنم ۷۰ درصد نصب تا عصرِ شنبه تموم میشه']); if (!(A[0].fc.length === 1 && A[0].fc[0].p === 70)) bad.push('C168 ' + J(A[0].fc));
    return [!bad.length, bad.join(' | ')]; };
  /* ---------- یک پیامد، یک 🎯 (A29-16 s05 p26–p28؛ C29-8 pwC2 p27/p28 با نقلِ «guess» ِ مدل) ---------- */
  K.dup_A = async () => { const A = await run(['دو تا پیش‌بینیِ دیگه: تا آخرِ همین هفته ۴ تا قفسه رو توی اتاقِ کار سوار می‌کنم؛ ۷۰ درصد. امتحانِ پایانیِ دوره رو هم بالای ۱۷ میشم؛ ۹۰ درصد.', 'یعنی: ۷۰ درصد مطمئنم تا آخرِ همین هفته ۴ تا قفسه رو سوار می‌کنم، و ۹۰ درصد مطمئنم امتحان رو بالای ۱۷ میشم.', 'قفسه‌ها: گفته بودم ۴ تا با ۷۰ درصد، شد ۳ تا.']);
    return [A[1].fc.length === 2 && A[2].fc.some(f => /قفسه/.test(f.q) && f.out === 'نشد') && !newSys(A, 2).some(x => /کدام پیش‌بینی/.test(x)), J([A[1].fc, A[2].fc, newSys(A, 2)])]; };
  K.dup_C = async () => { const T = 'قبل از حسابِ مهره‌ها دو تا پیش‌بینی می‌کنم: احتمالِ دو قرمز حدودِ ۳۰٪ درمیاد، ۶۰ درصد مطمئنم. و اگه تاس رو ۶۰ بار بندازم حدودِ ۱۰ بار جمع ۷ میاد، ۷۰ درصد مطمئنم.';
    const G = [{ do: 'coach_state', ph: 'u', said: ['guess'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective', guess: { text: 'احتمالِ دو قرمز حدودِ ۳۰٪ درمیاد، ۶۰ درصد مطمئنم', q: 'اولی را با کدام حساب می‌آزمایی؟' } }];
    const A = await run([[T, G], 'مهره‌ها رو حساب کردم: ۳/۵ × ۲/۴ = ۶/۲۰ = ۳/۱۰، یعنی ۳۰٪. درست درومد.']);
    return [A[0].fc.length === 2 && A[1].fc.some(f => /دو قرمز/.test(f.q) && f.out === 'شد') && !newSys(A, 1).some(x => /کدام پیش‌بینی/.test(x)), J([A[0].fc, A[1].fc, newSys(A, 1)])]; };
  /* ---------- دو «N درصد» در یک بند (B29·D17 dB2 p3 → p21) ---------- */
  K.two_B = async () => { const A = await run(['پیش‌بینیم: ۷۰ درصد مطمئنم ریدینگ ۷ میشه و ۵۰ درصد که لیسنینگ ۷٫۵ بشه.', 'سلام، آزمونِ اصلی رو دادم و نتیجه اومد: ریدینگ ۷ شد، لیسنینگ ۷ شد، رایتینگ هم ۷.']);
    return [A[0].fc.length === 2 && A[0].fc.some(f => nz(f.q) === 'ریدینگ ۷ میشه' && f.p === 70) && A[0].fc.some(f => nz(f.q) === 'لیسنینگ ۷٫۵ بشه' && f.p === 50) && A[1].fc.some(f => /ریدینگ/.test(f.q) && f.out === 'شد') && A[1].fc.some(f => /لیسنینگ/.test(f.q) && f.out === 'نشد'), J(A[1].fc)]; };
  /* ---------- C152: روزِ هفته در پیش‌بینی ⇒ موعدِ 🎯 با یک تأییدِ خودش (B29·D8 dB1 c25، dB2 p14؛ C29-7 pwC2 p41/p45/p37) ---------- */
  K.C152 = async () => { const bad = [];
    const one = async (t, wdN, re) => { const A = await run([t, 'آره']); const L0 = newSys(A, 0), fa = L0.filter(x => /موعدِ این پیش‌بینی/.test(x) && re.test(x));
      const f = A[1].fc.filter(x => re.test(x.q))[0]; if (fa.length !== 1 || planAsk(L0) || !f || f.due !== wd(wdN)) bad.push(t.slice(0, 50) + ' ' + J([L0, A[1].fc])); };
    await one('سلام، امروز دوشنبه‌ست. ۷۰ درصد مطمئنم میانگینِ آزمونِ یکشنبه به ۱۳ می‌رسه.', 0, /میانگین/);
    await one('احتمالش ۴۰ درصده که جمعه کلاسِ رفع‌اشکالِ دوره تشکیل بشه.', 5, /رفع‌اشکال/);
    await one('تمرین‌های فصلِ ۵ رو تا پنجشنبه تموم می‌کنم. ۷۵ درصد.', 4, /فصلِ ۵/);
    /* دو پیش‌بینی در یک پیام، هر کدام موعدِ خودش (dB2 p14) */
    const A = await run(['استادم گفت دامنه‌ی واژه‌هام هم کمه. یه پیش‌بینیِ تازه: ۶۰ درصد مطمئنم آزمایشیِ شنبه‌ی بعد حدودِ ۶٫۵ میشه. احتمالش ۴۰ درصده که جمعه بارون بیاد و کوهِ گروهی کنسل بشه.']);
    if (planAsk(A[0].sys) || A[0].fc.length !== 2) bad.push('dB2 p14 ' + J([A[0].sys, A[0].fc]));
    /* بدلِ منفی: برنامهٔ بی اطمینان همان پرسشِ برنامه را می‌گیرد (C12) */
    const B = await run(['تا جمعه برگه‌های آزمونِ قبلی رو تصحیح می‌کنم.']); if (!planAsk(B[0].sys) || B[0].fc.length) bad.push('plan ' + J(B[0].sys));
    return [!bad.length, bad.join(' | ')]; };
  /* ---------- C119 در شکلِ B (B29·D23 dB2 p4) ---------- */
  K.C119_B = async () => { const A = await run(['تو آزمونِ آزمایشیِ شنبه هم مطمئنم رایتینگم حدودِ ۶٫۵ میشه.', '۶۰']);
    const L0 = newSys(A, 0); return [L0.filter(x => /چند درصد مطمئنی/.test(x)).length === 1 && !planAsk(L0) && A[1].fc.length === 1 && A[1].fc[0].p === 60 && newSys(A, 1).some(x => /موعدِ این پیش‌بینی/.test(x)), J([L0, newSys(A, 1), A[1].fc])]; };
  /* ---------- سرانجام فقط برای 🎯؛ آرزو 🎯 نیست (B29·D4/D5 s19 p10، c70، c77) ---------- */
  K.settle_B = async () => { const A = await run(['فکر می‌کنم جلسه‌ی اول خسته می‌شم ولی می‌رم، هفتاد درصد مطمئنم. امروز هم ۴۰ دقیقه پیاده‌روی رفتم.', 'یه چیز دیگه: می‌خوام ببینم پیش‌بینی‌هام چقدر درست درمیان — مثل همین «هفتاد درصد مطمئنم» برای جلسه‌ی اول باشگاه. برای سنجیدنِ پیش‌بینی‌هام یه پرونده‌ی تمرین باز کن.', 'دیروز یکشنبه رفتم باشگاه! خسته شدم ولی رفتم، همون که پیش‌بینی کرده بودم.']);
    return [A[1].fc.length === 1 && A[2].fc.length === 1 && A[2].fc[0].out === 'شد' && /جلسه‌ی اول/.test(A[2].fc[0].q) && !newSys(A, 2).some(x => /کدام پیش‌بینی/.test(x)), J([A[1].fc, A[2].fc])]; };
  /* ---------- C121 (B29·D7 nB2 p13؛ C28-19 pwC2 p37) ---------- */
  K.C121 = async () => { const bad = [];
    const a = await p.evaluate(() => __live('اسباب‌کشی و رنگِ خونه', 'اسباب‌کشی تا آخرِ ماه؛ بودجه‌ی اسباب‌کشی و رنگِ سه اتاق رو باید جور کنم.')); const t = await p.evaluate(() => __live2('میزِ آشپزخونه', 'میزِ آشپزخونه با عرضِ ۲۴۰ سانت جا میشه یا نه؟'));
    await p.evaluate(() => __turn('۷۰ درصد مطمئنم بودجه‌ی اسباب‌کشی برای رنگ کافی میشه. از عرض هم: ۹۰ + ۷۰ + ۷۰ = ۲۳۰، از ۲۴۰ کمتره، پس میز جا میشه.')); let S = await p.evaluate(() => __st());
    if (!(S.fc.length === 1 && S.fc[0].prob === a)) bad.push('nB2 ' + J([S.fc, a, t]));
    /* بدلِ منفی: پیش‌بینیِ میز زیرِ همان میز */
    await p.evaluate(() => __turn('۸۰ درصد مطمئنم میزِ آشپزخونه با صندلی‌ها هم جا میشه.')); S = await p.evaluate(() => __st());
    if (!S.fc.some(f => /صندلی/.test(f.q) && f.prob === t)) bad.push('neg ' + J(S.fc));
    return [!bad.length, bad.join(' | ')]; };
  /* ---------- A29-24: جملهٔ بی‌ربط «حدودِ N» نمی‌پرسد (pA3 c60 با 🎯 ِ واقعیِ «حدودِ ۸») ---------- */
  K.A29_24 = async () => { const A = await run(['۷۰ درصد مطمئنم حدودِ ۸ متر پارچه بس باشه.', 'برای خرید یادداشت کردم: ۷٫۲ متر مربع = ۷۲۰۰۰ سانتی‌متر مربع. پارچه عرضش ۱٫۵ متره، پس ۸ / ۱٫۵ = ۵٫۳۳ متر طول می‌خوام.']);
    return [A[1].fc.length === 1 && !A[1].fc[0].out && !newSys(A, 1).some(x => /حساب می‌شود|شد یا نشد/.test(x)), J([A[1].fc, newSys(A, 1)])]; };

  /* ---------- C170: پیامدِ آینده (s01 p14 «… یادم رفته بود — شاید ۴۰ درصد» گذشته است؛ «شاید ۴۰٪ یادم بمونه» 🎯) ---------- */
  K.C170 = async () => { const bad = [];
    let A = await run(['شاید ۴۰٪ یادم بمونه.']); if (!(A[0].fc.length === 1 && A[0].fc[0].p === 40 && nz(A[0].fc[0].q) === 'یادم بمونه')) bad.push('شاید ' + J(A[0].fc));
    A = await run(['امروز بعد از یه هفته روشِ خونه رو از حافظه نوشتم؛ فقط مجهول و دو شرط یادم بود، بخشِ «داده فقط اگه شرط رو عوض کنه» کامل یادم رفته بود — شاید ۴۰ درصد.']); if (A[0].fc.length) bad.push('s01 p14 ' + J(A[0].fc));
    A = await run(['۷۰ درصد مطمئنم مدیرم عمداً جلوی ترفیع منو گرفته.']); if (A[0].fc.length) bad.push('past hypothesis ' + J(A[0].fc));
    return [!bad.length, bad.join(' | ')]; };

  for (const k of Object.keys(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').includes(k)) continue; info.n++;
    try { const r = await K[k](); if (r[0]) info.ok++; else errors.push(k + ' ⇒ ' + String(r[1]).slice(0, 900)); } catch (e) { errors.push(k + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
