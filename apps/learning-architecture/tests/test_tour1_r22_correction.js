// تورِ پولیا (دستهٔ ۱، دورِ ۲۲، ۲۰۲۶-۱۰-۱۸) — DECISIONS_R22، سازوکارِ P3 «موتورِ اصلاح، باقی‌مانده» (fixer «correction»: a38/a40 برگرداندن و نسخه‌ها، سویِ اصلاحِ a27).
//  دو منبعِ شاهد، هر دو قرمز پیش از اصلاح:
//   (۱) جمله‌های خودِ دونده‌ها (round22{A,B,C,D}: A22-4/8/17/18/19/20/30، B·D2/D3/D4/D5/D15/D16/D19، C22-5/6/7/8/9/10/14، D s30/s34/s36/s37/s38) با متن‌های واقعیِ همان نوبت‌ها؛
//   (۲) بانکِ مستقلِ VARIANTS_R22 (tests/variants/VARIANTS_R22.json = tour1_polya/VARIANTS_R22.json؛ LLA_VARIANTS = مسیرِ دیگر) — هر ورودیِ P3 یک بررسی دارد؛
//       ورودیِ سازوکارهای دیگر با دلیل «not covered» چاپ می‌شود و این آزمون را قرمز نمی‌کند.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R22.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R22.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)) || '';

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { runners: {}, bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const J = (x) => JSON.stringify(x);
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = [];
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => { __calls.push({ sys, user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    window.__turn = async (text, reply, actions) => { const n0 = __calls.length; __q.push(R({ reply: reply || 'باشه.', actions: actions || [] })); await APP.ASSIST.send(text); __q.length = 0;
      const all = __calls.slice(n0), c = all.filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {}; return { user: c.user || '', all: all.map(x => x.user) }; };
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'card', 'deadline', 'fcast', 'mlog'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__fresh = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__U = (n) => (__cur().msgs || []).filter(m => m.role === 'user' && !/^\[(?:سامانه|اصلاحِ پیامِ قبلی)/.test(m.text))[n - 1];
    window.__live = (title, st, o) => { const r = APP.liveCreate(title, st, 'find', Object.assign({ by: 'user' }, o || {})); return r.p.id; };
    window.__set = (pid, fn) => { const pg = APP.S.get('eprog_' + pid); pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {}; ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L, APP.S.get('eprob_' + pid)); APP.S.put(pg); };
    /* ✏️ تمام: صفحه (retractMsg) ⇐ نوبتِ «[اصلاحِ پیامِ قبلی]» ⇐ مربی (retractApply) ⇐ متنِ تازهٔ حباب */
    window.__edit = async (m, nt) => { const s = __cur(), n0 = __calls.length; __q.push(R({ reply: 'درست شد.' })); const r = APP.ASSIST.retractEdit(s, m, nt);
      for (let i = 0; i < 80 && (__calls.length === n0 || APP.ASSIST.busy()); i++) await new Promise(z => setTimeout(z, 100)); await new Promise(z => setTimeout(z, 300)); return { r: { ok: r.ok, changed: (r.changed || []).map(c => c.label + ': ' + (typeof c.old === 'string' ? c.old : '') + ' ⇒ ' + (typeof c.new === 'string' ? c.new : '')), ask: (r.ask || []).map(q => q.path + '|' + q.old + '⇒' + q.new) }, user: (__calls.slice(n0)[0] || {}).user || '' }; };
    window.__asks = (sid) => ((APP.S.get(sid || __cur().id) || {}).copyAsk || []).map(q => ({ id: q.id, path: q.path, label: q.label, old: q.old, new: q.new, state: q.state }));
  });
  const turn = (text, reply, actions) => p.evaluate(([t, r, a]) => __turn(t, r, a), [text, reply || '', actions || []]);
  const ev = (f, a) => p.evaluate(f, a);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const blockOf = (u, re) => head(u).split(/\n(?=# )/).filter(bl => re.test(bl.split('\n')[0]))[0] || '';
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const RT = (o) => [cs({ retract: o })];
  const GARBLE = /متر مربعه متر مربعه|۱\.۵\.۵|یه تا اسکیس|عروسی[^.،]{0,30}تا عروسی|به فقط باید/;
  const res = {};
  const T = async (name, fn) => { let r; try { r = await fn(); } catch (ex) { r = { ok: false, got: 'exception ' + String(ex && ex.stack || ex).split('\n').slice(0, 3).join(' | ') }; } res[name] = !!r.ok; info.runners[name] = !!r.ok; if (!r.ok) errors.push(name + ' got ' + J(r.got).slice(0, +process.env.GOTN || 900)); return r.ok; };

  /* ================= (۱) جمله‌های دونده‌ها ================= */
  // D s37 (S2، تازه): «وقتی با «✏️» یک رقم را از ۴ به ۵ عوض کرد، صفحه بی‌جا پیشنهاد داد درسِ بازنگری‌اش «جدا کردن شرط به بر ۴ و بر ۹» هم «بر ۵» شود»
  await T('D s37 ✏️ «۴⇒۵» never asks the unrelated lesson «بر ۴ ⇒ بر ۵»', async () => { await ev(() => { __wipe(); __fresh(); });
    const pid = await ev(() => { const pid = __live('قیمت هر گوسفند', 'تو دفتر حساب کاروانسرا نوشته «۳۶ رأس گوسفند: ؟۴۵۷؟ ریال» — قیمت هر رأس؟'); APP.liveBindSession(pid, __cur());
      __set(pid, (so) => { so.b = { 1: { done: true, from: 'page', at: new Date().toISOString(), verdict: 'verified', use: 'شرطِ بزرگ را به شرط‌های کوچک بشکن', worked: 'جدا کردن شرط به بر ۴ و بر ۹', glance: '' } }; }); return pid; });
    await turn('با ۵: بر ۴ همون ۷۲ یا ۷۶. بر ۹: با ۲ جمع ۴+۵+۷+۲=۱۸ پس رقم اول ۹ → ۹۴۵۷۲. با ۶: رقم اول ۴ → ۴۴۵۷۶.', 'وارسی کن.');
    const x = await ev(async () => __edit(__U(1), 'با ۵: بر ۴ همون ۷۲ یا ۷۶. بر ۹: با ۲ جمع ۴+۵+۷+۲=۱۸ پس رقم اول ۹ → ۹۴۵۷۲. با ۶: رقم اول ۵ → ۵۴۵۷۶.'));
    const q = await ev(() => __asks());
    return { ok: !q.some(a => /^b\./.test(a.path) || /بر ۵/.test(a.new)), got: { q, x: x.r } }; });

  // C22-8 s23 (S2): «✏️ editing several numbers in one message: statement garbled «۱.۵.۵ پیمونه شکر» … copy-ask for data 3 shows old == new (پیمانه/پیمونه not substituted)»
  const S23 = 'سلام. دستور کیک مادرم برای قالب گرد ۲۰ سانتیه: ۳ تخم‌مرغ، ۱ پیمونه شکر، ۲ پیمونه آرد، ۱۰۰ گرم کره. قالب من مستطیل ۲۵ در ۳۵ه. همه چی رو چند برابر کنم؟ گفتم شاید ۳۵ تقسیم بر ۲۰، یعنی ۱.۷۵ برابر. می‌خوام خودم بفهمم، بیا ثبتش کنیم.';
  await T('C22-8 s23 ✏️ two numbers: statement «۱.۵ پیمونه شکر … ۱۲۰ گرم کره» (no «۱.۵.۵»); data-3 ask old ≠ new', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn(S23, 'ثبتش می‌کنیم.');
    const pid = await ev((S23) => { const s = __cur(), m = __U(1); const pid = __live('کیکِ مادرم در قالبِ ۲۵×۳۵', S23, { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'کیک برای قالبِ بزرگ‌تر', u: 'ضریبِ مواد', dl: [{ id: 'd1', t: 'قالبِ گردِ ۲۰ سانتی' }, { id: 'd2', t: 'قالبِ من مستطیلِ ۲۵ در ۳۵ سانتی‌متر' }, { id: 'd3', t: '۱ پیمانه شکر' }], c: '', type: 'find', nat: 'practical', from: 'page' } }; }); return pid; }, S23);
    await ev(async () => __edit(__U(1), 'سلام. دستور کیک مادرم برای قالب گرد ۲۰ سانتیه: ۳ تخم‌مرغ، ۱.۵ پیمونه شکر، ۲ پیمونه آرد، ۱۲۰ گرم کره. قالب من مستطیل ۲۵ در ۳۵ه. همه چی رو چند برابر کنم؟ گفتم شاید ۳۵ تقسیم بر ۲۰، یعنی ۱.۷۵ برابر. می‌خوام خودم بفهمم، بیا ثبتش کنیم.'));
    const st = await ev((pid) => APP.S.get('eprob_' + pid).p.statement, pid), q = await ev(() => __asks()), d3 = q.filter(a => a.path === 'dl:d3')[0];
    return { ok: /۱\.۵ پیمونه شکر/.test(st) && /۱۲۰ گرم کره/.test(st) && !GARBLE.test(st) && d3 && d3.old !== d3.new && /۱\.۵|۱٫۵/.test(d3.new) && /پیمانه شکر/.test(d3.new), got: { st, q } }; });

  // B·D4 bp2 (S2): «SUBSTITUTION GARBLES HER STATEMENT: bp2 «پشت‌بوم انبارم ۶۰ متر مربعه متر مربعه.»»؛ B·D2: «d1 «پنجاه متر مربع» and the measure line … never asked»
  await T('B·D4/D2 bp2 «۶۰ متر مربعه» (old «۵۰»): statement once, chat statement once; «پنجاه متر مربع» and the measure line asked', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('سلام. پشت‌بوم انبارم ۵۰ متر مربعه. می‌خوام آب بارون رو جمع کنم برای آبیاری درختای جوون پسته.', 'کل را بگو.');
    await turn('بارش سالانه‌ی اینجا حدود ۱۵۰ میلی‌متره. می‌خوام بدونم در سال چقدر آب از این پشت‌بوم جمع می‌شه، و دو تا بشکه‌ی ۲۲۰ لیتری که دارم بسه یا باید بیشتر بخرم.', 'از این دو داده چطور؟');
    const pid = await ev(() => { const s = __cur(); const pid = __live('مخزنِ آبِ بارانِ پشت‌بامِ انبار', 'پشت‌بوم انبارم ۵۰ متر مربعه. می‌خوام آب بارون رو جمع کنم برای آبیاری درختای جوون پسته. بارش سالانه‌ی اینجا حدود ۱۵۰ میلی‌متره. می‌خوام بدونم در سال چقدر آب از این پشت‌بوم جمع می‌شه، و دو تا بشکه‌ی ۲۲۰ لیتری که دارم بسه یا باید بیشتر بخرم.', { by: 'assistant', sess: s.id });
      APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'آبِ سالانهٔ پشت‌بام', u: 'لیتر در سال', dl: [{ id: 'd1', t: 'پنجاه متر مربع' }, { id: 'd2', t: 'بارش ۱۵ سانتی‌متر' }], c: '', type: 'find', nat: 'practical', from: 'page', prac: { measure: 'حجم = ۵۰ مترمربع × ۰٫۱۵ متر' } } }; }); return pid; });
    await turn('یه اصلاح: اولِ کار که گفتم پشت‌بوم ۵۰ متر مربعه اشتباه بود؛ امروز با متر اندازه گرفتم، ۶۰ متر مربعه. بارش همون ۱۵۰ میلی‌متره.', 'فرستادم.', RT({ msg: 'پشت‌بوم انبارم ۵۰ متر مربعه', key: 'datum:سطحِ پشت‌بام', what: 'fact', fix: '۶۰ متر مربعه', old: '۵۰' }));
    const st = await ev((pid) => APP.S.get('eprob_' + pid).p.statement, pid), cst = await ev(() => (__cur().coach || {}).stmt || ''), q = await ev(() => __asks());
    const d1 = q.filter(a => a.path === 'dl:d1')[0], ms = q.filter(a => a.path === 'prac.measure')[0];
    return { ok: /پشت‌بوم انبارم ۶۰ متر مربعه\./.test(st) && !GARBLE.test(st) && !GARBLE.test(cst) && d1 && /۶۰ متر مربع/.test(d1.new) && ms && /۶۰ مترمربع × ۰٫۱۵ متر/.test(ms.new), got: { st, cst, q } }; });
  // B·D2 bp2 ✏️ «۱۵۰⇒۱۴۰»: «d2 «۱۵ سانتی‌متر» not asked» (۱۵۰ میلی‌متر = ۱۵ سانتی‌متر)
  await T('B·D2 bp2 ✏️ ۱۵۰⇒۱۴۰ میلی‌متر asks d2 «۱۵ سانتی‌متر» ⇒ «۱۴ سانتی‌متر»', async () => {
    await ev(async () => __edit(__U(2), 'بارش سالانه‌ی اینجا حدود ۱۴۰ میلی‌متره. می‌خوام بدونم در سال چقدر آب از این پشت‌بوم جمع می‌شه، و دو تا بشکه‌ی ۲۲۰ لیتری که دارم بسه یا باید بیشتر بخرم.'));
    const q = await ev(() => __asks()), d2 = q.filter(a => a.path === 'dl:d2')[0];
    return { ok: d2 && /۱۴ سانتی‌متر/.test(d2.new) && !GARBLE.test(d2.new), got: q }; });

  // B·D4 s19 (S2): «s19 «عروسی ۱۵ اسفنده تا عروسی برادرم مونده، …»»؛ B·D5: «the wedding-date correction … ALSO set aside a refuted guess … and the sufficiency judgement»
  await T('B·D4/D5 s19 deadline fix «عروسی ۱۵ اسفنده»: no «عروسی … تا عروسی»; refuted guess and sufficiency stay', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('۴ کیلو کم کردم ولی ۱۶ هفته تا عروسی برادرم مونده و می‌خوام ۸ کیلوی دیگه کم کنم.', 'خب.');
    const pid = await ev(() => { const s = __cur(); const pid = __live('کم‌کردنِ وزن تا عروسی', '۴ کیلو کم کردم ولی ۱۶ هفته تا عروسی برادرم مونده و می‌خوام ۸ کیلوی دیگه کم کنم.', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so, L) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'هشت کیلو تا عروسی', u: 'برنامه', dl: [{ id: 'd1', t: 'هر دو هفته وزن' }], c: '', type: 'find', nat: 'life', from: 'page' } };
        so.g = { 1: { guess: 'با ورزش تنها می‌رسم', test: 'دو هفته فقط ورزش کردم و وزنم کم نشد', hit: 'نادرست بود', at: new Date().toISOString() } };
        L.suffLog = [{ at: new Date().toISOString(), d: APP.today(), ans: 'کافی است', where: 'u' }]; }); return pid; });
    await turn('اشتباه گفتم، عروسی ۱۵ اسفنده.', 'فرستادم.', RT({ msg: '۱۶ هفته تا عروسی برادرم مونده', key: 'deadline:d1', what: 'fact', fix: 'عروسی ۱۵ اسفنده', old: '۱۶ هفته' }));
    const x = await ev((pid) => { const so = APP.S.get('eprog_' + pid).solve; return { st: APP.S.get('eprob_' + pid).p.statement, g: so.g[1], suff: (so.live.suffLog || []).slice(-1)[0], note: (__cur().coach.retNote || {}).res }; }, pid);
    return { ok: !GARBLE.test(x.st) && /۱۵ اسفند/.test(x.st) && x.g.hit === 'نادرست بود' && !x.g.outSup && x.suff.ans === 'کافی است', got: x }; });

  // D s34 (S3): «متنِ پیشنهادیِ آن پرسش خراب بود: «یه تا اسکیس از زمین زدم» به‌جای «یه اسکیس و دومی نصفه»»
  await T('D s34 ✏️ «یه اسکیس زدم و دومی رو نصفه ول کردم»: 🌱 ask is not «یه تا اسکیس», keeps her span', async () => { await ev(() => { __wipe(); __fresh(); });
    const pid = await ev(() => { const pid = __live('پروژهٔ پایانیِ معماری', 'سه ماهه پروژه‌ی پایانی رو شروع نکردم.'); APP.liveBindSession(pid, __cur());
      __set(pid, (so) => { so.will = { steps: [{ id: 'w1', step: 'یه اسکیس دستی از زمین پروژه، ۲۰ دقیقه', checks: [{ what: 'دو تا اسکیس از زمین زدم: یکی پلان سایت، یکی دید از خیابون.', at: new Date().toISOString() }] }] }; }); return pid; });
    await turn('دو تا اسکیس زدم ولی اینا خیلی ناچیزن، پروژه هنوز سر جاشه.', 'کل را بگو.');
    await ev(async () => __edit(__U(1), 'یه اسکیس زدم و دومی رو نصفه ول کردم ولی اینا خیلی ناچیزن، پروژه هنوز سر جاشه.'));
    const q = await ev(() => __asks()), w = q.filter(a => /^willck:/.test(a.path))[0];
    return { ok: !q.some(a => GARBLE.test(a.new)) && w && /یه اسکیس زدم و دومی رو نصفه ول کردم/.test(w.new) && /پلان سایت/.test(w.new), got: q }; });

  // D s38 (S2): «اصلاحِ درس، جملهٔ درس را بی‌معنا کرد: «…با یه صفحه به فقط باید قاعده و ارتفاعِ هر تکه معلوم باشه ببُرم…». کارتِ مرور هم همین متن را گرفت»
  //          + «صفحه متنِ کاملِ درسِ تازه را به خودِ او نشان دهد و تأیید بخواهد»
  const LES = 'وقتی قاعده و ارتفاع ندارم، شکل رو با یه صفحه به دو تکهٔ هم‌اندازه ببُرم که قاعده و ارتفاع دارن.';
  await T('D s38 lesson fix: no garble in lesson or card; full new text asked; «بله» ⇒ lesson and card', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('اگه b=a باشه میشه a³/6؛ با مکعب به ضلع a که حجمش a³ه، به نظرم منطقیه. درسم اینه: ' + LES, 'ثبت شد.');
    const pid = await ev((LES) => { const s = __cur(), m = __U(1); const pid = __live('حجمِ چهاروجهی', 'حجم چهاروجهی‌ای رو پیدا کنید که دو یال روبه‌روش طول a دارن.'); APP.liveBindSession(pid, s);
      const cd = { id: APP.uid('card'), type: 'card', q: 'درسِ «حجمِ چهاروجهی» را بی‌نگاه بازسازی کن', a: LES, due: APP.today() }; APP.S.put(cd);
      __set(pid, (so, L) => { L.state = 'solved'; L.chat = { sess: s.id, at: new Date().toISOString(), solution: 'a²b/6', mid: APP.liveMsgId(m) };
        so.b = { 1: { done: true, from: 'chat', at: new Date().toISOString(), verdict: 'verified', use: LES, src: { use: APP.liveSrc(s.id, APP.liveMsgId(m), 'lesson', LES) }, srcSet: true } }; so.lessons = [{ use: LES, card: cd.id }]; }); return { pid, card: cd.id }; }, LES);
    await turn('درسم رو اشتباه گفتم: لازم نیست دو تکه هم‌اندازه باشن؛ فقط باید قاعده و ارتفاعِ هر تکه معلوم باشه.', 'فرستادم.', RT({ msg: 'به دو تکهٔ هم‌اندازه ببُرم که قاعده و ارتفاع دارن', key: 'lesson', what: 'lesson', fix: 'فقط باید قاعده و ارتفاعِ هر تکه معلوم باشه', old: 'دو تکهٔ هم‌اندازه' }));
    const a = await ev((o) => ({ use: APP.S.get('eprog_' + o.pid).solve.b[1].use, card: APP.S.get(o.card).a, q: __asks(), note: (__cur().coach.retNote || {}).res }), pid);
    const qa = a.q.filter(x => x.path === 'b.use')[0];
    if (!qa) return { ok: false, got: a };
    await ev((id) => APP.liveCopyAnswer(__cur().id, id, true), qa.id);
    const b2 = await ev((o) => ({ use: APP.S.get('eprog_' + o.pid).solve.b[1].use, card: APP.S.get(o.card).a }), pid);
    return { ok: !GARBLE.test(a.use) && !GARBLE.test(a.card) && a.use === LES && /لازم نیست دو تکه هم‌اندازه باشن؛ فقط باید قاعده و ارتفاعِ هر تکه معلوم باشه/.test(qa.new) && !GARBLE.test(qa.new) && b2.use === qa.new && /فقط باید قاعده/.test(b2.card), got: { a, b2 } }; });

  // D s38 (S2): «اصلاحِ ساعتِ تحویل (۱۰ نه ۸) هنوز اثری ندارد. سطری که به او نشان داده شد هم نادرست است: «از آن بخشِ پیامت چیزی ثبت نشده بود»» (key=datum)
  //          + «در پرامپت شناسهٔ موعد (dN) هرگز نشان داده نمی‌شود» (C22-14)
  await T('D s38/C22-14 deadline «۸ صبح ⇒ ۱۰ صبح» with key=datum: deadline moves, result says so; deadline id in the prompt', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('ساعت ۱۱ شبه، فردا ۸ صبح باید تحویل بدم. حجم چهاروجهی رو پیدا کنم.', 'باشه.', [{ do: 'deadline', what: 'تحویل تکلیف حجم چهاروجهی', date: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })(), time: '08:00' }]);
    const u = await turn('راستی اولش هم اشتباه گفتم: تحویل ساعت ۱۰ صبحه، نه ۸. حالا برم بخوابم.', 'فرستادم.', RT({ msg: 'فردا ۸ صبح باید تحویل بدم', key: 'datum:ساعتِ تحویل', what: 'fact', fix: '۱۰ صبح', old: '۸ صبح' }));
    const x = await ev(() => { const d = APP.S.all('deadline')[0], s = __cur(); return { time: d && d.time, id: d && d.id, res: (s.coach.retNote || {}).res, sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text).slice(-2) }; });
    const idIn = new RegExp('deadline:' + x.id).test(head(u.user));
    return { ok: x.time === '10:00' && x.res && x.res.changed.some(c => /تحویل/.test(c.rec)) && !/ثبت نشده بود/.test(x.sys.join(' ')) && idIn, got: { x, idIn, blk: blockOf(u.user, /^# اصلاحِ پیامِ پیشین \(شاید\)/).slice(0, 600) } }; });

  // D s36 (S2): ««ظرفِ اول ۳۰ لیتر بود، نه ۲۰ لیتر. پس جوابم عوض میشه؟» was refused as «پرسش است، نه اصلاح»» — «داوری با بند باشد، نه با پایانِ پیام»
  await T('D s36 a correction ending in a follow-up question is judged by its clause', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('دو تا ظرف دارم: ظرف اول ۲۰ لیتر و ظرف دوم ۱۲ لیتر؛ می‌خوام دقیقاً ۸ لیتر جدا کنم.', 'خب.');
    await turn('ظرفِ اول ۳۰ لیتر بود، نه ۲۰ لیتر. پس جوابم عوض میشه؟', 'فرستادم.', RT({ msg: 'ظرف اول ۲۰ لیتر', key: 'datum:ظرفِ اول', what: 'fact', fix: '۳۰ لیتر' }));
    const x = await ev(() => { const C = __cur().coach || {}; return { ret: (C.retracts || []).slice(-1)[0], q: APP.ASSIST.retractCheck(__cur(), { msg: 'ظرف اول ۲۰ لیتر', what: 'fact', fix: '۳۰ لیتر' }) }; });
    const q2 = await ev(() => APP.ASSIST.fixQ22('جوابم ۳۰ لیتر بود؟', '۳۰ لیتر'));
    return { ok: x.ret && x.ret.ok === true && !x.q.err && q2 === true, got: x }; });

  // C22-9 s29 (S3): ««مربع بهترین است» is set aside although it holds for any perimeter» — وابستگی از پایه‌ای که مدل گزارش داد (rests)، با سنجشِ صفحه
  await T('C22-9 s29 «۴۰ ⇒ ۴۴» with rests:[] keeps «مربع بهترین است»; the solved answer that names ۴۰ is set aside', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('۴۰ متر لبه‌ی سنگی دارم برای یه باغچه‌ی چهارضلعی. بزرگ‌ترین باغچه چه شکلی میشه؟', 'خب.');
    const pid = await ev(() => { const s = __cur(), m = __U(1); const pid = __live('بزرگ‌ترین باغچه با لبهٔ سنگی', '۴۰ متر لبه‌ی سنگی دارم برای یه باغچه‌ی چهارضلعی. بزرگ‌ترین باغچه چه شکلی میشه؟', { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so, L) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'بیشترین مساحت با محیطِ ثابت', u: 'شکل', dl: [{ id: 'd1', t: 'محیط ۴۰ متر' }], c: '', type: 'find', nat: 'objective', from: 'page' } };
        so.b = { 1: { done: true, from: 'page', at: new Date().toISOString(), verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: 'برای هر محیطی، از میانِ مستطیل‌ها مربع بیشترین مساحت را دارد', use: 'مربع بهترین است' } };
        L.aux.push({ t: 'مستطیل‌هایی با محیطِ ۴۰ متر را مقایسه کن', bridge: 'همان محیط', k: 'special' }); }); return pid; });
    await turn('یه اصلاح دربارهٔ باغچه: روز اول گفتم «۴۰ متر لبه‌ی سنگی دارم» — اشتباه گفتم، ۴۴ متره.', 'فرستادم.', RT({ msg: '۴۰ متر لبه‌ی سنگی دارم', key: 'datum:طولِ لبه‌ی سنگی', what: 'fact', fix: '۴۴', old: '۴۰', rests: [] }));
    const x = await ev((pid) => { const so = APP.S.get('eprog_' + pid).solve; return { v: so.b[1].verdict, sup: !!so.b[1].superseded, st: APP.S.get('eprob_' + pid).p.statement, q: __asks() }; }, pid);
    const d1 = x.q.filter(a => a.path === 'dl:d1')[0], ax = x.q.filter(a => a.path === 'aux:0')[0];
    return { ok: x.v === 'verified' && !x.sup && /۴۴ متر/.test(x.st) && d1 && /محیط ۴۴ متر/.test(d1.new) && ax && /۴۴ متر/.test(ax.new), got: x }; });

  // C22-6 s25 (S2، پسرفت): «s25 C3 «۱۰ تاشو چک کردم ⇒ ۸» no longer reaches the statement (round 21 ✓); page says «از آن بخش چیزی ثبت نشده بود»»
  await T('C22-6 s25 «۱۰ تاشو چک کردم ⇒ ۸» reaches the statement composed from two of her messages', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('امروز اتفاقی دیدم ۱/۲ + ۱/۶ + ۱/۱۲ = ۳/۴. با ۱/۲۰ میشه ۴/۵! فکر کنم کشف کردم که همیشه 1/(1·2) + 1/(2·3) + … + 1/(n(n+1)) = n/(n+1) میشه. ۱۰ تاشو چک کردم. درسته دیگه؟ ثابت شد.', 'برهانش؟');
    await turn('خب ۱۰ تا چک کردم، دیگه اثباته! ولی باشه، ثبتش کن ببینیم.', 'ثبتش می‌کنیم.');
    const pid = await ev(() => { const s = __cur(); const pid = __live('جمعِ ۱/۲ + ۱/۶ + ۱/۱۲ + …', 'امروز اتفاقی دیدم ۱/۲ + ۱/۶ + ۱/۱۲ = ۳/۴. با ۱/۲۰ میشه ۴/۵! فکر کنم کشف کردم که همیشه 1/(1·2) + 1/(2·3) + … + 1/(n(n+1)) = n/(n+1) میشه. ۱۰ تاشو چک کردم. خب ۱۰ تا چک کردم، دیگه اثباته!', { by: 'assistant', sess: s.id });
      APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id)); return pid; });
    await turn('یه چیز دیگه: روز اول گفتم «۱۰ تاشو چک کردم» — اشتباه گفتم، ۸ تا بود، نه ۱۰.', 'فرستادم.', RT({ msg: '۱۰ تاشو چک کردم', key: 'datum:تعدادِ نمونه‌های وارسی‌شده', what: 'fact', fix: '۸', old: '۱۰' }));
    const x = await ev((pid) => ({ st: APP.S.get('eprob_' + pid).p.statement, res: (__cur().coach.retNote || {}).res, src: APP.S.get('eprob_' + pid).src }), pid);
    return { ok: /۸ تاشو چک کردم/.test(x.st) && x.res && x.res.changed.some(c => c.rec === 'صورتِ مسئله'), got: x }; });

  // B·D16 s19 (S3): «s19 «۷۴٫۵»: she is told «چیزی در صفحه ثبت نشده بود» while the bubble is marked … the plot's axis still reads «۷۸ … ۷۴»»
  await T('B·D16 s19 «۷۴٫۵ نه ۷۴» (no live problem): the measure point changes and the result says so — never «nothing recorded» beside a marked bubble', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('۴ کیلو کم کردم. وزنم هر دو هفته: ۷۸، ۷۷٫۲، ۷۶٫۵، ۷۵٫۱، ۷۴', 'خب.');
    await turn('اشتباه زدم، آخری ۷۴٫۵ بود نه ۷۴.', 'فرستادم.', RT({ msg: '۴ کیلو کم کردم. وزنم هر دو هفته: ۷۸، ۷۷٫۲، ۷۶٫۵، ۷۵٫۱، ۷۴', key: 'datum:وزنِ هفتهٔ هشتم', what: 'fact', fix: '۷۴٫۵', old: '۷۴' }));
    const x = await ev(() => { const s = __cur(), m = __U(1); return { pts: (m.pts || []).map(p => p.raw), corr: (m.corr || []).filter(c => c.n > 0).length, res: (s.coach.retNote || {}).res, sys: s.msgs.filter(z => z.role === 'sys').map(z => z.text).slice(-1) }; });
    const marked = x.corr > 0, said = x.res && x.res.changed.length > 0;
    return { ok: x.pts.indexOf('۷۴٫۵') >= 0 && x.pts.indexOf('۷۴') < 0 && marked === said && !/ثبت نشده بود/.test(x.sys.join(' ')), got: x }; });

  // A22-19 s10 (S2): «after her «بله» … the next prompt's result block still says {"changed":[] …} + «changed خالی است: … بگو چیزی عوض نشد»»
  await T('A22-19 s10 «بله» updates the result block the model receives', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('سه تا میزِ سه‌نفره داریم و ۹ نفر مهمون؛ می‌خوام ثابت کنم نمی‌شه دو نفر رو که با هم قهرن جدا نشوند.', 'خب.');
    const pid = await ev(() => { const s = __cur(); const pid = __live('چیدمانِ میزها', 'سه تا میزِ سه‌نفره داریم و ۹ نفر مهمون.'); APP.liveBindSession(pid, s);
      __set(pid, (so, L) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'چیدمانِ مهمان‌ها', u: 'ممکن است؟', dl: [{ id: 'd1', t: '۹ نفر مهمان' }, { id: 'd2', t: 'سه میزِ سه‌نفره' }], c: '', type: 'prove', nat: 'objective', from: 'page' } };
        so.b = { 1: { done: true, from: 'page', at: new Date().toISOString(), verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: 'با سه میزِ سه‌نفره شمردم' } }; L.state = 'solved'; }); return pid; });
    await turn('اشتباه گفتم، میزها چهارنفره‌ان نه سه‌نفره.', 'فرستادم.', RT({ msg: 'سه تا میزِ سه‌نفره داریم', key: 'datum:میز', what: 'fact', fix: 'چهارنفره', old: 'سه‌نفره' }));
    const q = await ev(() => __asks()), q2 = q.filter(a => a.path === 'dl:d2')[0];
    if (!q2) return { ok: false, got: { q } };
    await ev((id) => APP.liveCopyAnswer(__cur().id, id, true), q2.id);
    const u = await turn('باشه، پس با چهارنفره دوباره نگاه می‌کنم.', 'خوب.');
    const bl = blockOf(u.user, /^# اصلاحی که صفحه انجام داد/);
    return { ok: !!bl && !/"changed":\[\]/.test(bl) && /چهارنفره/.test(bl) && !/changed خالی است/.test(bl) && !/"label":"داده‌ها — «دادهٔ ۲»"/.test(bl), got: bl.slice(0, 900) }; });

  // A22-4/C22-7 (S3): «result block contradiction remains: changed plus «رکوردی ساخته نشده بود»» / «one empty changed item {rec:«کارنامه», old:"", new:""}»
  await T('A22-4/C22-7 the note always agrees with changed[]; no empty changed item', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('رسید رو صبح شمرده بودیم و ۱۲ میلیون بود.', 'خب.');
    await ev(() => { const s = __cur(); const p1 = __live('رسیدِ گم‌شده', 'رسید رو صبح شمرده بودیم و ۱۲ میلیون بود.', { by: 'assistant', sess: s.id }); APP.liveBindSession(p1, s); APP.liveStampSess(APP.S.get(s.id));
      const p2 = __live('مسئلهٔ دیگرِ همین سشن', 'یک مسئلهٔ دیگر بی ربط به شمارش.'); s.lprobLog = (s.lprobLog || []).concat([{ p: p2, at: new Date().toISOString() }]); APP.S.put(s); });
    await turn('اشتباه گفتم، ظهر شمرده بودیم نه صبح.', 'فرستادم.', RT({ msg: 'رسید رو صبح شمرده بودیم', key: 'datum:زمان', what: 'fact', fix: 'ظهر', old: 'صبح' }));
    const r = await ev(() => (__cur().coach.retNote || {}).res);
    return { ok: r && r.changed.length > 0 && !/رکوردی ساخته نشده|ثبت نشده بود/.test(r.note || '') && r.changed.every(c => c.old || c.new), got: r }; });

  // B·D3 s11 (S2): «VERDICT NOT SET ASIDE when the corrected datum sits in an earlier (solved) live problem … the correction event was booked in the dossier of the NEW problem»
  //   + D s30: «اصلاحِ «۸۰۰ ⇐ ۷۵۰» … در «📜 پروندهٔ کامل» ِ مسئلهٔ تیکت‌ها هم آمده» + A22-20/D s34/s38: «رویدادِ اصلاح در پرونده دو بار ثبت می‌شود»
  await T('B·D3/D s30/A22-20 a correction reaches the earlier solved problem, is filed in THAT dossier once, never in the other one', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn('یه صفحه ۱۰×۱۰ دارم که دو گوشه‌ی روبه‌روش رو برداشتیم؛ می‌شه با دومینو پوشوند؟', 'خب.');
    const ids = await ev(() => { const s = __cur(), m = __U(1); const p1 = __live('دومینو روی صفحهٔ بریده', 'یه صفحه ۱۰×۱۰ دارم که دو گوشه‌ی روبه‌روش رو برداشتیم؛ می‌شه با دومینو پوشوند؟', { by: 'assistant', sess: s.id }); APP.liveStampSess(APP.S.get(s.id));
      __set(p1, (so, L) => { L.state = 'solved'; L.chat = { sess: s.id, at: new Date().toISOString(), solution: 'ناممکن — ۵۰ و ۴۸', mid: APP.liveMsgId(m) };
        so.b = { 1: { done: true, from: 'page', at: new Date().toISOString(), verdict: 'verified', chkRes: 'نتیجه سالم ماند', chkHow: 'رنگ‌ها را در صفحهٔ ۱۰×۱۰ شمردم: ۵۰ و ۴۸' } }; });
      const p2 = __live('کدام دو خانه', 'کدام دو خانه را برداریم که بشود پوشاند؟'); APP.liveBindSession(p2, s);
      const s2 = APP.S.get(s.id); s2.lprobLog = (s2.lprobLog || []).filter(e => e.p !== p1); APP.S.put(s2); return { p1, p2 }; });
    await turn('یه اصلاح: تو پیام اولم گفتم صفحه ۱۰×۱۰؛ اشتباه گفتم، ۸×۸ بود.', 'فرستادم.', RT({ msg: 'یه صفحه ۱۰×۱۰', key: 'datum:اندازهٔ صفحه', what: 'fact', fix: '۸×۸' }));
    const x = await ev((o) => { const so = APP.S.get('eprog_' + o.p1).solve, D1 = APP.dossier(o.p1), D2 = APP.dossier(o.p2);
      return { v: so.b[1].verdict, st: APP.S.get('eprob_' + o.p1).p.statement, r1: D1.events.filter(e => e.k === 'retract').map(e => e.lines.join(' | ')), r2: D2.events.filter(e => e.k === 'retract').map(e => e.lines.join(' | ')) }; }, ids);
    return { ok: /۸×۸/.test(x.st) && x.v !== 'verified' && x.r1.length === 1 && x.r2.length === 0, got: x }; });

  // A22-17 s07 (S2): «her own understanding-form data rows holding the SAME facts («۴ ساعت ⇒ ۹ سانت», «۸ ساعت ⇒ ۱۶ سانت») are neither changed nor asked»
  //   + A22-18 (S3): «the copy-ask line clips both sides to the same prefix … the differing numbers are invisible»
  await T('A22-17/A22-18 s07 ✏️ «۹⇒۸، ۱۶⇒۱۵»: form rows «۴ ساعت ⇒ ۹ سانت» asked; the ask line shows the changed numbers and the full new text', async () => { await ev(() => { __wipe(); __fresh(); });
    const pid = await ev(() => { const pid = __live('نورِ لوبیا', '۵ گلدان لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور؛ رشد چقدر به نور بند است؟'); APP.liveBindSession(pid, __cur());
      __set(pid, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'رشد و نور', u: 'رابطه', dl: [{ id: 'd1', t: '۴ ساعت ⇒ ۹ سانت' }, { id: 'd2', t: '۸ ساعت ⇒ ۱۶ سانت' }, { id: 'd3', t: '۵ گلدان لوبیا با ۲، ۴، ۶، ۸ و ۱۰ ساعت نور؛ قدِ گلدانِ ۴ ساعت ۹ سانتی‌متر' }], c: '', type: 'find', nat: 'objective', from: 'page' } }; }); return pid; });
    await turn('اندازه گرفتم: گلدانِ ۴ ساعت ۹ سانتی‌متر و گلدانِ ۸ ساعت ۱۶ سانتی‌متر قد کشید.', 'خب.');
    const e = await ev(async () => __edit(__U(1), 'اندازه گرفتم: گلدانِ ۴ ساعت ۸ سانتی‌متر و گلدانِ ۸ ساعت ۱۵ سانتی‌متر قد کشید.'));
    const q = await ev(() => __asks()), d1 = q.filter(a => a.path === 'dl:d1')[0], d2 = q.filter(a => a.path === 'dl:d2')[0], d3 = q.filter(a => a.path === 'dl:d3')[0];
    const line = await ev((q) => APP.liveAskPart(q), d3 || { old: '', new: '' });
    const blk = blockOf(e.user, /^# اصلاحِ پیامِ قبلی — نتیجهٔ صفحه/);
    return { ok: d1 && /۴ ساعت ⇒ ۸ سانت/.test(d1.new) && d2 && /۸ ساعت ⇒ ۱۵ سانت/.test(d2.new) && d3 && /«۹» ⇐ «۸»|۹ سانتی‌متر» ⇐ «۸ سانتی‌متر/.test(line) && /متنِ تازه: «/.test(blk), got: { q, line, blk: blk.slice(0, 700) } }; });

  // C22-5 s23 (S2): «the size she wrote with units in the form («۲۵ سانتی‌متر × ۳۵ سانتی‌متر») was not asked»؛ C22-10 (S3): «Title does not follow the correction in s23»
  await T('C22-5/C22-10 s23 «۲۵ در ۳۵ ⇒ ۲۵ در ۳۰»: lpPrMeasure with units asked; the title follows', async () => { await ev(() => { __wipe(); __fresh(); });
    await turn(S23, 'ثبتش می‌کنیم.');
    const pid = await ev((S23) => { const s = __cur(); const pid = __live('کیکِ مادرم در قالبِ ۲۵×۳۵', S23, { by: 'assistant', sess: s.id }); APP.liveBindSession(pid, s); APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so) => { so.u = { 1: { done: true, at: new Date().toISOString(), one: 'کیک برای قالبِ بزرگ‌تر', u: 'ضریبِ مواد', dl: [{ id: 'd1', t: 'قالبِ گردِ ۲۰ سانتی' }], c: '', type: 'find', nat: 'practical', from: 'page', prac: { measure: '۲۵ سانتی‌متر × ۳۵ سانتی‌متر' } } }; }); return pid; }, S23);
    await turn('یه اصلاح مهم: روز اول گفتم قالبم ۲۵ در ۳۵ه — اشتباه گفتم، دوباره متر کردم، ۲۵ در ۳۰ه.', 'فرستادم.', RT({ msg: 'قالب من مستطیل ۲۵ در ۳۵ه', key: 'datum:اندازهٔ قالب', what: 'fact', fix: '۲۵ در ۳۰' }));
    const x = await ev((pid) => ({ t: APP.S.get('eprob_' + pid).p.title, st: APP.S.get('eprob_' + pid).p.statement, q: __asks() }), pid), ms = x.q.filter(a => a.path === 'prac.measure')[0];
    return { ok: /۲۵ در ۳۰/.test(x.st) && /۲۵×۳۰/.test(x.t) && ms && /۲۵ سانتی‌متر × ۳۰ سانتی‌متر/.test(ms.new), got: x }; });

  // number words & units (D2 bp2 «پنجاه» = ۵۰; «یه کیلو» = «یک کیلو»; lone digits never): unit-level checks of the one matcher
  await T('same fact by meaning: value+unit, number words, never a lone digit', async () => {
    const x = await ev(() => ({
      a: APP.liveNumCopy('پنجاه متر مربع', { o: '۵۰', n: '۶۰' }, 'پشت‌بوم انبارم ۵۰ متر مربعه'),
      b: APP.liveNumCopy('بارش ۱۵ سانتی‌متر', { o: '۱۵۰', n: '۱۴۰' }, 'بارش حدود ۱۵۰ میلی‌متره'),
      c: APP.liveNumCopy('جدا کردن شرط به بر ۴ و بر ۹', { o: '۴', n: '۵' }, 'با ۶: رقم اول ۴ → ۴۴۵۷۶'),
      d: APP.liveNumCopy('۱ پیمانه شکر', { o: '۱ پیمونه', n: '۱.۵ پیمونه' }, '۱ پیمونه شکر'),
      e: APP.liveNumCopy('۲۰۰ لیتر آب', { o: '۲۰۰', n: '۱۸۰' }, 'بام ۲۰۰ مترمربع'),
      f: APP.liveFixVal('۱.۵ پیمونه شکر', { o: '۱', n: '۱.۵' }) }));
    return { ok: /^۶۰ متر مربع$/.test(x.a) && /۱۴ سانتی‌متر/.test(x.b) && x.c === null && /۱[.٫]۵ پیمانه شکر/.test(x.d) && x.e === null && x.f === null, got: x }; });

  /* ================= (۲) بانکِ مستقل VARIANTS_R22 — هر ورودیِ P3 ================= */
  const bank = BANKF && fs.existsSync(BANKF) ? JSON.parse(fs.readFileSync(BANKF, 'utf8')) : null;
  info.bank.file = BANKF || '(missing)';
  if (!bank) errors.push('bank: VARIANTS_R22 not found (tests/variants/VARIANTS_R22.json)');
  else {
    const P3 = bank.filter(e => /^P3\b|P3[.:]/.test(String(e.mech || e.rc || e.mechanism || '')));
    info.bank.n = bank.length; info.bank.p3 = P3.length;
    const BH = require('./tour1_r22_correction_bank.js');
    const out = await BH.run({ p, ev, turn, blockOf, head, bank, P3 });
    Object.assign(info.bank, out.summary); Object.assign(info.nc, out.nc);
    out.fail.forEach(f => errors.push('bank ' + f));
  }

  console.log(J({ runners: info.runners, bank: info.bank, nc: info.nc }, null, 1));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
