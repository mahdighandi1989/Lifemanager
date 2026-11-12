// تورِ پولیا (دستهٔ ۱، دورِ ۲۶، سهمِ «story» — ۲۰۲۶-۱۱-۱۲) — DECISIONS_R26: Q3 «یک مسئله، یک رکورد» (+ C21 برگشت با نام) و Q6 «مرحله و بستن از صفحه پیروی می‌کند».
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۶ (پرامپت‌ها: round26X/<sid>/ai/pN.json):
//           Q6  U11 = B25·D9 STILL — aB1 p3 (B_x)، aB3 p5 (B_x)، tB1 p6 (B)، pwB1 p8 (B_x)؛ A26-29 aA4 p5–p6؛ C26-2 (pC1…)؛ C26-25 aC2؛ U32/B26·D33 مقصد
//           Q3  U13 = B26x·D33 oB1 (B_x) p5–p28؛ U12 = B26·D30 و U15 = B26·D32 oB1 (B) p22–p31؛ C26-12 pwC2 p23–p25؛ A26-41 و A26-51 oA1 p7، p31؛ D26-6 pwD2 p6؛ C26-1 (پروندهٔ گفت‌وگو)
//  neither over-fix: هر اصلاحِ مثبت منفیِ هم‌شکلِ خودش را در همان بخش دارد (جوابِ کل هنوز «بازنگری» می‌شود؛ واژهٔ مشترکِ بی‌قاب مسئله را عوض نمی‌کند؛ دو نامزدِ هم‌تراز ⇒ پرسش؛
//           پیش‌بینیِ هم‌اطمینان هنوز داوری می‌شود؛ «۵ تا دارم، بسه؟» هنوز داده می‌دهد؛ دو مسئلهٔ واقعی هنوز «۲ از ۲»).
//  bank     هر ورودیِ story در بانکِ مستقلِ tests/variants/VARIANTS_R26.json (اگر هست) — بخشِ «bank»
//  clock    هیچ انتظاری به تاریخِ تقویم بسته نیست (موعدها از «امروز» ِ صفحه حساب می‌شوند).
// LLA_FILE = ساختِ دیگر (برای «قرمزِ نخست»: ساختِ BASE26)؛ ONLY=u11,aA4,oB1y,oB1x,pwC2,oA1,pwD2,count,neg,close,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BF = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R26.json')].find(f => f && fs.existsSync(f));
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
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__noNav = true;
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
    window.__dos = (pid) => { try { const d = APP.dossier(pid); return (d.events || []).map(e => ({ k: e.k || '', t: e.title || '', l: (e.lines || []).join(' ¦ '), out: e.out || '' })); } catch (e) { return [{ k: 'ERR', t: String(e), l: '', out: '' }]; } };
    window.__M = (id) => { const M = APP.ROUTE.model(id); if (!M) return null; return { origin: M.origin, dest: M.dest, now: M.nowFa, remain: M.remain, pts: M.pts.map(q => ({ k: q.k, t: q.title, lines: q.lines })) }; };
    window.__live = () => (APP.liveAll ? APP.liveAll() : []).map(r => ({ pid: r.p.id, title: r.p.title, ph: APP.livePhase(r.p.id), story: APP.liveStoryPhase(r.p.id), turn: APP.liveTurnPhase(r.p.id) }));
    window.__fc = () => APP.S.all('fcast').filter(x => x && !x.sample).map(x => ({ q: x.q, p: x.p, out: x.outcome || '', due: x.due || '' }));
  });
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const turn = (text, reply, actions) => p.evaluate(([t, r, a]) => __turn(t, r, a), [text, reply || '', actions || []]);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const nat = { role: 'self', nat: 'practical', stuck: false, fail: false };
  const csn = (o) => cs(Object.assign({}, nat, o));
  const coach = () => p.evaluate(() => { const s = __cur(), C = s.coach || {}; return { ph: C.ph, pk: C.pk, stmt: C.stmt, lprob: s.lprob || '' }; });
  const story = () => p.evaluate(() => JSON.parse(JSON.stringify((__cur().coach || {}).story || {})));
  const live = () => p.evaluate(() => __live());
  const dos = (pid) => p.evaluate((pid) => __dos(pid), pid);
  const Mo = (id) => p.evaluate((id) => __M(id), id);
  const fc = () => p.evaluate(() => __fc());
  const pidOf = async (re) => { const L = await live(); const x = L.filter(r => re.test(r.title))[0]; return x ? x.pid : ''; };
  const nowLine = (u) => { const L = head(u).split('\n'), i = L.findIndex(l => /^# وضعِ کنونی/.test(l)); return i < 0 ? '' : L[i + 1] || ''; };
  const coachHead = (u) => (head(u).split('\n').filter(l => /^# مربیِ حل/.test(l))[0] || '');
  const blockLine = (u) => (head(u).split('\n').filter(l => /^# مسئلهٔ زندهٔ این سشن/.test(l))[0] || '');
  const multi = (u) => { const L = head(u).split('\n'), i = L.findIndex(l => /^# (?:دو|چند) مسئله در این گفت‌وگو/.test(l)); if (i < 0) return ''; let o = [L[i]]; for (let k = i + 1; k < L.length && /^- /.test(L[k]); k++) o.push(L[k]); return o.join('\n'); };
  const LOOK = /بازنگری/;
  const J = (x) => JSON.stringify(x);
  const txtOf = (E) => E.map(e => e.t + ' ' + e.l + ' ' + e.out).join(' ‖ ');

  // ================= Q6 — U11 = B25·D9 STILL: نتیجهٔ میانی مسئله را به «بازنگری» نمی‌برد (چهار شکلِ دورِ ۲۶) =================
  await section('u11', async () => {
    // --- aB1 (B_x) p1–p4: «۱۰ تا! … خب اون ده تا... پیاده میان؟» پس از «چند تا اتوبوس لازمه» ---
    await wipe(); await fresh();
    await turn('سلام. من آوام. معلممون یه مسئله داده: «یه اتوبوس ۴۲ تا صندلی داره و ۱۷۸ تا بچه می‌خوان برن اردو. چند تا اتوبوس لازمه؟» من نوشتم ۴ ولی خانم معلم گفت غلطه. چرا؟', 'خوب.', [cs({ ph: 'u', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' })]);
    await turn('اینکه چند تا اتوبوس لازمه که همه‌ی بچه‌ها سوار شن. من ۱۷۸ رو تقسیم بر ۴۲ کردم، شد ۴ و یه چیزی باقی موند.', 'خوب.', [cs({ ph: 'u', said: ['u'], ans: ['u1'], stuck: false, fail: false, role: 'self', nat: 'objective' })]);
    await turn('۱۰ تا! ۴۲ ضربدر ۴ میشه ۱۶۸، ۱۷۸ منهای ۱۶۸ میشه ۱۰. خب اون ده تا... پیاده میان؟ 😄', 'خوب.', [cs({ ph: 'p', said: ['result'], ans: ['u2'], stuck: false, fail: false, role: 'self', nat: 'objective' })]);
    let C = await coach(); chk(C.ph !== 'b', 'U11 (B_x aB1 p3⇒p4 «# وضعِ کنونی … مرحله: بازنگری»): the remainder «۱۰ تا» is not the answer to «چند تا اتوبوس لازمه» :: ' + J(C));
    let t = await turn('هیچ جا! پس یه اتوبوس دیگه لازمه. ۵ تا اتوبوس! ولی اتوبوس پنجم خیلی خالیه، فقط ۱۰ تا بچه داره.', 'خوب.', [cs({ ph: 'b', said: ['result'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective', result: '۵ تا اتوبوس' })]);
    chk(!LOOK.test(nowLine(t.user)) && !LOOK.test(coachHead(t.user).split('·')[1] || ''), 'aB1 p4: the prompt of the next turn is not at «بازنگری» :: ' + J([nowLine(t.user), coachHead(t.user).slice(0, 120)]));
    C = await coach(); chk(C.ph === 'b', 'neither over-fix: «۵ تا اتوبوس!» answers the unknown by its own counted noun ⇒ look-back :: ' + J(C));
    // --- aB3 (B_x) p1–p5: برآوردِ یک داده («پس سالی حدود ۳۰ میلیون، یعنی ماهی دو سه میلیون») وسطِ فهم ---
    await wipe(); await fresh();
    await turn('سلام. من بازنشسته‌ام. ۳۰۰ میلیون تومن پس‌انداز دارم. حقوق بازنشستگی‌ام ماهی ۱۸ میلیونه ولی خرج ماهانه‌مون حدود ۲۱ میلیونه. می‌خوام بدونم این پس‌انداز تا کی دووم میاره، و اینکه بذارمش سپرده‌ی بانکی با سود ۲۳ درصد یا نه.', 'خوب.', [csn({ ph: 'u', said: ['d'], ans: [] })]);
    await turn('یعنی: با این پس‌انداز و این حقوق، کِی پولم تموم میشه و چیکار کنم که دیرتر تموم شه.', 'خوب.', [csn({ ph: 'u', said: ['u'], ans: ['u1'] })]);
    await turn('دفترچه‌م رو نگاه کردم: پارسال حدود ۴۰ میلیون خرج دندون و دکتر داشتیم، سال قبلش ۲۵ میلیون. پس سالی حدود ۳۰ میلیون، یعنی ماهی دو سه میلیون.', 'خوب.', [csn({ ph: 'u', said: ['d', 'result'], ans: ['u2'] })]);
    C = await coach(); chk(C.ph !== 'b', 'U11 (B_x aB3 p5⇒p6 «مرحله: بازنگری» before any plan): an estimate of a datum is not the whole answer :: ' + J(C));
    // --- tB1 (B) p5–p7: نتیجهٔ آزمونی که حدس را رد کرد (fail) + طرحِ تازه ---
    await wipe(); await fresh();
    await turn('سلام. یه ایده دارم و می‌خوام از ایده برسم به یه برنامه‌ی واقعی برای ساختنش: یه جعبه‌قرص هوشمند برای مادرم که با یه ترازوی کوچیک زیر هر خونه می‌فهمه قرص رو برداشته یا نه، و اگه سر ساعت برنداشت به گوشی من پیام میده. از کجا شروع کنم؟', 'خوب.', [csn({ ph: 'u', said: [], ans: [] })]);
    await turn('یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه و اگه برنداشت به من خبر بده — ارزون، و بدون اینکه مادرم کار اضافه‌ای بکنه.', 'خوب.', [csn({ ph: 'u', said: ['u', 'c'], ans: ['u1'] })]);
    await turn('ترازوهای ارزونی که دیدم دقتشون ۰.۱ گرمه. پس ۰.۳ گرم یعنی ۳ تا پله؛ فکر کنم کافیه.', 'خوب.', [csn({ ph: 'p', said: ['d'], ans: [], guess: { text: '۰.۳ گرم یعنی ۳ تا پله؛ فکر کنم کافیه', q: 'چطور می‌آزمایی‌اش؟' } })]);
    await turn('امتحان کردم: یه قرص رو ۲۰ بار گذاشتم و برداشتم. ۱۹ بار ۰.۲ یا ۰.۳ نشون داد، یه بار ۰.۰. اگه روزی دو تا قرص باشه، ماهی ۶۰ بار؛ با ۱ از ۲۰ یعنی ماهی ۳ تا هشدار اشتباه — از معیارم بیشتره! پس باید دو بار پشت سر هم بخونه.', 'خوب.',
      [cs({ ph: 'p', said: ['plan', 'result'], ans: [], stuck: false, fail: true, role: 'self', nat: 'practical', result: 'با ۱ از ۲۰ یعنی ماهی ۳ تا هشدار اشتباه', guess_res: { id: 'g1', res: 'refuted' }, plan: { text: 'باید دو بار پشت سر هم بخونه', when: 'next-session' } })]);
    C = await coach(); chk(C.ph !== 'b', 'U11 = B26·D26 (tB1 p6⇒p7 «مرحله: بازنگری · ۱ برنامهٔ باز»): the result of a test that refuted her guess is not the whole answer :: ' + J(C));
    t = await turn('اگه مستقل باشن، هر دو اشتباه یعنی ۱/۲۰ × ۱/۲۰ = ۱/۴۰۰؛ ماهی ۶۰ بار، یعنی ۰.۱۵ هشدار در ماه. زیر معیاره! برای (۲) هم یه ماژول وای‌فای ESP8266 دارم، با تلگرام‌بات پیام می‌فرستم؛ اینو قبلاً تو یه پروژه‌ی دیگه کار کردم. حالا جمع‌بندی کن ببینم کجام.', 'خوب.',
      [csn({ ph: 'e', said: ['result', 'plan'], ans: [], result: '۱/۲۰ × ۱/۲۰ = ۱/۴۰۰؛ ماهی ۶۰ بار، یعنی ۰.۱۵ هشدار در ماه' })]);
    chk(!LOOK.test(nowLine(t.user)), 'tB1 p7: «# وضعِ کنونی» does not say «بازنگری» :: ' + nowLine(t.user));
    C = await coach(); chk(C.ph !== 'b', 'U11 (tB1 p7⇒p8): a sub-result of one of three sub-problems, nothing built :: ' + J(C));
    const MS = await Mo(await p.evaluate(() => __cur().id)); chk(MS && !/حل به نتیجه رسید/.test(String(MS.remain)) && !LOOK.test(String(MS.now)), 'B_x tB1x p7 (🧭 «حل به نتیجه رسید»): the route of the chat problem is not at look-back :: ' + J(MS && [MS.now, MS.remain]));
    // --- pwB1 (B_x) p8: «زمان = 294300 ÷ 50 = 5886 ثانیه، حدودِ ۹۸ دقیقه» با دو راهِ هنوز باز ---
    await wipe(); await fresh();
    await turn('برای باغِ پدرم می‌خوام یه پمپ خورشیدی بذارم که آبِ چاه رو ببره تو منبعِ روی بام؛ ۲ مترمکعب آب، ۱۵ متر ارتفاع. چه پنلی لازم دارم؟', 'خوب.', [csn({ ph: 'u', said: ['u', 'd'], ans: [] })]);
    await turn('آخ… پمپ موقعِ کار ۴۹۰ وات می‌کشه ولی پنلِ ۵۰ واتی ظهر نهایتاً ۵۰ وات میده؛ بدون باتری اصلاً روشن نمیشه. دو راه: یا پنلِ حدودِ ۶۰۰ وات برای همون پمپ، یا پمپِ کوچیک‌تر که آهسته‌تر پر کنه. اگه پمپِ ۱۰۰ واتی با بازده ۵۰٪ باشه، ۵۰ وات هیدرولیکی میده؛ زمان = 294300 ÷ 50 = 5886 ثانیه، حدودِ ۹۸ دقیقه. ظهر ۴ ساعت آفتاب دارم، پس جا میشه.', 'خوب.',
      [csn({ ph: 'e', said: ['result', 'd'], ans: [], result: 'زمان = 294300 ÷ 50 = 5886 ثانیه، حدودِ ۹۸ دقیقه' })]);
    C = await coach(); chk(C.ph !== 'b', 'U11 (B_x pwB1 p8⇒p9 «مرحله: بازنگری» with two options still open): a computed time under one option is not the answer to «چه پنلی لازم دارم؟» :: ' + J(C));
    // --- neither over-fix: جوابِ کل با «جوابش … شد» هنوز «بازنگری» ---
    await wipe(); await fresh();
    await turn('یه استخر ۶ در ۴ متر و عمق ۱.۵ متر دارم. می‌خوام بدونم چند مترمکعب آب می‌گیره.', 'خوب.', [csn({ ph: 'u', said: ['u', 'd'], ans: [] })]);
    await turn('۶ ضربدر ۴ ضربدر ۱.۵ میشه ۳۶. پس جوابش شد ۳۶ مترمکعب.', 'خوب.', [csn({ ph: 'b', said: ['result'], ans: [], result: 'جوابش شد ۳۶ مترمکعب' })]);
    C = await coach(); chk(C.ph === 'b', 'neither over-fix: «پس جوابش شد ۳۶ مترمکعب» is the whole answer ⇒ look-back :: ' + J(C));
  });

  // ================= Q6 — A26-29 (aA4 p5–p6): کارتِ «در گفت‌وگو به نتیجه رسیدی» جوابِ ایستادهٔ او را نشان می‌دهد، نه جوابِ نخستِ ردشده =================
  await section('aA4', async () => {
    await wipe(); const sid = await fresh();
    const ST1 = 'پنجره ۱۸۰ سانت عرض و ۱۵۰ سانت ارتفاع دارد. پرده باید دو برابرِ عرضِ پنجره چین بخورد، از ۱۰ سانت بالای پنجره شروع شود و ۲۰ سانت پایین‌تر از پنجره تمام شود، و برای سجافِ بالا و پایین روی هم ۱۵ سانت اضافه می‌خواهد. توپِ پارچه ۱۴۰ سانت عرض دارد. چند متر پارچه بخرم؟';
    await turn('برای اتاقِ نوه‌ام پرده می‌دوزم. ' + ST1, 'خوب.', [csn({ ph: 'u', said: ['d', 'c'], ans: [] })]);
    await turn('کلش این است: می‌خواهم بدانم برای یک پردهٔ چین‌دار که کلِ پنجره را بپوشاند چند متر پارچه بخرم که نه کم بیاید نه بی‌خود زیاد بخرم. این مسئله را در صفحهٔ مسئله‌هایم هم ثبت کنید.', 'ثبت شد.',
      [{ do: 'live_new', title: 'پارچهٔ پردهٔ اتاقِ نوه', statement: ST1, nat: 'practical' }, csn({ ph: 'u', said: ['u'], ans: ['u0', 'u1'] })]);
    const pid = await pidOf(/پرده/); chk(!!pid, 'aA4: live problem created');
    await turn('حساب: عرضِ لازم با چین ۱۸۰ ضربدر ۲ می‌شود ۳۶۰ سانت. ۳۶۰ تقسیم بر ۱۴۰ می‌شود ۲ و خرده‌ای، یعنی ۲٫۵۷ قواره. طولِ هر قواره ۱۵۰ + ۱۰ + ۲۰ + ۱۵ = ۱۹۵ سانت. پس ۲٫۵۷ ضربدر ۱٫۹۵ می‌شود حدودِ ۵ متر. ۵ متر می‌خرم.', 'خوب.',
      [csn({ ph: 'e', said: ['plan', 'result'], result: 'پس ۲٫۵۷ ضربدر ۱٫۹۵ می‌شود حدودِ ۵ متر. ۵ متر می‌خرم', ans: ['p1'], plan: { text: 'اول طولِ هر تکه را درمی‌آوردم و بعد تعدادِ قواره را', steps: ['عرضِ لازم با چین ۱۸۰ ضربدر ۲ می‌شود ۳۶۰ سانت', '۳۶۰ تقسیم بر ۱۴۰ می‌شود ۲ و خرده‌ای، یعنی ۲٫۵۷ قواره', 'طولِ هر قواره ۱۵۰ + ۱۰ + ۲۰ + ۱۵ = ۱۹۵ سانت', '۲٫۵۷ ضربدر ۱٫۹۵ می‌شود حدودِ ۵ متر'] } })]);
    const t = await turn('نه، بس نیست! قواره را که نمی‌شود تکه‌تکه دوخت؛ هر قواره یک عرضِ کاملِ پارچه است. پس باید به بالا گرد کنم: ۳ قواره. ۳ ضربدر ۱۹۵ می‌شود ۵۸۵ سانت، یعنی ۵ متر و ۸۵ سانت. با ۵ متر کم می‌آوردم! ۶ متر می‌خرم که جای برش هم داشته باشد.', 'خوب.',
      [csn({ ph: 'e', said: ['result'], result: '۳ ضربدر ۱۹۵ می‌شود ۵۸۵ سانت، یعنی ۵ متر و ۸۵ سانت. با ۵ متر کم می‌آوردم! ۶ متر می‌خرم', ans: [], step: { step: 2, done: 'yes', what: 'قواره کسری ندارد؛ به بالا گرد شد: ۳ قواره', msg: 'قواره را که نمی‌شود تکه‌تکه دوخت؛ هر قواره یک عرضِ کاملِ پارچه است. پس باید به بالا گرد کنم: ۳ قواره' } })]);
    const rdy = await p.evaluate((pid) => APP.STORY.chatSolvedReady(pid), pid);
    chk(rdy && /۶ متر می‌خرم/.test(rdy.t) && !/^پس ۲٫۵۷/.test(rdy.t), 'A26-29 (aA4 p6–p10 «# بستنِ مسئله‌ای که در گفت‌وگو حل شد … («… ۵ متر می‌خرم»)» تا پایان): the closure card quotes her standing answer «… ۶ متر می‌خرم», not the first one she rejected :: ' + J(rdy));
    const t2 = await turn('بله: ۳ قواره هر کدام ۱۴۰ سانت عرض دارد، روی هم ۴۲۰ سانت می‌شود که از ۳۶۰ بیشتر است؛ با ۲ قواره فقط ۲۸۰ سانت می‌شد که کم است. پس ۳ قواره درست است.', 'خوب.', [csn({ ph: 'b', said: ['check'], ans: [] })]);
    const cl = (head(t2.user).split('\n').filter(l => /حلِ این مسئله در گفت‌وگو به نتیجه رسیده/.test(l))[0] || '');
    chk(!/۵ متر می‌خرم»\)/.test(cl) || /۶ متر می‌خرم/.test(cl), 'aA4 p7: the prompt block of the closure names «۶ متر می‌خرم» :: ' + cl.slice(0, 260));
  });

  // ================= Q3 — U13 = B26x·D33 (oB1، B_x): طرح و سرانجامِ مسئلهٔ اول در 📜 ِ مسئله‌های دوم و سوم نمی‌آید؛ برگشت با نام همان نوبت را می‌بندد =================
  await section('oB1y', async () => {
    await wipe(); const sid = await fresh();
    await turn('سلام. می‌خوام روش پولیا رو روی زندگی خودم امتحان کنم، با یه مسئله‌ی واقعی: سه ماهه هر صبح قرار می‌ذارم ساعت ۶ بیدار شم و یه ساعت مطالعه کنم، ولی هفته‌ای فقط دو روز موفق می‌شم. چطور برسم به پنج روز؟', 'خوب.', [cs({ ph: 'u', said: ['u'], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    await turn('آزمونش: از امشب یک هفته گوشی ساعت ۱۰:۳۰ میره آشپزخونه و ۱۱ می‌خوابم. پیش‌بینیم: ۵ روز از ۷ موفق؛ ۶۰ درصد مطمئنم.', 'خوب.',
      [cs({ ph: 'p', said: ['plan'], ans: [], stuck: false, fail: false, role: 'self', nat: 'life', plan: { text: 'از امشب یک هفته گوشی ساعت ۱۰:۳۰ میره آشپزخونه و ۱۱ می‌خوابم', on_guess: false } })]);
    await turn('سلام، یه هفته گذشت. ساعت بیداری این هفت روز: ۶:۰۵، ۶:۱۰، ۷:۳۰، ۶:۰۰، ۶:۲۰، ۸:۰۰، ۶:۱۵. یعنی ۵ روز از ۷ قبل از ۶:۳۰ و مطالعه کردم. پیش‌بینیم ۵ بود، درست درومد!', 'خوب.',
      [cs({ ph: 'b', said: ['result'], ans: [], stuck: false, fail: false, role: 'self', nat: 'life', result: '۵ روز از ۷ قبل از ۶:۳۰ و مطالعه کردم', plan_done: { id: 'pl1', done: true } })]);
    await turn('درسم: وقتی فکر می‌کنم مشکل «اراده»ست، اول روزای موفق و ناموفق رو کنار هم بذارم و ببینم چه فرقی داشتن. این مسئله رو ببند.', 'بسته شد.',
      [{ do: 'chat_solved', title: 'بیداریِ صبح و مطالعه', statement: 'هر صبح ساعت ۶ بیدار شم و یه ساعت مطالعه کنم؛ هفته‌ای فقط دو روز موفق می‌شم. چطور برسم به پنج روز؟', kind: 'find', lesson: 'وقتی فکر می‌کنم مشکل «اراده»ست، اول روزای موفق و ناموفق رو کنار هم بذارم', check: '۵ روز از ۷ قبل از ۶:۳۰ و مطالعه کردم' }, cs({ ph: 'b', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    const p1 = await pidOf(/بیداری/); chk(!!p1, 'oB1y: the wake-up problem was registered (closed) from the chat');
    await turn('راستی یه مسئله‌ی دیگه هم دارم که به همین بیداری ربط داره ولی جداست: شب‌ها شام رو ساعت ۱۰ می‌خوریم و بعدش خوابم نمی‌بره. می‌خوام اینم حل کنم.', 'خوب.', [cs({ ph: 'u', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    await turn('یه مسئله‌ی سوم هم دارم، جدا از این دو تا: می‌خوام هفته‌ای دو بار صبح ورزش کنم ولی همیشه می‌گم «فردا». اینم یه مسئله‌ی جدا ثبت کن.', 'ثبت شد.',
      [{ do: 'live_new', title: 'شام دیر و بی‌خوابی', statement: 'شب‌ها شام رو ساعت ۱۰ می‌خوریم و بعدش خوابم نمی‌بره. می‌خوام اینم حل کنم.', nat: 'life' }, { do: 'live_new', title: 'ورزشِ صبح هفته‌ای دو بار', statement: 'می‌خوام هفته‌ای دو بار صبح ورزش کنم ولی همیشه می‌گم «فردا».', nat: 'life' }, cs({ ph: 'u', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    const p2 = await pidOf(/شام/), p3 = await pidOf(/ورزش/); chk(p2 && p3, 'oB1y: dinner and exercise are live problems :: ' + J([p2, p3]));
    let D2 = await dos(p2), D3 = await dos(p3), D1 = await dos(p1);
    chk(!/آشپزخونه/.test(txtOf(D2)) && !/آشپزخونه/.test(txtOf(D3)), 'U13 = B26x·D33 (oB1 📜 ِ شام و ورزش: «برنامهٔ خودت (از گفت‌وگو) — از امشب یک هفته گوشی ساعت ۱۰:۳۰ میره آشپزخونه …» و «سرانجام: انجام شد»): the wake-up plan and its outcome are in neither other dossier :: ' + J([D2.map(e => e.t), D3.map(e => e.t)]));
    chk(/آشپزخونه/.test(txtOf(D1)) && D1.some(e => /برنامهٔ خودت/.test(e.t)), 'neither over-fix: the plan is still in the wake-up problem\'s own dossier :: ' + J(D1.map(e => e.t)));
    const M2 = await Mo(p2), M3 = await Mo(p3);
    chk(!M2.pts.some(q => /آشپزخونه/.test(J(q))) && !M3.pts.some(q => /آشپزخونه/.test(J(q))), 'U13: no point of the wake-up plan on the 🧭 of the other two :: ' + J([M2.pts.map(q => q.t), M3.pts.map(q => q.t)]));
    // return by naming (B_x p23): bound to the exercise problem (the last one created)
    let C = await coach(); chk(C.lprob === p3, 'setup: after the two live_new the session is bound to the last one (exercise) :: ' + J(C));
    let t = await turn('برگردیم سرِ همون مسئله‌ی شام و خواب: اگه شام رو ساعت ۸ بخورم، فکر کنم زودتر خوابم می‌بره.', 'خوب.',
      [cs({ ph: 'p', said: ['guess'], ans: [], guess: { text: 'اگه شام رو ساعت ۸ بخورم، فکر کنم زودتر خوابم می‌بره', q: 'چطور می‌آزمایی‌اش؟' }, stuck: false, fail: false, role: 'self', nat: 'life' })]);
    chk(/شام دیر و بی‌خوابی/.test(blockLine(t.user)) && !/ورزش/.test(blockLine(t.user)), 'U12 / C21 (B_x oB1 p23 «برگردیم سرِ همون مسئله‌ی شام و خواب» — the page kept the exercise problem bound): the same turn is bound to the dinner problem :: ' + blockLine(t.user).slice(0, 160));
    chk(/کانونِ همین نوبت/.test(multi(t.user)) && /با نام به «شام دیر و بی‌خوابی»/.test(multi(t.user)), 'the prompt tells the model which problem this turn is about :: ' + multi(t.user).slice(0, 500));
    D2 = await dos(p2); D3 = await dos(p3);
    chk(/ساعت ۸ بخورم/.test(txtOf(D2)) && !/ساعت ۸ بخورم/.test(txtOf(D3)), 'B26x·D33 («حدس — از گفت‌وگو: اگه شام رو ساعت ۸ بخورم …» in the EXERCISE 📜): the dinner guess is filed under dinner only :: ' + J([D2.map(e => e.t + ':' + e.l.slice(0, 30)), D3.map(e => e.t + ':' + e.l.slice(0, 30))]));
    // B_x p25: head-clause naming of the closed problem; p28 the result follows it
    t = await turn('یه پیش‌بینیِ تازه برای بیداری: این هفته ۶ روز از ۷ قبل از ۶:۳۰ بیدار میشم، ۹۰ درصد مطمئنم.', 'خوب.', [cs({ ph: 'b', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    C = await coach(); chk(C.lprob === p1, 'C21 (B_x oB1 p25 «یه پیش‌بینیِ تازه برای بیداری: …»): the turn is bound to the (closed) wake-up problem she named :: ' + J(C));
    chk(!/شام دیر/.test(blockLine(t.user)) && /بیداری/.test(nowLine(t.user) + multi(t.user)), 'p25: the prompt is about the wake-up problem, not the dinner one :: ' + J([nowLine(t.user), blockLine(t.user).slice(0, 80)]));
    await turn('یه هفته گذشت: فقط ۴ روز از ۷ شد. پیش‌بینیم غلط بود. کارنامه‌ی ذهنم کجا نشون میده که بیش از حد مطمئن بودم؟', 'خوب.',
      [cs({ ph: 'b', said: ['result'], result: 'فقط ۴ روز از ۷ شد. پیش‌بینیم غلط بود', ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    D2 = await dos(p2); D3 = await dos(p3); const M2b = await Mo(p2), M3b = await Mo(p3);
    chk(!/۴ روز از ۷/.test(txtOf(D2) + txtOf(D3)) && !/۴ روز از ۷/.test(J(M2b.pts) + J(M3b.pts)), 'B26x·D33 («نتیجه (از گفت‌وگو): فقط ۴ روز از ۷ شد. پیش‌بینیم غلط بود» on the dinner 🧭): the wake-up result is on neither other problem :: ' + J([M2b.pts.map(q => q.t), M3b.pts.map(q => q.t)]));
    C = await coach(); chk(C.lprob === p1 && !/۴ روز از ۷/.test(String(C.stmt || '')), 'a result reported about the closed problem she named does not become the statement of a new chat problem :: ' + J(C));
  });

  // ================= Q3 — U12 = B26·D30 و U15 = B26·D32 (oB1، B): «برگردیم به مسئله‌ی بیداری ساعت ۶» + نتیجهٔ پیش‌بینیِ ۶۰٪ روی پیش‌بینیِ ۹۰٪ نمی‌نشیند =================
  await section('oB1x', async () => {
    await wipe(); const sid = await fresh();
    await turn('سلام. یه مسئله‌ی واقعی دارم: سه ماهه هر صبح قرار می‌ذارم ساعت ۶ بیدار شم و یه ساعت مطالعه کنم، ولی هفته‌ای فقط دو روز موفق می‌شم. چطور برسم به پنج روز؟', 'خوب.', [cs({ ph: 'u', said: ['u'], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    await turn('آزمونش: از امشب یک هفته گوشی ساعت ۱۰:۳۰ میره آشپزخونه و ۱۱ می‌خوابم. پیش‌بینیم: ۵ روز از ۷ موفق؛ ۶۰ درصد مطمئنم. اینو می‌خوام مثل یه تمرین ثبت کنی که تا واقعاً جا نیفتاده رها نشه.', 'خوب.',
      [{ do: 'start_practice', tid: 24, topic: 'آزمونِ خواب و گوشی برای بیداریِ ساعت ۶', consent: { quote: 'اینو می‌خوام مثل یه تمرین ثبت کنی که تا واقعاً جا نیفتاده رها نشه', kind: 'request' } },
        cs({ ph: 'p', said: ['plan'], ans: ['p1'], stuck: false, fail: false, role: 'self', nat: 'life', plan: { text: 'از امشب یک هفته گوشی ساعت ۱۰:۳۰ میره آشپزخونه و ۱۱ می‌خوابم', on_guess: false } })]);
    await turn('سلام، یه هفته گذشت. ساعت بیداری این هفت روز: ۶:۰۵، ۶:۱۰، ۷:۳۰، ۶:۰۰، ۶:۲۰، ۸:۰۰، ۶:۱۵. یعنی ۵ روز از ۷ قبل از ۶:۳۰ و مطالعه کردم. پیش‌بینیم ۵ بود، درست درومد!', 'خوب.',
      [{ do: 'practice_log', tid: 24, what: 'یک هفته آزمون: ۵ روز از ۷ موفق', pct: 60, ok: true, quote: 'یعنی ۵ روز از ۷ قبل از ۶:۳۰ و مطالعه کردم. پیش‌بینیم ۵ بود، درست درومد!' },
        cs({ ph: 'b', said: ['result'], ans: [], stuck: false, fail: false, role: 'self', nat: 'life', result: '۵ روز از ۷ قبل از ۶:۳۰ و مطالعه کردم' })]);
    let F = await fc(); const f60 = F.filter(x => x.p === 60)[0]; info.fc0 = F;
    chk(f60 && f60.out === 'شد', 'setup: the 60 % wake-up forecast exists and is judged «شد» :: ' + J(F));
    await turn('درسم: اول روزای موفق و ناموفق رو کنار هم بذارم. این مسئله رو ببند.', 'بسته شد.',
      [{ do: 'chat_solved', title: 'بیداریِ ساعت ۶ و یک ساعت مطالعه', statement: 'هر صبح ساعت ۶ بیدار شم و یه ساعت مطالعه کنم؛ هفته‌ای فقط دو روز موفق می‌شم. چطور برسم به پنج روز؟', kind: 'find', lesson: 'اول روزای موفق و ناموفق رو کنار هم بذارم', check: '۵ روز از ۷ قبل از ۶:۳۰ و مطالعه کردم' }, cs({ ph: 'b', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    const p1 = await pidOf(/بیداری/);
    await turn('راستی یه مسئله‌ی دیگه هم دارم که به همین بیداری ربط داره ولی جداست: شب‌ها شام رو ساعت ۱۰ می‌خوریم و بعدش خوابم نمی‌بره. می‌خوام اینم حل کنم. ثبتش کن که جدا باشه.', 'ثبت شد.',
      [{ do: 'live_new', title: 'شامِ ساعت ۱۰ و بی‌خوابی', statement: 'شب‌ها شام رو ساعت ۱۰ می‌خوریم و بعدش خوابم نمی‌بره. می‌خوام اینم حل کنم.', nat: 'life' }, cs({ ph: 'u', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    const p2 = await pidOf(/شام/); chk(p1 && p2, 'oB1x: two live problems :: ' + J([p1, p2]));
    await turn('آزمونم هم اینه: از امشب تا چهار شبِ دیگه شام رو همون ساعت ۱۰ می‌خورم ولی سبک (سوپ). پیش‌بینیم: هر ۴ شب تا ۱۱:۳۰ خوابم می‌بره؛ ۹۰ درصد مطمئنم.', 'خوب.',
      [cs({ ph: 'p', said: ['plan'], ans: [], stuck: false, fail: false, role: 'self', nat: 'life', plan: { text: 'از امشب تا چهار شبِ دیگه شام رو همون ساعت ۱۰ می‌خورم ولی سبک (سوپ)', on_guess: true } })]);
    F = await fc(); const f90 = F.filter(x => x.p === 90)[0]; chk(f90 && !f90.out, 'setup: the 90 % dinner forecast is open :: ' + J(F));
    // p28: a third problem only mentioned, then p29 the return by naming the CLOSED first problem
    await turn('اگه یه شب خوابم نبرد یعنی فقط سنگینی نیست و ساعتش هم مهمه. یه مسئله‌ی سوم هم دارم که کلاً جداست: یه پیشنهاد کاری از یه شرکت تو شیراز دارم و نمی‌دونم قبول کنم یا نه.', 'خوب.', [cs({ ph: 'p', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    let C = await coach(); chk(/^c:/.test(String(C.pk)) && /پیشنهاد کاری/.test(String(C.stmt)) && !C.lprob, 'C26-12 / owner bank #16 (oB1 p28 «یه مسئله‌ی سوم هم دارم که کلاً جداست: …»): the third problem is its own chat problem, not data of the dinner problem :: ' + J(C));
    const its2 = ((await story())['L:' + p2] || { items: [] }).items; chk(!its2.some(x => /شیراز/.test(x.t)), 'no story item of the dinner problem holds the job offer :: ' + J(its2.map(x => x.k + ':' + x.t.slice(0, 30))));
    const P29 = 'اون رو فعلاً ثبت نکن، بعداً میام سراغش. برگردیم به مسئله‌ی بیداری ساعت ۶: یه چیزی یادم اومد. یکی از اون ۵ روز موفق رو اشتباه شمردم؛ روزی که ۶:۲۰ بیدار شدم مطالعه نکردم. پس ۴ روز از ۷ بوده، نه ۵.';
    let t = await turn(P29, 'خوب.', [cs({ ph: 'b', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    chk(!/شامِ ساعت ۱۰/.test(blockLine(t.user)) && !/شامِ ساعت ۱۰/.test(nowLine(t.user)), 'U12 = B26·D30 (oB1 p29 «برگردیم به مسئله‌ی بیداری ساعت ۶: …» — «# وضعِ کنونی» and the live block stay on «شامِ ساعت ۱۰ و بی‌خوابی»): the turn is not bound to the dinner problem :: ' + J([nowLine(t.user), blockLine(t.user).slice(0, 90)]));
    chk(/بیداری/.test(nowLine(t.user)) && /با نام به «بیداریِ ساعت ۶/.test(multi(t.user)), 'D30: the prompt carries the named problem (status line + «با نام به … برگشت») :: ' + J([nowLine(t.user), multi(t.user).slice(-420)]));
    C = await coach(); chk(C.lprob === p1, 'the session is bound to the wake-up problem she named, although it is closed :: ' + J(C));
    const its2b = ((await story())['L:' + p2] || { items: [] }).items; chk(!its2b.some(x => /۴ روز از ۷/.test(x.t)), 'nothing of the wake-up correction is filed under the dinner problem :: ' + J(its2b.map(x => x.k + ':' + x.t.slice(0, 30))));
    // p31: the outcome of the 60 % forecast, said while the 90 % one is open and not due
    const P31 = 'پس پیش‌بینیم غلط درومده: گفته بودم ۵ روز با ۶۰ درصد اطمینان، شد ۴. کارنامه‌ی ذهنم کجا نشون میده که زیادی مطمئن بودم؟';
    await turn(P31, 'خوب.', [{ do: 'practice_log', tid: 24, what: 'بازشماری: ۴ روز از ۷ موفق؛ پیش‌بینیِ ۵ روز با ۶۰٪ درست درنیامد', pct: 60, ok: false, quote: 'گفته بودم ۵ روز با ۶۰ درصد اطمینان، شد ۴' }, cs({ ph: 'b', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    info.p31 = await p.evaluate(() => (__cur().msgs || []).slice(-3).map(m => m.role + ': ' + String(m.text || '').slice(0, 260)));
    F = await fc(); info.fc1 = F; const g90 = F.filter(x => x.p === 90)[0], g60 = F.filter(x => x.p === 60);
    chk(g90 && !g90.out, 'U15 = B26·D32 (oB1 s28 «🎯 «پیش‌بینیم: هر ۴ شب تا ۱۱:۳۰ خوابم می‌بره؛ ۹۰ درصد…» (۹۰٪) ⇐ نشد» four days before its date): the 90 % dinner forecast stays open :: ' + J(F));
    const w60 = F.filter(x => x.p === 60 && /۵ روز از ۷ موفق/.test(x.q))[0];
    chk(w60 && w60.out === 'نشد', 'D32: the outcome lands on the forecast she named by its own confidence (60 %) — the same record, now «نشد» :: ' + J(F));
    info.nc.third = g60.length > 1 ? 'B26·D32 second half (her verdict sentence booked as a new 🎯) is Q8 «today»: ' + g60.length + ' records with 60 %' : '';
    // neither over-fix: an outcome that states the open forecast's own confidence still judges it
    await turn('برگردیم به مسئله‌ی شام: چهار شب گذشت؛ اون پیش‌بینیِ ۹۰ درصدیم درست درومد، هر ۴ شب تا ۱۱:۳۰ خوابم برد.', 'خوب.',
      [{ do: 'practice_log', tid: 24, what: 'هر ۴ شب تا ۱۱:۳۰ خوابش برد', pct: 90, ok: true, quote: 'اون پیش‌بینیِ ۹۰ درصدیم درست درومد، هر ۴ شب تا ۱۱:۳۰ خوابم برد' }, cs({ ph: 'b', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    F = await fc(); chk((F.filter(x => x.p === 90)[0] || {}).out === 'شد', 'neither over-fix: the report that names 90 % judges the 90 % forecast :: ' + J(F));
    C = await coach(); chk(C.lprob === p2, 'and «برگردیم به مسئله‌ی شام» bound the turn back to the open dinner problem :: ' + J(C));
  });

  // ================= Q3 — C26-12 (pwC2 p23–p25): مسئلهٔ دوم و سوم هر کدام رکوردِ خودشان؛ «برگردیم به مسئلهٔ تاس» به مسئلهٔ گفت‌وگوییِ دوم برمی‌گردد =================
  await section('pwC2', async () => {
    await wipe(); const sid = await fresh();
    const pid = await p.evaluate(() => { const r = APP.liveCreate('احتمالِ بیماری پس از آزمایشِ مثبت', 'یه بیماری تو ۱٪ مردم هست. آزمایشش ۹۵٪ بیمارها رو درست مثبت نشون میده و ۵٪ سالم‌ها رو هم به اشتباه مثبت. اگه آزمایشِ کسی مثبت بشه، احتمالِ این‌که واقعاً بیمار باشه چقدره؟', 'find', { by: 'user' }); APP.liveBindSession(r.p.id, __cur()); return r.p.id; });
    await turn('از هر ۱۰۰۰ نفر ۱۰ نفر بیمارن.', 'خوب.', [cs({ ph: 'u', said: ['d'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' })]);
    const M0 = await Mo(pid);
    let t = await turn('یه مسئلهٔ دیگه هم از همون دوره دارم: دو تا تاس می‌ندازیم، احتمالِ این‌که جمعشون ۷ بشه چقدره؟', 'خوب.', [cs({ ph: 'u', said: ['u'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' })]);
    let C = await coach(); const pkDice = C.pk;
    chk(/^c:/.test(String(C.pk)) && /تاس/.test(String(C.stmt)) && !C.lprob, 'C26-12 (pwC2 p23 «یه مسئلهٔ دیگه هم از همون دوره دارم: دو تا تاس …» — no own record; became the 🧭 destination of the disease problem): the dice problem is its own chat problem :: ' + J(C));
    let M1 = await Mo(pid); chk(!/تاس/.test(String(M1.dest)) && !M1.pts.some(q => /تاس/.test(J(q))), 'C26-12 («مقصدِ» 🧭 ِ مسئلهٔ بیماری شد «یه مسئلهٔ دیگه هم … دو تا تاس…»): the disease route keeps its own destination and points :: ' + J([M1.dest, M1.pts.map(q => q.t)]));
    t = await turn('و یه سومی: از یه کیسه با ۳ مهرهٔ قرمز و ۲ آبی دو تا مهره بی‌جایگذاری برمی‌داریم؛ احتمالِ این‌که هر دو قرمز باشن؟', 'خوب.', [cs({ ph: 'u', said: ['u', 'd'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' })]);
    C = await coach(); const pkBag = C.pk;
    chk(/^c:/.test(String(C.pk)) && C.pk !== pkDice && /کیسه/.test(String(C.stmt)), 'C26-12 (pwC2 p24 «و یه سومی: …»): the third problem has its own record, distinct from the second :: ' + J([C, pkDice]));
    chk(/# چند مسئله در این گفت‌وگو/.test(multi(t.user)) && /تاس/.test(multi(t.user)) && /کیسه/.test(multi(t.user)) && /بیماری/.test(multi(t.user)), 'the prompt lists the three problems of this conversation :: ' + multi(t.user).slice(0, 700));
    t = await turn('برگردیم به مسئلهٔ تاس: حالت‌ها رو شمردم، ۶ حالت از ۳۶ تا، یعنی ۶/۳۶ = ۱/۶.', 'خوب.', [cs({ ph: 'e', said: ['result'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective', result: '۶ حالت از ۳۶ تا، یعنی ۶/۳۶ = ۱/۶' })]);
    C = await coach(); chk(C.pk === pkDice && /تاس/.test(String(C.stmt)) && !C.lprob, 'C26-12 / C21 (pwC2 p25 «برگردیم به مسئلهٔ تاس: …» went under the disease problem): the turn is the dice problem\'s again :: ' + J(C));
    const St = await story(); const dice = (St[pkDice] || { items: [] }).items, bag = (St[pkBag] || { items: [] }).items, dis = (St['L:' + pid] || { items: [] }).items;
    chk(dice.some(x => x.k === 'res' && /۱\/۶/.test(x.t)) && !bag.some(x => /۱\/۶/.test(x.t)) && !dis.some(x => /۱\/۶|تاس|کیسه/.test(x.t)), 'the dice result is in the dice problem\'s story only :: ' + J({ dice: dice.map(x => x.k), bag: bag.map(x => x.k + ':' + x.t.slice(0, 20)), dis: dis.map(x => x.k + ':' + x.t.slice(0, 20)) }));
    M1 = await Mo(pid); chk(!M1.pts.some(q => /۱\/۶|تاس|کیسه/.test(J(q))), 'nothing of the second or third problem on the disease 🧭 :: ' + J(M1.pts.map(q => q.t)));
    // return to the live one by naming
    t = await turn('برگردیم به مسئلهٔ بیماری: از اون ۱۰ نفر بیمار، ۹٫۵ نفر مثبت میشن.', 'خوب.', [cs({ ph: 'e', said: ['d'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' })]);
    C = await coach(); chk(C.lprob === pid && /احتمالِ بیماری/.test(blockLine(t.user)), 'and naming the registered problem binds the turn back to it :: ' + J([C, blockLine(t.user).slice(0, 80)]));
  });

  // ================= Q3 — A26-41 (oA1 p7) جملهٔ پرسشی «داده» نمی‌شود؛ A26-51 (oA1 p31) برگشت به مسئلهٔ گفت‌وگوییِ پیشین با نام =================
  await section('oA1', async () => {
    await wipe(); const sid = await fresh();
    await turn('سلام. یه مسئله‌ست که از دیشب ذهنمو درگیر کرده: تو یه مهمونیِ ۱۰ نفره هر کس با هر کس دقیقاً یه بار دست داده. چند تا دست‌دادن شده؟', 'خوب.', [cs({ ph: 'u', said: ['u', 'd'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' })]);
    await turn('برای ۱۰ نفر: ۱۰ × ۹ ÷ ۲ = ۴۵. جوابش شد ۴۵.', 'خوب.', [cs({ ph: 'b', said: ['result'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective', result: 'برای ۱۰ نفر: ۱۰ × ۹ ÷ ۲ = ۴۵' })]);
    const pk0 = (await coach()).pk;
    await turn('یه مسئلهٔ دیگه هم دارم: یه پیشنهادِ کار از یه شرکتِ دیگه دارم، حقوقش ۳۰٪ بیشتره ولی باید از تیمی که خودم ساختم جدا شم. بمونم یا برم؟ ثبتش کن.', 'ثبت شد.',
      [{ do: 'live_new', title: 'بمانم یا بروم: پیشنهادِ کار با حقوقِ ۳۰٪ بیشتر', statement: 'یه پیشنهادِ کار از یه شرکتِ دیگه دارم، حقوقش ۳۰٪ بیشتره ولی باید از تیمی که خودم ساختم جدا شم. بمونم یا برم؟', nat: 'life', kind: 'find' }, cs({ ph: 'u', said: ['u'], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    const pid = await pidOf(/بمانم یا بروم/); chk(!!pid, 'oA1: the job decision is a live problem');
    await turn('مهم‌ترین داده: الان ۶ هزار کاربرِ فعال داریم و ماهی حدودِ ۵٪ رشد می‌کنیم. قبلش بگو: اون اصلاحِ ۱۲ نفر واقعاً همه جا نشست؟ اون ۴۵ چی شد، و خواستهٔ سنجاق‌شدهٔ سشن که هنوز ۱۰ نوشته؟', 'خوب.', [cs({ ph: 'u', said: ['d'], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    const its = ((await story())['L:' + pid] || { items: [] }).items.filter(x => x.k === 'd'), M = await Mo(pid);
    chk(!its.some(x => /۴۵|۱۲ نفر|سنجاق/.test(x.t)) && !M.pts.some(q => /cdata/.test(q.k) && /۴۵|۱۲ نفر|سنجاق/.test(J(q))), 'A26-41 (oA1 p7→c19: سه «داده (از گفت‌وگو)» از پرسش‌های او دربارهٔ مهمانی — «اون ۴۵ چی شد» …): her question sentences about the other problem are not data of the decision :: ' + J(its.map(x => x.t)));
    chk(its.some(x => /۶ هزار کاربرِ فعال/.test(x.t)), 'neither over-fix: the real datum of the same message («الان ۶ هزار کاربرِ فعال داریم») is still recorded :: ' + J(its.map(x => x.t)));
    const d2 = await p.evaluate(() => APP.STORY.dataOf('۵ تا بشکه دارم، بسه؟ هر کدوم ۲۲۰ لیتره.'));
    chk(d2.some(x => /۵ تا بشکه دارم/.test(x)) && d2.some(x => /۲۲۰ لیتر/.test(x)) && !d2.some(x => /بسه/.test(x)), 'neither over-fix: «۵ تا بشکه دارم، بسه؟» keeps the datum clause and drops only the question :: ' + J(d2));
    // A26-51: return to the earlier CHAT problem by its name
    const t = await turn('برگردیم به مسئلهٔ «دست‌دادن‌های مهمانی»: حالا می‌خوام بدونم تو همون مهمونی چند تا گروهِ سه‌نفره می‌شه ساخت. شنیدم با «ترکیب» حساب می‌شه ولی ترکیب رو اصلاً بلد نیستم.', 'خوب.', [cs({ ph: 'p', said: ['u'], ans: [], stuck: true, fail: false, role: 'self', nat: 'objective' })]);
    const C = await coach();
    chk(!C.lprob && C.pk === pk0 && /دست داده/.test(String(C.stmt)), 'A26-51 (oA1 p31 «برگردیم به مسئلهٔ «دست‌دادن‌های مهمانی»: …» — the page kept «بمانم یا بروم» live): the turn returns to the handshake chat problem :: ' + J([C, pk0]));
    chk(!/بمانم یا بروم/.test(blockLine(t.user)), 'A26-51: no live block of the unrelated decision in that turn :: ' + blockLine(t.user).slice(0, 100));
    const M2 = await Mo(pid), its2 = ((await story())['L:' + pid] || { items: [] }).items;
    chk(!/برگردیم|دست‌دادن|سه‌نفره/.test(String(M2.dest)) && !its2.some(x => /سه‌نفره|ترکیب/.test(x.t)), 'A26-51 (🧭 تصمیم: «مقصد: برگردیم به مسئلهٔ «دست‌دادن‌های مهمانی» …»; unknown under the decision): the decision keeps its own destination and story :: ' + J([M2.dest, its2.map(x => x.k + ':' + x.t.slice(0, 24))]));
  });

  // ================= Q3 — D26-6 (pwD2 p6): مسئلهٔ تازه‌ای که از جمله‌ای وسطِ همان پیام ساخته شد مالکِ آن جمله به بعد است =================
  await section('pwD2', async () => {
    await wipe(); const sid = await fresh();
    const p1 = await p.evaluate(() => { const r = APP.liveCreate('حمله به حدسِ اردوش–اشتراوس', 'برای هر عددِ طبیعیِ n ≥ 2 می‌خوام نشون بدم 4/n = 1/x + 1/y + 1/z جواب داره.', 'prove', { by: 'user' }); APP.liveBindSession(r.p.id, __cur()); return r.p.id; });
    await turn('کافیه حکم رو برای nهای اول ثابت کنم.', 'خوب.', [cs({ ph: 'p', said: ['plan'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective', plan: { text: 'کافیه حکم رو برای nهای اول ثابت کنم' } })]);
    const P6 = 'وارسی کردم: برای 73 با x = 20: 4/73 − 1/20 = 7/1460. پس خودِ حدس برای 73 درسته، فقط xِ من بد بود. حالا یه حدس به ذهنم رسید: شاید برای هر nِ اولِ ≡ 1 (mod 24) یکی از xهای (n+3)/4 تا (n+3)/4 + 3 همیشه کار کنه. می‌خوام این رو مثلِ یه مسئلهٔ واقعی جدی پیگیری کنم، نه این‌که فقط یه یادداشت بشه — میشه؟ اول برای 97 و 193 امتحانش می‌کنم.';
    await turn(P6, 'ثبت شد.', [{ do: 'chat_invent', statement: 'شاید برای هر nِ اولِ ≡ 1 (mod 24) یکی از xهای (n+3)/4 تا (n+3)/4 + 3 همیشه کار کنه', title: 'xهای نزدیک برای nهای اولِ ≡ 1 (mod 24)', nat: 'objective', kind: 'pod' },
      cs({ ph: 'e', said: ['result', 'plan'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective', result: 'خودِ حدس برای 73 درسته، فقط xِ من بد بود', plan: { text: 'اول برای 97 و 193 امتحانش می‌کنم', when: 'next-session', on_guess: true } })]);
    const p2 = await pidOf(/xهای نزدیک/); chk(!!p2 && p2 !== p1, 'pwD2: the new conjecture is its own live problem :: ' + J(await live()));
    const St = await story(), i1 = (St['L:' + p1] || { items: [] }).items, i2 = (St['L:' + p2] || { items: [] }).items, M1 = await Mo(p1), M2 = await Mo(p2), D1 = await dos(p1), D2 = await dos(p2);
    chk(!i1.some(x => /97 و 193/.test(x.t)) && !/97 و 193/.test(String(M1.remain)) && !M1.pts.some(q => /97 و 193/.test(J(q))), 'D26-6 (pwD2 p6 — 🧭 ِ مسئلهٔ اول «مانده: ۱ گام از ۱ گامِ طرحت (گامِ کنونی: اول برای 97 و 193 …)»، فرم «از گفت‌وگو: طرح: اول برای 97 و 193 …»): the plan of the new problem is not on the first problem :: ' + J([i1.map(x => x.k + ':' + x.t.slice(0, 30)), M1.remain]));
    chk(i2.some(x => x.k === 'plan' && /97 و 193/.test(x.t)), 'D26-6 / D25-11 (🧭 ِ مسئلهٔ دوم «طرح هنوز نیست» با این‌که برنامه‌اش گفته شد): the plan she said after introducing the conjecture belongs to the new problem :: ' + J(i2.map(x => x.k + ':' + x.t.slice(0, 30))));
    chk(i1.some(x => x.k === 'plan' && /nهای اول ثابت کنم/.test(x.t)) && !i2.some(x => /73 درسته/.test(x.t)), 'the first problem keeps its own plan; nothing said before the conjecture is on the new problem :: ' + J([i1.map(x => x.k), i2.map(x => x.k)]));
    // neither over-fix: what she said BEFORE the sentence that became the new problem stays with the old one
    await wipe(); await fresh();
    const q1 = await p.evaluate(() => { const r = APP.liveCreate('حجمِ استخر', 'یه استخر ۶ در ۴ متر و عمق ۱.۵ متر دارم. می‌خوام بدونم چند مترمکعب آب می‌گیره.', 'find', { by: 'user' }); APP.liveBindSession(r.p.id, __cur()); return r.p.id; });
    await turn('۶ ضربدر ۴ ضربدر ۱.۵ میشه ۳۶. پس جوابش شد ۳۶ مترمکعب. راستی یه چیزی هم می‌خوام جدا پیگیری کنم: حوضِ حیاط که گرده و قطرش ۲ متره چند مترمکعب آب می‌گیره. اول عمقش رو اندازه می‌گیرم.', 'ثبت شد.',
      [{ do: 'chat_invent', statement: 'حوضِ حیاط که گرده و قطرش ۲ متره چند مترمکعب آب می‌گیره', title: 'حجمِ حوضِ حیاط', nat: 'practical', kind: 'find' },
        csn({ ph: 'b', said: ['result', 'plan'], ans: [], result: 'جوابش شد ۳۶ مترمکعب', plan: { text: 'اول عمقش رو اندازه می‌گیرم' } })]);
    const q2 = await pidOf(/حوض/), S2 = await story(), j1 = (S2['L:' + q1] || { items: [] }).items, j2 = (S2['L:' + q2] || { items: [] }).items;
    chk(q2 && j1.some(x => x.k === 'res' && /۳۶ مترمکعب/.test(x.t)) && !j2.some(x => x.k === 'res'), 'neither over-fix (D26-6 look-alike): the result said BEFORE the new problem\'s sentence stays with the first problem :: ' + J([j1.map(x => x.k + ':' + x.t.slice(0, 20)), j2.map(x => x.k + ':' + x.t.slice(0, 20))]));
    chk(j2.some(x => x.k === 'plan' && /عمقش/.test(x.t)) && !j1.some(x => /عمقش/.test(x.t)), 'and the plan said AFTER it belongs to the new problem :: ' + J([j1.map(x => x.k), j2.map(x => x.k + ':' + x.t.slice(0, 20))]));
    chk(!/nهای اول ثابت کنم/.test(txtOf(D2)) && !M2.pts.some(q => /nهای اول ثابت کنم/.test(J(q))), 'D26-6 («کافیه حکم رو برای nهای اول ثابت کنم» ِ مسئلهٔ اول در 📜 و 🧭 ِ مسئلهٔ دوم): the first problem\'s plan is not in the second problem\'s dossier or route :: ' + J(D2.map(e => e.t + ':' + e.l.slice(0, 30))));
    chk(!D1.some(e => /برنامهٔ خودت/.test(e.t) && /97 و 193/.test(e.l)), 'D26-6 (📜 ِ مسئلهٔ اول «برنامهٔ خودت — اول برای 97 و 193 …»): the session plan record of the new problem is not in the first dossier :: ' + J(D1.filter(e => /برنامه/.test(e.t)).map(e => e.l.slice(0, 40))));
  });

  // ================= Q3 — C26-1: پروندهٔ گفت‌وگو مسئله‌ها را می‌شمارد، نه پیام‌ها/شماره‌های داخلی =================
  await section('count', async () => {
    await wipe(); const sid = await fresh();
    await turn('سلام! امروز می‌خوام یه چیزی رو باهات حل کنم.', 'خوب.', []);
    await turn('یه استخر ۶ در ۴ متر و عمق ۱.۵ متر دارم. می‌خوام بدونم چند مترمکعب آب می‌گیره.', 'خوب.', [csn({ ph: 'u', said: ['u', 'd'], ans: [] })]);
    await turn('این رو ثبت کن که بمونه.', 'ثبت شد.', [{ do: 'live_new', title: 'حجمِ استخر', statement: 'یه استخر ۶ در ۴ متر و عمق ۱.۵ متر دارم. می‌خوام بدونم چند مترمکعب آب می‌گیره.', nat: 'practical' }, csn({ ph: 'u', said: [], ans: [] })]);
    await turn('۶ ضربدر ۴ ضربدر ۱.۵ میشه ۳۶. پس جوابش شد ۳۶ مترمکعب.', 'خوب.', [csn({ ph: 'b', said: ['result'], ans: [], result: 'جوابش شد ۳۶ مترمکعب' })]);
    await turn('من متولدِ ۱۰ مرداد ۱۳۵۰ ام، راستی.', 'خوب.', []);
    let D = await p.evaluate((sid) => { const d = APP.dossierSess(sid); return { st: d.statement, pks: (d.pks || []).map(x => x.title) }; }, sid);
    info.count1 = D; info.countDbg = await p.evaluate(() => { const s = __cur(), C = s.coach || {}; return { pkLog: (C.pkLog || []).map(e => e.pk), probs: Object.fromEntries(Object.entries(C.probs26 || {}).map(([k, v]) => [k, String(v.stmt).slice(0, 30)])), G: APP.STORY.probGroups(s), imp: APP.liveAll().map(r => { const pg = APP.S.get('eprog_' + r.p.id); return [r.sess === s.id, pg.solve.live.chatImp]; }) }; });
    chk(!/مسئلهٔ [۰-۹]+ از [۰-۹]+ در این گفت‌وگو/.test(String(D.st)) && D.pks.length <= 1, 'C26-1 (16 از 20 سناریو — پروندهٔ گفت‌وگو «مسئلهٔ ۲ از ۲» / «۳ از ۳» برای یک مسئله: سلام، ثبت در 🔭، جملهٔ تولد): one problem is not counted as several :: ' + J(D));
    // neither over-fix: two real problems are still two (s24)
    await turn('یه مسئلهٔ دیگه هم دارم: برای حصارِ باغ ۱۲۰ متر توری دارم و می‌خوام بزرگ‌ترین زمینِ مستطیلی رو حصار بکشم. ابعادش چی باشه؟', 'خوب.', [csn({ ph: 'u', said: ['u', 'd'], ans: [] })]);
    D = await p.evaluate((sid) => { const d = APP.dossierSess(sid); return { st: d.statement, pks: (d.pks || []).map(x => x.title) }; }, sid);
    chk(/مسئلهٔ ۲ از ۲ در این گفت‌وگو/.test(String(D.st)) && D.pks.length === 2, 'neither over-fix (s24): two real problems in one conversation are «۲ از ۲» :: ' + J(D));
  });

  // ================= Q3 — منفی‌ها: واژهٔ مشترکِ بی‌قاب مسئله را عوض نمی‌کند؛ دو نامزدِ هم‌تراز ⇒ صفحه می‌پرسد و چیزی ثبت نمی‌شود (C21) =================
  await section('neg', async () => {
    await wipe(); const sid = await fresh();
    const mk = (t, s) => p.evaluate(([t, s]) => APP.liveCreate(t, s, 'find', { by: 'user', sess: __cur().id }).p.id, [t, s]);
    const pA = await mk('بیداریِ ساعت ۶', 'هفته‌ای پنج روز صبح زود ساعت ۶ بیدار شم؛ الان فقط دو روز موفق میشم. چطور برسم به پنج روز؟');
    const pB = await mk('شامِ ساعت ۱۰ و بی‌خوابی', 'شب‌ها شام رو ساعت ۱۰ می‌خوریم و بعدش خوابم نمی‌بره. می‌خوام اینم حل کنم.');
    await p.evaluate(([pA, pB]) => { const s = __cur(); APP.liveBindSession(pA, s, { force: true }); APP.liveBindSession(pB, s, { force: true }); }, [pA, pB]);
    let t = await turn('دیشب شام سبک خوردم و امروز صبح بیداری راحت بود.', 'خوب.', [cs({ ph: 'u', said: ['d'], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    let C = await coach(); chk(C.lprob === pB, 'neither over-fix: a shared word without a naming frame («… صبح بیداری راحت بود» inside the dinner problem) does not switch the problem :: ' + J(C));
    t = await turn('این مسئله یه بخشِ دیگه هم داره: آخرِ هفته‌ها مهمون داریم.', 'خوب.', [cs({ ph: 'u', said: ['d'], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    C = await coach(); chk(C.lprob === pB, 'neither over-fix: «این مسئله …» is the current problem :: ' + J(C));
    t = await turn('برگردیم به مسئلهٔ بیداری: دو روزِ موفق شبش ساعت ۱۱ خوابیده بودم.', 'خوب.', [cs({ ph: 'u', said: ['d'], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    C = await coach(); chk(C.lprob === pA, 'C21: «برگردیم به مسئلهٔ بیداری» binds the turn to the wake-up problem :: ' + J(C));
    // tie: a third problem that shares the named word
    const pC = await mk('بیداریِ بچه‌ها برای مدرسه', 'بچه‌ها صبح‌ها برای مدرسه دیر بیدار میشن. چیکار کنم؟');
    await p.evaluate((pB) => { APP.liveBindSession(pB, __cur(), { force: true }); const C = __cur().coach || {}; delete C.focus26; APP.S.put(__cur()); }, pB);
    t = await turn('برگردیم به مسئلهٔ بیداری: یه چیزی یادم اومد، هر روز ۷ ساعت خواب لازم دارم.', 'خوب.', [cs({ ph: 'u', said: ['d'], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    C = await coach(); const St = await story();
    chk(/منظورت کدام است/.test(multi(t.user)) && /بیداریِ ساعت ۶/.test(multi(t.user)) && /بیداریِ بچه‌ها/.test(multi(t.user)), 'C21 (bind or ask): two problems carry the named word ⇒ the page asks which, naming both :: ' + multi(t.user).slice(-520));
    chk(C.lprob === pB && !Object.keys(St).some(k => (St[k].items || []).some(x => /۷ ساعت خواب/.test(x.t))), 'C21 (never file under the merely-live problem): while the page asks, nothing of that message is filed under any problem :: ' + J([C.lprob === pB, Object.keys(St).map(k => k + ':' + St[k].items.length)]));
    t = await turn('همون بیداریِ بچه‌ها برای مدرسه.', 'خوب.', [cs({ ph: 'u', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    C = await coach(); chk(C.lprob === pC, 'C21: answering by naming one is the answer :: ' + J([C.lprob, pC]));
  });

  // ================= Q6 — C26-2، C26-25، C26-16، U32/B26·D33 (بخشِ «close») =================
  await section('close', async () => {
    // --- U32 (s15 «مقصد: چیکار کنم؟»)، D25-25 (aD4 «مقصد: چطور شروع کنم؟»)، B26·D33 (oB1 s35 مقصد = جملهٔ ساعتِ هوشمند، نه «حل‌شدن یعنی …») ---
    await wipe(); let sid = await fresh();
    await turn('شب‌ها شام رو ساعت ۱۰ می‌خوریم و بعدش خوابم نمی‌بره. می‌خوام اینم حل کنم. ثبتش کن.', 'ثبت شد.', [{ do: 'live_new', title: 'شامِ ساعت ۱۰ و بی‌خوابی', statement: 'شب‌ها شام رو ساعت ۱۰ می‌خوریم و بعدش خوابم نمی‌بره. می‌خوام اینم حل کنم.', nat: 'life' }, cs({ ph: 'u', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    const pd = await pidOf(/شام/);
    await turn('حل‌شدن یعنی هفته‌ای دست‌کم ۵ شب تا ۱۱:۳۰ خوابم ببره. فکر کنم مشکل سنگینیِ شامه نه ساعتش. برای اینکه مطمئن شم می‌خوام ساعت هوشمندم که خوابم رو ثبت می‌کنه داده‌هاش رو بده به همین‌جا که دقیق ببینم هر شب کی خوابم برده. میشه داده‌ی ساعت رو اینجا وارد کرد؟', 'خوب.', [cs({ ph: 'u', said: ['u'], ans: ['u1'], stuck: false, fail: false, role: 'self', nat: 'life' })]);
    let M = await Mo(pd);
    chk(/۵ شب تا ۱۱:۳۰ خوابم ببره/.test(String(M.dest)) && !/ساعت هوشمند/.test(String(M.dest)), 'B26·D33 (oB1 s35 second problem\'s unknown/destination = «برای اینکه مطمئن شم می‌خوام ساعت هوشمندم …» instead of his goal sentence «حل‌شدن یعنی هفته‌ای دست‌کم ۵ شب تا ۱۱:۳۰ خوابم ببره»): the destination is the goal he stated :: ' + M.dest);
    await wipe(); sid = await fresh();
    let t = await turn('یه قفسهٔ کتاب می‌خوام بسازم برای دیوارِ ۲ متریِ اتاقم؛ ۵ طبقه، هر طبقه باید ۳۰ کیلو کتاب رو تحمل کنه. چطور شروع کنم؟', 'خوب.', [csn({ ph: 'u', said: ['d'], ans: [] })]);
    M = await Mo(sid);
    chk(M && !/^چطور شروع کنم|^چیکار کنم|^از کجا شروع کنم/.test(String(M.dest).trim()), 'U32 / D25-25 (s15 «مقصد: چیکار کنم؟»، aD4 «مقصد: چطور شروع کنم؟»، tB1x «از کجا شروع کنم؟»): a method question is not the destination of the problem :: ' + (M && M.dest));
    await turn('دنبالِ اینم که قفسه‌ای بسازم که زیرِ ۱۵۰ کیلو کتاب شکم نده.', 'خوب.', [csn({ ph: 'u', said: ['u'], ans: ['u1'] })]);
    M = await Mo(sid); chk(/شکم نده/.test(String(M.dest)), 'neither over-fix: her own stated unknown is the destination :: ' + M.dest);
    // --- C26-25 (aC2 p3): مسئله‌ای که در گفت‌وگو ثابت شد و بعد ثبت شد با کارتِ «✅ حل شد» باز می‌شود، نه از «فهم» با u1 ---
    await wipe(); sid = await fresh();
    await turn('می‌خوام ثابت کنم جمعِ n عددِ فردِ اول میشه n². با استقرا: برای n=1 که ۱ = ۱². اگه برای k درست باشه، k² + (2k+1) = (k+1)². پس ثابت شد؛ جوابش شد n².', 'خوب.',
      [cs({ ph: 'b', said: ['u', 'result'], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective', result: 'پس ثابت شد؛ جوابش شد n²' })]);
    t = await turn('این رو در مسئله‌هام ثبت کن.', 'ثبت شد.', [{ do: 'live_new', title: 'جمعِ n عددِ فردِ اول', statement: 'ثابت کنم جمعِ n عددِ فردِ اول میشه n².', nat: 'objective', kind: 'prove' }, cs({ ph: 'b', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'objective' })]);
    const pc = await pidOf(/عددِ فرد/); chk(!!pc, 'aC2: registered after the proof');
    const rdy = await p.evaluate((pid) => APP.STORY.chatSolvedReady(pid), pc), ph = (await live()).filter(x => x.pid === pc)[0];
    chk(rdy && /ثابت شد/.test(rdy.t), 'C26-25 (aC2 p3 مسئلهٔ ثبت‌شده در «فهمِ مسئله» باز شد؛ «✅ حل شد» نبود): the problem proved in chat opens with the «در گفت‌وگو به نتیجه رسیدی — ✅ حل شد» card :: ' + J([rdy, ph]));
    t = await turn('خب، حالا چی؟', 'خوب.', []);
    chk(!/مجهول \(یا حکمی که باید ثابت شود\) چیست|داده‌ها \(یا فرض\) چیست/.test((head(t.user).match(/پرسشِ این نوبت[^\n]*/g) || []).join(' ')), 'C26-25 (aC2 p6/p10 پرسشِ صفحه برای مسئلهٔ حل‌شده: «مجهول … چیست؟»، «داده‌ها … چیست؟»): no understanding question is the turn question :: ' + (head(t.user).match(/پرسشِ این نوبت[^\n]*/g) || []).join(' ¦ ').slice(0, 300));
    // --- C26-2: «حل شد» در 🧭/📜 فقط از بستنِ خودِ صفحه — حالتِ «در بازنگری — هنوز بسته نشده» «مقصد — حل شد ✓» نیست ---
    const ok = await p.evaluate((pid) => APP.STORY.chatSolvedClose(pid), pc);
    M = await Mo(pc); const cst = await p.evaluate((pid) => { try { return APP.liveClosure ? APP.liveClosure(pid) : null; } catch (e) { return null; } }, pc);
    info.closure = { ok, cst, now: M.now, dest: M.dest, remain: M.remain };
    if (cst && cst.state === 'review') chk(!/حل شد ✓/.test(String(M.dest)) && !/به مقصد رسیدی/.test(String(M.remain)), 'C26-2 (s21, pC1–pC3: 🧭 «مقصد — حل شد ✓ · هیچ — به مقصد رسیدی» while closure.state = review «در بازنگری — هنوز بسته نشده»): the route says «در بازنگری», not «حل شد ✓» :: ' + J(info.closure));
  });

  // ================= bank — هر ورودیِ story در بانکِ مستقلِ دورِ ۲۶ =================
  await section('bank', async () => {
    const mine = BANK.filter(v => /story|Q3|Q6/i.test(String(v.mech || v.fixer || v.family || v.p || '')));
    info.bank.n = mine.length; info.bank.file = BF || '(none yet)';
  });

  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS(' + errors.length + '):\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
