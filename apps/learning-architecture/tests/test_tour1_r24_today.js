// تورِ پولیا (دستهٔ ۱، دورِ ۲۴ — سهمِ «today» — ۲۰۲۶-۱۰-۲۵) — DECISIONS_R24: R7 «امروز، پرونده، کارتِ ذهن، قول‌ها».
//  جمله‌های خودِ اجراکننده‌ها (round24{A,B,C,D})، هر کدام قرمز روی ساختِ پایه (3685102d):
//   B24·D13 (s14: «میان‌ترم رو ۱۴ گرفتم، سر جلسه قفل نکردم» ⇒ «امروز» هنوز «امتحانش را دادی؟») · B24·D14 / D24-11 (حدس‌های آزموده «آزموده نشده»: aB2، tB1، aB4، aD4)
//   B24·D20 (bp2: یک گیر سه بار در «علتِ هر گیر») · B24·D21 (s15: «… بخونم. خوبه؟» برنامه شد با موعدِ ساختگیِ مدل)
//   B24·D9 (s13/aB4: خواستهٔ برآورده‌شده قول شد، با «پاسخ به «پرسشِ دستیار»») · D24-14 (oD1: یک پیش‌بینی دو 🎯)
//   A23-32 (oA1: 🧭 ِ «پیشنهادِ کار» حدسِ «۱۰۰» و مقصدِ دست‌دادن را دارد) · C24-17 (pC1: «مانده: طرح هنوز نیست · ۰ مرحله از ۴» در بازنگری)
//   C24-5 (s25: حدسی که در بازنگری می‌آزماید فقط یادداشت شد) · D24-4 (s31: «ثبت نمی‌شود» به مدل در برابرِ «🔭 نگه داشتم») · A24-16 (oA1: «فیلدهای این صفحه را پر کن» برای 🧭)
//  و بانکِ مستقلِ VARIANTS_R24 (tests/variants/VARIANTS_R24.json، R7 = #142–#160).
// LLA_FILE = ساختِ دیگر (قرمزِ اول)؛ ONLY=dl,guess …
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = [path.join(__dirname, 'variants', 'VARIANTS_R24.json')].find(f => fs.existsSync(f)) || '';
const BANK = BANKF ? JSON.parse(fs.readFileSync(BANKF, 'utf8')) : [];
const R7 = BANK.map((x, i) => Object.assign({ n: i + 1 }, x)).filter(x => /^R7\./.test(x.rc));

const T0 = Date.parse('2026-10-18T10:00:00+03:30');   // یکشنبه ۲۶ مهر — تاریخ‌های انتظار از همین ساعتِ یخ‌زده حساب می‌شوند، نه نوشته

const HELPERS = () => {
  const S = APP.S;
  APP.S.loaded = true; window.__noNav = true;
  window.__q = []; window.__sys = [];
  APP.callAI = async (sys, user, opts) => { __sys.push(String(sys || '') + '\n' + String(user || '')); let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  window.__say = async (text, reply, actions, more) => { __sys.length = 0; __q.push({ reply: reply || 'باشه.', status: 'related', memory: 'm', actions: actions || [] }); (more || []).forEach(m => __q.push(m)); await APP.ASSIST.send(text); __q.length = 0; return __sys.join('\n'); };
  window.__cur = () => APP.ASSIST.cur ? APP.ASSIST.cur() : APP.S.get(localStorage.getItem('lla.assist.cur'));
  window.__freshChat = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); return APP.ASSIST.newSession().id; };
  window.__wipe = () => { ['practice', 'ex', 'fcast', 'kexp', 'case', 'card', 'sched', 'pr', 'topic', 'knot', 'kcase', 'eprob', 'eprog', 'achat', 'deadline', 'lprob'].forEach(t => { try { S.all(t).forEach(r => S.del(r.id)); } catch (e) { } }); localStorage.removeItem('lla.assist.cur'); APP.go('home'); };
  window.__today = () => APP.dueList().map(d => (d.txt || '') + ' ‖ ' + (d.sub || ''));
  window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p ? r.p.id : r.id; };
  window.__cs = (o) => Object.assign({ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
  window.__g = () => ((__cur().coach || {}).guesses || []).map(g => ({ text: g.text, res: g.res || '', from: g.resFrom || '' }));
  window.__sysLines = () => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text);
};

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { runners: {}, bank: {} };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'Asia/Tehran' });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.clock.install({ time: new Date(T0) });
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
  const E = (fn, arg) => p.evaluate(fn, arg);
  const day = async (n, hour) => { await p.clock.setSystemTime(new Date(T0 + n * 864e5 + ((hour == null ? 10 : hour) - 10) * 36e5)); };
  const load = async () => { await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(150); await E(HELPERS); };
  const fresh = async () => { await day(0); await E(() => __wipe()); };
  const X = (name, ok, x) => { info.runners[name] = !!ok; if (!ok) errors.push(name + ' :: ' + JSON.stringify(x).slice(0, 1400)); };
  const BK = (n, ok, x) => { info.bank[n] = !!ok; if (!ok) errors.push('bank #' + n + ' :: ' + JSON.stringify(x).slice(0, 1200)); };
  await load();

  /* ===== B24·D13 (s14) + بانک #142/#155 — موعدِ امتحان از گزارشِ خودش، جمله‌به‌جمله ===== */
  await section('dl', async () => {
    await fresh();
    const r = await E(async () => { __freshChat();
      const past = APP.addDays(APP.today(), -8);
      APP.S.put({ id: APP.uid('dl'), type: 'deadline', what: 'میان‌ترمِ آمار', date: past, done: false });
      const before = __today().filter(x => /امتحانش را دادی/.test(x)).length;
      await __say('سلام. میان‌ترم رو ۱۴ گرفتم، سر جلسه قفل نکردم. ولی امروز برگه‌ی سفید فقط ۴۰٪ یادم بود، انگار بعد از امتحان همه‌ش پرید.', 'آفرین.', [__cs({ ph: 'b' })]);
      const d = APP.S.all('deadline')[0];
      return { before, done: !!d.done, by: d.doneBy && d.doneBy.kind, quote: d.doneBy && d.doneBy.quote, after: __today().filter(x => /میان‌ترم|امتحانش را دادی/.test(x)) };
    });
    X('B24·D13 s14: «میان‌ترم رو ۱۴ گرفتم، سر جلسه قفل نکردم» ⇒ موعد انجام‌شده از حرفِ خودش؛ «امروز» دیگر «امتحانش را دادی؟» نمی‌پرسد', r.before === 1 && r.done && r.by === 'her-words' && /۱۴ گرفتم/.test(r.quote || '') && !r.after.length, r);
    const r2 = await E(async () => { APP.S.all('deadline').forEach(x => APP.S.del(x.id)); __freshChat();
      APP.S.put({ id: APP.uid('dl'), type: 'deadline', what: 'امتحانِ آمار', date: APP.addDays(APP.today(), -3), done: false });
      await __say('میان‌ترم رو ۱۴ گرفتم', 'خوبه.', []); const a = !!APP.S.all('deadline')[0].done;
      APP.S.all('deadline').forEach(x => APP.S.del(x.id)); __freshChat();
      APP.S.put({ id: APP.uid('dl'), type: 'deadline', what: 'امتحانِ آمار', date: APP.today(), done: false });
      await __say('هنوز امتحانو ندادم، هفته‌ی بعده', 'باشه.', []); const b = !!APP.S.all('deadline')[0].done;
      return { a, b }; });
    BK(142, r2.a, r2); BK(155, !r2.b, r2);
  });

  /* ===== B24·D14 / D24-11 + بانک #143–#145/#156 — سرانجامِ حدس به حرفِ خودش ===== */
  await section('guess', async () => {
    await fresh();
    const g = await E(async () => {
      const out = {};
      /* aB2: «… پس ۲۵۰۰. درسته؟» سپس دلیلِ خودش */
      __freshChat();
      await __say('سلام! امروز تو کتاب یه سؤال بود: 1+3+5+…+99 چنده؟ سریع گفتم: ۵۰ تا عدد فرده، پس ۲۵۰۰. درسته؟', 'چطور به ۵۰ رسیدی؟', [__cs({ ph: 'b', guess: { text: '۵۰ تا عدد فرده، پس ۲۵۰۰' } })]);
      await __say('چون nامین فرد 2n−1 ـه: 2n−1 = 99 پس n = 50. پس ۵۰ تا فرده و جواب ۵۰² = ۲۵۰۰. با شکلم هم یه مربع ۵۰ در ۵۰ میشه.', 'درست.', [__cs({ ph: 'b' })]);
      out.aB2 = __g();
      /* tB1: «فکر کنم کافیه» سپس «امتحان کردم … از معیارم بیشتره» */
      __freshChat();
      await __say('ترازوهای ارزونی که دیدم دقتشون ۰.۱ گرمه. پس ۰.۳ گرم یعنی ۳ تا پله؛ فکر کنم کافیه.', 'چطور می‌آزمایی‌اش؟', [__cs({ guess: { text: 'فکر کنم کافیه' } })]);
      await __say('امتحان کردم: یه قرص رو ۲۰ بار گذاشتم و برداشتم. ۱۹ بار ۰.۲ یا ۰.۳ نشون داد، یه بار ۰.۰. اگه روزی دو تا قرص باشه، ماهی ۶۰ بار؛ با ۱ از ۲۰ یعنی ماهی ۳ تا هشدار اشتباه — از معیارم بیشتره! پس باید دو بار پشت سر هم بخونه.', 'خوب دیدی.', [__cs({})]);
      out.tB1 = __g();
      /* aB4: حدس و ردش در همان پیام */
      __freshChat();
      await __say('یه حدس بزنم: تقریباً نصف نصف، مثلاً ۲۰ مرغ و ۱۵ خرگوش. پاها میشه ۲۰×۲ + ۱۵×۴ = ۴۰ + ۶۰ = ۱۰۰. زیاد شد، ما ۹۴ می‌خوایم.', 'خوب آزمودید.', [__cs({ guess: { text: '۲۰ مرغ و ۱۵ خرگوش' } })]);
      out.aB4 = __g();
      /* aD4: «چهار تا بسه» سپس «درنمیاد … پنج تا تخته» */
      __freshChat();
      await __say('سلام. من نجار بودم، الان بازنشسته‌ام. برای نوه‌ام یه کتابخونه می‌خوام بسازم: دو تا بغل، هر کدوم ۱۸۰ سانت، و شش تا طبقه، هر کدوم ۸۰ سانت. تخته‌هایی که بازار داره ۲۴۰ سانتی‌ان. چند تا تخته بخرم؟ به نظرم چهار تا بسه: از دو تا تخته بغل‌ها درمیاد و از دو تای دیگه هر کدوم سه تا طبقهٔ ۸۰.', 'تیغِ اره را حساب کرده‌اید؟', [__cs({ ph: 'u', guess: { text: 'به نظرم چهار تا بسه' } })]);
      await __say('ای وای! راست می‌گید. تیغِ اره‌ام ۳ میلی‌متر می‌خوره. سه تا ۸۰ با دو تا برش میشه ۲۴۰ و ۶ دهم سانت؛ از یه تختهٔ ۲۴۰ درنمیاد. پس از هر تخته فقط دو تا طبقه. پیر شدم، مغزم دیگه مثلِ قدیم کار نمی‌کنه. خب، پس برای شش تا طبقه سه تا تخته، با دو تا بغل میشه پنج تا تخته.', 'درست.', [__cs({})]);
      out.aD4 = __g();
      const s = __cur(); out.route = APP.ROUTE && APP.ROUTE.model ? APP.ROUTE.model(s.id).pts.map(x => x.title).filter(t => /حدس/.test(t)) : [];
      return out;
    });
    X('B24·D14 aB2: «چون … پس n = 50 … ۵۰² = ۲۵۰۰» ⇒ حدسِ «۲۵۰۰» تأیید شد (دلیلِ خودش)', g.aB2.length === 1 && g.aB2[0].res === 'confirmed' && /چون/.test(g.aB2[0].from), g.aB2);
    X('B24·D14 tB1: «فکر کنم کافیه» + «امتحان کردم … از معیارم بیشتره» ⇒ رد شد', g.tB1.length === 1 && g.tB1[0].res === 'refuted' && /امتحان کردم/.test(g.tB1[0].from), g.tB1);
    X('B24·D14 aB4: «۲۰ مرغ و ۱۵ خرگوش … = ۱۰۰. زیاد شد» در همان پیام ⇒ رد شد', g.aB4.length === 1 && g.aB4[0].res === 'refuted' && /زیاد شد/.test(g.aB4[0].from), g.aB4);
    X('D24-11 aD4: «چهار تا بسه» + «از یه تختهٔ ۲۴۰ درنمیاد … پنج تا تخته» ⇒ رد شد؛ 🧭 دیگر «آزموده نشده» نیست', g.aD4.length === 1 && g.aD4[0].res === 'refuted' && !g.route.some(t => /آزموده نشده/.test(t)), g);
    const bk = await E(async () => {
      const out = {};
      __freshChat(); await __say('حدسم ۲۵۰۰ بود', 'چرا؟', [__cs({ guess: { text: 'حدسم ۲۵۰۰ بود' } })]); await __say('آره چون ۵۰ در ۵۰ میشه ۲۵۰۰', 'خوب.', [__cs({})]); out[143] = __g();
      __freshChat(); await __say('فکر می‌کردم یه بار خوندن بسه', 'آزمودی؟', [__cs({ guess: { text: 'یه بار خوندن بسه' } })]); await __say('ولی ۱۹ از ۲۰ گرفتم وقتی دو بار خوندم و بار اول ۱۲', 'دیدی.', [__cs({})]); out[144] = __g();
      __freshChat(); await __say('به نظرم چهار تا بسه … نه، از یه تخته‌ی ۲۴۰ درنمیاد، پنج تا', 'درسته.', [__cs({ guess: { text: 'به نظرم چهار تا بسه' } })]); out[145] = __g();
      __freshChat(); await __say('حدسم ۱۲ه', 'چطور می‌آزمایی؟', [__cs({ guess: { text: 'حدسم ۱۲ه' } })]); await __say('بعداً نگاه می‌کنم، الان خسته‌ام.', 'باشه.', [__cs({})]); out[156] = __g();
      return out; });
    BK(143, bk[143].length === 1 && bk[143][0].res === 'confirmed', bk[143]);
    BK(144, bk[144].length === 1 && bk[144][0].res === 'refuted', bk[144]);
    BK(145, bk[145].length === 1 && bk[145][0].res === 'refuted', bk[145]);
    BK(156, bk[156].length === 1 && !bk[156][0].res, bk[156]);
  });

  /* ===== B24·D9 + بانک #146/#153/#154 — قول فقط برای خواستهٔ برآورده‌نشده، با متنِ خودش ===== */
  await section('prom', async () => {
    await fresh();
    const r = await E(async () => {
      const out = {};
      __freshChat();
      await __say('یه گزینه پیدا کردم: مستقیم باهاش حرف بزنم و یه مهلت بدم که جبران کنه.', 'گزینه‌تان را با تک‌تکِ بخش‌های شرطِ خودتان بسنجید — جلوی ادامه‌اش گرفته شود و دوستم نابود نشود؟', [__cs({})]);
      await __say('یه چیز: «شریکِ جرم» برام هنوز مبهمه، و یه فرضی هم دارم که مطمئن نیستم درسته: «اگه گزارش بدم حتماً اخراج میشه». اینا رو یه جا نگه دار که یادم نره، هفته‌ی بعد از کارشناس منابع انسانی بپرسم.', 'هر دو را نگه داشتم.',
        [{ do: 'list_add', list: 'ابهام', text: '«شریکِ جرم» برام هنوز مبهمه', quote: '«شریکِ جرم» برام هنوز مبهمه', consent: { quote: 'اینا رو یه جا نگه دار' } }, { do: 'list_add', list: 'فرض', text: 'اگه گزارش بدم حتماً اخراج میشه', quote: 'اگه گزارش بدم حتماً اخراج میشه', consent: { quote: 'اینا رو یه جا نگه دار' } }, __cs({})]);
      out.s13 = (__cur().promises || []).filter(x => x.by === 'user');
      __freshChat();
      await __say('از یه راه دیگه... اگه همه مرغ بودن: ۳۵×۲ = ۷۰ پا. ۹۴ − ۷۰ = ۲۴ پای اضافه؛ پس ۱۲ خرگوش.', 'آفرین؛ این راه را برای نوه‌تان نگه داریم؟', [__cs({})]);
      await __say('اینو یه جا ثبتش کن که فردا وقتی نوه‌م اومد، از روی همون براش توضیح بدم.', 'ثبت شد.', [{ do: 'chat_solved', title: 'مرغ و خرگوش', statement: '۳۵ سر و ۹۴ پا؛ چند مرغ و چند خرگوش؟', kind: 'find', lesson: 'هر تغییرِ کوچیک چقدر اثر داره', check: '۲۳ + ۱۲ = ۳۵ سر و ۹۴ پا' }, __cs({ ph: 'b' })]);
      out.aB4 = (__cur().promises || []).filter(x => x.by === 'user');
      __freshChat();
      await __say('تا اینجا دو تا از جمع‌ها رو حساب کردم.', 'بقیه را الان حساب کنیم یا بعد؟', [__cs({})]);
      await __say('اینو یه جا بنویس که فردا یادم بیاد بقیه‌شو حساب کنیم', 'باشه.', [__cs({})]);
      out.b146 = (__cur().promises || []).filter(x => x.by === 'user').map(x => ({ ask: x.ask, ctx: x.ctx, due: x.due }));
      return out; });
    X('B24·D9 s13: «اینا رو یه جا نگه دار…» که همان نوبت با دو list_add برآورده شد قول نمی‌شود', r.s13.length === 0, r.s13);
    X('B24·D9 aB4: «اینو یه جا ثبتش کن که فردا…» که همان نوبت chat_solved برآورده کرد قول نمی‌شود', r.aB4.length === 0, r.aB4);
    await day(1);
    const t1 = await E(() => __today().filter(x => /بقیه‌شو حساب کنیم|خواسته‌ای که گذاشتی/.test(x)));
    BK(146, r.b146.length === 1 && /یه جا بنویس/.test(r.b146[0].ask) && !r.b146[0].ctx && t1.length >= 1, { p: r.b146, t1 });
    BK(153, r.s13.length === 0, r.s13);
    const pb = await E(() => APP.S.all('achat').map(s => (s.promises || []).filter(x => x.by === 'user').map(x => x.ctx)).flat());
    BK(154, pb.every(c => !c || !/[؟?]\s*$/.test(c)), pb);
  });

  /* ===== B24·D21 + بانک #152 — «… بخونم. خوبه؟» برنامه نیست؛ تاریخِ مدل بی حرفِ خودش پذیرفته نیست ===== */
  await section('plan', async () => {
    await fresh();
    const r = await E(async () => { const out = {}; const far = APP.addDays(APP.today(), 20);
      __freshChat();
      await __say('باشه. یه فکر دیگه: می‌خوام فهرست پرسش‌ها رو روی دیوار کلاس بزنم و هر بار به ترتیب از اول تا آخر بخونم. خوبه؟', 'هر بار به ترتیب؟', [__cs({ plan: { text: 'می‌خوام فهرست پرسش‌ها رو روی دیوار کلاس بزنم و هر بار به ترتیب از اول تا آخر بخونم', when: far } })]);
      out.q = (__cur().plans || []).map(x => x.text + ' @' + x.when);
      __freshChat();
      await __say('کتاب‌ها رو به ترتیب بخونم. خوبه؟', 'نظرت؟', [__cs({ plan: { text: 'کتاب‌ها رو به ترتیب بخونم', when: far } })]);
      out.b152 = (__cur().plans || []).map(x => x.text + ' @' + x.when);
      __freshChat();
      await __say('می‌خوام فهرست رو روی دیوارِ کلاس بزنم.', 'خوب.', [__cs({ plan: { text: 'می‌خوام فهرست رو روی دیوارِ کلاس بزنم', when: far } })]);
      out.noWhen = (__cur().plans || []).map(x => x.when);
      __freshChat();
      await __say('فردا صبح به داروخانه زنگ می‌زنم و می‌پرسم.', 'خوب.', [__cs({ plan: { text: 'فردا صبح به داروخانه زنگ می‌زنم', when: APP.addDays(APP.today(), 1) } })]);
      out.tom = (__cur().plans || []).map(x => x.when); out.tomExp = APP.addDays(APP.today(), 1);
      return out; });
    X('B24·D21 s15: «… از اول تا آخر بخونم. خوبه؟» پرسشِ نظر است ⇒ برنامه ثبت نمی‌شود (نه با موعدِ ساختگیِ مدل)', r.q.length === 0, r);
    X('B24·D21: تاریخِ مدل بی زمانی در حرفِ خودش ⇒ «جلسهٔ بعد»، نه تاریخِ ساختگی', r.noWhen.length === 1 && r.noWhen[0] === 'next-session', r);
    X('B24·D21 (نگهبان): «فردا صبح … زنگ می‌زنم» با تاریخِ مدل همان فردا می‌ماند', r.tom.length === 1 && r.tom[0] === r.tomExp, r);
    BK(152, r.b152.length === 0, r);
  });

  /* ===== D24-14 + بانک #147 — یک پیش‌بینی، یک 🎯 (پیگیریِ فرم همان رکورد را کامل می‌کند) ===== */
  await section('fc', async () => {
    await fresh();
    const r = await E(async () => { __freshChat();
      await __say('پیش‌بینیم: صفر یا یک هشدارِ اشتباه، ۸۰ درصد مطمئنم. تا پس‌فردا انجامش میدم.', 'ثبت شد.', [{ do: 'go', view: 'fcast' }, __cs({ plan: { text: 'تا پس‌فردا انجامش میدم', when: APP.addDays(APP.today(), 2) }, guess: { text: 'صفر یا یک هشدارِ اشتباه' } })]);
      const n1 = APP.S.all('fcast').length;
      APP.ASSIST.toggle && APP.ASSIST.toggle(false); APP.go('fcast'); await new Promise(r => setTimeout(r, 300));
      const q = document.getElementById('fcQ'), pc = document.getElementById('fcP');
      q.value = 'با پنجرهٔ ۴ ثانیه (تغییر کمتر از ۰٫۰۵ گرم)، در ۲۰ بار باز و بسته کردنِ بی‌قرص، صفر یا یک هشدارِ اشتباه می‌آید'; q.dispatchEvent(new Event('input', { bubbles: true }));
      pc.value = '80'; pc.dispatchEvent(new Event('input', { bubbles: true }));
      const btn = q.closest('section').querySelector('button.btn'); btn.click(); await new Promise(r => setTimeout(r, 200));
      const F = APP.S.all('fcast'); return { n1, n: F.length, p: F.map(f => f.p), est: F.map(f => !!f.est) };
    });
    X('D24-14 oD1: «پیش‌بینیم: صفر یا یک … ۸۰ درصد» + پیگیریِ فرمِ 🎯 با همان پیش‌بینی ⇒ یک رکورد، با اطمینانِ ۸۰ ِ خودش', r.n1 === 1 && r.n === 1 && r.p[0] === 80 && !r.est[0], r);
    BK(147, r.n === 1, r);
  });

  /* ===== B24·D20 + بانک #157 — یک گیر، یک سطر در «علتِ هر گیر» ===== */
  await section('mind', async () => {
    await fresh();
    const r = await E(async () => { const sid = __freshChat(), s = APP.S.get(sid);
      const q = 'دقیق یادم نیست یه متر چند میلی‌متره، مدرسه خیلی وقت پیش بود.';
      s.coachEv = ['u4', 'u5', 'u6'].map((m, i) => ({ ph: 'c', src: 'chat', ok: false, at: new Date(Date.now() + i * 1000).toISOString(), msg: m, key: 'k' + i, cause: 'prereq', pre: 'pq1', preC: 'تبدیلِ متر به میلی‌متر (۱ متر = ۱۰۰۰ میلی‌متر)', preStep: 'نوشتنِ ۱۵۰ میلی‌متر بارش به متر', preQ: q }));
      APP.S.put(s); APP.go('mind'); await new Promise(r => setTimeout(r, 300));
      const Q = APP.MIND.phases(), lis = [...document.querySelectorAll('.mind-cz-pre li')].map(x => x.textContent);
      return { n: Q.causes.prereq.length, lis, head: (document.querySelector('.mind-causes p') || {}).textContent || '' };
    });
    X('B24·D20 bp2: سه نوبتِ گیرِ همان پیش‌نیاز (همان شاهد) ⇒ یک سطر «… در ۳ نوبت» (شمارِ گیرها ۳ می‌ماند)، نه سه سطرِ یکسان', r.n === 3 && r.lis.length === 1 && /در ۳ نوبت/.test(r.lis[0]) && /پیش‌نیاز ۳/.test(r.head), r);
    BK(157, r.lis.length === 1, r);
  });

  /* ===== C24-17 + بانک #149 — 🧭 در بازنگری: «طرح هنوز نیست» نه ===== */
  await section('route', async () => {
    await fresh();
    const r = await E(async () => { const pid = __live('معادلهٔ x² − y² = 15', 'همهٔ جواب‌های صحیحِ x² − y² = 15 را پیدا کن.');
      const pg = APP.S.get('eprog_' + pid); pg.solve = pg.solve || {}; pg.solve.live = pg.solve.live || {}; pg.solve.live.chatPh = 'b'; APP.S.put(pg);
      const M = APP.ROUTE.model(pid); return { now: M.nowFa, remain: M.remain };
    });
    X('C24-17 pC1: «اکنون: بازنگری» ⇒ «مانده» هرگز «نامعلوم — طرح هنوز نیست · ۰ مرحله از ۴»', /بازنگری/.test(r.now) && !/طرح هنوز نیست/.test(r.remain) && !/۰ مرحله از/.test(r.remain), r);
    BK(149, !/طرح هنوز نیست/.test(r.remain), r);
  });

  /* ===== A23-32 + بانک #150 — رویدادهای گفت‌وگو مالِ مسئلهٔ خودشان ===== */
  await section('detour', async () => {
    await fresh();
    const r = await E(async () => { __freshChat();
      await __say('سلام. یه مسئله‌ست که از دیشب ذهنمو درگیر کرده: تو یه مهمونیِ ۱۰ نفره هر کس با هر کس دقیقاً یه بار دست داده. چند تا دست‌دادن شده؟ و اگه n نفر باشن چی؟ حدسِ اولم ۱۰۰ بود ولی حس می‌کنم غلطه.', 'چه چیزی را می‌خواهی بشماری؟', [__cs({ ph: 'u', guess: { text: 'حدسِ اولم ۱۰۰ بود' } })]);
      await __say('یعنی می‌خوایم بشمریم چند تا «جفت آدم» هست، چون هر جفت یه بار دست می‌دن.', 'اگر فقط ۳ نفر بودند؟', [__cs({ ph: 'u', said: ['u'] })]);
      await __say('با ۳ نفر: الف‌ب، الف‌ج، ب‌ج — ۳ تا. راهِ من (۱۰ × ۱۰) برای ۳ نفر می‌شه ۹. پس دو جا اشتباه کردم: هر کس با خودش دست نمی‌ده، پس ۳ × ۲ = ۶؛ و هر دست‌دادن رو دو بار شمردم، پس ۶ ÷ ۲ = ۳. برای ۱۰ نفر: ۱۰ × ۹ ÷ ۲ = ۴۵.', 'برای n؟', [__cs({ ph: 'c', said: ['step'] })]);
      await __say('برای n نفر: n(n−1)/2. ولی بذار یه لحظه یه چیزِ دیگه بپرسم که الان مهم‌تره: یه پیشنهادِ کار از یه شرکتِ دیگه دارم، حقوقش ۳۰٪ بیشتره ولی باید از تیمی که خودم ساختم جدا شم. تا پنج‌شنبه باید جواب بدم. اینو هم می‌شه همین‌جا با همین روش فکر کرد؟', 'بله. ثبتش کنم؟', [__cs({ ph: 'b' })]);
      await __say('ثبتش کن. در یک جمله: بین «بمونم و تیمی که ساختم رو به جایی برسونم» و «برم با حقوقِ ۳۰٪ بیشتر و یه محیطِ تازه» انتخاب می‌کنم.', 'ثبت شد.', [{ do: 'live_new', title: 'پیشنهادِ کار یا تیمِ خودم', statement: 'یه پیشنهادِ کار از یه شرکتِ دیگه دارم، حقوقش ۳۰٪ بیشتره ولی باید از تیمی که خودم ساختم جدا شم. تا پنج‌شنبه باید جواب بدم. بین ماندن و رفتن انتخاب می‌کنم.', kind: 'decide' }, __cs({ ph: 'u' })]);
      const L = APP.liveAll().filter(x => /پیشنهادِ کار/.test(x.p.title))[0]; if (!L) return { none: true };
      const D = APP.dossier(L.p.id), M = APP.ROUTE.model(L.p.id);
      const txt = (D.events || []).map(e => (e.title || '') + ' ' + (e.lines || []).join(' ')).join(' ‖ ');
      return { pid: L.p.id, guess100: /۱۰۰/.test(txt) && /حدس/.test(txt), pts: M.pts.map(x => x.title + ' ' + (x.lines || []).join(' ')).filter(t => /۱۰۰|۳ نفر|جفت آدم/.test(t)), dest: M.dest + ' / ' + M.destQ };
    });
    X('A23-32 oA1: 🧭/📜 ِ «پیشنهادِ کار» نه حدسِ «۱۰۰»، نه گام‌های «۳ نفر»، نه مقصدِ «جفت آدم» ِ مسئلهٔ دست‌دادن', !r.none && !r.guess100 && !r.pts.length && !/جفت آدم/.test(r.dest), r);
    BK(150, !r.none && !r.guess100 && !r.pts.length, r);
  });

  /* ===== C24-5 + بانک #148/#159 — حدسی که در بازنگری می‌آزماید ⇒ مسئلهٔ زنده؛ حرفِ گذرا نه ===== */
  await section('conj', async () => {
    await fresh();
    const r = await E(async () => { const out = {};
      const mk = async () => { const sid = __freshChat(); const pid = __live('جمعِ ۱/(k(k+1))', 'ثابت کن 1/(1·2) + … + 1/(n(n+1)) = n/(n+1).'); const pg = APP.S.get('eprog_' + pid); pg.solve.live.state = 'solved'; APP.S.put(pg); const s = APP.S.get(sid); s.lprob = pid; APP.S.put(s); return pid; };
      await mk(); const n0 = APP.liveAll().length;
      const st = 'خودم الگوی ۱/(1·2·3) + ۱/(2·3·4) + … رو ساختم. حدسم اینه که میشه ۱/۴ − ۱/(2(n+1)(n+2)). سه تاشو چک کردم.';
      await __say('جلسه سوم: ' + st, 'جالب است؛ اثباتش کنیم؟', [{ do: 'chat_invent', statement: st, title: 'جمعِ ۱/(k(k+1)(k+2))', kind: 'pod' }, __cs({ ph: 'u' })]);
      out.c25 = { n: APP.liveAll().length - n0, sys: __sysLines().filter(x => /نگه داشتم|مسئلهٔ زنده ساخته نشد/.test(x)) };
      await mk(); const n1 = APP.liveAll().length;
      await __say('فکر کنم این برای هر n فرد هم درسته، بذار امتحان کنم', 'بیازما.', [{ do: 'chat_invent', statement: 'این برای هر n فرد هم درسته', title: 'برای هر n فرد', kind: 'prove' }, __cs({ ph: 'u' })]);
      out.b148 = APP.liveAll().length - n1;
      await mk(); const n2 = APP.liveAll().length;
      await __say('شاید یه الگو باشه، ولش کن', 'باشه.', [{ do: 'chat_invent', statement: 'شاید این جمع‌ها یه الگو داشته باشن', title: 'یه الگو', kind: 'pod' }, __cs({ ph: 'b' })]);
      out.b159 = APP.liveAll().length - n2;
      return out; });
    X('C24-5 s25: «خودم الگوی … رو ساختم. حدسم اینه که … سه تاشو چک کردم» در بازنگری ⇒ مسئلهٔ زنده (نه فقط «🔭 نگه داشتم»)', r.c25.n === 1 && !r.c25.sys.length, r);
    BK(148, r.b148 === 1, r); BK(159, r.b159 === 0, r);
  });

  /* ===== D24-4 + بانک #160 — یک صدا: صفحه وقتی خودش نگه می‌دارد به مدل «ثبت نمی‌شود» نمی‌گوید ===== */
  await section('backpend', async () => {
    await fresh();
    const r = await E(async () => { const sid = __freshChat();
      await __say('اولی رو حل کردم: بیشینهٔ حاصل‌ضرب با جمعِ ۱۰ همون ۵ و ۵ ـه، چون بقیه کمترن.', 'درس این مسئله برایت چه بود؟', [__cs({ ph: 'b', said: ['result'] })]);
      const s = APP.S.get(sid); s.coach = s.coach || {}; s.coach.ph = 'b'; APP.S.put(s);
      const sys = await __say('سه تا مسئلهٔ تازه هم ساختم: بیشینهٔ حاصل‌ضرب وقتی جمعِ مربع‌ها ۱۰ باشه؛ چند تا صحیحِ متمایز با جمعِ ۱۰؛ و همین برای جمعِ ۱۰۰۰.', 'سه مسئلهٔ خوب ساختی؛ هر سه را نگه داشتم.',
        [{ do: 'chat_invent', statement: 'بیشینهٔ حاصل‌ضربِ دو عدد وقتی جمعِ مربع‌هایشان ۱۰ باشد', title: 'حاصل‌ضربِ بیشینه با جمعِ مربع‌ها ۱۰' }, { do: 'chat_invent', statement: 'چند عددِ صحیحِ متمایز با جمعِ ۱۰ می‌توان برداشت', title: 'صحیح‌های متمایز با جمعِ ۱۰' }, __cs({ ph: 'b' })],
        [{ reply: 'سه مسئله‌ات هنوز ثبت نشده‌اند.', status: 'related', memory: 'm', actions: [] }]);
      const S2 = APP.S.get(sid);
      return { refusedToModel: /ثبت نمی‌شود: کاربر نخواسته بود/.test(sys), kept: (S2.backPend || []).length, lines: __sysLines().filter(x => /نگه داشتم/.test(x)), last: (S2.msgs || []).filter(m => m.role === 'ai').map(m => m.text).pop() };
    });
    X('D24-4 s31: مسئله‌های تازهٔ بازنگری که صفحه نگه می‌دارد ⇒ به مدل «ثبت نمی‌شود» گفته نمی‌شود و بازنویسیِ «هنوز ثبت نشده‌اند» نمی‌آید', !r.refusedToModel && r.kept === 2 && r.lines.length >= 1 && !/ثبت نشده/.test(r.last || ''), r);
    BK(160, !r.refusedToModel && !/ثبت نشده/.test(r.last || ''), r);
  });

  /* ===== A24-16 + بانک #158 — پیگیریِ خودکار برای نمای بی‌فیلد «فیلدها را پر کن» نمی‌گوید ===== */
  await section('nofield', async () => {
    await fresh();
    const r = await E(async () => { __freshChat(); const pid = __live('دست‌دادن‌های مهمانی', 'در مهمانیِ ۱۲ نفره هر کس با هر کس یک بار دست می‌دهد؛ چند دست‌دادن؟');
      const sys = await __say('نقشهٔ مسیرم رو نشون بده', 'باز کردم.', [{ do: 'go', view: 'route', arg: pid }], [{ reply: 'این‌جا نقشهٔ مسیر است.', status: 'related', memory: 'm', actions: [] }]);
      const follow = sys.split('\n').filter(l => /\[سامانه: /.test(l)).join(' ');
      return { view: APP.state && APP.state.view, follow: follow.slice(0, 600), fields: document.querySelectorAll('#main input:not([type=hidden]), #main textarea, #main select').length };
    });
    X('A24-16 oA1: پیگیریِ پس از باز شدنِ 🧭 (بی فیلد) «فیلدهای این صفحه را پر کن» ندارد', r.fields === 0 && !/فیلدهای این صفحه را پر کن/.test(r.follow), r);
    BK(158, !/فیلدهای این صفحه را پر کن/.test(r.follow), r);
  });

  /* ===== بانک #151 — «تا شنبه‌ی بعد» ⇒ نخستین شنبه پس از امروز (از ساعتِ آزمون)، با تاریخِ شمسی ===== */
  await section('b151', async () => {
    await fresh();
    const r = await E(async () => { __freshChat();
      const t = APP.today(), p = t.split('-'), d0 = new Date(+p[0], +p[1] - 1, +p[2]).getDay(), k = (6 - d0 + 7) % 7, exp = APP.addDays(t, k === 0 ? 7 : k);
      await __say('تا شنبه‌ی بعد باید تحویلش بدم', 'ثبت شد.', [{ do: 'deadline', what: 'تحویلِ گزارش', date: APP.addDays(t, 13) }, __cs({})]);
      const d = APP.S.all('deadline')[0] || {}; const lines = __sysLines().concat(__today()).join(' ‖ ');
      return { exp, date: d.date, iso: /\d{4}-\d{2}-\d{2}/.test(lines), fa: APP.fdate(exp), lines: lines.slice(0, 500) };
    });
    BK(151, r.date === r.exp && !r.iso, r);
  });

  const want = R7.map(x => x.n), miss = want.filter(n => !(n in info.bank));
  if (miss.length) errors.push('bank R7 entries without a check: ' + miss.join(','));
  console.log(JSON.stringify({ runners: Object.keys(info.runners).length, runnersOk: Object.values(info.runners).filter(Boolean).length, bank: Object.keys(info.bank).length, bankOk: Object.values(info.bank).filter(Boolean).length }));
  await b.close();
  if (errors.length) { console.error('FAIL\n' + errors.join('\n')); process.exit(1); }
  console.log('OK test_tour1_r24_today');
})();
