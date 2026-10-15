// «♾ بک‌تستِ پیوسته» در صفحه (۲۰۲۶-۱۰-۱۳): پیش‌فرضِ «اعتبارسنجی»؛ همان دفترِ backtest/ را نشان می‌دهد؛ تصمیمِ مالک دربارهٔ
// پیشنهادِ تغییرِ قاعده در رکوردِ ebtp_<id> ذخیره می‌شود؛ وقایعِ افزوده تحلیلِ خودشان را درجا نشان می‌دهند؛ دیدنِ «سه آزمون» دیگر
// ردیفِ «دستی» در تاریخچه نمی‌نویسد.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  await p.goto(FILE); await p.waitForSelector('.nav');
  await p.evaluate(() => { APP.go('e_bt'); }); await p.waitForTimeout(300);
  info.d = await p.evaluate(() => { const L = window.EPI_BT_LEDGER; const last = L.ledger.rounds[L.ledger.rounds.length - 1];
    return { rounds: L.ledger.rounds.length, findings: L.findings.findings.length, shown: document.querySelectorAll('main .bt-finding').length,
      stats: document.querySelectorAll('main .bt-stat').length, live: !!document.querySelector('main .bt-live'), n: last && last.corpus.n }; });
  chk(info.d.live && info.d.rounds >= 1 && info.d.stats === 6 && info.d.shown === info.d.findings, 'live panel mirrors the ledger ' + JSON.stringify(info.d));
  // پیشنهاد ⇒ تصمیم ذخیره می‌شود
  await p.evaluate(() => { window.EPI_BT_LEDGER.proposals = { proposals: [{ id: 'p_test', title: 'پیشنهادِ آزمایشی', why: 'w', evidence: 'e' }] }; APP.render(); });
  await p.waitForTimeout(150);
  await p.click('main .bt-proposal button:has-text("بپذیر")'); await p.waitForTimeout(150);
  chk(await p.evaluate(() => (APP.S.get('ebtp_p_test') || {}).decision) === 'yes' && /پذیرفته/.test(await p.locator('main .bt-proposal').innerText()), 'owner decision stored');
  // واقعهٔ افزوده: تحلیل درجا
  await p.evaluate(() => { window.EPI_BT_LEDGER.results.cases.unshift({ id: 'r9_x', t: 'واقعهٔ تازه', tier: 'real', r: 2, d: 'علم', ok: false, k: 'missed', fl: [], ex: ['st_istiqra'], story: 'روایت', why: 'چرا', right: 'راهِ درست', fx: ['اصلاح'], src: ['منبع'] }); APP.render(); });
  await p.waitForTimeout(150);
  await p.locator('main details:has(summary:has-text("حکمِ آخرین دور")) summary').first().click();
  chk(await p.locator('main details.bt-ev').count() >= 1, 'added events show their own analysis inline');
  // دیدنِ «سه آزمون» ⇒ بی ردیفِ تازه در تاریخچه
  const n0 = await p.evaluate(() => APP.S.all('ebt').length);
  await p.evaluate(() => APP.go('e_bt', null, 'three')); await p.waitForTimeout(400);
  chk(await p.evaluate(() => APP.S.all('ebt').length) === n0, 'viewing the three tests records nothing');
  await p.click('main button:has-text("اجرای دوباره")'); await p.waitForTimeout(400);
  chk(await p.evaluate(() => APP.S.all('ebt').length) === n0 + 1, 'the explicit re-run records one row');
  console.log(JSON.stringify(info));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
