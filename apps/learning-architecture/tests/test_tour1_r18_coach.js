// تورِ پولیا (دستهٔ ۱، دورِ ۱۸ ِ اصلاح، سهمِ «coach» — ۲۰۲۶-۱۰-۱۷) — DECISIONS_R18: سازوکارهای ریشه‌ای. هر بخش با جملهٔ خودِ سناریو و «بانکِ گونه‌ها»
// (tests/tour1_variants_r18_coach.js = VARIANTS_R18.json، نوشتهٔ عاملی که کد را ندیده) سنجیده می‌شود.
//  rm1ev    RM1 a b c e — کارنامهٔ «چهار مرحلهٔ حل» از موفقیت‌های سنجیده هم (پاسخِ پذیرفته، گذر از مرحله، «حل شد»، وارسیِ سنجیده) و از تونلِ زنده
//           (طرح، مسئلهٔ کمکی، دادهٔ به‌کاررفته)؛ مرحلهٔ بی‌داده «هنوز داده‌ای نیست» و هرگز ضعیف‌ترین نیست؛ رادار نگاشتی ندارد و همین را می‌گوید
//  rm4g     RM4 b c — coach_state.guess.q فقط اگر عیناً در همان پیامِ دستیار است (m.guess = {text, q})؛ حدسِ مسئلهٔ زندهٔ در کانون ⇒ solve.g
//  rm5plan  RM5 a b c e — برنامه: تاریخِ گذشته هرگز، پیگیری فقط برای برنامهٔ باز و آینده، «انجام شد؟» یک بار، plan_done، تکراری نه، on_guess، «سشنِ بعد»؛ INF4 «امروز»
//  rm5def   RM5 d — درخواستِ عقب‌افتاده بی گزارشِ وضع: فقط سطرِ «اگر هنوز پاسخش نداده‌ای…»، هرگز قول ذخیره نمی‌شود
//  rm6reg   RM6 a — ضمیر با شاهدِ ساختِ واژه (امرِ مرکب، «ـی» ِ دومِ‌شخص، «ـت»، «ـید/ـین»)، نه فهرستِ بسته؛ حرفِ دستیار هرگز شاهد نیست
//  rm6res   RM6 c — RESULT_WEAK به‌تنهایی مرحله را عوض نمی‌کند (فقط پیشنهاد)؛ ادعا/صورت در فهم هرگز بازنگری نیست
//  rm6f     RM6 f — پس از chat_solved و بی مسئلهٔ باز، کارتِ مرحله پیشنهاد نمی‌شود (s31 p13)
//  rm6g     RM6 g — هیچ سطرِ پرامپتِ ساختهٔ صفحه یادداشتِ توسعه‌دهنده ندارد (پویشِ ساختاری + بانک)
//  rm2d     RM2 d — «**…**» در حبابِ دستیار پررنگ است
//  docx     هر فیلدِ تازهٔ coach_state در «# گزارشِ وضع» به‌صورتِ زمینه آمده
//  strict   کنترل: یک پرسشِ نوبت در هر بلوک
// LLA_FILE = ساختِ دیگر؛ ONLY=rm1ev,rm5plan …
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = require('./tour1_variants_r18_coach.js');

const SKIP = /^# (?:سشن|گفت‌وگو تا این لحظه|نوبتِ تازه|صفحهٔ فعلی|امروز|نقشهٔ سامانه|برگه‌های بازِ|پیام‌های اخیرِ صفحه|متنِ فایل‌ها|کارنامهٔ ذهن|مسئلهٔ زندهٔ این سشن)/;
const isTurnLine = (l) => /\*\*پرسشِ این نوبت همین است:?\*\*/.test(l) || /^- پرسش‌های «/.test(l) || /^- در این نوبت فقط \*\*یک\*\* پرسش/.test(l);
const isCtxLine = (l) => /^- زمینه \(نه پرسشِ دوم\)/.test(l) || /^- \(زمینه، نه پرسشِ دوم/.test(l);
const ASK = /(?:^|[^آ-ی])بپرس(?![آ-ی])/;
const ENDQ = /[؟?][»"')\].\s*]*$/;
function strictScan(user) {
  const head = String(user || '').split('# نوبتِ تازه')[0], bad = [];
  for (const bl of head.split(/\n(?=# )/)) {
    const h = bl.split('\n')[0]; if (!/^# /.test(h) || SKIP.test(h)) continue;
    const blockCtx = /\n- \(زمینه، نه پرسشِ دوم/.test(bl);
    for (const l of bl.split('\n')) {
      if (isTurnLine(l)) continue;
      const nq = l.replace(/«[^»]*»/g, '«»');
      if (ASK.test(nq)) bad.push('ASK  [' + h.slice(0, 30) + '] ' + l.slice(0, 160));
      else if (ENDQ.test(l.trim()) && !isCtxLine(l) && !blockCtx) bad.push('ENDQ [' + h.slice(0, 30) + '] ' + l.slice(0, 160));
    }
  }
  return bad;
}
// ---------- RM6g: یادداشتِ توسعه‌دهنده در سطرهای ساختهٔ صفحه ----------
const DEV = /دورِ\s*[۰-۹0-9]|(?:^|[^A-Za-z])RC\d|(?:^|[^A-Za-z])R1\d(?![0-9])|DECISIONS|VARIANTS|RUNNER\d|(?:^|[^A-Za-z0-9_])[A-Za-z0-9_]+\.(?:js|py|json|md|gs)(?![A-Za-z])|build\.py/;
// «# نقشهٔ سامانه» ساختهٔ ثبت‌گاه‌هاست (مالکِ هر قلمرو و مسیرِ ownership برای ثبتِ برگه — قراردادِ AGENTS)، نه یادداشتِ توسعه‌دهنده
const USER_BLOCKS = /^# (?:گفت‌وگو تا این لحظه|نوبتِ تازه|پیام‌های اخیرِ صفحه|متنِ فایل‌ها|سشن|نقشهٔ سامانه)/;
function devLine(l) { return DEV.test(String(l).replace(/«[^»]*»/g, '«»')); }   // حرفِ کاربر درونِ «…» داده است، نه یادداشت
function devScan(sys, user) {
  const bad = [];
  String(sys || '').split('\n').forEach(l => { if (devLine(l)) bad.push('SYS ' + l.slice(0, 160)); });
  for (const bl of String(user || '').split(/\n(?=# )/)) { const h = bl.split('\n')[0]; if (USER_BLOCKS.test(h)) continue;
    bl.split('\n').forEach(l => { if (devLine(l)) bad.push('[' + h.slice(0, 30) + '] ' + l.slice(0, 160)); }); }
  return bad;
}

(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0] + ' ' + JSON.stringify(info[name] && info[name].stage || '')); } };
  const T0 = '2026-10-17';
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0; window.__noNav = true;
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user: String(user || '') }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    window.__turn = async (text, reply, actions) => {
      const n0 = __calls.length; __q.push(R({ reply: reply || 'باشه.', actions: actions || [] }));
      await APP.ASSIST.send(text); __q.length = 0;
      const c = __calls.slice(n0).filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {};
      return { sys: c.sys || '', user: c.user || '' };
    };
    window.__fresh = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__pid = (re) => { const x = APP.liveAll().filter(x => new RegExp(re).test(x.p.title)).pop(); return x ? x.p.id : null; };
    /* کارنامه از همهٔ داده‌هاست ⇒ هر موردِ بانک روی انبارِ پاک */
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__ph = () => { const Q = APP.MIND.phases(); const o = { n: Q.n, weakest: Q.weakest ? Q.weakest.id : null }; Q.rows.forEach(r => { o[r.id] = r.none ? 'none' : r.k + '/' + r.n; }); return o; };
    window.__live = (title) => { const r = APP.liveCreate(title, title + ' — صورتِ کاملِ مسئله برای آزمون.', 'find', { by: 'user' }); return r.p.id; };
    window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {};
      ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L); APP.S.put(pg); };
    window.__ev = (ph, ok, n) => { const s = APP.ASSIST.cur(); s.coachEv = s.coachEv || []; for (let i = 0; i < (n || 1); i++) s.coachEv.push({ at: new Date().toISOString(), ph, ok: !!ok, src: ok ? 'chatok' : 'chat', key: 'inj|' + ph + '|' + Math.random() }); APP.S.put(s); };
  }, T0);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const lines = (u) => head(u).split('\n');
  const turnLines = (u) => lines(u).filter(l => /\*\*پرسشِ این نوبت همین است:?\*\*/.test(l));
  const coachHead = (u) => (lines(u).filter(l => /^# مربیِ حل/.test(l))[0] || '');
  const strictAll = [], devAll = [];
  const strict = (name, u) => { strictAll.push([name, strictScan(u.user || u)]); if (u.sys !== undefined) devAll.push([name, devScan(u.sys, u.user)]); };
  const turn = async (text, reply, actions) => { const u = await p.evaluate(([t, r, a]) => __turn(t, r, a), [text, reply || '', actions || []]); strict(String(text).slice(0, 24), u); return u; };
  const fresh = () => p.evaluate(() => __fresh());
  const wipe = () => p.evaluate(() => __wipe());
  const ph = () => p.evaluate(() => __ph());
  const day = (d) => p.evaluate(d => { window.__day = d; }, d);
  const bank = (rc, kind) => BANK.filter(e => e.rc === rc && (!kind || e.kind === kind));
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const STMT = 'مسئله: از گوشهٔ پایین-چپِ یک جدولِ ۴ در ۴ به گوشهٔ بالا-راست فقط با حرکتِ راست و بالا چند راه هست؟ نمی‌دونم از کجا شروع کنم.';

  // ================= rm1ev =================
  await section('rm1ev', async () => {
    const r = info.rm1ev = { res: [] };
    const E = bank('RM1.evidence'); const T = (i, ok, x) => { r.res.push([i + 1, ok]); chk(ok, 'rm1ev bank#' + (i + 1) + ' «' + E[i].text.slice(0, 90) + '» → ' + E[i].expect.slice(0, 120) + ' :: ' + JSON.stringify(x)); };
    const noneOthers = (o, keep) => ['und', 'plan', 'exec', 'back'].filter(k => keep.indexOf(k) < 0).every(k => o[k] === 'none');
    let o;
    // 1 — پاسخِ پذیرفته به پرسشِ فهم
    await wipe(); await fresh(); await turn(STMT, 'مجهول دقیقاً چیست؟');
    await turn('مجهول همون تعداد راه‌های رسیدن به گوشه‌ست', 'خوب است. داده‌ها چه؟', [cs({ ph: 'u', said: ['u'], ans: ['u1'] })]);
    o = await ph(); T(0, o.und === '1/1' && noneOthers(o, ['und']) && !o.weakest, o);
    // 2 — طرحِ ثبت‌شده + گامی که «حل شد»
    await wipe(); let pid = await p.evaluate(() => __live('جدولِ چهار در چهار'));
    await p.evaluate(pid => __liveSet(pid, (so, L) => { L.plan = { t: 'هر مسیر یک چیدمانِ ۳ راست و ۳ بالاست؛ ترکیب می‌شمارم', at: new Date().toISOString(), d: APP.today(), unused: {}, heur: ['ask'] };
      L.steps.push({ id: 'st1', at: new Date().toISOString(), text: 'C(6,3) را حساب کردم', closed: true, out: { at: new Date().toISOString(), done: 'yes', prog: 'کامل', what: '۲۰' } }); }), pid);
    o = await ph(); T(1, o.plan === '1/1' && o.exec === '1/1' && o.und === 'none' && o.back === 'none' && o.weakest === null || (o.plan === '1/1' && o.exec === '1/1' && o.und === 'none' && o.back === 'none'), o);
    // 3 — شکست در فهم، بعد پاسخِ پذیرفته
    await wipe(); await fresh(); await turn('مسئله: از یک مربعِ ۱۰ در ۱۰ دایره‌ای به شعاعِ ۵ را برداشتیم؛ چه می‌خواهیم پیدا کنیم؟', 'مجهول دقیقاً چیست؟');
    await turn('مجهول محیطِ دایره‌ست.', 'دوباره صورت را بخوان.', [cs({ ph: 'u', fail: true })]);
    await turn('پس دنبال مساحتِ باقی‌مونده‌ایم', 'آفرین.', [cs({ ph: 'u', said: ['u'], ans: ['u1'] })]);
    o = await ph(); const rowTxt = await p.evaluate(() => { APP.go('mind'); return new Promise(res => setTimeout(() => res([...document.querySelectorAll('main .mind-phases tr[data-ph]')].map(tr => tr.textContent)), 250)); });
    T(2, o.und === '1/2' && noneOthers(o, ['und']) && !o.weakest && rowTxt.some(t => /فهمِ مسئله/.test(t) && /۱ از ۲/.test(t)) && rowTxt.filter(t => /هنوز داده‌ای نیست/.test(t)).length === 3, { o, rowTxt });
    await p.evaluate(() => APP.go('home'));
    // 4 — دروازهٔ داده + مسئلهٔ کمکی
    await wipe(); pid = await p.evaluate(() => __live('مسئلهٔ کمکیِ آزمون'));
    await p.evaluate(pid => __liveSet(pid, (so, L) => { L.wins = [{ at: new Date().toISOString(), d: APP.today(), kind: 'datum', t: 'شعاعِ ۵' }]; L.aux.push({ t: 'حالتِ خاص: مربعِ ۲ در ۲', k: 'special', bridge: 'همان شمارش بزرگ‌تر', crossed: { t: 'پلش زده شد', at: new Date().toISOString() } }); }), pid);
    o = await ph(); T(3, o.plan === '2/2' && noneOthers(o, ['plan']), o);
    // 5 — وارسیِ سنجیده از پیام‌های خودش
    await wipe(); pid = await p.evaluate(() => __live('وارسیِ سنجیده'));
    await p.evaluate(pid => __liveSet(pid, (so) => { so.b = { 1: { done: true, from: 'chat', own: false, chkBy: 'msgs', verdict: 'verified', chkRes: 'نتیجه سالم ماند', at: new Date().toISOString() } }; }), pid);
    o = await ph(); T(4, o.back === '1/1' && noneOthers(o, ['back']) && !o.weakest, o);
    // 6 — chat_solved با check ِ سنجیده
    await wipe(); await fresh(); const ST6 = 'معما: با دو ظرفِ ۳ و ۵ لیتری دقیقاً ۴ لیتر آب بردار — چطور؟';
    await turn(ST6, 'خودت تا کجا رفتی؟');
    await turn('۵ رو پر کردم، تو ۳ ریختم، ۳ رو خالی کردم، ۲ تا رو ریختم تو ۳، دوباره ۵ رو پر کردم و تا پر شدنِ ۳ ریختم: ۴ موند. با شمردنِ لیترها چک کردم درسته.', 'ثبت شد.',
      [{ do: 'chat_solved', title: 'دو ظرفِ ۳ و ۵', statement: ST6, kind: 'find', lesson: 'از اختلافِ ظرف‌ها استفاده کن', check: 'لیترها را شمرد' }, cs({ check: { msgs: ['با شمردنِ لیترها چک کردم درسته'] } })]);
    o = await ph(); T(5, o.exec === '1/1' && o.back === '1/1' && o.und === 'none' && o.plan === 'none', o);
    // 7 — گذر از فهم به طرح
    await wipe(); await fresh(); await turn(STMT, 'مجهول دقیقاً چیست؟');
    await turn('مجهول تعداد مسیرهاست؛ داده‌ها جدولِ ۴ در ۴ و شرط فقط راست و بالا رفتن.', 'خب، حالا طرحت؟', [cs({ ph: 'p', said: ['u', 'd', 'c'], ans: [] })]);
    o = await ph(); T(6, o.und === '1/1' && o.plan === 'none' && noneOthers(o, ['und']), o);
    // 8 — دو شکستِ طرح + گامِ «حل شد» ⇒ طرح ضعیف‌ترین؛ بی‌داده‌ها رتبه نمی‌گیرند
    await wipe(); await fresh(); await turn('سلام', 'سلام.'); await p.evaluate(() => __ev('p', false, 2)); pid = await p.evaluate(() => __live('گامِ اجرا'));
    await p.evaluate(pid => __liveSet(pid, (so, L) => { L.steps.push({ id: 's1', text: 'گام', closed: true, out: { done: 'yes', prog: 'کمی' } }); }), pid);
    o = await ph(); T(7, o.plan === '0/2' && o.exec === '1/1' && o.und === 'none' && o.back === 'none' && o.weakest === 'plan', o);
    // 9 — هر چهار داده دارند
    await wipe(); await fresh(); await turn('سلام', 'سلام.'); await p.evaluate(() => { __ev('u', true, 2); __ev('p', true, 1); __ev('p', false, 2); __ev('c', true, 2); __ev('b', true, 1); });
    o = await ph(); T(8, o.und === '2/2' && o.plan === '1/3' && o.exec === '2/2' && o.back === '1/1' && o.weakest === 'plan', o);
    // 10 — برهان و بازنگریِ وارسی‌شده ⇒ کارت دربارهٔ رادار صادقانه می‌گوید نگاشتی نیست
    await wipe(); pid = await p.evaluate(() => __live('المپیادِ نابرابری'));
    await p.evaluate(pid => __liveSet(pid, (so, L) => { L.steps.push({ id: 's1', text: 'AM-GM', proof: 'نابرابریِ میانگین‌ها', closed: true, out: { done: 'yes', prog: '', kind: 'proof' } });
      so.b = { 1: { done: true, from: 'live', chkRes: 'نتیجه سالم ماند', at: new Date().toISOString() } }; }), pid);
    const rad = await p.evaluate(() => { APP.go('mind'); return new Promise(res => setTimeout(() => res({ note: (document.querySelector('main .mind-phradar') || {}).textContent || '', o: __ph() }), 300)); });
    T(9, /نگاشتی/.test(rad.note) && /رادار/.test(rad.note) && rad.o.exec === '1/1' && rad.o.back === '1/1', rad);
    await p.evaluate(() => APP.go('home'));
    // —— منفی‌ها
    // 11 — گیر ⇒ دقیقاً یک شکست
    await wipe(); await fresh(); await turn(STMT, 'مجهول دقیقاً چیست؟');
    await turn('گیر کردم، اصلاً نمی‌دونم از کجا شروع کنم', 'آرام؛ مجهول چیست؟', [cs({ ph: 'u', stuck: true })]);
    o = await ph(); T(10, o.und === '0/1' && noneOthers(o, ['und']), o);
    // 12 — «حل شد» ِ بی گزارش
    await wipe(); await fresh(); await turn('معما: ۱۰۰ خانهٔ شطرنجی را با دومینو بپوشان؛ چند دومینو؟', 'خودت؟');
    await turn('حل شد، جوابش ۴۹ تاست', 'چطور به ۴۹ رسیدی؟');
    o = await ph(); T(11, (o.exec === 'none' || /^0\//.test(o.exec)) && (o.back === 'none' || /^0\//.test(o.back)), o);
    // 13 — ans ِ ردشده (نمی‌دونم / شناسهٔ ناموجود)
    await wipe(); await fresh(); await turn(STMT, 'مجهول دقیقاً چیست؟');
    await turn('نمی‌دونم', 'باشه.', [cs({ ph: 'u', ans: ['u1', 'u9'] })]);
    o = await ph(); T(12, ['und', 'plan', 'exec', 'back'].every(k => o[k] === 'none' || /^0\//.test(o[k])), o);
    // 14 — فقط اجرا داده دارد
    await wipe(); await fresh(); await turn('سلام', 'سلام.'); await p.evaluate(() => __ev('c', true, 3));
    o = await ph(); T(13, o.exec === '3/3' && noneOthers(o, ['exec']) && o.weakest === null, o);
    // 15 — فرمِ طرح باز و خالی بسته شد
    await wipe(); pid = await p.evaluate(() => __live('طرحِ خالی'));
    await p.evaluate(pid => __liveSet(pid, (so, L) => { L.planDraft = { t: '' }; }), pid);
    o = await ph(); T(14, o.plan === 'none', o);
    // 16 — دستیار جواب را گفت، او «آهان»
    await wipe(); await fresh(); await turn(STMT, 'مجهول دقیقاً چیست؟'); await turn('آهان', 'پس جواب ۲۰ است.', [cs({ ph: 'u', said: [], ans: [] })]);
    o = await ph(); T(15, ['und', 'plan', 'exec', 'back'].every(k => o[k] === 'none'), o);
    // 17 — بستن با گامِ باز، پاسخ داده نشد
    await wipe(); pid = await p.evaluate(() => __live('گامِ باز'));
    await p.evaluate(pid => __liveSet(pid, (so, L) => { L.steps.push({ id: 's1', text: 'فردا بپزم', closed: true, out: { done: 'no', auto: 'solved' } }); L.steps.push({ id: 's2', text: 'گامِ دیگر' }); }), pid);
    o = await ph(); T(16, o.exec === 'none', o);
    // 18 — check با نقل‌هایی که در پیام‌هایش نیست
    await wipe(); await fresh(); const ST18 = 'معما: با سه بار وزن کردن سکهٔ سبک را از ۲۷ سکه پیدا کن.';
    await turn(ST18, 'خودت؟'); await turn('سه‌تا سه‌تا تقسیم کردم و شد.', 'ثبت شد.', [{ do: 'chat_solved', title: 'سکهٔ سبک ۲۷', statement: ST18, kind: 'find', lesson: 'عددِ وسط همیشه میانگین است و تقارن کلید است', check: 'به گزارشِ گفت‌وگو وارسی شد' }, cs({ check: { msgs: ['همهٔ حالت‌ها را با جدول وارسی کردم'] } })]);
    o = await ph(); const v18 = await p.evaluate(() => { const pid = __pid('سکهٔ سبک ۲۷'); return APP.liveClosure(pid).verdict; });
    T(17, o.back === 'none' && v18 !== 'verified', { o, v18 });
    // 19 — رونوشتِ صورت، بی ans
    await wipe(); await fresh(); await turn(STMT, 'مجهول دقیقاً چیست؟'); await turn(STMT, 'همان صورت را دوباره آوردی؛ مجهول چیست؟');
    o = await ph(); T(18, o.und === 'none' || /^0\//.test(o.und), o);
    // نقلِ اجراکننده‌ها: s19 «اجرا ضعیف‌ترین» پس از نتیجهٔ ۴ کیلو — نتیجهٔ گزارش‌شده یک موفقیتِ اجراست؛ شکستِ بعدی همان را پس می‌گیرد (یک رویداد)
    await wipe(); await fresh(); await turn('مسئله: وزنم ۷۶ بود و می‌خوام ۴ کیلو کم کنم؛ چند هفته طول می‌کشه اگه هفته‌ای نیم کیلو کم کنم؟', 'مجهول چیست؟');
    await turn('مجهول تعداد هفته‌هاست؛ داده‌ها ۴ کیلو و نیم کیلو در هفته. طرحم تقسیمه.', 'خب.', [cs({ ph: 'e', said: ['u', 'd', 'plan'] })]);
    await turn('۴ تقسیم بر نیم شد ۸ هفته. جوابم ۸ هفته‌ست.', 'نتیجه را وارسی می‌کنی؟', [cs({ ph: 'b', said: ['result'] })]);
    const o19 = await ph();
    await turn('نه صبر کن، غلط شد؛ هفته‌ای نیم کیلو نبود، یک کیلو بود.', 'خب.', [cs({ ph: 'e', fail: true })]);
    const o19b = await ph();
    chk(o19.exec === '1/1' && o19b.exec === '0/1', 's19 (B·D5): a reported result is one execution success; a fail reported right after it retracts that success (one event, not two) ' + JSON.stringify([o19, o19b]));
  });

  // ================= rm4g =================
  await section('rm4g', async () => {
    const r = info.rm4g = { res: [] };
    const E = bank('RM4.guess');
    const ctxG = (e) => { const c = e.context || '', g = /g:"([^"]*)"/.exec(c), q = /q:"([^"]*)"/.exec(c); return g ? { g: g[1], q: q ? q[1] : '' } : null; };
    const parts = (t) => t.split(' ‖ ').map(x => x.trim());
    const lastAiGuess = () => p.evaluate(() => { const M = __cur().msgs.filter(m => m.role === 'ai'); const m = M[M.length - 1]; return m && m.guess ? JSON.parse(JSON.stringify(m.guess)) : null; });
    for (let i = 0; i < E.length; i++) {
      const e = E[i], g = ctxG(e), ps = parts(e.text); await fresh();
      let U = (ps.find(x => /^U/.test(x)) || 'U: ').replace(/^U(?:\s*\([^)]*\))?:\s*/, ''), A = (ps.find(x => /^A:/.test(x)) || 'A: ').replace(/^A:\s*/, '');
      let focusPid = null;
      if (/live problem in focus/.test(e.text)) { await turn('آره ثبتش کن.', 'ثبت شد.', [{ do: 'live_new', title: 'مساحتِ نیم‌شده', statement: 'اگر وسط‌های ضلع‌های یک مربع را به هم وصل کنیم، مساحتِ مربعِ تازه چه نسبتی با قبلی دارد؟', nat: 'objective' }]); focusPid = await p.evaluate(() => __pid('مساحتِ نیم‌شده')); }
      if (/problem A earlier/.test(e.text)) { await turn('مسئله‌ی الف: کوچک‌ترین عددی که بر ۲ و ۳ و ۴ بخش‌پذیر است؟ حدسم ۷ ـه', 'چطور می‌آزمایی؟', [cs({ guess: { text: '۷' } })]); U = 'مسئله‌ی جدید: مجموعِ زاویه‌های یک شش‌ضلعی چند است؟'; A = 'این را چطور می‌آزمایی؟'; }
      const acts = []; let naive = false;
      if (g) acts.push(cs({ guess: Object.assign({ text: g.g }, g.q ? { q: g.q } : {}) }));
      else if (e.kind === 'neg' && /assistant|label|proverb/.test(e.expect)) { naive = true; const qt = (A.match(/«([^»]+)»/) || [])[1] || (A.match(/جواب ([^؛]+) است/) || [])[1] || 'ناتمام'; acts.push(cs({ guess: { text: qt } })); }
      await turn(U || 'سلام', A, acts);
      const mg = await lastAiGuess();
      let ok;
      if (e.kind === 'pos') ok = !!mg && mg.q === g.q && mg.text === g.g;
      else if (/q .* is not a substring|guess has no q/.test(e.expect)) ok = !!mg && !mg.q;
      else if (g && g.q) ok = !!mg && mg.q === g.q;   // #35: q فقط همان جمله
      else ok = !mg;
      if (focusPid) { const sg = await p.evaluate(pid => { const so = (APP.S.get('eprog_' + pid) || {}).solve || {}; return (so.g && so.g[1] && so.g[1].guess) || ''; }, focusPid); ok = ok && sg === g.g; }
      r.res.push([i + 1, ok, naive]); chk(ok, 'rm4g bank#' + (i + 1) + ' «' + e.text.slice(0, 80) + '» → ' + e.expect.slice(0, 110) + ' :: ' + JSON.stringify(mg));
    }
    // s12/s18 (B·D2): q ِ ساختگی (در پیام نیست) رد می‌شود؛ بی q هیچ q ای نیست
    await fresh(); await turn('به نظرم ناوبان باشه', 'آیا پیش‌تر خانه‌ای با همین نوع شرط دیده‌اید؟ «ناوبان» پنج حرف دارد؟', [cs({ guess: { text: 'ناوبان', q: 'ناوبان شش حرف دارد؟' } })]);
    const m12 = await lastAiGuess(); chk(m12 && m12.text === 'ناوبان' && !m12.q, 's12 (B·D2): a q that is not in the assistant message is dropped — no option can receive the note ' + JSON.stringify(m12));
  });

  // ================= rm5plan =================
  await section('rm5plan', async () => {
    const r = info.rm5plan = { res: [] };
    const E = bank('RM5.plan'); const T = (i, ok, x) => { r.res.push([i + 1, ok]); chk(ok, 'rm5plan bank#' + (i + 1) + ' «' + E[i].text.slice(0, 80) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 500)); };
    const plans = () => p.evaluate(() => JSON.parse(JSON.stringify(APP.ASSIST.plansAll(APP.ASSIST.cur()).map(x => ({ id: x.p.id, text: x.p.text, when: x.p.when, state: x.p.state || 'open', done: !!x.p.done, onGuess: !!x.p.onGuess })))));
    const fup = (u) => lines(u.user).filter(l => /پیگیری/.test(l) && /deadline/.test(l) && !/فقط اگر/.test(l));
    const dueL = (u) => lines(u.user).filter(l => /plan_done/.test(l) && /جویا شو/.test(l));
    const todayP = () => p.evaluate(() => APP.dueList().filter(x => /📌 برنامهٔ خودت/.test(x.txt)).map(x => x.txt + ' | ' + x.sub));
    const strip = (t) => String(t).replace(/^\([^)]*\)\s*/, '').replace(/[.!؟?。]+\s*$/, '').trim();
    const simple = async (i, when, extraCheck) => { await wipe(); await day(T0); await fresh(); const t = strip(E[i].text);
      await turn(t, 'خوب است.', [cs({ plan: { text: t, when } })]); const st = await plans(); const u2 = await turn('باشه.'); const f = fup(u2);
      return { st, f, ok: st.length === 1 && st[0].when === when && st[0].state === 'open' && (when === 'next-session' ? !f.length : f.length === 1 && f[0].indexOf(when) >= 0) }; };
    let x;
    x = await simple(0, '2026-10-18'); T(0, x.ok, x);
    // 1 + 2 — موعدِ گذشته: یک بار «انجام شد؟»؛ plan_done ⇒ done؛ بی پاسخ ⇒ expired
    x = await simple(1, '2026-10-19');
    await day('2026-10-20'); await fresh(); const u1 = await turn('سلام، امروز چه کنیم؟'); const d1 = dueL(u1); const id1 = (await plans())[0].id;
    const tp1 = await todayP();
    const u1b = await turn('آره، ایمیل رو زدم', 'عالی.', [cs({ plan_done: { id: id1, done: true } })]); const d1b = dueL(u1b);
    const st2 = await plans(); const tp2 = await todayP(); const u1c = await turn('بریم سراغ کار.');
    T(1, x.ok && d1.length === 1 && d1[0].indexOf(id1) >= 0 && !d1b.length && !dueL(u1c).length && tp1.length === 1, { d1, d1b, tp1 });
    T(2, st2[0].state === 'done' && !tp2.length && !fup(u1c).length, { st2, tp2 });
    // 3 — دوباره در همان روز: یک برنامه (متنِ درون‌گیر، یا plan.same)
    await wipe(); await day(T0); await fresh(); await turn('فردا عصر یه ساعت میرم پیاده‌روی', 'خوب.', [cs({ plan: { text: 'فردا عصر یه ساعت میرم پیاده‌روی', when: '2026-10-18' } })]);
    await turn('فردا عصر یه ساعت میرم پیاده‌روی دیگه', 'باشه.', [cs({ plan: { text: 'فردا عصر یه ساعت میرم پیاده‌روی دیگه', when: '2026-10-18' } })]);
    const s3a = await plans(); const id3 = s3a[0] && s3a[0].id;
    await turn('آره فردا عصر پیاده‌روی', 'باشه.', [cs({ plan: { text: 'فردا عصر پیاده‌روی', when: '2026-10-18', same: id3 } })]); const s3b = await plans();
    T(3, s3a.length === 1 && s3b.length === 1, { s3a, s3b });
    // 4 + 9 — قولِ بی‌تاریخ ⇒ next-session، یک بار در سشنِ بعد
    for (const i of [4, 9]) { x = await simple(i, 'next-session'); await day('2026-10-18'); await fresh(); const a = await turn('سلام.'); const bq = await turn('خب، بریم.'); const tp = await todayP();
      T(i, x.ok && dueL(a).length === 1 && !dueL(bq).length, { x, a: dueL(a), b: dueL(bq), tp }); }
    // 5 — on_guess ⇒ «اول حدس را بیازما»، نه پیگیری
    await wipe(); await day(T0); await fresh(); const t5 = strip(E[5].text);
    await turn(t5, 'می‌فهمم.', [cs({ guess: { text: 'صدا از واحد بالاییه' }, plan: { text: 'امشب میرم در خونه‌شون حسابی بهشون می‌گم', when: '2026-10-17', on_guess: true } })]);
    const u5 = await turn('خب.'); const l5 = lines(u5.user).filter(l => /پیگیریِ برنامهٔ خودش/.test(l) || /اول حدس را بیازما/.test(l));
    T(5, l5.some(l => /اول حدس را بیازما/.test(l)) && !fup(u5).length, l5);
    // 5b — بی on_guess، حدس و برنامه در یک پیام ⇒ همان، شرطی
    await wipe(); await fresh(); await turn('به نظرم کار سرایداره… می‌خوام همین امروز باهاش برخورد کنم', 'می‌فهمم.', [cs({ guess: { text: 'کار سرایداره' }, plan: { text: 'می‌خوام همین امروز باهاش برخورد کنم', when: '2026-10-17' } })]);
    const u5b = await turn('خب.'); chk(lines(u5b.user).some(l => /اول حدس را بیازما/.test(l) && /اگر آن کار بر همین حدس تکیه دارد/.test(l)), 's22 (C·W5): guess and plan in one message without on_guess ⇒ conditional «اول حدس را بیازما» instead of an unconditional follow-up ' + JSON.stringify(lines(u5b.user).filter(l => /پیگیری/.test(l))).slice(0, 400));
    x = await simple(6, '2026-10-22'); T(6, x.ok, x);
    x = await simple(7, '2026-10-23'); T(7, x.ok, x);
    // 7b — بی when ِ مدل، «آخرِ همین هفته» ⇒ جمعه
    await wipe(); await fresh(); await turn('تا آخر همین هفته سه تا طرح اولیه می‌کشم', 'خوب.', [cs({ plan: { text: 'تا آخر همین هفته سه تا طرح اولیه می‌کشم' } })]);
    chk((await plans())[0].when === '2026-10-23', 'RM5: «آخرِ همین هفته» without a model date ⇒ Friday 2026-10-23 ' + JSON.stringify(await plans()));
    // 8 — پرسیده و بی پاسخ ⇒ expired؛ دیگر پرسیده نمی‌شود
    await wipe(); await day(T0); await fresh(); await turn('فردا ساعت ۷ میرم باشگاه', 'خوب.', [cs({ plan: { text: 'فردا ساعت ۷ میرم باشگاه', when: '2026-10-18' } })]);
    await day('2026-10-19'); await fresh(); const a8 = await turn('سلام.'); await turn('یه مسئله‌ی دیگه.');
    await day('2026-10-25'); await fresh(); const c8 = await turn('سلام دوباره.'); const s8 = await plans(); const tp8 = await todayP();
    T(8, dueL(a8).length === 1 && !dueL(c8).length && s8[0].state === 'expired' && !tp8.length && !fup(c8).length, { a: dueL(a8), c: dueL(c8), s8, tp8 });
    x = await simple(10, '2026-10-19'); T(10, x.ok, x);
    // منفی‌ها
    const negPlain = async (i) => { await wipe(); await day(T0); await fresh(); const t = strip(E[i].text); const u = await turn(t, 'می‌فهمم.'); const st = await plans(); const u2 = await turn('باشه.');
      return { st, a: fup(u), b: fup(u2), ok: !st.length && !fup(u).length && !fup(u2).length }; };
    for (const i of [11, 13, 14, 15, 17, 19]) { x = await negPlain(i); T(i, x.ok, x); }
    // 12 — تاریخِ گذشته از مدل ⇒ رد
    await wipe(); await fresh(); await turn('سه‌شنبه‌ی پیش قرار بود برم و نرفتم، دوباره می‌رم', 'خب.', [cs({ plan: { text: 'دوباره می‌رم', when: '2026-10-15' } })]);
    const s12 = await plans(); const u12 = await turn('باشه.'); T(12, !s12.length && !fup(u12).length, { s12, f: fup(u12) });
    // 16 — سشنِ ۱۰-۲۱، پیامِ پیشین از ۱۰-۱۷ (همان سشن): پیشنهادِ ۱۰-۱۸ نه، جفتِ دوباره نه، ذخیرهٔ دوباره نه
    await wipe(); await day(T0); await fresh(); await turn('فردا صبح انجامش میدم', 'خوب.', [cs({ plan: { text: 'فردا صبح انجامش میدم', when: '2026-10-18' } })]);
    await day('2026-10-21'); const u16 = await turn('دو تا اسکچ زدم، بعدیش چی؟'); const s16 = await plans();
    T(16, !fup(u16).some(l => /2026-10-18/.test(l)) && s16.length === 1, { f: fup(u16), s16 });
    // 18 — حدس پیش‌تر آزموده و تأیید شد ⇒ پیگیریِ عادی
    await wipe(); await day(T0); await fresh(); await turn('به نظرم کار سرایداره', 'چطور می‌آزمایی؟', [cs({ guess: { text: 'کار سرایداره' } })]);
    await turn('دوربین رو دیدم، خودش بود. تأیید شد.', 'پس حدست درست درآمد.');
    await turn('پس فردا میرم باهاش حرف می‌زنم', 'خوب است.', [cs({ plan: { text: 'پس فردا میرم باهاش حرف می‌زنم', when: '2026-10-19' } })]);
    const u18 = await turn('باشه.'); T(18, fup(u18).length === 1 && !lines(u18.user).some(l => /اول حدس را بیازما/.test(l)), lines(u18.user).filter(l => /پیگیری/.test(l)));
    await day(T0);
  });

  // ================= rm5def =================
  await section('rm5def', async () => {
    const r = info.rm5def = { res: [] };
    const E = bank('RM5.defer');
    for (let i = 0; i < E.length; i++) {
      const e = E[i]; await wipe(); await fresh();
      let U = e.text.replace(/^\([^)]*\)\s*/, ''), A = 'اول بگو دقیقاً کجای کار گیر کردی.';
      if (/answered it/.test(e.context || '')) A = 'این فرمول را از مساحت‌ها آوردند؛ از کجا آوردن‌اش همین است.';
      if (/assistant asked/.test(e.text)) { U = 'یه متن برای صاحبخونه لازمه.'; A = 'می‌خواهی متن را بنویسم؟'; }
      await turn(U, A);
      const u2 = await turn('باشه.');
      const ln = lines(u2.user).filter(l => /اگر هنوز پاسخش نداده‌ای/.test(l) && /عقب‌افتاده \(نامزد/.test(u2.user));
      const pr = await p.evaluate(() => (__cur().promises || []).length);
      let ok = e.kind === 'pos' ? ln.length === 1 && !pr : !ln.length && !pr;
      if (/assistant asked/.test(e.text)) ok = !lines(u2.user).some(l => /می‌خواهی متن را بنویسم/.test(l) && /اگر هنوز پاسخش نداده‌ای/.test(l)) && !pr;
      r.res.push([i + 1, ok]); chk(ok, 'rm5def bank#' + (i + 1) + ' «' + e.text.slice(0, 80) + '» → ' + e.expect.slice(0, 90) + ' :: ' + JSON.stringify({ ln, pr }).slice(0, 400));
    }
    // s14o (B·D7): همان پرسشِ «اثبات‌ها به چه درد من می‌خوره؟» پس از پاسخِ بی گزارش؛ و با گزارشِ وضع (بی defer) سطری نمی‌آید
    await fresh(); await turn('اصلاً این اثبات‌ها به چه درد من می‌خوره؟', 'اول این تمرین را ببندیم.', [cs({ ph: 'u' })]);
    /* دورِ ۲۰ (RO8، B·D15 — DECISIONS_R20 جای این بند را گرفت): پرسشِ «به چه درد/چه فایده/چرا باید» که پاسخ به آن نپرداخت، حتی با گزارشِ وضعِ بی defer، نامزد می‌ماند
       (s14o هنوز گم می‌شد)؛ جملهٔ دیگری با گزارشِ وضع همچنان داوریِ مدل است */
    const u3 = await turn('باشه.'); chk(/# درخواستِ عقب‌افتاده \(نامزد[^\n]*\n[^\n]*به چه درد/.test(head(u3.user)), 'rm5def (R20 RO8): an unaddressed purpose question stays a candidate even when the reply had coach_state without defer ' + head(u3.user).slice(0, 0));
    await fresh(); await turn('یه مثال دیگه هم بزن', 'اول این تمرین را ببندیم.', [cs({ ph: 'u' })]);
    const u4 = await turn('باشه.'); chk(!lines(u4.user).some(l => /عقب‌افتاده \(نامزد/.test(l)), 'rm5def: other requests with coach_state (without defer) stay the model\'s judgement');
  });

  // ================= rm6reg =================
  await section('rm6reg', async () => {
    const r = info.rm6reg = { res: [] };
    const E = bank('RM6.register');
    const reg = () => p.evaluate(() => ((__cur().coach || {}).reg) || '');
    for (let i = 0; i < E.length; i++) {
      const e = E[i]; await fresh(); let ok;
      if (/assistant/.test(e.text)) {
        await turn('تو چی میگی؟ مطمئنی؟', 'نمی‌دانم.', [cs({ register: 'تو' })]); await turn('باورت میشه؟ بازم نشد', 'چه می‌پرسید؟ لطفاً دوباره بگویید.');
        const u = await turn('خب.'); ok = (await reg()) === 'to' && lines(u.user).some(l => /ضمیرِ گفت‌وگو/.test(l) && /با «تو» است/.test(l));
      } else {
        const t = e.text.replace(/^\([^)]*\)\s*/, ''), want = e.kind === 'pos' ? (/شما/.test(e.expect.split(';')[0]) ? 'شما' : 'تو') : (/شما|بنویسید|کنید/.test(t) ? 'شما' : 'تو');
        await turn(t, 'باشه.', [cs({ register: want })]); const g = await reg();
        ok = e.kind === 'pos' ? g === (want === 'شما' ? 'shoma' : 'to') : !g;
      }
      r.res.push([i + 1, ok]); chk(ok, 'rm6reg bank#' + (i + 1) + ' «' + e.text + '» → ' + e.expect + ' :: ' + (await reg()));
    }
    // s16 (B·D6): حمید فقط «تو» نوشت؛ «می‌پرسید» ِ یک‌بارهٔ دستیار گفت‌وگو را «شما» نمی‌کند
    await fresh(); await turn('باورت میشه؟ پسرم دیگه سؤال نمی‌پرسه.', 'می‌پرسید چرا؟', [cs({ register: 'تو' })]); const u = await turn('آره، تو بگو چیکار کنم.');
    chk(lines(u.user).some(l => /ضمیرِ گفت‌وگو/.test(l) && /با «تو» است/.test(l)), 's16 (B·D6): a «تو» register reported on «باورت میشه؟» is accepted; the assistant\'s own «می‌پرسید» never flips it ' + JSON.stringify(lines(u.user).filter(l => /ضمیرِ گفت‌وگو/.test(l))));
  });

  // ================= rm6res =================
  await section('rm6res', async () => {
    const r = info.rm6res = { res: [] };
    const E = bank('RM6.result');
    const toExec = async () => { await fresh(); await turn('مسئله: در یک مستطیل قطر و ضلع‌ها را داریم و می‌خواهیم اندازهٔ قطر یا هزینه را پیدا کنیم؛ داده‌ها را می‌دانم.', 'مجهول چیست؟');
      await turn('مجهول همون جوابِ نهاییه؛ داده‌ها ۳ و ۴؛ شرط رابطهٔ فیثاغورس. طرحم: جایگذاری.', 'خب، اجرا کن.', [cs({ ph: 'e', said: ['u', 'd', 'c', 'plan'] })]); };
    for (let i = 0; i < E.length; i++) {
      const e = E[i], t = e.text.replace(/^\([^)]*\)\s*/, ''); let ok, x = {}; await wipe();
      if (e.kind === 'pos') {
        await toExec(); const u = await turn(t, 'نتیجه را وارسی می‌کنی؟', [cs({ ph: 'b', said: ['result'] })]); const u2 = await turn('باشه، وارسی می‌کنم.');
        const h1 = coachHead(u.user), off = lines(u.user).some(l => /شاید نتیجه‌ای گفت/.test(l)); x = { h1: h1.slice(0, 120), off, h2: coachHead(u2.user).slice(0, 120) };
        ok = /بازنگری/.test(coachHead(u2.user)) && (/بازنگری/.test(h1) ? true : true);
      } else {
        await fresh(); let u;
        if (/assistant/.test(e.text)) { await turn('معما: ۱۰۰ خانه را با دومینو بپوشان؛ چند تا لازم است؟', 'پس ۴۹ دومینو لازم است'); u = await turn('باشه'); }
        else if (/^مسئله اینه/.test(t)) u = await turn(t, 'مجهول چیست؟');
        else { await turn('مسئله: یک صفحهٔ ۱۰ در ۱۰ را با دومینو می‌پوشانیم و دو گوشهٔ مقابل را برداشته‌ایم؛ چند دومینو لازم است؟', 'مجهول چیست؟'); u = await turn(t, 'مجهول چیست؟'); }
        const h = coachHead(u.user); x = { h: h.slice(0, 120), tl: turnLines(u.user).map(l => l.slice(0, 120)) };
        ok = !/مرحلهٔ محتمل: بازنگری/.test(h) && !lines(u.user).some(l => /شاید نتیجه‌ای گفت/.test(l)) && !turnLines(u.user).some(l => /نتیجه را وارسی کنی/.test(l));
      }
      r.res.push([i + 1, ok, x]); chk(ok, 'rm6res bank#' + (i + 1) + ' «' + t + '» → ' + e.expect.slice(0, 90) + ' :: ' + JSON.stringify(x));
    }
    // s11 (B·D1): فرمول درونِ ادعا هنگامِ گفتنِ صورت — فهم، نه «وارسیِ نتیجه»
    await fresh(); await turn('یه معما دارم: صفحه‌ی ۱۰ در ۱۰ که دو گوشه‌ی مقابلش رو برداشتیم، با دومینو پر میشه؟', 'مجهول دقیقاً چیست؟');
    const u11 = await turn('حتماً جواب داره: 10^2 - 2 = 98 خونه می‌مونه، پس 98/2 = 49 تا دومینو');
    chk(!/مرحلهٔ محتمل: بازنگری/.test(coachHead(u11.user)) && !turnLines(u11.user).some(l => /نتیجه را وارسی کنی/.test(l)), 's11 (B·D1): a formula inside a claim while stating the problem stays in understanding; no «verify the result» turn question ' + JSON.stringify([coachHead(u11.user).slice(0, 140), turnLines(u11.user)]));
    // RESULT_WEAK در اجرا ⇒ فقط پیشنهاد (مرحله همان)
    await wipe(); await toExec(); const uw = await turn('محاسبه کردم: √(۹+۱۶) را حساب کردم، پس قطر = ۵ سانت');
    chk(!/مرحلهٔ محتمل: بازنگری/.test(coachHead(uw.user)) && lines(uw.user).some(l => /شاید نتیجه‌ای گفت/.test(l) && /said/.test(l)), 'RM6c: «پس X = n» alone in execution never moves the phase — it only offers (context line asking the model to report said:result) ' + JSON.stringify(coachHead(uw.user).slice(0, 140)));
  });

  // ================= rm6f =================
  await section('rm6f', async () => {
    const r = info.rm6f = {};
    const close = async () => { await fresh(); const st = 'معما: با چند بار وزن کردن سکهٔ سبک را از ۹ سکه پیدا کن.'; await turn(st, 'خودت تا کجا رفتی؟');
      await turn('سه‌تا سه‌تا تقسیم کردم و دو بار بس است. درسم: سه‌تایی تقسیم کنم.', 'درست ثبت شد. کدوم پرسش بیشتر کمکت کرد؟', [{ do: 'chat_solved', title: 'نه سکه', statement: st, kind: 'find', lesson: 'سه‌تایی تقسیم کنم', check: 'با هر ۹ جای ممکن شمردم' }]); };
    await close(); const u = await turn('همون که گفتی حالت خاص رو امتحان کن.');
    r.h = coachHead(u.user); r.sug = lines(u.user).filter(l => /پیشنهادِ این نوبت: «مجهول/.test(l));
    chk(r.h === '' || (!/مرحلهٔ محتمل: فهمِ مسئله/.test(r.h) && !r.sug.length), 's31 p13 (D·D4): after chat_solved with no open problem, no phase card («فهم» + «مجهول … چیست؟») is suggested ' + JSON.stringify(r).slice(0, 400));
    await close(); const u2 = await turn('مرسی، خیلی خوب بود.');
    chk(!/مرحلهٔ محتمل: فهمِ مسئله/.test(coachHead(u2.user)), 'RM6f variant: a thank-you after closure gets no phase card ' + coachHead(u2.user).slice(0, 120));
    await close(); const u3 = await turn('یه مسئلهٔ تازه دارم: مجموعِ زاویه‌های داخلیِ یک هشت‌ضلعی چند درجه است؟');
    chk(/مرحلهٔ محتمل: فهمِ مسئله/.test(coachHead(u3.user)), 'RM6f control: a real new problem after closure still gets the «فهم» card ' + coachHead(u3.user).slice(0, 120));
  });

  // ================= rm6g =================
  await section('rm6g', async () => {
    const r = info.rm6g = {};
    for (const e of bank('RM6.leak')) { const user = /^\(her message/.test(e.text); const flagged = user ? false : devLine(e.text);
      chk(e.kind === 'pos' ? flagged : !flagged, 'rm6g scanner self-test (bank): «' + e.text + '» → ' + e.expect); }
    // پرامپت‌های گوناگون (🔭 بلند، مربی، مسئلهٔ زنده، برنامه، قول) — هیچ یادداشتِ توسعه‌دهنده
    const msgs = ['هر روز یه ستون اضافه می‌کنم و هیچ تصمیمی نمی‌گیرم. بین اجارهٔ بلندمدت و خرید آپارتمان گیر کردم، نمی‌دونم کدوم رو انتخاب کنم.', 'یه مسئله دارم، می‌خوام حلش کنم: گوجه را در بالکن بکارم یا گلدان؟',
      '۸ ماهه می‌خوام نشون بدم یه شبکه‌ی خاص نوسان گاما تولید می‌کنه یا نه. دیگه فکرم کار نمی‌کنه.', 'R2 مدلم شد ۰٫۹۳ و دورِ ۲ مسابقه رو باختم؛ حالا چی؟'];
    for (const m of msgs) { await fresh(); await turn(m); await turn('آره ثبتش کن.', 'ثبت شد.', [{ do: 'live_new', title: 'مسئلهٔ ' + m.slice(0, 12), statement: m, nat: 'life' }]); await turn('خب از کجا شروع کنم؟'); }
    const bad = devAll.filter(x => x[1].length);
    chk(!bad.length, 'rm6g (A·L1): no page-authored prompt line (SYS included) carries a developer note — round numbers, RC/R-ids, DECISIONS, file names ' + JSON.stringify(bad).slice(0, 900));
  });

  // ================= rm2d =================
  await section('rm2d', async () => {
    await fresh(); await turn('2**3 چند میشه؟', 'یک ایده: **توان یعنی ضربِ تکراری** — حالا خودت حساب کن.');
    await p.evaluate(() => { APP.ASSIST.toggle(true); }); await p.waitForTimeout(200);
    const r = await p.evaluate(() => { const ms = [...document.querySelectorAll('.as-msg')]; const ai = ms.filter(m => m.classList.contains('ai')).pop(), us = ms.filter(m => m.classList.contains('user')).pop();
      return { strong: ai && ai.querySelector('strong') ? ai.querySelector('strong').textContent : '', aiTxt: ai ? ai.textContent : '', user: us ? us.textContent : '' }; });
    info.rm2d = r;
    chk(r.strong === 'توان یعنی ضربِ تکراری' && !/\*\*/.test(r.aiTxt) && /2\*\*3/.test(r.user), 'RM2d (B·D11): «**…**» in the assistant bubble renders bold without the markers; the user\'s «2**3» stays literal ' + JSON.stringify(r));
    await p.evaluate(() => { APP.ASSIST.toggle(false); });
  });

  // ================= docx =================
  await section('docx', async () => {
    const X = await p.evaluate(() => APP.ASSIST.COACH_STATE_X || '');
    ['next-session', '"same"', 'on_guess', 'plan_done', '"q"', 'step {'].forEach(f => chk(X.indexOf(f.replace(/"/g, '\\"')) >= 0 || X.indexOf(f) >= 0, 'docx: «# گزارشِ وضع» documents the new field ' + f));
    chk(/^# گزارشِ وضع/.test(X) && /\n- زمینه \(نه پرسشِ دوم\)/.test(X), 'docx: the state block is context, not a second question');
  });

  // ================= rm6e — پنجرهٔ وارسی از پیامِ صورتِ مسئله؛ sameStmt با واژه‌های متمایز (D·D3 s31) =================
  await section('rm6e', async () => {
    await wipe(); await fresh(); const ST = 'دنبالهٔ a_n = (10/n)^(n/2) را در نظر بگیر: آیا همگراست و حدش چیست؟';
    await turn(ST, 'خودت؟');
    await turn('n=5 رو گذاشتم و جمله‌ها رو حساب کردم.', 'خب.');
    await turn('مثبت بودنِ جمله‌ها رو هم چک کردم، همه‌شون مثبتن.', 'خب.');
    await turn('سه تا ساختم: دنباله (10/n)^n، دنباله (10/n)^(n/2) و دنباله (10/n)^(n+1) — همگراست و حدش صفره، دنباله دنباله دنباله.', 'ثبت شد.',
      [{ do: 'chat_solved', title: 'همگراییِ (10/n)^(n/2)', statement: ST, kind: 'find', lesson: 'حالت‌های خاص را جدا بسنجم', check: 'n=5 و مثبت بودن' }, cs({ check: { msgs: ['n=5 رو گذاشتم', 'مثبت بودنِ جمله‌ها رو هم چک کردم'] } })]);
    const v = await p.evaluate(() => { const pid = __pid('همگراییِ'); return APP.liveClosure(pid).verdict; });
    chk(v === 'verified', 's31 (D·D3): the check window starts at the message that stated the problem; a later look-alike message (variants, repeated tokens) does not push it past her check messages ' + v);
  });
  // ================= step — گزارشِ گامِ مسئلهٔ زنده از گفت‌وگو ⇒ A.liveStepReport =================
  await section('step', async () => {
    await wipe(); await fresh();
    await turn('آره ثبتش کن.', 'ثبت شد.', [{ do: 'live_new', title: 'نانِ فردا', statement: 'نانِ خانگیِ اول را چطور بپزم که خمیرش بیاید؟', nat: 'practical' }]);
    const pid = await p.evaluate(() => __pid('نانِ فردا'));
    await p.evaluate(pid => __liveSet(pid, (so, L) => { L.steps.push({ id: 'st1', at: new Date().toISOString(), text: 'خمیر را دو ساعت گرم نگه دارم', pred: 'ور می‌آید', due: APP.today() }); }), pid);
    await turn('خمیر رو دو ساعت گرم نگه داشتم، خوب ور اومد!', 'آفرین.', [cs({ step: { step: 1, done: 'yes', match: 'yes' } })]);
    const r1 = await p.evaluate(pid => { const st = APP.S.get('eprog_' + pid).solve.live.steps[0]; return st.chatRep || null; }, pid);
    await turn('فردا هم نونِ دوم رو می‌پزم.', 'باشه.', [cs({ step: { step: 1, done: 'yes' } })]);
    chk(r1 && r1.done === 'yes' && /ور اومد/.test(r1.msg), 'step: a coach_state.step about the focused live problem reaches A.liveStepReport (validated there) with her own message ' + JSON.stringify(r1));
  });
  // ================= inf7 — «پیامِ کامل» کنارِ #lpRBest =================
  await section('inf7', async () => {
    await wipe(); await fresh(); const st = 'معما: با چند بار وزن کردن سکهٔ سبک را از ۱۲ سکه پیدا کن.';
    await turn(st, 'حالا پیش از گامِ واقعی با گزینهٔ ج: چه پیش‌بینی می‌کنی و چقدر مطمئنی؟');
    await turn('سه‌تا سه‌تا تقسیم کردم و سه بار بس است. درسم: سه‌تایی تقسیم کنم.', 'درست ثبت شد.', [{ do: 'chat_solved', title: 'دوازده سکه', statement: st, kind: 'find', lesson: 'سه‌تایی تقسیم کنم', check: 'شمردم' }]);
    const pid = await p.evaluate(() => __pid('دوازده سکه'));
    const r = await p.evaluate(async pid => { APP.go('lprob', pid); await new Promise(r => setTimeout(r, 300)); const sel = document.querySelector('#main #lpRBest'), btn = document.querySelector('#main .lp-rfullbtn');
      if (!sel || !btn) return { sel: !!sel, btn: !!btn }; sel.value = '0'; sel.dispatchEvent(new Event('change')); btn.click(); await new Promise(r => setTimeout(r, 50));
      const f = document.querySelector('#main .lp-rfull'); return { sel: true, btn: true, shown: f && !f.hidden, txt: f ? f.textContent : '' }; }, pid);
    await p.evaluate(() => APP.go('home'));
    chk(r.btn && r.shown && /گزینهٔ ج/.test(r.txt), 'INF7: «پیامِ کامل» next to #lpRBest shows the full assistant message of the chosen option ' + JSON.stringify(r).slice(0, 300));
  });

  // ================= strict =================
  await section('strict', async () => {
    const bad = strictAll.filter(x => x[1].length);
    chk(!bad.length, 'strict: one turn question per block across every prompt of this test ' + JSON.stringify(bad).slice(0, 900));
  });

  const sum = (k) => info[k] && info[k].res ? { n: info[k].res.length, fail: info[k].res.filter(x => !x[1]).map(x => x[0]) } : null;
  console.log(JSON.stringify({ rm1ev: sum('rm1ev'), rm4g: sum('rm4g'), rm5plan: sum('rm5plan'), rm5def: sum('rm5def'), rm6reg: sum('rm6reg'), rm6res: sum('rm6res') }));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  if (errors.length) process.exitCode = 1;
  await b.close();
})();
