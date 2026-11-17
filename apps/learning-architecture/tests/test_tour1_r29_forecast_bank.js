// تورِ پولیا (دستهٔ ۱، دورِ ۲۹، سهمِ «forecast»: R5 🎯؛ خانوادهٔ F4) — بانکِ مستقلِ tests/variants/VARIANTS_R29.json: هر ورودیِ R5.forecast (۱-مبنا: #177–#222).
// ورودی‌ای که این سهم برآورده نمی‌کند در info.nc با دلیل می‌آید (هرگز بی‌صدا رد نمی‌شود، هرگز ویرایش نمی‌شود).
// ساعتِ صفحه روی «دوشنبهٔ بعد از امروزِ خودِ اجرا، ساعتِ ۹» ثابت است تا روزهای هفته («پنجشنبه»، «جمعه») دوپهلو نباشند (C1)؛ هر تاریخِ انتظار از همین روز حساب می‌شود —
// هیچ تاریخِ تقویمیِ نوشته‌شده‌ای در انتظارها نیست. LLA_FILE = ساختِ دیگر؛ ONLY=<شماره‌ها با ویرگول>.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BF = process.env.LLA_VARIANTS || path.join(__dirname, 'variants', 'VARIANTS_R29.json');
const BANK = fs.existsSync(BF) ? JSON.parse(fs.readFileSync(BF, 'utf8')) : [];

/* D0 = دوشنبهٔ بعد (۹ صبح، به وقتِ محلی)؛ iso(d) = YYYY-MM-DD ِ محلی؛ wd(n) = نخستین روزِ هفتهٔ n (۰=یکشنبه) پس از D0 */
const D0 = (() => { const d = new Date(); d.setHours(9, 0, 0, 0); do { d.setDate(d.getDate() + 1); } while (d.getDay() !== 1); return d; })();
const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const wd = (n) => { const d = new Date(D0); do { d.setDate(d.getDate() + 1); } while (d.getDay() !== n); return iso(d); };
/* آخرین روزِ ماهِ جلالیِ D0 (C37 «تا آخرِ ماه») با تقویمِ پارسیِ خودِ Intl */
const jDay = (d) => +new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', { day: 'numeric' }).format(d);
const endJ = (() => { const d = new Date(D0); while (true) { const n = new Date(d); n.setDate(n.getDate() + 1); if (jDay(n) === 1) return iso(d); d.setDate(d.getDate() + 1); } })();

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0, nc: {} };
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
    window.__turn = async (text, reply, acts) => { __q.push({ reply: reply || 'خوب.', status: 'related', memory: 'm', actions: acts || [] }); await APP.ASSIST.send(text); __q.length = 0; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc', 'ex'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__live = (T, St) => { __wipe(); APP.go('home'); APP.ASSIST.newSession(); const pid = APP.liveCreate(T || 'مسئلهٔ زنده', St || 'یه کارِ واقعی دارم و می‌خوام ببینم چی میشه.', 'find', { by: 'user', sess: __cur().id }).p.id; APP.liveBindSession(pid, __cur(), { force: true }); return pid; };
    /* مسئلهٔ دومِ همین گفت‌وگو؛ کانون روی آخری می‌ماند */
    window.__live2 = (T, St) => { const pid = APP.liveCreate(T, St, 'find', { by: 'user', sess: __cur().id }).p.id; APP.liveBindSession(pid, __cur(), { force: true }); return pid; };
    /* 🎯 ِ بازِ پیشین (پیش از این پیام، از حرفِ خودش) — همان راهِ صفحه: PR.bookPred با اطمینانِ همان بند */
    window.__seed = (text, pc, ago) => { const s = __cur(), at = new Date(Date.now() - (ago || 3600e3)).toISOString(); (s.msgs = s.msgs || []).push({ role: 'user', at, text: text + (pc != null ? '، ' + pc + ' درصد مطمئنم.' : '') });
      const x = APP.PR.bookPred(s, text, at, '', 'page', { p: pc, raw: text }); APP.S.put(s); return x && x.text; };
    window.__st = () => { const s = __cur(), C = s.coach || {}; return { fc: APP.S.all('fcast').filter(x => !x.sample).map(x => ({ q: x.q, p: x.p, due: x.due || '', out: x.outcome || '', pHist: (x.pHist || []).map(h => h.p), prob: x.prob ? (x.prob.pid || x.prob.pk) : '' })),
      preds: (C.preds || []).map(x => ({ t: x.text, p: x.p, out: x.out ? x.out.res : '', duePend: x.duePend || '' })), ask: s.predAsk && s.predAsk.state === 'open' ? s.predAsk.kind : '', sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text),
      plans: (s.plans || []).map(q => ({ t: q.text, when: q.when || '' })), dl: APP.S.all('deadline').filter(r => !r.done).map(r => ({ w: r.what, d: r.date })) }; };
    /* «🎯 دفترِ پیش‌بینی» همان‌طور که او می‌بیند */
    window.__fview = async () => { try { APP.ASSIST.toggle(false); } catch (e) { } APP.go('fcast'); await new Promise(r => setTimeout(r, 300)); const m = document.querySelector('#main');
      return { open: [...m.querySelectorAll('.fc-openl li')].map(li => li.innerText.replace(/\s+/g, ' ')), done: [...m.querySelectorAll('.fc-donel li')].map(li => li.innerText.replace(/\s+/g, ' ')) }; };
    window.__today = () => { const L = (APP.dueList ? APP.dueList() : []) || []; return L.map(x => String(x.txt || '')); };
  });
  const turn = (t, reply, acts) => p.evaluate(([t, r, a]) => __turn(t, r, a), [t, reply || '', acts || null]);
  const st = () => p.evaluate(() => __st());
  const live = (T, St) => p.evaluate(([T, St]) => __live(T, St), [T || '', St || '']);
  const live2 = (T, St) => p.evaluate(([T, St]) => __live2(T, St), [T, St]);
  const seed = (t, pc) => p.evaluate(([t, pc]) => __seed(t, pc), [t, pc]);
  const J = (x) => JSON.stringify(x);
  const nz = (x) => String(x || '').replace(/[‌\s]+/g, ' ').trim();
  const fasys = (S, n0) => S.sys.slice(n0 || 0).filter(x => /🎯|📅/.test(x));
  const planAsk = (S, n0) => S.sys.slice(n0 || 0).some(x => /📅/.test(x) && /در «امروز» بیاید/.test(x));
  const fcAsk = (S, n0) => S.sys.slice(n0 || 0).filter(x => /موعدِ این پیش‌بینی/.test(x));
  const E = {};
  /* ---------- ساخت و C148 ---------- */
  E[177] = async () => { await live(); await turn('یه پیش‌بینی: اجاره‌ی سالِ بعد با ۱۸٪ افزایش میشه ۱۵ × ۱٫۱۸ = ۱۷٫۷ میلیون؛ ۷۵ درصد مطمئنم'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].p === 75 && /اجاره‌ی سالِ بعد/.test(S.fc[0].q) && /۱۷٫۷ میلیون/.test(S.fc[0].q) && !/پیش‌بینی/.test(S.fc[0].q) && !/۷۵/.test(S.fc[0].q), J([S.fc, fasys(S)])]; };
  E[178] = async () => { await live(); await seed('۵ تا قفسه تا جمعه سوار می‌کنم', 70); await turn('گفته بودم ۵ تا با ۷۰ درصد، شد ۴ تا'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].out === 'نشد' && !S.ask, J([S.fc, fasys(S)])]; };
  E[179] = async () => { await live(); await seed('نمره‌ی پایانی بالای ۱۸ میشه', 80); await turn('۱۹ گرفتم، همون‌طور که با ۸۰ درصد گفته بودم'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].out === 'شد' && !S.fc[0].pHist.length && !S.ask, J([S.fc, fasys(S)])]; };
  E[180] = async () => { await live(); await turn('یه پیش‌بینیِ تازه: «برای ۴۰ بهترین تعداد ۱۵ است» با ۶۵٪ اطمینان'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].p === 65 && nz(S.fc[0].q).replace(/[«»]/g, '') === nz('برای ۴۰ بهترین تعداد ۱۵ است'), J([S.fc, fasys(S)])]; };
  /* C152: روزِ هفته در پیش‌بینی ⇒ موعدِ 🎯 با یک تأییدِ خودِ پیش‌بینی؛ هرگز پرسشِ برنامه «در «امروز» بیاید» */
  E[181] = async () => { await live(); await turn('تمرین‌های فصلِ ۶ رو تا چهارشنبه تموم می‌کنم. ۸۰ درصد.'); const S = await st(); const A1 = fcAsk(S), fd = await p.evaluate((d) => APP.fdate(d), wd(3));
    return [S.fc.length === 1 && S.fc[0].p === 80 && A1.length === 1 && A1[0].indexOf(fd) >= 0 && !planAsk(S), J([S.fc, fasys(S)])]; };
  E[182] = async () => { await live(); await turn('احتمالش ۳۰ درصده که پنجشنبه کلاسِ جبرانی تشکیل بشه'); const S = await st(); const A1 = fcAsk(S), fd = await p.evaluate((d) => APP.fdate(d), wd(4));
    const V = await p.evaluate(() => __fview());
    return [S.fc.length === 1 && S.fc[0].p === 30 && A1.length === 1 && A1[0].indexOf(fd) >= 0 && !planAsk(S) && !V.open.some(t => /بی موعد/.test(t)), J([S.fc, fasys(S), V.open])]; };
  E[183] = async () => { await live(); await turn('احتمالش ۳۰ درصده که پنجشنبه کلاسِ جبرانی تشکیل بشه'); await turn('آره'); const S1 = await st(); const n1 = S1.sys.length; await turn('امروز یه کم درس خوندم.'); const S = await st();
    const V = await p.evaluate(() => __fview()), T = await p.evaluate(() => __today());
    return [S.fc.length === 1 && S.fc[0].due === wd(4) && V.open.some(t => /کلاسِ جبرانی/.test(t)) && !T.some(t => /📌|📅/.test(t) && /کلاسِ جبرانی/.test(t)) && !S.sys.slice(n1).some(x => /بی‌جواب ماند/.test(x)) && !S.plans.some(q => q.when), J([S.fc, fasys(S), V.open, T])]; };
  E[184] = async () => { await live(); await turn('۸۰ درصد مطمئنم کابینت تا آخرِ ماه نصب میشه'); const S0 = await st(); await turn('آره'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].p === 80 && fcAsk(S0).length === 1 && S.fc[0].due === endJ && !S.sys.some(x => /موعدی نگفتی/.test(x)), J([S.fc, fasys(S), endJ])]; };
  E[185] = async () => { await live(); await turn('فکر کنم ۷۰ درصد کارتن‌ها تا جمعه بسته میشن'); const S0 = await st(); await turn('آره'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].p === 70 && fcAsk(S0).length === 1 && !planAsk(S0) && S.fc[0].due === wd(5) && !S.plans.some(q => q.when) && !S.sys.some(x => /📌/.test(x)), J([S.fc, fasys(S)])]; };
  /* دو «N درصد» در یک بند (B29·D17، C90) */
  E[186] = async () => { await live(); await turn('۷۵ درصد مطمئنم ریاضی ۱۸ میشم و ۵۵ درصد که فیزیک ۱۶ بشم'); const S = await st();
    return [S.fc.length === 2 && S.fc.some(f => nz(f.q) === nz('ریاضی ۱۸ میشم') && f.p === 75) && S.fc.some(f => nz(f.q) === nz('فیزیک ۱۶ بشم') && f.p === 55), J([S.fc])]; };
  E[187] = async () => { await live(); await turn('۷۵ درصد مطمئنم ریاضی ۱۸ میشم و ۵۵ درصد که فیزیک ۱۶ بشم'); await turn('ریاضی ۱۸ شدم، فیزیک ۱۵'); const S = await st();
    return [S.fc.some(f => /ریاضی/.test(f.q) && f.out === 'شد') && S.fc.some(f => /فیزیک/.test(f.q) && f.out === 'نشد') && !S.ask, J([S.fc, fasys(S)])]; };
  E[188] = async () => { await live(); await turn('۸۰ درصد مطمئنم مهمونا قبل از ۸ می‌رسن و ۶۰ درصد مطمئنم غذا کم نمیاد'); const S = await st();
    return [S.fc.length === 2 && S.fc.some(f => /مهمونا قبل از ۸ می‌رسن/.test(f.q) && f.p === 80) && S.fc.some(f => /غذا کم نمیاد/.test(f.q) && f.p === 60) && !S.sys.some(x => /📅/.test(x)), J([S.fc, fasys(S)])]; };
  /* C119 در شکلِ B */
  E[189] = async () => { await live(); await turn('مطمئنم آزمونِ آزمایشیِ شنبه حدودِ ۶٫۵ میشه'); const S = await st();
    return [S.sys.filter(x => /چند درصد مطمئنی/.test(x)).length === 1 && !planAsk(S) && !S.plans.some(q => q.when), J([S.fc, fasys(S)])]; };
  E[190] = async () => { await live(); await turn('مطمئنم آزمونِ آزمایشیِ شنبه حدودِ ۶٫۵ میشه'); await turn('۶۰'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].p === 60 && /آزمونِ آزمایشیِ شنبه حدودِ ۶٫۵ میشه/.test(S.fc[0].q), J([S.fc, fasys(S)])]; };
  E[191] = async () => { await live(); await turn('تقریباً مطمئنم بچه‌ها از آزمونِ کوتاه استقبال می‌کنن'); const S = await st();
    return [S.sys.filter(x => /چند درصد مطمئنی/.test(x)).length === 1 && S.fc.length === 0 && fasys(S).length === 1, J([S.fc, fasys(S)])]; };
  /* به‌روزرسانی و سرانجام (C77، C91، C120) */
  E[192] = async () => { await live(); await seed('گزارش رو تا آخرِ هفته‌ی بعد تحویل میدم', 70); await turn('الان دیگه ۸۵ درصد مطمئنم، نه ۷۰'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].p === 85 && J(S.fc[0].pHist) === '[70]', J([S.fc, fasys(S)])]; };
  E[193] = async () => { await live(); await seed('تو کوییز فقط ۱ سؤال غلط می‌زنم', 60); await turn('پیش‌بینیم ۱ بود، شد ۲'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].out === 'نشد' && !S.sys.some(x => /شد یا نشد/.test(x)), J([S.fc, fasys(S)])]; };
  E[194] = async () => { await live(); await seed('کارتن‌ها روی هم حدودِ ۵۰ تا میشن', 70); await turn('۵۳ تا شد'); const S = await st();
    return [!S.fc[0].out && S.sys.some(x => /حدودِ ۵۰» حساب می‌شود/.test(x)), J([S.fc, fasys(S)])]; };
  E[195] = async () => { await live(); await seed('کارتن‌ها روی هم حدودِ ۵۰ تا میشن', 70); await turn('دقیقاً ۵۰ تا شد'); const S = await st();
    return [S.fc[0].out === 'شد', J([S.fc, fasys(S)])]; };
  E[196] = async () => { await live(); await seed('جلسه‌ی اولِ باشگاه خسته می‌شم ولی می‌رم', 70); await turn('دیروز رفتم باشگاه! خسته شدم ولی رفتم، همون که پیش‌بینی کرده بودم'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].out === 'شد' && !S.sys.some(x => /کدام پیش‌بینی/.test(x)), J([S.fc, fasys(S)])]; };
  E[197] = async () => { await live(); await seed('مدیرم تا جمعه تأیید می‌کنه', 70); await seed('همکارم تا جمعه ثبت‌نام می‌کنه', 40); await turn('یکی از پیش‌بینی‌های ۷۰ درصدیم درست شد'); const S = await st();
    return [S.fc.some(f => /مدیرم/.test(f.q) && f.out === 'شد') && S.fc.some(f => /همکارم/.test(f.q) && !f.out) && !S.ask, J([S.fc, fasys(S)])]; };
  /* C29-8: همان پیامد از نقلِ مدل (guess) و از بندِ خودش ⇒ یک 🎯 */
  E[198] = async () => { await live(); const T = 'قبل از حساب یه پیش‌بینی می‌کنم: احتمالِ دو قرمز حدودِ ۲۵٪ درمیاد، ۶۰ درصد مطمئنم.';
    await turn(T, 'یک پیش‌بینی با اطمینانِ خودت گفتی. با کدام حساب می‌آزمایی‌اش؟', [{ do: 'coach_state', ph: 'u', said: ['guess'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective', guess: { text: 'احتمالِ دو قرمز حدودِ ۲۵٪ درمیاد، ۶۰ درصد مطمئنم', q: 'با کدام حساب می‌آزمایی‌اش؟' } }]);
    const S0 = await st(); await turn('حساب کردم، همون ۲۵٪ درست درومد'); const S = await st();
    return [S0.fc.length === 1 && S0.fc[0].p === 60 && S.fc.length === 1 && S.fc[0].out === 'شد' && !S.sys.some(x => /کدام پیش‌بینی/.test(x)), J([S0.fc, S.fc, fasys(S)])]; };
  /* C121: 🎯 زیرِ مسئله‌ای که درباره‌اش است */
  E[199] = async () => { const a = await live('اسباب‌کشی به خونه‌ی جدید', 'اسباب‌کشی تا آخرِ ماه؛ بودجه‌ی اسباب‌کشی و رنگِ اتاق‌ها رو باید جور کنم.'); const t = await live2('میزِ آشپزخونه', 'میزِ آشپزخونه با عرضِ ۲۴۰ سانت جا میشه یا نه؟');
    await turn('۷۰ درصد مطمئنم بودجه‌ی اسباب‌کشی برای رنگ کافی میشه'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].prob === a, J([S.fc, a, t])]; };
  E[200] = async () => { const c = await live('دورهٔ آمار', 'دورهٔ آنلاینِ آمار: کوییزهای هر فصل و آزمونِ پایانی.'); const z = await live2('پازلِ احتمالِ تاس', 'دو تاس می‌ندازیم؛ احتمالِ جمعِ ۷ چقدره؟');
    await turn('۶۰ درصد مطمئنم کوییزِ فصلِ ۳ رو کامل جواب میدم'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].prob === c, J([S.fc, c, z])]; };
  E[201] = async () => { await live(); await turn('باشه، قبل از این‌که حساب کنم، حدسم اینه که جواب حدودِ ۴۰٪ باشه. ۷۰ درصد مطمئنم.'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].p === 70 && nz(S.fc[0].q) === nz('جواب حدودِ ۴۰٪ باشه'), J([S.fc])]; };
  /* ---------- منفی‌ها (C148 و C91) ---------- */
  const none = (n, txt, after) => { E[n] = async () => { await live(); await turn(txt); const S0 = await st(); let S = S0;
    if (after) { await turn(after); S = await st(); }
    return [S0.fc.length === 0 && S.fc.length === 0 && !S.sys.some(x => /شد یا نشد|⇐ نشد|⇐ شد|چند درصد مطمئنی/.test(x)), J([S.fc, fasys(S)])]; }; };
  none(202, 'اجاره با ۱۸٪ افزایش میشه ۱۵ × ۱٫۱۸ = ۱۷٫۷ میلیون', 'اجاره رو تا جمعه امضا می‌کنم.');
  none(203, 'با ۱۲ درصد برای درز و دوخت میشه ۴٫۵ × ۱٫۱۲ = ۵٫۰۴ متر پارچه');
  none(204, '۱۰۰ × ۰٫۴ = ۴۰ وات هیدرولیکی؛ با ۱۵٪ اصطکاک ۳۴ وات مفید', 'گامِ ۳ غلط بود و سهمِ کابل باید ۱/۶ باشه.');
  none(205, 'پمپ‌ها حدودِ ۴۰ تا ۵۰ درصدن. با راندمانِ ۴۵٪ میشه ۹۰۰ ÷ ۰٫۴۵ = ۲۰۰۰ وات', 'راستی گفتی ۲۰۰۰ × ۸ با ۱۶ نمی‌خونه؛ کجاش غلطه؟');
  none(206, 'با ۸ درصد پرت، ۲۵ × ۱٫۰۸ = ۲۷ متر', 'آهان، اصلاً فروشنده پرت رو ۱۰ درصد گفته بود، نه ۸.');
  none(207, '۳۰ لیتر شربت با ۱۲٪ یعنی ۳٫۶ لیتر شکر', 'صورتِ مسئله رو دوباره دیدم: ظرفِ اول ۴۰ لیتر بود، نه ۳۰ لیتر.');
  none(208, 'خرج‌مون هر سال حدود ۲۵ درصد زیاد میشه، ولی حقوقم فقط حدود ۱۵ درصد');
  none(209, 'اگه بفروشیم، خریدار ۳ درصد کمیسیون میده');
  none(210, 'فروشنده گفت از ماهِ بعد ۱۲٪ گرون میشه');
  none(211, 'الان ۶ هزار کاربر داریم و ماهی حدودِ ۵٪ رشد می‌کنیم');
  none(212, 'صاحبخونه قبول کرد: ۵ ساله با افزایشِ ۲۰٪');
  none(213, 'مشاور گفت ۸۰ درصد مطمئنه صاحبخونه اجاره رو بالا نمی‌بره');
  none(214, 'پارسال ۹۰ درصد مطمئن بودم ترفیع می‌گیرم و نشد');
  none(215, 'می‌خوام ببینم پیش‌بینی‌هام چقدر درست درمیان — مثل همون «۷۰ درصد مطمئنم» برای جلسه');
  E[216] = async () => { await live(); await seed('کفِ حیاط حدودِ ۶ مترمربع میشه', 70); await turn('۶٫۴ متر مربع = ۶۴۰۰۰ سانتی‌متر مربع'); const S = await st();
    return [!S.fc[0].out && !S.sys.some(x => /حدودِ ۶» حساب می‌شود|شد یا نشد/.test(x)), J([S.fc, fasys(S)])]; };
  E[217] = async () => { await live(); await seed('پارکت تا آخرِ ماه نصب میشه', 80); await turn('برگردیم به کارتن‌های پارکت'); const S = await st();
    return [!S.fc[0].out && !S.sys.some(x => /شد یا نشد/.test(x)), J([S.fc, fasys(S)])]; };
  E[218] = async () => { await live(); await seed('پارکت تا آخرِ ماه نصب میشه', 80); await turn('دستمزدِ نصب ۱۵۰ نیست، ۱۸۰'); const S = await st();
    return [!S.fc[0].out && !S.sys.some(x => /شد یا نشد/.test(x)), J([S.fc, fasys(S)])]; };
  E[219] = async () => { await live(); await seed('تا آخرِ همین هفته ۴ تا قفسه رو سوار می‌کنم', 70); await turn('یعنی: ۷۰ درصد مطمئنم تا آخرِ همین هفته ۴ تا قفسه رو سوار می‌کنم'); const S0 = await st();
    await turn('قفسه‌ها: شد ۳ تا.'); const S = await st();
    return [S0.fc.length === 1 && S.fc.length === 1 && S.fc[0].out === 'نشد' && !S.sys.some(x => /کدام پیش‌بینی/.test(x)), J([S0.fc, S.fc, fasys(S)])]; };
  E[220] = async () => { await live(); await turn('۶۰ درصد مطمئنم درصدِ خطام حدودِ ۸ درصد درمیاد'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].p === 60, J([S.fc])]; };
  none(221, '۲۰ درصدِ ۳۰۰ میلیون رو می‌ذارم طلا، میشه ۶۰ میلیون');
  E[222] = async () => { await live(); await seed('مدیرم تا جمعه تأیید می‌کنه', 70); await turn('امروز خیلی کار داشتم، فردا بیشتر می‌نویسم'); const S = await st();
    return [!S.fc[0].out && !S.sys.some(x => /شد یا نشد|کدام پیش‌بینی/.test(x)), J([S.fc, fasys(S)])]; };

  /* بانک همان است که هست: هر ورودیِ R5.forecast یک آزمون دارد */
  const R5 = BANK.map((x, i) => [i + 1, x]).filter(([i, x]) => /^R5/.test(String(x.rc || '')));
  R5.forEach(([i]) => { if (!E[i]) info.nc[i] = 'بی آزمون (ورودیِ تازهٔ بانک)'; });
  for (const [i] of R5) { if (!E[i]) continue; if (process.env.ONLY && !process.env.ONLY.split(',').includes(String(i))) continue; info.n++;
    try { const r = await E[i](); if (r[0]) info.ok++; else errors.push('#' + i + ' ⇒ ' + String(r[1]).slice(0, 900)); } catch (e) { errors.push('#' + i + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  console.log(JSON.stringify(info));
  console.log('NC: ' + JSON.stringify(info.nc));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
