// peval.js <dir> <advDays> <jsfile> : open profile (after exit) and print eval result
const { chromium } = require('/home/user/Lifemanager/apps/learning-architecture/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => { const D = process.argv[2]; const ctx = await chromium.launchPersistentContext(path.join(D, 'profile'), { viewport: { width: 1360, height: 900 } });
  const p = ctx.pages()[0] || await ctx.newPage(); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file:///home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html'); await p.waitForSelector('.nav');
  await p.evaluate(fs.readFileSync(path.join(D, 'inject.js'), 'utf8')); await p.evaluate((a) => { APP.S.loaded = true; if (a) __adv(a); }, +process.argv[3]);
  console.log(await p.evaluate(fs.readFileSync(process.argv[4], 'utf8'))); await ctx.close(); })().catch(e => { console.error(e.message); process.exit(1); });
