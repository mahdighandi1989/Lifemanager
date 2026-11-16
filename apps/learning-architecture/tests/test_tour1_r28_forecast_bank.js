// تورِ پولیا (دستهٔ ۱، دورِ ۲۸، سهمِ «forecast»: R4 🎯) — بانکِ مستقلِ tests/variants/VARIANTS_R28.json: هر ورودیِ R4.forecast (۱-مبنا: #136–#177).
// ورودی‌ای که این سهم برآورده نمی‌کند در info.nc با دلیل می‌آید (هرگز بی‌صدا رد نمی‌شود، هرگز ویرایش نمی‌شود). جایی که روشن‌سازیِ DECISIONS_R28 (C102–C131) با
// ورودی ناسازگار است، روشن‌سازی برنده است و ناسازگاری همین‌جا گزارش می‌شود (#153 ⇐ C120).
// LLA_FILE = ساختِ دیگر؛ ONLY=<شماره‌ها با ویرگول>. هیچ تاریخِ تقویمی در انتظارها نیست (#160: ساعتِ صفحه دو روز جلو می‌رود، نسبت به امروزِ خودِ اجرا).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BF = process.env.LLA_VARIANTS || path.join(__dirname, 'variants', 'VARIANTS_R28.json');
const BANK = fs.existsSync(BF) ? JSON.parse(fs.readFileSync(BF, 'utf8')) : [];

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('dialog', d => { d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.clock.install({ time: new Date() });
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__q = []; window.__noNav = true;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => { let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
    window.__turn = async (text, reply) => { __q.push({ reply: reply || 'خوب.', status: 'related', memory: 'm', actions: [] }); await APP.ASSIST.send(text); __q.length = 0; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc', 'ex'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__live = () => { __wipe(); APP.go('home'); APP.ASSIST.newSession(); const pid = APP.liveCreate('مسئلهٔ زنده', 'یه کارِ واقعی دارم و می‌خوام ببینم چی میشه.', 'find', { by: 'user', sess: __cur().id }).p.id; APP.liveBindSession(pid, __cur(), { force: true }); return pid; };
    /* 🎯 ِ بازِ پیشین (پیش از این پیام، از حرفِ خودش) — همان راهِ صفحه: PR.bookPred با اطمینانِ همان بند */
    window.__seed = (text, pc, ago) => { const s = __cur(), at = new Date(Date.now() - (ago || 3600e3)).toISOString(); (s.msgs = s.msgs || []).push({ role: 'user', at, text: text + (pc != null ? '، ' + pc + ' درصد مطمئنم.' : '') });
      const x = APP.PR.bookPred(s, text, at, '', 'page', { p: pc, raw: text }); APP.S.put(s); return x && x.text; };
    window.__st = () => { const s = __cur(), C = s.coach || {}; return { fc: APP.S.all('fcast').filter(x => !x.sample).map(x => ({ q: x.q, p: x.p, out: x.outcome || '', pHist: (x.pHist || []).map(h => h.p) })),
      preds: (C.preds || []).map(x => ({ t: x.text, p: x.p, out: x.out ? x.out.res : '' })), ask: s.predAsk && s.predAsk.state === 'open' ? s.predAsk.kind : '', sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text) }; };
  });
  const turn = (t, reply) => p.evaluate(([t, r]) => __turn(t, r), [t, reply || '']);
  const st = () => p.evaluate(() => __st());
  const live = () => p.evaluate(() => __live());
  const seed = (t, pc) => p.evaluate(([t, pc]) => __seed(t, pc), [t, pc]);
  const J = (x) => JSON.stringify(x);
  const nz = (x) => String(x || '').replace(/[‌\s]+/g, ' ').trim();
  const fasys = (S, n0) => S.sys.slice(n0).filter(x => /🎯/.test(x));
  const E = {};
  /* ---------- ساخت (C90) ---------- */
  const one = (n, txt, pc, text, extra) => { E[n] = async () => { await live(); await turn(txt); const S = await st();
    const f = S.fc.filter(x => x.p === pc); const ok = S.fc.length === 1 && f.length === 1 && (!text || nz(f[0].q) === nz(text)) && (!extra || extra(S));
    return [ok, J([S.fc, fasys(S, 0)])]; }; };
  one(136, 'فکر کنم ۷۰ درصد مدیرم با مرخصیم موافقت می‌کنه', 70, 'مدیرم با مرخصیم موافقت می‌کنه', S => !S.sys.some(x => /حدس است/.test(x)));
  one(137, '۶۵ درصد شانس دارم تو مسابقه‌ی شطرنج سوم بشم', 65, 'تو مسابقه‌ی شطرنج سوم بشم');
  /* #138: نیمهٔ «پرسشِ روز نه» (R3) مالِ dates است (PR.datePend) — این‌جا فقط 🎯 سنجیده می‌شود؛ در گزارش آمده */
  one(138, 'به این که تا پنجشنبه جوابِ آزمایش بیاد ۸۰ درصد می‌دم', 80, 'تا پنجشنبه جوابِ آزمایش بیاد');
  one(139, 'احتمالش ۳۰ درصده که این ترم مشروط بشم', 30, 'این ترم مشروط بشم');
  one(140, 'هفتاد درصد مطمئنم که سه تا مقاله رو تا جمعه می‌فرستم', 70, 'سه تا مقاله رو تا جمعه می‌فرستم');
  one(141, '90% مطمئنم کلید رو پیدا می‌کنم', 90, 'کلید رو پیدا می‌کنم');
  E[142] = async () => { await live(); await turn('تقریباً مطمئنم که فردا جلسه کنسل میشه'); const S1 = await st(); await turn('آره، همین.'); const S2 = await st();
    const asks = S2.sys.filter(x => /چند درصد مطمئنی/.test(x)).length; return [S1.fc.length === 0 && asks === 1, J([S1.fc, fasys(S2, 0)])]; };
  E[143] = async () => { await live(); await turn('خیلی مطمئنم پروژه رو تحویل می‌گیرن'); const S1 = await st(); await turn('۸۵ درصد.'); const S = await st();
    return [S1.sys.some(x => /چند درصد مطمئنی/.test(x)) && S.fc.length === 1 && S.fc[0].p === 85 && nz(S.fc[0].q) === nz('پروژه رو تحویل می‌گیرن'), J([S.fc, fasys(S, 0)])]; };
  E[144] = async () => { await live(); await turn('می‌خوام تا جمعه دیوار رو رنگ کنم.', 'خوب. چقدر مطمئنی که تا جمعه دیوار رو رنگ کنی؟'); await turn('۶۰'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].p === 60 && nz(S.fc[0].q) === nz('تا جمعه دیوار رو رنگ کنم'), J([S.fc, fasys(S, 0)])]; };
  /* به‌روزرسانی (C90/C77) */
  E[145] = async () => { await live(); await seed('نمایشگاه رو تا آخرِ هفته تموم کنم', 70); await turn('نمایشگاه رو حالا ۵۰ درصد مطمئنم، نه ۷۰'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].p === 50 && J(S.fc[0].pHist) === '[70]' && S.sys.some(x => /۷۰٪/.test(x) && /🎯/.test(x)), J([S.fc, fasys(S, 0)])]; };
  E[146] = async () => { await live(); await seed('اثاث تا شنبه جمع بشه', 70); await turn('اثاث تا شنبه رو ۵۰ درصد می‌دم'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].p === 50 && J(S.fc[0].pHist) === '[70]' && !S.sys.some(x => /ثبت شد/.test(x)), J([S.fc, S.sys.slice(-3)])]; };
  E[147] = async () => { await live(); await turn('۸۰ درصد مطمئنم بارکش سرِ وقت میاد و ۶۰ درصد مطمئنم هیچ ظرفی نمی‌شکنه'); const S = await st();
    return [S.fc.length === 2 && S.fc.some(f => f.p === 80 && nz(f.q) === nz('بارکش سرِ وقت میاد')) && S.fc.some(f => f.p === 60 && nz(f.q) === nz('هیچ ظرفی نمی‌شکنه')), J(S.fc)]; };
  E[148] = async () => { await live(); await turn('احتمالِ قبولی تو دانشگاهِ اول ۷۰٪ و تو دومی ۹۵٪ ـه'); const S = await st();
    return [S.fc.length === 2 && S.fc.some(f => f.p === 70 && /اول/.test(f.q)) && S.fc.some(f => f.p === 95 && /دوم/.test(f.q)) && S.fc.every(f => nz(f.q).length >= 4), J(S.fc)]; };
  one(149, 'پنجاه‌پنجاه‌ه که تیم‌مون بره فینال', 50, 'تیم‌مون بره فینال');
  /* ---------- سرانجام (C91) ---------- */
  const settle = (n, seeds, msg, want, extra) => { E[n] = async () => { await live(); for (const [t, pc] of seeds) await seed(t, pc); const S0 = await st(); await turn(msg); const S = await st();
    const ok = want.every(([re, out]) => S.fc.some(f => re.test(f.q) && f.out === out)) && (!extra || extra(S, S0));
    return [ok, J([S.fc.map(f => [f.q, f.p, f.out]), fasys(S, S0.sys.length)])]; }; };
  settle(150, [['حداقل ۵ تا مشتری جدید بگیرم', 60]], 'شد ۳ تا', [[/مشتری/, 'نشد']], (S, S0) => !fasys(S, S0.sys.length).some(x => /شد یا نشد/.test(x)));
  settle(151, [['نمره‌م بالای ۱۶ بشه', 75]], '۱۷ و نیم شدم!', [[/نمره/, 'شد']], (S, S0) => !fasys(S, S0.sys.length).some(x => /شد یا نشد/.test(x)));
  settle(152, [['کلِ هفته ۲ تا باگ بیشتر پیدا نشه', 70]], 'پیش‌بینیم ۲ بود، شد ۴', [[/باگ/, 'نشد']], (S, S0) => !fasys(S, S0.sys.length).some(x => /⇐ شد/.test(x)));
  /* #153 ⇐ C120: «حدودِ ۸» ⇐ ۱۵ ⇒ صفحه می‌پرسد «این … حدودِ ۸ حساب می‌شود؟» — نه «شد یا نشد؟» ِ همیشگی، نه سکوت؛ با «نه» ⇒ نشد. ورودیِ بانک «نشد» ِ بی‌پرسش می‌خواهد. */
  E[153] = async () => { await live(); await seed('حدودِ ۸ درصد سود کنم', 60); const S0 = await st(); await turn('۱۵ درصد سود کردم — خیلی بیشتر از پیش‌بینیم'); const S1 = await st(); await turn('نه'); const S = await st();
    const ask = fasys(S1, S0.sys.length).some(x => /حدودِ ۸» حساب می‌شود/.test(x)), lapse = S.sys.some(x => /چیزی داوری نشد/.test(x));
    return [ask && !lapse && S.fc[0].out === 'نشد', J([S.fc, fasys(S, S0.sys.length)])]; };
  settle(154, [['امتحانِ شیمی بالای ۱۷ بشم', 90]], 'شیمی رو ۱۸ شدم، همون‌طور که با ۹۰ درصد گفته بودم', [[/شیمی/, 'شد']], S => S.fc.length === 1 && S.fc[0].pHist.length === 0);
  E[155] = async () => { await live(); await seed('مقاله تا جمعه تموم بشه', 70); await seed('ورزش رو هر روز برم', 70); await seed('کتاب رو تا ماهِ بعد بخونم', 70); await seed('وزنم به ۷۰ کیلو برسه', 40);
    const S0 = await st(); await turn('یکی از ۷۰ درصدی‌هام درست شد'); const S = await st(); const q = fasys(S, S0.sys.length).filter(x => /کدام پیش‌بینی/.test(x))[0] || '';
    return [S.ask === 'which' && /مقاله/.test(q) && /ورزش/.test(q) && /کتاب/.test(q) && !/وزنم/.test(q) && S.fc.every(f => !f.out), J([fasys(S, S0.sys.length), S.fc])]; };
  settle(156, [['۲۳ کارتن کافیه', 70], ['۲۲ کارتن کافیه', 40]], 'شد. پیش‌بینیِ ۲۳ کارتن درست درومد، ۲۲ تا غلط بود', [[/۲۳/, 'شد'], [/۲۲/, 'نشد']], S => S.ask !== 'which');
  /* #157 PAGE-LEVEL: «🎯 دفترِ پیش‌بینی» ⇒ داوری‌شده زیرِ «داوری‌شده»، نه در فهرستِ باز، بی «— هنوز —»؛ و در «امروز» و کارتِ ذهن هم باز نیست */
  E[157] = async () => { await live(); await seed('جلسه رو جابه‌جا کنن', 70); await turn('جلسه رو جابه‌جا کردن، درست درومد.');
    const v = await p.evaluate(async () => { APP.go('fcast'); await new Promise(r => setTimeout(r, 400)); const m = document.querySelector('#main');
      const open = [...m.querySelectorAll('.fc-openl li')].map(li => li.innerText), done = [...m.querySelectorAll('.fc-donel li')].map(li => ({ t: li.innerText, sel: (li.querySelector('select') || {}).value, hasYet: /هنوز —/.test(li.innerText) }));
      const due = (APP.dueList ? APP.dueList() : []).map(x => x.txt || '').filter(t => /جلسه رو جابه/.test(t));
      APP.go('home'); return { open, done, due }; });
    return [v.open.length === 0 && v.done.length === 1 && v.done[0].sel === 'شد' && /⇐ شد/.test(v.done[0].t) && !v.done[0].hasYet && v.due.length === 0, J(v)]; };
  E[158] = async () => { await live(); await turn('داداشم ۹۰ درصد مطمئنه ۲۳ تا بسه، من ۷۰ درصد'); const S = await st();
    return [S.fc.length === 1 && S.fc[0].p === 70 && /۲۳ تا بسه/.test(S.fc[0].q), J(S.fc)]; };
  settle(159, [['جواب‌ها تا پنجشنبه بیاد', 80]], 'جواب‌ها چهارشنبه اومد', [[/جواب/, 'شد']], (S, S0) => !fasys(S, S0.sys.length).some(x => /شد یا نشد/.test(x)));
  E[160] = async () => { await live(); await seed('جواب‌ها تا پنجشنبه بیاد', 80); await turn('جواب‌ها چهارشنبه اومد'); const S0 = await st();
    await p.clock.fastForward(2 * 864e5); await p.evaluate(() => { try { APP.render(); } catch (e) { } }); await turn('سلام.'); const S = await st();
    const due = await p.evaluate(() => (APP.dueList ? APP.dueList() : []).map(x => x.txt || '').filter(t => /جواب‌ها/.test(t)));
    return [S0.fc[0].out === 'شد' && !fasys(S, S0.sys.length).some(x => /شد یا نشد/.test(x)) && due.length === 0, J([S.fc, due])]; };
  one(161, 'احتمال می‌دم ۴۰ درصد که دخترم کلاسِ پیانو رو ادامه بده', 40);
  /* ---------- منفی‌ها ---------- */
  const none = (n, msg, seeds) => { E[n] = async () => { await live(); for (const [t, pc] of seeds || []) await seed(t, pc); const S0 = await st(); await turn(msg); const S = await st();
    const ok = S.fc.length === S0.fc.length && S.fc.every((f, i) => f.out === (S0.fc[i] || {}).out && f.p === (S0.fc[i] || {}).p) && !fasys(S, S0.sys.length).some(x => /شد یا نشد|⇐ (?:ن?شد)/.test(x));
    return [ok, J([S.fc, fasys(S, S0.sys.length)])]; }; };
  none(162, 'مربی گفت ۸۰ درصد می‌بریم');
  none(163, 'یه اشتباه کردم: اولش گفتم هر بسته ۲۰۰ گرمه، ۲۵۰ ـه', [['بسته‌ها تا جمعه برسه', 70]]);
  none(164, 'پارسال ۹۰ درصد مطمئن بودم قبول میشم و نشد', [['امسال تو کنکور قبول میشم', 70]]);
  none(165, 'دیدم، الان درست شد', [['شام سبک بخورم و زود بخوابم', 90]]);
  none(166, 'یه چیز قدیمی رو هم اصلاح کنم: اون شب مهمونی ساعت ۸ بود نه ۹', [['جلسه‌ی اول خسته می‌شم ولی می‌رم', 70]]);
  settle(167, [['مسئله رو تا فردا حل کنم', 70], ['نمره‌ی بالای ۱۵ بگیرم', 60]], 'حل شد', [[/مسئله/, 'شد']], S => S.fc.some(f => /نمره/.test(f.q) && !f.out));
  E[168] = async () => { await live(); await turn('دو تا پیش‌بینی: حصار تا آخرِ آبان تموم بشه، ۷۰ درصد مطمئنم؛ و چراغ‌ها زیرِ ۵۰ هزار تومن، ۵۰ درصد مطمئنم.'); await turn('خب، درست درومد!'); const S0 = await st();
    await turn('قسطِ آخرِ حصار رو سرِ برج میدم'); const S = await st(); return [S0.ask === 'which' && S.fc.every(f => !f.out), J([S.fc, fasys(S, S0.sys.length)])]; };
  none(169, '۷۰ درصدِ کلاس قبول شدن'); none(170, 'این کفش ۳۰ درصد تخفیف داره'); none(171, '۲۰٪ × ۳۰۰ = ۶۰');
  none(172, 'چرا هنوز ازم نپرسیدی پیش‌بینی‌م چی شد؟', [['پروژه تا جمعه تموم بشه', 70]]);
  E[173] = async () => { await live(); await seed('پروژه تا جمعه تموم بشه', 70); await turn('۷۰ درصد هم مطمئنم که مشتری راضی میشه'); const S = await st();
    return [S.fc.length === 2 && S.fc.some(f => /پروژه/.test(f.q) && f.p === 70 && !f.pHist.length) && S.fc.some(f => f.p === 70 && nz(f.q) === nz('مشتری راضی میشه')), J(S.fc)]; };
  E[174] = async () => { await live(); await seed('پروژه تا جمعه تموم بشه', 70); const S0 = await st(); await turn('پروژه تا جمعه تموم میشه، ۷۰ درصد مطمئنم'); const S = await st();
    return [S.fc.length === 1 && !S.fc[0].pHist.length && !fasys(S, S0.sys.length).some(x => /به‌روز شد|اصلاح شد/.test(x)), J([S.fc, fasys(S, S0.sys.length)])]; };
  none(175, 'امروز ۳ تا تماس داشتم', [['حداقل ۵ تا مشتری جدید بگیرم', 60]]);
  E[176] = async () => { await live(); await turn('امروز یه کم خسته‌م.', 'باشه. چند درصد مطمئنی؟'); await turn('۶۰'); const S = await st();
    return [S.fc.length === 0 && S.sys.some(x => /🎯/.test(x) && /کدام پیامد/.test(x)), J([S.fc, S.sys.slice(-2)])]; };
  none(177, 'خاله‌م گفت احتمالش ۵۰ درصده که بارون بیاد');

  const want = BANK.map((e, i) => [i + 1, e]).filter(([, e]) => e.rc === 'R4.forecast');
  for (const [n] of want) { if (process.env.ONLY && !process.env.ONLY.split(',').map(Number).includes(n)) continue; info.n++;
    if (!E[n]) { info.nc[n] = 'no case written'; continue; }
    try { const r = await E[n](); if (r && r.nc) { info.nc[n] = r.nc; continue; } if (r[0]) info.ok++; else errors.push('#' + n + ' ⇒ ' + String(r[1]).slice(0, 700)); } catch (e) { errors.push('#' + n + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  if (!BANK.length) info.nc.bank = 'VARIANTS_R28.json not found';
  console.log(JSON.stringify({ n: info.n, ok: info.ok, nc: Object.keys(info.nc).length }));
  console.log('NC: ' + JSON.stringify(info.nc, null, 1));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
