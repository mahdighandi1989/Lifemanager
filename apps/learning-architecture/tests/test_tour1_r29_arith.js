// تورِ پولیا (دستهٔ ۱، دورِ ۲۹، سهمِ «arith» — ۲۰۲۶-۱۱-۱۷) — DECISIONS_R29 R1: S1 C29-1، C29-2، C29-3؛ C135 (C105 قرنطینه ⇒ S1 D29-1/D29-2)؛ C140، C141؛ هر تعداد عددِ مرکب؛
//  نامِ قلم میانِ عددها؛ ✗ در مقیاسِ خودِ او؛ صادرهٔ بند‌به‌بندِ C138 (ST.arithClauses)؛ و حکم‌های پس از بانک C154–C159، C161.
//  runners  جمله‌های خودِ دونده‌های دورِ ۲۹ (T/round29X/<sid>/ai/pN.json): C aC1 p21، aC3 p32–p36؛ D tD1 p1، p20، p22، p23؛ B nB2 p1، p4؛ A s02 p20، s06 p9، s08 p11، pwA2 p12
//  C136     هم‌شکل‌های منفی از رونوشت‌های round28*/round29* (aB4 p4، aD3 p4، pwA2 p11 ِ دورِ ۲۸) — حکمی که دونده درست دانسته بود می‌ماند
//  bank     همهٔ ورودی‌های R1.arith_reader در بانکِ مستقلِ tests/variants/VARIANTS_R29.json (ویرایش‌نشده)
//  clock    هیچ انتظاری به تاریخ بسته نیست. LLA_FILE = ساختِ دیگر (قرمزِ نخست: ساختِ BASE29)؛ ONLY=engine,clauses,block,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = JSON.parse(fs.readFileSync(process.env.LLA_VARIANTS || path.join(__dirname, 'variants', 'VARIANTS_R29.json'), 'utf8'));

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

  const CL = (t, ctx) => p.evaluate(([t, ctx]) => { if (!APP.STORY.arithClauses) return null; const K = APP.STORY.arithClauses(t, ctx || undefined);
    return { mark: K.mark, line: K.line, lineM: K.lineM, cl: K.clauses.filter(x => x.claim).map(x => ({ t: x.t, mark: x.mark, line: x.line })) }; }, [t, ctx || '']);
  const CLs = (K) => K ? JSON.stringify(K.cl.map(x => [x.mark, x.t])) + ' mark=' + K.mark : 'NO EXPORT';
  const lineHas = (r, re) => r.lines.some(l => re.test(l));

  // ================= engine — S1 ها و بندهای R1 با جمله‌های خودِ دونده‌های دورِ ۲۹ =================
  await section('engine', async () => {
    // ---- S1 C29-1 (C aC1 p21): «۱۸ − ۱۵ = ۳، ۳ تا می‌مونه» دو گزاره، هر دو ✓ (C141) — هرگز «✗ ۱۵ − ۳ … ۱۲» ----
    let r = await AC('سلام! امروز با تیله‌ها بازی کردیم. ۱۸ تا تیله داشتیم، ۱۵ تا دادیم به دوستم: ۱۸ − ۱۵ = ۳، ۳ تا می‌مونه.');
    chk(JSON.stringify(sts(r)) === '["OK","OK"]' && !r.c.some(c => /15 − 3/.test(c.expr)) && noX(r), 'S1 C29-1 aC1 p21 (C141): the subtraction and its remainder clause are two right statements; never «۱۵ − ۳ … ۱۲» :: ' + J(r));
    await seq('۱۸ − ۱۵ = ۳، ۴ تا می‌مونه', ['OK', 'FLAG'], 'neg C141: after a subtraction a different remainder is ✗ on its own line');
    // ---- S1 C29-2 (C aC3 p34): «۲ و ۵ دهم × ۴ = ۱۰ درصد» ✓ (C140)؛ «۱ و ۵ دهم × ۳ = ۴ و ۸ دهم» ✗ ۴٫۵ ----
    r = await AC('سودِ سپرده ماهی ۲ و ۵ دهم درصده؛ ۴ ماه میشه ۲ و ۵ دهم × ۴ = ۱۰ درصد. سه ماهِ اول هم ۱ و ۵ دهم × ۳ = ۴ و ۸ دهم بود.');
    chk(JSON.stringify(sts(r)) === '["OK","FLAG"]' && !/۱۰۰۰٪/.test(r.lines.join(' ')) && r.c[1].valT === '۴٫۵', 'S1 C29-2 aC3 p34 (C140): the percent label is ✓ (never «۱۰۰۰٪»); the decimal slip stays ✗ ۴٫۵ :: ' + J(r));
    await want('۱۷۵ تقسیم بر ۱۲۵۰ = ۱۴٪', 'OK', 'C140 look-alike: a fraction written as a percent stays ✓');
    await want('۳ / ۱۲۰۰ = ۰٫۲۵٪', 'OK', 'C140 look-alike: «۳ / ۱۲۰۰ = ۰٫۲۵٪» stays ✓');
    await want('۴ از ۲۶ میشه ۱۵٪', 'ASK', 'C140/C159: «۴ از ۲۶ میشه ۱۵٪» keeps the rounding question (C9/C44)');
    await want('۳ × ۴ = ۱۰ درصد', 'FLAG', 'C140 negative: neither 10 nor 0.1 ⇒ ✗ showing both', r => /۱۲٪/.test(r.c[0].valT) && /۱۲۰۰٪/.test(r.c[0].valT));
    // ---- S1 C29-3 (C aC3 p36): شش عددِ مرکب = ۸ میلیون ✓ ----
    r = await AC('جمعِ شش قسطِ اول: ۱ میلیون و ۲۰۰ + ۱ میلیون و ۳۰۰ + ۱ میلیون و ۱۰۰ + ۱ میلیون و ۴۰۰ + ۱ میلیون و ۵۰۰ + ۱ میلیون و ۵۰۰ = ۸ میلیون. امروز هم ۲ × ۳ = ۶ تا نون خریدم.');
    chk(JSON.stringify(sts(r)) === '["OK","OK"]' && !/۶٫۰۰۲/.test(r.lines.join(' ')), 'S1 C29-3 aC3 p36: six compound terms read thousands-first ⇒ ✓ (never «۶٫۰۰۲ میلیون») :: ' + J(r));
    await want('۱ میلیون و ۲۰۰ + ۱ میلیون و ۳۰۰ + ۱ میلیون و ۱۰۰ + ۱ میلیون و ۴۰۰ + ۱ میلیون و ۵۰۰ + ۱ میلیون و ۵۰۰ + ۱ میلیون و ۱۰۰ + ۱ میلیون و ۲۰۰ + ۱ میلیون و ۳۰۰ = ۱۱ میلیون و ۶۰۰', 'OK', 'C29-3: nine compound terms (no limit) ⇒ ✓');
    await want('۱ میلیون و ۲۰۰ + ۱ میلیون و ۳۰۰ + ۱ میلیون و ۱۰۰ + ۱ میلیون و ۴۰۰ + ۱ میلیون و ۵۰۰ + ۱ میلیون و ۵۰۰ = ۷ میلیون', 'FLAG', 'neg C29-3: a wrong six-term sum is ✗ with both readings', r => /۸ میلیون/.test(r.c[0].valT) && /۶ میلیون و ۲ هزار/.test(r.c[0].valT));
    // ---- S1 D29-1 / D29-2 (D tD1 p1، p22): C105 قرنطینه (C135) ----
    r = await AC('گام ۳: هر مترمربع ۸۵۰ هزار تومنه، پس ۲۲ × ۸۵۰ هزار = ۱۸ میلیون و ۷۰۰ تومن.');
    chk(JSON.stringify(sts(r)) === '["OK"]' && !/۱۸٫۷/.test(r.lines.join(' ')), 'S1 D29-1 tD1 p1 (C135): «۱۸ میلیون و ۷۰۰ تومن» is 18 700 000 ⇒ ✓ :: ' + J(r));
    r = await AC('کرایهٔ وانت ۱ میلیون و ۲۰۰ تومن، کارگر ۸۰۰ هزار تومن: ۱ میلیون و ۲۰۰ تومن + ۸۰۰ هزار تومن = ۲ میلیون تومن. یه قلمِ دیگه: ۲ میلیون و ۳۰۰ تومن + ۴۰۰ هزار تومن = ۳ میلیون تومن.');
    chk(JSON.stringify(sts(r)) === '["OK","FLAG"]' && !/۱٫۸۰۰۲|۲٫۴۰۰۳|گرد کرده/.test(r.lines.join(' ')) && /۲ میلیون و ۷۰۰ هزار/.test(r.c[1].valT), 'S1 D29-2 tD1 p22 (C135, C103): ✓ with no false exact value; the wrong line ✗ names «۲ میلیون و ۷۰۰ هزار» :: ' + J(r));
    // ---- C29-19 / C154 (C aC3 p32): عددِ تنها کنارِ عددِ مرکب، نخست «هزار» ----
    r = await AC('از ۵ میلیون و ۸۰۰ هم ۸۰۰ رو دادم به نوه‌م: ۵ میلیون و ۸۰۰ − ۸۰۰ = ۵ میلیون.');
    chk(JSON.stringify(sts(r)) === '["OK"]' && !/ِ واحد/.test(r.lines[0]) && /«۸۰۰ هزار»/.test(r.lines[0]), 'C29-19/C154 aC3 p32: the bare «۸۰۰» takes the thousands reading ⇒ ✓ with no «ِ واحد» note :: ' + J(r));
    await want('پارکینگ ۱ میلیون و ۸۰۰ تومن − ۳۰۰ تومن تخفیف = ۱ میلیون و ۵۰۰ تومن', 'OK', 'A29-10 s02 p20 (C135/C154): an item word after «تومن» is not a second unit; ✓, never «واحدهای ناهم‌سان»');
    await want('۲ میلیون و ۸۰۰ ÷ ۲ = ۱ میلیون و ۴۰۰', 'OK', 'neg C154: a divisor is not a bare amount (unchanged ✓)');
    // ---- C155: فقط خوانشِ درهم ⇒ «؟»، هرگز ✓/✗ ----
    await want('۲ میلیون و ۵۰۰ + ۳۰۰ = ۲۵۰۰۳۰۰', 'ASK', 'C155: right only when one amount is thousands and the other units ⇒ «؟», never ✓', r => r.c[0].kind === 'mixed');
    // ---- نامِ قلم میانِ عددها (D29-8 tD1 p20، B29·D9 nB2 p1، A29-9 s02 p20) ----
    r = await AC('حسابِ کابینتِ آشپزخونه رو هم کردم:\nکابینتِ پایین ۴ میلیون و ۲۰۰ + بالا ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰.\nسینک ۲ میلیون و ۶۰۰ + شیرآلات ۱ میلیون و ۷۰۰ = ۳ میلیون و ۳۰۰.\nاز پیش‌پرداخت ۵۰۰ کارمزدِ کارت کم شد: ۳ میلیون و ۵۰۰ − ۵۰۰ = ۳ میلیون.\nلولا و دستگیره ۱۲ هزار و ۵۰۰ + ۷ هزار و ۵۰۰ = ۲۰ هزار.');
    chk(JSON.stringify(sts(r)) === '["OK","FLAG","OK","OK"]' && /۴ میلیون و ۳۰۰ هزار/.test(r.c[1].valT), 'D29-8 tD1 p20: labelled sums are read — «کابینت» ✓, «سینک + شیرآلات = ۳ میلیون و ۳۰۰» ✗ (۴ میلیون و ۳۰۰ هزار) :: ' + J(r));
    await want('کامیون ۴ میلیون و ۲۰۰ + کارگر ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰', 'OK', 'B29·D9 nB2 p1: labelled sum ✓');
    await want('بنزین ۴ میلیون و ۲۰۰ + عوارض ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰', 'OK', 'A29-9 s02 p20: labelled sum ✓');
    await want('۵ + نصفِ ۴ = ۷', 'UNCHECKED', 'neg labels: a function word after «+» is not a label — «نسنجیده», no reading invented');
    // ---- ✗ در مقیاسِ خودِ او (C29-20، D29-1؛ C103/C112) ----
    r = await AC('تقسیمِ پول بینِ بچه‌ها: ۱۰ میلیون ÷ ۳ ≈ ۳ میلیون و ۳۳۳ هزار، و اگه هفت قسمت کنم ۱۰ میلیون ÷ ۷ ≈ ۱ میلیون و ۵۰۰ هزار.');
    chk(JSON.stringify(sts(r)) === '["OK","FLAG"]' && /≈ ۱ میلیون و ۴۲۸ هزار/.test(r.c[1].valT) && !/۱٫۴(?!\d)/.test(r.c[1].valT) && /≈ ۳ میلیون و ۳۳۳ هزار/.test(r.lines[0]), 'C29-20 aC3 p35: the ✗ value is in her scale («≈ ۱ میلیون و ۴۲۸ هزار»); her «≈» is quoted as «≈» :: ' + J(r));
    // ---- C141: باقی / کم / اضافه (A29-18 s08 p11، pwA2 p12؛ D29-9 tD1 p23؛ B29·D10 nB2 p4) ----
    r = await AC('برای ۱۵ لیتر یه راهِ دیگه هم امتحان کردم: ۷ × ۲ = ۱۴، پس ۱ لیتر کم میاد. با پارچِ ۱۱، ۱۱ + ۱۱ = ۲۲، پس ۸ لیتر اضافه میاد.');
    chk(JSON.stringify(sts(r)) === '["OK","OK","OK","FLAG"]' && r.c[3].valT === '۷', 'A29-18 s08 p11 (C141): «۱ لیتر کم میاد» ✓ (15 − 14), «۸ لیتر اضافه میاد» ✗ ۷ (22 − 15) :: ' + J(r));
    r = await AC('۱۸ صفحه مونده. اگه روزی ۶ تا بخونم، ۶ و ۶ و ۶ میشه ۱۸، هیچی نمی‌مونه. اگه روزی ۴ تا بخونم، ۴ و ۴ و ۴ و ۴ میشه ۱۶، ۳ تا کم میاد.');
    // دورِ ۳۰ (DECISIONS_R30 F2، corpus F2-054): «هیچی نمی‌مونه» حالا بندِ خودش را دارد (۱۸ − ۱۸ = ۰ ✓) — جای «۳ تا کم میاد» (✗ ۲) یکی جلوتر رفت
    chk(JSON.stringify(sts(r)) === '["OK","OK","OK","FLAG"]' && r.c[3].valT === '۲', 'A29-18 pwA2 p12 (C141): the child\'s «۳ تا کم میاد» is ✗ against her own 18 (18 − 16 = 2) :: ' + J(r));
    r = await AC('کارتن‌های پارکت: ۱۸ تا کارتن داشتیم، ۱۲ تا رو باز کردیم، ۶ تا می‌مونه. ۴ + ۵ = ۹ تا کارتن برای اتاقِ خواب، و ۳ تا می‌مونه. ۲۵ ÷ ۴ = ۶، ۱ تا می‌مونه. ۲۶ ÷ ۴ = ۶ و ۳ تا می‌مونه. ۲۰ تا بسته چسب لازمه، ۱۶ تا داریم، ۴ تا کم میاد. ۳۰ تا قرنیز لازمه، ۲۵ تا داریم، ۶ تا کم میاد.');
    // دورِ ۳۰ (C191، F2-064): «… و ۳ تا می‌مونه» با کل‌های ممکنِ ۱۸ و ۱۲ که حکمِ یکسان نمی‌دهند ⇒ «؟ نسنجیده» (ردیفِ ✓ ِ دونده به حکمِ C191 کنار رفت)
    chk(JSON.stringify(sts(r)) === '["OK","OK","OK","FLAG","OK","FLAG"]' && r.c[5].valT === '۵' && r.u.some(u => /[3۳] تا می‌مونه/.test(u)), 'D29-9 tD1 p23 (C141/C108): narrative remainder ✓, «۴ + ۵ = ۹ … ۳ تا می‌مونه» keeps the runner\'s ✓, division remainders as before, «۴ تا کم میاد» ✓, «۶ تا کم میاد» ✗ ۵ :: ' + J(r));
    r = await AC('کارتن‌ها رو هم شمردیم: ۱۸ تا داشتیم و ۱۲ تا هم مامانم آورد، ۱۸ + ۱۲ = ۳۰ تا؛ مامانم کمکم کرد بشمارم. ۵۰ تا لیوان رو ۴ تا ۴ تا بسته‌بندی کردم: ۵۰ ÷ ۴ = ۱۲ بسته و ۲ تا می‌مونه. ۲۳ تا بشقاب رو ۵ تا ۵ تا: ۲۳ ÷ ۵ = ۴ بسته و ۲ تا می‌مونه. ۳۰ تا کارتن لازمه و ۲۶ تا پُرشون کردیم، پس ۴ تا کم میاد.');
    chk(JSON.stringify(sts(r)) === '["OK","OK","FLAG","OK"]' && !/گرد شده|گرد کرده/.test(r.lines.join(' ')), 'B29·D10 nB2 p4: «۱۲ بسته و ۲ تا می‌مونه» is the division\'s remainder (✓, no «گرد شده؟»); «۴ بسته و ۲ تا» ✗ (remainder 3); «۴ تا کم میاد» ✓ :: ' + J(r));
    await seq('۸ + ۷ = ۱۵ و ۳ تا می‌مونه برای داداشم', ['OK'], 'C141 «otherwise نسنجیده»: no total in her text ⇒ the clause is «نسنجیده», never glued, never ✗', r => r.u.length === 1 && /۳ تا می‌مونه|3 تا می‌مونه/.test(r.u[0]));
    await want('سرها همون ۳۵ می‌مونه ولی پاها ۲ تا کم میشه', 'SILENT', 'C136 look-alike (round28 aB4 p4): «همون ۳۵ می‌مونه» is not a remainder statement');
    await want('ماه ۲۴ می‌مونه ۴۲۸ میلیون', 'SILENT', 'C136 look-alike (round28 aD3 p4): a month number is not a remainder');
    await seq('نه! ۵ و ۵ و ۵ میشه ۱۵ دیگه، دوباره شمردم. ۳ تا هم از ۱۸ می‌مونه.', ['OK', 'OK'], 'C136 look-alike (round28 pwA2 p11): «۳ تا هم از ۱۸ می‌مونه» — 18 is the total, 18 − 15 = 3 ✓');
    // ---- A29-3 / C157: «نصفش هم میشه N» ----
    r = await AC('ظرفیتِ صف ۵ میلیون و ۴۰۰ پیامه، پس ۵ میلیون و ۴۰۰ − ۲ میلیون و ۸۸۰ = ۲ میلیون و ۵۲۰ جا می‌مونه، نصفش هم میشه ۱ میلیون و ۳۰۰.');
    chk(JSON.stringify(sts(r)) === '["OK","FLAG"]' && /۱ میلیون و ۲۶۰ هزار/.test(r.c[1].valT), 'A29-3 s06 p9 (C157): «نصفش هم میشه ۱ میلیون و ۳۰۰» is read on the preceding result ⇒ ✗ (۱ میلیون و ۲۶۰ هزار) :: ' + J(r));
    await seq('۵ میلیون و ۴۰۰ − ۲ میلیون و ۸۸۰ = ۲ میلیون و ۵۲۰، نصفش هم میشه ۱ میلیون و ۲۶۰', ['OK', 'OK'], 'neg C157: the right half is ✓');
    await want('نصفش هم میشه ۱ میلیون و ۳۰۰', 'UNCHECKED', 'C157: with no preceding result in the message ⇒ «نسنجیده», never silent');
    // ---- C161: کسرِ ناپایان ----
    const ex = await p.evaluate(() => APP.STORY.arithExactT ? APP.STORY.arithExactT('8120/3') : '');
    chk(ex === '۲۷۰۶ و ۲ سوم ≈ ۲۷۰۶٫۶۷', 'C161: «۸۱۲۰ ÷ ۳» is «۲۷۰۶ و ۲ سوم ≈ ۲۷۰۶٫۶۷» :: ' + ex);
  });

  // ================= clauses — صادرهٔ C138 (برای story و prior) =================
  await section('clauses', async () => {
    let K = await CL('یه حساب دیگه هم کردم: شب‌ها تا ۸۰۰ پیام در ثانیه میاد، پس ۸۰۰ × ۳۶۰۰ = ۲۸۸۰۰۰۰ پیام در ساعت. ظرفیتِ صف ۵ میلیون و ۴۰۰ پیامه، پس ۵ میلیون و ۴۰۰ − ۲ میلیون و ۸۸۰ = ۲ میلیون و ۵۲۰ جا می‌مونه، نصفش هم میشه ۱ میلیون و ۳۰۰. جلسه‌مون ساعت ۲:۳۰ بود و تا شب ۲ × ۳ = ۶ تا قهوه خوردم!');
    chk(K && K.mark === 'bad' && K.cl.some(x => /نصفش/.test(x.t) && x.mark === 'bad') && !/^✓/.test(K.line.split(' · ').filter(l => /نصفش/.test(l))[0] || '✓'), 'S1 A29-1 s06 (C138): the «نصفش» clause carries its own mark; the sentence is never ✓ as a whole :: ' + CLs(K));
    K = await CL('برای ۱۵ لیتر یه راهِ دیگه هم امتحان کردم: ۷ × ۲ = ۱۴، پس ۱ لیتر کم میاد. با پارچِ ۱۱، ۱۱ + ۱۱ = ۲۲، پس ۸ لیتر اضافه میاد.');
    chk(K && K.mark === 'bad' && K.cl.filter(x => x.mark === 'bad').length === 1 && K.cl.some(x => /اضافه میاد/.test(x.t) && x.mark === 'bad'), 'S1 A29-1 s08 (C138): «پس ۸ لیتر اضافه میاد» is its own ✗ clause :: ' + CLs(K));
    K = await CL('۱۸ صفحه مونده. اگه روزی ۶ تا بخونم، ۶ و ۶ و ۶ میشه ۱۸، هیچی نمی‌مونه. اگه روزی ۴ تا بخونم، ۴ و ۴ و ۴ و ۴ میشه ۱۶، ۳ تا کم میاد.');
    chk(K && K.mark === 'bad' && K.cl.some(x => /۳ تا کم میاد/.test(x.t) && x.mark === 'bad'), 'S1 A29-1 pwA2 p12 (C138): the child\'s «۳ تا کم میاد» is ✗ on its own clause :: ' + CLs(K));
    K = await CL('روزی ۴ صفحه: ۴ و ۴ و ۴ و ۴ میشه ۱۶، ۲ تا کم میاد');
    chk(K && K.mark === 'part' && K.cl.some(x => x.mark === 'unread' && /کم میاد/.test(x.t)) && /؟ نسنجیده/.test(K.line), 'C138: a read ✓ clause next to an unread one ⇒ «part», the unread clause «؟ نسنجیده» :: ' + CLs(K));
    K = await CL('۴ میلیون و ۲۰۰ + ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰');
    chk(K && K.mark === 'ok' && K.cl.length === 1, 'C138 look-alike (bank #59): only read clauses ⇒ ✓ as a whole :: ' + CLs(K));
    const ut = 'خودم حساب کردم: ۷ × ۲ = ۱۴، پس ۱ لیتر کم میاد. بعد ۱۱ + ۱۱ = ۲۲.';
    K = await CL('بعد ۱۱ + ۱۱ = ۲۲.', ut);
    chk(K && K.mark === 'ok' && K.cl.length === 1, 'C138 with ctx: a quote inside her message is judged in the message and its clauses are in the quote\'s offsets :: ' + CLs(K));
  });

  // ================= block — آنچه مربی در همان نوبت می‌بیند =================
  await section('block', async () => {
    await wipe(); await fresh();
    let u = await turn('سلام! امروز با تیله‌ها بازی کردیم. ۱۸ تا تیله داشتیم، ۱۵ تا دادیم به دوستم: ۱۸ − ۱۵ = ۳، ۳ تا می‌مونه.', 'باشه.', [csn({})]);
    let B = blockOf(u.user); chk(!/^- .*✗/m.test(B.replace(/نه ✓ و نه ✗/g, '')) && !/۱۵ − ۳/.test(B), 'S1 C29-1 in the prompt: no ✗ reaches the coach (and so not the child) :: ' + B);
    await wipe(); await fresh();
    u = await turn('سودِ سپرده ماهی ۲ و ۵ دهم درصده؛ ۴ ماه میشه ۲ و ۵ دهم × ۴ = ۱۰ درصد.', 'باشه.', [csn({})]);
    B = blockOf(u.user); chk(!/۱۰۰۰٪/.test(B) && !/✗ «۲ و ۵ دهم/.test(B), 'S1 C29-2 in the prompt: no «۱۰۰۰٪» ✗ :: ' + B);
    await wipe(); await fresh();
    u = await turn('گام ۳: هر مترمربع ۸۵۰ هزار تومنه، پس ۲۲ × ۸۵۰ هزار = ۱۸ میلیون و ۷۰۰ تومن.', 'باشه.', [csn({})]);
    B = blockOf(u.user); chk(!/۱۸٫۷/.test(B) && !/✗ «۲۲/.test(B), 'S1 D29-1 in the prompt: no false ✗ «۱۸٫۷» :: ' + B);
    /* C156: کلِ لازم از صورتِ ثبت‌شدهٔ مسئله */
    await wipe(); await fresh();
    await p.evaluate(() => { const s = __cur(); s.coach = Object.assign(s.coach || {}, { stmt: 'با یه پارچِ ۱۱ لیتری و یه پارچِ ۷ لیتری دقیقاً ۱۵ لیتر آب بردار.' }); });
    const r39 = await AC('۱۱ + ۱۱ = ۲۲ لیتر، پس ۹ لیتر اضافه میاد');
    chk(JSON.stringify(sts(r39)) === '["OK","FLAG"]' && r39.c[1].valT === '۷', 'C156 (bank #39 variant): the target 15 from the recorded statement judges «۹ لیتر اضافه میاد» ✗ ۷ :: ' + J(r39));
  });

  // ================= bank — همهٔ ورودی‌های R1 در VARIANTS_R29 =================
  await section('bank', async () => {
    const E = BANK, R1 = E.map((e, i) => i).filter(i => /^R1\./.test(E[i].rc));
    /* انتظارِ هر ورودی از متنِ expect ِ خودش (هیچ ورودی ویرایش نمی‌شود)؛ آنجا که یک حکمِ پس از بانک (C154–C159) راه را روشن کرده، در nc نوشته می‌شود */
    const X = {
      1: ['OK'], 3: ['OK'], 4: ['OK'], 5: ['OK'], 6: ['FLAG', r => /۲ میلیون و ۸۰۰ هزار/.test(r.c[0].valT) && /۲ میلیون و ۳۰۰ هزار و ۵۰۰/.test(r.c[0].valT)],
      7: ['OK'], 8: ['OK'], 9: ['OK'], 10: ['OK'], 11: ['FLAG', r => /۹ میلیون/.test(r.c[0].valT) && /۶ میلیون و ۳ هزار/.test(r.c[0].valT)], 12: ['OK'], 13: ['OK'], 14: ['FLAG', r => /۵ میلیون و ۲۰۰ هزار/.test(r.c[0].valT)], 15: ['OK'],
      16: ['NOT-FLAG'], 17: ['FLAG', r => /≈ ۲ میلیون و ۸۵۷ هزار/.test(r.c[0].valT)], 18: ['FLAG', r => /۲۸ هزار و ۵۰۰/.test(r.c[0].valT)], 19: ['FLAG', r => /۳ میلیون و ۷۵۰ هزار/.test(r.c[0].valT)],
      20: ['SEQ', ['OK', 'OK']], 21: ['SEQ', ['OK', 'OK']], 22: ['SEQ', ['OK', 'OK']], 23: ['SEQ', ['OK', 'OK']], 24: ['SEQ', ['OK', 'FLAG']], 25: ['SEQ', ['FLAG']], 26: ['SEQ', ['OK']], 27: ['SEQ', ['OK', 'FLAG']],
      28: ['SEQU', ['OK']], 29: ['SEQ', ['OK', 'FLAG']], 30: ['OK'], 31: ['FLAG', r => !r.c.some(c => c.st === 'ask')], 32: ['OK'], 33: ['OK'], 34: ['OK'], 35: ['FLAG', r => /۱۵٪/.test(r.c[0].valT) && /۱۵۰۰٪/.test(r.c[0].valT)],
      36: ['ASK'], 37: ['FLAG'], 38: ['CL', K => K.mark === 'bad' && K.cl.length === 2 && K.cl[0].mark === 'ok' && K.cl[1].mark === 'bad'], 39: ['CL', K => K.cl.length === 2 && K.cl[0].mark === 'ok' && K.cl[1].mark === 'unread' && K.mark !== 'ok'],
      40: ['SILENT'], 41: ['SILENT'], 42: ['SILENT'], 43: ['SILENT'], 44: ['OK', r => /≈/.test(r.lines[0])], 45: ['OK'], 46: ['NOT-FLAG'], 47: ['OKS'], 48: ['OKS'], 49: ['OK'], 50: ['OK'], 51: ['OK'], 52: ['OK'], 53: ['OK'],
      54: ['OK'], 55: ['OK'], 56: ['OK'], 57: ['OK'], 58: ['SILENT'], 59: ['CL', K => K.mark === 'ok' && K.cl.length === 1] };
    info.nc[7] = info.nc[8] = 'C154/C158 (after the bank): the bare «۹۰۰/۴۰۰ تومن» is read in both scales, thousands first — 2.9 M − 0.9 M = 2 M fits, so ✓ under the thousands reading (the bank\'s «units reading named» predates C154); verdict OK asserted';
    info.nc[46] = 'C154 decides the open naming: ✓ under the thousands reading (asserted NOT-FLAG)';
    for (const i of R1) {
      const e = E[i], n = i + 1, x = X[n];
      if (n === 2) {   // گفت‌وگوی واقعی: ✓، سپس «دوباره بسنج» — بی «حکم ماند»
        await wipe(); await fresh(); await turn('۲۴ × ۶۵۰ هزار = ۱۵ میلیون و ۶۰۰ تومن', '✓', [csn({})]); const u = await turn('این رو دوباره بسنج، مطمئنم درسته', 'باشه.', [csn({})]);
        const ok = !/حکم ماند/.test(head(u.user)) && !/✗/.test(blockOf(u.user).replace(/نه ✓ و نه ✗/g, '')); info.bank[i] = ok; chk(ok, 'bank#2 the re-check never keeps a false ✗ :: ' + head(u.user).slice(0, 600)); continue; }
      if (!x) { info.bank[i] = false; chk(false, 'bank#' + n + ' has no expectation in this test'); continue; }
      const t = e.text.replace(/^U:\s*/, '');
      let ok = false, r = null, K = null;
      if (x[0] === 'CL') { K = await CL(t); ok = !!K && x[1](K); }
      else { r = await AC(t); const v = verdict(r), S = sts(r);
        if (x[0] === 'OK') ok = S.length > 0 && S.every(s => s === 'OK') && !r.u.length;
        else if (x[0] === 'OKS') ok = S.length > 0 && S.every(s => s === 'OK');   // #47/#48: the sum ✓; the remainder clause may be «نسنجیده» (C141), never ✗/glued
        else if (x[0] === 'FLAG') ok = S.includes('FLAG');
        else if (x[0] === 'ASK') ok = S.length === 1 && S[0] === 'ASK';
        else if (x[0] === 'NOT-FLAG') ok = v === 'OK' || v === 'UNCHECKED' || v === 'OK+UNCHECKED';
        else if (x[0] === 'SILENT') ok = v === 'SILENT';
        else if (x[0] === 'SEQ') ok = JSON.stringify(S) === JSON.stringify(x[1]) && !r.u.length;
        else if (x[0] === 'SEQU') ok = JSON.stringify(S) === JSON.stringify(x[1]) && r.u.length === 1;
        if (ok && x[0] !== 'SEQ' && x[0] !== 'SEQU' && typeof x[1] === 'function') ok = !!x[1](r); }
      info.bank[i] = !!ok; chk(ok, 'bank#' + n + ' [' + e.kind + '] «' + t.slice(0, 90) + '» → ' + e.expect.slice(0, 120) + ' :: ' + (r ? verdict(r) + ' ' + J(r) : CLs(K)));
    }
    if (!process.env.ONLY) { const missing = R1.filter(i => info.bank[i] === undefined); chk(!missing.length, 'bank: every R1 entry is tested :: ' + JSON.stringify(missing.map(i => i + 1))); }
  });

  const nb = Object.keys(info.bank).length, nbOk = Object.values(info.bank).filter(Boolean).length;
  console.log('bank R1 (R29): ' + nbOk + '/' + nb + ' pass; nc: ' + Object.keys(info.nc).length + ' ' + JSON.stringify(info.nc));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
