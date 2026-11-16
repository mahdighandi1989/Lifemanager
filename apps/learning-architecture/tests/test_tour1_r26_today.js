// تورِ پولیا (دستهٔ ۱، دورِ ۲۶ — سهمِ «today» — ۲۰۲۶-۱۱-۱۲) — DECISIONS_R26: Q5 «تاریخ‌ها و امروز» (C12 بر هر دو مسیر، C19) + Q8 «دفترِ پیش‌بینی 🎯».
//  جمله‌های خودِ اجراکننده‌ها (round26{A,B,B_x,C,D}/<sid>/ai/pN.json)، هر مثبت قرمز روی ساختِ پایه (BASE26 = 23e351f6):
//   Q5 — B26·D24/D25 (pwB2 p11–p15) · B26·D11 (bp2 p11) · B26·D3 (s14 p5) · B26·D1 (s20) · B26·D14 (s19) · U21/U22 (B_x s19، oB1 s32) · A26-6 (s02 p11→12) · A26-12/-13 (s04) ·
//        A26-21 (aA1، pwA2) · A26-49 (oA1 p26) · C26-19 (tC1 p12) · C26-28 (aC3) · C26-41 (s28 p4) · D26-37 (dp2 p9) · D26-41 (s35 p14) · D26-51 (dp3 p12–13)
//        D23-10 STILL (oD1 p8، s35 p10، s36 p7)
//   Q8 — A26-28 (aA3 p7–8، aA4 p8–9) · U49/U50 (aB3 p9–p14) · D26-14 (pwD1 p5–6) · B26·D32 (oB1 p31–32) · B25·D22 STILL (oB1 p14) · D26-23 (oD1 p17) · A26-46 (oA1 p16–17)
//  و بانکِ مستقلِ VARIANTS_R26 (tests/variants/VARIANTS_R26.json): Q5 = #130–#162، Q8 = #203–#221.
//  هیچ تاریخی در انتظارها نوشته نشده: همه از ساعتِ یخ‌زدهٔ T0 حساب می‌شوند.
// LLA_FILE = ساختِ دیگر (قرمزِ اول)؛ ONLY=reader,ask,model,pred,corr,bank5,bank8,clar
//  بخشِ clar: DECISIONS_R26 «Clarifications after the independent bank» C32–C35 و C37 (پس از وقفهٔ ۲۰۲۶-۱۱-۱۲ افزوده شد)
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const T0 = Date.parse('2026-10-18T10:00:00+03:30');   // یکشنبه — روزهای هفته از همین حساب می‌شوند (دوشنبه +۱، سه‌شنبه +۲، چهارشنبه +۳، جمعه +۵، شنبه +۶)

const HELPERS = () => {
  const S = APP.S;
  APP.S.loaded = true; window.__noNav = true;
  window.__q = []; window.__sys = [];
  APP.callAI = async (sys, user, opts) => { __sys.push(String(sys || '') + '\n' + String(user || '')); let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  window.__say = async (text, reply, actions, more) => { __sys.length = 0; __q.push({ reply: reply || 'خب.', status: 'related', memory: 'm', actions: actions || [] }); (more || []).forEach(m => __q.push(m)); await APP.ASSIST.send(text); __q.length = 0; return __sys.join('\n'); };
  window.__cur = () => APP.ASSIST.cur ? APP.ASSIST.cur() : APP.S.get(localStorage.getItem('lla.assist.cur'));
  window.__freshChat = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); return APP.ASSIST.newSession().id; };
  window.__wipe = () => { ['practice', 'ex', 'fcast', 'kexp', 'case', 'card', 'sched', 'pr', 'topic', 'knot', 'kcase', 'eprob', 'eprog', 'achat', 'deadline', 'lprob', 'psyans'].forEach(t => { try { S.all(t).forEach(r => S.del(r.id)); } catch (e) { } }); localStorage.removeItem('lla.assist.cur'); APP.go('home'); };
  window.__today = () => APP.dueList().map(d => (d.txt || '') + ' ‖ ' + (d.sub || ''));
  window.__cs = (o) => Object.assign({ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
  window.__sysLines = () => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text);
  window.__fc = () => APP.S.all('fcast').map(f => ({ id: f.id, q: f.q, p: f.p, due: f.due, out: f.outcome || '', hist: (f.verdictHist || []).map(h => h.was) }));
  window.__dl = () => APP.S.all('deadline').map(d => ({ what: d.what, date: d.date, done: !!d.done, by: d.by || '' }));
  window.__pl = () => (__cur().plans || []).map(q => ({ id: q.id, text: q.text, when: q.when, state: q.state }));
  window.__preds = () => ((__cur().coach || {}).preds || []).map(x => ({ text: x.text, p: x.p == null ? null : x.p, due: x.due || '', fc: !!x.fc, out: (x.out || {}).res || '' }));
  window.__birth = (v) => { const st = APP.S.settings(); st.profile = st.profile || {}; if (v) st.profile.birth = v; else delete st.profile.birth; delete st.profile.ageSaid; delete st.profile.birthMD; delete st.profile.reg; APP.S.saveSettings(st); };
  window.__wd = (d) => { const p = d.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).getDay(); };
  /* نخستین روزِ هفتهٔ dow پس از امروز (۱ تا ۷ روز بعد) */
  window.__nextDow = (dow) => { const t = APP.today(); let k = (dow - __wd(t) + 7) % 7; if (!k) k = 7; return APP.addDays(t, k); };
  /* جمعهٔ هفتهٔ (شنبه تا جمعهٔ) پس از هفتهٔ امروز، و هر روزِ آن هفته */
  window.__nextWeek = (dow) => { const t = APP.today(), sat = APP.addDays(t, 7 - ((__wd(t) + 1) % 7)); return APP.addDays(sat, (dow + 1) % 7); };
  window.__hd = (t) => { const h = APP.PR.herDates(t); return h.map(x => ({ date: x.date, amb: !!x.amb, what: x.what })); };
  window.__dq = () => APP.dueList().filter(d => /^📅/.test(d.txt || ''));
  window.__ask = () => __sysLines().filter(x => /^📅/.test(x));
  window.__fa = (d) => APP.fdate(d);
  /* تاریخِ گزارشِ مدل در ورودیِ آزمون نسبی است: «+N» = N روز پس از امروزِ صفحه */
  window.__rel = (acts) => { (acts || []).forEach(a => { if (a && a.plan && /^\+\d+$/.test(String(a.plan.when))) a.plan.when = APP.addDays(APP.today(), +String(a.plan.when).slice(1)); }); return acts; };
};

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { runners: {}, bank: {} };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'Asia/Tehran' });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.clock.install({ time: new Date(T0) });
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
  const E = (fn, arg) => p.evaluate(fn, arg);
  const day = async (n, hour) => { await p.clock.setSystemTime(new Date(T0 + n * 864e5 + ((hour == null ? 10 : hour) - 10) * 36e5)); };
  const load = async () => { await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(150); await E(HELPERS); };
  const fresh = async (n) => { await day(n || 0); await E(() => { __wipe(); __birth(''); __freshChat(); }); };
  const X = (name, ok, x) => { if (process.env.DUMP && name.indexOf(process.env.DUMP) >= 0) console.log('DUMP ' + name + ' :: ' + JSON.stringify(x)); info.runners[name] = !!ok; if (!ok) errors.push(name + ' :: ' + JSON.stringify(x).slice(0, 1500)); };
  const BK = (n, ok, x) => { info.bank[n] = !!ok; if (!ok) errors.push('bank #' + n + ' :: ' + JSON.stringify(x).slice(0, 1300)); };
  await load();

  /* ===== خوانندهٔ تاریخ (C19 و واژه‌مرز) — جمله‌های اجراکننده‌ها ===== */
  await section('reader', async () => {
    await fresh(0);
    const r = await E(() => { const o = { sat: __nextDow(6), thu: __nextDow(4), fri: __nextDow(5), tom: APP.addDays(APP.today(), 1), nwFri: __nextWeek(5), d20: APP.PR.parseWhen('۲۰ آبان'), d15: APP.PR.parseWhen('۱۵ آبان'), iso: APP.PR.parseWhen('۱۴۰۵/۹/۱۲') };
      o.s19 = __hd('اولین جلسه شنبه ساعت ۶ عصر'); o.s19w = APP.PR.whenInfo('اولین جلسه شنبه ساعت ۶ عصر');
      o.s04 = __hd('برای جلسهٔ شنبه عدد آماده کردم: ۱۱ میلیارد تقسیم بر ۴ نفر میشه ۲٫۷۵ میلیارد برای هر نفر. اگه سهمِ برادرم رو تو ۱۰ قسط بدیم، ۲۷۵۰ میلیون / ۱۰ = ۲۷۵ میلیون هر قسط.');
      o.tue = __hd('سه‌شنبه جلسه دارم'); o.tueD = __nextDow(2);
      o.bp2 = APP.PR.whenInfo('هفته‌ی بعد، جمعه، از بازار کرمان می‌خرمش'); o.bp2h = __hd('تصمیم گرفتم یه مخزن پلی‌اتیلن ۱۰ هزار لیتری بخرم که یه کم هم جای اضافه داشته باشه. هفته‌ی بعد، جمعه، از بازار کرمان می‌خرمش.');
      o.tC1 = APP.PR.whenInfo('تا آخرِ هفتهٔ بعد یه نمونه با سنسورِ ارزون و یه برد کوچیک می‌سازم'); o.thisWe = APP.PR.whenInfo('تا آخرِ هفته یه نمونه می‌سازم');
      o.s20 = __hd('۸ ماهه می‌خوام نشون بدم یه شبکه‌ی خاص با ۳ نوع نورون (E، I، PV) نوسان گاما تولید می‌کنه یا نه. شبیه‌سازی‌ها گاهی آره گاهی نه.'); o.m8 = __hd('تا ۸ ماه دیگه پایان‌نامه رو تحویل می‌دم');
      o.aC3 = __hd('می‌خوام بدونم اگه هر ماه یه مبلغ ثابت کنار بذارم، چقدر باشه که بعد از ۱۰ ماه ۶۰ میلیون داشته باشم و خرجِ داروهام هم کم نیاد. راستی متولد ۲۵ اسفند ۱۳۳۷ام؛ اون کارت تاریخم رو قبول نکرد، نمی‌دونم چی رو اشتباه زدم.'); o.esf = __hd('تا ۲۵ اسفند مدارک رو می‌فرستم');
      o.s28 = __hd('جلسه دوم: نسخه‌ی سه‌شنبه رو آوردم. این بار با احتیاط: فهرست کردم ۱۴×۱۴ حالت، با حداقل یه پسرِ سه‌شنبه ۲۷ حالت، دوپسر ۱۳ تا ⇒ ۱۳/۲۷. فکر کنم درسته.');
      o.s35 = __hd('راستی مهلتِ شورایاری رو اشتباه گفتم: ۲۰ آبانه، نه ۱۵ آبان.');
      o.s04b = __hd('ببخشید، اشتباه گفتم: جلسه رو شنبه می‌ذارم، نه پنجشنبه — پنجشنبه برادرم سرِ کاره.');
      o.oA1 = __hd('فاصله‌ش این بود که مدیرم رو دستِ کم گرفته بودم. پنج‌شنبه هم رسماً جواب دادم که می‌مونم. تا جمعه با اون همکارم که قراره جانشینم بشه حرف می‌زنم.'); o.oA1n = __hd('پنج‌شنبه رسماً جواب می‌دم');
      o.aA1 = __hd('۳ تا جعبه. ۸ تا شیرینی تو هر جعبه. ۵ تا رو مهمونا خوردن. ۳ تا بچه ایم من و داداشام. اااا من ۵ تا رو حساب نکرده بودم! خانم رضایی معلممون تو دبستان شهید بهشتی گفته فردا جوابشو ببریم');
      o.pwA2 = __hd('آهان اون ۲ تا رو هم باید یه روز دیگه بخونم. پس ۳ روز! ۵ و ۵ و ۲ میشه ۱۲.'); o.tomN = __hd('فردا جوابشو می‌برم مدرسه');
      o.s02 = __hd('لولهٔ سومم ۳٫۹ متریه: ۳٫۹۷ − ۳٫۹ = ۰٫۷ متر = ۷ سانت جا داره. بارگیری هم ۱۴۰۵/۹/۱۲ ـه و نمرهٔ آزمونِ گواهینامه‌م ۱۸ از ۲۰ شد.');
      o.bx1 = __hd('جلسه‌ی بعدیِ مربی باشگاهم ۱۰ اسفنده'); o.bx2 = __hd('وزن‌کشیِ بعدیم ۸ اسفنده'); o.s14 = __hd('آهان، یه بسته‌ست نه میانگین ۲۵ تا! امتحان میان‌ترم ۲۰ آبانه. یعنی من کلاً اول نمی‌فهمم چی خواسته؟');
      return o; });
    X('B26·D14 / B_x D10 s19 «اولین جلسه شنبه ساعت ۶ عصر» ⇒ شنبه (نه «سه‌شنبه» از مرزِ واژه)؛ همانند: «سه‌شنبه جلسه دارم» ⇒ سه‌شنبه', r.s19.length === 1 && r.s19[0].date === r.sat && r.s19w && r.s19w.wd === 'شنبه' && r.tue.length === 1 && r.tue[0].date === r.tueD, r);
    X('A26-13 s04 p12 «برای جلسهٔ شنبه عدد آماده کردم: …» ⇒ پرسشِ تاریخ ندارد (کارِ انجام‌شده؛ و «جلسهٔ شنبه» سه‌شنبه نیست)', r.s04.length === 0, r.s04);
    X('B26·D11 bp2 p11 «هفته‌ی بعد، جمعه، … می‌خرمش» ⇒ جمعهٔ هفتهٔ بعد، نه جمعهٔ همین هفته', r.bp2 && r.bp2.date === r.nwFri && r.nwFri !== r.fri && r.bp2h.length === 1 && r.bp2h[0].date === r.nwFri, r);
    X('C26-19 tC1 p12 «تا آخرِ هفتهٔ بعد …» ⇒ آخرِ هفتهٔ بعد؛ همانند: «تا آخرِ هفته» ⇒ همین جمعه', r.tC1 && r.tC1.date === r.nwFri && r.thisWe && r.thisWe.date === r.fri, r);
    X('B26·D1 s20 «۸ ماهه می‌خوام نشون بدم…» ⇒ مدتِ سپری‌شده تاریخ نیست؛ همانند: «تا ۸ ماه دیگه … تحویل می‌دم» ⇒ پرسیده می‌شود', r.s20.length === 0 && r.m8.length === 1, r);
    X('C26-28 aC3 p2 «… راستی متولد ۲۵ اسفند ۱۳۳۷ام؛ اون کارت تاریخم رو قبول نکرد، …» ⇒ جملهٔ تولد برنامه نیست؛ همانند: «تا ۲۵ اسفند مدارک رو می‌فرستم» ⇒ پرسیده می‌شود', r.aC3.length === 0 && r.esf.length === 1, r);
    X('C26-41 s28 p4 «نسخه‌ی سه‌شنبه رو آوردم … پسرِ سه‌شنبه» ⇒ روزِ درونِ صورتِ مسئله تاریخ نیست', r.s28.length === 0, r.s28);
    X('D26-41 s35 p14 «مهلت … ۲۰ آبانه، نه ۱۵ آبان» ⇒ فقط ۲۰ آبان؛ روزِ ردشده پرسیده نمی‌شود', r.s35.length === 1 && r.s35[0].date === r.d20 && !r.s35.some(x => x.date === r.d15), r);
    X('A26-12 s04 p8 «جلسه رو شنبه می‌ذارم، نه پنجشنبه — پنجشنبه برادرم سرِ کاره» ⇒ نه روزِ پس‌گرفته، نه برنامهٔ برادر', r.s04b.every(x => x.date === r.sat) && !r.s04b.some(x => x.date === r.thu), r.s04b);
    X('A26-49 oA1 p26 «پنج‌شنبه هم رسماً جواب دادم که می‌مونم» ⇒ کارِ انجام‌شده پرسش ندارد؛ همانند: «پنج‌شنبه رسماً جواب می‌دم» ⇒ پرسیده می‌شود', !r.oA1.some(x => x.date === r.thu) && r.oA1n.length === 1 && r.oA1n[0].date === r.thu, r);
    X('A26-21 aA1 p3 «خانم … معلممون … گفته فردا جوابشو ببریم» و pwA2 p4 «یه روز دیگه بخونم» ⇒ پرسش ندارد؛ همانند: «فردا جوابشو می‌برم مدرسه» ⇒ پرسیده می‌شود', r.aA1.length === 0 && r.pwA2.length === 0 && r.tomN.length === 1 && r.tomN[0].date === r.tom, r);
    X('A26-6 s02 p11 «بارگیری هم ۱۴۰۵/۹/۱۲ ـه و نمرهٔ … شد» ⇒ همان تاریخ، با برچسبِ بارگیری', r.s02.length === 1 && r.s02[0].date === r.iso && /بارگیری/.test(r.s02[0].what), r.s02);
    X('U21 (B_x s19 c111/c113، s14) تاریخِ رویدادِ خودش («… ۱۰ اسفنده»، «… ۸ اسفنده»، «امتحان میان‌ترم ۲۰ آبانه») خوانده می‌شود', r.bx1.length === 1 && r.bx2.length === 1 && r.s14.length === 1 && r.s14[0].date === r.d20, r);
  });

  /* ===== پرسش و پاسخ (C1، C12، «باشه»، پرسشِ بی‌جواب) ===== */
  await section('ask', async () => {
    /* pwB2 p11–p15 — جمعه */
    await fresh(5);
    const a = await E(async () => { const o = { td: APP.today(), nx: APP.addDays(APP.today(), 7) };
      await __say('تا جمعه به مدیرِ شیراز جواب می‌دم.', 'خوب است.', [__cs({ said: ['plan'], plan: { text: 'تا جمعه به مدیرِ شیراز جواب می‌دم', when: APP.today() } })]);
      o.pl1 = __pl(); o.ask1 = __ask(); o.t1 = __today().filter(x => /مدیرِ شیراز/.test(x));
      await __say('جمعه‌ی بعد.', 'باشد.', [__cs({})]);
      o.pl2 = __pl(); o.sys2 = __sysLines().slice(-1); o.dl2 = __dl();
      await __say('۲۵ آبان با صاحب‌خونه‌ی شیراز قرار دارم که خونه‌ی مادرم رو ببینم.', 'پس همان روز معلوم می‌شود.', []);
      o.ask3 = __ask().slice(-1); o.d25 = APP.PR.parseWhen('۲۵ آبان'); o.dl3 = __dl();
      await __say('باشه.', 'خب.', [__cs({})]);
      o.dl4 = __dl(); o.sys4 = __sysLines().slice(-1);
      return o; });
    X('B26·D24 pwB2 p11: «تا جمعه …» در خودِ جمعه ⇒ یک بار «همین امروز یا جمعهٔ بعد؟» و تا پاسخش برنامه برای امروز (از when ِ مدل) ثبت نمی‌شود', a.pl1.length === 1 && a.pl1[0].when === 'next-session' && a.ask1.length === 1 && /همین امروز یا جمعهٔ بعد/.test(a.ask1[0]) && !a.t1.some(x => /موعد/.test(x)), a);
    X('B26·D24 pwB2 p12: «جمعه‌ی بعد.» خوانده می‌شود ⇒ موعدِ برنامه = هفت روز بعد، با یک سطرِ تأیید', a.pl2[0].when === a.nx && /ثبت شد/.test(a.sys2.join(' ')) && a.dl2.length === 0, a);
    X('B26·D25 pwB2 p13–p14: «۲۵ آبان … قرار دارم» ⇒ «… درست است؟»؛ «باشه.» همان «آره» به پرسشِ صفحه است ⇒ موعد ثبت می‌شود، با یک سطر', /درست است؟/.test(a.ask3.join(' ')) && a.dl3.length === 0 && a.dl4.length === 1 && a.dl4[0].date === a.d25 && /ثبت شد/.test(a.sys4.join(' ')), a);
    /* dp3 p12–p13 — جمعه: «باشه» به پرسشِ دوپهلو پاسخ نیست، ولی بازتاب دارد */
    await fresh(5);
    const c = await E(async () => { const o = { nx: APP.addDays(APP.today(), 7) };
      await __say('تا جمعه یه مثلثِ دیگه رو هم با پسرم حل می‌کنم.', 'خوب.', [__cs({ said: ['plan'], plan: { text: 'تا جمعه یه مثلثِ دیگه رو هم با پسرم حل می‌کنم', when: APP.today() } })]);
      const n0 = __sysLines().length;
      await __say('باشه', 'صفحه پرسیده کدام جمعه.', [__cs({})]);
      o.after1 = __sysLines().slice(n0); o.pl1 = __pl();
      await __say('جمعهٔ بعد', 'پس جمعهٔ بعد.', [__cs({})]);
      o.pl2 = __pl(); o.sys2 = __sysLines().slice(-1); return o; });
    X('D26-51 dp3 p12: «باشه» به «همین امروز یا جمعهٔ بعد؟» ⇒ چیزی ثبت نمی‌شود ولی صفحه یک سطر می‌گوید که کدام را نخوانده', c.pl1[0].when === 'next-session' && c.after1.length === 1 && /همین امروز|یکی را/.test(c.after1[0]), c);
    X('D26-51 dp3 p13: «جمعهٔ بعد» ⇒ ثبت با یک سطرِ تأیید', c.pl2[0].when === c.nx && /ثبت شد/.test(c.sys2.join(' ')), c);
    /* s02 p11→p12 — پرسشِ بی‌جواب بی‌صدا نمی‌افتد */
    await fresh(0);
    const d = await E(async () => { const o = { iso: APP.PR.parseWhen('۱۴۰۵/۹/۱۲') };
      await __say('لولهٔ سومم ۳٫۹ متریه: ۳٫۹۷ − ۳٫۹ = ۰٫۷ متر = ۷ سانت جا داره. بارگیری هم ۱۴۰۵/۹/۱۲ ـه و نمرهٔ آزمونِ گواهینامه‌م ۱۸ از ۲۰ شد.', 'دو جای این حساب نمی‌خواند.', [__cs({ said: ['result'], result: '۳٫۹۷ − ۳٫۹ = ۰٫۷ متر = ۷ سانت جا داره' })]);
      o.ask = __ask(); const n0 = __sysLines().length;
      await __say('آهان ممیز رو جا انداختم: ۳٫۹۷ − ۳٫۹ = ۰٫۰۷ متر = ۷ سانت.', 'حالا می‌خواند.', [__cs({ said: ['result'], result: '۳٫۹۷ − ۳٫۹ = ۰٫۰۷ متر = ۷ سانت' })]);
      o.after = __sysLines().slice(n0).filter(x => /📅/.test(x)); o.dq = __dq().map(x => x.txt); o.dl1 = __dl();
      /* «آره» ِ بعدی که جوابِ دستیار است تاریخ را ثبت نمی‌کند */
      await __say('آره', 'خب.', [__cs({})]); o.dl2 = __dl();
      await __say('تاریخش درسته', 'خب.', [__cs({})]); o.dl3 = __dl(); o.sys3 = __sysLines().slice(-1); o.dq3 = __dq().length;
      return o; });
    X('A26-6 s02 p11→p12: پرسشِ تاریخ با جوابِ او به دستیار بی‌صدا نمی‌افتد — یک سطر می‌گوید بی‌جواب مانده و در «امروز» به‌شکلِ پرسش می‌ماند', d.ask.length === 1 && d.after.length === 1 && /بی‌جواب/.test(d.after[0]) && d.dq.length === 1 && d.dl1.length === 0, d);
    X('A26-6 (دنباله): «آره» ِ بی‌ربطِ بعدی ثبت نمی‌کند؛ «تاریخش درسته» ثبت می‌کند و ردیفِ پرسش از «امروز» می‌رود', d.dl2.length === 0 && d.dl3.length === 1 && d.dl3[0].date === d.iso && /ثبت شد/.test(d.sys3.join(' ')) && d.dq3 === 0, d);
    /* همان پرسش از «امروز» پاسخ می‌گیرد */
    await fresh(0);
    const e = await E(async () => { const o = {};
      await __say('۲۵ آبان با صاحب‌خونه قرار دارم که خونه رو ببینم.', 'خب.', []);
      await __say('راستی اجاره‌ش چنده؟', 'نمی‌دانم.', [__cs({})]);
      const row = __dq()[0]; o.row = row ? row.txt : ''; o.acts = row ? (row.acts || []).map(x => x.t) : [];
      if (row) row.acts[0].fn(); o.dl = __dl(); o.dq = __dq().length; return o; });
    X('ردیفِ پرسشِ تاریخ در «امروز» دکمهٔ «آره/نه» دارد و با «آره» همان‌جا ثبت می‌شود', /درست است؟/.test(e.row) && e.acts.length === 2 && e.dl.length === 1 && e.dq === 0, e);
    /* oB1 s32 — جمعه: «جمعه‌ی بعد» خودش گفته کدام */
    await fresh(5);
    const f = await E(async () => { const o = { nx: APP.addDays(APP.today(), 7) };
      await __say('جمعه‌ی بعد شام رو ساعت ۸ می‌خورم که زودتر بخوابم.', 'خب.', []);
      o.ask = __ask(); o.pend = (__cur().datePend || {}).items || []; return o; });
    X('U22 / B26·D34 oB1 s32: «جمعه‌ی بعد …» در خودِ جمعه ⇒ هفت روز بعد با «… درست است؟» — نه «همین امروز یا جمعهٔ بعد؟»', f.ask.length === 1 && /درست است؟/.test(f.ask[0]) && !/همین امروز یا/.test(f.ask[0]) && f.pend.length === 1 && f.pend[0].date === f.nx && !f.pend[0].amb, f);
  });

  /* ===== تاریخِ گزارشِ مدل (C12، مسیرِ دوم) ===== */
  await section('model', async () => {
    /* bp2 p11 — دوشنبه */
    await fresh(1);
    const a = await E(async () => { const o = { fri: __nextDow(5), nw: __nextWeek(5) };
      await __say('با ۱۴۰ میلی‌متر: ۶۰ × ۰.۱۴ = ۸.۴ متر مکعب، یعنی ۸۴۰۰ لیتر. تصمیم گرفتم یه مخزن پلی‌اتیلن ۱۰ هزار لیتری بخرم که یه کم هم جای اضافه داشته باشه. هفته‌ی بعد، جمعه، از بازار کرمان می‌خرمش.', 'حساب را خودتان کردید.', [__cs({ said: ['result', 'plan'], result: '۶۰ × ۰.۱۴ = ۸.۴ متر مکعب، یعنی ۸۴۰۰ لیتر', plan: { text: 'هفته‌ی بعد، جمعه، از بازار کرمان می‌خرمش', when: __nextDow(5) } })]);
      o.pl1 = __pl(); o.ask = __ask(); o.pend = ((__cur().datePend || {}).items || []).map(x => x.date);
      await __say('آره', 'خب.', [__cs({})]); o.pl2 = __pl(); return o; });
    X('B26·D11 / U20 bp2 p11: when ِ مدل (جمعهٔ همین هفته) ثبت نمی‌شود؛ صفحه روزِ حرفِ خودش (جمعهٔ هفتهٔ بعد) را با «… درست است؟» می‌پرسد و با «آره» همان می‌نشیند', a.pl1.length === 1 && a.pl1[0].when === 'next-session' && a.ask.length === 1 && /درست است؟/.test(a.ask[0]) && a.pend.length === 1 && a.pend[0] === a.nw && a.nw !== a.fri && a.pl2[0].when === a.nw, a);
    /* s14 p5 — کنشِ deadline ِ مدل */
    await fresh(0);
    const c = await E(async () => { const o = { d20: APP.PR.parseWhen('۲۰ آبان') };
      await __say('مجهول: احتمال اینکه یه بسته‌ی تکی، که تصادفی برمی‌دارم، کمتر از ۹۶۰ گرم باشه. آهان، یه بسته‌ست نه میانگین ۲۵ تا! امتحان میان‌ترم ۲۰ آبانه. یعنی من کلاً اول نمی‌فهمم چی خواسته؟', 'دقیقاً — یک بسته.', [__cs({ ph: 'u', said: ['u'], fail: true, nat: 'objective' }), { do: 'deadline', what: 'میان‌ترمِ آمار', date: APP.PR.parseWhen('۲۰ آبان') }]);
      o.dl1 = __dl(); o.ask = __ask();
      await __say('آره', 'خب.', [__cs({})]); o.dl2 = __dl(); o.sys2 = __sysLines().slice(-1); return o; });
    X('B26·D3 / U20 s14 p5: کنشِ deadline ِ مدل بی «… درست است؟» ثبت نمی‌شود؛ با «آره» ِ او ثبت می‌شود، یک رکورد، با سطرِ دیدنی', c.dl1.length === 0 && c.ask.length === 1 && /۲۰ آبان/.test(c.ask[0]) && /درست است؟/.test(c.ask[0]) && c.dl2.length === 1 && c.dl2[0].date === c.d20 && c.dl2[0].what === 'میان‌ترمِ آمار' && /ثبت شد/.test(c.sys2.join(' ')), c);
    /* dp2 p9 — «باشه» به پیشنهادِ تاریخ‌دارِ دستیار */
    await fresh(0);
    const d = await E(async () => { const o = { fri: __nextDow(5), sat: __nextDow(6) };
      await __say('می‌خوام ۵ تا مسئلهٔ تبدیلِ واحد حل کنم.', 'خوب است. پیگیری‌اش را برای جمعه بگذارم تا همان روز در «امروز» بپرسد چند تا را حل کردی؟', [__cs({})]);
      const n0 = __sysLines().length;
      await __say('باشه', 'پیگیری را برای جمعه می‌گذارم.', [__cs({ ph: 'l' }), { do: 'deadline', what: 'پیگیری: ۵ مسئلهٔ تبدیلِ واحد', date: __nextDow(5) }]);
      o.dl = __dl(); o.lines = __sysLines().slice(n0);
      /* همانند: تاریخی که نه او گفته نه دستیار پیشنهاد کرده */
      __freshChat();
      await __say('می‌خوام ۵ تا مسئلهٔ تبدیلِ واحد حل کنم.', 'خوب است. پیگیری بگذارم؟', [__cs({})]);
      await __say('باشه', 'گذاشتم.', [__cs({ ph: 'l' }), { do: 'deadline', what: 'پیگیری: مسئله‌های تبدیلِ واحد', date: __nextDow(6) }]);
      o.dl2 = __dl().filter(x => /مسئله‌های/.test(x.what)); o.ask2 = __ask(); return o; });
    X('D26-37 dp2 p9: «باشه» به پیشنهادِ دستیار که همان روز را داشت ⇒ ثبت می‌شود و یک سطرِ ثبت در گفت‌وگو می‌آید', d.dl.length === 1 && d.dl[0].date === d.fri && d.lines.some(x => /ثبت شد/.test(x) && /پیگیری: ۵ مسئله/.test(x)), d);
    X('همانندِ منفی: تاریخی که نه در حرفِ او هست نه در پیشنهادِ دستیار ⇒ ثبت نمی‌شود و پرسیده هم نمی‌شود', d.dl2.length === 0 && d.ask2.length === 0, d);
    /* tC1 p12 — یکشنبه */
    await fresh(0);
    const f = await E(async () => { const o = { fri: __nextDow(5), nw: __nextWeek(5) };
      await __say('قدمِ اول: تا آخرِ هفتهٔ بعد یه نمونه با سنسورِ ارزون و یه برد کوچیک می‌سازم و یه هفته تو باغِ داییم کنارِ دماسنجِ دقیق می‌ذارم.', 'این همان قدمِ اول است.', [__cs({ said: ['plan'], plan: { text: 'تا آخرِ هفتهٔ بعد یه نمونه با سنسورِ ارزون و یه برد کوچیک می‌سازم و یه هفته تو باغِ داییم کنارِ دماسنجِ دقیق می‌ذارم', when: __nextDow(5) } })]);
      o.pl = __pl(); o.pend = ((__cur().datePend || {}).items || []).map(x => x.date); return o; });
    X('C26-5 / C26-19 tC1 p12: «تا آخرِ هفتهٔ بعد …» ⇒ پرسش با آخرِ هفتهٔ بعد؛ جمعهٔ همین هفتهٔ مدل ثبت نمی‌شود', f.pl[0].when === 'next-session' && f.pend.length === 1 && f.pend[0] === f.nw, f);
    /* aB3 p9–p14 — یک تعهد، یک پرسش؛ بستنِ برنامه پیگیری‌اش را هم می‌بندد؛ پیش‌بینیِ ۷۰٪ یک 🎯 */
    await fresh(0);
    const g = await E(async () => { const o = { d: APP.PR.parseWhen('۱ اردیبهشت') };
      await __say('۲۵۰ رو می‌ذارم سپرده‌ی یک‌ساله، ۵۰ دم دست. و هر شش ماه یه بار دوباره همین حساب رو با عددای واقعی می‌کنم؛ اولیش ۱ اردیبهشت. ۷۰ درصد مطمئنم تا اون موقع کسری از سود کمتره.', 'طرحِ خودتان روشن است.', [__cs({ ph: 'p', said: ['plan'], plan: { text: 'هر شش ماه یه بار دوباره همین حساب رو با عددای واقعی می‌کنم؛ اولیش ۱ اردیبهشت', when: APP.PR.parseWhen('۱ اردیبهشت') } })]);
      o.ask = __ask(); o.items = ((__cur().datePend || {}).items || []).length; o.preds1 = __preds();
      await __say('آره، ثبتش کن.', 'برای پیگیری فرستادم.', [{ do: 'deadline', what: 'پیگیری: بازحسابِ پس‌انداز با عددهای واقعی', date: APP.PR.parseWhen('۱ اردیبهشت') }, __cs({})]);
      o.pl = __pl(); o.dl = __dl(); o.fc = __fc(); o.sid = __cur().id; return o; });
    const gd = await E(() => Math.round((Date.parse(APP.PR.parseWhen('۱ اردیبهشت') + 'T10:00:00+03:30') - Date.parse(APP.today() + 'T10:00:00+03:30')) / 864e5));
    await day(gd);
    const g2 = await E(async () => { const o = { before: __today().filter(x => /بازحساب|همین حساب/.test(x)) };
      await __say('سلام، اول اردیبهشته. همون حساب رو کردم: الان کسری ماهانه حدود ۲.۵ میلیونه و سود سپرده ماهی ۴.۸. پیش‌بینیم درست درومد. خرج درمان این شش ماه ۱۲ میلیون بود که از همون ۵۰ تا دادم.', 'بازحساب را انجام دادید.', [__cs({ ph: 'b', said: ['result'], result: 'الان کسری ماهانه حدود ۲.۵ میلیونه و سود سپرده ماهی ۴.۸. پیش‌بینیم درست درومد', plan_done: { id: 'pl1', done: true } })]);
      o.dl = __dl(); o.after = __today().filter(x => /بازحساب|همین حساب/.test(x)); o.fc = __fc(); return o; });
    X('U50 / B_x D21 aB3 p9: یک تعهد («اولیش ۱ اردیبهشت») ⇒ یک پرسش، نه دو', g.ask.length === 1 && g.items === 1, g);
    X('U50 aB3 p10–p14: پس از «انجام شد» ِ برنامه، «⏰ … موعدش گذشت؛ انجام شد؟» در «امروز» نمی‌ماند (پیگیریِ همان برنامه هم بسته می‌شود)', g.pl[0].when === g.d && g.dl.filter(x => !x.done).length <= 1 && g2.before.length >= 1 && g2.dl.every(x => x.done) && g2.after.length === 0, { g, g2 });
    X('U49 / B_x D22 aB3 p9→p14: «۷۰ درصد مطمئنم تا اون موقع کسری از سود کمتره» یک 🎯 می‌شود و «پیش‌بینیم درست درومد» همان را «شد» می‌کند', g.preds1.length === 1 && g.preds1[0].p === 70 && g2.fc.length === 1 && g2.fc[0].p === 70 && g2.fc[0].out === 'شد', { g, g2 });
  });

  /* ===== دفترِ پیش‌بینی 🎯 (Q8) ===== */
  await section('pred', async () => {
    /* aA3 p7–p8 */
    await fresh(0);
    const a = await E(async () => { const o = {};
      await __say('فکر می‌کنم بگوید نیم ساعت اشکالی ندارد؛ هفتاد درصد مطمئنم. بله، لطفاً فردا یادم بیندازید.', 'پیش‌بینی‌تان را گفتید.', [{ do: 'deadline', what: 'پیگیری: تماس با داروخانه دربارهٔ دو دارو', date: APP.addDays(APP.today(), 1) }, __cs({ ans: ['e1'] })]);
      o.preds = __preds(); o.ask = __ask(); o.dl0 = __dl();
      await __say('بله', 'خب.', [__cs({})]); o.dl1 = __dl(); return o; });
    await day(1);
    const a2 = await E(async () => { await __say('سلام. زنگ زدم. داروساز گفت تا یک ساعت دیر و زود اشکالی ندارد، و داروی اول با غذا یا بی‌غذا فرقی نمی‌کند. پیش‌بینی‌ام درست بود! پس برنامه همان است که چیدم.', 'جواب با پیش‌بینی خواند.', [{ do: 'deadline_done', what: 'پیگیری: تماس با داروخانه دربارهٔ دو دارو' }, __cs({ ph: 'b', said: ['result'], result: 'داروساز گفت تا یک ساعت دیر و زود اشکالی ندارد، و داروی اول با غذا یا بی‌غذا فرقی نمی‌کند' })]);
      return { fc: __fc(), preds: __preds() }; });
    X('A26-28 aA3 p7–p8: «…؛ هفتاد درصد مطمئنم» پیش‌بینی می‌شود و «پیش‌بینی‌ام درست بود!» یک 🎯 ِ ۷۰٪ ِ «شد» می‌سازد', a.preds.length === 1 && a.preds[0].p === 70 && a2.fc.length === 1 && a2.fc[0].p === 70 && a2.fc[0].out === 'شد', { a, a2 });
    X('aA3 p7: «لطفاً فردا یادم بیندازید» + کنشِ deadline ⇒ صفحه «… درست است؟» می‌پرسد و با «بله» یک موعد می‌نشیند', a.dl0.length === 0 && a.ask.length === 1 && a.dl1.length === 1, a);
    /* aA4 p8–p9 */
    await fresh(0);
    const c = await E(async () => { const o = {};
      await __say('واحدها را نگاه کردم: همه را به سانت نوشته‌ام و ۶ متر یعنی ۶۰۰ سانت؛ به متر هم همان درمی‌آید. فکر می‌کنم ۱۵ سانت اضافه بماند، چون ۶۰۰ منهای ۵۸۵ می‌شود ۱۵؛ نود درصد مطمئنم، مگر این‌که فروشنده کج ببُرد.', 'واحدها را هم وارسی کردید.', [__cs({ ph: 'b', ans: ['b2'] })]);
      o.preds = __preds();
      await __say('سلام. امروز رفتم ۶ متر خریدم و بریدم: ۳ قواره درآمد و ۱۵ سانت اضافه ماند — درست همان که پیش‌بینی کرده بودم. پرده را هم دوختم؛ کلِ پنجره را می‌پوشاند و چینش هم خوب است.', 'همان شد.', [__cs({ ph: 'b', said: ['result'], result: '۳ قواره درآمد و ۱۵ سانت اضافه ماند — درست همان که پیش‌بینی کرده بودم' })]);
      o.fc = __fc(); o.preds2 = __preds();
      __freshChat(); await __say('نود درصدِ کار تموم شده و فقط دوختش مونده.', 'خب.', [__cs({})]); o.neg = __preds(); return o; });
    X('A26-28 aA4 p8–p9: «…؛ نود درصد مطمئنم» پیش‌بینی می‌شود و «درست همان که پیش‌بینی کرده بودم» همان را «شد» می‌کند (یک 🎯، نه پیش‌بینیِ دوم)', c.preds.length === 1 && c.preds[0].p === 90 && c.preds2.length === 1 && c.fc.length === 1 && c.fc[0].p === 90 && c.fc[0].out === 'شد', c);
    X('همانندِ منفی: «نود درصدِ کار تموم شده» پیش‌بینی نیست', c.neg.length === 0, c.neg);
    /* pwD1 p5–p6 */
    await fresh(0);
    const d = await E(async () => { const o = {};
      await __say('پیش‌بینیم: درصدِ فراموشیم حدودِ ۸ درصد درمیاد، ۶۰ درصد مطمئنم.', 'پیش‌بینی‌ات روشن است.', [__cs({ ans: ['e1'] })]);
      o.p1 = __preds(); const n0 = __sysLines().length;
      await __say('سلام، برگشتم. سه روز آمار گرفتم: میانگینِ هر مرور ۸ ثانیه بود نه ۱۰، و درصدِ فراموشی ۱۵ درصد — از پیش‌بینیم خیلی بیشتر. حق با تو بود دربارهٔ گامِ ۳.', 'با عددِ خودت برگشتی.', [__cs({ said: ['result'], result: 'درصدِ فراموشی ۱۵ درصد' })]);
      o.p2 = __preds(); o.q = __sysLines().slice(n0).filter(x => /🎯/.test(x)); o.fc2 = __fc();
      await __say('نشد', 'خب.', [__cs({})]); o.p3 = __preds(); o.fc3 = __fc(); return o; });
    X('D26-14 pwD1 p5: «… حدودِ ۸ درصد درمیاد، ۶۰ درصد مطمئنم» یک پیش‌بینی است با اطمینانِ ۶۰ — نه دو تا', d.p1.length === 1 && d.p1[0].p === 60, d.p1);
    X('D26-14 pwD1 p6: «از پیش‌بینیم خیلی بیشتر» پیش‌بینیِ تازه نیست — صفحه یک بار می‌پرسد «شد یا نشد؟» و چیزی را حدس نمی‌زند', d.p2.length === 1 && d.q.length === 1 && /شد یا نشد|«حدودِ ۸» حساب می‌شود/.test(d.q[0]) && d.fc2.every(f => !f.out), d);   // دورِ ۲۸ (DECISIONS_R28 C120 جای «شد یا نشد؟» را برای «حدودِ N» گرفت): «این ۱۵ «حدودِ ۸» حساب می‌شود؟» — همان یک پرسش، بی حدس
    X('D26-14 (دنباله): «نشد» ⇒ همان یک 🎯 ِ ۶۰٪ داوری می‌شود', d.p3.length === 1 && d.fc3.length === 1 && d.fc3[0].p === 60 && d.fc3[0].out === 'نشد', d);
    /* oB1 p10–p32 */
    await fresh(0);
    const f = await E(async () => { const o = { fri: __nextDow(5) };
      await __say('می‌خوام این عادت رو که «قبل از هر تصمیم پیش‌بینی با درصد بنویسم و بعد بسنجم» واقعاً جا بندازم. اگه هست، برام بازش کن.', 'باز کردم.', [__cs({}), { do: 'start_practice', tid: 24, consent: { quote: 'برام بازش کن', kind: 'request' } }]);
      o.prc = (APP.PR.cases()[0] || {}).id || '';
      await __say('پیش‌بینیم: ۵ روز از ۷ موفق؛ ۶۰ درصد مطمئنم.', 'ثبت شد.', [__cs({})]);
      await __say('یعنی ۵ روز از ۷ قبل از ۶:۳۰ بیدار شدم و مطالعه کردم. پیش‌بینیم ۵ بود، درست درومد!', 'آفرین.', [{ do: 'practice_log', prc: o.prc, what: '۵ روز از ۷ موفق؛ پیش‌بینیِ ۶۰٪ درست درآمد', pct: 60, ok: true, quote: 'پیش‌بینیم ۵ بود، درست درومد' }, __cs({ said: ['result'], result: '۵ روز از ۷ قبل از ۶:۳۰ بیدار شدم و مطالعه کردم' })]);
      o.fc1 = __fc();
      await __say('آزمونم هم اینه: از امشب تا جمعه شام رو همون ساعت ۱۰ می‌خورم ولی سبک (سوپ). پیش‌بینیم: هر ۴ شب تا ۱۱:۳۰ خوابم می‌بره؛ ۹۰ درصد مطمئنم.', 'ثبت شد.', [__cs({ ph: 'p', said: ['plan'], nat: 'life', plan: { text: 'از امشب تا جمعه شام رو همون ساعت ۱۰ می‌خورم ولی سبک (سوپ)', when: __nextDow(5), on_guess: true } })]);
      await __say('آره', 'خب.', [__cs({})]);
      o.fc2 = __fc();
      await __say('پس پیش‌بینیم غلط درومده: گفته بودم ۵ روز با ۶۰ درصد اطمینان، شد ۴. کارنامه‌ی ذهنم کجا نشون میده که زیادی مطمئن بودم؟', 'جایش دفترِ پیش‌بینی است.', [{ do: 'practice_log', prc: o.prc, what: 'بازشماری: ۴ روز از ۷ موفق؛ پیش‌بینیِ ۵ روز با ۶۰٪ درست درنیامد', pct: 60, ok: false, quote: 'گفته بودم ۵ روز با ۶۰ درصد اطمینان، شد ۴' }, __cs({ ph: 'b' })]);
      o.fc3 = __fc(); o.preds3 = __preds(); return o; });
    const f60 = (L) => L.filter(x => x.p === 60), f90 = (L) => L.filter(x => x.p === 90);
    X('B26·D32 oB1 s28: «گفته بودم ۵ روز با ۶۰ درصد اطمینان، شد ۴» روی 🎯 ِ ۹۰ درصدیِ بازِ مسئلهٔ دیگر نمی‌نشیند — همان بازِ پیش از موعد می‌ماند', f90(f.fc2).length === 1 && f90(f.fc2)[0].due === f.fri && f90(f.fc3).length === 1 && f90(f.fc3)[0].out === '', f);
    X('B26·D32 (دنباله): داوریِ 🎯 ِ ۶۰٪ با تاریخچه «شد» ⇒ «نشد» می‌شود؛ جملهٔ گلایه پیش‌بینیِ سوم نمی‌شود', f60(f.fc1).length === 1 && f60(f.fc1)[0].out === 'شد' && f60(f.fc3).length === 1 && f60(f.fc3)[0].out === 'نشد' && f60(f.fc3)[0].hist.join() === 'شد' && f.fc3.length === 2 && f.preds3.length === 2 && !f.preds3.some(x => /غلط درومده/.test(x.text)), f);
    /* برگرداندنِ داوریِ نشسته (پرسشِ ۴۲/۴۴ ِ بانکِ مالک؛ B26·D32 «هیچ کنشی داوری را برنمی‌گرداند») */
    const h = await E(async () => { const o = {}; const f90 = APP.S.all('fcast').filter(x => x.p === 90)[0];
      f90.outcome = 'نشد'; f90.outcomeAt = APP.nowISO ? APP.nowISO() : new Date().toISOString(); f90.judgedBy = { kind: 'chat', sess: __cur().id }; APP.S.put(f90);
      const pr = await __say('صبر کن، اشتباه شد. این خط پیش‌بینیِ شام رو «نشد» زده؛ اون که هنوز تا جمعه وقت داره. درستش کن.', 'برمی‌گردانم.', [{ do: 'fcast_verdict', id: f90.id, res: 'open', quote: 'اون که هنوز تا جمعه وقت داره' }, __cs({ ph: 'b' })]);
      o.block = /# 🎯 داوری‌های این گفت‌وگو/.test(pr) && pr.indexOf(f90.id) >= 0; o.fc = __fc().filter(x => x.p === 90); o.line = __sysLines().slice(-1);
      /* نقلِ ساختگی پذیرفته نمی‌شود */
      const f60 = APP.S.all('fcast').filter(x => x.p === 60)[0];
      await __say('اون پیش‌بینیِ اول چی شد؟ هنوز همونه؟', 'بله.', [{ do: 'fcast_verdict', id: f60.id, res: 'شد', quote: 'در واقع درست بود' }, __cs({ ph: 'b' })]);
      o.fc60 = __fc().filter(x => x.p === 60); return o; });
    X('B26·D32 (برگشت): بلوکِ «🎯 داوری‌های این گفت‌وگو» شناسه می‌دهد و fcast_verdict با نقلِ حرفِ خودش داوری را با تاریخچه باز می‌کند', h.block && h.fc.length === 1 && h.fc[0].out === '' && h.fc[0].hist.join() === 'نشد' && /برگشت/.test(h.line.join(' ')), h);
    X('همانندِ منفی: fcast_verdict با نقلی که در پیامش نیست چیزی را عوض نمی‌کند', h.fc60.length === 1 && h.fc60[0].out === 'نشد' && h.fc60[0].hist.length === 1, h);
    /* oB1 p14 — درس حدس نیست */
    await fresh(0);
    const k = await E(async () => { const o = {};
      await __say('هفته‌ای پنج روز از هفت روز می‌خوام صبح زود بیدار شم و یه ساعت مطالعه کنم ولی نمی‌تونم.', 'مجهول چیست؟', [__cs({ ph: 'u' })]);
      const p1 = await __say('درسم: وقتی فکر می‌کنم مشکل «اراده»ست، اول روزای موفق و ناموفق رو کنار هم بذارم و ببینم چه فرقی داشتن؛ معمولاً یه علت ساده‌تر پیدا میشه. اینو جای دیگه هم امتحان می‌کنم.', 'درست را فرستادم.', [__cs({ ph: 'b' })]);
      o.lesson = /همین پیام حدس است/.test(p1);
      const p2 = await __say('فکر می‌کنم مشکل از کم‌خوابیه.', 'چطور می‌آزمایی‌اش؟', [__cs({ guess: { text: 'مشکل از کم‌خوابیه' } })]);
      o.guess = /همین پیام حدس است/.test(p2); return o; });
    X('B25·D22 STILL oB1 p14: «درسم: وقتی فکر می‌کنم مشکل «اراده»ست، اول …» حدس خوانده نمی‌شود؛ همانند: «فکر می‌کنم مشکل از کم‌خوابیه» حدس می‌ماند', !k.lesson && k.guess, k);
    /* oD1 p17 — حدسِ عینِ حرفِ خودش */
    await fresh(0);
    const m = await E(async () => { const o = {};
      await __say('می‌خوام با آزمونِ دوم ببینم پنجرهٔ ۴ ثانیه هشدارِ اشتباه می‌ده یا نه.', 'پیش‌بینی‌ات چیست و چقدر مطمئنی؟', [__cs({})]);
      await __say('پیش‌بینیم: صفر یا یک هشدارِ اشتباه، ۸۰ درصد مطمئنم. تا پس‌فردا انجامش میدم. حالا برای امروز کافیه.', 'پیش‌بینی‌ات ثبت شد.', [__cs({ said: ['guess', 'plan'], guess: { text: 'صفر یا یک هشدارِ اشتباه', q: 80 }, plan: { text: 'تا پس‌فردا انجامش میدم', when: APP.addDays(APP.today(), 2) } })]);
      o.preds = __preds();
      const p2 = await __say('خب، خلاصه رو هم بده.', 'خلاصه: …', [__cs({})]);
      o.refused = /عیناً در پیامِ او نبود/.test(p2); return o; });
    X('D26-23 oD1 p17→p18: حدسی که عیناً در پیامش هست و پیش‌بینی ثبت شد، به مدل «عیناً در پیامِ او نبود و ثبت نشد» گفته نمی‌شود', m.preds.length === 1 && m.preds[0].p === 80 && !m.refused, m);
    /* oA1 p16–p17 — با کنش‌های خودِ مدل */
    await fresh(0);
    const n = await E(async () => { const o = {};
      await __say('پیش‌بینیم: گزارشِ مالیشون باثباته، حدودِ ۷۰٪ مطمئنم. تا یکشنبه با اون دو نفر حرف می‌زنم و گزارش رو می‌خونم، بعد برمی‌گردم.', 'پیش‌بینی‌ات را ثبت کردی.', [__cs({ said: ['plan'], ans: ['e1', 'e3'], nat: 'life', guess: { text: 'گزارشِ مالیشون باثباته، حدودِ ۷۰٪ مطمئنم' }, plan: { text: 'تا یکشنبه با اون دو نفر حرف می‌زنم و گزارش رو می‌خونم', when: APP.today(), on_guess: true } })]);
      o.fc1 = __fc(); o.pl = __pl();
      await __say('برگشتم. با هر دو نفر حرف زدم و گزارش رو خوندم: دو فصلِ آخر زیان دادن و یکیشون گفت تیمش نصف شده. پس پیش‌بینیم غلط بود.', 'با شاهد برگشتی.', [__cs({ said: ['result'], nat: 'life', guess_res: { id: 'g1', res: 'refuted' }, plan_done: { id: 'pl1', done: true }, result: 'دو فصلِ آخر زیان دادن و یکیشون گفت تیمش نصف شده' })]);
      o.fc = __fc(); o.today = __today().filter(x => /🎯/.test(x)); return o; });
    const n2 = n;
    await day(6);
    const n3 = await E(() => __today().filter(x => /🎯/.test(x)));
    X('A26-46 oA1 p16→p23: پس از «پس پیش‌بینیم غلط بود» همان یک 🎯 ِ ۷۰٪ «نشد» است و «امروز» دیگر «شد یا نشد؟» نمی‌پرسد', n2.fc.length === 1 && n2.fc[0].p === 70 && n2.fc[0].out === 'نشد' && n2.today.length === 0 && n3.length === 0, { n, n2, n3 });
  });

  /* ===== D23-10 STILL (oD1 p8، s35 p10، s36 p7): بلوکِ «# اصلاحِ پیامِ پیشین (شاید)» برای سه شکلِ جاافتاده ===== */
  await section('corr', async () => {
    await fresh(0);
    const r = await E(async () => { const o = {}, B = /# اصلاحِ پیامِ پیشین \(شاید\)/;
      await __say('می‌خوام یه ترازو بسازم که بفهمه مادرم قرصش رو برداشته یا نه. هر قرص ۰٫۳ گرمه و نویزِ حسگر ۰٫۰۵ گرمه.', 'مجهول چیست؟', [__cs({ ph: 'u' })]);
      o.oD1 = B.test(await __say('آره جدا ثبتش کن ولی بعداً. یه اشتباه هم کردم: اولش گفتم هر قرص ۰٫۳ گرمه؛ امروز با ترازو وزن کردم، قرص‌های مادرم ۰٫۲۵ گرمه.', 'اصلاحت را به صفحه می‌دهم.', [__cs({})]));
      __freshChat(); await __say('می‌خوام تفکیکِ زبالهٔ محله جا بیفته. شنبه با مسئولای کوچه‌ها جلسه می‌ذارم.', 'خب.', [__cs({})]);
      o.s35 = B.test(await __say('نه، شنبه نه — یکشنبه؛ شنبه مسجد مراسم داره.', 'اصلاحتان را می‌دهم.', [__cs({})]));
      __freshChat(); await __say('۲۰ لیتر آب‌نمک ۱۰٪ داریم و ۵ لیتر آبِ خالص بهش اضافه می‌کنیم. غلظتِ تازه چند درصده؟', 'مجهول چیست؟', [__cs({ ph: 'u' })]);
      o.s36 = B.test(await __say('یه لحظه! صورتِ مسئله رو دوباره از کتاب دیدم: ظرفِ اول ۳۰ لیتر بود، نه ۲۰ لیتر. پس جوابم عوض میشه؟', 'بله.', [__cs({ ph: 'u' })]));
      o.neg = B.test(await __say('ظرفِ دوم ۵ لیتر بود و بعدش ۲ لیترِ دیگه هم ریختیم.', 'خب.', [__cs({ ph: 'u' })]));
      return o; });
    X('D23-10 STILL oD1 p8 «یه اشتباه هم کردم: اولش گفتم هر قرص ۰٫۳ گرمه؛ … ۰٫۲۵ گرمه» ⇒ بلوکِ «اصلاحِ پیامِ پیشین (شاید)» می‌آید', r.oD1, r);
    X('D23-10 STILL s35 p10 «نه، شنبه نه — یکشنبه؛ …» ⇒ بلوک می‌آید', r.s35, r);
    X('D23-10 STILL s36 p7 «ظرفِ اول ۳۰ لیتر بود، نه ۲۰ لیتر» ⇒ بلوک می‌آید؛ همانند: «ظرفِ دوم ۵ لیتر بود و بعدش ۲ لیترِ دیگه هم ریختیم» ⇒ نه', r.s36 && !r.neg, r);
  });

  /* ===== بانکِ مستقل — Q5 (#130–#162) ===== */
  await section('bank5', async () => {
    const ask1 = async (dayN, text, acts) => { await fresh(dayN); return E(async ([text, acts]) => { await __say(text, 'خب.', __rel(acts || [])); return { ask: __ask(), pend: ((__cur().datePend || {}).items || []).map(x => ({ date: x.date, amb: !!x.amb })), dl: __dl(), pl: __pl(), today: __today().filter(x => /موعد|⏰/.test(x)), td: APP.today() }; }, [text, acts]); };
    const plus = (r, n) => E(([d, n]) => APP.addDays(d, n), [r.td, n]);
    const yes = (t) => E(async (t) => { const n0 = __sysLines().length; await __say(t || 'آره', 'خب.', [__cs({})]); return { dl: __dl(), pl: __pl(), lines: __sysLines().slice(n0), ask: __ask(), pend: ((__cur().datePend || {}).items || []).map(x => ({ date: x.date, amb: !!x.amb })), state: (__cur().datePend || {}).state || '', dq: __dq().length }; }, t);
    let r, y, d;
    r = await ask1(2, 'شنبه میرم بانک و پرونده رو تحویل میدم'); d = await plus(r, 4); y = await yes('آره');
    BK(130, r.ask.length === 1 && /از حرفِ خودت/.test(r.ask[0]) && /درست است؟/.test(r.ask[0]) && r.pend.length === 1 && r.pend[0].date === d && r.dl.length === 0 && y.dl.length === 1 && y.dl[0].date === d, { r, y, d });
    r = await ask1(5, 'تا جمعه فرمِ ثبت‌نام رو می‌فرستم', [{ do: 'coach_state', ph: 'e', said: ['plan'], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical', plan: { text: 'تا جمعه فرمِ ثبت‌نام رو می‌فرستم', when: '+0' } }]); d = await plus(r, 7); y = await yes('جمعهٔ بعد');
    BK(131, r.ask.length === 1 && /همین امروز یا جمعهٔ بعد/.test(r.ask[0]) && r.pl[0].when === 'next-session' && r.today.length === 0 && y.pl[0].when === d && y.lines.filter(x => /ثبت شد/.test(x)).length === 1, { r, y, d });
    r = await ask1(5, 'جمعه‌ی بعد شام رو ساعت ۸ می‌خوریم که زودتر بخوابم'); d = await plus(r, 7);
    BK(132, r.ask.length === 1 && /درست است؟/.test(r.ask[0]) && !/همین امروز یا/.test(r.ask[0]) && r.pend.length === 1 && r.pend[0].date === d && !r.pend[0].amb, { r, d });
    r = await ask1(1, 'هفته‌ی بعد، جمعه میرم می‌خرمش', [{ do: 'coach_state', ph: 'e', said: ['plan'], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical', plan: { text: 'هفته‌ی بعد، جمعه میرم می‌خرمش', when: '+4' } }]); d = await plus(r, 11);
    BK(133, r.ask.length === 1 && /درست است؟/.test(r.ask[0]) && r.pend.length === 1 && r.pend[0].date === d && r.pl[0].when === 'next-session' && r.dl.length === 0, { r, d });
    /* #134 — DECISIONS_R26 C33 (پس از نوشتنِ بانک): «آخرِ هفتهٔ بعد» یک روز نیست ⇒ صفحه پنجشنبه یا جمعه (D0+11 / D0+12) را می‌پرسد؛
       «آره» ِ ساده هیچ‌کدام را برنمی‌گزیند (ثبت نمی‌شود، یک سطر می‌گوید)، و «جمعه» همان را ثبت می‌کند. بخشِ «فقط با پاسخِ او ثبت می‌شود» ِ ورودی همان است. */
    r = await ask1(0, 'آخرِ هفتهٔ بعد میرم شهرستان سراغش'); { const d11 = await plus(r, 11), d12 = await plus(r, 12); y = await yes('آره'); const y2 = await yes('جمعه');
      BK(134, r.ask.length === 1 && r.pend.length === 1 && r.pend[0].amb && (r.pend[0].date === d11 || r.pend[0].date === d12) && r.dl.length === 0 && y.dl.length === 0 && y2.dl.length === 1 && y2.dl[0].date === d12, { r, y, y2, d11, d12 }); }
    r = await ask1(0, 'سه روز دیگه با بنگاه قرار دارم'); d = await plus(r, 3); y = await yes('باشه');
    BK(135, r.pend.length === 1 && r.pend[0].date === d && y.dl.length === 1 && y.dl[0].date === d && y.lines.filter(x => /ثبت شد/.test(x)).length === 1, { r, y });
    r = await ask1(0, 'سه روز دیگه با استاد راهنما جلسه دارم'); d = await plus(r, 3); y = await yes('آره همون فصلِ ۲ رو میگم'); { const y2 = await yes('آره، تاریخش هم درسته');
      BK(136, y.dl.length === 0 && (y.state === 'waiting' || y.state === 'open') && y.lines.some(x => /📅/.test(x)) && y2.dl.length === 1 && y2.dl[0].date === d && y2.lines.some(x => /ثبت شد/.test(x)), { r, y, y2 }); }
    await fresh(0); await E(() => __birth('2009-06-01'));
    r = await E(async () => { const d = APP.addDays(APP.today(), 12); await __say('میان‌ترمم دوازده روزِ دیگه‌ست', 'خب.', [__cs({}), { do: 'deadline', what: 'میان‌ترم', date: d }]); return { d, ask: __ask(), dl: __dl(), pend: ((__cur().datePend || {}).items || []).map(x => x.date) }; }); y = await yes('آره');
    BK(137, r.dl.length === 0 && r.ask.length === 1 && /درست است؟/.test(r.ask[0]) && r.pend[0] === r.d && y.dl.length === 1 && y.dl[0].date === r.d && y.lines.some(x => /ثبت شد/.test(x)), { r, y });
    r = await ask1(3, 'هفتهٔ بعد، جمعه جواب میدم', [{ do: 'coach_state', ph: 'e', said: ['plan'], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical', plan: { text: 'هفتهٔ بعد، جمعه جواب میدم', when: '+2' } }]); d = await plus(r, 9);
    BK(138, r.pend.length === 1 && r.pend[0].date === d && r.pl[0].when === 'next-session' && /درست است؟/.test(r.ask.join(' ')), { r, d });
    await fresh(0); await E(() => { __birth('1954-03-01'); const st = APP.S.settings(); st.profile.reg = 'shoma'; APP.S.saveSettings(st); });
    r = await E(async () => { await __say('چهار روز دیگر نوبتِ دکتر دارم.', 'بسیار خوب.', []); return { ask: __ask() }; }); y = await yes('بله');
    BK(139, y.dl.length === 1 && y.lines.length === 1 && /ثبت شد/.test(y.lines[0]) && /خودتان/.test(y.lines[0]) && !/خودت(?!ان)/.test(y.lines[0]), { r, y });
    r = await ask1(6, 'سه‌شنبه نه، چهارشنبه میرم دکتر'); d = await plus(r, 4); { const tue = await plus(r, 3);
      BK(140, r.pend.length === 1 && r.pend[0].date === d && !r.pend.some(x => x.date === tue) && !/سه‌شنبه \S+ \S+ ۱۴۰۵/.test(r.ask.join(' ').replace(/«[^»]*»/g, '')), { r, d, tue }); }
    r = await ask1(5, 'تا جمعه پیش‌نویس رو تموم می‌کنم', [{ do: 'coach_state', ph: 'e', said: ['plan'], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical', plan: { text: 'تا جمعه پیش‌نویس رو تموم می‌کنم', when: '+7' } }]); y = await yes('همین امروز');
    BK(141, r.ask.length === 1 && y.pl[0].when === r.td && y.ask.length === 1, { r, y });
    r = await ask1(2, 'تا جمعه گزارش رو می‌فرستم'); d = await plus(r, 3); y = await yes('آره');
    BK(142, r.ask.length === 1 && !/همین امروز یا/.test(r.ask[0]) && r.pend[0].date === d && y.dl.length === 1 && y.dl[0].date === d, { r, y });
    r = await ask1(1, 'با مشاورِ مؤسسه شنبه صبح حرف می‌زنم'); d = await plus(r, 5);
    BK(143, r.pend.length === 1 && r.pend[0].date === d && /شنبه/.test(r.ask[0]) && !/— سه‌شنبه/.test(r.ask[0]), { r, d });
    r = await ask1(0, 'پس‌فردا زنگ می‌زنم بنگاه'); { const d2 = await plus(r, 2); const y1 = await yes('آره'); const r2 = await E(async () => { await __say('سه روز دیگه نمونه رو می‌برم آزمایشگاه', 'خب.', []); return { pend: ((__cur().datePend || {}).items || []).map(x => x.date) }; }); const d3 = await plus(r, 3); const y2 = await yes('آره');
      BK(144, r.pend[0].date === d2 && y1.dl.length === 1 && r2.pend[0] === d3 && y2.dl.length === 2 && y2.dl.some(x => x.date === d3), { r, y1, r2, y2 }); }
    r = await ask1(0, 'شش روز دیگه با صاحب‌خونه قرار دارم'); d = await plus(r, 6);
    y = await E(async (d) => { const n0 = __sysLines().length; await __say('باشه', 'ثبت می‌کنم.', [__cs({}), { do: 'deadline', what: 'قرار با صاحب‌خانه', date: d }]); return { dl: __dl(), lines: __sysLines().slice(n0), today: __today().filter(x => /صاحب/.test(x)) }; }, d);
    BK(145, y.dl.length === 1 && y.dl[0].date === d && y.lines.filter(x => /ثبت شد/.test(x)).length === 1, { r, y });
    r = await ask1(2, 'شنبه میرم محضر برای امضا'); { const sat = await plus(r, 4), sun = await plus(r, 5); y = await yes('باشه ولی شنبه نه، یکشنبه'); const y2 = await yes('آره');
      BK(146, y.dl.length === 0 && y.pend.length === 1 && y.pend[0].date === sun && !y.pend.some(x => x.date === sat) && y2.dl.length === 1 && y2.dl[0].date === sun, { r, y, y2 }); }
    const neg = async (n, dayN, text, birth) => { await fresh(dayN); if (birth) await E((b) => __birth(b), birth); const q = await E(async (text) => { await __say(text, 'خب.', [__cs({})]); return { ask: __ask(), dl: __dl(), today: __today().filter(x => /📅|⏰|موعد/.test(x)) }; }, text); BK(n, q.ask.length === 0 && q.dl.length === 0 && q.today.length === 0, q); };
    await neg(147, 0, 'پنجشنبه رفتم و جوابش رو دادم');
    await neg(148, 0, 'کلاسِ پنجشنبه رو نرفتم', '2011-05-01');
    await neg(149, 0, 'جلسه‌های خواهرم سه‌شنبه عصره، واسه همین اون روز ماشین دستِ اونه');
    await neg(150, 0, 'خانمِ کریمی گفت دوشنبه از فصلِ ۴ امتحان می‌گیره', '2015-05-01');
    await neg(151, 0, 'مهلتِ ثبت‌نام بیستم نیست، بیست‌وپنجمه');
    await neg(152, 0, 'مسئله میگه قطار شنبه راه میفته و سه روز تو راهه، چه روزی می‌رسه؟', '2014-05-01');
    await neg(153, 0, 'نسخه‌ی سه‌شنبه‌ی جدول رو آوردم، همون که سخت‌تره');
    await neg(154, 0, '۵ ماهه دنبالِ این کارم و هنوز نتونستم نشون بدم جواب میده');
    await neg(155, 0, 'من متولدِ ۱۲ خردادِ ۱۳۴۱ هستم');
    await neg(156, 0, 'سه‌شنبه‌ها کلاسِ زبان دارم');
    await fresh(0); r = await E(async () => { await __say('می‌خوام فصلِ دوم رو مرور کنم.', 'می‌خوای اول از بخشِ دوم شروع کنیم؟', [__cs({})]); const n0 = __sysLines().length; await __say('باشه', 'خب.', [__cs({})]); return { dl: __dl(), lines: __sysLines().slice(n0) }; });
    BK(157, r.dl.length === 0 && !r.lines.some(x => /ثبت شد|📅/.test(x)), r);
    await neg(158, 0, 'حالا یه روزِ دیگه می‌خونمش', '2016-05-01');
    r = await ask1(0, 'شنبه با مدیر جلسه دارم'); y = await yes('آره'); { const y2 = await E(async () => { const n0 = __ask().length; await __say('واسه همون جلسهٔ شنبه سؤال‌ها رو آماده می‌کنم', 'خب.', [__cs({})]); return { newAsk: __ask().length - n0, dl: __dl(), today: __today().filter(x => /📅/.test(x)) }; });
      BK(159, y.dl.length === 1 && y2.newAsk === 0 && y2.dl.length === 1 && y2.today.length === 0, { r, y, y2 }); }
    await neg(160, 0, 'دکترم گفت دوشنبه بیا آزمایشت رو تکرار کنیم');
    r = await ask1(0, 'یه وقتی بهش زنگ می‌زنم', [{ do: 'coach_state', ph: 'e', said: ['plan'], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical', plan: { text: 'یه وقتی بهش زنگ می‌زنم', when: '+3' } }]);
    BK(161, r.ask.length === 0 && r.dl.length === 0 && r.pl.every(q => q.when === 'next-session') && r.today.length === 0, r);
    r = await ask1(2, 'برنامه‌م اینه: شنبه میرم بانک', [{ do: 'coach_state', ph: 'e', said: ['plan'], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical', plan: { text: 'شنبه میرم بانک', when: '+4' } }]); d = await plus(r, 4); y = await yes('آره');
    BK(162, r.ask.length === 1 && r.pend.length === 1 && y.ask.length === 1 && y.pl[0].when === d && y.dl.length === 0, { r, y });
  });

  /* ===== بانکِ مستقل — Q8 (#203–#221) ===== */
  await section('bank8', async () => {
    const say1 = async (dayN, text, acts) => { await fresh(dayN); return E(async ([text, acts]) => { const pr = await __say(text, 'خب.', __rel(acts || [__cs({})])); return { preds: __preds(), fc: __fc(), ask: __ask(), pend: ((__cur().datePend || {}).items || []).map(x => x.date), td: APP.today(), guessNote: /همین پیام حدس است/.test(pr) }; }, [text, acts]); };
    const then = (t, acts) => E(async ([t, acts]) => { const n0 = __sysLines().length; const pr = await __say(t, 'خب.', __rel(acts || [__cs({})])); return { preds: __preds(), fc: __fc(), lines: __sysLines().slice(n0), dl: __dl(), today: __today(), pr }; }, [t, acts]);
    let r, y;
    /* #203 — DECISIONS_R26 C33 (پس از نوشتنِ بانک): «آخرِ همین هفته» ⇒ صفحه پنجشنبه یا جمعه را می‌پرسد؛ پاسخِ «جمعه» همان تأییدِ تاریخِ صفحه است که ورودی می‌خواهد */
    r = await say1(0, 'هفتاد درصد مطمئنم تا آخرِ همین هفته فصلِ ۳ رو تموم می‌کنم'); { const fri = await E(() => __nextDow(5)); y = await then('جمعه');
      BK(203, r.preds.length === 1 && r.preds[0].p === 70 && r.pend.length === 1 && r.pend[0] === fri && r.ask.length === 1 && /پنجشنبه/.test(r.ask[0]) && y.fc.length === 1 && y.fc[0].p === 70 && y.fc[0].due === fri, { r, y, fri }); }
    await fresh(0); await E(() => __birth('1959-03-01'));
    r = await E(async () => { await __say('به احتمالِ نود درصد فردا جوابِ آزمایش میاد', 'خب.', [__cs({})]); return { preds: __preds(), tom: APP.addDays(APP.today(), 1), pend: ((__cur().datePend || {}).items || []).map(x => x.date) }; }); y = await then('بله');
    BK(204, r.preds.length === 1 && r.preds[0].p === 90 && y.fc.length === 1 && y.fc[0].p === 90 && y.fc[0].due === r.tom, { r, y });
    r = await say1(0, 'پیش‌بینیم اینه که تا سه روز دیگه سفارش می‌رسه'); { const y1 = await then('هشتاد درصد مطمئنم'); await day(3); const y2 = await then('سفارش رسید، همون‌طور که گفته بودم'); const d3 = await E(() => APP.today());
      BK(205, y1.preds.length === 1 && y1.preds[0].p === 80 && y2.preds.length === 1 && y2.fc.length === 1 && y2.fc[0].p === 80 && y2.fc[0].out === 'شد' && y2.fc[0].due === d3 && y2.dl.length === 0, { r, y1, y2 }); }
    r = await say1(0, 'پیش‌بینیم: تا جمعه طرح رو تحویل میدم؛ ۶۰ درصد مطمئنم'); y = await then('آره'); { await day(5); const t0 = await E(() => __today().filter(x => /🎯/.test(x))); const y2 = await then('پیش‌بینیم غلط از آب دراومد، نرسیدم'); const t1 = y2.today.filter(x => /🎯/.test(x)); const cal = await E(() => APP.S.all('fcast').filter(f => f.outcome).length);
      BK(206, y.fc.length === 1 && t0.length === 1 && y2.fc.length === 1 && y2.fc[0].out === 'نشد' && t1.length === 0 && cal === 1, { r, y, t0, y2 }); }
    r = await say1(0, 'پیش‌بینیم: تا جمعه طرح رو تحویل میدم؛ ۶۰ درصد مطمئنم'); y = await then('آره'); { const y2 = await then('فکر کنم اون چیزی که گفته بودم داره همون‌طور میشه');
      BK(207, y2.lines.filter(x => /شد یا نشد/.test(x)).length === 1 && y2.fc.length === 1 && y2.fc[0].out === '', { y2 }); }
    r = await say1(0, 'پیش‌بینیم: بسته تا فردا می‌رسه؛ ۷۰ درصد مطمئنم'); y = await then('آره'); { await day(2); const y1 = await then('پیش‌بینیم غلط بود، نرسید'); const y2 = await then('اشتباه گفتم، در واقع شد؛ بسته همون روز رسیده بود و من ندیده بودم');
      BK(208, y1.fc.length === 1 && y1.fc[0].out === 'نشد' && y2.fc.length === 1 && y2.fc[0].out === 'شد' && y2.fc[0].hist.join() === 'نشد' && y2.lines.some(x => /«نشد» ⇒ «شد»/.test(x) && /خودت/.test(x)), { y1, y2 });
      const y3 = await then('نه، همون «شد» درست بود');
      BK(220, y3.fc.length === 1 && y3.fc[0].out === 'شد' && y3.fc[0].hist.length === 1, { y3 }); }
    await fresh(0); r = await E(async () => { await __say('هر هفته دو برابرِ چیزی که می‌خوام خرج می‌کنم و نمی‌دونم چرا.', 'مجهول چیست؟', [__cs({ ph: 'u' })]); const pr = await __say('یاد گرفتم که بدونِ فهرست خرید نرم، وگرنه دو برابر خرج می‌کنم', 'خب.', [__cs({ ph: 'b' })]); const pr2 = await __say('ممنون.', 'خواهش.', [__cs({ ph: 'b' })]); return { note: /همین پیام حدس است/.test(pr), preds: __preds(), fc: __fc(), later: /درخواستِ عقب‌افتاده \(پشتیبان، شاید\)[^#]*فهرست خرید/.test(pr2), guesses: ((__cur().coach || {}).guesses || []).length }; });
    BK(209, !r.note && r.preds.length === 0 && r.fc.length === 0 && !r.later && r.guesses === 0, r);
    await fresh(0); r = await E(async () => { await __say('می‌خوام بدونم چند بار در هفته دیر می‌رسم سرِ کار.', 'حدست چیست؟', [__cs({})]); await __say('حدسم اینه: صفر یا یک بار در هفته دیر می‌رسم', 'خب.', [__cs({ said: ['guess'], guess: { text: 'صفر یا یک بار در هفته دیر می‌رسم' } })]); const pr = await __say('خب بعدش؟', 'خب.', [__cs({})]); const C = __cur().coach || {}; return { refused: /عیناً در پیامِ او نبود/.test(pr), g: (C.guesses || []).map(g => g.text), cg: (C.guess || {}).text || '' }; });
    BK(210, !r.refused && (r.g.some(x => /صفر یا یک بار/.test(x)) || /صفر یا یک بار/.test(r.cg)), r);
    r = await say1(0, 'قول میدم تا پس‌فردا فرم رو پر کنم', [{ do: 'coach_state', ph: 'e', said: ['plan'], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical', plan: { text: 'قول میدم تا پس‌فردا فرم رو پر کنم', when: '+2' } }]); y = await then('آره'); { await day(2); const t0 = await E(() => __today().filter(x => /فرم/.test(x))); const y2 = await then('فرم رو پر کردم', [{ do: 'coach_state', ph: 'e', said: ['result'], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical', plan_done: { id: 'pl1', done: true } }]); const t1 = y2.today.filter(x => /فرم/.test(x));
      BK(211, r.ask.length === 1 && t0.length === 1 && t1.length === 0 && y2.dl.every(x => x.done), { r, y, t0, t1, dl: y2.dl }); }
    r = await say1(0, 'پیش‌بینیم: گزارشِ مالیشون باثباته، حدودِ ۷۰٪ مطمئنم. تا سه‌شنبه گزارش رو می‌خونم.', [{ do: 'coach_state', ph: 'e', said: ['plan'], ans: [], stuck: false, fail: false, role: 'self', nat: 'life', guess: { text: 'گزارشِ مالیشون باثباته، حدودِ ۷۰٪ مطمئنم' }, plan: { text: 'تا سه‌شنبه گزارش رو می‌خونم', when: '+2', on_guess: true } }]); y = await then('آره'); { await day(2); const y2 = await then('گزارش رو خوندم: دو فصلِ آخر زیان دادن. پس پیش‌بینیم غلط بود.', [{ do: 'coach_state', ph: 'e', said: ['result'], ans: [], stuck: false, fail: false, role: 'self', nat: 'life', plan_done: { id: 'pl1', done: true }, result: 'دو فصلِ آخر زیان دادن' }]);
      BK(212, y2.fc.length === 1 && y2.fc[0].out === 'نشد' && !y2.today.some(x => /🎯/.test(x)), { y, y2 }); }
    await fresh(0); r = await E(async () => { const out = [];
      for (const [t, v] of [['پیش‌بینیم: امروز جلسه سرِ وقت شروع میشه؛ ۸۰ درصد مطمئنم', 'پیش‌بینیم درست بود'], ['پیش‌بینیم: ناهار قبل از ۲ می‌رسه؛ ۷۰ درصد مطمئنم', 'پیش‌بینیم غلط بود'], ['پیش‌بینیم: گزارش امروز تموم میشه؛ ۶۰ درصد مطمئنم', 'پیش‌بینیم درست درومد']]) { __freshChat(); await __say(t, 'خب.', [__cs({})]); await __say(v, 'خب.', [__cs({})]); }
      const J = APP.S.all('fcast').filter(f => f.outcome === 'شد' || f.outcome === 'نشد'); const cal = APP.PR.calib ? APP.PR.calib() : null;
      return { judged: J.length, ids: new Set(J.map(f => f.id)).size, n: Array.isArray(cal) ? cal.length : null, cal: JSON.stringify(cal).slice(0, 300) }; });
    BK(213, r.judged === 3 && r.ids === 3 && (r.n == null || r.n === 3), r);
    r = await say1(0, 'هنوز هفتاد درصدِ کار مونده'); BK(214, r.preds.length === 0 && r.fc.length === 0, r);
    r = await say1(0, 'صد درصد باهات موافقم'); BK(215, r.preds.length === 0 && r.fc.length === 0 && r.ask.length === 0, r);
    r = await say1(0, 'دو تا پیش‌بینی: هفتاد درصد فردا بارون میاد؛ و سی درصد تا آخرِ ماه اسباب‌کشی می‌کنیم'); { const ex = await E(() => ({ tom: APP.addDays(APP.today(), 1), me: APP.PR.whenInfo('آخرِ ماه').date, fa: __fa(APP.PR.whenInfo('آخرِ ماه').date), fa1: __fa(APP.addDays(APP.PR.whenInfo('آخرِ ماه').date, 1)) })); y = await then('آره');
      BK(216, r.preds.length === 2 && y.fc.length === 2 && y.fc.some(f => f.p === 70 && f.due === ex.tom) && y.fc.some(f => f.p === 30 && f.due === ex.me) && ex.me >= r.td && /^۱ /.test(ex.fa1), { r, y, ex }); }
    r = await say1(0, 'امتحانم خوب شد', null); BK(217, r.preds.length === 0 && r.fc.length === 0, r);
    await fresh(0); r = await E(async () => { await __say('ماشینم صبح‌ها دیر روشن میشه و نمی‌دونم چرا.', 'حدست چیست؟', [__cs({ ph: 'u' })]); const pr = await __say('فکر کنم مشکل از باتری باشه، هنوز امتحانش نکردم', 'خب.', [__cs({ said: ['guess'], guess: { text: 'مشکل از باتری باشه' } })]); return { note: /حدس/.test(pr), g: ((__cur().coach || {}).guesses || []).map(g => ({ t: g.text, res: g.res || '' })), cg: ((__cur().coach || {}).guess || {}).text || '' }; });
    BK(218, r.note && (r.g.some(g => /باتری/.test(g.t) && !g.res) || /باتری/.test(r.cg)), r);
    await fresh(0); r = await E(async () => { await __say('ماشین صبح‌ها دیر روشن میشه', 'خب.', [__cs({ said: ['guess'], guess: { text: 'باتری ضعیف شده' } })]); const pr = await __say('خب؟', 'خب.', [__cs({})]); return { refused: /عیناً در پیامِ او نبود/.test(pr), g: ((__cur().coach || {}).guesses || []).length }; });
    BK(219, r.refused && r.g === 0, r);
    r = await say1(0, 'هفتاد درصدِ کتاب رو تا دیروز خونده بودم'); BK(221, r.preds.length === 0 && r.fc.length === 0 && r.ask.length === 0, r);
  });

  /* ===== DECISIONS_R26 «Clarifications after the independent bank» C32–C35، C37 (افزوده هنگامِ کار؛ هر مثبت با همانندِ منفی) ===== */
  await section('clar', async () => {
    const one = async (dayN, msgs) => { await fresh(dayN); return E(async (msgs) => { const o = { td: APP.today() }; for (let i = 0; i < msgs.length; i++) { const n0 = __sysLines().length; await __say(msgs[i], 'خب.', [__cs({})]); o['l' + i] = __sysLines().slice(n0); o['dl' + i] = __dl(); o['pend' + i] = ((__cur().datePend || {}).items || []).map(x => ({ date: x.date, amb: !!x.amb, opts: x.opts || null })); }
      o.preds = __preds(); o.fc = __fc(); o.dq = __dq().map(d => ({ txt: d.txt, acts: (d.acts || []).map(a => a.t) })); return o; }, msgs); };
    const D = (r, n) => E(([d, n]) => APP.addDays(d, n), [r.td, n]);
    /* C32 — یکشنبه: «جمعهٔ بعد» دوپهلوست ⇒ با هر دو تاریخ می‌پرسد؛ «همین جمعه» ⇒ D0+5، «جمعهٔ بعد/هفتهٔ بعد» ⇒ D0+12 */
    let r = await one(0, ['جمعهٔ بعد مقاله رو می‌فرستم', 'همین جمعه']); let d5 = await D(r, 5), d12 = await D(r, 12);
    X('C32 «جمعهٔ بعد» در یکشنبه ⇒ یک پرسش با هر دو جمعه؛ تا پاسخ چیزی ثبت نمی‌شود؛ «همین جمعه» ⇒ جمعهٔ پیشِ رو', r.l0.length === 1 && /کدام روز/.test(r.l0[0]) && r.pend0.length === 1 && r.pend0[0].amb && JSON.stringify(r.pend0[0].opts) === JSON.stringify([d5, d12]) && r.dl0.length === 0 && r.dl1.length === 1 && r.dl1[0].date === d5, r);
    r = await one(0, ['جمعهٔ بعد مقاله رو می‌فرستم', 'هفتهٔ بعد']); X('C32 «هفتهٔ بعد» ⇒ جمعهٔ پس از آن', r.dl1.length === 1 && r.dl1[0].date === d12, r);
    r = await one(0, ['جمعهٔ بعد مقاله رو می‌فرستم']); X('C32 ردیفِ «امروز» دو دکمهٔ دو تاریخ + «هیچ‌کدام» دارد', r.dq.length === 1 && r.dq[0].acts.length === 3 && /جمعه/.test(r.dq[0].acts[0]) && /جمعه/.test(r.dq[0].acts[1]), r);
    r = await one(5, ['جمعه‌ی بعد شام رو زودتر می‌خورم']); { const d7 = await D(r, 7); X('C32 همانندِ منفی: در خودِ جمعه «جمعه‌ی بعد» دوپهلو نیست ⇒ هفت روز بعد با «… درست است؟»', r.l0.length === 1 && /درست است؟/.test(r.l0[0]) && r.pend0.length === 1 && !r.pend0[0].amb && r.pend0[0].date === d7, r); }
    /* C33 — «آخرِ هفته / آخرِ همین هفته / آخرِ هفتهٔ بعد» ⇒ پنجشنبه یا جمعه */
    r = await one(0, ['آخرِ همین هفته کمد رو می‌سازم', 'پنجشنبه']); { const d4 = await D(r, 4);
      X('C33 «آخرِ همین هفته» ⇒ پرسشِ پنجشنبه یا جمعه؛ «پنجشنبه» ⇒ ثبتِ پنجشنبه', r.l0.length === 1 && /پنجشنبه/.test(r.l0[0]) && /جمعه/.test(r.l0[0]) && r.pend0[0].amb && JSON.stringify(r.pend0[0].opts) === JSON.stringify([d4, d5]) && r.dl1.length === 1 && r.dl1[0].date === d4, r); }
    r = await one(0, ['آخرِ هفته کمد رو می‌سازم', 'باشه']); X('C33 «باشه» هیچ‌کدام از دو روز را برنمی‌گزیند ⇒ چیزی ثبت نمی‌شود و یک سطر می‌گوید کدام را بنویسد', r.dl1.length === 0 && r.l1.length === 1 && /پنجشنبه/.test(r.l1[0]) && /جمعه/.test(r.l1[0]), r);
    r = await one(0, ['آخرِ هفته‌ها معمولاً مهمون داریم']); X('C33 همانندِ منفی: «آخرِ هفته‌ها» عادت است ⇒ پرسشی نیست', r.l0.length === 0 && r.pend0.length === 0, r);
    /* C34 — موعدی که خودش برای کارِ خودش می‌گوید ⇒ مسیرِ C12؛ واقعیتی دربارهٔ دیگری ⇒ بی پرسش */
    r = await one(0, ['تا بیستم باید تحویل بدهم', 'آره']); { const d20 = await E(() => { const t = APP.today(); for (let k = 0; k < 40; k++) { const d = APP.addDays(t, k); if (/^۲۰ /.test(APP.fdate(d))) return d; } return ''; });
      X('C34 «تا بیستم باید تحویل بدهم» ⇒ نخستین بیستمِ پیشِ رو با «… درست است؟» و ثبت با «آره»', r.l0.length === 1 && /درست است؟/.test(r.l0[0]) && r.pend0.length === 1 && r.pend0[0].date === d20 && r.dl0.length === 0 && r.dl1.length === 1 && r.dl1[0].date === d20, { r, d20 }); }
    r = await one(0, ['مهلتِ برادرم بیستمه']); X('C34 همانندِ منفی: موعدِ دیگری ⇒ بی پرسش', r.l0.length === 0 && r.pend0.length === 0, r);
    r = await one(0, ['تا حالا جلسه دوم رو نرفتم']); X('C34 همانندِ منفی: «جلسه دوم» روزِ ماه نیست', r.l0.length === 0 && r.pend0.length === 0, r);
    /* C35 — شرطِ آینده ⇒ نه ثبت، نه پرسش */
    r = await one(0, ['اگه شنبه برم بازار، مخزن رو می‌خرم']); X('C35 «اگه شنبه برم …» ⇒ نه پرسش، نه ثبت', r.l0.length === 0 && r.pend0.length === 0 && r.dl0.length === 0, r);
    r = await one(0, ['شنبه میرم بازار و مخزن رو می‌خرم']); X('C35 همانندِ مثبت: تعهدِ بی‌شرط ⇒ پرسش', r.l0.length === 1 && /درست است؟/.test(r.l0[0]), r);
    /* C37 — «پنجاه‌پنجاه» = ۵۰٪؛ «احتمالاً» عدد نمی‌سازد ⇒ یک بار پرسیدنِ عدد؛ «آخرِ ماه» = آخرین روزِ ماهِ شمسی */
    r = await one(0, ['پیش‌بینیم: پنجاه‌پنجاه فردا بارون میاد']); X('C37 «پنجاه‌پنجاه» ⇒ اطمینانِ ۵۰٪', r.preds.length === 1 && r.preds[0].p === 50, r);
    r = await one(0, ['پیش‌بینیم: احتمالاً فردا بارون میاد', '۷۰ درصد']);
    X('C37 «احتمالاً» ⇒ بی عدد؛ صفحه یک بار عددش را می‌پرسد و «۷۰ درصد» ِ بعدی کنارِ همان می‌نشیند (پیش‌بینیِ دوم نمی‌شود)', r.l0.filter(x => /چند درصد/.test(x)).length === 1 && r.preds.length === 1 && r.preds[0].p === 70 && !r.l1.some(x => /چند درصد/.test(x)), r);
    r = await one(0, ['پیش‌بینیم: ۸۰ درصد فردا بارون میاد']); X('C37 همانندِ منفی: عددِ گفته‌شده ⇒ پرسشِ عدد نیست', r.preds.length === 1 && r.preds[0].p === 80 && !r.l0.some(x => /چند درصد/.test(x)), r);
    r = await one(0, ['تا آخرِ ماه پایان‌نامه رو تحویل می‌دم']); { const me = await E(() => { const t = APP.today(); let last = t; for (let k = 0; k < 40; k++) { const d = APP.addDays(t, k); if (k && /^۱ /.test(APP.fdate(d))) return last; last = d; } return ''; });
      X('C37 «آخرِ ماه» ⇒ آخرین روزِ ماهِ شمسی، از راهِ «… درست است؟»', r.pend0.length === 1 && r.pend0[0].date === me && /درست است؟/.test(r.l0[0]) && r.dl0.length === 0, { r, me }); }
  });

  await b.close();
  const R = Object.values(info.runners), B = Object.values(info.bank);
  console.log(JSON.stringify({ runners: R.length, runnersOk: R.filter(Boolean).length, bank: B.length, bankOk: B.filter(Boolean).length, redRunners: Object.keys(info.runners).filter(k => !info.runners[k]).length, redBank: Object.keys(info.bank).filter(k => !info.bank[k]) }));
  if (process.env.NAMES) console.log('GREEN:\n' + Object.keys(info.runners).filter(k => info.runners[k]).join('\n'));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS — test_tour1_r26_today');
})();
