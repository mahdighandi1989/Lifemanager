// بانکِ مستقلِ VARIANTS_R25 — هر ورودیِ P4.stale_numbers یک بررسی (برای tests/test_tour1_r25_correction.js؛ خودش آزمون نیست).
// هر بررسی همان نقشِ ورودی را اجرا می‌کند: [chat] نوبتِ واقعیِ دستیار با گزارشِ retract ِ مدلِ لفظی، [edit] ✏️ ِ کامل، [page] کارت/دفترِ صفحه.
// ورودی‌ها با شمارهٔ جایشان در فایلِ بانک (#n، ۰‌پایه) نام برده می‌شوند. هیچ تاریخِ تقویمیِ ثابتی در انتظارها نیست. متنِ ورودی‌ها دست نخورده است.
async function run(ctx) {
  const { ev, turn, bank, P4, H } = ctx;
  const { scen, snap, edit, editPairs, yesAll, RES, st2, has, vals, allText, CS, RT, J } = H;
  const out = { summary: { pass: 0, fail: 0, nc: 0, of: P4.length }, nc: {}, fail: [] };
  const idx = (e) => bank.indexOf(e);
  const onlyRe = (x, M) => x.stale.every(z => z.re == null || (M[z.v] != null && Math.abs(M[z.v] - z.re) < 1e-6));   // C11: هر مقدارِ پیشنهادی درست است
  const none = (x, L) => !vals(x).some(v => L.includes(v));
  const C = {};
  /* ---- مثبت‌ها ---- */
  C[138] = async () => { const M = 'ضلعِ مربع ۱۲ متره، پس مساحت ۱۴۴ و محیط ۴۸';
    const pid = await scen({ prior: [M], live: {} }); await edit(1, ['۱۲', '۱۳']); await yesAll(); const x = await snap(pid);
    return { ok: /۱۳ متره/.test(x.st) && has(x, 144, 169) && has(x, 48, 52) && x.stale.length === 2 && /۱۶۹/.test(x.card) && /۵۲/.test(x.card), got: { st: x.st, s: st2(x), card: x.card } }; };
  C[139] = async () => { const pid = await scen({ prior: ['دیگ ۳۰ لیتر است و ۸٪ آن رب', RES('۲٫۴ لیتر رب')], live: { stmt: 'دیگ ۳۰ لیتر است و ۸٪ آن رب', u: { one: 'ربِ دیگ', dl: [{ id: 'd1', t: 'دیگ ۳۰ لیتر' }, { id: 'd2', t: '۸٪ آن رب' }] } } });
    await turn('دیگ ۳۰ لیتر نیست، ۴۰ لیتره', 'فرستادم.', RT({ msg: 'دیگ ۳۰ لیتر است', key: 'datum:حجمِ دیگ', what: 'fact', fix: '۴۰ لیتر', old: '۳۰ لیتر' }));
    await yesAll(); const x = await snap(pid);
    return { ok: has(x, 2.4, 3.2) && none(x, [8]) && onlyRe(x, { 2.4: 3.2 }) && !/۸ ⇒|«۸»/.test(allText(x)), got: { s: st2(x), ch: x.ch } }; };
  C[140] = async () => { const pid = await scen({ prior: ['می‌خوام ۹۰ میلیون پس‌انداز کنم', 'در ۱۸ ماه، یعنی ماهی ۵ میلیون', RES('الان ۲۳ میلیون توی حسابمه')],
      live: { stmt: 'می‌خوام ۹۰ میلیون پس‌انداز کنم', u: { one: 'پس‌انداز', dl: [{ id: 'd1', t: 'هدف ۹۰ میلیون' }, { id: 'd2', t: '۱۸ ماه وقت' }], nat: 'life' }, plan: 'در ۱۸ ماه، یعنی ماهی ۵ میلیون' } });
    await turn('۱۸ ماه وقت ندارم، ۱۵ ماهه', 'فرستادم.', RT({ msg: 'در ۱۸ ماه', key: 'datum:مدت', what: 'fact', fix: '۱۵ ماه', old: '۱۸ ماه' }));
    await yesAll(); const x = await snap(pid);
    return { ok: has(x, 5, 6) && none(x, [90, 23]) && onlyRe(x, { 5: 6 }) && x.ev.every(e => !e.stale) && !/بنا بود/.test(allText(x)), got: { s: st2(x), ev: x.ev, ch: x.ch } }; };
  C[141] = async () => { const M = 'از ساعت ۷ شروع می‌کنم و تحویل ساعت ۹ است، پس ۲ ساعت وقت دارم';
    const pid = await scen({ prior: [M, RES('مجموعِ زاویه‌ها ۵۴۰ درجه، چون پنج‌ضلعی سه مثلث می‌شود')], live: { stmt: M } });
    await turn('تحویل ساعت ۹ نیست، ۱۱ است', 'فرستادم.', RT({ msg: 'تحویل ساعت ۹ است', key: 'datum:ساعتِ تحویل', what: 'fact', fix: '۱۱', old: '۹' }));
    await yesAll(); const x = await snap(pid);
    return { ok: has(x, 2, 4) && x.stale.length === 1 && x.ev.every(e => !e.stale) && !/دیگر برقرار نیست|بنا بود/.test(allText(x)), got: { st: x.st, s: st2(x), ev: x.ev, ch: x.ch } }; };
  C[142] = async () => { const M = 'جایزه ۱۲ میلیون است. ۱. چهار نفریم ۲. مساوی تقسیم می‌کنیم ۳. سهمِ هر نفر ۳ میلیون';
    const pid = await scen({ prior: [M], live: {} }); await ev(() => { const s = __cur(); s.coach = s.coach || {}; s.coach.reg = 'shoma'; APP.S.put(s); });
    await turn('جایزه ۱۲ میلیون نبود، ۱۶ میلیون است', 'فرستادم.', RT({ msg: 'جایزه ۱۲ میلیون است', key: 'datum:جایزه', what: 'fact', fix: '۱۶ میلیون', old: '۱۲ میلیون' }));
    await yesAll(); const x = await snap(pid);
    return { ok: has(x, 3, 4) && x.stale.length === 1 && /۱۶ میلیون/.test(x.st) && !/خودت|نزنی/.test(x.sys.join(' ')), got: { s: st2(x), sys: x.sys } }; };
  C[143] = async () => { const M = '۱۳ نقطه در مثلثی به ضلعِ ۳؛ ثابت کن دو تا از آن‌ها فاصله‌شان حداکثر ۱ است';
    const pid = await scen({ prior: [M, RES('۷۸ جفت نقطه')], live: { stmt: M } });
    await turn('۱۳ نقطه نیست، ۱۴ نقطه است', 'فرستادم.', RT({ msg: '۱۳ نقطه در مثلثی', key: 'datum:نقطه‌ها', what: 'fact', fix: '۱۴ نقطه', old: '۱۳ نقطه' }));
    await yesAll(); const x = await snap(pid);
    return { ok: has(x, 78, 91) && none(x, [1, 3]) && x.stale.length === 1, got: { s: st2(x), ch: x.ch } }; };
  C[144] = async () => { const M = 'رنگ ۲ قوطی، تینر ۳۰۰ سی‌سی. غلتک هم دارم.';
    const pid = await scen({ prior: [M, { t: 'حدسم: دیوارِ ۶ متری دو برابرِ دیوارِ ۳ متری رنگ می‌خواهد', a: CS({ ph: 'u', guess: 'دیوارِ ۶ متری دو برابرِ دیوارِ ۳ متری رنگ می‌خواهد' }) }, { t: 'امتحان کردم؛ دیوارِ ۶ متری دو برابر رنگ برد. حدسم درست بود.', a: CS({ ph: 'c', guess_res: { id: 'g1', res: 'confirmed' } }) }],
      live: { stmt: M, u: { one: 'رنگ‌کاریِ اتاق', dl: [{ id: 'd1', t: 'رنگ ۲ قوطی' }, { id: 'd2', t: 'تینر ۳۰۰ سی‌سی' }, { id: 'd3', t: 'دیوارها ۶ متر و ۳ متر' }], prac: { measure: 'رنگِ لازم = ۶ متر ÷ ۳ متر برابرِ رنگِ دیوارِ کوچک' }, suff: 'کافی', suffW: 'غلتک برای این دو دیوار بس است' }, suff: 'کافی' } });
    const g0 = (await snap(pid)).cg; await editPairs(1, [['۲ قوطی', '۳ قوطی'], ['۳۰۰ سی‌سی', '۴۵۰ سی‌سی']]); await yesAll(); const x = await snap(pid);
    return { ok: g0[0] && g0[0].r === 'confirmed' && x.cg[0].r === 'confirmed' && x.suff === 'کافی' && none(x, [6, 3]) && !x.stale.length && !/⇐ ۰|⇒ ۰|سرانجامِ حدس|داوریِ «با همین/.test(allText(x)) && /۳ قوطی/.test(x.st) && /۴۵۰ سی‌سی/.test(x.st), got: { g0, cg: x.cg, suff: x.suff, s: st2(x), ch: x.ch } }; };
  C[145] = async () => { const pid = await scen({ prior: ['سالن ۶۰ متره و هر متر ۱۲۰ وات می‌خواد؛ چند تا بخاریِ ۲۰۰۰ واتی لازمه؟', RES('۶۰ × ۱۲۰ = ۷۲۰۰ وات'), RES('۷۲۰۰ تقسیم بر ۲۰۰۰ میشه ۳٫۶'), RES('پس ۴ تا بخاری')], live: {} });
    await turn('سالن ۶۰ متر نیست، ۸۰ متره', 'فرستادم.', RT({ msg: 'سالن ۶۰ متره', key: 'datum:مساحتِ سالن', what: 'fact', fix: '۸۰ متر', old: '۶۰ متر' }));
    await yesAll(); const x = await snap(pid);
    /* ۷۲۰۰ ⇒ ۹۶۰۰ و ۳٫۶ ⇒ ۴٫۸ حسابِ خودِ صفحه؛ «۴ تا بخاری» (گرد کردن به بالا) رابطهٔ شناخته نیست ⇒ کهنه و پرسیده، بی عددِ ساختگی (C11) */
    return { ok: has(x, 7200, 9600) && has(x, 3.6, 4.8) && onlyRe(x, { 7200: 9600, 3.6: 4.8, 4: 5 }) && /۸۰ متر/.test(x.st) && x.ev.length === 3 && x.ev.every(e => !!e.stale) && (has(x, 4) || /پس ۴ تا بخاری/.test(J(x.ch))), got: { s: st2(x), ev: x.ev, card: x.card, ch: x.ch } }; };
  C[146] = async () => { const M = 'برای آبیاری حساب کردم: ۴۰۰ مترمربع × ۶ لیتر = ۲۴۰۰ لیتر. بعد ۲۴۰۰ لیتر تقسیم بر ۲ روز میشه ۱۲۰۰ لیتر در روز.';
    const pid = await scen({ prior: [M], live: { prior: { sum: '۲ گام — همه درست', resume: 0, steps: [{ n: 1, quote: '۴۰۰ مترمربع × ۶ لیتر = ۲۴۰۰ لیتر', verdict: 'ok', why: '', depWrong: [] }, { n: 2, quote: '۲۴۰۰ لیتر تقسیم بر ۲ روز میشه ۱۲۰۰ لیتر در روز', verdict: 'ok', why: '', depWrong: [] }] } } });
    await turn('۴۰۰ متر نیست، ۴۵۰ متره', 'فرستادم.', RT({ msg: '۴۰۰ مترمربع', key: 'datum:مساحت', what: 'fact', fix: '۴۵۰', old: '۴۰۰' }));
    await yesAll(); const x = await snap(pid), p1 = x.prior[0], p2 = x.prior[1];
    /* سهمِ P4 (a38): گامِ دفتر و وابسته‌اش نشانِ کهنه با مقدارِ درست می‌گیرند (داده + کارتِ «کهنه پس از اصلاح»)؛ متنِ ردیفِ دفتر («کهنه پس از اصلاح — دوباره بسنج») با a45 ِ fixer «prior» است */
    return { ok: !!p1.stale && p1.stale.nums.some(n => n.v === 2400 && n.re === 2700) && !!p2.stale && p2.stale.nums.some(n => n.v === 1200 && n.re === 1350) && /کارِ پیشین/.test(x.card) && /۲۷۰۰/.test(x.card), got: { prior: x.prior, s: st2(x), card: x.card } }; };
  C[147] = async () => { const M = 'دیوار ۲٫۴ متر در ۳ متر، یعنی ۷٫۲ مترمربع. فاصلهٔ پریز از کف ۳۰ سانت.';
    const pid = await scen({ prior: [M], live: {} });
    await turn('۲٫۴ نبود، ۲٫۶ متره', 'فرستادم.', RT({ msg: 'دیوار ۲٫۴ متر', key: 'datum:طولِ دیوار', what: 'fact', fix: '۲٫۶ متر', old: '۲٫۴' }));
    await yesAll(); const x = await snap(pid);
    return { ok: has(x, 7.2, 7.8) && x.stale.length === 1 && none(x, [30, 0.3, 3]), got: { st: x.st, s: st2(x) } }; };
  C[148] = async () => { const M = 'حیاط ۸ در ۵ متر: محیط ۲۶ و مساحت ۴۰';
    const pid = await scen({ prior: [M], live: {} }); await ev(() => { const s = __cur(); s.coach = s.coach || {}; s.coach.reg = 'shoma'; APP.S.put(s); });
    await turn('عرضش ۵ نیست، ۶ متره', 'فرستادم.', RT({ msg: '۸ در ۵ متر', key: 'datum:عرض', what: 'fact', fix: '۶ متر', old: '۵ متر' }));
    await yesAll(); const x = await snap(pid);
    return { ok: has(x, 26, 28) && has(x, 40, 48) && x.stale.length === 2, got: { st: x.st, s: st2(x), ch: x.ch } }; };
  C[149] = async () => { const M = 'برای مهمونی ۱۲ نفر میان. هر نفر ۳ تا میوه، یعنی ۳۶ تا میوه. نون: ۱۲ نفر و ۳۰ تا اضافه، پس ۴۲ تا. صندلی هم با حسابِ خودم شد ۲۰ تا.';
    const pid = await scen({ prior: [M], live: { u: { one: 'خریدِ مهمانی', dl: [{ id: 'd1', t: '۱۲ نفر' }] }, steps: ['هر نفر ۳ تا میوه، یعنی ۳۶ تا میوه', 'نون: ۱۲ نفر و ۳۰ تا اضافه، پس ۴۲ تا', 'نصفِ ۱۲ نفر، سرِ هر میز ۲ نفر، پس ۳ میز'] } });
    await turn('۱۲ نفر نیستن، ۱۴ نفرن.', 'فرستادم.', RT({ msg: '۱۲ نفر میان', key: 'datum:مهمان', what: 'fact', fix: '۱۴ نفر', old: '۱۲ نفر' }));
    await yesAll(); const x = await snap(pid), items = await ev(() => [...document.querySelectorAll('#main .lp-stale li')].map(li => ({ ask: li.getAttribute('data-ask'), t: li.innerText })));
    /* هر پیشنهاد حسابِ درستِ یک رابطهٔ شناخته است (۳۶ ⇒ ۴۲، ۴۲ ⇒ ۴۴)؛ هر سطرِ بی‌رابطه می‌پرسد و عدد نمی‌دهد */
    return { ok: has(x, 36, 42) && onlyRe(x, { 36: 42, 42: 44 }) && items.length > 0 && items.every(i => i.ask === '1' ? /حساب شده بود؟/.test(i.t) && !/می‌شود [۰-۹]/.test(i.t) : /با مقدارِ درست می‌شود/.test(i.t)), got: { s: st2(x), items } }; };
  C[150] = async () => { const M = 'مهلت روزِ ۱۵ام است؛ کارم ۱۸ام تمام می‌شود، یعنی ۳ روز بعد از مهلت';
    const pid = await scen({ prior: [M], live: {} });
    await turn('تمام شدنش ۱۸ام نیست، ۲۲ام است', 'فرستادم.', RT({ msg: 'کارم ۱۸ام تمام می‌شود', key: 'datum:روزِ پایان', what: 'fact', fix: '۲۲ام', old: '۱۸ام' }));
    await yesAll(); const x = await snap(pid);
    return { ok: has(x, 3, 7) && x.stale.length === 1 && /روزِ ۱۵ام/.test(x.st) && /۲۲ام/.test(x.st), got: { st: x.st, s: st2(x) } }; };
  /* ---- منفی‌ها ---- */
  C[151] = async () => { const M = 'دیگ ۳۰ لیتر است. برای پذیرایی ۵ ردیفِ ۶ تایی یعنی ۳۰ تا کاسه می‌چینم.';
    const pid = await scen({ prior: [M], live: { u: { one: 'نذری', dl: [{ id: 'd1', t: 'دیگ ۳۰ لیتر' }, { id: 'd2', t: '۵ ردیفِ ۶ تایی یعنی ۳۰ تا کاسه' }] } } });
    await turn('دیگ ۴۰ لیتره نه ۳۰', 'فرستادم.', RT({ msg: 'دیگ ۳۰ لیتر است', key: 'datum:حجمِ دیگ', what: 'fact', fix: '۴۰ لیتر', old: '۳۰ لیتر' }));
    await yesAll(); const x = await snap(pid), d2 = await ev((pid) => APP.S.get('eprog_' + pid).solve.u[1].dl[1].t, pid);
    return { ok: !x.stale.length && /۳۰ تا کاسه/.test(x.st) && /۴۰ لیتر/.test(x.st) && d2 === '۵ ردیفِ ۶ تایی یعنی ۳۰ تا کاسه', got: { st: x.st, s: st2(x), d2 } }; };
  C[152] = async () => { const M = 'تا n=۲۰ درست بود؛ ۲۰ تاشو با دست چک کردم';
    const pid = await scen({ prior: [M], live: { u: { type: 'prove', one: 'برای هر n درست است', u: 'برای هر عددِ طبیعیِ n برقرار است', dl: [], c: '' }, b: { verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: 'با استقرا روی n، برای هر n' }, solved: 'با استقرا ثابت شد' } });
    await turn('تا ۱۵ بود نه ۲۰', 'فرستادم.', RT({ msg: 'تا n=۲۰ درست بود', key: 'datum:تا کجا', what: 'fact', fix: '۱۵', old: '۲۰' }));
    const x = await snap(pid);
    return { ok: !x.stale.length && x.b === 'verified' && x.state === 'solved' && !/۲۱|۲۲/.test(allText(x)), got: { st: x.st, s: st2(x), asks: x.asks, b: x.b } }; };
  C[153] = async () => { const M = 'وزنِ بار ۱۲ کیلو گرم است و ۳ بسته دارم، یعنی هر بسته ۴ کیلو.';
    const pid = await scen({ prior: [M], live: {} }); await edit(1, ['کیلو گرم', 'کیلوگرم']); const x = await snap(pid);
    return { ok: !x.stale.length && x.card === '' && !/کهنه/.test(allText(x)), got: { st: x.st, s: st2(x), ch: x.ch } }; };
  C[154] = async () => { const M = 'برای خمیر ۱۵۰ گرم کره می‌ریزم.';
    const pid = await scen({ prior: [M, { t: 'حدسم: با ۱۵۰ گرم کره خمیر شل می‌شود', a: CS({ ph: 'u', guess: 'با ۱۵۰ گرم کره خمیر شل می‌شود' }) }, { t: 'امتحان کردم، شل شد؛ حدسم درست بود.', a: CS({ ph: 'c', guess_res: { id: 'g1', res: 'confirmed' } }) }], live: { stmt: M } });
    const g0 = (await snap(pid)).cg; await edit(1, ['۱۵۰', '۱۲۰']); await yesAll(); const x = await snap(pid);
    return { ok: g0[0] && g0[0].r === 'confirmed' && (x.cg[0].r === '' || x.asks.some(a => /guess/.test(a.path))), got: { g0, cg: x.cg, asks: x.asks, ch: x.ch } }; };
  C[155] = async () => { const M = 'طولِ نقشه ۳٫۲ متر است. با متر اندازه گرفتم، ۳٫۴ متر بود.';
    const pid = await scen({ prior: [M], live: { steps: [{ text: 'دیوار را متر می‌کنم', out: { what: 'با متر اندازه گرفتم، ۳٫۴ متر بود', at: new Date().toISOString() } }] } });
    await turn('طولِ نقشه ۳٫۲ نیست، ۳٫۵ است', 'فرستادم.', RT({ msg: 'طولِ نقشه ۳٫۲ متر است', key: 'datum:طولِ نقشه', what: 'fact', fix: '۳٫۵', old: '۳٫۲' }));
    await yesAll(); const x = await snap(pid); return { ok: !x.stale.length && /۳٫۴ متر بود/.test(x.st), got: { st: x.st, s: st2(x) } }; };
  C[156] = async () => { const M = 'هدفم ۶ کیلو در ۱۲ هفته است، یعنی هفته‌ای ۰٫۵ کیلو.';
    const pid = await scen({ prior: [M], live: { u: { one: 'کم کردنِ وزن', dl: [{ id: 'd1', t: 'هدف ۶ کیلو' }, { id: 'd2', t: '۱۲ هفته' }], nat: 'life' } } });
    await turn('هدفم ۶ کیلو نیست، ۸ کیلوئه', 'فرستادم.', RT({ msg: 'هدفم ۶ کیلو', key: 'datum:هدف', what: 'fact', fix: '۸ کیلو', old: '۶ کیلو' }));
    await yesAll(); const x = await snap(pid), d1 = await ev((pid) => APP.S.get('eprog_' + pid).solve.u[1].dl[0].t, pid);
    return { ok: /هدفم ۸ کیلو/.test(x.st) && d1 === 'هدف ۸ کیلو' && x.stale.some(z => z.v === 0.5) && none(x, [12]) && onlyRe(x, { 0.5: 0.6666666667 }), got: { st: x.st, d1, s: st2(x) } }; };
  C[157] = async () => { const M = 'سالِ ۱۴۰۳ شروع کردم. ۳ نفریم. الان گامِ ۳ هستیم و صفحهٔ ۳ِ جزوه را می‌خوانیم.';
    const pid = await scen({ prior: [M], live: { plan: 'گامِ ۳: صفحهٔ ۳ِ جزوه', steps: ['سالِ ۱۴۰۳ شروع کردم؛ گامِ ۳'] } });
    await turn('۳ نفر نیستیم، ۴ نفریم', 'فرستادم.', RT({ msg: '۳ نفریم', key: 'datum:نفرها', what: 'fact', fix: '۴ نفر', old: '۳ نفر' }));
    await yesAll(); const x = await snap(pid), pl = await ev((pid) => APP.S.get('eprog_' + pid).solve.live.plan.t, pid);
    return { ok: !x.stale.length && /سالِ ۱۴۰۳/.test(x.st) && /گامِ ۳ هستیم/.test(x.st) && /صفحهٔ ۳ِ جزوه/.test(x.st) && pl === 'گامِ ۳: صفحهٔ ۳ِ جزوه', got: { st: x.st, s: st2(x), pl } }; };
  C[158] = async () => { const ids = await ev(async () => { __wipe(); __fresh(); await __turn('نردهٔ حیاط ۱۲ متر است، یعنی ۲۴ تیرک.', 'خب.'); const s = __cur();
      const p1 = __live('نرده', 'نردهٔ حیاط ۱۲ متر است، یعنی ۲۴ تیرک.'); __set(p1, (so, L) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'کل', u: 'م', dl: [{ id: 'd1', t: 'نرده ۱۲ متر' }], c: '', type: 'find', nat: 'practical', from: 'page' } }; L.steps.push({ id: 'st1', at: new Date().toISOString(), text: '۱۲ متر × ۲ = ۲۴ تیرک', pred: 'می‌بینم', due: APP.today() }); L.state = 'solved'; });
      APP.go('home'); localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); await __turn('طنابِ رخت ۱۲ متر است.', 'خب.');
      const p2 = __live('طناب', 'طنابِ رخت ۱۲ متر است.'); APP.liveBindSession(p2, __cur()); return { p1, p2, s1: s.id }; });
    await turn('۱۲ نبود، ۱۳ بود', 'فرستادم.', RT({ msg: 'طنابِ رخت ۱۲ متر است', key: 'datum:طناب', what: 'fact', fix: '۱۳ متر', old: '۱۲ متر' }));
    const x = await ev((o) => ({ s1: APP.liveStale(o.p1), st1: APP.S.get('eprob_' + o.p1).p.statement, step: APP.S.get('eprog_' + o.p1).solve.live.steps[0].text, st2: APP.S.get('eprob_' + o.p2).p.statement, q: __asks().filter(a => a.pid === o.p1) }), ids);
    return { ok: !x.s1.length && x.st1 === 'نردهٔ حیاط ۱۲ متر است، یعنی ۲۴ تیرک.' && x.step === '۱۲ متر × ۲ = ۲۴ تیرک' && !x.q.length, got: x }; };
  C[159] = async () => { const M = 'دنباله با ۷، ۱۹ شروع می‌شود. جمله‌های بعدی را حساب کردم: ۸، ۱۸.';
    const pid = await scen({ prior: [M], live: { u: { one: 'دنباله', dl: [{ id: 'd1', t: 'جملهٔ اول ۷' }, { id: 'd2', t: 'جملهٔ دوم ۱۹' }] }, steps: ['جمله‌های بعدی را حساب کردم: ۸، ۱۸'] } });
    await turn('جملهٔ دوم ۱۹ نیست، ۲۱ است', 'فرستادم.', RT({ msg: '۷، ۱۹', key: 'datum:جملهٔ دوم', what: 'fact', fix: '۷، ۲۱', old: '۷، ۱۹' }));
    await yesAll(); const x = await snap(pid);
    /* «۷» داده است؛ «۸، ۱۸» اگر صفحه رابطه‌ای با ۱۹ نشناسد نه نشان می‌خورند نه عددِ ساختگی می‌گیرند */
    return { ok: none(x, [7]) && x.stale.every(z => z.re == null) && !/۷ ⇒/.test(allText(x)), got: { st: x.st, s: st2(x) } }; };
  C[160] = async () => { const M = 'قیمت ۱۵۰۰ بود. ۲۰۰ تومان تخفیف گرفتم.';
    const pid = await scen({ prior: [M, RES('۲۰۰ تومان تخفیف گرفتم')], live: { stmt: M } });
    await turn('قیمت ۱۸۰۰ بود نه ۱۵۰۰', 'فرستادم.', RT({ msg: 'قیمت ۱۵۰۰ بود', key: 'datum:قیمت', what: 'fact', fix: '۱۸۰۰', old: '۱۵۰۰' }));
    await yesAll(); const x = await snap(pid);
    return { ok: x.stale.every(z => z.re == null) && /۲۰۰ تومان تخفیف گرفتم/.test(x.st) && !/۲۰۰ ⇒/.test(allText(x)), got: { st: x.st, s: st2(x), ev: x.ev } }; };
  C[161] = async () => { const M = 'ضلع ۱۲ متر است، یعنی محیط ۴۸.';
    const pid = await scen({ prior: [M], live: {} }); await edit(1, ['۱۲', '۱۲٫۰']); const x = await snap(pid);
    return { ok: !x.stale.length && x.card === '' && !/کهنه/.test(allText(x)), got: { st: x.st, s: st2(x), ch: x.ch } }; };

  for (const e of P4) { const i = idx(e), f = C[i];
    if (!f) { out.summary.nc++; out.nc[i] = 'no check written'; out.fail.push('#' + i + ' has no check'); continue; }
    let r; try { r = await f(); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; }
    if (r.ok) out.summary.pass++; else { out.summary.fail++; out.fail.push('#' + i + ' [' + e.kind + '/' + e.role + '] ' + String(e.text).slice(0, 70) + ' got ' + J(r.got).slice(0, +process.env.GOTN || 900)); } }
  return out;
}
module.exports = { run };
