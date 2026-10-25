// تورِ پولیا (دستهٔ ۱، دورِ ۲۴، سهمِ «loop» — ۲۰۲۶-۱۰-۲۵) — DECISIONS_R24: R1 (هم‌خوانیِ حلقهٔ قلمرو؛ تنها S1 ِ دور).
//  runners  جمله‌ها و برگه‌های خودِ گزارش‌های دورِ ۲۴ — oD1n (قرص‌دان؛ جوابِ `pr_estimation_fermi` ⇒ «🛎 ابزارِ لازم آمد: «بازنماییِ مسئله»» از «کجا افزوده شود» ِ خودِ برگه، D24-1)،
//           tA1 (کیتِ آبیاری؛ #۱۰۱ «۵ ایمنی» با جوابِ `farm` ⇒ «استدلالِ علمی و آزمونِ فرضیه» از تشخیصِ افتراقی، A24-4؛ #۱۰۲ «۶-ب ثبتِ اختراع» ⇒ حوزهٔ ایمنی به‌جای سابقه، A24-5)،
//           tC1 (#۱۰۲/#۱۰۳ «سنجیدنِ این‌که باغدارها با چه قیمتی واقعاً می‌خرند (بی تعارف)» با جوابِ `sc_persuasion`، C24-14)، tB1/tB1x (`whole` در فهرستِ «ساخته‌شده»؛ sys_done بی خط و یادداشت، B24·D19)،
//           oD1 p13/p21 (برگهٔ کتابِ همراه / تصویرِ کارِ بخش‌ها ⇒ «⏸ منتظرِ برگهٔ #۱۰۲»، D24-2)، oA1 p15 (برگهٔ خودآگاهی، A24-6)، oC1 p11 (kind=fix، C24-13)،
//           📜 «سرانجام: منتظر» پس از رسیدن (D24-8) و نامِ گامِ نادرست (A24-15)، ترتیبِ زمانِ 📜/🧭 (B24·D18).
//  bank     همهٔ ورودی‌های R1 در بانکِ مستقلِ tests/variants/VARIANTS_R24.json (رفتارِ محضِ مدل با دلیل در info.nc)
// LLA_FILE = ساختِ دیگر؛ ONLY=runners,self,steps,ask,done,time,bank
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
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  // the page clock is moved with APP.clock.off (days) — no calendar date is fixed anywhere in this test
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
      return { sys: c.sys || '', user: c.user || '', task: c.task || '', n: all.length, all: all.map(x => x.user) };
    };
    window.__fresh = (view) => { APP.go(view || 'home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
    window.__addArea = (sysId, a) => { const S0 = (window.SYS_TERR.systems || []).filter(x => x.id === sysId)[0]; S0.groups[0].areas.push(a); };
    window.__dropArea = (id) => { (window.SYS_TERR.systems || []).forEach(m => (m.groups || []).forEach(g => { g.areas = (g.areas || []).filter(a => a.id !== id); })); };
    // the routine's reply under a sheet: notes[0] = the sheet's own filing text (exactly what the page filed), then the replies
    window.__reply = (n, replies, status) => { const id = 'sh' + n, f = __filed[id] || ''; __sheets[id] = { id, number: n, status: status || 'answered', text: f, notes: [{ id: 'n0', by: 'owner', text: f }].concat(replies.map((t, i) => (typeof t === 'string' ? { id: 'r' + n + '_' + i, by: 'routine', at: APP.nowISO(), text: t } : t))) }; };
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
  const sysAll = () => p.evaluate(() => APP.PRE.sysAll().map(x => ({ id: x.e.id, n: x.e.number, st: x.e.state, step: x.e.step, tool: (x.e.tool || {}).id || '', ask: x.e.ask ? x.e.ask.id : '', checks: (x.e.checks || []).map(c => c.mismatch ? 'mis' : c.ask ? 'ask' : c.ok ? 'ok' : c.lag ? 'lag' : c.declined ? 'no' : '?'), built: ((x.e.checks || []).filter(c => c.mismatch).slice(-1)[0] || {}).built || null })));
  const one = async (n) => (await sysAll()).filter(e => e.n === n)[0] || null;
  const today = () => p.evaluate(() => APP.dueList().filter(x => x.sys23).map(x => x.txt));
  const check = () => p.evaluate(() => APP.PRE.sysCheck());
  const notes = () => p.evaluate(() => __notes.slice());
  const dz = (pid) => p.evaluate((pid) => APP.dossier(pid).events.filter(e => /^sys/.test(e.k)).map(e => ({ k: e.k, at: e.at, title: e.title, out: e.out })), pid);
  const E = {}; BANK.forEach((e, i) => { E[i] = e; });
  const T = (i, ok, x) => { info.bank[i] = !!ok; chk(ok, 'bank#' + i + ' [' + E[i].rc + '/' + E[i].kind + '] «' + E[i].text.slice(0, 70) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 700)); };
  const NC = (i, why) => { info.nc[i] = why; };
  const own = (i) => /^R1\./.test(E[i].rc);
  const R7 = {};

  // ---- runner gaps (the fields the assistant filed in round 24 — sheets/sh*.json) ----
  const G_oD1n = { title: 'روشِ پیدا کردنِ تغییرِ ماندگار (پله) در دادهٔ نویزی و لغزانِ حسگر', area: 'sys-territory', kind: 'build', step: 'زیرمسئلهٔ ۲: جدا کردنِ پلهٔ واقعیِ ۰٫۳ گرمی از جهشِ لحظه‌ایِ باز و بسته کردن و از دریفتِ آرامِ دما',
    abstract: 'کاربر هنگامِ ساختنِ یک ایده (ابزار، دستگاه، پایشِ عادت یا سلامت) به داده‌ای زمانی می‌رسد که هم نویز دارد، هم جهشِ لحظه‌ای و هم لغزشِ آرام؛ باید بفهمد کِی یک «تغییرِ واقعی و ماندگار» رخ داده.',
    missing: 'حوزه‌ای در «حل مسئله و استدلال» (یا تصمیم) برای آشکارسازیِ نقطهٔ تغییر در دادهٔ زمانی: جدا کردنِ پلهٔ ماندگار از جهشِ گذرا (پنجرهٔ پایداری) و از لغزشِ آرام (حذفِ روند/خط‌مبنا)، و آستانه‌گذاری با سنجشِ خطای هشدارِ نادرست؛ با یک ابزارِ کوچک در صفحه (ورودیِ سریِ عددی ⇐ نمودار ⇐ پله‌های یافته).',
    where: 'قلمروِ سامانه‌ها ⇐ s_problem (حوزهٔ تازه کنارِ pr_representation) با پیوند به «🎯 دفترِ پیش‌بینی» برای سنجشِ هشدارِ نادرست؛ ابزار در تونلِ «🔭» به‌عنوان مسئلهٔ کمکی.',
    how: 'حوزهٔ تازه با گزاره‌های رده‌بندی‌شده از منبعِ معتبر دربارهٔ آشکارسازیِ تغییر (مثلاً CUSUM و پنجرهٔ پایداری)', relations: 'pr_representation، ln_probability_reasoning، dc_calibration_forecasting',
    why_area: 'کمبود یک حوزهٔ روشی در قلمروِ سامانه‌هاست', why_not: 'epi-territory دربارهٔ معرفت‌شناسی است نه روشِ مهندسی؛ «دفترِ سیگنال و نویز» برای ادعاهاست؛ lla-page ابزار می‌سازد ولی حوزه و گزاره‌ها جایشان قلمرو است',
    evidence: 'در «قلمروِ سامانه‌ها»ی پرامپت، s_problem فقط حوزه‌های کلیِ حل (بازنمایی، پولیا، وسیله–هدف، بینش، قیاس…) دارد', confidence: 0.8 };
  const G_tA1_101 = { title: 'سنجشِ ایمنیِ یک ساختهٔ برقیِ خانگی (کم‌ولتاژ، کنارِ آب، بیرون)', area: 'sys-territory', kind: 'build', step: '۵ ایمنی',
    abstract: 'کاربری که چیزی را خودش می‌سازد (پمپ، باتری، سیم‌کشیِ کم‌ولتاژ، شارژ، گرما) و می‌خواهد پیش از به‌کار بردن یا فروش بداند ایمن است: خطرها کدام‌اند، کدام آزمونِ ساده هر خطر را رد یا تأیید می‌کند.',
    missing: 'هیچ حوزه‌ای در «🗺 قلمروِ سامانه‌ها» یا قلمروِ معرفت‌شناسی برای ارزیابیِ خطرِ یک ساختهٔ فیزیکی (برق کنارِ آب، رطوبت، اتصالی، گرمای باتری) و فهرستِ آزمون‌های ایمنیِ پیش از استفاده نیست؛ ابزارِ صفحه (آزمونِ فرضیه، تیمِ قرمز) عام‌اند و دانشِ دامنه ندارند.',
    where: '🗺 قلمروِ سامانه‌ها — حوزهٔ تازهٔ «ساختن و آزمودنِ ساخته‌ها (مهندسیِ خانگی و ایمنی)»', how: 'گزاره‌های رده‌دار + چک‌لیستِ «خطر ⇒ آزمونِ ساده ⇒ مرزِ کمکِ متخصص»',
    why_not: 'pr_hypothesis_testing روشِ عامِ آزمودن را دارد ولی خطرهای برقی و آزمون‌هایشان را نه؛ dc_risk_uncertainty دربارهٔ تصمیمِ زیرِ عدم‌قطعیت است نه ایمنیِ یک دستگاه؛ md_help_boundary دربارهٔ کمکِ روانی است.',
    evidence: 'حرفِ خودش: «سیم‌کشیِ ۱۲ ولت و پمپ کنارِ آب تو حیاط، زیرِ بارون، ایمنه؟»؛ گامِ ۵ ِ مسئلهٔ زندهٔ «کیتِ آبیاریِ خورشیدی»', confidence: 0.85 };
  const G_tA1_102 = { title: 'از ایده تا محصول: جست‌وجوی سابقه و ثبتِ اختراع', area: 'sys-territory', kind: 'build', step: '۶-ب ثبتِ اختراع: آیا قبلاً ثبت شده؟',
    abstract: 'کاربری که چیزی ساخته و می‌خواهد بفروشد یا ثبت کند باید بداند چطور سابقه را بسنجد (محصولِ مشابه در بازار، اختراعِ ثبت‌شده) و نوآوریِ خودش را با شاهد بگوید.',
    missing: 'در «🗺 قلمروِ سامانه‌ها» حوزه‌ای برای روشِ جست‌وجوی سابقه (بانک‌های اختراع، واژه‌های کلیدی، طبقه‌بندی)، سنجشِ تازگی و گامِ ثبت (و مرزِ مشاورِ حقوقی) نیست؛ ابزارِ صفحه (مسئلهٔ مرتبط، قیاس) عام است.',
    where: '🗺 قلمروِ سامانه‌ها — حوزهٔ تازهٔ «اختراع و از ایده تا محصول»', how: 'چک‌لیستِ «سابقه ⇒ تمایز ⇒ مرزِ مشاورِ حقوقی»',
    why_not: 'pr_analogy_transfer فقط روشِ قیاس است نه جست‌وجوی سابقهٔ اختراع؛ «💡 جایگاهِ ایده» قوتِ ایده را از حرفِ کاربر می‌سنجد نه سابقهٔ بیرونی را', evidence: 'حرفِ خودش: «اگه بخوام بفروشمش، چطوری بفهمم کسی قبلاً همینو ساخته یا ثبت اختراع کرده؟»', confidence: 0.85 };
  const G_tC1_102 = { title: 'اعتبارسنجیِ ایده با مشتری بی سوگیریِ تعارف (رفتارِ گذشته، نه نظر)', area: 'sys-territory', kind: 'build', step: 'سنجیدنِ این‌که باغدارها با چه قیمتی واقعاً می‌خرند (بی تعارف)',
    abstract: 'وقتی کسی ایده‌ای را به محصول می‌برد، باید بفهمد مشتری واقعاً می‌خرد و با چه قیمتی؛ پرسیدنِ «می‌خریش؟» با تعارف و رودربایستی جوابِ غلط می‌دهد. روشی منظم لازم است: پرسش دربارهٔ رفتارِ گذشته و پولی که واقعاً خرج کرده، تعهدِ کوچک به‌جای قول، و ثبتِ شاهد.',
    missing: 'هیچ حوزه‌ای در قلمروِ سامانه‌ها برای اعتبارسنجیِ ایده با مشتری (پرسش از رفتارِ گذشته، نه نظر؛ سوگیریِ تعارف؛ تعهدِ کوچک) نیست؛ pr_hypothesis_testing فقط اصلِ آزمونِ فرضیه را می‌گوید و sc_persuasion دربارهٔ قانع کردن است.',
    where: 'قلمروِ سامانه‌ها ‹ تصمیم یا حلِ مسئله: حوزهٔ تازه (مثلاً dc_customer_validation) با پرسش‌های کلیدی و منبع', how: 'حوزه با منابعِ معتبر (پژوهشِ سوگیریِ پاسخِ اجتماعی/تعارف، روش‌های مصاحبهٔ مشتری بر پایهٔ رفتارِ گذشته)',
    why_not: 'lla-page: رفتارِ موجودی خراب نیست؛ epi-*: موضوعِ معرفت‌شناسیِ ادعا نیست.', evidence: 'در نقشهٔ حوزه‌ها: pr_hypothesis_testing، sc_persuasion — هیچ‌کدام روشِ پرسش از رفتارِ گذشته را ندارد.', confidence: 0.8 };
  const G_tC1_103 = Object.assign({}, G_tC1_102, { title: 'روشِ پرسیدن از مشتری بی تعارف: رفتارِ گذشته و پولِ خرج‌شده، نه نظر و قول',
    missing: 'در قلمروِ سامانه‌ها حوزه‌ای برای اعتبارسنجیِ ایده با مشتری (پرسش از رفتارِ گذشته، سوگیریِ تعارف، تعهدِ کوچک) نیست؛ برگهٔ پیشین با ساختنِ حوزهٔ اقناع بسته شد که این نیاز را جواب نمی‌دهد.',
    why_not: 'lla-page: رفتارِ موجودی خراب نیست؛ حوزهٔ اقناع که برای برگهٔ پیشین ساخته شد دربارهٔ قانع کردن است، نه سنجیدن.', evidence: 'حرفِ خودش: «من نمی‌خوام کسی رو قانع کنم، می‌خوام بفهمم واقعاً می‌خرن یا نه»؛ جوابِ روتین زیرِ برگهٔ #۱۰۲ فقط حوزهٔ اقناع را نام برد.' });
  const G_tB1 = { title: 'روشِ جست‌وجوی پیشینهٔ اختراع پیش از ساختِ یک ایده', area: 'sys-territory', kind: 'build', step: '(۳) پیشینه: آیا کسی قبلاً همین جعبه‌قرص را ساخته یا ثبتِ اختراع کرده؟',
    abstract: 'وقتی کاربر ایدهٔ ساختِ یک محصول یا ابزار را به برنامه تبدیل می‌کند، یکی از زیرمسئله‌ها «آیا قبلاً ساخته یا ثبت شده؟» است.', missing: 'یک حوزه در قلمروِ «حل مسئله و استدلال» (یا تصمیم) برای جست‌وجوی پیشینه: گام‌ها (تعریفِ دقیقِ کارکرد، واژه‌ها و هم‌معنی‌ها، منبع‌ها، داوریِ شباهت/تفاوت، ثبتِ یافته‌ها با تاریخ).',
    where: '«🗺 قلمروِ سامانه‌ها» (s_problem: حوزهٔ تازه) + «💡 جایگاهِ ایده» + VIEW_META.idea', how: 'حوزهٔ تازه با منبعِ معتبر و گزاره‌ها',
    why_not: 'epi-*: کارخانه ادعا را می‌سنجد، جست‌وجوی پیشینه نمی‌کند؛ lla-page: نما خراب نیست، روش نیست.', evidence: 'در فهرستِ قلمروها (s_problem، s_decision، s_learn، s_mind) حوزه‌ای برای جست‌وجوی پیشینه/اختراع نیست؛ VIEW_META.idea فقط قوت، فرض و مسئلهٔ طراحی دارد.', confidence: 0.85 };
  const A_change = { id: 'pr_change_detection', fa: 'آشکارسازیِ تغییرِ ماندگار (پله) در دادهٔ نویزیِ حسگر', desc_fa: 'پنجرهٔ پایداری برای جدا کردنِ پلهٔ ماندگار از جهشِ گذرا، خط‌مبنای متحرک برای لغزشِ آرام، و آستانه با سنجشِ هشدارِ نادرست', key_questions_fa: ['این پله ماندگار است یا جهشِ گذرا؟'], tools: [], claims: [] };
  const A_safety = { id: 'pr_home_safety_zz', fa: 'سنجشِ ایمنیِ ساخته‌های برقیِ خانگی', desc_fa: 'فهرستِ خطرهای برقِ کم‌ولتاژ و مرزِ کمکِ برق‌کار', key_questions_fa: ['کدام خطر با کدام آزمون سنجیده می‌شود؟'], tools: [], claims: [] };
  const A_prior = { id: 'pr_prior_art', fa: 'جست‌وجوی سابقهٔ اختراع و مرزِ نوآوری', desc_fa: 'روشِ جست‌وجوی سابقه در پایگاه‌های ثبتِ اختراع، معیارِ تازگی و گامِ ثبت', key_questions_fa: ['آیا همین پیش‌تر ثبت شده؟'], tools: [], claims: [] };

  // ================= runners: the negative arm and the arrival check, from the round-24 sheets =================
  await section('runners', async () => {
    // ---- oD1n (D24-1, S1) — the reply names pr_estimation_fermi; the sheet's own «کجا افزوده شود» names pr_representation ----
    await wipe(); await fresh();
    const pidD = await bind('قرص‌دانِ هوشمند برای مادر', 'قرص‌دانی می‌سازم که با وزن بفهمد مادرم قرصش را برداشته یا نه؛ داده نویز و دریفت دارد.');
    await gapTurn('یه روشِ درست می‌خوام نه حدس … پیدا کردنِ یه پله تو سیگنالی که نویز داره و آروم هم می‌لغزه. اینجا چیزی برای این هست؟', G_oD1n, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'p', stuck: true })], 101);
    let e = await one(101); chk(e && e.st === 'wait', 'oD1n: #101 waits :: ' + JSON.stringify(e));
    const filed = await p.evaluate(() => __filed.sh101);
    chk(/pr_representation/.test(filed), 'fixture: the filed sheet text names pr_representation in «کجا افزوده شود» (as in the runner sheet)');
    await p.evaluate(() => __reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ `pr_estimation_fermi` (برآورد و مسئله‌های فرمی) کامل‌تر شد و کارگاهِ برآوردِ مرتبهٔ بزرگی گرفت؛ برای همین نیاز به کار می‌آید.']));
    const n0 = (await notes()).length; await check();
    e = await one(101); let sy = await sysMsgs(), td = await today();
    const lieD = sy.some(t => /🛎 ابزارِ لازم آمد/.test(t)) || td.some(t => /ابزارِ لازم آمد/.test(t));
    chk(e.st === 'wait' && !e.tool && !lieD && !sy.some(t => /سنجیدم که نیازِ گام/.test(t)), 'D24-1 oD1n c12–c14 (S1): an unrelated reply (pr_estimation_fermi) is NOT «🛎 ابزارِ لازم آمد: «بازنماییِ مسئله»» — pr_representation comes from the sheet\'s own text, not the reply :: ' + JSON.stringify({ e, sy: sy.slice(-2), td }));
    R7.d1a = e.st === 'wait' && !lieD;
    // the next real build is still checked: pr_change_detection appears in the registry and the routine replies again
    await p.evaluate((a) => { __addArea('s_problem', a); __sheets.sh101.notes.push({ id: 'r101_b', by: 'routine', at: APP.nowISO(), text: 'پاسخ به برگهٔ دستیار #101 — ساخته شد: حوزهٔ تازهٔ `pr_change_detection` («آشکارسازیِ تغییرِ ماندگار (پله) در دادهٔ نویزیِ حسگر») در s_problem: پنجرهٔ پایداری برای جدا کردنِ پلهٔ ماندگار از جهشِ گذرا، خط‌مبنای متحرک برای لغزشِ آرام، و آستانه با سنجشِ هشدارِ نادرست. نسخهٔ تازهٔ صفحه منتشر شد.' }); }, A_change);
    await check(); e = await one(101); td = await today();
    chk(e.st === 'arrived' && e.tool === 'pr_change_detection' && td.some(t => /🛎 ابزارِ لازم آمد: «آشکارسازیِ تغییرِ ماندگار/.test(t)), 'D24-1 oD1n: the entry stayed waiting, so the NEXT real build (pr_change_detection) is checked and arrives :: ' + JSON.stringify({ e, td }));
    R7.d1b = e.st === 'arrived' && e.tool === 'pr_change_detection';
    T(15, R7.d1a && R7.d1b, R7);
    T(12, R7.d1b, e);
    await p.evaluate(() => __dropArea('pr_change_detection'));

    // ---- tA1 #101 (A24-4) — the reply names only the `farm` view; the differential names pr_hypothesis_testing ----
    await wipe(); await fresh();
    const pidA = await bind('کیتِ آبیاریِ خورشیدی', 'برای باغچهٔ پدر و مادرم کیتِ آبیاریِ قطره‌ایِ خورشیدی می‌سازم: آبِ روزانه، مخزن، دبیِ پمپ، پنل و باتری، ایمنیِ برق کنارِ آب و ثبتِ اختراع.');
    await turn('آبِ روزانه رو با داده حساب کردم؛ مخزن ۳۰۰ لیتری بسه.', 'خوب.', [cs({ ph: 'c', said: ['result'], result: 'مخزن ۳۰۰ لیتری' })]);
    await gapTurn('حالا ایمنیش: پمپ ۱۲ ولته و کنارِ آب و بیرونه. چطوری مطمئن بشم برق‌گرفتگی نمیده؟ تو این صفحه برای سنجشِ ایمنی چیزی هست؟ گیر کردم.', G_tA1_101, 'نیست — برای ثبت بررسی می‌کنم.', [cs({ ph: 'c', stuck: true })], 101);
    await p.evaluate(() => __reply(101, ['پاسخ به برگهٔ دستیار #101 — در این دور نمای `farm` (مزرعه) به‌روز شد: بخشی برای ثبتِ آبیاریِ گلدان‌ها گرفت. (روتینِ قلمروِ سامانه‌ها)']));
    let nA = (await notes()).length; await check();
    e = await one(101); sy = await sysMsgs(); td = await today(); let nt = await notes();
    const ok14 = e.st === 'wait' && !e.tool && e.checks.includes('mis') && nt.length === nA + 1 && nt[nt.length - 1].id === 'sh101' && /جواب نمی‌دهد/.test(nt[nt.length - 1].t) && sy.some(t => /⚠️ پاسخِ روتین زیرِ برگهٔ #۱۰۱ به گامِ «۵ ایمنی» جواب نداد/.test(t)) && !td.some(t => /آمد/.test(t));
    chk(ok14, 'A24-4 tA1: a reply naming only `farm` ⇒ «⚠️ … جواب نداد» + a note under the sheet (reopened), the step stays ⏸ — never «استدلالِ علمی و آزمونِ فرضیه» from the differential :: ' + JSON.stringify({ e, sy: sy.slice(-1), td, n: nt.slice(-1) }));
    T(14, ok14, { e, td });
    // bank #8 — 📜, 🔭 and 🧭 name the same waiting step (gap.step = «۵ ایمنی»), never «۱ آبِ روزانه»
    const v8 = await p.evaluate((pid) => { APP.go('lprob', pid); const c = document.querySelector('#main .lp-syscard'); const ev = APP.dossier(pid).events.filter(e => e.k === 'syswait').map(e => e.title + ' | ' + e.out); const M = APP.ROUTE.model(pid); return { card: c ? c.textContent : '', ev, det: M.dets.filter(d => d.kind === 'sys').map(d => d.sheet + ':' + d.step + ':' + d.open), remain: M.remain }; }, pidA);
    const ok8 = v8.ev.some(t => /#۱۰۱: «۵ ایمنی»/.test(t) && /پاسخِ آمده گام را جواب نداد/.test(t)) && !v8.ev.some(t => /آبِ روزانه/.test(t)) && /«۵ ایمنی» — منتظرِ برگهٔ #۱۰۱/.test(v8.card) && v8.det.some(d => /^101:۵ ایمنی:true/.test(d)) && /⏸ «۵ ایمنی» منتظرِ برگهٔ #۱۰۱/.test(v8.remain);
    T(8, ok8, v8);
    chk(ok8, 'A24-15 tA1: 📜/🔭/🧭 carry the same step for #101 (gap.step «۵ ایمنی»), never «۱ آبِ روزانه»; 📜 says the reply did not answer :: ' + JSON.stringify(v8));
    // she finds the safety checklist elsewhere ⇒ #101 closed (so the #102 checks below are about #102 only)
    await turn('ایمنی رو با یه برق‌کار چک کردم و حل شد.', 'عالی.', [cs({ ph: 'c', sys_done: { sheet: 101, quote: 'ایمنی رو با یه برق‌کار چک کردم و حل شد' } })]);
    chk((await one(101)).st === 'other', 'tA1: #101 closed by sys_done');
    // ---- tA1 #102 (A24-5) — two areas in the registry diff, the safety one first; the prior-art one must win ----
    await gapTurn('سابقه و ثبتِ اختراعش رو چطوری بفهمم؟ کسی قبلاً ساخته؟', G_tA1_102, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'c' })], 102);
    await p.evaluate(([a1, a2]) => { __addArea('s_problem', a1); __addArea('s_problem', a2); __reply(102, ['پاسخ به برگهٔ دستیار #102 — دو حوزه افزوده شد: «سنجشِ ایمنیِ ساخته‌های برقیِ خانگی» و «جست‌وجوی سابقهٔ اختراع و مرزِ نوآوری».']); }, [A_safety, A_prior]);
    const rk = await p.evaluate(() => { const x = APP.PRE.sysAll().filter(z => z.e.number === 102)[0]; return APP.PRE.sysRank(x.e, APP.PRE.regDiff(x.e.fp)); });
    await check(); e = await one(102); sy = await sysMsgs();
    const ok2 = e.st === 'arrived' && e.tool === 'pr_prior_art' && sy.some(t => /🛎 ابزارِ لازم آمد: «جست‌وجوی سابقهٔ اختراع و مرزِ نوآوری»/.test(t) && /۶-ب ثبتِ اختراع/.test(t));
    chk(ok2, 'A24-5 tA1: every candidate is scored, the best wins (prior art on «سابقه/اختراع/ثبت»), not the first that reached two words (safety: «سنجش، مرز») :: ' + JSON.stringify({ e, rk }));
    T(2, ok2, { e, rk });
    // the resume turn asks exactly the waiting step 6-ب
    let u = await turn('سلام، برگشتم.', 'برگردیم به گامِ «۶-ب ثبتِ اختراع».', [cs({})]);
    const rb = blockOf(u.user, /^# پیش‌نیاز \(/);
    const ok0 = /\(از سر گرفتنِ گامِ منتظرِ ابزار\) ابزارِ «جست‌وجوی سابقهٔ اختراع و مرزِ نوآوری» برای گامِ «۶-ب ثبتِ اختراع: آیا قبلاً ثبت شده؟» آمد/.test(rb) && nTQ(u.user) === 1;
    const v0 = await p.evaluate((pid) => { APP.go('lprob', pid); const c = document.querySelector('#main .lp-syscard'); const ev = APP.dossier(pid).events.filter(e => e.k === 'syswait').map(e => e.title + ' | ' + e.out); const M = APP.ROUTE.model(pid); return { card: c ? c.textContent : '', ev, det: M.dets.filter(d => d.kind === 'sys').map(d => d.sheet + ':' + d.step + ':' + d.open) }; }, pidA);
    const ok0b = v0.ev.some(t => /#۱۰۲: «۶-ب ثبتِ اختراع/.test(t) && /\| رسید/.test(t)) && /۶-ب ثبتِ اختراع: آیا قبلاً ثبت شده؟» — از سر گرفته شد/.test(v0.card) && v0.det.some(d => /^102:۶-ب ثبتِ اختراع/.test(d));
    T(0, ok0 && ok0b, { rb: rb.slice(-500), v0 });
    await p.evaluate(() => { __dropArea('pr_home_safety_zz'); __dropArea('pr_prior_art'); });

    // ---- tC1 (C24-14) — #102 and #103 answered with sc_persuasion (ruled out in the sheet / negated in its own text) ----
    await wipe(); await fresh();
    const pidC = await bind('هشدارِ ارزانِ یخ‌زدگی', 'یه دستگاهِ ارزون برای هشدارِ یخ‌زدگیِ باغ می‌سازم و می‌خوام بدونم باغدارها می‌خرن یا نه.');
    await gapTurn('اگه ازشون بپرسم «می‌خریش؟» همه از رودربایستی میگن آره. روشی هست که بفهمم واقعاً می‌خرن و با چه قیمتی، بی‌اینکه تعارف کنن؟', G_tC1_102, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'c' })], 102);
    await p.evaluate(() => __reply(102, ['پاسخ به برگهٔ دستیار #102 — انجام شد: حوزهٔ `sc_persuasion` (اقناع و نفوذ) کامل شد و ابزارِ «چرا قانع شدم؟» به آن افزوده شد؛ برای فروختنِ ایده به باغدارها از همین استفاده کنید.']));
    await check(); let c2 = await one(102); sy = await sysMsgs();
    await gapTurn('من نمی‌خوام کسی رو قانع کنم، می‌خوام بفهمم واقعاً می‌خرن یا نه', G_tC1_103, 'برگهٔ تازه ثبت می‌کنم.', [cs({ ph: 'c' })], 103);
    await p.evaluate(() => __reply(103, ['پاسخ به برگهٔ دستیار #103 — انجام شد: حوزهٔ `sc_persuasion` (اقناع و نفوذ) کامل شد و ابزارِ «چرا قانع شدم؟» به آن افزوده شد؛ برای فروختنِ ایده به باغدارها از همین استفاده کنید.']));
    await check(); let c3 = await one(103); td = await today(); const sy3 = await sysMsgs();
    const rk3 = await p.evaluate(() => { const x = APP.PRE.sysAll().filter(z => z.e.number === 103)[0]; return { neg: APP.PRE.sysNegFree(x.e.miss), ruled: x.e.ruled }; });
    chk(c2.st === 'wait' && !c2.tool && c3.st === 'wait' && !c3.tool && !td.some(t => /آمد/.test(t)) && !sy3.some(t => /🛎 ابزارِ لازم آمد/.test(t)), 'C24-14 tC1 days 3–4: replies naming only sc_persuasion (named in the sheet\'s own comparison / negated «… جواب نمی‌دهد» clause) never arrive :: ' + JSON.stringify({ c2, c3, td, rk3, sy3: sy3.slice(-3) }));
    chk(c3.checks.includes('mis') && !/اقناع/.test(rk3.neg), 'C24-14 tC1 #103: the negated clause «… حوزهٔ اقناع … جواب نمی‌دهد» does not count as need; mismatch recorded :: ' + JSON.stringify({ c3, rk3 }));

    // ---- tB1 (B24·D19) — the filed text names `whole`; the reply names only `mind` ⇒ built = [mind], never «🧭 این برنامه چیست؟» ----
    await wipe(); await fresh();
    await p.evaluate(() => APP.go('whole'));
    const pidB = await bind('جعبه‌قرصِ هوشمند برای مادرم', 'یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه.');
    await gapTurn('قبلاً کسی همینو ساخته یا ثبت اختراع کرده؟ برای سومی اصلاً نمی‌دونم چطوری باید گشت.', G_tB1, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'p' })], 101);
    const fB = await p.evaluate(() => __filed.sh101); chk(/`whole`/.test(fB), 'fixture: the filed text names `whole` (the view she was on)');
    await p.evaluate(() => __reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱ — دست‌به‌دست h3f2a91: در نمای `mind` (کارنامهٔ ذهن) نمودارِ روندِ ماهانه افزوده شد و WORKLOG به‌روز شد.']));
    await check(); let eb = await one(101);
    chk(eb.st === 'wait' && eb.built && eb.built.includes('view:mind') && !eb.built.some(x => /whole/.test(x)), 'B24·D19 tB1: the mismatch «built» list is read from the reply only (`mind`), never `whole` from the sheet\'s own text :: ' + JSON.stringify(eb));
    // bank #16 — a reply that names nothing built ⇒ built = []
    await gapTurn('یه سؤالِ دیگه: برای داوریِ شباهتِ دو اختراع روشی هست؟', Object.assign({}, G_tB1, { title: 'داوریِ شباهتِ دو اختراع', step: '(۴) داوریِ شباهت با نمونه‌های پیدا شده', missing: 'روشِ داوریِ شباهت/تفاوتِ دو اختراع نیست' }), 'ثبت می‌کنم.', [cs({ ph: 'p' })], 102);
    await p.evaluate(() => __reply(102, ['پاسخ به برگهٔ دستیار #۱۰۲ — این را دیدیم؛ در نوبتِ بعدیِ برنامه است.']));
    await check(); const e16 = await one(102);
    T(16, e16.st === 'wait' && Array.isArray(e16.built) && e16.built.length === 0, e16);
  });

  // ================= sheets about the system itself never mark a step of her problem (D24-2, A24-6, C24-13) =================
  await section('self', async () => {
    await wipe(); await fresh();
    const pid = await bind('باتریِ پنلِ خورشیدی', 'برای یه پنلِ ۱۰۰ واتی چه باتری‌ای لازمه؟ زیرمسئلهٔ ۲: آزمونِ ۲۰+۲۰.');
    await p.evaluate(() => { const s = __cur(); s.steps = [{ t: 'زیرمسئلهٔ ۱: مصرفِ روزانه', s: 'done' }, { t: 'زیرمسئلهٔ ۲: آزمونِ ۲۰+۲۰', s: 'now' }, { t: 'زیرمسئلهٔ ۳: ظرفیت', s: 'todo' }]; APP.S.put(s); });
    // C24-13 — kind=fix about the page itself
    await gapTurn('دکمهٔ ✏️ روی گوشی کار نمی‌کنه', { title: 'دکمهٔ ✏️ روی گوشی کار نمی‌کند', area: 'lla-page', kind: 'fix', abstract: 'ویرایشِ پیام روی گوشی', missing: 'دکمهٔ ✏️ روی گوشی پاسخ نمی‌دهد', where: 'گفت‌وگو', how: 'اصلاحِ رویدادِ لمس', confidence: 0.9 }, 'برای ثبت بررسی می‌کنم.', [], 110, null);
    let A = await sysAll(); T(21, A.length === 0, A);
    // A24-6 — self-knowledge (model benchmark, bank #4) with no gap.step
    await gapTurn('آیا این روش روی چند مدل سنجیده شده؟', { title: 'سنجشِ روش روی چند مدل', area: 'lla-page', kind: 'build', abstract: 'صفحه نمی‌داند روشش روی چند مدل سنجیده شده یا نه', missing: 'گزارشِ سنجش روی مدل‌ها نیست', where: 'خودشناسیِ سامانه', how: 'سنجش و گزارش', confidence: 0.9 }, 'برای ثبت بررسی می‌کنم.', [], 111);
    A = await sysAll(); T(22, A.length === 0, A);
    // D24-2 — the companion book
    let u = await gapTurn('کتابِ همراه کجاست؟ می‌خوام بخونمش.', { title: 'کتابِ همراه هنوز نیست', area: 'lla-page', kind: 'build', abstract: 'کتابِ همراهِ «منطق و معماریِ فکر» در صفحه نیست', missing: 'کتابِ همراه', where: 'صفحه', how: 'ساختنِ کتاب', confidence: 0.9 }, 'برای ثبت بررسی می‌کنم.', [], 112);
    u = await turn('خب، برگردیم: آزمونِ ۲۰+۲۰ رو انجام دادم.', 'خوب.', [cs({ ph: 'c' })]);
    const wl = blockOf(u.user, /^# پیش‌نیاز \(/);
    const sy = await sysMsgs();
    A = await sysAll();
    const ok23 = A.length === 0 && !/گام‌های منتظرِ برگه/.test(wl) && !/در جمع‌بندی گامِ منتظر را صریح بگو/.test(u.user) && !sy.some(t => /منتظرِ برگهٔ #۱۱[0-2]/.test(t));
    T(23, ok23, { A, wl: wl.slice(-300), sy: sy.slice(-2) });
    chk(ok23, 'D24-2 / A24-6 / C24-13: no sheet about the system itself marks «زیرمسئلهٔ ۲: آزمونِ ۲۰+۲۰» (or any step) ⏸; no «در جمع‌بندی گامِ منتظر را صریح بگو» in the next prompt :: ' + JSON.stringify({ A, sy: sy.slice(-2) }));
    // bank #24 — a gap about her domain WITHOUT gap.step and without «#n» ⇒ no fallback to «now»
    await gapTurn('برای محاسبهٔ افتِ ولتاژِ سیم ابزاری هست؟', { title: 'افتِ ولتاژِ سیم‌کشیِ کم‌ولتاژ', area: 'sys-territory', kind: 'build', abstract: 'افتِ ولتاژ در سیمِ بلند', missing: 'حوزه‌ای برای افتِ ولتاژ نیست', where: 'قلمرو', how: 'حوزه', confidence: 0.9 }, 'ثبت می‌کنم.', [cs({ ph: 'c' })], 113);
    A = await sysAll(); const pend = await p.evaluate((pid) => ((APP.S.get('eprog_' + pid).solve.live.pre22 || {}).sysPend || []).map(x => x.number), pid);
    T(24, A.length === 0 && pend.includes(113), { A, pend });
  });

  // ================= which step waits: gap.step, «گامِ #k», a step naming «#n» (bank #10, #11) =================
  await section('steps', async () => {
    await wipe(); await fresh();
    const pid = await bind('کوک‌سازهای تهران', 'چند تا کوک‌ساز در تهران هست؟ گام‌ها: ۱ جمعیت، ۲ نسبتِ پیانو، ۳ تخمینِ فرمی، ۴ کارِ هر کوک‌ساز.');
    await p.evaluate(() => { const s = __cur(); s.steps = [{ t: '۱ جمعیتِ تهران', s: 'done' }, { t: '۲ نسبتِ خانه‌های پیانودار', s: 'todo' }, { t: '۳ تخمینِ فرمیِ کوک در سال', s: 'todo' }, { t: '۴ کارِ هر کوک‌ساز در سال', s: 'now' }]; APP.S.put(s); });
    await gapTurn('برای نسبتِ خانه‌های پیانودار داده‌ای هست؟', { title: 'دادهٔ نسبتِ خانه‌های پیانودار', area: 'sys-territory', kind: 'build', step: '۲ نسبتِ خانه‌های پیانودار', abstract: 'دادهٔ مالکیتِ ساز', missing: 'حوزه‌ای برای دادهٔ مالکیتِ ساز نیست', where: 'قلمرو', how: 'حوزه', confidence: 0.9 }, 'ثبت می‌کنم.', [cs({ ph: 'c' })], 120);
    let u = await turn('ادامه بدیم.', 'باشه.', [cs({})]);
    let e = await one(120); const wl = blockOf(u.user, /^# پیش‌نیاز \(/);
    T(10, e && e.step === '۲ نسبتِ خانه‌های پیانودار' && /«۲ نسبتِ خانه‌های پیانودار» منتظرِ برگهٔ #۱۲۰/.test(wl), { e, wl: wl.slice(-300) });
    await gapTurn('برای گامِ سه ابزاری هست؟', { title: 'ابزارِ تخمینِ فرمی', area: 'sys-territory', kind: 'build', abstract: 'برای گامِ #۳ ابزارِ تخمینِ فرمی لازم است', missing: 'ابزارِ تخمینِ فرمی برای گامِ #۳ نیست', where: 'قلمرو', how: 'کارگاه', confidence: 0.9 }, 'ثبت می‌کنم.', [cs({ ph: 'c' })], 121);
    e = await one(121);
    T(11, e && e.step === '۳ تخمینِ فرمیِ کوک در سال', e);
    // a step naming the sheet number later binds a pending sheet (sysPend)
    await gapTurn('برای کارِ سالانهٔ کوک‌ساز آماری هست؟', { title: 'آمارِ کارِ سالانهٔ کوک‌ساز', area: 'sys-territory', kind: 'build', abstract: 'آمارِ کارِ صنف', missing: 'حوزه‌ای برای آمارِ صنف نیست', where: 'قلمرو', how: 'حوزه', confidence: 0.9 }, 'ثبت می‌کنم.', [cs({ ph: 'c' })], 122);
    chk(!(await one(122)), 'a sheet without a step does not wait yet :: ' + JSON.stringify(await one(122)));
    await p.evaluate(() => { const s = __cur(); s.steps[3] = { t: '۴ کارِ هر کوک‌ساز در سال — منتظرِ برگهٔ #۱۲۲', s: 'todo' }; APP.S.put(s); });
    await turn('باشه، فعلاً گامِ دو.', 'باشه.', [cs({})]);
    e = await one(122); chk(e && e.st === 'wait' && e.step === '۴ کارِ هر کوک‌ساز در سال', 'R1: a step naming «#۱۲۲» binds the pending sheet to that step :: ' + JSON.stringify(e));
  });

  // ================= not clear ⇒ ask her first (bank #3, #4, #20) =================
  await section('ask', async () => {
    await wipe(); await fresh();
    const pid = await bind('کیتِ آبیاریِ خورشیدی', 'کیتِ آبیاریِ خورشیدی برای باغچه؛ آخرین گام: ثبتِ اختراع.');
    await gapTurn('سابقه و ثبتِ اختراعش رو چطوری بفهمم؟', G_tA1_102, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'c' })], 101);
    // #20 — the reply names only the safety area: shared words «سنجش، مرز» only (none from the step) ⇒ not arrived
    await p.evaluate((a) => { __addArea('s_problem', a); __reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «سنجشِ ایمنیِ ساخته‌های برقیِ خانگی» افزوده شد.']); }, A_safety);
    await check(); let e = await one(101), sy = await sysMsgs();
    T(20, e.st === 'wait' && !e.tool && !sy.some(t => /🛎 ابزارِ لازم آمد/.test(t)), { e, sy: sy.slice(-3) });
    await p.evaluate(() => __dropArea('pr_home_safety_zz'));
    // #3 — one area whose title shares one specific word with the step; colloquial reply without ZWNJ
    await p.evaluate(() => { __addArea('s_problem', { id: 'pr_patent_class_zz', fa: 'ثبتِ نامِ شرکت‌ها', desc_fa: 'مدارکِ لازم برای شرکتِ تازه', key_questions_fa: [], tools: [], claims: [] });
      __sheets.sh101.notes.push({ id: 'r101_c', by: 'routine', at: APP.nowISO(), text: 'پاسخ به برگه ی دستیار #101 — یه حوزه ی جدید برای سنجش اضافه شد' }); });
    const rk = await p.evaluate(() => { const x = APP.PRE.sysAll().filter(z => z.e.number === 101)[0]; return APP.PRE.sysRank(x.e, APP.PRE.regDiff(x.e.fp)); });
    await check(); e = await one(101); sy = await sysMsgs(); let td = await today();
    let u = await turn('خب؟', 'یک پرسش.', [cs({})]);
    const ab = blockOf(u.user, /^# پیش‌نیاز \(/);
    const ok3 = e.st === 'wait' && e.ask === 'pr_patent_class_zz' && !sy.some(t => /🛎 ابزارِ لازم آمد/.test(t)) && /\*\*پرسشِ این نوبت همین است:\*\* \(پیش از از سر گرفتنِ گامِ منتظرِ ابزار\) «این ابزارِ تازه همان است که برای گامِ «۶-ب ثبتِ اختراع: آیا قبلاً ثبت شده؟» لازم بود؟»/.test(ab) && nTQ(u.user) === 1 && td.some(t => /❓ برگهٔ #۱۰۱ جواب گرفت/.test(t));
    T(3, ok3, { e, rk, ab: ab.slice(-500), td });
    // #4 — her yes ⇒ arrived ⇒ the resume question in the same turn; 📜 «رسید (تأییدِ تو)»
    u = await turn('آره همونه، بریم', 'برگردیم به گامِ ۶-ب.', [cs({})]);
    const rb = blockOf(u.user, /^# پیش‌نیاز \(/);
    e = await one(101);
    const ev = await dz(pid);
    const ok4 = (e.st === 'resumed' || e.st === 'arrived') && e.tool === 'pr_patent_class_zz' && /\(از سر گرفتنِ گامِ منتظرِ ابزار\) ابزارِ «ثبتِ نامِ شرکت‌ها» برای گامِ «۶-ب ثبتِ اختراع: آیا قبلاً ثبت شده؟» آمد/.test(rb) && ev.some(x => x.k === 'syswait' && /^رسید \(تأییدِ تو\)/.test(x.out));
    T(4, ok4, { e, rb: rb.slice(-400), ev });
    // her «no» path: a second sheet, ask, «نه، همون نیست» ⇒ mismatch note, still waiting, never asked again for the same area
    await gapTurn('برای قیمت‌گذاریِ کیت روشی هست؟', { title: 'قیمت‌گذاریِ یک ساختهٔ خانگی برای فروش', area: 'sys-territory', kind: 'build', step: '۷ قیمت‌گذاریِ کیت', abstract: 'قیمت‌گذاری بر پایهٔ هزینه و بازار', missing: 'حوزه‌ای برای قیمت‌گذاری نیست', where: 'قلمرو', how: 'حوزه', confidence: 0.9 }, 'ثبت می‌کنم.', [cs({ ph: 'c' })], 102);
    await p.evaluate(() => { __addArea('s_decision', { id: 'dc_price_zz', fa: 'قیمت‌گذاریِ خدمات', desc_fa: 'نرخِ ساعتیِ کار', key_questions_fa: [], tools: [], claims: [] }); __reply(102, ['پاسخ به برگهٔ دستیار #102 — حوزهٔ dc_price_zz افزوده شد.']); });
    await check(); e = await one(102);
    chk(e.st === 'wait' && e.ask === 'dc_price_zz', 'ask on one shared word :: ' + JSON.stringify(e));
    await turn('ادامه.', 'یک پرسش.', [cs({})]);
    const n0 = (await notes()).length;
    await turn('نه، همون نیست', 'باشه.', [cs({})]);
    e = await one(102); const nt = await notes();
    chk(e.st === 'wait' && !e.ask && e.checks.includes('mis') && nt.length === n0 + 1 && /همان چیزی نیست/.test(nt[nt.length - 1].t), 'her «no» ⇒ mismatch note under the sheet, step still ⏸ :: ' + JSON.stringify({ e, n: nt.slice(-1) }));
    await check(); e = await one(102); chk(!e.ask, 'the rejected area is never asked again :: ' + JSON.stringify(e));
    await p.evaluate(() => { __dropArea('pr_patent_class_zz'); __dropArea('dc_price_zz'); });
  });

  // ================= sys_done: page line + note for the routine; register; 🔭 and 📜 (bank #5, #6, #7, #25, #26) =================
  await section('done', async () => {
    await wipe(); await fresh();
    const pid = await bind('کیتِ آبیاریِ خورشیدی', 'کیتِ آبیاریِ خورشیدی برای باغچه؛ گام‌ها تا ثبتِ اختراع.');
    await gapTurn('سابقه و ثبتِ اختراعش رو چطوری بفهمم؟', G_tA1_102, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'c' })], 101);
    // #25 / #26 — tiredness and a question are not reports of having done it (even if a model sends sys_done)
    await turn('امروز خیلی خسته‌ام، بعداً ادامه بدیم', 'باشه.', [cs({ sys_done: { sheet: 101, quote: 'امروز خیلی خسته‌ام، بعداً ادامه بدیم' } })]);
    let e = await one(101); T(25, e.st === 'wait', e);
    await turn('راهِ دیگه‌ای هم هست که خودم برم جلو؟', 'بله، یکی هست.', [cs({ sys_done: { sheet: 101, quote: 'راهِ دیگه‌ای هم هست که خودم برم جلو؟' } })]);
    e = await one(101); T(26, e.st === 'wait', e);
    const n0 = (await notes()).length;
    await turn('خودم یه راه دیگه پیدا کردم، با سایتِ ثبتِ شرکت‌ها گشتم و چیزی نبود', 'عالی.', [cs({ ph: 'c', sys_done: { sheet: 101, quote: 'خودم یه راه دیگه پیدا کردم' } })]);
    e = await one(101); let sy = await sysMsgs(), nt = await notes();
    const v = await p.evaluate((pid) => { APP.go('lprob', pid); const c = document.querySelector('#main .lp-syscard'); return { card: c ? c.textContent : '', ev: APP.dossier(pid).events.filter(e => /^sys/.test(e.k)).map(e => e.k + '|' + e.title + '|' + e.out) }; }, pid);
    const ok5 = e.st === 'other' && sy.some(t => /گامِ «۶-ب ثبتِ اختراع: آیا قبلاً ثبت شده؟» از راهِ دیگری برداشته شد/.test(t)) && nt.length === n0 + 1 && nt[nt.length - 1].id === 'sh101' && /از راهِ دیگری برداشت/.test(nt[nt.length - 1].t) && /هنوز لازم است؟/.test(nt[nt.length - 1].t) && v.ev.some(t => /^syswait\|/.test(t) && /\|از راهِ دیگری/.test(t));
    T(5, ok5, { e, sy: sy.slice(-1), n: nt.slice(-1), v });
    chk(ok5, 'B24·D19 tB1x p8: sys_done writes a page line and leaves a note on the sheet for the routine; 📜 outcome «از راهِ دیگری» :: ' + JSON.stringify({ sy: sy.slice(-1), n: nt.slice(-1) }));
    T(7, v.ev.some(t => /^syswait\|/.test(t) && !/\|منتظر$/.test(t)) && !/صفحه خودش می‌فهمد/.test(v.card), v);
    // #6 — elder, «شما»: «از راهِ دیگری برداشتید ✓»; the card stops the fixed waiting text
    await wipe(); await fresh();
    const pid2 = await bind('جدولِ داروهای روزانه', 'برای داروهای روزانه‌ام یک جدول می‌خواهم که بدانم کدام را خورده‌ام.');
    await p.evaluate(() => { const s = __cur(); s.coach = s.coach || {}; s.coach.reg = 'shoma'; APP.S.put(s); });
    await gapTurn('آیا برای یادآوریِ دارو ابزاری دارید؟', { title: 'یادآوریِ داروی روزانه برای سالمند', area: 'sys-territory', kind: 'build', step: 'یادآوریِ داروی ظهر', abstract: 'یادآوریِ دارو', missing: 'حوزه‌ای برای یادآوریِ دارو نیست', where: 'قلمرو', how: 'حوزه', confidence: 0.9 }, 'بررسی می‌کنم.', [cs({ ph: 'c' })], 102);
    await turn('شما زحمت نکشید، خودم با جدول حلش کردم. دیگر آن ابزار لازم نیست.', 'بسیار خوب.', [cs({ ph: 'c', sys_done: { sheet: 102, quote: 'خودم با جدول حلش کردم' } })]);
    e = await one(102); sy = await sysMsgs();
    const c6 = await p.evaluate((pid) => { APP.go('lprob', pid); const c = document.querySelector('#main .lp-syscard'); return c ? c.textContent : ''; }, pid2);
    T(6, e.st === 'other' && sy.some(t => /از راهِ دیگری برداشتید ✓|را از راهِ دیگری برداشتید/.test(t)) && !sy.slice(-1).some(t => /برداشتی[^د]/.test(t)) && !/صفحه خودش می‌فهمد/.test(c6), { e, sy: sy.slice(-1), c6 });
  });

  // ================= time order of 📜 and 🧭 (bank #9, B24·D18) =================
  await section('time', async () => {
    await wipe(); await fresh();
    const pid = await bind('جعبه‌قرصِ هوشمند', 'یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه.');
    await gapTurn('قبلاً کسی همینو ساخته یا ثبت اختراع کرده؟', G_tB1, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'p' })], 101);
    await p.evaluate(() => { APP.clock.off = 1; __reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱ — در نمای `mind` (کارنامهٔ ذهن) نمودارِ روندِ ماهانه افزوده شد.']); });
    await check();
    // D0+3, but the page that sees the build runs on a clock that went back to D0 (the scratch page of tB1)
    await p.evaluate(() => { APP.clock.off = 0; __addArea('s_problem', { id: 'pr_prior_art', fa: 'جست‌وجوی پیشینهٔ اختراع و محصول', desc_fa: 'کارکرد در یک جمله، واژه‌ها و هم‌معنی‌ها و ردهٔ ثبتِ اختراع، منبع‌ها، داوریِ شباهت/تفاوت، ثبتِ یافته‌ها با تاریخ', key_questions_fa: [], tools: [], claims: [] });
      __sheets.sh101.notes.push({ id: 'r2', by: 'routine', at: APP.nowISO(), text: 'پاسخ به برگهٔ دستیار #۱۰۱ — دست‌به‌دست h7c41d0: حوزهٔ تازهٔ `pr_prior_art` («جست‌وجوی پیشینهٔ اختراع و محصول») افزوده شد.' }); });
    await check();
    await p.evaluate(() => { APP.clock.off = 3; });
    await turn('خب حالا پیشینه.', 'برگردیم به گامِ پیشینه.', [cs({})]);
    const ev = await dz(pid);
    const ks = ev.map(x => x.k), ats = ev.map(x => x.at);
    const sorted = ats.every((a, i) => !i || String(ats[i - 1]) <= String(a));
    const order = ks.indexOf('syswait') < ks.indexOf('sysmis') && ks.indexOf('sysmis') < ks.indexOf('sysback') && ks.indexOf('sysback') < ks.indexOf('sysresume');
    const rt = await p.evaluate((pid) => APP.ROUTE.model(pid).pts.filter(x => /^sys|rejoin/.test(x.k)).map(x => x.k), pid);
    const rorder = rt.indexOf('sysmis') >= 0 && rt.indexOf('sysmis') < rt.indexOf('sysback');
    T(9, order && sorted && rorder, { ks, ats, rt });
    chk(order && sorted && rorder, 'B24·D18 tB1: 📜 and 🧭 list filed → mismatch → arrival → resumed in time order even when the arrival page\'s clock is behind :: ' + JSON.stringify({ ks, ats, rt }));
    await p.evaluate(() => { APP.clock.off = 0; __dropArea('pr_prior_art'); });
  });

  // ================= the rest of the R1 bank =================
  await section('bank', async () => {
    // #1 — matched by the Persian title in the reply (no id); arrival for the customer step; Today once
    await wipe(); await fresh();
    await bind('هشدارِ یخ‌زدگی', 'دستگاهِ هشدارِ یخ‌زدگی؛ گامِ ۳: آیا کسی حاضر است بخرد؟');
    await gapTurn('چطور بفهمم کسی واقعاً می‌خره؟', Object.assign({}, G_tC1_102, { step: '۳ — آیا کسی حاضر است بخرد؟ (سنجشِ نیازِ مشتری)' }), 'ثبت می‌کنم.', [cs({ ph: 'c' })], 104);
    await p.evaluate(() => { __addArea('s_decision', { id: 'dc_customer_validation', fa: 'سنجشِ نیازِ مشتری', desc_fa: 'اعتبارسنجیِ ایده با مشتری: پرسش از رفتارِ گذشته و پولِ خرج‌شده، نه نظر؛ سوگیریِ تعارف؛ تعهدِ کوچک', key_questions_fa: ['آخرین بار برای این مشکل چه کردی و چقدر خرج شد؟'], tools: [], claims: [] });
      __reply(104, ['پاسخ به برگهٔ دستیار #104 — ابزارِ «سنجشِ نیازِ مشتری» ساخته شد و در ساحتِ تصمیم است.']); });
    const nm1 = await p.evaluate(() => APP.PRE.sysNamed('ابزارِ «سنجشِ نیازِ مشتری» ساخته شد و در ساحتِ تصمیم است.'));
    await check(); let e = await one(104), td = await today();
    T(1, e.st === 'arrived' && e.tool === 'dc_customer_validation' && nm1.includes('area:dc_customer_validation') && td.filter(t => /🛎 ابزارِ لازم آمد/.test(t)).length === 1, { e, nm1, td });
    await p.evaluate(() => __dropArea('dc_customer_validation'));
    // #13 — colloquial, no ZWNJ, no id ⇒ matched on title words via the registry diff
    await wipe(); await fresh();
    await bind('کوک‌سازها', 'چند تا کوک‌ساز در تهران هست؟');
    await gapTurn('واسه تخمین زدن تعداد کوک سازا چیزی هست؟', { title: 'تخمینِ فرمی برای برآوردِ تعداد', area: 'sys-territory', kind: 'build', step: '۱ — چند تا کوک‌ساز در تهران؟ (تخمینِ فرمی)', abstract: 'برآوردِ مرتبهٔ بزرگی با تخمینِ فرمی', missing: 'کارگاهِ تخمینِ فرمی نیست', where: 'قلمرو', how: 'کارگاه', confidence: 0.9 }, 'ثبت می‌کنم.', [cs({ ph: 'c' })], 105);
    await p.evaluate(() => { __addArea('s_problem', { id: 'pr_fermi_zz', fa: 'تخمینِ فرمی و برآوردِ مرتبهٔ بزرگی', desc_fa: 'شکستنِ یک کمیتِ ناشناخته به ضرب‌های تخمین‌پذیر', key_questions_fa: [], tools: [], claims: [] }); __reply(105, ['پاسخ به برگه ی دستیار #105 — واسه تخمین فرمی یه بخش جدید ساختیم']); });
    await check(); e = await one(105);
    T(13, e.st === 'arrived' && e.tool === 'pr_fermi_zz', e);
    await p.evaluate(() => __dropArea('pr_fermi_zz'));
    // #17 — the differential ruled out «آزمونِ فرضیه»; the reply improved exactly that
    await wipe(); await fresh();
    await bind('آزمایشِ کود', 'دو کود را روی گوجه می‌آزمایم.');
    await gapTurn('برای طراحیِ آزمایشِ مزرعه با بلوک‌های تصادفی روشی هست؟', { title: 'طراحیِ آزمایشِ مزرعه با بلوک‌های تصادفی', area: 'sys-territory', kind: 'build', step: 'چیدنِ کرت‌ها در بلوک‌های تصادفی', abstract: 'طراحیِ آزمایشِ کشاورزی', missing: 'حوزه‌ای برای طراحیِ آزمایشِ مزرعه نیست', where: 'قلمرو', how: 'حوزه', why_not: 'نه آزمونِ فرضیه — آن هست و کافی نیست', confidence: 0.9 }, 'ثبت می‌کنم.', [cs({ ph: 'c' })], 106);
    await p.evaluate(() => __reply(106, ['پاسخ به برگهٔ دستیار #106 — آزمونِ فرضیه را کمی بهتر کردیم.']));
    await check(); e = await one(106);
    const ruled = await p.evaluate(() => APP.PRE.sysAll().filter(x => x.e.number === 106)[0].e.ruled);
    T(17, e.st === 'wait' && !e.tool && ruled.includes('pr_hypothesis_testing'), { e, ruled });
    // #18 — «هیچ ابزارِ تازه‌ای برای اقناع و تعهد ساخته نشد؛ فعلاً نیست.» ⇒ score 0, mismatch + note (not a decline)
    await gapTurn('چطور قانعش کنم که تعهد بده؟', { title: 'گرفتنِ تعهدِ کوچک از همکار', area: 'sys-territory', kind: 'build', step: '۴ — چطور قانعش کنم که تعهد بده؟', abstract: 'تعهدِ کوچک', missing: 'حوزه‌ای برای تعهدِ کوچک نیست', where: 'قلمرو', how: 'حوزه', confidence: 0.9 }, 'ثبت می‌کنم.', [cs({ ph: 'c' })], 107);
    const n18 = (await notes()).length;
    await p.evaluate(() => __reply(107, ['پاسخ به برگهٔ دستیار #107 — هیچ ابزارِ تازه‌ای برای اقناع و تعهد ساخته نشد؛ فعلاً نیست.']));
    await check(); e = await one(107); const nt18 = await notes();
    const ok18b = e.st === 'wait' && e.checks.includes('mis') && nt18.length === n18 + 1;
    chk(ok18b, 'bank #18: «… ساخته نشد؛ فعلاً نیست» ⇒ mismatch + note, the step stays ⏸ (not declined) :: ' + JSON.stringify(e));
    T(18, ok18b, e);
    // #19 — only generic words
    await gapTurn('برای نمودارِ تغییرِ وزن ابزاری هست؟', { title: 'نمودارِ تغییرِ وزنِ هفتگی', area: 'sys-territory', kind: 'build', step: 'نمودارِ تغییرِ وزن در هفته', abstract: 'نمودارِ وزن', missing: 'نمودارِ تغییرِ وزن نیست', where: 'قلمرو', how: 'نما', confidence: 0.9 }, 'ثبت می‌کنم.', [cs({ ph: 'c' })], 108);
    await p.evaluate(() => __reply(108, ['پاسخ به برگهٔ دستیار #108 — در واقع تغییری در مسئله و ابزار و نمودار نبود، هیچ.']));
    const sc19 = await p.evaluate(() => { const x = APP.PRE.sysAll().filter(z => z.e.number === 108)[0]; return APP.PRE.sysRank(x.e, [{ kind: 'area', id: 'zz', fa: 'x', text: 'در واقع تغییری در مسئله و ابزار و نمودار نبود، هیچ' }]); });
    await check(); e = await one(108);
    T(19, e.st === 'wait' && !e.tool && sc19.best.n === 0, { e, sc19 });
  });

  const ownIdx = Object.keys(E).map(Number).filter(own);
  const miss = ownIdx.filter(i => info.bank[i] === undefined && !info.nc[i]);
  chk(!miss.length, 'bank: every R1 entry is tested or has a reason :: ' + JSON.stringify(miss));
  const pass = ownIdx.filter(i => info.bank[i] === true).length, tested = ownIdx.filter(i => info.bank[i] !== undefined).length;
  console.log('bank R1: ' + pass + '/' + tested + ' pass; nc: ' + Object.keys(info.nc).length + (Object.keys(info.nc).length ? ' ' + JSON.stringify(info.nc) : ''));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
