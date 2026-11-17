// تورِ پولیا (دستهٔ ۱، دورِ ۲۹ — سهمِ «dates») — گواهِ صفحه‌ای (DECISIONS_R29 C101 (c) + C137: در **هر** گروهی که خانوادهٔ F6 را نشان داد): بازپخشِ اجرای خودِ دونده‌ها روی صفحهٔ ساخته‌شده.
//  هر fixture (tests/fixtures/r29_dates/<گروه>_<سناریو>.json) همان گام‌های کنترلِ دونده (ctl/cN.json: say / eval / eval0 با clock-shim ِ __adv ِ خودِ گروه / click / fill) و همان
//  جواب‌های مدلی است که او گرفت (ai/rN.txt). صفحه واقعاً اجرا می‌شود؛ فقط مدل ضبط‌شده است. وارسی روی همان چیزی است که دونده دید: سطرهای صفحه (sys)، داده‌های برنامه/موعد/پرسش
//  و DOM ِ «امروز». گروه‌ها و قلم‌ها: A (s01: A29-5، A29-6 + C117؛ s03: A29-12؛ s07: A29-17)، B (dB2: B29·D18، D19، D20، D21، D22)، C (aC3: C117 در شکلِ C، C29-6، C146، C133)،
//  D (tD2: D29-18، D28-21؛ s34: D29-25). LLA_FILE = ساختِ دیگر (قرمزِ اول). ONLY=<نامِ fixtureها، با ویرگول>
const path = require('path');
const { chromium } = require('playwright');
const { replay } = require('./tour1_r26_replay.js');
const DIR = path.join(__dirname, 'fixtures', 'r29_dates');

(async () => {
  let b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const errors = [], info = {};
  const X = (name, ok, x) => { info[name] = !!ok; if (!ok) errors.push(name + ' :: ' + JSON.stringify(x).slice(0, 1600)); };
  const view = async (R) => R.p.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms)); const o = {};
    const SS = APP.S.all('achat');
    const all = [].concat(...SS.map(s => (s.msgs || []).map(m => ({ at: m.at, r: m.role, t: m.text })))).sort((a, b) => String(a.at).localeCompare(String(b.at)));
    o.sys = all.filter(m => m.r === 'sys').map(x => x.t);
    o.seq = all.filter(m => m.r !== 'ai' && m.r !== 'assistant').map(x => (x.r === 'sys' ? 'S ' : 'U ') + x.t);   // سطرهای صفحه پس از هر پیامِ او، به ترتیب
    APP.go('today'); await w(700); o.today = (document.getElementById('main') || {}).innerText || '';
    o.plans = [].concat(...SS.map(s => (s.plans || []).map(q => ({ text: q.text, when: q.when, state: q.state || 'open', day: (q.doneBy || {}).day || '' }))));
    o.dl = APP.S.all('deadline').map(d => ({ what: d.what, date: d.date, done: !!d.done, by: (d.doneBy || {}).kind || '', day: (d.doneBy || {}).day || '' }));
    o.pend = [].concat(...SS.map(s => APP.PR.datePends(s).reduce((a, P) => a.concat((P.items || []).map(x => ({ what: x.what, date: x.date, free: !!x.free, past: x.past || '' }))), [])));
    return o; });
  /* سطرهای صفحه پس از نخستین پیامِ او که re را دارد، تا پیامِ بعدیِ او */
  const after = (v, re, k) => { const i = v.seq.findIndex((x, j) => /^U /.test(x) && re.test(x) && (k == null || v.seq.slice(0, j).filter(y => /^U /.test(y) && re.test(y)).length === k)); if (i < 0) return null; const out = []; for (let j = i + 1; j < v.seq.length && !/^U /.test(v.seq[j]); j++) out.push(v.seq[j].slice(2)); return out; };
  const run = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return;
    for (let k = 0; k < 2; k++) { let R = null; try { R = await replay(b, name, { dir: DIR }); const v = await view(R); await fn(v, R); if (R.errors.length) errors.push(name + ' page errors: ' + R.errors.join(' | ').slice(0, 400)); await R.close(); return; }
      catch (e) { const m = String(e && e.message || e).split('\n')[0]; if (R) await R.close().catch(() => { }); if (k === 0 && /crashed|closed|ERR_/i.test(m)) { try { await b.close(); } catch (e2) { } b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); continue; } errors.push(name + ' — exception: ' + m); return; } } };

  await run('B_dB2', async (v) => {
    const a8 = after(v, /آره، فردا و پس‌فردا/) || [], a9 = after(v, /زنگ زدم\./) || [], a10 = after(v, /^U به بانک\. صاحب‌خونه بمونه/) || [], a15 = after(v, /سه‌شنبه‌ی هفته‌ی بعد، ۱۰ آذر/) || [], ed = after(v, /اصلاحِ پیامِ قبلی/) || [];
    X('B29·D18 dB2 c8 (C145): «آره، فردا و پس‌فردا» ⇒ هر دو تماس ثبت (بانک ۳ آذر، صاحب‌خانه ۴ آذر)؛ هیچ «به‌جای ۳ آذر»', a8.some(x => /ثبت شد/.test(x) && /بانک[^·]*۳ آذر/.test(x) && /صاحب‌خونه[^·]*۴ آذر/.test(x)) && !v.sys.some(x => /بانک/.test(x) && /به‌جای ۳ آذر/.test(x)), a8);
    X('B29·D19 dB2 c9 (C117): «زنگ زدم» با دو تماس ⇒ «کدام؟» ِ صفحه با هر دو نام؛ هیچ‌کدام همان دم بسته نشد', a9.some(x => /«زنگ زدم\.?» — کدام؟/.test(x) && /بانک/.test(x) && /صاحب‌خونه/.test(x)) && !a9.some(x => /انجام شد»:/.test(x)), a9);
    X('B29·D19 dB2 c10: «به بانک. صاحب‌خونه بمونه برای فردا» ⇒ فقط بانک «انجام شد»، صاحب‌خانه باز (تا پایان)', a10.some(x => /«انجام شد»: «فردا هم به بانک/.test(x) && /باز ماند: «پس‌فردا هم به صاحب‌خونه/.test(x)) && v.dl.some(x => /بانک/.test(x.what) && x.done && x.by === 'her-words') && v.dl.some(x => /صاحب‌خونه/.test(x.what) && !x.done), { a10, dl: v.dl });
    X('B29·D21 dB2 c12–c14 (C144): ✏️ ِ «پنجشنبه ⇒ سه‌شنبه» ِ جلسه موعدِ آزمونِ ۱۵ دی را «جایگزین» نکرد؛ آزمون فقط با گزارشِ خودش در پایان بسته شد', !v.dl.some(x => /آیلتس/.test(x.what) && x.by === 'replaced') && !ed.some(x => /آیلتس/.test(x)) && v.dl.some(x => /آیلتس/.test(x.what) && x.date === '2027-01-05'), { ed, dl: v.dl });
    X('B29·D20 dB2 c15 (C145): پاسخِ «سه‌شنبه‌ی هفته‌ی بعد، ۱۰ آذر» به پرسشِ ✏️ ِ روزِ گذشته ⇒ جلسه ۱۰ آذر ثبت؛ یک ردیف (نه «از حرفِ خودت … ۱۰ آذر» ِ دوم)؛ هیچ «بی‌جواب ماند»', a15.some(x => /ثبت شد/.test(x) && /استادم جلسه دارم» — ۱۰ آذر/.test(x)) && !a15.some(x => /بی‌جواب ماند/.test(x)) && !ed.some(x => /از حرفِ خودت/.test(x)) && ed.some(x => /گذشته — کدام روز؟/.test(x)), { ed, a15 });
    X('B29·D22 dB2 p16: «اینو ثبتش کن: جمعه ساعت ۱۰ کلاس…» ⇒ هیچ «↩ خواسته‌ای که گذاشتی برای بعد» در «امروز»', !/خواسته‌ای که گذاشتی برای بعد[^\n]*کلاس/.test(v.today), v.today.slice(0, 1200));
  });
  await run('D_tD2', async (v) => {
    const z1 = after(v, /^U زنگ زدم\.$/, 0) || [], dd = after(v, /۲ آذر و ۳ آذر درسته/) || [], z2 = after(v, /^U زنگ زدم\.$/, 1) || [], fr = after(v, /فرش‌ها رو می‌دم قالیشویی/) || [];
    X('D29-18 tD2 c35 (C117): «زنگ زدم» با دو تماسِ در پرسش ⇒ «کدام؟» با گاز و مدرسه؛ برنامهٔ گاز «انجام شد» نگرفت و پرسشِ روز بی‌صدا نرفت', z1.some(x => /کدام؟/.test(x) && /گاز/.test(x) && /مدرسه/.test(x)) && !z1.some(x => /انجام شد»:/.test(x)) && (z1.some(x => /بی‌جواب ماند/.test(x) && /مدرسه/.test(x)) || dd.some(x => /ثبت شد/.test(x))), { z1 });
    X('D29-18 tD2 c36 (C145): «۲ آذر و ۳ آذر درسته» ⇒ گاز ۲ آذر و مدرسه ۳ آذر ثبت', dd.some(x => /ثبت شد/.test(x) && /گاز[^·]*۲ آذر/.test(x) && /مدرسه[^·]*۳ آذر/.test(x)), dd);
    X('D29-18 tD2 c37: «زنگ زدم» دوباره ⇒ «کدام؟»؛ هیچ‌کدام بسته نشد', z2.some(x => /کدام؟/.test(x)) && !v.plans.some(q => /گاز/.test(q.text) && q.state === 'done') && !v.dl.some(x => /مدرسه/.test(x.what) && x.done), { z2, plans: v.plans.filter(q => /گاز|مدرسه/.test(q.text)) });
    X('D28-21/C133 tD2 c39: «وسطِ ماهِ دیگه، یعنی حدودِ ۱۵ دی، فرش‌ها …» ⇒ یک ردیف با روزِ خودش (۱۵ دی)؛ هیچ «وسطِ ماه — کدام روز؟» برای فرش', fr.some(x => /۱۵ دی/.test(x)) && !v.sys.some(x => /فرش/.test(x) && /وسطِ ماه — کدام روز؟/.test(x)) && !/فرش[^\n]*کدام روز؟/.test(v.today), fr);
  });
  await run('D_s34', async (v) => {
    const a = after(v, /ثبتش کردم\. پس‌فردا صبح انجامش میدم/) || [];
    X('D29-25 s34 p5 (C145/C49): «ثبتش کردم. پس‌فردا صبح انجامش میدم» ⇒ اسکیس ۲۸ مهر ثبت؛ نه «بی‌جواب ماند»، نه پرسشِ دومِ «پس‌فردا صبح انجامش میدم»', a.some(x => /ثبت شد/.test(x) && /اسکیس[^·]*۲۸ مهر/.test(x)) && !a.some(x => /بی‌جواب ماند|انجامش میدم» —/.test(x)), a);
  });
  await run('C_aC3', async (v) => {
    const z = after(v, /^U زنگ زدم\.$/) || [], ins = after(v, /پسفردا می‌رم بیمه رو تمدید کنم/) || [], ed = after(v, /«یکشنبه می‌رم» ⇐ «۲۰ آبان رفتم»/) || [], ck = after(v, /وسطِ ماهِ دیگه باید برم چکاپ/) || [];
    X('C117 aC3 c120 (شکلِ C): «زنگ زدم.» ⇒ «کدام؟» و پرسش‌های روزِ دکتر و بانک بی‌صدا بسته نشدند (برنامه‌ها باز، هیچ «انجام شد»)', z.some(x => /کدام؟/.test(x) && /دکتر/.test(x) && /بانک/.test(x)) && v.plans.some(q => /دکترم/.test(q.text) && q.state === 'open') && v.plans.some(q => /وام/.test(q.text) && q.state === 'open') && (v.pend.some(x => /دکترم/.test(x.what)) || z.some(x => /بی‌جواب ماند/.test(x) && /دکترم/.test(x))), { z, pend: v.pend.filter(x => /دکتر|وام/.test(x.what)) });
    X('C29-6 aC3 p42 (C147): «پسفردا می‌رم بیمه رو تمدید کنم» پرسشِ داروخانه را ثبت نکرد؛ بیمه پرسشِ خودش را گرفت', !ins.some(x => /ثبت شد/.test(x) && /داروخونه/.test(x)) && ins.some(x => /^📅/.test(x) && /بیمه/.test(x)) && !v.plans.some(q => /داروخونه/.test(q.text) && q.when === '2026-11-28'), ins);
    X('C146 aC3 c85: ✏️ «۲۰ آبان رفتم بانک …» ⇒ «انجام شد» در ۲۰ آبان؛ نه «این روز گذشته — کدام روز؟»', ed.some(x => /کارِ گذشته: به گفتهٔ خودتان? «انجام شد» در ۲۰ آبان ۱۴۰۵/.test(x)) && !ed.some(x => /گذشته — کدام روز؟/.test(x)), ed);
    X('C133 aC3 p46: «وسطِ ماهِ دیگه باید برم چکاپ، یعنی حدودِ ۱۵ دی» ⇒ یک ردیف (۱۵ دی)؛ هیچ «وسطِ ماه — کدام روز؟» برای چکاپ', ck.some(x => /۱۵ دی/.test(x)) && !v.sys.some(x => /چکاپ/.test(x) && /وسطِ ماه — کدام روز؟/.test(x)), ck);
  });
  await run('A_s01', async (v) => {
    const z = after(v, /^U زنگ زدم\.$/) || [], bn = after(v, /^U به بنگاه\. گفت متن آماده‌ست/) || [], kn = after(v, /وسطِ ماه یعنی حدودِ ۱۵ دی؛ همون موقع کنتور/) || [];
    X('A29-6 s01 p41 (C117): «زنگ زدم.» ⇒ «کدام؟»؛ پاسخِ «به بنگاه.» ⇒ سطرِ دیدنی «انجام شد» برای بنگاه (بیمه باز)', z.some(x => /کدام؟/.test(x) && /بنگاه/.test(x) && /بیمه/.test(x)) && bn.some(x => /«انجام شد»: «فردا به بنگاه/.test(x)) && v.plans.some(q => /بیمه هم زنگ/.test(q.text) && q.state !== 'done'), { z, bn });
    X('A29-5 s01 p36 (C133): «وسطِ ماه یعنی حدودِ ۱۵ دی؛ همون موقع کنتور رو می‌بینم» ⇒ ردیفِ «وسطِ ماه … کنتور — کدام روز؟» ۱۵ دی ثبت شد (با حرفِ خودش)؛ هیچ ردیفِ دوم', kn.some(x => /ثبت شد/.test(x) && /کنتور[^·]*۱۵ دی/.test(x) && /از حرفِ خودت: «وسطِ ماه یعنی حدودِ ۱۵ دی/.test(x)) && !kn.some(x => /^📅/.test(x)), kn);
  });
  await run('A_s03', async (v) => {
    const a = after(v, /امروز خسته‌ام/) || [];
    X('A29-12 s03 c103 (C147): «… امروز خسته‌ام» برنامهٔ پنجشنبه را به امروز نبرد (هیچ «به‌جای ۳۰ مهر»)', !a.some(x => /به‌جای ۳۰ مهر/.test(x)) && !v.sys.some(x => /برهانِ کاملشو می‌نویسم» — سه‌شنبه ۲۸ مهر/.test(x)), a);
  });
  await run('A_s07', async (v) => {
    const a = after(v, /اندازه‌گیریِ بعدی ۳۰ آبانه/) || [];
    X('A29-17 s07 p11 (C147/C93): «اندازه‌گیریِ بعدی ۳۰ آبانه» در ۳ دی ⇒ «این روز (۳۰ آبان ۱۴۰۵) گذشته — کدام روز؟»؛ هرگز ۱۴۰۶', a.some(x => /این روز \(۳۰ آبان ۱۴۰۵\) گذشته — کدام روز؟/.test(x)) && !v.sys.some(x => /۳۰ آبان ۱۴۰۶/.test(x)), a);
  });

  try { await b.close(); } catch (e) { }
  const ks = Object.keys(info); console.log(JSON.stringify({ replays: ks.length, ok: ks.filter(k => info[k]).length, red: ks.filter(k => !info[k]) }));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS — test_tour1_r29_dates_replay');
})();
