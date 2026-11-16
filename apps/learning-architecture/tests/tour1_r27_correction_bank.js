// بانکِ مستقلِ VARIANTS_R27 — هر ورودیِ R2.correction_engine یک بررسی (برای tests/test_tour1_r27_correction_bank.js؛ خودش آزمون نیست).
// شماره‌ها اندیسِ ۰‌پایهٔ VARIANTS_R27.json اند (۶۴…۹۹). متنِ ورودی‌ها دست نخورده است؛ NC = ورودی‌ای که برآورده نشد، با دلیل (در گزارشِ fixer هم آمده).
async function run(ctx) {
  const { turn, Q2, H } = ctx;
  const { scen, snap, edit, yesAll, RES, st2, has, vals, allText, RT, J, ev } = H;
  const out = { summary: { pass: 0, fail: 0, nc: 0, of: Q2.length }, nc: {}, fail: [] };
  const C = {}, NC = {};
  const near = (a, b) => a != null && b != null && Math.abs(a - b) < 1e-6;
  /* ---- «مسئلهٔ کاشی» (دفترِ کارِ پیشین، پنج گام) ---- */
  const TQ = ['کفِ حمام ۲٫۴ متر در ۱٫۵ متر = ۳٫۶ مترمربع', 'هر کارتن ۱٫۲ مترمربع، پس ۳٫۶ ÷ ۱٫۲ = ۳ کارتن', 'هر کارتن ۴۵۰ هزار: ۳ × ۴۵۰ = ۱۳۵۰ هزار', '۲۰ درصد اضافه برای برش: ۳٫۶ × ۱٫۲ = ۴٫۳۲ مترمربع', 'پس با ۲ میلیون بودجه کافیه'];
  const TDEP = [[], [1], [2], [1], [3]];
  const tile = (o) => scen(Object.assign({ prior: [TQ.join('. ') + '.', 'ارتفاعِ دیوار ۳ متره و ۳ کیسه چسب خریدم'].concat((o && o.more) || []),
    live: { title: 'مسئلهٔ کاشی', prior: { sum: '۵ گام — همه درست', resume: 0, steps: TQ.map((q, i) => ({ n: i + 1, quote: q, verdict: 'ok', why: '', dep: TDEP[i], depWrong: [] })) } } }, (o && o.scen) || {}));
  const tileFix = (text, fix, old) => turn(text || 'طولِ کف ۲٫۸ ـه نه ۲٫۴', 'فرستادم.', RT({ msg: 'کفِ حمام ۲٫۴ متر در ۱٫۵ متر', key: 'datum:طولِ کف', what: 'fact', fix: fix || '۲٫۸', old: old || '۲٫۴' }));
  const stN = (x, n) => (x.prior || []).filter(s => s.n === n)[0] || {};
  const reOf = (st, v) => { const z = (st.stale || []).filter(q => near(q.v, v))[0]; return z ? z.re : undefined; };
  const marked = (x, n) => !!stN(x, n).stale;
  const T1 = async () => { const pid = await tile(); await tileFix(); return { pid, x: await snap(pid) }; };
  C[64] = async () => { const { x } = await T1(); return { ok: near(reOf(stN(x, 1), 3.6), 4.2) && !/این اصلاح انجام نشد/.test(allText(x)), got: { prior: x.prior, sys: x.sys } }; };
  C[65] = async () => { const { x } = await T1(); return { ok: near(reOf(stN(x, 2), 3), 3.5) && near(reOf(stN(x, 3), 1350), 1575), got: { prior: x.prior } }; };
  C[66] = async () => { const { x } = await T1(); return { ok: near(reOf(stN(x, 4), 4.32), 5.04), got: { prior: x.prior } }; };
  C[67] = async () => { const { x } = await T1(); const s5 = stN(x, 5); return { ok: marked(x, 5) && (s5.stale || []).every(z => z.re == null) && !s5.fixed, got: { s5 } }; };
  C[68] = async () => { const pid = await tile(); await tileFix(); await turn('دوباره حساب کردم: ۲٫۸ در ۱٫۵ میشه ۴٫۲ مترمربع', 'درست است.'); const x = await snap(pid);
    return { ok: !marked(x, 1) && marked(x, 2) && marked(x, 3), got: { prior: x.prior, stale: x.stale } }; };
  /* ---- C48: «X نه Y» و نقلِ پیشینی که هر دو عدد را دارد ---- */
  C[69] = async () => { await scen({ prior: [RES('۱۲ تا بسته دارم، هر بسته ۰٫۴ کیلو، پس ۱۲ × ۰٫۴ = ۴٫۸ کیلو')], stmtChat: '۱۲ تا بسته دارم، هر بسته ۰٫۴ کیلو' });
    await turn('اولش نوشتم هر بسته ۰٫۴ کیلوئه؛ اشتباه بود، ۰٫۳۵ ـه', 'فرستادم.', RT({ msg: 'هر بسته ۰٫۴ کیلوئه', key: 'datum:وزنِ بسته', what: 'fact', fix: '۰٫۳۵', old: '۰٫۴' }));
    const x = await snap(''); return { ok: !x.refused && !/انجام نشد/.test(allText(x)) && /4\.8>4\.2/.test(x.sstale) && /۴٫۸ ⇒ ۴٫۲/.test(allText(x)), got: { ev: x.ev, sstale: x.sstale, sys: x.sys, refused: x.refused } }; };
  C[70] = async () => { await scen({ prior: [RES('ما ۵ نفریم و ۴ میلیون پول داریم: ۴ ÷ ۵ = ۰٫۸ میلیون هر نفر')], stmtChat: 'ما ۵ نفریم و ۴ میلیون پول داریم' });
    await turn('۴ نفریم نه ۵ — حالا سهمِ هر نفر چقدر میشه؟', 'اصلاح را فرستادم؛ با ۴ نفر خودت حساب کن.', RT({ msg: 'ما ۵ نفریم و ۴ میلیون پول داریم', key: 'datum:شمارِ نفرها', what: 'fact', fix: '۴', old: '۵' }));
    const x = await snap(''); return { ok: !x.refused && !/فرقی نداشت|انجام نشد/.test(allText(x)) && /0\.8>1(?![.\d])/.test(x.sstale) && !/(?:^| )4>/.test(x.sstale), got: { sstale: x.sstale, sys: x.sys, refused: x.refused } }; };
  /* #71: دورِ ۲۷ب (leftovers) — «N میلیون و M هزار» در عبارتِ نوشته یک عدد است (a38 runs25 ِ بزرگی‌دار؛ C63)؛ دیگر NC نیست */
  C[71] = async () => { await scen({ prior: [RES('۸ نفر بودیم، ۲ میلیون و ۸۰۰ هزار ÷ ۸ = ۳۵۰ هزار هر نفر')], stmtChat: '۸ نفر بودیم' });
    await turn('۷ تاییم نه ۸ تا', 'فرستادم.', RT({ msg: '۸ نفر بودیم', key: 'datum:نفرها', what: 'fact', fix: '۷', old: '۸' }));
    const x = await snap(''); return { ok: !x.refused && /350>400(?![.\d])/.test(x.sstale), got: { sstale: x.sstale, sys: x.sys, refused: x.refused } }; };
  C[72] = async () => { await scen({ prior: [RES('کرایه ۲٫۵ میلیونه، ۵ نفریم: ۲٫۵ ÷ ۵ = ۰٫۵ میلیون')], stmtChat: 'کرایه ۲٫۵ میلیونه، ۵ نفریم' });
    await turn('یه اصلاح: کرایه ۳ میلیون بود نه ۲٫۵ — حالا سهمِ هر کدوم چقدر میشه؟', 'اصلاح را فرستادم.', RT({ msg: 'کرایه ۲٫۵ میلیونه', key: 'datum:کرایه', what: 'fact', fix: '۳ میلیون', old: '۲٫۵' }));
    const x = await snap(''); return { ok: !x.refused && !/پرسش بود/.test(allText(x)) && /0\.5>0\.6(?![\d])/.test(x.sstale), got: { sstale: x.sstale, sys: x.sys, refused: x.refused } }; };
  C[73] = async () => { const pid = await tile(); await turn('صبر کن، قیمتِ هر کارتن ۵۰۰ ـه نه ۴۵۰، با این حساب پول کم نمیاد؟', 'فرستادم.', RT({ msg: 'هر کارتن ۴۵۰ هزار', key: 'datum:قیمتِ کارتن', what: 'fact', fix: '۵۰۰', old: '۴۵۰' }));
    const x = await snap(pid); return { ok: !x.refused && near(reOf(stN(x, 3), 1350), 1500) && marked(x, 5) && (stN(x, 5).stale || []).every(z => z.re == null), got: { prior: x.prior, refused: x.refused, sys: x.sys } }; };
  /* ---- «مسئلهٔ دوچرخه» ---- */
  const BIKE = ['هر دور ۱۲ ثانیه، ۱۵ دور: ۱۲ × ۱۵ = ۱۸۰ ثانیه', 'با ۴۵ ثانیه استراحت: ۱۸۰ + ۴۵ = ۲۲۵ ثانیه', '۲۲۵ ثانیه = ۳٫۷۵ دقیقه', 'گرم‌کردن: ۴۰ + ۱۲ = ۵۲ دقیقه'];
  const bike = () => scen({ prior: [BIKE.join('. ') + '.'], live: { title: 'مسئلهٔ دوچرخه', prior: { sum: '۴ گام', resume: 0, steps: BIKE.map((q, i) => ({ n: i + 1, quote: q, verdict: 'ok', why: '', dep: i === 1 ? [1] : i === 2 ? [2] : [], depWrong: [] })) } } });
  const bikeFix = () => turn('هر دور ۱۰ ثانیه‌ست نه ۱۲', 'فرستادم.', RT({ msg: 'هر دور ۱۲ ثانیه', key: 'datum:زمانِ دور', what: 'fact', fix: '۱۰ ثانیه', old: '۱۲ ثانیه' }));
  C[74] = async () => { const pid = await bike(); await bikeFix(); const x = await snap(pid);
    return { ok: near(reOf(stN(x, 1), 180), 150) && near(reOf(stN(x, 2), 225), 195) && near(reOf(stN(x, 3), 3.75), 3.25) && !near(reOf(stN(x, 2), 225), 187.5), got: { prior: x.prior } }; };
  C[87] = async () => { const pid = await bike(); await bikeFix(); const x = await snap(pid); return { ok: !marked(x, 4) && !/۵۲ ⇒ ۵۰/.test(allText(x)), got: { prior: x.prior } }; };
  /* ---- C67: بازحسابِ گنگ ---- */
  C[75] = async () => { await scen({ prior: [RES('قاب ۱۲ در ۹ است؛ قطرِ قاب = √(۹² + ۱۲²) = ۱۵')], stmtChat: 'قاب ۱۲ در ۹ است' });
    await turn('ارتفاع ۱۰ ـه نه ۱۲', 'فرستادم.', RT({ msg: 'قاب ۱۲ در ۹ است', key: 'datum:ارتفاع', what: 'fact', fix: '۱۰', old: '۱۲' }));
    const x = await snap(''), t = allText(x) + x.sstale; return { ok: (/15>13\.45/.test(x.sstale) || /15>\?/.test(x.sstale)) && !/15>13(?![.\d])/.test(x.sstale) && !/۱۵ ⇒ ۱۳(?!٫)/.test(t), got: { sstale: x.sstale, sys: x.sys } }; };
  C[76] = async () => { const pid = await scen({ prior: [RES('حجم = ۲۰ × ۰٫۸ = ۱۶ لیتر')], live: { title: 'مخزن', stmt: 'مخزنِ آبِ باران', u: { one: 'حجمِ مخزن', dl: [{ id: 'd1', t: 'بام ۲۰ مترمربع' }, { id: 'd2', t: 'ضریب ۰٫۸' }] } } });
    await turn('ضریب ۰٫۷۵ ـه نه ۰٫۸', 'فرستادم.', RT({ msg: 'حجم = ۲۰ × ۰٫۸ = ۱۶ لیتر', key: 'datum:ضریب', what: 'fact', fix: '۰٫۷۵', old: '۰٫۸' })); const x = await snap(pid), t = J([x.asks, x.story, x.ch, x.sys]);
    return { ok: !/× ۰[٫.]۷۵ = ۱۶/.test(t) && (/16>15(?![.\d])/.test(x.sstale) || x.stale.some(z => near(z.v, 16) && near(z.re, 15)) || /۲۰ × ۰٫۷۵ = ۱۵/.test(t)), got: { asks: x.asks, sstale: x.sstale, stale: x.stale, ch: x.ch } }; };
  /* ---- ✏️ ---- */
  C[77] = async () => { const pid = await scen({ prior: ['۱۲ تا صندلی کرایه می‌کنم', '۱۲ تا صندلی برای مهمونا'], live: { title: 'تولد', stmt: 'جشنِ تولد', plan: '۱۲ تا صندلی برای مهمونا' } });
    const r = await edit(1, ['۱۲ تا صندلی کرایه', '۱۵ تا صندلی کرایه']); const x = await snap(pid);
    return { ok: x.asks.some(q => /۱۲ تا صندلی/.test(q.old) && /۱۵ تا صندلی/.test(q.new)) && x.plan === '۱۲ تا صندلی برای مهمونا', got: { r, asks: x.asks, plan: x.plan } }; };
  C[92] = async () => { const pid = await scen({ prior: ['۱۲ تا صندلی کرایه می‌کنم', 'نه ۱۲ تا، بیشتر لازمه'], live: { title: 'تولد', stmt: 'جشنِ تولد' } });
    await edit(1, ['۱۲ تا صندلی کرایه', '۱۵ تا صندلی کرایه']); const x = await snap(pid); return { ok: !x.asks.some(q => /نه ۱۵ تا/.test(q.new)), got: { asks: x.asks } }; };
  C[78] = async () => { const pid = await scen({ prior: ['وزنم ۷۸ کیلو بود و قدم ۱۷۵'], live: { title: 'وزن', stmt: 'وزنم ۷۸ کیلو بود و قدم ۱۷۵' } });
    const r = await edit(1, ['۷۸ کیلو', '۷۶ کیلو']); const x = await snap(pid), t = J([x.ch, x.sys]);   // آنچه او می‌بیند (سطرِ «اصلاح شد»)، نه قالبِ خامِ changed ِ این مهار
    return { ok: /[۷7][۶6][^«»]*» \(اصلاح شد ⇐ «[^»]*[۷7][۸8]/.test(t) && !/۱۷۵ ⇒|«[^»]*[۷7][۸8][^»]*» \(اصلاح شد ⇐ «[^»]*[۷7][۶6]/.test(t), got: { r: r.r, ch: x.ch } }; };
  C[79] = async () => { await scen({ prior: [RES('۵۰ تا لیوان بین ۶ تا میز: ۵۰ ÷ ۶ ≈ ۸٫۳ لیوان هر میز')], stmtChat: '۵۰ تا لیوان بین ۶ تا میز' });
    await turn('۵۰ تا لیوان بین ۸ تا میز نه ۶ تا', 'فرستادم.', RT({ msg: '۵۰ تا لیوان بین ۶ تا میز', key: 'datum:میز', what: 'fact', fix: '۸ تا میز', old: '۶ تا میز' }));
    const x = await snap(''); return { ok: /8\.3>6\.25(?![\d])/.test(x.sstale) || (/8\.3>6\.3(?![\d])/.test(x.sstale) && /۸٫۳ ⇒ ≈ ۶٫۳/.test(allText(x))), got: { sstale: x.sstale, sys: x.sys } }; };   // «اگر گرد، با نشان»
  C[80] = async () => { const pid = await tile(); await turn('عرض 1.8 ـه نه ۱٫۵', 'فرستادم.', RT({ msg: 'کفِ حمام ۲٫۴ متر در ۱٫۵ متر', key: 'datum:عرضِ کف', what: 'fact', fix: '1.8', old: '۱٫۵' }));
    const x = await snap(pid); return { ok: near(reOf(stN(x, 1), 3.6), 4.32) && near(reOf(stN(x, 2), 3), 3.6) && near(reOf(stN(x, 3), 1350), 1620) && near(reOf(stN(x, 4), 4.32), 5.184), got: { prior: x.prior } }; };
  C[81] = async () => { const pid = await tile(); await tileFix('طولِ کف ۲٫۸ ـه نه ۲٫۴ — راستی چسب هم بیشتر لازمه؟'); const x = await snap(pid);
    return { ok: !x.refused && near(reOf(stN(x, 1), 3.6), 4.2) && !x.stale.some(z => near(z.v, 3) && /چسب/.test(z.k + z.raw)), got: { prior: x.prior, refused: x.refused } }; };
  C[82] = async () => { await scen({ prior: [RES('پارچه ۶ متر، قیمت هر متر ۱۴۰ هزار: ۶ × ۱۴۰ = ۸۴۰ هزار')], stmtChat: 'پارچه ۶ متر، قیمت هر متر ۱۴۰ هزار' });
    await turn('یه اصلاح : قیمت هر متر ۱۲۰ هزاره نه ۱۴۰', 'فرستادم.', RT({ msg: 'قیمت هر متر ۱۴۰ هزار', key: 'datum:قیمت', what: 'fact', fix: '۱۲۰ هزار', old: '۱۴۰ هزار' }));
    const x = await snap(''); return { ok: !x.refused && /840>720(?![\d])/.test(x.sstale), got: { sstale: x.sstale, sys: x.sys, refused: x.refused } }; };
  C[83] = async () => { await scen({ prior: [RES('۱۶ نفر ثبت‌نام کردن: ۱۶ × ۸۵ = ۱۳۶۰ هزار'), RES('۱۳۶۰ ÷ ۴ = ۳۴۰ هزار هر هفته')], stmtChat: '۱۶ نفر ثبت‌نام کردن' });
    await turn('۱۸ نفر ثبت‌نام کردن نه ۱۶', 'فرستادم.', RT({ msg: '۱۶ نفر ثبت‌نام کردن', key: 'datum:نفرها', what: 'fact', fix: '۱۸ نفر', old: '۱۶ نفر' }));
    const x = await snap(''); return { ok: /1360>1530(?![\d])/.test(x.sstale) && /340>382\.5/.test(x.sstale), got: { ev: x.ev, sstale: x.sstale } }; };
  /* #84 — دورِ ۲۷ب (leftovers): گامِ تازهٔ بی رقم که با واژه («همون مقدارِ قبل») به گامِ ۱ تکیه دارد (dep ِ مدل، سنجیده با واژهٔ ارجاع؛ a45 priorMerge) کهنه است، بی عدد */
  C[84] = async () => { const pid = await tile(); await tileFix(); const q84 = 'مساحت همون مقدارِ قبل بود که حساب کردم، پس سود رو هم با همون بگیر';
    await turn(q84, 'باشه.', [{ do: 'coach_state', ph: 'c', said: [], prior: [{ quote: q84, step: 'سود با همان مساحت', verdict: 'ok', dep: [1] }] }]); const x = await snap(pid), s6 = stN(x, 6);
    return { ok: marked(x, 6) && (s6.stale || []).every(z => z.re == null) && marked(x, 1), got: { prior: x.prior } }; };
  C[85] = async () => { const { x } = await T1(); return { ok: !x.stale.some(z => near(z.v, 3) && /msg|stmt/.test(z.k) && /دیوار|چسب/.test(z.ctx || '')) && !/ارتفاعِ دیوار|کیسه چسب/.test(J(x.asks)) && marked(x, 2), got: { stale: x.stale, asks: x.asks } }; };
  C[86] = async () => { const pid = await tile(); await turn('۲۵ درصد اضافه بگیر نه ۲۰ درصد', 'فرستادم.', RT({ msg: '۲۰ درصد اضافه برای برش', key: 'datum:اضافه', what: 'fact', fix: '۲۵ درصد', old: '۲۰ درصد' }));
    const x = await snap(pid); return { ok: near(reOf(stN(x, 4), 4.32), 4.5) && !marked(x, 2) && !marked(x, 1), got: { prior: x.prior } }; };
  C[88] = async () => { await scen({ prior: [RES('۲۵ دقیقه پخت لازمه'), RES('قالب ۲۵ سانته، ۲۵ ÷ ۴ = ۶٫۲۵ سانت هر برش')], stmtChat: '۲۵ دقیقه پخت لازمه' });
    await turn('۳۰ دقیقه طول کشید نه ۲۵', 'فرستادم.', RT({ msg: '۲۵ دقیقه پخت لازمه', key: 'datum:زمانِ پخت', what: 'fact', fix: '۳۰ دقیقه', old: '۲۵ دقیقه' }));
    const x = await snap(''); return { ok: !/6\.25>/.test(x.sstale) && !/۶٫۲۵ ⇒ ۷٫۵/.test(allText(x)) && !x.ev.some(e => /۶٫۲۵/.test(e.span) && !!e.stale), got: { ev: x.ev, sstale: x.sstale } }; };
  C[89] = async () => { await scen({ prior: [RES('ما ۵ نفریم و ۴ میلیون پول داریم: ۴ ÷ ۵ = ۰٫۸ میلیون هر نفر')], stmtChat: 'ما ۵ نفریم و ۴ میلیون پول داریم' });
    await turn('اگه ۳ نفر بودیم چی؟', 'با ۳ نفر هر نفر بیشتر می‌گیرد؛ خودت حساب کن.'); const x = await snap('');
    return { ok: !x.sstale && !/انجام نشد|اصلاح شد/.test(J(x.sys)) && x.ev.every(e => !e.stale), got: { sstale: x.sstale, sys: x.sys } }; };
  C[90] = async () => { const pid = await tile(); await tileFix(); await turn('دوباره حساب کردم: ۲٫۴ در ۱٫۵ میشه ۳٫۶', 'درست است.'); const x = await snap(pid); return { ok: marked(x, 1), got: { prior: x.prior } }; };
  C[91] = async () => { const pid = await tile(); await turn('۹ نه ۷', 'فرستادم.', RT({ msg: '۷', key: 'datum:?', what: 'fact', fix: '۹', old: '۷' })); const x = await snap(pid);
    return { ok: [1, 2, 3, 4, 5].every(n => !marked(x, n)) && !x.stale.length, got: { prior: x.prior, sys: x.sys } }; };
  C[93] = async () => { const pid = await tile({ scen: { live: { title: 'مسئلهٔ کاشی', g: { guess: '۳ کارتن بسه', test: 'می‌شمارم' }, prior: { sum: '۵ گام', resume: 0, steps: TQ.map((q, i) => ({ n: i + 1, quote: q, verdict: 'ok', why: '', dep: TDEP[i], depWrong: [] })) } } } });
    await tileFix(); const x = await snap(pid); return { ok: !x.stale.some(z => z.k === 'g.guess') && marked(x, 2), got: { stale: x.stale, prior: x.prior } }; };
  C[94] = async () => { const pid = await tile(); await turn('۵ ÷ ۴ چند میشه؟', '۱٫۲۵.'); const x = await snap(pid); return { ok: !/اصلاح/.test(J(x.sys)) && !x.stale.length, got: { sys: x.sys } }; };
  C[95] = async () => { const pid = await tile(); await turn('۱۰ نه، ۱۲ ساعت هم کار کنم تموم نمیشه', 'سخت است.'); const x = await snap(pid); return { ok: !/اصلاح شد/.test(J(x.sys)) && !x.stale.length, got: { sys: x.sys } }; };
  C[96] = async () => { const pid = await tile({ more: ['رنگِ کاشی طوسی باشه'] }); await turn('رنگِ کاشی سفید باشه نه طوسی', 'فرستادم.', RT({ msg: 'رنگِ کاشی طوسی باشه', key: 'datum:رنگ', what: 'fact', fix: 'سفید', old: 'طوسی' }));
    const x = await snap(pid); return { ok: !x.stale.length && [1, 2, 3, 4, 5].every(n => !marked(x, n)), got: { stale: x.stale, prior: x.prior } }; };
  C[97] = async () => { const pid = await tile(); const other = await ev(() => { const r = APP.liveCreate('میزِ ناهارخوری', 'میزِ ناهارخوری ۲٫۴ متر طول دارد', 'find', { by: 'user' }); return r.p.id; });
    await tileFix(); const x = await snap(pid), y = await snap(other); return { ok: near(reOf(stN(x, 1), 3.6), 4.2) && !y.stale.length && /۲٫۴/.test(y.st), got: { y: y.stale, st: y.st } }; };
  C[98] = async () => { const pid = await tile(); await tileFix(); await turn('آره، همون ۴٫۲ درسته', 'باشه.'); const x = await snap(pid);
    return { ok: [2, 3, 4].every(n => marked(x, n)) && near(reOf(stN(x, 2), 3), 3.5) && near(reOf(stN(x, 4), 4.32), 5.04), got: { prior: x.prior } }; };
  C[99] = async () => { const pid = await tile({ more: ['۶ تا از کاشی‌ها خراب بود'] }); await turn('۵ تا خراب بود نه ۶ تا، ولی مهم نیست', 'فرستادم.', RT({ msg: '۶ تا از کاشی‌ها خراب بود', key: 'datum:خراب', what: 'fact', fix: '۵ تا', old: '۶ تا' }));
    const x = await snap(pid); return { ok: [1, 2, 3, 4, 5].every(n => !marked(x, n)) && !x.stale.some(z => !/^msg:/.test(z.k)), got: { stale: x.stale, prior: x.prior } }; };

  for (const e of Q2) { const n = e.idx, tag = '#' + n + ' [' + e.kind + '/' + e.role + '] ' + String(e.text).slice(0, 70);
    if (process.env.ONLY && !process.env.ONLY.split(',').includes(String(n))) continue;
    if (NC[n]) { out.summary.nc++; out.nc[n] = NC[n]; continue; }
    if (!C[n]) { out.summary.nc++; out.nc[n] = 'no check written'; out.fail.push(tag + ' — no check'); out.summary.fail++; continue; }
    let r; try { r = await C[n](); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; }
    if (r.ok) out.summary.pass++; else { out.summary.fail++; out.fail.push(tag + ' got ' + J(r.got).slice(0, +process.env.GOTN || 1500)); } }
  /* C74 (روشن‌سازیِ پس از بانک؛ ورودیِ بانک نیست): فرضی که در همان پیام واقعیت شد اصلاح است؛ بدلِ منفی: فرضِ تنها (C46) هیچ چیز را عوض نمی‌کند */
  if (!process.env.ONLY || process.env.ONLY.split(',').includes('C74')) {
    const H74 = (text) => ev(async () => 0).then(() => scen({ prior: [RES('ما ۴ نفریم و ۸ میلیون داریم: ۸ ÷ ۴ = ۲ میلیون هر نفر')], stmtChat: 'ما ۴ نفریم و ۸ میلیون داریم' }))
      .then(() => turn(text, 'فرستادم.', RT({ msg: 'ما ۴ نفریم و ۸ میلیون داریم', key: 'datum:نفرها', what: 'fact', fix: '۵ نفر', old: '۴' }))).then(() => snap(''));
    const a = await H74('اگه ۵ نفر بودیم سهم چقدر میشد؟ آهان، اصلاً ۵ نفر بودیم، مادرم هم وارثه.'), b = await H74('اگه ۵ نفر بودیم سهم چقدر میشد؟');
    const ok = !a.refused && /2>1\.6(?![\d])/.test(a.sstale) && !!b.refused && !b.sstale;
    out.extra = { C74: ok }; if (!ok) out.fail.push('C74 got ' + J({ a: { sstale: a.sstale, refused: a.refused, sys: a.sys }, b: { sstale: b.sstale, refused: b.refused } }).slice(0, 1500)); }
  return out;
}
module.exports = { run };
