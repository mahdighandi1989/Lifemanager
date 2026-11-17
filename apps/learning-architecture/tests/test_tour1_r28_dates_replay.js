// تورِ پولیا (دستهٔ ۱، دورِ ۲۸ — سهمِ «dates») — گواهِ صفحه‌ای (DECISIONS_R28 C101 (c)، C131): بازپخشِ اجرای خودِ دونده‌ها روی صفحهٔ ساخته‌شده.
//  هر fixture (tests/fixtures/r28_dates/<گروه>_<سناریو>.json) همان گام‌های کنترلِ دونده (ctl/cN.json: say / eval / eval0 با clock-shim ِ __adv ِ خودِ گروه / click / fill)
//  و همان جواب‌های مدلی است که او گرفت (ai/rN.txt). صفحه واقعاً اجرا می‌شود؛ فقط مدل ضبط‌شده است. وارسی روی همان چیزی است که دونده دید: DOM ِ پنلِ گفت‌وگو،
//  نمای «امروز» (#main) و 📜 (نمای پرونده). خانواده‌ها: F5 (A28-4، B28·D6، C28-9، D28-22) و F6 (A28-1/2/3، B28·D7، B28·D14، D28-4، D28-7، D28-16، D28-27، D28-28، C28-10،
//  A27-19، A28-34). LLA_FILE = ساختِ دیگر (قرمزِ اول). ONLY=<نامِ fixtureها، با ویرگول>
const path = require('path');
const { chromium } = require('playwright');
const { replay } = require('./tour1_r26_replay.js');
const DIR = path.join(__dirname, 'fixtures', 'r28_dates');

(async () => {
  let b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const errors = [], info = {};
  const X = (name, ok, x) => { info[name] = !!ok; if (!ok) errors.push(name + ' :: ' + JSON.stringify(x).slice(0, 1600)); };
  /* همهٔ سطرهای صفحه (sys) ِ همهٔ گفت‌وگوها، به ترتیبِ زمان + DOM ِ پنلِ گفت‌وگوی کنونی + DOM ِ «امروز» + DOM ِ 📜 ِ هر گفت‌وگو */
  const view = async (R) => R.p.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms)); const o = {};
    const SS = APP.S.all('achat');
    o.sys = [].concat(...SS.map(s => (s.msgs || []).filter(m => m.role === 'sys').map(m => ({ at: m.at, t: m.text })))).sort((a, b) => String(a.at).localeCompare(String(b.at))).map(x => x.t);
    try { APP.ASSIST.toggle(true); await w(300); const pn = document.querySelector('.as-panel'); o.chat = pn ? pn.innerText : ''; APP.ASSIST.toggle(false); } catch (e) { o.chat = 'ERR ' + e.message; }
    APP.go('today'); await w(700); o.today = (document.getElementById('main') || {}).innerText || '';
    o.dos = ''; for (const s of SS) { try { APP.go('dossier', s.id); await w(500); o.dos += '\n' + ((document.getElementById('main') || {}).innerText || ''); } catch (e) { } }
    o.plans = [].concat(...SS.map(s => (s.plans || []).map(q => ({ text: q.text, when: q.when, state: q.state || 'open' }))));
    o.dl = APP.S.all('deadline').map(d => ({ what: d.what, date: d.date, done: !!d.done, plan: !!d.plan, by: (d.doneBy || {}).kind || '' }));
    return o; });
  const run = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return;
    for (let k = 0; k < 2; k++) { let R = null; try { R = await replay(b, name, { dir: DIR }); const v = await view(R); await fn(v, R); if (R.errors.length) errors.push(name + ' page errors: ' + R.errors.join(' | ').slice(0, 400)); await R.close(); return; }
      catch (e) { const m = String(e && e.message || e).split('\n')[0]; if (R) await R.close().catch(() => { }); if (k === 0 && /crashed|closed|ERR_/i.test(m)) { try { await b.close(); } catch (e2) { } b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); continue; } errors.push(name + ' — exception: ' + m); return; } } };
  const AMB = /امروز خودش (?:جمعه|شنبه|یکشنبه|دوشنبه|سه‌شنبه|چهارشنبه|پنجشنبه) است/;

  await run('B_dB1', async (v) => {
    X('B28·D6 dB1 (DOM «امروز» و سطرهای صفحه): «بعد از عید / وسطِ ماه» ⇒ «کدام روز؟»؛ هیچ «امروز خودش جمعه است» در دوشنبه', !v.sys.some(x => /بعد از عید|وسطِ ماه/.test(x) && AMB.test(x)) && v.sys.some(x => /بعد از عید \(از ۱ فروردین ۱۴۰۶ به بعد\) — کدام روز؟/.test(x)) && v.sys.some(x => /«وسطِ ماه هم یه آزمونِ دیگه می‌گیرم» — وسطِ ماه — کدام روز؟/.test(x)) && !AMB.test(v.today), { sys: v.sys.filter(x => /^📅|ثبت شد/.test(x)), today: v.today.slice(0, 800) });
    X('B28·D6 dB1 p10: «وسطِ ماه یعنی حدودِ ۱۵ دی» ⇒ آزمونِ وسطِ ماه ۱۵ دی (نه ۱ فروردین، نه برنامهٔ دوم)', v.plans.some(q => /وسطِ ماه هم یه آزمون/.test(q.text) && q.when === '2027-01-05') && !v.plans.some(q => /یعنی حدودِ ۱۵ دی/.test(q.text)), v.plans);
    X('B28·D7 dB1 p11: «عید درسته» ⇒ همان «عید هم یه برنامهٔ تمرین …» با ۱ فروردین؛ هیچ ثبتِ روزِ گذشته («۲ آذر»)', v.dl.some(x => /عید هم/.test(x.what) && x.date === '2027-03-21' && !x.plan) && !v.sys.some(x => /ثبت شد/.test(x) && /— ۲ آذر ۱۴۰۵/.test(x)), { dl: v.dl, sys: v.sys.filter(x => /ثبت شد/.test(x)) });
    X('B28·D14 dB1 p2/p4: «… ۱۲ بود» پرسشِ پنجشنبه را نبست؛ «پنجشنبه نه، یکشنبه» ⇒ یکشنبه پرسیده و ثبت شد', v.sys.some(x => /«یکشنبه یه آزمونِ کوتاه می‌گیرم» — یکشنبه ۸ آذر ۱۴۰۵/.test(x)) && v.plans.some(q => /یکشنبه یه آزمون/.test(q.text) && q.when === '2026-11-29'), v.plans);
  });
  await run('C_aC3', async (v) => {
    X('C28-9 aC3 p21–p22 (چهارشنبه): «بعد از عید داروهام … / وسطِ ماه … آزمایشِ خون» ⇒ «کدام روز؟» بی «امروز خودش جمعه است»', v.sys.some(x => /بعد از عید داروهام/.test(x) && /کدام روز؟/.test(x)) && v.sys.some(x => /آزمایشِ خون/.test(x) && /کدام روز؟/.test(x)) && !v.sys.some(x => AMB.test(x) && /عید|وسطِ ماه/.test(x)) && !AMB.test(v.today), v.sys.filter(x => /^📅/.test(x)).slice(-8));
    /* DECISIONS_R29 C146 جایش را گرفت: «۲۰ آبان رفتم بانک» در ✏️ گزارشِ کارِ گذشته است ⇒ «انجام شد» در ۲۰ آبان، بی پرسشِ C93 */
    X('C28-10 aC3 p28 (C146): ✏️ «یکشنبه می‌رم» ⇐ «۲۰ آبان رفتم» ⇒ «انجام شد» در ۲۰ آبان ۱۴۰۵؛ هیچ «این روز گذشته — کدام روز؟» برای آن', v.sys.some(x => /رفتم بانک[^\n]*کارِ گذشته: به گفتهٔ خودتان? «انجام شد» در ۲۰ آبان ۱۴۰۵/.test(x)) && !v.sys.some(x => /این روز \(۲۰ آبان ۱۴۰۵\) گذشته — کدام روز؟/.test(x)), v.sys.filter(x => /^📅|^✓/.test(x)).slice(-5));
  });
  await run('D_tD2', async (v) => {
    X('D28-22 tD2 p7: «عید که شد میریم خونهٔ مادرم» ⇒ «رنگ‌کاری … بعد از عید» ثبت نشد؛ «اولِ ماه هم گاز رو قطع می‌کنم» پرسیده شد (DOM «امروز»: ردیفِ «کدام روز؟» ِ رنگ‌کاری)', !v.dl.some(x => /رنگ/.test(x.what)) && v.sys.some(x => /«اولِ ماه هم گاز رو قطع می‌کنم» — یکشنبه ۱ آذر/.test(x)) && /رنگ‌کاری[^\n]*کدام روز؟/.test(v.today), { dl: v.dl, today: v.today.slice(0, 1500) });
    X('D28-27 tD2 p20: ✏️ «شنبه ⇒ یکشنبه» ⇒ یکشنبه ۱ آذر (پس از روزِ گفتن)، نه ۸ آذر', v.sys.some(x => /«یکشنبه می‌رم بنگاه که قرارداد رو تسویه کنم» — یکشنبه ۱ آذر ۱۴۰۵/.test(x)) && !v.sys.some(x => /یکشنبه می‌رم بنگاه/.test(x) && /۸ آذر/.test(x)), v.sys.filter(x => /بنگاه/.test(x)));
    X('D28-28 tD2 p21: ✏️ «پس‌فردا ⇒ ۲۴ آبان» ⇒ «این روز (۲۴ آبان ۱۴۰۵) گذشته — کدام روز؟» یک بار؛ نه ۱۴۰۶؛ ثبتِ پیشین ماند', v.sys.filter(x => /^📅 «۲۴ آبان هم کارتن‌ها رو می‌خرم» — این روز \(۲۴ آبان ۱۴۰۵\) گذشته — کدام روز؟/.test(x)).length === 1 && !v.sys.some(x => /۲۴ آبان ۱۴۰۶/.test(x)) && v.dl.some(x => /کارتن/.test(x.what) && !x.done), { sys: v.sys.filter(x => /کارتن/.test(x)), dl: v.dl });
  });
  await run('A_s01', async (v) => {
    X('A28-4 s01 p32–p35 (چهارشنبه): «بعد از عید / وسطِ ماه / آخرِ سالِ تحصیلی» ⇒ «کدام روز؟»؛ هیچ «امروز خودش جمعه است» (سطرها و DOM ِ «امروز»)', !v.sys.some(x => /بعد از عید|وسطِ ماه|آخرِ سالِ تحصیلی/.test(x) && AMB.test(x)) && v.sys.filter(x => /^📅 «(?:بعد از عید|وسطِ ماه|آخرِ سالِ تحصیلی)[^»]*» — [^—]*— کدام روز؟/.test(x)).length === 3 && !AMB.test(v.today), v.sys.filter(x => /^📅/.test(x)).slice(-8));
    X('A28-1 s01 p23: «برای ودیعه هم باید برم بانک؛ پنجشنبه نه، شنبه می‌رم» پرسشِ «فردا به بنگاه زنگ می‌زنم» را جابه‌جا نکرد', !v.sys.some(x => /«فردا به بنگاه زنگ می‌زنم[^»]*» — شنبه/.test(x)), v.sys.filter(x => /بنگاه/.test(x)));
    X('A28-2 s01 p27: ✏️ به «دیروز» ⇒ «این روز … گذشته — کدام روز؟»', v.sys.some(x => /«دیروز هم کلید رو تحویل می‌گیرم» — این روز \([^)]*\) گذشته — کدام روز؟/.test(x)), v.sys.filter(x => /کلید/.test(x)));
    X('A28-3 s01 p30: «قبضِ آب رو هم اولِ ماه می‌دم» پرسشِ «اجاره … سرِ برج» را ثبت نکرد', !v.sys.some(x => /ثبت شد/.test(x) && /اجارهٔ ماهِ اول/.test(x)), v.sys.filter(x => /اجاره|قبض/.test(x)));
  });
  await run('D_arD2', async (v) => {
    X('D28-4 arD2 p10–p11: «قسطِ آخرِ حصار رو سرِ برج میدم» + «باشه» ⇒ ⏰ ِ خودش؛ نه «یادآورِ «حصار …» (یک کار، دو تاریخ)» (سطرها و DOM ِ «امروز»)', v.dl.some(x => /قسطِ آخرِ حصار/.test(x.what) && !x.plan && !x.done) && !v.sys.some(x => /یک کار، دو تاریخ/.test(x)) && !/یک کار، دو تاریخ/.test(v.today), { dl: v.dl, sys: v.sys.filter(x => /حصار/.test(x)) });
  });
  await run('B_pwB2', async (v) => {
    X('B28·D7 pwB2 c23: «۲۵ آبان با صاحب‌خونه … قرار دارم» + «باشه» ⇒ ⏰ ِ خودش؛ نه یادآورِ «تا جمعه به مدیرِ شیراز …»', v.dl.some(x => /صاحب‌خونه/.test(x.what) && !x.plan) && !v.sys.some(x => /یک کار، دو تاریخ/.test(x)), { dl: v.dl, sys: v.sys.filter(x => /صاحب|مدیرِ شیراز/.test(x)) });
  });
  await run('D_aD2', async (v) => {
    X('D28-7 aD2 p6: برنامهٔ تازهٔ «ادامه میدم و تا امتحان ۲۰ دی همینو چک می‌کنم» در تولدش «انجام شد» نگرفت (داده و DOM ِ 📜)', v.plans.some(q => /ادامه میدم/.test(q.text) && q.state === 'open') && !/ادامه میدم[^\n]*\n?[^\n]*سرانجام: انجام شد/.test(v.dos), { plans: v.plans, dos: (v.dos.match(/[^\n]*ادامه میدم[^\n]*\n?[^\n]*/g) || []).join(' ¦ ') });
  });
  await run('A_aA3', async (v) => {
    X('A27-19 aA3 p8: «سلام. زنگ زدم …» ⇒ 📌 ِ «… زنگ می‌زنم» بسته شد؛ DOM ِ «امروز» «انجام شد؟» ِ آن را ندارد', v.plans.some(q => /داروخانه/.test(q.text) && q.state === 'done') && !/داروخانه[^\n]*انجام شد؟/.test(v.today), { plans: v.plans, today: v.today.slice(0, 600) });
  });
  await run('A_oA1', async (v) => {
    X('A28-34 oA1 p33: نقلِ «امروز» در گلایه ⇒ هیچ «📅 از حرفِ خودت» از آن', !v.sys.some(x => /^📅 از حرفِ خودت: «تو /.test(x) || /^📅[^\n]*می‌پرسه/.test(x)), v.sys.filter(x => /^📅/.test(x)).slice(-6));
  });
  await run('D_tD1', async (v) => {
    X('D28-16 tD1 p16: «یه مسئلهٔ دیگه هم دارم: … ثبتش کن» ⇒ پرسشِ تاریخِ 🎯 با آن ثبت نشد', !v.sys.some(x => /به گفتهٔ خودت ثبت شد/.test(x) && /موعدِ داوری/.test(x)), v.sys.filter(x => /ثبت شد/.test(x)));
  });

  try { await b.close(); } catch (e) { }
  const ks = Object.keys(info); console.log(JSON.stringify({ replays: ks.length, ok: ks.filter(k => info[k]).length, red: ks.filter(k => !info[k]) }));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS — test_tour1_r28_dates_replay');
})();
