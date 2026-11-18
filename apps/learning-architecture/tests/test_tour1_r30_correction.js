// تورِ پولیا (دستهٔ ۱، دورِ ۳۰، ۲۰۲۶-۱۱-۱۸) — DECISIONS_R30 F8 «CORRECTION» (fixer «correction»؛ C178 پیکره: tests/variants/CORPUS_R30_F8.json).
//  هر fixture (tests/fixtures/r30_correction/<گروه>_<سناریو>.json از T/round30X/<sid>/ctl و ai) یک بار کامل بازپخش می‌شود (همان گام‌های دونده، همان جواب‌های مدل؛ tests/tour1_r26_replay.js)،
//  سپس سطرهای سامانهٔ هر نوبتِ او (پس از پیامش تا پیامِ بعدی‌اش) با انتظارِ پیکره سنجیده می‌شود. «Reproduce first»: هر مورد روی BASE30 (5c7ce364) قرمز بود — LLA_FILE=<ساختِ BASE30>.
//  هیچ تاریخِ تقویمی در انتظارها نیست (ساعتِ صفحه روی روزِ همان اجرا ثابت است). ONLY=B_nB3,… فقط همان fixtureها.
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r26_replay.js');
const DIR = path.join(__dirname, 'fixtures', 'r30_correction');
const turns = () => { const out = []; APP.ASSIST.sessions().slice().reverse().forEach(s => { let cur = null; (s.msgs || []).forEach(m => { if (m.role === 'user') { cur = { u: m.text, sys: [] }; out.push(cur); } else if (m.role === 'sys' && cur) cur.sys.push(m.text); }); }); return out; };
const has = (L, ...xs) => xs.every(x => L.indexOf(x) >= 0);
// [corpus id, user-turn regex, check(sysText) ⇒ bool]
const CASES = {
  B_nB3: [
    ['F8-023', /مهمون‌ها ۲۵ نفر نیستن، ۲۷/, L => has(L, '۸ میلیون ⇒ ۸ میلیون و ۶۴۰', '۱۰ میلیون و ۴۰۰ ⇒ ۱۱ میلیون و ۴۰', '۱ میلیون و ۶۰۰ ⇒ ۹۶۰ هزار', '۹۶ هزار ⇒ ۸۸ و ۸ نهم ≈ ۸۸٫۸۹ هزار') && !/۵۰ منهای ۴۲/.test(L)],
    ['F8-024', /۲۷ هم نمیشه، ۲۸/, L => has(L, '۸ میلیون ⇒ ۸ میلیون و ۹۶۰', '۱۱ میلیون و ۳۶۰', '۶۴۰ هزار', '۸۵ و ۵ هفتم ≈ ۸۵٫۷۱ هزار')],
    ['F8-025', /همون ۸ میلیون و ۶۴۰/, L => /کهنه/.test(L) && has(L, '«۲۷»', '۸ میلیون و ۹۶۰') && !/پذیرفتی/.test(L)],
    ['F8-026', /۳۲۰ نیست، ۳۵۰ هزاره/, L => has(L, '۹ میلیون و ۸۰۰', '۱۲ میلیون و ۲۰۰', '−۲۰۰ هزار')],
    ['F8-027', /همون ۲۷ درست بود/, L => has(L, '۹ میلیون و ۴۵۰', '۱۱ میلیون و ۸۵۰', '۱ میلیون و ۶۰۰ ⇒ ۱۵۰ هزار', '۸۸ و ۸ نهم')],
    ['F8-028', /سالن ۲ میلیون و ۴۰۰ نیست/, L => has(L, 'از «۲ میلیون و ۴۰۰»', '۱۰ میلیون و ۴۰۰ ⇒ ۱۲ میلیون و ۱۵۰', '۱ میلیون و ۶۰۰ ⇒ −۱۵۰ هزار', '۹۶ هزار ⇒ ۱۰۰ هزار') && !/۴۰۰ ⇒ ۷۰۰/.test(L)],
    ['F8-030', /میزِ دوم ۸ برش/, L => has(L, '۴۲ ⇒ ۴۳') && !/۲۵ ⇒|۹۶ هزار ⇒|۴۲ ⇒ ۴۸|گام‌های ۱، ۳، ۴/.test(L)],
  ],
  C_s23: [
    ['F8-009', /۱۸ تا نمیشن، ۱۶ تا میشن/, L => !/نشانهٔ اصلاح/.test(L)],
  ],
  A_s04: [
    ['F8-064', /پس ۶ نفریم نه ۵/, L => has(L, '۱ و ۵ ششم ≈ ۱٫۸۳', '۱۸۳۳ و ۱ سوم ≈ ۱۸۳۳٫۳۳', '۱۸۳ و ۱ سوم ≈ ۱۸۳٫۳۳')],
  ],
};
(async () => {
  const b = await chromium.launch(); const errors = [], res = {};
  for (const fx of Object.keys(CASES)) { if (process.env.ONLY && !process.env.ONLY.split(',').includes(fx)) continue; let R = null;
    try { R = await replay(b, fx, { dir: DIR }); const T = await R.p.evaluate(turns); R.errors.forEach(e => errors.push(fx + ' page error: ' + e));
      CASES[fx].forEach(([id, re, ck]) => { const t = T.filter(x => re.test(x.u)).pop(); const L = t ? t.sys.join(' ¦ ') : ''; const ok = !!t && ck(L); res[id] = ok; if (!ok) errors.push(id + ' (' + fx + ') :: ' + (t ? L.slice(0, 900) : 'turn not found')); });
    } catch (e) { errors.push(fx + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); }
    if (R) await R.close(); }
  await b.close();
  console.log(JSON.stringify(res));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('OK test_tour1_r30_correction', Object.keys(res).length);
})();
