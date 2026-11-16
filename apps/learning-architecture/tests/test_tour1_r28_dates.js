// تورِ پولیا (دستهٔ ۱، دورِ ۲۸ — سهمِ «dates» — ۲۰۲۶-۱۱-۱۶) — DECISIONS_R28 R3: C92، C93، C94 (+ C113، C114، C116، C117، C127)؛ خانواده‌های F5 و F6.
//  جمله‌های خودِ اجراکننده‌ها (round28{A,B,C,D}/<sid>/ai/pN.json)، هر مثبت قرمز روی BASE28 = 4001c4cf، هر مثبت با همانندِ منفی‌اش:
//   F5 «امروز خودش جمعه است» برای اصطلاحِ بی‌روز — A28-4 (s01 p32–p35)، B28·D6 (dB1 p8–p10)، C28-9 (aC3 p21–p22)، D28-22/D28-20 (tD2 p1، p7)
//   F6 پرسشِ تاریخ بر کارِ نادرست / بی «آره» / ✏️ — A28-1 (s01 p23)، A28-2 (s01 p27)، A28-3 (s01 p29)، B28·D7 (dB1 p11، pwB2 c23)، B28·D14 (dB1 p2، p4)،
//      D28-4 (arD2 p10)، D28-7 (aD2 p6)، D28-16 (tD1 p16)، D28-27 (tD2 p20)، D28-28 (tD2 p21)، C28-10 (aC3 p28)، A27-19 (aA3 p8)، A28-34 (oA1 p33)
//  هیچ تاریخی در انتظارها نوشته نشده: همه از ساعتِ یخ‌زدهٔ T0 و تقویمِ خودِ صفحه. LLA_FILE = ساختِ دیگر (قرمزِ اول). ONLY=<نامِ بخش‌ها، با ویرگول>
//  گواهِ صفحه‌ای (C101 c) در test_tour1_r28_dates_replay.js است.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const T0 = Date.parse('2026-11-16T10:00:00+03:30');   // دوشنبه ۲۵ آبان: سه‌شنبه +۱، چهارشنبه +۲، پنجشنبه +۳، جمعه +۴، شنبه +۵، یکشنبه (۱ آذر) +۶

const HELPERS = () => {
  const S = APP.S;
  APP.S.loaded = true; window.__noNav = true; window.__q = [];
  APP.callAI = async (sys, user, opts) => { let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  window.__cs = (o) => Object.assign({ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
  window.__say = async (text, reply, actions) => { __q.push({ reply: reply || 'خب.', status: 'related', memory: 'm', actions: actions || [__cs({})] }); await APP.ASSIST.send(text); __q.length = 0; };
  window.__plan = (text, when) => [__cs({ said: ['plan'], plan: { text, when: when || 'next-session' } })];
  window.__cur = () => APP.ASSIST.cur ? APP.ASSIST.cur() : APP.S.get(localStorage.getItem('lla.assist.cur'));
  window.__sys = () => ((__cur() || {}).msgs || []).filter(m => m.role === 'sys').map(m => m.text);
  window.__dl = () => APP.S.all('deadline').filter(d => !d.done).map(d => ({ what: d.what, date: d.date, plan: !!d.plan }));
  window.__dlAll = () => APP.S.all('deadline').map(d => ({ what: d.what, date: d.date, done: !!d.done, by: (d.doneBy || {}).kind || '' }));
  window.__pl = () => ((__cur() || {}).plans || []).map(q => ({ id: q.id, text: q.text, when: q.when, state: q.state || 'open', remind: q.remind || '' }));
  window.__pend = () => APP.PR.datePends(__cur()).reduce((a, P) => a.concat((P.items || []).map(x => ({ what: x.what, date: x.date, amb: !!x.amb, free: !!x.free, st: P.state }))), []);
  window.__rows = () => APP.dueList().map(d => (d.txt || '') + ' ‖ ' + (d.sub || ''));
  window.__D = (n) => APP.addDays(APP.today(), n);
  window.__um = (k) => ((__cur() || {}).msgs || []).filter(x => x.role === 'user' && !/^\[/.test(x.text))[k];
  window.__dm = (d) => APP.fdate(d).split(' ').slice(0, 2).join(' ');
  window.__edit = async (m, nt) => { const s = __cur(); __q.push({ reply: 'درست شد.', status: 'related', memory: 'm', actions: [] }); const r = APP.ASSIST.retractEdit(s, m, nt);
    for (let i = 0; i < 60 && APP.ASSIST.busy(); i++) await new Promise(z => setTimeout(z, 100)); await new Promise(z => setTimeout(z, 400)); __q.length = 0; return !!(r && r.ok); };
  window.__firstDay = () => { for (let k = 1; k < 40; k++) { const d = APP.addDays(APP.today(), k); if (/^۱ /.test(APP.fdate(d))) return d; } return ''; };
  window.__farv = () => { for (let k = 1; k < 400; k++) { const d = APP.addDays(APP.today(), k); if (/^۱ فروردین/.test(APP.fdate(d))) return d; } return ''; };
};

(async () => {
  let b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); const errors = []; const info = {};
  let ctx = null, p = null;
  const open = async (ms) => { if (ctx) await ctx.close().catch(() => { }); if (!b.isConnected()) b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
    ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'Asia/Tehran' }); p = await ctx.newPage();
    p.on('pageerror', e => errors.push('pageerror: ' + e.message)); p.on('dialog', d => { d.dismiss(); }); await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.clock.install({ time: new Date(ms) }); await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(150); await p.evaluate(HELPERS); };
  const E = (fn, arg) => p.evaluate(fn, arg);
  const day = async (n) => { await p.clock.setSystemTime(new Date(T0 + n * 864e5)); };
  const fresh = async (n) => { await open(T0 + (n || 0) * 864e5); };
  const X = (name, ok, x) => { info[name] = !!ok; if (!ok) errors.push(name + ' :: ' + JSON.stringify(x).slice(0, 1500)); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return;
    for (let k = 0; k < 2; k++) { try { await fn(); return; } catch (e) { const m = String(e && e.message || e).split('\n')[0]; if (k === 0 && /crashed|closed|ERR_/i.test(m)) { try { await b.close(); } catch (e2) { } b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); ctx = null; continue; } errors.push(name + ' — exception: ' + m); return; } } };
  const amb = (l) => l.some(x => /امروز خودش|همین امروز یا/.test(x));
  const ask = (l) => l.filter(x => /^📅/.test(x));

  /* ===== F5 — اصطلاحِ بی‌روز (C92، C114): «کدام روز؟» بی روزِ پیشنهادی، هرگز «امروز خودش جمعه است»؛ از راهِ برنامهٔ گزارش‌شدهٔ مدل هم ===== */
  await section('f5', async () => {
    const cases = [
      ['A28-4 s01 p33 (چهارشنبه)', 2, 'بعد از عید هم وسایلِ انباری رو جابه‌جا می‌کنم.'],
      ['A28-4 s01 p34 (چهارشنبه)', 2, 'وسطِ ماه یه سر به خونهٔ قبلی می‌زنم که کنتور رو ببینم.'],
      ['A28-4 s01 p35 (چهارشنبه)', 2, 'آخرِ سالِ تحصیلی هم کارم سبک‌تر میشه؛ اون موقع اسباب‌کشیِ اصلی رو انجام می‌دیم.'],
      ['B28·D6 dB1 p8 (دوشنبه)', 0, 'آره. بعد از عید هم دوره‌ی دوم رو شروع می‌کنم.'],
      ['C28-9 aC3 p21 (چهارشنبه، شما)', 2, 'بعد از عید داروهام رو برای سالِ بعد تمدید می‌کنم.'],
      ['C28-9 aC3 p22 (چهارشنبه)', 2, 'وسطِ ماه هم باید برم آزمایشِ خون.'],
      ['D28-20 tD2 p1 (دوشنبه)', 0, 'ماهِ دیگه باید اسباب‌کشی کنم و می‌خوام برنامه‌ش رو درست بچینم که هیچی جا نمونه.']];
    for (const [name, d, t] of cases) { await fresh(d);
      const r = await E(async (t) => { const n0 = __sys().length; const plt = t.replace(/^آره\. /, ''); await __say(t, 'خب.', __plan(plt)); return { l: __sys().slice(n0), pend: __pend(), dl: __dl(), rows: __rows() }; }, t);
      X('F5 ' + name + ': «' + t.slice(0, 40) + '…» ⇒ «کدام روز؟» بی «امروز خودش …»؛ چیزی ثبت نشد', ask(r.l).length === 1 && /کدام روز؟/.test(ask(r.l)[0]) && !amb(r.l) && !amb(r.rows) && r.pend.length === 1 && r.pend[0].free && !r.dl.length, r); }
    /* منفی (C1): «تا جمعه» در خودِ جمعه همان پرسشِ «همین امروز یا جمعهٔ بعد؟» است — pwB2 p20 */
    await fresh(4); const n1 = await E(async () => { const n0 = __sys().length; await __say('تا جمعه به مدیرِ شیراز جواب می‌دم.', 'خب.', __plan('تا جمعه به مدیرِ شیراز جواب می‌دم')); return { l: __sys().slice(n0), pend: __pend() }; });
    X('F5 منفی pwB2 p20: «تا جمعه …» در جمعه ⇒ «همین امروز یا جمعهٔ بعد؟» می‌ماند', amb(n1.l) && n1.pend.length === 1 && n1.pend[0].amb && !n1.pend[0].free, n1);
    /* منفی (C50): «سرِ برج» روزِ تقویم است — «… درست است؟» با یکمِ ماهِ بعد، نه «کدام روز؟» (dB1 p6) */
    await fresh(0); const n2 = await E(async () => { const o = { d1: __firstDay() }; await __say('آره، درسته. سرِ برج هم نمره‌ها رو جمع می‌زنم.', 'خب.', __plan('سرِ برج هم نمره‌ها رو جمع می‌زنم')); o.pend = __pend(); return o; });
    X('F5 منفی dB1 p6: «سرِ برج …» ⇒ یکمِ ماهِ بعد با «درست است؟»', n2.pend.length === 1 && n2.pend[0].date === n2.d1 && !n2.pend[0].amb, n2);
  });

  /* ===== C92 — ردیفِ «کدام روز؟» فقط با روزی که برای همان کار نوشت ===== */
  await section('freeAns', async () => {
    /* B28·D6 dB1 p9–p10: «وسطِ ماه یعنی حدودِ ۱۵ دی» همان ردیف را با ۱۵ دی جواب می‌دهد؛ «عید» ِ کارِ دیگرِ همان پیام نه */
    await fresh(0);
    let r = await E(async () => { const o = {}; await __say('وسطِ ماه هم یه آزمونِ دیگه می‌گیرم.', 'خب.', __plan('وسطِ ماه هم یه آزمونِ دیگه می‌گیرم')); o.p0 = __pend();
      const n0 = __sys().length; await __say('نه، وسطِ ماه یعنی حدودِ ۱۵ دی. عید هم یه برنامه‌ی تمرینِ خونه بهشون می‌دم.', 'خب.', __plan('وسطِ ماه یعنی حدودِ ۱۵ دی'));
      o.l = __sys().slice(n0); o.pl = __pl(); o.pend = __pend(); o.farv = __farv(); return o; });
    X('B28·D6 dB1 p10: «وسطِ ماه یعنی حدودِ ۱۵ دی» ⇒ آزمونِ وسطِ ماه ۱۵ دی؛ نه ۱ فروردین؛ برنامهٔ دوم/پرسشِ دوم برای همان پاسخ نه', r.p0[0].free && r.pl.length === 1 && /^\d{4}-/.test(r.pl[0].when) && r.pl[0].when !== r.farv && /۱۵ دی/.test(r.l.join(' ')) && r.pend.length === 1 && /عید هم/.test(r.pend[0].what), r);
    /* D28-22 tD2 p7: «عید که شد میریم خونهٔ مادرم» ردیفِ «بعد از عید» را جواب نمی‌دهد؛ «اولِ ماه هم گاز رو قطع می‌کنم» پرسیده می‌شود */
    await fresh(0);
    r = await E(async () => { const o = { d1: __firstDay() }; await __say('قسطِ آخرِ اجاره رو سرِ برج می‌دم، ودیعه رو صاحبخونه آخرِ سال پس میده، و رنگ‌کاریِ خونهٔ تازه بعد از عید.'); o.p0 = __pend();
      await __say('اولِ ماه هم گاز رو قطع می‌کنم. عید که شد میریم خونهٔ مادرم. وسطِ ماه کارگر میاد و دخترم آخرِ سالِ تحصیلی مدرسه‌ش رو عوض می‌کنه.'); o.dl = __dlAll(); o.pend = __pend(); return o; });
    X('D28-22 tD2 p7: «عید که شد میریم خونهٔ مادرم» ⇒ «رنگ‌کاری … بعد از عید» ثبت نشد و باز ماند؛ «اولِ ماه هم گاز …» پرسیده شد', !r.dl.some(x => /رنگ/.test(x.what)) && r.pend.some(x => x.free && /رنگ/.test(x.what)) && r.pend.some(x => /گاز/.test(x.what) && x.date === r.d1), r);
    /* منفی: پاسخِ خالی‌از‌کار («۵ فروردین») ردیفِ «بعد از عید» را جواب می‌دهد (بانکِ R28 #7) */
    await fresh(8);
    r = await E(async () => { await __say('قسطِ آخرِ اجاره رو سرِ برج می‌دم، ودیعه رو صاحبخونه آخرِ سال پس میده، و رنگ‌کاریِ خونهٔ تازه بعد از عید.'); const o = { f5: APP.addDays(__farv(), 4) }; await __say('۵ فروردین'); o.dl = __dl(); o.pend = __pend(); return o; });
    X('منفیِ D28-22: «۵ فروردین» ِ تنها ⇒ همان ردیف', r.dl.some(x => x.date === r.f5) || r.pend.some(x => x.date === r.f5 && !x.free), r);
  });

  /* ===== C92 — پرسش‌ها برای هر کار جدا ===== */
  await section('perAct', async () => {
    /* A28-1 s01 p22–p23 (چهارشنبه): «پنجشنبه نه» ِ جملهٔ بانک پرسشِ «زنگ به بنگاه» (فردا = پنجشنبه) را جابه‌جا نمی‌کند */
    await fresh(2);
    let r = await E(async () => { const o = { thu: __D(1), sat: __D(3) }; await __say('فردا به بنگاه زنگ می‌زنم که متنِ قرارداد رو آماده کنه.'); await __say('پس‌فردا هم کلید رو تحویل می‌گیرم.'); await __say('آره');
      const n0 = __sys().length; await __say('برای ودیعه هم باید برم بانک؛ پنجشنبه نه، شنبه می‌رم.'); o.l = __sys().slice(n0); o.pend = __pend(); return o; });
    X('A28-1 s01 p23: «برای ودیعه … بانک؛ پنجشنبه نه، شنبه می‌رم» ⇒ پرسشِ «زنگ به بنگاه» پنجشنبه می‌ماند؛ بانک شنبه پرسیده شد', !r.l.some(x => /بنگاه/.test(x) && /به‌جای/.test(x)) && r.pend.some(x => /بنگاه/.test(x.what) && x.date === r.thu) && r.pend.some(x => /بانک|شنبه می/.test(x.what) && x.date === r.sat), r);
    /* منفیِ A28-1: «پنجشنبه نه، شنبه» ِ تنها همان پرسشِ تازه را جابه‌جا می‌کند */
    await fresh(2);
    r = await E(async () => { const o = { thu: __D(1), sat: __D(3) }; await __say('فردا به بنگاه زنگ می‌زنم.'); await __say('پنجشنبه نه، شنبه'); o.pend = __pend(); return o; });
    X('منفیِ A28-1: «پنجشنبه نه، شنبه» ِ تنها ⇒ همان پرسش به شنبه', r.pend.length === 1 && r.pend[0].date === r.sat, r);
    /* A28-3 s01 p29–p30: «قبضِ آب رو هم اولِ ماه می‌دم» پرسشِ «اجاره … سرِ برج» را ثبت نمی‌کند (بی «آره») */
    await fresh(1);
    r = await E(async () => { const o = { d1: __firstDay() }; await __say('اجارهٔ ماهِ اول رو سرِ برج واریز می‌کنم.'); const n0 = __sys().length; await __say('قبضِ آب رو هم اولِ ماه می‌دم.'); o.l = __sys().slice(n0); o.dl = __dl(); o.pend = __pend(); return o; });
    X('A28-3 s01 p30: «قبضِ آب رو هم اولِ ماه می‌دم» ⇒ «اجاره …» ثبت نشد؛ قبضِ آب پرسیده شد', !r.dl.length && !r.l.some(x => /ثبت شد/.test(x)) && r.pend.some(x => /قبض/.test(x.what)), r);
    /* B28·D7 dB1 p11: «عید درسته» همان پرسشِ عید را ثبت می‌کند (پرسشِ کهنه‌تر هم مانده) و هرگز روزی گذشته را */
    await fresh(0);
    r = await E(async () => { const o = { farv: __farv() }; await __say('آخرِ سالِ تحصیلی می‌خوام همه حداقل ۱۵ شده باشن.'); await __say('عید هم یه برنامه‌ی تمرینِ خونه بهشون می‌دم.'); return o; });
    await day(4);
    r = Object.assign(r, await E(async () => { const n0 = __sys().length; await __say('سلام، امروز جمعه‌ست. عید درسته. تا جمعه برگه‌های آزمونِ قبلی رو تصحیح می‌کنم.'); return { l: __sys().slice(n0), dl: __dl(), td: APP.today() }; }));
    X('B28·D7 dB1 p11: «عید درسته» ⇒ «عید هم یه برنامهٔ تمرین …» با ۱ فروردین ثبت شد؛ هیچ روزِ گذشته‌ای ثبت نشد', r.dl.some(x => /عید/.test(x.what) && x.date === r.farv) && !r.dl.some(x => x.date < r.td) && !r.l.some(x => /یک کار، دو تاریخ/.test(x)), r);
    /* B28·D7 pwB2 c23 و D28-4 arD2 p10: کارِ تازه با یک واژهٔ مشترک یادآورِ برنامهٔ دیگر نیست (C73 فقط برای یادآور) */
    for (const [name, p0, t1] of [['B28·D7 pwB2', 'تا جمعه به مدیرِ شیراز جواب می‌دم.', '۲۵ آبان با صاحب‌خونه‌ی شیراز قرار دارم که خونه‌ی مادرم رو ببینم.'], ['D28-4 arD2', 'حصار رو تا جمعه تموم می‌کنم.', 'قسطِ آخرِ حصار رو سرِ برج میدم.']]) {
      await fresh(0); r = await E(async (a) => { const t1 = a.t1.replace('۲۵ آبان', __dm(__D(9))); await __say(a.p0, 'خب.', __plan(a.p0.replace(/\.$/, ''))); await __say('آره'); const n0 = __sys().length; await __say(t1); await __say('باشه.'); return { l: __sys().slice(n0), dl: __dl(), pl: __pl() }; }, { p0, t1 });
      X(name + ': «' + t1.slice(0, 30) + '…» + «باشه» ⇒ رکوردِ خودش؛ نه «یادآورِ … (یک کار، دو تاریخ)»', r.dl.length === 1 && !r.dl[0].plan && !r.l.some(x => /یک کار، دو تاریخ/.test(x)) && !r.pl.some(q => q.remind), r); }
    /* منفیِ C73: «پنجشنبه یادم بنداز که مدارکِ امضا رو آماده کنم» همچنان یادآورِ همان برنامه است */
    await fresh(0); r = await E(async () => { await __say('جمعه قرارداد رو امضا می‌کنم.', 'خب.', __plan('جمعه قرارداد رو امضا می‌کنم')); await __say('آره'); const n0 = __sys().length; await __say('پنجشنبه یادم بنداز که مدارکِ امضا رو آماده کنم.', 'یادآور را می‌پرسم.', [{ do: 'deadline', what: 'یادآور: آماده‌کردنِ مدارکِ امضا', date: __D(3) }, __cs({})]); await __say('آره'); return { l: __sys().slice(n0), dl: __dl() }; });
    X('منفیِ C73: «… یادم بنداز» ⇒ همچنان یادآورِ پیوسته به 📌', r.dl.length === 1 && r.dl[0].plan, r);
    /* D28-16 tD1 p16 (C113): «یه مسئلهٔ دیگه هم دارم: … ثبتش کن» پرسشِ تاریخِ باز را ثبت نمی‌کند */
    await fresh(0); r = await E(async () => { await __say('دو هفته دیگه جوابِ وام رو می‌گیرم.'); const o = { p0: __pend() }; const n0 = __sys().length; await __say('یه مسئلهٔ دیگه هم دارم: ماشینم ماهی ۴۰۰ کیلومتر کار می‌کنه و می‌خوام بفهمم گازسوز کردنش می‌صرفه یا نه. ثبتش کن.'); o.l = __sys().slice(n0); o.dl = __dl(); return o; });
    X('D28-16 tD1 p16: «یه مسئلهٔ دیگه هم دارم: … ثبتش کن» ⇒ پرسشِ تاریخ ثبت نشد', r.p0.length === 1 && !r.dl.length && !r.l.some(x => /به گفتهٔ خودت ثبت شد/.test(x)), r);
    /* منفیِ D28-16: «ثبتش کن» ِ تنها همان پرسش را ثبت می‌کند */
    await fresh(0); r = await E(async () => { await __say('دو هفته دیگه جوابِ وام رو می‌گیرم.'); await __say('ثبتش کن'); return { dl: __dl() }; });
    X('منفیِ D28-16: «ثبتش کن» ِ تنها ⇒ ثبت', r.dl.length === 1, r);
    /* A28-34 oA1 p33: نقلِ سطرِ «امروز» در گلایه پرسشِ تاریخ نمی‌سازد */
    await fresh(1); r = await E(async () => { const n0 = __sys().length; await __say('یه چیزی: تو «امروز» هنوز از من می‌پرسه «پنج‌شنبه رسماً جواب می‌دم — پنجشنبه ۷ آبان — درست است؟» در حالی که من پنجشنبه جواب دادم. اگه صفحه چیزی رو اشتباه ثبت کرده، خودم از کجا برش گردونم؟'); return { l: __sys().slice(n0), pend: __pend() }; });
    X('A28-34 oA1 p33: نقلِ «امروز» ⇒ هیچ پرسشِ تاریخ', !ask(r.l).length && !r.pend.length, r);
    /* منفیِ A28-34: همان روز در حرفِ خودش (بی نقل) پرسیده می‌شود */
    await fresh(1); r = await E(async () => { await __say('فعلاً می‌مونم، ولی پنج‌شنبه رسماً جواب می‌دم.'); return { pend: __pend() }; });
    X('منفیِ A28-34: «پنج‌شنبه رسماً جواب می‌دم» ⇒ پرسیده شد', r.pend.length === 1, r);
  });

  /* ===== C94 — گذشتهٔ فعلِ همان کار؛ برنامهٔ تازه در تولدش «انجام شد» نمی‌گیرد ===== */
  await section('done', async () => {
    /* B28·D14 dB1 p2: «… میانگین ۱۲ بود» پرسشِ «پنجشنبه یه آزمونِ کوتاه می‌گیرم» را نمی‌بندد */
    await fresh(0);
    let r = await E(async () => { const o = { thu: __D(3) }; await __say('پنجشنبه یه آزمونِ کوتاه می‌گیرم.', 'خب.', __plan('پنجشنبه یه آزمونِ کوتاه می‌گیرم')); const n0 = __sys().length;
      await __say('داده‌ها: نمره‌ی آزمونِ مهر میانگین ۱۲ بود؛ بیشتر توی معادله‌ی درجه دو می‌پرن. شنبه هم با مدیر درباره‌ی ساعتِ اضافه حرف می‌زنم.'); o.l = __sys().slice(n0); o.pend = __pend();
      await __say('هشت جلسه تا امتحان دارم. آزمون رو پنجشنبه نه، یکشنبه می‌گیرم.'); o.pend2 = __pend(); o.sun = __D(6); return o; });
    X('B28·D14 dB1 p2/p4: «… ۱۲ بود» پرسشِ پنجشنبه را نبست؛ «پنجشنبه نه، یکشنبه» یکشنبه را پرسید', r.pend.some(x => /آزمون/.test(x.what) && x.date === r.thu) && r.pend2.some(x => /آزمون/.test(x.what) && x.date === r.sun) && !r.pend2.some(x => /آزمون/.test(x.what) && x.date === r.thu), r);
    /* A27-19 aA3 p8 (روزِ بعد): «سلام. زنگ زدم. …» همان 📌 را می‌بندد؛ «امروز» دیگر «انجام شد؟» نمی‌پرسد */
    await fresh(0); await E(async () => { const t = 'فردا صبح به داروخانهٔ سرِ کوچه زنگ می‌زنم.'; await __say(t, 'خب.', __plan('فردا صبح به داروخانهٔ سرِ کوچه زنگ می‌زنم')); await __say('بله'); }); await day(1);
    r = await E(async () => { await __say('سلام. زنگ زدم. داروساز گفت تا یک ساعت دیر و زود اشکالی ندارد، و داروی اول با غذا یا بی‌غذا فرقی نمی‌کند. پیش‌بینی‌ام درست بود! پس برنامه همان است که چیدم.'); return { pl: __pl(), rows: __rows() }; });
    X('A27-19 aA3 p8: «زنگ زدم» ⇒ برنامهٔ «… زنگ می‌زنم» بسته شد؛ «امروز» «انجام شد؟» نمی‌پرسد', r.pl.length >= 1 && r.pl[0].state === 'done' && !r.rows.some(x => /داروخانه/.test(x) && /انجام شد؟/.test(x)), r);
    /* C117: «زنگ زدم» با دو برنامهٔ زنگِ باز ⇒ «کدام؟»، هیچ‌کدام بسته نمی‌شود */
    await fresh(0); await E(async () => { await __say('فردا به داروخانه زنگ می‌زنم.', 'خب.', __plan('فردا به داروخانه زنگ می‌زنم')); await __say('بله'); await __say('فردا به بیمه هم زنگ می‌زنم.', 'خب.', __plan('فردا به بیمه هم زنگ می‌زنم')); await __say('بله'); }); await day(1);
    r = await E(async () => { const n0 = __sys().length; await __say('زنگ زدم.'); return { l: __sys().slice(n0), pl: __pl() }; });
    X('C117: «زنگ زدم» با دو برنامهٔ زنگ ⇒ «کدام؟» و هیچ‌کدام بسته نشد', r.pl.every(q => q.state === 'open') && r.l.some(x => /کدام؟/.test(x)), r);
    /* منفی: «به تعمیرکار زنگ زدم» برنامهٔ «به مادربزرگ زنگ می‌زنم» را نمی‌بندد */
    await fresh(0); await E(async () => { await __say('فردا به مادربزرگ زنگ می‌زنم.', 'خب.', __plan('فردا به مادربزرگ زنگ می‌زنم')); await __say('بله'); }); await day(1);
    r = await E(async () => { await __say('به تعمیرکار زنگ زدم.'); return { pl: __pl() }; });
    X('منفیِ C94: «به تعمیرکار زنگ زدم» ⇒ برنامهٔ مادربزرگ باز ماند', r.pl[0].state === 'open', r);
    /* D28-7 aD2 p6: مدل در همان نوبت plan و plan_done ِ همان برنامه را گزارش کرد ⇒ برنامهٔ تازه باز می‌ماند */
    await fresh(0); r = await E(async () => { await __say('ادامه میدم و تا امتحان ۲۰ دی همینو چک می‌کنم. با این معیار قبوله.', 'آفرین.', [__cs({ said: ['result'], result: 'با این معیار قبوله', plan: { text: 'ادامه میدم و تا امتحان ۲۰ دی همینو چک می‌کنم', when: 'next-session' }, plan_done: { id: 'pl1', done: true } })]); return { pl: __pl() }; });
    X('D28-7 aD2 p6: برنامهٔ تازه در همان نوبت «انجام شد» نگرفت', r.pl.length === 1 && r.pl[0].state === 'open', r);
    /* منفیِ D28-7: plan_done ِ برنامهٔ پیشین همچنان آن را می‌بندد */
    await fresh(0); r = await E(async () => { await __say('فردا آزمونک‌هام رو نگاه می‌کنم.', 'خب.', __plan('فردا آزمونک‌هام رو نگاه می‌کنم')); await __say('نگاه کردم، همه بالای ۱۵ بودن.', 'عالی.', [__cs({ said: ['result'], plan_done: { id: 'pl1', done: true } })]); return { pl: __pl() }; });
    X('منفیِ D28-7: plan_done ِ برنامهٔ نوبتِ پیش ⇒ بسته', r.pl[0].state === 'done', r);
  });

  /* ===== C93 — ✏️: روزِ نسبی از روزِ گفتن؛ روزِ گذشته ⇒ «این روز گذشته — کدام روز؟» و ثبتِ پیشین می‌ماند ===== */
  await section('edit', async () => {
    /* D28-27 tD2 p20: «شنبه» ⇒ «یکشنبه»، گفته‌شده دوشنبه، ✏️ شش روز بعد (یکشنبه) ⇒ یکشنبهٔ پس از روزِ گفتن = همان روزِ ✏️، نه یکشنبهٔ بعد */
    await fresh(0); await E(async () => { await __say('پنجشنبه نه، شنبه می‌رم بنگاه که قرارداد رو تسویه کنم.', 'خب.', __plan('شنبه می‌رم بنگاه که قرارداد رو تسویه کنم')); await __say('بله.'); }); await day(6);
    let r = await E(async () => { const o = { td: APP.today(), next: __D(7) }; o.ok = await __edit(__um(0), 'پنجشنبه نه، یکشنبه می‌رم بنگاه که قرارداد رو تسویه کنم.'); o.pend = __pend(); return o; });
    X('D28-27 tD2 p20: ✏️ «شنبه ⇒ یکشنبه» ⇒ یکشنبهٔ پس از روزِ گفتن (امروز)، نه یکشنبهٔ بعد', r.ok && r.pend.some(x => x.date === r.td) && !r.pend.some(x => x.date === r.next), r);
    /* D28-28 tD2 p21: «پس‌فردا» ⇒ «۲۴ آبان» (روزِ پیش از پیام) ⇒ «این روز گذشته — کدام روز؟»، نه سالِ بعد؛ ثبتِ پیشین می‌ماند */
    await fresh(0); r = await E(async () => { const o = { d2: __D(2), y: __D(200) }; await __say('فردا با شرکتِ باربری تماس می‌گیرم، پس‌فردا هم کارتن‌ها رو می‌خرم.'); await __say('باشه.');
      const n0 = __sys().length; o.ok = await __edit(__um(0), 'فردا با شرکتِ باربری تماس می‌گیرم، ' + __dm(__D(-1)) + ' هم کارتن‌ها رو می‌خرم.'); o.l = __sys().slice(n0); o.pend = __pend(); o.dl = __dl(); return o; });
    X('D28-28 tD2 p21: ✏️ به «۲۴ آبان» ِ گذشته ⇒ «این روز گذشته — کدام روز؟»؛ نه سالِ بعد؛ ثبتِ پس‌فردا ماند', r.ok && r.l.some(x => /گذشته — کدام روز؟/.test(x)) && !r.pend.some(x => x.date > r.y) && r.dl.some(x => x.date === r.d2), r);
    /* A28-2 s01 p27: ✏️ ِ روزِ ثبت‌شده به «دیروز» ⇒ همان پرسش؛ ثبت ماند */
    await fresh(1); r = await E(async () => { const o = { d5: __D(5) }; await __say('یکشنبه هم کلید رو تحویل می‌گیرم.', 'خب.', __plan('یکشنبه هم کلید رو تحویل می‌گیرم')); await __say('آره، یکشنبه');
      const n0 = __sys().length; o.ok = await __edit(__um(0), 'دیروز هم کلید رو تحویل می‌گیرم.'); o.l = __sys().slice(n0); o.pl = __pl(); o.pend = __pend(); return o; });
    X('A28-2 s01 p27: ✏️ به «دیروز» ⇒ «این روز گذشته — کدام روز؟»؛ 📌 ِ یکشنبه ماند', r.ok && r.l.some(x => /گذشته — کدام روز؟/.test(x)) && r.pl[0].when === r.d5 && r.pend.length === 1 && r.pend[0].free, r);
    /* C28-10 aC3 p28: ✏️ «یکشنبه می‌رم» ⇒ «۲۰ آبان رفتم» (گذشته) ⇒ همان پرسش؛ پرسشِ پیشین با «رفتم» ِ ✏️ «انجام شد» نمی‌گیرد */
    await fresh(2); r = await E(async () => { await __say('پنجشنبه نه، یکشنبه می‌رم بانک که حسابِ پس‌انداز رو جدا کنم.', 'خب.', __plan('یکشنبه می‌رم بانک که حسابِ پس‌انداز رو جدا کنم'));
      const n0 = __sys().length; const o = {}; o.ok = await __edit(__um(0), 'پنجشنبه نه، ' + __dm(__D(-5)) + ' رفتم بانک که حسابِ پس‌انداز رو جدا کنم.'); o.l = __sys().slice(n0); o.pend = __pend(); return o; });
    X('C28-10 aC3 p28: ✏️ به روزِ گذشته ⇒ «این روز گذشته — کدام روز؟»', r.ok && r.l.some(x => /گذشته — کدام روز؟/.test(x)) && r.pend.some(x => x.free), r);
    /* منفی: ✏️ به روزِ آینده ⇒ بی «گذشته»، روزِ تازه یک بار */
    await fresh(1); r = await E(async () => { const o = { sat: __D(4) }; await __say('پنجشنبه بلیت می‌خرم'); await __say('آره'); const n0 = __sys().length; o.ok = await __edit(__um(0), 'شنبه بلیت می‌خرم'); o.l = __sys().slice(n0); o.pend = __pend(); return o; });
    X('منفیِ C93: ✏️ به شنبه ⇒ شنبه یک بار، بی «گذشته»', r.ok && !r.l.some(x => /گذشته/.test(x)) && r.pend.length === 1 && r.pend[0].date === r.sat, r);
  });

  try { await b.close(); } catch (e) { }
  const ks = Object.keys(info); console.log(JSON.stringify({ runners: ks.length, runnersOk: ks.filter(k => info[k]).length, red: ks.filter(k => !info[k]).length }));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS — test_tour1_r28_dates');
})();
