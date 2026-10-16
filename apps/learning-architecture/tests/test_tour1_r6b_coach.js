// تورِ پولیا (دستهٔ ۱، دورِ ۶ ِ اصلاح، پیگیری‌های «coach» پس از ادغام، ۲۰۲۶-۱۰-۱۶) — از یادداشتِ fixer ِ «live»:
//  ۱) «همهٔ داده‌ها؟» ِ nextQFor فقط وقتی منبعِ liveCoach گیرِ عام است (stuck-*)، هرگز روی کارتِ خاص (card-*) یا کارِ همین نوبت (turn-*) — s26.
//  ۲) سطرِ C095 «کدام حلقه شکست؟» و بلوکِ 🌱 «بپرس…» وقتی بلوکِ زنده پرسشِ نوبت را می‌دهد زمینه‌اند، نه پرسشِ رقیب (یک پرسش در هر بلوک).
//  ۳) «kind» (find|prove|pod) در قالبِ chat_invent ِ قلاب.
//  ۴) «# پس از شکست» شکستِ پیامی کهنه‌تر از پیامِ پیشینِ همان روز را نمی‌خواند — پس از یک نوبت و میانِ روزها منقضی (s19 هفتهٔ ۸).
// همه از مسیرِ واقعی (فرم‌های «🔭»، پنجرهٔ دستیار با مدلِ بدلی). خطا ⇒ کدِ خروجِ غیرصفر. LLA_FILE = ساختِ دیگر (خطِ قرمزِ پیش از اصلاح).
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const W = (ms) => p.waitForTimeout(ms || 90);
  const T0 = '2026-11-02';
  const D = (n) => { const d = new Date(2026, 10, 2 + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const day = async (n) => { await p.evaluate(x => { window.__day = x; }, D(n)); };
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await W(140); };
  const sel = async (s, v) => { await p.selectOption(s, v); await W(120); };
  const click = async (s) => { await p.click(s); await W(160); };
  const txt = (s) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent : ''; }, s);
  const has = (s) => p.locator(s).count();
  const S = (pid) => p.evaluate(pid => { const pg = APP.S.get('eprog_' + pid); return JSON.parse(JSON.stringify(pg && pg.solve || {})); }, pid);
  const R = (pid) => p.evaluate(pid => JSON.parse(JSON.stringify(APP.S.get('eprob_' + pid))), pid);
  const toasts = () => p.evaluate(() => (document.getElementById('toasts') || { textContent: '' }).textContent);
  const hookText = (sess, msg) => p.evaluate(([sess, msg]) => APP.ASSIST.promptHooks.map(f => { try { return f(sess, msg) || ''; } catch (e) { return 'ERR ' + e.message; } }).join('\n'), [sess, msg]);
  // در ساختِ پیش از اصلاح (LLA_FILE) کنترلِ تازه نیست — بی‌آن، بندهای بعدیِ همان جریان هم باید خطِ قرمزِ خودشان را نشان دهند
  const fillIf = async (s, v) => { if (await has(s)) await p.fill(s, v); };
  const selIf = async (s, v) => { if (await has(s)) await sel(s, v); };
  const clickIf = async (s) => { if (await has(s)) await click(s); };
  const section = async (name, fn) => { if (process.env.ONLY && process.env.ONLY !== name) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
  const mk = async (o) => {
    await go('e_prob', null, 'live');
    if (o.title != null) await p.fill('#lpNewT', o.title);
    await p.fill('#lpNewS', o.st); await W(60);
    if (o.kind) await sel('#lpNewType', o.kind);
    if (o.nat) await sel('#lpNewNat', o.nat);
    await click('main .lp-create');
    return p.evaluate(() => APP.state.arg);
  };
  const whole = async (one, why) => { await p.fill('#lpOne', one); await p.fill('#lpWhy', why); await click('main .lp-onesave'); };
  const understand = async (o) => {
    await whole(o.one, o.why || 'برایم مهم است و کنجکاوم');
    if (o.nat) await sel('#lpNat', o.nat);
    await p.fill('#lpUnk', o.unk);
    for (let i = 0; i < o.data.length; i++) { if (i >= 2) await click('main .lp-dadd'); await p.fill('#lpD_d' + (i + 1), o.data[i]); }
    await p.fill('#lpCond', o.cond);
    if (await has('#lpSat')) await sel('#lpSat', o.sat || 'yes');
    await sel('#lpSuff', o.suff || 'ناکافی است — چیزی کم است'); await p.fill('#lpSuffW', o.suffW || 'هنوز همه را نمی‌دانم');
    if (await has('#lpSuffChal')) await p.fill('#lpSuffChal', 'همهٔ داده‌ها با هم آن را معین می‌کنند');
    if (o.dep) { await sel('#lpDep', 'yes'); await p.fill('#lpDepW', o.dep); } else if (o.depNo && await has('#lpDep')) await sel('#lpDep', 'no');
    if (o.prac) { for (let i = 0; i < o.data.length; i++) await sel('#lpDE_d' + (i + 1), 'big'); await p.fill('#lpPrVague', '«بس» یعنی همان چیزی که لازم است'); await p.fill('#lpPrLine', o.prLine || 'رنگ و برند را بیرون می‌گذارم چون اثری ندارند'); await p.fill('#lpPrApprox', o.prApprox || 'دقتِ ده درصد بس است'); await p.fill('#lpPrPrior', 'پارسال همین کار را کردم'); await p.fill('#lpPrMeasure', o.measure || 'حجمِ لازم ≤ ۲۰۰ لیتر'); await W(80); }
    await p.fill('#lpGuess', o.guess || 'درست است'); await sel('#lpConf', o.conf || '60'); await p.fill('#lpTest', o.test || 'با یک حالتِ خاص می‌آزمایم');
    await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
    await click('main .lp-usave');
    if (o.expectMiss) return txt('main .lp-umiss');
    await click('main .lp-u .sv-g2');
    return '';
  };
  const answerUnused = async () => { for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); } };
  const addMove = async (mv, why) => { await sel('#lpMv', mv); await p.fill('#lpMvWhy', why); await click('main .lp-mvadd'); };
  const savePlan = async (plan) => { await p.fill('#lpPlan', plan); await W(350); await answerUnused(); await click('main .lp-plansave'); };
  const objStep = async (text, proof) => { await p.fill('#lpStep', text); await sel('#lpClear', 'بله'); if (await has('#lpProof')) await p.fill('#lpProof', proof); await click('main .lp-stepsave'); };
  const objSetup = async (o) => {
    const P0 = await mk({ title: o.title, st: o.st, nat: 'objective', kind: o.kind });
    await understand(Object.assign({ depNo: true }, o.u));
    await addMove('mv_equation', 'هر کمیت را با نماد می‌نویسم تا شرط معادله شود');
    await savePlan(o.plan || 'نخست هر کمیت را با نماد می‌نویسم سپس در شرط جای‌گذاری می‌کنم');
    for (const st of o.steps || ['هر کمیت را با نماد نوشتم و در شرط جای‌گذاری کردم']) await objStep(st, 'از داده‌ها و جای‌گذاری');
    return P0;
  };
  // گفت‌وگوی واقعی: پنجرهٔ دستیار با مدلِ بدلیِ «میانگینِ لفظی»
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
    await p.evaluate(() => APP.ASSIST.toggle(false)); await W(80);
  };
  const newSess = () => p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => (__calls[__calls.length - 1] || {}).user || '');
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const oneOf = (u) => (/^- در این نوبت فقط \*\*یک\*\* پرسش[^\n]*$/m.exec(block(u, '# مسئلهٔ زندهٔ این سشن')) || [''])[0];
  const act = (o) => p.evaluate(o => __q.push(Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o)), o);
  try {
    await p.goto(FILE); await p.waitForSelector('.nav'); await W(300);
    await p.evaluate(T0 => { window.__day = T0; APP.today = () => window.__day; APP.S.loaded = true; window.__calls = []; window.__q = [];
      APP.HOST = Object.assign({}, APP.HOST || {}, { remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }) });
      APP.callAI = async (sys, user, opts) => { __calls.push({ user }); const r = __q.shift(); const t = JSON.stringify(r || { reply: 'باشه.', status: 'related', memory: 'm', actions: [] }); return opts && opts.withMeta ? { text: t, files: [] } : t; }; }, T0);
    await day(0);

    // ---------- ۱) «همهٔ داده‌ها؟» ِ مربی فقط روی منبعِ گیرِ عام، هرگز روی کارتِ خاص (s26: حکمِ کارتِ معادله‌ها) ----------
    await section('alldata', async () => {
      const PE = await objSetup({ title: 'موتورِ دونفره', st: 'سه نفریم و یک موتورِ دونفره؛ موتور ۴۰ و پیاده ۵ کیلومتر در ساعت؛ ایستگاه ۳۰ کیلومتر دورتر است. زودترین زمانِ رسیدنِ هر سه؟',
        u: { one: 'می‌خواهم زودترین زمانِ رسیدن را بیابم', unk: 'زمانِ رسیدنِ هر سه', data: ['سرعتِ موتور ۴۰ است', 'سرعتِ پیاده ۵ است'], cond: 'هر سه با هم برسند\nموتور دو نفر می‌برد' },
        steps: ['x + y = 30 و 40a = x و 5a = y را نوشتم'] });
      await fillIf('#lpEqUnk', '۴'); await clickIf('main .lp-eqsave');
      // a38 (پس از ادغامِ 6a99d08) در این چیدمان کارتِ معادله را هنوز بالای «این گام جواب نداد؟» نمی‌گذارد (مالِ «live»)؛ پس وضعِ s26 ِ گزارش‌شده
      // (کارتِ خاص + دادهٔ به‌کارنرفته + گیر) با پوششی روی A.liveCoach بازسازی می‌شود و بقیه مسیرِ واقعی است: پیامِ واقعی ⇒ قلاب ⇒ nextQFor ⇒ سطرِ «یک پرسش»
      await p.evaluate(() => { const o = APP.liveCoach; window.__lcO = o; APP.liveCoach = function (pid, opts) { const c = o.apply(this, arguments); if (!c || !opts || !opts.turn) return c;
        return Object.assign({}, c, { q: 'QQ-CARD: معادله کم است — کدام بخشِ شرط هنوز به معادله درنیامده؟', src: 'card-eqfew', card: 'QQ-CARD: معادله کم است — کدام بخشِ شرط هنوز به معادله درنیامده؟', unused: [{ t: 'قطار ۲ ساعتِ دیگر می‌رود' }] }); }; });
      const run = async (srcOver) => { await p.evaluate(sv => { window.__srcOver = sv; const o = window.__lcO; APP.liveCoach = function (pid, opts) { const c = o.apply(this, arguments); if (!c || !opts || !opts.turn) return c;
        return Object.assign({}, c, { q: 'QQ-' + sv, src: sv, card: '', unused: [{ t: 'قطار ۲ ساعتِ دیگر می‌رود' }] }); }; }, srcOver);
        await newSess(); await say('صفحه میگه معادله کمه. ۴ مجهول دارم ۳ معادله. گیر کردم، نمی‌دونم معادله‌ی چهارم از کجا بیاد.'); const o1 = oneOf(await lastUser()); return (/نپرس\): «([^»]*)»/.exec(o1) || [, o1])[1]; };
      info.alld = { card: (await run('card-eqfew')).slice(0, 160), turn: (await run('turn-guess')).slice(0, 160), back: (await run('stuck-back')).slice(0, 160) };
      await p.evaluate(() => { APP.liveCoach = window.__lcO; });
      chk(/QQ-card-eqfew/.test(info.alld.card) && /QQ-turn-guess/.test(info.alld.turn), '1: the coach\'s «همهٔ داده‌ها؟» override never replaces a specific page card (card-*, s26) or this turn\'s act (turn-*) ' + JSON.stringify(info.alld));
      chk(/همهٔ داده‌ها/.test(info.alld.back), '1: … and still applies over a generic stuck source (stuck-back) when data are unused ' + JSON.stringify(info.alld));
    });

    // ---------- ۲) سطرهای C095 و 🌱 «بپرس…» زمینه‌اند، نه پرسشِ رقیب، وقتی بلوکِ زنده پرسشِ نوبت را می‌دهد ----------
    await section('oneq', async () => {
      await newSess();
      await act({ reply: 'ثبتش کردم.', actions: [{ do: 'live_new', title: 'باگِ پرداخت', statement: 'هفته‌ای یه بار پرداخت دوبار ثبت میشه؛ علتش چیه؟', kind: 'find', nat: 'practical' }] });
      await say('هفته‌ای یه بار پرداخت دوبار ثبت میشه؛ علتش چیه؟');
      await say('ناامید شدم. شاخهٔ worker رو دو روز دنبال کردم ولی بن‌بست بود. می‌خوام کل این نظریه رو بندازم دور.');
      const u = await lastUser(), coach = block(u, '# مربیِ حل'), will = block(u, '# پس از شکست');
      const c095 = (coach.split('\n').filter(l => /C095/.test(l))[0] || '');
      info.oneq = { one: !!oneOf(u), will: !!will, c095: c095.slice(0, 200), willAsk: (will.match(/بپرس[^\n]{0,40}/g) || []) };
      chk(info.oneq.one && c095 && !/بپرس/.test(c095) && /زمینه/.test(c095), '2: with the live block giving the turn question, the C095 line is context, not a competing «بپرس» (s04, s06) ' + JSON.stringify(info.oneq));
      chk(info.oneq.will && !info.oneq.willAsk.length && /زمینه/.test(will), '2: the 🌱 «# پس از شکست» block issues no competing «بپرس…» when the live block gives the turn question ' + JSON.stringify(info.oneq));
    });

    // ---------- ۳) «kind» در قالبِ chat_invent ِ قلاب ----------
    await section('kind', async () => {
      await newSess();
      await say('یه معما: ثابت کن هر عددِ زوجِ بزرگ‌تر از ۲ جمعِ دو عددِ اوله؟ نمی‌دونم درسته یا نه.');
      const c = block(await lastUser(), '# مربیِ حل'), T = c.match(/\{\\?"do\\?":\\?"chat_invent\\?"[^}]*\}/g) || c.match(/\{"do":"chat_invent"[^}]*\}/g) || [];
      info.kind = { n: T.length, all: T.every(t => /"kind":"find\|prove\|pod"/.test(t)) };
      chk(info.kind.n >= 1 && info.kind.all, '3: every chat_invent template in the hook carries "kind":"find|prove|pod" ' + JSON.stringify(info.kind));
      await act({ reply: 'نگهش داشتم.', actions: [{ do: 'chat_invent', title: 'گلدباخ', statement: 'آیا هر عددِ زوجِ بزرگ‌تر از ۲ جمعِ دو عددِ اول است؟', kind: 'pod' }] });
      await say('آیا هر عددِ زوجِ بزرگ‌تر از ۲ جمعِ دو عددِ اول است؟ نگهش دار.');
      info.kind.rec = await p.evaluate(() => { const r = APP.liveAll().filter(x => /زوجِ بزرگ‌تر از ۲/.test(x.p.statement)).pop(); return r ? r.p.kind : ''; });
      chk(info.kind.rec === 'pod', '3: chat_invent with kind pod creates a pod problem ' + JSON.stringify(info.kind));
    });

    // ---------- ۴) «# پس از شکست» فقط نوبتِ شکست و نوبتِ بعد، در همان روز (s19 هفتهٔ ۸) ----------
    await section('will', async () => {
      const seed = (ago) => p.evaluate(ago => { const at = (d) => new Date(Date.now() - d * 86400000).toISOString();
        localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); const s = APP.ASSIST.cur(); s.msgs.push(...[{ role: 'user', at: at(ago + 1), text: '۱۶ هفته تا عروسی مونده، می‌خوام ۸ کیلو کم کنم.' }, { role: 'ai', at: at(ago + 1), text: 'کوچک‌ترین گامِ بعد؟' },
          { role: 'user', at: at(ago), text: 'مهمونی بود، یه کیلو هم اضافه کردم. باز شکست خوردم، ول می‌کنم. فایده نداره.' }, { role: 'ai', at: at(ago), text: 'کوچک‌ترین گامِ بعد؟' }]);
        APP.S.put(s); __calls.length = 0; return s.id; }, ago);
      const willIn = async () => /^# پس از شکست، نقد یا میلِ رها کردن/m.test(await lastUser());
      await seed(42); await say('هفته‌ی هشتم! ۴ کیلو کم کردم. پیاده‌روی رو نگه داشتم، دیگه برنامه عوض نکردم.');
      info.will = { weeksLater: await willIn() };
      await seed(0); await say('خب بعدش چی؟');
      info.will.sameDay = await willIn();
      chk(!info.will.weeksLater && info.will.sameDay, '4: a failure in the previous message carries the «# پس از شکست» block one turn on the same day, never weeks later (s19) ' + JSON.stringify(info.will));
    });
  } catch (e) { errors.push('exception: ' + (e && e.stack || e)); }
  console.log(JSON.stringify(info).slice(0, 6000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
