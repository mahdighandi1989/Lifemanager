const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const browser = await chromium.launch(); const errors = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.route('**/fonts.googleapis.com/**', r => r.abort());
  await page.goto(FILE); await page.waitForSelector('.nav'); await page.waitForTimeout(300);
  const trees = await page.evaluate(() => APP.trees().length); if (trees !== 6) errors.push('seed trees ' + trees);
  // topic with kind -> nursery
  await page.evaluate(() => APP.go('topics'));
  await page.fill('#ntTitle', 'چرا مشتق یعنی شیب لحظه‌ای؟'); await page.selectOption('#ntKind', { index: 2 });
  await page.click('main .btn:has-text("ساخت و شروع")');
  const nn = await page.evaluate(() => APP.nurseryNew().length); if (nn < 1) errors.push('nursery not fed');
  await page.waitForSelector('.pipe');
  // open P11 from pipeline
  await page.click('.pstep .tlink.proto:has-text("بیان دیگر")');
  await page.waitForSelector('[data-k="descent"]');
  const fruitVal = await page.inputValue('[data-k="fruit"] input'); if (!fruitVal) errors.push('P11 fruit not preset');
  await page.fill('[data-k="tree"] input', 'ریاضیات');
  await page.fill('[data-k="naive"] textarea', 'اول سرعت متوسط را حساب می‌کردم چون فاصله تقسیم بر زمان است');
  const rows = page.locator('[data-k="descent"] tbody tr');
  const vals = [['زیرشاخه','حد','نیاز به سرعت در یک لحظه','وقتی بازه کوچک شود','پیوستگی','عکاسی با سرعت بالا'],['شاخه','آنالیز','کنترل بی‌نهایت کوچک','حد پایه مشتق است','انتگرال','تقریب'],['ریشه','تغییر و اندازه','پیش‌بینی حرکت','همه از اندازه تغییر','هندسه','قدم‌شماری']];
  for (let r = 0; r < 3; r++) { const cells = rows.nth(r).locator('select, textarea'); await cells.nth(0).selectOption(vals[r][0]); for (let c = 1; c < 6; c++) await cells.nth(c).fill(vals[r][c]); }
  await page.fill('[data-k="rootEls"] textarea', 'چیزها تغییر می‌کنند و می‌شود تغییر را با مقایسه دو لحظه سنجید');
  await page.fill('[data-k="trunk"] input >> nth=0', 'حد');
  await page.click('main .btn:has-text("حالت بازسازی")');
  if (await page.locator('[data-k="descent"]').isVisible()) errors.push('recon mode did not hide');
  const tas = page.locator('[data-k="ascent"] textarea'); for (let i = 0; i < 3; i++) await tas.nth(i).fill('پله ' + i + ' چون مجبور شدم');
  await page.click('[data-k="cmp"] button:has-text("باز کردن")'); await page.fill('[data-k="cmp"] textarea', 'پله حد را جا انداختم');
  const ot = page.locator('[data-k="other"] tbody textarea'); const oc = await ot.count(); for (let i = 0; i < oc; i++) await ot.nth(i).fill('انتگرال');
  await page.fill('[data-k="seed"] textarea', 'نیاز: تغییر لحظه‌ای؛ روش: کوچک کردن بازه؛ بینش: حد');
  const segs = page.locator('.rrow .seg'); const sc = await segs.count(); if (sc !== 8) errors.push('P11 rubric count ' + sc);
  for (let i = 0; i < sc; i++) await segs.nth(i).locator('.sg').nth(1).click();
  await page.click('main .btn:has-text("ثبت نهایی")'); await page.waitForTimeout(100);
  await page.click('main .btn:has-text("کاشت در مزرعه")');
  await page.waitForSelector('.dialog');
  await page.click('.dialog .btn:has-text("کاشت")');
  await page.waitForTimeout(200);
  const nodes = await page.evaluate(() => APP.S.all('fnode').length); if (nodes !== 4) errors.push('planted nodes ' + nodes);
  if (!(await page.locator('.tsvg').count())) errors.push('tree svg missing');
  if (!(await page.locator('#npanel').count())) errors.push('node panel missing');
  // nursery placement merge
  await page.evaluate(() => APP.go('farm', null, 'nursery'));
  await page.click('.nrow .btn:has-text("جای‌گذاری") >> nth=0');
  await page.waitForSelector('.dialog'); await page.click('.dialog #pdm2'); 
  await page.selectOption('#pdM', { index: 1 }); await page.click('.dialog .btn:has-text("کاشت")'); await page.waitForTimeout(100);
  // tabs
  for (const t of ['گره‌های باز', 'کود', 'منطق مزرعه', 'درخت‌ها']) { await page.click(`.tab:has-text("${t}")`); await page.waitForTimeout(60); }
  // passport -> tree
  await page.evaluate(() => APP.startProto('P6'));
  await page.fill('[data-k="sci"] input', 'آمار'); await page.fill('[data-k="s1"] textarea', 'نیاز دولت‌ها به شمارش'); await page.fill('[data-k="s2"] textarea', 'چگونه از نمونه درباره کل حکم کنیم؟'); await page.fill('[data-k="s3"] textarea', 'توزیع نمونه‌گیری'); await page.fill('[data-k="s5"] textarea', 'میانگین، واریانس، آزمون فرض'); await page.fill('[data-k="s9"] textarea', 'استنباط علّی از داده مشاهده‌ای');
  await page.click('main .btn:has-text("ثبت نهایی")'); await page.waitForTimeout(100);
  const st = await page.evaluate(() => { const t = APP.trees().filter(x => x.name === 'آمار')[0]; return t ? APP.tnodes(t.id).length : -1; }); if (st < 5) errors.push('passport tree nodes ' + st);
  // graft tree
  await page.evaluate(() => APP.go('farm')); await page.fill('#ntrN', 'هوش مصنوعی'); await page.selectOption('#ntrK', 'graft'); await page.click('main .btn:has-text("کاشت درخت")');
  await page.selectOption('#trPar', { index: 1 });
  // concerns & map flow & technique source
  await page.evaluate(() => APP.go('concerns', 'c21')); if (!(await page.locator('#cc_c24').count())) errors.push('new concerns missing');
  await page.evaluate(() => APP.go('map'));
  await page.evaluate(() => APP.go('tech', 28, 'do')); if (!(await page.locator('.srcsec').count())) errors.push('source section missing'); if (await page.locator('details.gen').count()) errors.push('market/bank example should be hidden by default');
  await page.evaluate(() => { const st = APP.S.settings(); st.showMarketEx = true; APP.S.saveSettings(st); APP.go('tech', 28, 'do'); }); if (!(await page.locator('details.gen').count())) errors.push('gen example missing (setting on)');
  await page.evaluate(() => { const st = APP.S.settings(); st.showMarketEx = false; APP.S.saveSettings(st); });
  if (await page.evaluate(() => /حد ضرر|اکسپرت/.test(APP.topicSelect('', () => {}).textContent))) errors.push('market sample topic still offered in topic selects');
  if (await page.evaluate(() => [3, 4, 5].some(() => false) || /ترید، پرونده وثیقه/.test(document.body.innerHTML))) errors.push('worksheet start card still mentions trading');
  await page.evaluate(() => APP.go('tech', 40, 'und'));
  // pipeline status
  const ps = await page.evaluate(() => { const t = APP.S.all('topic', x => !x.sample)[0]; const s = APP.pipelineStatus(t); return ['S1','S4','S5','S7','S8','S9'].map(k => k + ':' + s[k]).join(' '); });
  console.log(ps);
  await page.evaluate(() => { const t = APP.S.all('topic', x => !x.sample)[0]; APP.go('topic', t.id); });
  await page.screenshot({ path: __dirname + '/../dist/shot_pipe.png' });
  await page.evaluate(() => { const t = APP.trees().filter(x => x.name === 'ریاضیات')[0]; APP.farmSel = null; APP.go('farm', t.id, 'tree'); });
  await page.screenshot({ path: __dirname + '/../dist/shot_tree.png' });
  await page.evaluate(() => APP.go('farm', null, 'logic')); await page.screenshot({ path: __dirname + '/../dist/shot_logic.png' });
  await page.setViewportSize({ width: 400, height: 800 }); await page.evaluate(() => APP.go('farm'));
  const ow = await page.evaluate(() => document.documentElement.scrollWidth); if (ow > 402) errors.push('mobile overflow farm ' + ow);
  await browser.close(); console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
})();
