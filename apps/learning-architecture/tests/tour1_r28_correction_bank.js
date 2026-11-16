// بانکِ مستقلِ VARIANTS_R28 — هر ورودیِ R2.correction_engine یک بررسی (برای tests/test_tour1_r28_correction_bank.js؛ خودش آزمون نیست).
// شماره‌ها اندیسِ ۰‌پایهٔ VARIANTS_R28.json اند (۴۸…۸۶). متنِ ورودی‌ها دست نخورده است؛ NC = ورودی‌ای که برآورده نشد، با دلیل (در گزارشِ fixer هم آمده).
// گزارشِ retract ِ «مدلِ لفظی»: تکهٔ پیشین (msg) و مقدارِ درست (fix) — بی old، تا صفحه خودش X ِ نام‌برده را از حرفِ او بخواند (C88).
async function run(ctx) {
  const { turn, Q2, H } = ctx;
  const { scen, snap, RES, allText, RT, J, ev } = H;
  const out = { summary: { pass: 0, fail: 0, nc: 0, of: Q2.length }, nc: {}, fail: [] };
  const C = {}, NC = {};
  const near = (a, b) => a != null && b != null && Math.abs(a - b) < 1e-6;
  /* ---- «مسئلهٔ رنگ‌آمیزی» (دفترِ کارِ پیشین، شش گام) ---- */
  const PQ = ['مساحتِ دیوارها: ۲ × (۵ + ۴) × ۳ = ۵۴ مترمربع', 'هر لیتر ۹ مترمربع رو می‌پوشونه: ۵۴ ÷ ۹ = ۶ لیتر', 'دو دست رنگ: ۶ × ۲ = ۱۲ لیتر', 'هر قوطی ۴ لیتره: ۱۲ ÷ ۴ = ۳ قوطی', 'هر قوطی ۸۵۰ هزار: ۳ × ۸۵۰ = ۲۵۵۰ هزار', 'با ۳۰۰ هزار قلم‌مو و غلتک: ۲۵۵۰ + ۳۰۰ = ۲۸۵۰ هزار'];
  const PDEP = [[], [1], [2], [3], [4], [5]];
  const OPEN = 'اتاقم ۵ متر طول و ۴ متر عرض داره و ۳ متر ارتفاع؛ اتاق ۴ تا پنجره داره. ' + PQ.join('. ') + '.';
  const paint = (o) => scen({ prior: [OPEN, 'ساعتِ ۹ صبح شروع می‌کنیم و ۳ نفر کمکم می‌کنن'].concat((o && o.more) || []),
    live: { title: 'مسئلهٔ رنگ‌آمیزی', prior: { sum: '۶ گام — همه درست', resume: 0, steps: PQ.map((q, i) => ({ n: i + 1, quote: q, verdict: 'ok', why: '', dep: PDEP[i], depWrong: [] })) } } });
  const W = (text) => turn(text, 'فرستادم.', RT({ msg: 'اتاقم ۵ متر طول و ۴ متر عرض داره', key: 'datum:عرض', what: 'fact', fix: '۵٫۵ متر' }));
  const COV = (text) => turn(text, 'فرستادم.', RT({ msg: 'هر لیتر ۹ مترمربع رو می‌پوشونه', key: 'datum:پوشش', what: 'fact', fix: '۱۰ مترمربع' }));
  const PRICE = (text) => turn(text, 'فرستادم.', RT({ msg: 'هر قوطی ۸۵۰ هزار', key: 'datum:قیمت', what: 'fact', fix: '۹۰۰ هزار' }));
  const CAN = (text) => turn(text, 'فرستادم.', RT({ msg: 'هر قوطی ۴ لیتره', key: 'datum:قوطی', what: 'fact', fix: '۵ لیتری' }));
  const stN = (x, n) => (x.prior || []).filter(s => s.n === n)[0] || {};
  const reOf = (st, v) => { const z = (st.stale || []).filter(q => near(q.v, v))[0]; return z ? z.re : undefined; };
  const marked = (x, n) => !!(stN(x, n).stale && stN(x, n).stale.length);
  const PROPS = (x, E) => Object.keys(E).every(n => { const st = stN(x, +n), w = E[n]; return near(reOf(st, w[0]), w[1]); });
  const noScaled = (x, bad) => !(x.prior || []).some(s => (s.stale || []).some(q => bad.some(b => near(q.re, b))));
  /* #48: «عرضِ اتاق ۴ نیست، ۵٫۵ متره» */
  const wid = async () => { const pid = await paint(); await W('عرضِ اتاق ۴ نیست، ۵٫۵ متره'); return { pid, x: await snap(pid) }; };
  const WIDP = { 1: [54, 63], 2: [6, 7], 3: [12, 14], 4: [3, 3.5], 5: [2550, 2975], 6: [2850, 3275] };
  C[48] = async () => { const { pid, x } = await wid(); if (process.env.DBG) x.recs = await ev((pid) => APP.liveStaleRecs(pid).map(r => r.k + '|' + r.zone + '|' + r.t.slice(0, 90)), pid); return { ok: PROPS(x, WIDP) && noScaled(x, [3325]) && !/«۵٫۵ متر» \(اصلاح شد ⇐ «۵ متر/.test(allText(x)), got: { stale: x.stale, sys: x.sys, recs: x.recs } }; };
  C[49] = async () => { const pid = await paint(); await COV('هر لیتر ۹ نیست، ۱۰ مترمربع رو می‌پوشونه'); const x = await snap(pid);
    return { ok: !marked(x, 1) && PROPS(x, { 2: [6, 5.4], 3: [12, 10.8], 4: [3, 2.7], 5: [2550, 2295], 6: [2850, 2595] }) && noScaled(x, [2565]), got: { prior: x.prior } }; };
  C[50] = async () => { const pid = await paint(); await PRICE('قوطی‌ها ۸۵۰ نیستن، ۹۰۰ هزارن'); const x = await snap(pid);
    return { ok: [1, 2, 3, 4].every(n => !marked(x, n)) && PROPS(x, { 5: [2550, 2700], 6: [2850, 3000] }) && noScaled(x, [3017.6470588235293]), got: { prior: x.prior } }; };
  C[51] = async () => { const pid = await paint(); await W('عرضِ اتاق ۴ نیست، ۵٫۵ متره'); await COV('یه چیز دیگه: هر لیتر ۹ نیست، ۱۰ مترمربع رو می‌پوشونه'); const x = await snap(pid);
    return { ok: PROPS(x, { 1: [54, 63], 2: [6, 6.3], 3: [12, 12.6], 4: [3, 3.15], 5: [2550, 2677.5], 6: [2850, 2977.5] }) && noScaled(x, [5.4, 2.7]), got: { prior: x.prior, sys: x.sys } }; };
  C[52] = async () => { const pid = await paint(); await CAN('قوطی‌ها ۴ لیتری نیستن، ۵ لیتری‌ان'); const x = await snap(pid);
    return { ok: [1, 2, 3].every(n => !marked(x, n)) && PROPS(x, { 4: [3, 2.4], 5: [2550, 2040], 6: [2850, 2340] }), got: { prior: x.prior } }; };
  C[53] = async () => { const pid = await paint(); await turn('۴ نیست، ۵ ـه', 'فرستادم.', RT({ msg: 'اتاقم ۵ متر طول و ۴ متر عرض داره', key: 'datum:?', what: 'fact', fix: '۵' })); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5, 6].every(n => !marked(x, n)) && /کدام/.test(allText(x)), got: { prior: x.prior, sys: x.sys, refused: x.refused } }; };
  C[54] = async () => { const pid = await paint(); await turn('۸۰۰ نیست، ۹۰۰ ـه', 'فرستادم.', RT({ msg: 'هر قوطی ۸۵۰ هزار', key: 'datum:قیمت', what: 'fact', fix: '۹۰۰' })); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5, 6].every(n => !marked(x, n)) && /کدام/.test(allText(x)) && !/۹۰۰ هزار:/.test(J(x.prior)), got: { prior: x.prior, sys: x.sys, refused: x.refused } }; };
  const acc = async (txt, pre) => { const pid = await paint(); await W('عرضِ اتاق ۴ نیست، ۵٫۵ متره'); if (pre) await pre(); await turn(txt, 'باشه.'); return { pid, x: await snap(pid) }; };
  C[55] = async () => { const { x } = await acc('آره، همون ۷ درسته'); const s2 = stN(x, 2);
    return { ok: /۶۳ ÷ ۹ = ۷/.test(s2.fixed) && !marked(x, 2) && PROPS(x, { 3: [12, 14], 4: [3, 3.5], 5: [2550, 2975], 6: [2850, 3275] }) && /پذیرفتی/.test(allText(x)), got: { prior: x.prior, sys: x.sys } }; };
  C[56] = async () => { const { x } = await acc('آره، همون ۷ درسته', () => COV('راستی هر لیتر ۱۰ مترمربع رو می‌پوشونه، نه ۹')); const s2 = stN(x, 2);
    return { ok: !/= ۷/.test(s2.fixed || '') && /۶٫۳/.test(allText(x)) && /(?:کهنه|بنا بود|بعداً)/.test(allText(x)), got: { s2, sys: x.sys } }; };
  /* #57: مسئلهٔ گفت‌وگو بی دفتر */
  C[57] = async () => { await scen({ prior: [RES('اجاره‌ی ویلا ۱۸ میلیون، سهمِ هر نفر: ۱۸ میلیون ÷ ۴ = ۴ میلیون و ۵۰۰ هزار')], stmtChat: 'اجاره‌ی ویلا ۱۸ میلیون، سهمِ هر نفر: ۱۸ میلیون ÷ ۴ = ۴ میلیون و ۵۰۰ هزار' });
    await turn('۴ نفر نیستیم، ۵ نفریم', 'فرستادم.', RT({ msg: 'اجاره‌ی ویلا ۱۸ میلیون، سهمِ هر نفر: ۱۸ میلیون ÷ ۴ = ۴ میلیون و ۵۰۰ هزار', key: 'datum:نفرها', what: 'fact', fix: '۵ نفر' }));
    await turn('آره همون ۳ میلیون و ۶۰۰ درسته', 'باشه.'); const x = await snap('');
    return { ok: /پذیرفتی/.test(allText(x)) && /۱۸ میلیون ÷ ۵ = ۳ میلیون و ۶۰۰ هزار/.test(J([x.story, x.sysAll])), got: { s26: x.s26, sys: x.sys, story: x.story } }; };
  /* «مسئلهٔ سیمان» */
  const CEM = ['۵ کیسه: ۵ × ۲۸۰ = ۱۴۰۰ هزار', 'چسبِ کاشی ۸۰۰ هزار', 'جمع: ۱۴۰۰ + ۸۰۰ = ۲۲۰۰ هزار', 'منهای ۳۰۰ هزار تخفیف میشه ۱ میلیون و ۸۰۰'];
  const cem = () => scen({ prior: [CEM.join('. ') + '.'], live: { title: 'مسئلهٔ سیمان', prior: { sum: '۴ گام', resume: 0, steps: CEM.map((q, i) => ({ n: i + 1, quote: q, verdict: i === 3 ? 'wrong' : 'ok', why: '', dep: i === 2 ? [1, 2] : i === 3 ? [3] : [], depWrong: [] })) } } });
  const cemFix = () => turn('ببخشید، منهای ۳۰۰ هزار میشه ۱ میلیون و ۹۰۰', 'فرستادم.', RT({ msg: 'منهای ۳۰۰ هزار تخفیف میشه ۱ میلیون و ۸۰۰', key: 'step:4', what: 'said', fix: '۱ میلیون و ۹۰۰' }));
  C[58] = async () => { const pid = await cem(); await cemFix(); const x = await snap(pid), t = J([x.prior, x.story, x.stmtChat]);
    return { ok: /۸۰۰ هزار/.test(J(x.prior.map(s => s.fixed || s.q))) && !/چسبِ کاشی ۳۰۰/.test(t) && !/«۳۰۰» \(اصلاح شد ⇐ «۸۰۰»\)/.test(allText(x)) && /۱ میلیون و ۹۰۰/.test(J([x.prior, x.sysAll])), got: { prior: x.prior, sys: x.sys } }; };
  NC[59] = 'shape cannot be produced any more: after C88 the page never rewrites the datum on a result fix (#58, #79), so there is no wrong rewrite to restore; #81 (the look-alike) is checked';
  C[60] = async () => { await scen({ prior: [RES('ما ۴ نفریم و هر نفر ۲ شب می‌مونه، شبی ۶۰۰ هزار: ۴ × ۲ × ۶۰۰ = ۴۸۰۰ هزار')], stmtChat: 'ما ۴ نفریم و هر نفر ۲ شب می‌مونه، شبی ۶۰۰ هزار' });
    await turn('۴ نفر نیستیم، ۵ نفریم', 'فرستادم.', RT({ msg: 'ما ۴ نفریم و هر نفر ۲ شب می‌مونه، شبی ۶۰۰ هزار', key: 'datum:نفرها', what: 'fact', fix: '۵ نفر' })); const x = await snap('');
    return { ok: x.stmtChat === 'ما ۵ نفریم و هر نفر ۲ شب می‌مونه، شبی ۶۰۰ هزار' && /4800>6000(?![.\d])/.test(J(x.s26)) && !/«۵» \(اصلاح شد ⇐ «ما ۴/.test(allText(x)), got: { stmt: x.stmtChat, s26: x.s26, sys: x.sys } }; };
  C[61] = async () => { await scen({ prior: [{ t: '۲۰ تا فاکتور رو شمردم، ۱۲ تاش مهر داشت. پس همه‌شون درستن.', r: 'خب.' }] });
    await ev(() => { const s = __cur(); s.coach = s.coach || {}; const T = s.coach.story = s.coach.story || {}; T['c:0'] = { items: [], prior: { at: new Date().toISOString(), src: '', st: 'ask', rej: [], steps: [{ n: 1, step: 'شمارش', quote: '۲۰ تا فاکتور رو شمردم، ۱۲ تاش مهر داشت', verdict: 'ok', why: '', dep: [], said: [], bad: [], badC: [], her: '' }] } }; APP.S.put(s); });
    await turn('نه، ۱۲ نه، ۱۴ تاش مهر داشت', 'فرستادم.', RT({ msg: '۲۰ تا فاکتور رو شمردم، ۱۲ تاش مهر داشت', key: 'datum:مهر', what: 'fact', fix: '۱۴ تاش مهر داشت' })); const x = await snap('');
    const q = (x.prior || [])[0] || {}; return { ok: !!x.prior && (q.fixed || q.q) === '۲۰ تا فاکتور رو شمردم، ۱۴ تاش مهر داشت', got: { prior: x.prior, sys: x.sys } }; };
  C[62] = async () => { await scen({ prior: [RES('اتاقِ کار ۴ متر در ۵ متر = ۲۰ مترمربع، هر مترمربع موکت ۱۵۰ هزار: ۲۰ × ۱۵۰ = ۳۰۰۰ هزار')], stmtChat: 'اتاقِ کار ۴ متر در ۵ متر = ۲۰ مترمربع' });
    await turn('طولش ۵ متر نیست، ۵٫۵ متره', 'فرستادم.', RT({ msg: 'اتاقِ کار ۴ متر در ۵ متر = ۲۰ مترمربع', key: 'datum:طول', what: 'fact', fix: '۵٫۵ متر' })); const x = await snap(''), t = J([x.s26, x.sys, x.stmtChat]);
    return { ok: /۴ متر در ۵٫۵ متر/.test(x.stmtChat) && /20>22(?![.\d])/.test(J(x.s26)) && /3000>3300(?![.\d])/.test(J(x.s26)) && !/27\.5|4125|۵٫۵ متر در ۵ متر/.test(t), got: { stmt: x.stmtChat, s26: x.s26, sys: x.sys } }; };
  C[63] = async () => { await scen({ prior: [RES('فروشنده گفته بود ۱۰ درصد تخفیف می‌ده: ۲۰ × ۰٫۹ = ۱۸ میلیون')], stmtChat: 'مبل ۲۰ میلیون، فروشنده گفته بود ۱۰ درصد تخفیف می‌ده' });
    await turn('آهان، فروشنده ۱۲ درصد گفته بود نه ۱۰', 'فرستادم.', RT({ msg: 'فروشنده گفته بود ۱۰ درصد تخفیف می‌ده', key: 'datum:تخفیف', what: 'fact', fix: '۱۲ درصد' })); const x = await snap('');
    return { ok: /18>17\.6(?![\d])/.test(J(x.s26)) && !/کارِ دیگری/.test(J([x.story, x.sys])), got: { s26: x.s26, sys: x.sys, story: x.story } }; };
  C[64] = async () => { await scen({ prior: [RES('نردبون: √(۳² + ۴²) = ۵ متر')], stmtChat: 'نردبون: √(۳² + ۴²) = ۵ متر' });
    await turn('ارتفاع ۴ نیست، ۵ متره', 'فرستادم.', RT({ msg: 'نردبون: √(۳² + ۴²) = ۵ متر', key: 'datum:ارتفاع', what: 'fact', fix: '۵ متر' })); const x = await snap(''), t = J([x.sys, x.ch]);
    return { ok: /√۳۴ ≈ ۵٫۸۳/.test(t) && !/۵ ⇒ ۶(?![٫\d])/.test(t), got: { s26: x.s26, sys: x.sys } }; };
  C[65] = async () => { const pid = await paint(); await COV('هر لیتر ۹ نیست، ۱۰ مترمربع رو می‌پوشونه'); await turn('خب پس ۵۴ ÷ ۱۰ = ۵٫۴ لیتر', 'درسته.'); const x = await snap(pid);
    return { ok: !marked(x, 2) && PROPS(x, { 3: [12, 10.8], 4: [3, 2.7], 5: [2550, 2295], 6: [2850, 2595] }), got: { prior: x.prior } }; };
  C[66] = async () => { const { x } = await wid(); const L = (x.sys || []).filter(t => /اصلاح شد/.test(t)).pop() || ''; const rep = (L.match(/۵۴ ⇒ ۶۳/g) || []).length;
    return { ok: /«(?:… )?(?:و )?۵٫۵ متر(?: …)?» \(اصلاح شد ⇐ «(?:… )?(?:و )?۴ متر(?: …)?»\)/.test(L) && rep === 1 && !/۵٫۵ متر در|۵۴ ⇒ ۷۳/.test(L), got: { L } }; };
  const BOOK = 'کتاب: ۴۸ صفحه مونده، روزی ۱۲ صفحه: ۴۸ ÷ ۱۲ = ۴ روز. فصلِ بعدی از صفحه‌ی ۱۲۰ شروع میشه';
  const book = async () => { await scen({ prior: [RES(BOOK)], stmtChat: 'کتاب: ۴۸ صفحه مونده، روزی ۱۲ صفحه' });
    await turn('روزی ۱۲ نه، ۱۶ صفحه', 'فرستادم.', RT({ msg: 'روزی ۱۲ صفحه', key: 'datum:روزی', what: 'fact', fix: '۱۶ صفحه' })); return snap(''); };
  C[67] = async () => { const x = await book(); return { ok: /4>3(?![.\d])/.test(J(x.s26)) && !/120>/.test(J(x.s26)), got: { s26: x.s26, sys: x.sys } }; };
  C[68] = async () => { const pid = await paint(); await W('عرض ۵٫۵ ـه نه ۴؛ حالا چند قوطی لازمه؟'); const x = await snap(pid);
    return { ok: PROPS(x, WIDP) && !/انجام نشد/.test(allText(x)) && !x.refused, got: { prior: x.prior, sys: x.sys, refused: x.refused } }; };
  C[69] = async () => { await scen({ prior: [RES('ما ۴ نفریم و هر نفر ۲ شب می‌مونه، شبی ۶۰۰ هزار: ۴ × ۲ × ۶۰۰ = ۴۸۰۰ هزار')], stmtChat: 'ما ۴ نفریم و هر نفر ۲ شب می‌مونه، شبی ۶۰۰ هزار' });
    await turn('۵ نفریم نه ۴', 'فرستادم.', RT({ msg: 'ما ۴ نفریم و هر نفر ۲ شب می‌مونه، شبی ۶۰۰ هزار', key: 'datum:نفرها', what: 'fact', fix: '۵' })); const x = await snap('');
    return { ok: x.stmtChat === 'ما ۵ نفریم و هر نفر ۲ شب می‌مونه، شبی ۶۰۰ هزار' && /4800>6000(?![.\d])/.test(J(x.s26)), got: { stmt: x.stmtChat, s26: x.s26, sys: x.sys } }; };
  C[70] = async () => { const pid = await paint(); await COV('هر لیتر ۹ نیست، ۱۰ مترمربع رو می‌پوشونه'); await turn('آره، همون ۵٫۴ درسته', 'باشه.'); const x1 = await snap(pid);
    await turn('آره، ۱۰٫۸ هم درسته', 'باشه.'); const x = await snap(pid);
    return { ok: /= ۵٫۴/.test(stN(x1, 2).fixed) && PROPS(x1, { 3: [12, 10.8] }) && /= ۱۰٫۸/.test(stN(x, 3).fixed) && PROPS(x, { 4: [3, 2.7], 5: [2550, 2295], 6: [2850, 2595] }) && !stN(x, 4).fixed, got: { p1: x1.prior, prior: x.prior, sys: x.sys } }; };
  C[71] = async () => { const pid = await paint(); await COV('هر لیتر ۹ نیست، ۱۰ مترمربع رو می‌پوشونه'); const x = await snap(pid);
    return { ok: !/(?:^|[^\d.])9>|(?:^|[^\d.])3>/.test(J(x.stale.filter(z => /^msg:/.test(z.k)).map(z => z.v + '>' + z.re))) && !x.stale.some(z => /ساعت|نفر کمک/.test(z.raw)), got: { stale: x.stale } }; };
  C[72] = async () => { const { x } = await wid(); return { ok: near(reOf(stN(x, 4), 3), 3.5) && !x.stale.some(z => near(z.v, 4) && /^msg:/.test(z.k)), got: { prior: x.prior, stale: x.stale } }; };
  C[73] = async () => { const pid = await paint(); await PRICE('قوطی‌ها ۸۵۰ نیستن، ۹۰۰ هزارن'); const x = await snap(pid); return { ok: [1, 2, 3, 4].every(n => !marked(x, n)), got: { prior: x.prior } }; };
  C[74] = async () => { const pid = await paint(); await turn('اگه عرض ۵٫۵ بود چی میشد؟', 'اگر ۵٫۵ بود، مساحت را خودت دوباره حساب کن.'); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5, 6].every(n => !marked(x, n)) && !x.stale.length, got: { prior: x.prior, stale: x.stale } }; };
  C[75] = async () => { const { x } = await acc('نه، اون ۷ رو قبول ندارم'); return { ok: !stN(x, 2).fixed && near(reOf(stN(x, 2), 6), 7), got: { prior: x.prior } }; };
  C[76] = async () => { const pid = await paint(); await turn('۵۴ ÷ ۹ چند میشه دقیقاً؟', '۶ لیتر.'); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5, 6].every(n => !marked(x, n) && !stN(x, n).fixed), got: { prior: x.prior } }; };
  C[77] = async () => { const x = await book(); return { ok: !/120>/.test(J(x.s26)) && !/۱۲۰ ⇒/.test(allText(x)), got: { s26: x.s26, sys: x.sys } }; };
  C[78] = async () => { await scen({ prior: [RES('هر دور ۱۲ ثانیه، ۱۰ دور: ۱۲ × ۱۰ = ۱۲۰ ثانیه. کشش: ۱۲ + ۸ = ۲۰ ثانیه')], stmtChat: 'هر دور ۱۲ ثانیه، ۱۰ دور؛ کشش ۱۲ + ۸' });
    await turn('هر دور ۱۲ نیست، ۱۴ ثانیه‌ست', 'فرستادم.', RT({ msg: 'هر دور ۱۲ ثانیه', key: 'datum:دور', what: 'fact', fix: '۱۴ ثانیه' })); const x = await snap('');
    return { ok: /120>140(?![.\d])/.test(J(x.s26)) && !/(?:^|[ "])20>/.test(J(x.s26)) && !/۲۰ ⇒/.test(allText(x)), got: { s26: x.s26, sys: x.sys } }; };
  C[79] = async () => { const pid = await cem(); await cemFix(); const x = await snap(pid);
    return { ok: !marked(x, 1) && /۵ × ۲۸۰ = ۱۴۰۰/.test(stN(x, 1).fixed || stN(x, 1).q) && !/چسبِ کاشی ۳۰۰/.test(J(x.prior)), got: { prior: x.prior } }; };
  C[80] = async () => { const pid = await paint(); const tp = await ev(() => { const s = __cur(); return __live('مسئلهٔ سفر', 'ما ۴ نفریم و هر نفر ۲ شب می‌مونه', { by: 'assistant', sess: s.id }); });
    await turn('تو مسئله‌ی سفر، ۴ نفر نیستیم ۵ نفریم', 'فرستادم.', RT({ msg: 'ساعتِ ۹ صبح شروع می‌کنیم و ۳ نفر کمکم می‌کنن', key: 'datum:نفرها', what: 'fact', fix: '۵ نفر' })); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5, 6].every(n => !marked(x, n)) && !x.stale.length, got: { prior: x.prior, stale: x.stale, tp } }; };
  C[81] = async () => { const pid = await cem(); await turn('اون ۸۰۰ رو عوض نکن', 'باشه، همان ۸۰۰ هزار است.'); const x = await snap(pid);
    return { ok: /چسبِ کاشی ۸۰۰ هزار/.test(J(x.prior)) && !/اصلاح شد/.test(J(x.sys)) && !x.prior.some(s => s.fixed), got: { prior: x.prior, sys: x.sys } }; };
  C[82] = async () => { const pid = await paint(); await COV('هر لیتر ۹ نیست، ۱۰ مترمربع رو می‌پوشونه'); await turn('۵۴ ÷ ۹ = ۶، همونه دیگه', 'درسته.'); const x = await snap(pid);
    return { ok: marked(x, 2), got: { prior: x.prior } }; };
  C[83] = async () => { const { x } = await acc('آره', async () => { await turn('بعدش؟', 'می‌خوای اول سقف رو حساب کنیم؟'); }); return { ok: [1, 2, 3, 4, 5, 6].every(n => !stN(x, n).fixed), got: { prior: x.prior } }; };
  C[84] = async () => { const pid = await paint(); await turn('عرض همون ۴ ـه، درسته', 'درسته.'); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5, 6].every(n => !marked(x, n)) && !/اصلاح شد/.test(J(x.sys)), got: { prior: x.prior, sys: x.sys } }; };
  C[85] = async () => { const pid = await paint(); await turn('داداشم میگه باید ۱۰ درصد بیشتر بخرم', 'نظرِ او را بسنج.'); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5, 6].every(n => !marked(x, n) && !stN(x, n).fixed), got: { prior: x.prior } }; };
  C[86] = async () => { await scen({ prior: [RES('ما ۴ نفریم و هر نفر ۲ شب می‌مونه، شبی ۶۰۰ هزار: ۴ × ۲ × ۶۰۰ = ۴۸۰۰ هزار')], stmtChat: 'ما ۴ نفریم و هر نفر ۲ شب می‌مونه، شبی ۶۰۰ هزار' });
    await turn('۲ شب نه، ۳ شب', 'فرستادم.', RT({ msg: 'ما ۴ نفریم و هر نفر ۲ شب می‌مونه، شبی ۶۰۰ هزار', key: 'datum:شب', what: 'fact', fix: '۳ شب' })); const x = await snap('');
    return { ok: x.stmtChat === 'ما ۴ نفریم و هر نفر ۳ شب می‌مونه، شبی ۶۰۰ هزار' && /4800>7200(?![.\d])/.test(J(x.s26)), got: { stmt: x.stmtChat, s26: x.s26, sys: x.sys } }; };

  for (const e of Q2) { const n = e.idx, tag = '#' + n + ' [' + e.kind + '/' + e.role + '] ' + String(e.text).slice(0, 70);
    if (process.env.ONLY && !process.env.ONLY.split(',').includes(String(n))) continue;
    if (NC[n]) { out.summary.nc++; out.nc[n] = NC[n]; continue; }
    if (!C[n]) { out.summary.nc++; out.nc[n] = 'no check written'; out.fail.push(tag + ' — no check'); out.summary.fail++; continue; }
    let r; try { r = await C[n](); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; }
    if (r.ok) out.summary.pass++; else { out.summary.fail++; out.fail.push(tag + ' got ' + J(r.got).slice(0, +process.env.GOTN || 1500)); } }
  return out;
}
module.exports = { run };
