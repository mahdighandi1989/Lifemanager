// تورِ پولیا (دستهٔ ۱، دورِ ۲۶، سهمِ «loop» — ۲۰۲۶-۱۱-۱۲) — DECISIONS_R26: Q7 (پرداختِ حلقهٔ قلمرو) + روشن‌سازی‌های C20 و C36.
//  runners  جمله‌ها و برگه‌های خودِ گزارش‌های دورِ ۲۶ —
//           tC1 روزِ ۶ (C26-20): «❓ … «اعتبارسنجیِ ایده با مشتری: رفتارِ گذشته، نه نظر». مطمئن نیستم همان باشد …» برای گامِ «باغدارها واقعاً حاضرن چقدر بدن — بی تعارف بفهمم…».
//           oD1e (D26-20): دو حوزهٔ هم‌شرح ⇒ «🛎 ابزارِ لازم آمد» برای یکی، بی پرسش و بی نامِ دومی.   tB1y (U62 = B26x·D27/D28/D29): «دومی — «بانکِ ثبت‌های اختراعِ جهانی» همونیه …؛
//                بانکِ ایران به کارم نمیاد» ⇒ پرسشِ دوباره؛ «امروز» فقط نامِ اولی؛ 📜 فقط آخرین پرسش.
//           tB1 / oD1x / tA1 p16 (U58 = B26·D27، U59 = B26x·D25، A26-35، D26-21، D26-22): پس از «نه» و پس‌گرفتنش برگه «open» ماند، رسیدنِ نخست از 📜 رفت، فهرستِ «برگه‌های باز» کهنه بود.
//           tB1y بازوی ۱ (U61 = B26·D28): سطرِ «❓» ِ «امروز» ⇒ کارتِ 🔭 بی راهِ جواب.   oA1 p30 (A26-50): جوابِ روتین به برگهٔ بی‌گام بی خبر.
//           tB1z (U63 = B26x·D30/D31): تکهٔ پس از بستن بی سطرِ «امروز»؛ «(۳) پیشینهٔ اختراع (منتظرِ برگهٔ #۱۰۱) [todo]» کهنه.   aD4 p8 (D26-54): «⏸ منتظرِ برگهٔ #۱۰۱ — پرسشِ کاربر: نوه با همین گوشی …» روی مسئلهٔ بستهٔ کتابخانه.
//           tA1 p13 (A26-36): sys_done روی برگه‌ای که روتین بی ساختن بسته بود بی‌صدا.   oD1n / oD1r (D26-19): «با نیازِ این گام فقط در «پایه» مشترک است».
//  bank     همهٔ ۲۰ ورودیِ Q7 در بانکِ مستقلِ tests/variants/VARIANTS_R26.json
// هر مثبت منفیِ هم‌شکلِ خودش را در همان بخش دارد. هیچ تاریخِ تقویمی‌ای در این آزمون ثابت نیست: ساعتِ صفحه با APP.clock.off (روز) جابه‌جا می‌شود.
// LLA_FILE = ساختِ دیگر؛ ONLY=runners,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = JSON.parse(fs.readFileSync(process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R26.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R26.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)), 'utf8'));

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
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__sheetNo = []; window.__sheets = {}; window.__notes = []; window.__filed = {}; window.__status = [];
    APP.clock.off = 0;
    // میزبانِ آزمون همان رفتارِ میزبانِ واقعی را دارد (app/routes/inspection.py): یادداشتِ مالک برگهٔ answered/approved را «open» می‌کند؛ status فقط open|approved
    window.__mk = (n) => { const id = 'sh' + n, f = __filed[id] || ''; if (!__sheets[id]) __sheets[id] = { id, number: n, status: 'open', title: String(f).split('\n')[0].slice(0, 80), text: f, notes: [{ id: 'n0', by: 'owner', text: f }] }; return __sheets[id]; };
    APP.HOST = { report: async (o) => { const n = __sheetNo.length ? __sheetNo.shift() : 900; __filed['sh' + n] = (o && o.text) || ''; __mk(n); return { id: 'sh' + n, number: n }; },
      sheets: async () => Object.keys(__sheets).map(k => __sheets[k]).map(s => ({ id: s.id, number: s.number, title: s.title, status: s.status, urgent: true })),
      sheet: async (id) => (__sheets[id] ? JSON.parse(JSON.stringify(__sheets[id])) : null),
      note: async (id, t) => { __notes.push({ id, t }); const s = __sheets[id]; if (s) { s.notes.push({ id: 'o' + s.notes.length, by: 'owner', at: APP.nowISO(), text: t }); if (s.status === 'answered' || s.status === 'approved') s.status = 'open'; } return { ok: true }; },
      status: async (id, st) => { if (st !== 'open' && st !== 'approved') throw new Error('422'); __status.push({ id, st }); if (__sheets[id]) __sheets[id].status = st; return { ok: true }; },
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
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
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); (window.__added || []).forEach(id => __dropArea(id)); window.__added = []; window.__sheets = {}; window.__filed = {}; window.__notes = []; window.__status = []; APP.clock.off = (APP.clock.off || 0) + 1; };
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
    window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {}; fn(pg.solve, L); APP.S.put(pg); };
    window.__added = [];
    window.__addArea = (sysId, a, first) => { const S0 = (window.SYS_TERR.systems || []).filter(x => x.id === sysId)[0], o = Object.assign({ key_questions_fa: [], tools: [], claims: [] }, a); if (first) S0.groups[0].areas.unshift(o); else S0.groups[0].areas.push(o); __added.push(a.id); };
    window.__dropArea = (id) => { (window.SYS_TERR.systems || []).forEach(m => (m.groups || []).forEach(g => { g.areas = (g.areas || []).filter(a => a.id !== id); })); };
    window.__reply = (n, replies, status) => { const s = __mk(n); replies.forEach((t, i) => s.notes.push(typeof t === 'string' ? { id: 'r' + n + '_' + (s.notes.length + i), by: 'routine', at: APP.nowISO(), text: t } : t)); s.status = status || 'answered'; };
  });
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const turn = (text, reply, actions, extra, more) => p.evaluate(([t, r, a, x, m]) => __turn(t, r, a, x, m), [text, reply || '', actions || [], extra || [], more || null]);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const bind = async (title, stmt) => p.evaluate(([t, stmt]) => { const pid = __live(t, stmt); APP.liveBindSession(pid, __cur()); return pid; }, [title, stmt]);
  const sysMsgs = () => p.evaluate(() => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text));
  const CONSULT = { agree: true, area: 'sys-territory', kind: 'build', dup_of: null, reason: 'در نقشهٔ قلمرو نیست.', fix: {} };
  await p.evaluate((c) => { window.__consult = (g) => Object.assign({}, c, { area: (g && g.area) || c.area, kind: (g && g.kind) || c.kind }); }, CONSULT);
  const gapTurn = (text, g, reply, acts, n, more) => p.evaluate(([t, g, r, a, n, m]) => { __sheetNo.push(n); return __turn(t, r, a, [__consult(g)], Object.assign({ status: 'gap', gap: g }, m || {})); }, [text, g, reply, acts || [], n, more || null]);
  const sysAll = () => p.evaluate(() => APP.PRE.sysAll().map(x => ({ id: x.e.id, n: x.e.number, st: x.e.state, step: x.e.step, late: !!x.e.late, area: x.e.area || '', tool: (x.e.tool || {}).id || '', how: x.e.how || '', ask: x.e.ask ? x.e.ask.id : '', alt: x.e.ask ? (x.e.ask.alt || []) : [], rej: x.e.rejected || [], pid: x.sc.pid || '', moot: (x.e.mootTool || {}).id || '', checks: (x.e.checks || []).map(c => c.mismatch ? (c.byHer ? 'misHer' : 'mis') : c.ask ? 'ask' : c.undo ? 'undo' : c.ok ? 'ok' : c.lag ? 'lag' : c.declined ? 'no' : '?'), why: (x.e.checks || []).map(c => c.reason || '') })));
  const one = async (n) => (await sysAll()).filter(e => e.n === n)[0] || null;
  const todayAll = () => p.evaluate(() => APP.dueList().filter(x => x.sys23 || x.news26).map(x => x.txt + ' | ' + (x.sub || '')));
  const check = () => p.evaluate(() => APP.PRE.sysCheck());
  const notes = (n) => p.evaluate((n) => __notes.filter(x => x.id === 'sh' + n).map(x => x.t), n);
  const sheet = (n) => p.evaluate((n) => { const s = __sheets['sh' + n]; return s ? { status: s.status, last: (s.notes[s.notes.length - 1] || {}).text || '', n: s.notes.length } : null; }, n);
  const adv = (d) => p.evaluate((d) => { APP.clock.off = (APP.clock.off || 0) + d; }, d);
  const dz = (pid) => p.evaluate((pid) => APP.dossier(pid).events.filter(e => /^sys/.test(e.k)).sort((a, b) => String(a.at).localeCompare(String(b.at))).map(e => ({ k: e.k, at: e.at, title: e.title, out: e.out, lines: e.lines })), pid);
  const addArea = (sysId, a, first) => p.evaluate(([s, a, f]) => __addArea(s, a, f), [sysId, a, !!first]);
  const reply = (n, list, st) => p.evaluate(([n, l, st]) => __reply(n, l, st), [n, list, st || null]);
  const setSt = (n, st) => p.evaluate(([n, st]) => { __sheets['sh' + n].status = st; }, [n, st]);
  const card = (pid) => p.evaluate((pid) => { APP.go('lprob', pid); const c = document.querySelector('.lp-syscard'); return c ? { text: c.textContent, btn: [...c.querySelectorAll('[data-fit]')].map(x => x.getAttribute('data-fit')) } : { text: '', btn: [] }; }, pid);
  const click = (pid, fit) => p.evaluate(([pid, fit]) => { APP.go('lprob', pid); const x = document.querySelector('.lp-syscard [data-fit="' + fit + '"]'); if (!x) return false; x.click(); return true; }, [pid, fit]);
  const sheetsLine = (u) => (head(u.user).split(/\n(?=# )/).filter(bl => /^# برگه‌های بازِ/.test(bl))[0] || '').split('\n').slice(1).join(' ');
  const steps = () => p.evaluate(() => (__cur().steps || []).map(x => x.t));
  const toks = (t) => p.evaluate((t) => APP.PRE.sysToks(t), t);
  const QI = BANK.map((e, i) => i).filter(i => /^Q7\./.test(BANK[i].rc));
  const T = (k, ok, x) => { const i = QI[k - 1], E = BANK[i]; info.bank[i] = !!ok; chk(ok, 'bank#' + i + ' (Q7·' + k + ') [' + E.kind + '] «' + E.text.slice(0, 80) + '» → ' + E.expect.slice(0, 120) + ' :: ' + JSON.stringify(x).slice(0, 1100)); };
  const ARR = /🛎 ابزارِ لازم آمد/, WEIGHED = /سنجیدم که نیازِ گام/, ASKED = /❓ برگهٔ/, MIS = /⚠️ پاسخِ/;
  let e, sy, td, u, ev, nt, sh, c;

  // ---- the runners' sheets ----
  const G_tC1 = { title: 'سنجیدنِ خواستِ واقعیِ مشتری و قیمتِ پذیرفتنی پیش از ساختن (بی تعارف و رودربایستی)', area: 'sys-territory', kind: 'build', step: 'باغدارها واقعاً حاضرن چقدر بدن — بی تعارف بفهمم می‌خرن و با چه قیمتی',
    abstract: 'کسی که ایدهٔ محصول دارد باید پیش از ساختن بفهمد مشتری واقعاً می‌خرد و چقدر می‌دهد، در حالی که پرسشِ مستقیم جوابِ تعارفی می‌گیرد',
    missing: 'حوزه و ابزاری برای اعتبارسنجیِ تقاضا: پرسیدن از رفتار و خرجِ گذشته به‌جای نظر، نشانه‌های تعهدِ واقعی، برآوردِ قیمتِ پذیرفتنی؛ «اقناع و نفوذ» (sc_persuasion) بررسی و کنار گذاشته شد چون دربارهٔ قانع‌کردن است، نه سنجشِ خریدِ واقعی',
    where: '🗺 قلمروِ سامانه‌ها — حوزهٔ تازه زیرِ «تصمیم، برنامه‌ریزی و خودتنظیمی»', how: 'حوزه با پرسش‌های کلیدی دربارهٔ رفتارِ گذشتهٔ مشتری', why_not: 'sc_persuasion اقناع است؛ s_decision مقایسهٔ گزینه‌های خودِ فرد', evidence: 'در نقشهٔ سامانه حوزه‌ای برای اعتبارسنجیِ مشتری یا قیمت‌گذاری نیست', confidence: 0.85 };
  const A_cust = { id: 'dc_customer_validation', fa: 'اعتبارسنجیِ ایده با مشتری: رفتارِ گذشته، نه نظر', desc_fa: 'چطور پیش از ساختن بفهمیم مشتری واقعاً مسئله دارد و پول می‌دهد: پرسیدن از رفتارِ گذشته به‌جای نظر دربارهٔ ایده؛ پیش‌فروش و تعهدِ کوچک به‌عنوانِ نشانه.', key_questions_fa: ['آخرین باری که این مشکل را داشتی کِی بود و چه کردی؟', 'برای حلش تا حالا چقدر خرج کرده‌ای؟', 'حاضری الان پیش‌پرداختِ کوچکی بدهی؟'] };
  const A_size = { id: 'dc_market_sizing', fa: 'تخمینِ اندازهٔ بازار از بالا به پایین', desc_fa: 'تخمینِ شمارِ مشتریانِ بالقوه و درآمدِ کل از آمارِ کلان (جمعیت × سهم × قیمت)، پیش از ساختن.', key_questions_fa: ['کلِ بازار چند نفر است؟', 'چه سهمی واقع‌بینانه است؟', 'درآمدِ سالانه چقدر می‌شود؟'] };
  const G_oD1 = { title: 'آشکارسازیِ پلهٔ ماندگار در سیگنالِ نویزی و لغزان (جدا کردن از پرشِ گذرا و دریفت)', area: 'sys-territory', kind: 'build', step: 'زیرمسئلهٔ ۲: جدا کردنِ پلهٔ واقعیِ ۰٫۳ گرمی از پرشِ بازوبسته‌کردنِ در و از دریفتِ دما',
    abstract: 'مسئله‌هایی که باید در یک سریِ اندازه‌گیریِ حسگر تغییرِ ماندگارِ کوچک (پله) را از پرشِ گذرا و لغزشِ آرام جدا کنند: ترازو، دما، ولتاژِ باتری، شمارنده‌ها.',
    missing: 'حوزه‌ای در «قلمروِ سامانه‌ها» با روشِ معتبرِ آشکارسازیِ تغییرِ ماندگار: پنجرهٔ پایداری، خط‌مبنای متحرک برای لغزش، آستانه بر پایهٔ نویز و سنجشِ هشدارِ نادرست.',
    where: '🗺 قلمروِ سامانه‌ها › حل مسئله و استدلال (s_problem)', how: 'یک حوزهٔ تازه با گزاره‌های منبع‌دار', why_not: 'pr_statistical دربارهٔ نمونه‌گیری و بازگشت به میانگین است، نه آشکارسازیِ پله؛ تکنیکِ ۱۰ (تمایزِ سیگنال از نویز) برای ادعا و خبر است.', evidence: 'در نقشهٔ s_problem حوزه‌ای برای تغییرِ ماندگار/پله در سریِ حسگر نیست', confidence: 0.88 };
  const D_step = 'پنجرهٔ پایداری برای جدا کردنِ پلهٔ ماندگار از جهشِ گذرا، خط‌مبنای متحرک برای لغزش، و آستانه با سنجشِ هشدارِ نادرست';
  const A_chg = { id: 'pr_change_detection', fa: 'آشکارسازیِ تغییرِ ماندگار (پله) در دادهٔ نویزیِ حسگر', desc_fa: D_step, key_questions_fa: ['این پله ماندگار است یا جهشِ گذرا؟'] };
  const A_stp = { id: 'pr_step_detection', fa: 'تشخیصِ پلهٔ ماندگار در دادهٔ نویزیِ حسگر', desc_fa: D_step, key_questions_fa: ['این پله ماندگار است یا جهشِ گذرا؟'] };
  const G_tB1 = { title: 'جست‌وجوی پیشینهٔ اختراع برای یک ایدهٔ ساختنی', area: 'sys-territory', kind: 'build', step: '(۳) قبلاً کسی همینو ساخته یا ثبت اختراع کرده؟',
    abstract: 'کسی که ایده‌ای برای ساختنِ یک وسیله دارد باید بداند پیش‌تر کسی همان را ساخته یا ثبتِ اختراع کرده یا نه، و ایده‌اش با نزدیک‌ترین نمونه چه فرقی دارد.',
    missing: 'حوزه/ابزاری برای جست‌وجوی نظام‌مندِ پیشینهٔ اختراع (واژه‌کلیدِ کارکرد، پایگاه‌های ثبتِ اختراع، مقایسهٔ ادعاها با ویژگی‌های ایده)', where: 'قلمروِ سامانه‌ها — حلِ مسئله (s_problem)، کنارِ «خلاقیت»', how: 'حوزه‌ای با پرسش‌های کلیدی و گام‌های جست‌وجو',
    why_not: 'pr_hypothesis_testing آزمونِ فرضیه است نه جست‌وجوی پیشینه؛ pr_creativity ساختنِ ایده است نه وارسیِ تازگی', evidence: 'در نقشهٔ قلمرو هیچ حوزه‌ای برای پیشینهٔ اختراع یا ثبتِ اختراع نیست', confidence: 0.85 };
  const D_pat = 'جست‌وجوی نظام‌مندِ اینکه کسی قبلاً همین را ساخته یا ثبتِ اختراع کرده';
  const A_ir = { id: 'pr_patent_ir', fa: 'بانکِ ثبت‌های اختراعِ ایران', desc_fa: D_pat }, A_wd = { id: 'pr_patent_world', fa: 'بانکِ ثبت‌های اختراعِ جهانی', desc_fa: D_pat };
  const A_hist = { id: 'pr_tech_history', fa: 'تاریخِ فناوری و پیشینهٔ ابزارها', desc_fa: 'پیشینهٔ تاریخیِ فناوری‌ها و اینکه هر ابزار از کجا آمد' };
  const A_prior = { id: 'pr_prior_art', fa: 'جست‌وجوی پیشینهٔ اختراع', desc_fa: D_pat }, A_claims = { id: 'pr_patent_claims', fa: 'ادعاهای ثبتِ اختراع', desc_fa: 'نوشتن و خواندنِ ادعاهای یک ثبتِ اختراع' }, A_mkt = { id: 'pr_market_scan', fa: 'بررسیِ بازار و رقیبان', desc_fa: 'رقیبان چه می‌فروشند و به چه بهایی' };

  await section('runners', async () => {
    const R7 = {};
    // ---- tC1 روزِ ۶ (C26-20): the one clearly fitting area arrives; it is not asked ----
    await wipe(); await fresh();
    await bind('هشدارِ یخ‌زدگی برای باغدار', 'یه دستگاهِ ارزونِ هشدارِ یخ‌زدگی برای باغدارِ کوچک.');
    await gapTurn('یه گیرِ دیگه هم دارم: نمی‌دونم باغدارها واقعاً حاضرن چقدر بدن. اگه ازشون بپرسم «می‌خریش؟» تعارف می‌کنن.', G_tC1, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'e' })], 102);
    await addArea('s_decision', A_size, true); await addArea('s_decision', A_cust);
    await reply(102, ['پاسخ به برگهٔ دستیار #102 — ساخته شد: دو حوزهٔ تازه زیرِ «تصمیم، برنامه‌ریزی و خودتنظیمی».']); await check();
    e = await one(102); sy = await sysMsgs();
    R7.c20 = !!e && e.st === 'arrived' && e.tool === 'dc_customer_validation' && sy.some(t => ARR.test(t) && WEIGHED.test(t) && /اعتبارسنجیِ ایده با مشتری/.test(t)) && !sy.some(t => ASKED.test(t));
    chk(R7.c20, 'C26-20 tC1 day 6: «اعتبارسنجیِ ایده با مشتری: رفتارِ گذشته، نه نظر» is the one clear fit for «باغدارها واقعاً حاضرن چقدر بدن…» ⇒ «🛎 … سنجیدم», no «❓ … مطمئن نیستم» :: ' + JSON.stringify({ e, sy: sy.slice(-2) }));
    const tk = { a: await toks('حاضرن'), b: await toks('بفهمم'), c: await toks('بفهمیم'), neg: await toks('نفهمم'), keep: await toks('پایان روشن ذهن تمرین نشانه') };
    chk(tk.a[0] === 'حاضر' && tk.b[0] === tk.c[0] && tk.b[0] === 'فهم', 'C26-20 root: the colloquial forms of her step are the same WORDS as the written ones — «حاضرن» = «حاضر», «بفهمم» = «بفهمیم» :: ' + JSON.stringify(tk));
    // look-alike negatives: the negative is not the positive; words that merely END like a verb ending stay themselves
    chk(tk.neg[0] !== 'فهم' && tk.keep.join(' ') === 'پایان روشن ذهن تمرین نشانه', 'C26-20 neg: «نفهمم» is not folded onto «بفهمم»; «پایان / روشن / ذهن / تمرین / نشانه» keep their own form :: ' + JSON.stringify(tk));
    // look-alike negative: an area that shares ONE folded word of her step («حاضر») is not an arrival
    await wipe(); await fresh();
    await bind('هشدارِ یخ‌زدگی برای باغدار', 'یه دستگاهِ ارزونِ هشدارِ یخ‌زدگی برای باغدارِ کوچک.');
    await gapTurn('نمی‌دونم باغدارها واقعاً حاضرن چقدر بدن.', G_tC1, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'e' })], 102);
    await addArea('s_decision', { id: 'ln_attendance', fa: 'حضور و غیابِ کلاس', desc_fa: 'ثبتِ این‌که هر شاگرد حاضر است یا غایب' });
    await reply(102, ['پاسخ به برگهٔ دستیار #102 — ساخته شد: حوزهٔ `ln_attendance`.']); await check();
    e = await one(102); sy = await sysMsgs();
    chk(!!e && e.st === 'wait' && !e.tool && !sy.some(t => ARR.test(t)), 'C26-20 neg: one shared word («حاضر») is not a clear fit — no «رسید» for «حضور و غیابِ کلاس» :: ' + JSON.stringify({ e, sy: sy.slice(-1) }));

    // ---- oD1e (D26-20): two equal candidates ⇒ ASK naming both, in the chat, in Today and in 📜 ----
    await wipe(); await fresh();
    const pidD = await bind('قرص‌دونِ هوشمند با وزن', 'یه قرص‌دون که از روی وزن بفهمه قرص برداشته شده یا نه.');
    await gapTurn('پیدا کردنِ یه پله تو سیگنالی که نویز داره و آروم هم می‌لغزه — تو این سامانه جایی داره؟', G_oD1, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'p' })], 101);
    await addArea('s_problem', A_chg); await addArea('s_problem', A_stp);
    await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱ — ساخته شد: دو حوزهٔ تازه در «حل مسئله و استدلال».']); await check(); await p.evaluate(() => APP.dueList()); await check();
    e = await one(101); sy = await sysMsgs(); td = await todayAll(); ev = await dz(pidD);
    const askL = sy.filter(t => ASKED.test(t));
    R7.d20 = !!e && e.st === 'wait' && !!e.ask && !e.tool && !sy.some(t => ARR.test(t)) && askL.length === 1 && /آشکارسازیِ تغییرِ ماندگار/.test(askL[0]) && /تشخیصِ پلهٔ ماندگار/.test(askL[0]);
    chk(R7.d20, 'D26-20 oD1e: two areas with the same description ⇒ ONE question naming both («آشکارسازیِ تغییرِ ماندگار…» and «تشخیصِ پلهٔ ماندگار…»), never «🛎» for the one the sheet\'s own title words favour :: ' + JSON.stringify({ e, sy: sy.slice(-2) }));
    const tdAsk = td.filter(t => /^❓/.test(t));
    chk(tdAsk.length === 1 && /آشکارسازیِ تغییرِ ماندگار/.test(tdAsk[0]) && /تشخیصِ پلهٔ ماندگار/.test(tdAsk[0]), 'U62 (B26x·D28): the Today ❓ line of a tie names BOTH candidates :: ' + JSON.stringify(td));
    chk(ev.filter(x => x.k === 'sysask').length === 1 && /آشکارسازیِ تغییرِ ماندگار/.test(ev.filter(x => x.k === 'sysask')[0].title) && /تشخیصِ پلهٔ ماندگار/.test(ev.filter(x => x.k === 'sysask')[0].title), 'D26-20: 📜 ask row names both :: ' + JSON.stringify(ev.map(x => x.title)));
    // her answer names one; the model (worst case) still follows the OLD contract and sends fit:false for «the other one»
    u = await turn('خب؟', 'یک پرسش.', [cs({})]);
    chk(/\*\*پرسشِ این نوبت همین است:\*\*[^\n]*هم‌امتیاز با «[^\n]*همان جوابِ اوست/.test(head(u.user)) && !/صفحه دربارهٔ آن یکی جدا می‌پرسد/.test(head(u.user)), 'U62: the tie question in the prompt says naming one IS the answer (no «fit=false for this, the page asks again about that») :: ' + head(u.user).split('\n').filter(l => /هم‌امتیاز/.test(l)).join(' ⏎ ').slice(0, 700));
    await turn('دومی — «تشخیصِ پلهٔ ماندگار در دادهٔ نویزیِ حسگر» همونیه که برای زیرمسئلهٔ دوم لازم داشتم؛ اون یکی به کارم نمیاد', 'باشه.', [cs({ sys_fit: { sheet: 101, fit: false, quote: 'اون یکی به کارم نمیاد' } })]);
    e = await one(101); sy = await sysMsgs(); nt = await notes(101); ev = await dz(pidD);
    R7.u62 = !!e && (e.st === 'arrived' || e.st === 'resumed') && e.tool === 'pr_step_detection' && e.how === 'ask' && sy.filter(t => ASKED.test(t)).length === 1 && !sy.some(t => /گفتی همان نیست/.test(t)) && !e.rej.length && !nt.some(t => /وارسیِ برگه/.test(t));
    chk(R7.u62, 'U62 (B26x·D27): answering the tie by NAMING one is the answer — that one arrives («گفتی همان است»), no second ❓, no «(گفتی همان نیست)», nothing rejected, no reopening note :: ' + JSON.stringify({ e, sy: sy.slice(-2), nt }));
    chk(ev.filter(x => x.k === 'sysask').length === 1 && /^جواب: همان است/.test(ev.filter(x => x.k === 'sysask')[0].out) && ev.filter(x => x.k === 'sysback').length === 1, 'U62 (B26x·D29): 📜 keeps the ask (with her answer as its outcome) AND the arrival as two events :: ' + JSON.stringify(ev.map(x => x.k + ' | ' + x.title + ' | ' + x.out)));
    // tB1y: the runner's own sentence, the «جهانی/ایران» pair, model silent
    await wipe(); await fresh();
    await bind('جعبه‌قرصِ هوشمند برای مادر', 'یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه.');
    await gapTurn('چطوری بفهمم کسی قبلاً همینو ساخته یا ثبت اختراع کرده؟', G_tB1, 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'p' })], 101);
    await addArea('s_problem', A_ir); await addArea('s_problem', A_wd);
    await reply(101, ['پاسخِ روتین: ساخته شد — دو حوزهٔ تازه اضافه شد: «بانکِ ثبت‌های اختراعِ ایران» (pr_patent_ir) و «بانکِ ثبت‌های اختراعِ جهانی» (pr_patent_world)؛ هر دو برای جست‌وجوی نظام‌مندِ اینکه کسی قبلاً همین را ساخته یا ثبت کرده.']); await check();
    await turn('خب؟', 'یک پرسش.', [cs({})]);
    await turn('دومی — «بانکِ ثبت‌های اختراعِ جهانی» همونیه که برای گامِ سوم لازم داشتم؛ بانکِ ایران به کارم نمیاد', 'باشه.', [cs({})]);
    e = await one(101); sy = await sysMsgs();
    chk(!!e && (e.st === 'arrived' || e.st === 'resumed') && e.tool === 'pr_patent_world' && e.how === 'ask' && sy.filter(t => ASKED.test(t)).length === 1 && !sy.some(t => MIS.test(t)), 'U62 tB1y: «دومی — «بانکِ ثبت‌های اختراعِ جهانی» همونیه …؛ بانکِ ایران به کارم نمیاد» ⇒ «جهانی» arrives at once (page reads it, model silent); «گامِ سوم» is not read as «the third one» :: ' + JSON.stringify({ e, sy: sy.slice(-2) }));
    // look-alike negatives of the tie answer
    const tieUp = async () => { await wipe(); await fresh(); const pid = await bind('جعبه‌قرصِ هوشمند برای مادر', 'یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه.');
      await gapTurn('چطوری بفهمم کسی قبلاً همینو ساخته یا ثبت اختراع کرده؟', G_tB1, 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'p' })], 101); await addArea('s_problem', A_ir); await addArea('s_problem', A_wd);
      await reply(101, ['پاسخ به برگهٔ دستیار #101 — ساخته شد: «بانکِ ثبت‌های اختراعِ ایران» و «بانکِ ثبت‌های اختراعِ جهانی».']); await check(); await turn('خب؟', 'یک پرسش.', [cs({})]); return pid; };
    await tieUp(); u = await turn('آره', 'کدام؟', [cs({ sys_fit: { sheet: 101, fit: true, quote: 'آره' } })]);
    e = await one(101); u = await turn('خب', 'کدام؟', [cs({})]);
    chk(!!e && e.st === 'wait' && !!e.ask && e.alt.length === 1 && /بپرس کدام‌یک/.test(head(u.user)), 'U62 neg: a bare «آره» at a tie names nobody — the page does not pick; the ask stays and the coach is told to ask which :: ' + JSON.stringify(e));
    await tieUp(); await turn('بذار اول بانک‌ها رو با هم مقایسه کنم، جهان رو که نمی‌شه یه‌شبه گشت', 'باشه.', [cs({})]);
    e = await one(101); chk(!!e && e.st === 'wait' && !!e.ask && e.alt.length === 1, 'U62 neg: a sentence that merely contains a word of one name («جهان») without choosing is not a choice :: ' + JSON.stringify(e));
    await tieUp(); await turn('ایران نه', 'باشه.', [cs({})]);
    e = await one(101); sy = await sysMsgs();
    chk(!!e && e.st === 'wait' && e.ask === 'pr_patent_world' && !e.alt.length && e.rej.indexOf('pr_patent_ir') >= 0 && !sy.some(t => ARR.test(t)), 'U62 neg: rejecting ONE of two does not accept the other — it stays a question about the one left :: ' + JSON.stringify(e));
    // best of three (tB1z): the one the sheet title names in full wins over two others that also read alone
    await wipe(); await fresh(); await bind('جعبه‌قرصِ هوشمند برای مادر', 'یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه.');
    await gapTurn('چطوری بفهمم کسی قبلاً همینو ساخته یا ثبت اختراع کرده؟', G_tB1, 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'p' })], 101);
    await addArea('s_problem', A_mkt); await addArea('s_problem', A_claims); await addArea('s_problem', A_prior);
    await reply(101, ['پاسخ به برگهٔ دستیار #101 — ساخته شد: سه حوزهٔ تازه (بازار، ادعاهای ثبت، پیشینهٔ اختراع).']); await check();
    e = await one(101); sy = await sysMsgs();
    chk(!!e && e.st === 'arrived' && e.tool === 'pr_prior_art' && !sy.some(t => ASKED.test(t)), 'D26-20 neg (tB1z): three areas at once, one of them named in full by the sheet title ⇒ «جست‌وجوی پیشینهٔ اختراع» arrives, no question :: ' + JSON.stringify({ e, sy: sy.slice(-1) }));

    // ---- tB1 / oD1x / tA1 p16 (U58, U59, A26-35, D26-21, D26-22): «نه» after arrival, then the take-back ----
    await wipe(); await fresh();
    const pidX = await bind('قرص‌دونِ هوشمند با وزن', 'یه قرص‌دون که از روی وزن بفهمه قرص برداشته شده یا نه.');
    await gapTurn('پیدا کردنِ یه پله تو سیگنالی که نویز داره و آروم هم می‌لغزه — تو این سامانه جایی داره؟', G_oD1, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'p' })], 101);
    await addArea('s_problem', A_chg);
    await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱ — ساخته شد: حوزهٔ تازهٔ pr_change_detection.']); await check();
    e = await one(101); sh = await sheet(101);
    chk(!!e && e.st === 'arrived' && sh.status === 'answered' && !(await p.evaluate(() => __status.length)), 'oD1x fixture + neg: the page\'s own arrival on an answered sheet writes no closing note and sets no status :: ' + JSON.stringify({ e, sh }));
    await turn('خب؟', 'برگردیم.', [cs({})]);
    await turn('نه، این همون نیست که می‌خواستم', 'باشه.', [cs({ sys_fit: { sheet: 101, fit: false, quote: 'این همون نیست که می‌خواستم' } })]);
    e = await one(101); sh = await sheet(101);
    chk(!!e && e.st === 'wait' && sh.status === 'open' && /همان چیزی نیست/.test(sh.last), 'oD1x fixture: her «نه» ⇒ wait, the sheet reopened by the page\'s note :: ' + JSON.stringify({ e, sh }));
    u = await turn('الان کجاها می‌تونم ببینم که منتظره؟', 'چهار جا.', [cs({})]);
    R7.d22 = /#101 «.*?» \[open/.test(sheetsLine(u)) && !/#101 «.*?» \[answered/.test(sheetsLine(u));
    chk(R7.d22, 'D26-22 oD1x p9: after the page reopened #101 the prompt\'s «برگه‌های باز» says [open], not the stale [answered] :: ' + sheetsLine(u).slice(0, 300));
    await turn('اشتباه کردم، دوباره نگاه کردم — همون بود', 'باشه.', [cs({ sys_fit: { sheet: 101, fit: true, quote: 'همون بود' } })]);
    await p.waitForTimeout(50);
    e = await one(101); sh = await sheet(101); sy = await sysMsgs(); nt = await notes(101); ev = await dz(pidX);
    const stL = await p.evaluate(() => __status.slice());
    R7.close = !!e && (e.st === 'arrived' || e.st === 'resumed') && e.how === 'ask' && sh.status === 'approved' && /پس گرفته شد/.test(sh.last) && !/همان چیزی نیست که/.test(sh.last) && /بسته شد/.test(sh.last) && stL.length === 1 && stL[0].st === 'approved';
    chk(R7.close, 'U59 / A26-35 / D26-21: after «اشتباه کردم … همون بود» sheet #101 is CLOSED with the take-back note — not «open», its last note is not «همان نیست» :: ' + JSON.stringify({ e, sh, stL }));
    chk(sy.some(t => ARR.test(t) && /برگه را بستم/.test(t)), 'U59: she is told the sheet was closed («وقتی «نه» رو پس گرفتم، برگه خودش بسته میشه یا باید به کسی بگم؟») :: ' + JSON.stringify(sy.slice(-1)));
    const ks = ev.filter(x => /^sys(?:back|mis|undo)$/.test(x.k)).map(x => x.k);
    R7.u58 = ks.join(',') === 'sysback,sysmis,sysundo,sysback' && /^پس گرفته شد/.test(ev.filter(x => x.k === 'sysback')[0].out) && !/^پس گرفته شد/.test(ev.filter(x => x.k === 'sysback')[1].out);
    chk(R7.u58, 'U58 (B26·D27): 📜 keeps, in time order, the first arrival (marked «پس گرفته شد»), her rejection, the take-back and the restored arrival — the first «🛎» is not re-stamped after her «نه» :: ' + JSON.stringify(ev.map(x => x.k + ' | ' + x.at.slice(11, 19) + ' | ' + x.out)));
    const rtX = await p.evaluate((pid) => { const M = APP.ROUTE.model(pid); return (M.pts || []).filter(x => x.k === 'rejoin').length; }, pidX);
    chk(rtX === 1, 'U58: 🧭 has ONE «برگشت به گامِ منتظر» — the withdrawn arrival is a detour point, not a second return :: ' + rtX);
    u = await turn('خب، ادامه بدیم', 'بله.', [cs({})]);
    chk(!/#101 «.*?» \[(?:open|answered)/.test(sheetsLine(u)), 'D26-22: after the close the prompt no longer carries #101 as open/answered :: ' + sheetsLine(u).slice(0, 300));
    // look-alike negative: a repeated «نه» is not a take-back; nothing is restored, nothing closed
    await wipe(); await fresh(); await bind('قرص‌دونِ هوشمند با وزن', 'یه قرص‌دون که از روی وزن بفهمه قرص برداشته شده یا نه.');
    await gapTurn('پیدا کردنِ یه پله تو سیگنالِ نویزی؟', G_oD1, 'نیست.', [cs({ ph: 'p' })], 101); await addArea('s_problem', A_chg);
    await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱ — ساخته شد: حوزهٔ تازهٔ pr_change_detection.']); await check();
    await turn('نه، این همون نیست', 'باشه.', [cs({})]); await turn('نه واقعاً، دوباره نگاه کردم، همون نیست', 'باشه.', [cs({ sys_fit: { sheet: 101, fit: false, quote: 'همون نیست' } })]);
    e = await one(101); sh = await sheet(101);
    chk(!!e && e.st === 'wait' && sh.status === 'open' && !(await p.evaluate(() => __status.length)), 'take-back neg: a repeated «نه» restores nothing and closes nothing :: ' + JSON.stringify({ e, sh }));

    // ---- tB1y بازوی ۱ (U61 = B26·D28): the Today ❓ line lands on a row that can be answered ----
    await wipe(); await fresh();
    const pidY = await bind('جعبه‌قرصِ هوشمند برای مادر', 'یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه.');
    await gapTurn('چطوری بفهمم کسی قبلاً همینو ساخته یا ثبت اختراع کرده؟', Object.assign({}, G_tB1, { step: '(۳) پیشینه: قبلاً کسی همینو ساخته یا ثبت اختراع کرده؟' }), 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'p' })], 101);
    await addArea('s_problem', A_hist); await reply(101, ['پاسخِ روتین: ساخته شد — حوزهٔ «تاریخِ فناوری و پیشینهٔ ابزارها» (pr_tech_history) اضافه شد.']); await check();
    e = await one(101); td = await todayAll(); c = await card(pidY);
    R7.u61 = !!e && e.st === 'wait' && e.ask === 'pr_tech_history' && td.some(t => /^❓/.test(t)) && c.btn.join(',') === 'yes,no';
    chk(R7.u61, 'U61 (B26·D28): the ❓ row on 🔭 has «✓ همان است / ✗ همان نیست» — it can be answered where the Today line lands :: ' + JSON.stringify({ e, td, c }));
    chk(await click(pidY, 'no'), 'U61: the «✗» button exists');
    e = await one(101); c = await card(pidY); td = await todayAll();
    chk(!!e && e.st === 'wait' && !e.ask && e.rej.indexOf('pr_tech_history') >= 0 && !c.btn.length && td.some(t => /دوباره منتظرِ برگهٔ #۱۰۱/.test(t)) && !td.some(t => /^❓/.test(t)), 'U61: «✗ همان نیست» on the card = her «نه» — back to waiting, the sheet reopened, the buttons gone (a row that is not a question has none) :: ' + JSON.stringify({ e, c, td }));
    await addArea('s_problem', { id: 'pr_family_history', fa: 'پیشینهٔ خانوادگی', desc_fa: 'پیشینهٔ خانواده و نیاکان' }); await check(); e = await one(101);
    if (e && e.ask) { chk(await click(pidY, 'yes'), 'U61: the «✓» button exists'); e = await one(101); chk((e.st === 'arrived') && e.how === 'ask' && e.tool === 'pr_family_history', 'U61: «✓ همان است» on the card = her «آره» ⇒ arrival by her own word :: ' + JSON.stringify(e)); }
    else chk(false, 'U61 fixture: the second candidate is asked :: ' + JSON.stringify(e));

    // ---- oA1 p30 (A26-50): the routine's reply to a step-less sheet gives ONE notice ----
    await wipe(); await fresh();
    const G_self = { title: 'خودشناسیِ سامانه: فهرستِ یک‌جای بخش‌ها و وضعِ هر کدام', area: 'lla-page', kind: 'build', abstract: 'کاربر می‌خواهد بداند سامانه چه بخش‌هایی دارد و هر کدام در چه وضعی است.', missing: 'نمایی که همهٔ بخش‌ها و وضعشان را یک‌جا نشان دهد نیست.', where: 'صفحه › 🧭 این برنامه چیست؟', how: 'یک نمای تازه', why_not: 'whole فقط معرفی است.', evidence: 'در فهرستِ نماها نیست.', confidence: 0.85 };
    await gapTurn('یه جا هست که همهٔ بخش‌های خودِ این سامانه و وضعشون رو یک‌جا ببینم؟', G_self, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({})], 105);
    await check(); sy = await sysMsgs(); td = await todayAll();
    chk((await sysAll()).length === 0 && !sy.some(t => /📬/.test(t)) && !td.some(t => /📬/.test(t)), 'A26-50 neg: a step-less sheet with no reply yet — no notice, no waiting entry :: ' + JSON.stringify({ sy: sy.slice(-2), td }));
    await adv(1); await reply(105, ['پاسخ به برگهٔ دستیار #105: نمای «🧩 بخش‌های سامانه» افزوده شد و وضعِ هر بخش را نشان می‌دهد.']); await check(); await check();
    sy = await sysMsgs(); td = await todayAll();
    R7.a50 = sy.filter(t => /📬 برگهٔ #۱۰۵/.test(t)).length === 1 && /بخش‌های سامانه/.test(sy.filter(t => /📬/.test(t))[0] || '') && td.filter(t => /📬 برگهٔ #۱۰۵/.test(t)).length === 1;
    chk(R7.a50, 'A26-50 oA1 p30: the routine answered the step-less sheet #105 ⇒ ONE 📬 line in the chat (with the reply\'s gist) and one in Today — after two sweeps still one :: ' + JSON.stringify({ sy: sy.slice(-2), td }));
    await turn('ممنون', 'خواهش.', [cs({})]); await check(); await turn('یه چیزِ دیگه', 'بگو.', [cs({})]); await check();
    sy = await sysMsgs(); td = await todayAll();
    chk(sy.filter(t => /📬/.test(t)).length === 1 && !td.some(t => /📬/.test(t)), 'A26-50: not a notice on every later turn — one line, and the Today line leaves once she went on in that chat :: ' + JSON.stringify({ n: sy.filter(t => /📬/.test(t)).length, td }));

    // ---- tB1z (U63) + aD4 (D26-54): pieces after closure ----
    await wipe(); await fresh();
    const pidZ = await bind('جعبه‌قرصِ هوشمند برای مادر', 'یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه.');
    await gapTurn('چطوری بفهمم کسی قبلاً همینو ساخته یا ثبت اختراع کرده؟', G_tB1, 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'p' })], 101, { steps: [{ t: '(۱) تشخیصِ برداشتن با وزن', s: 'done' }, { t: '(۳) پیشینهٔ اختراع (منتظرِ برگهٔ #۱۰۱)', s: 'todo' }] });
    chk((await steps()).some(t => /منتظرِ برگهٔ #۱۰۱/.test(t)), 'U63 neg: while the step really waits, the session step keeps its «منتظرِ برگهٔ #۱۰۱» mark :: ' + JSON.stringify(await steps()));
    await addArea('s_problem', A_prior); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ `pr_prior_art` ساخته شد.']); await check();
    await turn('خب؟', 'برگردیم.', [cs({})]); await turn('گشتم؛ فرقِ ایده‌ام وزنِ هر خانه‌ست.', 'خوب.', [cs({ ph: 'c', said: ['result'], result: 'فرق: وزنِ هر خانه' })]);
    R7.d31 = !(await steps()).some(t => /منتظرِ برگهٔ/.test(t)) && (await steps()).some(t => /پیشینهٔ اختراع/.test(t));
    chk(R7.d31, 'U63 (B26x·D31): after arrival and resume the session step no longer says «(منتظرِ برگهٔ #۱۰۱)» :: ' + JSON.stringify(await steps()));
    await p.evaluate((pid) => __liveSet(pid, (so, L) => { L.state = 'solved'; }), pidZ);
    const G_lic = { title: 'مجوزِ وسیلهٔ پزشکی برای فروش', area: 'sys-territory', kind: 'build', step: 'مجوزِ وسیلهٔ پزشکی برای فروشِ جعبه‌قرص', abstract: 'کسی که وسیله‌ای برای سلامت ساخته می‌خواهد بداند برای فروشش چه مجوزی لازم است.', missing: 'حوزه‌ای برای مقرراتِ وسیلهٔ پزشکی و مجوزِ فروش نیست.', where: 'قلمروِ سامانه‌ها', how: 'حوزهٔ تازه', why_not: 'pr_prior_art پیشینه است، نه مجوز.', evidence: 'حوزه‌ای برای مجوز نیست.', confidence: 0.85 };
    await gapTurn('یه تکهٔ دیگه: برای فروشش مجوزِ وسیلهٔ پزشکی می‌خواد؟ اینجا چیزی براش هست؟', G_lic, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({})], 102);
    e = await one(102); td = await todayAll(); ev = await dz(pidZ);
    R7.d30 = !!e && e.late && e.st === 'wait' && e.area === 'sys-territory' && td.some(t => /⏸ تکهٔ «مجوزِ وسیلهٔ پزشکی برای فروشِ جعبه‌قرص» منتظرِ برگهٔ #۱۰۲ است/.test(t) && /بسته می‌ماند/.test(t));
    chk(R7.d30, 'U63 (B26x·D30): the piece that waits after closure (#102) has its own Today line :: ' + JSON.stringify({ e, td }));
    const wl = (ev.filter(x => x.k === 'syswait' && /#۱۰۲/.test(x.title))[0] || {}).lines || [];
    chk(wl.some(l => /همین تکه/.test(l)) && !wl.some(l => /همین گام از سر گرفته می‌شود/.test(l)), 'U63: 📜 of a piece after closure says «این تکه … مسئله بسته می‌ماند», not «همین گام از سر گرفته می‌شود» :: ' + JSON.stringify(wl));
    chk((await p.evaluate((pid) => (APP.S.get('eprog_' + pid).solve.live || {}).state, pidZ)) === 'solved', 'U63: the problem stays closed');
    // aD4 p8: a question about the page itself, with a gap.step the model should not have sent — never a waiting point on the closed problem
    await wipe(); await fresh();
    const pidL = await bind('تخته برای کتابخانهٔ نوه', 'چند تخته برای کتابخانهٔ نوه‌ام بخرم؟');
    await turn('پنج تخته می‌خرم و درست می‌سازم.', 'خوب.', [cs({ ph: 'b', said: ['result'], result: 'پنج تخته' })]);
    await p.evaluate((pid) => __liveSet(pid, (so, L) => { L.state = 'solved'; }), pidL);
    const G_prof = { title: 'نیم‌رخِ جدا برای چند نفر در یک مرورگر (پدربزرگ و نوه با یک گوشی)', area: 'lla-page', kind: 'build', step: 'پرسشِ کاربر: نوه با همین گوشی کار می‌کند — معماهای بزرگسال را می‌بیند؟ کارنامه جداست؟', abstract: 'چند نفر که از یک دستگاه و یک مرورگر با صفحه کار می‌کنند.', missing: 'نیم‌رخِ جدا برای هر نفر: تاریخِ تولد، کارنامهٔ ذهن، مسئله‌ها و معماهای روزانهٔ جدا.', where: 'تنظیماتِ صفحه › سن و تاریخِ تولد', how: 'انتخابِ نیم‌رخ هنگامِ باز شدنِ صفحه', why_area: 'رفتار و دادهٔ خودِ صفحه است، نه حوزهٔ دانشی.', why_not: 'تنظیمات فقط یک تاریخِ تولد می‌گیرد.', evidence: 'هیچ نمایی برای نفرِ دوم نیست.', confidence: 0.86 };
    await gapTurn('یه سؤالِ دیگه هم دارم. نوه‌ام گاهی با همین گوشیِ من میاد و خودش با این برنامه کار می‌کنه. اون معماهای روزانه که برای بزرگ‌ترهاست رو هم به اون نشون میده؟ و این کارنامهٔ ذهنی که از من ساختید با مالِ اون قاطی میشه یا جداست؟', G_prof, 'صادقانه: جدا نیست؛ برای ساختنش برگه‌ای را بررسی می‌کنم.', [cs({})], 101);
    ev = await dz(pidL); const rtL = await p.evaluate((pid) => { const M = APP.ROUTE.model(pid); return (M.dets || []).filter(d => d.kind === 'sys').length; }, pidL);
    R7.d54 = (await sysAll()).length === 0 && !ev.length && rtL === 0 && !(await sysMsgs()).some(t => /⏸/.test(t));
    chk(R7.d54, 'D26-54 aD4 p8: the profile question\'s sheet (about the page itself) puts no «⏸ منتظرِ برگهٔ #۱۰۱» on the closed library problem — 📜 and 🧭 clean :: ' + JSON.stringify({ A: await sysAll(), ev, rtL }));
    await check(); await adv(1); await reply(101, ['پاسخ به برگهٔ دستیار #101: نیم‌رخِ جدا در برنامهٔ دورِ بعد گذاشته شد.']); await check();
    chk((await sysMsgs()).filter(t => /📬 برگهٔ #۱۰۱/.test(t)).length === 1, 'D26-54 + A26-50: that sheet is step-less — its reply is told once (📬) :: ' + JSON.stringify((await sysMsgs()).slice(-1)));

    // ---- tA1 p13 (A26-36): sys_done on a sheet the routine closed without building ----
    await wipe(); await fresh();
    const pidA = await bind('کیتِ آبیاریِ قطره‌ایِ خورشیدی', 'برای باغچهٔ پدر و مادرم کیتِ آبیاریِ قطره‌ایِ خورشیدی می‌سازم.');
    const G_safe = { title: 'ایمنیِ ساختِ خانگی: برقِ ولتاژ پایین و پمپ کنارِ آب', area: 'sys-territory', kind: 'build', step: '۵ ایمنی: برق و پمپ کنارِ آب', abstract: 'کسی که وسیله‌ای برقی کنارِ آب می‌سازد باید خطرهایش را بشناسد.', missing: 'حوزه‌ای برای ایمنیِ برقِ ولتاژ پایین کنارِ آب نیست.', where: 'قلمروِ سامانه‌ها', how: 'حوزهٔ تازه', why_not: 'pr_hypothesis_testing آزمونِ فرضیه است.', evidence: 'حوزه‌ای برای ایمنیِ ساخت نیست.', confidence: 0.85 };
    await gapTurn('تکهٔ ۵، ایمنی: برق و پمپ کنارِ آب — اینو بلد نیستم. اینجا چیزی هست؟', G_safe, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'p' })], 101);
    await reply(101, ['پاسخ به برگهٔ دستیار #101: این نیاز را حوزهٔ «خطر، عدم‌قطعیت و ابهام» (dc_risk_uncertainty) در قلمروِ تصمیم پوشش می‌دهد؛ از همان استفاده شود. چیزِ تازه‌ای ساخته نشد.']); await check();
    e = await one(101); const n0 = (await notes(101)).length;
    chk(!!e && e.st === 'declined', 'A26-36 fixture: «چیزِ تازه‌ای ساخته نشد» ⇒ «⛔ برگهٔ #۱۰۱ بی ساختن بسته شد» :: ' + JSON.stringify(e));
    await turn('راهِ دیگه‌ای هم هست؟', 'بله.', [cs({ sys_done: { sheet: 101, quote: 'راهِ دیگه‌ای هم هست؟' } })]);
    e = await one(101); chk(!!e && e.st === 'declined', 'A26-36 neg: a question («راهِ دیگه‌ای هم هست؟») is not a report of having done it :: ' + JSON.stringify(e));
    await turn('دیدم جوابی که زیرِ برگهٔ ایمنی اومد به کارم نمیاد. به هر حال خودم یه راه دیگه پیدا کردم: از پسرعموم که برق‌کاره پرسیدم؛ گفت یه فیوزِ ۵ آمپری کنارِ قطبِ باتری بذارم. ایمنی رو این‌طوری حل کردم.', 'خوب.', [cs({ ph: 'e', said: ['plan'], sys_done: { sheet: 101, quote: 'خودم یه راه دیگه پیدا کردم: از پسرعموم که برق‌کاره پرسیدم' } })]);
    e = await one(101); sy = await sysMsgs(); ev = await dz(pidA);
    R7.a36 = !!e && e.st === 'other' && sy.some(t => /✓ گامِ «۵ ایمنی: برق و پمپ کنارِ آب» از راهِ دیگری برداشته شد/.test(t)) && ev.some(x => x.k === 'sysother' && /از راهِ دیگری برداشته شد/.test(x.title)) && (await notes(101)).length === n0;
    chk(R7.a36, 'A26-36 tA1 p13: sys_done on the sheet the routine closed without building is not silent — the «✓ … از راهِ دیگری برداشته شد» line and the 📜 event; no note that would reopen a sheet nobody needs :: ' + JSON.stringify({ e, sy: sy.slice(-1), ev: ev.map(x => x.k) }));

    // ---- oD1n / oD1r (D26-19): the reason line names only overlap that exists ----
    await wipe(); await fresh();
    await bind('قرص‌دونِ هوشمند با وزن', 'یه قرص‌دون که از روی وزن بفهمه قرص برداشته شده یا نه.');
    await gapTurn('پیدا کردنِ یه پله تو سیگنالی که نویز داره — جایی داره؟', G_oD1, 'نیست.', [cs({ ph: 'p' })], 101);
    await addArea('s_problem', { id: 'pr_base_rates', fa: 'نرخِ پایه در برآورد', desc_fa: 'برآورد بر پایهٔ نرخِ پایهٔ رده‌ای که مورد از آن است' });
    await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱ — حوزهٔ «نرخِ پایه در برآورد» (pr_base_rates) افزوده شد.']); await check();
    e = await one(101); sy = await sysMsgs(); const misL = sy.filter(t => MIS.test(t)).slice(-1)[0] || '';
    const stepTk = await toks(G_oD1.step), cited = ((/با خودِ این گام فقط در ((?:«[^»]+»،? ?)+)/.exec(misL) || [])[1] || '').match(/«[^»]+»/g) || [];
    R7.d19 = !!e && e.st === 'wait' && !!misL && !/با نیازِ این گام فقط در «پایه» مشترک است/.test(misL) && cited.every(w => stepTk.indexOf(w.replace(/[«»]/g, '')) >= 0) && (/با خودِ این گام هیچ واژهٔ مشترکی ندارد/.test(misL) || cited.length > 0);
    chk(R7.d19, 'D26-19 oD1n/oD1r: the «جواب نداد» reason never says «با نیازِ این گام فقط در «پایه» مشترک است» — «پایه» is the sheet\'s word («آستانه بر پایهٔ نویز»), not hers :: ' + JSON.stringify({ e, misL }));
    info.R7 = R7;
  });

  // ================= bank: every Q7 entry of VARIANTS_R26 =================
  await section('bank', async () => {
    // «گامِ عایق»: step «۳ — کدام عایق برای سقفِ کارگاه صدا را کمتر رد می‌کند؟» ⏸ waiting for system sheet #101 (gap.step = 3)
    const STEP = '۳ — کدام عایق برای سقفِ کارگاه صدا را کمتر رد می‌کند؟';
    const G_ins = { title: 'روشِ برگزیدنِ عایقِ صوتی برای یک سقف', area: 'sys-territory', kind: 'build', step: STEP, abstract: 'کسی که می‌خواهد صدا از سقف کمتر رد شود باید بداند عایق‌ها را چطور با هم بسنجد.',
      missing: 'حوزه‌ای برای سنجشِ عایق‌های صوتی (ردشدنِ صدا، جنس و ضخامت) بر پایهٔ دادهٔ آزمون نیست.', where: 'قلمروِ سامانه‌ها — حلِ مسئله (s_problem)', how: 'حوزهٔ تازه با پرسش‌های کلیدی',
      why_not: 'pr_hypothesis_testing آزمونِ فرضیه است، نه سنجشِ عایق.', evidence: 'در نقشهٔ قلمرو حوزه‌ای برای عایقِ صوتی نیست.', confidence: 0.85 };
    const A_cmp = { id: 'pr_ins_compare', fa: 'مقایسهٔ عایق‌های صوتیِ سقف', desc_fa: '' }, A_pass = { id: 'pr_ins_pass', fa: 'سنجشِ ردشدنِ صدا از عایقِ سقف', desc_fa: '' };
    const A_passW = { id: 'pr_ins_pass_w', fa: 'سنجشِ ردشدنِ صدا از عایقِ سقفِ کارگاه', desc_fa: 'کدام عایق صدا را کمتر از سقفِ کارگاه رد می‌کند: آزمونِ ردشدنِ صدا' };
    const A_budget = { id: 'dc_shop_budget', fa: 'بودجه‌بندیِ خریدِ کارگاه', desc_fa: 'بودجه‌بندیِ خریدِ ابزار و مصالح' }, A_cost = { id: 'dc_shop_cost', fa: 'برآوردِ هزینهٔ کارگاه', desc_fa: 'برآوردِ هزینهٔ راه‌اندازی' };
    const A_base = { id: 'pr_material_db', fa: 'پایهٔ دادهٔ مصالح', desc_fa: 'پایهٔ داده‌ای از مصالحِ ساختمانی و بهایشان' };
    const G_frame = Object.assign({}, G_ins, { missing: G_ins.missing + ' در نمای «🧮 ماشینِ برآورد» چیزی برای این گام نیست.' });
    const setup = async (more, g) => { await wipe(); await fresh(); const pid = await bind('عایقِ سقفِ کارگاه', 'سقفِ کارگاهم صدا رد می‌کنه؛ می‌خوام عایقش کنم.');
      await gapTurn('گامِ ۳: کدوم عایق برای سقفِ کارگاه صدا رو کمتر رد می‌کنه؟ اینجا روشی براش هست؟', g || G_ins, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'p' })], 101, more || null); return pid; };
    const tie = async () => { const pid = await setup(); await addArea('s_problem', A_cmp); await addArea('s_problem', A_pass);
      await reply(101, ['پاسخ به برگهٔ دستیار #101 — دو حوزهٔ تازه افزوده شد: «مقایسهٔ عایق‌های صوتیِ سقف» و «سنجشِ ردشدنِ صدا از عایقِ سقف».']); await check(); return pid; };
    const arrived = async () => { const pid = await setup(); await addArea('s_problem', A_passW); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «سنجشِ ردشدنِ صدا از عایقِ سقفِ کارگاه» افزوده شد.']); await check(); return pid; };
    let pid;
    // 1 — real tie ⇒ ask naming both, chat and Today; no arrival
    pid = await tie(); await p.evaluate(() => APP.dueList()); await check();
    e = await one(101); sy = await sysMsgs(); td = await todayAll();
    const both = (t) => /مقایسهٔ عایق‌های صوتیِ سقف/.test(t) && /سنجشِ ردشدنِ صدا از عایقِ سقف/.test(t);
    T(1, !!e && e.st === 'wait' && !!e.ask && !e.tool && !sy.some(t => ARR.test(t)) && sy.filter(t => ASKED.test(t)).length === 1 && both(sy.filter(t => ASKED.test(t))[0]) && td.filter(t => /^❓/.test(t)).length === 1 && both(td.filter(t => /^❓/.test(t))[0]) && !td.some(t => ARR.test(t)), { e, sy: sy.slice(-1), td });
    // 2 — she answers by naming one
    await turn('خب؟', 'یک پرسش.', [cs({})]);
    await turn('دومی، همون سنجشِ ردشدنِ صدا', 'باشه.', [cs({})]); await turn('باشه، بریم', 'برگردیم.', [cs({})]);
    e = await one(101); sy = await sysMsgs(); ev = await dz(pid);
    T(2, !!e && (e.st === 'arrived' || e.st === 'resumed') && e.tool === 'pr_ins_pass' && e.how === 'ask' && sy.filter(t => ASKED.test(t)).length === 1 && ev.filter(x => x.k === 'sysask').length === 1 && ev.filter(x => x.k === 'sysback').length === 1 && /^رسید \(تأییدِ تو\)/.test((ev.filter(x => x.k === 'syswait')[0] || {}).out || '') && ev.some(x => x.k === 'sysresume'), { e, ev: ev.map(x => x.k + ' | ' + x.out), sy: sy.slice(-1) });
    // 3 — a candidate exists but overlaps only through frame / view words ⇒ ask; wording cites only her own words
    pid = await setup(null, G_frame); await addArea('s_decision', A_cost); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «برآوردِ هزینهٔ کارگاه» افزوده شد.']); await check();
    e = await one(101); sy = await sysMsgs(); nt = await notes(101);
    const stTk = await toks(STEP), why3 = (e && e.why.slice(-1)[0]) || '', own3 = ((/واژهٔ مشترک با خودِ گام: ((?:«[^»]+»،? ?)+)/.exec(why3) || [])[1] || '').match(/«[^»]+»/g) || [];
    T(3, !!e && e.st === 'wait' && e.ask === 'dc_shop_cost' && !sy.some(t => ARR.test(t)) && !sy.some(t => MIS.test(t)) && !nt.length && own3.length > 0 && own3.every(w => stTk.indexOf(w.replace(/[«»]/g, '')) >= 0) && !/خودِ گام:[^؛)]*«برآورد»/.test(why3), { e, own3, stTk });
    // 4 — the reply names no area at all ⇒ reject and reopen; nothing to ask
    pid = await setup(); await reply(101, ['پاسخ به برگهٔ دستیار #101 — بررسی شد؛ فعلاً چیزی برای این نیاز ساخته نشده است.']); await check();
    e = await one(101); sy = await sysMsgs(); nt = await notes(101); sh = await sheet(101); td = await todayAll();
    T(4, !!e && e.st === 'wait' && !e.ask && !sy.some(t => ARR.test(t) || ASKED.test(t)) && sy.some(t => MIS.test(t) && /هیچ نما یا حوزه‌ای را که برای این گام ساخته شده باشد نام نبرد/.test(t) && /منتظر می‌ماند/.test(t)) && nt.length === 1 && sh.status === 'open' && !td.some(t => ARR.test(t) || /^❓/.test(t)), { e, sy: sy.slice(-1), sh });
    // 5 — arrival, «نه», take-back ⇒ restored; sheet closed with the note; the prompt's list not stale
    pid = await arrived();
    await turn('نه، این همون نیست', 'باشه.', [cs({})]); const mid5 = { e: await one(101), sh: await sheet(101) };
    u = await turn('اشتباه گفتم، همون بود', 'باشه.', [cs({})]); await p.waitForTimeout(50); const u5 = await turn('بریم', 'برگردیم.', [cs({})]);
    e = await one(101); sh = await sheet(101); ev = await dz(pid);
    T(5, mid5.e.st === 'wait' && mid5.sh.status === 'open' && !!e && (e.st === 'arrived' || e.st === 'resumed') && e.tool === 'pr_ins_pass_w' && sh.status === 'approved' && /پس گرفته شد/.test(sh.last) && !/#101 «.*?» \[(?:open|answered)/.test(sheetsLine(u5)), { e, sh, mid5, line: sheetsLine(u5).slice(0, 200) });
    // 6 — 📜 in time order, each its own event
    const k6 = ev.filter(x => /^sys(?:back|mis|undo)$/.test(x.k));
    T(6, k6.map(x => x.k).join(',') === 'sysback,sysmis,sysundo,sysback' && k6.every((x, i) => i === 0 || String(k6[i - 1].at) <= String(x.at)) && /^پس گرفته شد/.test(k6[0].out), k6.map(x => x.k + ' | ' + x.at + ' | ' + x.out));
    // 7 — the Today ❓ line opens a row that can be answered there
    pid = await setup(); await addArea('s_decision', A_cost); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «برآوردِ هزینهٔ کارگاه» افزوده شد.']); await check();
    td = await todayAll(); const went = await p.evaluate(() => { const it = APP.dueList().filter(x => x.sys23 && /^❓/.test(x.txt))[0]; if (!it) return null; it.go(); return APP.state.view + ':' + APP.state.arg; });
    c = await p.evaluate(() => { const x = document.querySelector('.lp-syscard'); return x ? { text: x.textContent, btn: [...x.querySelectorAll('[data-fit]')].map(b => b.textContent) } : { text: '', btn: [] }; });
    T(7, td.some(t => /^❓/.test(t)) && went === 'lprob:' + pid && c.btn.some(t => /✓ همان است/.test(t)) && c.btn.some(t => /✗ همان نیست/.test(t)), { td, went, c });
    // 8 — a step-less system sheet gets a reply ⇒ ONE notice with the gist
    await wipe(); await fresh();
    const G_sys = { title: 'دکمهٔ «برگرد» در نمای نقشه‌ها کار نمی‌کند', area: 'lla-page', kind: 'fix', abstract: 'کاربر در نمای نقشه‌ها گیر می‌کند.', missing: 'دکمهٔ برگشت در نمای نقشه‌ها به نمای پیشین نمی‌رود.', where: 'نمای 🗺 نقشه‌ها', how: 'اصلاحِ دکمه', why_not: 'قلمرو نیست؛ خطای خودِ صفحه است.', evidence: 'کاربر: «برگرد کار نمی‌کنه».', confidence: 0.9 };
    await p.evaluate(() => { window.__consult0 = __consult; });
    await gapTurn('تو نمای نقشه‌ها دکمهٔ «برگرد» کار نمی‌کنه.', G_sys, 'برگه‌اش را ثبت می‌کنم.', [cs({})], 107);
    await check(); const before8 = { sy: (await sysMsgs()).filter(t => /📬/.test(t)).length, td: (await todayAll()).filter(t => /📬/.test(t)).length, ent: (await sysAll()).length };
    // 18 (neg) — no reply yet ⇒ no notice
    T(18, before8.sy === 0 && before8.td === 0 && before8.ent === 0, before8);
    await adv(1); await reply(107, ['پاسخ به برگهٔ دستیار #107: دکمهٔ برگشتِ نمای نقشه‌ها اصلاح شد.']); await check(); await check();
    sy = await sysMsgs(); td = await todayAll(); const n8 = sy.filter(t => /📬 برگهٔ #۱۰۷/.test(t));
    await turn('ممنون', 'خواهش.', [cs({})]); await check(); await turn('خب', 'بله.', [cs({})]); await check();
    const after8 = { sy: (await sysMsgs()).filter(t => /📬/.test(t)).length, td: (await todayAll()).filter(t => /📬/.test(t)).length };
    T(8, n8.length === 1 && /دکمهٔ برگشتِ نمای نقشه‌ها اصلاح شد/.test(n8[0]) && td.filter(t => /📬 برگهٔ #۱۰۷/.test(t)).length === 1 && after8.sy === 1 && after8.td === 0, { n8, td, after8 });
    // 9 — the problem is closed while #101 waits; three days later a fitting area arrives
    pid = await setup({ steps: [{ t: '(۳) عایقِ سقف — منتظرِ برگهٔ #۱۰۱', s: 'now' }] });
    await turn('فعلاً با پشمِ سنگ بستم؛ تمام.', 'خوب.', [cs({ ph: 'b', said: ['result'], result: 'پشمِ سنگ' })]);
    await p.evaluate((pid) => __liveSet(pid, (so, L) => { L.state = 'solved'; }), pid); await check();
    const m9 = await one(101); await adv(3); await addArea('s_problem', A_passW); await check();
    e = await one(101); td = await todayAll(); sy = await sysMsgs(); await turn('سلام', 'سلام.', [cs({})]);
    const st9 = await p.evaluate((pid) => (APP.S.get('eprog_' + pid).solve.live || {}).state, pid);
    T(9, !!m9 && m9.st === 'moot' && !!e && e.moot === 'pr_ins_pass_w' && td.some(t => /🛎 ابزارِ «سنجشِ ردشدنِ صدا از عایقِ سقفِ کارگاه» آمد/.test(t) && /بسته می‌ماند/.test(t)) && st9 === 'solved' && !(await steps()).some(t => /منتظرِ برگهٔ #۱۰۱/.test(t)), { m9, e, td, st9, steps: await steps() });
    // 10 — a profile question's sheet waits; the unrelated closed library problem carries no ⏸ point
    await wipe(); await fresh();
    const pidLib = await bind('قفسهٔ کتابخانه', 'چند تخته برای قفسهٔ کتابخانه لازم است؟');
    await turn('شش تخته می‌خرم.', 'خوب.', [cs({ ph: 'b', said: ['result'], result: 'شش تخته' })]);
    await p.evaluate((pid) => __liveSet(pid, (so, L) => { L.state = 'solved'; }), pidLib);
    await gapTurn('برادرم هم با همین لپ‌تاپ کار می‌کنه؛ کارنامه‌هامون قاطی میشه؟', { title: 'نیم‌رخِ جدا برای دو نفر در یک مرورگر', area: 'lla-page', kind: 'build', step: 'پرسشِ کاربر: کارنامهٔ دو نفر در یک مرورگر جداست؟', abstract: 'دو نفر با یک مرورگر.', missing: 'نیم‌رخِ جدا برای هر نفر نیست.', where: 'تنظیماتِ صفحه', how: 'انتخابِ نیم‌رخ', why_area: 'رفتارِ خودِ صفحه است.', why_not: 'تنظیمات یک تاریخِ تولد دارد.', evidence: 'نمایی برای نفرِ دوم نیست.', confidence: 0.86 }, 'جدا نیست؛ برگه‌اش را بررسی می‌کنم.', [cs({})], 102);
    ev = await dz(pidLib); const rt10 = await p.evaluate((pid) => { const M = APP.ROUTE.model(pid); return { dets: (M.dets || []).filter(d => d.kind === 'sys').length, pts: (M.pts || []).filter(x => /^sys/.test(x.k)).length }; }, pidLib);
    T(10, !ev.length && rt10.dets === 0 && rt10.pts === 0 && !(await sysAll()).some(x => x.pid === pidLib), { ev, rt10, A: await sysAll() });
    // 11 — rejected by her and reopened; then the routine closes the sheet with no new area
    pid = await arrived(); await turn('نه، این همون نیست', 'باشه.', [cs({})]); await check();
    const s11 = (await sysMsgs()).length; await setSt(101, 'closed'); await check(); await check();
    e = await one(101); sy = (await sysMsgs()).slice(s11); sh = await sheet(101);
    T(11, !!e && e.st === 'wait' && sy.length === 1 && /برگه بی هیچ ابزار یا جوابِ تازه‌ای برای این گام بسته شد/.test(sy[0]) && /منتظر می‌ماند/.test(sy[0]), { e, sy, sh });
    // 12 — five checks on five days: nothing, nothing, an unfit reply, an ask, an arrival ⇒ each line names what came that time
    pid = await setup(); await adv(1); await check(); await adv(1); await check();
    await adv(1); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «برآورد و مسئله‌های فرمی» (pr_estimation_fermi) کامل‌تر شد.']); await check();
    await adv(1); await addArea('s_decision', A_cost); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «برآوردِ هزینهٔ کارگاه» افزوده شد.']); await check();
    await turn('خب؟', 'یک پرسش.', [cs({})]); await turn('نه، این هزینه‌ست؛ من صدا رو می‌خوام', 'باشه.', [cs({})]);
    await adv(1); await addArea('s_problem', A_passW); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «سنجشِ ردشدنِ صدا از عایقِ سقفِ کارگاه» افزوده شد.']); await check();
    ev = (await dz(pid)).filter(x => /^sys(?:mis|ask|back)$/.test(x.k)); const tl = ev.map(x => x.title);
    T(12, tl.length === 4 && new Set(tl).size === 4 && /برآورد و مسئله‌های فرمی/.test(tl[0]) && /برآوردِ هزینهٔ کارگاه/.test(tl[1]) && /برآوردِ هزینهٔ کارگاه/.test(tl[2]) && /سنجشِ ردشدنِ صدا/.test(tl[3]), tl);
    // 13 — the reason for «جواب نداد» cites only overlap that exists
    pid = await setup(); await addArea('s_problem', A_base); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «پایهٔ دادهٔ مصالح» افزوده شد.']); await check();
    e = await one(101); sy = await sysMsgs(); const mis13 = sy.filter(t => MIS.test(t)).slice(-1)[0] || '', ask13 = (e && e.why.slice(-1)[0]) || '';
    T(13, !!e && e.st === 'wait' && !e.tool && !/فقط در «پایه» مشترک است/.test(mis13 + ' ' + ask13) && !/خودِ (?:این )?گام[^؛)]*«پایه»/.test(mis13 + ' ' + ask13) && (!!mis13 || !!e.ask), { e, mis13 });
    // 14 (neg) — two candidates, ONE clearly fits ⇒ arrival without asking
    pid = await setup(); await addArea('s_problem', A_cmp); await addArea('s_decision', A_budget); await reply(101, ['پاسخ به برگهٔ دستیار #101 — دو حوزه افزوده شد: «مقایسهٔ عایق‌های صوتیِ سقف» و «بودجه‌بندیِ خریدِ کارگاه».']); await check();
    e = await one(101); sy = await sysMsgs();
    T(14, !!e && e.st === 'arrived' && e.tool === 'pr_ins_compare' && !sy.some(t => ASKED.test(t)) && !sy.some(t => /بودجه‌بندی/.test(t)), { e, sy: sy.slice(-1) });
    // 15 (neg) — one clear single fit ⇒ arrival, not an ask
    pid = await setup(); await addArea('s_problem', A_passW); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ «سنجشِ ردشدنِ صدا از عایقِ سقفِ کارگاه» افزوده شد.']); await check();
    e = await one(101); sy = await sysMsgs();
    T(15, !!e && e.st === 'arrived' && e.tool === 'pr_ins_pass_w' && sy.some(t => ARR.test(t) && WEIGHED.test(t)) && !sy.some(t => ASKED.test(t)), { e, sy: sy.slice(-1) });
    // 16 (neg) — she rejects both
    pid = await tie(); await turn('خب؟', 'یک پرسش.', [cs({})]); await turn('هیچ‌کدوم، من دنبالِ یه جدولِ مقایسه بودم نه این‌ها', 'باشه.', [cs({})]);
    e = await one(101); sy = await sysMsgs(); sh = await sheet(101);
    T(16, !!e && e.st === 'wait' && !e.ask && !e.tool && e.rej.indexOf('pr_ins_compare') >= 0 && e.rej.indexOf('pr_ins_pass') >= 0 && sh.status === 'open' && /جدولِ مقایسه/.test(sh.last) && !sy.some(t => ARR.test(t)), { e, sh });
    // 17 (neg) — a repeated «نه» is not a take-back
    pid = await arrived(); await turn('نه، این همون نیست', 'باشه.', [cs({})]); await turn('نه واقعاً، دوباره نگاه کردم، همون نیست', 'باشه.', [cs({ sys_fit: { sheet: 101, fit: false, quote: 'همون نیست' } })]);
    e = await one(101); sh = await sheet(101);
    T(17, !!e && e.st === 'wait' && !e.tool && sh.status === 'open' && !(await p.evaluate(() => __status.length)), { e, sh });
    // 19 (neg) — the ⏸ point is shown on ITS OWN open problem
    pid = await setup(); const rt19 = await p.evaluate((pid) => { const M = APP.ROUTE.model(pid); return { dets: (M.dets || []).filter(d => d.kind === 'sys' && d.open).length, waits: (M.pts || []).filter(x => x.k === 'syswait').length }; }, pid);
    T(19, rt19.dets === 1 && rt19.waits === 1 && (await dz(pid)).some(x => x.k === 'syswait' && /⏸ منتظرِ برگهٔ #۱۰۱/.test(x.title)), rt19);
    // 20 (neg) — she does not answer the tie ask ⇒ it stays pending
    pid = await tie(); await turn('خب؟', 'یک پرسش.', [cs({})]); await turn('یه لحظه صبر کن، اول یه سؤالِ دیگه دارم', 'بگو.', [cs({})]);
    e = await one(101); td = await todayAll(); sy = await sysMsgs();
    T(20, !!e && e.st === 'wait' && !!e.ask && e.alt.length === 1 && !e.rej.length && td.some(t => /^❓/.test(t)) && !sy.some(t => ARR.test(t) || MIS.test(t)), { e, td });
  });

  await b.close();
  const miss = QI.filter(i => info.bank[i] === undefined && !info.nc[i]);
  if (!process.env.ONLY || process.env.ONLY.split(',').includes('bank')) chk(!miss.length, 'bank: every Q7 entry is tested or has a reason :: ' + JSON.stringify(miss));
  const pass = QI.filter(i => info.bank[i] === true).length, tested = QI.filter(i => info.bank[i] !== undefined).length;
  console.log('runners: ' + JSON.stringify(info.R7 || {}));
  console.log('bank Q7: ' + pass + '/' + tested + ' pass (of ' + QI.length + '); nc: ' + Object.keys(info.nc).length + (Object.keys(info.nc).length ? ' ' + JSON.stringify(info.nc) : ''));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
