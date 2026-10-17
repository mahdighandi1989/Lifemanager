// تورِ پولیا (دستهٔ ۱، دورِ ۱۷ ِ اصلاح، سهمِ «coach» — ۲۰۲۶-۱۰-۱۷) — DECISIONS_R17: ریشه‌ها، نه نشانه‌ها. هر بخش با «بانکِ گونه‌ها»
// (tests/tour1_variants_r17.js = VARIANTS_R17.json، نوشتهٔ عاملی که کد را ندیده) و جملهٔ خودِ سناریو سنجیده می‌شود.
//  rc1plan     RC1 plan — «برنامهٔ خودش» را مدل گزارش می‌دهد (coach_state.plan {text, when})، صفحه می‌سنجد (نقل در پیامِ کاربر، تاریخِ واقعی) و نگه می‌دارد؛
//              الگو فقط سطرِ شرطیِ «اگر برنامهٔ خودش است…» (پرسش/پیشنهاد، نه ادعا) و هرگز ذخیره نمی‌کند (s01، s32، s34)
//  rc1defer    RC1 defer — درخواستِ عقب‌افتاده از coach_state.defer {what} (سنجیده با پیامِ کاربر) قول می‌شود؛ الگوی «بعداً/ولی اول» دیگر ذخیره نمی‌کند (s32، s14 pr2)
//  rc1taste    RC1 taste — coach_state.taste {text} سلیقه را روی بازنگری می‌گذارد؛ "unknown" هرگز (s31 «هنوز نمی‌دونم…»)
//  rc1reg      RC1 register — ضمیر از coach_state.register (سنجیده با نشانه‌های خودِ پیام)؛ یک «شما» ِ تنها در پیامِ کاربر گفت‌وگو را «شما» نمی‌کند (s27)
//  rc1guess    RC1 guess — coach_state.guess {text} (عدد/فرمول بی «واژه» هم) سنجیده و نگه داشته؛ مسیرِ تکراریِ chat_invent حدس را فقط از گزارشِ مدل می‌گیرد (s25)
//  rc3         RC3 — هر کنش در کلِ پرامپت (SYS + پیام) یک وجه دارد: سطرهایی که نامش را می‌برند «پیشنهاد فقط با آری» و «ثبتش کن» را با هم نمی‌گویند
//  rc4         RC4 — «وارسی شد» از coach_state.check {msgs} (پیام‌های واقعیِ کاربرِ همین مسئله)؛ هم‌پوشانیِ واژه فقط «شاید»، هرگز «وارسی نشد» (s31)
//  rc5         RC5 — پرسش‌های بازنگری (کدام پرسش کمک کرد؟ / سلیقه) وقتی دستیار پرسیده «پرسیده»اند و با گزارشِ مدل «پاسخ‌گرفته»؛ صفحه دوباره نمی‌پرسد (s08، s31)
//  cosm        A·D6 «همان/همان‌ها» با شمار؛ B·D5 مبدلِ «شما» فعلِ امری را از ستاکِ فعل می‌شناسد («بزن» ⇒ «بزنید»)
//  strict      کنترل: یک پرسشِ نوبت در هر بلوک (همان پویشِ r11/r16)
// LLA_FILE = ساختِ دیگر؛ ONLY=rc1plan,rc4 …
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = require('./tour1_variants_r17.js');

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
// ---------- RC3: وجهِ هر کنش در کلِ پرامپت ----------
const OFFER_M = /فقط با «آری»|هرگز خودکار|هرگز بی خواستِ خودش|بی خواستِ خودش نساز|فقط اگر خودش خواست/;
const DO_M = /ثبتش کن(?![آ-ی])|ثبت کن(?![آ-ی])|(?:^|[^آ-ی])بساز(?![آ-ی])/;
function modalityConflicts(text) {
  const L = String(text || '').split('\n'), acts = {};
  L.forEach(l => { (l.match(/do\\?"\s*:\s*\\?"([a-z_]+)/g) || []).forEach(x => { acts[x.match(/([a-z_]+)$/)[1]] = 1; }); });
  const out = [];
  Object.keys(acts).forEach(a => {
    const rx = new RegExp('(?:\\\\?"' + a + '\\\\?"|(?:^|[^a-z_])' + a + '(?![a-z_]))');
    const lines = L.filter(l => rx.test(l)), off = lines.filter(l => OFFER_M.test(l)), dol = lines.filter(l => !OFFER_M.test(l) && DO_M.test(l));
    if (off.length && dol.length) out.push(a + ': OFFER «' + off[0].slice(0, 120) + '» vs DO «' + dol[0].slice(0, 120) + '»');
  });
  return out;
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
  const T0 = '2026-10-17';   // شنبه — تاریخ‌های بانکِ گونه‌ها
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
    // یک نوبت: پاسخِ مدل (reply, actions) در صف و پیامِ کاربر؛ پرامپتِ همان نوبت برمی‌گردد
    window.__turn = async (text, reply, actions) => {
      const n0 = __calls.length; __q.push(R({ reply: reply || 'باشه.', actions: actions || [] }));
      await APP.ASSIST.send(text); __q.length = 0;
      const c = __calls.slice(n0).filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {};
      return { sys: c.sys || '', user: c.user || '' };
    };
    window.__fresh = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__back = (pid) => { const so = ((APP.S.get('eprog_' + pid) || {}).solve) || {}; return JSON.parse(JSON.stringify((so.b && so.b[1]) || null)); };
    window.__pid = (re) => { const x = APP.liveAll().filter(x => new RegExp(re).test(x.p.title)).pop(); return x ? x.p.id : null; };
  }, T0);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const lines = (u) => head(u).split('\n');
  const turnLines = (u) => lines(u).filter(l => /\*\*پرسشِ این نوبت همین است:?\*\*/.test(l));
  const strictAll = [];
  const strict = (name, u) => { strictAll.push([name, strictScan(u)]); };
  const turn = (text, reply, actions) => p.evaluate(([t, r, a]) => __turn(t, r, a), [text, reply || '', actions || []]);
  const fresh = () => p.evaluate(() => __fresh());
  const bank = (rc, kind) => BANK.filter(e => e.rc === rc && (!kind || e.kind === kind));
  const strip = (t) => String(t).replace(/[.!؟?。]+\s*$/, '').trim();
  const dateOf = (e) => ((e.expect || '').match(/\d{4}-\d{2}-\d{2}/) || [])[0];

  // ================= rc1plan =================
  await section('rc1plan', async () => {
    const r = info.rc1plan = { pos: [], neg: [] };
    for (const e of bank('RC1.plan', 'pos')) {
      await fresh(); const when = dateOf(e);
      const u1 = await turn(e.text, 'خوب است.', [{ do: 'coach_state', plan: { text: strip(e.text), when } }]);
      strict('plan+ ' + e.text.slice(0, 20), u1.user);
      const st = await p.evaluate(() => (__cur().plans || []).map(x => ({ text: x.text, when: x.when, done: !!x.done })));
      const u2 = await turn('باشه.');
      const ln = lines(u2.user).filter(l => /deadline/.test(l) && /پیگیری/.test(l));
      const ok = st.length === 1 && st[0].when === when && ln.length === 1 && ln[0].indexOf(when) >= 0 && /^- زمینه \(نه پرسشِ دوم\)/.test(ln[0]);
      r.pos.push([e.text.slice(0, 30), ok]);
      chk(ok, 'rc1plan+ (model-reported plan validated, kept with its date, offered next turn with the deadline action): «' + e.text + '» ' + JSON.stringify(st) + ' ' + JSON.stringify(ln).slice(0, 300));
    }
    // تاریخِ ناواقعی / نقلی که در پیام نیست ⇒ رد
    await fresh();
    await turn('از دوشنبه ناهار رو از خونه می‌برم.', 'باشه.', [{ do: 'coach_state', plan: { text: 'از دوشنبه ناهار رو از خونه می‌برم', when: '2026-02-30' } }, { do: 'coach_state', plan: { text: 'هر روز ورزش می‌کنم', when: '2026-10-20' } }]);
    const bad = await p.evaluate(() => (__cur().plans || []).map(x => x.text + '@' + x.when));
    chk(bad.length === 1 && /ناهار/.test(bad[0]) && /2026-10-19/.test(bad[0]), 'rc1plan validation: an impossible date is replaced by the page-computed one; a quote not in her message is rejected ' + JSON.stringify(bad));
    const negs = bank('RC1.plan', 'neg').map(e => e.text).concat(['هر روز یه ستون اضافه می‌کنم و هیچ تصمیمی نمی‌گیرم.', 'یه متن قانع‌کننده می‌خوام، تا پنجشنبه باید بفرستم.']);
    for (const t of negs) {
      await fresh(); const n0 = await p.evaluate(() => APP.S.all('deadline').length);
      const u1 = await turn(t, 'می‌فهمم.');
      strict('plan- ' + t.slice(0, 20), u1.user);
      const fb = lines(u1.user).filter(l => /پیگیری/.test(l) && /deadline/.test(l));
      const asserted = fb.filter(l => /برنامه یا آزمایشِ خودش را گفت/.test(l) || !/فقط اگر/.test(l));
      const st = await p.evaluate(() => (__cur().plans || []).length);
      const u2 = await turn('باشه.'); const later = lines(u2.user).filter(l => /پیگیری/.test(l) && /deadline/.test(l) && !/فقط اگر/.test(l));
      const n1 = await p.evaluate(() => APP.S.all('deadline').length);
      const ok = !asserted.length && st === 0 && !later.length && n1 === n0;
      r.neg.push([t.slice(0, 30), ok]);
      chk(ok, 'rc1plan- (no model report ⇒ nothing stored; the pattern fallback only asks conditionally): «' + t + '» ' + JSON.stringify({ asserted, st, later }).slice(0, 400));
    }
  });

  // ================= rc1defer =================
  await section('rc1defer', async () => {
    const r = info.rc1defer = { pos: [], neg: [] };
    for (const e of bank('RC1.defer')) {
      await fresh(); const A1 = String(e.context || '').replace(/^assistant:\s*/, '');
      const what = strip(e.text.replace(/^(?:یه سؤال دیگه هم دارم:|راستی|لطفاً|اگه زحمتی نیست|میشه|من فقط)\s*/, ''));
      const acts = e.kind === 'pos' ? [{ do: 'coach_state', defer: { what } }] : [];
      await turn(e.text, A1, acts);
      const u2 = await turn('باشه.');
      strict('defer ' + e.text.slice(0, 20), u2.user);
      const pr = await p.evaluate(() => (__cur().promises || []).filter(x => !x.done).map(x => x.ask));
      const ln = lines(u2.user).filter(l => /promise_done/.test(l));
      const fb = lines(u2.user).filter(l => /عقب انداخت/.test(l) && !/promise_done/.test(l) && !/اگر/.test(l));
      const ok = e.kind === 'pos' ? pr.length === 1 && ln.length === 1 : !pr.length && !ln.length && !fb.length;
      r[e.kind].push([e.text.slice(0, 30), ok]);
      chk(ok, 'rc1defer' + (e.kind === 'pos' ? '+ (model-reported defer validated ⇒ a promise line until promise_done)' : '- (no report ⇒ no promise; a fallback may only ask)') + ': «' + e.text + '» ' + JSON.stringify({ pr, ln, fb }).slice(0, 400));
    }
    // نقلی که در پیام‌های کاربر نیست ⇒ رد
    await fresh(); await turn('یه چک‌لیست می‌خوام.', 'اول سه نقطه‌قوتت را بگو.', [{ do: 'coach_state', defer: { what: 'یک رزومهٔ کامل' } }]);
    chk(!(await p.evaluate(() => (__cur().promises || []).length)), 'rc1defer validation: a defer quote that is not in her messages is rejected');
  });

  // ================= rc1taste =================
  const closeOne = async (title, bestQ, closeReply) => {
    await fresh(); const nC = 10 + (closeOne.n = (closeOne.n || 0) + 1) * 3;
    const st = 'معما: ' + title + ' — با چند بار وزن کردن سکهٔ سبک را از ' + nC + ' سکه پیدا کن.';
    await turn(st, 'خودت تا کجا رفتی؟');
    await turn('سه‌تا سه‌تا تقسیم کردم و دو بار بس است. درسم: سه‌تایی تقسیم کنم.', closeReply || 'درست ثبت شد.', [{ do: 'chat_solved', title, statement: st, kind: 'find', lesson: 'سه‌تایی تقسیم کنم', check: 'با هر ۹ جای ممکن شمردم', ...(bestQ ? { bestQ } : {}) }]);
    return p.evaluate(t => __pid(t), title);
  };
  await section('rc1taste', async () => {
    const r = info.rc1taste = { pos: [], neg: [] };
    for (const e of bank('RC1.taste', 'pos')) {
      const pid = await closeOne('سکه‌ها ' + r.pos.length, 'سه‌تایی تقسیم کن');
      await turn(e.text, 'جدی‌اش بگیر.', [{ do: 'coach_state', taste: { text: strip(e.text) } }]);
      const bb = await p.evaluate(pid => __back(pid), pid);
      const ok = !!bb && bb.taste === strip(e.text);
      r.pos.push([e.text.slice(0, 30), ok]);
      chk(ok, 'rc1taste+ (model-reported taste validated and stored on the look-back): «' + e.text + '» ' + JSON.stringify(bb && bb.taste));
    }
    const negs = bank('RC1.taste', 'neg').concat([{ text: 'هنوز نمی‌دونم کدوم نوع رو بیشتر دوست دارم.', expect: 'taste="unknown"' }]);
    for (const e of negs) {
      const pid = await closeOne('سکه‌ها منفی ' + r.neg.length, 'سه‌تایی تقسیم کن');
      const unk = /unknown|no preference/.test(e.expect);
      const u1 = await turn(e.text, 'باشه.', unk ? [{ do: 'coach_state', taste: 'unknown' }] : []);
      strict('taste- ' + e.text.slice(0, 20), u1.user);
      const fb = lines(u1.user).filter(l => /از سلیقه‌اش گفت/.test(l) && !/اگر/.test(l));
      // مدلِ ساده‌لوح: همان «نمی‌دانم» را به‌جای سلیقه می‌فرستد
      if (unk) await turn('خب.', 'باشه.', [{ do: 'chat_lookback', pid, taste: 'unknown' }]);
      const bb = await p.evaluate(pid => __back(pid), pid);
      const u2 = await turn('بریم سراغ بعدی.');
      const again = turnLines(u2.user).filter(l => /«سلیقه»/.test(l));
      const ok = !!bb && !bb.taste && !fb.length && (!unk || !again.length);
      r.neg.push([e.text.slice(0, 30), ok]);
      chk(ok, 'rc1taste- (unknown/no taste ⇒ nothing stored; "unknown" is not re-asked as the turn question; the fallback line is conditional): «' + e.text + '» ' + JSON.stringify({ taste: bb && bb.taste, fb, again }).slice(0, 400));
    }
  });

  // ================= rc1reg =================
  await section('rc1reg', async () => {
    const r = info.rc1reg = { pos: [], neg: [] };
    const regLine = (u) => lines(u).filter(l => /ضمیرِ گفت‌وگو \(شما\/تو\) را عوض نکن/.test(l)).join(' ');
    for (const e of bank('RC1.register', 'pos')) {
      await fresh(); const v = /register=شما/.test(e.expect) ? 'شما' : 'تو';
      const u1 = await turn(e.text, 'باشه.', [{ do: 'coach_state', register: v }]);
      const fbSh = /با «شما» است/.test(regLine(u1.user));   // پیش از گزارش: پشتیبانِ الگو نباید از یک واژه «شما» کند
      const reg = await p.evaluate(() => (__cur().coach || {}).reg || '');
      const u2 = await turn('خب.');
      const want = v === 'شما' ? 'shoma' : 'to';
      const ok = reg === want && (v === 'شما' ? /با «شما» است/.test(regLine(u2.user)) : /با «تو» است/.test(regLine(u2.user))) && !fbSh;
      r.pos.push([e.text.slice(0, 30), ok]);
      chk(ok, 'rc1reg+ (model-reported register validated by her own signs; no switch from the pattern before it): «' + e.text + '» ' + JSON.stringify({ reg, fbSh, line: regLine(u2.user).slice(0, 160) }));
    }
    const negs = bank('RC1.register', 'neg').concat([{ text: 'شما خودت که ماشینی، بگو می‌فهمی یا نه؟', expect: 'fallback (s27)' }]);
    for (const e of negs) {
      await fresh();
      const naive = /substring|quot|meta|preposition|no address|nothing to infer/.test(e.expect);
      const u1 = await turn(e.text, 'باشه.', naive ? [{ do: 'coach_state', register: /شما|«شما»/.test(e.text) ? 'شما' : 'تو' }] : []);
      const reg = await p.evaluate(() => (__cur().coach || {}).reg || '');
      const ok = !/با «شما» است/.test(regLine(u1.user)) && (!naive || !reg);
      r.neg.push([e.text.slice(0, 30), ok]);
      chk(ok, 'rc1reg- (no switch to «شما» from a pattern; a naive report on a substring/quote/preposition is rejected): «' + e.text + '» ' + JSON.stringify({ reg, line: regLine(u1.user).slice(0, 160) }));
    }
  });

  // ================= rc1guess =================
  await section('rc1guess', async () => {
    const r = info.rc1guess = { pos: [], neg: [] };
    const Q = ['n(n+1)/2', '۱/۴ − ۱/(2(n+1)(n+2))', '36', 'حدود ۸۰۰ هزار تومن', 'x=2 و y=-1', '2^n − 1', 'مجموع زاویه‌های خارجی همیشه ۳۶۰ درجه است', 'a_n = 3a_{n-1} + 2', 'اجاره‌ی بلندمدت به‌صرفه‌تره'];
    const pos = bank('RC1.guess', 'pos');
    for (let i = 0; i < pos.length; i++) {
      const e = pos[i]; await fresh();
      await turn(e.text, 'چطور می‌آزمایی‌اش؟', [{ do: 'coach_state', guess: { text: Q[i] } }]);
      const g = await p.evaluate(() => ((__cur().coach || {}).guess || {}).text || '');
      const ok = g === Q[i];
      r.pos.push([e.text.slice(0, 30), ok]);
      chk(ok, 'rc1guess+ (model-reported guess — number/formula included — validated against her message and kept): «' + e.text + '» → ' + JSON.stringify(g));
    }
    for (const e of bank('RC1.guess', 'neg')) {
      await fresh(); await turn(e.text, 'باشه.');
      const g = await p.evaluate(() => ((__cur().coach || {}).guess || {}).text || '');
      r.neg.push([e.text.slice(0, 30), !g]); chk(!g, 'rc1guess- (no report ⇒ no guess): «' + e.text + '» ' + g);
    }
    await fresh(); await turn('حدسم اینه که میشه ۱/۴', 'چطور؟', [{ do: 'coach_state', guess: { text: '۱/۳' } }]);
    chk(!(await p.evaluate(() => ((__cur().coach || {}).guess || {}).text || '')), 'rc1guess validation: a guess that is not in her message is rejected');
    // s25 (C·V2): مسئلهٔ تکراری + حدسِ فرمولی ⇒ حدسِ همان مسئله؛ بی گزارشِ مدل، الگو ذخیره نمی‌کند
    r.stage = 'dup';
    const ST = 'مجموعِ ۱/(k(k+1)(k+2)) از k=1 تا n را پیدا کن.';
    await fresh(); await turn('مسئلهٔ تازه: ' + ST, 'نگهش داشتم.', [{ do: 'chat_invent', statement: ST, title: 'مجموعِ تلسکوپیِ سه‌تایی', kind: 'find' }]);
    const P = await p.evaluate(() => __pid('مجموعِ تلسکوپیِ سه‌تایی'));
    await fresh();
    await turn('برگشتم سرِ ' + ST + ' حدسم اینه که میشه ۱/۴ − ۱/(2(n+1)(n+2))', 'حدست را می‌آزمایی؟', [{ do: 'chat_invent', statement: ST, kind: 'find' }, { do: 'coach_state', guess: { text: '۱/۴ − ۱/(2(n+1)(n+2))' } }]);
    const g1 = await p.evaluate(P => { const so = (APP.S.get('eprog_' + P) || {}).solve || {}; return (so.g && so.g[1] && so.g[1].guess) || ''; }, P);
    chk(/۱\/۴|1\/4/.test(g1) && /\(n\+1\)\(n\+2\)/.test(g1), 's25 (C·V2): the formula guess reported by the model becomes the duplicate problem\'s guess (round 17: solve.g = {}) ' + JSON.stringify(g1));
    const ST2 = 'کوچک‌ترین عددِ مربعِ کامل بخش‌پذیر بر ۶ و ۱۰ را پیدا کن.';
    await fresh(); await turn('مسئلهٔ تازه: ' + ST2, 'باشه.', [{ do: 'chat_invent', statement: ST2, title: 'مربعِ بخش‌پذیر', kind: 'find' }]);
    const P2 = await p.evaluate(() => __pid('مربعِ بخش‌پذیر'));
    await fresh(); await turn('دوباره ' + ST2 + ' فکر کنم جوابش ۹۰۰ باشه.', 'چطور؟', [{ do: 'chat_invent', statement: ST2, kind: 'find' }]);
    const g2 = await p.evaluate(P => { const so = (APP.S.get('eprog_' + P) || {}).solve || {}; return (so.g && so.g[1] && so.g[1].guess) || ''; }, P2);
    chk(!g2, 'rc1guess fallback: without the model\'s guess report the duplicate path does not store a pattern-read guess ' + g2);
  });

  // ================= rc3 =================
  await section('rc3', async () => {
    const r = info.rc3 = { bad: [] };
    const msgs = ['هر روز یه ستون اضافه می‌کنم و هیچ تصمیمی نمی‌گیرم. بین اجارهٔ بلندمدت و خرید آپارتمان گیر کردم، نمی‌دونم کدوم رو انتخاب کنم.',
      '۸ ماهه می‌خوام نشون بدم یه شبکه‌ی خاص نوسان گاما تولید می‌کنه یا نه. دیگه فکرم کار نمی‌کنه.', 'سلام',
      'از این هفته هر سه‌شنبه سرِ کلاس با پرسشِ کلی شروع می‌کنم و امتحان می‌کنم.', 'یه مسئله دارم، می‌خوام حلش کنم: گوجه را در بالکن بکارم یا گلدان؟',
      'یه متن قانع‌کننده می‌خوام، تا پنجشنبه باید بفرستم.'];
    for (const m of msgs) { await fresh(); const u = await turn(m); const c = modalityConflicts(u.sys + '\n' + u.user); if (c.length) r.bad.push([m.slice(0, 30), c]); }
    chk(!r.bad.length, 'rc3: every action keeps ONE modality across the whole prompt (no «only on yes» next to «ثبتش کن» for the same action) ' + JSON.stringify(r.bad).slice(0, 900));
  });

  // ================= rc4 =================
  await section('rc4', async () => {
    const r = info.rc4 = { pos: [], neg: [] };
    const ST = (i) => 'مسئلهٔ وارسی ' + i + ': معادله یا حکمِ داده‌شده را حل کن و جوابت را بیازما.';
    const run = async (i, us, chatSolved, cs, pre) => {
      await fresh(); await turn(ST(i), 'خودت شروع کن.');
      for (const x of (pre || [])) await turn(x[0], x[1] || 'خب.');
      for (let k = 0; k < us.length - 1; k++) await turn(us[k], 'خب.');
      const acts = [Object.assign({ do: 'chat_solved', title: 'وارسیِ ' + i, statement: ST(i), kind: 'find', lesson: 'درسِ خودم: اول بیازمایم' }, chatSolved || {})];
      if (cs) acts.push({ do: 'coach_state', check: cs });
      await turn(us[us.length - 1], 'ثبت شد.', acts);
      const pid = await p.evaluate(t => __pid(t), 'وارسیِ ' + i);
      return p.evaluate(pid => ({ v: APP.liveClosure(pid).verdict, b: __back(pid) }), pid);
    };
    const split = (t) => t.split(' ‖ ').map(x => x.replace(/^(?:\(later\)\s*)?U\d?(?:\s*\([^)]*\))?:\s*/, '').trim());
    let i = 0;
    for (const e of bank('RC4', 'pos')) {
      const us = split(e.text);
      const o = await run(++i, us, { check: 'خلاصهٔ دستیار: جایگذاری کرد و تساوی برقرار بود' }, { msgs: us.map(u => u.slice(0, 40)) });
      r.pos.push([e.text.slice(0, 30), o.v]); chk(o.v === 'verified', 'rc4+ (coach_state.check.msgs = her own messages ⇒ verified): «' + e.text.slice(0, 80) + '» ' + JSON.stringify(o.v));
    }
    const neg = bank('RC4', 'neg'); const res = [];
    res.push(await run(++i, split(neg[0].text), {}, { msgs: [] }));                                                      // ادعا، بی وارسی
    res.push(await run(++i, ['باشه.'], { check: 'جایگذاری کرد' }, { msgs: ['۲·۳+۱=۷'] }, [['بیا جایگذاری کنیم', 'بیا جایگذاری کنیم: ۲·۳+۱=۷']]));   // پیامِ دستیار
    res.push(await run(++i, ['درسته به نظرم.'], { check: 'وارسی کرد' }, { msgs: [99] }));                                // شناسهٔ ناموجود
    res.push(await run(++i, ['می‌خوام وارسی کنم ولی بلد نیستم چطوری.'], {}, null));                                       // فقط قصد
    res.push(await run(++i, ['x=3 رو تو معادله گذاشتم؛ نشد! ۸ درومد نه ۷.'], {}, null));                                  // وارسی‌ای که رد کرد
    // پیامی از مسئلهٔ دیگر
    await fresh(); await turn('مسئلهٔ الف: ۱۲ تقسیم بر ۳ چند است؟', 'خودت.'); await turn('جواب رو با ماشین‌حساب چک کردم، درسته.', 'خب.');
    const STB = 'مسئلهٔ ب: محیطِ مربعی به ضلعِ ۷ چند است؟';
    await turn(STB, 'خودت.');
    await turn('جوابش ۲۸ شد.', 'ثبت شد.', [{ do: 'chat_solved', title: 'وارسیِ ب', statement: STB, kind: 'find', lesson: 'ضلع ضربدر چهار', check: 'با ماشین‌حساب چک کرد', solution: '۲۸' }, { do: 'coach_state', check: { msgs: ['جواب رو با ماشین‌حساب چک کردم'] } }]);
    res.push(await p.evaluate(() => { const pid = __pid('وارسیِ ب'); return { v: APP.liveClosure(pid).verdict }; }));
    res.push(await run(++i, ['جواب ۶ رو جایگذاری کردم، جور بود.', 'نه، جوابم عوض شد، ۸ است.'], { check: 'جایگذاری کرد', solution: '۸' }, { msgs: ['جواب ۶ رو جایگذاری کردم، جور بود'] }));
    const maybe1 = await run(++i, ['معادله رو یه بار دیگه از اول حل کردم و همون جواب اومد.'], { check: 'معادله رو یه بار دیگه از اول حل کرد و همون جواب اومد' }, null);
    const maybe2 = await run(++i, ['n=4 رو امتحان کردم.', 'شرط هم برقرار بود.', 'پس حله.'], { check: 'برای n=4 آزمود و شرط برقرار بود' }, null);
    r.neg = res.map(x => x.v).concat([maybe1.v, maybe2.v]);
    chk(res.every(x => x.v !== 'verified'), 'rc4- (no check / assistant message / missing id / intention / refuting / other problem / abandoned answer ⇒ never «verified») ' + JSON.stringify(r.neg));
    chk(maybe1.v === 'maybe' && maybe2.v === 'maybe', 'rc4 fallback: without coach_state.check the overlap gives only "maybe" — never verified and never «وارسی نشد» ' + JSON.stringify([maybe1.v, maybe2.v]));
    // s31 (D·4): وارسی در سه پیام + گزارشِ مدل ⇒ وارسی شد
    const s31 = await run(++i, ['n=5 رو گذاشتم، شرط برقرار نیست پس این ادعا رد شد.', 'مثبت بودنِ جمله‌ها رو هم چک کردم، همه‌شون مثبتن.', 'یه نگاه کلی هم: چون هر جمله از قبلی کوچیک‌تره، حد وجود داره.'],
      { check: 'n=5 را رد کرد، مثبت بودن را سنجید و یک نگاه کلی داد' }, { msgs: ['n=5 رو گذاشتم', 'مثبت بودنِ جمله‌ها رو هم چک کردم', 'چون هر جمله از قبلی کوچیک‌تره'] });
    chk(s31.v === 'verified', 's31 (D·4): her check in three messages, reported by the model, is «وارسی شد» (round 17: «وارسی نشد») ' + s31.v);
  });

  // ================= rc5 =================
  await section('rc5', async () => {
    const r = info.rc5 = {};
    const bestTurn = (u) => turnLines(u).some(l => /«کدام پرسش کمک کرد؟»/.test(l));
    const tasteTurn = (u) => turnLines(u).some(l => /«سلیقه»/.test(l));
    const miss = (pid) => p.evaluate(pid => APP.chatLookMissing(pid), pid);
    const res = [];
    const T = (name, ok, x) => { res.push([name, ok]); chk(ok, 'rc5 ' + name + ' ' + JSON.stringify(x || '').slice(0, 300)); };
    let pid, u, u2;
    // pos1 — پرسیده (بازگفت) و پاسخ‌گرفته
    pid = await closeOne('ساعت شنی ۱', '', 'درست ثبت شد. از سؤال‌هایی که پرسیدم کدوم بیشتر کمکت کرد؟');
    u = await turn('همون که گفتی حالت خاص رو امتحان کن.', 'ثبت شد.', [{ do: 'chat_lookback', pid, bestQ: 'همون که گفتی حالت خاص رو امتحان کن' }]);
    u2 = await turn('بعدی؟');
    T('pos1 asked+answered, never re-asked', !bestTurn(u.user) && !bestTurn(u2.user) && !(await miss(pid)).includes('best'), [turnLines(u.user), turnLines(u2.user)]);
    // pos2 — سلیقه پرسیده، «هنوز نمی‌دونم»
    pid = await closeOne('ساعت شنی ۲', 'حالت خاص', 'ثبت شد. بیشتر چه جور مسئله‌ای دوست داری؟');
    u = await turn('هنوز نمی‌دونم.', 'باشه.', [{ do: 'coach_state', taste: 'unknown' }]);
    u2 = await turn('خب بعدی.');
    T('pos2 taste unknown not re-asked', !tasteTurn(u.user) && !tasteTurn(u2.user) && (await miss(pid)).includes('taste'), [turnLines(u.user), turnLines(u2.user)]);
    // pos3 — دو بار پرسید و او اعتنا نکرد
    pid = await closeOne('ساعت شنی ۳', 'حالت خاص', 'ثبت شد. از کدوم نوع مسئله‌ها خوشت میاد؟'); await turn('بریم جلو.', 'راستی، کدوم مدل مسئله بیشتر به دلت می‌شینه؟');
    u = await turn('یه مسئله‌ی دیگه بده.');
    T('pos3 asked twice ⇒ no third push', !tasteTurn(u.user), turnLines(u.user));
    // pos4 — خودش گفت کدام پرسش کمک کرد (پرسیده‌نشده)
    pid = await closeOne('ساعت شنی ۴');
    u = await turn('سؤالِ «مجهول چیه» بیشتر از همه کمکم کرد، راستی.', 'ثبت شد.', [{ do: 'chat_lookback', pid, bestQ: 'مجهول چیه' }]);
    u2 = await turn('بعدی؟');
    T('pos4 answered in this turn ⇒ no bestQ ask in this or the next turn', !bestTurn(u.user) && !bestTurn(u2.user) && lines(u.user).some(l => /chat_lookback/.test(l) && /bestQ/.test(l)), [turnLines(u.user), turnLines(u2.user)]);
    // pos5 — بازگفت و تغییرِ موضوع
    pid = await closeOne('ساعت شنی ۵', '', 'ثبت شد. کدوم پرسشم راهگشا بود؟'); u = await turn('راستی فردا امتحان دارم.');
    T('pos5 paraphrased ask counts', !bestTurn(u.user), turnLines(u.user));
    // pos6 — سلیقه‌ای که خودش گفت
    pid = await closeOne('ساعت شنی ۶', 'حالت خاص');
    await turn('راستی من بیشتر از هندسه خوشم میاد.', 'جدی‌اش بگیر.', [{ do: 'coach_state', taste: { text: 'من بیشتر از هندسه خوشم میاد' } }]);
    u = await turn('بعدی؟');
    T('pos6 reported taste ⇒ never asked', !tasteTurn(u.user) && !(await miss(pid)).includes('taste'), turnLines(u.user));
    // pos7 — رسمی
    pid = await closeOne('ساعت شنی ۷', '', 'ثبت شد. لطفاً بفرمایید کدام پرسش بیشتر یاری‌تان کرد؟');
    u = await turn('پرسش دربارهٔ حالتِ خاص.', 'سپاس.', [{ do: 'chat_lookback', pid, bestQ: 'پرسش دربارهٔ حالتِ خاص' }]);
    u2 = await turn('ادامه بدهیم.');
    T('pos7 formal ask+answer', !bestTurn(u.user) && !bestTurn(u2.user), [turnLines(u.user), turnLines(u2.user)]);
    // pos8 — پاسخ در سشنِ بعد
    pid = await closeOne('ساعت شنی ۸', '', 'ثبت شد. کدوم سؤال بیشتر به کارت اومد؟');
    await p.evaluate(() => { window.__day = '2026-10-18'; }); await fresh();
    await turn('راستی جواب سؤال دیروزت: همون که گفتی از آخر شروع کن.', 'ثبت شد.', [{ do: 'chat_lookback', pid, bestQ: 'از آخر شروع کن' }]);
    u = await turn('بعدی؟'); await p.evaluate(() => { window.__day = '2026-10-17'; });
    T('pos8 answered next session', !(await miss(pid)).includes('best') && !bestTurn(u.user), turnLines(u.user));
    // neg1 — پرسشِ دیگری که «کدوم پرسش» دارد
    pid = await closeOne('ساعت شنی ۹', '', 'ثبت شد. کدوم پرسش رو اول جواب بدی: مجهول یا داده‌ها؟'); u = await turn('مجهول.');
    T('neg1 not a look-back ask ⇒ bestQ still asked', bestTurn(u.user), turnLines(u.user));
    // neg2 — «دوست داری بریم…» پرسشِ سلیقه نیست
    pid = await closeOne('ساعت شنی ۱۰', 'حالت خاص', 'ثبت شد. دوست داری بریم سراغ مسئله‌ی بعدی؟'); u = await turn('آره.');
    T('neg2 not a taste ask ⇒ taste still asked', tasteTurn(u.user), turnLines(u.user));
    // neg3 — پرسیده، پاسخ نگرفته
    pid = await closeOne('ساعت شنی ۱۱', '', 'ثبت شد. کدوم پرسش بیشتر کمکت کرد؟'); u = await turn('سؤالت چی بود؟ یادم رفت.');
    T('neg3 asked, not answered', !bestTurn(u.user) && (await miss(pid)).includes('best'), turnLines(u.user));
    // neg4 — دفترِ هر مسئله جداست
    const p1 = await closeOne('ساعت شنی ۱۲', '', 'ثبت شد. کدوم پرسش کمکت کرد؟'); await turn('حالت خاص.', 'ثبت شد.', [{ do: 'chat_lookback', pid: p1, bestQ: 'حالت خاص' }]);
    const st2 = 'معما: ساعت شنی ۱۲ب — با دو ظرفِ ۳ و ۵ لیتری دقیقاً ۴ لیتر آب بردار.';
    await turn(st2, 'کدام حالتِ کوچک‌تر را اول امتحان می‌کنی؟');
    await turn('۵ رو پر کردم و تو ۳ ریختم و ... ۴ شد.', 'ثبت شد.', [{ do: 'chat_solved', title: 'ظرف‌های ۳ و ۵', statement: st2, kind: 'find', lesson: 'از ته شروع کنم', check: 'شمردم' }]);
    u = await turn('بعدی؟');
    T('neg4 P2 best is its own (asked now)', bestTurn(u.user) && turnLines(u.user).some(l => /ظرف‌های ۳ و ۵/.test(l)), turnLines(u.user));
    // neg5 — بازگفتِ دیروز، نه پرسش
    pid = await closeOne('ساعت شنی ۱۳', '', 'ثبت شد. دیروز پرسیده بودم کدوم پرسش کمک کرد و گفتی حالت خاص؛ امروز بریم سراغ تمرین بعدی.'); u = await turn('خب، تمرینِ بعدی چیه؟');
    T('neg5 a recap is not an ask', bestTurn(u.user) && (await miss(pid)).includes('best'), turnLines(u.user));
    // neg6 — تشکر، نه پاسخ
    pid = await closeOne('ساعت شنی ۱۴', '', 'ثبت شد. کدوم پرسش بیشتر کمکت کرد؟'); u = await turn('خیلی کمکم کردی، مرسی!');
    T('neg6 thanks ≠ answer (asked, not answered)', !bestTurn(u.user) && (await miss(pid)).includes('best'), turnLines(u.user));
    // neg7 — پاسخِ سلیقه به پرسشِ best
    pid = await closeOne('ساعت شنی ۱۵', '', 'ثبت شد. کدوم پرسش بیشتر کمکت کرد؟');
    await turn('من کلاً جبر رو دوست دارم.', 'باشه.', [{ do: 'coach_state', taste: { text: 'من کلاً جبر رو دوست دارم' } }]);
    const m7 = await miss(pid);
    T('neg7 taste answered, best not', m7.includes('best') && !m7.includes('taste'), m7);
    // neg8 — پرسشِ فهرستِ پولیا
    pid = await closeOne('ساعت شنی ۱۶', '', 'ثبت شد. کدام پرسش از فهرست پولیا را می‌خواهی امتحان کنی؟'); u = await turn('نمی‌دونم.');
    T('neg8 Pólya-list question is not a look-back ask', bestTurn(u.user) || (await miss(pid)).includes('best'), turnLines(u.user));
    // neg9 — پرسشِ خودِ کاربر
    pid = await closeOne('ساعت شنی ۱۷');
    u = await turn('کدوم سؤال بیشتر توی امتحان میاد؟');
    T('neg9 the user\'s own question is neither ask nor answer', (await miss(pid)).includes('best'), turnLines(u.user));
    r.res = res;
  });

  // ================= cosm =================
  await section('cosm', async () => {
    const r = info.cosm = {};
    const pid = await closeOne('سکهٔ یک‌پرسشی', 'سه‌تایی تقسیم کن');
    await p.evaluate(pid => APP.go('lprob', pid), pid); await p.waitForTimeout(200);
    r.card = await p.evaluate(() => (document.querySelector('#main .lp-lbrest') || {}).textContent || '');
    chk(/یک پرسشِ باقی‌مانده/.test(r.card) && /همان که/.test(r.card) && !/همان‌ها/.test(r.card), 'A·D6: with one question left the card says «همان که…», not «همان‌ها» ' + r.card.slice(0, 200));
    await p.evaluate(() => APP.go('home'));
    r.conv = await p.evaluate(() => { const f = APP.ASSIST.toShoma; return {
      a: f('حدس بزن، ولی حدستان را بیازمایید'), b: f('بنویس و بزنش، نزن'), c: f('بگو، ببین، بده، بیازما، بخوان'), d: f('باران و بخش و برنامه و بهتر و بود و بزرگ'), e: f('بگیر و بساز و بکش و برس') }; });
    chk(r.conv.a === 'حدس بزنید، ولی حدستان را بیازمایید', 'B·D5: «بزن» ⇒ «بزنید» ' + r.conv.a);
    chk(r.conv.b === 'بنویسید و بزنیدش، نزنید', 'B·D5: imperative from the verb stem (with clitic and negative) ' + r.conv.b);
    chk(r.conv.c === 'بگویید، ببینید، بدهید، بیازمایید، بخوانید', 'B·D5: vowel-final stems ' + r.conv.c);
    chk(r.conv.d === 'باران و بخش و برنامه و بهتر و بود و بزرگ', 'B·D5 control: nouns/adjectives/past forms beginning with ب stay as they are ' + r.conv.d);
    chk(r.conv.e === 'بگیرید و بسازید و بکشید و برسید', 'B·D5: more stems ' + r.conv.e);
  });

  // ================= strict =================
  await section('strict', async () => {
    const bad = strictAll.filter(x => x[1].length);
    chk(!bad.length, 'strict: one turn question per block across every prompt of this test ' + JSON.stringify(bad).slice(0, 900));
  });

  console.log(JSON.stringify({ rc1plan: info.rc1plan && { pos: info.rc1plan.pos.filter(x => !x[1]).length, neg: info.rc1plan.neg.filter(x => !x[1]).length },
    rc1defer: info.rc1defer && { pos: info.rc1defer.pos.filter(x => !x[1]).length, neg: info.rc1defer.neg.filter(x => !x[1]).length },
    rc1taste: info.rc1taste && { pos: info.rc1taste.pos.filter(x => !x[1]).length, neg: info.rc1taste.neg.filter(x => !x[1]).length },
    rc1reg: info.rc1reg && { pos: info.rc1reg.pos.filter(x => !x[1]).length, neg: info.rc1reg.neg.filter(x => !x[1]).length },
    rc1guess: info.rc1guess && { pos: info.rc1guess.pos.filter(x => !x[1]).length, neg: info.rc1guess.neg.filter(x => !x[1]).length },
    rc4: info.rc4 && { pos: info.rc4.pos, neg: info.rc4.neg }, rc5: info.rc5 && info.rc5.res && info.rc5.res.filter(x => !x[1]).map(x => x[0]) }, null, 0).slice(0, 3000));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  if (errors.length) process.exitCode = 1;
  await b.close();
})();
