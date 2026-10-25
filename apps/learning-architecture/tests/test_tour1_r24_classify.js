// تورِ پولیا (دستهٔ ۱، دورِ ۲۴، سهمِ «classify» — ۲۰۲۶-۱۰-۲۵) — DECISIONS_R24: R4 (گشایش و ردبندی) و R6 (سنجشِ پس از پاسخ)
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۴: C24-1/2/3 (s21، aC1، pC1)، A24-2 (s08 p3)، A24-1 (s02 p8)، D24-13 (s37 p14)، C24-7 (s28 p7)، D24-7 (aD4 p3)،
//           B24·D15 (bp1 p12)، A24-14 (tA1 p12/p15)، A24-8 (s01 p8)؛ R6: A23-20 (s01 p5، s02 p4/p6)، C24-4 (pC1/pC2 p3)، B24·D12 (s19، oB1 p8، aB4 p9)، B24·D10 (s11 p4، bp1 p3)، C24-16 (aC1 p5، pC3 p10)
//  FX       دفترِ پرسش‌های صفحه (coach.pQs21) که هر سشن تا همان نوبت جمع کرده بود + پرسشِ نوبتِ همان پرامپت + پاسخِ همان نوبت — از بازپخشِ پرامپت‌های واقعیِ دورِ ۲۴
//           روی ساختِ پیش از این اصلاح (همان «دو پرسش» را می‌داد؛ ریشه: inPage22 نخستین پرسشِ هم‌واژه را برمی‌گرداند).
//  bank     همهٔ ورودی‌های R4 و R6 در بانکِ مستقلِ tests/variants/VARIANTS_R24.json؛ آن‌چه سازوکارِ سهمِ دیگری است با دلیل در info.nc.
//  ساعتِ صفحه یخ زده است (APP.today = روزِ ثابت) — هیچ انتظاری به تاریخِ تقویم بسته نیست.
// LLA_FILE = ساختِ دیگر؛ ONLY=open,silence,stuck,route,next,ability,guess,conf,post,quote,back,sysq,subst,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = [process.env.LLA_VARIANTS24, path.join(__dirname, 'variants', 'VARIANTS_R24.json')].find(f => f && fs.existsSync(f));
const BANK = BANKF ? JSON.parse(fs.readFileSync(BANKF, 'utf8')) : [];

const FX = {"s01": {"hist": ["چه؟ چرا؟ کجا؟ کی؟ چگونه؟ — کدام‌یک دربا…", "به مجهول نگاه کن: دقیقاً چه می‌خواهی — «حل‌شدن» چه شکلی است و با چه عدد یا واحدی سنجیده می‌شود؟", "چه داری — دانسته‌ها، منابع، امکان‌ها (داده‌ها)؟ کدام اثرِ محسوس دارد و کدام را با دلیل کنار می‌گذاری؟", "شرط چیست — کدام قیدها (زمان، پول، آدم‌ها، اندازه) واقعی‌اند و کدام فرضی؟ بخش‌هایش را جدا بنویس.", "آیا این داده‌ها و قیدها برای تعیینِ خواسته کافی‌اند؟ زائد؟ متناقض؟", "کدام تقریب بس است — جوابِ «به‌اندازهٔ کافی خوب» چیست؟", "چه؟ چرا؟ کجا؟ کی؟ چگونه؟ — کدام‌یک دربارهٔ این مسئله هنوز بی‌پاسخ است؟", "خودت تا کجا رفتی و کجا ماندی؟", "خودت تا کجا رفتی و کجا ماندی؟", "۲) چرا می‌خواهی حلش کنی؟ چه چیزی در آن برایت مهم است یا کنجکاوت می‌کند؟", "اول کل، بعد جزءها: کلِ مسئله را بی‌جزئیات، در یک جملهٔ کامل و به زبانِ خودت، می‌گویی؟"], "tq": "حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟", "rep": "خوب که کارتِ فهم را خودت ثبت کردی. «همهٔ ۴۷ ستون یه جوری ربط دارن» را درست یا غلط نمی‌خوانم؛ حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام ستون می‌تواند ردش کند — ستونی که روی هیچ‌کدام از دو شرطِ خودت (هفت سال ثبات، خرج زیرِ ۴۰٪) اثرِ محسوس ندارد؟"}, "s02": {"hist": ["چه؟ چرا؟ کجا؟ کی؟ چگونه؟ — کدام‌یک دربا…", "به مجهول نگاه کن: دقیقاً چه می‌خواهی — «حل‌شدن» چه شکلی است و با چه عدد یا واحدی سنجیده می‌شود؟", "چه داری — دانسته‌ها، منابع، امکان‌ها (داده‌ها)؟ کدام اثرِ محسوس دارد و کدام را با دلیل کنار می‌گذاری؟", "شرط چیست — کدام قیدها (زمان، پول، آدم‌ها، اندازه) واقعی‌اند و کدام فرضی؟ بخش‌هایش را جدا بنویس.", "آیا این داده‌ها و قیدها برای تعیینِ خواسته کافی‌اند؟ زائد؟ متناقض؟", "کدام تقریب بس است — جوابِ «به‌اندازهٔ کافی خوب» چیست؟", "چه؟ چرا؟ کجا؟ کی؟ چگونه؟ — کدام‌یک دربارهٔ این مسئله هنوز بی‌پاسخ است؟", "خودت تا کجا رفتی و کجا ماندی؟", "خودت تا کجا رفتی و کجا ماندی؟", "حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟", "۲) چرا می‌خواهی حلش کنی؟ چه چیزی در آن برایت مهم است یا کنجکاوت می‌کند؟", "حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟", "حدسی گفتی — چطور می‌آزمایی‌اش؛ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟", "داده‌هایی که اثرِ محسوس دارند همه در طرح آمده‌اند؟ کلِ قیدها را؟", "پیش‌تر مسئله‌ای شبیه این — در کارِ خودت یا دیگران — دیده‌ای؟ از آن چه به کار می‌آید؟", "مسئلهٔ مرتبطی که پیش‌تر حل شده (در زندگیِ خودت یا دیگران): نتیجه‌اش را به کار می‌بری یا روشش را؟ برای به‌کار بردنش عنصرِ کمکی‌ای (کار، آدم، ابزار، گامِ میانی) لازم است؟", "از خواسته به عقب: فرض کن حل شده — یک گام مانده به آخر چه وضعی بود که از آن به خواسته می‌رسیدی؟ و آن وضع از کجا؟", "داده‌هایی که اثرِ محسوس دارند همه در طرح آمده‌اند؟ کلِ قیدها را؟", "چرا؟ / کجا به کارش می‌بری؟ (یک جمله)", "چرا؟ / کجا به کارش می‌بری؟ (یک جمله)", "چرا؟ / کجا به کارش می‌بری؟ (یک جمله)", "چرا؟ / کجا به کارش می‌بری؟ (یک جمله)", "داده‌هایی که اثرِ محسوس دارند همه در طرح آمده‌اند؟ کلِ قیدها را؟", "داده‌هایی که اثرِ محسوس دارند همه در طرح آمده‌اند؛ کلِ قیدها را؟"], "tq": "دادهٔ «ارتفاع بار ۱.۶ متر (c)» را کجا به کار برده‌ای؟ اگر هنوز نه، در کدام گام جا دارد — یا با دلیل کنارش می‌گذاری؟", "rep": "قطرِ کف را دیده‌ای. حالا خاص‌تر: دادهٔ «ارتفاع بار ۱.۶ متر (c)» را کجا به کار برده‌ای؟ اگر هنوز نه، در کدام گام جا دارد — یا با دلیل کنارش می‌گذاری؟"}, "pC1": {"hist": ["مجهول (یا حکمی که باید ثابت شود) چیست؟", "داده‌ها (یا فرض) چیست؟", "شرط چیست؟ می‌توانی بخش‌هایش را جدا بنویسی؟", "آیا شرط برای تعیینِ مجهول کافی است؟ زائد است؟ متناقض است؟", "چند چیز را با هم خواستی — آن‌ها را زیرمسئله‌های جدا کن: کدام را اول می‌گشایی و چرا؟", "چند چیز را با هم خواستی — آن‌ها را زیرمسئله‌های جدا کن: کدام را اول می‌گشایی و چرا؟", "آیا می‌توانید بخشی از مسئله را حل کنید؟"], "tq": "همهٔ داده‌ها را به کار بردی؟ کلِ شرط را؟ همهٔ مفهوم‌های اساسیِ مسئله را در نظر گرفتی؟", "rep": "امتحان کردنِ عددها کارِ بی‌فایده‌ای نبود — دو جوابِ وارسی‌شده داری. پیش از طرح، یک پرسش: همهٔ داده‌ها را به کار بردی؟ کلِ شرط را؟ همهٔ مفهوم‌های اساسیِ مسئله را در نظر گرفتی؟"}, "pC2": {"hist": ["چه؟ چرا؟ کجا؟ کی؟ چگونه؟ — کدام‌یک دربا…", "به مجهول نگاه کن: دقیقاً چه می‌خواهی — «حل‌شدن» چه شکلی است و با چه عدد یا واحدی سنجیده می‌شود؟", "چه داری — دانسته‌ها، منابع، امکان‌ها (داده‌ها)؟ کدام اثرِ محسوس دارد و کدام را با دلیل کنار می‌گذاری؟", "شرط چیست — کدام قیدها (زمان، پول، آدم‌ها، اندازه) واقعی‌اند و کدام فرضی؟ بخش‌هایش را جدا بنویس.", "آیا این داده‌ها و قیدها برای تعیینِ خواسته کافی‌اند؟ زائد؟ متناقض؟", "کدام تقریب بس است — جوابِ «به‌اندازهٔ کافی خوب» چیست؟", "چه؟ چرا؟ کجا؟ کی؟ چگونه؟ — کدام‌یک دربارهٔ این مسئله هنوز بی‌پاسخ است؟"], "tq": "داده‌هایی که اثرِ محسوس دارند همه در طرح آمده‌اند؟ کلِ قیدها را؟", "rep": "این‌که دیدی ۲۷۰ میلیون با قبضت جور نیست، خودش یک وارسی است. جواب را نمی‌گویم. یک پرسش: داده‌هایی که اثرِ محسوس دارند همه در طرح آمده‌اند؟ کلِ قیدها را؟"}};
const OTHER = (e) => /«تو» to an elder|«شما» user/.test(e.text) ? 'R5 (age fixer): register post-check for elders' : /1959|ISO/.test(e.text) ? 'R5 (age fixer): never ISO to a person' :
  /gives a child the full next step/.test(e.text) ? 'no «gives the step away» post-check exists and DECISIONS_R24 R6 does not name one — not built by classify (reported as not done)' : 'no runnable form in this fixer\'s harness';
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
  /* وارسیِ پیش از نمایش با دفترِ پرسش‌های صفحه که سشن تا آن نوبت جمع کرده بود (FX: همان دفترِ اجراهای دورِ ۲۴، از پرامپت‌های واقعیِ همان سناریوها) */
  const twoQ = (fx) => ev((fx) => { const s = __cur(); APP.ASSIST._turnSession = s; s.coach = s.coach || {}; s.msgs.push({ role: 'user', text: 'پیامِ آزمون', at: new Date().toISOString() }); s.coach.prev = { key: 'پیامِ آزمون' };
    s.coach.pQs21 = fx.hist.slice(); const P = '# مسئلهٔ زندهٔ این سشن (lp)\n- در این نوبت فقط **یک** پرسش (برای وضعِ همین نوبت): «' + fx.tq + '». اگر با وضعِ همین لحظه نمی‌خواند، پرسشِ دیگری.\n# نوبتِ تازه\nپیامِ آزمون';
    return APP.ASSIST.replyCheck({ reply: fx.rep, actions: [] }, { prompt: P, task: 'lla_coach' }); }, fx);

  // ================= R4 — گشایش: یک آشکارساز برای مربی، «# پیش‌نیاز»، «پروندهٔ تازه» و مسیریابی (C24-1، C24-2، C24-3) =================
  await section('open', async () => {
    const S21 = 'سلام. من بردیا هستم ۱۲ سالمه، تیم شطرنج مدرسه. مسئله: سفید بازی می‌کند و در دو حرکت مات می‌کند. FEN: 5k2/8/5K2/8/8/8/8/R2Q4 w - - 0 1 . من کیش با وزیر رو زدم ولی شاه فرار می‌کنه. یه رخ سفید گوشه‌ی صفحه هست که اصلاً نمی‌دونم چرا اونجاست.';
    const AC1 = 'سلام من آرینم کلاس سومم. معلممون این سؤال رو داده: «من و داداشم روی هم ۲۴ تا تیله داریم. تیله‌های من ۳ برابرِ تیله‌های داداشمه. هر کدوم چند تا تیله داریم؟» من گفتم ۱۲ تا و ۱۲ تا ولی مامانم گفت غلطه. چرا غلطه؟';
    const PC1 = 'سلام، سارام کلاس دهم. معلممون یه سؤال داده: معادلهٔ x² − y² = 15 چند تا جواب صحیح داره؟ من امتحان کردم: x=4 و y=1 میشه 16−1=15 درسته، x=8 و y=7 هم میشه 64−49=15. ولی نمی‌دونم بقیه‌شو چطوری پیدا کنم، تا کجا باید امتحان کنم؟';
    for (const [m, tag, birth] of [[S21, 'C24-1 s21 p1', '2014-01-01'], [AC1, 'C24-1 aC1 p1', '2017-06-01']]) {
      await wipe(); await setB(birth); await fresh(); const u = await turn(m, 'باشه.');
      chk(u.task === 'lla_coach', tag + ': a self-introduction opening is a problem from turn one — routes lla_coach, got ' + u.task);
      chk(!NOWORK.test(head(u.user)), tag + ': «# وضعِ کنونی» no longer says «هنوز مسئله یا کارِ بازی در این سشن نیست» ' + blockOf(u.user, /^# وضعِ کنونی/).slice(0, 200));
      chk(!!blockOf(u.user, /^# پیش‌نیاز/), tag + ': the «# پیش‌نیاز» contract is in the opening prompt');
      const s = await st(); chk(s.stmt && !/^(?:سلام|من بردیا|من آرین)/.test(s.stmt), tag + ': the chat statement is the problem, without the greeting/intro ' + s.stmt.slice(0, 60));
    }
    // C24-3 aC1 p1: no correction block on an opening
    await wipe(); await setB('2017-06-01'); await fresh(); const u3 = await turn(AC1, 'باشه.');
    chk(!/# اصلاحِ پیامِ پیشین/.test(head(u3.user)), 'C24-3 aC1 p1: the opening «… مامانم گفت غلطه. چرا غلطه؟» brings no «# اصلاحِ پیامِ پیشین (شاید)» block');
    // … but a real correction after an opening still gets it
    const u3b = await turn('ببخشید، ۲۴ نبود، ۳۲ تا تیله داریم.', 'باشه.');
    chk(/# اصلاحِ پیامِ پیشین/.test(head(u3b.user)), 'a real correction in the second turn still brings the correction block');
    // C24-2 pC1 p1: «سارام کلاس دهم» is stripped from the chat statement
    await wipe(); await setB('2010-01-01'); await fresh(); await turn(PC1, 'باشه.'); const s2 = await st();
    chk(/^معادلهٔ x²/.test(s2.stmt) && !/سارام|کلاس دهم|معلممون/.test(s2.stmt), 'C24-2 pC1 p1: «سارام کلاس دهم. معلممون یه سؤال داده:» is not part of the chat statement ' + s2.stmt.slice(0, 80));
    const neg = await ev(() => [APP.ASSIST.stripIntro23('خسته‌ام کلاس داشتم. یه مسئله: ۳ + ۴ چند میشه؟'), APP.ASSIST.statesProblem('یه سؤال: صفحهٔ تنظیمات کجاست؟'), APP.ASSIST.notProblem('سلام، من مریمم')]);
    chk(/^خسته‌ام/.test(neg[0]) && !neg[1] && neg[2] === true, 'negatives: «خسته‌ام …» is not an intro; a page question behind «یه سؤال:» is not a problem; greeting-only stays not-a-problem ' + JSON.stringify(neg));
  });

  // ================= R4 — سکوت «...» بلوکِ مربی را نگه می‌دارد (A24-2، پسرفتِ دورِ ۲۳) =================
  await section('silence', async () => {
    await wipe(); await setB('2009-01-01'); await fresh();
    await turn('فقط دوتا ساعت شنی داریم، یکی ۷ دقیقه یکی ۱۱ دقیقه. تخم‌مرغ باید دقیقاً ۱۵ دقیقه بپزه. چطوری؟', 'مجهول؟');
    await turn('نه... نمی‌دونم.', 'باشه.');
    for (const sil of ['...', '…', '؟']) {
      const u = await turn(sil, 'کوتاه‌تر: …');
      const cb = blockOf(u.user, /^# مربیِ حل/);
      chk(!!cb, 'A24-2 s08 p3: silence «' + sil + '» keeps the «# مربیِ حل» block');
      chk(/سکوت، «نمی‌دونم» یا پاسخِ بی‌ربط/.test(head(u.user)), 'A24-2: the silence rule («پرسش همان پرسشِ نوبت می‌ماند») is in the prompt for «' + sil + '»');
    }
    const g = await ev(() => [APP.ASSIST.notProblem('...'), APP.ASSIST.notProblem('سلام، خوبی؟'), APP.ASSIST.notProblem('سلام من کیانم کلاس سومم')]);
    chk(g[0] === false && g[1] === true && g[2] === true, 'silence is not «greeting only»; greetings still are ' + JSON.stringify(g));
  });

  // ================= R4 — گیر با «به کار بردم» گیر است، نه گزارشِ کاربست (A24-1) =================
  await section('stuck', async () => {
    const M = 'خب ۳.۲ رو که تو همون قطر کف به کار بردم، ۱.۸ رو هم. دیگه نمی‌دونم چی کار کنم.';
    const k = await ev((M) => [APP.ASSIST.metaMsg22(M), APP.ASSIST.unfit23('از خواسته به عقب: فرض کن حل شده — یک گام مانده به آخر چه وضعی بود که از آن به خواسته می‌رسیدی؟ و آن وضع از کجا؟', M),
      APP.ASSIST.metaMsg22('امروز روشِ «کار از آخر» رو به کار بردم و جواب داد'), APP.ASSIST.metaMsg22('امروز تو یه جمع دیگه هم همون تلسکوپی رو به کار بردم: ۱/(k(k+2)) رو به نصفِ (۱/k − ۱/(k+2)) شکستم و جمعش راحت درومد.')], M);
    chk(k[0] === '' && !DROPUSE.test(k[1]), 'A24-1 s02 p8: «… به کار بردم … دیگه نمی‌دونم چی کار کنم» is a stuck — not a use report, the stuck question is not dropped ' + JSON.stringify(k.slice(0, 2)));
    chk(k[2] === 'use' && k[3] === 'use', 'a real use report (no stuck words) stays «use» ' + JSON.stringify(k.slice(2)));
    await wipe(); await setB('1990-01-01'); await fresh(); const pid = await exec('لوله در وانت', 'practical', { u: 'بلندترین پاره‌خطِ داخلِ بار', dl: [{ t: 'طول ۳.۲' }, { t: 'عرض ۱.۸' }, { t: 'ارتفاع ۱.۶' }] });
    const u = await turn(M, 'باشه.'); const t = await tq(u);
    chk(!/پرسشِ این نوبت پرسیده نمی‌شود — پیامش درخواستِ نگه‌داشتن/.test(head(u.user)) && !!t.q, 'A24-1: the prompt keeps a turn question for the stuck person ' + JSON.stringify(t).slice(0, 200));
  });

  // ================= R4 — گزارشِ تمرین با حلِ تازه ⇒ مربی (D24-13، پسرفت) =================
  await section('route', async () => {
    const COACH = '# مربیِ حل (روحِ «چگونه آن را حل کنیم») — کمک نه خیلی کم، نه خیلی زیاد · مرحلهٔ محتمل: فهمِ مسئله\n- قاعده\n# پرونده‌های تمرینِ باز (یک پرونده برای هر تکنیک × موضوع)\n- اگر خودش گزارشِ جلسهٔ یکی از این پرونده‌های سررسیده (موضوعِ سشن‌های دیگر، نه این گفت‌وگو) را داد، با همان شناسه ثبت کن؛ وگرنه پیششان نکش:\n- prc_x: تکنیکِ 17 «انتزاع و تعمیم» روی «قیمت گوسفند» · باز\n# وضعِ کنونی\n- زمینه (نه پرسشِ دوم): هنوز مسئله یا کارِ بازی در این سشن نیست.\n';
    const r = await ev((P) => ['چند روز دیر شد. امروز مدخلِ «۱۵ ذرع کرباس» رو با همون روش حل کردم: ۱۵ = ۳ × ۵، فقط یه جواب درومد.',
      'چند روز دیر شد. امروز مدخلِ «۱۵ ذرع کرباس» رو با همون روش حل کردم. درسته؟', 'امروز ۸۰٪ کارت‌ها یادم بود', 'امروز وقت نکردم تمرین کنم', 'برو به صفحهٔ امروز'].map(m => APP.ASSIST.chatTask({ msg: m, prompt: P })), COACH);
    chk(r[0] === 'lla_coach' && r[1] === 'lla_coach', 'D24-13 s37 p14: a practice report with a new solution routes lla_coach ' + JSON.stringify(r.slice(0, 2)));
    chk(r[2] === 'lla_coach', 'a practice self-rating is coaching too ' + r[2]);
    chk(r[4] === 'lla_assistant', 'a pure command stays lla_assistant ' + r[4]);
    const ms = await ev(() => [APP.ASSIST.statesProblem('چند روز دیر شد. امروز مدخلِ «۱۵ ذرع کرباس» رو با همون روش حل کردم: ۱۵ = ۳ × ۵، فقط یه جواب درومد.'), APP.ASSIST.metaMsg22('امروز وقت نکردم تمرین کنم')]);
    chk(ms[0] === false && ms[1] === '', 'the report is still not a new problem (no «اول کل»/new statement); «وقت نکردم» is no report ' + JSON.stringify(ms));
  });

  // ================= R4 — «بعدش چی کار کنم؟» مجهول نیست (C24-7) =================
  await section('next', async () => {
    const U1 = 'مجهول (یا حکمی که باید ثابت شود) چیست؟';
    const r = await ev((U1) => [APP.ASSIST.unfit23(U1, 'بعدش چی کار کنم؟'), APP.ASSIST.unfit23(U1, 'حالا چی کار کنم؟'), APP.ASSIST.unfit23(U1, 'مجهولش چیه اصلاً؟'), APP.ASSIST.unfit23(U1, 'با این ۲۰ میلیون بودجه چیکار کنم؟')], U1);
    chk(r[0] === '' && r[1] === '' && r[2] === '', 'C24-7 s28 p7: «بعدش چی کار کنم؟» / «حالا چی کار کنم؟» / «مجهولش چیه؟» do not drop «مجهول چیست؟» as «named the unknown» ' + JSON.stringify(r));
    chk(!!r[3], 'her own decision question «با این بودجه چیکار کنم؟» still names the unknown ' + r[3]);
  });

  // ================= R4 — «پیر شدم، مغزم … کار نمی‌کنه» برچسبِ خود است (D24-7) =================
  await section('ability', async () => {
    const r = await ev(() => [APP.PRE.ability('پیر شدم، مغزم دیگه مثلِ قدیم کار نمی‌کنه'), APP.PRE.ability('ذهنم دیگه یاری نمی‌کنه'), APP.PRE.ability('پیر شدم دیگه، نوه‌م امسال رفت دانشگاه'), APP.PRE.ability('داداشم خنگه'), APP.PRE.abilitySpan('پیر شدم، مغزم دیگه مثلِ قدیم کار نمی‌کنه. تیغه رو هم حساب کردم.')]);
    chk(r[0] && r[1], 'D24-7 aD4 p3: «پیر شدم، مغزم دیگه مثلِ قدیم کار نمی‌کنه», «ذهنم دیگه یاری نمی‌کنه» are ability self-labels ' + JSON.stringify(r));
    chk(!r[2] && !r[3], '«پیر شدم … نوه‌م رفت دانشگاه» (no claim about thinking) and a third person are not ' + JSON.stringify(r));
    chk(/مغزم دیگه مثلِ قدیم کار نمی‌کنه/.test(r[4]), 'the span quoted back is her own sentence ' + r[4]);
  });

  // ================= R4 — وارسیِ گزارش‌شدهٔ خودش حدس نیست (B24·D15، A24-14) =================
  await section('guess', async () => {
    const r = await ev(() => [APP.ASSIST.coachGuess('x²−9 = (x−3)(x+3). درسته؟ با ضرب هم چک کردم'), APP.ASSIST.coachGuess('حدس می‌زنم x=3 باشه'), APP.ASSIST.coachGuess('x=3 درسته؟ می‌شه چک کنی ببینی درسته؟'),
      APP.ASSIST.coachGuess('با پرسش‌های همون حوزه گشتم: تو Google Patents چند تا ثبتِ قدیمی هست، پس طرحِ سادهٔ من نو نیست و ثبتش نمی‌کنم. تو بازار هم کیتِ آماده دو و نیم میلیونه و فقط هفت روز آب می‌ده — از معیارم بدتره. پس خودم می‌سازمش، فقط برای پدر و مادرم، نه برای فروش. فکر کنم کل مسئله حل شد.'),
      APP.ASSIST.coachGuess('x=2 رو امتحان کردم نشد. ۳ درسته؟'), APP.ASSIST.coachGuess('فکر کنم جواب ۵ باشه')]);
    chk(r[0] === false, 'B24·D15 bp1 p12: «… درسته؟ با ضرب هم چک کردم» is her own reported check, not a guess');
    chk(r[1] === true && r[2] === true, 'a guess with no check, and «می‌شه چک کنی؟» (a request, not her check) stay guesses ' + JSON.stringify(r));
    chk(r[3] === false, 'A24-14 tA1 p15: «فکر کنم کل مسئله حل شد» after her checks is not a guess');
    chk(r[4] === true && r[5] === true, 'after a FAILED check a new «۳ درسته؟» is still a guess; «فکر کنم جواب ۵ باشه» too ' + JSON.stringify(r));
    // A24-14 p12: «ایمنی رو این‌طوری حل کردم» solves one part, not the whole problem
    await wipe(); await setB('1995-01-01'); await fresh();
    const pid = await exec('کیت آبیاری خورشیدی', 'practical', { plan: 'تکه‌ها: ۱ آبِ روزانه، ۲ پمپ، ۵ ایمنی، ۶ سابقه و ثبتِ اختراع', step: 'آبِ روزانه' });
    const ps = await ev((pid) => [APP.ASSIST.partSolved24(pid, 'از پسرعموم پرسیدم؛ فیوز ۵ آمپری و جعبهٔ IP65. ایمنی رو این‌طوری حل کردم.'), APP.ASSIST.partSolved24(pid, 'مسئله رو حل کردم.'), APP.ASSIST.partSolved24(pid, 'آبیاری رو حل کردم.')], pid);
    chk(ps[0] === true && ps[1] === false && ps[2] === false, 'A24-14 tA1 p12: «ایمنی رو این‌طوری حل کردم» names a part of the plan ⇒ part-level; «مسئله رو حل کردم» / a word of the title stay whole-level ' + JSON.stringify(ps));
    const u = await turn('از پسرعموم که برق‌کاره پرسیدم؛ گفت یه فیوزِ ۵ آمپری کنارِ قطبِ باتری بذارم و همهٔ اتصال‌ها رو تو جعبهٔ ضدآب IP65 ببرم. ایمنی رو این‌طوری حل کردم.', 'باشه.');
    chk(!/می‌گوید حل شد، ولی صفحه هنوز/.test(head(u.user)), 'A24-14 p12: no «می‌گوید حل شد» (problem level) for a solved part');
  });

  // ================= R4 — اطمینان فقط وقتی خودش گفت (A24-8) =================
  await section('conf', async () => {
    const E1 = 'پیش از گامِ واقعی: چه پیش‌بینی می‌کنی و چقدر مطمئنی؟';
    const M8 = 'باشه، قبول. دیگه ستون اضافه نمی‌کنم. طرحمو ثبت کردم و سه گزینه رو فقط با دو شرط، سرانگشتی مقایسه کردم: الف (خرید) قسطش ۴۲٪ درآمد میشه، رد. ب (اجاره قصردشت) ۳۰٪ ولی قرارداد فقط ۲ ساله، رد. ج (اجارهٔ بلندمدت زرهی) ۲۳٪ و قرارداد ۵ ساله. فکر کنم ج رو انتخاب می‌کنم. ولی این حساب سرانگشتی کافیه؟';
    await wipe(); await fresh();
    const r = await ev(([E1, M8]) => { const s = __cur(); return [APP.ASSIST.unfit23(E1, M8, s), APP.ASSIST.unfit23(E1, 'فکر کنم ج رو انتخاب می‌کنم', s), APP.ASSIST.unfit23(E1, 'هشتاد درصد مطمئنم جواب «ج» است', s), APP.ASSIST.unfit23(E1, 'فکر کنم ۳ روز طول بکشه، ۷۰ درصد مطمئنم', s),
      APP.ASSIST.confOwn24('هشتاد درصد مطمئنم جواب «ج» است'), APP.ASSIST.confOwn24('فکر کنم ج رو انتخاب می‌کنم'), APP.ASSIST.confOwn24(M8), APP.ASSIST.confOwn24('۷۰٪ احتمال داره درست باشه')]; }, [E1, M8]);
    chk(r[0] === '' && r[1] === '', 'A24-8 s01 p8: data percentages («قسطش ۴۲٪ درآمد») and «فکر کنم ج رو انتخاب می‌کنم» are no confidence — e1 is not dropped ' + JSON.stringify(r.slice(0, 2)));
    chk(!!r[2] && !!r[3], 'a confidence she gives («هشتاد درصد مطمئنم», «۷۰ درصد مطمئنم») still drops the re-ask ' + JSON.stringify(r.slice(2, 4)));
    chk(r[4] === 80 && r[5] === null && r[6] === null && r[7] === 70, 'confidence booked from her own words only (80 / none / none for data % / 70) ' + JSON.stringify(r.slice(4)));
    // a bare percent right after the page asked «چقدر مطمئنی؟» is her confidence
    const r2 = await ev((E1) => { const s = __cur(); s.msgs.push({ role: 'ai', text: 'چه پیش‌بینی می‌کنی و چقدر مطمئنی؟', at: new Date().toISOString() }); return APP.ASSIST.unfit23(E1, 'میشه ۱۲. ۷۰ درصد.', s); }, E1);
    chk(!!r2, 'a bare «۷۰ درصد» answering «چقدر مطمئنی؟» is her confidence ' + r2);
  });

  // ================= R6 — پرسشِ دوجمله‌ایِ خودِ صفحه یک پرسش است، با دفترِ سشن (A23-20، C24-4، B24·D12) =================
  await section('post', async () => {
    for (const k of Object.keys(FX)) { await wipe(); await fresh(); const w = await twoQ(FX[k]);
      chk(!/دو پرسش/.test(w), 'A23-20/C24-4 ' + k + ': the page\'s own two-sentence question, re-worded by the model, counts as ONE even when the session log holds older page questions that share words ' + w.slice(0, 120)); }
    await wipe(); await fresh();
    const extra = await twoQ({ hist: FX.s01.hist, tq: FX.s01.tq, rep: 'حدسی گفتی — چطور می‌آزمایی‌اش؟ چند ستون داری؟' });
    chk(/دو پرسش/.test(extra), 'the model\'s own extra question is still caught ' + extra.slice(0, 80));
    await wipe(); await fresh();
    const comp = await ev((P) => { const s = __cur(); APP.ASSIST._turnSession = s; s.coach = { prev: { key: 'م' } }; s.msgs.push({ role: 'user', text: 'م', at: new Date().toISOString() });
      return [APP.ASSIST.replyCheck({ reply: 'نتیجه‌ای گفتی — با واقعیت سنجیدی‌اش؟ از راهِ دیگری هم به همین می‌رسیدی؟', actions: [] }, { prompt: P, task: 'lla_coach' }),
        APP.ASSIST.replyCheck({ reply: 'چند تا داری؟ چرا این‌طوری حساب کردی؟', actions: [] }, { prompt: P, task: 'lla_coach' })]; }, tqPrompt('نتیجه‌ای گفتی — با واقعیت سنجیدی‌اش؟ از راهِ دیگری هم به همین می‌رسیدی؟ (بعد در صفحه «✅ حل شد» و بازنگری)'));
    chk(!/دو پرسش/.test(comp[0]) && /دو پرسش/.test(comp[1]), 'B24·D12: the page\'s composite «سنجیدی‌اش؟ از راهِ دیگری…؟» is one; two independent model questions are still caught ' + JSON.stringify(comp).slice(0, 200));
  });

  // ================= R6 — نقلِ مثالِ خودِ دستیار نقلِ او نیست؛ نقلِ ساختگی هنوز گرفته می‌شود (B24·D10) =================
  await section('quote', async () => {
    await wipe(); await fresh(); await turn('یه مسئله: صفحهٔ ۱۰ در ۱۰ که دو خونهٔ گوشه‌ش رو برداشتیم با دومینو پر میشه؟', 'مجهول؟'); await turn('۲×۲ و ۴×۴ رو امتحان کردم نشد. ولی چطور ثابتش کنم؟ ۹۸ که زوجه!', 'خوب.');
    const r = await ev(() => { const s = __cur(); APP.ASSIST._turnSession = s; const C = (o) => APP.ASSIST.replyCheck({ reply: o, actions: [] }, { prompt: '# نوبتِ تازه\nx', task: 'lla_coach' });
      return [C('بیا بخشی از مسئله را حل کنیم: فقط بخشی از شرط را نگه دار — مثلاً فقط «هر دومینو دو خانهٔ مجاور را می‌پوشاند» — مجهول تا چه حد معین می‌شود؟'),
        C('از زاویهٔ دیگر: عبارتی شبیهِ n²−1 — مثلاً به شکلِ کلیِ «مربعِ یک چیز منهای مربعِ یک چیزِ دیگر» — را جایی دیده‌ای؟'),
        C('گفتی «همه‌اش غلطه» — ولی دو حالت را درست امتحان کردی.'), C('تو گفتی «من هیچ‌وقت هندسه نخوندم و نمی‌خونم» — ولی بیا امتحان کنیم.'),
        C('گفتی «۹۸ که زوجه» — درست است، ولی کافی نیست.')]; });
    chk(!/نه در پیام‌های اوست/.test(r[0]) && !/نه در پیام‌های اوست/.test(r[1]), 'B24·D10 s11 p4 / bp1 p3: the assistant\'s own illustrative «…» after «مثلاً» is not a quote of her ' + JSON.stringify(r.slice(0, 2)).slice(0, 200));
    chk(/نه در پیام‌های اوست/.test(r[2]) && /نه در پیام‌های اوست/.test(r[3]), 'fabricated quotes attributed to her («گفتی «همه‌اش غلطه»» even short) are still caught ' + JSON.stringify(r.slice(2, 4)).slice(0, 200));
    chk(!/نه در پیام‌های اوست/.test(r[4]), 'her own short words with «گفتی» pass ' + r[4]);
  });

  // ================= R6 — برگشتِ طبیعی به جای منتظر پذیرفته است (C24-16) =================
  await section('back', async () => {
    const r = await ev(() => { const B = APP.PRE.backTo24;
      const main = { to: 'main', step: 'پخش کردنِ ۲۴ تیله بینِ ۴ جعبهٔ هم‌اندازه' }, pre = { to: 'pre', step: 'قضیهٔ فیثاغورس (در مثلثِ قائم: مجموعِ مربعِ دو ضلعِ قائم = مربعِ وتر)', par: { step: 'پیدا کردنِ ارتفاعِ زمین (۱۰، ۱۳، ۱۳) برای مساحت' } };
      return [B(main, 'درست! ۴ و ۴ می‌شود ۸ — یعنی تقسیم را بلدی. برگردیم به سؤالِ خودت: ۲۴ تا تیله و ۴ تا جعبهٔ هم‌اندازه. یک پرسش: توی هر جعبه چند تا بگذاری که روی هم ۲۴ بشود؟'),
        B(pre, 'درست — جذر همین است. برگردیم به فیثاغورس، همان‌جا که برای پیدا کردنِ ارتفاعِ زمین یادش می‌گرفتی: مثلثِ قائم با ضلعِ کجِ ۱۰ و یک ضلعِ ۶. حالا که جذر را داری، ضلعِ دیگرش چند است؟'),
        B(main, 'آفرین! حالا بیا یک مسئلهٔ تازه دربارهٔ سکه‌ها حل کنیم: چند سکه داری؟'), B(pre, 'آفرین. حالا بازنگری کنیم: کدام پرسش بیشتر کمکت کرد؟')]; });
    chk(r[0] && r[1], 'C24-16 aC1 p5 / pC3 p10: a natural return naming the waiting step\'s own words and numbers is accepted ' + JSON.stringify(r));
    chk(!r[2] && !r[3], 'a reply that moves to a different step / to review is still not a return ' + JSON.stringify(r));
  });

  // ================= R6 — «خودت فکر می‌کنی چرا؟» نه بر پرسشِ دربارهٔ سامانه (B24·D12 oB1 p8) =================
  await section('sysq', async () => {
    const OB1 = 'یه سؤالِ دیگه قبل از ادامه: فرض کن وسطِ همین کار گیر کنم چون یه چیزی رو اصلاً بلد نیستم — مثلاً نمی‌دونم «چرخه‌ی خواب» دقیقاً چطوری کار می‌کنه و چرا ساعت ۱۱ خوابیدن فرق می‌کنه. سیستم فرق می‌ذاره بین اینکه یه پیش‌نیاز رو بلد نیستم، یا ذهنم گره خورده، یا کلاً توانش رو ندارم؟ اگه برم اون پیش‌نیاز رو یاد بگیرم — حتی اگه خودش یه پیش‌نیازِ دیگه داشته باشه — دقیقاً برمی‌گرده همین‌جا که بودیم؟';
    await wipe(); await fresh(); await turn('می‌خوام ساعت خوابم رو درست کنم؛ هر شب ۲ می‌خوابم و صبح ۷ باید بیدار شم.', 'مجهول؟');
    const u = await turn(OB1, 'باشه.'); const t = await tq(u);
    chk(!/خودت فکر می‌کنی چرا/.test(t.q) && !/\*\*پرسشِ این نوبت همین است:\*\*[^\n]*خودت فکر می‌کنی چرا/.test(head(u.user)), 'B24·D12 oB1 p8: no «خودت فکر می‌کنی چرا؟» turn question on a question about the system ' + t.q);
    await wipe(); await fresh(); await turn('یه مسئله: ۱۲ تا سیب بین ۳ نفر، هر کی چند تا؟', 'مجهول؟');
    const u2 = await turn('چرا باید تقسیم کنم و ضرب نکنم؟', 'باشه.'); const t2 = await tq(u2);
    chk(/خودت فکر می‌کنی چرا/.test(t2.q) || /خودت فکر می‌کنی چرا/.test(head(u2.user)), 'a «چرا …؟» about her own problem still gets «خودت فکر می‌کنی چرا؟» ' + t2.q);
  });

  // ================= R6 — وارسیِ جای‌گذاری که پیش‌تر گزارش کرد دوباره پرسیده نمی‌شود (B24·D12 aB4 p9–p10) =================
  await section('subst', async () => {
    await wipe(); await fresh();
    const r = await ev(() => { const s = __cur(); const Q = 'نتیجه‌ای گفتی — از راهِ دیگری هم به همین می‌رسی؟ نتیجه را وارسی کن: در شرط بگذار یا با حالتی خاص بسنج.';
      s.msgs.push({ role: 'user', text: 'پس x = ۴. با جای‌گذاری چک کردم، درست درومد: ۴×۴ − ۹ = ۷.', at: new Date().toISOString() }, { role: 'ai', text: 'خوب.' }, { role: 'user', text: 'حالا می‌خوام ببینم چرا فقط یه جواب داره.', at: new Date().toISOString() });
      const a = APP.ASSIST.unfit23('جواب را در شرط جای‌گذاری کن — برقرار است؟', 'حالا می‌خوام ببینم چرا فقط یه جواب داره.', s);
      const s2 = APP.ASSIST.newSession(); s2.msgs.push({ role: 'user', text: 'پس x = ۴.', at: new Date().toISOString() });
      const b = APP.ASSIST.unfit23('جواب را در شرط جای‌گذاری کن — برقرار است؟', 'پس x = ۴.', s2);
      return [a, b]; });
    chk(!!r[0] && !r[1], 'B24·D12 aB4 p9–p10: a substitution check she reported earlier in the session makes «در شرط جای‌گذاری کن» stale; with no reported check it stays ' + JSON.stringify(r));
  });

  // ================= بانکِ مستقل (R4، R6) =================
  await section('bank', async () => {
    if (!BANK.length) { errors.push('bank: tests/variants/VARIANTS_R24.json missing'); return; }
    const E = {}; BANK.forEach((e, i) => { E[i + 1] = e; });
    const T = (n, ok, x) => { info.bank[n] = !!ok; chk(ok, 'bank#' + n + ' [' + E[n].rc + '/' + E[n].kind + '] «' + E[n].text.slice(0, 70) + '» → ' + E[n].expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 400)); };
    const NC = (n, why) => { info.nc[n] = why; };
    const Uof = (n) => (/^U[^:]*:\s*(.*)$/.exec(E[n].text.trim()) || [])[1] || '';
    const H = [
      [/سلام من کیانم ۹ سالمه\. ۱۲ تا مداد/, async (n, U) => { await wipe(); await setB('2017-03-25'); await fresh(); const u = await turn(U, 'باشه.'); const s = await st();
        T(n, u.task === 'lla_coach' && !!blockOf(u.user, /^# پیش‌نیاز/) && !NOWORK.test(head(u.user)) && /^۱۲ تا مداد/.test(s.stmt), { task: u.task, stmt: s.stmt }); }],
      [/سارام کلاس دهم، این سواله رو نمی‌فهمم/, async (n, U) => { await wipe(); await setB('2010-01-01'); await fresh(); await turn(U, 'باشه.'); const s = await st();
        const x = await ev((m) => APP.ASSIST.stripIntro23(m), U); T(n, /^دو عدد/.test(s.stmt) && x === s.stmt.slice(0, x.length), { stmt: s.stmt, strip: x }); }],
      [/اینجانب احمدی هستم، ۷۲ سال دارم/, async (n, U) => { await wipe(); await setB('1954-01-01'); await fresh(); const u = await turn(U, 'بفرمایید.'); const s = await st();
        T(n, u.task === 'lla_coach' && !NOWORK.test(head(u.user)) && /^پس‌انداز|^می‌خواستم بدانم پس‌انداز/.test(s.stmt) && !/احمدی/.test(s.stmt), { task: u.task, stmt: s.stmt }); }],
      [/^U: خب ۳\.۲ رو که تو همون قطر کف/, async (n, U) => { const x = await ev((m) => [APP.ASSIST.metaMsg22(m), APP.ASSIST.unfit23('از خواسته به عقب: فرض کن حل شده — یک گام مانده به آخر چه وضعی بود؟', m)], U); T(n, x[0] === '' && !x[1], x); }],
      [/^U: \.\.\.\s*$/, async (n) => { await wipe(); await fresh(); await turn('یه مسئله: دو ساعت شنی ۷ و ۱۱ دقیقه‌ای، دقیقاً ۱۵ دقیقه چطور؟', 'مجهول؟'); const u = await turn('...', 'کوتاه‌تر: …');
        T(n, !!blockOf(u.user, /^# مربیِ حل/) && /سکوت، «نمی‌دونم» یا پاسخِ بی‌ربط/.test(head(u.user)), heads(u)); }],
      [/چند روز دیر شد\. امروز مدخلِ/, async (n, U) => { const t = await ev((m) => APP.ASSIST.chatTask({ msg: m, prompt: '# مربیِ حل —\n- قاعده\n# وضعِ کنونی\n- زمینه (نه پرسشِ دوم): هنوز مسئله یا کارِ بازی در این سشن نیست.\n' }), U); T(n, t === 'lla_coach', t); }],
      [/^U: پیر شدم، مغزم/, async (n, U) => { const x = await ev((m) => APP.PRE.ability(m), U); T(n, x === true, x); }],
      [/^U: پیر شدم دیگه، نوه‌م/, async (n, U) => { const x = await ev((m) => APP.PRE.ability(m), U); T(n, x === false, x); }],
      [/x²−9 = \(x−3\)\(x\+3\)\. درسته؟ با ضرب/, async (n, U) => { const x = await ev((m) => APP.ASSIST.coachGuess(m), U); T(n, x === false, x); }],
      [/^U: حدس می‌زنم x=3 باشه/, async (n, U) => { const x = await ev((m) => APP.ASSIST.coachGuess(m), U); T(n, x === true, x); }],
      [/^U: می‌شه چک کنی ببینی درسته؟/, async (n, U) => { const x = await ev((m) => /(?:چک|وارسی|امتحان|تست)(?:ش)?[\s‌]*(?:هم[\s‌]*)?کردم|آزمودم|سنجیدم/.test(m) ? 'own-check' : APP.ASSIST.coachGuess(m) ? 'guess' : 'none', U); T(n, x !== 'own-check', x); }],
      [/^U: هشتاد درصد مطمئنم/, async (n, U) => { await wipe(); await fresh(); const x = await ev((m) => [APP.ASSIST.confOwn24(m), APP.ASSIST.unfit23('پیش از گامِ واقعی: چه پیش‌بینی می‌کنی و چقدر مطمئنی؟', m, __cur())], U); T(n, x[0] === 80 && !!x[1], x); }],
      [/^U: فکر کنم ج رو انتخاب می‌کنم/, async (n, U) => { await wipe(); await fresh(); const x = await ev((m) => [APP.ASSIST.confOwn24(m), APP.ASSIST.unfit23('پیش از گامِ واقعی: چه پیش‌بینی می‌کنی و چقدر مطمئنی؟', m, __cur())], U); T(n, x[0] === null && !x[1], x); }],
      [/^U: بعدش چی کار کنم؟/, async (n, U) => { const x = await ev((m) => APP.ASSIST.unfit23('مجهول (یا حکمی که باید ثابت شود) چیست؟', m), U); T(n, x === '', x); }],
      [/^U: مجهولش چیه اصلاً؟/, async (n, U) => { const x = await ev((m) => APP.ASSIST.unfit23('مجهول (یا حکمی که باید ثابت شود) چیست؟', m), U); T(n, x === '', x); }],
      [/سلام من مینام ۱۳ سالمه/, async (n, U) => { await wipe(); await setB('2013-01-01'); await fresh(); const u = await turn(U, 'باشه.'); T(n, !/# اصلاحِ پیامِ پیشین/.test(head(u.user)), heads(u)); }],
      [/^U: سلام، من مریمم/, async (n, U) => { await wipe(); await fresh(); await turn(U, 'سلام!'); const s = await st(); const x = await ev((m) => [APP.ASSIST.notProblem(m), APP.ASSIST.statesProblem(m)], U); T(n, !s.stmt && x[0] === true && !x[1], { stmt: s.stmt, x }); }],
      [/روشِ «کار از آخر» رو به کار بردم و جواب داد/, async (n, U) => { const x = await ev((m) => APP.ASSIST.metaMsg22(m), U); T(n, x === 'use', x); }],
      [/^U: امروز وقت نکردم تمرین کنم/, async (n, U) => { const x = await ev((m) => [APP.ASSIST.metaMsg22(m), APP.ASSIST.chatTask({ msg: m, prompt: '# مربیِ حل —\n- قاعده\n' })], U); T(n, x[0] === '' && x[1] === 'lla_assistant', x); }],
      // R6
      [/page's own turn question: «با واقعیت سنجیدی‌اش؟ از راهِ دیگری/, async (n) => { await wipe(); await fresh(); const w = await twoQ({ hist: FX.s01.hist, tq: 'نتیجه‌ای گفتی — با واقعیت سنجیدی‌اش؟ از راهِ دیگری هم به همین می‌رسیدی؟ (بعد در صفحه «✅ حل شد» و بازنگری)', rep: 'نتیجه‌ای گفتی — با واقعیت سنجیدی‌اش؟ از راهِ دیگری هم به همین می‌رسیدی؟' }); T(n, !/دو پرسش/.test(w), w); }],
      [/the quoted phrase is the assistant's own earlier wording/, async (n) => { await wipe(); await fresh(); await turn('یه مسئله: صفحهٔ شطرنجی با دومینو پر میشه؟', 'یادت باشد هر دومینو دو خانهٔ مجاور را می‌پوشاند. مجهول؟');
        const w = await ev(() => { const s = __cur(); APP.ASSIST._turnSession = s; return APP.ASSIST.replyCheck({ reply: 'گفتی هر دومینو «دو خانهٔ مجاور را می‌پوشاند» — از همین شروع کن.', actions: [] }, { prompt: '# نوبتِ تازه\nx', task: 'lla_coach' }); }); T(n, !/نه در پیام‌های اوست/.test(w), w); }],
      [/U: خب برگردیم به همون سکه‌ها|U: برگشتم سرِ همون گامِ دوم/, async (n, U) => { const x = await ev((m) => APP.PRE.backTo24({ to: 'main', step: /سکه/.test(m) ? 'شمردنِ سکه‌های ۵ تومانی و ۲ تومانی' : 'گامِ دوم: اندازه‌گرفتنِ دبیِ پمپ' }, /سکه/.test(m) ? 'آفرین، برگردیم به همان سکه‌ها: سکه‌های ۵ تومانی و ۲ تومانی را چطور می‌شمری؟' : 'برگردیم به گامِ دوم: دبیِ پمپ را چطور اندازه می‌گیری؟'), U); T(n, x === true, x); }],
      [/این برنامه داده‌هامو کجا نگه می‌داره؟/, async (n, U) => { await wipe(); await fresh(); const u = await turn(U, 'در مرورگرِ خودت.'); const t = await tq(u); T(n, !/خودت فکر می‌کنی چرا/.test(t.q) && /ذخیرهٔ داده‌های این صفحه/.test(u.user), t.q); }],
      [/she reported «با جای‌گذاری چک کردم، درست درومد» one turn earlier/, async (n) => { await wipe(); await fresh(); const x = await ev(() => { const s = __cur(); s.msgs.push({ role: 'user', text: 'پس x = ۴. با جای‌گذاری چک کردم، درست درومد.', at: new Date().toISOString() }, { role: 'ai', text: 'خوب.' });
        return APP.ASSIST.unfit23('جواب را در شرط جای‌گذاری کن — برقرار است؟', 'خب حالا چی؟', s); }); T(n, !!x, x); }],
      [/page composite question «طرحت چیست و از کدام داده شروع می‌کنی؟»/, async (n) => { await wipe(); await fresh(); const w = await twoQ({ hist: [], tq: 'طرحت چیست و از کدام داده شروع می‌کنی؟', rep: 'خوب. طرحت چیست و از کدام داده شروع می‌کنی؟' }); T(n, !/دو پرسش/.test(w), w); }],
      [/reply quotes her two consecutive messages joined/, async (n) => { await wipe(); await fresh(); await turn('یه مسئله: سه جعبه داریم و ۱۲ مهره.', 'خوب.'); await turn('هر جعبه باید زوج باشه', 'خوب.');
        const w = await ev(() => { const s = __cur(); APP.ASSIST._turnSession = s; return APP.ASSIST.replyCheck({ reply: 'گفتی «سه جعبه داریم و ۱۲ مهره، هر جعبه باید زوج باشه» — از کجا شروع می‌کنی؟', actions: [] }, { prompt: '# نوبتِ تازه\nx', task: 'lla_coach' }); }); T(n, !/نه در پیام‌های اوست/.test(w), w); }],
      [/model reply: «چند تا داری؟ چرا این‌طوری حساب کردی؟»/, async (n) => { await wipe(); await fresh(); const w = await twoQ({ hist: FX.s01.hist, tq: FX.s01.tq, rep: 'چند تا داری؟ چرا این‌طوری حساب کردی؟' }); T(n, /دو پرسش/.test(w), w); }],
      [/reply: «گفتی «همه‌اش غلطه»» — she never wrote it/, async (n) => { await wipe(); await fresh(); await turn('یه مسئله: ۳ تا حالت رو امتحان کردم.', 'خوب.');
        const w = await ev(() => { const s = __cur(); APP.ASSIST._turnSession = s; return APP.ASSIST.replyCheck({ reply: 'گفتی «همه‌اش غلطه» — ولی دو حالت درست بود.', actions: [] }, { prompt: '# نوبتِ تازه\nx', task: 'lla_coach' }); }); T(n, /نه در پیام‌های اوست/.test(w), w); }],
      [/return reply that moves to a different step than the waiting one/, async (n) => { const x = await ev(() => APP.PRE.backTo24({ to: 'main', step: 'پخش کردنِ ۲۴ تیله بینِ ۴ جعبهٔ هم‌اندازه' }, 'آفرین! حالا بیا سراغِ بازنگری: کدام پرسش بیشتر کمکت کرد؟')); T(n, x === false, x); }],
      [/reply asks for a check she reported in THIS message/, async (n) => { const x = await ev(() => APP.ASSIST.unfit23('نتیجه‌ای گفتی — با واقعیت سنجیدی‌اش؟ از راهِ دیگری هم به همین می‌رسیدی؟', 'پس ۱۲ تا. خودم الان چک کردم، با ۳ تا جعبه جور درمیاد.')); T(n, !!x, x); }],
      [/«خودت فکر می‌کنی چرا؟» to a math stuck where it fits/, async (n) => { await wipe(); await fresh(); await turn('یه مسئله: ۱۲ تا سیب بین ۳ نفر، هر کی چند تا؟', 'مجهول؟'); const u = await turn('چرا باید تقسیم کنم و ضرب نکنم؟', 'باشه.');
        T(n, /خودت فکر می‌کنی چرا/.test(head(u.user)), (await tq(u)).q); }],
    ];
    const heads = (u) => head(u.user).split('\n').filter(l => /^# /.test(l)).map(l => l.slice(0, 40));
    for (let n = 1; n <= BANK.length; n++) {
      const e = E[n]; if (!/^R[46]\./.test(e.rc)) continue;
      try { const h = H.find(([re]) => re.test(e.text)); if (!h) { NC(n, OTHER(e)); continue; } await h[1](n, Uof(n)); }
      catch (er) { errors.push('bank#' + n + ' exception: ' + String(er && er.stack || er).split('\n').slice(0, 2).join(' | ')); }
    }
    const mine = Object.keys(E).filter(n => /^R[46]\./.test(E[n].rc)).map(Number);
    const miss = mine.filter(n => !(n in info.bank) && !(n in info.nc)); chk(!miss.length, 'bank coverage: every R4/R6 entry judged or given a reason ' + JSON.stringify(miss));
  });

  const nOk = Object.values(info.bank).filter(Boolean).length; info.summary = { judged: Object.keys(info.bank).length, pass: nOk, nc: Object.keys(info.nc).length };
  console.log(JSON.stringify(info.summary), JSON.stringify(info.nc));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
