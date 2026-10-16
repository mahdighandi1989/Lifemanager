// تورِ پولیا (دستهٔ ۱، دورِ ۶ ِ اصلاح، ۲۰۲۶-۱۰-۱۶) — سهمِ «coach» از DECISIONS_R6:
//  G1  نشانه‌های نوبت برای (مسئله، پیامِ بعدیِ کاربر) — گیر/شکستِ پیامِ پیشین فقط برای همان مسئله؛ «نتیجه» فقط یک نوبت و با گیر/پرسش/حدس پاک؛
//      «…درسته؟» پس از مقدار حدس است («چطور می‌آزمایی‌اش؟»)؛ statedParts هرگز «[پاسخ گرفته]» نمی‌زند؛ معمای چسبانده‌ای که پیامِ خودش کار رویش را می‌گوید
//      ⇒ گزارشِ {ph:p, stuck} پذیرفته (⇒ «از خواسته به عقب»).
//  G3  دقتِ سطرهای F6: A191 فقط پیامِ معرفیِ مسئله و یک بار؛ A044 فقط دو مجهولِ متفاوت؛ A263 فقط GEN_RE؛ B162 هر جا استدلالِ محتمل به‌جای برهان؛
//      C107 «کل قانونم خراب شد»، «استثناست، نادیده بگیرم؟» و ردِ ثبت‌شده در صفحه؛ B231 بی واژهٔ «حدس»؛ A073 «شما که ماشینی، بگو» و «چرا X؟»؛
//      heurClaim «۱۰ تا چک کردم… اثباته»؛ BRUTE_RE «همه‌ی کیش‌ها رو امتحان»؛ سطرهای معلم (A167/A129) فقط در لحظهٔ خودشان.
//  G4  نتیجه‌های «⇒ ۱۳/۲۷»، «یعنی ۱/۳!»، «… پرونده رو بستم. حالا …»؛ «حل کردم و یه مسئلهٔ تازه ساختم: Y»؛ سطرِ هدفِ میانهٔ کار و «داده‌ها؟» پس از کاربستِ داده؛
//      سرواژهٔ مرحله هم‌خوان با پرسشِ نوبت.
//  G7  «🌱 ثبتِ گامِ کوچک» در جا تأیید می‌کند و فرم را پاک می‌کند.
// همه از رابطِ واقعی (پنجرهٔ دستیار با مدلِ بدلیِ «میانگینِ لفظی»، کنش‌های مدل، فرم‌های «🔭»). خروج با کدِ غیرصفر در خطا.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(200);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = APP.today();
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); const r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    // هر فراخوانِ liveCoach با نشانه‌های نوبت ضبط می‌شود (رفتار دست نمی‌خورد)
    const orig = APP.liveCoach; window.__lc = [];
    APP.liveCoach = function (pid, opts) { if (opts && opts.turn) window.__lc.push(Object.assign({ pid }, JSON.parse(JSON.stringify(opts.turn)))); return orig.apply(this, arguments); };
  });
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
  };
  const newSess = () => p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => (__calls[__calls.length - 1] || {}).user || '');
  const lastTurn = () => p.evaluate(() => __lc[__lc.length - 1] || null);
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const coachOf = (u) => block(u, '# مربیِ حل');
  const liveOf = (u) => block(u, '# مسئلهٔ زندهٔ این سشن');
  const phOf = (c) => (/مرحلهٔ محتمل: ([^·—(]+?)\s*(?:·|—|\()/.exec(c) || [])[1] || '';
  const sugOf = (c) => (/پیشنهادِ این نوبت: «([^»]+)»/.exec(c) || [])[1] || '';
  const next = (reply, st) => p.evaluate(([reply, st]) => __q.push(R({ reply, actions: st ? [Object.assign({ do: 'coach_state' }, st)] : [] })), [reply, st || null]);
  const act = (o) => p.evaluate(o => __q.push(R(o)), o);
  const ST = (o) => Object.assign({ ph: 'u', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' }, o);
  const marked = (c) => /\[در گفت‌وگو پاسخ گرفته/.test(c);
  const has = (c, ids) => ids.every(id => c.indexOf(id) >= 0);
  const hookFor = async (open, msg, pre) => { await newSess(); if (pre) await next('بگو.', pre); if (open) await say(open); await say(msg); return coachOf(await lastUser()); };
  const first = async (msg) => { await newSess(); await say(msg); return coachOf(await lastUser()); };
  const liveSess = async (title, st, kind, nat) => {
    await newSess();
    await act({ reply: 'ثبتش کردم.', actions: [{ do: 'live_new', title, statement: st, kind: kind || 'find', nat: nat || 'objective' }] });
    await say(st);
    return p.evaluate(() => APP.ASSIST.cur().lprob);
  };

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  // ================= G1 — نشانه‌های نوبت: (مسئله، پیامِ بعد) =================
  await section('G1', async () => {
    // G1-a) گیرِ گزارش‌شدهٔ مسئلهٔ ۱ به پیامِ نخستِ مسئلهٔ ۲ نمی‌رسد (s30)
    const P2 = await liveSess('تیکت‌ها', 'تیکت‌های پشتیبانی روزی ۲۰۰ تا عقب می‌افتند؛ گلوگاه کجاست؟', 'find', 'practical');
    const P1 = await liveSess('خط تولید', 'خروجیِ روزانهٔ خطِ بسته‌بندی ۸۰۰ کارتن است ولی هدف ۱۰۰۰ تاست؛ گلوگاه کدام ایستگاه است؟', 'find', 'practical');
    await next('بگو.', ST({ ph: 'p', stuck: true, nat: 'practical' }));
    await say('فهم رو ثبت کردم. حالا تو طرح گیر کردم، نمی‌دونم از کجا شروع کنم.');
    await say('خب');
    const carry = await lastTurn();
    await p.evaluate(pid => APP.go('lprob', pid), P2); await p.waitForTimeout(150);
    await next('بگو.', ST({ ph: 'p', stuck: true, nat: 'practical' }));
    await say('باز هم گیر کردم توی همین طرح');
    info.g1a = { carry: carry && carry.pid === P1 && carry.stuck };
    chk(info.g1a.carry, 'G1: the model-reported stuck on the previous message still carries one turn on the SAME problem ' + JSON.stringify(info.g1a));
    await p.evaluate(pid => APP.go('lprob', pid), P1); await p.waitForTimeout(150);
    await say('بیا کل فهرست پرسش‌های طرح رو به ترتیب یکی‌یکی جواب بدیم.');
    const t3 = await lastTurn(); info.g1a.cross = t3 && t3.pid === P1 ? t3.stuck : 'n/a';
    chk(info.g1a.cross === false, 'G1: the previous message\'s stuck (reported for problem 2) does not reach the next message about problem 1 — matched by problem AND message (s30) ' + JSON.stringify(info.g1a));
    await p.evaluate(() => APP.go('home')); await p.waitForTimeout(100);

    // G1-b) «نتیجه» فقط برای نوبتِ بعد؛ گیر/پرسش/حدس پاکش می‌کند؛ «…درسته؟» حدس است (s02، s07، s09)
    await liveSess('لوله در بار', 'یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟', 'find', 'practical');
    await next('بگو.', ST({ ph: 'b', said: ['result'], nat: 'practical' }));
    await say('خب ۳.۲ از ۴ کمتره دیگه، پس جا نمیشه. درسته؟');
    const g0 = await lastTurn();
    await say('کف رو حساب کردم: حدود ۳.۶۷. باز هم از ۴ کمتره! گیر کردم.');
    const g1 = await lastTurn();
    await say('نمی‌دونم.');
    const g2 = await lastTurn();
    info.g1b = { guess0: g0 && g0.guess, res0: g0 && g0.result, res1: g1 && g1.result, stuck1: g1 && g1.stuck, res2: g2 && g2.result };
    chk(info.g1b.guess0 === true && !info.g1b.res0, 'G1: «… پس جا نمیشه. درسته؟» after a value is a GUESS (turn.guess), not a result (s02, s09) ' + JSON.stringify(info.g1b));
    chk(!info.g1b.res1 && info.g1b.stuck1 && !info.g1b.res2, 'G1: a model «result» for a guess never becomes a standing result; later stuck turns carry no result (s02, s07) ' + JSON.stringify(info.g1b));
    // نتیجهٔ واقعی ⇒ یک نوبت؛ گیر پاکش می‌کند؛ پس از آن منقضی
    await next('بگو.', ST({ ph: 'b', said: ['result'], nat: 'practical' }));
    await say('قطرِ کلِ بار حدودِ ۴.۰۰۵ میشه، پس جا میشه.');
    await say('خب');
    const r1 = await lastTurn();
    await say('باشه');
    const r2 = await lastTurn();
    info.g1b.real = { next: r1 && r1.result, after: r2 && r2.result };
    chk(info.g1b.real.next === true && info.g1b.real.after === false, 'G1: a stated result keeps priority for the NEXT user turn only, then expires ' + JSON.stringify(info.g1b.real));
    await next('بگو.', ST({ ph: 'b', said: ['result'], nat: 'practical' }));
    await say('پس جوابش ۴.۰۰۵ متره.');
    await say('ولی گیر کردم، اینو با چی بسنجم؟');
    const r3 = await lastTurn(); info.g1b.real.stuckClears = r3 && r3.result;
    chk(info.g1b.real.stuckClears === false, 'G1: the carried result is cleared when the next message is stuck or asks ' + JSON.stringify(info.g1b.real));
    // مربیِ بی مسئلهٔ زنده: «…درسته؟» ⇒ نه بازنگری؛ پرسشِ پیشنهادی «چطور می‌آزمایی‌اش؟»
    const c9 = await hookFor('می‌خوام ماهی ۲۰ میلیون سود کنم. هر کیک رو چند بفروشم؟', 'هزینهٔ هر کیک ۳۰۰ هزار تومنه، ماهی ۴۰ تا می‌فروشم. پس قیمت = ۳۰۰ + ۲۰ میلیون تقسیم بر ۴۰ = ۸۰۰ هزار. درسته؟');
    info.g1b.chat = { ph: phOf(c9), sug: sugOf(c9) };
    chk(info.g1b.chat.ph !== 'بازنگری' && /می‌آزمایی/.test(info.g1b.chat.sug), 'G1: in the chat coach «…درسته؟» after a value is a guess ⇒ «چطور می‌آزمایی‌اش؟», not look-back (s09) ' + JSON.stringify(info.g1b.chat));

    // G1-c) statedParts هرگز «[پاسخ گرفته]» نمی‌زند (s01 روزِ ۲۰)
    const c1 = await first('سلام. همکارم دقیقاً همین سؤال رو داره که خونه بخره یا اجاره کنه. آره، مجهولم یه جای امن و ثابت برای پسرم تا هفت سال بود با شرطِ خرج زیر ۴۰٪. چی بهش بگم؟');
    await say('خب');
    const c1b = coachOf(await lastUser());
    info.g1c = { first: marked(c1), next: marked(c1b) };
    chk(!info.g1c.first && !info.g1c.next, 'G1: the regex «stated» path never tags a question «[در گفت‌وگو پاسخ گرفته]» (F1, s01 day 20) ' + JSON.stringify(info.g1c));

    // G1-d) معمای چسبانده با کارِ خودش در همان پیام: {ph:p, stuck, fail} پذیرفته ⇒ طرح و «از خواسته به عقب» (s08)
    await newSess();
    await next('بگو.', ST({ ph: 'p', said: ['plan'], stuck: true, fail: true }));
    await say('فقط دوتا ساعت شنی داریم، یکی ۷ دقیقه یکی ۱۱ دقیقه. تخم‌مرغ باید دقیقاً ۱۵ دقیقه بپزه. چطوری؟ نصفه روزه دارم امتحان می‌کنم: ۷+۷=۱۴، ۱۱+۷=۱۸، ۱۱+۱۱=۲۲ … هیچی جور نمیشه. اعصابم خورده.');
    await say('نه... نمی‌دونم.');
    { const c = coachOf(await lastUser()); info.g1d = { ph: phOf(c), sug: sugOf(c).slice(0, 40) };
      chk(info.g1d.ph === 'طرح‌ریزی' && /به عقب/.test(info.g1d.sug), 'G1: a pasted puzzle whose message also reports the user\'s own work accepts the model\'s {ph:p, stuck} ⇒ plan + «از خواسته به عقب» (s08) ' + JSON.stringify(info.g1d)); }
    // ولی معمای فقط‌چسبانده (بی کار) با همان گزارش جلو نمی‌رود (F1)
    await newSess();
    await next('بگو.', ST({ ph: 'p', stuck: true }));
    await say('معما: با یه ظرف ۹ لیتری و یه ظرف ۴ لیتری، دقیقاً ۶ لیتر آب بردار.');
    await say('خب');
    info.g1d.pasteOnly = phOf(coachOf(await lastUser()));
    chk(info.g1d.pasteOnly === 'فهمِ مسئله', 'G1/F1: a merely pasted puzzle (no own work) is not moved to plan by the model report ' + JSON.stringify(info.g1d));

    // نشانه‌های تازهٔ نوبت (دفاعی؛ a38 اگر نشناسد نادیده می‌گیرد): related
    await liveSess('تفکیکِ زباله', 'دو بار طرحِ تفکیکِ زباله را در محله اجرا کردیم و هر دو بار پس از یک ماه ول شد؛ این بار چه کنیم که بماند؟', 'find', 'practical');
    await say('یادم اومد محلهٔ ولیعصر همین طرح رو موفق اجرا کرده. ولی نمی‌دونم چطور از اون استفاده کنم، محلهٔ اونا فرق داره.');
    const tr = await lastTurn(); info.g1e = tr ? { related: tr.related, stuck: tr.stuck } : null;
    chk(info.g1e && info.g1e.related === true && info.g1e.stuck === false, 'G1/G2: «یادم اومد … نمی‌دونم چطور از اون استفاده کنم» is the related-problem signal (turn.related), not «stuck» (s35) ' + JSON.stringify(info.g1e));
  });

  // ================= G3 — دقتِ سطرهای F6 =================
  const g3 = info.g3 = {};
  await section('G3-A191', async () => {
    const W191 = async (m) => has(await first(m), ['A191']);
    g3.a191 = {
      s30: await W191('یه چارچوب کامل می‌خوام که برای هر مسئله‌ای، از کار تا زندگی، قدم‌به‌قدم اجراش کنم و جواب بده. یه چک‌لیست ۱۰ مرحله‌ای بده که همیشه کار کنه. راستش وقت ندارم مثال حل کنم، فقط خود چک‌لیست رو بده.'),
      s31: await W191('حلش کردم! بیشترین حاصل‌ضرب اعداد مثبتی که جمعشون ۱۰ ه وقتیه که همه‌شون مساوی‌ان، ۵×۵=۲۵. سؤال بعدی رو بده.'),
      s34: await W191('سه ماهه پروژه‌ی پایانی رو شروع نکردم. هر روز لپ‌تاپ رو باز می‌کنم و می‌بندم. احساس می‌کنم اصلاً استعدادشو ندارم. فکر کنم باید انصراف بدم.'),
      s34r: await W191('سلام، چند روز نبودم. دیروز تو مترو یهو یه ایده برای پلان به ذهنم رسید: حیاط رو به جای وسط، کنار خیابون فرعی بذارم.'),
      s12: await W191('صبح بخیر. جدول امروز: «پایتخت کشوری که رودخانه‌ی دانوب از آن می‌گذرد» شش حرفی. اول مجهول: یه اسم شهر شش حرفی. بعد بخش‌های شرط: پایتخته، دانوب ازش رد میشه، شش حرفه.'),
      s07: await W191('۵ تا گلدون لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور گذاشتم. قدشون بعد از ۳ هفته: ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. استادم گفت «یه قانون پیدا کن». قانونش چیه؟ فکر کنم خطیه، هر ۲ ساعت ۴ سانت.'),
      s08: await W191('فقط دوتا ساعت شنی داریم، یکی ۷ دقیقه یکی ۱۱ دقیقه. تخم‌مرغ باید دقیقاً ۱۵ دقیقه بپزه. چطوری؟ نصفه روزه دارم امتحان می‌کنم: ۷+۷=۱۴، ۱۱+۷=۱۸ … هیچی جور نمیشه.'),
      s11: await W191('سلام دوباره. چند روز پیش مسئله‌ی دومینو رو با رنگ‌آمیزی حل کردم و یه مسئله‌ی تازه ساختم: کدوم دو خونه رو بردارم که بشه پوشوند؟ فکر کنم هر دو خونه‌ای که رنگشون فرق داره کافیه. درسته؟'),
      s20: await W191('۸ ماهه می‌خوام نشون بدم یه شبکه‌ی خاص با ۳ نوع نورون نوسان گاما تولید می‌کنه یا نه. شبیه‌سازی‌ها گاهی آره گاهی نه. ببین، g_EE رو ۰.۸ گذاشتم، τ_I رو ۸ میلی‌ثانیه، تأخیر سیناپسی ۱.۵، و وقتی g_PV-E از ۱.۲ بیشتر می‌شه گاهی...'),
      s37: await W191('تو دفتر حساب کاروانسرا نوشته «۳۶ رأس گوسفند: ؟۴۸۷؟ ریال» — رقم اول و آخر محو شده. می‌خوام بدونم قیمت هر گوسفند چقدر بوده. چطور پیدا کنم؟ فکر کنم باید ۱۰۰ حالت رو یکی‌یکی امتحان کنم.'),
    };
    const A = g3.a191;
    chk(!A.s30 && !A.s31 && !A.s34 && !A.s34r && !A.s12 && !A.s07 && !A.s08 && !A.s11, 'G3: A191 «اول کل را ببین» never on a checklist request, a result opening, discouragement, a return, a statement whose unknown she already named, or an opening that already carries her guess/attempt (s07, s08, s11, s12, s30, s31, s34) ' + JSON.stringify(A));
    chk(A.s20 && A.s37, 'G3: A191 still fires on the message that introduces a problem by diving into details (s20, s37) ' + JSON.stringify(A));
    // یک بار برای هر مسئله: بازگفتنِ همان صورت دوباره نمی‌آوردش
    await newSess();
    const S20 = 'یه شبکه با ۳ نوع نورون دارم و می‌خوام بفهمم کِی نوسان گاما می‌سازه. g_EE رو ۰.۸ گذاشتم، τ_I رو ۸ میلی‌ثانیه، تأخیر ۱.۵.';
    await say(S20); const o1 = has(coachOf(await lastUser()), ['A191']);
    await say(S20 + ' دوباره میگم.'); const o2 = has(coachOf(await lastUser()), ['A191']);
    g3.a191.once = [o1, o2];
    chk(o1 && !o2, 'G3: A191 fires once per problem ' + JSON.stringify(g3.a191.once));
  });
  await section('G3-A044', async () => {
    const M = async (m) => has(await first(m), ['A044']);
    g3.a044 = {
      s12: await M('آهان، دو تا شرطه. واژه‌های دریایی پنج حرفی: ناخدا، کشتی‌ها نه... لنج؟ نه... آهان ناوبان؟ حرف دومش با عمودی «ا» درمیاد.'),
      s13: await M('شریک جرم یعنی... راستش نمی‌دونم دقیقاً. فکر کنم یعنی کسی که می‌دونه و چیزی نمیگه؟ یا کسی که ازش سود می‌بره؟'),
      s11: await M('یه مسئله‌ی تازه ساختم: کدوم دو خونه رو بردارم که بشه پوشوند؟ فکر کنم هر دو خونه‌ای که رنگشون فرق داره کافیه. درسته؟'),
      s15: await M('مثلاً... «اینجا چی رو می‌خوایم پیدا کنیم؟». خب بیا تمرین کنیم. من می‌پرسم: «چی رو می‌خوایم پیدا کنیم؟»'),
      s14: await M('حدسم... پس کوچیک‌تر نشون می‌ده، و برای جبران تقسیم بر عدد کوچیک‌تر می‌کنیم؟ ولی چرا دقیقاً یکی کمتر؟'),
      s18: await M('یه قیف مخروطی با شعاع دهانه ۱۰ سانت و ارتفاع ۳۰ سانت داریم. وقتی عمق آب ۱۲ سانته، سطح آب با چه سرعتی پایین میاد؟ حجم مخروط ⅓πr²h = ⅓·π·۱۰۰·۱۲ تقسیم بر ۵ ثانیه؟'),
      s36: await M('«۲۰ لیتر آب‌نمک ۱۰٪ داریم. چند لیتر آب‌نمک ۲۵٪ اضافه کنیم تا ۱۵٪ بشه؟» من از x بدم میاد. می‌شه بدون x حلش کرد؟'),
      s36b: await M('دو تا جواب درومد، ۳ و −۲. ولی −۲ رو که می‌ذارم: رادیکال ۴ میشه ۲، نه −۲! یعنی چی؟ کجا اشتباه کردم؟'),
      s08: await M('فردا. نوشتم: هر دو رو با هم برمی‌گردونم؛ ۷ که تموم شد تخم‌مرغ رو می‌ذارم؛ ۱۱ که تموم شد برش می‌گردونم. چرا برعکس؟'),
      s17: await M('می‌خوام آب بارون پشت‌بوم انبار رو جمع کنم برای آبیاری باغ. مخزن چقدر بزرگ بسازم؟ بتنی بسازم یا پلاستیکی بخرم؟ کجا بذارم؟ هر سه رو با هم بگو.'),
    };
    const A = g3.a044, neg = Object.keys(A).filter(k => k !== 's17' && A[k]);
    chk(!neg.length, 'G3: A044 «چند مجهول» never from a «؟» count — candidate lists, two meanings, «درسته؟», a quoted question twice, one unknown (s08, s11–s18, s36) — fired on: ' + JSON.stringify(neg));
    chk(A.s17, 'G3: A044 still fires when two different unknown quantities are asked (s17) ' + JSON.stringify(A));
  });
  await section('G3-lines', async () => {
    const OPEN = 'یه معما دارم: با دو ساعت‌شنیِ ۷ و ۱۱ دقیقه، دقیقاً ۱۵ دقیقه رو اندازه بگیر.';
    // A263 فقط با GEN_RE
    let c = await hookFor('معما: سه جعبه با برچسبِ غلط داریم؛ یکی سیب، یکی پرتقال، یکی قاطی. با یک بار برداشتن برچسب‌ها را درست کن.', 'طرحم اینه که اول از جعبهٔ «قاطی» یه میوه بردارم، بعد بقیه رو نتیجه بگیرم.');
    g3.a263 = { planPh: phOf(c), plain: has(c, ['A263']) };
    chk(g3.a263.planPh === 'طرح‌ریزی' && !g3.a263.plain, 'G3: A263 (inventor\'s paradox) is not on every plan turn — only when generalising is discussed (s21) ' + JSON.stringify(g3.a263));
    // B162 در هر مرحله، بسته یا نابسته؛ نه روی برهانِ واقعی
    c = await hookFor('۵ تا گلدون لوبیا با ۲ تا ۱۰ ساعت نور گذاشتم؛ قانونِ رشد چیه؟', 'تفاضل‌ها ۵، ۴، ۳، ۱ شدن، پس خطی نیست، کند میشه. حدسم اشباعه. یه مقاله هم پیدا کردم دربارهٔ اشباع فتوسنتز. پس ثابت شد دیگه، قانونش اشباعه!');
    g3.b162 = { s07: has(c, ['B162']), s07claim: /برهانش؟/.test(c), s07ph: phOf(c) };
    c = await hookFor('چرا توی فرمول واریانس نمونه تقسیم بر n−1 می‌کنیم نه n؟', 'حدسم... میانگین نمونه وسط همون داده‌هاست، پس فاصله‌ها ازش کوچیک‌تر از فاصله تا میانگین واقعیه. پس کوچیک‌تر نشون می‌ده، و برای جبران تقسیم بر عدد کوچیک‌تر می‌کنیم.');
    g3.b162.s14 = has(c, ['B162']);
    c = await hookFor('حجم چهاروجهی‌ای رو پیدا کنید که دو یال روبه‌روش طول a دارن، بر هم عمودن و هر دو بر پاره‌خط به طول b عمودن.', 'آها! صفحه‌ای که از یال a و پاره‌خط b میگذره چهاروجهی رو دو تا چهاروجهی می‌کنه؛ قاعدهٔ هر کدوم مساحتش ab/2، و ارتفاع هر کدوم a/2 چون یال دیگه بر صفحه عموده. پس حجم = ۲ × (۱/۳ × ab/2 × a/2) = a²b/6!');
    g3.b162.s38 = has(c, ['B162']); g3.b162.s38ph = phOf(c);
    chk(g3.b162.s07 && g3.b162.s07claim && g3.b162.s07ph !== 'بازنگری', 'G3: B162 + «برهانش؟» when an inductive/analogical argument is offered as proof, even at understanding (s07) ' + JSON.stringify(g3.b162));
    chk(g3.b162.s14, 'G3: B162 when a plausible «حدسم … پس …» argument is offered, in ANY phase (s14) ' + JSON.stringify(g3.b162));
    chk(g3.b162.s38ph === 'بازنگری' && !g3.b162.s38, 'G3: B162 is not attached to a real (argued) proof in look-back (s38) ' + JSON.stringify(g3.b162));
    // B162 روی مسئلهٔ زندهٔ بسته هم
    await liveSess('قانونِ رشد', '۵ گلدانِ لوبیا با ۲ تا ۱۰ ساعت نور؛ قانونِ رشد بر حسبِ ساعتِ نور چیست؟', 'find', 'objective');
    await say('تفاضل‌ها ۵، ۴، ۳، ۱ شدن، پس خطی نیست. حدسم اشباعه. یه مقاله هم پیدا کردم. پس ثابت شد دیگه، قانونش اشباعه!');
    { const u = await lastUser(); g3.b162.live = has(coachOf(u), ['B162']) && /برهانش؟/.test(coachOf(u)); g3.b162.liveClaim = /«✅ حل شد» و بازنگریِ خودِ صفحه ببر/.test(coachOf(u)); }
    chk(g3.b162.live && !g3.b162.liveClaim, 'G3: on a bound live problem the inductive «پس ثابت شد دیگه» gets B162/«برهانش؟», not the solved-claim push to «✅ حل شد» (s07) ' + JSON.stringify(g3.b162));
    // C107 با زبانِ طبیعی
    g3.c107 = {
      s07: has(await hookFor('۵ تا گلدون لوبیا با نور ۲ تا ۱۰ ساعت؛ حدسم اینه که رشد اشباع میشه.', 'هفتهٔ چهارم. ۲۴ ساعت نور فقط ۱۱ سانت شد و گیاه آسیب دید. ناامیدم، کل قانونم خراب شد.'), ['C107']),
      s20: has(await hookFor('می‌خوام بفهمم شبکهٔ E-I-PV کِی نوسان گاما می‌سازه.', 'ایده رو با ۴۰ تا شبیه‌سازی آزمودم: ۳۸ تاش جور درمیاد! ولی یه حالت، وقتی g_PV-E خیلی بزرگه، نوسان نمی‌ده. اونو نادیده بگیرم؟ استثناست دیگه.'), ['C107']),
    };
    chk(g3.c107.s07 && g3.c107.s20, 'G3: C107 (one exception refutes ⇒ narrow the domain) on natural wording «کل قانونم خراب شد» / «استثناست، نادیده بگیرم؟» (s07, s20) ' + JSON.stringify(g3.c107));
    // B231 بی واژهٔ «حدس»
    c = await hookFor('جدولِ امروز: حروفِ «ر ا ت س م ن ه ب» رو مرتب کن، یه کلمهٔ ۸ حرفی.', 'ر م ه ب ... رمهب‌ستان؟ نه. اشتباه بود. پس «ستان» نیست.');
    g3.b231 = has(c, ['B231']);
    chk(g3.b231, 'G3: B231 «حدس را بیازما» on a refuted candidate without the word «حدس» («X؟ نه. اشتباه بود», s12)');
    // A073
    g3.a073 = {
      machine: has(await first('جدول امروز: «از جلو و عقب یکی است، در دریا راه می‌رود» — ۵ حرفی. نیم ساعته موندم. شما که ماشینی، بگو.'), ['A073']),
      why: has(await first('سلام! یه سؤال: چرا توی فرمول واریانس نمونه تقسیم بر n−1 می‌کنیم نه n؟ استاد گفت ولی یادم نموند.'), ['A073']),
      ctl: has(await first('یه قیفِ مخروطی داریم با شعاعِ ۱۰ و ارتفاعِ ۳۰؛ وقتی عمق ۱۲ است سطحِ آب با چه سرعتی پایین میاد؟'), ['A073']),
    };
    chk(g3.a073.machine && g3.a073.why && !g3.a073.ctl, 'G3: A073 (ask the learner\'s own attempt/guess first) on «شما که ماشینی، بگو» and on «چرا X؟», not on a plain problem (s12, s14) ' + JSON.stringify(g3.a073));
    // heurClaim «۱۰ تا چک کردم… اثباته»
    g3.heur = {
      a: /برهانش؟/.test(await first('امروز دیدم ۱/۲ + ۱/۶ + ۱/۱۲ = ۳/۴. با ۱/۲۰ میشه ۴/۵! فکر کنم همیشه n/(n+1) میشه. ۱۰ تاشو چک کردم. درسته دیگه؟ ثابت شد.')),
      b: /برهانش؟/.test(await hookFor('دیدم ۱/۲ + ۱/۶ + ۱/۱۲ = ۳/۴؛ فکر کنم همیشه n/(n+1) میشه.', 'خب ۱۰ تا چک کردم، دیگه اثباته! ولی باشه، ثبتش کن ببینیم.')),
    };
    chk(g3.heur.a && g3.heur.b, 'G3: heurClaim catches «۱۰ تاشو چک کردم… ثابت شد» and «۱۰ تا چک کردم، دیگه اثباته!» ⇒ «برهانش؟» (C145, s25) ' + JSON.stringify(g3.heur));
    // BRUTE_RE: «اول همه‌ی کیش‌ها رو امتحان می‌کنم» طرح نیست (s21)
    c = await hookFor('مسئله: سفید بازی می‌کند و در دو حرکت مات می‌کند. FEN: 5k2/8/5K2/8/8/8/8/R2Q4 w', 'معمولاً اول همه‌ی کیش‌ها رو امتحان می‌کنم: وزیر d8 کیش، وزیر d7 کیش. هر دفعه شاه میره e8 یا g8.');
    g3.brute = phOf(c);
    chk(g3.brute === 'فهمِ مسئله', 'G3: «اول همه‌ی کیش‌ها رو امتحان می‌کنم» is a brute-force intention, not a plan (s21) ' + g3.brute);
    // سطرهای معلم فقط در لحظهٔ خودشان (s15، s16)
    await newSess();
    await say('شاگردام سر مسئله‌ها ساکت می‌مونن. من هم آخرش خودم حل می‌کنم روی تخته. سؤال‌های من یا جوابو لو میده یا کسی جواب نمیده. چیکار کنم؟');
    const t1 = coachOf(await lastUser());
    await say('باشه، فردا سرِ کلاس امتحانش می‌کنم.');
    const t2 = coachOf(await lastUser());
    await say('مثلاً دیروز گفتم: «خب بچه‌ها، اینجا باید از تشابه استفاده کنیم، نه؟» همه گفتن «بله خانم».');
    const t3 = coachOf(await lastUser());
    g3.teach = { first: has(t1, ['A167', 'A129']), plain: has(t2, ['A167']) || has(t2, ['A129']), asked: has(t3, ['A167']), frame: /کاربر مربیِ یادگیرنده است/.test(t2) };
    await newSess();
    await say('دخترم یه مسئله داره: «باغچه‌ای مستطیلی دورش ۲۴ متر حصار داره، طولش دو برابر عرضشه، طول و عرض چقدره؟» خودم بلدم، فقط بگو چطوری بهش بگم.');
    await say('سلام، دو شب گذشته. جالبه: یه روشی رو که هفته‌ی پیش خودم بهش «گفته بودم» کاملاً یادش رفته، ولی روش نخ رو یادشه. چرا این‌طوریه؟');
    g3.teach.auth = has(coachOf(await lastUser()), ['A129']);
    chk(g3.teach.first && g3.teach.asked && g3.teach.auth && g3.teach.frame && !g3.teach.plain, 'G3: teacher lines A167/A129 appear at their moment (bad question reported, authority move, forgetting what was told) — not on every teacher turn (s15, s16) ' + JSON.stringify(g3.teach));
  });

  // ================= G4 — عبارت‌های نتیجه؛ مسئلهٔ تازه از حل‌شده؛ هدفِ میانهٔ کار؛ سرواژه =================
  await section('G4', async () => {
    const g4 = info.g4 = {};
    const OPEN28 = 'یه نفر دو بچه داره، حداقل یکیشون پسره و سه‌شنبه به دنیا اومده. احتمال این‌که هر دو پسر باشن؟';
    g4.r1 = phOf(await hookFor(OPEN28, 'فهرست کردم ۱۴×۱۴ حالت، با حداقل یه پسرِ سه‌شنبه ۲۷ حالت، دوپسر ۱۳ تا ⇒ ۱۳/۲۷. فکر کنم درسته.'));
    g4.r2 = phOf(await hookFor('یه نفر دو بچه داره، حداقل یکیشون پسره. احتمال این‌که هر دو پسر باشن؟', 'فهرست کردم: پپ، پد، دپ، دد. با حداقل یه پسر سه تا می‌مونه. فقط یکیش دوپسره... یعنی ۱/۳!'));
    g4.r3 = phOf(await hookFor('بعد از کمپین تبلیغاتی آبان، فروش ۳۰٪ رفت بالا؛ می‌خوام بدونم اثرِ تبلیغ چقدر بوده.', 'مقایسه کردم: شیراز تبلیغ نداشت، فروش آبانش ۲۶٪ رشد کرد؛ شهرهای دارای تبلیغ ۳۱٪. پس اثر هست ولی کوچیک‌تره، حدود ۵ واحد درصد. پرونده رو بستم. حالا متن کوتاه گزارش به مدیرعامل رو کمکم کن.'));
    g4.r4 = phOf(await hookFor('«۲۰ لیتر آب‌نمک ۱۰٪ داریم؛ چند لیتر ۲۵٪ اضافه کنیم تا ۱۵٪ بشه؟»', 'آها! توان دو جوابای اضافی رو هم قبول می‌کنه. پس فقط ۳.'));
    chk(g4.r1 === 'بازنگری' && g4.r2 === 'بازنگری' && g4.r3 === 'بازنگری' && g4.r4 === 'بازنگری', 'G4: «⇒ ۱۳/۲۷»، «یعنی ۱/۳!»، «… پرونده رو بستم. حالا …» and «پس فقط ۳» are results ⇒ look-back (s28, s32, s36) ' + JSON.stringify(g4));
    // ... ولی «پس V = … حالا دیگه فقط y داره» هنوز میانی است (F1)
    // «حل کردم و یه مسئلهٔ تازه ساختم: Y» ⇒ Y از فهم، و سطرِ بازنگریِ مسئلهٔ پیشین (s11)
    { const c = await first('سلام دوباره. چند روز پیش مسئله‌ی دومینو رو با رنگ‌آمیزی حل کردم و یه مسئله‌ی تازه ساختم: کدوم دو خونه رو بردارم که بشه پوشوند؟ فکر کنم هر دو خونه‌ای که رنگشون فرق داره کافیه. درسته؟');
      g4.s11 = { ph: phOf(c), old: /مسئلهٔ پیشین/.test(c) && /بازنگری/.test(c), stmt: await p.evaluate(() => (APP.ASSIST.cur().coach || {}).stmt || '') };
      chk(g4.s11.ph === 'فهمِ مسئله' && g4.s11.old && /کدوم دو خونه/.test(g4.s11.stmt) && !/دومینو رو با رنگ/.test(g4.s11.stmt), 'G4: «… حل کردم و یه مسئلهٔ تازه ساختم: Y» ⇒ the old problem is named as look-back AND Y starts at understanding (its own statement) (s11) ' + JSON.stringify(g4.s11)); }
    // مسئلهٔ فقط‌درگفت‌وگو، میانهٔ کار: سطرِ هدف و «داده‌ها؟» نه پس از کاربستِ داده (s18)
    await newSess();
    await say('یه قیف مخروطی (نوک پایین) با شعاع دهانه ۱۰ سانت و ارتفاع ۳۰ سانت داریم. آب با نرخ ثابت ۵ سانتی‌متر مکعب در ثانیه خارج می‌شه. وقتی عمق آب ۱۲ سانته، سطح آب با چه سرعتی پایین میاد؟');
    await next('بگو.', ST({ ph: 'u', said: ['u'], ans: ['u1'] }));
    await say('مجهول؟ «سرعت پایین اومدن سطح آب»، یعنی نرخ تغییر عمق، dy/dt، اون لحظه که عمق ۱۲ه.');
    await say('نرخ حجم داده شده: V با سرعت ۵ کم می‌شه. حجم آب V = ⅓πr²y. ولی r رو نمی‌دونم! داده کمه.');
    await say('آهان ۱۰ و ۳۰ رو استفاده نکردم! مثلث‌های متشابه: r/y = 10/30، پس r = y/3. پس V = ⅓π(y/3)²y = πy³/27. حالا دیگه فقط y داره.');
    { const c = coachOf(await lastUser()); g4.s18 = { ph: phOf(c), sug: sugOf(c), goal: /🎯 مجهول هنوز/.test(c) && /dy\/dt|سرعت/.test((/🎯 مجهول هنوز[^\n]*/.exec(c) || [''])[0]) };
      chk(g4.s18.ph !== 'بازنگری' && !/داده‌ها/.test(g4.s18.sug) && g4.s18.goal, 'G4: mid-work with new variables ⇒ the chat goal line «🎯 مجهول هنوز X است — این گام به آن نزدیک‌ترت کرد؟», and «داده‌ها چیست؟» is not suggested once the data were used (s18) ' + JSON.stringify(g4.s18)); }
    // مسئلهٔ زنده: نتیجه در نوبت ⇒ سرواژه «بازنگری» (هم‌خوان با پرسشِ نوبت) (s28)
    await liveSess('کیکِ بزرگ', 'کیکِ ۲۰ سانتی ۴۰ دقیقه می‌پزه؛ قالبِ من ۳۳ سانتیه. چقدر بذارم بمونه؟', 'find', 'practical');
    await next('بگو.', ST({ ph: 'b', said: ['result'], nat: 'practical' }));
    await say('پس ۵۵ دقیقه، فکر کنم درسته.');
    const h1 = phOf(coachOf(await lastUser()));
    await say('خب، حالا بعدش چی کار کنم');
    const h2 = phOf(coachOf(await lastUser()));
    g4.head = { now: h1, next: h2, page: await p.evaluate(() => APP.livePhase(APP.ASSIST.cur().lprob)) };
    chk(g4.head.page !== 'b' && g4.head.now === 'بازنگری' && g4.head.next === 'بازنگری', 'G4: when the turn question is look-back (result stated this turn / carried one turn), the coach header phase says «بازنگری» too (s28) ' + JSON.stringify(g4.head));
  });

  // ================= صفحهٔ «🔭»: C107/B231 در نوبتِ پس از ردِ ثبت‌شده (یک بار)؛ G7 «🌱 ثبتِ گامِ کوچک» =================
  await section('page', async () => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 900 } }); const q = await ctx.newPage();
    q.on('pageerror', e => errors.push('pageerror(live): ' + e.message));
    q.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
    await q.route('**/fonts.googleapis.com/**', r => r.abort());
    const Wq = (ms) => q.waitForTimeout(ms || 90);
    const T0 = '2026-11-02';
    const D = (n) => { const d = new Date(2026, 10, 2 + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    const day = async (n) => { await q.evaluate(x => { window.__day = x; }, D(n)); };
    const go = async (v, a, s) => { await q.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await Wq(140); };
    const sel = async (s, v) => { await q.selectOption(s, v); await Wq(120); };
    const click = async (s) => { await q.click(s); await Wq(160); };
    const hasEl = (s) => q.locator(s).count();
    const fillIf = async (s, v) => { if (await hasEl(s)) await q.fill(s, v); };
    const mk = async (o) => { await go('e_prob', null, 'live'); await q.fill('#lpNewT', o.title); await q.fill('#lpNewS', o.st); await Wq(60); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return q.evaluate(() => APP.state.arg); };
    const understand = async (o) => {
      await q.fill('#lpOne', o.one); await q.fill('#lpWhy', 'برایم مهم است و کنجکاوم'); await click('main .lp-onesave');
      if (await hasEl('#lpNat')) await sel('#lpNat', 'life');
      await q.fill('#lpUnk', o.unk);
      for (let i = 0; i < o.data.length; i++) { if (i >= 2) await click('main .lp-dadd'); await q.fill('#lpD_d' + (i + 1), o.data[i]); }
      await q.fill('#lpCond', o.cond);
      if (await hasEl('#lpSat')) await sel('#lpSat', 'yes');
      await sel('#lpSuff', 'ناکافی است — چیزی کم است'); await fillIf('#lpSuffW', 'هنوز همه را نمی‌دانم');
      await fillIf('#lpSuffChal', 'همهٔ داده‌ها با هم آن را معین می‌کنند');
      await q.fill('#lpGuess', o.guess); await sel('#lpConf', '60'); await q.fill('#lpTest', 'با یک حالتِ خاص می‌آزمایم');
      await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
      await click('main .lp-usave'); if (await hasEl('main .lp-u .sv-g2')) await click('main .lp-u .sv-g2');
    };
    const savePlan = async (plan) => { await q.selectOption('#lpMv', 'mv_special').catch(() => {}); await fillIf('#lpMvWhy', 'اول فقط یک حالت را دقیق می‌بینم تا دامنه تنگ شود'); if (await hasEl('main .lp-mvadd')) await click('main .lp-mvadd');
      await q.fill('#lpPlan', plan); await Wq(350);
      for (const id of await q.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await q.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); }
      await click('main .lp-plansave'); };
    const realStep = async (text, pred) => { await q.fill('#lpStep', text); await sel('#lpClear', 'بله'); await q.fill('#lpPred', pred); await sel('#lpConf', '60'); await q.fill('#lpWhen', 'فردا'); await click('main .lp-stepsave'); };
    const outcome = async (o) => { await sel('#lpODone', o.done || 'yes'); await q.fill('#lpOWhat', o.what); if (await hasEl('#lpOMatch')) await sel('#lpOMatch', o.match || 'yes'); await sel('#lpOProg', o.prog || 'کمی'); await sel('#lpOWant', 'same'); if (await hasEl('#lpOGuess')) { await sel('#lpOGuess', o.grel || 'none'); if (o.grel === 'refute') await q.fill('#lpOReflect', 'حدسم را کنار می‌گذارم چون شمارش چیزِ دیگری نشان داد'); } await click('main .lp-outsave'); };
    const sayQ = async (text) => { await q.evaluate(() => APP.ASSIST.toggle(true)); await q.fill('.as-panel .as-in', text); await q.click('.as-panel .as-send'); await q.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 }); await q.evaluate(() => APP.ASSIST.toggle(false)); await Wq(100); };
    const lastQ = () => q.evaluate(() => __calls[__calls.length - 1].user);
    await q.goto(FILE); await q.waitForSelector('.nav'); await Wq(300);
    await q.evaluate(T0 => { window.__day = T0; APP.today = () => window.__day; APP.S.loaded = true; window.__calls = []; window.__q = [];
      APP.HOST = Object.assign({}, APP.HOST || {}, { remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }) });
      APP.callAI = async (sys, user, opts) => { __calls.push({ user }); const r = __q.shift(); const t = JSON.stringify(r || { reply: 'باشه.', status: 'related', memory: 'm', actions: [] }); return opts && opts.withMeta ? { text: t, files: [] } : t; }; }, T0);
    await day(0);
    const PS = await mk({ title: 'فروشِ عصر', st: 'فروشِ مغازه‌ام در عصرها کم شده؛ می‌خواهم بفهمم چرا.', nat: 'life' });
    await understand({ one: 'دنبالِ دلیلِ افتِ فروشِ عصرها هستم', unk: 'علتِ کم شدنِ فروشِ عصر', data: ['عصرها کمتر فروختیم', 'مغازهٔ روبه‌رو تخفیف داده'], cond: 'علت را با شاهد بیابم', guess: 'تخفیفِ مغازهٔ روبه‌رو علت است' });
    await savePlan('نخست مشتری‌های عصر را می‌شمارم سپس از چند مشتری می‌پرسم');
    await realStep('فردا عصر مشتری‌ها را بشمارم', 'مشتری‌ها به مغازهٔ روبه‌رو رفته‌اند');
    await day(1); await go('lprob', PS, 'exec');
    await outcome({ what: 'مشتری‌ها همان قدر آمدند ولی کمتر خریدند', match: 'no', grel: 'refute' });
    const ref = await q.evaluate(pid => APP.livePlausible(pid).refuted, PS);
    await q.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); });
    await sayQ('خب، حالا چی کار کنم؟');
    const u1 = await lastQ();
    await sayQ('باشه، فکر می‌کنم.');
    const u2 = await lastQ();
    const cA = coachOf(u1), cB = coachOf(u2);
    info.pageRef = { ref, c107: has(cA, ['C107']), b231: has(cA, ['B231']) || /B231/.test(liveOf(u1)), again: has(cB, ['C107']) || has(cB, ['B231']) || /B231/.test(liveOf(u2)), keep: /دوباره پیشنهاد نکن/.test(u2) };
    chk(ref > 0 && info.pageRef.c107 && info.pageRef.b231, 'G3: a refutation recorded on the page triggers C107 (narrow the domain) and B231 in the next chat turn (s07, s20) ' + JSON.stringify(info.pageRef));
    chk(!info.pageRef.again && info.pageRef.keep, 'G3/G1: those moment lines fire once per refutation (not on every later turn), while «don\'t re-propose it» stays as context (s19) ' + JSON.stringify(info.pageRef));
    // G7: «🌱 ثبتِ گامِ کوچک» ⇒ تأییدِ درجا و فرمِ پاک
    await realStep('فردا از سه مشتری بپرسم چرا کمتر خریدند', 'قیمت‌ها را گران می‌دانند');
    await day(2); await go('lprob', PS, 'exec');
    await outcome({ what: 'نتوانستم با کسی حرف بزنم', match: 'no', prog: 'نه' });
    const wf = 'main .sv-will .sv-willf';
    info.g7 = { form: await hasEl(wf) };
    if (info.g7.form) {
      const pre = await q.evaluate(s => document.querySelector(s).querySelector('select').id.replace(/des$/, ''), wf);
      await sel('#' + pre + 'des', 'want'); await sel('#' + pre + 'hope', 'yes');
      await q.fill('#' + pre + 'step', 'فردا ۱۰ دقیقه با یک مشتری حرف بزنم'); await q.fill('#' + pre + 'when', 'فردا ساعت ۶ عصر، ۱۰ دقیقه'); await sel('#' + pre + 'bud', 'one');
      await click(wf + ' .sv-willsave');
      info.g7.after = await q.evaluate(pre => ({ ok: !!document.querySelector('main .sv-willok') && document.querySelector('main .sv-willok').offsetParent !== null,
        step: (document.getElementById(pre + 'step') || { value: '' }).value, inputs: [...document.querySelectorAll('main .sv-willf input, main .sv-willf textarea')].filter(x => x.offsetParent !== null && x.value).length }), pre);
    }
    chk(info.g7.form && info.g7.after && info.g7.after.ok && !info.g7.after.step && !info.g7.after.inputs, 'G7: «ثبتِ گامِ کوچک» confirms in place (visible) and clears the form (s19, s34) ' + JSON.stringify(info.g7));
    await ctx.close();
  });

  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 9000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
