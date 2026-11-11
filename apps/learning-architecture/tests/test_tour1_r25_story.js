// تورِ پولیا (دستهٔ ۱، دورِ ۲۵، سهمِ «story» — ۲۰۲۶-۱۱-۱۱) — DECISIONS_R25: P5 «یک مرحله، یک مسئله» + مانده‌هایی که خودش نام می‌برد.
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۵ — bp2 p5/p7 و pwB1 p4 (B25·D9 = U10 نتیجهٔ میانی ⇒ «بازنگری»)، oB1 p22 (B25·D12 = U13 مسئلهٔ دوم دادهٔ اولی شد)،
//           oA1 p6–p18 (A25-16 مرحلهٔ مسئلهٔ قبلی به مسئلهٔ تازه)، tA1 p13 / pwB1 p7 / s25 p13 (A25-19، B25·D20، C25-6 دو منبعِ مرحله)، s25 p12 (C25-5 u0 برای مسئلهٔ بیدارشده)،
//           aC4 p4 (C25-10 «اجرا» پیش از طرح)، aA4 p5 و s10 p5 (ماندهٔ A23-35)، oD1 c40 (ماندهٔ D24-9 گامِ طرح = «تا پس‌فردا انجامش میدم»)
//  bank     هر ورودیِ P5 در بانکِ مستقلِ tests/variants/VARIANTS_R25.json (اگر هست؛ رفتارِ محضِ مدل یا سهمِ سازوکارِ دیگر با دلیل در info.nc)
//  clock    روزِ صفحه منجمد است (APP.today)؛ هیچ انتظاری به تاریخِ تقویم بسته نیست
// LLA_FILE = ساختِ دیگر (برای «قرمزِ نخست»: ساختِ BASE25)؛ ONLY=bp2,pwB1,oB1,oA1,one,woke,aC4,aA4,s10,oD1,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BF = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R25.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R25.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f));
const BANK = BF ? JSON.parse(fs.readFileSync(BF, 'utf8')) : [];

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
  const T0 = '2026-11-11';   // روزِ منجمدِ صفحه (هیچ انتظاری به آن بسته نیست)
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
      const n0 = __calls.length; __q.push(R({ reply: reply || 'باشه.', actions: actions || [] }));
      await APP.ASSIST.send(text); __q.length = 0;
      const all = __calls.slice(n0), c = all.filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {};
      return { user: c.user || '', task: c.task || '', n: all.length };
    };
    window.__fresh = (view) => { APP.go(view || 'home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__live = (title, st, extra) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', Object.assign({ by: 'user' }, extra || {})); return r.p.id; };
    window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {};
      ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L); APP.S.put(pg); };
    window.__L = (pid) => { const pg = APP.S.get('eprog_' + pid); return pg && pg.solve && pg.solve.live ? JSON.parse(JSON.stringify(pg.solve.live)) : null; };
    window.__M = (id) => { const M = APP.ROUTE.model(id); if (!M) return null; return { origin: M.origin, dest: M.dest, now: M.nowFa, remain: M.remain, pts: M.pts.map(q => ({ k: q.k, t: q.title, lines: q.lines })) }; };
  }, T0);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const turn = (text, reply, actions) => p.evaluate(([t, r, a]) => __turn(t, r, a), [text, reply || '', actions || []]);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const Lv = (pid) => p.evaluate((pid) => __L(pid), pid);
  const Mo = (id) => p.evaluate((id) => __M(id), id);
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const nat = { role: 'self', nat: 'practical', stuck: false, fail: false };
  const csn = (o) => cs(Object.assign({}, nat, o));
  const bind = async (title, stmt) => p.evaluate(([t, stmt]) => { const pid = __live(t, stmt); APP.liveBindSession(pid, __cur()); __liveSet(pid, () => {}); return pid; }, [title, stmt]);
  const lcq = (pid, t) => p.evaluate(([pid, t]) => { const c = APP.liveCoach(pid, { turn: { text: t || 'باشه' } }); return { q: c.q || '', src: c.src || '', ph: c.ph }; }, [pid, t]);
  const WQ = await p.evaluate(() => APP.liveWholeQ);
  const blockLine = (u) => (head(u).split('\n').filter(l => /^# مسئلهٔ زندهٔ این سشن/.test(l))[0] || '');
  const coachHead = (u) => (head(u).split('\n').filter(l => /^# مربیِ حل/.test(l))[0] || '');
  const nowLine = (u) => { const L = head(u).split('\n'), i = L.findIndex(l => /^# وضعِ کنونی/.test(l)); return i < 0 ? '' : L[i + 1] || ''; };
  const stageOf = (l) => ((/مرحله(?:ٔ محتمل)?: ([^·—(]+)/.exec(l) || [])[1] || '').trim();
  const story = () => p.evaluate(() => { const s = __cur(); return JSON.parse(JSON.stringify((s.coach || {}).story || {})); });
  const items = async (key) => { const st = await story(); const k = key || Object.keys(st).pop(); return (st[k] || { items: [] }).items; };
  const coach = () => p.evaluate(() => { const C = __cur().coach || {}; return { ph: C.ph, pk: C.pk, stmt: C.stmt, lprob: __cur().lprob || '' }; });
  const sph = (pid) => p.evaluate((pid) => ({ form: APP.livePhase(pid), story: APP.liveStoryPhase(pid), turn: APP.liveTurnPhase(pid) }), pid);
  const liveOf = (sid) => p.evaluate((sid) => { const r = APP.S.all('eprob').filter(x => x.sess === sid).pop(); return r ? r.p.id : ''; }, sid);
  const LOOK = /بازنگری/;

  // ================= runners — B25·D9 = U10 (bp2 p5, p7): نتیجهٔ میانی کلِ مسئله را به «بازنگری» نمی‌برد (مسئلهٔ گفت‌وگو) =================
  await section('bp2', async () => {
    await wipe(); await fresh();
    await turn('سلام. پشت‌بوم انبارم ۵۰ متر مربعه. می‌خوام آب بارون رو جمع کنم برای آبیاری درختای جوون پسته.', 'خوب.', [csn({ ph: 'u', said: ['d'] })]);
    await turn('بارش سالانه‌ی اینجا حدود ۱۵۰ میلی‌متره. می‌خوام بدونم در سال چقدر آب از این پشت‌بوم جمع می‌شه، و دو تا بشکه‌ی ۲۲۰ لیتری که دارم بسه یا باید بیشتر بخرم.', 'خوب.', [csn({ ph: 'u', said: ['u', 'd'] })]);
    await turn('خب حجم میشه سطح ضرب در ارتفاع بارون دیگه: ۵۰ × ۱۵۰ = ۷۵۰۰. ولی ۷۵۰۰ چی؟ لیتر؟ متر مکعب؟ متر و میلی‌متر رو که نمی‌شه ضرب کرد... اینجاش رو نمی‌دونم.', 'خوب.', [csn({ ph: 'e', said: [], stuck: true })]);
    const M4 = 'یعنی ۱۵۰ میلی‌متر رو متر کنم؟ یه متر صد میلی‌متره دیگه، پس میشه ۱.۵ متر. ۵۰ × ۱.۵ = ۷۵ متر مکعب! عجب، پس کلی آب جمع میشه. ولی متر مکعب رو نمی‌دونم چند لیتره.';
    await turn(M4, 'خوب.', [csn({ ph: 'b', said: ['result'], result: '۵۰ × ۱.۵ = ۷۵ متر مکعب' })]);
    let C = await coach(); chk(C.ph !== 'b', 'B25·D9 (bp2 p5 «مرحلهٔ محتمل: بازنگری» after the intermediate m³): the chat stage is not look-back after «… = ۷۵ متر مکعب! … ولی متر مکعب رو نمی‌دونم چند لیتره» :: ' + JSON.stringify(C));
    let t = await turn('نه بابا، ۱.۵ متر یعنی تا سینه‌ی آدم! اینجا خشکه. پس اشتباه کردم. ولی راستش دقیق یادم نیست یه متر چند میلی‌متره، مدرسه خیلی وقت پیش بود. فکر می‌کردم صدتاست.', 'خوب.', [csn({ ph: 'e', said: [], stuck: true })]);
    chk(!LOOK.test(stageOf(coachHead(t.user))), 'bp2 p5: the coach header of the next turn does not say «مرحلهٔ محتمل: بازنگری» :: ' + coachHead(t.user).slice(0, 160));
    chk(!LOOK.test(nowLine(t.user)), 'bp2 p5: «# وضعِ کنونی» does not say «بازنگری» :: ' + nowLine(t.user));
    await turn('آهان، صد ضرب در ده، میشه هزار میلی‌متر. پس ۱۵۰ میلی‌متر میشه ۰.۱۵ متر. ۵۰ × ۰.۱۵ = ۷.۵ متر مکعب. حالا این چند لیتره؟ اینو دیگه واقعاً نمی‌دونم.', 'خوب.', [csn({ ph: 'b', said: ['result'], result: '۵۰ × ۰.۱۵ = ۷.۵ متر مکعب' })]);
    C = await coach(); chk(C.ph !== 'b', 'B25·D9 (bp2 p7): «… = ۷.۵ متر مکعب. حالا این چند لیتره؟ اینو دیگه واقعاً نمی‌دونم» is a sub-result :: ' + JSON.stringify(C));
    const its = await items(); chk(its.filter(x => x.k === 'res').every(x => x.fin === false), 'both results are stored as intermediate (fin:false) :: ' + JSON.stringify(its.filter(x => x.k === 'res')));
    t = await turn('ده تا در طول، ده تا در عرض، ده تا در ارتفاع... هزارتا! پس هر متر مکعب هزار لیتره و ۷.۵ متر مکعب میشه ۷۵۰۰ لیتر. دو تا بشکه‌ی ۲۲۰ لیتری که فقط ۴۴۰ لیتره! خیلی کمه.', 'خوب.', [csn({ ph: 'b', said: ['result'], result: '۷.۵ متر مکعب میشه ۷۵۰۰ لیتر' })]);
    chk(!LOOK.test(stageOf(coachHead(t.user))), 'bp2 p7: header before the whole answer is not look-back :: ' + coachHead(t.user).slice(0, 160));
    C = await coach(); chk(C.ph === 'b', 'the whole answer (no remainder named, no open ledger) still moves the chat problem to look-back :: ' + JSON.stringify(C));
  });

  // ================= runners — B25·D9 (pwB1 p4): نتیجهٔ گامِ ۳ ِ کارِ پیشین، با گام‌های ۴ و ۵ ِ هنوز نادرست ⇒ نه «بازنگری» =================
  await section('pwB1', async () => {
    await wipe(); await fresh();
    const P1 = 'سلام. من نگارم، مهندس تأسیساتم. برای باغِ پدرم می‌خوام یه پمپ خورشیدی بذارم که آبِ چاه رو ببره تو منبعِ روی بام. خودم حسابش رو کردم، می‌خوام ببینی درسته یا نه.\nگامِ ۱: جرمِ آب: ۲ متر مکعب = ۲۰۰۰ کیلوگرم.\nگامِ ۲: انرژی: E = mgh = 2000 × 9.81 × 15 = 294300 ژول = ۲۹۴٫۳ کیلوژول = ۰٫۲۹ کیلووات‌ساعت.\nگامِ ۳: با بازده ۵۰٪: ۰٫۲۹ ÷ ۰٫۵ = ۰٫۵۸ کیلووات‌ساعت.\nگامِ ۴: توانِ پمپ: 294300 ÷ 1200 ÷ ۰٫۵ = ۴۹۰ وات.\nگامِ ۵: پنل: ۰٫۵۸ ÷ ۴٫۵ = ۰٫۱۳ کیلووات، پس یه پنلِ ۱۵۰ واتی بسه.';
    await turn(P1, 'خوب.', [csn({ ph: 'e', said: ['d'], prior: [
      { step: 1, quote: 'جرمِ آب: ۲ متر مکعب = ۲۰۰۰ کیلوگرم', verdict: 'ok', why: 'درست' },
      { step: 2, quote: '294300 ژول = ۲۹۴٫۳ کیلوژول = ۰٫۲۹ کیلووات‌ساعت', verdict: 'wrong', why: 'تبدیلِ کیلوژول به کیلووات‌ساعت', cause: 'skill' },
      { step: 3, quote: '۰٫۲۹ ÷ ۰٫۵ = ۰٫۵۸ کیلووات‌ساعت', verdict: 'wrong', why: 'وابسته به گامِ ۲', dep: [2], cause: 'skill' },
      { step: 4, quote: '294300 ÷ 1200 ÷ ۰٫۵ = ۴۹۰ وات', verdict: 'ok', why: 'درست' },
      { step: 5, quote: '۰٫۵۸ ÷ ۴٫۵ = ۰٫۱۳ کیلووات، پس یه پنلِ ۱۵۰ واتی بسه', verdict: 'wrong', why: 'وابسته به گامِ ۳', dep: [3], cause: 'skill' }] })]);
    await turn('آهان، کیلووات‌ساعت یعنی ۱۰۰۰ وات ضربدر ۳۶۰۰ ثانیه. پس 294300 ÷ 3600000 = 0.082 کیلووات‌ساعت. گامِ ۳ هم میشه ۰٫۰۸۲ ÷ ۰٫۵ = ۰٫۱۶۴ کیلووات‌ساعت.', 'خوب.', [csn({ ph: 'b', said: ['result'], result: 'گامِ ۳ هم میشه ۰٫۰۸۲ ÷ ۰٫۵ = ۰٫۱۶۴ کیلووات‌ساعت' })]);
    const C = await coach(); chk(C.ph !== 'b', 'B25·D9 (pwB1 p4 «مرحله: بازنگری» after a step-3 result): with step 5 of her prior ledger still not ✓ the stage is not look-back :: ' + JSON.stringify(C));
    const t = await turn('پس پنل: ۰٫۱۶۴ ÷ ۴٫۵ = ۰٫۰۳۶ کیلووات، یعنی ۳۶ وات! پس حتی یه پنلِ ۵۰ واتی هم بسه؟', 'خوب.', [csn({ ph: 'e', said: [] })]);
    chk(!LOOK.test(stageOf(coachHead(t.user))) && !LOOK.test(nowLine(t.user)), 'pwB1 p4: neither the header nor «# وضعِ کنونی» says «بازنگری» :: ' + JSON.stringify([coachHead(t.user).slice(0, 140), nowLine(t.user)]));
  });

  // ================= runners — B25·D12 = U13 (oB1 p22، بانکِ مالک #16): مسئلهٔ دوم وسطِ گفت‌وگوی مسئلهٔ زنده دادهٔ اولی نمی‌شود =================
  await section('oB1', async () => {
    await wipe(); const sid = await fresh();
    const pid = await bind('بیداریِ ساعت ۶', 'هفته‌ای پنج روز از هفت روز صبح زود ساعت ۶ بیدار شم و یه ساعت مطالعه کنم؛ الان فقط دو روز موفق میشم. چطور برسم به پنج روز؟');
    await turn('دو روز موفق، شب قبلش ساعت ۱۱ خوابیده بودم و گوشی رو گذاشته بودم آشپزخونه.', 'خوب.', [csn({ ph: 'u', said: ['d'] })]);
    const M0 = await Mo(pid), n0 = M0.pts.length;
    const NP = 'راستی یه مسئله‌ی دیگه هم دارم که به همین بیداری ربط داره ولی جداست: شب‌ها شام رو ساعت ۱۰ می‌خوریم و بعدش خوابم نمی‌بره. می‌خوام اینم حل کنم.';
    const t = await turn(NP, 'خوب.', [csn({ ph: 'u', said: ['d'] })]);
    const M1 = await Mo(pid), its = await items('L:' + pid), C = await coach();
    chk(!M1.pts.some(q => /شام|خوابم نمی‌بره/.test([q.t].concat(q.lines || []).join(' '))), 'B25·D12 (oB1 p22 «داده (از گفت‌وگو)» on the wake-up problem\'s 🧭): the dinner problem is not a point of the wake-up route :: ' + JSON.stringify(M1.pts.slice(n0)));
    chk(!its.some(x => /شام/.test(x.t)), 'no story item of the wake-up problem holds the dinner sentence :: ' + JSON.stringify(its.map(x => x.k + ':' + x.t.slice(0, 40))));
    chk(!/بیداریِ ساعت ۶/.test(nowLine(t.user)) || /شام/.test(nowLine(t.user)), 'B25·D12 («# وضعِ کنونی» keeps the old problem): the status line of the same turn is about the new problem :: ' + nowLine(t.user));
    chk(/^c:/.test(String(C.pk)) && /شام/.test(String(C.stmt)) && !C.lprob, 'the new problem is its own chat problem (own pk, own statement, session no longer bound to the wake-up problem) :: ' + JSON.stringify(C));
    chk(/# دو مسئله در این گفت‌وگو/.test(head(t.user)) && head(t.user).indexOf(pid) >= 0, 'the prompt tells the model the two problems are kept apart (with the first one\'s route id) :: ' + (head(t.user).match(/# دو مسئله[^\n]*\n[^\n]*/) || [''])[0].slice(0, 200));
    const r1 = await p.evaluate((pid) => { const r = APP.liveRec(pid); return { open: APP.livePhase(pid) !== 'done', stmt: r.p.statement }; }, pid);
    chk(r1.open && !/شام/.test(r1.stmt), 'the first problem stays open and untouched :: ' + JSON.stringify(r1));
    // owner bank #16: «حالا که دو تا مسئله شد، از کجا بفهمم نقشه … مالِ کدوم مسئله‌ست؟»
    const t2 = await turn('حالا که دو تا مسئله شد، از کجا بفهمم نقشه‌ی مسیر و پرونده و کارنامه‌ی ذهن هر کدوم مالِ کدوم مسئله‌ست و قاطی نمیشن؟', 'خوب.', []);
    chk(/# دو مسئله در این گفت‌وگو/.test(head(t2.user)), 'bank #16: the two-problems block is still there on her question :: ' + head(t2.user).slice(0, 80));
    const MS = await Mo(sid);
    chk(MS && /شام|خوابم/.test(String(MS.origin) + String(MS.dest)) && !MS.pts.some(q => /آشپزخونه|ساعت ۱۱ خوابیده/.test([q.t].concat(q.lines || []).join(' '))), 'the new problem has its own route (session id), without the first problem\'s points :: ' + JSON.stringify(MS && { o: MS.origin, d: MS.dest, n: MS.pts.length }));
    // a plain mention of «مسئله» without a new one never splits
    await wipe(); await fresh(); const pid2 = await bind('بیداریِ ساعت ۶', 'هفته‌ای پنج روز صبح زود ساعت ۶ بیدار شم؛ الان فقط دو روز موفق میشم. چطور برسم به پنج روز؟');
    await turn('این مسئله یه بخشِ دیگه هم داره: آخرِ هفته‌ها مهمون داریم و دیر می‌خوابم.', 'خوب.', [csn({ ph: 'u', said: ['d'] })]);
    const C2 = await coach(); chk(C2.lprob === pid2, 'control: «این مسئله یه بخشِ دیگه هم داره» stays with the bound problem :: ' + JSON.stringify(C2));
  });

  // ================= runners — A25-16 (oA1 p6–p18): مسئلهٔ تازه مرحله و نتیجهٔ مسئلهٔ قبلیِ همان گفت‌وگو را نمی‌گیرد =================
  await section('oA1', async () => {
    await wipe(); const sid = await fresh();
    await turn('سلام. یه مسئله‌ست که از دیشب ذهنمو درگیر کرده: تو یه مهمونیِ ۱۰ نفره هر کس با هر کس دقیقاً یه بار دست داده. چند تا دست‌دادن شده؟ و اگه n نفر باشن چی؟ حدسِ اولم ۱۰۰ بود ولی حس می‌کنم غلطه.', 'خوب.', [csn({ ph: 'u', said: ['u', 'd'], nat: 'objective' })]);
    await turn('با ۳ نفر: الف‌ب، الف‌ج، ب‌ج — ۳ تا. پس دو جا اشتباه کردم: هر کس با خودش دست نمی‌ده، پس ۳ × ۲ = ۶؛ و هر دست‌دادن رو دو بار شمردم، پس ۶ ÷ ۲ = ۳. برای ۱۰ نفر: ۱۰ × ۹ ÷ ۲ = ۴۵.', 'خوب.',
      [csn({ ph: 'e', said: ['result'], result: 'برای ۱۰ نفر: ۱۰ × ۹ ÷ ۲ = ۴۵', nat: 'objective', prior: [{ step: 1, quote: '۳ × ۲ = ۶', verdict: 'ok', why: 'درست' }, { step: 2, quote: '۶ ÷ ۲ = ۳', verdict: 'ok', why: 'درست' }, { step: 3, quote: '۱۰ × ۹ ÷ ۲ = ۴۵', verdict: 'ok', why: 'درست' }] })]);
    await turn('برای n نفر: n(n−1)/2. ولی بذار یه لحظه یه چیزِ دیگه بپرسم که الان مهم‌تره: یه پیشنهادِ کار از یه شرکتِ دیگه دارم، حقوقش ۳۰٪ بیشتره ولی باید از تیمی که خودم ساختم جدا شم. تا پنج‌شنبه باید جواب بدم. اینو هم می‌شه همین‌جا با همین روش فکر کرد؟', 'می‌شود.',
      [csn({ ph: 'b', said: ['result'], result: 'برای n نفر: n(n−1)/2', nat: 'objective' })]);
    await turn('ثبتش کن. در یک جمله: بین «بمونم و تیمی که ساختم رو به جایی برسونم» و «برم با حقوقِ ۳۰٪ بیشتر و یه محیطِ تازه» انتخاب می‌کنم.', 'ثبت شد.',
      [{ do: 'live_new', title: 'پیشنهادِ کار یا تیمِ خودم', statement: 'یه پیشنهادِ کار از یه شرکتِ دیگه دارم، حقوقش ۳۰٪ بیشتره ولی باید از تیمی که خودم ساختم جدا شم. تا پنج‌شنبه باید جواب بدم. بمونم یا برم؟', nat: 'life' }, csn({ ph: 'u', said: ['u'], nat: 'life' })]);
    const pid = await liveOf(sid); chk(!!pid, 'oA1: the job decision became a live problem');
    const L = await Lv(pid), ph = await sph(pid), M = await Mo(pid);
    chk(!(L.chatImpItems || []).some(x => /n\(n−1\)|دست/.test(x.t)), 'A25-16 / A23-32 (oA1 🧭 «نتیجه: برای n نفر: n(n−1)/2» از پیامِ مشترک): the handshake result of the shared message is not imported into the job decision :: ' + JSON.stringify((L.chatImpItems || []).map(x => x.k + ':' + x.t.slice(0, 40))));
    chk(!L.prior, 'the «همه درستِ» handshake ledger is not the job decision\'s prior work');
    chk(ph.turn !== 'c' && ph.turn !== 'b' && ph.story !== 'c', 'A25-16 (oA1 p6–p18 «مرحله: اجرا روی واقعیت» پیش از هر کار): the fresh decision is not in «اجرا» :: ' + JSON.stringify(ph));
    chk(M && !M.pts.some(q => /n\(n−1\)/.test([q.t].concat(q.lines || []).join(' '))), '🧭 of the decision has no handshake point :: ' + JSON.stringify(M && M.pts.map(q => q.t)));
    const t = await turn('یعنی محصولی که ساختیم به ۱۰ هزار کاربرِ فعال برسه و یکی از بچه‌ها بتونه جای من رو بگیره.', 'خوب.', [csn({ ph: 'u', said: ['c'], nat: 'life' })]);
    chk(!/اجرا/.test(stageOf(blockLine(t.user))) && !/آنچه شد با پیش‌بینی‌ات/.test(head(t.user)), 'oA1 p6: no «اجرا روی واقعیت» and no e4 card «آنچه شد با پیش‌بینی‌ات چه فاصله‌ای داشت؟» before any work :: ' + blockLine(t.user).slice(0, 160));
  });

  // ================= runners — A25-19 (tA1 p13)، B25·D20 (pwB1 p7، aB3 p11–p14)، C25-6 (s25 p13): یک منبعِ مرحله در یک پرامپت =================
  await section('one', async () => {
    await wipe(); await fresh();
    const pid = await bind('پس‌انداز و سپرده', '۳۰۰ میلیون تومن پس‌انداز دارم. حقوقِ بازنشستگی‌ام ماهی ۱۸ میلیونه ولی خرجِ ماهانه‌مون حدود ۲۱ میلیونه. می‌خوام بدونم این پس‌انداز تا کی دووم میاره.');
    await turn('یعنی: با این پس‌انداز و این حقوق، کِی پولم تموم میشه و چیکار کنم که دیرتر تموم شه.', 'خوب.', [csn({ ph: 'u', said: ['u'] })]);
    await turn('طرحم اینه: ۲۵۰ رو می‌ذارم سپرده‌ی یک‌ساله، ۵۰ دم دست، و هر شش ماه یه بار دوباره همین حساب رو با عددای واقعی می‌کنم.', 'خوب.', [csn({ ph: 'e', said: ['plan'], plan: { text: '۲۵۰ رو می‌ذارم سپرده‌ی یک‌ساله، ۵۰ دم دست، و هر شش ماه یه بار دوباره همین حساب رو با عددای واقعی می‌کنم' } })]);
    const ph = await sph(pid); chk(ph.form === 'u' && ph.turn === 'c', 'setup: form stage «فهم», story stage «اجرا» :: ' + JSON.stringify(ph));
    const t = await turn('خب، بعدش چی؟', 'خوب.', []);
    const a = stageOf(nowLine(t.user)), bL = stageOf(blockLine(t.user));
    chk(/اجرا/.test(a) && /اجرا/.test(bL) && !/فهم/.test(nowLine(t.user)), 'B25·D20 / A25-19 / C25-6 («# وضعِ کنونی … مرحله: فهمِ مسئله» و «# مسئلهٔ زنده … مرحله: اجرا روی واقعیت» در یک پرامپت): both say the same stage :: ' + JSON.stringify([nowLine(t.user), blockLine(t.user).slice(0, 120)]));
  });

  // ================= runners — C25-5 (s25 p12): مسئلهٔ بیدارشده‌ای که خودش در بازنگری ساخت u0 نمی‌پرسد =================
  await section('woke', async () => {
    await wipe(); await fresh();
    const pid = await p.evaluate(() => { const pid = __live('الگوی ۱/(k(k+1)(k+2))', 'S(n) = ۱/(1·2·3) + ۱/(2·3·4) + … + ۱/(n(n+1)(n+2)). حدسم اینه که میشه ۱/۴ − ۱/(2(n+1)(n+2)).', { origin: { type: 'lprob', id: 'pb_parent', share: 'method', why: 'همان تلسکوپی' }, dormant: '2099-01-01' });
      const r = APP.liveRec(pid); r.woke = new Date().toISOString(); APP.S.put(r); APP.liveBindSession(pid, __cur(), { force: true }); __liveSet(pid, () => {}); return pid; });
    const c = await lcq(pid, 'ببخشید، اشتباه تایپ کردم: جملهٔ دومِ الگو ۱/(2·3·4) بود، نه ۱/(2·3·5).');
    chk(c.q !== WQ, 'C25-5 (s25 p12 u0 «کلِ مسئله را … می‌گویید؟» برای حدسی که خودش گفت): the woken, self-made problem is never asked the whole-first question :: ' + c.q);
    const t = await turn('n=4 رو هم حساب کردم: مستقیم جمع میشه ۷/۳۰، فرمولم هم ۱/۴ − ۱/۶۰ = ۷/۳۰ میده. این یکی هم خوند.', 'خوب.', [csn({ ph: 'u', said: [], nat: 'objective' })]);
    chk(head(t.user).indexOf(WQ) < 0, 'the prompt of the next turn does not carry u0 either :: ' + (head(t.user).match(/پرسشِ این نوبت[^\n]*/) || [''])[0].slice(0, 200));
    // control: a pasted problem she did not compose is still asked the whole first
    const pid2 = await bind('مسئلهٔ کتاب', 'در مثلثِ ABC نیمسازِ زاویهٔ A ضلعِ BC را در D قطع می‌کند. ثابت کنید BD/DC = AB/AC.');
    const c2 = await lcq(pid2, 'باشه'); chk(c2.q === WQ, 'control: a problem that is not her own composition keeps «اول کل» :: ' + c2.q);
  });

  // ================= runners — C25-10 (aC4 p4): آزمودنِ حدسِ نخست، پیش از هر طرح، مرحله را «اجرا» نمی‌کند =================
  await section('aC4', async () => {
    await wipe(); const sid = await fresh();
    const S1 = 'سلام. من بازنشستهٔ راه‌آهنم. دو جور قرص می‌خورم: قرصِ فشار روزی ۲ تا، که بسته‌هاش ۳۰ تاییه؛ قرصِ قند روزی ۳ تا، بسته‌هاش ۶۰ تایی. می‌خوام یه جوری بخرم که هر دو با هم تموم بشن تا دخترم کمتر به زحمت بیفته. فکر کنم اگه از هر کدوم یه بسته بگیرم با هم تموم میشن دیگه، نه؟';
    await turn(S1, 'خوب.', [csn({ ph: 'u', said: ['u', 'd'] })]);
    await turn('امتحان کنم... قرصِ فشار ۳۰ تا، روزی ۲ تا، میشه ۱۵ روز. قرصِ قند ۶۰ تا، روزی ۳ تا، میشه ۲۰ روز. نه، با هم تموم نمیشن! یکی ۱۵ روزه یکی ۲۰ روز. پس چی کار کنم؟ اینو ثبتش کنید که گم نشه.', 'ثبت شد.',
      [{ do: 'live_new', title: 'قرص‌ها با هم تمام شوند', statement: S1.replace(/^سلام\. من بازنشستهٔ راه‌آهنم\. /, ''), nat: 'practical' }, csn({ ph: 'e', said: ['result'], fail: true, result: 'یکی ۱۵ روزه یکی ۲۰ روز' })]);
    const pid = await liveOf(sid); chk(!!pid, 'aC4: live problem created');
    const ph = await sph(pid), M = await Mo(pid);
    chk(ph.turn !== 'c' && ph.story !== 'c' && !/اجرا/.test(String(M && M.now)), 'C25-10 (aC4 p4 «فهم ⇒ اجرای طرح» پس از ردِ حدس، پیش از طرح): no «اجرا» before a plan :: ' + JSON.stringify([ph, M && M.now]));
    const t = await turn('من متولدِ ۱۰ مرداد ۲۴ ام؛ مدرسه خیلی وقت پیش بود. یادمه یه چیزی بود به اسمِ «ک.م.م»، ولی یادم نیست چطوری حساب می‌شد.', 'خوب.', [csn({ ph: 'p', said: [], stuck: true })]);
    chk(!/اجرا/.test(stageOf(blockLine(t.user))), 'aC4 p4: the live block of the next turn is not «اجرا» :: ' + blockLine(t.user).slice(0, 140));
    // with her own plan the same kind of result IS execution
    await turn('طرحم اینه: ضرب‌های ۱۵ و ضرب‌های ۲۰ رو می‌نویسم تا به یه عددِ مشترک برسم.', 'خوب.', [csn({ ph: 'p', said: ['plan'], plan: { text: 'ضرب‌های ۱۵ و ضرب‌های ۲۰ رو می‌نویسم تا به یه عددِ مشترک برسم' } })]);
    const ph2 = await sph(pid); chk(ph2.turn === 'c', 'control: after her plan the stage is «اجرا» :: ' + JSON.stringify(ph2));
  });

  // ================= runners — A23-35 remainder (aA4 p5): «۵ متر می‌خرم» جوابِ خودِ مجهول است ⇒ نه «طرح» با p1 ِ تکراری =================
  await section('aA4', async () => {
    await wipe(); await fresh();
    const pid = await bind('پارچهٔ پرده', 'پنجره ۱۸۰ سانت عرض و ۱۵۰ سانت ارتفاع دارد. پرده باید دو برابرِ عرضِ پنجره چین بخورد و برای سجاف ۱۵ سانت اضافه می‌خواهد. توپِ پارچه ۱۴۰ سانت عرض دارد. چند متر پارچه بخرم؟');
    await turn('کلش این است: می‌خواهم بدانم برای یک پردهٔ چین‌دار که کلِ پنجره را بپوشاند چند متر پارچه بخرم که نه کم بیاید نه بی‌خود زیاد بخرم.', 'خوب.', [csn({ ph: 'u', said: ['u'] })]);
    const t0 = await turn('بله کافی‌اند، چیزی کم نیست. حالا حساب: عرضِ لازم با چین ۱۸۰ ضربدر ۲ می‌شود ۳۶۰ سانت. ۳۶۰ تقسیم بر ۱۴۰ می‌شود ۲ و خرده‌ای، یعنی ۲٫۵۷ قواره. طولِ هر قواره ۱۵۰ + ۱۰ + ۲۰ + ۱۵ = ۱۹۵ سانت. پس ۲٫۵۷ ضربدر ۱٫۹۵ می‌شود حدودِ ۵ متر. ۵ متر می‌خرم.', 'خوب.',
      [csn({ ph: 'e', said: ['result'], result: '۵ متر می‌خرم' })]);
    const its = await items('L:' + pid), ph = await sph(pid);
    chk(its.some(x => x.k === 'res' && x.fin === true), 'A23-35 (aA4 p5): «۵ متر می‌خرم» answers her own unknown «چند متر پارچه بخرم؟» ⇒ a whole result :: ' + JSON.stringify(its.filter(x => x.k === 'res')));
    chk(ph.turn === 'b', 'aA4 p5 (پس از حساب و «۵ متر می‌خرم» مرحله «طرح»): the turn stage is look-back, not «طرح» :: ' + JSON.stringify(ph));
    const t = await turn('نه، بس نیست! قواره را که نمی‌شود تکه‌تکه دوخت؛ پس باید به بالا گرد کنم: ۳ قواره. ۳ ضربدر ۱۹۵ می‌شود ۵۸۵ سانت. ۶ متر می‌خرم که جای برش هم داشته باشد.', 'خوب.', [csn({ ph: 'b', said: ['result'], result: '۶ متر می‌خرم' })]);
    chk(!/طرح/.test(stageOf(blockLine(t.user))) && !/مرحله: (?:طرح|فهم)/.test(nowLine(t.user)), 'aA4 p5: the next prompt does not fall back to «طرح» (and its first plan question) :: ' + JSON.stringify([blockLine(t.user).slice(0, 120), nowLine(t.user)]));
  });

  // ================= runners — A23-35 remainder (s10 p5): فهمِ دوباره‌بازشده «مجهول چیست؟» را برای مجهولِ ثبت‌شده نمی‌پرسد =================
  await section('s10', async () => {
    await wipe(); await fresh();
    const pid = await bind('چیدمانِ ۹ مهمان', '۹ نفر، سه میزِ سه‌نفره؛ هر عمه کنار دقیقاً یک پسرعمو، هیچ دو پسرعمو سر یک میز نه، و شش قانونِ دیگر. آیا چیدمانی هست که همهٔ قوانین را برآورد، یا ناممکن است؟');
    await p.evaluate((pid) => __liveSet(pid, (so, L) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'می‌خواهم بدانم چیدمانی هست که همهٔ قانون‌ها را برآورد یا نه', why: 'مهمانی', u: 'هیچ چیدمانی نیست که همهٔ قانون‌ها را برآورد (یا یکی هست)', dl: [{ id: 'd1', t: '۹ نفر شامل ۳ عمه و ۳ پسرعمو' }, { id: 'd2', t: 'سه میزِ سه‌نفره' }], c: 'هر عمه کنارِ دقیقاً یک پسرعمو؛ دو پسرعمو سر یک میز نه', sat: 'unknown', suff: 'کافی است', suffWhy: 'قانون‌ها کامل‌اند' } }; L.reU = true; delete L.uDraft; }), pid);
    const U1 = /مجهول(?: \(یا حکم(?:ی که باید ثابت شود)?\))? چیست|به مجهول نگاه کن/;
    const c = await lcq(pid, 'یه اصلاح دربارهٔ اولین پیامم: نوشتم «۹ نفر، سه تا میز سه‌نفره» — اشتباه نوشتم، میزها چهارنفره‌ان، نه سه‌نفره.');
    chk(!U1.test(c.q) && c.q !== WQ, 'A23-35 (s10 p5 پرسشِ نوبت u1 «مجهول (یا حکم) چیست؟» ِ کهنه در نوبتِ اصلاح): a re-opened understanding with its recorded unknown is not asked for the unknown again :: ' + c.q);
  });

  // ================= runners — D24-9 remainder (oD1 c40): «تا پس‌فردا انجامش میدم» تعهدِ زمانی است، نه گامِ طرح =================
  await section('oD1', async () => {
    await wipe(); await fresh();
    const pid = await bind('قرص‌دانِ وزنی', 'می‌خوام بدونم «مادرم قرصِ امروزش رو برداشته یا نه»، فقط از روی وزنِ قرص‌دون، بی دوربین.');
    await turn('پیش‌بینیم: صفر یا یک هشدارِ اشتباه، ۸۰ درصد مطمئنم. تا پس‌فردا انجامش میدم. حالا برای امروز کافیه؛ یه خلاصه بده: این ایده تا کجا اومده، چی حل شد و چی منتظره؟', 'خلاصه…',
      [csn({ ph: 'e', said: ['plan'], plan: { text: 'تا پس‌فردا انجامش میدم' } })]);
    const its = await items('L:' + pid), M = await Mo(pid);
    chk(!its.some(x => x.k === 'plan'), 'D24-9 (oD1 c40 «گامِ کنونی: «تا پس‌فردا انجامش میدم»»): a deadline promise with no «what» is not a plan :: ' + JSON.stringify(its.map(x => x.k + ':' + x.t)));
    chk(!/انجامش میدم/.test(String(M && M.remain)), '🧭 «مانده» does not count the promise as a plan step :: ' + (M && M.remain));
    await turn('فردا پنجره رو ۴ ثانیه می‌کنم و دوباره ۲۰ بار در رو باز و بسته می‌کنم.', 'خوب.', [csn({ ph: 'e', said: ['plan'], plan: { text: 'فردا پنجره رو ۴ ثانیه می‌کنم و دوباره ۲۰ بار در رو باز و بسته می‌کنم' } })]);
    const it2 = await items('L:' + pid); chk(it2.some(x => x.k === 'plan' && /پنجره/.test(x.t)), 'control: a plan with a time AND a «what» is still her plan :: ' + JSON.stringify(it2.map(x => x.k + ':' + x.t.slice(0, 50))));
  });

  // ================= bank — VARIANTS_R25 (P5) =================
  await section('bank', async () => {
    const mine = BANK.map((e, i) => [e, i]).filter(([e]) => /^P5(\b|[._-])/.test(String(e.rc || e.mech || e.mechanism || '')));
    info.bankFile = BF || '(none yet)'; info.bankMine = mine.length;
  });

  console.log(JSON.stringify(info).slice(0, 4000));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
