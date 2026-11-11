// تورِ پولیا (دستهٔ ۱، دورِ ۲۵، سهمِ «loop» — ۲۰۲۶-۱۱-۱۱) — DECISIONS_R25: P3 (حلقهٔ قلمرو، جورشدنِ ناروشن؛ S1 ِ دور: B25·D1 = D25-21) + روشن‌سازی‌های C2–C5.
//  runners  جمله‌ها و برگه‌های خودِ گزارش‌های دورِ ۲۵ —
//           tB1 (B25·D1، S1): «🛎 ابزارِ لازم آمد … — سنجیدم که نیازِ گامِ «(۳) پیشینه…» را جواب می‌دهد» برای «بررسیِ بازار و رقیبان» با «ایده» (عنوانِ برگه) و «جایگاه»
//                (نامِ نمای «💡 جایگاهِ ایده» در «دقیقاً چه کم است»)؛ «…«بررسیِ بازار و رقیبان» که به کارِ گامِ سوم نمیاد…» + sys_fit false ⇒ «resumed»، برگه بسته، «امروز» بی سطر.
//           oD1u (D25-21، S1): «هموارسازیِ نویزِ اندازه‌گیری» با «نویز»، «عدد»، «آر»، «پنجره» ⇒ «رسید»؛ «نه، این همون نیست…» + sys_fit {fit:false} ⇒ «از سر گرفته شد ✓».
//           tB1y (B25·D18): پرسیدن و هم‌زمان «⚠️ … جواب نداد — زیرِ برگه نوشتم و دوباره باز شد»؛ خطِ ⚠️ ِ یکسان و بی‌دلیل (tB1 s14–s16).
//           tB1d (B_s D14): «تا آن وقت گام منتظر می‌ماند» برای pr_prior_a و در همان گذر «ابزارِ لازم آمد» برای pr_prior_b.
//           pwC1 روزِ ۳ (C25-19) و tB1 بازوهای a/a2/b ِ B_s (D15): «⏳ … ساخته‌اش هنوز در سامانه دیده نمی‌شود — شاید نسخهٔ تازه هنوز منتشر نشده» برای جوابی که هیچ چیزی نام نبرد.
//           tB1 📜 (B25·D19): دو سطرِ «⏸ منتظرِ برگهٔ #۱۰۱» («رسید» / «منتظر»).   tA1 p18 (A25-22): تکهٔ پس از بستن «۷ نگه‌داریِ زمستانیِ باتری» برگهٔ #۱۰۳ گرفت، نه مدخل نه سطر.
//  arms     بازوهای منفیِ حلقهٔ انتظار کنارِ مثبت‌ها (experiences/two-sided-needs-judging…، به‌روزرسانیِ ۲۰۲۶-۱۰-۱۹)
//  bank     همهٔ ۳۱ ورودیِ P3 در بانکِ مستقلِ tests/variants/VARIANTS_R25.json
// هیچ تاریخِ تقویمی‌ای در این آزمون ثابت نیست: ساعتِ صفحه با APP.clock.off (روز) جابه‌جا می‌شود.
// LLA_FILE = ساختِ دیگر؛ ONLY=runners,arms,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = JSON.parse(fs.readFileSync(process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R25.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R25.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)), 'utf8'));

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__sheetNo = []; window.__sheets = {}; window.__notes = []; window.__filed = {};
    APP.clock.off = 0;
    APP.HOST = { report: async (o) => { const n = __sheetNo.length ? __sheetNo.shift() : 900; __filed['sh' + n] = (o && o.text) || ''; return { id: 'sh' + n, number: n }; }, sheets: async () => [], sheet: async (id) => (__sheets[id] || null),
      note: async (id, t) => { __notes.push({ id, t }); return { ok: true }; }, remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    window.__turn = async (text, reply, actions, extra, more) => {
      const n0 = __calls.length; __q.push(R(Object.assign({ reply: reply || 'باشه.', actions: actions || [] }, more || {}))); (extra || []).forEach(x => __q.push(x));
      await APP.ASSIST.send(text); __q.length = 0;
      const all = __calls.slice(n0), c = all.filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {};
      return { sys: c.sys || '', user: c.user || '', task: c.task || '', n: all.length };
    };
    window.__fresh = (view) => { APP.go(view || 'home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); (window.__added || []).forEach(id => __dropArea(id)); window.__added = []; window.__sheets = {}; window.__filed = {}; window.__notes = []; APP.clock.off = 0; };
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
    window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {}; fn(pg.solve, L); APP.S.put(pg); };
    window.__added = [];
    window.__addArea = (sysId, a) => { const S0 = (window.SYS_TERR.systems || []).filter(x => x.id === sysId)[0]; S0.groups[0].areas.push(Object.assign({ key_questions_fa: [], tools: [], claims: [] }, a)); __added.push(a.id); };
    window.__dropArea = (id) => { (window.SYS_TERR.systems || []).forEach(m => (m.groups || []).forEach(g => { g.areas = (g.areas || []).filter(a => a.id !== id); })); };
    window.__reply = (n, replies, status) => { const id = 'sh' + n, f = __filed[id] || ''; const old = __sheets[id]; const add = replies.map((t, i) => (typeof t === 'string' ? { id: 'r' + n + '_' + ((old ? old.notes.length : 1) + i), by: 'routine', at: APP.nowISO(), text: t } : t));
      if (old) { old.notes = old.notes.concat(add); old.status = status || 'answered'; } else __sheets[id] = { id, number: n, status: status || 'answered', text: f, notes: [{ id: 'n0', by: 'owner', text: f }].concat(add) }; };
  });
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const blockOf = (u, re) => head(u).split(/\n(?=# )/).filter(bl => re.test(bl.split('\n')[0]))[0] || '';
  const nTQ = (u) => (head(u).match(/\*\*پرسشِ این نوبت همین است:?\*\*|^- در این نوبت فقط \*\*یک\*\* پرسش|پیشنهادِ این نوبت: «/gm) || []).length;
  const turn = (text, reply, actions, extra, more) => p.evaluate(([t, r, a, x, m]) => __turn(t, r, a, x, m), [text, reply || '', actions || [], extra || [], more || null]);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const bind = async (title, stmt) => p.evaluate(([t, stmt]) => { const pid = __live(t, stmt); APP.liveBindSession(pid, __cur()); return pid; }, [title, stmt]);
  const sysMsgs = () => p.evaluate(() => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text));
  const CONSULT = { agree: true, area: 'sys-territory', kind: 'build', dup_of: null, reason: 'در نقشهٔ قلمرو نیست.', fix: {} };
  await p.evaluate((c) => { window.__consult = () => c; }, CONSULT);
  const gapTurn = (text, g, reply, acts, n, more) => p.evaluate(([t, g, r, a, n, m]) => { __sheetNo.push(n); return __turn(t, r, a, [__consult()], Object.assign({ status: 'gap', gap: g }, m || {})); }, [text, g, reply, acts || [], n, more || null]);
  const sysAll = () => p.evaluate(() => APP.PRE.sysAll().map(x => ({ id: x.e.id, n: x.e.number, st: x.e.state, step: x.e.step, late: !!x.e.late, tool: (x.e.tool || {}).id || '', how: x.e.how || '', ask: x.e.ask ? x.e.ask.id : '', rej: x.e.rejected || [], checks: (x.e.checks || []).map(c => c.mismatch ? (c.byHer ? 'misHer' : 'mis') : c.ask ? 'ask' : c.undo ? 'undo' : c.ok ? 'ok' : c.lag ? 'lag' : c.declined ? 'no' : '?'), why: (x.e.checks || []).map(c => c.reason || '') })));
  const one = async (n) => (await sysAll()).filter(e => e.n === n)[0] || null;
  const today = () => p.evaluate(() => APP.dueList().filter(x => x.sys23).map(x => x.txt + ' | ' + (x.sub || '')));
  const check = () => p.evaluate(() => APP.PRE.sysCheck());
  const notes = () => p.evaluate(() => __notes.slice());
  const adv = (d) => p.evaluate((d) => { APP.clock.off = (APP.clock.off || 0) + d; }, d);
  const dz = (pid) => p.evaluate((pid) => APP.dossier(pid).events.filter(e => /^sys/.test(e.k)).map(e => ({ k: e.k, at: e.at, title: e.title, out: e.out })), pid);
  const rank = (n, tx) => p.evaluate(([n, tx]) => { const x = APP.PRE.sysAll().filter(z => z.e.number === n)[0]; return APP.PRE.sysRank(x.e, APP.PRE.regDiff(x.e.fp), tx || ''); }, [n, tx || '']);
  const addArea = (sysId, a) => p.evaluate(([s, a]) => __addArea(s, a), [sysId, a]);
  const reply = (n, list, st) => p.evaluate(([n, l, st]) => __reply(n, l, st), [n, list, st || null]);
  const E = {}; BANK.forEach((e, i) => { E[i] = e; });
  const T = (i, ok, x) => { info.bank[i] = !!ok; chk(ok, 'bank#' + i + ' [' + E[i].rc + '/' + E[i].kind + '] «' + E[i].text.slice(0, 70) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 900)); };
  const own = (i) => /^P3\./.test(E[i].rc);
  const ARR = /🛎 ابزارِ لازم آمد/, WEIGHED = /سنجیدم که نیازِ گام/, ASKED = /❓ برگهٔ/, MIS = /⚠️ پاسخِ/, LAG = /⏳/;

  // ---- the runners' sheets ----
  // tB1 (round 25): the round-24 sheet of the same scenario; «دقیقاً چه کم است» names the existing view «💡 جایگاهِ ایده» (B25·D1)
  const G_tB1 = { title: 'روشِ جست‌وجوی پیشینهٔ اختراع پیش از ساختِ یک ایده', area: 'sys-territory', kind: 'build', step: '(۳) پیشینه: آیا کسی قبلاً همین جعبه‌قرص را ساخته یا ثبتِ اختراع کرده؟',
    abstract: 'وقتی کاربر ایدهٔ ساختِ یک محصول یا ابزار را به برنامه تبدیل می‌کند، یکی از زیرمسئله‌ها «آیا قبلاً ساخته یا ثبت شده؟» است.',
    missing: 'یک حوزه در قلمروِ «حل مسئله و استدلال» (یا تصمیم) برای جست‌وجوی پیشینه: گام‌ها (تعریفِ دقیقِ کارکرد، واژه‌ها و هم‌معنی‌ها، منبع‌ها، داوریِ شباهت/تفاوت، ثبتِ یافته‌ها با تاریخ)؛ «💡 جایگاهِ ایده» فقط قوت و فرضِ ایده را دارد.',
    where: '«🗺 قلمروِ سامانه‌ها» (s_problem: حوزهٔ تازه) + «💡 جایگاهِ ایده» + VIEW_META.idea', how: 'حوزهٔ تازه با منبعِ معتبر و گزاره‌ها',
    why_not: 'epi-*: کارخانه ادعا را می‌سنجد، جست‌وجوی پیشینه نمی‌کند؛ lla-page: نما خراب نیست، روش نیست؛ pr_hypothesis_testing فقط آزمونِ فرضیه است.', evidence: 'در فهرستِ قلمروها حوزه‌ای برای جست‌وجوی پیشینه/اختراع نیست.', confidence: 0.85 };
  const A_market = { id: 'pr_market_scan', fa: 'بررسیِ بازار و رقیبان', desc_fa: 'جایگاهِ یک ایده در بازار: رقیبان چه می‌فروشند و به چه بهایی', key_questions_fa: ['رقیبانِ این ایده چه کسانی‌اند؟'] };
  const A_prior = { id: 'pr_prior_art', fa: 'جست‌وجوی پیشینهٔ اختراع و محصول', desc_fa: 'روشِ جست‌وجوی پیشینه در پایگاه‌های ثبتِ اختراع: آیا کسی همین را ساخته یا ثبت کرده؟', key_questions_fa: ['آیا همین پیش‌تر ثبت شده؟'] };
  const A_hist = { id: 'pr_tech_history', fa: 'سرگذشتِ فناوری‌ها', desc_fa: 'پیشینهٔ یک فناوری از نخستین نمونه تا امروز', key_questions_fa: ['این فناوری از کجا آمد؟'] };
  // oD1u: the round-24 sheet of oD1n (the runner replayed it), the half-related area «هموارسازیِ نویزِ اندازه‌گیری»
  const G_oD1 = { title: 'روشِ پیدا کردنِ تغییرِ ماندگار (پله) در دادهٔ نویزی و لغزانِ حسگر', area: 'sys-territory', kind: 'build', step: 'زیرمسئلهٔ ۲: جدا کردنِ پلهٔ واقعیِ ۰٫۳ گرمی از جهشِ لحظه‌ایِ باز و بسته کردن و از دریفتِ آرامِ دما',
    abstract: 'کاربر به داده‌ای زمانی می‌رسد که هم نویز دارد، هم جهشِ لحظه‌ای و هم لغزشِ آرام؛ باید بفهمد کِی یک «تغییرِ واقعی و ماندگار» رخ داده.',
    missing: 'حوزه‌ای برای آشکارسازیِ نقطهٔ تغییر در دادهٔ زمانی: جدا کردنِ پلهٔ ماندگار از جهشِ گذرا (پنجرهٔ پایداری) و از لغزشِ آرام (حذفِ روند/خط‌مبنا)، و آستانه‌گذاری با سنجشِ خطای هشدارِ نادرست؛ با یک ابزارِ کوچک در صفحه (ورودیِ سریِ عددی ⇐ نمودار ⇐ پله‌های یافته).',
    where: 'قلمروِ سامانه‌ها ⇐ s_problem (حوزهٔ تازه)', how: 'حوزهٔ تازه با گزاره‌های رده‌بندی‌شده', why_not: 'pr_statistical فقط آمارِ توصیفی است؛ epi-territory دربارهٔ معرفت‌شناسی است نه روشِ مهندسی', evidence: 's_problem فقط حوزه‌های کلیِ حل دارد', confidence: 0.8 };
  const A_smooth = { id: 'pr_noise_smoothing', fa: 'هموارسازیِ نویزِ اندازه‌گیری', desc_fa: 'میانگینِ متحرک روی یک پنجره تا هر عدد آرام شود', key_questions_fa: ['پنجره چند نمونه باشد تا نویز کم شود؟'] };
  const A_change = { id: 'pr_change_detection', fa: 'آشکارسازیِ تغییرِ ماندگار (پله) در دادهٔ نویزیِ حسگر', desc_fa: 'پنجرهٔ پایداری برای جدا کردنِ پلهٔ ماندگار از جهشِ گذرا، خط‌مبنای متحرک برای لغزش، و آستانه با سنجشِ هشدارِ نادرست', key_questions_fa: ['این پله ماندگار است یا جهشِ گذرا؟'] };
  // the bank's «گامِ داروخانه» (context of #107…#137; sheet title from #108)
  const G_ph = { title: 'ابزارِ سنجشِ همکاریِ فروشنده‌ها', area: 'sys-territory', kind: 'build', step: '۴ — آیا داروخانه‌های محل حاضرند همکاری کنند؟',
    abstract: 'کاربر پیش از ساختن می‌خواهد بداند فروشنده‌ها حاضرند همکاری کنند یا نه.', missing: 'حوزه‌ای برای سنجیدنِ آمادگیِ همکاریِ فروشنده‌ها نیست؛ در نمای «🧮 ماشینِ برآورد» چیزی برای این گام نیست.',
    where: 'قلمروِ سامانه‌ها (s_social: حوزهٔ تازه)', how: 'حوزهٔ تازه', why_not: 'lla-page: نما خراب نیست؛ dc_risk_uncertainty دربارهٔ تصمیم زیرِ عدم‌قطعیت است، نه همکاریِ فروشنده.', evidence: 'در قلمروِ سامانه‌ها حوزه‌ای برای همکاریِ فروشنده نیست.', confidence: 0.85 };
  const A_partner = { id: 'sc_partner_readiness', fa: 'سنجشِ آمادگیِ همکاریِ فروشندگان', desc_fa: 'چطور بفهمیم یک فروشنده حاضر است همکاری کند: پرسش از رفتارِ گذشته و تعهدِ کوچک', key_questions_fa: ['این فروشنده پیش‌تر با چه کسی همکاری کرده؟'] };
  const openPh = async (n) => { await wipe(); await fresh(); const pid = await bind('پخشِ دارو در محل', 'می‌خواهم داروهای سالمندانِ محل را از داروخانه به خانه‌شان برسانم؛ گام‌ها: ۱ نیاز، ۲ هزینه، ۳ مجوز، ۴ همکاریِ داروخانه‌ها.');
    await gapTurn('برای اینکه بفهمم داروخانه‌های محل حاضرن همکاری کنن روشی اینجا هست؟ گیر کردم.', G_ph, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'p', stuck: true })], n || 101); return pid; };
  const arrivePh = async () => { await addArea('s_social', A_partner); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «سنجشِ آمادگیِ همکاریِ فروشندگان» افزوده شد.']); await check(); return one(101); };
  const R7 = {};

  // ================= runners: the round's S1 and its S3 companions, from the runners' own sentences =================
  await section('runners', async () => {
    // ---- D25-21: «آر» is not a token ----
    const tk = await p.evaluate(() => ({ step: APP.PRE.sysToks('از دریفتِ آرامِ دما'), ab: APP.PRE.sysToks('مصرفِ آبِ ماهانه‌مان چقدر است؟'), fn: APP.PRE.sysToks('از او تا ما به هر که') }));
    chk(!tk.step.includes('آر') && tk.ab.includes('آب') && tk.fn.length === 0, 'D25-21: «آر» (a piece of «آرام») is not a token; the whole two-letter word «آب» is; two-letter particles are not :: ' + JSON.stringify(tk));

    // ---- tB1 (B25·D1, S1 first half) — «بررسیِ بازار و رقیبان» on «ایده» / «جایگاه» ----
    await wipe(); await fresh();
    const pidB = await bind('جعبه‌قرصِ هوشمند', 'یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه و اگه برنداشت خبر بده.');
    await gapTurn('چطوری بفهمم کسی قبلاً همین جعبه‌قرص رو ساخته یا ثبت اختراع کرده؟ اینجا روشی براش هست؟', G_tB1, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'p', stuck: true })], 101);
    let e = await one(101); chk(e && e.st === 'wait', 'tB1: #101 waits :: ' + JSON.stringify(e));
    const fr = await p.evaluate(() => APP.PRE.sysFraming ? APP.PRE.sysFraming(APP.PRE.sysAll()[0].e) : []);
    chk(fr.some(x => /^idea:/.test(x) && /جایگاه/.test(x) && /ایده/.test(x)), 'P3: the existing view «💡 جایگاهِ ایده» named in the sheet is read as the sheet\'s own framing :: ' + JSON.stringify(fr));
    await adv(4);
    await addArea('s_problem', A_market);
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ تازهٔ `pr_market_scan` («بررسیِ بازار و رقیبان») ساخته و منتشر شد.']);
    const rkB = await rank(101, 'حوزهٔ تازهٔ pr_market_scan («بررسیِ بازار و رقیبان») ساخته و منتشر شد');
    const nB = (await notes()).length; await check();
    e = await one(101); let sy = await sysMsgs(), td = await today();
    R7.b1 = e.st === 'wait' && !e.tool && e.ask === 'pr_market_scan' && !sy.some(t => ARR.test(t) || WEIGHED.test(t)) && !td.some(t => ARR.test(t)) && td.some(t => /❓ برگهٔ #۱۰۱ جواب گرفت: «بررسیِ بازار و رقیبان»/.test(t));
    chk(R7.b1, 'B25·D1 tB1 s17 (S1): «بررسیِ بازار و رقیبان» is NOT «🛎 ابزارِ لازم آمد … سنجیدم که نیازِ گامِ «(۳) پیشینه…» را جواب می‌دهد» on «ایده»/«جایگاه» — the page asks her :: ' + JSON.stringify({ e, rkB, sy: sy.slice(-2), td }));
    chk(rkB.best && rkB.best.sa === 0 && !rkB.clear, 'B25·D1: «ایده» (spread / the named view) and «جایگاه» (the named view) are low-weight ⇒ no step anchor :: ' + JSON.stringify(rkB));
    chk(sy.filter(t => ASKED.test(t)).length === 1 && !sy.some(t => MIS.test(t)) && (await notes()).length === nB && JSON.stringify(e.checks) === '["ask"]', 'B25·D18: one outcome in the pass — the ask, with no ⚠️ line and no note under the sheet :: ' + JSON.stringify({ sy: sy.slice(-3), e }));
    // her own sentence (tB1 c18) answers the ask; the model reports sys_fit false
    let u = await turn('سلام. خب؟', 'یک پرسش.', [cs({})]);
    chk(/\(پیش از از سر گرفتنِ گامِ منتظرِ ابزار\) «این ابزارِ تازه همان است که برای گامِ «\(۳\) پیشینه/.test(blockOf(u.user, /^# پیش‌نیاز \(/)) && nTQ(u.user) === 1, 'tB1: the turn question is the fit question (one question) :: ' + blockOf(u.user, /^# پیش‌نیاز \(/).slice(-500));
    const HER_B = 'سلام. تو «امروز» نوشته برگه جواب گرفته، ولی «بررسیِ بازار و رقیبان» که به کارِ گامِ سوم نمیاد؛ من می‌خوام ببینم کسی قبلاً همین جعبه‌قرص رو ساخته یا ثبت اختراع کرده یا نه، نه اینکه رقیبام چند می‌فروشن.';
    await turn(HER_B, 'حق با توست.', [cs({ sys_fit: { sheet: 101, fit: false, quote: '«بررسیِ بازار و رقیبان» که به کارِ گامِ سوم نمیاد' } })]);
    e = await one(101); let nt = await notes(); td = await today();
    chk(e.st === 'wait' && !e.ask && e.rej.includes('pr_market_scan') && nt.length === nB + 1 && /همان چیزی نیست/.test(nt[nt.length - 1].t) && td.some(t => /دوباره منتظرِ برگهٔ #۱۰۱ است — «بررسیِ بازار و رقیبان» همان نبود/.test(t)), 'tB1: her «به کارِ گامِ سوم نمیاد» ⇒ rejected, ⏸, note (reopened), Today «دوباره منتظر» :: ' + JSON.stringify({ e, n: nt.slice(-1), td }));
    // the loop is not dead: the real build still arrives (positive arm after the negative one)
    await adv(2); await addArea('s_problem', A_prior); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ `pr_prior_art` ساخته شد.']); await check();
    e = await one(101); td = await today();
    R7.b1pos = e.st === 'arrived' && e.tool === 'pr_prior_art' && td.some(t => /🛎 ابزارِ لازم آمد: «جست‌وجوی پیشینهٔ اختراع و محصول»/.test(t)) && !td.some(t => /دوباره منتظر/.test(t));
    chk(R7.b1pos, 'tB1z: after the rejection the fitting area «جست‌وجوی پیشینهٔ اختراع و محصول» arrives; the «دوباره منتظر» line is gone :: ' + JSON.stringify({ e, td }));

    // ---- tB1 (B25·D1, S1 second half) — after «ابزارِ لازم آمد», her «نه» was ignored and the step was «resumed» ----
    // (a) the model reports sys_fit false (tB1 p9)
    const HER_B9 = 'سلام. تو «امروز» نوشته ابزارِ لازم اومد، ولی «جست‌وجوی پیشینهٔ اختراع و محصول» که به کارِ گامِ سوم نمیاد؛ من می‌خوام ببینم کسی قبلاً همین جعبه‌قرص رو ساخته یا ثبت اختراع کرده یا نه.';
    const n1 = (await notes()).length;
    u = await turn(HER_B9, 'حق با توست؛ گام منتظر می‌ماند.', [cs({ sys_fit: { sheet: 101, fit: false, quote: 'که به کارِ گامِ سوم نمیاد' } })]);
    e = await one(101); nt = await notes(); td = await today(); sy = await sysMsgs(); let ev = await dz(pidB);
    R7.b1no = e.st === 'wait' && !e.tool && e.rej.includes('pr_prior_art') && nt.length === n1 + 1 && nt[nt.length - 1].id === 'sh101' && /همان چیزی نیست/.test(nt[nt.length - 1].t) && /به کارِ گامِ سوم نمیاد/.test(nt[nt.length - 1].t) &&
      td.some(t => /⏸ گامِ .* دوباره منتظرِ برگهٔ #۱۰۱ است/.test(t)) && !td.some(t => ARR.test(t)) && !ev.some(x => x.k === 'sysresume') && ev.some(x => x.k === 'syswait' && /به گفتهٔ خودش «جست‌وجوی پیشینهٔ اختراع و محصول» همان نبود؛ برگه دوباره باز شد/.test(x.out)) &&
      sy.some(t => /⚠️ پاسخِ آمده زیرِ برگهٔ #۱۰۱ .* \(گفتی همان نیست\).*«رسید» اعلام کرده بودم و نادرست بود.*گام دوباره منتظر می‌ماند/.test(t));
    chk(R7.b1no, 'B25·D1 tB1 s19 (S1): her rejection after «ابزارِ لازم آمد» + sys_fit false ⇒ ⏸ again (never «resumed»), the sheet gets a note (reopened), Today says «دوباره منتظر», 📜 has no «↩ … از سر گرفته شد» :: ' + JSON.stringify({ e, n: nt.slice(-1), td, ev: ev.slice(-3), sy: sy.slice(-1) }));
    const cardB = await p.evaluate((pid) => { APP.go('lprob', pid); const c = document.querySelector('.lp-syscard'); return c ? c.textContent : ''; }, pidB);
    chk(/منتظرِ برگهٔ #۱۰۱/.test(cardB) && /همان نبود — برگه دوباره باز شد/.test(cardB) && !/از سر گرفته شد ✓/.test(cardB), 'tB1 🔭: the card shows the step waiting again, not «از سر گرفته شد ✓» :: ' + cardB.slice(0, 400));
    // C5: she takes the «نه» back ⇒ arrival «تأییدِ تو», with history
    const n2 = (await notes()).length;
    await turn('ببخشید اشتباه گفتم، همونه. بریم سراغش.', 'برگردیم.', [cs({ sys_fit: { sheet: 101, fit: true, quote: 'اشتباه گفتم، همونه' } })]);
    e = await one(101); ev = await dz(pidB); nt = await notes();
    chk((e.st === 'arrived' || e.st === 'resumed') && e.tool === 'pr_prior_art' && e.how === 'ask' && !e.rej.includes('pr_prior_art') && ev.some(x => x.k === 'sysundo') && ev.some(x => x.k === 'sysmis') && nt.length === n2 + 1 && /«نه» پس گرفته شد/.test(nt[nt.length - 1].t), 'C5: a mistaken «نه» is reversible — arrival by her own word, the rejection stays in 📜, the same sheet gets a new note :: ' + JSON.stringify({ e, ev: ev.map(x => x.k), n: nt.slice(-1) }));

    // ---- oD1u (D25-21) — «هموارسازیِ نویزِ اندازه‌گیری» on «نویز، عدد، آر، پنجره»; «نه، این همون نیست» ----
    await wipe(); await fresh();
    const pidD = await bind('قرص‌دانِ هوشمند برای مادر', 'قرص‌دانی می‌سازم که با وزن بفهمد مادرم قرصش را برداشته یا نه؛ داده نویز و دریفت دارد.');
    await gapTurn('یه روشِ درست می‌خوام نه حدس … پیدا کردنِ یه پله تو سیگنالی که نویز داره و آروم هم می‌لغزه. اینجا چیزی برای این هست؟', G_oD1, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'p', stuck: true })], 101);
    await addArea('s_problem', A_smooth);
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ `pr_noise_smoothing` («هموارسازیِ نویزِ اندازه‌گیری») ساخته شد.']);
    const rkD = await rank(101, 'حوزهٔ pr_noise_smoothing («هموارسازیِ نویزِ اندازه‌گیری») ساخته شد');
    await check(); e = await one(101); sy = await sysMsgs(); td = await today();
    R7.d21 = e.st === 'wait' && !e.tool && !sy.some(t => ARR.test(t) || WEIGHED.test(t)) && !td.some(t => ARR.test(t)) && !(rkD.best.w || []).includes('آر');
    chk(R7.d21, 'D25-21 oD1u c13 (S1): «هموارسازیِ نویزِ اندازه‌گیری» is not «رسید» — «آر» is no word, «عدد» is spread, «نویز»/«پنجره» come from the sheet\'s title and margin, not from her step :: ' + JSON.stringify({ e, rkD, sy: sy.slice(-2) }));
    chk(e.ask === 'pr_noise_smoothing' && sy.filter(t => ASKED.test(t)).length === 1, 'D25-21: unsure ⇒ the page asks her :: ' + JSON.stringify(e));
    await turn('خب؟', 'یک پرسش.', [cs({})]);
    await turn('نه، این همون نیست؛ این فقط نوسان رو صاف می‌کنه، پلهٔ ماندگار رو از جهش جدا نمی‌کنه.', 'درست می‌گویی.', [cs({ sys_fit: { sheet: 101, fit: false, quote: 'نه، این همون نیست' } })]);
    e = await one(101); ev = await dz(pidD);
    chk(e.st === 'wait' && e.rej.includes('pr_noise_smoothing') && !ev.some(x => x.k === 'sysresume'), 'D25-21 oD1u c19–c22: «نه، این همون نیست» + sys_fit {fit:false} ⇒ ⏸, never «از سر گرفته شد ✓» :: ' + JSON.stringify({ e, ev: ev.map(x => x.k + '|' + x.out) }));
    await addArea('s_problem', A_change); await reply(101, ['پاسخ به برگهٔ دستیار #101 — ساخته شد: حوزهٔ تازهٔ `pr_change_detection`.']); await check(); e = await one(101);
    chk(e.st === 'arrived' && e.tool === 'pr_change_detection', 'oD1: the real build (words of her own step: «پله»، «جهش») still arrives :: ' + JSON.stringify(e));

    // ---- tB1y (B25·D18) — the ask and a mismatch note in the same pass ----
    await wipe(); await fresh();
    await bind('جعبه‌قرصِ هوشمند', 'یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه.');
    await gapTurn('چطوری بفهمم کسی قبلاً همین رو ساخته؟', G_tB1, 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'p' })], 101);
    await addArea('s_problem', A_hist); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ `pr_tech_history` («سرگذشتِ فناوری‌ها») ساخته شد.']);
    const nY = (await notes()).length; await check(); await check();
    e = await one(101); sy = await sysMsgs();
    R7.d18 = e.st === 'wait' && e.ask === 'pr_tech_history' && JSON.stringify(e.checks) === '["ask"]' && (await notes()).length === nY && sy.filter(t => ASKED.test(t)).length === 1 && !sy.some(t => MIS.test(t));
    chk(R7.d18, 'B25·D18 tB1y: the page asks («❓ … مطمئن نیستم …») and does NOT also write «⚠️ … جواب نداد — زیرِ برگه نوشتم و دوباره باز شد» in the same pass (twice swept) :: ' + JSON.stringify({ e, sy: sy.slice(-3) }));
    await turn('خب؟', 'یک پرسش.', [cs({})]);
    await turn('نه، این تاریخچه‌ی فناوریه؛ من دنبالِ اینم که ببینم کسی همین رو ساخته یا نه.', 'باشه.', [cs({})]);
    e = await one(101); sy = await sysMsgs();
    chk(e.st === 'wait' && !e.ask && e.rej.includes('pr_tech_history') && (await notes()).length === nY + 1 && sy.filter(t => MIS.test(t)).length === 1, 'tB1y: the note and the reopening come only after her «نه» — once :: ' + JSON.stringify({ e, sy: sy.slice(-2) }));
    await check(); await check(); sy = await sysMsgs();
    chk(sy.filter(t => MIS.test(t)).length === 1 && (await notes()).length === nY + 1, 'tB1y: the already-answered reply is not judged again :: ' + JSON.stringify(sy.slice(-3)));

    // ---- tB1 s14–s16 (B25·D18) — the ⚠️ line was word-for-word the same each time ----
    await wipe(); await fresh();
    await bind('جعبه‌قرصِ هوشمند', 'یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه.');
    await gapTurn('چطوری بفهمم کسی قبلاً همین رو ساخته؟', G_tB1, 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'p' })], 101);
    await adv(1); await reply(101, ['پاسخ به برگهٔ دستیار #101 — نمای `mind` به‌روز شد.']); await check();
    await adv(1); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ `pr_hypothesis_testing` برای جست‌وجوی پیشینهٔ اختراع کامل‌تر شد.']); await check();
    await adv(1); await reply(101, ['پاسخ به برگهٔ دستیار #101 — یک ابزارِ تازه برای تغییر در مسئله‌ها ساخته شد.']); await check();
    e = await one(101); sy = (await sysMsgs()).filter(t => MIS.test(t));
    R7.lines = sy.length === 3 && new Set(sy).size === 3 && /آنچه آمد «[^»]*کارنامهٔ ذهن»/.test(sy[0]) && /که خودِ برگه از اول کنار گذاشته بود/.test(sy[1]) && /جواب هیچ نما یا حوزه‌ای را که برای این گام ساخته شده باشد نام نبرد/.test(sy[2]);
    chk(e.st === 'wait' && R7.lines, 'B25·D18 tB1 s14–s16: three unfit replies ⇒ three ⚠️ lines, each with what came THAT time and why (never identical) :: ' + JSON.stringify(sy));
    // ---- C25-19 / B_s D15 — the lag wording for a reply that names nothing ----
    R7.lag = !(await sysMsgs()).some(t => LAG.test(t)) && !e.checks.includes('lag');
    chk(R7.lag, 'C25-19 pwC1 day 3: «یک ابزارِ تازه برای تغییر در مسئله‌ها…» gets no «⏳ … ساخته‌اش هنوز دیده نمی‌شود — شاید نسخهٔ تازه منتشر نشده» :: ' + JSON.stringify({ e, sy: (await sysMsgs()).slice(-2) }));

    // ---- tB1d (B_s D14) — the ask for one and «ابزارِ لازم آمد» for its equal rival ----
    await wipe(); await fresh();
    await bind('جعبه‌قرصِ هوشمند', 'یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه.');
    await gapTurn('چطوری بفهمم کسی قبلاً همین رو ساخته؟', G_tB1, 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'p' })], 101);
    await addArea('s_problem', { id: 'pr_prior_a', fa: 'پیشینهٔ اختراع در پایگاه‌ها', desc_fa: 'جست‌وجوی پیشینهٔ اختراع' });
    await addArea('s_problem', { id: 'pr_prior_b', fa: 'پیشینهٔ اختراع و محصول در بازار', desc_fa: 'جست‌وجوی پیشینهٔ اختراع' });
    await check(); await p.evaluate(() => APP.dueList()); await check();
    u = await turn('خب؟', 'یک پرسش.', [cs({})]);
    e = await one(101); sy = await sysMsgs(); td = await today();
    R7.tie = e.st === 'wait' && !!e.ask && !e.tool && !sy.some(t => ARR.test(t)) && !td.some(t => ARR.test(t)) && sy.filter(t => ASKED.test(t)).length === 1 && /هم‌امتیاز با «/.test(sy.filter(t => ASKED.test(t))[0]);
    chk(R7.tie, 'B_s D14 tB1d: two equal areas ⇒ ONE outcome — the page asks (naming the rival), never «تا آن وقت گام منتظر می‌ماند» and «ابزارِ لازم آمد» together (two sweeps, Today and a prompt later) :: ' + JSON.stringify({ e, sy: sy.slice(-3), td }));
    const first = e.ask, other = first === 'pr_prior_a' ? 'pr_prior_b' : 'pr_prior_a';
    await turn('نه، اون یکی', 'باشه.', [cs({})]);
    e = await one(101); sy = await sysMsgs();
    chk(e.st === 'wait' && e.ask === other && !sy.some(t => ARR.test(t)), 'tB1d: after her «نه» the equal rival is ASKED, not declared (it scored no better than what she rejected) :: ' + JSON.stringify(e));
    await turn('خب؟', 'یک پرسش.', [cs({})]);
    await turn('آره همینه', 'برگردیم.', [cs({})]);
    e = await one(101); chk((e.st === 'arrived' || e.st === 'resumed') && e.tool === other && e.how === 'ask', 'tB1d: her «آره» ⇒ arrival by her own word :: ' + JSON.stringify(e));

    // ---- tB1 📜 (B25·D19) — two «⏸ منتظرِ برگهٔ #۱۰۱» rows after the chat problem became a live one ----
    await wipe(); await fresh();
    await turn('سلام. می‌خوام یه جعبه‌قرص بسازم که با وزن بفهمه مادرم قرصش رو برداشته یا نه. دقتِ ترازو ۰.۱ گرمه و هر قرص ۰.۳ گرم. چطوری بفهمم برداشته؟', 'کل در یک جمله؟', [cs({ ph: 'u', said: ['d'], nat: 'practical' })]);
    await gapTurn('چطوری بفهمم کسی قبلاً همین جعبه‌قرص رو ساخته یا ثبت اختراع کرده؟ اینجا روشی براش هست؟', G_tB1, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'p' })], 101);
    e = await one(101);
    if (!e) { chk(false, 'B25·D19 fixture: the chat problem holds the waiting entry :: ' + JSON.stringify(await sysAll())); }
    else {
      await turn('این جعبه‌قرص رو به‌عنوانِ مسئله‌ی خودم ثبت کن که مرحله‌هاش و وضعش جلوی چشمم باشه.', 'ساختم.', [{ do: 'live_new', title: 'جعبه‌قرصِ هوشمند', statement: 'می‌خوام یه جعبه‌قرص بسازم که با وزن بفهمه مادرم قرصش رو برداشته یا نه. دقتِ ترازو ۰.۱ گرمه و هر قرص ۰.۳ گرم.', nat: 'practical' }, cs({ ph: 'p' })]);
      const pidL = await p.evaluate(() => __cur().lprob || '');
      chk(!!pidL && (await sysAll()).length === 1, 'B25·D19 fixture: the entry followed the chat problem to the live one :: ' + JSON.stringify({ pidL, A: await sysAll() }));
      await reply(101, ['پاسخ به برگهٔ دستیار #101 — نمای `mind` به‌روز شد.']); await check();
      await addArea('s_problem', A_prior); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ `pr_prior_art` ساخته شد.']); await check();
      ev = await dz(pidL); const rt = await p.evaluate((pid) => { const M = APP.ROUTE.model(pid); return { dets: (M.dets || []).filter(d => d.kind === 'sys').length, waits: (M.pts || []).filter(x => x.k === 'syswait').length }; }, pidL);
      e = await one(101);
      R7.d19 = ev.filter(x => x.k === 'syswait').length === 1 && /^رسید/.test(ev.filter(x => x.k === 'syswait')[0].out) && rt.dets === 1 && rt.waits === 1 && e.st === 'arrived';
      chk(R7.d19, 'B25·D19 tB1: ONE «⏸ منتظرِ برگهٔ #۱۰۱» row in 📜 (its outcome «رسید»), one detour in 🧭 — not «رسید» and «منتظر» side by side :: ' + JSON.stringify({ ev, rt, e }));
    }

    // ---- tA1 p18 (A25-22) — a piece brought after closure ----
    await wipe(); await fresh();
    const pidA = await bind('کیتِ آبیاریِ خورشیدی', 'برای باغچهٔ پدر و مادرم کیتِ آبیاریِ قطره‌ایِ خورشیدی می‌سازم.');
    await turn('آبِ روزانه رو با داده حساب کردم؛ مخزن ۳۰۰ لیتری بسه.', 'خوب.', [cs({ ph: 'c', said: ['result'], result: 'مخزن ۳۰۰ لیتری' })]);
    await p.evaluate((pid) => __liveSet(pid, (so, L) => { L.state = 'solved'; }), pidA);
    const scN = await p.evaluate(() => !!APP.PRE.scope(__cur()));
    const G_late = { title: 'نگه‌داریِ زمستانیِ باتریِ سرب‌اسیدی', area: 'sys-territory', kind: 'build', step: '۷ نگه‌داریِ زمستانیِ باتری', abstract: 'کاربر می‌خواهد بداند باتری را در زمستان چطور نگه دارد.', missing: 'حوزه‌ای برای نگه‌داریِ زمستانیِ باتری (یخ‌زدگی، شارژِ نگه‌دارنده) نیست.', where: 'قلمروِ سامانه‌ها', how: 'حوزهٔ تازه', why_not: 'lla-page: نما خراب نیست.', evidence: 'حوزه‌ای برای باتری نیست.', confidence: 0.85 };
    u = await gapTurn('یه تکهٔ تازه هم هست: «۷ نگه‌داریِ زمستانیِ باتری». برای این اینجا چیزی هست؟', G_late, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({})], 103);
    e = await one(103); sy = await sysMsgs();
    const stA = await p.evaluate((pid) => (APP.S.get('eprog_' + pid).solve.live || {}).state, pidA);
    R7.late = !!e && e.st === 'wait' && e.late && e.step === '۷ نگه‌داریِ زمستانیِ باتری' && sy.some(t => /⏸ تکهٔ تازهٔ «۷ نگه‌داریِ زمستانیِ باتری» منتظرِ برگهٔ #۱۰۳ ماند — مسئلهٔ «کیتِ آبیاریِ خورشیدی» بسته است و بسته می‌ماند/.test(t)) && stA === 'solved';
    chk(R7.late, 'A25-22 tA1 p18: the piece brought after closure («۷ نگه‌داریِ زمستانیِ باتری», sheet #103) gets its own ⏸ entry and a page line; the problem stays closed (scope was ' + scN + ') :: ' + JSON.stringify({ e, sy: sy.slice(-1), stA }));
    await check(); e = await one(103); chk(e && e.st === 'wait', 'A25-22: the late entry is not «مسئله بسته شد» :: ' + JSON.stringify(e));
    const cardA = await p.evaluate((pid) => { APP.go('lprob', pid); const c = document.querySelector('.lp-syscard'); return c ? c.textContent : ''; }, pidA);
    chk(/«۷ نگه‌داریِ زمستانیِ باتری» — منتظرِ برگهٔ #۱۰۳/.test(cardA), 'A25-22: 🔭 shows where the late piece waits :: ' + cardA.slice(0, 300));
    await addArea('s_problem', { id: 'pr_battery_winter', fa: 'نگه‌داریِ زمستانیِ باتری', desc_fa: 'یخ‌زدگی و شارژِ نگه‌دارندهٔ باتری در زمستان' });
    await reply(103, ['پاسخ به برگهٔ دستیار #103 — حوزهٔ `pr_battery_winter` ساخته شد.']); await check();
    e = await one(103); td = await today();
    u = await turn('سلام، خبری شد؟', 'بله.', [cs({})]);
    R7.lateArr = e.st === 'arrived' && e.tool === 'pr_battery_winter' && td.some(t => /🛎 ابزارِ لازم آمد: «نگه‌داریِ زمستانیِ باتری»/.test(t)) && /\(از سر گرفتنِ گامِ منتظرِ ابزار\) ابزارِ «نگه‌داریِ زمستانیِ باتری» برای گامِ «۷ نگه‌داریِ زمستانیِ باتری» آمد/.test(head(u.user));
    chk(R7.lateArr, 'A25-22: the loop works for the late piece — arrival, Today 🛎, and the resume question in the next prompt :: ' + JSON.stringify({ e, td, pr: head(u.user).split('\n').filter(l => /تکهٔ منتظرِ ابزار|از سر گرفتن/.test(l)).join(' ⏎ ').slice(0, 600) }));
  });

  // ================= arms: the negative arms of the waiting loop next to the positive ones =================
  await section('arms', async () => {
    // (1) after an arrival: what is NOT a rejection of the fit
    const base = async () => { await openPh(); const e = await arrivePh(); chk(e && e.st === 'arrived' && e.tool === 'sc_partner_readiness', 'arms fixture: clear arrival :: ' + JSON.stringify(e)); };
    for (const [msg, act, why] of [
      ['نه هنوز وقت نکردم نگاهش کنم', null, '«نه» about her time'],
      ['نمی‌دونم چطوری باهاش کار کنم', null, 'stuck on using the tool'],
      ['این همون نیست؟', { sheet: 101, fit: false, quote: 'این همون نیست؟' }, 'a question, even when the model reports fit:false'],
      ['باشه ببینمش', { sheet: 101, fit: false, quote: 'به کارم نمیاد' }, 'a quote that is not in her message'],
      ['اگه به کارم نیاد چی؟', null, 'a hypothetical'],
      ['آره خوبه، بریم', { sheet: 101, fit: true, quote: 'آره خوبه' }, 'a yes after an arrival changes nothing'],
    ]) {
      await base(); const n0 = (await notes()).length;
      await turn(msg, 'باشه.', [cs(act ? { sys_fit: act } : {})]);
      const e = await one(101), td = await today();
      chk((e.st === 'arrived' || e.st === 'resumed') && e.tool === 'sc_partner_readiness' && (await notes()).length === n0 && !td.some(t => /دوباره منتظر/.test(t)), 'arms: «' + msg + '» (' + why + ') does not send the step back to waiting :: ' + JSON.stringify({ e, td }));
    }
    // (2) after an arrival: the page reads the rejection itself when the model reports nothing
    for (const msg of ['نه، این همون نیست؛ با این نمیشه فهمید همکاری می‌کنن یا نه.', 'این ربطی به گامِ من نداره.', 'خیر، این آن چیزی نیست که لازم داشتم.', 'این جوابِ گامِ منو نمیده']) {
      await base(); const n0 = (await notes()).length;
      const u = await turn(msg, 'باشه.', [cs({})]);
      const e = await one(101), td = await today();
      chk(e.st === 'wait' && !e.tool && (await notes()).length === n0 + 1 && td.some(t => /دوباره منتظرِ برگهٔ #۱۰۱ است/.test(t)) && /همین حالا گفت ابزارِ «سنجشِ آمادگیِ همکاریِ فروشندگان» همان نیست/.test(head(u.user)) && !/\(از سر گرفتنِ گامِ منتظرِ ابزار\)/.test(head(u.user)), 'arms: «' + msg + '» with no model report ⇒ the page itself puts the step back to ⏸ and tells the coach :: ' + JSON.stringify({ e, td }));
    }
    // (3) after a resume: a later «نه» to a coaching question is not a rejection; a later named rejection is
    await base(); await turn('باشه بریم', 'با این ابزار اول فهرستِ داروخانه‌ها را می‌نویسی؟', [cs({})]);
    let e = await one(101); chk(e.st === 'resumed', 'arms: resumed :: ' + JSON.stringify(e));
    await turn('نه، اول با یکی‌شون حرف می‌زنم', 'خوب.', [cs({})]);
    e = await one(101); chk(e.st === 'resumed', 'arms: «نه، اول با یکی‌شون حرف می‌زنم» answers the coach ⇒ still resumed :: ' + JSON.stringify(e));
    await turn('این ربطی به کارِ من نداره', 'چه چیزی؟', [cs({})]);
    e = await one(101); chk(e.st === 'resumed', 'arms: after a resume an unnamed «ربطی نداره» is not read as a rejection of the tool :: ' + JSON.stringify(e));
    await turn('راستش «سنجشِ آمادگیِ همکاریِ فروشندگان» به کارِ گامِ چهار نمیاد.', 'باشه.', [cs({})]);
    e = await one(101); chk(e.st === 'wait' && e.rej.includes('sc_partner_readiness'), 'arms: after a resume, a rejection that NAMES the tool puts the step back to ⏸ :: ' + JSON.stringify(e));
    // (4) the registry alone: an unrelated build never bothers her; a low-weight overlap without a reply stays silent
    await openPh();
    await addArea('s_decision', { id: 'dc_numbers_zz', fa: 'کار با عدد و داده و اندازه', desc_fa: 'خواندنِ عدد و داده' });
    await addArea('s_mind', { id: 'md_sleep_zz', fa: 'خواب و بیداری', desc_fa: 'چرخهٔ خواب' });
    await check(); await p.evaluate(() => APP.dueList());
    e = await one(101); let sy = await sysMsgs(), td = await today();
    chk(e.st === 'wait' && !e.ask && !e.tool && e.checks.length === 0 && !td.length && !sy.some(t => ASKED.test(t) || ARR.test(t) || MIS.test(t)), 'arms: registry changes that are not about her step make no question, no arrival, no line :: ' + JSON.stringify({ e, td }));
    // (5) ask pending: a decline still closes; an unanswered ask is not repeated as a second ask
    await openPh(); await addArea('s_decision', { id: 'dc_numbers_zz', fa: 'همکاری در کار با عدد', desc_fa: 'عدد و داده' });
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ `dc_numbers_zz` افزوده شد.']); await check(); await check(); await check();
    e = await one(101); sy = await sysMsgs();
    chk(e.st === 'wait' && e.ask === 'dc_numbers_zz' && sy.filter(t => ASKED.test(t)).length === 1, 'arms: one ask, not repeated by later sweeps :: ' + JSON.stringify({ e, sy: sy.slice(-2) }));
    // (6) sys_done still closes a waiting step while an ask is pending (R24 behaviour kept)
    await turn('خودم یه راه دیگه پیدا کردم: با سه تا داروخانه حرف زدم و قبول کردن؛ دیگه لازم نیست.', 'عالی.', [cs({ sys_done: { sheet: 101, quote: 'خودم یه راه دیگه پیدا کردم' } })]);
    e = await one(101); td = await today();
    chk(e.st === 'other' && !e.ask && !td.length, 'arms: «خودم یه راه دیگه پیدا کردم … دیگه لازم نیست» closes the wait (and the pending ask) :: ' + JSON.stringify({ e, td }));
  });

  // ================= bank: every P3 entry of VARIANTS_R25 =================
  await section('bank', async () => {
    let e, sy, td, u, nt, n0, ev;
    // #107 — the only shared word comes from a view name in the sheet's own framing ⇒ ask
    await openPh(); await addArea('s_decision', { id: 'dc_build_cost_zz', fa: 'برآوردِ هزینهٔ ساخت', desc_fa: 'برآوردِ هزینهٔ مواد و دستمزد' });
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ تازهٔ «برآوردِ هزینهٔ ساخت» افزوده شد.']); await check();
    e = await one(101); sy = await sysMsgs(); u = await turn('خب؟', 'یک پرسش.', [cs({})]);
    T(107, e.st === 'wait' && e.ask === 'dc_build_cost_zz' && !sy.some(t => ARR.test(t) || WEIGHED.test(t)) && /«این ابزارِ تازه همان است که برای گامِ «۴ — آیا داروخانه‌های محل حاضرند همکاری کنند؟» لازم بود؟»/.test(head(u.user)), { e, sy: sy.slice(-2) });
    // #116 — while the ask is pending, no mismatch note and no reopening
    n0 = (await notes()).length; await check(); await check(); sy = await sysMsgs();
    T(116, (await notes()).length === n0 && !sy.some(t => MIS.test(t)) && (await one(101)).ask === 'dc_build_cost_zz', { sy: sy.slice(-3) });
    // #112 — her «نه» after an ask
    await turn('نه', 'باشه.', [cs({})]);
    e = await one(101); nt = await notes(); td = await today(); ev = await p.evaluate(() => APP.dossier(APP.PRE.sysAll()[0].sc.pid).events.filter(x => /^sys/.test(x.k)).map(x => x.k));
    T(112, e.st === 'wait' && !e.ask && nt.length === n0 + 1 && /همان چیزی نیست/.test(nt[nt.length - 1].t) && td.some(t => /منتظرِ برگهٔ #۱۰۱/.test(t)) && !td.some(t => ARR.test(t)) && !ev.includes('sysresume'), { e, td, ev });
    // #123 — taking back a mistaken «نه» (the page reads it; no model report)
    n0 = (await notes()).length;
    await turn('ببخشید اشتباه گفتم، همونه. بریم سراغش.', 'برگردیم.', [cs({})]);
    e = await one(101); nt = await notes(); ev = await dz(await p.evaluate(() => APP.PRE.sysAll()[0].sc.pid));
    T(123, (e.st === 'arrived' || e.st === 'resumed') && e.tool === 'dc_build_cost_zz' && e.how === 'ask' && ev.some(x => x.k === 'syswait' && /^رسید \(تأییدِ تو\)/.test(x.out)) && nt.length === n0 + 1 && nt[nt.length - 1].id === 'sh101' && /پس گرفته شد/.test(nt[nt.length - 1].t) && Object.keys(await p.evaluate(() => __filed)).length === 1, { e, ev: ev.map(x => x.k + '|' + x.out), n: nt.slice(-1) });

    // #108 — sheet-title scaffolding «دستیار، کمبود، سامانه، ابزار»
    await openPh(); await p.evaluate(() => { const x = APP.PRE.sysAll()[0]; x.e.title = '[دستیار · کمبودِ سامانه] ابزارِ سنجشِ همکاریِ فروشنده‌ها'; APP.S.put(APP.S.get('eprog_' + x.sc.pid)); });
    await p.evaluate(() => { const x = APP.PRE.sysAll()[0], pg = APP.S.get('eprog_' + x.sc.pid); pg.solve.live.pre22.sys[0].title = '[دستیار · کمبودِ سامانه] ابزارِ سنجشِ همکاریِ فروشنده‌ها'; APP.S.put(pg); });
    await addArea('s_self', { id: 'sf_assist_gaps_zz', fa: 'رفعِ کمبودهای دستیار', desc_fa: 'ابزارِ تازهٔ دستیار برای کمبودهای سامانه' });
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — یک ابزارِ تازهٔ دستیار برای کمبودهای سامانه ساخته شد.']); await check();
    e = await one(101); sy = await sysMsgs(); const o108 = [sy.some(t => ASKED.test(t)), sy.some(t => MIS.test(t))];
    T(108, e.st === 'wait' && !e.tool && !sy.some(t => ARR.test(t)) && (o108[0] ? 1 : 0) + (o108[1] ? 1 : 0) === 1, { e, sy: sy.slice(-2), title: await p.evaluate(() => APP.PRE.sysAll()[0].e.title) });

    // #109 — «آر» fragment; elder, «شما»
    await wipe(); await fresh(); await p.evaluate(() => { const s = __cur(); s.coach = s.coach || {}; s.coach.reg = 'shoma'; APP.S.put(s); });
    await bind('نانِ خانگی برای مهمانی', 'می‌خواهم برای ۴۰ نفر نان بپزم.');
    await gapTurn('برای ۴۰ نان چقدر آرد اندازه کنم؟ این‌جا چیزی برای این هست؟', { title: 'تناسبِ مواد در پختِ نان', area: 'sys-territory', kind: 'build', step: '۳ — برای ۴۰ نان چقدر آرد اندازه کنم؟', abstract: 'تناسبِ مواد برای شمارِ بیشتر', missing: 'حوزه‌ای برای تناسبِ موادِ پخت نیست.', where: 'قلمرو', how: 'حوزه', why_not: 'lla-page: نما خراب نیست.', confidence: 0.85 }, 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'p' })], 101);
    await addArea('s_learn', { id: 'ln_measure_archive_zz', fa: 'آرشیوِ اندازه‌گیری‌ها', desc_fa: 'بایگانیِ اندازه‌گیری‌های پیشین' });
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «آرشیوِ اندازه‌گیری‌ها» افزوده شد.']);
    const rk109 = await rank(101); await check(); e = await one(101); sy = await sysMsgs();
    const l109 = sy.filter(t => ASKED.test(t) || MIS.test(t));
    T(109, e.st === 'wait' && !e.tool && !sy.some(t => ARR.test(t)) && l109.length === 1 && !/(?:^|[\s«(])(?:تو|گفتی|خودت|می‌پرسم از تو)(?=[\s»).،]|$)/.test(l109[0]) && !(rk109.best && (rk109.best.w || []).includes('آر')), { e, l109, rk109 });

    // #110 — «عدد، داده، اندازه» are generic ⇒ ask
    await wipe(); await fresh(); await bind('فروشِ مغازه', 'می‌خواهم روندِ فروشِ مغازه را ببینم.');
    await gapTurn('چند عدد از دادهٔ فروش برای دیدنِ روند بس است؟ اینجا چیزی هست؟', { title: 'شمارِ دادهٔ لازم برای دیدنِ روند', area: 'sys-territory', kind: 'build', step: '۲ — چند عدد از دادهٔ فروش برای دیدنِ روند بس است؟', abstract: 'اندازهٔ نمونه برای روند', missing: 'حوزه‌ای برای اندازهٔ نمونهٔ روند نیست.', where: 'قلمرو', how: 'حوزه', why_not: 'lla-page: نما خراب نیست.', confidence: 0.85 }, 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'p' })], 101);
    await addArea('s_learn', { id: 'ln_numbers_zz', fa: 'کار با عدد و داده و اندازه', desc_fa: 'خواندنِ عدد و داده' });
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «کار با عدد و داده و اندازه» افزوده شد.']); await check();
    e = await one(101); sy = await sysMsgs();
    T(110, e.st === 'wait' && e.ask === 'ln_numbers_zz' && !sy.some(t => ARR.test(t)), { e, rk: await rank(101) });

    // #124 — a clear fit on the step's own word ⇒ arrival without asking
    await openPh(); e = await arrivePh(); sy = await sysMsgs(); td = await today();
    T(124, e.st === 'arrived' && e.tool === 'sc_partner_readiness' && !sy.some(t => ASKED.test(t)) && td.some(t => ARR.test(t)), { e, rk: await p.evaluate(() => { const x = APP.PRE.sysAll()[0]; return APP.PRE.sysRank(Object.assign({}, x.e, { rejected: [] }), APP.PRE.regDiff(x.e.fp)); }) });
    R7.arr = e.st === 'arrived';
    // #111 — «نه، این همون نیست» after the declared arrival; the model reports sys_fit false
    n0 = (await notes()).length;
    await turn('نه، این همون نیست؛ با این نمیشه فهمید همکاری می‌کنن یا نه.', 'حق با توست.', [cs({ sys_fit: { sheet: 101, fit: false, quote: 'نه، این همون نیست' } })]);
    e = await one(101); nt = await notes(); td = await today(); ev = await dz(await p.evaluate(() => APP.PRE.sysAll()[0].sc.pid));
    T(111, e.st === 'wait' && !e.tool && nt.length === n0 + 1 && nt[nt.length - 1].id === 'sh101' && /نه، این همون نیست/.test(nt[nt.length - 1].t) && td.some(t => /⏸ .*منتظرِ برگهٔ #۱۰۱/.test(t)) && !td.some(t => ARR.test(t)) && !ev.some(x => x.k === 'sysresume') && ev.some(x => x.k === 'syswait' && /به گفتهٔ خودش .* همان نبود؛ برگه دوباره باز شد/.test(x.out)), { e, td, ev: ev.map(x => x.k + '|' + x.out), n: nt.slice(-1) });
    // #113 — rejection by meaning (no «نه», no «همون نیست»): the model reports it, the page validates the quote
    await openPh(); await addArea('s_decision', { id: 'dc_wholesale_zz', fa: 'بررسیِ قیمتِ عمده و همکاریِ داروخانه‌ها', desc_fa: 'قیمتِ عمدهٔ داروخانه‌های همکار' });
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ `dc_wholesale_zz` افزوده شد.']); await check(); e = await one(101);
    chk(e.st === 'arrived', 'bank#113 fixture: arrival declared :: ' + JSON.stringify(e));
    n0 = (await notes()).length;
    await turn('این که ابزارِ قیمته، من دنبالِ اینم که اصلاً قبول می‌کنن یا نه', 'درست می‌گویی.', [cs({ sys_fit: { sheet: 101, fit: false, quote: 'این که ابزارِ قیمته، من دنبالِ اینم که اصلاً قبول می‌کنن یا نه' } })]);
    e = await one(101); td = await today(); nt = await notes();
    T(113, e.st === 'wait' && !e.tool && nt.length === n0 + 1 && td.some(t => /منتظرِ برگهٔ #۱۰۱/.test(t)) && !td.some(t => ARR.test(t)), { e, td });
    // #114 — elder, «شما»
    await openPh(); await p.evaluate(() => { const s = __cur(); s.coach = s.coach || {}; s.coach.reg = 'shoma'; APP.S.put(s); }); await arrivePh();
    await turn('خیر، این آن چیزی نیست که لازم داشتم. لطفاً دوباره پیگیری بفرمایید.', 'چشم.', [cs({})]);
    e = await one(101); sy = await sysMsgs(); td = await today(); const l114 = sy[sy.length - 1] || '';
    T(114, e.st === 'wait' && /گفتید همان نیست/.test(l114) && /گام دوباره منتظر می‌ماند/.test(l114) && /زیرِ برگه نوشتم/.test(l114) && !/گفتی(?!د)/.test(l114) && td.some(t => /به گفتهٔ خودتان/.test(t)), { e, l114, td });

    // #115 — a tie ⇒ exactly one outcome: the ask
    await openPh(); await addArea('s_social', { id: 'sc_tie_a_zz', fa: 'همکاریِ داروخانه‌ها با پخش', desc_fa: 'همکاری' }); await addArea('s_social', { id: 'sc_tie_b_zz', fa: 'همکاریِ داروخانه‌ها با پیک', desc_fa: 'همکاری' });
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — دو حوزهٔ `sc_tie_a_zz` و `sc_tie_b_zz` افزوده شد.']); await check(); await p.evaluate(() => APP.dueList()); await check();
    e = await one(101); sy = await sysMsgs(); td = await today();
    T(115, e.st === 'wait' && !!e.ask && !e.tool && sy.filter(t => ASKED.test(t)).length === 1 && /هم‌امتیاز با «همکاریِ داروخانه‌ها با/.test(sy.filter(t => ASKED.test(t))[0]) && !sy.some(t => ARR.test(t) || MIS.test(t)) && !td.some(t => ARR.test(t)), { e, sy: sy.slice(-2), td });

    // #117 — a generic reply that names nothing, no registry change (C4)
    await openPh(); await reply(101, ['پاسخ به برگهٔ دستیار #101 — یه چیزِ تازه برای بهتر شدنِ کارِ مسئله‌ها اضافه کردیم.']); n0 = (await notes()).length; await check();
    e = await one(101); sy = await sysMsgs(); const l117 = sy[sy.length - 1] || '';
    T(117, e.st === 'wait' && !e.tool && !sy.some(t => LAG.test(t) || /هنوز در سامانه دیده نمی‌شود|منتشر نشده/.test(t)) && /جواب هیچ نما یا حوزه‌ای را که برای این گام ساخته شده باشد نام نبرد/.test(l117) && /منتظر می‌ماند/.test(l117) && (await notes()).length === n0 + 1, { e, l117 });
    // #118 / #136 — a reply naming only the ruled-out area
    await openPh(); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ `dc_risk_uncertainty` برای همکاریِ فروشنده‌ها کامل‌تر و ساخته شد.']); n0 = (await notes()).length; await check();
    e = await one(101); sy = await sysMsgs(); const l118 = sy[sy.length - 1] || '';
    T(118, e.st === 'wait' && !sy.some(t => LAG.test(t)) && MIS.test(l118) && /که خودِ برگه از اول کنار گذاشته بود/.test(l118) && (await notes()).length === n0 + 1, { e, l118 });
    T(136, e.st === 'wait' && !e.ask && JSON.stringify(e.checks) === '["mis"]' && !sy.some(t => ASKED.test(t)), { e });
    // #119 — two different unfit replies on consecutive days
    await adv(1); await reply(101, ['پاسخ به برگهٔ دستیار #101 — نمای `mind` به‌روز شد.']); await check();
    sy = (await sysMsgs()).filter(t => MIS.test(t));
    T(119, sy.length === 2 && sy[0] !== sy[1] && /کنار گذاشته بود/.test(sy[0]) && /کارنامهٔ ذهن/.test(sy[1]), sy);
    // #137 — a reply naming a SPECIFIC build not yet published ⇒ the lag line is right; the next registry change is checked
    await openPh(); await reply(101, ['پاسخ به برگهٔ #۱۰۱ — پاسخ به برگهٔ دستیار #101 — حوزهٔ `sc_partner_readiness` ساخته شد و در نسخهٔ بعدی می‌آید.']); n0 = (await notes()).length; await check(); await check();
    e = await one(101); sy = await sysMsgs(); const l137 = sy.filter(t => LAG.test(t));
    R7.lagOk = e.st === 'wait' && l137.length === 1 && /«sc_partner_readiness»/.test(l137[0]) && /هنوز در این نسخهٔ صفحه دیده نمی‌شود — شاید نسخهٔ تازه هنوز منتشر نشده/.test(l137[0]) && /منتظر می‌ماند/.test(l137[0]) && !sy.some(t => ARR.test(t) || MIS.test(t)) && (await notes()).length === n0;
    await addArea('s_social', A_partner); await check(); e = await one(101);
    T(137, R7.lagOk && e.st === 'arrived' && e.tool === 'sc_partner_readiness', { e, l137 });
    // #125 — arrival by id from the reply
    await openPh(); await addArea('s_social', A_partner); await reply(101, ['پاسخ به برگهٔ #101 — پاسخ به برگهٔ دستیار #101 — حوزهٔ `sc_partner_readiness` افزوده شد.']); await check();
    e = await one(101); sy = await sysMsgs();
    T(125, e.st === 'arrived' && e.tool === 'sc_partner_readiness' && !sy.some(t => ASKED.test(t)), { e });
    // #131 is the «آره» arm (below); #126 / #127 / #128 — «نه» that is not about the fit
    u = await turn('باشه', 'با این ابزار اول فهرستِ داروخانه‌ها را می‌نویسی؟', [cs({})]); n0 = (await notes()).length;
    await turn('نه، اول با یکی‌شون حرف می‌زنم', 'خوب.', [cs({})]); e = await one(101);
    T(126, e.st === 'resumed' && e.tool === 'sc_partner_readiness' && (await notes()).length === n0, { e });
    await openPh(); await arrivePh(); n0 = (await notes()).length;
    u = await turn('نه هنوز وقت نکردم نگاهش کنم', 'باشه؛ هر وقت دیدی بگو.', [cs({})]); e = await one(101);
    T(127, (e.st === 'arrived' || e.st === 'resumed') && e.tool === 'sc_partner_readiness' && (await notes()).length === n0 && /\(از سر گرفتنِ گامِ منتظرِ ابزار\)/.test(head(u.user)), { e });
    await openPh(); await arrivePh(); n0 = (await notes()).length;
    await turn('نمی‌دونم چطوری باهاش کار کنم', 'اول کدام بخشش را باز کردی؟', [cs({})]); e = await one(101);
    T(128, (e.st === 'arrived' || e.st === 'resumed') && e.tool === 'sc_partner_readiness' && (await notes()).length === n0, { e });

    // #129 — «آب» is a whole two-letter word
    await wipe(); await fresh(); await bind('قبضِ آب', 'می‌خواهم قبضِ آبِ خانه را کم کنم.');
    await gapTurn('مصرفِ آبِ ماهانه‌مان چقدر است؟ برای حسابش اینجا چیزی هست؟', { title: 'حسابِ مصرفِ آبِ خانه', area: 'sys-territory', kind: 'build', step: '۲ — مصرفِ آبِ ماهانه‌مان چقدر است؟', abstract: 'حسابِ مصرف از روی کنتور', missing: 'حوزه‌ای برای حسابِ مصرفِ آب نیست.', where: 'قلمرو', how: 'حوزه', why_not: 'lla-page: نما خراب نیست.', confidence: 0.85 }, 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'p' })], 101);
    await addArea('s_decision', { id: 'dc_water_use_zz', fa: 'حسابِ مصرفِ آبِ خانگی', desc_fa: 'خواندنِ کنتور و حسابِ مصرفِ آب' });
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «حسابِ مصرفِ آبِ خانگی» افزوده شد.']); const rk129 = await rank(101); await check(); e = await one(101);
    T(129, e.st === 'arrived' && e.tool === 'dc_water_use_zz' && (rk129.best.s || []).includes('آب'), { e, rk129 });

    // #130 — a word both in a view name and in HER step
    await wipe(); await fresh(); await bind('محصولِ تازه', 'می‌خواهم بدانم محصولم کجای بازار می‌ایستد.');
    await gapTurn('جایگاهِ محصول بینِ رقیبان رو چطوری پیدا کنم؟', { title: 'جایگاهِ محصول بینِ رقیبان', area: 'sys-territory', kind: 'build', step: '۳ — جایگاهِ محصول بینِ رقیبان', abstract: 'جایگاه‌یابی', missing: 'حوزه‌ای برای جایگاه‌یابی بینِ رقیبان نیست؛ «💡 جایگاهِ ایده» فقط قوتِ ایده را دارد.', where: 'قلمرو', how: 'حوزه', why_not: 'lla-page: نما خراب نیست.', confidence: 0.85 }, 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'p' })], 101);
    await addArea('s_decision', { id: 'dc_positioning_zz', fa: 'جایگاه‌یابی بینِ رقیبان', desc_fa: 'جایگاهِ محصول در برابرِ رقیبان' });
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «جایگاه‌یابی بینِ رقیبان» افزوده شد: جایگاهِ محصول در برابرِ رقیبان.']); const rk130 = await rank(101, 'حوزهٔ «جایگاه‌یابی بینِ رقیبان» افزوده شد: جایگاهِ محصول در برابرِ رقیبان'); await check();
    e = await one(101); sy = await sysMsgs();
    T(130, (e.st === 'arrived' || !!e.ask) && !sy.some(t => MIS.test(t)) && (rk130.best.s || []).includes('رقیبان'), { e, rk130 });

    // #131 — «آره همینه» after an ask
    await openPh(); await addArea('s_decision', { id: 'dc_build_cost_zz', fa: 'برآوردِ هزینهٔ ساخت', desc_fa: 'برآوردِ هزینهٔ مواد' });
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ تازهٔ «برآوردِ هزینهٔ ساخت» افزوده شد.']); await check(); await turn('خب؟', 'یک پرسش.', [cs({})]); n0 = (await notes()).length;
    u = await turn('آره همینه', 'برگردیم.', [cs({})]); e = await one(101); ev = await dz(await p.evaluate(() => APP.PRE.sysAll()[0].sc.pid));
    T(131, (e.st === 'arrived' || e.st === 'resumed') && e.how === 'ask' && ev.some(x => x.k === 'syswait' && /^رسید \(تأییدِ تو\)/.test(x.out)) && (await notes()).length === n0 && /\(از سر گرفتنِ گامِ منتظرِ ابزار\)/.test(head(u.user)), { e });

    // #132 — not a tie: the better one arrives
    await openPh(); await addArea('s_social', Object.assign({}, A_partner, { desc_fa: 'چطور بفهمیم داروخانه‌های محل حاضرند همکاری کنند' })); await addArea('s_decision', { id: 'dc_numbers_zz', fa: 'کار با عدد و داده', desc_fa: 'عدد و داده و سنجش' });
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — دو حوزهٔ `dc_numbers_zz` و `sc_partner_readiness` افزوده شد.']); await check(); e = await one(101); sy = await sysMsgs();
    T(132, e.st === 'arrived' && e.tool === 'sc_partner_readiness' && !sy.some(t => ASKED.test(t)), { e });

    // #133 — a system-self sheet while a step waits
    await openPh(); const before = JSON.stringify(await sysAll());
    await gapTurn('دکمهٔ چاپ کار نمی‌کنه', { title: 'دکمهٔ چاپ کار نمی‌کند', area: 'lla-page', kind: 'fix', abstract: 'چاپ', missing: 'دکمهٔ چاپ پاسخ نمی‌دهد', where: 'صفحه', how: 'اصلاح', confidence: 0.9 }, 'ثبت می‌کنم.', [], 102);
    T(133, JSON.stringify(await sysAll()) === before && (await sysAll()).length === 1, await sysAll());
    // #135 — two sheets for two steps ⇒ two rows
    await gapTurn('برای مجوزِ پخشِ دارو چیزی هست؟', Object.assign({}, G_ph, { title: 'مجوزِ پخشِ دارو', step: '۳ — مجوزِ پخشِ دارو از کجاست؟', missing: 'حوزه‌ای برای مجوزِ پخشِ دارو نیست.' }), 'ثبت می‌کنم.', [cs({ ph: 'p' })], 103);
    let A = await sysAll(); ev = await dz(await p.evaluate(() => APP.PRE.sysAll()[0].sc.pid));
    T(135, A.length === 2 && A.every(x => x.st === 'wait') && ev.filter(x => x.k === 'syswait').length === 2, { A, ev });

    // #120 / #134 — pieces brought after closure
    await wipe(); await fresh(); const pidC = await bind('پخشِ دارو در محل', 'می‌خواهم داروهای سالمندانِ محل را به خانه‌شان برسانم.');
    await turn('هزینه رو حساب کردم: ماهی ۴ میلیون.', 'خوب.', [cs({ ph: 'c', said: ['result'], result: 'ماهی ۴ میلیون' })]);
    await p.evaluate((pid) => __liveSet(pid, (so, L) => { L.state = 'solved'; }), pidC);
    await turn('یه تکهٔ دیگه: هزینهٔ بسته‌بندی رو هم جمع بزنم؟', 'بله؛ چند است؟', [cs({})]);
    T(134, (await sysAll()).length === 0 && Object.keys(await p.evaluate(() => __filed)).length === 0, await sysAll());
    await gapTurn('یه تکهٔ تازه هم هست: «۷ — بیمهٔ حملِ دارو رو چطور حساب کنم؟» برای این هیچ ابزاری ندیدم.', { title: 'حسابِ بیمهٔ حملِ دارو', area: 'sys-territory', kind: 'build', step: '۷ — بیمهٔ حملِ دارو را چطور حساب کنم؟', abstract: 'بیمهٔ حمل', missing: 'حوزه‌ای برای بیمهٔ حمل نیست.', where: 'قلمرو', how: 'حوزه', why_not: 'lla-page: نما خراب نیست.', confidence: 0.85 }, 'نیست؛ ثبت می‌کنم.', [cs({})], 103);
    e = await one(103); sy = await sysMsgs();
    const card = await p.evaluate((pid) => { APP.go('lprob', pid); const c = document.querySelector('.lp-syscard'); return c ? c.textContent : ''; }, pidC);
    T(120, !!e && e.st === 'wait' && /^۷ — بیمهٔ حمل/.test(e.step) && sy.some(t => /⏸ تکهٔ تازهٔ «۷ — بیمهٔ حملِ دارو را چطور حساب کنم؟» منتظرِ برگهٔ #۱۰۳ ماند/.test(t)) && /منتظرِ برگهٔ #۱۰۳/.test(card), { e, sy: sy.slice(-1), card: card.slice(0, 200) });

    // #121 / #122 — one row whose outcome changes; time order; the entry still arrives after her «نه»
    const pid122 = await openPh(); await adv(2);
    await addArea('s_decision', { id: 'dc_build_cost_zz', fa: 'برآوردِ هزینهٔ ساخت', desc_fa: 'برآوردِ هزینهٔ مواد' });
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ تازهٔ «برآوردِ هزینهٔ ساخت» افزوده شد.']); await check(); await turn('خب؟', 'یک پرسش.', [cs({})]);
    await turn('نه', 'باشه.', [cs({})]); await adv(3);
    await addArea('s_social', A_partner); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «سنجشِ آمادگیِ همکاریِ فروشندگان» افزوده شد.']); await check();
    e = await one(101); await turn('سلام، بریم سراغش.', 'برگردیم.', [cs({})]);
    ev = await dz(pid122); const rt = await p.evaluate((pid) => { const M = APP.ROUTE.model(pid); return { dets: (M.dets || []).filter(d => d.kind === 'sys').length, waits: (M.pts || []).filter(x => x.k === 'syswait').length }; }, pid122);
    const W = ev.filter(x => x.k === 'syswait');
    T(121, W.length === 1 && /^رسید/.test(W[0].out) && rt.dets === 1 && rt.waits === 1, { W, rt });
    const ks = ev.map(x => x.k), ats = ev.map(x => String(x.at)), days = ev.map(x => String(x.at).slice(0, 10));
    const order = ['syswait', 'sysask', 'sysmis', 'sysback', 'sysresume'].map(k => ks.indexOf(k));
    T(122, e.st === 'arrived' && e.tool === 'sc_partner_readiness' && order.every((x, i) => x >= 0 && (i === 0 || x > order[i - 1])) && ats.slice().sort().join() === ats.join() && days[order[0]] < days[order[1]] && days[order[1]] === days[order[2]] && days[order[2]] < days[order[3]], { e, ks, days });
  });

  const ownIdx = Object.keys(E).map(Number).filter(own);
  const miss = ownIdx.filter(i => info.bank[i] === undefined && !info.nc[i]);
  if (!process.env.ONLY || process.env.ONLY.split(',').includes('bank')) chk(!miss.length, 'bank: every P3 entry is tested or has a reason :: ' + JSON.stringify(miss));
  const pass = ownIdx.filter(i => info.bank[i] === true).length, tested = ownIdx.filter(i => info.bank[i] !== undefined).length;
  console.log('bank P3: ' + pass + '/' + tested + ' pass (of ' + ownIdx.length + '); nc: ' + Object.keys(info.nc).length + (Object.keys(info.nc).length ? ' ' + JSON.stringify(info.nc) : ''));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
