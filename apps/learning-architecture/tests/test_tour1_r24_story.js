// تورِ پولیا (دستهٔ ۱، دورِ ۲۴، سهمِ «story» — ۲۰۲۶-۱۰-۲۵) — DECISIONS_R24: R2 «یک داستان، مرحله و پرسشِ نوبت» + R8 «کارِ پیشینِ من» (نقشهٔ راهِ منبع‌ها §۲۱).
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۴ — aB3 p11/p12 (B24·D2 «به مجهول نگاه کن…»، مرحلهٔ «فهم»)، B24·D22 (پیامِ اصلاح به‌عنوانِ داده)، oD1 c11 (D24-3 نتیجهٔ زیرمسئله ⇒ «بازنگری»)،
//           tB1 p7/p11 (B24·D3 بُرشِ طرح در ویرگول، «کارکرد در یک جمله»)، aD4 p2 (D24-9 گامِ طرح از کارت/تولد، D24-15 «مجهول چیست؟»)، aA3 p3 (A24-7 امتحانِ ردشده)،
//           oC1 p2 (C24-11 پرسشِ متا در مجهول)، dp1 p2 (D24-12)، s18 p11 (B24·D4/C24-9 پرسشِ وارسیِ دوباره)، aB4 (B24·D2 chat_solved)
//  bank     همهٔ ورودی‌های R2 و R8 در بانکِ مستقلِ tests/variants/VARIANTS_R24.json (رفتارِ محضِ مدل یا سهمِ سازوکارِ دیگر با دلیل در info.nc)
//  clock    روزِ صفحه منجمد است (APP.today)؛ هیچ انتظاری به تاریخِ تقویم بسته نیست
// LLA_FILE = ساختِ دیگر (برای «قرمزِ نخست»: ساختِ main)؛ ONLY=aB3,oD1,tB1,aD4,aA3,unk,recheck,aB4,prior,bank2,bank8
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = JSON.parse(fs.readFileSync(process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R24.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R24.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)), 'utf8'));

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
  const T0 = '2026-10-25';   // روزِ منجمدِ صفحه (هیچ انتظاری به آن بسته نیست)
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0; window.__noNav = true;
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    window.__turn = async (text, reply, actions) => {
      const n0 = __calls.length; __q.push(typeof actions === 'function' ? (u) => R({ reply: reply || 'باشه.', actions: actions(u) }) : R({ reply: reply || 'باشه.', actions: actions || [] }));
      await APP.ASSIST.send(text); __q.length = 0;
      const all = __calls.slice(n0), c = all.filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {};
      return { user: c.user || '', task: c.task || '', n: all.length, all: all.map(x => x.user) };
    };
    window.__fresh = (view) => { APP.go(view || 'home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
    window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {};
      ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L); APP.S.put(pg); };
    window.__L = (pid) => { const pg = APP.S.get('eprog_' + pid); return pg && pg.solve && pg.solve.live ? JSON.parse(JSON.stringify(pg.solve.live)) : null; };
    window.__M = (id) => { const M = APP.ROUTE.model(id); if (!M) return null; return { origin: M.origin, dest: M.dest, now: M.nowFa, remain: M.remain, reached: M.reached, pts: M.pts.map(q => ({ k: q.k, cls: q.cls, t: q.title, lines: q.lines, out: q.out, det: q.det })), dets: M.dets.map(d => ({ kind: d.kind, depth: d.depth, concept: d.concept, rejoin: d.rejoin, parent: d.parent, from: d.from, guess: d.guess })), backs: M.backs }; };
  }, T0);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const turn = (text, reply, actions) => p.evaluate(([t, r, a]) => __turn(t, r, a), [text, reply || '', actions || []]);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const Lv = (pid) => p.evaluate((pid) => __L(pid), pid);
  const Mo = (id) => p.evaluate((id) => __M(id), id);
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const bind = async (title, stmt) => p.evaluate(([t, stmt]) => { const pid = __live(t, stmt); APP.liveBindSession(pid, __cur()); __liveSet(pid, () => {}); return pid; }, [title, stmt]);
  const lcq = (pid, t) => p.evaluate(([pid, t]) => { const c = APP.liveCoach(pid, { turn: { text: t || 'باشه' } }); return { q: c.q || '', src: c.src || '' }; }, [pid, t]);
  const WQ = await p.evaluate(() => APP.liveWholeQ);
  const strip = () => p.evaluate(() => { APP.go('home'); const g = document.querySelector('#main .rt-geo'); return g ? g.textContent : ''; });
  const chips = (pid) => p.evaluate((pid) => { APP.go('lprob', pid); return [...document.querySelectorAll('#main .lp-fromchat')].map(x => (x.getAttribute('data-p23') || '') + '|' + x.textContent); }, pid);
  const E = {}; BANK.forEach((e, i) => { E[i] = e; });
  const own = (i) => /^R2\.|^R8\./.test(E[i].rc);
  const T = (i, ok, x) => { info.bank[i] = !!ok; chk(ok, 'bank#' + i + ' [' + E[i].rc + '/' + E[i].kind + '] «' + E[i].text.slice(0, 70) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + String(JSON.stringify(x)).slice(0, 700)); };
  const NC = (i, why) => { info.nc[i] = why; };
  const blockLine = (u) => (head(u).split('\n').filter(l => /^# مسئلهٔ زندهٔ این سشن/.test(l))[0] || '');
  const coachHead = (u) => (head(u).split('\n').filter(l => /^# مربیِ حل/.test(l))[0] || '');
  const sugOf = (u) => ((head(u).match(/پیشنهادِ این نوبت: «([^»]*(?:«[^»]*»[^»]*)*)»/) || [])[1] || '');
  const story = () => p.evaluate(() => { const s = __cur(); return JSON.parse(JSON.stringify((s.coach || {}).story || {})); });
  const items = async (key) => { const st = await story(); const k = key || Object.keys(st).pop(); return (st[k] || { items: [] }).items; };
  const sph = (pid) => p.evaluate((pid) => ({ form: APP.livePhase(pid), story: APP.liveStoryPhase(pid), turn: APP.liveTurnPhase ? APP.liveTurnPhase(pid) : APP.livePhase(pid) }), pid);
  const nat = { role: 'self', nat: 'practical', stuck: false, fail: false };
  const csn = (o) => cs(Object.assign({}, nat, o));
  const U1 = /به مجهول نگاه کن|مجهول(?: \(یا حکمی که باید ثابت شود\))? چیست|حکم چیست/;
  const liveOf = (sid) => p.evaluate((sid) => { const r = APP.S.all('eprob').filter(x => x.sess === sid).pop(); return r ? r.p.id : ''; }, sid);

  // ================= runners — B24·D2 + B24·D22 (aB3, آقای ۶۷ ساله): مرحله و پرسشِ نوبت از داستان؛ پیامِ اصلاح داده نیست =================
  await section('aB3', async () => {
    await wipe(); await fresh();
    const S1 = 'سلام. من بازنشسته‌ام. ۳۰۰ میلیون تومن پس‌انداز دارم. حقوق بازنشستگی‌ام ماهی ۱۸ میلیونه ولی خرج ماهانه‌مون حدود ۲۱ میلیونه. می‌خوام بدونم این پس‌انداز تا کی دووم میاره، و اینکه بذارمش سپرده‌ی بانکی با سود ۲۳ درصد یا نه.';
    await turn(S1, 'کلِ مسئله را در یک جمله می‌گویید؟', [csn({ ph: 'u', said: ['d'], ans: [] })]);
    await turn('یعنی: با این پس‌انداز و این حقوق، کِی پولم تموم میشه و چیکار کنم که دیرتر تموم شه.', 'خوب.', [csn({ ph: 'u', said: ['u'], ans: ['u0'] })]);
    await turn('آره، تورم! خرج‌مون هر سال حدود ۳۰ درصد زیاد میشه، ولی حقوقم هر سال فقط حدود ۲۰ درصد. اینو حساب نکرده بودم.', 'خوب.', [csn({ ph: 'u', said: ['d'], ans: ['u1', 'u2'] })]);
    await turn('خانمم میگه همیشه باید حداقل ۵۰ میلیون دم دست باشه. پس ۲۵۰ تا رو می‌تونم بذارم سپرده.', 'خوب.', [csn({ ph: 'p', said: ['c'], ans: ['u3'] })]);
    await turn('۲۵۰ میلیون ضربدر ۲۳ درصد میشه ۵۷.۵ میلیون در سال، تقسیم بر ۱۲ میشه حدود ۴.۸ میلیون در ماه. از ۳ میلیون کسری بیشتره! پس اصلاً تموم نمیشه؟', 'خوب.', [csn({ ph: 'e', said: ['result'], ans: [] })]);
    await turn('خرج میشه ۲۱ ضربدر ۱.۳ = ۲۷.۳، حقوق ۱۸ ضربدر ۱.۲ = ۲۱.۶. کسری ۵.۷ میلیون. سود ۴.۸ دیگه کافی نیست! پس از سال دوم کم‌کم از اصل پول می‌خوره.', 'خوب.', [csn({ ph: 'e', said: ['result'], ans: [] })]);
    await turn('۲۵۰ رو می‌ذارم سپرده‌ی یک‌ساله، ۵۰ دم دست. و هر شش ماه یه بار دوباره همین حساب رو با عددای واقعی می‌کنم؛ اولیش ۱ اردیبهشت. ۷۰ درصد مطمئنم تا اون موقع کسری از سود کمتره.', 'خوب.',
      [csn({ ph: 'e', said: ['plan', 'result'], ans: [], plan: { text: 'هر شش ماه یه بار دوباره همین حساب رو با عددای واقعی می‌کنم؛ اولیش ۱ اردیبهشت', when: '2027-04-21' } })]);
    const sid = await p.evaluate(() => __cur().id);
    await turn('آره، ثبتش کن.', 'ثبت شد.', [{ do: 'live_new', title: 'پس‌انداز و سپرده', statement: S1.replace(/^سلام\. من بازنشسته‌ام\. /, ''), nat: 'practical' }]);
    const pid = await liveOf(sid);
    let ph = await sph(pid);
    chk(ph.form === 'u' && ph.story === 'c' && ph.turn === 'c', 'B24·D2/D24-3 (aB3 p10): sub-results («از سال دوم … می‌خوره») + plan ⇒ the story stage is «اجرا», never «بازنگری», and the turn stage follows it :: ' + JSON.stringify(ph));
    const u = await turn('ببخشید، یه اشتباه کردم: حقوقم ماهی ۱۸ نیست، ۱۹ میلیونه؛ فیشم رو دیدم. بقیه همونه.', 'اصلاح را فرستادم.',
      [csn({ ph: 'e', said: ['d'], ans: [], retract: { msg: 'حقوق بازنشستگی‌ام ماهی ۱۸ میلیونه', key: 'datum:حقوق ماهانه', what: 'fact', fix: '۱۹ میلیونه', rests: [] } })]);
    chk(/مرحله: اجرا/.test(blockLine(u.user)) && !/فهمِ مسئله/.test(blockLine(u.user)), 'aB3 p11 «مرحله: فهمِ مسئله» in the live block ⇒ now the story stage :: ' + blockLine(u.user).slice(0, 200));
    chk(!/مرحلهٔ محتمل: فهمِ مسئله/.test(coachHead(u.user)), 'aB3 p11: the coach header is not «فهمِ مسئله» either :: ' + coachHead(u.user).slice(0, 160));
    chk(!/هم‌گام با صفحه[^\n]*به مجهول نگاه کن/.test(head(u.user)), 'B24·D2 (aB3 p11/p12 «به مجهول نگاه کن: دقیقاً چه می‌خواهی…»): the u1 question is not the turn question :: ' + (head(u.user).match(/[^\n]*هم‌گام با صفحه[^\n]*/) || [''])[0].slice(0, 300));
    const q = await lcq(pid, 'با ۱۹: حقوق سال دوم ۱۹ ضربدر ۱.۲ = ۲۲.۸'); chk(!U1.test(q.q), 'the page question for the next turn is not u1 :: ' + JSON.stringify(q));
    const L = await Lv(pid);
    chk(!(L.uDraft.dl || []).some(x => /اشتباه کردم|۱۸ نیست|^۱۹ میلیونه$/.test(x.t)), 'B24·D22: her correction message is never imported as data rows :: ' + JSON.stringify((L.uDraft.dl || []).map(x => x.t)));
    const st = await story(); const its = Object.values(st).flatMap(x => x.items);
    chk(!its.some(x => /اشتباه کردم|۱۸ نیست/.test(x.t)), 'the story ledger has no item from the correction message :: ' + JSON.stringify(its.map(x => x.k + ':' + x.t)));
    chk(!its.some(x => x.k === 'res' && /تموم نمیشه؟$/.test(x.t)), 'a «result» that is only a question («پس اصلاً تموم نمیشه؟») is not a result :: ' + JSON.stringify(its.filter(x => x.k === 'res').map(x => x.t)));
    // 🔭: the strip shows the story stage («✓ (از گفت‌وگو)») — A24-18
    const sp = await p.evaluate((pid) => { APP.go('lprob', pid); return { chips: [...document.querySelectorAll('#main .lp-strip .chip')].map(c => (c.getAttribute('data-story') || '') + '|' + c.textContent), note: (document.querySelector('#main .lp-storynote') || {}).textContent || '' }; }, pid);
    chk(sp.chips.some(c => /^done\|✓ فهمِ مسئله/.test(c)) && sp.chips.some(c => /^now\|.*\(گفت‌وگو\)/.test(c)) && /گفت‌وگو تا «اجرا» جلو رفته/.test(sp.note), 'A24-18 / B24·D2: the 🔭 stage strip ticks the stages done in chat and marks the chat stage :: ' + JSON.stringify(sp));
    chk(!/ تو | تو$|ات /.test(sp.note), 'the strip note has no «تو» (he is «شما») :: ' + sp.note);
  });

  // ================= runners — D24-3 (oD1 c11/c15): نتیجهٔ زیرمسئله کل را به بازنگری نمی‌برد =================
  await section('oD1', async () => {
    await wipe(); await fresh();
    const pid = await bind('قرص‌دانِ وزنی', 'می‌خوام بدونم «مادرم قرصِ امروزش رو برداشته یا نه»، فقط از روی وزنِ قرص‌دون، بی دوربین. داده‌هام: ترازوی دیجیتالِ کوچیک با نویزِ ۰٫۰۵ گرم؛ هر قرص ۰٫۳ گرمه.');
    await turn('یه جمله: می‌خوام بدونم «مادرم قرصِ امروزش رو برداشته یا نه»، فقط از روی وزنِ قرص‌دون. داده‌هام: نویزش حدود ۰٫۰۵ گرمه؛ هر قرص ۰٫۳ گرمه.', 'خوب.', [csn({ ph: 'u', said: ['u', 'd'] })]);
    await turn('۰٫۳ تقسیم بر ۰٫۰۵ میشه ۶ برابرِ نویز. پس زیرمسئلهٔ ۱ حله. ولی زیرمسئلهٔ ۲ رو نمی‌دونم.', 'زیرمسئلهٔ ۱ را بستی.', [csn({ ph: 'p', said: ['result'], stuck: true, result: '۰٫۳ تقسیم بر ۰٫۰۵ میشه ۶ برابرِ نویز' })]);
    const ph = await sph(pid); const M = await Mo(pid);
    chk(ph.story !== 'b' && !/بازنگری/.test(M.now), 'D24-3 (oD1 c11 «اکنون: بازنگری · مانده: نامعلوم — طرح هنوز نیست»): a sub-problem result keeps the whole problem out of look-back :: ' + JSON.stringify([ph, M.now, M.remain]));
    chk(!/طرح هنوز نیست/.test(M.remain) || ph.story !== 'b', '«طرح هنوز نیست» never next to «بازنگری» :: ' + M.remain);
  });

  // ================= runners — B24·D3 (tB1 p7, p11): طرح در ویرگول بریده نمی‌شود؛ «کارکرد در یک جمله» کل نیست =================
  await section('tB1', async () => {
    await wipe(); await fresh();
    const pid = await bind('جعبه‌قرصِ هوشمند برای مادرم', 'یه جعبه‌قرص هوشمند برای مادرم که با یه ترازوی کوچیک زیر هر خونه می‌فهمه قرص رو برداشته یا نه، و اگه سر ساعت برنداشت به گوشی من پیام میده.');
    await turn('یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه و اگه برنداشت به من خبر بده — ارزون، و بدون اینکه مادرم کار اضافه‌ای بکنه.', 'کل روشن شد.', [csn({ ph: 'u', said: ['u'], ans: ['u0'] })]);
    await turn('اگه مستقل باشن، هر دو اشتباه یعنی ۱/۲۰ × ۱/۲۰ = ۱/۴۰۰؛ ماهی ۶۰ بار، یعنی ۰.۱۵ هشدار در ماه. زیر معیاره! برای (۲) هم یه ماژول وای‌فای ESP8266 دارم، با تلگرام‌بات پیام می‌فرستم؛ اینو قبلاً تو یه پروژه‌ی دیگه کار کردم. حالا جمع‌بندی کن ببینم کجام.',
      'جمع‌بندی…', [csn({ ph: 'e', said: ['result', 'plan'], ans: [] })]);
    let M = await Mo(pid); const pl = M.pts.filter(q => q.k === 'cplan23').map(q => q.t);
    chk(pl.length <= 1 && !pl.some(t => /اگه مستقل باشن|جمع‌بندی کن/.test(t)), 'B24·D3 (tB1 p7 «گامِ ۱ ِ طرح: اگه مستقل باشن … گامِ ۸: حالا جمع‌بندی کن ببینم کجام»): no plan steps cut at commas :: ' + JSON.stringify(pl));
    chk(!/۸ گامِ طرحت/.test(M.remain), '🧭 never «مانده: ۰ گام از ۸ گامِ طرحت» :: ' + M.remain);
    await turn('کارکرد در یک جمله: «جعبه‌قرصی که با وزن‌سنجیِ هر خانه می‌فهمد قرص سرِ وقت برداشته شده یا نه و اگر نه به گوشیِ مراقب پیام می‌دهد.» واژه‌ها: جعبه‌قرص هوشمند، pill box weight sensor.', 'گامِ (۳) را برداشتی.', [csn({ ph: 'e', said: ['result'] })]);
    const its = await items('L:' + pid);
    chk(!its.some(x => x.k === 'whole' && /جعبه‌قرصی که با وزن‌سنجی/.test(x.t)), 'B24·D3: her step-3 «کارکرد در یک جمله: …» is not imported as «کل در یک جمله» :: ' + JSON.stringify(its.filter(x => x.k === 'whole').map(x => x.t)));
  });

  // ================= runners — D24-9 + D24-15 (aD4، نجارِ ۸۱ ساله) =================
  await section('aD4', async () => {
    await wipe(); await fresh();
    const P1 = 'سلام. من نجار بودم، الان بازنشسته‌ام. برای نوه‌ام یه کتابخونه می‌خوام بسازم: دو تا بغل، هر کدوم ۱۸۰ سانت، و شش تا طبقه، هر کدوم ۸۰ سانت. تخته‌هایی که بازار داره ۲۴۰ سانتی‌ان. چند تا تخته بخرم؟ به نظرم چهار تا بسه: از دو تا تخته بغل‌ها درمیاد و از دو تای دیگه هر کدوم سه تا طبقهٔ ۸۰.';
    await turn(P1, 'حدستان را چطور می‌آزمایید؟', [csn({ ph: 'u', said: ['u', 'd'], guess: { text: 'به نظرم چهار تا بسه', q: 'آن را چطور می‌آزمایید؟' } })]);
    const u2 = await turn('اون کارتِ تاریخ رو زدم، قبول نکرد، گفت مهر سی روزه؛ راست میگه، اشتباه زدم. من ۵ تیر ۱۳۲۴ به دنیا اومدم. حالا جوابِ شما: سه تا ۸۰ میشه درست ۲۴۰، اندازهٔ خودِ تخته. پس از هر تخته سه تا طبقه درمیاد دیگه.', 'آزمودنتان روی کاغذ درست است.',
      [{ do: 'birth', date: '۵ تیر ۱۳۲۴', age: 81 }, csn({ ph: 'p', said: ['plan'] })]);
    chk(!U1.test(sugOf(u2.user)), 'D24-15 (aD4 p2 «پیشنهادِ این نوبت: «مجهول چیست؟»» after «چند تا تخته بخرم؟»): the coach suggestion is not the unknown question :: ' + sugOf(u2.user).slice(0, 200));
    const its = await items();
    chk(!its.some(x => x.k === 'plan'), 'D24-9 (aD4 «گامِ ۱: اون کارتِ تاریخ رو زدم … گامِ ۶: من ۵ تیر ۱۳۲۴ به دنیا اومدم»): a card/birth/check message is never a plan :: ' + JSON.stringify(its.filter(x => x.k === 'plan')));
    const sid = await p.evaluate(() => __cur().id); const M = await Mo(sid);
    chk(!M.pts.some(q => /به دنیا اومدم|کارتِ تاریخ/.test(q.t)), 'the route main line has no birth/card step :: ' + JSON.stringify(M.pts.map(q => q.t)));
  });

  // ================= runners — A24-7 (aA3، پروین): امتحانِ ردشده داده نیست =================
  await section('aA3', async () => {
    await wipe(); await fresh();
    const pid = await bind('ساعتِ داروها', 'دکتر دو تا دارو برایم نوشته: یکی را باید هر ۸ ساعت یک بار بخورم، آن یکی را هر ۱۲ ساعت یک بار، و دومی را حتماً با غذا. ساعت‌ها را چطور بچینم؟');
    await turn('هر ۸ ساعت یعنی سه بار، هر ۱۲ ساعت دو بار. اولی را امتحان کردم: ساعت ۸ صبح، ۴ بعدازظهر و ۱۲ شب… ولی ۱۲ شب که من خوابم! پس این نشد.', 'آزمایشِ شما چیزِ مهمی را نشان داد.',
      [csn({ ph: 'p', said: ['d', 'plan'], ans: ['u2'], fail: true, register: 'شما' })]);
    const L = await Lv(pid), dl = ((L.uDraft || {}).dl || []).map(x => x.t);
    chk(!dl.some(t => /۸ صبح|۱۲ شب|۴ بعدازظهر|امتحان کردم/.test(t)), 'A24-7 (aA3 «اولی را امتحان کردم: ساعت ۸ صبح»، «۴ بعدازظهر و ۱۲ شب…» as data): the rejected attempt is never data :: ' + JSON.stringify(dl));
    const its = await items('L:' + pid);
    chk(its.some(x => x.k === 'tried' && /۸ صبح/.test(x.t)), 'the attempt is kept as «امتحانِ ردشده (از گفت‌وگو)» history :: ' + JSON.stringify(its.map(x => x.k + ':' + x.t)));
    chk(!its.some(x => x.k === 'plan'), 'a failed attempt is not a plan either :: ' + JSON.stringify(its.filter(x => x.k === 'plan')));
  });

  // ================= runners — C24-11 (oC1 p2) و D24-12 (dp1 p2): پیش‌نویسِ مجهول =================
  await section('unk', async () => {
    await wipe(); await fresh();
    await turn('سلام. مسئله‌م اینه: سه تا پروژه دارم — یه کتاب، یه اپ، یه دورهٔ آموزشی — و هفته‌ای ۱۵ ساعت وقتِ آزاد. نمی‌دونم ترتیبشون چی باشه و ساعت‌ها رو چطوری تقسیم کنم.', 'کلِ مسئله در یک جمله؟', [csn({ ph: 'u', said: [], nat: 'life' })]);
    await turn('یه جمله؟ «با ۱۵ ساعت در هفته، کدوم پروژه اول و با چه سهمی، که شش ماه دیگه دست‌کم یکیش واقعاً تموم شده باشه.» ولی صبر کن — این «یه جمله» رو که الان گفتی از کجا آوردی؟ یه قاعده‌ست تو سامانه یا خودت ساختی؟ وصله به چیزی؟', 'از پولیاست.',
      [csn({ ph: 'u', said: ['u'], ans: ['u0'], nat: 'life' })]);
    let its = await items(); const uu = its.filter(x => x.k === 'u').map(x => x.t);
    chk(uu.length === 1 && /کدوم پروژه اول/.test(uu[0]) && !/از کجا آوردی|سامانه|صبر کن/.test(uu[0]), 'C24-11 (oC1 p2): the unknown draft is her quoted sentence, never the meta-question :: ' + JSON.stringify(uu));
    await wipe(); await fresh();
    await turn('تو کتابِ ریاضیمون یه مستطیلِ ۸ در ۶ هست. از گوشهٔ بالا-چپ به وسطِ ضلعِ پایین و وسطِ ضلعِ راست خط کشیدن و یه مثلث وسطش درست شده. پرسیده مثلثِ وسط چه کسری از کلِ مستطیله؟ من فقط بلدم مساحتِ مستطیل ۴۸ میشه.', 'کلِ مسئله؟', [csn({ ph: 'u', said: ['d'], nat: 'objective' })]);
    await turn('دنبالِ اینم که مساحتِ مثلثِ وسط چند تا از اون ۴۸ تاست. فکر کردم دورش سه تا مثلثِ دیگه هست که اگه مساحتشون رو داشتم از ۴۸ کم می‌کردم، ولی مساحتِ مثلث رو نمی‌دونم چطوری حساب می‌کنن. کلاً تو هندسه خنگم.', 'طرحت دقیق است.',
      [csn({ ph: 'p', said: ['u', 'plan'], ans: ['u0', 'u1'], stuck: true, nat: 'objective' })]);
    its = await items(); const u3 = its.filter(x => x.k === 'u').map(x => x.t);
    chk(u3.length === 1 && /دنبالِ اینم/.test(u3[0]) && !/فکر کردم|نمی‌دونم/.test(u3[0]), 'D24-12 (dp1 «مجهول: فکر کردم دورش سه تا مثلثِ دیگه هست…»): the unknown is the sentence that names it :: ' + JSON.stringify(u3));
  });

  // ================= runners — B24·D4 (s18 p11) و C24-9: پرسشِ وارسیِ دوبارهٔ صفحه کهنه نیست =================
  await section('recheck', async () => {
    await wipe(); await fresh();
    const pid = await bind('قیفِ مخروطی', 'آب با نرخ ثابت ۵ سانتی‌متر مکعب در ثانیه از ته یک قیفِ مخروطی خارج می‌شه. سطحِ آب با چه سرعتی پایین میاد؟');
    await turn('در یک جمله: سرعتِ پایین‌آمدنِ سطحِ آب در قیف وقتی ارتفاع ۶ سانته. داده: نرخ ۵ سانتی‌متر مکعب در ثانیه.', 'خوب.', [csn({ ph: 'u', said: ['u', 'd'], nat: 'objective' })]);
    const Q = 'با مقدارِ اصلاح‌شده («۶ سانتی‌متر مکعب در ثانیه») نتیجه را دوباره وارسی کند — هنوز همان جواب درمی‌آید؟ (کلِ مسئله یا سلیقه را این نوبت پیش نکش.)';
    const why = await p.evaluate(([q]) => { const s = __cur(); return APP.ASSIST.unfit23(q, 'کل مسئله: آهنگِ تغییر میشه -54/(144π) ≈ -0.37', s); }, [Q]);
    chk(!why, 'B24·D4 (s18 p11) / C24-9: the page\'s own post-correction re-check is never demoted as «پرسشِ فرمِ فهم کهنه است» :: ' + why);
    const why2 = await p.evaluate(() => { const s = __cur(); return APP.ASSIST.unfit23('کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی؟', 'اول کتاب رو جلو می‌برم', s); });
    chk(typeof why2 === 'string', 'unfit23 still runs for real u-form questions :: ' + why2);
  });

  // ================= runners — B24·D2 (aB4): chat_solved مجهول/داده/شرط/جواب را هم می‌آورد =================
  await section('aB4', async () => {
    await wipe(); await fresh();
    const S1 = 'یه معمای قدیمی: تو یه مزرعه مرغ و خرگوش هست، روی هم ۳۵ تا سر و ۱۰۰ تا پا. چند تا مرغ و چند تا خرگوش؟';
    await turn(S1, 'مجهول را به زبانِ خودتان؟', [csn({ ph: 'u', said: [], nat: 'objective' })]);
    await turn('یعنی: می‌خوام بدونم چند تا مرغه و چند تا خرگوش. داده: ۳۵ تا سر، ۱۰۰ تا پا. شرطش اینه که مرغ ۲ پا داره و خرگوش ۴ پا.', 'خوب.', [csn({ ph: 'u', said: ['u', 'd', 'c'], nat: 'objective' })]);
    const sid = await p.evaluate(() => __cur().id);
    await turn('حل شد! ۲۰ تا مرغ و ۱۵ تا خرگوش. با ضرب چک کردم: ۲۰×۲ + ۱۵×۴ = ۱۰۰.', 'آفرین.',
      [{ do: 'chat_solved', statement: S1, title: 'مرغ و خرگوش', lesson: 'دو معادله با دو مجهول', check: 'با ضرب چک کردم' }, csn({ ph: 'b', said: ['result'], result: '۲۰ تا مرغ و ۱۵ تا خرگوش', nat: 'objective' })]);
    const pid = await liveOf(sid);
    const c = await chips(pid);
    chk(c.some(x => /^u1:مجهول\|از گفت‌وگو: «مجهول: .*چند تا مرغه/.test(x)) && c.some(x => /^u1:داده\|/.test(x)) && c.some(x => /^u1:شرط\|.*مرغ ۲ پا/.test(x)), 'B24·D2 (aB4 p7 «u/dl/c/solution empty»): the closed problem offers the chat unknown/data/condition «از گفت‌وگو … درست است؟» :: ' + JSON.stringify(c));
    let so = await p.evaluate((pid) => APP.S.get('eprog_' + pid).solve, pid);
    chk(!so.u[1].u && !(so.u[1].dl || []).length, 'nothing is written into the recorded u-form before her ✓ :: ' + JSON.stringify(so.u[1]));
    await p.evaluate(() => { const b = [...document.querySelectorAll('#main .lp-fromchat[data-p23="u1:مجهول"] .lp-fc-ok')][0]; if (b) b.click(); });
    so = await p.evaluate((pid) => APP.S.get('eprog_' + pid).solve, pid);
    chk(/چند تا مرغه/.test(so.u[1].u || ''), 'her ✓ writes the unknown into the recorded u-form :: ' + JSON.stringify(so.u[1].u));
    const c2 = await chips(pid); chk(c2.some(x => /^u1:جواب\|.*۲۰ تا مرغ/.test(x)), 'the solution named in chat is offered too (bank R24 #40) :: ' + JSON.stringify(c2));
  });


  // ================= bank — R2 «یک داستان، مرحله و پرسشِ نوبت» =================
  await section('bank2', async () => {
    const remainOf = async (pid) => (await Mo(pid)).remain;
    const planItems = async (key) => (await items(key)).filter(x => x.k === 'plan');
    // #27 elder: unknown said in chat ⇒ 🔭 prefilled, no u1 turn question, coach suggestion not «مجهول چیست؟»
    await wipe(); await fresh();
    await turn('سلام. من نجار بودم. می‌خوام بدونم چند تا تخته‌ی ۲۴۰ سانتی بخرم برای یه کتابخونه با دو تا بغلِ ۱۸۰ و شش تا طبقهٔ ۸۰ سانتی.', 'حسابتان را با هم می‌کنیم.', [csn({ ph: 'u', said: ['u', 'd'] })]);
    let sid = await p.evaluate(() => __cur().id);
    await turn('آره، ثبتش کنید.', 'ثبت شد.', [{ do: 'live_new', title: 'تخته برای کتابخانه', statement: 'یه کتابخونه با دو تا بغلِ ۱۸۰ و شش تا طبقهٔ ۸۰ سانتی؛ چند تا تخته‌ی ۲۴۰ سانتی بخرم؟', nat: 'practical' }]);
    let pid = await liveOf(sid); let L = await Lv(pid); let q = await lcq(pid, 'خب');
    let u = await turn('خب.', 'باشه.', [csn({ ph: 'u', said: [] })]);
    T(27, L.uDraft && /چند تا تخته/.test(L.uDraft.u || '') && L.uDraft.chat && L.uDraft.chat.u && !U1.test(q.q) && !/هم‌گام با صفحه[^\n]*به مجهول نگاه کن/.test(head(u.user)), { u: L.uDraft && L.uDraft.u, q, line: (head(u.user).match(/[^\n]*هم‌گام با صفحه[^\n]*/) || [''])[0].slice(0, 200) });
    T(42, !U1.test(sugOf(u.user)) && !/پرسشِ این نوبت[^\n]*به مجهول نگاه کن/.test(head(u.user)), sugOf(u.user));
    // #28 — the aB3 runner asserts the block stage = A.liveStoryPhase (section aB3); repeated here on a plan + executed step
    await wipe(); await fresh();
    pid = await bind('سه پروژه', 'با ۱۲ ساعت در هفته، کتاب، اپ یا دوره را چطور جلو ببرم؟');
    await turn('مجهولم اینه که هر هفته چند ساعت به هر کدوم بدم. داده‌ها: کتاب ۱۲۰ ساعت مونده، اپ ۶۰ ساعت.', 'خوب.', [csn({ ph: 'u', said: ['u', 'd'], nat: 'life' })]);
    await turn('طرحم اینه: ۱) کتاب هفته‌ای ۶ ساعت ۲) اپ ۴ ساعت ۳) دوره ۲ ساعت', 'طرحت روشن است.', [csn({ ph: 'p', said: ['plan'], nat: 'life' })]);
    await turn('این هفته ۶ ساعت کتاب نوشتم.', 'خوب.', [csn({ ph: 'e', said: [], nat: 'life', step: { quote: 'این هفته ۶ ساعت کتاب نوشتم', done: 'yes' } })]);
    u = await turn('خب.', 'باشه.', [csn({ ph: 'e', said: [], nat: 'life' })]);
    let ph = await sph(pid), M = await Mo(pid);
    T(28, ph.turn === 'c' && /مرحله: اجرا/.test(blockLine(u.user)) && /اجرا/.test(M.now) && !/فهمِ مسئله/.test(blockLine(u.user)), { ph, line: blockLine(u.user).slice(0, 120), now: M.now });
    // #29 numbered list ⇒ three steps
    let pl = (await planItems('L:' + pid)).pop() || {};
    T(29, (pl.pieces || []).length === 3 && /کتاب هفته‌ای ۶ ساعت/.test(pl.pieces[0]) && /۳ گامِ طرحت/.test(M.remain), { pieces: pl.pieces, remain: M.remain });
    // #30 bulleted list with a Latin header
    await wipe(); await fresh();
    pid = await bind('کدوم خونه', 'بین سه تا خونهٔ اجاره‌ای کدوم رو بگیرم؟');
    await turn('plan:\n- قیمتِ هر سه تا خونه رو بنویسم\n- هزینه‌ی رفت‌وآمد رو اضافه کنم\n- مقایسه', 'خوب.', [csn({ ph: 'p', said: ['plan'], nat: 'life' })]);
    pl = (await planItems('L:' + pid)).pop() || {};
    T(30, (pl.pieces || []).length === 3 && /قیمتِ هر سه تا خونه/.test(pl.pieces[0]) && pl.pieces[2] === 'مقایسه' && !pl.pieces.some(x => /^plan/i.test(x)), pl.pieces);
    // #31 marked plan written as one sentence ⇒ ONE entry
    await wipe(); await fresh();
    pid = await bind('کاشی', 'کفِ اتاقِ ۴ در ۶ را با کاشیِ ۶۰ در ۶۰ می‌پوشانیم؛ چند کاشی لازم است؟');
    await turn('طرحم این است که اول مساحت را حساب کنم، بعد بر ۰٫۳۶ تقسیم کنم و گرد کنم.', 'طرحتان روشن است.', [csn({ ph: 'p', said: ['plan'] })]);
    pl = (await planItems('L:' + pid)).pop() || {};
    T(31, (pl.pieces || []).length === 1 && /اول مساحت را حساب کنم، بعد بر ۰٫۳۶ تقسیم کنم و گرد کنم/.test(pl.pieces[0]), pl.pieces);
    // #32 model plan steps validated; an invented step rejected
    await turn('اول مساحتِ کف رو حساب می‌کنم، بعد تقسیم بر مساحتِ یه کاشی، آخرش ۱۰ درصد اضافه.', 'خوب.', [csn({ ph: 'p', said: ['plan'], plan: { text: 'اول مساحتِ کف رو حساب می‌کنم، بعد تقسیم بر مساحتِ یه کاشی، آخرش ۱۰ درصد اضافه', steps: ['مساحتِ کف رو حساب می‌کنم', 'تقسیم بر مساحتِ یه کاشی', '۱۰ درصد اضافه', 'کاشی‌ها رو از بازار می‌خرم'] } })]);
    pl = (await planItems('L:' + pid)).pop() || {};
    T(32, (pl.pieces || []).length === 3 && !pl.pieces.some(x => /بازار/.test(x)), pl.pieces);
    // #33 / #48 sub-problem result keeps «اجرا»
    await wipe(); await fresh();
    pid = await bind('دوزِ دارو', 'دوزِ داروی بچه را حساب کنیم: سه زیرمسئله — وزن، غلظتِ شربت، حجمِ هر نوبت.');
    await turn('اول وزن، بعد غلظت، بعد حجم رو حساب می‌کنم.', 'خوب.', [csn({ ph: 'p', said: ['plan'], nat: 'objective' })]);
    await turn('۰٫۳ تقسیم بر ۰٫۰۵ میشه ۶ برابر', 'خوب.', [csn({ ph: 'e', said: ['result'], result: '۰٫۳ تقسیم بر ۰٫۰۵ میشه ۶ برابر', nat: 'objective' })]);
    ph = await sph(pid); M = await Mo(pid);
    T(33, ph.story === 'c' && !/بازنگری/.test(M.now), { ph, now: M.now, remain: M.remain });
    T(48, !/بازنگری/.test(M.now) && ph.turn !== 'b', { ph, now: M.now });
    // #34 whole result ⇒ look-back allowed; 🔭/🧭/prompt agree
    await wipe(); await fresh();
    pid = await bind('تخته‌ها', 'برای کتابخانه چند تختهٔ ۲۴۰ سانتی بخرم؟');
    await turn('پس کلاً ۱۴ تا تخته لازمه، با یه دونه اضافه. فکر کنم همینه', 'خوب.', [csn({ ph: 'b', said: ['result'], result: 'پس کلاً ۱۴ تا تخته لازمه' })]);
    u = await turn('خب.', 'باشه.', [csn({ ph: 'b', said: [] })]);
    ph = await sph(pid); M = await Mo(pid);
    const PHN = { u: 'فهمِ مسئله', p: 'طرح', c: 'اجرا', b: 'بازنگری' };
    T(34, new RegExp('مرحله: ' + PHN[ph.turn]).test(blockLine(u.user)) && M.now.indexOf(PHN[ph.turn] === 'اجرا' ? 'اجرا' : PHN[ph.turn]) >= 0, { ph, line: blockLine(u.user).slice(0, 120), now: M.now });
    // #35 / #50 rejected attempts are history, not data
    await wipe(); await fresh();
    pid = await bind('خوابِ شب', 'ساعتِ خوابم به هم ریخته؛ کِی بخوابم که صبح سرحال باشم؟');
    await turn('اولی رو امتحان کردم ساعت ۸ صبح، نشد. ۴ بعدازظهر و ۱۲ شب هم نشد. الان ۱۰ شب رو گذاشتم و دو هفته‌ست خوبه', 'خوب.', [csn({ ph: 'e', said: ['d'], nat: 'life' })]);
    L = await Lv(pid); let dl = ((L.uDraft || {}).dl || []).map(x => x.t), its = await items('L:' + pid);
    T(35, dl.some(t => /۱۰ شب/.test(t)) && !dl.some(t => /۸ صبح|۱۲ شب|۴ بعدازظهر/.test(t)) && its.some(x => x.k === 'tried' && /۸ صبح/.test(x.t)), { dl, its: its.map(x => x.k + ':' + x.t) });
    T(50, !dl.some(t => /ساعت ۸ صبح/.test(t)), dl);
    // #36 / #51 correction messages are never imported items
    await wipe(); await fresh();
    pid = await bind('حقوق و خرج', 'حقوقم ماهی ۱۸ میلیونه و خرجم ۲۱؛ پس‌اندازم تا کی دووم میاره؟');
    await turn('ببخشید یه اشتباه کردم: حقوقم ماهی ۱۸ نیست، ۱۹ میلیونه', 'اصلاح را فرستادم.', [csn({ ph: 'u', said: ['d'], retract: { msg: 'حقوقم ماهی ۱۸ میلیونه', key: 'datum:حقوق', what: 'fact', fix: '۱۹ میلیونه', rests: [] } })]);
    its = await items('L:' + pid); L = await Lv(pid);
    T(36, !its.some(x => /اشتباه کردم|۱۸ نیست/.test(x.t)) && !(((L.uDraft || {}).dl) || []).some(x => /۱۸ نیست|^۱۹ میلیونه$/.test(x.t)), its.map(x => x.k + ':' + x.t));
    NC(36, 'part 1 («حقوقِ ماهانه: ۱۹ میلیون (اصلاح شد ⇐ ۱۸)») is the correction engine (R3, fixer «correction»); here: the correction message is never an imported item — asserted');
    await turn('۱۶ نه، ۱۵', 'اصلاح را فرستادم.', [csn({ ph: 'u', said: ['d'], retract: { msg: '۱۶', key: 'datum:x', what: 'fact', fix: '۱۵', rests: [] } })]);
    its = await items('L:' + pid);
    T(51, !its.some(x => /۱۶ نه|^۱۵$/.test(x.t)), its.map(x => x.k + ':' + x.t));
    NC(51, 'part 2 («اصلاحِ خودم: …» never appended to the statement) is the correction engine (R3); here: never imported as a datum — asserted');
    // #37 meta-question not swallowed; the unknown drafted
    await wipe(); await fresh();
    pid = await bind('هزینهٔ سفر', 'می‌خوایم با خانواده بریم مشهد؛ هزینه رو چطور حساب کنم؟');
    await turn('راستی این فرم‌ها کجا ذخیره میشن؟ مجهولم کلِ هزینه‌ی سفره', 'در همین مرورگر ذخیره می‌شوند.', [csn({ ph: 'u', said: ['u'], nat: 'practical' })]);
    L = await Lv(pid);
    T(37, L.uDraft && /کلِ هزینه‌ی سفر/.test(L.uDraft.u || '') && !/ذخیره|فرم/.test(L.uDraft.u || ''), L.uDraft && L.uDraft.u);
    NC(37, 'part 1 (the meta-question answered/routed in the reply) is the model\'s reply; here: not swallowed into the draft — asserted');
    // #38 a plan idea + stuck is not «مجهول»
    await wipe(); await fresh();
    pid = await bind('مثلثِ وسط', 'یه مستطیلِ ۸ در ۶؛ مثلثِ وسط چه کسری از کلِ مستطیله؟');
    await turn('فکر کردم دورش سه تا مثلثِ دیگه هست که اگه مساحتشونو کم کنم میشه، ولی مساحتِ مثلث رو نمی‌دونم', 'طرحت خوب است.', [csn({ ph: 'p', said: ['u', 'plan'], stuck: true, nat: 'objective' })]);
    L = await Lv(pid);
    T(38, !(L.uDraft && /فکر کردم|نمی‌دونم/.test(L.uDraft.u || '')), L.uDraft && L.uDraft.u);
    NC(38, 'the prerequisite «area of a triangle» is the prereq layer (a44, round 22/23) on the model\'s prereq report; here: not the unknown — asserted');
    // #39 / #49 the page's post-correction re-check is kept
    const Q = 'با مقدارِ اصلاح‌شده («۶») نتیجه را دوباره وارسی کند — هنوز همان جواب درمی‌آید؟ (کلِ مسئله یا سلیقه را این نوبت پیش نکش.)';
    let why = await p.evaluate(([q]) => APP.ASSIST.unfit23(q, 'کل مسئله: آهنگِ تغییر میشه -54/(144π) ≈ -0.37', __cur()), [Q]);
    T(39, !why, why); T(49, !why, why);
    NC(39, 'part 2 (−54/(144π) ≈ −0.119 so her −0.37 is wrong) is a symbolic numeric judgment (π, parentheses) — the model\'s; the page keeps its re-check question — asserted');
    // #40 — section aB4 (chat_solved imports unknown/data/condition/solution)
    T(40, !errors.some(e => /aB4|bank R24 #40/.test(e)), 'see section aB4');
    // #41 proof: «حکم» from chat, no «حکم چیست؟», no stack line «مجهول»
    await wipe(); await fresh();
    pid = await p.evaluate(() => { const r = APP.liveCreate('پنج‌ضلعی', 'ثابت کن مجموعِ زاویه‌های داخلیِ هر پنج‌ضلعی ۵۴۰ درجه است.', 'prove', { by: 'user' }); APP.liveBindSession(r.p.id, __cur()); return r.p.id; });
    await turn('حکم اینه که مجموعِ زاویه‌های داخلیِ هر پنج‌ضلعی ۵۴۰ درجه‌ست. می‌خوام ثابتش کنم', 'خوب.', [csn({ ph: 'u', said: ['u'], nat: 'objective' })]);
    L = await Lv(pid); q = await lcq(pid, 'خب');
    const got = await p.evaluate((pid) => APP.PRE && APP.PRE.gotSoFar ? APP.PRE.gotSoFar({ pid }) : '', pid);
    T(41, L.uDraft && /مجموعِ زاویه‌های داخلیِ هر پنج‌ضلعی/.test(L.uDraft.u || '') && !/حکم[^؟]{0,40}چیست/.test(q.q) && !/^مجهول:/.test(got) && /حکم:/.test(got), { u: L.uDraft && L.uDraft.u, q, got });
    // #43 / #45 / #52 no comma plans
    await wipe(); await fresh();
    pid = await bind('احتمالِ هشدار', 'دو خواندنِ ترازو؛ احتمالِ هشدارِ اشتباه چقدر است؟');
    await turn('اگه مستقل باشن، احتمال ضرب میشه، بعد با جدول چک می‌کنم، حالا جمع‌بندی کن ببینم کجام', 'خوب.', [csn({ ph: 'e', said: ['plan'], nat: 'objective' })]);
    let pls = await planItems('L:' + pid); M = await Mo(pid);
    T(43, pls.length <= 1 && pls.every(x => (x.pieces || []).length <= 1) && !/۸ گامِ طرحت/.test(M.remain), { pls, remain: M.remain });
    await turn('نصفِ ۴ در ۶ میشه ۱۲، جمع ۳۰، ولی طولش رو ندارم', 'خوب.', [csn({ ph: 'e', said: ['plan'], stuck: true, nat: 'objective' })]);
    pls = await planItems('L:' + pid);
    T(45, !pls.some(x => /نصفِ ۴ در ۶/.test(x.t)), pls.map(x => x.t));
    await turn('خسته‌ام، دیروز تا دیروقت کار کردم، امروزم جلسه دارم', 'استراحت کن.', [csn({ ph: 'e', said: ['plan', 'd'], nat: 'objective' })]);
    its = await items('L:' + pid);
    T(52, !its.some(x => /خسته‌ام|جلسه دارم/.test(x.t)), its.map(x => x.k + ':' + x.t));
    // #44 birth message never a plan step
    await wipe(); await fresh();
    await turn('اون کارتِ تاریخ رو زدم، قبول نکرد، بعد دوباره زدم، من ۵ تیر ۱۳۲۴ به دنیا اومدم', 'تاریخِ تولدتان را فرستادم.', [{ do: 'birth', date: '۵ تیر ۱۳۲۴' }, csn({ ph: 'p', said: ['plan'] })]);
    pls = await planItems();
    T(44, !pls.length, pls);
    // #46 «بعدش چی کار کنم؟» is not the unknown; the turn question is still given
    await wipe(); await fresh();
    await turn('می‌خوام کف اتاق ۴ در ۶ رو کاشی کنم، کاشی‌ها ۴۰ در ۴۰ ان.', 'خوب.', [csn({ ph: 'u', said: ['d'] })]);
    const sa = await p.evaluate(() => APP.ASSIST.storyAns24('به مجهول نگاه کن: دقیقاً چه می‌خواهی — «حل‌شدن» چه شکلی است و با چه عدد یا واحدی سنجیده می‌شود؟', 'بعدش چی کار کنم؟', __cur()));
    u = await turn('بعدش چی کار کنم؟', 'خوب.', [csn({ ph: 'u', said: [] })]);
    T(46, sa === false && !!sugOf(u.user), { sa, sug: sugOf(u.user) });
    // #47 a proposal question is not her plan
    await wipe(); await fresh();
    pid = await bind('ترتیبِ خواندن', 'سه کتاب برای کلاس دارم؛ به چه ترتیبی بخوانیم؟');
    await turn('کتاب‌ها رو به ترتیب بخونم. خوبه؟', 'خودت چه فکر می‌کنی؟', [csn({ ph: 'p', said: ['plan'], plan: { text: 'کتاب‌ها رو به ترتیب بخونم' }, nat: 'life' })]);
    pls = await planItems('L:' + pid); L = await Lv(pid);
    T(47, !pls.length && !L.planDraft, { pls, plan: L.planDraft });
    NC(47, 'part 2 («no موعد attached») is the promise/plan store (R7, fixer «today»); here: not stored as her plan — asserted');
    // #53 a meta-question is not the unknown
    await wipe(); await fresh();
    pid = await bind('پروژه‌ها', 'سه پروژه و ۱۲ ساعت در هفته؛ ترتیب؟');
    await turn('سؤالم اینه که الان کجای کارم؟', 'الان در فهمِ مسئله‌ای.', [csn({ ph: 'u', said: ['u'], nat: 'life' })]);
    L = await Lv(pid); its = await items('L:' + pid);
    T(53, !its.some(x => x.k === 'u') && !(L.uDraft && /کجای کارم/.test(L.uDraft.u || '')), its);
    // #54 a NEW problem after the first was solved: no drafts from the first
    await wipe(); await fresh();
    await turn('یه معما: ۳۵ سر و ۱۰۰ پا، مرغ و خرگوش؛ چند تا مرغه؟', 'مجهول؟', [csn({ ph: 'u', said: [], nat: 'objective' })]);
    await turn('یعنی می‌خوام بدونم چند تا مرغه. داده: ۳۵ تا سر و ۱۰۰ تا پا.', 'خوب.', [csn({ ph: 'u', said: ['u', 'd'], nat: 'objective' })]);
    await turn('حل شد! ۲۰ تا مرغ.', 'آفرین.', [{ do: 'chat_solved', statement: 'یه معما: ۳۵ سر و ۱۰۰ پا، مرغ و خرگوش؛ چند تا مرغه؟', title: 'مرغ و خرگوش', lesson: 'دو معادله' }, csn({ ph: 'b', said: ['result'], result: '۲۰ تا مرغ', nat: 'objective' })]);
    sid = await p.evaluate(() => __cur().id);
    await turn('یه مسئلهٔ تازه دارم: یه باغچهٔ ۵ در ۸ داریم؛ دورش چند متر حصار لازمه؟ ثبتش کن.', 'ثبت شد.', [{ do: 'live_new', title: 'حصارِ باغچه', statement: 'یه باغچهٔ ۵ در ۸ داریم؛ دورش چند متر حصار لازمه؟', nat: 'practical' }]);
    const pid2 = await p.evaluate(() => { const r = APP.S.all('eprob').filter(x => /حصار/.test(x.p.title)).pop(); return r ? r.p.id : ''; });
    L = await Lv(pid2);
    T(54, !(L.uDraft && (/مرغ/.test(L.uDraft.u || '') || (L.uDraft.dl || []).some(x => /سر|پا/.test(x.t)))) && !(L.chatImpItems || []).some(x => /مرغ|۳۵ تا سر/.test(x.t)), { u: L.uDraft, imp: L.chatImpItems });
    const missing = BANK.map((e, i) => i).filter(i => /^R2\./.test(E[i].rc) && info.bank[i] === undefined && info.nc[i] === undefined);
    chk(!missing.length, 'bank: every R2 entry is tested or has a reason :: ' + JSON.stringify(missing));
  });


  // ================= bank — R8 «کارِ پیشینِ من» (§۲۱) =================
  await section('bank8', async () => {
    const PR = (pid) => p.evaluate((pid) => { const s = __cur(); const pr = APP.STORY.priorFor(pid ? null : s, pid || ''); return pr ? JSON.parse(JSON.stringify(pr)) : null; }, pid || '');
    const PQ = (pid) => p.evaluate((pid) => APP.STORY.priorTurnQ(pid ? null : __cur(), pid || ''), pid || '');
    const ppr = (text, prior, o) => turn(text, (o && o.reply) || 'کارتان را دیدم.', [csn(Object.assign({ ph: 'e', said: [], prior }, (o && o.cs) || {}))]);
    // P1 — cable (#160, #161, #181, #182, #184)
    await wipe(); await fresh();
    const P1 = 'می‌خوام بدونم کابلِ ۲.۵ برای کولرِ ۳۵۰۰ واتی کافیه یا نه. ایده‌م اینه که جریان رو حساب کنم و با جدول مقایسه کنم. گام ۱: P=V·I پس I=P/V. گام ۲: ۳۵۰۰ تقسیم بر ۲۲۰ میشه ۱۵.۹ میلی‌آمپر. گام ۳: با ضریبِ ۱.۲۵ برای راه‌اندازی میشه ۱۹.۹. گام ۴: جدول میگه کابلِ ۲.۵ تا ۲۰ آمپر رو می‌کشه، پس کافیه.';
    const wm = await p.evaluate((t) => APP.STORY.workMsg(t), P1);
    let u = await ppr(P1, [
      { step: 'فرمول', quote: 'P=V·I پس I=P/V', verdict: 'ok' },
      { step: 'جریان', quote: '۳۵۰۰ تقسیم بر ۲۲۰ میشه ۱۵.۹ میلی‌آمپر', verdict: 'wrong', why: 'وات تقسیم بر ولت آمپر می‌دهد، نه میلی‌آمپر', fix: '۳۵۰۰ تقسیم بر ۲۲۰ میشه ۱۵.۹ آمپر' },
      { step: 'ضریبِ راه‌اندازی', quote: 'با ضریبِ ۱.۲۵ برای راه‌اندازی میشه ۱۹.۹', verdict: 'ok', dep: [2] },
      { step: 'جدول', quote: 'جدول میگه کابلِ ۲.۵ تا ۲۰ آمپر رو می‌کشه، پس کافیه', verdict: 'incomplete', why: 'حاشیهٔ ۱۹.۹ تا ۲۰ کم است؛ طول و روشِ نصب نیامده' }], { cs: { ph: 'e', said: ['u', 'd'] } });
    let pr = await PR(), q = await PQ();
    const s2 = pr && pr.steps[1];
    T(160, wm && /کارِ پیشینِ خودش را دارد/.test(head(u.user)) && pr && pr.steps.length === 4 && pr.steps[0].verdict === 'ok' && s2.verdict === 'wrong' && /درست/.test(s2.chk) && pr.steps[2].depWrong.indexOf(2) >= 0 && pr.steps[3].verdict === 'incomplete' && pr.resume === 2 && /گامِ ۲/.test(q) && !/گامِ ۱ /.test(q), { wm, pr: pr && pr.steps.map(x => [x.n, x.verdict, x.chk, x.depWrong]), resume: pr && pr.resume, q });
    T(184, pr && pr.ph !== 'b', pr && pr.ph);
    T(181, pr && !pr.steps.some(x => x.fixed), pr && pr.steps.map(x => x.fixed));
    // #182 «نه اشتباه نکردم!» without a reason: the verdict is kept with its evidence; the turn question asks her reason
    await ppr('نه اشتباه نکردم!', undefined, { reply: 'دوباره سنجیدم.' });
    pr = await PR(); q = await PQ();
    T(182, pr.steps[1].verdict === 'wrong' && pr.steps[1].her === 'no' && /رد کردی — به چه دلیل/.test(q), { st: pr.steps[1], q });
    // #161 the model re-checks (same verdict, with fix); her yes ⇒ step 2 written with history, dependency cleared
    await ppr('ببین، وات تقسیم بر ولت میشه آمپر؛ پس گام ۲ رو دوباره نگاه کن.', [
      { step: 'فرمول', quote: 'P=V·I پس I=P/V', verdict: 'ok' },
      { step: 'جریان', quote: '۳۵۰۰ تقسیم بر ۲۲۰ میشه ۱۵.۹ میلی‌آمپر', verdict: 'wrong', why: 'وات تقسیم بر ولت آمپر می‌دهد', fix: '۳۵۰۰ تقسیم بر ۲۲۰ میشه ۱۵.۹ آمپر' },
      { step: 'ضریبِ راه‌اندازی', quote: 'با ضریبِ ۱.۲۵ برای راه‌اندازی میشه ۱۹.۹', verdict: 'ok', dep: [2] },
      { step: 'جدول', quote: 'جدول میگه کابلِ ۲.۵ تا ۲۰ آمپر رو می‌کشه، پس کافیه', verdict: 'incomplete', why: 'حاشیه کم است' }]);
    pr = await PR(); const before = JSON.stringify(pr.steps[1].fixed || null);
    await ppr('آره درسته', undefined, { reply: 'نوشتم.' });
    pr = await PR();
    T(161, before === 'null' && pr.steps[1].fixed && /۱۵.۹ آمپر/.test(pr.steps[1].fixed.t) && /میلی‌آمپر/.test(pr.steps[1].fixed.was) && !pr.steps[2].depWrong.length && pr.st === 'ok', { before, st: pr.steps[1], dep: pr.steps[2].depWrong });
    // P2 — proof (#162, #170, #171, #172)
    await wipe(); await fresh();
    const P2 = 'می‌خوام ثابت کنم برای هر n طبیعی، n³−n بر ۶ بخش‌پذیره. ایده‌م تجزیه‌ست. گام ۱: n³−n = (n−1)n(n+1). گام ۲: سه عدد متوالی‌ان پس یکی‌شون بر ۳ بخش‌پذیره. گام ۳: چون حاصل بر ۶ بخش‌پذیره پس بر ۲ هم بخش‌پذیره. گام ۴: بر ۲ و ۳ بخش‌پذیره پس بر ۶.';
    const prior2 = [{ step: 'تجزیه', quote: 'n³−n = (n−1)n(n+1)', verdict: 'ok' }, { step: 'بخش‌پذیری بر ۳', quote: 'سه عدد متوالی‌ان پس یکی‌شون بر ۳ بخش‌پذیره', verdict: 'ok' },
      { step: 'بخش‌پذیری بر ۲', quote: 'چون حاصل بر ۶ بخش‌پذیره پس بر ۲ هم بخش‌پذیره', verdict: 'wrong', why: 'همان چیزی را فرض کرده که باید ثابت شود (دور)', cause: 'skill' }, { step: 'نتیجه', quote: 'بر ۲ و ۳ بخش‌پذیره پس بر ۶', verdict: 'ok', dep: [3] }];
    await ppr(P2, prior2, { cs: { said: ['u'], nat: 'objective' } });
    pr = await PR(); q = await PQ();
    const ev = await p.evaluate(() => (__cur().coachEv || []).filter(e => e.src === 'prior').map(e => ({ ok: e.ok, ph: e.ph, prior: e.prior, cause: e.cause })));
    T(162, pr.steps[2].verdict === 'wrong' && pr.steps[3].depWrong.indexOf(3) >= 0 && pr.resume === 3 && pr.ph === 'c' && /گامِ ۳/.test(q) && !/گامِ ۱|گامِ ۲/.test(q), { st: pr.steps.map(x => [x.n, x.verdict, x.depWrong]), ph: pr.ph, q });
    NC(162, 'the last clause («formulas displayed properly») is the formula renderer (round 21), not the prior layer — verdicts/dependency/resume/stage asserted');
    T(170, ev.filter(e => e.ok && (e.prior === 1 || e.prior === 2)).length === 2 && ev.some(e => !e.ok && e.prior === 3 && e.cause === 'skill' && e.ph === 'c'), ev);
    await ppr('نه، گام ۳ درسته چون حاصل‌ضربِ سه عدد متوالی همیشه زوجه', undefined, { reply: 'دلیلت را می‌سنجم.', cs: { nat: 'objective' } });
    pr = await PR(); q = await PQ();
    T(171, pr.steps[2].her === 'no' && /حاصل‌ضربِ سه عدد متوالی/.test(pr.steps[2].herWhy || '') && !pr.steps[2].fixed && /دلیلِ تازه‌ات برای گامِ ۳/.test(q), { st: pr.steps[2], q });
    NC(171, 'the re-judgement itself (her reason is valid ⇒ rewritten with her yes) is the model\'s next prior report + her yes (mechanism asserted in #161); here: her reason is kept, nothing rewritten, the turn asks about it — asserted');
    await p.evaluate(() => { const d = new Date(window.__day + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 3); window.__day = d.toISOString().slice(0, 10); });
    await fresh();
    const se2 = await p.evaluate(() => APP.S.all('achat').filter(s => s.coach && s.coach.story && Object.values(s.coach.story).some(x => x.prior)).map(s => s.id)[0]);
    const q3 = await p.evaluate((sid) => APP.STORY.priorTurnQ(APP.S.get(sid), ''), se2);
    T(172, !!se2 && /گامِ ۳/.test(q3) && !/گامِ ۱|گامِ ۲/.test(q3), { se2, q3 });
    NC(172, 'the return on D0+3 continues the same session record (the prior section is kept in its ledger and resumes at step 3); judging her new step is the model\'s next prior report');
    // P3 — life decision (#163, #187)
    await wipe(); await fresh();
    const P3 = 'بین سه تا کار موندم. الف: ۴۰ میلیون، ۱۰ دقیقه راه. ب: ۵۵ میلیون، ۹۰ دقیقه راه. ج: ۴۸ میلیون، دورکاری. معیارهام حقوق و راهه. گام ۱: به حقوق وزن ۰.۶ دادم و به راه ۰.۴. گام ۲: به هر کدوم از ۱۰ نمره دادم و ب برنده شد.';
    await ppr(P3, [{ step: 'وزن‌ها', quote: 'به حقوق وزن ۰.۶ دادم و به راه ۰.۴', verdict: 'incomplete', why: 'آیا معیارِ مهمِ دیگری جا افتاده؟ (او باید بگوید)' }, { step: 'نمره‌ها', quote: 'به هر کدوم از ۱۰ نمره دادم و ب برنده شد', verdict: 'unchecked', why: 'نمره‌ها داوریِ ارزشیِ خودش است' }], { cs: { nat: 'life', said: ['d', 'c'] } });
    pr = await PR(); u = await turn('خب.', 'باشه.', [csn({ ph: 'e', said: [], nat: 'life' })]);
    T(163, pr.resume === 1 && pr.steps[1].verdict === 'unchecked' && /مرزِ صادقانه/.test(head(u.user)), { resume: pr.resume, v: pr.steps.map(x => x.verdict) });
    NC(163, 'not inventing a criterion for her is the model\'s reply; page: resume, «نسنجیده», boundary line in the prompt — asserted');
    T(187, pr.steps.every(x => !x.chk), pr.steps.map(x => x.chk));
    // P4 — child (#164, #180, #183)
    await wipe(); await fresh();
    const P4 = 'من ۱۰ سالمه. مامان ۲۴ تا شیرینی داشت، نصفشو به مهمونا داد، بعد ۳ تا خودش خورد. چند تا موند؟ اول نصفِ ۲۴ رو حساب کردم میشه ۱۲. بعد ۱۲ منهای ۳ میشه ۸. جوابم ۸.';
    await ppr(P4, [{ step: 'نصف', quote: 'نصفِ ۲۴ رو حساب کردم میشه ۱۲', verdict: 'ok' }, { step: 'تفریق', quote: '۱۲ منهای ۳ میشه ۸', verdict: 'ok' }, { step: 'جواب', quote: 'جوابم ۸', verdict: 'ok' }], { cs: { nat: 'objective', said: ['d'] } });
    pr = await PR(); q = await PQ();
    const evC = await p.evaluate(() => (__cur().coachEv || []).filter(e => e.src === 'prior').map(e => ({ ok: e.ok, prior: e.prior })));
    T(164, pr.steps[1].verdict === 'wrong' && pr.steps[2].depWrong.indexOf(2) >= 0 && pr.resume === 2 && /گامِ ۲/.test(q) && !/۹/.test(q) && !/[^0-9۰-۹]۹(?![0-9۰-۹])/.test(pr.steps[1].chk), { st: pr.steps.map(x => [x.verdict, x.chk, x.depWrong]), q });
    NC(164, 'the «# پیش‌نیاز» subtraction check is the prereq layer on the model\'s prereq report — the verdict/dependency/resume/no-answer-given asserted');
    T(180, pr.steps[1].verdict === 'wrong', pr.steps[1]);
    T(183, evC.some(e => e.ok && e.prior === 1) && !evC.some(e => !e.ok && e.prior === 1), evC);
    // P5 — multi-facet (#165, #185)
    await wipe(); await fresh();
    const P5 = 'من کلاً استعدادِ ریاضی ندارم. یه جا خوندم آدم‌ها فقط ۱۰ درصدِ مغزشون رو استفاده می‌کنن. حالا این مسئله: یه مستطیل محیطش ۳۰ و طولش دو برابرِ عرضشه. عرض رو x گرفتم، پس طول 2x. محیط = 2(x+2x) = 6x پس x = 5.';
    await ppr(P5, [{ step: 'نام‌گذاری', quote: 'عرض رو x گرفتم، پس طول 2x', verdict: 'ok' }, { step: 'معادله و جواب', quote: 'محیط = 2(x+2x) = 6x پس x = 5', verdict: 'ok' }], { cs: { nat: 'objective', said: ['d'] } });
    pr = await PR(); q = await PQ(); u = await turn('خب.', 'باشه.', [csn({ ph: 'b', said: [], nat: 'objective' })]);
    T(165, pr.ph === 'b' && pr.fin && /راهِ دیگری وارسی/.test(q) && /چند وجه/.test(await p.evaluate((t) => { const s = __cur(); return (APP.ASSIST.promptHooks || []).map(f => { try { return f(s, t) || ''; } catch (e) { return ''; } }).join('\n'); }, P5)), { ph: pr.ph, q });
    NC(165, 'the multi-facet tour itself (self-label «استعداد ندارم» and the claim «۱۰ درصدِ مغز» as ordered facets) is the model\'s reply on the prompt line «اگر چند وجه دارد … ترتیبشان را بپرس» and the a27 multi-facet tour; the problem facet (all ✓ ⇒ look-back) asserted');
    T(185, pr.resume === 0 && pr.ph === 'b' && !U1.test(sugOf(u.user)), { resume: pr.resume, sug: sugOf(u.user) });
    // #166 invention with a territory step
    await wipe(); await fresh();
    await ppr('ایده‌ی یه دستگاه دارم که آبِ باران رو از ناودون جمع کنه و برای باغچه بده. گام ۱: حجم: سقفم ۸۰ متره، بارشِ سالانه ۲۵۰ میلی‌متر، پس ۲۰ مترمکعب. گام ۲: مخزنِ ۲ تُنی کافیه. گام ۳: باید ببینم قبلاً کسی ثبتش کرده یا نه، نمی‌دونم از کجا.',
      [{ step: 'حجم', quote: 'سقفم ۸۰ متره، بارشِ سالانه ۲۵۰ میلی‌متر، پس ۲۰ مترمکعب', verdict: 'ok' }, { step: 'مخزن', quote: 'مخزنِ ۲ تُنی کافیه', verdict: 'incomplete', why: 'مخزنِ ۲ تُنی یک‌دهمِ بارشِ سال را نگه می‌دارد — به زمانِ مصرف بسته است' }, { step: 'پیشینه', quote: 'باید ببینم قبلاً کسی ثبتش کرده یا نه', verdict: 'unchecked', why: 'ابزارش در سامانه نیست' }]);
    pr = await PR();
    T(166, pr.resume === 2 && pr.steps[0].verdict === 'ok' && pr.steps[1].verdict === 'incomplete', pr.steps.map(x => x.verdict));
    NC(166, 'the territory sheet for step 3 (gap.step = 3, ⏸) is the territory loop (R1, fixer «loop») on the model\'s gap; the area product 80 m² × 0.25 m is not written as an expression (no page check claimed) — resume/verdicts asserted');
    // #167 Latin digits, both steps ✓, resume = the open part
    await wipe(); await fresh();
    await ppr('x^2-5x+6=0 رو حل کردم. گام1: delta=25-24=1. گام2: x=(5±1)/2 پس 3 و 2. میخواستم با تجزیه هم برم ولی نمیدونم چطوری',
      [{ step: 'دلتا', quote: 'delta=25-24=1', verdict: 'ok' }, { step: 'ریشه‌ها', quote: 'x=(5±1)/2 پس 3 و 2', verdict: 'ok' }, { step: 'راهِ دیگر', quote: 'میخواستم با تجزیه هم برم ولی نمیدونم چطوری', verdict: 'incomplete', why: 'راهِ دوم هنوز برداشته نشده' }], { cs: { nat: 'objective' } });
    pr = await PR(); q = await PQ();
    NC(167, 'the roots check (substituting 3 and 2 into x²−5x+6) is not an arithmetic chain the page evaluates — the delta chain «25-24=1» is page-checked; roots are the model\'s ✓');
    T(167, pr.steps[0].verdict === 'ok' && /درست/.test(pr.steps[0].chk) && pr.steps[1].verdict === 'ok' && pr.resume === 3 && /گامِ ۳/.test(q), { st: pr.steps.map(x => [x.verdict, x.chk]), q });
    // #168 elder, compound interest — unchecked until the kind is known
    await wipe(); await fresh();
    await ppr('با سلام. سپردهٔ ۱۰۰ میلیونی با سودِ سالانهٔ ۲۰ درصد دارم. گام ۱: پایانِ سالِ اول ۱۲۰ میلیون. گام ۲: پایانِ سالِ دوم ۱۴۰. گام ۳: پایانِ سالِ سوم ۱۶۰. پس سه سال بعد ۱۶۰ میلیون دارم.',
      [{ step: 'سالِ اول', quote: 'پایانِ سالِ اول ۱۲۰ میلیون', verdict: 'ok' }, { step: 'سالِ دوم', quote: 'پایانِ سالِ دوم ۱۴۰', verdict: 'unchecked', why: 'بسته به ساده یا مرکب بودنِ سود' }, { step: 'سالِ سوم', quote: 'پایانِ سالِ سوم ۱۶۰', verdict: 'unchecked', dep: [2] }], { cs: { register: 'شما' } });
    pr = await PR();
    T(168, pr.resume === 2 && pr.steps[1].verdict === 'unchecked' && !pr.steps.some(x => x.verdict === 'wrong'), pr.steps.map(x => x.verdict));
    NC(168, 'asking «سودِ شما ساده است یا مرکب؟» in «شما» is the model\'s reply on the unchecked verdict; page: no false ✗, resume at step 2 — asserted');
    // #169 🧭 / 🔭 / 📜 show the section with verdicts and dependency marks
    await wipe(); await fresh();
    let pid = await bind('شیرینی‌ها', 'مامان ۲۴ تا شیرینی داشت، نصفشو به مهمونا داد، بعد ۳ تا خودش خورد. چند تا موند؟');
    await ppr('اول نصفِ ۲۴ رو حساب کردم میشه ۱۲. بعد ۱۲ منهای ۳ میشه ۸. جوابم ۸.', [{ step: 'نصف', quote: 'نصفِ ۲۴ رو حساب کردم میشه ۱۲', verdict: 'ok' }, { step: 'تفریق', quote: '۱۲ منهای ۳ میشه ۸', verdict: 'ok' }, { step: 'جواب', quote: 'جوابم ۸', verdict: 'ok' }], { cs: { nat: 'objective' } });
    const M = await Mo(pid), D = await p.evaluate((pid) => APP.dossier(pid).events.map(e => e.k + '|' + (e.lines || []).join(' ')), pid);
    const pg = await p.evaluate((pid) => { APP.go('lprob', pid); const s = document.querySelector('#main .lp-prior'); return s ? { t: s.textContent, n: s.querySelectorAll('.lp-prior-step').length, ask: s.querySelectorAll('.lp-prior-ok').length } : null; }, pid);
    T(169, M.pts.some(q => q.k === 'cprior') && D.some(t => /^cprior\|.*✗ نادرست.*وابسته به گامِ ۲/.test(t)) && pg && pg.n === 3 && /✗ نادرست/.test(pg.t) && /وابسته به گامِ ۲/.test(pg.t) && pg.ask === 3, { route: M.pts.map(q => q.k), D: D.filter(t => /cprior/.test(t)), pg });
    // #173 seven steps all carried in the prompt
    await wipe(); await fresh();
    const seven = ['گام ۱: الف رو نوشتم', 'گام ۲: ب رو حساب کردم', 'گام ۳: ج رو مقایسه کردم', 'گام ۴: د رو جمع کردم', 'گام ۵: ه رو تقسیم کردم', 'گام ۶: و رو گرد کردم', 'گام ۷: ز رو وارسی کردم'];
    await ppr('مسئله‌ی بلندم: ' + seven.join('. ') + '.', seven.map((x, i) => ({ step: 'گام ' + (i + 1), quote: x.replace(/^گام \d: /, ''), verdict: 'ok' })));
    u = await turn('خب.', 'باشه.', [csn({ ph: 'e', said: [] })]);
    const lines = head(u.user).split('\n').filter(l => /^- زمینه \(نه پرسشِ دوم\): گامِ [۱-۷] · /.test(l));
    T(173, lines.length === 7, lines.map(l => l.slice(0, 60)));
    // #174 / #186 a correct unit conversion and area are never flagged
    await wipe(); await fresh();
    await ppr('سلام. ۱۵۰ سانت = ۱.۵ متر. پس مساحت ۱.۵ در ۲ میشه ۳ مترمربع. گام بعدی رو نمی‌دونم', [{ step: 'تبدیل', quote: '۱۵۰ سانت = ۱.۵ متر', verdict: 'ok' }, { step: 'مساحت', quote: 'مساحت ۱.۵ در ۲ میشه ۳ مترمربع', verdict: 'ok' }]);
    pr = await PR();
    const cv = await p.evaluate(() => [APP.STORY.arithChk('۱۵۰ سانت = ۱.۵ متر'), APP.STORY.arithChk('۱۵۰ سانت = ۱۵ متر')]);
    T(174, pr.steps.every(x => x.verdict === 'ok') && /درست/.test(pr.steps[1].chk) && pr.resume === 0, pr.steps.map(x => [x.verdict, x.chk]));
    T(186, cv[0].length === 1 && cv[0][0].ok === true && cv[1].length === 1 && cv[1][0].ok === false, cv);
    // #175 Persian-digit quote vs Latin-digit text
    await wipe(); await fresh();
    await ppr('step: 3500/220 = 15.9 and 15.9*1.25 = 19.9 so cable is ok. گام بعد: جدول.', [{ step: 'جریان', quote: '۳۵۰۰/۲۲۰ = ۱۵.۹', verdict: 'ok' }]);
    pr = await PR();
    T(175, pr && pr.steps.length === 1 && pr.rej === 0, pr);
    // #176 / #177 / #178 no steps ⇒ no section; the page never invents steps
    await wipe(); await fresh();
    const w176 = await p.evaluate(() => [APP.STORY.workMsg('یه مسئله دارم: چطور هزینه‌ی سفرمونو کم کنیم؟ فکر می‌کنم باید زودتر بلیت بخریم.'), APP.STORY.workMsg('امروز صبح رفتم بیرون، هوا خوب بود، با دوستم قهوه خوردیم و برگشتم خونه.')]);
    await turn('یه مسئله دارم: چطور هزینه‌ی سفرمونو کم کنیم؟ فکر می‌کنم باید زودتر بلیت بخریم.', 'خوب.', [csn({ ph: 'u', said: ['u'], nat: 'life' })]);
    T(176, w176[0] === false && !(await PR()), w176);
    T(177, w176[1] === false, w176);
    await turn('اول مساحت رو حساب کردم، بعد تقسیم کردم، بعد گرد کردم، جوابم ۱۴ شد', 'خوب.', [csn({ ph: 'e', said: ['result'] })]);
    T(178, !(await PR()), await PR());
    // #179 an invented quote is rejected and never shown
    await ppr('گام ۱: مساحت ۲۴. گام ۲: تقسیم بر ۰.۱۶ میشه ۱۵۰.', [{ step: 'مساحت', quote: 'مساحت ۲۴', verdict: 'ok' }, { step: 'گام ۵', quote: 'گام ۵: کاشی‌ها رو خریدم', verdict: 'ok' }]);
    pr = await PR();
    T(179, pr && pr.steps.length === 1 && pr.rej === 1 && !pr.steps.some(x => /خریدم/.test(x.quote)), pr && { n: pr.steps.length, rej: pr.rej });
    const missing = BANK.map((e, i) => i).filter(i => /^R8\./.test(E[i].rc) && info.bank[i] === undefined && info.nc[i] === undefined);
    chk(!missing.length, 'bank: every R8 entry is tested or has a reason :: ' + JSON.stringify(missing));
  });

  const nb = Object.keys(info.bank).length, nbOk = Object.values(info.bank).filter(Boolean).length;
  console.log('bank R2+R8: ' + nbOk + '/' + nb + ' pass; nc: ' + Object.keys(info.nc).length + (Object.keys(info.nc).length ? ' ' + JSON.stringify(info.nc) : ''));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
