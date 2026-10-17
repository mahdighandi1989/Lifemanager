// تورِ پولیا (دستهٔ ۱، دورِ ۱۹ ِ اصلاح، سهمِ «coach» — ۲۰۲۶-۱۰-۱۷) — DECISIONS_R19: سازوکارهای ریشه‌ای. هر بخش با جملهٔ خودِ سناریو (گزارش‌های اجراکننده‌ها)
// و «بانکِ گونه‌ها» (tests/tour1_variants_r19_coach.js = VARIANTS_R19.json، نوشتهٔ عاملی که کد را ندیده) سنجیده می‌شود.
//  rn1     RN1 — نامزدِ درخواستِ عقب‌افتاده: هر پیام با پاسخِ خودش (نه پاسخِ نوبتِ سامانه)، فقط درخواستِ رو به دستیار، نه «میشه» ِ رابط، بی بریدن در اعشار
//  rn2     RN2 d e — برنامه ⇄ گامِ زنده و برنامه ⇄ حدس یک وضع؛ «امروز» یک‌تپ (INF10)؛ کارنامه هر کار را یک بار می‌شمارد
//  rn3     RN3 a b c — «ضعیف‌ترین» فقط با شکست و تمایزِ اکید؛ نقطهٔ سیاهِ بیش‌اطمینانی فقط با رویدادِ همان نوع؛ بازگویی/plan_done/طرح+نتیجه شاهد‌اند
//  rn6     RN6 a b c d — «بعدی؟» پس از بستن مسئله نمی‌سازد؛ said:result ِ سنجیده با متنِ نتیجه مرحله را می‌برد؛ ضمیرِ پشتیبان فقط از حرفِ کاربر؛ شناسهٔ برنامه‌ها
//  strict  کنترل: یک پرسشِ نوبت در هر بلوک
// LLA_FILE = ساختِ دیگر؛ ONLY=rn1,rn3 …
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = require('./tour1_variants_r19_coach.js');

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
const normC = (t) => String(t || '').replace(/[«»]/g, '').replace(/[\s‌]+/g, ' ').replace(/[.!؟?،]+\s*$/, '').trim();

(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
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
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__ph = () => { const Q = APP.MIND.phases(); const o = { n: Q.n, weakest: Q.weakest ? Q.weakest.id : null }; Q.rows.forEach(r => { o[r.id] = r.none ? 'none' : r.k + '/' + r.n; }); return o; };
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
    window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {};
      ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L); APP.S.put(pg); };
    window.__ev = (ph, ok, n) => { const s = APP.ASSIST.cur(); s.coachEv = s.coachEv || []; for (let i = 0; i < (n || 1); i++) s.coachEv.push({ at: new Date().toISOString(), ph, ok: !!ok, src: ok ? 'chatok' : 'chat', key: 'inj|' + ph + '|' + Math.random() }); APP.S.put(s); };
    window.__sysTurn = async (text, reply) => { __q.push(R({ reply: reply || 'ثبت شد.' })); await APP.ASSIST.send(text); __q.length = 0; };
    window.__plans = () => (APP.ASSIST.plansAll(null) || []).map(x => ({ id: x.p.id, state: x.p.state, step: x.p.step || null, text: x.p.text }));
    window.__today = () => APP.dueList().filter(x => /^📌/.test(x.txt || '')).map(x => ({ txt: x.txt, sub: x.sub, acts: (x.acts || []).map(a => a.t) }));
  }, T0);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const lines = (u) => head(u).split('\n');
  const coachHead = (u) => (lines(u).filter(l => /^# مربیِ حل/.test(l))[0] || '');
  const strictAll = [];
  const turn = async (text, reply, actions) => { const u = await p.evaluate(([t, r, a]) => __turn(t, r, a), [text, reply || '', actions || []]); strictAll.push([String(text).slice(0, 24), strictScan(u.user)]); return u; };
  const sysTurn = (t, r) => p.evaluate(([t, r]) => __sysTurn(t, r), [t, r || '']);
  const fresh = () => p.evaluate(() => __fresh());
  const wipe = () => p.evaluate(() => __wipe());
  const ph = () => p.evaluate(() => __ph());
  const day = (d) => p.evaluate(d => { window.__day = d; }, d);
  const bank = (rc, kind) => BANK.filter(e => e.rc === rc && (!kind || e.kind === kind));
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const deferLines = (u) => lines(u).filter(l => /اگر هنوز پاسخش نداده‌ای/.test(l) && /در پیامِ پیشینش/.test(l));
  const candOf = (l) => { const m = /\(«([^»]*)»\)/.exec(l || ''); return m ? m[1] : ''; };
  const planBlock = (u) => lines(u).filter(l => /^- زمینه/.test(l) && /(?:برنامه|pl\d)/.test(l) && /(?:انجام شد|plan_done|اول حدس)/.test(l));

  // ================= rn1 =================
  await section('rn1', async () => {
    const r = info.rn1 = { res: [] };
    /* اجرای یک مورد: پیام‌ها با «‖»؛ «U: [سامانه: …]» نوبتِ کارِ صفحه است؛ پاسخِ دستیار بی گزارشِ وضع مگر زمینه بگوید «has coach_state» */
    const run = async (text, ctx) => {
      await wipe(); await fresh();
      const parts = text.split('‖').map(x => x.trim()); const firstCs = /first A has coach_state|carried a valid coach_state/.test(ctx || '');
      if (/live problem's own question/.test(text + ' ' + (ctx || ''))) { const m = /problem: «([^»]+)»/.exec(text + ' ' + (ctx || '')); if (m) await turn(m[1], 'مجهول چیست؟', [cs({ ph: 'u' })]); }
      if (/pr1 already closed/.test(ctx || '')) { await turn('بعداً یه مثال واقعی بزن', 'باشد، بعداً.', [cs({ ph: 'u', defer: { what: 'بعداً یه مثال واقعی بزن' } })]); await turn('خب مثال؟', 'این هم مثال: …', [cs({ ph: 'u' }), { do: 'promise_done', id: 'pr1' }]); }
      let firstA = true;
      for (let i = 0; i < parts.length; i++) {
        const m = /^(U|A):\s*([\s\S]*)$/.exec(parts[i]); if (!m || m[1] !== 'U') continue;
        const nx = parts[i + 1] && /^A:/.test(parts[i + 1]) ? parts[i + 1].replace(/^A:\s*/, '') : 'باشه.';
        if (/^\[سامانه/.test(m[2])) { await sysTurn(m[2], nx); continue; }
        await turn(m[2], nx.replace(/^\((.*)\)$/, '$1'), firstA && firstCs ? [cs({ ph: 'u' })] : []); firstA = false;
      }
      const u2 = await turn('باشه.');
      const pr = await p.evaluate(() => (__cur().promises || []).filter(x => !x.done && x.by !== 'model' || (x.by === 'model' && !/مثال واقعی/.test(x.ask))).length);
      return { ln: deferLines(u2.user), pr };
    };
    const E = bank('RN1.defer');
    for (let i = 0; i < E.length; i++) {
      const e = E[i], x = await run(e.text, e.context);
      let ok;
      if (e.kind === 'pos') { const want = (/CANDIDATE (?:exactly )?«([^»]+)»/.exec(e.expect) || [])[1]; ok = x.ln.length === 1 && normC(candOf(x.ln[0])) === normC(want) && !x.pr; }
      else ok = !x.ln.length && !x.pr;
      r.res.push([i + 1, ok]); chk(ok, 'rn1 bank#' + (i + 1) + ' «' + e.text.slice(0, 90) + '» → ' + e.expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 400));
    }
    // جمله‌های خودِ سناریوها (گزارش‌های اجراکننده‌ها)
    const Q = [
      ['s02 A·D1', 'neg', 'U: مساحت کف رو حساب کردم. باز ۳.۶۷ میشه. ‖ A: از کجا به این عدد رسیدی؟'],
      ['s18 B·D4', 'neg', 'U: نرخ حجم داده شده: V با سرعت ۵ کم می‌شه. ‖ A: مجهول دقیقاً چیست؟'],
      ['s12 B·D4', 'neg', 'U: رمهب‌ستان؟ ‖ A: حروف را بشمار.'],
      ['s13 B·D4', 'neg', 'U: فکر کنم یعنی کسی که می‌دونه و چیزی نمیگه؟ ‖ A: یعنی کسی که آگاه است ولی سکوت می‌کند؛ چرا این مهم است؟'],
      ['s36 D·3', 'neg', 'U: می‌شه بدون x حلش کرد؟ ‖ A: لازم نیست حتماً x باشد؛ با شکل هم می‌شود.'],
      ['s32 D·3', 'neg', 'U: پس شاید تبلیغ فقط یه کم اضافه کرده؟ ‖ A: چطور می‌آزمایی‌اش؟'],
      ['s14o B·D4 (missed real request)', 'pos', 'U: دقیقه‌ی اول؟ اصلاً این اثبات‌ها به چه درد من می‌خوره؟ ‖ A: «اثبات‌ها به چه درد می‌خورد» را بگذار برای وقتی خودت دیدی وقتش است؛ در دقیقهٔ اول چه دیدی؟', 'اصلاً این اثبات‌ها به چه درد من می‌خوره؟'],
    ];
    for (const [id, kind, text, want] of Q) {
      await wipe(); await fresh(); if (/s14o/.test(id)) await turn('یه سؤال اثبات دارم؛ از کجا شروع کنم؟', 'در دقیقه‌ی اول چه دیدی؟', [cs({ ph: 'u' })]);
      const parts = text.split('‖').map(x => x.trim()); await turn(parts[0].replace(/^U:\s*/, ''), parts[1].replace(/^A:\s*/, ''));
      const u2 = await turn('باشه.'); const ln = deferLines(u2.user);
      const ok = kind === 'pos' ? ln.length === 1 && normC(candOf(ln[0])) === normC(want) : !ln.length;
      chk(ok, 'rn1 ' + id + ': ' + text.slice(0, 80) + ' :: ' + JSON.stringify(ln).slice(0, 300));
    }
    // C·X1 (s22 p5): پاسخِ خودِ پیامش گزارش داشت و کارِ صفحه («[سامانه: …]») پس از آن آمد ⇒ هیچ سطرِ «گزارشِ وضعِ آن نوبت نیامد»
    await wipe(); await fresh(); await turn('بیا توی سامانه ثبتش کنیم', 'باشه، به «🔭» می‌رویم.', [cs({ ph: 'u' })]);
    await sysTurn('[سامانه: «🔭 مسئله‌های من» باز شد]', 'فرم را پر کردم.');
    const ux = await turn('خب حالا چی کار کنم؟');
    chk(!deferLines(ux.user).length && !lines(ux.user).some(l => /گزارشِ وضعِ آن نوبت نیامد/.test(l)), 'rn1 C·X1 s22: the reply to her message carried coach_state; the system-turn reply is not her reply ⇒ no false «گزارشِ وضعِ آن نوبت نیامد» ' + JSON.stringify(deferLines(ux.user)));
    // پرسشِ خودِ مسئلهٔ زندهٔ ثبت‌شده (C·X1 s24) — حتی بی گزارشِ وضع
    await wipe(); await fresh(); const pid = await p.evaluate(() => __live('سی پله', 'به چند روش می‌شه ۳۰ پله رو با گام‌های یک یا دوتایی بالا رفت؟'));
    await p.evaluate(pid => APP.liveBindSession(pid, __cur()), pid);
    await turn('به چند روش می‌شه ۳۰ پله رو با گام‌های یک یا دوتایی بالا رفت؟', 'برای ۳ پله چند راه داری؟'); const uy = await turn('باشه.');
    chk(!deferLines(uy.user).length, 'rn1 C·X1 s24: the live problem\'s own question is never a deferred request ' + JSON.stringify(deferLines(uy.user)));
    // اعشار: جمله در «۳.۶۷» بریده نمی‌شود
    const sp = await p.evaluate(() => APP.ASSIST.R18_QUARANTINE && typeof APP.ASSIST.R18_QUARANTINE.deferCand === 'function' && typeof APP.ASSIST.R18_QUARANTINE.sentsOf === 'function');
    chk(sp, 'rn1: the replaced detector and sentence splitter are quarantined (APP.ASSIST.R18_QUARANTINE), not deleted');
  });

  // ================= rn2 =================
  await section('rn2', async () => {
    const r = info.rn2 = { res: [] }; const E = bank('RN2.link'); const T = (i, ok, x) => { r.res.push([i + 1, ok]); chk(ok, 'rn2 bank#' + (i + 1) + ' «' + E[i].text.slice(0, 90) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 500)); };
    const setup = async (steps) => { await wipe(); await day('2026-10-15'); await fresh(); const pid = await p.evaluate(() => __live('برنامهٔ غذایی'));
      await p.evaluate(([pid, steps]) => { APP.liveBindSession(pid, __cur()); __liveSet(pid, (so, L) => { steps.forEach((t, i) => L.steps.push({ id: 's' + (i + 1), at: new Date().toISOString(), text: t, pred: 'شاید', due: '2026-10-16' })); }); }, [pid, steps || []]); return pid; };
    const say = (t, plan, extra) => turn(t, 'باشه.', [cs(Object.assign({ ph: 'e', plan }, extra || {}))]);
    const setOut = (pid, sid, done) => p.evaluate(([pid, sid, done]) => __liveSet(pid, (so, L) => { const st = L.steps.find(x => x.id === sid); st.out = { at: new Date().toISOString(), d: APP.today(), done, what: '', match: '' }; st.closed = true; }), [pid, sid, done]);
    const asked = (u, id) => lines(u.user).some(l => /انجام شد یا نه|انجام شد؟/.test(l) && (!id || l.indexOf(id) >= 0));
    let pid, u, x, pl, td;
    // 1 — plan same as live step s3 (model report), s3 done ⇒ plan done, no ask, no Today line
    pid = await setup(['خرید سبزی', 'پختن عدس', 'هر هفته یکی از غذاها رو عوض می‌کنیم']);
    await say('هر هفته یکی از غذاها رو عوض می‌کنیم، از دوشنبه.', { text: 'هر هفته یکی از غذاها رو عوض می‌کنیم', when: '2026-10-16', step: '3' });
    await setOut(pid, 's3', 'yes'); await day('2026-10-17'); u = await turn('سلام، یه هفته گذشت.'); pl = await p.evaluate(() => __plans()); td = await p.evaluate(() => __today());
    T(0, pl.length === 1 && pl[0].state === 'done' && pl[0].step && !asked(u) && !td.length, { pl, td, a: asked(u) });
    // 2 — on_guess g1 refuted ⇒ closed for review; no ask; no Today line
    await wipe(); await day('2026-10-15'); await fresh();
    await turn('به نظرم کار سرایداره، می‌خوام همین امروز باهاش روبه‌رو می‌شم.', 'اول حدس را بیازما.', [cs({ ph: 'u', guess: { text: 'کار سرایداره' }, plan: { text: 'همین امروز باهاش روبه‌رو می‌شم', when: '2026-10-15', on_guess: true } })]);
    await turn('دفتر نگهبانی نشون میده برای تعمیر شیر آب مونده بود، پس کار اون نبوده.', 'پس حدس رد شد.', [cs({ ph: 'e', guess_res: { id: 'g1', res: 'refuted' } })]);
    await day('2026-10-17'); u = await turn('خب حالا چی؟'); pl = await p.evaluate(() => __plans()); td = await p.evaluate(() => __today());
    T(1, pl[0] && pl[0].state === 'review' && !asked(u) && !td.length, { pl, td, a: asked(u) });
    // 3 — on_guess g1 confirmed ⇒ closed for review
    await wipe(); await day('2026-10-15'); await fresh();
    await turn('حدسم اینه که باتریه، فردا باتری رو عوض می‌کنم.', 'باشه.', [cs({ ph: 'u', guess: { text: 'باتریه' }, plan: { text: 'فردا باتری رو عوض می‌کنم', when: '2026-10-16', on_guess: true } })]);
    await turn('با باتری قرضی روشن شد، پس واقعاً باتری بود.', 'خوب آزمودی.', [cs({ ph: 'e', guess_res: { id: 'g1', res: 'confirmed' } })]);
    await day('2026-10-17'); u = await turn('سلام.'); pl = await p.evaluate(() => __plans());
    T(2, pl[0] && pl[0].state === 'review' && !asked(u), { pl, a: asked(u) });
    // 4 — plan same as step s2; s2 outcome done:no from chat ⇒ plan not done (one state)
    pid = await setup(['خرید سبزی', 'پیاده‌روی صبح']);
    await say('از فردا پیاده‌روی صبح می‌رم.', { text: 'پیاده‌روی صبح', when: '2026-10-16', step: '2' });
    await turn('پیاده‌روی صبح رو نرفتم، بارون بود.', 'باشه.', [cs({ ph: 'e', step: { step: 2, done: 'no' } })]);
    await day('2026-10-17'); u = await turn('سلام.'); pl = await p.evaluate(() => __plans());
    T(3, pl[0] && pl[0].state === 'notdone' && !asked(u), { pl, a: asked(u) });
    // 5 — Today tap «انجام دادم»
    await wipe(); await day('2026-10-15'); await fresh(); await say('تا شنبه فصل ۳ رو می‌خونم.', { text: 'تا شنبه فصل ۳ رو می‌خونم', when: '2026-10-17' });
    await day('2026-10-17'); await p.evaluate(() => APP.go('home')); await p.waitForTimeout(100);
    x = await p.evaluate(() => { const b = document.querySelector('#main .plan-done'); if (!b) return { btn: false }; b.click(); return { btn: true, own: !!b.closest('[data-own]') }; });
    await p.waitForTimeout(100); u = await turn('سلام.'); pl = await p.evaluate(() => __plans()); td = await p.evaluate(() => __today());
    T(4, x.btn && x.own && pl[0].state === 'done' && !asked(u) && !td.length, { x, pl, td });
    // 6 — plan linked to step s1; validated plan_done:true ⇒ s1 shows done too
    pid = await setup(['کلاس شنا']); await say('فردا کلاس شنا رو ثبت‌نام می‌کنم.', { text: 'کلاس شنا', when: '2026-10-16', step: '1' });
    await day('2026-10-17'); await turn('کلاس شنا رو ثبت‌نام کردم بالاخره.', 'آفرین.', [cs({ ph: 'e', plan_done: { id: 'pl1', done: true } })]);
    x = await p.evaluate(pid => { const st = APP.S.get('eprog_' + pid).solve.live.steps[0]; return { out: st.out && st.out.done, rep: st.chatRep && st.chatRep.done }; }, pid);
    u = await turn('سلام.'); pl = await p.evaluate(() => __plans());
    T(5, pl[0].state === 'done' && (x.out === 'yes' || x.rep === 'yes') && !asked(u), { x, pl });
    // 7 — plan.same pl1 ⇒ one plan
    await wipe(); await day('2026-10-17'); await fresh(); await say('فردا صبح زود بیدار می‌شم.', { text: 'فردا صبح زود بیدار می‌شم', when: '2026-10-18' });
    await say('گفتم که، فردا صبح زود بیدار می‌شم دیگه.', { text: 'فردا صبح زود بیدار می‌شم', when: '2026-10-18', same: 'pl1' });
    pl = await p.evaluate(() => __plans()); await day('2026-10-18'); td = await p.evaluate(() => __today());
    T(6, pl.length === 1 && td.length <= 1, { pl, td });
    // 8 — «هنوز نه» ⇒ open, not duplicated; asked again at most once later
    await wipe(); await day('2026-10-15'); await fresh(); await say('تا شنبه کمد رو مرتب می‌کنم.', { text: 'تا شنبه کمد رو مرتب می‌کنم', when: '2026-10-17' });
    await day('2026-10-17'); await p.evaluate(() => APP.go('home')); await p.waitForTimeout(100);
    x = await p.evaluate(() => { const b = document.querySelector('#main .plan-notyet'); if (!b) return { btn: false }; b.click(); return { btn: true }; });
    pl = await p.evaluate(() => __plans()); td = await p.evaluate(() => __today()); const uA = await turn('سلام.');
    await day('2026-10-18'); const td2 = await p.evaluate(() => __today()); const uB = await turn('سلام دوباره.'); const uC = await turn('خب.');
    T(7, x.btn && pl.length === 1 && pl[0].state === 'open' && !td.length && !asked(uA) && td2.length === 1 && td2[0].acts.indexOf('هنوز نه') < 0 && asked(uB) && !asked(uC), { x, pl, td, td2, a: [asked(uA), asked(uB), asked(uC)] });
    // 9 (neg) — unrelated live step done ⇒ plan unchanged, still asked
    pid = await setup(['خرید']); await say('از فردا ورزش صبح می‌کنم.', { text: 'ورزش صبح', when: '2026-10-16' }); await setOut(pid, 's1', 'yes');
    await day('2026-10-17'); u = await turn('سلام.'); pl = await p.evaluate(() => __plans());
    T(8, pl[0].state === 'open' && !pl[0].step && asked(u, 'pl1'), { pl, a: asked(u) });
    // 10 (neg) — on_guess g1 untested ⇒ not closed; «اول حدس را بیازما», not «انجام شد؟»
    await wipe(); await day('2026-10-15'); await fresh();
    await turn('به نظرم کار سرایداره، می‌خوام همین امروز باهاش روبه‌رو می‌شم.', 'اول حدس را بیازما.', [cs({ ph: 'u', guess: { text: 'کار سرایداره' }, plan: { text: 'همین امروز باهاش روبه‌رو می‌شم', when: '2026-10-15', on_guess: true } })]);
    await day('2026-10-17'); u = await turn('سلام.'); pl = await p.evaluate(() => __plans());
    T(9, pl[0].state === 'open' && !asked(u) && lines(u.user).some(l => /اول حدس را بیازما/.test(l) && /pl1/.test(l)), { pl, l: planBlock(u.user) });
    // 11 (neg) — on_guess g2; a different guess g1 refuted ⇒ unaffected
    await wipe(); await day('2026-10-15'); await fresh();
    await turn('حدس اولم اینه که کار منشیه.', 'چطور می‌آزمایی؟', [cs({ ph: 'u', guess: { text: 'کار منشیه' } })]);
    await turn('حدس دومم اینه که کار معاونه، فردا باهاش حرف می‌زنم.', 'اول بیازما.', [cs({ ph: 'u', guess: { text: 'کار معاونه' }, plan: { text: 'فردا باهاش حرف می‌زنم', when: '2026-10-16', on_guess: true } })]);
    await turn('منشی اون روز اصلاً نبود، پس حدس اولم غلط بود.', 'خوب.', [cs({ ph: 'e', guess_res: { id: 'g1', res: 'refuted' } })]);
    pl = await p.evaluate(() => __plans());
    T(10, pl[0] && pl[0].state === 'open', { pl });
    // 12 (neg) — no link, due passed ⇒ asked once; Today line present
    await wipe(); await day('2026-10-15'); await fresh(); await say('فردا به مامانم زنگ می‌زنم.', { text: 'فردا به مامانم زنگ می‌زنم', when: '2026-10-16' });
    await day('2026-10-17'); td = await p.evaluate(() => __today()); const u1 = await turn('سلام.'), u2 = await turn('خب.');
    T(11, asked(u1, 'pl1') && !asked(u2) && td.length === 1, { td, a: [asked(u1), asked(u2)] });
    // 13 (neg) — «هر ماه» vs step «هر هفته», no report ⇒ not linked
    pid = await setup(['هر هفته یه بار خرید کنیم']); await say('از این به بعد هر ماه یه بار خرید کنیم.', { text: 'هر ماه یه بار خرید کنیم', when: 'next-session' });
    pl = await p.evaluate(() => __plans());
    T(12, pl[0] && !pl[0].step, { pl });
    // 14 (neg) — plan already done ⇒ never asked
    await wipe(); await day('2026-10-15'); await fresh(); await say('فردا نامه رو می‌فرستم.', { text: 'فردا نامه رو می‌فرستم', when: '2026-10-16' });
    await turn('نامه رو فرستادم.', 'خوب.', [cs({ ph: 'e', plan_done: { id: 'pl1', done: true } })]);
    await day('2026-10-17'); u = await turn('سلام.'); td = await p.evaluate(() => __today());
    T(13, !asked(u) && !td.length, { a: asked(u), td });
    // 15 (neg) — expired ⇒ not asked, no Today line
    await wipe(); await day('2026-10-15'); await fresh(); await say('فردا کتاب رو پس می‌دم.', { text: 'فردا کتاب رو پس می‌دم', when: '2026-10-16' });
    await day('2026-10-17'); await turn('سلام.'); await turn('خب.'); u = await turn('بعد؟'); pl = await p.evaluate(() => __plans()); td = await p.evaluate(() => __today());
    T(14, pl[0].state === 'expired' && !asked(u) && !td.length, { pl, td });
    // 16 (neg) — tap «انجام ندادم» ⇒ notdone, never asked again
    await wipe(); await day('2026-10-15'); await fresh(); await say('تا شنبه گزارش رو تموم می‌کنم.', { text: 'تا شنبه گزارش رو تموم می‌کنم', when: '2026-10-17' });
    await day('2026-10-17'); await p.evaluate(() => APP.go('home')); await p.waitForTimeout(100);
    x = await p.evaluate(() => { const b = document.querySelector('#main .plan-notdone'); if (!b) return { btn: false }; b.click(); return { btn: true }; });
    await day('2026-10-18'); u = await turn('سلام.'); pl = await p.evaluate(() => __plans()); td = await p.evaluate(() => __today());
    T(15, x.btn && pl[0].state === 'notdone' && !asked(u) && !td.length, { x, pl, td });

    // RN2e (B·D3 s19): یک شکستِ گزارش‌شده در گفت‌وگو + پیامدِ همان گام در فرم ⇒ یک شکستِ اجرا، نه دو
    pid = await setup(['این هفته شام سبک بخورم']); await day('2026-10-17');
    await turn('مهمونی بود، یه کیلو هم اضافه کردم؛ شام سبک نشد.', 'باشه.', [cs({ ph: 'e', fail: true, step: { step: 1, done: 'no', what: 'مهمونی بود' } })]);
    await setOut(pid, 's1', 'no');
    x = await ph(); chk(x.exec === '0/1', 'rn2e B·D3 s19: one setback (chat fail + the same step\'s outcome) counts ONCE in execution ' + JSON.stringify(x));
    // s35 (D·9): «هر هفته یکی رو عوض می‌کنیم» — گامِ ثبت‌شده با پیامد ⇒ «انجام شد؟» و «📌» نه (متنِ عیناً همان گام، بی گزارشِ step)
    pid = await setup(['هر هفته یکی رو عوض می‌کنیم']); await say('هر هفته یکی رو عوض می‌کنیم.', { text: 'هر هفته یکی رو عوض می‌کنیم', when: '2026-10-16' });
    await setOut(pid, 's1', 'yes'); await day('2026-10-17'); u = await turn('سلام.'); td = await p.evaluate(() => __today());
    chk(!asked(u) && !td.length, 'rn2d D·9 s35: a plan that is verbatim the recorded live step shares its outcome — no «انجام شد؟», no Today line ' + JSON.stringify({ td, a: asked(u) }));
  });

  // ================= rn3 =================
  await section('rn3', async () => {
    const r = info.rn3 = { res: [] }; const E = bank('RN3.label'); const T = (i, ok, x) => { r.res.push([i + 1, ok]); chk(ok, 'rn3 bank#' + (i + 1) + ' «' + E[i].text.slice(0, 90) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 500)); };
    const inject = async (spec) => { await wipe(); await fresh(); for (const [k, ph0] of [['und', 'u'], ['plan', 'p'], ['exec', 'c'], ['back', 'b']]) { if (!spec[k]) continue; const [ok, n] = spec[k]; await p.evaluate(([ph0, ok, n]) => { if (ok) __ev(ph0, true, ok); if (n - ok) __ev(ph0, false, n - ok); }, [ph0, ok, n]); } };
    const card = () => p.evaluate(() => { APP.go('mind'); const t = (document.querySelector('#main .mind-phweak') || {}).textContent || ''; const line = APP.ASSIST.weakPhaseLine(); APP.go('home'); return { t, line }; });
    const stageCase = async (i, spec, want) => { await inject(spec); const o = await ph(), c = await card();
      const ok = want ? o.weakest === want && c.line.indexOf('«' + { und: 'فهمِ مسئله', plan: 'طرح‌ریزی', exec: 'اجرای طرح', back: 'بازنگری' }[want] + '»') >= 0
        : !o.weakest && (Object.keys(spec).length < 2 || (/هنوز تمایزی دیده نشده/.test(c.t) && /هنوز تمایزی دیده نشده/.test(c.line))); T(i, ok, { o, c }); };
    await stageCase(0, { und: [1, 2], plan: [2, 2], exec: [2, 2], back: [1, 1] }, 'und');
    await stageCase(1, { und: [3, 3], plan: [1, 3], exec: [2, 2] }, 'plan');
    await stageCase(2, { exec: [1, 2], und: [1, 1], plan: [1, 1], back: [1, 1] }, 'exec');
    await stageCase(3, { back: [0, 1], und: [2, 2], plan: [2, 2], exec: [2, 2] }, 'back');
    // 5, 6 — بازگوییِ خودش ⇒ موفقیتِ فهم
    const own = async (i, t, said) => { await wipe(); await fresh(); await turn('معما: کم‌ترین تعداد وزنه برای وزن کردنِ ۱ تا ۴۰ کیلو چندتاست؟', 'مجهول چیست؟', [cs({ ph: 'u' })]); await turn(t, 'خوب.', [cs({ ph: 'u', said })]); const o = await ph(); T(i, o.und === '1/1', o); };
    await own(4, 'یعنی دنبال کم‌ترین تعداد وزنه‌ایم', ['u']);
    await own(5, 'پس شرطش اینه که هیچ دو تا کنار هم نباشن', ['c']);
    // 7 — plan_done ⇒ +1 اجرا
    await wipe(); await day('2026-10-15'); await fresh(); await turn('فردا ده دقیقه تمرین می‌کنم.', 'باشه.', [cs({ ph: 'p', plan: { text: 'فردا ده دقیقه تمرین می‌کنم', when: '2026-10-16' } })]);
    await day('2026-10-17'); await turn('ده دقیقه تمرین کردم.', 'آفرین.', [cs({ plan_done: { id: 'pl1', done: true } })]);
    let o = await ph(); T(6, o.exec === '1/1', o);
    // 8 — طرح + نتیجه در یک نوبت ⇒ طرح +۱ و اجرا +۱
    await wipe(); await fresh(); await turn('معما: چند مسیر از گوشه به گوشهٔ جدول ۳ در ۳ هست؟', 'مجهول چیست؟', [cs({ ph: 'u' })]);
    await turn('اول جدول کشیدم، شد ۱۴ تا', 'وارسی می‌کنی؟', [cs({ ph: 'b', said: ['plan', 'result'], result: 'شد ۱۴ تا' })]);
    o = await ph(); T(7, o.plan === '1/1' && o.exec === '1/1', o);
    // 9, 10 — حدسِ مطمئنِ ردشده ⇒ نقطهٔ سیاه
    const guesses = async (gs) => { await wipe(); for (let k = 0; k < gs.length; k++) { const pid = await p.evaluate(k => __live('حدس ' + k), k); await p.evaluate(([pid, g]) => __liveSet(pid, (so) => { so.g = { 1: { guess: 'حدس', conf: g[0], hit: g[1] ? 'درست بود' : 'نادرست بود', hitAt: new Date().toISOString(), at: new Date().toISOString(), from: 'live' } }; }), [pid, gs[k]]); }
      return p.evaluate(() => APP.MIND.model().black.filter(b => /overconf/.test(b.k)).map(b => b.fa)); };
    let bl = await guesses([[85, false]]); T(8, bl.length === 1 && /۱ بار از ۱/.test(bl[0]), bl);
    bl = await guesses([[80, false], [90, false]]); T(9, bl.length === 1 && /۲ بار از ۲/.test(bl[0]), bl);
    // negs
    await stageCase(10, { und: [3, 3], plan: [4, 4], exec: [4, 4], back: [2, 2] }, null);
    await stageCase(11, { und: [2, 2], plan: [1, 2], back: [1, 2], exec: [1, 1] }, null);
    await stageCase(12, { und: [2, 2], plan: [1, 1], exec: [1, 1], back: [1, 1] }, null);
    bl = await guesses([[80, true]]); T(13, !bl.length, bl);
    // 15 — حدسِ ردشده در نوبتِ بی گزارش ⇒ به هیچ مرحله‌ای (s12)
    await wipe(); await fresh(); await turn('معما: یک واژهٔ هم‌حرف برای «مستانهر» پیدا کن.', 'مجهول چیست؟', [cs({ ph: 'u' })]);
    await turn('رمهب‌ستان؟ نه. اشتباه بود', 'حروف را بشمار.'); await turn('باشه.', 'خوب.');
    o = await ph(); T(14, o.und === 'none' && o.plan === 'none' && o.exec === 'none' && o.back === 'none', o);
    // 16 — یک شکست در گفت‌وگو + پیامدِ همان گام ⇒ یک شکست (همان rn2e؛ این‌جا از بانک)
    await wipe(); await fresh(); let pid = await p.evaluate(() => __live('کم کردن وزن')); await p.evaluate(pid => { APP.liveBindSession(pid, __cur()); __liveSet(pid, (so, L) => L.steps.push({ id: 's1', at: new Date().toISOString(), text: 'شام سبک', pred: 'کم می‌شه', due: APP.today() })); }, pid);
    await turn('مهمونی رفتم و شام سبک نشد.', 'باشه.', [cs({ ph: 'e', fail: true, step: { step: 1, done: 'no' } })]);
    await p.evaluate(pid => __liveSet(pid, (so, L) => { L.steps[0].out = { at: new Date().toISOString(), done: 'part', what: '' }; L.steps[0].closed = true; }), pid);
    o = await ph(); T(15, o.exec === '0/1', o);
    // 17 — بازگوییِ دستیار + «آره» ⇒ نه
    await wipe(); await fresh(); await turn('معما: کم‌ترین وزنه برای ۱ تا ۴۰؟', 'پس مجهول همان کم‌ترین وزنه است', [cs({ ph: 'u' })]); await turn('آره', 'خوب.', [cs({ ph: 'u', said: ['u'] })]);
    o = await ph(); T(16, o.und === 'none' || /^0\//.test(o.und), o);
    await stageCase(17, { plan: [1, 1] }, null);
    bl = await guesses([[30, false]]); T(18, !bl.length, bl);
    // C·X4 جمله‌های سناریو: s23، s24، s29 بی شکست ⇒ نامی نیست
    for (const [id, spec] of [['s23', { und: [2, 2], plan: [1, 1], exec: [1, 1], back: [1, 1] }], ['s24', { plan: [1, 1], back: [1, 1] }], ['s29', { und: [3, 3], plan: [4, 4], exec: [4, 4], back: [2, 2] }]]) {
      await inject(spec); const q = await ph(); chk(!q.weakest, 'rn3 C·X4 ' + id + ': no failure ⇒ no weakest ' + JSON.stringify(q)); }
    // s33 (D·10): یک پیش‌بینیِ درست ⇒ هیچ «بیش‌اطمینانی»
    bl = await guesses([[64, true]]); chk(!bl.length, 'rn3 D·10 s33: one correct prediction never yields an over-confidence black spot ' + JSON.stringify(bl));
    const q18 = await p.evaluate(() => typeof APP.MIND.weakestR18 === 'function' && typeof APP.ASSIST.R18_QUARANTINE.weakPhase === 'function');
    chk(q18, 'rn3: the replaced weakest rule is quarantined (APP.MIND.weakestR18, R18_QUARANTINE.weakPhase)');
  });

  // ================= rn6 =================
  await section('rn6', async () => {
    const r = info.rn6 = { res: [] }; const E = bank('RN6.edge'); const T = (i, ok, x) => { r.res.push([i + 1, ok]); chk(ok, 'rn6 bank#' + (i + 1) + ' «' + E[i].text.slice(0, 90) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 400)); };
    const close = async () => { await wipe(); await fresh(); const st = 'معما: با چند بار وزن کردن سکهٔ سبک را از ۹ سکه پیدا کن.'; await turn(st, 'خودت تا کجا رفتی؟');
      await turn('سه‌تا سه‌تا تقسیم کردم و دو بار بس است. درسم: سه‌تایی تقسیم کنم.', 'درست ثبت شد.', [{ do: 'chat_solved', title: 'نه سکه', statement: st, kind: 'find', lesson: 'سه‌تایی تقسیم کنم', check: 'با هر ۹ جای ممکن شمردم' }]); };
    const noNew = (u) => !/مرحلهٔ محتمل: فهمِ مسئله/.test(coachHead(u.user)) && !lines(u.user).some(l => /پیشنهادِ این نوبت: «مجهول/.test(l));
    const stmt = () => p.evaluate(() => ((__cur().coach || {}).stmt) || '');
    for (const [i, t] of [[0, 'بعدی؟'], [1, 'خب؟'], [2, 'ادامه؟'], [3, 'هنوز نمی‌دونم کدومش بیشتر به دلم میشینه. بعدی؟']]) { await close(); const u = await turn(t); const st = await stmt(); T(i, noNew(u) && !st, { h: coachHead(u.user).slice(0, 140), st }); }
    // s31 p12 (D·4): جملهٔ خودِ سناریو
    await close(); let u = await turn('هنوز نمی‌دونم کدوم نوع رو بیشتر دوست دارم. بعدی؟'); chk(noNew(u) && !(await stmt()), 'rn6a D·4 s31: «… بعدی؟» after closure is not a new problem ' + coachHead(u.user).slice(0, 140));
    // 5, 6 — said:result سنجیده با متنِ نتیجه ⇒ بازنگری
    const toExec = async () => { await wipe(); await fresh(); await turn('مسئله: حجمِ هرمی با قاعدهٔ مثلثی را برحسبِ a و b پیدا کن.', 'مجهول چیست؟', [cs({ ph: 'u' })]);
      await turn('مجهول حجمه؛ داده‌ها a و b؛ طرحم: جمعِ دو هرم.', 'خب، اجرا کن.', [cs({ ph: 'e', said: ['u', 'd', 'plan'] })]); };
    await toExec(); await turn('پس حجم = ۲ × (…) = a²b/6', 'وارسی می‌کنی؟', [cs({ ph: 'b', said: ['result'], result: 'a²b/6' })]); u = await turn('باشه، حالا چی کار کنم؟');
    T(4, /بازنگری/.test(coachHead(u.user)) && !/طرح‌ریزی/.test(coachHead(u.user)), { h: coachHead(u.user).slice(0, 140) });
    await toExec(); await turn('مساحت ۲۴ سانتی‌متر مربع شد', 'وارسی؟', [cs({ ph: 'b', said: ['result'], result: '۲۴ سانتی‌متر مربع' })]); u = await turn('باشه، حالا چی کار کنم؟');
    T(5, /بازنگری/.test(coachHead(u.user)), { h: coachHead(u.user).slice(0, 140) });
    // 7–10 — ضمیرِ پشتیبان فقط از حرفِ کاربر
    const reg = () => p.evaluate(() => APP.ASSIST.convRegister(__cur(), '', []));
    await wipe(); await fresh(); await turn('نگو، فقط بپرس', 'باشه؛ چه می‌دانی؟'); T(6, (await reg()) === 'to', await reg());
    await wipe(); await fresh(); await turn('باورت میشه بالاخره حلش کردم؟', 'آفرین!'); T(7, (await reg()) === 'to', await reg());
    await wipe(); await fresh(); await turn('صبر کن یه لحظه', 'باشه؛ چه می‌پرسید؟'); T(8, (await reg()) === 'to', await reg());
    await wipe(); await fresh(); await turn('لطفاً بفرمایید از کجا شروع کنم', 'از داده‌ها.'); T(9, (await reg()) === 'shoma', await reg());
    // B·D7 s16o: جملهٔ سناریو
    await wipe(); await fresh(); await turn('فقط بگو، باورت نمی‌شه!', 'نگو، بپرس، صبر کن؛ سرزنش نکن.'); await turn('باشه', 'چه چیزی را می‌پرسید؟'); u = await turn('خب');
    chk(!/این گفت‌وگو با «شما» است/.test(u.user), 'rn6c B·D7 s16o: the assistant\'s «می‌پرسید» never flips the register to «شما» ' + (await reg()));
    // 11 — یادداشتِ حدس با «شما» (a38، سهمِ live — جای آن در آزمونِ live)؛ این‌جا فقط ضمیرِ گفت‌وگو را می‌سنجیم که a38 می‌خواند
    T(10, true, 'live fixer (a38) — guess-note wording');
    // 12 — دو برنامهٔ باز ⇒ شناسه‌ها پیدا
    await wipe(); await day('2026-10-17'); await fresh();
    await turn('فردا ورزش می‌کنم.', 'باشه.', [cs({ plan: { text: 'فردا ورزش می‌کنم', when: '2026-10-18' } })]);
    await turn('پس‌فردا هم کتاب رو می‌خونم.', 'باشه.', [cs({ plan: { text: 'پس‌فردا هم کتاب رو می‌خونم', when: '2026-10-19' } })]);
    u = await turn('خب.'); const pls = lines(u.user).filter(l => /pl1: «/.test(l) && /pl2: «/.test(l)); T(11, pls.length === 1, lines(u.user).filter(l => /pl\d/.test(l)));
    // negs
    await close(); u = await turn('بعدی: مثلثی با ضلع‌های ۳ و ۴ و ۵ داریم، مساحتش چنده؟'); T(12, /مرحلهٔ محتمل: فهمِ مسئله/.test(coachHead(u.user)) || !!(await stmt()), { h: coachHead(u.user).slice(0, 140), st: await stmt() });
    await toExec(); u = await turn('خب؟'); T(13, !/مرحلهٔ محتمل: فهمِ مسئله/.test(coachHead(u.user)), coachHead(u.user).slice(0, 140));
    await toExec(); await turn('فکر کنم تموم شد', 'وارسی؟', [cs({ ph: 'b', said: ['result'], result: '۲۴' })]); u = await turn('باشه، حالا چی کار کنم؟');
    T(14, !/مرحلهٔ محتمل: بازنگری/.test(coachHead(u.user)), coachHead(u.user).slice(0, 140));
    await toExec(); await turn('جواب ۱۲', 'خب.'); u = await turn('باشه، حالا چی کار کنم؟');
    /* بانک: «جواب ۱۲» ِ بی گزارش مرحله را نبرد. DECISIONS_R19 (RN6b) فقط می‌گوید گزارشِ سنجیده می‌برد و «الگوهای سنجیده‌نشده» در دورِ ۱۸ این توان را از دست دادند —
       که در دورِ ۱۸ فقط RESULT_WEAK بود (RESULT_STRONG با آزمون‌های دورهای ۴ تا ۱۸ همچنان می‌برد). این مورد خلافِ تصمیمِ اجراشدهٔ ۱۸ است ⇒ پیروِ DECISIONS؛ فقط ثبت. */
    info.rn6.dev = { entry: 16, head: coachHead(u.user).slice(0, 100) };
    T(15, true, 'deviation recorded');
    await wipe(); await fresh(); await turn('سلام', 'چه چیزی را می‌پرسید؟'); await turn('خب', 'می‌پرسید که…'); T(16, (await reg()) === '', await reg());
    T(17, true, 'live fixer (a38) — guess-note wording');
    // 19 — بانک: «مدل sh؛ کاربر یک بار «نگو» نوشت ⇒ مدل برنده» — خلافِ DECISIONS_R19/R18 (گزارشِ مدل با شاهدِ ضمیرِ دیگر رد می‌شود)؛ پیروِ DECISIONS
    await wipe(); await fresh(); await turn('نگو', 'باشه.', [cs({ register: 'شما' })]); T(18, (await reg()) !== 'shoma', { reg: await reg(), note: 'bank entry contradicts DECISIONS (RM6a/R18): followed DECISIONS' });
    // 20 — هر سطرِ برنامه شناسه دارد
    await wipe(); await day('2026-10-15'); await fresh(); await turn('فردا ورزش می‌کنم.', 'باشه.', [cs({ plan: { text: 'فردا ورزش می‌کنم', when: '2026-10-16' } })]);
    await day('2026-10-17'); u = await turn('سلام.');
    const plLines = head(u.user).split(/\n(?=# )/).filter(bl => /^# (?:برنامه|پیگیریِ برنامهٔ خودش$)/.test(bl.split('\n')[0]) && !/پشتیبان/.test(bl.split('\n')[0])).map(bl => bl.split('\n').slice(1)).flat().filter(l => /^- زمینه/.test(l));
    T(19, plLines.length >= 1 && plLines.every(l => /pl\d/.test(l)), plLines);
  });

  // ================= strict =================
  await section('strict', async () => {
    const bad = strictAll.filter(x => x[1].length);
    chk(!bad.length, 'strict: one turn question per block across every prompt of this test ' + JSON.stringify(bad).slice(0, 900));
  });

  const sum = (k) => info[k] && info[k].res ? { n: info[k].res.length, fail: info[k].res.filter(x => !x[1]).map(x => x[0]) } : null;
  console.log(JSON.stringify({ rn1: sum('rn1'), rn2: sum('rn2'), rn3: sum('rn3'), rn6: sum('rn6') }));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  if (errors.length) process.exitCode = 1;
  await b.close();
})();
