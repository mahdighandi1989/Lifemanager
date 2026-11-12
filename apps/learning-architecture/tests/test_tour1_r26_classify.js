// تورِ پولیا (دستهٔ ۱، دورِ ۲۶، سهمِ «classify» — ۲۰۲۶-۱۱-۱۲) — DECISIONS_R26 Q9 + Q10: دادهٔ شخصی (C22)، عنوان، ضمیر، سنجشِ پس از پاسخ، برچسب‌های کارنامه، سازوکارهای کوچک
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۶ (پرامپت‌ها در round26X/<sid>/ai/pN.json): C26-22/C26-21 (aC1 p10)، C26-29 (aC4)، C26-13 (pwC2)، U29 (bp3)، U37 (s12)، U53 (aB4 p7)، D26-40 (s35)،
//           C26-6 (pwC1 p8)، C26-17 (s25 p18، aC3 p6)، D26-33 (s32)، D26-53 (aD4)، U55 (oB1 p11/p13، aB4 p8، aB3 p14)، U23/U24/U30/U46 (کارنامهٔ ذهن)، U54 (aB4)، C26-32، C26-34، C26-42، C26-33
//  bank     همهٔ ورودی‌های Q9/Q10 در بانکِ مستقلِ tests/variants/VARIANTS_R26.json؛ آن‌چه برآورده نشد با دلیل در info.nc — هیچ ورودی‌ای بی‌صدا رد نمی‌شود.
//  ساعتِ صفحه یخ زده است (APP.today = روزِ ثابت) — هیچ انتظاری به تاریخِ تقویم بسته نیست.
// LLA_FILE = ساختِ دیگر؛ ONLY=name1,name2
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = [process.env.LLA_VARIANTS26, path.join(__dirname, 'variants', 'VARIANTS_R26.json')].find(f => f && fs.existsSync(f));
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

  if (process.env.PROBE) { try { await require(process.env.PROBE)({ p, ev, turn, fresh, wipe, st, tq, exec, setB, rc, bd, birthFor, sysDom, sysStored, pushSys, follow, head, blockOf, T0 }); } catch (e) { console.log('PROBE EXC', e && e.stack || e); } await b.close(); return; }

  const views = (vs, re) => ev(([vs, re]) => { const o = [], R = new RegExp(re); vs.forEach(v => { APP.go(v); document.body.innerText.split('\n').filter(l => R.test(l)).forEach(l => o.push(v + ': ' + l.slice(0, 140))); }); return o; }, [vs, re]);
  const TILE = 'سلام من آرینم کلاس سومم. معلممون این سؤال رو داده: «من و داداشم روی هم ۲۴ تا تیله داریم. تیله‌های من ۳ برابرِ تیله‌های داداشمه. هر کدوم چند تا تیله داریم؟» من گفتم ۱۲ تا و ۱۲ تا ولی مامانم گفت غلطه. چرا غلطه؟';
  const SCHOOL = 'من مدرسهٔ شهید بهشتیِ کرج می‌رم. اون «معمای امروز» که تو صفحه‌ست مالِ بچه‌ها هم هست؟ می‌تونم حلش کنم؟';

  // ================= Q9 · C22 — C26-22 / C26-21 (aC1 p10): نامِ مدرسهٔ کودک عنوان نمی‌شود؛ پرسش دربارهٔ صفحه مسئله نیست =================
  await section('pii', async () => {
    await wipe(); await setB('2017-04-03'); await fresh();
    await turn(TILE, 'خوب.');
    await turn('۶ و ۶ و ۶ میشه ۱۸، آره ۳ برابره! ۱۸ و ۶ هم میشه ۲۴. درسته! پس ۱۲ و ۱۲ غلط بود چون ۱۲ سه برابرِ ۱۲ نیست. یاد گرفتم اول جعبه بکشم، بعد پخش کنم.', 'خوب.',
      [{ do: 'chat_solved', title: 'تیله‌های من و داداشم', statement: 'من و داداشم روی هم ۲۴ تا تیله داریم. تیله‌های من ۳ برابرِ تیله‌های داداشمه. هر کدوم چند تا تیله داریم؟', kind: 'find', lesson: 'یاد گرفتم اول جعبه بکشم، بعد پخش کنم', check: '۶ و ۶ و ۶ میشه ۱۸، آره ۳ برابره! ۱۸ و ۶ هم میشه ۲۴' }, { do: 'coach_state', ph: 'b', said: ['result'], ans: [], nat: 'objective', role: 'self' }]);
    const pid = await ev(() => (APP.liveAll()[0] || { p: {} }).p.id);
    await turn('کشیدنِ جعبه‌ها! چون وقتی کشیدم دیدم ۴ تا جعبه‌ست نه ۲ تا. امتحان کردن رو هم دوست داشتم.', 'خوب.', [{ do: 'chat_lookback', pid, bestQ: 'کشیدنِ جعبه‌ها', taste: 'امتحان کردن رو هم دوست داشتم' }]);
    const u = await turn(SCHOOL, 'لازم نیست نامِ مدرسه‌ات را بنویسی.', [{ do: 'go', view: 'psy_item' }]);
    const s1 = await st(), q1 = (await tq(u)).q, seen = await views(['home', 'mind', 'e_prob', 'psy_item'], 'شهید بهشتی');
    chk(!/شهید بهشتی/.test(s1.stmt), 'C26-22 aC1 p10: the child\'s school name is not held as the chat-problem statement/title — ' + s1.stmt.slice(0, 80));
    chk(!seen.length, 'C26-22: the school name is on no page view (Today / mind card / problems / puzzle strip) — ' + JSON.stringify(seen).slice(0, 300));
    chk(!s1.stmt, 'C26-21 aC1 p10: a question about a page part («معمای امروز» که تو صفحه‌ست) is not a new chat problem — ' + s1.stmt.slice(0, 80));
    chk(!/کلِ مسئله را در یک جمله/.test(q1), 'C26-21: no A191 «کلِ مسئله را در یک جمله» turn question for a page question — ' + q1.slice(0, 80));
    const hers = (await ev(() => __msgs())).filter(m => m.role === 'user').pop().text;
    chk(hers === SCHOOL, 'her own message in the chat is untouched');
    // classifier pairs (positive + look-alike negative)
    const C = await ev((X) => X.map(t => [APP.ASSIST.notProblem(t), APP.ASSIST.statesProblem(t)]), [
      'اون «معمای امروز» که تو صفحه‌ست مالِ بچه‌ها هم هست؟ می‌تونم حلش کنم؟',
      'معمای امروزِ روزنامه رو نتونستم حل کنم: ۸ تا سکه داریم که یکیش سبک‌تره، با دو بار وزن کردن چطور پیداش کنم؟',
      'این «کارنامهٔ ذهن» توی برنامه چی رو نشون میده؟',
      'یه معما دارم: سه نفر از یه پل رد میشن و فقط یه چراغ دارن. چطور همه رد بشن؟']);
    chk(C[0][0] && !C[0][1], 'page question ⇒ notProblem — ' + JSON.stringify(C[0]));
    chk(!C[1][0] && C[1][1], 'look-alike: a newspaper puzzle with data and no page reference stays a problem — ' + JSON.stringify(C[1]));
    chk(C[2][0], 'page question about a named view ⇒ notProblem — ' + JSON.stringify(C[2]));
    chk(!C[3][0] && C[3][1], 'look-alike: her own puzzle stays a problem — ' + JSON.stringify(C[3]));
    // intro clause: school attendance with a name is identity, without a name it is data
    const I = await ev((X) => X.map(t => APP.ASSIST.stripIntro23(t)), [
      'من مدرسهٔ شهید بهشتیِ کرج می‌رم. یه مسئله دارم: ۱۲ تا مداد رو بین ۳ نفر چطور تقسیم کنم؟',
      'من مدرسه می‌رم و هر روز ۲ ساعت تو راهم؛ چطور این ۲ ساعت رو کم کنم؟']);
    chk(!/شهید بهشتی/.test(I[0]) && /۱۲ تا مداد/.test(I[0]), 'school-attendance clause with a name is an identity clause — ' + I[0].slice(0, 80));
    chk(/^من مدرسه می‌رم/.test(I[1]), 'look-alike: «من مدرسه می‌رم و هر روز ۲ ساعت تو راهم» (no name, data of the problem) stays — ' + I[1].slice(0, 60));
    // C22 placeholder — every age, titles and labels
    const L = await ev((X) => X.map(t => APP.AGE.privLabel(t)), [
      'پسرم دبستانِ شهید رجایی می‌ره و شهریه‌ش ۴۰ میلیونه؛ با حقوقِ ۳۰ میلیون چطور بدم؟',
      'معلممون خانم احمدی این سؤال رو داده: ۱۲ سیب بین ۳ نفر',
      'خانم کریمی معلمِ ریاضیِ دخترمه و میگه دخترم ضعیفه؛ چیکار کنم؟',
      'اسمِ دوستم سارا ـه و ۵ تا سیب ازم قرض گرفته؛ چند تا بدهکاره؟',
      'یه همکاری دارم به اسمِ کامران که هر روز دیر میاد؛ چطور بهش بگم؟',
      'علی ۳ تا سیب داره و مریم ۵ تا؛ روی هم چند تا؟',
      'تو مدرسه معلم گفت این مسئله رو حل کنیم: ۲۴ تقسیم بر ۴',
      'یادمه یه چیزی بود به اسمِ ک.م.م ولی یادم نیست چطوری حساب می‌شد',
      'مدرسه ۴۰۰ دانش‌آموز داره و ۲۰ کلاس؛ هر کلاس چند نفر؟']);
    chk(/دبستانِ \[نامِ مدرسه\]/.test(L[0]) && !/رجایی/.test(L[0]) && /۴۰ میلیون/.test(L[0]), 'C22: a child\'s school name ⇒ «[نامِ مدرسه]» (parent speaking) — ' + L[0]);
    chk(/خانم \[نامِ معلم\]/.test(L[1]) && !/احمدی/.test(L[1]) && /۱۲ سیب/.test(L[1]), 'C22: teacher name after the role ⇒ «[نامِ معلم]» — ' + L[1]);
    chk(/\[نامِ معلم\]/.test(L[2]) && !/کریمی/.test(L[2]), 'C22: teacher name before the role ⇒ «[نامِ معلم]» — ' + L[2]);
    chk(/\[نام\]/.test(L[3]) && !/سارا/.test(L[3]) && /۵ تا سیب/.test(L[3]), 'C22: a third party she names («اسمِ دوستم …») ⇒ «[نام]» — ' + L[3]);
    chk(/\[نام\]/.test(L[4]) && !/کامران/.test(L[4]), 'C22: «همکاری به اسمِ …» ⇒ «[نام]» — ' + L[4]);
    chk(L[5] === 'علی ۳ تا سیب داره و مریم ۵ تا؛ روی هم چند تا؟', 'look-alike: characters of a problem stay — ' + L[5]);
    chk(L[6] === 'تو مدرسه معلم گفت این مسئله رو حل کنیم: ۲۴ تقسیم بر ۴', 'look-alike: common nouns «مدرسه/معلم» stay — ' + L[6]);
    chk(/ک\.م\.م/.test(L[7]) && !/\[نام/.test(L[7]), 'look-alike: «یه چیزی به اسمِ ک.م.م» (a thing, not a person) stays — ' + L[7]);
    chk(!/\[نام/.test(L[8]), 'look-alike: «مدرسه ۴۰۰ دانش‌آموز داره» stays — ' + L[8]);
    // an adult's real problem that names her child's school: the held statement carries the placeholder, her message does not
    await wipe(); await setB(''); await fresh();
    const M = 'پسرم دبستانِ شهید رجایی می‌ره و شهریه‌ش ۴۰ میلیونه؛ با حقوقِ ۳۰ میلیون چطور بدم؟';
    await turn(M, 'خوب.'); const s2 = await st(), seen2 = await views(['home', 'mind', 'e_prob'], 'رجایی'), m2 = (await ev(() => __msgs())).filter(m => m.role === 'user').pop().text;
    chk(/\[نامِ مدرسه\]/.test(s2.stmt) && !/رجایی/.test(s2.stmt) && /۴۰ میلیون/.test(s2.stmt), 'C22: the held statement of a real problem shows the placeholder, the data stays — ' + s2.stmt.slice(0, 90));
    chk(!seen2.length && m2 === M, 'C22: no view shows the school name; her message is untouched — ' + JSON.stringify(seen2).slice(0, 200));
    await ev(() => { const s = __cur(); s.title = 'شهریهٔ دبستانِ شهید رجایی'; APP.S.put(s); const r = APP.liveCreate('نمرهٔ دخترم پیشِ معلمش خانم کریمی', 'صورت — آزمون.', 'find', { by: 'user' }); window.__lt = APP.liveRec(r.p.id).p.title; });
    const t3 = await ev(() => [__cur().title, __lt]);
    chk(!/رجایی/.test(t3[0]) && /\[نامِ مدرسه\]/.test(t3[0]), 'C22: a session title given by the model is masked at write — ' + t3[0]);
    chk(!/کریمی/.test(t3[1]) && /\[نامِ معلم\]/.test(t3[1]), 'C22: a live-problem title is masked at write — ' + t3[1]);
  });

  // ================= Q9 — عنوان‌ها: سلام، معرفی و جملهٔ تولد عنوان نمی‌شوند (U29 bp3 s28، C26-13 pwC2، C26-29 aC4) =================
  await section('titles', async () => {
    const X = ['سلام! امروز برگه‌ی سفید رو از حافظه نوشتم: فیثاغورس و مساحت مثلث رو درست نوشتم، ولی جذر ۸۱ رو ۸ گفتم که غلطه، ۹ میشه. یعنی دوتا از سه تا.',
      'سلام، من مریمم، ۳۴ سالمه و حسابدارم. سه تا چیز ذهنمو مشغول کرده: ۱) یه مسئلهٔ آمار تو دورهٔ آنلاینم',
      'من متولدِ ۱۰ مرداد ۲۴ ام؛ مدرسه خیلی وقت پیش بود. یادمه یه چیزی بود به اسمِ «ک.م.م»، ولی یادم نیست چطوری حساب می‌شد. عینکمم ضعیفه، لطفاً کوتاه بنویسید.',
      'هر کی به همه سلام کرد؛ ۱۰ نفر بودن، چند تا سلام شد؟'];
    const Tt = await ev((X) => X.map(t => APP.AGE.titleOf(t)), X);
    chk(/^امروز برگه‌ی سفید/.test(Tt[0]), 'U29 bp3 s28: the fallback title has no greeting — ' + Tt[0].slice(0, 50));
    chk(/^سه تا چیز ذهنمو/.test(Tt[1]), 'C26-13 pwC2: the title has no self-introduction — ' + Tt[1].slice(0, 50));
    chk(!/متولد/.test(Tt[2]) && /ک\.م\.م/.test(Tt[2]), 'C26-29 aC4: a birth sentence is not the title — ' + Tt[2].slice(0, 60));
    chk(Tt[3] === X[3], 'look-alike: «سلام» inside the problem stays in the title — ' + Tt[3]);
    // the page: session list, session dossier title (the «برگرد به» strip reads it), the «مسئله‌های این گفت‌وگو» list
    await wipe(); await setB(''); await fresh();
    await turn(X[0], 'خوب.');
    const d1 = await ev(() => { const D = APP.dossierSess(__cur().id); APP.ASSIST.toggle(true); return { t: D && D.title }; });
    chk(d1.t && !/^سلام/.test(d1.t) && /برگه‌ی سفید/.test(d1.t), 'U29: the session dossier title (breadcrumb) has no greeting — ' + d1.t);
    await wipe(); await fresh();
    await ev(([a, b]) => { const s = __cur(), at = (i) => new Date(Date.UTC(2026, 9, 19, 8, i)).toISOString(); s.msgs.push({ role: 'user', text: a, at: at(0) }, { role: 'ai', text: 'خوب.', at: at(1) }, { role: 'user', text: b, at: at(2) }, { role: 'ai', text: 'خوب.', at: at(3) });
      s.coach = { pk: 'c:2', gen: 2, stmt: 'x', pkLog: [{ pk: 'c:1', at: at(0) }, { pk: 'c:2', at: at(2) }] }; APP.S.put(s); }, [X[1], X[2]]);
    const d2 = await ev(() => { const D = APP.dossierSess(__cur().id, 'c:2'), D1 = APP.dossierSess(__cur().id, 'c:1'); return { pks: (D.pks || []).map(x => x.title), t2: D.title, t1: D1.title }; });
    chk(d2.pks.length === 2 && !d2.pks.some(t => /^سلام|مریمم|متولد/.test(t)), 'C26-13 / C26-29: the «مسئله‌های این گفت‌وگو» list shows neither greeting, introduction nor birth sentence — ' + JSON.stringify(d2.pks));
    chk(!/متولد/.test(d2.t2) && !/مریمم/.test(d2.t1), 'C26-29: the dossier title of each chat problem (the «برگرد به» strip) likewise — ' + d2.t1 + ' | ' + d2.t2);
  });

  //SECTIONS

  console.log(JSON.stringify(info.summary || {}), JSON.stringify(info.nc), JSON.stringify(info.note || {}));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
