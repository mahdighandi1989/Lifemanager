// تورِ پولیا (دستهٔ ۱، دورِ ۲۲، سهمِ «prereq» — ۲۰۲۶-۱۰-۱۸) — DECISIONS_R22: P1 (لایهٔ پیش‌نیاز) و P2 («🧭 نقشهٔ مسیرِ مسئله»).
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۲ (A22-24/25/26، B·D6/D7، C22-P1..P4، D dp1–dp3) — pA1 «از اتحادها فقط (a+b)^2 … یادمه»، bp3 «اون قضیه رو بلد نیستم»،
//           pC3 «اسم فیثاغورس رو شنیدم ولی بلد نیستم»، dp3 «(۱۴−x)² … اینو هیچ‌وقت درست یاد نگرفتم»، dp2 «تبدیلِ واحد … من اون جلسه نبودم»
//  bank     همهٔ ورودی‌های P1/P2 در بانکِ مستقلِ tests/variants/VARIANTS_R22.json (رفتارِ محضِ مدل با دلیل در info.nc)
// LLA_FILE = ساختِ دیگر؛ ONLY=diag,reject,nested,sib,mind,route,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = JSON.parse(fs.readFileSync(process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R22.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R22.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)), 'utf8'));

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
  const T0 = '2026-10-18';
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0;
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
    window.__turn = async (text, reply, actions, extra) => {
      const n0 = __calls.length; __q.push(R({ reply: reply || 'باشه.', actions: actions || [] })); (extra || []).forEach(x => __q.push(x));
      await APP.ASSIST.send(text); __q.length = 0;
      const all = __calls.slice(n0), c = all.filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {};
      return { sys: c.sys || '', user: c.user || '', task: c.task || '', n: all.length, all: all.map(x => x.user) };
    };
    window.__fresh = (view) => { APP.go(view || 'home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
    window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {};
      ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L); APP.S.put(pg); };
    window.__pre = (sc) => (APP.PRE.all(sc || APP.PRE.scope(__cur())) || []).map(e => ({ id: e.id, c: e.concept, st: e.state, step: e.step, parent: e.parent, depth: e.depth, quote: e.quote, tries: e.tries || 0, selfMade: !!e.selfMade, role: e.role || '' }));
    window.__rec = (pid) => { const r = APP.S.all('prereq').filter(x => pid ? x.pid === pid : true)[0]; return r ? { id: r.id, pid: r.pid, sess: r.sess, items: (r.items || []).map(x => ({ c: x.concept, st: x.state, self: x.self, topic: x.topic ? (APP.S.get(x.topic) || {}).title || '' : '', step: x.step, learned: x.learned || '', how: x.how || '', uses: (x.uses || []).length, role: x.role || '', practised: (x.practised || []).length })) } : null; };
    window.__ph = (pid) => { const Q = APP.MIND.phases(pid ? { pid } : undefined); const r = {}; Q.rows.forEach(X => { r[X.id] = X.k + '/' + X.n; }); return { r, weakest: Q.weakest ? Q.weakest.id : '', causes: { prereq: Q.causes.prereq.map(x => x.concept), knot: Q.causes.knot.length, skill: Q.causes.skill.length, unk: Q.causes.unk.length }, learned: Q.prereq.learned.map(x => x.concept), open: Q.prereq.open.map(x => x.concept), text: APP.MIND.phasesText(Q) }; };
  }, T0);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const blockOf = (u, re) => head(u).split(/\n(?=# )/).filter(bl => re.test(bl.split('\n')[0]))[0] || '';
  const nTQ = (u) => (head(u).match(/\*\*پرسشِ این نوبت همین است:?\*\*|^- در این نوبت فقط \*\*یک\*\* پرسش|پیشنهادِ این نوبت: «/gm) || []).length;
  const turn = (text, reply, actions, extra) => p.evaluate(([t, r, a, x]) => __turn(t, r, a, x), [text, reply || '', actions || [], extra || []]);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const pre = (sc) => p.evaluate((sc) => __pre(sc), sc || null);
  const rec = (pid) => p.evaluate((pid) => __rec(pid), pid || null);
  const ph = (pid) => p.evaluate((pid) => __ph(pid), pid || null);
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const bind = async (title, stmt, steps) => p.evaluate(([t, stmt, steps]) => { const pid = __live(t, stmt); APP.liveBindSession(pid, __cur()); __liveSet(pid, (so, L) => { (steps || []).forEach((x, i) => L.steps.push(Object.assign({ id: 's' + (i + 1), at: new Date().toISOString(), text: typeof x === 'string' ? x : x.text, pred: 'شاید', due: '2026-10-19' }, typeof x === 'object' ? x : {}))); }); return pid; }, [title, stmt || '', steps || []]);
  const sysMsgs = () => p.evaluate(() => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text));
  const E = {}; BANK.forEach((e, i) => { E[i] = e; });
  const T = (i, ok, x) => { info.bank[i] = !!ok; chk(ok, 'bank#' + i + ' [' + E[i].rc + '/' + E[i].kind + '] «' + E[i].text.slice(0, 70) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 700)); };
  const NC = (i, why) => { info.nc[i] = why; };

  const PA1 = 'ثابت کنید برای هر عددِ اولِ p بزرگ‌تر از ۳، عددِ p^2 − 1 بر ۲۴ بخش‌پذیره.';
  const P4 = 'p^2 − 1 یعنی یه عدد ضربدر خودش منهای یک. مثلاً ۲۵ − ۱ = ۲۴ و ۴۹ − ۱ = ۴۸. ولی نمی‌دونم چطوری اینو یه جور دیگه بنویسم که بخش‌پذیریش معلوم بشه. هیچی به ذهنم نمی‌رسه.';
  const P5 = 'لم؟ نمی‌دونم… از اتحادها فقط (a+b)^2 = a^2 + 2ab + b^2 یادمه. ولی اینجا منهاست و توان دو فقط روی p ـه، یک که توان نداره. نمی‌دونم ربطش چیه.';
  const PRE1 = { concept: 'تجزیهٔ تفاضلِ دو مربع (اتحادِ مزدوج)', step: 'نوشتنِ p^2 − 1 به شکلِ حاصل‌ضرب', quote: 'از اتحادها فقط (a+b)^2 = a^2 + 2ab + b^2 یادمه', q: 'x^2 − 1 را می‌توانی به‌صورتِ ضربِ دو پرانتز بنویسی؟', topic: 'اتحادهای جبری' };

  // ================= runners — pA1: یک پیش‌نیاز، تشخیص ⇐ آموزش ⇐ تسلط ⇐ برگشت؛ کارنامه و 🧩 =================
  let pidA1 = '';
  await section('diag', async () => {
    await wipe(); await fresh();
    pidA1 = await bind('p²−1 بر ۲۴', PA1);
    await turn(P4, 'به حکم نگاه کن: قضیه‌ای می‌شناسی؟', [cs({ ph: 'p', stuck: true })]);
    let x = await ph(pidA1);
    chk(/^0\/1$/.test(x.r.plan) || x.causes.unk >= 1, 'pA1 p4: a stuck without a reported prerequisite is booked (cause «نامعلوم», not «مهارت» without evidence) :: ' + JSON.stringify(x));
    await turn(P5, 'x^2 − 1 را می‌توانی به‌صورتِ ضربِ دو پرانتز بنویسی؟', [cs({ ph: 'p', stuck: true, prereq: PRE1 })]);
    let st = await pre({ pid: pidA1 });
    chk(st.length === 1 && st[0].st === 'diag' && st[0].c === PRE1.concept && st[0].step === PRE1.step, 'A22-24: validated prerequisite sits on the stack in «diag» :: ' + JSON.stringify(st));
    let r1 = await rec(pidA1);
    chk(r1 && r1.pid === pidA1 && r1.items.length === 1 && r1.items[0].st === 'diag', 'A22-24: the item is written into THIS problem\'s «🧩 نقشهٔ پیش‌نیازها» with its pid (no island) :: ' + JSON.stringify(r1));
    x = await ph(pidA1);
    chk(x.causes.prereq.length === 2 && !/\/[1-9]/.test(x.r.plan) && x.weakest !== 'plan', 'A22-24 / C22-P2: both stucks (p4, p5) get cause «پیش‌نیاز»; «طرح‌ریزی» is not lowered and never «ضعیف‌ترین» :: ' + JSON.stringify(x));
    chk(/پیش‌نیاز بود/.test(x.text), 'phasesText tells the assistant the stucks were prerequisite-caused :: ' + x.text.slice(-200));
    const lc = await p.evaluate((pid) => { const c = APP.liveCoach(pid, { turn: { text: 'نمی‌دونم' } }); return { q: c.q, src: c.src }; }, pidA1);
    chk(lc.src === 'prereq-diag' && lc.q === PRE1.q, 'A22-21/A22-24: the page\'s turn question is the diagnostic, not the stuck ladder (لم ⇐ کمکی ⇐ لم) :: ' + JSON.stringify(lc));
    // p11 — «این رو بلد نیستم، یعنی چی؟» ⇒ diag missing
    let u = await turn('تو گره‌گشا نوشته «تجزیهٔ تفاضلِ دو مربع (اتحادِ مزدوج)». این رو بلد نیستم، یعنی چی؟ از پلهٔ قبلش فهمیدم از سه عددِ p−1، p، p+1 یکی بر ۳ بخش‌پذیره.',
      'اتحادِ مزدوج: (a−b)(a+b) = a² − b². مثلاً (x−1)(x+1) را باز کن؛ چه می‌شود؟', [cs({ ph: 'p', prereq_res: { id: st[0].id, diag: 'missing', quote: 'این رو بلد نیستم، یعنی چی؟' } })]);
    const bl = blockOf(u.user, /^# پیش‌نیاز \(/);
    chk(/\*\*پرسشِ این نوبت همین است:\*\* پرسشِ تشخیصیِ «تجزیهٔ تفاضلِ دو مربع/.test(bl) && /پشتهٔ جاهای منتظر/.test(bl) && /گامِ «نوشتنِ p\^2 − 1 به شکلِ حاصل‌ضرب»/.test(bl), 'A22-24: the prompt holds the prerequisite block (stack + diagnostic turn question) :: ' + bl.slice(0, 600));
    chk(nTQ(u.user) === 1, 'A22-22: exactly ONE unmarked turn-question directive in the whole prompt while the stack is open (others demoted to context) :: ' + nTQ(u.user) + ' ' + (head(u.user).match(/[^\n]*(?:\*\*پرسشِ این نوبت همین است|^- در این نوبت فقط \*\*یک\*\* پرسش|پیشنهادِ این نوبت)[^\n]*/gm) || []).join(' ‖ ').slice(0, 600));
    chk(/«نامِ قضیه را لو نده» فقط برای پیش‌نیازِ تشخیص‌داده‌شده برقرار نیست/.test(bl) && /نامش را صریح بگو/.test(bl), 'B·D6: the no-spoiler rule is lifted for the diagnosed prerequisite (name the exact concept) :: ' + bl.slice(0, 300));
    st = await pre({ pid: pidA1 }); r1 = await rec(pidA1);
    chk(st[0].st === 'teach' && r1.items[0].self === 'بلد نیستم' && /اتحادِ مزدوج|تفاضلِ دو مربع/.test(r1.items[0].topic) && /اتحادهای جبری/.test(r1.items[0].topic), 'missing ⇒ teach; 🧩 self «بلد نیستم» from her own words; ONE learning topic for the larger subject :: ' + JSON.stringify([st, r1]));
    // p12 — still answering; mastery not yet (no report) ⇒ prompt directive is teach + mastery
    u = await turn('خب ۱ هم مربعِ ۱ ـه، ۱ × ۱. پس p^2 − 1 یعنی مربعِ p منهای مربعِ ۱. ولی بعدش چی؟', 'درسته. (x−1)(x+1) را جمله‌به‌جمله ضرب کن؛ چه درمیاد؟', [cs({ ph: 'p' })]);
    chk(/«تجزیهٔ تفاضلِ دو مربع \(اتحادِ مزدوج\)» را یاد دادی و پرسشِ تسلط پرسیدی/.test(blockOf(u.user, /^# پیش‌نیاز \(/)) && /پرسشِ تسلطِ تازه/.test(blockOf(u.user, /^# پیش‌نیاز \(/)), 'teach state directive (mastery re-check) :: ' + blockOf(u.user, /^# پیش‌نیاز \(/).slice(-500));
    // p13 — mastery yes; reply does NOT return ⇒ one rewrite asking to return to the exact waiting step
    u = await turn('x × x = x^2، بعد x × 1 = x، بعد −1 × x = −x، بعد −1 × 1 = −1. x و −x همدیگه رو خنثی می‌کنن. پس (x − 1)(x + 1) = x^2 − 1!',
      'آفرین! حالا بیا کل مسئله را بازنگری کنیم.', [cs({ ph: 'p', prereq_res: { id: st[0].id, mastery: 'yes', quote: '(x − 1)(x + 1) = x^2 − 1' } })]);
    const rw = u.all.filter(a => /وارسیِ صفحه پیش از نشان دادنِ پاسخ/.test(a))[0] || '';
    chk(/به جای منتظر برگرد/.test(rw) && /برگردیم به مسئلهٔ اصلی «p²−1 بر ۲۴»، گامِ «نوشتنِ p\^2 − 1 به شکلِ حاصل‌ضرب»/.test(rw), 'A22-25: mastery passed but the reply jumped to look-back ⇒ one rewrite: return EXACTLY to the waiting step, place restated :: ' + rw.slice(-500));
    st = await pre({ pid: pidA1 }); r1 = await rec(pidA1);
    chk(st[0].st === 'learned' && r1.items[0].st === 'learned' && !!r1.items[0].learned, 'mastery ⇒ learned (with date) in the stack and in 🧩 :: ' + JSON.stringify([st, r1]));
    const sy = await sysMsgs(); chk(sy.some(t => /آموخته شد \(پیشرفت، نه ضعف\) — برگشت به مسئلهٔ اصلی/.test(t)), 'page line: learned = progress, back to the main problem :: ' + JSON.stringify(sy.slice(-2)));
    x = await ph(pidA1);
    chk(x.learned.includes(PRE1.concept) && !/\/[1-9]/.test(x.r.plan), 'mind card books the learned prerequisite as progress; no stage lowered :: ' + JSON.stringify(x));
    // next turn: the page turn question is the waiting step (one turn), not «گامِ بعدیِ تو چیست»
    u = await turn('باشه، پس p^2 − 1 = (p − 1)(p + 1).', 'خوب.', [cs({ ph: 'p' })]);
    const bb = blockOf(u.user, /^# پیش‌نیاز \(/);
    chk(/برگشت از پیش‌نیاز/.test(bb) && /گامِ نوشتنِ p\^2 − 1 به شکلِ حاصل‌ضرب را چطور برمی‌داری/.test(bb) && nTQ(u.user) === 1, 'the turn after the return: ONE turn question about the waiting step :: ' + bb.slice(-400) + ' nTQ=' + nTQ(u.user));
    u = await turn('p فرده، پس p − 1 و p + 1 دو عددِ زوجِ پشت‌سرهم‌اند.', 'خوب.', [cs({ ph: 'c' })]);
    chk(!/برگشت از پیش‌نیاز/.test(blockOf(u.user, /^# پیش‌نیاز \(/)), 'the return turn question is used once only');
    // dossier ⇒ events, no raw codes
    const dz = await p.evaluate((pid) => APP.dossier(pid).events.filter(e => /^pre/.test(e.k)).map(e => e.k + ':' + e.title + ':' + (e.out || '')), pidA1);
    chk(dz.length === 3 && dz.some(t => /^pre:🧩 پیش‌نیاز تشخیص داده شد/.test(t)) && dz.some(t => /^prediag:.*نبود/.test(t)) && dz.some(t => /^preok:.*برگشت به مسئلهٔ اصلی/.test(t)), 'the dossier (A.EVLOG) holds diagnosis, diagnostic answer and learned+return :: ' + JSON.stringify(dz));
  });

  // ================= rejections (page validates the model's claim) =================
  await section('reject', async () => {
    await wipe(); await fresh();
    const pid = await bind('مساحتِ باغچه', 'باغچه‌ای مثلثی با قاعدهٔ ۸ و ارتفاعِ ۶ را نصف کنید.', [{ text: 'محاسبهٔ مساحتِ کل', closed: true, out: { done: 'yes', at: new Date().toISOString() } }]);
    let u = await turn('من جبرم ضعیفه', 'کجای همین گام؟', [cs({ stuck: true, prereq: { concept: 'جبر', step: 'گامِ ۲', quote: 'من جبرم ضعیفه' } })]);
    let st = await pre({ pid }); chk(st.length === 0, 'B·D6 «جبر بلد نیستی» never: a field name is rejected :: ' + JSON.stringify(st));
    u = await turn('نمی‌دونم چی کار کنم', 'باشه.', [cs({ stuck: true, prereq: { concept: 'قضیهٔ فیثاغورس', step: 'گامِ ۲', quote: 'قضیه رو یادم نیست' } })]);
    st = await pre({ pid }); chk(st.length === 0, 'invented quote rejected :: ' + JSON.stringify(st));
    const nb = blockOf(u.user, /^# پیش‌نیاز \(/); chk(/نامِ یک رشته است/.test(nb), 'the rejection reason reaches the model next turn :: ' + nb.slice(0, 400));
    u = await turn('جذر رو بلد نیستم', 'باشه.', [cs({ prereq: { concept: 'جذر', step: 's1', quote: 'جذر رو بلد نیستم' } })]);
    st = await pre({ pid }); chk(st.length === 0, 'closed step s1 ⇒ rejected :: ' + JSON.stringify(st));
    u = await turn('فیثاغورس رو بلد نیستم', 'باشه.', [cs({ prereq: { concept: 'قضیهٔ فیثاغورس', step: 'گامِ ۲' } })]);
    st = await pre({ pid }); chk(st.length === 0, 'no quote ⇒ rejected :: ' + JSON.stringify(st));
    const r0 = await rec(pid); chk(!r0, 'no 🧩 record from rejected claims :: ' + JSON.stringify(r0));
  });

  // ================= nested (pA3/dp3): main ⇐ مساحت ⇐ فیثاغورس ⇐ (۱۴−x)² — stack, pop one level, restate =================
  let sidN = '';
  await section('nested', async () => {
    await wipe(); sidN = await fresh();
    let u = await turn('سلام. پسرم یه سؤال آورده که خودمم بلد نیستم و خیلی وقته درس نخوندم: «مساحتِ مثلثی که ضلع‌هاش ۱۳ و ۱۴ و ۱۵ سانتی‌متره رو پیدا کنید.» فقط سه تا ضلع داریم؛ مساحت رو از کجا بیارم؟',
      'بیایید اول ببینیم چه می‌دانیم.', [cs({ ph: 'u', said: ['u'], nat: 'objective', role: 'self' })]);
    const sc0 = await p.evaluate(() => { const s = __cur(), sc = APP.PRE.scope(s); return sc ? { pid: sc.pid || '', sess: sc.sess || '', pk: sc.pk || '' } : null; });
    chk(sc0 && sc0.sess === sidN, 'dp3: a chat problem in focus is a prerequisite scope (no live problem needed) :: ' + JSON.stringify(sc0));
    await turn('مستطیل رو بلدم، طول ضربدر عرض. مربع هم همین‌طور. مثلث رو یادم نیست؛ یه چیزی با نصف بود ولی نمی‌دونم نصفِ چی.', 'مستطیلی را از قطر ببرید؛ چه می‌شود؟',
      [cs({ ph: 'p', stuck: true, prereq: { concept: 'مساحتِ مثلث = ½ × قاعده × ارتفاع', step: 'مساحتِ مثلثِ ۱۳-۱۴-۱۵', quote: 'مثلث رو یادم نیست؛ یه چیزی با نصف بود', q: 'اگر مستطیلی را از قطر ببرید چه می‌شود؟' } })]);
    let st = await pre();
    await turn('دو تا مثلثِ مساوی میشه، پس هر کدوم نصفِ مستطیله.', 'درست.', [cs({ ph: 'p', prereq_res: { id: st[0].id, diag: 'missing', quote: 'دو تا مثلثِ مساوی میشه' } })]);
    // while learning the area she needs Pythagoras (nested under it)
    await turn('یه خطِ صاف از رأس که روی ضلعِ ۱۴ عمود باشه! پس مساحت میشه نصفِ ۱۴ ضربدر طولِ اون خط؟ ولی طولِ اون خط رو ندارم. تو مثلثِ گوشه‌قائمه یادم نیست از دو ضلع چطوری ضلعِ سوم رو پیدا می‌کنن.', 'مثلثِ ۳ و ۴ را بکشید…',
      [cs({ ph: 'p', stuck: true, prereq: { concept: 'قضیهٔ فیثاغورس', step: 'طولِ ارتفاع روی ضلعِ ۱۴', quote: 'تو مثلثِ گوشه‌قائمه یادم نیست از دو ضلع چطوری ضلعِ سوم رو پیدا می‌کنن', parent: st[0].id } })]);
    st = await pre();
    chk(st.length === 2 && st[1].parent === st[0].id && st[1].depth === 1 && st[1].st === 'diag', 'A22-25: nested prerequisite under the open one (depth 1) :: ' + JSON.stringify(st));
    await turn('نه، اینو هیچ‌وقت یاد نگرفتم.', 'مربع روی هر ضلع…', [cs({ prereq_res: { id: st[1].id, diag: 'missing', quote: 'اینو هیچ‌وقت یاد نگرفتم' } })]);
    // third level: (14−x)² inside Pythagoras — implicit parent = top
    u = await turn('(۱۱)² میشه ۱۲۱، ولی ۱۹۶ − ۹ میشه ۱۸۷. پس غلطه! اینو هیچ‌وقت درست یاد نگرفتم. چطوری بازش کنم؟', '(a−b)² را جمله‌به‌جمله…',
      [cs({ stuck: true, prereq: { concept: 'بسطِ مربعِ دوجمله‌ای (a−b)²', step: 'h² = ۱۵² − (۱۴−x)²', quote: 'اینو هیچ‌وقت درست یاد نگرفتم. چطوری بازش کنم؟' } })]);
    st = await pre();
    chk(st.length === 3 && st[2].parent === st[1].id && st[2].depth === 2, 'dp3: third level nests under the open top (Pythagoras) :: ' + JSON.stringify(st));
    await turn('نمی‌دونم.', 'باشه، (۱۴−x)(۱۴−x)…', [cs({ prereq_res: { id: st[2].id, diag: 'missing', quote: 'نمی‌دونم' } })]);
    u = await turn('۸۱ تقسیم بر ۲… نمی‌دونم', 'دوباره، از راهِ دیگر…', [cs({ prereq_res: { id: st[2].id, mastery: 'no', quote: 'نمی‌دونم' } })]);
    st = await pre();
    chk(st[2].st === 'teach' && st[2].tries === 1, 'failed re-check ⇒ the stack does NOT pop; same level, tries+1 :: ' + JSON.stringify(st));
    u = await turn('۱۴×۱۴ = ۱۹۶، ۱۴×(−x) = −۱۴x دو بار، و (−x)×(−x) = x². پس ۱۹۶ − ۲۸x + x². با x=۳: ۱۹۶ − ۸۴ + ۹ = ۱۲۱ ✓.', 'آفرین؛ برگردیم به پیش‌نیازِ «قضیهٔ فیثاغورس»…', [cs({ prereq_res: { id: st[2].id, mastery: 'yes', quote: 'پس ۱۹۶ − ۲۸x + x²' } })]);
    st = await pre();
    chk(st[2].st === 'learned' && st[1].st === 'teach' && st[0].st === 'teach', 'pop exactly ONE level :: ' + JSON.stringify(st));
    u = await turn('باشه، حالا h² = ۱۶۹ − x² رو با این برابر می‌ذارم.', 'خوب.', [cs({})]);
    let bl = blockOf(u.user, /^# پیش‌نیاز \(/);
    chk(/۰\) مسئلهٔ اصلی «[^»]+» — منتظر در گامِ «مساحتِ مثلثِ ۱۳-۱۴-۱۵»/.test(bl) && /۱\) «مساحتِ مثلث = ½ × قاعده × ارتفاع»/.test(bl) && /۲\) «قضیهٔ فیثاغورس»/.test(bl) && !/۳\)/.test(bl), 'the stack (from bottom) is restated each turn with the waiting places :: ' + bl.slice(0, 700));
    chk(/yes ⇒ دقیقاً به جای منتظر برگرد و آن را بازگو کن: «برگردیم به پیش‌نیازِ «مساحتِ مثلث = ½ × قاعده × ارتفاع»/.test(bl.replace(/«برگردیم به پیش‌نیازِ /, '«برگردیم به پیش‌نیازِ «').replace(/««/g, '«')) || /برگردیم به پیش‌نیازِ مساحتِ مثلث = ½ × قاعده × ارتفاع/.test(bl), 'Pythagoras learned ⇒ return to its parent (area), not to the main step :: ' + bl.slice(-500));
    await turn('۱۵² − ۹² = ۲۲۵ − ۸۱ = ۱۴۴ پس ارتفاع ۱۲. پس فیثاغورس یعنی مربعِ وتر برابرِ جمعِ مربعِ دو ضلعِ دیگه‌ست.', 'برگردیم به پیش‌نیازِ مساحتِ مثلث: ارتفاع ۱۲ است…', [cs({ prereq_res: { id: st[1].id, mastery: 'yes', quote: 'مربعِ وتر برابرِ جمعِ مربعِ دو ضلعِ دیگه‌ست' } })]);
    u = await turn('مساحت = نصفِ ۱۴ ضربدر ۱۲ = ۸۴.', 'برگردیم به مسئلهٔ اصلی…', [cs({ prereq_res: { id: st[0].id, mastery: 'yes', quote: 'مساحت = نصفِ ۱۴ ضربدر ۱۲' } })]);
    st = await pre();
    chk(st.every(e => e.st === 'learned'), 'all three learned in order (innermost first) :: ' + JSON.stringify(st));
    const r = await p.evaluate((sid) => { const x = APP.S.all('prereq').filter(r => r.sess === sid)[0]; return x ? x.items.map(i => i.c || i.concept) : null; }, sidN);
    chk(r && r.length === 3, 'each level is its own 🧩 item in the same problem record :: ' + JSON.stringify(r));
    const x = await ph(); chk(x.learned.length === 3 && x.causes.prereq.length >= 3, 'mind card: three learned prerequisites (progress), stucks with cause «پیش‌نیاز» :: ' + JSON.stringify(x));
    // route map for a chat-only problem: three nested dotted detours rejoining their parents, the outer one the main line
    const M = await p.evaluate((sid) => { const M = APP.ROUTE.model(sid); return { dets: M.dets.map(d => ({ k: d.kind, depth: d.depth, rj: d.rejoin != null, par: d.parent, c: d.concept })), rejoins: M.pts.filter(q => q.k === 'rejoin').map(q => q.cls + ':' + q.title) }; }, sidN);
    chk(M.dets.filter(d => d.k === 'pre').length === 3 && M.dets.every(d => d.rj) && M.dets.find(d => d.depth === 2).par >= 0 && M.rejoins.filter(t => /^main:برگشت به جای منتظر/.test(t)).length === 1 && M.rejoins.filter(t => /^det:برگشت به پیش‌نیازِ/.test(t)).length === 2, 'P2: nested detours rejoin their parent; the outer one rejoins the main line at the waiting step :: ' + JSON.stringify(M));
  });

  // ================= siblings: two prerequisites of ONE step (bank #14) =================
  await section('sib', async () => {
    await wipe(); await fresh();
    const pid = await bind('زمانِ ترمز', 'ماشینی با سرعتِ متوسطِ ۷۲ کیلومتر بر ساعت ترمز می‌گیرد…', [{ text: 'زمانِ ترمز با سرعت به متر بر ثانیه' }]);
    await turn('سرعت متوسط یعنی چی؟ میانگین دو تا سرعته؟ تازه کیلومتر بر ساعت رو هم نمی‌دونم به متر بر ثانیه چطور ببرم', 'سرعتِ متوسط یعنی…؟',
      [cs({ stuck: true, prereq: [{ concept: 'سرعتِ متوسط = مسافتِ کل ÷ زمانِ کل', step: 'گامِ ۱', quote: 'سرعت متوسط یعنی چی؟', q: 'اگر ۱۰ کیلومتر را در نیم ساعت بروی، سرعتِ متوسط چند است؟' }, { concept: 'تبدیلِ km/h به m/s', step: 'گامِ ۱', quote: 'کیلومتر بر ساعت رو هم نمی‌دونم به متر بر ثانیه چطور ببرم', q: 'یک کیلومتر چند متر و یک ساعت چند ثانیه است؟' }] })]);
    let st = await pre({ pid });
    chk(st.length === 2 && st[1].c === 'سرعتِ متوسط = مسافتِ کل ÷ زمانِ کل' && st[1].st === 'diag' && st[0].st === 'wait' && !st[0].parent && !st[1].parent, 'two siblings: the first reported (most blocking) is on top in «diag», the second waits :: ' + JSON.stringify(st));
    await turn('۱۰ تقسیم بر نیم، ۲۰ کیلومتر بر ساعت؟', 'آفرین.', [cs({ prereq_res: { id: st[1].id, diag: 'missing', quote: '۱۰ تقسیم بر نیم' } })]);
    let u = await turn('آهان پس مسافتِ کل تقسیم بر زمانِ کل.', 'خوب.', []);
    const bl = blockOf(u.user, /^# پیش‌نیاز \(/);
    chk(/yes ⇒ دقیقاً به جای منتظر برگرد و آن را بازگو کن: «[^\n]*همین گامِ «گامِ ۱» «تبدیلِ km\/h به m\/s» را هم لازم دارد — پرسشِ تشخیصی‌اش: «یک کیلومتر چند متر/.test(bl.replace(/«/g, '«')) || /همین گامِ گامِ ۱ تبدیلِ km\/h به m\/s را هم لازم دارد/.test(bl), 'after the first sibling the return goes to the NEXT prerequisite of the same step, not back to the step :: ' + bl.slice(-500));
    await turn('۳۰ کیلومتر در ۱ ساعت و نیم میشه ۲۰ کیلومتر بر ساعت.', 'درسته. یک کیلومتر چند متر و یک ساعت چند ثانیه است؟', [cs({ prereq_res: { id: st[1].id, mastery: 'yes', quote: 'میشه ۲۰ کیلومتر بر ساعت' } })]);
    st = await pre({ pid });
    chk(st[1].st === 'learned' && st[0].st === 'diag', 'the waiting sibling becomes the diagnostic now :: ' + JSON.stringify(st));
    const r = await rec(pid); chk(r.items.length === 2 && r.pid === pid, 'both siblings in the same problem\'s 🧩 with the same pid :: ' + JSON.stringify(r));
    // re-diagnosis of the same concept in the same problem ⇒ same item (bank #38)
    await turn('۱۰۰۰ متر و ۳۶۰۰ ثانیه.', 'پس ۳۶ km/h چند m/s؟', [cs({ prereq_res: { id: st[0].id, diag: 'had', quote: '۱۰۰۰ متر و ۳۶۰۰ ثانیه' } })]);
    st = await pre({ pid }); chk(st[0].st === 'had', 'had ⇒ popped; cause re-marked (skill, tested) :: ' + JSON.stringify(st));
    await turn('باز تبدیلِ کیلومتر بر ساعت به متر بر ثانیه یادم رفت', 'باشه.', [cs({ stuck: true, prereq: { concept: 'تبدیلِ km/h به m/s', step: 'گامِ ۱', quote: 'تبدیلِ کیلومتر بر ساعت به متر بر ثانیه یادم رفت' } })]);
    const r2 = await rec(pid); chk(r2.items.length === 2, 'same concept diagnosed twice in one problem ⇒ one 🧩 item, updated :: ' + JSON.stringify(r2));
  });

  // ================= mind card, teacher role, ability talk, cause reports, known prerequisite =================
  await section('mind', async () => {
    await wipe(); await fresh();
    const pid = await bind('فیثاغورسِ نردبان', 'نردبانی به طول ۵ متر …', [{ text: 'ارتفاعِ دیوار' }]);
    await turn('ولی اون قضیه رو بلد نیستم. میشه فقط بگی اسمش چیه و چی میگه؟', 'اسمش قضیهٔ فیثاغورس است…', [cs({ stuck: true, ph: 'p', prereq: { concept: 'قضیهٔ فیثاغورس', step: 'گامِ ۱', quote: 'اون قضیه رو بلد نیستم', q: 'روی ضلع‌های ۳ و ۴ مربع بکش؛ هر کدام چند خانه است؟' } })]);
    let st = await pre({ pid });
    let u = await turn('من کلاً خنگم، ریاضیم ضعیفه', 'باشه.', [cs({ stuck: true })]);
    const sy = await sysMsgs();
    chk(sy.some(t => /این کم‌هوشی نیست: گیر از نبودنِ «قضیهٔ فیثاغورس» در گامِ «گامِ ۱» بود/.test(t)), '«خنگم / ریاضیم ضعیفه» ⇒ the page answers with the named gap, not reassurance :: ' + JSON.stringify(sy.slice(-2)));
    chk(/دلداریِ کلی نده/.test(blockOf(u.user, /^# پیش‌نیاز \(/)) && /نبودِ «قضیهٔ فیثاغورس»/.test(blockOf(u.user, /^# پیش‌نیاز \(/)), 'the prompt tells the model the same :: ' + blockOf(u.user, /^# پیش‌نیاز \(/).slice(0, 300));
    let x = await ph(pid);
    chk(!/\/[1-9]/.test(x.r.plan) && x.weakest !== 'plan', 'ability talk books no weakness :: ' + JSON.stringify(x));
    // cause reports: knot / skill (bank #24, #31)
    await turn('فیثاغورس رو بلدم، a²+b²=c²، ولی نمی‌فهمم این‌جا کدوم مثلث قائمه‌ست', 'کجا زاویهٔ قائمه داری؟', [cs({ stuck: true, ph: 'p', cause: { kind: 'knot', quote: 'نمی‌فهمم این‌جا کدوم مثلث قائمه‌ست' } })]);
    await turn('۱۲×۱۵ … ۱۷۰ … نه ۱۸۰، باز اشتباه جمع زدم', 'دوباره جمع کن.', [cs({ fail: true, ph: 'e', cause: { kind: 'skill', quote: 'باز اشتباه جمع زدم' } })]);
    x = await ph(pid); chk(x.causes.knot >= 1 && x.causes.skill >= 1, 'cause «گره» and «مهارت» with her quote :: ' + JSON.stringify(x));
    const ui = await p.evaluate(() => { APP.go('mind'); const el = document.querySelector('.mind-causes'); return el ? el.textContent : ''; });
    chk(/علتِ هر گیر: پیش‌نیاز/.test(ui) && /نبودِ «قضیهٔ فیثاغورس»/.test(ui), 'mind card shows the cause list :: ' + ui.slice(0, 300));
    // teacher role (bank #11, D dp3): her own learning is booked
    await wipe(); await fresh();
    const pid2 = await bind('مساحتِ مثلث برای داداش', 'می‌خوام به داداشم یاد بدم چرا مساحت مثلث نصف مستطیله.');
    await turn('داداشم ۹ سالشه، امروز من بهش یاد دادم چرا مساحت مثلث نصف مستطیله، خودمم تازه فهمیدم', 'عالی.', [cs({ role: 'teacher', learned: { concept: 'مساحتِ مثلث = نصفِ مستطیلِ دورش', quote: 'خودمم تازه فهمیدم' } })]);
    const r = await rec(pid2); x = await ph(pid2);
    chk(r && r.items[0].st === 'learned' && r.items[0].role === 'teacher' && x.learned.includes('مساحتِ مثلث = نصفِ مستطیلِ دورش'), 'teacher role: HER learning is booked (progress) :: ' + JSON.stringify([r, x.learned]));
    // known prerequisite in a new problem (bank #35): no re-teaching, a «کاربست» link
    await fresh(); const pid3 = await bind('مساحتِ زمینِ مثلثی', 'زمینی مثلثی…', [{ text: 'مساحت' }]);
    u = await turn('اینجا هم باید مساحتِ مثلث رو بزنم دیگه؟ مساحت مثلث یادم نیست', 'بله.', [cs({ prereq: { concept: 'مساحتِ مثلث = نصفِ مستطیلِ دورش', step: 'گامِ ۱', quote: 'مساحت مثلث یادم نیست' } })]);
    const st3 = await pre({ pid: pid3 }), rr = await p.evaluate(() => APP.S.all('prereq').map(r => ({ pid: r.pid, n: r.items.length, uses: r.items.map(i => (i.uses || []).length) })));
    chk(st3.length === 0 && rr.some(q => q.uses.some(n => n >= 1)), 'already-mastered prerequisite reappears ⇒ no new stack entry, a «کاربست» on the mastered item :: ' + JSON.stringify([st3, rr]));
    u = await turn('باشه.', 'خوب.', []);
    chk(/پیش‌تر آموخته/.test(blockOf(u.user, /^# پیش‌نیاز \(/)) && /دوباره درس نده/.test(blockOf(u.user, /^# پیش‌نیاز \(/)), 'the model is told not to re-teach :: ' + blockOf(u.user, /^# پیش‌نیاز \(/).slice(0, 400));
  });

  // ================= P2 — route map UI: line, dotted detours, back-jumps, hover, strip, buttons, themes, phone =================
  let pidR = '';
  await section('route', async () => {
    await wipe(); await fresh();
    pidR = await bind('حداکثرِ مساحتِ حصار', 'با ۴۰ متر حصار، مستطیلی با بیشترین مساحت بسازید.', []);
    await p.evaluate((pid) => { __liveSet(pid, (so, L) => { so.u = { 1: { u: 'حداکثرِ مساحت', done: true, at: new Date(Date.now() - 600000).toISOString() } }; L.plan = { t: 'اول محیط را بنویسم، سپس مساحت را بر حسبِ یک ضلع، سپس بیشینه را پیدا کنم', at: new Date(Date.now() - 500000).toISOString() };
      L.steps.push({ id: 's1', at: new Date(Date.now() - 400000).toISOString(), text: 'محیط: ۲x + ۲y = ۴۰', closed: true, out: { done: 'yes', at: new Date(Date.now() - 390000).toISOString(), what: 'y = ۲۰ − x' } }); }); }, pidR);
    let x = await p.evaluate((pid) => { const M = APP.ROUTE.model(pid); return { dest: M.dest, origin: M.origin, remain: M.remain, n: M.pts.length, now: M.now, kinds: M.pts.map(q => q.k) }; }, pidR);
    chk(x.dest === 'حداکثرِ مساحت' && /با ۴۰ متر حصار/.test(x.origin) && /۲ گام از ۳ گامِ طرحت/.test(x.remain), 'P2: origin = statement, destination = the unknown, «چقدر مانده» from her plan :: ' + JSON.stringify(x));
    // prerequisite detour (learned) + a tested guess + an aux problem + a correction back-jump
    await turn('مساحت x(۲۰−x) میشه، ولی نمی‌دونم بیشینهٔ یه عبارتِ درجه دو رو چطوری پیدا می‌کنن', 'رأسِ سهمی…؟', [cs({ stuck: true, ph: 'e', prereq: { concept: 'رأسِ سهمی (بیشینهٔ عبارتِ درجه دو)', step: 'بیشینهٔ x(۲۰−x)', quote: 'نمی‌دونم بیشینهٔ یه عبارتِ درجه دو رو چطوری پیدا می‌کنن' } })]);
    let st = await pre({ pid: pidR });
    await turn('نه بلد نیستم', 'x(۲۰−x) را برای x=۹،۱۰،۱۱ حساب کن.', [cs({ prereq_res: { id: st[0].id, diag: 'missing', quote: 'نه بلد نیستم' } })]);
    // geography strip while the problem is open, in another view
    let g = await p.evaluate(() => { APP.go('mind'); const el = document.querySelector('#main .rt-geo'); return el ? el.textContent : ''; });
    chk(/🧭 «حداکثرِ مساحتِ حصار» — مبدأ: صورت · اکنون: پیش‌نیازِ «رأسِ سهمی/.test(g) && /مقصد: حداکثرِ مساحت/.test(g) && /مانده:/.test(g), 'P2: geography strip in another view (origin → now → destination, how much remains) :: ' + g);
    const back = await p.evaluate(() => { const b = document.querySelector('#main .rt-geo-back'); if (!b) return ''; b.click(); return APP.state.view + ':' + APP.state.arg; });
    chk(back === 'lprob:' + pidR, 'tapping the strip returns to the problem :: ' + back);
    await turn('۹۹، ۱۰۰، ۹۹ — پس وسط بیشینه است، x=۱۰.', 'آفرین.', [cs({ prereq_res: { id: st[0].id, mastery: 'yes', quote: 'پس وسط بیشینه است' } })]);
    await p.evaluate((pid) => { __liveSet(pid, (so, L) => {
      L.aux.push({ t: 'حالتِ محیطِ ۴ متر', at: new Date(Date.now() + 1000).toISOString(), crossed: true });
      L.steps.push({ id: 's2', at: new Date(Date.now() + 2000).toISOString(), text: 'x = ۱۰ ⇒ مساحت ۱۰۰', closed: true, out: { done: 'yes', at: new Date(Date.now() + 3000).toISOString() } });
      so.g = { 1: { guess: 'فکر کنم ۱۲ باشه', at: new Date(Date.now() + 2500).toISOString(), hit: 'نادرست بود' } };
      L.retracts = [{ at: new Date(Date.now() + 4000).toISOString(), frag: '۴۰', fix: '۴۴', mid: 'm1', by: 'user', changed: [{ label: 'صورت', old: '۴۰', new: '۴۴', pid }] }];
    }); }, pidR);
    x = await p.evaluate((pid) => { const M = APP.ROUTE.model(pid); return { dets: M.dets.map(d => d.kind + ':' + (d.rejoin != null) + ':' + d.depth), backs: M.backs.map(b => M.pts[b.from].k + '→' + (M.pts[b.to] ? M.pts[b.to].k : 'origin') + ':' + b.why), rj: M.pts.filter(q => q.k === 'rejoin').map(q => q.title) }; }, pidR);
    chk(x.dets.includes('pre:true:0') && x.dets.some(d => /^aux:true/.test(d)) && x.dets.some(d => /^guess:true/.test(d)), 'P2: prerequisite, auxiliary problem and tested guess are dotted detours that rejoin the line :: ' + JSON.stringify(x));
    chk(x.rj.some(t => /برگشت به جای منتظر: «بیشینهٔ x\(۲۰−x\)»/.test(t)), 'the prerequisite rejoins exactly at the waiting step :: ' + JSON.stringify(x.rj));
    chk(x.backs.length === 1 && /«۴۰» اصلاح شد/.test(x.backs[0]) && /^retract→/.test(x.backs[0]), 'P2: a correction is a back-jump to the corrected point :: ' + JSON.stringify(x.backs));
    // render the view
    const ls0 = await p.evaluate(() => Object.keys(localStorage).sort().join(','));
    const nRec0 = await p.evaluate(() => Object.keys(APP.S.recs).length);
    await p.evaluate((pid) => APP.go('route', pid), pidR); await p.waitForTimeout(150);
    const v = await p.evaluate(() => ({ svg: !!document.querySelector('.rt-svg'), det: document.querySelectorAll('.rt-det').length, detPre: document.querySelectorAll('.rt-det[data-kind="pre"][data-rejoin="1"]').length, back: document.querySelectorAll('.rt-backjump').length, now: document.querySelectorAll('.rt-pt.rt-now').length, sum: (document.querySelector('.rt-summary') || {}).textContent || '', dashed: getComputedStyle(document.querySelector('.rt-det')).strokeDasharray }));
    chk(v.svg && v.det >= 3 && v.detPre === 1 && v.back === 1 && v.now === 1 && /اکنون:/.test(v.sum) && /مانده:/.test(v.sum) && v.dashed && v.dashed !== 'none', 'P2: the view draws the line, ≥3 dotted detours, one back-jump, one now-marker :: ' + JSON.stringify(v));
    await p.hover('.rt-pt.rt-p-pre >> nth=0'); await p.waitForTimeout(80);
    let tip = await p.evaluate(() => { const t = document.querySelector('.rt-tip'); return t && !t.hidden ? t.textContent : ''; });
    chk(/پیش‌نیاز تشخیص داده شد/.test(tip) && /انحراف \(پیش‌نیاز/.test(tip) && /گامِ منتظر/.test(tip) && !/pq\d|pre22_|lstep:/.test(tip), 'P2: hovering a point shows what it was and what was done there (Persian, no raw ids) :: ' + tip);
    await p.hover('.rt-pt.rt-p-back >> nth=0'); await p.waitForTimeout(80);
    tip = await p.evaluate(() => { const t = document.querySelector('.rt-tip'); return t && !t.hidden ? t.textContent : ''; });
    chk(/اصلاح \/ پرشِ برگشت/.test(tip) && /«۴۰» ⇐ «۴۴»/.test(tip), 'hover on a correction keeps the old value as history :: ' + tip);
    // no second store
    const ls1 = await p.evaluate(() => Object.keys(localStorage).sort().join(','));
    const nRec1 = await p.evaluate(() => Object.keys(APP.S.recs).length);
    chk(ls0 === ls1 && nRec0 === nRec1, 'P2: opening the route map creates no store, record or localStorage key :: ' + JSON.stringify([ls0, ls1, nRec0, nRec1]));
    // phone width + dark theme
    await p.setViewportSize({ width: 360, height: 780 }); await p.waitForTimeout(120);
    const ph0 = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, w: document.querySelector('.rt-svg').getBoundingClientRect().width }));
    chk(ph0.sw <= ph0.iw + 1 && ph0.w <= ph0.iw, 'P2: fits 360px with no horizontal page scroll :: ' + JSON.stringify(ph0));
    const col = async () => p.evaluate(() => { const l = document.querySelector('.rt-lab'), bg = getComputedStyle(document.body).backgroundColor; return { fill: getComputedStyle(l).fill, bg }; });
    const light = await col();
    await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark')); await p.waitForTimeout(60);
    const dark = await col();
    const lum = (c) => { const m = String(c).match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]; };
    const ctr = (a, b2) => { const x1 = lum(a), x2 = lum(b2); return (Math.max(x1, x2) + 0.05) / (Math.min(x1, x2) + 0.05); };
    chk(ctr(light.fill, light.bg) >= 4.5 && ctr(dark.fill, dark.bg) >= 4.5 && light.fill !== dark.fill, 'P2: labels readable in both themes (contrast ≥ 4.5) :: ' + JSON.stringify([light, dark, ctr(light.fill, light.bg), ctr(dark.fill, dark.bg)]));
    await p.evaluate(() => document.documentElement.removeAttribute('data-theme')); await p.setViewportSize({ width: 1280, height: 900 });
    // buttons: problem page and assistant
    const btn = await p.evaluate((pid) => { APP.go('lprob', pid); const b = document.querySelector('#main .lp-route'); const pc = document.querySelector('#main .lp-precard'); return { b: !!b, pc: pc ? pc.textContent : '' }; }, pidR);
    chk(btn.b && /رأسِ سهمی/.test(btn.pc) && /آموخته شد/.test(btn.pc), 'P2: «🧭» button on the problem page; the problem page shows its prerequisites (no island) :: ' + JSON.stringify(btn));
    const asb = await p.evaluate(() => { const s = __cur(); const el = APP.ASSIST.sessTools(s); return el ? !!el.querySelector('.as-route') : false; });
    chk(asb, 'P2: «🧭» button in the assistant');
    const vm = await p.evaluate(() => !!(APP.VIEW_META.route && APP.SUB_VIEWS.route && APP.ASSIST.manifest().indexOf('نقشهٔ مسیرِ مسئله') >= 0));
    chk(vm, 'the assistant knows the route view (VIEW_META ⇒ manifest)');
    // the 🧩 view links back
    const pv = await p.evaluate(() => { const r = APP.S.all('prereq')[0]; APP.go('prereq', r.id); return { live: !!document.querySelector('.pr-golive'), route: !!document.querySelector('.pr-goroute'), state: (document.querySelector('.pr-state') || {}).textContent || '' }; });
    chk(pv.live && pv.route && /آموخته شد/.test(pv.state), '🧩 view links to its problem and route; item shows its state :: ' + JSON.stringify(pv));
    // solved ⇒ destination «حل شد», now on it; strip gone
    await p.evaluate((pid) => { __liveSet(pid, (so, L) => { L.state = 'solved'; L.stateAt = new Date(Date.now() + 9000).toISOString(); }); }, pidR);
    x = await p.evaluate((pid) => { const M = APP.ROUTE.model(pid); return { dest: M.dest, now: M.now, reached: M.reached }; }, pidR);
    chk(x.dest === 'حل شد ✓' && x.now === -2 && x.reached, 'P2: solved ⇒ destination «حل شد» and the now-marker on it :: ' + JSON.stringify(x));
    g = await p.evaluate(() => { APP.go('home'); return !!document.querySelector('#main .rt-geo'); });
    chk(!g, 'strip gone once the problem is closed');
  });

  // ================= bank — VARIANTS_R22 (P1, P2) =================
  await section('bank', async () => {
    const own = (i) => E[i] && /^P[12]\./.test(E[i].rc);
    // P1 positive — page side of each; pure-model behaviour noted
    const mk = async (title, stmt, steps) => { await wipe(); await fresh(); return bind(title, stmt, steps || [{ text: 'گامِ اول' }, { text: 'گامِ دوم' }]); };
    let pid, st, u, x, r;
    // #0
    pid = await mk('ساده کردنِ کسر', '(x²−1)/(x−1) را ساده کنید.');
    u = await turn(U(0)[0], '(a−b)(a+b) را باز کن، چه می‌شود؟', [cs({ stuck: true, prereq: { concept: 'اتحادِ مزدوج a²−b²=(a−b)(a+b)', step: 's2', quote: 'نمی‌دونم x²−1 رو چطوری می‌شه شکست', q: '(a−b)(a+b) را باز کن، چه می‌شود؟' } })]);
    st = await pre({ pid }); x = await p.evaluate((pid) => APP.liveCoach(pid, { turn: { text: 'گیرم', stuck: true } }), pid);
    T(0, st.length === 1 && st[0].st === 'diag' && x.src === 'prereq-diag' && !/لم|کمکی/.test(x.q), { st, q: x.q });
    // #1 child, ZWNJ partly missing
    pid = await mk('باغچهٔ مثلثی', 'باغچه‌ی مثلثی رو نصف کنیم.', [{ text: 'مساحتِ کل' }]);
    await turn(U(1)[0], 'مساحتِ مستطیل را بلدی؟', [cs({ stuck: true, prereq: { concept: 'مساحتِ مثلث = ½ × قاعده × ارتفاع', step: 's1', quote: 'نمی‌دونم مساحت مثلث رو چجوری حساب می‌کنن', q: 'مساحتِ مستطیل را بلدی؟' } })]);
    st = await pre({ pid });
    await turn('آره طول ضربدر عرض، ولی مثلث نه', 'یاد بده…', [cs({ prereq_res: { id: st[0].id, diag: 'missing', quote: 'ولی مثلث نه' } })]);
    u = await turn('قاعده ۶ ارتفاع ۴ میشه ۱۲', 'برگردیم…', [cs({ prereq_res: { id: st[0].id, mastery: 'yes', quote: 'قاعده ۶ ارتفاع ۴ میشه ۱۲' } })]);
    u = await turn('خب حالا مساحت کل باغچه', 'خوب.', []);
    T(1, /برگشت از پیش‌نیاز/.test(blockOf(u.user, /^# پیش‌نیاز \(/)) && /گامِ s1 را چطور برمی‌داری/.test(blockOf(u.user, /^# پیش‌نیاز \(/)), blockOf(u.user, /^# پیش‌نیاز \(/).slice(-300));
    // #2 teen physics: 🧩 item with pid
    pid = await mk('زمانِ ترمز', 'ماشین ۷۲ کیلومتر بر ساعت…', [{ text: 'گامِ اول' }, { text: 'زمانِ ترمز' }]);
    await turn(U(2)[0], 'یک کیلومتر چند متر است و یک ساعت چند ثانیه؟', [cs({ stuck: true, prereq: { concept: 'تبدیلِ km/h به m/s', step: 's2', quote: 'هیچ‌وقت یاد نگرفتم اینا رو چطوری تبدیل کنم' } })]);
    r = await rec(pid); T(2, r && r.pid === pid && r.items[0].c === 'تبدیلِ km/h به m/s', r);
    // #3 adult life: cause prereq with quote; stage «فهم» not lowered
    pid = await mk('گرون‌تر یا ارزون‌تر', 'قیمت گوشی اول ۱۰٪ رفته بالا بعد ۲۰٪ تخفیف…', [{ text: 'قیمتِ نهایی' }]);
    await turn(U(3)[0], '۱۰٪ از ۲۰۰ چقدر است؟', [cs({ stuck: true, ph: 'u', prereq: { concept: 'درصدِ پیاپی: ضرب در ۱٫۱ سپس ۰٫۸', step: 's1', quote: 'نمی‌دونم درصدِ یه درصد رو چطوری حساب کنم' } })]);
    x = await ph(pid); T(3, x.causes.prereq.length === 1 && !/\/[1-9]/.test(x.r.und), x);
    // #4 three nested levels in one problem — covered by section nested (3 levels, one pop each)
    T(4, !errors.some(e => /nested|pop exactly ONE|A22-25/.test(e)), 'see section nested');
    // #5 failed re-check does not pop — section nested
    T(5, !errors.some(e => /does NOT pop/.test(e)), 'see section nested');
    // #6 formal «شما» — quote and concept exact
    pid = await mk('جمعِ کسرها', 'جمعِ ۲/۳ و ۳/۴ را بیابید.', [{ text: 'گامِ اول' }, { text: 'جمع' }]);
    await turn(U(6)[0], 'آیا ۱/۲ و ۱/۳ را می‌توانید هم‌مخرج کنید؟', [cs({ stuck: true, prereq: { concept: 'هم‌مخرج کردنِ کسرها (ک.م.م مخرج‌ها)', step: 's2', quote: 'نمی‌دانم کسرها را چگونه هم‌مخرج می‌کنند' } })]);
    st = await pre({ pid }); T(6, st.length === 1 && st[0].c === 'هم‌مخرج کردنِ کسرها (ک.م.م مخرج‌ها)', st);
    // #7 ZWNJ-free spelling: quote validated after normalisation; stored with HER spelling
    pid = await mk('معادله', 'x² − 5x + 6 = 0', [{ text: 'گامِ اول' }]);
    await turn(U(7)[0], 'باشه.', [cs({ stuck: true, prereq: { concept: 'حلِ معادلهٔ درجه دو (تجزیه یا فرمولِ Δ)', step: 'گامِ ۱', quote: 'نمی‌دونم معادلهٔ درجه دو رو چجوری حل می‌کنن' } })]);
    st = await pre({ pid }); T(7, st.length === 1 && st[0].quote === 'نمیدونم معادله ی درجه دو رو چجوری حل میکنن', st);
    // #8 ability after validated prerequisite — section mind
    T(8, !errors.some(e => /named gap/.test(e)), 'see section mind');
    // #9 cause «پیش‌نیاز» with her quote; stage unchanged
    T(9, !errors.some(e => /C22-P2|ability talk books/.test(e)), 'see sections diag/mind');
    // #10 multi-day: mastery on D2 ⇒ progress with date, nothing as weakness
    pid = await mk('جذر', '√۱۴۴ را بیابید.', [{ text: 'جذر' }]);
    await turn('جذر بلد نیستم', 'باشه.', [cs({ stuck: true, prereq: { concept: 'جذر (ریشهٔ دوم)', step: 'گامِ ۱', quote: 'جذر بلد نیستم' } })]);
    st = await pre({ pid }); await turn('نه بلد نیستم واقعاً', 'یاد بده.', [cs({ prereq_res: { id: st[0].id, diag: 'missing', quote: 'نه بلد نیستم' } })]);
    await p.evaluate(() => { window.__day = '2026-10-20'; });
    await p.evaluate((pid) => { localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); APP.liveBindSession(pid, s); }, pid);
    await turn(U(10)[0] || 'دیروز چند تا جذر حل کردم، √۱۹۶ میشه ۱۴', 'آفرین.', [cs({ prereq_res: { id: st[0].id, mastery: 'yes', quote: '√۱۹۶ میشه ۱۴' } })]);
    r = await rec(pid); x = await ph(pid);
    T(10, r.items[0].st === 'learned' && !!r.items[0].learned && x.learned.includes('جذر (ریشهٔ دوم)') && !x.weakest, { r, x });
    await p.evaluate(() => { window.__day = '2026-10-18'; });
    // #11 teacher role — section mind
    T(11, !errors.some(e => /teacher role/.test(e)), 'see section mind');
    // #12 record in P's 🧩 with pid + ONE topic linked back
    T(12, !errors.some(e => /ONE learning topic|with its pid/.test(e)), 'see section diag');
    // #13 after a long detour the next turn question is the waiting step
    T(13, !errors.some(e => /ONE turn question about the waiting step/.test(e)), 'see section diag');
    // #14 siblings — section sib
    T(14, !errors.some(e => /siblings|NEXT prerequisite|same problem\'s 🧩/.test(e)), 'see section sib');
    // #15 diagnostic answer counts as mastery; item «خودش ساخت»
    pid = await mk('مثلث از مستطیل', 'مساحتِ مثلث…', [{ text: 'مساحت' }]);
    await turn('مساحت مستطیل رو بلدم، طول ضربدر عرض؛ ولی مثلث نه', 'اگر مستطیل را از قطر ببری چه می‌شود؟', [cs({ stuck: true, prereq: { concept: 'مساحتِ مثلث = نصفِ مستطیل', step: 'گامِ ۱', quote: 'ولی مثلث نه', q: 'اگر مستطیل را از قطر ببری چه می‌شود؟' } })]);
    st = await pre({ pid });
    await turn('آهان دو تا مثلث مساوی، پس نصفشه!', 'برگردیم به گامِ ۱…', [cs({ prereq_res: { id: st[0].id, diag: 'missing', mastery: 'yes', quote: 'دو تا مثلث مساوی، پس نصفشه' } })]);
    st = await pre({ pid }); r = await rec(pid); T(15, st[0].st === 'learned' && st[0].selfMade && r.items[0].how === 'خودش ساخت', { st, r });
    // #16 name is given (rule lifted) for the diagnosed prerequisite
    pid = await mk('لانه‌کبوتری', 'ثابت کنید…', [{ text: 'گامِ ۱' }, { text: 'گامِ ۲' }, { text: 'گامِ ۳' }, { text: 'گامِ اثبات' }]);
    await turn(U(16)[0], 'اصلِ لانه‌کبوتری می‌گوید…', [cs({ stuck: true, prereq: { concept: 'اصلِ لانه‌کبوتری', step: 's4', quote: 'این لانه کبوتری چیه؟ من اسمشم نشنیدم' } })]);
    u = await turn('یعنی چی دقیقاً؟', 'باشه.', []);
    T(16, /پیش‌نیازِ تشخیص‌داده‌شده: «اصلِ لانه‌کبوتری» — نامش را صریح بگو/.test(blockOf(u.user, /^# پیش‌نیاز \(/)), blockOf(u.user, /^# پیش‌نیاز \(/).slice(0, 500));
    // #17 child multiplication
    pid = await mk('شکلات‌ها', '۱۲ کیسهٔ ۱۵ تایی', [{ text: 'شمارش' }]);
    await turn(U(17)[0], '۱۰ تا ۱۵ تا چند می‌شود؟', [cs({ stuck: true, prereq: { concept: 'ضربِ دو رقمی (۱۲×۱۵ = ۱۰×۱۵ + ۲×۱۵)', step: 'گامِ ۱', quote: 'ضرب دو رقمی رو بلد نیستم' } })]);
    st = await pre({ pid }); T(17, st.length === 1 && st[0].st === 'diag', st);
    // #18 chemistry — page side: recorded; formula display is model wording
    pid = await mk('مول', '۲ مول آب', [{ text: 'جرم' }]);
    await turn(U(18)[0], 'مول یعنی…', [cs({ stuck: true, prereq: { concept: 'مول (۶٫۰۲×۱۰²³ ذره / جرمِ مولی)', step: 'گامِ ۱', quote: 'مول اصلاً چیه؟' } })]);
    st = await pre({ pid }); T(18, st.length === 1 && /۱۰²³/.test(st[0].c), st);
    // #19 high-stakes life decision: cause prereq
    pid = await mk('دو وام', 'دو وام: سود ساده و مرکب', [{ text: 'مقایسهٔ کلِ بازپرداخت' }]);
    await turn(U(19)[0], 'باشه.', [cs({ stuck: true, ph: 'u', prereq: { concept: 'سودِ مرکب: (۱+r)^n', step: 'گامِ ۱', quote: 'نمیدونم سود مرکب یعنی چی' } })]);
    x = await ph(pid); T(19, x.causes.prereq.length === 1 && !/\/[1-9]/.test(x.r.und), x);
    // #20 stack persists across sessions for the live problem
    pid = await mk('فیثاغورس دو روز', 'ارتفاعِ مثلث…', [{ text: 'گامِ ۱' }, { text: 'گامِ ۲' }, { text: 'ارتفاع' }]);
    await turn('فیثاغورس رو اصلاً نخوندم', 'باشه.', [cs({ stuck: true, prereq: { concept: 'قضیهٔ فیثاغورس', step: 's3', quote: 'فیثاغورس رو اصلاً نخوندم' } })]);
    st = await pre({ pid }); await turn('نه بلد نیستم', 'یاد بده', [cs({ prereq_res: { id: st[0].id, diag: 'missing', quote: 'نه بلد نیستم' } })]);
    await p.evaluate((pid) => { localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); APP.liveBindSession(pid, s); }, pid);
    u = await turn('سلام، دیشب فیثاغورس رو تمرین کردم، ۵ و ۱۲ میشه ۱۳', 'آفرین؛ دیروز در گامِ ۳ بودیم…', [cs({ prereq_res: { id: st[0].id, mastery: 'yes', quote: '۵ و ۱۲ میشه ۱۳' } })]);
    st = await pre({ pid });
    T(20, /پشتهٔ جاهای منتظر/.test(blockOf(u.user, /^# پیش‌نیاز \(/)) && st[0].st === 'learned', { st, b: blockOf(u.user, /^# پیش‌نیاز \(/).slice(0, 300) });
    // #21 rule lifted — the coach may name «قضیهٔ فیثاغورس»
    T(21, /برای پیش‌نیازِ تشخیص‌داده‌شده برقرار نیست/.test(blockOf(u.user, /^# پیش‌نیاز \(/)), 'rule line present');
    // #22 formula quote validated (her own work)
    pid = await mk('مربعِ دوجمله‌ای', '(۵+۳)² را حساب کن', [{ text: 'گامِ ۱' }]);
    await turn(U(22)[0], '(۲+۳)² را مستقیم حساب کن و با ۴+۹ مقایسه کن.', [cs({ fail: true, prereq: { concept: 'اتحادِ مربعِ دوجمله‌ای (a+b)² = a²+2ab+b²', step: 'گامِ ۱', quote: '(a+b)² = a² + b²' } })]);
    st = await pre({ pid }); T(22, st.length === 1, st);
    // #23 nested life case درصد ← کسر: two nested levels, route map shows two nested detours rejoining
    pid = await mk('بودجه', 'بودجه‌ی ماهم رو بچینم که ۳۰٪ پس‌انداز کنم', [{ text: 'بودجه' }]);
    await turn(U(23)[0], 'باشه.', [cs({ stuck: true, prereq: { concept: 'درصد (۳۰٪ از یک مقدار)', step: 'گامِ ۱', quote: 'ولی درصد رو نمی‌فهمم' } })]);
    st = await pre({ pid });
    await turn(U(23)[1], 'باشه.', [cs({ stuck: true, prereq: { concept: 'معنای کسر (۳/۱۰)', step: 'درصد', quote: 'اصلاً کسر رو هم درست نمی‌فهمم' } })]);
    st = await pre({ pid });
    await turn('آهان ۳ از ۱۰ قسمت', 'خوب', [cs({ prereq_res: { id: st[1].id, diag: 'missing', mastery: 'yes', quote: '۳ از ۱۰ قسمت' } })]);
    await turn('پس ۳۰٪ یعنی ۳۰ از ۱۰۰', 'خوب', [cs({ prereq_res: { id: st[0].id, diag: 'missing', mastery: 'yes', quote: '۳۰٪ یعنی ۳۰ از ۱۰۰' } })]);
    x = await p.evaluate((pid) => { const M = APP.ROUTE.model(pid); return M.dets.map(d => d.kind + ':' + d.depth + ':' + (d.rejoin != null)); }, pid);
    T(23, x.includes('pre:0:true') && x.includes('pre:1:true') && (await rec(pid)).items.length === 2, x);
    // P1 negatives
    pid = await mk('کدام مثلث', 'نردبان…', [{ text: 'گامِ ۱' }, { text: 'گامِ ۲' }]);
    await turn(U(24)[0], 'کجا زاویهٔ قائمه می‌سازی؟', [cs({ stuck: true, cause: { kind: 'knot', quote: 'نمی‌فهمم این‌جا کدوم مثلث قائمه‌ست' } })]);
    x = await ph(pid); T(24, !(await rec(pid)) && x.causes.knot === 1 && !x.causes.prereq.length, x);
    await turn(U(25)[0], 'باشه.', [cs({})]);
    x = await ph(pid); T(25, !(await rec(pid)) && x.causes.knot === 1 && x.causes.skill === 0 && x.causes.unk === 0, x);
    u = await turn(U(26)[0], 'کجای شروع؟', [cs({ stuck: true, cause: { kind: 'knot', quote: 'باز نمی‌تونم شروع کنم' } })]);
    T(26, !(await rec(pid)) && /گیر را دقیق کن/.test(blockOf(u.user, /^# پیش‌نیاز \(/)) && !(await sysMsgs()).some(t => /کم‌هوشی نیست/.test(t)), blockOf(u.user, /^# پیش‌نیاز \(/).slice(0, 300));
    T(27, !errors.some(e => /invented quote/.test(e)), 'see section reject');
    T(28, !errors.some(e => /closed step/.test(e)), 'see section reject');
    NC(29, 'pure model behaviour: no prereq is reported ⇒ nothing lifts the no-spoiler rule (the lifting line only names diagnosed prerequisites — checked in #16/#21)');
    u = await turn(U(30)[0], 'کجای همین گام؟', [cs({ stuck: true, prereq: { concept: 'جبر', step: 'گامِ ۱', quote: 'من جبرم ضعیفه' } })]);
    T(30, (await pre({ pid })).length === 0 && /هرگز برچسبِ رشته/.test(blockOf(u.user, /^# پیش‌نیاز \(/)), blockOf(u.user, /^# پیش‌نیاز \(/).slice(0, 400));
    T(31, !errors.some(e => /«گره» and «مهارت»/.test(e)), 'see section mind (cause skill with quote)');
    NC(32, 'teach-to-need is the model\'s wording; the page directive says «فقط به اندازهٔ گامِ … (نه فرمول‌ها و برهان‌های دیگرِ همان موضوع)» — checked in section diag/nested');
    T(33, !errors.some(e => /return to its parent|jumped to look-back/.test(e)), 'see sections diag (rewrite) / nested (parent return)');
    T(34, !errors.some(e => /never «ضعیف‌ترین»|C22-P2/.test(e)), 'see section diag');
    T(35, !errors.some(e => /already-mastered/.test(e)), 'see section mind');
    pid = await mk('کاربست', 'مسئله', [{ text: 'گامِ ۱' }]);
    await turn(U(36)[0], 'باشه.', [cs({ stuck: true })]); T(36, !(await rec(pid)), 'no record');
    T(37, !errors.some(e => /no quote/.test(e)), 'see section reject');
    T(38, !errors.some(e => /one 🧩 item, updated/.test(e)), 'see section sib');
    await turn(U(39)[0], 'خوب.', [cs({ prereq: { concept: 'قضیهٔ فیثاغورس', step: 'گامِ ۱', quote: 'قبلاً فیثاغورس رو بلد نبودم' } })]);
    T(39, (await pre({ pid })).length === 0, await pre({ pid }));
    NC(40, 'register «تو» = «در» is P5 (turnq+class) — this mechanism adds no register logic; a stuck without concept evidence creates no prerequisite (checked #36)');
    pid = await mk('رفت', 'مسئله', [{ text: 'گامِ ۱' }]);
    await turn('جذر بلد نیستم', 'باشه.', [cs({ stuck: true, prereq: { concept: 'جذر', step: 'گامِ ۱', quote: 'جذر بلد نیستم' } })]);
    st = await pre({ pid }); await turn('نه', 'یاد بده', [cs({ prereq_res: { id: st[0].id, diag: 'missing', quote: 'نه' } })]);
    st = await pre({ pid }); r = await rec(pid); T(41, st[0].st === 'teach' && r.items[0].st === 'teach' && !r.items[0].learned, { st, r });
    // P2 — route map entries
    T(42, !errors.some(e => /origin = statement/.test(e)), 'see section route');
    T(43, !errors.some(e => /rejoins exactly at the waiting step/.test(e)), 'see section route');
    T(44, !errors.some(e => /nested detours rejoin/.test(e)), 'see section nested');
    T(45, !errors.some(e => /auxiliary problem and tested guess/.test(e)), 'see section route');
    T(46, !errors.some(e => /back-jump to the corrected point|old value as history/.test(e)), 'see section route');
    T(47, !errors.some(e => /hovering a point/.test(e)), 'see section route');
    T(48, !errors.some(e => /geography strip|returns to the problem/.test(e)), 'see section route');
    T(49, !errors.some(e => /360px|both themes/.test(e)), 'see section route');
    T(50, !errors.some(e => /button in the assistant|knows the route view/.test(e)), 'see section route (VIEW_META ⇒ the assistant can offer the view; button in the assistant)');
    T(51, !errors.some(e => /solved ⇒ destination/.test(e)), 'see section route');
    T(52, !errors.some(e => /no store, record/.test(e)), 'see section route');
    await wipe(); await fresh(); x = await p.evaluate(() => { APP.go('home'); return !!document.querySelector('#main .rt-geo'); }); T(53, !x, x);
    // #54 quote without correction ⇒ no back-jump
    pid = await mk('حصار', 'با ۴۰ متر حصار…', [{ text: 'گامِ ۱' }]);
    await turn('گفته بودم ۴۰ متر', 'باشه.', [cs({})]);
    x = await p.evaluate((pid) => APP.ROUTE.model(pid).backs.length, pid); T(54, x === 0, x);
    // #55 untested guess ⇒ a point «حدس · آزموده نشده», not a detour
    await p.evaluate((pid) => { __liveSet(pid, (so) => { so.g = { 1: { guess: 'فکر کنم ۱۲ باشه', at: new Date().toISOString() } }; }); }, pid);
    x = await p.evaluate((pid) => { const M = APP.ROUTE.model(pid); return { d: M.dets.filter(d => d.kind === 'guess').length, t: M.pts.filter(q => /آزموده نشده/.test(q.title)).length }; }, pid); T(55, x.d === 0 && x.t === 1, x);
    // #56 practice session not on the route; #57 other problem's events never appear
    const pidO = await p.evaluate(() => { const pid = __live('مسئلهٔ دیگر', 'صورتِ دیگر'); __liveSet(pid, (so, L) => { L.steps.push({ id: 's1', at: new Date().toISOString(), text: 'گامِ مسئلهٔ دیگر' }); }); return pid; });
    x = await p.evaluate(([pid, o]) => { const M = APP.ROUTE.model(pid); return { other: M.pts.filter(q => /مسئلهٔ دیگر/.test(q.title + q.lines.join(' '))).length, prac: M.pts.filter(q => q.k === 'practice').length }; }, [pid, pidO]);
    T(56, x.prac === 0, x); T(57, x.other === 0, x);
    // #58 no plan ⇒ «نامعلوم — طرح هنوز نیست», never a percent
    x = await p.evaluate((pid) => APP.ROUTE.model(pid).remain, pid); T(58, /نامعلوم — طرح هنوز نیست/.test(x) && !/٪|%/.test(x), x);
    T(59, !errors.some(e => /strip gone/.test(e)), 'see section route');
    const missing = BANK.map((e, i) => i).filter(i => own(i) && info.bank[i] === undefined && info.nc[i] === undefined);
    chk(!missing.length, 'bank: every P1/P2 entry is tested or has a reason :: ' + JSON.stringify(missing));
  });
  function U(i) { return E[i].text.split('‖').map(x => x.trim()).filter(x => /^U:/.test(x)).map(x => x.replace(/^U:\s*/, '').replace(/^\(([^)+=]*\s[^)+=]*)\)\s*/, '').trim()); }

  const nb = Object.keys(info.bank).length, nbOk = Object.values(info.bank).filter(Boolean).length;
  console.log('bank P1/P2: ' + nbOk + '/' + nb + ' pass; nc: ' + Object.keys(info.nc).length);
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
