const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(t => localStorage.setItem('token', t), process.env.TOK);
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::|Failed to load resource|status of (4|5)\d\d/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const U = (process.env.BASE || 'http://localhost:8765') + '/apps/learning-architecture';
  await p.goto(U + '?tab=e_home'); await p.waitForSelector('.lla #app .nav', { timeout: 30000 }); await p.waitForTimeout(1200);
  info.epiCourseNav = await p.locator('.navlist[data-sys="epi"] .nav[data-v="epi_course"]').count();
  await p.evaluate(() => APP.go('epi_course')); await p.waitForTimeout(1000);
  info.epiCourse = (await p.locator('main h1').first().innerText().catch(() => '')).slice(0, 60);
  // case page: attachments section + upload without Drive ⇒ clear message, nothing stored
  const cid = await p.evaluate(() => { const c = APP.newCase({ title: 'آزمونِ پیوست', input: 'x' }); APP.S.put(c); return c.id; });
  await p.waitForTimeout(1500);
  await p.evaluate(id => APP.go('e_case', id), cid); await p.waitForTimeout(1500);
  info.attachSection = await p.locator('main section.attach').count();
  await p.setInputFiles('main section.attach input[type=file]', { name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
  await p.waitForTimeout(2000);
  info.uploadToast = (await p.locator('.toast').allTextContents()).join(' | ').slice(0, 140);
  // topic: journey button + attachments
  const tid = await p.evaluate(() => APP.S.put({ id: APP.uid('tp'), type: 'topic', title: 'موضوعِ سفر' }).id);
  await p.evaluate(id => APP.go('topic', id), tid); await p.waitForTimeout(1200);
  info.journeyBtn = await p.locator('main button:has-text("سفرِ گام‌به‌گام")').count();
  info.topicAttach = await p.locator('main section.attach').count();
  // settings: size & cost
  await p.evaluate(() => APP.go('settings')); await p.waitForTimeout(2500);
  info.usage = (await p.locator('main h3:has-text("حجم و هزینه") + p').innerText().catch(() => 'NONE')).slice(0, 160);
  // learning course: protocol lesson + new simulator renders
  await p.evaluate(() => APP.go('lesson', 36, 's2')); await p.waitForTimeout(1200);
  info.sim36 = await p.locator('main .crs-sim').count();
  // خطای هم‌علتِ آینه (مثلاً «Google Sheets API روشن نیست») یک بار با شمار، نه بیست بار
  await p.evaluate(() => { const m = 'API روشن نیست — Enable کن: https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=1'; APP.mirrorInfo = () => Promise.resolve({ connected: true, root_url: '', items: Array.from({ length: 20 }, (_, i) => ({ title: 'پرونده ' + i, pending: true, error: m })) }); APP.go('settings'); });
  await p.waitForTimeout(250);
  info.mirrErr = await p.locator('main .mirror-err').allInnerTexts();
  if (!(info.mirrErr.length === 1 && /۲۰ مورد/.test(info.mirrErr[0]) && /Enable/.test(info.mirrErr[0]))) errors.push('grouped mirror error ' + JSON.stringify(info.mirrErr));

  console.log(JSON.stringify(info, null, 1)); console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); await b.close();
})();
