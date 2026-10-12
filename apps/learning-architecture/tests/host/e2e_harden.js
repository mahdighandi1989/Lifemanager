// host-mode hardening e2e (2026-10-12): load gating, load failure, storage queue, history back, mirror, handbook close
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
  const posts = []; p.on('request', r => { if (r.method() !== 'GET' && /app-records/.test(r.url())) posts.push(r.method() + ' ' + r.url().split('learning-architecture')[1]); });
  const api = (path, method, body) => p.evaluate(async ([path, method, body]) => { const t = localStorage.getItem('token'); const r = await fetch(path, { method: method || 'GET', headers: { Authorization: 'Bearer ' + t, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); return r.json(); }, [path, method, body]);

  // 1) load FAILS ⇒ error card + retry, nothing written
  let fail = true;
  await p.route('**/api/app-records/learning-architecture', r => (fail && r.request().method() === 'GET') ? r.fulfill({ status: 500, body: '{}' }) : r.continue());
  await p.goto(U + '?tab=start'); await p.waitForTimeout(2500);
  info.failCard = await p.locator('main .card.bad button:has-text("تلاشِ دوباره")').count();
  info.writesWhileFailed = posts.length;
  fail = false; await p.click('main .card.bad button'); await p.waitForSelector('main nav.crumbs', { timeout: 15000 }); await p.waitForTimeout(800);
  info.afterRetry = await p.evaluate(() => APP.state.view + ' loaded=' + APP.S.loaded);
  await p.unroute('**/api/app-records/learning-architecture');

  // 2) SLOW load + deep link: nothing renders/saves before the records arrive
  posts.length = 0;
  const settingsBefore = JSON.stringify(((await api('/api/app-records/learning-architecture')).records || []).find(r => r.id === 'settings') || {});
  await p.route('**/api/app-records/learning-architecture', async r => { if (r.request().method() === 'GET') { await new Promise(res => setTimeout(res, 3000)); } r.continue(); });
  await p.goto(U + '?tab=settings'); await p.waitForTimeout(1200);
  info.loadingShown = await p.locator('main .card:has-text("در حالِ بارگذاریِ داده‌ها")').count();
  info.writesBeforeLoad = posts.slice();
  await p.waitForTimeout(4000); await p.unroute('**/api/app-records/learning-architecture');
  info.viewAfterSlow = await p.evaluate(() => APP.state.view);
  const settingsAfter = JSON.stringify(((await api('/api/app-records/learning-architecture')).records || []).find(r => r.id === 'settings') || {});
  info.settingsKept = settingsBefore === settingsAfter || 'changed';

  // 3) a rejected record is reported once, never retried forever; a deleted record is not resurrected by a queued save
  posts.length = 0;
  await p.evaluate(() => { APP.S.put({ id: 'bad/id', type: 'x' }); const r = APP.S.put({ id: APP.uid('tp'), type: 'topic', title: 'گذرا' }); window._gone = r.id; APP.S.del(r.id); });
  await p.waitForTimeout(9000);
  info.bulkCalls = posts.filter(x => /bulk/.test(x)).length;
  info.toastRejected = (await p.locator('.toast').allTextContents()).join(' | ').slice(0, 120);
  const ids = ((await api('/api/app-records/learning-architecture')).records || []).map(r => r.id);
  info.goneResurrected = ids.indexOf(await p.evaluate(() => window._gone)) >= 0;
  info.badSaved = ids.indexOf('bad/id') >= 0;

  // 4) in-app «↩ برگرد» = browser history step (no growth)
  await p.evaluate(() => APP.goRoot('concerns')); await p.waitForTimeout(600);
  const idx0 = await p.evaluate(() => history.state && history.state.idx);
  const chip = p.locator('main .tlink').nth(6); await chip.scrollIntoViewIfNeeded(); await chip.click(); await p.waitForTimeout(800);
  const idx1 = await p.evaluate(() => history.state && history.state.idx);
  // a sub-tab change on the same page must REPLACE, not push
  await p.evaluate(() => APP.go(APP.state.view, APP.state.arg, 'x1')); await p.waitForTimeout(400);
  const idx1b = await p.evaluate(() => history.state && history.state.idx);
  await p.locator('main .backbtn').click(); await p.waitForTimeout(1000);
  const idx2 = await p.evaluate(() => history.state && history.state.idx);
  info.history = { idx0, idx1, idx1b, idx2, view: await p.evaluate(() => APP.state.view + ':' + APP.trail.length) };

  // 5) course topic change ⇒ BOTH topics re-mirrored
  const mirrorBodies = []; p.on('request', r => { if (r.method() === 'POST' && /\/mirror$/.test(r.url())) mirrorBodies.push(JSON.parse(r.postData() || '{}')); });
  const tp = await p.evaluate(() => { const a = APP.S.put({ id: APP.uid('tp'), type: 'topic', title: 'موضوعِ الف' }); const b = APP.S.put({ id: APP.uid('tp'), type: 'topic', title: 'موضوعِ ب' }); const c = APP.S.get('course') || { id: 'course', type: 'course' }; c.topic = a.id; APP.S.put(c); return [a.id, b.id]; });
  await p.waitForTimeout(3500); mirrorBodies.length = 0;
  await p.evaluate(id => { const c = APP.S.get('course'); c.topic = id; APP.S.put(c); }, tp[1]);
  await p.waitForTimeout(3500);
  const sentIds = [].concat.apply([], mirrorBodies.map(m => (m.items || []).map(i => i.rec_id)));
  info.mirrorBoth = tp.every(id => sentIds.indexOf(id) >= 0);
  const st = await api('/api/app-records/learning-architecture/mirror');
  const a = (st.items || []).find(i => i.rec_id === tp[0]);
  info.mirrorItems = (st.items || []).length;

  // 6) handbook close goes BACK to the app entry
  await p.evaluate(() => APP.goRoot('home')); await p.waitForTimeout(500);
  const hIdx = await p.evaluate(() => history.state.idx);
  await p.click('button:has-text("📘 دفترچهٔ راهنما")'); await p.waitForTimeout(2500);
  await p.locator('nav button').nth(3).click(); await p.waitForTimeout(800);
  await p.click('button:has-text("↩ بازگشت به برنامه")'); await p.waitForTimeout(1500);
  info.handbook = { from: hIdx, back: await p.evaluate(() => history.state.idx), view: await p.evaluate(() => APP.state.view), appVisible: await p.locator('.lla').isVisible() };

  // 7) malformed hash doesn't crash the page
  await p.goto(U + '?doc=HANDBOOK#%E0%A4%A'); await p.waitForTimeout(2500);
  info.badHash = await p.locator('[data-testid="learning-architecture-page"]').count();

  console.log(JSON.stringify(info, null, 1));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); await b.close();
})();
