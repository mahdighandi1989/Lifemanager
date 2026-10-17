// تورِ پولیا (دستهٔ ۱، دورِ ۱۲ ِ اصلاح — «بی‌نقص»، بارِ چهارم، ۲۰۲۶-۱۰-۱۷) — سهمِ «coach» (DECISIONS_R12: L1، L2 سمتِ coach/a32/a35/a36 + آزمونِ ساختاریِ کلِ پرامپت، L3، L6، L7).
//  guess   L1: حدس = یک ادعای نامزد دربارهٔ موضوعِ مسئله، با تردید، نیازموده. نه حدس (هر یک از گزارشِ دورِ ۱۲، کنترل): شرطی «اگه فکر کنم، …» (s01 p3)، لغوِ خودش
//          «شاید X ولی … ربط ندارن» (s01 p6)، داوری پشتِ نتیجهٔ خودش «فکر کنم حل شد»/«به نظرم منطقیه» (s03 p5، s38 p5)، گامِ برگزیدهٔ خودش «شاید یه اسکیس… فردا صبح
//          ۲۰ دقیقه» (s34 p2)، نامزدهای معنا/«X یعنی…؟» (s27 p2، s13 p3 ⇒ A038 پرسشِ نوبت)، آزموده و برهان‌خواه (s11 p3 ⇒ پرسشِ برهان)؛ حدس‌های واقعی همچنان
//          (s21 p2، s22 p1، s23 p1، s26 p1، s29 p1؛ زنده s29 p7) — و حوزهٔ pr_hypothesis_testing فقط با حدسِ واقعی
//  struct  L2: کلِ پرامپت (هر بلوک: مربی، زنده، مرتبط، مسئلهٔ باز، غربال، 💡، 🌱 — بی بلوکِ مربی هم) — بیرون از سطرِ پرسشِ نوبت (و فهرستِ مرحله) هیچ «بپرس»
//          و هیچ پایانِ «؟» ِ بی‌نشان؛ تنها استثنای صریح سطرِ ایمنیِ بلوکِ «# تور». معلمِ خیالی بی نمونهٔ ثابت؛ قابِ عینی بی پرسشِ نقل‌شده؛ قاعدهٔ سکوت ⇒ پرسشِ همین نوبت.
//          پرامپت‌های فیکسچرهای دورهای ۷ تا ۱۲ (با شنودِ prompt_tap.js) هم.
//  idea    L3: یادداشتِ idea_counter در گفت‌وگو برای کاربر نوشته می‌شود (بی «از کاربر بپرس»)؛ دستور به مدل فقط در پرامپت، و آن هم زمینه (s20 p4/p5)
//  prov    L6: ضدِ ضرب‌المثل (PROV_OPP) هم نقلی نیست که در همان بلوک آمده (s25 p6، s26 p4)
//  cert    L6: «معلومه»، «واضحه»، «بدیهیه»، «شکی نیست» ⇒ B107 + md_cognitive_biases (s28 p1)
//  lesson  L6: پس از بستنِ مسئله، «نمی‌دونم…» ِ کوتاه دربارهٔ همان ⇒ درسِ بازنگریِ خودش پرسشِ نوبت است، نه u1 (s26 p5)
//  openph  هماهنگی با «live»: بیرون از صفحه، حرفش دربارهٔ مسئلهٔ بازِ تنها در «طرح» ⇒ سرواژه و فهرستِ مربی «طرح‌ریزی»، نه «فهمِ مسئله»
//  terr    L7: آمار (σ/√n، n−1، «میانگینِ نمونه») ⇒ pr_statistical از نشانهٔ خودِ مسئله (cues_fa)؛ a_induction از B162 فقط برای استقرا از نمونه‌ها (s14 p9)
// همه از رابطِ واقعی (پنجرهٔ دستیار با مدلِ بدلی، فرم‌های «🔭»)؛ خطا ⇒ کدِ خروجِ غیرصفر. LLA_FILE = ساختِ دیگر (خطِ قرمز: 53d0fc6)؛ ONLY=… ؛ DUMP=1؛
// LLA_STRUCT_FIX=0 فیکسچرهای دورهای ۷–۱۲ را اجرا نمی‌کند (فقط پرامپت‌های همین آزمون).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));

// ---------- ساختار (L2): کلِ پرامپت ----------
// بلوک‌های داده (نه دستور): سشن، گفت‌وگو، نوبت، صفحه، نقشه، برگه‌ها، پیام‌های صفحه، متنِ فایل‌ها — و «# امروز» (سرواژهٔ a26، قاعدهٔ تاریخ، نه پرسشِ پولیا؛ سهمِ دیگری — در یادداشتِ دست‌به‌دست)
const SKIP = /^# (?:سشن|گفت‌وگو تا این لحظه|نوبتِ تازه|صفحهٔ فعلی|نقشهٔ سامانه|برگه‌های بازِ|پیام‌های اخیرِ صفحه|متنِ فایل‌ها)/;
const isTurnLine = (l) => /\*\*پرسشِ این نوبت همین است:?\*\*/.test(l) || /^- پرسش‌های «/.test(l) || /^- در این نوبت فقط \*\*یک\*\* پرسش/.test(l)
  || /^- پرسش‌های همین مرحله \(/.test(l)                                   // فهرستِ مرحلهٔ بلوکِ زنده (همتای «- پرسش‌های «…»» ِ مربی) که سطرِ «یک پرسش» به آن اشاره می‌کند
  || /^- داورِ این مسئله هنوز انتخاب نشده: پیش از هر پرسشِ دیگر بپرس/.test(l)  // داورِ انتخاب‌نشده: همین سطر پرسشِ نوبت است (K5)
  || /^- همهٔ پرسش‌های این مرحله در صفحه یا گفت‌وگو پاسخ گرفته‌اند/.test(l);
const isCtxLine = (l) => /^- زمینه \(نه پرسشِ دوم\)/.test(l) || /^- \(زمینه، نه پرسشِ دوم/.test(l);
// تنها استثنای صریح (L2): سطرِ ایمنیِ بلوکِ «# تور» — ایمنی بر مربی مقدم است
const ALLOW = [{ head: /^# تور /, line: /^⚠ در این سشن نشانهٔ پریشانیِ جدی بود/ }];
const ASK = /(?:^|[^آ-ی])بپرس(?![آ-ی])/;
const ENDQ = /[؟?][»"')\].\s*]*$/;
// سطرهای سرگردانِ شناخته‌شده (دورِ ۱۲): نمونهٔ ثابتِ معلمِ خیالی، پرسشِ نقل‌شدهٔ قابِ عینی، «همان پرسش را … تکرار» (پرسشِ پیشین)
const STRAY = [/از خودم می‌پرسم: دقیقاً چه می‌خواهم/, /«روشن می‌بینی[^»]*[؟?][^»]*»/, /همان پرسش را با \*\*تغییرِ کوچک\*\* تکرار/];
function strictScan(user) {
  const head = String(user || '').split('# نوبتِ تازه')[0], bad = [];
  for (const bl of head.split(/\n(?=# )/)) {
    const h = bl.split('\n')[0]; if (!/^# /.test(h) || SKIP.test(h)) continue;
    const blockCtx = /\n- \(زمینه، نه پرسشِ دوم/.test(bl);
    for (const l of bl.split('\n')) {
      if (isTurnLine(l) || ALLOW.some(a => a.head.test(h) && a.line.test(l))) continue;
      const nq = l.replace(/«[^»]*»/g, '«»');
      if (ASK.test(nq)) bad.push('ASK  [' + h.slice(0, 30) + '] ' + l.slice(0, 160));
      else if (ENDQ.test(l.trim()) && !isCtxLine(l) && !blockCtx) bad.push('ENDQ [' + h.slice(0, 30) + '] ' + l.slice(0, 160));
      else if (!isCtxLine(l) && STRAY.some(re => re.test(l))) bad.push('STRAY[' + h.slice(0, 30) + '] ' + l.slice(0, 160));
    }
  }
  return bad;
}

(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
  const W = (ms) => p.waitForTimeout(ms || 90);
  const T0 = '2026-11-02';
  await p.goto(FILE); await p.waitForSelector('.nav'); await W(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__all = []; window.__q = []; window.__day = T0;
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); __all.push(String(user || '')); const r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
  }, T0);
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await W(140); };
  const sel = async (s, v) => { await p.selectOption(s, v); await W(120); };
  const click = async (s) => { await p.click(s); await W(160); };
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
    await p.evaluate(() => APP.ASSIST.toggle(false)); await W(60);
  };
  const newSess = () => p.evaluate(() => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => { const c = __calls.filter(x => !/^\[سامانه/.test(String(((x.user || '').split('# نوبتِ تازه\n')[1] || '')).trim())); return (c[c.length - 1] || __calls[__calls.length - 1] || {}).user || ''; });
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const coachOf = (u) => block(u, '# مربیِ حل');
  const liveOf = (u) => block(u, '# مسئلهٔ زندهٔ این سشن');
  const kOf = (u) => block(u, '# دانسته‌های قلمرو');
  const hasA = (u, id) => kOf(u).indexOf(' ' + id + ' ') >= 0;
  const sugOf = (c) => (/پیشنهادِ این نوبت: «([^\n]*?)»(?: \(|\. اگر|$)/.exec(c) || [])[1] || '';
  const lineOf = (c, re) => (c.split('\n').filter(l => re.test(l))[0] || '');
  const isCtx = (l) => /^- زمینه \(نه پرسشِ دوم\)/.test(l);
  const isTurn = (l) => /^- \*\*پرسشِ این نوبت همین است:\*\*/.test(l);
  const turnLines = (c) => c.split('\n').filter(isTurn);
  const first = async (msg) => { await newSess(); await say(msg); return await lastUser(); };
  const seq = async (msgs) => { await newSess(); for (const m of msgs) await say(m); return await lastUser(); };
  const strict = (name, u) => { const bad = strictScan(u); if (process.env.DUMP && bad.length) console.log('## ' + name + '\n  ' + bad.join('\n  ')); chk(!bad.length, 'L2 strict: «' + name + '» has ' + bad.length + ' line(s) outside the turn line with «بپرس», an unmarked «؟» ending or a known stray question: ' + JSON.stringify(bad.slice(0, 4))); };
  const mk = async (o) => { await go('e_prob', null, 'live'); await p.fill('#lpNewT', o.title); await p.fill('#lpNewS', o.st); await W(60); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return p.evaluate(() => APP.state.arg); };
  const pageSess = async (pid) => { await go('lprob', pid); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; }); };
  const sleepP = (pid) => p.evaluate(pid => { const x = APP.liveRec(pid); if (x) { x.dormant = '2099-01-01'; APP.S.put(x); } }, pid);
  const GUESS_LINE = /همین پیام حدس است/;

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  // ================= guess — L1 =================
  await section('guess', async () => {
    const r = info.guess = {};
    const S01 = 'سلام. سه ماهه دارم فایل اکسل پر می‌کنم که خونه بخرم یا اجاره‌نشین بمونم. ۴۷ تا ستون داره: نرخ تورم، قیمت متری محله‌ها، وام، اجاره، فاصله تا مهدکودک، ... هر روز یه ستون اضافه می‌کنم و هیچ تصمیمی نمی‌گیرم. فقط بگو بخرم یا نه؟';
    const NG = {
      s01p3: [S01, 'هوم... راستش اگه فکر کنم، مهم‌ترینش اینه که پسرم تا هفت سال آینده یه جای امن و ثابت داشته باشه که هی اسباب‌کشی نکنیم، و قسط یا اجاره بیشتر از ۴۰ درصد درآمدمون نشه. سود بیشتر اونقدرا مهم نیست.'],
      s01p6: [S01, 'خب... انتخابات شاید رو قیمت‌ها اثر بذاره ولی راستش هیچ‌کدومشون مستقیم به ۴۰٪ و هفت سال ربط ندارن. ولی می‌ترسم یه چیز مهم رو جا انداخته باشم. از کجا بدونم کِی دیگه بسه؟'],
      s03p5: ['سؤال: ثابت کنید از هر ۵ نقطه داخل یک مربع به ضلع ۱، دو تا هستند که فاصله‌شان حداکثر √۲/۲ است. اصلاً نمی‌دونم از کجا شروع کنم. مجهولش چیه؟',
        'آهان! دو نقطه داخل یه شکل، فاصله‌شون از بزرگ‌ترین فاصلهٔ اون شکل بیشتر نمیشه. قطر مربع کوچیک ½√۲ = √۲/۲ هست! و ۵ نقطه تو ۴ تا مربع، پس دو تا تو یه مربع می‌افتن. فکر کنم حل شد.'],
      s38p5: ['ساعت ۱۱ شبه، فردا ۸ صبح باید تحویل بدم. «حجم چهاروجهی‌ای رو پیدا کنید که دو یال روبه‌روش طول a دارن، بر هم عمودن و هر دو بر پاره‌خط به طول b که وسط‌هاشون رو وصل می‌کنه عمودن».',
        'اگه b=a باشه میشه a³/6؛ با مکعب به ضلع a که حجمش a³ه، به نظرم منطقیه. درسم اینه: وقتی قاعده و ارتفاع ندارم، شکل رو با یه صفحه به تکه‌هایی ببُرم که دارن. حالا برم بخوابم.'],
      s34p2: ['سه ماهه پروژه‌ی پایانی رو شروع نکردم. هر روز لپ‌تاپ رو باز می‌کنم و می‌بندم. احساس می‌کنم اصلاً استعدادشو ندارم. فکر کنم باید انصراف بدم.',
        'نمی‌دونم... فقط دلسردم. شاید یه اسکیس سایت. فقط یه اسکیس دستی از زمین پروژه، فردا صبح ۲۰ دقیقه.'],
      s27p2: ['سؤال مقاله‌ام: «آیا ماشین می‌تونه زبان رو بفهمه؟» هر چی می‌خونم یه نفر میگه آره یه نفر میگه نه. شما خودت که ماشینی، بگو می‌فهمی یا نه؟',
        'خب «فهمیدن» یعنی... یه بار فکر می‌کنم یعنی درست جواب دادن، یه بار یعنی تجربه‌ی درونی داشتن، یه بار یعنی وصل کردن معنی کلمه‌ها به چیزای دنیا. نمی‌دونم کدوم.'],
      s13p3: ['همکارم فاکتورهای ناهار رو هر بار ۵۰-۱۰۰ هزار تومن بیشتر ثبت می‌کنه. دوست صمیمیمه، بچه مریض داره. اگه گزارش بدم اخراج می‌شه. اگه ندم خودم شریک جرمم. قانون چی میگه؟ درستش چیه؟',
        'شریک جرم یعنی... راستش نمی‌دونم دقیقاً. فکر کنم یعنی کسی که می‌دونه و چیزی نمیگه؟ یا کسی که ازش سود می‌بره؟ من که سودی نمی‌برم. پس شاید مبهم بوده برام.'],
      s11p3: ['یه صفحه ۱۰×۱۰ که دو گوشه‌ی مقابلش رو برداشتن. می‌خوام با دومینوهای ۱×۲ کاملش کنم. برنامه‌ی backtracking نوشتم، یه ساعته داره می‌چرخه. کجای کدم اشتباهه؟',
        '۲×۲ و ۴×۴ رو دستی امتحان کردم، نشد. حالا فکر می‌کنم اصلاً نمیشه. ولی چطور ثابتش کنم؟ ۹۸ که زوجه!'],
    };
    r.ng = {};
    for (const [k, msgs] of Object.entries(NG)) {
      const u = await seq(msgs), c = coachOf(u);
      r.ng[k] = { guess: GUESS_LINE.test(c), sug: sugOf(c).slice(0, 110), turn: turnLines(c).map(l => l.slice(0, 400)), hyp: hasA(u, 'pr_hypothesis_testing') };
      strict('guess ' + k, u);
    }
    chk(!Object.values(r.ng).some(x => x.guess || /می‌آزمایی/.test(x.sug)), 'L1 guess: none of the report\'s non-guesses is a guess — conditional «اگه فکر کنم،», self-cancelled «شاید X ولی … ربط ندارن», verdict after own result «فکر کنم حل شد»/«به نظرم منطقیه», own chosen step «شاید یه اسکیس… فردا صبح», candidate meanings «X یعنی…؟»/«نمی‌دونم کدوم», tested + asks proof ' + JSON.stringify(r.ng));
    chk(!Object.values(r.ng).some(x => x.hyp), 'L1 guess: a false guess no longer pulls pr_hypothesis_testing into «دانسته‌های قلمرو» (noise in s01 p3/p6, s13 p3, s27 p2, s34 p2) ' + JSON.stringify(Object.fromEntries(Object.entries(r.ng).map(([k, x]) => [k, x.hyp]))));
    const A038 = (x) => x.turn.some(l => /به تعریف‌ها برگرد/.test(l)) && /^به تعریف‌ها برگرد/.test(x.sug);
    chk(A038(r.ng.s27p2) && A038(r.ng.s13p3) && /«فهمیدن»/.test(r.ng.s27p2.sug) && /«شریک جرم»/.test(r.ng.s13p3.sug), 'L1 guess: candidate meanings / a definition question ⇒ A038 «به تعریف‌ها برگرد» with his own word is the ONE turn question (s27 p2, s13 p3) ' + JSON.stringify({ s27: r.ng.s27p2, s13: r.ng.s13p3 }));
    chk(/نشدن را لازم می‌آورد/.test(r.ng.s11p3.sug) && r.ng.s11p3.turn.length === 1, 'L1 guess: already tested + asks for a proof ⇒ the proof question (C145 family) is the turn question, not the test question (s11 p3) ' + JSON.stringify(r.ng.s11p3));
    // حدس‌های واقعی همچنان (K2)
    const isG = (c) => GUESS_LINE.test(c) && /می‌آزمایی/.test(sugOf(c));
    const G = {
      s21p2: ['سلام. من بردیا هستم ۱۲ سالمه. مسئله: سفید بازی می‌کند و در دو حرکت مات می‌کند. FEN: 5k2/8/5K2/8/8/8/8/R2Q4 w - - 0 1 .', 'شاه سفید f6، وزیر سفید d1، رخ سفید a1 گوشه، شاه سیاه f8. معمولاً اول همه‌ی کیش‌ها رو امتحان می‌کنم: وزیر d8 کیش، وزیر d7 کیش. هر دفعه شاه میره e8 یا g8. اون رخ گوشه به نظرم بی‌فایده‌ست، فقط تزئینیه. می‌خوام خودم حلش کنم، جوابو نگو.'],
      s22p1: ['از صندوق کلاس ۳ میلیون کم شده. فقط سه نفر کلید داشتن: سرایدار، معاون و منشی. سرایدار اون روز دیرتر رفته. معاون میگه منشی رو دیده که دم صندوق بوده. می‌خوام بفهمم کار کی بوده. به نظرم کار سرایداره چون دیر رفته، می‌خوام همین امروز باهاش برخورد کنم.'],
      s23p1: ['سلام. دستور کیک مادرم برای قالب گرد ۲۰ سانتیه: ۳ تخم‌مرغ، ۱ پیمونه شکر، ۲ پیمونه آرد، ۱۰۰ گرم کره. قالب من مستطیل ۲۵ در ۳۵ه. همه چی رو چند برابر کنم؟ گفتم شاید ۳۵ تقسیم بر ۲۰، یعنی ۱.۷۵ برابر. می‌خوام خودم بفهمم.'],
      s26p1: ['سه نفریم، یه موتور داریم که فقط دو نفر سوار می‌شن، سرعتش ۴۰ کیلومتر، پیاده هم ۵ کیلومتر. ایستگاه ۳۰ کیلومتره. قطار ۲ ساعت دیگه حرکت می‌کنه. می‌رسیم؟ به نظرم نه، نفر سوم ۶ ساعت پیاده‌ست.'],
      s29p1: ['۴۰ متر لبه‌ی سنگی دارم برای یه باغچه‌ی چهارضلعی. بزرگ‌ترین باغچه چه شکلیه؟ به نظرم مستطیل باریک و بلند چون جای گل بیشتر داره. بعد هم می‌خوام یه حوض گرد بذارم که به سه تا مسیر باغ مماس باشه، جای مرکزشو چطوری پیدا کنم؟'],
    };
    r.hit = {};
    for (const [k, msgs] of Object.entries(G)) { const u = await seq(msgs), c = coachOf(u); r.hit[k] = { g: isG(c), sug: sugOf(c).slice(0, 40), hyp: hasA(u, 'pr_hypothesis_testing') }; }
    chk(Object.values(r.hit).every(x => x.g && x.hyp), 'L1 guess: the true guesses are still detected (s21 p2, s22 p1, s23 p1, s26 p1, s29 p1) — turn question «چطور می‌آزمایی‌اش؟» and pr_hypothesis_testing ' + JSON.stringify(r.hit));
    // مسیرِ زنده: turn.guess از همان تابع (s29 p7 حدس؛ s03 p5 / s11 p3 نه)
    const P = await mk({ title: 'پنج نقطه در مربعِ واحد', st: 'ثابت کنید از هر ۵ نقطه داخل یک مربع به ضلع ۱، دو تا هستند که فاصله‌شان حداکثر √۲/۲ است.', nat: 'objective' });
    await pageSess(P);
    r.live = await p.evaluate(pid => { const s = APP.ASSIST.cur(), T = (m) => APP.ASSIST.coachTurn(s, pid, m) || {};
      const a = T('آهان! قطر مربع کوچیک √۲/۲ هست و ۵ نقطه تو ۴ تا مربع، پس دو تا تو یه مربع می‌افتن. فکر کنم حل شد.'), b = T('۲×۲ و ۴×۴ رو دستی امتحان کردم، نشد. حالا فکر می‌کنم اصلاً نمیشه. ولی چطور ثابتش کنم؟'), g = T('فکر کنم مرکز وسطِ بینِ A و C و روی نیمسازِ A و B است.');
      return { s03: { guess: !!a.guess, result: !!a.result }, s11: { guess: !!b.guess }, s29: { guess: !!g.guess } }; }, P);
    chk(!r.live.s03.guess && r.live.s03.result && !r.live.s11.guess && r.live.s29.guess, 'L1 guess: on a live problem turn.guess follows the same function — «فکر کنم حل شد» after his own proof is a result (look-back path), tested + proof is not a guess, «فکر کنم مرکز … است» is (s03 p5, s11 p3, s29 p7) ' + JSON.stringify(r.live));
    await say('آهان! دو نقطه داخل یه شکل، فاصله‌شون از بزرگ‌ترین فاصلهٔ اون شکل بیشتر نمیشه. قطر مربع کوچیک ½√۲ = √۲/۲ هست! و ۵ نقطه تو ۴ تا مربع، پس دو تا تو یه مربع می‌افتن. فکر کنم حل شد.');
    const uL = await lastUser(), cL = coachOf(uL);
    r.liveS03 = { guess: GUESS_LINE.test(cL), guard: /می‌گوید حل شد، ولی صفحه هنوز/.test(cL) };
    chk(!r.liveS03.guess && r.liveS03.guard, 'L1 guess: s03 p5 on the live page — no guess line; the guard «می‌گوید حل شد ولی صفحه هنوز … — تأیید نکن» is back ' + JSON.stringify(r.liveS03));
    strict('guess live s03', uL);
    await sleepP(P);
  });

  // ================= struct — L2: کلِ پرامپت =================
  await section('struct', async () => {
    const r = info.struct = {};
    // غربال (a32): «پرسش‌های بدهکار» زمینه است (s26 p2–p5)
    await newSess();
    await p.evaluate(() => { const s = APP.ASSIST.cur(); s.tour = { goal: 'سه نفر و یک موتور', facets: [{ key: 'f1', kind: 'problem', title: 'سه نفر، یک موتور و قطار', status: 'now' }], diag: { recur: { st: 'ask' } } }; APP.S.put(s); });
    await say('سه نفریم، یه موتور داریم که فقط دو نفر سوار می‌شن. گیر کردم، نمی‌دونم از کجا شروع کنم.');
    const uS = await lastUser(), sv = block(uS, '# غربالِ لایه‌ها'), owe = lineOf(sv, /پرسش‌های بدهکار/);
    r.sieve = { has: !!owe, ctx: isCtx(owe), line: owe.slice(0, 90) };
    chk(r.sieve.has && r.sieve.ctx && !/بپرس/.test(owe.replace(/«[^»]*»/g, '')), 'L2 struct: the sieve\'s «پرسش‌های بدهکار» is context, never a second question beside the turn question (a32, s26 p2–p5) ' + JSON.stringify(r.sieve));
    strict('sieve', uS);
    // 🌱 (a36) بی بلوکِ مربی: نوبتِ خودکارِ سامانه پس از دلسردی (s34 p3)
    await newSess();
    await say('سه ماهه پروژه رو شروع نکردم، احساس می‌کنم استعدادشو ندارم. فکر کنم باید انصراف بدم.');
    const uW = await p.evaluate(() => APP.ASSIST.prompt(APP.ASSIST.cur(), '[سامانه: فرم باز شد و فیلدها پر شد]', APP.ASSIST.scan()));
    const wb = block(uW, '# پس از شکست، نقد یا میلِ رها کردن');
    r.will = { has: !!wb, coach: !!coachOf(uW), ask: /بپرس/.test(wb.replace(/«[^»]*»/g, '')) };
    chk(r.will.has && !r.will.ask, 'L2 struct: the 🌱 WILL_RULES block carries no unmarked «بپرس» — also on a turn with no coach block (a36, s34 p3) ' + JSON.stringify(r.will));
    strict('will (no coach)', uW);
    // 💡 (a35): سطرِ idea_counter زمینه است (s20 p1/p4/p5)
    await newSess();
    await p.evaluate(() => __q.push(R({ reply: 'ثبت کردم.', actions: [{ do: 'idea_new', what: 'می‌خوام یه کانالِ آموزشِ آشپزی بزنم' }, { do: 'idea_add', part: 'assumption', t: 'همه وقتِ آشپزی دارند' }] })));
    await say('یه ایده دارم: می‌خوام یه کانالِ آموزشِ آشپزی بزنم');
    await say('ولی خواهرم شاغله و هیچ وقتی برای آشپزی نداره.');
    const uI = await lastUser(), ib = block(uI, '# ایده');
    r.idea = { has: !!ib, line: lineOf(ib, /idea_counter روی همان فرض/).slice(0, 80) };
    chk(r.idea.has && isCtx(lineOf(ib, /idea_counter روی همان فرض/)) && !/بپرس/.test(ib.replace(/«[^»]*»/g, '')), 'L2 struct: the «💡 ایده» counter-case rule is context without «بپرس» (a35:201, s20) ' + JSON.stringify(r.idea));
    strict('idea', uI);
    // مربی: معلمِ خیالی بی نمونهٔ ثابت؛ قاعدهٔ سکوت ⇒ پرسشِ همین نوبت
    const uC = await first('یه مسئله دارم: سه تا عدد فرد که جمعشون ۳۰ بشه پیدا کن. نمی‌دونم.');
    const cC = coachOf(uC), tl = lineOf(cC, /معلمِ خیالی/), sl = lineOf(cC, /سکوت، «نمی‌دونم»/);
    r.coach = { teacher: tl.slice(0, 60), fixed: /از خودم می‌پرسم: دقیقاً/.test(tl), silence: sl.slice(0, 60), prev: /همان پرسش را با/.test(sl), ctx: isCtx(tl) && isCtx(sl) };
    chk(tl && !r.coach.fixed && sl && !r.coach.prev && /پرسشِ همین نوبت/.test(sl) && r.coach.ctx, 'L2 struct: the imaginary-teacher line has no fixed example question (turn question or none) and the silence rule points to THIS turn\'s question, both context (a27:1489–1490) ' + JSON.stringify(r.coach));
    strict('coach generic', uC);
    // قابِ عینیِ بلوکِ زنده: بی «روشن می‌بینی…؟» ِ نقل‌شده (s11 p3/p4)
    const P = await mk({ title: 'دومینو روی صفحهٔ بریده', st: 'صفحهٔ ۱۰×۱۰ که دو گوشهٔ مقابلش برداشته شده با دومینوهای ۱×۲ کامل پوشانده می‌شود؟', nat: 'objective' });
    await pageSess(P); await say('هنوز نمی‌دونم از کجا شروع کنم.');
    const uO = await lastUser(), lb = liveOf(uO), fr = lineOf(lb, /پاسخِ عینی دارد/);
    r.frame = { has: !!fr, q: /«روشن می‌بینی[^»]*[؟?]/.test(fr) };
    chk(r.frame.has && !r.frame.q, 'L2 struct: the objective-frame line of the live block quotes no question of its own («روشن می‌بینی… ثابتش کنی؟») (a27:1206) ' + JSON.stringify(r.frame));
    strict('live objective', uO);
    await sleepP(P);
    // کلِ پرامپت‌های فیکسچرهای دورهای ۷ تا ۱۲ + همین آزمون
    const S = r.all = { own: 0, files: {}, bad: [] };
    const own = await p.evaluate(() => window.__all.slice());
    S.own = own.length;
    own.forEach((u, i) => { if (!/# نوبتِ تازه/.test(u)) return; const bad = strictScan(u); if (bad.length) S.bad.push(['self#' + i, bad]); });
    if (process.env.LLA_STRUCT_FIX !== '0') {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lla-tap12-'));
      const files = fs.readdirSync(__dirname).filter(f => /^test_tour1_r(?:7|8|9|10|11|12)(?:_[a-z0-9]+)?\.js$/.test(f) && f !== path.basename(__filename)).sort();
      const run = (f) => new Promise((res) => {
        const out = path.join(dir, f + '.jsonl'), ch = spawn(process.execPath, ['-r', path.join(__dirname, 'prompt_tap.js'), path.join(__dirname, f)], { cwd: path.join(__dirname, '..'), env: Object.assign({}, process.env, { LLA_PROMPT_TAP: out, LLA_STRUCT_FIX: '0', ONLY: '', DUMP: '' }), stdio: 'ignore' });
        const to = setTimeout(() => { try { ch.kill('SIGKILL'); } catch (e) { } }, 600000);
        ch.on('exit', () => { clearTimeout(to); res(out); });
      });
      const queue = files.slice(), JOBS = Math.max(1, +(process.env.LLA_TAP_JOBS || 2));
      await Promise.all(Array.from({ length: JOBS }, async () => { while (queue.length) { const f = queue.shift(); const out = await run(f); let n = 0;
        try { for (const row of fs.readFileSync(out, 'utf8').split('\n').filter(Boolean)) { const { user } = JSON.parse(row); if (!/# نوبتِ تازه/.test(user)) continue; n++; const bad = strictScan(user); if (bad.length) S.bad.push([f + '#' + n, bad]); } } catch (e) { }
        S.files[f] = n; } }));
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { }
      chk(Object.keys(S.files).length >= 7 && Object.values(S.files).filter(n => n > 0).length >= 6, 'L2 struct: the r7–r12 fixtures were replayed through the prompt tap and produced prompts ' + JSON.stringify(S.files));
    }
    if (process.env.DUMP) S.bad.forEach(x => console.log('## ' + x[0] + '\n  ' + x[1].join('\n  ')));
    const sig = {}; S.bad.forEach(x => x[1].forEach(l => { const k = l.slice(0, 70); sig[k] = (sig[k] || 0) + 1; }));
    S.badN = S.bad.length; S.sig = sig; delete S.bad;
    chk(!S.badN, 'L2 struct (whole prompt): in ' + (S.own + Object.values(S.files).reduce((a, n) => a + n, 0)) + ' prompts, no line outside the turn line (and the stage list) may contain «بپرس», end with an unmarked «؟» or carry a known stray question — the only explicit exception is the tour SAFETY line — ' + S.badN + ' prompt(s) fail: ' + JSON.stringify(sig).slice(0, 3000));
  });

  // ================= idea — L3: یادداشت برای کاربر =================
  await section('idea', async () => {
    const r = info.idea = {};
    await newSess();
    await p.evaluate(() => __q.push(R({ reply: 'ثبت کردم.', actions: [{ do: 'idea_new', what: 'می‌خوام یه کانالِ آموزشِ آشپزی بزنم' }, { do: 'idea_add', part: 'assumption', t: 'همه وقتِ آشپزی دارند' }] })));
    await say('یه ایده دارم: می‌خوام یه کانالِ آموزشِ آشپزی بزنم');
    const i = await p.evaluate(() => { const s = APP.ASSIST.cur(), x = APP.S.get(s.idea); return x.parts.findIndex(y => y.k === 'assumption'); });
    await p.evaluate(i => __q.push(R({ reply: 'نقدت را ثبت کردم.', actions: [{ do: 'idea_counter', i, t: 'خواهرم شاغل است و هیچ وقتی برای آشپزی ندارد' }] })), i);
    await say('ولی خواهرم شاغله و هیچ وقتی برای آشپزی نداره.');
    const sysMsgs = await p.evaluate(() => (APP.ASSIST.cur().msgs || []).filter(m => m.role !== 'user' && m.role !== 'ai').map(m => String(m.text || '')));
    const shown = await p.evaluate(() => document.querySelector('.as-panel') ? document.querySelector('.as-panel').textContent : '');
    const note = sysMsgs.filter(t => /مثالِ نقض/.test(t)).pop() || '';
    r.note = note.slice(0, 160); r.leak = /از کاربر بپرس|بپرس/.test(note) || /از کاربر بپرس/.test(shown);
    chk(note && !r.leak && /خودت/.test(note), 'L3 idea: the idea_counter confirmation in the chat is written FOR the user — no «از کاربر بپرس» instruction leak (s20 p4/p5) ' + JSON.stringify(r));
    // نوبتِ بعد: همان یادداشت در گفت‌وگوی پرامپت هم دستورِ «بپرس» نیست
    await say('باشه، پس فقط کسایی که عصرها خونه‌ان.');
    const u = await lastUser(), conv = block(u, '# گفت‌وگو تا این لحظه');
    r.conv = /از کاربر بپرس/.test(conv);
    chk(!r.conv, 'L3 idea: the note that reaches the next prompt\'s conversation carries no «از کاربر بپرس» ' + JSON.stringify(r.conv));
    r.neg = await p.evaluate(i => APP.ASSIST.DO.idea_counter({ i, t: 'یک مثالِ دیگر', nt: 'بازار اشباع است و هیچ‌کس پول نمی‌دهد' }), i);
    chk(!/بپرس/.test(r.neg) && /واژه‌های خودت/.test(r.neg), 'L3 idea: a rewrite not in his words — the note tells him the rewrite is his (no instruction leak) ' + JSON.stringify(r.neg));
  });

  // ================= prov — L6: ضدِ ضرب‌المثل =================
  await section('prov', async () => {
    const r = info.prov = { cases: [] };
    /* همان وضعِ s25 p6 / s26 p4: ضرب‌المثل‌های دیگرِ مرحله در همین سشن مصرف شده‌اند و نوبت به «سخت‌کوشی مادرِ خوش‌شانسی است» (C154، ته‌نشینی، پس از گیر) می‌رسد —
       ضدش (C153 «جایی که اراده‌ای هست…») همین حالا در سطرِ «گامِ کوچک» ِ همان بلوک است */
    const seed = () => p.evaluate(() => { const AS = APP.ASSIST, s = AS.cur(), K = ['u', 'goal', 'five', 'p', 'rel', 'p2', 'switch', 'c', 'cobj', 'back', 'want', 'b', 'new', 'will', 'incub'];
      const L = [].concat.apply([], ['u', 'p', 'c', 'b'].map(x => AS.polyaProverbsFor(x, K) || [])); s.coach = s.coach || {};
      s.coach.prov = L.filter(x => x.id !== 'C154').map(x => x.id || x.q); APP.S.put(s); return L.some(x => x.id === 'C154'); });
    const norm = (t) => String(t || '').replace(/[\s‌«»"'.،,؛:!…—\-()]+/g, '');
    const pvOf = (l) => ((/\): «([^»]+)»/.exec(l) || [])[1] || '');
    for (const m of ['سه نفریم و یه موتور داریم؛ گیر کردم، باز نشد، نتونستم.', 'طرحم اینه که اول جدول بکشم. ولی گیر کردم و خسته شدم.']) {
      await newSess(); r.seeded = await seed(); await say(m);
      const c = coachOf(await lastUser()), l = lineOf(c, /^- ضرب‌المثلِ همین مرحله/), om = /ضدی هم دارد \(«([^»]+)»\)/.exec(l), opp = om ? om[1] : '';
      const rest = c.split('\n').filter(x => !/^- ضرب‌المثلِ همین مرحله/.test(x)).join('\n'), kk = norm(opp).slice(0, 18);
      r.cases.push({ m: m.slice(0, 14), pv: pvOf(l).slice(0, 26), opp: opp.slice(0, 30), dup: !!kk && kk.length >= 8 && norm(rest).indexOf(kk) >= 0 });
    }
    chk(r.seeded && r.cases.some(x => x.pv) && !r.cases.some(x => x.dup), 'L6 prov: the counter-proverb (PROV_OPP) shown with the stage proverb is never a quote already in the same block (s25 p6, s26 p4: «جایی که اراده‌ای هست…» of the small-step line) ' + JSON.stringify(r));
  });

  // ================= cert — L6: «معلومه» =================
  await section('cert', async () => {
    const r = info.cert = {};
    const u = await first('دو تا بچه دارم، یکیش پسره. احتمال اینکه اون یکی هم پسر باشه چنده؟ معلومه ۱/۲ دیگه، هر بچه جدا پسر یا دختره.');
    r.s28 = { line: isCtx(lineOf(coachOf(u), /یقینِ بی‌آزمون/)), bias: hasA(u, 'md_cognitive_biases') };
    chk(r.s28.line && r.s28.bias, 'L6 cert: «معلومه ۱/۲ دیگه» is untested certainty ⇒ the B107 context line and md_cognitive_biases (s28 p1) ' + JSON.stringify(r.s28));
    r.forms = await p.evaluate(() => ['واضحه که جوابش ۵ه.', 'بدیهیه که همیشه جواب میده.', 'شکی نیست که کار خودشه.'].map(m => APP.ASSIST.coachLines({ ph: 'u', s: null, mt: m, dry: true }).indexOf('یقینِ بی‌آزمون') >= 0));
    chk(r.forms.every(Boolean), 'L6 cert: «واضحه»، «بدیهیه»، «شکی نیست» are the same family ' + JSON.stringify(r.forms));
    r.ctl = await p.evaluate(() => APP.ASSIST.coachLines({ ph: 'u', s: null, mt: 'خب معلومه دیگه، بهترین تصمیم مالی. همینو می‌خوام.', dry: true }).indexOf('یقینِ بی‌آزمون') >= 0);
    chk(!r.ctl, 'L6 cert: control — «معلومه دیگه، بهترین تصمیم مالی» (what she wants, not a claim) is not B107 ' + JSON.stringify(r.ctl));
  });

  // ================= lesson — L6: پس از بستن =================
  await section('lesson', async () => {
    const r = info.lesson = {};
    await newSess();
    await p.evaluate(() => __q.push(R({ reply: 'ثبت شد.', actions: [{ do: 'chat_solved', title: 'سه نفر، یک موتورِ دونفره، قطار', statement: 'سه نفر و یک موتورِ دونفره با سرعتِ ۴۰؛ پیاده ۵؛ ایستگاه ۳۰ کیلومتر؛ قطار ۲ ساعت دیگر. می‌رسیم؟', kind: 'find', unknown: 'کمترین زمانِ رسیدنِ هر سه نفر', lesson: 'وقتی معادله کم است، دنبالِ بخشی از شرط بگردم که هنوز معادله نشده — مثلاً تقارن', check: 'x و y را در هر سه معادله گذاشتم؛ برقرارند' }] })));
    await say('حلش کردم: با تقارن معادلهٔ چهارم درومد و هر سه زیر دو ساعت می‌رسن. درسم اینه: وقتی معادله کم است، دنبالِ بخشی از شرط بگردم که هنوز معادله نشده — مثلاً تقارن؛ x و y را در هر سه معادله گذاشتم؛ برقرارند');
    await say('هنوز نمی‌دونم. گیرم، نمی‌فهمم معادله‌ی چهارم از کجا میاد.');
    const u = await lastUser(), c = coachOf(u);
    r.p5 = { sb: !!block(u, '# مسئلهٔ حل‌شدهٔ مرتبط'), sug: sugOf(c).slice(0, 160), turn: turnLines(c).map(l => l.slice(0, 60)), u1: /^مجهول/.test(sugOf(c)) };
    chk(r.p5.sb && /درسِ خودت در بازنگریِ همین مسئله/.test(r.p5.sug) && /تقارن/.test(r.p5.sug) && !r.p5.u1 && r.p5.turn.length === 1, 'L6 lesson: after closing, a short «نمی‌دونم…» about the closed problem ⇒ his own look-back lesson is the ONE turn question, not u1 «مجهول چیست؟» (s26 p5) ' + JSON.stringify(r.p5));
    strict('lesson s26 p5', u);
    // کنترل: مسئلهٔ تازهٔ بلند پس از بستن ⇒ «فهم» (همان پیشین)
    await say('یه مسئلهٔ تازه دارم: چهار نفریم و دو تا دوچرخه داریم که هر کدوم یه نفر می‌بره، سرعت دوچرخه ۱۵ و پیاده ۵، مقصد ۲۰ کیلومتر. کمترین زمان رسیدن همه چقدره؟ نمی‌دونم.');
    const c2 = coachOf(await lastUser());
    r.ctl = { lesson: /درسِ خودت در بازنگریِ همین مسئله/.test(sugOf(c2)) };
    chk(!r.ctl.lesson, 'L6 lesson: control — a new long problem after closing is not the lesson moment ' + JSON.stringify(r.ctl));
  });

  // ================= terr — L7 =================
  await section('terr', async () => {
    const r = info.terr = {};
    const reg = await p.evaluate(() => { const x = APP.SYST.byId('pr_statistical'); return { cues: ((x && x.a && x.a.cues_fa) || []).length, node: !!(APP.SOURCES && APP.SOURCES.nodeOf && APP.SOURCES.nodeOf('terr:pr_statistical')) }; });
    r.reg = reg;
    chk(reg.cues > 0, 'L7 terr: pr_statistical carries explicit cues_fa in the territory registry (same mechanism as sc_negotiation) ' + JSON.stringify(reg));
    await newSess();
    await say('آمار رو دو بار افتادم. همه‌ی فرمول‌ها رو حفظم، ولی سر جلسه نمی‌دونم کدومو کجا بزنم. یه جزوه‌ی خلاصه بده که فقط فرمول‌ها و «کی کدوم» توش باشه.');
    const u1 = await lastUser();
    await say('خب: t = (960-988)/(20/√25) = -28/4 = -7. بعد گفتم احتمال = ۱ + ۰.۳ ... یعنی تقریباً ۱.۳ شد. جواب ۱.۳.');
    const u3 = await lastUser();
    await say('حدسم... میانگین نمونه وسط همون داده‌هاست، پس فاصله‌ها ازش کوچیک‌تر از فاصله تا میانگین واقعیه. پس کوچیک‌تر نشون می‌ده، و برای جبران تقسیم بر عدد کوچیک‌تر می‌کنیم؟ ولی چرا دقیقاً یکی کمتر؟');
    const u9 = await lastUser();
    r.s14 = { p1: hasA(u1, 'pr_statistical'), p3: hasA(u3, 'pr_statistical'), p9: hasA(u9, 'pr_statistical'), ind9: hasA(u9, 'a_induction') };
    chk(r.s14.p1 && r.s14.p3 && r.s14.p9, 'L7 terr: s14 (statistics) reaches pr_statistical from the problem\'s own statement (cues_fa), at p1, p3 (σ/√n) and p9 (n−1) ' + JSON.stringify(r.s14));
    chk(!r.s14.ind9, 'L7 terr: «حدسم … پس …» explaining a formula (exam help) does not show a_induction — B162\'s area only for an induction from instances (s14 p9) ' + JSON.stringify(r.s14));
    // کنترل: استقرا از نمونه‌ها همچنان a_induction (s07 p2 ِ دورِ ۱۱)
    await newSess();
    await say('۵ تا گلدون لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور گذاشتم. قدشون بعد از ۳ هفته: ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. قانونش چیه؟');
    await say('تفاضل‌ها ۵، ۴، ۳، ۱ شدن، پس خطی نیست، کند میشه. حدسم اشباعه. یه مقاله هم پیدا کردم دربارهٔ اشباع فتوسنتز. پس ثابت شد دیگه، قانونش اشباعه!');
    const u7 = await lastUser(); r.s07 = { ind: hasA(u7, 'a_induction') };
    chk(r.s07.ind, 'L7 terr: control — «پس ثابت شد» from instances still brings a_induction (s07 p2) ' + JSON.stringify(r.s07));
    // کنترل: E6 — پیامِ بی‌ربط حوزهٔ آمار را نمی‌آورد
    const un = await first('امروز هوا خوب بود و یه کم پیاده‌روی کردم، بعد چای خوردم.');
    r.ctl = hasA(un, 'pr_statistical');
    chk(!r.ctl, 'L7 terr: control — an unrelated message gets no pr_statistical ' + JSON.stringify(r.ctl));
  });

  // ================= openph — بیرون از صفحه: فهرستِ مربی هم‌مرحلهٔ مسئلهٔ باز (هماهنگی با «live») =================
  await section('openph', async () => {
    const r = info.openph = {};
    const hasEl = (s) => p.locator(s).count(), fillIf = async (s, v) => { if (await hasEl(s)) await p.fill(s, v); };
    const P = await mk({ title: 'باغچهٔ بزرگ', st: 'با ۴۰ متر لبه بزرگ‌ترین باغچهٔ چهارضلعی چه شکلی است؟', nat: 'objective' });
    await p.fill('#lpOne', 'بزرگ‌ترین مساحت با محیطِ ثابت'); await p.fill('#lpWhy', 'برایم مهم است و کنجکاوم'); await click('main .lp-onesave');
    await p.fill('#lpUnk', 'شکلِ با بیشترین مساحت'); await p.fill('#lpD_d1', 'محیط ۴۰ متر'); await p.fill('#lpD_d2', 'چهارضلعی'); await p.fill('#lpCond', 'محیط ثابت و مساحت بیشینه');
    if (await hasEl('#lpSat')) await sel('#lpSat', 'yes');
    await sel('#lpSuff', 'ناکافی است — چیزی کم است').catch(() => {}); await fillIf('#lpSuffW', 'هنوز همه را نمی‌دانم'); await fillIf('#lpSuffChal', 'همهٔ داده‌ها با هم آن را معین می‌کنند');
    if (await hasEl('#lpDep')) await sel('#lpDep', 'no');
    await fillIf('#lpGuess', 'مربع'); if (await hasEl('#lpConf')) await sel('#lpConf', '60'); await fillIf('#lpTest', 'با یک حالتِ خاص می‌آزمایم');
    if (await hasEl('#lpIfRef')) await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
    await click('main .lp-usave'); if (await hasEl('main .lp-u .sv-g2')) await click('main .lp-u .sv-g2');
    r.ph = await p.evaluate(pid => APP.livePhase(pid), P);
    const u = await first('دربارهٔ باغچهٔ بزرگ با ۴۰ متر لبه فکر کردم ولی هنوز راهی برای مساحتِ بیشینه ندارم.');
    const c = coachOf(u); r.head = (/مرحلهٔ محتمل: ([^·]+)/.exec(c.split('\n')[0]) || [])[1] || ''; r.list = (/^- پرسش‌های «([^»]+)»/m.exec(c) || [])[1] || ''; r.live = !!liveOf(u);
    chk(r.ph === 'p' && !r.live && /طرح/.test(r.head) && /طرح/.test(r.list), 'openph: off the page, a message about the one open problem (in planning) gets the coach header and list of THAT phase, not «فهمِ مسئله» ' + JSON.stringify(r));
    strict('openph', u);
    await sleepP(P);
  });

  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 16000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
