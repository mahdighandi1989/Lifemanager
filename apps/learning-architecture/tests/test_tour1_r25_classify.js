// تورِ پولیا (دستهٔ ۱، دورِ ۲۵، سهمِ «classify» — ۲۰۲۶-۱۱-۱۱) — DECISIONS_R25 P6: گشایش، ردبندی، سنجشِ پس از پاسخ، ضمیر
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۵: C25-2 (s21 p3)، C25-11 (pwC1 p1)، A24-10 (aA4 p1)، A23-14 (aA3، aA4، pA1 p1)، D25-23 (aD3 c9)، C25-3 (s25 p10)، A25-17 (tA1 p9→p10، oA1 p25→p26)،
//           D25-14 (pwD2 p2)، D25-13 (pwD2 p7)، B24·D12 STILL (s13 p7، s19، aB3 p13)، B25·D21/B_s D10 (s19 p8–p16)، A25-11/A25-12-b (pwA1)، D23-38 (dp3 p10/p12)
//  bank     همهٔ ورودی‌های P6 در بانکِ مستقلِ tests/variants/VARIANTS_R25.json (#187–#215)؛ آن‌چه برآورده نشد با دلیل در info.nc — هیچ ورودی‌ای بی‌صدا رد نمی‌شود.
//  ساعتِ صفحه یخ زده است (APP.today = روزِ ثابت) — هیچ انتظاری به تاریخِ تقویم بسته نیست؛ سن‌ها از همان روزِ یخ‌زده حساب می‌شوند.
// LLA_FILE = ساختِ دیگر؛ ONLY=nav,intro,reg,store,post,invent,oneq,ladder,fact,still,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = [process.env.LLA_VARIANTS25, path.join(__dirname, 'variants', 'VARIANTS_R25.json')].find(f => f && fs.existsSync(f));
const BANK = BANKF ? JSON.parse(fs.readFileSync(BANKF, 'utf8')) : [];

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {}, bankWrong: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
  const T0 = '2026-10-19';   // دوشنبه، ۲۷ مهر ۱۴۰۵ (همان «امروز» ِ بانک)
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0;
    APP.today = () => window.__day;
    APP.HOST = null;
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
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
    window.__fresh = (view) => { APP.go(view || 'home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'kitem', 'pbitem', 'wchain', 'case', 'practice', 'ex', 'prc', 'prereq', 'psyans'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur');
      const st = APP.S.settings(); st.profile = {}; APP.S.saveSettings(st); };
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
    window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {};
      ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L); APP.S.put(pg); };
    window.__exec = (title, nat, o) => { o = o || {}; const pid = __live(title, o.st); const r = APP.liveRec(pid); if (nat) { r.p.nat = nat; r.p.natBy = 'user'; } if (o.kind) r.p.kind = o.kind; APP.S.put(r.p);
      APP.liveBindSession(pid, __cur());
      __liveSet(pid, (so, L) => { so.u = { 1: Object.assign({ done: true, u: o.u || title, dl: o.dl || [{ t: 'داده‌ای' }], c: o.c || 'شرط' }, o.type ? { type: o.type } : {}) }; L.plan = { t: o.plan || 'طرحِ آزمون', at: '2026-10-16T08:00:00.000Z' }; L.c0Asked = {};
        L.steps.push({ id: 's1', text: o.step || 'گام ۱', pred: 'شاید', at: '2026-10-17T08:00:00.000Z', due: '2026-10-17', closed: true,
          out: Object.assign({ at: '2026-10-17T09:00:00.000Z', d: '2026-10-17', done: 'yes', match: 'yes', what: 'انجام شد', prog: 'کمی', guess: { reflect: 'نزدیک بود' } }, o.out || {}) }); });
      return pid; };
    window.__st = () => { const s = __cur(), C = s.coach || {}; return { stmt: C.stmt || '', ph: C.ph || '' }; };
    window.__msgs = () => (__cur().msgs || []).map(m => ({ role: m.role, text: m.text }));
  }, T0);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const blockOf = (u, re) => head(u).split(/\n(?=# )/).filter(bl => re.test(bl.split('\n')[0]))[0] || '';
  const turn = (text, reply, actions, extra) => p.evaluate(([t, r, a, x]) => __turn(t, r, a, x), [text, reply || '', actions || [], extra || []]);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const st = () => p.evaluate(() => __st());
  const tq = (u) => p.evaluate((u) => __tq(u), u.user || u);
  const exec = (title, nat, o) => p.evaluate(([t, n, o]) => __exec(t, n, o), [title, nat || '', o || {}]);
  const ev = (fn, arg) => p.evaluate(fn, arg);
  const setB = (v) => ev((v) => { const st = APP.S.settings(); st.profile = st.profile || {}; if (v) st.profile.birth = v; else delete st.profile.birth; delete st.profile.ageSaid; delete st.profile.birthMD; delete st.profile.reg; APP.S.saveSettings(st); }, v || '');
  const NOWORK = /هنوز مسئله یا کارِ بازی در این سشن نیست/;
  const DROPUSE = /درخواستِ نگه‌داشتن\/گزارشِ کاربست/;
  /* پرامپتِ کمینهٔ نوبت با پرسشِ نوبتِ صفحه (همان شکلِ سطرِ a38) */
  const tqPrompt = (q) => '# مسئلهٔ زندهٔ این سشن (lp)\n- در این نوبت فقط **یک** پرسش (برای وضعِ همین نوبت؛ پرسشی را که کاربر پاسخ داده دوباره نپرس): «' + q + '». اگر با وضعِ همین لحظه نمی‌خواند، پرسشِ دیگری.\n# نوبتِ تازه\nx';

  const bd = (t) => ev((t) => { const el = document.createElement('div'); APP.ASSIST.bidiNodes(t).forEach(n => el.append(n)); return el.innerHTML.replace(/<bdi[^>]*>/g, '[').replace(/<\/bdi>/g, ']'); }, t);
  const rc = (reply, prompt) => ev(([reply, prompt]) => { const s = __cur(); APP.ASSIST._turnSession = s; return APP.ASSIST.replyCheck({ reply, actions: [] }, { prompt: prompt || '# نوبتِ تازه\nx', task: 'lla_coach' }); }, [reply, prompt || '']);
  const birthFor = (age) => ev(([age, T0]) => { const d = new Date(T0 + 'T00:00:00Z'); d.setUTCFullYear(d.getUTCFullYear() - age); d.setUTCMonth(d.getUTCMonth() - 2); return d.toISOString().slice(0, 10); }, [age, T0]);
  const sysDom = () => ev(async () => { APP.ASSIST.toggle(true); await new Promise(r => setTimeout(r, 250)); return [...document.querySelectorAll('.as-panel .as-tx')].map(e => e.textContent); });
  const sysStored = () => ev(() => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text));
  const pushSys = (t) => ev((t) => { const s = __cur(); s.msgs.push({ role: 'sys', at: new Date().toISOString(), text: t }); APP.S.put(s); APP.ASSIST.paint && APP.ASSIST.paint(); }, t);
  const NAVBAD = /چیزی پر نکن و دکمه‌ای نزن/;
  const follow = (r) => r.all.filter(u => /\[سامانه: «[^»]*»[^\]]*باز شد/.test(String(u.split('# نوبتِ تازه\n')[1] || '')))[0] || '';

  // ================= C25-2 (S2، s21 p3): پیگیریِ پس از رفتن، دکمه‌ای را که خواسته‌اش از آن می‌گذرد ممنوع نمی‌کند =================
  await section('nav', async () => {
    await wipe(); await fresh();
    await turn('سفید بازی می‌کند و در دو حرکت مات می‌کند؛ شاه فرار می‌کنه و نمی‌دونم رخ چرا اونجاست.', 'مجهول چیست؟');
    const r = await turn('آره، این مسئله رو ثبتش کنیم.', 'می‌برمت به فهرستِ مسئله‌ها.', [{ do: 'go', view: 'lprob' }]);
    const f = follow(r), tail = String(f.split('# نوبتِ تازه\n')[1] || '');
    chk(!!f, 'C25-2: the page sent a follow-up after go to the problems list (n=' + r.n + ')');
    const nFields = await ev(() => document.querySelectorAll('#main input:not([type=hidden]), #main textarea, #main select').length);
    if (!nFields) { chk(!NAVBAD.test(tail), 'C25-2 s21 p3: the follow-up no longer forbids every button after «ثبتش کنیم» — ' + tail.slice(0, 260));
      chk(/همان یک دکمه/.test(tail) && /ثبتش کنیم/.test(tail), 'C25-2: the follow-up names her own request and allows the one button that reaches it — ' + tail.slice(0, 260)); }
    else info.navNote = 'problems list has ' + nFields + ' fields in this build — the field branch applies';
    // control: a read-only view and no request ⇒ the old «press nothing» stays
    await wipe(); await fresh(); const r2 = await turn('نقشهٔ قلمرو رو نشونم بده', 'باشه.', [{ do: 'go', view: 'sterr' }]);
    const t2 = String(follow(r2).split('# نوبتِ تازه\n')[1] || '');
    if (t2) { chk(!/فیلدهای این صفحه را پر کن/.test(t2) || (await ev(() => document.querySelectorAll('#main input:not([type=hidden]), #main textarea, #main select').length)) > 0, 'bank #188: no «فیلدها را پر کن» for a view without fields — ' + t2.slice(0, 200)); }
    chk(await ev(() => APP.ASSIST.wantsAct25('آره، ثبتش کنیم.') && APP.ASSIST.wantsAct25('بازش کن') && !APP.ASSIST.wantsAct25('این کجاست؟') && !APP.ASSIST.wantsAct25('نقشه رو نشونم بده')), 'C25-2: her own action request is read from her message (ثبت/باز کن), a question is not a request');
  });

  // ================= C25-11، A24-10: معرفیِ بلند و سنِ به حروف از صورتِ مسئله جدا می‌شود =================
  await section('intro', async () => {
    const C = [
      ['سلام. کیوانم، ۳۸ سالمه، مهندس مکانیکم و باغ پستهٔ خانوادگی‌مون تو رفسنجانه. یه ایده دارم و یه بخشش رو خودم جلو بردم؛ می‌خوام ببینی تا کجا درسته و بقیه‌ش رو با هم ببریم.\nایده: آبیاری قطره‌ای با پمپ خورشیدی که خودش تصمیم بگیره کی آبیاری کنه.', /^باغ پستهٔ/, /کیوانم|۳۸ سالمه|مهندس مکانیکم/, 'C25-11 pwC1 p1'],
      ['سلام. من هشتاد و یک سالمه، تولدم ۱۵ تیره. خیاطِ بازنشسته‌ام. برای اتاقِ نوه‌ام پرده می‌دوزم. پنجره ۱۸۰ سانت عرض و ۱۵۰ سانت ارتفاع دارد. چند متر پارچه بخرم؟', /^برای اتاقِ نوه‌ام/, /هشتاد و یک|تولدم|خیاطِ بازنشسته/, 'A24-10 aA4 p1'],
    ];
    for (const [m, start, gone, tag] of C) { const x = await ev((m) => APP.ASSIST.stripIntro23(m), m); chk(start.test(x) && !gone.test(x), tag + ': the statement starts at the problem — ' + x.slice(0, 80)); }
    // whole path: the chat statement kept by the page
    await wipe(); await fresh(); await turn(C[1][0], 'خوش آمدید.'); const s = await st();
    chk(/^برای اتاقِ نوه‌ام/.test(s.stmt), 'A24-10 aA4 p1: the kept chat statement has no age/birthday/job — ' + s.stmt.slice(0, 80));
    chk((await ev(() => APP.AGE.age())) === 81, 'A24-10: the age in words is still read (81) from the full message');
    // controls: the age is data of the problem; feelings / problem sentences are not an introduction
    const keep = ['من ۱۲ سالمه و برادرم ۱۵ سالشه؛ چند سال دیگه سنِ من دو سومِ سنِ اون میشه؟', '۴۱ سالمه و می‌خوام بدونم با این سن میشه رشته عوض کرد و برنامه‌نویس شد یا نه', 'خسته‌ام کلاس داشتم. یه مسئله دارم: ۲x+3=7'];
    for (const m of keep) { const x = await ev((m) => APP.ASSIST.stripIntro23(m), m); chk(x === m || x.indexOf(m.slice(0, 12)) === 0, 'control: not an introduction, stays — ' + x.slice(0, 60)); }
    const x2 = await ev(() => APP.ASSIST.stripIntro23('سلام. مستأجرم. صاحبخونه می‌خواد اجاره رو ۴۰٪ زیاد کنه. چیکار کنم؟')); chk(/^مستأجرم/.test(x2), 'control: a lone «…م» sentence without a strong identity clause stays (it is the situation) — ' + x2.slice(0, 40));
    const x3 = await ev(() => APP.ASSIST.stripIntro23('سلام، ۳۸ سالمه و تو فکرِ خریدِ خونه‌ام. با ۲ میلیارد چی بخرم؟')); chk(/^تو فکرِ خریدِ خونه‌ام/.test(x3), 'control: a prepositional «…‌ام» clause is the problem, not identity — ' + x3.slice(0, 40));
  });

  // ================= ضمیر: A23-14، D25-23، C25-3، D23-38، A25-17 =================
  await section('reg', async () => {
    // D25-23 aD3 c9 / C25-3 s25 p10 — the page's own sentences, one register
    const a = await ev(() => [APP.ASSIST.toShoma('آن نتیجه را خودت آزمودی و رد شد — «رد شد» همان می‌ماند؛ عددِ تازه نتیجهٔ تازهٔ توست، نه اصلاحِ حرفِ پیشین'), APP.ASSIST.toShoma('✓ حدسی که در بازنگری ساختی و می‌آزمایی حالا مسئلهٔ زنده است — همین حالا رویش کار می‌کنیم.')]);
    chk(/خودتان آزمودید/.test(a[0]) && /نتیجهٔ تازهٔ شماست/.test(a[0]) && !/توست/.test(a[0]), 'D25-23 aD3 c9: one register in the sentence — ' + a[0]);
    chk(/ساختید و می‌آزمایید/.test(a[1]), 'C25-3 s25 p10: the wake line in «شما» — ' + a[1]);
    // A23-14 pA1 p1: a teen quoting the teacher's «ثابت کنید» is not a «شما» speaker
    const PA1 = 'سلام. معلممون یه سؤال داده: ثابت کنید برای هر عددِ اولِ p بزرگ‌تر از ۳، عددِ p^2 − 1 بر ۲۴ بخش‌پذیره. امتحان کردم: p=5 ⇒ ۲۴، p=7 ⇒ ۴۸، p=11 ⇒ ۱۲۰. همه‌ش درمیاد ولی نمی‌دونم چطور ثابتش کنم.';
    await wipe(); await setB(await birthFor(16)); await fresh();
    const u = await turn(PA1, 'خوب.', [{ do: 'coach_state', register: 'shoma', ph: 'u' }]);
    const rg = await ev(() => APP.ASSIST.convRegister(__cur(), '', []));
    chk(rg === 'to', 'A23-14 pA1 p1: a 16-year-old whose only «ـید» is the teacher\'s «ثابت کنید» gets «تو» (even when the model reports shoma), got ' + rg);
    const u2 = await turn('آره، قدم به قدم بریم.', 'باشه.'); const rl = (head(u2.user).match(/[^\n]*این گفت‌وگو با «[^»]*» است[^\n]*/) || [''])[0];
    chk(!/با «شما» است/.test(head(u2.user)), 'A23-14 pA1: the prompt register rule is not «شما» for the teen — ' + rl.slice(-80));
    // a teen who does use «شما» keeps it
    await wipe(); await setB(await birthFor(16)); await fresh(); await turn('ببخشید، ممکن است بفرمایید این مسئله را از کجا شروع کنم؟ شما بگویید.', 'حتماً.');
    chk((await ev(() => APP.ASSIST.convRegister(__cur(), '', []))) === 'shoma', 'P6: a teen who uses «شما» herself gets «شما»');
    // D23-38 dp3 p10/p12: the generic «تو» of her own lesson is not her register toward the assistant
    await wipe(); await setB(await birthFor(41)); await fresh();
    await ev(() => { const s = __cur(); const now = () => new Date().toISOString();
      ['پسرم یه سؤال آورده که خودمم بلد نیستم. مساحت رو از کجا بیارم؟', '۱۵² − ۹² = ۲۲۵ − ۸۱ = ۱۴۴ ✓، پس ارتفاع واقعاً ۱۲ ـه. درسم: وقتی فقط ضلع داری، ارتفاع بکش تا مثلث‌های قائم بسازی، فیثاغورس بزن، و پرانتزِ توان‌دار رو جمله‌به‌جمله ضرب کن.', 'یاد گرفتم که وقتی گیر می‌کنی باید یه خط بکشی و نگاه کنی چی درمیاد.'].forEach(t => { s.msgs.push({ role: 'user', text: t, at: now() }, { role: 'ai', text: 'خوب.', at: now() }); });
      s.msgs.push({ role: 'user', text: 'خب', at: now() }); s.coach = s.coach || {}; s.coach.prev = { key: 'خب' }; APP.S.put(s); });
    const w = await rc('خوب پیش رفتید. حالا همان را برای مثلثِ دیگری بگویید.');
    chk(!/او با تو «تو» حرف می‌زند/.test(w), 'D23-38 dp3 p12: the generic «تو» of her own lesson does not force «تو» on the reply — ' + w.slice(0, 160));
    // A25-17 oA1 p25→p26: a real plural is not a «شما» slip
    await wipe(); await setB(await birthFor(35)); await fresh();
    await ev(() => { const s = __cur(); const now = () => new Date().toISOString(); ['بگو این چطوری کار می‌کنه.', 'به نظرت پسرم هم می‌تونه با همین مرورگر کار کنه؟ بگو چی کار کنم.'].forEach(t => { s.msgs.push({ role: 'user', text: t, at: now() }, { role: 'ai', text: 'خوب.', at: now() }); }); s.msgs.push({ role: 'user', text: 'خب', at: now() }); s.coach = s.coach || {}; s.coach.prev = { key: 'خب' }; APP.S.put(s); });
    const w2 = await rc('پسرت و تو هر دو در همین مرورگر کار می‌کنید و یک تاریخِ تولد دارید.');
    chk(!/«تو» بنویس، نه «شما»|دو ضمیر/.test(w2), 'A25-17 oA1 p25→p26: «پسرت و تو … دارید» (a real plural) is not rewritten — ' + w2.slice(0, 160));
    const w3 = await rc('شما دارید خوب پیش می‌روید.'); chk(/«تو» بنویس/.test(w3), 'control: «شما دارید» to one «تو» person is still caught — ' + w3.slice(0, 120));
  });

  // ================= A23-14 («STILL» ِ سه دور)، U33: سطرِ صفحه در ذخیرهٔ سشن هم به ضمیرِ گفت‌وگو =================
  await section('store', async () => {
    await wipe(); await setB(''); await fresh();
    await turn('سلام. من هشتاد و یک سالمه، تولدم ۱۵ تیره. خیاطِ بازنشسته‌ام. برای اتاقِ نوه‌ام پرده می‌دوزم. پنجره ۱۸۰ سانت عرض دارد. چند متر پارچه بخرم؟', 'خوش آمدید.');
    const st1 = (await sysStored()).filter(t => /تولد/.test(t)), dm = (await sysDom()).filter(t => /تولد.*ثبت شد/.test(t));
    chk(st1.length === 1 && /تاریخِ تولدتان ثبت شد/.test(st1[0]) && !/تولدت(?!ان)/.test(st1[0]), 'A23-14 aA4 p1 / U33: the STORED birth line is «تولدتان» for the elder (not only the painted one) — ' + JSON.stringify(st1));
    chk(dm.length === 1 && /تولدتان/.test(dm[0]), 'A23-14: the painted line is the same — ' + JSON.stringify(dm));
    // the page's own label in quotes follows the register; her own words in quotes do not
    await pushSys('✓ «سلیقه‌ات» هم ثبت شد — حرفِ خودت: «خودت بگو چی دوست داری».');
    const st2 = (await sysStored()).filter(t => /سلیقه/.test(t))[0] || '';
    chk(/«سلیقه‌تان» هم ثبت شد/.test(st2) && /حرفِ خودتان/.test(st2), 'A23-14 aA3: the page label «سلیقه‌ات» follows the register — ' + st2);
    chk(/«خودت بگو چی دوست داری»/.test(st2), 'control: a longer quote (her words) is never rewritten — ' + st2);
    // raw text survives: an explicit «تو صدام کن» brings the «تو» forms back
    await turn('لطفاً تو صدام کن، راحت‌ترم.', 'چشم.');
    const st3 = (await sysStored()).filter(t => /تولد.*ثبت شد/.test(t)), dm3 = (await sysDom()).filter(t => /تولد.*ثبت شد/.test(t));
    chk(st3.length === 1 && /تاریخِ تولدت ثبت شد/.test(st3[0]), 'P6: the raw page line is kept (text0) — after her explicit «تو صدام کن» the stored line is «تولدت» again — ' + JSON.stringify(st3));
    chk(dm3.length === 1 && /تولدت ثبت شد/.test(dm3[0]), 'P6: … and so is the painted one — ' + JSON.stringify(dm3));
    // a teen: «تو» forms everywhere (bank #191)
    await wipe(); await setB(await birthFor(15)); await fresh(); await turn('سلام، یه مسئله دارم: ۳x+۲=۱۱', 'خوب.'); await pushSys('✓ تاریخِ تولدت ثبت شد: امروز — «سلیقه‌ات» هم ثبت شد.');
    const st4 = (await sysStored()).pop(); chk(/تولدت ثبت شد/.test(st4) && /«سلیقه‌ات»/.test(st4), 'bank #191: a teen keeps the «تو» forms — ' + st4);
  });

  // ================= سنجشِ پس از پاسخ: A25-17 (فرضی)، D25-14 (TeX) =================
  await section('post', async () => {
    await wipe(); await setB(await birthFor(30)); await fresh();
    await turn('یه مسئله: می‌خوام یه کیتِ آبیاریِ خورشیدی بسازم. اول این‌که کسی همینو می‌فروشه یا نه، چون اگه هست شاید اصلاً نسازم.', 'خوب.');
    const w = await rc('اگر کیتی زیرِ دو میلیون پیدا شود که ده روز آب بدهد، آن‌وقت می‌گویی «پس نمی‌سازم»؟ یا شرطِ دیگری هم داری؟'.replace(/؟ یا/, ' یا'));
    chk(!/نه در پیام‌های اوست/.test(w), 'A25-17 tA1 p9→p10: a hypothetical «… آن‌وقت می‌گویی «پس نمی‌سازم»» is not a quote of her — ' + w.slice(0, 160));
    const w2 = await rc('خودت گفتی «قیمت اصلاً مهم نیست» — پس چرا دنبالِ ارزان‌ترینی؟'.replace('؟', '.')); chk(/نه در پیام‌های اوست/.test(w2), 'control: an asserted «گفتی «…»» she never wrote is still caught — ' + w2.slice(0, 120));
    // D25-14 pwD2 p2
    await wipe(); await fresh();
    await turn('گامِ ۴: برای n ≡ 1 (mod 4): x = (n+3)/4 می‌گیرم؛ پس 4/n − 1/x = 12/(n(n+3))، و هر کسری به شکلِ 3/m همیشه به صورتِ 1/y + 1/z درمیاد.', 'خوب.');
    const w3 = await rc('نوشتی «هر کسری به شکلِ $\\frac3m$ همیشه به صورتِ $\\frac1y + \\frac1z$ درمیاد» — برای m = 7 بیازما.');
    chk(!/نه در پیام‌های اوست/.test(w3), 'D25-14 pwD2 p2: a TeX quote of her own ASCII formula is a valid quote — ' + w3.slice(0, 160));
    const w4 = await rc('نوشتی «$\\frac5m$» — برای m = 7 بیازما.'); chk(/نه در پیام‌های اوست/.test(w4), 'control: a TeX quote that changes her formula (5/m for 3/m) is caught — ' + w4.slice(0, 120));
  });

  // ================= D25-13 (pwD2 p7): خواستهٔ صریح به معنا ⇒ chat_invent =================
  await section('invent', async () => {
    const P7 = 'وارسی کردم: برای 73 با x = 20: 4/73 − 1/20 = 7/1460. پس خودِ حدس برای 73 درسته، فقط xِ من بد بود. حالا یه حدس به ذهنم رسید: شاید برای هر nِ اولِ ≡ 1 (mod 24) یکی از xهای (n+3)/4 تا (n+3)/4 + 3 همیشه کار کنه. می‌خوام این رو مثلِ یه مسئلهٔ واقعی جدی پیگیری کنم، نه این‌که فقط یه یادداشت بشه — میشه؟ اول برای 97 و 193 امتحانش می‌کنم.';
    const ST = 'برای هر nِ اولِ ≡ 1 (mod 24) یکی از xهای (n+3)/4 تا (n+3)/4 + 3 همیشه کار می‌کند';
    const sg = await ev((m) => [APP.liveReqSignals(m), APP.R25_QUARANTINE.liveReqSignals24(m)], P7);
    chk(sg[0].req && sg[0].now && !sg[1].req, 'D25-13 pwD2 p7: «می‌خوام … مثلِ یه مسئلهٔ واقعی جدی پیگیری کنم» is a request (it was not: ' + JSON.stringify(sg[1]) + ') — ' + JSON.stringify(sg[0]));
    await wipe(); await fresh(); await turn('دارم روی حدسِ اردوش–اشتراوس کار می‌کنم: معادلهٔ 4/n = 1/x + 1/y + 1/z جوابِ طبیعی داره؟', 'خوب.');
    const n0 = await ev(() => APP.liveAll().length);
    const r = await turn(P7, 'ثبتش می‌کنم.', [{ do: 'chat_invent', statement: ST, title: 'x های نزدیک برای n اول ≡ 1 (mod 24)', kind: 'prove' }]);
    const n1 = await ev(() => APP.liveAll().length), ms = (await ev(() => __msgs())).map(m => m.text).join('\n');
    chk(n1 === n0 + 1, 'D25-13: the problem record is created the first time (' + n0 + ' ⇒ ' + n1 + ')');
    chk(!/نخواسته بود/.test(ms) && !r.all.some(u => /نخواسته بود/.test(String(u.split('# نوبتِ تازه\n')[1] || ''))), 'D25-13: no «کاربر نخواسته بود مسئله‌ای ثبت شود»');
    // controls (bank #210)
    const c = await ev(() => [APP.liveReqSignals('جالبه، شاید یه روز دنبالش برم'), APP.liveReqSignals('این فقط یه فکره، ولش کن')]);
    chk(!c[0].req && !c[1].req, 'control: a musing is not a request — ' + JSON.stringify(c));
  });

  // ================= B24·D12 STILL: پرسشِ نوبتِ خودِ صفحه یک پرسش است =================
  await section('oneq', async () => {
    const Qs = await ev(() => { const out = []; const K = APP.LIVE_QK || {}; Object.keys(K).forEach(n => Object.keys(K[n] || {}).forEach(ph => (K[n][ph] || []).forEach(q => out.push(q)))); out.push(APP.R25_QUARANTINE.resultQ24); return out; });
    const cnt = (q) => { let d = 0, pd = 0, n = 0; for (const ch of q) { if (ch === '«') d++; else if (ch === '»' && d) d--; else if (ch === '(') pd++; else if (ch === ')' && pd) pd--; else if ((ch === '؟' || ch === '?') && !d && !pd) n++; } return n; };
    const multi = Qs.filter(q => cnt(q) >= 2); info.multiQ = multi.length + '/' + Qs.length;
    chk(Qs.length > 10 && multi.length > 0, 'fixture: the page question registry is readable and has multi-«؟» questions (' + info.multiQ + ')');
    const after = await ev((Q) => Q.map(q => APP.ASSIST.finalFilter25(['# مسئلهٔ زندهٔ این سشن (lp)\n- در این نوبت فقط **یک** پرسش (برای وضعِ همین نوبت؛ پرسشی را که کاربر پاسخ داده دوباره نپرس): «' + q + '». اگر با وضعِ همین لحظه نمی‌خواند، پرسشِ دیگری.'])[0]), multi);
    const bad = []; for (const b of after) { const t = await tq(b + '\n# نوبتِ تازه\nx'); if (cnt(t.q) !== 1) bad.push(t.q.slice(0, 70)); }
    chk(!bad.length, 'B24·D12 / bank #201: every page turn question reaches the model with exactly one «؟» — ' + JSON.stringify(bad.slice(0, 3)));
    // s13 p7 / s19 p5 / aB3 p13: the non-objective result question itself
    await wipe(); await fresh(); const pid = await exec('کم کردنِ ۸ کیلو تا عروسی', 'life', { out: { done: 'yes' } });
    const u = await turn('هفته‌ی هشتم! ۴ کیلو کم کردم. وزنم هر دو هفته: ۷۸، ۷۷٫۲، ۷۶٫۵، ۷۵٫۱، ۷۴. فکر کنم حل شد.', 'خوب.'); const t = await tq(u);
    chk(cnt(t.q) <= 1, 's19 p5 / s13 p7: the result turn question is one question — ' + t.q.slice(0, 120));
    chk(!/از راهِ دیگری هم به همین می‌رسیدی/.test(t.line), 's13 p7: «با واقعیت سنجیدی‌اش؟» comes without the second question — ' + t.line.slice(0, 200));
    // the model's own two questions are still caught
    await wipe(); await fresh(); await turn('یه مسئله: ۱۲ سیب بین ۳ نفر', 'خوب.'); const w = await rc('مجهول چیست؟ و داده‌ها کدام‌اند؟'); chk(/دو پرسش/.test(w), 'control: the two-question rule still binds the model — ' + w.slice(0, 80));
  });

  // ================= B25·D21 / B_s D10 (s19 p8–p16): «این گام جواب نداد؟» فقط پس از شکست و نه نوبت پشتِ نوبت =================
  await section('ladder', async () => {
    await wipe(); await fresh(); const pid = await exec('کم کردنِ ۸ کیلو تا عروسی', 'life', { out: { done: 'yes', match: 'yes' } });
    const says = ['امروز هم ۴۰ دقیقه پیاده‌روی رفتم.', 'دیروز یکشنبه رفتم باشگاه! خسته شدم ولی رفتم.', 'وزنم امروز ۷۳٫۸ بود.', 'این هفته هم سه بار رفتم باشگاه.', 'امروز شیرینی نخوردم.', 'باز هم پیاده‌روی رفتم، ۴۵ دقیقه.'];
    const qs = []; for (const m of says) { const u = await turn(m, 'خوب.'); qs.push((await tq(u)).q); }
    chk(!qs.some(q => /این گام جواب نداد/.test(q)), 's19 p8–p16: «این گام جواب نداد؟» is never the turn question while her steps succeed — ' + JSON.stringify(qs.map(q => q.slice(0, 30))));
    const rep = qs.filter((q, i) => i > 0 && q && q === qs[i - 1]);
    chk(!rep.length, 'B25·D21 / bank #202: the same live page question is not repeated turn after turn — ' + JSON.stringify(qs.map(q => q.slice(0, 40))));
    // control: after a real failure it may be asked once (bank #214)
    await wipe(); await fresh(); await exec('سحرخیزی', 'life', { out: { done: 'no', match: 'no', prog: 'نه', what: 'نشد' } });
    const u2 = await turn('این گام هم جواب نداد، دوباره خوابم برد.', 'خوب.'); const q2 = (await tq(u2)).q;
    info.failQ = q2.slice(0, 80);
    const pool = await ev(() => { const K = APP.LIVE_QK.life.c; return K.some(x => /این گام جواب نداد/.test(x)); });
    chk(pool, 'control: «این گام جواب نداد؟» is still in the page registry (not deleted)');
  });

  // ================= A25-11، A25-12-b: فاکتوریل =================
  await section('fact', async () => {
    const a = await bd('باید نشون بدم توانِ ۲ تو n! حداکثر n−1 ـه.'); chk(/\[n!\]/.test(a), 'A25-11 pwA1: «n!» is isolated LTR with its «!» (was «!n») — ' + a);
    const b1 = await bd('5! = 120'), b2 = await bd('(2n)!/n!'); chk(/\[5! = 120\]/.test(b1) && /\[\(2n\)!\/n!\]/.test(b2), 'bank #203: «5! = 120» and «(2n)!/n!» stay whole — ' + b1 + ' | ' + b2);
    for (const t of ['چه خوب!', 'نه!', 'آفرین!', 'شد 120!']) { const x = await bd(t); chk(x === t, 'control (bank #213): «' + t + '» keeps its exclamation outside any LTR run — ' + x); }
    const w = await ev(() => APP.ASSIST.wholeSaid('کلش اینه که باید نشون بدم توانِ ۲ تو n! حداکثر n−1 ـه. بعد می‌رم سراغِ گام‌ها.'));
    chk(/n! حداکثر n−1/.test(w) && !/بعد می‌رم/.test(w), 'A25-12-b pwA1: «کل در یک جمله» is not cut inside «n!» — ' + w);
  });

  // ================= مانده‌های دورهای پیش در همین پرونده‌ها: D23-30 (aD2 p1)، D23-35 (s33 p3)، A23-26 =================
  await section('still', async () => {
    const AD2 = 'سلام. یه تصمیم دارم که نمی‌دونم چیکار کنم. مدرسه‌مون تیم رباتیک زده و من خیلی دوست دارم برم، ولی جلسه‌هاش سه‌شنبه عصره، همون موقعی که کلاس تقویتی ریاضی دارم. بابام میگه ریاضی مهم‌تره. نمره ریاضیم ترم پیش ۱۵ از ۲۰ بود. چیکار کنم؟';
    const g = await ev((m) => [APP.liveNatGuess(m), APP.R25_QUARANTINE.natGuess24(m), APP.liveNatGuess('معلم ریاضی‌مون گفته ثابت کنید جمعِ دو عددِ فرد زوجه. چیکار کنم؟'), APP.liveNatGuess('یه مسئلهٔ هندسه دارم: مثلثی با ضلع‌های ۳ و ۴ و ۵، مساحتش چنده؟')], AD2);
    chk(g[0] === 'life' && g[1] === 'objective', 'D23-30 aD2 p1: a teen\'s decision that names a school subject is «life», not «پاسخِ عینی» (was ' + g[1] + ') — ' + g[0]);
    chk(g[2] === 'objective' && g[3] === 'objective', 'control: a real maths task stays objective — ' + JSON.stringify(g.slice(2)));
    await wipe(); await setB(await birthFor(14)); await fresh(); const u = await turn(AD2, 'خوب.');
    chk(!/· پاسخِ عینی/.test(head(u.user).split('\n').filter(l => /^# مربیِ حل/.test(l))[0] || ''), 'D23-30: the coach header has no «· پاسخِ عینی» for her decision — ' + (head(u.user).split('\n').filter(l => /^# مربیِ حل/.test(l))[0] || '').slice(0, 200));
    // D23-35: the follow-up names the open tab, not the parent view with a raw key
    await wipe(); await fresh(); const r = await turn('می‌خوام یه مسئلهٔ تازه ثبت کنم', 'می‌برمت.', [{ do: 'go', view: 'e_prob', sub: 'live' }]); const t = String(follow(r).split('# نوبتِ تازه\n')[1] || '');
    if (t) chk(!/قدم\/برگهٔ live/.test(t) && /زبانهٔ «🔭 مسئلهٔ حل‌نشدهٔ خودم»/.test(t), 'D23-35 s33 p3: the follow-up says the tab\'s own name, not «(قدم/برگهٔ live)» — ' + t.slice(0, 160)); else errors.push('D23-35: no follow-up fired for go e_prob/live');
    const dbl = await ev(() => document.documentElement.innerHTML.indexOf('تا تا ریشه') >= 0); chk(!dbl, 'A23-26: «تا تا ریشه» is no longer in the bundle');
  });

  // ================= بانکِ مستقلِ R25 — همهٔ ورودی‌های P6 =================
  await section('bank', async () => {
    const E = {}; BANK.forEach((e, i) => { E[i + 1] = e; });
    const T = (n, ok, got) => { info.bank[n] = !!ok; if (!ok) { info.bankWrong[n] = String(got == null ? '' : got).slice(0, 200); errors.push('bank#' + n + ' [' + E[n].kind + '] ' + E[n].text.slice(0, 70) + ' ⇒ ' + String(got == null ? '' : got).slice(0, 200)); } };
    const NC = (n, why) => { info.nc[n] = why; };
    const U1 = (n) => E[n].text.split('‖')[0].replace(/^\s*[UA]:\s*/, '').trim();
    const person = async (age, msgs) => { await wipe(); await setB(age ? await birthFor(age) : ''); await fresh(); await ev((msgs) => { const s = __cur(); const now = () => new Date().toISOString(); (msgs || []).forEach(t => { s.msgs.push({ role: 'user', text: t, at: now() }, { role: 'ai', text: 'خوب.', at: now() }); }); s.msgs.push({ role: 'user', text: 'خب', at: now() }); s.coach = s.coach || {}; s.coach.prev = { key: 'خب' }; APP.S.put(s); }, msgs || []); };
    const TO = ['بگو از کجا شروع کنم.', 'به نظرت این راه درسته؟ نگاه کن ببین چی کم داره.'], SH = ['ممکن است بفرمایید از کجا شروع کنم؟', 'به نظرِ شما این راه درست است؟ لطفاً بگویید چه کم دارد.'];
    const H = {
      187: async (n) => { await wipe(); await fresh(); await turn('یه مسئله: ۱۲ سیب بین ۳ نفر، هر کی چند تا؟', 'خوب.'); const r = await turn(U1(n), 'می‌برمت.', [{ do: 'go', view: 'lprob' }]); const t = String(follow(r).split('# نوبتِ تازه\n')[1] || ''); T(n, !!t && !NAVBAD.test(t), t.slice(0, 200)); },
      188: async (n) => { await wipe(); await fresh(); const r = await turn('قلمروِ سامانه‌ها رو نشونم بده', 'باشه.', [{ do: 'go', view: 'sterr' }]); const t = String(follow(r).split('# نوبتِ تازه\n')[1] || ''); const nf = await ev(() => document.querySelectorAll('#main input:not([type=hidden]), #main textarea, #main select').length);
        if (!t) return NC(n, 'no follow-up fired for this navigation in the harness (view name)'); T(n, nf > 0 || !/فیلدهای این صفحه را پر کن/.test(t), t.slice(0, 200)); },
      189: async (n) => { await wipe(); await setB(''); await fresh(); await turn(U1(n), 'خوب.'); const s = await st(); const ag = await ev(() => APP.AGE.age()); T(n, /^نمی‌دونم ماشین رو الان عوض کنم/.test(s.stmt) && ag === 41, s.stmt.slice(0, 80) + ' age=' + ag); },
      190: async (n) => { await wipe(); await setB(''); await fresh(); await turn(U1(n), 'خوب.'); const s = await st(); const ag = await ev(() => APP.AGE.age()); const ln = (await sysStored()).filter(t => /تولد/.test(t));
        T(n, !/هفتاد|تولدم/.test(s.stmt) && /۴۰ مترمربع/.test(s.stmt) && ag === 73 && ln.length === 1 && /تاریخِ تولدتان/.test(ln[0]) && !/\d{4}-\d{2}/.test(ln[0]), s.stmt.slice(0, 60) + ' age=' + ag + ' ' + JSON.stringify(ln)); },
      191: async (n) => { await person(15, ['یه مسئله دارم: معلممون گفته ثابت کنید جمعِ دو عددِ فرد زوجه.']); await pushSys('✓ تاریخِ تولدت ثبت شد: امروز — «سلیقه‌ات» هم ثبت شد. ✓ حدسی که در بازنگری ساختی و می‌آزمایی حالا مسئلهٔ زنده است.'); const x = (await sysStored()).pop(), d = (await sysDom()).pop();
        T(n, /تولدت ثبت شد/.test(x) && /«سلیقه‌ات»/.test(x) && /ساختی و می‌آزمایی/.test(x) && x === d, x + ' | ' + d); },
      192: async (n) => { await person(30, [U1(n)]); await pushSys('✓ تاریخِ تولدت ثبت شد: امروز.'); const x = (await sysStored()).pop(); T(n, /تولدتان ثبت شد/.test(x), x); },
      193: async (n) => { await person(67, []); await pushSys('آن نتیجه را خودت آزمودی و رد شد — «رد شد» همان می‌ماند؛ عددِ تازه نتیجهٔ تازهٔ توست، نه اصلاحِ حرفِ پیشین'); await pushSys('✓ تاریخِ تولدت ثبت شد: امروز.'); const X = await sysStored(), D = await sysDom();
        T(n, /خودتان آزمودید/.test(X[0]) && /تازهٔ شماست/.test(X[0]) && !/توست/.test(X[0]) && /✓ تاریخِ تولدتان ثبت شد/.test(X[1]) && D.some(t => /تازهٔ شماست/.test(t)), JSON.stringify(X)); },
      194: async (n) => { await person(61, []); await pushSys('✓ حدسی که در بازنگری ساختی و می‌آزمایی حالا مسئلهٔ زنده است («x») — همین حالا رویش کار می‌کنیم.'); const x = (await sysStored()).pop(); T(n, /ساختید و می‌آزمایید/.test(x), x); },
      195: async (n) => { await person(30, ['یه مسئله: مغازه‌م مشتری کم داره و نمی‌دونم ببندمش یا نه.']); const w = await rc(U1(n)); T(n, !w, w); },
      196: async (n) => { await person(30, TO); const w = await rc(U1(n)); T(n, !w, w); },
      197: async (n) => { await person(30, [U1(n)]); const w = await rc(E[n].text.split('‖')[1].replace(/^\s*A:\s*/, '').trim()); T(n, !w, w); },
      198: async (n) => { await person(30, SH); const w = await rc(U1(n)); const w2 = await (async () => { await person(30, TO); return rc(U1(n)); })(); T(n, !w && !w2, w + ' | ' + w2); },
      199: async (n) => { await wipe(); await fresh(); await turn('یه فکری دارم: چرا مجموعِ رقم‌های مضرب‌های ۹ همیشه مضربِ ۹ میشه؟', 'جالب است.'); const n0 = await ev(() => APP.liveAll().length);
        const r = await turn(U1(n), 'ثبتش می‌کنم.', [{ do: 'chat_invent', statement: 'چرا مجموعِ رقم‌های مضرب‌های ۹ همیشه مضربِ ۹ می‌شود', title: 'رقم‌های مضربِ ۹', kind: 'prove' }]); const n1 = await ev(() => APP.liveAll().length), ms = (await ev(() => __msgs())).map(m => m.text).join(' ');
        T(n, n1 === n0 + 1 && !/نخواسته بود/.test(ms + r.all.join(' ')), n0 + '⇒' + n1 + ' ' + (ms.match(/[^.]*نخواسته[^.]*/) || [''])[0]); },
      200: async (n) => { await wipe(); await fresh(); await turn('یه حدس دارم: بینِ هر n و 2n یه عددِ اول هست.', 'جالب است.'); const n0 = await ev(() => APP.liveAll().length);
        const r = await turn(U1(n), 'ثبتش می‌کنم.', [{ do: 'chat_invent', statement: 'بینِ هر n و 2n یک عددِ اول هست', title: 'عددِ اول بینِ n و 2n', kind: 'prove' }]); const n1 = await ev(() => APP.liveAll().length), ms = (await ev(() => __msgs())).filter(m => m.role === 'sys').map(m => m.text);
        T(n, n1 === n0 + 1 && !/نخواسته بود/.test(ms.join(' ') + r.all.join(' ')) && ms.filter(t => /🔭|مسئله/.test(t)).length <= 1, n0 + '⇒' + n1 + ' ' + JSON.stringify(ms).slice(0, 160)); },
      201: async (n) => { const Qs = await ev(() => { const out = []; const K = APP.LIVE_QK || {}; Object.keys(K).forEach(k => Object.keys(K[k] || {}).forEach(ph => (K[k][ph] || []).forEach(q => out.push(q)))); return out; });
        const cnt = (q) => { let d = 0, pd = 0, c = 0; for (const ch of q) { if (ch === '«') d++; else if (ch === '»' && d) d--; else if (ch === '(') pd++; else if (ch === ')' && pd) pd--; else if ((ch === '؟' || ch === '?') && !d && !pd) c++; } return c; };
        const out = await ev((Q) => Q.map(q => APP.ASSIST.finalFilter25(['- **پرسشِ این نوبت همین است:** «' + q + '»'])[0]), Qs); const bad = [];
        for (const l of out) { const t = await tq(l + '\n# نوبتِ تازه\nx'); if (cnt(t.q) > 1) bad.push(t.q.slice(0, 50)); }
        // real prompts: a step-outcome turn and a look-back turn
        await wipe(); await fresh(); await exec('پس‌انداز برای سفر', 'practical', { out: { done: 'yes' } }); const u1 = await turn('گام رو انجام دادم: ۳ میلیون کنار گذاشتم، همون که فکر می‌کردم.', 'خوب.'); const t1 = await tq(u1);
        const u2 = await turn('فکر کنم کل مسئله حل شد، ۱۲ میلیون جمع شد.', 'خوب.'); const t2 = await tq(u2);
        T(n, !bad.length && cnt(t1.q) <= 1 && cnt(t2.q) <= 1, JSON.stringify(bad.slice(0, 3)) + ' | ' + t1.q.slice(0, 80) + ' | ' + t2.q.slice(0, 80)); },
      202: async (n) => { await wipe(); await fresh(); await exec('کم کردنِ وزن', 'life', { out: { done: 'no', match: 'no', prog: 'نه', what: 'نشد' } });
        const says = ['چرا، جواب داد، ۳ کیلو کم شد', 'این هفته هم نیم کیلو کم شد.', 'امروز پیاده‌روی رفتم.', 'باشگاه هم رفتم، خوب بود.', 'وزنم ۷۴ شد.', 'باز هم نیم کیلو کم کردم.', 'امروز هم رفتم.']; const qs = [];
        for (const m of says) { const u = await turn(m, 'خوب.'); qs.push((await tq(u)).q); }
        const again = qs.slice(1).filter(q => /این گام جواب نداد/.test(q)).length, rep = qs.filter((q, i) => i > 0 && q && q === qs[i - 1]).length;
        T(n, !again && !rep, JSON.stringify(qs.map(q => q.slice(0, 34)))); },
      203: async (n) => { const X = []; for (const t of ['توانِ ۲ توی n! رو می‌خوام حساب کنم', '5! = 120', '(2n)!/n!', 'جمعِ [n/2] + [n/4] + [n/8]']) X.push(await bd(t)); const w = await ev(() => APP.ASSIST.wholeSaid('کلش اینه که توانِ ۲ توی n! رو می‌خوام حساب کنم. بعدش می‌گم.'));
        T(n, /\[n!\]/.test(X[0]) && X[1] === '[5! = 120]' && X[2] === '[(2n)!/n!]' && X[3] === 'جمعِ [[n/2] + [n/4] + [n/8]]' && /n! رو می‌خوام حساب کنم$/.test(w), JSON.stringify(X) + ' | ' + w); },
      204: async (n) => { await person(30, ['یه مسئله: می‌خوام لپ‌تاپ بخرم و بودجه‌م ۴۰ میلیونه.', 'ارزون‌ترینش رو برداشتم.']); const w = await rc(U1(n)); T(n, /نه در پیام‌های اوست/.test(w), w); },
      205: async (n) => { await person(30, [U1(n)]); const w = await rc(E[n].text.split('‖')[1].replace(/^\s*A:\s*/, '').trim() + ' — برای کدام a و b.'); T(n, /نه در پیام‌های اوست/.test(w), w); },
      206: async (n) => { await person(30, TO); const w = await rc(U1(n)); T(n, /ضمیر|«تو» بنویس/.test(w), w); },
      207: async (n) => { await person(30, ['یه مسئله: ۱۲ سیب بین ۳ نفر']); const w = await rc(U1(n)); T(n, /دو پرسش/.test(w), w); },
      208: async (n) => { await person(70, []); const w = await rc(U1(n)); T(n, /ضمیر|«شما» بنویس/.test(w), w); },
      209: async (n) => { const x = await ev((m) => APP.ASSIST.stripIntro23(m), U1(n)); T(n, /^۴۱ سالمه/.test(x), x); },
      210: async (n) => { await wipe(); await fresh(); await turn('یه چیزی به ذهنم رسید: شاید همهٔ عددهای اولِ بزرگ‌تر از ۳ به شکلِ 6k±1 باشن.', 'جالب است.'); const n0 = await ev(() => APP.liveAll().length);
        const P = E[n].text.split('‖').map(x => x.replace(/^\s*U:\s*/, '').trim()); const g = [];
        for (const m of P) { await ev((m) => { const s = __cur(); s.msgs.push({ role: 'user', text: m, at: new Date().toISOString() }); APP.S.put(s); }, m); g.push(await ev(() => { const s = __cur(); APP.ASSIST._turnSession = s; const G = APP.liveInventGate({ do: 'chat_invent', statement: 'همهٔ عددهای اولِ بزرگ‌تر از ۳ به شکلِ 6k±1 هستند', title: 'اول‌ها 6k±1' }, s.id); return G && G.k; })); }
        const n1 = await ev(() => APP.liveAll().length); T(n, g[1] !== 'live' && g[0] !== 'live' && n1 === n0, JSON.stringify(g)); },
      211: async (n) => { await person(15, [U1(n), 'از کجا شروع کنم؟ بگو.']); const rg = await ev(() => APP.ASSIST.convRegister(__cur(), '', [])); T(n, rg === 'to', rg); },
      212: async (n) => { await wipe(); await fresh(); const pid = await ev(() => __live('مسئلهٔ آزمون')); const r = await turn('فرمِ فهمِ این مسئله رو باز کن', 'باشه.', [{ do: 'go', view: 'lprob', arg: pid }]); const t = String(follow(r).split('# نوبتِ تازه\n')[1] || ''); const nf = await ev(() => document.querySelectorAll('#main input:not([type=hidden]), #main textarea, #main select').length);
        if (!t || !nf) return NC(n, 'the harness did not land on a view with fields (fields=' + nf + ', follow-up=' + !!t + ')'); T(n, /پر کن|به قلمِ خودِ کاربر/.test(t) && !NAVBAD.test(t), t.slice(0, 200)); },
      213: async (n) => { const X = []; for (const t of ['چه خوب!', 'نه!', 'آفرین!']) X.push(await bd(t)); T(n, X.join('|') === 'چه خوب!|نه!|آفرین!', JSON.stringify(X)); },
      214: async (n) => { await wipe(); await fresh(); await exec('سحرخیزی', 'life', { out: { done: 'no', match: 'no', prog: 'نه', what: 'نشد' } }); const x = await ev((m) => APP.ASSIST.unfit23('این گام جواب نداد؟ مسئله را به شکلِ دیگری بیان کن — کدام قید یا واژه را می‌شود جورِ دیگری دید (به تعریف برگرد)؟', m, __cur()), U1(n)); T(n, !x, x); },
      215: async (n) => { await person(30, ['میخوام زودتر بیدار شم ولی نمی‌تونم.', 'به نظرت چی کار کنم؟ بگو.']); const w = await rc(U1(n)); T(n, !w, w); },
    };
    for (let n = 1; n <= BANK.length; n++) { const e = E[n]; if (!/^P6\./.test(e.rc)) continue;
      try { if (!H[n]) { NC(n, 'no handler'); continue; } await H[n](n); } catch (er) { errors.push('bank#' + n + ' exception: ' + String(er && er.stack || er).split('\n').slice(0, 2).join(' | ')); } }
    const mine = Object.keys(E).filter(n => /^P6\./.test(E[n].rc)).map(Number);
    chk(mine.length === 29, 'bank: 29 P6 entries expected, got ' + mine.length);
    const miss = mine.filter(n => !(n in info.bank) && !(n in info.nc)); chk(!miss.length, 'bank coverage: every P6 entry judged or given a reason ' + JSON.stringify(miss));
  });

  const nOk = Object.values(info.bank).filter(Boolean).length; info.summary = { judged: Object.keys(info.bank).length, pass: nOk, nc: Object.keys(info.nc).length };
  console.log(JSON.stringify(info.summary), JSON.stringify(info.nc), JSON.stringify({ multiQ: info.multiQ, failQ: info.failQ, navNote: info.navNote }));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
