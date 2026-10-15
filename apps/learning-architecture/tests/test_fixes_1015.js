// اصلاح‌های صفِ بازبینیِ اجرا (۲۰۲۶-۱۰-۱۵) — روی نسخهٔ مستقلِ ساخته‌شده (dist/learning-architecture.html)
// هر بخش یک نقصِ کارزارِ زنده (camp/v01…v08) یا بازبینِ UI را می‌سنجد؛ شمارهٔ بخش = شمارهٔ نقص در دستورِ کار.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(300);
  const chk = (cond, msg) => { if (!cond) errors.push(msg); };
  const go = async (v, a, s) => { await p.evaluate(([v, a, s]) => APP.go(v, a, s), [v, a, s]); await p.waitForTimeout(120); };

  // ---------- ۱) a8_prob: ثبتِ دستیِ مسئلهٔ خودم وقتی هوش در دسترس نیست ----------
  await go('e_prob', null, 'inject');
  chk(await p.locator('main .pb-formmanual').count() === 1, '1: manual submit button from the form fields');
  await p.click('main .pb-formmanual'); await p.waitForTimeout(100);
  chk(await p.evaluate(() => APP.S.all('eprob').length) === 0, '1: empty form must not be stored');
  await p.fill('#pbIn_title', 'مسئلهٔ آزمایشیِ دستی'); await p.fill('#pbIn_statement', 'صورتِ کاملِ مسئله'); await p.fill('#pbIn_answer', 'پاسخِ نهایی ۴۲');
  await p.click('main .pb-formmanual'); await p.waitForTimeout(150);
  info.man = await p.evaluate(() => { const r = APP.S.all('eprob')[0]; return r && { st: r.status, by: r.by, unv: r.unverified, pu: r.p.unverified, n: r.p.stages.length, ok: r.p.stages[0].opts.filter(o => o.ok).map(o => o.t) }; });
  chk(info.man && info.man.st === 'pending' && info.man.by === 'user' && info.man.unv && info.man.pu && info.man.n === 1 && info.man.ok[0] === 'پاسخِ نهایی ۴۲', '1: minimal unverified problem in the queue ' + JSON.stringify(info.man));
  await go('e_prob', null, 'pending');
  chk(await p.locator('main .pb-pending .pb-unver').count() === 1, '1: pending card says «دستی · وارسی‌نشده»');

  // ---------- ۲) دسترس‌پذیری: فیلترهای کتابخانه، گام‌های زنجیره، گزینهٔ پیشین، نوشتنِ معوقِ سفر ----------
  await go('e_lib');
  info.lib = await p.evaluate(() => ['lbK', 'lbO', 'lbM', 'lbQ'].map(id => { const e = document.getElementById(id); return e && e.getAttribute('aria-label'); }));
  chk(info.lib.every(Boolean), '2: e_lib filters have aria-label ' + JSON.stringify(info.lib));
  info.ws = await p.evaluate(() => {
    const box = document.createElement('div'); document.body.appendChild(box);
    box.appendChild(APP.renderWS([{ k: 'up', t: 'chain', l: 'زنجیرهٔ چرا', n: 3, prefix: 'چرا' }, { k: 'c', t: 'checks', l: 'تیک‌ها', opts: ['الف', 'ب'] }, { k: 'li', t: 'list', l: 'فهرست', min: 3 }], { c: ['ب', 'گزینهٔ کهنه'] }, () => {}));
    const tas = [...box.querySelectorAll('.chain textarea')], inp = [...box.querySelectorAll('.flist input')];
    const r = { chain: tas.slice(1).map(t => t.getAttribute('aria-label')), list: inp.slice(1).map(t => t.getAttribute('aria-label')), old: [...box.querySelectorAll('.checks label')].map(l => l.textContent) };
    box.remove(); return r;
  });
  chk(info.ws.chain.length === 2 && info.ws.chain.every(x => x && /چرا/.test(x)), '2: chain steps > 1 carry a label ' + JSON.stringify(info.ws.chain));
  chk(info.ws.list.every(Boolean), '2: list rows > 1 carry a label');
  chk(info.ws.old.includes('گزینهٔ کهنه (گزینهٔ پیشین)') && info.ws.old.includes('ب'), '2: old checkbox value marked «(گزینهٔ پیشین)» ' + JSON.stringify(info.ws.old));
  // سفر: نوشتهٔ تازه (هنوز در تأخیرِ ۴۰۰ms) پیش از «کاشتِ همین مفهوم» ذخیره شود
  await p.evaluate(() => APP.goRoot('topics')); await p.waitForTimeout(150);
  await p.fill('#ntTitle', 'آزمون: نوشتنِ معوق در سفر'); await p.click('main .btn:has-text("ساخت و شروع")'); await p.waitForTimeout(200);
  const tid = await p.evaluate(() => APP.state.arg);
  await go('journey', tid, 'S5');
  const ta5 = p.locator('main .jr-now textarea').first();
  if (await ta5.count() && await p.locator('main .jr-plantone').count()) {
    await ta5.fill('نوشتهٔ تازه پیش از کاشت');
    await p.click('main .jr-plantone');
    info.flush = await p.evaluate(tid => APP.S.all('ex', e => e.topic === tid).some(e => JSON.stringify(e.data || {}).includes('نوشتهٔ تازه پیش از کاشت')), tid);
    chk(info.flush, '2: journey flushes the debounced save before placeDialog');
    await p.evaluate(() => document.querySelectorAll('.overlay').forEach(o => o.remove()));
  } else errors.push('2: journey S5 has no textarea/plant button to test');

  // ---------- ۳) برگهٔ کمبود: عنوانِ انسانی، نامِ نما، --since، بخش‌های الزامی ----------
  await go('whole');
  info.sheet = await p.evaluate(async () => {
    window.__q = []; window.__calls = [];
    APP.callAI = async (sys, user, opts) => { __calls.push({ sys, user, opts }); const r = __q.shift(); return JSON.stringify(typeof r === 'function' ? r(user) : r); };
    const s = APP.ASSIST.newSession(); s.msgs.push({ role: 'user', text: 'x', at: '2026-10-12T10:00:00Z' });
    const g = { title: 'کاربرگِ مذاکره', area: 'sys-territory', kind: 'priority', abstract: 'الف', missing: 'ب', where: 'ج', how: 'د', confidence: 0.95 };
    const t = APP.ASSIST.reportText(s, g).split('\n');
    __q.push({ agree: true, reason: 'باشد', fix: {} });
    const holes = await APP.ASSIST.triage(s, { title: 'کمبودِ نیمه‌خالی', area: 'lla-page', kind: 'build', abstract: '—', missing: '', where: 'ج', how: '', confidence: 0.9 });
    __q.push({ agree: true, reason: 'پر کردم', fix: { abstract: 'نیازِ کلی', missing: 'چه کم است', how: 'چطور' } });
    const filled = await APP.ASSIST.triage(s, { title: 'کمبودِ پرشده با نظرِ دوم', area: 'lla-page', kind: 'build', abstract: '', missing: '', where: 'ج', how: '', confidence: 0.9 });
    return { l0: t[0], l1: t[1], all: t.join('\n'), holes, filled: !!filled.gap, consultSys: __calls[0] && __calls[0].sys.includes('پر کن') };
  });
  chk(/^\[دستیار · کمبودِ سامانه\] کاربرگِ مذاکره/.test(info.sheet.l0) && !/sys-territory|priority/.test(info.sheet.l0), '3: first (title) line is human ' + info.sheet.l0);
  chk(/قلمرو: sys-territory · نوع: priority/.test(info.sheet.l1), '3: machine tag line kept separately ' + info.sheet.l1);
  chk(/«نقشهٔ کل|«[^»]+» \(`whole`\)/.test(info.sheet.all) && !/نمای whole/.test(info.sheet.all), '3: view label instead of raw id');
  chk(/precheck --area sys-territory --since 2026-10-12/.test(info.sheet.all), '3: precheck line carries --since <session start>');
  chk(info.sheet.holes.skip && /abstract/.test(info.sheet.holes.skip) && info.sheet.holes.holes.length === 3, '3: a gap with empty fields is refused ' + JSON.stringify(info.sheet.holes));
  chk(info.sheet.filled && info.sheet.consultSys, '3: the second opinion may fill the empty fields');

  // ---------- ۴) پیوست‌های سشن: پروندهٔ جاری خودکار، یک فولدر برای سشن، بی بارگذاریِ دوباره ----------
  await p.evaluate(() => {
    APP.S.put({ id: 'knot_s1', type: 'knot', name: 'قرض‌نگرفتن', fam: 'F3', principle: 'p', signals: 's', counter: 'c', example: 'e', cases: ['kc_s1'], status: 'open' });
    APP.S.put({ id: 'kc_s1', type: 'kcase', title: 'گیر در هفده شتر', kinds: ['problem'], knots: ['knot_s1'], intake: { stmts: [], statement: 'هفده شتر', answer: '۹ و ۶ و ۲', stuckAt: 'x', what: 'w', thoughts: 't', seen: 'yes' }, premise: {}, rank: {}, ev: [], pans: {}, ladder: {}, root: { extra: [], why5: [] }, acts: [], hyps: [], status: 'open', step: 'in', created: '2026-10-10T08:00:00.000Z' });
    window.__ups = []; APP.S.loaded = true;   // با میزبان، نماها تا رسیدنِ داده‌ها رسم نمی‌شوند
    APP.HOST = { upload: async (rid, f, meta) => { __ups.push({ rid, name: f.name, title: meta && meta.title }); return { id: 900 + __ups.length, name: f.name, mime: f.type, link: 'https://drive/x' }; }, files: async () => [] };
  });
  await go('kcase', 'kc_s1', 'in');
  info.att = await p.evaluate(async () => {
    const AS = APP.ASSIST, s = AS.newSession(); s.title = ''; APP.S.put(s);
    __q.length = 0;
    __q.push(u => { const k = (u.match(/^- (k\d+) \| file/m) || [])[1], id = +((u.match(/(\d+)=hw\.png/) || [])[1]); return { reply: 'پیوست می‌کنم.', status: 'related', title: 'غلطِ تکلیفِ فیزیک', actions: [{ do: 'attach', k, fileIds: [id] }] }; });
    await AS.send('عکسِ تکلیف', [new File(['img-bytes'], 'hw.png', { type: 'image/png' })]);
    await new Promise(r => setTimeout(r, 400));
    const first = __ups.map(x => x.rid + ':' + x.name + ':' + x.title);
    __q.push({ reply: 'خواندم.', status: 'related', actions: [] });
    await AS.send('این هم جزوه', [new File(['pdf-bytes-1234'], 'notes.pdf', { type: 'application/pdf' })]);
    const second = __ups.slice(first.length).map(x => x.rid + ':' + x.name + ':' + x.title);
    __q.push({ reply: 'همان است.', status: 'related', actions: [] });
    const n0 = __ups.length;
    await AS.send('دوباره همان', [new File(['pdf-bytes-1234'], 'notes.pdf', { type: 'application/pdf' })]);
    const cur = AS.cur();
    return { first, second, again: __ups.length - n0, rec: cur.rec && cur.rec.rid, sys: cur.msgs.filter(m => m.role === 'sys').map(m => m.text).join(' | '), title: cur.title, files: cur.files.length };
  });
  const sessTitles = new Set(info.att.first.concat(info.att.second).filter(x => /^achat/.test(x)).map(x => x.split(':')[2]));
  chk(info.att.first.some(x => /^kc_s1:hw\.png/.test(x)) && info.att.rec === 'kc_s1', '4: the first file went to the record (attach) and it became the session\'s record ' + JSON.stringify(info.att));
  chk(info.att.second.some(x => /^kc_s1:notes\.pdf/.test(x)) && info.att.second.some(x => /^achat_.*:notes\.pdf/.test(x)), '4: a later file goes to the session AND automatically to the session\'s record ' + JSON.stringify(info.att.second));
  chk(sessTitles.size === 1, '4: one stable Drive folder title per session, even after the AI renamed it ' + [...sessTitles]);
  chk(info.att.again === 0 && /♻/.test(info.att.sys) && info.att.files === 2, '4: the same file is not uploaded twice ' + info.att.again);
  await p.evaluate(() => { APP.HOST = undefined; });

  // ---------- ۵) سشن‌ها: «مانده» نه «انجام‌شده»؛ رکوردِ سشنِ دیگر نامزدِ پیوند نیست ----------
  await p.evaluate(() => { window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o); APP.S.loaded = true; });
  info.sess = await p.evaluate(async () => {
    const AS = APP.ASSIST; __q.length = 0; __calls.length = 0;
    const s = AS.newSession(); s.msgs.push({ role: 'user', text: 'x', at: new Date().toISOString() }); APP.S.put(s);
    AS._turnSession = s; AS.DO.tour_plan({ goal: 'g', facets: [{ key: 'f1', kind: 'knot', title: 'گیرِ پرتاب' }, { key: 'f2', kind: 'learn', title: 'احتمالِ شرطی' }] });
    APP.S.put({ id: 'kn_a', type: 'knot', name: 'h از هر جا' });
    APP.S.put({ id: 'kc_a', type: 'kcase', title: 'پرتاب', root: { confirmed: true }, knots: ['kn_a'], premise: {}, created: new Date().toISOString() });
    APP.S.put({ id: 'ki_a', type: 'kitem', knot: 'kn_a', due: APP.today(), prompt: 'نمونه' });
    const n0 = s.msgs.length; AS.tourAfterTurn(s);
    const line = s.msgs.slice(n0).map(m => m.text).join(' | ');
    // سشنِ دوم موضوعی می‌سازد؛ برگشت به سشنِ اول ⇒ آن موضوع نامزدِ tour_link نیست
    const s2 = AS.newSession(); s2.msgs.push({ role: 'user', text: 'واژگان', at: new Date().toISOString() }); APP.S.put(s2);
    APP.S.put({ id: 'tp_other', type: 'topic', title: 'واژگانِ انگلیسی', created: new Date().toISOString() });
    localStorage.setItem('lla.assist.cur', JSON.stringify(s.id));
    APP.S.put({ id: 'tp_mine', type: 'topic', title: 'حرکتِ پرتابی', created: new Date().toISOString() });
    const tt = AS.tourText(APP.S.get(s.id));
    return { line, other: /tp_other/.test(tt), mine: /tp_mine/.test(tt), made2: (APP.S.get(s2.id).made || []).includes('tp_other'), sid: s.id };
  });
  chk(/✓ پایهٔ وجهِ «گیرِ پرتاب» برپا شد/.test(info.sess.line) && /هنوز مانده تا تسلط: ○ «/.test(info.sess.line), '5: open follow-ups are listed as «هنوز مانده ○», not as done ' + info.sess.line);
  chk(!info.sess.other && info.sess.mine && info.sess.made2, '5: a record made in another session is not offered for tour_link ' + JSON.stringify(info.sess));

  // ---------- ۶) نقشهٔ پیش‌نیاز: همهٔ پرسش‌ها جلوی مدل؛ نامِ مفهوم پاسخش را لو نمی‌دهد ----------
  info.pre = await p.evaluate(() => {
    const AS = APP.ASSIST, items = Array.from({ length: 8 }, (_, i) => ({ concept: 'مفهوم ' + (i + 1), sci: 'فیزیک', q: 'پرسشِ تشخیصیِ شمارهٔ ' + (i + 1) + '؟', ref: 'r', self: i < 2 ? 'بلدم' : '', ans: i < 2 ? 'پاسخ' : '' }));
    APP.S.put({ id: 'pq_t', type: 'prereq', title: 'پرتاب از بام', items, kcase: '' });
    APP.go('prereq', 'pq_t');
    const hook = (AS.promptHooks || []).map(f => { try { return f(AS.cur(), '') || ''; } catch (e) { return ''; } }).join('\n');
    return { all: items.every(x => hook.includes(x.q)), left: /۶ هنوز بی پاسخ/.test(hook), leak: APP.prereqLeaks('معادلهٔ مکان: y = h + v0t − 5t²', 'y = h + v0t − 5t²'), clean: APP.prereqCleanName({ concept: 'معادلهٔ مکان: y = h + v0t − 5t²', ref: 'y = h + v0t − 5t²', sub: 'سینماتیک' }) };
  });
  chk(info.pre.all && info.pre.left, '6: every diagnostic question (8 of 8) is in the prompt, with how many are still open');
  chk(info.pre.leak && !/=/.test(info.pre.clean) && /معادلهٔ مکان/.test(info.pre.clean), '6: a concept name that contains its own answer is cut to the name ' + info.pre.clean);

  // ---------- ۷) یک منبعِ پیشرفت: کشو، فهرستِ سشن، «امروز» ----------
  info.prog = await p.evaluate(sid => {
    const AS = APP.ASSIST; localStorage.setItem('lla.assist.cur', JSON.stringify(sid)); const s = APP.S.get(sid);
    s.steps = [{ t: 'a', s: 'done' }, { t: 'b', s: 'todo' }, { t: 'c', s: 'todo' }, { t: 'd', s: 'todo' }]; s.msgs.forEach(m => { m.at = new Date(Date.now() - 2 * 864e5).toISOString(); }); APP.S.put(s);
    AS.toggle(true); AS.paint();
    const pg = AS.progress(s), sum = (document.querySelector('.as-tour > summary') || {}).textContent || '';
    const today = APP.dueList().filter(x => /ادامهٔ تور/.test(x.txt)).map(x => x.txt).join('|');
    const prompt = AS.tourText(s);
    return { pg, sum, today, prompt: /پیشرفتِ رسمی[^\n]*تور 1 از 2/.test(prompt) };
  }, info.sess.sid);
  chk(info.prog.pg && info.prog.pg.done === 1 && info.prog.pg.all === 2, '7: AS.progress counts facets, not the model\'s steps ' + JSON.stringify(info.prog.pg));
  chk(/۱ از ۲/.test(info.prog.sum) && /تور ۱ از ۲/.test(info.prog.today) && info.prog.prompt, '7: drawer, Today and the prompt say the same number ' + JSON.stringify(info.prog));
  await p.evaluate(() => { APP.ASSIST.toggle(true); });
  await p.click('.as-panel .as-ib[aria-label="فهرستِ سشن‌ها"]').catch(() => {}); await p.waitForTimeout(100);
  info.list = await p.evaluate(() => [...document.querySelectorAll('.as-li')].map(x => x.textContent).join(' | '));
  chk(/تور ۱\/۲/.test(info.list) && !/۱\/۴/.test(info.list), '7: the session list shows the tour count ' + info.list);
  await p.evaluate(() => { APP.ASSIST.toggle(false); });

  console.log(JSON.stringify(info, null, 1).slice(0, 3000));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
