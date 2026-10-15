// مسیرِ واقعیِ کاربر در کارخانه ⇒ «داوری قطعی» (ممیزیِ ۲۰۲۶-۱۰-۱۵، یافته‌های B1–B7). همه از کنترل‌های واقعیِ صفحه:
// پرونده از فرمِ خانه، کاربرگ‌ها با همان select/input ها (رقمِ فارسی تایپ می‌شود)، و «داوری قطعی (خودکار)» — هیچ ویژگی‌ای مستقیم تزریق نمی‌شود.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
const W = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  await p.goto(FILE); await p.waitForSelector('.nav');
  await p.evaluate(() => { APP.S.loaded = true; });
  const fa = s => String(s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]).replace(/\./g, '٫');
  // ---------- کمک‌های UI ----------
  const U = {};
  U.newCase = async (title, input) => { await p.evaluate(() => APP.go('e_home')); await W(250);
    await p.fill('#ncT', title); await p.fill('#ncI', input);
    await p.locator('main button.btn.mt', { hasText: 'ورود به کارخانه' }).click(); await W(350);
    return p.evaluate(() => APP.state.arg); };
  U.st = async (cid, st) => { await p.evaluate(([i, s]) => APP.go('e_case', i, s), [cid, st]); await W(300); };
  U.rows = async (k, n) => { for (let i = 0; i < 20; i++) { const c = await p.locator(`main [data-k="${k}"] tbody tr`).count(); if (c >= n) return; await p.locator(`main [data-k="${k}"] button`, { hasText: '+ ردیف' }).click(); await W(120); } };
  U.cell = (k, i, sel) => p.locator(`main [data-k="${k}"] tbody tr`).nth(i).locator(sel);
  U.claims = async (cid, txts) => { await U.st(cid, 'st_tasdiq'); await U.rows('claims', txts.length);
    for (let i = 0; i < txts.length; i++) await U.cell('claims', i, 'textarea').first().fill(txts[i]); await W(450); };
  U.route = async (cid, ways) => { await U.st(cid, 'st_route'); await U.rows('ways', ways.length);
    for (let i = 0; i < ways.length; i++) { await U.cell('ways', i, 'select').nth(0).selectOption(String(ways[i][0])); await U.cell('ways', i, 'select').nth(1).selectOption(ways[i][1]); } await W(450); };
  U.sel = async (k, v) => { await p.locator(`main [data-k="${k}"] select`).first().selectOption(v); await W(250); };
  U.type = async (k, v) => { const el = p.locator(`main [data-k="${k}"] input`).first(); await el.fill(''); if (v !== '') await el.type(v); await W(450); };
  U.final = async (cid, rows) => { await U.st(cid, 'st_final'); await U.rows('final', rows.length);
    for (let i = 0; i < rows.length; i++) { await U.cell('final', i, 'select').nth(0).selectOption(String(rows[i][0])); const inp = U.cell('final', i, 'input').first(); await inp.fill(''); await inp.type(String(rows[i][1])); } await W(450); };
  U.engine = async (cid) => { await U.st(cid, 'st_tasdiq'); await p.locator('main button', { hasText: 'داوری قطعی (خودکار)' }).first().click(); await W(500); return U.read(); };
  U.read = () => p.evaluate(() => ({ prefill: (document.querySelector('main .feat-prefill') || {}).textContent || '', notes: (document.querySelector('main .feat-prefill-notes') || {}).textContent || '',
    verdict: (document.querySelector('main .verdict') || {}).textContent || '', engs: [...document.querySelectorAll('main .eng')].map(e => e.textContent) }));
  U.feat = cid => p.evaluate(i => JSON.parse(JSON.stringify(APP.S.get(i).feat || {})), cid);
  U.data = (cid, st) => p.evaluate(([i, s]) => JSON.parse(JSON.stringify((APP.S.get(i).st[s] || {}).data || {})), [cid, st]);
  const FLD = await p.evaluate(() => EPI_FM.x_field.v), REL = await p.evaluate(() => EPI_FM.x_relay.v);
  async function expert(tag, field, relay, conf, extra) {
    const cid = await U.newCase('یافتهٔ ' + tag, 'در مقاله‌ای خواندم که مهلتِ نزدیک باعث می‌شود مردم زودتر پس‌انداز کنند.');
    await U.claims(cid, ['تعیینِ مهلتِ نزدیک پس‌اندازِ ماهانه را بیشتر می‌کند']);
    await U.route(cid, [[1, 'تخصص دیگران']]);
    await U.st(cid, 'st_expert'); await U.sel('field', field); await U.sel('relay', relay);
    await U.sel('xmethod', 'معتبر'); await U.sel('xcomp', 'احراز شده'); await U.sel('xchain', 'تک‌منبع');
    if (extra) for (const [k, v] of extra) await U.sel(k, v);
    await U.final(cid, [[1, conf]]);
    return cid;
  }

  // ---------- B1: سقفِ جمعیتِ پژوهش روی پروندهٔ واقعی (x_method/x_comp/chain از کاربرگِ «استناد به تخصص») ----------
  // p_found_mixture (۲۰۲۶-۱۰-۱۵): نرخِ جمعیت فقط با عضویتِ احرازشده (همان راهِ رسیدن + «عیناً همان یافته»)؛ وگرنه آمیزه ½ + ½(p − ½)
  const SAME = [['xsame', 'عیناً همان یافتهٔ منتشرشده است']];
  let cid = await expert('اقتصاد', FLD[0], REL[0], '۸۰', SAME);
  let e = await U.engine(cid), f = await U.feat(cid);
  info.b1 = { prefill: e.prefill.slice(0, 400), eng: e.engs[0], f: f[1] };
  chk(f[1].x_method === 'معتبر' && f[1].x_comp === 'احراز شده' && f[1].chain === 'تک‌منبع' && f[1].x_field === FLD[0] && f[1].x_relay === REL[0] && f[1].conf === 80,
    'B1: st_expert worksheet must prefill x_method/x_comp/chain/x_field/x_relay and the Persian «۸۰» conf: ' + JSON.stringify(f[1]));
  chk(/سقف اعتبار موجه: ۶۰٪/.test(e.engs[0]) && /AER\/QJE/.test(e.engs[0]) && /بیش‌اطمینانی \(۲۰ واحد/.test(e.engs[0]), 'B1: econ direct reading ⇒ ceiling 60 (r_expert_pop_econ), conf 80 flagged: ' + e.engs[0]);
  info.b1r = await p.evaluate(i => { const k = APP.caseClaims(APP.S.get(i))[0]; return EPIX.runClaim(k, APP.btCfg()); }, cid);
  chk(info.b1r.bind === 'r_expert_pop_econ' && (info.b1r.yielded || []).some(y => y.rule === 'r_naql_ahad'), 'B1: binding r_expert_pop_econ and the finding\'s own single-source cap yields: ' + JSON.stringify(info.b1r));
  // روان‌شناسی ⇒ ۳۶٫۴ (نه ۳۶)
  cid = await expert('روان', FLD[1], REL[0], '۴۰', SAME); e = await U.engine(cid);
  chk(/سقف اعتبار موجه: ۳۶٫۴٪/.test(e.engs[0]), 'B1/B6: psych population ⇒ «۳۶٫۴٪»: ' + e.engs[0]);
  cid = await expert('روان-نامعلوم', FLD[1], REL[0], '۴۰'); e = await U.engine(cid);
  chk(/سقف اعتبار موجه: ۴۳٫۲٪/.test(e.engs[0]) && !/بیش‌اطمینانی/.test(e.engs[0]), 'membership not stated ⇒ T_support ½ + ½(36.4 − ½) = 43.2 (the unestablished link pulls toward ½): ' + e.engs[0]);

  // ---------- B5: حلقهٔ دیگر (مقدمهٔ اثبات‌نشدهٔ دستی، «فراتر از یافته») ½ را نگه می‌دارد ----------
  cid = await expert('اجتماعی', FLD[2], REL[0], '۶۰');
  e = await U.engine(cid);
  await p.locator('#fe_c1_matter').selectOption('مقدمه اثبات‌نشده'); await W(150);
  await p.locator('#fe_c1_qarina').selectOption('بی‌قرینه'); await W(700);
  e = await U.read();
  info.b5a = e.engs[0];
  chk(/سقف اعتبار موجه: ۶۰٫۹٪/.test(e.engs[0]), 'B5: membership not stated ⇒ sup of both states (unwritten feature convention, RR2): max(60.9, mixture) = 60.9 — the hand-set unproven premise (¾) does not bind: ' + e.engs[0]);
  await U.st(cid, 'st_expert'); await U.sel('xsame', 'عیناً همان یافتهٔ منتشرشده است');
  e = await U.engine(cid); info.b5b = e.engs[0];
  chk(/سقف اعتبار موجه: ۶۰٫۹٪/.test(e.engs[0]), 'B5/B6: claim = the finding itself ⇒ the frame\'s own unproven premise yields to the measured 60.9 (shown «۶۰٫۹», not «۶۱»): ' + e.engs[0]);
  await U.st(cid, 'st_expert'); await U.sel('xsame', 'فراتر از یافته است — آن را به خودم یا موردِ دیگری سرایت داده‌ام، یا مقدمهٔ دیگری لازم دارد');
  e = await U.engine(cid); info.b5c = e.engs[0];
  chk(/سقف اعتبار موجه: ۵۵[٫.][۴۵]٪/.test(e.engs[0]), 'B5: a claim that extends the finding to me: the extra link is a route condition ⇒ T_support ≈ 55.5: ' + e.engs[0]);
  // «فراتر» بی مقدمهٔ دستی ⇒ همان حلقه «مقدمه اثبات‌نشده» پیش‌پر می‌شود ⇒ ½
  cid = await expert('اقتصاد-فراتر', FLD[0], REL[0], '۵۵', [['xsame', 'فراتر از یافته است — آن را به خودم یا موردِ دیگری سرایت داده‌ام، یا مقدمهٔ دیگری لازم دارد']]);
  e = await U.engine(cid); f = await U.feat(cid);
  chk(f[1].matter === 'مقدمه اثبات‌نشده' && /سقف اعتبار موجه: ۵۵٪/.test(e.engs[0]), 'B5: «فراتر از یافته» ⇒ matter prefilled; cap T_support ½ + ½(60 − ½) = 55: ' + JSON.stringify(f[1]) + ' ' + e.engs[0]);

  // ---------- B6: سقف/فاصلهٔ ۶۰٫۹ با اطمینانِ ۶۱ ----------
  cid = await expert('اجتماعی-۶۱', FLD[2], REL[0], '۶۱', [['xsame', 'عیناً همان یافتهٔ منتشرشده است']]);
  e = await U.engine(cid);
  chk(/سقف اعتبار موجه: ۶۰٫۹٪/.test(e.engs[0]) && /بیش‌اطمینانی \(۰٫۱ واحد/.test(e.engs[0]) && !/\(۰ واحد/.test(e.engs[0]), 'B6: 61 over 60.9 shows «۰٫۱ واحد», never «۰ واحد»: ' + e.engs[0]);

  // ---------- B2: صورتِ مغالطه‌آمیز / قیاسِ معتبر و مادهٔ استدلال از جدولِ مقدمات ----------
  cid = await U.newCase('مغالطه', 'همهٔ موفق‌ها زود بیدار می‌شوند؛ من زود بیدار می‌شوم؛ پس موفق می‌شوم.');
  await U.claims(cid, ['من موفق می‌شوم']); await U.route(cid, [[1, 'عقل']]);
  await U.st(cid, 'st_aql'); await U.sel('form', 'مغالطه‌آمیز / نتیجه لازم نمی‌آید'); await U.final(cid, [[1, '۹۰']]);
  e = await U.engine(cid); f = await U.feat(cid);
  chk(f[1].form === 'نامعتبر' && /سقف اعتبار موجه: ۵۰٪/.test(e.engs[0]) && /صورت استدلال نامعتبر/.test(e.engs[0]), 'B2: fallacious form ⇒ «نامعتبر» ⇒ r_aql_invalid_form: ' + JSON.stringify(f[1]) + ' ' + e.engs[0]);
  cid = await U.newCase('قیاس', 'هر انسانی فانی است؛ سقراط انسان است؛ پس سقراط فانی است.');
  await U.claims(cid, ['سقراط فانی است']); await U.route(cid, [[1, 'عقل']]);
  await U.st(cid, 'st_aql'); await U.sel('form', 'قیاس معتبر — نتیجه ضرورتاً لازم می‌آید');
  await U.rows('prem', 2); await U.cell('prem', 0, 'select').first().selectOption('نظریِ منتهی به بدیهی (زنجیره روشن)'); await U.cell('prem', 1, 'select').first().selectOption('نامعلوم'); await W(400);
  await U.final(cid, [[1, '۹۹']]);
  e = await U.engine(cid); f = await U.feat(cid);
  chk(f[1].form === 'معتبر (قیاسی)' && f[1].matter === 'مقدمه اثبات‌نشده' && /سقف اعتبار موجه: ۷۵٪/.test(e.engs[0]), 'B2: valid deductive form + an «نامعلوم» premise ⇒ matter «مقدمه اثبات‌نشده» ⇒ ¾ (T_support): ' + JSON.stringify(f[1]) + ' ' + e.engs[0]);
  await U.st(cid, 'st_aql'); await U.cell('prem', 1, 'select').first().selectOption('بدیهی اولی'); await W(400);
  e = await U.engine(cid); f = await U.feat(cid);
  chk(f[1].matter === 'منتهی به بدیهی' && /سقف اعتبار موجه: ۱۰۰٪/.test(e.engs[0]), 'B2/B3: premises corrected to self-evident ⇒ the PREFILLED matter follows the worksheet: ' + JSON.stringify(f[1]));

  // ---------- B4: یک کاربرگِ عقل، دو تصدیقِ عقلی ----------
  cid = await U.newCase('دو تصدیقِ عقلی', 'فرضیه: چای سبز خواب را بهتر می‌کند. و: هر انسانی فانی است پس سقراط فانی است.');
  await U.claims(cid, ['چای سبز خوابم را بهتر می‌کند', 'سقراط فانی است']); await U.route(cid, [[1, 'عقل'], [2, 'عقل']]);
  await U.st(cid, 'st_aql'); await U.sel('form', 'استقرائی (از جزئی به کلی)'); await U.type('conseq_n', '۲');
  await U.final(cid, [[1, '۷۰'], [2, '۱۰۰']]);
  e = await U.engine(cid); f = await U.feat(cid);
  chk(f[1].form == null && f[2].form == null && f[1].x_conseq_n == null && /کدام تصدیق/.test(e.notes), 'B4: ambiguous case-level st_aql must not be stamped on both claims, and the page says why: ' + JSON.stringify(f) + ' ' + e.notes);
  await U.st(cid, 'st_aql'); await U.sel('c', '1');
  e = await U.engine(cid); f = await U.feat(cid);
  chk(f[1].form === 'غیرقیاسی (استقرا/تمثیل)' && f[1].x_conseq_n === 2 && f[2].form == null && /سقف اعتبار موجه: ۱۰۰٪/.test(e.engs[1]), 'B4: the worksheet\'s claim selector applies it to claim 1 only (the syllogism keeps 100): ' + JSON.stringify(f) + ' ' + e.engs[1]);

  // ---------- B3: پاکِ دستی دوباره پر نمی‌شود؛ کلیدِ پیش‌پر با کاربرگ جابه‌جا می‌شود ----------
  cid = await U.newCase('پیامد', 'فرضیه: کم‌خوابی سردردم را می‌آورد؛ سه پیامدِ تازه‌اش را دیدم.');
  await U.claims(cid, ['کم‌خوابی سردردم را می‌آورد']); await U.route(cid, [[1, 'استقراء']]);
  await U.st(cid, 'st_aql'); await U.sel('form', 'استقرائی (از جزئی به کلی)'); await U.type('conseq_n', '۳'); await U.sel('conseq_new', 'تازه (پیش از پیش‌بینی دانسته نبود)');
  await U.final(cid, [[1, '۹۵']]);
  e = await U.engine(cid);
  chk(/سقف اعتبار موجه: ۸۰٪/.test(e.engs[0]), 'B3 setup: 3 new consequences ⇒ 80: ' + e.engs[0]);
  await p.locator('#fe_c1_x_conseq_n').fill(''); await W(700);
  e = await U.engine(cid); f = await U.feat(cid);
  info.b3a = { f: f[1], clr: await p.evaluate(i => APP.S.get(i).featClr, cid) };
  chk(f[1].x_conseq_n == null && !/پیامدِ تأییدشده ← ۳/.test(e.prefill), 'B3a: a key the user cleared in the feature editor is NOT re-filled on reopen: ' + JSON.stringify(info.b3a) + ' ' + e.prefill);
  // دومی: کاربرگ عوض/خالی می‌شود ⇒ کلیدِ پیش‌پر دنبالش می‌رود
  cid = await U.newCase('پیامد ۲', 'فرضیه: قهوهٔ عصر بی‌خوابم می‌کند.');
  await U.claims(cid, ['قهوهٔ عصر بی‌خوابم می‌کند']); await U.route(cid, [[1, 'استقراء']]);
  await U.st(cid, 'st_aql'); await U.sel('form', 'استقرائی (از جزئی به کلی)'); await U.type('conseq_n', '۳'); await U.sel('conseq_new', 'تازه (پیش از پیش‌بینی دانسته نبود)');
  await U.final(cid, [[1, '۹۵']]); await U.engine(cid);
  await p.locator('#fe_c1_form').selectOption('غیرقیاسی (استقرا/تمثیل)'); await W(500);   // دستی (همان مقدار) ⇒ از این پس دستی است
  await U.st(cid, 'st_aql'); await U.type('conseq_n', '۵');
  e = await U.engine(cid); f = await U.feat(cid);
  chk(f[1].x_conseq_n === 5 && /۸۵٫۷٪/.test(e.engs[0]) && /کاربرگ عوض شد/.test(e.prefill), 'B3b: a prefilled key follows the worksheet (3 ⇒ 5, ceiling «۸۵٫۷٪»): ' + JSON.stringify(f[1]) + ' ' + e.engs[0]);
  await U.st(cid, 'st_aql'); await U.type('conseq_n', '');
  e = await U.engine(cid); f = await U.feat(cid);
  chk(f[1].x_conseq_n == null && /برداشته شد/.test(e.prefill) && f[1].form === 'غیرقیاسی (استقرا/تمثیل)', 'B3b: worksheet cleared ⇒ the prefilled count is removed; the hand-set form stays: ' + JSON.stringify(f[1]));
  // B6: قالبِ غیرقیاسی بی پیامد ⇒ ۹۹٫۹ (نه «۱۰۰»)
  chk(/سقف اعتبار موجه: ۹۹٫۹٪/.test(e.engs[0]) && /بیش‌اطمینانی/.test(e.engs[0]) === false, 'B6: non-deductive ceiling shows «۹۹٫۹٪», never «۱۰۰٪»: ' + e.engs[0]);
  await p.locator('#fe_c1_conf').fill(''); await p.locator('#fe_c1_conf').type('۱۰۰'); await W(700);
  e = await U.read(); f = await U.feat(cid);
  chk(f[1].conf === 100 && /بیش‌اطمینانی \(۰٫۱ واحد/.test(e.engs[0]), 'B7/B6: Persian digits in the feature editor; 100 over 99.9 ⇒ «۰٫۱ واحد»: ' + JSON.stringify(f[1]) + ' ' + e.engs[0]);

  // ---------- B7: نامتناهی، k > n، شمارِ بیش از ۱۰۰ ----------
  cid = await U.newCase('تمثیل', 'این کافه مثلِ دو کافهٔ دیگرِ همین خیابان است که شکست خوردند.');
  await U.claims(cid, ['این کافه شکست می‌خورد']); await U.route(cid, [[1, 'عقل']]);
  await U.st(cid, 'st_aql'); await U.sel('form', 'تمثیلی (از شباهت)');
  await U.type('conseq_n', '1e400');
  let d = await U.data(cid, 'st_aql'); let msg = await p.locator('main [data-k="conseq_n"] .numerr').innerText().catch(() => '');
  chk(d.conseq_n == null && /بی‌نهایت/.test(msg), 'B7: 1e400 is rejected with a message, never Infinity: ' + JSON.stringify(d) + ' ' + msg);
  await U.type('analog_n', '۲'); await U.type('analog_k', '۹');
  d = await U.data(cid, 'st_aql'); msg = await p.locator('main [data-k="analog_k"] .numerr').innerText().catch(() => '');
  chk(d.analog_n === 2 && d.analog_k == null && /بیش از n/.test(msg), 'B7: k > n is rejected with a message: ' + JSON.stringify(d) + ' ' + msg);
  await U.type('analog_k', '۲'); await U.final(cid, [[1, '۸۵']]);
  d = await U.data(cid, 'st_final');
  chk(d.final && d.final[0] && d.final[0].p === 85, 'B7: Persian digits accepted in the «حکم نهایی» percent column: ' + JSON.stringify(d.final));
  info.b7aql = await U.data(cid, 'st_aql');
  e = await U.engine(cid);
  await p.locator('#fe_c1_x_conseq_n').fill(''); await p.locator('#fe_c1_x_conseq_n').type('۱۵۰'); await W(600);
  f = await U.feat(cid);
  chk(f[1].x_conseq_n === 150, 'B7: counts in the feature editor are not clamped to 100: ' + JSON.stringify(f[1]));
  await p.locator('#fe_c1_x_analog_k').fill('۹'); await W(600);   // یک رویدادِ input (fill('') خودش «خالی به دستِ تو» است)
  f = await U.feat(cid); msg = await p.locator('#fe_c1_x_analog_k ~ .numerr').innerText().catch(() => '');
  chk(f[1].x_analog_k === 2 && /ذخیره نشد/.test(msg), 'B7: feature editor rejects k > n with a message: ' + JSON.stringify(f[1]) + ' ' + msg);

  console.log(JSON.stringify(info).slice(0, 3000));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
