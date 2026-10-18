// تورِ پولیا (دستهٔ ۱، دورِ ۲۰، ۲۰۲۶-۱۰-۱۸) — DECISIONS_R20، تصمیمِ MT2 (مسیریابیِ رده): نوبتِ مربی‌گری ⇒ «lla_coach»، نوبتِ فقط-عمل و پیگیریِ خودکار ⇒ «lla_assistant».
//  شاهد (models20): همان پرامپت‌ها روی ردهٔ سریع ۴ از ۸ سناریو شکست، روی ردهٔ میانه ۰ از ۸. سویِ سرور (مسیرِ تازه در کاتالوگ، ردهٔ میانه نه بالا،
//  _AI_TASKS) در tests/test_lla_coach_route.py است؛ این‌جا تنها جای فراخوانیِ a26 (AS.chatTask، تابعِ خالص) و پشتیبانِ ۴۲۲/بی‌مدل.
//  بانکِ مستقل: tests/variants/VARIANTS_R20.json (rc = MT2.routing، ۱۹ ورودی؛ LLA_VARIANTS = مسیرِ دیگر) — هر ورودی یا در صفحه سنجیده می‌شود
//  یا صریحاً به آزمونِ سرور سپرده می‌شود (backend)، نه بی‌صدا.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = process.env.LLA_VARIANTS || path.join(__dirname, 'variants', 'VARIANTS_R20.json');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const J = (x) => JSON.stringify(x);
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__fail = null;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      upload: async (rid, f) => ({ id: 900 + Math.floor(Math.random() * 99), name: f.name, mime: f.type, link: 'https://drive/x' }) };
    // __fail(opts) ⇒ خطای ساختگی برای همین درخواست (۴۲۲ ِ سرورِ قدیمی یا «مدلی پاسخ نداد»)
    APP.callAI = async (sys, user, opts) => { __calls.push({ user: String(user), opts: Object.assign({}, opts) }); const f = window.__fail && window.__fail(opts); if (f) throw f;
      const r = __q.shift(); return { text: JSON.stringify(r || { reply: 'باشه.', status: 'related', actions: [] }), files: [] }; };
  });

  /* ---------- ۱) تابعِ خالص ---------- */
  info.pure = await p.evaluate(() => {
    const T = APP.ASSIST.chatTask, coach = '# مربیِ حل (روحِ «چگونه آن را حل کنیم») — …\n- قاعدهٔ سبک', live = '# مسئلهٔ زندهٔ این سشن (lp_x): «x» · مرحله: طرح\n';
    return {
      liveFocus: T({ msg: 'فکر می‌کنم باید استقرا بزنم', prompt: live + coach }),
      tutor: T({ msg: 'نمی‌دونم', prompt: '# معلمِ حلِ مسئله — کاربر همین حالا دارد «x» را حل می‌کند' }),
      lookback: T({ msg: 'سؤالِ دوم کمکم کرد', prompt: '# پاسخ به پرسشِ بازنگری (x)\n' + coach }),
      retractChat: T({ msg: 'پس جوابم غلط بود!', prompt: '# اصلاحِ پیامِ پیشین (شاهد)\n' + coach }),
      retractEdit: T({ msg: '[اصلاحِ پیامِ قبلی] «۵» ⇐ «۶» — متنِ درستِ پیامم: «۶»', prompt: '# اصلاحِ پیامِ قبلی — صفحه\n' + live + coach }),
      chatProb: T({ msg: 'ثابت کن مجموعِ دو عددِ فرد زوج است', prompt: coach }),
      life: T({ msg: 'می‌خوام عادتِ ورزش رو نگه دارم', prompt: coach }),
      plainQ: T({ msg: 'ساعت جلسه‌م کِیه؟', prompt: coach }),
      sticky: T({ msg: 'خب بعدش چی؟', prompt: coach, prev: 'lla_coach' }),
      stickyNoBlock: T({ msg: 'مرسی', prompt: '# صفحهٔ فعلی', prev: 'lla_coach' }),
      actLive: T({ msg: 'برو به صفحه‌ی امروز', prompt: live + coach, prev: 'lla_coach' }),
      fillLive: T({ msg: 'مجهول رو بنویس زمان کل', prompt: live + coach }),
      autoFollow: T({ msg: '[سامانه: «امروز» باز شد]', prompt: live + coach, prev: 'lla_coach' }),
      autoAnswer: T({ msg: '[سامانه: گزاره‌ها آمد؛ حالا پاسخ بده.]', prompt: live + coach, prev: 'lla_coach', inherit: true }),
      autoAnswerFast: T({ msg: '[سامانه: گزاره‌ها آمد؛ حالا پاسخ بده.]', prompt: coach, prev: 'lla_assistant', inherit: true }),
      off: T({ msg: 'فکر می‌کنم باید استقرا بزنم', prompt: live + coach, off: true }),
      empty: T(),
    };
  });
  const P = info.pure;
  chk(P.liveFocus === 'lla_coach' && P.tutor === 'lla_coach' && P.lookback === 'lla_coach' && P.retractChat === 'lla_coach', 'coach layer (live / tutor / look-back / retract in chat) ⇒ lla_coach: ' + J(P));
  chk(P.chatProb === 'lla_coach' && P.life === 'lla_coach' && P.sticky === 'lla_coach', 'chat-only problem, life problem, continuing coach turn ⇒ lla_coach: ' + J(P));
  chk(P.plainQ === 'lla_assistant' && P.stickyNoBlock === 'lla_assistant' && P.actLive === 'lla_assistant' && P.fillLive === 'lla_assistant' && P.retractEdit === 'lla_assistant', 'plain question, greeting, action-only, ✏️ result-only ⇒ lla_assistant: ' + J(P));
  chk(P.autoFollow === 'lla_assistant' && P.autoAnswer === 'lla_coach' && P.autoAnswerFast === 'lla_assistant', 'automatic follow-ups fast; the answer-writing follow-up keeps the user turn\'s tier: ' + J(P));
  chk(P.off === 'lla_assistant' && P.empty === 'lla_assistant', 'old backend (off) and empty input ⇒ lla_assistant: ' + J(P));

  /* ---------- ۲) صفحهٔ واقعی ---------- */
  // سشنِ تازه، یا سشنِ بسته به مسئلهٔ زنده (همان راهِ a38: s.lprob)
  const sess = (o) => p.evaluate((o) => {
    const A = APP.ASSIST, c = A.cur(); if (c && !c.msgs.length) APP.S.del(c.id);
    const s = A.newSession();
    if (o && o.live) { const r = APP.liveCreate(o.title || ('دورِ ۲۰ ' + Math.random().toString(36).slice(2, 7)), o.st, o.type || 'find', { by: 'user', nat: o.nat || 'objective' });
      s.lprob = typeof r === 'string' ? r : (r && r.p ? r.p.id : r.id); APP.S.put(s); }
    window.__calls = []; window.__q = []; window.__fail = null; return s.id;
  }, o || {});
  const send = (text, o) => p.evaluate(async ([text, o]) => {
    window.__calls = []; window.__fail = null;
    if (o && o.q) window.__q = o.q;
    if (o && o.fail) window.__fail = new Function('opts', o.fail);
    const files = ((o && o.files) || []).map(f => new File([new Uint8Array([37, 80, 68, 70, 1, 2, 3])], f.name, { type: f.type }));
    await APP.ASSIST.send(text, files);
    for (let i = 0; i < 200 && APP.ASSIST.busy(); i++) await new Promise(r => setTimeout(r, 25));
    const s = APP.ASSIST.cur();
    return { tasks: __calls.map(c => c.opts.task), models: __calls.map(c => c.opts.model || null), files: __calls.map(c => (c.opts.fileIds || []).length),
      live: __calls.map(c => /^# مسئلهٔ زندهٔ این سشن/m.test(c.user)), lastAi: ((s.msgs || []).filter(m => m.role === 'ai').pop() || {}).text || '',
      sys: (s.msgs || []).filter(m => m.role === 'sys').map(m => m.text).join(' | '), aiTask: s.aiTask, off: !!APP.ASSIST._coachOff };
  }, [text, o || {}]);
  const OLY = 'ثابت کن برای هر عددِ طبیعیِ n، عددِ n^3 - n بر ۶ بخش‌پذیر است';
  const R = {};
  await sess({ live: true, st: OLY }); R.live = await send('فکر می‌کنم باید از استقرا استفاده کنم ولی گامِ استقرا رو نمی‌بینم');
  chk(R.live.tasks[0] === 'lla_coach' && R.live.live[0] && R.live.aiTask === 'lla_coach', 'live problem in focus ⇒ the real request uses lla_coach: ' + J(R.live));
  await sess(); R.tour = await send('نمی‌دونم کارِ فعلیم رو ول کنم یا بمونم، تصمیمش برام سخته');
  chk(R.tour.tasks[0] === 'lla_coach', 'ill-posed life decision ⇒ lla_coach: ' + J(R.tour));
  await sess({ live: true, st: 'چند راه برای چیدنِ ۵ کتاب در یک قفسه هست؟' }); R.look = await send('حل شد! جوابش ۱۲۰ بود، با ضربِ ۵ در ۴ در ۳ در ۲ در ۱');
  chk(R.look.tasks[0] === 'lla_coach', 'look-back moment after «حل شد» ⇒ lla_coach: ' + J(R.look));
  await sess({ live: true, st: OLY }); R.photo = await send('این عکسِ کارمه، ببین کجاش اشتباهه', { files: [{ name: 'work.png', type: 'image/png' }] });
  chk(R.photo.tasks[0] === 'lla_coach' && R.photo.files[0] >= 1, 'coaching turn with a photo ⇒ lla_coach with the file: ' + J(R.photo));
  await sess({ live: true, st: OLY }); R.pdf = await send('این PDF ِ راه‌حلمه، گامِ دومش درسته؟', { files: [{ name: 'sol.pdf', type: 'application/pdf' }] });
  chk(R.pdf.tasks[0] === 'lla_coach' && R.pdf.files[0] >= 1, 'coaching turn with a PDF ⇒ lla_coach with the file: ' + J(R.pdf));
  await sess(); R.habit = await send('می‌خوام عادتِ پیاده‌رویِ هر روز رو نگه دارم ولی هر هفته ولش می‌کنم');
  chk(R.habit.tasks[0] === 'lla_coach', 'habit problem (life tunnel) ⇒ lla_coach: ' + J(R.habit));
  await sess({ live: true, st: 'چطور هزینهٔ ماهانهٔ خانه را ۲۰ درصد کم کنم؟', nat: 'practical' }); R.ret = await send('برگشتم سراغِ همون مسئله؛ دیروز به نتیجه نرسیدم');
  chk(R.ret.tasks[0] === 'lla_coach', 'day-N return on an open live problem ⇒ lla_coach: ' + J(R.ret));
  await sess(); R.rec = await send('این رو تو امروز ثبت کن');
  chk(R.rec.tasks[0] === 'lla_assistant', 'action only, no live problem ⇒ lla_assistant: ' + J(R.rec));
  await sess({ live: true, st: OLY });
  R.auto = await send('فکر می‌کنم باید از استقرا استفاده کنم', { q: [{ reply: 'می‌برمت به میزِ کار.', status: 'related', actions: [{ do: 'go', view: 'e_home' }] }] });
  chk(R.auto.tasks.length >= 2 && R.auto.tasks[0] === 'lla_coach' && R.auto.tasks.slice(1).every(t => t === 'lla_assistant'), 'automatic follow-up after a page action ⇒ lla_assistant: ' + J(R.auto));
  await sess({ live: true, st: OLY }); R.go = await send('برو به صفحه‌ی امروز');
  chk(R.go.tasks[0] === 'lla_assistant', '«برو به صفحه‌ی امروز» ⇒ lla_assistant even with a live problem: ' + J(R.go));
  await sess({ live: true, st: 'یک کار را با دو روش انجام می‌دهم؛ زمانِ کل چقدر می‌شود؟', nat: 'practical' }); R.fill = await send('مجهول رو بنویس زمان کل');
  chk(R.fill.tasks[0] === 'lla_assistant', 'form-fill-only turn ⇒ lla_assistant: ' + J(R.fill));
  await sess(); R.q = await send('ساعت جلسه‌م کِیه؟');
  chk(R.q.tasks[0] === 'lla_assistant', 'general question with no coach layer ⇒ lla_assistant: ' + J(R.q));
  await sess({ live: true, st: OLY }); R.edit = await send('[اصلاحِ پیامِ قبلی] «n^2» ⇐ «n^3» — متنِ درستِ پیامم: «با n^3 شروع کردم»');
  chk(R.edit.tasks[0] === 'lla_assistant', '✏️ result-only turn ⇒ lla_assistant: ' + J(R.edit));
  // پشتیبان: «مدلی برای lla_coach پاسخ نداد» ⇒ یک بار همان درخواست با lla_assistant، بی خطا و بی نامِ مدل
  await sess({ live: true, st: OLY });
  R.nomodel = await send('فکر می‌کنم باید از استقرا استفاده کنم', { fail: "return opts.task === 'lla_coach' ? new Error('هیچ مدلی تنظیم نشده') : null" });
  chk(J(R.nomodel.tasks) === J(['lla_coach', 'lla_assistant']) && R.nomodel.lastAi === 'باشه.' && !/خطا|نشد|مدل/.test(R.nomodel.sys) && !R.nomodel.off, 'no model for lla_coach ⇒ retried once on lla_assistant, answer shown, no error: ' + J(R.nomodel));
  // سرورِ قدیمی: ۴۲۲ ⇒ یک بار با lla_assistant و از آن پس دیگر lla_coach فرستاده نمی‌شود
  await sess({ live: true, st: OLY });
  R.old = await send('فکر می‌کنم باید از استقرا استفاده کنم', { fail: "if (opts.task !== 'lla_coach') return null; const e = new Error('Request failed with status code 422'); e.response = { status: 422, data: { detail: 'task نامعتبر' } }; return e;" });
  chk(J(R.old.tasks) === J(['lla_coach', 'lla_assistant']) && R.old.lastAi === 'باشه.' && R.old.off, 'old backend 422 ⇒ retried on lla_assistant and remembered: ' + J(R.old));
  R.old2 = await send('گامِ استقرا رو هنوز نمی‌بینم', { fail: "return opts.task === 'lla_coach' ? new Error('must not be sent') : null" });
  chk(J(R.old2.tasks) === J(['lla_assistant']), 'after a 422 the page stops sending lla_coach: ' + J(R.old2));
  await p.evaluate(() => { APP.ASSIST._coachOff = false; });
  // هیچ نامِ مدلی در درخواستِ صفحه نیست (گزینش با سرور)
  const allModels = Object.values(R).flatMap(r => r.models || []);
  chk(allModels.every(m => m == null), 'the page never names a model: ' + J(allModels));
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'a26_assist.js'), 'utf8');
  const callSite = src.slice(src.indexOf('AS.chatTask = function'), src.indexOf('AS.callTask = callTask'));
  chk(callSite.length > 200 && !/claude|gemini|gpt|sonnet|haiku|opus|flash/i.test(callSite), 'no model name hard-coded in the routing code');

  /* ---------- ۳) بانکِ مستقل VARIANTS_R20 (MT2) ---------- */
  const bank = JSON.parse(fs.readFileSync(BANK, 'utf8')).filter(e => e.rc === 'MT2.routing');
  chk(bank.length === 19, 'MT2 bank: 19 entries, got ' + bank.length);
  const OK = (r, t) => ({ ok: r && r.tasks[0] === t, got: r && r.tasks });
  const BACKEND = (why) => ({ ok: true, backend: why });
  const map = [
    () => OK(R.live, 'lla_coach'), () => OK(R.tour, 'lla_coach'), () => OK(R.look, 'lla_coach'),
    () => ({ ok: R.photo.tasks[0] === 'lla_coach' && R.photo.files[0] >= 1, got: R.photo, backend: 'vision required: test_lla_coach_route.py' }),
    () => ({ ok: R.pdf.tasks[0] === 'lla_coach' && R.pdf.files[0] >= 1, got: R.pdf, backend: 'documents required: test_lla_coach_route.py' }),
    () => BACKEND('catalog row, preferred reasoning + tier balanced, requires vision+documents: test_route_is_in_the_catalog_next_to_the_assistant'),
    () => ({ ok: allModels.every(m => m == null), got: allModels, backend: 'auto pick within the tier: test_coach_auto_pick_is_the_balanced_tier_not_the_top / after_live_refresh' }),
    () => BACKEND('AI settings task list (GET /api/ai/overview) and _AI_TASKS: test_settings_task_list_shows_the_coach_next_to_the_assistant, test_app_ai_accepts_the_coach_task'),
    () => OK(R.habit, 'lla_coach'), () => OK(R.ret, 'lla_coach'),
    () => OK(R.rec, 'lla_assistant'),
    () => ({ ok: R.auto.tasks.slice(1).length >= 1 && R.auto.tasks.slice(1).every(t => t === 'lla_assistant'), got: R.auto.tasks }),
    () => OK(R.go, 'lla_assistant'), () => OK(R.fill, 'lla_assistant'), () => OK(R.q, 'lla_assistant'),
    () => ({ ok: J(R.nomodel.tasks) === J(['lla_coach', 'lla_assistant']) && R.nomodel.lastAi === 'باشه.', got: R.nomodel }),
    () => BACKEND('never prefers the top tier: test_coach_auto_pick_is_the_balanced_tier_not_the_top (Opus priority 1 in the seed, Sonnet chosen)'),
    () => OK(R.edit, 'lla_assistant'),
    () => ({ ok: R.q.tasks[0] === 'lla_assistant' && R.rec.tasks[0] === 'lla_assistant', got: [R.q.tasks, R.rec.tasks], backend: 'test_other_routes_unchanged, test_app_ai_accepts_the_coach_task' }),
  ];
  const res = { pass: 0, backend: [], fail: [] };
  bank.forEach((e, i) => { const r = map[i] ? map[i]() : { ok: false, got: 'unmapped' };
    if (r.ok) { res.pass++; if (r.backend) res.backend.push('#' + i + ' ' + r.backend); } else res.fail.push('#' + i + ' ' + e.kind + ' «' + e.text.slice(0, 60) + '» — ' + e.expect.slice(0, 80) + ' got ' + J(r.got).slice(0, 300)); });
  res.fail.forEach(f => errors.push('MT2 bank: ' + f));
  info.bank = res;

  console.log(JSON.stringify({ bank: info.bank }, null, 1));
  await b.close();
  if (errors.length) { console.error('FAIL\n' + errors.join('\n')); process.exit(1); }
  console.log('OK test_tour1_r20_routing');
})().catch(e => { console.error(e); process.exit(1); });
