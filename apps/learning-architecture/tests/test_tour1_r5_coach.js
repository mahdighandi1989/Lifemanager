// تورِ پولیا (دستهٔ ۱، دورِ ۵ ِ اصلاح، ۲۰۲۶-۱۰-۱۶) — سهمِ «coach» از DECISIONS_R5:
//  F1  عدم‌تقارنِ خطا: پشتیبانِ الگویی هرگز پرسشی را «پاسخ‌گرفته» نمی‌کند و مرحله را با شاهدِ سست جلو نمی‌برد؛ «پس X = … حالا…» میانی است؛
//      «X تموم شد. حالا Y» مسئلهٔ تازه؛ دلسردی/زورِ خام طرح نیست؛ پیامِ نخستی که نتیجه‌اش را می‌گوید چسبانده نیست؛ «یادم نمیاد/گیرم» پاسخ نیست؛
//      «ثابت شد» ِ پس از چند شکل ادعاست ⇒ «برهانش؟».
//  F2  یک پرسش در نوبت از یک منبع: نشانه‌های همین نوبت به A.liveCoach(pid,{asked, turn}) می‌رود، q عیناً نقل می‌شود و «همان که صفحه می‌پرسد»
//      فقط وقتی همان رشته است؛ «همهٔ داده‌ها؟» هرگز پیش از طرح.
//  F3  دفترِ پاسخ برای هر مسئله؛ «مسئلهٔ حل‌شدهٔ مرتبط» برای پدرِ بسته در همین سشن؛ سشنِ تازه با یک مسئلهٔ باز ⇒ پیشنهاد (نه پیوند)؛ «# پس از شکست» فقط دو نوبت.
//  F4  ردهٔ «life» برای زندگی؛ سرواژه از نوع × داور؛ واژهٔ «اثبات» نوع را اثباتی نمی‌کند؛ به‌روزرسانیِ chat_invent نوع را دوباره حدس می‌زند.
//  F6  سطرهای کتاب در قلاب با شناسهٔ دفترِ پوشش، در لحظهٔ خودشان.
// همه از رابطِ واقعی (پنجرهٔ دستیار با مدلِ بدلیِ «میانگینِ لفظی»، کنش‌های مدل، فرم‌های «🔭»). خروج با کدِ غیرصفر در خطا.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
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
  });
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
  };
  const newSess = () => p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => (__calls[__calls.length - 1] || {}).user || '');
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const coachOf = (u) => block(u, '# مربیِ حل');
  const liveOf = (u) => block(u, '# مسئلهٔ زندهٔ این سشن');
  const phOf = (c) => (/مرحلهٔ محتمل: ([^·—]+?)\s*(?:·|—)/.exec(c) || [])[1] || '';
  const headOf = (c) => (/^# مربیِ حل[^\n]*$/m.exec(c) || [''])[0];
  const sugOf = (c) => (/پیشنهادِ این نوبت: «([^»]+)»/.exec(c) || [])[1] || '';
  // مدلِ بدلیِ «میانگینِ لفظی»: پاسخ با یک پرسش؛ اگر st داده شد گزارشِ وضع را هم می‌فرستد؛ act کنش‌های دیگر
  const next = (reply, st) => p.evaluate(([reply, st]) => __q.push(R({ reply, actions: st ? [Object.assign({ do: 'coach_state' }, st)] : [] })), [reply, st || null]);
  const act = (o) => p.evaluate(o => __q.push(R(o)), o);
  const ST = (o) => Object.assign({ ph: 'u', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' }, o);
  const marked = (c) => /\[در گفت‌وگو پاسخ گرفته/.test(c);

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  // ================= F1 — عدم‌تقارنِ خطا =================
  // F1-a) پیامِ گزارش‌نشده: پرسشِ پیشینِ دستیار با «هر پیامِ واقعیِ بعدی» پاسخ‌گرفته نمی‌شود (s01/s02/s31/s38)
  await newSess();
  await next('شرط چیست؟ می‌توانی بخش‌هایش را جدا بنویسی؟');
  await say('دو عدد مثبت داریم که جمعشون ده است؛ بیشترین حاصل‌ضربشون چنده؟');
  await say('هر دو مثبت باشن و جمع بشه ده');
  { const c = coachOf(await lastUser()); info.f1a = { marked: marked(c) };
    chk(!info.f1a.marked, 'F1: with no coach_state the fallback never marks the previous assistant question answered on the next message (s01, s31, s38) ' + JSON.stringify(info.f1a)); }

  // F1-b) «پس V = … حالا دیگه فقط y داره» میانی است؛ «پس v = …» ِ بی‌دنباله هنوز نتیجه (s18)
  await newSess();
  await say('یه قیفِ مخروطی داریم با شعاعِ دهانهٔ ۳ و ارتفاعِ ۹؛ آب با آهنگِ ثابت می‌ریزه. سرعتِ بالا اومدنِ آب وقتی عمق ۶ است چقدره؟');
  await say('r = y/3. پس V = (π/27)y³. حالا دیگه فقط y داره.');
  info.f1b = { mid: phOf(coachOf(await lastUser())) };
  await say('پس v = ۲/۹ سانتی‌متر بر ثانیه.');
  info.f1b.fin = phOf(coachOf(await lastUser()));
  chk(info.f1b.mid !== 'بازنگری' && info.f1b.fin === 'بازنگری', 'F1: «پس X = …» followed by «حالا…» is an intermediate step (not look-back); a bare «پس v = …» still is a result (s18) ' + JSON.stringify(info.f1b));

  // F1-c) «باغچه تموم شد. حالا حوض…» ⇒ مسئلهٔ تازه از «فهم»، و دفترِ پاسخِ مسئلهٔ پیشین به آن نمی‌رسد (s29؛ F3)
  await newSess();
  await say('یه باغچهٔ مستطیلی با ۴۰ متر لبه می‌خوام که بیشترین مساحت رو داشته باشه.');
  await next('داده‌ها چیست؟', ST({ said: ['u'], ans: ['u1'] }));
  await say('مجهولم طول و عرضه که مساحت بیشینه بشه');
  await say('پس جواب ۱۰ در ۱۰ میشه، مربع.');
  info.f1c = { b: phOf(coachOf(await lastUser())) };
  await say('باغچه تموم شد. حالا حوض: یه حوضِ گرد می‌خوام که بر سه مسیر مماس باشه. جای مرکزشو چطوری پیدا کنم؟');
  { const c = coachOf(await lastUser()); info.f1c.ph = phOf(c); info.f1c.u1 = /u1\) [^\n]*?\[در گفت‌وگو پاسخ گرفته/.test(c); }
  chk(info.f1c.b === 'بازنگری' && info.f1c.ph === 'فهمِ مسئله' && !info.f1c.u1, 'F1/F3: «X تموم شد. حالا Y» starts the new problem Y at understanding, with its own (empty) answered-ledger (s29) ' + JSON.stringify(info.f1c));

  // F1-d) گشایشِ دلسرد یا «همه را یکی‌یکی امتحان کنم» طرح نیست (s34، s37)
  info.f1d = {};
  await newSess(); await say('سه ماهه پروژه‌ی پایانی رو شروع نکردم. هر روز لپ‌تاپ رو باز می‌کنم و می‌بندم. احساس می‌کنم اصلاً استعدادشو ندارم. فکر کنم باید انصراف بدم.');
  info.f1d.s34 = phOf(coachOf(await lastUser()));
  await newSess(); await say('تو دفتر حساب کاروانسرا نوشته «۳۶ رأس گوسفند: ؟۴۸۷؟ ریال» — رقم اول و آخر محو شده. می‌خوام بدونم قیمت هر گوسفند چقدر بوده. با این‌همه حالت ممکن، چطور پیدا کنم؟ فکر کنم باید ۱۰۰ حالت رو یکی‌یکی امتحان کنم.');
  info.f1d.s37 = phOf(coachOf(await lastUser()));
  await say('پس قیمت یا ۱۸۰۲ یا ۶۹۱ ریاله');
  info.f1d.s37res = phOf(coachOf(await lastUser()));
  chk(info.f1d.s34 === 'فهمِ مسئله' && info.f1d.s37 === 'فهمِ مسئله', 'F1: an opening of discouragement or a brute-force intention does not jump to planning (s34, s37) ' + JSON.stringify(info.f1d));
  chk(info.f1d.s37res === 'بازنگری', 'F1: «پس قیمت یا ۱۸۰۲ یا ۶۹۱ ریاله» is an unambiguous result (s37) ' + JSON.stringify(info.f1d));

  // F1-e) پیامِ نخستی که نتیجهٔ خودش را می‌گوید چسبانده نیست: said:result می‌ماند ⇒ بازنگری؛ سنجش مرحله را به عقب نمی‌برد (s31)
  await newSess();
  await next('از راهِ دیگری هم به آن می‌رسی؟', ST({ ph: 'b', said: ['result'] }));
  await say('حلش کردم! بیشترین حاصل‌ضرب اعداد مثبتی که جمعشون ۱۰ ه … ۵×۵=۲۵. سؤال بعدی رو بده.');
  await say('باشه بپرس');
  info.f1e = { ph: phOf(coachOf(await lastUser())), c: await p.evaluate(() => (APP.ASSIST.cur().coach || {}).ph) };
  chk(info.f1e.ph === 'بازنگری' && info.f1e.c === 'b', 'F1: a first message that states its own result keeps said:result ⇒ look-back on the next turn (s31) ' + JSON.stringify(info.f1e));

  // F1-f) «یادم نمیاد»، «گیرم» پاسخِ واقعی نیست — ادعای ans ِ مدل پذیرفته نمی‌شود (s38)
  await newSess();
  await say('ثابت کن حجمِ چهاروجهی‌ای که سه یالِ عمود بر هم a، a و b دارد a²b/6 است.');
  await next('بگو.', ST({ ph: 'u', ans: ['u1'], stuck: true }));
  await say('نه، یادم نمیاد. هنوز گیرم');
  await say('خب');
  { const c = coachOf(await lastUser()); info.f1f = { u1: /u1\) [^\n]*?\[در گفت‌وگو پاسخ گرفته/.test(c), real: await p.evaluate(() => [APP.ASSIST.coachRealReply('نه، یادم نمیاد. هنوز گیرم'), APP.ASSIST.coachRealReply('گیرم')]) };
    chk(!info.f1f.u1, 'F1: «نه، یادم نمیاد. هنوز گیرم» is not a real reply — the model\'s ans claim is rejected (s38) ' + JSON.stringify(info.f1f)); }

  // F1-g) «ثابت شد دیگه!» پس از چند شکل (بی استدلال) ادعاست ⇒ «برهانش؟»، نه بازنگری (s03)
  await newSess();
  await next('هوم.', ST({ ph: 'b', said: ['result'] }));
  await say('فرض: ۵ نقطه، مربع ضلع ۱، نقطه‌ها داخلش. حکم: دو تا فاصله‌شون ≤ √۲/۲. هفت تا شکل کشیدم با ۵ نقطه، همیشه دو تا نزدیک بودن. پس درسته، ثابت شد دیگه!');
  info.f1g = { claim: /برهانش؟/.test(coachOf(await lastUser())) };
  await say('خب');
  info.f1g.ph = phOf(coachOf(await lastUser()));
  chk(info.f1g.claim && info.f1g.ph !== 'بازنگری', 'F1: a heuristic «ثابت شد دیگه!» after drawings only is a CLAIM («برهانش؟»), not look-back (s03) ' + JSON.stringify(info.f1g));

  // ================= F4 — رده و سرواژه =================
  info.f4 = {};
  await newSess();
  await next('بگو.', ST({ nat: 'life' }));
  await say('همکارم پروژه رو خراب کرد و حالا مدیر از من می‌پرسه چی شد. بگم یا نگم؟');
  await say('نمی‌دونم، هر دو بده');
  { const c = coachOf(await lastUser()); info.f4.life = { head: headOf(c).slice(0, 160), unit: /با چه عدد یا واحدی/.test(c) };
    chk(!/تصمیم\/کارِ واقعی/.test(info.f4.life.head) && /زندگی/.test(info.f4.life.head) && !info.f4.life.unit, 'F4: the chat coach\'s class for a life problem is «life», not «pract» (no «با چه عدد یا واحدی…») (s13, s19, s34) ' + JSON.stringify(info.f4.life)); }
  await newSess();
  await next('بگو.', ST({ nat: 'objective' }));
  await say('یه تاس رو ۳ بار می‌ندازیم. احتمال اینکه حداقل یه ۶ بیاد چقدره؟');
  await say('اصلاً اثبات‌ها به چه درد می‌خورن؟ فقط عدد می‌خوام');
  info.f4.word = headOf(coachOf(await lastUser())).slice(0, 160);
  chk(!/اثباتی/.test(info.f4.word) && /پاسخِ عینی/.test(info.f4.word), 'F4: the mere word «اثبات» in user text never makes the coach «اثباتی» (s14) ' + JSON.stringify(info.f4));
  // سرواژه از نوع × داور برای مسئلهٔ زندهٔ بسته (live_new ِ مدل)
  const liveHead = async (kind, nat, st) => {
    await newSess();
    await act({ reply: 'ثبتش کردم.', actions: [{ do: 'live_new', title: 'فرضیهٔ ' + nat, statement: st, kind, nat }] });
    await say(st);
    await say('خب، از کجا شروع کنم؟');
    return headOf(coachOf(await lastUser())).slice(0, 160);
  };
  info.f4.podLife = await liveHead('pod', 'life', 'آیا مدیرم عمداً کارهای مهم رو به من نمی‌سپاره؟');
  info.f4.podObj = await liveHead('pod', 'objective', 'آیا هر عددِ زوجِ بزرگ‌تر از ۲ جمعِ دو عددِ اول است؟ اثبات یا رد کن.');
  info.f4.prove = await liveHead('prove', 'objective', 'ثابت کنید مجموعِ زاویه‌های داخلیِ هر مثلث ۱۸۰ درجه است.');
  chk(/فرضیه/.test(info.f4.podLife) && !/اثباتی/.test(info.f4.podLife), 'F4: a life pod\'s coach header says «فرضیه», never «اثباتی» (s05) ' + JSON.stringify(info.f4.podLife));
  chk(/اثبات یا رد/.test(info.f4.podObj) && !/· اثباتی/.test(info.f4.podObj), 'F4: an objective pod\'s header is «اثبات یا رد», not «اثباتی» (s27) ' + JSON.stringify(info.f4.podObj));
  chk(/· اثباتی/.test(info.f4.prove), 'F4: an objective prove problem keeps «اثباتی» ' + JSON.stringify(info.f4.prove));
  // به‌روزرسانیِ chat_invent نوع را دوباره حدس می‌زند (s25)
  await newSess();
  await act({ reply: 'ثبتش کردم.', actions: [{ do: 'live_new', title: 'پله‌ها', statement: 'از یه پلکان ۱۰ پله‌ای، هر بار یک یا دو پله، به چند راه بالا می‌رم؟', kind: 'find', nat: 'objective' }] });
  await say('از یه پلکان ۱۰ پله‌ای، هر بار یک یا دو پله، به چند راه بالا می‌رم؟');
  const parS = await p.evaluate(() => APP.ASSIST.cur().lprob);
  await act({ reply: 'نگهش داشتم.', actions: [{ do: 'chat_invent', title: 'پلکانِ n پله‌ای', statement: 'اگه پلکان n پله داشته باشه، تعداد راه‌ها چنده؟', from: parS }] });
  await say('اگه پلکان n پله داشته باشه، تعداد راه‌ها چنده؟');
  await act({ reply: 'نگهش داشتم.', actions: [{ do: 'chat_invent', title: 'پلکانِ n پله‌ای', statement: 'آیا تعدادِ راه‌های پلکانِ n پله‌ای همیشه عددِ فیبوناچیِ n+1 ام است؟', from: parS }] });
  await say('آیا تعدادِ راه‌های پلکانِ n پله‌ای همیشه عددِ فیبوناچیِ n+1 ام است؟');
  info.f4.reguess = await p.evaluate(par => APP.liveAll().filter(r => r.origin && r.origin.id === par).map(r => ({ k: r.p.kind, t: (APP.S.get('eprog_' + r.p.id).solve || {}).type, n: (r.p.restated || []).length })), parS);
  chk(info.f4.reguess.length === 1 && info.f4.reguess[0].n === 1 && info.f4.reguess[0].k === 'pod' && info.f4.reguess[0].t === 'pod', 'F4: a chat_invent update with a conjecture statement re-guesses the child\'s type (find ⇒ pod) (s25) ' + JSON.stringify(info.f4.reguess));

  // ================= F2 (سهمِ coach) — نشانه‌های نوبت ⇒ A.liveCoach؛ q عیناً؛ ادعای «همان که صفحه» فقط اگر همان =================
  await newSess();
  await act({ reply: 'ثبتش کردم.', actions: [{ do: 'live_new', title: 'کیکِ بزرگ', statement: 'کیکِ ۲۰ سانتی ۴۰ دقیقه می‌پزه؛ قالبِ من ۳۳ سانتیه. چقدر بذارم بمونه؟', kind: 'find', nat: 'practical' }] });
  await say('کیکِ ۲۰ سانتی ۴۰ دقیقه می‌پزه؛ قالبِ من ۳۳ سانتیه. چقدر بذارم بمونه؟');
  const P2 = await p.evaluate(() => APP.ASSIST.cur().lprob);
  await p.evaluate(() => { const orig = APP.liveCoach; window.__lc = []; APP.liveCoach = function (pid, opts) { const co = orig.apply(this, arguments); if (opts && opts.turn) window.__lc.push(JSON.parse(JSON.stringify(opts.turn))); if (co && opts && opts.turn && opts.turn.analogy) return Object.assign({}, co, { q: 'QQ-ANALOGY: کجا این شباهت می‌شکند؟' }); return co; }; window.__lcOrig = orig; });
  await say('مساحت ۲٫۸ برابره؛ زمان هم ۲٫۸ برابر؟');
  { const u = await lastUser(), L = liveOf(u), turns = await p.evaluate(() => __lc.slice());
    const one = (/^- در این نوبت فقط \*\*یک\*\* پرسش[^\n]*$/m.exec(L) || [''])[0];
    info.f2 = { analogy: turns.some(t => t.analogy === true), quoted: /«QQ-ANALOGY: کجا این شباهت می‌شکند؟»/.test(one), claim: /همان که صفحه/.test(one) };
    chk(info.f2.analogy, 'F2: the turn signal analogy (a ratio carried to a new quantity) reaches A.liveCoach(pid,{turn}) (s23) ' + JSON.stringify(info.f2));
    chk(info.f2.quoted && !info.f2.claim, 'F2: the block quotes liveCoach.q verbatim and does NOT claim it is the page\'s question when it differs from the page card ' + JSON.stringify(info.f2) + ' ' + one.slice(0, 200)); }
  await next('بگو.', ST({ ph: 'b', said: ['result'], nat: 'practical' }));
  await say('پس ۵۵ دقیقه، فکر کنم درسته');
  await say('خب');
  { const turns = await p.evaluate(() => __lc.slice()); info.f2.result = turns.length ? turns[turns.length - 1].result === true : false; }
  await say('گیر کردم');
  { const turns = await p.evaluate(() => __lc.slice()); info.f2.stuck = turns.length ? turns[turns.length - 1].stuck === true : false; }
  chk(info.f2.result && info.f2.stuck, 'F2: a validated «result» (model report on the previous message) and «stuck» reach A.liveCoach(pid,{turn}) (s28, s08) ' + JSON.stringify(info.f2));
  await p.evaluate(() => { APP.liveCoach = window.__lcOrig; });
  // q بی‌تغییر ⇒ ادعای «همان که صفحه» درست است فقط اگر همان رشته باشد
  await say('باشه');
  { const u = await lastUser(), one = (/^- در این نوبت فقط \*\*یک\*\* پرسش[^\n]*$/m.exec(liveOf(u)) || [''])[0], pq = await p.evaluate(pid => (APP.liveCoach(pid) || {}).q || '', P2);
    const q = (/«([^»]+)»\.?\s*(?:اگر|$)/.exec(one) || [])[1] || '';
    info.f2.same = { claim: /همان که صفحه/.test(one), eq: !!pq && one.indexOf('«' + pq + '»') >= 0 };
    chk(!info.f2.same.claim || info.f2.same.eq, 'F2: «همان که صفحه همین حالا می‌پرسد» only when the quoted question IS the page card\'s question ' + JSON.stringify(info.f2.same) + ' ' + one.slice(0, 200)); }
  // s08: پیامِ چسبانده؛ گیرِ گزارش‌شدهٔ مدل دور ریخته نمی‌شود ⇒ طرح و «از خواسته به عقب»
  await newSess();
  await say('معما: با یه ظرف ۹ لیتری و یه ظرف ۴ لیتری، دقیقاً ۶ لیتر آب بردار.');
  await next('بگو.', ST({ ph: 'p', stuck: true }));
  await say('همه حالت‌ها رو از اول امتحان کردم، اعصابم خورده، به جایی نمی‌رسم');
  await say('خب؟');
  { const c = coachOf(await lastUser()); info.f2.s08 = { ph: phOf(c), sug: sugOf(c).slice(0, 40) };
    chk(info.f2.s08.ph === 'طرح‌ریزی' && /به عقب/.test(info.f2.s08.sug), 'F2: a pasted puzzle the user has read counts as «unknown stated»; the model\'s stuck is not dropped ⇒ plan with «از خواسته به عقب» suggested (s08) ' + JSON.stringify(info.f2.s08)); }

  // ================= F3 — دفتر برای هر مسئله؛ پدرِ بسته؛ «# پس از شکست» =================
  await newSess();
  await act({ reply: 'ثبتش کردم.', actions: [{ do: 'live_new', title: 'دو بچه', statement: 'یه خانواده دو تا بچه داره و یکیشون پسره. احتمال اینکه هر دو پسر باشن چقدره؟', kind: 'find', nat: 'objective' }] });
  await say('یه خانواده دو تا بچه داره و یکیشون پسره. احتمال اینکه هر دو پسر باشن چقدره؟');
  const P3 = await p.evaluate(() => APP.ASSIST.cur().lprob);
  await next('داده‌ها چیست؟', ST({ ph: 'u', said: ['u'], ans: ['u1'] }));
  await say('مجهول احتمالِ پسر بودنِ هر دو است، به شرطِ اینکه یکی پسره');
  await say('خب');
  info.f3 = { parentU1: /u1\) [^\n]*?\[در گفت‌وگو پاسخ گرفته/.test(liveOf(await lastUser())) };
  await act({ reply: 'ثبت شد.', actions: [{ do: 'chat_solved', title: 'دو بچه', statement: 'یه خانواده دو تا بچه داره و یکیشون پسره. احتمال اینکه هر دو پسر باشن چقدره؟', kind: 'find', solution: '۱/۳', lesson: 'فضای نمونه را باید کامل نوشت', check: 'با شمردن' }] });
  await say('جوابش ۱/۳ شد. درسم اینه که فضای نمونه را باید کامل نوشت؛ با شمردن وارسی کردم.');
  await act({ reply: 'نگهش داشتم.', actions: [{ do: 'chat_invent', title: 'دو بچه — پسرِ سه‌شنبه', statement: 'اگه بدونیم یکیشون پسریه که سه‌شنبه به دنیا اومده، احتمال دو پسر چقدره؟', from: P3 }] });
  await say('اگه بدونیم یکیشون پسریه که سه‌شنبه به دنیا اومده، احتمال دو پسر چقدره؟');
  const C3 = await p.evaluate(par => (APP.liveAll().filter(r => r.origin && r.origin.id === par).pop() || { p: {} }).p.id, P3);
  await p.evaluate(pid => APP.go('lprob', pid), C3); await p.waitForTimeout(150);
  await say('خب این یکی رو چطوری شروع کنم؟');
  { const u = await lastUser(), L = liveOf(u);
    info.f3.done = await p.evaluate(pid => APP.livePhase(pid), P3); info.f3.child = !!C3 && /^# مسئلهٔ زندهٔ این سشن \(/.test(L) && L.indexOf(C3) >= 0;
    info.f3.childU1 = /u1\) [^\n]*?\[در گفت‌وگو پاسخ گرفته/.test(L); info.f3.related = u.indexOf('# مسئلهٔ حل‌شدهٔ مرتبط (' + P3 + ')') >= 0;
    chk(info.f3.parentU1 && info.f3.child && !info.f3.childU1, 'F3: the answered-ledger is per problem — the parent\'s answered u1 is not «answered» on the child in the same session (s24, s28) ' + JSON.stringify(info.f3));
    chk(info.f3.done === 'done' && info.f3.related, 'F3/B4: the parent closed in the same session appears as «# مسئلهٔ حل‌شدهٔ مرتبط» on the child (s24, s28) ' + JSON.stringify(info.f3)); }
  await p.evaluate(() => APP.go('home')); await p.waitForTimeout(100);
  // «# پس از شکست» فقط در نوبتِ شکست و نوبتِ بعد (s28)
  await newSess();
  await say('معما: با دو ساعت‌شنیِ ۷ و ۱۱ دقیقه، ۱۵ دقیقه را اندازه بگیر.');
  await say('نتونستم، اعصابم خورده');
  const willIn = async () => /^# پس از شکست، نقد یا میلِ رها کردن/m.test(await lastUser());
  info.f3.will = [await willIn()];
  await say('خب بعدش چی؟'); info.f3.will.push(await willIn());
  await say('باشه، یه حالتِ دیگه رو امتحان می‌کنم'); info.f3.will.push(await willIn());
  chk(info.f3.will[0] && info.f3.will[1] && !info.f3.will[2], 'F3: «# پس از شکست» lives only in the failure turn and the next one (s28) ' + JSON.stringify(info.f3.will));

  // ================= F6 — سطرهای کتاب در لحظهٔ خودشان، با شناسهٔ دفترِ پوشش =================
  const f6 = info.f6 = {};
  const hookFor = async (open, msg, pre) => { await newSess(); if (pre) await next('بگو.', pre); if (open) await say(open); await say(msg); return coachOf(await lastUser()); };
  const has = (c, ids) => ids.every(id => c.indexOf(id) >= 0);
  const OPEN = 'یه معما دارم: با دو ساعت‌شنیِ ۷ و ۱۱ دقیقه، دقیقاً ۱۵ دقیقه رو اندازه بگیر.';
  let c;
  c = await hookFor('فکر کنم مدیرم عمداً کارهای مهم رو بهم نمی‌ده. حدسم این بود که از من خوشش نمیاد.', 'حدسم غلط درآمد؛ به بقیه هم نمی‌ده.'); f6.guess = has(c, ['B231']);
  f6.guessCtl = !has(await hookFor(OPEN, 'خب، ساعت‌شنیِ ۷ رو برمی‌گردونم'), ['B231']);
  c = await hookFor('', 'شاگردام سر مسئله‌ها ساکت می‌مونن. من هم آخرش خودم حل می‌کنم روی تخته. سؤال‌هام یا جوابو لو میده یا کسی جواب نمیده. چیکار کنم؟'); f6.teacher = has(c, ['A167', 'A169', 'A129']);
  f6.teacherCtl = !has(await hookFor(OPEN, 'خب'), ['A167']);
  c = await hookFor('', 'می‌خوام آب بارون پشت‌بوم انبار رو جمع کنم برای آبیاری باغ. مخزن چقدر بزرگ بسازم؟ بتنی بسازم یا پلاستیکی بخرم؟ کجا بذارم؟ هر سه رو با هم بگو.'); f6.many = has(c, ['A044', 'A293']);
  c = await hookFor('', 'دخترم یه مسئله داره: «باغچه‌ای مستطیلی دورش ۲۴ متر حصار داره، طولش دو برابر عرضشه، طول و عرض چقدره؟» خودم بلدم، فقط بگو چطوری بهش بگم که زود تموم شه بریم بخوابیم.');
  f6.whole = has(c, ['A191']); f6.parent = /کاربر مربیِ یادگیرنده است/.test(c);
  f6.wholeCtl = !has(await hookFor('', 'ثابت کن رادیکالِ ۲ گنگ است.'), ['A191']);
  c = await hookFor('مسیرهای اتوبوس شهر رو چطوری طراحی کنم که هر ایستگاه حداکثر یه بار عوض کردن لازم داشته باشه؟', 'کلی‌تر که سخت‌تره!'); f6.inventorU = has(c, ['A263']) && phOf(c) === 'فهمِ مسئله';
  c = await hookFor('ثابت کن برای هر n، n³ − n بر ۶ بخش‌پذیره.', 'برای n=1,2,3,4 درست بود، پس ثابت شد.'); f6.heurU = has(c, ['B162']);
  c = await hookFor('', 'فقط جوابشو بگو! حجمِ چهاروجهی با سه یالِ عمودِ a و a و b چقدره؟ فردا ساعت ۸ باید تحویل بدم.'); f6.onlyAns = has(c, ['A073']);
  f6.onlyAnsCtl = !has(await hookFor('', 'حجمِ چهاروجهی با سه یالِ عمودِ a و a و b چقدره؟'), ['A073']);
  c = await hookFor(OPEN, 'از نابرابری‌ها بیشتر از هندسه لذت می‌برم، این یکی رو هم دوست داشتم'); f6.taste = has(c, ['C120', 'C117']);
  c = await hookFor('یه ظرف آب‌نمکِ ۲۰ لیتری ۱۰٪ داریم؛ چقدر آب‌نمکِ ۲۵٪ بریزیم که ۱۵٪ بشه؟', 'من از x و این حروف بدم میاد، بدون x حلش کنم'); f6.notation = has(c, ['B241']);
  c = await hookFor('برنامه‌ام یه جاهایی رکوردِ تکراری می‌سازه و نمی‌دونم کجا.', 'از آخر به عقب رفتم: رکوردِ تکراری از دو جا می‌تونه بیاد.'); f6.backward = has(c, ['C094']);
  c = await hookFor('برنامه‌ام یه جاهایی رکوردِ تکراری می‌سازه و نمی‌دونم کجا.', 'می‌خوام کل نظریهٔ تحلیل رو بندازم دور، هیچ‌کدوم از نشونه‌ها درست نبود'); f6.abandon = has(c, ['C095', 'C096']);
  c = await hookFor('۵ تا گلدون لوبیا با ۲ تا ۱۰ ساعت نور گذاشتم و حدسم اینه که رشد اشباع می‌شه.', 'گلدونِ ۲۴ ساعته از همه کوتاه‌تر شد! با قانونِ اشباعم نمی‌خونه — مثال نقضه'); f6.counter = has(c, ['C107']);
  c = await hookFor('ثابت کن ۱/(1·2) + ۱/(2·3) + … + ۱/(n(n+1)) = n/(n+1).', 'با استقرا ثابت کردم.'); f6.corollary = has(c, ['A284']) && phOf(c) === 'بازنگری';
  c = await hookFor('ثابت کن هیچ دو نفری از ۵ نفر پشتِ میزِ گرد کنار هم نمی‌شینن اگه این قوانین برقرار باشه.', 'چرا باید فرض کنم که همهٔ قوانین برقرارن؟ اگه یکیش نشه چی؟'); f6.indirect = has(c, ['C055']);
  chk(f6.guess && f6.guessCtl, 'F6: «حدس را بیازما» (B231) after a refuted guess — and only then (s05) ' + JSON.stringify(f6));
  chk(f6.teacher && f6.teacherCtl, 'F6: in the teacher frame, Pólya\'s reasons a bad question is bad (A167/A169) and authority ⇒ forgetting (A129) (s15, s16) ' + JSON.stringify(f6));
  chk(f6.many, 'F6: many unknowns ⇒ ordered sub-problems the user picks (A044/A293) (s17) ' + JSON.stringify(f6));
  chk(f6.whole && f6.wholeCtl && f6.parent, 'F6: «اول کل را ببین» (A191) on a long multi-sentence statement, not on a one-liner; «دخترم یه مسئله داره…» turns on the parent frame on turn 1 (s20, s16) ' + JSON.stringify(f6));
  chk(f6.inventorU && f6.heurU, 'F6: inventor\'s paradox (A263) whenever generalising is discussed, even at understanding; the heuristic-incomplete label (B162) whenever a plausible argument is offered as proof (s14, s20) ' + JSON.stringify(f6));
  chk(f6.onlyAns && f6.onlyAnsCtl, 'F6: «فقط جواب» ⇒ ask the learner\'s own attempt before the first hint (A073) (s38) ' + JSON.stringify(f6));
  chk(f6.taste, 'F6: the taste / good-authors line (C120, C117) when the user speaks of what he enjoys, in any phase (s31) ' + JSON.stringify(f6));
  chk(f6.notation, 'F6: the notation-aversion line (B241) when the user avoids letters (s36) ' + JSON.stringify(f6));
  chk(f6.backward && f6.abandon, 'F6: backward branches / blind alley (C094) and «بندازم دور» as abandoning a path — signs may deceive, persist (C095/C096) (s06) ' + JSON.stringify(f6));
  chk(f6.counter, 'F6: counterexample ⇒ narrow the domain (C107) (s07) ' + JSON.stringify(f6));
  chk(f6.corollary, 'F6: easy corollary (A284) in a proof\'s look-back (s25) ' + JSON.stringify(f6));
  chk(f6.indirect, 'F6: «why assume all hold?» ⇒ the open-minded procedure of indirect proof (C055) (s10) ' + JSON.stringify(f6));
  // F6: پلهٔ ۳ به بالا ⇒ معلمِ خیالی به نام و پاسخِ کوتاه‌تر از پیامِ خودش (نسبی، بی عدد) — پله از کاربست‌های واقعیِ خودش در روزهای جدا (s30)
  { // تاریخچهٔ کاربستِ خودش در سشن‌های پیشین (پاسخِ واقعیِ سنجیده در سه روزِ جدا: ۱ ⇒ ۳ ⇒ ۷ ِ نردبان) — زمانِ پیام ساعتِ واقعی است، پس تاریخچه کاشته می‌شود
    await p.evaluate(() => { const q = APP.ASSIST.tutorQuestions.und.qs[0], at = (d) => d + 'T09:00:00.000Z';
      APP.S.put({ id: 'achat_hist_r5', type: 'achat', title: 'پیشین', msgs: [{ role: 'user', at: at('2026-09-01'), text: 'مجهول اینه' }], coach: { ansLog: [{ q, at: at('2026-09-01'), self: 2 }, { q, at: at('2026-09-04'), self: 2 }, { q, at: at('2026-09-12'), self: 2 }] } }); });
    await newSess(); await say('معما: سه جعبه با برچسبِ غلط داریم؛ یکی سیب، یکی پرتقال، یکی قاطی. با یک بار برداشتن برچسب‌ها را درست کن.');
    const cc = coachOf(await lastUser()); f6.rung = await p.evaluate(() => APP.qRung(APP.ASSIST.tutorQuestions.und.qs[0]));
    f6.imag = /معلمِ خیالی/.test(cc) && has(cc, ['A069']) && /پلهٔ ۳/.test(cc); f6.fade = /بلندتر از پیامِ خودش/.test(cc) && has(cc, ['A074']);
    chk(f6.rung >= 3 && f6.imag && f6.fade, 'F6: at rung ≥ 3 the imaginary teacher is named (A069) and the reply is not longer than the user\'s own message (A074, relative) (s30) ' + JSON.stringify({ rung: f6.rung, imag: f6.imag, fade: f6.fade })); }

  // ================= صفحهٔ «🔭»: «همهٔ داده‌ها؟» هرگز پیش از طرح (F2)؛ سشنِ تازه با یک مسئلهٔ باز ⇒ پیشنهاد، نه پیوند (F3) =================
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const q = await ctx.newPage();
    q.on('pageerror', e => errors.push('pageerror(live): ' + e.message));
    q.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
    await q.route('**/fonts.googleapis.com/**', r => r.abort());
    const Wq = (ms) => q.waitForTimeout(ms || 90);
    const go = async (v, a, s) => { await q.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await Wq(140); };
    const sel = async (s, v) => { await q.selectOption(s, v); await Wq(120); };
    const click = async (s) => { await q.click(s); await Wq(160); };
    const hasEl = (s) => q.locator(s).count();
    const mk = async (o) => { await go('e_prob', null, 'live'); if (o.title != null) await q.fill('#lpNewT', o.title); await q.fill('#lpNewS', o.st); await Wq(60); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return q.evaluate(() => APP.state.arg); };
    const understand = async (o) => {
      await q.fill('#lpOne', o.one); await q.fill('#lpWhy', 'برایم مهم است و کنجکاوم'); await click('main .lp-onesave');
      await q.fill('#lpUnk', o.unk);
      for (let i = 0; i < o.data.length; i++) { if (i >= 2) await click('main .lp-dadd'); await q.fill('#lpD_d' + (i + 1), o.data[i]); }
      await q.fill('#lpCond', o.cond);
      if (await hasEl('#lpSat')) await sel('#lpSat', 'yes');
      await sel('#lpSuff', 'کافی است'); if (await hasEl('#lpSuffW')) await q.fill('#lpSuffW', 'همین‌ها بس است');
      await q.fill('#lpGuess', 'شدنی است'); await sel('#lpConf', '60'); await q.fill('#lpTest', 'با یک حالتِ خاص می‌آزمایم');
      await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
      await click('main .lp-usave'); await click('main .lp-u .sv-g2');
    };
    const sayQ = async (text, st) => { await q.evaluate(st => { if (st) __q.push({ reply: 'بگو.', status: 'related', memory: 'm', actions: [Object.assign({ do: 'coach_state' }, st)] }); }, st || null); await q.evaluate(() => APP.ASSIST.toggle(true)); await q.fill('.as-panel .as-in', text); await q.click('.as-panel .as-send'); await q.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 }); };
    const lastQ = () => q.evaluate(() => __calls[__calls.length - 1].user);
    await q.goto(FILE); await q.waitForSelector('.nav'); await Wq(300);
    await q.evaluate(() => { APP.S.loaded = true; window.__calls = []; window.__q = [];
      APP.callAI = async (sys, user, opts) => { __calls.push({ user }); const r = __q.shift(); const t = JSON.stringify(r || { reply: 'باشه.', status: 'related', memory: 'm', actions: [] }); return opts && opts.withMeta ? { text: t, files: [] } : t; }; });
    const P1 = await mk({ title: 'لوله در بار', st: 'یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟', nat: 'objective' });
    await understand({ one: 'می‌خواهم بدانم بلندترین پاره‌خطِ درونِ بار از چهار متر بلندتر است یا نه', unk: 'بلندترین پاره‌خطِ درونِ بار', data: ['طول ۳.۲ متر', 'عرض ۱.۸ متر', 'ارتفاع ۱.۶ متر'], cond: 'لوله صاف است و باید کامل درونِ بار باشد' });
    await go('home');
    // F3: سشنِ تازه، نابسته، با دقیقاً یک مسئلهٔ باز ⇒ یک سطرِ پیشنهاد؛ پیوند نمی‌خورد
    await q.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); });
    await sayQ('سلام، امروز دوباره اومدم');
    { const u = await lastQ(), sess = await q.evaluate(() => APP.ASSIST.cur().lprob || '');
      info.f3open = { line: /مسئلهٔ بازِ تو: «لوله در بار» — همین را ادامه می‌دهی؟/.test(u), bound: sess };
      await sayQ('نه، یه سؤالِ دیگه دارم دربارهٔ کتاب');
      info.f3open.twice = /مسئلهٔ بازِ تو:/.test(await lastQ());
      chk(info.f3open.line && !info.f3open.bound && !info.f3open.twice, 'F3: a new session with exactly one open live problem gets ONE suggestion line «مسئلهٔ بازِ تو: «…» — همین را ادامه می‌دهی؟» and is never auto-bound (s34) ' + JSON.stringify(info.f3open)); }
    // F2: «همهٔ داده‌ها؟» هرگز پیش از طرح، حتی با «گیر کردم» (s30، s33، s35)
    await go('lprob', P1);
    await q.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); });
    await sayQ('خب حالا طرح چی باشه؟', { ph: 'p', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' });
    await sayQ('نمی‌دونم، گیر کردم');
    { const u = await lastQ(), L = block(u, '# مسئلهٔ زندهٔ این سشن'), one = (/^- در این نوبت فقط \*\*یک\*\* پرسش[^\n]*$/m.exec(L) || [''])[0];
      info.f2b3 = { allData: /همهٔ داده‌ها|داده‌هایی که اثرِ محسوس/.test(one), dataLine: /^- داده‌هایی که هنوز/m.test(L), one: one.slice(0, 160) };
      chk(!info.f2b3.allData && !info.f2b3.dataLine, 'F2: «همهٔ داده‌ها را به کار بردی؟» is never asked before a plan exists, even when the user is stuck (s30, s33, s35) ' + JSON.stringify(info.f2b3)); }
    await ctx.close();
  }

  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 9000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
