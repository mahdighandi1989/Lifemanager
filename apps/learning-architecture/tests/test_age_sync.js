// بستهٔ سن، بخشِ ۲ (بندِ ۳): یک تاریخِ تولد. در میزبان از پلِ میزبان (A.HOST.birth / setBirth ⇒ /api/identity-profile/date_of_birth)
// خوانده می‌شود؛ پشتیبان settings.profile.birth ِ خودِ صفحه؛ پرکردنِ خالی در هر دو سو (هیچ‌کدام مقدارِ موجودِ دیگری را بی‌صدا نمی‌نویسد)؛
// ثبتِ صریحِ کاربر در صفحه به هر دو می‌رود؛ نسخهٔ مستقل/GAS همان settings.profile.birth.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
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
    APP.S.loaded = true; const S = APP.S, AG = APP.AGE, out = {};
    if (!AG || typeof AG.syncHost !== 'function') return { api: false };
    out.api = true;
    const setL = d => { const st = S.settings(); st.profile = st.profile || {}; if (d) st.profile.birth = d; else delete st.profile.birth; S.saveSettings(st); };
    const local = () => (S.settings().profile || {}).birth || '';
    const saved = APP.HOST;
    function host(val, fail) { const h = { val: val, sets: [] }; h.birth = () => fail ? Promise.reject(new Error('x')) : Promise.resolve(h.val); h.setBirth = d => { h.sets.push(d); h.val = d; return Promise.resolve({ ok: true }); }; return h; }
    // ۱) میزبان دارد، صفحه ندارد ⇒ صفحه پر می‌شود؛ سن از تاریخِ میزبان
    setL(''); let H = host('1990-01-01'); APP.HOST = H; await AG.syncHost();
    out.fillPage = local() === '1990-01-01' && AG.birth() === '1990-01-01' && AG.age() === 36 && !H.sets.length;
    // ۲) میزبان ندارد، صفحه دارد ⇒ مقدارِ صفحه به میزبان نوشته می‌شود
    setL('1989-03-08'); H = host(''); APP.HOST = H; await AG.syncHost();
    out.fillHost = H.sets.length === 1 && H.sets[0] === '1989-03-08' && AG.birth() === '1989-03-08';
    // ۳) هر دو دارند و ناهم‌خوان ⇒ هیچ‌کدام بازنویسی نمی‌شود؛ یک حقیقت = مقدارِ میزبان (حسابِ کاربر)
    setL('1989-03-08'); H = host('1988-08-08'); APP.HOST = H; await AG.syncHost();
    out.conflict = local() === '1989-03-08' && !H.sets.length && AG.birth() === '1988-08-08';
    // ۴) ثبتِ صریح در صفحه (کارنامه/دستیار/کارت) ⇒ هر دو
    out.explicit = AG.setBirth('1987-07-07') === '' && local() === '1987-07-07' && H.val === '1987-07-07' && AG.birth() === '1987-07-07';
    out.doBirth = APP.ASSIST.DO.birth({ date: '1986-06-06' }) === '' && H.val === '1986-06-06' && local() === '1986-06-06';
    // ۵) شکستِ میزبان ⇒ پشتیبانِ صفحه، بی خطا
    setL('1989-03-08'); H = host(null, true); APP.HOST = H; await AG.syncHost();
    out.hostFail = AG.birth() === '1989-03-08';
    // ۶) مقدارِ بدشکلِ میزبان (مثلاً «۸ مارس») نادیده؛ پشتیبان می‌ماند و میزبان بازنویسی نمی‌شود
    H = host('8 March'); APP.HOST = H; await AG.syncHost(); out.badHost = AG.birth() === '1989-03-08' && !H.sets.length;
    // ۷) نسخهٔ مستقل: بی میزبان ⇒ فقط settings.profile.birth
    APP.HOST = null; await AG.syncHost(); setL('1995-05-05'); out.standalone = AG.birth() === '1995-05-05' && AG.setBirth('1996-06-06') === '' && local() === '1996-06-06';
    APP.HOST = saved;
    return out;
  });
  chk(r.api, 'APP.AGE.syncHost exists');
  if (r.api) {
    chk(r.fillPage, 'host has the date, page empty ⇒ page filled, age from the host date: ' + JSON.stringify(r));
    chk(r.fillHost, 'host empty, page has the date ⇒ written back to the host (fill-empty)');
    chk(r.conflict, 'both set and different ⇒ neither overwritten; the host value is the one read');
    chk(r.explicit && r.doBirth, 'explicit entry in the page goes to both the page and the host');
    chk(r.hostFail && r.badHost, 'host failure or malformed host value ⇒ the page\'s own value, nothing overwritten');
    chk(r.standalone, 'standalone mode keeps settings.profile.birth');
  }
  // پلِ میزبان در فرانت: birth و setBirth روی همان فیلدِ «من که هستم»
  // (the pytest runner copies tests/ into a sandbox and symlinks src/ ⇒ the repo root is found from the real path of src/)
  const repo = path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', '..', '..');
  const jsx = fs.readFileSync(path.join(repo, 'frontend', 'src', 'pages', 'LearningArchitecturePage.jsx'), 'utf8');
  chk(/birth:\s*\(\)\s*=>/.test(jsx) && /setBirth:\s*\(/.test(jsx) && /identity-profile\/date_of_birth/.test(jsx), 'host bridge exposes birth()/setBirth() over /api/identity-profile/date_of_birth');
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})().catch(e => { console.error(e); process.exit(1); });
