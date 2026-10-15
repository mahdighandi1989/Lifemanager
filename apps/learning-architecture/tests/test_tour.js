// «🧭 تور» ِ دستیار + پنجرهٔ کشیدنی/بزرگ‌شو (مالک ۲۰۲۶-۱۰-۱۴). هر بند یکی از یافته‌های «تورِ زنده» است (مسئلهٔ چندوجهیِ مونتی‌هال
// با مدلِ واقعی، از گره تا حوزهٔ نبوده) که حالا ماشینی آزموده می‌شود: ترتیبِ برگه و طرح، پیوند و پیشرفت از خودِ داده، هم‌گامیِ پیش از
// پرامپت، کلیدِ کهنه پس از رسمِ دوباره، کلیکی که قدم را عوض می‌کند، پیامِ صفحه به دستیار، قولِ «بعدش می‌زنم»، گزینهٔ تمرین، زبانه‌ها،
// پیگیریِ برگه (ناقص ⇒ یادداشت، «شاید منتشر نشده» ⇒ صبر، درست ⇒ باز شدنِ وجه)، تورِ حوزهٔ تازه، پیگیری تا تسلط، یادآور، و پنجره.
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
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__notes = []; window.__rem = []; window.__sheet = null;
    APP.HOST = {
      report: async (o) => ({ id: 'sh9', number: 9 }),
      sheets: async () => [],
      sheet: async (id) => window.__sheet,
      note: async (id, text) => { __notes.push({ id, text }); if (__sheet) __sheet.status = 'open'; return { ok: true }; },
      remind: async (pl) => { __rem.push(pl); return { ok: true }; }, unremind: async () => ({ ok: true })
    };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user, opts }); const r = __q.shift(); const t = typeof r === 'function' ? r(user) : r;
      if (t === undefined) throw new Error('no queued answer');
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
  });

  // 1) طرحِ تور و برگهٔ «حوزه‌ای که نیست» در یک پاسخ ⇒ همان وجه منتظرِ برگه (برگه پیش از ساختِ تور ثبت می‌شد)
  await p.evaluate(() => { window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o); });
  info.plan = await p.evaluate(async () => {
    __calls.length = 0; __q.length = 0;
    const s = APP.ASSIST.newSession(); s.msgs.push({ role: 'user', text: 'x', at: '' }); APP.S.put(s); APP.ASSIST.toggle(true);
    __q.push(R({ actions: [{ do: 'tour_plan', goal: 'مونتی‌هال', facets: [
      { key: 'f1', kind: 'knot', title: 'گیرِ مونتی‌هال', why: 'اول' }, { key: 'f2', kind: 'learn', title: 'احتمالِ شرطی', why: 'دوم' },
      { key: 'f3', kind: 'territory', title: 'اعتبارِ شهود', why: 'حوزه نیست' }] }],
      status: 'gap', gap: { title: 'اعتبارِ شهود', area: 'epi-territory', kind: 'build', facet: 'f3', confidence: 0.9, abstract: 'a', missing: 'b' } }));
    __q.push({ agree: true, reason: 'درست' });
    await APP.ASSIST.send('مونتی‌هال و شهود و احتمالِ شرطی');
    const t = APP.ASSIST.cur().tour;
    return { st: t.facets.map(f => f.key + ':' + f.status).join(','), blk: t.facets[2].blocked && t.facets[2].blocked.number, sys: /# تور: مسئلهٔ چندوجهی/.test(__calls[0].sys),
      drawer: !!document.querySelector('.as-tour [data-facet="f3"]') };
  });
  chk(info.plan.st === 'f1:now,f2:todo,f3:blocked' && info.plan.blk === 9, 'plan + gap in one reply ⇒ ordered facets, the territory facet waits on sheet #9: ' + JSON.stringify(info.plan));
  chk(info.plan.sys && info.plan.drawer, 'tour rules in SYS and the tour drawer is painted');

  // 2) پیوند و پیشرفت از خودِ داده + هم‌گامی پیش از پرامپت (کاری که بیرون از گفت‌وگو تمام شد همین نوبت دیده شود)
  info.prog = await p.evaluate(async () => {
    const s = APP.ASSIST.cur(), t = s.tour, since = t.facets[0].startedAt;
    const old = { id: 'kc_old', type: 'kcase', title: 'کهنه', created: '2000-01-01T00:00:00Z', root: {}, knots: [] }; APP.S.put(old); old.created = '2000-01-01T00:00:00Z'; APP.S.put(old);
    const k = { id: 'kn_t1', type: 'knot', title: 'دو حالت = هم‌شانس' }; APP.S.put(k);
    const kc = { id: 'kc_t1', type: 'kcase', title: 'مونتی‌هال', root: { confirmed: true }, knots: ['kn_t1'], premise: {} }; APP.S.put(kc);
    APP.S.put({ id: 'ki_t1', type: 'kitem', knot: 'kn_t1', due: APP.today(), prompt: 'سه جعبه' });
    __calls.length = 0; __q.push(R({}));
    await APP.ASSIST.send('[ادامهٔ تور]');
    const u = __calls[0].user;
    return { st: t.facets.map(f => f.key + ':' + f.status).join(','), refs: t.facets[0].refs.map(r => r.id).join(','), sawDone: /\[f1\][^\n]*وضع: done/.test(u), sawF2: /\[f2\][^\n]*◀ همین حالا/.test(u),
      pr: APP.ASSIST.tourPractice(t.facets[0]).map(x => x.t).join('|'), msg: s.msgs.filter(m => m.role === 'sys').map(m => m.text).join(' / ') };
  });
  chk(info.prog.refs === 'kc_t1', 'only the root record created after the facet started is linked (not an old one): ' + info.prog.refs);
  chk(info.prog.st === 'f1:done,f2:now,f3:blocked' && info.prog.sawDone && info.prog.sawF2, 'facet done from the data and the model already sees it in the same turn: ' + JSON.stringify(info.prog));
  chk(/ورزشِ گره/.test(info.prog.pr) && /پایهٔ وجهِ .* برپا شد \(از روی خودِ داده‌ها\)/.test(info.prog.msg), 'practice of the facet is listed and the completion is announced');
  chk(await p.evaluate(() => APP.ASSIST.DO.tour_done({ facet: 'f2' })).then(r => /دلیل/.test(r)), 'tour_done without evidence or a reason is refused');
  chk(await p.evaluate(() => APP.ASSIST.DO.tour_skip({ facet: 'f2' })).then(r => /دلیل/.test(r)), 'tour_skip without a reason is refused');

  // 3) کلیدها: رسمِ دوباره در میانهٔ نوبت هرگز کلیدِ کهنه را به فیلدِ دیگری نمی‌زند (پس از انتخابِ خانواده دو فیلد اشتباه پر شده بود)
  info.keys = await p.evaluate(async () => {
    const m = document.getElementById('main'); m.innerHTML = '';
    const draw = (extra) => { m.innerHTML = `<section>${extra ? '<label>تازه <input id="nw"></label>' : ''}<label>خانواده <select id="fam"><option value="">—</option><option value="F2">بازنمایی</option></select></label>
      <label>زیرنوع <input id="sub"></label><label>اطمینان <input id="conf"></label></section>`;
      document.getElementById('fam').onchange = (e) => { const v = e.target.value; draw(true); document.getElementById('fam').value = v; }; };
    draw(false);
    const sc = APP.ASSIST.scan(), k = l => sc.fields.find(f => f.label === l).k;
    const r = await APP.ASSIST.run([{ do: 'fill', k: k('خانواده'), value: 'F2' }, { do: 'fill', k: k('زیرنوع'), value: 'نادیده' }, { do: 'fill', k: k('اطمینان'), value: '70' }]);
    return { nw: document.getElementById('nw').value, sub: document.getElementById('sub').value, conf: document.getElementById('conf').value, notes: r.notes.join('|') };
  });
  chk(info.keys.nw === '' && info.keys.sub === 'نادیده' && info.keys.conf === '70', 'after a mid-turn re-render that inserts a field, old keys still hit their own fields: ' + JSON.stringify(info.keys));

  // 4) کلیکی که قدم/نما را عوض می‌کند = رفتن: کلیدهای بعدیِ همان نوبت به کار نمی‌روند و به مدل گفته می‌شود
  info.nav = await p.evaluate(async () => {
    const m = document.getElementById('main'); m.innerHTML = '<button id="stp" type="button">رفتن به قدمِ «ثبت»</button><label>متن <input id="t1"></label>';
    document.getElementById('stp').onclick = () => { APP.state.sub = 'in-' + Date.now(); };
    const sc = APP.ASSIST.scan(), k = l => (sc.fields.find(f => f.label === l) || sc.buttons.find(x => x.label === l)).k;
    const r = await APP.ASSIST.run([{ do: 'click', k: k('رفتن به قدمِ «ثبت»') }, { do: 'fill', k: k('متن'), value: 'x' }]);
    const v1 = document.getElementById('t1').value;
    // بخشِ «به قلمِ خودت» پر نمی‌شود، فقط زرد
    m.innerHTML = '<section data-own="1"><label>نامِ گره <input id="own1"></label></section>';
    const sc3 = APP.ASSIST.scan(), r3 = await APP.ASSIST.run([{ do: 'fill', k: sc3.fields[0].k, value: 'سپرِ آبرو' }]);
    const own = document.getElementById('own1').value === '' && document.getElementById('own1').classList.contains('as-hl') && /به قلمِ خودِ توست/.test(r3.notes.join());
    // کلیکی که در همان نما فیلد می‌افزاید (افزودنِ سطر): کلیدهای بعدی جابه‌جا شده‌اند ⇒ رد و «فرم تغییر کرد» (کارزارِ آزمون sc04)
    m.innerHTML = '<button id="add" type="button">+ سطر</button><div id="rows"></div><label>متن <input id="t2"></label>';
    document.getElementById('add').onclick = () => { document.getElementById('rows').insertAdjacentHTML('beforeend', '<label>سطر <input></label>'); };
    const sc2 = APP.ASSIST.scan(), k2 = l => (sc2.fields.find(f => f.label === l) || sc2.buttons.find(x => x.label === l)).k;
    const r2 = await APP.ASSIST.run([{ do: 'click', k: k2('+ سطر') }, { do: 'fill', k: k2('متن'), value: 'y' }]);
    return { own, moved: r.moved, skipped: r.skipped, val: v1, grew: !r2.moved && r2.changed && r2.skipped === 1 && document.getElementById('t2').value === '' };
  });
  chk(info.nav.own && info.nav.moved && info.nav.skipped === 1 && info.nav.val === '' && info.nav.grew, 'a click that changes the step counts as moving; later stale actions are skipped: ' + JSON.stringify(info.nav));

  // 5) پیامِ صفحه (toast) پس از کلیک به خودِ دستیار می‌رسد و نوبتِ خودکار می‌گیرد؛ 6) next:true قولِ «بعدش می‌زنم» را عملی می‌کند
  info.toast = await p.evaluate(async () => {
    const mk = () => { const m = document.getElementById('main'); m.innerHTML = '<button id="nx" type="button">ثبت و ایستگاه بعد</button><button id="b2" type="button">ساختِ نمونه‌ها</button>';
      document.getElementById('nx').onclick = () => APP.toast('«هزینهٔ خطا» الزامی است'); window.__b2 = 0; document.getElementById('b2').onclick = () => __b2++; };
    mk(); APP.state.view = 'home'; APP.state.sub = null;
    __calls.length = 0; __q.length = 0;
    __q.push((u) => R({ actions: [{ do: 'click', k: (u.match(/k(\d+)=«ثبت و ایستگاه بعد»/) || [])[0].split('=')[0] }] }));
    __q.push(R({ reply: 'هزینهٔ خطا لازم است.' }));
    await APP.ASSIST.send('برو بعدی');
    const a = { calls: __calls.length, saw: /پیامِ صفحه پس از کارهایت: «.*هزینهٔ خطا/.test((__calls[1] || {}).user || '') };
    mk(); __calls.length = 0; __q.length = 0;
    __q.push((u) => R({ next: true, actions: [{ do: 'click', k: (u.match(/k(\d+)=«ثبت و ایستگاه بعد»/) || [])[0].split('=')[0] }] }));
    APP.toast = ((t) => function () { })(APP.toast);   // بی پیامِ صفحه
    __q.push((u) => R({ actions: [{ do: 'click', k: (u.match(/k(\d+)=«ساختِ نمونه‌ها»/) || [])[0].split('=')[0] }] }));
    await APP.ASSIST.send('کارت را ثبت کن و نمونه‌ها را بساز');
    a.next = { calls: __calls.length, b2: __b2, said: /کارِ بعدی‌ای را که گفتی/.test((__calls[1] || {}).user || '') };
    return a;
  });
  chk(info.toast.calls === 2 && info.toast.saw, 'the page toast after a click reaches the assistant in an automatic turn: ' + JSON.stringify(info.toast));
  chk(info.toast.next.calls === 2 && info.toast.next.b2 === 1 && info.toast.next.said, 'next:true lets the promised follow-up click happen without a user message: ' + JSON.stringify(info.toast.next));

  // 7) گزینه/جوابِ تمرین هرگز پر، زده یا زرد نمی‌شود؛ 8) زبانهٔ «در انتظار تأیید (۱)» جابه‌جایی است، نه تصمیم
  info.ans = await p.evaluate(async () => {
    const m = document.getElementById('main');
    m.innerHTML = '<div class="dopts pb-opts"><button class="dopt" type="button">دو جعبه مانده، پس ۱/۲</button></div><div class="kp-ans"><label>پاسخ <input id="ka"></label></div>' +
      '<div class="tabs" role="tablist"><button role="tab" class="tab" type="button" id="tb">در انتظار تأیید (۱)</button></div>';
    window.__opt = 0; window.__tab = 0; m.querySelector('.dopt').onclick = () => __opt++; document.getElementById('tb').onclick = () => __tab++;
    const sc = APP.ASSIST.scan(), k = l => (sc.fields.find(f => f.label === l) || sc.buttons.find(x => x.label === l)).k;
    const r = await APP.ASSIST.run([{ do: 'highlight', k: k('دو جعبه مانده، پس ۱/۲') }, { do: 'click', k: k('دو جعبه مانده، پس ۱/۲') }, { do: 'fill', k: k('پاسخ'), value: '2/3' }, { do: 'click', k: k('در انتظار تأیید (۱)') }]);
    return { opt: __opt, hl: m.querySelector('.dopt').classList.contains('as-hl'), ka: document.getElementById('ka').value, tab: __tab, notes: r.notes.length, nj: r.notes.join('|') };
  });
  chk(info.ans.opt === 0 && !info.ans.hl && info.ans.ka === '' && (info.ans.notes === 3 || (info.ans.notes === 1 && /×۳/.test(info.ans.nj))), 'exercise options/answers are never clicked, highlighted or filled: ' + JSON.stringify(info.ans));
  chk(info.ans.tab === 1, 'a tab whose label contains «تأیید» is navigation and can be clicked');

  // 9) پیگیریِ برگه: جوابِ ناقص ⇒ یادداشتِ مستدل زیرِ همان برگه (و باز شدنش)؛ جوابِ تازه‌تر از بارِ صفحه ⇒ «تازه کن»؛ «شاید منتشر نشده» ⇒ یادداشت نه، صبر تا تازه‌کردن؛ درست ⇒ وجه باز
  info.sheet = await p.evaluate(async () => {
    const s = APP.ASSIST.cur(), f = s.tour.facets[2], A = APP, AS = APP.ASSIST, out = {};
    const past = new Date(Date.now() - 3600e3).toISOString();
    A._loadedAt = Date.now();
    window.__sheet = { id: 'sh9', status: 'answered', notes: [{ id: 'n1', by: 'reviewer', at: past, outcome: 'deferred', text: 'به نوبت می‌رسد.' }] };
    __calls.length = 0; __q.length = 0; __q.push({ ok: false, reason: 'هنوز گامِ ۰ است', followup: 'a_intuitions_method را جلو بیندازید' });
    await AS.tourCheckSheets(s);
    out.bad = { notes: __notes.length, txt: (__notes[0] || {}).text || '', reopened: __sheet.status === 'open', verifySys: /وارسی‌کنندهٔ دستیار/.test((__calls[0] || {}).sys || ''), task: ((__calls[0] || {}).opts || {}).task };
    __q.length = 0; await AS.tourCheckSheets(s); out.once = __calls.length;            // همان جواب دوباره سنجیده نمی‌شود
    __sheet.status = 'answered'; __sheet.notes.push({ id: 'n2', by: 'reviewer', at: new Date(Date.now() + 1000).toISOString(), outcome: 'done', text: 'ساختم.', commits: ['abc'] });
    await AS.tourCheckSheets(s); out.reload = /صفحه را یک بار تازه کن/.test(s.msgs.slice(-1)[0].text) && __calls.length === 1;
    __sheet.notes[1].at = new Date(Date.now() - 1000).toISOString(); A._loadedAt = Date.now(); __q.push({ ok: false, lag: true, reason: 'در نقشه نیست' });   // صفحه تازه شد
    await AS.tourCheckSheets(s); out.lag = { notes: __notes.length, msg: /شاید نسخهٔ تازه هنوز منتشر نشده/.test(s.msgs.slice(-1)[0].text) };
    const n = __calls.length; await AS.tourCheckSheets(s); out.lagWait = __calls.length === n;   // تا تازه‌کردن، نه
    await new Promise(r => setTimeout(r, 20)); A._loadedAt = Date.now(); __q.push({ ok: true, reason: 'هر دو حوزه گامِ ۲ شدند' });   // تازه‌کردنِ بعدی
    await AS.tourCheckSheets(s);
    out.ok = { st: f.status, ver: f.blocked.verified, msg: s.msgs.slice(-1)[0].text, today: A.dueList().some(x => /ساخته شد — ادامهٔ تور/.test(x.txt)) };
    return out;
  });
  chk(info.sheet.bad.notes === 1 && /پیگیریِ برگه/.test(info.sheet.bad.txt) && /جلو بیندازید/.test(info.sheet.bad.txt) && info.sheet.bad.reopened && info.sheet.bad.verifySys && info.sheet.bad.task === 'learning_architecture',
    'an inadequate answer ⇒ a reasoned note under the same sheet, which reopens it: ' + JSON.stringify(info.sheet.bad));
  chk(info.sheet.once === 1, 'the same answer is not re-verified');
  chk(info.sheet.reload, 'an answer newer than the loaded page ⇒ ask to reload first (verify against the new version)');
  chk(info.sheet.lag.notes === 1 && info.sheet.lag.msg && info.sheet.lagWait, 'possible deploy lag ⇒ no note, wait for a reload: ' + JSON.stringify(info.sheet.lag));
  chk(info.sheet.ok.ver && info.sheet.ok.st === 'todo' && /پس از «احتمالِ شرطی»/.test(info.sheet.ok.msg) && info.sheet.ok.today, 'adequate ⇒ facet unblocked, queued after the current one, and Today says so: ' + JSON.stringify(info.sheet.ok));

  // 10) تورِ حوزهٔ تازه: تا موضوع/پرونده‌ای با تمرینِ زمان‌بندی‌شده در آن نباشد تمام نیست؛ بعد خودکار
  info.terr = await p.evaluate(async () => {
    const s = APP.ASSIST.cur(), AS = APP.ASSIST;
    AS._turnSession = s; AS.DO.tour_focus({ facet: 'f3' });
    const f = s.tour.facets[2], before = AS.tourMilestones(f).map(m => m.ok).join(',');
    await new Promise(r => setTimeout(r, 5));
    const tp = { id: 'tp_t3', type: 'topic', title: 'شهود در برابرِ استدلال' }; APP.S.put(tp);
    APP.S.put({ id: 'sc_t3', type: 'sched', topic: 'tp_t3', due: APP.addDays(APP.today(), 1) });
    AS.tourAfterTurn(s);
    return { before, st: f.status, refs: f.refs.map(r => r.id).join(','), f2: s.tour.facets[1].status };
  });
  chk(info.terr.before === 'true,true,false' && info.terr.st === 'done' && info.terr.refs === 'tp_t3' && info.terr.f2 === 'now',
    'a verified territory facet completes only with a linked topic that has spaced practice, then the tour returns to the paused facet: ' + JSON.stringify(info.terr));

  // 11) پیگیری تا تسلط: پس از طیِ ترتیب، نشانه‌های باز در «امروز» و یادآور می‌مانند؛ همه ✓ ⇒ «تور کامل شد»
  info.master = await p.evaluate(async () => {
    const s = APP.ASSIST.cur(), AS = APP.ASSIST, t = s.tour;
    const st = APP.S.settings(); st.knots = st.knots || {}; st.knots.notify = { telegram: true, email: false, hour: 8 };
    const tp = { id: 'tp_t2', type: 'topic', title: 'احتمالِ شرطی' }; APP.S.put(tp); APP.S.put({ id: 'sc_t2', type: 'sched', topic: 'tp_t2', due: APP.addDays(APP.today(), 1) });
    AS._turnSession = s; AS.DO.tour_link({ facet: 'f2', id: 'tp_t2' });
    const dupLink = AS.DO.tour_link({ facet: 'f3', id: 'tp_t2' }); // همان کار در وجهِ دیگر دو بار شمرده نمی‌شود
    // پیوندِ خودکار جابه‌جاشدنی است
    APP.S.put({ id: 'wc_mv', type: 'wchain', title: 'م', links: [] }); t.facets[1].refs.push({ id: 'wc_mv', type: 'wchain', auto: true });
    const mv = AS.DO.tour_link({ facet: 'f3', id: 'wc_mv' }) === '' && !t.facets[1].refs.some(x => x.id === 'wc_mv') && t.facets[2].refs.some(x => x.id === 'wc_mv');
    t.facets[2].refs = t.facets[2].refs.filter(x => x.id !== 'wc_mv');
    // tour_add با آرایه و بی عنوان؛ پیش‌بینیِ وصل‌نشده در متنِ تور؛ برگه با شماره به وجه وصل می‌شود (کارزارِ آزمون sc08)
    const nF0 = t.facets.length, emptyAdd = AS.DO.tour_add({ facets: [{ kind: 'other' }] }), nF1 = t.facets.length;
    APP.S.put({ id: 'fc_tt', type: 'fcast', q: 'روزه هوش را بالا می‌برد', p: 80, due: APP.addDays(APP.today(), 30) });
    const fcInText = /رکوردهای تازهٔ وصل‌نشده[^\n]*fcast:fc_tt/.test(AS.tourText(s));
    s.msgs.forEach(m => { if (m.role === 'user') m.at = new Date(Date.now() - 2 * 864e5).toISOString(); }); s._rem = null; __rem.length = 0;
    AS.tourAfterTurn(s);
    const fu = AS.tourFollowups(t.facets[1]).map(m => m.t).join('|');
    const out = { mv, addArr: !!emptyAdd && nF1 === nF0, fcInText, dup: /دو بار شمرده نمی‌شود/.test(dupLink) && !(t.facets[2].refs || []).some(x => x.id === 'tp_t2'), done: !!t.doneAt, fu, said: s.msgs.some(m => /تا تسلطِ کامل پیگیری می‌کنم/.test(m.text)),
      today: APP.dueList().some(x => /پیگیریِ تورِ .* تا تسلط/.test(x.txt)), rem: (__rem.slice(-1)[0] || {}).body || '', btn: !!Array.from(document.querySelectorAll('.as-tour .btn')).find(x => /پیگیری تا تسلط/.test(x.textContent)) };
    APP.ASSIST.toggle(true);
    out.btn = !!Array.from(document.querySelectorAll('.as-tour .btn')).find(x => /پیگیری تا تسلط/.test(x.textContent));
    // همه ✓: سفر تا آخر و آزمایشِ واقعی
    APP.journeyProgress = () => ({ done: 11, all: 11 });
    APP.S.put({ id: 'kx_t1', type: 'kexp', knot: 'kn_t1', status: 'planned', due: APP.addDays(APP.today(), 3) });
    APP.S.all('sched').forEach(x => { x.done = true; APP.S.put(x); });
    // ورزیده شد ۱۰۰ روز پیش؛ پاسخِ درستِ سرد پس از ۳۰ و پس از ۹۰ روز ⇒ ماندگاری ✓
    const k = APP.S.get('kn_t1'), d0 = APP.addDays(APP.today(), -100);
    const notYet = AS.tourMilestones(t.facets[0]).filter(m => /ماندگاری/.test(m.t)).map(m => m.ok).join(',');
    k.status = 'practised'; k.solvedAt = d0 + 'T09:00:00Z'; k.log = [{ at: APP.addDays(d0, 40) + 'T09:00:00Z', ok: true }]; APP.S.put(k);
    out.held30only = AS.tourMilestones(t.facets[0]).filter(m => /ماندگاری/.test(m.t)).map(m => m.ok).join(',');
    out.recheck = APP.dueList().some(x => /سنجشِ ماندگاری.*۹۰/.test(x.txt));
    k.log.push({ at: APP.addDays(APP.today(), -2) + 'T09:00:00Z', ok: true }); APP.S.put(k);
    out.notYet = notYet;
    AS.tourAfterTurn(s);
    out.mastered = !!t.masteredAt && s.msgs.some(m => /تور کامل شد/.test(m.text));
    out.left = t.facets.map(f => f.key + ':' + AS.tourFollowups(f).map(m => m.t).join('/')).join(' || ');
    return out;
  });
  chk(info.master.mv && info.master.addArr && info.master.fcInText && info.master.dup && info.master.done && /سفرِ گام‌به‌گام تا آخر/.test(info.master.fu) && info.master.said && info.master.today && /تا تسلطِ کامل پیگیری دارد/.test(info.master.rem) && info.master.btn,
    'after the order is walked, open follow-ups stay in Today, the reminder and the drawer: ' + JSON.stringify(info.master));
  chk(info.master.notYet === 'false,false' && info.master.held30only === 'true,false' && info.master.recheck, 'solved needs a cold correct answer after 30 and 90 days; the 90-day check shows in Today: ' + JSON.stringify(info.master));
  chk(info.master.mastered, 'when every milestone of every facet is ✓ the tour says it is complete');

  // 11b) موضوعِ تازه در همان سشن: طرحِ تازه با کلیدهای تکراری وجه‌های انجام‌شده را بازنویسی نمی‌کند؛ تورِ تمام‌شده دوباره باز می‌شود
  info.replan = await p.evaluate(() => {
    const s = APP.ASSIST.cur(), AS = APP.ASSIST, t = s.tour; AS._turnSession = s;
    const before = t.facets.map(f => f.title).join('|');
    AS.DO.tour_plan({ goal: 'جلسهٔ تیم', facets: [{ key: 'f1', kind: 'knot', title: 'سکوت در جلسه' }, { key: 'f2', kind: 'claim', title: 'درون‌گراها مدیرِ بد' }] });
    const keys0 = t.facets.map(f => f.key + ':' + f.status).join(',');
    (s.reports = s.reports || []).push({ id: 'rep77', number: 77, area: 'sys-territory', title: 'حوزهٔ شواهد' }); const sl = AS.DO.tour_link({ facet: 'f5', id: '#۷۷' });
    const nA = t.facets.length; AS.tourAdoptSheet(s, { id: 'rep88', number: 88, title: 'گزینش و بقا' }, { area: 'epi-backtest', title: 'قاعدهٔ گزینش و بقا' });
    const adopted = t.facets.length === nA + 1 && t.facets[nA].status === 'blocked' && t.facets[nA].blocked.number === 88 && t.facets[nA].kind === 'territory';
    t.facets.pop();
    const pref = AS.DO.tour_link({ facet: 'f5', id: 'topic:tp_t2' }); const prefOk = !/برگهٔ/.test(pref);
    const sheetLink = prefOk && adopted && sl === '' && t.facets[4].status === 'blocked' && t.facets[4].blocked.number === 77 && s.reports[s.reports.length - 1].facet === 'f5';
    return { sheetLink, kept: t.facets.slice(0, 3).map(f => f.title).join('|') === before, keys: keys0, reopened: !t.doneAt && !t.masteredAt, goal: /جلسهٔ تیم/.test(t.goal) };
  });
  chk(info.replan.sheetLink && info.replan.kept && info.replan.keys === 'f1:done,f2:done,f3:done,f4:now,f5:todo' && info.replan.reopened && info.replan.goal,
    'a new plan on an existing tour appends with fresh keys and never rewrites done facets: ' + JSON.stringify(info.replan));

  // 13) نیمی‌مربوط، ایمنی، و پرونده‌ای که از ریشهٔ گره ساخته شد ⇒ وجهِ ادعا
  info.a = await p.evaluate(async () => {
    const AS = APP.ASSIST, s = AS.newSession(); s.msgs.push({ role: 'user', text: 'x', at: '' }); APP.S.put(s);
    __calls.length = 0; __q.length = 0;
    __q.push(R({ outside: 'کاریابی و بودجه‌بندی', actions: [{ do: 'tour_plan', facets: [{ key: 'f1', kind: 'knot', title: 'ترسِ بیکاری' }, { key: 'f2', kind: 'claim', title: 'درآمدم را از دست می‌دهم' }] }] }));
    await AS.send('می‌ترسم کار و درآمدم را از دست بدهم و دیگر نمی‌خواهم زنده باشم');
    const u = __calls[0].user, sysMsgs = s.msgs.filter(m => m.role === 'sys').map(m => m.text).join(' | ');
    const kc = { id: 'kc_f1', type: 'kcase', title: 'ترس', premise: {}, root: {}, knots: [] }; APP.S.put(kc);
    AS.tourAfterTurn(s);
    APP.S.put({ id: 'cs_f1', type: 'case', title: 'درآمدم را از دست می‌دهم', src: { type: 'kcase', id: 'kc_f1' }, st: {} });
    AS.tourAfterTurn(s);
    return { outside: /بیرون از این صفحه: کاریابی/.test(sysMsgs) && (s.outside || []).length === 1, safety: /🤝/.test(sysMsgs) && /نشانهٔ پریشانیِ جدی/.test(u),
      rules: /نیمی مربوط/.test(__calls[0].sys) && /رویدادِ مشخص ندارد/.test(__calls[0].sys) && /ترتیب، به همین اولویت/.test(__calls[0].sys),
      claimRef: s.tour.facets[1].refs.map(r => r.id).join(',') };
  });
  chk(info.a.outside && info.a.safety && info.a.rules, 'partial relevance is said honestly, distress shows the human-help line, the new rules are in SYS: ' + JSON.stringify(info.a));
  chk(info.a.claimRef === 'cs_f1', 'a case made from the knot root is adopted by the claim facet: ' + info.a.claimRef);

  // 12) پنجره: کشیدنِ سرتیتر جابه‌جا می‌کند، گوشه بزرگ/کوچک، ⤢ بیشینه/برگشت، همه به خاطر می‌ماند و در قابِ صفحه می‌ماند
  await p.evaluate(() => { localStorage.removeItem('lla.assist.pgeom'); APP.ASSIST.toggle(false); APP.ASSIST.toggle(true); });
  const box = async () => p.evaluate(() => { const r = document.querySelector('.as-panel').getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; });
  const b0 = await box();
  const hd = await p.evaluate(() => { const r = document.querySelector('.as-head .as-ttl').getBoundingClientRect(); return { x: r.left + 10, y: r.top + r.height / 2 }; });
  await p.mouse.move(hd.x, hd.y); await p.mouse.down(); await p.mouse.move(hd.x - 200, hd.y + 40, { steps: 6 }); await p.mouse.up();
  const b1 = await box();
  const gr = await p.evaluate(() => { const r = document.querySelector('.as-grip.r').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.mouse.move(gr.x, gr.y); await p.mouse.down(); await p.mouse.move(gr.x + 120, gr.y + 60, { steps: 6 }); await p.mouse.up();
  const b2 = await box();
  const gl = await p.evaluate(() => { const r = document.querySelector('.as-grip.l').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.mouse.move(gl.x, gl.y); await p.mouse.down(); await p.mouse.move(gl.x + 2000, gl.y, { steps: 6 }); await p.mouse.up();
  const b3 = await box();
  info.win = { b0, b1, b2, b3, saved: await p.evaluate(() => JSON.parse(localStorage.getItem('lla.assist.pgeom'))) };
  chk(Math.abs(b1.x - (b0.x - 200)) <= 2 && Math.abs(b1.y - (b0.y + 40)) <= 2 && b1.w === b0.w, 'dragging the header moves the window: ' + JSON.stringify([b0, b1]));
  chk(Math.abs(b2.w - (b1.w + 120)) <= 2 && Math.abs(b2.h - (b1.h + 60)) <= 2 && b2.x === b1.x, 'the bottom-right grip resizes: ' + JSON.stringify([b1, b2]));
  chk(b3.w === 300 && b3.x + b3.w <= 1280, 'the bottom-left grip shrinks down to the minimum and stays on screen: ' + JSON.stringify(b3));
  chk(info.win.saved && info.win.saved.w === b3.w && info.win.saved.x === b3.x, 'geometry is remembered');
  await p.click('.as-maxb'); const bm = await box();
  await p.click('.as-maxb'); const bb = await box();
  chk(bm.w > 1100 && bm.h > 750 && bb.w === b3.w && bb.x === b3.x, '⤢ maximizes and restores: ' + JSON.stringify([bm, bb]));
  await p.evaluate(() => { APP.ASSIST.toggle(false); APP.ASSIST.toggle(true); }); const br = await box();
  chk(br.w === b3.w && br.x === b3.x && br.y === b3.y, 'reopened at the remembered place and size');
  await p.setViewportSize({ width: 700, height: 500 }); await p.waitForTimeout(150); const bs = await box();
  chk(bs.x >= 0 && bs.y >= 0 && bs.x + bs.w <= 700 && bs.y + bs.h <= 500, 'a smaller window keeps the panel inside the viewport: ' + JSON.stringify(bs));
  await p.setViewportSize({ width: 390, height: 800 }); await p.waitForTimeout(150);
  info.mob = await p.evaluate(() => ({ grip: getComputedStyle(document.querySelector('.as-grip.r')).display, max: getComputedStyle(document.querySelector('.as-maxb')).display, w: Math.round(document.querySelector('.as-panel').getBoundingClientRect().width) }));
  chk(info.mob.grip === 'none' && info.mob.max === 'none' && info.mob.w >= 370, 'mobile: a bottom sheet without grips or maximize: ' + JSON.stringify(info.mob));

  // صفحه‌کلید: 💬 با Enter باز، Escape می‌بندد و فوکوس به 💬 برمی‌گردد؛ بیشینه و برگشت به اندازهٔ پیشین (کارزارِ سوم، بازبینِ پنجره)
  await p.setViewportSize({ width: 1280, height: 800 }); await p.waitForTimeout(150);
  await p.evaluate(() => APP.ASSIST.toggle(false)); await p.focus('.as-fab'); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  info.kbOpen = await p.evaluate(() => !document.querySelector('.as-panel').hidden);
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  info.kbClose = await p.evaluate(() => document.querySelector('.as-panel').hidden && document.activeElement === document.querySelector('.as-fab'));
  await p.evaluate(() => APP.ASSIST.toggle(true)); await p.waitForTimeout(100);
  const g0 = await p.evaluate(() => { const r = document.querySelector('.as-panel').getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); });
  await p.evaluate(() => APP.ASSIST.toggleMax()); await p.waitForTimeout(100);
  const hb = await p.evaluate(() => { const r = document.querySelector('.as-ttl').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.mouse.move(hb.x, hb.y); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(100);
  await p.evaluate(() => APP.ASSIST.toggleMax()); await p.waitForTimeout(100);
  const g1 = await p.evaluate(() => { const r = document.querySelector('.as-panel').getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); });
  chk(info.kbOpen && info.kbClose, 'keyboard: Enter opens 💬, Escape closes and returns focus: ' + [info.kbOpen, info.kbClose]);
  chk(g0 === g1, 'maximize, click the header, restore ⇒ back to the previous size: ' + g0 + ' vs ' + g1);
  // پس از وارسیِ درست: دکمهٔ «✅ تأییدِ برگه» فقط برای مالک (data-own) و فراخوانیِ status ِ میزبان (کارزارِ سوم v02)
  info.approve = await p.evaluate(async () => {
    const AS = APP.ASSIST; let called = null; APP.HOST = Object.assign({}, APP.HOST || {}, { status: async (id, st) => { called = id + ':' + st; return { ok: true }; } });
    const s = AS.newSession(); s.tour = { goal: 'g', facets: [{ key: 'f1', kind: 'territory', title: 'حوزهٔ تازه', status: 'todo', blocked: { id: 'sh9', number: 9, verified: true, checks: [{ ok: true }] } }] }; APP.S.put(s);
    const d = AS.tourDrawer(s), b = [...d.querySelectorAll('button')].find(x => /تأییدِ برگهٔ/.test(x.textContent));
    if (!b) return 'no-button'; const own = b.getAttribute('data-own') === '1'; b.click(); await new Promise(r => setTimeout(r, 80));
    return own + '|' + called + '|' + !!s.tour.facets[0].blocked.approvedAt;
  });
  chk(info.approve === 'true|sh9:approved|true', 'after a verified sheet the owner (only) can tick «✅ تأیید»: ' + info.approve);
  console.log(JSON.stringify(info).slice(0, 2500));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  info.hold = await p.evaluate(() => { const S = APP.S, d = APP.addDays(APP.today(), -10);
    S.put({ id: 'kh1', type: 'knot', name: 'گ', status: 'practised', solvedAt: d + 'T10:00:00Z', log: [] });
    const pr = APP.ASSIST.tourPractice({ kind: 'knot', refs: [{ type: 'knot', id: 'kh1' }] });
    const it = pr.filter(x => /ماندگاری/.test(x.t)); return it.map(x => x.due).join(',') === [APP.addDays(d, 30), APP.addDays(d, 90)].join(',') && /دوباره‌سنجی/.test(APP.ASSIST.SYS); });
  chk(info.hold, 'the 30/90-day retention checks are practice dates (so the reminder and e-mail name them) and the model re-measures the first situation');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
