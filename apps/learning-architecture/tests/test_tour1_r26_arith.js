// تورِ پولیا (دستهٔ ۱، دورِ ۲۶، سهمِ «arith» — ۲۰۲۶-۱۱-۱۲) — DECISIONS_R26 Q1 «خوانندهٔ حساب» (دو خانوادهٔ S1) + روشن‌سازی‌های C15–C18 + اعتراض به «✗» ِ صفحه (پرسشِ ۳۶ ِ مالک).
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۶ (پرامپت‌ها: T/round26X/<sid>/ai/pN.json):
//           S1-a  A26-1 (s01 p15، s04 p14، s09 p4)، B_x D19 = U2 (pwB2 p9)، D26-16 (arD1 p6)، C26-9 (pwC1 p3)، C26-10 (pwC1 p15، aC3 p5)، C26-26 (aC2 p4)، C26-31 (pC1 p1)، A26-26 (aA2 p4)، D26-52 (aD3 p7)
//           S1-b  B26·D20 = U1 (pwB1 p11)، D26-18 (arD1 p7)
//           S2/S3 B26·D8 = B_x D8 (s18 π)، B_x D6 = U27 (s17 p8)، B_x D15 = U28 (pwB1 p13)، D26-24 (oD1 p9، s36 p3، aD1 p5، aD3 p9)، C26-11 (pwC1 p16)، A26-20 (aA4 «ذرع»)
//           block B26·D10/D35 = U26 (bp2 p9، aB4 p3)، A26-45 (oA1 p18)
//           contest A26-2، A26-3 (s01 p15–p17) = بانک #25، #41، #42
//  bank     همهٔ ۴۲ ورودیِ Q1.arith_reader در بانکِ مستقلِ tests/variants/VARIANTS_R26.json
//  neither  کنارِ هر اصلاحِ مثبت، شبیهِ منفی‌اش در همان بخش (واژهٔ مقیاس لغزشِ واقعی را نمی‌پوشاند؛ «≈» اتحادِ نادرست را ✓ نمی‌کند؛ …)
//  clock    روزِ صفحه منجمد است (APP.today)؛ هیچ انتظاری به تاریخِ تقویم بسته نیست
// LLA_FILE = ساختِ دیگر (برای «قرمزِ نخست»: ساختِ BASE26)؛ ONLY=engine,block,contest,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = JSON.parse(fs.readFileSync(process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R26.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R26.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)), 'utf8'));

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
  const T0 = '2026-11-12';   // روزِ منجمدِ صفحه (هیچ انتظاری به آن بسته نیست)
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
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
    // سه حالتِ هر سنجش + «نسنجیده» (ck.unread) — روی ساختِ BASE26 «ask» و «unread» وجود ندارد (قرمزِ نخست)
    window.__ac = (t, ctx) => { const ck = APP.STORY.arithChk(t, ctx || undefined);
      return { c: ck.map(c => ({ expr: c.expr, said: String(c.saidT || c.said), st: c.ask ? 'ask' : c.ok ? 'ok' : 'flag', unit: c.unit || '', kind: c.kind || '', valT: c.valT || '', unitUnread: !!c.unitUnread })), u: (ck.unread || []).map(u => u.text),
        lines: APP.STORY.arithLines(ck), note: APP.STORY.arithNote(ck, 'ok') }; };
  }, T0);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const turn = (text, reply, actions) => p.evaluate(([t, r, a]) => __turn(t, r, a), [text, reply || '', actions || []]);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const nat = { role: 'self', nat: 'practical', stuck: false, fail: false };
  const csn = (o) => Object.assign({ do: 'coach_state' }, nat, o);
  const PR = (pid) => p.evaluate((pid) => { const s = __cur(); const pr = APP.STORY.priorFor(pid ? null : s, pid || ''); return pr ? JSON.parse(JSON.stringify(pr)) : null; }, pid || '');
  const ppr = (text, prior, o) => turn(text, (o && o.reply) || 'کارتان را دیدم.', [csn(Object.assign({ ph: 'e', said: [], prior }, (o && o.cs) || {}))]);
  const AC = (t, ctx) => p.evaluate(([t, ctx]) => __ac(t, ctx), [t, ctx || '']);
  const blockOf = (u, name) => { const H = head(u), i = H.indexOf(name || '# حسابِ صفحه روی همین پیام'); return i < 0 ? '' : H.slice(i).split('\n#')[0]; };
  // حکمِ صفحه برای یک نوشته: OK = همه ✓؛ FLAG = دست‌کم یک ✗؛ ASK = نه ✓ نه ✗ (C16/C15)؛ UNCHECKED = فقط «نسنجیده»؛ SILENT = هیچ سطری
  const verdict = (r) => r.c.some(c => c.st === 'flag') ? 'FLAG' : r.c.some(c => c.st === 'ask') ? 'ASK' : r.c.length ? (r.u.length ? 'OK+UNCHECKED' : 'OK') : r.u.length ? 'UNCHECKED' : 'SILENT';
  const J = (r) => JSON.stringify(r.c.map(c => [c.expr, c.said, c.st, c.valT, c.unit])) + ' unread=' + JSON.stringify(r.u);
  const want = async (t, exp, tag, more) => { const r = await AC(t), v = verdict(r), ok = (Array.isArray(exp) ? exp : [exp]).includes(v) && (!more || more(r)); chk(ok, tag + ' [' + exp + '] «' + t + '» ⇒ ' + v + ' :: ' + J(r)); return r; };

  // ================= engine — خوانندهٔ حساب روی جمله‌های خودِ گزارش‌ها + شبیهِ منفیِ هر کدام =================
  await section('engine', async () => {
    // ---- S1-a (C15): واژهٔ مقیاس/واحد کنارِ نتیجه عاملِ نتیجه نیست ----
    await want('۱۸ × ۱٫۲۲ = ۲۱٫۹۶ میلیون', 'OK', 'A26-1 s01 p15');
    await want('۱۱ / ۵ = ۲٫۲ میلیارد', 'OK', 'A26-1 s04 p14');
    await want('هزینهٔ هر کیک رو حساب کردم: ۳۰۰ هزار تومن. تعداد فروش هم ثابته، ماهی ۴۰ تا. پس قیمت = ۳۰۰ + ۲۰ میلیون تقسیم بر ۴۰ = ۸۰۰ هزار. درسته؟', 'OK', 'A26-1 s09 p4 (۳۰۰ هزار + ۲۰ میلیون ÷ ۴۰)');
    await want('۳۵ × ۱٫۴ = ۴۹ میلیون', 'OK', 'B_x D19 (U2) pwB2 p9');
    await want('۲۵ − ۱۸ = ۷ میلیون', 'OK', 'B_x D19 (U2) pwB2 p9');
    let r = await want('تا حالا ۱۲۰ هزار تومن دادم، با ۸۵ میشه ۲۰۵، با ۴۰ میشه ۲۴۵ هزار تومن', 'OK', 'D26-16 arD1 p6 (جمعِ روان با واژهٔ مقیاس)', r => r.c.length === 2);
    await want('۱۲ × ۴٫۵ = ۵۴ میلیون', 'OK', 'C26-10 pwC1 p15');
    await want('۱۸۰ − ۶۰ − ۲۲٫۵ = حدود ۹۷٫۵ میلیون', 'OK', 'C26-10 aC3 p5');
    await want('ساعتِ آفتابِ کامل تو رفسنجان تابستون حدودِ ۶ ساعته، ولی من ۸ ساعت پمپاژ می‌خواستم. انرژیِ روزانه = ۲۴۷۰ × ۸ ≈ ۱۹٫۸ کیلووات‌ساعت.', 'OK', 'C26-9 pwC1 p3 (پیشوندِ واحدِ نتیجه)');
    // شبیهِ منفی: عدد واقعاً غلط است — واژه آن را نمی‌پوشاند؛ مقدارِ صفحه به شکلِ خودش
    r = await want('۱۸ × ۱٫۲۲ = ۲۲٫۹۶ میلیون', 'FLAG', 'neg: scale word does not shield a slip', r => /۲۱٫۹۶ میلیون/.test(r.c[0].valT));
    await want('۲۵ − ۱۸ = ۸ میلیون', 'FLAG', 'neg: scale word, wrong difference');
    await want('تا حالا ۱۲۰ هزار تومن دادم، با ۸۵ میشه ۲۰۵، با ۴۰ میشه ۲۵۵ هزار تومن', 'FLAG', 'neg: running sum with scale words, last link wrong', r => r.c[0].st === 'ok' && r.c[1].st === 'flag' && /۲۴۵ هزار/.test(r.c[1].valT));
    r = await want('انرژیِ روزانه = ۲۴۷۰ × ۸ ≈ ۱۸٫۸ کیلووات‌ساعت', 'FLAG', 'neg: unit prefix does not shield a slip', r => /۱۹٫۷۶ کیلووات/.test(r.c[0].valT));
    await want('۳۵ × ۱٫۴ = ۴۸ کیلوگرم', 'FLAG', 'neg: unit word, wrong product');
    // مقیاسی که خوانده نمی‌شود: نه ✓ نه ✗ (C15 «هرگز ✗ به‌خاطرِ واژه»)
    // DECISIONS_R26 C23 (پس از بانک) جای این انتظار را گرفت: وقتی عملوند هم واژهٔ مقیاس دارد، مقیاس جزوِ حساب است ⇒ ✗ (پیش‌تر ASK). پرسشِ مقیاس فقط برای واژهٔ تنها کنارِ نتیجه است:
    await want('۲۵۰ میلیون × ۲۳٪ = ۵۷٫۵ هزار', 'FLAG', 'C23: the operand carries a scale word too ⇒ the scale is arithmetic, ✗');
    await want('۲۵۰ × ۲۳٪ = ۵۷٫۵ هزار', 'OK', 'C15: a scale word only beside the result is its unit ⇒ ✓');
    await want('۲۵۰ میلیون × ۲۳٪ = ۵۷۵۰۰', 'ASK', 'C15/C23: a scale word only among the operands and only the power differs ⇒ asked, never ✗', r => r.c[0].kind === 'scale');
    await want('۲۵۰ میلیون ضربدر ۲۳ درصد میشه ۵۷.۵ میلیون در سال، تقسیم بر ۱۲ میشه حدود ۴.۸', 'OK', 'B26·D35 aB3 p7 («میشه» + scale carried to the next link)', r => r.c.length === 2);
    await want('۱۲۰۰ هزار ÷ ۴ = ۳۰۰', 'OK', 'C15: a bare result takes the scale of the operands');
    await want('۱۲۰۰ هزار ÷ ۴ = ۴۰۰', 'FLAG', 'neg: … and a wrong one is still ✗');
    await want('۲ هزار و ۵۰۰ + ۵۰۰ = ۳ هزار', 'OK', '«۲ هزار و ۵۰۰» is one number (was read as «۵۰۰ + ۵۰۰» ⇒ a false ✗ on BASE26 too)');
    await want('۲ هزار و ۵۰۰ + ۵۰۰ = ۴ هزار', 'FLAG', 'neg: compound number, wrong sum');
    await want('۳ نفر بودیم، با ۲ ماشین میشه ۶ ساعت', ['UNCHECKED', 'SILENT'], 'neg: «با» between different things is no running sum — neither ✓ (3×2) nor ✗');
    await want('خودم نشستم حساب کردم: ۳ × ۴۵ = ۱۳۵ و با ۲۰ تا میشه ۱۵۵', 'OK', 'a connective between the numbers is not a unit (bank R26 #117 leans on this)', r => r.c.length === 2);
    await want('خودم نشستم حساب کردم: ۳ × ۴۵ = ۱۳۵ و با ۲۰ تا میشه ۱۶۵', 'FLAG', 'neg: … and the wrong running sum is ✗');
    await want('۱۵ درصدِ ۸۰ میشه ۱۲', 'OK', '«N درصدِ M»');
    await want('۱۵ درصدِ ۸۰ میشه ۱۸', 'FLAG', 'neg: «N درصدِ M» wrong');
    // ---- C18: عددِ شرط مقدارِ ادعاشده نیست ----
    await want('با n = 4 میشه 1+3+5+7 = 16 = 4²', 'OK', 'C26-26 aC2 p4', r => r.c.every(c => c.said !== '4'));
    await want('x=4 و y=1 میشه 16−1=15', 'OK', 'C26-31 pC1 p1');
    await want('با n = 4 میشه 1+3+5+7 = 15', 'FLAG', 'neg C18: the value after the last «=» is wrong', r => r.c.some(c => c.st === 'flag' && c.said === '15'));
    r = await want('آهااان! ۱×۲ می‌شه ۲×۳ بعد ۳×۴', ['UNCHECKED', 'SILENT'], 'A26-26 aA2 p4 («می‌شه» میانِ دو عبارت = می‌شود، نه تساوی)');
    await want('۲×۶ میشه ۲۴', 'FLAG', 'neg C18: «میشه» + a number IS a claim (2×6 = 12)');
    // ---- S1-b (C16): رواداریِ گرد کردن اتحادِ دقیقِ نادرست را ✓ نمی‌کند ----
    r = await want('۱ = ۱/۲ + ۱/۳ + ۱/۴', 'FLAG', 'B26·D20 (U1) pwB1 p11', r => /۱۳\/۱۲/.test(r.c[0].valT));
    await want('سهم‌ها: ۱/۲ + ۱/۳ + ۱/۴ = ۱.', 'FLAG', 'D26-18 arD1 p7');
    await want('۱/۲ + ۱/۳ + ۱/۶ = ۱', 'OK', 'neg C16: a TRUE exact identity stays ✓');
    await want('۱/۲ + ۱/۳ + ۱/۴ ≈ ۱٫۰۸', 'OK', 'neg C16: decimal digits + «≈» ⇒ C9 applies');
    await want('۱۰۰ ÷ ۷ = ۱۴', 'ASK', 'C16: integer for a non-integer quotient ⇒ asked', r => /۱۴٫۲۹/.test(r.c[0].valT) && r.note.bad === false && !/درست/.test(r.note.chk));
    await want('۱۰۰ ÷ ۷ ≈ ۱۴', 'OK', 'neg C16: with «≈» no ask');
    await want('۹۶ ÷ ۸ = ۱۲', 'OK', 'neg C16: an exact integer quotient');
    // ---- D26-18 بقیهٔ همان پیام: هر دو نیمهٔ «خرده‌ای، یعنی …»، جمعِ روان با واژه میانِ عددها، تبدیل با «هم میشه» ----
    const D18 = 'برای بخاریِ دومم (۱٫۵ کیلووات، روزی ۸ ساعت) هم حساب کردم: ۱٫۵ × ۸ × ۳۰ = ۱۲ × ۳۰ = ۳۵۰ کیلووات‌ساعت. از قبضِ ۵۰۰ تایی ۵۰۰ − ۳۵۰ = ۱۶۰ می‌مونه. ۳۵۰ تقسیم بر ۱۶۰ میشه ۲ و خرده‌ای، یعنی ۲٫۷۵. سهم‌ها: ۱/۲ + ۱/۳ + ۱/۴ = ۱. پول: ۱۲۰ دادم، با ۸۵ میشه ۲۱۵. ۳۶۰ کیلووات‌ساعت هم میشه ۱۲۹٫۶ مگاژول، و ۳۶۰ تقسیم بر ۷ میشه ۵۱٫۸.';
    r = await AC(D18); const st = (re) => (r.c.filter(c => re.test(c.expr + ' = ' + c.said))[0] || {}).st;
    chk(st(/350 \/ 160 = 2\.75/) === 'flag' && st(/1\/2 \+ 1\/3 \+ 1\/4/) === 'flag' && st(/120 با 85/) === 'flag' && st(/360 کیلووات/) === 'flag' && st(/360 \/ 7/) === 'flag' && st(/1\.5 × 8 × 30/) === 'ok',
      'D26-18 arD1 p7: «یعنی ۲٫۷۵»، «= ۱»، «با ۸۵ میشه ۲۱۵» و «۱۲۹٫۶ مگاژول» هر چهار ✗؛ حلقهٔ درست ✓ :: ' + J(r));
    chk(!r.c.some(c => /^[-−]?[۰-۹]+\/[۰-۹]+$/.test(c.valT) && /\./.test(c.said)) && /≈ ۵۱٫۴۳/.test((r.c.filter(c => /360 \/ 7/.test(c.expr))[0] || {}).valT || ''), 'D26-18: no raw fraction as the page value of a decimal claim («۳۶۰/۷») :: ' + J(r));
    await want('پول: ۱۲۰ دادم، با ۸۵ میشه ۲۰۵', 'OK', 'neg: the right running sum with a word between');
    await want('قیمتش ۲۰۰ تومن بود، با ۱۰ درصد تخفیف میشه ۱۸۰', ['UNCHECKED', 'SILENT'], 'neg: «با ۱۰ درصد …» is not a running sum — never ✗');
    // ---- D26-52: «≈» و شکلِ مقدارِ صفحه ----
    await want('۱.۰۱۵/۱.۰۲۲ − ۱ ≈ −۰.۶۹٪', 'OK', 'D26-52 aD3 p7');
    r = await want('۱.۰۱۵/۱.۰۲۲ − ۱ ≈ −۰.۷۹٪', 'FLAG', 'neg D26-52: a wrong percent', r => /٪/.test(r.c[0].valT) && !/\//.test(r.c[0].valT));
    await want('0.92^5 ≈ 0.67', 'FLAG', 'D26-24 aD3 p9 (0.659 is not 0.67 even with «≈») — read, not silent', r => /۰٫۶۵۹/.test(r.c[0].valT));
    await want('0.92^5 ≈ 0.66', 'OK', 'neg: the right rounding of the power');
    // ---- C17: سطرِ عملگردار که خوانده نمی‌شود «نسنجیده» است؛ آنچه حالا خوانده می‌شود با حکمِ درست ----
    r = await want('dy/dt = −6·9/(144π) = −54/(144π) ≈ −0.37', 'FLAG', 'B26·D8 / B_x D8 s18 (π ثابت است)', r => r.c.length === 2 && r.c[0].st === 'ok' && /۰٫۱۱۹/.test(r.c[1].valT));
    await want('dy/dt = −5·9/(144π) = −45/(144π) ≈ −0.1', 'OK', 'B_x D8 s18 c6 (the correct π line)');
    r = await want('V = 180 × 0.12 = 21.6 مترمکعب، با ۲ مترمکعبِ آبِ چاه میشه ۲۴٫۶', 'FLAG', 'B_x D6 (U27) s17 p8 (جمعِ روان با واحد)', r => r.c[0].st === 'ok' && /۲۳٫۶/.test(r.c[1].valT));
    await want('V = 180 × 0.12 = 21.6 مترمکعب، با ۲ مترمکعبِ آبِ چاه میشه ۲۳٫۶', 'OK', 'neg: the right running sum with a unit');
    await want('۰٫۲۵ تقسیم بر ۰٫۰۵ میشه ۵ برابر', 'OK', 'D26-24 oD1 p9');
    await want('۰٫۲۵ تقسیم بر ۰٫۰۵ میشه ۶ برابر', 'FLAG', 'neg: «برابر» does not shield a wrong quotient');
    // DECISIONS_R27 C44 جای این انتظار را گرفت (D27-23): درصدِ صحیح بی واژهٔ تقریب که گردشدهٔ مقدارِ دقیق است «؟» ِ C25 را دارد (پیش‌تر OK)
    await want('۴ از ۲۶ میشه ۱۵٪', 'ASK', 'D26-24 s36 p3 (C44)');
    await want('۴ از ۲۶ میشه ۲۵٪', 'FLAG', 'neg: «A از B میشه N٪» wrong', r => /٪/.test(r.c[0].valT));
    await want('۱۶ و ۱۲ میشه ۲۸', 'OK', 'D26-24 aD1 p5');
    // DECISIONS_R26 C28 جای این انتظار را گرفت: «و … میشه N» عملگرِ جمع است (پیش‌تر UNCHECKED)
    await want('۱۶ و ۱۲ میشه ۱۴', 'FLAG', 'C28: «و … میشه» is a sum ⇒ a wrong sum is ✗');
    // DECISIONS_R27 C42 جای این انتظار را گرفت: جمعِ سه‌نقطه‌ایِ دنبالهٔ حسابی دقیق حساب می‌شود (پیش‌تر UNCHECKED)؛ سه‌نقطهٔ دیگر همچنان «نسنجیده»
    await want('۱ + ۲ + … + ۲۰ = ۲۱۰', 'OK', 'C42: arithmetic-progression ellipsis sum');
    await want('۲ + ۴ + … + ۱۹ = ۹۰', 'UNCHECKED', 'C17/C42: an ellipsis that is not an arithmetic progression stays unread');
    await want('۱۰۰ − ۲۰٪ = ۸۰', 'UNCHECKED', 'C17: «درصدِ چه؟» is told as unread, not left silent');
    await want('۱/۲ + ۱/۳ = ۲/۵', 'UNCHECKED', 'C17: two readings ⇒ unread, not silent');
    // بیرون از خواننده، مثلِ پیش (C17: فقط سطرِ عملگردار؛ جبر داوریِ مربی است)
    // DECISIONS_R27 C41 (D26-24 aD4، «سه تا A»): «سه تا ۸۰ میشه درست ۲۴۰» دیگر بیرون از خواننده نیست — ضرب است و ✓ (پایین‌تر در test_tour1_r27_arith)
    await want('سه تا ۸۰ میشه درست ۲۴۰', 'OK', 'C41: «سه تا A» is a product');
    for (const t of ['از ۵۲۰ رفت ۶۵۰، یعنی ۲۵٪', 'x² + 3 = 12', 'پس ۲۰ = ۴x و x = ۵', 'قیمتِ ماشین = ۴۵۰ میلیون', 'n = 12', 'از ۸:۴۵ با ۴۰ دقیقه راه میشه ۹:۲۵', 'نمره‌م از ۲۰ شد ۱۷'])
      await want(t, 'SILENT', 'outside the reader as before');
    info.nc['D26-24 aD4'] = '«سه تا ۸۰ با دو تا برش میشه ۲۴۰ و ۶ دهم»، «می‌مونه حدود ۷۹ و ۷ دهم» (aD4 p2–p5) عملگر ندارند و مفروق در پیام نیست — به حکمِ C17 بیرون از خواننده می‌مانند (asserted: silent)';
    // ---- B_x D15 (U28): لغزشِ تقسیم برچسبِ «واحد» نمی‌گیرد؛ خطای واقعیِ تبدیل می‌گیرد ----
    r = await want('انرژی ۳۵۳۱۶۰ ژول و توان ۴۸ وات، پس زمان = ۳۵۳۱۶۰ / ۴۸ = ۷۲۵۷ ثانیه', 'FLAG', 'B_x D15 pwB1 p13', r => !r.c[0].unit && r.c[0].kind !== 'dim' && /۷۳۵۷٫۵/.test(r.c[0].valT) && !/واحد/.test(r.lines[0]));
    r = await want('۴۵۰ دقیقه = ۴٫۵ ساعت', 'FLAG', 'neg D15: a real conversion error keeps the unit label', r => /تبدیل/.test(r.c[0].unit));
    r = await want('سقف ۶۰ مترمربع، بارش ۳۲۰ میلی‌متر، پس ۶۰ × ۳۲۰ = ۱۹۲۰۰ مترمکعب', 'FLAG', 'neg D15: numbers right, conversion missed ⇒ unit slip (R25 bank #81)', r => r.c[0].kind === 'dim');
    // ---- A26-20 / C10: واحدِ ناخوانا هرگز بی‌صدا و هرگز ✗ ----
    await want('طولِ پارچه ۱۲ ذرع × ۱٫۰۴ = ۱۲٫۴۸ متر', 'OK', 'A26-20 («ذرع»): numbers read, unit told as unread', r => r.c[0].unitUnread && /واحدش نسنجیده/.test(r.lines[0]));
    await want('طولِ پارچه ۱۲ ذرع × ۱٫۰۴ = ۱۳٫۴۸ متر', 'UNCHECKED', 'neg: unknown unit beside disagreeing numbers ⇒ «نسنجیده», never ✗');
    await want('انرژی ۲۵ کیلووات‌ساعت × ۳٫۶ = ۸۰ مگاژول', 'FLAG', 'neg: known unit words do not hide a wrong number');
    // ---- C26-11 pwC1 p16: «توان» (وات) نامِ تابع خوانده می‌شد و سطر بی‌صدا می‌ماند ----
    await want('اگه راندمان ۵۰٪ بشه توان ۱۷۰۰ / ۰٫۵ = ۳۰۹۱', 'FLAG', 'C26-11 pwC1 p16 (the wrong division in its own sentence)', r => /۳۴۰۰/.test(r.c[0].valT));
    await want('اگه راندمان ۵۰٪ بشه توان ۱۷۰۰ / ۰٫۵ = ۳۴۰۰', 'OK', 'neg C26-11: the right division');
    await want('۲ به توان ۳ = ۹', ['UNCHECKED', 'SILENT'], 'neg C26-11: «به توانِ» is still a function word — not read as «۳ = ۹»');
    // ---- جمله‌های واقعیِ دیگرِ همان اجراها که با خوانندهٔ تازه سنجیده شدند (پویشِ همهٔ ۹۷۲ پیامِ دورِ ۲۶) ----
    await want('سودم (۹۰۰ − ۳۸۰) × ۳۲ = ۱۶ میلیون و ۶۴۰ میشه. هنوز به ۲۰ نمی‌رسه.', 'OK', 's09 p15: «۱۶ میلیون و ۶۴۰» (= ۱۶٬۶۴۰ هزار) is one compound number');
    await want('سودم (۹۰۰ − ۳۸۰) × ۳۲ = ۱۷ میلیون و ۶۴۰ میشه', 'FLAG', 'neg s09 p15: compound number, wrong product');
    await want('حدس زدم ۵ لیتر: ۲+۱.۲۵=۳.۲۵ از ۲۵ میشه ۱۳٪. کمه.', 'OK', 's36 p2: the number before «از» is the result of the previous «=»', r => r.c.length === 2);
    await want('۸ لیتر رو هم امتحان کردم: ۲+۲=۴ از ۲۶ میشه ۲۵٪.', 'FLAG', 'neg s36 p3: wrong percent after a right sum', r => r.c[0].st === 'ok' && r.c[1].st === 'flag');
    await want('با ۳۰ لیتر حساب کردم: ۰٫۱×۳۰ + ۰٫۲۵ح = ۰٫۱۵(۳۰+ح) ⇒ ۳ + ۰٫۲۵ح = ۴٫۵ + ۰٫۱۵ح ⇒ ۰٫۱ح = ۱٫۵ ⇒ ح = ۱۵ لیتر.', 'SILENT', 's36 p9: algebra with a Persian-letter unknown is outside the reader (no ✗ on «۳ + ۰٫۲۵ = ۴٫۵ + ۰٫۱۵»)');
    await want('۶ و ۶ و ۶ میشه ۱۸', 'OK', 'aA1 p8: «و … و … میشه»');
    await want('۱۲ تقسیم بر ۴ میشه ۳ تا ۴ تا، هیچی نمی‌مونه، پس ۳ روز.', 'OK', 'pwA2 p5: «۳ تا ۴ تا» is not the range «۳ تا ۴»');
    await want('۰٫۳ تقسیم بر ۰٫۰۵ میشه ۶ برابرِ نویز.', 'OK', 'oD1 p4: «۶ برابرِ نویز» is a ratio');
    await want('جمع ۴۳٫۷۵، وسط ۲۶٫۲۵. تقسیم بر ۷۰ میشه ۰٫۳۷۵ که همون ۳/۸ ـه!', 'OK', 'dp1 p8: a running division after a sentence end');
    await want('۱ = ۱/۲ + ۱/۳ + ۱/۶ (پمپ، لوله، برق)', 'OK', 'pwB2 p9 (B_x D19 note): a remark in parentheses after the sum');
    await want('قرارداد از ۱۴۰۵/۱/۱۵ شروع میشه و نمره‌ی ریاضیِ دخترم امسال ۱۸ شد', 'SILENT', 'pwB2 p9: a date is not arithmetic');
    r = await want('۱۷۰۰ ثانیه یعنی ۱۷ دقیقه', 'FLAG', 'pwD1 p1: conversion value in her form', r => !/\//.test(r.c[0].valT) && /۲۸٫۳ دقیقه/.test(r.c[0].valT));
    // ---- قراردادِ دیگران: سه حالت، ck.unread، و یادداشتِ کنارِ گام ----
    r = await AC('۱۰۰ ÷ ۷ = ۱۴'); chk(r.note.bad === false && r.note.ask === true && /گرد شده؟/.test(r.note.chk) && !/درست/.test(r.note.chk), 'arithNote: an asked check is neither «درست» nor bad :: ' + JSON.stringify(r.note));
    // DECISIONS_R27 C42: «۱ + … + ۲۰» حالا خوانده می‌شود؛ قراردادِ «نسنجیده» با سه‌نقطه‌ای که دنبالهٔ حسابی نیست آزموده می‌شود
    r = await AC('۲ + ۴ + … + ۱۹ = ۹۰'); chk(r.note.bad === false && r.note.unread === true && /نسنجیده/.test(r.note.chk) && !/درست/.test(r.note.chk), 'arithNote: an unread operator line says «نسنجیده» :: ' + JSON.stringify(r.note));
    const sd = await p.evaluate(() => [APP.STORY.arithSaid(APP.STORY.arithChk('۱۸ × ۱٫۲۲ = ۲۱٫۹۶ میلیون')), APP.STORY.arithSaid(APP.STORY.arithChk('۱۷ × ۱۲ = ۲۱۴ میلیون'))]);
    chk(JSON.stringify(sd) === JSON.stringify([['21.96'], ['214']]), 'arithSaid keeps its contract (the written number, digits only) :: ' + JSON.stringify(sd));
  });

  // ================= block — «# حسابِ صفحه» در پرامپت =================
  await section('block', async () => {
    // B26·D10/D35 (U26)، A26-45: گفت‌وگوی بسته به مسئلهٔ زندهٔ بی‌دفتر
    await wipe(); await fresh();
    const pid = await p.evaluate(() => { const id = __live('برنامهٔ لیگ', 'چند بازی در لیگِ ۱۴ تیمی لازم است؟'); const s = __cur(); s.lprob = id; APP.S.put(s); return id; });
    const bound = await p.evaluate(() => { const b = APP.ASSIST.boundLive(__cur()); return !!b && !b.done; });
    chk(bound, 'setup: the chat is bound to a live problem with no ledger');
    let u = await turn('تعدادِ بازی‌ها ۱۴ × ۱۳ ÷ ۲ = ۹۱', 'باشه.', [csn({ ph: 'c', said: [] })]), B = blockOf(u.user);
    chk(/✓ «۱۴ × ۱۳ \/ ۲ = ۹۱» می‌خواند/.test(B) && !/✗/.test(B) && !/لو نده/.test(B), 'B26·D10 / A26-45 (bank #20): the block is in the prompt of a live problem with no ledger :: ' + B.slice(0, 300));
    info.bank[19] = /✓ «۱۴ × ۱۳ \/ ۲ = ۹۱» می‌خواند/.test(B);
    u = await turn('امتیازها ۳۰×۳ + ۱۲×۵ = ۹۰ + ۶۰ = ۱۵۰', 'باشه.', [csn({ ph: 'c', said: [] })]); B = blockOf(u.user);
    chk(/✓ «۳۰×۳ \+ ۱۲×۵ = ۹۰ \+ ۶۰» می‌خواند/.test(B) && /✓ «۹۰ \+ ۶۰ = ۱۵۰» می‌خواند/.test(B), 'B26·D35 aB4 p3 (bank #20): every link of the chain :: ' + B.slice(0, 400));
    info.bank[19] = info.bank[19] && /✓ «۹۰ \+ ۶۰ = ۱۵۰» می‌خواند/.test(B);
    // C17/C16 در پرامپت: «نسنجیده» و «؟» سطر دارند؛ مربی آن‌ها را درست/غلط اعلام نکند
    // DECISIONS_R27 C42: سطرِ «نسنجیده» با سه‌نقطه‌ای که دنبالهٔ حسابی نیست (۱ + … + ۲۰ حالا ✓ است)
    u = await turn('پس ۲ + ۴ + … + ۱۹ = ۹۰ و هر جعبه ۱۰۰ ÷ ۷ = ۱۴ تا', 'باشه.', [csn({ ph: 'c', said: [] })]); B = blockOf(u.user);
    chk(/— حسابِ «پس ۲ \+ ۴ \+ … \+ ۱۹ = ۹۰» را صفحه نسنجیده/.test(B) && /؟ «۱۰۰ \/ ۷» ≈ ۱۴٫۲۹ می‌شود/.test(B) && /نه درست‌اند نه نادرست/.test(B) && !/✓ «۱۰۰/.test(B), 'C17 + C16 reach the coach as their own lines :: ' + B.slice(0, 600));
    // B26·D35 aB4 p3: مسئلهٔ گفت‌وگویی (ثبت‌نشده) که صورتش پیش از این پیام آمده — زنجیرهٔ درستِ او هم بلوک می‌گیرد
    await wipe(); await fresh();
    await turn('نوه‌م یه معما ازم پرسید که بلد نبودم: تو یه مزرعه مرغ و خرگوش هست، روی هم ۳۵ تا سر و ۹۴ تا پا. چند تا مرغ و چند تا خرگوش داریم؟', 'چه چیزی مجهول است؟', [csn({ ph: 'u', said: ['u', 'd'], nat: 'objective' })]);
    const st0 = await p.evaluate(() => { const C = __cur().coach || {}; return [!!C.stmt, !!APP.ASSIST.boundLive(__cur())]; });
    chk(st0[0] && !st0[1], 'setup: a chat problem (statement recorded, no live record) :: ' + JSON.stringify(st0));
    u = await turn('یه حدس بزنم: تقریباً نصف نصف، مثلاً ۲۰ مرغ و ۱۵ خرگوش. پاها میشه ۲۰×۲ + ۱۵×۴ = ۴۰ + ۶۰ = ۱۰۰. زیاد شد، ما ۹۴ می‌خوایم.', 'باشه.', [csn({ ph: 'p', said: [], nat: 'objective' })]); B = blockOf(u.user);
    chk(/✓ «۲۰×۲ \+ ۱۵×۴ = ۴۰ \+ ۶۰» می‌خواند/.test(B) && /✓ «۴۰ \+ ۶۰ = ۱۰۰» می‌خواند/.test(B) && !/✗ «/.test(B), 'B26·D35 aB4 p3: the correct chain of a chat problem reaches the coach :: ' + (B || head(u.user).slice(-300)).slice(0, 400));
    // بی مسئلهٔ زنده، بی دفتر، بی کارِ خودش: حسابِ درست بلوک نمی‌آورد (مثلِ دورِ ۲۵)؛ «✗»، «؟» و «نسنجیده» می‌آورند
    await wipe(); await fresh();
    u = await turn('راستی ۷ × ۸ = ۵۶ بود دیگه؟', 'بله.', [csn({ ph: 'u', said: [] })]);
    chk(!/# حسابِ صفحه روی همین پیام/.test(head(u.user)), 'neg: no block for a right sum in an unbound chat :: ' + head(u.user).slice(-200));
    u = await turn('۶ ÷ ۲(۱+۲) = ۹ درسته؟', 'بله.', [csn({ ph: 'u', said: [] })]); B = blockOf(u.user);
    chk(/را صفحه نسنجیده/.test(B) && !/✓|✗/.test(B.replace(/نه ✓ و نه ✗/g, '')), 'C17: an unread operator line reaches the coach even in an unbound chat :: ' + B.slice(0, 300));
    // S1-a از راهِ نوبتِ واقعی و دفترِ «کارِ پیشین»: گامِ درست ✓ می‌ماند، کارنامه شکست نمی‌نویسد (A26-1، A26-3؛ بانک #1)
    await wipe(); await fresh();
    const M1 = 'سلام، برای وامِ مغازه خودم حساب کردم. گام ۱: قسطِ سالانه ۱۸ × ۱٫۲۲ = ۲۱٫۹۶ میلیون. گام ۲: سهمِ ماهانه ۲۱٫۹۶ / ۶۰ = ۰٫۳۷. درست رفتم؟';
    u = await ppr(M1, [{ step: 'قسط', quote: 'قسطِ سالانه ۱۸ × ۱٫۲۲ = ۲۱٫۹۶ میلیون', verdict: 'ok' }, { step: 'سهم', quote: 'سهمِ ماهانه ۲۱٫۹۶ / ۶۰ = ۰٫۳۷', verdict: 'ok', dep: [1] }], { cs: { nat: 'practical' } });
    let pr = await PR(); B = blockOf(u.user);
    const ev = await p.evaluate(() => (__cur().coachEv || []).filter(e => e.src === 'prior').map(e => ({ ok: e.ok, prior: e.prior, wd: !!e.wd })));
    chk(pr && pr.steps.length === 2 && pr.steps[0].verdict === 'ok' && !pr.steps[0].pageBad && pr.steps[1].verdict === 'ok' && !/نمی‌خواند/.test(pr.steps[0].chk) && pr.resume === 0, 'A26-1 s01 p15 (bank #1): both steps ✓ in the ledger :: ' + JSON.stringify(pr && pr.steps.map(x => [x.n, x.verdict, x.chk])));
    chk(/✓ «۱۸ × ۱\.۲۲ = ۲۱\.۹۶ میلیون» می‌خواند/.test(B) && !/✗ «/.test(B) && !/لو نده/.test(B), 'A26-1: the coach is not told to make her look for a slip :: ' + B.slice(0, 300));
    chk(ev.some(e => e.ok && e.prior === 1) && !ev.some(e => !e.ok && !e.wd), 'A26-3: the mind card books no failure for the correct step :: ' + JSON.stringify(ev));
    info.bank[0] = !!(pr && pr.steps[0].verdict === 'ok') && !/✗ «/.test(B) && !ev.some(e => !e.ok && !e.wd);
    // S1-b از راهِ دفتر: حکمِ ✓ ِ مدل برای اتحادِ نادرست برمی‌گردد (B26·D20؛ بانک #11)
    await wipe(); await fresh();
    const M2 = 'سلام. کسرِ مصری کار می‌کنم و خودم نوشتم. گام ۱: 1 = 1/2 + 1/3 + 1/5. گام ۲: پس برای ۱ سه کسرِ واحد کافیه.';
    await ppr(M2, [{ step: 'تجزیه', quote: '1 = 1/2 + 1/3 + 1/5', verdict: 'ok' }, { step: 'نتیجه', quote: 'پس برای ۱ سه کسرِ واحد کافیه', verdict: 'ok', dep: [1] }], { cs: { nat: 'objective' } });
    pr = await PR();
    chk(pr && pr.steps[0].verdict === 'wrong' && pr.steps[0].pageBad && /نمی‌خواند/.test(pr.steps[0].chk) && !/۳۱\/۳۰/.test(pr.steps[0].chk) && pr.resume === 1, 'B26·D20 (bank #11): the model\'s ✓ on a false exact identity is overridden; her line does not give the value :: ' + JSON.stringify(pr && pr.steps.map(x => [x.n, x.verdict, x.chk])));
    info.bank[10] = !!(pr && pr.steps[0].verdict === 'wrong' && pr.steps[0].pageBad);
    const sysLen = await p.evaluate(() => (APP.ASSIST.SYS || '').length);
    chk(sysLen <= 20000, 'AS.SYS stays within the cap (nothing added to it) :: ' + sysLen);
  });

  // ================= contest — اعتراض به «✗» ِ صفحه (پرسشِ ۳۶ ِ مالک؛ A26-2، A26-3؛ بانک #25، #41، #42) =================
  await section('contest', async () => {
    const mindFail = () => p.evaluate(() => (__cur().coachEv || []).filter(e => e.src === 'prior' && !e.ok && !e.wd).map(e => e.prior));
    const sysOf = () => p.evaluate(() => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text));
    const logOf = (pid) => p.evaluate((pid) => { try { const L = APP.EVLOG.of(pid ? { pid } : { sess: __cur().id }); return (L || []).map(e => [e.title].concat(e.lines || []).join(' | ')); } catch (e) { return ['ERR ' + e.message]; } }, pid || '');
    // --- #25 / A26-2: «✗» ِ ذخیره‌شدهٔ خوانندهٔ دورِ ۲۵ روی حسابِ درست (s01 p15) — با خوانندهٔ پیشین ساخته می‌شود (همان خروجیِ BASE26)، سپس او اعتراض می‌کند
    await wipe(); await fresh();
    await p.evaluate(() => { window.__realChk = APP.STORY.arithChk;
      APP.STORY.arithChk = function (t, ctx) { const r = window.__realChk(t, ctx); if (/۲۴ × ۱٫۲۵|24 × 1\.25|24 \* 1\.25/.test(String(t))) { const o = [{ expr: '24 × 1.25', said: '30 میلیون', saidT: '30 میلیون', val: 30, valT: '۳۰', ok: false, kind: 'chain', pos: 0, pe: 10, sx: true }]; o.unread = []; return o; } return r; }; });
    const M = 'سلام، برای وامِ مغازه خودم حساب کردم. گام ۱: خریدِ جنس ۶ × ۳ = ۱۸ میلیون. گام ۲: سودِ سالانه ۲۴ × ۱٫۲۵ = ۳۰ میلیون. درست رفتم؟';
    await ppr(M, [{ step: 'خرید', quote: 'خریدِ جنس ۶ × ۳ = ۱۸ میلیون', verdict: 'ok' }, { step: 'سود', quote: 'سودِ سالانه ۲۴ × ۱٫۲۵ = ۳۰ میلیون', verdict: 'ok' }], { cs: { nat: 'practical' } });
    await p.evaluate(() => { APP.STORY.arithChk = window.__realChk; });
    let pr = await PR();
    chk(pr && pr.steps[1].verdict === 'wrong' && pr.steps[1].pageBad && (await mindFail()).includes(2), 'setup (#25): the stored ledger carries the old reader\'s false ✗ on step 2 and the mind card a failure :: ' + JSON.stringify(pr && pr.steps.map(x => [x.n, x.verdict, x.pageBad])));
    let u = await turn('نه، من درست حساب کردم؛ دوباره نگاه کن، ۲۴ ضرب در ۱٫۲۵ همون ۳۰ میشه', 'حق با شماست.', [csn({ ph: 'c', said: [] })]);
    let B = blockOf(u.user, '# بازسنجیِ حسابِ صفحه'); pr = await PR(); let sys = await sysOf(), log = await logOf(), H = head(u.user);
    chk(/بازسنجی شد ⇒ درست: گامِ ۲/.test(B) && /۲۴ × ۱\.۲۵ = ۳۰ میلیون/.test(B) && /حق با او بود/.test(B), '#25: the coach gets the re-check with both computations and the outcome :: ' + B.slice(0, 500));
    chk(pr && pr.steps[1].verdict === 'ok' && !pr.steps[1].pageBad && pr.steps[1].re && pr.steps[1].re.by === 'page' && pr.steps[1].re.was === 'wrong' && pr.steps[1].re.to === 'ok' && pr.resume === 0, '#25: the ledger step is ✓ with history (wrong ⇒ ok, by the page) :: ' + JSON.stringify(pr && pr.steps[1]));
    chk(!(await mindFail()).length && (await p.evaluate(() => (__cur().coachEv || []).some(e => e.src === 'prior' && e.prior === 2 && e.ok && !e.wd))), '#25 / A26-3: the mind card keeps no failure for that step and books it as hers');
    chk(sys.some(t => /بازسنجیِ حسابِ صفحه/.test(t) && /گامِ ۲/.test(t) && /بازسنجی شد ⇒ درست/.test(t)), '#25 / A26-2: the page is not silent — its own line to her :: ' + JSON.stringify(sys));
    chk(log.some(t => /بازسنجیِ حسابِ صفحه/.test(t) && /بازسنجی شد ⇒ درست/.test(t)), '#25: 📜 has the re-check event :: ' + JSON.stringify(log).slice(0, 400));
    const lines = await p.evaluate(() => APP.STORY.priorLines(APP.STORY.priorFor(__cur(), ''), false));
    chk(!lines.some(l => /گامِ ۲ · ✗/.test(l)) && lines.some(l => /گامِ ۲ · ✓ درست/.test(l) && /دوباره سنجیده شد \(حسابِ صفحه\): حکم عوض شد/.test(l)) && /همه درست/.test(lines[0]), '#25: 🧭/🔭 lines show step 2 ✓ with the re-check, no ✗ left :: ' + JSON.stringify(lines));
    chk(!/رد می‌کند|دوباره بسنج\*\*/.test(H.split('# بازسنجیِ حسابِ صفحه')[1] ? H.replace(B, '') : H), '#25: the chat does not go on disputing a step the page already cleared :: ' + H.slice(-600));
    info.bank[24] = !!(pr && pr.steps[1].verdict === 'ok') && /بازسنجی شد ⇒ درست/.test(B) && !(await mindFail()).length && sys.some(t => /بازسنجی شد ⇒ درست/.test(t));
    // --- #41: او اعتراض می‌کند و حق ندارد (۱۷ × ۱۲ = ۲۱۴) — حکم می‌ماند، با شاهد، یک بار
    await wipe(); await fresh();
    const M41 = 'خودم حساب کردم. گام ۱: درآمد منهای خرج ۴۵ − ۲۸ = ۱۷ میلیون. گام ۲: در سال ۱۷ × ۱۲ = ۲۱۴ میلیون. درسته؟';
    await ppr(M41, [{ step: 'ماهانه', quote: 'درآمد منهای خرج ۴۵ − ۲۸ = ۱۷ میلیون', verdict: 'ok' }, { step: 'سالانه', quote: 'در سال ۱۷ × ۱۲ = ۲۱۴ میلیون', verdict: 'ok', dep: [1] }], { cs: { nat: 'practical' } });
    pr = await PR(); chk(pr && pr.steps[0].verdict === 'ok' && pr.steps[1].verdict === 'wrong' && pr.steps[1].pageBad, 'setup (#41 / bank #5): 45 − 28 = 17 ✓, 17 × 12 = 214 ✗ :: ' + JSON.stringify(pr && pr.steps.map(x => [x.n, x.verdict, x.chk])));
    info.bank[4] = !!(pr && pr.steps[0].verdict === 'ok' && pr.steps[1].verdict === 'wrong' && !/۲۰۴/.test(pr.steps[1].chk));
    u = await turn('نه بابا درست حساب کردم، همون ۲۱۴ میشه', 'بیایید کنارِ هم ببینیم.', [csn({ ph: 'c', said: [] })]); B = blockOf(u.user, '# بازسنجیِ حسابِ صفحه'); pr = await PR(); sys = await sysOf();
    // DECISIONS_R26 C29 جای «عددِ صفحه شاهد است» را گرفت: حکم می‌ماند، «یک بار» دوباره سنجیده شد، تکهٔ ناخوانا نشان داده می‌شود و عددِ درست هرگز گفته نمی‌شود
    chk(/بازسنجی شد \(یک بار\) ⇒ حکم ماند: گامِ ۲/.test(B) && /۱۷ × ۱۲ = ۲۱۴ میلیون/.test(B) && /همین تکه/.test(B) && !/۲۰۴/.test(B) && /کوتاه بیا/.test(B), '#41 (C29): verdict stayed, re-checked once, the part pointed at, no right number, no caving :: ' + B.slice(0, 500));
    chk(pr && pr.steps[1].verdict === 'wrong' && pr.steps[1].pageBad && pr.steps[1].re && pr.steps[1].re.by === 'page' && pr.steps[1].re.to === 'wrong' && !!pr.steps[1].reAt && (await mindFail()).includes(2), '#41: nothing is cleared; the contest is recorded as re-checked :: ' + JSON.stringify(pr && pr.steps[1].re));
    chk(sys.some(t => /حکم ماند/.test(t) && /یک بار/.test(t) && /۱۷ × ۱۲/.test(t)) && !sys.some(t => /۲۰۴/.test(t)), '#41 (C29): she is told the verdict stayed after one re-check, with the part that does not read and without the right number :: ' + JSON.stringify(sys));
    const nSys = sys.length;
    u = await turn('نه بابا درست حساب کردم، همون ۲۱۴ میشه', 'همان شاهد.', [csn({ ph: 'c', said: [] })]); sys = await sysOf();
    chk(!/# بازسنجیِ حسابِ صفحه/.test(head(u.user)) && sys.filter(t => /بازسنجیِ حسابِ صفحه/.test(t)).length === 1, '#41: the same contest is not re-checked again in a loop :: ' + sys.length + '/' + nSys);
    info.bank[40] = /حکم ماند/.test(B) && !!(pr && pr.steps[1].verdict === 'wrong');
    // شبیهِ منفی: «حسابش رو درست کردم: …» اصلاحِ خودِ اوست (کارِ دفتر)، نه اعتراض — بازسنجی نمی‌شود
    await wipe(); await fresh();
    await ppr(M41, [{ step: 'ماهانه', quote: 'درآمد منهای خرج ۴۵ − ۲۸ = ۱۷ میلیون', verdict: 'ok' }, { step: 'سالانه', quote: 'در سال ۱۷ × ۱۲ = ۲۱۴ میلیون', verdict: 'ok', dep: [1] }], { cs: { nat: 'practical' } });
    u = await turn('حسابش رو درست کردم: ۱۷ × ۱۲ = ۲۰۴ میلیون', 'آفرین.', [csn({ ph: 'c', said: [] })]);
    chk(!/# بازسنجیِ حسابِ صفحه/.test(head(u.user)) && !(await sysOf()).some(t => /بازسنجیِ حسابِ صفحه/.test(t)), 'neg: her own fix of the step is not read as a contest of the ✗ :: ' + JSON.stringify(await sysOf()));
    // --- #42: «درست حساب کردم» بی هیچ «✗» ِ روی میز — هیچ بازسنجی
    await wipe(); await fresh();
    await ppr('خودم حساب کردم. گام ۱: ۴۵ − ۲۸ = ۱۷ میلیون. گام ۲: در سال ۱۷ × ۱۲ = ۲۰۴ میلیون.', [{ step: 'ماهانه', quote: '۴۵ − ۲۸ = ۱۷ میلیون', verdict: 'ok' }, { step: 'سالانه', quote: 'در سال ۱۷ × ۱۲ = ۲۰۴ میلیون', verdict: 'ok' }], { cs: { nat: 'practical' } });
    const before = JSON.stringify(await PR());
    u = await turn('نه، درست حساب کردم که گفتم دیرم میشه', 'باشه.', [csn({ ph: 'c', said: [] })]);
    chk(!/# بازسنجیِ حسابِ صفحه/.test(head(u.user)) && !(await sysOf()).some(t => /بازسنجی/.test(t)) && JSON.stringify((await PR()).steps.map(x => [x.verdict, x.re || null])) === JSON.stringify(JSON.parse(before).steps.map(x => [x.verdict, x.re || null])), '#42: no ✗ on the table ⇒ no re-check, nothing changed');
    info.bank[41] = !/# بازسنجیِ حسابِ صفحه/.test(head(u.user));
    // --- بی دفتر: «✗» ِ پیامِ پیشینِ گفت‌وگو هم بازسنجی‌پذیر است (pwB2 p9 → c19)
    await wipe(); await fresh();
    u = await turn('پس ۲۱ × ۱۲ = ۲۴۲ میشه', 'باشه.', [csn({ ph: 'u', said: [] })]);
    chk(/✗ «۲۱ × ۱۲» را «۲۴۲» نوشته/.test(blockOf(u.user)), 'setup: a chat ✗ with no ledger :: ' + blockOf(u.user).slice(0, 200));
    u = await turn('ولی من با ماشین‌حساب زدم، درسته', 'ببینیم.', [csn({ ph: 'u', said: [] })]); B = blockOf(u.user, '# بازسنجیِ حسابِ صفحه');
    chk(/حکم ماند: «۲۱ × ۱۲ = ۲۴۲»/.test(B) && /همین تکه/.test(B) && !/۲۵۲/.test(B) && !(await sysOf()).some(t => /۲۵۲/.test(t)) && (await sysOf()).some(t => /حکم ماند/.test(t)), 'chat ✗ contested without a ledger (C29): verdict stayed, the part pointed at, no right number :: ' + B.slice(0, 300));
  });

  // ================= clar — DECISIONS_R26 «Clarifications after the independent bank» C23–C29 (افزوده پس از وقفه؛ هر مثبت کنارِ شبیهِ منفی‌اش) =================
  await section('clar', async () => {
    const lineOf = (r) => r.lines.join(' | ');
    // C23: مقیاسِ عملوندها جزوِ حساب است
    await want('۲ میلیون × ۳ = ۶ هزار', 'FLAG', 'C23: operand and result scales differ ⇒ ✗');
    await want('۲ میلیون × ۳ = ۶ میلیون', 'OK', 'neg C23: the same scale on both sides');
    await want('۲ میلیون × ۳ = ۶۰۰۰ هزار', 'OK', 'neg C23: another scale word, the same quantity');
    // C24: مقیاس‌های گوناگون میانِ عملوندها — خوانشِ معمول ✓؛ فقط خوانشِ دیگر ⇒ نشان بده و بپرس؛ هیچ‌کدام ⇒ ✗
    await want('۳۰۰ + ۲۰ میلیون تقسیم بر ۴۰ = ۵۰۰۳۰۰', 'OK', 'C24: the standard reading (each scale on its own number) gives her result ⇒ ✓');
    let r = await want('۳۰۰ + ۲۰ میلیون تقسیم بر ۴۰ = ۸۰۰ هزار', 'ASK', 'C24: only the one-scale reading gives it ⇒ the reading is shown and asked', r => r.c[0].kind === 'reading');
    chk(/«۳۰۰» را هم «هزار» بخوانی/.test(lineOf(r)) && /این‌طور حساب کردی/.test(lineOf(r)) && /این‌طور حساب کردی/.test(r.note.chk || ''), 'C24: the coach line and her own line show the reading that works and ask «این‌طور حساب کردی؟» :: ' + lineOf(r) + ' // ' + r.note.chk);
    await want('۳۰۰ + ۲۰ میلیون تقسیم بر ۴۰ = ۹۰۰ هزار', 'FLAG', 'C24: no reading gives it ⇒ ✗');
    // C25 / C27: پرسش فقط برای گرد شده یا بریده
    await want('۱۰۰ ÷ ۷ = ۱۴', 'ASK', 'C25: 14 is the rounding and the truncation of 14.28…');
    await want('۱۰۰ ÷ ۷ = ۱۵', 'FLAG', 'C25: 15 is neither ⇒ ✗');
    await want('۱۰۰ ÷ ۷ = ۱۷', 'FLAG', 'C25: any other integer ⇒ ✗');
    await want('۲٫۹ × ۳ = ۸', 'ASK', 'C25: 8 is the truncation of 8.7 ⇒ ask');
    await want('۲٫۹ × ۳ = ۷', 'FLAG', 'C25: 7 is neither the rounding nor the truncation of 8.7 ⇒ ✗');
    await want('۲٫۵ × ۳ = ۸', 'ASK', 'C27: 8 is the rounding of 7.5 ⇒ ask');
    await want('۲٫۵ × ۳ = ۹', 'FLAG', 'neg C27: 9 ⇒ ✗');
    // C26: نمادِ کسر تساوی است؛ «÷ / تقسیم بر» خارج‌قسمت
    await want('۱۳/۱۲ = ۱', 'FLAG', 'C26: «۱۳/۱۲ = ۱» in fraction notation is an identity ⇒ ✗', r => !/باقی‌مانده/.test(r.c[0].valT));
    await want('۱۳ ÷ ۱۲ = ۱', 'ASK', 'C26: with «÷» it is a quotient ⇒ C25 ask');
    await want('۱۳÷۱۲ = ۱', 'ASK', 'C26: «÷» without spaces is still a quotient (never a fraction or a decimal point)');
    await want('۱۳ تقسیم بر ۱۲ = ۱', 'ASK', 'C26: «تقسیم بر» ⇒ C25 ask');
    await want('۲۶/۱۲ = ۱۳/۶', 'OK', 'neg C26: a true fraction identity stays ✓');
    // C28: «و … میشه» جمع و «N تا M … میشه K» ضرب
    await want('۳ و ۴ میشه ۸', 'FLAG', 'C28: «و … میشه» is a sum');
    await want('۳ و ۴ میشه ۷', 'OK', 'neg C28: the right sum');
    await want('۳ تا بستهٔ ۸۰ تومنی میشه ۲۴۰ تومن', 'OK', 'C28: «N تا … M … میشه K» is a product');
    await want('۳ تا بستهٔ ۸۰ تومنی میشه ۲۵۰', 'FLAG', 'C28: a wrong product ⇒ ✗');
    await want('۳ تا ۴ تومنی میشه ۱۳', 'FLAG', 'C28: «N تا M تومنی» (the bank\'s shape) ⇒ product, wrong ⇒ ✗');
    await want('۳ تا ۴ تومنی میشه ۱۲', 'OK', 'neg C28: the right product');
    await want('۲ تا ۳ روز دیگه میشه ۱۵', 'SILENT', 'neg C28: «N تا M روز» is a range, not a product — never ✗');
    await want('بین ۳ تا ۴ ساعت میشه ۵', 'SILENT', 'neg C28: «بین N تا M» is a range');
    await want('روی هم سه تا بسته خریدم هر کدوم هشتاد تومن، دویست و چهل دادم', 'SILENT', 'neg C28 / C17: no operation word at all stays outside');
    // C26: جوابِ او به «؟» — «آره، گرد کردم» ⇒ تقریبی و ✓؛ «نه» ⇒ ✗ (بی عددِ درست)؛ جوابِ بی‌ربط ⇒ چیزی ثبت نمی‌شود
    const askOf = () => p.evaluate(() => JSON.parse(JSON.stringify((__cur().coach || {}).arithAsk || [])));
    const badOf = () => p.evaluate(() => JSON.parse(JSON.stringify((__cur().coach || {}).arithBad || [])));
    await wipe(); await fresh();
    let u = await turn('هر جعبه ۱۰۰ ÷ ۷ = ۱۴ تا', 'باشه.', [csn({ ph: 'u', said: [] })]);
    chk(/؟ «۱۰۰ \/ ۷»/.test(blockOf(u.user)) && (await askOf()).length === 1, 'C26 setup: the page asks about «۱۰۰ ÷ ۷ = ۱۴» and keeps the question open :: ' + blockOf(u.user).slice(0, 300));
    u = await turn('آره، گرد کردم', 'باشه.', [csn({ ph: 'u', said: [] })]);
    let B = blockOf(u.user, '# جوابِ او به «؟» ِ صفحه'), A0 = await askOf();
    chk(/✓ به گفتهٔ خودش گرد کرده بود: «۱۰۰ \/ ۷ ≈ ۱۴»/.test(B) && /تقریبی و درست/.test(B) && A0[0] && A0[0].re && A0[0].re.to === 'ok' && A0[0].re.apx, 'C26: «آره، گرد کردم» stores the line as approximate and ✓ :: ' + B + ' :: ' + JSON.stringify(A0));
    u = await turn('آره', 'باشه.', [csn({ ph: 'u', said: [] })]);
    chk(!/# جوابِ او به «؟»/.test(head(u.user)), 'C26: an answered question is not answered again');
    await wipe(); await fresh();
    await turn('هر جعبه ۱۰۰ ÷ ۷ = ۱۴ تا', 'باشه.', [csn({ ph: 'u', said: [] })]);
    u = await turn('نه، همین ۱۴ رو می‌خواستم', 'باشه.', [csn({ ph: 'u', said: [] })]);
    B = blockOf(u.user, '# جوابِ او به «؟» ِ صفحه'); let Bd = await badOf();
    chk(/✗ به گفتهٔ خودش گرد نکرده بود: «۱۰۰ \/ ۷ = ۱۴» نمی‌خواند/.test(B) && !/۱۴٫۲|۱۴\.۲|باقی‌مانده/.test(B) && Bd.some(b => b.ask && b.said === '14'), 'C26: her «نه» leaves ✗ — without the right number, and on the table for a contest :: ' + B + ' :: ' + JSON.stringify(Bd));
    u = await turn('ولی من درست حساب کردم', 'ببینیم.', [csn({ ph: 'u', said: [] })]); B = blockOf(u.user, '# بازسنجیِ حسابِ صفحه');
    chk(/حکم ماند/.test(B) && !/درست: «/.test(B), 'C26 + C29: contesting that ✗ re-checks once and the ✗ stays (the exact value is still not 14) :: ' + B.slice(0, 300));
    await wipe(); await fresh();
    await turn('هر جعبه ۱۰۰ ÷ ۷ = ۱۴ تا', 'باشه.', [csn({ ph: 'u', said: [] })]);
    u = await turn('بریم سراغ بخشِ بعدی', 'باشه.', [csn({ ph: 'u', said: [] })]);
    chk(!/# جوابِ او به «؟»/.test(head(u.user)) && !(await askOf()).some(a => a.re), 'neg C26: a reply that is neither yes nor no records nothing');
    await wipe(); await fresh();
    await turn('۲ × ۳ = ۶', 'باشه.', [csn({ ph: 'u', said: [] })]);
    u = await turn('آره', 'باشه.', [csn({ ph: 'u', said: [] })]);
    chk(!/# جوابِ او به «؟»/.test(head(u.user)), 'neg C26: «آره» with no open question is nothing');
  });

  // ================= bank — Q1.arith_reader (۴۲ ورودی) =================
  await section('bank', async () => {
    const E = BANK, Q1 = E.map((e, i) => i).filter(i => /^Q1\./.test(E[i].rc));
    chk(Q1.length === 42 && Q1[0] === 0 && Q1[41] === 41, 'bank layout: 42 Q1 entries at 0…41 :: ' + Q1.length);
    const parts = (i) => E[i].text.split('‖').map(x => x.trim()).filter(x => /^U:/.test(x)).map(x => x.replace(/^U:\s*/, '').replace(/^…\s*/, ''));
    const T = (i, ok, x) => { info.bank[i] = info.bank[i] === undefined ? !!ok : (info.bank[i] && !!ok); chk(ok, 'bank#' + (i + 1) + ' [' + E[i].kind + '] «' + E[i].text.slice(0, 90) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + String(x).slice(0, 700)); };
    const NF = ['OK', 'UNCHECKED', 'OK+UNCHECKED'], NO = ['FLAG', 'UNCHECKED'];
    // انتظارِ هر جزء (به ترتیبِ «U:»)؛ آرایهٔ تو در تو = حکمِ هر حلقه به ترتیب
    const sq = (...a) => ({ seq: a });
    const X = { 0: ['OK'], 1: ['OK'], 2: [sq('ok', 'ok')], 3: ['OK'], 4: [sq('ok', 'flag')], 5: [NF], 6: ['OK'], 7: ['OK'], 8: ['OK'], 9: ['FLAG'], 10: ['FLAG'], 11: ['FLAG'], 12: [NO], 13: [NF], 14: [NO], 15: [NF, NO], 16: [NF, NO], 17: [NF], 18: [NF, NO],
      19: ['OK', sq('ok', 'ok')], 20: ['FLAG'], 21: ['OK'], 22: ['FLAG'], 23: ['ASK', 'ASK'], 25: ['FLAG'], 26: ['FLAG'], 27: [sq('ok', 'flag')], 28: ['OK', 'OK'], 29: ['OK', 'OK'], 30: ['OK', 'OK', 'OK'], 31: ['OK', 'OK', 'FLAG'], 32: ['FLAG'], 33: ['SILENT'],
      34: [NF], 35: [NF], 36: ['FLAG'], 37: ['FLAG'], 38: ['FLAG'], 39: ['SILENT', 'SILENT'] };
    const R = {};
    for (const i of Object.keys(X).map(Number)) {
      const ps = parts(i); let ok = ps.length === X[i].length; const res = []; R[i] = [];
      for (let k = 0; k < ps.length && ok; k++) { const r = await AC(ps[k]), e = X[i][k], v = verdict(r); R[i].push(r); res.push(v + ' ' + J(r));
        ok = e && e.seq ? JSON.stringify(r.c.map(c => c.st)) === JSON.stringify(e.seq) && !r.u.length : (Array.isArray(e) ? e : [e]).includes(v); }
      T(i, ok, res.join(' ‖ '));
    }
    // جزئیاتِ فراتر از حکم
    const c0 = (i, k) => (R[i] && R[i][k || 0] && R[i][k || 0].c) || [];
    chk(c0(4)[1] && c0(4)[1].said === '214 میلیون' && /۲۰۴ میلیون/.test(c0(4)[1].valT) && !/۲۰۴/.test(R[4][0].note.chk), 'bank#5: the ✗ names 214 against the page value in her form; her line does not give it away :: ' + JSON.stringify(c0(4)));
    chk(c0(6).every(c => c.said !== '5') && c0(7).every(c => c.said !== '2' && c.said !== '5') && c0(8).every(c => c.said !== '3'), 'bank#7–9: no condition number is the claimed value');
    chk(c0(9)[0] && /۱۹\/۲۰/.test(c0(9)[0].valT), 'bank#10: shown as a fraction (her form) :: ' + JSON.stringify(c0(9)));
    chk(c0(11).some(c => c.st === 'flag' && c.said === '2.9') && !c0(11).some(c => c.st === 'flag' && c.said === '2'), 'bank#12: the flag is on «۲٫۹», the true first half does not rescue the line :: ' + JSON.stringify(c0(11)));
    chk(verdict(R[12][0]) === 'FLAG' && verdict(R[13][0]) === 'OK' && verdict(R[14][0]) === 'FLAG' && verdict(R[15][0]) === 'OK' && verdict(R[15][1]) === 'FLAG' && verdict(R[16][0]) === 'OK' && verdict(R[16][1]) === 'FLAG' && verdict(R[17][0]) === 'OK',
      'bank#13–18: read with a real verdict (running sum with a unit, π, «A از B میشه N٪», powers, «برابر») — not merely «نسنجیده»');
    // DECISIONS_R27 C42 جای این انتظار را گرفت: هر دو جمعِ دنبالهٔ حسابی‌اند و دقیق حساب می‌شوند — اولی ✓ (NOT-FLAG)، دومی ✗ (NOT-OK)؛ همان انتظارِ خودِ بانک
    chk(verdict(R[18][0]) === 'OK' && verdict(R[18][1]) === 'FLAG', 'bank#19 (C42): AP ellipsis sums computed exactly — first ✓, second ✗ :: ' + R[18].map(J).join(' | '));
    info.nc[18] = 'C42 (round 27): an ellipsis fixed by its first two terms and the last is an arithmetic progression and is computed exactly; any other ellipsis stays «نسنجیده»';
    chk(c0(20)[0] && !c0(20)[0].unit && c0(20)[0].kind !== 'dim' && !/واحد|تبدیل/.test(R[20][0].lines[0]) && /۸۴۰۰/.test(c0(20)[0].valT), 'bank#21: a division slip is not labelled a unit error :: ' + JSON.stringify(R[20][0].lines));
    chk(c0(22)[0] && /۰٫۸۷۵/.test(c0(22)[0].valT) && c0(38)[0] && /٪/.test(c0(38)[0].valT) && !/\//.test(c0(38)[0].valT), 'bank#23/#39: the page value is a decimal / a percent, never a raw fraction :: ' + JSON.stringify([c0(22), c0(38)]));
    chk(R[23].every(r => /≈ ۱۴٫۲۹|≈ ۳۳٫۳۳/.test(r.c[0].valT) && r.note.bad === false && !/درست/.test(r.note.chk)), 'bank#24: the exact value in decimal form, neither booked as a failure nor confirmed :: ' + JSON.stringify(R[23].map(r => [r.c[0].valT, r.note.chk])));
    chk(c0(32)[0] && c0(32).some(c => c.st === 'flag' && c.said === '24'), 'bank#33: the ✗ names «24», never «5» :: ' + JSON.stringify(c0(32)));
    chk(verdict(R[34][0]) === 'OK' && c0(34)[0].unitUnread, 'bank#35: numbers ✓, the unit told as unread :: ' + JSON.stringify(c0(34)));
    chk(verdict(R[35][0]) === 'UNCHECKED', 'bank#36: «می‌شه» between two expressions ⇒ «نسنجیده» :: ' + J(R[35][0]));
    chk(c0(36)[0] && /تبدیل/.test(c0(36)[0].unit), 'bank#37: a real conversion error keeps the unit label :: ' + JSON.stringify(c0(36)));
    info.nc[0] = 'ledger ✓ and no mind-card failure are asserted in «block» (the runner sentence s01 p15 of the same shape)'; info.nc[10] = 'the override of the model\'s ✓ is asserted in «block»';
    info.nc[19] = 'the prompt block on a live problem with no ledger is asserted in «block»'; info.nc[24] = info.nc[40] = info.nc[41] = 'asserted in «contest» through real turns';
    if (!process.env.ONLY) { const missing = Q1.filter(i => info.bank[i] === undefined); chk(!missing.length, 'bank: every Q1 entry is tested :: ' + JSON.stringify(missing.map(i => i + 1))); }
  });

  const nb = Object.keys(info.bank).length, nbOk = Object.values(info.bank).filter(Boolean).length;
  console.log('bank Q1: ' + nbOk + '/' + nb + ' pass; nc: ' + Object.keys(info.nc).length + (Object.keys(info.nc).length ? ' ' + JSON.stringify(info.nc) : ''));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
