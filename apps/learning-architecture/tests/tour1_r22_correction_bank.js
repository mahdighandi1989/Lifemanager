// بانکِ مستقلِ VARIANTS_R22 — هر ورودیِ P3.correction_engine یک بررسی (برای tests/test_tour1_r22_correction.js؛ خودش آزمون نیست).
// هر بررسی همان نقشِ ورودی را اجرا می‌کند: [chat] نوبتِ واقعیِ دستیار با گزارشِ retract ِ مدلِ لفظی، [edit] ✏️ ِ کامل، [page] فیلدهای تایپ‌شدهٔ خودش،
// [events] پروندهٔ کامل، [time] سشنِ پیشین، [prompt] ساختارِ نتیجه. دلیلِ «not covered» فقط برای بخشی که مالِ سازوکارِ دیگری است.
const OLD = 'حدودِ یک ماهه که هر روز روی این کار می‌کنم.';
async function run(ctx) {
  const { p, ev, turn, blockOf, head, bank, P3 } = ctx;
  const out = { summary: { pass: 0, fail: 0, nc: 0, of: P3.length }, nc: {}, fail: [] };
  const idx = (e) => bank.indexOf(e);
  const GARBLE = /متر مربعه متر مربعه|۱\.۵\.۵|۲\.۵\.۵|یه تا اسکیس|عروسی[^.،]{0,30}تا عروسی|۶۰ متره مربعه/;
  const RT = (o) => [{ do: 'coach_state', retract: o }];
  /* سناریوی صفحه: پیام‌های پیشینِ او ⇒ مسئلهٔ زنده با رکوردهای تایپ‌شدهٔ خودش (from: page) ⇒ برگرداندن */
  const scen = (o) => ev(async (o) => {
    __wipe(); __fresh(); for (const t of (o.prior || [])) await __turn(t, 'خب.');
    const s = __cur(); let pid = '';
    if (o.live) { pid = __live(o.live.title || 'مسئلهٔ آزمون', o.live.stmt || (o.prior || [])[0] || 'صورتِ آزمون برای این مسئله', { by: o.live.by || 'assistant', sess: s.id }); APP.liveBindSession(pid, APP.S.get(s.id)); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so, L, r) => { const u = o.live.u; if (u) so.u = { 1: Object.assign({ done: true, at: new Date().toISOString(), one: 'کلِ مسئله', u: 'مجهول', dl: [], c: '', type: 'find', nat: 'practical', from: 'page' }, u) };
        if (o.live.steps) o.live.steps.forEach((x, i) => L.steps.push(Object.assign({ id: 'st' + (i + 1), at: new Date().toISOString(), text: x.text, pred: 'شاید', due: APP.today() }, x.closed ? { closed: true, out: { at: new Date().toISOString(), d: APP.today(), done: 'yes', what: x.what, match: 'yes', from: 'page' } } : {})));
        if (o.live.plan) L.plan = { t: o.live.plan, at: new Date().toISOString() };
        if (o.live.b) so.b = { 1: Object.assign({ done: true, from: 'page', at: new Date().toISOString() }, o.live.b) };
        if (o.live.g) so.g = { 1: Object.assign({ at: new Date().toISOString() }, o.live.g) };
        if (o.live.suff) L.suffLog = [{ at: new Date().toISOString(), d: APP.today(), ans: o.live.suff, where: 'u' }];
        if (o.live.solved) { L.state = 'solved'; }
        if (o.live.aux) o.live.aux.forEach(a => L.aux.push(a)); }); }
    if (o.dl) (o.dl || []).forEach(d => AS_DL(d));
    return pid;
    function AS_DL(d) { const r = { id: d.id || APP.uid('dl'), type: 'deadline', what: d.what, date: d.date, time: d.time || '', done: false, sess: s.id }; const U = (APP.S.get(s.id).msgs || []).filter(m => m.role === 'user'); const m = U[d.from || 0];
      if (m) r.src = APP.liveSrc(s.id, APP.liveMsgId(m), 'deadline:' + r.id, d.what + ' ' + (d.span || '')); APP.S.put(r); }
  }, o);
  const snap = (pid) => ev((pid) => { const s = __cur(), r = pid && APP.S.get('eprob_' + pid), so = pid && APP.S.get('eprog_' + pid).solve;
    return { st: r ? r.p.statement : '', title: r ? r.p.title : '', asks: __asks(), u: so && so.u && so.u[1] ? { dl: so.u[1].dl.map(x => x.t), one: so.u[1].one, c: so.u[1].c, prac: so.u[1].prac || null } : null,
      b: so && so.b && so.b[1] ? { v: so.b[1].verdict, sup: !!so.b[1].superseded, use: so.b[1].use || '' } : null, g: so && so.g && so.g[1] ? { hit: so.g[1].hit || '', sup: !!so.g[1].outSup } : null,
      suff: so && so.live && (so.live.suffLog || []).slice(-1)[0] || null, state: so && so.live ? so.live.state : '', steps: so && so.live ? so.live.steps.map(x => ({ t: x.text, w: x.out && x.out.what })) : [],
      res: (s.coach && s.coach.retNote || {}).res || null, rets: (s.coach && s.coach.retracts || []).slice(-1)[0] || null, sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text).slice(-2),
      dls: APP.S.all('deadline').map(d => ({ id: d.id, what: d.what, date: d.date, time: d.time, h: (d.fixHist || []).length })) }; }, pid);
  const ask = (x, path) => x.asks.filter(a => a.path === path || (path instanceof RegExp && path.test(a.path)))[0];
  const C = {};
  /* ---- مثبت‌ها ---- */
  C[60] = async () => { const pid = await scen({ prior: ['اتاقم ۵۰ مترمربعه و می‌خوام کف‌پوش بخرم', 'قیمت هر متر رو پرسیدم', 'دو مدل هست', 'نمی‌دونم کدوم'], live: { stmt: 'اتاقم ۵۰ مترمربعه و می‌خوام کف‌پوش بخرم', u: { prac: { measure: '۵۰ مترمربع' } } } });
    await turn('ببخشید، اتاق پنجاه متر مربع نیست، شصت متر مربعه', 'فرستادم.', RT({ msg: 'اتاقم ۵۰ مترمربعه', what: 'fact', key: 'datum:مساحت', fix: 'شصت متر مربعه', old: '۵۰' }));
    const x = await snap(pid), q = ask(x, 'prac.measure'); return { ok: !!q && /^۶۰ مترمربع$/.test(q.new), got: x.asks }; };
  C[61] = async () => { const pid = await scen({ prior: ['the floor area is 200 m^2 and I need tiles'], live: { stmt: 'the floor area is 200 m^2 and I need tiles', u: { dl: [{ id: 'd1', t: 'مساحت: ۲۰۰ مترمربع' }] } } });
    await turn('area is actually 250 m^2, not 200 m^2', 'sent.', RT({ msg: 'the floor area is 200 m^2', what: 'fact', key: 'datum:area', fix: '250 m^2', old: '200 m^2' }));
    const x = await snap(pid), q = ask(x, 'dl:d1'); return { ok: !!q && /مساحت: ۲۵۰ مترمربع/.test(q.new), got: { asks: x.asks, rets: x.rets } }; };
  C[62] = async () => { const pid = await scen({ prior: ['برای کیک دو پیمونه آرد ریختم و نیم ساعت پختم'], live: { u: { dl: [{ id: 'd1', t: '۲ پیمانه آرد' }] } } });
    await ev(async () => __edit(__U(1), 'برای کیک سه پیمونه آرد ریختم و نیم ساعت پختم'));
    const x = await snap(pid), q = ask(x, 'dl:d1'); return { ok: !!q && q.new === '۳ پیمانه آرد', got: x.asks }; };
  C[63] = async () => { const pid = await scen({ prior: ['قفسه رو اندازه گرفتم، ۱۵ سانت عمق داره'], live: { steps: [{ text: 'اندازهٔ قفسه', closed: true, what: 'قفسه ۱۵ سانتی‌متر عمق داره' }] } });
    await turn('نه اشتباه گفتم، عمقش ۱۸ سانته', 'فرستادم.', RT({ msg: 'قفسه رو اندازه گرفتم، ۱۵ سانت عمق داره', what: 'fact', key: 'datum:عمق', fix: '۱۸ سانته', old: '۱۵ سانت' }));
    const x = await snap(pid), q = ask(x, /^out:/); return { ok: !!q && /قفسه ۱۸ سانتی‌متر عمق داره/.test(q.new), got: x.asks }; };
  C[64] = async () => { const pid = await scen({ prior: ['وزن آرد ۱۰۰۰ گرم بود که ریختم'], live: { b: { other: 'با یک کیلو آرد امتحان کردم' } } });
    await turn('وزن آرد ۱۰۰۰ گرم نبود، ۱۲۰۰ گرم بود', 'فرستادم.', RT({ msg: 'وزن آرد ۱۰۰۰ گرم بود', what: 'fact', key: 'datum:آرد', fix: '۱۲۰۰ گرم', old: '۱۰۰۰ گرم' }));
    const x = await snap(pid), q = ask(x, 'b.other'); return { ok: !!q && /(?:۱٫۲ کیلو|۱۲۰۰ گرم)/.test(q.new) && /امتحان کردم/.test(q.new), got: x.asks }; };
  C[65] = async () => { const pid = await scen({ prior: ['قالبم ۲۵ در ۳۵ هست و دستور برای قالب گرده'], live: { u: { prac: { measure: '۲۵ سانتی‌متر × ۳۵ سانتی‌متر' } } } });
    await turn('قالبم ۲۵ در ۳۵ نبود، ۳۰ در ۴۰ بود', 'فرستادم.', RT({ msg: 'قالبم ۲۵ در ۳۵ هست', what: 'fact', key: 'datum:قالب', fix: '۳۰ در ۴۰' }));
    const x = await snap(pid), q = ask(x, 'prac.measure'); return { ok: !!q && q.new === '۳۰ سانتی‌متر × ۴۰ سانتی‌متر', got: x.asks }; };
  C[66] = async () => { const pid = await scen({ prior: ['اتاقم ۵۰ متر مربعه'], live: { stmt: 'اتاقم ۵۰ متر مربعه' } });
    await turn('اتاق ۶۰ متره نه ۵۰', 'فرستادم.', RT({ msg: 'اتاقم ۵۰ متر مربعه', what: 'fact', key: 'datum:مساحت', fix: '۶۰ متره', old: '۵۰' }));
    const x = await snap(pid); return { ok: x.st === 'اتاقم ۶۰ متر مربعه' && !GARBLE.test(x.st), got: x.st }; };
  C[67] = async () => { const pid = await scen({ prior: ['۱.۵ پیمونه شکر و ۲ تا تخم‌مرغ زدم'], live: { u: { dl: [{ id: 'd1', t: '۱.۵ پیمونه شکر و ۲ تا تخم‌مرغ' }] } } });
    await ev(async () => __edit(__U(1), '۲.۵ پیمونه شکر و ۳ تا تخم‌مرغ زدم'));
    const x = await snap(pid), q = ask(x, 'dl:d1'); return { ok: !!q && q.new === '۲.۵ پیمونه شکر و ۳ تا تخم‌مرغ' && q.old !== q.new && !GARBLE.test(x.st), got: { asks: x.asks, st: x.st } }; };
  C[68] = async () => { const pid = await scen({ prior: ['قرارم اینه دو تا اسکیس تا جمعه بزنم'], live: { plan: 'دو تا اسکیس تا جمعه' } });
    await ev(async () => __edit(__U(1), 'قرارم اینه سه تا اسکیس تا جمعه بزنم'));
    const x = await snap(pid), q = ask(x, 'plan'); return { ok: !!q && q.new === 'سه تا اسکیس تا جمعه' && !x.asks.some(a => GARBLE.test(a.new)), got: x.asks }; };
  C[69] = async () => { const pid = await scen({ prior: ['عروسی برادرم ۱۰ اسفنده و تا اون موقع می‌خوام لاغر شم'], live: { stmt: 'عروسی برادرم ۱۰ اسفنده و تا اون موقع می‌خوام لاغر شم' }, dl: [{ id: 'd1', what: 'عروسی برادرم ۱۰ اسفنده', date: '2027-03-01', span: 'عروسی برادرم ۱۰ اسفنده', from: 0 }] });
    await turn('تاریخ عروسی ۱۵ اسفنده نه ۱۰', 'فرستادم.', RT({ msg: 'عروسی برادرم ۱۰ اسفنده', what: 'fact', key: 'deadline:d1', fix: '۱۵ اسفنده', old: '۱۰ اسفنده' }));
    const x = await snap(pid), d = x.dls[0]; return { ok: /عروسی برادرم ۱۵ اسفنده/.test(x.st) && !GARBLE.test(x.st) && d && d.date === '2027-03-06' && d.h >= 1 && /۱۵ اسفنده/.test(d.what), got: { st: x.st, d } }; };
  C[70] = async () => { const LES = 'هر عددی که دو رقمِ آخرش بر ۴ بخش‌پذیر باشد بر ۴ بخش‌پذیر است';
    const pid = await scen({ prior: ['درسم اینه: ' + LES], live: {} });
    await ev((LES) => { const s = __cur(), m = __U(1), pid = s.lprob, cd = { id: APP.uid('card'), type: 'card', q: 'درس را بازسازی کن', a: LES, due: APP.today() }; APP.S.put(cd);
      __set(pid, (so, L) => { L.state = 'solved'; L.chat = { sess: s.id, at: new Date().toISOString(), solution: 'بر ۴', mid: APP.liveMsgId(m) }; so.b = { 1: { done: true, from: 'chat', at: new Date().toISOString(), verdict: 'verified', use: LES, src: { use: APP.liveSrc(s.id, APP.liveMsgId(m), 'lesson', LES) }, srcSet: true } }; so.lessons = [{ use: LES, card: cd.id }]; }); window.__card = cd.id; }, LES);
    await turn('درسم رو اشتباه نوشتم، منظورم بر ۸ و سه رقمِ آخر بود', 'فرستادم.', [{ do: 'coach_state', retract: [{ msg: 'دو رقمِ آخرش', what: 'lesson', key: 'lesson', fix: 'سه رقمِ آخر' }, { msg: 'بر ۴ بخش‌پذیر باشد', what: 'lesson', key: 'lesson', fix: 'بر ۸' }] }]);
    const x = await snap(pid), card = await ev(() => APP.S.get(window.__card).a), q = ask(x, 'b.use');
    const full = (q && q.new) || x.b.use, line = ((x.res || {}).changed || []).map(c => c.new).join(' | ');
    return { ok: /سه رقمِ آخرش بر ۸ بخش‌پذیر باشد بر ۸ بخش‌پذیر است/.test(full) && !GARBLE.test(full) && (q ? card === LES : card === x.b.use) && (q || line.indexOf(x.b.use) >= 0), got: { asks: x.asks, use: x.b.use, card, line } }; };
  C[71] = async () => { const pid = await scen({ prior: ['یه صفحه ۱۰×۱۰ دارم که دو گوشه‌اش رو برداشتیم'], live: { u: { dl: [{ id: 'd1', t: '۱۰×۱۰' }] }, b: { verdict: 'verified', chkRes: 'ناممکن (اثبات شد)', chkHow: 'رنگ‌ها را در ۱۰×۱۰ شمردم' } } });
    await turn('صفحه ۸ در ۸ بود نه ۱۰ در ۱۰', 'فرستادم.', RT({ msg: 'یه صفحه ۱۰×۱۰', what: 'fact', key: 'datum:d1', fix: '۸ در ۸', rests: ['verdict'] }));
    const x = await snap(pid); return { ok: x.b.v !== 'verified' && x.b.sup && x.res && x.res.changed.some(c => /حکم/.test(c.rec)), got: { b: x.b, res: x.res } }; };
  C[72] = async () => { const ids = await ev(async () => { __wipe(); __fresh(); await __turn('یه صفحه‌ی کاشی ۱۰ در ۱۰ دارم؛ دو گوشه رو برداشتیم، می‌شه پوشوند؟', 'خب.');
      const s1 = __cur(), P2 = __live('کاشی', 'یه صفحه‌ی کاشی ۱۰ در ۱۰ دارم؛ دو گوشه رو برداشتیم، می‌شه پوشوند؟', { by: 'assistant', sess: s1.id }); APP.liveBindSession(P2, APP.S.get(s1.id)); APP.liveStampSess(APP.S.get(s1.id));
      __set(P2, (so, L) => { L.state = 'solved'; so.b = { 1: { done: true, from: 'page', at: new Date().toISOString(), verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: 'در ۱۰ در ۱۰ رنگ‌ها را شمردم' } }; });
      __fresh(); await __turn('یه مسئله‌ی دیگه دارم دربارهٔ باغچه', 'خب.'); const s2 = __cur(), P1 = __live('باغچه', 'یه مسئله‌ی دیگه دارم دربارهٔ باغچه'); APP.liveBindSession(P1, APP.S.get(s2.id)); return { P1, P2 }; });
    await turn('راستی تو اون مسئله‌ی کاشی، صفحه ۸ در ۸ بود نه ۱۰ در ۱۰', 'فرستادم.', RT({ msg: 'صفحه‌ی کاشی ۱۰ در ۱۰', what: 'fact', key: 'datum:اندازه', fix: '۸ در ۸' }));
    const x = await ev((o) => { const so = APP.S.get('eprog_' + o.P2).solve, D2 = APP.dossier(o.P2), D1 = APP.dossier(o.P1); return { st: APP.S.get('eprob_' + o.P2).p.statement, v: so.b[1].verdict, r2: D2.events.filter(e => e.k === 'retract').length, r1: D1.events.filter(e => e.k === 'retract').length }; }, ids);
    return { ok: /۸ در ۸/.test(x.st) && x.v !== 'verified' && x.r2 === 1 && x.r1 === 0, got: x }; };
  C[73] = async () => { const pid = await scen({ prior: ['تحویلِ گزارش ۸ آبانه', 'گزارش رو شروع کردم', 'دو بخشش مونده', 'منابع رو جمع کردم', 'بخش اول تموم شد', 'بخش دوم سخته', 'یه کم کمک می‌خوام', 'جدول‌ها مونده', 'نمودارها هم', 'فردا ادامه می‌دم', 'امروز خسته‌ام'], dl: [{ id: 'd1', what: 'تحویلِ گزارش', date: '2026-10-30', span: '۸ آبان', from: 0 }] });
    const u = await turn('تحویلِ گزارش ۸ آبان نیست، ۱۰ آبانه', 'فرستادم.', RT({ msg: 'تحویلِ گزارش ۸ آبانه', what: 'fact', key: 'datum:تاریخِ تحویل', fix: '۱۰ آبانه', old: '۸ آبان' }));
    const x = await snap(pid), d = x.dls[0]; return { ok: d && d.date === '2026-11-01' && d.h >= 1 && /deadline:d1/.test(head(u.user)) && !/ثبت نشده بود/.test(x.sys.join(' ')), got: { d, sys: x.sys, res: x.res } }; };
  C[74] = async () => { await scen({ prior: ['دو تا ظرف دارم: ظرف اول ۲۰ لیتر و ظرف دوم ۱۲ لیتر'] });
    await turn('ظرفِ اول ۳۰ لیتر بود، نه ۲۰ لیتر. پس جوابم عوض میشه؟', 'فرستادم.', RT({ msg: 'ظرف اول ۲۰ لیتر', what: 'fact', key: 'datum:ظرف', fix: '۳۰ لیتر' }));
    const x = await snap(''); return { ok: x.rets && x.rets.ok === true, got: x.rets }; };
  C[75] = async () => { const pid = await scen({ prior: ['سه تا میزِ سه‌نفره داریم'], live: { stmt: 'سه تا میزِ سه‌نفره داریم', by: 'user', u: { dl: [{ id: 'd1', t: 'سه میزِ سه‌نفره' }] }, b: { verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: 'با سه‌نفره شمردم' } } });
    await turn('اشتباه گفتم، میزها چهارنفره‌ان نه سه‌نفره', 'فرستادم.', RT({ msg: 'سه تا میزِ سه‌نفره داریم', what: 'fact', key: 'datum:میز', fix: 'چهارنفره', old: 'سه‌نفره' }));
    const x0 = await snap(pid), q = ask(x0, 'dl:d1'); if (!q) return { ok: false, got: x0.asks };
    await ev((id) => APP.liveCopyAnswer(__cur().id, id, true), q.id); const u = await turn('بله', 'خوب.'); const bl = blockOf(u.user, /^# اصلاحی که صفحه انجام داد/), x = await snap(pid);
    return { ok: /چهارنفره/.test(bl) && /حکم/.test(bl) && !/"changed":\[\]/.test(bl) && !x.asks.some(a => a.state === 'open' && a.path === 'dl:d1'), got: { bl: bl.slice(0, 700), asks: x.asks } }; };
  C[76] = async () => { const pid = await scen({ prior: ['رسید رو صبح شمرده بودیم و گام اول رو صبح زدم'], live: { stmt: 'رسید رو صبح شمرده بودیم و گام اول رو صبح زدم' } });
    await ev(() => { const s = __cur(), p2 = __live('دیگری', 'مسئلهٔ بی‌ربط'); s.lprobLog = (s.lprobLog || []).concat([{ p: p2 }]); APP.S.put(s); });
    await turn('اشتباه گفتم، ظهر شمرده بودیم نه صبح', 'فرستادم.', RT({ msg: 'رسید رو صبح شمرده بودیم', what: 'fact', key: 'datum:زمان', fix: 'ظهر', old: 'صبح' }));
    const x = await snap(pid); return { ok: x.res && x.res.changed.length > 0 && !/رکوردی ساخته نشده بود/.test(x.res.note || '') && x.res.changed.every(c => c.old || c.new), got: x.res }; };
  C[77] = async () => { const pid = await scen({ prior: ['۱۰ تا نمونه رو چک کردم، همه درست بود'], live: { stmt: '۱۰ تا نمونه رو چک کردم، همه درست بود' } });
    await turn('۱۰ تاشو چک کردم نه، ۸ تاشو', 'فرستادم.', RT({ msg: '۱۰ تا نمونه رو چک کردم', what: 'fact', key: 'datum:تعداد', fix: '۸', old: '۱۰' }));
    const x = await snap(pid); return { ok: /^۸ تا نمونه رو چک کردم/.test(x.st) && !/ثبت نشده بود/.test(x.sys.join(' ')), got: { st: x.st, sys: x.sys } }; };
  C[78] = async () => { await scen({ prior: ['وزنم ۷۴ شده'] });
    await turn('وزنم ۷۴ و نیم بود نه ۷۴', 'فرستادم.', RT({ msg: 'وزنم ۷۴ شده', what: 'fact', key: 'datum:وزن', fix: '۷۴ و نیم', old: '۷۴' }));
    const x = await ev(() => { const m = __U(1), s = __cur(); return { pts: (m.pts || []).map(p => p.y), lg: APP.S.all('mlog').map(l => l.pts.map(p => p.y)), corr: (m.corr || []).filter(c => c.n > 0).length, res: (s.coach.retNote || {}).res, sys: s.msgs.filter(z => z.role === 'sys').map(z => z.text).slice(-1) }; });
    const ys = x.pts.concat([].concat(...x.lg)); return { ok: ys.indexOf(74.5) >= 0 && ys.indexOf(74) < 0 && (x.corr > 0) === (x.res && x.res.changed.length > 0) && !/ثبت نشده بود/.test(x.sys.join(' ')), got: x }; };
  C[79] = async () => { const pid = await scen({ prior: ['۴۰ تا لیوان آوردم', '۳۵ تا فروختم'], live: { stmt: '۴۰ تا لیوان آوردم. ۳۵ تا فروختم.' } });
    const src = await ev((pid) => APP.S.get('eprob_' + pid).src, pid);
    await turn('۳۵ نه، ۳۲ تا فروختم', 'فرستادم.', RT({ msg: '۳۵ تا فروختم', what: 'fact', key: 'datum:فروش', fix: '۳۲ تا فروختم', old: '۳۵' }));
    const x = await snap(pid); return { ok: (src.parts || []).length >= 2 && /۴۰ تا لیوان آوردم/.test(x.st) && /۳۲ تا فروختم/.test(x.st), got: { src, st: x.st } }; };
  C[80] = async () => { await scen({ prior: ['کارگاه رو ماه بعد شروع می‌کنم', 'باید سه‌شنبه طرحش رو تحویل بدم', 'یه کم نگرانم', 'هنوز شروع نکردم', 'امروز وقت ندارم', 'فردا شاید', 'شاید هم نه', 'باید برنامه بریزم', 'خسته‌ام'],
      dl: [{ id: 'd1', what: 'تحویلِ طرحِ کارگاه', date: '2026-10-20', span: 'سه‌شنبه طرحش رو تحویل بدم', from: 1 }] });
    await turn('طرح نه، بودجه‌ش رو باید تحویل بدم', 'فرستادم.', RT({ msg: 'باید سه‌شنبه طرحش رو تحویل بدم', what: 'fact', key: 'deadline:d1', fix: 'بودجه‌ش', old: 'طرحش' }));
    const x = await snap(''), d = x.dls[0]; return { ok: d && /بودجه/.test(d.what) && d.date === '2026-10-20' && x.rets && x.rets.ok, got: { d, rets: x.rets } }; };
  C[81] = async () => { const pid = await scen({ prior: ['اندازه‌ی قالب ۲۰ بود و فر ۱۸۰ درجه'], live: { stmt: 'اندازه‌ی قالب ۲۰ بود و فر ۱۸۰ درجه', u: { dl: [{ id: 'd1', t: 'قالب ۲۰' }, { id: 'd2', t: 'دمای فر ۱۸۰ درجه' }] }, g: { guess: '۱.۷۵ ساعت', test: 'با دمای فر ۱۸۰ درجه امتحان کردم و سوخت', hit: 'نادرست بود' } } });
    await turn('اندازه‌ی قالب ۲۲ بود نه ۲۰', 'فرستادم.', RT({ msg: 'اندازه‌ی قالب ۲۰ بود', what: 'fact', key: 'datum:قالب', fix: '۲۲', old: '۲۰', rests: [] }));
    const x = await snap(pid); return { ok: x.g.hit === 'نادرست بود' && !x.g.sup, got: x.g }; };
  C[82] = async () => { const pid = await scen({ prior: ['محیط باغچه ۴۰ متره و بزرگ‌ترین شکل رو می‌خوام'], live: { stmt: 'محیط باغچه ۴۰ متره و بزرگ‌ترین شکل رو می‌خوام', title: 'باغچهٔ ۴۰ متری', u: { dl: [{ id: 'd1', t: 'محیط ۴۰ متر' }], one: 'با ۴۰ متر نرده بزرگ‌ترین باغچه', c: 'نرده فقط ۴۰ متره' }, aux: [{ t: 'مستطیل‌های با محیط ۴۰ متر', bridge: 'همان محیط', k: 'special' }], b: { verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: 'برای هر محیطی مربع بیشترین مساحت را دارد', use: 'مربع بهترین است' } } });
    await turn('محیطش ۴۴ متره نه ۴۰', 'فرستادم.', RT({ msg: 'محیط باغچه ۴۰ متره', what: 'fact', key: 'datum:محیط', fix: '۴۴ متره', old: '۴۰', rests: [] }));
    const x = await snap(pid), need = ['dl:d1', 'u.one', 'u.c', 'aux:0'].map(k => ask(x, k)); return { ok: /۴۴ متره/.test(x.st) && /۴۴/.test(x.title) && need.every(q => q && /۴۴ متر/.test(q.new)) && x.b.v === 'verified', got: { st: x.st, t: x.title, asks: x.asks, b: x.b } }; };
  C[83] = async () => { const pid = await scen({ prior: ['هشت تا تخم‌مرغ زدم و کیک پف کرد'], live: { steps: [{ text: 'پختِ کیک', closed: true, what: 'کیک با ۸ تخم‌مرغ پف کرد' }] } });
    await turn('هشت تا نبود، شیش تا تخم‌مرغ زدم', 'فرستادم.', RT({ msg: 'هشت تا تخم‌مرغ زدم', what: 'fact', key: 'datum:تخم‌مرغ', fix: 'شیش تا', old: 'هشت تا' }));
    const x = await snap(pid), q = ask(x, /^out:/); return { ok: !!q && q.new === 'کیک با ۶ تخم‌مرغ پف کرد', got: x.asks }; };
  /* ---- منفی‌ها ---- */
  C[84] = async () => { const pid = await scen({ prior: ['هر روز ۴ ساعت روی این مسئله کار کردم'], live: { b: { worked: 'هر عددی که دو رقمِ آخرش بر ۴ بخش‌پذیر باشد' } } });
    await ev(async () => __edit(__U(1), 'هر روز ۵ ساعت روی این مسئله کار کردم'));
    const x = await snap(pid); return { ok: !x.asks.some(a => /^b\./.test(a.path)), got: x.asks }; };
  C[85] = async () => { const pid = await scen({ prior: ['اتاق ۵۰ متر مربعه و یه طناب دارم'], live: { u: { dl: [{ id: 'd1', t: 'طنابِ ۵۰ متری' }] } } });
    await turn('اتاق ۵۰ متر مربع نیست، ۶۰ متر مربعه', 'فرستادم.', RT({ msg: 'اتاق ۵۰ متر مربعه', what: 'fact', key: 'datum:مساحت', fix: '۶۰ متر مربعه', old: '۵۰' }));
    const x = await snap(pid); return { ok: !ask(x, 'dl:d1'), got: x.asks }; };
  C[86] = async () => { const pid = await scen({ prior: ['متراژ خونه ۵۰ ـه'], live: { u: { dl: [{ id: 'd1', t: 'اجاره ۵۰ میلیون' }] } } });
    await turn('متراژش ۵۰ نیست، ۶۰ ـه', 'فرستادم.', RT({ msg: 'متراژ خونه ۵۰ ـه', what: 'fact', key: 'datum:متراژ', fix: '۶۰', old: '۵۰' }));
    const x = await snap(pid); return { ok: !ask(x, 'dl:d1') && x.u.dl[0] === 'اجاره ۵۰ میلیون', got: { asks: x.asks, dl: x.u.dl } }; };
  C[87] = async () => { const pid = await scen({ prior: ['تحویلش پنجشنبه‌ست و حدسم اینه که با دو روز کار تموم میشه'], live: { u: { dl: [{ id: 'd1', t: 'دو روز کار' }] }, g: { guess: 'دو روز بس است', test: 'دو روز کار کردم و تموم نشد', hit: 'نادرست بود' }, suff: 'کافی است' },
      dl: [{ id: 'd1', what: 'تحویل', date: '2026-10-22', span: 'تحویلش پنجشنبه‌ست', from: 0 }] });
    await turn('تحویلش پنجشنبه نیست، شنبه‌ست', 'فرستادم.', RT({ msg: 'تحویلش پنجشنبه‌ست', what: 'fact', key: 'deadline:d1', fix: 'شنبه‌ست', old: 'پنجشنبه' }));
    const x = await snap(pid), d = x.dls[0]; return { ok: d && d.date === '2026-10-24' && x.g.hit === 'نادرست بود' && !x.g.sup && x.suff && x.suff.ans === 'کافی است', got: { d, g: x.g, suff: x.suff } }; };
  C[88] = async () => { const pid = await scen({ prior: ['محیط ۴۰ متره'], live: { stmt: 'محیط ۴۰ متره', b: { verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: 'برای هر محیطی مربع بیشترین مساحت را دارد', use: 'مربع بهترین است' } } });
    const u = await turn('محیط ۴۴ متره نه ۴۰', 'فرستادم.', RT({ msg: 'محیط ۴۰ متره', what: 'fact', key: 'datum:محیط', fix: '۴۴', old: '۴۰', rests: [] }));
    const x = await snap(pid); return { ok: x.b.v === 'verified' && !x.b.sup && !(x.res && x.res.changed.some(c => /حکم/.test(c.rec))), got: { b: x.b, res: x.res } }; };
  C[89] = async () => { await scen({ prior: ['اتاقم ۵۰ متره'] }); await turn('اگه اتاق ۶۰ متر بود چی می‌شد؟', 'فکر کن.', RT({ msg: 'اتاقم ۵۰ متره', what: 'fact', fix: '۶۰ متر' }));
    const x = await snap(''); return { ok: x.rets && x.rets.ok === false && /پرسش|نشانهٔ اصلاح/.test(x.rets.err), got: x.rets }; };
  C[90] = async () => { const c = await ev(() => APP.ASSIST.corrAsk('اشتباه کردم، فقط ۴۰ درصدشو یادم بود')); return { ok: c === false, got: c }; };
  C[91] = async () => { const c = await ev(() => APP.ASSIST.corrAsk('اون جوابی که دیروز تو تمرین گفتم غلطه')); return { ok: c === false, got: c }; };
  C[92] = async () => { const pid = await scen({ prior: ['وزنم ۷۴ کیلوئه'], live: { u: { dl: [{ id: 'd1', t: '۷۴ کیلو' }] } } });
    await turn('۷۴ کیلو بود، درسته', 'باشه.', RT({ msg: 'وزنم ۷۴ کیلوئه', what: 'fact', fix: '۷۴ کیلو' }));
    const x = await snap(pid), h = await ev((pid) => (APP.S.get('eprog_' + pid).solve.u[1].fixHist || []).length, pid); return { ok: h === 0 && !x.asks.length && (!x.rets || x.rets.ok === false), got: { h, rets: x.rets } }; };
  C[93] = async () => { const pid = await scen({ prior: ['بام ۲۰۰ مترمربعه'], live: { u: { dl: [{ id: 'd1', t: 'بامِ انبار ۲۰۰ مترمربع' }] }, b: { verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: 'با ۲۰۰ مترمربع حساب کردم' } } });
    await turn('بام ۱۸۰ ـه نه ۲۰۰', 'فرستادم.', RT({ msg: 'بام ۲۰۰ مترمربعه', what: 'fact', key: 'datum:بام', fix: '۱۸۰', old: '۲۰۰' }));
    const x0 = await snap(pid), q = ask(x0, 'dl:d1'); if (!q) return { ok: false, got: x0.asks };
    const vBefore = x0.b.v; await ev((id) => APP.liveCopyAnswer(__cur().id, id, false), q.id); const x = await snap(pid);
    return { ok: /۲۰۰/.test(x.u.dl[0]) && x.asks.filter(a => a.path === 'dl:d1')[0].state === 'no' && x.b.v === vBefore, got: { dl: x.u.dl, asks: x.asks, b: x.b, vBefore } }; };
  C[94] = async () => { const ids = await ev(async () => { __wipe(); __fresh(); await __turn('بسته‌بندی ۸۰۰ تا جعبه لازم داره', 'خب.'); const s = __cur();
      const P1 = __live('بسته‌بندی', 'بسته‌بندی ۸۰۰ تا جعبه لازم داره', { by: 'assistant', sess: s.id }); APP.liveStampSess(APP.S.get(s.id)); const P2 = __live('تیکت‌های پشتیبانی', 'تیکت‌ها زیاد شده‌اند'); APP.liveBindSession(P2, APP.S.get(s.id));
      __set(P2, (so) => { so.b = { 1: { done: true, from: 'page', at: new Date().toISOString(), bestQ: 'کدام پرسش کمک کرد؟ — از آخر به عقب' } }; }); return { P1, P2 }; });
    await turn('اشتباه گفتم، ۷۵۰ تا جعبه نه ۸۰۰', 'فرستادم.', RT({ msg: 'بسته‌بندی ۸۰۰ تا جعبه', what: 'fact', key: 'datum:تعداد', fix: '۷۵۰', old: '۸۰۰' }));
    const x = await ev((o) => { const D1 = APP.dossier(o.P1), D2 = APP.dossier(o.P2); return { r1: D1.events.filter(e => e.k === 'retract').length, r2: D2.events.filter(e => e.k === 'retract').length, bq: APP.S.get('eprog_' + o.P2).solve.b[1].bestQ }; }, ids);
    return { ok: x.r1 === 1 && x.r2 === 0 && /از آخر به عقب/.test(x.bq), got: x }; };
  C[95] = async () => { const pid = await scen({ prior: ['حدسم اینه که جواب ۱۲ ـه'], live: { stmt: 'حدسم اینه که جواب ۱۲ ـه' } });
    await ev(async () => __edit(__U(1), 'حدسم اینه که جواب ۱۴ ـه'));
    const n = await ev((pid) => APP.dossier(pid).events.filter(e => e.k === 'retract').length, pid); return { ok: n === 1, got: n }; };
  C[96] = async () => NC('mind card (a29, «prereq+route» fixer): step successes withdrawn by basis are the mind-card booking; this fixer covers verdict/guess/solved/suff by basis (#71, #81, #88)');
  C[97] = async () => { await scen({ prior: ['ظرف اول ۲۰ لیتر و ظرف دوم ۳۰ لیتره'] }); await turn('فرض کن ظرف ۸ لیتر بود، اون وقت چی؟', 'فکر کن.', RT({ msg: 'ظرف اول ۲۰ لیتر', what: 'fact', fix: '۸ لیتر' }));
    const x = await snap(''); return { ok: x.rets && x.rets.ok === false, got: x.rets }; };
  C[98] = async () => { const pid = await scen({ prior: ['طول دیوار ۱۰ متره'], live: { u: { dl: [{ id: 'd1', t: '۱۰ نفر مهمون' }] } } });
    await turn('طول دیوار ۱۰ متر نیست، ۱۲ متره', 'فرستادم.', RT({ msg: 'طول دیوار ۱۰ متره', what: 'fact', key: 'datum:دیوار', fix: '۱۲ متره', old: '۱۰' }));
    const x = await snap(pid); return { ok: !ask(x, 'dl:d1'), got: x.asks }; };
  C[99] = async () => { const pid = await scen({ prior: ['وزن بابام ۷۴ ـه'], live: { u: { dl: [{ id: 'd1', t: 'وزنم ۷۴' }] } } });
    await turn('وزن بابام ۷۴ نیست، ۸۰ ـه', 'فرستادم.', RT({ msg: 'وزن بابام ۷۴ ـه', what: 'fact', key: 'datum:وزنِ بابا', fix: '۸۰', old: '۷۴' }));
    const x = await snap(pid); return { ok: !ask(x, 'dl:d1') && x.u.dl[0] === 'وزنم ۷۴', got: { asks: x.asks, dl: x.u.dl } }; };
  /* ---- P8، بخشِ همین فایل‌ها (a38/a40/a29/a39) به خواستِ هماهنگ‌کننده ---- */
  const withDay = (day, f) => ev(async ([day, src]) => { const o = APP.today; APP.today = () => day; try { return await (0, eval)('(' + src + ')')(); } finally { APP.today = o; } }, [day, String(f)]);
  C[174] = async () => { const pid = await scen({ prior: ['مسئله‌ی شیرها رو حل کردم'], live: { b: { verdict: 'verified' } } });
    await ev((pid) => __set(pid, (so) => { so.b[1].newProbs = [{ id: 'np1', t: 'اگر ۴ شیر بود؟', title: 'اگر ۴ شیر بود؟', at: '2026-10-18T09:00:00.000Z' }]; }), pid);
    const d0 = await withDay('2026-10-18', () => (APP.dueList() || []).map(x => x.txt).join(' | ')), d7 = await withDay('2026-10-25', () => (APP.dueList() || []).map(x => x.txt).join(' | '));
    return { ok: !/اگر ۴ شیر بود/.test(d0) && /اگر ۴ شیر بود/.test(d7), got: { d0: d0.slice(0, 300), d7: d7.slice(0, 300) } }; };
  const dorm = async (d) => { const pid = await scen({ prior: ['یه مسئله‌ی تازه'], live: {} }); await ev(([pid, d]) => { const r = APP.S.get('eprob_' + pid); r.dormant = d; APP.S.put(r); }, [pid, d]); return withDay('2026-10-18', new Function('return APP.dossier(' + JSON.stringify(pid) + ').state')); };
  C[175] = async () => { const st = await dorm('2026-10-11'); return { ok: !/خفته تا/.test(st), got: st }; };
  C[188] = async () => { const st = await dorm('2026-10-24'); return { ok: /خفته تا ۲ آبان/.test(st), got: st }; };
  C[176] = async () => { const pid = await scen({ prior: ['قالب ۲۰ سانتیه و کیک رو چند برابر کنم؟'], live: { title: 'کیک در قالبِ ۲۰', stmt: 'قالب ۲۰ سانتیه و کیک رو چند برابر کنم؟' } });
    await turn('اشتباه گفتم، قالب ۲۲ بود نه ۲۰', 'فرستادم.', RT({ msg: 'قالب ۲۰ سانتیه', what: 'fact', key: 'datum:قالب', fix: '۲۲', old: '۲۰' }));
    const x = await snap(pid); return { ok: /۲۲/.test(x.st) && x.title === 'کیک در قالبِ ۲۲', got: { st: x.st, t: x.title } }; };
  C[186] = async () => { const pid = await scen({ prior: ['قالب ۲۰ سانتیه و فر ۱۸۰ درجه'], live: { title: 'کیک در قالبِ ۲۰', stmt: 'قالب ۲۰ سانتیه', u: { dl: [{ id: 'd1', t: 'فر ۱۸۰ درجه' }] } } });
    await turn('اشتباه گفتم، فر ۲۰۰ درجه بود نه ۱۸۰', 'فرستادم.', RT({ msg: 'فر ۱۸۰ درجه', what: 'fact', key: 'datum:فر', fix: '۲۰۰', old: '۱۸۰' }));
    const x = await snap(pid); return { ok: x.title === 'کیک در قالبِ ۲۰', got: x.title }; };
  const zw = async (txt0, txt1) => { const pid = await scen({ prior: [txt0], live: {} }); await ev(([pid, t]) => { const s = __cur(), m = __U(1); __set(pid, (so, L) => { L.plan = { t: t, at: new Date().toISOString(), src: APP.liveSrc(s.id, APP.liveMsgId(m), 'plan', t) }; }); }, [pid, txt0]);
    await ev(async (t1) => __edit(__U(1), t1), txt1); return ev((pid) => APP.S.get('eprog_' + pid).solve.live.plan.t, pid); };
  C[177] = async () => { const t = await zw('برنامه‌ی هفته‌ای سه روز', 'برنامه‌ی هفته‌ای چهار روز'); return { ok: t === 'برنامه‌ی هفته‌ای چهار روز', got: t }; };
  C[183] = async () => { const t = await zw('برنامه ی هفته ای سه روز', 'برنامه ی هفته ای چهار روز'); return { ok: t === 'برنامه ی هفته ای چهار روز', got: t }; };
  const lb = async (rests) => { const pid = await scen({ prior: ['محیط ۴۰ متره'], live: { stmt: 'محیط ۴۰ متره', u: { dl: [{ id: 'd1', t: 'محیط ۴۰ متر' }] }, b: { verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: 'برای هر محیطی مربع بهترین است', use: 'مربع بهترین است', own: true } } });
    await turn('محیط ۴۴ متره نه ۴۰', 'فرستادم.', RT({ msg: 'محیط ۴۰ متره', what: 'fact', key: 'datum:محیط', fix: '۴۴', old: '۴۰', rests }));
    return ev((pid) => ({ inMind: JSON.stringify(APP.MIND.phases({ pid: pid })).indexOf('نتیجه سالم ماند') >= 0 || JSON.stringify(APP.MIND.phases()).indexOf('lb:' + pid) >= 0, v: APP.S.get('eprog_' + pid).solve.b[1].verdict }), pid); };
  C[179] = async () => { const x = await lb(['verdict']); return { ok: x.v !== 'verified' && !x.inMind, got: x }; };
  C[187] = async () => { const x = await lb([]); return { ok: x.v === 'verified' && x.inMind, got: x }; };
  C[180] = async () => { await scen({ prior: [] }); await turn('وزنم هر دو هفته: ۷۸، ۷۷٫۲، ۷۶٫۵، ۷۵٫۱، ۷۴', 'خب.');
    const x = await ev(async () => { const AS = APP.ASSIST, oc = AS.cur, sid = __cur().id; APP.go('today'); AS.store('cur', sid); AS.toggle(true); AS.paint(); await new Promise(r => setTimeout(r, 150));
      /* بارگذاریِ دوباره: حباب‌ها پیش از رسیدنِ سشن کشیده می‌شوند (رکوردِ پیام هنوز پیدا نیست) */
      AS.cur = () => ({ msgs: [] });
      try { document.querySelectorAll('.as-msg').forEach(m => { m.querySelectorAll('.mx-plot').forEach(z => z.remove()); m.removeAttribute('data-mxv'); m.removeAttribute('data-mxr'); }); const d = document.createElement('i'); document.body.appendChild(d); await new Promise(r => setTimeout(r, 60)); d.remove(); await new Promise(r => setTimeout(r, 60)); } finally { AS.cur = oc; }
      await new Promise(r => setTimeout(r, 900)); const um = [...document.querySelectorAll('.as-msg.user')].filter(m => /۷۷٫۲/.test(m.textContent)); return { n: um.length, plot: um.some(m => !!m.querySelector('.mx-plot')) }; });
    if (!x.n) return NC('assistant panel not painted in this harness (a39 decorate needs the .as-msg bubbles); covered by the a39 retry code path only');
    return { ok: x.plot, got: x }; };
  C[184] = async () => C[95]();
  function NC(why) { return { nc: why }; }
  for (const e of P3) { const i = idx(e), f = C[i]; let r;
    if (!f) { out.nc[i] = 'no check written'; out.summary.nc++; out.fail.push('#' + i + ' has no check'); continue; }
    try { r = await f(); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; }
    if (r.nc) { out.nc[i] = r.nc; out.summary.nc++; continue; }
    if (r.ok) out.summary.pass++; else { out.summary.fail++; out.fail.push('#' + i + ' [' + e.kind + '/' + e.role + '] «' + e.text.slice(0, 80) + '» → ' + e.expect.slice(0, 140) + ' :: ' + JSON.stringify(r.got).slice(0, +process.env.GOTN || 700)); } }
  return out;
}
module.exports = { run };
