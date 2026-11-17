// تورِ پولیا (دستهٔ ۱، دورِ ۲۹، سهمِ «forecast») — C101 (ج) + C137: بازپخشِ صفحه‌ای در هر چهار گروه. هر fixture (tests/fixtures/r29_forecast/*.json) همان گام‌های
// کنترلِ دونده (ctl/cN.json ِ T/round29X) و همان جواب‌های مدلی است که او گرفت (ai/rN.txt، جفت‌شده با «نوبتِ تازه»ی همان فراخوان)، با ساعت/شیمِ همان گروه.
// صفحه واقعاً اجرا می‌شود؛ دونده‌ها به صفحهٔ کهنه جواب دادند، پس فقط آن‌چه صفحه از حرفِ خودِ او می‌سازد وارسی می‌شود (نه پاسخِ او به پرسشی که دیگر پرسیده نمی‌شود).
//  LLA_FILE = ساختِ دیگر؛ ONLY=<نامِ fixtureها با ویرگول>.
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r26_replay.js');
const DIR = path.join(__dirname, 'fixtures', 'r29_forecast');

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0 };
  const state = (R) => R.p.evaluate(() => { const o = { sys: [], fc: [], probs: [] };
    APP.S.all('achat').forEach(s => { (s.msgs || []).forEach(m => { if (m.role === 'sys' && /🎯|📅/.test(m.text)) o.sys.push(m.text); }); try { APP.STORY.probs26(s).forEach(x => o.probs.push([x.id, x.title, x.stmt])); } catch (e) { } });
    APP.S.all('fcast').filter(x => !x.sample && x.by !== 'user').forEach(x => o.fc.push({ q: x.q, p: x.p, due: x.due || '', out: x.outcome || '', prob: x.prob ? (x.prob.pid || x.prob.pk) : '' })); return o; });
  const J = (x) => JSON.stringify(x).slice(0, 900);
  const noFcFrom = (S, re) => !S.fc.some(f => re.test(f.q)) && !S.sys.some(x => /🎯/.test(x) && re.test(x));
  const fcAskFor = (S, re) => S.sys.some(x => /موعدِ این پیش‌بینی/.test(x) && re.test(x));
  const planAskFor = (S, re) => S.sys.some(x => /^📅/.test(x) && /در «امروز» بیاید/.test(x) && re.test(x) && !/موعدِ این پیش‌بینی/.test(x));
  const K = {
    /* A29-4 (s01 p15): «با ۲۲٪ افزایش میشه ۱۸ × ۱٫۲۲» 🎯 نمی‌سازد و «امروز» «شد یا نشد؟» نمی‌پرسد */
    A_s01: async (R) => { const S = await state(R); return [noFcFrom(S, /افزایش|۲۱٫۹۶/), J([S.fc, S.sys.slice(-4)])]; },
    /* A29-4 (pA3 p10) + A29-24 (c60): «با ده درصد برای درز و دوخت» 🎯 نمی‌سازد؛ «۷٫۲ متر مربع = ۷۲۰۰۰» «حدودِ ۸» نمی‌پرسد */
    A_pA3: async (R) => { const S = await state(R); return [noFcFrom(S, /درز|پارچه/) && !S.sys.some(x => /«حدودِ ۸» حساب می‌شود/.test(x)), J([S.fc, S.sys])]; },
    /* A29-16 (s05 p26–p28): بازگفتنِ «یعنی:» 🎯 ِ دوم نمی‌سازد؛ «شد ۳ تا» ⇒ نشد بی «کدام؟» */
    A_s05: async (R) => { const S = await state(R), sh = S.fc.filter(f => /قفسه/.test(f.q));
      return [sh.length === 1 && sh[0].out === 'نشد' && !S.sys.some(x => /کدام پیش‌بینی/.test(x) && /قفسه/.test(x)), J([sh, S.sys.filter(x => /قفسه/.test(x))])]; },
    /* B29·D6 (pwB1 c17 → c22): «با ۲۰٪ اصطکاک» 🎯 نمی‌سازد و «پس گامِ ۱۶ غلط بود» چیزی را «نشد» نمی‌کند */
    B_pwB1: async (R) => { const S = await state(R); return [noFcFrom(S, /اصطکاک|هیدرولیکی/) && !S.sys.some(x => /⇐ نشد|شد یا نشد/.test(x)), J([S.fc, S.sys.filter(x => /🎯/.test(x))])]; },
    /* B29·D8 (dB1 c25): «۷۰ درصد مطمئنم میانگینِ آزمونِ یکشنبه به ۱۳ می‌رسه» ⇒ تأییدِ «موعدِ این پیش‌بینی»، نه پرسشِ برنامه */
    B_dB1: async (R) => { const S = await state(R); return [fcAskFor(S, /میانگین/) && !planAskFor(S, /میانگین/) && S.fc.filter(f => /میانگین/.test(f.q)).length === 1, J([S.fc, S.sys.filter(x => /میانگین/.test(x))])]; },
    /* B29·D17 (dB2 p3 → p21): دو 🎯 و هر کدام سرانجامِ خودش؛ B29·D23 (p4): «مطمئنم … حدودِ ۶٫۵» عدد می‌پرسد و پرسشِ برنامه نمی‌گیرد؛ B29·D8 (p14): روزِ پیش‌بینی تأییدِ خودش */
    B_dB2: async (R) => { const S = await state(R), bad = [];
      if (!(S.fc.some(f => /^ریدینگ ۷ میشه$/.test(f.q) && f.p === 70 && f.out === 'شد') && S.fc.some(f => /^لیسنینگ ۷٫۵ بشه$/.test(f.q) && f.p === 50 && f.out === 'نشد'))) bad.push('D17');
      if (!S.sys.some(x => /رایتینگم حدودِ ۶٫۵ میشه/.test(x) && /چند درصد مطمئنی/.test(x)) || planAskFor(S, /رایتینگم حدودِ ۶٫۵/)) bad.push('D23');
      if (!fcAskFor(S, /بارون/) || planAskFor(S, /بارون|آزمایشیِ شنبه‌ی بعد/)) bad.push('D8');
      if (S.sys.some(x => /شد یا نشد/.test(x) && /سه‌شنبه هم با استادم/.test(x))) bad.push('✏️ settles');
      return [!bad.length, bad.join(',') + ' ' + J([S.fc, S.sys.filter(x => /🎯/.test(x))])]; },
    /* B29·D4/D5 (s19 c50, c70, c77): آرزو 🎯 نیست؛ «رفتم باشگاه … همون که پیش‌بینی کرده بودم» همان 🎯 را می‌بندد بی «کدام؟» */
    B_s19: async (R) => { const S = await state(R), g = S.fc.filter(f => /جلسه‌ی اول خسته می‌شم/.test(f.q));
      return [g.length === 1 && g[0].out === 'شد' && !S.fc.some(f => /می‌خوام ببینم/.test(f.q)) && !S.sys.some(x => /کدام پیش‌بینی/.test(x)), J([S.fc, S.sys.filter(x => /🎯/.test(x)).slice(-4)])]; },
    /* B29·D7 (nB2 p13): «بودجه‌ی اسباب‌کشی برای رنگ کافی میشه» زیرِ مسئله‌ای که درباره‌اش است — اگر صفحه آن مسئله را جدا دارد؛ نه زیرِ میز */
    B_nB2: async (R) => { const S = await state(R), f = S.fc.filter(x => /اسباب‌کشی/.test(x.q))[0], P = S.probs, mv = P.filter(x => /اسباب|رنگ/.test(x[1] + ' ' + x[2]) && !/میز/.test(x[1])), tb = P.filter(x => /میز/.test(x[1] + ' ' + x[2]));
      const ok = !!f && (mv.length ? f.prob === mv[0][0] : !tb.some(x => x[0] === f.prob || false) || P.length < 2);
      return [ok, J([f, P])]; },
    /* C29-9 (pwC1 p2): «با ۵۵٪ میشه ۱۳۶۰ ÷ ۰٫۵۵» 🎯 نمی‌سازد */
    C_pwC1: async (R) => { const S = await state(R); return [noFcFrom(S, /۲۴۷۰|۰٫۵۵/), J([S.fc, S.sys.filter(x => /🎯/.test(x))])]; },
    /* C29-8 (pwC2 p27/p28): یک 🎯 ِ مهره‌ها و «… ۳۰٪. درست درومد.» ⇒ شد بی «کدام؟»؛ C29-7 (p32/p37/p41/p45): روزِ پیش‌بینی ⇒ تأییدِ موعدِ خودش، نه پرسشِ برنامه */
    C_pwC2: async (R) => { const S = await state(R), m = S.fc.filter(f => /دو قرمز/.test(f.q)), bad = [];
      if (!(m.length === 1 && m[0].out === 'شد') || S.sys.some(x => /کدام پیش‌بینی/.test(x) && /دو قرمز/.test(x))) bad.push('C29-8');
      /* C121 (C28-19 p37): پیش‌بینی‌های دوره دربارهٔ هیچ‌یک از سه مسئلهٔ گفت‌وگو نیستند ⇒ همه زیرِ مسئلهٔ زنده، نه پراکنده زیرِ مسئلهٔ مهره‌ها (کانونِ همان نوبت) */
      const lv = (S.probs.filter(x => /^pb_l_/.test(x[0]))[0] || [])[0], crs = S.fc.filter(f => /کوییز|آزمونِ|فصلِ|کلاسِ|درس/.test(f.q));
      if (!lv || !crs.length || crs.some(f => f.prob !== lv)) bad.push('C121 ' + J(crs.map(f => [f.q.slice(0, 20), f.prob])));
      [/فصلِ بیز/, /کوییزِ فصلِ ۳/, /رفع‌اشکال/, /فصلِ ۵ رو تا پنجشنبه/].forEach(re => { if (!fcAskFor(S, re) || planAskFor(S, re)) bad.push('C29-7 ' + re); });
      return [!bad.length, bad.join(',') + ' ' + J([m, S.sys.filter(x => /موعدِ این|در «امروز» بیاید/.test(x)).map(x => x.slice(0, 90))])]; },
    /* D29-3 (tD1 p1/p3): «با ۱۰ درصد پرت» 🎯 نمی‌سازد و اصلاحِ «۱۲ درصد، نه ۱۰» «شد یا نشد؟» نمی‌پرسد */
    D_tD1: async (R) => { const S = await state(R); return [noFcFrom(S, /پرت/) && !S.sys.some(x => /شد یا نشد/.test(x)), J([S.fc, S.sys.filter(x => /🎯/.test(x))])]; },
    /* D29-3 (s36 p2/…): «۲۰ لیتر با ۱۰٪ یعنی ۲ لیتر نمک» 🎯 نمی‌سازد و اصلاحِ «۳۰ لیتر، نه ۲۰» چیزی را «نشد» نمی‌کند */
    D_s36: async (R) => { const S = await state(R); return [noFcFrom(S, /نمک|۲۰ لیتر/) && !S.sys.some(x => /⇐ نشد|شد یا نشد/.test(x)), J([S.fc, S.sys.filter(x => /🎯/.test(x))])]; },
  };
  for (const k of Object.keys(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').includes(k)) continue; info.n++;
    let R = null; try { R = await replay(b, k, { dir: DIR }); const r = await K[k](R); if (r[0]) info.ok++; else errors.push(k + ' ⇒ ' + r[1]); if (R.errors.length) errors.push(k + ' pageerrors: ' + R.errors.slice(0, 3).join(' | ')); }
    catch (e) { errors.push(k + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); }
    try { if (R) await R.close(); } catch (e) { } }
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
