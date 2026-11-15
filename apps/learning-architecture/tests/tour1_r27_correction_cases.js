// تورِ پولیا (دورِ ۲۷) — خانوادهٔ R2 «CORRECTION ENGINE» (fixer «correction»)، نقص‌های دونده‌ها با نوبتِ خودشان (کتابخانه؛ آزمون نیست).
//  هر مورد: fixture ِ بازپخش (tests/fixtures/r27_correction/<نام>.json: گام‌های کنترلِ خودِ دونده + جواب‌های مدلی که گرفت) تا گامِ upto، و سنجه.
//  «Reproduce first» (FIX27): هر سنجه روی BASE27 (4273c7f1) قرمز بود — آنچه BASE27 داد در «base» ِ هر مورد آمده (همان بازپخش). هر مثبت بدلِ منفیِ خودش را در همان مورد دارد.
const { SNAP, J } = require('./tour1_r26_correction_cases.js');
const near = (a, b) => a != null && b != null && Math.abs(a - b) < 1e-6;
const stOf = (p, v) => (p.stale || []).filter(z => near(z.v, v));
const allSys = (x) => J([x.sys, x.ch, x.res, x.asks]);
const lastCorr = (x) => x.sys.filter(t => /اصلاح شد|اصلاح انجام نشد|چیزی برای عوض کردن|رکوردی ساخته نشده/.test(t)).slice(-1)[0] || '';
const CASES = {
  // A26-15 CHANGED (s04 p14): «۵ نفر وارثیم نه ۴» ⇒ ۲٫۷۵ کهنه شد ولی «۲۷۵۰ میلیون / ۱۰ = ۲۷۵ میلیون» (مشتقِ مشتق، در مقیاسِ دیگر) نه. A27-8 (p12): ✏️ «پنجشنبه ⇐ شنبه» پرسید «نه پنجشنبه» ⇒ «نه شنبه».
  A_s04_p14: { fx: 'A_s04', upto: 143, name: 'A26-15/A27-8 s04: derived-of-derived «۲۷۵۰ میلیون» ⇒ ۲۲۰۰ and «۲۷۵ میلیون» ⇒ ۲۲۰ (scale words are part of the value); the negated «نه پنجشنبه» is never offered as «نه شنبه»; «۱۱ میلیارد» untouched',
    base: '2.75 ⇒ 2.2 only (275 not stale); copy-ask «… نه شنبه — …» open',
    check: (x) => { const p = x.probs[0];
      return { ok: stOf(p, 2.75).some(z => near(z.re, 2.2)) && stOf(p, 2750).some(z => near(z.re, 2200)) && stOf(p, 275).some(z => near(z.re, 220)) && !stOf(p, 11).length && !stOf(p, 10).length
        && !x.asks.some(q => /نه شنبه/.test(q.new)) && !x.asks.some(q => /نه پنجشنبه/.test(q.old) && q.state === 'open'), got: { stale: p.stale, asks: x.asks.map(q => q.new + '|' + q.state) } }; } },
  // A27-9 (s04 p17): «۴ نفریم نه ۵ … سهمِ هر نفر چقدر میشه؟» ⇒ «این اصلاح انجام نشد: مقدارِ درست با مقدارِ پیشین فرقی نداشت»؛ ۲٫۲ کهنه نشد (C48)
  A_s04_p17: { fx: 'A_s04', upto: 164, name: 'A27-9 s04 «۴ نفریم نه ۵» with the old quote «ما ۵ نفر وارثیم نه ۴ نفر» holding both numbers: the correction lands (C48) and «۱۱ / ۵ = ۲٫۲» is stale ⇒ ۲٫۷۵; «۵ اتاق» / «۵ درصد» never',
    base: '«این اصلاح انجام نشد: مقدارِ درست با مقدارِ پیشین فرقی نداشت»; 2.2 not stale',
    check: (x) => { const p = x.probs[0], L = lastCorr(x);
      return { ok: !/فرقی نداشت|انجام نشد/.test(L) && /اصلاح شد/.test(L) && stOf(p, 2.2).some(z => near(z.re, 2.75)) && !(p.stale || []).some(z => /اتاق|درصد/.test(z.raw)) && !x.refused, got: { L: L.slice(0, 400), stale: p.stale, refused: x.refused } }; } },
  // B27·D12 (pwB2 p9): «شیراز ۲ ⇒ ۷» (نمرهٔ مادر) ⇒ «۶٫۰۵ ⇒ ۱۱٫۰۵» — ۶٫۰۵ جمعِ تهرانِ پیامِ نخست است که پیش از گفتنِ نمرهٔ مادر نوشته شد (هم‌رقمیِ «۲»)
  B_pwB2: { fx: 'B_pwB2', upto: 18, name: 'B27·D12 pwB2 «نمرهٔ مادر … ۷ نه ۲»: Tehran\'s opening sum «… + ۲ + … = ۶٫۰۵», written before the mother\'s score existed, is never stale (C47 equal digits); the datum itself is still corrected',
    base: '«۶٫۰۵ ⇒ ۱۱٫۰۵»',
    check: (x) => { const p = x.probs[0], L = lastCorr(x);
      return { ok: /اصلاح شد/.test(L) && /«۷»/.test(L) && !stOf(p, 6.05).length && !/۶٫۰۵|۱۱٫۰۵/.test(L), got: { L: L.slice(0, 400), stale: p.stale } }; } },
  // D27-11 + D27-12 (pwD1 p6): «۸ ثانیه بود نه ۱۰» ⇒ «۵۰ ⇒ ۴۸» (۴۰ + «۱۰ دقیقه» ِ همان پیام) و «۱۷ ⇒ ۲۱٫۲۵، ۳۷ ⇒ ۴۱٫۲۵» (۱۷۰ ÷ ۱۰ — رابطهٔ حدسی، وارونه)
  D_pwD1: { fx: 'D_pwD1', upto: 17, name: 'D27-11/D27-12 pwD1 «۸ ثانیه بود نه ۱۰»: the correcting message\'s own «… ۱۰ دقیقه … میشه ۵۰» is never stale; «۱۷»/«۳۷» get no invented number (C47: no stored expression ⇒ ask); the written «۱۷۰ ضربدر ۱۰ میشه ۱۷۰۰» ⇒ ۱۳۶۰ and «۲۸ ⇒ ۲۳» stay',
    base: '«۵۰ ⇒ ۴۸، ۱۷۰۰ ⇒ ۱۳۶۰، ۲۸ ⇒ ۲۳، ۱۷ ⇒ ۲۱٫۲۵، ۳۷ ⇒ ۴۱٫۲۵»',
    check: (x) => { const L = lastCorr(x);
      return { ok: /۱۷۰۰ ⇒ ۱۳۶۰/.test(L) && /۲۸ ⇒ (?:≈ )?۲۳/.test(L) && !/۵۰ ⇒|«۵۰|۵۰،/.test(L) && !/۲۱٫۲۵|۴۱٫۲۵/.test(L), got: { L: L.slice(0, 600) } }; } },
  // C27-14 (s23 ✏️ «۳۵ دقیقه ⇒ ۴۰»): حدسِ روزِ اول «۳۵ تقسیم بر ۲۰، یعنی ۱.۷۵» (۳۵ = طولِ قالب) «⇒ ۲» کهنه شد
  C_s23_edit: { fx: 'C_s23', upto: 100, name: 'C27-14 s23 ✏️ «۳۵ دقیقه ⇒ ۴۰»: the day-one guess «۳۵ تقسیم بر ۲۰، یعنی ۱.۷۵» (35 = the pan length, written before the baking time was ever said) is never stale ⇒ ۲',
    base: 'g.guess 1.75 ⇒ 2',
    check: (x) => { const p = x.probs[0]; return { ok: !stOf(p, 1.75).length && !/۱٫۷۵ ⇒ ۲(?![0-9۰-۹٫])/.test(allSys(x)), got: { stale: p.stale, sys: x.sys.slice(-2) } }; } },
  // … و منفیِ همان سناریو: «قالب ۲۵ در ۳۵ ⇒ ۲۵ در ۳۰» (همان ۳۵ ِ طولِ قالب) حدس را درست کهنه می‌کند
  C_s23_pan: { fx: 'C_s23', upto: 106, name: 'C27-14 look-alike: «قالبم ۲۵ در ۳۰» (the real pan datum) does make the guess stale with the exact 30 ÷ 20 = 1.5',
    check: (x) => { const p = x.probs[0]; return { ok: stOf(p, 1.75).some(z => near(z.re, 1.5)), got: { stale: p.stale } }; } },
  // C27-26 (pwC1 p23): «یه اصلاح: قیمتِ هر پنل ۵ میلیون بود نه ۴٫۵ — حالا سهمِ هر برادر چقدر میشه؟» ⇒ «این پیام پرسش بود»
  C_pwC1: { fx: 'C_pwC1', upto: 54, name: 'C27-26 pwC1 correction + question (C48): applied, «۱۲ × ۴٫۵ = ۵۴» ⇒ ۶۰ exactly; her written chain «با پمپ ۳۸ میلیون میشه ۹۲، با لوله‌کشی ۲۳ میشه ۱۱۵» follows exactly (۹۸، ۱۲۱); «۴٫۵» never read as containing «۵»',
    base: '«این اصلاح انجام نشد: این پیام پرسش بود، نه اصلاح»',
    check: (x) => { const L = lastCorr(x);
      return { ok: /اصلاح شد/.test(L) && !/پرسش بود|انجام نشد|فرقی نداشت/.test(L) && /۵۴ ⇒ ۶۰/.test(L) && /۹۲ ⇒ ۹۸/.test(L) && /۱۱۵ ⇒ ۱۲۱/.test(L) && !/۱۲ ⇒/.test(L) && !x.refused, got: { L: L.slice(0, 600), refused: x.refused } }; } },
  // D27-24 (s37 ✏️ «۴ ⇒ ۵، ۴۴۵۷۶ ⇒ ۵۴۵۷۶»): «۱۸ ⇒ ۱۴٫۴، ۷۲ ⇒ ۷۱» — ۱۸ جمعِ رقم‌های ۹۴۵۷۲ (هم‌رقمیِ «۴» در «۴+۵+۷+۲»)، ۷۲ از «بر ۴»
  D_s37: { fx: 'D_s37', upto: 41, name: 'D27-24 s37 ✏️: the digits she left untouched in the same bubble («۴+۵+۷+۲=۱۸», «بر ۴») are not the edited digit — no «۱۸ ⇒ …», no «۷۲ ⇒ ۷۱», no invented number at all',
    base: '«۱۸ ⇒ ۱۴٫۴، ۷۲ ⇒ ۷۱»',
    check: (x) => { const t = allSys(x), all = x.probs.reduce((a, p) => a.concat(p.stale || []), []);
      return { ok: !all.some(z => near(z.v, 18)) && !/۱۸ ⇒|۷۲ ⇒ ۷۱|۱۴٫۴(?!۲)/.test(t) && all.every(z => z.re == null), got: { stale: all, ch: x.ch } }; } },
  // D27-30 (arD2 p3): «۱۷ ⇒ ۱۴» برای «√(۱۵² + ۸²) = ۱۷» با ارتفاعِ ۱۲ — دقیقش √۲۰۸ (C67)
  D_arD2: { fx: 'D_arD2', upto: 3, name: 'D27-30/C67 arD2 «ارتفاعِ تیر ۱۲ نه ۱۵»: «√(۱۵² + ۸²) = ۱۷» ⇒ √۲۰۸ ≈ ۱۴٫۴۲ (exact, labelled approximation), never a bare «۱۴»; the cable «کابلِ ۱۵ متری» is never stale',
    base: '«۱۷ ⇒ ۱۴»',
    check: (x) => { const L = lastCorr(x); return { ok: /۱۷ ⇒ √۲۰۸ ≈ ۱۴٫۴۲/.test(L) && !/۱۷ ⇒ ۱۴(?!٫)|۱۵ ⇒/.test(L), got: { L: L.slice(0, 500) } }; } },
  // B27·D6 (bp2 post): «با ۶۰: ۶۰ × ۰.۱۵ = ۹ متر مکعب، یعنی ۹۰۰۰ لیتر» — نوار هنوز «نتیجه با عددِ پیشین به دست آمده بود»
  B_bp2: { fx: 'B_bp2', upto: 21, name: 'B27·D6 bp2: his own redo «با ۶۰: ۶۰ × ۰.۱۵ = ۹ … ۹۰۰۰ لیتر» clears the stale mark of «۷.۵ متر مکعب میشه ۷۵۰۰ لیتر» (the strip no longer says «با عددِ پیشین»)', strip: true,
    base: 'strip «مانده: نتیجه با عددِ پیشین به دست آمده بود («۵۰ متر مربعه» ⇐ «۶۰ متر مربعه»)»',
    check: (x) => { const p = x.probs[0]; return { ok: !(p.stale || []).some(z => !/^msg:/.test(z.k)) && !/با عددِ پیشین/.test(x.stripText || ''), got: { stale: p.stale, strip: x.stripText } }; } },
  // … منفی: پیش از بازحسابِ او (همان سناریو، پیش از p9) نشان سرِ جایش است
  B_bp2_before: { fx: 'B_bp2', upto: 20, name: 'B27·D6 look-alike: before his redo the result «۷.۵ … ۷۵۰۰ لیتر» IS stale (⇒ ۹، ۹۰۰۰)',
    check: (x) => { const p = x.probs[0]; return { ok: stOf(p, 7.5).some(z => near(z.re, 9)) && stOf(p, 7500).some(z => near(z.re, 9000)), got: { stale: p.stale } }; } },
  // B27·D8 (s17 p10): «ضریب ۰٫۷۵ نه ۰٫۷» ⇒ متنِ «۲۴ × ۰٫۷۵ = ۱۶.۸» (برابریِ دروغ) و «۱۶٫۸ ⇒ ۱۸» با پایهٔ کهنهٔ ۲۴ (که خودش ⇒ ۲۱٫۶ بود)
  B_s17: { fx: 'B_s17', upto: 46, name: 'B27·D8 s17 «۰٫۷۵ نه ۰٫۷» after «۱۸۰ نه ۲۰۰»: the proposal is the exact recomputation on the current base (۲۱٫۶ × ۰٫۷۵ = ۱۶٫۲), never ۱۸; no record is turned into «۲۴ × ۰٫۷۵ = ۱۶.۸»',
    base: '«۱۶٫۸ ⇒ ۱۸»; «ثبتِ «از گفت‌وگو»: «۰٫۷۵» (اصلاح شد ⇐ «۰.۷»)» inside «حساب نهایی ۲۴ × ۰.۷ = ۱۶.۸»',
    check: (x) => { const L = lastCorr(x), t = J([x.story, x.ch, x.asks, x.sys]);
      return { ok: /۱۶٫۸ ⇒ ۱۶٫۲/.test(L) && !/۱۶٫۸ ⇒ ۱۸/.test(L) && !/۲۴ × ۰[.٫]۷۵ = ۱۶/.test(t), got: { L: L.slice(0, 500), story: x.story } }; } },
};
module.exports = { CASES, SNAP, J };
