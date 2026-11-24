// دست‌به‌دستِ h…c5a0 (بک‌تست دورِ ۴۵): سطرِ «پیشنهادهای منتظرِ تصمیمِ مالک» در پرامپتِ دستیار سقف دارد —
// با هر چند پیشنهادِ بی‌تصمیم، در صفحهٔ بلند هر فیلد و دکمه می‌ماند؛ در نوبتِ عادی سطر کامل است. روی dist/learning-architecture.html
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(300);
  const chk = (cond, msg) => { if (!cond) errors.push(msg); };
  const run = (n) => p.evaluate((n) => {
    APP.S.loaded = true;
    const AS = APP.ASSIST, m = document.getElementById('main'), keep = m.innerHTML, LG = window.EPI_BT_LEDGER = window.EPI_BT_LEDGER || {}, old = LG.proposals;
    LG.proposals = { proposals: Array.from({ length: n }, (_, i) => ({ id: 'p_budget_probe_number_' + i, title: 'پیشنهادِ آزمونیِ شمارهٔ ' + i + ' با عنوانی بلند که تا شصت نویسه در نقشه می‌آید و جا می‌گیرد' })) };
    const normal = AS.prompt(AS.newSession(), 'پیامِ تازه', AS.scan(), '');
    m.innerHTML = '<p>' + 'متنِ توضیحیِ بسیار بلندِ صفحه '.repeat(2500) + '</p>' + Array.from({ length: 140 }, (_, i) => '<label>فیلدِ ' + i + ' <textarea>' + 'پاسخِ بلندِ کاربر '.repeat(60) + '</textarea></label>').join('') + '<button type="button">موضوع بساز</button>';
    const u = AS.prompt(AS.newSession(), 'پیامِ تازه', AS.scan(), ''); m.innerHTML = keep; LG.proposals = old;
    const line = (t) => (t.split('\n').find(l => /^## پیشنهادهای منتظرِ/.test(l)) || '');
    return { n, len: u.length, last: u.includes('«فیلدِ 139»'), btn: u.includes('«موضوع بساز»'), cut: /بقیهٔ فهرستِ این صفحه/.test(u), msg: /پیامِ تازه\s*$/.test(u),
      longLine: line(u).length, longSays: line(u).slice(0, 160), says: new RegExp('(?:^|[^0-9])' + n + ' پیشنهاد').test(line(u)) || (line(u).match(/ «پیشنهادِ آزمونیِ/g) || []).length === n, normalTitles: (line(normal).match(/ «پیشنهادِ آزمونیِ/g) || []).length, normalLen: normal.length,
      areas: /## چه کسی مسئولِ چیست/.test(u) };
  }, n);
  const out = [];
  for (const n of [12, 40, 150]) {
    const r = await run(n); out.push(r);
    chk(r.len <= 58000 && r.last && r.btn && !r.cut && r.msg, n + ' pending proposals: on a long page every field and button (and the new message) stays :: ' + JSON.stringify(r));
    chk(r.says, n + ': the compacted line still says how many are waiting (or is whole) :: ' + r.longSays);
    chk(r.areas, n + ': «چه کسی مسئولِ چیست» is never dropped');
    chk(r.normalLen <= 58000, n + ': the normal-page prompt fits');
  }
  /* در نوبتِ عادی با شمارِ امروز (۱۲) سطر کامل است — عنوانِ همه دیده می‌شود */
  chk(out[0].normalTitles === 12, 'normal page, 12 pending: every title is in the map :: ' + out[0].normalTitles);
  /* سهمِ سطر از بودجه در صفحهٔ بلند با شمار بزرگ نمی‌شود (۱۵۰ تا ⇒ همان سطرِ شمار) */
  chk(out[2].longLine < 400, '150 pending: the line is capped on a long page :: ' + out[2].longLine);
  console.log(JSON.stringify(out, null, 1));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
