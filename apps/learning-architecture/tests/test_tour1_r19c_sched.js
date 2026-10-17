// تورِ پولیا دورِ ۱۹c (۲۰۲۶-۱۰-۱۷) — «⏱ زمان‌بندِ واحد» (LT1) و «ساعتِ واحد» (LT8). دنباله‌های چندروزه با ساعتِ Playwright
// (page.clock: install ⇒ setSystemTime ⇒ reload) و با ساعتِ آزمایشیِ درون‌صفحه (?dev=1&clock=… / APP.clock.advance).
// هر بند شمارهٔ موردِ بانکِ مستقلِ VARIANTS_R19c (LT1.sched #0–19، LT8.clock #125–141) را دارد. پروندهٔ تمرینِ واقعی (a41) کارِ سازندهٔ
// دیگری است؛ این‌جا همان قراردادِ A.SCHED.planSource با رکوردی به شکلِ قرارداد («tprac») آزموده می‌شود.
const { chromium } = require('playwright');
const path = require('path');
const { until } = require('./page_sync');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
const D0 = '2026-10-17';
const at = (d, hm = '10:00') => new Date(d + 'T' + hm + ':00+03:30');
const add = (d, n) => { const x = new Date(d + 'T12:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
(async () => {
  const b = await chromium.launch(); const errors = []; const bank = {};
  const ok = (id, cond, why) => { const prev = bank[id]; bank[id] = { ok: (prev ? prev.ok : true) && !!cond, why: (prev && !prev.ok ? prev.why + ' | ' : '') + (cond ? '' : why) }; if (!cond) errors.push('#' + id + ' ' + why); };
  async function open(o = {}) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: o.tz || 'Asia/Tehran' });
    const p = await ctx.newPage();
    await p.clock.install({ time: o.time || at(D0) });
    p.on('pageerror', e => errors.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    await p.goto(FILE + (o.qs || '')); await p.waitForSelector('.nav'); await p.waitForTimeout(150);
    // کارت‌های نمونهٔ آغازین (seed) از صف بیرون: هر بند فقط کارت‌های خودش را می‌شمارد
    await p.evaluate(() => { APP.S.all('card', c => c.sample).forEach(c => APP.S.del(c.id)); try { localStorage.removeItem('lla.schedSent'); } catch (e) { } });
    await p.evaluate(() => { APP.SCHED.captureRemind(); window.__regT = () => APP.SCHED.planSource({ kind: 'tprac', label: 'پروندهٔ تمرینِ آزمونی', types: ['tprac'], records: () => APP.S.all('tprac'), policyOf: r => 'T' + r.tid, txt: (r, p) => 'T' + r.tid + ' · ' + p.label, go: () => () => {} }); window.__regT(); });
    return { p, ctx };
  }
  // پرشِ روز با ساعتِ Playwright: نوشتن‌ها فرستاده ⇒ زمان جلو ⇒ بارگذاریِ دوباره (حالتِ درون‌حافظه تازه می‌شود)
  async function day(p, d, qs) {
    await p.evaluate(() => APP.S.flushNow()); await p.waitForTimeout(50);
    await p.clock.setSystemTime(at(d));
    if (qs != null) await p.goto(FILE + qs); else await p.reload();
    await p.waitForSelector('.nav'); await p.waitForTimeout(120);
    await p.evaluate(() => { APP.SCHED.captureRemind(); window.__regT = () => APP.SCHED.planSource({ kind: 'tprac', label: 'پروندهٔ تمرینِ آزمونی', types: ['tprac'], records: () => APP.S.all('tprac'), policyOf: r => 'T' + r.tid, txt: (r, p) => 'T' + r.tid + ' · ' + p.label, go: () => () => {} }); window.__regT(); });
  }
  const today = p => p.evaluate(() => APP.dueList().map(x => ({ txt: x.txt, sub: x.sub || '', sched: x.sched || null })));
  const tlines = async (p, re) => (await today(p)).filter(x => re.test(x.txt));
  const caps = p => p.evaluate(() => APP.SCHED.captured.slice());
  const syncRem = p => p.evaluate(() => APP.SCHED.syncReminders());
  const grade = async (p, g) => {
    await p.evaluate(() => APP.goRoot('review')); await p.waitForTimeout(100);
    await p.locator('main .card.flash button:has-text("نمایش پاسخ")').click();
    await p.locator('main .grades .btn.g' + g).click(); await p.waitForTimeout(80);
  };

  // ================= ساعت و سیاست‌ها =================
  { const { p, ctx } = await open();
    const ev = await p.evaluate(() => APP.SCHED.policyEvidence());
    const bad = ev.filter(x => !x.inText);
    if (bad.length) errors.push('policy src not in the technique text: ' + JSON.stringify(bad));
    const base = await p.evaluate(() => ({ t: APP.today(), now: APP.now().toISOString(), same: APP.today() === APP.localDay(APP.nowISO()), off: APP.clock.off, dev: APP.clock.dev, ladder: APP.SCHED.ladder(), q: APP.SCHED_QUARANTINE.length, users: Object.keys(APP.SCHED.users).sort() }));
    if (base.t !== D0 || !base.same || base.off !== 0 || base.dev) errors.push('clock without offset must be the real clock: ' + JSON.stringify(base));
    if (base.q < 6 || ['a11_course', 'a17_kpractice', 'a36_solve'].some(u => base.users.indexOf(u) < 0)) errors.push('ladder copies not routed through A.SCHED.ladder: ' + JSON.stringify(base.users));
    // نردبانِ عمومی هرگز روی تکنیکی با متنِ خودش: سیاستِ T3 فقط ماهانه است
    const t3 = await p.evaluate(() => APP.SCHED.plan('T3', { id: 'x', start: '2026-10-17', sessions: [] }, '2026-10-17'));
    if (t3.length !== 1 || t3[0].due !== '2026-11-16') errors.push('T3 policy not monthly: ' + JSON.stringify(t3));
    await ctx.close(); }

  // ================= T42 کارت (#0، #11، #17، #127، #138) =================
  { const { p, ctx } = await open();
    const cid = await p.evaluate(() => APP.newCard('مشتقِ sin x چیست؟', 'cos x', { tid: 42 }).id);
    let one = await p.evaluate(id => APP.SCHED.all().filter(e => e.kind === 'card' && e.id === id).length, cid);
    ok(0, one === 1, 'day0: one A.SCHED entry per card (' + one + ')');
    await day(p, add(D0, 1));
    ok(0, (await tlines(p, /کارت مرور/)).length === 1, 'day1: card not in Today');
    await grade(p, 4);
    let c = await p.evaluate(id => APP.S.get(id), cid);
    ok(0, c.due === '2026-10-24', 'day1 grade «خوب» ⇒ next due ' + c.due + ' (T42 text: 6 days ⇒ 2026-10-24)');
    ok(11, c.due !== '2026-10-21' && c.due === '2026-10-24', 'day1 next due must not be the 3-day 2026-10-21: ' + c.due);
    let cp = (await caps(p)).filter(x => x.key === 'cards:review').pop() || {};
    ok(0, cp.due_date === '2026-10-24', 'cards:review not re-synced after grading: ' + JSON.stringify(cp));
    ok(17, cp.due_date === '2026-10-24' && cp.due_date !== '2026-10-18', 'stale phone reminder after grade: ' + cp.due_date);
    ok(127, cp.key === 'cards:review' && cp.due_date === '2026-10-24', 'capture stub did not record {cards:review, 2026-10-24}');
    ok(138, await p.evaluate(() => !!APP.HOST._schedCapture), 'remind not captured by the stub');
    one = await p.evaluate(id => APP.SCHED.all().filter(e => e.kind === 'card' && e.id === id).length, cid);
    ok(0, one === 1, 'after grade: one entry per card (' + one + ')');
    for (const d of [2, 3, 6]) { await day(p, add(D0, d)); ok(0, !(await tlines(p, /کارت مرور/)).length, 'card shown on day ' + d); }
    await day(p, add(D0, 7));
    ok(0, (await tlines(p, /کارت مرور/)).length === 1, 'day7: card not due');
    await grade(p, 4);
    c = await p.evaluate(id => APP.S.get(id), cid);
    ok(0, c.due === '2026-11-08', 'day7 grade ⇒ ×2.5 ⇒ 15 days ⇒ 2026-11-08, got ' + c.due);
    await ctx.close(); }

  // ================= T42 بازگشتِ دیر (#8) =================
  { const { p, ctx } = await open();
    const cid = await p.evaluate(() => APP.newCard('قاعدهٔ زنجیره‌ای', '(f∘g)′ = f′(g)·g′', { tid: 42, due: APP.addDays(APP.today(), 1) }).id);
    await p.waitForTimeout(100);
    const c0 = (await caps(p)).filter(x => x.key === 'cards:review');
    await day(p, add(D0, 4));
    const ln = await tlines(p, /کارت مرور/);
    ok(8, ln.length === 1 && /عقب‌افتاده از/.test(ln[0].sub), 'day4: card not shown as overdue: ' + JSON.stringify(ln));
    const fdue = await p.evaluate(() => APP.fdate('2026-10-18'));
    ok(8, ln.length && ln[0].sub.indexOf(fdue) >= 0, 'overdue line does not name 2026-10-18: ' + JSON.stringify(ln));
    await p.evaluate(() => APP.render()); await p.waitForTimeout(50);
    const c4 = (await caps(p)).filter(x => x.key === 'cards:review');
    ok(8, c0.length === 1 && c0[0].due_date === '2026-10-18' && c4.every(x => x.due_date === '2026-10-18'), 'more than one reminder for the same due (day0 ' + JSON.stringify(c0) + ', day4 ' + JSON.stringify(c4) + ')');
    await grade(p, 4);
    const c = await p.evaluate(id => APP.S.get(id), cid);
    ok(8, c.due === '2026-10-27', 'next due counted from the actual review day (4+6=10 ⇒ 2026-10-27), got ' + c.due);
    await ctx.close(); }

  // ================= بازنشستگیِ کارت (#130، #139) =================
  { const { p, ctx } = await open({ qs: '?dev=1' });
    const cid = await p.evaluate(() => APP.newCard('کارتِ کهنه', 'x', { tid: 42 }).id);
    await p.evaluate(() => APP.goRoot('review', null, 'cards')); await p.waitForTimeout(100);
    await p.locator('main .card-susp').first().click(); await p.waitForTimeout(100);
    const r = await p.evaluate(id => ({ susp: APP.S.get(id).susp, due: APP.dueCards().some(c => c.id === id), next: APP.SCHED.next(APP.S.get(id)), sch: APP.SCHED.all().some(e => e.kind === 'card' && e.id === id), un: APP.SCHED.captured.some(x => x.unremind === 'cards:review') }), cid);
    ok(130, r.susp && !r.due && r.next === null && !r.sch && r.un, 'susp setter did not retire the card from queue/reminder: ' + JSON.stringify(r));
    await p.evaluate(() => APP.clock.advance(30)); await day(p, D0, '?dev=1');
    const r2 = await p.evaluate(id => ({ t: APP.today(), due: APP.dueCards().some(c => c.id === id), line: APP.dueList().some(x => /کارت مرور/.test(x.txt)), rem: APP.SCHED.captured.filter(x => x.key === 'cards:review').length }), cid);
    await p.evaluate(() => APP.render());
    const rem2 = (await caps(p)).filter(x => x.key === 'cards:review').length;
    ok(139, r2.t === '2026-11-16' && !r2.due && !r2.line && rem2 === 0, 'retired card back after 30 days: ' + JSON.stringify(r2) + ' rem ' + rem2);
    // بازگرداندن همان کارت را با زمان‌بندیِ خودش برمی‌گرداند
    await p.evaluate(() => APP.goRoot('review', null, 'cards')); await p.waitForTimeout(80);
    await p.locator('main .card-susp').first().click(); await p.waitForTimeout(80);
    ok(130, await p.evaluate(id => APP.dueCards().some(c => c.id === id), cid), 'unretire did not bring the card back');
    await p.evaluate(() => APP.clock.reset());
    await ctx.close(); }

  // ================= T41 چرخهٔ ۱-۳-۷ + هفتگی (#1) =================
  { const { p, ctx } = await open();
    await p.evaluate(() => APP.S.put({ id: 'pc41', type: 'tprac', tid: 41, subject: 'قضیهٔ باقیماندهٔ چینی', start: '2026-10-17', state: 'open', sessions: [] }));
    await p.waitForTimeout(600);
    const c0 = (await caps(p)).filter(x => /^tprac:pc41/.test(x.key || ''));
    ok(1, c0.some(x => x.key === 'tprac:pc41:cycle' && x.due_date === '2026-10-18') && c0.some(x => x.key === 'tprac:pc41:weekly' && x.due_date === '2026-10-24'), 'day0 reminders not keyed to the case: ' + JSON.stringify(c0));
    const log = (d, tr, pct) => p.evaluate(([d, tr, pct]) => { const r = APP.S.get('pc41'); r.sessions.push({ d, track: tr, pct }); APP.S.put(r); }, [d, tr, pct]);
    const seen = {};
    for (let n = 1; n <= 14; n++) {
      await day(p, add(D0, n));
      const L = await tlines(p, /^T41 ·/);
      seen[n] = L.map(x => x.txt.replace('T41 · ', '')).join(' + ');
      if (n === 1) await log(add(D0, 1), 'cycle', 60);
      if (n === 3) await log(add(D0, 3), 'cycle', 75);
      if (n === 7) { await log(add(D0, 7), 'cycle', 90); await log(add(D0, 7), 'weekly', 85); }
      if (n === 1 || n === 3 || n === 7) { await p.waitForTimeout(600); }
    }
    const cyc = n => /چرخه/.test(seen[n] || ''), wk = n => /هفتگی/.test(seen[n] || '');
    ok(1, cyc(1) && cyc(3) && cyc(7) && !cyc(2) && !cyc(4) && !cyc(5) && !cyc(6) && !cyc(8) && !cyc(14), 'T41 cycle lines not exactly on days 1/3/7: ' + JSON.stringify(seen));
    ok(1, wk(7) && wk(14) && !wk(6) && !wk(8), 'weekly blank page not on days 7 and 14: ' + JSON.stringify(seen));
    await ctx.close(); }

  // ================= 🎯 پیش‌بینی (#2) و ⛓ زنجیره (#3) =================
  { const { p, ctx } = await open();
    await p.evaluate(() => APP.goRoot('fcast')); await p.waitForTimeout(80);
    await p.fill('#fcQ', 'تا ۱۰ روز دیگر از شرکت الف پیشنهادِ کار می‌رسد'); await p.fill('#fcP', '60'); await p.fill('#fcD', '2026-10-27');
    await p.locator('main button:has-text("ثبتِ پیش‌بینی")').click(); await p.waitForTimeout(600);
    const fid = await p.evaluate(() => APP.S.all('fcast')[0].id);
    ok(2, (await caps(p)).some(x => x.key === 'fcast:' + fid && x.due_date === '2026-10-27'), 'no reminder at the forecast due');
    await p.evaluate(() => APP.goRoot('chain')); await p.waitForTimeout(80);
    await p.fill('#wcT', 'اگر وام دیر بیاید ← اجاره عقب می‌افتد'); await p.fill('#wcF', '70');
    await p.locator('main button:has-text("ساختنِ زنجیره")').click(); await p.waitForTimeout(150);
    await p.locator('main input[aria-label="موعدِ وارسیِ نتیجه"]').fill('2026-10-22'); await p.locator('main input[aria-label="موعدِ وارسیِ نتیجه"]').dispatchEvent('change'); await p.waitForTimeout(100);
    for (let n = 0; n <= 4; n++) { if (n) await day(p, add(D0, n)); ok(3, !(await tlines(p, /^⛓/)).length, 'wchain line before its due, day ' + n); }
    await day(p, add(D0, 5));
    const wl = await tlines(p, /^⛓/);
    ok(3, wl.length === 1 && /اگر وام دیر بیاید/.test(wl[0].txt) && /موعد: امروز/.test(wl[0].sub), 'wchain line missing on day 5: ' + JSON.stringify(wl));
    ok(2, !(await tlines(p, /^🎯/)).length, 'forecast shown before its due');
    await day(p, add(D0, 10));
    let fl = await tlines(p, /^🎯/);
    ok(2, fl.length === 1 && /موعد: امروز/.test(fl[0].sub), 'forecast not in Today on its due day: ' + JSON.stringify(fl));
    await day(p, add(D0, 12));
    fl = await tlines(p, /^🎯/);
    const f27 = await p.evaluate(() => APP.fdate('2026-10-27'));
    ok(2, fl.length === 1 && /عقب‌افتاده از/.test(fl[0].sub) && fl[0].sub.indexOf(f27) >= 0, 'day 12: not marked overdue since 10-27: ' + JSON.stringify(fl));
    await p.evaluate(() => APP.goRoot('fcast')); await p.waitForTimeout(80);
    await p.locator('main select[aria-label^="نتیجهٔ «"]').first().selectOption('نشد'); await p.waitForTimeout(700);
    ok(2, !(await tlines(p, /^🎯/)).length, 'forecast still in Today after its outcome');
    ok(2, (await caps(p)).some(x => x.unremind === 'fcast:' + fid), 'forecast reminder not cancelled after the outcome');
    await ctx.close(); }

  // ================= T31 پنجرهٔ ۲ تا ۷ روز (#4، #16) =================
  { const { p, ctx } = await open();
    await p.evaluate(() => APP.S.put({ id: 'pc31', type: 'tprac', tid: 31, subject: 'اول حالت‌های کوچک را جدول کن', start: '2026-10-17', state: 'open', sessions: [] }));
    await p.waitForTimeout(600);
    const r0 = (await caps(p)).filter(x => x.key === 'tprac:pc31:result');
    const st = {};
    for (const n of [1, 2, 5, 7, 8]) { await day(p, add(D0, n)); await syncRem(p); const L = await tlines(p, /^T31 ·/); st[n] = L.length ? (/عقب‌افتاده/.test(L[0].sub) ? 'late' : 'on') : '-'; }
    ok(16, st[1] === '-', 'T31 line on day 1 (window starts at 2): ' + JSON.stringify(st));
    ok(4, st[1] === '-' && st[2] === 'on' && st[5] === 'on' && st[7] === 'on' && st[8] === 'late', 'T31 window wrong: ' + JSON.stringify(st));
    ok(4, r0.length === 1 && r0[0].due_date === '2026-10-19', 'T31 reminder not once at the window start: ' + JSON.stringify(r0));
    ok(4, !(await caps(p)).some(x => x.key === 'tprac:pc31:result'), 'T31 reminder re-sent on a later day');
    await ctx.close(); }

  // ================= T21 + آزمایشِ گره، سقفِ دو آزمونِ باز (#5) و آزمایشِ گره از راهِ A.SCHED (#9) =================
  { const { p, ctx } = await open();
    await p.evaluate(() => {
      APP.S.put({ id: 'k_focus', type: 'knot', name: 'حواس‌پرتی' });
      APP.S.put({ id: 'kx1', type: 'kexp', knot: 'k_focus', status: 'planned', due: '2026-10-22', plan: 'تلفن در اتاقِ دیگر' });
      APP.S.put({ id: 'pc21', type: 'tprac', tid: 21, subject: 'صبح‌ها ۲۰ دقیقه مسئله ⇐ تمرکزِ عصر', start: '2026-10-17', state: 'open', due: '2026-10-26', sessions: [] });
    });
    const cap = await p.evaluate(() => APP.SCHED.openFor(21));
    ok(5, cap.cap === 2 && cap.open === 2 && !cap.over, 'open tests across sources vs T21 cap: ' + JSON.stringify(cap));
    await day(p, add(D0, 5));
    const kx = await p.evaluate(() => APP.SCHED.due(APP.today(), { kind: 'kexp' }));
    const kl = await tlines(p, /آزمایشِ واقعیِ گره/);
    ok(9, kx.length === 1 && /حواس‌پرتی/.test(kx[0].label) && /تلفن/.test(kx[0].reason) && kx[0].remindKey === 'knot:k_focus' && kl.length === 1, 'kexp not registered through A.SCHED with name/reason/key: ' + JSON.stringify(kx) + ' lines ' + kl.length);
    await day(p, add(D0, 9));
    const L = await tlines(p, /^T21 ·/);
    ok(5, L.length === 1 && /موعد: امروز/.test(L[0].sub), 'T21 test not due on day 9 (2026-10-26): ' + JSON.stringify(L));
    await ctx.close(); }

  // ================= T3 ماهانه (#6، #15)، T9 دو ذخیرهٔ هم‌روز (#18)، T24 آستانهٔ ۵۰ (#19) =================
  { const { p, ctx } = await open();
    await p.evaluate(() => {
      APP.S.put({ id: 'pc3', type: 'tprac', tid: 3, subject: '۲۰٪ مشتری‌ها', start: '2026-10-17', state: 'open', sessions: [] });
      const r = { id: 'pc9', type: 'tprac', tid: 9, subject: 'تخمینِ تحویل', start: '2026-10-17', state: 'open', sessions: [] }; APP.S.put(r); r.est = 2; APP.S.put(r);
      APP.S.put({ id: 'pc24', type: 'tprac', tid: 24, subject: 'پیش‌بینی‌های روزانه', start: '2026-10-17', state: 'open', sessions: [], counts: { resolved: 0 } });
    });
    const s3 = {};
    for (const n of [1, 3, 7, 21]) { await day(p, add(D0, n)); s3[n] = (await tlines(p, /^T3 ·/)).length; }
    ok(15, !s3[1] && !s3[3] && !s3[7], 'T3 line on a 1/3/7 day: ' + JSON.stringify(s3));
    ok(6, !s3[7] && !s3[21], 'T3 line on day 7/21: ' + JSON.stringify(s3));
    await p.evaluate(() => { const r = APP.S.get('pc24'); r.counts.resolved = 41; APP.S.put(r); });
    await day(p, add(D0, 30));
    const L3 = await tlines(p, /^T3 ·/), L9 = await tlines(p, /^T9 ·/);
    ok(6, L3.length === 1 && /ماهانه/.test(L3[0].txt), 'T3 monthly review not on day 30: ' + JSON.stringify(L3));
    ok(18, L9.length === 1, 'two same-day saves ⇒ ' + L9.length + ' T9 lines on day 30');
    ok(19, !(await tlines(p, /^T24 ·/)).length, 'T24 review prompt with only 41 resolved on day 30');
    await p.evaluate(() => { const r = APP.S.get('pc24'); r.counts.resolved = 50; r.countAt = { resolved: APP.today() }; APP.S.put(r); });
    const L24 = await tlines(p, /^T24 ·/);
    ok(19, L24.length === 1 && /موعد: امروز/.test(L24[0].sub), 'T24 review not on the day the 50th is resolved: ' + JSON.stringify(L24));
    await ctx.close(); }

  // ================= T23 بازآزمایی + مرورِ روند (#7) =================
  { const { p, ctx } = await open();
    await p.evaluate(() => APP.S.put({ id: 'pc23', type: 'tprac', tid: 23, subject: 'قواعدِ لگاریتم', start: '2026-10-17', state: 'open', sessions: [{ d: '2026-10-17', track: 'quiz', score: 6 }] }));
    const log = (d, tr, s) => p.evaluate(([d, tr, s]) => { const r = APP.S.get('pc23'); r.sessions.push({ d, track: tr, score: s }); APP.S.put(r); }, [d, tr, s]);
    const seen = {};
    for (let n = 1; n <= 5; n++) {
      await day(p, add(D0, n));
      seen[n] = (await tlines(p, /^T23 ·/)).map(x => /بازآزمایی/.test(x.txt) ? 'R' : /روند/.test(x.txt) ? 'T' : '?').join('');
      if (n % 2) await log(add(D0, n), 'retest', 8); else await log(add(D0, n), 'quiz', 7);
      if (n === 5) seen['5after'] = (await tlines(p, /^T23 ·/)).map(x => /روند/.test(x.txt) ? 'T' : 'R').join('');
    }
    ok(7, seen[1] === 'R' && seen[3] === 'R' && seen[5] === 'R' && seen[2] === '' && seen[4] === '' && seen['5after'] === 'T', 'T23 retest/trend sequence wrong: ' + JSON.stringify(seen));
    await ctx.close(); }

  // ================= T22 هفتگی + پروندهٔ بسته (#10، #13) و T28 مکث/ادامه (#14) =================
  { const { p, ctx } = await open();
    await p.evaluate(() => {
      APP.S.put({ id: 'pc22', type: 'tprac', tid: 22, subject: 'بدونِ ارشد پیشرفت نمی‌کنم', start: '2026-10-17', state: 'open', dues: { obs: '2026-10-22' }, sessions: [] });
      APP.S.put({ id: 'pc28', type: 'tprac', tid: 28, subject: 'توضیحِ مشتق برای خواهرم', start: '2026-10-17', state: 'open', sessions: [] });
    });
    await p.waitForTimeout(600);
    await day(p, add(D0, 1));
    await p.evaluate(() => { const r = APP.S.get('pc28'); r.state = 'paused'; r.pausedAt = APP.today(); APP.S.put(r); });
    await p.waitForTimeout(600);
    ok(14, (await caps(p)).some(x => x.unremind === 'tprac:pc28:rewrite'), 'pause did not cancel the T28 reminder');
    await day(p, add(D0, 5));
    const L5 = await tlines(p, /^T22 ·/);
    ok(10, L5.length === 1 && /مشاهده/.test(L5[0].txt), 'T22 observation due (day 5) not a separate line: ' + JSON.stringify(L5));
    await p.evaluate(() => { const r = APP.S.get('pc22'); r.sessions.push({ d: APP.today(), track: 'obs' }); r.state = 'closed'; r.verdict = 'رد شد'; APP.S.put(r); });
    await p.waitForTimeout(600);
    ok(13, (await caps(p)).some(x => x.unremind === 'tprac:pc22:weekly'), 'closed case reminder not cancelled');
    const s14 = {};
    for (const n of [7, 9]) { await day(p, add(D0, n)); s14[n] = (await tlines(p, /^T28 ·/)).length; ok(13, !(await tlines(p, /^T22 ·/)).length && !(await p.evaluate(() => APP.SCHED.all().some(e => e.id === 'pc22'))), 'closed T22 case still scheduled on day ' + n); }
    ok(14, !s14[7] && !s14[9], 'paused T28 shown: ' + JSON.stringify(s14));
    await day(p, add(D0, 10));
    await p.evaluate(() => { const r = APP.S.get('pc28'); r.state = 'open'; r.resumed = APP.today(); APP.S.put(r); });
    const nx = await p.evaluate(() => APP.SCHED.plan('T28', APP.S.get('pc28'), APP.today()));
    ok(14, nx.length === 1 && nx[0].due === '2026-10-28', 'after resume the first rewrite is not day 11: ' + JSON.stringify(nx));
    await day(p, add(D0, 11));
    ok(14, (await tlines(p, /^T28 ·/)).length === 1, 'T28 rewrite not shown on day 11');
    await p.evaluate(() => { const r = APP.S.get('pc28'); r.sessions.push({ d: APP.today(), track: 'rewrite' }); APP.S.put(r); });
    const nx2 = await p.evaluate(() => APP.SCHED.plan('T28', APP.S.get('pc28'), APP.today()));
    ok(14, nx2.length === 1 && nx2[0].due === '2026-11-03', 'second rewrite not day 17 (2026-11-03): ' + JSON.stringify(nx2));
    // T22 «هفته‌ای یک باور»: پروندهٔ باز ⇒ نشانه روزِ ۷ و ۱۴، جدا از مشاهدهٔ همان پرونده
    await p.evaluate(() => APP.S.put({ id: 'pc22b', type: 'tprac', tid: 22, subject: 'باورِ تازه', start: '2026-10-17', state: 'open', dues: { obs: '2026-10-30' }, sessions: [] }));
    const w = await p.evaluate(() => [APP.SCHED.plan('T22', APP.S.get('pc22b'), '2026-10-24'), APP.SCHED.all('2026-10-24').filter(e => e.id === 'pc22b').map(e => e.key)]);
    ok(10, w[0].some(e => e.track === 'weekly' && e.due === '2026-10-24') && w[0].some(e => e.track === 'obs' && e.due === '2026-10-30') && w[1].length === 2, 'T22 weekly cue / observation not separate: ' + JSON.stringify(w));
    const w14 = await p.evaluate(() => { const r = APP.S.get('pc22b'); return APP.SCHED.plan('T22', Object.assign({}, r, { sessions: [{ d: '2026-10-24', track: 'weekly' }] }), '2026-10-31'); });
    ok(10, w14.some(e => e.track === 'weekly' && e.due === '2026-10-31'), 'T22 weekly cue not on day 14: ' + JSON.stringify(w14));
    await ctx.close(); }

  // ================= مسئلهٔ زنده: یک سطر، نه دو (#12) =================
  { const { p, ctx } = await open();
    await p.evaluate(() => APP.S.put({ id: 'fc_live', type: 'fcast', q: 'اگر n=۳ باشد ۳ راه', p: 70, due: '2026-10-18', live: { pid: 'pb_l_x', sid: 's1' } }));
    await day(p, add(D0, 1));
    const r = await p.evaluate(() => ({ fc: APP.SCHED.due(APP.today(), { kind: 'fcast' }).length, lines: APP.dueList().filter(x => /🎯/.test(x.txt)).length }));
    ok(12, r.fc === 0 && r.lines === 0, 'live-step forecast got its own Today line/entry: ' + JSON.stringify(r));
    await ctx.close(); }

  // ================= LT8 ساعتِ آزمایشیِ درون‌صفحه (#125، #126، #133، #134، #135، #141، #127 با ساعتِ آزمایشی) =================
  { const { p, ctx } = await open();
    await p.evaluate(() => APP.S.put({ id: 'pc41o', type: 'tprac', tid: 41, subject: 'بیز', start: '2026-10-17', state: 'open', sessions: [{ d: '2026-10-18', track: 'cycle' }] }));
    // #134: بی حالتِ توسعه ?clock اعمال نمی‌شود
    await day(p, D0, '?clock=2027-01-01');
    const prod = await p.evaluate(() => { const c = APP.newCard('کارتِ واقعی', 'x', {}); return { t: APP.today(), off: APP.clock.off, created: APP.localDay(c.created), sim: !!c.simClock, flag: !!document.getElementById('llaClockFlag') }; });
    ok(134, prod.t === D0 && prod.off === 0 && prod.created === D0 && !prod.sim && !prod.flag, 'offset applied without the dev flag: ' + JSON.stringify(prod));
    // #125
    await day(p, D0, '?dev=1&clock=2026-10-20');
    const o = await p.evaluate(() => ({ t: APP.today(), lines: APP.dueList().filter(x => /^T41 ·/.test(x.txt)).map(x => x.txt + ' | ' + x.sub), flag: (document.getElementById('llaClockFlag') || {}).textContent || '' }));
    ok(125, o.t === '2026-10-20' && o.lines.length === 1 && /چرخه/.test(o.lines[0]) && /موعد: امروز/.test(o.lines[0]) && /ساعتِ آزمایشی/.test(o.flag), 'offset clock: ' + JSON.stringify(o));
    // #126 + #141
    await p.evaluate(() => APP.clock.set('2026-10-17'));
    await p.evaluate(() => APP.clock.advance(7)); await day(p, D0, '?dev=1&clock=2026-10-20');
    const o7 = await p.evaluate(() => { const r = APP.S.put({ id: 'probe7', type: 'note', t: 'x' }); return { t: APP.today(), created: APP.localDay(r.created), sim: r.simClock, lines: APP.dueList().filter(x => /^T41 ·/.test(x.txt)).map(x => x.txt) }; });
    ok(126, o7.t === '2026-10-24' && o7.created === '2026-10-24' && o7.sim === '2026-10-24' && o7.lines.some(x => /چرخه/.test(x)) && o7.lines.some(x => /هفتگی/.test(x)), 'advance(7)+reload: ' + JSON.stringify(o7));
    await p.evaluate(() => APP.clock.advance(7)); await day(p, D0, '?dev=1&clock=2026-10-20');
    const o14 = await p.evaluate(() => ({ t: APP.today(), off: APP.clock.off }));
    ok(141, o14.t === '2026-10-31' && o14.off === 14, 'advance accumulation: ' + JSON.stringify(o14));
    // #133: دو پرش ⇒ نشست‌ها با تاریخِ ساعتِ آزمایشی، فاصلهٔ ۱۵ روز
    await p.evaluate(() => APP.clock.set('2026-10-17'));
    await p.evaluate(() => APP.S.put({ id: 'pc21s', type: 'tprac', tid: 21, subject: 'سارا', start: APP.today(), state: 'open', due: '2026-11-01', sessions: [] }));
    await p.evaluate(() => APP.clock.advance(6)); await day(p, D0, '?dev=1');
    await p.evaluate(() => { const r = APP.S.get('pc21s'); r.sessions.push({ d: APP.today(), at: APP.nowISO() }); APP.S.put(r); });
    await p.evaluate(() => APP.clock.advance(9)); await day(p, D0, '?dev=1');
    const s21 = await p.evaluate(() => { const r = APP.S.get('pc21s'); r.sessions.push({ d: APP.today(), at: APP.nowISO() }); APP.S.put(r); return { ds: r.sessions.map(s => s.d), ats: r.sessions.map(s => APP.localDay(s.at)), span: APP.daysBetween(r.start, r.sessions[1].d) }; });
    ok(133, JSON.stringify(s21.ds) === '["2026-10-23","2026-11-01"]' && JSON.stringify(s21.ats) === JSON.stringify(s21.ds) && s21.span >= 14, 'offset-dated sessions: ' + JSON.stringify(s21));
    // #127 با ساعتِ آزمایشی: کارت روزِ ۰، نمره روزِ ۱ ⇒ {cards:review, روزِ ۷}
    await p.evaluate(() => { APP.clock.set('2026-10-17'); APP.S.all('card').forEach(c => APP.cardSuspend(c, true)); });
    const cid = await p.evaluate(() => APP.newCard('مشتقِ sin x', 'cos x', { tid: 42 }).id);
    await p.evaluate(() => APP.clock.advance(1)); await day(p, D0, '?dev=1&remind=capture');
    await grade(p, 4);
    const cp = (await caps(p)).filter(x => x.key === 'cards:review').pop() || {};
    ok(127, cp.due_date === '2026-10-24', 'capture under the offset clock: ' + JSON.stringify(cp));
    ok(138, await p.evaluate(() => APP.HOST._schedCapture === true), 'offset run without capture stub');
    // #135: رکوردهای ساعتِ آزمایشی بی آن ساعت دیده نمی‌شوند
    await p.evaluate(() => APP.S.put({ id: 'fc_sim', type: 'fcast', q: 'آزمونی', p: 60, due: APP.today() }));
    await p.evaluate(() => APP.clock.reset()); await day(p, D0, '');
    const h = await p.evaluate(id => ({ t: APP.today(), fc: APP.S.all('fcast').some(x => x.id === 'fc_sim'), card: false, line: APP.dueList().some(x => /🎯/.test(x.txt)), stored: !!APP.S.recs['fc_sim'] }), cid);
    ok(135, h.t === D0 && !h.fc && !h.card && !h.line && h.stored, 'test records leak into the owner view: ' + JSON.stringify(h));
    await ctx.close(); }

  // ================= LT8: پرشِ رو به عقب، وصلهٔ ناقص، مرزِ نیمه‌شبِ تهران (#128، #132، #136، #137، #140)، هم‌خوانیِ d و at (#129) =================
  { const { p, ctx } = await open({ time: new Date('2026-10-17T21:00:00Z') });
    const t = await p.evaluate(() => { APP.S.put({ id: 'cm', type: 'card', q: 'q', a: 'a', ef: 2.5, n: 0, iv: 0, due: '2026-10-18', hist: [] }); return { t: APP.today(), due: APP.dueCards().some(c => c.id === 'cm') }; });
    ok(128, t.t === '2026-10-18' && t.due, 'Tehran 00:30 local day: ' + JSON.stringify(t));
    await ctx.close(); }
  { const { p, ctx } = await open({ time: new Date('2026-10-17T20:20:00Z') });
    const t = await p.evaluate(() => { APP.S.put({ id: 'cm2', type: 'card', q: 'q', a: 'a', ef: 2.5, n: 0, iv: 0, due: '2026-10-18', hist: [] }); return { t: APP.today(), due: APP.dueCards().some(c => c.id === 'cm2') }; });
    ok(140, t.t === '2026-10-17' && !t.due, 'Tehran 23:50 must still be 10-17: ' + JSON.stringify(t));
    await ctx.close(); }
  { const { p, ctx } = await open();
    // #132
    await day(p, D0, '?dev=1&clock=2026-11-01');
    const a = await p.evaluate(() => APP.today());
    await p.evaluate(() => APP.clock.reset());
    await day(p, '2026-10-20', '');
    const bk = await p.evaluate(() => ({ t: APP.today(), chk: APP.clock.check(), loaded: APP._loadedAt }));
    ok(132, a === '2026-11-01' && bk.t === '2026-10-20' && bk.chk.ok && !bk.chk.stale, 'backward jump with reload: ' + a + ' ' + JSON.stringify(bk));
    // #136: پرش به جلو، سپس عقب بی بارگذاری ⇒ «stale» (نتیجه پذیرفته نیست)
    await day(p, add('2026-10-20', 15));
    await p.evaluate(() => APP.today());
    await p.clock.setSystemTime(at('2026-10-23'));
    const st = await p.evaluate(() => { APP.today(); return APP.clock.check(); });
    ok(136, st.stale && !st.ok, 'backward jump without reload not flagged stale: ' + JSON.stringify(st));
    // #137: فقط APP.today وصله ⇒ mixed
    await day(p, D0);
    const mx = await p.evaluate(() => { const raw = APP.today; APP.today = () => '2026-10-24'; const r = APP.S.put({ id: 'pc41m', type: 'tprac', tid: 41, start: APP.today(), state: 'open', sessions: [] }); const out = { chk: APP.clock.check(), created: APP.localDay(r.created), t: APP.today() }; APP.today = raw; return out; });
    ok(137, mx.chk.mixed && !mx.chk.ok && mx.created !== mx.t, 'partial patch not rejected as mixed: ' + JSON.stringify(mx));
    // #129: kpractice d و at از یک ساعت، با ساعتِ آزمایشی
    await day(p, D0, '?dev=1&clock=2026-10-25');
    const kp = await p.evaluate(() => {
      APP.S.put({ id: 'kn1', type: 'knot', name: 'عجله در خواندن', status: 'open' });
      const it = APP.S.put({ id: 'ki1', type: 'kitem', knot: 'kn1', prompt: 'صورتِ مسئله را دوباره بخوان', atype: 'choice', answer: 'a', choices: [{ id: 'a', t: 'x' }, { id: 'b', t: 'y' }], form: 'verbal' });
      try { APP.krecord(it, { ok: true, conf: 70, ans: 'a' }); } catch (e) { return { err: e.message }; }
      const h = (APP.S.get('ki1').hist || []).slice(-1)[0] || {}; const k = APP.S.get('kn1'); const lg = (k.log || []).slice(-1)[0] || {};
      return { d: h.d, at: APP.localDay(h.at), kd: lg.d, kat: lg.at ? APP.localDay(lg.at) : null, t: APP.today() };
    });
    ok(129, !kp.err && kp.d === '2026-10-25' && kp.at === kp.d && (kp.kd == null || (kp.kd === kp.d && kp.kat === kp.d)), 'kpractice d/at disagree under the offset clock: ' + JSON.stringify(kp));
    await p.evaluate(() => APP.clock.reset());
    await ctx.close(); }

  await b.close();
  const order = Object.keys(bank).map(Number).sort((x, y) => x - y);
  console.log('bank R19c (LT1.sched / LT8.clock):', order.map(k => '#' + k + (bank[k].ok ? ' ✓' : ' ✗ ' + bank[k].why)).join('\n  '));
  console.log('covered:', order.length, 'entries');
  if (errors.length) { console.log('ERRORS:\n  ' + errors.join('\n  ')); process.exitCode = 1; } else console.log('NO ERRORS');
})().catch(e => { console.error(e); process.exit(1); });
