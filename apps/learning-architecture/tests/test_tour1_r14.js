// تورِ پولیا (دستهٔ ۱، دورِ ۱۴ ِ اصلاح — دورِ «بی‌نقص» ِ ششم، ۲۰۲۶-۱۰-۱۷) — DECISIONS_R14 (N1، N2) روی رابطِ واقعی (پنلِ دستیار با مدلِ ساختگی، فرمِ «🔭»).
//  N1 — یک قاعدهٔ پنجره، با مرزش: پنجرهٔ مسئلهٔ P = پیام‌های سشن از دیرترینِ {آغازِ سشن، لحظه‌ای که موضوعِ «دیگرِ» پیشین در همین سشن تمام شد
//       (پیامِ «X تموم شد. حالا Y»، بسته شدنِ سشن به مسئلهٔ دیگر، ثبتِ lprobLog برای مسئلهٔ دیگر)} تا لحظه‌ای که سشن از P رفت. راهِ ساختن مهم نیست.
//  lnew    live_new بی موضوعِ پیشین ⇒ پرسش‌های پیش از ساخت هم (s03)
//  fuser   «ساختن» ِ فرم به دستِ کاربر بی موضوعِ پیشین ⇒ پرسش‌های پیش از ثبت هم (s07، s10، s11 r1/r2، s33، s35، s37)
//  fai     «ساختن» ِ فرم به دستِ دستیار بی موضوعِ پیشین ⇒ پرسش‌های پیش از کلیک و پاسخِ go هم (s21، s23، s25، s29 c10)
//  ended   «باغچه تموم شد. حالا حوض» ⇒ پرسشِ باغچه برای حوض نه (s29 c23، کنترل)، پرسشِ خودِ حوض پیش از ساختش آری (s29 c23)، و پرسشِ حوض برای باغچه نه؛
//          دو راه: باغچه با فرمِ دستیار + حوض با live_new، و باغچه با chat_solved + حوض با فرمِ دستیار
//  sw36    آب‌نمک با فرمِ کاربر، بعد رادیکال با live_new ⇒ آب‌نمک دو پرسشِ پیش از ثبتش را دارد، رادیکال پرسشِ آب‌نمک را نه (s36)
//  N2 — گزینه همیشه همان پرسشی است که دستیار واقعاً پرسید (جمله‌های پیوستهٔ خودش)، نه متنِ عامِ صفحه؛ نگاشت به پرسشِ صفحه/فهرست فقط برای یکی کردن
//       و شناسه. ضمیرِ اشاره درونِ پرسشِ خودبسنده («کجا این شباهت می‌شکند…») پیوند نمی‌دهد. دنبالهٔ «(بعد در صفحه…)» فقط اگر دستیار گفت (s02، s23).
//  own     s23 (قیاس)، s02 (resultQ ِ بازگفته)، s11 r1 (A191 ⇐ u5) با واژه‌های خودِ دستیار؛ بازگفتِ عینیِ پرسشِ صفحه همان متن (کنترل)
//  best    «کدام پرسش کمک کرد؟» (#lpBBest) در بازنگری: گزینهٔ 💬 با واژه‌های دستیار؛ پرسشِ صفحه که در گفت‌وگو هم عیناً پرسیده شد یک گزینه است (یکی کردن)
// LLA_FILE = ساختِ دیگر (خطِ قرمز: ساختِ bd815fb)؛ ONLY=lnew,ended …
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
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0] + ' ' + JSON.stringify(info[name] && info[name].stage || '')); } };
  const W = (ms) => p.waitForTimeout(ms || 90);
  const NOW = new Date(); const D = (n) => { const d = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const T0 = D(0);
  await p.goto(FILE); await p.waitForSelector('.nav'); await W(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0;
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    // پاسخِ دستیار که فرمِ «🔭» را پر می‌کند و «ساختن» را می‌زند (کلیدهای k از فهرستِ فرمِ همان پرامپت)
    window.FORM = (reply, title, st) => (u => {
      const tk = (u.match(/^- (k\d+) \| [a-z]+ \| «عنوانِ کوتاهِ مسئله/m) || [])[1], sk = (u.match(/^- (k\d+) \| textarea \| «مسئله را همان‌طور که هست/m) || [])[1], bk = (u.match(/(k\d+)=«ساختنِ مسئلهٔ حل‌نشده»/) || [])[1];
      (window.__keys = window.__keys || []).push({ tk, sk, bk });
      return R({ reply, actions: [{ do: 'fill', k: tk, value: title }, { do: 'fill', k: sk, value: st }, { do: 'click', k: bk }] });
    });
  }, T0);
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await W(140); };
  const sel = async (s, v) => { await p.selectOption(s, v); await W(120); };
  const click = async (s) => { await p.click(s); await W(160); };
  const hasEl = (s) => p.locator(s).count();
  const fillIf = async (s, v) => { if (await hasEl(s)) await p.fill(s, v); };
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
    await p.evaluate(() => APP.ASSIST.toggle(false)); await W(60);
  };
  const next = (reply) => p.evaluate(reply => __q.push(R({ reply })), reply);
  const nextR = (o) => p.evaluate(o => __q.push(R(o)), o);
  const nextForm = (reply, title, st) => p.evaluate(([a, b, c]) => __q.push(FORM(a, b, c)), [reply, title, st]);
  const mk = async (o) => { await go('e_prob', null, 'live'); await p.fill('#lpNewT', o.title); await p.fill('#lpNewS', o.st); await W(60); if (o.kind) await sel('#lpNewType', o.kind); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return p.evaluate(() => APP.state.arg); };
  const fresh = async (v, a) => { await go(v || 'home', a); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; }); };
  const cq = (pid) => p.evaluate(pid => APP.liveChatQs(pid), pid);
  const pidOf = (re) => p.evaluate(src => { const rx = new RegExp(src); const x = APP.liveAll().filter(x => rx.test(x.p.title)).pop(); return x ? x.p.id : null; }, re.source);
  const sessLog = () => p.evaluate(() => { const s = APP.ASSIST.cur(); return { lprob: s.lprob || '', log: (s.lprobLog || []).map(e => [String(e.p).slice(-5), e.ai]), n: (s.msgs || []).length }; });
  const has = (qs, re) => (qs || []).some(t => re.test(t));
  const Q_GUESST = 'حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟';

  // ================= lnew — N1: live_new بی موضوعِ پیشین (s03) =================
  await section('lnew', async () => {
    const r = info.lnew = {}; r.stage = 'chat';
    await fresh('home');
    await next('خودت بگو: فرض چیست؟ حکم چیست؟');
    await say('هفت نقطه روی صفحه دارم که هیچ سه‌تاش روی یک خط نیست؛ می‌خوام ثابت کنم از هر پنج‌تاش، چهارتا یه چهارضلعیِ محدب می‌سازن.');
    await next('برهانش؟ چرا برای هر چیدمانِ پنج‌نقطه‌ای، نه فقط این هفت تا؟');
    await say('فرض: پنج نقطه که سه‌تاشون هم‌خط نیستن. حکم: چهارتاشون رأس‌های یه چهارضلعیِ محدب‌ان.');
    r.stage = 'create';
    await nextR({ reply: 'ثبتش کردم. پوشِ محدبِ آن پنج نقطه چند رأس می‌تواند داشته باشد؟', actions: [{ do: 'live_new', title: 'چهارضلعیِ محدب از پنج نقطه', statement: 'ثابت کن از هر پنج نقطه در صفحه که هیچ سه‌تایشان هم‌خط نیستند، چهار تا رأس‌های یک چهارضلعیِ محدب‌اند.', nat: 'objective', kind: 'prove' }] });
    await say('برای همه‌ی چیدمان‌ها می‌خوام، با حالت‌ها شروع می‌کنم.');
    const P = await p.evaluate(() => APP.liveSessionPid(APP.ASSIST.cur()));
    await next('اگر پوش پنج رأس داشته باشد، کدام چهار تا را برمی‌داری؟'); await say('سه، چهار یا پنج رأس.');
    r.P = P; r.qs = P ? await cq(P) : []; r.sess = await sessLog(); delete r.stage;
    chk(!!P, 'lnew setup: live_new created and bound the problem ' + JSON.stringify(r));
    chk(has(r.qs, /فرض چیست|حکم چیست/), 'lnew: «خودت بگو: فرض چیست؟ حکم چیست؟» asked before live_new, in a session with no earlier subject, is offered (N1, s03) ' + JSON.stringify(r.qs));
    chk(has(r.qs, /چرا برای هر چیدمانِ پنج‌نقطه‌ای/), 'lnew: «برهانش؟ چرا برای هر چیدمانِ پنج‌نقطه‌ای، نه فقط این هفت تا؟» asked before live_new is offered (N1, s03) ' + JSON.stringify(r.qs));
    chk(has(r.qs, /پوشِ محدب/) && has(r.qs, /کدام چهار تا را برمی‌داری/), 'lnew: control — the creating reply\'s question and a later one are offered ' + JSON.stringify(r.qs));
  });

  // ================= fuser — N1: «ساختن» به دستِ کاربر بی موضوعِ پیشین (s11، s37، s07، s10، s33، s35) =================
  await section('fuser', async () => {
    const r = info.fuser = {}; r.stage = 'chat';
    await fresh('home');
    await next('پیش از کد، یک قدم عقب: کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟');
    await say('یه صفحه ۱۰×۱۰ که دو گوشه‌ی مقابلش رو برداشتن؛ می‌خوام با دومینوهای ۱×۲ کاملش کنم. برنامه‌م یه ساعته داره می‌چرخه.');
    await next('داده‌ها را روشن گفتی. «۹۸ زوج است» فقط تعداد را می‌سنجد، نه کلِ شرط را؛ پس مجهولت دقیقاً چیست — یک چیدمانِ کامل، یا دانستنِ این‌که اصلاً چنین چیدمانی هست یا نه؟');
    await say('می‌خوام صفحه‌ی ۱۰ در ۱۰ بی دو گوشه‌ی مقابل رو با دومینو بپوشونم، ۹۸ خونه می‌مونه.');
    await next('شرط چیست؟ می‌توانی بخش‌هایش را جدا بنویسی؟');
    await say('دانستنِ این‌که اصلاً چنین چیدمانی هست یا نه. شرط: هر دومینو دو خونه‌ی مجاور، هیچ خونه‌ای دوبار.');
    r.stage = 'form';
    const P = await mk({ title: 'دومینو روی صفحهٔ ۱۰×۱۰ بی دو گوشه', st: 'صفحهٔ ۱۰×۱۰ که دو گوشهٔ مقابلش برداشته شده را می‌شود با دومینوهای ۱×۲ کامل پوشاند؟', nat: 'objective' });
    r.afterForm = await sessLog();
    await next('هر دومینو چند خانهٔ سیاه و چند خانهٔ سفید می‌پوشاند؟'); await say('یکی سیاه یکی سفید.');
    r.qs = await cq(P); r.sess = await sessLog(); delete r.stage;
    chk(r.afterForm.log.length && r.afterForm.log[r.afterForm.log.length - 1][1] === false, 'fuser setup: the user\'s «ساختن» bound the session user-side (lprobLog ai:false) ' + JSON.stringify(r.afterForm));
    chk(has(r.qs, /مجهولت دقیقاً چیست — یک چیدمانِ کامل/), 'fuser: the key question «… مجهولت دقیقاً چیست — یک چیدمانِ کامل، یا …؟» asked before she filed the problem herself, with no earlier subject in the session, is offered (N1, s11 r2, s10) ' + JSON.stringify(r.qs));
    chk(has(r.qs, /^شرط چیست؟ می‌توانی بخش‌هایش را جدا بنویسی؟$/), 'fuser: «شرط چیست؟ می‌توانی بخش‌هایش را جدا بنویسی؟» asked before filing is offered (N1, s37) ' + JSON.stringify(r.qs));
    chk(has(r.qs, /کلِ مسئله را در یک جمله و به زبانِ خودت/), 'fuser: the whole-first question asked before filing is offered, in the assistant\'s own words (N1+N2, s11 r1, s35) ' + JSON.stringify(r.qs));
    chk(has(r.qs, /خانهٔ سیاه/), 'fuser: control — a question after filing is offered ' + JSON.stringify(r.qs));
  });

  // ================= fai — N1: «ساختن» به دستِ دستیار بی موضوعِ پیشین (s21، s23، s25، s29 c10) =================
  await section('fai', async () => {
    const r = info.fai = {}; r.stage = 'chat';
    await fresh('home');
    await next('دربارهٔ «همیشه مربعِ کامل» داوری نمی‌کنم — فعلاً حدس است. چطور می‌آزمایی‌اش — با کدام وارسی یا حالتِ خاص؟');
    await say('جمعِ n عددِ فردِ اول رو برای ده تا n حساب کردم، همیشه مربع کامل شد. فکر کنم همیشه n به توان دو باشه.');
    await nextR({ reply: 'ثبتش می‌کنیم؛ فرمش را باز می‌کنم. برهانش چیست — چرا برای هر n، نه فقط این ده‌تا؟', actions: [{ do: 'go', view: 'e_prob', sub: 'live' }] });
    await say('با n=11 هم امتحان کردم، ۱۲۱ شد. ثبتش کن.');
    r.stage = 'form';
    await nextForm('عنوان و صورت را از حرف‌های خودت پر کردم و «ساختن» را می‌زنم.', 'جمعِ n عددِ فردِ نخست', 'جمعِ n عددِ فردِ نخست همیشه n به توانِ دو است؛ ثابتش کن.');
    await say('آره بساز.'); await W(300);
    const P = await pidOf(/جمعِ n عددِ فردِ نخست/);
    await next('از n به n+1 چه چیزی به جمع اضافه می‌شود؟'); await say('عددِ فردِ بعدی، 2n+1.');
    r.P = P; r.qs = P ? await cq(P) : []; r.sess = await sessLog(); r.keys = await p.evaluate(() => window.__keys); delete r.stage;
    chk(!!P && r.sess.lprob === P, 'fai setup: the assistant filed the problem through the form (fill + «ساختن», no live_new) and the session is bound to it ' + JSON.stringify(r));
    chk(has(r.qs, /چطور می‌آزمایی‌اش — با کدام وارسی یا حالتِ خاص/), 'fai: the guess-test question asked before the assistant clicked «ساختن», with no earlier subject in the session, is offered (N1, s23 c13, s25 c16, s21 c18, s29 c10) ' + JSON.stringify(r.qs));
    chk(has(r.qs, /برهانش چیست — چرا برای هر n/), 'fai: the question of the reply that opened the form («go») is offered (N1, s25 c16) ' + JSON.stringify(r.qs));
    chk(has(r.qs, /از n به n\+1/), 'fai: control — a later question is offered ' + JSON.stringify(r.qs));
  });

  // ================= ended — N1: «X تموم شد. حالا Y» (s29) =================
  await section('ended', async () => {
    const r = info.ended = {};
    const GQ = /مستطیلِ باریک بزرگ‌ترین/, PQ = /نقطه‌ای که دنبالش هستی چه ویژگی‌ای/;
    // (الف) باغچه با فرمِ دستیار، حوض با live_new
    r.stage = 'a-garden'; await fresh('home'); await go('e_prob', null, 'live');
    await next('دربارهٔ «مستطیلِ باریک» داوری نمی‌کنم. این حدس را چطور می‌آزمایی — با کدام حالتِ خاص که مستطیلِ باریک بزرگ‌ترین است؟');
    await say('۴۰ متر لبه‌ی سنگی دارم برای یه باغچه‌ی چهارضلعی؛ بزرگ‌ترین باغچه چه شکلیه؟ فکر کنم مستطیلِ باریک. بعدش هم یه حوضِ گرد می‌خوام که به سه تا مسیرِ باغ مماس باشه.');
    await nextForm('عنوان و صورتِ باغچه را پر کردم و «ساختن» را می‌زنم.', 'بزرگ‌ترین باغچهٔ چهارضلعی با ۴۰ متر لبه', '۴۰ متر لبهٔ سنگی برای یک باغچهٔ چهارضلعی دارم؛ بزرگ‌ترین باغچه چه شکلی است؟');
    await say('با چند مستطیل امتحان می‌کنم. ثبتش کن.'); await W(300);
    const G = await pidOf(/بزرگ‌ترین باغچهٔ چهارضلعی/);
    r.stage = 'a-pond'; await go('home');
    await next('حوض را جدا ثبت می‌کنیم. یک پرسش برای فهمِ مسئلهٔ تازه: مجهول دقیقاً چیست — نقطه‌ای که دنبالش هستی چه ویژگی‌ای باید داشته باشد؟');
    await say('باغچه تموم شد. حالا حوض: یه حوضِ گرد می‌خوام که به سه تا مسیرِ باغ مماس باشه؛ جای مرکزِ حوض رو چطوری پیدا کنم؟');
    await nextR({ reply: 'مسئلهٔ حوض را ثبت کردم. سه مسیر را روی کاغذ می‌کشی و نام‌گذاری می‌کنی؟', actions: [{ do: 'live_new', title: 'مرکزِ حوضِ گردِ مماس بر سه مسیر', statement: 'یه حوضِ گرد می‌خوام که به سه تا مسیرِ باغ مماس باشه؛ جای مرکزِ حوض رو چطوری پیدا کنم؟', nat: 'objective' }] });
    await say('نقطه‌ای که فاصله‌اش از سه مسیر برابر باشه. ثبتش کن.');
    const Pd = await p.evaluate(() => APP.liveSessionPid(APP.ASSIST.cur()));
    await next('نقطه‌هایی که از دو خط به یک فاصله‌اند کجا هستند؟'); await say('روی نیمساز.');
    r.a = { G, Pd, qg: G ? await cq(G) : [], qp: Pd && Pd !== G ? await cq(Pd) : [], sess: await sessLog() };
    chk(!!G && !!Pd && Pd !== G, 'ended (a) setup: garden filed by the assistant\'s form, pond by live_new, both in one session ' + JSON.stringify(r.a));
    chk(!has(r.a.qp, GQ), 'ended (a): the garden question is not offered for the pond — the garden subject ended at «باغچه تموم شد. حالا حوض» (control, s29 c23) ' + JSON.stringify(r.a.qp));
    chk(has(r.a.qp, PQ), 'ended (a): the pond\'s own question asked after «باغچه تموم شد. حالا حوض» and before the pond was created is offered (N1, s29 c23 p4) ' + JSON.stringify(r.a.qp));
    chk(has(r.a.qp, /سه مسیر را روی کاغذ/) && has(r.a.qp, /از دو خط به یک فاصله/), 'ended (a): control — the creating reply\'s and a later pond question are offered ' + JSON.stringify(r.a.qp));
    chk(has(r.a.qg, GQ), 'ended (a): the garden keeps its own question asked before the assistant filed it (N1, s29 c10) ' + JSON.stringify(r.a.qg));
    chk(!has(r.a.qg, PQ) && !has(r.a.qg, /از دو خط به یک فاصله/), 'ended (a): the pond questions are not offered for the garden — the garden window ends at the switch message (N1) ' + JSON.stringify(r.a.qg));
    // (ب) باغچه با chat_solved (حل‌شده در گفت‌وگو)، حوض با فرمِ دستیار
    r.stage = 'b-garden'; await fresh('home');
    await next('این حدس را چطور می‌آزمایی — با کدام حالتِ خاص که مستطیلِ باریک بزرگ‌ترین است؟');
    await say('۴۰ متر لبه برای یه باغچه‌ی چهارضلعی دارم؛ فکر کنم مستطیلِ باریک بزرگ‌ترینه. حوضِ گرد رو هم بعداً می‌گم.');
    await next('مستطیلِ ۱۹ در ۱ و ۱۰ در ۱۰ را مقایسه کردی — از راهِ دیگری هم به همین می‌رسی؟');
    await say('مربعِ ۱۰ در ۱۰ با ۱۰۰ بزرگ‌ترینه، با میانگینِ حسابی و هندسی هم درمیاد.');
    await nextR({ reply: 'بازنگری‌ات را ثبت کردم.', actions: [{ do: 'chat_solved', title: 'باغچهٔ چهارضلعیِ بیشینه با ۴۰ متر', statement: '۴۰ متر لبه برای یک باغچهٔ چهارضلعی؛ کدام شکل بیشترین مساحت را دارد؟', kind: 'find', lesson: 'میانگینِ حسابی و هندسی نشان می‌دهد چرا مربع بیشینه است', check: 'مستطیلِ ۹ در ۱۱ مساحتِ ۹۹ دارد' }] });
    await say('درسم: میانگین حسابی و هندسی نشون میده چرا مربع بیشینه‌ست. با ۹ در ۱۱ هم چک کردم ۹۹ شد.');
    const G2 = await pidOf(/باغچهٔ چهارضلعیِ بیشینه/);
    r.stage = 'b-pond'; await go('e_prob', null, 'live');
    await nextR({ reply: 'حوض را جدا ثبت می‌کنیم؛ فرمش را باز می‌کنم. مجهول دقیقاً چیست — نقطه‌ای که دنبالش هستی چه ویژگی‌ای باید داشته باشد؟', actions: [{ do: 'go', view: 'e_prob', sub: 'live' }] });
    await say('باغچه تموم شد. حالا حوض: یه حوضِ گرد می‌خوام که به سه تا مسیرِ باغ مماس باشه؛ جای مرکزِ حوض رو چطوری پیدا کنم؟');
    await nextForm('عنوان و صورتِ حوض را پر کردم و «ساختن» را می‌زنم.', 'مرکزِ حوضِ گردِ مماس بر سه مسیر', 'یه حوضِ گرد می‌خوام که به سه تا مسیرِ باغ مماس باشه؛ جای مرکزِ حوض رو چطوری پیدا کنم؟');
    await say('نقطه‌ای که از سه مسیر یک فاصله داره. ثبتش کن.'); await W(300);
    const P2 = await p.evaluate(() => APP.ASSIST.cur().lprob || null);
    await next('نقطه‌هایی که از دو خط به یک فاصله‌اند کجا هستند؟'); await say('روی نیمساز.');
    r.b = { G2, P2, qg: G2 ? await cq(G2) : [], qp: P2 && P2 !== G2 ? await cq(P2) : [], sess: await sessLog() };
    delete r.stage;
    chk(!!G2 && !!P2 && P2 !== G2, 'ended (b) setup: garden filed by chat_solved, then the pond filed by the assistant\'s form and bound to the session ' + JSON.stringify(r.b));
    chk(!has(r.b.qp, GQ) && !has(r.b.qp, /از راهِ دیگری هم به همین می‌رسی/), 'ended (b): the garden questions are not offered for the pond (control, s29 c23) ' + JSON.stringify(r.b.qp));
    chk(has(r.b.qp, PQ), 'ended (b): the pond question of the reply that opened its form, after «باغچه تموم شد. حالا حوض», is offered (N1, s29 c23) ' + JSON.stringify(r.b.qp));
    chk(has(r.b.qg, GQ) && has(r.b.qg, /از راهِ دیگری هم به همین می‌رسی/) && !has(r.b.qg, PQ), 'ended (b): the chat_solved garden keeps its questions and not the pond\'s (N1) ' + JSON.stringify(r.b.qg));
  });

  // ================= sw36 — N1: آب‌نمک با فرمِ کاربر، بعد رادیکال (s36) =================
  await section('sw36', async () => {
    const r = info.sw36 = {}; r.stage = 'brine';
    await fresh('home');
    await next('پیش از جزئیات: کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟');
    await say('بیست لیتر آب‌نمکِ ده درصد داریم؛ چند لیتر آب‌نمکِ بیست‌وپنج درصد اضافه کنیم تا پانزده درصد بشه؟');
    await next('همان چیزی که دنبالش هستی دقیقاً چیست — و دوست داری چه اسمی رویش بگذاری؟');
    await say('می‌خوام بدونم چند لیتر آب‌نمکِ غلیظ لازمه تا مخلوط پانزده درصد بشه.');
    await say('لیترهای آب‌نمکِ ۲۵ درصد، اسمش x.');
    const A1 = await mk({ title: 'آب‌نمک ۱۵٪', st: 'بیست لیتر آب‌نمک ده درصد داریم؛ چند لیتر آب‌نمک بیست‌وپنج درصد اضافه کنیم تا پانزده درصد شود؟', nat: 'objective' });
    r.stage = 'radical'; await go('home');
    await nextR({ reply: 'مسئلهٔ تازه را ثبت کردم. دو جواب درآمد؛ شرطِ رادیکال را با توانِ دو تبدیل کردی — شرطِ تازه هم‌ارزِ شرطِ اصلی است؟', actions: [{ do: 'live_new', title: 'رادیکال برابر با خودش', statement: 'عددی را بیاب که رادیکالِ آن عدد به‌اضافهٔ شش با خودِ آن عدد برابر است.', nat: 'objective' }] });
    await say('یه مسئله‌ی دیگه: عددی که رادیکالِ اون به‌اضافه‌ی شش با خودش برابره. به توان دو رسوندم، دو جواب درومد، ۳ و منفی ۲.');
    const B1 = await p.evaluate(() => APP.liveSessionPid(APP.ASSIST.cur()));
    r.A1 = A1; r.B1 = B1; r.qa = await cq(A1); r.qb = B1 && B1 !== A1 ? await cq(B1) : []; r.sess = await sessLog(); delete r.stage;
    chk(!!B1 && B1 !== A1 && r.sess.log.length >= 2 && r.sess.log[0][1] === false, 'sw36 setup: brine filed by her form (ai:false), then the radical by live_new ' + JSON.stringify(r));
    chk(has(r.qa, /کلِ مسئله را در یک جمله/) && has(r.qa, /همان چیزی که دنبالش هستی دقیقاً چیست/), 'sw36: the brine problem gets its two questions asked before her click — the whole-first one (in the assistant\'s words) and «همان چیزی که دنبالش هستی دقیقاً چیست…» (N1, s36: was empty) ' + JSON.stringify(r.qa));
    chk(!has(r.qa, /هم‌ارز/), 'sw36: the brine list ends where the session moved to the radical ' + JSON.stringify(r.qa));
    chk(has(r.qb, /هم‌ارز/) && !has(r.qb, /همان چیزی که دنبالش هستی|کلِ مسئله را در یک جمله/), 'sw36: control — the radical keeps its own question and never the brine\'s (s36 radical vs brine) ' + JSON.stringify(r.qb));
  });

  // ================= own — N2: واژه‌های خودِ دستیار (s23، s02، s11 r1) =================
  await section('own', async () => {
    const r = info.own = {}; r.stage = 'obj';
    const P = await mk({ title: 'زمانِ پختِ کیکِ بزرگ', st: 'کیکی در قالبِ ۲۰ سانتی ۳۰ دقیقه می‌پزد؛ در قالبِ ۲۸ سانتی با همان ارتفاع چقدر طول می‌کشد؟', nat: 'objective' });
    await fresh('lprob', P);
    for (const [q, a] of [
      ['قیاس را به کار بردی: کجا این شباهت می‌شکند — زمانِ پخت به کدام جزءِ قالب بند است که در «مساحتِ کف» متناظری ندارد؟', 'زمانِ پخت به فاصله‌ی وسط تا لبه بنده، نه مساحت.'],
      ['پیش از کد، یک قدم عقب: کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟', 'زمانِ پختِ کیک در قالبِ بزرگ‌تر رو می‌خوام.'],
      [Q_GUESST, 'با قالبِ ۲۰ سانتی دوباره می‌سنجم.']]) { await next(q); await say(a); }
    r.qo = await cq(P);
    r.stage = 'prac';
    const P2 = await mk({ title: 'لوله در وانت', st: 'یک لولهٔ صافِ ۴ متری دارم و بارِ وانتم ۳.۲ متر طول، ۱.۸ عرض و ۱.۶ ارتفاع دارد. جا می‌شود؟', nat: 'practical' });
    await fresh('lprob', P2);
    await next('ارتفاع را به کار بردی. ولی «حل شد» را صفحه هنوز ندیده. نتیجه‌ای گفتی — با واقعیت سنجیدی‌اش؟ از راهِ دیگری هم به همین ۴.۰۰۵ می‌رسیدی؟ بعد در صفحه «✅ حل شد» و بازنگری.');
    await say('آره با متر اندازه گرفتم، قطرِ فضایی ۴.۰۰۵ شد.');
    r.qp = await cq(P2); delete r.stage;
    // DECISIONS_R16 L1a: سرِ پیش از «:» که برچسبِ تنها نیست («قیاس را به کار بردی:»، «پیش از کد، یک قدم عقب:») جزءِ پرسش است و می‌ماند (پیش‌تر بریده می‌شد)
    chk(r.qo.includes('قیاس را به کار بردی: کجا این شباهت می‌شکند — زمانِ پخت به کدام جزءِ قالب بند است که در «مساحتِ کف» متناظری ندارد؟'), 'own→R16 L1a: the analogy question is offered exactly as the assistant asked it, with its head «قیاس را به کار بردی:» (N2, s23 c13) ' + JSON.stringify(r.qo));
    chk(!has(r.qo, /کدام جزءِ آن مورد این‌جا متناظری ندارد/) && !has(r.qo, /^خوب که کیک درآمد/), 'own: never the page\'s generic Q_ANALIM text, and the demonstrative in «کجا این شباهت…» does not pull in an earlier sentence (N2, s23) ' + JSON.stringify(r.qo));
    chk(r.qo.includes('پیش از کد، یک قدم عقب: کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟') && !has(r.qo, /^شکلی بکش یا نام‌گذاریِ مناسبی بکن/), 'own→R16 L1a: the whole-first A191 question is offered in the assistant\'s own words (head included), not as the list\'s u5 «شکلی بکش…؛ … دوباره بگو» (N2, s11 r1) ' + JSON.stringify(r.qo));
    chk(r.qo.filter(t => t === Q_GUESST).length === 1, 'own: control — the page question echoed verbatim is offered as that same text (the assistant\'s words are the page\'s words) ' + JSON.stringify(r.qo));
    chk(!has(r.qp, /کدام پیش‌بینی درست درآمد/) && !has(r.qp, /\(بعد در صفحه/), 'own: the paraphrased resultQ never shows the sub-question the assistant did not ask («کدام پیش‌بینی…») nor the page\'s «(بعد در صفحه…)» (N2, s02 chat:6) ' + JSON.stringify(r.qp));
    chk(has(r.qp, /با واقعیت سنجیدی‌اش؟/) && has(r.qp, /از راهِ دیگری هم به همین ۴\.۰۰۵ می‌رسیدی؟/), 'own: the questions the assistant actually asked in that turn are offered in its words (N2, s02) ' + JSON.stringify(r.qp));
  });

  // ================= best — N2: گزینه‌های #lpBBest در بازنگری =================
  await section('best', async () => {
    const r = info.best = {}; r.stage = 'mk';
    const P = await mk({ title: 'ضلع‌های مثلثِ چهارم', st: 'محیطِ مثلثی ۳۶ است؛ a دو برابرِ b و c سه واحد بیشتر از b است. ضلع‌ها چقدرند؟', nat: 'objective' });
    r.stage = 'chat'; await fresh('lprob', P);
    await next('پیش از کد، یک قدم عقب: کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟'); await say('محیطِ مثلث ۳۶ است و ضلع‌ها به هم وابسته‌اند؛ ضلع‌ها را می‌خواهم.');
    await next('مجهول (یا حکمی که باید ثابت شود) چیست؟'); await say('سه ضلعِ a و b و c.');
    r.stage = 'u'; await go('lprob', P);
    await p.fill('#lpOne', 'می‌خواهم سه ضلع را بیابم'); await p.fill('#lpWhy', 'برایم مهم است و کنجکاوم'); await click('main .lp-onesave');
    if (await hasEl('#lpNat')) await sel('#lpNat', 'objective');
    await p.fill('#lpUnk', 'a و b و c'); await p.fill('#lpD_d1', 'محیط ۳۶ است'); await p.fill('#lpD_d2', 'a دو برابرِ b است'); await p.fill('#lpCond', 'a + b + c = 36');
    if (await hasEl('#lpSat')) await sel('#lpSat', 'yes');
    await sel('#lpSuff', 'ناکافی است — چیزی کم است'); await fillIf('#lpSuffW', 'هنوز همه را نمی‌دانم'); await fillIf('#lpSuffChal', 'همهٔ داده‌ها با هم آن را معین می‌کنند');
    if (await hasEl('#lpDep')) await sel('#lpDep', 'no');
    await p.fill('#lpGuess', 'b حدودِ هشت است'); await sel('#lpConf', '60'); await p.fill('#lpTest', 'با یک حالتِ خاص می‌آزمایم'); await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
    await click('main .lp-usave'); if (await hasEl('main .lp-u .sv-g2')) await click('main .lp-u .sv-g2');
    r.stage = 'plan';
    await p.selectOption('#lpMv', 'mv_special').catch(() => {}); await fillIf('#lpMvWhy', 'اول فقط یک حالت را دقیق می‌بینم تا دامنه تنگ شود'); if (await hasEl('main .lp-mvadd')) await click('main .lp-mvadd');
    await p.fill('#lpPlan', 'نخست هر ضلع را برحسبِ b می‌نویسم سپس در محیط جای‌گذاری می‌کنم'); await W(350);
    for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); }
    await click('main .lp-plansave');
    r.stage = 'step'; await go('lprob', P, 'exec');
    await p.fill('#lpStep', 'a = 2b و c = b + 3 پس 4b + 3 = 36 و b = 8.25'); await sel('#lpClear', 'بله'); await fillIf('#lpProof', 'از داده‌ها و جای‌گذاری در محیط'); await click('main .lp-stepsave');
    r.stage = 'back'; await click('main .lp-solved');
    const o = await p.evaluate(() => [...document.querySelectorAll('#lpBBest option')].map(o => o.textContent));
    r.opts = o.map(t => t.slice(0, 90)); delete r.stage;
    // DECISIONS_R15 O2 (C·T1): lpOne در همین بخش پر شد ⇒ پرسشِ «اول کل» در صفحه پاسخ گرفت ⇒ یک گزینه، گزینهٔ صفحه — نه 💬 (پیش‌تر 💬 می‌ماند)؛ هرگز متنِ u5
    chk(o.filter(t => /کلِ مسئله/.test(t)).length === 1 && o.some(t => /^اول کل، بعد جزءها: کلِ مسئله/.test(t)) && !o.some(t => /^💬 شکلی بکش/.test(t)), '#lpBBest→R15 O2: the whole-first question answered on the page by lpOne is ONE option, the page one, never the list\'s u5 wording (N2, s11 r1 / R14B; C·T1) ' + JSON.stringify(r.opts));
    chk(o.filter(t => /مجهول \(یا حکمی که باید ثابت شود\) چیست؟/.test(t)).length === 1, '#lpBBest: a page question she answered on the page and the assistant also asked verbatim is ONE option (mapping used to dedupe) ' + JSON.stringify(r.opts));
  });

  console.log(JSON.stringify(info).slice(0, 16000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
