// تورِ ۱ ِ پولیا — رفع‌های F3 (۲۰۲۶-۱۰-۱۵): کارنامهٔ ذهن و کارخانه، از کنترل‌های واقعیِ صفحه.
//  ۱) «🧩 چهار مرحلهٔ حل» در «🧠 کارنامهٔ ذهن»: بی‌داده ½ و ¼ (نمی‌دانیم)؛ پاسخ‌های «❔ پرسشِ همین لحظه» با خودداوری، درستیِ بار اولِ گام در شبیه‌ساز،
//     کارتِ فهم، گامِ واقعیِ مسئلهٔ زنده و بازنگری ⇒ (k+1)/(n+2) برای هر مرحله و احتمالِ ضعیف‌ترین بودن؛ A.MIND.phases() برای تور/دستیار.
//  ۲) خطِ زمانی: «🌱 گامِ کوچکِ انجام‌شده» و «کنار گذاشتن و بازگشت».
//  ۳) کارخانه (s32): تصدیقی که راهش «استقراء» است و با پیامدِ تأییدشده بیش‌اطمینان است ⇒ نخستین نقطهٔ خطا «راه استقراء»، نه «راه عقل و برهان».
//  ۴) کاربرگِ «راه استقراء»: «علت یا هم‌بستگی؟» ⇒ hidden_ctrl ِ همان تصدیق (r_istiqra_hidden) — فقط خانهٔ خالی.
//  ۵) پیوستِ CSV ⇒ نمودارِ خطیِ ستون‌های عددی، بی روند/برازش.
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
  await p.addInitScript(() => {
    window.__files = [];
    window.LLA_HOST = {
      load: () => Promise.resolve([]), saveMany: () => Promise.resolve({ ok: true }), del: () => Promise.resolve({ ok: true }),
      ai: () => Promise.resolve('[]'), mirror: () => Promise.resolve({ ok: true }), mirrorList: () => Promise.resolve({ connected: true, items: [] }),
      files: (rid) => Promise.resolve(window.__files.filter(f => f.rid === rid)),
      upload: (rid, file) => { const f = { id: window.__files.length + 1, rid, name: file.name, mime: file.type, size: file.size, link: '#f' }; window.__files.push(f); return Promise.resolve(f); },
      delFile: () => Promise.resolve({ ok: true }),
    };
  });
  await p.goto(FILE); await p.evaluate(() => APP.boot()); await p.waitForSelector('.nav'); await W(400);
  await p.evaluate(() => { APP.S.loaded = true; });
  const chk = (c, m) => { if (!c) errors.push(m); };
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await W(250); };
  const phRows = () => p.evaluate(() => [...document.querySelectorAll('main .mind-phases tr[data-ph]')].map(tr => ({ ph: tr.dataset.ph, p: tr.querySelector('.mind-php').textContent, w: tr.querySelector('.mind-phw').textContent, t: tr.textContent })));

  // ---------- ۱) بی‌داده: هر چهار ½ و ¼ ----------
  await go('mind');
  chk(await p.locator('main .mind-phases').count() === 1, 'mind card has the «چهار مرحلهٔ حل» section');
  let R = await phRows(); info.empty = R;
  // تورِ پولیا (RM1c، جایگزینِ «½ و ¼» ِ پیشین): مرحلهٔ بی‌داده «هنوز داده‌ای نیست» است و رتبه نمی‌گیرد
  chk(R.length === 4 && R.every(r => /هنوز داده‌ای نیست/.test(r.p) && !/٪/.test(r.w)), 'no data ⇒ every phase «هنوز داده‌ای نیست», none ranked: ' + JSON.stringify(R));
  chk(await p.locator('main .mind-phases[dir=rtl]').count() === 1, 'phases section is RTL');

  // ---------- ۱) با داده: پرسشِ همین لحظه (UI ِ مسئلهٔ زنده) ----------
  // مسئلهٔ زنده از فرمِ خودش؛ پاسخِ پرسشِ طرح + «این پرسش راهی باز کرد؟» = نه
  const pid = await p.evaluate(() => { const r = APP.liveAll && APP.liveAll()[0]; return r ? r.p.id : null; });
  info.liveBefore = pid;
  const live = await p.evaluate(() => {
    // همان سازندهٔ صفحه (دستیار هم همین را می‌زند): live_new
    const AS = APP.ASSIST; const s = { id: 'achat_t1', type: 'achat', title: 't', msgs: [] }; APP.S.put(s); AS._turnSession = s;
    const err = AS.DO.live_new ? AS.DO.live_new({ title: 'خرید یا اجاره', statement: 'خانه بخرم یا اجاره کنم؟' }) : 'no live_new';
    const r = APP.liveAll().filter(x => x.p.title === 'خرید یا اجاره')[0]; return { err, id: r && r.p.id };
  });
  info.live = live;
  if (live.id) {
    // کارتِ فهم را دور می‌زنیم؛ فقط یک پاسخِ پرسشِ طرح از خودِ کارت (UI)
    await p.evaluate((id) => { const pg = APP.S.get('eprog_' + id) || { id: 'eprog_' + id, type: 'eprog', lv: {} }; pg.solve = pg.solve || {}; pg.solve.u = { 1: { u: 'تصمیمِ خرید یا اجاره', d: 'قیمت · اجاره', c: 'بودجه', self: 1, at: new Date().toISOString(), done: true, from: 'live', dl: [] } }; APP.S.put(pg); }, live.id);
    await go('lprob', live.id, 'plan');
    const hasAsk = await p.locator('main .lp-ask textarea, main .lp-ask input').count();
    if (hasAsk) {
      await p.locator('main .lp-ask textarea, main .lp-ask input').first().fill('اجاره‌بها را با قسطِ وام مقایسه کنم'); await W(150);
      await p.locator('main .lp-askgo').click(); await W(300);
      const g = p.locator('main .lp-ask button', { hasText: /^نه|^۰/ });
      if (await g.count()) { await g.first().click(); await W(300); }
    }
    info.liveTut = await p.evaluate((id) => JSON.parse(JSON.stringify(((APP.S.get('eprog_' + id) || {}).tut || {}).plan || [])), live.id);
    chk(info.liveTut.some(e => e.src === 'live' && e.self === 0), 'live ask card stored the answer with self-judged helpfulness 0 via the UI: ' + JSON.stringify(info.liveTut));
  } else errors.push('live_new did not create a live problem: ' + JSON.stringify(live));

  // دادهٔ بیشتر همان شکلِ رکوردهای صفحه (شبیه‌ساز/بازنگری) — شکلِ ثبت‌شدهٔ a36/a8
  await p.evaluate(() => {
    const S = APP.S, P = APP.probs ? APP.probs().filter(x => (x.stages || []).length >= 3)[0] : null;
    window.__simPid = P && P.id;
    if (P) {
      const pg = S.get('eprog_' + P.id) || { id: 'eprog_' + P.id, type: 'eprog', lv: {} };
      pg.lv = pg.lv || {}; pg.lv[1] = {};
      P.stages.forEach((s0, i) => { pg.lv[1][s0.id] = { first: i % 2 === 0, at: new Date().toISOString() }; });
      pg.tut = pg.tut || {}; pg.tut.back = [{ at: new Date().toISOString(), q: 'نتیجه را وارسی می‌کنی؟', text: 'با حالتِ خاص', self: 2, src: 'sim' }];
      pg.solve = pg.solve || {}; pg.solve.b = { 1: { done: true, chkRes: 'نتیجه سالم ماند', at: new Date().toISOString() }, 2: { skipped: true, at: new Date().toISOString() } };
      S.put(pg);
    }
  });
  const Q = await p.evaluate(() => JSON.parse(JSON.stringify(APP.MIND.phases())));
  info.Q = { n: Q.n, rows: Q.rows.map(r => [r.id, r.k, r.n, +r.p.toFixed(3), +r.pWeak.toFixed(3), Object.keys(r.src)]) };
  const byId = {}; Q.rows.forEach(r => { byId[r.id] = r; });
  chk(Q.rows.every(r => Math.abs(r.p - (r.k + 1) / (r.n + 2)) < 1e-9), 'every phase = (k+1)/(n+2): ' + JSON.stringify(info.Q));
  chk(Math.abs(Q.rows.reduce((a, r) => a + r.pWeak, 0) - 1) < 1e-6, 'P(weakest) sums to 1 over the four phases');
  chk(byId.back.src.ask && byId.back.src.ask.k === 1 && byId.back.src.lb && byId.back.src.lb.n === 2 && byId.back.src.lb.k === 1, 'look-back: helpful answer + one checked and one skipped look-back: ' + JSON.stringify(byId.back));
  chk(byId.und.src.ucard && byId.und.src.ucard.n >= 1 && byId.und.src.ucard.k === 0, 'understanding card self 1 ⇒ one non-success: ' + JSON.stringify(byId.und));
  chk(byId.plan.src.ask && byId.plan.src.ask.n >= 1 && byId.plan.src.ask.k === 0, 'live plan answer judged «not helpful» counts against plan: ' + JSON.stringify(byId.plan));
  chk(await p.evaluate(() => (APP.state.view === 'mind' || true) && /چهار مرحلهٔ حل/.test(APP.MIND.phasesText())), 'phasesText for the tour/assistant');
  const simN = Object.values(byId).reduce((a, r) => a + ((r.src.sim || {}).n || 0), 0), stN = await p.evaluate(() => { const P = APP.getProb(window.__simPid); return P ? P.stages.length : 0; });
  chk(stN && simN === stN, 'every simulator first-attempt step counted under its stage phase: ' + simN + ' / ' + stN);
  await go('mind'); R = await phRows(); info.rows = R;
  chk(R.length === 4 && R.some(r => !/\(۰\)/.test(r.p)), 'table shows the honest n per phase: ' + JSON.stringify(R));
  // پرامپتِ دستیار وقتی کارنامه باز است
  info.hook = await p.evaluate(() => (APP.ASSIST.promptHooks || []).map(f => { try { return f({}, '') || ''; } catch (e) { return ''; } }).join('\n').match(/چهار مرحلهٔ حل[^\n]*/));
  chk(info.hook && info.hook[0], 'assistant prompt hook (mind view) includes the four phases');

  // ---------- ۲) خطِ زمانی: گامِ کوچک و کنار گذاشتن/بازگشت ----------
  await p.evaluate(() => {
    const S = APP.S, pid = window.__simPid, pg = S.get('eprog_' + pid);
    pg.solve.will = { steps: [{ id: 'ws0', at: '2026-10-10T08:00:00Z', step: 'فقط صورت را دوباره بنویسم', checks: [{ at: '2026-10-11T08:00:00Z', done: 'yes' }], closed: true }],
      log: [{ at: '2026-10-12T08:00:00Z', kind: 'commit', desire: 'drop' }, { at: '2026-10-14T08:00:00Z', kind: 'drop-recheck', keep: 'back' }] };
    S.put(pg);
  });
  await go('home'); await go('mind');
  const ev = await p.evaluate(() => APP.MIND.model().events.map(e => e.fa));
  info.ev = ev.filter(x => /🌱|کنار/.test(x));
  chk(ev.some(x => /^🌱 گامِ کوچکِ انجام‌شده/.test(x)), 'timeline: «🌱 گامِ کوچکِ انجام‌شده»: ' + JSON.stringify(info.ev));
  chk(ev.some(x => /^⏸ کنار گذاشتن/.test(x)) && ev.some(x => /^↩ بازگشت پس از کنار گذاشتن/.test(x)), 'timeline: set aside and come back: ' + JSON.stringify(info.ev));
  await p.locator('main details summary', { hasText: 'خطِ زمانی' }).click(); await W(150);
  chk(await p.locator('main details li', { hasText: 'گامِ کوچکِ انجام‌شده' }).count() >= 1, 'timeline item visible in the card');

  // ---------- ۳ و ۴) کارخانه: مسیرِ s32 با کنترل‌های واقعی ----------
  const U = {};
  U.newCase = async (title, input) => { await go('e_home'); await p.fill('#ncT', title); await p.fill('#ncI', input);
    await p.locator('main button.btn.mt', { hasText: 'ورود به کارخانه' }).click(); await W(350); return p.evaluate(() => APP.state.arg); };
  U.st = async (cid, st) => { await go('e_case', cid, st); };
  U.rows = async (k, n) => { for (let i = 0; i < 20; i++) { const c = await p.locator(`main [data-k="${k}"] tbody tr`).count(); if (c >= n) return; await p.locator(`main [data-k="${k}"] button`, { hasText: '+ ردیف' }).click(); await W(120); } };
  U.cell = (k, i, sel) => p.locator(`main [data-k="${k}"] tbody tr`).nth(i).locator(sel);
  U.sel = async (k, v) => { await p.locator(`main [data-k="${k}"] select`).first().selectOption(v); await W(250); };
  U.type = async (k, v) => { const el = p.locator(`main [data-k="${k}"] input`).first(); await el.fill(''); if (v !== '') await el.type(v); await W(450); };
  U.engine = async (cid) => { await U.st(cid, 'st_tasdiq'); await p.locator('main button', { hasText: 'داوری قطعی (خودکار)' }).first().click(); await W(500);
    return p.evaluate(() => ({ verdict: (document.querySelector('main .verdict') || {}).textContent || '', engs: [...document.querySelectorAll('main .eng')].map(e => e.textContent), notes: (document.querySelector('main .feat-prefill-notes') || {}).textContent || '' })); };
  const cid = await U.newCase('آیا تبلیغِ آبان علتِ رشدِ فروش بود؟', 'فروش بعد از کمپین ۳۰٪ بالا رفت، پس تبلیغ جواب داده.');
  await U.st(cid, 'st_tasdiq'); await U.rows('claims', 1); await U.cell('claims', 0, 'textarea').first().fill('کمپین آبان علت بخشی از رشد فروش آبان بود'); await W(450);
  await U.st(cid, 'st_route'); await U.rows('ways', 1); await U.cell('ways', 0, 'select').nth(0).selectOption('1'); await U.cell('ways', 0, 'select').nth(1).selectOption('استقراء'); await W(450);
  await U.st(cid, 'st_aql'); await U.sel('form', 'استقرائی (از جزئی به کلی)'); await U.type('conseq_n', '۱'); await U.sel('conseq_new', 'تازه (پیش از پیش‌بینی دانسته نبود)');
  await U.st(cid, 'st_final'); await U.rows('final', 1); await U.cell('final', 0, 'select').nth(0).selectOption('1'); { const inp = U.cell('final', 0, 'input').first(); await inp.fill(''); await inp.type('۷۵'); } await W(450);
  let e = await U.engine(cid); info.f3a = e.verdict.slice(0, 200);
  chk(/نخستین نقطه خطا: راه استقراء/.test(e.verdict) && !/نخستین نقطه خطا: راه عقل/.test(e.verdict), 's32: induction-route claim ⇒ first error point «راه استقراء»: ' + e.verdict.slice(0, 160));
  chk(e.engs.some(x => /سقف اعتبار موجه: ۶۶٫۷٪/.test(x)), 'cap unchanged: T_plausible (1+1)/(1+2) = 66.7: ' + JSON.stringify(e.engs).slice(0, 300));
  const r1 = await p.evaluate(i => { const k = APP.caseClaims(APP.S.get(i))[0]; return EPIX.runClaim(k, APP.btCfg()); }, cid);
  chk(r1.bind === 'r_aql_conseq' && r1.flags.some(fl => fl.st === 'st_istiqra' && fl.rules[0] === 'r_aql_conseq') && !r1.flags.some(fl => fl.st === 'st_aql'), 'same rule binds; only its locus follows the claim\'s route: ' + JSON.stringify(r1.flags));
  // «علت یا هم‌بستگی؟»
  await U.st(cid, 'st_istiqra');
  chk(await p.locator('main [data-k="rivals"] textarea').count() === 1 && await p.locator('main [data-k="cause"] select').count() === 1, 'st_istiqra worksheet has «علت یا هم‌بستگی؟» fields');
  await p.locator('main [data-k="rivals"] textarea').first().fill('فصل: آبان پارسال هم بی‌تبلیغ ۲۵٪ رشد داشت'); await W(300);
  await U.sel('cause', 'کنار نرفت — فقط هم‌زمانی یا مقایسهٔ قبل/بعد؛ عاملِ پنهان، فصل یا گزینشِ نمونه هنوز باز است');
  e = await U.engine(cid);
  const f1 = await p.evaluate(i => JSON.parse(JSON.stringify((APP.S.get(i).feat || {})[1] || {})), cid);
  const r2 = await p.evaluate(i => { const k = APP.caseClaims(APP.S.get(i))[0]; return EPIX.runClaim(k, APP.btCfg()); }, cid);
  info.f4 = { f: f1, fired: r2.fired, ceil: r2.ceil, first: e.verdict.slice(0, 80) };
  chk(f1.hidden_ctrl === false && r2.fired.indexOf('r_istiqra_hidden') >= 0, '«کنار نرفت» ⇒ hidden_ctrl=false ⇒ r_istiqra_hidden fires: ' + JSON.stringify(info.f4));
  chk(/نخستین نقطه خطا: راه استقراء/.test(e.verdict), 'first error point stays «راه استقراء»: ' + e.verdict.slice(0, 120));
  await U.st(cid, 'st_istiqra'); await U.sel('cause', 'کنار رفت — گروهِ مقایسه در همان شرایط (همان زمان/فصل، نمونهٔ بی‌گزینش) عاملِ پنهان را کنترل کرد');
  await U.engine(cid);
  chk(await p.evaluate(i => (APP.S.get(i).feat || {})[1].hidden_ctrl, cid) === true, '«کنار رفت» ⇒ hidden_ctrl follows the worksheet (true)');

  // ---------- ۵) CSV ⇒ نمودار ----------
  const csv = 'ماه,فروش,هزینهٔ تبلیغ\nمهر,۵۰۰,0\nآبان,۶۵۰,0\nآذر,۵۲۰,0\nمهر,۵۱۰,0\nآبان,۶۷۰,120\nآذر,۵۳۰,0\n';
  await go('e_case', cid);
  chk(await p.locator('main section.attach').count() === 1, 'case page has the attachments box');
  await p.setInputFiles('main section.attach input[type=file]:not(.csv-in)', { name: 'sales.csv', mimeType: 'text/csv', buffer: Buffer.from(csv, 'utf8') });
  await W(600);
  const plot = await p.evaluate(() => { const b = document.querySelector('main .csv-plot'); return b && { lines: b.querySelectorAll('polyline').length, cols: [...b.querySelectorAll('polyline')].map(x => x.getAttribute('data-col')), note: (b.querySelector('.csv-note') || {}).textContent || '' }; });
  info.plot = plot;
  chk(plot && plot.lines === 2 && plot.cols.join('|') === 'فروش|هزینهٔ تبلیغ' && /محورِ افقی: «ماه»/.test(plot.note) && /هیچ روند/.test(plot.note), 'uploaded CSV ⇒ two numeric series, label column on x, honest note: ' + JSON.stringify(plot));
  chk(await p.evaluate(() => window.__files.some(f => f.name === 'sales.csv')), 'the CSV is still uploaded as an attachment');
  const bad = await p.evaluate(() => !!APP.MIND.csvChart('a,b\nx,y\nz,w'));
  chk(!bad, 'no numeric column ⇒ no chart');

  console.log(JSON.stringify(info, null, 1).slice(0, 4000));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  if (errors.length) process.exitCode = 1;
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
