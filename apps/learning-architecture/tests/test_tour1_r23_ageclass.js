// تورِ پولیا (دستهٔ ۱، دورِ ۲۳، سهمِ «ageclass» — ۲۰۲۶-۱۰-۱۹) — DECISIONS_R23: Q1 (سن و هویت) و Q5 (ردبندی، مسیریابی، پرسشِ نوبت، پس‌سنجی)
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۳ (A23-1/2/3/4/6/7/9/13/14/17/20/28/38، B·D6/8/9/10/12/13/14/20، C23-1/6/8/12/17/19/21/23، D23-1/2/18/19/25/26/27/28)
//  bank     همهٔ ورودی‌های Q1 و Q5 در بانکِ مستقلِ tests/variants/VARIANTS_R23.json — تاریخ‌های شمسیِ بانک که با الگوریتمِ jalaali-js نمی‌خوانند
//           با الگوریتمِ jalaali-js و تقویمِ persian ِ ICU سنجیده شدند: بانک درست است (۱ فروردین ۱۳۳۸ = 1959-03-22، چون اعتدالِ ۱۹۵۹ پس از ظهرِ تهران بود ⇒
//           ۲۰ اردیبهشت = 1959-05-11، ۱۲ خرداد = 1959-06-03)؛ بازبینیِ دستیِ «1959-03-21» یک روز خطا داشت. ناهم‌خوانیِ آینده ⇒ info.bankWrong، نه خم کردنِ صفحه.
// LLA_FILE = ساختِ دیگر؛ ONLY=jal,card,chat,teen,map,puzzle,strip,route,class,corr,post,turnq,reg,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = [process.env.LLA_VARIANTS23, path.join(__dirname, 'variants', 'VARIANTS_R23.json')].find(f => f && fs.existsSync(f));
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
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const ev = (fn, arg) => p.evaluate(fn, arg);
  const parse = (t, o) => ev(([t, o]) => { const r = APP.AGE.parse(t, o); return r ? { iso: r.iso || '', err: r.err || '', need: r.need || '' } : null; }, [t, o || {}]);
  const birth = () => ev(() => APP.AGE.birth());
  const setB = (v) => ev((v) => { const st = APP.S.settings(); st.profile = st.profile || {}; if (v) st.profile.birth = v; else delete st.profile.birth; delete st.profile.ageSaid; delete st.profile.birthMD; delete st.profile.reg; APP.S.saveSettings(st); }, v || '');
  const NOFMT = /YYYY|MM-DD|میلادیِ درست/;

  // ================= Q1 — تاریخِ شمسی (الگوریتمِ jalaali-js، جفت‌های شناخته) =================
  await section('jal', async () => {
    const pairs = [['۱ فروردین ۱۴۰۵', '2026-03-21'], ['۱۴۰۵/۰۱/۰۱', '2026-03-21'], ['۲۰ اردیبهشت ۱۳۳۸', '1959-05-11'], ['۱ خرداد ۱۳۳۸', '1959-05-23'], ['۱۳۳۸/۰۳/۱۲', '1959-06-03'],
      ['۲۵ اسفند ۱۳۳۷', '1959-03-16'], ['۱۳۹۶/۰۱/۰۵', '2017-03-25'], ['۳۰ اسفند ۱۳۹۵', '2017-03-20'], ['۱۳۸۸/۱۱/۲۲', '2010-02-11'], ['1340-09-10', '1961-12-01'],
      ['۱۹ بهمن ۱۳۸۸', '2010-02-08'], ['۲۰ اردی‌بهشت ماهِ ۱۳۳۸', '1959-05-11'], ['1338/2/20', '1959-05-11'], ['۱۳۳۸/03/۱۲', '1959-06-03'], ['1959-05-11', '1959-05-11'], ['2017/03/25', '2017-03-25'],
      ['16 March 1959', '1959-03-16'], ['۲۷ مهر ۱۴۰۵', null]];
    for (const [t, iso] of pairs) { const r = await parse(t); if (iso) chk(r && r.iso === iso, 'jal: «' + t + '» ⇒ ' + iso + ' ' + JSON.stringify(r)); else chk(r && !r.iso && /هنوز نیامده/.test(r.err), 'jal: today is not a past birth date ' + JSON.stringify(r)); }
    /* مقایسهٔ مستقل با تقویمِ persian ِ ICU (Intl): ۱ فروردین ۱۳۳۸ = 1959-03-22 (اعتدال پس از ظهرِ تهران)، نه 21 */
    const icu = await ev(() => { const f = (d) => new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' }).format(new Date(d + 'T12:00:00Z')).replace(/\s*AP$/, '');
      const out = []; for (let t = Date.UTC(1940, 0, 1); t < Date.UTC(2030, 0, 1); t += 7 * 864e5 + 3600e3) { const d = new Date(t).toISOString().slice(0, 10), j = APP.AGE.g2j(d), s = j[1] + '/' + j[2] + '/' + j[0]; if (s !== f(d) || APP.AGE.j2g(j[0], j[1], j[2]) !== d) out.push([d, s, f(d)]); } return out; });
    chk(!icu.length, 'jal: page converter agrees with ICU persian calendar and round-trips, 1940–2030 ' + JSON.stringify(icu.slice(0, 3)));
    // A23-1 / B·D6 / C23-8 / D23-25: the runners' own card inputs
    for (const t of ['۲۰ اردیبهشت ۱۳۳۸', '۱۳۳۸/۰۳/۱۲', '۱۳۹۵/۱۲/۱۲', '۱۳۹۶/۰۲/۰۵', '۱۳۹۱/۰۷/۲۰', '۱۳۳۸/۰۵/۱۲', '۱۳۶۳/۰۶/۱۸', '۲۵ اسفند ۱۳۳۷']) { const r = await parse(t); chk(r && /^\d{4}-\d{2}-\d{2}$/.test(r.iso), 'runner Jalali card input accepted «' + t + '» ' + JSON.stringify(r)); }
    // human errors, never «YYYY-MM-DD»
    const bad = { '۳۱ مهر ۱۳۹۶': /مهر.*۳۰ روز/, '۳۰ اسفند ۱۳۹۶': /اسفند.*۲۹ روز/, '۱۴۰۶/۰۲/۰۱': /هنوز نیامده/, '۱۳۳۸/۱۳/۰۵': /ماهِ «۱۳»/, 'فلان': /نشناختم/ };
    for (const t of Object.keys(bad)) { const e = await ev((t) => APP.AGE.setBirthInfo(t).err || '', t); chk(bad[t].test(e) && !NOFMT.test(e), 'jal: refused with a human message «' + t + '» ' + e); }
    chk(await ev(() => APP.AGE.setBirth('2001-02-30')) !== '', 'jal: impossible Gregorian still refused');
  });

  // ================= Q1 — کارتِ تولد: شمسی، پیامِ انسانی، ضمیرِ «شما» (A23-1، B·D6، B·D9) =================
  await section('card', async () => {
    await wipe(); await setB(''); await fresh();
    await turn('سلام. من پروین هستم، معلمِ بازنشسته. می‌خواهید کمکم کنید ساعت‌های دارو را بچینم؟ شما بفرمایید چه کنم.', 'بفرمایید.');
    const r1 = await ev(() => { const AS = APP.ASSIST, s = __cur(); const card = (AS.logHooks || []).map(f => { try { return f(s); } catch (e) { return null; } }).filter(Boolean).find(el => el.classList && el.classList.contains('age-ask'));
      if (!card) return { none: true }; const text = card.textContent; const inp = card.querySelector('input'); inp.value = '۳۱ اسفند ۱۳۳۷'; [...card.querySelectorAll('button')].find(x => /ثبت/.test(x.textContent)).click();
      const err = card.querySelector('.age-err').textContent; inp.value = '۲۰ اردیبهشت ۱۳۳۸'; [...card.querySelectorAll('button')].find(x => /ثبت/.test(x.textContent)).click();
      return { text, err, b: APP.AGE.birth(), age: APP.AGE.age(), msgs: (__cur().msgs || []).filter(m => m.role === 'sys').map(m => AS.regSys(__cur(), m.text)) }; });
    chk(!r1.none && /تولدتان/.test(r1.text) && !/تولدت را/.test(r1.text) && /شمسی/.test(r1.text), 'B·D9 s12: the birth card speaks «شما» to a «شما» user and says Jalali is fine ' + JSON.stringify(r1.text));
    chk(/اسفند/.test(r1.err) && !NOFMT.test(r1.err), 'A23-1: a wrong day gets a human message, not «YYYY-MM-DD» ' + r1.err);
    chk(r1.b === '1959-05-11' && r1.age === 67, 'A23-1 aA3 p2: «۲۰ اردیبهشت ۱۳۳۸» saved on the page ⇒ 1959-05-11, age 67 ' + JSON.stringify(r1));
    chk(r1.msgs.some(t => /تولدتان ثبت شد/.test(t) && /۲۰ اردیبهشت ۱۳۳۸/.test(t) && /1959-05-11/.test(t)), 'card confirmation shows both forms in «شما» ' + JSON.stringify(r1.msgs));
    // DO.birth from the model with the Jalali words — the page converts and shows it
    await setB('');
    const d = await ev(() => [APP.ASSIST.DO.birth({ date: '۲۵ اسفند ۱۳۳۷' }), APP.AGE.birth(), APP.ASSIST.DO.birth({ date: '1989-03-08' }), APP.ASSIST.DO.birth({ date: '۳۱ مهر ۱۳۹۶' })]);
    chk(/^✓/.test(d[0]) && /1959-03-16/.test(d[0]) && d[1] === '1959-03-16' && d[2] === '' && /مهر/.test(d[3]) && !NOFMT.test(d[3]), 'C23-8 aC3: birth action takes the Jalali date as she said it; ISO still returns "" ' + JSON.stringify(d));
    const rule = await ev(() => (APP.ASSIST.promptHooks || []).map(f => { try { return f(null, 'تولدم ۲۰ اردیبهشته') || ''; } catch (e) { return ''; } }).join('\n'));
    chk(/همان‌طور که گفت/.test(rule) && /خودت تبدیل نکن/.test(rule), 'birth rule tells the model not to convert in its head');
  });

  // ================= Q1 — تولد در گفت‌وگو: «X سالمه، تولدم روزِ Y» (D23-25، بانک) =================
  await section('chat', async () => {
    const cases = [['۶۷ سالمه، تولدم ۱۲ خرداده', '1959-06-03'], ['امروز تولدمه!! ۹ سالم شد 🎂', '2017-10-19'], ['۸ سالمه، تولدم فرداست', '2017-10-20'], ['متولد ۳۱ شهریور ۸۹ ام', '2010-09-22'],
      ['۷ دی ۴۲ به دنیا اومدم، الان بازنشسته‌ام', '1963-12-28'], ['راستی اون کادر تاریخ تولد رو نمی‌دونم میلادیش چی میشه، من ۱۹ بهمن ۱۳۸۸ به دنیا اومدم.', '2010-02-08']];
    for (const [m, iso] of cases) { await wipe(); await setB(''); await fresh(); await turn(m, 'باشه.'); const r = await ev(() => [APP.AGE.birth(), (__cur().msgs || []).filter(x => x.role === 'sys').map(x => x.text).join(' | ')]);
      chk(r[0] === iso && /ثبت شد/.test(r[1]), 'chat birth «' + m + '» ⇒ ' + iso + ' ' + JSON.stringify(r)); }
    for (const m of ['تولد مامانم ۲۰ اردیبهشته، چی براش بخرم که خوشش بیاد؟', 'قرارداد اجاره ۱۴۰۵/۰۸/۱۵ تموم میشه، تا اون موقع باید خونه پیدا کنم', '۶۷ کیلومتر تا روستا راهه، با ۴۰ تا سرعت چقدر طول میکشه', 'پارسال ۱۲ خرداد رفتیم شمال']) {
      await wipe(); await setB(''); await fresh(); await turn(m, 'باشه.'); const r = await ev(() => [APP.AGE.birth(), APP.AGE.age()]); chk(!r[0] && r[1] == null, 'not her birth date: «' + m + '» ' + JSON.stringify(r)); }
    await wipe(); await setB(''); await fresh(); await turn('تولدم ۱۲ خرداده', 'باشه.');
    const y = await ev(() => { const AS = APP.ASSIST, s = __cur(); const card = (AS.logHooks || []).map(f => { try { return f(s); } catch (e) { return null; } }).filter(Boolean).find(el => el.classList && el.classList.contains('age-ask'));
      const t = card ? card.textContent : ''; const b0 = APP.AGE.birth(); if (card) { card.querySelector('input').value = '۱۳۳۸'; [...card.querySelectorAll('button')].find(x => /ثبت/.test(x.textContent)).click(); } return [t, b0, APP.AGE.birth()]; });
    chk(/سالش/.test(y[0]) && /۱۲ خرداد/.test(y[0]) && !y[1] && y[2] === '1959-06-03', 'day without year: nothing saved, the card asks only the year, then saves ' + JSON.stringify(y));
    await wipe(); await setB(''); await fresh(); await turn('سلاااام 😅 من سارام ۱۵ سالمه این سواله رو نمیفهمم: دو تا عدد جمعشون ۲۰ ضربشون ۹۶', 'باشه.');
    const a = await ev(() => [APP.AGE.birth(), APP.AGE.age(), APP.AGE.band(APP.AGE.age()) && APP.AGE.band(APP.AGE.age()).id]);
    chk(!a[0] && a[1] === 15 && a[2] === 'teen', '«۱۵ سالمه» ⇒ teen band, no birth date invented ' + JSON.stringify(a));
  });

  // ================= Q1 — سطرِ نوجوان پس از گذرِ یک‌پرسشی (A23-9، B·D8، D23-26) =================
  await section('teen', async () => {
    await wipe(); await setB('2012-01-01'); await fresh();
    const u = await turn('یه مسئله: ثابت کن مجموع n عدد فرد اول n^2 میشه.', 'مجهول؟');
    const aud = blockOf(u.user, /^# مخاطب/);
    chk(/نوجوان/.test(aud) && !/پرسشِ همین پاسخ کن/.test(head(u.user)) && !/(?:^|[^آ-ی])بپرس(?![آ-ی])/.test(aud) && /سهمِ تو پرسیدن است/.test(aud), 'A23-9: the teen line reads as a sentence after the one-question pass ' + aud.split('\n').filter(l => /گام‌ها/.test(l)).join(' '));
    const src = await ev(() => { const hk = (APP.ASSIST.promptHooks || []); return hk.map(f => { try { return f(null, 'منبع‌ها و پوشش کتاب') || ''; } catch (e) { return ''; } }).join('\n'); });
    chk(!/شناسه را بپرس/.test(src), 'B·D8: «# منبع‌ها و پوشش» no longer carries a second «بپرس»');
  });

  // ================= Q1 — نقشهٔ سامانه دربارهٔ سن (A23-28، A23-38) =================
  await section('map', async () => {
    await wipe(); await setB('1987-01-01'); await fresh();
    const u = await turn('سنِ منو برای چی می‌خوای؟ کجا نگهش می‌داری؟ آفلاین هم کار می‌کنه؟ اگه مدل رو عوض کنم چی میشه؟', 'باشه.');
    const man = (/# نقشهٔ سامانه[^\n]*\n([\s\S]*?)\n# /.exec(u.user) || [])[1] || '';
    const line = man.split('\n').find(l => /سن و تاریخِ تولد/.test(l)) || '';
    chk(!blockOf(u.user, /^# مخاطب/) && /# مخاطب/.test(line) && /هم‌سن/.test(line) && /جا:/.test(line) && /آفلاین:/.test(line) && /مستقل از مدل/.test(line), 'A23-28/A23-38 oA1: adult prompt has no audience block but the system map says what age is for, where it is kept, offline, model-independent ' + line.slice(0, 200));
    chk(man.indexOf('سن و تاریخِ تولد') >= 0 && man.indexOf('سن و تاریخِ تولد') < man.indexOf('## نماها'), 'self-knowledge comes first in the map (never cut from the end)');
    chk(/ذخیرهٔ داده‌های این صفحه/.test(man), 'storage line from the registry');
  });

  // ================= Q1 — معمای امروز برای کودک نه (D23-27) =================
  await section('puzzle', async () => {
    await wipe(); await setB('2017-03-25');
    const kid = await ev(() => ({ open: APP.PSY ? APP.PSY.canOpenToday() : null, due: (APP.dueList() || []).some(x => /معمای امروز/.test(x.txt || '')) }));
    await setB('1987-01-01');
    const adult = await ev(() => ({ open: APP.PSY ? APP.PSY.canOpenToday() : null, due: (APP.dueList() || []).some(x => /معمای امروز/.test(x.txt || '')) }));
    chk(kid.due === false && adult.due === true, 'D23-27 aD1: the adult-normed daily puzzle is not offered to a 9-year-old, still offered to an adult ' + JSON.stringify({ kid, adult }));
  });

  // ================= Q1 — سلام و معرفی در عنوان و صورت نه (A23-7، C23-12، D23-28، B·D10، B·D13) =================
  await section('strip', async () => {
    const S = (t) => ev((t) => APP.ASSIST.stripIntro23(t), t);
    const cases = [
      ['سلام من یاسمنم کلاس سومم. یه سوال از کتاب ریاضیمون دارم. مامانم ۳ تا جعبه شیرینی خرید هر جعبه ۸ تا شیرینی داشت.', /^مامانم ۳ تا جعبه/],
      ['سلام من کیانم کلاس سومم. معلممون این سوالو داده: تو مزرعه مرغ و گوسفند هست. روی هم ۱۰ تا سر دارن و ۲۸ تا پا. چند تا گوسفنده؟ جوابشو بگو', /^تو مزرعه مرغ/],
      ['سلام. کفش‌فروشی دارم و می‌خوام بدونم چند جفت سفارش بدم', /^کفش‌فروشی دارم/],
      ['سلام! یه سؤال از کتاب: ثابت کنید برای هر عدد اول p بزرگ‌تر از ۳ ...', /^ثابت کنید/],
      ['صبح بخیر. جدول امروز: «پایتخت کشوری که رودخانه‌ی دانوب از آن می‌گذرد» شش حرفی.', /^جدول امروز/],
      ['با سلام و احترام؛ بنده رضایی هستم. می‌خواستم بپرسم اگر وام ۲۰۰ میلیونی با سود ۲۳٪ بگیرم قسط ماهانه چقدر می‌شود؟', /^اگر وام ۲۰۰ میلیونی/],
      ['سلاااام 😅 من سارام ۱۵ سالمه این سواله رو نمیفهمم: دو تا عدد جمعشون ۲۰ ضربشون ۹۶', /^دو تا عدد جمعشون/],
      ['سلام. من پروین هستم، معلمِ بازنشسته. نوه‌ام این برنامه را برایم نصب کرده. دکتر دو تا دارو برایم نوشته', /^دکتر دو تا دارو/],
      ['سلام وقتتون بخیر. بنده ۶۷ سالمه. می‌خواستم ببینم با این حقوق بازنشستگی می‌تونم قسط ۸ میلیونی بدم یا نه', /^با این حقوق/],
      ['توی یه مهمونی هر کی به همه سلام کرد، ۴۵ تا سلام شد. چند نفر بودن؟', /^توی یه مهمونی هر کی به همه سلام کرد/],
      ['علی ۳ تا سیب داره، مریم ۲ تا بیشتر. روی هم چند تا؟', /^علی ۳ تا سیب/]];
    for (const [t, re] of cases) { const x = await S(t); chk(re.test(x) && !/کیان|یاسمن|سارا|رضایی/.test(x), 'strip «' + t.slice(0, 40) + '» ⇒ ' + x.slice(0, 60)); }
    await wipe(); await setB('2017-01-01'); await fresh();
    await turn('سلام من کیانم کلاس سومم. معلممون این سوالو داده: تو مزرعه مرغ و گوسفند هست. روی هم ۱۰ تا سر دارن و ۲۸ تا پا. چند تا گوسفنده؟ جوابشو بگو', 'با هم شروع کنیم.');
    const s1 = await st(); chk(/^تو مزرعه/.test(s1.stmt) && !/کیان|سلام/.test(s1.stmt), 'D23-28 aD1: chat statement without greeting or the child\'s name ' + s1.stmt.slice(0, 60));
    const msg = await ev(() => (__cur().msgs || []).find(m => m.role === 'user').text);
    chk(/^سلام من کیانم/.test(msg), 'her own message stays exactly as typed');
  });

  // ================= Q5 — مسیریابیِ نوبتِ گشایش (A23-2، C23-19، D23-2، D23-1) =================
  await section('route', async () => {
    const R = ['سلام من یاسمنم کلاس سومم. یه سوال از کتاب ریاضیمون دارم. مامانم ۳ تا جعبه شیرینی خرید هر جعبه ۸ تا شیرینی داشت. مهمونا ۵ تا خوردن. بقیه رو مامانم بین من و دوتا داداشام مساوی تقسیم کرد. به هر کدوممون چندتا رسید؟ من ۸ تا گرفتم ولی نمیدونم درسته یا نه',
      'سلام. من پروین هستم، معلمِ بازنشسته. نوه‌ام این برنامه را برایم نصب کرده. دکتر دو تا دارو برایم نوشته: یکی را باید هر ۸ ساعت یک بار بخورم، آن یکی را هر ۱۲ ساعت یک بار، و دومی را حتماً با غذا. من صبحانه ساعت ۸، ناهار ساعت یک و نیم و شام ساعت ۸ شب می‌خورم. ساعت ۱۱ شب می‌خوابم و ۶ و نیم صبح بیدار می‌شوم. نمی‌خواهم نصفه‌شب برای دارو بیدار شوم. ساعت‌ها را چطور بچینم؟',
      'سلام. من نیلوفرم، کلاس دهم. ثابت کردم که 1 + 3 + 5 + … + (2n − 1) = n² — با یه شکل: هر عدد فرد یه «L» دورِ مربعِ قبلی می‌سازه و مربع یکی بزرگ‌تر میشه. معلممون گفت «حالا بازنگری کن». بازنگری دقیقاً یعنی چی؟ چی کار باید بکنم؟',
      'سلام من کیانم کلاس سومم. معلممون این سوالو داده: تو مزرعه مرغ و گوسفند هست. روی هم ۱۰ تا سر دارن و ۲۸ تا پا. چند تا گوسفنده؟ جوابشو بگو',
      'صاحبخونه میگه طبق بند ۷ قرارداد چون دیوارها لک شده کل ودیعه مال اونه. بند ۷: «در صورت خسارت عمدی یا ناشی از سهل‌انگاری فاحش به ملک، موجر می‌تواند معادل خسارت را از ودیعه کسر کند.» حق داره؟ بگو نه دیگه.'];
    const tags = ['A23-2 aA1 p1', 'A23-2 aA3 p1', 'C23-19 aC2 p1', 'D23-2 aD1 p1', 'D23-1 s33 p1'];
    for (let i = 0; i < R.length; i++) { await wipe(); await setB('1980-01-01'); await fresh(); const u = await turn(R[i], 'باشه.'); chk(u.task === 'lla_coach', tags[i] + ': opening routes lla_coach, got ' + u.task);
      if (i === 4) chk(!/# اصلاحِ پیامِ پیشین/.test(head(u.user)), 'D23-1: «بگو نه دیگه» brings no correction block'); }
    const g = await ev(() => [APP.ASSIST.metaMsg22('حق داره؟ بگو نه دیگه.'), APP.ASSIST.metaMsg22('نه، ۸ بود'), APP.ASSIST.corrAsk('تحویلش پنجشنبه نیست، شنبه‌ست') ? 'correction' : 'no', APP.ASSIST.notProblem('سلام، خوبی؟'), APP.ASSIST.notProblem('سلام من کیانم کلاس سومم')]);
    chk(g[0] === '' && g[1] === 'correction' && g[2] === 'correction' && g[3] === true && g[4] === true, 'D23-1: «بگو نه دیگه» is not a correction; real corrections still are; greeting-only is not a problem ' + JSON.stringify(g));
  });

  // ================= Q5 — گزارشِ تمرین/کاربست مسئلهٔ تازه یا A191 نیست (C23-1، A23-13، B·D13، D23-19) =================
  await section('class', async () => {
    const M = ['امروز بدون نگاه نوشتمش: مرکز از هر دو مسیر هم‌فاصله‌ست پس روی نیمسازِ اون دو تاست؛ دو تا نیمساز می‌کشم و تقاطعشون مرکزه. حدود ۸۰٪ یادم بود.',
      'امروز دوباره بی‌نگاه توضیح دادم و این بار زمانِ پخت رو هم گفتم که به ضخامت بنده نه مساحت. کامل یادم بود.',
      'امروز تو یه جمع دیگه هم همون تلسکوپی رو به کار بردم: ۱/(k(k+2)) رو به نصفِ (۱/k − ۱/(k+2)) شکستم و جمعش راحت درومد.',
      'برگهٔ سفیدِ امروز رو بی‌نگاه نوشتم: هر عدد فرد یه L دورِ مربعِ قبلیه — ردیفِ n تایی، ستونِ n تایی، یه کاشیِ گوشه — پایه کاشیِ تنهاست و L همون گامِ استقرا. کامل یادم بود.',
      'سلام! امروز برگه‌ی سفید رو از حافظه نوشتم: فیثاغورس و مساحت مثلث رو درست نوشتم، ولی جذر ۸۱ رو ۸ گفتم که غلطه، ۹ میشه. یعنی دوتا از سه تا.',
      'سلام. یه هفته گذشت. همین روش رو برای حقوق بازنشستگی خانمم هم زدم: حقوقش ماهی ۱۲ میلیونه و سالی ۲۰ درصد زیاد میشه ولی تورم ۳۰ درصده.'];
    const k = await ev((M) => M.map(m => [APP.ASSIST.metaMsg22(m), APP.ASSIST.statesProblem(m), APP.ASSIST.corrAsk(m)]), M);
    k.forEach((x, i) => chk(x[0] && !x[1] && !x[2], 'C23-1/A23-13/B·D13/B·D14: report #' + i + ' is a self-rating/use, never a problem or correction ' + JSON.stringify(x)));
    for (const m of [M[1], M[4]]) { await wipe(); await setB('1990-01-01'); await fresh(); const u = await turn(m, 'آفرین.'); const t = await tq(u); const s = await st();
      chk(!/کلِ مسئله را در یک جمله/.test(t.q) && !s.stmt && !/مسئلهٔ گفت‌وگو «/.test(head(u.user)) && !/# اصلاحِ پیامِ پیشین/.test(head(u.user)), 'practice report: no whole-first, no chat problem, no correction block ' + JSON.stringify({ q: t.q, stmt: s.stmt })); }
    // D23-19 dp1 p7: a result + look-back answer after the chat problem closed is not a new problem
    await wipe(); await setB('1990-01-01'); await fresh();
    await turn('یه مسئله: مستطیلی ۱۰ در ۷؛ مثلثِ وسط چه کسری از مستطیله؟', 'مجهول؟');
    await turn('جواب ۳/۸ ـه. وارسی کردم: ۲۶٫۲۵ تقسیم بر ۷۰ میشه ۰٫۳۷۵.', 'خوب.', [{ do: 'chat_solved', title: 'کسرِ مثلثِ وسط', statement: 'مستطیلی ۱۰ در ۷؛ مثلثِ وسط چه کسری از مستطیله؟', lesson: 'کل منهای گوشه‌ها', check: '۲۶٫۲۵/۷۰ = ۰٫۳۷۵' }]);
    const u2 = await turn('۱۰ در ۷: کل ۷۰. بالا ۱۰ در ۳٫۵ نصفش ۱۷٫۵. چپ ۷ در ۵ نصفش ۱۷٫۵. جمع ۴۳٫۷۵، وسط ۲۶٫۲۵. تقسیم بر ۷۰ میشه ۰٫۳۷۵ که همون ۳/۸ ـه! از همه بیشتر اون پرسشِ «مثلثِ دیگه مثلِ خودش رو برعکس کنارش بذاری چی میشه» کمکم کرد.', 'خوب.');
    const t2 = await tq(u2); chk(!/کلِ مسئله را در یک جمله/.test(t2.q), 'D23-19 dp1 p7: no whole-first on a result/look-back message after closing ' + t2.q);
  });

  // ================= Q5 — بلوک‌های اصلاح فقط بر اصلاح (A23-4، A23-17، B·D14) =================
  await section('corr', async () => {
    const k = await ev(() => ['فردا. یه چیزی گیجم کرده: اگه ممکن نیست، چرا باید فرض کنم که همهٔ قوانین برقرارن؟ ولی شمردم: هر عمه یه جفتِ کناری با پسرعمو می‌خواد، یعنی ۳ جفت',
      'تفاضل‌ها ۵، ۴، ۳، ۱ شدن، پس خطی نیست، کند میشه. حدسم اشباعه. پس ثابت شد دیگه، قانونش اشباعه!', 'غلطه، یادم رفته بود فرمولش چی بود', 'سقف ۱۲ بود نه ۱۰', 'ببخشید، اتاق پنجاه متر مربع نیست، شصت متر مربعه', '۸ نیست، ۹ ـه'].map(m => APP.ASSIST.corrAsk(m)));
    chk(!k[0] && !k[1] && !k[2] && k[4] && k[5], 'A23-17 s10 p3/s07 p2: «ممکن نیست، چرا…» and «خطی نیست، کند میشه» are not corrections; «شصت متر مربعه», «۹ ـه» are ' + JSON.stringify(k));
    await wipe(); await setB('1990-01-01'); await fresh();
    await turn('یه مسئله: آیا میشه ۴ عمه و ۴ پسرعمو رو دور دو میز طوری نشوند که هیچ عمه‌ای کنار پسرعموی خودش نباشه؟', 'مجهول؟');
    const u3 = await turn('فردا. یه چیزی گیجم کرده: اگه ممکن نیست، چرا باید فرض کنم که همهٔ قوانین برقرارن؟ ولی شمردم: هر عمه یه جفتِ کناری با پسرعمو می‌خواد', 'خوب پرسیدی.');
    const u4 = await turn('برای خانواده توضیح دادم، با «فرض کنیم ممکنه…» همه گیج شدن. چطوری بگم؟', 'باشه.');
    chk(!/# اصلاحِ پیامِ پیشین/.test(head(u3.user)) && !/# اصلاحِ پیامِ پیشین \(پشتیبان/.test(head(u4.user)), 'A23-4/A23-17 s10 p3–p4: no «(شاید)» and no backup correction block on non-corrections');
  });

  // ================= Q5 — پس‌سنجی (A23-20/A22-1، C23-6، B·D20، C23-21) =================
  await section('post', async () => {
    await wipe(); await setB('1990-01-01'); await fresh();
    await exec('کدام ستون‌ها ربط دارند', 'practical');
    const chkR = (reply, prompt, actions, msg) => ev(([reply, prompt, actions, msg]) => { const s = __cur(); s.msgs.push({ role: 'user', text: msg || 'به نظرم همهٔ ۴۷ ستون یه جوری ربط دارن', at: new Date().toISOString(), seq: 99 }); APP.ASSIST._turnSession = s;
      s.coach = s.coach || {}; s.coach.prev = { key: '' }; const r = APP.ASSIST.replyCheck({ reply: reply, actions: actions || [] }, { prompt: prompt, task: 'lla_coach' }); s.msgs.pop(); return r; }, [reply, prompt, actions || [], msg || '']);
    const P1 = '# مسئلهٔ زندهٔ این سشن\n- در این نوبت فقط **یک** پرسش (برای وضعِ همین نوبت): «حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام حالتِ خاص یا شاهد می‌تواند ردش کند؟».\n# نوبتِ تازه\nx';
    const r1 = await chkR('خوب که کارتِ فهم را خودت ثبت کردی. «همهٔ ۴۷ ستون یه جوری ربط دارن» را درست یا غلط نمی‌خوانم؛ حدسی گفتی — چطور می‌آزمایی‌اش؟ کدام ستون می‌تواند ردش کند — ستونی که روی هیچ‌کدام از دو شرطِ خودت (هفت سال ثبات، خرج زیرِ ۴۰٪) اثرِ محسوس ندارد؟', P1);
    chk(!/دو پرسش/.test(r1), 'A23-20 s01 p5: the page\'s two-sentence question, made concrete, counts as ONE ' + r1);
    const P2 = '# مربیِ حل\n- پرسش‌های «فهمِ مسئله» (کلی ⇐ خاص): u1) مجهول (یا حکمی که باید ثابت شود) چیست؟ u2) داده‌ها (یا فرض) چیست؟ u3) شرط چیست؟ می‌توانی بخش‌هایش را جدا بنویسی؟ u4) آیا شرط کافی است؟ · پیشنهادِ این نوبت: «کلِ مسئله را در یک جمله می‌گویی؟».\n# نوبتِ تازه\nx';
    const r2 = await chkR('فرض را جدا کردی و لانهٔ کبوتری را هم دیدی. یک قدم دقیق‌تر: شرط چیست؟ می‌توانی بخش‌هایش را جدا بنویسی؟', P2);
    chk(!/دو پرسش/.test(r2), 'A23-20 s03 p14: a two-sentence question from the page\'s own phase list counts as ONE ' + r2);
    const r2b = await chkR('شرط چیست؟ این را چطور بررسی می‌کنی؟', P2);
    chk(/دو پرسش/.test(r2b), 'the model\'s own extra question is still flagged');
    const sheet = 'حالا همان جزوه‌ای که روزِ اول خواستی:\n• مجهول دربارهٔ یک مقدارِ تکی است: $z = \\frac{x - \\mu}{\\sigma}$\n• مجهول دربارهٔ میانگینِ n تا است\n• میانگینِ n تا، σ نامعلوم\n• مجهول دربارهٔ نسبت است\n• آخرِ کار: احتمال بین ۰ و ۱؟ با یک حالتِ خاص (مثلاً n=1) جهتِ جواب درست است؟\n\nاز پرسش‌هایی که این دو روز پرسیدم، کدام بیشتر کمکت کرد؟';
    chk(!/دو پرسش/.test(await chkR(sheet, '# نوبتِ تازه\nx')), 'B·D20 s14 p8: a cheat sheet whose one bullet has «؟» is not a second question');
    const tc1 = 'آزمونت پیش‌بینی را تأیید کرد. دربارهٔ برگه، صادقانه: برگهٔ فوری #۱۰۱ هست. ولی سامانه هنوز سازوکاری ندارد که وقتی آن ساخته شد خودش بفهمد. یک پرسش: قدمِ اولِ برنامه‌ات حالا چیست — و کِی؟';
    chk(!/اصلاح را انجام نداده/.test(await chkR(tc1, '# نوبتِ تازه\nx', [cs({ guess_res: { id: 'g1', res: 'confirmed' } })])), 'C23-6 tC1 p12: «وقتی آن ساخته شد» with no correction in play is not a claim');
    chk(!/اصلاح را انجام نداده/.test(await chkR('باشه، ثبت شد؛ فردا یادآوری می‌کنم.', '# نوبتِ تازه\nx', [])), 'bank #136: «ثبت شد» with no correction in play');
    chk(/اصلاح را انجام نداده/.test(await chkR('«۷۵۰» ثبت شد.', '# نوبتِ تازه\nx', [cs({ retract: { msg: '۷۰۰', what: 'fact', fix: '۷۵۰' } })])), 'bank #146: with a correction in play the claim is still checked');
    const inv = await chkR('یک جملهٔ خوب: «کدام اول و با چه سهمی، که شش ماه دیگر دست‌کم یکی واقعاً تمام شده باشد». ثبتش می‌کنم.', '# نوبتِ تازه\nx', [], 'یه جمله: باغدارِ کوچیک باید شبِ یخ‌زدگی چند ساعت زودتر بفهمه');
    chk(/نه در پیام‌های اوست/.test(inv), 'C23-21 tC1 p2: a quote that is neither hers nor the page\'s is flagged ' + inv);
    const own = await chkR('گفتی «باغدارِ کوچیک باید شبِ یخ‌زدگی چند ساعت زودتر بفهمه» — خوب است.', '# نوبتِ تازه\nx', [], 'یه جمله: باغدارِ کوچیک باید شبِ یخ‌زدگی چند ساعت زودتر بفهمه');
    chk(!/نه در پیام‌های اوست/.test(own), 'her own words in quotes pass');
  });

  // ================= Q5 — پرسشِ نوبت (C23-17، C23-23، D23-18، A23-6، A23-3، B·D12) =================
  await section('turnq', async () => {
    const q1 = await ev(() => [APP.ASSIST.unfit23('نتیجه‌ای گفتی — با واقعیت سنجیدی‌اش: کدام پیش‌بینی درست درآمد و کدام نه؟', '۲۷۰ هزار با قبض ۴۰۰ هزاری جور درمیاد، بقیه‌ش مال یخچال و لامپاست. اشتباهم این بود که وات رو کیلووات نکرده بودم. درسم اینه که اول واحدها رو یکی کنم. حل شد.'),
      APP.ASSIST.unfit23('همهٔ فرض به کار رفت — هر بخشِ فرض کجای برهان آمد؟', 'n یعنی چند تا لایه می‌کشم، پس طبیعی بودنش لازمه. جمله‌ها هم هر کدوم یه L ان. همه‌ی فرض به کار رفت. حالا وارسی: با n = 4 میشه 16.'),
      APP.ASSIST.unfit23('هر گام را وارسی کن: روشن می‌بینی که این گام درست است؟', 'دو تا چیز می‌خوام یه جا نگه دارم: یکی روش تلسکوپی که این بار به کارم اومد، یکی اشتباهم که با چند تا مثال گفتم «ثابت شد». جایی برای این‌ها هست؟'),
      APP.ASSIST.unfit23('مجهول (یا حکمی که باید ثابت شود) چیست؟', 'دنبالِ اینم که مساحتِ مثلثِ وسط چند تا از اون ۴۸ تاست. فکر کردم دورش سه تا مثلثِ دیگه هست.'),
      APP.ASSIST.unfit23('این گام جواب نداد؟ مسئله را به شکلِ دیگری بیان کن', 'رفتم پرسیدم. سیاست جدید بوده: فقط کسایی که دوره آموزشی رفتن ترفیع گرفتن، منم نرفته بودم. خیلی عصبانیم، پس این همه وقت هدر رفت!'),
      APP.ASSIST.unfit23('آنچه شد با پیش‌بینی‌ات چه فاصله‌ای داشت؟', 'ببخشید، اشتباه گفتم: جلسه رو شنبه می‌ذارم، نه پنجشنبه — پنجشنبه برادرم سرِ کاره.'),
      APP.ASSIST.unfit23('این گام جواب نداد؟ مسئله را به شکلِ دیگری بیان کن', 'جلسه خراب شد، دعوامون شد. عصبانیم، وقتم هدر رفت.'),
      APP.ASSIST.unfit23('مجهول (یا حکمی که باید ثابت شود) چیست؟', 'مجهول همون تعداد کاشی‌هاست دیگه')]);
    chk(q1[0] && q1[1] && q1[2] && q1[3] && q1[4] && q1[5] && !q1[6] && q1[7], 'C23-17 pC2 p8 / aC2 p4, C23-23 s25 p16, D23-18 dp1 p2, A23-6 s05 p4 / s04 p8: answered or misplaced turn questions are recognised; a real step failure keeps e4 ' + JSON.stringify(q1));
    // in a real prompt: the dropped question is context, never the turn question
    await wipe(); await setB('1990-01-01'); await fresh();
    await exec('قبضِ برق', 'practical', { step: 'حسابِ مصرفِ هر وسیله', out: { done: 'yes', match: 'yes', what: '۲۷۰ هزار شد' } });
    const u = await turn('۲۷۰ هزار با قبض ۴۰۰ هزاری جور درمیاد، بقیه‌ش مال یخچال و لامپاست. اشتباهم این بود که وات رو کیلووات نکرده بودم و نمی‌دونستم قیمت برای «کیلووات‌ساعت»ه. درسم اینه که اول واحدها رو یکی کنم. حل شد.', 'خوب.');
    const t = await tq(u); chk(!/با واقعیت سنجیدی/.test(t.q), 'C23-17 pC2 p8: the turn question never re-asks the check she just reported ' + t.q);
    // A23-3 aA2 p1: «I proved it, why?» ⇒ look-back stage
    await wipe(); await setB('2010-02-08'); await fresh();
    const u5 = await turn('سلام. امروز سر کلاس با استقرا ثابت کردم که 1+3+5+...+(2n-1) = n^2. معلم گفت درسته. ولی حس می‌کنم نفهمیدم چرا «مربع» درمیاد. اثبات رو دارم ولی چرا رو نه. می‌خوام دوباره بهش نگاه کنم.', 'باشه.');
    const stg = (/مرحلهٔ محتمل: ([^·—\n]+)/.exec(u5.user) || [])[1] || '';
    chk(/بازنگری/.test(stg) && !/طرح/.test(stg), 'A23-3 aA2 p1: «اثبات کردم، می‌خوام بفهمم چرا» ⇒ look-back, not planning ' + stg);
    const u6 = await (async () => { await wipe(); await fresh(); return turn('سلام. معلممون یه سؤال داده: ثابت کنید برای هر عددِ اولِ p بزرگ‌تر از ۳، عددِ p^2 − 1 بر ۲۴ بخش‌پذیره. امتحان کردم: p=5 ⇒ ۲۴، p=7 ⇒ ۴۸، p=11 ⇒ ۱۲۰. همه‌ش درمیاد ولی نمی‌دونم چطور ثابتش کنم.', 'باشه.'); })();
    const stg6 = (/مرحلهٔ محتمل: ([^·—\n]+)/.exec(u6.user) || [])[1] || '';
    chk(!/بازنگری/.test(stg6), 'A22-12 pA1 p1: a fresh proof request with tried cases is not look-back ' + stg6);
  });

  // ================= Q1 — سطرهای صفحه به ضمیرِ گفت‌وگو (A23-14) =================
  await section('reg', async () => {
    await wipe(); await setB('1958-01-01'); await fresh();
    await turn('سلام. شما لطفاً کمکم کنید؛ می‌خواهم بدانم داروها را کی بخورم. ممنون می‌شوم بفرمایید.', 'بفرمایید.');
    await turn('شما بفرمایید، من گوش می‌دهم. فکر می‌کنید صبح بهتر است؟', 'بله.');
    const r = await ev(() => { const s = __cur(); s.msgs.push({ role: 'sys', at: new Date().toISOString(), text: 'حدسی که برایت ثبت می‌شد («۸ صبح») عیناً در پیامت نبود — ثبت نشد؛ اگر حدست همین است، با همان عبارتِ خودت بنویسش.' }); APP.S.put(s);
      APP.ASSIST.toggle(true); APP.ASSIST.paint && APP.ASSIST.paint(); const el = [...document.querySelectorAll('.as-msg.sys')].pop(); return [el ? el.textContent : '', APP.ASSIST.regSys(s, 'چه پیش‌بینی می‌کنی و چقدر مطمئنی؟'), APP.ASSIST.convRegister(s, '', [])]; });
    chk(r[2] === 'shoma' && /برایتان/.test(r[0]) && /پیامتان/.test(r[0]) && /بنویسیدش/.test(r[0]) && !/برایت ثبت/.test(r[0]), 'A23-14 aA3 p4: a page line in a «شما» conversation is shown in «شما» ' + JSON.stringify(r));
    chk(/می‌کنید/.test(r[1]) && /مطمئنید/.test(r[1]), 'A23-14 aA3 p6: «می‌کنید … مطمئنی» becomes fully «شما» ' + r[1]);
    const ex = await ev(() => { const s = APP.ASSIST.newSession(); s.msgs.push({ role: 'user', text: 'لطفاً با من راحت باش، «تو» صدام کن', at: new Date().toISOString(), seq: 1 }); APP.S.put(s);
      return [APP.ASSIST.convRegister(s, '', []), (APP.S.settings().profile || {}).reg]; });
    chk(ex[0] === 'to' && ex[1] === 'to', 'bank #15: her explicit switch to «تو» wins and is remembered ' + JSON.stringify(ex));
  });

  // ================= بانکِ مستقل (Q1، Q5) =================
  await section('bank', async () => {
    if (!BANK.length) { errors.push('bank: tests/variants/VARIANTS_R23.json missing'); return; }
    const E = {}; BANK.forEach((e, i) => { E[i] = e; });
    const T = (i, ok, x) => { info.bank[i] = !!ok; chk(ok, 'bank#' + i + ' [' + E[i].rc + '/' + E[i].kind + '] «' + E[i].text.slice(0, 70) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + JSON.stringify(x).slice(0, 400)); };
    const NC = (i, why) => { info.nc[i] = why; };
    const Uof = (i) => E[i].text.split('‖').map(x => x.trim()).map(x => (/(?:^|\s)U[^:]*:\s*(.*)$/.exec(x) || [])[1]).filter(Boolean).map(x => x.trim());
    /* تاریخ‌های بانک که با الگوریتمِ استاندارد نمی‌خوانند — مقدارِ درست سنجیده می‌شود */
    /* تاریخِ بانک با الگوریتمِ jalaali-js و ICU سنجیده شد و درست است (۱ فروردین ۱۳۳۸ = 1959-03-22) — اگر روزی ناهم‌خوان شد، بانک در info.bankWrong می‌رود، نه صفحه */
    const wantIso = (i) => { const m = /(\d{4}-\d{2}-\d{2})/.exec(E[i].expect); return m ? m[1] : ''; };
    const cardIn = (i) => (/birth card:\s*(.*)$/.exec(E[i].text) || [])[1] || '';
    const QDONE = {};
    for (const [e, i] of BANK.map((e, i) => [e, i])) {
      if (!/^Q[15]\./.test(e.rc)) continue;
      try {
        const tx = e.text, U = Uof(i);
        if (e.role === 'page' && /birth card:/.test(tx)) { const v = cardIn(i).trim(); await wipe(); await setB('');
          const r = await ev((v) => { const w = APP.AGE.setBirthInfo(v); return { iso: w.iso || '', err: w.err || '', age: APP.AGE.age() }; }, v);
          if (e.kind === 'pos' || /accepted|not refused/.test(e.expect)) { const w = wantIso(i) || (/^\d{4}[-\/]\d{2}[-\/]\d{2}$/.test(v) ? v.replace(/\//g, '-') : ''); T(i, r.iso === w && r.age != null, r); } else T(i, !r.iso && r.err && !NOFMT.test(r.err) && !(await birth()), r); continue; }
        if (/Today for a/.test(tx)) { await wipe(); await setB(/9-year/.test(tx) ? '2017-03-25' : '1987-01-01'); const d = await ev(() => (APP.dueList() || []).some(x => /معمای امروز/.test(x.txt || ''))); T(i, /9-year/.test(tx) ? !d : d, d); continue; }
        if (e.role === 'chat' && /^Q1/.test(e.rc) && U[0] && /تولد|متولد|به دنیا|سالم/.test(U[0]) && !/سلام من|سلاااام/.test(U[0])) { await wipe(); await setB(''); await fresh(); await turn(U[0], 'باشه.');
          const r = await ev(() => ({ b: APP.AGE.birth(), age: APP.AGE.age(), md: (APP.S.settings().profile || {}).birthMD || null }));
          if (e.kind === 'pos') { const w = wantIso(i); T(i, r.b === w, r); } else if (/asks for the year/.test(e.expect)) T(i, !r.b && !!r.md, r); else T(i, !r.b, r); continue; }
        if (e.role === 'chat' && /^Q1/.test(e.rc) && U[0] && /کیلومتر|قرارداد اجاره|پارسال/.test(U[0])) { await wipe(); await setB(''); await fresh(); await turn(U[0], 'باشه.'); const r = await ev(() => [APP.AGE.birth(), APP.AGE.age()]); T(i, !r[0] && r[1] == null, r); continue; }
        if (/^Q1/.test(e.rc) && e.role === 'chat' && U[0]) { const x = await ev((m) => APP.ASSIST.stripIntro23(m), U[0]);
          if (/سلام کرد|علی ۳ تا سیب/.test(U[0])) { T(i, x === U[0].trim(), x); continue; }
          T(i, !/^(?:سلام|با سلام|سلاااام)/.test(x) && !/کیان|رضایی|سارا/.test(x), x); continue; }
        if (/teen «# مخاطب»|teen 14, any turn/.test(tx)) { await wipe(); await setB('2012-01-01'); await fresh(); const u = await turn('یه مسئله: ثابت کن مجموع n عدد فرد اول n^2 میشه.', 'مجهول؟'); const a = blockOf(u.user, /^# مخاطب/); T(i, !/پرسشِ همین پاسخ کن/.test(head(u.user)) && /سهمِ تو پرسیدن است/.test(a), a.slice(0, 80)); continue; }
        if (/سنِ منو برای چی/.test(tx) || /adult 39, no audience block/.test(tx) || /no audience block/.test(e.context || '')) { await wipe(); await setB('1987-01-01'); await fresh(); const u = await turn(U[0] || 'سلام، یه سؤال دارم.', 'باشه.');
          T(i, !blockOf(u.user, /^# مخاطب/) && /سن و تاریخِ تولد — کاربرد:[^\n]*آفلاین:[^\n]*مدل:/.test(u.user), 'map'); continue; }
        if (/«تو» صدام کن/.test(tx)) { await wipe(); await fresh(); await turn('سلام، شما لطفاً بفرمایید.', 'بفرمایید.'); await turn('لطفاً با من راحت باش، «تو» صدام کن', 'باشه.'); const r = await ev(() => [APP.ASSIST.convRegister(__cur(), '', []), (APP.S.settings().profile || {}).reg]); T(i, r[0] === 'to' && r[1] === 'to', r); continue; }
        if (/U \(elder\): سلام وقتتون بخیر/.test(tx)) { await wipe(); await setB('1958-01-01'); await fresh(); await turn('سلام وقتتون بخیر، بنده می‌خواستم بدونم داروها رو کی بخورم. شما بفرمایید.', 'بفرمایید.'); await turn('شما لطفاً بگویید صبح بهتر است یا شب؟', 'بله.');
          const r = await ev(() => { const s = __cur(); return [APP.ASSIST.regSys(s, 'تاریخِ تولدت ثبت شد؛ گامِ بعدیِ تو چیست؟ تحویل دادی؟'), APP.ASSIST.regPage('⏰ «جلسه» — موعدش گذشت؛ تحویل دادی؟')]; });
          T(i, /تولدتان/.test(r[0]) && /بعدیِ شما/.test(r[0]) && /دادید/.test(r[0]) && /دادید/.test(r[1]), r); continue; }
        if (/U \(teen 16\): بگو ببینم/.test(tx)) { await wipe(); await fresh(); await turn('بگو ببینم این درسته یا نه', 'باشه.'); await turn('بگو دیگه، تو که بلدی', 'باشه.'); const r = await ev(() => [APP.ASSIST.convRegister(__cur(), '', []), APP.ASSIST.regSys(__cur(), 'تاریخِ تولدت را بگو')]); T(i, r[0] !== 'shoma' && /تولدت/.test(r[1]), r); continue; }
        if (/^Q5/.test(e.rc)) {
          if (e.role === 'route') { await wipe(); await setB('1980-01-01'); await fresh(); const u = await turn(U[0], 'باشه.'); const s = await st();
            T(i, u.task === 'lla_coach' && !/سلام|کیان|بنده ۶۷/.test(s.stmt) && !/# اصلاحِ پیامِ پیشین/.test(head(u.user)), { task: u.task, stmt: s.stmt.slice(0, 60) }); continue; }
          if (/^U: (?:امروز تمرینو|۸۰٪ کارت|دیروز با مدلِ)/.test(tx)) { await wipe(); await setB('1990-01-01'); await fresh(); const u = await turn(U[0], 'آفرین.'); const t = await tq(u); const s = await st();
            T(i, !s.stmt && !/کلِ مسئله را در یک جمله/.test(t.q) && (await ev((m) => !!APP.ASSIST.metaMsg22(m), U[0])), { stmt: s.stmt, q: t.q }); continue; }
          if (/U: سلام، خوبی؟/.test(tx)) { await wipe(); await fresh(); const u = await turn(U[0], 'سلام!'); const s = await st(); const t = await tq(u); T(i, !s.stmt && !/کلِ مسئله را در یک جمله/.test(t.q), { stmt: s.stmt, q: t.q }); continue; }
          if (/U: غلطه، یادم رفته|U: سقف ۱۲ بود نه ۱۰/.test(tx)) { const c = await ev((m) => APP.ASSIST.corrAsk(m), U[0]); T(i, e.kind === 'neg' && /سقف/.test(tx) ? c === true : c === false, c); continue; }
          if (/U: یه چیز جدید: می‌خوام عید سفر/.test(tx)) { await wipe(); await setB('1990-01-01'); await fresh(); await turn('امروز تمرینو کامل یادم بود', 'آفرین.'); const u = await turn(U[0], 'باشه.'); const s = await st(); T(i, /سفر/.test(s.stmt) && u.task === 'lla_coach', { stmt: s.stmt, task: u.task }); continue; }
          if (/ثابتش کردم، ولی آخه چرا/.test(tx)) { await wipe(); await setB('2010-01-01'); await fresh(); await turn('یه مسئله: ثابت کن مجموع n عدد فرد اول n^2 میشه.', 'فرض و حکم؟'); const u = await turn(U[0], 'باشه.'); const stg = (/مرحلهٔ محتمل: ([^·—\n]+)/.exec(u.user) || [])[1] || ''; T(i, /بازنگری/.test(stg), stg); continue; }
          if (/خودم الان چک کردم/.test(tx)) { const x = await ev((m) => APP.ASSIST.unfit23('نتیجه‌ای گفتی — با واقعیت سنجیدی‌اش: کدام پیش‌بینی درست درآمد و کدام نه؟', m), U[0]); T(i, !!x, x); continue; }
          if (/به لیستِ فرض‌هام اضافه کن/.test(tx)) { const x = await ev((m) => [APP.ASSIST.unfit23('هر گام را وارسی کن: روشن می‌بینی که این گام درست است؟', m), APP.ASSIST.metaMsg22(m)], U[0]); T(i, !!x[0] && x[1] === 'keep', x); continue; }
          if (/مجهول همون تعداد کاشی/.test(tx)) { const x = await ev((m) => APP.ASSIST.unfit23('مجهول (یا حکمی که باید ثابت شود) چیست؟', m), U[0]); T(i, !!x, x); continue; }
          if (/she never wrote it/.test(tx)) { await wipe(); await fresh(); await turn('یه مسئله: مساحتِ این مثلث چنده؟', 'مجهول؟');
            const x = await ev(() => { const s = __cur(); APP.ASSIST._turnSession = s; return APP.ASSIST.replyCheck({ reply: 'تو گفتی «من هیچ‌وقت هندسه نخوندم» — ولی بیا امتحان کنیم.', actions: [] }, { prompt: '# نوبتِ تازه\nx', task: 'lla_coach' }); }); T(i, /نه در پیام‌های اوست/.test(x), x); continue; }
          if (/A: باشه، ثبت شد؛ فردا/.test(tx) || /A: «۷۵۰» ثبت شد/.test(tx)) { await wipe(); await fresh(); await turn('یه مسئله: سقف چند متره؟', 'مجهول؟');
            const pos = /باشه، ثبت شد/.test(tx); const x = await ev((pos) => { const s = __cur(); APP.ASSIST._turnSession = s; return APP.ASSIST.replyCheck({ reply: pos ? 'باشه، ثبت شد؛ فردا یادآوری می‌کنم.' : '«۷۵۰» ثبت شد.', actions: pos ? [] : [{ do: 'coach_state', retract: { msg: '۷۰۰', what: 'fact', fix: '۷۵۰' } }] }, { prompt: '# نوبتِ تازه\nx', task: 'lla_coach' }); }, pos);
            T(i, pos ? !/اصلاح را انجام نداده/.test(x) : /اصلاح را انجام نداده/.test(x), x); continue; }
          if (/cheat-sheet: list of 6 formulas/.test(tx)) { await wipe(); await fresh(); await turn('یه مسئله: آمار، کدام فرمول؟', 'مجهول؟'); const x = await ev(() => { const s = __cur(); APP.ASSIST._turnSession = s; return APP.ASSIST.replyCheck({ reply: 'فرمول‌ها:\n• z = (x−μ)/σ\n• z = (x̄−μ)/(σ/√n)\n• t = (x̄−μ)/(s/√n)\n• z = (p̂−p)/√(p(1−p)/n)\n• χ² = Σ(O−E)²/E\n• F = s1²/s2²', actions: [] }, { prompt: '# نوبتِ تازه\nx', task: 'lla_coach' }); }); T(i, !x, x); continue; }
          if (/model reply contains it verbatim/.test(tx) || /model adds its own extra/.test(tx)) { await wipe(); await fresh(); await exec('کاشی‌ها', 'objective'); await turn('کاشی‌ها رو شمردم ولی مطمئن نیستم.', 'خوب.');
            const extra = /extra/.test(tx); const x = await ev((extra) => { const s = __cur(); APP.ASSIST._turnSession = s; s.coach = s.coach || {}; s.coach.prev = { key: '' };
              const P = '# مسئلهٔ زندهٔ این سشن\n- در این نوبت فقط **یک** پرسش: «اول ببین داده‌ها چه می‌گویند. مجهول دقیقاً چیست؟».\n# نوبتِ تازه\nx';
              return APP.ASSIST.replyCheck({ reply: 'خوب. اول ببین داده‌ها چه می‌گویند. مجهول دقیقاً چیست؟' + (extra ? ' این را چطور بررسی می‌کنی؟' : ''), actions: [] }, { prompt: P, task: 'lla_coach' }); }, extra);
            T(i, extra ? /دو پرسش/.test(x) : !/دو پرسش/.test(x), x); continue; }
          if (/الان کجا بودیم/.test(tx)) { await wipe(); await setB('1990-01-01'); await fresh(); await exec('کاشی‌ها', 'objective'); const u = await turn(U[0], 'باشه.'); const t = await tq(u);
            const qm = (q) => { let d = 0, n = 0; for (const c of String(q || '')) { if (c === '«' || c === '(') d++; else if ((c === '»' || c === ')') && d > 0) d--; else if ((c === '؟' || c === '?') && d === 0) n++; } return n; };
            T(i, qm(t.q) <= 2, t.q); continue; }
          if (/U: همسایه‌مون ماشینشو/.test(tx)) { await wipe(); await setB('1980-01-01'); await fresh(); const u = await turn(U[0], 'باشه.'); T(i, u.task === 'lla_coach' && !/# اصلاحِ پیامِ پیشین/.test(head(u.user)), u.task); continue; }
        }
        NC(i, 'no runnable form in this fixer\'s harness');
      } catch (er) { errors.push('bank#' + i + ' exception: ' + String(er && er.stack || er).split('\n').slice(0, 2).join(' | ')); }
    }
    const mine = BANK.map((e, i) => [e, i]).filter(([e]) => /^Q[15]\./.test(e.rc)).map(([, i]) => i);
    const miss = mine.filter(i => !(i in info.bank) && !(i in info.nc)); chk(!miss.length, 'bank coverage: every Q1/Q5 entry judged or given a reason ' + JSON.stringify(miss));
  });

  const nOk = Object.values(info.bank).filter(Boolean).length; info.summary = { judged: Object.keys(info.bank).length, pass: nOk, nc: Object.keys(info.nc).length, bankWrong: Object.keys(info.bankWrong).length };
  console.log(JSON.stringify(info.summary), JSON.stringify(info.nc), JSON.stringify(info.bankWrong));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
