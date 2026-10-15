// حلِ مسئله از دلِ تونل‌های موجود (پوششِ «چگونه حلش کنیم»، ۲۰۲۶-۱۰-۱۵) — روی نسخهٔ مستقلِ ساخته‌شده (dist/learning-architecture.html):
//  ۱) دستیار هنگامِ حل مثلِ معلم: قلاب فقط وقتی کسی دارد مسئله حل می‌کند روشن است؛ یک پرسش در هر نوبت از فهرستِ ثابت و متناسب با مرحله؛
//     «حل شد» ⇒ پرسشِ بازنگری؛ ثبتِ فهم/بازنگری روی رکوردِ همان مسئله + کارتِ مرور؛ نشانه‌های تور برای وجهِ «مسئله»؛ پرامپتِ سامانه دست‌نخورده.
//  ۲) موفقیتِ کوچک بی آستانهٔ قراردادی ((k+1)/(n+2) < ½ و آخرین تلاش غلط) در قلاب و در کشوی تور (با پیوندِ گره‌گشا).
//  ۳) قابِ مسئلهٔ عملی در غربال (لایهٔ practical: جزءها از حرفِ خودِ کاربر، انباشته، پرسشِ بعدی، ایستگاهِ «مسئولیتِ معرفتی»).
//  ۴) «بیان دیگر» در حالتِ «مسئله» (تحلیل و ترکیب): فیلدهای شرطی، وارسیِ برگشت‌پذیری و برهانِ خلف، سفر S4/S8، کارتِ مرور.
//  ۵) شبیه‌سازهای دوره برای تکنیک‌های ۶، ۱۴، ۱۷، ۲۷ و بخشِ «کار از پایان به آغاز» ِ تکنیکِ ۱۱ (پیش‌مرگ‌نگری سرِ جایش).
//  و: هیچ‌جای بسته واژهٔ «پولیا» نیست (یکپارچه، نه سامانهٔ موازی).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const DIST = path.join(__dirname, '..', 'dist', 'learning-architecture.html');
const FILE = 'file://' + DIST;
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const chk = (c, m) => { if (!c) errors.push(m); };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav');
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = [];
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }) };
    APP.callAI = async (sys, user, opts) => { __calls.push({ sys, user }); const r = __q.shift(); if (r === undefined) throw new Error('no queued answer'); const t = typeof r === 'string' ? r : JSON.stringify(r); return opts && opts.withMeta ? { text: t, files: [] } : t; };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
  });

  // هیچ برچسب/متنِ تازهٔ این تغییرها نامِ «پولیا» ندارد (ارجاعِ کتاب‌شناختیِ پیشین در متنِ تکنیک‌ها و قلمرو دست نخورده)
  info.noName = await p.evaluate(() => {
    const AS = APP.ASSIST, P = APP.PM.P11.ws.filter(f => /^pa_|^pmode$/.test(f.k)), T = APP.TM[11].ws.filter(f => /^wb_/.test(f.k));
    const txt = JSON.stringify([AS.tutorQuestions, AS.practicalParts, AS.sieveLayers().filter(L => L.id === 'practical'), P.map(f => [f.l, f.h, f.opts, f.cols]), T.map(f => [f.l, f.h, f.cols]),
      [6, 14, 17, 27].map(i => [APP.COURSE_SIM[i].title, APP.COURSE_SIM[i].note])]);
    return { len: txt.length, polya: /پولیا|Polya|Pólya/i.test(txt) };
  });
  chk(info.noName.len > 2000 && !info.noName.polya, 'no new label or text is named after «پولیا»: ' + JSON.stringify(info.noName));

  // ---------- ۱) معلمِ حلِ مسئله ----------
  info.tutor = await p.evaluate(async () => {
    const AS = APP.ASSIST, P = window.EPI_PROBLEMS[0], pid = P.id, o = {};
    o.sysLen = AS.SYS.length; o.sysClean = !/معلمِ حلِ مسئله/.test(AS.SYS);
    APP.S.put({ id: 'eprob_' + pid, type: 'eprob', status: 'approved', p: P });
    const s = AS.newSession(); APP.S.put(s); AS.toggle(true);
    // جای دیگر (میزِ کار) ⇒ خاموش
    APP.go('e_home'); await new Promise(r => setTimeout(r, 120));
    __calls.length = 0; __q.push(R({})); await AS.send('سلام، این صفحه چه می‌کند؟');
    o.offElsewhere = !/# معلمِ حلِ مسئله/.test(__calls[0].user);
    // شبیه‌سازِ همان مسئله ⇒ روشن، مرحلهٔ «فهم»، یک پرسشِ پیشنهادی
    APP.simState = null; APP.go('e_prob', pid, 'sim'); await new Promise(r => setTimeout(r, 150));
    __calls.length = 0; __q.push(R({ actions: [{ do: 'tutor_mark', phase: 'und', q: 'مجهول چیست؟', text: 'مجهول همان حرکتِ بعدی است؛ داده وضعِ دانشِ آن زمان؛ شرط این‌که با ابزارِ همان زمان باشد.', self: 2 }] }));
    await AS.send('نمی‌دونم از کجا شروع کنم');
    const u1 = __calls[0].user;
    o.on = /# معلمِ حلِ مسئله/.test(u1); o.und = /مرحله: فهمِ مسئله/.test(u1); o.oneQ = /فقط \*\*یک\*\* پرسش/.test(u1) && /پرسشِ پیشنهادیِ این نوبت: «مجهول/.test(u1);
    o.noLead = /پرسشِ لودهنده ممنوع/.test(u1) && /انگیزهٔ همان گام/.test(u1) && /هیچ پرسشی بی‌دلیل/.test(u1) && /به پایان بنگر/.test(u1);
    o.sysSame = __calls[0].sys.length === __calls[0].sys.length && !/# معلمِ حلِ مسئله/.test(__calls[0].sys);
    const pg = APP.S.get('eprog_' + pid);
    o.undSaved = !!(pg && pg.tut && pg.tut.und && pg.tut.und.length === 1 && pg.tut.und[0].self === 2);
    o.phaseUnd = AS.probPhaseOf(pid).und;
    // پیامِ تازه ⇒ پرسشِ بعدیِ همان فهرست (همان چند پرسش، به ترتیب) — مرحله حالا «طرح»
    __calls.length = 0; __q.push(R({})); await AS.send('خب داده‌ها را نوشتم');
    o.plan = /مرحله: طرح‌ریزی/.test(__calls[0].user) && /پرسشِ پیشنهادیِ این نوبت: «پیش‌تر همین را/.test(__calls[0].user);
    __calls.length = 0; __q.push(R({})); await AS.send('هنوز هیچ ایده‌ای ندارم');
    o.plan2 = /پرسشِ پیشنهادیِ این نوبت: «به مجهول نگاه کن/.test(__calls[0].user);
    // «حل شد» ⇒ همیشه یک پرسشِ بازنگری؛ پاسخ ⇒ کارتِ مرورِ فردا
    const nCards = APP.S.all('card').length;
    __calls.length = 0; __q.push(R({ actions: [{ do: 'tutor_mark', phase: 'back', q: 'می‌توانی نتیجه را وارسی کنی؟', text: 'در حالتِ خاصِ n=1 هم درست درآمد.', self: 1 }] }));
    await AS.send('حلش کردم!');
    const u2 = __calls[0].user;
    o.back = /مرحله: بازنگری/.test(u2) && /همیشه\*\* یک پرسشِ بازنگری/.test(u2);
    const cards = APP.S.all('card'); const c = cards.filter(x => x.src && /^tutor:back/.test(x.src))[0];
    o.card = cards.length === nCards + 1 && !!c && c.due === APP.addDays(APP.today(), 1) && /بازنگری/.test(c.q);
    o.phaseBack = AS.probPhaseOf(pid).back;
    // «فرض کن حل شده» بازنگری نیست
    o.notSolved = AS.tutorPhase({ kind: 'prob', pid: 'zz' }, 'فرض کن حل شده؛ از کجا لازم می‌آید؟') !== 'back';
    // نشانه‌های تورِ وجهِ «مسئله» از خودِ رکورد
    const ms = AS.tourMilestones({ kind: 'problem', refs: [{ type: 'eprob', id: 'eprob_' + pid }] });
    o.msUnd = ms.some(m => /فهمِ مسئله/.test(m.t) && m.ok && m.mine); o.msBack = ms.some(m => /بازنگری پس از حل/.test(m.t) && m.ok && m.mine);
    const ms0 = AS.tourMilestones({ kind: 'problem', refs: [{ type: 'eprob', id: 'eprob_nope' }] });
    o.msOff = !ms0.some(m => /فهمِ مسئله|بازنگری پس از حل/.test(m.t) && m.ok);
    // موقعیتِ گره‌گشا از نوعِ مسئله ⇒ روشن؛ موقعیتِ عادی ⇒ خاموش
    APP.S.put({ id: 'kc_pr', type: 'kcase', title: 'گیر در گامِ ۲', kinds: ['problem'], intake: {}, root: {}, knots: [] });
    APP.S.put({ id: 'kc_x', type: 'kcase', title: 'دعوا با همکار', kinds: ['situation'], intake: {}, root: {}, knots: [] });
    APP.state = Object.assign(APP.state, { view: 'kcase', arg: 'kc_pr' }); o.kcOn = !!AS.solvingCtx(s) && AS.tutorPhase(AS.solvingCtx(s), 'x') === 'und';
    APP.state = Object.assign(APP.state, { view: 'kcase', arg: 'kc_x' }); o.kcOff = !AS.solvingCtx(s);
    return o;
  });
  const T = info.tutor;
  chk(T.sysClean && T.sysLen < 20000, 'system prompt untouched and within 20k: ' + T.sysLen);
  chk(T.offElsewhere, 'tutor hook must stay silent outside problem solving');
  chk(T.on && T.und && T.oneQ && T.noLead && T.sysSame, 'tutor hook on in the simulator: phase «understand», one suggested question, no leading question, motive: ' + JSON.stringify(T));
  chk(T.undSaved && T.phaseUnd, 'tutor_mark und stored on eprog_<pid>.tut with the user self-score');
  chk(T.plan && T.plan2, 'same fixed question list advances one question per new user message: ' + JSON.stringify([T.plan, T.plan2]));
  chk(T.back && T.card && T.phaseBack, '«حل شد» ⇒ looking-back question; its answer becomes a review card due tomorrow: ' + JSON.stringify([T.back, T.card, T.phaseBack]));
  chk(T.notSolved, '«فرض کن حل شده» must not trigger looking back');
  chk(T.msUnd && T.msBack && T.msOff, 'problem-facet milestones read understanding + looking back from the record: ' + JSON.stringify([T.msUnd, T.msBack, T.msOff]));
  chk(T.kcOn && T.kcOff, 'knot situation of kind problem turns the tutor on; other situations do not');

  // ---------- ۲) موفقیتِ کوچک ----------
  info.win = await p.evaluate(async () => {
    const AS = APP.ASSIST, pid = window.EPI_PROBLEMS[0].id, o = {}, st = window.EPI_PROBLEMS[0].stages;
    const pg = APP.S.get('eprog_' + pid); const t0 = Date.now(), at = i => new Date(t0 + i * 1000).toISOString();
    const set = (L) => { pg.lv = { 1: {} }; L.forEach((ok, i) => { pg.lv[1][st[i].id] = { first: ok, at: at(i) }; }); APP.S.put(pg); };
    APP.simState = { pid: pid, lv: 1, order: 'hist', i: 1 };
    set([false]); const w1 = AS.smallWin(pid); o.one = !!w1 && w1.k === 0 && w1.n === 1;               // (0+1)/(1+2) = ⅓ < ½، آخرین غلط
    set([true, false]); o.even = AS.smallWin(pid) === null;                                            // (1+1)/(2+2) = ½ — کمتر نیست
    set([false, false, true]); o.afterWin = AS.smallWin(pid) === null;                                 // ⅖ ولی آخرین تلاش درست بود
    APP.go('e_prob', pid, 'sim'); await new Promise(r => setTimeout(r, 100));
    __calls.length = 0; __q.push(R({})); await AS.send('این یکی درست شد'); o.joy = /لذتِ کشف/.test(__calls[0].user) && !/موفقیتِ کوچک/.test(__calls[0].user);
    set([false, true, true, false, false]); const w = AS.smallWin(pid);                                // (2+1)/(5+2) = 3/7 < ½
    o.fires = !!w && w.k === 2 && w.n === 5 && Math.abs(w.p - 3 / 7) < 1e-9;
    APP.go('e_prob', pid, 'sim'); await new Promise(r => setTimeout(r, 120));
    const s = AS.cur(); __calls.length = 0; __q.push(R({})); await AS.send('باز هم غلط شد');
    o.inPrompt = /موفقیتِ کوچک/.test(__calls[0].user) && /\(k\+1\)\/\(n\+2\)/.test(__calls[0].user) && /هیجان و انگیزه/.test(__calls[0].user) && /بی‌دلداریِ کلیشه‌ای/.test(__calls[0].user);
    AS._turnSession = s; AS.DO.tour_plan({ goal: 'حل', facets: [{ key: 'f1', kind: 'problem', title: 'مسئله' }] }); AS.DO.tour_link({ facet: 'f1', id: 'eprob_' + pid }); APP.S.put(s);
    const dr = AS.tourDrawer(s); const row = dr.querySelector('.as-win');
    o.drawer = !!row && /تمرین‌های هم‌خانواده/.test(row.textContent) && /هیجان و انگیزه/.test(row.textContent) && row.querySelectorAll('button').length >= 2;
    // تور با وجهِ «مسئله» ِ «همین حالا» ⇒ قلاب حتی بیرون از صفحهٔ مسئله روشن است
    APP.go('e_home'); await new Promise(r => setTimeout(r, 80)); o.tourCtx = !!AS.solvingCtx(s) && AS.solvingCtx(s).pid === pid;
    s.tour = null; APP.S.put(s);
    return o;
  });
  const W = info.win;
  chk(W.one && W.afterWin && W.even && W.fires, 'small win fires only when (k+1)/(n+2) < ½ and the last try failed: ' + JSON.stringify(W));
  chk(W.inPrompt && W.drawer && W.tourCtx && W.joy, 'small win in the prompt (hope without cliché, emotion/motivation) and in the tour drawer with a knot link: ' + JSON.stringify(W));

  // ---------- ۳) قابِ مسئلهٔ عملی در غربال ----------
  info.pract = await p.evaluate(async () => {
    const AS = APP.ASSIST, o = {};
    o.layer = AS.sieveLayers().some(L => L.id === 'practical');
    APP.go('e_home'); await new Promise(r => setTimeout(r, 80));
    const s = AS.newSession(); AS._turnSession = s; AS.DO.tour_plan({ goal: 'تصمیمِ خرید', facets: [{ key: 'f1', kind: 'claim', title: 'تصمیمِ خرید' }] }); APP.S.put(s);
    AS.DO.tour_diag({ layers: [{ id: 'practical', st: 'found', why: 'می‌خواهم بین دو ماشین تصمیم بگیرم', parts: { unknown: 'کدام ماشین برای رفت‌وآمدِ روزانه', bogus: 'x' } }] });
    AS.DO.tour_diag({ layers: [{ id: 'practical', st: 'found', why: 'بودجه‌ام محدود است', parts: { cond: 'بودجه تا سقفِ پس‌انداز' } }] });
    const d = s.tour.diag.practical; o.merged = d.parts.unknown && d.parts.cond && !d.parts.bogus;
    __calls.length = 0; __q.push(R({})); AS.toggle(true); await AS.send('خب');
    const u = __calls[0].user;
    o.prompt = /# قابِ مسئلهٔ عملی/.test(u) && /یکی\*\* از مانده‌ها را بپرس/.test(u) && /«داده: چه داری/.test(u) && /مسئولیتِ معرفتی/.test(u);
    const dr = AS.tourDrawer(s); o.drawer = dr.querySelectorAll('.as-pract li').length === 6 && dr.querySelectorAll('.as-pract li.ok').length === 2;
    AS.DO.tour_diag({ layers: [{ id: 'practical', st: 'found', why: 'همه', parts: { data: 'دو آگهی', vague: '«به‌صرفه» یعنی هزینهٔ ماهانه', ignore: 'رنگ را کنار می‌گذارم؛ تا دو بازدید', approx: 'تفاوتِ کمتر از هزینهٔ یک ماه' } }] });
    __calls.length = 0; __q.push(R({})); await AS.send('بقیه را هم گفتم');
    o.full = /قاب کامل است/.test(__calls[0].user);
    const pc = APP.S.get(s.tour.diag.practical.card); o.card = !!pc && pc.src === 'sieve:practical' && pc.due === APP.addDays(APP.today(), 1) && /تقریبِ کافی/.test(pc.q);
    // لایهٔ «رد شد» ⇒ قلاب خاموش
    AS.DO.tour_diag({ layers: [{ id: 'practical', st: 'no', why: 'مسئلهٔ عملی‌ای در کار نیست' }] });
    __calls.length = 0; __q.push(R({})); await AS.send('باشه');
    o.off = !/# قابِ مسئلهٔ عملی/.test(__calls[0].user);
    return o;
  });
  chk(info.pract.layer && info.pract.merged && info.pract.prompt && info.pract.drawer && info.pract.full && info.pract.card && info.pract.off, 'practical-problem frame in the sieve: ' + JSON.stringify(info.pract));

  // ---------- ۴) «بیان دیگر» در حالتِ «مسئله» (تحلیل و ترکیب) ----------
  info.pap = await p.evaluate(async () => {
    const o = {}, ws = APP.PM.P11.ws, K = ws.map(f => f.k);
    o.fields = ['pmode', 'pa_goal', 'pa_chain', 'pa_end', 'pa_check', 'pa_synth', 'pa_synth_check', 'descent', 'ascent'].every(k => K.indexOf(k) >= 0);
    o.order = K.indexOf('pa_chain') < K.indexOf('i3') && K.indexOf('pa_synth') > K.indexOf('i4') && K.indexOf('pa_synth') < K.indexOf('i5');
    const d = { fruit: 'ثابت کن جذرِ ۲ گویا نیست' }, host = document.createElement('div'); document.body.appendChild(host);
    const w = APP.renderWS(ws, d, () => {}, { prefix: 'tpa' }); host.appendChild(w);
    const shown = k => { const e = w.querySelector('[data-k="' + k + '"]'); return !!e && e.style.display !== 'none'; };
    o.conceptMode = shown('descent') && !shown('pa_chain') && w._validate().some(m => /فرود از میوه/.test(m)) && !w._validate().some(m => /از آخر به عقب/.test(m));
    const sel = w.querySelector('[data-k="pmode"] select'); sel.value = sel.options[2].value; sel.dispatchEvent(new Event('change'));
    o.problemMode = !shown('descent') && shown('pa_chain') && !shown('ascent') && shown('pa_synth');
    const miss = w._validate(); o.reqSwap = !miss.some(m => /فرود از میوه|بازسازی رو به بالا/.test(m)) && miss.some(m => /از آخر به عقب/.test(m)) && miss.some(m => /\[ترکیب\]/.test(m));
    d.pa_chain = [{ now: 'جذرِ ۲ = p/q با p و q بی عاملِ مشترک', prev: 'p² = 2q²', rev: 'برگشت‌پذیر: هم‌ارزند', why: 'ضرب در q²' }, { now: 'p² = 2q²', prev: 'p زوج است', rev: 'یک‌سویه: فقط این ⇐ پیشین', why: 'مربعِ فرد فرد است' }];
    d.pa_end = 'به تناقض رسید (فرضِ حل‌شدن ناممکن است)';
    sel.dispatchEvent(new Event('change'));
    const ck = w.querySelector('[data-k="pa_check"]').textContent;
    o.check = /یک‌سویه/.test(ck) && /برهانِ خلف/.test(ck) && !!w.querySelector('[data-k="pa_check"] .pa-contra');
    d.pa_chain[1].rev = 'برگشت‌پذیر: هم‌ارزند'; d.pa_end = 'به چیزی دانسته یا داده‌شده رسید'; d.pa_known = 'هر عدد یا زوج است یا فرد'; sel.dispatchEvent(new Event('change'));
    o.reversibleOk = /همهٔ حلقه‌ها برگشت‌پذیرند/.test(w.querySelector('[data-k="pa_check"]').textContent);
    d.pa_synth = ['p زوج است', 'p² = 2q²', '']; sel.dispatchEvent(new Event('change'));
    const sc = w.querySelector('[data-k="pa_synth_check"]'); o.synth = /ترکیب هم‌اندازهٔ تحلیل/.test(sc.textContent);
    const n0 = APP.S.all('card').length; sc.querySelector('.pa-mkcard').click(); o.card = APP.S.all('card').length === n0 + 1 && !!d.pa_card;
    host.remove();
    // سفر: S4/S8 از حالتِ «مسئله» پذیرفته می‌شوند
    const tp = APP.S.put({ id: APP.uid('tp'), type: 'topic', title: 'گنگ‌بودنِ جذرِ ۲', kind: 'میوه' });
    APP.S.put({ id: APP.uid('pr'), type: 'pr', pid: 'P11', topic: tp.id, status: 'draft', data: { fruit: 'جذرِ ۲', pmode: sel.options[2].value, pa_chain: d.pa_chain, pa_synth: ['p زوج است'] } });
    const ps = APP.pipelineStatus(tp); o.pipe = ps.S4 && ps.S8;
    APP.go('journey', tp.id, 'S4'); await new Promise(r => setTimeout(r, 150));
    const vis = k => { const e = document.querySelector('main .jr-now [data-k="' + k + '"]'); return !!e && e.style.display !== 'none'; };
    o.journey = vis('pa_chain') && !vis('descent');
    // در نمای سفر، قلابِ معلم هم روشن است (حالتِ «مسئله»)
    o.tutorJourney = !!APP.ASSIST.solvingCtx(APP.ASSIST.cur()) && APP.ASSIST.solvingCtx(APP.ASSIST.cur()).kind === 'pappus';
    return o;
  });
  chk(info.pap.fields && info.pap.order, 'P11 problem-mode fields exist in the S4 and S8 parts');
  chk(info.pap.conceptMode && info.pap.problemMode && info.pap.reqSwap, 'P11: problem mode swaps visible and required fields: ' + JSON.stringify(info.pap));
  chk(info.pap.check && info.pap.reversibleOk && info.pap.synth && info.pap.card, 'P11 problem mode: reversibility check, reductio branch, synthesis check, review card: ' + JSON.stringify(info.pap));
  chk(info.pap.pipe && info.pap.journey && info.pap.tutorJourney, 'journey S4/S8 accept the analysis/synthesis and show it: ' + JSON.stringify(info.pap));

  // ---------- ۵) شبیه‌سازهای دوره + بخشِ «کار از پایان» ِ تکنیکِ ۱۱ ----------
  await p.evaluate(() => APP.goRoot('start')); await p.locator('main .door.main .btn').click(); await p.waitForTimeout(200);
  await p.fill('#crsTopic', 'آزمون: شبیه‌سازهای حلِ مسئله'); await p.click('main .btn:has-text("شروعِ درسِ اول")'); await p.waitForTimeout(250);
  info.sims = {};
  for (const id of [6, 14, 17, 27]) {
    await p.evaluate(x => { const c = APP.courseState(); if (c) { c.warmSkip = APP.today(); APP.S.put(c); } APP.go('lesson', x, 's2'); }, id);
    await p.waitForTimeout(150);
    const sim = p.locator('main .crs-sim'); const r = { present: await sim.count() };
    if (!r.present) { info.sims[id] = r; errors.push('course sim missing ' + id); continue; }
    for (let i = 0; i < 80; i++) { const bt = sim.locator('button:not([disabled])').first(); if (!(await bt.count())) break; await bt.click(); await p.waitForTimeout(25); }
    r.right = await sim.locator('.sim-right').count(); r.no = await sim.locator('.sim-fb.no').count(); r.spots = await sim.locator('.crs-spot').count();
    const full = await sim.textContent(); r.has = { second: /منبعِ دوم با همان ساختار/.test(full), fidelity: /آزمونِ وفاداری/.test(full), pred: /پیش‌بینیِ تو: «/.test(full) };
    info.sims[id] = r;
  }
  const S6 = info.sims[6], S14 = info.sims[14], S17 = info.sims[17], S27 = info.sims[27];
  chk(S6 && S6.right === 4 && S6.spots === 4 && S6.has.second, 'sim 6 (analogy: mapping, prediction, break point, heuristic not proof): ' + JSON.stringify(S6));
  chk(S14 && S14.right === 2 && S14.spots === 4 && S14.has.fidelity, 'sim 14 (reframing with the equivalence test): ' + JSON.stringify(S14));
  chk(S17 && S17.right === 4, 'sim 17 (special/limit case, boundary, more general easier problem): ' + JSON.stringify(S17));
  chk(S27 && S27.right === 3 && S27.has.pred, 'sim 27 (predict first, reductio, limit case): ' + JSON.stringify(S27));
  chk([6, 14].every(id => info.sims[id] && info.sims[id].no > 0), 'wrong mappings get keyed feedback too');
  info.t11 = await p.evaluate(() => { const t = APP.TM[11], K = t.ws.map(f => f.k), req = t.ws.filter(f => f.req).map(f => f.k);
    return { pre: ['inv', 'fails', 'rank', 'rules'].every(k => K.indexOf(k) >= 0), back: ['wb_end', 'wb_chain', 'wb_known', 'wb_fwd'].every(k => req.indexOf(k) >= 0), rev: !!t.ws.filter(f => f.k === 'wb_chain')[0].cols.filter(c => c.k === 'rev')[0], step: /پایان به آغاز/.test(t.steps[t.steps.length - 1]), rub: /از پایان به عقب/.test(t.rubric[t.rubric.length - 1]) }; });
  chk(info.t11.pre && info.t11.back && info.t11.rev && info.t11.step && info.t11.rub, 'technique 11 keeps the pre-mortem and gains a required working-backwards part: ' + JSON.stringify(info.t11));
  // کاربرگِ تکنیکِ ۱۱ در دوره (قدمِ ۳) همان بخش را نشان می‌دهد
  await p.evaluate(() => APP.go('lesson', 11, 's3')); await p.waitForTimeout(150);
  info.t11ui = await p.evaluate(() => ['wb_chain', 'wb_fwd', 'fails'].map(k => document.querySelectorAll('main [data-k="' + k + '"]').length).join(','));
  chk(info.t11ui === '1,1,1', 'technique 11 worksheet in the course shows both parts: ' + info.t11ui);

  console.log(JSON.stringify(info, null, 1));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
