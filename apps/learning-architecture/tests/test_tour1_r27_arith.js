// تورِ پولیا (دستهٔ ۱، دورِ ۲۷، سهمِ «arith» — ۲۰۲۶-۱۱-۱۵) — DECISIONS_R27 R1 «خوانندهٔ حساب» (S1: D27-18، D27-1) + C40–C45 + C59–C65.
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۷ (پرامپت‌ها: T/round27X/<sid>/ai/pN.json):
//           S1-a D27-18 (s31 p2)؛ S1-b D27-1 (arD1 p12–p14)؛ D27-6 (arD1 p13)؛ D27-5 (arD1 p10/p11، arD2 p4)؛ D27-7 (arD1 p13)؛ D27-23 (s36 p3)؛ D26-24 aD4 (p2)
//           A27-3 (s01 p16)، A27-6 (s03 p17)، A27-13 (s06 p8، pA2 p8)، A27-18 (aA1 p4)، A26-20 (pA3 p12)؛ B27·D9 (s17 p10، pwB1 p14)، B27·D13 (pwB1 p14)، U26 (aB2 p12)
//           C27-13 (s25 p20)، C27-22 (pwC1 p14)، C27-25 (pwC1 p22)
//  bank     همهٔ ۶۴ ورودیِ R1.arith_reader در بانکِ مستقلِ tests/variants/VARIANTS_R27.json
//  neither  کنارِ هر اصلاحِ مثبت، شبیهِ منفی‌اش (C40: جمعِ درست جمع می‌ماند؛ C41: «۳ تا ۴ تا مهمون» بازه است؛ C42: سه‌نقطهٔ غیرِ حسابی نسنجیده؛ C43: «آره» ِ تنها به سطرِ کسِ دیگر نمی‌خورد؛ …)
//  clock    روزِ صفحه منجمد است (APP.today)؛ هیچ انتظاری به تاریخِ تقویم بسته نیست (تاریخِ بانکِ #63 از امروز ساخته می‌شود)
// LLA_FILE = ساختِ دیگر (برای «قرمزِ نخست»: ساختِ BASE27)؛ ONLY=engine,answer,block,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = JSON.parse(fs.readFileSync(process.env.LLA_VARIANTS || path.join(__dirname, 'variants', 'VARIANTS_R27.json'), 'utf8'));

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
  const T0 = new Date().toISOString().slice(0, 10);   // روزِ منجمدِ صفحه = امروز (هیچ انتظاری به آن بسته نیست)
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0; window.__noNav = true;
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    window.__turn = async (text, reply, actions) => {
      const n0 = __calls.length; __q.push(R({ reply: reply || 'باشه.', actions: actions || [] }));
      await APP.ASSIST.send(text); __q.length = 0;
      const all = __calls.slice(n0), c = all.filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {};
      return { user: c.user || '', n: all.length };
    };
    window.__fresh = (view) => { APP.go(view || 'home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__ac = (t) => { const ck = APP.STORY.arithChk(t);
      return { c: ck.map(c => ({ expr: c.expr, said: String(c.saidT || c.said), st: c.ask ? 'ask' : c.ok ? 'ok' : 'flag', kind: c.kind || '', valT: c.valT || '', other: c.other || '', unitQ: c.unitQ || '', pos: c.pos, pe: c.pe })), u: (ck.unread || []).map(u => u.text),
        lines: APP.STORY.arithLines(ck), said: APP.STORY.arithSaid(ck) }; };
  }, T0);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const turn = (text, reply, actions) => p.evaluate(([t, r, a]) => __turn(t, r, a), [text, reply || '', actions || []]);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const csn = (o) => Object.assign({ do: 'coach_state', role: 'self', nat: 'practical', stuck: false, fail: false, ph: 'e', said: [] }, o);
  const AC = (t) => p.evaluate((t) => __ac(t), t);
  const askOf = () => p.evaluate(() => JSON.parse(JSON.stringify((__cur().coach || {}).arithAsk || [])));
  const blockOf = (u, name) => { const H = head(u), i = H.indexOf(name || '# حسابِ صفحه روی همین پیام'); return i < 0 ? '' : H.slice(i).split('\n#')[0]; };
  const verdict = (r) => r.c.some(c => c.st === 'flag') ? 'FLAG' : r.c.some(c => c.st === 'ask') ? 'ASK' : r.c.length ? (r.u.length ? 'OK+UNCHECKED' : 'OK') : r.u.length ? 'UNCHECKED' : 'SILENT';
  const J = (r) => JSON.stringify(r.c.map(c => [c.expr, c.said, c.st, c.kind, c.valT, c.other])) + ' unread=' + JSON.stringify(r.u);
  const want = async (t, exp, tag, more) => { const r = await AC(t), v = verdict(r), ok = (Array.isArray(exp) ? exp : [exp]).includes(v) && (!more || more(r)); chk(ok, tag + ' [' + exp + '] «' + t + '» ⇒ ' + v + ' :: ' + J(r)); return ok; };
  const sts = (r) => r.c.map(c => c.st === 'ask' && c.kind === 'andmul' ? 'ASKx' : c.st.toUpperCase());

  // ================= engine — جمله‌های خودِ گزارش‌ها + شبیهِ منفیِ هر کدام =================
  await section('engine', async () => {
    // ---- S1-a D27-18 (C40): «A و B میشه C» با ضربِ درست هرگز ✗ نیست؛ «ضرب کردی؟» ----
    let r = await AC('آره چک کردم، ۵+۵=۱۰ و ۵×۵=۲۵، با ۴ و ۶ میشه ۲۴ که کمتره. درسته دیگه. سؤال بعدی؟');
    chk(JSON.stringify(sts(r)) === '["OK","OK","ASKx"]' && !r.lines.some(l => /^✗/.test(l)) && /ضرب کردی؟/.test(r.lines[2]), 'D27-18 s31 p2 (S1-a): «با ۴ و ۶ میشه ۲۴» is asked «ضرب کردی؟», never ✗ :: ' + J(r) + ' ' + JSON.stringify(r.lines));
    await want('۴ و ۶ میشه ۱۰', 'OK', 'neg C40: a fitting sum stays a sum (no question)');
    await want('۳ و ۴ میشه ۸', 'FLAG', 'neg C40: neither the sum (7) nor the product (12) ⇒ ✗', r => r.c[0].kind !== 'andmul');
    // ---- S1-b D27-6 (C26 + C57): «۱۳/۱۲ = ۱» ِ چسبیده و «۱۳ ÷ ۱۲ = ۱» دو سطرند؛ هر دو کارِ برادر ----
    r = await AC('نسخهٔ دومِ همین حساب‌ها رو برادرم نوشته بود، اینا رو هم ببین: ۱۳/۱۲ = ۱. ۱۳ ÷ ۱۲ = ۱. ۲۰ درصدِ ۳۰۰ میشه ۶۶. π × ۱۰² ≈ ۳۴۱. ۱ + ۲ + … + ۲۰ = ۲۲۰. ۲ میلیون × ۳ = ۶ هزار تومن.');
    chk(r.c.length === 6 && r.c[0].expr === '13/12' && r.c[0].st === 'flag' && r.c[1].st === 'ask' && r.c.every(c => c.other === 'برادرم') && r.lines.every(l => /کارِ دیگری — «برادرم»/.test(l)) && !r.said.length,
      'D27-6 arD1 p13: the glued identity is ✗, the quotient is «؟», never merged; every line filed as «کارِ دیگری» and none is her result :: ' + J(r));
    chk(/۶ میلیون/.test(r.c[5].valT) && !/۶۰۰۰ هزار/.test(r.c[5].valT) && r.c[4].valT === '۲۱۰', 'D27-7 (C45) + C42: «۶ میلیون», never «۶۰۰۰ هزار»; the ellipsis sum is computed :: ' + J(r));
    r = await AC('برای داداشم نوشتم ۷ × ۸ = ۵۴'); chk(r.c[0] && r.c[0].st === 'flag' && !r.c[0].other, 'neg C57: a first-person verb («برای داداشم نوشتم») is her own work :: ' + J(r));
    r = await AC('مادرم اولش نه گفت، ولی گفت امتحانش می‌کنم. پس نمره‌ی مادر برای شیراز میشه ۷ نه ۲. شیراز = ۲٫۷ + ۱٫۶ + ۱٫۲ + ۰٫۸ + ۱٫۴ = ۷٫۷');
    chk(r.c.length && r.c.every(c => !c.other), 'neg C57 (pwB2 p9): «مادرم … گفت» without a number is no attribution of her arithmetic :: ' + J(r));
    await want('دوستم نوشته بود ۷×۸ = ۵۴ که غلطه', 'SILENT', 'neg (R25 bank #97): a line she herself calls wrong stays out');
    // ---- C41: «A متر در B متر»، «N تکه‌ی M متری»، «N تا M تا»، «سه تا A» ----
    r = await AC('باشه، جمعه پیگیری کن. یه مقایسه هم کردم: اتاقِ پسرم این‌جا ۳ متر در ۴ متر = ۱۲ مترمربعه، توی خونهٔ قبلی ۳ متر در ۳ متر = ۱۲ مترمربع بود، پس فرقی نکرده.');
    chk(JSON.stringify(sts(r)) === '["OK","FLAG"]' && /۹/.test(r.c[1].valT), 'A27-3 s01 p16: «۳ متر در ۳ متر = ۱۲» is ✗ (9), «۳ در ۴» ✓ :: ' + J(r));
    await want('برای اتاقِ بچه‌ها هم: ۳ متر در ۵ متر = ۱۲ مترمربع، دورش ۲ × (۳ + ۵) = ۱۸ متر، و ۲۹۴۳۰۰ ÷ ۴۹ = ۶۱۳۱ ثانیه، حدودِ ۱۰۲ دقیقه.', 'FLAG', 'D27-5 arD1 p11', r => r.c[0].st === 'flag' && /۱۵/.test(r.c[0].valT));
    await want('لامپ‌ها رو هم حساب کردم: ۴ × ۲۵ = ۱۰۰ هزار تومن. سیم‌کشیِ روی دیوار هم ۳ متر در ۴ متر = ۱۲ مترمربع جا می‌گیره.', 'OK', 'D27-5 arD2 p4', r => r.c.length === 2);
    await want('اتاقکِ دوم برای تابلوبرق: ۳ متر در ۵ متر = ۱۸ مترمربع، دورش ۲ × (۳ + ۵) = ۱۸ متر.', 'FLAG', 'C27-25 pwC1 p22', r => r.c.filter(c => c.st === 'flag').length === 2);
    r = await AC('کفِ مخزن رو هم حساب کردم: ۳ متر در ۴ متر = ۱۲ مترمربع، با عمقِ ۱٫۵ متر حجمش ۱۲ × ۱٫۵ = ۱۸ متر مکعب میشه. اگه جا کم بود و کف رو ۲٫۵ متر در ۴ متر بگیرم = ۱۲ مترمربع، همون ۱۸ مترمکعب میشه. تبخیرِ تابستون هم حدودِ ۲۰ درصده: ۲۰ درصدِ ۱۸ مترمکعب = ۳٫۶ مترمکعب.');
    chk(JSON.stringify(sts(r)) === '["OK","OK","FLAG","OK"]', 'B27·D9 s17 p10: «۲٫۵ متر در ۴ متر بگیرم = ۱۲» is ✗ :: ' + J(r));
    r = await AC('دو سه تا حسابِ دیگه هم کردم: لوله‌ی رانش ۴ تکه‌ی ۳ متری = ۱۲ متر. کابلِ برق ۲ تکه‌ی ۷ متری = ۱۵ متر. انرژی با ۱۸ متر: ۲۰۰۰ × ۹٫۸۱ × ۱۸ = ۳۵۳ هزار ژول، و ۳۵۳۱۶۰ ÷ ۴۸ = ۷۳۵۸ ثانیه، حدودِ ۱۲۳ دقیقه.');
    chk(JSON.stringify(sts(r).slice(0, 3)) === '["OK","FLAG","ASK"]' && r.c[2].valT === '۳۵۳٫۱۶ هزار', 'B27·D9 + B27·D13 pwB1 p14: «N تکه‌ی M متری» read; the exact value in her scale «۳۵۳٫۱۶ هزار» (never «۳۵۳۱۶۰ هزار») :: ' + J(r));
    await want('اتاقم ۳ متر در ۴ متره، یه فرش می‌خوام', 'SILENT', 'neg C41: no claimed value');
    await want('۱۲۰ کیلومتر در ۲ ساعت = ۶۰ کیلومتر بر ساعت', ['SILENT', 'UNCHECKED', 'OK'], 'neg C41: «در ۲ ساعت» (time) is never a product ✗');
    r = await AC('اول همه شیرینیا رو میشمارم. ۳ تا ۸ تا میشه ۲۴. بعد ۵ تا رو کم میکنم میشه ۱۹. بعد ۱۹ رو تقسیم بر ۳ میکنم... ولی ۱۹ تقسیم بر ۳ نمیشه! ۳ تا ۶ تا میشه ۱۸ نه ۱۹. گیر کردم');
    chk(JSON.stringify(sts(r)) === '["OK","OK","OK"]' && /۲۴ − ۵/.test(r.lines[1]), 'A27-18 aA1 p4: «۳ تا ۸ تا میشه ۲۴» and «۵ تا رو کم میکنم میشه ۱۹» are read :: ' + J(r));
    await want('۳ تا ۸ تا میشه ۲۴. بعد ۵ تا رو کم میکنم میشه ۱۸.', 'FLAG', 'neg A27-18: a wrong running difference is ✗', r => r.c[1].st === 'flag');
    await want('۳ تا ۴ تا مهمون میان', 'SILENT', 'neg C41: a range, no claim');
    await want('۲ تا ۳ روز دیگه میشه ۱۵', 'SILENT', 'neg C28: «N تا M روز» stays a range');
    await want('اون کارتِ تاریخ رو زدم، قبول نکرد، گفت مهر سی روزه؛ راست میگه، اشتباه زدم. من ۵ تیر ۱۳۲۴ به دنیا اومدم. حالا جوابِ شما: سه تا ۸۰ میشه درست ۲۴۰، اندازهٔ خودِ تخته.', 'OK', 'D26-24 aD4 p2: «سه تا ۸۰ میشه درست ۲۴۰»');
    await want('سه تا ۸۰ میشه درست ۲۵۰', 'FLAG', 'neg D26-24: a wrong «سه تا A» is ✗');
    // ---- C42: جمعِ سه‌نقطه‌ای ----
    r = await AC('یه چیزِ کناری: برای تمرینِ جمع نوشتم ۱ + ۲ + … + ۲۰ = ۲۱۰ و ۱ + ۲ + … + ۱۰ = ۵۰. مساحتِ دایرهٔ شعاع ۲ هم π × ۲² = ۱۲٫۵۶ و ۱/۲ + ۱/۳ = ۵/۶.');
    chk(JSON.stringify(sts(r)) === '["OK","FLAG","OK","OK"]' && r.c[1].expr === '1 + 2 + … + 10' && !r.u.length, 'A27-6 s03 p17: «۲۱۰ و» is no addend; «۱ + … + ۱۰ = ۵۰» ✗ :: ' + J(r));
    r = await AC('امروز چندتا جمعِ دیگه امتحان کردم: ۱ + ۲ + … + ۲۰ = ۲۱۰، با همون فرمولِ n(n+1)/2. ۱ + ۳ + … + ۱۹ = ۱۰۴.');
    chk(JSON.stringify(sts(r)) === '["OK","FLAG"]', 'U26 aB2 p12: both AP sums judged (210 ✓, 104 ✗) :: ' + J(r));
    r = await AC('و اینا: ۱ + ۲ + … + ۲۰ = ۲۱۰، ۲۰ درصدِ ۳۰۰ = ۶۰، مساحتِ دایره با شعاعِ ۲ میشه π × ۲² ≈ ۱۲٫۵۷. اینا رو هم نوه‌م نوشته: ۱ + ۲ + … + ۱۰ = ۵۰ و ۲۰ درصدِ ۳۰۰ = ۶۶.');
    chk(JSON.stringify(sts(r)) === '["OK","OK","OK","FLAG","FLAG"]' && !r.c[0].other && r.c[3].other === 'نوه‌م' && r.c[4].other === 'نوه‌م' && !r.u.length, 'C27-13 s25 p20: her lines are hers, the grandchild\'s two lines ✗ «کارِ دیگری» :: ' + J(r));
    await want('۲ + ۴ + … + ۱۹ = ۹۰', 'UNCHECKED', 'neg C42: not a progression ⇒ «نسنجیده»');
    await want('۱ + ۲ + … + n = ۵۵', 'UNCHECKED', 'C64: a symbolic last term stays «نسنجیده» (not silent)');
    await want('۱۰ + ۹ + … + ۱ = ۵۵', 'OK', 'C64: descending'); await want('۰٫۵ + ۱ + … + ۵ = ۲۷٫۵', 'OK', 'C64: decimal step'); await want('−۳ + −۱ + … + ۷ = ۸', 'FLAG', 'C64: negative terms (exact 12)');
    // ---- جمعِ پیاپی با نامِ قلم (C27-22) ----
    r = await AC('هزینه رو هم حساب کردم: پنل‌ها ۱۲ × ۴٫۵ = ۵۴ میلیون، با پمپ ۳۸ میلیون میشه ۹۲، با لوله‌کشی ۲۳ میشه ۱۱۵ میلیون. سهمِ هر کدوم از سه برادر = ۱۱۵/۳ = ۳۸ و خرده‌ای، یعنی ۳۸٫۳۳.');
    chk(JSON.stringify(sts(r)) === '["OK","OK","OK","OK"]' && r.c.every(c => !c.other), 'C27-22 pwC1 p14: the running sum «با پمپ ۳۸ میلیون میشه ۹۲، با لوله‌کشی ۲۳ میشه ۱۱۵» is read :: ' + J(r));
    await want('پنل‌ها ۱۲ × ۴٫۵ = ۵۴ میلیون، با پمپ ۳۸ میلیون میشه ۹۰', 'FLAG', 'neg C27-22: a wrong running sum is ✗');
    r = await AC('مساحتِ دایره با شعاعِ ۲ میشه π × ۲² ≈ ۱۲٫۵۷'); chk(!r.u.length, 'neg C27-22: «با شعاعِ ۲» (ezafe) is no running sum :: ' + J(r));
    // ---- C44 / C61 ----
    await want('۸ لیتر رو هم امتحان کردم: ۲+۲=۴ از ۲۶ میشه ۱۵٪. پس ۸ لیتر جوابه؟', 'ASK', 'D27-23 s36 p3 (C44)', r => r.c[1].st === 'ask' && /۱۵٫۳۸٪/.test(r.c[1].valT) && !/باقی‌مانده/.test(r.lines[1]));
    await want('۳۰ از ۴۰ میشه ۷۵٪', 'OK', 'neg C44: an exact percentage'); await want('۴ از ۲۶ میشه حدود ۱۵٪', 'OK', 'neg C44: «حدود» marks her rounding');
    await want('۱۳ ÷ ۱۲ = ۱٫۰۸', 'OK', 'neg C61: a short decimal follows C9');
    // ---- C45 / C62 ----
    await want('۴۵۰ × ۱۲۰۰ = ۵۰۰ هزار', 'FLAG', 'C45/C62: «۵۴۰ هزار» in her scale', r => r.c[0].valT === '۵۴۰ هزار');
    await want('سالی ۴٫۲ × ۱۲ = ۵۲٫۴ میلیون', 'FLAG', 'C45: the scaled reading she meant («۵۰٫۴ میلیون»)', r => r.c[0].valT === '۵۰٫۴ میلیون');
    // ---- هم‌طولیِ یکدست‌سازی (experiences/exact-arithmetic-check… «Update 2026-11-15»): pos/pe روی متنِ خودِ او همان حساب را می‌بُرد ----
    for (const [t, re] of [['کفش ۳ متر در ۴ متر = ۱۲ مترمربع', /^۳ متر در ۴ متر = ۱۲$/], ['نمک ۴ از ۲۶ = ۱۵٪', /^۴ از ۲۶ = ۱۵٪$/]]) {   // (rewrites older than round 27 — «درصد ⇒ %»، «میشه ⇒ ＝»، «ضرب در» — still change the length: HANDBOOK §12 row 84)
      const r = await AC(t); chk(r.c[0] && re.test(t.slice(r.c[0].pos, r.c[0].pe)), 'length-preserving rewrite: «' + t + '» ⇒ slice «' + (r.c[0] ? t.slice(r.c[0].pos, r.c[0].pe) : '') + '»'); }
    // ---- A26-20 «ذرع» ----
    await want('پارچه‌فروش به ذرع می‌فروشه: ۵ ذرع = ۵٫۲ متر.', 'UNCHECKED', 'A26-20 pA3 p12: an unknown unit conversion is «نسنجیده», not silent');
    await want('۵ متر = ۵۰۰ سانت', 'OK', 'neg A26-20: a known conversion is still judged');
    // ---- C59 / C60 ----
    r = await AC('۸ و ۳ میشه ۱۱ متر مربع'); chk(verdict(r) === 'OK' && r.c[0].unitQ && /فقط برای تو \(مربی\)/.test(r.lines[0]) && !/^✗/.test(r.lines[0]), 'C59: a fitting sum with an area unit is ✓ and the coach alone gets the unit question :: ' + J(r) + JSON.stringify(r.lines));
    r = await AC('۶ و ۴ میشه ۱۰ کیلو آرد'); chk(verdict(r) === 'OK' && !r.c[0].unitQ, 'neg C59: a non-area unit gets no unit question :: ' + J(r));
    await want('پنج و شش میشه سی', 'ASK', 'C60: number words are read (C40 ⇒ «ضرب کردی؟»)', r => r.c[0].kind === 'andmul');
    await want('پنج و شش میشه یازده', 'OK', 'C60: a fitting sum in words');
    await want('بیست و پنج میشه ۲۵', 'SILENT', 'neg C60: «بیست و پنج» is one number, not a sum');
  });

  // ================= answer — C43/C65: «آره، گرد کردم» فقط به «؟» ِ منتظرِ خودش =================
  await section('answer', async () => {
    // D27-1 (S1-b) با همان سه پیامِ arD1 p12–p14
    await wipe(); await fresh();
    await turn('چند تا حسابِ دیگه هم برای قیمت و اندازه‌ها کردم: ۱۳ ÷ ۱۲ = ۱٫۰۸، یعنی ۱۳ تقسیم بر ۱۲ میشه ۱٫۰۸ و کسرِ ۱۳/۱۲ هم همونه. ۲۰ درصدِ ۳۰۰ میشه ۶۰. صفحهٔ بازتابندهٔ گردش شعاعِ ۱۰ سانت داره: π × ۱۰² ≈ ۳۱۴ سانتی‌مترمربع. جمعِ ساعت‌های روشن بودنش تو ۲۰ روزِ اول که هر روز یکی بیشتر شد: ۱ + ۲ + … + ۲۰ = ۲۱۰ ساعت. قیمتِ سه تا بخاری ۲ میلیون × ۳ = ۶ میلیون تومن. و ۱۰۰ ÷ ۷ = ۱۴ تومن برای هر وات.', 'دقیقش ۱۴٫۲۹ است؛ گرد کردی؟', [csn({})]);
    let u = await turn('نسخهٔ دومِ همین حساب‌ها رو برادرم نوشته بود، اینا رو هم ببین: ۱۳/۱۲ = ۱. ۱۳ ÷ ۱۲ = ۱. ۲۰ درصدِ ۳۰۰ میشه ۶۶. π × ۱۰² ≈ ۳۴۱. ۱ + ۲ + … + ۲۰ = ۲۲۰. ۲ میلیون × ۳ = ۶ هزار تومن.', 'دیدم.', [csn({})]);
    let B = blockOf(u.user); chk(/✗ \(کارِ دیگری — «برادرم»/.test(B) && /«۱۳\/۱۲» را «۱» نوشته/.test(B), 'D27-6 in the prompt: the brother\'s identity reaches the coach as ✗ «کارِ دیگری» :: ' + B.slice(0, 400));
    u = await turn('آره، اون ۱۴ رو گرد کردم.', 'باشه.', [csn({})]);
    B = blockOf(u.user, '# جوابِ او به «؟» ِ صفحه'); let A0 = await askOf();
    chk(/✓ به گفتهٔ خودش گرد کرده بود: «۱۰۰ \/ ۷ ≈ ۱۴»/.test(B) && !/۱۳/.test(B) && A0.filter(a => a.re).length === 1 && A0.find(a => a.re).said === '14' && A0.some(a => a.other === 'برادرم' && !a.re),
      'D27-1 (S1-b, C43): «آره، اون ۱۴ رو گرد کردم» binds to her «۱۰۰ ÷ ۷ = ۱۴», never to the brother\'s «۱۳/۱۲ = ۱» :: ' + B + ' :: ' + JSON.stringify(A0));
    // بانکِ #37: یک «؟» ⇒ «آره گرد کردم» به همان
    await wipe(); await fresh();
    await turn('۹۰ ÷ ۷ = ۱۳', 'دقیقش ۱۲٫۸۵… است؛ گرد کردی؟', [csn({})]);
    u = await turn('آره گرد کردم', 'باشه.', [csn({})]); B = blockOf(u.user, '# جوابِ او به «؟» ِ صفحه');
    info.bank[36] = /✓ به گفتهٔ خودش گرد کرده بود: «۹۰ \/ ۷ ≈ ۱۳»/.test(B); chk(info.bank[36], 'bank#37: the only waiting line is bound :: ' + B);
    // بانکِ #38: دو «؟» ⇒ «کدام؟»؛ «هر دو» ⇒ هر دو
    await wipe(); await fresh();
    await turn('۵۰ ÷ ۳ = ۱۷ و ۸۰ ÷ ۶ = ۱۳', 'هر دو را گرد کردی؟', [csn({})]);
    u = await turn('آره گرد کردم', 'باشه.', [csn({})]); B = blockOf(u.user, '# جوابِ او به «؟» ِ صفحه'); A0 = await askOf();
    let ok38 = /کدام؟/.test(B) && !A0.some(a => a.re);
    u = await turn('هر دو رو گرد کردم', 'باشه.', [csn({})]); A0 = await askOf();
    ok38 = ok38 && A0.filter(a => a.re && a.re.to === 'ok').length === 2; info.bank[37] = ok38;
    chk(ok38, 'bank#38 (C43): two waiting lines ⇒ «کدام؟», nothing stored; «هر دو» binds both :: ' + B + ' :: ' + JSON.stringify(A0));
    // بانکِ #39 و C65: «؟» ِ خودش + سطرِ کسِ دیگر ⇒ فقط مالِ خودش
    await wipe(); await fresh();
    u = await turn('داداشم نوشته ۱۵/۱۴ = ۱. من هم ۱۰۰ ÷ ۶ = ۱۷', 'خطِ برادرت نمی‌خواند؛ مالِ خودت را گرد کردی؟', [csn({})]); B = blockOf(u.user);
    let ok39 = /✗ \(کارِ دیگری — «داداشم»/.test(B) && /؟ «۱۰۰ \/ ۶»/.test(B) && !/؟ \(کارِ دیگری/.test(B);
    u = await turn('آره، اون ۱۷ رو گرد کردم', 'باشه.', [csn({})]); A0 = await askOf();
    ok39 = ok39 && A0.length === 1 && A0[0].said === '17' && A0[0].re && A0[0].re.apx; info.bank[38] = ok39;
    chk(ok39, 'bank#39: brother\'s identity ✗ «کارِ دیگری»; her «۱۷» bound only to her line :: ' + B.slice(0, 300) + ' :: ' + JSON.stringify(A0));
    await wipe(); await fresh();
    await turn('داداشم نوشته ۱۳ ÷ ۱۲ = ۱. من هم ۱۰۰ ÷ ۷ = ۱۴', 'هر دو گرد شده‌اند؟', [csn({})]);
    u = await turn('آره گرد کردم', 'باشه.', [csn({})]); A0 = await askOf(); B = blockOf(u.user, '# جوابِ او به «؟» ِ صفحه');
    chk(A0.filter(a => a.re).length === 1 && A0.find(a => a.re).said === '14' && A0.some(a => a.other && !a.re) && !/کدام؟/.test(B), 'C65: her own «؟» and another person\'s «؟» both wait ⇒ a bare «گرد کردم» binds to hers :: ' + JSON.stringify(A0));
    // بانکِ #60/#61: هیچ «؟» ِ منتظر ⇒ چیزی ثبت نمی‌شود و صفحه یک بار می‌گوید
    for (const [i, first] of [[59, 'مامانم نوشته ۱۱/۱۰ = ۱'], [60, '۱/۲ + ۱/۳ + ۱/۴ = ۱']]) {
      await wipe(); await fresh();
      await turn(first, 'این خط نمی‌خواند.', [csn({})]);
      u = await turn('آره گرد کردم', 'باشه.', [csn({})]); B = blockOf(u.user, '# جوابِ او به «؟» ِ صفحه'); A0 = await askOf();
      info.bank[i] = /به هیچ «؟» ِ بازی از خودش نمی‌خورد/.test(B) && !/✓ به گفتهٔ خودش/.test(B) && !A0.some(a => a.re);
      chk(info.bank[i], 'bank#' + (i + 1) + ': «آره گرد کردم» binds to nothing and the page says so once :: ' + B + ' :: ' + JSON.stringify(A0));
    }
    // بانکِ #62: «نه، گرد نکردم» ⇒ ✗
    await wipe(); await fresh();
    await turn('۹۰ ÷ ۷ = ۱۳', 'گرد کردی؟', [csn({})]);
    u = await turn('نه، گرد نکردم، فکر کردم دقیقاً ۱۳ ـه', 'باشه.', [csn({})]); B = blockOf(u.user, '# جوابِ او به «؟» ِ صفحه');
    info.bank[61] = /✗ به گفتهٔ خودش گرد نکرده بود/.test(B) && !/۱۲٫۸/.test(B); chk(info.bank[61], 'bank#62: «نه» leaves ✗, no exact value told :: ' + B);
    // C40 + جواب: «آره ضرب کردم» ⇒ ✓ با خوانشِ ضرب
    await wipe(); await fresh();
    u = await turn('۵×۵=۲۵، با ۴ و ۶ میشه ۲۴', 'ضرب کردی؟', [csn({})]); B = blockOf(u.user);
    chk(/ضرب کردی؟/.test(B) && !/✗ «۴ و ۶»/.test(B), 'D27-18 in the prompt: «ضرب کردی؟», never ✗ :: ' + B.slice(0, 400));
    u = await turn('آره ضرب کردم', 'باشه.', [csn({})]); B = blockOf(u.user, '# جوابِ او به «؟» ِ صفحه');
    chk(/به گفتهٔ خودش ضرب کرده بود/.test(B), 'C40: «آره ضرب کردم» books the product reading ✓ :: ' + B);
    // «آره» ِ تنها دیرتر از پیامِ پیشین به «؟» ِ کهنه نمی‌خورد
    await wipe(); await fresh();
    await turn('۹۰ ÷ ۷ = ۱۳', 'گرد کردی؟', [csn({})]); await turn('بریم سراغ بخشِ بعدی', 'باشه.', [csn({})]);
    u = await turn('آره', 'باشه.', [csn({})]); chk(!/# جوابِ او به «؟»/.test(head(u.user)) && !(await askOf()).some(a => a.re), 'neg C43: a bare «آره» two messages later binds nothing');
  });

  // ================= block — A27-13: گامِ خودش در آغازِ گفت‌وگوی تازه به مربی می‌رسد =================
  await section('block', async () => {
    await wipe(); await fresh();
    let u = await turn('یه سؤالِ تازه: سرورِ صف‌مون شب‌ها کند میشه. خودم یه گام رفتم: ۲۰۰ پیام در ثانیه × ۳۶۰۰ = ۷۲۰۰۰۰ پیام در ساعت. حالا نمی‌دونم گلوگاه کجاست.', 'باشه.', [csn({ ph: 'u' })]);
    chk(/✓ «۲۰۰ پیام در ثانیه × ۳۶۰۰ = ۷۲۰۰۰۰» می‌خواند/.test(blockOf(u.user)), 'A27-13 s06 p8: her own step at the opening reaches the coach :: ' + head(u.user).slice(-600));
    await wipe(); await fresh();
    u = await turn('سلام، یه مسئلهٔ تازه دارم: اجارهٔ مغازه ۲۰٪ رفته بالا و می‌خوام بدونم قیمتِ کفش رو چقدر ببرم بالا. خودم یه گامش رو رفتم: ۴۰ میلیون × ۱٫۲ = ۴۸ میلیون اجارهٔ جدید. از این‌جا به بعدش رو نمی‌دونم.', 'باشه.', [csn({ ph: 'u' })]);
    chk(/✓ «۴۰ میلیون × ۱.۲ = ۴۸ میلیون» می‌خواند/.test(blockOf(u.user)), 'A27-13 pA2 p8 :: ' + blockOf(u.user));
    await wipe(); await fresh();
    u = await turn('امروز ۲ × ۳ = ۶ تا تخم‌مرغ خریدیم، خوش گذشت', 'باشه.');
    chk(!blockOf(u.user), 'neg A27-13: a right line in small talk (no work marker) still brings no block :: ' + blockOf(u.user));
  });

  // ================= bank — R1.arith_reader (۶۴ ورودی) =================
  await section('bank', async () => {
    const E = BANK, R1 = E.map((e, i) => i).filter(i => /^R1\./.test(E[i].rc));
    chk(R1.length === 64 && R1[0] === 0 && R1[63] === 63, 'bank layout: 64 R1 entries at 0…63 :: ' + R1.length);
    const tx = (i) => E[i].text.replace(/^U:\s*/, '');
    // تاریخِ #63 از امروز ساخته می‌شود (هیچ تاریخِ تقویمیِ ثابت در آزمون نیست)
    const d12 = new Date(Date.now() + 12 * 864e5), jd = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(d12).reduce((o, x) => (o[x.type] = x.value, o), {});
    const X = { 0: ['OK', 'ASKx'], 1: ['ASKx'], 2: ['ASKx'], 3: ['ASKx'], 4: ['OK'], 5: ['OK'], 6: ['FLAG'], 7: ['OK'], 8: ['OK'], 9: ['FLAG'], 11: ['OK'], 12: ['FLAG'], 13: ['OK'], 14: ['OK'], 15: ['FLAG'], 16: ['OK'], 17: ['FLAG'], 18: ['OK'],
      19: ['OK'], 20: ['FLAG'], 21: ['FLAG'], 22: ['OK'], 23: ['OK'], 24: ['FLAG'], 25: ['FLAG'], 26: ['OK', 'OK'], 27: ['OK', 'FLAG'], 28: ['OK'], 29: ['FLAG'], 30: ['ASK'], 31: ['FLAG'], 32: ['FLAG'], 33: ['ASK'], 34: ['ASK'], 35: ['ASK'],
      39: ['ASK', 'FLAG'], 41: ['FLAG'], 42: ['OK', 'OK'], 43: ['OK'], 44: ['OK'], 45: [], 46: [], 47: [], 48: [], 53: [], 54: ['ASK'], 55: ['OK'], 56: ['OK'], 57: ['FLAG'], 58: ['FLAG'], 62: [], 63: [] };
    const more = { 20: r => r.c[0].valT === '۷۸', 21: r => r.c[0].expr === '1 + 2 + … + 12', 29: r => r.c[0].valT === '۹ میلیون', 30: r => r.c[0].valT === '۳۲۳٫۷۳ هزار', 31: r => r.c[0].valT === '۶ میلیون', 32: r => r.c[0].valT === '۵۴۰ هزار',
      44: r => !!r.c[0].unitQ && !r.lines.some(l => /^✗|^؟/.test(l)), 39: r => r.c[1].expr === '17/16' };
    for (const i of R1) {
      if ([36, 37, 38, 59, 60, 61].includes(i)) continue;   // با گفت‌وگوی واقعی در «answer»
      let t = tx(i); if (i === 62) t = jd.year + '/' + jd.month + '/' + jd.day + ' قسطِ آخره';
      const r = await AC(t), v = verdict(r);
      let ok;
      if (X[i]) ok = JSON.stringify(sts(r)) === JSON.stringify(X[i]) && !r.u.length && (!more[i] || more[i](r));
      else if (i === 10) ok = v === 'OK' || v === 'UNCHECKED';                                   // NOT-FLAG
      else if (i === 40) ok = v === 'OK' || v === 'UNCHECKED';                                   // NOT-FLAG, never silent
      else if (i === 49) ok = v === 'OK' || v === 'UNCHECKED';                                   // OK or UNCHECKED, never FLAG
      else if ([50, 51, 52].includes(i)) ok = v === 'UNCHECKED';
      info.bank[i] = !!ok; chk(ok, 'bank#' + (i + 1) + ' [' + E[i].kind + '] «' + tx(i).slice(0, 90) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + v + ' ' + J(r));
    }
    info.nc[44] = 'C59 replaces «the coach\'s matter»: the reader gives ✓ and the coach alone gets one unit line (asserted)';
    if (!process.env.ONLY) { const missing = R1.filter(i => info.bank[i] === undefined); chk(!missing.length, 'bank: every R1 entry is tested :: ' + JSON.stringify(missing.map(i => i + 1))); }
  });

  const nb = Object.keys(info.bank).length, nbOk = Object.values(info.bank).filter(Boolean).length;
  console.log('bank R1: ' + nbOk + '/' + nb + ' pass; nc: ' + Object.keys(info.nc).length + (Object.keys(info.nc).length ? ' ' + JSON.stringify(info.nc) : ''));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
