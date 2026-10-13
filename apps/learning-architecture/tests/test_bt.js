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
  const bad = async (lab) => { if (await page.locator('main .card.bad').count()) errors.push('render ' + lab); };
  // home triggers first cycle
  await page.evaluate(() => APP.go('e_home')); await page.waitForTimeout(200);
  info.cycles = await page.evaluate(() => (APP.S.get('ecycle') || {}).runs || 0); if (info.cycles !== 1) errors.push('auto cycle ' + info.cycles);
  // three tests
  await page.evaluate(() => APP.go('e_bt')); await page.waitForSelector('section.test', { timeout: 30000 });
  info.tests = await page.locator('section.test').count(); if (info.tests !== 3) errors.push('three tests ' + info.tests);
  info.recipe = (await page.locator('section.test .pill').allTextContents()).join(' | ');
  for (const enc of ['B', 'F']) { await page.selectOption('#btEnc', enc); await page.waitForSelector('section.test'); info['v' + enc] = (await page.locator('section.test .pill').allTextContents()).join(' | '); }
  await page.selectOption('#btEnc', 'A'); await page.waitForSelector('section.test');
  await page.evaluate(() => APP.go('e_bt', null, 'sens')); await bad('sens'); info.sensRows = await page.locator('main tbody tr').count();
  for (const tb of ['cycle', 'enc', 'hist', 'about']) { await page.evaluate(t => APP.go('e_bt', null, t), tb); await bad('e_bt ' + tb); }
  await page.evaluate(() => APP.go('e_bt', null, 'cycle')); await page.click('main .btn:has-text("اجرای یک دوره اکنون")'); await page.waitForTimeout(1500);
  info.cycles2 = await page.evaluate(() => APP.S.get('ecycle').runs);
  // library
  await page.evaluate(() => APP.go('e_lib')); await page.waitForTimeout(300); info.libRows = await page.locator('main tbody tr').count();
  await page.selectOption('#lbM', 'bad'); await page.waitForTimeout(200); info.badRows = await page.locator('main tbody tr').count();
  await page.selectOption('#lbM', ''); await page.locator('main tbody tr .linkish').first().click(); await page.waitForSelector('.eng'); await bad('case detail');
  // add case
  await page.evaluate(() => APP.go('e_lib', null, 'add'));
  const inputs = page.locator('main section.card input[type=text]'); await inputs.nth(0).fill('آزمون افزودن پرونده');
  await page.locator('main details input[type=text]').first().fill('این وام بازپرداخت می‌شود چون مشتری همیشه خوش‌حساب بوده');
  await page.selectOption('#fe_k1_way', 'استقراء'); await page.selectOption('#fe_k1_ind_complete', '0'); await page.fill('#fe_k1_conf', '98');
  await page.locator('main .checks input').nth(5).check();
  await page.click('main .btn:has-text("ثبت پرونده")'); await page.waitForSelector('.eng');
  info.added = await page.evaluate(() => APP.S.all('ecase').length);
  // pending queue via fake AI record
  await page.evaluate(() => { APP.S.put({ id: 'ecase_test_p', type: 'ecase', kind: 'real', by: 'ai', status: 'pending', title: 'پیشنهاد آزمایشی', dom: 'علم', year: 2000, grp: 'g', story: 's', actor: 'a', claims: [{ id: 'k1', txt: 't', f: { way: 'نقل' }, truth: null }], truth: { ok: true, fail: [] } }); APP.go('e_lib', null, 'pending'); });
  await page.locator('main tbody tr .linkish').first().click(); await page.click('main .btn:has-text("تأیید و ورود به بک‌تست")'); await page.waitForTimeout(200);
  info.approved = await page.evaluate(() => APP.S.get('ecase_test_p').status);
  // autopsy
  await page.evaluate(() => APP.go('e_aut')); await page.waitForTimeout(300); await bad('aut');
  const nAut = await page.locator('main .btn:has-text("ثبت علت")').count(); info.autItems = nAut;
  if (nAut) { await page.locator('main section.card select').first().selectOption({ index: 0 }); await page.locator('main section.card textarea').first().fill('آزمون: ایراد جزوه'); await page.locator('main .btn:has-text("ثبت علت")').first().click(); await page.waitForTimeout(200); }
  info.eaut = await page.evaluate(() => APP.S.all('eaut').length);
  // living booklet
  await page.evaluate(() => APP.go('e_living')); await page.waitForTimeout(300); await bad('living'); info.lrules = await page.locator('.lrule').count();
  info.livingVers = await page.evaluate(() => APP.S.all('eliving').length);
  // booklet reader shows rule chips / errata
  await page.evaluate(() => APP.go('e_book')); await page.waitForTimeout(400); info.ruleChipsInBook = await page.locator('.usebar .tlink.rule').count();
  info.errataInBook = await page.locator('.usebar .chip.bad').count();
  // problems
  await page.evaluate(() => APP.go('e_prob')); info.probs = await page.locator('main .card').count();
  for (const tb of ['about', 'path', 'dead', 'drills', 'lessons', 'cases']) { await page.evaluate(t => APP.go('e_prob', 'pb_flt', t), tb); await bad('prob ' + tb); }
  await page.evaluate(() => APP.go('e_prob', 'pb_flt', 'sim'));
  // level 1: answer all stages picking correct after trying
  for (let i = 0; i < 20; i++) {
    if (await page.locator('.verdict:has-text("پایان سطح")').count()) break;
    const opts = page.locator('.simcard .dopt'); const n = await opts.count();
    for (let j = 0; j < n; j++) { const o = opts.nth(j); if (await o.isDisabled()) continue; await o.click(); if (await page.locator('.simcard .btn:has-text("گام بعد"), .simcard .btn:has-text("پایان سطح")').count()) break; }
    await page.locator('.simcard .btn:has-text("گام بعد"), .simcard .btn:has-text("پایان سطح")').first().click();
  }
  info.simDone = await page.locator('.verdict:has-text("پایان سطح")').count();
  info.prog = await page.evaluate(() => Object.keys((APP.S.get('eprog_pb_flt') || { lv: {} }).lv[1] || {}).length);
  // master level forced
  await page.evaluate(() => { APP.simState = { pid: 'pb_flt', lv: 4, order: 'h2e', i: 0 }; APP.go('e_prob', 'pb_flt', 'sim'); });
  await page.fill('.simcard textarea', 'به نظرم باید مسئله را به یک حدس عمیق‌تر در نظریه اعداد گره زد'); await page.click('.simcard .btn:has-text("ثبت و مقایسه")'); await page.click('.simcard .btn:has-text("۲ کامل")'); await page.waitForTimeout(100);
  info.master = await page.evaluate(() => Object.keys((APP.S.get('eprog_pb_flt').lv[4]) || {}).length);
  // inject JSON problem
  await page.evaluate(() => APP.go('e_prob', null, 'inject'));
  await page.fill('main textarea.mono', JSON.stringify({ title: 'مسئله آزمایشی', field: 'ریاضی', open: '۱۹۰۰–۲۰۰۰', statement: 'x', why_hard: 'y', answer: 'z', src: [], stages: [{ q: 'q?', ctx: 'c', opts: [{ t: 'a', ok: true, why: 'w' }, { t: 'b', ok: false, why: 'w' }], move: 'm', idea: 'i', st: ['st_aql', 'bogus'], lvl: 2 }], dead: [], lessons: [], drills: [] }));
  await page.click('main .btn:has-text("ثبت JSON دستی")'); await page.evaluate(() => APP.go('e_prob', null, 'pending')); await page.click('main .btn:has-text("تأیید")'); await page.waitForTimeout(150);
  info.probsAfter = await page.evaluate(() => APP.S.all('eprob', p => p.status === 'approved').length);
  // case engine panel from a human case
  await page.evaluate(() => { const c = APP.newCase({ title: 'خبر کانال', input: 'کانالی گفت دلار فردا ۱۰٪ بالا می‌رود' }); c.st.st_tasdiq = { data: { claims: [{ txt: 'دلار فردا ۱۰٪ بالا می‌رود' }] }, done: true, rubric: [] }; APP.S.put(c); APP.go('e_case', c.id, 'engine'); });
  await page.waitForSelector('.feated'); await page.selectOption('#fe_c1_way', 'نقل'); await page.selectOption('#fe_c1_narrator', 'غیرموثق'); await page.fill('#fe_c1_conf', '90'); await page.waitForTimeout(500);
  info.engineVerdict = await page.locator('main .verdict h2').first().textContent();
  // mobile
  await page.setViewportSize({ width: 390, height: 844 });
  for (const v of [['e_bt'], ['e_lib'], ['e_living'], ['e_prob', 'pb_fourcolor', 'sim'], ['e_aut']]) { await page.evaluate(x => APP.go(...x), v); await page.waitForTimeout(150); const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov > 2) errors.push('mobile overflow ' + v[0] + ' ' + ov); }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => APP.go('e_bt')); await page.waitForSelector('section.test'); await page.screenshot({ path: __dirname + '/../dist/shot_bt.png', fullPage: true });
  await page.evaluate(() => { APP.simState = { pid: 'pb_semmelweis', lv: 1, order: 'hist', i: 1 }; APP.go('e_prob', 'pb_semmelweis', 'sim'); }); await page.screenshot({ path: __dirname + '/../dist/shot_sim.png' });
  await page.evaluate(() => APP.go('e_living')); await page.screenshot({ path: __dirname + '/../dist/shot_living.png' });
  console.log(JSON.stringify(info, null, 1));
  if (info.tests !== 3 || info.added < 1 || info.approved !== 'approved' || !info.lrules || !info.simDone || !info.master || info.probsAfter !== 1 || !/خطا/.test(info.engineVerdict)) errors.push('flow check failed');
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await browser.close();
})();
