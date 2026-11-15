// تورِ پولیا (دستهٔ ۱، دورِ ۲۷، ۲۰۲۶-۱۱-۱۵) — DECISIONS_R27 خانوادهٔ R2 «CORRECTION ENGINE» (C47، C48، C66، C67؛ fixer «correction»).
//  نقص‌های گروه‌های A، B، C، D با **نوبتِ خودِ دونده** — بازپخشِ همان گام‌ها و همان جواب‌های مدل روی صفحهٔ ساخته‌شده (tests/tour1_r26_replay.js با opt.dir).
//  سنجه‌ها در tests/tour1_r27_correction_cases.js (هر کدام «base» = آنچه BASE27 داد). LLA_R27_ONLY=نام،نام فقط همان موردها.
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r26_replay.js');
const { CASES, SNAP, J } = require('./tour1_r27_correction_cases.js');
const DIR = path.join(__dirname, 'fixtures', 'r27_correction');
(async () => {
  const b = await chromium.launch(); const errors = [], info = {};
  const names = Object.keys(CASES).filter(n => !process.env.LLA_R27_ONLY || process.env.LLA_R27_ONLY.split(',').includes(n));
  for (const n of names) { const c = CASES[n]; let r;
    try { const R = await replay(b, c.fx, { dir: DIR, upto: c.upto || 0 }); const x = await R.p.evaluate(SNAP);
      if (c.strip) x.stripText = await R.p.evaluate(() => { const s = APP.ASSIST.cur(), ids = [s.id].concat((APP.liveAll ? APP.liveAll() : []).map(r => r.p.id)); return ids.map(id => { try { const M = APP.ROUTE.model(id); return M ? 'مانده: ' + M.remain : ''; } catch (e) { return 'ERR ' + e.message; } }).filter(Boolean).join(' ‖ '); });
      if (R.errors.length) errors.push(n + ' page errors: ' + R.errors.join(' | '));
      r = c.check(x); await R.close(); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; }
    info[n] = !!r.ok; if (!r.ok || process.env.LLA_R27_GOT) (r.ok ? console.log : (t) => errors.push(t))(n + ' — ' + c.name.slice(0, 90) + ' got ' + J(r.got).slice(0, +process.env.GOTN || 1600)); }
  console.log(J({ runners: info }));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
