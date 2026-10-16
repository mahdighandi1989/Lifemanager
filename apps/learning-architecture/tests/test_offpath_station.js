// ایستگاهِ بیرون از مسیر (تورِ پولیا دورِ ۲، s32): دکمهٔ «ثبت و افزودن به مسیر» دارد و ثبتش آن را به مسیرِ پرونده می‌افزاید تا شمرده شود.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav');
  const o = await p.evaluate(async () => {
    APP.S.loaded = true; const cs = APP.newCase({ title: 't', input: 'فروش بعد از تبلیغ بالا رفت پس تبلیغ علت بود' });
    const inR = () => APP.routeOf(APP.S.get(cs.id)).filter(x => x.inRoute).map(x => x.s.id).includes('st_istiqra');
    const out = { before: inR() };
    APP.go('e_case', cs.id, 'st_istiqra'); await new Promise(r => setTimeout(r, 200));
    const btn = () => [...document.querySelectorAll('#main .strun .btn')].find(x => /^ثبت و/.test(x.textContent));
    out.label = btn() && btn().textContent;
    // الزامی‌ها را با ابزارِ خودِ کاربرگ دور بزن: _validate را برای آزمون خالی کن (رفتارِ اعتبارسنجی جای دیگر آزموده شده)
    const c = APP.S.get(cs.id); c.st.st_istiqra = c.st.st_istiqra || { data: {}, rubric: [] }; APP.S.put(c);
    const ws = document.querySelector('#main .strun .ws, #main .strun [class*="ws"]'); if (ws && ws._validate) ws._validate = () => [];
    btn().click(); await new Promise(r => setTimeout(r, 200));
    out.after = inR(); out.done = !!(APP.S.get(cs.id).st.st_istiqra || {}).done;
    return out;
  });
  const ok = o.before === false && o.label === 'ثبت و افزودن به مسیر' && o.after === true && o.done === true;
  if (!ok) errors.push('off-path station: ' + JSON.stringify(o));
  console.log(JSON.stringify(o)); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})().catch(e => { console.log('ERRORS ' + e.message); process.exit(1); });
