// تورِ پولیا (دستهٔ ۱، دورِ ۳۰، سهمِ «story») — C101 (a)+(b): بخش‌های U* از جمله‌های خودِ دونده‌ها (round30X/<sid>)، قرمز روی BASE30 5c7ce364.
//  F15 (A30-8، C30-1، A30-9 نیمهٔ s03)، D25-8 (مقصدِ 🧭)، و دم‌های story ِ FIX30. هر بخش هم‌شکلِ منفیِ خودش را دارد (C136). ONLY=<پیشوند>.
//  ساعتِ صفحه دست نمی‌خورد و هیچ تاریخِ تقویمی در انتظارها نیست.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { n: 0, ok: 0 };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  const J = (x) => JSON.stringify(x);
  const ev = (f, a) => p.evaluate(f, a);
  const mk = (t) => ev((t) => APP.STORY.markOf27({ k: 'calc', t }, { text: t }), t);
  const K = {};

  /* ---------- D25-8 (oD1* ×8): مقصدِ 🧭 هستهٔ مجهول است — نه برچسبِ «یه جمله:» و نه «می‌خوام بدونم» ---------- */
  K.U_D25_8_core = async () => { const x = await ev(() => APP.STORY.unkOf30('یه جمله: می‌خوام بدونم «مادرم قرصِ امروزش رو برداشته یا نه»، فقط از روی وزنِ قرص‌دون، بی دوربین. داده‌هام: ترازوی دیجیتالِ کوچیک با سنسور لودسل که دقتش ۰٫۰۱ گرمه ولی نویزش حدود ۰٫۰۵ گرمه؛ هر قرص ۰٫۳ گرمه؛ قرص‌دون ۷ خونه داره.', '', ''));
    return [x === 'مادرم قرصِ امروزش رو برداشته یا نه', x]; };
  /* هم‌شکل‌های منفی: بی برچسب و بی گیومه همان می‌ماند؛ «کلش اینه: X» ⇒ X */
  K.U_D25_8_neg = async () => { const x = await ev(() => [APP.STORY.unkCore30('می‌خوام بدونم چند تا بخرم'), APP.STORY.unkCore30('کلش این است: می‌خواهم بدانم برای یک پردهٔ چین‌دار چند متر پارچه بخرم'), APP.STORY.unkCore30('مجهول: تعداد مرغ‌ها')]);
    return [x[0] === 'می‌خوام بدونم چند تا بخرم' && x[1] === 'می‌خواهم بدانم برای یک پردهٔ چین‌دار چند متر پارچه بخرم' && x[2] === 'تعداد مرغ‌ها', J(x)]; };

  /* ---------- F15 / A30-8 (s03 p17–p19): جمعِ «…» یک بند است؛ ✗ ِ «۱ + … + ۱۰ = ۵۰» در 📜 ---------- */
  K.U_A30_8_whole = async () => { const x = await ev(() => APP.STORY.dataOf('یه چیزِ کناری: برای تمرینِ جمع نوشتم ۱ + ۲ + … + ۲۰ = ۲۱۰ و ۱ + ۲ + … + ۱۰ = ۵۰. مساحتِ دایرهٔ شعاع ۲ هم π × ۲² = ۱۲٫۵۶ و ۱/۲ + ۱/۳ = ۵/۶.'));
    return [x.some(d => /۱ \+ ۲ \+ … \+ ۲۰ = ۲۱۰/.test(d) && /۱ \+ ۲ \+ … \+ ۱۰ = ۵۰/.test(d)) && !x.some(d => /^\+/.test(d)), J(x)]; };
  K.U_A30_8_mark = async () => { const m = await mk('برای تمرینِ جمع نوشتم ۱ + ۲ + … + ۲۰ = ۲۱۰ و ۱ + ۲ + … + ۱۰ = ۵۰'); return [/^حسابِ صفحه: ✗/.test(m) && /۱ \+ ۲ \+ … \+ ۱۰/.test(m) && !/نسنجیده/.test(m), m]; };
  K.U_A30_8_p19 = async () => { const x = await ev(() => APP.STORY.dataOf('آره: نفرِ دوم ۱ دست، سومی ۲، ... دوازدهمی ۱۱ — جمعش ۱ + ۲ + … + ۱۱ = ۶۶. همون شد.')); return [x.some(d => /۱ \+ ۲ \+ … \+ ۱۱ = ۶۶/.test(d)) && !x.some(d => /^\+/.test(d)), J(x)]; };
  /* هم‌شکلِ منفی: «… هیچی جور نمیشه» (s08 p1) همان پایانِ جمله است */
  K.U_A30_8_neg = async () => { const x = await ev(() => APP.STORY.dataOf('نصفه روزه دارم امتحان می‌کنم: ۷+۷=۱۴، ۱۱+۷=۱۸، ۱۱+۱۱=۲۲ … هیچی جور نمیشه. اعصابم خورده.')); return [!x.some(d => /هیچی جور/.test(d)), J(x)]; };

  /* ---------- F15 / C30-1 (s24 p2) + A30-9 نیمهٔ s03: تعریف و معادلهٔ متغیردار «نسنجیده» نمی‌گیرد ---------- */
  K.U_C30_1 = async () => { const m = await mk('پس جوابش همون رابطه‌ست: a_n = a_(n−1) + a_(n−2) + a_(n−3) با a_1 = 1، a_2 = 2، a_3 = 4. پس برای ۳۰ پله میشه a_30.'); return [!/نسنجیده/.test(m), m]; };
  K.U_A30_9_eq = async () => { const m = await mk('تازه ۱۷ ≡ ۲ (mod ۵) و اگه 2x + 3 = 11 باشه x = 4'); return [!/نسنجیده/.test(m), m]; };
  /* هم‌شکل‌های منفی: حسابِ عددی و اتحادِ نمادینِ عدددار همان می‌مانند */
  K.U_C30_1_neg = async () => { const m = [await mk('۴ × ۵ = ۲۰ و ۲۰ − ۳ = ۱۸'), await mk('اون‌وقت [n/2^k] = a_k + 2a_{k+1} + … میشه'), await mk('π × ۲² = ۱۲٫۵۶')];
    return [/✗/.test(m[0]) && /✓/.test(m[2]) && !/^حسابِ صفحه: ✓/.test(m[1]), J(m)]; };

  for (const k of Object.keys(K)) { if (process.env.ONLY && !process.env.ONLY.split(',').some(o => k.indexOf(o) === 0)) continue; info.n++;
    try { const r = await K[k](); if (r[0]) info.ok++; else errors.push(k + ' ⇒ ' + String(r[1]).slice(0, 1200)); } catch (e) { errors.push(k + ' exception: ' + String(e && e.stack || e).split('\n').slice(0, 2).join(' | ')); } }
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
