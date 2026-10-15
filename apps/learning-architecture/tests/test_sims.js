// شبیه‌سازهای منزل‌های ۲ و ۳ ِ دوره (a14_sims.js) — روی نسخهٔ مستقلِ ساخته‌شده (dist/learning-architecture.html)
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
const IDS = [36, 28, 45, 2, 4, 1, 3, 5];
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(300);
  // شروعِ دوره مثلِ test_course.js
  await p.evaluate(() => APP.goRoot('start')); await p.locator('main .door.main .btn').click(); await p.waitForTimeout(200);
  await p.fill('#crsTopic', 'آزمون: شبیه‌سازها'); await p.click('main .btn:has-text("شروعِ درسِ اول")'); await p.waitForTimeout(250);
  const open = async (id) => {
    await p.evaluate(x => { const c = APP.courseState(); if (c) { c.warmSkip = APP.today(); APP.S.put(c); } APP.go('lesson', x, 's2'); }, id);
    await p.waitForTimeout(120);
    return p.locator('main .crs-sim');
  };
  const fbs = (sim) => sim.locator('.sim-fb').count();
  const ok = (sim) => sim.locator('.sim-fb.ok').count();
  // پاسخِ چندگزینه‌ای: تا وقتی گزینهٔ فعال هست و درستی پیدا نشده، اولی را بزن
  const solvePick = async (q) => { for (let i = 0; i < 8; i++) { if (await q.locator('.sim-right').count()) return true; const o = q.locator('.crs-whyopt:not([disabled])').first(); if (!(await o.count())) return false; await o.click(); await p.waitForTimeout(30); } return false; };
  const solveLastPick = async (sim) => solvePick(sim.locator('.sim-q').last());
  const regs = await p.evaluate(ids => ids.map(i => !!(APP.COURSE_SIM && APP.COURSE_SIM[i])), IDS);
  info.registered = regs;
  for (const id of IDS) {
    const sim = await open(id); const r = { present: await sim.count(), sub: await p.evaluate(() => APP.state.sub) };
    if (!r.present) { info[id] = r; errors.push('sim missing ' + id); continue; }
    if (id === 36) {
      await sim.locator('.btn:has-text("خواندم")').click(); r.closed = await sim.locator('.sim-closed').count();
      for (let k = 0; k < 3; k++) await solveLastPick(sim);
      await sim.locator('.btn:has-text("مقایسه کن")').click(); r.compare = await sim.locator('.sim-list li').count();
    } else if (id === 28) {
      await sim.locator('.btn:has-text("شکاف‌ها را نشانم بده")').click(); r.emptyWarn = await sim.locator('.sim-fb.no').count();
      await sim.locator('.btn:has-text("نمونهٔ پراصطلاح")').click();
      r.jar = await sim.locator('.sim-text mark.sim-m.j').count(); r.jarVague = await sim.locator('.sim-text mark.sim-m.v').count();
      await sim.locator('.btn:has-text("نمونهٔ ساده")').click();
      r.plainJar = await sim.locator('.sim-text mark.sim-m.j').count(); r.plainConn = await sim.locator('.sim-text mark.sim-m.c').count(); r.plainClean = await ok(sim);
      // ورودیِ کاربر هرگز HTML نمی‌شود
      await sim.locator('textarea').fill('<img src=x onerror="window.__x=1"> چون این یک آزمونِ کوتاه است.'); await sim.locator('.btn:has-text("شکاف‌ها را نشانم بده")').click();
      r.noInject = await p.evaluate(() => !window.__x && !document.querySelector('main .crs-sim .sim-text img'));
    } else if (id === 45) {
      for (let f = 0; f < 3; f++) {
        for (const row of await sim.locator('.crs-spot').all()) { const bt = row.locator('.btn').first(); if (await bt.count()) await bt.click(); }
        await solveLastPick(sim);
        await sim.locator('.btn:has-text("←")').click(); await p.waitForTimeout(40);
      }
      r.summary = await sim.locator('.sim-fb').count();
      r.end = await sim.locator('.btn:has-text("از اول")').count();
    } else if (id === 2) {
      await solveLastPick(sim);
      r.rows = await sim.locator('.crs-spot').count();
      for (const row of await sim.locator('.crs-spot').all()) await row.locator('.btn').last().click(); // «هیچ‌کدام» — فقط زنگ درست است
      r.bellOnly = await sim.locator('.crs-spot.ok').count();
      await solveLastPick(sim); r.assembled = await sim.locator(':text("دوباره سوار کن")').count();
    } else if (id === 4) {
      r.svg = await sim.locator('svg text').count();
      const rows = await sim.locator('.crs-spot').all();
      await rows[0].locator('.btn:has-text("مرتبط است")').click(); r.relatedFlag = await sim.locator('.sim-fb.no').count();
      r.svgLabel = await sim.locator('svg text').first().textContent();
      for (const row of rows) for (const lab of ['افزایش می‌دهد', 'کاهش می‌دهد']) { const bt = row.locator('.btn:not([disabled])', { hasText: lab }); if (await bt.count() && !(await row.evaluate(e => e.classList.contains('ok')))) await bt.click(); }
      r.allOk = await sim.locator('.crs-spot.ok').count();
      await solveLastPick(sim); r.infer = await sim.locator('.sim-q .sim-right').textContent();
    } else if (id === 1) {
      for (const row of await sim.locator('.crs-spot').all()) await row.locator('.btn').nth(1).click(); // «قیدِ واقعی …»: ب، د، ه درست
      r.right = await sim.locator('.crs-spot.ok').count();
      await solveLastPick(sim); r.test = await sim.locator(':text("آزمونِ کوچک")').count();
    } else if (id === 3) {
      await sim.locator('.btn:has-text("مرتب کن")').click();
      r.top = await sim.locator('.sim-prow.top').count();
      await solveLastPick(sim); r.k = await sim.locator('.sim-q .sim-right').first().textContent();
      await solveLastPick(sim); r.tail = await sim.locator('.sim-q').last().locator('.sim-right').textContent();
    } else if (id === 5) {
      for (let k = 0; k < 5; k++) await solveLastPick(sim);
      r.rungs = await sim.locator('.sim-rung.on:not(.mid)').count();
    }
    r.fb = await fbs(sim);
    info[id] = r;
  }
  // موبایل: هیچ سرریزِ افقی
  await p.setViewportSize({ width: 390, height: 844 });
  for (const id of IDS) {
    await open(id);
    if (id === 28) await p.locator('main .crs-sim .btn:has-text("نمونهٔ پراصطلاح")').click();
    if (id === 3) await p.locator('main .crs-sim .btn:has-text("مرتب کن")').click();
    if (id === 36) await p.evaluate(() => APP.go('lesson', 36, 's1'));
    await p.waitForTimeout(80);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (ov > 2) errors.push('mobile overflow ' + id + ' ' + ov);
  }
  await open(4); await p.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_sim4_mobile.png'), fullPage: true });
  await p.setViewportSize({ width: 1280, height: 900 });
  console.log(JSON.stringify(info, null, 1));
  if (!regs.every(Boolean)) errors.push('not registered: ' + IDS.filter((_, i) => !regs[i]).join(','));
  for (const id of IDS) if (!info[id] || !info[id].fb) errors.push('no feedback ' + id);
  const I = info;
  if (I[36] && !(I[36].closed === 1 && I[36].compare === 3)) errors.push('36 flow');
  if (I[28] && !(I[28].emptyWarn === 1 && I[28].jar === 4 && I[28].jarVague === 1 && I[28].plainJar === 0 && I[28].plainConn >= 3 && I[28].plainClean === 1 && I[28].noInject)) errors.push('28 analysis ' + JSON.stringify(I[28]));
  if (I[45] && !(I[45].end === 1)) errors.push('45 flow');
  if (I[2] && !(I[2].rows === 7 && I[2].bellOnly === 1 && I[2].assembled >= 1)) errors.push('2 flow');
  if (I[4] && !(I[4].relatedFlag === 1 && I[4].allOk === 4 && /افزایش/.test(I[4].infer || ''))) errors.push('4 flow');
  if (I[1] && !(I[1].right === 3 && I[1].test >= 1)) errors.push('1 flow ' + I[1].right);
  if (I[3] && !(I[3].top === 3 && /^۳/.test(I[3].k || '') && /رایانه/.test(I[3].tail || ''))) errors.push('3 flow');
  if (I[5] && !(I[5].rungs === 4)) errors.push('5 flow');
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
