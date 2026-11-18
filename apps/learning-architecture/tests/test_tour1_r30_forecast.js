// تورِ پولیا (دستهٔ ۱، دورِ ۳۰، سهمِ «forecast»: خانوادهٔ F4؛ DECISIONS_R30 + C170، C120، C90، C91، C132/C152) — قرمزِ نخست با جمله‌های خودِ دونده‌های
// هر چهار گروه (ctl/ai ِ T/round30X)، هر مثبت با بدلِ منفیِ خودش از همان رونوشت‌ها و از پیکرهٔ C178 (CORPUS_R30_F6/F2/F8؛ C136). روی ساختِ BASE30 (5c7ce364) قرمز.
//  ساعتِ صفحه روی «دوشنبهٔ بعد از امروزِ خودِ اجرا، ۹ صبح» ثابت است؛ هیچ تاریخِ تقویمی در انتظارها نیست.  LLA_FILE = ساختِ دیگر؛ ONLY=<نامِ بخش‌ها با ویرگول>.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const D0 = (() => { const d = new Date(); d.setHours(9, 0, 0, 0); do { d.setDate(d.getDate() + 1); } while (d.getDay() !== 1); return d; })();

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
    window.__live = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc', 'ex'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur');
      APP.go('home'); APP.ASSIST.newSession(); const pid = APP.liveCreate('مسئلهٔ آزمون', 'یه مسئلهٔ واقعی دارم که باید حلش کنم و ببینم چی میشه.', 'find', { by: 'user', sess: APP.ASSIST.cur().id }).p.id; APP.liveBindSession(pid, APP.ASSIST.cur(), { force: true }); return pid; };
    window.__st = () => { const s = APP.ASSIST.cur(); let dq = []; try { dq = (APP.dueList() || []).filter(x => x.k === 'dq').map(x => x.txt); } catch (e) { dq = ['ERR ' + e.message]; }
      return { fc: APP.S.all('fcast').filter(x => !x.sample).map(x => ({ q: x.q, p: x.p, due: x.due || '', out: x.outcome || '' })), sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text), dq }; };
  });
  const run = async (turns) => { await p.evaluate(() => __live()); const out = []; for (const t of turns) { if (t && t.clock) { await p.clock.runFor(t.clock); continue; } const [x, a] = Array.isArray(t) ? t : [t, null]; await p.evaluate(([x, a]) => __turn(x, a), [x, a]); out.push(await p.evaluate(() => __st())); } return out; };
  const J = (x) => JSON.stringify(x);
  const nz = (x) => String(x || '').replace(/[‌\s]+/g, ' ').trim();
  const newSys = (A, i) => A[i].sys.slice(i ? A[i - 1].sys.length : 0);
  const K = {};

  /* ---------- C170: احتمال برای اکنون/گذشته 🎯 نمی‌سازد (A30-13 s05 p36؛ C30-19 pwC2 p56) + بدل‌ها (s05 p36 بندهای دیگر؛ F6-071؛ F8-080/081؛ R28 pwC2) ---------- */
  K.C170 = async () => { const bad = [];
    let A = await run(['چند تا پیش‌بینیِ تازه: فکر کنم ۷۰ درصد کارتن‌های انبار تا جمعه بسته میشن. ۷۰ درصدِ کارتن‌ها هم الان پره. شاید ۴۰٪ اسمِ همهٔ همکارای تازه تا آخرِ ماه یادم بمونه. فکر کنم ۶۰ درصد الان مدیرم سرِ جلسه‌ست.']);
    if (A[0].fc.length !== 2 || A[0].fc.some(f => /جلسه|پره/.test(f.q)) || !A[0].fc.some(f => /کارتن‌های انبار/.test(f.q) && f.p === 70) || !A[0].fc.some(f => /یادم بمونه/.test(f.q) && f.p === 40)) bad.push('A30-13 ' + J(A[0].fc));
    A = await run(['فکر کنم ۶۰ درصد اون جوابِ مثبتِ آزمایشِ اولم اشتباه بوده.']); if (A[0].fc.length) bad.push('C30-19 ' + J(A[0].fc));
    A = await run(['۶۰ درصد فکر می‌کنم دیروز بانک تعطیل بوده.']); if (A[0].fc.length) bad.push('F6-071 ' + J(A[0].fc));
    /* «الان» ِ کنارِ خودِ اطمینان ادعا نیست: به‌روزرسانیِ همان 🎯 (C77؛ F8-080) */
    A = await run(['فکر کنم ۲۳ تا مصرف بشه و یکی بمونه؛ احتمالش ۷۰ درصده.', 'راستش پیش‌بینیِ ۲۳ تا رو الان ۶۰ درصد مطمئنم، نه ۷۰.']);
    if (!(A[1].fc.length === 1 && A[1].fc[0].p === 60)) bad.push('F8-080 ' + J(A[1].fc));
    A = await run(['احتمالش ۷۰ درصده که تو آزمونِ پایانیِ دوره نمرهٔ بالای ۱۷ بگیرم.', 'راستش برای نمرهٔ بالای ۱۷ تو آزمونِ پایانی، الان ۸۰ درصد مطمئنم.']);
    if (!(A[1].fc.length === 1 && A[1].fc[0].p === 80)) bad.push('R28 pwC2 ' + J(A[1].fc));
    return [!bad.length, bad.join(' | ')]; };

  /* ---------- دو درصد در یک بند ⇒ دو 🎯 (C30-20 pwC2 p57؛ B30·D17 dB3 p5 → p14) + بدل‌ها (tD4 p21؛ F2-079؛ R29 dB2 p3) ---------- */
  K.two = async () => { const bad = [];
    let A = await run(['فکر کنم ۸۰ درصد این ترم قبول میشم و ۵۰ درصد معدلم بالای ۱۷ میشه.']);
    if (!(A[0].fc.length === 2 && A[0].fc.some(f => nz(f.q) === 'این ترم قبول میشم' && f.p === 80) && A[0].fc.some(f => nz(f.q) === 'معدلم بالای ۱۷ میشه' && f.p === 50))) bad.push('C30-20 ' + J(A[0].fc));
    A = await run(['۸۰ درصد مطمئنم شنبه جدولِ محوری رو یاد می‌گیرم و ۶۰ درصد که نمودارها رو هم.', 'شنبه‌ست. جدولِ محوری رو یاد گرفتم ولی نمودارها نه.']);
    const jd = A[1].fc.filter(f => /جدولِ محوری/.test(f.q)), nm = A[1].fc.filter(f => /نمودارها/.test(f.q));
    if (A[0].fc.length !== 2 || jd.length !== 1 || nm.length !== 1 || jd[0].p !== 80 || nm[0].p !== 60 || /۶۰ درصد/.test(jd[0].q) || jd[0].out !== 'شد' || nm[0].out !== 'نشد') bad.push('B30·D17 ' + J([A[0].fc, A[1].fc]));
    A = await run(['۸۰ درصد مطمئنم قبضِ گاز کمتر از ۳۰۰ هزار میاد و ۶۰ درصد که تا ۱۰ آذر برسه.']); if (A[0].fc.length !== 2) bad.push('tD4 p21 ' + J(A[0].fc));
    A = await run(['لاستیک‌ها با ۲۰٪ تخفیف ۳ میلیون میشه ۲ میلیون و ۴۰۰، ولی بار ۱۰ درصد پرت داره.']); if (A[0].fc.length) bad.push('F2-079 ' + J(A[0].fc));
    A = await run(['پیش‌بینیم: ۷۰ درصد مطمئنم ریدینگ ۷ میشه و ۵۰ درصد که لیسنینگ ۷٫۵ بشه.']); if (!(A[0].fc.length === 2 && A[0].fc.some(f => nz(f.q) === 'لیسنینگ ۷٫۵ بشه'))) bad.push('R29 dB2 ' + J(A[0].fc));
    return [!bad.length, bad.join(' | ')]; };

  /* ---------- C120 همیشه، با ممیزِ فارسی (C30-18 pwC2 p59–p60؛ B30·D4 dB2 c26 / dB3 p15؛ D30-14 tD4 s30؛ A30-14 s05 p38؛ F2-076/077) ---------- */
  K.C120 = async () => { const bad = [];
    let A = await run(['فکر کنم ۷۰ درصد این هفته حدودِ ۶ ساعت ورزش می‌کنم.', 'این هفته ۶ و نیم ساعت ورزش کردم.']);
    if (A[1].fc[0].out || !newSys(A, 1).some(x => /این ۶٫۵ «حدودِ ۶» حساب می‌شود؟/.test(x))) bad.push('C30-18 ' + J([A[1].fc, newSys(A, 1)]));
    A = await run(['۷۰ درصد مطمئنم حدودِ ۶٫۵ متر پارچه اضافه میاد.', '۷ متر پارچه اضافه اومد.']);
    if (A[1].fc[0].out || !newSys(A, 1).some(x => /این ۷ «حدودِ ۶٫۵» حساب می‌شود؟/.test(x)) || newSys(A, 1).some(x => /[۰-۹]\.[۰-۹]/.test(x))) bad.push('D30-14 ' + J(newSys(A, 1)));
    A = await run(['۶۰ درصد مطمئنم نمونه‌ی بعدی حدودِ ۱۳٫۵ میشه.', 'نمونه‌ی امروز رو دادم، ۱۴ شد.']);
    if (!newSys(A, 1).some(x => /این ۱۴ «حدودِ ۱۳٫۵» حساب می‌شود؟/.test(x))) bad.push('B30·D4 ' + J(newSys(A, 1)));
    /* بدل: مقدارِ برابر ⇒ «شد» بی پرسش (C120) */
    A = await run(['۷۰ درصد مطمئنم حدودِ ۶٫۵ متر پارچه اضافه میاد.', '۶٫۵ متر پارچه اضافه اومد.']);
    if (A[1].fc[0].out !== 'شد' || newSys(A, 1).some(x => /حساب می‌شود؟/.test(x))) bad.push('equal ' + J([A[1].fc, newSys(A, 1)]));
    return [!bad.length, bad.join(' | ')]; };

  /* ---------- متنِ 🎯 بی بندِ داده (A30-14 s05 p37) + بدل (C168: «فکر کنم ۷۰ درصد نصب …» در آغاز) ---------- */
  K.A30_14 = async () => { const bad = [];
    let A = await run(['جمعهٔ بعد. با تکرارِ روزانه شاید بیشتر بشه. یه پیش‌بینیِ دیگه: لپ‌تاپِ تازه با ۲۰٪ تخفیف ۳۲ میلیون میشه و فکر کنم باتری‌ش حدودِ ۶.۵ ساعت دوام بیاره، ۸۰ درصد مطمئنم.']);
    if (!(A[0].fc.length === 1 && nz(A[0].fc[0].q) === nz('باتری‌ش حدودِ ۶٫۵ ساعت دوام بیاره') && A[0].fc[0].p === 80)) bad.push('A30-14 ' + J(A[0].fc));
    A = await run(['فکر کنم ۷۰ درصد نصب تا عصرِ شنبه تموم میشه']); if (!(A[0].fc.length === 1 && nz(A[0].fc[0].q) === 'نصب تا عصرِ شنبه تموم میشه')) bad.push('C168 ' + J(A[0].fc));
    return [!bad.length, bad.join(' | ')]; };

  /* ---------- B30·D5 (dB2 c26 → c28): داوریِ صریح در پاسخ به پرسشِ C120 ِ خودِ صفحه روی همان 🎯 می‌نشیند — نه «کدام؟» ---------- */
  K.B30_D5 = async () => { const A = await run(['پیش‌بینیم: ۷۰ درصد مطمئنم ریدینگ ۷ میشه و ۵۰ درصد که لیسنینگ ۷٫۵ بشه.', 'تو آزمونِ آزمایشیِ شنبه هم مطمئنم رایتینگم حدودِ ۶٫۵ میشه.', { clock: 6 * 864e5 }, 'استادم گفت دامنه‌ی واژه‌هام هم کمه. یه پیش‌بینیِ تازه: ۶۰ درصد مطمئنم آزمایشیِ شنبه‌ی بعد حدودِ ۶٫۵ میشه.', 'آره', { clock: 5 * 864e5 }, 'امروز شنبه‌ست، آزمایشی رو دادم: رایتینگ ۷ شد!', 'اون پیش‌بینیِ حدودِ ۶٫۵ نشد، چون ۷ شد. فکر کنم واژه‌ها بیشتر اثر داشتن.']);
    const n = A.length - 1, f = A[n].fc.filter(x => /شنبه‌ی بعد/.test(x.q))[0];
    return [!!f && f.out === 'نشد' && !newSys(A, n).some(x => /کدام پیش‌بینی/.test(x)) && A[n].fc.filter(x => /ریدینگ|لیسنینگ/.test(x.q)).every(x => !x.out), J([A[n].fc, newSys(A, n - 1), newSys(A, n)])]; };

  /* ---------- D30-3 / C30-17 / A30-14 #3: تأییدِ بی‌جوابِ موعدِ 🎯 سطرِ 🎯 ِ خودش و ردیفِ 🎯 در «امروز» — نه «📅» ِ برنامه (pwC2 p32، tD4 s19–s20) + بدلِ برنامه (C12) ---------- */
  K.dueLeft = async () => { const bad = [];
    let A = await run(['فکر کنم ۷۰ درصد تعمیرکار تا پنجشنبه کولر رو درست می‌کنه.', 'شاید ۴۰٪ تا آخرِ آذر بیمه ارزون‌تر بشه.']);
    const L1 = newSys(A, 1);
    if (L1.some(x => /^📅/.test(x) && /تعمیرکار/.test(x)) || !L1.some(x => /^🎯 موعدِ پیش‌بینی بی‌جواب ماند/.test(x) && /تعمیرکار/.test(x))) bad.push('line ' + J(L1));
    if (A[1].dq.some(x => /^📅/.test(x) && /تعمیرکار/.test(x)) || !A[1].dq.some(x => /^🎯 موعدِ این پیش‌بینی/.test(x) && /تعمیرکار/.test(x))) bad.push('today ' + J(A[1].dq));
    /* «تاریخ درسته» ِ بعدی همچنان موعد را ثبت می‌کند */
    A = await run(['فکر کنم ۷۰ درصد تعمیرکار تا پنجشنبه کولر رو درست می‌کنه.', 'یه چیز دیگه هم بگم: کولر قدیمیه.', 'تاریخ درسته.']);
    if (!A[2].fc.some(f => /تعمیرکار/.test(f.q) && f.due)) bad.push('later yes ' + J([A[2].fc, newSys(A, 2)]));
    /* بدل: برنامه همان سطرِ 📅 را می‌گیرد */
    A = await run(['تا جمعه برگه‌های آزمونِ قبلی رو تصحیح می‌کنم.', 'یه چیز دیگه هم بگم: کولر قدیمیه.']);
    if (!newSys(A, 1).some(x => /^📅 پرسشِ تاریخ بی‌جواب ماند/.test(x) && /برگه‌های آزمون/.test(x)) || !A[1].dq.some(x => /^📅/.test(x) && /برگه‌های آزمون/.test(x))) bad.push('plan ' + J([newSys(A, 1), A[1].dq]));
    return [!bad.length, bad.join(' | ')]; };

  /* ---------- B30·D16 (dB3 p4; F6-040): «آره، پنجشنبه درسته» به پرسشِ دو 🎯 فقط 🎯 ِ پنجشنبه را تأیید می‌کند — هرگز «🎯 موعدِ این پیش‌بینی «پنجشنبه درسته»» ---------- */
  K.B30_D16 = async () => { const A = await run(['پیش‌بینیم: فکر کنم ۷۰ درصد تو آزمونِ نمونه‌ی پنجشنبه ۱۲ تا رو درست می‌زنم. شاید ۴۰٪ فرمولِ VLOOKUP تا هفته‌ی بعد یادم بمونه.', 'آره، پنجشنبه درسته.']);
    const L = newSys(A, 1), v = A[1].fc.filter(f => /VLOOKUP/.test(f.q))[0], t = A[1].fc.filter(f => /آزمونِ نمونه/.test(f.q))[0];
    return [!L.some(x => /«پنجشنبه درسته»/.test(x)) && !A[1].dq.some(x => /پنجشنبه درسته/.test(x)) && !!t && !!t.due && !!v && !v.due && !L.some(x => /موعدِ این پیش‌بینی/.test(x) && /VLOOKUP/.test(x)), J([L, A[1].fc, A[1].dq])]; };

  /* ---------- A30-15 (s05 p39): کالیبراسیونِ 🎯 های داوری‌شدهٔ گفت‌وگو کنارِ کالیبراسیونِ تمرین در کارنامه نام برده می‌شود؛ Brier ِ دفتر با ممیزِ فارسی ---------- */
  K.A30_15 = async () => { await run(['دو تا پیش‌بینیِ دیگه: تا آخرِ همین هفته ۴ تا قفسه رو توی اتاقِ کار سوار می‌کنم؛ ۷۰ درصد. امتحانِ پایانیِ دوره رو هم بالای ۱۷ میشم؛ ۹۰ درصد.', 'قفسه‌ها: گفته بودم ۴ تا با ۷۰ درصد، شد ۳ تا.', 'امتحان رو ۱۸ شدم، همون‌طور که با ۹۰ درصد گفته بودم.']);
    const r = await p.evaluate(async () => { try { APP.ASSIST.toggle(false); } catch (e) { } APP.go('mind'); await new Promise(r => setTimeout(r, 500)); const e = document.querySelector('.mind-fc-cal'); const m = e ? e.textContent : '';
      APP.go('fcast'); await new Promise(r => setTimeout(r, 400)); const h = (document.querySelector('#main h2') || {}).textContent || ''; const all = [...document.querySelectorAll('#main h2')].map(x => x.textContent).join(' | '); return [m, all]; });
    return [/۲ پیش‌بینیِ داوری‌شده/.test(r[0]) && /Brier ۰٫/.test(r[0]) && /Brier = ۰٫/.test(r[1]) && !/[۰-۹]\.[۰-۹]/.test(r[0] + r[1]), J(r)]; };

  for (const k of Object.keys(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').includes(k)) continue; info.n++;
    try { const r = await K[k](); if (r[0]) info.ok++; else errors.push(k + ' ⇒ ' + String(r[1]).slice(0, 1200)); } catch (e) { errors.push(k + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
