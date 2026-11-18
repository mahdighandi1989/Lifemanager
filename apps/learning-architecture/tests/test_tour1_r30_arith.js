// تورِ پولیا (دستهٔ ۱، دورِ ۳۰، سهمِ «arith» — ۲۰۲۶-۱۱-۱۸) — DECISIONS_R30: S1 C30-7 (C180)، F2 (C30-13، D30-5، A30-2، A30-9، B30·D11، D26-24، U26، A30-20)
//  c180     S1 C30-7: کلِ بندِ باقی/کم/اضافه فقط از متنِ خودِ او یا صورتِ ثبت‌شدهٔ «مسئلهٔ کانونِ همین نوبت» — نه صورتِ مسئلهٔ دیگر، نه حسابِ درونِ صورت، نه نرخِ «هر بسته ۱۲ تا»
//           (جمله‌های خودِ دوندهٔ C ِ دورِ ۳۰: aC1 p22، p33؛ مثبت: p32؛ هم‌شکل‌های C136 از A s06 p10/p11، B nB3 p6–p7، D tD3 s4/s5/s9، C aC1 p21/p32/p37)
//  corpus   C178: همهٔ ورودی‌های tests/variants/CORPUS_R30_F2.json (ویرایش‌نشده؛ ساختهٔ عاملِ مستقل) — انتظارِ هر ورودی از متنِ «expected» ِ خودش به نشانِ بند برگردانده شده
//           (CORPUS_EXP پایین)؛ ورودی‌ای که حکمش بیرون از موتورِ حساب است (دفترِ گام، 🎯، تاریخ) یا «expected»: None دارد جدا گزارش می‌شود، هرگز بی‌صدا رد نمی‌شود
//  clock    هیچ انتظاری به تاریخ بسته نیست. LLA_FILE = ساختِ دیگر (قرمزِ نخست: ساختِ BASE30)؛ ONLY=c180,corpus,…
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));

(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__noNav = true;
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    /* سشنِ تازه با صورتِ مسئلهٔ گفت‌وگو (coach.stmt/pk) و، اگر خواسته شد، مسئلهٔ زندهٔ بازِ بسته به سشن */
    window.__ctx = (o) => { __wipe(); APP.go('home'); const s = APP.ASSIST.newSession(); s.coach = s.coach || {};
      if (o && o.stmt) { s.coach.stmt = o.stmt; s.coach.pk = o.pk || 'c:1'; }
      if (o && o.live) { const pid = APP.liveCreate('مسئلهٔ آزمون', o.live, 'find', { by: 'user', sess: s.id }).p.id; APP.liveBindSession(pid, APP.ASSIST.cur(), { force: true }); }
      return s.id; };
    window.__ac = (t, ctx) => { const ck = APP.STORY.arithChk(t, ctx || undefined); const K = APP.STORY.arithClauses(t, ctx || undefined);
      return { c: ck.map(c => ({ expr: c.expr, said: String(c.saidT || c.said), st: c.ask ? 'ask' : c.ok ? 'ok' : 'flag', kind: c.kind || '', valT: c.valT || '' })), u: (ck.unread || []).map(u => u.text),
        lines: APP.STORY.arithLines(ck), cl: K.clauses.filter(x => x.claim).map(x => ({ t: x.t, mark: x.mark, line: x.line })), mark: K.mark }; };
  });
  const CTX = (o) => p.evaluate((o) => __ctx(o), o || {});
  const AC = (t, ctx) => p.evaluate(([t, ctx]) => __ac(t, ctx), [t, ctx || '']);
  const J = (r) => JSON.stringify(r.lines) + ' clauses=' + JSON.stringify(r.cl.map(x => [x.mark, x.t]));
  /* بندی که متنش re را دارد با نشانِ mk (ok | bad | ask | unread) */
  const clMark = (r, re) => { const x = r.cl.filter(c => re.test(c.t)); return x.length ? x.map(c => c.mark).join('+') : 'NONE'; };
  const noLine = (r, re) => !r.lines.some(l => re.test(l));

  // ================= c180 — S1 C30-7 =================
  await section('c180', async () => {
    const DAFTAR = '«سه تا دفتر داریم، هر کدوم ۴۰۰ تومن. روی هم چند تومن میشه؟» داداشم حساب کرد ۳ × ۴۰۰ = ۱۲۰۰.';
    const PACKS = 'می‌خوایم بستهٔ تیله بخریم. فروشنده گفت ۱۲ درصد تخفیف میده. هر بسته ۱۲ تا تیله داره. ۵ تا بسته چند تا تیله میشه؟';
    // ---- aC1 p22: صورتِ مسئلهٔ دیگر (حسابِ برادر) هرگز کلِ «۲ تا می‌مونه» نیست ⇒ ؟ نسنجیده، هرگز ✗ «۱۲۰۰ − ۱۴» ----
    await CTX({ stmt: DAFTAR });
    let r = await AC('بعدش ۸ + ۶ = ۱۴ و ۲ تا می‌مونه برای داداشم.');
    chk(!r.lines.some(l => /۱۲۰۰|^✗/.test(l)) && r.lines.some(l => /^✓ «۸ \+ ۶ = ۱۴»/.test(l)) && r.lines.some(l => /^— حسابِ «۲ تا می‌مونه» را صفحه نسنجیده/.test(l)),
      'S1 C30-7 aC1 p22 (C180): «۸ + ۶ = ۱۴» ✓ and «۲ تا می‌مونه» «؟ نسنجیده» — never ✗ «۱۲۰۰ − ۱۴» :: ' + J(r));
    chk(clMark(r, /۲ تا می‌مونه/) === 'unread' && clMark(r, /۸ \+ ۶ = ۱۴/) === 'ok', 'C30-7 p22 clauses: the sum ✓ and the remainder «؟ نسنجیده», each its own clause (never one «؟» over the right sum) :: ' + J(r));
    // ---- aC1 p33: نرخِ «هر بسته ۱۲ تا» ِ صورت کلِ «۸ تا اضافه میاد» نیست ⇒ ؟ نسنجیده، هرگز ✓ «۲۰ − ۱۲» ----
    await CTX({ stmt: PACKS });
    r = await AC('۵ تا جعبه آب‌نبات داریم، هر کدوم ۴ تا: ۵ × ۴ = ۲۰ تا، پس ۸ تا اضافه میاد.');
    chk(!r.lines.some(l => /۲۰ − ۱۲/.test(l)) && clMark(r, /۸ تا اضافه میاد/) === 'unread' && clMark(r, /۵ × ۴ = ۲۰/) === 'ok', 'S1 C30-7 aC1 p33 (C180): «۸ تا اضافه میاد» «؟ نسنجیده», never ✓ «۲۰ − ۱۲» :: ' + J(r));
    // ---- مثبتِ C180 (aC1 p32): کل در همان جمله ⇒ ✗ ۸ ----
    r = await AC('سلام! امروز ۶ تا بسته شکلات خریدیم، هر بسته ۷ تا: ۶ × ۷ = ۴۲، از ۵۰ تا ۷ تا می‌مونه.');
    chk(clMark(r, /از ۵۰ تا ۷ تا می‌مونه/) === 'bad' && r.lines.some(l => /^✗ «۵۰ − ۴۲» را «۷ تا می‌مونه» نوشته — حسابِ صفحه: ۸/.test(l)), 'C180 positive aC1 p32: total 50 in the sentence ⇒ ✗ 8 :: ' + J(r));
    // ---- صورتِ ثبت‌شدهٔ مسئلهٔ زندهٔ بازِ همین سشن (C156) هنوز کل است — صورتِ کهنهٔ coach.stmt ِ مسئلهٔ دیگر نه ----
    await CTX({ stmt: DAFTAR, live: '۵۰ تا لایسنس داریم و می‌خوام ببینم برای سرورها کافیه یا نه.' });
    r = await AC('۶ × ۷ = ۴۲، ۷ تا می‌مونه');
    chk(r.lines.some(l => /^✗ «۵۰ − ۴۲» را «۷ تا می‌مونه» نوشته/.test(l)), 'C180/C156: the live problem\'s recorded statement (50) is the total ⇒ ✗ 8 :: ' + J(r));
    await CTX({ stmt: '۵۰ تا لایسنس داریم و می‌خوام ببینم برای سرورها کافیه یا نه.' });
    r = await AC('۶ × ۷ = ۴۲، ۸ تا می‌مونه');
    chk(r.lines.some(l => /^✓ «۵۰ − ۴۲ = ۸ تا می‌مونه»/.test(l)), 'C156 kept: the focus chat problem\'s statement (50) ⇒ ✓ 8 :: ' + J(r));
    // ---- C136 هم‌شکل‌ها: حکمی که دونده درست دانست نمی‌ماند عوض شود (بی صورت) ----
    await CTX({});
    const keep = [
      ['۷ تا سرور داریم، هر کدوم ۶ تا worker، ۶ × ۷ = ۴۲ worker، از ۵۰ تا لایسنسی که داریم ۷ تا می‌مونه.', /از ۵۰ تا لایسنسی که داریم ۷ تا می‌مونه/, 'bad', 'A s06 p10'],
      ['سلام! امروز با تیله‌ها بازی کردیم. ۱۸ تا تیله داشتیم، ۱۵ تا دادیم به دوستم: ۱۸ − ۱۵ = ۳، ۳ تا می‌مونه.', /۳ تا می‌مونه/, 'ok', 'C aC1 p21'],
      ['۲۰ تا بسته چسب لازمه، ۱۶ تا داریم، ۴ تا کم میاد. ۳۰ تا قرنیز لازمه، ۲۵ تا داریم، ۶ تا کم میاد.', /۶ تا کم میاد/, 'bad', 'D tD1 p23'],
      ['مونده ۴۸ − ۳۰ = ۱۸. روزی ۵ تا: ۵ و ۵ و ۵ میشه ۱۵، ۳ تا می‌مونه، پس ۴ روز.', /۳ تا می‌مونه/, 'ok', 'A pwA2 p10'],
    ];
    for (const [t, re, mk, tag] of keep) { r = await AC(t); chk(clMark(r, re) === mk, 'C136 look-alike ' + tag + ' keeps «' + mk + '» :: ' + J(r)); }
  });

  console.log('info: ' + JSON.stringify(info));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
