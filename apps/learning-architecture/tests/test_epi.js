const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const browser = await chromium.launch(); const errors = []; const info = {};
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.route('**/fonts.googleapis.com/**', r => r.abort());
  await page.goto(FILE); await page.waitForSelector('.nav'); await page.waitForTimeout(300);
  // system switch
  await page.click('.sysb[data-sys="epi"]'); await page.waitForTimeout(100);
  const navState = await page.evaluate(() => [...document.querySelectorAll('.navlist[data-sys]')].map(l => l.dataset.sys + ':' + l.hidden));
  if (navState.join() !== 'learn:true,epi:false') errors.push('nav switch ' + navState);
  // new case
  await page.fill('#ncT', 'وثیقه ملک'); await page.fill('#ncI', 'کارشناس گفته ارزش ملک وثیقه ۱۲ میلیون درهم است و همکارم یادش هست که سال پیش همین مقدار بوده.');
  await page.selectOption('#ncK', 'گزارش کارشناسی/نظر متخصص');
  await page.click('main .btn:has-text("ورود به کارخانه")'); await page.waitForSelector('.strun');
  async function fillStation() {
    const flds = page.locator('.strun .ws > .fld.req');
    const n = await flds.count();
    for (let i = 0; i < n; i++) {
      const f = flds.nth(i); const cls = await f.getAttribute('class'); const k = await f.getAttribute('data-k');
      if (/fld-sel/.test(cls)) await f.locator('select').selectOption({ index: 1 });
      else if (/fld-text/.test(cls)) await f.locator('input').fill('متن آزمایشی ' + k);
      else if (/fld-area|fld-lock/.test(cls)) { const b = f.locator('button:has-text("باز کردن")'); if (await b.count()) { if (await b.isEnabled()) await b.click(); } const ta = f.locator('textarea'); if (await ta.count()) await ta.first().fill('متن آزمایشی ' + k); }
      else if (/fld-checks/.test(cls)) await f.locator('input[type=checkbox]').first().check();
      else if (/fld-list/.test(cls)) await f.locator('input').first().fill('مورد ' + k);
      else if (/fld-chain|fld-tree|fld-graph/.test(cls)) await f.locator('textarea').first().fill('الف -> ب');
      else if (/fld-scale/.test(cls)) await f.locator('input[type=range]').evaluate(e => { e.value = 3; e.dispatchEvent(new Event('input', { bubbles: true })); });
      else if (/fld-table/.test(cls)) {
        const row = f.locator('tbody tr').first(); const cells = row.locator('select, textarea, input');
        const cc = await cells.count();
        for (let c = 0; c < cc; c++) { const el = cells.nth(c); const tag = await el.evaluate(e => e.tagName + ':' + (e.type || ''));
          if (tag.startsWith('SELECT')) { const opts = await el.locator('option').count(); if (opts > 1) await el.selectOption({ index: 1 }); }
          else if (tag === 'INPUT:number') await el.fill('70'); else await el.fill('سطر ' + k); }
      }
    }
  }
  const visited = [];
  for (let step = 0; step < 40; step++) {
    const name = await page.locator('.strun h2').first().textContent(); visited.push(name);
    if (name === 'تصور یا تصدیق') {
      await fillStation();
      const t = page.locator('[data-k="claims"]'); await t.locator('button:has-text("+ ردیف")').click();
      const r2 = t.locator('tbody tr').nth(1); await r2.locator('textarea').first().fill('ارزش سال پیش هم ۱۲ میلیون بوده');
      await page.locator('[data-k="claims"] tbody tr').first().locator('textarea').first().fill('ارزش ملک ۱۲ میلیون درهم است');
    } else if (name === 'راه معرفت هر تصدیق') {
      await fillStation();
      const t = page.locator('[data-k="ways"]');
      await t.locator('tbody tr').first().locator('select').nth(0).selectOption('1');
      await t.locator('tbody tr').first().locator('select').nth(1).selectOption('تخصص دیگران');
      await t.locator('button:has-text("+ ردیف")').click();
      await t.locator('tbody tr').nth(1).locator('select').nth(0).selectOption('2');
      await t.locator('tbody tr').nth(1).locator('select').nth(1).selectOption('یادآوری');
    } else if (name === 'حکم نهایی و پیگیری') {
      await fillStation();
      await page.fill('[data-k="revdate"] input', await page.evaluate(() => APP.today()));
      await page.locator('[data-k="final"] tbody tr').first().locator('input[inputmode=decimal]').fill('65');
    } else await fillStation();
    const btn = page.locator('.strun > .row .btn').filter({ hasText: 'ثبت' }).first(); const label = await btn.textContent();
    await btn.click(); await page.waitForTimeout(80);
    if (await page.locator('.toast.bad').count()) { errors.push('validation at ' + name + ': ' + await page.locator('.toast.bad').last().textContent()); break; }
    if (/ثبت و گزارش/.test(label)) break;
  }
  info.visited = visited;
  const cs = await page.evaluate(() => { const c = APP.S.all('case')[0]; return { route: APP.routeOf(c).filter(x => x.inRoute).map(x => x.s.id), status: c.status, done: Object.keys(c.st).filter(k => c.st[k].done).length }; });
  info.route = cs.route.join(','); info.status = cs.status;
  if (cs.route.indexOf('st_expert') < 0 || cs.route.indexOf('st_yad') < 0) errors.push('way stations not auto-routed');
  if (cs.route.indexOf('st_herm') >= 0) errors.push('suggested station auto-included');
  if (!await page.locator('pre.rep').count()) errors.push('report not shown');
  console.log(JSON.stringify(info), errors.join(" | "), JSON.stringify(await page.evaluate(() => { const c = APP.S.all("case")[0]; return c.st.st_final; })));
  // outcome -> calibration
  await page.evaluate(() => { const c = APP.S.all('case')[0]; APP.go('e_case', c.id, 'st_final'); });
  await page.waitForSelector('.agg');
  const aggRows = await page.locator('.agg tbody tr').count(); if (aggRows !== 2) errors.push('agg rows ' + aggRows);
  await page.locator('.card.soft select').first().selectOption('درست');
  const cp = await page.evaluate(() => APP.calibPoints().filter(p => p.src === 'case').length); if (cp !== 1) errors.push('calib case pts ' + cp);
  // conditional add/remove
  await page.click('.rtr:has-text("فهم متن و گوینده") .ib'); await page.waitForTimeout(80);
  const inc = await page.evaluate(() => APP.routeOf(APP.S.all('case')[0]).filter(x => x.s.id === 'st_herm')[0].inRoute); if (!inc) errors.push('manual include failed');
  // quick case + religion
  const q = await page.evaluate(() => { const c = APP.newCase({ title: 'q', input: 'x', mode: 'quick' }); return APP.routeOf(c).filter(x => x.inRoute).map(x => x.s.id); });
  if (q.indexOf('st_worlds') >= 0 || q.indexOf('st_tasdiq') < 0) errors.push('quick route ' + q);
  const rel = await page.evaluate(() => { const c = APP.newCase({ title: 'r', input: 'x', special: 'دین (معرفت‌شناسی دین)' }); return APP.routeOf(c).filter(x => x.inRoute).map(x => x.s.id); });
  if (rel.indexOf('st_r_struct') < 0 || rel.indexOf('st_r_plural') >= 0) errors.push('religion route ' + rel);
  // all station pages and tabs
  const sids = await page.evaluate(() => APP.ESTL.map(s => s.id)); info.stations = sids.length;
  for (const sid of sids) for (const tb of ['why', 'how', 'text', 'ex', 'drill', 'rel', 'riv', 'hist']) {
    await page.evaluate(([a, b]) => APP.go('e_st', a, b), [sid, tb]);
    if (await page.locator('main .card.bad').count()) errors.push('render ' + sid + ' ' + tb);
    if (tb === 'text') { const ok = await page.locator('main .epibook h3').count(); if (!ok) errors.push('no booklet text ' + sid); }
  }
  // drill
  await page.evaluate(() => APP.go('e_st', 'st_tasdiq', 'drill'));
  const items = page.locator('.ditem'); const ni = await items.count();
  for (let i = 0; i < ni; i++) await items.nth(i).locator('.dopt').first().click();
  const dr = await page.evaluate(() => APP.S.all('edrill').length); if (dr !== 1) errors.push('drill not recorded');
  // concepts, plant
  await page.evaluate(() => APP.go('e_concepts')); await page.fill('#coQ', 'حضوری'); await page.waitForTimeout(300);
  const nco = await page.locator('details.co').count(); if (!nco) errors.push('concept search empty');
  await page.locator('details.co').first().locator('summary').click();
  await page.locator('details.co').first().locator('.btn:has-text("کاشت در مزرعه")').click();
  const ns = await page.evaluate(() => APP.nurseryNew().filter(x => x.src && x.src.t === 'eco').length); if (ns !== 1) errors.push('concept not planted');
  // book + coverage
  await page.evaluate(() => APP.go('e_book')); await page.waitForTimeout(200);
  const ub = await page.locator('.usebar').count(); const warn = await page.locator('.usebar:has-text("هنوز جایی")').count(); info.usebars = ub; if (ub !== 72 || warn) errors.push('usebar ' + ub + ' missing ' + warn);
  await page.locator('.epibook a[data-eb^="s"]').first().click(); await page.waitForTimeout(100);
  await page.evaluate(() => APP.go('e_cov')); const bad = await page.locator('table.cov tr.bad').count(); if (bad) errors.push('coverage gaps ' + bad);
  await page.evaluate(() => APP.go('e_cov', null, 'notes'));
  for (const v of ['e_map', 'e_st', 'e_dos', 'e_cases', 'e_home']) { await page.evaluate(x => APP.go(x), v); if (await page.locator('main .card.bad').count()) errors.push('render ' + v); }
  // farm bridge
  const fromFarm = await page.evaluate(() => { const t = APP.trees()[0]; const n = APP.newNode({ tree: t.id, layer: 'fruit', title: 'بازار همیشه به میانگین برمی‌گردد' }); APP.farmSel = n.id; APP.go('farm', t.id, 'tree'); return n.id; });
  await page.waitForSelector('#npanel');
  await page.click('#npanel .btn:has-text("اعتبارسنجی در کارخانه")'); await page.waitForSelector('.strun');
  const fc = await page.evaluate(id => APP.S.all('case').filter(c => c.src && c.src.id === id).length, fromFarm); if (fc !== 1) errors.push('farm bridge');
  // technique relations show stations
  await page.evaluate(() => APP.go('tech', 24, 'rel')); const stl = await page.locator('main .tlink.epist').count(); if (!stl) errors.push('tech->station links missing');
  // learning nav back
  await page.click('.sysb[data-sys="learn"]'); await page.waitForTimeout(80);
  const hidden = await page.evaluate(() => document.querySelector('.navlist[data-sys="epi"]').hidden); if (!hidden) errors.push('epi nav still visible');
  // mobile render
  await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => APP.go('e_case', APP.S.all('case')[0].id));
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov > 2) errors.push('mobile overflow ' + ov);
  await page.screenshot({ path: __dirname + '/../dist/shot_epi_mobile.png' });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => APP.go('e_map')); await page.screenshot({ path: __dirname + '/../dist/shot_epi_map.png', fullPage: false });
  await page.evaluate(() => APP.go('e_case', APP.S.all('case').filter(c => c.title === 'وثیقه ملک')[0].id, 'st_final')); await page.screenshot({ path: __dirname + '/../dist/shot_epi_case.png' });
  await page.evaluate(() => APP.go('e_book', 's11')); await page.waitForTimeout(200); await page.screenshot({ path: __dirname + '/../dist/shot_epi_book.png' });
  console.log(JSON.stringify(info));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await browser.close();
})();
