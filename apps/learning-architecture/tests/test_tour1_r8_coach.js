// تورِ پولیا (دستهٔ ۱، دورِ ۸ ِ اصلاح، ۲۰۲۶-۱۰-۱۶) — سهمِ «coach» از DECISIONS_R8 (I-coach 1–7).
// اصل: یک پرسش در هر نوبت، خاص‌ترین پرسشِ معتبر؛ هر سطرِ پولیای دیگری در همان بلوک «زمینه (نه پرسشِ دوم)» است و این را می‌گوید.
//  list    سرواژه و فهرست از یک مرحله حتی وقتی فهرستِ پیش‌فرض از بیرون آمده: حدسِ تازه پس از مسئلهٔ بسته ⇒ «فهم» (u1…) بی سطرهای بازنگری (s25 p8)؛
//          نوبتِ رد وقتی مرحله «فهم» است ⇒ «طرح» (p1…) و همان یک پرسشِ «از ردش چه آموخت»، پیشنهادِ فهرست برای نوبتِ بعد (s12 p5)
//  ref     یک سطرِ «از ردش چه آموخت» در کلِ پرامپت، زمینه وقتی بلوکِ زنده پرسشِ دیگری دارد؛ C107 فقط برای حدسِ ردشدهٔ کلی (s22)
//  a044    A044 زمینه است وقتی بلوک پرسشِ نوبت دارد (s23، s29)؛ «؟۴۸۷؟»، «۷؟» ِ جای رقم و «؟!» پرسش نیستند (s37)
//  a191    A191 روی معرفیِ مسئله‌ای که بی پرسش یک‌راست به جزئیات/تلاش می‌پرد (s21)؛ نه روی گلایهٔ معلم از یاد دادن (s15)
//  why     یادداشتِ حدس نشانهٔ واقعی را نام می‌برد («حدسم…»، نه «…درسته؟») (s07)
//  a129    شبِ سومِ تأملیِ پدر: پیشنهادِ بازنگریِ «نتیجه را وارسی کن» نه (s16)
//  mid     «میانهٔ راه» ِ مربی نمی‌آید وقتی پرسشِ نوبتِ بلوکِ زنده کارت/ردِ صفحه است (s19، s34)
// همه از رابطِ واقعی (پنجرهٔ دستیار با مدلِ بدلیِ «میانگینِ لفظی»، کنش‌های مدل، فرم‌های «🔭»). خطا ⇒ کدِ خروجِ غیرصفر.
// LLA_FILE = ساختِ دیگر (خطِ قرمزِ پیش از اصلاح)؛ ONLY=list,ref (نامِ بخش‌ها، با ویرگول) برای اجرای بخشی.
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
  const T0 = '2026-11-02';
  const D = (n) => { const d = new Date(2026, 10, 2 + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const day = async (n) => { await p.evaluate(x => { window.__day = x; }, D(n)); };
  await p.goto(FILE); await p.waitForSelector('.nav'); await W(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0;
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
  const newSess = () => p.evaluate(() => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => (__calls[__calls.length - 1] || {}).user || '');
  const lastTurn = () => p.evaluate(() => __lc[__lc.length - 1] || null);
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const coachOf = (u) => block(u, '# مربیِ حل');
  const liveOf = (u) => block(u, '# مسئلهٔ زندهٔ این سشن');
  const oneOf = (u) => (/^- در این نوبت فقط \*\*یک\*\* پرسش[^\n]*$/m.exec(liveOf(u)) || [''])[0];
  const phOf = (c) => (/مرحلهٔ محتمل: ([^·—(]+?)\s*(?:·|—|\()/.exec(c) || [])[1] || '';
  const sugOf = (c) => (/پیشنهادِ این نوبت: «([^»]+)»/.exec(c) || [])[1] || '';
  const next = (reply, st) => p.evaluate(([reply, st]) => __q.push(R({ reply, actions: st ? [Object.assign({ do: 'coach_state' }, st)] : [] })), [reply, st || null]);
  const act = (o) => p.evaluate(o => __q.push(R(o)), o);
  const ST = (o) => Object.assign({ ph: 'u', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' }, o);
  const has = (c, ids) => ids.every(id => c.indexOf(id) >= 0);
  const GUESS_LINE = /همین پیام حدس است/;
  const WHY_LINE = /«چرا …؟» پرسید/;
  const first = async (msg) => { await newSess(); await say(msg); return coachOf(await lastUser()); };
  const pair = async (open, msg, pre) => { await newSess(); if (pre) await next('بگو.', pre); await say(open); await say(msg); return coachOf(await lastUser()); };
  // مسئلهٔ زندهٔ ساخته در صفحه (فهم ثبت ⇒ مرحلهٔ طرح)، و سشنی که روی صفحه‌اش با دستیار حرف می‌زند
  const mk = async (o) => { await go('e_prob', null, 'live'); await p.fill('#lpNewT', o.title); await p.fill('#lpNewS', o.st); await W(60); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return p.evaluate(() => APP.state.arg); };
  const understand = async (o) => {
    await p.fill('#lpOne', o.one); await p.fill('#lpWhy', 'برایم مهم است و کنجکاوم'); await click('main .lp-onesave');
    if (o.nat && await hasEl('#lpNat')) await sel('#lpNat', o.nat);
    await p.fill('#lpUnk', o.unk);
    for (let i = 0; i < o.data.length; i++) { if (i >= 2) await click('main .lp-dadd'); await p.fill('#lpD_d' + (i + 1), o.data[i]); }
    await p.fill('#lpCond', o.cond);
    if (await hasEl('#lpSat')) await sel('#lpSat', 'yes');
    await sel('#lpSuff', 'ناکافی است — چیزی کم است'); await fillIf('#lpSuffW', 'هنوز همه را نمی‌دانم');
    await fillIf('#lpSuffChal', 'همهٔ داده‌ها با هم آن را معین می‌کنند');
    if (await hasEl('#lpDep')) await sel('#lpDep', 'no');
    await p.fill('#lpGuess', o.guess || 'راهی هست'); await sel('#lpConf', '60'); await p.fill('#lpTest', 'با یک حالتِ خاص می‌آزمایم');
    await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
    await click('main .lp-usave'); if (await hasEl('main .lp-u .sv-g2')) await click('main .lp-u .sv-g2');
  };
  const savePlan = async (plan) => { await p.selectOption('#lpMv', 'mv_special').catch(() => {}); await fillIf('#lpMvWhy', 'اول فقط یک حالت را دقیق می‌بینم تا دامنه تنگ شود'); if (await hasEl('main .lp-mvadd')) await click('main .lp-mvadd');
    await p.fill('#lpPlan', plan); await W(350);
    for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); }
    await click('main .lp-plansave'); };
  const realStep = async (text, pred) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); await p.fill('#lpPred', pred); await sel('#lpConf', '60'); await p.fill('#lpWhen', 'فردا'); await click('main .lp-stepsave'); };
  const outcome = async (o) => { await sel('#lpODone', o.done || 'yes'); await p.fill('#lpOWhat', o.what); if (await hasEl('#lpOMatch')) await sel('#lpOMatch', o.match || 'yes'); await sel('#lpOProg', o.prog || 'کمی'); await sel('#lpOWant', 'same'); if (await hasEl('#lpOGuess')) { await sel('#lpOGuess', o.grel || 'none'); if (o.grel === 'refute') { await p.fill('#lpOReflect', 'حدسم را کنار می‌گذارم چون شمارش چیزِ دیگری نشان داد'); if (await hasEl('#lpONewG')) await sel('#lpONewG', 'no'); } } await click('main .lp-outsave'); };
  const pageSess = async (pid) => { await go('lprob', pid); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; }); };

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  const ctxLine = (c, re) => (c.split('\n').filter(l => re.test(l))[0] || '');
  const isCtx = (l) => /^- زمینه \(نه پرسشِ دوم\)/.test(l);

  // ================= list — فهرست پیروِ سرواژه =================
  await section('list', async () => {
    const r = info.list = {};
    // s25 p8: مسئلهٔ بستهٔ همین سشن (chat_solved) ⇒ حدسِ تازه = مسئلهٔ تازه از «فهم» — فهرستِ u، نه b1…؛ نه A284/قارچ/«یک پرسشِ بازنگری بپرس»/«از نخستین پرسشِ «بازنگری»»
    await go('e_home'); await newSess();
    await act({ reply: 'ثبت شد.', actions: [{ do: 'chat_solved', title: 'جمعِ تلسکوپیِ دوتایی', statement: 'ثابت کن جمعِ ۱/(1·2) + ۱/(2·3) + … تا n جمله برابرِ n/(n+1) است', kind: 'prove', lesson: 'هر جمله را به تفاضلِ دو کسر شکستم', check: 'برای n = ۳ حساب کردم' }] });
    await say('ثابتش کردم: هر جمله را به تفاضلِ دو کسر شکستم؛ برای n = ۳ حساب کردم');
    await say('تموم شد! با استقرا هم ثابتش کردم، از راه تلسکوپی هم رسیدم. بازنگری رو هم ثبت کردم.');   // s25 p7: مربی پس از بستن در «بازنگری»
    r.p7 = phOf(coachOf(await lastUser()));
    await say('جلسه سوم: خودم الگوی ۱/(1·2·3) + ۱/(2·3·4) + … رو ساختم. حدسم اینه که میشه ۱/۴ − ۱/(2(n+1)(n+2)). سه تاشو چک کردم.');
    const c8 = coachOf(await lastUser());
    r.s25 = { ph: phOf(c8), u1: /(?:^|\s)u1\) /.test(c8), b1: /(?:^|\s)b1\) /.test(c8), lb: /از نخستین پرسشِ «بازنگری»|یک پرسشِ بازنگری بپرس|قارچ‌ها خوشه‌ای|A284/.test(c8) };
    r.s25.p7 = r.p7;
    chk(r.s25.ph === 'فهمِ مسئله' && r.p7 === 'بازنگری' && r.s25.u1 && !r.s25.b1 && !r.s25.lb, 'list: a new guess after a closed problem — the «فهم» header AND the «فهم» list (u1…), no look-back list/lines (b1…, «از نخستین پرسشِ بازنگری», A284, mushrooms) (s25 p8) ' + JSON.stringify(r.s25));
    // s12 p5: نوبتِ رد وقتی مربی در «فهم» است ⇒ «طرح» (p1…)، نه u1 «مجهول چیست؟» دوباره؛ یک پرسش: «از ردش چه آموخت»
    await newSess();
    await say('جدول امروز: «از جلو و عقب یکی است، در دریا راه می‌رود» — ۵ حرفی. و یه افقی دیگه: حروف «ر ا ت س م ن ه ب» رو مرتب کن، یه کلمه ۸ حرفی. نیم ساعته موندم. شما که ماشینی، بگو.');
    await say('با املا: ناوبان برعکسش نابوان میشه، نه. پس باید اول پالیندروم‌های پنج حرفی رو بشمارم بعد ببینم کدوم دریاییه. «ناخدا» نه... «تخت»؟ نه... آهان! پیداش کردم، با «ا» هم درمیاد. حالا آناگرام. فکر کنم آخرش «ستان» باشه.');
    await say('ر م ه ب ... رمهب‌ستان؟ نه. اشتباه بود. پس «ستان» نیست. اعصابم خورد شد، نیم ساعت دیگه هم رفت.');
    const c5 = coachOf(await lastUser());
    r.s12 = { ph: phOf(c5), p1: /(?:^|\s)p1\) /.test(c5), u1: /(?:^|\s)u1\) /.test(c5), sug: sugOf(c5).slice(0, 30), one: /پرسشِ این نوبت همین است/.test(ctxLine(c5, /B231/)), asks: (c5.match(/از ردش چه آموخت/g) || []).length };
    chk(r.s12.ph === 'طرح‌ریزی' && r.s12.p1 && !r.s12.u1 && !/مجهول/.test(r.s12.sug), 'list: a refutation turn while the coach phase is «فهم» ⇒ «طرح» header and list (p1…), not u1 «مجهول چیست؟» again (s12 p5) ' + JSON.stringify(r.s12));
    chk(r.s12.one && !r.s12.sug && r.s12.asks === 1, 'list: … and ONE question — B231 «از ردش چه آموخت» is this turn\'s question, the list suggestion is for the next turn (s12 p5) ' + JSON.stringify(r.s12));
  });

  // ================= ref — یک سطرِ «از ردش چه آموخت»؛ C107 فقط برای ادعای کلی =================
  info.ref = {};
  const refCase = async (title, st, guess, what) => {
    await day(0); info.ref.stage = 'mk ' + title;
    const P = await mk({ title, st, nat: 'practical' }); info.ref.stage = 'u';
    await understand({ one: 'دنبالِ علتِ ' + title + ' هستم', unk: 'علتِ ' + title, data: ['عصر صندوق ۳ میلیون کمتر بود', 'سرایدار دیر رفت'], cond: 'علت را با شاهد بیابم', guess, nat: 'practical' });
    // قابِ عملی: اثرِ محسوسِ هر داده، مفهومِ مبهم، کجا خط می‌کشی، تقریب، دانشِ پیشین، ریاضی‌کردن — سپس ثبتِ فهم
    await sel('#lpDE_d1', 'big'); await sel('#lpDE_d2', 'big');
    await p.fill('#lpPrVague', '«کم بود» یعنی دفتر بیش از پولِ صندوق نشان داد'); await p.fill('#lpPrLine', 'فقط همان عصر را می‌سنجم، روزهای دیگر را بیرون می‌گذارم');
    await p.fill('#lpPrApprox', 'دقتِ صد هزار تومان بس است'); await p.fill('#lpPrPrior', 'پارسال هم یک خریدِ ثبت‌نشده بود'); await p.fill('#lpPrMeasure', 'کمبود = دفتر − پولِ صندوق ≥ ۳ میلیون تومان');
    if (await hasEl('#lpGWant')) await sel('#lpGWant', 'فرقی نمی‌کند');
    await click('main .lp-usave'); if (await hasEl('main .lp-u .sv-g2')) await click('main .lp-u .sv-g2');
    info.ref.ph = await p.evaluate(pid => APP.livePhase(pid), P);
    info.ref.stage = 'plan'; await fillIf('#lpPlan2', 'اگر دفتر و رسیدها جور بود، از خزانه‌دار می‌پرسم');
    await savePlan('نخست دفترِ صندوق را با رسیدها می‌سنجم سپس از سرایدار می‌پرسم');
    info.ref.ph2 = await p.evaluate(pid => APP.livePhase(pid), P);
    info.ref.stage = 'step'; await realStep('فردا دفترِ صندوق را با رسیدها بسنجم', 'رسیدها کمتر از دفتر است');
    await day(1); await go('lprob', P, 'exec');
    info.ref.stage = 'out'; await outcome({ what, match: 'no', grel: 'refute' }); info.ref.stage = 'chat';
    const n = await p.evaluate(pid => APP.livePlausible(pid).refuted, P);
    await pageSess(P);
    await say('رفتم دفتر رو با رسیدها سنجیدم. ' + what + '. پس حدسم غلط بود.');
    const u = await lastUser();
    return { n, u, c: coachOf(u), l: liveOf(u) };
  };
  await section('ref', async () => {
    const r = info.ref = info.ref || {};
    const one = await refCase('کمبودِ صندوقِ کلاس', 'صندوقِ کلاس عصر ۳ میلیون کم بود؛ می‌خواهم بفهمم چه شد.', 'کارِ سرایدار است', 'رسیدها با دفتر جور بود؛ یک خریدِ ثبت‌نشده بود');
    const L = one.u.split('\n').filter(l => /از ردش چه آموخت/.test(l)), tq = !!oneOf(one.u);
    r.one = { L: L.map(x => x.slice(0, 90)), one: oneOf(one.u).slice(0, 200), n: one.n, lines: L.length, ctx: L.every(isCtx), tq, c107: has(one.c, ['C107']), b231ctx: isCtx(ctxLine(one.c, /B231/)) };
    chk(r.one.n > 0 && r.one.lines === 1, 'ref: on the refutation turn the whole prompt carries ONE «از ردش چه آموخت» line (not the coach\'s refuted line AND B231) (s22) ' + JSON.stringify(r.one));
    chk(tq && r.one.ctx && r.one.b231ctx, 'ref: … and beside the live block\'s own turn question it is marked «زمینه (نه پرسشِ دوم)», B231 too (s22) ' + JSON.stringify(r.one));
    chk(!r.one.c107, 'ref: C107 «دامنه‌اش را تنگ کن» not for a refuted one-off PRACTICAL hypothesis «کارِ سرایدار است» (s22) ' + JSON.stringify(r.one));
    const gen = await refCase('کمبودِ صندوقِ عصر', 'صندوقِ مغازه عصرها کم می‌آید؛ می‌خواهم بفهمم چرا.', 'همیشه عصرها صندوق کم می‌آید چون صندوق‌دارِ عصر دقت ندارد', 'یک عصر صندوق‌دارِ عصر بود و صندوق درست بود');
    r.gen = { n: gen.n, c107: has(gen.c, ['C107']) };
    chk(r.gen.n > 0 && r.gen.c107, 'ref: control — a refuted GENERAL claim («همیشه …») still gets C107 «narrow its domain» ' + JSON.stringify(r.gen));
  });

  // ================= a044 — زمینه؛ «؟» ِ جای رقم و «؟!» =================
  await section('a044', async () => {
    const r = info.a044 = {};
    const c37a = await first('تو دفتر حساب کاروانسرا نوشته «۳۶ رأس گوسفند: ؟۴۸۷؟ ریال» — رقم اول و آخر محو شده. می‌خوام بدونم قیمت هر گوسفند چقدر بوده. با این‌همه حالت ممکن، چطور پیدا کنم؟ فکر کنم باید ۱۰۰ حالت رو یکی‌یکی امتحان کنم.');
    const c37b = await pair('تو دفتر حساب کاروانسرا نوشته «۳۶ رأس گوسفند: ؟۴۸۷؟ ریال» — رقم اول و آخر محو شده. می‌خوام بدونم قیمت هر گوسفند چقدر بوده.',
      '۳۶ = ۴ × ۹. اول فقط بر ۴: دو رقم آخر ۷؟ باید بر ۴ بخش‌پذیر باشه، پس ۷۲ یا ۷۶؛ رقم آخر ۲ یا ۶. بعد بر ۹: جمع رقم‌ها. با ۲: رقم اول ۶ → ۶۴۸۷۲. با ۶: رقم اول ۲ → ۲۴۸۷۶. دو جواب؟! پس قیمت یا ۱۸۰۲ یا ۶۹۱ ریاله. کدوم؟');
    r.s37 = { p1: has(c37a, ['A044']), p3: has(c37b, ['A044']) };
    chk(!r.s37.p1 && !r.s37.p3, 'a044: «؟۴۸۷؟» / «دو رقم آخر ۷؟» (digit placeholders) and «دو جواب؟!» (exclamation) are not questions — no A044 (s37 p1, p3) ' + JSON.stringify(r.s37));
    const c23 = await first('کیک رو پختم و خوب شد! ولی زمان پختو نمی‌دونستم، دستور مادرم ۳۵ دقیقه بود. زمان پخت هم ۲.۸ برابر میشه؟ یعنی ۱۰۰ دقیقه؟ ۸ تا تخم‌مرغ زدم یا ۹ بهتر بود؟');
    const c29 = await first('۴۰ متر لبه‌ی سنگی دارم برای یه باغچه‌ی چهارضلعی. بزرگ‌ترین باغچه چه شکلیه؟ به نظرم مستطیل باریک و بلند چون جای گل بیشتر داره. بعد هم می‌خوام یه حوض گرد بذارم که به سه تا مسیر باغ مماس باشه، جای مرکزشو چطوری پیدا کنم؟ اول باغچه رو ثبت کن.');
    r.ctx = { s23: isCtx(ctxLine(c23, /A044/)), s29: isCtx(ctxLine(c29, /A044/)), sug23: !!sugOf(c23), sug29: !!sugOf(c29) };
    chk(r.ctx.s23 && r.ctx.s29 && r.ctx.sug23 && r.ctx.sug29, 'a044: A044 still fires on two unknowns but is «زمینه (نه پرسشِ دوم)» beside the block\'s turn question (s23, s29) ' + JSON.stringify(r.ctx));
  });

  // ================= a191 =================
  await section('a191', async () => {
    const r = info.a191 = {};
    r.s21 = has(await first('سلام. من بردیا هستم ۱۲ سالمه، تیم شطرنج مدرسه. مسئله: سفید بازی می‌کند و در دو حرکت مات می‌کند. FEN: 5k2/8/5K2/8/8/8/8/R2Q4 w - - 0 1 . من کیش با وزیر رو زدم ولی شاه فرار می‌کنه. یه رخ سفید گوشه‌ی صفحه هست که اصلاً نمی‌دونم چرا اونجاست.'), ['A191']);
    r.s15 = has(await first('شاگردام سر مسئله‌ها ساکت می‌مونن. من هم آخرش خودم حل می‌کنم روی تخته. یه همکار گفت «سؤال بپرس» ولی سؤال‌های من یا جوابو لو میده یا کسی جواب نمیده. چیکار کنم؟'), ['A191']);
    r.s07 = has(await first('۵ تا گلدون لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور گذاشتم. قدشون بعد از ۳ هفته: ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. استادم گفت «یه قانون پیدا کن». قانونش چیه؟ فکر کنم خطیه، هر ۲ ساعت ۴ سانت.'), ['A191']);
    chk(r.s21, 'a191: «اول کل را ببین» on a problem-introducing message that jumps straight into details/his attempt with no question of his own (s21 p1) ' + JSON.stringify(r));
    chk(!r.s15, 'a191: not on a teacher\'s complaint about teaching (not a problem statement) (s15) ' + JSON.stringify(r));
    chk(!r.s07, 'a191: control — not when he asked the unknown himself and then guessed (s07, round 6) ' + JSON.stringify(r));
  });

  // ================= why — یادداشتِ حدس =================
  await section('why', async () => {
    const r = info.why = {};
    const NOTE = /همین پیام حدس است، نه نتیجه\*\* \(((?:«[^»]*»|[^)«])*)\)/;
    const c = await pair('۵ تا گلدون لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور گذاشتم. قدشون بعد از ۳ هفته: ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. استادم گفت «یه قانون پیدا کن». قانونش چیه؟ فکر کنم خطیه، هر ۲ ساعت ۴ سانت.',
      'تفاضل‌ها ۵، ۴، ۳، ۱ شدن، پس خطی نیست، کند میشه. حدسم اشباعه. یه مقاله هم پیدا کردم دربارهٔ اشباع فتوسنتز. پس ثابت شد دیگه، قانونش اشباعه!');
    r.s07 = (NOTE.exec(c) || [])[1] || '';
    chk(/حدسم/.test(r.s07) && !/درسته/.test(r.s07), 'why: the guess note names the actual trigger «حدسم …», not «…درسته؟ پس از مقدار» (s07 p2) ' + JSON.stringify(r));
    const c2 = await pair('یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول داره. جا میشه؟', 'خب ۳.۲ از ۴ کمتره دیگه، پس جا نمیشه. درسته؟');
    r.ctl = (NOTE.exec(c2) || [])[1] || '';
    chk(/درسته/.test(r.ctl), 'why: control — «… پس جا نمیشه. درسته؟» is named by «…درسته؟» ' + JSON.stringify(r));
  });

  // ================= a129 — شبِ سومِ پدر =================
  await section('a129', async () => {
    const r = info.a129 = {};
    await newSess();
    await say('دخترم یه مسئله داره: «باغچه‌ای مستطیلی دورش ۲۴ متر حصار داره، طولش دو برابر عرضشه، طول و عرض چقدره؟» خودم بلدم، فقط بگو چطوری بهش بگم که زود تموم شه بریم بخوابیم.');
    await say('پرسیدم. گفت «۲۴». یعنی اصلاً نفهمیده. چی بگم؟');
    await say('باورت نمی‌شه! با نخ یه مستطیل ساخت، گفت «۲۴ دور تا دوره، دو تا عرض و دو تا طول». بعد خودش با خط‌کش امتحان کرد و رسید به عرض ۴ و طول ۸. عالی! بریم سراغ مسئله‌ی بعدی؟');
    await say('سلام، دو شب گذشته. جالبه: یه روشی رو که هفته‌ی پیش خودم بهش «گفته بودم» (برای مسئله‌ی سن) کاملاً یادش رفته، ولی روش نخ رو یادشه و امروز خودش برای یه مسئله‌ی دیگه نخ آورد. چرا این‌طوریه؟');
    const c4 = coachOf(await lastUser());
    await say('خب... روش سن رو من گفتم، اون فقط قبول کرد چون من باباشم. نخ رو خودش ساخت. یعنی چیزی که خودش بسازه می‌مونه؟');
    const c5 = coachOf(await lastUser());
    const f = (c) => ({ ph: phOf(c), a129: has(c, ['A129']), sug: sugOf(c).slice(0, 30), lb: /یک پرسشِ بازنگری بپرس/.test(c) });
    r.p4 = f(c4); r.p5 = f(c5);
    chk(r.p4.a129 && r.p5.a129 && !r.p4.sug && !r.p5.sug && !r.p4.lb && !r.p5.lb, 'a129: the parent\'s reflective night-3 turns (A129) get no look-back suggestion «نتیجه را وارسی کن» / «یک پرسشِ بازنگری بپرس» — A129 is the move of the turn (s16) ' + JSON.stringify(r));
  });

  // ================= mid — «میانهٔ راه» ِ مربی کنارِ کارتِ صفحه نه =================
  await section('mid', async () => {
    const r = info.mid = {};
    await day(0);
    const P = await mk({ title: 'باغچهٔ بالکن', st: 'می‌خواهم در بالکنِ ۶ متری سبزی بکارم که هر هفته برداشت کنم؛ چه بکارم و کجا؟', nat: 'life' });
    await understand({ one: 'دنبالِ چیدمانِ بالکن برای برداشتِ هفتگی هستم', unk: 'چیدمانِ کاشت', data: ['بالکن ۶ متر است', 'صبح‌ها آفتاب دارد'], cond: 'هر هفته برداشت کنم', guess: 'ریحان و نعناع جلوی نور', nat: 'life' });
    await savePlan('نخست نورِ هر گوشه را می‌سنجم سپس دو گلدان می‌کارم');
    await realStep('فردا نورِ هر گوشه را ساعت‌به‌ساعت بسنجم', 'گوشهٔ شرقی بیشترین نور را دارد');
    await day(1); await go('lprob', P, 'exec');
    await outcome({ what: 'گوشهٔ شرقی تا ظهر آفتاب داشت', match: 'yes' });
    await day(9); await pageSess(P);
    await say('سلام، یه هفته گذشت. دو تا گلدون کاشتم و دارم ادامه می‌دم.');
    const u = await lastUser(), one = oneOf(u), c = coachOf(u);
    const midOf = () => p.evaluate(pid => { const m = ((APP.ASSIST.cur().coach || {}).mid || {})[pid]; return m == null ? null : typeof m === 'object' ? m.r : m; }, P);
    r.d9 = { one: one.slice(0, 160), cardNow: /میانهٔ راه: چه آموختی/.test(one), coachMid: /^- میانهٔ راه/m.test(c), used: await midOf() };
    chk(r.d9.cardNow, 'mid: setup — on day 9 the live block\'s ONE turn question is the page\'s mid-course card (card-checkin) ' + JSON.stringify(r));
    chk(!r.d9.coachMid && r.d9.used == null, 'mid: the coach\'s own «میانهٔ راه … به‌جای پرسشِ مرحله» line is neither emitted nor used up when the live block\'s turn question is a page card (one question) (s19, s34) ' + JSON.stringify(r));
    // نوبتِ بعد: کارتِ صفحه فقط یک نوبت پرسشِ نوبت بود (H2 دورِ ۷)؛ «میانهٔ راه» ِ مربی همان پرسش را نوبتِ بعد دوباره نمی‌آورد (هرگز دو بار پیاپی)
    await say('امروز هم آب دادم و نورش رو نگاه کردم. ادامه می‌دم.');
    const u2 = await lastUser();
    r.next = { one: oneOf(u2).slice(0, 120), coachMid: /^- میانهٔ راه/m.test(coachOf(u2)) };
    chk(!/میانهٔ راه/.test(r.next.one) && !r.next.coachMid, 'mid: the next turn asks neither the page card again (one turn) nor the coach\'s mid-course line — the same mid-course question is never asked two turns in a row ' + JSON.stringify(r.next));
  });
  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 9000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
