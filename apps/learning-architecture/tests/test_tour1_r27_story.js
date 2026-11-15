// تورِ پولیا (دستهٔ ۱، دورِ ۲۷، سهمِ «story»: R5 🎯 و R6 پرونده‌بندیِ چند مسئله) — قرمزِ نخست با جمله‌های خودِ دونده‌ها (ctl/cN.json ِ T/round27X)، هر مثبت با بدلِ منفیِ خودش.
//  C53: اطمینانِ عددی کنارِ پیامدی در آینده همان لحظه 🎯 می‌سازد، زیرِ مسئلهٔ همان نوبت؛ سرانجامِ روشنی که با یک 🎯 ِ باز جور است آن را می‌بندد؛ «حل شد» فقط 🎯 ِ «حل شدن» را.
//  C30: بازگشت با نام (حتی نامِ کوتاهِ «مهره‌ها») همان پیام را می‌بندد، بی تأخیر؛ نامی که به مسئلهٔ کنونی بیشتر می‌خورد جابه‌جایی نیست.
//  LLA_FILE = ساختِ دیگر (قرمزِ نخست: ساختِ BASE27)؛ ONLY=<نامِ بخش‌ها با ویرگول>. ساعتِ صفحه دست نمی‌خورد و هیچ تاریخِ تقویمی در انتظارها نیست.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0 };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__noNav = true;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => { __calls.push({ user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
    window.__turn = async (text, actions) => { const n0 = __calls.length; __q.push({ reply: 'خوب.', status: 'related', memory: 'm', actions: actions || [] }); await APP.ASSIST.send(text); __q.length = 0;
      const c = __calls.slice(n0).filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {}; return String(c.user || '').split('# نوبتِ تازه')[0]; };
    window.__fresh = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc', 'ex'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__mk = (t, st) => APP.liveCreate(t, st, 'find', { by: 'user', sess: __cur().id }).p.id;
    window.__dos = (pid) => { try { const d = APP.dossier(pid); return (d.events || []).map(e => (e.title || '') + ' ¦ ' + (e.lines || []).join(' ¦ ') + ' ¦ ' + (e.out || '')); } catch (e) { return ['ERR ' + e]; } };
    window.__sdos = (pk) => { try { const d = APP.dossierSess(__cur().id, pk); return (d.events || []).map(e => (e.title || '') + ' ¦ ' + (e.lines || []).join(' ¦ ') + ' ¦ ' + (e.out || '')); } catch (e) { return ['ERR ' + e]; } };
    window.__st = () => { const s = __cur(), C = s.coach || {}; return { lprob: s.lprob || '', focus: APP.STORY.focus26(s), probs: APP.STORY.probs26(s).map(x => ({ id: x.id, t: x.title })),
      fc: APP.S.all('fcast').filter(x => !x.sample).map(x => ({ id: x.id, q: x.q, p: x.p, due: x.due || '', out: x.outcome || '', prob: x.prob || null })),
      preds: (C.preds || []).map(x => ({ t: x.text, p: x.p, out: x.out ? x.out.res : '' })), ask: s.predAsk && s.predAsk.state === 'open' ? s.predAsk.kind : '', sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text) }; };
  });
  const turn = (t) => p.evaluate((t) => __turn(t, []), t);
  const st = () => p.evaluate(() => __st());
  const J = (x) => JSON.stringify(x);
  const fresh1 = () => p.evaluate(() => { __wipe(); __fresh(); const pid = __mk('مسئلهٔ آزمون', 'یه مسئلهٔ واقعی دارم که باید حلش کنم و ببینم چی میشه.'); APP.liveBindSession(pid, __cur(), { force: true }); return pid; });
  const K = {};

  /* ---------- R5 / C53: ساختِ 🎯 همان لحظه، زیرِ مسئلهٔ زنده (جمله‌های دونده‌های A، B، C، D) ---------- */
  const ONE = [
    ['A aA3 p7', 'فکر می‌کنم بگوید نیم ساعت اشکالی ندارد؛ هفتاد درصد مطمئنم. بله، لطفاً فردا یادم بیندازید.', 70],
    ['A aA4 p8', 'واحدها را نگاه کردم: همه را به سانت نوشته‌ام و ۶ متر یعنی ۶۰۰ سانت؛ به متر هم همان درمی‌آید. فکر می‌کنم ۱۵ سانت اضافه بماند، چون ۶۰۰ منهای ۵۸۵ می‌شود ۱۵؛ نود درصد مطمئنم، مگر این‌که فروشنده کج ببُرد.', 90],
    ['A oA1 p12', 'پیش‌بینیم: گزارشِ مالیشون باثباته، حدودِ ۷۰٪ مطمئنم. تا یکشنبه با اون دو نفر حرف می‌زنم و گزارش رو می‌خونم، بعد برمی‌گردم.', 70],
    ['A s01 p19', 'فکر کنم سالِ دوم حدودِ ۳۷ درصد بشه، هشتاد درصد مطمئنم.', 80],
    ['B aB3 p9 (U49)', '۲۵۰ رو می‌ذارم سپرده‌ی یک‌ساله، ۵۰ دم دست. و هر شش ماه یه بار دوباره همین حساب رو با عددای واقعی می‌کنم؛ اولیش ۱ اردیبهشت. ۷۰ درصد مطمئنم تا اون موقع کسری از سود کمتره.', 70],
    ['B oB1 p30 (U49)', 'برای شام هم: این هفته ۵ شب از ۷ شامِ سبک می‌خورم، ۸۰ درصد مطمئنم.', 80],
    ['B s19 p9', 'فکر می‌کنم جلسه‌ی اول خسته می‌شم ولی می‌رم، هفتاد درصد مطمئنم. امروز هم ۴۰ دقیقه پیاده‌روی رفتم.', 70],
    ['D pwD1 p5', 'پیش‌بینیم: درصدِ فراموشیم حدودِ ۸ درصد درمیاد، ۶۰ درصد مطمئنم.', 60],
    ['D pwD2 p7 (D27-14)', 'پیش‌بینیم: برای هر دو کار می‌کنه، ۷۰ درصد مطمئنم. اگه یکی کار نکرد، بازه رو بزرگ‌تر نمی‌کنم که حدس رو نجات بدم؛ ردشده می‌دونمش و دنبالِ ساختارِ دیگه می‌گردم.', 70],
  ];
  ONE.forEach(([nm, s, pc], i) => { K['C53_one_' + (i + 1)] = async () => { const A = await fresh1(); await turn(s); const S = await st(), D = await p.evaluate((A) => __dos(A), A);
    const f = S.fc.filter(x => x.p === pc);
    return [f.length === 1 && S.fc.length === 1 && f[0].prob && f[0].prob.pid === A && D.filter(x => /🎯/.test(x) && x.indexOf(String(pc).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])) >= 0).length === 1, nm + ' ' + J([S.fc, D.filter(x => /🎯/.test(x))])]; }; });
  /* چند پیش‌بینی در یک پیام: هر کدام 🎯 ِ خودش، متنِ بی سرِ پیام و بی شمارندهٔ چسبیده (C27-20 pwC2 p27، D27-31 arD2 p7، A s05 p14) */
  const MULTI = [
    ['C pwC2 p27 (C27-20)', 'قبل از حسابِ مهره‌ها دو تا پیش‌بینی می‌کنم: احتمالِ دو قرمز حدودِ ۳۰٪ درمیاد، ۶۰ درصد مطمئنم. و اگه تاس رو ۶۰ بار بندازم حدودِ ۱۰ بار جمع ۷ میاد، ۷۰ درصد مطمئنم.', [60, 70], /قبل از حساب|پیش‌بینی می‌کنم|^و /],
    ['D arD2 p7 (D27-31)', 'دو تا پیش‌بینی هم بنویسم: یک، حصار تا آخرِ آبان تموم میشه — هفتاد درصد مطمئنم. دو، برقِ چراغ‌ها ماهی زیرِ ۵۰ هزار تومن درمیاد — پنجاه‌پنجاه.', [70, 50], /(?:^|\s)دو$|^یک|^دو،|بنویسم/],
    ['A s05 p14', 'دو تا پیش‌بینیِ تازه دارم: مدیرم تا جمعه درخواستِ دوره رو تأیید می‌کنه (۷۰٪)، و همکارم رضا هم تا جمعه ثبت‌نام می‌کنه (۴۰٪).', [70, 40], /تازه دارم|^و /],
  ];
  MULTI.forEach(([nm, s, pcs, bad], i) => { K['C53_multi_' + (i + 1)] = async () => { await fresh1(); await turn(s); const S = await st();
    const ok = S.fc.length === 2 && pcs.every(pc => S.fc.filter(x => x.p === pc).length === 1) && S.preds.length === 2 && S.preds.every(x => !bad.test(x.t.replace(/؛.*$/, '').trim()) && !/مطمئنم\.\s*دو/.test(x.t));
    return [ok, nm + ' ' + J([S.fc.map(x => [x.q, x.p]), S.preds])]; }; });
  /* بدلِ منفی: واژهٔ مبهم بی عدد (C37) و درصدِ داده (قسط) 🎯 نمی‌سازند */
  K.C53_neg_vague = async () => { await fresh1(); await turn('فکر کنم مدیرم فردا جواب بده.'); const S = await st(); return [S.fc.length === 0, J(S.fc)]; };
  K.C53_neg_datum = async () => { await fresh1(); await turn('قسطش ۴۲٪ درآمد میشه.'); const S = await st(); return [S.fc.length === 0 && S.preds.length === 0, J([S.fc, S.preds])]; };
  /* یک پیش‌بینی، یک 🎯: موعدی که بعدتر آمد روی همان 🎯 ِ بی‌موعد می‌نشیند، نه رکوردِ دوم */
  K.C53_one_record = async () => { await fresh1(); await turn('پیش‌بینیم: درصدِ فراموشیم حدودِ ۸ درصد درمیاد، ۶۰ درصد مطمئنم.'); const S1 = await st();
    await p.evaluate(() => { const s = __cur(), x = s.coach.preds[0]; APP.PR.bookPred(s, x.text, x.at, x.key, x.by); const due = APP.addDays(APP.today(), 3); const f = APP.PR.fc27(s, x, due); x.fc = f.id; delete x.fc0; APP.S.put(s); });
    const S2 = await st(); return [S1.fc.length === 1 && S2.fc.length === 1 && S2.fc[0].id === S1.fc[0].id && !!S2.fc[0].due, J([S1.fc, S2.fc])]; };

  /* ---------- R5 / C53: سرانجام ---------- */
  // pwC2 p23–p29: سه مسئله؛ دو پیش‌بینی، هر کدام زیرِ مسئلهٔ خودش؛ «مهره‌ها رو حساب کردم … درست درومد» ⇒ همان یکی «شد» و کانون «مهره‌ها»؛ «۱۱ بار» ⇐ «حدودِ ۱۰ بار» ⇒ صفحه می‌پرسد
  const pwC2 = async () => { await p.evaluate(() => { __wipe(); __fresh(); const pid = __mk('احتمالِ بیماری', 'یه بیماری تو ۱٪ مردم هست. آزمایشش ۹۰٪ بیمارها رو درست مثبت نشون میده. احتمالِ بیمار بودن چقدره؟'); APP.liveBindSession(pid, __cur(), { force: true }); });
    await turn('یه مسئلهٔ دیگه هم از همون دوره دارم: دو تا تاس می‌ندازیم، احتمالِ این‌که جمعشون ۷ بشه چقدره؟');
    await turn('و یه سومی: از یه کیسه با ۳ مهرهٔ قرمز و ۲ آبی دو تا مهره بی‌جایگذاری برمی‌داریم؛ احتمالِ این‌که هر دو قرمز باشن؟');
    await turn('برگردیم به مسئلهٔ تاس: حالت‌ها رو شمردم، ۶ حالت از ۳۶ تا، یعنی ۶/۳۶ = ۱/۶.'); };
  const idOf = (S, re) => (S.probs.filter(x => re.test(x.t))[0] || {}).id;
  K.C53_pwC2 = async () => { await pwC2(); const S0 = await st(), dice = idOf(S0, /تاس/), marb = idOf(S0, /مهره/);
    await turn('قبل از حسابِ مهره‌ها دو تا پیش‌بینی می‌کنم: احتمالِ دو قرمز حدودِ ۳۰٪ درمیاد، ۶۰ درصد مطمئنم. و اگه تاس رو ۶۰ بار بندازم حدودِ ۱۰ بار جمع ۷ میاد، ۷۰ درصد مطمئنم.'); const S1 = await st();
    const fm = S1.fc.filter(x => x.p === 60)[0] || {}, fd = S1.fc.filter(x => x.p === 70)[0] || {};
    await turn('مهره‌ها رو حساب کردم: ۳/۵ × ۲/۴ = ۶/۲۰ = ۳/۱۰، یعنی ۳۰٪. درست درومد.'); const S2 = await st();
    await turn('تاس رو ۶۰ بار انداختم، ۱۱ بار جمع ۷ اومد.'); const S3 = await st();
    const m2 = S2.fc.filter(x => x.p === 60)[0] || {}, d2 = S2.fc.filter(x => x.p === 70)[0] || {}, d3 = S3.fc.filter(x => x.p === 70)[0] || {};
    return [S0.focus === dice && fm.prob && fm.prob.pk === marb && fd.prob && fd.prob.pk === dice && S2.focus === marb && m2.out === 'شد' && !d2.out && !d3.out && S3.ask === 'res' && /شد یا نشد/.test(S3.sys.slice(-1)[0] || '') && /اگه تاس/.test(S3.sys.slice(-1)[0] || ''),
      J([S0.focus, dice, marb, fm.prob, fd.prob, S2.focus, m2.out, d2.out, d3.out, S3.ask, S3.sys.slice(-2)])]; };
  // s05 p14–p19 (A27-11): «مدیرم امروز درخواستِ دوره‌م رو تأیید کرد!» ⇒ 🎯 ِ مدیر «شد»، رضا باز؛ «اون یکی پیش‌بینیم درست درنیومد» ⇒ رضا «نشد»
  const s05 = async () => { await fresh1(); await turn('دو تا پیش‌بینیِ تازه دارم: مدیرم تا جمعه درخواستِ دوره رو تأیید می‌کنه (۷۰٪)، و همکارم رضا هم تا جمعه ثبت‌نام می‌کنه (۴۰٪).'); };
  K.C53_s05 = async () => { await s05(); await turn('خبر خوب: مدیرم امروز درخواستِ دوره‌م رو تأیید کرد!'); const S1 = await st(); await turn('اون یکی پیش‌بینیم درست درنیومد.'); const S2 = await st();
    const o = (S, pc) => (S.fc.filter(x => x.p === pc)[0] || {}).out;
    return [o(S1, 70) === 'شد' && !o(S1, 40) && o(S2, 40) === 'نشد' && o(S2, 70) === 'شد', J([S1.fc, S2.fc, S2.sys.slice(-2)])]; };
  K.C53_s05_neg_notDone = async () => { await s05(); await turn('امروز درخواستِ دوره رو برای مدیرم فرستادم.'); const S = await st(); return [S.fc.every(x => !x.out), J(S.fc)]; };
  K.C53_s05_neg_no = async () => { await s05(); await turn('مدیرم امروز درخواستِ دوره‌م رو تأیید نکرد.'); const S = await st(); const o = (pc) => (S.fc.filter(x => x.p === pc)[0] || {}).out; return [o(70) === 'نشد' && !o(40), J(S.fc)]; };
  // pwD1 p5–p7 (D27-13): «به نظرم این دیگه حل شد» جوابِ «شد یا نشد؟» ِ 🎯 ِ «درصدِ فراموشی» نیست
  K.C53_pwD1_solved = async () => { await fresh1(); await turn('پیش‌بینیم: درصدِ فراموشیم حدودِ ۸ درصد درمیاد، ۶۰ درصد مطمئنم.');
    await turn('سلام، برگشتم. سه روز آمار گرفتم: میانگینِ هر مرور ۸ ثانیه بود نه ۱۰، و درصدِ فراموشی ۱۵ درصد — از پیش‌بینیم خیلی بیشتر.'); const S1 = await st();
    await turn('فاصله می‌گه من حافظه‌م رو بهتر از اونی که هست فرض می‌کنم. به نظرم این دیگه حل شد.'); const S2 = await st();
    return [S1.ask === 'res' && S2.fc.length === 1 && S2.fc[0].out !== 'شد', J([S1.ask, S2.fc, S2.sys.slice(-2)])]; };
  // بدلِ مثبت: 🎯 ای که خودش دربارهٔ «حل شدن» است با «حل شد» بسته می‌شود
  K.C53_solved_pos = async () => { await fresh1(); await turn('پیش‌بینیم: این مسئله تا جمعه حل میشه، ۷۰ درصد مطمئنم.'); await turn('از پیش‌بینیم زودتر!'); const S1 = await st(); await turn('آره دیگه حل شد.'); const S2 = await st();
    return [S1.ask === 'res' && (S2.fc[0] || {}).out === 'شد', J([S1.ask, S2.fc, S2.sys.slice(-2)])]; };

  /* ---------- R6 / C30: بازگشت با نام، بی تأخیر ---------- */
  const oB1 = async () => { await p.evaluate(() => { __wipe(); __fresh();
      const A = __mk('بیداری ساعت ۶', 'سه ماهه هر صبح قرار می‌ذارم ساعت ۶ بیدار شم و یه ساعت مطالعه کنم، ولی هفته‌ای فقط دو روز موفق می‌شم.');
      const B = __mk('شامِ ساعت ۱۰ و بی‌خوابی', 'شب‌ها شام رو ساعت ۱۰ می‌خوریم و بعدش خوابم نمی‌بره.');
      APP.liveBindSession(B, __cur(), { force: true }); APP.liveBindSession(A, __cur(), { force: true }); window.__A = A; window.__B = B; }); return p.evaluate(() => [__A, __B]); };
  K.C30_oB1 = async () => { const [A, B] = await oB1();
    await turn('سلام، امروز جمعه‌ست. نتیجه‌ی آزمون شام: سه شب از چهار شب تا ۱۱:۳۰ خوابم برد.'); const S1 = await st();
    await turn('برگردیم به مسئله‌ی بیداری ساعت ۶: این هفته هم ادامه می‌دم.'); const S2 = await st();
    await turn('برگردیم به مسئله‌ی بیداری ساعت ۶: یه چیزی یادم اومد.'); const S3 = await st();
    return [S1.focus === B && S2.focus === A && S3.focus === A, J([A, B, S1.focus, S2.focus, S3.focus])]; };
  K.C30_neg_shared = async () => { const [A] = await oB1(); await turn('امروز ساعت ۶ بیدار شدم و یه ساعت خوندم.'); const S = await st(); return [S.focus === A, J([A, S.focus])]; };
  K.C30_neg_noname = async () => { const [A] = await oB1(); await turn('حساب کردم: پنج روز از هفت روز موفق بودم.'); const S = await st(); return [S.focus === A, J([A, S.focus])]; };

  /* ---------- R6 / C57: حسابِ کسِ دیگر (D27-8 arD1 p13) — «کارِ دیگری»، نه «نتیجه»، نه «اجرا +» ---------- */
  const csx = (o) => Object.assign({ do: 'coach_state', ans: [], said: [], stuck: false, fail: false, role: 'self', nat: 'objective' }, o);
  const turnA = (t, a) => p.evaluate(([t, a]) => __turn(t, a), [t, a]);
  K.C57_arD1 = async () => { const A = await p.evaluate(() => { __wipe(); __fresh(); const pid = __mk('مصرفِ بخاری', 'بخاریِ برقیِ اتاقم ماهی چقدر برق می‌بره و با قبضم می‌خونه یا نه؟'); APP.liveBindSession(pid, __cur(), { force: true }); return pid; });
    await turnA('نسخهٔ دومِ همین حساب‌ها رو برادرم نوشته بود، اینا رو هم ببین: ۱۳/۱۲ = ۱. ۱۳ ÷ ۱۲ = ۱. ۲۰ درصدِ ۳۰۰ میشه ۶۶. π × ۱۰² ≈ ۳۴۱. ۱ + ۲ + … + ۲۰ = ۲۲۰. ۲ میلیون × ۳ = ۶ هزار تومن.', [csx({ ph: 'b', said: ['result'], result: '۲۰ درصدِ ۳۰۰ میشه ۶۶' })]);
    const R = await p.evaluate((A) => { const s = __cur(); return { story: ((s.coach.story || {})['L:' + A] || { items: [] }).items.map(x => x.k + ':' + x.t), ev: (s.coachEv || []).filter(e => !e.wd && e.ok).map(e => e.ph + ':' + e.how), dos: __dos(A).filter(x => /نتیجه|کارِ دیگری|کارنامه/.test(x)) }; }, A);
    return [!R.story.some(x => /^res:/.test(x)) && R.story.some(x => /^other:/.test(x)) && !R.ev.some(e => /^c:/.test(e)) && R.dos.some(x => /کارِ دیگری/.test(x)) && !R.dos.some(x => /^نتیجه \(از گفت‌وگو\)/.test(x)), J(R)]; };
  // بدلِ منفی: حسابِ خودش در همان شکل نتیجهٔ خودش می‌ماند
  K.C57_neg_own = async () => { const A = await p.evaluate(() => { __wipe(); __fresh(); const pid = __mk('مصرفِ بخاری', 'بخاریِ برقیِ اتاقم ماهی چقدر برق می‌بره؟'); APP.liveBindSession(pid, __cur(), { force: true }); return pid; });
    await turnA('خودم دوباره حساب کردم: ۲ × ۶ × ۳۰ = ۳۶۰ کیلووات‌ساعت.', [csx({ ph: 'b', said: ['result'], result: '۲ × ۶ × ۳۰ = ۳۶۰ کیلووات‌ساعت' })]);
    const R = await p.evaluate((A) => ((__cur().coach.story || {})['L:' + A] || { items: [] }).items.map(x => x.k + ':' + x.t), A);
    return [R.some(x => /^res:/.test(x)) && !R.some(x => /^other:/.test(x)), J(R)]; };

  for (const k of Object.keys(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').some(o => k.indexOf(o) === 0)) continue; info.n++;
    try { const r = await K[k](); if (r[0]) info.ok++; else errors.push(k + ' ⇒ ' + String(r[1]).slice(0, 700)); } catch (e) { errors.push(k + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
