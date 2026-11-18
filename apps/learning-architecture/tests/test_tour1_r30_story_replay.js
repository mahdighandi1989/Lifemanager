// تورِ پولیا (دستهٔ ۱، دورِ ۳۰، سهمِ «story») — C101 (c) + C137 + C179: بازپخشِ صفحه‌ایِ اجراهای خودِ دونده‌ها (همان گام‌های ctl و همان جواب‌های ضبط‌شدهٔ مدل؛
//  tests/fixtures/r30_story/<گروه>_<sid>.json ساخته از T/round30X/<sid>). صفحه واقعاً اجرا می‌شود؛ فقط مدل ضبط‌شده است. ساعتِ صفحه همان ساعتِ اجرای دونده است (Playwright clock)؛
//  هیچ تاریخِ تقویمی در انتظارها نیست. هر بخش یک شناسهٔ خانواده/دم و یک سناریو؛ مقایسهٔ کلِ سناریو با خروجیِ دورِ ۳۰ (C179) در گزارشِ بازگشت است. ONLY=<پیشوند>.
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r26_replay.js');
const DIR = path.join(__dirname, 'fixtures', 'r30_story');

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0 }; const J = (x) => JSON.stringify(x); const K = {};
  const run = async (fx, upto, fn, arg) => { const R = await replay(b, fx, { dir: DIR, upto: upto || 0 }); try { const x = await R.p.evaluate(fn, arg); return { x, errors: R.errors, calls: R.calls }; } finally { await R.close(); } };
  /* همهٔ رویدادهای پرونده‌ها: [عنوانِ مسئله یا «S»، k، سطرها، عنوانِ رویداد] */
  const ALL = () => { const o = []; APP.liveAll().forEach(r => { const D = APP.dossier(r.p.id); (D.events || []).forEach(e => o.push([r.p.title, e.k, (e.lines || []).join(' ¦ '), e.title || '', e.at || ''])); });
    APP.S.all('achat', x => x && x.msgs && x.msgs.length).forEach(se => { (APP.dossier(se.id).events || []).forEach(e => o.push(['S', e.k, (e.lines || []).join(' ¦ '), e.title || '', e.at || ''])); }); return o; };
  const ALLS = '(' + ALL.toString() + ')()';
  const destNow = '(() => { const id = APP.ROUTE.openId(); const M = id ? APP.ROUTE.model(id) : null; return M ? M.dest : ""; })()';

  /* ---------- D25-8 (D، oD1* ×8): مقصدِ 🧭 هستهٔ مجهول ---------- */
  const d258 = (fx) => async () => { const R = await run(fx, 6, destNow); return [R.x === 'مادرم قرصِ امروزش رو برداشته یا نه' && !R.errors.length, J(R.x)]; };
  K.D25_8_D_oD1e = d258('D_oD1e'); K.D25_8_D_oD1g = d258('D_oD1g'); K.D25_8_D_oD1t = d258('D_oD1t');
  /* ---------- F15 / A30-8 (A s03 p17–p19): جمعِ «…» یک سطر، ✗ ِ «۱ + … + ۱۰ = ۵۰» ---------- */
  K.F15_A30_8_A_s03 = async () => { const R = await run('A_s03', 0, ALLS); const L = R.x.filter(r => r[1] === 'ccalc');
    const ok = L.some(r => /۱ \+ ۲ \+ … \+ ۲۰ = ۲۱۰ و ۱ \+ ۲ \+ … \+ ۱۰ = ۵۰/.test(r[2]) && /حسابِ صفحه: ✗/.test(r[2])) && !L.some(r => /^\+ /.test(r[2])) && !L.some(r => /2x \+ 3 = 11/.test(r[2]) && /نسنجیده/.test(r[2]));
    return [ok && !R.errors.length, J(L.map(r => r[2].slice(0, 160)))]; };
  /* ---------- F15 / C30-1 (C s24 p2): «a_2 = 2» نسنجیده نیست ---------- */
  K.F15_C30_1_C_s24 = async () => { const R = await run('C_s24', 0, ALLS); const L = R.x.filter(r => /a_2 = 2/.test(r[2]) && /^c/.test(r[1]));
    return [L.length >= 1 && L.every(r => !/نسنجیده/.test(r[2])) && !R.errors.length, J(L.map(r => r[2].slice(0, 220)))]; };
  /* ---------- F11 / A30-18 (A s08 p12): «برگردیم به معمای ۷ و ۱۱: …» زیرِ همان مسئله ---------- */
  K.F11_A30_18_A_s08 = async () => { const R = await run('A_s08', 0, ALLS); const L = R.x.filter(r => /برگردیم به معمای ساعت‌شنیِ ۷ و ۱۱/.test(r[2]));
    return [L.length >= 1 && L.every(r => /۷ و ۱۱/.test(r[0])) && !R.errors.length, J(L.map(r => [r[0], r[1]]))]; };
  /* ---------- F11 / B27·D7 (B aB2): مسئلهٔ ۲ کارِ گفت‌وگوی مسئلهٔ ۱ را ندارد ---------- */
  K.F11_B27_D7_B_aB2 = async () => { const R = await run('B_aB2', 0, ALLS); const L = R.x.filter(r => /1\+3\+5\+…\+99/.test(r[0]) && r[1] === 'chatwork');
    return [L.length >= 1 && !L.some(r => /استقرا|کشیدم! ۱ یه خونه/.test(r[2])) && !R.errors.length, J(L.map(r => r[2].slice(0, 80)))]; };
  /* ---------- C26-1 (C s21): پیامِ آغاز و مسئلهٔ زندهٔ ساخته از آن یک مسئله‌اند ---------- */
  K.C26_1_C_s21 = async () => { const R = await run('C_s21', 0, '(() => { const s = APP.ASSIST.cur(); const D = APP.dossierSess(s.id); return { g: APP.STORY.probGroups(s).length, st: D.statement.slice(0, 40), pks: (D.pks || []).length }; })()');
    return [R.x.g === 1 && !/مسئلهٔ ۲ از ۲/.test(R.x.st) && !R.errors.length, J(R.x)]; };
  /* ---------- C188 / D27-33 (D arD2 p12): توصیهٔ برادر دادهٔ او با منبع ---------- */
  K.C188_D27_33_D_arD2 = async () => { const R = await run('D_arD2', 0, ALLS); const L = R.x.filter(r => /کابل رو از مغازهٔ حسن آقا بگیرم/.test(r[2]) && r[1] === 'cdata');
    return [L.length >= 1 && L.some(r => /منبع: به گفتهٔ «داداشم»/.test(r[2])) && !R.errors.length, J(R.x.filter(r => /کابل/.test(r[2])).map(r => [r[1], r[2].slice(0, 160)]))]; };
  /* ---------- A30-19 (A s09 p23): گوینده «نوه‌ی همسایه‌مون» ---------- */
  /* در این بازپخش رکوردِ مسئله‌ای که سطر به آن رفت شناسهٔ دیگری گرفت (نگاشتِ شناسه‌ها)، پس گوینده از قلمِ داستان خوانده می‌شود — همان که logEv در 📜 می‌نویسد */
  K.A30_19_A_s09 = async () => { const R = await run('A_s09', 182, '(() => { const C = APP.ASSIST.cur().coach || {}; const o = []; Object.keys(C.story || {}).forEach(k => (C.story[k].items || []).forEach(x => { if (x.k === "other" && /۹ × ۹ = ۸۱/.test(x.t)) o.push(x.who); })); return o; })()');
    return [R.x.length >= 1 && R.x.every(w => w === 'نوه‌ی همسایه‌مون') && !R.errors.length, J(R.x)]; };
  /* ---------- B24·D15 (B bp1 p11): «درسته؟» پس از وارسیِ خودش ادعای محلِ بحث نیست ---------- */
  K.B24_D15_B_bp1 = async () => { const R = await run('B_bp1', 0, '1'); const c = R.calls.filter(x => /x²−9 = \(x−3\)\(x\+3\)\. درسته؟ با ضرب/.test(String(x.user).split('# نوبتِ تازه').pop()))[0];
    return [!!c && !/همین پیام چنین ادعایی است/.test(c.user) && !R.errors.length, c ? 'claim line present' : 'no call']; };
  /* ---------- C184 / A26-9 (A pA1 p3): بندِ «کافی/زائد/متناقض» یک پرسش با «یا» ---------- */
  K.C184_A26_9_A_pA1 = async () => { const R = await run('A_pA1', 0, '1'); const u = R.calls.map(x => String(x.user)).join('\n');
    return [!/کافی است، زائد است، متناقض است/.test(u) && !/کافی است؟ زائد است؟/.test(u) && !R.errors.length, (u.match(/[^\n]{0,60}کافی است[^\n]{0,60}/g) || []).slice(0, 3).join(' | ')]; };
  /* ---------- C186 / D26-28 (A aA1): وارسیِ خودش در پیام‌هایش را صفحه خودش می‌یابد ---------- */
  K.C186_A_aA1 = async () => { const R = await run('A_aA1', 0, ALLS); const L = R.x.filter(r => r[1] === 'verdict');
    return [L.length >= 1 && L.every(r => /^وارسی شد — با پیام‌های خودت/.test(r[2]) && /پیامِ وارسی: «۶ و ۶ و ۶ میشه ۱۸/.test(r[2])) && !R.errors.length, J(L.map(r => r[2].slice(0, 200)))]; };

  /* ---------- C186 / D26-28 (D s33): حکمِ خودِ صفحه («رد شد … وارسی شد») کنارِ «از پیام‌های خودت سنجیده نشد» نمی‌آید ---------- */
  K.C186_D_s33 = async () => { const R = await run('D_s33', 0, ALLS); const L = R.x.filter(r => r[1] === 'verdict');
    return [L.length >= 1 && L.every(r => !/سنجیده نشد/.test(r[2]) && /نتیجهٔ وارسی: نتیجه سالم ماند/.test(r[2])) && !R.errors.length, J(L.map(r => r[2].slice(0, 220)))]; };
  /* ---------- B27·D7 هم‌شکلِ منفی (B tB1، پسرفتِ C179): پیامی که مسئله از آن زاده شد در «کارِ تو در گفت‌وگو» ِ همان مسئله می‌ماند ---------- */
  K.B27_D7_neg_B_tB1 = async () => { const R = await run('B_tB1', 0, ALLS); const L = R.x.filter(r => r[1] === 'chatwork' && /^سلام\. یه ایده دارم و می‌خوام از ایده برسم/.test(r[2]));
    return [L.length >= 1 && !R.errors.length, J(L.length)]; };

  for (const k of Object.keys(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').some(o => k.indexOf(o) === 0)) continue; info.n++;
    try { const r = await K[k](); if (r[0]) info.ok++; else errors.push(k + ' ⇒ ' + String(r[1]).slice(0, 1200)); } catch (e) { errors.push(k + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
