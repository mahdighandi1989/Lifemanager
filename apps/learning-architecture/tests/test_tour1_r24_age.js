// تورِ پولیا (دستهٔ ۱، دورِ ۲۴، سهمِ «age» — ۲۰۲۶-۱۰-۲۵) — DECISIONS_R24: R5 (سطح‌های سن و ضمیر)
//  جمله‌ها از خودِ گزارش‌های دورِ ۲۴: B24·D1/D6/D7/D8/D11 + مدرسهٔ کم‌سال (aB1)، A24-10/A24-13/A24-20/A23-14، C24-10/C24-15/C24-18، D24-5/D24-6/D24-10
//  ساعتِ صفحه یخ زده است (T0) — هیچ تاریخِ تقویمی‌ای در انتظارها با گذشتِ زمان کهنه نمی‌شود؛ تاریخ‌های مورد انتظار با ICU (Intl persian) هم سنجیده می‌شوند
// LLA_FILE = ساختِ دیگر؛ ONLY=conf,card,words,elder,iso,reg,mind,puzzle,school
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));

(async () => {
  const b = await chromium.launch(); const errors = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
  const T0 = '2026-10-25';   // یخ‌زده: یکشنبه ۳ آبان ۱۴۰۵
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0;
    APP.today = () => window.__day; APP.HOST = null;
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    window.__turn = async (text, reply, actions, extra) => {
      const n0 = __calls.length; __q.push(R(Object.assign({ reply: reply || 'باشه.', actions: actions || [] }, extra || {})));
      await APP.ASSIST.send(text); __q.length = 0;
      const c = __calls.slice(n0)[0] || {}; return { user: c.user || '', task: c.task || '' };
    };
    window.__fresh = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'psyans', 'fcast'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur');
      const st = APP.S.settings(); st.profile = {}; delete st.psyOpen; APP.S.saveSettings(st); };
    window.__sys = () => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => ({ t: m.text, shown: APP.ASSIST.regSys(__cur(), m.text), birth: m.birth || '' }));
    window.__icu = (iso) => new Intl.DateTimeFormat('en-US-u-ca-persian', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z')).replace(/\s*AP$/, '');
  }, T0);
  const ev = (fn, arg) => p.evaluate(fn, arg);
  const turn = (text, reply, actions, extra) => p.evaluate(([t, r, a, x]) => __turn(t, r, a, x), [text, reply || '', actions || [], extra || null]);
  const fresh = () => ev(() => __fresh());
  const wipe = () => ev(() => __wipe());
  const sys = () => ev(() => __sys());
  const birth = () => ev(() => APP.AGE.birth());
  const icu = (iso) => ev((iso) => __icu(iso), iso);
  const ISO = /[0-9۰-۹]{4}-[0-9۰-۹]{2}-[0-9۰-۹]{2}/;
  const card = (vals) => ev((vals) => { const AS = APP.ASSIST, s = __cur(); const el = (AS.logHooks || []).map(f => { try { return f(s); } catch (e) { return null; } }).filter(Boolean).find(x => x.classList && x.classList.contains('age-ask'));
    if (!el) return { none: true }; document.body.appendChild(el); const out = [];
    for (const v of vals) { const inp = el.querySelector('input'); inp.value = v; [...el.querySelectorAll('button')].find(x => /ثبت/.test(x.textContent)).click();
      out.push({ v, err: el.querySelector('.age-err').textContent, q: el.querySelector('b').textContent, ph: inp.getAttribute('placeholder'), b: APP.AGE.birth() }); }
    el.remove(); return out; }, vals);

  // ===== R5 — یک تأیید برای هر تاریخ، فقط شمسی (B24·D6، D24-5، A24-20، C) =====
  await section('conf', async () => {
    // aB1 p9: «مامانم گفت اینم بگم: من ۳۰ اردیبهشت ۹۶ به دنیا اومدم.» — صفحه از گفت‌وگو + کنشِ birth ِ مدل
    await wipe(); await fresh();
    await turn('مامانم گفت اینم بگم: من ۳۰ اردیبهشت ۹۶ به دنیا اومدم.', 'ممنون که گفتی.', [{ do: 'birth', date: '۳۰ اردیبهشت ۹۶' }]);
    let S = await sys(), bc = S.filter(x => /تاریخِ تولد/.test(x.t) && /ثبت شد/.test(x.t));
    chk(await birth() === '2017-05-20' && (await icu('2017-05-20')) === '2/30/1396', 'aB1: «۳۰ اردیبهشت ۹۶» ⇒ 2017-05-20 (= ICU 1396/2/30) ' + await birth());
    chk(bc.length === 1, 'B24·D6 aB1 p9 / A24-20 / D24-5 (1): one birth confirmation for one date (page + model action) ' + JSON.stringify(bc));
    chk(bc.every(x => !ISO.test(x.shown) && !/میلادی/.test(x.shown) && /۳۰ اردیبهشت ۱۳۹۶/.test(x.shown)), 'B24·D6 / D24-5 (2): the confirmation shows only the Jalali date, never «(2017-05-20 میلادی)» ' + JSON.stringify(bc));
    // aC1 p10 «1396/01/14» در گفت‌وگو + کنشِ مدل با تاریخِ ISO ِ همان روز
    await wipe(); await fresh();
    await turn('من متولد 1396/01/14 هستم.', 'باشه.', [{ do: 'birth', date: '2017-04-03' }]);
    S = await sys(); bc = S.filter(x => /ثبت شد/.test(x.t));
    chk(await birth() === '2017-04-03' && bc.length === 1 && !ISO.test(bc[0].shown) && /۱۴ فروردین ۱۳۹۶/.test(bc[0].shown), 'C aC1 p10: «1396/01/14» ⇒ one Jalali confirmation, no ISO ' + JSON.stringify(bc));
    // B24·D7 aB3: صفحه جمله را خواند؛ تاریخِ ISO ِ مدل یک روز اختلاف دارد ⇒ خواندنِ صفحه می‌ماند، بی تأییدِ دوم
    await wipe(); await fresh();
    await turn('من ۶۷ سالمه، تولدم ۱۲ اردیبهشته.', 'باشه.', [{ do: 'birth', date: '1959-05-02' }]);
    const pageIso = await birth(); S = await sys(); bc = S.filter(x => /ثبت شد/.test(x.t));
    chk(pageIso === '1959-05-03' && (await icu(pageIso)) === '2/12/1338', 'B24·D7 aB3: the page parse of her sentence (۱۲ اردیبهشت, 67 on ۳ آبان ۱۴۰۵ ⇒ 1338/2/12 = 1959-05-03 = ICU) is kept over the model ISO 1959-05-02 ' + pageIso);
    chk(bc.length === 1, 'B24·D7: no second confirmation when the model action disagrees ' + JSON.stringify(bc));
    // کنشِ مدل تنها (صفحه جمله را نخواند): همان یک تأییدِ شمسی
    await wipe(); await fresh();
    const r1 = await ev(() => { APP.ASSIST._turnSession = __cur(); const r = APP.ASSIST.DO.birth({ date: '۲۵ اسفند ۱۳۳۷' }); const r2 = APP.ASSIST.DO.birth({ date: '1959-03-16' }); APP.ASSIST._turnSession = null; return [r, r2, APP.AGE.birth(), __sys()]; });
    chk(r1[2] === '1959-03-16' && r1[3].filter(x => /ثبت شد/.test(x.t)).length === 1 && !ISO.test(r1[3][0].shown), 'model-only birth: one Jalali confirmation even when the action repeats ' + JSON.stringify(r1));
    const r2 = await ev(() => APP.ASSIST.DO.birth({ date: '۳۱ مهر ۱۳۹۶' }));
    chk(/مهر/.test(r2) && !/YYYY|MM-DD/.test(r2), 'a wrong day from the model still gets a human line ' + r2);
  });

  // ===== R5 — کارتِ تولد (B24·D1) =====
  await section('card', async () => {
    await wipe(); await fresh(); await turn('سلام، یه سؤال دارم.', 'بفرمایید.');
    let r = await card(['96/2/30']);
    chk(!r.none && r[0].b === '2017-05-20', 'B24·D1 aB1 c3: card «96/2/30» (two-digit Jalali year) ⇒ 2017-05-20 ' + JSON.stringify(r));
    await wipe(); await fresh(); await turn('سلام، یه سؤال دارم.', 'بفرمایید.');
    r = await card(['۱۷ اسفند', '88']);
    chk(!r.none && r[0].b === '' && /۱۷ اسفند/.test(r[0].q) && /سال/.test(r[0].q) && r[1].b === '2010-03-08' && (await icu('2010-03-08')) === '12/17/1388', 'B24·D1 aB2 c4: the day typed in the card is kept; the year alone «88» completes it ⇒ 2010-03-08 ' + JSON.stringify(r));
    await wipe(); await fresh(); await turn('سلام، یه سؤال دارم.', 'بفرمایید.');
    r = await card(['17 Esfand 1388']);
    chk(!r.none && r[0].b === '2010-03-08', 'B24·D1 aB2 c5: Finglish month name «17 Esfand 1388» ⇒ 2010-03-08 ' + JSON.stringify(r));
    const S = await sys(); chk(S.filter(x => /ثبت شد/.test(x.t)).length === 1 && !ISO.test(S[S.length - 1].shown), 'card confirmation: once, Jalali only ' + JSON.stringify(S));
    const more = await ev(() => ['1388/12/17', '۱۷ اسفند ۸۸', '14 Farvardin 1396', '30/2/96', '۱۳۹۶/۲/۳۰'].map(t => (APP.AGE.parse(t) || {}).iso || ''));
    chk(JSON.stringify(more) === JSON.stringify(['2010-03-08', '2010-03-08', '2017-04-03', '2017-05-20', '2017-05-20']), 'parse: Latin/Persian/Finglish/day-first two-digit year forms ' + JSON.stringify(more));
  });

  // ===== R5 — سنِ به حروف (A24-10) =====
  await section('words', async () => {
    await wipe(); await fresh();
    const u = await turn('من هشتاد و یک سالمه، تولدم ۱۵ تیره. خیاطِ بازنشسته‌ام و برای پردهٔ اتاقِ نوه‌م پارچه می‌خوام.', 'باشه.');
    const bb = await birth(), age = await ev(() => APP.AGE.age());
    chk(bb === '1945-07-06' && age === 81 && (await icu(bb)) === '4/15/1324', 'A24-10 aA4 p1: «هشتاد و یک سالمه، تولدم ۱۵ تیره» ⇒ 1324/4/15 = 1945-07-06, age 81 ' + bb + ' ' + age);
    chk(!/ممکن است کم‌سال باشد/.test(u.user) && /سالمند/.test(u.user), 'A24-10: «# مخاطب» is the elder block, not «ممکن است کم‌سال باشد»');
    const w = await ev(() => ['نه سالمه', 'من بیست و دو سالمه', 'هفتاد و پنج سال دارم', 'یه سال پیش رفتم'].map(t => APP.AGE.ageSaid(t)));
    chk(JSON.stringify(w) === JSON.stringify([9, 22, 75, null]), 'ageSaid reads number words only before «سال…» as her age ' + JSON.stringify(w));
  });

  // ===== R5 — سالمند: «از تاریخِ ثبت‌شده» و «شما» (B24·D8، B24·D11، A23-14، D24-5(3)) =====
  await section('elder', async () => {
    await wipe(); await fresh();
    const u = await turn('سلام. من ۸۲ سالمه، معلم بازنشستهٔ جغرافیا. نوه‌م یه معما ازم پرسید که بلد نبودم: «توی یه مزرعه مرغ و خرگوش هست؛ روی هم ۳۵ تا سر و ۹۴ تا پا دارن.» جواب رو نگو، می‌خوام خودم حل کنم.', 'چه خوب که خودتان می‌خواهید حل کنید.');
    const aud = (u.user.split('\n# ').find(x => /^مخاطب/.test(x)) || '');
    chk(/سالمند/.test(aud) && !/از تاریخِ تولدِ ثبت‌شده/.test(aud) && /سنی که خودش گفت/.test(aud), 'B24·D8 aB4 p1: «۸۲ سالمه» alone ⇒ no «از تاریخِ تولدِ ثبت‌شده» ' + aud.slice(0, 200));
    // page lines in «شما» for an elder with no pronoun of his own
    const L = await ev(() => { const s = __cur(); return [APP.ASSIST.regSys(s, '✓ تاریخِ تولدت ثبت شد: ۱۵ تیر ۱۳۲۴'), APP.ASSIST.regSys(s, 'این روز در آن ماه نیست — روز را دوباره ببین.'), APP.ASSIST.regSys(s, 'سلیقه‌ات را هم بگو'), APP.ASSIST.regSys(s, 'گفتید … با واقعیت سنجیدی‌اش؟')]; });
    chk(/تولدتان/.test(L[0]) && /ببینید/.test(L[1]) && /سلیقه‌تان/.test(L[2]) && !/سنجیدی‌اش/.test(L[3]), 'D24-5(3) / A23-14: every page line to an elder is in «شما» (card error, birth line, closing line, mixed question) ' + JSON.stringify(L));
    // B24·D11 aB4 p8: «اینو یه جا ثبتش کن…» does not make the post-check force «تو»
    await turn('یه حدس بزنم: تقریباً نصف نصف، مثلاً ۲۰ مرغ و ۱۵ خرگوش. پاها میشه ۱۰۰. زیاد شد.', 'خوب است؛ حالا چه می‌کنید؟');
    await turn('وارسی کردم: ۲۳ + ۱۲ = ۳۵ سر. پاها ۹۴. درسته!', 'آفرین؛ خودتان وارسی کردید.');
    const w = await ev(() => { const s = __cur(); s.msgs.push({ role: 'user', text: 'اینو یه جا ثبتش کن که فردا وقتی نوه‌م اومد، از روی همون براش توضیح بدم.', at: new Date().toISOString() });
      APP.ASSIST._turnSession = s; const r = APP.ASSIST.replyCheck({ reply: 'حتماً؛ ثبتش می‌کنم تا فردا از رویش برای نوه‌تان توضیح بدهید.', actions: [] }, { task: 'lla_assistant' }); APP.ASSIST._turnSession = null; s.msgs.pop(); return r; });
    chk(!/«تو» بنویس/.test(w), 'B24·D11 aB4 p8: the register post-check never forces «تو» on an 82-year-old ' + w);
    const rg = await ev(() => APP.ASSIST.convRegister(__cur(), '', []));
    chk(rg === 'shoma', 'elder register is «شما» ' + rg);
    // an explicit «تو صدام کن» from the elder wins
    await turn('راستی لازم نیست شما بگید، تو صدام کن.', 'باشه.');
    chk(await ev(() => APP.ASSIST.convRegister(__cur(), '', [])) === 'to', 'an explicit «تو صدام کن» from an elder wins');
  });

  // ===== R5 — هرگز ISO به آدم (D24-6) =====
  await section('iso', async () => {
    await wipe(); await fresh();
    const f = await ev(() => [APP.faDates('پیش‌بینی در 🎯 ثبت شد (موعد ۲۰۲۶-۱۰-۲۱).'), APP.faDates('موعد 2026-10-21 است'), APP.faDates('«تاریخش 2026-10-21 بود»'), APP.faDates('شمارهٔ 12345-12-12')]);
    chk(/۲۹ مهر ۱۴۰۵/.test(f[0]) && !ISO.test(f[0]) && /۲۹ مهر ۱۴۰۵/.test(f[1]) && /2026-10-21/.test(f[2]) && f[3] === 'شمارهٔ 12345-12-12', 'D24-6 oD1 p19: «موعد ۲۰۲۶-۱۰-۲۱» ⇒ «۲۹ مهر ۱۴۰۵»; her quoted words untouched ' + JSON.stringify(f));
    await turn('پیش‌بینیم رو ثبت کن: هشتاد درصد مطمئنم.', 'پیش‌بینی‌ات ثبت شد؛ موعد 2026-10-21.', [], { memory: 'پیش‌بینی در 🎯 ثبت شد (موعد ۲۰۲۶-۱۰-۲۱).' });
    const shown = await ev(() => { APP.ASSIST.toggle(true); APP.ASSIST.paint(); return [...document.querySelectorAll('.as-msg.ai .as-tx')].map(x => x.textContent).join(' | '); });
    chk(shown && !ISO.test(shown) && /۲۹ مهر ۱۴۰۵/.test(shown), 'D24-6: a model reply with an ISO date is shown to her in Jalali ' + shown);
    await ev(() => APP.ASSIST.toggle(false));
  });

  // ===== R5 — نشانه‌های ضمیر فقط از فعل (C24-10، C24-15، B24·D11) =====
  await section('reg', async () => {
    const g = await ev(() => { const S = (t) => APP.ASSIST.regSigns(t); return {
      bebinam: S('حالا ببینم این راه جواب میده یا نه.'), rutin: S('روتینم رو هر روز صبح انجام میدم.'), sabt: S('اینو یه جا ثبتش کن که یادم نره.'),
      begu: S('بگو چی کار کنم'), begid: S('بگید چی کار کنم'), goftin: S('گفتین که حدس بزنم'), latin: S('حروفِ لاتین رو بلد نیستم'), bebin: S('اینو ببین') }; });
    chk(!g.bebinam.to, 'C24-10 aC4 p5: «ببینم» (first person) is not a «تو» sign ' + JSON.stringify(g.bebinam));
    chk(!g.rutin.sh && !g.latin.sh, 'C24-15 tC1 p17: the noun «روتین» / «لاتین» is not a «شما» sign ' + JSON.stringify([g.rutin, g.latin]));
    chk(!g.sabt.to, 'B24·D11: an imperative to the machine «ثبتش کن» is not a register sign ' + JSON.stringify(g.sabt));
    chk(g.begu.to && g.begid.sh && g.goftin.sh, 'verbs still sign: «بگو» ⇒ تو, «بگید»/«گفتین» ⇒ شما ' + JSON.stringify(g));
    const ts = await ev(() => APP.ASSIST.toShoma('با واقعیت سنجیدی‌اش؟ از راهِ دیگری هم به همین می‌رسیدی؟'));
    chk(/سنجیدیدش/.test(ts) && /می‌رسیدید/.test(ts), 'A23-14 aA4 p6: «سنجیدی‌اش» converts with the rest of the question ' + ts);
  });

  // ===== R5 — زیرِ ۱۸: کارنامه و معما (D24-10، C24-18، A24-13) =====
  await section('mind', async () => {
    await wipe(); await ev(() => { const st = APP.S.settings(); st.profile = { birth: '2017-04-03' }; APP.S.saveSettings(st); });
    await ev(() => APP.go('mind')); await p.waitForTimeout(300);
    const t = await ev(() => { const tb = document.querySelector('.psy-table'); return tb ? tb.textContent : ''; });
    chk(t && /هنجارِ معتبر در دست نیست/.test(t) && !/هنوز معمای لنگرداری در این سازه جواب نداده‌ای/.test(t), 'D24-10 aD1: a 9-year-old\'s «نسبت به مردم» says no valid norm exists for this age, not «هنوز … جواب نداده‌ای» ' + t.slice(0, 300));
    const mp = await ev(() => (APP.ASSIST.promptHooks || []).map(f => { try { return f(null, '') || ''; } catch (e) { return ''; } }).join('\n'));
    const gf = mp.split('\n').find(l => /^- استدلالِ سیال/.test(l)) || '';
    chk(!/هنوز معمای لنگرداری جواب داده نشده/.test(gf) && /مقایسه با مردم: برای این سن هنجارِ معتبر در دست نیست/.test(gf), gf + ' — ' + 'D24-10 (a29 norm line): the assistant\'s mind-card copy says the same honest line');
    // A24-13: the mind-card date field shows its error
    await ev(() => { const st = APP.S.settings(); st.profile = {}; APP.S.saveSettings(st); APP.render(); }); await p.waitForTimeout(200);
    const e = await ev(() => { const box = document.querySelector('.psy-age'); const inp = box.querySelector('input'); inp.value = '۱۳۲۴/۴/۵۱'; [...box.querySelectorAll('button')].find(x => /ثبت/.test(x.textContent)).click(); const el = document.querySelector('.psy-age-err'); return [el ? el.textContent : '', APP.AGE.birth()]; });
    chk(/تیر/.test(e[0]) && /۳۱ روز/.test(e[0]) && e[1] === '', 'A24-13 aA4: mind-card date «۱۳۲۴/۴/۵۱» ⇒ not saved, with a visible message by the field ' + JSON.stringify(e));
  });
  await section('puzzle', async () => {
    await wipe(); await ev(() => { const st = APP.S.settings(); st.profile = { birth: '2017-04-03' }; APP.S.saveSettings(st); });
    await ev(() => APP.go('psy_item')); await p.waitForTimeout(250);
    const r = await ev(() => ({ q: !!document.querySelector('.psy-q'), txt: (document.querySelector('#main') || document.body).textContent, open: APP.PSY.openItems().length,
      today: (APP.dueList() || []).some(x => /معمای امروز/.test(x.txt || '')) }));
    chk(!r.q && /هنجارِ معتبر در دست نیست/.test(r.txt) && !/مقایسهٔ منصفانه با آن‌ها/.test(r.txt) && r.open === 0 && !r.today, 'C24-18 aC1: a 9-year-old opening «🧩 معمای امروز» directly gets no adult-normed puzzle, no «مقایسهٔ منصفانه با آن‌ها», and nothing opens into «امروز» ' + JSON.stringify(Object.assign({}, r, { txt: r.txt.slice(0, 120) })));
    // adult unchanged
    await ev(() => { const st = APP.S.settings(); st.profile = { birth: '1985-01-01' }; delete st.psyOpen; APP.S.saveSettings(st); APP.go('home'); APP.go('psy_item'); }); await p.waitForTimeout(250);
    chk(await ev(() => !!document.querySelector('.psy-q')), 'adult still gets the puzzle');
    await ev(() => { const st = APP.S.settings(); delete st.psyOpen; APP.S.saveSettings(st); });
  });

  // ===== R5 — نامِ مدرسهٔ کم‌سال در پرونده (B، aB1) =====
  await section('school', async () => {
    await wipe(); await ev(() => { const st = APP.S.settings(); st.profile = { birth: '2017-05-20' }; APP.S.saveSettings(st); });
    const msg = 'اینکه چند تا اتوبوس لازمه که همه‌ی بچه‌ها سوار شن. من ۱۷۸ رو تقسیم بر ۴۲ کردم، شد ۴ و یه چیزی باقی موند. مدرسه‌ی ما اسمش دبستان شهید رجایی‌ه، کلاس سوم الف.';
    const r = await ev((msg) => { const t = APP.AGE.privText(msg); const D = APP.AGE.privDossier({ title: 'x', statement: msg, events: [{ k: 'u', lines: [msg], src: { text: msg, sess: 's' } }] });
      return { t, d: D.events[0].src.text, l: D.events[0].lines[0], st: D.statement, wrapped: !!(APP.dossier && APP.dossier._priv24) }; }, msg);
    chk(!/رجایی/.test(r.t) && !/رجایی/.test(r.d) && !/رجایی/.test(r.l) && /۱۷۸ رو تقسیم بر ۴۲/.test(r.t) && /\[نامِ مدرسه\]/.test(r.t) && r.wrapped, 'B aB1: a minor\'s school name is not kept verbatim in the dossier; her work is ' + JSON.stringify(r));
    const r2 = await ev(() => [APP.AGE.privText('من دبستان شهید رجایی میرم'), APP.AGE.privText('معلممون تو مدرسه گفت')]);
    chk(!/رجایی/.test(r2[0]) && r2[1] === 'معلممون تو مدرسه گفت', 'privText keeps sentences without a school name ' + JSON.stringify(r2));
    await ev(() => { const st = APP.S.settings(); st.profile = { birth: '1980-01-01' }; APP.S.saveSettings(st); });
    chk(await ev((msg) => APP.AGE.privText(msg) === msg, msg), 'adults: dossier text unchanged');
  });

  // ===== D24-6 — آینهٔ درایو (آخر، چون میزبانِ ساختگیِ آینه می‌ماند) =====
  await section('mirror', async () => {
    await wipe(); await fresh();
    await turn('پیش‌بینیم رو ثبت کن: هشتاد درصد مطمئنم.', 'پیش‌بینی‌ات ثبت شد؛ موعد 2026-10-21.', [], { memory: 'پیش‌بینی در 🎯 ثبت شد (موعد ۲۰۲۶-۱۰-۲۱).' });
    await ev(() => { APP.HOST = { mirror: async () => ({}) }; APP.mirrorInstalled(); });
    const mir = await ev(() => { const B = APP.MIRROR_BUILD && APP.MIRROR_BUILD.achat; if (!B) return null; const o = B(__cur()); return JSON.stringify(o.tabs[0].rows) + JSON.stringify(o.tabs[1].rows.filter(r => r[1] !== 'من')); });
    chk(mir && !ISO.test(mir.replace(/"\d{4}-\d{2}-\d{2}[ T]?[0-9:]*"/g, '')) && /۲۹ مهر ۱۴۰۵/.test(mir), 'D24-6: the Drive mirror «حافظهٔ سشن» row reads Jalali ' + String(mir).slice(0, 300));
  });

  await b.close();
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n- ' + errors.join('\n- ')); process.exitCode = 1; }
  else console.log('test_tour1_r24_age: NO ERRORS');
})();
