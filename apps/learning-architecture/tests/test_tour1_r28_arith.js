// تورِ پولیا (دستهٔ ۱، دورِ ۲۸، سهمِ «arith» — ۲۰۲۶-۱۱-۱۶) — DECISIONS_R28 R1 (S1: B28·D1 = C28-13، A28-40) + C84، C85، خوانندهٔ جوابِ `m2`، «sqrt(…)»، «a√b ≈ c» نسنجیده، «A و N دهم».
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۸ (پرامپت‌ها: T/round28X/<sid>/ai/pN.json):
//           B nB1 p3 (S1 B28·D1، B28·D8)؛ C aC3 p29 (C28-11، C28-12)، p30 (S1 C28-13)؛ A s02 p10 (A28-7)، p17 (A28-8/9/10)، p18–p19 (A28-11)، pwA2 p10 (S1 A28-40)؛
//           D tD1 p11 (D28-15)، aD4 p4 (D26-24، شکلِ «A و N دهم»)
//  bank     همهٔ ورودی‌های R1.arith_reader در بانکِ مستقلِ tests/variants/VARIANTS_R28.json
//  neither  کنارِ هر مثبت شبیهِ منفی‌اش (C84: هر دو خوانش ⇒ پرسش؛ C85: پس از تقسیم «می‌مونه» باقی‌مانده است؛ «آره» ِ تنها خوانش برنمی‌گزیند؛ …)
//  clock    روزِ صفحه منجمد است (APP.today)؛ هیچ انتظاری به تاریخِ تقویم بسته نیست
// LLA_FILE = ساختِ دیگر (برای «قرمزِ نخست»: ساختِ BASE28)؛ ONLY=engine,answer,block,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = JSON.parse(fs.readFileSync(process.env.LLA_VARIANTS || path.join(__dirname, 'variants', 'VARIANTS_R28.json'), 'utf8'));

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
  const J = (r) => JSON.stringify(r.c.map(c => [c.expr, c.said, c.st, c.kind, c.valT])) + ' unread=' + JSON.stringify(r.u) + ' lines=' + JSON.stringify(r.lines);
  const sts = (r) => r.c.map(c => c.st === 'ask' && c.kind === 'm2' ? 'ASKm2' : c.st.toUpperCase());
  const want = async (t, exp, tag, more) => { const r = await AC(t), v = verdict(r), ok = (Array.isArray(exp) ? exp : [exp]).includes(v) && (!more || more(r)); chk(ok, tag + ' [' + exp + '] «' + t + '» ⇒ ' + v + ' :: ' + J(r)); return ok; };
  const seq = async (t, exp, tag, more) => { const r = await AC(t), ok = JSON.stringify(sts(r)) === JSON.stringify(exp) && (!more || more(r)); chk(ok, tag + ' ' + JSON.stringify(exp) + ' «' + t.slice(0, 120) + '» ⇒ ' + JSON.stringify(sts(r)) + ' :: ' + J(r)); return ok; };
  const noX = (r) => !r.lines.some(l => /^✗/.test(l));

  // ================= engine — C84 (F1)، C85 (F2) و دیگر بندهای R1 با جمله‌های خودِ چهار گروه =================
  await section('engine', async () => {
    // ---- S1 B28·D1 (B nB1 p3): «۹ میلیون و ۹۰۰ + ۲ میلیون و ۸۰۰ = ۱۲ میلیون و ۷۰۰» — فقط خوانشِ «هزار» می‌خواند ⇒ ✓ ----
    let r = await AC('چسب هم ۲ میلیون و ۸۰۰ میشه؛ با سرامیک روی هم: ۹ میلیون و ۹۰۰ + ۲ میلیون و ۸۰۰ = ۱۲ میلیون و ۷۰۰. نصفش رو الان می‌دم: ۲ میلیون و ۸۰۰ تقسیم بر ۲ میشه ۱ میلیون و ۴۰۰ برای چسب. و از پولِ چسب ۵۰۰ هزار تخفیف گرفتم: ۲ میلیون و ۸۰۰ منهای ۵۰۰ هزار میشه ۲ میلیون و ۵۰۰.');
    chk(JSON.stringify(sts(r)) === '["OK","OK","FLAG"]' && /۹ میلیون و ۹۰۰ هزار/.test(r.lines[0]) && !/۱۱٫۰۰۱۷/.test(r.lines.join(' ')) && !/دو خوانش/.test(r.lines[1]),
      'S1 B28·D1 nB1 p3 (C84/C102): the thousand reading fits ⇒ ✓; «÷ ۲ = ۱ میلیون و ۴۰۰» fits it too ⇒ ✓ with no question (C102 replaces C84 «two fit ⇒ ask»); «− ۵۰۰ هزار = ۲ میلیون و ۵۰۰» fits none ⇒ ✗ with both values :: ' + J(r));
    chk(/۲ میلیون و ۳۰۰ هزار/.test(r.c[2].valT) && /۱ میلیون و ۵۰۰ هزار و ۸۰۰/.test(r.c[2].valT), 'C84 none-fits (B28·D8 line): the ✗ names each reading\'s exact value in her scale words :: ' + r.c[2].valT);
    await want('۹ میلیون و ۹۰۰ + ۲ میلیون و ۸۰۰ = ۱۲ میلیون و ۵۰۰', 'FLAG', 'neg C84: the same operands with a result no reading gives are ✗', r => /۱۲ میلیون و ۷۰۰ هزار/.test(r.c[0].valT) && /۱۱ میلیون و ۱ هزار و ۷۰۰/.test(r.c[0].valT));
    // ---- S1 C28-13 (C aC3 p30): «۱ میلیون و ۲۰۰ + ۸۰۰ هزار = ۲ میلیون» ⇒ ✓، هرگز «؟ دقیقاً ۱٫۸۰۰۲ میلیون … گرد کرده؟» ----
    r = await AC('یه حسابِ دیگه: ۱ میلیون و ۲۰۰ + ۸۰۰ هزار = ۲ میلیون. و ۵ میلیون و ۵۰۰ × ۲ = ۱۱ میلیون. اینم امروز: ۲ × ۳ = ۶ تا تخم‌مرغ خریدیم برای نوه‌م.');
    chk(JSON.stringify(sts(r)) === '["OK","OK","OK"]' && !/۱٫۸۰۰۲|گرد کرده/.test(r.lines.join(' ')), 'S1 C28-13 aC3 p30 (C84): ✓ under the thousand reading; no false exact value, no rounding question :: ' + J(r));
    await want('۱ میلیون و ۲۰۰ + ۸۰۰ هزار = ۲ میلیون و ۱۰۰', 'FLAG', 'neg C28-13: a wrong result with the same operands is ✗');
    // ---- C28-12 / C28-11 (C aC3 p29): ✗ با هر دو مقدار؛ هر دو خوانش ⇒ پرسش ----
    r = await AC('قسطِ بیمه رو حساب کردم: ۲ میلیون و ۸۰۰ × ۱۲ = ۳۳ میلیون و ۶۰۰ در سال. نصفش هم میشه: ۲ میلیون و ۸۰۰ ÷ ۲ = ۱ میلیون و ۴۰۰. اگه به‌جای ۶ میلیون ماهی ۶ میلیون و ۵۰۰ کنار بذارم: ۶ میلیون و ۵۰۰ × ۱۰ = ۶۰ میلیون.');
    chk(JSON.stringify(sts(r)) === '["OK","OK","FLAG"]' && /^۶۵ میلیون/.test(r.c[2].valT) && /۶۰ میلیون و ۵ هزار/.test(r.c[2].valT) && !/گرد کرده/.test(r.lines[2]),
      'C28-12 + C28-11 aC3 p29: «× ۱۰ = ۶۰ میلیون» ✗ with both values, thousands first (C103; never a rounding «؟»); «÷ ۲ = ۱ میلیون و ۴۰۰» ✓ with no question (C102 replaces RUNNER28 T15 / C84 «ask») :: ' + J(r));
    await want('۲ میلیون و ۸۰۰ ÷ ۲ = ۱ میلیون و ۴۰۰۰', 'FLAG', 'neg C102: a result that fits no reading is still ✗');
    r = await AC('۱ میلیون و ۵۰۰ − ۵۰۰ = ۱ میلیون'); chk(JSON.stringify(sts(r)) === '["OK"]' && /یعنی «۱ میلیون و ۵۰۰» ِ واحد/.test(r.lines[0]), 'C102: right only under the units reading ⇒ ✓ and the page shows that reading :: ' + J(r));
    await want('۲ میلیون و ۸۰۰ تومن + ۲۰۰ = ۲ میلیون و ۱۰۰۰', 'OK', 'C105: «۸۰۰ تومن» fixes the units reading (no thousand alternative)');
    await want('۲ میلیون و ۸۰۰ تومن + ۲۰۰ هزار = ۳ میلیون', 'FLAG', 'neg C105: with «تومن» the thousand reading is not tried');
    await want('۶ میلیون و ۵۰۰ × ۱۰ = ۶۵ میلیون', 'OK', 'neg C28-12: the right product is ✓ (no rounding question)');
    // ---- A (s02 p17/p18): A28-9 ✓ (نه «واحدِ ناشناخته»)، A28-10 ✗ با هر دو مقدار در مقیاسِ خودش، A28-8 «۲√۳ ≈ …» نسنجیده ----
    r = await AC('دقیق‌ترش: ۲√۳ ≈ ۳٫۴۶ دسی‌متر. کرایه: ۲ میلیون و ۸۰۰ + ۲۰۰ هزار انعام = ۳ میلیون. سهمِ من: ۲ میلیون و ۸۰۰ ÷ ۲ = ۱ میلیون و ۴۰۰. سهمِ برادرم با کارگر: ۲ میلیون و ۸۰۰ ÷ ۲ = ۱ میلیون و ۵۰۰.');
    chk(JSON.stringify(sts(r)) === '["OK","OK","FLAG"]' && !/واحدش نسنجیده|واحدِ ناشناخته/.test(r.lines[0]) && /۱ میلیون و ۴۰۰ هزار/.test(r.c[2].valT) && !/۱۰۰۰۴۰۰/.test(r.c[2].valT) && r.u.length === 1 && /2√3|۲√۳/.test(r.u[0]),
      'A28-8/9/10 s02 p17: «… + ۲۰۰ هزار انعام = ۳ میلیون» ✓; «÷ ۲ = ۱ میلیون و ۵۰۰» ✗ with both values in her words; «۲√۳ ≈ ۳٫۴۶» «نسنجیده», never silent :: ' + J(r));
    r = await AC('آهان برادرم هم ۱ میلیون و ۴۰۰. رفت‌وبرگشت: ۲ میلیون و ۸۰۰ × ۲ = ۵ میلیون و ۶۰۰. توی دفترم نوشتم ۲ میلیون و ۸۰۰ ÷ ۲ = ۱۴۰۰.');
    chk(JSON.stringify(sts(r)) === '["OK","ASKm2"]' && !/۱۰۰۰۴۰۰|۱۴۰۰۰۰۰/.test(r.lines.join(' ')), 'A s02 p18: one-reading product ✓; «÷ ۲ = ۱۴۰۰» is the scale-bound «کدام را نوشتی؟», values in her words :: ' + J(r));
    // ---- D28-15 (D tD1 p11): «۱۸ × ۱۵۰ هزار = ۲ میلیون و ۶۰۰» ✗ با «۲ میلیون و ۷۰۰ هزار»، نه «۲٫۷» ----
    r = await AC('قرنیز: دورِ پذیرایی ۲ × (۵ + ۴) = ۱۸ متره و متری ۱۶۰ هزار، پس ۱۸ × ۱۶۰ = ۲ میلیون و ۸۸۰. نصبِ قرنیز هم ۱۸ × ۱۵۰ هزار = ۲ میلیون و ۶۰۰.');
    chk(JSON.stringify(sts(r)) === '["OK","OK","FLAG"]' && /^۲ میلیون و ۷۰۰ هزار/.test(r.c[2].valT) && /۲ میلیون و ۶۰۰ هزار/.test(r.c[2].valT), 'D28-15 tD1 p11: the exact value keeps her scale word; both readings of her result named :: ' + J(r));
    await want('۱۸ × ۱۵۰ هزار = ۲ میلیون و ۷۰۰', 'OK', 'neg D28-15: the right result (thousand reading) is ✓');
    // ---- S1 A28-40 (A pwA2 p10) — C85 ----
    r = await AC('مونده ۴۸ − ۳۰ = ۱۸. روزی ۵ تا: ۵ و ۵ و ۵ میشه ۱۵، ۳ تا می‌مونه، پس ۴ روز.');
    chk(JSON.stringify(sts(r)) === '["OK","OK"]' && noX(r) && !/باقی‌ماندهٔ/.test(r.lines.join(' ')), 'S1 A28-40 pwA2 p10 (C85): «۳ تا می‌مونه» is its own statement; the sum is ✓ :: ' + J(r));
    await want('۵ و ۵ و ۵ میشه ۱۶، ۳ تا می‌مونه', 'FLAG', 'neg C85: a wrong sum stays ✗, quoting only the sum', r => r.c[0].said === '16');
    await want('۱۸ ÷ ۵ = ۳، ۳ تا می‌مونه', 'OK', 'neg C85: after a division the clause IS the remainder (and right)');
    await want('۱۸ ÷ ۵ = ۳، ۲ تا می‌مونه', 'FLAG', 'neg C85: a wrong remainder of a division is still ✗');
    await seq('۲۰ تا کارت داشتم: ۶ و ۶ و ۶ میشه ۱۸، ۵ تا می‌مونه', ['OK', 'FLAG'], 'C108: her total («۲۰ تا») gives the clause its operands ⇒ the sum ✓ and the remainder judged on its own (✗)', r => r.c[1].kind === 'remc' && r.c[0].said === '18');
    await seq('۲۰ تا مداد داریم، هر جعبه ۶ تا: ۶ و ۶ و ۶ میشه ۱۸، ۲ تا می‌مونه', ['OK', 'OK'], 'C108: a true remainder clause is ✓ on its own');
    await seq('۵ و ۵ و ۵ میشه ۱۵ و ۳ تا می‌مونه', ['OK'], 'C109: with no separator the sum ends at its result; no total ⇒ the clause gets no line');
    // ---- A28-7: «sqrt(…)» مثلِ «√» ----
    r = await AC('یه لولهٔ کوتاه‌تر هم دارم، ۳٫۹۵ متری. خودم حساب کردم: ۳٫۲² = ۱۰٫۲۴، با ۱٫۸² میشه ۱۳٫۴۸، با ۱٫۵² میشه ۱۵٫۷۳. ۱۵۰ سانت = ۱٫۵ متر. قطر = sqrt(15.73) ≈ ۳٫۹۷ و ۳٫۹۷ − ۳٫۹۵ = ۰٫۰۲ متر = ۲ سانت جا دارم.');
    chk(!r.u.length && r.c.some(c => /^sqrt/.test(c.expr) && c.st === 'ok'), 'A28-7 s02 p10: «sqrt(15.73) ≈ ۳٫۹۷» is computed like «√» (✓) :: ' + J(r));
    await want('قطر = sqrt(15.73) ≈ ۳٫۸', 'FLAG', 'neg A28-7: a wrong root written with «sqrt» is ✗');
    // ---- C9 (بانکِ R28 #43): «≈» با رقمِ اعشار = گرد، بریده یا گردِ دومرحله‌ای؛ نه ±۱ رقم ----
    await want('√۲ ≈ ۱٫۴۲', 'FLAG', 'C9: 1.4142 is neither rounded, truncated nor double-rounded to 1.42');
    await want('۱.۰۱۵/۱.۰۲۲ − ۱ ≈ −۰.۶۹٪', 'OK', 'neg C9 (D26-52, DECISIONS_R26 S1-a): −0.6849 ⇒ −0.685 ⇒ −0.69 is her rounding, never ✗');
    // ---- D26-24 (aD4): «A و N دهم» یک عدد است ----
    await want('۲۴۰ − ۱۶۰ − ۰٫۶ = ۷۹ و ۷ دهم', 'FLAG', 'D26-24 aD4 p4 shape: «۷۹ و ۷ دهم» is 79.7 (exact 79.4 ⇒ ✗)');
    await want('۲۴۰ − ۱۸۰ − ۰٫۳ = ۵۹ و ۷ دهم', 'OK', 'neg D26-24: «۵۹ و ۷ دهم» right');
    // ---- همسایه‌ها بی‌تغییر ----
    await want('۳ میلیون و ۲۰۰ هزار + ۸۰۰ هزار = ۴ میلیون', 'OK', 'neg C84: a compound with its own «هزار» has one reading');
    await want('۲ هزار و ۵۰۰ + ۵۰۰ = ۳ هزار', 'OK', 'neg C84: «N هزار و M» has no lower named scale');
    await want('۲ میلیون و ۸۰۰ ÷ ۳ = ۹۳۳ هزار', 'ASK', 'C84: rounding under the thousand reading is still her rounding «؟»', r => r.c[0].kind === 'round');
  });

  // ================= answer — `m2`: جوابِ او به «کدام خوانش؟» (A28-11) =================
  await section('answer', async () => {
    await wipe(); await fresh();
    let u = await turn('آهان برادرم هم ۱ میلیون و ۴۰۰. رفت‌وبرگشت: ۲ میلیون و ۸۰۰ × ۲ = ۵ میلیون و ۶۰۰. توی دفترم نوشتم ۲ میلیون و ۸۰۰ ÷ ۲ = ۱۴۰۰.', 'کدام را نوشتی — ۸۰۰ هزار یا ۸۰۰ تومان؟', [csn({})]);
    let A0 = await askOf(); chk(A0.length === 1 && A0[0].kind === 'm2' && !A0[0].re, 'A28-11 s02 p18: the «کدام خوانش؟» line waits for her answer :: ' + JSON.stringify(A0));
    u = await turn('منظورم ۲ میلیون و ۸۰۰ هزار بود، پس ۱۴۰۰ هزار تومن.', 'باشه.', [csn({})]);
    let B = blockOf(u.user, '# جوابِ او به «؟» ِ صفحه'); A0 = await askOf();
    chk(/✓ به گفتهٔ خودش «۸۰۰ هزار» بود/.test(B) && A0[0].re && A0[0].re.to === 'ok' && A0[0].re.rd === 'k', 'A28-11 s02 p19: «منظورم ۲ میلیون و ۸۰۰ هزار بود» is read — the line is ✓ with the thousand reading :: ' + B + ' :: ' + JSON.stringify(A0));
    u = await turn('باشه، بریم سراغ ادامه', 'باشه.', [csn({})]); chk(!/# جوابِ او به «؟»/.test(head(u.user)), 'm2: an answered question is not asked again');
    // a units answer to a scale-bound question ⇒ ✗ (no number told)
    await wipe(); await fresh();
    await turn('توی دفترم نوشتم ۲ میلیون و ۸۰۰ ÷ ۲ = ۱۴۰۰', 'کدام را نوشتی؟', [csn({})]);
    u = await turn('خودِ ۸۰۰ تومن منظورم بود', 'باشه.', [csn({})]); B = blockOf(u.user, '# جوابِ او به «؟» ِ صفحه'); A0 = await askOf();
    chk(/✗ به گفتهٔ خودش خودِ «۸۰۰» \(واحد\) بود/.test(B) && A0[0].re.to === 'wrong' && !/۱ میلیون و ۴۰۰/.test(B), 'm2 units answer: under her own reading the line does not fit ⇒ ✗, the right number not told :: ' + B);
    // neg: «آره» ِ تنها به «کدام؟» نمی‌خورد
    await wipe(); await fresh();
    await turn('۲ میلیون و ۸۰۰ ÷ ۲ = ۱۴۰۰', 'کدام را نوشتی؟', [csn({})]);
    u = await turn('آره', 'باشه.', [csn({})]); A0 = await askOf(); chk(!A0.some(a => a.re), 'neg m2: a bare «آره» picks no reading :: ' + JSON.stringify(A0));
    u = await turn('همون اولی', 'باشه.', [csn({})]); A0 = await askOf(); chk(A0[0].re && A0[0].re.rd === 'k' && A0[0].re.to === 'ok', 'C106: «همون اولی» picks the first reading named (هزار) :: ' + JSON.stringify(A0));
    await wipe(); await fresh();
    await turn('۲ میلیون و ۸۰۰ ÷ ۲ = ۱۴۰۰', 'کدام را نوشتی؟', [csn({})]);
    u = await turn('هزار', 'باشه.', [csn({})]); A0 = await askOf(); chk(A0[0].re && A0[0].re.rd === 'k', 'C106: a bare scale word «هزار» is an answer :: ' + JSON.stringify(A0));
    await wipe(); await fresh();
    await turn('۲ میلیون و ۸۰۰ ÷ ۲ = ۱۴۰۰', 'کدام را نوشتی؟', [csn({})]);
    u = await turn('راستی فردا جلسه‌ی مدرسه دارم', 'باشه.', [csn({})]); A0 = await askOf(); chk(!A0[0].re, 'neg C106: an unrelated next message is no answer :: ' + JSON.stringify(A0));
  });

  // ================= C13 در همان گفت‌وگو (A s02 p4 ⇒ p7): گردِ خودش در پیامِ پیشین بازه است =================
  await section('prev', async () => {
    await wipe(); await fresh();
    await turn('خب مجهول بلندترین پاره‌خط داخل بارِ. کف رو حساب کردم: sqrt(3.2^2 + 1.8^2) ≈ 3.67. باز هم از ۴ کمتره! گیر کردم.', 'باشه.', [csn({})]);
    let u = await turn('قطر کف با ارتفاع یه مثلث قائم دیگه می‌سازه: sqrt(3.67^2 + 1.6^2) ≈ 4.005. جا میشه!', 'باشه.', [csn({})]), B = blockOf(u.user);
    chk(!/✗/.test(B), 'A s02 p7 (C13 across her messages): «3.67» is her own rounding from p4, so «≈ 4.005» (right for the unrounded diagonal) is never ✗ :: ' + B);
    await wipe(); await fresh();
    u = await turn('قطر کف با ارتفاع یه مثلث قائم دیگه می‌سازه: sqrt(3.67^2 + 1.6^2) ≈ 4.005. جا میشه!', 'باشه.', [csn({})]); B = blockOf(u.user);
    chk(/✗ «sqrt/.test(B), 'neg C13: with no earlier rounding of her own, «3.67» is exact and «≈ 4.005» (4.0036) is ✗ by C9 :: ' + B);
    await wipe(); await fresh();
    await turn('حدود ۱۵ نفر میان', 'باشه.', [csn({})]);
    u = await turn('خودم حساب کردم: ۱۵ × ۲ = ۳۱', 'باشه.', [csn({})]); B = blockOf(u.user);
    chk(/✗ «۱۵ × ۲»/.test(B), 'neg C13: an earlier integer «حدود ۱۵» does not widen a later exact «۱۵ × ۲ = ۳۱» :: ' + B);
  });

  // ================= block — آنچه مربی در همان نوبت می‌بیند (S1 ها) =================
  await section('block', async () => {
    await wipe(); await fresh();
    let u = await turn('خودم حساب کردم: چسب هم ۲ میلیون و ۸۰۰ میشه؛ با سرامیک روی هم: ۹ میلیون و ۹۰۰ + ۲ میلیون و ۸۰۰ = ۱۲ میلیون و ۷۰۰.', 'باشه.', [csn({})]);   // «خودم حساب کردم» (MINE) ⇒ سطرهای ✓ هم به مربی می‌رسند، مثلِ مسئلهٔ زندهٔ nB1
    let B = blockOf(u.user); chk(/✓ «۹ میلیون و ۹۰۰ \+ ۲ میلیون و ۸۰۰ = ۱۲ میلیون و ۷۰۰» می‌خواند/.test(B) && !/✗/.test(B), 'S1 B28·D1 in the prompt: the coach is told ✓, never ✗ :: ' + B);
    await wipe(); await fresh();
    u = await turn('مونده ۴۸ − ۳۰ = ۱۸. روزی ۵ تا: ۵ و ۵ و ۵ میشه ۱۵، ۳ تا می‌مونه، پس ۴ روز.', 'باشه.', [csn({})]);
    B = blockOf(u.user); chk(!/✗/.test(B) && !/باقی‌ماندهٔ/.test(B), 'S1 A28-40 in the prompt: no ✗ reaches the coach (and so not the child) :: ' + B);
    await wipe(); await fresh();
    u = await turn('یه حسابِ دیگه: ۱ میلیون و ۲۰۰ + ۸۰۰ هزار = ۲ میلیون.', 'باشه.', [csn({})]);
    B = blockOf(u.user); chk(!/۱٫۸۰۰۲|گرد کرده|؟ /.test(B), 'S1 C28-13 in the prompt: no false exact value, no rounding question :: ' + B);
  });

  // ================= bank — همهٔ ورودی‌های R1 در VARIANTS_R28 =================
  await section('bank', async () => {
    const E = BANK, R1 = E.map((e, i) => i).filter(i => /^R1\./.test(E[i].rc));
    const tok = (e) => String(e.expect).split(/\s+—|\s+-\s|\s/)[0].replace(/[^A-Z\-]/g, '');
    const multi = (e) => /‖/.test(e.text);
    const vals = { 4: r => /۸ میلیون و ۴۰۰ هزار/.test(r.c[0].valT) && /۷ میلیون و ۱ هزار و ۴۰۰/.test(r.c[0].valT) && !/۷۰۰۱۴۰۰/.test(r.c[0].valT),
      5: r => /۴۵ میلیون/.test(r.c[0].valT) && /۴۰ میلیون و ۵ هزار/.test(r.c[0].valT) && !/گرد/.test(r.lines[0]),
      10: r => !/\d{10}|[۰-۹]{10}/.test(r.lines.join(' ')),
      11: r => /۳ میلیون و ۵۰۰ هزار/.test(r.c[0].valT) && /۳ میلیون و ۴۰۰ هزار/.test(r.c[0].valT) && !/۳٫۵(?! میلیون)/.test(r.c[0].valT),
      21: r => r.c[0].said === '19' && !/باقی‌ماندهٔ/.test(r.lines.join(' ')) };
    for (const i of R1) {
      const e = E[i], t0 = tok(e);
      if (multi(e)) {   // گفت‌وگوی واقعی: «U: … ‖ [page: …] ‖ U: …»
        const parts = e.text.split('‖').map(x => x.trim()), us = []; let rep = 'باشه.';
        parts.forEach(x => { if (/^U:/.test(x)) us.push({ t: x.replace(/^U:\s*/, ''), r: 'باشه.' }); else if (/^\[page:/.test(x) && us.length) us[us.length - 1].r = x.replace(/^\[page:\s*/, '').replace(/\]$/, ''); });
        await wipe(); await fresh(); let u = null; for (const x of us) u = await turn(x.t, x.r, [csn({})]);
        const A0 = await askOf(), B = blockOf(u.user, '# جوابِ او به «؟» ِ صفحه'); let ok;
        /* C102: «۲ میلیون و ۳۰۰ × ۳ = ۶ میلیون و ۹۰۰» و «۱۲ میلیون و ۴۰۰ ÷ ۴ = ۳ میلیون و ۱۰۰» با خوانشِ هزار می‌خوانند ⇒ ✓ بی پرسش؛ پس «؟» ای نیست که جواب بگیرد یا باز بماند.
           آنچه از این ورودی‌ها هنوز معنا دارد سنجیده می‌شود: سطر ✓ است (نه «؟»، نه ✗)، هیچ پرسشی باز نیست، و هیچ پیامی «جواب» خوانده نمی‌شود */
        const first = await AC(us[0].t), okLine = sts(first).length === 1 && sts(first)[0] === 'OK';
        ok = okLine && !A0.length && !B; info.nc[i + 1] = 'C102: the first line fits under the thousands reading ⇒ ✓ with no question, so there is no «؟» to answer or keep open (asserted: ✓, no open ask, no answer block)';
        info.bank[i] = !!ok; chk(ok, 'bank#' + (i + 1) + ' «' + e.text.slice(0, 100) + '» → ' + e.expect.slice(0, 100) + ' :: ' + B + ' :: ' + JSON.stringify(A0)); continue;
      }
      const t = e.text.replace(/^U:\s*/, ''), r = await AC(t), v = verdict(r), S = sts(r);
      let ok;
      if (t0 === 'OK') ok = S.length > 0 && S.every(x => x === 'OK') && !r.u.length;
      else if (t0 === 'FLAG') ok = S.includes('FLAG');
      else if (t0 === 'ASK-SCALE') { ok = S.length === 1 && S[0] === 'OK' && /با خوانشِ .*هزار/.test(r.lines[0]); if (ok) info.nc[i + 1] = 'C102 replaces C84 «two fit ⇒ ask»: the line fits under the thousands reading ⇒ ✓ with no question (asserted)'; }
      else if (t0 === 'NOT-FLAG') ok = (v === 'OK' || v === 'UNCHECKED');
      else if (t0 === 'NOT-OK') ok = (v === 'FLAG' || v === 'UNCHECKED');
      else if (t0 === 'SILENT') ok = v === 'SILENT';
      else if (/^the sum line is OK/.test(e.expect)) ok = S[0] === 'OK' && S.slice(1).every(x => x === 'FLAG') && r.c.slice(1).every(c => c.kind === 'remc');   // C108: the false remainder is its own ✗ line
      else ok = false;
      if (ok && vals[i]) ok = !!vals[i](r);
      if (ok && /S1 family/.test(e.context || '') && t0 === 'OK') ok = noX(r) && !/گرد کرده|باقی‌ماندهٔ/.test(r.lines.join(' '));
      info.bank[i] = !!ok; chk(ok, 'bank#' + (i + 1) + ' [' + e.kind + '] «' + t.slice(0, 90) + '» → ' + e.expect.slice(0, 110) + ' :: ' + v + ' ' + J(r));
    }
    if (!process.env.ONLY) { const missing = R1.filter(i => info.bank[i] === undefined); chk(!missing.length, 'bank: every R1 entry is tested :: ' + JSON.stringify(missing.map(i => i + 1))); }
  });

  const nb = Object.keys(info.bank).length, nbOk = Object.values(info.bank).filter(Boolean).length;
  console.log('bank R1 (R28): ' + nbOk + '/' + nb + ' pass; nc: ' + Object.keys(info.nc).length + ' ' + JSON.stringify(info.nc));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
