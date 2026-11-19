// تورِ پولیا (دستهٔ ۱، دورِ ۳۰، سهمِ «forecast») — C101 (ج) + C137 + C179: بازپخشِ صفحه‌ای در هر چهار گروه. هر fixture (tests/fixtures/r30_forecast/*.json) همان گام‌های
// کنترلِ دونده (ctl/cN.json ِ T/round30X) و همان جواب‌های مدلی است که او گرفت (ai/rN.txt، جفت‌شده با «نوبتِ تازه»ی همان فراخوان)، با ساعتِ همان اجرا.
// صفحه واقعاً اجرا می‌شود؛ فقط آن‌چه صفحه از حرفِ خودِ او می‌سازد وارسی می‌شود. LLA_FILE = ساختِ دیگر؛ ONLY=<نامِ fixtureها با ویرگول>.
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r26_replay.js');
const DIR = path.join(__dirname, 'fixtures', 'r30_forecast');

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0 };
  const state = (R) => R.p.evaluate(() => { const o = { sys: [], fc: [], dq: [] };
    APP.S.all('achat').forEach(s => { (s.msgs || []).forEach(m => { if (m.role === 'sys' && /🎯|📅/.test(m.text)) o.sys.push(m.text); }); });
    APP.S.all('fcast').filter(x => !x.sample && x.by !== 'user').forEach(x => o.fc.push({ q: x.q, p: x.p, due: x.due || '', out: x.outcome || '' }));
    try { o.dq = (APP.dueList() || []).filter(x => x.k === 'dq').map(x => x.txt); } catch (e) { o.dq = ['ERR ' + e.message]; } return o; });
  const J = (x) => JSON.stringify(x).slice(0, 1200);
  const latin = (S) => S.sys.some(x => /🎯/.test(x) && /[۰-۹]\.[۰-۹]/.test(x)) || S.fc.some(f => /[۰-۹]\.[۰-۹]/.test(f.q));
  /* موعدِ 🎯 هرگز با سطر/ردیفِ «📅» ِ برنامه (D30-3، C30-17، A30-14 #3) */
  const fcPlan = (S) => { const Q = S.fc.map(f => f.q); return S.sys.some(x => /^📅 پرسشِ تاریخ بی‌جواب ماند/.test(x) && Q.some(q => x.indexOf('«' + q.slice(0, 40)) >= 0)) || S.dq.some(x => /^📅/.test(x) && Q.some(q => x.indexOf('«' + q.slice(0, 40)) >= 0)); };
  const K = {
    /* A30-13 (p36) بی 🎯؛ A30-14 (p37–p38) متنِ 🎯 بی بندِ داده و «۶٫۵»؛ موعدِ 🎯 بی سطرِ 📅 */
    A_s05: async (R) => { const S = await state(R), bad = [];
      if (S.fc.some(f => /سرِ جلسه/.test(f.q))) bad.push('A30-13');
      if (!S.fc.some(f => /^باتری‌ش حدودِ ۶٫۵ ساعت دوام بیاره$/.test(f.q)) || S.fc.some(f => /تخفیف/.test(f.q))) bad.push('A30-14 text');
      if (latin(S)) bad.push('latin'); if (fcPlan(S)) bad.push('📅 for 🎯');
      return [!bad.length, bad.join(',') + ' ' + J([S.dq, S.sys.filter(x => /^📅/.test(x))])]; },
    /* C30-19 (p56) بی 🎯؛ C30-20 (p57) دو 🎯؛ C30-18 (p60) پرسشِ «حدودِ ۶»؛ C30-17 (p32/p45/p54) */
    C_pwC2: async (R) => { const S = await state(R), bad = [];
      if (S.fc.some(f => /آزمایشِ اولم/.test(f.q))) bad.push('C30-19');
      if (!(S.fc.some(f => /^این ترم قبول میشم$/.test(f.q) && f.p === 80) && S.fc.some(f => /^معدلم بالای ۱۷ میشه$/.test(f.q) && f.p === 50))) bad.push('C30-20');
      if (!S.sys.some(x => /این ۶٫۵ «حدودِ ۶» حساب می‌شود؟/.test(x))) bad.push('C30-18');
      if (fcPlan(S)) bad.push('C30-17'); if (latin(S)) bad.push('latin');
      return [!bad.length, bad.join(',') + ' ' + J([S.fc, S.sys.filter(x => /حدودِ ۶|بی‌جواب/.test(x))])]; },
    /* B30·D17 (p5→p14) دو 🎯 و «نمودارها نه» ⇒ نشد؛ B30·D16 (p4) بی «پنجشنبه درسته»؛ B30·D4 (p15) «۱۳٫۵» */
    B_dB3: async (R) => { const S = await state(R), bad = [], jd = S.fc.filter(f => /جدولِ محوری/.test(f.q)), nm = S.fc.filter(f => /نمودارها/.test(f.q));
      if (!(jd.length === 1 && nm.length === 1 && jd[0].out === 'شد' && nm[0].out === 'نشد' && !/۶۰ درصد/.test(jd[0].q))) bad.push('B30·D17');
      if (S.sys.some(x => /«پنجشنبه درسته»/.test(x)) || S.dq.some(x => /پنجشنبه درسته/.test(x))) bad.push('B30·D16');
      if (!S.sys.some(x => /این ۱۴ «حدودِ ۱۳٫۵» حساب می‌شود؟/.test(x)) || latin(S)) bad.push('B30·D4'); if (fcPlan(S)) bad.push('📅 for 🎯');
      return [!bad.length, bad.join(',') + ' ' + J([S.fc, S.dq])]; },
    /* B30·D5 (c26→c28) «نشد» ِ او روی همان 🎯 بی «کدام؟»؛ B30·D4 (c26) «۶٫۵» */
    B_dB2: async (R) => { const S = await state(R), bad = [], f = S.fc.filter(x => /شنبه‌ی بعد حدودِ ۶٫۵/.test(x.q))[0];
      if (!f || f.out !== 'نشد' || S.sys.some(x => /کدام پیش‌بینی/.test(x) && /شنبه‌ی بعد/.test(x))) bad.push('B30·D5');
      if (!S.sys.some(x => /این ۷ «حدودِ ۶٫۵» حساب می‌شود؟/.test(x)) || latin(S)) bad.push('B30·D4');
      return [!bad.length, bad.join(',') + ' ' + J([S.fc, S.sys.filter(x => /۶٫۵|کدام/.test(x))])]; },
    /* D30-14 (s30) «۶٫۵»؛ D30-3 (s23–s25) موعدِ 🎯 بی سطر/ردیفِ 📅؛ F6-071 «… دیروز بانک تعطیل بوده» بی 🎯 */
    D_tD4: async (R) => { const S = await state(R), bad = [];
      if (!S.sys.some(x => /این ۷ «حدودِ ۶٫۵» حساب می‌شود؟/.test(x)) || latin(S)) bad.push('D30-14'); if (fcPlan(S)) bad.push('D30-3');
      if (S.fc.some(f => /بانک/.test(f.q))) bad.push('F6-071');
      return [!bad.length, bad.join(',') + ' ' + J([S.fc, S.dq])]; },
    /* D30-3 (tD2 «امروز») */
    D_tD2: async (R) => { const S = await state(R); return [!fcPlan(S), J([S.fc, S.dq])]; },
  };
  for (const k of Object.keys(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').includes(k)) continue; info.n++;
    let R = null; try { R = await replay(b, k, { dir: DIR }); const r = await K[k](R); if (r[0]) info.ok++; else errors.push(k + ' ⇒ ' + r[1]); if (R.errors.length) errors.push(k + ' pageerrors: ' + R.errors.slice(0, 3).join(' | ')); }
    catch (e) { errors.push(k + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); }
    try { if (R) await R.close(); } catch (e) { } }
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
