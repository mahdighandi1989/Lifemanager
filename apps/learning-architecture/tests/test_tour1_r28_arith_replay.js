// تورِ پولیا (دستهٔ ۱، دورِ ۲۸، سهمِ «arith») — C101 (ج): بازپخشِ صفحه‌ایِ خودِ اجراهای دونده‌ها (گام‌های ctl و جواب‌های ضبط‌شدهٔ مدل؛ tests/fixtures/r28_arith از
//  T/round28X/<sid>/ctl و ai/ — فقط خواندن) روی ساختِ تازه، و وارسیِ همان چیزی که دونده دید: بلوکِ «حسابِ صفحه» در پرامپتِ همان نوبت (همان که مربی خواند و به او/کودک رساند)،
//  بلوکِ «جوابِ او به «؟»»، و وضعِ ذخیره‌شدهٔ گفت‌وگو (پرسشِ بازِ «کدام خوانش؟»).
//  یک سناریو در هر گروه که خانوادهٔ F1/F2 در آن دیده شد: A s02 (A28-8/9/10/11) و pwA2 (S1 A28-40)، B nB1 (S1 B28·D1)، C aC3 (S1 C28-13، C28-11/12)، D tD1 (D28-15).
//  ساعت: Playwright clock روی روزِ خودِ همان اجرا (clock0 ِ دونده) — هیچ تاریخِ تقویمی در انتظارها نیست. LLA_FILE = ساختِ دیگر (قرمزِ نخست روی BASE28)؛ ONLY=A_s02,…
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r26_replay');
const DIR = path.join(__dirname, 'fixtures', 'r28_arith');

(async () => {
  const b = await chromium.launch(); const errors = []; const res = {};
  const chk = (c, m) => { if (!c) errors.push(m); };
  const run = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; let R = null;
    try { R = await replay(b, name, { dir: DIR }); await fn(R); res[name] = 'ran'; } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); }
    if (R) { R.errors.forEach(e => errors.push(name + ' ' + e)); await R.close(); } };
  const turnOf = (u) => String(u || '').split('# نوبتِ تازه').pop();
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const callFor = (R, re) => { const c = R.calls.filter(x => re.test(turnOf(x.user))); return c.length ? c[c.length - 1].user : ''; };
  const blockOf = (u, name) => { const H = head(u), i = H.indexOf(name || '# حسابِ صفحه روی همین پیام'); return i < 0 ? '' : H.slice(i).split('\n#')[0]; };
  const line = (B, re) => B.split('\n').filter(l => re.test(l)).join(' ¦ ');

  // ---- B nB1 p3 — S1 B28·D1 ----
  await run('B_nB1', async (R) => {
    const B = blockOf(callFor(R, /۹ میلیون و ۹۰۰ \+ ۲ میلیون و ۸۰۰/));
    chk(/✓ «۹ میلیون و ۹۰۰ \+ ۲ میلیون و ۸۰۰ = ۱۲ میلیون و ۷۰۰» می‌خواند \(با خوانشِ «۹ میلیون و ۹۰۰ هزار»/.test(B) && !/✗ «۹ میلیون و ۹۰۰/.test(B) && !/۱۱٫۰۰۱۷/.test(B),
      'B_nB1 p3 (S1 B28·D1): the coach reads ✓ with the thousand reading, never ✗ «۱۱٫۰۰۱۷ میلیون» :: ' + B);
    chk(/✓ «۲ میلیون و ۸۰۰ \/ ۲ = ۱ میلیون و ۴۰۰» می‌خواند/.test(B) && !/دو خوانش/.test(B), 'B_nB1 p3 (C102): «÷ ۲ = ۱ میلیون و ۴۰۰» fits the thousands reading ⇒ ✓, no question :: ' + line(B, /۱ میلیون و ۴۰۰/));
    chk(/✗ «۲ میلیون و ۸۰۰ − ۵۰۰ هزار» را «۲ میلیون و ۵۰۰» نوشته — حسابِ صفحه: ۲ میلیون و ۳۰۰ هزار .*یا ۱ میلیون و ۵۰۰ هزار و ۸۰۰/.test(B), 'B_nB1 p3 (C84 none fits): ✗ with each reading\'s value in her words :: ' + line(B, /− ۵۰۰ هزار/));
  });
  // ---- C aC3 p29/p30 — S1 C28-13, C28-11, C28-12 ----
  await run('C_aC3', async (R) => {
    const B29 = blockOf(callFor(R, /قسطِ بیمه رو حساب کردم/)), B30 = blockOf(callFor(R, /یه حسابِ دیگه: ۱ میلیون و ۲۰۰/));
    chk(/✓ «۲ میلیون و ۸۰۰ × ۱۲ = ۳۳ میلیون و ۶۰۰»/.test(B29) && /✓ «۲ میلیون و ۸۰۰ \/ ۲ = ۱ میلیون و ۴۰۰»/.test(B29) && /✗ «۶ میلیون و ۵۰۰ × ۱۰» را «۶۰ میلیون» نوشته — حسابِ صفحه: ۶۵ میلیون .*یا ۶۰ میلیون و ۵ هزار/.test(B29) && !/گرد کرده/.test(B29),
      'C_aC3 p29 (C28-11/12, C102/C103): ✓ ×2 with no question, ✗ with both values — never a rounding «؟» :: ' + B29);
    chk(/✓ «۱ میلیون و ۲۰۰ \+ ۸۰۰ هزار = ۲ میلیون» می‌خواند/.test(B30) && !/۱٫۸۰۰۲|گرد کرده/.test(B30), 'C_aC3 p30 (S1 C28-13): ✓, no false exact value reaches the coach :: ' + B30);
  });
  // ---- A s02 p10, p17–p19 — A28-7, A28-8/9/10, A28-11 ----
  await run('A_s02', async (R) => {
    const B10 = blockOf(callFor(R, /sqrt\(15\.73\)/)), B17 = blockOf(callFor(R, /دقیق‌ترش: ۲√۳/)), B18 = blockOf(callFor(R, /رفت‌وبرگشت/)), U19 = callFor(R, /منظورم ۲ میلیون و ۸۰۰ هزار بود/);
    const B7 = blockOf(callFor(R, /sqrt\(3\.67\^2 \+ 1\.6\^2\) ≈ 4\.005/));
    chk(!/✗/.test(B7), 'A_s02 p7 (C13 across messages): her «3.67» is her own rounding from p4 — «≈ 4.005» is never ✗ :: ' + B7);
    /* دورِ ۲۹ (بانکِ R29 #19، #44؛ C29-18): «≈» ِ خودِ او در سطرِ مربی «≈» می‌ماند (پیش‌تر «=») */
    chk(/✓ «sqrt\(۱۵\.۷۳\) [=≈] ۳\.۹۷» می‌خواند/.test(B10) && !/نسنجیده/.test(B10), 'A_s02 p10 (A28-7): «sqrt(…)» is read like «√» :: ' + line(B10, /sqrt/));
    chk(/✓ «۲ میلیون و ۸۰۰ \+ ۲۰۰ هزار = ۳ میلیون» می‌خواند/.test(B17) && /— حسابِ «۲√۳ ≈ ۳\.۴۶» را صفحه نسنجیده/.test(B17) && /✗ «۲ میلیون و ۸۰۰ \/ ۲» را «۱ میلیون و ۵۰۰» نوشته — حسابِ صفحه: ۱ میلیون و ۴۰۰ هزار .*یا ۱ میلیون و ۴۰۰ /.test(B17),
      'A_s02 p17 (A28-8/9/10): the tip line ✓ (never «واحدِ ناشناخته»), «۲√۳» «نسنجیده», ✗ with both values in her words :: ' + B17);
    chk(/؟ «۲ میلیون و ۸۰۰» دو خوانش دارد/.test(B18), 'A_s02 p18: «÷ ۲ = ۱۴۰۰» asks which reading :: ' + B18);
    const A19 = blockOf(U19, '# جوابِ او به «؟» ِ صفحه');
    chk(/✓ به گفتهٔ خودش «۸۰۰ هزار» بود: «۲ میلیون و ۸۰۰ \/ ۲ = ۱۴۰۰»/.test(A19), 'A_s02 p19 (A28-11): her answer is read and the line booked ✓ with her reading :: ' + A19);
    const st = await R.p.evaluate(() => JSON.parse(JSON.stringify(((APP.ASSIST.cur() || {}).coach || {}).arithAsk || [])));
    chk(st.some(a => a.kind === 'm2' && a.re && a.re.to === 'ok' && a.re.rd === 'k'), 'A_s02 stored state: the «کدام خوانش؟» ask is closed with her reading :: ' + JSON.stringify(st).slice(0, 600));
  });
  // ---- A pwA2 p10 — S1 A28-40 ----
  await run('A_pwA2', async (R) => {
    const B = blockOf(callFor(R, /۵ و ۵ و ۵ میشه ۱۵، ۳ تا می‌مونه/));
    chk(/✓ «۵ و ۵ و ۵ = ۱۵» می‌خواند/.test(B) && !/✗/.test(B) && !/باقی‌ماندهٔ/.test(B), 'A_pwA2 p10 (S1 A28-40): the child\'s sum reaches the coach ✓; no ✗ to pass on :: ' + B);
  });
  // ---- D tD1 p11 — D28-15 ----
  await run('D_tD1', async (R) => {
    const B = blockOf(callFor(R, /نصبِ قرنیز هم ۱۸ × ۱۵۰ هزار/));
    chk(/✗ «۱۸ × ۱۵۰ هزار» را «۲ میلیون و ۶۰۰» نوشته — حسابِ صفحه: ۲ میلیون و ۷۰۰ هزار/.test(B) && !/حسابِ صفحه: ۲٫۷(?! )/.test(B), 'D_tD1 p11 (D28-15): the page\'s value keeps her scale word :: ' + line(B, /۱۵۰ هزار/));
  });

  console.log('replays: ' + JSON.stringify(res));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
