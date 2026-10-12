// گره‌گشا inside Lifemanager: opt-in Drive mirror, attachments on a situation, reminders reach the server
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
  const mirrorBodies = []; p.on('request', r => { if (r.method() === 'POST' && /\/mirror$/.test(r.url())) mirrorBodies.push(JSON.parse(r.postData() || '{}')); });
  const api = (path) => p.evaluate(async (path) => (await fetch(path, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } })).json(), path);
  await p.goto(U + '?tab=kcases'); await p.waitForSelector('.lla #app .nav', { timeout: 30000 }); await p.waitForTimeout(1200);
  info.navKnots = await p.locator('.nav[data-v="kcases"]').count();
  const ids = await p.evaluate(() => {
    const kc = APP.S.put({ id: APP.uid('kc'), type: 'kcase', title: 'آزمونِ میزبان: مدیرها', intake: { kinds: ['social'], what: 'x', expected: 'y', actual: 'z', thoughts: 't', seen: 'no', emo: 8, emoName: 'خشم' }, ev: [{ fam: 'F7', dir: 1, text: 'یادداشتِ خصوصی' }, { fam: 'F8', dir: 1, text: 'شاهدِ ارتباطی' }], knots: [], status: 'open' });
    return kc.id;
  });
  await p.waitForTimeout(3500);
  info.notMirroredByDefault = !mirrorBodies.some(m => (m.items || []).some(i => i.rec_id === ids));
  await p.evaluate(id => APP.go('kcase', id), ids); await p.waitForTimeout(1500);
  info.toggle = await p.locator('main section[data-report-section="kdrive"] input[type=checkbox]').count();
  info.attach = await p.locator('main section.attach').count();
  await p.locator('main section[data-report-section="kdrive"] input[type=checkbox]').first().check(); await p.waitForTimeout(3500);
  const sent = mirrorBodies.map(m => (m.items || []).find(i => i.rec_id === ids)).filter(Boolean).pop();
  info.mirrored = !!sent;
  const flat = sent ? JSON.stringify(sent.tabs) : '';
  info.privateKeptOut = sent && !/خشم/.test(flat) && !/یادداشتِ خصوصی/.test(flat) && /شاهدِ ارتباطی/.test(flat);
  info.group = sent && sent.group; if (!info.privateKeptOut) info.flatDebug = flat.slice(0, 1200);
  // reminders: the host door reaches the server
  await p.evaluate(() => APP.HOST.remind({ key: 'knot:test', due_date: '2026-12-01', tz: 'Asia/Dubai', hour: 9, title: 'گره‌گشا', body: 'یک ورزشِ گره موعد است', link: '?tab=kpractice&a=x', channels: { telegram: true, email: true } }));
  const st = await p.evaluate(() => APP.HOST.remindStatus());
  info.remind = st.items && st.items.some(i => i.key === 'knot:test' && i.status === 'pending');
  info.channels = typeof st.telegram === 'boolean' && typeof st.email === 'boolean';
  await p.evaluate(() => APP.HOST.unremind('knot:test'));
  info.cancelled = (await api('/api/app-records/learning-architecture/reminders')).items.some(i => i.key === 'knot:test' && i.status === 'cancelled');
  // map + practice views open inside the host
  await p.evaluate(() => APP.go('kmap')); await p.waitForTimeout(1000); info.map = await p.locator('main svg').count() > 0;
  await p.evaluate(() => APP.go('kpractice')); await p.waitForTimeout(1000); info.practice = (await p.locator('main h1, main h2').count()) > 0;
  console.log(JSON.stringify(info, null, 1));
  const bad = Object.entries(info).filter(([k, v]) => v === false || v === 0 || v == null).map(([k]) => k);
  if (bad.length) errors.push('failed: ' + bad.join(', '));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); await b.close();
})();
