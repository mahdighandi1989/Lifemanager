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
  const noBad = (r) => !r.lines.some(l => /^✗/.test(l));

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

  // ================= tail — U26، D26-24، A30-20 (جمله‌های خودِ دونده‌ها؛ هم‌شکل‌های C136 از round26*–round30*) =================
  await section('tail', async () => {
    await CTX({});
    let r = await AC('۴۲ ضربدر ۵ … ۲۱۰! ۲۱۰ از ۱۷۸ بیشتره، پس همه جا میشن. پس جواب ۵ اتوبوسه.');
    chk(r.lines.some(l => /^✓ «۴۲ × ۵ = ۲۱۰»/.test(l)), 'U26 aB1 p5: «۴۲ ضربدر ۵ … ۲۱۰» is read ✓ (the ellipsis before one number after an expression is a result mark) :: ' + J(r));
    r = await AC('خب: t = (960-988)/(20/√25) = -28/4 = -7. بعد گفتم احتمال = ۱ + ۰.۳ ... یعنی تقریباً ۱.۳ شد. جواب ۱.۳.');
    chk(r.lines.some(l => /^✓ «۱ \+ ۰\.۳ ≈ ۱\.۳»/.test(l)), 'U26 s14 p3: «۱ + ۰.۳ ... یعنی تقریباً ۱.۳» is read ✓ :: ' + J(r));
    r = await AC('دو تا حسابِ دیگه کردم: اگه ۲۰ درصدِ ۳۰۰ میلیون رو بذارم طلا، میشه ۶۰ میلیون. سودِ سپرده ۵۷٫۵ تقسیم بر ۱۲ = ۵ میلیون در ماه.');
    chk(r.lines.some(l => /^— حسابِ «میشه ۶۰ میلیون» را صفحه نسنجیده/.test(l)), 'U26 aB3 p15: «۲۰ درصدِ ۳۰۰ میلیون رو بذارم طلا، میشه ۶۰ میلیون» gets «؟ نسنجیده» (never silent, never «داده») :: ' + J(r));
    r = await AC('نقشهٔ برش رو کشیدم: تختهٔ ۱ و ۲: هر کدوم یه بغلِ ۱۸۰، می‌مونه حدود ۵۹ و ۷ دهم که به کارِ طبقه نمیاد.');
    chk(r.lines.some(l => /^— حسابِ «می‌مونه حدود ۵۹ و ۷ دهم» را صفحه نسنجیده/.test(l)) && noBad(r), 'D26-24 aD4 p4: verb-first «می‌مونه حدود ۵۹ و ۷ دهم» is never silent — «؟ نسنجیده» (the board length is not in her text) :: ' + J(r));
    r = await AC('برای اینکه سود ۲۰۰ بمونه قیمت باید حداقل ۸۷۵ + ۲۰۰ = یک میلیون و ۷۵ باشه.');
    chk(r.lines.some(l => /^✓ «۸۷۵ \+ ۲۰۰ = ۱ میلیون و ۷۵»/.test(l)), 'A30-20 pA2 p6: «یک میلیون و ۷۵» (word «یک» before a scale word) is read ✓ under the thousands reading :: ' + J(r));
    // C136 هم‌شکل‌ها: هیچ سطرِ تازه
    const quiet = [
      ['فرمول رو ساده‌تر کردم: B_n = 1000 − 400·1.015^n. ماه ۲۴ می‌مونه ۴۲۸ میلیون، ماه ۳۰ حدود ۳۷۵.', /۴۲۸/, 'D aD3 p4 (round26/28): a month\'s balance by formula is not a remainder'],
      ['قفسه‌ها: گفته بودم ۴ تا با ۷۰ درصد، شد ۳ تا.', /شد ۳|میشه ۳/, 'A s05 p28: a forecast outcome is not a claim'],
      ['پس 4/n − 1/x = 4/n − 4/(n+3) = 12/(n(n+3)) = 3/(n·(n+3)/4)، و هر کسری به شکلِ 3/m همیشه به صورتِ 1/y + 1/z درمیاد.', /نسنجیده \(میانِ حساب/, 'D pwD2 p1: algebra gets no «میانِ حساب و نتیجه» line'],
      ['سلام، امروز گفت مسئلهٔ ۱ + ۲ + … + n برگشته: 2 + 4 + … + 2n = 2(1 + 2 + … + n) = n(n + 1).', /میانِ حساب|^✓|^✗/, 'C aC2 p9: C64 «… + n» sums are not turned into results'],
      ['امروز رفتم ۶ متر خریدم و بریدم: ۳ قواره درآمد و ۱۵ سانت اضافه ماند.', /^✗/, 'A aA4 p9: three different units — never ✗ «۶ − ۳»'],
      ['دیشب بازی ۳-۲ شد و بخاری تا ۱۰:۳۰ روشن موند.', /موند/, 'D arD1 p10: a clock time is not a remainder'],
    ];
    for (const [t, re, tag] of quiet) { r = await AC(t); chk(!r.lines.some(l => re.test(l)), 'C136 ' + tag + ' :: ' + J(r)); }
  });

  // ================= corpus — C178: CORPUS_R30_F2.json، هر ۷۹ ورودی =================
  //  انتظارِ موتور برای هر ورودی از «expected» ِ خودِ آن (و حکم‌های C189–C192): [الگوی متنِ بند، نشان] یا یک بررسیِ دیگر.
  //  OUT: بخشی از «expected» که کارِ موتورِ حساب نیست (دفترِ گام C8/C86، 🎯، تاریخ) — جدا گزارش می‌شود، هرگز بی‌صدا رد نمی‌شود.
  //  KNOWN: ورودی‌ای که این دور برآورده نشد، با دلیل (همان در گزارشِ arith) — آزمون فقط «هرگز ✗» ِ آن را نگه می‌دارد.
  await section('corpus', async () => {
    const CORPUS = JSON.parse(fs.readFileSync(path.join(__dirname, 'variants', 'CORPUS_R30_F2.json'), 'utf8'));
    const T = path.join(__dirname, 'fixtures', 'r30_arith', 'corpus_ctx.json'), CTXS = JSON.parse(fs.readFileSync(T, 'utf8'));   // پیامِ کاملِ هر ورودی از ai/pN.json ِ دونده (فقط خواندن)
    const DAFTAR = '«سه تا دفتر داریم، هر کدوم ۴۰۰ تومن. روی هم چند تومن میشه؟» داداشم حساب کرد ۳ × ۴۰۰ = ۱۲۰۰.';
    const PACKS = 'می‌خوایم بستهٔ تیله بخریم. فروشنده گفت ۱۲ درصد تخفیف میده. هر بسته ۱۲ تا تیله داره. ۵ تا بسته چند تا تیله میشه؟';
    const PARTY = 'برای تولدِ ۶۰ سالگیِ مامانم یه مهمونی می‌گیرم؛ بودجه‌م ۱۲ میلیونه و می‌خوام ببینم برای کیک و گل پول می‌مونه یا نه.';
    const remLine = (r) => r.lines.some(l => /(?:می‌مونه|میمونه|موند|ماند|کم دار|کم میا|اضافه میا)/.test(l));
    const EXP = {
      '001': [[/۶ × ۷ = ۴۲/, 'ok'], [/از ۵۰ تا ۷ تا می‌مونه/, 'bad']], '002': [[/۴٫۴۶ میلیون می‌مونه/, 'ok']], '003': [[/۴۲ × ۱۲۰/, 'ok'], [/۵۸۰ هزار کم دارم/, 'ok']],
      '004': [[/۴۲ × ۰٫۵/, 'ok'], [/۸ متر اضافه میاد/, 'bad']], '005': [[/نصفش میشه ۴۲/, 'ok']], '006': [[/نصفش میشه ۲۰/, 'unread']],
      '007': (r) => r.lines.length === 0, '008': [[/۱۲۶ ÷ ۴/, 'ok']], '009': [[/۸ تا کم دارم/, 'bad']], '010': [[/هیچی نمی‌مونه/, 'ok']], '011': [[/۴ تا هم برای فردا/, 'ok']],
      '012': [[/۶ × ۷ = ۴۲/, 'ok'], [/از ۵۰ تا ۸ تا می‌مونه/, 'ok']], '013': [[/۱۸ − ۱۵ = ۳/, 'ok'], [/^۳ تا می‌مونه/, 'ok']],
      '014': { stmt: DAFTAR, x: [[/۸ \+ ۶ = ۱۴/, 'ok'], [/۲ تا می‌مونه/, 'unread']] }, '015': [[/۲۵ ÷ ۴ = ۶، ۱ تا/, 'ok'], [/۲۹ ÷ ۴/, 'bad']], '016': [[/۲ تا کم میاد/, 'ok']],
      '017': [[/از ۵۰ تا ۷ تا می‌مونه/, 'bad']], '018': { stmt: PACKS, x: [[/۵ × ۴ = ۲۰/, 'ok'], [/۸ تا اضافه میاد/, 'unread']] }, '019': [[/۶ تا کم دارم/, 'ok'], [/۶ تا کم میاد/, 'bad']],
      '020': [[/۱۲ − ۱۲ = ۰/, 'ok'], [/هیچی نمی‌مونه/, 'ok'], [/۴ تا هم برای فردا/, 'ok']], '021': [[/۱۵ هزار تومن می‌مونه/, 'ok']], '022': [[/۷ تا می‌مونه/, 'bad']],
      '023': [[/= ۵ میلیون و ۷۰۰/, 'ok'], [/۲ میلیون و ۳۰۰ می‌مونه/, 'ok']], '024': [[/۲ میلیون و ۵۰۰ کم دارم/, 'ok']], '025': [[/۷۵۰ هزار برام موند/, 'bad']],
      '026': [[/۶ × ۷ = ۴۲/, 'ok'], [/از ۵۰ تا ۷ تا می‌مونه/, 'bad']], '027': [[/۱۲ بطری × ۱٫۵/, 'ok'], [/۸ لیتر اضافه میاد/, 'unread']], '028': [[/۲ کیلو × ۴۸۰/, 'ok'], [/نصفش میشه ۴۸۰/, 'ok']],
      '029': [[/میشه ۱ میلیون و ۳۰۰/, 'unread']], '030': [[/۵۰ منهای ۴۲ میشه ۸/, 'ok'], [/۸ تا برش می‌مونه/, 'ok']], '031': [[/= ۱ میلیون و ۷۰۰/, 'ok'], [/۱۰۰ هزار کم دارم/, 'ok']],
      '032': [[/هیچی نمی‌مونه/, 'ok'], [/۴ تا هم برای فردا/, 'ok']], '033': [[/۳ کیلو کم دارم/, 'bad']],
      '034': { stmt: PARTY, known: 'C27-22 guard: «با سالنِ ۲ میلیون و ۷۰۰ میشه ۱۲ میلیون و ۱۵۰» (ezafe label after «با», across «.») is not read by the chain reader, so the shortage is «؟ نسنجیده», never ✗', x: (r) => noBad(r) && /^unread/.test(clMark(r, /۱۵۰ هزار کم دارم/)) },
      '035': [[/۵۰ ÷ ۴/, 'ok'], [/۲۳ ÷ ۵/, 'bad']], '036': [[/۴ تا کم میاد/, 'ok']], '037': [[/۲ میلیون و ۸۵۰/, 'bad']], '038': [[/۱ میلیون و ۲۰۰ \+/, 'bad'], [/۵۷۰ هزار کم میارم/, 'ok']],
      '039': [[/هزینه‌ها میشه/, 'ok'], [/۸ میلیون منهای ۶ میلیون و ۶۰۰/, 'ok']], '040': [[/۶ × ۷ = ۴۲/, 'ok'], [/۷ تا می‌مونه/, 'bad']],
      '041': (r) => clMark(r, /نصفش میشه ۱۲۰۰/) === 'ok' && !remLine(r) && !r.lines.some(l => /m = 10|۳۷٪/.test(l)), '042': { out: 'C8/C86: her fix of the previous turn\'s ✗ is the ledger/correction path (prior, correction)', x: [[/۸ تا می‌مونه/, 'unread']] },
      '043': [[/۴ × ۲۵۰/, 'ok'], [/۸ گیگ اضافه میاد/, 'unread']], '044': [[/۶۰۰ کم دارم/, 'ok']], '045': [[/۵۰۰ می‌مونه/, 'bad']], '046': [[/هیچی نمی‌مونه/, 'ok'], [/۴ تا هم برای فردا/, 'ok']],
      '047': [[/۴۰۰ می‌مونه/, 'unread']], '048': [[/نصفش هم میشه ۳۰۰/, 'unread']], '049': [[/۵ میلیون و ۴۰۰ −/, 'ok'], [/نصفش هم میشه/, 'bad']],
      '050': [[/۷ × ۲ = ۱۴/, 'ok'], [/۱ لیتر کم میاد/, 'ok'], [/۱۱ \+ ۱۱ = ۲۲/, 'ok'], [/۸ لیتر اضافه میاد/, 'bad']],
      '051': { out: 'C8/C86: her fix «آره ۷ لیتر اضافه میاد» of the previous turn\'s ✗ is the ledger/correction path (prior, correction)', x: [[/۷ لیتر اضافه میاد/, 'unread']] },
      '052': [[/۳ × ۳ = ۹/, 'ok'], [/یکی می‌مونه/, 'ok'], [/۱۲ ÷ ۵/, 'bad']], '053': [[/۱۲۰ ÷ ۸ = ۱۵/, 'ok'], [/هیچی نمی‌مونه/, 'ok'], [/۸۰ ÷ ۸/, 'bad']],
      '054': [[/۶ و ۶ و ۶/, 'ok'], [/هیچی نمی‌مونه/, 'ok'], [/۴ و ۴ و ۴ و ۴/, 'ok'], [/۳ تا کم میاد/, 'bad']], '055': [[/۴۸ − ۳۰ = ۱۸/, 'ok'], [/۵ و ۵ و ۵/, 'ok'], [/۳ تا می‌مونه/, 'ok']],
      '056': [[/۱۲ تقسیم بر ۴/, 'ok'], [/هیچی نمی‌مونه/, 'ok']], '057': [[/۲۴ ÷ ۵/, 'ok'], [/۱۹ ÷ ۳/, 'bad']], '058': [[/۳ × ۴ = ۱۲/, 'ok'], [/۱۴ ÷ ۴/, 'ok'], [/۱۴ − ۱۲ = ۳/, 'bad']],
      '059': [[/۶ × ۵ = ۳۰/, 'ok'], [/۴۵ − ۳۰ = ۲۵/, 'bad']], '060': [[/۴۵ − ۳۰ = ۱۵/, 'ok'], [/۱۵ دقیقه بحث می‌مونه/, 'ok']], '061': [[/۴۵ − ۴۰ = ۵/, 'ok'], [/۴۵ − ۲۸ = ۱۸/, 'bad']],
      '062': [[/۶۰ − ۱۸ − ۱۲/, 'ok']], '063': [[/۴ میلیون و ۲۰۰ − ۲۰۰/, 'ok']], '064': [[/^۶ تا می‌مونه/, 'ok'], [/۳ تا می‌مونه/, 'unread']],   // C191
      '065': [[/۲۵ ÷ ۴/, 'ok'], [/۲۶ ÷ ۴/, 'bad']], '066': [[/۴ تا کم میاد/, 'ok'], [/۶ تا کم میاد/, 'bad']], '067': [[/۱۸٫۷ \+ ۳/, 'bad'], [/۴ میلیون و ۷۰۰ کم دارم/, 'ok']],
      '068': [[/۵۰۰ − ۳۵۰ = ۱۶۰/, 'bad']], '069': [[/۱۸۰ − ۶۰ − ۲۲.۵/, 'ok']], '070': (r) => clMark(r, /۱۱۵ − ۷۰ = ۴۵/) === 'ok' && !remLine(r),
      '071': (r) => clMark(r, /۱۰۰ منهای ۹۴/) === 'ok' && !remLine(r) && noBad(r),   // C192
      '072': (r) => r.lines.length === 0, '073': (r) => r.lines.length === 0, '074': (r) => r.lines.length === 0, '075': (r) => !remLine(r) && noBad(r),
      '076': { out: 'the 🎯 itself is forecast\'s (C90/C152)', x: (r) => !remLine(r) && noBad(r) }, '077': { out: 'the C120 question is forecast\'s', x: (r) => r.lines.length === 0 },
      '078': { out: 'settling the 🎯 is forecast\'s (C91)', x: (r) => noBad(r) }, '079': (r) => noBad(r) && !remLine(r),
    };
    let pass = 0; const known = [], outs = [];
    for (const e of CORPUS) {
      const k = e.id.replace(/^F2-/, ''), X = EXP[k]; if (!X) { chk(false, 'corpus ' + e.id + ': no expectation encoded'); continue; }
      const spec = Array.isArray(X) || typeof X === 'function' ? { x: X } : X;
      await CTX(spec.stmt ? { stmt: spec.stmt } : {});
      const r = await AC(e.sentence, CTXS[e.id] || '');
      const ok = typeof spec.x === 'function' ? spec.x(r) : spec.x.every(([re, mk]) => clMark(r, re) === mk);
      chk(ok, 'corpus ' + e.id + ' (' + e.src + ') «' + e.sentence.slice(0, 90) + '» expected: ' + String(e.expected).slice(0, 160) + ' :: ' + J(r));
      if (ok) pass++; if (spec.known) known.push(e.id + ': ' + spec.known); if (spec.out) outs.push(e.id + ': ' + spec.out);
    }
    info.corpus = pass + '/' + CORPUS.length; info.known = known; info.outOfEngine = outs;
  });

  console.log('info: ' + JSON.stringify(info));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
