// بانکِ مستقلِ VARIANTS_R23 — هر ورودیِ Q4.corrections یک بررسی (برای tests/test_tour1_r23_correction.js؛ خودش آزمون نیست).
// هر بررسی همان نقشِ ورودی را اجرا می‌کند: [chat] نوبتِ واقعیِ دستیار با گزارشِ retract ِ مدلِ لفظی، [edit] ✏️ ِ کامل، [page] فیلدهای تایپ‌شدهٔ خودش،
// [events] حکم/حدس/نتیجه‌های وابسته. ورودی‌ها با شمارهٔ جایشان در فایلِ بانک (#n، ۰‌پایه) نام برده می‌شوند.
async function run(ctx) {
  const { ev, turn, head, bank, Q4 } = ctx;
  const out = { summary: { pass: 0, fail: 0, nc: 0, of: Q4.length }, nc: {}, fail: [] };
  const idx = (e) => bank.indexOf(e);
  const J = (x) => JSON.stringify(x);
  const RT = (o) => [{ do: 'coach_state', retract: o }];
  const CS = (o) => [Object.assign({ do: 'coach_state' }, o)];
  const GARBLE = /عروسی[^.،]{0,20}اسفنده برادرم مونده|۱\.۵\.۵|میلی‌گرمه میلی‌گرم/;
  /* سناریو: پیام‌های پیشینِ او ⇒ مسئلهٔ زنده (صورت از پیامِ او یا تایپ‌شدهٔ خودش) با رکوردهای تایپ‌شدهٔ خودش (from: page) */
  const scen = (o) => ev(async (o) => {
    __wipe(); __fresh(); if (o.pinned) { const s0 = __cur(); s0.pinned = o.pinned; APP.S.put(s0); }
    for (const t of (o.prior || [])) { if (typeof t === 'string') await __turn(t, 'خب.'); else await __turn(t.t, t.r || 'خب.', t.a || []); }
    const s = __cur(); let pid = '';
    if (o.live) { pid = o.live.typed ? __live(o.live.title || 'مسئلهٔ آزمون', o.live.stmt) : __live(o.live.title || 'مسئلهٔ آزمون', o.live.stmt || (typeof o.prior[0] === 'string' ? o.prior[0] : o.prior[0].t), { by: 'assistant', sess: s.id });
      APP.liveBindSession(pid, APP.S.get(s.id)); if (!o.live.typed) APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so, L) => { const u = o.live.u; if (u) so.u = { 1: Object.assign({ done: true, at: new Date().toISOString(), one: 'کلِ مسئله', u: 'مجهول', dl: [], c: '', type: 'find', nat: 'practical', from: 'page' }, u) };
        if (o.live.plan) L.plan = { t: o.live.plan, at: new Date().toISOString() };
        if (o.live.b) so.b = { 1: Object.assign({ done: true, from: 'page', at: new Date().toISOString() }, o.live.b) };
        if (o.live.g) so.g = { 1: Object.assign({ at: new Date().toISOString() }, o.live.g) };
        if (o.live.solved) { L.state = 'solved'; L.chat = { sess: s.id, at: new Date().toISOString(), solution: o.live.solved }; } }); }
    return pid;
  }, o);
  const snap = (pid) => ev((pid) => { const s = __cur(), r = pid && APP.S.get('eprob_' + pid), so = pid && APP.S.get('eprog_' + pid).solve;
    return { st: r ? r.p.statement : '', title: r ? r.p.title : '', asks: __asks(), pin: s.pinned || '', u: so && so.u && so.u[1] ? { dl: so.u[1].dl.map(x => x.t), one: so.u[1].one } : null, plan: so && so.live && so.live.plan ? so.live.plan.t : '',
      b: so && so.b && so.b[1] ? { v: so.b[1].verdict } : null, g: so && so.g && so.g[1] ? { t: so.g[1].guess, hit: so.g[1].hit || '', sup: !!so.g[1].outSup } : null, state: so && so.live ? so.live.state : '',
      cg: ((s.coach || {}).guesses || []).map(g => ({ id: g.id, t: g.text, r: g.res || '', rc: !!g.resRecheck })), res: (s.coach && s.coach.retNote || {}).res || null, ch: (s.coach && s.coach.retNote || {}).ch || [],
      acts: ((s.coach || {}).acts20 || []).filter(a => a.kind === 'correction').length, ev: (s.coachEv || []).filter(e => e.how === 'res').map(e => ({ span: (e.src20 || {}).span, stale: !!e.stale })),
      sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text).slice(-2), dls: APP.S.all('deadline').map(d => ({ what: d.what, date: d.date, h: (d.fixHist || []).length })), stmt: (s.coach || {}).stmt || '' }; }, pid);
  const ask = (x, path) => x.asks.filter(a => (path instanceof RegExp ? path.test(a.path) : a.path === path) && a.state === 'open')[0];
  const later = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const C = {};
  /* ---- مثبت‌ها ---- */
  C[91] = async () => { await scen({ pinned: 'هدف: غذای ۱۰ نفر', prior: ['مهمونا ۱۰ نفرن؛ می‌خوام بدونم چند پرس غذا لازمه.', { t: 'برای ۱۰ نفر، هر نفر ۴.۵ پرس: ۱۰ × ۴.۵ = ۴۵ پرس.', a: CS({ ph: 'c', said: ['result'], result: 'برای ۱۰ نفر، هر نفر ۴.۵ پرس: ۱۰ × ۴.۵ = ۴۵ پرس.' }) }] });
    await turn('ببخشید مهمونا ۱۰ نفر نیستن، ۱۲ نفرن', 'فرستادم.', RT({ msg: 'مهمونا ۱۰ نفرن', key: 'datum:تعدادِ مهمان', what: 'fact', fix: '۱۲ نفرن', old: '۱۰ نفر' }));
    const x = await snap(''), pn = ask(x, 'sess.pinned'), rs = ((x.res || {}).changed || []).filter(c => /^نتیجهٔ/.test(c.rec))[0];
    return { ok: !!pn && pn.new === 'هدف: غذای ۱۲ نفر' && !!rs && /۱۰ × ۴\.۵ = ۴۵ پرس/.test(rs.old), got: x }; };
  C[92] = async () => { const pid = await scen({ prior: ['قیمتش ۸۰۰ تومن بود، دو تا خریدم.'], live: { u: { dl: [{ id: 'd1', t: 'قیمت: ۸۰۰ تومان' }] } } });
    await turn('قیمت ۸۰۰ نبود، ۷۵۰ بود', 'فرستادم.', RT({ msg: 'قیمتش ۸۰۰ تومن بود', key: 'datum:قیمت', what: 'fact', fix: '۷۵۰', old: '۸۰۰' }));
    const x = await snap(pid), q = ask(x, 'dl:d1'); return { ok: !!q && q.new === 'قیمت: ۷۵۰ تومان' && x.u.dl[0] === 'قیمت: ۸۰۰ تومان', got: x.asks }; };
  C[93] = async () => { const pid = await scen({ prior: ['قیمت ۸۰۰ تومنه، می‌خوام بدونم ارزونه یا نه.'], live: { u: { dl: [{ id: 'd1', t: 'قیمت هشتصد تومان' }] } } });
    await turn('۸۰۰ رو اشتباه گفتم، ۷۵۰ه', 'فرستادم.', RT({ msg: 'قیمت ۸۰۰ تومنه', key: 'datum:قیمت', what: 'fact', fix: '۷۵۰', old: '۸۰۰' }));
    const x = await snap(pid), q = ask(x, 'dl:d1'); return { ok: !!q && /^قیمت ۷۵۰ تومان$/.test(q.new), got: x.asks }; };
  C[94] = async () => { const pid = await scen({ prior: ['بام انبار 200 m^2 هست و بارش ۱۲۰ میلی‌متر.'], live: { u: { dl: [{ id: 'd1', t: '۲۰۰ مترمربع' }] } } });
    await turn('۱۸۰ متره نه ۲۰۰', 'فرستادم.', RT({ msg: 'بام انبار 200 m^2 هست', key: 'datum:سطحِ بام', what: 'fact', fix: '۱۸۰ متره', old: '200 m^2' }));
    const x = await snap(pid), q = ask(x, 'dl:d1'); return { ok: !!q && q.new === '۱۸۰ مترمربع' && /180 m\^2|۱۸۰ (?:متره|m\^2)/.test(x.st), got: { a: x.asks, st: x.st } }; };
  C[95] = async () => { const pid = await scen({ prior: ['۲۰ لیتر آب دارم و می‌خوام بین ۴ نفر تقسیم کنم.'], live: { typed: true, stmt: '۲۰ لیتر آب بین ۴ نفر؛ هر نفر چقدر؟', plan: '۲۰ لیتر رو تقسیم بر ۴' } });
    await ev(async () => __edit(__U(1), '۳۰ لیتر آب دارم و می‌خوام بین ۴ نفر تقسیم کنم.'));
    const x = await snap(pid), s1 = ask(x, 'stmt'), p1 = ask(x, 'plan'); return { ok: !!s1 && /۳۰ لیتر آب بین ۴ نفر/.test(s1.new) && !!p1 && p1.new === '۳۰ لیتر رو تقسیم بر ۴', got: x.asks }; };
  C[96] = async () => { const pid = await scen({ prior: ['۱۲ کارتن آب معدنی دارم، هر کارتن ۲۴ بطری.'], live: { plan: '۱۲ تا کارتن × ۲۴' } });
    await ev((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.live.plan.src = { edited: true }; APP.S.put(pg); }, pid);
    await turn('۱۲ کارتن نبود، ۱۵ تا بود', 'فرستادم.', RT({ msg: '۱۲ کارتن آب معدنی دارم', key: 'datum:کارتن', what: 'fact', fix: '۱۵ تا', old: '۱۲ کارتن' }));
    const x = await snap(pid), q = ask(x, 'plan'); return { ok: !!q && q.new === '۱۵ تا کارتن × ۲۴', got: x.asks }; };
  C[97] = async () => { const pid = await scen({ prior: ['تو دفتر نوشته «۳۶ رأس گوسفند: ؟۴۵۷؟ ریال»؛ رقم اول و آخر محوه.'], live: { plan: 'بخش‌پذیری بر ۴ و ۹؛ ۱۴۸۷۰ را هم بسنج', b: { verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: '؟۴۵۷؟ با ۹۴۵۷۲ بر ۳۶ بخش‌پذیر است' }, g: { guess: '۱۴۵۷۰', test: '۱۴۵۷۰ را بر ۳۶ تقسیم کردم', hit: 'درست بود' } } });
    await turn('عدد ؟۴۸۷؟ بود نه ؟۴۵۷؟', 'فرستادم.', RT({ msg: '۳۶ رأس گوسفند: ؟۴۵۷؟ ریال', key: 'datum:مبلغ', what: 'fact', fix: '؟۴۸۷؟', old: '؟۴۵۷؟' }));
    const x = await snap(pid); return { ok: /؟۴۸۷؟/.test(x.st) && x.b.v !== 'verified' && x.g.sup && !ask(x, 'plan') && !/ثبت نشده بود|چیزی ثبت نشد/.test(String((x.res || {}).note) + x.sys.join(' ')), got: x }; };
  C[98] = async () => { const M = 'برای کیک شکر ۱ پیمانه و کره ۱۰۰ گرم لازمه؛ قالبم بزرگ‌تره.'; const pid = await scen({ prior: [M], live: { u: { dl: [{ id: 'd1', t: '۱ پیمانه شکر' }, { id: 'd2', t: '۱۰۰ گرم کره' }] } } });
    await ev(async (M) => __edit(__U(1), M.replace('شکر ۱ پیمانه', 'شکر ۱٫۵ پیمانه').replace('کره ۱۰۰ گرم', 'کره ۱۲۰ گرم')), M);
    const x = await snap(pid), d1 = ask(x, 'dl:d1'), d2 = ask(x, 'dl:d2'); const line = await ev(() => { const s = __cur(), r = (s.retracts || []).filter(z => !z.copy).slice(-1)[0] || {}; return (r.changed || []).map(c => APP.ASSIST.chLine20(c.label, c.old, c.new)).join(' | '); });
    return { ok: /شکر ۱٫۵ پیمانه/.test(x.st) && /کره ۱۲۰ گرم/.test(x.st) && !!d1 && /۱٫۵ پیمانه شکر/.test(d1.new) && !!d2 && d2.new === '۱۲۰ گرم کره' && /۱٫۵/.test(line) && /۱۲۰/.test(line), got: { x, line } }; };
  C[99] = async () => { await scen({ prior: ['طرح رو باید به شورایاری بدم.', { t: 'مهلتش ۲۰ آبانه.', a: [{ do: 'deadline', what: 'تحویلِ طرح به شورایاری', date: later(20) }] }] });
    await turn('مهلت رو باید به شهرداری منطقه بدم نه شورایاری', 'فرستادم.', RT({ msg: 'طرح رو باید به شورایاری بدم', key: 'deadline:d1', what: 'fact', fix: 'شهرداری منطقه', old: 'شورایاری' }));
    const x = await snap(''); return { ok: x.dls.length === 1 && x.dls[0].what === 'تحویلِ طرح به شهرداری منطقه' && x.dls[0].date === later(20) && x.dls[0].h > 0, got: x.dls }; };
  C[100] = async () => { const pid = await scen({ prior: ['عروسی برادرم ۱۵ اسفنده، ۵ ماه مونده.'], live: {} });
    await turn('عروسی برادرم ۱۸ اسفنده نه ۱۵', 'فرستادم.', RT({ msg: 'عروسی برادرم ۱۵ اسفنده', key: 'datum:تاریخِ عروسی', what: 'fact', fix: '۱۸ اسفنده', old: '۱۵' }));
    const x = await snap(pid); return { ok: x.st === 'عروسی برادرم ۱۸ اسفنده، ۵ ماه مونده.', got: x.st }; };
  C[101] = async () => { const pid = await scen({ prior: ['وزنم ۶۷ کیلوئه و می‌خوام ۵ کیلو کم کنم.'], live: {} });
    await turn('اشتباه تایپ کردم، ۷۶ نه ۶۷', 'فرستادم.', RT({ msg: 'وزنم ۶۷ کیلوئه', key: 'datum:وزن', what: 'fact', fix: '۷۶', old: '۶۷' }));
    const x = await snap(pid), h = await ev((pid) => (APP.S.get('eprob_' + pid).fixHist || []).length, pid); return { ok: /وزنم ۷۶ کیلوئه/.test(x.st) && h > 0, got: { st: x.st, h } }; };
  C[102] = async () => { const pid = await scen({ prior: ['هر قرص ۵۰۰ میلی‌گرم، روزی ۳ بار؛ می‌خوام بدونم در هفته چقدر می‌شه.'], live: {} });
    await turn('هر قرص ۵۰۰ نیست، ۲۵۰ میلی‌گرمه', 'فرستادم.', RT({ msg: 'هر قرص ۵۰۰ میلی‌گرم', key: 'datum:وزنِ قرص', what: 'fact', fix: '۲۵۰ میلی‌گرمه' }));
    const x = await snap(pid); return { ok: /^هر قرص ۲۵۰ میلی‌گرم، روزی ۳ بار؛/.test(x.st) && !GARBLE.test(x.st), got: x.st }; };
  C[103] = async () => { const pid = await scen({ prior: ['یه مربع با ضلع ۱۰ دارم؛ می‌خوام ثابت کنم قطرش همیشه ضلع ضربدر رادیکال ۲ است.', { t: 'برای ضلع ۱۰: مساحت = ۱۰ × ۱۰ = ۱۰۰.', a: CS({ ph: 'c', said: ['result'], result: 'برای ضلع ۱۰: مساحت = ۱۰ × ۱۰ = ۱۰۰.' }) }],
      live: { u: { dl: [{ id: 'd1', t: 'ضلع ۱۰' }] }, b: { verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: 'برهانِ کلی برای هر n با فیثاغورس' } } });
    await turn('ضلع ۱۰ نبود، ۸ بود', 'فرستادم.', RT({ msg: 'یه مربع با ضلع ۱۰ دارم', key: 'datum:ضلع', what: 'fact', fix: '۸', old: '۱۰' }));
    const x = await snap(pid); return { ok: x.b.v === 'verified' && x.ev.some(e => /۱۰ × ۱۰ = ۱۰۰/.test(e.span) && e.stale), got: x }; };
  C[104] = async () => { const pid = await scen({ prior: ['برای کتاب حدود ۱۲۰ ساعت مونده.'], live: { typed: true, stmt: 'سه پروژه و ساعت‌ها', u: { dl: [{ id: 'd1', t: 'هفته‌ای ۱۲ ساعت' }, { id: 'd2', t: 'کتاب ۱۲۰ ساعت مانده' }] } } });
    await turn('اشتباه گفتم، ۱۴۰ ساعت مونده نه ۱۲۰.', 'فرستادم.', RT({ msg: 'حدود ۱۲۰ ساعت مونده', key: 'datum:ساعت', what: 'fact', fix: '۱۴۰', old: '۱۲۰' }));
    const x0 = await snap(pid); await turn('آره عوض کن', 'باشه.'); const x = await snap(pid);
    return { ok: !!ask(x0, 'dl:d2') && x.u.dl[1] === 'کتاب ۱۴۰ ساعت مانده' && !x.asks.some(a => a.state === 'open'), got: { a0: x0.asks, x: x.u } }; };
  C[105] = async () => { const pid = await scen({ prior: ['برای کتاب حدود ۱۲۰ ساعت مونده.'], live: { typed: true, stmt: 'کتاب حدود ۱۲۰ ساعت دیگر می‌خواهد', u: { dl: [{ id: 'd1', t: 'هفته‌ای ۱۲ ساعت' }, { id: 'd2', t: 'کتاب ۱۲۰ ساعت مانده' }] } } });
    await turn('اشتباه گفتم، ۱۴۰ ساعت مونده نه ۱۲۰.', 'فرستادم.', RT({ msg: 'حدود ۱۲۰ ساعت مونده', key: 'datum:ساعت', what: 'fact', fix: '۱۴۰', old: '۱۲۰' }));
    const x0 = await snap(pid); await turn('بله، دادهٔ ۲ رو هم عوض کن', 'باشه.'); const x = await snap(pid);
    return { ok: !!ask(x0, 'dl:d2') && !!ask(x0, 'stmt') && x.u.dl[1] === 'کتاب ۱۴۰ ساعت مانده' && x.st === 'کتاب حدود ۱۲۰ ساعت دیگر می‌خواهد' && !!ask(x, 'stmt'), got: { a0: x0.asks, x: x.asks } }; };
  C[106] = async () => { await scen({ prior: ['سه پروژه دارم — کتاب، اپ و دوره — و هفته‌ای ۱۵ ساعت وقتِ آزاد؛ ترتیبشون رو نمی‌دونم و می‌خوام ساعت‌ها رو درست تقسیم کنم تا هیچ‌کدوم عقب نیفته.'], live: { typed: true, stmt: 'وقتِ آزاد: هفته‌ای ۱۵ ساعت؛ سه پروژه: کتاب، اپ و دوره — ترتیب و تقسیمِ ساعت‌ها را می‌خواهم.' } });
    await turn('اشتباه گفتم، ۱۲ ساعته نه ۱۵.', 'فرستادم.', RT({ msg: 'هفته‌ای ۱۵ ساعت وقتِ آزاد', key: 'datum:ساعت', what: 'fact', fix: '۱۲', old: '۱۵' }));
    const x = await snap(''), parts = await ev(() => __asks().map(q => APP.liveAskPart(q)));
    return { ok: !!x.res && x.res.changed.length > 0 && x.res.changed.every(c => c.old !== c.new && !!c.why) && parts.length > 0 && parts.every(t => /۱۵/.test(t) && /۱۲/.test(t) && !/«([^»]+)» ⇐ «\1»/.test(t)), got: { res: x.res, parts } }; };
  C[107] = async () => { await scen({ prior: ['مخزن ۲۰ لیتره؛ با شیری که دقیقه‌ای ۲ لیتر میده، پر شدنش چقدر طول می‌کشه؟', { t: 'حدس می‌زنم حدود ۱۰ لیتر نصفشه و ۵ دقیقه طول می‌کشه — یعنی ۱۰ دقیقه برای کل.', a: CS({ ph: 'c', guess: { text: 'حدود ۱۰ دقیقه' } }) },
      { t: 'حساب کردم: ۲۰ تقسیم بر ۲ میشه ۱۰. پس حدسم درست بود.', a: CS({ ph: 'c', said: ['result'], result: '۲۰ تقسیم بر ۲ میشه ۱۰', guess_res: { id: 'g1', res: 'confirmed' } }) }] });
    await turn('مخزن ۳۰ لیتره نه ۲۰', 'فرستادم.', RT({ msg: 'مخزن ۲۰ لیتره', key: 'datum:حجمِ مخزن', what: 'fact', fix: '۳۰ لیتره', old: '۲۰' }));
    const x = await snap(''), g = x.cg.filter(y => /۱۰/.test(y.t))[0]; return { ok: !!g && g.r !== 'confirmed' && g.rc, got: x.cg }; };
  C[108] = async () => { const pid = await scen({ prior: ['قالبم ۲۰ سانتیه و می‌خوام کیک بپزم.'], live: { title: 'کیک برای قالبِ ۲۰' } });
    await turn('قالب ۲۲ سانتی‌ه نه ۲۰', 'فرستادم.', RT({ msg: 'قالبم ۲۰ سانتیه', key: 'datum:قالب', what: 'fact', fix: '۲۲ سانتی', old: '۲۰' }));
    const x = await snap(pid); return { ok: x.title === 'کیک برای قالبِ ۲۲', got: { t: x.title, st: x.st } }; };
  C[109] = async () => { const pid = await scen({ prior: ['سلام. بنده بازنشسته‌ام. حقوقم ۱۵۰ میلیون است و می‌خواهم بدانید چطور خرجش کنم.'], live: { u: { dl: [{ id: 'd1', t: 'حقوق ماهانه ۱۵۰ میلیون' }] } } });
    await ev(() => { const s = __cur(); s.coach = s.coach || {}; s.coach.reg = 'shoma'; APP.S.put(s); });
    await turn('ببخشید، عرض کردم ۱۵۰ ولی درستش ۱۲۰ است', 'فرستادم.', RT({ msg: 'حقوقم ۱۵۰ میلیون است', key: 'datum:حقوق', what: 'fact', fix: '۱۲۰', old: '۱۵۰' }));
    const x = await snap(pid), sl = x.sys.join(' '); return { ok: /۱۲۰/.test(x.st) && !!ask(x, 'dl:d1') && /اصلاح/.test(sl) && !/(?:^|[\s(])(?:خودت|نزنی|بگی|بزنی)(?![آ-ی‌])/.test(sl.replace(/«[^»]*»/g, '')), got: x.sys }; };
  C[110] = async () => { const pid = await scen({ prior: ['۶ تا بادکنک داشتم، ۲ تاش ترکید. چند تا مونده؟'], live: { u: { dl: [{ id: 'd1', t: '۶ تا بادکنک داشتم' }] } } });
    await turn('نه نه ۷ تا بود نه ۶ تا', 'فرستادم.', RT({ msg: '۶ تا بادکنک داشتم', key: 'datum:بادکنک', what: 'fact', fix: '۷ تا', old: '۶ تا' }));
    const x = await snap(pid), q = ask(x, 'dl:d1'); return { ok: /۷ تا بادکنک/.test(x.st) && !!q && q.new === '۷ تا بادکنک داشتم', got: x }; };
  C[111] = async () => { const pid = await scen({ prior: ['۸ تا سیب دارم و ۳ تا خوردم.'], live: { u: { dl: [{ id: 'd1', t: '۸ تا سیب' }] } } });
    await turn('7 بود نه ۸', 'فرستادم.', RT({ msg: '۸ تا سیب دارم', key: 'datum:سیب', what: 'fact', fix: '7', old: '۸' }));
    const x = await snap(pid), q = ask(x, 'dl:d1'); return { ok: !!q && q.new === '۷ تا سیب', got: x.asks }; };
  C[112] = async () => { await scen({ pinned: '۵ کیلو کم کنم تا عید', prior: ['می‌خوام تا عید ۵ کیلو کم کنم.'] });
    await turn('هدفم ۵ کیلو نیست، ۳ کیلوئه', 'فرستادم.', RT({ msg: 'می‌خوام تا عید ۵ کیلو کم کنم', key: 'datum:هدف', what: 'fact', fix: '۳ کیلوئه', old: '۵ کیلو' }));
    const x0 = await snap(''), pn = ask(x0, 'sess.pinned'); if (pn) await ev((id) => APP.liveCopyAnswer(__cur().id, id, true), pn.id); const x = await snap('');
    return { ok: !!pn && x.pin === '۳ کیلو کم کنم تا عید', got: { a: x0.asks, pin: x.pin } }; };
  /* ---- منفی‌ها ---- */
  C[113] = async () => { const M = 'حساب نهایی ۲۴ × ۰.۸ = ۱۹.۲ مترمکعب، پس یه مخزن ۲۰ مترمکعبی می‌سازم.'; const pid = await scen({ prior: [M], live: { u: { prac: { approx: 'بین ۱۰ تا ۲۰ مترمکعب بس است' } } } });
    await ev(async (M) => __edit(__U(1), M.replace('مخزن ۲۰ مترمکعبی', 'مخزن ۱۷ مترمکعبی')), M);
    const x = await snap(pid); return { ok: !ask(x, 'prac.approx'), got: x.asks }; };
  C[114] = async () => { const pid = await scen({ prior: ['۸ نفر بودیم و رفتیم رستوران.'], live: { u: { dl: [{ id: 'd1', t: 'میزِ بزرگ ۵ تا ۸ نفر جا داره' }] } } });
    await turn('۸ نفر نبودیم، ۹ نفر', 'فرستادم.', RT({ msg: '۸ نفر بودیم', key: 'datum:نفر', what: 'fact', fix: '۹ نفر', old: '۸ نفر' }));
    const x = await snap(pid); return { ok: !ask(x, 'dl:d1'), got: x.asks }; };
  const refutedScen = async (msgFix) => { await scen({ prior: [{ t: 'حساب کردم که پول ۶۱٫۵ ماه دوام میاره.', a: CS({ ph: 'u', guess: { text: '۶۱٫۵ ماه دوام میاره' } }) }, { t: 'با فرمول دوباره حساب کردم، ۵۸ درومد؛ پس ۶۱٫۵ غلط بود.', a: CS({ ph: 'c', guess_res: { id: 'g1', res: 'refuted' } }) }] });
    await turn(msgFix, 'باشه.', RT({ msg: '۶۱٫۵ ماه دوام میاره', key: 'guess:g1', what: 'guess', fix: '۵۸' })); return snap(''); };
  C[115] = async () => { const x = await refutedScen('جوابم ۶۱٫۵ بود ولی تست کردم رد شد، ۵۸ درسته'); const g = x.cg[0] || {};
    return { ok: g.t === '۶۱٫۵ ماه دوام میاره' && g.r === 'refuted', got: x.cg }; };
  C[116] = async () => { const x = await refutedScen('پس ۶۱٫۵ ماه اشتباه بود؛ درستش ۵۸ ـه'); const g = x.cg[0] || {};
    return { ok: g.t === '۶۱٫۵ ماه دوام میاره' && g.r === 'refuted' && !x.cg.some(y => /۵۸/.test(y.t)), got: x.cg }; };
  C[117] = async () => { const pid = await scen({ prior: ['۱۰ نفر مهمون داریم.'], live: { u: { dl: [{ id: 'd1', t: '۱۰ نفر مهمان' }] } } });
    await turn('۱۲ نفر بودن نه ۱۰', 'فرستادم.', RT({ msg: '۱۰ نفر مهمون داریم', key: 'datum:مهمان', what: 'fact', fix: '۱۲ نفر', old: '۱۰ نفر' }));
    await turn('حالا بریم سراغ غذا.', 'خب.'); const x = await snap(pid); return { ok: x.u.dl[0] === '۱۰ نفر مهمان' && !!ask(x, 'dl:d1'), got: x }; };
  C[118] = async () => { const pid = await scen({ prior: ['مهمونا ۱۸ نفرن.'], live: { u: { dl: [{ id: 'd1', t: '۲۰ دقیقه پیاده تا تالار' }] } } });
    await turn('مهمونا ۲۰ نفرن نه ۱۸', 'فرستادم.', RT({ msg: 'مهمونا ۱۸ نفرن', key: 'datum:مهمان', what: 'fact', fix: '۲۰ نفرن', old: '۱۸' }));
    const x = await snap(pid); return { ok: !ask(x, 'dl:d1'), got: x.asks }; };
  C[119] = async () => { const pid = await scen({ prior: ['۱۰ نفر مهمون داریم.'], live: { u: { dl: [{ id: 'd1', t: 'اتاق ۱۰ متری' }] } } });
    await turn('۱۲ نفر نه ۱۰', 'فرستادم.', RT({ msg: '۱۰ نفر مهمون داریم', key: 'datum:مهمان', what: 'fact', fix: '۱۲ نفر', old: '۱۰ نفر' }));
    const x = await snap(pid); return { ok: !ask(x, 'dl:d1'), got: x.asks }; };
  C[120] = async () => { const pid = await scen({ prior: ['تو دفتر نوشته «۳۶ رأس گوسفند: ؟۴۵۷؟ ریال».'], live: { plan: 'بر ۳۶ بخش کن؛ ۱۴۸۷۰ را هم بسنج' } });
    await ev((pid) => { const pg = APP.S.get('eprog_' + pid); pg.solve.live.plan.src = { edited: true }; APP.S.put(pg); }, pid);
    await turn('عدد ؟۴۸۷؟ بود نه ؟۴۵۷؟', 'فرستادم.', RT({ msg: '۳۶ رأس گوسفند: ؟۴۵۷؟ ریال', key: 'datum:مبلغ', what: 'fact', fix: '؟۴۸۷؟', old: '؟۴۵۷؟' }));
    const x = await snap(pid); return { ok: !ask(x, 'plan') && x.plan === 'بر ۳۶ بخش کن؛ ۱۴۸۷۰ را هم بسنج', got: x }; };
  C[121] = async () => { const pid = await scen({ prior: ['۱۰ نفر مهمون داریم.'], live: { u: { dl: [{ id: 'd1', t: '۱۰ نفر مهمان' }] } } });
    await turn('بله', 'خب.'); const x = await snap(pid); return { ok: x.u.dl[0] === '۱۰ نفر مهمان' && !x.asks.length && !x.acts, got: x }; };
  C[122] = async () => { const M = 'برای کیک شکر ۱ پیمانه و نمک ۲ قاشق لازمه.'; const pid = await scen({ prior: [M], live: { u: { dl: [{ id: 'd1', t: '۱ پیمانه شکر' }] } } });
    await ev(async (M) => __edit(__U(1), M.replace('شکر ۱ پیمانه', 'شکر ۱٫۵ پیمانه').replace('نمک ۲ قاشق', 'نمک ۳ قاشق')), M);
    const x = await snap(pid), d1 = ask(x, 'dl:d1'), last = await ev(() => { const r = (__cur().retracts || []).filter(z => !z.copy).slice(-1)[0] || {}; return { n: (r.changed || []).length, ask: (r.ask || []).length }; });
    return { ok: !!d1 && /۱٫۵ پیمانه شکر/.test(d1.new) && (last.n > 0 || last.ask > 0) && /شکر ۱٫۵ پیمانه/.test(x.st), got: { x, last } }; };
  C[123] = async () => { const tue = (() => { for (let k = 1; k < 8; k++) { const d = new Date(); d.setDate(d.getDate() + k); if (d.getUTCDay() === 2) return d.toISOString().slice(0, 10); } })();
    await scen({ prior: [{ t: 'گزارش رو سه‌شنبه باید تحویل بدم.', a: [{ do: 'deadline', what: 'تحویلِ گزارش', date: tue }] }] });
    await turn('مهلت سه‌شنبه نیست، چهارشنبه است', 'فرستادم.', RT({ msg: 'گزارش رو سه‌شنبه باید تحویل بدم', key: 'deadline:d1', what: 'fact', fix: 'چهارشنبه', old: 'سه‌شنبه' }));
    const x = await snap(''), wed = (() => { const d = new Date(tue + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); })();
    return { ok: x.dls.length === 1 && x.dls[0].what === 'تحویلِ گزارش' && x.dls[0].date === wed, got: { d: x.dls, wed } }; };
  C[124] = async () => { const pid = await scen({ prior: ['۱۰ نفر مهمون داریم.'], live: { u: { dl: [{ id: 'd1', t: '۱۰ نفر مهمان' }] } } });
    await turn('۱۰۰ درصد مطمئنم که درسته', 'خوب.'); const x = await snap(pid); return { ok: !x.asks.length && x.u.dl[0] === '۱۰ نفر مهمان' && !x.acts, got: x }; };
  C[125] = async () => { const pid = await scen({ prior: ['سال ۱۴۰۵ با ۴ نفر رفتیم سفر.'], live: {} });
    await turn('۵ نفر نه ۴ نفر', 'فرستادم.', RT({ msg: 'با ۴ نفر رفتیم سفر', key: 'datum:نفر', what: 'fact', fix: '۵ نفر', old: '۴ نفر' }));
    const x = await snap(pid); return { ok: /سال ۱۴۰۵ با ۵ نفر/.test(x.st), got: x.st }; };
  C[126] = async () => { const pid = await scen({ prior: ['یه کارتن آب دارم.'], live: { u: { dl: [{ id: 'd1', t: '۱ کارتن آب' }] } } });
    const ca = await ev(() => APP.ASSIST.corrAsk('یه کارتن دیگه هم اضافه کن'));
    await turn('یه کارتن دیگه هم اضافه کن', 'باشه.'); const x = await snap(pid); return { ok: ca === false && !x.asks.length && !x.acts && x.u.dl[0] === '۱ کارتن آب', got: { ca, x } }; };
  C[127] = async () => { const ids = await ev(async () => { __wipe(); __fresh(); await __turn('۱۰ تا صندلی داریم برای جلسه.', 'خب.'); const s = __cur();
      const p1 = __live('صندلی‌ها', 'برای جلسه ۱۰ صندلی'); __set(p1, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'کل', u: 'م', dl: [{ id: 'd1', t: '۱۰ صندلی' }], c: '', type: 'find', nat: 'practical', from: 'page' } }; });
      APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s2 = APP.ASSIST.newSession(); await __turn('۱۰ نفر برای شام میان.', 'خب.');
      const p2 = __live('شام', '۱۰ نفر برای شام'); APP.liveBindSession(p2, __cur()); __set(p2, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'کل', u: 'م', dl: [{ id: 'd1', t: '۱۰ نفر شام' }], c: '', type: 'find', nat: 'practical', from: 'page' } }; }); return { p1, p2, s1: s.id }; });
    await turn('۱۲ نه ۱۰', 'فرستادم.', RT({ msg: '۱۰ نفر برای شام میان', key: 'datum:نفر', what: 'fact', fix: '۱۲', old: '۱۰' }));
    const x = await ev((o) => ({ q: __asks(), q1: __asks(o.s1), d1: APP.S.get('eprog_' + o.p1).solve.u[1].dl[0].t }), ids);
    return { ok: !x.q.concat(x.q1).some(a => a.pid === ids.p1) && x.d1 === '۱۰ صندلی', got: x }; };
  C[128] = async () => { const pid = await scen({ prior: ['امروز ۲ تا جلسه دارم.'], live: { u: { dl: [{ id: 'd1', t: '۲ جلسه' }] } } });
    const ca = await ev(() => APP.ASSIST.corrAsk('اشتباه کردم امروز اومدم سرکار'));
    await turn('اشتباه کردم امروز اومدم سرکار', 'باشه.'); const x = await snap(pid); return { ok: ca === false && !x.asks.length && !x.acts, got: { ca, x } }; };

  for (const e of Q4) { const i = idx(e), f = C[i];
    if (!f) { out.summary.nc++; out.nc[i] = 'no check written'; out.fail.push('#' + i + ' has no check'); continue; }
    let r; try { r = await f(); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; }
    if (r.ok) out.summary.pass++; else { out.summary.fail++; out.fail.push('#' + i + ' [' + e.kind + '/' + e.role + '] ' + String(e.text).slice(0, 70) + ' got ' + J(r.got).slice(0, +process.env.GOTN || 700)); } }
  return out;
}
module.exports = { run };
