// «💬 دستیار» درونِ Lifemanager: دکمهٔ شناور هست، و HOST.report با سرورِ واقعی یک برگهٔ «نظارت و سرکشی» می‌سازد که فوری است
// و همان جای صفحه را باز می‌کند؛ HOST.ai کارِ «lla_assistant» را می‌پذیرد (بی مدلِ تنظیم‌شده ⇒ خطای روشن، نه ۴۲۲).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(t => localStorage.setItem('token', t), process.env.TOK);
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::|Failed to load resource|status of (4|5)\d\d/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const BASE = process.env.BASE || 'http://localhost:8765', U = BASE + '/apps/learning-architecture';
  await p.goto(U + '?tab=e_home'); await p.waitForSelector('.lla #app .nav', { timeout: 30000 }); await p.waitForTimeout(1000);
  chk(await p.locator('.as-fab').count() === 1, 'assistant button in the host page');
  info.rep = await p.evaluate(async () => {
    const s = APP.ASSIST.newSession(); s.title = 'آزمونِ دستیار'; s.pinned = 'سنجشِ پیش‌بینیِ عددی'; APP.S.put(s);
    const r = await APP.ASSIST.fileGap(s, { title: 'سنجشِ پیش‌بینی‌های عددی', area: 'epi-territory', kind: 'build', abstract: 'الف', missing: 'ب', where: 'ج', how: 'د', relations: 'ه', docs: 'و' });
    const again = await APP.ASSIST.fileGap(s, { title: 'سنجشِ پیش‌بینی‌های عددی' });
    return { r, again, kept: APP.S.get(s.id).reports.length };
  });
  chk(info.rep.r && info.rep.r.id && info.rep.r.number >= 1 && info.rep.again.dup && info.rep.kept === 1, 'real sheet filed once: ' + JSON.stringify(info.rep));
  const tok = process.env.TOK, H = { authorization: 'Bearer ' + tok };
  const sheet = await (await p.request.get(BASE + '/api/inspection/' + info.rep.r.id, { headers: H })).json();
  const R = sheet.report || sheet;
  info.sheet = { urgent: !!R.urgent_at, page: R.page, sec: R.section_id, reopen: R.reopen, title: (R.title || '').slice(0, 60) };
  chk(info.sheet.urgent, 'sheet is urgent');
  chk(info.sheet.page === '/apps/learning-architecture' && /^assistant:/.test(info.sheet.sec) && /tab=e_home/.test(info.sheet.reopen), 'sheet points at the exact place: ' + JSON.stringify(info.sheet));
  chk(/دستیار/.test(info.sheet.title), 'title says the assistant filed it');
  info.ai = await p.evaluate(() => APP.callAI('x', 'y', { task: 'lla_assistant', maxTokens: 64 }).then(t => 'ok:' + t, e => 'err:' + (e.response ? e.response.status : e.message)));
  chk(!/422/.test(info.ai), 'the host accepts the assistant task: ' + info.ai);
  // the assistant sees the page's open sheets from the real server (no duplicates, knows what is pending)
  info.sheets = await p.evaluate(() => APP.HOST.sheets().then(l => l.map(x => x.number + ':' + x.title.slice(0, 90))));
  // عنوانِ برگه نزدِ مالک انسانی است (برچسب‌های ماشینیِ قلمرو/نوع در سطرِ دوم، نه در عنوان) — بازبینیِ اجرا ۲۰۲۶-۱۰-۱۵
  chk(info.sheets.some(x => /\[دستیار · کمبودِ سامانه\] /.test(x) && !/epi-territory|· build|· priority/.test(x)), 'HOST.sheets lists the filed sheet with a human title: ' + info.sheets);
  // attachments with no Drive: an honest message (never a silent text-only answer)
  info.files = await p.evaluate(() => APP.callAI('x', 'y', { task: 'lla_assistant', fileIds: [999], withMeta: true }).then(r => 'ok:' + JSON.stringify(r), e => 'err:' + e.message));
  chk(/err:/.test(info.files) && /پیدا نشد|درایو/.test(info.files), 'missing/undriven attachment is reported, not ignored: ' + info.files);
  console.log(JSON.stringify(info).slice(0, 600));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
