// بانکِ مستقلِ VARIANTS_R29 — هر ورودیِ R2.correction_engine یک بررسی (برای tests/test_tour1_r29_correction_bank.js؛ خودش آزمون نیست).
// شماره‌ها اندیسِ ۰‌پایهٔ VARIANTS_R29.json اند (۵۹…۱۰۰). متنِ ورودی‌ها دست نخورده است؛ NC = ورودی‌ای که برآورده نشد، با دلیل (در گزارشِ fixer هم آمده).
// «مسئلهٔ موکت» همان پایهٔ سرِ خانوادهٔ R2 در VARIANTS_R29.md است. گزارشِ retract ِ «مدلِ لفظی»: تکهٔ پیشین (msg) و مقدارِ درست (fix).
async function run(ctx) {
  const { turn, Q2, H } = ctx;
  const { scen, snap, allText, RT, J, ev } = H;
  const out = { summary: { pass: 0, fail: 0, nc: 0, of: Q2.length }, nc: {}, fail: [] };
  const C = {}, NC = {};
  const near = (a, b) => a != null && b != null && Math.abs(a - b) < 1e-6;
  /* ---- «مسئلهٔ موکت» ---- */
  const MQ = ['اتاق ۶ متر در ۴ متر = ۲۴ مترمربع', 'متری ۲۵۰ هزار: ۲۴ × ۲۵۰ = ۶۰۰۰ هزار', 'نصبِ متری ۴۰ هزار: ۲۴ × ۴۰ = ۹۶۰ هزار', 'جمع: ۶۰۰۰ + ۹۶۰ = ۶۹۶۰ هزار', 'سه نفری: ۶۹۶۰ ÷ ۳ = ۲۳۲۰ هزار'];
  const MDEP = [[], [1], [1], [2, 3], [4]];
  const OPEN = 'می‌خوام کفِ اتاق رو موکت کنم. گام ۱: ' + MQ[0] + '. گام ۲: ' + MQ[1] + '. گام ۳: ' + MQ[2] + '. گام ۴: ' + MQ[3] + '. گام ۵: ' + MQ[4] + '.';
  const moket = () => scen({ prior: [OPEN, 'نصاب ساعتِ ۴ میاد', 'اتاق ۴ تا پنجره داره', '۶ سال پیش موکت کرده بودیم'],
    live: { title: 'مسئلهٔ موکت', prior: { sum: '۵ گام — همه درست', resume: 0, steps: MQ.map((q, i) => ({ n: i + 1, quote: q, verdict: 'ok', why: '', dep: MDEP[i], depWrong: [] })) } } });
  const WID = (text, fix) => turn(text, 'فرستادم.', RT({ msg: 'اتاق ۶ متر در ۴ متر', key: 'datum:عرض', what: 'fact', fix: fix || '۵ متر' }));
  const PRI = (text, fix) => turn(text, 'فرستادم.', RT({ msg: 'متری ۲۵۰ هزار', key: 'datum:قیمت', what: 'fact', fix: fix || '۲۸۰ هزار' }));
  const stN = (x, n) => (x.prior || []).filter(s => s.n === n)[0] || {};
  const reOf = (st, v) => { const z = (st.stale || []).filter(q => near(q.v, v))[0]; return z ? z.re : undefined; };
  const marked = (x, n) => !!(stN(x, n).stale && stN(x, n).stale.length);
  const PROPS = (x, E) => Object.keys(E).every(n => { const st = stN(x, +n), w = E[n]; return near(reOf(st, w[0]), w[1]); });
  const anyRe = (x, bad) => (x.prior || []).some(s => (s.stale || []).some(q => bad.some(b => near(q.re, b)))) || x.stale.some(q => bad.some(b => near(q.re, b)));
  const W5 = { 1: [24, 30], 2: [6000, 7500], 3: [960, 1200], 4: [6960, 8700], 5: [2320, 2900] };
  C[59] = async () => { const pid = await moket(); await WID('عرض ۴ نیست، ۵'); const x = await snap(pid);
    return { ok: PROPS(x, W5) && !/(?:پنجره|ساعتِ) ۵/.test(J([x.prior, x.sysAll, x.stmtChat])), got: { prior: x.prior, sys: x.sys } }; };
  C[60] = async () => { const pid = await moket(); await WID('عرض ۴ نیست، ۵'); await PRI('متری ۲۵۰ نیست، ۲۸۰'); const x = await snap(pid);
    return { ok: PROPS(x, { 2: [6000, 8400], 4: [6960, 9600], 5: [2320, 3200], 3: [960, 1200] }) && !anyRe(x, [9744, 3248, 6720]), got: { prior: x.prior, stale: x.stale, sys: x.sys } }; };
  C[61] = async () => { const pid = await moket(); await WID('عرض ۴ نیست، ۵'); await WID('عرض ۵ هم نیست، ۵٫۵', '۵٫۵ متر'); const x = await snap(pid);
    return { ok: PROPS(x, { 1: [24, 33], 2: [6000, 8250], 3: [960, 1320], 4: [6960, 9570], 5: [2320, 3190] }) && !/گام ۵٫۵/.test(J([x.sysAll, x.stmtChat, x.st])) && !/چیزی ثبت نشده بود|انجام نشد/.test(allText(x)), got: { prior: x.prior, sys: x.sys } }; };
  /* چت‌محور: اجاره */
  const RES = H.RES;
  C[62] = async () => { await scen({ prior: [RES('اجاره ۱۲ میلیون، ما ۳ نفریم: ۱۲ ÷ ۳ = ۴ میلیون سهمِ هر نفر')], stmtChat: 'اجاره ۱۲ میلیون، ما ۳ نفریم' });
    await turn('ما ۴ نفریم نه ۳', 'فرستادم.', RT({ msg: 'ما ۳ نفریم', key: 'datum:نفرها', what: 'fact', fix: '۴ نفریم' }));
    await turn('نه ببخشید، ۵ نفریم نه ۴', 'فرستادم.', RT({ msg: 'ما ۴ نفریم نه ۳', key: 'datum:نفرها', what: 'fact', fix: '۵ نفریم' })); const x = await snap('');
    return { ok: /ما ۵ نفریم/.test(x.stmtChat) && /(?:^| )4>2\.4(?![\d])/.test(J(x.s26)) && !/انجام نشد/.test(allText(x)), got: { stmt: x.stmtChat, s26: x.s26, sys: x.sys } }; };
  C[63] = async () => { await scen({ prior: [RES('ارثیه ۹ میلیارد، ۴ نفریم: ۹ ÷ ۴ = ۲٫۲۵ میلیارد')], stmtChat: 'ارثیه ۹ میلیارد، ۴ نفریم: ۹ ÷ ۴ = ۲٫۲۵ میلیارد' });
    await turn('۶ نفریم نه ۴', 'فرستادم.', RT({ msg: 'ارثیه ۹ میلیارد، ۴ نفریم', key: 'datum:نفرها', what: 'fact', fix: '۶ نفریم' }));
    await turn('۹ نیست، ۱۰٫۸ میلیارد', 'فرستادم.', RT({ msg: 'ارثیه ۹ میلیارد', key: 'datum:ارثیه', what: 'fact', fix: '۱۰٫۸ میلیارد' })); const x = await snap('');
    return { ok: /2\.25>1\.8(?![\d])/.test(J(x.sstale)) && !/2\.25>2\.7(?![\d])/.test(J(x.sstale)), got: { s26: x.s26, sys: x.sys } }; };
  C[64] = async () => { await scen({ prior: [RES('۴۰ ÷ ۱۶ = ۲٫۵')], stmtChat: 'نسبتِ دستور: ۴۰ ÷ ۱۶ = ۲٫۵' });
    await turn('۴۰ نیست، ۳۶', 'فرستادم.', RT({ msg: '۴۰ ÷ ۱۶', key: 'datum:a', what: 'fact', fix: '۳۶' }));
    await turn('۱۶ هم نیست، ۱۸', 'فرستادم.', RT({ msg: '۴۰ ÷ ۱۶', key: 'datum:b', what: 'fact', fix: '۱۸' })); const x = await snap('');
    return { ok: /2\.5>2(?![.\d])/.test(J(x.sstale)), got: { s26: x.s26, sys: x.sys } }; };
  const BOX = 'اسباب‌کشی: ۲۰ تا کارتن، هر کدوم ۱۸ هزار: ۲۰ × ۱۸ = ۳۶۰ هزار؛ با ۵۰ هزار نوارچسب: ۳۶۰ + ۵۰ = ۴۱۰ هزار';
  C[65] = async () => { await scen({ prior: [RES(BOX)], stmtChat: BOX });
    await turn('۱۸ نیست، ۲۰', 'فرستادم.', RT({ msg: 'هر کدوم ۱۸ هزار', key: 'datum:قیمت', what: 'fact', fix: '۲۰ هزار' })); const x = await snap('');
    return { ok: /360>400(?![.\d])/.test(J(x.s26)) && /410>450(?![.\d])/.test(J(x.s26)) && !/455\.5/.test(J(x.s26)) && !/(?:^| )20>/.test(J(x.s26)), got: { s26: x.s26, sys: x.sys } }; };
  const BOX15 = 'اسباب‌کشی: ۲۰ تا کارتن، هر کدوم ۱۵ هزار: ۲۰ × ۱۵ = ۳۰۰ هزار';
  C[66] = async () => { await scen({ prior: [RES(BOX15)], stmtChat: BOX15 });
    await turn('۱۵ نیست، ۱۸', 'فرستادم.', RT({ msg: 'هر کدوم ۱۵ هزار', key: 'datum:قیمت', what: 'fact', fix: '۱۸ هزار' }));
    await turn('۱۸ هم نیست، ۲۰', 'فرستادم.', RT({ msg: '۱۵ نیست، ۱۸', key: 'datum:قیمت', what: 'fact', fix: '۲۰' }));
    await turn('آره، همون ۳۶۰ درسته', 'باشه.'); const x = await snap('');
    return { ok: /300>400(?![.\d])/.test(J(x.sstale)) && !/جاری: ۳۰۰ ⇒ ۳۶۰/.test(allText(x)), got: { s26: x.s26, sys: x.sys } }; };
  C[67] = async () => { const pid = await moket(); await turn('نصبِ متری ۴۰ نبود، ۴۵ بود', 'فرستادم.', RT({ msg: 'نصبِ متری ۴۰ هزار', key: 'datum:نصب', what: 'fact', fix: '۴۵ هزار' })); const x = await snap(pid);
    return { ok: PROPS(x, { 3: [960, 1080], 4: [6960, 7080], 5: [2320, 2360] }) && !marked(x, 1) && !marked(x, 2), got: { prior: x.prior, sys: x.sys } }; };
  C[68] = async () => { await scen({ prior: [RES('دیوارها ۴۸ مترمربع، هر لیتر ۱۲ مترمربع: ۴۸ ÷ ۱۲ = ۴ لیتر؛ هر قوطی ۴ لیتر میشه، پس ۱ قوطی')], stmtChat: 'دیوارها ۴۸ مترمربع، هر قوطی ۴ لیتر' });
    await turn('یه اصلاحِ دیگه: هر قوطی ۴ لیتر نمیشه، ۵ لیتر میشه', 'فرستادم.', RT({ msg: 'هر قوطی ۴ لیتر میشه', key: 'datum:قوطی', what: 'fact', fix: '۵ لیتر' })); const x = await snap('');
    /* صورتِ گفت‌وگو این‌جا ساختگی است (از پیامِ او نیامده) — بانک «اندازهٔ قوطی ۵ با تاریخچه» و «هرگز ردِ اصلاح» را می‌خواهد: سطرِ اصلاح با «۵» و بی رد */
    return { ok: /اصلاح شد/.test(J(x.sysAll)) && /«۵(?: لیتر)?»/.test(J(x.sysAll)) && !/انجام نشد|نشانهٔ اصلاح/.test(allText(x)) && !x.refused, got: { stmt: x.stmtChat, sys: x.sys, ref: x.refused } }; };
  C[69] = async () => { await scen({ prior: [RES('۵ تا سبد داریم، هر سبد ۱۲ تا سیب: ۵ × ۱۲ = ۶۰ تا سیب')], stmtChat: '۵ تا سبد داریم، هر سبد ۱۲ تا سیب' });
    await turn('هر سبد ۱۲ تا سیب نمیشه، ۱۰ تا میشه', 'فرستادم.', RT({ msg: 'هر سبد ۱۲ تا سیب', key: 'datum:سبد', what: 'fact', fix: '۱۰ تا' })); const x = await snap('');
    return { ok: /هر سبد ۱۰ تا سیب/.test(x.stmtChat) && /60>50(?![.\d])/.test(J(x.s26)) && !/انجام نشد/.test(allText(x)), got: { stmt: x.stmtChat, s26: x.s26, sys: x.sys, ref: x.refused } }; };
  C[70] = async () => { const pid = await moket(); await turn('۴ نیست، ۵', 'فرستادم.', RT({ msg: '۴', key: 'datum:?', what: 'fact', fix: '۵' })); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5].every(n => !marked(x, n)) && /کدام/.test(allText(x)), got: { prior: x.prior, sys: x.sys, ref: x.refused } }; };
  const PAN = '۸ تا پنل، هر کدوم ۵ میلیون: ۸ × ۵ = ۴۰ میلیون. شیشه‌ش ۵ میلی‌متره';
  C[71] = async () => { await scen({ prior: [RES(PAN)], stmtChat: PAN });
    await turn('ضخامتِ شیشه ۵ نیست، ۶ میلی‌متره', 'فرستادم.', RT({ msg: 'شیشه‌ش ۵ میلی‌متره', key: 'datum:ضخامت', what: 'fact', fix: '۶ میلی‌متره' })); const x = await snap('');
    return { ok: /هر کدوم ۵ میلیون/.test(x.stmtChat) && /۶ میلی‌متر/.test(x.stmtChat) && !/40>/.test(J(x.s26)), got: { stmt: x.stmtChat, s26: x.s26, sys: x.sys } }; };
  const PAN2 = '۸ تا پنل، هر کدوم ۴٫۵ میلیون: ۸ × ۴٫۵ = ۳۶ میلیون. شیشه ۵ میلی‌متره';
  C[72] = async () => { await scen({ prior: [RES(PAN2)], stmtChat: PAN2 });
    await turn('پنل ۴٫۵ نیست، ۵ میلیون', 'فرستادم.', RT({ msg: 'هر کدوم ۴٫۵ میلیون', key: 'datum:قیمت', what: 'fact', fix: '۵ میلیون' }));
    await turn('ضخامت ۵ نیست، ۶', 'فرستادم.', RT({ msg: 'شیشه ۵ میلی‌متره', key: 'datum:ضخامت', what: 'fact', fix: '۶ میلی‌متره' }));
    await turn('آره، همون ۴۰ میلیون درسته', 'باشه.'); const x = await snap('');
    return { ok: /پذیرفتی/.test(allText(x)) && !/بعداً «۶ میلی‌متر» شد/.test(allText(x)), got: { s26: x.s26, sys: x.sys, story: x.story } }; };
  C[73] = async () => { await scen({ prior: ['مجموعِ ۱/(n(n+1)) برای n از ۱ تا ۱۵ چند میشه؟'], stmtChat: 'مجموعِ ۱/(n(n+1)) برای n از ۱ تا ۱۵ چند میشه؟' });
    await turn('منظورم n از ۱ تا ۳۰ بود، نه از ۱ تا ۱۵', 'فرستادم.', RT({ msg: 'n از ۱ تا ۱۵', key: 'datum:بازه', what: 'fact', fix: 'n از ۱ تا ۳۰' })); const x = await snap('');
    return { ok: (x.stmtChat === 'مجموعِ ۱/(n(n+1)) برای n از ۱ تا ۳۰ چند میشه؟' || /کدام/.test(allText(x))) && !/۳۰ n =|n = ۱ تا ۱۵/.test(x.stmtChat), got: { stmt: x.stmtChat, sys: x.sys } }; };
  const GARD = 'باغچه‌ای به طولِ ۹ متر و عرضِ ۶ متر دارم؛ مساحتش ۹ × ۶ = ۵۴ مترمربعه.';
  C[74] = async () => { await scen({ prior: [RES(GARD)], stmtChat: GARD });
    await turn('عرضِ باغچه ۶ نیست، ۵ متره', 'فرستادم.', RT({ msg: 'عرضِ ۶ متر', key: 'datum:عرض', what: 'fact', fix: '۵ متره' })); const x = await snap('');
    return { ok: /عرضِ ۵ متر دارم/.test(x.stmtChat) && !/متره دارم/.test(x.stmtChat) && x.stmtChat.replace('عرضِ ۵ متر', 'عرضِ ۶ متر') === GARD, got: { stmt: x.stmtChat, sys: x.sys } }; };
  C[75] = async () => { const pid = await moket(); await WID('عرض ۴ نیست، ۵'); await PRI('متری ۲۵۰ نیست، ۲۸۰'); await turn('آره، همون ۸۷۰۰ درسته', 'باشه.'); const x = await snap(pid);
    return { ok: !/۸۷۰۰/.test(stN(x, 4).fixed || '') && /۲۵۰/.test(allText(x)) && /۹۶۰۰/.test(allText(x)) && !/پذیرفتی — «۶۹۶۰ ⇒ ۸۷۰۰»/.test(allText(x)), got: { s4: stN(x, 4), sys: x.sys } }; };
  C[76] = async () => { const pid = await moket(); await WID('عرض ۴ نیست، ۵'); await turn('آره، همون ۸۷۰۰ درسته', 'باشه.'); const x = await snap(pid);
    return { ok: /۸۷۰۰/.test(stN(x, 4).fixed || '') && PROPS(x, { 5: [2320, 2900] }), got: { prior: x.prior, sys: x.sys } }; };
  const QRN = 'قرنیز: دورِ اتاق ۲ × (۶ + ۴) = ۲۰ متر، متری ۱۵۰ هزار: ۲۰ × ۱۵۰ = ۳۰۰۰ هزار. شاخه‌ها ۳ متری‌ان: ۸ × ۳ = ۲۴، ۴ متر می‌مونه';
  C[77] = async () => { await scen({ prior: [RES(QRN)], stmtChat: QRN });
    await turn('متری ۱۵۰ نیست، ۱۸۰', 'فرستادم.', RT({ msg: 'متری ۱۵۰ هزار', key: 'datum:قیمت', what: 'fact', fix: '۱۸۰ هزار' })); const x = await snap('');
    return { ok: /3000>3600(?![.\d])/.test(J(x.s26)) && !/(?:^| )(?:20|8|24|4)>/.test(J(x.s26)), got: { s26: x.s26, sys: x.sys } }; };
  const HAL = 'کفِ هال ۵٫۵ در ۴ = ۲۲ متر، متری ۱۵۰ هزار: ۲۲ × ۱۵۰ = ۳۳۰۰ هزار';
  C[78] = async () => { await scen({ prior: [RES(HAL)], stmtChat: HAL });
    await turn('۱۵۰ نیست، ۱۶۰', 'فرستادم.', RT({ msg: 'متری ۱۵۰ هزار', key: 'datum:قیمت', what: 'fact', fix: '۱۶۰ هزار' }));
    await turn('۱۶۰ هم نیست، ۱۸۰', 'فرستادم.', RT({ msg: '۱۵۰ نیست، ۱۶۰', key: 'datum:قیمت', what: 'fact', fix: '۱۸۰' })); const x = await snap('');
    const reg = process.env.DBG ? await ev(() => { const se = APP.ASSIST.cur(), C = se.coach || {}; const RC = [{ k: 'stmt', t: C.stmt, zone: 'given' }].concat(se.msgs.filter(m => m.role === 'user').map((m, i) => ({ k: 'msg:' + i, t: m.text, zone: 'ctx' }))).concat((se.coachEv || []).filter(e => e && !e.wd && e.ok && e.how === 'res' && e.src20).map((e, i) => ({ k: 'res:' + i, t: e.src20.span, zone: 'role' })));
      const warns = []; const w0 = console.warn; console.warn = (e) => warns.push(String(e && e.stack || e).slice(0, 400)); const ss = APP.liveSessStale(se.id, { o: '۱۶۰', n: '۱۸۰' }, { mid: 'u2', cm: 'u3', src: '۱۵۰ نیست، ۱۶۰' }); console.warn = w0;
      return { ss, warns, RC, r: APP.liveStaleCore(RC, { o: '۱۵۰ هزار', n: '۱۸۰ هزار' }, null, { clause: '' }).map(x => [x.k, x.v, x.re]) }; }) : null;
    return { ok: /3300>3960(?![.\d])/.test(J(x.sstale)) && !/3600/.test(J(x.sstale)), got: { s26: x.s26, sys: x.sys, reg } }; };
  C[79] = async () => { await scen({ prior: [RES('۵ × ۵ = ۲۵ تا کاشی لازمه')], stmtChat: '۵ × ۵ = ۲۵ تا کاشی لازمه' });
    await turn('نه، ردیف‌ها ۴ تاست، با ۴ تا ردیف کافیه. پس جوابم غلط بود', 'باشه، پس آن جواب را کنار گذاشتی.'); const x = await snap('');
    return { ok: /۵ × ۵ = ۲۵/.test(J(x.story.concat(x.ev.map(e => e.span || '')))) && !/اصلاح شد ⇐ «۵ × ۵/.test(allText(x)), got: { story: x.story, ev: x.ev, sys: x.sys } }; };
  C[80] = async () => { const pid = await moket(); await turn('اتاق ۶ در ۴ نبود، ۶ در ۴٫۵ بود', 'فرستادم.', RT({ msg: 'اتاق ۶ متر در ۴ متر', key: 'datum:ابعاد', what: 'fact', fix: '۶ متر در ۴٫۵ متر' })); const x = await snap(pid);
    return { ok: PROPS(x, { 1: [24, 27], 2: [6000, 6750], 3: [960, 1080], 4: [6960, 7830], 5: [2320, 2610] }), got: { prior: x.prior, sys: x.sys } }; };
  C[81] = async () => { const pid = await moket(); await WID('عرض ۴ نیست، ۵'); await PRI('متری ۲۵۰ نیست، ۲۸۰'); const x = await snap(pid);
    return { ok: PROPS(x, { 4: [6960, 9600] }) && !(x.sysAll || []).some(t => /⇐/.test(t) && /→/.test(t)), got: { s4: stN(x, 4), sys: x.sys } }; };
  /* منفی‌ها */
  C[82] = async () => { const pid = await moket(); await turn('اگه عرض ۵ بود چی؟', 'خودت حساب کن.'); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5].every(n => !marked(x, n)) && !x.stale.length, got: { prior: x.prior } }; };
  C[83] = async () => { const pid = await moket(); await turn('اتاق ۵ تا پنجره داره نه ۴', 'فرستادم.', RT({ msg: 'اتاق ۴ تا پنجره داره', key: 'datum:پنجره', what: 'fact', fix: '۵ تا پنجره' })); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5].every(n => !marked(x, n)) && !x.stale.length && /۶ متر در ۴ متر/.test(J(x.prior)), got: { prior: x.prior, stale: x.stale } }; };
  C[84] = async () => { await scen({ prior: ['۲۳ تا سیب دارم'], stmtChat: '۲۳ تا سیب دارم' }); await turn('۲۳ تا سیب رو با ۱۲ تا سبد نمیشه مساوی تقسیم کرد', 'درسته؛ چرا؟'); const x = await snap('');
    return { ok: !/اصلاح شد/.test(J(x.sysAll)) && x.stmtChat === '۲۳ تا سیب دارم', got: { sys: x.sys } }; };
  C[85] = async () => { const pid = await moket(); await turn('پارسال قیمتش ۲۵۰ نبود، خیلی ارزون‌تر بود', 'جالب است.'); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5].every(n => !marked(x, n)) && !/اصلاح شد/.test(J(x.sysAll)), got: { prior: x.prior, sys: x.sys } }; };
  C[86] = async () => { const pid = await moket(); await WID('عرض ۴ نیست، ۵'); await turn('آره، همون ۸۸۰۰ درسته', 'باشه.'); const x = await snap(pid);
    return { ok: !/۸۸۰۰/.test(stN(x, 4).fixed || '') && !/پذیرفتی/.test(J(x.sys)), got: { s4: stN(x, 4), sys: x.sys } }; };
  C[87] = async () => { const pid = await moket(); await WID('عرض ۴ نیست، ۵'); await turn('نه، ۸۷۰۰ رو قبول ندارم، خودم دستی حساب می‌کنم', 'باشه.'); const x = await snap(pid);
    return { ok: !stN(x, 4).fixed && near(reOf(stN(x, 4), 6960), 8700), got: { s4: stN(x, 4) } }; };
  C[88] = async () => { const pid = await moket(); await turn('جمع ۶۹۶۰ نیست، ۶۹۰۰', 'فرستادم.', RT({ msg: 'جمع: ۶۰۰۰ + ۹۶۰ = ۶۹۶۰ هزار', key: 'step:4', what: 'said', fix: '۶۹۰۰' })); const x = await snap(pid);
    return { ok: !/۶۹۰۰/.test(stN(x, 4).fixed || '') && [1, 2, 3].every(n => !marked(x, n)) && /۶ متر در ۴ متر/.test(J(x.prior)), got: { prior: x.prior, sys: x.sys } }; };
  C[89] = async () => { const pid = await moket(); await turn('فکر کنم جوابم غلط باشه؟', 'کدام گام را شک داری؟'); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5].every(n => !marked(x, n) && !stN(x, n).fixed) && !/ردشده/.test(J(x.sysAll)), got: { prior: x.prior } }; };
  C[90] = async () => { const pid = await moket(); await turn('طول ۶ نیست، ۷', 'فرستادم.', RT({ msg: 'اتاق ۶ متر در ۴ متر', key: 'datum:طول', what: 'fact', fix: '۷ متر' })); const x = await snap(pid);
    return { ok: PROPS(x, { 1: [24, 28], 2: [6000, 7000], 3: [960, 1120], 4: [6960, 8120] }) && near(reOf(stN(x, 5), 2320), 8120 / 3) && !x.stale.some(z => /سال/.test(z.raw || '')), got: { prior: x.prior, stale: x.stale } }; };
  C[91] = async () => { await scen({ prior: ['۵ × ۴ = ۲۰'], stmtChat: '۵ × ۴ = ۲۰' }); await turn('یه اصلاحِ دیگه هم بکنم؟', 'بله، بگو.'); const x = await snap('');
    return { ok: !/انجام نشد|اصلاح شد/.test(J(x.sysAll)), got: { sys: x.sys } }; };
  C[92] = async () => { await scen({ prior: [RES('شاخه‌ها ۳ متری‌ان، ۲۰ متر لازمه: ۸ × ۳ = ۲۴، ۴ متر می‌مونه')], stmtChat: 'شاخه‌ها ۳ متری‌ان، ۲۰ متر لازمه' });
    await turn('شاخه‌ها ۳ متری نیست، ۴ متری‌ان', 'فرستادم.', RT({ msg: 'شاخه‌ها ۳ متری‌ان', key: 'datum:شاخه', what: 'fact', fix: '۴ متری‌ان' })); const x = await snap('');
    return { ok: /24>32(?![.\d])/.test(J(x.s26)) && /(?:^| )4>12(?![.\d])/.test(J(x.s26)), got: { s26: x.s26, sys: x.sys } }; };
  C[93] = async () => { const pid = await moket(); await turn('اتاقِ دوم ۵ متر در ۴ متره', 'خب.'); await turn('عرضِ اتاقِ دوم ۴ نیست، ۳', 'فرستادم.', RT({ msg: 'اتاقِ دوم ۵ متر در ۴ متره', key: 'datum:عرض۲', what: 'fact', fix: '۳ متره' })); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5].every(n => !marked(x, n)) && /۶ متر در ۴ متر/.test(J(x.prior)), got: { prior: x.prior } }; };
  C[94] = async () => { await scen({ prior: ['مجموعِ ۱/(n(n+1)) برای n از ۱ تا ۱۵ چند میشه؟'], stmtChat: 'مجموعِ ۱/(n(n+1)) برای n از ۱ تا ۱۵ چند میشه؟' });
    await turn('منظورم n از ۱ تا ۲۰ بود', 'فرستادم.', RT({ msg: 'n از ۱ تا ۱۵', key: 'datum:بازه', what: 'fact', fix: 'n از ۱ تا ۲۰' })); const x = await snap('');
    return { ok: (x.stmtChat === 'مجموعِ ۱/(n(n+1)) برای n از ۱ تا ۲۰ چند میشه؟' || /کدام/.test(allText(x))) && x.stmtChat.indexOf('مجموعِ ۱/(n(n+1)) برای n از ۱ تا') === 0, got: { stmt: x.stmtChat, sys: x.sys } }; };
  C[95] = async () => { const pid = await moket(); await turn('آهان، اصلاً ۵ متر بود، نه ۴ — اگه ۶ بود چی می‌شد؟', 'فرستادم.', RT({ msg: 'اتاق ۶ متر در ۴ متر', key: 'datum:عرض', what: 'fact', fix: '۵ متر' })); const x = await snap(pid);
    return { ok: PROPS(x, { 1: [24, 30] }) && !anyRe(x, [36]), got: { prior: x.prior } }; };
  C[96] = async () => { const pid = await moket(); await turn('نصاب ساعتِ ۴ نمیاد، ساعتِ ۵ میاد', 'فرستادم.', RT({ msg: 'نصاب ساعتِ ۴ میاد', key: 'datum:ساعت', what: 'fact', fix: 'ساعتِ ۵' })); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5].every(n => !marked(x, n)) && !x.stale.length, got: { prior: x.prior, stale: x.stale } }; };
  C[97] = async () => { const pid = await moket(); await WID('عرض ۴ نیست، ۵'); await turn('نه ببخشید، همون ۴ درست بود', 'فرستادم.', RT({ msg: 'عرض ۴ نیست، ۵', key: 'datum:عرض', what: 'fact', fix: '۴' })); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5].every(n => !marked(x, n)) && !x.stale.length, got: { prior: x.prior, stale: x.stale, sys: x.sys } }; };
  C[98] = async () => { await scen({ prior: [RES('۵ × ۵ = ۲۵ تا کاشی لازمه')], stmtChat: '۵ × ۵ = ۲۵ تا کاشی لازمه' }); await turn('پس جوابم غلط نبود، درسته', 'درسته.'); const x = await snap('');
    return { ok: !/ردشده/.test(J(x.sysAll.concat(x.story))) && !/اصلاح شد/.test(J(x.sysAll)), got: { sys: x.sys, story: x.story } }; };
  C[99] = async () => { const pid = await moket(); await PRI('متری ۲۵۰ نیست، ۲۸۰'); await WID('عرض ۴ نیست، ۵'); const x = await snap(pid);
    return { ok: PROPS(x, { 1: [24, 30], 2: [6000, 8400], 3: [960, 1200], 4: [6960, 9600], 5: [2320, 3200] }) && !anyRe(x, [9744]), got: { prior: x.prior, sys: x.sys } }; };
  C[100] = async () => { const pid = await moket(); await WID('عرض ۴ نیست، ۵'); const x = await snap(pid);
    return { ok: near(reOf(stN(x, 1), 24), 30) && !/۵ تا پنجره/.test(J([x.prior, x.sysAll])), got: { prior: x.prior, sys: x.sys } }; };

  for (const e of Q2) { const n = e.idx, tag = '#' + n + ' [' + e.kind + '/' + e.role + '] ' + String(e.text).slice(0, 70);
    if (process.env.ONLY && !process.env.ONLY.split(',').includes(String(n))) continue;
    if (NC[n] && !process.env.NCRUN) { out.summary.nc++; out.nc[n] = NC[n]; continue; }
    if (!C[n]) { out.summary.nc++; out.nc[n] = 'no check written'; out.fail.push(tag + ' — no check'); out.summary.fail++; continue; }
    let r; try { r = await C[n](); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; }
    if (r.ok) out.summary.pass++; else { out.summary.fail++; out.fail.push(tag + ' got ' + J(r.got).slice(0, +process.env.GOTN || 1500)); } }
  return out;
}
module.exports = { run };
