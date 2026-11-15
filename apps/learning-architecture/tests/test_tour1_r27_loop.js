// تورِ پولیا (دستهٔ ۱، دورِ ۲۷، سهمِ «loop» — ۲۰۲۶-۱۱-۱۵) — DECISIONS_R27: R7 (حلقهٔ قلمرو) + روشن‌سازیِ C54 و C20 (بازگفته).
//  runners  جمله‌ها، برگه‌ها و حوزه‌های خودِ دورِ ۲۷ —
//           tB1 (B27·D16): «بررسیِ بازار و رقیبان» فقط با واژه‌های قاب ⇒ بی‌صدا، برگه «answered»؛ دو جوابِ روتین در یک گذر خوانده شد و اولی گم شد.   oD1f (D27-27): «جایگاهِ ایده و برگه‌های کمبودِ سامانه» ⇒ رد به‌جای پرسش.
//           tB1z (B27·D19): «جستجوی پیشینهٔ اختراع» هم‌امتیاز با «نوشتنِ ادعاهای ثبتِ اختراع» پرسیده شد؛ p9 «با همون «جستجوی پیشینهٔ اختراع» گشتم» خوانده نشد.
//           oD1e2 (D27-28) «همون «آشکارسازیِ تغییرِ ماندگار (پله)» ـه … نه اون یکی»، tC1t (C27-28) «اون «کارگاهی» همونیه» — جوابِ نخستین پیامِ پس از ❓ خوانده نشد (پرسش هنوز «پرسشِ نوبت» نشده بود).
//           tB1 / oD1x (U59، D26-21، D26-22): پس از پس‌گرفتنِ «نه» برگه «open»؛ فهرستِ «برگه‌های باز».   tB1 p11 (B27·D17): «پرسشِ این نوبت همان «پیش‌نیاز» است» وقتی پرسشِ نوبت از سر گرفتنِ گامِ منتظرِ ابزار بود.
//           pC2 p13 (C27-7): تکهٔ پس از بستن («همون بخاری که حلش کردیم و بستیم: یه تیکهٔ تازه») مسئلهٔ گفت‌وگوی تازه شد، بی سطرِ «امروز».
//  bank     ورودی‌های R7 در بانکِ مستقلِ tests/variants/VARIANTS_R27.json (اگر هست)
// هر مثبت منفیِ هم‌شکلِ خودش را دارد. هیچ تاریخِ تقویمی‌ای ثابت نیست. LLA_FILE = ساختِ دیگر؛ ONLY=runners,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R27.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R27.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f));
const BANK = BANKF ? JSON.parse(fs.readFileSync(BANKF, 'utf8')) : [];

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
  const QI = BANK.map((e, i) => i).filter(i => /^R7\b/.test(String(BANK[i].rc || BANK[i].family || '')));
  const T = (k, ok, x) => { const i = QI[k - 1], E = BANK[i]; info.bank[i] = !!ok; chk(ok, 'bank#' + i + ' (Q7·' + k + ') [' + E.kind + '] «' + E.text.slice(0, 80) + '» → ' + E.expect.slice(0, 120) + ' :: ' + JSON.stringify(x).slice(0, 1100)); };
  const ARR = /🛎 ابزارِ لازم آمد/, WEIGHED = /سنجیدم که نیازِ گام/, ASKED = /❓ برگهٔ/, MIS = /⚠️ پاسخِ/;
  let e, sy, td, u, ev, nt, sh, c;

  // ---- the runners' own sheets and areas (round 27: tB1 r3, tB1z r3, oD1 sheet, tC1 r13, pC2 r13; scratch areas from round27B/tools/mkpage.py, round27D/tools/mkbuild.py, round27C/tools/mkbuild3.py) ----
  const G_tB1 = { title: 'جست‌وجوی پیشینهٔ اختراع برای یک ایدهٔ ساختنی', area: 'sys-territory', kind: 'build', step: '(۳) قبلاً کسی همینو ساخته یا ثبت اختراع کرده؟',
    abstract: 'کسی که ایده‌ای برای ساختنِ یک وسیله دارد باید بداند پیش‌تر کسی همان را ساخته یا ثبتِ اختراع کرده یا نه، و ایده‌اش با نزدیک‌ترین نمونه چه فرقی دارد.',
    missing: 'حوزه/ابزاری برای جست‌وجوی نظام‌مندِ پیشینهٔ اختراع (واژه‌کلیدِ کارکرد، پایگاه‌های ثبتِ اختراع، مقایسهٔ ادعاها با ویژگی‌های ایده)', where: 'قلمروِ سامانه‌ها — حلِ مسئله (s_problem)، کنارِ «خلاقیت»',
    how: 'حوزه‌ای با پرسش‌های کلیدی، گام‌های جست‌وجو و جدولِ مقایسهٔ ایده با ثبت‌های نزدیک', why_not: 'pr_hypothesis_testing آزمونِ فرضیه است نه جست‌وجوی پیشینه؛ pr_creativity ساختنِ ایده است نه وارسیِ تازگی؛ 💡 جایگاهِ ایده نگه‌داشتنِ ایده است نه جست‌وجو',
    evidence: 'در نقشهٔ قلمرو هیچ حوزه‌ای برای پیشینهٔ اختراع یا ثبتِ اختراع نیست', confidence: 0.85 };
  const G_tB1z = { step: '(۳) قبلاً کسی همینو ساخته یا ثبت اختراع کرده؟', title: 'راهِ گشتنِ پیشینهٔ یک اختراع: کسی پیش‌تر همین را ساخته یا ثبتِ اختراع کرده؟', area: 'sys-territory', kind: 'build',
    abstract: 'کسی که ایدهٔ ساختنی دارد پیش از ساختن باید بداند همان چیز پیش‌تر ساخته یا ثبتِ اختراع شده است یا نه؛ این دسته از خواسته‌ها (پیشینهٔ اختراع، محصولِ مشابه، ثبتِ اختراعِ موجود) روشِ گام‌به‌گامِ جست‌وجو می‌خواهد.',
    missing: 'حوزه و ابزاری برای جست‌وجوی پیشینهٔ اختراع: با چه واژه‌هایی، در کدام پایگاه‌های ثبتِ اختراع و محصول‌های موجود باید گشت و یافته‌ها را چطور ثبت کرد. «💡 جایگاهِ ایده» خودِ ایده و فرض‌هایش را نگه می‌دارد ولی راهِ گشتنِ پیشینه ندارد.',
    where: 'در قلمروِ «حل مسئله و استدلال»، کنارِ «💡 جایگاهِ ایده»', how: 'یک حوزهٔ تازه با پرسش‌های کلیدی و یک کاربرگِ جست‌وجوی پیشینه (واژه‌ها، پایگاه‌ها، یافته‌ها با تاریخ)',
    why_not: 'pr_creativity (خلاقیت و تفکرِ واگرا) ایده می‌سازد، نمی‌گردد که پیش‌تر ساخته شده یا نه؛ pr_analogy_transfer (استدلالِ قیاسی و انتقال) مسئلهٔ مشابهِ حل‌شده را به کار می‌برد، نه جست‌وجوی ثبتِ اختراع؛ نمای idea فقط ایده را نگه می‌دارد',
    evidence: 'در فهرستِ حوزه‌های s_problem و نماها هیچ حوزه یا نمایی برای پیشینهٔ اختراع یا ثبتِ اختراع نیست', confidence: 0.85 };
  const MK = (id, fa, en, d, kq) => ({ id, fa, en, desc_fa: d, key_questions_fa: kq, claims: [{ fa: d, kind: 'empirical', basis_fa: 'افزودهٔ آزمایشیِ تور (رونوشتِ خراشی)', src: ['polya1945'] }] });
  const A_mkt = MK('pr_market_scan', 'بررسیِ بازار و رقیبان', 'Market and competitor scan', 'شناختنِ رقیبان، قیمت‌ها و سهمِ بازار برای جایگاه‌یابیِ یک ایدهٔ محصول: چه کسی چه می‌فروشد، به چه قیمتی و به کدام مشتری.', ['رقیبانِ اصلی چه کسانی‌اند و چه قیمتی می‌فروشند؟', 'جایگاهِ ایدهٔ من میانِ آن‌ها کجاست؟']);
  const A_prior = MK('pr_prior_art', 'جستجوی پیشینهٔ اختراع', 'Prior-art search', 'یافتنِ این‌که پیش‌تر کسی همین را ساخته یا ثبتِ اختراع کرده است: جستجوی گام‌به‌گام در پایگاه‌های ثبتِ اختراع، محصول‌های موجود و مقاله‌ها با واژه‌های کارکردِ دستگاه، و ثبتِ یافته‌ها با تاریخ.', ['قبلاً کسی همین را ساخته یا ثبتِ اختراع کرده است؟', 'با کدام واژه‌ها و در کدام پایگاه‌ها باید گشت؟']);
  const A_claims = MK('pr_patent_claims', 'نوشتنِ ادعاهای ثبتِ اختراع', 'Drafting patent claims', 'صورت‌بندیِ ادعاهای یک اختراع برای ثبت: دامنهٔ هر ادعا، تازگی و گامِ ابتکاری.', ['ادعای اصلی دقیقاً چه چیزی را می‌پوشاند؟']);
  const A_pdb = MK('pr_patent_db', 'جستجو در پایگاه‌های ثبتِ اختراع', 'Patent database search', 'گشتن در پایگاه‌های ثبتِ اختراع تا معلوم شود کسی همین را ثبتِ اختراع کرده است یا نه.', ['کسی همین را ثبتِ اختراع کرده است؟']);
  const A_prd = MK('pr_product_db', 'جستجوی محصول‌های ساخته‌شدهٔ مشابه', 'Existing-product search', 'گشتن میانِ محصول‌های موجود تا معلوم شود کسی همین را ساخته است یا نه.', ['کسی همین را ساخته است؟']);
  const G_oD1 = { title: 'آشکارسازیِ پلهٔ ماندگار در سیگنالِ نویزی و لغزان (جدا کردن از پرشِ گذرا و دریفت)', area: 'sys-territory', kind: 'build', step: 'زیرمسئلهٔ ۲: جدا کردنِ پلهٔ واقعیِ ۰٫۳ گرمی از پرشِ بازوبسته‌کردنِ در و از دریفتِ دما',
    abstract: 'مسئله‌هایی که باید در یک سریِ اندازه‌گیریِ حسگر تغییرِ ماندگارِ کوچک (پله) را از پرشِ گذرا و لغزشِ آرام جدا کنند: ترازو، دما، ولتاژِ باتری، شمارنده‌ها.',
    missing: 'حوزه‌ای در «قلمروِ سامانه‌ها» با روشِ معتبرِ آشکارسازیِ تغییرِ ماندگار: پنجرهٔ پایداری، خط‌مبنای متحرک برای لغزش، آستانه بر پایهٔ نویز و سنجشِ هشدارِ نادرست.',
    where: '🗺 قلمروِ سامانه‌ها › حل مسئله و استدلال (s_problem)', how: 'یک حوزهٔ تازه با گزاره‌های منبع‌دار', why_not: 'pr_statistical دربارهٔ نمونه‌گیری و بازگشت به میانگین است، نه آشکارسازیِ پله؛ تکنیکِ ۱۰ (تمایزِ سیگنال از نویز) برای ادعا و خبر است.', evidence: 'در نقشهٔ s_problem حوزه‌ای برای تغییرِ ماندگار/پله در سریِ حسگر نیست', confidence: 0.88 };
  const D_step = 'پنجرهٔ پایداری برای جدا کردنِ پلهٔ ماندگار از جهشِ گذرا، خط‌مبنای متحرک برای لغزش، و آستانه با سنجشِ هشدارِ نادرست';
  const A_chg = MK('pr_change_detection', 'آشکارسازیِ تغییرِ ماندگار (پله) در دادهٔ نویزیِ حسگر', 'Persistent change detection', D_step, ['این پله ماندگار است یا جهشِ گذرا؟']);
  const A_stp = MK('pr_step_detection', 'تشخیصِ پلهٔ ماندگار در دادهٔ نویزیِ حسگر', 'Persistent step detection in noisy sensor data', D_step, ['این پله ماندگار است یا جهشِ گذرا؟']);
  const A_idea = MK('pr_idea_place', 'جایگاهِ ایده و برگه‌های کمبودِ سامانه', 'Idea placement and system-gap sheets', 'نمای «💡 جایگاهِ ایده» و برگهٔ فوریِ دستیار برای کمبودِ سامانه در نظارت و سرکشی؛ نقشهٔ مسیرِ مسئله و گامِ منتظر', ['این ایده کجای نقشهٔ سامانه می‌نشیند؟']);
  const G_tC1 = { title: 'سنجیدنِ خواستِ واقعیِ مشتری و قیمتِ پذیرفتنی پیش از ساختن (بی تعارف و رودربایستی)', area: 'sys-territory', kind: 'build', step: 'باغدارها واقعاً حاضرن چقدر بدن — بی تعارف بفهمم می‌خرن و با چه قیمتی',
    abstract: 'کسی که ایدهٔ محصول دارد باید پیش از ساختن بفهمد مشتری واقعاً می‌خرد و چقدر می‌دهد، در حالی که پرسشِ مستقیم جوابِ تعارفی می‌گیرد',
    missing: 'حوزه و ابزاری برای اعتبارسنجیِ تقاضا: پرسیدن از رفتار و خرجِ گذشته به‌جای نظر، نشانه‌های تعهدِ واقعی، برآوردِ قیمتِ پذیرفتنی؛ «اقناع و نفوذ» (sc_persuasion) بررسی و کنار گذاشته شد چون دربارهٔ قانع‌کردن است، نه سنجشِ خریدِ واقعی',
    where: '🗺 قلمروِ سامانه‌ها — حوزهٔ تازه زیرِ «تصمیم، برنامه‌ریزی و خودتنظیمی»', how: 'حوزه با پرسش‌های کلیدی دربارهٔ رفتارِ گذشتهٔ مشتری و ابزاری که پاسخ‌ها را به «می‌خرد/نمی‌خرد و با چه قیمتی» برساند',
    why_not: 'sc_persuasion اقناع است؛ s_decision مقایسهٔ گزینه‌های خودِ فرد', evidence: 'در نقشهٔ سامانه حوزه‌ای برای اعتبارسنجیِ مشتری یا قیمت‌گذاری نیست', confidence: 0.85 };
  const D_cust = 'چطور پیش از ساختن بفهمیم مشتری واقعاً مسئله دارد و پول می‌دهد: پرسیدن از رفتارِ گذشته به‌جای نظر دربارهٔ ایده؛ پیش‌فروش و تعهدِ کوچک به‌عنوانِ نشانه.', KQ_cust = ['آخرین باری که این مشکل را داشتی کِی بود و چه کردی؟', 'برای حلش تا حالا چقدر خرج کرده‌ای؟', 'حاضری الان پیش‌پرداختِ کوچکی بدهی؟'];
  const A_cust = MK('dc_customer_validation', 'اعتبارسنجیِ ایده با مشتری: رفتارِ گذشته، نه نظر', 'Customer validation of an idea: past behaviour, not opinion', D_cust, KQ_cust);
  const A_custB = MK('dc_customer_validation_b', 'اعتبارسنجیِ ایده با مشتری (کارگاهی): رفتارِ گذشته، نه نظر', 'Customer validation workshop', D_cust, KQ_cust);
  const A_size = MK('dc_market_sizing', 'تخمینِ اندازهٔ بازار از بالا به پایین', 'Top-down market sizing', 'تخمینِ شمارِ مشتریانِ بالقوه و درآمدِ کل از آمارِ کلان (جمعیت × سهم × قیمت)، پیش از ساختن.', ['کلِ بازار چند نفر است؟', 'چه سهمی واقع‌بینانه است؟', 'درآمدِ سالانه چقدر می‌شود؟']);
  const HER_tB1 = 'اگه ماهی بیشتر از یه بار هشدار اشتباه بده مادرم کلافه میشه، پس حداکثر یکی در ماه. چیزایی که نمی‌دونم: (۱) ترازوی ارزون اون‌قدر دقیق هست که ۰.۳ گرم رو ببینه؟ (۲) چطور به گوشی پیام بده؟ (۳) قبلاً کسی همینو ساخته یا ثبت اختراع کرده؟ برای سومی اصلاً نمی‌دونم چطوری باید گشت.';
  const HER_oD1 = '۰٫۳ تقسیم بر ۰٫۰۵ میشه ۶ برابرِ نویز. پس زیرمسئلهٔ ۱ حله. ولی زیرمسئلهٔ ۲ رو نمی‌دونم: پرشِ در و دریفتِ دما رو چطور از پلهٔ واقعی جدا کنم؟ این سامانه روشی براش داره؟';
  const N_MKT = 'پاسخ به برگهٔ دستیار #۱۰۱: حوزهٔ «بررسیِ بازار و رقیبان» (pr_market_scan) به قلمروِ حل مسئله افزوده شد.';
  const N_POS = 'پاسخ به برگهٔ دستیار #۱۰۱: دو حوزه ساخته شد — «جستجو در پایگاه‌های ثبتِ اختراع» (pr_patent_db) و «جستجوی محصول‌های ساخته‌شدهٔ مشابه» (pr_product_db).';
  const pillUp = async (G) => { await wipe(); await fresh(); const pid = await bind('جعبه‌قرصِ هوشمند برای مادر', 'یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه و اگه برنداشت به من خبر بده — ارزون، و بدون اینکه مادرم کار اضافه‌ای بکنه.');
    await gapTurn(HER_tB1, G || G_tB1, 'معیارت روشن است؛ برای سومی این‌جا هنوز ابزاری نیست — برای ثبتِ این کمبود بررسی می‌کنم.', [cs({ ph: 'u' })], 101); return pid; };
  const scaleUp = async () => { await wipe(); await fresh(); const pid = await bind('قرص‌دونِ هوشمند با وزن', 'می‌خوام بدونم «مادرم قرصِ امروزش رو برداشته یا نه»، فقط از روی وزنِ قرص‌دون، بی دوربین.');
    await gapTurn(HER_oD1, G_oD1, 'زیرمسئلهٔ ۱ را خودت حل کردی؛ برای دومی ابزاری نیست — برای ثبت بررسی می‌کنم.', [cs({ ph: 'p' })], 101); return pid; };

  await section('runners', async () => {
    const R7 = info.R7 = {};

    // ---- B27·D16 (tB1 s17–s19, p9; U-family C2/C20): a NAMED area whose overlap with the sheet is only frame words ⇒ ASK, never silence ----
    let pid = await pillUp(); await addArea('s_problem', A_mkt); await reply(101, [N_MKT]); await check();
    e = await one(101); sy = await sysMsgs(); nt = await notes(101);
    R7.d16a = !!e && e.st === 'wait' && e.ask === 'pr_market_scan' && sy.some(t => ASKED.test(t) && /بررسیِ بازار و رقیبان/.test(t)) && !sy.some(t => ARR.test(t));
    chk(R7.d16a, 'B27·D16 tB1: the routine names «بررسیِ بازار و رقیبان»; it shares only frame words with the sheet ⇒ the page ASKS her (C20/C2) :: ' + JSON.stringify({ e, sy: sy.slice(-1), nt }));
    // the real run: two routine replies read in ONE sweep (the page was away) — the first one must not vanish
    pid = await pillUp(); await addArea('s_problem', A_mkt); await reply(101, [N_MKT]); await addArea('s_problem', A_pdb); await addArea('s_problem', A_prd); await reply(101, [N_POS]); await check();
    e = await one(101); sy = await sysMsgs(); ev = await dz(pid);
    R7.d16b = !!e && e.st === 'arrived' && e.tool === 'pr_patent_db' && sy.some(t => ARR.test(t) && /«بررسیِ بازار و رقیبان»[^.]*هم آمد و سنجیده شد/.test(t));
    chk(R7.d16b, 'B27·D16 tB1 s17–s20: two routine replies read in one sweep ⇒ the clear best («جستجو در پایگاه‌های ثبتِ اختراع») arrives AND the arrival line says «بررسیِ بازار و رقیبان» also came and was weighed — the first reply is never folded away silently :: ' + JSON.stringify({ e, sy: sy.slice(-2), ev: ev.map(x => x.k + ' | ' + x.title) }));
    await turn('نه، «بررسیِ بازار و رقیبان» به کارِ گامِ سوم نمیاد؛ من می‌خوام ببینم کسی قبلاً همین جعبه‌قرص رو ساخته یا ثبت اختراع کرده یا نه، نه اینکه رقیبام چند می‌فروشن.', 'می‌پذیرم.', [cs({ sys_fit: { sheet: 101, fit: false, quote: 'نه، «بررسیِ بازار و رقیبان» به کارِ گامِ سوم نمیاد' } })]);
    e = await one(101); sy = await sysMsgs(); sh = await sheet(101);
    R7.d16c = !!e && e.rej.indexOf('pr_market_scan') >= 0 && e.rej.indexOf('pr_patent_db') < 0 && (e.st === 'arrived' || e.st === 'resumed') && e.tool === 'pr_patent_db' && !sy.some(t => MIS.test(t)) && sy.some(t => /بررسیِ بازار و رقیبان» برای گامِ/.test(t));
    chk(R7.d16c, 'B27·D16 tB1 p9: her «نه، «بررسیِ بازار و رقیبان» به کارِ گامِ سوم نمیاد» rejects THAT area (one line), never the tool that arrived (no «⚠️ … جواب نداد», patent-db stays) :: ' + JSON.stringify({ e, sy: sy.slice(-2), sh }));
    // look-alike negative: a «نه» after arrival that names no other area still rejects the arrived tool (U58 path)
    await turn('نه، «جستجو در پایگاه‌های ثبتِ اختراع» همون نیست؛ فقط ثبتِ اختراع رو می‌گرده.', 'می‌پذیرم.', [cs({})]);
    e = await one(101); chk(!!e && e.st === 'wait' && e.rej.indexOf('pr_patent_db') >= 0, 'B27·D16 neg: «نه، این همون نیست» with no other name still rejects the arrived tool :: ' + JSON.stringify(e));
    // look-alike negatives: a reply that names NO area is rejected and reopened (generic-words arm); a named area the sheet ruled out is rejected
    await pillUp(); await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱: یک ابزارِ تازه برای تغییر در مسئله‌ها ساخته شد.']); await check();
    e = await one(101); sy = await sysMsgs();
    chk(!!e && e.st === 'wait' && !e.ask && sy.some(t => MIS.test(t) && /هیچ نما یا حوزه‌ای/.test(t)), 'C20 neg (tB1 generic-words arm): a reply that names no area is rejected and reopened — nothing to ask :: ' + JSON.stringify({ e, sy: sy.slice(-1) }));
    await pillUp(); await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱: حوزهٔ pr_creativity (خلاقیت و تفکرِ واگرا) کامل‌تر شد و برای همین نیاز به کار می‌آید.']); await check();
    e = await one(101); sy = await sysMsgs();
    chk(!!e && e.st === 'wait' && !e.ask && sy.some(t => MIS.test(t) && /کنار گذاشته بود/.test(t)), 'C20 neg (tB1 ruled-out arm): the area the sheet itself ruled out is rejected, not asked :: ' + JSON.stringify({ e, sy: sy.slice(-1) }));

    // ---- D27-27 (oD1f s14): the named area overlaps only in sheet-frame / view words ⇒ ASK (C20/C2), not «هیچ واژهٔ مشترکی ندارد … دوباره باز شد» ----
    await scaleUp(); await addArea('s_problem', A_idea); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ `pr_idea_place` («جایگاهِ ایده و برگه‌های کمبودِ سامانه») ساخته شد.']); await check();
    e = await one(101); sy = await sysMsgs(); nt = await notes(101);
    R7.d27 = !!e && e.st === 'wait' && e.ask === 'pr_idea_place' && sy.some(t => ASKED.test(t)) && !sy.some(t => MIS.test(t)) && !nt.length;
    chk(R7.d27, 'D27-27 oD1f: «جایگاهِ ایده و برگه‌های کمبودِ سامانه» shares only frame words with the sheet ⇒ ask her, no rejection, no reopening note :: ' + JSON.stringify({ e, sy: sy.slice(-1), nt }));
    // look-alike negative: a named area that shares NO word at all — not even a frame word — is still a plain mismatch
    await scaleUp(); await addArea('s_problem', MK('pr_cooking', 'آشپزیِ ایرانی', 'Persian cooking', 'دستورِ پختِ قورمه‌سبزی و فسنجان', ['چه ادویه‌ای؟'])); await reply(101, ['پاسخ به برگهٔ دستیار #101 — حوزهٔ `pr_cooking` («آشپزیِ ایرانی») ساخته شد.']); await check();
    e = await one(101); sy = await sysMsgs();
    chk(!!e && e.st === 'wait' && !e.ask && sy.some(t => MIS.test(t)), 'C20 neg: a named area with no shared word of any kind is a mismatch, not a question :: ' + JSON.stringify({ e, sy: sy.slice(-1) }));

    // ---- B27·D19 (tB1z s14): three areas at once; «جستجوی پیشینهٔ اختراع» covers every word of her step that «نوشتنِ ادعاهای ثبتِ اختراع» covers, and more ⇒ it arrives, no tie ❓ ----
    await pillUp(G_tB1z); await addArea('s_problem', A_claims); await addArea('s_problem', A_mkt); await addArea('s_problem', A_prior);
    await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱: سه حوزهٔ تازه به نقشهٔ حلِ مسئله افزوده شد: «نوشتنِ ادعاهای ثبتِ اختراع» (pr_patent_claims)، «بررسیِ بازار و رقیبان» (pr_market_scan) و «جستجوی پیشینهٔ اختراع» (pr_prior_art).']); await check();
    e = await one(101); sy = await sysMsgs();
    R7.d19 = !!e && e.st === 'arrived' && e.tool === 'pr_prior_art' && !sy.some(t => ASKED.test(t));
    chk(R7.d19, 'B27·D19 tB1z: «جستجوی پیشینهٔ اختراع» is the clear single best fit for «(۳) قبلاً کسی همینو ساخته یا ثبت اختراع کرده؟» ⇒ it arrives; no tie with «نوشتنِ ادعاهای ثبتِ اختراع» :: ' + JSON.stringify({ e, sy: sy.slice(-1), rank: await p.evaluate(() => { const x = APP.PRE.sysAll()[0]; return x ? JSON.stringify(x.e.checks.slice(-1)) : ''; }) }));
    // look-alike negative: two areas with the SAME description stay a real tie (oD1e2)
    await scaleUp(); await addArea('s_problem', A_chg); await addArea('s_problem', A_stp);
    await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱ — ساخته شد: «آشکارسازیِ تغییرِ ماندگار (پله) در دادهٔ نویزیِ حسگر» و «تشخیصِ پلهٔ ماندگار در دادهٔ نویزیِ حسگر».']); await check();
    e = await one(101); sy = await sysMsgs();
    chk(!!e && e.st === 'wait' && !!e.ask && e.alt.length === 1 && sy.filter(t => ASKED.test(t)).length === 1, 'C54 neg (oD1e2): two areas with the same description stay a real tie — asked naming both :: ' + JSON.stringify({ e, sy: sy.slice(-1) }));

    // ---- C54: her very next message answers the ❓ she was SHOWN (chat line / Today), even before the coach asked it in a turn ----
    // D27-28 oD1e2 p6
    await turn('همون «آشکارسازیِ تغییرِ ماندگار (پله)» ـه که لازم داشتم، نه اون یکی.', 'باشه.', [cs({})]);
    e = await one(101); sy = await sysMsgs(); td = await todayAll();
    R7.d28 = !!e && (e.st === 'arrived' || e.st === 'resumed') && e.tool === 'pr_change_detection' && e.how === 'ask' && !td.some(t => /^❓/.test(t));
    chk(R7.d28, 'D27-28 oD1e2 p6: «همون «آشکارسازیِ تغییرِ ماندگار (پله)» ـه که لازم داشتم، نه اون یکی» names one ⇒ it arrives by her word; the ❓ leaves Today :: ' + JSON.stringify({ e, sy: sy.slice(-1), td }));
    // C27-28 tC1t p17
    await wipe(); await fresh(); await bind('هشدارِ یخ‌زدگی برای باغدار', 'یه دستگاهِ ارزونِ هشدارِ یخ‌زدگی برای باغدارِ کوچک.');
    await gapTurn('یه گیرِ دیگه هم دارم: نمی‌دونم باغدارها واقعاً حاضرن چقدر بدن. اگه ازشون بپرسم «می‌خریش؟» همه از رودربایستی میگن آره. روشی هست که بفهمم واقعاً می‌خرن؟', G_tC1, 'نیست؛ برای ثبت بررسی می‌کنم.', [cs({ ph: 'e' })], 102);
    await addArea('s_decision', A_size, true); await addArea('s_decision', A_cust); await addArea('s_decision', A_custB);
    await reply(102, ['پاسخ به برگهٔ دستیار #102 — ساخته شد: دو حوزهٔ تازه در قلمروِ «تصمیم، برنامه‌ریزی و خودتنظیمی»، هر دو با پرسش‌های کلیدی و منبع — `dc_market_sizing` («تخمینِ اندازهٔ بازار از بالا به پایین») و `dc_customer_validation` («اعتبارسنجیِ ایده با مشتری: رفتارِ گذشته، نه نظر»). نسخهٔ تازهٔ صفحه منتشر شد.']); await check();
    e = await one(102);
    chk(!!e && !!e.ask && e.alt.length === 1, 'C27-28 fixture: a real tie between the two «اعتبارسنجیِ ایده با مشتری» areas is asked :: ' + JSON.stringify(e));
    await turn('دو تا ابزار اومده. اون «کارگاهی» همونیه که برای گامِ قیمت می‌خواستم.', 'باشه.', [cs({})]);
    e = await one(102); td = await todayAll();
    R7.c28 = !!e && (e.st === 'arrived' || e.st === 'resumed') && e.tool === 'dc_customer_validation_b' && !td.some(t => /^❓/.test(t));
    chk(R7.c28, 'C27-28 tC1t p17: «اون «کارگاهی» همونیه که برای گامِ قیمت می‌خواستم» ⇒ the «(کارگاهی)» one arrives :: ' + JSON.stringify({ e, td }));
    // tB1z p9 sentence against a genuine tie (prior-art + an identical twin)
    await pillUp(G_tB1z); await addArea('s_problem', A_prior); await addArea('s_problem', MK('pr_prior_art_ws', 'کارگاهِ پیشینه‌یابیِ اختراع', 'Prior-art workshop', A_prior.desc_fa, A_prior.key_questions_fa));
    await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱: دو حوزه ساخته شد — «جستجوی پیشینهٔ اختراع» و «کارگاهِ پیشینه‌یابیِ اختراع».']); await check();
    e = await one(101);
    if (e && e.ask) {
      await turn('دیدم نوشته ابزارش اومده. با همون «جستجوی پیشینهٔ اختراع» گشتم: با واژه‌های «جعبه قرص»، «حسگر وزن» و «یادآور دارو» توی دو تا پایگاه ثبت اختراع و یه فروشگاه. دو تا محصول مشابه هست ولی هیچ‌کدوم دو تا خوندن پشت‌سرهم ندارن. یافته‌ها رو با تاریخ نوشتم.', 'خوب.', [cs({})]);
      e = await one(101); R7.z9 = !!e && e.st !== 'wait' && e.tool === 'pr_prior_art';
      chk(R7.z9, 'B27·D19 tB1z p9: «با همون «جستجوی پیشینهٔ اختراع» گشتم …» names the tool ⇒ read as her answer :: ' + JSON.stringify(e));
    } else chk(false, 'tB1z p9 fixture: the twin pair is asked :: ' + JSON.stringify(e));
    // look-alike negatives: an unrelated next message (no naming) leaves the shown ❓ pending; a bare «نه» to something else is not her answer
    await scaleUp(); await addArea('s_problem', A_chg); await addArea('s_problem', A_stp);
    await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱ — ساخته شد: دو حوزهٔ تازه.']); await check();
    await turn('نه، فردا نمی‌تونم سراغش برم؛ یه سؤال: نویزِ ۰٫۰۵ گرم با ۱۰ نمونه چقدر میشه؟', 'یک پرسش.', [cs({})]);
    e = await one(101); td = await todayAll(); sy = await sysMsgs();
    chk(!!e && e.st === 'wait' && !!e.ask && e.alt.length === 1 && !e.rej.length && td.some(t => /^❓/.test(t)) && !sy.some(t => MIS.test(t)), 'C54 neg: a message that names neither candidate (and a «نه» about something else) leaves the shown ❓ pending — nothing picked, nothing rejected :: ' + JSON.stringify({ e, td }));
    await scaleUp(); await addArea('s_problem', A_chg); await addArea('s_problem', A_stp);
    await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱ — ساخته شد: دو حوزهٔ تازه.']); await check();
    await turn('آره', 'کدام؟', [cs({})]);
    e = await one(101);
    chk(!!e && e.st === 'wait' && !!e.ask && e.alt.length === 1, 'C54 neg: a bare «آره» names nobody — the page does not pick :: ' + JSON.stringify(e));
    // C81: an ordinal right after the shown tie is a choice by the page's listed order; C80: negating one of two is not yet a choice
    await scaleUp(); await addArea('s_problem', A_chg); await addArea('s_problem', A_stp);
    await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱ — ساخته شد: دو حوزهٔ تازه.']); await check();
    await turn('دومی', 'باشه.', [cs({})]); e = await one(101);
    chk(!!e && e.st !== 'wait' && e.tool === 'pr_step_detection', 'C81: «دومی» to the shown tie picks the second the page listed :: ' + JSON.stringify(e));
    await scaleUp(); await addArea('s_problem', A_chg); await addArea('s_problem', A_stp);
    await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱ — ساخته شد: دو حوزهٔ تازه.']); await check();
    await turn('«تشخیصِ پلهٔ ماندگار در دادهٔ نویزیِ حسگر» نه', 'باشه.', [cs({})]); e = await one(101); sy = await sysMsgs();
    chk(!!e && e.st === 'wait' && e.ask === 'pr_change_detection' && !e.alt.length && e.rej.indexOf('pr_step_detection') >= 0 && !sy.some(t => ARR.test(t)), 'C80: negating one of two is not a choice — the page asks once about the other :: ' + JSON.stringify(e));
    // single (non-tie) ask shown, answered by naming it with a yes
    await pillUp(Object.assign({}, G_tB1, { step: '(۳) پیشینه: قبلاً کسی همینو ساخته یا ثبت اختراع کرده؟' }));
    await addArea('s_problem', MK('pr_tech_history', 'تاریخِ فناوری و پیشینهٔ ابزارها', 'History of technology', 'سیرِ تاریخیِ یک فناوری: ابزارها چگونه پدید آمدند، دگرگون شدند و جای یکدیگر را گرفتند.', ['این ابزار از کجا آمد و چه چیزی جایش را گرفت؟']));
    await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱: حوزهٔ «تاریخِ فناوری و پیشینهٔ ابزارها» (pr_tech_history) اضافه شد.']); await check();
    e = await one(101);
    if (e && e.ask) { await turn('«تاریخِ فناوری و پیشینهٔ ابزارها» به کارِ گامِ سوم نمیاد؛ من ثبتِ اختراع می‌خوام.', 'باشه.', [cs({})]); e = await one(101);
      chk(!!e && e.st === 'wait' && !e.ask && e.rej.indexOf('pr_tech_history') >= 0, 'C54: a single shown ❓ answered by naming it with a rejection ⇒ rejected at once :: ' + JSON.stringify(e)); }
    else chk(false, 'single-ask fixture :: ' + JSON.stringify(e));

    // ---- U59 / D26-21 (tB1 s24, oD1x): the take-back of «نه» closes the sheet ----
    pid = await pillUp(); await addArea('s_problem', A_pdb); await addArea('s_problem', A_prd); await reply(101, [N_POS]); await check();
    e = await one(101); chk(!!e && e.st === 'arrived' && e.tool === 'pr_patent_db', 'U59 fixture: patent-db arrives :: ' + JSON.stringify(e));
    await turn('نه، این همون نیست؛ فقط ثبتِ اختراع رو می‌گرده. من می‌خوام محصول‌هایی که ساخته شدن رو هم ببینم.', 'می‌پذیرم.', [cs({ sys_fit: { sheet: 101, fit: false, quote: 'نه، این همون نیست' } })]);
    sh = await sheet(101); chk(sh.status === 'open', 'U59 fixture: her «نه» reopens #101 :: ' + JSON.stringify(sh));
    u = await turn('اگه یه ابزار رسید ولی به کارم نیومد، از کجا بفهمم گامم دوباره منتظره؟ کجا می‌بینمش؟', 'چهار جا.', [cs({})]);
    R7.d22 = /#101 «.*?» \[open/.test(sheetsLine(u));
    chk(R7.d22, 'D26-22 oD1x p9: the prompt\'s «برگه‌های باز» shows #101 [open] after the page reopened it :: ' + sheetsLine(u).slice(0, 300));
    await turn('ببخشید، اشتباهی گفتم نه؛ همون بود. با همون پایگاه‌های ثبتِ اختراع کارم راه می‌افته.', 'باشه.', [cs({ sys_fit: { sheet: 101, fit: true, quote: 'همون بود' } })]);
    await p.waitForTimeout(60);
    e = await one(101); sh = await sheet(101); const stL = await p.evaluate(() => __status.slice());
    R7.u59 = !!e && (e.st === 'arrived' || e.st === 'resumed') && sh.status === 'approved' && stL.some(x => x.st === 'approved') && /پس گرفته شد/.test(sh.last);
    chk(R7.u59, 'U59 / D26-21 tB1 s24: after «ببخشید، اشتباهی گفتم نه؛ همون بود» the sheet is closed (approved) with the take-back note :: ' + JSON.stringify({ e, sh, stL }));

    // ---- B27·D17 (tB1 p11): the context label names the turn's REAL question (the waiting-tool resume), not «پیش‌نیاز» ----
    pid = await pillUp(); await addArea('s_problem', A_pdb); await reply(101, ['پاسخ به برگهٔ دستیار #۱۰۱: حوزهٔ «جستجو در پایگاه‌های ثبتِ اختراع» (pr_patent_db) ساخته شد.']); await check();
    u = await turn('خب، دیدم اومده.', 'برگردیم.', [cs({})]);
    const H17 = head(u.user), own17 = H17.split('\n').filter(l => /^- زمینه \(نه پرسشِ دوم؛ پرسشِ این نوبت همان «/.test(l));
    R7.d17 = /\*\*پرسشِ این نوبت همین است:\*\* \(از سر گرفتنِ گامِ منتظرِ ابزار\)/.test(H17) && own17.length > 0 && own17.every(l => !/همان «پیش‌نیاز» است/.test(l) && !/پس از پیش‌نیاز/.test(l));
    chk(R7.d17, 'B27·D17 tB1 p11: the turn question is the waiting-tool resume ⇒ other blocks are labelled with THAT, never «پرسشِ این نوبت همان «پیش‌نیاز» است» :: ' + JSON.stringify(own17.map(l => l.slice(0, 160))));
    // look-alike negative: a real prerequisite question keeps its «پیش‌نیاز» label
    await wipe(); await fresh(); await bind('مساحتِ زمین', 'مساحتِ یه زمینِ مثلثی با قاعدهٔ ۱۲ و ارتفاعِ ۵ چقدره؟');
    await turn('یادم نیست مساحتِ مثلث چطور بود.', 'تشخیصی.', [cs({ ph: 'p', prereq: { concept: 'مساحتِ مثلث', step: 'حسابِ مساحت', quote: 'یادم نیست مساحتِ مثلث چطور بود', q: 'مثلث را نصفِ یک مستطیل می‌بینی؟' } })]);
    u = await turn('نمی‌دونم', 'باشه.', [cs({})]);
    const lab = head(u.user).split('\n').filter(l => /^- زمینه \(نه پرسشِ دوم؛ پرسشِ این نوبت همان «/.test(l));
    chk(!lab.length || lab.every(l => /همان «پیش‌نیاز» است/.test(l)), 'B27·D17 neg: with a real prerequisite question the label stays «پیش‌نیاز» :: ' + JSON.stringify(lab.map(l => l.slice(0, 120))));

    // ---- C27-7 (pC2 p13): a piece AFTER closure, stated as «همون بخاری که حلش کردیم و بستیم … یه تیکهٔ تازه» ⇒ a late entry of the closed problem with its «امروز» line ----
    await wipe(); await fresh();
    const pidC = await bind('هزینهٔ ماهانهٔ برقِ بخاریِ ۲۰۰۰ واتی', 'بخاری ۲۰۰۰ واتی روزی ۳ ساعت روشنه، هر کیلووات‌ساعت ۱۵۰۰ تومن؛ ماهی چقدر میشه؟');
    await turn('۲ کیلووات × ۳ = ۶ کیلووات‌ساعت، ضرب ۱۵۰۰ میشه ۹۰۰۰؛ ماهی ۲۷۰ هزار.', 'درست.', [cs({ ph: 'b', said: ['result'], result: '۲۷۰ هزار' })]);
    await p.evaluate((pid) => __liveSet(pid, (so, L) => { L.state = 'solved'; so.u = so.u || {}; so.u[1] = Object.assign({ done: true }, so.u[1] || {}, { done: true }); so.b = { 1: { done: true, at: APP.nowISO() } }; }), pidC);   // closed AND looked back: phase «done»
    // pC2: the session is the chat where she stated the problem («گفت‌وگو», coach statement kept) and it is linked to the now-closed live problem
    info.c7pre = await p.evaluate(() => { const s = __cur(); s.coach = Object.assign(s.coach || {}, { stmt: 'بخاری ۲۰۰۰ واتی دارم که روزی ۳ ساعت روشنه و هر کیلووات‌ساعت ۱۵۰۰ تومنه؛ ماهی چقدر برق می‌خوره؟' }); APP.S.put(s); const b = APP.ASSIST.boundLive ? APP.ASSIST.boundLive(s) : null; return { b: b && { pid: b.pid, done: b.done }, sc: APP.PRE.scope(s), cf: APP.ASSIST.chatFocus && APP.ASSIST.chatFocus(s) }; });
    const G_pC2 = { title: 'جدا کردنِ سهمِ یک وسیله از مصرفِ کلِ برقِ خانه (دادهٔ ساعت‌به‌ساعتِ کنتورِ هوشمند)', area: 'sys-territory', kind: 'build', abstract: 'مسئله‌هایی که در آن فقط جمعِ چند مصرف‌کننده اندازه گرفته می‌شود و سهمِ یکی از آن‌ها باید از روی الگوی زمانی (روشن/خاموش، ساعت‌ها) برآورد شود',
      missing: 'روش یا ابزاری برای تفکیکِ بار: مقایسهٔ ساعت‌های روشن و خاموش، کم کردنِ مصرفِ پایه، وارسیِ برآورد با توانِ اسمی؛ «تمایزِ سیگنال از نویز» بررسی و کنار گذاشته شد', where: '🗺 قلمروِ سامانه‌ها — زیرِ تصمیم و برآوردِ کمّی',
      how: 'حوزه با گام‌های «مصرفِ پایه، اختلافِ روشن/خاموش، وارسی با توانِ اسمی»', relations: 'قطعهٔ تازه پس از بستنِ مسئلهٔ «هزینهٔ ماهانهٔ برقِ بخاریِ ۲۰۰۰ واتی»', why_not: 'تمایزِ سیگنال از نویز تشخیصِ الگو از نوسان است، نه تفکیکِ بار',
      evidence: 'در نقشهٔ سامانه حوزه‌ای برای تفکیکِ مصرفِ یک وسیله از دادهٔ کل نیست', confidence: 0.8, step: 'جدا کردنِ سهمِ بخاری از مصرفِ ساعت‌به‌ساعتِ کلِ خانه' };
    await gapTurn('راستی دربارهٔ همون بخاری که حلش کردیم و بستیم: یه تیکهٔ تازه دارم. کنتورِ خونه‌مون هوشمنده و مصرفِ ساعت‌به‌ساعتِ کلِ خونه رو میده؛ می‌خوام سهمِ خودِ بخاری رو از این مصرفِ کل جدا کنم که ببینم واقعاً ماهی ۲۷۰ هزار میشه یا نه. سامانه روشی برای این داره؟',
      G_pC2, 'روشِ آماده‌ای نیست؛ این کمبود را برای ثبت می‌فرستم و این گام منتظرِ همان می‌ماند؛ مسئلهٔ بخاری که بستی دست نمی‌خورد.', [cs({ ph: 'u' })], 101);
    info.c7post = await p.evaluate(() => { const s = __cur(); return { pk: (s.coach || {}).pk, sc: JSON.stringify(APP.PRE.scope(s)).slice(0, 200), all: APP.PRE.sysAll().map(x => JSON.stringify(x.sc).slice(0, 120)) }; });
    e = await one(101); td = await todayAll();
    R7.c7 = !!e && e.late && e.st === 'wait' && e.pid === pidC && td.some(t => /^⏸ تکهٔ «جدا کردنِ سهمِ بخاری/.test(t) && /بسته می‌ماند/.test(t));
    chk(R7.c7, JSON.stringify(info.c7pre) + ' C27-7 pC2 p13: «دربارهٔ همون بخاری که حلش کردیم و بستیم: یه تیکهٔ تازه دارم …» ⇒ a late waiting piece of the CLOSED problem, with its «امروز» line «⏸ تکهٔ … — مسئله بسته می‌ماند» :: ' + JSON.stringify({ e, td }));
    chk((await p.evaluate((pid) => (APP.S.get('eprog_' + pid).solve.live || {}).state, pidC)) === 'solved', 'C27-7: the closed problem stays closed');
    // look-alike negative: a NEW problem after closure (no back-reference) is not a piece of the closed one
    await wipe(); await fresh();
    const pidK = await bind('هزینهٔ ماهانهٔ برقِ بخاریِ ۲۰۰۰ واتی', 'بخاری ۲۰۰۰ واتی روزی ۳ ساعت روشنه؛ ماهی چقدر میشه؟');
    await p.evaluate((pid) => __liveSet(pid, (so, L) => { L.state = 'solved'; }), pidK);
    await gapTurn('یه مسئلهٔ تازه دارم: می‌خوام بدونم کدوم پنلِ خورشیدی برای پشت‌بومِ ما می‌صرفه. سامانه روشی برای مقایسهٔ پنل‌ها داره؟', Object.assign({}, G_pC2, { title: 'مقایسهٔ پنل‌های خورشیدی', step: 'کدوم پنلِ خورشیدی برای پشت‌بوم می‌صرفه', relations: '' }), 'نیست؛ ثبت می‌کنم.', [cs({ ph: 'u' })], 102);
    e = await one(102);
    chk(!e || !e.late, 'C27-7 neg: a NEW problem after closure (no «همون … که بستیم», no «تکه») is not booked as a piece of the closed problem :: ' + JSON.stringify(e));
  });

  await section('bank', async () => { if (!QI.length) { info.noBank = true; return; } });

  await b.close();
  console.log('runners: ' + JSON.stringify(info.R7 || {})); if (process.env.DBG) console.log(JSON.stringify(info.c7post));
  console.log('bank R7: ' + (info.noBank ? 'not present' : Object.values(info.bank).filter(Boolean).length + '/' + QI.length));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
