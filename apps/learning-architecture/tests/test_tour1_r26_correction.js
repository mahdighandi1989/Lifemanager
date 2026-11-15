// تورِ پولیا (دستهٔ ۱، دورِ ۲۶، ۲۰۲۶-۱۱-۱۲) — DECISIONS_R26، خانوادهٔ Q2 «CORRECTION REACHES EVERYTHING BUILT ON IT, AND NOTHING ELSE» (fixer «correction»).
//  بخشِ یکم: نقص‌های گروهِ B (U-table ِ داورِ کور، COMPARE26_judge) با **نوبتِ خودِ دونده** — بازپخشِ همان گام‌ها و همان جواب‌های مدل روی صفحهٔ ساخته‌شده (tests/tour1_r26_replay.js).
//  بخشِ دوم (گروه‌های A، C، D): tests/test_tour1_r26_correction_acd.js ؛ بانکِ مستقل: tests/test_tour1_r26_correction_bank.js. LLA_R26_ONLY=نام،نام فقط همان موردها.
const { chromium } = require('playwright');
const { replay } = require('./tour1_r26_replay.js');
const { CASES, SNAP, J } = require('./tour1_r26_correction_cases.js');
const GROUP = process.env.LLA_R26_GROUP || 'B';
(async () => {
  const b = await chromium.launch(); const errors = [], info = {};
  const names = Object.keys(CASES).filter(n => (GROUP === 'B' ? /^B_/.test(n) : !/^B_/.test(n)) && (!process.env.LLA_R26_ONLY || process.env.LLA_R26_ONLY.split(',').includes(n)));
  for (const n of names) { const c = CASES[n]; let r;
    try { const R = await replay(b, n, { upto: c.upto || 0 }); const x = await R.p.evaluate(SNAP);
      x.unk = await R.p.evaluate(() => (APP.ASSIST.cur().coach || {}).unkBy || {});
      /* نوار همان مدلِ 🧭 است (APP.ROUTE.model — همان «مانده» که ROUTE.strip می‌نویسد): برای سشن و برای هر مسئلهٔ زندهٔ آن */
      if (c.strip) x.stripText = await R.p.evaluate(() => { const s = APP.ASSIST.cur(), ids = [s.id].concat((APP.liveAll ? APP.liveAll() : []).map(r => r.p.id)); return ids.map(id => { try { const M = APP.ROUTE.model(id); return M ? 'مانده: ' + M.remain : ''; } catch (e) { return 'ERR ' + e.message; } }).filter(Boolean).join(' ‖ '); });
      if (R.errors.length) errors.push(n + ' page errors: ' + R.errors.join(' | '));
      r = c.check(x); await R.close(); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; }
    /* موردِ «نکرده» (notDone): اجرا می‌شود و دلیلش چاپ می‌شود — سبز شدنش خبر است، قرمزش دروازه را نمی‌بندد (گزارش در WORKLOG ۱۳۱) */
    if (c.notDone) { info[c.name] = r.ok ? true : 'NOT DONE — ' + c.notDone; console.log('NOT DONE ' + c.name.slice(0, 60) + ' :: ' + c.notDone); continue; }
    info[c.name] = !!r.ok; if (!r.ok || process.env.LLA_R26_GOT) (r.ok ? console.log : (t) => errors.push(t))(c.name + ' got ' + J(r.got).slice(0, +process.env.GOTN || 1600)); }
  console.log(J({ group: GROUP, runners: info }));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
