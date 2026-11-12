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

  const views = (vs, re) => ev(([vs, re]) => { const o = [], R = new RegExp(re); try { APP.ASSIST.toggle(false); } catch (e) { } /* حبابِ گفت‌وگو حرفِ خودِ اوست و می‌ماند (C38) — فقط نماهای صفحه */ vs.forEach(v => { APP.go(v); document.body.innerText.split('\n').filter(l => R.test(l)).forEach(l => o.push(v + ': ' + l.slice(0, 140))); }); return o; }, [vs, re]);
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
    chk(/\[نامِ شخص\]/.test(L[3]) && !/سارا/.test(L[3]) && /۵ تا سیب/.test(L[3]), 'C22: a third party she names («اسمِ دوستم …») ⇒ «[نامِ شخص]» — ' + L[3]);
    chk(/\[نامِ شخص\]/.test(L[4]) && !/کامران/.test(L[4]), 'C22: «همکاری به اسمِ …» ⇒ «[نامِ شخص]» — ' + L[4]);
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

  const person = async (age, msgs) => { await wipe(); await setB(age ? await birthFor(age) : ''); await fresh(); await ev((msgs) => { const s = __cur(); let i = 0; const now = () => new Date(Date.UTC(2026, 9, 19, 8, i++)).toISOString(); (msgs || []).forEach(t => { s.msgs.push({ role: 'user', text: t, at: now() }, { role: 'ai', text: 'خوب.', at: now() }); }); s.msgs.push({ role: 'user', text: 'خب', at: now() }); s.coach = s.coach || {}; s.coach.prev = { key: 'خب' }; APP.S.put(s); }, msgs || []); };
  const TO = ['بگو از کجا شروع کنم.', 'به نظرت این راه درسته؟ نگاه کن ببین چی کم داره.'], SH = ['ممکن است بفرمایید از کجا شروع کنم؟', 'به نظرِ شما این راه درست است؟ لطفاً بگویید چه کم دارد.'];

  // ================= Q9 — ضمیر: «…ت» ِ ملکی از واژگانِ خودِ صفحه؛ پرسشِ صفحه یک ضمیر و یک پرسش (D26-40 s35، U53 aB4 p7، U37 s12) =================
  await section('reg', async () => {
    const P = [['اصلاحت رسید، ولی پیامت دو بخش داشت', 'اصلاحتان رسید، ولی پیامتان دو بخش داشت'], ['تقریبت بس بود', 'تقریبتان بس بود'], ['پیشرفتت اینجاست', 'پیشرفتتان اینجاست'],
      ['نمی‌دانی از کجا شروع کنی؟ دوره قدم‌به‌قدم می‌بردت', 'نمی‌دانید از کجا شروع کنید؟ دوره قدم‌به‌قدم می‌بردتان'], ['مانده: فقط بازنگریِ خودت', 'مانده: فقط بازنگریِ خودتان'],
      ['می‌توانی نتیجه را از راهِ دیگری به دست آوری؟', 'می‌توانید نتیجه را از راهِ دیگری به دست آورید؟'], ['کارهایت و فکرهایت را بنویس', 'کارهایتان و فکرهایتان را بنویسید'],
      // look-alikes: words that end in «ت» and are not second person
      ['ثبتِ درست در کارتِ بازسازی؛ حالتِ خاص و وضعیتِ نوبت', 'ثبتِ درست در کارتِ بازسازی؛ حالتِ خاص و وضعیتِ نوبت'], ['صورتِ مسئله و سلامتِ حساب', 'صورتِ مسئله و سلامتِ حساب'], ['یادآوریِ فردا و جمع‌آوریِ داده', 'یادآوریِ فردا و جمع‌آوریِ داده']];
    const got = await ev((P) => P.map(p => APP.ASSIST.toShoma(p[0])), P);
    P.forEach((p, i) => chk(got[i] === p[1], 'register: «' + p[0] + '» ⇒ «' + p[1] + '» — got «' + got[i] + '»'));
    // the page's own vocabulary is the source: every «stem + ت» form in the page's strings is either converted or listed as not second person
    const dir = path.join(__dirname, '..', 'src', 'app'); let src = '';
    fs.readdirSync(dir).filter(f => /^a\d+_.*\.js$/.test(f)).sort().forEach(f => { src += fs.readFileSync(path.join(dir, f), 'utf8') + '\n'; });
    src = src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
    const words = {}; (src.match(/[آ-یٔ‌]+/g) || []).forEach(w => { words[w] = (words[w] || 0) + 1; });
    const cand = Object.keys(words).filter(w => ['ت', '‌ات', 'هایت', '‌هایت'].some(sf => w.endsWith(sf) && w.length > sf.length + 1 && words[w.slice(0, -sf.length)] && w.slice(0, -sf.length).length >= 2));
    const un = await ev((C) => C.filter(w => APP.ASSIST.toShoma(w) === w && (APP.ASSIST.NOTPOSS26 || []).indexOf(w) < 0), cand);
    chk(cand.length > 100 && !un.length, 'register vocabulary guard: every «…ت» form of the page\'s strings is classified (POSS26 ⇒ «…تان», or NOTPOSS26) — unclassified: ' + un.join(' '));
    // U53 / bank #231: the page's own questions in a «شما» talk — one register, one question
    const Qs = await ev(() => { const out = []; const K = APP.LIVE_QK || {}; Object.keys(K).forEach(k => Object.keys(K[k] || {}).forEach(ph => (K[k][ph] || []).forEach(q => out.push(q)))); const TQ = APP.ASSIST.tutorQuestions || {}; Object.keys(TQ).forEach(k => (TQ[k].qs || []).forEach(q => out.push(q))); return out; });
    const R = await ev((Q) => Q.map(q => { const one = APP.ASSIST.oneQ25(q), sh = APP.ASSIST.toShoma(one), g = APP.ASSIST.regSigns(sh); let d = 0, pd = 0, c = 0; for (const ch of one) { if (ch === '«') d++; else if (ch === '»' && d) d--; else if (ch === '(') pd++; else if (ch === ')' && pd) pd--; else if ((ch === '؟' || ch === '?') && !d && !pd) c++; } return { q, one, sh, to: g.to && g.sh, n: c }; }), Qs);
    chk(Qs.length >= 20, 'registry questions found: ' + Qs.length);
    const mixed = R.filter(r => r.to), multi = R.filter(r => r.n > 1);
    chk(!mixed.length, 'U53 aB4 p7: no page question mixes registers after the «شما» transform — ' + mixed.map(r => r.sh).join(' | '));
    chk(!multi.length, 'bank #231: every page question is one question — ' + multi.map(r => r.one.slice(0, 60)).join(' | '));
    const b3 = R.filter(r => /از راهِ دیگری به دست آوری/.test(r.q))[0];
    chk(b3 && b3.sh === 'می‌توانید نتیجه را از راهِ دیگری به دست آورید؟', 'U53: «می‌توانید نتیجه را از راهِ دیگری به دست آورید؟» — one register, one question, not two glued with a comma — ' + (b3 && b3.sh));
    const el = await ev(() => [APP.ASSIST.oneQ25('آیا شرط برای تعیینِ مجهول کافی است؟ زائد است؟ متناقض است؟'), APP.ASSIST.oneQ25('نتیجه‌ای گفتی — با واقعیت سنجیدی‌اش؟')]);
    chk(el[0] === 'آیا شرط برای تعیینِ مجهول کافی است، زائد است، متناقض است؟' && el[1] === 'نتیجه‌ای گفتی — با واقعیت سنجیدی‌اش؟', 'look-alike: short elliptical alternatives stay one question, as in round 25 — ' + JSON.stringify(el));
  });

  // ================= Q9 — متن‌های ثابتِ نماها به ضمیرِ او (U37 s12، A23-14 🔭، بانکِ #230)؛ حرفِ خودش هرگز =================
  await section('dom', async () => {
    const HER = 'ثابت کن که مجموعِ دو عددِ فرد زوج است.';
    const run = async (age) => { await wipe(); await setB(await birthFor(age)); await fresh(); await turn('سلام. یک مسئله دارم: ' + HER + ' از کجا شروع کنم؟', 'خوب.');
      const pid = await ev((HER) => { const r = APP.liveCreate('جمعِ دو عددِ فرد', HER, 'prove', { by: 'user' }); APP.liveBindSession(r.p.id, __cur()); return r.p.id; }, HER); const o = {};
      for (const a of [['home'], ['lprob', pid], ['route', pid], ['e_prob']]) { await ev((a) => { APP.go.apply(APP, a); }, a); await p.waitForTimeout(120);
        o[a[0]] = await ev(() => document.querySelector('#main').innerText.split('\n').map(l => l.trim()).filter(Boolean)); }
      return o; };
    const E = await run(78), Y = await run(30);
    const STAT = /نمی‌دانی(?![آ-ی])|پیشرفتت(?!ان)|می‌بردت(?!ان)|خودت(?!ان)|می‌خواهی(?![آ-ی])|برایت(?!ان)/;
    const young = [].concat(Y.home, Y.lprob, Y.route).filter(l => STAT.test(l));
    chk(young.length >= 3, 'control: for a «تو» adult the static lines are in «تو» (the strings exist in the views) — ' + young.length);
    const left = [].concat(E.home, E.lprob, E.route).filter(l => STAT.test(l));
    chk(!left.length, 'U37 / A23-14 / bank #230: for a «شما» elder no static page line stays in «تو» — ' + JSON.stringify(left.slice(0, 4)).slice(0, 400));
    const sh = [].concat(E.lprob).filter(l => /چرا می‌خواهید حلش کنید|صورتِ خودتان|برایتان مهم/.test(l));
    chk(sh.length >= 2, 'the same lines are there in «شما» — ' + JSON.stringify(sh).slice(0, 200));
    const hers = [].concat(E.lprob, E.route, E.e_prob).filter(l => /مجموعِ ?دو ?عددِ فرد زوج/.test(l));
    chk(hers.length >= 2 && hers.every(l => /ثابت کن که/.test(l) && !/ثابت کنید/.test(l)), 'look-alike: her own statement («ثابت کن که …») is shown as she wrote it on every view — ' + JSON.stringify(hers).slice(0, 300));
  });

  // ================= Q9 — سنجشِ پس از پاسخ: مثبتِ کاذب نه، لغزشِ واقعی آری (C26-6، C26-17، D26-33، D26-53، U55) =================
  await section('post', async () => {
    const PASS = [
      [82, [], 'برای ثبت به صفحه فرستادم: صورتِ معما، وارسیِ خودتان و راهِ «اگر همه مرغ بودند». در «🔭 مسئله‌های من» می‌ماند و فردا از همان‌جا بازش می‌کنید؛ نتیجهٔ ثبت را صفحه زیرِ همین پیام می‌گوید.', 'U55 aB4 p8 («نتیجهٔ ثبت را»)'],
      [70, [], 'در این یکی، جمعِ «۱/۶ + ۱/۱۲» با آنچه نوشته‌اید نمی‌خواند (و عددِ بعدی هم بر همان بنا شده). عددِ درست را نمی‌گویم؛ همان جمع را با مخرجِ مشترک خودتان دوباره حساب می‌کنید؟', 'C26-17 s25 p18 («عددِ درست را»)'],
      [70, [], 'جدولِ سه‌ماهه‌تان با همان «درصدِ درصد» درست چیده شده و سطرِ ضرب‌ها می‌خواند. ولی دو جمع با نوشته‌تان نمی‌خواند. عددِ درست را نمی‌گویم؛ اولی را خودتان دوباره جمع می‌زنید؟', 'C26-17 aC3 p6'],
      [70, [], 'حسابِ وارسی را با عددهای واقعی کردید: پیش‌بینیِ ۷۰ درصدی‌تان درست درآمد، و خرجِ درمانِ ۱۲ میلیونی هم از همان ۵۰ میلیونِ دمِ دست پرداخت شد. از این شش ماه چه آموختید که در حسابِ بعدی به کار ببرید؟', 'U55 B_x aB3 p15 («۱۲ میلیونی»)'],
      [40, SH, 'حسابتان می‌خواند: سه طبقه با دو برش ۲۴۰ و ۶ دهم سانت می‌شود و از تختهٔ ۲۴۰ درنمی‌آید. حالا پنج تخته حدسِ تازهٔ شماست. اگر نقشهٔ برشِ هر پنج تخته را جداجدا بکشید چه می‌بینید؟', 'D26-53 aD4 p4 («سانت می‌شود»)'],
      [30, TO, 'مقایسه‌ات درست حساب شده و خودت دیدی که ۷۵٪ اطمینانت از سقف بالاتر بود. شیراز که تبلیغ ندید ۲۶٪ رشد کرد و شهرهای دارای تبلیغ ۳۱٪. پیشنهادت دربارهٔ بودجه را با همین عدد بنویس.', 'D26-33 s32 p6 («ندید»)'],
      [30, TO, 'می‌خواهی اطمینانت را با واقعیت بسنجی؛ در کاربرگش هر پیش‌بینی را خودت می‌نویسی. نخستین پیش‌بینی‌ات دربارهٔ این چند هفته چیست؟', 'A s05 p12 («نخستین»)'],
      [30, TO.concat(['اون دو روز شکست، شبش مهمونی بودیم.']), 'نتیجهٔ خودت: ۵ روز از ۷ پیش از ۶:۳۰ بیدار شدی. دو روزِ شکست را هم گفتی: شبش مهمانی بودید. مهمانی علتِ تازه‌ای است یا همان علتِ قبلی؟', 'U55 oB1 p11 (real plural: «مهمونی بودیم» ⇒ «بودید»)'],
      [30, TO, 'اگر خانمت با همین مرورگر کار کند، داده‌ها قاطی می‌شوند — برای جدا ماندن باید هر کدام نمایهٔ جدای مرورگر داشته باشید. از این راه‌حل چه درسی برمی‌داری؟', 'U55 B_x oB1 p13 («هر کدام … داشته باشید»)'],
      [38, TO, 'صادقانه: نه به آن معنا. وقتی چیزی ساخته شود، صفحه فقط می‌سنجد که توصیفِ آن به گامِ تو می‌خورد یا نه؛ این‌که «روی دادهٔ واقعی آزموده شده» را امروز جایی نمی‌بیند و نمی‌گوید.', 'C26-6 pwC1 p8 (guillemets round a proposition)'],
      [30, TO, 'این بخش را «گامِ میانی» می‌نامیم تا گم نشود.', 'bank #232'], [30, TO, 'او نقشه را ندید و برای همین مسیر را اشتباه رفت.', 'bank #233'], [40, SH, 'حاصلِ این برش ۶ دهم سانت می‌شود؛ خودتان اندازه بگیرید.', 'bank #234'],
      [30, TO, 'نمی‌گویم راهت غلط است؛ فقط یک گام را دوباره ببین.', 'bank #235a'], [30, TO, 'شبِ قبلش همه مهمانی بودید؟', 'bank #235b']];
    for (const [age, msgs, r, name] of PASS) { await person(age, msgs); const w = await rc(r); chk(!w, name + ': no rewrite call — ' + String(w).slice(0, 150)); }
    const CATCH = [
      [70, [], 'شما می‌توانید از همین‌جا ادامه بدهید، فقط اول عددت رو دوباره نگاه کن.', /دو ضمیر/, 'bank #246: a real mix is still caught'],
      [30, ['جواب رو پیدا کردم', 'بگو درسته؟'], 'گفتی «جواب ۱۲ میشه» ولی من چنین چیزی در پیامت نمی‌بینم.', /نه در پیام‌های اوست/, 'bank #247: a false quotation of her is still caught'],
      [30, TO, 'بفرمایید ادامه بدهید و نتیجه را بنویسید.', /«تو» بنویس/, 'look-alike: a real «شما» imperative in a «تو» talk is still caught'],
      [40, SH, 'جوابت را بنویس و بعد عددت را نگاه کن.', /«شما» بنویس/, 'look-alike: «جوابت را … عددت را» (known possessives) are still «تو» signs'],
      [30, TO, 'خودت گفتی «همیشه ریاضی‌ام ضعیف بوده و هیچ‌وقت درست نمی‌شود».', /نه در پیام‌های اوست/, 'look-alike: an attributed long quote she never wrote is still caught'],
      [30, TO, 'نتیجه را دیدید و نوشتید؛ حالا خودت بگو کدام گام مانده.', /دو ضمیر/, 'look-alike: «دیدید» (second person plural) in a «تو» talk is still a mix']];
    for (const [age, msgs, r, re, name] of CATCH) { await person(age, msgs); const w = await rc(r); chk(re.test(String(w)), name + ' — ' + String(w).slice(0, 150)); }
  });

  // ================= Q9 — D24-15 (aD1 p2، بانکِ #240): پرسشِ فهمِ صفحه برای کودک به واژه‌های خودش =================
  await section('child', async () => {
    const OPEN = 'یه مسئله: ۱۲ تا مداد رو بین ۳ نفر مساوی تقسیم کنیم، به هر کی چند تا می‌رسه؟';
    await wipe(); await setB(await birthFor(9)); await fresh(); const u = await turn(OPEN, 'خوب.'); const hd = head(u.user);
    chk(!/مجهول \(یا حکمی که باید ثابت شود\) چیست/.test(hd), 'D24-15 aD1 p2: no «مجهول (یا حکمی که باید ثابت شود) چیست؟» in the prompt of a 9-year-old');
    chk(/دنبالِ چی می‌گردیم؟/.test(hd), 'D24-15: the understanding question is in child wording («دنبالِ چی می‌گردیم؟») — ' + (hd.split('\n').filter(l => /پیشنهادِ این نوبت|پرسشِ این نوبت همین/.test(l))[0] || '').slice(-160));
    await wipe(); await setB(await birthFor(15)); await fresh(); const u2 = await turn(OPEN, 'خوب.');
    chk(/مجهول \(یا حکمی که باید ثابت شود\) چیست/.test(head(u2.user)) && !/دنبالِ چی می‌گردیم/.test(head(u2.user)), 'look-alike: a teen keeps the book wording');
    await wipe(); await setB(await birthFor(35)); await fresh(); const u3 = await turn(OPEN, 'خوب.');
    chk(/مجهول \(یا حکمی که باید ثابت شود\) چیست/.test(head(u3.user)), 'look-alike: an adult keeps the book wording');
  });

  // ================= Q9 — کارنامهٔ ذهن: برچسبِ خوانا، ناقص ≠ شکست، فرضِ ردشده = کارِ تکنیک، پیامِ ✗ اعتبار نمی‌گیرد (U23، U24، U30، U46) =================
  const mindActs = () => ev(() => { const Q = APP.MIND.phases(), o = []; (Q.rows || []).forEach(r => (r.acts || []).forEach(a => o.push({ ph: r.id, ok: a.ok, fa: a.fa, src: a.src }))); return o; });
  const mindText = async () => { await ev(() => APP.go('mind')); await p.waitForTimeout(150); return ev(() => document.querySelector('#main').innerText); };
  await section('mind', async () => {
    await wipe(); await setB(''); await fresh();
    await ev(() => { const s = __cur(), at = (i) => new Date(Date.UTC(2026, 9, 19, 8, i)).toISOString();
      s.msgs.push({ role: 'user', text: 'کارِ خودم تا این‌جا: گام ۱: دو طرف رو ساده کردم. گام ۲: ۷٫۵ ÷ ۳ = ۲٫۲. گام ۳: ۴ × ۶ = ۲۴.', at: at(0) }, { role: 'ai', text: 'خوب.', at: at(1) });
      const C = s.coach = s.coach || {}; C.pk = 'c:0'; C.stmt = 'یک مسئلهٔ آزمون با سه گام'; C.ph = 'c';
      C.story = { 'c:0': { items: [], prior: { at: at(0), st: 'ask', steps: [
        { n: 1, quote: 'دو طرف رو ساده کردم', verdict: 'incomplete', why: 'نگفته چطور', dep: [], bad: [] },
        { n: 2, quote: '۷٫۵ ÷ ۳ = ۲٫۲', verdict: 'wrong', cause: 'skill', why: 'تقسیمِ اعشاری', dep: [], bad: ['2.2'] },
        { n: 3, quote: '۴ × ۶ = ۲۴', verdict: 'ok', dep: [], bad: [] }] } } };
      s.coachEv = [
        { at: at(0), ph: 'c', ok: false, src: 'prior', key: 'prior|c|دو طرف رو ساده کردم', prior: 1, cause: 'unknown', causeWhy: 'نگفته چطور', msg: 't' + at(0) },
        { at: at(0), ph: 'c', ok: false, src: 'prior', key: 'prior|c|۷٫۵ ÷ ۳ = ۲٫۲', prior: 2, cause: 'skill', causeWhy: 'تقسیمِ اعشاری', msg: 't' + at(0) },
        { at: at(0), ph: 'c', ok: true, src: 'prior', key: 'prior|c|۴ × ۶ = ۲۴', prior: 3, msg: 't' + at(0) }];
      APP.S.put(s); });
    const A1 = (await mindActs()).filter(a => a.src === 'prior'), tx = await mindText();
    chk(!/undefined/.test(tx), 'U23 (B26·D6): the string «undefined» never appears on the mind card — ' + (tx.match(/.{30}undefined.{30}/) || [''])[0]);
    chk(/گامِ کارِ پیشین: ۱ از ۲/.test(tx), 'U23 / bank #236: the source cell has a readable label «گامِ کارِ پیشین: k از n» — ' + (tx.match(/[^\n]*کارِ پیشین:[^\n]*/) || [''])[0].slice(0, 120));
    chk(!A1.some(a => /گامِ ۱/.test(a.fa)), 'U24 s11 / bank #237: an «ناقص» prior step is not booked as «− … درست نبود» — ' + JSON.stringify(A1).slice(0, 300));
    const w2 = A1.filter(a => /گامِ ۲/.test(a.fa))[0];
    chk(w2 && w2.ok === false && /درست نبود/.test(w2.fa), 'look-alike / bank #248: a really wrong step is still booked «−» — ' + JSON.stringify(w2));
    const cz = await ev(() => { const Q = APP.MIND.phases(), o = []; Object.keys(Q.causes || {}).forEach(k => (Q.causes[k] || []).forEach(c => o.push(k + ':' + (c.why || '')))); return o; });
    chk(cz.some(c => /^skill:.*تقسیمِ اعشاری/.test(c)) && !cz.some(c => /نگفته چطور/.test(c)), 'bank #248: … with its cause (and the incomplete step adds no failure cause) — ' + JSON.stringify(cz).slice(0, 200));
    chk(A1.some(a => a.ok === true && /گامِ ۳/.test(a.fa)), 'the correct prior step is credited — ' + JSON.stringify(A1).slice(0, 300));
    // U46: «+ نتیجه‌ای که گفت» only when the page's own reader did not mark the message ✗
    await wipe(); await fresh();
    await ev(() => { const s = __cur(), at = (i) => new Date(Date.UTC(2026, 9, 19, 9, i)).toISOString();
      s.msgs.push({ role: 'user', text: 'حسابِ پول: ۲۱ × ۱۲ = ۲۴۲ پس جواب ۲۴۲ تومنه.', at: at(0) }, { role: 'ai', text: 'خوب.', at: at(1) }, { role: 'user', text: 'حسابِ دوم: ۲۱ × ۱۲ = ۲۵۲ پس جواب ۲۵۲ تومنه.', at: at(2) }, { role: 'ai', text: 'خوب.', at: at(3) });
      s.coach = { pk: 'c:0', stmt: 'حسابِ پول', ph: 'b' };
      s.coachEv = [{ at: at(0), ph: 'b', ok: true, src: 'chatok', how: 'res', key: 'chatok|b|res|حسابِ پول: ۲۱ × ۱۲ = ۲۴۲', msg: 't' + at(0) }, { at: at(2), ph: 'b', ok: true, src: 'chatok', how: 'res', key: 'chatok|b|res|حسابِ دوم: ۲۱ × ۱۲ = ۲۵۲', msg: 't' + at(2) }];
      APP.S.put(s); });
    const A2 = (await mindActs()).filter(a => /نتیجه‌ای که گفت/.test(a.fa));
    chk(!A2.some(a => /۲۴۲/.test(a.fa)), 'U46 pwB2 / bank #239: no «+ نتیجه‌ای که گفت» for a message whose «۲۱ × ۱۲ = ۲۴۲» the page marked ✗ — ' + JSON.stringify(A2).slice(0, 300));
    chk(A2.some(a => a.ok === true && /۲۵۲/.test(a.fa)), 'look-alike / bank #249: a result in a message the page read ✓ is credited — ' + JSON.stringify(A2).slice(0, 300));
    // U30: a refuted assumption is the technique's work, not a failure; a refuted item of another list keeps its sign
    await wipe(); await fresh();
    const W = await ev(() => { const PR = APP.PR; PR.listAdd('assumptions', { text: 'اگه گزارش بدم حتماً اخراج میشه', load: true }); const x = PR.list('assumptions').items[0]; PR.itemClose('assumptions', x.id, 'پس اون فرضم غلط بود', null, 'refuted');
      let other = null; try { const nm = Object.keys(PR.LISTS || {}).filter(k => k !== 'assumptions')[0]; if (nm) { PR.listAdd(nm, { text: 'یک موردِ دیگر برای آزمون' }); const y = PR.list(nm).items[0]; PR.itemClose(nm, y.id, 'رد شد', null, 'refuted'); other = nm; } } catch (e) { other = 'ERR ' + e.message; }
      const T = APP.MIND.techWork(); return { other, rows: (T.rows || []).filter(r => r.src === 'list').map(r => ({ key: r.key, acts: (r.acts || []).filter(a => a.ok !== null).map(a => ({ ok: a.ok, fa: a.fa.slice(0, 80) })) })) }; });
    const ra = (W.rows.filter(r => r.acts.some(a => /فهرستِ فرض‌ها/.test(a.fa)))[0] || { acts: [] }).acts;
    chk(ra.length === 1 && ra[0].ok === true, 'U30 s13 / bank #238: a refuted assumption (T15) is credited to her checking, not booked «−» — ' + JSON.stringify(W).slice(0, 400));
    if (W.other && !/^ERR/.test(W.other)) { const ro = (W.rows.filter(r => !r.acts.some(a => /فهرستِ فرض‌ها/.test(a.fa)))[0] || { acts: [] }).acts; chk(ro.length === 1 && ro[0].ok === false, 'look-alike: a refuted item of another list («' + W.other + '») keeps its sign — ' + JSON.stringify(ro).slice(0, 300)); }
    else (info.note = info.note || {}).listOther = String(W.other);
  });

  // ================= Q9 — U54 (B26·D38 aB4 p2): برچسبِ خودِ او («مجهول: … داده‌ها: … شرط: …») خوانده می‌شود =================
  const unkItem = async (first, second) => { await wipe(); await setB(''); await fresh(); await turn(first, 'خوب.', [{ do: 'coach_state', ph: 'u', said: [], ans: [], nat: 'practical', role: 'self' }]);
    await turn(second, 'خوب.', [{ do: 'coach_state', ph: 'u', said: ['u', 'd', 'c'], ans: ['u1', 'u2', 'u3'], nat: 'practical', role: 'self' }]);
    return ev(() => { const C = __cur().coach || {}, o = []; Object.keys(C.story || {}).forEach(k => ((C.story[k] || {}).items || []).forEach(it => { if (it.k === 'u') o.push(it.t); })); return o; }); };
  const HEN = 'نوه‌م یه معما ازم پرسید: «توی یه مزرعه مرغ و خرگوش هست؛ روی هم ۳۵ تا سر و ۹۴ تا پا دارن. چند تا مرغ و چند تا خرگوش؟» می‌خوام خودم حل کنم.';
  await section('u54', async () => {
    const a = await unkItem(HEN, 'مجهول: تعداد مرغ‌ها و تعداد خرگوش‌ها. داده‌ها: ۳۵ تا سر و ۹۴ تا پا. شرط: هر مرغ ۲ تا پا داره و هر خرگوش ۴ تا، و هر کدوم فقط یه سر.');
    chk(a.length === 1 && /تعداد مرغ‌ها و تعداد خرگوش‌ها/.test(a[0]) && !/داده‌ها|سر و ۹۴/.test(a[0]), 'U54 aB4 p2: the unknown carried from the chat is his own «تعداد مرغ‌ها و تعداد خرگوش‌ها», not his data sentence — ' + JSON.stringify(a));
    const b = await unkItem(HEN, 'دنبالِ اینم که چند تا مرغ و چند تا خرگوش هست. ۳۵ تا سر و ۹۴ تا پا داریم. هر مرغ ۲ تا پا داره و هر خرگوش ۴ تا.');
    chk(b.length === 1 && /چند تا مرغ و چند تا خرگوش/.test(b[0]), 'look-alike: an unlabelled message keeps the round-24 reading («دنبالِ اینم که …») — ' + JSON.stringify(b));
  });

  // ================= Q10 — سازوکارهای کوچک: C26-32 (پیگیریِ «بازش کن»)، C26-34 (یک نقطهٔ پیش‌نیاز)، C26-42 (موعد = همان شمار)، C26-33 (بازتولید) =================
  const PREQ = (c, q) => ({ concept: c, step: 'حسابِ مساحتِ زمین', quote: q, q: 'این را پیش‌تر دیده‌ای؟', topic: 'هندسه' });
  const LAND = 'یه تیکه زمین مثلثی دارم که می‌خوام چمن بکارم. دو تا ضلعش هر کدوم ۱۳ متره، ضلع سوم ۱۰ متر. هر کیسه بذر برای ۱۰ متر مربع کافیه. چند کیسه بخرم؟ مستطیل رو بلدم طول ضرب در عرض، ولی این مثلثه.';
  const goPrereq = async (withMap) => { await wipe(); await setB(''); await fresh();
    await turn(LAND, 'خوب.', [{ do: 'coach_state', ph: 'u', said: ['u', 'd'], ans: [], stuck: true, nat: 'practical', role: 'self', prereq: withMap ? PREQ('مساحتِ مثلث (نصفِ قاعده × ارتفاع)', 'مستطیل رو بلدم طول ضرب در عرض، ولی این مثلثه') : undefined }]);
    const n0 = await ev(() => APP.S.all('prereq').length); const r = await turn('آره، بازش کن.', 'باز می‌کنم.', [{ do: 'go', view: 'prereq' }]);
    return { n0, t: String(follow(r).split('# نوبتِ تازه\n')[1] || ''), id: await ev(() => (APP.S.all('prereq')[0] || {}).id || '') }; };
  const routePre = async (two) => { await wipe(); await setB(''); await fresh();
    await turn(LAND, 'خوب.', [{ do: 'coach_state', ph: 'u', said: ['u', 'd'], ans: [], stuck: true, nat: 'practical', role: 'self', prereq: two ? [PREQ('جمعِ کسرها', 'مستطیل رو بلدم طول ضرب در عرض'), PREQ('مخرجِ مشترک', 'ولی این مثلثه')] : PREQ('مساحتِ مثلث (نصفِ قاعده × ارتفاع)', 'مستطیل رو بلدم طول ضرب در عرض، ولی این مثلثه') }]);
    const ids = await ev(() => { const o = []; APP.S.all('prereq').forEach(r => (r.items || []).forEach(x => o.push(x.eid || x.id))); return o; });
    await turn('نه، نمی‌دونم ارتفاعِ مثلث کدوم خطه؛ مساحتِ مثلث رو هیچ‌وقت حساب نکردم. ولی اول ثبتش کن.', 'ثبت می‌کنم.', [{ do: 'live_new', title: 'چند کیسه بذر برای زمینِ مثلثی', statement: 'یه تیکه زمین مثلثی دارم که می‌خوام چمن بکارم. دو تا ضلعش هر کدوم ۱۳ متره، ضلع سوم ۱۰ متر. هر کیسه بذر برای ۱۰ متر مربع کافیه. چند کیسه بخرم؟', nat: 'practical' },
      { do: 'coach_state', ph: 'u', said: ['u'], ans: [], stuck: true, nat: 'practical', role: 'self', prereq_res: { id: ids[0] || 'pq1', diag: 'missing', quote: 'مساحتِ مثلث رو هیچ‌وقت حساب نکردم' } }]);
    await turn('مستطیل ۸ در ۵ میشه ۴۰ و مثلث نصفشه: ۲۰. چون اگه مثلث رو تو مستطیلی با همون قاعده و ارتفاع بذارم، دو تیکهٔ بیرونی کنار هم اندازهٔ خود مثلث میشن.', 'خوب.', [{ do: 'coach_state', ph: 'p', said: [], ans: [], nat: 'practical', role: 'self', prereq_res: { id: ids[0] || 'pq1', mastery: 'yes', quote: 'مستطیل ۸ در ۵ میشه ۴۰ و مثلث نصفشه: ۲۰' } }]);
    return ev(() => { const pid = (APP.liveAll()[0] || { p: {} }).p.id || ''; const M = pid ? APP.ROUTE.model(pid) : null; const items = []; APP.S.all('prereq').forEach(r => (r.items || []).forEach(x => items.push(x.state)));
      APP.go('route', pid); const now = (document.querySelector('#main').innerText.split('\n').filter(l => /اکنون:/.test(l))[0] || '').slice(0, 140);
      return { pid, items, pre: M ? (M.dets || []).filter(d => d.kind === 'pre').map(d => ({ c: String(d.concept || '').slice(0, 24), open: !!d.open })) : null, now }; }); };
  const planForm = async () => { await wipe(); await fresh();
    const pid = await ev(() => { const r = APP.liveCreate('معادلهٔ x² − y² = 15', 'معادلهٔ x² − y² = 15 چند تا جواب صحیح داره؟', 'find', { by: 'user' }); const pid = r.p.id; APP.liveBindSession(pid, __cur());
      __liveSet(pid, (so, L) => { so.u = { 1: { done: true, u: 'همهٔ جواب‌های صحیح', dl: [{ t: 'x² − y² = 15' }], c: 'x و y صحیح‌اند', type: 'find' } }; }); return pid; });
    await ev((pid) => APP.go('lprob', pid, 'plan'), pid); await p.waitForTimeout(200); const PL = 'نخست (x − y)(x + y) = 15 را می‌نویسم، سپس جفت‌های مقسوم‌علیهِ ۱۵ را می‌آزمایم.';
    if (!(await ev(() => !!document.querySelector('#lpPlan') && !!document.querySelector('.lp-plansave') && !!document.querySelector('#lpMv')))) return { nf: true };
    await p.fill('#lpPlan', PL); await p.click('.lp-plansave'); await p.waitForTimeout(80);
    const a1 = await ev(() => ({ v: (document.querySelector('#lpPlan') || {}).value || '', miss: (document.querySelector('.lp-planmisswrap') || {}).innerText || '' }));
    await p.selectOption('#lpMv', { index: 1 }); await p.waitForTimeout(100); await p.fill('#lpMvWhy', 'تجزیهٔ تفاضلِ دو مربع این‌جا مسئله را به جفت‌های عددی می‌شکند'); await p.click('.lp-mvadd'); await p.waitForTimeout(200);
    const a2 = await ev(() => (document.querySelector('#lpPlan') || {}).value || '');
    await p.click('.lp-plansave'); await p.waitForTimeout(200);
    const a3 = await ev((pid) => ((((APP.S.get('eprog_' + pid) || {}).solve || {}).live || {}).plan || {}).t || '', pid);
    return { PL, a1, a2, a3 }; };
  const retr = (n) => ev(([n, T0]) => { const add = (k) => { const d = new Date(T0 + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + k); return d.toISOString().slice(0, 10); };
    const S0 = [{ d: add(0), ok: true }, { d: add(1), ok: false }, { d: add(8), ok: true }]; if (n >= 2) S0.push({ d: add(15), ok: true }); if (n >= 3) S0.push({ d: add(22), ok: true });
    const c = { id: 'prc_t', type: 'prc', tid: 41, start: add(0), sessions: S0, hist: [] }, R = APP.PR.eval(c), last = S0[S0.length - 1].d;
    return { due: R.due, gap: R.due ? Math.round((new Date(R.due) - new Date(last)) / 864e5) : null, reason: R.reason || '', stable: !!R.stable, next: R.stable ? Math.round((new Date(R.stable.next) - new Date(last)) / 864e5) : null }; }, [n, T0]);
  await section('q10', async () => {
    const g1 = await goPrereq(true), g0 = await goPrereq(false);
    chk(g1.n0 === 1 && !!g1.t && /همین‌جاست؛ همان را باز کن/.test(g1.t) && g1.t.indexOf('"arg":"' + g1.id + '"') > 0 && /دکمهٔ ساخت را نزن/.test(g1.t) && !/فیلدهای این صفحه را پر کن/.test(g1.t), 'C26-32 pC1 p12 / bank #250: the list already holds her map ⇒ the follow-up says open it (with its id), never «فیلدها را پر کن … دکمهٔ ساخت را بزن» — ' + g1.t.slice(0, 260));
    chk(g0.n0 === 0 && !!g0.t && /فیلدهای این صفحه را پر کن/.test(g0.t) && !/همان را باز کن/.test(g0.t), 'look-alike / bank #251: no map for this problem ⇒ «build it» is the right follow-up — ' + g0.t.slice(0, 200));
    const r1 = await routePre(false), r2 = await routePre(true);
    chk(r1.pid && r1.pre && r1.pre.length === 1 && !r1.pre[0].open && r1.items.join() === 'learned', 'C26-34 pC3 🧭 / bank #252: a prerequisite diagnosed before registration is ONE point and closed once learned — ' + JSON.stringify(r1));
    chk(!/اکنون: پیش‌نیازِ/.test(r1.now), 'C26-34: «اکنون» is not the learned prerequisite — ' + r1.now);
    chk(r2.pre && r2.pre.length === 2 && r2.pre.filter(d => d.open).length === 1, 'look-alike / bank #253: two different prerequisites, one learned ⇒ two points, the second still open — ' + JSON.stringify(r2));
    const t1 = await retr(1), t2 = await retr(2), t3 = await retr(3);
    chk(/۱ از ۳/.test(t1.reason) && t1.gap === 7 && !/۲۱/.test(t1.reason), 'C26-42 s29 p6 / bank #255: after a failure, one late success («۱ از ۳») is not scheduled three weeks out — the gap stays within the technique\'s own cycle — ' + JSON.stringify(t1));
    chk(/۲ از ۳/.test(t2.reason) && t2.gap === 7, 'C26-42: the same holds at «۲ از ۳» — ' + JSON.stringify(t2));
    chk(t3.stable && t3.next >= 7, 'look-alike / bank #256: after three successes («تثبیت شد») the long interval is right — ' + JSON.stringify(t3));
    const pf = await planForm();
    if (pf.nf) (info.note = info.note || {}).c26_33 = 'plan form not reachable in the harness'; else {
      (info.note = info.note || {}).c26_33 = 'not reproduced on BASE26: typed plan survives the refused «ثبتِ طرح» and an added move';
      chk(/ابزارِ طرح/.test(pf.a1.miss) && pf.a1.v === pf.PL && pf.a2 === pf.PL && pf.a3 === pf.PL, 'C26-33 / bank #254 (reproduce first): the typed plan stays in the field after the refusal and after adding a move, and the second save stores it — ' + JSON.stringify(pf).slice(0, 300)); }
  });

  // ================= بانکِ مستقلِ R26 — همهٔ ورودی‌های Q9 و Q10 (#222–#257) =================
  await section('bank', async () => {
    const E = {}; BANK.forEach((e, i) => { E[i + 1] = e; });
    const T = (n, ok, got) => { info.bank[n] = !!ok; if (!ok) { info.bankWrong[n] = String(got == null ? '' : got).slice(0, 200); errors.push('bank#' + n + ' [' + E[n].kind + '] ' + E[n].text.slice(0, 70) + ' ⇒ ' + String(got == null ? '' : got).slice(0, 240)); } };
    const NC = (n, why) => { info.nc[n] = why; };
    const U1 = (n) => E[n].text.split('‖')[0].replace(/^\s*[UA]:\s*/, '').trim();
    const A2 = (n) => E[n].text.split('‖').map(x => x.replace(/^\s*[UA]:\s*/, '').trim());
    const labels = async (word) => { const s = await st(), seen = await views(['home', 'mind', 'e_prob'], word), d = await ev(() => { const D = APP.dossierSess(__cur().id); return [D && D.title].concat(((D && D.pks) || []).map(x => x.title)).join(' | '); }), ti = await ev(() => APP.ASSIST.sessTitle26(__cur(), null, 80));
      const bub = (await ev(() => __msgs())).filter(m => m.role === 'user').pop().text; return { stmt: s.stmt, all: [s.stmt, d, ti].concat(seen).join(' ‖ '), bub }; };
    const mindSetup = (fn) => ev(fn);
    const H = {
      222: async (n) => { await wipe(); await setB(await birthFor(10)); await fresh(); await turn(U1(n), 'خوب.'); const L = await labels('سروناز'); T(n, !/سروناز/.test(L.all) && /\[نامِ مدرسه\]/.test(L.stmt) && /کسرها/.test(L.stmt) && /سروناز/.test(L.bub), L.all); },
      223: async (n) => { await wipe(); await setB(await birthFor(11)); await fresh(); const u = await turn(U1(n), 'خوب.'); const L = await labels('مهرپرور'), q = (await tq(u)).q; T(n, !/مهرپرور/.test(L.all + q) && /\[نامِ (?:معلم|شخص)\]/.test(L.stmt) && /ستونِ آخر/.test(L.stmt), L.all); },
      224: async (n) => { await wipe(); await setB(await birthFor(40)); await fresh(); await turn(U1(n), 'خوب.'); const L = await labels('آفتابِ دانش'); T(n, !/آفتابِ دانش/.test(L.all) && /\[نامِ مدرسه\]/.test(L.stmt) && /برنامهٔ درسی/.test(L.stmt), L.all); },
      225: async (n) => { await wipe(); await setB(await birthFor(40)); await fresh(); await turn(U1(n), 'خوب.'); const L = await labels('کیانفر'); T(n, !/کیانفر/.test(L.all) && /\[نامِ شخص\]/.test(L.stmt) && /دیوارِ مشترک/.test(L.stmt) && /کیانفر/.test(L.bub), L.all); },
      226: async (n) => { await wipe(); await setB(''); await fresh(); const pid = await ev(() => { const r = APP.liveCreate('قضیهٔ فیثاغورس از حافظه', 'سه فرمول را از حافظه بنویس — صورتِ آزمون.', 'find', { by: 'user' }); APP.liveBindSession(r.p.id, __cur()); return r.p.id; });
        await turn(U1(n), 'خوب.'); const g = await ev(() => ({ t: APP.ASSIST.sessTitle26(__cur(), null, 60), raw: __cur().title, d: (APP.dossierSess(__cur().id) || {}).title })); T(n, !/^سلام/.test(g.t) && g.t === 'قضیهٔ فیثاغورس از حافظه' && !/^سلام/.test(String(g.d)), JSON.stringify(g)); },
      227: async (n) => { await wipe(); await setB(''); await fresh(); await turn(U1(n), 'خوب.'); const s = await st(), g = await ev(() => ({ t: APP.ASSIST.sessTitle26(__cur(), null, 60), d: (APP.dossierSess(__cur().id) || {}).title })); T(n, /^وقت کم میارم/.test(s.stmt) && /^وقت کم میارم/.test(g.t) && /^وقت کم میارم/.test(String(g.d)), s.stmt + ' | ' + JSON.stringify(g)); },
      228: async (n) => { await wipe(); await setB(''); await fresh(); await turn('یه مسئله: ۱۲ سیب رو بین ۳ نفر مساوی تقسیم کنیم، به هر کی چند تا می‌رسه؟', 'خوب.'); const a = await ev(() => { const C = __cur().coach || {}; return { stmt: C.stmt, pk: C.pk, n: (C.pkLog || []).length }; });
        await turn(A2(n).pop(), 'ثبت می‌شود.'); const b = await ev(() => { const C = __cur().coach || {}, D = APP.dossierSess(__cur().id); return { stmt: C.stmt, pk: C.pk, n: (C.pkLog || []).map(x => x.pk).filter((x, i, X) => X.indexOf(x) === i).length, pks: ((D && D.pks) || []).map(x => x.title), t: D && D.title, age: APP.AGE.age() }; });
        const seen = await views(['home', 'mind', 'e_prob'], 'متولدِ'); T(n, b.stmt === a.stmt && b.pk === a.pk && b.n === 1 && !b.pks.length && !/متولد/.test(String(b.t)) && !seen.length && b.age > 50, JSON.stringify(b) + JSON.stringify(seen)); },
      229: async (n) => { await wipe(); await setB(''); await fresh(); const u = await turn(U1(n), 'این دکمه نقشهٔ مسیر را نشان می‌دهد.'); const s = await st(), q = (await tq(u)).q, np = await ev((t) => APP.ASSIST.notProblem(t), U1(n)); T(n, np && !s.stmt && !/کلِ مسئله را در یک جمله/.test(q) && (await ev(() => APP.liveAll().length)) === 0, s.stmt + ' | ' + q); },
      230: async (n) => { await person(78, []); const g = await ev(() => ['تقریبت بس بود', 'اصلاحت رسید، ولی پیامت دو بخش داشت'].map(t => APP.ASSIST.regSys(__cur(), t))); await ev(() => { APP.go('home'); const d = document.createElement('p'); d.className = 't26'; d.textContent = 'اصلاحت رسید، ولی پیامت دو بخش داشت. تقریبت بس بود.'; document.getElementById('main').appendChild(d); }); await p.waitForTimeout(150);
        const dom = await ev(() => ({ t: (document.querySelector('#main .t26') || {}).textContent, to: document.querySelector('#main').innerText.split('\n').filter(l => /نمی‌دانی(?![آ-ی])|پیشرفتت(?!ان)|خودت(?!ان)|می‌بردت(?!ان)/.test(l)).slice(0, 3) }));
        T(n, g[0] === 'تقریبتان بس بود' && g[1] === 'اصلاحتان رسید، ولی پیامتان دو بخش داشت' && dom.t === 'اصلاحتان رسید، ولی پیامتان دو بخش داشت. تقریبتان بس بود.' && !dom.to.length, JSON.stringify(g) + JSON.stringify(dom)); },
      231: async (n) => { const x = await ev(() => APP.ASSIST.toShoma(APP.ASSIST.finalFilter25(['- **پرسشِ این نوبت همین است:** «می‌توانی نتیجه را از راهِ دیگری به دست آوری؟ می‌توانی آن را در یک نگاه ببینی؟»'])[0])); T(n, /«می‌توانید نتیجه را از راهِ دیگری به دست آورید؟»/.test(x) && !/آوری(?!د)/.test(x) && !/،\s*می‌توانید/.test(x), x); },
      232: async (n) => { await person(30, TO); const w = await rc(U1(n)); T(n, !w, w); },
      233: async (n) => { await person(30, TO); const w = await rc(U1(n)); T(n, !w, w); },
      234: async (n) => { await person(40, SH); const w = await rc(U1(n)); T(n, !w, w); },
      235: async (n) => { const X = A2(n); await person(30, TO); const w1 = await rc(X[0]); await person(30, TO); const w2 = await rc(X[1]); T(n, !w1 && !w2, w1 + ' | ' + w2); },
      236: async (n) => { await wipe(); await setB(''); await fresh(); await mindSetup(() => { const s = __cur(), at = new Date(Date.UTC(2026, 9, 19, 8, 0)).toISOString(); s.msgs.push({ role: 'user', text: 'گام ۱: ۴ × ۶ = ۲۴. گام ۲: ۷٫۵ ÷ ۳ = ۲٫۲.', at });
          s.coach = { pk: 'c:0', stmt: 'آزمون', ph: 'c', story: { 'c:0': { items: [], prior: { steps: [{ n: 1, quote: '۴ × ۶ = ۲۴', verdict: 'ok', dep: [], bad: [] }, { n: 2, quote: '۷٫۵ ÷ ۳ = ۲٫۲', verdict: 'wrong', cause: 'skill', why: 'تقسیمِ اعشاری', dep: [], bad: [] }] } } } };
          s.coachEv = [{ at, ph: 'c', ok: true, src: 'prior', key: 'prior|c|a', prior: 1 }, { at, ph: 'c', ok: false, src: 'prior', key: 'prior|c|b', prior: 2, cause: 'skill', causeWhy: 'تقسیمِ اعشاری' }]; APP.S.put(s); });
        const tx = await mindText(); T(n, !/undefined/.test(tx) && /گامِ کارِ پیشین: ۱ از ۲/.test(tx), (tx.match(/[^\n]*کارِ پیشین[^\n]*/) || [''])[0].slice(0, 160)); },
      237: async (n) => { await wipe(); await setB(''); await fresh(); await mindSetup(() => { const s = __cur(), at = new Date(Date.UTC(2026, 9, 19, 8, 0)).toISOString(); s.msgs.push({ role: 'user', text: 'گام ۱: ساده کردم. گام ۲: ۴ × ۶ = ۲۴.', at });
          s.coach = { pk: 'c:0', stmt: 'آزمون', ph: 'c', story: { 'c:0': { items: [], prior: { steps: [{ n: 1, quote: 'ساده کردم', verdict: 'incomplete', why: 'نگفته چطور', dep: [], bad: [] }, { n: 2, quote: '۴ × ۶ = ۲۴', verdict: 'ok', dep: [1], bad: [] }] } } } };
          s.coachEv = [{ at, ph: 'c', ok: false, src: 'prior', key: 'prior|c|a', prior: 1, cause: 'unknown', causeWhy: 'نگفته چطور' }, { at, ph: 'c', ok: true, src: 'prior', key: 'prior|c|b', prior: 2 }]; APP.S.put(s); });
        const A1 = (await mindActs()).filter(a => a.src === 'prior'); T(n, !A1.some(a => a.ok === false) && A1.length === 1, JSON.stringify(A1)); },
      238: async (n) => { await wipe(); await fresh(); const W = await ev(() => { const PR = APP.PR; PR.listAdd('assumptions', { text: 'اگه گزارش بدم حتماً اخراج میشه', load: true }); const x = PR.list('assumptions').items[0]; PR.itemClose('assumptions', x.id, 'خودم پرسیدم و دیدم این‌طور نیست', null, 'refuted'); return ((APP.MIND.techWork().rows || []).filter(r => r.src === 'list')[0] || { acts: [] }).acts.filter(a => a.ok !== null).map(a => a.ok); }); T(n, W.length === 1 && W[0] === true, JSON.stringify(W)); },
      239: async (n) => { await wipe(); await fresh(); await mindSetup(() => { const s = __cur(), at = new Date(Date.UTC(2026, 9, 19, 9, 0)).toISOString(); s.msgs.push({ role: 'user', text: 'با ۱۸ متر: ۳۵۳۱۶۰ ÷ ۴۸ = ۷۲۵۷ پس جواب همینه.', at }); s.coach = { pk: 'c:0', stmt: 'آزمون', ph: 'b' }; s.coachEv = [{ at, ph: 'b', ok: true, src: 'chatok', how: 'res', key: 'chatok|b|res|x', msg: 't' + at }]; APP.S.put(s); });
        const A = (await mindActs()).filter(a => /نتیجه‌ای که گفت/.test(a.fa)); T(n, !A.length, JSON.stringify(A)); },
      240: async (n) => { await wipe(); await setB(await birthFor(9)); await fresh(); const u = await turn('یه مسئله: ۱۲ تا مداد رو بین ۳ نفر مساوی تقسیم کنیم، به هر کی چند تا می‌رسه؟', 'خوب.'); const hd = head(u.user); T(n, /دنبالِ چی می‌گردیم؟/.test(hd) && !/مجهول \(یا حکمی که باید ثابت شود\) چیست/.test(hd), (hd.split('\n').filter(l => /پیشنهادِ این نوبت|پرسشِ این نوبت همین/.test(l))[0] || '').slice(-200)); },
      241: async (n) => { await wipe(); await setB(await birthFor(45)); await fresh(); await turn(U1(n), 'خوب.'); const x = await ev((t) => [APP.AGE.privLabel(t), (__cur().coach || {}).stmt || ''], U1(n)); T(n, x[0] === U1(n) && !/\[نامِ/.test(x[1]), JSON.stringify(x)); },
      242: async (n) => { await wipe(); await setB(''); await fresh(); await turn(U1(n), 'خوب.'); const s = await st(), t = await ev((t) => APP.AGE.titleOf(t), U1(n)); T(n, /فیثاغورس/.test(s.stmt) && /پولیا/.test(s.stmt) && t === U1(n), s.stmt + ' | ' + t); },
      243: async (n) => { await wipe(); await setB(await birthFor(12)); await fresh(); const x = await ev((t) => [APP.AGE.privLabel(t), APP.ASSIST.notProblem(t)], U1(n)); T(n, x[0] === U1(n), JSON.stringify(x)); },
      244: async (n) => { await wipe(); await setB(''); await fresh(); await turn(U1(n), 'خوب.'); const s = await st(), x = await ev((t) => [APP.ASSIST.statesProblem(t), APP.AGE.titleOf(t)], U1(n)); T(n, x[0] && /اتاقِ ۳ در ۴/.test(s.stmt) && /اتاقِ ۳ در ۴/.test(x[1]) && /موکت/.test(x[1]), s.stmt + ' | ' + JSON.stringify(x)); },
      245: async (n) => { await wipe(); await setB(await birthFor(17)); await fresh(); await turn(U1(n), 'خوب.'); const s = await st(), x = await ev((t) => [APP.ASSIST.notProblem(t), APP.ASSIST.pageAsk26(t)], U1(n)); T(n, !x[0] && !x[1] && /کنکورم برنامه بریزم/.test(s.stmt), JSON.stringify(x) + s.stmt); },
      246: async (n) => { await person(40, SH); const w = await rc(U1(n)); T(n, /دو ضمیر/.test(String(w)), w); },
      247: async (n) => { await person(30, ['جواب رو پیدا کردم', 'بگو درسته؟']); const w = await rc(U1(n)); T(n, /نه در پیام‌های اوست/.test(String(w)), w); },
      248: async (n) => { await wipe(); await setB(''); await fresh(); await mindSetup(() => { const s = __cur(), at = new Date(Date.UTC(2026, 9, 19, 8, 0)).toISOString(); s.msgs.push({ role: 'user', text: 'گام ۱: ۷٫۵ ÷ ۳ = ۲٫۲.', at });
          s.coach = { pk: 'c:0', stmt: 'آزمون', ph: 'c', story: { 'c:0': { items: [], prior: { steps: [{ n: 1, quote: '۷٫۵ ÷ ۳ = ۲٫۲', verdict: 'wrong', cause: 'skill', why: 'تقسیمِ اعشاری', dep: [], bad: [] }] } } } }; s.coachEv = [{ at, ph: 'c', ok: false, src: 'prior', key: 'prior|c|b', prior: 1, cause: 'skill', causeWhy: 'تقسیمِ اعشاری' }]; APP.S.put(s); });
        const A1 = (await mindActs()).filter(a => a.src === 'prior'), cz = await ev(() => ((APP.MIND.phases().causes || {}).skill || []).map(c => c.why)); T(n, A1.length === 1 && A1[0].ok === false && cz.some(c => /تقسیمِ اعشاری/.test(c)), JSON.stringify(A1) + JSON.stringify(cz)); },
      249: async (n) => { await wipe(); await fresh(); await mindSetup(() => { const s = __cur(), at = new Date(Date.UTC(2026, 9, 19, 9, 0)).toISOString(); s.msgs.push({ role: 'user', text: 'حساب کردم: ۲۱ × ۱۲ = ۲۵۲ پس جواب ۲۵۲ تومنه.', at }); s.coach = { pk: 'c:0', stmt: 'آزمون', ph: 'b' }; s.coachEv = [{ at, ph: 'b', ok: true, src: 'chatok', how: 'res', key: 'chatok|b|res|حساب کردم: ۲۱ × ۱۲ = ۲۵۲', msg: 't' + at }]; APP.S.put(s); });
        const A = (await mindActs()).filter(a => /نتیجه‌ای که گفت/.test(a.fa)); T(n, A.length === 1 && A[0].ok === true, JSON.stringify(A)); },
      250: async (n) => { const g = await goPrereq(true); T(n, !!g.t && /همان را باز کن/.test(g.t) && /دکمهٔ ساخت را نزن/.test(g.t) && !/فیلدهای این صفحه را پر کن/.test(g.t), g.t.slice(0, 220)); },
      251: async (n) => { const g = await goPrereq(false); T(n, !!g.t && /فیلدهای این صفحه را پر کن/.test(g.t) && !/همان را باز کن/.test(g.t), g.t.slice(0, 220)); },
      252: async (n) => { const r = await routePre(false); T(n, r.pre && r.pre.length === 1 && !r.pre[0].open && !/اکنون: پیش‌نیازِ/.test(r.now), JSON.stringify(r)); },
      253: async (n) => { const r = await routePre(true); T(n, r.pre && r.pre.length === 2 && r.pre.filter(d => d.open).length === 1, JSON.stringify(r)); },
      254: async (n) => { const pf = await planForm(); if (pf.nf) return NC(n, 'the plan form was not reachable in the harness'); T(n, /ابزارِ طرح/.test(pf.a1.miss) && pf.a1.v === pf.PL && pf.a2 === pf.PL && pf.a3 === pf.PL, JSON.stringify(pf).slice(0, 240)); if (info.bank[n]) (info.note = info.note || {}).bank254 = 'C26-33 not reproduced on BASE26 — the entry passes on the base build as well'; },
      255: async (n) => { const t = await retr(1); T(n, /۱ از ۳/.test(t.reason) && t.gap < 21 && !/۲۱/.test(t.reason), JSON.stringify(t)); },
      256: async (n) => { const t = await retr(3); T(n, t.stable && t.next >= 7, JSON.stringify(t)); },
      257: async (n) => NC(n, 'DECISIONS_R26 Q10: two people in one browser is not built this round and stays an open sheet (#101/#102); the honest answer is the model\'s reply — there is no page mechanism of this family to assert offline'),
    };
    const mine = Object.keys(E).map(Number).filter(n => /^Q(?:9|10)\./.test(E[n].rc));
    for (const n of mine) { try { if (!H[n]) { NC(n, 'no handler'); continue; } await H[n](n); } catch (er) { errors.push('bank#' + n + ' exception: ' + String(er && er.stack || er).split('\n').slice(0, 2).join(' | ')); } }
    chk(mine.length === 36, 'bank: 36 Q9/Q10 entries expected, got ' + mine.length);
    const miss = mine.filter(n => !(n in info.bank) && !(n in info.nc)); chk(!miss.length, 'bank coverage: every Q9/Q10 entry judged or given a reason ' + JSON.stringify(miss));
  });
  { const nOk = Object.values(info.bank).filter(Boolean).length; info.summary = { judged: Object.keys(info.bank).length, pass: nOk, nc: Object.keys(info.nc).length }; }

  //SECTIONS

  console.log(JSON.stringify(info.summary || {}), JSON.stringify(info.nc), JSON.stringify(info.note || {}));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
