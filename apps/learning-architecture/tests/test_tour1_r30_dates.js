// تورِ پولیا (دستهٔ ۱، دورِ ۳۰ — سهمِ «dates»، DECISIONS_R30 F6؛ C181، C182، C187 و دمِ dates) — قرمزِ اول از **جمله‌های خودِ دونده‌ها**.
//  C134: هر مورد روی هفت روزِ هفته اجرا می‌شود (ساعتِ صفحه یخ‌زده: دوشنبه ۲۵ آبان ۱۴۰۵ + k) و هر روزِ انتظار از تقویمِ خودِ صفحه ساخته می‌شود؛ نامِ روزهای هفته
//  در جمله‌ها نسبت به همان روز است (هیچ تاریخِ تقویمیِ ثابت در انتظارها نیست). ابزارهای صفحه (HELPERS) همان ابزارهای test_tour1_r29_dates_bank.js اند.
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
    await p.clock.install({ time: new Date(ms) }); await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(150); await p.evaluate(HELPERS);
    await p.evaluate(() => { window.__retr = (msg, key, fix, old) => ({ msg, key, what: 'plan', fix, old }); }); };
  const E = (fn, arg) => p.evaluate(fn, arg);
  const fresh = async (n) => { await open(T0 + (K + (n || 0)) * 864e5); };
  const day = async (n) => { await p.clock.setSystemTime(new Date(T0 + (K + n) * 864e5)); };
  const WDS = (process.env.WD ? process.env.WD.split(',').map(Number) : [0, 1, 2, 3, 4, 5, 6]);
  const X = (name, ok, x) => { res[name] = (res[name] === undefined ? true : res[name]) && !!ok; if (!ok) errors.push(name + ' (k=' + K + ') :: ' + JSON.stringify(x).slice(0, 1400)); };
  const run = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').some(o => name.indexOf(o) === 0)) return; for (const k of WDS) { K = k; for (let t = 0; t < 2; t++) { try { await fn(); break; } catch (e) { const m = String(e && e.message || e).split('\n')[0]; if (t === 0 && /crashed|ERR_|closed/i.test(m)) { try { await b.close(); } catch (e2) { } b = await chromium.launch({ args: ['--disable-dev-shm-usage'] }); ctx = null; continue; } errors.push(name + ' k=' + k + ' exception: ' + m); res[name] = false; break; } } } };

  /* ---------- C181 — روزِ نفی‌شده ---------- */
  /* D30-4 (s35 s20–s22، پسرفت): «⟨X⟩ با مسئولای کوچه‌ها جلسه می‌ذارم …» ⇒ پرسشِ X؛ «نه، X نه — Y؛ X مسجد مراسم داره.» (مدل: همان برنامه + اصلاحِ X⇐Y) ⇒ X ثبت نمی‌شود؛ Y یک بار پرسیده */
  await run('D30-4 s35', async () => { await fresh(0);
    const r = await E(async () => { const o = { x: __D(3), y: __D(4) }; const X0 = __wn(o.x), Y0 = __wn(o.y), t = X0 + ' با مسئولای کوچه‌ها جلسه می‌ذارم تا هر کدوم کیسه‌های جدا رو تحویل بگیرن.';
      await __say(t, 'خب.', __plan(t.replace(/\.$/, ''))); const id = (__cur().plans || [])[0].id; o.p0 = __pend();
      const n0 = __sys().length;
      await __say('نه، ' + X0 + ' نه — ' + Y0 + '؛ ' + X0 + ' مسجد مراسم داره.', 'اصلاحتان را به صفحه می‌دهم.', [__cs({ said: ['plan'], plan: { text: X0 + ' نه — ' + Y0, when: o.y, same: id }, retract: __retr(X0 + ' با مسئولای کوچه‌ها جلسه می‌ذارم', 'plan:' + id, Y0, X0) })]);
      o.l = __sys().slice(n0); o.pl = __pl(); o.pend = __pend(); o.dl = __dlAll(); return o; });
    X('D30-4 C181: روزِ نفی‌شده (X) نه ثبت شد نه در هیچ رکوردی ماند', !r.l.some(x => /ثبت شد/.test(x)) && !r.pl.some(q => q.when === r.x) && !r.dl.some(x => x.date === r.x) && !r.pend.some(x => x.date === r.x), r);
    X('D30-4 C181/C49: روزِ جایگزین (Y) یک بار پرسیده شد', r.pend.filter(x => x.date === r.y).length === 1 && r.l.filter(x => /^📅/.test(x)).length === 1, r); });
  /* منفیِ C181 (A28-1 s01 p23، C92): «برای ودیعه هم باید برم بانک؛ X نه، Y می‌رم» کارِ دیگری را (زنگِ بنگاه) جابه‌جا نمی‌کند */
  await run('C181 neg other act', async () => { await fresh(0);
    const r = await E(async () => { const o = { x: __D(1), y: __D(3) }; await __say('فردا به بنگاه زنگ می‌زنم که متنِ قرارداد رو آماده کنه.', 'خب.', __plan('فردا به بنگاه زنگ می‌زنم که متنِ قرارداد رو آماده کنه'));
      const n0 = __sys().length; await __say('برای ودیعه هم باید برم بانک؛ ' + __wn(o.x) + ' نه، ' + __wn(o.y) + ' می‌رم.'); o.l = __sys().slice(n0); o.pend = __pend(); o.pl = __pl(); return o; });
    X('C181 منفی: پرسشِ بنگاه سرِ جایش (X)؛ بانک روی Y پرسیده؛ هیچ ردیفِ بانک روی X', r.pend.some(x => /بنگاه/.test(x.what) && x.date === r.x) && !r.pend.some(x => !/بنگاه/.test(x.what) && x.date === r.x) && r.pend.some(x => !/بنگاه/.test(x.what) && x.date === r.y), r); });
  /* F6-008 (s01 p24، ریشهٔ A30-3): «نه، زنگِ بنگاه همون X‌ست؛ فقط بانک Y‌ست.» ⇒ هر کار روزِ خودش؛ ردیفِ بانک هرگز به X نمی‌رود */
  await run('F6-008 s01', async () => { await fresh(0);
    const r = await E(async () => { const o = { x: __D(1), y: __D(3) }; const X0 = __wn(o.x), Y0 = __wn(o.y);
      await __say('فردا به بنگاه زنگ می‌زنم که متنِ قرارداد رو آماده کنه.', 'خب.', __plan('فردا به بنگاه زنگ می‌زنم که متنِ قرارداد رو آماده کنه'));
      await __say('برای ودیعه هم باید برم بانک؛ ' + X0 + ' نه، ' + Y0 + ' می‌رم.', 'خب.', __plan(X0 + ' نه، ' + Y0 + ' می‌رم'));
      const n0 = __sys().length; await __say('نه، زنگِ بنگاه همون ' + X0 + '‌ست؛ فقط بانک ' + Y0 + '‌ست.'); o.l = __sys().slice(n0); o.pl = __pl(); o.pend = __pend(); o.dl = __dlAll(); return o; });
    X('F6-008 C181/C92: بانک هرگز روی X (نه ثبت، نه پرسش)', !r.l.some(x => / نه، [^»]*می‌رم» — [^ ]+ [^ ]+ [^ ]+ [^ ]+ \(به‌جای/.test(x)) && !r.pl.some(q => / نه، /.test(q.text) && q.when === r.x) && !r.pend.some(x => / نه، /.test(x.what) && x.date === r.x), r);
    X('F6-008 C49: بازگفتنِ روزِ هر کار ⇒ بنگاه X و بانک Y ثبت', r.pl.some(q => /بنگاه/.test(q.text) && q.when === r.x) && (r.pl.some(q => / نه، /.test(q.text) && q.when === r.y) || r.dl.some(x => /بانک|می‌رم/.test(x.what) && x.date === r.y && !x.done)) && !r.dl.some(x => x.date === r.x && !/بنگاه/.test(x.what)), r); });
  /* A30-3 (s01 p42–p43، C181): ردیفِ کهنه‌ای که روزش (D+1) را خودش نفی کرد + پرسشِ تازهٔ دوکاره (D+1، D+2) ⇒ «آره، فردا و پس‌فردا» روزِ نفی‌شده را برای آن ردیف تأیید نمی‌کند
     (پرسش‌های هنوز بازِ دیگر مثلِ دورِ ۲۹ جواب می‌گیرند — F6-058، بانکِ R29 #143) */
  await run('A30-3 s01', async () => { await fresh(0);
    const r = await E(async () => { const o = { d1: __D(1), d2: __D(2) };
      await __say('فردا به داروخونه هم زنگ می‌زنم.', 'خب.', __plan('فردا به داروخونه هم زنگ می‌زنم'));
      await __say('نه، فردا نه. الان درباره‌ی قرارداد بگو.');
      await __say('فردا میرم بانک و پس‌فردا هم میرم دفترخونه برای امضا. امروز خسته‌ام، همین‌ها بسه.'); o.p1 = __pend();
      const n0 = __sys().length; await __say('آره، فردا و پس‌فردا.'); o.l = __sys().slice(n0); o.pl = __pl(); o.dl = __dlAll(); o.pend = __pend(); return o; });
    X('A30-3 C181: ردیفِ داروخانه با روزِ نفی‌شده با «آره، فردا و پس‌فردا» ثبت نشد', !r.pl.some(q => /داروخونه/.test(q.text) && q.when === r.d1) && !r.dl.some(x => /داروخونه/.test(x.what) && x.date === r.d1), r);
    X('A30-3 C145: بانک D+1 و دفترخانه D+2 ثبت', r.dl.some(x => /بانک/.test(x.what) && x.date === r.d1) || r.pl.some(q => /بانک/.test(q.text) && q.when === r.d1), r); });
  /* منفیِ A30-3 (B29·D18 dB2 c8): دو کار در **یک** پرسشِ باز ⇒ «آره، فردا و پس‌فردا» هر دو را ثبت می‌کند */
  await run('A30-3 neg one ask', async () => { await fresh(0);
    const r = await E(async () => { const o = { d1: __D(1), d2: __D(2) }; await __say('فردا هم به بانک زنگ می‌زنم برای پولِ ثبت‌نام، پس‌فردا هم به صاحب‌خونه زنگ می‌زنم برای تمدید.');
      await __say('آره، فردا و پس‌فردا.'); o.wb = __when(/بانک/); o.wl = __when(/صاحب/); return o; });
    X('A30-3 منفی: پرسشِ همان نوبت ⇒ هر دو ثبت', r.wb === r.d1 && r.wl === r.d2, r); });
  /* F6-003 (s01 p18، منفیِ هم‌شکلِ C181): «راستی امضا رو ⟨X⟩ِ بعد بذار، این ⟨X⟩ صاحبخونه نیست» ⇒ ⟨X⟩ِ هفتهٔ بعد (به‌جای) — بندِ «… بذار» درخواستِ اوست، نه وصفِ روز */
  await run('F6-003 s01', async () => { await fresh(0);
    const r = await E(async () => { const o = { x: __D(2), x2: __D(9) }; const X0 = __wn(o.x); await __say('تا ' + X0 + ' امضاش می‌کنم.', 'خب.', __plan('تا ' + X0 + ' امضاش می‌کنم')); await __say('باشه، ' + X0 + ' پیگیری کن.');
      o.w0 = __when(/امضا/); const n0 = __sys().length; await __say('راستی امضا رو ' + X0 + (/ه$/.test(X0) ? 'ٔ' : 'ِ') + ' بعد بذار، این ' + X0 + ' صاحبخونه نیست.'); o.l = __sys().slice(n0); o.pend = __pend(); return o; });
    X('F6-003 C51/C181: ⟨X⟩ِ بعد (به‌جای ⟨X⟩) — یک پرسش', r.w0 === r.x && r.pend.some(x => x.date === r.x2) && r.l.some(x => /به‌جای/.test(x)), r); });

  /* ---------- C182 — کارِ گذشته ---------- */
  /* A30-6 (s01 p42–p44؛ نگاتیوِ نام‌بردهٔ C182): ⏰ «فردا میرم بانک» باز + «… راستی ⟨D−22⟩ رفتم بانک و حسابِ ودیعه رو باز کردم.» ⇒ ⏰ باز می‌ماند؛ یک سطرِ «📜 کارِ گذشته — ⟨روز⟩»؛ هیچ پرسش */
  await run('A30-6 s01', async () => { await fresh(0);
    const r = await E(async () => { const o = { d1: __D(1), dp: __D(-22) }; await __say('فردا میرم بانک و پس‌فردا هم میرم دفترخونه برای امضا.'); await __say('آره، فردا و پس‌فردا.');
      const n0 = __sys().length; await __say('شناسنامه و کارت ملی. راستی ' + __dm(o.dp) + ' رفتم بانک و حسابِ ودیعه رو باز کردم.'); o.l = __sys().slice(n0); o.dl = __dlAll(); o.pl = __pl(); o.pend = __pend();
      o.ev = (APP.EVLOG.of({ sess: __cur().id }) || []).filter(e => e.k === 'pastact').map(e => e.title + ' | ' + e.lines.join(' ')); o.fd = APP.fdate(o.dp); return o; });
    X('A30-6 C182: یادآور/برنامهٔ آیندهٔ بانک باز ماند', (r.dl.some(x => /بانک/.test(x.what) && !x.done && x.date === r.d1) || r.pl.some(q => /بانک/.test(q.text) && q.state === 'open')) && !r.dl.some(x => /بانک/.test(x.what) && x.done) && !r.pl.some(q => /بانک/.test(q.text) && q.state === 'done'), r);
    X('A30-6 C182/C166: یک سطرِ «📜 کارِ گذشته — ⟨روز⟩» (صفحه و پرونده)؛ هیچ پرسش', r.l.filter(x => /^📜 کارِ گذشته — /.test(x) && x.indexOf(r.fd) >= 0).length === 1 && r.ev.length === 1 && r.ev[0].indexOf(r.fd) >= 0 && !r.l.some(x => /^📅/.test(x)), r); });
  /* B30·D21 (dB3 p20) و D30-16 (tD4 s18): کارِ گذشته بی برنامهٔ باز ⇒ همان یک سطر؛ هیچ رکوردِ برنامه/موعد، هیچ پرسش */
  for (const [nm, sent] of [['B30·D21 dB3', 'سلام. ⟨P⟩ رفتم بانک و قسطِ وام رو دادم.'], ['D30-16 tD4', '⟨P⟩ رفتم اداره‌ی پست و بسته رو فرستادم.']]) {
    await run(nm, async () => { await fresh(0);
      const r = await E(async (sent) => { const o = { dp: __D(-6) }; const n0 = __sys().length; await __say(sent.replace('⟨P⟩', __dm(o.dp))); o.l = __sys().slice(n0); o.dl = __dlAll(); o.pl = __pl(); o.pend = __pend();
        o.ev = (APP.EVLOG.of({ sess: __cur().id }) || []).filter(e => e.k === 'pastact').length; o.fd = APP.fdate(o.dp); return o; }, sent);
      X(nm + ' C182/C166: یک سطرِ «📜 کارِ گذشته»؛ بی برنامه/موعد/پرسش', r.l.filter(x => /^📜 کارِ گذشته — /.test(x) && x.indexOf(r.fd) >= 0).length === 1 && r.ev === 1 && !r.dl.length && !r.pl.length && !r.pend.length, r); }); }
  /* منفیِ C182 (C136): (۱) برنامه‌ای که روزش پیش از روزِ کار است با همان گزارش «انجام شد» می‌گیرد (C146)؛ (۲) «رفتم بانک» ِ بی روز برنامهٔ بازِ فردا را می‌بندد (C94)؛ (۳) «فردا میرم بانک» کارِ گذشته نیست */
  await run('C182 neg', async () => { await fresh(-6);
    await E(async () => { await __say(__dm(__D(2)) + ' می‌رم بانک که حسابِ پس‌انداز رو جدا کنم'); await __say('آره'); }); await day(0);
    const r = await E(async () => { const o = { dp: __D(-3) }; let n0 = __sys().length; await __say(__dm(o.dp) + ' رفتم بانک و حساب رو جدا کردم.'); o.l = __sys().slice(n0); o.dl = __dlAll(); return o; });
    X('C182 منفیِ ۱ (C146): برنامهٔ پیش از آن روز ⇒ «انجام شد» در همان روز', r.dl.some(x => /بانک/.test(x.what) && x.done && x.day === r.dp), r);
    await fresh(0); const r2 = await E(async () => { await __say('فردا میرم بانک.'); await __say('آره'); return { dl0: __dlAll() }; }); await day(1);
    const r3 = await E(async () => { const n0 = __sys().length; await __say('رفتم بانک.'); return { l: __sys().slice(n0), dl: __dlAll(), pl: __pl() }; });
    X('C182 منفیِ ۲ (C94): «رفتم بانک.» ِ بی روز کارِ فردا را بست؛ بی سطرِ کارِ گذشته', (r3.dl.some(x => /بانک/.test(x.what) && x.done) || r3.pl.some(q => /بانک/.test(q.text) && q.state === 'done')) && !r3.l.some(x => /کارِ گذشته/.test(x)), { r2, r3 });
    const r4 = await E(async () => { const n0 = __sys().length; await __say('فردا میرم بانک و قسطِ وام رو میدم.'); return { l: __sys().slice(n0) }; });
    X('C182 منفیِ ۳: کارِ آینده سطرِ «کارِ گذشته» نمی‌گیرد', !r4.l.some(x => /کارِ گذشته/.test(x)), r4); });

  /* ---------- N6 #1 — روزِ هفته و تاریخِ ناهم‌خوان ⇒ یک «کدام یکی؟» (A30-4، B30·D20، C30-10، D30-13) ---------- */
  await run('N6-1 dis', async () => { await fresh(0);
    const r = await E(async () => { const o = {}; o.t = APP.PR.whenInfo(__wn(__D(1)) + '‌ی هفته‌ی بعد').date; o.d = APP.addDays(o.t, 2);
      await __say('سلام. امروز کارای هفته رو می‌چینم.'); const n0 = __sys().length; await __say(__wn(o.t) + '‌ی هفته‌ی بعد، ' + __dm(o.d) + '، می‌رم دکترِ چشم.'); o.l = __sys().slice(n0); o.pend = __pend(); o.fd = [APP.fdate(o.t), APP.fdate(o.d)];
      const n1 = __sys().length; await __say(__wn(o.t) + ' درسته، ' + __dm(o.t) + '.'); o.l2 = __sys().slice(n1); o.pend2 = __pend(); o.w = __when(/دکترِ چشم/); return o; });
    X('N6-1: یک پرسش با هر دو روز و «کدام یکی؟» — نه دو «درست است؟»', r.pend.length === 1 && r.l.filter(x => /^📅/.test(x)).length === 1 && r.l.some(x => /کدام یکی؟/.test(x) && x.indexOf(r.fd[0]) >= 0 && x.indexOf(r.fd[1]) >= 0), r);
    X('N6-1: پاسخِ «⟨روز⟩ درسته، ⟨تاریخ⟩» ⇒ همان ثبت؛ خوانشِ دیگر نمی‌ماند', r.w === r.t && !r.pend2.length, r); });
  /* منفی (دورِ ۲۹ B29·D20): روز و تاریخِ هم‌خوان ⇒ همان یک «درست است؟» */
  await run('N6-1 neg agree', async () => { await fresh(0);
    const r = await E(async () => { const o = {}; o.t = __D(9); await __say('سلام. امروز کارای هفته رو می‌چینم.'); const n0 = __sys().length; const nw = APP.PR.whenInfo(__wn(o.t) + '‌ی هفته‌ی بعد'); o.agree = !!(nw && nw.date === o.t);
      await __say(__wn(o.t) + '‌ی هفته‌ی بعد، ' + __dm(o.t) + '، می‌رم دکترِ چشم.'); o.l = __sys().slice(n0); o.pend = __pend(); return o; });
    X('N6-1 منفی: هم‌خوان ⇒ یک ردیف بی «کدام یکی؟»', !r.agree || (r.pend.length === 1 && !r.pend[0].amb && r.pend[0].date === r.t && !r.l.some(x => /کدام یکی؟/.test(x))), r); });
  /* ---------- «فردا بانک.» تنها (B30·D19، C30-14؛ C12) ---------- */
  await run('B30·D19 bare', async () => { await fresh(0);
    const r = await E(async () => { const o = { d1: __D(1) }; const n0 = __sys().length; await __say('شنبه‌ست. جدولِ محوری رو یاد گرفتم ولی نمودارها نه. فردا بانک.'); o.l = __sys().slice(n0); o.pend = __pend(); return o; });
    X('B30·D19 C12: «فردا بانک.» ⇒ یک پرسشِ D+1', r.pend.filter(x => /بانک/.test(x.what) && x.date === r.d1).length === 1, r); });
  await run('bare neg', async () => { await fresh(0);
    const r = await E(async () => { const o = {}; await __say('فردا صبح.'); await __say('فردا ساعت ۱۰.'); await __say('فردا تعطیله.'); await __say('پنجشنبه‌ست.'); o.pend = __pend();
      await __say('فردا شد. یه ایده دارم.'); o.pend0 = __pend(); await __say('فردا میرم بانک.'); await __say('آره'); const n0 = __sys().length; await __say('فردا بانک.'); o.l = __sys().slice(n0); o.pend2 = __pend(); return o; });
    X('C12 منفی: «فردا صبح/ساعت ۱۰/تعطیله»، «پنجشنبه‌ست» کار نیستند؛ «فردا بانک.» پس از ثبتِ همان کار پرسشِ دوم نمی‌سازد (F6-032)', !r.pend.length && !r.pend0.length && !r.pend2.length && !r.l.some(x => /^📅/.test(x)), r); });
  /* ---------- D26-1 (aD2 p2، C19): «امم… رباتیک فقط ⟨روز⟩‌ست» برنامهٔ هفتگیِ چیزی است، نه کارِ او ---------- */
  await run('D26-1 aD2', async () => { await fresh(0);
    const r = await E(async () => { const o = {}; const n0 = __sys().length; await __say('امم… رباتیک فقط ' + __wn(__D(2)) + '‌ست.'); o.l = __sys().slice(n0); o.pend = __pend();
      o.m = __D(20); await __say('اندازه‌گیریِ بعدی ' + __dm(o.m) + 'ه.'); o.pend2 = __pend(); return o; });
    X('D26-1 C19: هیچ پرسشِ روز', !r.l.some(x => /^📅/.test(x)) && !r.pend.length, r);
    X('D26-1 منفی (A29-17): روزِ تقویمیِ «اندازه‌گیریِ بعدی ⟨تاریخ⟩ه» هنوز پرسیده می‌شود', r.pend2.some(x => x.date === r.m), r); });
  /* ---------- A26-30 (aA4، C19): عادتِ گذشته («… درمی‌آوردم») برنامه نمی‌شود ---------- */
  await run('A26-30 aA4', async () => { await fresh(0);
    const r = await E(async () => { await __say('بله، ملافه و رومیزی زیاد دوخته‌ام؛ آن‌جا هم اول طولِ هر تکه را درمی‌آوردم و بعد تعدادِ قواره را. همین‌جا هم همان کار را می‌کنم.', 'خب.', __plan('اول طولِ هر تکه را درمی‌آوردم و بعد تعدادِ قواره را'));
      const a = { pl: __pl(), rows: __rows() }; await __say('اول طولِ هر تکه رو درمیارم و بعد تعدادِ قواره رو.', 'خب.', __plan('اول طولِ هر تکه رو درمیارم و بعد تعدادِ قواره رو')); a.pl2 = __pl(); return a; });
    X('A26-30 C19: «… درمی‌آوردم» ⇒ هیچ «📌 برنامهٔ خودت»', !r.pl.length && !r.rows.some(x => /درمی‌آوردم/.test(x)), r);
    X('A26-30 منفی: همان کار با فعلِ حال برنامه است', r.pl2.length === 1, r); });
  /* ---------- D30-15 (tD4 ۵ آذر): 📌 ِ ثبت‌شده پس از روزش در «امروز» با «انجام شد؟» می‌ماند، حتی وقتی «انجام شد؟» ِ گفت‌وگو بی‌پاسخ ماند ---------- */
  await run('D30-15 tD4', async () => { await fresh(0);
    await E(async () => { await __say('فردا بانک.', 'خب.', __plan('فردا بانک')); await __say('آره'); }); await day(4);
    const r = await E(async () => { await __say('سلام. امروز چهارشنبه‌ست.'); await __say('یه سؤال: «زنگ زدم» کدوم تماس رو بست؟'); await __say('باشه.'); return { rows: __rows(), pl: __pl() }; });
    X('D30-15: 📌 «فردا بانک» با «موعد … — انجام شد؟» در «امروز»', r.rows.some(x => /فردا بانک/.test(x) && /انجام شد؟/.test(x)), r);
    const r2 = await E(async () => { const pid = (__cur().plans || [])[0].id; const ok = APP.ASSIST.planTap(pid, 'done'); return { ok, rows: __rows(), pl: __pl() }; });
    X('D30-15: دکمهٔ «انجام دادم» همان را می‌بندد', r2.ok && r2.pl[0].state === 'done' && !r2.rows.some(x => /فردا بانک/.test(x)), r2); });

  /* ---------- دو کار با یک اصطلاح (A30-5، B30·D25، D30-12؛ C92/C144) ---------- */
  await run('idiom two acts', async () => { await fresh(0);
    const r = await E(async () => { const o = {}; await __say('قسطِ وام رو سرِ برج میدم و قبضِ آب رو هم سرِ برج.'); o.p1 = __pend();
      return o; });
    X('D30-12: «قسطِ وام … و قبضِ آب رو هم سرِ برج» ⇒ دو پرسش (هر کار یکی)', r.p1 && r.p1.filter(x => /قسط/.test(x.what)).length === 1 && r.p1.filter(x => /قبض/.test(x.what)).length === 1 && !r.p1.some(x => /قسط/.test(x.what) && /قبض/.test(x.what)), r);
    await fresh(0); const r2 = await E(async () => { await __say('سرِ برج باید اجاره رو بدم و قسطِ بیمه‌ی عمر رو هم بدم.'); return { p: __pend() }; });
    X('B30·D25: «… اجاره رو بدم و قسطِ بیمه‌ی عمر رو هم بدم» ⇒ دو پرسش با همان روز', r2.p.filter(x => /اجاره/.test(x.what)).length === 1 && r2.p.filter(x => /بیمه/.test(x.what) && !/اجاره/.test(x.what)).length === 1, r2);
    await fresh(0); const r3 = await E(async () => { await __say('سرِ برج اجارهٔ این ماه رو واریز می‌کنم، قسطِ وام رو هم سرِ برج می‌دم.'); return { p: __pend() }; });
    X('A30-5: دو بند با «سرِ برج» ⇒ دو پرسش', r3.p.filter(x => /اجاره/.test(x.what)).length === 1 && r3.p.filter(x => /قسط/.test(x.what)).length === 1, r3);
    await fresh(0); const r4 = await E(async () => { await __say('اجاره و قبض رو سرِ برج می‌دم.'); return { p: __pend() }; });
    X('منفی: یک فعل برای دو چیز (بی «رو هم ⟨فعل⟩») ⇒ یک پرسش', r4.p.length === 1, r4); });
  /* ---------- A25-21 (s09 p16، C88): «درست» ِ اصلاح با «تا … ه» در متن تکرار نمی‌شود ---------- */
  await run('A25-21 s09', async () => { await fresh(0);
    const r = await E(async () => { const o = { a: __D(19), b: __D(24) }; const t = 'سلام. یه کارِ تازه: باید تا ' + __dm(o.a) + ' قیمتِ ماهِ بعد رو به سه تا کافه‌ای که ازم کیک می‌گیرن اعلام کنم. یادم بنداز.';
      await __say(t); const key = 'deadline:x'; const n0 = __sys().length;
      await __say('یه اصلاح: اولش گفتم «تا ' + __dm(o.a) + '» باید قیمت رو اعلام کنم — اشتباه گفتم، تا ' + __dm(o.b) + 'ه.', 'فرستادم.', [__cs({ ph: 'u', retract: { msg: 'باید تا ' + __dm(o.a) + ' قیمتِ ماهِ بعد رو به سه تا کافه‌ای که ازم کیک می‌گیرن اعلام کنم', key: 'deadline:d1', what: 'fact', fix: 'تا ' + __dm(o.b) + 'ه', old: __dm(o.a) } })]);
      o.l = __sys().slice(n0); o.pend = __pend(); o.pl = __pl(); return o; });
    X('A25-21 C88: هیچ «تا تا» و هیچ «⟨تاریخ⟩ه» ِ چسبیده در متنِ او', !r.l.some(x => /تا تا/.test(x)) && !r.pend.some(x => /تا تا/.test(x.what)) && !r.pl.some(q => /تا تا/.test(q.text)), r);
    X('A25-21 C58: روزِ تازه یک بار پرسیده (به‌جای)', r.pend.filter(x => x.date === r.b).length === 1, r); });
  /* ---------- D29-24 (s32 s17): «ماهِ دیگه …» در دفترِ ادعا روزِ ساختگی نمی‌گیرد ---------- */
  await run('D29-24 recheck', async () => { await fresh(0);
    const r = await E(async () => { const t = 'یه جا می‌خوام این ادعا رو نگه دارم که «اثرِ خالصِ تبلیغ حدودِ ۵ واحد درصده» و ماهِ دیگه که دادهٔ آذر اومد دوباره بسنجمش.';
      await __say(t, 'نگه داشتم.', [{ do: 'list_add', list: 'claims', text: 'اثرِ خالصِ تبلیغ حدودِ ۵ واحد درصده', quote: 'اثرِ خالصِ تبلیغ حدودِ ۵ واحد درصده', recheck: 'ماهِ دیگه که دادهٔ آذر اومد', consent: { quote: 'یه جا می‌خوام این ادعا رو نگه دارم', kind: 'request' } }]);
      const c = APP.PR.list('claims'); const it = c && (c.items || []).filter(y => /اثرِ خالصِ تبلیغ/.test(JSON.stringify(y)))[0];
      const t2 = 'اینم نگه دار: «فروشِ آذر ۱۰٪ بیشتره» و ' + __dm(__D(12)) + ' دوباره بسنجمش.';
      await __say(t2, 'نگه داشتم.', [{ do: 'list_add', list: 'claims', text: 'فروشِ آذر ۱۰٪ بیشتره', quote: 'فروشِ آذر ۱۰٪ بیشتره', recheck: __dm(__D(12)), consent: { quote: 'اینم نگه دار', kind: 'request' } }]);
      const it2 = c && (APP.PR.list('claims').items || []).filter(y => /فروشِ آذر/.test(JSON.stringify(y)))[0];
      return { it: it || null, it2: it2 || null, d12: __D(12) }; });
    X('D29-24: «ماهِ دیگه …» ⇒ هیچ «بررسیِ دوباره» ِ ساختگی', r.it && !r.it.recheck, r);
    X('D29-24 منفی: روزِ خودش ⇒ همان روز', r.it2 && r.it2.recheck === r.d12, r); });
  /* ---------- پرونده‌های تمرین (D26-42، D26-47، D27-29/C187) ---------- */
  await run('practice', async () => { await fresh(0);
    const r = await E(async () => { const o = {}; await __say('یه پرونده‌ی تمرین براش باز کن', 'باشه.', [{ do: 'start_practice', tid: 41, topic: 'فرمول‌های مثلثات', consent: { quote: 'یه پرونده‌ی تمرین براش باز کن', kind: 'request' } }]);
      const c = APP.PR.cases({ tid: 41 })[0]; o.id = c && c.id; APP.go('home'); localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession();
      let U = ''; const raw = APP.callAI; APP.callAI = async (sys, user, opts) => { U = String(user || ''); return raw(sys, user, opts); };
      await __say('امروز برگه‌ی سفید فرمول‌ها رو نوشتم، ۷۰ درصدش یادم بود. از این به بعد هر دو هفته یه بار این کار رو می‌کنم.', 'دیدم.', [{ do: 'practice_log', what: 'برگهٔ سفید', pct: 70, quote: 'امروز برگه‌ی سفید فرمول‌ها رو نوشتم، ۷۰ درصدش یادم بود' }]);
      APP.callAI = raw; o.prompt = U; o.sys = __sys(); const c2 = APP.S.get(o.id); o.n = (c2.sessions || []).filter(x => !x.draft).length; o.rh = c2.urhythm || null; o.lad = APP.PR.ladder30(c2); return o; });
    X('D26-47: در سشنِ تازه پروندهٔ باز با شناسه در پرامپت است و گزارشِ جلسه ثبت شد', r.prompt.indexOf(r.id) >= 0 && r.n === 1 && !r.sys.some(x => /پیدا نشد/.test(x)), { n: r.n, sys: r.sys, has: r.prompt.indexOf(r.id) });
    X('D26-42: «هر دو هفته یه بار» ِ خودش با همان گزارش آهنگِ پرونده شد (۱۴ روز)', r.rh && r.rh.every === 14, r.rh);
    X('D27-29 C187: سطرِ پرونده در پرامپت نردبانِ زمان‌بندی را دارد', /نردبانِ زمان‌بندی/.test(r.prompt) && /نردبانِ زمان‌بندی/.test(r.lad), r.lad); });

  /* ---------- F6-080 (tD2 p6، C19): کارِ کسِ دیگر با فعلِ سوم‌شخص («ودیعه رو صاحبخونه آخرِ سال پس میده») پرسشِ روزِ او نیست ---------- */
  await run('F6-080 tD2', async () => { await fresh(0);
    const r = await E(async () => { await __say('سلام، کارای اسباب‌کشی رو می‌چینم.'); const n0 = __sys().length; await __say('قسطِ آخرِ اجاره رو سرِ برج می‌دم، ودیعه رو صاحبخونه آخرِ سال پس میده، و رنگ‌کاریِ خونهٔ تازه بعد از عید.'); return { l: __sys().slice(n0), pend: __pend() }; });
    X('F6-080 C19: هیچ پرسشِ روز برای ودیعه؛ قسطِ اجاره پرسیده', !r.pend.some(x => /ودیعه/.test(x.what)) && r.pend.some(x => /قسط/.test(x.what)), r);
    const r2 = await E(async () => { const n0 = __sys().length; await __say('امتحانم ' + __dm(__D(9)) + ' برگزار میشه.'); return { pend: __pend(), d: __D(9) }; });
    X('F6-080 منفی: واژهٔ تعهد («امتحانم … برگزار میشه») هنوز پرسیده می‌شود', r2.pend.some(x => x.date === r2.d), r2); });

  /* N6-1 با برنامهٔ گزارش‌شدهٔ مدل (A30-4 s01 p49): برنامه هم «کدام یکی؟» می‌شود */
  await run('N6-1 plan', async () => { await fresh(0);
    const r = await E(async () => { const o = {}; o.t = APP.PR.whenInfo(__wn(__D(1)) + '‌ی هفته‌ی بعد').date; o.d = APP.addDays(o.t, 3); await __say('سلام. امروز کارای هفته رو می‌چینم.');
      const t = __wn(o.t) + '‌ی هفته‌ی بعد، ' + __dm(o.d) + '، جلسهٔ ساختمون می‌رم.'; const n0 = __sys().length; await __say(t, 'خب.', __plan(t.replace(/\.$/, ''))); o.l = __sys().slice(n0); o.pend = __pend();
      await __say(__wn(o.t) + ' درسته، ' + __dm(o.t) + '.'); o.pend2 = __pend(); o.w = __when(/جلسهٔ ساختمون/); return o; });
    X('N6-1 plan: یک پرسشِ «کدام یکی؟» با هر دو؛ پاسخ ⇒ همان روز، بی ردیفِ مانده', r.pend.length === 1 && r.l.some(x => /کدام یکی؟/.test(x)) && r.w === r.t && !r.pend2.length, r); });

  /* F6-037 (dB3 p1): «… اینم بگم: فردا بانک.» و F6-102 (aC3 p66): «… قبضِ برق رو میدم و به مستأجرم زنگ می‌زنم …» ⇒ دو کار */
  await run('F6-037/102', async () => { await fresh(0);
    const r = await E(async () => { const o = { d1: __D(1) }; await __say('سلام. آزمونِ ارتقای شغلیم نزدیکه و اکسلش برام سخته. اینم بگم: فردا بانک.'); o.p = __pend();
      await __say('باشه.'); await __say('پس‌فردا قبضِ برق رو میدم و به مستأجرم زنگ می‌زنم اجاره رو بگیرم.'); o.p2 = __pend(); return o; });
    X('F6-037: «اینم بگم: فردا بانک.» ⇒ پرسشِ D+1', r.p.some(x => /فردا بانک/.test(x.what) && x.date === r.d1), r);
    X('F6-102: دو کار ⇒ دو پرسش', r.p2.filter(x => /قبضِ برق/.test(x.what) && !/مستأجر/.test(x.what)).length === 1 && r.p2.filter(x => /مستأجر/.test(x.what)).length === 1, r); });

  try { await b.close(); } catch (e) { }
  const ks = Object.keys(res); console.log(JSON.stringify({ cases: ks.length, ok: ks.filter(k => res[k]).length, red: ks.filter(k => !res[k]) }));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS — test_tour1_r30_dates');
})();
