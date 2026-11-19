// تورِ پولیا (دستهٔ ۱، دورِ ۳۰، سهمِ «arith») — C101 (ج) + C137 + C179: بازپخشِ صفحه‌ایِ خودِ اجراهای دونده‌های دورِ ۳۰ (گام‌های ctl و جواب‌های ضبط‌شدهٔ مدل؛
//  tests/fixtures/r30_arith از T/round30X/<sid>/ctl و ai/ — فقط خواندن) روی ساختِ تازه، و وارسیِ همان چیزی که دونده دید: بلوکِ «# حسابِ صفحه روی همین پیام» در پرامپتِ
//  همان نوبت (آنچه مربی خواند) و سطرهای 📜 (APP.dossier) پس از کلِ اجرا.
//  A: s06 p11 (A30-2)، pA1 p12 / pwA2 p12 (A30-9)، pA2 p6 (A30-20) · B: nB3 p7 (B30·D11)، aB1 p5 / aB3 p15 / s14 p3 (U26)
//  C: aC1 p22، p33 (S1 C30-7)، p37، p38، p39 (F2) · aC3 p47، p53 (C30-13) · D: tD3 p1، p3، p7 (D30-5)، aD4 p4 (D26-24)
//  ساعت: همان ساعتِ اجرای دونده (Playwright clock)؛ هیچ تاریخِ تقویمی در انتظارها نیست. LLA_FILE = ساختِ دیگر (قرمزِ نخست روی BASE30)؛ ONLY=A_s06,…
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r26_replay');
const DIR = path.join(__dirname, 'fixtures', 'r30_arith');

(async () => {
  const b = await chromium.launch(); const errors = []; const res = {};
  const chk = (c, m) => { if (!c) errors.push(m); };
  const run = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; let R = null;
    try { R = await replay(b, name, { dir: DIR }); const D = await R.p.evaluate(() => { const o = []; const ids = [];
        APP.S.all('achat', x => x && x.msgs && x.msgs.length).forEach(se => { ids.push(se.id); try { (APP.dossier(se.id).pks || []).forEach(k => ids.push(se.id + '|' + k.pk)); } catch (e) { } });
        (APP.liveAll ? APP.liveAll() : []).forEach(r => ids.push(r.p.id));
        ids.forEach(p => { try { ((APP.dossier(p) || {}).events || []).forEach(e => o.push((e.title || '') + ' :: ' + (e.lines || []).join(' | '))); } catch (e) { } }); return o; });
      await fn(R, D); res[name] = 'ran'; } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); }
    if (R) { R.errors.forEach(e => errors.push(name + ' ' + e)); await R.close(); } };
  const turnOf = (u) => String(u || '').split('# نوبتِ تازه').pop();
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const callFor = (R, re) => { const c = R.calls.filter(x => re.test(turnOf(x.user))); return c.length ? c[c.length - 1].user : ''; };
  const blockOf = (u) => { const H = head(u), i = H.indexOf('# حسابِ صفحه روی همین پیام'); return i < 0 ? '' : H.slice(i).split('\n#')[0]; };
  const has = (B, s) => B.indexOf(s) >= 0;
  const dz = (D, re) => D.filter(l => re.test(l));

  // ---------------- A ----------------
  await run('A_s06', async (R, D) => {
    const B = blockOf(callFor(R, /۶۰۰ کم دارم/));
    chk(has(B, '✓ «۳ میلیون و ۱۰۰ هزار − ۲ میلیون و ۵۰۰ هزار = ۶۰۰ کم دارم» می‌خواند') && /✗ «۴ میلیون − ۳ میلیون و ۶۰۰ هزار» را «۵۰۰ می‌مونه» نوشته — حسابِ صفحه: ۴۰۰ هزار/.test(B)
      && has(B, '✓ «۱۲ − ۱۲ = هیچی نمی‌مونه» می‌خواند') && has(B, '✓ «۱۰ − ۶ = ۴ تا هم برای فردا می‌مونه» می‌خواند'), 'A_s06 p11 (A30-2): each remainder clause reaches the coach with its own verdict :: ' + B);
    chk(dz(D, /۵۰۰ می‌مونه.*✗/).length && dz(D, /هیچی نمی‌مونه.*✓/).length && dz(D, /۴ تا هم برای فردا می‌مونه.*✓/).length && dz(D, /۶۰۰ کم دارم.*✓/).length,
      'A_s06 📜 (A30-2): «۶۰۰ کم دارم» ✓, «۵۰۰ می‌مونه» ✗, «هیچی نمی‌مونه» ✓ and «۴ تا هم برای فردا» ✓ each have a 📜 line :: ' + JSON.stringify(dz(D, /کم دارم|می‌مونه/)));
  });
  await run('A_pA1', async (R, D) => {
    const B = blockOf(callFor(R, /هیچی نمی‌مونه/));
    chk(has(B, '✓ «باقی‌ماندهٔ ۱۲۰ / ۸ = هیچی نمی‌مونه» می‌خواند') && /✗ «۸۰ \/ ۸»/.test(B), 'A_pA1 p12 (A30-9): «هیچی نمی‌مونه» is read ✓ (the sentence ✓ now covers every clause) :: ' + B);
  });
  await run('A_pwA2', async (R, D) => {
    const B = blockOf(callFor(R, /۳ تا کم میاد/));
    chk(has(B, '✓ «۱۸ − ۱۸ = هیچی نمی‌مونه» می‌خواند') && /✗ «۱۸ − ۱۶» را «۳ تا کم میاد» نوشته/.test(B), 'A_pwA2 p12 (A30-9): «هیچی نمی‌مونه» ✓, «۳ تا کم میاد» ✗ :: ' + B);
  });
  await run('A_pA2', async (R, D) => {
    const B = blockOf(callFor(R, /یک میلیون و ۷۵/));
    chk(has(B, '✓ «۸۷۵ + ۲۰۰ = ۱ میلیون و ۷۵» می‌خواند'), 'A_pA2 p6 (A30-20): «یک میلیون و ۷۵» is read ✓ :: ' + B);
  });
  // ---------------- B ----------------
  await run('B_nB3', async (R, D) => {
    const B = blockOf(callFor(R, /۳ کیلو کم دارم/));
    chk(has(B, '✓ «۳۰ − ۳۰ = هیچی نمی‌مونه» می‌خواند') && has(B, '✓ «۱۰ − ۶ = ۴ تا هم برای فردا می‌مونه» می‌خواند') && /✗ «۵ − ۳» را «۳ کیلو کم دارم» نوشته/.test(B), 'B_nB3 p7 (B30·D11): each clause judged :: ' + B);
    const B6 = blockOf(callFor(R, /۱۰۰ هزار کم دارم/));
    chk(has(B6, '✓ «۱ میلیون و ۷۰۰ هزار − ۱ میلیون و ۶۰۰ هزار = ۱۰۰ هزار کم دارم» می‌خواند'), 'B_nB3 p6 (B30·D11): «از ۱ میلیون و ۶۰۰، ۱۰۰ هزار کم دارم» ✓ :: ' + B6);
    chk(!dz(D, /۳ کیلو کم دارم/).some(l => /^داده/.test(l)), 'B_nB3 📜: «۳ کیلو کم دارم» is never filed as «داده» :: ' + JSON.stringify(dz(D, /کم دارم/)));
  });
  await run('B_aB1', async (R) => {
    const B = blockOf(callFor(R, /۴۲ ضربدر ۵/));
    chk(has(B, '✓ «۴۲ × ۵ = ۲۱۰» می‌خواند'), 'B_aB1 p5 (U26): «۴۲ ضربدر ۵ … ۲۱۰» read ✓ :: ' + B);
  });
  await run('B_aB3', async (R) => {
    const B = blockOf(callFor(R, /۲۰ درصدِ ۳۰۰ میلیون/));
    chk(/— حسابِ «میشه ۶۰ میلیون» را صفحه نسنجیده/.test(B), 'B_aB3 p15 (U26): «… میشه ۶۰ میلیون» gets «؟ نسنجیده» :: ' + B);
  });
  await run('B_s14', async (R) => {
    const B = blockOf(callFor(R, /تقریباً ۱\.۳/));
    chk(has(B, '✓ «۱ + ۰.۳ ≈ ۱.۳» می‌خواند'), 'B_s14 p3 (U26): «۱ + ۰.۳ ... یعنی تقریباً ۱.۳» read ✓ :: ' + B);
  });
  // ---------------- C ----------------
  await run('C_aC1', async (R, D) => {
    const B22 = blockOf(callFor(R, /۲ تا می‌مونه برای داداشم/)), B33 = blockOf(callFor(R, /۸ تا اضافه میاد/));
    chk(has(B22, '✓ «۸ + ۶ = ۱۴» می‌خواند') && !/۱۲۰۰|✗/.test(B22.replace(/نه ✓ و نه ✗/g, '').replace(/دربارهٔ «✗»/g, '')) && /— حسابِ «۲ تا می‌مونه» را صفحه نسنجیده/.test(B22), 'C_aC1 p22 (S1 C30-7, C180): «۲ تا می‌مونه» «؟ نسنجیده», never ✗ «۱۲۰۰ − ۱۴» :: ' + B22);
    chk(!/۲۰ − ۱۲/.test(B33) && /— حسابِ «۸ تا اضافه میاد» را صفحه نسنجیده/.test(B33), 'C_aC1 p33 (S1 C30-7, C180): «۸ تا اضافه میاد» «؟ نسنجیده», never ✓ «۲۰ − ۱۲» :: ' + B33);
    chk(!D.some(l => /۲۰ − ۱۲|۱۲۰۰ − ۱۴/.test(l)) && dz(D, /؟ نسنجیده: «پس ۸ تا اضافه میاد»/).length && dz(D, /؟ نسنجیده: «۲ تا می‌مونه برای داداشم»/).length,
      'C_aC1 📜 (C30-7): «۸ تا اضافه میاد» and «۲ تا می‌مونه» carry «؟ نسنجیده» beside the ✓ of their own sum/product; never «۲۰ − ۱۲» / «۱۲۰۰ − ۱۴» :: ' + JSON.stringify(dz(D, /اضافه میاد|برای داداشم/)));
    const B37 = blockOf(callFor(R, /۶ تا کم دارم/)), B38 = blockOf(callFor(R, /۱۲ تا کیک داشتیم/)), B39 = blockOf(callFor(R, /پول توجیبی/));
    chk(has(B37, '✓ «۲۰ − ۱۴ = ۶ تا کم دارم» می‌خواند') && /✗ «۳۰ − ۲۵» را «۶ تا کم میاد» نوشته/.test(B37), 'C_aC1 p37: «۶ تا کم دارم» ✓, «۶ تا کم میاد» ✗ :: ' + B37);
    chk(has(B38, '✓ «۱۲ − ۱۲ = هیچی نمی‌مونه» می‌خواند') && has(B38, '✓ «۱۴ − ۱۰ = ۴ تا هم برای فردا می‌مونه» می‌خواند'), 'C_aC1 p38 :: ' + B38);
    chk(has(B39, '✓ «۵۰ هزار − ۳۵ هزار = ۱۵ هزار تومن می‌مونه» می‌خواند'), 'C_aC1 p39 (money remainder) :: ' + B39);
  });
  await run('C_aC3', async (R) => {
    const B47 = blockOf(callFor(R, /از ۸ میلیونی که کنار گذاشتم/)), B53 = blockOf(callFor(R, /برام موند/));
    chk(has(B47, '✓ «۸ میلیون − ۵ میلیون و ۷۰۰ هزار = ۲ میلیون و ۳۰۰ می‌مونه» می‌خواند'), 'C_aC3 p47: the money remainder against the preceding result ✓ :: ' + B47);
    chk(has(B53, '✓ «۱۸ میلیون − ۱۵ میلیون و ۵۰۰ هزار = ۲ میلیون و ۵۰۰ کم دارم» می‌خواند') && /✗ «۲ میلیون − ۱ میلیون و ۳۵۰ هزار» را «۷۵۰ هزار برام موند» نوشته — حسابِ صفحه: ۶۵۰ هزار/.test(B53),
      'C_aC3 p53 (C30-13): «۲ میلیون و ۵۰۰ کم دارم» ✓ and «۷۵۰ هزار برام موند» ✗ (never silent) :: ' + B53);
  });
  // ---------------- D ----------------
  await run('D_tD3', async (R) => {
    const B1 = blockOf(callFor(R, /سفارشِ ۴۲ تا روپوش/)), B3 = blockOf(callFor(R, /رولِ آستر/)), B7 = blockOf(callFor(R, /از ۴۲ تا ۸ تا کم دارم/));
    chk(/✗ «۵۰ − ۴۲» را «۷ تا می‌مونه» نوشته/.test(B1) && has(B1, '✓ «۵ میلیون و ۴۰ هزار − ۴ میلیون و ۴۶۰ هزار = ۵۸۰ هزار کم دارم» می‌خواند'), 'D_tD3 p1: step 3 ✗ 8, step 5 «۵۸۰ هزار کم دارم» ✓ :: ' + B1);
    chk(/✗ «۳۰ − ۲۱» را «۸ متر اضافه میاد» نوشته/.test(B3) && has(B3, '✓ «نصفِ ۸۴ = ۴۲» می‌خواند'), 'D_tD3 p3: «۸ متر اضافه میاد» ✗ 9; «نصفش میشه ۴۲» ✓ (C189) :: ' + B3);
    chk(/✗ «۴۲ − ۳۵» را «۸ تا کم دارم» نوشته/.test(B7) && has(B7, '✓ «۶۰ − ۶۰ = هیچی نمی‌مونه» می‌خواند') && has(B7, '✓ «۱۴ − ۱۰ = ۴ تا هم برای فردا می‌مونه» می‌خواند'), 'D_tD3 p7 (D30-5): ✗ 7, ✓ 0, ✓ 4 :: ' + B7);
  });
  await run('D_aD4', async (R, D) => {
    // این نوبت بلوکِ حسابِ مربی ندارد (مسیرِ دیگرِ همان پیام)؛ آنچه او می‌بیند 📜 است
    const L = dz(D, /۵۹ و ۷ دهم/);
    chk(L.some(l => /نسنجیده/.test(l)) && !L.some(l => /✗/.test(l)), 'D_aD4 p4 (D26-24): verb-first «می‌مونه حدود ۵۹ و ۷ دهم» is never silent in 📜 («؟ نسنجیده»), never ✗ :: ' + JSON.stringify(L));
  });

  console.log('replays: ' + JSON.stringify(res));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
