// تورِ پولیا (دستهٔ ۱، دورِ ۱۳ ِ اصلاح — دورِ «بی‌نقص» ِ پنجم، ۲۰۲۶-۱۰-۱۷) — DECISIONS_R13 (M1–M4) روی رابطِ واقعی.
//  form    M1: مسئله‌ای که دستیار با فرم ساخت (fill + کلیکِ «ساختن»، بی live_new) ⇒ پرسشِ باغچه (مسئلهٔ پیشینِ همین سشن، chat_solved؛ مرزِ N1 ِ دورِ ۱۴: «باغچه تموم شد. حالا حوض») نه (s29 c23)؛
//          پرسشِ پاسخِ سازنده و پرسشِ پس از آن (کنترل)
//  switch  M1: سشن از مسئلهٔ A به صفحهٔ مسئلهٔ B رفت ⇒ پرسش‌های A برای B نیست و A پرسش‌های خودش را نگه می‌دارد (s30، s36)
//  invent  M1: مسئله‌های chat_invent (کنارگذاشته) پرسش‌های بازنگریِ مسئلهٔ حل‌شدهٔ همان گفت‌وگو را نمی‌گیرند؛ مسئلهٔ chat_solved همه را دارد (کنترل)؛
//          پرسشِ پاسخِ سازنده که خودِ مسئلهٔ تازه را نام می‌برد می‌ماند (کنترل) (s31)
//  echo    M2: پرسش‌های نوبتِ صفحه که به «؟» ختم نمی‌شوند (Q_LINK، resultQ، Q_LINE، EQ_FEW) وقتی عیناً بازگفته شوند یک گزینه‌اند (s06)؛ بازگفتِ دنبالهٔ
//          پرسشِ حدس («… کدام ستون می‌تواند ردش کند — …؟») به همان یک گزینه می‌پیوندد، بی پیش‌درآمد (s01 c40)؛ پرسشِ تنهای «کدام حلقه…؟» و پرسشِ بی‌ارجاعِ بعدی (کنترل)
//  whole   M3: پرسشِ کل‌اول شناسهٔ u0 دارد؛ coach_state با ans:["u0"] برای پاسخی که مجهول و شرط را با هم گفت ⇒ نوبتِ بعد پرسشِ کل‌اول تکرار نمی‌شود
//          و کارت در صفحه می‌ماند (s01 p2→p3)؛ ادعای u0 بی شرط/داده (فقط مجهول) آن را نمی‌پراند (کنترل)
//  proof   M4: «امتحان کردم درسته، … چطور ثابت کنم» ⇒ پرسشِ «کدام ویژگی کار را درست کرد — همان را برای حالتِ کلی» (s38 p6)؛ «امتحان کردم، نشد… نمیشه» ⇒
//          همان پرسشِ ناممکن بودن (s11 p3، کنترل)
// LLA_FILE = ساختِ دیگر (خطِ قرمز: ساختِ 9898aa1)؛ ONLY=form,echo …
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
  // روزِ صفحه همان روزِ واقعیِ ساعت (r.created و زمانِ پیام‌ها با ساعتِ واقعی است)
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
  const lastUser = () => p.evaluate(() => { const c = __calls.filter(x => !/^\[سامانه/.test(String(((x.user || '').split('# نوبتِ تازه\n')[1] || '')).trim())); return (c[c.length - 1] || __calls[__calls.length - 1] || {}).user || ''; });
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const liveOf = (u) => block(u, '# مسئلهٔ زندهٔ این سشن');
  const coachOf = (u) => block(u, '# مربیِ حل');
  const sugOf = (c) => (/پیشنهادِ این نوبت: «([^\n]*?)»(?: \(|\. اگر|$)/.exec(c) || [])[1] || '';
  const next = (reply) => p.evaluate(reply => __q.push(R({ reply })), reply);
  const turnQ = (u) => { const bl = liveOf(u); const m = /نپرس\): «(.*)»\. اگر/.exec(bl) || /پرسشِ پیشنهادیِ این نوبت: «(.*)»\. اگر/.exec(bl) || /صفحه همین حالا می‌پرسد[^«]*«(.*)»\. اگر/.exec(bl); return m ? m[1] : ''; };
  const mk = async (o) => { await go('e_prob', null, 'live'); await p.fill('#lpNewT', o.title); await p.fill('#lpNewS', o.st); await W(60); if (o.kind) await sel('#lpNewType', o.kind); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return p.evaluate(() => APP.state.arg); };
  const fresh = async (v, a) => { await go(v || 'home', a); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; }); };
  const cq = (pid) => p.evaluate(pid => APP.liveChatQs(pid), pid);
  const Q_GUESST = 'حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟';
  const Q_LINK = 'پیش از رها کردنِ کلِ راه: کدام حلقه دقیقاً شکست؟ شاید فقط همان یکی باید عوض شود و بقیهٔ زنجیره درست است.';
  const Q_LINE = 'کجا خط می‌کشی؟ چه چیزی را عمداً بیرون می‌گذاری و تا کجا اطلاعات جمع می‌کنی — و چرا؟ (در مسئلهٔ عملی داده‌ها بی‌شمارند؛ فقط آنچه اثرِ محسوس دارد، و تقریبی که بس است)';
  const EQ_FEW = 'معادله کم است: کدام بخشِ شرط هنوز به معادله درنیامده؟ (برای n مجهول دست‌کم n معادلهٔ مستقل لازم است)';
  const RESQ = 'نتیجه‌ای گفتی — از راهِ دیگری هم به همین می‌رسی؟ نتیجه را وارسی کن: در شرط بگذار یا با حالتی خاص بسنج. (بعد در صفحه «✅ حل شد» و بازنگری)';

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  // ================= form — M1: ساخت با فرم در نوبتِ دستیار (s29 c23) =================
  await section('form', async () => {
    const r = info.form = {}; r.stage = 'garden';
    await fresh('e_prob', null); await go('e_prob', null, 'live');
    await next('این حدس را چطور می‌آزمایی — با کدام وارسی یا حالتِ خاص که گلدان‌ها از کم‌آبی زرد شده‌اند؟');
    await say('گلدون‌های باغچه زرد شدن، فکر کنم کم‌آبی باشه؛ حوض حیاط هم آبش کم میشه.');
    // DECISIONS_R14 N1: مرزِ موضوعِ پیشین — در s29 باغچه مسئلهٔ ثبت‌شدهٔ همین سشن بود و «باغچه تموم شد. حالا حوض» آمد (گفت‌وگوی بی‌مسئلهٔ پیش از ثبت مالِ مسئلهٔ نخست است)
    r.stage = 'garden-solved';
    await p.evaluate(() => __q.push(R({ reply: 'بازنگری‌ات را ثبت کردم.', actions: [{ do: 'chat_solved', title: 'زرد شدنِ گلدان‌های باغچه', statement: 'گلدان‌های باغچه زرد شده‌اند؛ علتش کم‌آبی است یا چیزِ دیگری؟', kind: 'find', lesson: 'اول ساده‌ترین علت را بیازما', check: 'یک هفته آبِ روزانه و گلدان‌ها سبز شدند' }] })));
    await say('یه هفته هر روز آب دادم سبز شدن؛ درسم: اول ساده‌ترین علت رو بیازما.');
    r.stage = 'create';
    await p.evaluate(() => __q.push(u => {
      const tk = (u.match(/^- (k\d+) \| [a-z]+ \| «عنوانِ کوتاهِ مسئله/m) || [])[1], sk = (u.match(/^- (k\d+) \| textarea \| «مسئله را همان‌طور که هست/m) || [])[1], bk = (u.match(/(k\d+)=«ساختنِ مسئلهٔ حل‌نشده»/) || [])[1];
      window.__keys = { tk, sk, bk };
      return R({ reply: 'ثبتش می‌کنم. آب در یک هفتهٔ بی‌باران چقدر از حوضِ حیاط کم می‌شود؟', actions: [{ do: 'fill', k: tk, value: 'آبِ حوضِ حیاط' }, { do: 'fill', k: sk, value: 'آبِ حوضِ حیاط هر هفته کم می‌شود و نمی‌دانم نشتی دارد یا تبخیر است.' }, { do: 'click', k: bk }] });
    }));
    await say('باغچه تموم شد. حالا حوض: آبِ حوضِ حیاط هر هفته کم میشه؛ بیا مسئله‌ش رو ثبت کنیم.'); await W(400);
    r.keys = await p.evaluate(() => window.__keys);
    const P = await p.evaluate(() => { const x = APP.liveAll().filter(x => /حوضِ حیاط/.test(x.p.title)).pop(); return x ? x.p.id : null; });
    r.stage = 'after'; await next('در یک روزِ بادی سطحِ آب چقدر پایین می‌رود؟'); await say('هر هفته حدودِ سه سانت.');
    r.qs = P ? await cq(P) : []; r.sess = await p.evaluate(pid => { const s = APP.ASSIST.cur(); return { lprob: s.lprob === pid, log: (s.lprobLog || []).length }; }, P);
    delete r.stage;
    chk(!!P, 'form setup: the assistant created the pond problem through the form (fill + «ساختن» click, no live_new) ' + JSON.stringify(r));
    chk(!r.qs.some(t => /گلدان/.test(t)), 'form: the garden question asked in the session BEFORE the form-created pond problem is not offered for it (M1, s29 c23) ' + JSON.stringify(r.qs));
    chk(r.qs.some(t => /یک هفتهٔ بی‌باران/.test(t)), 'form: control — the question of the reply whose «ساختن» click created it is offered ' + JSON.stringify(r.qs));
    chk(r.qs.some(t => /روزِ بادی/.test(t)), 'form: control — a later question about it is offered ' + JSON.stringify(r.qs));
  });

  // ================= switch — M1: سشن به مسئلهٔ دیگری رفت (s30، s36) =================
  await section('switch', async () => {
    const r = info.switch = {}; r.stage = 'mk';
    const A1 = await mk({ title: 'آب‌نمک ۱۵٪', st: 'بیست لیتر آب‌نمک ده درصد داریم؛ چند لیتر آب‌نمک بیست‌وپنج درصد اضافه کنیم تا پانزده درصد شود؟', nat: 'objective' });
    const B1 = await mk({ title: 'رادیکال برابر با خودش', st: 'عددی را بیاب که رادیکالِ آن عدد به‌اضافهٔ شش با خودِ آن عدد برابر است.', nat: 'objective' });
    r.stage = 'a'; await fresh('lprob', A1);
    await next('حدس‌وآزمون کند است: مجهولِ آب‌نمک را چه می‌نامی — چه اسمی رویش می‌گذاری؟'); await say('از x برای لیترهای آب‌نمکِ ۲۵٪ استفاده می‌کنم.');
    r.stage = 'b'; await go('lprob', B1);
    await next('دو جواب درآمد؛ شرطِ رادیکال را با توانِ دو تبدیل کردی — شرطِ تازه هم‌ارزِ شرطِ اصلی است؟'); await say('دو تا جواب درومد، ۳ و منفی ۲.');
    r.qa = await cq(A1); r.qb = await cq(B1); delete r.stage;
    chk(!r.qb.some(t => /آب‌نمک/.test(t)), 'switch: the brine naming question asked before the session moved to the radical problem is not offered for the radical problem (M1, s36/s30) ' + JSON.stringify(r.qb));
    chk(r.qb.some(t => /توانِ دو|هم‌ارز/.test(t)), 'switch: control — the radical problem keeps its own question ' + JSON.stringify(r.qb));
    chk(r.qa.some(t => /آب‌نمک/.test(t)) && !r.qa.some(t => /توانِ دو|هم‌ارز/.test(t)), 'switch: the brine problem keeps its own question (window ends where the session switched away) and not the later one (M1, s36: was empty) ' + JSON.stringify(r.qa));
  });

  // ================= invent — M1: chat_invent / chat_solved (s31) =================
  await section('invent', async () => {
    const r = info.invent = {}; r.stage = 'chat';
    await fresh('home');
    await next('پیش از سؤالِ بعد: می‌توانی نتیجه را وارسی کنی — و آیا همهٔ داده‌ها و کلِ شرطِ صورت در جوابت آمده‌اند؟');
    await say('مسئله: دو عدد که جمعشان ۱۰ است بیشترین حاصل‌ضرب را کی دارند؟ جواب ۵ و ۵ شد، حاصل‌ضرب ۲۵.');
    await next('می‌توانی همین نتیجه را از راهِ دیگری به دست آوری — یا در یک نگاه ببینی چرا جزءها باید نزدیکِ هم باشند؟');
    await say('آره با مربع کامل: ۲۵ منهای مربعِ فاصله از ۵.');
    r.stage = 'invent';
    await p.evaluate(() => __q.push(R({ reply: 'دو مسئلهٔ خوب ساختی و ثبتشان کردم. در «صحیح‌های متمایز با جمعِ ۱۰» اول کدام جزءها را امتحان می‌کنی؟ این نوع مسئله برایت چطور بود — کدام بخشش را دوست داشتی؟',
      actions: [{ do: 'chat_invent', title: 'صحیح‌های متمایز با جمعِ ۱۰', statement: 'صحیح‌های مثبتِ متمایز با جمعِ ۱۰ که بیشترین حاصل‌ضرب را دارند کدام‌اند؟', kind: 'find' },
        { do: 'chat_invent', title: 'مربع‌ها با جمعِ ۱۰', statement: 'دو عدد با جمعِ ۱۰ که کمترین مجموعِ مربع‌ها را دارند کدام‌اند؟', kind: 'find' }] })));
    await say('یه مسئله‌ی تازه: صحیح‌های متمایز با جمع ۱۰، و یکی هم مجموع مربع‌ها.');
    r.stage = 'solved';
    await p.evaluate(() => __q.push(R({ reply: 'بازنگری‌ات را ثبت کردم.', actions: [{ do: 'chat_solved', title: 'بیشینهٔ حاصل‌ضرب با جمعِ ۱۰', statement: 'دو عدد که جمعشان ۱۰ است بیشترین حاصل‌ضرب را کی دارند؟', kind: 'find', lesson: 'مربعِ کامل کردن نشان می‌دهد چرا جزءها باید برابر باشند', check: 'با ۴ و ۶ حاصل‌ضرب ۲۴ کمتر است' }] })));
    await say('درسم: مربع کامل کردن نشون میده چرا جزءها باید برابر باشن. با ۴ و ۶ هم چک کردم ۲۴ شد.');
    const ids = await p.evaluate(() => { const L = APP.liveAll(); const f = (re) => { const x = L.filter(x => re.test(x.p.title)).pop(); return x ? x.p.id : null; }; return { d: f(/متمایز/), s2: f(/مربع‌ها/), sol: f(/بیشینهٔ حاصل‌ضرب/) }; });
    r.ids = ids; r.qd = ids.d ? await cq(ids.d) : null; r.qs2 = ids.s2 ? await cq(ids.s2) : null; r.qsol = ids.sol ? await cq(ids.sol) : null; delete r.stage;
    const LB = /وارسی کنی|راهِ دیگری|این نوع مسئله/;
    chk(ids.d && ids.s2 && ids.sol, 'invent setup: two chat_invent problems and one chat_solved problem exist ' + JSON.stringify(ids));
    chk(r.qd && r.qs2 && !r.qd.some(t => LB.test(t)) && !r.qs2.some(t => LB.test(t)), 'invent: the problems she invented (chat_invent, put aside) do not get the look-back questions asked about the solved problem (M1, s31) ' + JSON.stringify({ d: r.qd, s2: r.qs2 }));
    chk(r.qd && r.qd.some(t => /اول کدام جزءها/.test(t)), 'invent: control — the creating reply\'s question that names the invented problem is offered for it ' + JSON.stringify(r.qd));
    chk(r.qs2 && r.qsol && !r.qs2.some(t => /اول کدام جزءها/.test(t)) && !r.qsol.some(t => /اول کدام جزءها/.test(t)), 'invent: the creating reply\'s question that names one invented problem belongs to it alone — not to its sibling «… با جمعِ ۱۰» nor to the solved problem (M1) ' + JSON.stringify({ s2: r.qs2, sol: r.qsol }));
    chk(r.qsol && ['وارسی کنی', 'راهِ دیگری'].every(w => r.qsol.some(t => t.indexOf(w) >= 0)), 'invent: control — the chat_solved problem keeps the look-back questions asked while it was solved in this chat (solved before it was filed) ' + JSON.stringify(r.qsol));
  });

  // ================= echo — M2: پرسشِ صفحه بی «؟» ِ پایانی، و بازگفتِ دنباله (s06، s01 c40) =================
  await section('echo', async () => {
    const r = info.echo = {}; r.stage = 'mk';
    const P = await mk({ title: 'مسیرِ دوچرخه', st: 'دو دوچرخه‌سوار از دو سرِ جاده‌ای ۶۰ کیلومتری با سرعت‌های ۱۲ و ۱۸ به سوی هم می‌روند. کی به هم می‌رسند؟', nat: 'objective' });
    r.stage = 'chat'; await fresh('lprob', P);
    for (const [q, a] of [[Q_LINK, 'حلقهٔ دوم شکست.'], [RESQ, 'در شرط گذاشتم، درست درآمد.'], [Q_LINE, 'سرعتِ باد را بیرون می‌گذارم.'], [EQ_FEW, 'شرطِ زمانِ برابر هنوز نیامده.'],
      ['«دو ساعت» را درست یا غلط نمی‌خوانم؛ حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام ساعت می‌تواند ردش کند — ساعتی که جمعِ دو مسافت در آن به ۶۰ نمی‌رسد؟', 'ساعتِ ۱ رو امتحان می‌کنم.'],
      ['کدام حلقه دقیقاً شکست؟', 'همان دومی.'], ['حدسی گفتی — چطور می‌آزمایی‌اش؟ فردا کی وقت داری؟', 'فردا عصر.']]) { await next(q); await say(a); }
    r.qs = await cq(P); delete r.stage;
    for (const [k, q] of [['Q_LINK', Q_LINK], ['resultQ', RESQ], ['Q_LINE', Q_LINE], ['EQ_FEW', EQ_FEW]]) chk(r.qs.filter(t => t === q).length === 1, 'echo: the page turn question ' + k + ' (no trailing «؟») echoed verbatim is ONE option, recognised by its known text (M2, s06) ' + JSON.stringify(r.qs));
    chk(!r.qs.some(t => /^(?:شاید فقط همان یکی|\(بعد در صفحه|\(در مسئلهٔ عملی|\(برای n مجهول|پیش از رها کردنِ کلِ راه:$)/.test(t)), 'echo: never a non-question fragment of those questions as an option ' + JSON.stringify(r.qs));
    chk(r.qs.filter(t => t === Q_GUESST).length === 1 && !r.qs.some(t => /ردش/.test(t) && t !== Q_GUESST) && !r.qs.some(t => /درست یا غلط نمی‌خوانم/.test(t)), 'echo: a paraphrased continuation that refers back («… کدام ساعت می‌تواند ردش کند — …؟») joins the guess-test question — ONE option, no preamble (M2, s01 c40) ' + JSON.stringify(r.qs));
    chk(r.qs.some(t => t === 'کدام حلقه دقیقاً شکست؟'), 'echo: control — the bare «کدام حلقه دقیقاً شکست؟» is still an option ' + JSON.stringify(r.qs));
    chk(r.qs.some(t => /فردا کی وقت داری/.test(t)), 'echo: control — a following question that does not refer back is not swallowed ' + JSON.stringify(r.qs));
  });

  // ================= whole — M3: پرسشِ کل‌اول با شناسهٔ u0 (s01 p2→p3) =================
  await section('whole', async () => {
    const r = info.whole = {}; const WQ = await p.evaluate(() => APP.liveWholeQ);
    for (const [tag, said, ans2] of [['ok', ['u', 'c'], true], ['ctl', ['u'], false]]) {
      const c = r[tag] = {}; c.stage = 'mk';
      const P = await mk({ title: 'خرید یا اجاره ' + tag, st: 'سه ماه است فایل اکسل پر می‌کنم که خانه بخرم یا اجاره‌نشین بمانم و هیچ تصمیمی نمی‌گیرم.', nat: 'practical' });
      await fresh('lprob', P);
      await next('«بهترین تصمیم» را به‌جای تو داوری نمی‌کنم. ' + WQ); await say('خب معلومه دیگه، بهترین تصمیم مالی. بخرم یا نه؟');
      const u2 = await lastUser(); c.list0 = (liveOf(u2).split('\n').filter(l => /^- پرسش‌های همین مرحله/.test(l))[0] || '').slice(0, 260); c.q2 = turnQ(u2);
      await p.evaluate(said => __q.push(R({ reply: 'دو چیز را مهم گفتی. کدام داده‌ها اثرِ محسوس دارند؟', actions: [{ do: 'coach_state', ph: 'u', said, ans: ['u0', 'u1', 'u3'], stuck: false, fail: false, role: 'self', nat: 'practical' }] })), said);
      await say('هوم... راستش اگه فکر کنم، مهم‌ترینش اینه که پسرم تا هفت سال آینده یه جای امن و ثابت داشته باشه، و قسط یا اجاره بیشتر از ۴۰ درصد درآمدمون نشه.');
      await say('خب، بعدش چی؟'); const u4 = await lastUser(); c.q4 = turnQ(u4);
      c.card = await p.evaluate(() => !!document.querySelector('main .lp-onesave'));
      c.ledger = await p.evaluate(([pid, wq]) => APP.ASSIST.coachLedger(APP.ASSIST.cur(), 'l:' + pid).includes(wq), [P, WQ]);
      delete c.stage;
      if (tag === 'ok') {
        chk(/u0\) «اول کل، بعد جزءها/.test(c.list0), 'whole: while the whole-first card is open, the coach list gives the whole-first question an id (u0) (M3) ' + JSON.stringify(c.list0));
        chk(/اول کل/.test(c.q2), 'whole setup: the whole-first question is the turn question at first ' + JSON.stringify(c.q2));
        chk(c.ledger && !!c.q4 && !/اول کل/.test(c.q4), 'whole: after coach_state ans:["u0"] for a reply that gave goal and condition together, the next turn does NOT repeat the whole-first question (M3, s01 p3) ' + JSON.stringify(c));
        chk(c.card, 'whole: the page card stays until «ثبتِ کل» ' + JSON.stringify(c));
      } else chk(!c.ledger && /اول کل/.test(c.q4), 'whole: control — u0 claimed for a reply that the validated report says gave only the unknown (no condition/data) does not drop the whole-first question ' + JSON.stringify(c));
    }
  });

  // ================= proof — M4: پرسشِ برهان تابعِ نتیجهٔ حالت‌های آزموده (s38 p6، s11 p3) =================
  await section('proof', async () => {
    const r = info.proof = {};
    const run = async (msgs) => { await fresh('home'); for (const m of msgs) await say(m); const c = coachOf(await lastUser()); return { sug: sugOf(c).slice(0, 160), turn: c.split('\n').filter(l => /^- \*\*پرسشِ این نوبت همین است:\*\*/.test(l)).map(l => l.slice(0, 300)) }; };
    r.ok = await run(['ثابت کنید مجموعِ زاویه‌های داخلیِ هر چندضلعیِ محدب با n ضلع برابرِ (n−2)×۱۸۰ درجه است.', 'برای مثلث و مربع امتحان کردم درسته، ولی برای حالت کلی نمی‌دونم چطور ثابت کنم.']);
    r.fail = await run(['یه صفحه ۱۰×۱۰ که دو گوشه‌ی مقابلش رو برداشتن. می‌خوام با دومینوهای ۱×۲ کاملش کنم. برنامه‌ی backtracking نوشتم، یه ساعته داره می‌چرخه. کجای کدم اشتباهه؟', '۲×۲ و ۴×۴ رو دستی امتحان کردم، نشد. حالا فکر می‌کنم اصلاً نمیشه. ولی چطور ثابتش کنم؟ ۹۸ که زوجه!']);
    chk(/کدام ویژگی کار را درست کرد/.test(r.ok.sug) && !/نشدن/.test(r.ok.sug) && r.ok.turn.length === 1 && !/نشدن/.test(r.ok.turn[0] || ''), 'proof: cases that WORKED + "how do I prove the general case?" ⇒ «چرا برای هر حالت؟ … کدام ویژگی کار را درست کرد — همان را برای حالتِ کلی» (M4, s38 p6), never «نشدن» ' + JSON.stringify(r.ok));
    chk(/نشدن را لازم می‌آورد/.test(r.fail.sug) && r.fail.turn.length === 1, 'proof: control — cases that FAILED + "it\'s impossible?" keep the impossibility wording (s11 p3) ' + JSON.stringify(r.fail));
  });

  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 14000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
