// کارزارِ v08 (ترسِ بی‌کاری تا ۹۱ روز): بندِ بحران پس از ردِ صریحِ کاربر تکرار نمی‌شود؛ پاسِ ماندگاری به کارنامه می‌رسد؛
// دوباره‌سنجیِ موقعیتِ نخست ثبت می‌شود؛ موعدِ گذشته (بازبینیِ پرونده) یادآور می‌گیرد.
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
  info.v = await p.evaluate(async () => {
    APP.S.loaded = true; const S = APP.S, AS = APP.ASSIST, out = {}, t0 = new Date(Date.now() - 3600e3).toISOString();
    const s = { id: 'ach_v8', type: 'achat', msgs: [], safetyAt: t0, tour: { facets: [], diag: {} } }; S.put(s);
    out.active = AS.safetyActive(s) === true;
    s.tour.diag.safety = { st: 'no', why: 'کاربر گفت: «نه، فکرِ آسیب به خودم ندارم»', at: new Date().toISOString() };
    out.cleared = AS.safetyActive(s) === false;
    s.tour.diag.safety.at = new Date(Date.now() - 7200e3).toISOString();   // ردِ پیشین، پیش از نشانهٔ تازه ⇒ هنوز فعال
    out.stillOnIfOlder = AS.safetyActive(s) === true;
    // ماندگاری: گرهِ ورزیده ۴۰ روز پیش، پاسخِ درست پس از روزِ ۳۰ ⇒ یک پاسِ ۳۰ روزه
    const solved = APP.addDays(APP.today(), -40);
    S.put({ id: 'kn_v8', type: 'knot', name: 'بدترین را قطعی دیدن', fam: 'F9', status: 'practised', solvedAt: solved + 'T10:00:00Z', log: [{ ok: true, at: APP.addDays(solved, 32) + 'T10:00:00Z' }] });
    const H = APP.PSY.holds(); out.hold = H.length === 1 && H[0].n === 30 && H[0].ok === true;
    const glr = APP.PSY.model().find(c => c.id === 'Glr'); out.glr = glr.self.n >= 1;
    const m = APP.MIND.model(); out.timeline = m.events.some(e => /ماندگاریِ 30 روزه/.test(e.fa));
    out.retCount = m.dims.some(d => d.ret.n >= 1 && d.ret.ok >= 1);
    // دوباره‌سنجی روی خودِ گره
    AS._turnSession = s;
    out.reBad = AS.DO.remeasure({ knot: 'nope' }) !== '';
    out.reOk = AS.DO.remeasure({ knot: 'kn_v8', freq: 'دو شب در ماه', intensity: 25 }) === '' && (S.get('kn_v8').remeasures || []).length === 1;
    out.reShown = APP.MIND.model().events.some(e => /📏 دوباره‌سنجی/.test(e.fa) && /دو شب در ماه/.test(e.fa));
    out.rule = /"do":"remeasure"/.test(AS.SYS) && /همان مقیاسِ فرم/.test(AS.SYS);
    return out;
  });
  chk(Object.values(info.v).every(Boolean), 'safety flag cleared only by the user\'s own later denial; retention passes reach the mind card; re-measure stored on the knot: ' + JSON.stringify(info.v));
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
