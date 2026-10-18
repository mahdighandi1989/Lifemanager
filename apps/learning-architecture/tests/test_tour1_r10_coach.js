// تورِ پولیا (دستهٔ ۱، دورِ ۱۰ ِ اصلاح — دورِ «بی‌نقص»، ۲۰۲۶-۱۰-۱۶) — سهمِ «coach» (DECISIONS_R10: J1، J2، J4) روی رابطِ واقعی.
// اصل: هر بلوکِ مربی/مسئلهٔ زنده/🌱 **دقیقاً یک** پرسشِ نوبت دارد؛ همهٔ «لحظه»ها از یک تابع با اولویتِ صریح؛ هر سطرِ لحظهٔ دیگر «زمینه (نه پرسشِ دوم)».
//  struct  آزمونِ ساختاری (J1): پرامپتِ نوبت‌های واقعیِ دورهای ۷ تا ۱۰ ساخته می‌شود و در هر بلوکِ مربی+زنده+🌱 «پرسشِ بی‌نشان» شمرده می‌شود (≤ ۱)
//  only    «فقط جواب» بی تلاشِ دیدنی ⇒ پرسشِ نوبت A073 «تا کجا رفتی؟» (s38 p1 — رگرسیونِ S2)، با مسئلهٔ زنده هم (turn.onlyAns)؛ با تلاش ⇒ زمینه
//  moments A263 (s20 p2) و C107 (s20 p4) پرسشِ نوبت‌اند، نه کنارِ پیشنهادِ فهرست؛ «چرا X؟» و A191 هم (بالاتر از فهرست)
//  prov    سطرِ ضرب‌المثلِ مرحله هرگز «⇐ همان پرسش» ندارد؛ سطرِ معلمِ خیالیِ پلهٔ ۳ زمینه است (s30)
//  mid     «میانهٔ راه» با مسئلهٔ زنده: همان پرسشِ سطرِ «یک پرسش» ِ بلوکِ زنده؛ سطرِ مربی زمینه
//  seed    🌱 بی مسئلهٔ زنده هم زمینه است (پرسشِ نوبت از مربی)
//  guess   حدسِ بی «؟»: «شاید … مهمه … حس می‌کنم درسته» (s20 p3) ⇒ «چطور می‌آزمایی‌اش؟»
//  a167    معلمی که پرسشِ لو‌دهندهٔ خودش را گزارش می‌کند (s15 p2) ⇒ لحظهٔ A167، نه A129
//  a191    نه در «هنوز نمی‌دونم. گیرم…» ِ سشنِ تازه (s26 p5) و نه در صورتِ کاملاً نقل‌شده پس از ساعت‌ها کار (s38 p6)؛ کنترل: s21 هنوز A191
//  space   «"فقط جواب" خواست:پیش» (s27، s20) — فاصله پس از دونقطه
//  check   «مطمئنی این درسته؟» دربارهٔ گزینهٔ خودش ⇒ «گزینه‌ات را با تک‌تکِ بخش‌های شرط بسنج» (s13)، با مسئلهٔ زنده هم
//  livenew live_new ِ گفت‌وگو ⇒ «🔭 مسئله ثبت شد» در گفت‌وگو با دکمهٔ «باز کن» و رفتن به صفحه‌اش (s13، s17، s19)؛ روی فرم ⇒ نمی‌رود، دکمه هست
//  terr    «ثانیه» (زمان) حوزهٔ a_concept_types («معقولات اولی و ثانیه») را نمی‌آورد (s18)؛ نامِ جایگزینِ کامل هنوز پیوند است
// همه از رابطِ واقعی (پنجرهٔ دستیار با مدلِ بدلی، فرم‌های «🔭»)؛ داوری روی پرامپتِ فرستاده‌شده و وضعِ صفحه. خطا ⇒ کدِ خروجِ غیرصفر.
// LLA_FILE = ساختِ دیگر (خطِ قرمز: ساختِ 97f1595)؛ ONLY=struct,only (نامِ بخش‌ها، با ویرگول) برای اجرای بخشی؛ DUMP=1 سطرهای شمرده را چاپ می‌کند.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0] + ' ' + JSON.stringify(info[name] && info[name].stage || '')); } };
  const W = (ms) => p.waitForTimeout(ms || 90);
  const T0 = '2026-11-02';
  const D = (n) => { const d = new Date(2026, 10, 2 + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const day = async (n) => { await p.evaluate(x => { window.__day = x; }, D(n)); };
  await p.goto(FILE); await p.waitForSelector('.nav'); await W(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0;
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); const r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
  }, T0);
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await W(140); };
  const sel = async (s, v) => { await p.selectOption(s, v); await W(120); };
  const click = async (s) => { await p.click(s); await W(160); };
  const hasEl = (s) => p.locator(s).count();
  const fillIf = async (s, v) => { if (await hasEl(s)) await p.fill(s, v); };
  const say = async (text) => {
    await p.evaluate(() => APP.ASSIST.toggle(true));
    await p.fill('.as-panel .as-in', text); await p.click('.as-panel .as-send');
    await p.waitForFunction(() => !APP.ASSIST.busy(), null, { timeout: 15000 });
    await p.evaluate(() => APP.ASSIST.toggle(false)); await W(60);
  };
  const newSess = () => p.evaluate(() => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; return s.id; });
  const lastUser = () => p.evaluate(() => { const c = __calls.filter(x => !/^\[سامانه/.test(String(((x.user || '').split('# نوبتِ تازه\n')[1] || '')).trim())); return (c[c.length - 1] || __calls[__calls.length - 1] || {}).user || ''; });
  const block = (u, head) => { const i = u.indexOf(head); if (i < 0) return ''; const j = u.indexOf('\n# ', i + 5); return u.slice(i, j < 0 ? u.length : j); };
  const coachOf = (u) => block(u, '# مربیِ حل');
  const liveOf = (u) => block(u, '# مسئلهٔ زندهٔ این سشن');
  const sugOf = (c) => (/پیشنهادِ این نوبت: «([^»]+)»/.exec(c) || [])[1] || '';
  const next = (reply) => p.evaluate(reply => __q.push(R({ reply })), reply);
  const act = (o) => p.evaluate(o => __q.push(R(o)), o);
  const first = async (msg) => { await newSess(); await say(msg); return await lastUser(); };
  const pair = async (open, msg) => { await newSess(); await say(open); await say(msg); return await lastUser(); };
  const lineOf = (c, re) => (c.split('\n').filter(l => re.test(l))[0] || '');
  const isCtx = (l) => /^- زمینه \(نه پرسشِ دوم\)/.test(l);
  const isTurn = (l) => /^- \*\*پرسشِ این نوبت همین است:\*\*/.test(l);
  const oneOf = (u) => lineOf(liveOf(u), /^- در این نوبت فقط \*\*یک\*\* پرسش/);

  // ================= شمارشِ ساختاری (J1) =================
  // سطرِ «- …» در بلوکِ مربی/مسئلهٔ زنده/🌱: زمینه ⇒ شمرده نمی‌شود؛ قاعدهٔ عامِ همیشگی (فهرستِ زیر) ⇒ فقط حاملِ پرسشِ نوبتش خوانده می‌شود؛
  // «پرسشِ این نوبت همین است» ⇒ حامل؛ هر سطرِ دیگری که «بپرس/بخواه» یا پرسشِ «…؟» (بیرون از نقلِ کتاب) دارد ⇒ پرسشِ بی‌نشان.
  const GENERIC = [/^- قاعدهٔ سبک/, /^- \*\*قابِ مربی/, /^- پرسش‌ها را مکانیکی نخوان/, /^- پرسشِ این نوبت: \*\*فقط\*\*/, /^- پرسش‌های «/, /^- \*\*گزارشِ وضع/, /^- سکوت، «نمی‌دونم»/,
    /^- حلِ مسئله مهارتی عملی است/, /^- سطحِ استقلالِ کاربر/, /^- پایانِ نردبانِ سرنخ/, /^- گامِ کوچک ارزش دارد/, /^- ادعای محلِ بحث/, /^- \*\*مسئلهٔ پیشین را خودش حل کرد/, /^- مسئلهٔ «[^»]*» بسته شده است/,
    /^- حلی که در همین گفت‌وگو تمام شد/, /^- ضرب‌المثلِ همین مرحله/, /^- چهار مرحلهٔ حل در دادهٔ خودِ این کاربر/, /^- بازنگری مهم‌ترین بخشِ کار/, /^- استدلالِ اکتشافی/, /^- \*\*پرسشِ بد چرا بد است/,
    /^- \*\*طرحی که از اقتدار/, /^- «چرا فرض کنم همه برقرارند؟»/, /^- از نماد\/حروف بیزار است/, /^- در این نوبت فقط \*\*یک\*\* پرسش/, /^- (?:شکل|به تعریف‌ها برگرد) .*\*\*به‌جای\*\* پیشنهادِ این نوبت/,
    /همان پیشنهادِ این نوبت/, /^- همهٔ پرسش‌های این مرحله در صفحه یا گفت‌وگو پاسخ گرفته‌اند/, /^- پرسش‌های همین مرحله/,
    /^- (?:این مسئله پاسخِ عینی دارد|پاسخِ این مسئله را هیچ‌کس|اگر پاسخِ عینی دارد)/];
  const QUOTE_BOOK = /«[^»]*»\s*\((?:پولیا|[ABCD]\d{3})[^)]*\)/g;
  // دورِ ۲۲ (DECISIONS_R22 P4، B·D10): پرسشِ نوبتِ نگه‌داشته در پرامپت خودش یک پرسش است — «X؟ Y؟» با «؛» یک جملهٔ پرسشی می‌شود (a27 oneQ22)؛
  // پیشنهادِ همان پرسش در سطرِ فهرست شکلِ کتاب را دارد ⇒ «؛» و «؟» در سنجشِ «همان پرسش» یکی‌اند
  const nq = (q) => String(q || '').replace(/[\s*«»]+/g, ' ').replace(/؛/g, '؟').trim();
  const qsIn = (t) => (t.match(/«[^»]*[؟?][^»]*»/g) || []).map(x => nq(x.slice(1, -1)));
  const same = (a, c) => !!a && !!c && (a === c || a.indexOf(c) >= 0 || c.indexOf(a) >= 0);
  // «اگر …، … بپرس» شرطی است (قاعده)، نه پرسشِ این نوبت
  const conditional = (t) => { const i = t.search(/بپرس(?![آ-ی])/); if (i < 0) return false; return /(?:^|[\s(،])اگر(?![آ-ی])/.test(t.slice(0, i).split(/[.؛:]|—/).pop()); };
  const struct = (u) => {
    const blocks = u.split(/\n(?=# )/).filter(x => /^# (?:مربیِ حل|مسئلهٔ زندهٔ این سشن|پس از شکست، نقد یا میلِ رها کردن)/.test(x));
    let sugQ = ''; const turns = [], extras = [], seen = [];
    for (const bl of blocks) {
      if (/^# پس از شکست/.test(bl) && /\n- \(زمینه، نه پرسشِ دوم/.test(bl)) continue;   // 🌱 زمینه‌شده
      for (const l of bl.split('\n')) {
        if (!/^- /.test(l) || isCtx(l) || /^- \(زمینه/.test(l)) continue;
        const t = l.replace(QUOTE_BOOK, ' ');
        if (/^- پرسش‌های «/.test(l)) { const q = sugOf(t); if (q) { sugQ = nq(q); seen.push('SUG ' + q.slice(0, 80)); } continue; }
        if (/^- در این نوبت فقط \*\*یک\*\* پرسش/.test(l)) { const qs = qsIn(t.split(/\. اگر با وضعِ همین لحظه/)[0]); sugQ = qs.length ? qs[qs.length - 1] : '@one'; seen.push('ONE ' + sugQ.slice(0, 80)); continue; }
        if (isTurn(l) || /پرسشِ این نوبت همین است/.test(t)) { turns.push(qsIn(t)); seen.push('TURN ' + l.slice(0, 110)); continue; }
        if (GENERIC.some(re => re.test(l)) || conditional(t)) continue;
        if (/(?:^|[\s(،:])(?:بپرس|بخواه)(?![آ-ی])/.test(t) || /«[^»]*[؟?][^»]*»/.test(t)) { extras.push(l.slice(0, 160)); seen.push('EXTRA ' + l.slice(0, 110)); }
      }
    }
    const tq = turns.filter(qs => !qs.some(q => same(q, sugQ)));
    const n = (sugQ ? 1 : 0) + tq.length + extras.length - (sugQ ? 0 : 0);
    return { n: sugQ ? n : n, sugQ, turns: tq, extras, seen };
  };
  const SC = info.struct = { cases: [] };
  const judge = (name, u) => { const r = struct(u); SC.cases.push({ name, n: r.n }); if (process.env.DUMP) console.log('## ' + name + '\n  ' + r.seen.join('\n  ')); chk(r.n <= 1, 'struct: «' + name + '» has ' + r.n + ' turn questions in the coach+live+🌱 blocks (≤ 1): ' + JSON.stringify({ sug: r.sugQ, turns: r.turns, extras: r.extras })); return r; };

  // مسئلهٔ زندهٔ ساخته در صفحه (فهم ثبت ⇒ مرحلهٔ طرح)، و سشنی که روی صفحه‌اش با دستیار حرف می‌زند
  const mk = async (o) => { await go('e_prob', null, 'live'); await p.fill('#lpNewT', o.title); await p.fill('#lpNewS', o.st); await W(60); if (o.nat) await sel('#lpNewNat', o.nat); await click('main .lp-create'); return p.evaluate(() => APP.state.arg); };
  const understand = async (o) => {
    await p.fill('#lpOne', o.one); await p.fill('#lpWhy', 'برایم مهم است و کنجکاوم'); await click('main .lp-onesave');
    if (o.nat && await hasEl('#lpNat')) await sel('#lpNat', o.nat);
    await p.fill('#lpUnk', o.unk);
    for (let i = 0; i < o.data.length; i++) { if (i >= 2) await click('main .lp-dadd'); await p.fill('#lpD_d' + (i + 1), o.data[i]); }
    await p.fill('#lpCond', o.cond);
    if (await hasEl('#lpSat')) await sel('#lpSat', 'yes');
    await sel('#lpSuff', 'ناکافی است — چیزی کم است'); await fillIf('#lpSuffW', 'هنوز همه را نمی‌دانم');
    await fillIf('#lpSuffChal', 'همهٔ داده‌ها با هم آن را معین می‌کنند');
    if (await hasEl('#lpDep')) await sel('#lpDep', 'no');
    await p.fill('#lpGuess', o.guess || 'راهی هست'); await sel('#lpConf', '60'); await p.fill('#lpTest', 'با یک حالتِ خاص می‌آزمایم');
    await sel('#lpIfRef', 'حدس را کنار می‌گذارم یا اصلاحش می‌کنم');
    await click('main .lp-usave'); if (await hasEl('main .lp-u .sv-g2')) await click('main .lp-u .sv-g2');
  };
  const savePlan = async (plan) => { await p.selectOption('#lpMv', 'mv_special').catch(() => {}); await fillIf('#lpMvWhy', 'اول فقط یک حالت را دقیق می‌بینم تا دامنه تنگ شود'); if (await hasEl('main .lp-mvadd')) await click('main .lp-mvadd');
    await p.fill('#lpPlan', plan); await W(350);
    for (const id of await p.evaluate(() => [...document.querySelectorAll('main .lp-plan .lp-un')].map(x => x.getAttribute('data-d')))) { await sel('#lpPU_a_' + id, 'use'); await p.fill('#lpPU_w_' + id, 'در گامِ بعد به کار می‌رود'); }
    await click('main .lp-plansave'); };
  const pageSess = async (pid) => { await go('lprob', pid); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; }); };

  info.sys = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys <= 20000, 'SYS ≤ 20000: ' + info.sys);

  const S38P1 = 'ساعت ۱۱ شبه، فردا ۸ صبح باید تحویل بدم. «حجم چهاروجهی‌ای رو پیدا کنید که دو یال روبه‌روش طول a دارن، بر هم عمودن و هر دو بر پاره‌خط به طول b که وسط‌هاشون رو وصل می‌کنه عمودن». فقط جواب رو بگو، قول می‌دم بعداً یاد بگیرم.';
  const S20P1 = 'می‌خوام بفهمم شبکه‌ی E-I-PV کِی نوسان گاما می‌سازه. سه جمعیت نورونی دارم با ثابت‌های زمانی و وزن‌های اتصال.';

  // ================= only — «فقط جواب» بی تلاش ⇒ پرسشِ نوبت A073 =================
  await section('only', async () => {
    const r = info.only = {};
    const c = coachOf(await first(S38P1)), l = lineOf(c, /«فقط جواب» خواست/);
    r.s38 = { turn: isTurn(l), ctx: isCtx(l), sug: sugOf(c).slice(0, 60), a191: isCtx(lineOf(c, /A191/)) };
    chk(r.s38.turn && /تا کجا رفتی/.test(r.s38.sug) && r.s38.a191, 'only: «… فقط جواب رو بگو» with NO visible attempt ⇒ the A073 line IS the turn question («خودت تا کجا رفتی و کجا ماندی؟») and A191 is context (s38 p1 — the round-10 S2 regression) ' + JSON.stringify(r.s38));
    // کنترل: تلاشِ دیدنی («حدسم … ۵×۵=۲۵ … فقط جوابشو بگو») ⇒ A073 زمینه
    const cc = coachOf(await first('بیشترین حاصل‌ضرب دو عدد مثبت که جمعشون ۱۰ه چنده؟ امتحان کردم: ۴×۶=۲۴، ۵×۵=۲۵. فقط جوابشو بگو.')), lc = lineOf(cc, /«فقط جواب» خواست/);
    r.ctl = { ctx: isCtx(lc), turn: isTurn(lc) };
    chk(lc && r.ctl.ctx && !r.ctl.turn, 'only: control — with a visible attempt («۴×۶=۲۴، ۵×۵=۲۵») the A073 line is context, not the turn question ' + JSON.stringify(r.ctl));
    // فاصله پس از «خواست:» (s27، s20)
    chk(!/خواست:پیش/.test(c + cc) && /«فقط جواب» خواست(?:\s|:\s)/.test(c), 'space: «"فقط جواب" خواست:پیش» has its missing space (s27, s20)');
    // با مسئلهٔ زنده: «فقط جواب» ⇒ پرسشِ «یک پرسش» ِ بلوکِ زنده همان «تا کجا رفتی؟» است (turn.onlyAns)
    r.stage = 'live'; await day(0);
    const P = await mk({ title: 'حجمِ چهاروجهی', st: 'حجمِ چهاروجهی‌ای که دو یالِ روبه‌رویش طولِ a دارند، بر هم عمودند و هر دو بر پاره‌خطِ b عمودند چقدر است؟', nat: 'objective' });
    await pageSess(P); await say('فقط جواب رو بگو، فردا صبح باید تحویل بدم.');
    const u = await lastUser(); r.live = { one: oneOf(u), only: isCtx(lineOf(coachOf(u), /«فقط جواب» خواست/)) }; delete r.stage;
    chk(/تا کجا رفتی/.test(r.live.one) && r.live.only, 'only: on a bound live problem «فقط جواب» without an attempt ⇒ the live block\'s one turn question is «خودت تا کجا رفتی و کجا ماندی؟» and the coach A073 line is context ' + JSON.stringify(r.live));
    judge('only s38 p1', await first(S38P1));
    judge('only live', u);
  });

  // ================= moments — A263، C107، «چرا»، A191 پرسشِ نوبت‌اند =================
  await section('moments', async () => {
    const r = info.moments = {};
    const u2 = await pair(S20P1, 'کلی‌تر کنم؟ برای هر تعداد جمعیت؟ ولی کلی‌تر که سخت‌تره!');
    const c2 = coachOf(u2), l2 = lineOf(c2, /پارادوکسِ مخترع/);
    r.a263 = { turn: isTurn(l2), sug: sugOf(c2).slice(0, 50) };
    chk(r.a263.turn && /حالتِ کلی/.test(r.a263.sug), 'moments: «کلی‌تر که سخت‌تره!» ⇒ A263 «در حالتِ کلی چه آشکار می‌شود؟» IS the turn question, not beside «مجهول چیست؟» (s20 p2) ' + JSON.stringify(r.a263));
    judge('A263 s20 p2', u2);
    const u4 = await pair(S20P1, 'ایده رو با ۴۰ تا شبیه‌سازی آزمودم: ۳۸ تاش جور درمیاد! ولی یه حالت، وقتی g_PV-E خیلی بزرگه، نوسان نمی‌ده. استثناست، نادیده بگیرم؟');
    const c4 = coachOf(u4), l4 = lineOf(c4, /C107/);
    r.c107 = { turn: isTurn(l4), sug: sugOf(c4).slice(0, 50) };
    chk(r.c107.turn && /کجا هنوز درست/.test(r.c107.sug), 'moments: a counterexample ⇒ C107 «برای کجا هنوز درست است؟» IS the turn question (s20 p4) ' + JSON.stringify(r.c107));
    judge('C107 s20 p4', u4);
    const uw = await first('چرا وقتی بطری آب پر رو تو فریزر گذاشتم ترکید ولی بطری نیمه‌پر سالم موند؟');
    const cw = coachOf(uw); r.why = { turn: isTurn(lineOf(cw, /«چرا …؟» پرسید/)), sug: sugOf(cw).slice(0, 40) };
    chk(r.why.turn && /خودت فکر می‌کنی چرا/.test(r.why.sug), 'moments: «چرا X؟» ⇒ «خودت فکر می‌کنی چرا؟» is the turn question (A073 above the list) ' + JSON.stringify(r.why));
    judge('why', uw);
    const u21 = await first('سلام. من بردیا هستم ۱۲ سالمه، تیم شطرنج مدرسه. مسئله: سفید بازی می‌کند و در دو حرکت مات می‌کند. FEN: 5k2/8/5K2/8/8/8/8/R2Q4 w - - 0 1 . من کیش با وزیر رو زدم ولی شاه فرار می‌کنه. یه رخ سفید گوشه‌ی صفحه هست که اصلاً نمی‌دونم چرا اونجاست.');
    const c21 = coachOf(u21); r.a191 = { turn: isTurn(lineOf(c21, /A191/)), sug: sugOf(c21).slice(0, 40) };
    chk(r.a191.turn && /یک جمله/.test(r.a191.sug), 'moments: A191 «کل را ببین» is the turn question at a problem\'s introduction (s21 p1) ' + JSON.stringify(r.a191));
    judge('A191 s21 p1', u21);
  });

  // ================= prov — ضرب‌المثل بی «⇐ همان پرسش»؛ معلمِ خیالیِ پلهٔ ۳ زمینه =================
  await section('prov', async () => {
    const r = info.prov = {};
    await p.evaluate(() => { const q = APP.ASSIST.tutorQuestions.und.qs[0], at = (d) => d + 'T09:00:00.000Z';
      APP.S.put({ id: 'achat_hist_r10', type: 'achat', title: 'پیشین', msgs: [{ role: 'user', at: at('2026-09-01'), text: 'مجهول اینه' }], coach: { ansLog: [{ q, at: at('2026-09-01'), self: 2 }, { q, at: at('2026-09-04'), self: 2 }, { q, at: at('2026-09-12'), self: 2 }] } }); });
    const u = await first('معما: سه جعبه با برچسبِ غلط داریم؛ یکی سیب، یکی پرتقال، یکی قاطی. با یک بار برداشتن برچسب‌ها را درست کن.');
    const c = coachOf(u), im = lineOf(c, /معلمِ خیالیِ خودش/);
    r.imag = { has: !!im, ctx: isCtx(im), rung3: /پلهٔ ۳/.test(im), a069: /A069/.test(im), fade: /بلندتر از پیامِ خودش/.test(im) };
    chk(r.imag.has && r.imag.ctx && r.imag.rung3 && r.imag.a069 && r.imag.fade, 'prov: the rung-3 imaginary-teacher line is context (how to pose the ONE turn question), still naming A069 and the relative length (s30) ' + JSON.stringify(r.imag));
    judge('rung3', u);
    const pv = [];
    for (const m of ['دیروز این مسئله رو شروع کردم: یه مستطیل با محیط ۲۰ بزرگ‌ترین مساحتش چیه؟ مجهول مساحته.', 'طرحم اینه که اول حالت مربع رو امتحان کنم بعد مستطیل‌های دیگه.', 'حساب کردم: ۵×۵=۲۵ و ۴×۶=۲۴. پس مربع بیشینه‌ست.']) {
      const uu = await first(m); pv.push(lineOf(coachOf(uu), /^- ضرب‌المثلِ همین مرحله/)); judge('proverb: ' + m.slice(0, 30), uu); }
    r.pv = pv.map(l => ({ has: !!l, ask: /⇐ همان پرسش/.test(l) }));
    chk(pv.some(Boolean) && !r.pv.some(x => x.ask), 'prov: the stage proverb line never carries «⇐ همان پرسش: «…؟»» (one turn question) ' + JSON.stringify(r.pv));
  });

  // ================= guess — حدسِ بی «؟» =================
  await section('guess', async () => {
    const r = info.guess = {};
    const u = await pair(S20P1, 'دو هفته گذشت. هفته‌ی اول دیوانه‌وار شبیه‌سازی کردم، هیچی. بعد چند روز رفتم سفر. توی اتوبوس یهو به ذهنم رسید: شاید فقط نسبت ثابت‌های زمانی مهمه، یعنی τ_I به τ_E! وقتی بیشتر از یه حدی باشه نوسان میاد. حس می‌کنم درسته.');
    const c = coachOf(u); r.s20 = { guess: /همین پیام حدس است/.test(c), sug: sugOf(c).slice(0, 40) };
    chk(r.s20.guess && /می‌آزمایی/.test(r.s20.sug), 'guess: «شاید فقط نسبتِ … مهمه … حس می‌کنم درسته» (no «؟») is a guess ⇒ the turn question «چطور می‌آزمایی‌اش؟» (s20 p3) ' + JSON.stringify(r.s20));
    judge('guess s20 p3', u);
    const c2 = coachOf(await first('به نظرم قیمت این خونه حدود سه میلیارد باشه، می‌خوام بدونم بخرم یا نه.'));
    r.decl = /همین پیام حدس است/.test(c2);
    chk(r.decl, 'guess: «به نظرم … باشه» is a declarative guess too ' + JSON.stringify(r));
    const c3 = coachOf(await first('شاید فردا برم کوه، هنوز تصمیم نگرفتم. بعدش باید گزارش رو بنویسم.'));
    r.ctl = /همین پیام حدس است/.test(c3);
    chk(!r.ctl, 'guess: control — «شاید فردا برم کوه» (a plan, no claim) is not a guess ' + JSON.stringify(r));
  });

  // ================= a167 — معلم پرسشِ خودش را گزارش می‌کند =================
  await section('a167', async () => {
    const r = info.a167 = {};
    const u = await pair('شاگردام سر مسئله‌ها ساکت می‌مونن. من هم آخرش خودم حل می‌کنم روی تخته. یه همکار گفت «سؤال بپرس» ولی سؤال‌های من یا جوابو لو میده یا کسی جواب نمیده. چیکار کنم؟',
      'مثلاً دیروز مسئله‌ی دو مثلث بود، گفتم: «خب بچه‌ها، اینجا باید از تشابه استفاده کنیم، نه؟» همه گفتن «بله خانم» و بعد باز ساکت شدن. بعد خودم حل کردم.');
    const c = coachOf(u); r.s15 = { a129tail: /بازنگریِ او دربارهٔ یاد دادن/.test(c), a167: /A167/.test(c), sug: sugOf(c).slice(0, 40) };
    chk(!r.s15.a129tail && r.s15.a167 && r.s15.sug, 'a167: a teacher reporting her own leading question («گفتم: «… نه؟»» … «بعد خودم حل کردم») is the A167 moment — the list keeps its suggestion, no «A129 … بازنگریِ او دربارهٔ یاد دادن» (s15 p2) ' + JSON.stringify(r.s15));
    judge('a167 s15 p2', u);
    // کنترل: لحظهٔ واقعیِ A129 (پدر، «قبول کرد فقط چون باباش هستم»، s16) همان می‌ماند
    const c16 = coachOf(await pair('دخترم یه مسئله داره: «باغچه‌ای مستطیلی دورش ۲۴ متر حصار داره، طولش دو برابر عرضشه، طول و عرض چقدره؟» خودم بلدم، فقط بگو چطوری بهش بگم.',
      'دیشب بهش گفتم طول دو برابر عرضه، قبول کرد فقط چون باباش هستم. امروز یادش رفته بود.'));
    r.s16 = /بازنگریِ او دربارهٔ یاد دادن/.test(c16);
    chk(r.s16, 'a167: control — the father\'s «قبول کرد فقط چون باباش هستم … یادش رفته بود» is still the A129 turn (s16) ' + JSON.stringify(r));
  });

  // ================= a191 — فقط پیامی که مسئله را معرفی می‌کند =================
  await section('a191', async () => {
    const r = info.a191 = {};
    const c26 = coachOf(await first('هنوز نمی‌دونم. گیرم، نمی‌فهمم معادله‌ی چهارم از کجا میاد.'));
    const c38 = coachOf(await first('یه تکلیف دیگه: «ثابت کنید مجموع زاویه‌های خارجی هر چندضلعی محدب ۳۶۰ درجه است.» یک ساعت و نیمه روش کار کردم: برای مثلث و مربع امتحان کردم درسته، ولی برای حالت کلی نمی‌دونم چطور ثابت کنم.'));
    r.s26 = /A191/.test(c26); r.s38 = /A191/.test(c38);
    chk(!r.s26, 'a191: «هنوز نمی‌دونم. گیرم…» in a fresh session (a continuation, not a problem\'s introduction) gets no A191 (s26 p5) ' + JSON.stringify(r));
    chk(!r.s38, 'a191: a statement quoted in full after «یک ساعت و نیمه روش کار کردم … امتحان کردم» gets no A191 (s38 p6) ' + JSON.stringify(r));
  });

  // ================= check — «مطمئنی این درسته؟» دربارهٔ گزینهٔ خودش =================
  await section('check', async () => {
    const r = info.check = {};
    const u = await pair('همکارم فاکتورهای ناهار رو هر بار ۵۰-۱۰۰ هزار تومن بیشتر ثبت می‌کنه. دوست صمیمیمه. چطور جلوی ادامه‌ش رو بگیرم بی‌آنکه دوستم رو نابود کنم؟',
      'یه گزینه پیدا کردم: مستقیم باهاش حرف بزنم و یه مهلت بدم که جبران کنه. مطمئنی این درسته؟');
    const c = coachOf(u); r.chat = { sug: sugOf(c).slice(0, 60), line: /درستیِ گزینه‌ای را می‌پرسد/.test(c) };
    chk(/بخش‌های شرط/.test(r.chat.sug) && r.chat.line, 'check: «یه گزینه پیدا کردم … مطمئنی این درسته؟» ⇒ the turn question «گزینه‌ات را با تک‌تکِ بخش‌های شرط بسنج» (s13; Pólya: check the result against the condition) ' + JSON.stringify(r.chat));
    judge('check chat', u);
    r.stage = 'live'; await day(0);
    const P = await mk({ title: 'فاکتورهای همکار', st: 'چطور جلوی ادامهٔ فاکتورهای بیشترِ همکارم را بگیرم بی‌آنکه دوستم را نابود کنم؟', nat: 'life' });
    await pageSess(P); await say('یه گزینه پیدا کردم: مستقیم باهاش حرف بزنم و یه مهلت بدم که جبران کنه. مطمئنی این درسته؟');
    const ul = await lastUser(); r.live = oneOf(ul); delete r.stage;
    chk(/بخش‌های شرط/.test(r.live), 'check: on the bound live problem (s13 p5) the live block\'s one turn question is the condition check ' + JSON.stringify(r));
    judge('check live', ul);
  });

  // ================= mid — «میانهٔ راه» با مسئلهٔ زنده یک پرسش =================
  await section('mid', async () => {
    const r = info.mid = {}; r.stage = 'mk';
    await day(0);
    const P = await mk({ title: 'باغچهٔ پشتِ خانه', st: 'می‌خواهم باغچهٔ پشتِ خانه را طوری بکارم که تابستان هم سبز بماند؛ چه بکارم و کجا؟', nat: 'life' });
    await understand({ one: 'دنبالِ کاشتی هستم که تابستان سبز بماند', unk: 'چه گیاهی کجا', data: ['باغچه رو به شمال است', 'آب هفته‌ای دو بار'], cond: 'تابستان سبز بماند', guess: 'گیاهانِ سایه‌دوست', nat: 'life' });
    r.stage = 'chat'; await day(8); await pageSess(P);
    await say('سلام، هنوز روی باغچه‌ام. چند تا گیاه رو بررسی کردم.');
    const u = await lastUser(), c = coachOf(u);
    r.d8 = { one: oneOf(u).slice(0, 400), coachMid: lineOf(c, /میانهٔ راه/).slice(0, 80) }; delete r.stage;
    chk(/میانهٔ راه/.test(r.d8.one) && (!r.d8.coachMid || /^- زمینه \(نه پرسشِ دوم\)/.test(r.d8.coachMid)), 'mid: with a live problem the coach\'s «میانهٔ راه» IS the live block\'s one turn question, and the coach line is only context (one question, not two lines in two blocks) ' + JSON.stringify(r));
    judge('mid live', u);
  });

  // ================= seed — 🌱 بی مسئلهٔ زنده =================
  await section('seed', async () => {
    const r = info.seed = {};
    const u = await first('سه ماهه پروژه‌ی پایانی رو شروع نکردم. ناامیدم و دلسردم، فکر کنم استعدادشو ندارم. هر روز لپ‌تاپ رو باز می‌کنم و می‌بندم.');
    const sd = block(u, '# پس از شکست، نقد یا میلِ رها کردن');
    r.has = !!sd; r.ctx = /\n- \(زمینه، نه پرسشِ دوم/.test(sd); r.ask = /بپرس(?![آ-ی])/.test(sd);
    chk(r.has && r.ctx && !r.ask, 'seed: without a live problem the 🌱 block is context beside the coach\'s turn question — no «بپرس» of its own ' + JSON.stringify(r));
    judge('seed s34 p1', u);
  });

  // ================= struct — نوبت‌های واقعیِ دورهای ۷ تا ۱۰ =================
  await section('struct', async () => {
    const T = [
      ['s12 p1', ['جدول امروز: «از جلو و عقب یکی است، در دریا راه می‌رود» — ۵ حرفی. و یه افقی دیگه: حروف «ر ا ت س م ن ه ب» رو مرتب کن، یه کلمه ۸ حرفی. نیم ساعته موندم. شما که ماشینی، بگو.']],
      ['s12 p5', ['جدول امروز: «از جلو و عقب یکی است، در دریا راه می‌رود» — ۵ حرفی. نیم ساعته موندم. شما که ماشینی، بگو.', 'با املا: ناوبان برعکسش نابوان میشه، نه. «ناخدا» نه... آهان! پیداش کردم. حالا آناگرام. فکر کنم آخرش «ستان» باشه.', 'ر م ه ب ... رمهب‌ستان؟ نه. اشتباه بود. پس «ستان» نیست. اعصابم خورد شد، نیم ساعت دیگه هم رفت.']],
      ['s17 p1', ['می‌خوام آب بارون پشت‌بوم انبار رو جمع کنم برای آبیاری قطره‌ای تابستون باغ پسته. مخزن چقدر بزرگ بسازم؟ بتنی بسازم یا پلاستیکی بخرم؟ کجا بذارم؟ هر سه رو با هم بگو.']],
      ['s29 p1', ['۴۰ متر لبه‌ی سنگی دارم برای یه باغچه‌ی چهارضلعی. بزرگ‌ترین باغچه چه شکلیه؟ به نظرم مستطیل باریک و بلند چون جای گل بیشتر داره. بعد هم می‌خوام یه حوض گرد بذارم که به سه تا مسیر باغ مماس باشه، جای مرکزشو چطوری پیدا کنم؟ اول باغچه رو ثبت کن.']],
      ['s23', ['کیک رو پختم و خوب شد! ولی زمان پختو نمی‌دونستم، دستور مادرم ۳۵ دقیقه بود. زمان پخت هم ۲.۸ برابر میشه؟ یعنی ۱۰۰ دقیقه؟ ۸ تا تخم‌مرغ زدم یا ۹ بهتر بود؟']],
      ['s25 guess+C145', ['حدسم اینه که n/(n+1) میشه. ۱۰ تاشو چک کردم، ثابت شد دیگه، درسته؟']],
      ['C145 alone', ['دیدم ۱/۲ + ۱/۶ + ۱/۱۲ = ۳/۴؛ فکر کنم همیشه n/(n+1) میشه.', 'خب ۱۰ تا چک کردم، دیگه اثباته! ولی باشه، ثبتش کن ببینیم.']],
      ['s27 p1', ['سؤال مقاله‌ام: «آیا ماشین می‌تونه زبان رو بفهمه؟» هر چی می‌خونم یه نفر میگه آره یه نفر میگه نه. شما خودت که ماشینی، بگو می‌فهمی یا نه؟']],
      ['s13 p1', ['همکارم فاکتورهای ناهار رو هر بار ۵۰-۱۰۰ هزار تومن بیشتر ثبت می‌کنه. دوست صمیمیمه، بچه مریض داره. اگه گزارش بدم اخراج می‌شه. اگه ندم خودم شریک جرمم. قانون چی میگه؟ درستش چیه؟']],
      ['s13 p2 claim', ['همکارم فاکتورهای ناهار رو بیشتر ثبت می‌کنه.', 'من فقط یه قاعده می‌خوام. اگه گزارش ندم شریک جرمم دیگه، نه؟ حق با کیه؟']],
      ['s14 taste', ['سلام! این چند هفته فهمیدم از مسئله‌های نابرابری خیلی بیشتر از هندسه لذت می‌برم. حالا چی کار کنم؟']],
      ['s35 proverb', ['دو بار طرح تفکیک زباله تو محله رو اجرا کردیم، هر دو بار بعد از یک ماه ول شد. به قول قدیمی‌ها آب که از سر گذشت چه یک وجب چه صد وجب.']],
      ['s06 abandon', ['ارث پدری: سه وارثیم و خونه رو هر سه می‌خوایم.', 'می‌خوام کل این تحلیل رو بندازم دور، از صفر شروع کنم.']],
      ['s31 look-back', ['حلش کردم! بیشترین حاصل‌ضرب اعداد مثبتی که جمعشون ۱۰ ه وقتیه که همه‌شون مساوی‌ان، ۵×۵=۲۵. سؤال بعدی؟']],
      ['s36 notation', ['«۲۰ لیتر آب‌نمک ۱۰٪ داریم. چند لیتر آب‌نمک ۲۵٪ اضافه کنیم تا ۱۵٪ بشه؟» من از x بدم میاد، همیشه با حدس و خطا حل می‌کنم.']],
      ['s18 goal', ['یه قیف مخروطی (نوک پایین) با شعاع دهانه ۱۰ سانت و ارتفاع ۳۰ سانت داریم. آب با نرخ ثابت ۵ سانتی‌متر مکعب در ثانیه از ته خارج می‌شه. وقتی عمق آب ۱۲ سانته، سطح آب با چه سرعتی پایین میاد؟', 'نرخ حجم داده شده: V با سرعت ۵ کم می‌شه. حجم آب V = ⅓πr²y. ولی r رو نمی‌دونم! داده کمه.']],
      ['s10 indirect', ['ثابت کن رادیکال ۲ گنگه.', 'چرا باید فرض کنم همه برقرارند؟ برهان خلف رو نمی‌فهمم.']],
    ];
    for (const [name, msgs] of T) { await newSess(); for (const m of msgs) await say(m); judge(name, await lastUser()); }
    // مسئلهٔ زنده: گیر، حدس، رد
    await day(0);
    const P = await mk({ title: 'قفسهٔ انباری', st: 'می‌خواهم انباریِ ۴ متری را طوری قفسه بزنم که همهٔ جعبه‌ها جا شوند؛ چند طبقه و کجا؟', nat: 'life' });
    await understand({ one: 'دنبالِ چیدمانِ قفسهٔ انباری هستم', unk: 'چیدمانِ قفسه', data: ['انباری ۴ متر است', 'بیست جعبه داریم'], cond: 'همهٔ جعبه‌ها جا شوند', guess: 'سه طبقه کنارِ دیوارِ بلند', nat: 'life' });
    await savePlan('نخست جعبه‌ها را می‌شمارم سپس سه طبقه کنارِ دیوارِ بلند می‌زنم');
    await pageSess(P);
    for (const m of ['نمی‌دونم از کجا شروع کنم. گیر کردم.', 'فکر کنم چهار طبقه لازمه، درسته؟', 'به قولِ معروف کار از محکم‌کاری عیب نمی‌کنه؛ می‌خوام دو تا قفسه اضافه بذارم.', 'می‌خوام کل این طرح رو بندازم دور.', 'چرا باید جعبه‌ها رو بشمارم؟ کلی‌تر کنم برای هر انباری؟']) { await say(m); judge('live: ' + m.slice(0, 30), await lastUser()); }
    info.struct.n = SC.cases.length; info.struct.bad = SC.cases.filter(x => x.n > 1).map(x => x.name);
  });

  // ================= livenew — «🔭 مسئله ثبت شد — باز کن» =================
  await section('livenew', async () => {
    const r = info.livenew = {}; r.stage = 'home';
    await newSess();
    await act({ reply: 'ثبتش کردم.', actions: [{ do: 'live_new', title: 'مخزنِ آبِ باران', statement: 'می‌خوام آب بارونِ پشت‌بوم رو برای آبیاریِ باغ جمع کنم؛ مخزن چقدر بزرگ باشه؟', nat: 'practical' }] });
    await say('می‌خوام آب بارونِ پشت‌بوم رو برای آبیاریِ باغ جمع کنم؛ مخزن چقدر بزرگ باشه؟ ثبتش کن.');
    await W(400);
    r.home = await p.evaluate(() => { const s = APP.ASSIST.cur(), m = (s.msgs || []).filter(x => x.role === 'sys' && x.go)[0]; return { view: APP.state.view, arg: APP.state.arg, msg: m ? m.text : '', go: m ? m.go : null, pid: m && m.go ? m.go.arg : '' }; });
    await p.evaluate(() => APP.ASSIST.toggle(true)); await W(200);
    r.chip = await p.locator('.as-panel .as-go').count();
    await p.evaluate(() => APP.ASSIST.toggle(false));
    chk(/مسئله ثبت شد/.test(r.home.msg) && r.home.go && r.home.go.view === 'lprob' && r.chip > 0, 'livenew: live_new from chat confirms in the chat («🔭 مسئله ثبت شد — …») with a «🔭 باز کن» chip (s13, s17, s19) ' + JSON.stringify(r));
    chk(r.home.view === 'lprob' && r.home.arg === r.home.pid, 'livenew: … and, the user not being on a form, the page navigates to the new problem ' + JSON.stringify(r.home));
    // روی فرم (صفحهٔ مسئلهٔ دیگری) ⇒ نمی‌رود؛ دکمه هست و کار می‌کند
    r.stage = 'form';
    const P0 = r.home.pid; await go('lprob', P0); await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); __calls.length = 0; __q.length = 0; });
    await act({ reply: 'ثبت شد.', actions: [{ do: 'live_new', title: 'تعمیرِ سقف', statement: 'سقفِ انباری چکه می‌کنه؛ اول کجا رو تعمیر کنم که زمستون خراب‌تر نشه؟', nat: 'practical' }] });
    await say('یه مسئلهٔ دیگه هم دارم که جدا می‌خوام حلش کنم: سقفِ انباری چکه می‌کنه؛ اول کجا رو تعمیر کنم؟ ثبتش کن.');
    await W(400);
    r.form = await p.evaluate(() => { const s = APP.ASSIST.cur(), m = (s.msgs || []).filter(x => x.role === 'sys' && x.go).pop(); return { view: APP.state.view, arg: APP.state.arg, go: m ? m.go.arg : '' }; });
    /* دورِ ۲۰ (MT1، models class 7، s29): مسئله‌ای که خودش خواست («… جدا می‌خوام حلش کنم … ثبتش کن») حتی از صفحهٔ مسئلهٔ دیگری باز می‌شود (پیش‌تر نمی‌رفت و مسئلهٔ دوم گم می‌شد) */
    chk(r.form.go && r.form.arg === r.form.go && r.form.arg !== P0 && r.form.view === 'lprob', 'livenew (round 20 MT1): her own request from another problem\'s page opens the new problem ' + JSON.stringify(r.form));
    await p.evaluate(() => APP.ASSIST.toggle(true)); await W(200);
    await p.locator('.as-panel .as-go').last().click(); await W(250);
    r.clicked = await p.evaluate(() => APP.state.arg); await p.evaluate(() => APP.ASSIST.toggle(false)); delete r.stage;
    chk(r.clicked === r.form.go, 'livenew: the «🔭 باز کن» chip opens the new problem ' + JSON.stringify(r));
  });

  // ================= terr — «ثانیه» و «معقولات ثانیه» =================
  await section('terr', async () => {
    const r = info.terr = {};
    const rel = (t) => p.evaluate(t => APP.SYST.related(t, 6).map(x => x.a.id), t);
    r.s18 = await rel('یه قیف مخروطی (نوک پایین) با شعاع دهانه ۱۰ سانت و ارتفاع ۳۰ سانت داریم. آب با نرخ ثابت ۵ سانتی‌متر مکعب در ثانیه از ته خارج می‌شه. وقتی عمق آب ۱۲ سانته، سطح آب با چه سرعتی پایین میاد؟ حجم مخروط ⅓πr²h = ⅓·π·۱۰۰·۱۲ تقسیم بر ۵ ثانیه؟');
    chk(!r.s18.includes('a_concept_types'), 'terr: «ثانیه» (seconds) + «تقسیم» do not pull a_concept_types («معقولات اولی و ثانیه») — a parenthetical alternate name is not the area\'s name on its own (s18) ' + JSON.stringify(r));
    r.alt = await rel('فرق معقولات اولی و ثانیه چیه؟ مفهوم علیت از کدومه؟');
    chk(r.alt.includes('a_concept_types'), 'terr: control — the alternate name written in full («معقولات اولی و ثانیه») still links the area ' + JSON.stringify(r));
  });

  info.sys2 = await p.evaluate(() => APP.ASSIST.SYS.length);
  chk(info.sys2 <= 20000, 'SYS ≤ 20000 at the end: ' + info.sys2);
  console.log(JSON.stringify(info).slice(0, 14000));
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
