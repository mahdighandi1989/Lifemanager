// تورِ پولیا (دستهٔ ۱، دورِ ۲۷، سهمِ «classify» — ۲۰۲۶-۱۱-۱۵) — DECISIONS_R27 R8: C55 (حرفِ او بایت‌به‌بایت)، C22/C38 (نامِ کوچکِ بی‌نشان)، سازوکارهای کوچک
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۷ (پرامپت‌ها در round27X/<sid>/ai/pN.json): B27·D4 (s12 p1/p7، aB4 p1)، U37 (s12)، D26-40 (aD3)،
//           C27-4 (aC1 p12)، D27-33 (arD2 p12)، D27-25 (s37 p13)، D27-26 (s38 p5/p6)، C26-32 (pC1 p13)
//  bank     ورودی‌های R8 در بانکِ مستقلِ tests/variants/VARIANTS_R27.json (اگر هست)؛ آن‌چه برآورده نشد با دلیل در info.nc — هیچ ورودی‌ای بی‌صدا رد نمی‌شود.
//  ساعتِ صفحه یخ زده است (APP.today = روزِ ثابت) — هیچ انتظاری به تاریخِ تقویم بسته نیست.
// LLA_FILE = ساختِ دیگر؛ ONLY=c55,names,small,bank
// LLA_FILE = ساختِ دیگر؛ ONLY=pii,titles,reg,dom,post,child,mind,u54,q10,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = [process.env.LLA_VARIANTS27, path.join(__dirname, 'variants', 'VARIANTS_R27.json')].find(f => f && fs.existsSync(f));
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

  const views = (vs, re) => ev(([vs, re]) => { const o = [], R = new RegExp(re); try { APP.ASSIST.toggle(false); } catch (e) { } /* حبابِ گفت‌وگو حرفِ خودِ اوست و می‌ماند (C38) — فقط نماهای صفحه */ vs.forEach(v => { APP.go(v); document.body.innerText.split('\n').filter(l => R.test(l)).forEach(l => o.push(v + ': ' + l.slice(0, 140))); }); return o; }, [vs, re]);
  const person = async (age, msgs) => { await wipe(); await setB(age ? await birthFor(age) : ''); await fresh(); await ev((msgs) => { const s = __cur(); let i = 0; const now = () => new Date(Date.UTC(2026, 9, 19, 8, i++)).toISOString(); (msgs || []).forEach(t => { s.msgs.push({ role: 'user', text: t, at: now() }, { role: 'ai', text: 'خوب.', at: now() }); }); APP.S.put(s); }, msgs || []); };
  /* گرهِ متنی‌ای که خودِ صفحه در #main می‌گذارد (برچسب + حرفِ او در یک رشته) — همان گذرگاهِ regDom26 (ناظرِ تغییر) آن را می‌خواند */
  const domLine = (t, svg) => ev(async ([t, svg]) => { APP.go('home'); await new Promise(r => setTimeout(r, 120)); const mn = document.getElementById('main');
    if (svg) { const NS = 'http://www.w3.org/2000/svg'; const g = document.createElementNS(NS, 'svg'); g.setAttribute('class', svg); const tx = document.createElementNS(NS, 'text'); tx.textContent = t; g.appendChild(tx); mn.appendChild(g); await new Promise(r => setTimeout(r, 120)); return tx.textContent; }
    const el = document.createElement('p'); el.className = 't27'; el.textContent = t; mn.appendChild(el); await new Promise(r => setTimeout(r, 120)); return el.textContent; }, [t, svg || '']);

  // ================= C55 — حرفِ او بایت‌به‌بایت؛ فقط متنِ صفحه ضمیر می‌گیرد (B27·D4، U37، D26-40) =================
  await section('c55', async () => {
    const S12P1 = 'جدول امروز: «از جلو و عقب یکی است، در دریا راه می‌رود» — ۵ حرفی. و یه افقی دیگه: حروف «ر ا ت س م ن ه ب» رو مرتب کن، یه کلمه ۸ حرفی. نیم ساعته موندم. شما که ماشینی، بگو.';
    const S12P7 = 'آره، هر هشت تا یه بار. درسی که گرفتم: اول بفهمم شرط چند تکه‌ست، رو یه تکه تمرکز کنم و نامزدها رو با تکه‌ی دیگه بسنجم؛ تو آناگرام هم خونه‌های خالی بکشم و حرف تقاطع رو بذارم.';
    await person(67, [S12P1, S12P7]);
    const KOL = 'کل: ' + S12P1.split(' نیم ساعته')[0];
    const k1 = await domLine(KOL);
    chk(k1 === KOL, 'B27·D4 s12 📜 «کل: …»: her statement stays byte-exact (no «مرتب کنید») — ' + k1);
    const DARS = 'درس: ' + S12P7.split('گرفتم: ')[1];
    const k2 = await domLine(DARS);
    chk(k2 === DARS, 'B27·D4 s12 📜 «درس: …»: her lesson keeps «تو آناگرام» (= in the anagram), never «شما آناگرام» — ' + k2);
    const STRIP = '🧭 «جدول امروز: «از جلو و عقب یکی است، در دریا …» — مبدأ: صورت · اکنون: بازنگری · مانده: فقط بازنگریِ خودت — حل به نتیجه رسید';
    const k3 = await domLine(STRIP);
    chk(/مانده: فقط بازنگریِ خودتان/.test(k3) && k3.indexOf('«جدول امروز: «از جلو و عقب یکی است، در دریا …»') >= 0, 'U37 s12: the strip\'s own words take «شما» even after her clipped title with an inner «, and her title stays — ' + k3);
    const k4 = await domLine('مانده: فقط بازنگریِ خودت؛ نتیجه را خودت بنویس.');
    chk(k4 === 'مانده: فقط بازنگریِ خودتان؛ نتیجه را خودتان بنویسید.', 'look-alike: page-authored text still goes through the register — ' + k4);
    const k5 = await domLine('درس: این را با تکه‌ی دیگر بسنج و خودت بنویس.');
    chk(/خودتان بنویسید/.test(k5) && /بسنجید/.test(k5), 'look-alike: two shared words are not her quote — ' + k5);
    const k6 = await domLine('کارِ پیشینِ تو (از گفت‌وگو)', 'rt-svg');
    chk(k6 === 'کارِ پیشینِ شما (از گفت‌وگو)', 'D26-40 aD3: a 🧭 route-map label (svg) is in «شما» for a «شما» person — ' + k6);
    const k7 = await domLine('کارِ پیشینِ تو', 'chart');
    chk(k7 === 'کارِ پیشینِ تو', 'look-alike: text in another svg (formula, chart) is untouched — ' + k7);
    const AB4 = 'سلام. من ۸۲ سالمه، معلم بازنشستهٔ جغرافیا. نوه‌م یه معما ازم پرسید که بلد نبودم و راستش یه کم خجالت کشیدم: «توی یه مزرعه مرغ و خرگوش هست؛ روی هم ۳۵ تا سر و ۹۴ تا پا دارن. چند تا مرغ و چند تا خرگوش؟» جواب رو نگو، می‌خوام خودم حل کنم و فردا برای نوه‌م توضیح بدم.';
    await person(82, [AB4]);
    const L = await ev((t) => APP.ASSIST.regSys(__cur(), t), '📅 از حرفِ خودت: «» جواب رو نگو، می‌خوام خودم حل کنم و فردا برای نوه‌م توضیح بدم» — سه‌شنبه ۵ آبان ۱۴۰۵ — در «امروز» بیاید؛ درست است؟');
    chk(L.indexOf('جواب رو نگو، می‌خوام خودم حل کنم و فردا برای نوه‌م توضیح بدم') >= 0 && !/نگویید/.test(L) && /از حرفِ خودتان/.test(L), 'B27·D4 aB4 s1/Today: her quoted «جواب رو نگو» stays byte-exact and the page words around it are «شما» — ' + L);
    const st0 = await ev(() => { const s = __cur(); s.msgs.push({ role: 'sys', at: new Date().toISOString(), text: '📅 از حرفِ خودت: «» جواب رو نگو، می‌خوام خودم حل کنم و فردا برای نوه‌م توضیح بدم» — درست است؟' }); APP.S.put(s); return APP.S.get(s.id).msgs.slice(-1)[0].text; });
    chk(/جواب رو نگو، می‌خوام/.test(st0) && /خودتان/.test(st0), 'B27·D4: the stored copy of the sys line keeps her bytes — ' + st0);
  });


  // ================= C22/C38 — نامِ کوچکِ بی‌نشان در عنوان، 🧭 و «امروز» (C27-4 aC1 p12، D27-33 arD2 p12) =================
  await section('names', async () => {
    const C = [
      ['حرفِ داداشم علی: اگه من ۶ تا تیله‌م رو بهش بدم، تیله‌هامون برابر میشه', 'حرفِ داداشم [نامِ شخص]: اگه من ۶ تا تیله‌م رو بهش بدم، تیله‌هامون برابر میشه', 'C27-4 aC1 p12 model title'],
      ['یه معمای دیگه: داداشم علی میگه اگه من ۶ تا تیله‌ م رو بهش بدم، تیله‌هامون برابر میشه.', 'یه معمای دیگه: داداشم [نامِ شخص] میگه اگه من ۶ تا تیله‌ م رو بهش بدم، تیله‌هامون برابر میشه.', 'C27-4 aC1 p12 her sentence as a title'],
      ['داداشم علی گفت کابل رو از مغازهٔ حسن آقا بگیرم، اونجا ارزون‌تره.', 'داداشم [نامِ شخص] گفت کابل رو از مغازهٔ [نامِ شخص] آقا بگیرم، اونجا ارزون‌تره.', 'D27-33 arD2 p12'],
      ['خواهرم آیسودا گفت جوابش ۱۲ میشه', 'خواهرم [نامِ شخص] گفت جوابش ۱۲ میشه', 'a name not in the common list, bound by the speech verb'],
      ['دوستِ پسرم کیان این رو پرسید', 'دوستِ پسرم [نامِ شخص] این رو پرسید', 'kin chain'],
      ['مریم خانم همسایه‌مون یه کیک پخت', '[نامِ شخص] خانم همسایه‌مون یه کیک پخت', 'postposed honorific'],
      // look-alikes: nothing changes
      ['علی ۳ سیب دارد و ۲ تا به رضا می‌دهد', null, 'look-alike C22: a problem character with no kin word stays'],
      ['داداشم امروز گفت جوابش ۱۲ میشه', null, 'look-alike: an adverb after «داداشم» is not a name'],
      ['داداشم ۶ تا تیله داره', null, 'look-alike: a number after «داداشم»'],
      ['داداشم هم همین رو گفت', null, 'look-alike: «هم»'],
      ['داداشم کتاب خرید', null, 'look-alike: an object noun followed by a verb is not a name unless it is a known name'],
      ['ممنون آقا، حاج آقا هم گفت', null, 'look-alike: «ممنون آقا» / «حاج آقا» are not names'],
      ['خانم معلم گفت', null, 'look-alike: «خانم معلم»'],
    ];
    const got = await ev((C) => C.map(c => APP.AGE.privLabel(c[0])), C);
    C.forEach((c, i) => chk(got[i] === (c[1] == null ? c[0] : c[1]), c[2] + ': «' + c[0] + '» ⇒ «' + got[i] + '»'));
    // the page: the live problem's title (as the model gave it) on the problem list, 🧭 strip and Today; her own chat message stays byte-exact
    await wipe(); await setB(await birthFor(9)); await fresh();
    const P12 = 'یه معمای دیگه: داداشم علی میگه اگه من ۶ تا تیله‌ م رو بهش بدم، تیله‌هامون برابر میشه. ثبتش کن ببینم درسته یا نه.';
    await turn(P12, 'خوب.', [{ do: 'live_new', title: 'حرفِ داداشم علی: ۶ تیله و برابری', statement: 'داداشم علی میگه اگه من ۶ تا تیله‌م رو بهش بدم، تیله‌هامون برابر میشه.', kind: 'prove' }]);
    const v = await ev(async () => { const L = APP.liveAll().map(r => r.p.title); const o = { L, views: [] }; for (const a of [['home'], ['e_prob']]) { APP.go.apply(APP, a); await new Promise(r => setTimeout(r, 150)); o.views.push(document.querySelector('#main').innerText); }
      o.msg = (__cur().msgs || []).filter(m => m.role === 'user').map(m => m.text)[0]; o.title = __cur().title || ''; return o; });
    chk(!/علی/.test(JSON.stringify(v.L)) && !/علی/.test(v.title) && !/داداشم علی/.test(v.views[0]) && !/حرفِ داداشم علی/.test(v.views[1]), 'C27-4: «علی» is in no title (problem list, 🧭, Today); her statement on the problem card stays as she wrote it — ' + JSON.stringify([v.L, v.title, v.views.map(t => t.split('\n').filter(l => /داداشم علی/.test(l)))]).slice(0, 500));
    chk(v.msg === P12, 'C55: her own chat message keeps the name as typed — ' + v.msg);
  });


  console.log(JSON.stringify(info.summary || {}), JSON.stringify(info.nc), JSON.stringify(info.note || {}));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
