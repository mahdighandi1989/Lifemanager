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
    const svgs = document.querySelectorAll('#main .mind-svg').length, rows = document.querySelectorAll('#main .mind-table tbody tr').length;
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

  // ---------- گزارشِ تور ----------
  info.rep = await p.evaluate(async () => {
    const AS = APP.ASSIST; window.__mails = [];
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
    APP.REPORT.note(s, before); await new Promise(r => setTimeout(r, 300));
    out.facetMail = __mails.length === 2 && /کامل شد/.test(__mails[1].subject) && /ریز/.test(__mails[1].html);
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
  chk(info.rep.off && info.rep.failKept && info.rep.retry && info.rep.drawer, 'off ⇒ nothing sent; failure keeps the events; retry sends; the drawer has the 📧 control');

  console.log(JSON.stringify(info).slice(0, 2500));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
