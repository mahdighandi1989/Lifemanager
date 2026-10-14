// «💬 دستیار» (مالک ۲۰۲۶-۱۰-۱۴): گفت‌وگوی شناور که اشرافش از ثبت‌گاه‌ها ساخته می‌شود، می‌برد، پر می‌کند، هایلایت می‌کند،
// فایل را به فولدرِ سشن می‌فرستد و به مدلِ بینا می‌دهد، حرفِ نامربوط را رد می‌کند، و کمبود را یک‌بار (بی‌تکرار) برگهٔ فوری می‌کند.
// هوش و میزبان این‌جا بدلی‌اند (پاسخِ از پیش نوشته)؛ آنچه آزموده می‌شود رفتارِ خودِ صفحه است.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  await p.goto(FILE); await p.waitForSelector('.nav');
  await p.evaluate(() => {
    APP.S.loaded = true;  // the host renders only after its records arrive
    window.__calls = []; window.__ups = []; window.__reps = []; window.__q = [];
    APP.HOST = { upload: async (rid, f, meta) => { __ups.push({ rid, name: f.name, meta }); return { id: 7 + __ups.length, name: f.name, mime: f.type, link: 'https://drive/x' }; },
      report: async (o) => { __reps.push(o); return { id: 'rep' + __reps.length, number: 40 + __reps.length }; } };
    // پاسخِ بعدی از صف؛ تابع باشد ⇒ با متنِ پیام ساخته می‌شود (برای برداشتنِ کلیدِ واقعیِ فیلدها)
    APP.callAI = async (sys, user, opts) => { __calls.push({ sys, user, opts }); const r = __q.shift(); return JSON.stringify(typeof r === 'function' ? r(user) : r); };
  });
  // ۱) دکمهٔ شناور هست و باز می‌شود
  chk(await p.isVisible('.as-fab'), 'floating button on every page');
  await p.click('.as-fab'); await p.waitForSelector('.as-panel:not([hidden])');
  chk(await p.isVisible('.as-hello'), 'calm first message in an empty session');

  // ۲) اشراف: هر نما در نقشه؛ نمای تازه بی کارِ دیگری اضافه می‌شود
  info.man = await p.evaluate(() => {
    const m = APP.ASSIST.manifest(), miss = Object.keys(APP.V).filter(v => !m.includes('- ' + v + ' — '));
    APP.V.zz_new = () => document.createElement('div'); APP.VIEW_META.zz_new = { j: 'ws', what: 'قابلیتِ تازهٔ آزمایشی', why: 'آزمون' };
    const grows = APP.ASSIST.manifest().includes('zz_new') && APP.ASSIST.manifest().includes('قابلیتِ تازهٔ آزمایشی');
    delete APP.V.zz_new; delete APP.VIEW_META.zz_new;
    const noMeta = Object.keys(APP.V).filter(v => !APP.VIEW_META[v]);
    return { miss, grows, noMeta, len: m.length, flows: m.includes('جایی گیر کرده‌ام'), tech: m.includes('تکنیک‌های یادگیری'), st: m.includes('ایستگاه‌های کارخانه') };
  });
  chk(info.man.miss.length === 0, 'every view is in the manifest: ' + info.man.miss);
  chk(info.man.grows, 'a new view + VIEW_META appears in the manifest automatically');
  chk(info.man.noMeta.length === 0, 'every view has VIEW_META (what/why) so the assistant can explain it: ' + info.man.noMeta);
  chk(info.man.flows && info.man.tech && info.man.st, 'manifest carries flows, techniques, stations');
  info.lim = await p.evaluate(() => ({ sys: APP.ASSIST.SYS.length, user: APP.ASSIST.prompt(APP.ASSIST.newSession(), 'x', APP.ASSIST.scan(), '').length }));
  await p.evaluate(() => { const s = APP.ASSIST.cur(); APP.S.del(s.id); });
  chk(info.lim.sys < 20000 && info.lim.user < 60000, 'within the server limits (system 20k, user 60k): ' + JSON.stringify(info.lim));

  // ۳) «می‌خواهم ادعایی را بسنجم» ⇒ می‌برد به میزِ کار، سپس (نوبتِ خودکار) پر می‌کند و باقی را هایلایت می‌کند
  await p.evaluate(() => {
    __q.push({ reply: 'می‌برمت به میزِ کار.', title: 'سنجشِ خبرِ دلار', pinned: 'سنجیدنِ خبرِ «دلار فردا بالا می‌رود»', memory: 'هدف: سنجشِ خبر.', status: 'related',
      steps: [{ t: 'نوشتنِ ادعا در میزِ کار', s: 'now', view: 'e_home' }, { t: 'پرکردنِ ایستگاه‌ها', s: 'todo', view: 'e_cases' }], actions: [{ do: 'go', view: 'e_home' }] });
    __q.push(user => {
      const ks = [...user.matchAll(/^- (k\d+) \| (textarea|text|select)/gm)].map(m => m[1]);
      return { reply: 'ادعا را نوشتم؛ زردها با تو.', memory: 'هدف: سنجشِ خبر. ادعا نوشته شد.', status: 'related',
        steps: [{ t: 'نوشتنِ ادعا در میزِ کار', s: 'done', view: 'e_home' }, { t: 'پرکردنِ ایستگاه‌ها', s: 'now', view: 'e_cases' }],
        actions: [{ do: 'fill', k: ks[0], value: 'دلار فردا بالا می‌رود' }].concat(ks[1] ? [{ do: 'highlight', k: ks[1], why: 'بگو از کجا شنیدی' }] : []) };
    });
  });
  await p.fill('.as-in', 'یه خبر شنیدم دلار فردا بالا میره، می‌خوام بسنجمش');
  await p.click('.as-send');
  await p.waitForFunction(() => __calls.length >= 2 && !document.querySelector('.as-typing'), null, { timeout: 8000 });
  await p.waitForTimeout(200);
  info.t1 = await p.evaluate(() => {
    const s = APP.ASSIST.cur(), f = document.querySelector('#main .as-filled');
    return { view: APP.state.view, task: __calls[0].opts.task, auto: /باز شد/.test(__calls[1].user), filled: f ? f.value : null, hl: !!document.querySelector('#main .as-hl'),
      title: s.title, pinned: s.pinned, steps: s.steps.map(x => x.s).join(), msgs: s.msgs.length, saved: !!APP.S.get(s.id),
      pinUI: !!document.querySelector('.as-pin'), stepsUI: document.querySelector('.as-steps summary') && document.querySelector('.as-steps summary').textContent,
      ctx: __calls[1].user.includes('سنجیدنِ خبرِ') && __calls[1].user.includes('هدف: سنجشِ خبر'), sysRules: __calls[0].sys.includes('نامربوط') && __calls[0].sys.includes('داوری نکن') };
  });
  chk(info.t1.view === 'e_home', 'went to the right section: ' + info.t1.view);
  chk(info.t1.task === 'lla_assistant', 'the chat uses its own fast AI task');
  chk(info.t1.auto, 'after navigation the assistant got a fresh scan automatically');
  chk(info.t1.filled === 'دلار فردا بالا می‌رود', 'filled the form from the user\'s words');
  chk(info.t1.title === 'سنجشِ خبرِ دلار' && /دلار/.test(info.t1.pinned) && info.t1.steps === 'done,now' && info.t1.saved, 'session named, pinned, steps saved');
  chk(info.t1.pinUI && /۱ از ۲/.test(info.t1.stepsUI || ''), 'pinned request + progress drawer shown');
  chk(info.t1.ctx && info.t1.sysRules, 'memory + pinned travel with every turn; rules in the system prompt');

  // ۴) نامربوط ⇒ هیچ کاری روی صفحه
  await p.evaluate(() => __q.push({ reply: 'این به این‌جا ربطی ندارد؛ این‌جا برای یادگیری، سنجشِ ادعا و گره‌گشایی است.', status: 'unrelated', actions: [{ do: 'go', view: 'settings' }] }));
  await p.fill('.as-in', 'دستور پخت قورمه سبزی چیه؟'); await p.click('.as-send');
  await p.waitForFunction(() => __calls.length >= 3 && !document.querySelector('.as-typing')); await p.waitForTimeout(150);
  chk(await p.evaluate(() => APP.state.view) === 'e_home', 'unrelated: no action is executed');

  // ۵) کمبود ⇒ یک برگهٔ فوری با انتزاع و هماهنگی؛ همان کمبود بارِ دوم برگه نمی‌سازد
  const gap = { reply: 'این را سامانه هنوز ندارد؛ برگهٔ فوری ثبت کردم.', status: 'gap', actions: [],
    gap: { title: 'سنجشِ پیش‌بینی‌های عددی', abstract: 'ادعاهای کمّیِ آینده‌نگر با بازهٔ خطا', missing: 'ایستگاهِ برآوردِ بازه', where: 'epi_st + epi_rules', how: 'ایستگاهِ تازه در سالنِ ۴', relations: 'بک‌تست، قلمرو', docs: 'HANDBOOK §۲۹' } };
  await p.evaluate(g => { __q.push(g); __q.push(g); }, gap);
  await p.fill('.as-in', 'می‌خوام بازهٔ خطای پیش‌بینیم رو بسنجم'); await p.click('.as-send');
  await p.waitForFunction(() => __reps.length >= 1 && !document.querySelector('.as-typing')); await p.waitForTimeout(150);
  await p.fill('.as-in', 'دوباره همان'); await p.click('.as-send');
  await p.waitForFunction(() => __calls.length >= 5 && !document.querySelector('.as-typing')); await p.waitForTimeout(150);
  info.gap = await p.evaluate(() => ({ n: __reps.length, urgent: __reps[0].urgent, spot: __reps[0].spot, t: __reps[0].text, log: APP.ASSIST.cur().msgs.filter(m => m.role === 'sys').map(m => m.text).join(' | ') }));
  chk(info.gap.n === 1, 'one urgent sheet, never a duplicate: ' + info.gap.n);
  chk(info.gap.urgent && info.gap.spot.page === '/apps/learning-architecture' && info.gap.spot.section_id === 'assistant' && /tab=e_home/.test(info.gap.spot.reopen), 'sheet is urgent and reopens the exact place');
  chk(['ثبت‌شده توسط «💬 دستیار»', 'نیازِ انتزاعی', 'کجا افزوده شود', 'پیوند با بخش‌های دیگر', 'هماهنگی با روال‌ها', 'VIEW_META', 'WORKLOG'].every(x => info.gap.t.includes(x)), 'sheet: abstraction, where/how, relations, routine coordination, docs');
  chk(/#۴۱/.test(info.gap.log) && /پیش‌تر ثبت شده/.test(info.gap.log), 'user sees the sheet number, and the duplicate notice');

  // ۶) فایل: به فولدرِ همین سشن، و عکس به مدلِ بینا
  await p.evaluate(() => __q.push({ reply: 'عکس را دیدم.', status: 'related', actions: [] }));
  await p.setInputFiles('.as-row input[type=file]', { name: 'news.png', mimeType: 'image/png', buffer: Buffer.from([137, 80, 78, 71]) });
  chk(/news\.png/.test(await p.textContent('.as-chips')), 'attached file shows as a chip before sending');
  await p.fill('.as-in', 'این عکسِ خبره'); await p.click('.as-send');
  await p.waitForFunction(() => __ups.length >= 1 && __calls.length >= 6 && !document.querySelector('.as-typing'));
  info.file = await p.evaluate(() => ({ up: __ups[0], ids: __calls[5].opts.fileIds, sid: APP.ASSIST.cur().id, files: APP.ASSIST.cur().files.length }));
  chk(info.file.up.rid === info.file.sid && info.file.up.meta.group === 'دستیار — گفت‌وگوها' && info.file.up.meta.title === 'سنجشِ خبرِ دلار', 'file goes to this session\'s Drive folder');
  chk(JSON.stringify(info.file.ids) === '[8]' && info.file.files === 1, 'image id handed to the vision model');

  // ۷) پیوست به فرم و دکمهٔ خطرناک
  info.att = await p.evaluate(async () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.setAttribute('aria-label', 'پیوستِ سند'); let ch = 0; inp.addEventListener('change', () => ch++);
    const del = document.createElement('button'); del.textContent = 'حذفِ پرونده'; let clicked = 0; del.onclick = () => clicked++;
    document.getElementById('main').append(inp, del);
    const sc = APP.ASSIST.scan(), k = sc.fields.find(f => f.type === 'file').k, kd = sc.buttons.find(x => /حذف/.test(x.label)).k;
    const r = await APP.ASSIST.run([{ do: 'attach', k, fileIds: [8] }, { do: 'click', k: kd }, { do: 'fill', k: 'k999', value: 'x' }]);
    return { files: inp.files.length, ch, clicked, notes: r.notes.join(' | ') };
  });
  chk(info.att.files === 1 && info.att.ch === 1, 'attach puts the session file into the form\'s file input');
  chk(info.att.clicked === 0 && /خودت بزن/.test(info.att.notes), 'never clicks delete-like buttons');
  chk(/پیدا نشد/.test(info.att.notes), 'unknown key is reported, not guessed');

  // ۸) سشنِ تازه، فهرست، ادامهٔ قبلی
  await p.click('.as-head [aria-label="سشنِ تازه"]');
  chk(await p.isVisible('.as-hello'), 'new session starts clean');
  await p.click('.as-head [aria-label="فهرستِ سشن‌ها"]');
  info.list = await p.$$eval('.as-li', xs => xs.map(x => x.textContent));
  chk(info.list.length === 2 && info.list.some(t => /سنجشِ خبرِ دلار/.test(t) && /🛎/.test(t)), 'session list with AI names and sheet badge: ' + info.list);
  await p.click('.as-li:has-text("سنجشِ خبرِ دلار") button');
  chk(await p.evaluate(() => APP.ASSIST.cur().title) === 'سنجشِ خبرِ دلار' && (await p.$$('.as-msg')).length > 4, 'resumes the old session with its whole history');

  // ۹) جابه‌جایی و ماندن پس از رسمِ دوباره
  const bb = await p.locator('.as-fab').boundingBox();
  await p.mouse.move(bb.x + 10, bb.y + 10); await p.mouse.down(); await p.mouse.move(bb.x - 300, bb.y - 200, { steps: 5 }); await p.mouse.up();
  const bb2 = await p.locator('.as-fab').boundingBox();
  chk(bb2.x < bb.x - 200 && bb2.y < bb.y - 100, 'floating button is draggable');
  await p.evaluate(() => APP.go('lib')); await p.waitForTimeout(100);
  chk(await p.$$eval('.as-root', xs => xs.length) === 1 && await p.isVisible('.as-panel'), 'one widget survives navigation, still open');

  // ۱۰) ۳۹۰px
  await p.setViewportSize({ width: 390, height: 800 }); await p.waitForTimeout(150);
  const pb = await p.locator('.as-panel').boundingBox();
  chk(pb && pb.width <= 391 && pb.x >= -1, 'panel is a bottom sheet at 390px');
  chk(await p.evaluate(() => document.documentElement.scrollWidth <= 392), 'no horizontal overflow at 390px');
  console.log(JSON.stringify(info).slice(0, 700));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
