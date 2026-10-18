// تورِ پولیا (دستهٔ ۱، دورِ ۲۲، سهمِ «turnq+class» — ۲۰۲۶-۱۰-۱۸) — DECISIONS_R22: P4 (پرسشِ نوبت، یک منبع) و P5 (ردبندیِ پیام).
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۲ (A22-1/2/3/5/7/14/22/27، C22-1/2/3/4/13، B·D1/D9/D10/D11/D12/D17، D s31/s34/s35/dp3)
//  bank     همهٔ ورودی‌های P4 و P5 در بانکِ مستقلِ tests/variants/VARIANTS_R22.json (بقیه با دلیل در info.nc)
// LLA_FILE = ساختِ دیگر؛ ONLY=next,recheck,stuck,twoq,scan,class,route,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = [process.env.LLA_VARIANTS, path.join(__dirname, 'variants', 'VARIANTS_R22.json')].find(f => f && fs.existsSync(f));
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
    /* پرسشِ نوبت از پرامپت (سطرِ «در این نوبت فقط یک پرسش … «Q»» یا «**پرسشِ این نوبت همین است:**»)، با «…» ِ تودرتو */
    window.__topQ = (l) => { const o = []; let d = 0, st = -1; for (let i = 0; i < l.length; i++) { if (l[i] === '«') { if (d === 0) st = i + 1; d++; } else if (l[i] === '»' && d > 0) { d--; if (d === 0 && st >= 0) { o.push(l.slice(st, i)); st = -1; } } } return o; };
    window.__tq = (u) => { const h = String(u || '').split('# نوبتِ تازه')[0].split('\n');
      const l = h.find(x => /\*\*پرسشِ این نوبت همین است:?\*\*/.test(x) && !/^- زمینه/.test(x)) || h.find(x => /^- در این نوبت فقط \*\*یک\*\* پرسش/.test(x)) || '';
      const qs = __topQ(l).filter(x => /[؟?]/.test(x)); return { line: l, q: qs[0] || l.replace(/^.*\*\*پرسشِ این نوبت همین است:?\*\*\s*/, '') }; };
    window.__turn = async (text, reply, actions, extra) => {
      const n0 = __calls.length; __q.push(typeof reply === 'function' ? reply : R({ reply: reply || 'باشه.', actions: actions || [] })); (extra || []).forEach(x => __q.push(x));
      await APP.ASSIST.send(text); __q.length = 0;
      const all = __calls.slice(n0), c = all.filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {};
      return { sys: c.sys || '', user: c.user || '', task: c.task || '', n: all.length, all: all.map(x => x.user), tasks: all.map(x => x.task) };
    };
    /* پاسخِ مدل = همان پرسشِ نوبتِ صفحه (با پیش‌درآمد)، به شکلِ دوجمله‌ایِ اصلیِ صفحه اگر داده شد */
    window.__echo = async (text, pre, orig) => __turn(text, (u) => { const t = __tq(u); window.__lastTQ = t.q; return R({ reply: (pre || '') + (orig === 'ORIG' ? t.q.replace(/؛/g, '؟') : orig || t.q) }); }, [], [R({ reply: 'یک پرسش.' })]);
    window.__fresh = (view) => { APP.go(view || 'home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'kitem', 'pbitem', 'wchain', 'case', 'practice', 'ex', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
    window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {};
      ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L); APP.S.put(pg); };
    /* مسئلهٔ زنده در «اجرا» با یک گامِ بسته (نتیجه و تأملش ثبت شد) — همان راه‌اندازیِ A21-2 */
    window.__exec = (title, nat, o) => { o = o || {}; const pid = __live(title, o.st); const r = APP.liveRec(pid); if (nat) { r.p.nat = nat; r.p.natBy = 'user'; } if (o.kind) r.p.kind = o.kind; APP.S.put(r.p);
      APP.liveBindSession(pid, __cur());
      __liveSet(pid, (so, L) => { so.u = { 1: Object.assign({ done: true, u: o.u || title, dl: o.dl || [{ t: 'داده‌ای' }], c: o.c || 'شرط' }, o.type ? { type: o.type } : {}) }; L.plan = { t: o.plan || 'طرحِ آزمون', at: '2026-10-16T08:00:00.000Z' }; L.c0Asked = {};
        L.steps.push({ id: 's1', text: o.step || 'گام ۱', pred: 'شاید', at: '2026-10-17T08:00:00.000Z', due: '2026-10-17', closed: true,
          out: Object.assign({ at: '2026-10-17T09:00:00.000Z', d: '2026-10-17', done: 'yes', match: 'yes', what: 'انجام شد', prog: 'کمی', guess: { reflect: 'نزدیک بود' } }, o.out || {}) }); });
      return pid; };
    window.__st = () => { const s = __cur(), C = s.coach || {}; return { stmt: C.stmt || '', ph: C.ph || '', guesses: (C.guesses || []).map(g => g.text), ask20: C.ask20 || null }; };
  }, T0);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const blockOf = (u, re) => head(u).split(/\n(?=# )/).filter(bl => re.test(bl.split('\n')[0]))[0] || '';
  const turn = (text, reply, actions, extra) => p.evaluate(([t, r, a, x]) => __turn(t, r, a, x), [text, reply || '', actions || [], extra || []]);
  const echo = (text, pre, orig) => p.evaluate(([t, pr, o]) => __echo(t, pr, o), [text, pre || '', orig || '']);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const st = () => p.evaluate(() => __st());
  const tq = (u) => p.evaluate((u) => __tq(u), u.user || u);
  const exec = (title, nat, o) => p.evaluate(([t, n, o]) => __exec(t, n, o), [title, nat || '', o || {}]);
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
  const RT = (o) => [cs({ retract: o })];
  const QNEXT = /گامِ بعدیِ تو چیست/;
  /* اسکنِ ساختاریِ پرامپت (همان strict.py ِ گروهِ B): یک سطرِ پرسشِ نوبت؛ «بپرس» بیرون از سطرِ پرسشِ نوبت نه؛ سطرِ پرسشیِ بی‌نشان نه */
  const SKIP = /^# (?:سشن|گفت‌وگو تا این لحظه|نوبتِ تازه|صفحهٔ فعلی|نقشهٔ سامانه|برگه‌های بازِ|پیام‌های اخیرِ صفحه|متنِ فایل‌ها)/;
  const isTurn = (l) => /\*\*پرسشِ این نوبت همین است:?\*\*/.test(l) || /^- پرسش‌های «/.test(l) || /^- در این نوبت فقط \*\*یک\*\* پرسش/.test(l) || /^- پرسش‌های همین مرحله \(/.test(l) || /^- داورِ این مسئله هنوز انتخاب نشده: پیش از هر پرسشِ دیگر بپرس/.test(l) || /^- همهٔ پرسش‌های این مرحله در صفحه یا گفت‌وگو پاسخ گرفته‌اند/.test(l);
  const isCtx = (l) => /^- زمینه \(نه پرسشِ دوم/.test(l) || /^- \(زمینه، نه پرسشِ دوم/.test(l);
  const scan = (u) => { const bad = []; let nTQ = 0;
    head(u).split(/\n(?=# )/).forEach(bl => { const h = bl.split('\n')[0]; if (!/^# /.test(h) || SKIP.test(h)) return; const bctx = /\n- \(زمینه، نه پرسشِ دوم/.test(bl);
      bl.split('\n').forEach(l => { if ((/\*\*پرسشِ این نوبت همین است:?\*\*/.test(l) && !isCtx(l)) || /^- در این نوبت فقط \*\*یک\*\* پرسش/.test(l)) nTQ++;
        if (isTurn(l) || (/^# تور /.test(h) && /^⚠ در این سشن نشانهٔ پریشانیِ جدی بود/.test(l))) return; const nq = l.replace(/«[^»]*»/g, '«»');
        if (/(?:^|[^آ-ی])بپرس(?![آ-ی])/.test(nq)) bad.push('ASK [' + h.slice(0, 30) + '] ' + l.slice(0, 160));
        else if (/[؟?][»"')\].\s*]*$/.test(l.trim()) && !isCtx(l) && !bctx) bad.push('ENDQ [' + h.slice(0, 30) + '] ' + l.slice(0, 160)); }); });
    return { nTQ, bad }; };
  const qMarks = (q) => { let d = 0, n = 0; for (const c of String(q || '')) { if (c === '«' || c === '(') d++; else if ((c === '»' || c === ')') && d > 0) d--; else if ((c === '؟' || c === '?') && d === 0) n++; } return n; };
  const PROMPTS = [];   // همهٔ پرامپت‌های این آزمون برای اسکنِ ساختاری
  const keep = (u) => { if (u && u.user) PROMPTS.push(u.user); return u; };

  // ================= P4 — جانشینِ «گامِ بعدیِ تو چیست» (A22-3، C22-1) =================
  await section('next', async () => {
    let u, t;
    // A22-3 (i) s04 p5: خواستِ بازگفت پس از گامِ ناکام ⇒ «به شکلِ دیگری بیان کن»
    await wipe(); await fresh(); await exec('ارثِ خانهٔ پدری', 'life', { step: 'جلسهٔ خانوادگی', out: { done: 'yes', match: 'no', prog: 'نه', what: 'دعوا شد' } });
    u = keep(await turn('جلسه خراب شد، دعوامون شد. عصبانیم، وقتم هدر رفت. فکر کنم باید خود مسئله رو یه جور دیگه بگم.', 'باشه.')); t = await tq(u);
    chk(!QNEXT.test(t.q) && /شکلِ دیگری بیان|به زبانِ خودت دوباره بگو/.test(t.q), 'A22-3(i) s04 p5: her restatement request gets the restatement question, never «گامِ بعدیِ تو چیست» ' + JSON.stringify(t.q));
    // A22-3 (ii) s04 p7: گامِ بعدی‌اش را گفت (بی پیش‌بینی) ⇒ پرسشِ پیش‌بینی، نه «گامِ بعدیِ تو چیست»
    await wipe(); await fresh(); await exec('ارثِ خانهٔ پدری', 'life', { step: 'جلسهٔ خانوادگی' });
    u = keep(await turn('باشه. تصمیم گرفتم پنجشنبه یه جلسهٔ کوتاه با خواهر و برادرم بذارم، این بار فقط دربارهٔ زمانِ پرداختِ سهمِ برادرم.', 'باشه.')); t = await tq(u);
    chk(!QNEXT.test(t.q) && /چه می‌شود|پیش‌بینی/.test(t.q), 'A22-3(ii) s04 p7: a next step she already named gets its prediction question, not the successor question ' + JSON.stringify(t.q));
    // A22-3 (iii) s03 p8: برهان زیرِ بازنگری «چیزی جا نینداختم؟» ⇒ «هر گام را وارسی کن»
    await wipe(); await fresh(); await exec('نُه نقطه در مثلث', 'objective', { kind: 'prove', type: 'prove', step: 'تقسیم به ۹ مثلثِ کوچک' });
    u = keep(await turn('برهانمو نوشتم: مثلث رو به ۹ تا مثلثِ ضلع ۱ تقسیم کردم و لانهٔ کبوتری. الان تو بازنگری‌ام. چیزی جا نینداختم؟', 'باشه.')); t = await tq(u);
    chk(!QNEXT.test(t.q) && /هر گام را وارسی/.test(t.q), 'A22-3(iii) s03 p8: a proof under review asks to check each step ' + JSON.stringify(t.q));
    // C22-1 s27 p6: «استدلالم رو سه گام نوشتم. به نظرت درسته؟»
    await wipe(); await fresh(); await exec('آیا ماشین زبان را می‌فهمد؟', 'objective', { kind: 'pod', type: 'pod', step: 'تعریفِ فهمیدن' });
    u = keep(await turn('استدلالم رو سه گام نوشتم. به نظرت درسته؟', 'باشه.')); t = await tq(u);
    chk(!QNEXT.test(t.q) && /هر گام را وارسی/.test(t.q), 'C22-1 s27 p6: «به نظرت درسته؟» on her steps gets «هر گام را وارسی کن» (round 21), not the successor ' + JSON.stringify(t.q));
    // C22-1 s21 p7: حرکت + پیش‌بینی گفت ⇒ نه جانشین (بخشِ به‌کارنرفتهٔ شرط یا «انجامش بده و بگو چه شد»)
    await wipe(); await fresh(); await exec('مات در دو — رخِ گوشه', 'objective', { step: 'کیش با وزیر d7', c: 'سفید در دو حرکت مات کند؛ سیاه هر جوابی می‌تواند بدهد' });
    u = keep(await turn('آها! از آخر فکر کردم: مات چه شکلیه؟ پس اول وزیر یه جای آروم که ردیف هفتم رو بگیره، وزیر b7! اونوقت شاه سیاه فقط e8 یا g8 داره و رخ a8 مات.', 'باشه.')); t = await tq(u);
    chk(!QNEXT.test(t.q) && t.q, 'C22-1 s21 p7: a move with its prediction already stated never gets «گامِ بعدیِ تو چیست…» ' + JSON.stringify(t.q));
    // نگاتیو (بانک #112): گامِ ثبت‌شده و هیچ حرفی از بعد ⇒ جانشین همچنان می‌آید؛ نوبتِ بعدِ بی‌پاسخ دوباره همان نیست (یک بار برای هر نتیجه)
    await wipe(); await fresh(); await exec('خرید یا اجاره', 'life', { step: 'گام ۱: قیمت‌ها را جمع کنم' });
    u = keep(await turn('خب.', 'باشه.')); t = await tq(u); const u2 = keep(await turn('باشه، فکر می‌کنم.', 'باشه.')); const t2 = await tq(u2);
    chk(QNEXT.test(t.q) && !QNEXT.test(t2.q), 'successor: fires on a plain step outcome, and is the turn question only once per outcome (A22-3 s04 p5–p9 asked it five times) ' + JSON.stringify([t.q, t2.q]));
  });

  // ================= P4 — پرسشِ «دوباره وارسی کن» فقط وقتی نتیجه‌ای روی داده بود (A22-7، B·D12) =================
  await section('recheck', async () => {
    let u, t;
    // A22-7 s03 p11: اصلاحِ داده در مسئله‌ای بی نتیجه ⇒ نوبتِ بعد پرسشِ بازوارسی نیست (پرسشِ آزمونِ حدس می‌ماند)
    await wipe(); await fresh(); await turn('یه مسئلهٔ تازه: ۹ نقطه داخل یک مثلث متساوی‌الاضلاع به ضلع ۳ داریم؛ ثابت کن دو تاشون فاصله‌شون حداکثر ۱ هست.', 'چه می‌دانی؟');
    await turn('ببخشید، ۱۰ نقطه بود نه ۹ نقطه.', 'اصلاح را فرستادم.', RT({ msg: '۹ نقطه', what: 'fact', fix: '۱۰ نقطه' }));
    u = keep(await turn('حدسم اینه که با ارتفاعِ مثلث‌های کوچیک درمیاد.', 'باشه.'));
    chk(!/با مقدارِ اصلاح‌شده[^\n]*دوباره وارسی کند/.test(head(u.user)), 'A22-7 s03 p11: no re-check turn question when no result or verdict used the corrected datum ' + JSON.stringify((head(u.user).match(/\*\*پرسشِ این نوبت همین است:?\*\*[^\n]{0,160}/) || [''])[0]));
    // A22-7 s02 p11: نتیجهٔ وارسی‌شده روی داده بود ⇒ پرسشِ بازوارسی؛ ولی در نوبتی که خودش بازوارسی را گزارش می‌کند، نه
    const solved = async () => { await wipe(); await fresh(); await turn('یه مسئله: بامِ انبار ۲۰۰ مترمربعه و بارش سالانه ۲۵۰ میلی‌متر؛ چند لیتر آب جمع می‌شه؟', 'مجهول؟');
      await turn('۵۰ هزار لیتر، با ضرب ۲۰۰ در ۰٫۲۵ چک کردم درسته. درسم: واحدها رو یکی کنم', 'ثبت شد.', [{ do: 'chat_solved', title: 'آبِ بام', statement: 'بامِ انبار ۲۰۰ مترمربعه و بارش سالانه ۲۵۰ میلی‌متر؛ چند لیتر آب جمع می‌شه؟', kind: 'find', lesson: 'واحدها رو یکی کنم', check: 'با ضرب ۲۰۰ در ۰٫۲۵ چک کردم درسته', checkMsgs: ['۵۰ هزار لیتر، با ضرب ۲۰۰ در ۰٫۲۵ چک کردم درسته. درسم: واحدها رو یکی کنم'] }]);
      await turn('بام ۱۸۰ ـه نه ۲۰۰، اشتباه گفتم', 'اصلاح را فرستادم.', RT({ msg: '۲۰۰ مترمربعه', what: 'fact', fix: '۱۸۰' })); };
    await solved(); u = keep(await turn('خب حالا چی؟', 'باشه.'));
    const pos = /با مقدارِ اصلاح‌شده[^\n]*دوباره وارسی کند/.test(head(u.user));
    await solved(); u = keep(await turn('با ۱۸۰ دوباره حساب کردم، شد ۴۵ هزار لیتر.', 'باشه.'));
    chk(pos && !/با مقدارِ اصلاح‌شده[^\n]*دوباره وارسی کند/.test(head(u.user)), 'A22-7 s02/B·D12 bp2: the re-check question comes after a verdict-dependent correction, but not in the turn where she reports that re-check ' + JSON.stringify({ pos }));
  });

  // ================= P4 — کارتِ گیر فقط وقتی گیر است (A22-2) =================
  await section('stuck', async () => {
    await wipe(); await fresh(); const pid = await exec('خرید یا اجارهٔ خانه', 'practical', { step: 'مقایسهٔ سه گزینه' });
    await turn('نمی‌دونم کدوم ستون مهمه، گیر کردم', 'باشه.', [cs({ stuck: true, ph: 'e' })]);
    const x = await p.evaluate(([pid]) => { const s = __cur(); return { p9: APP.ASSIST.coachTurn(s, pid, 'باشه، قبول. دیگه ستون اضافه نمی‌کنم. طرحمو ثبت کردم و سه گزینه رو فقط با دو شرط، سرانگشتی مقایسه کردم. فکر کنم ج رو انتخاب می‌کنم. ولی این حساب سرانگشتی کافیه؟').stuck,
      hum: APP.ASSIST.coachTurn(s, pid, 'هوم').stuck, own: APP.ASSIST.coachTurn(s, pid, 'گیر کردم، نمی‌دونم بعدش چی کار کنم').stuck }; }, [pid]);
    chk(x.p9 === false && x.hum === true && x.own === true, 'A22-2 s01 p9: a message with her own work and question is not stuck (no set-aside-datum card); «هوم» after a stuck turn and her own «گیر کردم» still are ' + JSON.stringify(x));
    const u = keep(await turn('باشه، قبول. دیگه ستون اضافه نمی‌کنم. طرحمو ثبت کردم و سه گزینه رو فقط با دو شرط، سرانگشتی مقایسه کردم. فکر کنم ج رو انتخاب می‌کنم. ولی این حساب سرانگشتی کافیه؟', 'باشه.'));
    const t = await tq(u); chk(!/کنار گذاشته بودی/.test(t.q), 'A22-2: no stuck card in the prompt for that message ' + JSON.stringify(t.q));
  });

  // ================= P4 — پس‌سنجی: پرسشِ خودِ صفحه یک پرسش است (A22-1، C22-13، B·D9، B·D10) =================
  await section('twoq', async () => {
    let u;
    // A22-1 s01 p6 / s09 p4: پرسشِ آزمونِ حدسِ صفحه، با پیش‌درآمد
    await wipe(); await fresh(); await exec('سود ماهانهٔ کیک', 'practical', { step: 'قیمت فعلی' });
    u = await echo('فکر کنم جوابش ۸۰۰ هزار تومن باشه.', 'خب، ', 'ORIG'); keep(u);
    chk(u.n === 1 && /می‌آزمایی‌اش/.test(await p.evaluate(() => __lastTQ)), 'A22-1 s01 p6: the page\'s own two-sentence guess-test question asked with a preamble is ONE question (no rewrite) ' + JSON.stringify({ n: u.n, tq: (await tq(u)).q }));
    // A22-1 s05 p7: پرسشِ نتیجه با «…» ِ تودرتو، عیناً
    await wipe(); await fresh(); await exec('ایمیل به مدیر', 'life', { step: 'پرسیدن از همکار' });
    u = await echo('حلش کردم! نتیجه این شد که هر سه نفر دوره رو گذرونده بودن، پس مدیرم عمداً جلومو نگرفته.', '', 'ORIG'); keep(u);
    chk(u.n === 1 && /سنجیدی‌اش/.test(await p.evaluate(() => __lastTQ)), 'A22-1 s05 p7 / C22-13: the page\'s result question with nested «…», verbatim, is ONE question ' + JSON.stringify({ n: u.n }));
    // B·D10: پرسشِ نوبتِ صفحه در پرامپت خودش یک پرسش است
    // B·D10: پرسشِ نوبت در پرامپت عیناً متنِ صفحه است (شناسهٔ پرسش)؛ دوجمله‌ای‌اش در پس‌سنجی یک پرسش است — همان دو بررسیِ بالا
    // A22-1 s02 p5: پرسشِ «دادهٔ «…» را کجا به کار برده‌ای؟ اگر هنوز نه…؟» (نقلِ تودرتو) — تابعِ خالص با پرامپتِ همان شکل
    const P = '# مسئلهٔ زندهٔ این سشن (lp): «x»\n- در این نوبت فقط **یک** پرسش (برای وضعِ همین نوبت): «دادهٔ «ارتفاع بار ۱.۶ متر (c)» را کجا به کار برده‌ای؟ اگر هنوز نه، در کدام گام جا دارد — یا با دلیل کنارش می‌گذاری؟». اگر …';
    const x = await p.evaluate((P) => { const Q = APP.ASSIST.pageTQs22(P); const two = (t) => APP.ASSIST.replyTwoQ(t, Q);
      return { nest: two('قطرِ کف را دیده‌ای. حالا خاص‌تر: دادهٔ «ارتفاع بار ۱.۶ متر (c)» را کجا به کار برده‌ای؟ اگر هنوز نه، در کدام گام جا دارد — یا با دلیل کنارش می‌گذاری؟'),
        ex: two('کدام حالت را اول امتحان می‌کنی؟ مثلاً n=۲؟'), ell: two('برهانش؟ چرا برای هر n درست است؟'),
        bul: two('یادداشتِ کوتاه:\n- مجهول چیست؟\n- داده‌ها چیست؟\nحالا کدام را اول می‌نویسی؟'),
        own2: two('مجهول چیست؟ و الان چه داده‌ای داری؟'), own3: two('دادهٔ «ارتفاع» را کجا به کار برده‌ای؟ راستی کِی امتحانش می‌کنی؟ و چقدر وقت داری؟'), alt: two('۱۰ است یا ۲۰؟') }; }, P);
    chk(!x.nest && !x.ex && !x.ell && !x.bul && x.own2 && x.own3 && !x.alt, 'A22-1/B·D9: nested-quote page question, «مثلاً…؟» elaboration, one-word head «برهانش؟», cheat-sheet bullets are one question; the model\'s own extra questions are still flagged ' + JSON.stringify(x));
  });

  // ================= P4 — یک پرسشِ نوبت در کلِ پرامپت (A22-22، B·D11، C22-3) =================
  await section('scan', async () => {
    // B·D11/C22-3: پیشنهادِ «می‌خواهی تمرینش کنیم؟» کنارِ پرسشِ نوبت زمینه است؛ دو سطرِ پرسشِ نوبت ⇒ یکی
    const x = await p.evaluate(() => APP.ASSIST.oneTurnQ22([
      '# معلمِ حلِ مسئله — کاربر همین حالا دارد «x» را حل می‌کند\n- در این نوبت فقط **یک** پرسش بپرس، از همین فهرستِ ثابت و از کلی به خاص؛ پرسشِ پیشنهادیِ این نوبت: «مجهول (یا حکمی که باید ثابت شود) چیست؟»',
      '# مسئلهٔ زندهٔ این سشن (lp): «x»\n- در این نوبت فقط **یک** پرسش (برای وضعِ همین نوبت؛ کارتِ صفحه پرسشِ دیگری نشان می‌دهد — این را بپرس، نه آن را): «حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟». اگر …',
      '# پرونده‌های تمرینِ باز\n- بازنگری: اگر درسی گفت که با برگشتن در روزها تثبیت می‌شود، یک بار در یک جمله پیشنهاد بده («می‌خواهی تمرینش کنیم؟») — تا «آری» نگفته باز نکن.']).join('\n\n'));
    const sc = scan(x + '\n# نوبتِ تازه\nx');
    chk(sc.nTQ === 1 && !sc.bad.length && /# مسئلهٔ زندهٔ این سشن[^\n]*\n- در این نوبت فقط \*\*یک\*\* پرسش/.test(x) && /- زمینه \(نه پرسشِ دوم\): بازنگری/.test(x), 'A22-22/B·D11: one unmarked turn-question directive (the live block\'s), the tutor frame and the practice offer are context, no stray «بپرس» ' + JSON.stringify(sc));
    chk(APP_Q(x) === 'حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟', 'the kept turn question keeps the page\'s exact text (its identity) ' + JSON.stringify(APP_Q(x)));
    // همهٔ پرامپت‌های این آزمون
    const bad = PROMPTS.map(u => ({ s: scan(u) })).filter(o => o.s.nTQ > 1 || o.s.bad.length).slice(0, 3);
    chk(!bad.length, 'P4 strict scan: every prompt built in this test has at most one turn question and no unmarked question directive ' + JSON.stringify(bad));
  });
  function APP_Q(x) { const l = x.split('\n').find(l => /^- در این نوبت فقط \*\*یک\*\* پرسش/.test(l)) || ''; const m = []; let d = 0, s = -1; for (let i = 0; i < l.length; i++) { if (l[i] === '«') { if (d === 0) s = i + 1; d++; } else if (l[i] === '»' && d > 0) { d--; if (d === 0) m.push(l.slice(s, i)); } } return m.filter(q => /[؟?]/.test(q))[0] || ''; }

  // ================= P5 — ردبندیِ پیام =================
  await section('class', async () => {
    let u, s, x;
    // C22-4 / A22-5: درخواستِ تمرین / «بمونه تا مرور کنم» در سشنِ تازه ⇒ نه مسئلهٔ گفت‌وگو، نه «کلِ مسئله را…»
    for (const m of ['می‌خوام این روشِ «اول مجهول و شرط، بعد فقط داده‌هایی که شرط رو عوض می‌کنن» واقعاً تو ذهنم بمونه؛ یه تمرینِ یادآوری برام بذار که هر چند وقت یه بار از حافظه بنویسمش.',
      'می‌خوام این درس که «برای قالب، مساحتِ کف مهمه نه طول» یادم بمونه. چند روز دیگه دوباره بدون نگاه کردن برای خودم توضیحش بدم و ببینم چقدرش یادمه — برام یه تمرین بذار.',
      'این تجزیهٔ x² − y² رو تازه یاد گرفتم. یه جایی هست که بمونه و چند روز بعد دوباره مرورش کنم؟',
      'سه تا چیز تازه یاد گرفتم: مساحت مثلث، فیثاغورس، و این‌که تو مثلثِ دو ضلع برابر قاعده نصف میشه. یه جایی هست که اینا بمونن و مرورشون کنم؟',
      'یه اصلاح: اولش گفتم «دو نفر از من دیرتر اومدن» — سه نفر بودن.']) {
      await wipe(); await fresh(); u = keep(await turn(m, 'باشه.')); s = await st();
      chk(!s.stmt && !/مسئلهٔ گفت‌وگو «/.test(blockOf(u.user, /^# وضعِ کنونی/)) && !/کلِ مسئله را/.test((await tq(u)).q), 'C22-4/A22-5: «' + m.slice(0, 50) + '…» is not a new chat problem ' + JSON.stringify({ stmt: s.stmt, tq: (await tq(u)).q }));
    }
    // C22-4 s23 p9 / s29 p10: خودسنجیِ تمرین حدس نیست؛ حدسِ واقعی هست
    x = await p.evaluate(() => ['امروز بدون نگاه برای خودم توضیحش دادم: کیک یه لایه با ضخامتِ ثابته، پس خمیر به اندازهٔ مساحتِ کف لازمه نه طول. فکر کنم خوب گفتم.',
      'امروز دوباره امتحان کردم ولی فقط یادم بود یکی از نیمسازها رو بکشم؛ دومی یادم رفت. شاید ۴۰٪.', 'فکر کنم جواب ۱۲ باشه', 'فروشگاه ۴۰٪ تخفیف داده، قیمت نهایی چنده؟'].map(t => ({ g: APP.ASSIST.coachGuess(t), sp: APP.ASSIST.statesProblem(t) })));
    chk(!x[0].g && !x[1].g && x[2].g && x[3].sp, 'C22-4: a practice self-rating («فکر کنم خوب گفتم»، «شاید ۴۰٪») is never a guess; «فکر کنم جواب ۱۲ باشه» is; a percent inside a problem is a datum ' + JSON.stringify(x));
    // D register (dp3): «تو» = «در» ضمیر نیست
    x = await p.evaluate(() => ['تو مثلثِ گوشه‌قائمه ارتفاع رو کشیدم، مساحت نصفِ قاعده ضربدر ارتفاعه', 'تو مثلث قائم‌الزاویه وتر همیشه از بقیه بزرگ‌تره دیگه؟', 'تو چی فکر می‌کنی؟', 'این رو به تو گفتم', 'تو بگو، من نمی‌دونم'].map(t => APP.ASSIST.regSigns(t).to));
    chk(!x[0] && !x[1] && x[2] && x[3] && x[4], 'D·dp3: «تو» meaning «در» is not the pronoun; «تو چی فکر می‌کنی؟»، «به تو»، «تو بگو» are ' + JSON.stringify(x));
    await wipe(); await fresh(); await turn('سلام. پسرم یه سؤال آورده که خودمم بلد نیستم: «مساحتِ مثلثی که ضلع‌هاش ۱۳ و ۱۴ و ۱۵ سانتی‌متره رو پیدا کنید.» مساحت رو از کجا بیارم؟ می‌خوام اول خودم بفهمم.', 'از کجا شروع می‌کنید؟');
    await turn('ارتفاع رو نمی‌دونم، چطور پیداش کنم؟ لطفاً راهنمایی کنید.', 'کدام ضلع را قاعده می‌گیرید؟');
    u = await turn('تو مثلثِ گوشه‌قائمه یه ضلع ۱۴ ـه، اون یکی رو نمی‌دونم.', 'در مثلثِ گوشه‌قائمه کدام ضلع را دارید؟', [], [R({ reply: 'در مثلثِ گوشه‌قائمه کدام ضلع را داری؟' })]);
    chk(u.n === 1, 'D·dp3: her «تو مثلثِ…» (= «در») does not force a «تو» rewrite on a «شما» reply ' + JSON.stringify({ n: u.n, all: u.all.slice(1).map(t => t.slice(-160)) }));
    // C22-2: جبرانِ said:result هرگز صورتِ مسئله را نقل نمی‌کند
    await wipe(); await fresh(); await turn('یه مسئله: یه حوض مستطیلی ۸ در ۵ متره و عمقش ۱٫۲ متر؛ چند لیتر آب می‌گیره؟', 'مجهول چیست؟', [cs({ ph: 'u', said: ['result'] })]);
    u = keep(await turn('مجهول حجم آبه.', 'خوب.'));
    chk(!/پیامش نشانِ نتیجه دارد/.test(head(u.user)), 'C22-2: the said:result compensation never says «پیامش نشانِ نتیجه دارد» quoting the problem statement ' + JSON.stringify(blockOf(u.user, /^# گزارشِ نوبتِ پیش/).slice(0, 300)));
    await wipe(); await fresh(); await turn('یه مسئله: یه حوض مستطیلی ۸ در ۵ متره و عمقش ۱٫۲ متر؛ چند لیتر آب می‌گیره؟', 'مجهول چیست؟');
    await turn('جوابم ۴۸ هزار لیتر شد.', 'خوب.', [cs({ ph: 'b', said: ['result'] })]); u = keep(await turn('خب؟', 'باشه.'));
    const bl2 = blockOf(u.user, /^# گزارشِ نوبتِ پیش/);
    chk(!bl2 || (/«جوابم ۴۸ هزار لیتر شد/.test(bl2) && !/حوض مستطیلی/.test(bl2)), 'C22-2 (bank #123): on her own result message the compensation quotes HER result message ' + JSON.stringify(blockOf(u.user, /^# گزارشِ نوبتِ پیش/).slice(0, 300)));
  });

  // ================= P5 — مسیریابیِ گشایش‌ها و بازگشت‌ها =================
  await section('route', async () => {
    let u;
    for (const m of ['جدول امروز: «از جلو و عقب یکی است، در دریا راه می‌رود» — ۵ حرفی. و یه افقی دیگه: حروف «ر ا ت س م ن ه ب» رو مرتب کن، یه کلمه ۸ حرفی. نیم ساعته موندم. شما که ماشینی، بگو.',
      'سلام. پشت‌بوم انبارم ۵۰ متر مربعه. می‌خوام آب بارون رو جمع کنم برای آبیاری درختای جوون پسته.',
      '۵ تا گلدون لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور گذاشتم. قدشون بعد از ۳ هفته: ۴، ۹، ۱۳، ۱۶، ۱۷ سانت. استادم گفت «یه قانون پیدا کن». قانونش چیه؟ فکر کنم خطیه، هر ۲ ساعت ۴ سانت.',
      'دو بار طرح تفکیک زباله تو محله رو اجرا کردیم، هر دو بار بعد از یک ماه ول شد. به قول قدیمی‌ها «آب که از سر گذشت چه یک وجب چه صد وجب». این بار چه کنیم که بمونه؟']) {
      await wipe(); await fresh(); u = await turn(m); chk(u.task === 'lla_coach', 'B·D1/A22-14/D s35: an opening that states a goal or stuck point (no «؟» needed) routes lla_coach «' + m.slice(0, 40) + '…» ' + u.task);
    }
    // D s34 p14: بازگشت در سشنِ تازه دربارهٔ مسئلهٔ بازش ⇒ مربی
    await wipe(); await fresh(); const pid = await p.evaluate(() => { const pid = __live('پروژهٔ پایانیِ ارشد', 'طراحیِ پلانِ یک خانهٔ حیاط‌دار برای پروژهٔ پایانیِ ارشد با حیاطِ مرکزی و دو خیابان'); return pid; });
    await fresh(); u = await turn('سلام، چند روز نبودم. دیروز تو مترو یهو یه ایده برای پلان به ذهنم رسید: حیاط رو به جای وسط، کنار خیابون فرعی بذارم.');
    const on = /حرفش دربارهٔ همین مسئله است/.test(head(u.user));
    chk(!on || u.task === 'lla_coach', 'D s34 p14: a return in a new session about her open problem (the page says «حرفش دربارهٔ همین مسئله است») routes lla_coach ' + JSON.stringify({ on, task: u.task }));
    const x0 = await p.evaluate(() => APP.ASSIST.chatTask({ msg: 'یه ماه گذشت، پروژه داره پیش میره، پلان و مقطع‌ها تقریباً آماده‌ان.', prompt: '# وضعِ کنونی\n- زمینه (نه پرسشِ دوم): هنوز مسئله یا کارِ بازی در این سشن نیست.\n\n# مسئلهٔ بازِ تو (پیشنهاد، نه پیوند)\n- زمینه (نه پرسشِ دوم): مسئلهٔ بازِ تو «پروژهٔ پایانیِ ارشد» — حرفش دربارهٔ همین مسئله است؛ …\n\n# مربیِ حل (روح) —\n- قاعده' }));
    chk(x0 === 'lla_coach', 'D s34 p16: same, pure function ' + x0);
    // D s31 p17: گزارشِ سرانجامِ پیش‌بینیِ خودش ⇒ مربی
    const x1 = await p.evaluate(() => APP.ASSIST.chatTask({ msg: 'یه پیش‌بینیِ تازه هم کرده بودم: «برای جمع ۳۰ بهترین تعداد جزء ۱۱ است» با ۷۰٪ اطمینان — امروز حساب کردم، درست بود.', prompt: '# وضعِ کنونی\n- زمینه (نه پرسشِ دوم): هنوز مسئله یا کارِ بازی در این سشن نیست.\n\n# مربیِ حل (روح) —\n- قاعده' }));
    chk(x1 === 'lla_coach', 'D s31 p17: her report of her own prediction\'s outcome routes lla_coach ' + x1);
    // نگاتیو: فرمانِ صرف، سلام
    const x2 = await p.evaluate(() => [APP.ASSIST.chatTask({ msg: 'یه یادآور برای شنبه ساعت ۹ بذار', prompt: '# مربیِ حل —\n- قاعده' }), APP.ASSIST.chatTask({ msg: 'سلام', prompt: '# مربیِ حل —\n- قاعده' }), APP.ASSIST.chatTask({ msg: 'آره، ثبتش کن', prompt: '# مربیِ حل —\n- قاعده' })]);
    chk(x2.every(t => t === 'lla_assistant'), 'P5 negatives: a reminder command, a greeting and a bare consent stay lla_assistant ' + JSON.stringify(x2));
  });

  // ================= بانکِ مستقلِ VARIANTS_R22 — همهٔ ورودی‌های P4 و P5 =================
  await section('bank', async () => {
    if (!BANK.length) { errors.push('bank: tests/variants/VARIANTS_R22.json missing'); return; }
    const E = {}; BANK.forEach((e, i) => { E[i] = e; });
    const T = (i, ok, x) => { info.bank[i] = !!ok; chk(ok, 'bank#' + i + ' [' + E[i].rc + '/' + E[i].kind + '] «' + E[i].text.slice(0, 70) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 500)); };
    const NC = (i, why) => { info.nc[i] = why; };
    const Uof = (i) => E[i].text.split('‖').map(x => x.trim()).map(x => (/(?:^|\s)U:\s*(.*)$/.exec(x) || [])[1]).filter(Boolean).map(x => x.replace(/^\([^)]*\)\s*/, '').trim());
    /* P8 ِ سمتِ a27 (پیامِ هماهنگ‌کننده): سرانجامِ حدس از داوریِ بعدی، نیم‌فاصلهٔ خودش، C145 روی «ثابت شد» ِ نقل/گذشته */
    const P8MINE = /حدسم ۱۲ ـه|هفته‌ای سه روز|هفته ای|گفتن «ثابت شد»/;
    const p8 = async (e, i) => {
      if (/حدسم ۱۲ ـه/.test(e.text)) { await wipe(); await fresh(); await turn('یه مسئله: سه عدد فرد متوالی که جمعشون ۳۹ ـه چندن؟ کوچیک‌ترینش رو می‌خوام.', 'مجهول؟');
        await turn('حدسم ۱۲ ـه', 'چطور می‌آزمایی‌اش؟', [cs({ guess: { text: '۱۲' } })]);
        if (e.kind === 'pos') await turn('حساب کردم: ۱۱ + ۱۳ + ۱۵ = ۳۹، پس کوچیک‌ترین ۱۱ ـه. با جمع چک کردم درسته.', 'ثبت شد.', [{ do: 'chat_solved', title: 'سه فرد', statement: 'سه عدد فرد متوالی که جمعشون ۳۹ ـه چندن؟ کوچیک‌ترینش رو می‌خوام.', kind: 'find', solution: 'کوچیک‌ترین ۱۱', check: 'با جمع چک کردم', checkMsgs: ['حساب کردم: ۱۱ + ۱۳ + ۱۵ = ۳۹، پس کوچیک‌ترین ۱۱ ـه. با جمع چک کردم درسته.'] }]);
        else await turn('بذار فکر کنم.', 'باشه.');
        const x = await p.evaluate(() => { const s = __cur(); const g = ((s.coach || {}).guesses || [])[0] || {}; let dos = ''; try { const el = APP.DOSSIER && APP.DOSSIER.session ? APP.DOSSIER.session(s.id) : null; dos = el ? (el.textContent || String(el)) : ''; } catch (er) { } return { res: g.res || '', text: g.text || '', dos: dos.slice(0, 50) }; });
        T(i, e.kind === 'pos' ? x.res === 'refuted' : !x.res, x); return; }
      if (/هفته/.test(e.text)) { const her = e.kind === 'pos' ? 'برنامه‌ی هفته‌ای سه روز می‌دوم، از شنبه' : 'برنامه ی هفته ای سه روز می‌دوم، از شنبه';
        await wipe(); await fresh(); await turn('یه مسئله دارم: می‌خوام دوندگی رو شروع کنم ولی هر بار ول می‌کنم. چی کار کنم؟', 'چه چیزی ولت می‌کند؟');
        await turn(her, 'خوب.', [cs({ plan: { text: 'برنامه ی هفته ای سه روز می‌دوم', when: '2026-10-24' } })]);
        const x = await p.evaluate(() => ((__cur().plans || [])[0] || {}).text || ''); T(i, e.kind === 'pos' ? /هفته‌ای/.test(x) && /برنامه‌ی/.test(x) : /هفته ای/.test(x) && /برنامه ی/.test(x), x); return; }
      if (/ثابت شد/.test(e.text)) { const x = await p.evaluate(() => ['اون موقع که گفتن «ثابت شد»، من باور نکردم', 'یعنی روز اول اشتباه کردم که با ده تا مثال گفتم ثابت شد؟', 'دو تا چیز می‌خوام نگه دارم: یکی اشتباهم که با چند تا مثال گفتم «ثابت شد».', 'ده تا مثال امتحان کردم، همیشه درست بود، پس ثابت شد'].map(t => APP.ASSIST.coachHeurClaim(t)));
        T(i, !x[0] && !x[1] && !x[2] && x[3], x); return; }
    };
    const route = async (msg, newSess) => { await wipe(); await fresh(); const u = await turn(msg); return u.task; };
    for (const [e, i] of BANK.map((e, i) => [e, i])) {
      if (/^P8\./.test(e.rc) && P8MINE.test(e.text)) { await p8(e, i); continue; }
      /* بانکِ #40 (P1، بخشِ ضمیر به این سهم سپرده شد): «تو این مسئله…» = «در» ⇒ ضمیرِ «تو» نیست */
      if (/^P1\./.test(e.rc) && /^U: تو این مسئله/.test(e.text)) { const x = await p.evaluate((m) => APP.ASSIST.regSigns(m).to, Uof(i)[0]); T(i, x === false, x); continue; }
      if (!/^P[45]\./.test(e.rc)) continue;
      const tx = e.text, ex = e.expect, U = Uof(i);
      try {
        if (/^P4/.test(e.rc)) {
          if (/صورت مسئله رو بگی/.test(tx)) { await wipe(); await fresh(); await exec('ارثِ خانهٔ پدری', 'life'); const u = await turn(U[0]); const t = await tq(u); T(i, !QNEXT.test(t.q) && /دوباره بگو|شکلِ دیگری بیان/.test(t.q), t.q); continue; }
          if (/n=4 رو امتحان/.test(tx)) { await wipe(); await fresh(); await exec('توان‌های دو', 'objective', { step: 'n=3 را امتحان کردم' }); const u = await turn(U[0]); const t = await tq(u); T(i, !QNEXT.test(t.q) && /انجام بده و بگو چه شد|امتحان/.test(t.q), t.q); continue; }
          if (/گامی که نوشتم، به نظرت درسته/.test(tx)) { await wipe(); await fresh(); await exec('مجموعِ فردها', 'objective', { step: 'گام ۳' }); const u = await turn(U[0]); const t = await tq(u); T(i, /هر گام را وارسی/.test(t.q), t.q); continue; }
          if (/برهانم اینه/.test(tx)) { await wipe(); await fresh(); await exec('مجموعِ فردها', 'objective', { kind: 'prove', type: 'prove', step: 'استقرا' }); const u = await turn('برهانم اینه: برای n=1 درسته، و اگه برای n درست باشه با اضافه کردنِ ۲n+1 برای n+1 هم درسته. پس برای همه‌ی n درسته.'); const t = await tq(u); T(i, !QNEXT.test(t.q) && /وارسی|برهان|پایه|فرض/.test(t.q), t.q); continue; }
          if (/result «۲ ساعت» computed from d2/.test(tx)) { await wipe(); await fresh(); await turn('یه مسئله: دو شیر داریم؛ یکی مخزن رو ۳ ساعته پر می‌کنه یکی ۶ ساعته. با هم چقدر طول می‌کشه؟', 'مجهول؟');
            await turn('۲ ساعت، با ۱/۳ + ۱/۶ = ۱/۲ چک کردم درسته.', 'ثبت شد.', [{ do: 'chat_solved', title: 'دو شیر', statement: 'دو شیر داریم؛ یکی مخزن رو ۳ ساعته پر می‌کنه یکی ۶ ساعته. با هم چقدر طول می‌کشه؟', kind: 'find', check: '۱/۳ + ۱/۶ = ۱/۲ چک کردم', checkMsgs: ['۲ ساعت، با ۱/۳ + ۱/۶ = ۱/۲ چک کردم درسته.'] }]);
            await turn(U[0], 'اصلاح را فرستادم.', RT({ msg: '۶ ساعته', what: 'fact', fix: '۴ ساعته' })); const u = await turn('خب؟', 'باشه.'); T(i, /با مقدارِ اصلاح‌شده[^\n]*دوباره وارسی کند/.test(head(u.user)), (head(u.user).match(/\*\*پرسشِ این نوبت همین است:?\*\*[^\n]{0,140}/) || [''])[0]); continue; }
          if (/اول چه چیزی را می‌دانی؟ و چه چیزی را می‌خواهی؟/.test(tx)) { const x = await p.evaluate(() => { const P = '# مربیِ حل\n- در این نوبت فقط **یک** پرسش: «اول چه چیزی را می‌دانی؟ و چه چیزی را می‌خواهی؟».'; return APP.ASSIST.replyTwoQ('اول چه چیزی را می‌دانی؟ و چه چیزی را می‌خواهی؟', APP.ASSIST.pageTQs22(P)); }); T(i, !x, x); continue; }
          if (/any page turn question/.test(tx)) { NC(i, 'conflicts with a standing contract: the turn question in the prompt is the page question\'s exact text (its identity for the answer ledger, «کدام پرسش کمک کرد؟» and page sync — test_fixes_1015c, test_tour1_assist #6); the harm behind B·D10 (a literal echo sent back by the one-question rewrite) is removed by the post-check, checked in #105 and section twoq'); continue; }
          if (/گیر کردم، نمی‌دونم بعدش/.test(tx)) { const x = await p.evaluate(() => { const s = __cur(); return APP.ASSIST.coachTurn(s, '', 'گیر کردم، نمی‌دونم بعدش چی کار کنم').stuck; }); T(i, x === true, x); continue; }
          if (/A: مجهول چیست؟ ‖ U: زمانِ پر شدن/.test(tx)) { await wipe(); await fresh(); await turn('یه مسئله: دو شیر داریم؛ یکی مخزن رو ۳ ساعته پر می‌کنه یکی ۶ ساعته. با هم چقدر طول می‌کشه؟', 'مجهول چیست؟');
            await turn('زمانِ پر شدن', 'چه داده‌ای داری؟', [cs({ ph: 'u', said: ['u'], ans: ['u1'] })]); await turn('یکی ۳ ساعت یکی ۶ ساعت', 'شرط چیست؟', [cs({ ph: 'u', said: ['d'] })]); const u = await turn('با هم باز می‌شن', 'باشه.');
            const t = await tq(u); T(i, !/^مجهول[^؟]*چیست؟?$/.test(t.q.trim()) && !/«مجهول چیست؟»/.test(t.line), t.q); continue; }
          if (/کیک ۱۸ سانتی بود نه ۲۰/.test(tx)) { await wipe(); await fresh(); await turn('یه مسئله: برای قالبِ کیکِ گرد ۲۰ سانتی ۳ تخم‌مرغ لازمه؛ برای قالبِ ۲۴ سانتی چند تا؟', 'چه می‌دانی؟'); await turn('فکر کنم ۳٫۶ تا میشه', 'چطور می‌آزمایی‌اش؟', [cs({ guess: { text: '۳٫۶ تا میشه' } })]);
            await turn(U[0], 'اصلاح را فرستادم.', RT({ msg: '۲۰ سانتی', what: 'fact', fix: '۱۸ سانتی' })); const u = await turn('خب حالا؟', 'باشه.'); T(i, !/با مقدارِ اصلاح‌شده[^\n]*دوباره وارسی کند/.test(head(u.user)), (await tq(u)).q); continue; }
          if (/با ۳۰ لیتر دوباره حساب کردم/.test(tx)) { await wipe(); await fresh(); await turn('یه مسئله: یه ظرف ۲۰ لیتری با شیرِ ۴ لیتر در دقیقه چقدر طول می‌کشه پر بشه؟ (اول ۲۰ لیتر گفتم)', 'مجهول؟');
            await turn('۵ دقیقه، با ۴ ضربدر ۵ = ۲۰ چک کردم درسته.', 'ثبت شد.', [{ do: 'chat_solved', title: 'ظرف', statement: 'یه ظرف ۲۰ لیتری با شیرِ ۴ لیتر در دقیقه چقدر طول می‌کشه پر بشه؟', kind: 'find', check: '۴ ضربدر ۵ = ۲۰ چک کردم', checkMsgs: ['۵ دقیقه، با ۴ ضربدر ۵ = ۲۰ چک کردم درسته.'] }]);
            await turn('ظرف ۳۰ لیتری بود نه ۲۰ لیتری', 'اصلاح را فرستادم.', RT({ msg: '۲۰ لیتری', what: 'fact', fix: '۳۰ لیتری' })); const u = await turn(U[0], 'باشه.'); T(i, !/با مقدارِ اصلاح‌شده[^\n]*دوباره وارسی کند/.test(head(u.user)), (await tq(u)).q); continue; }
          if (/این حساب سرانگشتی کافیه/.test(tx)) { await wipe(); await fresh(); const pid = await exec('خرید یا اجاره', 'practical'); await turn('نمی‌دونم، گیر کردم', 'باشه.', [cs({ stuck: true })]); const x = await p.evaluate(([pid, m]) => APP.ASSIST.coachTurn(__cur(), pid, m).stuck, [pid, 'سه گزینه رو سرانگشتی مقایسه کردم. ' + U[0]]); T(i, x === false, x); continue; }
          if (/she stated nothing about what's next/.test(tx)) { await wipe(); await fresh(); await exec('خرید یا اجاره', 'life'); const u = await turn('خب.', 'باشه.'); const t = await tq(u); T(i, QNEXT.test(t.q), t.q); continue; }
          if (/«مثلاً با n=2 چی می‌شه؟»/.test(tx)) { const x = await p.evaluate(() => APP.ASSIST.replyTwoQ('برای n=1 درست است؟ مثلاً با n=2 چی می‌شه؟', [])); T(i, !x, x); continue; }
          if (/two genuine new questions/.test(tx)) { const x = await p.evaluate(() => { const P = '# مربیِ حل\n- در این نوبت فقط **یک** پرسش: «مجهول چیست؟».'; return APP.ASSIST.replyTwoQ('مجهول چیست؟ راستی چند سالته؟ و کِی امتحان داری؟', APP.ASSIST.pageTQs22(P)); }); T(i, !!x, x); continue; }
          if (/knot-solver teacher frame \+ live block/.test(tx)) { const x = await p.evaluate(() => APP.ASSIST.oneTurnQ22(['# معلمِ حلِ مسئله — x\n- در این نوبت فقط **یک** پرسش بپرس؛ پرسشِ پیشنهادیِ این نوبت: «مجهول چیست؟»', '# مسئلهٔ زندهٔ این سشن (lp): «x»\n- در این نوبت فقط **یک** پرسش: «به حکم نگاه کن: قضیه‌ای می‌شناسی که همین حکم را دارد؟».']).join('\n\n')); const sc = scan(x + '\n# نوبتِ تازه\nx'); T(i, sc.nTQ === 1 && !sc.bad.length, sc); continue; }
          if (/child 9\) نمی‌دونم/.test(tx)) { await wipe(); await fresh(); await exec('تقسیمِ شکلات', 'objective', { step: 'شمردم' }); const u = await turn('نمی‌دونم', 'باشه.', [cs({ stuck: true })]); const t = await tq(u); T(i, !/دوباره بگو|شکلِ دیگری بیان/.test(t.q) && !!t.q, t.q); continue; }
        }
        if (/^P5/.test(e.rc)) {
          if (e.role === 'route') {
            if (/new session D1/.test(tx)) { await wipe(); await fresh(); await p.evaluate(() => __live('باغچه', 'باغچهٔ ۱۲ متری را چطور بین سه نوع سبزی تقسیم کنم که هر کدام آفتابِ کافی بگیرد')); await fresh(); const u = await turn(U[0]); T(i, u.task === 'lla_coach', { task: u.task, n: u.n, tasks: u.tasks, m: U[0] }); continue; }
            if (/✏️/.test(tx)) { const x = await p.evaluate(() => APP.ASSIST.chatTask({ msg: '[اصلاحِ پیامِ قبلی] «۶» ⇐ «۴»', prompt: '# مربیِ حل —\n- قاعده' })); T(i, x === 'lla_assistant', x); continue; }
            if (/«\[سامانه\]»/.test(tx)) { const x = await p.evaluate(() => APP.ASSIST.chatTask({ msg: '[سامانه: رکورد ساخته شد]', prompt: '# مربیِ حل —\n- قاعده', prev: 'lla_coach' })); T(i, x === 'lla_assistant', x); continue; }
            if (U[0]) { const t = await route(U[0]); T(i, e.kind === 'pos' ? t === 'lla_coach' : t === 'lla_assistant', t); continue; }
          }
          if (/تحویلش پنجشنبه‌ست/.test(tx)) { const x = await p.evaluate((m) => ({ meta: APP.ASSIST.metaMsg22(m), sp: APP.ASSIST.statesProblem(m) }), U[0]); T(i, x.meta === 'deadline' && !x.sp, x); continue; }
          if (/وتر همیشه/.test(tx)) { const x = await p.evaluate((m) => APP.ASSIST.regSigns(m).to, U[0]); T(i, x === false, x); continue; }
          if (/تو چی فکر می‌کنی/.test(tx)) { const x = await p.evaluate((m) => APP.ASSIST.regSigns(m).to, U[0]); T(i, x === true, x); continue; }
          if (/said:result compensation/.test(tx)) { await wipe(); await fresh(); await turn('یه مسئله: حوضی ۸ در ۵ با عمقِ ۱٫۲؛ چند لیتر؟', 'مجهول؟'); await turn('جوابم ۱۲ شد', 'خوب.', [cs({ said: ['result'] })]); const u = await turn('خب؟'); const bl = blockOf(u.user, /^# گزارشِ نوبتِ پیش/); T(i, !/حوضی ۸ در ۵/.test(bl) && (!bl || /«جوابم ۱۲ شد/.test(bl)), bl.slice(0, 260)); continue; }
          if (/40٪ تخفیف|۴۰٪ تخفیف/.test(tx)) { const x = await p.evaluate((m) => ({ meta: APP.ASSIST.metaMsg22(m), sp: APP.ASSIST.statesProblem(m) }), U[0]); T(i, !x.meta && x.sp, x); continue; }
          if (/حالا یه مسئله‌ی جدید/.test(tx)) { await wipe(); await fresh(); await turn('یه تمرین یادآوری برام بذار که اینو یادم بمونه', 'باشه.'); const u = await turn(U[0], 'باشه.'); const s = await st(); T(i, /عدد فرد|۵۷/.test(s.stmt) && /مسئلهٔ گفت‌وگو «/.test(blockOf(u.user, /^# وضعِ کنونی/)), s.stmt); continue; }
          if (/فکر کنم جواب ۱۲ باشه/.test(tx)) { const x = await p.evaluate((m) => APP.ASSIST.coachGuess(m), U[0]); T(i, x === true, x); continue; }
          if (/شاید ۴۰٪|فکر کنم خوب گفتم/.test(tx)) { const x = await p.evaluate((m) => ({ g: APP.ASSIST.coachGuess(m), sp: APP.ASSIST.statesProblem(m) }), U[0]); T(i, !x.g && !x.sp, x); continue; }
          if (e.role === 'chat' && U[0]) { await wipe(); await fresh(); const u = await turn(U[0], 'باشه.'); const s = await st(); const t = await tq(u);
            T(i, !s.stmt && !/کلِ مسئله را/.test(t.q) && !(await p.evaluate((m) => APP.ASSIST.coachGuess(m), U[0])), { stmt: s.stmt, tq: t.q }); continue; }
        }
        NC(i, 'no runnable form in this fixer\'s mechanisms');
      } catch (er) { errors.push('bank#' + i + ' exception: ' + String(er && er.stack || er).split('\n').slice(0, 2).join(' | ')); }
    }
    const mine = BANK.map((e, i) => [e, i]).filter(([e]) => /^P[45]\./.test(e.rc) || (/^P8\./.test(e.rc) && P8MINE.test(e.text)) || (/^P1\./.test(e.rc) && /^U: تو این مسئله/.test(e.text))).map(([, i]) => i);
    const miss = mine.filter(i => !(i in info.bank) && !(i in info.nc)); chk(!miss.length, 'bank coverage: every P4/P5 entry judged or given a reason ' + JSON.stringify(miss));
  });

  const nOk = Object.values(info.bank).filter(Boolean).length; info.summary = { judged: Object.keys(info.bank).length, pass: nOk, nc: Object.keys(info.nc).length };
  console.log(JSON.stringify(info.summary), JSON.stringify(info.nc));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
