// تورِ پولیا (دستهٔ ۱، دورِ ۳۰ — سهمِ «dates») — گواهِ صفحه‌ای (C101 (c) + C137 + C179): بازپخشِ اجرای خودِ دونده‌ها روی صفحهٔ ساخته‌شده در هر گروهی که F6 یا دمِ dates را نشان داد.
//  هر fixture (tests/fixtures/r30_dates/<گروه>_<سناریو>.json) همان گام‌های کنترلِ دونده و همان جواب‌های مدلی است که او گرفت؛ صفحه واقعاً اجرا می‌شود، فقط مدل ضبط‌شده است.
//  ساعت از خودِ اجرا (هیچ تاریخِ تقویمیِ ثابت در انتظارها جز آنچه همان اجرا روی صفحه نوشت). LLA_FILE = ساختِ دیگر (قرمزِ اول). ONLY=<نامِ fixtureها، با ویرگول>
const path = require('path');
const { chromium } = require('playwright');
const { replay } = require('./tour1_r26_replay.js');
const DIR = path.join(__dirname, 'fixtures', 'r30_dates');

(async () => {
  let b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const errors = [], info = {};
  const X = (name, ok, x) => { info[name] = !!ok; if (!ok) errors.push(name + ' :: ' + JSON.stringify(x).slice(0, 1600)); };
  const view = async (R) => R.p.evaluate(async () => {
    const o = {}, SS = APP.S.all('achat');
    const all = [].concat(...SS.map(s => (s.msgs || []).map(m => ({ at: m.at, r: m.role, t: m.text })))).sort((a, b) => String(a.at).localeCompare(String(b.at)));
    o.sys = all.filter(m => m.r === 'sys').map(x => x.t);
    o.seq = all.filter(m => m.r === 'user' || m.r === 'sys').map(x => (x.r === 'sys' ? 'S ' : 'U ') + x.t);
    o.plans = [].concat(...SS.map(s => (s.plans || []).map(q => ({ text: q.text, when: q.when, state: q.state || 'open' }))));
    o.dl = APP.S.all('deadline').map(d => ({ what: d.what, date: d.date, done: !!d.done }));
    o.ev = [].concat(...SS.map(s => (s.evlog || []).filter(e => e.k === 'pastact').map(e => e.title)));
    return o; });
  const after = (v, re, k) => { const H = v.seq.map((x, j) => /^U /.test(x) && re.test(x) ? j : -1).filter(j => j >= 0); const i = H[k || 0]; if (i == null) return null; const out = []; for (let j = i + 1; j < v.seq.length && !/^U /.test(v.seq[j]); j++) out.push(v.seq[j].slice(2)); return out; };
  const run = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return;
    for (let k = 0; k < 2; k++) { let R = null; try { R = await replay(b, name, { dir: DIR }); const v = await view(R); await fn(v, R); if (R.errors.length) errors.push(name + ' page errors: ' + R.errors.join(' | ').slice(0, 400)); await R.close(); return; }
      catch (e) { const m = String(e && e.message || e).split('\n')[0]; if (R) await R.close().catch(() => { }); if (k === 0 && /crashed|closed|ERR_/i.test(m)) { try { await b.close(); } catch (e2) { } b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); continue; } errors.push(name + ' — exception: ' + m); return; } } };

  await run('D_s35', async (v) => { const a = after(v, /^U نه، شنبه نه — یکشنبه/) || [];
    const s44 = after(v, /^U دو هفته پیش باید می‌نشستم/) || [], s29 = after(v, /^U می‌خوام هر دو هفته یه بار بشینم/) || [];
    X('D26-42 s35 s29/s44: آهنگِ «هر دو هفته یه بار» ِ پیامِ آغاز در پرونده؛ جلسه ثبت با موعدِ بعد (نه «موعدی ندارد»، نه «پیدا نشد»)', s29.some(x => /پروندهٔ تمرین باز شد/.test(x) && /موعدِ بعد/.test(x)) && s44.some(x => /✓ جلسهٔ/.test(x) && /آهنگِ خود/.test(x)) && !s44.some(x => /موعدی ندارد|پیدا نشد/.test(x)), { s29, s44 });
    X('D30-4 s35 s22 (C181): «نه، شنبه نه — یکشنبه» ⇒ هیچ ثبت؛ یکشنبه ۱۰ آبان (به‌جای ۹ آبان) پرسیده', !a.some(x => /ثبت شد و در «امروز»/.test(x)) && a.some(x => /یکشنبه ۱۰ آبان ۱۴۰۵ \(به‌جای ۹ آبان/.test(x)), a); });
  await run('A_s01', async (v) => {
    const p24 = after(v, /^U نه، زنگِ بنگاه همون پنجشنبه‌ست/) || [], p43 = after(v, /^U آره، فردا و پس‌فردا/) || [], p44 = after(v, /^U شناسنامه و کارت ملی/) || [], p49 = after(v, /^U .*سه‌شنبه‌ی هفته‌ی بعد، ۲۰ آذر/) || [], p53 = after(v, /^U سلام، امروز اولِ دیه/) || [];
    X('F6-008 s01 p24: هیچ ردیفِ بانک روی پنجشنبهٔ نفی‌شده', !p24.some(x => /پنجشنبه نه، شنبه می‌رم/.test(x) && /۱۲ آذر/.test(x)), p24);
    X('A30-3 s01 p43 (C181): «آره، فردا و پس‌فردا» ردیفِ «پنجشنبه نه، شنبه» را روی ۱۲ آذر ثبت نکرد', !p43.some(x => /پنجشنبه نه، شنبه می‌رم» — ۱۲ آذر/.test(x)), p43);
    X('A30-6 s01 p44 (C182): یک سطرِ «📜 کارِ گذشته — ۲۰ آبان»؛ ⏰ ِ «فردا میرم بانک» باز', p44.filter(x => /^📜 کارِ گذشته — ۲۰ آبان/.test(x)).length === 1 && v.dl.some(x => /فردا میرم بانک/.test(x.what) && !x.done), { p44, dl: v.dl });
    X('A30-4 s01 p49 (N6 #1): یک «کدام یکی؟» با ۱۷ و ۲۰ آذر', p49.some(x => /کدام یکی؟/.test(x) && /۱۷ آذر/.test(x) && /۲۰ آذر/.test(x)), p49);
    X('A30-5 s01 p53: پرسشِ قسطِ وام هم هست', p53.some(x => /^📅/.test(x) && /قسطِ وام/.test(x)), p53); });
  await run('B_dB3', async (v) => {
    const p14 = after(v, /^U شنبه‌ست\. جدولِ محوری/) || [], p20 = after(v, /^U سلام\. ۲۰ آبان رفتم بانک/) || [], p21 = after(v, /^U سلام، امروز اولِ آذره/) || [];
    X('B30·D19 dB3 p14: «فردا بانک.» پرسیده', p14.some(x => /«فردا بانک» —/.test(x)), p14);
    X('B30·D21 dB3 p20 (C182): سطرِ «📜 کارِ گذشته — ۲۰ آبان»', p20.some(x => /^📜 کارِ گذشته — ۲۰ آبان/.test(x)), p20);
    X('B30·D25 dB3 p21: دو پرسش (اجاره، قسطِ بیمهٔ عمر)', p21.some(x => /«سرِ برج باید اجاره رو بدم» —/.test(x) && /«قسطِ بیمه‌ی عمر رو هم بدم» —/.test(x)), p21); });
  await run('C_aC3', async (v) => {
    const p61 = after(v, /^U ۲۰ آبان رفتم بانک و قبضِ آب/) || [], p64 = after(v, /^U یکشنبه‌ی هفته‌ی بعد، ۱۸ آذر/) || [], p65 = after(v, /^U فردا بانک\.$/) || [];
    X('C182 aC3 p61: سطرِ کارِ گذشته؛ تماسِ آیندهٔ بانک باز', p61.some(x => /^📜 کارِ گذشته — ۲۰ آبان/.test(x)) && !p61.some(x => /انجام شد/.test(x)), p61);
    X('C30-10 aC3 p64: یک «کدام یکی؟» (۱۵ / ۱۸ آذر)', p64.some(x => /کدام یکی؟/.test(x) && /۱۵ آذر/.test(x) && /۱۸ آذر/.test(x)), p64);
    X('C30-14 aC3 p65: «فردا بانک.» پرسیده', p65.some(x => /«فردا بانک» —/.test(x)), p65); });
  await run('D_tD4', async (v) => {
    const p7 = after(v, /^U آره، فردا و پس‌فردا/) || [], p8 = after(v, /^U قسطِ وام رو سرِ برج میدم/) || [], p17 = after(v, /^U ۲۰ آبان رفتم اداره‌ی پست/) || [], p18 = after(v, /^U سه‌شنبه‌ی هفته‌ی بعد، ۱۲ آذر/) || [];
    X('F6-058 tD4 p7: بانک و بیمه هر دو ثبت (پرسشِ هنوز بازِ پیشین)', p7.some(x => /ثبت شد/.test(x) && /بیمهٔ ماشین/.test(x)) && p7.some(x => /ثبت شد/.test(x) && /فردا بانک/.test(x)), p7);
    X('D30-12 tD4 p8: دو پرسش (قسطِ وام، قبضِ آب)', p8.some(x => /«قسطِ وام رو سرِ برج میدم» —/.test(x) && /«قبضِ آب رو هم سرِ برج» —/.test(x)), p8);
    X('D30-16 tD4 p17 (C182): سطرِ کارِ گذشته', p17.some(x => /^📜 کارِ گذشته — ۲۰ آبان/.test(x)), p17);
    X('D30-13 tD4 p18 (N6 #1): یک «کدام یکی؟»', p18.some(x => /کدام یکی؟/.test(x) && /۱۰ آذر/.test(x) && /۱۲ آذر/.test(x)), p18); });
  await run('D_aD2', async (v) => { X('D26-1 aD2 p2 (C19): «رباتیک فقط سه‌شنبه‌ست» بی پرسش', !v.sys.some(x => /رباتیک فقط سه‌شنبه‌ست/.test(x)), v.sys.slice(0, 4)); });
  await run('A_s09', async (v) => { X('A25-21 s09 p16 (C88): هیچ «تا تا»؛ ۲۰ آذر (به‌جای ۱۵ آذر)', !v.sys.some(x => /تا تا/.test(x)) && v.sys.some(x => /۲۰ آذر ۱۴۰۵ \(به‌جای ۱۵ آذر/.test(x)), v.sys.filter(x => /آذر/.test(x))); });
  await run('D_s32', async (v) => { X('D29-24 s32 s17: «ماهِ دیگه …» بی «بررسیِ دوباره: ۱۵ دی»', !v.sys.some(x => /بررسیِ دوباره: ۱۵ دی/.test(x)), v.sys.filter(x => /سیگنال/.test(x))); });
  await run('R30D_tD2', async (v) => { X('F6-080 tD2 p6 (C19): هیچ پرسش برای «ودیعه رو صاحبخونه … پس میده»', !v.sys.some(x => /ودیعه رو صاحبخونه/.test(x) && /^📅/.test(x)), v.sys.filter(x => /ودیعه/.test(x))); });
  for (const nm of ['C_aC1', 'B_s12', 'B_tB1']) await run(nm, async () => { info[nm + ' (C179 regression scenario: replays clean)'] = true; });

  try { await b.close(); } catch (e) { }
  const ks = Object.keys(info); console.log(JSON.stringify({ replays: ks.length, ok: ks.filter(k => info[k]).length, red: ks.filter(k => !info[k]) }));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS — test_tour1_r30_dates_replay');
})();
