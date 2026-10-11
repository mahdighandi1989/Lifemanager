const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  for (const mode of ['local', 'gas']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on('pageerror', e => errors.push(mode + ' pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push(mode + ' console: ' + m.text()); });
    await page.route('**/fonts.googleapis.com/**', r => r.abort());
    if (mode === 'gas') {
      await page.addInitScript(() => {
        const db = {};
        const mk = () => {
          const o = { _s: null, _f: null };
          o.withSuccessHandler = f => { o._s = f; return o; };
          o.withFailureHandler = f => { o._f = f; return o; };
          const call = fn => (...a) => setTimeout(() => { try { const r = fn(...a); o._s && o._s(r); } catch (e) { o._f && o._f(e); } }, 5);
          o.api_load = call(() => JSON.stringify(Object.values(db)));
          o.api_saveMany = call(j => { JSON.parse(j).forEach(r => db[r.id] = r); window.__saved = (window.__saved || 0) + 1; return 1; });
          o.api_delete = call(id => { delete db[id]; });
          o.api_getAI = call(() => JSON.stringify({ provider: 'gemini', model: 'gemini-2.5-flash', hasKey: false }));
          o.api_ai = call(() => '**نمره روبریک**\n- معیار ۱: ۲\nپرسش‌ها: ...');
          o.api_setAI = call(() => true); o.api_dbUrl = call(() => 'https://sheet');
          o.installDailyReminder = call(() => 'ok'); o.removeDailyReminder = call(() => 'ok'); o.sendReminderNow = call(() => 'ok');
          return o;
        };
        window.google = { script: { get run() { return mk(); } } };
        window.__db = db;
      });
    }
    await page.goto(FILE);
    await page.waitForSelector('.nav');
    await page.waitForTimeout(300);
    const views = ['home', 'map', 'lib', 'topics', 'protos', 'review', 'concerns', 'atlas', 'base', 'settings'];
    for (const v of views) { await page.click(`.nav[data-v="${v}"]`); await page.waitForTimeout(80); }
    // map subtabs
    await page.click('.nav[data-v="map"]');
    for (const t of ['جریان ۹ فازی', 'شبکه روابط', 'برنامه ۸ هفته‌ای و اولویت‌ها']) { await page.click(`.tab:has-text("${t}")`); await page.waitForTimeout(80); }
    await page.click('.tab:has-text("شبکه روابط")');
    await page.click('g.nn >> nth=10'); await page.waitForTimeout(100);
    const info = await page.locator('.netinfo').count();
    if (!info) errors.push(mode + ' net info panel missing');
    // all techniques all tabs
    const n = await page.evaluate(() => APP.T.length);
    if (n !== 45) errors.push('tech count ' + n);
    for (let id = 1; id <= 45; id++) {
      for (const sub of ['und', 'do', 'rel', 'ws', 'hist']) {
        await page.evaluate(([id, sub]) => APP.go('tech', id, sub), [id, sub]);
        const bad = await page.locator('main .card.bad').count();
        if (bad) errors.push(mode + ` render error tech ${id} ${sub}: ` + await page.locator('main .card.bad').innerText());
      }
      // start an exercise and fill everything
      await page.evaluate(id => { const e = APP.newEx(id, ''); APP.go('tech', id, 'ws:' + e.id); }, id);
      const flds = await page.evaluate(id => APP.TM[id].ws.map(f => [f.k, f.t, f.after || '']), id);
      for (const [k, t] of flds) {
        const box = page.locator(`.fld[data-k="${k}"]`).first();
        if (t === 'text') await box.locator('input').first().fill('آزمون ' + k);
        else if (t === 'area') await box.locator('textarea').first().fill('چون الف باعث ب می‌شود، بنابراین ج. ATR سیستم ' + k);
        else if (t === 'list') { const ins = box.locator('input'); const c = await ins.count(); for (let i = 0; i < c; i++) await ins.nth(i).fill('مورد ' + i); }
        else if (t === 'chain') { const tas = box.locator('textarea'); const c = await tas.count(); for (let i = 0; i < c; i++) await tas.nth(i).fill('چون ' + i); }
        else if (t === 'table') {
          const rows = box.locator('tbody tr'); const rc = await rows.count();
          for (let r = 0; r < rc; r++) {
            const cells = rows.nth(r).locator('textarea, input, select');
            const cc = await cells.count();
            for (let c = 0; c < cc; c++) {
              const el = cells.nth(c); const tag = await el.evaluate(e => e.tagName + ':' + (e.type || ''));
              if (tag.startsWith('SELECT')) { const opts = await el.locator('option').allTextContents(); await el.selectOption({ index: r % 2 === 0 ? 1 : Math.min(2, opts.length - 1) }); }
              else if (tag.includes('number')) await el.fill(String(40 + r * 15));
              else await el.fill('ردیف ' + r + ' ستون ' + c);
            }
          }
        }
        else if (t === 'sel') await box.locator('select').selectOption({ index: 1 });
        else if (t === 'checks') await box.locator('input').first().check();
        else if (t === 'scale') await box.locator('input[type=range]').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input',{bubbles:true}))});
        else if (t === 'tree') await box.locator('textarea').fill('ریشه\n  شاخه\n    برگ\n  شاخه۲');
        else if (t === 'graph') await box.locator('textarea').fill('الف -> ب : برچسب\nب +> ج\nج !> الف');
        else if (t === 'timer') { await box.locator('button').first().click(); await page.waitForTimeout(1100); await box.locator('button').first().click(); }
        else if (t === 'draw') { const cv = box.locator('canvas'); const bb = await cv.boundingBox(); await page.mouse.move(bb.x + 20, bb.y + 20); await page.mouse.down(); await page.mouse.move(bb.x + 120, bb.y + 80); await page.mouse.up(); }
      }
      // unlock locks
      for (const [k, t] of flds) if (t === 'lock') {
        const box = page.locator(`.fld[data-k="${k}"]`).first();
        const btn = box.locator('button:has-text("باز کردن")');
        if (await btn.count()) { if (await btn.isDisabled()) errors.push(mode + ` tech ${id} lock ${k} still disabled`); else { await btn.click(); await box.locator('textarea').fill('مقایسه ' + k); } }
      }
      // rubric
      const segs = page.locator('.rrow .seg'); const sc = await segs.count();
      for (let i = 0; i < sc; i++) await segs.nth(i).locator('.sg').nth(2).click();
      await page.click('.actions .btn:has-text("ثبت")');
      await page.waitForTimeout(60);
      const st = await page.evaluate(id => { const e = APP.S.all('ex', x => x.tid === id && !x.sample)[0]; return e && e.status; }, id);
      if (st !== 'done') { const miss = await page.locator('.fld.missing .flabel').allTextContents(); errors.push(mode + ` tech ${id} not done; missing: ` + miss.join(' | ')); }
      // check computed widgets have content
      for (const [k, t] of flds) if (['jargon', 'pareto', 'calib'].includes(t)) {
        const txt = await page.locator(`.fld[data-k="${k}"] .analyzer`).innerText();
        if (/دست‌کم دو ردیف|وقتی نتیجه|وقتی توضیحت/.test(txt)) errors.push(mode + ` tech ${id} analyzer ${t} empty: ` + txt.slice(0, 80));
      }
      // card button
      if (id === 28 || id === 12) {
        const cb = page.locator('.actions .btn:has-text("ساخت کارت مرور")');
        if (await cb.count()) { await cb.click(); await page.click('.dialog .btn:has-text("ساخت کارت")'); }
        if (mode === 'gas') { await page.click('.actions .btn:has-text("نقد منتقد")'); await page.waitForTimeout(150); if (!(await page.locator('.aibox:not(.hidden)').count())) errors.push('ai box not shown'); }
      }
    }
    // protocols
    for (const pid of ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9']) {
      await page.evaluate(pid => APP.startProto(pid), pid);
      const flds = await page.evaluate(pid => APP.PM[pid].ws.map(f => [f.k, f.t]), pid);
      for (const [k, t] of flds) {
        const box = page.locator(`.fld[data-k="${k}"]`).first();
        if (t === 'text') await box.locator('input').fill('آزمون');
        else if (t === 'area') await box.locator('textarea').fill('چون الف بنابراین ب');
        else if (t === 'list') { const ins = box.locator('input'); const c = await ins.count(); for (let i = 0; i < c; i++) await ins.nth(i).fill('مورد ' + i); }
        else if (t === 'sel') await box.locator('select').selectOption({ index: 1 });
        else if (t === 'scale') await box.locator('input[type=range]').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input',{bubbles:true}))});
        else if (t === 'table') { const cells = box.locator('tbody textarea'); const c = await cells.count(); for (let i = 0; i < c; i++) await cells.nth(i).fill('x'); }
        else if (t === 'graph') await box.locator('textarea').fill('الف -> ب');
      }
      for (const [k, t] of flds) if (t === 'lock') { const b = page.locator(`.fld[data-k="${k}"] button:has-text("باز کردن")`); if (await b.count() && !(await b.isDisabled())) await b.click(); }
      await page.click('main .btn:has-text("ثبت نهایی")');
      await page.waitForTimeout(60);
      const ok = await page.evaluate(pid => APP.S.all('pr', r => r.pid === pid && r.status === 'done').length, pid);
      if (!ok) errors.push(mode + ' protocol not completed ' + pid);
      if (pid === 'P3') { await page.click('main .btn:has-text("زمان‌بندی روز")'); await page.click('main .btn:has-text("ساخت کارت از شکاف")'); }
    }
    // topics
    await page.evaluate(() => APP.go('topics'));
    await page.fill('#ntTitle', 'موضوع آزمون'); await page.click('main .btn:has-text("ساخت و شروع")');
    await page.click('main .btn:has-text("شروع چرخه")');
    await page.click('.tphase .tlink >> nth=0');
    // review session
    await page.evaluate(() => APP.go('review'));
    for (let i = 0; i < 3; i++) {
      if (!(await page.locator('.flash .btn:has-text("نمایش پاسخ")').count())) break;
      await page.fill('#rvAtt', 'پاسخ'); await page.click('.flash .btn:has-text("نمایش پاسخ")'); await page.click('.grades .g4');
    }
    for (const t of ['تمرین درهم‌تنیده', 'همه کارت‌ها', 'کالیبراسیون']) { await page.click(`.tab:has-text("${t}")`); await page.waitForTimeout(60); }
    // other tabs
    for (const [v, tabs] of [['atlas', ['علوم و شناسنامه‌ها', 'حوزه‌های زیسته', 'ساختارهای مادر']], ['base', ['ستون‌های علمی', 'ریشه‌ها و لایه‌ها', 'نگاشت فهرست پاورپوینت']], ['protos', ['صف منابع و رژیم داده']]]) {
      await page.evaluate(v => APP.go(v), v);
      for (const t of tabs) { await page.click(`.tab:has-text("${t}")`); await page.waitForTimeout(50); }
    }
    await page.evaluate(() => APP.go('concerns', 'c7'));
    await page.evaluate(() => APP.go('home'));
    await page.waitForTimeout(1200);
    const stats = await page.evaluate(() => ({ recs: Object.keys(APP.S.recs).length, saved: window.__saved || 0, db: window.__db ? Object.keys(window.__db).length : null }));
    console.log(mode, JSON.stringify(stats));
    if (mode === 'local') {
      await page.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_home.png'), fullPage: false });
      await page.evaluate(() => APP.go('tech', 28, 'ws'));
      await page.evaluate(() => { const e = APP.S.all('ex', x => x.tid === 28 && !x.sample)[0]; APP.go('tech', 28, 'ws:' + e.id); });
      await page.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_ws.png'), fullPage: false });
      await page.evaluate(() => { APP.netSel = 28; APP.go('map', null, 'net'); });
      await page.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_net.png'), fullPage: false });
      await page.setViewportSize({ width: 400, height: 800 });
      await page.evaluate(() => APP.go('tech', 12, 'und'));
      const ow = await page.evaluate(() => document.documentElement.scrollWidth);
      if (ow > 402) errors.push('mobile overflow ' + ow);
      await page.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_mobile.png') });
      await page.emulateMedia({ colorScheme: 'dark' }); await page.setViewportSize({ width: 1280, height: 900 });
      await page.evaluate(() => APP.go('tech', 24, 'ws'));
      await page.evaluate(() => { const e = APP.S.all('ex', x => x.tid === 24 && !x.sample)[0]; APP.go('tech', 24, 'ws:' + e.id); });
      await page.screenshot({ path: path.join(__dirname, '..', 'dist', 'shot_dark.png'), fullPage: true });
      // reload persistence
      const before = await page.evaluate(() => Object.keys(APP.S.recs).length);
      await page.reload(); await page.waitForSelector('.nav'); await page.waitForTimeout(300);
      const after = await page.evaluate(() => Object.keys(APP.S.recs).length);
      if (before !== after) errors.push('persistence mismatch ' + before + ' vs ' + after);
    }
    if (mode === 'gas') {
      // reload with db persisted in mock? mock is per page; check db has records
      const dbn = await page.evaluate(() => Object.keys(window.__db).length);
      if (dbn < 50) errors.push('gas db too small ' + dbn);
    }
    await page.close();
  }
  await browser.close();
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
})();
