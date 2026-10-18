// بستهٔ سن، بخشِ ۲ (بندِ ۵): کارنامه فقط با هنجارِ گروهِ سنیِ خودِ کاربر، با منبع.
// تاریخِ تولدِ نامعلوم ⇒ پرسیدنِ تاریخ (نه N(0,1) با برچسبِ غلط)؛ سنِ بیرون از پوششِ منبع (زیرِ ۱۸) یا خانهٔ کم‌جمعیتِ ۵۰+ ⇒
// «برای این سن هنجارِ معتبر در دست نیست» و فقط روندِ خودش — بی عددِ ساختگی، بی تشویق.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const errors = []; const chk = (c, m) => { if (!c) errors.push(m); };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'Asia/Tehran', locale: 'fa-IR' });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.clock.install({ time: new Date('2026-10-18T10:00:00+03:30') });
  await p.goto(FILE); await p.waitForSelector('.nav');
  const r = await p.evaluate(async () => {
    APP.S.loaded = true; const S = APP.S, P = APP.PSY, out = {};
    const setB = d => { const st = S.settings(); st.profile = st.profile || {}; if (d) st.profile.birth = d; else delete st.profile.birth; S.saveSettings(st); };
    const N = P.norms(), mars = N.scales.find(s => s.id === 'mars_ib_rc');
    // دادهٔ منبع: پوششِ سنیِ هر منبع و خانهٔ کم‌جمعیتِ ۵۰ تا ۷۴ با دلیل
    out.srcAges = N.sources.find(s => s.id === 'zorowitz2024').ages && N.sources.find(s => s.id === 'zorowitz2024').ages.lo === 18;
    const b50 = mars.bands.find(x => x.lo === 50); out.thin = b50 && b50.valid === false && /69/.test(b50.invalid_why || '') && /54/.test(b50.invalid_why || '');
    out.research = /Chierchia/.test(N.age_research || '') && /rejected|رد/i.test(N.age_research || '');
    // دو پاسخِ لنگردار
    const anchors = N.items.filter(it => it.scale === 'mars_ib_rc').slice(0, 2);
    anchors.forEach((it, i) => S.put({ id: 'pa_t' + i, type: 'psyans', item: it.id, ok: i === 0, at: new Date().toISOString() }));
    // بی تاریخِ تولد: هیچ برآوردِ جمعیتی (نه N(0,1))؛ پرسیدنِ تاریخ
    setB('');
    let e = P.scaleEst('mars_ib_rc'); out.noBirth = e.none === 'birth' && e.pAbove == null && e.pct == null && e.n === 2;
    APP.go('mind'); await new Promise(r => setTimeout(r, 400));
    let cell = (document.querySelector('#main .psy-table tr[data-c=Gf]') || {}).textContent || '';
    out.cellBirth = /تاریخِ دقیقِ تولد/.test(cell) && !/صدکِ مورد انتظار/.test(cell) && !/کلِ نمونه/.test(cell);
    const ageRow = (document.querySelector('#main .psy-age') || {}).textContent || ''; out.why = /تاریخِ دقیقِ تولد/.test(ageRow) && /هم‌سن/.test(ageRow);
    // کودکِ ۱۰ ساله: بیرون از پوششِ منبع ⇒ جملهٔ صادقانه، فقط روندِ خودش
    setB('2016-04-04'); e = P.scaleEst('mars_ib_rc'); out.childNone = e.none === 'age' && e.pAbove == null;
    APP.go('home'); APP.go('mind'); await new Promise(r => setTimeout(r, 400));
    cell = document.querySelector('#main .psy-table tr[data-c=Gf]').textContent;
    out.childCell = cell; out.childLine = /برای این سن هنجارِ معتبر در دست نیست/.test(cell) && !/صدک|میانهٔ/.test(cell) && !/(آفرین|عالی|خوب است)/.test(cell) && /روندِ خودت/.test(cell);
    // ۶۸ ساله: خانهٔ کم‌جمعیت ⇒ همان جمله
    setB('1958-01-01'); e = P.scaleEst('mars_ib_rc'); out.oldNone = e.none === 'age';
    // ۳۷ ساله: گروهِ ۳۰ تا ۳۹ با منبع (بی‌تغییر)
    setB('1989-03-08'); e = P.scaleEst('mars_ib_rc'); out.adult = e.aged && /۳۰ تا ۳۹/.test(e.peers) && e.pAbove > 0 && e.pAbove < 1;
    // گویهٔ توصیفی: کم‌سال ⇒ بی درصدِ بزرگسالان؛ بی تاریخ ⇒ پرسیدن
    const d = N.items.find(it => it.kind === 'descriptive');
    out.bandMinor = P.bandP(d, 10) === null;
    setB('2016-04-04');
    S.put({ id: 'pa_d', type: 'psyans', item: d.id, ok: true, at: new Date().toISOString() });
    APP.go('home'); APP.go('mind'); await new Promise(r => setTimeout(r, 400));
    const rq = document.querySelector('#main .psy-table tr[data-c=' + d.construct + ']').textContent;
    out.descMinor = /برای این سن هنجارِ معتبر در دست نیست/.test(rq) && !/درست گفته بودند/.test(rq);
    out.descTxt = rq;
    // متنِ دستیار و گزارش هم همان
    out.assist = /هنجارِ معتبر در دست نیست/.test(APP.PSY.popFa(P.scaleEst('mars_ib_rc')));
    return out;
  });
  const show = JSON.stringify(r, null, 1);
  chk(r.srcAges && r.thin && r.research, 'norms.json: source age coverage, thin 50–74 cell marked invalid with the verified reason, age research recorded: ' + show);
  chk(r.noBirth && r.cellBirth && r.why, 'missing birth ⇒ ask for the exact date (with why), never N(0,1): ' + show);
  chk(r.childNone && r.childLine && r.oldNone, 'out of the source\'s bands ⇒ the honest line and own trend only: ' + show);
  chk(r.adult, 'adult in a covered band still compares with the same-age band of the source');
  chk(r.bandMinor && r.descMinor && r.assist, 'descriptive items and assistant text follow the same rule: ' + show);
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})().catch(e => { console.error(e); process.exit(1); });
