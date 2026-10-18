const { chromium } = require('/home/user/Lifemanager/apps/learning-architecture/node_modules/playwright');
const fs = require('fs'), path = require('path'); const D = process.argv[2], O = path.join(D, 'out'); const w = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const ctx = await chromium.launchPersistentContext(path.join(D, 'profile'), { viewport: { width: 1360, height: 900 } });
  const p = ctx.pages()[0] || await ctx.newPage(); await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(process.env.PAGE || 'file:///home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html'); await p.waitForSelector('.nav');
  const inj = path.join(D, 'inject.js'); if (fs.existsSync(inj)) await p.evaluate(fs.readFileSync(inj, 'utf8'));
  await p.evaluate(() => { APP.S.loaded = true; APP.HOST = APP.HOST || {}; APP.HOST.ai = async () => '{"reply":"(post)","actions":[]}'; try { APP.ASSIST.toggle(false) } catch (e) { } });
  const out = [];
  const ids = await p.evaluate(() => { const R = JSON.parse(localStorage.getItem('mla.records.v1') || '{}'); return Object.values(R).filter(r => r && r.type === 'eprob' && r.live).map(r => r.p.id); });
  let i = 0;
  for (const id of ids) { i++;
    await p.evaluate((id) => APP.go('route', id), id); await w(1200);
    const r = await p.evaluate(() => { const g = document.querySelector('.rt-pt.rt-p-det') || document.querySelector('.rt-pt'); if (g) { g.dispatchEvent(new Event('mouseenter')); g.scrollIntoView({ block: 'center' }); } const t = document.querySelector('.rt-tip'); const M = APP.ROUTE.model(APP.state.arg) || {}; return 'TIP:' + (t && !t.hidden ? t.innerText : '') + ' ## ' + JSON.stringify({ pts: (M.pts || []).map(p => [p.cls, p.k, (p.title || '').slice(0, 40)]), dets: (M.dets || []).map(d => [d.kind, d.concept, d.depth, d.open, d.rejoin]), now: M.nowFa, dest: M.dest, origin: M.origin }); });
    await w(400); await p.screenshot({ path: path.join(O, 'part_route_' + i + '.png'), fullPage: true }); out.push(id + ' ' + r); }
  fs.writeFileSync(path.join(D, 'route.txt'), out.join('\n\n')); console.log('route ok', ids.length); await ctx.close();
})().catch(e => { console.error('route fail', e.message); process.exit(1); });
