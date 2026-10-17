// post.js <scenarioDir> [advDays] : after {"exit":true}; opens the profile, shoots dossier per live problem (full page) + all-work index + parts
const { chromium } = require('/home/user/Lifemanager/apps/learning-architecture/node_modules/playwright');
const fs = require('fs'), path = require('path');
const D = process.argv[2], adv = +(process.argv[3] || 0), O = path.join(D, 'out');
const w = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const ctx = await chromium.launchPersistentContext(path.join(D, 'profile'), { viewport: { width: 1360, height: 900 } });
  const p = ctx.pages()[0] || await ctx.newPage();
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file:///home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html'); await p.waitForSelector('.nav');
  const inj = path.join(D, 'inject.js'); if (fs.existsSync(inj)) await p.evaluate(fs.readFileSync(inj, 'utf8'));
  await p.evaluate((a) => { APP.S.loaded = true; APP.HOST = APP.HOST || {}; APP.HOST.ai = async () => '{"reply":"(post)","actions":[]}'; if (a) __adv(a); try { APP.ASSIST.toggle(false) } catch (e) { } APP.render(); }, adv);
  const settle = async () => { try { await p.evaluate(() => document.fonts && document.fonts.ready); } catch (e) { } await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); await w(700); };
  const ids = await p.evaluate(() => { const R = JSON.parse(localStorage.getItem('mla.records.v1') || '{}'); return Object.values(R).filter(r => r && r.type === 'eprob' && r.live).map(r => r.p.id); });
  const txt = [];
  let i = 0;
  for (const pid of ids) {
    i++;
    await p.evaluate((pid) => APP.go('dossier', pid), pid); await settle();
    await p.screenshot({ path: path.join(O, 'part_dossier_' + i + '.png'), fullPage: true });
    txt.push('#### DOSSIER ' + pid + '\n' + await p.evaluate(() => document.getElementById('main').innerText));
    await p.evaluate((pid) => APP.go('lprob', pid), pid); await settle();
    await p.screenshot({ path: path.join(O, 'part_tunnel_' + i + '.png'), fullPage: true });
  }
  await p.evaluate(() => APP.go('dossier')); await settle();
  await p.screenshot({ path: path.join(O, 'part_allwork_1.png'), fullPage: true });
  txt.push('#### ALLWORK\n' + await p.evaluate(() => document.getElementById('main').innerText));
  await p.evaluate(() => APP.go('mind')); await settle();
  await p.evaluate(() => document.querySelectorAll('#main details').forEach(d => { if (/از کجا/.test(d.textContent.slice(0, 80))) d.open = true; })); await settle();
  await p.screenshot({ path: path.join(O, 'part_mind_1.png'), fullPage: true });
  txt.push('#### MIND\n' + await p.evaluate(() => document.getElementById('main').innerText));
  await p.evaluate(() => APP.go('practice')); await settle();
  await p.screenshot({ path: path.join(O, 'part_practice_1.png'), fullPage: true });
  txt.push('#### PRACTICE\n' + await p.evaluate(() => document.getElementById('main').innerText));
  await p.evaluate(() => APP.go('today')); await settle();
  txt.push('#### TODAY\n' + await p.evaluate(() => document.getElementById('main').innerText));
  fs.writeFileSync(path.join(D, 'post.txt'), txt.join('\n\n'));
  console.log('post ok', ids.length);
  await ctx.close();
})().catch(e => { console.error('post fail', e.message); process.exit(1); });
