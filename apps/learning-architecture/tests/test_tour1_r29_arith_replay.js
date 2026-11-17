// تورِ پولیا (دستهٔ ۱، دورِ ۲۹، سهمِ «arith») — C101 (ج) + C137: بازپخشِ صفحه‌ایِ خودِ اجراهای دونده‌ها در هر چهار گروهی که خانوادهٔ F1/F2/F16 را دیدند
//  (گام‌های ctl و جواب‌های ضبط‌شدهٔ مدل؛ tests/fixtures/r29_arith از T/round29X/<sid>/ctl و ai/ — فقط خواندن) روی ساختِ تازه، و وارسیِ همان چیزی که دونده دید:
//  بلوکِ «# حسابِ صفحه روی همین پیام» در پرامپتِ همان نوبت (همان که مربی خواند و به او رساند).
//  A: s02 p20 (A29-9، A29-10)، s06 p9 (A29-3، A29-1)، s08 p11 (A29-18، A29-1)، pwA2 p12 (A29-18، A29-1) · B: nB2 p1 (B29·D9)، p4 (B29·D10)
//  C: aC1 p21 (S1 C29-1)، aC3 p32 (C29-19)، p34 (S1 C29-2)، p35 (C29-20)، p36 (S1 C29-3) · D: tD1 p1 (S1 D29-1)، p20 (D29-8)، p22 (S1 D29-2)، p23 (D29-9)
//  ساعت: Playwright clock روی روزِ خودِ همان اجرا (clock0 ِ دونده) — هیچ تاریخِ تقویمی در انتظارها نیست. LLA_FILE = ساختِ دیگر (قرمزِ نخست روی BASE29)؛ ONLY=A_s02,…
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r26_replay');
const DIR = path.join(__dirname, 'fixtures', 'r29_arith');

(async () => {
  const b = await chromium.launch(); const errors = []; const res = {};
  const chk = (c, m) => { if (!c) errors.push(m); };
  const run = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; let R = null;
    try { R = await replay(b, name, { dir: DIR }); await fn(R); res[name] = 'ran'; } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); }
    if (R) { R.errors.forEach(e => errors.push(name + ' ' + e)); await R.close(); } };
  const turnOf = (u) => String(u || '').split('# نوبتِ تازه').pop();
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const callFor = (R, re) => { const c = R.calls.filter(x => re.test(turnOf(x.user))); return c.length ? c[c.length - 1].user : ''; };
  const blockOf = (u) => { const H = head(u), i = H.indexOf('# حسابِ صفحه روی همین پیام'); return i < 0 ? '' : H.slice(i).split('\n#')[0]; };
  const noX = (B) => !/✗/.test(B.replace(/نه ✓ و نه ✗/g, ''));
  const has = (B, s) => B.indexOf(s) >= 0;

  // ---------------- A ----------------
  await run('A_s02', async (R) => {
    const B = blockOf(callFor(R, /بنزین ۴ میلیون و ۲۰۰/));
    chk(has(B, '✓ «۴ میلیون و ۲۰۰ + عوارض ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰» می‌خواند'), 'A_s02 p20 (A29-9): the labelled sum reaches the coach ✓ :: ' + B);
    chk(has(B, '✓ «۱ میلیون و ۸۰۰ تومن − ۳۰۰ = ۱ میلیون و ۵۰۰» می‌خواند') && !/واحدهای ناهم‌سان/.test(B), 'A_s02 p20 (A29-10, C135/C154): «پارکینگ … تومن تخفیف» ✓, never «واحدهای ناهم‌سان» :: ' + B);
  });
  await run('A_s06', async (R) => {
    const B = blockOf(callFor(R, /نصفش هم میشه ۱ میلیون و ۳۰۰/));
    chk(/✗ «نصفِ ۲ میلیون و ۵۲۰» را «۱ میلیون و ۳۰۰» نوشته — حسابِ صفحه: ۱ میلیون و ۲۶۰ هزار/.test(B), 'A_s06 p9 (A29-3, C157): «نصفش هم میشه …» is read ⇒ ✗ :: ' + B);
  });
  await run('A_s08', async (R) => {
    const B = blockOf(callFor(R, /۸ لیتر اضافه میاد/));
    chk(has(B, '✓ «۱۵ − ۱۴ = ۱ لیتر کم میاد» می‌خواند') && /✗ «۲۲ − ۱۵» را «۸ لیتر اضافه میاد» نوشته — حسابِ صفحه: ۷/.test(B), 'A_s08 p11 (A29-18, C141): «کم میاد» ✓ and «اضافه میاد» ✗ ۷ against her 15 :: ' + B);
  });
  await run('A_pwA2', async (R) => {
    const B = blockOf(callFor(R, /۳ تا کم میاد/));
    chk(/✗ «۱۸ − ۱۶» را «۳ تا کم میاد» نوشته — حسابِ صفحه: ۲/.test(B) && has(B, '✓ «۴ و ۴ و ۴ و ۴ = ۱۶» می‌خواند'), 'A_pwA2 p12 (A29-18): the child\'s «۳ تا کم میاد» reaches the coach as ✗ (sum ✓) :: ' + B);
  });
  // ---------------- B ----------------
  await run('B_nB2', async (R) => {
    const B1 = blockOf(callFor(R, /کامیون ۴ میلیون و ۲۰۰/)), B4 = blockOf(callFor(R, /۵۰ ÷ ۴ = ۱۲ بسته/));
    chk(has(B1, '✓ «۴ میلیون و ۲۰۰ + کارگر ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰» می‌خواند'), 'B_nB2 p1 (B29·D9): the labelled sum is read ✓ :: ' + B1);
    chk(has(B4, '✓ «۵۰ / ۴ = ۱۲ و باقی‌ماندهٔ ۲» می‌خواند') && /✗ «۲۳ \/ ۵» را «۴ و باقی‌ماندهٔ ۲» نوشته/.test(B4) && has(B4, '✓ «۳۰ − ۲۶ = ۴ تا کم میاد» می‌خواند') && !/گرد کرده|گرد شده/.test(B4),
      'B_nB2 p4 (B29·D10): remainders read, the wrong one ✗, «۴ تا کم میاد» ✓; no rounding question :: ' + B4);
  });
  // ---------------- C ----------------
  await run('C_aC1', async (R) => {
    const B = blockOf(callFor(R, /۱۸ − ۱۵ = ۳، ۳ تا می‌مونه/));
    chk(has(B, '✓ «۱۸ − ۱۵ = ۳» می‌خواند') && has(B, '✓ «۱۸ − ۱۵ = ۳ تا می‌مونه» می‌خواند') && noX(B) && !/۱۵ − ۳/.test(B), 'C_aC1 p21 (S1 C29-1): both statements ✓; never «✗ ۱۵ − ۳ … ۱۲» :: ' + B);
  });
  await run('C_aC3', async (R) => {
    const B32 = blockOf(callFor(R, /۵ میلیون و ۸۰۰ − ۸۰۰ = ۵ میلیون/)), B34 = blockOf(callFor(R, /۲ و ۵ دهم × ۴ = ۱۰ درصد/)), B35 = blockOf(callFor(R, /۱۰ میلیون ÷ ۷/)), B36 = blockOf(callFor(R, /جمعِ شش قسطِ اول/));
    chk(/✓ «۵ میلیون و ۸۰۰ − ۸۰۰ = ۵ میلیون» می‌خواند \(با خوانشِ «۵ میلیون و ۸۰۰ هزار»، «۸۰۰ هزار»\)/.test(B32) && !/ِ واحد \(فقط/.test(B32), 'C_aC3 p32 (C29-19/C154): thousands reading, no «ِ واحد» note :: ' + B32);
    chk(has(B34, '✓ «۲ و ۵ دهم × ۴ = ۱۰٪» می‌خواند') && !/۱۰۰۰٪/.test(B34) && /✗ «۱ و ۵ دهم × ۳» را «۴ و ۸ دهم» نوشته — حسابِ صفحه: ۴٫۵/.test(B34), 'C_aC3 p34 (S1 C29-2, C140) :: ' + B34);
    chk(/✗ «۱۰ میلیون \/ ۷» را «۱ میلیون و ۵۰۰ هزار» نوشته — حسابِ صفحه: ≈ ۱ میلیون و ۴۲۸ هزار/.test(B35) && has(B35, '✓ «۱۰ میلیون / ۳ ≈ ۳ میلیون و ۳۳۳ هزار» می‌خواند'), 'C_aC3 p35 (C29-20): the ✗ value in her scale; her «≈» kept :: ' + B35);
    chk(/✓ «۱ میلیون و ۲۰۰ \+ ۱ میلیون و ۳۰۰ \+ ۱ میلیون و ۱۰۰ \+ ۱ میلیون و ۴۰۰ \+ ۱ میلیون و ۵۰۰ \+ ۱ میلیون و ۵۰۰ = ۸ میلیون» می‌خواند/.test(B36) && !/۶٫۰۰۲/.test(B36), 'C_aC3 p36 (S1 C29-3): six compounds ✓ :: ' + B36);
  });
  // ---------------- D ----------------
  await run('D_tD1', async (R) => {
    const B1 = blockOf(callFor(R, /۲۲ × ۸۵۰ هزار = ۱۸ میلیون و ۷۰۰ تومن/)), B20 = blockOf(callFor(R, /کابینتِ پایین/)), B22 = blockOf(callFor(R, /کرایهٔ وانت/)), B23 = blockOf(callFor(R, /کارتن‌های پارکت/));
    chk(has(B1, '✓ «۲۲ × ۸۵۰ هزار = ۱۸ میلیون و ۷۰۰» می‌خواند') && !/۱۸٫۷(?! میلیون)/.test(B1.replace('۱۸٫۷ + ۳', '')), 'D_tD1 p1 (S1 D29-1, C135): ✓, never ✗ «۱۸٫۷» :: ' + B1);
    chk(has(B20, '✓ «۴ میلیون و ۲۰۰ + بالا ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰» می‌خواند') && /✗ «۲ میلیون و ۶۰۰ \+ شیرآلات ۱ میلیون و ۷۰۰» را «۳ میلیون و ۳۰۰» نوشته — حسابِ صفحه: ۴ میلیون و ۳۰۰ هزار/.test(B20), 'D_tD1 p20 (D29-8): labelled sums read; the wrong one ✗ :: ' + B20);
    chk(has(B22, '✓ «۱ میلیون و ۲۰۰ تومن + ۸۰۰ هزار = ۲ میلیون» می‌خواند') && /✗ «۲ میلیون و ۳۰۰ تومن \+ ۴۰۰ هزار» را «۳ میلیون» نوشته — حسابِ صفحه: ۲ میلیون و ۷۰۰ هزار/.test(B22) && !/۱٫۸۰۰۲|۲٫۴۰۰۳|گرد کرده/.test(B22), 'D_tD1 p22 (S1 D29-2): ✓ and ✗ with the natural value :: ' + B22);
    chk(/✗ «۳۰ − ۲۵» را «۶ تا کم میاد» نوشته — حسابِ صفحه: ۵/.test(B23) && has(B23, '✓ «۲۰ − ۱۶ = ۴ تا کم میاد» می‌خواند') && has(B23, '✓ «۱۸ − ۱۲ = ۶ تا می‌مونه» می‌خواند'), 'D_tD1 p23 (D29-9, C141): narrative remainders judged :: ' + B23);
  });

  console.log('replays: ' + JSON.stringify(res));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
