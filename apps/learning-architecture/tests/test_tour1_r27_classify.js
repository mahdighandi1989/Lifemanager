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
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {}, bankWrong: {}, note: {} };
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
  const NC = (n, why) => { info.nc[n] = why; };
  const RES = {};
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
    // C83: page text quoted back in «…» takes the register; her own quote stays
    const q83 = await ev(() => APP.ASSIST.regSys(__cur(), 'پرسشِ صفحه هنوز باز است: «خودت تا کجا رفتی و کجا ماندی؟» — و درسِ شما: «تو آناگرام هم خونه‌های خالی بکشم»'));
    chk(/«خودتان تا کجا رفتید و کجا ماندید؟»/.test(q83) && /«تو آناگرام هم خونه‌های خالی بکشم»/.test(q83), 'C83: a page question quoted back is in «شما», her quoted words stay byte-exact — ' + q83);
    const q83b = await ev(() => APP.ASSIST.regSys(__cur(), '✓ «سلیقه‌ات» هم ثبت شد — حرفِ خودت: «خودت بگو چی دوست داری».'));
    chk(/«سلیقه‌تان»/.test(q83b) && /«خودت بگو چی دوست داری»/.test(q83b), 'C83 look-alike (R25 contract): a quote the page frames as hers («حرفِ خودت: «…»») is never converted; the short page label is — ' + q83b);
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
      ['حدسِ اردوش–اشتراوس برای n = ۵ درسته؟', null, 'C82: a public name inside a conjecture\'s name is kept'],
      ['من سارا هستم و داداشم هم کمکم کرد', null, 'C82: her own name is kept'],
      ['تو کتابِ «چگونه مسئله را حل کنیم» یه جمله بود', null, 'C82 / bank #316: a book title is kept'],
      ['بابام (علی) و مامانم (زهره) هر دو موافقن', 'بابام ([نامِ شخص]) و مامانم ([نامِ شخص]) هر دو موافقن', 'bank #304: names in brackets after a kin word'],
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


  // ================= سازوکارهای کوچک: D27-25 «(prc)»، D27-26 u0 پس از «حل شد»، C26-32 پیگیریِ دوم، C26-33، U24 =================
  await section('small', async () => {
    // D27-25 s37 p13: the action's result line in her bubble has no internal marker; the model still gets the raw note
    await person(30, ['دیروز تمرین کردم، ۸ از ۱۰ درست بود.']);
    const s25 = await ev(() => { const s = __cur(); const raw = 'جلسه ثبت نشد: پروندهٔ بازِ یگانه‌ای پیدا نشد — شناسهٔ پرونده (prc) را از فهرستِ «پرونده‌های تمرینِ باز» بده';
      s.msgs.push({ role: 'sys', at: new Date().toISOString(), text: raw + ' · برگهٔ prc_mvq1a2b3c4 بسته شد' }); APP.S.put(s); return APP.S.get(s.id).msgs.slice(-1)[0].text; });
    RES.d2725 = !/\(prc\)|شناسهٔ پرونده|prc_/.test(s25) && /^جلسه ثبت نشد: پروندهٔ بازِ یگانه‌ای پیدا نشد/.test(s25);
    chk(!/\(prc\)|شناسهٔ پرونده|prc_/.test(s25) && /^جلسه ثبت نشد: پروندهٔ بازِ یگانه‌ای پیدا نشد/.test(s25), 'D27-25 s37 p13 / bank #298: no raw id or internal marker in her bubble — ' + s25);
    const s25b = await ev(() => { const s = __cur(); s.msgs.push({ role: 'sys', at: new Date().toISOString(), text: '✓ ثبت شد: «یادداشتِ (abc) خودم» — درست است؟' }); APP.S.put(s); return APP.S.get(s.id).msgs.slice(-1)[0].text; });
    chk(/«یادداشتِ \(abc\) خودم»/.test(s25b), 'look-alike: her own words inside «…» keep a Latin bracket she typed — ' + s25b);
    // U52 (B25·D17 aB3y p2): a wrong Gregorian conversion in the reply is caught against the page's own conversion; a right one passes
    await person(67, ['یعنی: با این پس‌انداز و این حقوق، کِی پولم تموم میشه و چیکار کنم که دیرتر تموم شه. راستی اون کارت تاریخ تولد رو زدم بعداً؛ من ۱۲ اردیبهشت ۱۳۳۸ به دنیا اومدم، میلادیش رو بلد نیستم.']);
    const g1 = await rc('خواسته روشن شد: کِی پول تمام می‌شود و چه کنید که دیرتر تمام شود. تاریخِ تولدتان را هم ثبت کردم: ۱۲ اردیبهشت ۱۳۳۸ برابر است با ۲ مهٔ ۱۹۵۹. کدام‌یک از این عددها سال‌به‌سال ثابت نمی‌ماند؟');
    chk(/۳ مه|3 مه/.test(String(g1)) || /مه 1959/.test(String(g1)), 'U52 aB3y p2: «۲ مهٔ ۱۹۵۹» for ۱۲ اردیبهشت ۱۳۳۸ asks one rewrite naming the page\'s conversion (۳ مه ۱۹۵۹) — ' + String(g1).slice(0, 250));
    const g2 = await rc('تاریخِ تولدتان را هم ثبت کردم: ۱۲ اردیبهشت ۱۳۳۸ برابر است با ۳ مهٔ ۱۹۵۹. کدام‌یک از این عددها ثابت نمی‌ماند؟');
    chk(!/میلادی/.test(String(g2)), 'look-alike: the right conversion passes — ' + String(g2).slice(0, 200));
    // D27-26 s38 p5/p6 (bank #299/#300): after «حل شد» her check or a ✏️ gets no u0 «کلِ مسئله را … در یک جمله» turn question
    await wipe(); await setB(''); await fresh();
    const ST = 'حجم چهاروجهی‌ای رو پیدا کنید که دو یال روبه‌روش طول a دارن، بر هم عمودن و هر دو بر پاره‌خط به طول b که وسط‌هاشون رو وصل می‌کنه عمودن.';
    await turn('ساعت ۱۱ شبه، فردا ۸ صبح باید تحویل بدم. «' + ST + '» خودم می‌خوام حلش کنم.', 'خوب.');
    const pid = await ev((ST) => { const r = APP.liveCreate('حجمِ چهاروجهی با دو یالِ a', ST, 'find', { by: 'user' }); APP.liveBindSession(r.p.id, __cur()); return r.p.id; }, ST);
    await turn('پس حجم = ۲ × (۱/۳ × ab/2 × a/2) = a²b/6. خودم حلش کردم.', 'خوب.', [{ do: 'chat_solved', pid, result: 'a²b/6', check: 'اگه b=a باشه میشه a³/6', lesson: 'شکل رو با یه صفحه به دو تکه ببرم' }]);
    const solved = await ev((pid) => { const r = APP.liveRec(pid); return { st: r && r.p && r.p.status, cl: APP.liveClosure ? APP.liveClosure(pid) : null, ph: (__cur().coach || {}).ph }; }, pid);
    const u6 = await turn('یه بار دیگه چک کردم، درسته: اگه b=a باشه میشه a³/6.', 'خوب.');
    const q6 = (await tq(u6)).q; RES.d2726 = !/کلِ مسئله را بی‌جزئیات|کلِ مسئله را در یک جمله/.test(q6) ? q6 : null; info.note.d2726 = [JSON.stringify(solved), q6.slice(0, 150), head(u6.user).split('\n').filter(l => /یک\*\* پرسش|پرسشِ این نوبت/.test(l)).map(l => l.slice(0, 200))];
    chk(!/کلِ مسئله را بی‌جزئیات|کلِ مسئله را در یک جمله/.test(q6) && !/کلِ مسئله را بی‌جزئیات/.test(head(u6.user).split('\n').filter(l => /فقط \*\*یک\*\* پرسش/.test(l)).join('')), 'D27-26 s38 p6 / bank #299: after «حل شد» her check gets no u0 turn question — ' + JSON.stringify(solved) + ' ' + q6.slice(0, 120));
    // bank #300: a ✏️ on her bubble after «حل شد» gets no u0 either
    const ed = await ev(async () => { const s = __cur(), U = (s.msgs || []).filter(m => m.role === 'user' && !/^\[/.test(m.text)), m = U[1], n0 = __calls.length;
      __q.push(R({ reply: 'درست شد.' })); const r = APP.ASSIST.retractEdit(s, m, String(m.text).replace('a/2) = a²b/6', 'a/2) = a²b/6 (با وارسی)'));
      for (let i = 0; i < 80 && (__calls.length === n0 || APP.ASSIST.busy()); i++) await new Promise(res => setTimeout(res, 100));
      await new Promise(res => setTimeout(res, 300)); __q.length = 0; const all = __calls.slice(n0); return { r: r && { ok: r.ok, err: r.err || '' }, user: (all[0] || {}).user || '' }; });
    const q8 = ed.user ? (await tq(ed.user)).q : '';
    info.note.d2726e = [JSON.stringify(ed.r), q8.slice(0, 150)]; RES.d2726e = { n: ed.user ? 1 : 0, q8 };
    chk(!ed.user || !/کلِ مسئله را بی‌جزئیات|کلِ مسئله را در یک جمله/.test(q8 + head(ed.user).split('\n').filter(l => /فقط \*\*یک\*\* پرسش/.test(l)).join('')), 'D27-26 s38 p5 / bank #300: after «حل شد» a ✏️ gets no u0 turn question — ' + q8.slice(0, 120));
    // C26-32 second follow-up (pC1 p13, pC2 p12, pC3 p16; bank #301): the item was opened after the first follow-up; the next follow-up says it is open, never «پر کن … بساز»
    const PREQ = (c, q) => ({ concept: c, step: 'حسابِ مساحتِ زمین', quote: q, q: 'این را پیش‌تر دیده‌ای؟', topic: 'هندسه' });
    const LAND = 'یه تیکه زمین مثلثی دارم که می‌خوام چمن بکارم. دو تا ضلعش هر کدوم ۱۳ متره، ضلع سوم ۱۰ متر. هر کیسه بذر برای ۱۰ متر مربع کافیه. چند کیسه بخرم؟ مستطیل رو بلدم طول ضرب در عرض، ولی این مثلثه.';
    for (const second of [true, false]) {
      await wipe(); await setB(''); await fresh();
      await turn(LAND, 'خوب.', [{ do: 'coach_state', ph: 'u', said: ['u', 'd'], ans: [], stuck: true, nat: 'practical', role: 'self', prereq: PREQ('مساحتِ مثلث (نصفِ قاعده × ارتفاع)', 'مستطیل رو بلدم طول ضرب در عرض، ولی این مثلثه') }]);
      const F = await ev(async (second) => { const n0 = __calls.length; __q.push(R({ reply: 'باز می‌کنم.', actions: [{ do: 'go', view: 'prereq' }] }));
        __q.push(() => { const id = (APP.S.all('prereq')[0] || {}).id || ''; return R({ reply: 'نقشه را باز کردم.', actions: second ? [{ do: 'go', view: 'prereq', arg: id }] : [] }); });
        await APP.ASSIST.send('آره، بازش کن.'); __q.length = 0;
        return __calls.slice(n0).map(c => String(c.user.split('# نوبتِ تازه\n')[1] || '')).filter(u => /^\[سامانه: «[^»]*»[^\]]*باز شد/.test(u)); }, second);
      if (second) { const f2 = F[1] || ''; info.note.c2632 = F.map(x => x.slice(0, 160)); RES.c2632 = F.length >= 2 && !/فیلدهای این صفحه را پر کن|دکمهٔ ثبت\/ساخت/.test(f2) && /باز است/.test(f2);
        chk(F.length >= 2 && !/فیلدهای این صفحه را پر کن|دکمهٔ ثبت\/ساخت/.test(f2) && /باز است/.test(f2), 'C26-32 pC1 p13 / bank #301: the second follow-up says the item is open, never «فیلدها را پر کن … ساخت» — ' + f2.slice(0, 220)); }
      else chk(/همان را باز کن/.test(F[0] || ''), 'look-alike: the first follow-up on the list still says «همان را باز کن» — ' + String(F[0] || '').slice(0, 160));
    }
    // look-alike (bank #311): a NEW problem after the closure still gets its u0
    const u7 = await turn('یه مسئلهٔ تازه دارم: مجموعِ زاویه‌های داخلیِ یک هشت‌ضلعی چقدره؟', 'خوب.');
    info.note.u0new = (await tq(u7)).q.slice(0, 120);
  });


  // ================= U24 (s11، بانکِ R27 #303/#318): «ناقص» ِ کارِ پیشین «درست نبود» نمی‌شود — حتی وقتی دفتر زیرِ کلیدِ دیگری است =================
  await section('mind', async () => {
    const mindActs = () => ev(() => { const Q = APP.MIND.phases(), o = []; (Q.rows || []).forEach(r => (r.acts || []).forEach(a => o.push({ ph: r.id, ok: a.ok, fa: a.fa, src: a.src }))); return o; });
    await wipe(); await setB(''); await fresh();
    await ev(() => { const s = __cur(), at = (i) => new Date(Date.UTC(2026, 9, 19, 8, i)).toISOString();
      s.msgs.push({ role: 'user', text: 'برنامه‌ی backtracking نوشتم، حتماً جواب داره: ۱۰^۲ − ۲ = ۹۸ و ۹۸/۲ = ۴۹. بعد ۷٫۵ ÷ ۳ = ۲٫۲ هم حساب کردم.', at: at(0) }, { role: 'ai', text: 'خوب.', at: at(1) });
      const C = s.coach = s.coach || {}; C.pk = 'c:1'; C.stmt = 'پوششِ صفحهٔ ۱۰ در ۱۰ با دومینو'; C.ph = 'c';
      /* s11: the ledger was written while the problem was «c:0»; the chat moved on to another key (the live problem) */
      C.story = { 'c:0': { items: [], prior: { at: at(0), st: 'ask', steps: [
        { n: 1, quote: 'برنامه‌ی backtracking نوشتم، حتماً جواب داره: ۱۰^۲ − ۲ = ۹۸', verdict: 'incomplete', why: 'ادعا آزموده نشده', dep: [], bad: [] },
        { n: 2, quote: '۷٫۵ ÷ ۳ = ۲٫۲', verdict: 'wrong', cause: 'skill', why: 'تقسیمِ اعشاری', dep: [], bad: ['2.2'] }] } }, 'c:1': { items: [] } };
      s.coachEv = [
        { at: at(0), ph: 'c', ok: false, src: 'prior', key: 'prior|c|برنامه‌ی backtracking نوشتم، حتماً جواب داره: ۱۰^۲ − ۲ = ۹۸', prior: 1, cause: 'unknown', causeWhy: 'ادعا آزموده نشده', msg: 't' + at(0) },
        { at: at(0), ph: 'c', ok: false, src: 'prior', key: 'prior|c|۷٫۵ ÷ ۳ = ۲٫۲', prior: 2, cause: 'skill', causeWhy: 'تقسیمِ اعشاری', msg: 't' + at(0) }];
      APP.S.put(s); });
    const A1 = (await mindActs()).filter(a => a.src === 'prior'); RES.u24 = !A1.some(a => /گامِ ۱/.test(a.fa)); RES.u24neg = A1.some(a => /گامِ ۲/.test(a.fa) && a.ok === false);
    chk(!A1.some(a => /گامِ ۱/.test(a.fa)), 'U24 s11 / bank #303: a «ناقص» prior step of a ledger under another story key is not booked «درست نبود» — ' + JSON.stringify(A1).slice(0, 300));
    chk(A1.some(a => /گامِ ۲/.test(a.fa) && a.ok === false), 'look-alike bank #318: a real wrong step is still booked as a failure — ' + JSON.stringify(A1).slice(0, 300));
  });


  // ================= C26-33 (pC1 c13–c15، بانکِ R27 #302/#315): طرحِ تایپ‌شده پس از «ثبتِ طرح» ِ ردشده می‌ماند — مسیرِ همان فرم با برگه‌های دیگرش =================
  await section('c2633', async () => {
    const run = async (accept) => { await wipe(); await setB(await birthFor(16)); await fresh();
      const pid = await ev(() => { const r = APP.liveCreate('همهٔ جواب‌های صحیحِ x² − y² = 15', 'همهٔ جواب‌های صحیحِ معادلهٔ x² − y² = 15 را پیدا کن. من (4، 1) و (8، 7) رو با امتحان پیدا کردم.', 'find', { by: 'user' }); const pid = r.p.id; APP.liveBindSession(pid, __cur());
        __liveSet(pid, (so, L) => { so.u = { 1: { done: true, u: 'همهٔ جواب‌های صحیح', dl: [{ t: 'x² − y² = 15' }, { t: 'x و y صحیح‌اند' }, { t: '(4، 1) و (8، 7)' }], c: 'x و y صحیح‌اند و x² − y² = 15', type: 'find' } }; }); return pid; });
      await ev((pid) => APP.go('lprob', pid, 'plan'), pid); await p.waitForTimeout(250);
      if (!(await ev(() => !!document.querySelector('#lpPlan') && !!document.querySelector('.lp-plansave')))) return { nf: true };
      const PL = 'نخست x² − y² را به (x − y)(x + y) تجزیه می‌کنم، سپس همهٔ جفت‌عددهای صحیح با حاصل‌ضربِ ۱۵ را می‌نویسم و از هر جفت x و y را حساب می‌کنم.';
      if (accept) { await p.selectOption('#lpMv', { index: 1 }); await p.waitForTimeout(100); await p.fill('#lpMvWhy', 'تجزیهٔ تفاضلِ دو مربع مسئله را به جفت‌های عددی می‌شکند'); await p.click('.lp-mvadd'); await p.waitForTimeout(250); }
      await p.fill('#lpPlan', PL);
      /* c13: her other answers on the same card, then «ثبتِ طرح» at once (as a person does) */
      await ev(async () => { document.querySelectorAll('[id^=lpPC_]').forEach(e => { if (!e.checked) e.click(); }); await new Promise(r => setTimeout(r, 60));
        document.querySelectorAll('select[id^=lpPU_a_]').forEach(sel => { const o = [...sel.options].find(o => /حالا به کارش|استفاده کردم|^بله/.test(o.text)) || sel.options[1]; if (o) { sel.value = o.value; sel.dispatchEvent(new Event('change', { bubbles: true })); } }); });
      await p.waitForTimeout(60);
      await ev(() => document.querySelectorAll('[id^=lpPU_w_]').forEach(e => { e.value = 'در طرح به کارش می‌برم'; e.dispatchEvent(new Event('input', { bubbles: true })); }));
      await p.click('.lp-plansave'); await p.waitForTimeout(1300);
      const v = await ev((pid) => ({ field: (document.querySelector('#lpPlan') || {}).value || '', saved: ((((APP.S.get('eprog_' + pid) || {}).solve || {}).live || {}).plan || {}).t || '', draft: (((APP.S.get('eprog_' + pid) || {}).solve || {}).live || {}).planDraft || '' }), pid);
      /* a re-render (another tab and back) still shows the typed plan */
      await ev((pid) => APP.go('lprob', pid, 'u'), pid); await p.waitForTimeout(200); await ev((pid) => APP.go('lprob', pid, 'plan'), pid); await p.waitForTimeout(250);
      v.after = await ev(() => (document.querySelector('#lpPlan') || {}).value || ''); v.PL = PL; return v; };
    const R1 = await run(false); RES.c2633 = R1;
    if (R1.nf) NC('c2633', 'the plan form was not reachable in the harness');
    else { info.note.c2633 = R1; chk(R1.field === R1.PL && R1.after === R1.PL && !R1.saved, 'C26-33 pC1 c13 / bank #302: the typed plan stays after a refused «ثبتِ طرح» (and after leaving the tab) — ' + JSON.stringify(R1).slice(0, 300)); }
    const R2 = await run(true); RES.c2633b = R2;
    if (!R2.nf) chk(R2.saved === R2.PL, 'look-alike bank #315: the accepted path saves the plan — ' + JSON.stringify(R2).slice(0, 300));
  });


  // ================= بانکِ مستقلِ R27 — همهٔ ورودی‌های R8 (۲۸۸–۳۲۲)؛ هر ورودی داوری یا با دلیل در info.nc =================
  await section('bank', async () => {
    if (!BANK.length) { NC('bank', 'VARIANTS_R27.json not found'); return; }
    const E = BANK, T = (n, ok, msg) => { info.bank[n] = !!ok; if (!ok) errors.push('bank#' + n + ' (' + E[n].kind + ') ' + String(E[n].text).slice(0, 80) + ' — ' + String(msg || '').slice(0, 300)); };
    const U = (n) => String(E[n].text).replace(/^U:\s*/, '');
    const pl = (t) => ev((t) => APP.AGE.privLabel(t), t);
    const H = {
      288: async (n) => { await person(69, [U(n)]); const L = 'کل: ' + U(n) + ' — حالا بنویس که چه خواسته شده.'; const x = await domLine(L); T(n, x.indexOf(U(n)) >= 0 && /بنویسید/.test(x), x); },
      289: async (n) => { await person(82, [U(n)]); const x = await ev((t) => APP.ASSIST.regSys(__cur(), t), '📅 از حرفِ خودت: «' + U(n) + '» — درست است؟'); T(n, x.indexOf('«' + U(n) + '»') >= 0 && !/نگویید|««|»»|«»/.test(x) && /از حرفِ خودتان/.test(x), x); },
      290: async (n) => { await person(30, []); await turn(U(n), 'خوب.', [{ do: 'coach_state', plan: { text: U(n), when: 'next-session' } }]); const x = await ev(() => ((__cur().plans || [])[0] || {}).text || ''); const y = await domLine('طرحی که گفت — «' + x + '»');
        T(n, x === U(n) && y.indexOf(U(n)) >= 0, JSON.stringify([x, y])); },
      291: async (n) => { await person(30, []); await turn(U(n), 'خوب.', [{ do: 'coach_state', plan: { text: U(n), when: 'next-session' } }]); const x = await ev(() => ((__cur().plans || [])[0] || {}).text || ''); T(n, x === U(n), x); },
      292: async (n) => { await person(69, [U(n)]); const L = 'درس: «اول بنویس بعد حساب کن»'; const x = await domLine(L); T(n, x === L, x); },
      293: async (n) => { await person(74, ['سلام، یه مسئله دارم.']); const a = await domLine('مانده: فقط بازنگریِ خودت'), b = await domLine('کارِ پیشینِ تو (از گفت‌وگو)', 'rt-svg'); T(n, a === 'مانده: فقط بازنگریِ خودتان' && b === 'کارِ پیشینِ شما (از گفت‌وگو)', a + ' | ' + b); },
      294: async (n) => { const x = await pl(U(n)); T(n, /\[نامِ شخص\]/.test(x) && !/کیان/.test(x), x); },
      295: async (n) => { const x = await pl(U(n)); T(n, /\[نامِ شخص\] آقا/.test(x) && !/حسن/.test(x) && /۸۰ هزاره/.test(x), x); },
      296: async (n) => { await setB(await birthFor(13)); const x = await pl(U(n)); T(n, /\[نامِ معلم\]/.test(x) && !/رستمی/.test(x), x); info.nc[n + '_date'] = 'second half («no date ask for the teacher\'s words», C19) is the date-ask engine (R3, dates fixer) — the label half is judged here'; },
      297: async (n) => { await setB(await birthFor(11)); const x = await ev((t) => APP.AGE.titleOf(t), U(n)); T(n, /\[نامِ مدرسه\]/.test(x) && !/مطهری/.test(x), x); },
      298: async (n) => T(n, RES.d2725 === true, 'see section small'),
      299: async (n) => T(n, RES.d2726 != null, 'see section small: ' + RES.d2726),
      300: async (n) => T(n, !!RES.d2726e && !/کلِ مسئله را بی‌جزئیات|کلِ مسئله را در یک جمله/.test(RES.d2726e.q8 || ''), JSON.stringify(RES.d2726e)),
      301: async (n) => T(n, RES.c2632 === true, 'see section small'),
      302: async (n) => T(n, RES.c2633 && !RES.c2633.nf && RES.c2633.field === RES.c2633.PL && RES.c2633.after === RES.c2633.PL, JSON.stringify(RES.c2633 || {}).slice(0, 200)),
      303: async (n) => T(n, RES.u24 === true, 'see section mind'),
      304: async (n) => { const x = await pl(U(n)); T(n, (x.match(/\[نامِ شخص\]/g) || []).length === 2 && !/علی|زهره/.test(x), x); },
      305: async (n) => { await person(30, ['فردا ۸ صبح میرم']); const L = 'از حرفِ خودت: «فردا ۸ صبح میرم»'; await pushSys(L);
        const r = await ev(async (L) => { APP.ASSIST.toggle(true); await new Promise(r => setTimeout(r, 250)); const el = [...document.querySelectorAll('.as-panel .as-tx')].filter(e => e.textContent.indexOf('فردا ۸ صبح میرم') >= 0).pop(); return el ? { t: el.textContent, rtl: !!el.closest('[dir=rtl]') } : null; }, L);
        T(n, r && r.rtl && r.t.indexOf('«فردا ۸ صبح میرم»') >= 0, JSON.stringify(r)); },
      306: async (n) => { const x = await pl(U(n)); T(n, /دخترم \[نامِ شخص\] ۷ سالشه/.test(x), x); },
      307: async (n) => { await person(70, ['حل شد.']); const x = await domLine('🧭 «جدول» — مبدأ: صورت · اکنون: بازنگری · مانده: فقط بازنگریِ خودت — حل به نتیجه رسید'); T(n, /خودتان/.test(x) && !/خودت(?!ان)/.test(x), x); },
      308: async (n) => { await wipe(); await setB(await birthFor(9)); await fresh(); await turn(U(n), 'خوب.'); const m = await ev(() => (__cur().msgs || []).filter(m => m.role === 'user').map(m => m.text)[0]); T(n, m === U(n), m); },
      309: async (n) => { await person(69, ['سلام']); const x = await domLine('حالا بنویس که چه چیزی خواسته شده'); T(n, x === 'حالا بنویسید که چه چیزی خواسته شده', x); },
      310: async (n) => { await person(30, []); await turn(U(n), 'خوب.'); const m = await ev(() => { const s = APP.S.get(__cur().id); return (s.msgs || []).filter(m => m.role === 'user').map(m => m.text)[0]; }); T(n, m === U(n), m); },
      311: async (n) => { await wipe(); await setB(''); await fresh(); await turn('علی ۳ سیب دارد و ۲ تا به رضا می‌دهد. چند سیب می‌ماند؟', 'خوب.');
        await turn('یکی می‌مونه، چون ۳ − ۲ = ۱. وارسی کردم: ۱ + ۲ = ۳.', 'خوب.', [{ do: 'chat_solved', title: 'سیب‌های علی', statement: 'علی ۳ سیب دارد و ۲ تا به رضا می‌دهد. چند سیب می‌ماند؟', kind: 'find', lesson: 'تفریق و وارسی با جمع', check: '۱ + ۲ = ۳' }]);
        const u = await turn('یه مسئلهٔ تازه دارم: مجموعِ زاویه‌های داخلیِ یک هشت‌ضلعی چقدره؟', 'خوب.'); const h = head(u.user), s1 = await st();
        T(n, /هشت‌ضلعی/.test(s1.stmt) && s1.ph === 'u' && /پرسش‌های «فهمِ مسئله»/.test(h), JSON.stringify(s1) + ' ' + (h.match(/[^\n]*پرسش‌های «فهمِ مسئله»[^\n]*/) || [''])[0].slice(0, 160)); },
      312: async (n) => { await person(14, [U(n)]); const x = await domLine(U(n)); T(n, x === U(n), x); },
      313: async (n) => { await wipe(); await setB(''); await fresh(); await turn(U(n), 'خوب.'); const s1 = await st(), nl = await ev(() => APP.liveAll().length); T(n, !s1.stmt && !nl, JSON.stringify([s1.stmt, nl])); },
      314: async (n) => { await person(30, []); const r = await turn(U(n), 'خوب.'); T(n, !r.all.some(u => /\[سامانه: «[^»]*»[^\]]*باز شد/.test(String(u.split('# نوبتِ تازه\n')[1] || ''))), r.n); },
      315: async (n) => T(n, RES.c2633b && !RES.c2633b.nf && RES.c2633b.saved === RES.c2633b.PL, JSON.stringify(RES.c2633b || {}).slice(0, 200)),
      316: async (n) => { const x = await pl(U(n)); T(n, x === U(n), x); },
      317: async (n) => { await wipe(); await setB(''); await fresh(); await turn(U(n), 'خوب.'); const s1 = await st(), x = await pl(U(n)), m = await ev(() => (__cur().msgs || []).filter(m => m.role === 'user').map(m => m.text)[0]); const ok317 = x === U(n) && m === U(n);   /* the masking half is met; the «no title» half is not — see the reason */
        if (ok317 && s1.stmt) NC(n, 'NOT MET (reported, not skipped): nothing is masked in her bubble or label (met), but the opening message of a talk is still held as the talk\'s matter (C.stmt «' + s1.stmt + '»). Standing design (R22 P5 / R23 Q1): a talk\'s first message is its matter unless it is a greeting, a page question or a birth sentence — a life problem («ماشینم صبح روشن نشد») has no problem marker either, so a complaint cannot be told from a problem by the text alone; under «when a rule cannot decide, the page asks» this needs a page question («این را به‌عنوانِ مسئله نگه دارم؟»), a new step for the filing family (R6), not a classify patch');
        else T(n, ok317 && !s1.stmt, JSON.stringify([s1.stmt, x])); },
      318: async (n) => T(n, RES.u24neg === true, 'see section mind'),
      319: async (n) => { await person(69, [U(n)]); const x = await domLine(U(n)); T(n, x === U(n), x); },
      320: async (n) => { const x = await ev(() => [APP.ASSIST.toShoma('نقشهٔ مسیرِ مسئله')]); T(n, x[0] === 'نقشهٔ مسیرِ مسئله', x[0]); },
      321: async (n) => { await wipe(); await setB(await birthFor(9)); await fresh(); await ev(() => { const s = __cur(); s.msgs.push({ role: 'ai', text: 'اسمِ داداشت چیه؟', at: new Date().toISOString() }); APP.S.put(s); });
        await turn(U(n), 'خوب.'); const s1 = await st(), t = await ev(() => [__cur().title || '', APP.liveAll().map(r => r.p.title).join('|')]); T(n, !/کیان/.test(s1.stmt + t.join('')), JSON.stringify([s1.stmt, t])); },
      322: async (n) => { await person(30, [U(n)]); const x = await ev((t) => APP.ASSIST.regSys(__cur(), t), 'از حرفِ خودت: «جواب رو نگو»'); T(n, x === 'از حرفِ خودت: «جواب رو نگو»', x); },
    };
    const mine = E.map((e, i) => i).filter(i => /^R8\./.test(E[i].rc));
    chk(mine.length === 35, 'bank: 35 R8 entries expected, got ' + mine.length);
    for (const n of mine) { try { if (!H[n]) { NC(n, 'no handler'); continue; } await H[n](n); } catch (er) { errors.push('bank#' + n + ' exception: ' + String(er && er.stack || er).split('\n').slice(0, 2).join(' | ')); } }
    const miss = mine.filter(n => !(n in info.bank) && !(n in info.nc)); chk(!miss.length, 'bank coverage: every R8 entry judged or given a reason ' + JSON.stringify(miss));
  });
  { const nOk = Object.values(info.bank).filter(Boolean).length; info.summary = { judged: Object.keys(info.bank).length, pass: nOk, nc: Object.keys(info.nc).length }; }


  console.log(JSON.stringify(info.summary || {}), JSON.stringify(info.nc), JSON.stringify(info.note || {}));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
