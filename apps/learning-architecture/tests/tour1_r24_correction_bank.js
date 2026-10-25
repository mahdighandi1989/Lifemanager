// بانکِ مستقلِ VARIANTS_R24 — هر ورودیِ R3.corrections_numbers یک بررسی (برای tests/test_tour1_r24_correction.js؛ خودش آزمون نیست).
// هر بررسی همان نقشِ ورودی را اجرا می‌کند: [chat] نوبتِ واقعیِ دستیار با گزارشِ retract ِ مدلِ لفظی، [edit] ✏️ ِ کامل، [page] فیلدها/پرونده/سطرهای صفحه.
// ورودی‌ها با شمارهٔ جایشان در فایلِ بانک (#n، ۰‌پایه) نام برده می‌شوند. هیچ تاریخِ تقویمیِ ثابتی در انتظارها نیست.
async function run(ctx) {
  const { ev, turn, bank, R3 } = ctx;
  const out = { summary: { pass: 0, fail: 0, nc: 0, of: R3.length }, nc: {}, fail: [] };
  const idx = (e) => bank.indexOf(e);
  const J = (x) => JSON.stringify(x);
  const RT = (o) => [{ do: 'coach_state', retract: o }];
  const CS = (o) => [Object.assign({ do: 'coach_state' }, o)];
  const EMPTYQ = /«»/;
  const REVERSED = /^[^:«]+:\s*«[^»]*»\s*⇐\s*«/;
  /* سناریو: پیام‌های پیشینِ او ⇒ مسئلهٔ زنده (صورت از پیامِ او یا تایپ‌شدهٔ خودش) با رکوردهای تایپ‌شدهٔ خودش (from: page) */
  const scen = (o) => ev(async (o) => {
    __wipe(); __fresh();
    for (const t of (o.prior || [])) { if (typeof t === 'string') await __turn(t, 'خب.'); else await __turn(t.t, t.r || 'خب.', t.a || []); }
    const s = __cur(); let pid = '';
    if (o.stmtChat) { s.coach = s.coach || {}; s.coach.stmt = o.stmtChat; APP.S.put(s); }
    if (o.live) { pid = o.live.typed ? __live(o.live.title || 'مسئلهٔ آزمون', o.live.stmt) : __live(o.live.title || 'مسئلهٔ آزمون', o.live.stmt || (typeof o.prior[0] === 'string' ? o.prior[0] : o.prior[0].t), { by: 'assistant', sess: s.id });
      APP.liveBindSession(pid, APP.S.get(s.id)); if (!o.live.typed) APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so, L) => { const u = o.live.u; if (u) so.u = { 1: Object.assign({ done: true, at: new Date().toISOString(), one: 'کلِ مسئله', u: 'مجهول', dl: [], c: '', type: 'find', nat: 'practical', from: 'page' }, u) };
        if (o.live.plan) L.plan = { t: o.live.plan, at: new Date().toISOString() };
        (o.live.steps || []).forEach((t, i) => L.steps.push({ id: 'st' + (i + 1), at: new Date().toISOString(), text: t, pred: 'می‌بینم', due: APP.today() }));
        if (o.live.b) so.b = { 1: Object.assign({ done: true, from: 'page', at: new Date().toISOString() }, o.live.b) };
        if (o.live.g) so.g = { 1: Object.assign({ at: new Date().toISOString() }, o.live.g) };
        if (o.live.solved) { L.state = 'solved'; L.chat = { sess: s.id, at: new Date().toISOString(), solution: o.live.solved }; } }); }
    return pid;
  }, o);
  const snap = (pid) => ev((pid) => { const s = __cur(), r = pid && APP.S.get('eprob_' + pid), so = pid && APP.S.get('eprog_' + pid).solve;
    return { st: r ? r.p.statement : '', title: r ? r.p.title : '', asks: __asks(), u: so && so.u && so.u[1] ? { dl: so.u[1].dl.map(x => x.t), one: so.u[1].one } : null, plan: so && so.live && so.live.plan ? so.live.plan.t : '',
      steps: so && so.live ? (so.live.steps || []).map(x => x.text) : [], b: so && so.b && so.b[1] ? { v: so.b[1].verdict, use: so.b[1].use } : null, state: so && so.live ? so.live.state : '',
      cg: ((s.coach || {}).guesses || []).map(g => ({ id: g.id, t: g.text, r: g.res || '' })), res: (s.coach && s.coach.retNote || {}).res || null, ch: (s.coach && s.coach.retNote || {}).ch || [],
      ev: (s.coachEv || []).filter(e => e.how === 'res').map(e => ({ span: (e.src20 || {}).span, stale: !!e.stale })), stale: pid && APP.liveStale ? APP.liveStale(pid) : [],
      sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text).slice(-2), stmt: (s.coach || {}).stmt || '' }; }, pid);
  const ask = (x, path) => x.asks.filter(a => (path instanceof RegExp ? path.test(a.path) : a.path === path) && a.state === 'open')[0];
  const openAsks = (x) => x.asks.filter(a => a.state === 'open');
  const edit = (n, f) => ev(async ([n, f]) => { const m = __U(n); return __edit(m, m.text.split(f[0]).join(f[1])); }, [n, f]);
  const editPairs = (n, pairs) => ev(async ([n, pairs]) => { const m = __U(n); let t = m.text; pairs.forEach(p => { t = t.replace(p[0], p[1]); }); return __edit(m, t); }, [n, pairs]);
  const yesAll = () => ev(async () => { for (const a of __asks().filter(a => a.state === 'open')) APP.liveCopyAnswer(__cur().id, a.id, true); });
  const S07 = '۵ تا گلدون لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور گذاشتم. قدشون بعد از ۳ هفته: ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. استادم گفت «یه قانون پیدا کن». قانونش چیه؟ فکر کنم خطیه، هر ۲ ساعت ۴ سانت.';
  const s07 = async () => { const pid = await scen({ prior: [S07], stmtChat: S07, live: { typed: true, stmt: '۵ گلدان لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور؛ قد پس از ۳ هفته ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. قانونِ رابطهٔ نور و قد چیست؟',
    u: { one: 'رابطهٔ نور و قد', u: 'رابطهٔ قد با ساعتِ نور', dl: [{ id: 'd1', t: '۲ ساعت ⇒ ۴ سانت' }, { id: 'd2', t: '۴ ساعت ⇒ ۹ سانت' }, { id: 'd3', t: '۶ ساعت ⇒ ۱۳ سانت' }, { id: 'd4', t: '۸ ساعت ⇒ ۱۶ سانت' }, { id: 'd5', t: '۱۰ ساعت ⇒ ۱۷ سانت' }] } } });
    await edit(1, ['۴، ۹، ۱۳، ۱۶، ۱۷', '۴، ۸، ۱۳، ۱۵، ۱۷']); return pid; };
  const S19 = '۱۶ هفته تا عروسی برادرم مونده، می‌خوام ۸ کیلو کم کنم. سه بار تا حالا رژیم گرفتم و هفته‌ی دوم ول کردم. این بار یه برنامه‌ی دقیق می‌خوام.';
  const s19 = async () => { const pid = await scen({ prior: [S19], stmtChat: 'می‌خوام.', live: { u: { one: 'می‌خواهم تا عروسی ۸ کیلو کم کنم، با ۱۶ هفته وقت', dl: [{ id: 'd1', t: '۱۶ هفته وقت تا عروسی' }, { id: 'd2', t: 'سه بار هفتهٔ دوم ول کردم' }], c: '۸ کیلو تا روزِ عروسی', nat: 'life' } } });
    await turn('یه چیز از همون روزِ اول رو درست کنم: اون موقع اشتباه حساب کرده بودم — از اون روز ۱۸ هفته تا عروسی بود نه ۱۶؛ عروسی ۱۵ اسفنده.', 'فرستادم.', RT({ msg: '۱۶ هفته تا عروسی برادرم مونده', key: 'deadline:d1', what: 'fact', fix: 'عروسی ۱۵ اسفنده', old: '۱۶ هفته' })); return pid; };
  const S02 = 'یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟';
  const s02 = async () => { const pid = await scen({ prior: [S02], live: { u: { one: 'لوله جا می‌شود؟', dl: [{ id: 'd1', t: 'لوله ۴ متر' }, { id: 'd3', t: 'ارتفاع بار ۱.۶ متر' }] } } });
    await turn('اولش گفتم ارتفاعِ بار ۱.۶ـه؛ امروز دوباره اندازه گرفتم — ۱۶۰ سانت نبود، ۱۵۰ سانته.', 'فرستادم.', RT({ msg: '۱.۶ ارتفاع داره', key: 'datum:ارتفاع بار', what: 'fact', fix: '۱۵۰ سانت', old: '۱.۶' })); return pid; };
  const S11 = 'یه صفحه ۱۰×۱۰ که دو گوشه‌ی مقابلش رو برداشتن. می‌خوام با دومینوهای ۱×۲ کاملش کنم.';
  const s11 = async (extra) => { const pid = await scen({ prior: [S11], live: Object.assign({ typed: true, stmt: S11, u: { type: 'prove', one: 'صفحهٔ ۱۰×۱۰ ِ بی دو گوشه را می‌شود پوشاند؟', dl: [{ id: 'd1', t: 'صفحهٔ ۱۰×۱۰ (۱۰۰ خانه)' }, { id: 'd2', t: 'دو گوشهٔ مقابل برداشته شده ⇒ ۹۸ خانه' }, { id: 'd3', t: 'هر دومینو ۲ خانه ⇒ ۴۹ دومینو' }] },
      plan: 'خانه‌ها را سیاه و سفید بشمارم (۵۰ و ۴۸)', steps: ['رنگ‌آمیزی: خانهٔ (۱۰,۱۰) سیاه است؛ 10^2 = 100 خانه'] }, extra || {}) });
    await turn('یه اصلاح: صفحه ۸ در ۸ بود نه ۱۰ در ۱۰، همون صفحه‌ی شطرنج.', 'فرستادم.', RT({ msg: 'یه صفحه ۱۰×۱۰', key: 'datum:اندازهٔ صفحه', what: 'fact', fix: '۸ در ۸' })); return pid; };
  const st2 = (x) => x.stale.map(s0 => s0.v + '>' + (s0.re == null ? '' : s0.re)).join(' ');
  const C = {};
  /* ---- مثبت‌ها ---- */
  C[55] = async () => { const M = 'اتاقم طول ۵ متر، عرض ۳ متر، حدسم ۱.۷۵ متره که فرش جا بشه.';
    const pid = await scen({ prior: [{ t: M, a: CS({ ph: 'u', guess: '۱.۷۵ متره' }) }], live: {} });
    await editPairs(1, [['طول ۵ متر', 'طول ۴ متر'], ['عرض ۳ متر', 'عرض ۲ متر']]); const x = await snap(pid);
    return { ok: /طول ۴ متر، عرض ۲ متر، حدسم ۱\.۷۵ متره/.test(x.st) && x.cg.length === 1 && x.cg[0].t === '۱.۷۵ متره' && !/۱\.۴۷|۱\.۵\.۷۵|۱۲۰|۱\.۷۴|۱\.۷۲/.test(J(x)), got: x }; };
  C[56] = async () => { const pid = await s02(); const x = await snap(pid), d3 = ask(x, 'dl:d3');
    return { ok: /۱\.۸ عرض، ۱۵۰ سانت ارتفاع/.test(x.st) && !!d3 && /ارتفاع بار ۱[.٫]۵ متر/.test(d3.new), got: x }; };
  C[57] = async () => { const M = 'کمدِ جدیدم height 160cm داره و سقفِ اتاق ۲۴۰ سانته؛ جا میشه؟';
    const pid = await scen({ prior: [M], live: { u: { one: 'کمد جا می‌شود؟', dl: [{ id: 'd1', t: 'ارتفاعِ کمد ۱۶۰ سانت' }, { id: 'd2', t: 'سقف ۲۴۰ سانت' }] } } });
    await edit(1, ['160cm', '150cm']); const x = await snap(pid), d1 = ask(x, 'dl:d1');
    return { ok: /height 150cm/.test(x.st) && !!d1 && d1.new === 'ارتفاعِ کمد ۱۵۰ سانت' && !ask(x, 'dl:d2'), got: x }; };
  C[58] = async () => { const pid = await s19(); const x = await snap(pid), d1 = ask(x, 'dl:d1'), one = ask(x, 'u.one');
    const bad = openAsks(x).filter(a => /۱۵ هفته/.test(a.new) || (/۱۶ هفته/.test(a.old) && /(^|[^۰-۹])۱۵([^۰-۹]|$)/.test(a.new)));
    return { ok: /۱۸ هفته تا عروسی/.test(x.st) && !bad.length && (!d1 || d1.new === '۱۸ هفته وقت تا عروسی') && (!one || /۱۸ هفته وقت/.test(one.new)) && x.stmt === 'می‌خوام.', got: x }; };
  C[59] = async () => { const pid = await scen({ prior: ['برای رقمِ آخر گفتم باید بر ۴ بخش‌پذیر باشه.'], live: { typed: true, stmt: 'تو دفتر نوشته «۳۶ رأس گوسفند: ؟۴۵۷؟ ریال»؛ رقمِ اول و آخر محو شده.', plan: 'نخست با بخش‌پذیری بر ۴ رقم آخر رو پیدا می‌کنم', steps: ['بر ۴: دو رقم آخر ۷y باید بر ۴ بخش‌پذیر باشه'] } });
    await turn('بر ۴ بخش‌پذیر نه، باید بر ۵ بخش‌پذیر باشه.', 'فرستادم.', RT({ msg: 'باید بر ۴ بخش‌پذیر باشه', key: 'plan', what: 'fact', fix: 'بر ۵', old: 'بر ۴' }));
    const x = await snap(pid), pl = ask(x, 'plan');
    return { ok: !!pl && /بخش‌پذیری بر ۵/.test(pl.new) && /؟۴۵۷؟/.test(x.st) && !ask(x, 'stmt') && x.steps[0] === 'بر ۴: دو رقم آخر ۷y باید بر ۴ بخش‌پذیر باشه' && x.plan === 'نخست با بخش‌پذیری بر ۴ رقم آخر رو پیدا می‌کنم', got: x }; };
  C[60] = async () => { const pid = await s07(); const x = await snap(pid), A0 = (x.res && x.res.ask) || [];
    return { ok: A0.some(a => /۸ ساعت ⇒ ۱۵ سانت/.test(a.new)) && !!ask(x, 'dl:d4'), got: { A0, asks: x.asks } }; };
  C[61] = async () => { const pid = await ev(async () => { __wipe(); __fresh(); await __turn('ما ۱۵ نفر بودیم و می‌خواستیم شام بریم بیرون؛ جایی که همه راضی باشن.', 'خب.');
      await __turn('کل در یک جمله: «با ۱۵ نفر کجا شام بخوریم که همه راضی باشن؟»', 'خوب.'); const s = __cur(), m2 = __U(2);
      const pid = __live('شامِ ۱۵ نفره', 'ما ۱۵ نفر بودیم و می‌خواستیم شام بریم بیرون؛ جایی که همه راضی باشن.', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      const t = 'با ۱۵ نفر کجا شام بخوریم که همه راضی باشن؟', at = new Date().toISOString(), mid = APP.liveMsgId(m2);
      __set(pid, (so, L) => { L.uDraft = { type: 'find', one: t, u: t, dl: [], c: '', chat: { one: { t, at, mid, st: 'ask' }, u: { t, at, mid, st: 'ask' } }, src: { one: APP.liveMkSrc(s.id, m2, 'stmt', t), u: APP.liveMkSrc(s.id, m2, 'unknown', t) } }; L.chatUnk = { t, at }; }); return pid; });
    await turn('نه ۱۵ نفر نبودیم، ۱۲ نفر بودیم.', 'فرستادم.', RT({ msg: 'ما ۱۵ نفر بودیم', key: 'datum:تعداد', what: 'fact', fix: '۱۲ نفر', old: '۱۵ نفر' }));
    const x = await ev((pid) => { const L = APP.S.get('eprog_' + pid).solve.live, d = L.uDraft; return { dest: APP.STORY.dest({ pid }), one: d.one, u: d.u, cu: d.chat.u.t, unk: L.chatUnk.t, hist: JSON.stringify(d.fixHist || []), st: APP.S.get('eprob_' + pid).p.statement }; }, pid);
    return { ok: /۱۲ نفر/.test(x.dest) && /۱۲ نفر/.test(x.one) && /۱۲ نفر/.test(x.u) && /۱۲ نفر/.test(x.cu) && /۱۲ نفر/.test(x.unk) && /۱۵ نفر/.test(x.hist) && /۱۲ نفر بودیم/.test(x.st), got: x }; };
  C[62] = async () => { const pid = await s11(); await yesAll(); const x = await snap(pid), s0 = st2(x);
    return { ok: /100>64/.test(s0) && /98>62/.test(s0) && /49>31/.test(s0) && /50>/.test(s0) && /48>/.test(s0) && x.stale.some(z => z.k === 'step:st1' && z.v === 100), got: { s0, stale: x.stale } }; };
  C[63] = async () => { const pid = await s02(); const x = await snap(pid), ch = (x.res && x.res.changed) || [];
    return { ok: ch.length > 0 && ch.every(c => !EMPTYQ.test(c.why || '')) && ch.some(c => /۱۶۰ سانت/.test(c.why || '') && /۱۵۰ سانت/.test(c.why || '')), got: ch }; };
  C[64] = async () => { const M = 'قیفِ مخروطی با شعاعِ ۵ سانتی‌متر و ارتفاعِ ۱۰. درسم این بود: شعاعِ ۵ رو اول با تشابه به ارتفاع ربط بدم.';
    const pid = await scen({ prior: [M], live: { b: { verdict: 'unverified' } } });
    await ev((pid) => { const s = __cur(), m = __U(1); __set(pid, (so) => { so.b[1].use = 'شعاعِ ۵ رو اول با تشابه به ارتفاع ربط بدم'; so.b[1].src = { use: APP.liveMkSrc(s.id, m, 'lesson', 'شعاعِ ۵ رو اول با تشابه به ارتفاع ربط بدم') }; }); }, pid);
    await edit(1, ['۵', '۶']);
    const x = await ev((pid) => { const d = APP.dossier(pid) || {}; const E = (d.events || d.ev || []).filter(e => e.k === 'retract'); return { E: E.map(e => e.lines), st: APP.S.get('eprob_' + pid).p.statement, use: APP.S.get('eprog_' + pid).solve.b[1].use, ch: (__cur().coach.retNote || {}).ch || [] }; }, pid);
    const lines = [].concat(...x.E).concat(x.ch), chl = [].concat(...x.E.map(l => l.slice(1))).concat(x.ch), dup = [].concat(...x.E.map(L => L.filter((l, i) => L.indexOf(l) !== i)));
    return { ok: /شعاعِ ۶ سانتی‌متر/.test(x.st) && /شعاعِ ۶ رو/.test(x.use) && x.E.length >= 1 && !dup.length && chl.every(l => !REVERSED.test(l)) && lines.some(l => /\(اصلاح شد ⇐ «/.test(l)), got: x }; };
  C[65] = async () => { const M = 'برای سفر ۵ نفریم، هر کدوم ۲.۵ میلیون می‌ذاره.';
    const pid = await scen({ prior: [M], live: { u: { one: 'بودجهٔ سفر', dl: [{ id: 'd1', t: '۵ نفر' }, { id: 'd2', t: 'هر نفر ۲.۵ میلیون' }] }, steps: ['جمع: ۵ × ۲.۵ = ۱۲.۵ میلیون'] } });
    await edit(1, ['۲.۵ میلیون', '۲.۸ میلیون']); const x = await snap(pid), s0 = st2(x);
    return { ok: /۵ نفریم، هر کدوم ۲\.۸ میلیون/.test(x.st) && x.u.dl[0] === '۵ نفر' && !ask(x, 'dl:d1') && /12\.5>14/.test(s0), got: { x, s0 } }; };
  C[66] = async () => { const pid = await scen({ prior: ['برای مهمونی ۳ کیلو برنج لازمه و ۲ لیتر روغن.'], live: { u: { one: 'خرید', dl: [{ id: 'd1', t: 'روغن ۲ لیتر' }] } } });
    await turn('۳ کیلو نه، ۲ کیلو.', 'فرستادم.', RT({ msg: '۳ کیلو برنج لازمه', key: 'datum:برنج', what: 'fact', fix: '۲ کیلو', old: '۳ کیلو' }));
    const x = await snap(pid); return { ok: /۲ کیلو برنج لازمه و ۲ لیتر روغن/.test(x.st) && !/کیلو کیلو|لیتر برنج/.test(x.st) && !ask(x, 'dl:d1'), got: x }; };
  C[67] = async () => { const M = 'سلام، عذر می‌خواهم. یک وامِ ۲۰۰ میلیونی گرفته‌ام و می‌خواهم بدانم قسطِ ماهانه‌ام چقدر می‌شود.';
    const pid = await scen({ prior: [M, { t: 'حساب کردم: قسطِ ماهانه حدودِ ۹ میلیون تومان می‌شود.', a: CS({ ph: 'c', said: ['result'], result: 'حساب کردم: قسطِ ماهانه حدودِ ۹ میلیون تومان می‌شود.' }) }], live: { stmt: M, u: { one: 'قسطِ ماهانه', dl: [{ id: 'd1', t: 'مبلغِ وام ۲۰۰ میلیون' }] } } });
    await ev(() => { const s = __cur(); s.coach = s.coach || {}; s.coach.reg = 'shoma'; APP.S.put(s); });   // گفت‌وگوی «شما» ِ یک سالمند (ضمیرِ گفت‌وگو ثبت شده است)
    await turn('عذر می‌خواهم، مبلغِ وام ۳۰۰ میلیون است نه ۲۰۰.', 'فرستادم.', RT({ msg: 'یک وامِ ۲۰۰ میلیونی', key: 'datum:مبلغ', what: 'fact', fix: '۳۰۰ میلیون', old: '۲۰۰' }));
    const x = await snap(pid), sy = x.sys.join(' ');
    return { ok: !!ask(x, 'dl:d1') && /خودتان|بزنید/.test(sy) && !/خودت «بله» نزنی/.test(sy) && x.ev.some(e => /۹ میلیون/.test(e.span || '') && e.stale), got: x }; };
  C[68] = async () => { const pid = await scen({ prior: ['۱۲ تا مداد رو بین ۳ نفر تقسیم کردیم، به هر کی ۴ تا رسید.'], live: {} });
    await turn('نه ۱۲ تا مداد نبود، ۱۵ تا بود!', 'فرستادم.', RT({ msg: '۱۲ تا مداد', key: 'datum:مداد', what: 'fact', fix: '۱۵ تا', old: '۱۲ تا' }));
    const x = await snap(pid), s0 = st2(x); return { ok: /۱۵ تا مداد/.test(x.st) && /(^| )4>5( |$)/.test(s0) && !/(^| )3>/.test(s0), got: { st: x.st, s0 } }; };
  C[69] = async () => { const pid = await scen({ prior: ['سه تا ظرف دارم: اولی 3.5 لیتره، دومی ۵۰ سانت قد داره، سومی ۳ لیتر.'], live: {} });
    await turn('3.5 نه، 3.75 بود.', 'فرستادم.', RT({ msg: 'اولی 3.5 لیتره', key: 'datum:ظرفِ اول', what: 'fact', fix: '3.75', old: '3.5' }));
    const x = await snap(pid); return { ok: /اولی (?:3\.75|۳\.۷۵) لیتره/.test(x.st) && /۵۰ سانت/.test(x.st) && /سومی ۳ لیتر/.test(x.st) && !/3\.75\.|\.75\.5/.test(x.st), got: x.st }; };
  /* ---- منفی‌ها ---- */
  C[70] = async () => { const M = 'تو کلاس ۲۵ نفر، ۵ گروه، سال ۱۴۰۵؛ هر گروه چند نفره؟';
    const pid = await scen({ prior: [M], live: { u: { one: 'اندازهٔ گروه', dl: [{ id: 'd1', t: 'تعدادِ گروه‌ها ۵' }, { id: 'd2', t: '۲۵ نفر' }, { id: 'd3', t: 'سال ۱۴۰۵' }] } } });
    await edit(1, ['۵ گروه', '۶ گروه']); const x = await snap(pid), d1 = ask(x, 'dl:d1');
    return { ok: /۲۵ نفر، ۶ گروه، سال ۱۴۰۵/.test(x.st) && !!d1 && d1.new === 'تعدادِ گروه‌ها ۶' && !ask(x, 'dl:d2') && !ask(x, 'dl:d3'), got: x }; };
  C[71] = async () => { const pid = await scen({ prior: ['تو جدول نوشتم x² + ۲ نفر اضافه میشن.'], live: {} });
    await edit(1, ['۲ نفر', '۳ نفر']); const x = await snap(pid); return { ok: /x² \+ ۳ نفر/.test(x.st) && !/x³|x۳/.test(x.st), got: x.st }; };
  C[72] = async () => { const pid = await s11(); await ev(() => { __wipe(); __fresh(); });
    const p2 = await scen({ prior: [S19], live: { u: { one: 'کم کردنِ ۸ کیلو', dl: [{ id: 'd1', t: '۱۶ هفته وقت' }] } } });
    await turn('عروسی ۱۵ اسفنده.', 'خوب.'); const x = await snap(p2); return { ok: !openAsks(x).length && !x.stale.length && x.u.dl[0] === '۱۶ هفته وقت' && /۱۶ هفته/.test(x.st), got: x }; };
  C[73] = async () => { const pid = await scen({ prior: ['ارتفاعِ کمد ۱.۵ متره.'], live: { u: { one: 'کمد', dl: [{ id: 'd1', t: 'ارتفاع ۱.۵ متر' }] } } });
    await turn('۱۵۰ همون ۱.۵ متره دیگه، فقط دقیق‌تر گفتم.', 'باشه.', RT({ msg: 'ارتفاعِ کمد ۱.۵ متره', key: 'datum:ارتفاع', what: 'fact', fix: '۱۵۰ سانت', old: '۱.۵ متر' }));
    const x = await snap(pid); return { ok: /۱\.۵ متره/.test(x.st) && !openAsks(x).length && !x.stale.length && !x.sys.some(t => /^✓ اصلاح شد/.test(t)), got: x }; };
  C[74] = async () => { await scen({ prior: [{ t: 'حدسم اینه که ۵ متر طناب کافیه.', a: CS({ ph: 'u', guess: '۵ متر طناب کافیه' }) }, { t: 'امتحان کردم، ۵ متر کم اومد؛ حدسم رد شد.', a: CS({ ph: 'c', guess_res: { id: 'g1', res: 'refuted' } }) }] });
    await turn('نه، اون ۵ متر رد شد، ۷ متر بود.', 'فرستادم.', RT({ msg: '۵ متر طناب کافیه', key: 'guess:g1', what: 'fact', fix: '۷ متر', old: '۵ متر' }));
    const x = await snap(''); const g = x.cg[0] || {}; return { ok: g.t === '۵ متر طناب کافیه' && g.r === 'refuted', got: x.cg }; };
  C[75] = async () => { const ids = await ev(async () => { __wipe(); __fresh(); await __turn('۱۰ تا صندلی داریم برای جلسه.', 'خب.'); const s = __cur();
      const p1 = __live('صندلی‌ها', 'برای جلسه ۱۰ صندلی'); __set(p1, (so, L) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'کل', u: 'م', dl: [{ id: 'd1', t: '۱۰ صندلی' }], c: '', type: 'find', nat: 'practical', from: 'page' } }; L.state = 'solved'; });
      APP.go('home'); localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); await __turn('۱۰ نفر برای شام میان.', 'خب.');
      const p2 = __live('شام', '۱۰ نفر برای شام'); APP.liveBindSession(p2, __cur()); __set(p2, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'کل', u: 'م', dl: [{ id: 'd1', t: '۱۰ نفر شام' }], c: '', type: 'find', nat: 'practical', from: 'page' } }; }); return { p1, p2, s1: s.id }; });
    await turn('اشتباه گفتم، ۱۲ نفر میان نه ۱۰.', 'فرستادم.', RT({ msg: '۱۰ نفر برای شام میان', key: 'datum:نفر', what: 'fact', fix: '۱۲ نفر', old: '۱۰ نفر' }));
    const x = await ev((o) => ({ q: __asks(), q1: __asks(o.s1), d1: APP.S.get('eprog_' + o.p1).solve.u[1].dl[0].t, st1: APP.S.get('eprob_' + o.p1).p.statement, s1: APP.liveStale ? APP.liveStale(o.p1) : [] }), ids);
    return { ok: !x.q.concat(x.q1).some(a => a.pid === ids.p1) && x.d1 === '۱۰ صندلی' && x.st1 === 'برای جلسه ۱۰ صندلی' && !x.s1.length, got: x }; };
  C[76] = async () => { await s07(); const a = await snap(''); await s02(); const b = await snap('');
    const all = ((a.res && a.res.changed) || []).concat((b.res && b.res.changed) || []); return { ok: all.length > 0 && all.every(c => !!c.why && !EMPTYQ.test(c.why)), got: all.map(c => c.why) }; };
  C[77] = async () => { const pid = await s07(); const x = await snap(pid); const d = await ev((pid) => { const D = APP.dossier(pid) || {}; return (D.events || D.ev || []).filter(e => e.k === 'retract').map(e => e.lines); }, pid);
    const L = x.ch, dup = L.filter((l, i) => L.indexOf(l) !== i), dd = [].concat(...d.map(ls => ls.filter((l, i) => ls.indexOf(l) !== i))), sy = String(x.sys.join(' ')).split(' · '), ds = sy.filter((l, i) => sy.indexOf(l) !== i);
    return { ok: L.length > 0 && !dup.length && !dd.length && !ds.length, got: { L, d, sys: x.sys } }; };
  C[78] = async () => { const x = await ev(() => ({ les: APP.ASSIST.chLine20('درسِ بازنگریِ «قیف»', 'اول مجهول رو با کلمه‌های دیگه بگم بعد جایگذاری کنم', 'قبل از جایگذاری، مجهول رو به زبون نرخ بگم بعد جایگذاری کنم'), st: APP.ASSIST.chLine20('صورتِ مسئله', 'قیفی با شعاعِ ۵ سانتی‌متر و ارتفاعِ ۱۰', 'قیفی با شعاعِ ۶ سانتی‌متر و ارتفاعِ ۱۰') }));
    return { ok: !REVERSED.test(x.les) && !REVERSED.test(x.st) && /\(اصلاح شد ⇐ «/.test(x.les) && /\(اصلاح شد ⇐ «/.test(x.st), got: x }; };
  C[79] = async () => { const pid = await s19(); await yesAll(); const x = await snap(pid);
    return { ok: !/۱۵ هفته/.test(J([x.st, x.u])) && /۱۸ هفته/.test(x.st) && /۱۸ هفته/.test(x.u.dl[0]) && /۱۸ هفته/.test(x.u.one), got: { st: x.st, u: x.u } }; };
  C[80] = async () => { const pid = await s11({ steps: ['رنگ‌آمیزی: خانهٔ (۱۰,۱۰) سیاه است؛ 10^2 = 100 خانه', 'تا ۱۵ آبان جوابم رو به مریم می‌گم'] });
    await ev(() => { const d = new Date(); d.setDate(d.getDate() + 9); APP.S.put({ id: 'deadline_t80', type: 'deadline', what: 'جواب به مریم', date: d.toISOString().slice(0, 10), sess: __cur().id }); });
    const x = await snap(pid); return { ok: x.stale.length > 0 && !x.stale.some(z => z.k === 'step:st2' || z.v === 15) && !x.stale.some(z => /deadline/.test(z.k)), got: x.stale }; };
  C[81] = async () => { const pid = await scen({ prior: ['برای جلسه ۱۵ صندلی داریم و ۱۲ نفر میان.'], live: { u: { one: 'جلسه', dl: [{ id: 'd1', t: '۱۵ صندلی' }, { id: 'd2', t: '۱۲ نفر' }] } } });
    await turn('۱۲ نفر بودیم ولی ۱۵ صندلی داریم.', 'باشه.', RT({ msg: '۱۵ صندلی داریم', key: 'datum:صندلی', what: 'fact', fix: '۱۲ نفر', old: '۱۵' }));
    const x = await snap(pid); return { ok: x.st === 'برای جلسه ۱۵ صندلی داریم و ۱۲ نفر میان.' && !openAsks(x).length && x.u.dl[0] === '۱۵ صندلی', got: x }; };
  C[82] = async () => { const M = '۱۲ نفریم، ساعت ۱۲ شروع می‌کنیم.';
    const pid = await scen({ prior: [M], live: { u: { one: 'جلسه', dl: [{ id: 'd1', t: '۱۲ نفر' }, { id: 'd2', t: 'شروع ساعت ۱۲' }] } } });
    await edit(1, ['۱۲ نفریم', '۱۵ نفریم']); const x = await snap(pid), d1 = ask(x, 'dl:d1');
    return { ok: /۱۵ نفریم، ساعت ۱۲ شروع/.test(x.st) && !!d1 && d1.new === '۱۵ نفر' && !ask(x, 'dl:d2'), got: x }; };

  for (const e of R3) { const i = idx(e), f = C[i];
    if (!f) { out.summary.nc++; out.nc[i] = 'no check written'; out.fail.push('#' + i + ' has no check'); continue; }
    let r; try { r = await f(); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; }
    if (r.ok) out.summary.pass++; else { out.summary.fail++; out.fail.push('#' + i + ' [' + e.kind + '/' + e.role + '] ' + String(e.text).slice(0, 70) + ' got ' + J(r.got).slice(0, +process.env.GOTN || 900)); } }
  return out;
}
module.exports = { run };
