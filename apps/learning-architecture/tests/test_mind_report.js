// «🗺 قلمروِ سامانه‌ها» + «🧠 کارنامهٔ ذهن» + «📧 گزارشِ تور» (مالک ۲۰۲۶-۱۰-۱۴).
// قلمرو: هر ارجاعِ ابزار در نقشه‌ها به ابزارِ واقعیِ صفحه می‌رسد؛ گامِ ۵ فقط از دادهٔ کاربر؛ دستیار و گراف همین را می‌بینند.
// کارنامه: زیرِ ۵ نمونه عدد نمی‌دهد، بی شاخصِ عملکرد نمره نمی‌دهد؛ نقطه‌های سیاه و نمودارها از داده؛ PNG برای ایمیل.
// گزارش: رویدادهای تور ⇒ HOST.mail با HTML ِ کامل (وجه‌ها، مسیرِ عبور، گفت‌وگو، کارنامه، تصویرهای cid)؛ رویدادهای ریز جمع می‌شوند؛
// خاموش ⇒ چیزی فرستاده نمی‌شود؛ شکست ⇒ رویدادها در صف می‌مانند.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  await p.goto(FILE); await p.waitForSelector('.nav');
  await p.evaluate(fs.readFileSync(path.join(__dirname, 'fixtures_mind_seed.js'), 'utf8'));

  // ---------- قلمروِ سامانه‌ها ----------
  info.terr = await p.evaluate(async () => {
    APP.S.loaded = true; const Y = APP.SYST, all = Y.areas();
    const bad = []; all.forEach(x => (x.a.tools || []).forEach(t => { if (!Y.tool(t)) bad.push(x.a.id + ':' + t); }));
    const L = Y.ledger(), noLedger = all.filter(x => !L[x.a.id]).map(x => x.a.id);
    // گامِ ۵ از داده: حوزه‌ای در گامِ ۴ با ابزارِ kfam، یا ساختگی در دفتر برای آزمون
    const a4 = all.find(x => (L[x.a.id] || {}).stage === 4 && (x.a.tools || []).some(t => /^kfam:/.test(t)));
    let s5 = null;
    if (a4) { const fam = a4.a.tools.find(t => /^kfam:/.test(t)).slice(5); const before = Y.stage(a4.a);
      for (let i = 0; i < 3; i++) APP.S.put({ id: 'kn_u' + i, type: 'knot', fam, name: 'x' + i, status: 'practised' });
      s5 = [before, Y.stage(a4.a)]; }
    APP.go('sterr'); await new Promise(r => setTimeout(r, 200));
    const html = document.getElementById('main').innerText;
    const g = APP.GRAPH.build(), ssys = Object.keys(g.nodes).filter(k => /^ssys:/.test(k)).length, sarea = Object.keys(g.nodes).filter(k => /^sarea:/.test(k)).length;
    return { systems: Y.systems().length, areas: all.length, bad, noLedger: noLedger.length, s5, view: /قلمروِ سامانه‌ها/.test(html) && document.querySelectorAll('#main .terr-area').length > 10,
      man: /## قلمروِ سامانه‌ها/.test(APP.ASSIST.manifest()) && /area=sys-territory/.test(APP.ASSIST.manifest()), ssys, sarea, broken: (g.broken || []).filter(x => /sarea|ssys/.test(x.a + x.b)).length,
      hub: APP.GRAPH.MAPS.some(m => m.v === 'sterr') && APP.GRAPH.MAPS.some(m => m.v === 'mind'), meta: !!(APP.VIEW_META.sterr && APP.VIEW_META.mind),
      areasOwner: (window.EPI_BT_LEDGER.ownership.areas || []).some(a => a.id === 'sys-territory') };
  });
  chk(info.terr.systems === 6 && info.terr.areas >= 100, 'six system territories with their areas: ' + JSON.stringify([info.terr.systems, info.terr.areas]));
  chk(!info.terr.bad.length, 'every tool ref in the maps resolves to a real page tool: ' + info.terr.bad.slice(0, 10).join(', '));
  chk(info.terr.noLedger === 0, 'every area has a ledger entry');
  chk(info.terr.s5 && info.terr.s5[0] === 4 && info.terr.s5[1] === 5, 'stage 5 comes only from the user\'s own data (3 tracked uses): ' + JSON.stringify(info.terr.s5));
  chk(info.terr.view && info.terr.man && info.terr.hub && info.terr.meta && info.terr.areasOwner, 'view, assistant manifest, maps hub, VIEW_META and ownership area: ' + JSON.stringify(info.terr));
  chk(info.terr.ssys === 6 && info.terr.sarea === info.terr.areas && info.terr.broken === 0, 'graph carries systems and areas without broken links');

  // ---------- کارنامهٔ ذهن ----------
  info.mind = await p.evaluate(async () => {
    const empty = APP.MIND.model();
    const emptyOk = empty.dims.every(d => d.score == null && d.band === 'دادهٔ کم');
    __seedMind();
    const m = APP.MIND.model();
    APP.go('mind'); await new Promise(r => setTimeout(r, 300));
    const svgs = document.querySelectorAll('#main .mind-svg').length, rows = document.querySelectorAll('#main .mind-table:not(.psy-table) tbody tr').length;
    const png = await APP.MIND.png(APP.MIND.radar(m));
    const epi = m.dims.find(d => d.id === 's_epi');
    return { emptyOk, svgs, rows, png: /^data:image\/png;base64,/.test(png) && png.length > 2000, dims: m.dims.length,
      someScore: m.dims.some(d => d.score != null), epiLow: epi.score == null && epi.n.cal === 2,
      black: m.black.map(x => x.k).join(','), events: m.events.length, noIQ: !/ضریبِ هوشی[^»]*\d/.test(document.getElementById('main').innerText) };
  });
  chk(info.mind.emptyOk, 'no data ⇒ no score anywhere («دادهٔ کم»)');
  chk(info.mind.dims === 7 && info.mind.rows === 7 && info.mind.svgs >= 5, 'seven dimensions, a report row each, five charts: ' + JSON.stringify(info.mind));
  chk(info.mind.someScore && info.mind.epiLow, 'scores only where ≥5 samples exist (epistemic has 2 ⇒ none): ' + JSON.stringify(info.mind));
  chk(/returned/.test(info.mind.black) && /stale/.test(info.mind.black), 'black spots: returned and long-open knots: ' + info.mind.black);
  chk(info.mind.png && info.mind.events > 5 && info.mind.noIQ, 'PNG for e-mail, a timeline, and no IQ number');
  // ممیزیِ اجرا ۲۰۲۶-۱۰-۱۵: موقعیت‌ها در نقشهٔ کامل، پیش‌نیاز و تور در شبکه، راه به معرفت‌شناسی و گرافِ مشترک، و تازه‌شدنِ زنده
  info.mind2 = await p.evaluate(async () => {
    const S = APP.S;
    S.put({ id: 'pq_mr', type: 'prereq', title: 'پیش‌نیازِ کارنامه', items: [], kcase: 'kc_s0' });
    S.put({ id: 'ach_mr', type: 'achat', title: 'تورِ کارنامه', msgs: [], tour: { createdAt: new Date().toISOString(), facets: [{ key: 'f1', title: 'و', refs: [{ id: 'kc_s1', type: 'kcase' }] }] } });
    const C = APP.MIND.charts(APP.MIND.model());
    const out = { mmCase: /🪢 موقعیتِ/.test(C.mindmap.textContent), nnPre: /پیش‌نیازِ کارنامه/.test(C.neural.textContent), nnTour: /تورِ کارنامه/.test(C.neural.textContent) };
    APP.go('mind'); await new Promise(r => setTimeout(r, 150));
    out.links = !!document.querySelector('#main .mind-graph') && !!document.querySelector('#main .mind-epi') && !!document.querySelector('#main tr[data-dim="s_epi"] .mind-dim-epi');
    S.put({ id: 'kn_mr_live', type: 'knot', fam: 'F2', name: 'گرهِ زندهٔ کارنامه', status: 'open', created: new Date().toISOString() });
    await new Promise(r => setTimeout(r, 500));
    out.live = /گرهِ زندهٔ کارنامه/.test(document.getElementById('main').textContent);
    document.querySelector('#main .mind-graph').click(); await new Promise(r => setTimeout(r, 200));
    out.toGraph = APP.state.view === 'maps';
    APP.go('mind'); await new Promise(r => setTimeout(r, 150)); document.querySelector('#main .mind-dim-epi').click(); await new Promise(r => setTimeout(r, 150));
    out.toEpi = APP.state.view === 'e_cases';
    ['pq_mr', 'ach_mr', 'kn_mr_live'].forEach(id => S.del(id));
    return out;
  });
  chk(Object.values(info.mind2).every(Boolean), 'mind map shows situations; network shows prerequisite maps and tours; links to the shared graph and the factory cases; live refresh after a save ' + JSON.stringify(info.mind2));

  // ---------- گزارشِ تور ----------
  info.rep = await p.evaluate(async () => {
    const AS = APP.ASSIST; window.__mails = [];
    // مهلتِ ایمیل‌های مهمِ پشتِ‌هم: دومی تا مهلت صبر می‌کند و بعد خودش می‌رود (کارزارِ آزمون sc15)
    { APP.REPORT.URGENT_MS = 300; const g0 = APP.REPORT.MIN_GAP_MS; APP.REPORT.MIN_GAP_MS = 300; const s0 = { id: 'thr', tour: { facets: [], mailq: [{ k: 'facet', fa: 'a' }], mailAt: new Date().toISOString(), mails: [{ status: 'sent' }] } }; const hm = APP.HOST; let n = 0;
      APP.HOST = Object.assign({}, hm, { mail: async () => { n++; return { status: 'sent' }; } }); const first = await APP.REPORT.flush(s0, true);
      await new Promise(r => setTimeout(r, 1500)); window.__thr = first === null && n === 1; APP.HOST = hm; APP.REPORT.URGENT_MS = 0; APP.REPORT.MIN_GAP_MS = g0; }
    APP.HOST = { mail: async (r) => { __mails.push(r); return { status: window.__mailStatus || 'sent' }; }, sheets: async () => [] };
    window.__q = []; APP.callAI = async () => JSON.stringify(__q.shift());
    const s = AS.newSession(); s.msgs.push({ role: 'user', text: 'x', at: '' }); APP.S.put(s); AS.toggle(true);
    __q.push({ reply: 'سه وجه.', status: 'related', memory: 'm', actions: [{ do: 'tour_plan', goal: 'ترسِ بیکاری', facets: [{ key: 'f1', kind: 'knot', title: 'ترسِ بیکاری' }, { key: 'f2', kind: 'claim', title: 'درآمدم را از دست می‌دهم' }, { key: 'f3', kind: 'learn', title: 'تحملِ عدمِ قطعیت' }] }, { do: 'go', view: 'kcases' }] });
    __q.push({ reply: 'باز شد.', status: 'related', memory: 'm', actions: [] });
    await AS.send('می‌ترسم کار و درآمدم را از دست بدهم');
    await new Promise(r => setTimeout(r, 300));
    const m1 = __mails[0] || {};
    const out = { n1: __mails.length, subj: m1.subject || '', facets: /ترسِ بیکاری/.test(m1.html) && /درآمدم را از دست می‌دهم/.test(m1.html), map: /نقشهٔ راه و ترتیب/.test(m1.html),
      trail: /از کجا عبور کرد/.test(m1.html), chat: /گفت‌وگو \(فشرده\)/.test(m1.html), mind: /کارنامهٔ ذهن/.test(m1.html) && /cid:mind_radar/.test(m1.html),
      imgs: (m1.images || []).filter(i => /^data:image\/png/.test(i.data)).length, rtl: /dir="rtl"/.test(m1.html), text: /ترسِ بیکاری/.test(m1.text || '') };
    // رویدادِ ریز در کمتر از ۵ دقیقه ⇒ صبر و جمع
    s.tour.mailq = [{ k: 'x', fa: 'ریز', at: '' }]; await APP.REPORT.flush(s, false); out.coalesced = __mails.length === 1 && s.tour.mailq.length === 1;
    // وجه کامل شد ⇒ فوری (همراهِ رویدادِ ریزِ مانده)
    const before = { st: s.tour.facets.map(f => f.key + ':' + f.status + ':0').join(','), done: false, m: false };
    s.tour.facets[0].status = 'done'; s.tour.facets[1].status = 'now';
    // آهنگِ ایمیل (کارزارِ سوم v04): کمتر از ۳ ساعت پس از ایمیلِ پیشین ⇒ صبر (رویداد در صف می‌ماند)؛ پس از آن ⇒ می‌رود
    APP.REPORT.note(s, before); await new Promise(r => setTimeout(r, 300));
    out.throttled = __mails.length === 1 && s.tour.mailq.some(e => e.k === 'facet'); clearTimeout(APP.REPORT._pend[s.id]); delete APP.REPORT._pend[s.id];
    s.tour.mailAt = new Date(Date.now() - 4 * 3600000).toISOString(); await APP.REPORT.flush(s, true); await new Promise(r => setTimeout(r, 100));
    out.facetMail = out.throttled && __mails.length === 2 && /برپا شد/.test(__mails[1].subject) && /ریز/.test(__mails[1].html);
    // خاموش ⇒ نه
    APP.REPORT.setEnabled(false); s.tour.mailq = [{ k: 'done', fa: 'تمام', at: '' }]; await APP.REPORT.flush(s, true); out.off = __mails.length === 2;
    APP.REPORT.setEnabled(true);
    // شکست ⇒ در صف می‌ماند و ثبت می‌شود
    window.__mailStatus = 'failed'; s.tour.mailAt = ''; await APP.REPORT.flush(s, true); out.failKept = s.tour.mailq.length >= 1 && s.tour.mails.slice(-1)[0].status === 'failed';
    window.__mailStatus = 'sent'; await APP.REPORT.flush(s, true, true); out.retry = s.tour.mailq.length === 0 && s.tour.mails.slice(-1)[0].status === 'sent';
    AS.paint && AS.paint(); out.drawer = !!Array.from(document.querySelectorAll('.as-mail')).length;
    return out;
  });
  chk(info.rep.n1 === 1 && /تور «/.test(info.rep.subj), 'a new tour sends a report at once: ' + JSON.stringify(info.rep));
  chk(info.rep.facets && info.rep.map && info.rep.trail && info.rep.chat && info.rep.mind && info.rep.rtl && info.rep.text, 'the report has the facets, the road map, the trail, the conversation, the mind report card (RTL, plain-text twin)');
  chk(info.rep.imgs >= 5, 'charts travel as inline PNGs: ' + info.rep.imgs);
  chk(info.rep.coalesced && info.rep.facetMail, 'small events wait and ride along with the next important one');
  info.thr = await p.evaluate(() => window.__thr);
  chk(info.thr && info.rep.off && info.rep.failKept && info.rep.retry && info.rep.drawer, 'off ⇒ nothing sent; failure keeps the events; retry sends; the drawer has the 📧 control; urgent mails coalesce then send: ' + info.thr);

  // ---------- اصلاح‌های کارزارِ آزمون ----------
  info.camp = await p.evaluate(async () => {
    const AS = APP.ASSIST, out = {}; window.__q = []; window.__calls = [];
    APP.callAI = async (sys, user) => { __calls.push({ sys, user }); return JSON.stringify(__q.shift()); };
    // نامِ سشن پس از پیامِ نامربوط دوباره ساخته می‌شود
    const s = AS.newSession(); APP.S.put(s);
    __q.push({ reply: 'این‌جا جایش نیست.', status: 'unrelated', title: 'درخواستِ نامربوط', memory: 'm', actions: [] });
    await AS.send('دستور لازانیا بده');
    __q.push({ reply: 'باشه.', status: 'related', title: 'مذاکرهٔ حقوق', memory: 'm', actions: [{ do: 'tour_plan', facets: [{ key: 'f1', kind: 'other', area: 'dc_career_income', title: '' }] }] });
    await AS.send('می‌خوام سرِ حقوقم مذاکره کنم و از بیکاری می‌ترسم');
    out.title = s.title; const f = s.tour.facets[0];
    out.area = [f.kind, f.area, f.title, f.view, f.arg].join('|');
    out.knowledge = /# دانسته‌های قلمرو/.test(__calls[1].user) && /sc_negotiation/.test(__calls[1].user);
    __calls.length = 0; __q.push({ reply: 'نگاه می‌کنم.', status: 'related', memory: 'm', know: ['a_disagreement'], actions: [] }); __q.push({ reply: 'دو دیدگاه هست.', status: 'related', memory: 'm', actions: [] });
    await AS.send('دو آدمِ هم‌سطح مخالفن؛ نظرم رو عوض کنم؟');
    out.know = __calls.length === 2 && /a_disagreement/.test(__calls[1].user) && (s.know || []).indexOf('a_disagreement') >= 0;
    // وجهِ area: زنجیرهٔ نگرانی که از آغازِ وجه ساخته شد خودکار وصل و نشانه‌ها از داده
    await new Promise(r => setTimeout(r, 5));
    APP.S.put({ id: 'wc_t1', type: 'wchain', title: 'بیکار می‌شوم', feel: 80, links: [{ text: 'تعدیل', p: 30 }, { text: 'کار پیدا نکنم', p: 20 }], due: APP.addDays(APP.today(), 30) });
    AS.tourAfterTurn(s);
    out.areaMs = AS.tourMilestones(f).map(m => m.ok ? 1 : 0).join('');
    // کاربرگِ نامربوط (فنی که در ابزارهای همین حوزه نیست) به وجهِ حوزه نمی‌چسبد (کارزارِ آزمون sc16)
    APP.S.put({ id: 'ex_py', type: 'ex', tid: 999, topic: 'tp_py', status: 'draft', data: {} }); AS.tourAfterTurn(s);
    out.noMislink = !f.refs.some(r => r.id === 'ex_py');
    out.chainCalc = JSON.stringify(APP.chainCalc(APP.S.get('wc_t1')));
    // کارِ «انجام‌شده» که نشد ⇒ نوبتِ اصلاح
    const m = document.getElementById('main'); m.innerHTML = '<button id="zz" type="button">ریشه را تأیید کن</button>';
    __calls.length = 0; __q.push((u => ({ reply: 'تأیید را زدم.', status: 'related', memory: 'm', actions: [{ do: 'click', k: 'k1' }] }))());
    __q.push({ reply: 'نزدم — تصمیمِ توست؛ زردش کردم.', status: 'related', memory: 'm', actions: [] });
    await AS.send('بزن');
    out.correct = __calls.length === 2 && /انجام نشد/.test(__calls[1].user);
    // پیامِ صفحه پس از کلیکِ خودِ کاربر به پرامپتِ بعد می‌رسد
    APP.toast('این‌ها هنوز کامل نیستند: چرای ۱'); __calls.length = 0; __q.push({ reply: 'چرای ۱ کامل نیست.', status: 'related', memory: 'm', actions: [] });
    await AS.send('زدم ولی نشد'); out.toast = /پیام‌های اخیرِ صفحه[\s\S]*چرای ۱/.test(__calls[0].user);
    // ایمنی ⇒ ایمیل بی متنِ گفت‌وگو، با کادرِ کمک
    window.__mails = []; APP.HOST.mail = async (r) => { __mails.push(r); return { status: 'sent' }; };
    s.safetyAt = new Date().toISOString(); s.msgs.push({ role: 'user', text: 'متنِ حساس', at: '' });
    const rep = await APP.REPORT.build(s, []); out.privacy = !/متنِ حساس/.test(rep.html) && /حریمِ خصوصی/.test(rep.html) && !/بازی کارآگاهی/.test(rep.html);
    // دفترِ پیش‌بینی ⇒ Brier و کالیبراسیون
    APP.S.put({ id: 'fc_t1', type: 'fcast', q: 'تعدیل می‌شوم', p: 80, due: APP.today(), dim: 's_decision', outcome: 'نشد' });
    out.brier = JSON.stringify(APP.fcastBrier()); out.calDec = APP.MIND.model().dims.find(d => d.id === 's_decision').n.cal >= 1;
    APP.go('chain', 'wc_t1'); await new Promise(r => setTimeout(r, 150)); out.chainView = /سقفِ کلِ زنجیره/.test(document.getElementById('main').innerText) && /فاجعه‌سازی/.test(document.getElementById('main').innerText);
    out.nav = (APP.NAV || []).some(n => Array.isArray(n) && n[0] === 'chain') && (APP.NAV || []).some(n => Array.isArray(n) && n[0] === 'mind');
    // 🧭 ارزش‌ها و معنا: ناهم‌خوانیِ اهمیت/وقت و کشمکشِ بی‌قاعده دیده می‌شود؛ وارسیِ معنا در «امروز»
    APP.S.put({ id: 'vl_a', type: 'value', title: 'خانواده', imp: 9, hours: 2, vs: [{ with: 'درآمد', rule: '' }] }); APP.S.put({ id: 'vl_b', type: 'value', title: 'درآمد', imp: 7, hours: 50, vs: [] });
    const vk = APP.valsCheck(); out.vals = vk.gaps.join() + '|' + vk.open.join();
    // وجهِ حوزهٔ ارزش‌ها رکوردهای ارزش را می‌گیرد، حتی اگر منتظرِ برگه باشد (کارزارِ آزمون sc14)
    AS._turnSession = s; AS.DO.tour_add({ facet: { key: 'f9', kind: 'area', area: 'sf_values', title: 'کار ⟷ خانواده' } });
    const fv = s.tour.facets.find(f => f.area === 'sf_values'); fv.status = 'blocked'; AS.tourAfterTurn(s);
    out.valsLinked = (fv.refs || []).some(r => r.id === 'vl_a') && AS.tourMilestones(fv)[0].ok; fv.status = 'todo';
    out.valsToday = APP.dueList().some(x => /وارسیِ ماهانهٔ معنا/.test(x.txt));
    APP.go('vals'); await new Promise(r => setTimeout(r, 150)); out.valsView = /کشمکش بی قاعدهٔ ترجیح/.test(document.getElementById('main').innerText);
    // ایمیل نتیجهٔ تمرین‌ها را می‌گوید (نه فقط «ساخته شد»)
    APP.S.put({ id: 'kc_sc', type: 'kcase', title: 'م', knots: ['kn_sc'] }); APP.S.put({ id: 'kn_sc', type: 'knot', name: 'گ' });
    APP.S.put({ id: 'ki_sc', type: 'kitem', knot: 'kn_sc', hist: [{ at: '2026-10-01T08:00:00Z', ok: true }, { at: '2026-10-05T08:00:00Z', ok: false }] });
    out.scores = APP.REPORT.scores({ kind: 'knot', status: 'now', refs: [{ id: 'kc_sc', type: 'kcase' }] }).join('|');
    // دستیار عددهای کارنامه را می‌بیند (فقط در همان نما)
    APP.go('mind'); await new Promise(r => setTimeout(r, 150)); out.mindHook = (AS.promptHooks || []).map(f => { try { return f(s, '') || ''; } catch (e) { return ''; } }).join('\n');
    out.mindHook = /# کارنامهٔ ذهن[\s\S]*سازه‌های استاندارد[\s\S]*پاسخِ بعدی/.test(out.mindHook);
    // حوزهٔ ناموجود صریح گفته می‌شود؛ بازگشتِ گره در تور و ایمیل دیده می‌شود (کارزارِ آزمون sc17)
    out.badArea = /در قلمروها نیست/.test(AS.DO.tour_plan({ facets: [{ key: 'fz', kind: 'area', area: 'md_nope', title: 'x' }] }));
    APP.S.put({ id: 'kn_rt', type: 'knot', name: 'تلفن', status: 'practised', solvedAt: '2026-09-01T08:00:00Z', fam: 'F7' }); APP.S.put({ id: 'kc_rt', type: 'kcase', title: 'ت', knots: ['kn_rt'] });
    AS.DO.tour_add({ facet: { key: 'fk', kind: 'knot', title: 'ترس از تلفن' } }); const fk = s.tour.facets[s.tour.facets.length - 1]; AS.DO.tour_link({ facet: fk.key, id: 'kc_rt' }); AS.tourAfterTurn(s);
    const hold = AS.tourMilestones(fk).filter(m => /ماندگاری/.test(m.t)).map(m => m.t).join('|');
    APP.knotReturned('kn_rt'); const n0 = s.msgs.length; AS.tourAfterTurn(s);
    out.ret = /\(از /.test(hold) && s.msgs.slice(n0).some(m => /بازگشت/.test(m.text)) && ((s.tour.mailq || []).some(e => e.k === 'reopen') || (window.__mails || []).some(m => /دوباره باز شد/.test((m.subject || '') + (m.html || ''))));
    // یادآورها خاموش ⇒ یک بار صریح گفته می‌شود (نه سکوت)
    APP.HOST.remind = APP.HOST.remind || (async () => ({ ok: true })); const st = APP.S.settings(); st.knots = st.knots || {}; st.knots.notify = { telegram: false, email: false };
    AS.tourSyncReminder(s); AS.tourSyncReminder(s); out.remOff = s.msgs.filter(x => /یادآورها خاموش/.test(x.text)).length;
    return out;
  });
  chk(info.camp.title === 'مذاکرهٔ حقوق', 'session title is re-derived after an unrelated opener: ' + info.camp.title);
  chk(/^area\|dc_career_income\|.+\|sterr\|s_decision$/.test(info.camp.area), 'an area facet gets its area, a real title and the territory view: ' + info.camp.area);
  chk(info.camp.knowledge && info.camp.know, 'related territory knowledge goes into the prompt; the model can ask for areas (know) and gets them the same turn: ' + JSON.stringify([info.camp.knowledge, info.camp.know]));
  chk(info.camp.areaMs === '110', 'area facet milestones come from linked records (chain linked, follow-up scheduled, no outcome yet): ' + info.camp.areaMs);
  chk(info.camp.chainCalc === '{"prod":6,"min":20,"n":2}', 'worry chain: ceiling = weakest link, independent = product: ' + info.camp.chainCalc);
  chk(info.camp.correct && info.camp.toast, 'a claimed-but-failed action triggers a correction turn; page messages reach the next prompt');
  chk(info.camp.privacy, 'after a distress signal the e-mail carries no conversation text and has a help box; no unrelated Today items');
  chk(info.camp.brier === '{"n":1,"brier":0.64}' && info.camp.calDec && info.camp.chainView && info.camp.nav && info.camp.remOff === 1 && info.camp.vals === 'خانواده|خانواده ⟷ درآمد' && info.camp.valsToday && info.camp.valsView && /ورزشِ گره: ۱ درست از ۲ پاسخ در ۲ روز/.test(info.camp.scores) && info.camp.mindHook && info.camp.valsLinked && info.camp.badArea && info.camp.ret && info.camp.noMislink, 'forecast log scores Brier and feeds calibration; chain view; menu entries: ' + JSON.stringify(info.camp));

  // روند = نخستین تا آخرین ماهِ سنجیده (نه فقط دو ماهِ آخر)؛ تازه‌ترین رکوردها بر پایهٔ تاریخ در نقشه می‌مانند (کارزارِ سوم v05)
  info.trend2 = await p.evaluate(() => {
    const mk = (id, at, ok) => ({ id, type: 'kitem', knot: 'kn_tr', q: 'x', hist: [{ at, ok }] });
    APP.S.put({ id: 'kn_tr', type: 'knot', name: 'روند', fam: 'F4', status: 'practised', cases: [] });
    const rows = [['2026-07', [0, 0, 1]], ['2026-08', [1, 1, 0]], ['2026-09', [1, 1, 1]]];
    rows.forEach(([m, oks]) => oks.forEach((ok, i) => APP.S.put(Object.assign(mk('ki_tr_' + m + i, m + '-1' + i + 'T10:00:00Z', !!ok)))));
    const dims = APP.MIND.model().dims.filter(d => d.trend != null);
    APP.S.put({ id: 'kc_new_tr', type: 'kcase', kinds: ['problem'], intake: { what: 'تازه‌ترین موقعیت' }, created: '2099-01-01T10:00:00Z', updated: '2099-01-01T10:00:00Z', knots: [] });
    for (let i = 0; i < 20; i++) APP.S.put({ id: 'kc_old_tr' + i, type: 'kcase', kinds: ['problem'], intake: { what: 'قدیمی ' + i }, created: '2026-05-0' + (i % 9 + 1) + 'T10:00:00Z', updated: '2026-05-0' + (i % 9 + 1) + 'T10:00:00Z', knots: [] });
    const mm = APP.MIND.charts(APP.MIND.model()).mindmap; const svg = mm && (mm.outerHTML || String(mm));
    return { trendOk: dims.some(d => d.trendFrom && d.trendFrom < d.trendTo), newestKept: /تازه‌ترین موقعیت/.test(svg || '') };
  });
  chk(info.trend2.trendOk, 'trend runs from the first to the last measured month: ' + JSON.stringify(info.trend2));
  chk(info.trend2.newestKept, 'the newest record by date stays on the mind map even after many back-dated ones');
  console.log(JSON.stringify(info).slice(0, 2500));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
