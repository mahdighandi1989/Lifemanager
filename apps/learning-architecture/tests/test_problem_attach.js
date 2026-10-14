// پیوست برای «مسئله‌های من» (مالک، ۲۰۲۶-۱۰-۱۳: «خودت ببین کجاها واقعاً ضرورت دارد») — روی نسخهٔ مستقل با یک میزبانِ ساختگی
// (درایو + هوش مصنوعی در حافظه). ۱) فرمِ «افزودنِ مسئلهٔ تو»: عکس/PDF ِ صورت یا حل پیش از تجزیه پیوست می‌شود، در فولدرِ همان
// مسئله می‌نشیند و هوش مصنوعی هنگامِ تجزیه آن را می‌خواند (فقط عکس/PDF، تا ۴)؛ بی متن و بی پیوست ⇒ رد. ۲) صفحهٔ هر مسئلهٔ خودِ
// مالک کادرِ «📎 پیوست‌ها» دارد؛ نمونه‌های آمادهٔ سازنده ندارند.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.addInitScript(() => {
    window.__files = []; window.__ai = []; window.__uploads = [];
    const decomp = { title: 'مسئلهٔ عکس‌دار', field: 'ریاضی', open: '', statement: 'صورتِ خوانده‌شده از عکس', why_hard: 'w', answer: 'پاسخِ خوانده‌شده', src: [],
      stages: [{ id: 'n1', ctx: 'c', q: 'حرکت؟', opts: [{ t: 'الف', ok: true, why: 'w' }, { t: 'ب', ok: false, why: 'w' }], move: 'm', idea: 'i', lvl: 1, mv: ['mv_represent'] }],
      dead: [], lessons: [], drills: [] };
    window.LLA_HOST = {
      load: () => Promise.resolve([]), saveMany: () => Promise.resolve({ ok: true }), del: () => Promise.resolve({ ok: true }),
      ai: (system, user, opts) => { window.__ai.push({ system, user, fileIds: (opts && opts.fileIds) || [] }); return Promise.resolve(window.__ai.length === 1 ? JSON.stringify(decomp) : '[]'); },
      mirror: () => Promise.resolve({ ok: true }), mirrorList: () => Promise.resolve({ connected: true, items: [] }),
      files: (rid) => Promise.resolve(window.__files.filter(f => f.rid === rid)),
      upload: (rid, file, meta) => { const f = { id: window.__files.length + 1, rid, name: file.name, mime: file.type, size: file.size, link: '#f' + (window.__files.length + 1) }; window.__files.push(f); window.__uploads.push({ rid, meta }); return Promise.resolve(f); },
      delFile: () => Promise.resolve({ ok: true }),
    };
  });
  await p.goto(FILE); await p.evaluate(() => APP.boot()); await p.waitForSelector('.nav'); await p.waitForTimeout(400);
  const chk = (c, m) => { if (!c) errors.push(m); };
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await p.waitForTimeout(150); };

  // ۱) فرم: بی عنوان ⇒ پیوست باز نمی‌شود؛ با عنوان ⇒ کادرِ پیوست
  await go('e_prob', null, 'inject');
  chk(await p.locator('main .pb-attbtn').count() === 1, 'attach button in the inject form');
  await p.click('main .pb-attbtn'); await p.waitForTimeout(100);
  chk(await p.locator('main section.attach').count() === 0, 'no attach box before a title');
  await p.fill('#pbIn_title', 'مسئلهٔ عکس‌دار');
  // بی متن و بی پیوست ⇒ هیچ فراخوانی
  await p.click('main .pb-ai'); await p.waitForTimeout(200);
  chk(await p.evaluate(() => window.__ai.length) === 0, 'no statement and no attachment ⇒ refused');
  await p.click('main .pb-attbtn'); await p.waitForTimeout(150);
  chk(await p.locator('main section.attach').count() === 1 && await p.locator('#pbAttAi').isChecked(), 'attach box + send-to-AI checkbox (on)');
  await p.setInputFiles('main section.attach input[type=file]', [
    { name: 'soorat.png', mimeType: 'image/png', buffer: Buffer.from('89504e47', 'hex') },
    { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('x') }]);
  await p.waitForTimeout(400);
  chk(await p.locator('main section.attach li a').count() === 2, 'both files listed');
  await p.click('main .pb-ai'); await p.waitForTimeout(900);
  info.call = await p.evaluate(() => ({ n: window.__ai.length, ids: window.__ai[0] && window.__ai[0].fileIds, inAtt: window.__ai[0] && /\(در پیوست\)/.test(window.__ai[0].user) && /پیوست همراهِ این پیام است/.test(window.__ai[0].user),
    later: window.__ai.slice(1).every(c => !c.fileIds.length) }));
  chk(info.call.n >= 1 && JSON.stringify(info.call.ids) === '[1,2]' && info.call.inAtt && info.call.later, 'decomposition reads every attachment (image AND txt, WORKLOG 44), only once ' + JSON.stringify(info.call));
  info.rec = await p.evaluate(() => { const r = APP.S.all('eprob', x => x.p && x.p.title === 'مسئلهٔ عکس‌دار')[0]; return r && { id: r.id, st: r.p.statement, rids: [...new Set(window.__uploads.map(u => u.rid))], meta: window.__uploads[0].meta }; });
  chk(info.rec && info.rec.st === 'صورتِ خوانده‌شده از عکس' && info.rec.rids.length === 1 && info.rec.rids[0] === info.rec.id && info.rec.meta.group === 'مسئله‌های من',
    'files live in the folder of THE stored problem ' + JSON.stringify(info.rec));
  chk(await p.locator('main section.attach').count() === 0 && await p.locator('main .pb-attbtn').count() === 1, 'form reset for the next problem (new id)');
  // تیکِ «فرستادن به هوش مصنوعی» برداشته ⇒ پیوست نمی‌رود
  await p.fill('#pbIn_title', 'دومی'); await p.fill('#pbIn_statement', 'ص'); await p.fill('#pbIn_answer', 'پ');
  await p.click('main .pb-attbtn'); await p.waitForTimeout(100);
  await p.setInputFiles('main section.attach input[type=file]', { name: 'b.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1') }); await p.waitForTimeout(300);
  await p.uncheck('#pbAttAi'); const n0 = await p.evaluate(() => window.__ai.length);
  await p.click('main .pb-ai'); await p.waitForTimeout(700);
  chk(await p.evaluate(n0 => window.__ai[n0] && window.__ai[n0].fileIds.length === 0, n0), 'unchecked ⇒ text only');

  // ۲) صفحهٔ مسئلهٔ خودِ مالک: کادرِ پیوست با همان فایل‌ها؛ نمونهٔ آماده: نه
  const pid = info.rec.id.replace(/^eprob_/, '');
  await go('e_prob', pid, 'about'); await p.waitForTimeout(250);
  chk(await p.locator('main section.attach').count() === 1 && await p.locator('main section.attach li a').count() === 2, 'own problem page has its attachments');
  await p.evaluate(() => { const st = APP.S.settings(); st.samples = true; APP.S.saveSettings(st); });
  const sid = await p.evaluate(() => (window.EPI_PROBLEMS || [])[0].id);
  await go('e_prob', sid, 'about');
  chk(await p.locator('main section.attach').count() === 0, 'builder sample has no attachments');
  // موبایل
  await p.setViewportSize({ width: 390, height: 800 }); await go('e_prob', null, 'inject'); await p.fill('#pbIn_title', 'م'); await p.click('main .pb-attbtn'); await p.waitForTimeout(150);
  chk(await p.evaluate(() => document.documentElement.scrollWidth <= 392), 'no horizontal overflow at 390px');

  console.log(JSON.stringify(info, null, 1).slice(0, 900));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
