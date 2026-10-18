// psy.js <dir> : answer «🧩 معمای امروز» once (option 1 / text "1", conf 50) and read the mind card's same-age comparison
const { chromium } = require('/home/user/Lifemanager/apps/learning-architecture/node_modules/playwright');
const fs = require('fs'), path = require('path'); const D = process.argv[2], O = path.join(D, 'out'); const w = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const ctx = await chromium.launchPersistentContext(path.join(D, 'profile'), { viewport: { width: 1360, height: 900 } });
  const p = ctx.pages()[0] || await ctx.newPage(); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(process.env.PAGE || 'file:///home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html'); await p.waitForSelector('.nav');
  const inj = path.join(D, 'inject.js'); if (fs.existsSync(inj)) await p.evaluate(fs.readFileSync(inj, 'utf8'));
  let toast = '';
  await p.evaluate(() => { APP.S.loaded = true; APP.HOST = APP.HOST || {}; APP.HOST.ai = async () => '{"reply":"(post)","actions":[]}'; const t = APP.toast; APP.toast = function (m) { window.__lastToast = m; return t && t.apply(this, arguments); }; try { APP.ASSIST.toggle(false) } catch (e) { } APP.go('psy_item'); });
  await w(1200);
  const q = await p.evaluate(() => { const b = document.querySelector('.psy-q'); if (!b) return 'NOITEM ' + document.getElementById('main').innerText.slice(0, 300); const r = b.querySelector('input[type=radio]'); if (r) { r.click(); } else { const t = b.querySelector('input.inp:not(.sm)'); const st = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; st.call(t, '1'); t.dispatchEvent(new Event('input', { bubbles: true })); }
    const c = b.querySelector('input.inp.sm'); const st = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; st.call(c, '50'); c.dispatchEvent(new Event('input', { bubbles: true })); return b.innerText.slice(0, 400); });
  await p.screenshot({ path: path.join(O, 'part_psy_1.png') });
  await p.evaluate(() => { const bs = [...document.querySelectorAll('.psy-q button')]; bs[bs.length - 1].click(); }); await w(1500);
  toast = await p.evaluate(() => window.__lastToast || '');
  await p.evaluate(() => APP.go('mind')); await w(1200);
  const rows = await p.evaluate(() => { const t = document.getElementById('main').innerText.split('\n'); return t.filter(l => /نسبت به مردم|هنجار|هم‌سن|سن:|معمای لنگردار|منبع/.test(l)).slice(0, 14).join('\n'); });
  await p.evaluate(() => { const el = [...document.querySelectorAll('#main *')].find(e => /نسبت به مردم/.test(e.textContent) && e.children.length < 3); if (el) el.scrollIntoView({ block: 'start' }); }); await w(500);
  await p.screenshot({ path: path.join(O, 'part_mind_age_1.png') });
  fs.writeFileSync(path.join(D, 'psy.txt'), 'ITEM: ' + q + '\nTOAST: ' + toast + '\nMIND:\n' + rows);
  console.log('psy ok', D); await ctx.close();
})().catch(e => { console.error('psy fail', e.message); process.exit(1); });
