// گره‌گشا inside Lifemanager: Drive mirror ON by default (private notes still opt-in), photo at intake, attachments, AI door with file_ids, reminders
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
  const aiBodies = []; p.on('request', r => { if (r.method() === 'POST' && /\/ai$/.test(r.url())) aiBodies.push(JSON.parse(r.postData() || '{}')); });
  const api = (path) => p.evaluate(async (path) => (await fetch(path, { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } })).json(), path);
  await p.goto(U + '?tab=kcases'); await p.waitForSelector('.lla #app .nav', { timeout: 30000 }); await p.waitForTimeout(1200);
  info.navKnots = await p.locator('.nav[data-v="kcases"]').count();
  const ids = await p.evaluate(() => {
    const kc = APP.S.put({ id: APP.uid('kc'), type: 'kcase', title: 'آزمونِ میزبان: مدیرها', intake: { kinds: ['social'], what: 'x', expected: 'y', actual: 'z', thoughts: 't', seen: 'no', emo: 8, emoName: 'خشم' }, ev: [{ fam: 'F7', dir: 1, text: 'یادداشتِ خصوصی' }, { fam: 'F8', dir: 1, text: 'شاهدِ ارتباطی' }], knots: [], status: 'open' });
    return kc.id;
  });
  // owner 2026-10-12 «برای هر مسئله فولدر در درایو»: a situation is mirrored WITHOUT ticking anything
  for (let i = 0; i < 40 && !mirrorBodies.some(m => (m.items || []).some(it => it.rec_id === ids)); i++) await p.waitForTimeout(500);
  const sent =mirrorBodies.map(m => (m.items || []).find(i => i.rec_id === ids)).filter(Boolean).pop();
  await p.evaluate(id => APP.go('kcase', id), ids); await p.waitForTimeout(1500);
  info.toggle = await p.locator('main section[data-report-section="kdrive"] input[type=checkbox]').count();
  info.toggleOnByDefault = await p.isChecked('main section[data-report-section="kdrive"] input[data-key="mirror"]');
  info.privateOffByDefault = !(await p.isChecked('main section[data-report-section="kdrive"] input[data-key="mirrorPrivate"]'));
  info.copy = /خاموش‌کردنی/.test(await p.locator('main section[data-report-section="kdrive"]').innerText());
  info.attach = await p.locator('main section.attach').count();
  info.noAttachNoteWhenMirrorOn = (await p.locator('main section.attach .kn-attnote').count()) === 0;
  info.mirrored = !!sent;
  const flat = sent ? JSON.stringify(sent.tabs) : '';
  info.privateKeptOut = sent && !/خشم/.test(flat) && !/یادداشتِ خصوصی/.test(flat) && /شاهدِ ارتباطی/.test(flat);
  info.group = sent && sent.group; if (!info.privateKeptOut) info.flatDebug = flat.slice(0, 1200);
  // switching it off ⇒ the folder is handed to the server as «deleted» (renamed there, never removed)
  const before = mirrorBodies.length;
  await p.locator('main section[data-report-section="kdrive"] input[data-key="mirror"]').uncheck(); await p.waitForTimeout(3500);
  info.offSendsDeleted = mirrorBodies.slice(before).some(m => (m.deleted || []).indexOf(ids) >= 0);
  info.offStored = await p.evaluate(id => APP.S.get(id).mirror === false, ids);
  await p.evaluate(id => APP.go('kcase', id), ids); await p.waitForTimeout(1200);
  info.attachNoteWhenMirrorOff = await p.locator('main section.attach .kn-attnote').count();  // Minor8: honest one-liner — uploading creates the case's Drive folder
  // I6 (audit 2026-10-12): F7 only as a SECONDARY family still keeps the claim, the whys, the governing variable and the knot card private
  const sec = await p.evaluate(() => {
    const k = APP.S.put({ id: APP.uid('knot'), type: 'knot', name: 'گرهِ آزمونِ حریم', fam: 'F8', extra: [{ fam: 'F7' }], principle: 'اصلِ-پنهانِ-کارت', signals: 'نشانه-پنهان', counter: 'حرکت-پنهان', example: 'مثال-پنهان', cases: [], status: 'open', mirror: true });
    const kc = APP.S.put({ id: APP.uid('kc'), type: 'kcase', title: 'آزمونِ میزبان: کمکیِ هیجانی', mirror: true, kinds: ['social'],
      intake: { what: 'x', expected: 'y', actual: 'z', thoughts: 't', seen: 'na', claim: 'ادعای-خصوصی-دربارهٔ-خودم' },
      root: { primary: 'F8', extra: [{ fam: 'F7', sub: '' }], confirmed: true, why5: [{ why: 'چرای-خصوصی', ev: 'شاهد-خصوصی', kind: 'in', rival: 'رقیب-خصوصی' }], loop2: 'متغیر-خصوصی', rival: 'رقیبِ-اصلیِ-خصوصی' },
      ev: [{ fam: 'F8', dir: 1, text: 'شاهدِ ارتباطیِ دوم' }], knots: [k.id], status: 'rooted' });
    k.cases = [kc.id]; APP.S.put(k);
    return { kc: kc.id, k: k.id };
  });
  await p.waitForTimeout(4000);
  const sentSec = mirrorBodies.map(m => (m.items || []).find(i => i.rec_id === sec.kc)).filter(Boolean).pop();
  const sentKnot = mirrorBodies.map(m => (m.items || []).find(i => i.rec_id === sec.k)).filter(Boolean).pop();
  const fs = sentSec ? JSON.stringify(sentSec.tabs) : '', fk = sentKnot ? JSON.stringify(sentKnot.tabs) : '';
  info.secondaryF7Mirrored = !!sentSec && !!sentKnot;
  info.secondaryF7Private = !!sentSec && !/خصوصی-دربارهٔ|چرای-خصوصی|شاهد-خصوصی|رقیب-خصوصی|متغیر-خصوصی|رقیبِ-اصلیِ-خصوصی/.test(fs) && /شاهدِ ارتباطیِ دوم/.test(fs);
  info.secondaryF7KnotPrivate = !!sentKnot && !/پنهان/.test(fk) && /گرهِ آزمونِ حریم/.test(fk);
  if (!info.secondaryF7Private || !info.secondaryF7KnotPrivate) info.secDebug = (fs + ' || ' + fk).slice(0, 1500);
  // «عکسِ سؤال» right in the intake card: choosing a file creates the situation first; no Drive here ⇒ a clear message, nothing stored
  await p.evaluate(() => APP.go('kcase', 'new', 'in')); await p.waitForTimeout(800);
  info.photoHiddenUntilProblem = !(await p.locator('main #knPhoto').isVisible());
  await p.check('#knKind_0');
  info.photoField = await p.locator('main .kn-prob #knPhoto').count();
  const png = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63f8ffff3f0005fe02fea7d6a4c50000000049454e44ae426082', 'hex');
  await p.setInputFiles('main #knPhoto', { name: 'q.png', mimeType: 'image/png', buffer: png }); await p.waitForTimeout(2500);
  info.photoCreatedCase = await p.evaluate(() => /^kc_/.test(String(APP.state.arg)) && !!APP.S.get(APP.state.arg));
  info.photoMsg = (await p.locator('main .kn-upst').innerText().catch(() => '')) + ' | ' + (await p.locator('.toast').allTextContents()).join(' | ');
  info.photoClear = /درایو وصل نیست/.test(info.photoMsg);
  const pid = await p.evaluate(() => APP.state.arg);
  info.photoNothingStored = (await api('/api/app-records/learning-architecture/files?rec_id=' + encodeURIComponent(pid))).files.length === 0;
  // the AI door: file_ids reach the server; an unknown/foreign id is filtered out ⇒ a normal answer or the no-model message, never a 500
  info.aiForeign = await p.evaluate(() => APP.HOST.ai('سیستمِ آزمون', 'سلام', { fileIds: [999999] }).then(t => 'ok:' + typeof t, e => 'err:' + ((e && e.response && e.response.status) || '') + ':' + (e && e.message)));
  info.aiForeignOk = /^ok:string$|^err::(مدلی برای|خطای سرویس هوش مصنوعی)/.test(info.aiForeign);
  info.aiBodyHadIds = aiBodies.some(b => JSON.stringify(b.file_ids) === '[999999]');
  info.aiPlainNoIds = await p.evaluate(() => APP.callAI('س', 'سلام').then(() => true, () => true)) && aiBodies.slice(-1).every(b => Array.isArray(b.file_ids) && !b.file_ids.length);
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
