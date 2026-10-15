// راه‌یابیِ کل (مالک ۲۰۲۶-۱۰-۱۳: «وارد که می‌شوم گیج می‌شوم … وسطِ اقیانوس») — روی نسخهٔ مستقل.
// ۱) اولین ورود ⇒ «🧭 نقشهٔ کل» (سه منبع ⇒ سه کار ⇒ حاصل، کارگاه جدا، واژه‌نامه)؛ بعد از آن ⇒ «امروز» مثلِ قبل.
// ۲) هر نما «این‌جا» دارد (کدام کار، چیست، به چه کار می‌آید)؛ هیچ نمایی بی‌توضیح نیست؛ جمع‌کردنی و برگشت‌پذیر.
// ۳) سه مسیرِ کاری قدم‌به‌قدم از صفحه‌های واقعی؛ قبل/بعد/خروج؛ پس از بازخوانی می‌ماند.
// ۴) هیچ چیز حذف نشد: همهٔ منوهای قبلی سرِ جایشان؛ دو دوره نام‌های جدا؛ «از اینجا شروع کن» فقط یک‌جا.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(300);

  // ۱) نقشهٔ کل
  chk(await p.evaluate(() => APP.state.view) === 'whole', 'first visit lands on the whole map');
  info.whole = await p.evaluate(() => ({ src: document.querySelectorAll('main .orient-src').length, jobs: document.querySelectorAll('main .orient-job').length,
    outs: document.querySelectorAll('main .orient-out').length, ws: !!document.querySelector('main details.orient-ws'), words: document.querySelectorAll('main .orient-words dt').length,
    pages: [...document.querySelectorAll('main .orient-job .orient-page')].map(x => x.dataset.v) }));
  chk(info.whole.src === 3 && info.whole.jobs === 3 && info.whole.outs === 3 && info.whole.ws && info.whole.words >= 10, 'whole map structure ' + JSON.stringify(info.whole));
  chk(info.whole.pages.every(v => v) && await p.evaluate(v => v.every(x => APP.V[x]), info.whole.pages), 'every page chip opens a real view');
  chk(await p.locator('.nav[data-v="whole"]').count() === 1, 'sidebar has the whole-map entry');
  await p.reload(); await p.waitForSelector('.nav'); await p.waitForTimeout(300);
  chk(await p.evaluate(() => APP.state.view) !== 'whole', 'after the first visit the landing is as before');

  // ۲) نوارِ «این‌جا» در همهٔ نماها
  info.noMeta = await p.evaluate(() => Object.keys(APP.V).filter(v => !APP.VIEW_META[v]));
  chk(info.noMeta.length === 0, 'every view has orientation meta: ' + info.noMeta);
  const views = await p.evaluate(() => [...document.querySelectorAll('.nav[data-v]')].map(b => b.dataset.v));
  let missing = [];
  for (const v of views) { if (v === 'whole') continue; await p.evaluate(v => APP.go(v), v); await p.waitForTimeout(60); if (!(await p.locator('main .orient-strip .orient-what').count())) missing.push(v); }
  chk(missing.length === 0, 'strip missing on: ' + missing);
  await p.evaluate(() => APP.go('kcases')); await p.waitForTimeout(80);
  chk(/گره‌گشایی/.test(await p.locator('main .orient-job-chip').innerText()), 'kcases belongs to the untie job');
  await p.click('main .orient-fold'); await p.waitForTimeout(80);
  chk(await p.locator('main .orient-strip.folded').count() === 1, 'strip folds');
  await p.click('main .orient-unfold'); await p.waitForTimeout(80);
  chk(await p.locator('main .orient-strip .orient-what').count() === 1, 'strip unfolds');
  // پدرِ صفحه‌های بی‌منو
  chk(await p.evaluate(() => APP.NAV_PARENT.journey === 'topics' && APP.NAV_PARENT.move === 'moves' && APP.NAV_PARENT.epi_lesson === 'epi_course'), 'breadcrumb parents filled');

  // ۳) مسیرِ کاری
  await p.evaluate(() => APP.go('whole')); await p.waitForTimeout(80);
  await p.click('main .orient-go[data-flow="judge"]'); await p.waitForTimeout(150);
  chk(await p.evaluate(() => APP.state.view) === 'e_home' && /قدمِ ۱ از ۴/.test(await p.locator('main .orient-flow').innerText()), 'judge flow starts at e_home, step 1/4');
  await p.click('main .orient-flow-next'); await p.waitForTimeout(150);
  chk(await p.evaluate(() => APP.state.view) === 'e_cases' && /قدمِ ۲ از ۴/.test(await p.locator('main .orient-flow').innerText()), 'next step');
  await p.reload(); await p.waitForSelector('.nav'); await p.evaluate(() => APP.go('home')); await p.waitForTimeout(150);
  chk(await p.locator('main .orient-flow-go').count() === 1 && /قدمِ ۲ از ۴/.test(await p.locator('main .orient-flow').innerText()), 'flow survives a reload and offers «go to this step»');
  await p.click('main .orient-flow-prev'); await p.waitForTimeout(120);
  chk(/قدمِ ۱ از ۴/.test(await p.locator('main .orient-flow').innerText()), 'previous step');
  await p.click('main .orient-flow-end'); await p.waitForTimeout(100);
  chk(await p.locator('main .orient-flow').count() === 0, 'leave the flow');

  // ۴) هیچ چیز حذف نشد؛ نام‌ها یکتا
  info.nav = await p.evaluate(() => ({ learn: APP.NAV.filter(n => !n.g).length, epi: APP.EPI_NAV.filter(n => !n.g).length,
    courses: [APP.NAV.find(n => n[0] === 'course')[1], APP.EPI_NAV.find(n => n[0] === 'epi_course')[1]],
    startClaims: [...APP.NAV, ...APP.EPI_NAV].filter(n => !n.g && /از اینجا شروع کن|همین‌جا$/.test(n[2])).length }));
  chk(info.nav.learn >= 16 && info.nav.epi >= 15, 'all menu items kept ' + JSON.stringify(info.nav));
  chk(info.nav.courses[0] !== info.nav.courses[1], 'the two courses have distinct names');
  chk(info.nav.startClaims === 0, 'only the start/whole pages claim «start here»');
  await p.evaluate(() => APP.go('start')); await p.waitForTimeout(80);
  chk(await p.locator('main .orient-hint').count() === 1, 'start page points to the whole map');

  // موبایل
  await p.setViewportSize({ width: 390, height: 800 }); await p.evaluate(() => APP.go('whole')); await p.waitForTimeout(150);
  chk(await p.evaluate(() => document.documentElement.scrollWidth <= 392), 'no horizontal overflow at 390px');

  console.log(JSON.stringify(info, null, 1).slice(0, 700));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
