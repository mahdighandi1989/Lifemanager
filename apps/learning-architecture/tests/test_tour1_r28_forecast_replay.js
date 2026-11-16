// تورِ پولیا (دستهٔ ۱، دورِ ۲۸، سهمِ «forecast») — C101 (ج): بازپخشِ صفحه‌ای. هر fixture (tests/fixtures/r28_forecast/*.json) همان گام‌های کنترلِ دونده
// (ctl/cN.json ِ T/round28X: say / eval / eval0 / click / fill / clock / reload) و همان جواب‌های مدلی است که او گرفت (ai/rN.txt، جفت‌شده با «نوبتِ تازه»ی همان فراخوان)،
// با ساعت/شیمِ همان گروه (C131). صفحه واقعاً اجرا می‌شود و همان دید/رکوردی که دونده دید وارسی می‌شود.
//  LLA_FILE = ساختِ دیگر؛ ONLY=<نامِ fixtureها با ویرگول>.
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r26_replay.js');
const DIR = path.join(__dirname, 'fixtures', 'r28_forecast');

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0 };
  const state = (R) => R.p.evaluate(() => { const o = { sys: [], fc: [] };
    APP.S.all('achat').forEach(s => (s.msgs || []).forEach(m => { if (m.role === 'sys' && /🎯/.test(m.text)) o.sys.push(m.text); }));
    APP.S.all('fcast').filter(x => !x.sample).forEach(x => o.fc.push({ q: x.q, p: x.p, out: x.outcome || '', h: (x.pHist || []).map(z => z.p) })); return o; });
  const view = (R) => R.p.evaluate(async () => { try { APP.ASSIST.toggle(false); } catch (e) { } APP.go('fcast'); await new Promise(r => setTimeout(r, 600)); const m = document.querySelector('#main');
    return { open: [...m.querySelectorAll('.fc-openl li')].map(li => li.innerText.replace(/\s+/g, ' ')), done: [...m.querySelectorAll('.fc-donel li')].map(li => ({ t: li.innerText.replace(/\s+/g, ' '), sel: (li.querySelector('select') || {}).value })), raw: m.innerText }; });
  const J = (x) => JSON.stringify(x).slice(0, 900);
  const K = {
    /* D28-8 / D28-9 (oD1 p7–p13): اصلاحِ «۰٫۳ ⇐ ۰٫۲۵» هیچ «شد یا نشد؟» نمی‌سازد؛ «پیش‌بینیم ۱ بود، شد ۳» ⇐ «حداکثر ۱» ⇒ نشد؛ در دفترِ پیش‌بینی زیرِ «داوری‌شده» */
    D_oD1: async (R) => { const S = await state(R), V = await view(R), f = S.fc.filter(x => /حداکثر ۱ هشدار/.test(x.q));
      const ok = f.length === 1 && f[0].out === 'نشد' && !S.sys.some(x => /⇐ شد/.test(x) && /حداکثر ۱/.test(x)) && !S.sys.some(x => /شد یا نشد/.test(x) && /حداکثر ۱/.test(x)) && V.done.some(d => /حداکثر ۱ هشدار/.test(d.t) && d.sel === 'نشد') && !V.open.some(t => /حداکثر ۱ هشدار/.test(t));
      return [ok, J([f, S.sys, V.open, V.done])]; },
    /* A28-35 / A28-36 (oA1): 🎯 ِ «⇐ شد» در «🎯 دفترِ پیش‌بینی» زیرِ «داوری‌شده»، نه در «باز»؛ «(دورِ ۲۷، C53)» در دیدِ او نیست */
    A_oA1: async (R) => { const S = await state(R), V = await view(R), f = S.fc.filter(x => /ترفیع/.test(x.q));
      const ok = f.length === 1 && f[0].out === 'شد' && V.done.some(d => /ترفیع/.test(d.t) && d.sel === 'شد' && /⇐ شد/.test(d.t)) && !V.open.some(t => /ترفیع/.test(t)) && !/C53|دورِ ۲۷/.test(V.raw) && !/پیش‌بینیم:/.test(f[0].q);
      return [ok, J([f, V.open, V.done])]; },
    /* B28·D2/D3/D4/D5 (nB1 p15–p19): ۷۰ ِ خودش نه ۹۰ ِ داداش؛ «۶۰، نه ۷۰» همان 🎯 با تاریخچه؛ سه سرانجامِ یک پیام هر سه «شد»؛ «۲۳ … درست درومد» هرگز «نشد» */
    B_nB1: async (R) => { const S = await state(R), c23 = S.fc.filter(x => /۲۳/.test(x.q)), V = await view(R);
      const ok = c23.length === 1 && c23[0].p === 60 && JSON.stringify(c23[0].h) === '[70]' && c23[0].out === 'شد' && S.fc.some(x => /نصب/.test(x.q) && x.out === 'شد') && S.fc.some(x => /کاشی/.test(x.q) && x.out === 'شد') && !S.sys.some(x => /۲۳/.test(x) && /⇐ نشد/.test(x)) && !V.open.some(t => /۲۳|نصب|کاشی/.test(t));
      return [ok, J([S.fc, S.sys.slice(-6)])]; },
    /* C28-15…C28-25 (pwC2 p31–p39): «فکر کنم ۷۰ درصد» یک 🎯؛ «۸۰ درصد.» پاسخِ پرسشِ عدد؛ «الان ۸۰» همان 🎯 ِ «بالای ۱۷»؛ «۱۸ گرفتم» ⇒ شد؛ دو کوییز دو 🎯 با متن؛ «کدام؟» فقط میانِ کوییزها */
    C_pwC2: async (R) => { const S = await state(R), g = S.fc.filter(x => /بالای ۱۷/.test(x.q)), qz = S.fc.filter(x => /کوییز/.test(x.q)), w = S.sys.filter(x => /کدام پیش‌بینی/.test(x) && /کوییز/.test(x)).pop() || '';
      const ok = g.length === 1 && g[0].p === 80 && g[0].out === 'شد' && qz.length === 2 && qz.every(x => x.q.length > 6) && S.fc.some(x => /بیز/.test(x.q) && x.p === 70) && !!w && !/بیز|بالای/.test(w);
      return [ok, J([S.fc, S.sys.slice(-6)])]; },
    /* D28-24/25/26 (tD2 p9–p16): «۶۰ درصد.» ⇒ 🎯 ِ گاز؛ «… رو ۵۰ درصد می‌دم» همان 🎯 ِ ودیعه با تاریخچه؛ «۸۰ … و ۶۰ …» دو 🎯 */
    D_tD2: async (R) => { const S = await state(R), v = S.fc.filter(x => /ودیعه/.test(x.q));
      const ok = v.length === 1 && v[0].p === 50 && v[0].h[0] === 70 && S.fc.some(x => /گاز/.test(x.q) && x.p === 60) && S.fc.some(x => /کارگرها/.test(x.q) && x.p === 80 && !/ظرف/.test(x.q)) && S.fc.some(x => /ظرف/.test(x.q) && x.p === 60);
      return [ok, J(S.fc)]; },
  };
  for (const k of Object.keys(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').includes(k)) continue; info.n++;
    let R = null; try { R = await replay(b, k, { dir: DIR }); const r = await K[k](R); if (r[0]) info.ok++; else errors.push(k + ' ⇒ ' + r[1]); if (R.errors.length) errors.push(k + ' pageerrors: ' + R.errors.slice(0, 3).join(' | ')); }
    catch (e) { errors.push(k + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); }
    try { if (R) await R.close(); } catch (e) { } }
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
