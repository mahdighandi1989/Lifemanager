// اصلاح‌های صفِ بازبینیِ اجرا (۲۰۲۶-۱۰-۱۵) — بخشِ دوم (نقص‌های ۸ تا ۱۷) — روی dist/learning-architecture.html
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
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__mails = []; window.__rem = []; window.__unrem = [];
    APP.callAI = async (sys, user, opts) => { __calls.push({ sys, user, opts }); const r = __q.shift(); const t = typeof r === 'function' ? r(user) : r; if (t === undefined) throw new Error('no queued answer'); const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
  });

  // ---------- ۹) ادعای کارِ بسته‌شده (نیم‌فاصله)، دو کلیک در یک نوبت، عوض‌شدنِ حالت ----------
  info.claim = await p.evaluate(async () => {
    const AS = APP.ASSIST, m = document.getElementById('main');
    m.innerHTML = '<div data-own="1"><label>نامِ گره به قلمِ خودت <textarea id="own1"></textarea></label></div>';
    const s = AS.newSession(); s.msgs.push({ role: 'user', text: 'x', at: '' }); APP.S.put(s); __calls.length = 0; __q.length = 0;
    __q.push(u => { const k = (u.match(/^- (k\d+) \| textarea/m) || [])[1]; return R({ reply: 'نام را با همان واژه‌هایت می‌نویسم.', actions: [{ do: 'fill', k, value: 'h از هر جا' }] }); });
    __q.push(R({ reply: 'آن را خودت بنویس؛ زردش کردم.' }));
    await AS.send('بنویسش');
    return { n: __calls.length, second: (__calls[1] || {}).user || '', own: document.getElementById('own1').value };
  });
  chk(info.claim.n === 2 && /انجام نشد/.test(info.claim.second) && info.claim.own === '', '9: a reply «…می‌نویسم» (ZWNJ) about an owner-only field triggers the correction turn ' + JSON.stringify({ n: info.claim.n, own: info.claim.own }));
  info.swap = await p.evaluate(async () => {
    const AS = APP.ASSIST, m = document.getElementById('main');
    m.innerHTML = '<button id="mode" type="button">مسیرِ سریع</button><label>شرحِ کامل <textarea id="full"></textarea></label>';
    document.getElementById('mode').onclick = () => { m.innerHTML = '<label>یک جملهٔ کوتاه <textarea id="quick"></textarea></label>'; };
    __calls.length = 0; __q.length = 0;
    __q.push(u => { const bk = (u.match(/(k\d+)=«مسیرِ سریع»/) || [])[1], tk = (u.match(/^- (k\d+) \| textarea \| «شرحِ کامل»/m) || [])[1]; return R({ reply: 'مسیرِ سریع را می‌زنم و پر می‌کنم.', actions: [{ do: 'click', k: bk }, { do: 'fill', k: tk, value: 'متنِ بلند' }] }); });
    __q.push(R({ reply: 'حالا فرمِ کوتاه.' }));
    await AS.send('سریع');
    const s = AS.cur();
    return { n: __calls.length, second: (__calls[1] || {}).user || '', quick: (document.getElementById('quick') || {}).value, sys: s.msgs.filter(x => x.role === 'sys').map(x => x.text).join(' | ') };
  });
  chk(info.swap.quick === '' && info.swap.n === 2 && /اجرا نشد چون کلیدهایش مالِ صفحهٔ قبل بود/.test(info.swap.second), '9: a mode-switch click makes the next fill stale: skipped, re-scanned and reported ' + JSON.stringify({ n: info.swap.n, quick: info.swap.quick }));

  // ---------- ۱۲) صفحهٔ بلند: همهٔ فیلدها و دکمه‌ها در پرامپت می‌مانند؛ اول متنِ ساده می‌افتد ----------
  info.long = await p.evaluate(() => {
    const AS = APP.ASSIST, m = document.getElementById('main'), keep = m.innerHTML;
    m.innerHTML = '<p>' + 'متنِ توضیحیِ بسیار بلندِ صفحه '.repeat(2500) + '</p>' + Array.from({ length: 140 }, (_, i) => '<label>فیلدِ ' + i + ' <textarea>' + 'پاسخِ بلندِ کاربر '.repeat(60) + '</textarea></label>').join('') + '<button type="button">موضوع بساز</button>';
    const u = AS.prompt(AS.newSession(), 'پیامِ تازه', AS.scan(), ''); m.innerHTML = keep;
    return { len: u.length, lastField: u.includes('«فیلدِ 139»'), btn: u.includes('«موضوع بساز»'), cut: /بقیهٔ فهرستِ این صفحه/.test(u), textDropped: /متنِ سادهٔ صفحه برای جا شدنِ همهٔ فیلدها/.test(u) || /متنِ صفحه \(فشرده/.test(u) };
  });
  chk(info.long.len <= 58000 && info.long.lastField && info.long.btn && !info.long.cut && info.long.textDropped, '12: on a long page every field and button stays in the prompt; plain page text is dropped first ' + JSON.stringify(info.long));

  // ---------- ۱۰) پرسشِ بدهکار پیش از فرم؛ «بیرون از صفحه» یک بار؛ نقل‌قولِ تکراری؛ ایمیلِ ایمنی ----------
  info.owed = await p.evaluate(async () => {
    const AS = APP.ASSIST; APP.go('home');
    const s = AS.newSession(); s.msgs.push({ role: 'user', text: 'x', at: '' }); APP.S.put(s); AS._turnSession = s;
    AS.DO.tour_plan({ goal: 'g', facets: [{ key: 'f1', kind: 'knot', title: 'ترس از امتحان' }] });
    AS.DO.tour_diag({ layers: [{ id: 'safety', st: 'ask', why: '' }, { id: 'F9', st: 'ask', why: '' }] }); APP.S.put(s);
    __calls.length = 0; __q.length = 0;
    __q.push(R({ reply: 'می‌برمت به گره‌گشا.', outside: 'درمانِ بی‌خوابی با پزشک', actions: [{ do: 'go', view: 'kcases' }] }));
    __q.push(R({ reply: 'این روزها حالت چطور است؟', outside: 'درمانِ بی‌خوابی با پزشک' }));
    await AS.send('امتحان دارم و سه هفته است حوصلهٔ هیچ چیز را ندارم');
    const cur = AS.cur();
    return { view: APP.state.view, n: __calls.length, second: (__calls[1] || {}).user || '', outside: (cur.outside || []).length, sys: cur.msgs.filter(x => x.role === 'sys').map(x => x.text).join(' | '),
      dedup: AS.sieveDedupWhy('«دیگه حوصله ندارم» ؛ «دیگه حوصله ندارم» و خواب ؛ «دیگه حوصله ندارم»'), sid: s.id };
  });
  chk(info.owed.view !== 'kcases' && /⏸/.test(info.owed.sys) && info.owed.n === 2 && /پرسش‌های بدهکار پیش از فرم/.test(info.owed.second), '10: owed safety/self-belief questions are asked before navigating to a form ' + JSON.stringify({ view: info.owed.view, n: info.owed.n }));
  chk(info.owed.outside === 1, '10: the same «بیرون از صفحه» part is recorded once ' + info.owed.outside);
  chk((info.owed.dedup.match(/«دیگه حوصله ندارم»/g) || []).length === 1, '10: a quote appears once in the layer evidence ' + info.owed.dedup);
  info.safeMail = await p.evaluate(async (sid) => {
    const AS = APP.ASSIST, s = APP.S.get(sid); APP.REPORT.URGENT_MS = 0; APP.REPORT.setEnabled(true);
    APP.HOST = { mail: async (r) => { __mails.push(r); return { status: 'sent' }; }, sheets: async () => [] };
    s.tour.mailq = []; s.tour.mails = [{ status: 'sent', at: new Date().toISOString() }]; s.tour.mailAt = new Date().toISOString();
    const before = JSON.parse(JSON.stringify({ sf: 'ask', st: s.tour.facets.map(f => f.key + ':' + f.status + ':0:0').join(','), done: false, m: false }));
    s.tour.diag.safety = { st: 'out', why: 'به پزشک ارجاع شد', at: new Date().toISOString() };
    APP.REPORT.note(s, before); await new Promise(r => setTimeout(r, 300));
    const out = { n: __mails.length, safety: __mails.some(m => /ایمنی و حال/.test(m.html)) };
    APP.HOST = undefined; return out;
  }, info.owed.sid);
  chk(info.safeMail.n === 1 && info.safeMail.safety, '10: a change of the safety status (doctor referral) sends a fresh e-mail despite the 3-hour pace ' + JSON.stringify(info.safeMail));

  // ---------- ۱۱) وجه‌ها به حوزه‌های موجودِ قلمرو وصل می‌شوند ----------
  info.area = await p.evaluate(() => {
    const AS = APP.ASSIST, s = AS.newSession(); s.msgs.push({ role: 'user', text: 'x', at: '' }); APP.S.put(s); AS._turnSession = s;
    AS.DO.tour_plan({ goal: 'g', facets: [{ key: 'f1', kind: 'learn', title: 'بازیابی و یادآوری برای امتحان', why: 'مرورِ فاصله‌دار و آزمونِ خود' }] });
    const m = AS.tourMatchAreas(s.tour.facets[0]), tt = AS.tourText(s);
    const id = m[0] && m[0].a.id, r = id ? AS.DO.tour_link({ facet: 'f1', id }) : 'none';
    return { ids: m.map(x => x.a.id), inText: /حوزه‌های موجودِ قلمروِ سامانه‌ها که با وجه‌ها هم‌خوان‌اند/.test(tt), r, linked: (s.tour.facets[0].areas || []).includes(id), after: /حوزه‌های وصل‌شده/.test(AS.tourText(s)), rule: /حوزهٔ موجودِ هم‌خوانِ قلمرو/.test(AS.SYS) };
  });
  chk(info.area.ids.length && info.area.ids.every(x => !/^a_/.test(x)) && info.area.inText && info.area.r === '' && info.area.linked && info.area.after && info.area.rule, '11: matching system-territory areas are shown and tour_link links a facet to one ' + JSON.stringify(info.area));

  // ---------- ۱۳) رویدادهای تور: نمودار و مسیرِ واقعی در کشو و ایمیل ----------
  info.ev = await p.evaluate(async () => {
    const AS = APP.ASSIST, s = AS.newSession(); s.msgs.push({ role: 'user', text: 'x', at: '' }); APP.S.put(s); AS._turnSession = s; localStorage.setItem('lla.assist.cur', JSON.stringify(s.id));
    AS.DO.tour_plan({ goal: 'g', facets: [{ key: 'f1', kind: 'knot', title: 'گیرِ ریاضی' }, { key: 'f2', kind: 'learn', title: 'تمرینِ گیتار' }, { key: 'f3', kind: 'prereq', title: 'احتمالِ شرطی' }] });
    AS.DO.tour_focus({ facet: 'f3' }); AS.DO.tour_focus({ facet: 'f1' });
    APP.S.put({ id: 'kc_e', type: 'kcase', title: 'ریاضی', root: {}, knots: [], premise: {}, created: new Date().toISOString() });
    AS.tourAfterTurn(s);
    const path = AS.tourPathText(s), ev = (s.tour.events || []).map(e => e.k + ':' + (e.f || '')).join(',');
    AS.toggle(true); AS.paint();
    const drawer = { chart: !!document.querySelector('.as-tour .as-tchart svg'), path: (document.querySelector('.as-tour .as-tpath') || {}).textContent || '' };
    const rep = await APP.REPORT.build(s, []);
    AS.toggle(false);
    return { path, ev, drawer, mail: /پیشرفت در زمان و مسیرِ واقعی/.test(rep.html) && /ترتیبِ واقعیِ وجه‌ها/.test(rep.html), noKeys: !/\bf[123]\b/.test(rep.html.replace(/<[^>]+>/g, '')), text: /مسیرِ واقعی/.test(rep.text) };
  });
  chk(/«گیرِ ریاضی».*«احتمالِ شرطی».*«گیرِ ریاضی»/.test(info.ev.path) && /start:f1/.test(info.ev.ev) && /detour:f3/.test(info.ev.ev) && /ms:/.test(info.ev.ev), '13: events record start/detour and the real path f1 → f3 → f1 ' + JSON.stringify(info.ev));
  chk(info.ev.drawer.chart && /احتمالِ شرطی/.test(info.ev.drawer.path), '13: the drawer draws the progress chart and the real path');
  chk(info.ev.mail && info.ev.noKeys && info.ev.text, '13: the tour e-mail carries the chart and the path, code-free');

  // ---------- ۱۴) یادآورها: یک یادآور در روز؛ ایمیل حداکثر یکی در ۳ ساعت ----------
  info.rem = await p.evaluate(async () => {
    const AS = APP.ASSIST, s = AS.cur(); s._rem = null;
    APP.HOST = { remind: async (pl) => { __rem.push(pl); return { ok: true }; }, unremind: async (k) => { __unrem.push(k); return { ok: true }; } };
    const st = APP.S.settings(); st.knots = st.knots || {}; st.knots.notify = { telegram: true, email: true }; st.knots.rk = { kn_x: APP.addDays(APP.today(), 1) }; APP.S.saveSettings(st);
    AS.tourSyncReminder(s); const covered = __rem.filter(x => x.key === 'tour:' + s.id && x.due_date === APP.addDays(APP.today(), 1)).length;
    st.knots.rk = {}; APP.S.saveSettings(st); s._rem = null; AS.tourSyncReminder(s);
    const free = __rem.filter(x => x.key === 'tour:' + s.id && x.due_date === APP.addDays(APP.today(), 1)).length;
    // ایمیل: دو رویدادِ معنادار در کمتر از ۳ ساعت ⇒ یک ایمیل
    APP.REPORT.URGENT_MS = 0; APP.HOST.mail = async (r) => { __mails.push(r); return { status: 'sent' }; }; const n0 = __mails.length;
    s.tour.mails = []; s.tour.mailAt = ''; s.tour.mailq = [{ k: 'facet', fa: 'یک', at: '' }]; await APP.REPORT.flush(s, true);
    s.tour.mailq = [{ k: 'facet', fa: 'دو', at: '' }]; const second = await APP.REPORT.flush(s, true); clearTimeout(APP.REPORT._pend[s.id]); delete APP.REPORT._pend[s.id];
    const out = { covered, free, mails: __mails.length - n0, second, queued: s.tour.mailq.length, force: null };
    out.force = await APP.REPORT.flush(s, true, true); APP.HOST = undefined; return out;
  });
  chk(info.rem.covered === 0 && info.rem.free === 1, '14: no tour reminder on a day that already has a knot reminder ' + JSON.stringify(info.rem));
  chk(info.rem.mails === 1 && info.rem.second === null && info.rem.queued === 1 && info.rem.force === 'sent', '14: at most one tour e-mail per 3 hours (the owner can still send now) ' + JSON.stringify(info.rem));

  // ---------- ۱۵) وضعِ وجه‌ها از داده: گره، زنجیرهٔ خالی، بازگشت، تأییدِ ثبت‌ها، سازندهٔ ناموفق ----------
  info.fac = await p.evaluate(() => {
    const AS = APP.ASSIST, s = AS.newSession(); s.msgs.push({ role: 'user', text: 'x', at: '' }); APP.S.put(s); AS._turnSession = s; localStorage.setItem('lla.assist.cur', JSON.stringify(s.id));
    AS.DO.tour_plan({ goal: 'g', facets: [{ key: 'f1', kind: 'knot', title: 'ترسِ بیکاری' }, { key: 'f2', kind: 'area', area: 'md_worry_uncertainty', title: 'زنجیرهٔ نگرانی' }] });
    const out = {};
    out.deny = AS.DO.tour_done({ facet: 'f1', why: 'به نظرم تمام است' }); out.denySt = s.tour.facets[0].status;
    // زنجیرهٔ بی حلقهٔ نوشته ⇒ «کاربست» نیست
    APP.S.put({ id: 'wc_e', type: 'wchain', title: 'اگر بیکار شوم', links: [{ text: '', p: '', ctrl: false }], created: new Date().toISOString() });
    AS.DO.tour_link({ facet: 'f2', id: 'wc_e' });
    out.emptyChain = AS.tourMilestones(s.tour.facets[1])[0].ok;
    const wc = APP.S.get('wc_e'); wc.links[0].text = 'تعدیل می‌شوم'; APP.S.put(wc); out.filledChain = AS.tourMilestones(s.tour.facets[1])[0].ok;
    // گره: پایه برپا ⇒ بازگشت ⇒ وجه دوباره باز، بی پیامِ «✓ پایه»
    APP.S.put({ id: 'kn_f', type: 'knot', name: 'من همیشه کم می‌آورم', status: 'practised', solvedAt: '2026-09-01T08:00:00Z' });
    APP.S.put({ id: 'kc_f', type: 'kcase', title: 'بخشنامه', root: { confirmed: true }, knots: ['kn_f'], premise: {}, created: new Date().toISOString() });
    APP.S.put({ id: 'ki_f', type: 'kitem', knot: 'kn_f', due: APP.today(), prompt: 'نمونه' });
    AS.DO.tour_link({ facet: 'f1', id: 'kc_f' }); AS.tourAfterTurn(s); out.built = s.tour.facets[0].status;
    AS.tourText(s);   // نقطهٔ «ثبت‌های تازه از نوبتِ پیش»
    APP.knotReturned('kn_f'); const n0 = s.msgs.length; AS.tourAfterTurn(s);
    const msg = s.msgs.slice(n0).map(m => m.text).join(' | ');
    out.reopened = s.tour.facets[0].status !== 'done' && /دوباره باز شد/.test(msg) && !/✓ پایهٔ وجهِ «ترسِ بیکاری»/.test(msg);
    // ثبتِ تازه ⇒ تأیید در متنِ تور؛ سازندهٔ ناموفق ⇒ پیگیریِ بدهکار
    APP.S.put({ id: 'kx_f', type: 'kexp', knot: 'kn_f', plan: 'فردا با مدیر حرف می‌زنم', status: 'planned', due: APP.addDays(APP.today(), 1), created: new Date(Date.now() + 1000).toISOString() });
    const k = APP.S.get('kn_f'); k.genLast = { st: 'failed', at: new Date().toISOString(), err: 'اتصال' }; APP.S.put(k);
    APP.S.get('ki_f').bad = true; APP.S.put(APP.S.get('ki_f'));
    const tt = AS.tourText(s);
    out.ack = /ثبت‌های تازه از نوبتِ پیش[^\n]*آزمایشِ واقعی/.test(tt); out.owed = /پیگیریِ بدهکار[^\n]*شکست خورد/.test(tt);
    return out;
  });
  chk(/فقط با نشانه‌هایش/.test(info.fac.deny) && info.fac.denySt !== 'done', '15: a knot facet is never «done» on the assistant\'s word ' + info.fac.deny);
  chk(info.fac.emptyChain === false && info.fac.filledChain === true, '15: an empty worry chain is not «a tool used»; a filled link is');
  chk(info.fac.built === 'done' && info.fac.reopened, '15: on relapse the knot facet reopens, without a «base built ✓» line ' + JSON.stringify(info.fac));
  chk(info.fac.ack && info.fac.owed, '15: new records are acknowledged and a failed practice generator is an owed follow-up');

  // ---------- ۱۶) قدمِ ۰ ِ گره‌گشا: مثال از خودِ موقعیت یا خنثی ----------
  info.ex = await p.evaluate(() => {
    APP.S.put({ id: 'kc_job', type: 'kcase', title: 'ترس از بیکاری', kinds: ['behavior', 'inference'], knots: [], intake: { stmts: [], what: 'بخشنامهٔ تعدیل آمد و ساعت ۲ شب سایت‌های کاریابی را نگاه کردم', claim: 'من همیشه کم می‌آورم', freq: 'often', expected: 'آرام بمانم', actual: 'تا صبح بیدار ماندم', thoughts: 'فکر کردم اخراج می‌شوم', seen: 'na' }, premise: {}, rank: {}, ev: [], pans: {}, ladder: {}, root: { extra: [], why5: [] }, acts: [], hyps: [], status: 'open', step: 's0', created: '2026-10-10T08:00:00.000Z' });
    APP.go('kcase', 'kc_job', 's0'); const t = document.getElementById('main').innerText;
    return { nail: /ناخن/.test(t), neutral: /در موقعیتِ تو واقعاً بهتر است یا فقط متفاوت/.test(t) };
  });
  chk(!info.ex.nail && info.ex.neutral, '16: step 0 shows no unrelated (fingernail) example in a job-fear case ' + JSON.stringify(info.ex));

  // ---------- ۱۷) قراردادِ منو: هر نما با VIEW_META در منوست یا زیرنمای صریح ----------
  info.menu = await p.evaluate(() => {
    const bad = APP.ASSIST.views().filter(v => APP.VIEW_META[v.id] && !v.inMenu && !(APP.SUB_VIEWS || {})[v.id]).map(v => v.id);
    const badParent = Object.keys(APP.SUB_VIEWS || {}).filter(k => !APP.ASSIST.views().some(v => v.id === APP.SUB_VIEWS[k] && v.inMenu));
    return { bad, badParent };
  });
  chk(!info.menu.bad.length && !info.menu.badParent.length, '17: every view with VIEW_META has a menu entry or is a declared sub-view of a menu view ' + JSON.stringify(info.menu));

  // ---------- ۸) آینه: میزبانِ دیررس هنگامِ فراخوانی دیده می‌شود (نه فقط هنگامِ بارگذاری) — آخر، چون نماها را می‌پیچد ----------
  info.mirror = await p.evaluate(async () => {
    const before = APP.mirrorInfo(), b0 = typeof APP.MIRROR_BUILD;
    window.__mir = [];
    APP.HOST = { mirror: async (b) => { __mir.push(b); return { ok: true }; }, mirrorList: async () => ({ items: [], connected: true }) };
    const inst = APP.mirrorInstalled(), info2 = APP.mirrorInfo();
    APP.S.put({ id: 'case_mirror1', type: 'case', title: 'پروندهٔ آینه', claim: 'x', st: {} });
    if (APP.mirrorDrain) await APP.mirrorDrain();
    return { before, b0, inst, promise: !!(info2 && info2.then), build: typeof APP.MIRROR_BUILD, sent: __mir.length };
  });
  chk(info.mirror.before === null && info.mirror.b0 === 'undefined' && info.mirror.inst && info.mirror.promise && info.mirror.build === 'object' && info.mirror.sent >= 1, '8: a host that appears after load still gets the Drive mirror (decided at call time) ' + JSON.stringify(info.mirror));

  console.log(JSON.stringify(info, null, 1).slice(0, 2500));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
