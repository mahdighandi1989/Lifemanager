// تورِ پولیا (دستهٔ ۱، دورِ ۲۳ — سهمِ «today» — ۲۰۲۶-۱۰-۱۹) — DECISIONS_R23: Q7 «امروز / پرونده / فهرست‌ها / تمرین / قول‌ها».
//  جمله‌های خودِ اجراکننده‌ها (round23{A,B,C,D})، هر کدام قرمز روی ساختِ پایه (main 574f4a30):
//   A23-11 (aA3 روزِ ۲: «⏰ پیگیری: تماس با داروخانه…» و «📌 برنامهٔ خودت (pl1): «فردا صبح … زنگ می‌زنم» — انجام شد؟» برای یک کار؛ سطرِ برنامه «فردا» را در همان روز نقل می‌کند)
//   A23-11 (aA2 روزِ ۲: سه سطر برای یک کار — کارتِ «بازیابی پیش از نگاه»، «برگهٔ سفید روزِ ۱» و «مرورِ حلِ مسئله»)
//   D23-31 (aD2 روزِ ۳۴: «⏰ پیگیری» و «📌 برنامه… انجام شد؟» دو سطر؛ oD1 روزِ ۳: «📌 برنامه» + «🎯 پیش‌بینی»)
//   D23-40 (s31: مسئله‌های ساختهٔ بازنگری هنوز در «امروز» دیده نمی‌شوند) · B·D15 (s14: «⏰ «میان‌ترمِ آمار» … تحویل دادی؟» هشت روز پس از «میان‌ترم رو ۱۴ گرفتم»)
//   C23-9 (شناسهٔ خامِ «(pl1)» در «امروز») · C23-15 (s22 p12: «اصلاح شد ⇐ «refuted» → «»») · C22-11/B·D23 (aB2: «فکر کنم میشه n(n+1)» سپس سه حالت + استقرا ⇒ هنوز «آزموده نشده»)
//   A23-16 (s04 p11: «# اصلاحی که صفحه انجام داد» دو بار در یک پرامپت) · A23-24 (s07 p7: هر تغییر دو بار در بلوکِ نتیجه) · A23-29 (oA1 p6: دو سطرِ تأیید برای یک ساختن)
//   D23-33 (oD1 p9: «آره جدا ثبتش کن ولی بعداً» قول نشد) · C23-7 (s22 p21: نقلِ دو پیامِ پیاپی رد شد) · C23-20 (s25 p17: «روش تلسکوپی» ⇒ موردِ دوم با کلِ جمله)
//   B·D21 (s18: مدلِ دستیار و «کاربستِ مدل» ِ صفحه دو مورد شدند) · A23-12 (aA2: «امروز» ۲۷–۲۸، پرونده/گفت‌وگو ۲۷–۲۹) · A23-15 (aA3 p7: پیش‌بینیِ پاسخِ e1 «حدسِ تازه» شد)
//  و بانکِ مستقلِ VARIANTS_R23 (tests/variants/VARIANTS_R23.json) برای Q7.
// LLA_FILE = ساختِ دیگر (قرمزِ اول)؛ ONLY=a11,d31 …
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = [path.join(__dirname, 'variants', 'VARIANTS_R23.json')].find(f => fs.existsSync(f)) || '';
const BANK = BANKF ? JSON.parse(fs.readFileSync(BANKF, 'utf8')) : [];

const T0 = Date.parse('2026-10-18T10:00:00+03:30');   // یکشنبه ۲۶ مهر
const ymd = (n) => new Date(Date.UTC(2026, 9, 18 + n)).toISOString().slice(0, 10);

const HELPERS = () => {
  const S = APP.S;
  APP.S.loaded = true; window.__noNav = true;
  window.__q = []; window.__sys = []; window.__res = [];
  APP.callAI = async (sys, user, opts) => { __sys.push(String(sys || '') + '\n' + String(user || '')); let r = __q.shift(); const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
  window.__say = async (text, reply, actions) => { __sys.length = 0; __q.push({ reply: reply || 'باشه.', status: 'related', memory: 'm', actions: actions || [] }); await APP.ASSIST.send(text); __q.length = 0; return __sys.join('\n'); };
  window.__cur = () => APP.ASSIST.cur ? APP.ASSIST.cur() : APP.S.get(localStorage.getItem('lla.assist.cur'));
  window.__freshChat = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); return APP.ASSIST.newSession().id; };
  window.__wipe = () => { ['practice', 'ex', 'fcast', 'kexp', 'case', 'card', 'sched', 'pr', 'topic', 'knot', 'kcase', 'eprob', 'eprog', 'achat', 'deadline', 'lprob'].forEach(t => { try { S.all(t).forEach(r => S.del(r.id)); } catch (e) { } }); localStorage.removeItem('lla.assist.cur'); APP.go('home'); };
  window.__today = () => APP.dueList().map(d => (d.txt || '') + ' ‖ ' + (d.sub || ''));
  window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p ? r.p.id : r.id; };
  window.__fc = (q, p, due, extra) => S.put(Object.assign({ id: APP.uid('fc'), type: 'fcast', q, p, due: due || APP.today(), dim: 's_decision', created: new Date().toISOString() }, extra || {}));
  window.__cs = (o) => Object.assign({ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);
};

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { runners: {}, bank: {}, nc: {} };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'Asia/Tehran' });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.clock.install({ time: new Date(T0) });
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.message || e).split('\n')[0]); } };
  const E = (fn, arg) => p.evaluate(fn, arg);
  const day = async (n, hour) => { await p.clock.setSystemTime(new Date(T0 + n * 864e5 + ((hour == null ? 10 : hour) - 10) * 36e5)); };
  const load = async () => { await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(150); await E(HELPERS); };
  const fresh = async () => { await day(0); await E(() => __wipe()); };
  const X = (name, ok, x) => { info.runners[name] = !!ok; if (!ok) errors.push(name + ' :: ' + JSON.stringify(x).slice(0, 1200)); };
  await load();

  /* ===== A23-11 (aA3) + C23-9 + A23-15 — برنامه «فردا صبح به داروخانه زنگ می‌زنم» و پیگیریِ ⏰ همان تماس ===== */
  await section('a11', async () => {
    await fresh();
    await E(async (d1) => { __freshChat();
      await __say('سلام. من پروین هستم، معلمِ بازنشسته. نوه‌ام برنامهٔ دو دارو را برایم نوشت: یکی هر ۸ ساعت، یکی هر ۱۲ ساعت با غذا.', 'خوش آمدید. اول بگویید دقیقاً چه می‌خواهید بدانید؟');
      await __say('دو پرسش برای داروساز دارم. فردا صبح به داروخانهٔ سرِ کوچه زنگ می‌زنم و می‌پرسم نیم ساعت دیر و زود اشکال داره یا نه، و داروی اول با غذا باشه یا نه.',
        'دو پرسشِ دقیق برای داروساز آماده دارید و روزش را هم گذاشتید — فردا صبح. پیش از تماس: فکر می‌کنید داروساز چه می‌گوید، و چقدر مطمئنید؟',
        [__cs({ said: ['plan'], ans: ['e3'], register: 'شما', plan: { text: 'فردا صبح به داروخانهٔ سرِ کوچه زنگ می‌زنم', when: d1 } })]);
      await __say('فکر می‌کنم بگوید نیم ساعت اشکالی ندارد؛ هفتاد درصد مطمئنم.',
        'پیش‌بینی‌تان روشن است: «نیم ساعت اشکالی ندارد»، با هفتاد درصد اطمینان؛ آزمونش را هم خودتان گذاشته‌اید — تماسِ فردا صبح.',
        [{ do: 'deadline', what: 'پیگیری: تماس با داروخانه دربارهٔ ساعتِ داروها', date: d1 }, __cs({ said: ['guess'], ans: ['e1'], register: 'شما', guess: { text: 'فکر می‌کنم بگوید نیم ساعت اشکالی ندارد؛ هفتاد درصد مطمئنم' } })]);
    }, ymd(1));
    const g = await E(() => { const s = __cur(), C = s.coach || {}; return { guesses: (C.guesses || []).map(x => x.text), guess: C.guess && C.guess.text, preds: (C.preds || []).map(x => x.text), mg: (s.msgs || []).filter(m => m.guess).map(m => m.guess.text) }; });
    X('A23-15 aA3 p7: a prediction answering «چه می‌گوید و چقدر مطمئنید؟» is booked as a prediction, never as a «حدسِ تازه»', !g.guesses.some(t => /نیم ساعت/.test(t)) && !/نیم ساعت/.test(g.guess || '') && !g.mg.length && g.preds.some(t => /نیم ساعت/.test(t)), g);
    const nextP = await E(async () => await __say('باشه، فردا زنگ می‌زنم.', 'خوب.'));
    X('A23-15 aA3 p8: the next prompt does not ask «چطور می‌آزمایی‌اش؟» for that prediction', !/چطور می‌آزمایی‌اش/.test(nextP.split('# نوبتِ تازه')[0]), nextP.split('\n').filter(l => /می‌آزمایی/.test(l)).slice(0, 3));
    await day(1, 9);
    const t1 = await E(() => APP.dueList().map(d => ({ txt: d.txt || '', sub: d.sub || '', acts: (d.acts || []).map(a => a.t) })));
    const ph = t1.filter(x => /داروخانه/.test(x.txt + ' ' + x.sub));
    X('A23-11 aA3 day 2: the call and its ⏰ follow-up are ONE Today line', ph.length === 1, t1.map(x => x.txt + ' | ' + x.sub));
    X('C23-9: no raw plan id «(pl1)» anywhere in Today', !t1.some(x => /\(pl\d+\)|\bpl\d+\b/.test(x.txt + ' ' + x.sub)), t1.map(x => x.txt));
    X('A23-11 aA3: the plan line quoting «فردا» on its own day says when she said it', ph.length === 1 && (!/فردا/.test(ph[0].txt) || /دیروز گفتی/.test(ph[0].txt)), ph);
    const tap = await E(() => { const it = APP.dueList().find(d => /داروخانه/.test((d.txt || '') + (d.sub || ''))); const b0 = it && (it.acts || []).find(a => /plan-done/.test(a.cls || '')); if (b0) b0.fn();
      const dl = APP.S.all('deadline')[0], pl = (__cur().plans || [])[0]; return { tapped: !!b0, dl: dl && dl.done, pl: pl && pl.state, left: APP.dueList().filter(d => /داروخانه/.test((d.txt || '') + (d.sub || ''))).length }; });
    X('A23-11 aA3: «انجام دادم» on the one line closes the plan AND its ⏰ follow-up (one act, one state)', tap.tapped && tap.dl === true && tap.pl === 'done' && tap.left === 0, tap);
  });

  /* ===== D23-31 (aD2 روزِ ۳۴، oD1 روزِ ۳) ===== */
  await section('d31', async () => {
    await fresh();
    await E(async (D) => { __freshChat();
      await __say('از این هفته رباتیک سه‌شنبه، ریاضی پنجشنبه صبح، و آخر آبان نمره آزمونکامو نگاه می‌کنم.', 'برنامهٔ روشنی است. یادآوری بگذارم؟',
        [__cs({ said: ['plan'], plan: { text: 'از این هفته رباتیک سه‌شنبه، ریاضی پنجشنبه صبح، و آخر آبان نمره آزمونکامو نگاه می‌کنم', when: D } })]);
      await __say('آره بذار.', 'گذاشتم.', [{ do: 'deadline', what: 'پیگیری: نمرهٔ آزمونک‌های ریاضی (رباتیک + کلاسِ پنجشنبه)', date: D }]);
    }, ymd(34));
    await day(34);
    const t = await E(() => __today());
    X('D23-31 aD2 day 34: ⏰ پیگیری + 📌 برنامه for the same quiz check are ONE line', t.filter(x => /آزمونک/.test(x)).length === 1, t);
    // oD1: «پیش‌بینیم: صفر یا یک هشدارِ اشتباه، ۸۰ درصد مطمئنم. تا پس‌فردا انجامش میدم.» + 🎯 ِ صفحه با همان پیش‌بینی و همان موعد
    await fresh();
    await E(async (d2) => { __freshChat();
      await __say('پیش‌بینیم: صفر یا یک هشدارِ اشتباه، ۸۰ درصد مطمئنم. تا پس‌فردا انجامش میدم.', 'روشن است.', [__cs({ said: ['plan'], plan: { text: 'تا پس‌فردا انجامش میدم', when: d2 } })]);
      __fc('با پنجرهٔ ۴ ثانیه (تغییر کمتر از ۰٫۰۵ گرم)، در ۲۰ بار باز و بسته کردنِ بی‌قرص، صفر یا یک هشدارِ اشتباه می‌آید', 80, d2);
      __fc('فردا اتوبوسِ ساعتِ ۸ سرِ وقت می‌رسد', 60, d2);
    }, ymd(2));
    await day(2);
    const t2 = await E(() => APP.dueList().map(d => (d.txt || '') + ' | ' + (d.sub || '')));
    const mine = t2.filter(x => /پس‌فردا انجامش|هشدارِ اشتباه|🎯|📌/.test(x));
    X('D23-31 oD1 day 3: 📌 plan + 🎯 prediction of the same test are ONE line; the unrelated 🎯 stays its own line', t2.filter(x => /هشدارِ اشتباه|پس‌فردا انجامش/.test(x)).length === 1 && t2.some(x => /اتوبوس/.test(x)), mine);
  });

  /* ===== A23-11 (aA2) — کارت «بازسازی» + پروندهٔ T41 (برگهٔ سفید) + مرورِ حلِ همان مسئله ===== */
  await section('a11b', async () => {
    await fresh();
    await E(async () => { __freshChat();
      await __say('درسم اینه که اگه یه فرمول رو فقط با جبر ثابت کردم، یه شکل براش بکشم. می‌شه یه جوری یادم بمونه؟ چند روز دیگه ازم بپرس ببینم یادمه یا نه', 'درسِ خوبی است — پرونده را باز کردم.',
        [{ do: 'chat_solved', title: 'چرا جمعِ فردها مربع است', statement: '1+3+5+...+(2n-1) = n^2', kind: 'prove', lesson: 'اگه یه فرمول رو فقط با جبر ثابت کردم، یه شکل براش بکشم', check: '۱ تا، بعد ۳ تا دورش می‌شه ۲×۲', bestQ: 'اون سؤال که گفتی با کاشی بچین', taste: 'از این جور مسئله‌ها که شکل داره' },
         { do: 'start_practice', tid: 41, topic: 'چرا جمعِ فردها مربع است', consent: { quote: 'می‌شه یه جوری یادم بمونه؟ چند روز دیگه ازم بپرس ببینم یادمه یا نه', kind: 'request' } }]);
    });
    await day(1);
    const t = await E(() => __today());
    const rel = t.filter(x => /کارت مرور|برگه سفید|مرورِ حلِ مسئله|جمعِ فردها|🧪/.test(x));
    info.a11b = t; X('A23-11 aA2 day 2: the reconstruction card, the T41 blank sheet and the solve review of the same problem are ONE line', rel.length === 1, t);
  });

  /* ===== B·D15 — «میان‌ترم رو ۱۴ گرفتم» ⇒ موعد بسته؛ فعلِ پرسش از نوعِ کار ===== */
  await section('b15', async () => {
    await fresh();
    await E(async (d3) => { __freshChat();
      await __say('میان‌ترمِ آمار ۲۰ آبانه، یادم بنداز.', 'گذاشتم.', [{ do: 'deadline', what: 'میان‌ترمِ آمار', date: d3 }]);
      APP.S.put({ id: 'dl_exam2', type: 'deadline', what: 'امتحانِ فیزیک', date: d3, done: false });
      APP.S.put({ id: 'dl_rep', type: 'deadline', what: 'گزارشِ فصلِ دوم', date: d3, done: false });
    }, ymd(3));
    await day(4);
    await E(async () => { await __say('میان‌ترم رو ۱۴ گرفتم.', 'تبریک! از ۲۰؟'); });
    await day(12);
    const t = await E(() => __today());
    X('B·D15 s14: after «میان‌ترم رو ۱۴ گرفتم» Today never asks about «میان‌ترمِ آمار» again', !t.some(x => /میان‌ترمِ آمار/.test(x)), t);
    X('B·D15: an exam is asked with its own verb («امتحانش را دادی؟»), a report with «تحویل دادی؟»', t.some(x => /امتحانِ فیزیک.*امتحانش را دادی/.test(x)) && !t.some(x => /امتحانِ فیزیک.*تحویل دادی/.test(x)) && t.some(x => /گزارشِ فصلِ دوم.*تحویل دادی/.test(x)), t.filter(x => /⏰/.test(x)));
    const neg = await E(async () => { await __say('امتحانِ فیزیک رو هنوز ندادم، هفتهٔ بعده.', 'باشه.'); return APP.S.get('dl_exam2').done; });
    X('B·D15: «هنوز ندادم» never closes the deadline', neg === false, neg);
  });

  /* ===== C23-15 — مقدارِ خامِ refuted/confirmed در پروندهٔ گفت‌وگو ===== */
  await section('c15', async () => {
    await fresh();
    const md = await E(() => { const sid = __freshChat(), s = APP.S.get(sid); s.msgs.push({ role: 'user', id: 'u1', text: 'حدسم اینه که سرایدار برداشته.', at: new Date().toISOString() });
      s.coach = { guesses: [{ id: 'g1', text: 'سرایدار برداشته', at: new Date().toISOString(), res: '', resRecheck: { at: new Date().toISOString(), was: 'refuted' }, corr: [{ at: new Date().toISOString(), old: 'refuted', new: '', field: 'res' }] },
        { id: 'g2', text: 'همسایه دیده', at: new Date().toISOString(), res: 'confirmed', corr: [{ at: new Date().toISOString(), old: 'confirmed', new: 'refuted', field: 'res' }] }] }; APP.S.put(s);
      const v = APP.V.dossier(sid); return { md: APP.dossierMd(sid), html: APP.dossierHtml(sid), view: v.innerText || v.textContent }; });
    X('C23-15 s22 p12: the session dossier never shows raw «refuted/confirmed» (page, Markdown, HTML)', !/refuted|confirmed/.test(md.md + md.html + md.view) && /رد شد/.test(md.md), (md.md.match(/.*(?:refuted|confirmed|اصلاح شد).*/g) || []).slice(0, 6));
  });

  /* ===== C22-11 / B·D23 — حدسِ گفت‌وگو سرانجامش را از آزمودنِ خودش می‌گیرد ===== */
  await section('c11', async () => {
    await fresh();
    const r = await E(async () => { __freshChat();
      await __say('مثلاً مجموع n عدد زوج اول: 2+4+…+2n. اگه خونه بچینم، ۲ تا، بعد ۴ تا... فکر کنم میشه n(n+1)، یه مستطیل!', 'چطور می‌آزمایی‌اش؟', [__cs({ ph: 'b', said: ['guess'], guess: { text: 'فکر کنم میشه n(n+1)' } })]);
      await __say('n=1: ۲ = 1×2 ✓. n=2: ۲+۴=۶ = 2×3 ✓. n=3: ۱۲ = 3×4 ✓. شکلشم کشیدم، مستطیل n در n+1 درمیاد. با استقرا هم: n(n+1) + 2(n+1) = (n+1)(n+2). پس درسته!', 'آفرین.', [__cs({ ph: 'b', said: ['result'] })]);
      await __say('امروز تو کتاب یه سؤال بود: 1+3+5+…+99 چنده؟ سریع گفتم: ۵۰ تا عدد فرده، پس ۲۵۰۰. درسته؟', 'چطور می‌آزمایی‌اش؟', [__cs({ ph: 'b', said: ['guess'], guess: { text: '۵۰ تا عدد فرده، پس ۲۵۰۰' } })]);
      await __say('چون nامین فرد 2n−1 ـه: 2n−1 = 99 پس n = 50. پس ۵۰ تا فرده و جواب ۵۰² = ۲۵۰۰. با شکلم هم یه مربع ۵۰ در ۵۰ میشه، درسته.', 'آفرین.', [__cs({ ph: 'b', said: ['result'] })]);
      const s = __cur(); return { g: ((s.coach || {}).guesses || []).map(x => ({ t: x.text, res: x.res || '' })), md: APP.dossierMd(s.id) }; });
    X('B·D23 aB2: «n(n+1)» tested by cases + induction ⇒ confirmed; «۲۵۰۰» checked with 2n−1=99 ⇒ confirmed (not «آزموده نشده»)', r.g.length === 2 && r.g.every(x => x.res === 'confirmed') && !/هنوز آزموده نشده/.test(r.md), r.g);
    const neg = await E(async () => { __freshChat();
      await __say('حدسم اینه که جوابش 12 میشه.', 'چطور می‌آزمایی‌اش؟', [__cs({ ph: 'p', said: ['guess'], guess: { text: 'جوابش 12 میشه' } })]);
      await __say('امتحان کردم، 12 نمیشه، 14 درمیاد. پس غلط بود.', 'خب.', [__cs({ ph: 'c', said: ['result'] })]);
      await __say('یه حدس دیگه: شاید 30 باشه.', 'بیازما.', [__cs({ ph: 'p', said: ['guess'], guess: { text: 'شاید 30 باشه' } })]);
      await __say('نمی‌دونم چطوری امتحانش کنم.', 'از حالتِ کوچک شروع کن.');
      const s = __cur(); return ((s.coach || {}).guesses || []).map(x => ({ t: x.text, res: x.res || '' })); });
    X('C22-11: a refuting test refutes; an untested guess stays untested (no verdict without her test)', neg.length === 2 && neg[0].res === 'refuted' && neg[1].res === '', neg);
  });

  /* ===== A23-16 / A23-24 / A23-29 — بلوک‌ها و سطرهای تکراری ===== */
  await section('dup', async () => {
    await fresh();
    const r = await E(async () => { __freshChat();
      const st = 'یه لوله‌ی صاف ۴ متری دارم، بار وانتم ۳.۲ متر طول، ۱.۸ عرض، ۱.۶ ارتفاع داره. جا میشه یا نه؟';
      await __say(st + ' ثبتش کن و بیا روش کار کنیم.', 'ساختم.', [{ do: 'live_new', title: 'لوله در بارِ وانت', statement: st, kind: 'find', nat: 'practical' }]);
      const pid = APP.liveAll().find(r => /لوله/.test(r.p.title)).p.id;
      await __say('یه اصلاح دربارهٔ همون لوله: اولش گفتم ارتفاعِ بار ۱.۶ـه؛ امروز دوباره با متر اندازه گرفتم — ۱۶۰ سانت نبود، ۱۵۰ سانته.', 'اصلاح را فرستادم.', [__cs({ ph: 'u', retract: { msg: '۱.۶ ارتفاع داره', what: 'fact', key: 'datum:ارتفاع', fix: '۱۵۰ سانت' } })]);
      const u = await __say('خب حالا چی؟', 'ادامه بده.');
      const head = u.split('# نوبتِ تازه')[0], heads = (head.match(/# اصلاحی که صفحه انجام داد/g) || []).length;
      const bl = head.split(/\n(?=# )/).filter(x => /^# اصلاحی که صفحه انجام داد/.test(x))[0] || '';
      const md = APP.dossierMd(pid), evs = md.split(/\n(?=### )/).filter(x => /^### .*اصلاحِ پیامِ پیشین/.test(x)), labs = [];
      evs.forEach(ev => ev.split('\n').filter(l => /^- /.test(l)).forEach(l => { const m = /^- (.{2,80}?):\s*«/.exec(l); if (m && !/^با پیامِ|^از پیامِ|^سرانجام/.test(m[1])) labs.push(m[1].trim()); }));
      return { heads, bl, dupMd: labs.filter((l, i) => labs.indexOf(l) !== i), lines: evs.join('\n').split('\n').slice(0, 20) }; });
    X('A23-16 s04 p11: «# اصلاحی که صفحه انجام داد» appears once in the prompt (also not as a rule line)', r.heads === 1, r.heads);
    const prose = (r.bl.split('\n').find(l => /عوض کرد \(نتیجهٔ صفحه\):/.test(l)) || '').split('عوض کرد (نتیجهٔ صفحه):')[1] || '';
    X('A23-24 s07 p7: each change is listed once in the result block (not in prose AND in the JSON)', r.bl && /"changed":\[\{/.test(r.bl) && !/۱۵۰/.test(prose), { prose, bl: r.bl.slice(0, 600) });
    X('A23-24 s02: the dossier prints each change line of one correction once', !r.dupMd.length, r.lines);
    const ed = await E(async () => { __freshChat();
      const st = 'دو گلدانِ لوبیا دارم: گلدونِ اول ۱۲ ساعت نور می‌گیره و دومی ۲۴ ساعت. می‌خوام بفهمم کدوم بلندتر میشه. ثبتش کن و بیا روش کار کنیم.';
      await __say(st, 'ساختم.', [{ do: 'live_new', title: 'نور و رشدِ لوبیا', statement: 'دو گلدانِ لوبیا دارم: گلدونِ اول ۱۲ ساعت نور می‌گیره و دومی ۲۴ ساعت. می‌خوام بفهمم کدوم بلندتر میشه.', kind: 'find', nat: 'practical' }]);
      const s = __cur(), m = (s.msgs || []).filter(x => x.role === 'user')[0]; __sys.length = 0; __q.push({ reply: 'درست شد.', status: 'related', memory: 'm', actions: [] });
      APP.ASSIST.retractEdit(s, m, 'گلدونِ اول ۱۶ ساعت نور می‌گیره و دومی ۲۴ ساعت.');
      for (let i = 0; i < 80 && (!__sys.length || APP.ASSIST.busy()); i++) await new Promise(z => setTimeout(z, 100)); await new Promise(z => setTimeout(z, 300));
      const u = __sys.join('\n'), head = u.split('# نوبتِ تازه')[0], bl = head.split(/\n(?=# )/).filter(x => /^# اصلاحی که صفحه انجام داد/.test(x))[0] || '';
      return { bl, n16: (bl.match(/۱۶/g) || []).length }; });
    info.ed = ed; X('A23-24 s07 p7 (✏️): each change appears once in the result block', ed.bl && ed.n16 <= 2, ed);
    const c = await E(async () => { __freshChat();
      await __say('یه پیشنهادِ کار از یه شرکتِ دیگه دارم، حقوقش ۳۰٪ بیشتره ولی باید از تیمی که خودم ساختم جدا شم. تا پنج‌شنبه باید جواب بدم.', 'این تصمیمِ واقعیِ خودت است — می‌خواهی در «🔭» ثبتش کنم؟ اول در یک جمله بگو بینِ چه و چه انتخاب می‌کنی.');
      await __say('ثبتش کن. در یک جمله: بین «بمونم و تیمی که ساختم رو به جایی برسونم» و «برم با حقوقِ ۳۰٪ بیشتر و یه محیطِ تازه» انتخاب می‌کنم.', 'ثبت شد، با موعدِ پنج‌شنبه.',
        [{ do: 'chat_invent', statement: 'یه پیشنهادِ کار از یه شرکتِ دیگه دارم، حقوقش ۳۰٪ بیشتره ولی باید از تیمی که خودم ساختم جدا شم. تا پنج‌شنبه باید جواب بدم.', title: 'پیشنهادِ کار یا تیمِ خودم', nat: 'life', kind: 'find' }, __cs({ ph: 'u', said: ['u'], ans: ['u1'], nat: 'life' })]);
      return (__cur().msgs || []).filter(m => m.role === 'sys' && /پیشنهادِ کار|مسئله ثبت شد|ساخته شد/.test(m.text)).map(m => m.text); });
    X('A23-29 oA1 p6: one creation ⇒ one confirmation line', c.length === 1, c);
  });

  /* ===== D23-33 — «آره جدا ثبتش کن ولی بعداً» قول می‌شود و برمی‌گردد ===== */
  await section('d33', async () => {
    await fresh();
    await E(async () => { __freshChat();
      await __say('امروز عصر امتحان می‌کنم. راستی همین روش رو میشه برای باتری ماشینم هم زد؟ ولتاژش شب‌ها یه کم افت می‌کنه.', 'میشه — می‌خواهی مسئلهٔ باتری را جدا ثبت کنم؟');
      await __say('آره جدا ثبتش کن ولی بعداً. یه اشتباه هم کردم: اولش گفتم هر قرص ۰٫۳ گرمه.', 'باشه.');
    });
    const pr = await E(() => ((__cur().promises || [])).map(x => ({ ask: x.ask, by: x.by, done: x.done, ctx: x.ctx })));
    X('D23-33 oD1 p9: her own deferred request is stored as a promise', pr.length === 1 && /ثبتش کن/.test(pr[0].ask) && !pr[0].done && /باتری/.test(pr[0].ctx || ''), pr);
    await day(2);
    const t = await E(() => __today());
    const u = await E(async () => { __freshChat(); return await __say('سلام، آزمونِ دوم رو انجام دادم.', 'عالی.'); });
    X('D23-33 oD1 day 3: the promise returns — in Today and in the next session\'s prompt', t.some(x => /ثبتش کن/.test(x)) && /خودش خواست «[^»]*ثبتش کن/.test(u.split('# نوبتِ تازه')[0]), { t, pr: u.split('\n').filter(l => /ثبتش کن/.test(l)).slice(0, 2) });
  });

  /* ===== D23-40 — مسئله‌های ساختهٔ بازنگری پیش از ثبتِ مسئلهٔ گفت‌وگو ===== */
  await section('d40', async () => {
    await fresh();
    await E(async () => { __freshChat();
      await __say('حلش کردم! بیشترین حاصل‌ضرب اعداد مثبتی که جمعشون ۱۰ ه وقتیه که همه‌شون مساوی‌ان، با چهار جزء میشه حدود ۳۹.', 'حالا یک نگاه به عقب: می‌توانی مسئلهٔ تازه‌ای بسازی؟', [__cs({ ph: 'b', said: ['result'] })]);
      await __say('سه تا ساختم: ۱) بیشینهٔ حاصل‌ضرب اعداد مثبت وقتی جمع مربع‌هاشون ۱۰ باشه. ۲) جمع ۱۰ ولی اعداد صحیح متمایز. ۳) بیشینهٔ حاصل‌ضرب صحیح‌های مثبت متمایز با جمع ۱۰۰۰ — این یکی خیلی سخته.', 'عالی.', [
        { do: 'chat_invent', statement: 'بیشینهٔ حاصل‌ضرب اعداد مثبت وقتی جمع مربع‌هاشون ۱۰ باشه', title: 'حاصل‌ضربِ بیشینه با جمعِ مربع‌ها ۱۰', nat: 'objective', kind: 'find' },
        { do: 'chat_invent', statement: 'جمع ۱۰ ولی اعداد صحیح متمایز', title: 'صحیح‌های متمایز با جمعِ ۱۰', nat: 'objective', kind: 'find' },
        { do: 'chat_invent', statement: 'بیشینهٔ حاصل‌ضرب صحیح‌های مثبت متمایز با جمع ۱۰۰۰ — این یکی خیلی سخته', title: 'صحیح‌های متمایز با جمعِ ۱۰۰۰', nat: 'objective', kind: 'find' }, __cs({ ph: 'b', said: [] })]);
      await __say('اینکه زود فرض می‌کنم و صورت رو کامل نمی‌خونم. بعدی؟', 'درسِ دقیقی است.', [{ do: 'chat_solved', title: 'بیشینهٔ حاصل‌ضرب با جمع ۱۰', statement: 'بیشترین حاصل‌ضرب اعداد مثبتی که جمعشون ۱۰ ه', kind: 'find', lesson: 'زود فرض می‌کنم و صورت رو کامل نمی‌خونم', check: 'با ۵ تا کمتره' }]);
    });
    const sys = await E(() => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text));
    X('D23-40 s31: invented problems are never refused as «نخواسته بودی» in her own look-back', !sys.some(t => /ثبت نکردم، چون نخواسته بودی/.test(t)), sys);
    await day(3);
    const t = await E(() => __today());
    X('D23-40 s31: the three invented problems come back in Today on the ladder', ['جمعِ مربع‌ها', 'جمعِ ۱۰»', 'جمعِ ۱۰۰۰'].every(k => t.some(x => x.indexOf(k) >= 0)), t);
  });

  /* ===== C23-7 / C23-20 / B·D21 — فهرست‌ها ===== */
  await section('lists', async () => {
    await fresh();
    const r = await E(async () => { __freshChat();
      await __say('معاون گفت تأخیرها از وقتی سرایدار عوض شده بیشتر شده. می‌خوام این ادعا رو نگه دارم.', 'تاریخِ سنجش را هم می‌گویی؟');
      const q = 'معاون گفت تأخیرها از وقتی سرایدار عوض شده بیشتر شده ۵ آبان دوباره می‌سنجمش';
      await __say('۵ آبان دوباره می‌سنجمش — تا اون روز دفتر رو نگه می‌دارم. ثبتش کن.', 'نگه داشتم.', [{ do: 'list_add', list: 'claims', text: 'تأخیرها از وقتی سرایدار عوض شده بیشتر شده', quote: q, recheck: '۵ آبان', consent: { quote: 'ثبتش کن', kind: 'request' } }]);
      const s = __cur(); return { sys: (s.msgs || []).filter(m => m.role === 'sys').map(m => m.text).slice(-2), items: (APP.PR.list('claims').items || []).map(x => ({ t: x.claim || x.text, re: x.recheck })) }; });
    X('C23-7 s22 p21: list_add accepts a quote composed from her two consecutive messages', r.items.length === 1 && /تأخیرها/.test(r.items[0].t), r);
    const m = await E(async () => { __freshChat();
      await __say('از روش تلسکوپی استفاده کردم و جمع رو حساب کردم. نگهش دار تو قفسهٔ مدل‌ها.', 'نگه داشتم.', [{ do: 'list_add', list: 'models', text: 'روش تلسکوپی', quote: 'از روش تلسکوپی استفاده کردم', use: true, consent: { quote: 'نگهش دار تو قفسهٔ مدل‌ها', kind: 'request' } }]);
      await __say('امروز تو یه جمع دیگه هم همون تلسکوپی رو به کار بردم. اینم بشمار.', 'شمردم.', [{ do: 'list_add', list: 'models', text: 'روش تلسکوپی', quote: 'امروز تو یه جمع دیگه هم همون تلسکوپی رو به کار بردم', use: true, consent: { quote: 'اینم بشمار', kind: 'request' } }]);
      return (APP.PR.list('models').items || []).map(x => ({ n: x.name || x.text, uses: (x.uses || []).length })); });
    X('C23-20 s25 p17: «همون تلسکوپی رو به کار بردم» is a second use of «روش تلسکوپی», not a second item', m.length === 1 && m[0].n === 'روش تلسکوپی', m);
    const d = await E(async () => { __freshChat(); const pid = __live('سرعتِ قطار', 'قطاری ... سرعتش؟');
      await __say('اسم گذاشتن روی کمیتِ نامعلوم کمکم کرد. نگهش دار.', 'نگه داشتم.', [{ do: 'list_add', list: 'models', text: 'اسم گذاشتن روی کمیتِ نامعلوم', quote: 'اسم گذاشتن روی کمیتِ نامعلوم', use: true, consent: { quote: 'نگهش دار', kind: 'request' } }]);
      APP.go('lprob', pid); await new Promise(z => setTimeout(z, 200));
      const inp = document.querySelector('input[aria-label="مدلِ ذهنی که در این مسئله به کار بردی"]'); if (!inp) return { noInput: true };
      inp.value = 'نام‌گذاریِ کمیتِ نامعلوم و ربط دادنش به داده‌ها'; [...inp.parentElement.querySelectorAll('button')].find(x => /کاربستِ مدل/.test(x.textContent)).click(); await new Promise(z => setTimeout(z, 150));
      const yes = document.querySelector('.prc-msame-yes'); const asked = !!yes; if (yes) yes.click(); await new Promise(z => setTimeout(z, 150));
      return { asked, items: (APP.PR.list('models').items || []).map(x => ({ n: x.name || x.text, uses: (x.uses || []).length })) }; });
    X('B·D21 s18: the page «کاربستِ مدل» with an overlapping name asks «همان مدل؟» and «بله» books one model with two uses', d.asked && d.items.filter(x => /کمیتِ نامعلوم/.test(x.n)).length === 1 && d.items.filter(x => /کمیتِ نامعلوم/.test(x.n))[0].uses === 2, d);
  });

  /* ===== A23-12 — پنجرهٔ تمرین یکی ===== */
  await section('a12', async () => {
    await fresh();
    const r = await E(() => { const pid = __live('چرا جمعِ فردها مربع است'); const c = APP.PR.start(41, APP.PR.subj('live', pid), { src: 'page' }); const cc = APP.S.get(c.id);
      const e = APP.PR.entries(cc)[0] || {}; return { due: cc.due, until: cc.until, eUntil: e.until || '', dueText: APP.PR.dueText(cc), fUntil: cc.until ? APP.fdate(cc.until) : '', fE: e.until ? APP.fdate(e.until) : '' }; });
    X('A23-12 aA2: the practice window end is the same in Today and in the case/dossier/chat text', !r.until || ((!r.eUntil || r.dueText.indexOf(r.fE) >= 0) && (r.eUntil === r.until || r.dueText.indexOf(' تا ' + r.fUntil) < 0)), r);
  });

  /* ===== بانکِ مستقلِ VARIANTS_R23 — ورودی‌های Q7 (#168–#187). روزِ بانک: D0 = دوشنبه ۲۰۲۶-۱۰-۱۹ = day(1) ِ این آزمون ===== */
  await section('bank', async () => {
    if (!BANK.length) { info.bank.missing = true; errors.push('VARIANTS_R23 missing'); return; }
    const Q = BANK.map((x, i) => Object.assign({ i }, x)).filter(x => /^Q7/.test(String(x.rc || '')));
    if (!(Q.length === 20 && Q[0].i === 168 && Q[19].i === 187)) errors.push('bank layout changed: ' + Q.map(x => x.i).join(','));
    const T = (gi, ok, x) => { info.bank[gi] = !!ok; if (!ok) errors.push('R23#' + gi + ' «' + BANK[gi].text.slice(0, 90) + '» → ' + BANK[gi].expect.slice(0, 120) + ' :: ' + JSON.stringify(x).slice(0, 900)); };
    const bd = (n, h) => day(1 + n, h);
    const bfresh = async () => { await bd(0); await E(() => __wipe()); };
    let t, r;
    // #168 + #180: plan «پنجشنبه برم بانک» + پیگیری + پیش‌بینیِ «فکر کنم ۱ ساعت طول بکشه» ⇒ یک سطر روزِ پنجشنبه؛ دو کارِ دیگرِ همان روز دو سطر
    await bfresh();
    await E(async (thu) => { __freshChat();
      await __say('پنجشنبه برم بانک.', 'یادآوری بگذارم؟ فکر می‌کنی چقدر طول بکشد؟', [__cs({ said: ['plan'], plan: { text: 'پنجشنبه برم بانک', when: thu } })]);
      await __say('آره بذار. فکر کنم ۱ ساعت طول بکشه.', 'گذاشتم.', [{ do: 'deadline', what: 'پیگیری: رفتن به بانک', date: thu }, __cs({ said: ['guess'], guess: { text: 'فکر کنم ۱ ساعت طول بکشه' } })]);
      APP.S.put({ id: 'dl_x1', type: 'deadline', what: 'خریدِ کتابِ آمار', date: thu, done: false });
      APP.S.put({ id: 'dl_x2', type: 'deadline', what: 'تماس با دندان‌پزشک', date: thu, done: false });
    }, ymd(4));
    await bd(3);
    t = await E(() => __today());
    T(168, t.filter(x => /بانک|۱ ساعت طول/.test(x)).length === 1 && t.some(x => /بانک[^]*همان کار[^]*۱ ساعت|همان کار[^]*بانک/.test(x)), t);
    T(180, t.filter(x => /خریدِ کتابِ آمار|دندان‌پزشک/.test(x)).length === 2, t);
    // #169: مسئلهٔ ساختهٔ بازنگری D0 ⇒ D3 در «امروز»
    await bfresh();
    await E(async () => { __freshChat();
      await __say('حلش کردم: با ۳ شیر حوض ۲ ساعته پر میشه. وارسی هم کردم.', 'آفرین.', [{ do: 'chat_solved', title: 'سه شیر و حوض', statement: 'سه شیر با هم حوض را در چند ساعت پر می‌کنند؟', kind: 'find', lesson: 'آهنگ‌ها جمع می‌شوند', check: 'با یک شیر وارسی کردم' }]);
      await __say('یه مسئلهٔ تازه ساختم: اگر ۴ شیر بود؟', 'عالی.', [{ do: 'chat_invent', statement: 'اگر ۴ شیر بود؟', title: 'اگر ۴ شیر بود', nat: 'objective', kind: 'find' }, __cs({ ph: 'b' })]);
    });
    await bd(3);
    t = await E(() => __today());
    T(169, t.some(x => /۴ شیر/.test(x)), t);
    // #170 + #181 + #182: امتحانِ دیروز
    await bfresh();
    await E(async (o) => { __freshChat();
      APP.S.put({ id: 'dl_ex', type: 'deadline', what: 'امتحانِ ریاضی', date: o.sun, done: false, sess: __cur().id });
      APP.S.put({ id: 'dl_tm', type: 'deadline', what: 'تحویلِ گزارشِ آزمایشگاه', date: o.tue, done: false });
      APP.S.put({ id: 'dl_ex2', type: 'deadline', what: 'امتحانِ فیزیک', date: o.next, done: false });
    }, { sun: ymd(0), tue: ymd(2), next: ymd(8) });
    t = await E(() => __today());
    T(181, !t.some(x => /گزارشِ آزمایشگاه.*(?:تحویل دادی|دادی؟)/.test(x)), t);
    await E(async () => { await __say('امتحانو دیروز دادم', 'خب چطور بود؟'); });
    r = await E(() => ({ ex: APP.S.get('dl_ex').done, t: __today() }));
    T(170, r.ex === true && !r.t.some(x => /امتحانِ ریاضی/.test(x)), r);
    await bd(7);
    await E(async () => { await __say('هنوز امتحانو ندادم، هفته‌ی بعده', 'باشه.'); });
    r = await E(() => ({ ex2: APP.S.get('dl_ex2').done }));
    T(182, r.ex2 === false, r);
    // #171 + #172: بی شناسهٔ خام؛ سرانجامِ فارسی
    await bfresh();
    const sid171 = await E(async (d1) => { __freshChat();
      await __say('فردا صبح میرم بانک.', 'یادت بیاورم؟', [__cs({ said: ['plan'], plan: { text: 'فردا صبح میرم بانک', when: d1 } })]);
      await __say('آره.', 'گذاشتم.', [{ do: 'deadline', what: 'رفتن به بانک', date: d1 }]);
      const s = __cur(); s.coach.guesses = [{ id: 'g1', text: 'بانک شلوغه', at: new Date().toISOString(), res: 'refuted', corr: [{ at: new Date().toISOString(), old: 'confirmed', new: 'refuted', field: 'res' }] }]; APP.S.put(s);
      return s.id; }, ymd(2));
    await bd(1);
    r = await E((sid) => { const v = APP.V.dossier(sid); return { t: __today(), md: APP.dossierMd(sid), view: v.innerText || v.textContent }; }, sid171);
    T(171, !r.t.some(x => /\bpl\d+\b|\bdl_\w+/.test(x)) && !/\(pl\d+\)|\bdl_[a-z0-9]+/.test(r.view), { t: r.t, v: (r.view.match(/.{0,40}(?:pl\d|dl_).{0,40}/g) || []).slice(0, 3) });
    T(172, !/refuted|confirmed/.test(r.md + r.view) && /رد شد/.test(r.md), (r.md.match(/.*(?:refuted|confirmed|رد شد|تأیید شد).*/g) || []).slice(0, 5));
    // #173 + #183: حدسِ ۱۲
    await bfresh();
    r = await E(async () => { __freshChat();
      await __say('حدسم ۱۲ ـه.', 'چطور می‌آزمایی‌اش؟', [__cs({ ph: 'p', said: ['guess'], guess: { text: 'حدسم ۱۲ ـه' } })]);
      await __say('صبر کن یه کم فکر کنم.', 'باشه.');
      await __say('نه، امتحان کردم ۱۵ شد.', 'خب.', [__cs({ ph: 'c', said: ['result'] })]);
      const s = __cur(); return { g: (s.coach.guesses || []).map(x => ({ t: x.text, res: x.res || '' })), md: APP.dossierMd(s.id) }; });
    T(173, r.g.length === 1 && r.g[0].res === 'refuted' && /حدسم ۱۲[^]*?سرانجام: رد شد/.test(r.md), { g: r.g, md: (r.md.match(/.*(?:حدس|سرانجام).*/g) || []).slice(0, 6) });
    r = await E(async () => { __freshChat();
      await __say('حدسم ۱۲ ـه.', 'چطور می‌آزمایی‌اش؟', [__cs({ ph: 'p', said: ['guess'], guess: { text: 'حدسم ۱۲ ـه' } })]);
      await __say('بعداً امتحانش می‌کنم.', 'باشه.');
      const s = __cur(); return { g: (s.coach.guesses || []).map(x => ({ t: x.text, res: x.res || '' })), md: APP.dossierMd(s.id) }; });
    T(183, r.g.length === 1 && r.g[0].res === '' && /هنوز آزموده نشده/.test(r.md), r.g);
    // #174: یک اصلاحِ ✏️ ۸۰۰ ⇒ ۷۵۰ ⇒ یک سطرِ اصلاح و یک سطرِ نتیجه در پرونده
    await bfresh();
    r = await E(async () => { __freshChat();
      const st = 'یه کمد ۸۰۰ هزار تومنه و من ۲ میلیون دارم؛ چند تا کمد می‌تونم بخرم؟';
      await __say(st + ' ثبتش کن و بیا روش کار کنیم.', 'ساختم.', [{ do: 'live_new', title: 'چند کمد', statement: st, kind: 'find', nat: 'practical' }]);
      const pid = APP.liveAll().find(x => /کمد/.test(x.p.title)).p.id;
      const s = __cur(), m = (s.msgs || []).filter(x => x.role === 'user')[0]; __q.push({ reply: 'درست شد.', status: 'related', memory: 'm', actions: [] });
      APP.ASSIST.retractEdit(s, m, m.text.replace('۸۰۰', '۷۵۰'));
      for (let i = 0; i < 60 && APP.ASSIST.busy(); i++) await new Promise(z => setTimeout(z, 100)); await new Promise(z => setTimeout(z, 300));
      const md = APP.dossierMd(pid), evs = md.split(/\n(?=### )/).filter(x => /^### .*اصلاحِ پیامِ پیشین/.test(x)), labs = [];
      evs.forEach(ev => ev.split('\n').filter(l => /^- /.test(l)).forEach(l => { const mm = /^- (.{2,80}?):\s*«/.exec(l); if (mm && !/^با پیامِ|^از پیامِ|^سرانجام/.test(mm[1])) labs.push(mm[1].trim()); }));
      return { n: evs.length, labs, ev: evs.join('\n').slice(0, 700) }; });
    T(174, r.n === 1 && r.labs.length >= 1 && r.labs.every((l, i) => r.labs.indexOf(l) === i), r);
    // #175 + #187: «فردا یادم بنداز اینو با هم حساب کنیم» ⇒ قول، فردا در «امروز»؛ «شاید یه روز بعداً» ⇒ هیچ
    await bfresh();
    const pr175 = await E(async () => { __freshChat();
      await __say('هزینهٔ سفر رو باید حساب کنیم.', 'الان حسابش کنیم؟');
      await __say('فردا یادم بنداز اینو با هم حساب کنیم.', 'باشه.');
      await __say('شاید یه روز بعداً.', 'باشه.');
      return (__cur().promises || []).map(x => ({ ask: x.ask, due: x.due, by: x.by })); });
    await bd(1);
    t = await E(() => __today());
    T(175, pr175.length === 1 && pr175[0].due === ymd(2) && t.some(x => /یادم بنداز اینو با هم حساب کنیم/.test(x)), { pr175, t });
    T(187, pr175.length === 1 && !pr175.some(x => /شاید/.test(x.ask)), pr175);
    // #176 + #184: نقلِ ترکیبی
    await bfresh();
    r = await E(async () => { __freshChat();
      await __say('فرضم اینه که', 'بگو.');
      await __say('قیمتا تا عید ثابت می‌مونه. نگهش دار.', 'نگه داشتم.', [{ do: 'list_add', list: 'assumptions', text: 'فرضم اینه که قیمتا تا عید ثابت می‌مونه', quote: 'فرضم اینه که قیمتا تا عید ثابت می‌مونه', consent: { quote: 'نگهش دار', kind: 'request' } }]);
      const a2 = (APP.PR.list('assumptions').items || []).map(x => x.text);
      __freshChat();
      await __say('فرضم اینه', 'بگو.');
      await __say('راستی ناهار چی بخورم', 'هر چه دوست داری.');
      await __say('قیمتا ثابت. نگهش دار.', 'نگه داشتم.', [{ do: 'list_add', list: 'assumptions', text: 'فرضم اینه قیمتا ثابت', quote: 'فرضم اینه قیمتا ثابت', consent: { quote: 'نگهش دار', kind: 'request' } }]);
      const a3 = (APP.PR.list('assumptions').items || []).map(x => x.text), sys = (__cur().msgs || []).filter(m => m.role === 'sys').map(m => m.text).slice(-1);
      return { a2, a3, sys }; });
    T(176, r.a2.some(x => /فرضم اینه که قیمتا تا عید ثابت می‌مونه/.test(x)), r);
    T(184, !r.a3.some(x => /فرضم اینه قیمتا ثابت/.test(x)), r);
    // #177 + #185: مدلِ موجود ⇒ کاربستِ تازه؛ مدلِ تازه ⇒ موردِ تازه
    await bfresh();
    r = await E(async () => { __freshChat();
      await __say('یه مدل دارم به اسم «کار از آخر». نگهش دار.', 'نگه داشتم.', [{ do: 'list_add', list: 'models', text: 'کار از آخر', quote: 'کار از آخر', consent: { quote: 'نگهش دار', kind: 'request' } }]);
      await __say('امروز مدلِ «کار از آخر» رو استفاده کردم. بشمارش.', 'شمردم.', [{ do: 'list_add', list: 'models', text: 'کار از آخر', quote: 'امروز مدلِ «کار از آخر» رو استفاده کردم', use: true, consent: { quote: 'بشمارش', kind: 'request' } }]);
      const m1 = (APP.PR.list('models').items || []).map(x => ({ n: x.name || x.text, uses: (x.uses || []).length }));
      await __say('یه مدل جدید ساختم به اسم «سه قدم». نگهش دار.', 'نگه داشتم.', [{ do: 'list_add', list: 'models', text: 'سه قدم', quote: 'یه مدل جدید ساختم به اسم «سه قدم»', consent: { quote: 'نگهش دار', kind: 'request' } }]);
      return { m1, m2: (APP.PR.list('models').items || []).map(x => ({ n: x.name || x.text, uses: (x.uses || []).length })) }; });
    T(177, r.m1.length === 1 && r.m1[0].uses === 1, r);
    T(185, r.m2.length === 2 && r.m2.some(x => x.n === 'سه قدم'), r);
    // #178: پنجرهٔ پرونده در صفحهٔ پرونده و «امروز» یکی
    await bfresh();
    r = await E(() => { const pid = __live('جمعِ فردها'); const c = APP.PR.start(41, APP.PR.subj('live', pid), { src: 'page' }); const cc = APP.S.get(c.id), e = APP.PR.entries(cc)[0] || {};
      APP.go('practice', cc.id); const view = (document.querySelector('#main') || document.body).innerText;
      return { lu: APP.PR.lastOnTime(cc), until: cc.until, eUntil: e.until || '', view: view.split('\n').filter(l => /موعدِ بعد/.test(l)).slice(0, 2), fdUntil: cc.until ? APP.fdate(cc.until) : '', fdLu: APP.PR.lastOnTime(cc) ? APP.fdate(APP.PR.lastOnTime(cc)) : '' }; });
    T(178, r.lu === (r.eUntil || '') && (!r.lu || r.view.some(l => l.indexOf(' تا ' + r.fdLu) >= 0)) && !r.view.some(l => r.fdUntil && r.fdUntil !== r.fdLu && l.indexOf(' تا ' + r.fdUntil) >= 0), r);
    // #179 + #186: پیش‌بینی ⇒ پیش‌بینیِ تاریخ‌دار (جمعه)، نه حدس؛ «حدس می‌زنم» ⇒ حدس
    await bfresh();
    r = await E(async () => { __freshChat();
      await __say('پیش‌بینی می‌کنم تا جمعه تموم شه.', 'ببینیم.', [__cs({ ph: 'p', said: ['guess'], guess: { text: 'پیش‌بینی می‌کنم تا جمعه تموم شه' } })]);
      await __say('خب، شروع کردم.', 'خوب.');
      const s = __cur(), C = s.coach || {}; return { preds: (C.preds || []).map(x => ({ t: x.text, due: x.due })), guesses: (C.guesses || []).map(x => x.text), fc: APP.S.all('fcast').map(f => ({ q: f.q, due: f.due })) }; });
    T(179, r.preds.length === 1 && r.preds[0].due === ymd(5) && !r.guesses.length && r.fc.some(f => f.due === ymd(5)), r);
    r = await E(async () => { __freshChat();
      await __say('حدس می‌زنم جواب ۱۲ باشه.', 'چطور می‌آزمایی‌اش؟', [__cs({ ph: 'p', said: ['guess'], guess: { text: 'حدس می‌زنم جواب ۱۲ باشه' } })]);
      const s = __cur(), C = s.coach || {}; return { preds: (C.preds || []).map(x => x.text), guesses: (C.guesses || []).map(x => x.text) }; });
    T(186, r.guesses.length === 1 && !r.preds.length, r);
  });

  await b.close();
  console.log(JSON.stringify(info, null, 1).slice(0, 4000));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})();
