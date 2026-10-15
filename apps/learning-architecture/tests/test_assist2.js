// «💬 دستیار» — بازبینیِ دوم (مالک ۲۰۲۶-۱۰-۱۴: «با وجدان و ریزبینی … در اجرا باگی نداشته باشد»). هر بند یک خطای واقعیِ
// پیداشده در ممیزی است که حالا آزموده می‌شود: کلیدهای کهنه پس از رفتن، فیلدِ همنام، بخشِ بسته، گزینهٔ select با متن، دکمه‌های
// تصمیمِ مالک، پاسخِ غیرِ JSON، تاریخچهٔ کامل، فرمی که با کلیک بزرگ می‌شود، خواندنِ دوبارهٔ فایل، گزارشِ خواندنِ کامل، موبایل.
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
    APP.S.loaded = true; window.__calls = []; window.__q = [];
    APP.HOST = { upload: async (rid, f) => ({ id: 77, name: f.name, mime: f.type, link: '' }), report: async () => ({ id: 'r', number: 1 }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); const r = __q.shift(); const t = typeof r === 'function' ? r(user) : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: (r && r.__files) || [] } : text;
    };
  });
  // a test form inside #main: two fields with the same label, a closed section, a select, a growing table, owner buttons
  const mk = () => p.evaluate(() => {
    const m = document.getElementById('main'); m.innerHTML = '';
    m.insertAdjacentHTML('beforeend', `<section data-report-section-label="فرمِ آزمون">
      <label>پاسخ <input id="a1"></label><label>پاسخ <input id="a2"></label>
      <details id="dd"><summary>بیشتر</summary><label>یادداشتِ پنهان <textarea id="hid"></textarea></label></details>
      <label>نوع <select id="sel"><option value="">—</option><option value="news">خبر/گزارش دیگران</option><option value="self">باور خودم</option></select></label>
      <button id="add" type="button">+ ردیف</button><div id="rows"></div>
      <button id="acc" type="button">بپذیر</button><button id="rt" type="button">ریشه را تأیید کن</button><button id="sv" type="button">ثبتِ پرونده</button></section>`);
    window.__acc = 0; window.__sv = 0; window.__inputs = [];
    document.getElementById('acc').onclick = () => __acc++; document.getElementById('rt').onclick = () => __acc++;
    document.getElementById('sv').onclick = () => __sv++;
    document.getElementById('add').onclick = () => document.getElementById('rows').insertAdjacentHTML('beforeend', '<label>ردیفِ تازه <input class="row-in"></label>');
    ['a1', 'a2', 'hid', 'sel'].forEach(id => document.getElementById(id).addEventListener('input', () => __inputs.push(id)));
  });
  await mk();
  info.scan = await p.evaluate(() => { const sc = APP.ASSIST.scan(); return sc.fields.map(f => f.label + (f.closed ? '(بسته)' : '')).join('|'); });
  chk(/یادداشتِ پنهان\(بسته\)/.test(info.scan), 'a field inside a closed <details> is scanned and marked: ' + info.scan);

  // 1) same label twice: a re-render must not fill the wrong «پاسخ»
  info.same = await p.evaluate(async () => {
    const sc = APP.ASSIST.scan(), ks = sc.fields.filter(f => f.label === 'پاسخ').map(f => f.k);
    const html = document.getElementById('main').innerHTML; document.getElementById('main').innerHTML = html.replace(/data-ai-k="k\d+"/g, ''); // re-render: keys gone
    document.getElementById('acc').onclick = () => __acc++;
    await APP.ASSIST.run([{ do: 'fill', k: ks[1], value: 'دوم' }]);
    return [document.getElementById('a1').value, document.getElementById('a2').value];
  });
  chk(info.same[0] === '' && info.same[1] === 'دوم', 'after a re-render the 2nd same-label field is the one filled: ' + info.same);

  // 2) closed section opens; select by visible text; owner-decision buttons are never pressed; save is
  await mk();
  info.act = await p.evaluate(async () => {
    const sc = APP.ASSIST.scan(), k = l => (sc.fields.find(f => f.label === l) || sc.buttons.find(x => x.label === l)).k;
    const r = await APP.ASSIST.run([{ do: 'fill', k: k('یادداشتِ پنهان'), value: 'x' }, { do: 'fill', k: k('نوع'), value: 'خبر/گزارش دیگران' },
      { do: 'click', k: k('بپذیر') }, { do: 'click', k: k('ریشه را تأیید کن') }, { do: 'click', k: k('ثبتِ پرونده') }, { do: 'fill', k: k('نوع'), value: 'ناموجود' }]);
    return { open: document.getElementById('dd').open, hid: document.getElementById('hid').value, sel: document.getElementById('sel').value, acc: __acc, sv: __sv,
      hl: document.getElementById('acc').classList.contains('as-hl'), notes: r.notes.join(' | ') };
  });
  chk(info.act.open && info.act.hid === 'x', 'closed section opened and filled');
  chk(info.act.sel === 'news', 'select filled by its visible text');
  chk(info.act.acc === 0 && info.act.hl && /تصمیمِ خودت/.test(info.act.notes), 'owner-decision buttons (بپذیر / ریشه را تأیید کن) are highlighted, never pressed');
  chk(info.act.sv === 1, 'a normal save button is pressed');
  chk(/گزینهٔ «ناموجود»/.test(info.act.notes), 'an option that does not exist is reported, not forced');

  // 3) «go» + fills for the OLD page in one answer ⇒ the stale fills are skipped, the auto-turn fills the new page
  await p.click('.as-fab');
  await p.evaluate(() => {
    __q.push({ reply: 'می‌برمت.', status: 'related', actions: [{ do: 'go', view: 'e_home' }, { do: 'fill', k: 'k1', value: 'نباید' }] });
    __q.push(u => { const k = (u.match(/^- (k\d+) \| textarea/m) || [])[1]; return { reply: 'پر شد.', status: 'related', actions: [{ do: 'fill', k, value: 'متنِ ادعا' }] }; });
  });
  await p.fill('.as-in', 'ادعایی دارم'); await p.click('.as-send');
  await p.waitForFunction(() => __calls.length >= 2 && !APP.ASSIST.busy(), null, { timeout: 8000 }); await p.waitForTimeout(200);
  info.go = await p.evaluate(() => ({ view: APP.state.view, vals: [...document.querySelectorAll('#main input,#main textarea')].map(x => x.value).filter(Boolean) }));
  chk(info.go.view === 'e_home' && info.go.vals.join() === 'متنِ ادعا', 'stale keys after go are skipped; only the new page is filled: ' + info.go.vals);

  // 4) non-JSON twice ⇒ shown as a plain reply, not an error
  await p.evaluate(() => { __q.push('سلام! این متن JSON نیست.'); __q.push('باز هم JSON نیست.'); });
  await p.fill('.as-in', 'سلام'); await p.click('.as-send');
  await p.waitForFunction(() => __calls.length >= 4 && !APP.ASSIST.busy()); await p.waitForTimeout(100);
  info.raw = await p.evaluate(() => APP.ASSIST.cur().msgs.slice(-1)[0]);
  chk(info.raw.role === 'ai' && /JSON نیست/.test(info.raw.text), 'non-JSON answer becomes a plain reply: ' + JSON.stringify(info.raw));

  // 5) whole history (not only 12 short lines): the first message is still in the prompt after many turns
  await p.evaluate(() => { const s = APP.ASSIST.cur(); for (let i = 0; i < 30; i++) s.msgs.push({ role: i % 2 ? 'ai' : 'user', text: 'پیامِ میانی ' + i, at: '' }); APP.S.put(s); __q.push({ reply: 'باشد', status: 'related', actions: [] }); });
  await p.fill('.as-in', 'ادامه'); await p.click('.as-send');
  await p.waitForFunction(() => __calls.length >= 5 && !APP.ASSIST.busy());
  info.hist = await p.evaluate(() => { const u = __calls[4].user; return { first: u.includes('ادعایی دارم'), mid: u.includes('پیامِ میانی 0'), dupNew: (u.match(/کاربر: ادامه/g) || []).length }; });
  chk(info.hist.first && info.hist.mid, 'the whole conversation is in the prompt');
  chk(info.hist.dupNew === 0, 'the new message is not duplicated into the history');

  // 6) a click that grows the form ⇒ a fresh scan and an automatic next turn
  await p.evaluate(() => { APP.go('e_home'); });
  await mk();
  await p.evaluate(() => {
    __q.push(u => ({ reply: 'یک ردیف افزودم.', status: 'related', actions: [{ do: 'click', k: (u.match(/(k\d+)=«\+ ردیف»/) || [])[1] }] }));
    __q.push(u => ({ reply: 'ردیف پر شد.', status: 'related', actions: [{ do: 'fill', k: (u.match(/^- (k\d+) \| text \| «ردیفِ تازه»/m) || [])[1], value: 'ردیف ۱' }] }));
  });
  await p.fill('.as-in', 'یک ردیف بیفزا'); await p.click('.as-send');
  await p.waitForFunction(() => __calls.length >= 7 && !APP.ASSIST.busy()); await p.waitForTimeout(150);
  chk(await p.evaluate(() => (document.querySelector('.row-in') || {}).value) === 'ردیف ۱', 'after a click that adds fields, the next turn fills them');

  // 7) files: every type is sent, the reading manifest is shown, and «reread» brings a past file back
  await p.evaluate(() => {
    __q.push(Object.assign({ reply: 'خواندم.', status: 'related', actions: [] }, { __files: [{ id: 77, name: 'book.docx', status: 'ok', chars: 120345, pages: 0, complete: true }] }));
    __q.push({ reply: 'باید دوباره ببینم.', status: 'related', actions: [], reread: [77] });
    __q.push({ reply: 'دیدم.', status: 'related', actions: [] });
  });
  await p.setInputFiles('.as-row input[type=file]', { name: 'book.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: Buffer.from('PK..') });
  await p.fill('.as-in', 'این کتاب را بخوان'); await p.click('.as-send');
  await p.waitForFunction(() => __calls.length >= 8 && !APP.ASSIST.busy());
  info.f = await p.evaluate(() => ({ ids: __calls[7].opts.fileIds, meta: __calls[7].opts.withMeta, note: APP.ASSIST.cur().msgs.filter(m => m.role === 'sys').map(m => m.text).join(' | ') }));
  chk(JSON.stringify(info.f.ids) === '[77]' && info.f.meta, 'a Word file goes to the server reader (not only images/PDF)');
  chk(/کامل خوانده شد/.test(info.f.note) && /۱۲۰٬?۳۴۵|120345|۱۲۰۳۴۵/.test(info.f.note), 'the reading manifest is shown in the chat: ' + info.f.note);
  await p.fill('.as-in', 'فصلِ دوم چه می‌گفت؟'); await p.click('.as-send');
  await p.waitForFunction(() => __calls.length >= 10 && !APP.ASSIST.busy());
  chk(await p.evaluate(() => JSON.stringify(__calls[9].opts.fileIds)) === '[77]', '«reread» sends the past file again for the next turn');

  // 8) empty sessions do not pile up
  await p.click('.as-head [aria-label="سشنِ تازه"]'); await p.click('.as-head [aria-label="سشنِ تازه"]'); await p.click('.as-head [aria-label="سشنِ تازه"]');
  chk(await p.evaluate(() => APP.S.all('achat').filter(s => !s.msgs.length).length) === 1, 'pressing ＋ three times makes one empty session, not three');

  // 9) mobile: after marking fields the panel steps aside so they are visible
  await p.setViewportSize({ width: 390, height: 800 });
  await p.evaluate(() => { APP.go('e_home'); });
  await p.evaluate(() => { if (document.querySelector('.as-panel').hidden) APP.ASSIST.toggle(true); __q.push(u => ({ reply: 'زرد شد.', status: 'related', actions: [{ do: 'highlight', k: (u.match(/^- (k\d+) \| textarea/m) || [])[1], why: 'بنویس' }] })); });
  await p.fill('.as-in', 'کمک'); await p.click('.as-send');
  await p.waitForFunction(() => __calls.length >= 11 && !APP.ASSIST.busy()); await p.waitForTimeout(150);
  chk(await p.evaluate(() => document.querySelector('.as-panel').hidden), 'on a phone the panel closes so the highlighted field can be seen');
  chk(await p.evaluate(() => document.documentElement.scrollWidth <= 392), 'no horizontal overflow at 390px');
  // 10) the «general practitioner»: awareness of owners/roadmap/open sheets, and a second opinion before any referral
  await p.setViewportSize({ width: 1280, height: 900 });
  info.gp = await p.evaluate(async () => {
    const m = APP.ASSIST.manifest();
    const out = { owners: /area=epi-territory/.test(m) && /بک‌تستِ پیوستهٔ کارخانهٔ معرفت‌شناسی/.test(m) && /area=epi-rules/.test(m), terr: /a_truth=صدق:\d/.test(m) };
    APP.HOST.sheets = async () => [{ number: 12, title: 'حوزهٔ پیش‌بینی در قلمرو نیست', status: 'open', urgent: true }];
    APP.HOST.report = async (o) => { (window.__reps2 = window.__reps2 || []).push(o); return { id: 'x', number: 50 }; };
    const s = APP.ASSIST.newSession(); s.msgs.push({ role: 'user', text: 'x', at: '' }); s.pinned = 'سنجشِ پیش‌بینیِ عددی'; APP.S.put(s);
    const g = (t, c) => ({ title: t, area: 'epi-territory', kind: 'build', confidence: c, abstract: 'a', missing: 'b', where: 'c', how: 'd' });   // برگهٔ نیمه‌خالی ثبت نمی‌شود (۲۰۲۶-۱۰-۱۵)
    const run = async (gap, consult) => { __q.length = 0; if (consult !== undefined) __q.push(consult); const n0 = (window.__reps2 || []).length;
      const r = await APP.ASSIST.triage(s, gap); if (r.gap) await APP.ASSIST.fileGap(s, r.gap); return { skip: r.skip || '', filed: (window.__reps2 || []).length - n0, text: ((window.__reps2 || []).slice(-1)[0] || {}).text || '' }; };
    out.low = await run(g('الف', 0.6));
    out.disagree = await run(g('ب', 0.9), { agree: false, reason: 'این در «🎯 میزِ کار» هست' });
    out.dup = await run(g('ج', 0.9), { agree: true, dup_of: 12, reason: '' });
    APP.callAI = async () => { throw new Error('no model'); };
    out.down_low = await run(g('د', 0.8));
    out.down_high = await run(g('ه', 0.95));
    await APP.ASSIST.openSheets(); out.sheetsInPrompt = APP.ASSIST.prompt(s, 'q', APP.ASSIST.scan(), '').includes('#12');
    return out;
  });
  chk(info.gp.owners && info.gp.terr, 'the assistant knows every area\'s owner routine and each territory area\'s stage');
  chk(info.gp.low.filed === 0 && /اطمینان/.test(info.gp.low.skip), 'low confidence ⇒ no sheet, a clarifying question instead');
  chk(info.gp.disagree.filed === 0 && /میزِ کار/.test(info.gp.disagree.skip), 'the consultant can veto a wrong referral');
  chk(info.gp.dup.filed === 0 && /#۱۲/.test(info.gp.dup.skip), 'an already-open sheet is not duplicated');
  chk(info.gp.down_low.filed === 0 && info.gp.down_high.filed === 1 && /در دسترس نبود/.test(info.gp.down_high.text), 'consultant down ⇒ only a very sure gap is filed, flagged for stricter review');
  chk(info.gp.sheetsInPrompt, 'open sheets of the page travel with every turn');
  // 11) prompt budget: the new message and the full file text always fit; history takes what is left; a cut is SAID, never silent
  info.budget = await p.evaluate(() => {
    const s = APP.ASSIST.newSession(); s.memory = 'م'.repeat(6000);
    for (let i = 0; i < 80; i++) s.msgs.push({ role: i % 2 ? 'ai' : 'user', text: 'پیامِ طولانی '.repeat(300), at: '' });
    APP.ASSIST._sheets = Array.from({ length: 60 }, (_, i) => ({ number: i, title: 'برگه '.repeat(30), status: 'open' }));
    const big = APP.ASSIST.prompt(s, 'پیامِ تازه XYZ', APP.ASSIST.scan(), 'متنِ فایل '.repeat(4000));
    const small = APP.ASSIST.prompt(s, 'Q2', APP.ASSIST.scan(), 'متنِ کوچکِ فایل ABC');
    return { big: big.length, bigNew: big.includes('XYZ'), said: big.includes('جا نشد'), small: small.length, smallNew: small.includes('Q2') && small.includes('ABC'), hist: /پیامِ طولانی/.test(small) };
  });
  chk(info.budget.big <= 58000 && info.budget.bigNew && info.budget.said, 'over budget: new message kept, the cut file text is announced');
  chk(info.budget.smallNew && info.budget.hist, 'normal: new message, file text and history all present');
  console.log(JSON.stringify(info).slice(0, 900));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
