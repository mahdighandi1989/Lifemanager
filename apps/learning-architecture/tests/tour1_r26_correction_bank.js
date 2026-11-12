// بانکِ مستقلِ VARIANTS_R26 — هر ورودیِ Q2.correction_reach یک بررسی (برای tests/test_tour1_r26_correction_bank.js؛ خودش آزمون نیست).
// شماره‌ها ۱‌پایه‌اند (همان #n ِ VARIANTS_R26.md). متنِ ورودی‌ها دست نخورده است؛ NC = ورودی‌ای که برآورده نشد، با دلیل (در گزارشِ fixer هم آمده).
async function run(ctx) {
  const { ev, turn, bank, Q2, H } = ctx;
  const { scen, snap, edit, yesAll, RES, st2, has, vals, allText, CS, RT, J } = H;
  const out = { summary: { pass: 0, fail: 0, nc: 0, of: Q2.length }, nc: {}, fail: [] };
  const none = (x, L) => !vals(x).some(v => L.includes(v));
  const onlyRe = (x, M) => x.stale.every(z => z.re == null || (M[z.v] != null && Math.abs(M[z.v] - z.re) < 1e-6));   // C11
  const STALE = /کهنه|با عددِ پیشین|دیگر برقرار نیست|حساب شده بود؟/;
  const C = {}, NC = {};
  /* ---- «مسئلهٔ رنگ» (دفترِ کارِ پیشین، سه گامِ ✓) ---- */
  const PAINT = 'دیوار ۶ در ۲٫۸ متره، میشه ۱۶٫۸ مترمربع. هر لیتر ۸ مترمربع رو می‌پوشونه، پس ۲٫۱ لیتر. دو دست می‌زنم، میشه ۴٫۲ لیتر';
  const paint = (extra) => scen(Object.assign({ prior: [PAINT].concat((extra && extra.more) || []), live: Object.assign({ prior: { sum: '۳ گام — همه درست', resume: 0, steps: [{ n: 1, quote: 'دیوار ۶ در ۲٫۸ متره، میشه ۱۶٫۸ مترمربع', verdict: 'ok', why: '', dep: [], depWrong: [] }, { n: 2, quote: 'هر لیتر ۸ مترمربع رو می‌پوشونه، پس ۲٫۱ لیتر', verdict: 'ok', why: '', dep: [1], depWrong: [] }, { n: 3, quote: 'دو دست می‌زنم، میشه ۴٫۲ لیتر', verdict: 'ok', why: '', dep: [2], depWrong: [] }] } }, (extra && extra.live) || {}) }, {}));
  const paintFix = (text) => turn(text || 'ببخشید طولِ دیوار ۷ متره، نه ۶', 'فرستادم.', RT({ msg: 'دیوار ۶ در ۲٫۸ متره', key: 'datum:طولِ دیوار', what: 'fact', fix: '۷ متر', old: '۶' }));
  const stN = (x, n) => (x.prior || []).filter(s => s.n === n)[0] || {};
  const reOf = (st, v) => ((st.stale || []).filter(z => z.v === v)[0] || {}).re;
  C[43] = async () => { const pid = await paint(); await paintFix(); const x = await snap(pid);
    return { ok: [1, 2, 3].every(n => !!stN(x, n).stale) && Math.abs(reOf(stN(x, 1), 16.8) - 19.6) < 1e-6 && Math.abs(reOf(stN(x, 2), 2.1) - 2.45) < 1e-6 && Math.abs(reOf(stN(x, 3), 4.2) - 4.9) < 1e-6 && /گام‌های ۱، ۲، ۳ کهنه/.test(allText(x)), got: { prior: x.prior, sys: x.sys } }; };
  C[44] = async () => { await scen({ prior: ['۴۲۰ کیلومتر راهه', RES('صدی ۸ لیتر می‌سوزونه، پس ۳۳٫۶ لیتر'), RES('لیتری ۳۰۰۰ تومن، میشه ۱۰۰۸۰۰ تومن')] });
    await turn('مسیر ۴۲۰ نیست، از جادهٔ جدید ۴۵۰ کیلومتره', 'فرستادم.', RT({ msg: '۴۲۰ کیلومتر راهه', key: 'datum:مسیر', what: 'fact', fix: '۴۵۰ کیلومتر', old: '۴۲۰ کیلومتر' }));
    const x = await snap(''); return { ok: x.ev.length === 2 && x.ev.every(e => !!e.stale) && /۳۶/.test(x.sstale + allText(x)) && /108000|۱۰۸۰۰۰/.test(x.sstale + allText(x)), got: { ev: x.ev, sstale: x.sstale, sys: x.sys } }; };
  C[45] = async () => { await scen({ prior: [RES('کلاس ۲۸ نفره، گروه‌های ۴ نفره، پس ۷ گروه')], stmtChat: 'کلاس ۲۸ نفره، گروه‌های ۴ نفره' });
    await turn('کلاس ۲۸ نفر نیست، ۳۲ نفره', 'فرستادم.', RT({ msg: 'کلاس ۲۸ نفره', key: 'datum:کلاس', what: 'fact', fix: '۳۲ نفر', old: '۲۸ نفر' }));
    const x = await snap(''); return { ok: x.ev.some(e => /۷ گروه/.test(e.span) && !!e.stale) && !!x.strip && STALE.test(allText(x)), got: { ev: x.ev, strip: x.strip, sys: x.sys, sstale: x.sstale } }; };
  const TANK = async () => { const pid = await scen({ prior: ['بام ۱۵۰ مترمربع، بارش ۰٫۲ متر، ضریبِ جمع‌آوری ۰٫۸', RES('۱۵۰ × ۰٫۲ × ۰٫۸ = ۲۴ مترمکعب')], live: { stmt: 'مخزنِ آبِ باران چقدر باشد؟', u: { one: 'اندازهٔ مخزن', dl: [{ id: 'd1', t: 'بام ۱۵۰ مترمربع' }, { id: 'd2', t: 'بارش ۰٫۲ متر' }, { id: 'd3', t: 'ضریبِ جمع‌آوری ۰٫۸' }] }, plan: 'مخزنِ ۲۵ مترمکعبی می‌گیرم که ۲۴ تا جا بشه' } });
    await turn('بام ۱۵۰ متر نیست، ۱۲۰ متره', 'فرستادم.', RT({ msg: 'بام ۱۵۰ مترمربع', key: 'datum:بام', what: 'fact', fix: '۱۲۰ متر', old: '۱۵۰ مترمربع' })); await yesAll(); return snap(pid); };
  C[46] = async () => { const x = await TANK(); return { ok: has(x, 24, 19.2) && x.stale.some(z => /^plan/.test(z.k)) && none(x, [0.8, 0.2]) && !/«۰٫۸»|«۰٫۲»|نتیجهٔ «۰٫/.test(allText(x)) && /بام ۱۲۰/.test(x.dl.join(' ')), got: { s: x.stale, ch: x.ch, dl: x.dl } }; };
  C[47] = async () => { const pid = await scen({ prior: ['جمله‌های دنباله: ۲، ۹، ۱۴، ۱۷', RES('تفاضل‌ها ۷ و ۵ و ۳ هستن')], live: { stmt: 'جملهٔ بعدیِ دنبالهٔ ۲، ۹، ۱۴، ۱۷ چیست؟', u: { one: 'جملهٔ بعدی', dl: [{ id: 'd1', t: 'دنباله: ۲، ۹، ۱۴، ۱۷' }] } } });
    await turn('جملهٔ دوم رو اشتباه نوشتم، ۱۰ است نه ۹', 'فرستادم.', RT({ msg: '۲، ۹، ۱۴، ۱۷', key: 'datum:جملهٔ دوم', what: 'fact', fix: '۱۰', old: '۹' })); await yesAll(); const x = await snap(pid);
    return { ok: has(x, 7, 8) && has(x, 5, 4) && none(x, [3, 2, 14, 17]) && onlyRe(x, { 7: 8, 5: 4 }), got: { s: st2(x), ch: x.ch } }; };
  NC[48] = 'not built this round: the forecast row (🎯), the practice session «(درست)» and the look-back check are stored and rendered by a41/a40/a29 (fixer «today»); the correction engine only sets the outcome of the guess aside. Reported in the hand-back with the contract a38 offers (A.liveRestsOn / A.liveCorrStale).';
  C[49] = async () => { await scen({ prior: ['می‌خوام بیشتر ورزش کنم ولی نمی‌دونم چطور شروع کنم؛ هفته‌ای دو بار ورزش می‌کنم و کمه', 'باشگاهِ نزدیکِ خونه هم هست.'] });
    /* رکوردِ صفحه «مجهول به حرفِ خودت» از پیامِ دیگری (بازگفتِ همان واقعیت) */
    await ev(() => { const s = __cur(); s.coach = s.coach || {}; s.coach.unkBy = s.coach.unkBy || {}; s.coach.unkBy[s.coach.pk || 'c:0'] = 'الان فقط هفته‌ای دو بار ورزش می‌کنم'; APP.S.put(s); });
    await turn('اول گفتم هفته‌ای دو بار؛ دفترم رو نگاه کردم، سه بار بوده', 'فرستادم.', RT({ msg: 'هفته‌ای دو بار ورزش می‌کنم و کمه', key: 'datum:ورزش', what: 'fact', fix: 'سه بار', old: 'دو بار' }));
    const x = await snap(''), u = await ev(() => Object.values(__cur().coach.unkBy || {}));
    return { ok: (u.every(t => !/دو بار/.test(t)) && u.some(t => /سه بار/.test(t)) || x.asks.some(q => q.state === 'open' && /دو بار/.test(q.old) && /سه بار/.test(q.new))) && !/چیزی برای عوض کردن نبود|ثبت نشده بود/.test(allText(x)) && !x.refused, got: { unk: u, asks: x.asks, ch: x.ch, sys: x.sys, refused: x.refused } }; };
  C[50] = async () => { await scen({ prior: ['قطرِ لوله ۲ سانت', RES('دورِ لوله حدودِ ۶٫۳ سانت')], stmtChat: 'قطرِ لوله ۲ سانت' });
    await turn('دوباره اندازه گرفتم، قطرش ۱٫۶ شد نه ۲؛ حالا چند تا بست لازم دارم؟', 'فرستادم.', RT({ msg: 'قطرِ لوله ۲ سانت', key: 'datum:قطر', what: 'fact', fix: '۱٫۶ سانت', old: '۲ سانت' }));
    const x = await snap(''); return { ok: !x.refused && !/پرسش بود/.test(allText(x)) && x.ch.length > 0 && x.ev.some(e => /۶٫۳/.test(e.span) && !!e.stale), got: { ch: x.ch, ev: x.ev, refused: x.refused, sys: x.sys } }; };
  C[51] = async () => { await scen({ prior: ['قالبِ اول ۴۵ سانته و قالبِ دوم ۳۰ سانت.', { t: 'حدسم: ۴۵ تقسیم بر ۳۰ یعنی ۱٫۵ برابر', a: CS({ ph: 'p', said: ['guess'], guess: '۴۵ تقسیم بر ۳۰ یعنی ۱٫۵ برابر' }) }] });
    await turn('۴۵ نبود، ۳۶ بود', 'فرستادم.', RT({ msg: 'قالبِ اول ۴۵ سانته', key: 'datum:قالبِ اول', what: 'fact', fix: '۳۶', old: '۴۵', rests: ['guess'] }));
    const x = await snap(''); const q = x.asks.filter(a => /۴۵ تقسیم بر ۳۰/.test(a.old)), g = x.cg.map(c => c.t).join(' | ');
    return { ok: !/۳۶ تقسیم بر ۳۰ یعنی ۱٫۵/.test(J(x.asks) + g + allText(x)) && (q.some(a => /۳۶ تقسیم بر ۳۰ یعنی ۱٫۲ برابر/.test(a.new)) || /۳۶ تقسیم بر ۳۰ یعنی ۱٫۲ برابر/.test(g) || (!q.length && /۴۵ تقسیم بر ۳۰ یعنی ۱٫۵/.test(g) && STALE.test(allText(x)))), got: { asks: x.asks, cg: x.cg, ch: x.ch, sstale: x.sstale } }; };
  C[52] = async () => { await scen({ prior: [{ t: 'هر دور ۲۵ دقیقه‌ست، ۴ دور یعنی ۱۰۰ دقیقه', a: CS({ ph: 'p', said: ['plan'], plan: 'هر دور ۲۵ دقیقه‌ست، ۴ دور یعنی ۱۰۰ دقیقه' }) }, 'بعدش یه استراحت می‌کنم.'] });
    const r = await edit(1, ['۲۵ دقیقه', '۳۰ دقیقه']); const x = await snap('');
    const tx = allText(x) + x.sstale; return { ok: /100>120|۱۰۰ ⇒ ۱۲۰/.test(tx) && !/[۰-۹]+ رویدادِ کارنامه از همان بخش پس گرفته شد(?! \()/.test(tx), got: { r: r.r, ch: x.ch, sstale: x.sstale, sys: x.sys } }; };
  C[53] = async () => { const pid = await scen({ stmt0: 'طرحِ لوگوی مغازه رو چطور انتخاب کنم؟', prior: [RES('تا حالا دو تا طرحِ اولیه کشیدم'), 'بعدش ادامه میدم.'], live: { stmt: 'طرحِ لوگوی مغازه', solved: 'طرحِ نهایی انتخاب شد' } });
    const a = await snap(pid); await edit(1, ['دو تا', 'سه تا']); const x = await snap(pid);
    const rec0 = a.story.concat(a.evlog).filter(t => /دو تا طرحِ اولیه/.test(t)), rec1 = x.story.concat(x.evlog).filter(t => /^(?:res:|نتیجه \(از گفت‌وگو\) :: )سه تا طرحِ اولیه|:: تا حالا سه تا طرحِ اولیه|res:تا حالا سه تا/.test(t));
    return { ok: rec0.length > 0 && rec1.length > 0 && !x.story.some(t => /دو تا طرحِ اولیه/.test(t)) && x.evlog.filter(t => /نتیجه/.test(t)).every(t => !/^[^|]*دو تا طرحِ اولیه/.test(t.split(' :: ')[1] || '')) && !/هیچ رکوردی ساخته نشده|رکوردی ساخته نشده بود/.test(allText(x)), got: { before: rec0, story: x.story, evlog: x.evlog, ch: x.ch, sys: x.sys } }; };
  C[54] = async () => { const pid = await paint(); await paintFix(); const x = await snap(pid); const r = await turn('خب، حالا چی؟', 'ادامه بده.');
    const blk = String(r.user || ''); return { ok: !!x.res && (x.res.changed || []).some(c => /کارِ پیشینِ تو/.test(c.rec) && /۱، ۲، ۳/.test(c.new)) && !/چیزی عوض نشد|رکوردی ساخته نشده/.test(String(x.res.note || '')) && /گام‌های ۱، ۲، ۳ کهنه/.test(blk), got: { res: x.res, has: /گام‌های ۱، ۲، ۳ کهنه/.test(blk) } }; };
  const RECHK = async () => { const pid = await scen({ prior: ['حوضِ مستطیلی ۴ در ۶ متره؛ مساحتش چقدره؟', RES('۴ × ۶ = ۲۴ مترمربع')], live: { stmt: 'حوضِ مستطیلی ۴ در ۶ متره؛ مساحتش چقدره؟', u: { one: 'مساحتِ حوض', dl: [{ id: 'd1', t: 'حوض ۴ در ۶ متر' }] }, solved: '۲۴ مترمربع' } });
    await turn('عرضِ حوض ۴ نیست، ۵ متره', 'فرستادم.', RT({ msg: 'حوضِ مستطیلی ۴ در ۶ متره', key: 'datum:عرض', what: 'fact', fix: '۵ متر', old: '۴', rests: ['solved'] })); return pid; };
  const QRE = /با مقدارِ اصلاح‌شده \(«[^»]*»\) نتیجه را دوباره وارسی کند/;
  C[55] = async () => { await RECHK(); const t1 = await turn('راستی فردا مهمون دارم.', 'خوش بگذره.'), t2 = await turn('هوا هم سرد شده.', 'بله.'), t3 = await turn('یه چای هم دم کردم.', 'نوشِ جان.');
    return { ok: QRE.test(t1.user) && QRE.test(t2.user) && QRE.test(t3.user), got: { t1: QRE.test(t1.user), t2: QRE.test(t2.user), t3: QRE.test(t3.user) } }; };
  C[72] = async () => { await RECHK(); const t1 = await turn('راستی فردا مهمون دارم.', 'خوش بگذره.'), t2 = await turn('آره دوباره بسنج', 'می‌سنجیم.'), t3 = await turn('خب.', 'خب.'), t4 = await turn('دیگه چی؟', 'هیچ.');
    return { ok: QRE.test(t1.user) && !QRE.test(t3.user) && !QRE.test(t4.user), got: { t1: QRE.test(t1.user), t2: QRE.test(t2.user), t3: QRE.test(t3.user), t4: QRE.test(t4.user) } }; };
  C[56] = async () => { const M = 'جدولِ ۱۲×۱۲ داریم؛ می‌خوام با کاشیِ ۱×۲ بپوشونمش.'; const pid = await scen({ prior: [M], live: { title: 'کاشی‌کاریِ جدولِ ۱۲×۱۲', stmt: M, u: { one: 'جدولِ ۱۲×۱۲ را می‌شود با کاشیِ ۱×۲ پوشاند؟', dl: [{ id: 'd1', t: 'جدولِ ۱۲×۱۲ (۱۴۴ خانه)' }] }, steps: ['جدول ۱۴۴ خانه دارد', 'نصفش ۷۲ تا کاشی می‌شود'] } });
    await turn('جدول ۱۰×۱۰ بود نه ۱۲×۱۲', 'فرستادم.', RT({ msg: 'جدولِ ۱۲×۱۲ داریم', key: 'datum:اندازهٔ جدول', what: 'fact', fix: '۱۰×۱۰', old: '۱۲×۱۲' })); const a = await snap(pid);
    const labels = a.asks.filter(q => q.state === 'open').map(q => q.label + '|' + q.path); await yesAll(); const x = await snap(pid);
    return { ok: has(a, 144, 100) && has(a, 72, 50) && /۱۰×۱۰ \(۱۰۰ خانه\)/.test(x.dl.join(' ')) && !/۱۰×۱۰ \(۱۴۴/.test(J(x.dl) + J(a.asks)) && /۱۰×۱۰/.test(x.title) && !/۱۲×۱۲/.test(x.title) && labels.length === labels.filter((l, i) => labels.indexOf(l) === i).length && a.asks.filter(q => q.label === 'صورتِ مسئله').length <= 1, got: { s: st2(a), dl: x.dl, title: x.title, labels } }; };
  C[57] = async () => { const pid = await paint({ live: { u: { one: 'چقدر رنگ لازم دارم', dl: [{ id: 'd1', t: 'دیوار ۶ در ۲٫۸ متر' }], prac: { measure: 'تعدادِ لیتر = ۱۶٫۸ ÷ ۸ = ۲٫۱' } } } }); await paintFix(); const x = await snap(pid);
    const m = x.stale.filter(z => z.k === 'prac.measure'), q = x.asks.filter(a => a.path === 'prac.measure');
    return { ok: (m.some(z => z.v === 2.1 && z.re != null && Math.abs(z.re - 2.45) < 1e-6) || q.some(a => /۲٫۴۵/.test(a.new))) && !q.some(a => /۱۹٫۶ ÷ ۸ = ۲٫۱|۱۶٫۸ ÷ ۸ = ۲٫۴۵/.test(a.new)), got: { m, q, s: st2(x) } }; };
  C[58] = async () => { const pid = await paint(); await paintFix(); await turn('گامِ ۱ رو از نو حساب کردم: ۷ × ۲٫۸ = ۱۹٫۶', 'درست است.', CS({ ph: 'c', said: ['result'], result: '۷ × ۲٫۸ = ۱۹٫۶' })); const x = await snap(pid);
    return { ok: stN(x, 1).v === 'ok' && !stN(x, 1).stale && /۱۹٫۶/.test(stN(x, 1).fixed || '') && !!stN(x, 2).stale && !!stN(x, 3).stale && x.resume === 2, got: { prior: x.prior, resume: x.resume, sys: x.sys } }; };
  C[59] = async () => { await scen({ prior: [RES('وام ۱۸۰ میلیونه، سودش ۱۸ درصد، سالی ۳۲٫۴ میلیون سود میدم')], stmtChat: 'وام ۱۸۰ میلیونه، سودش ۱۸ درصد' });
    await turn('یه چیزی رو اشتباه گفتم، سودش ۲۱ درصده. راستی این وام رو بگیرم اصلاً یا نه؟', 'فرستادم.', RT({ msg: 'سودش ۱۸ درصد', key: 'datum:سود', what: 'fact', fix: '۲۱ درصد', old: '۱۸ درصد' }));
    const x = await snap(''); return { ok: !x.refused && !/پرسش بود/.test(allText(x)) && x.ch.length > 0 && (/32\.4>37\.8|۳۲٫۴ ⇒ ۳۷٫۸/.test(x.sstale + allText(x)) || x.ev.some(e => /۳۲٫۴/.test(e.span) && !!e.stale)), got: { ch: x.ch, ev: x.ev, sstale: x.sstale, refused: x.refused } }; };
  /* ---- منفی‌ها ---- */
  C[60] = async () => { const pid = await paint({ more: ['قلم‌موی ۶ سانتی دارم', 'ساعتِ ۶ عصر شروع می‌کنم'] }); await paintFix('طولِ دیوار ۷ متره، نه ۶'); const x = await snap(pid);
    return { ok: [1, 2, 3].every(n => !!stN(x, n).stale) && !x.asks.some(q => /قلم‌مو|ساعت/.test(q.old)) && !/قلم‌موی ۷|ساعتِ ۷/.test(J(x.asks) + allText(x)) && none(x, [6]), got: { asks: x.asks, s: st2(x), prior: x.prior } }; };
  C[61] = async () => { const pid = await scen({ prior: ['ارتفاعِ دیوار ۳ متره، پس مساحت ۳ × ۵ = ۱۵ مترمربع', 'سیمِ ۱۵ متری که از قبل داشتم کافیه', '۳ تا کارگر میان'], live: { stmt: 'ارتفاعِ دیوار ۳ متره؛ چقدر کاغذدیواری می‌خوام؟', u: { one: 'کاغذدیواری', dl: [{ id: 'd1', t: 'ارتفاعِ دیوار ۳ متر' }] }, steps: ['ارتفاعِ دیوار ۳ متره، پس مساحت ۳ × ۵ = ۱۵ مترمربع', 'سیمِ ۱۵ متری که از قبل داشتم کافیه', '۳ تا کارگر میان'] } });
    await turn('ارتفاع ۳ نیست، ۳٫۲ متره', 'فرستادم.', RT({ msg: 'ارتفاعِ دیوار ۳ متره', key: 'datum:ارتفاع', what: 'fact', fix: '۳٫۲ متر', old: '۳' })); const a = await snap(pid); await yesAll(); const x = await snap(pid);
    const st3 = a.stale.filter(z => z.k === 'step:st2' || z.k === 'step:st3');
    return { ok: a.stale.some(z => z.k === 'step:st1' && z.v === 15 && Math.abs(z.re - 16) < 1e-6) && !st3.length && !a.asks.some(q => /سیم|کارگر/.test(q.old)) && !/سیمِ ۱۶|۳٫۲ تا کارگر|۳ × ۵ = ۱۶/.test(J(a.asks) + allText(a) + allText(x)), got: { s: a.stale, asks: a.asks } }; };
  C[62] = async () => { const pid = await scen({ prior: ['تو ۱۲ هفته ۶ کیلو کم کنم، یعنی هفته‌ای ۰٫۵ کیلو', RES('این هفته ترازو ۰٫۵ کیلو کمتر نشون داد')], live: { stmt: 'تو ۱۲ هفته ۶ کیلو کم کنم، یعنی هفته‌ای ۰٫۵ کیلو', u: { one: 'کم‌کردنِ وزن', dl: [{ id: 'd1', t: 'مهلت ۱۲ هفته' }] }, plan: 'تو ۱۲ هفته ۶ کیلو کم کنم، یعنی هفته‌ای ۰٫۵ کیلو' } });
    await turn('مهلتم ۱۲ هفته نیست، ۱۵ هفته‌ست', 'فرستادم.', RT({ msg: 'تو ۱۲ هفته ۶ کیلو کم کنم', key: 'datum:مهلت', what: 'fact', fix: '۱۵ هفته', old: '۱۲ هفته' })); await yesAll(); const x = await snap(pid);
    const meas = x.ev.filter(e => /ترازو/.test(e.span));
    return { ok: has(x, 0.5, 0.4) && x.stale.every(z => !/^res:/.test(z.k)) && meas.length === 1 && !meas[0].stale && !/ترازو[^»]*» دیگر برقرار نیست|ترازو[^»]*»: از/.test(allText(x)), got: { s: x.stale, ev: x.ev, ch: x.ch } }; };
  C[63] = async () => { const x = await TANK(); return { ok: /ضریبِ جمع‌آوری ۰٫۸/.test(x.dl.join(' ')) && /بارش ۰٫۲ متر/.test(x.dl.join(' ')) && none(x, [0.8, 0.2]) && !x.asks.some(q => /ضریب|بارش/.test(q.label + q.old) && q.old !== q.new && !/بام/.test(q.old)), got: { dl: x.dl, s: st2(x), asks: x.asks } }; };
  C[64] = async () => { await scen({ prior: ['سلام! چهارشنبه که دیدمت خیلی خوش گذشت. یه مسئله دارم: ۳ تا سیب رو بینِ ۲ نفر چطور تقسیم کنم؟'] });
    await turn('گفتم چهارشنبه، منظورم پنجشنبه بود', 'فرستادم.', RT({ msg: 'چهارشنبه که دیدمت', key: 'said', what: 'said', fix: 'پنجشنبه', old: 'چهارشنبه' })); const x = await snap('');
    const n = (allText(x).match(/چیزی برای عوض کردن نبود/g) || []).length;
    return { ok: !x.asks.length && !STALE.test(allText(x)) && (n >= 1 || !x.ch.length) && x.sys.filter(t => /چیزی برای عوض کردن نبود/.test(t)).length <= 1, got: { ch: x.ch, res: x.res, sys: x.sys } }; };
  C[65] = async () => { await scen({ prior: ['قطرِ لوله ۲ سانت'], stmtChat: 'قطرِ لوله ۲ سانت' });
    await turn('به نظرت لولهٔ ۱٫۶ بهتره یا همین ۲؟', 'بستگی دارد.', RT({ msg: 'قطرِ لوله ۲ سانت', key: 'datum:قطر', what: 'fact', fix: '۱٫۶', old: '۲ سانت' })); const x = await snap('');
    return { ok: !x.ch.length && !x.asks.length && !!x.refused && !STALE.test(J([x.ch, x.card])) && !x.story.some(t => /۱٫۶ سانت/.test(t)), got: { ch: x.ch, refused: x.refused, story: x.story } }; };
  C[66] = async () => { const pid = await paint(); await turn('اگه دیوار ۷ متر بود چقدر رنگ می‌خواست؟', '۱۹٫۶ مترمربع.', RT({ msg: 'دیوار ۶ در ۲٫۸ متره', key: 'datum:طولِ دیوار', what: 'fact', fix: '۷ متر', old: '۶' })); const x = await snap(pid);
    return { ok: /دیوار ۶ در/.test(x.st) && [1, 2, 3].every(n => !stN(x, n).stale) && !x.stale.length && !x.asks.length, got: { st: x.st, prior: x.prior, ch: x.ch, refused: x.refused } }; };
  C[67] = async () => { const pidB = await scen({ prior: ['برای کیک ۴۵۰ گرم آرد لازم دارم.'], live: { title: 'کیک', stmt: 'برای کیک ۴۵۰ گرم آرد لازم دارم.', u: { one: 'کیک', dl: [{ id: 'd1', t: '۴۵۰ گرم آرد' }] }, steps: ['۴۵۰ گرم آرد را الک می‌کنم'] } });
    const pidA = await ev(async () => { const s = __cur(); await __turn('یه مسئلهٔ دیگه: مسیرِ سفر ۴۵۰ کیلومتره، با سرعتِ ۹۰ چند ساعت می‌رسم؟', 'خب.'); const pid = __live('سفر', 'مسیرِ سفر ۴۵۰ کیلومتره، با سرعتِ ۹۰ چند ساعت می‌رسم؟', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, APP.S.get(s.id)); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'زمانِ سفر', u: 'زمان', dl: [{ id: 'd1', t: 'مسیر ۴۵۰ کیلومتر' }], c: '', type: 'find', nat: 'practical', from: 'page' } }; }); return pid; });
    await turn('مسیر ۴۵۰ نیست، ۴۸۰ کیلومتره', 'فرستادم.', RT({ msg: 'مسیرِ سفر ۴۵۰ کیلومتره', key: 'datum:مسیر', what: 'fact', fix: '۴۸۰ کیلومتر', old: '۴۵۰ کیلومتر' })); await yesAll(); const xB = await snap(pidB), xA = await snap(pidA);
    return { ok: /۴۵۰ گرم/.test(xB.st) && /۴۵۰ گرم/.test(xB.dl.join(' ')) && !xB.stale.length && !xA.asks.some(q => q.pid === pidB) && /۴۸۰/.test(xA.st + xA.dl.join(' ')), got: { B: { st: xB.st, dl: xB.dl, s: st2(xB) }, A: { st: xA.st, dl: xA.dl }, asks: xA.asks } }; };
  C[68] = async () => { await scen({ prior: ['گزارشِ دو هفتهٔ قبل رو فرستادم', 'جلسه هم خوب بود.'] }); await turn('گزارشِ ۵ روزِ آخر هم آماده‌ست', 'خوب است.', RT({ msg: 'گزارشِ دو هفتهٔ قبل رو فرستادم', key: 'said', what: 'said', fix: '۵ روز', old: 'دو هفته' })); const x = await snap('');
    return { ok: !x.asks.length && !x.ch.length && !STALE.test(J([x.ch, x.sys])), got: { asks: x.asks, ch: x.ch, refused: x.refused } }; };
  C[69] = async () => { const M = 'فاصلهٔ دو شهر ۳۴۰ کیلومتره، با سرعتِ ۸۵ چقدر طول می‌کشه؟'; const pid = await scen({ prior: [M, RES('۳۴۰ دقیقه')], live: { stmt: M, u: { one: 'زمانِ سفر', dl: [{ id: 'd1', t: 'فاصله ۳۴۰ کیلومتر' }, { id: 'd2', t: 'سرعت ۸۵' }] } } });
    await turn('جوابم رو اشتباه گفتم، ۳۴۰ دقیقه نه، ۲۴۰ دقیقه', 'فرستادم.', RT({ msg: '۳۴۰ دقیقه', key: 'result', what: 'ans', fix: '۲۴۰ دقیقه', old: '۳۴۰ دقیقه' })); await yesAll(); const x = await snap(pid);
    return { ok: /۳۴۰ کیلومتر/.test(x.st) && /۳۴۰ کیلومتر/.test(x.dl.join(' ')) && !/۲۴۰ کیلومتر/.test(x.st + J(x.dl) + J(x.asks)), got: { st: x.st, dl: x.dl, asks: x.asks, ch: x.ch } }; };
  C[70] = async () => { const pid = await scen({ prior: ['گامِ ۳ رو فردا انجام میدم', RES('۳ تا نمونه گرفتم')], live: { stmt: 'نمونه‌گیری از خاکِ باغچه', steps: ['گامِ ۳ رو فردا انجام میدم'] } });
    await edit(2, ['۳ تا', '۴ تا']); const x = await snap(pid); const u1 = await ev(() => __U(1).text);
    return { ok: /گامِ ۳ رو فردا/.test(u1) && !x.asks.some(q => /گامِ ۳/.test(q.old)) && !x.stale.length && x.story.concat(x.ev.map(e => e.span)).some(t => /۴ تا نمونه/.test(t)) && !x.story.some(t => /۳ تا نمونه/.test(t)), got: { story: x.story, ev: x.ev, asks: x.asks, s: st2(x), ch: x.ch } }; };
  C[71] = async () => { const pid = await scen({ prior: ['۴ نفر مهمون داریم؛ چقدر برنج بپزم؟'], live: { stmt: '۴ نفر مهمون داریم؛ چقدر برنج بپزم؟', u: { one: 'مقدارِ برنج', dl: [{ id: 'd1', t: '۴ نفر مهمون داریم' }] }, steps: ['x + 4 + 8 + 7 + y = ۳۰'] } });
    await turn('مهمونا ۴ نفر نیستن، ۵ نفرن', 'فرستادم.', RT({ msg: '۴ نفر مهمون داریم', key: 'datum:مهمان', what: 'fact', fix: '۵ نفر', old: '۴ نفر' })); const a = await snap(pid); await yesAll(); const x = await snap(pid);
    return { ok: !a.asks.some(q => /x \+/.test(q.old)) && !a.stale.some(z => /^step:/.test(z.k)) && !/x\s*\+\s*5/.test(J(a.asks) + allText(a)) && /۵ نفر/.test(x.st + x.dl.join(' ')), got: { asks: a.asks, s: a.stale, ch: a.ch } }; };

  for (const e of Q2) { const n = bank.indexOf(e) + 1, tag = '#' + n + ' [' + e.kind + '/' + e.role + '] ' + String(e.text).slice(0, 70);
    if (NC[n]) { out.summary.nc++; out.nc[n] = NC[n]; continue; }
    if (!C[n]) { out.summary.nc++; out.nc[n] = 'no check written'; out.fail.push(tag + ' — no check'); out.summary.fail++; continue; }
    if (process.env.ONLY && !process.env.ONLY.split(',').includes(String(n))) continue;
    let r; try { r = await C[n](); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; }
    if (r.ok) out.summary.pass++; else { out.summary.fail++; out.fail.push(tag + ' got ' + J(r.got).slice(0, +process.env.GOTN || 1500)); } }
  return out;
}
module.exports = { run };
