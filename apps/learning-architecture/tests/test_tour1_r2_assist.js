// تورِ پولیا (دستهٔ ۱، دورِ ۲ ِ اصلاح، ۲۰۲۶-۱۰-۱۶) — سهمِ «دستیار، مربیِ حل، تور، قلمرو و مرحله‌ها» (G2) از تصمیم‌های DECISIONS_R2:
//  R1  سشن ⇄ مسئلهٔ زنده: بستن، نگه داشتن، هرگز جابه‌جا کردنِ سشنِ دیگر؛ بلوکِ زنده همیشه (فشرده)؛ live_new دوباره تزریق نمی‌شود؛
//      مربیِ حل در **هر** نوبتِ غیرِ راهنما (فهرستِ منفی، نه الگوی مسئله)، با مرحله و پرسش‌های نوع‌دار (هرگز خالی)، قاعده‌های معلم
//      (تکرار با تغییرِ کوچک، C188، موفقیتِ کوچک، الگوی بلندفکرکردن، معلمِ خیالی، ضدِ ضرب‌المثل، بازنگری مهم‌ترین/هیچ مسئله‌ای تمام نیست،
//      شکل، سلیقه/نویسندگانِ خوب، «حق داره؟» ⇒ اثبات یا رد، دلسردی ⇒ 🌱)، پرسشِ پاسخ‌گرفته در گفت‌وگو دوباره نه، ضرب‌المثلِ تکراری نه،
//      مربی پس از بستنِ مسئله، میانهٔ راه روی نردبانِ خودِ سامانه
//  R3  نام بردنِ داده در گفت‌وگو «به کار بردن» نیست (بلوکِ زنده)؛ حدسِ ردشده به مدل می‌رسد
//  R6  «دانسته‌های قلمرو»: بی تطبیقِ پیشوندی و نامِ نیمه؛ پیوندِ صریح
//  R7  «🧩 چهار مرحلهٔ حل»: گیرِ گفت‌وگو و گرهِ غربال شمرده می‌شوند؛ بازنگریِ ساختهٔ دستیار نه
//  R8  غربال پیرو قابِ صفحه؛ نشانه‌های تور برای مسئلهٔ عینی؛ ایمیل پس از برپاییِ وجه؛ یادآورِ ایستاده نه پس از موعدِ کاربر؛ chat_solved به‌روز
//      می‌کند و هر دو کار در گفت‌وگو تأیید می‌شوند؛ idea_counter ِ دوم با nt و بی «انجام نشد»؛ bidi ِ پیکان و واحد؛ رنگِ نمودار؛ پیوست ⇒ مسئلهٔ زنده
// همه با رابطِ واقعی (پنجرهٔ دستیار) و مدلِ بدلی؛ هر بند با نمونهٔ منفی. خروج با کدِ غیرصفر در خطا.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  await p.goto(FILE); await p.waitForSelector('.nav');
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__rem = []; window.__unrem = []; window.__mail = []; window.__up = []; window.__day = APP.today();
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async (pl) => { __rem.push(JSON.parse(JSON.stringify(pl))); return { ok: true }; }, unremind: async (k) => { __unrem.push(k); return { ok: true }; },
      mail: async (rep) => { __mail.push(rep.subject || ''); return { status: 'sent' }; },
      upload: async (rid, f, o) => { __up.push({ rid, name: f.name, group: o && o.group }); return { id: 'f' + __up.length, name: f.name, mime: f.type || '' }; } };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); const r = __q.shift(); const t = typeof r === 'function' ? r(user) : r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
  });
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
  };
  const newSess = () => p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => (__calls[__calls.length - 1] || {}).user || '');
  const coachOf = (u) => { const i = u.indexOf('# مربیِ حل'); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };

  // ---------- SYS ----------
  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  // ---------- R1a) مربی در هر نوبتِ غیرِ راهنما؛ فهرستِ منفی ----------
  const POS = ['کجای کدم اشتباهه؟ خروجی همیشه یکی کم میاد', 'یه راه‌حل بده که همه راضی باشن', 'نمی‌دونم چی رو امتحان کنم', 'قانونش چیه؟ فکر کنم خطیه', 'حجمِ مخروط رو پیدا کنید', 'چه کنیم که بمونه؟', 'دخترم تو تمرینِ کسرها گیر کرده'];
  const NEG = ['سلام', 'مرسی خیلی', 'این دکمه چیکار می‌کنه؟', 'فونتِ صفحه ریزه', 'یادآورها رو خاموش کن', 'برو به صفحهٔ امروز'];
  info.gate = { pos: [], neg: [] };
  for (const t of POS) { await newSess(); await say(t); const u = await lastUser(), c = coachOf(u); info.gate.pos.push([t, !!c, /پرسش‌های «[^»]+» \(کلی ⇐ خاص\): 1\) \S/.test(c)]); }
  for (const t of NEG) { await newSess(); await say(t); const u = await lastUser(); info.gate.neg.push([t, !!coachOf(u)]); }
  chk(info.gate.pos.every(x => x[1] && x[2]), 'R1: the coach (with a non-empty phase question list) comes on every non-help turn, whatever the phrasing ' + JSON.stringify(info.gate.pos));
  chk(info.gate.neg.every(x => !x[1]), 'R1: greetings, thanks, page-help, settings and navigation get no coach ' + JSON.stringify(info.gate.neg));

  // ---------- R1b) قاعده‌های معلم و نوع‌داری ----------
  await newSess();
  await say('ثابت کنید که مجموعِ زاویه‌های داخلیِ هر مثلث ۱۸۰ درجه است. مجهولش چیه؟');
  info.rules = await p.evaluate(() => (__calls[__calls.length - 1] || {}).user);
  {
    const c = coachOf(info.rules);
    info.rulesR = { prove: /اثباتی/.test(c) && /فرض چیست؟ حکم/.test(c), silence: /تغییرِ کوچک/.test(c), c188: /ایدهٔ کلیدی/.test(c) && /کتاب را ببند و خودت دوباره حل کن/.test(c) && !/هرگز کلِ حل/.test(c),
      small: /گامِ کوچک ارزش دارد/.test(c), aloud: /الگو کن/.test(c) && /گفت‌وگوی درونی/.test(c), teacher: /معلمِ خیالی/.test(c), opp: /ضدی هم دارد/.test(c), figure: /شکل/.test(c) && /حتی اگر مسئله هندسی نیست/.test(c),
      dispute: /ثابتش کن یا با مثالِ نقض ردش کن/.test(c), will: /🌱/.test(c), phase: /مرحلهٔ محتمل: فهمِ مسئله/.test(c), oneIdea: /یک ایده/.test(c), size: c.length };
    info.rulesR.ok = Object.keys(info.rulesR).every(k => k === 'size' || info.rulesR[k]);
  }
  chk(info.rulesR.ok, 'R1: teacher rules (silence variation, C188, small wins, modelled think-aloud, imaginary teacher, proverb opposite, figure, prove-or-refute, 🌱) and the prove-kind list ' + JSON.stringify(info.rulesR));
  // «حق داره؟» ⇒ همین پیام ادعاست؛ پاسخِ پیشین در گفت‌وگو دوباره پرسیده نمی‌شود
  await p.evaluate(() => { __q.push(R({ reply: 'فرض چیست؟ حکم (آنچه باید ثابت شود) چیست؟' })); });
  await say('معلمم می‌گه همیشه ۱۸۰ ـه؛ حق داره؟');
  await say('فرض اینه که سه ضلع داریم و حکم اینه که جمعِ زاویه‌ها ۱۸۰ است');
  info.chatAns = await p.evaluate(() => { const u = __calls[__calls.length - 1].user, d = __calls[__calls.length - 2].user; return { answered: /فرض چیست؟ حکم \(آنچه باید ثابت شود\) چیست؟ \[در گفت‌وگو پاسخ گرفته — دوباره نپرس\]/.test(u), dispute: /همین پیام چنین ادعایی است/.test(d), notBefore: !/همین پیام چنین ادعایی است/.test(u) }; });
  chk(info.chatAns.answered && info.chatAns.dispute && info.chatAns.notBefore, 'R1: «حق داره؟» is flagged as a claim to prove or refute; a question the user already answered in chat is not re-asked ' + JSON.stringify(info.chatAns));
  // ضرب‌المثل بی تکرار در سشن
  info.prov = await p.evaluate(() => { const L = __calls.slice(-3).map(c => (/ضرب‌المثلِ همین مرحله \(پولیا، «حکمتِ ضرب‌المثل‌ها»\): «([^»]+)»/.exec(c.user) || [])[1]).filter(Boolean); return { L, uniq: new Set(L).size === L.length }; });
  chk(info.prov.L.length >= 2 && info.prov.uniq, 'R1: the coach proverb is not repeated within a session ' + JSON.stringify(info.prov));
  // پس از «حل شد» ⇒ بازنگری: مهم‌ترین بخش، هیچ مسئله‌ای تمام نیست، سلیقه و نویسندگانِ خوب؛ و فهرستِ اثباتیِ بازنگری
  await say('حلش کردم؛ با خطِ موازی با یک ضلع ثابتش کردم');
  info.back = await p.evaluate(() => { const u = __calls[__calls.length - 1].user; return { ph: /مرحلهٔ محتمل: بازنگری/.test(u), c115: /مهم‌ترین بخشِ کار/.test(u) && /هیچ مسئله‌ای کاملاً تمام نمی‌شود/.test(u), taste: /سلیقه/.test(u) && /بی‌نگاه بازسازی/.test(u), hyp: /هر بخشِ فرض کجای برهان به کار رفت/.test(u) && /استدلال کجا از تعریف استفاده کرد/.test(u) }; });
  chk(info.back.ph && info.back.c115 && info.back.taste && info.back.hyp, 'R1: after «حل شد» the coach moves to look-back (most important, never finished, taste, good authors) with proof look-back questions ' + JSON.stringify(info.back));
  // نوعِ عملی ⇒ پرسش‌های داوری با واقعیت
  await newSess(); await say('می‌خوام برای مغازه‌ام تصمیم بگیرم که شنبه‌ها باز باشم یا نه');
  info.pract = await p.evaluate(() => { const u = __calls[__calls.length - 1].user; return { pract: /تصمیم\/کارِ واقعی/.test(u) && /دقیقاً چه می‌خواهی — «حل‌شدن» چه شکلی است/.test(u), notProve: !/فرض چیست؟ حکم/.test(u) }; });
  chk(info.pract.pract && info.pract.notProve, 'R1/R2: a life/practical problem gets the practical question list, not the proof list ' + JSON.stringify(info.pract));

  // ---------- R1c) دلسردی: واژه‌نامهٔ گسترده؛ منفی ----------
  info.will = await p.evaluate(() => { const AS = APP.ASSIST, W = ['ولش کنم بهتره', 'پس راهی نیست', 'هیچ کاری نمیشه کرد', 'عصبانیم، وقتم هدر رفت', 'استعدادشو ندارم', 'می‌خوام انصراف بدم', 'جلوی کلاس خجالت کشیدم'];
    return { pos: W.map(t => !!AS.willSignal({ msgs: [] }, t)), neg: ['بعد از ناهار جدولِ ضرب را مرور کنیم', 'استعدادِ پسرم در ریاضی خوبه', 'وقتم آزاده'].map(t => !!AS.willSignal({ msgs: [] }, t)) }; });
  chk(info.will.pos.every(Boolean) && !info.will.neg.some(Boolean), 'R1: extended discouragement lexicon (with negatives) ' + JSON.stringify(info.will));

  // ---------- R1d) سشن ⇄ مسئلهٔ زنده: بستن، بلوکِ همیشگی، بی تزریقِ دوبارهٔ live_new، بی جابه‌جاییِ سشنِ دیگر ----------
  await newSess();
  await p.evaluate(() => APP.go('home'));
  await p.evaluate(() => { __q.push(R({ reply: 'ثبتش کردم.', actions: [{ do: 'live_new', title: 'باغچهٔ پشتِ خانه', statement: 'نمی‌دونم توی باغچهٔ کوچیکِ پشتِ خونه گوجه بکارم یا سبزی؛ آفتابش کمه.', nat: 'practical' }] })); });
  await say('نمی‌دونم توی باغچهٔ کوچیکِ پشتِ خونه گوجه بکارم یا سبزی؛ آفتابش کمه');
  info.bind = await p.evaluate(() => ({ sid: APP.ASSIST.cur().id, pid: APP.ASSIST.cur().lprob }));
  await say('امروز حوصله ندارم، بعداً');   // بی واژهٔ مشترک با مسئله، بیرون از صفحه‌اش
  info.bind.u = await lastUser();
  info.bindR = { bound: !!info.bind.pid, block: /# مسئلهٔ زندهٔ این سشن \(/.test(info.bind.u), noRules: !/do\\?":\\?"live_new/.test(info.bind.u.replace(/\\"/g, '"')) || /live_new فقط اگر کاربر صریحاً مسئلهٔ \*\*دیگری\*\*/.test(info.bind.u), oneLiner: /این سشن به «باغچهٔ پشتِ خانه» بسته است|# مسئلهٔ زندهٔ این سشن/.test(info.bind.u) };
  chk(info.bindR.bound && info.bindR.block && info.bindR.noRules, 'R1: live_new binds the session; the next turn (off-page, no shared words) still carries the live block and not the creation rules ' + JSON.stringify(info.bindR));
  // سشنِ دوم مسئلهٔ دیگری می‌سازد ⇒ سشنِ اول همان می‌ماند
  const sid1 = info.bind.sid, pid1 = info.bind.pid;
  await newSess();
  await p.evaluate(() => { __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'live_new', title: 'هدیهٔ تولد', statement: 'برای تولدِ مادرم کتاب بخرم یا گلدان؛ بودجه کمه.' }] })); });
  await say('برای تولدِ مادرم کتاب بخرم یا گلدان؛ بودجه کمه');
  info.other = await p.evaluate(([sid1, pid1]) => { const s1 = APP.S.get(sid1), s2 = APP.ASSIST.cur(); return { s1kept: s1.lprob === pid1, s2own: !!s2.lprob && s2.lprob !== pid1 }; }, [sid1, pid1]);
  // ساختن از فرم (بی سشنِ صریح) پیوندِ سشنِ بسته به مسئلهٔ باز را عوض نمی‌کند
  info.other.formKeep = await p.evaluate(() => { const s = APP.ASSIST.cur(), before = s.lprob, r = APP.liveCreate('از فرم', 'مسئله‌ای که از فرم ساختم و نباید پیوند را عوض کند.', 'find'); APP.liveBindSession(r.p.id); return APP.ASSIST.cur().lprob === before; });
  chk(info.other.s1kept && info.other.s2own && info.other.formKeep, 'R1: a second session binds its own problem and never rebinds another session; a form-made problem keeps the existing binding ' + JSON.stringify(info.other));

  // ---------- R3) دادهٔ «به کار رفته» ِ صادق و حدسِ ردشده در بلوکِ زنده ----------
  await newSess();
  info.used = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S, r = APP.liveCreate('جای میز', 'میزِ ۱۲۰ سانتی در اتاقِ ۳ متری جا می‌شود یا نه؛ کمد هم هست.', 'find', { nat: 'practical' }), pid = r.p.id;
    const pg = S.get('eprog_' + pid); pg.solve.u = { 1: { done: true, one: 'جا شدنِ میز', u: 'جا می‌شود یا نه', dl: [{ id: 'd1', t: 'طولِ میز ۱۲۰ سانت' }, { id: 'd2', t: 'کمدِ کنارِ دیوار' }], c: 'راه رفتن آزاد بماند', type: 'find', nat: 'practical' } };
    pg.solve.live.plan = { t: 'طولِ میز ۱۲۰ سانت را با دیوار مقایسه می‌کنم', at: new Date().toISOString(), heur: ['move'], unused: {} }; S.put(pg);
    const s = AS.cur(); s.lprob = pid; S.put(s); APP.go('home');
    __calls.length = 0; await AS.send('اون کمدِ کنارِ دیوار به نظرم بی‌فایده‌ست؛ کمد مهم نیست');
    const u = __calls[0].user; const UN = /^- داده‌هایی که هنوز (?:در کارِ حل نیامده‌اند|در طرح\/گام‌ها به کار نرفته)[^\n]*/mg, lines = u.match(UN) || [];   // سطرِ a38 از A.liveUnused (ادغامِ G1/G2: یک سطر)
    return { unusedKmd: lines.some(l => /«کمدِ کنارِ دیوار»/.test(l)), notDesk: !lines.some(l => /«طولِ میز ۱۲۰ سانت»/.test(l)), one: lines.length === 1 };
  });
  chk(info.used.unusedKmd && info.used.notDesk && info.used.one, 'R3: a datum only named/dismissed in chat is still «not used» in the live block; a datum used in the plan is not listed ' + JSON.stringify(info.used));

  // ---------- R1e) پس از بستنِ مسئله: مربی برای حدسِ تازه؛ میانهٔ راه روی نردبان ----------
  info.closed = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S, s = AS.cur(), pid = s.lprob, pg = S.get('eprog_' + pid);
    pg.solve.live.state = 'solved'; pg.solve.b = { 1: { done: true, state: 'solved', use: 'اول اندازه بگیر', at: new Date().toISOString() } }; S.put(pg);
    const done = APP.livePhase(pid);
    __calls.length = 0; await AS.send('حالا یه حدس دارم: هر میزی که کوتاه‌تر از نصفِ اتاق باشه جا می‌شه');
    const u = __calls[0].user; return { done, coach: /# مربیِ حل/.test(u), closed: /بسته شده است؛ حدس یا ادعای تازه‌اش مسئلهٔ تازه است/.test(u), fromU: /مرحلهٔ محتمل: فهمِ مسئله/.test(u) };
  });
  chk(info.closed.done === 'done' && info.closed.coach && info.closed.closed && info.closed.fromU, 'R1: after the bound problem closes, a new conjecture still gets the coach (from understanding) ' + JSON.stringify(info.closed));
  info.mid = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S; localStorage.removeItem('lla.assist.cur'); const s = AS.newSession();
    const r = APP.liveCreate('پروژهٔ پایانی', 'پروژهٔ پایانیِ ارشد را چطور تا آخرِ ترم تمام کنم.', 'find'); r.created = APP.addDays(APP.today(), -8); S.put(r); s.lprob = r.p.id; S.put(s);
    __calls.length = 0; await AS.send('امروز فصلِ دوم رو نوشتم'); const a = /میانهٔ راه/.test(__calls[0].user);
    __calls.length = 0; await AS.send('فردا فصلِ سوم'); const b2 = /میانهٔ راه/.test(__calls[0].user);
    const r2 = APP.liveCreate('تازه', 'مسئلهٔ تازه‌ای که دیروز ساختم و هنوز جوان است.', 'find'); s.lprob = r2.p.id; S.put(s);
    __calls.length = 0; await AS.send('امروز شروع کردم'); const c = /میانهٔ راه/.test(__calls[0].user);
    return { first: a, notAgain: !b2, young: !c };
  });
  chk(info.mid.first && info.mid.notAgain && info.mid.young, 'R8: a long-open live problem gets one mid-course check-in per ladder rung (not for a young one) ' + JSON.stringify(info.mid));

  // ---------- R8) غربال پیرو قابِ صفحه ----------
  info.sieve = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S; localStorage.removeItem('lla.assist.cur'); const s = AS.newSession();
    s.diag = { practical: { st: 'found', why: 'تصمیمِ خرید', parts: { unknown: 'کدام بخرم' }, at: new Date().toISOString() } }; S.put(s);
    __calls.length = 0; await AS.send('کدوم ماشین رو بخرم؟'); const free = __calls[0].user;
    const r = APP.liveCreate('خریدِ ماشین', 'کدام ماشین را بخرم با این بودجه.', 'find'); s.lprob = r.p.id; S.put(s);
    __calls.length = 0; await AS.send('کدوم ماشین رو بخرم؟'); const bound = __calls[0].user;
    return { freeAsks: /پیش از هر پیشنهادِ راه‌حل، \*\*یکی\*\* از مانده‌ها را بپرس/.test(free), boundDefers: /منبعِ پرسشِ این نوبت «مسئلهٔ زندهٔ این سشن» است/.test(bound) && !/پیش از هر پیشنهادِ راه‌حل، \*\*یکی\*\* از مانده‌ها را بپرس/.test(bound) };
  });
  chk(info.sieve.freeAsks && info.sieve.boundDefers, 'R8: the sieve practical frame defers to the live problem page (one question source) only when a live problem is bound ' + JSON.stringify(info.sieve));

  // ---------- R8) chat_solved: به‌روزرسانی نه تکرار؛ تأیید در گفت‌وگو؛ chat_invent با برچسب و نوعِ پدر ----------
  await newSess();
  info.solved = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S, st = 'کمترین تعدادِ وزنه‌هایی که با آن‌ها هر وزنِ ۱ تا ۴۰ را بتوان کشید.';
    const n0 = APP.liveAll().length;
    __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'chat_solved', title: 'وزنه‌های باشه', statement: st, kind: 'find', lesson: 'دو کفه یعنی ضریب‌های −۱ و ۰ و ۱', check: 'با ۴۰ امتحان کردم' }] }));
    await AS.send('حلش کردم؛ درسش اینه که دو کفه یعنی ضریب‌های −۱ و ۰ و ۱');
    __q.push(R({ reply: 'به‌روز شد.', actions: [{ do: 'chat_solved', title: 'وزنه‌های باشه', statement: st, lesson: 'دو کفه یعنی ضریب‌های −۱ و ۰ و ۱' }] }));
    await AS.send('یه بار دیگه ثبتش کن');
    const all = APP.liveAll().filter(x => x.p.statement === st), s = AS.cur(), sys = s.msgs.filter(m => m.role === 'sys').map(m => m.text);
    const pid = all[0] && all[0].p.id, pg = S.get('eprog_' + pid);
    __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'chat_invent', statement: 'با سه وزنه بیشترین بازهٔ پیوسته چقدر است؟', from: pid }] }));
    await AS.send('یه مسئلهٔ تازه ساختم: با سه وزنه بیشترین بازهٔ پیوسته چقدر است؟');
    const inv = APP.liveAll().filter(x => /بیشترین بازهٔ پیوسته/.test(x.p.statement))[0], sys2 = AS.cur().msgs.filter(m => m.role === 'sys').map(m => m.text);
    return { one: all.length === 1, made: APP.liveAll().length, n0, conf: sys.some(t => /^✓ «وزنه‌های باشه» در «🔭 مسئله‌های من» ثبت شد/.test(t)) && sys.some(t => /همان مسئله، به‌روز شد/.test(t)),
      noFail: !__calls.some(c => /انجام نشد/.test(c.user)), own: !!(pg.solve.b[1] && pg.solve.b[1].own),
      inv: !!inv && inv.origin.type === 'lprob' && sys2.some(t => /^✓ مسئلهٔ تازه‌ات «/.test(t) && /ساخته از «وزنه‌های باشه»/.test(t)), invKind: inv && APP.liveNature(inv.p.id) === APP.liveNature(pid) };
  });
  chk(info.solved.one && info.solved.conf && info.solved.noFail && info.solved.own && info.solved.inv && info.solved.invKind, 'R8: chat_solved twice updates one record; both chat actions confirm in chat with correct labels (no false «انجام نشد»); the invented child inherits the kind ' + JSON.stringify(info.solved));
  // بازنگریِ ساختهٔ دستیار (درسی که در حرفِ کاربر نیست) موفقیتِ او شمرده نمی‌شود (R7)
  info.notOwn = await p.evaluate(async () => {
    const AS = APP.ASSIST, before = APP.MIND.phases().rows.filter(r => r.id === 'back')[0];
    __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'chat_solved', title: 'مربعِ جادویی', statement: 'مربعِ جادوییِ ۳ در ۳ با اعدادِ ۱ تا ۹ بساز.', lesson: 'عددِ وسط همیشه میانگین است و تقارن کلید است', check: 'جمع‌ها را شمردم' }] }));
    await AS.send('ساختمش!');
    const after = APP.MIND.phases().rows.filter(r => r.id === 'back')[0];
    return { n0: before.n, n1: after.n, k0: before.k, k1: after.k };
  });
  chk(info.notOwn.n1 === info.notOwn.n0 && info.notOwn.k1 === info.notOwn.k0, 'R7: an assistant-written look-back (chat_solved lesson not in the user\'s words) does not count as the user\'s look-back ' + JSON.stringify(info.notOwn));

  // ---------- R7) گیرِ گفت‌وگو و گرهِ غربال در «چهار مرحلهٔ حل» ----------
  await newSess();
  info.ph = await p.evaluate(async () => {
    const AS = APP.ASSIST, row = (id) => APP.MIND.phases().rows.filter(r => r.id === id)[0];
    const u0 = row('und'), p0 = row('plan');
    await AS.send('یه معما دارم: سه جعبه با برچسبِ غلط؛ هنوز نفهمیدم چی می‌خواد. نتونستم');
    const u1 = row('und');
    __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'tour_diag', layers: [{ id: 'F2', st: 'found', why: '«همیشه عجله می‌کنم و صورت را کامل نمی‌خوانم»' }] }] }));
    await AS.send('همیشه عجله می‌کنم و صورت را کامل نمی‌خوانم');
    const u2 = row('und'), src = u2.src;
    await AS.send('سلام');   // نه-مسئله ⇒ رویدادی نیست
    const u3 = row('und');
    return { chat: u1.n === u0.n + 1 && u1.k === u0.k, knot: u2.n === u1.n + 1 && !!(src.knot && src.knot.n), plan: row('plan').n === p0.n, noHello: u3.n === u2.n };
  });
  chk(info.ph.chat && info.ph.knot && info.ph.plan && info.ph.noHello, 'R7: a chat-coach failure and a knot found mid-solve count (as failures) in the phase where they happened; greetings do not ' + JSON.stringify(info.ph));

  // ---------- R8) idea_counter: همان t با nt ⇒ nt اعمال می‌شود؛ یادداشتِ آگاهی‌دهنده ⇒ بی «انجام نشد» ----------
  await newSess();
  info.idea = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S;
    __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'idea_new', what: 'می‌خوام کلاسِ آنلاینِ خیاطی راه بندازم' }, { do: 'idea_add', part: 'assumption', t: 'همه چرخِ خیاطی دارند' }] }));
    await AS.send('یه ایده دارم: می‌خوام کلاسِ آنلاینِ خیاطی راه بندازم');
    const s = AS.cur(), r = S.get(s.idea), i = r.parts.findIndex(x => x.k === 'assumption');
    __q.push(R({ reply: 'نقد را ثبت کردم.', actions: [{ do: 'idea_counter', i, t: 'خاله‌ام چرخ ندارد' }] }));
    await AS.send('ولی خاله‌ام چرخ ندارد');
    const callsA = __calls.length;
    __q.push(R({ reply: 'فرض را عوض کردم.', actions: [{ do: 'idea_counter', i, t: 'خاله‌ام چرخ ندارد', nt: 'فقط کسانی که چرخ دارند مخاطب‌اند' }] }));
    await AS.send('پس فرض این می‌شه: فقط کسانی که چرخ دارند مخاطب‌اند');
    const r2 = S.get(s.idea), x = r2.parts[i];
    return { nt: x.t === 'فقط کسانی که چرخ دارند مخاطب‌اند', one: r2.crits.filter(c => c.t === 'خاله‌ام چرخ ندارد').length === 1, revised: r2.crits[0].revised === true,
      noFalse: !__calls.some(c => /این کارهای نوبتِ پیش انجام نشد/.test(c.user)), conf: AS.cur().msgs.some(m => m.role === 'sys' && /^✓ فرض به حرفِ خودت بازنویسی شد/.test(m.text)) };
  });
  chk(info.idea.nt && info.idea.one && info.idea.revised && info.idea.noFalse && info.idea.conf, 'R8: a repeated idea_counter with nt applies nt without duplicating the critique; info notes are confirmations, not «انجام نشد» ' + JSON.stringify(info.idea));

  // ---------- R6) «دانسته‌های قلمرو» ----------
  info.terr = await p.evaluate(() => {
    const ids = (t) => APP.SYST.related(t, 4).map(r => r.a.id);
    return { growth: ids('رشدِ لوبیا را در آب و نور اندازه می‌گیرم؛ قانونش چیه؟'), crowd: ids('مقابل جمع حرف زدن برام سخته'),
      pos: ids('تو جلسه‌ها اطلاعاتِ پنهانِ هر نفر گفته نمی‌شه و استدلالِ جمعی خراب می‌شه'),
      know: (() => { const s = { know: [], tour: { facets: [{ key: 'f1', kind: 'area', area: 'sc_collective_reasoning', status: 'now' }] } }; return /sc_collective_reasoning/.test(APP.SYST.knowledge(s, 'سلام')); })() };
  });
  chk(!info.terr.growth.includes('sf_adversity') && !info.terr.crowd.includes('sc_collective_reasoning') && info.terr.pos.includes('sc_collective_reasoning') && info.terr.know,
    'R6: no partial-name/prefix territory matches; a full match and an explicit link (tour facet area) still show ' + JSON.stringify(info.terr));

  // ---------- R8) نشانه‌های تور برای مسئلهٔ عینی ----------
  info.ms = await p.evaluate(() => {
    const AS = APP.ASSIST, S = APP.S;
    const mk = (nat, kind, steps) => { const r = APP.liveCreate('t-' + nat, 'صورتِ آزمایشیِ ' + nat + ' برای نشانه‌های تور.', kind, { nat }); const pg = S.get('eprog_' + r.p.id); pg.solve.live.steps = steps; S.put(pg); return { kind: 'problem', key: 'x', refs: [{ id: r.id, type: 'eprob' }], status: 'now' }; };
    const fo = mk('objective', 'prove', [{ id: 's1', text: 'گام', closed: true, proof: 'چون فرض…', intuitive: false, out: { done: 'yes', kind: 'proof' } }]);
    const fl = mk('life', 'find', [{ id: 's1', text: 'گام', closed: true, pred: 'x', out: { done: 'yes', match: 'yes' } }]);
    const mo = AS.tourMilestones(fo).map(m => m.t + (m.ok ? '✓' : '')), ml = AS.tourMilestones(fl).map(m => m.t + (m.ok ? '✓' : ''));
    return { objNoPred: !mo.some(t => /پیش‌بینی/.test(t)) && mo.some(t => /گامی را ثابت کردی.*✓/.test(t)), lifePred: ml.some(t => /با پیش‌بینی‌ات سنجیدی.*✓/.test(t)) };
  });
  chk(info.ms.objNoPred && info.ms.lifePred, 'R8: tour milestones for an objective live problem ask for proof, not prediction (life keeps prediction) ' + JSON.stringify(info.ms));

  // ---------- R8) ایمیل پس از برپاییِ وجه؛ یادآورِ ایستاده نه پس از موعدِ کاربر ----------
  info.mail = await p.evaluate(async () => {
    const R0 = APP.REPORT, S = APP.S; R0.setEnabled(true);
    const ago = (h) => new Date(Date.now() - h * 3600000).toISOString();
    const mk = (k, h) => { localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); s.tour = { goal: 'g', facets: [{ key: 'f1', kind: 'other', title: 'وجه', status: 'done', refs: [], steps: [] }], mailAt: ago(h), mails: [{ status: 'sent', at: ago(h) }], mailq: [{ k, fa: k }] }; S.put(s); return s; };
    // صفِ «✓ وجه» که زمان‌سنجش با بستنِ صفحه مرد: پس از ۳ ساعت، نخستین رسم آن را می‌فرستد؛ پیش از ۳ ساعت نه (سقفِ پیشین می‌ماند)
    Object.keys(R0._pend).forEach(k => { clearTimeout(R0._pend[k]); delete R0._pend[k]; });
    const n0 = __mail.length; const s1 = mk('facet', 4); APP.render(); await new Promise(r => setTimeout(r, 300)); const late = __mail.length - n0;
    const n1 = __mail.length; const s2 = mk('facet', 1); APP.render(); await new Promise(r => setTimeout(r, 300)); const early = __mail.length - n1;
    const n2 = __mail.length; const s3 = mk('step', 4); APP.render(); await new Promise(r => setTimeout(r, 300)); const small = __mail.length - n2;
    Object.keys(R0._pend).forEach(k => { clearTimeout(R0._pend[k]); delete R0._pend[k]; });
    return { late, early, small, q1: s1.tour.mailq.length };
  });
  chk(info.mail.late === 1 && info.mail.q1 === 0 && info.mail.early === 0 && info.mail.small === 0, 'R8: a queued facet-milestone e-mail is not lost: the next render sends it once the 3-hour cap has passed (not earlier; minor events wait) ' + JSON.stringify(info.mail));
  info.stall = await p.evaluate(() => {
    const AS = APP.ASSIST, S = APP.S, s = AS.newSession();
    s.tour = { goal: 'g', createdAt: new Date().toISOString(), facets: [{ key: 'f1', kind: 'other', title: 'وجهِ ایستاده', status: 'now', refs: [], steps: [{ t: 'گامِ یک', by: 'model' }], startedAt: APP.today() }] }; S.put(s);
    const free = AS.tourStallSync(s).map(w => w.day);
    S.put({ id: 'dl_r2', type: 'deadline', what: 'امتحان', date: APP.addDays(APP.today(), 2), done: false, sess: s.id });
    s._stall = null; const capped = AS.tourStallSync(s).map(w => w.day);
    return { free, capped, ok: capped.every(d => d <= APP.addDays(APP.today(), 2)) && free.some(d => d > APP.addDays(APP.today(), 2)) };
  });
  chk(info.stall.ok, 'R8: stall nudges never fall after the user\'s own deadline in that session (without one, the ladder goes on) ' + JSON.stringify(info.stall));

  // ---------- R8) bidi و رنگِ نمودار ----------
  info.bidi = await p.evaluate(() => { const AS = APP.ASSIST, one = (t) => AS.bidiNodes(t).filter(n => n && n.tagName === 'BDI').map(n => n.textContent);
    return { units: one('ابعاد: cm³/s ÷ cm² = cm/s'), arrow: one('وقتی y→0 حجم صفر می‌شود.'), plain: one('سلام دنیا') }; });
  chk(info.bidi.units.length === 1 && info.bidi.units[0] === 'cm³/s ÷ cm² = cm/s' && info.bidi.arrow[0] === 'y→0' && !info.bidi.plain.length, 'R8: unit formulas and arrows sit in one LTR isolate ' + JSON.stringify(info.bidi));
  info.csv = await p.evaluate(() => { const n = APP.ASSIST.csvNodes({ csv: [{ name: 'a.csv', text: 'm,v\n1,2\n2,3\n3,5' }] }); return n ? n.style.color : 'none'; });
  chk(/var\(--ink\)/.test(info.csv), 'R8: the CSV chart in a user bubble uses the page ink colour (contrast) ' + info.csv);

  // ---------- R8) پیوستِ گفت‌وگو ⇒ مسئلهٔ زندهٔ بسته‌شده ----------
  await newSess();
  info.att = await p.evaluate(async () => {
    const AS = APP.ASSIST, S = APP.S, s = AS.cur(), r = APP.liveCreate('کاشیِ حمام', 'چند کاشی برای حمامِ ۲ در ۳ لازم است.', 'find'); s.lprob = r.p.id; S.put(s); APP.go('home');
    const f = new File(['x'], 'plan.jpg', { type: 'image/jpeg' }); __up.length = 0;
    await AS.send('این نقشهٔ حمامه', [f]);
    return { toLive: __up.some(u => u.rid === 'eprob_' + r.p.id), msg: AS.cur().msgs.some(m => m.role === 'sys' && /به مسئلهٔ زندهٔ این سشن/.test(m.text)) };
  });
  chk(info.att.toLive && info.att.msg, 'R8: a chat attachment also goes to the session\'s bound live problem ' + JSON.stringify(info.att));

  // ---------- R8) «امروز»: شمار = فهرست، «دیروز» فقط دیروز، برچسبِ مسئلهٔ ساختهٔ گفت‌وگو ----------
  info.today = await p.evaluate(() => {
    const S = APP.S, t = APP.today(), mine = [];
    APP.liveAll().forEach(r => { if (r.dormant && !r.woke) { r.woke = new Date().toISOString(); S.put(r); } });
    const one = APP.liveCreate('ساختهٔ گفت‌وگو', 'مسئله‌ای که در گفت‌وگو ساختم و امروز برمی‌گردد.', 'find', { origin: { type: 'chat', id: 'x' }, dormant: t });
    const single = APP.dueList().filter(x => /^🧩 مسئلهٔ تازه‌ای که خودت ساختی برگشت/.test(x.txt))[0];
    for (let i = 0; i < 3; i++) mine.push(APP.liveCreate('ساخته ' + i, 'مسئلهٔ ساختهٔ شمارهٔ ' + i + ' که امروز برمی‌گردد.', 'find', { origin: { type: 'chat', id: 'x' }, dormant: t }));
    const many = APP.dueList().filter(x => /مسئلهٔ تازه‌ای که خودت ساختی برگشت/.test(x.txt))[0];
    const r = APP.liveCreate('کنارگذاشته', 'مسئله‌ای که پس از تلاشِ جدی کنار گذاشتم.', 'find'), pg = S.get('eprog_' + r.p.id);
    pg.solve.live.incub = { at: new Date().toISOString(), d: APP.addDays(t, -2), due: APP.addDays(t, -1), ph: 'p' }; S.put(pg);
    const inc = APP.dueList().filter(x => /^😴/.test(x.txt) && /کنارگذاشته/.test(x.txt))[0];
    pg.solve.live.incub.d = APP.addDays(t, -1); S.put(pg);
    const inc1 = APP.dueList().filter(x => /^😴/.test(x.txt) && /کنارگذاشته/.test(x.txt))[0];
    [one].concat(mine).forEach(x => { x.woke = new Date().toISOString(); S.put(x); }); pg.solve.live.incub.back = { at: 'x' }; S.put(pg);
    return { single: single && single.sub, many: many && [many.txt, many.sub], inc: inc && inc.txt, inc1: inc1 && inc1.txt };
  });
  chk(/ساخته‌شده در گفت‌وگو/.test(info.today.single || '') && info.today.many && /۴ مسئلهٔ تازه/.test(info.today.many[0]) && / و ۱ تای دیگر$/.test(info.today.many[1]) && /^😴 ۲ روز پیش «/.test(info.today.inc || '') && /^😴 دیروز «/.test(info.today.inc1 || ''),
    'R8: «امروز» count matches the list, «دیروز» only when it was yesterday, chat-made problems are not «از بازنگریِ یک مسئلهٔ دیگر» ' + JSON.stringify(info.today));
  // ریاضی‌کردن: وارسیِ ابعاد
  info.units = await p.evaluate(() => ({ bad: APP.measurableCheck('حجم = ۲۰۰ × ۱۲۰ × ۱۰۰ لیتر'), good: APP.measurableCheck('حجم ≥ ۲۰۰ سانتی‌متر × ۱۲۰ سانتی‌متر × ۱۰۰ سانتی‌متر').ok, plain: APP.measurableCheck('پس‌انداز ≥ ۵ میلیون').ok }));
  chk(!info.units.bad.ok && info.units.bad.units && info.units.good && info.units.plain, 'R8: «ریاضی‌کردن» asks for the unit of each factor when a product carries one derived unit (dimensions check) ' + JSON.stringify(info.units));

  // ---------- SYS پس از همه ----------
  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);

  delete info.rules; delete info.bind.u;
  console.log(JSON.stringify(info).slice(0, 6000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
