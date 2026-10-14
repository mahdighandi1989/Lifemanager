// «🗺 نقشه‌ها» و گرافِ مشترکِ زنده (مالک ۲۰۲۶-۱۰-۱۴): همه از داده ساخته می‌شود، نه دستی.
// ۱) پوشش: هر عضوِ هر ثبت‌گاه (تکنیک، فاز، پروتکل، هفته، دغدغه، گامِ سفر، حرکت، خانوادهٔ گره، سالن، ایستگاه، قاعده، فصل، بخش، اصل، قضیه، پایه،
//    گروه و حوزهٔ قلمرو، یافته، پیشنهاد) یک گره است؛ هر یال دو سرِ موجود دارد؛ پل‌های ثبت‌شده (ایستگاه⇄تکنیک، خانواده⇄ایستگاه) همه هستند.
// ۲) زنده: گره/موقعیت/قاعدهٔ تازه بی هیچ کارِ دیگری در گراف ظاهر می‌شود (همان لحظه)، با پیوندهایش.
// ۳) نما: «🗺 نقشه‌ها» در هر دو منو؛ همهٔ نقشه‌های پیشین هنوز هستند و ذیلِ گروهِ «🗺 نقشه‌ها»؛ نمای کلان، اعضا، کانون، جستجو، شکاف‌ها؛
//    نقشهٔ ذهن به معرفت‌شناسی وصل است؛ ۳۹۰px.
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
  info.cov = await p.evaluate(() => {
    const M = APP.GRAPH.build(), has = (t, id) => !!M.nodes[t + ':' + id], C = APP.C, miss = [];
    const reg = [['tech', APP.T.map(t => t.id)], ['phase', C.PHASES.map(x => x.n)], ['proto', C.PROTOCOLS.map(x => x.id)], ['week', C.CURRICULUM.map(x => x.w)],
      ['concern', C.CONCERNS.map(x => x.id)], ['jstep', C.PIPELINE.map(x => x.k)], ['move', APP.MOVE_LIST.map(x => x.id)], ['kfam', APP.KF.map(x => x.id)],
      ['hall', EPI.HALLS.map(x => x.n)], ['station', EPI_ST.map(x => x.id)], ['rule', EPI_RULES.map(x => x.id)], ['chapter', EPI_BOOK.ch.map(x => x.id)],
      ['section', Object.keys(EPI_BOOK.sec)], ['axiom', EPI_FOUND.AX.map(x => x.id)], ['theorem', Object.keys(EPI_FOUND.TH)], ['base', Object.keys(EPI_FOUND.BASE)],
      ['tgroup', EPI_TERR.groups.map(g => g.id)], ['area', [].concat(...EPI_TERR.groups.map(g => g.areas.map(a => a.id)))],
      ['finding', EPI_BT_LEDGER.findings.findings.map(f => f.id)], ['proposal', EPI_BT_LEDGER.proposals.proposals.map(x => x.id)],
      ['lesson', APP.COURSE_LESSONS.map(l => (l.pid || l.tid) + '@' + l.w)], ['struct', C.STRUCTURES.map(x => x.id)], ['concept', EPI_CO.map(x => x.id)],
      ['drill', EPI_DR.map(x => x.id)], ['dossier', EPI_DOS.map(x => x.id)], ['event', EPI_BT_LEDGER.results.cases.map(x => x.id)], ['tool', ['FARM', 'ATLAS']]];
    reg.forEach(([t, ids]) => ids.forEach(id => { if (!has(t, id)) miss.push(t + ':' + id); }));
    const dangling = M.edges.filter(e => !M.nodes[e.a] || !M.nodes[e.b]).length;
    const stTech = EPI_ST.reduce((n, s) => n + (s.tech || []).length, 0), famSt = APP.KF.reduce((n, f) => n + (f.epi || []).length, 0);
    const br = M.edges.filter(e => e.rel === 'bridge').length;
    const unknownType = Object.values(M.nodes).filter(n => !APP.GRAPH.TM[n.t]).length;
    const G2 = APP.GRAPH.gaps(M);
    return { broken: G2.broken.length, dups: G2.dups.map(d => d.id).sort().join(), n: Object.keys(M.nodes).length, e: M.edges.length, miss: miss.slice(0, 10), nmiss: miss.length, dangling, stTech, famSt, br, unknownType, ruleAt: M.edges.filter(e => e.rel === 'at' && M.nodes[e.a].t === 'rule').length };
  });
  chk(info.cov.nmiss === 0, 'every registry member is a node: missing ' + info.cov.miss);
  chk(info.cov.dangling === 0 && info.cov.unknownType === 0, 'no dangling edges or unknown node types');
  chk(info.cov.broken === 0, 'self-check: no broken references in the shipped data');
  chk(info.cov.dups === '', 'no double definitions (the three found on 2026-10-14 were merged, WORKLOG 42) ' + info.cov.dups);
  info.dupDetect = await p.evaluate(() => { EPI_CO.push({ id: 'c_kezb', fa: 'آزمونِ دوگانه' }); const d = APP.GRAPH.gaps().dups.map(x => x.id); EPI_CO.pop(); return d.indexOf('c_kezb') >= 0; });
  chk(info.dupDetect, 'self-check still reports a new double definition');
  info.brk = await p.evaluate(() => { APP.S.put({ id: 'knot_gt0', type: 'knot', name: 'گرهِ پیوندِ شکسته', fam: 'F2', links: [{ to: 'knot_gone', rel: 'related' }], status: 'open' });
    const g = APP.GRAPH.gaps(); APP.S.del ? APP.S.del('knot_gt0') : null; return g.broken.some(b => b.missing === 'knot:knot_gone'); });
  chk(info.brk, 'a broken user link is reported, not silently dropped');
  chk(info.cov.br >= info.cov.stTech && info.cov.famSt > 0, 'all recorded bridges present ' + JSON.stringify(info.cov));
  chk(info.cov.ruleAt === await p.evaluate(() => EPI_RULES.length), 'every rule tied to its station');
  // ۲) زنده: گرهِ تازه + موقعیت + قاعدهٔ تازه
  info.live = await p.evaluate(() => {
    const before = Object.keys(APP.GRAPH.build().nodes).length;
    APP.S.put({ id: 'knot_gt1', type: 'knot', name: 'گرهِ آزمونِ گراف', fam: 'F1', cases: [], links: [], status: 'open' });
    APP.S.put({ id: 'kc_gt1', type: 'kcase', title: 'موقعیتِ آزمون', knots: ['knot_gt1'], root: { primary: 'F1' } });
    EPI_RULES.push({ id: 'r_gt_tmp', st: 'st_aql', sec: ['s40'], fa: 'قاعدهٔ آزمونی', eff: 'flag', when: { f: 'x', eq: 1 } });
    const M = APP.GRAPH.build(); EPI_RULES.pop();
    const nb = k => (M.adj[k] || []).map(i => M.edges[i]).map(e => e.a === k ? e.b : e.a);
    return { grew: Object.keys(M.nodes).length - before, knotFam: nb('knot:knot_gt1').indexOf('kfam:F1') >= 0, caseKnot: nb('kcase:kc_gt1').indexOf('knot:knot_gt1') >= 0,
      famStation: nb('kfam:F1').some(k => /^station:/.test(k)), rule: nb('rule:r_gt_tmp').indexOf('station:st_aql') >= 0 };
  });
  chk(info.live.grew === 3 && info.live.knotFam && info.live.caseKnot && info.live.famStation && info.live.rule, 'new data appears instantly with its links ' + JSON.stringify(info.live));
  // ۳) نما و منو
  info.nav = await p.evaluate(() => ({ kmapEpi: !!document.querySelector('.navlist[data-sys="epi"] .nav[data-v="kmap"]'), maps: document.querySelectorAll('.nav[data-v="maps"]').length, groups: [...document.querySelectorAll('.navg')].filter(g => /نقشه‌ها/.test(g.textContent)).length,
    old: ['map', 'kmap', 'e_map', 'whole', 'farm'].every(v => document.querySelector('.nav[data-v="' + v + '"]')) }));
  chk(info.nav.kmapEpi, 'mind map also in the epistemology menu');
  await p.evaluate(() => APP.go('map', null, 'graph')); await p.waitForTimeout(250);
  chk(await p.locator('main .gr-box.gr-epi').count() === 0 && await p.locator('main .gr-box.gr-learn').count() >= 8, 'learning map has its complete learning graph tab');
  await p.evaluate(() => APP.go('e_map', null, 'graph')); await p.waitForTimeout(250);
  chk(await p.locator('main .gr-box.gr-learn').count() === 0 && await p.locator('main .gr-box.gr-epi').count() >= 12, 'factory map has its complete epistemology graph tab');
  await p.evaluate(() => APP.go('e_map')); await p.waitForTimeout(150);
  chk(await p.locator('main .hallflow').count() === 1, 'factory halls view unchanged');
  chk(info.nav.maps === 1 && info.nav.groups === 2 && info.nav.old, 'one hub, «🗺 نقشه‌ها» group in each system, no map removed ' + JSON.stringify(info.nav));
  await p.evaluate(() => APP.go('maps')); await p.waitForTimeout(300);
  chk(await p.locator("main .gr-mapcard").count() >= 7 && await p.locator('main .gr-box').count() >= 15, 'hub cards and overview boxes');
  await p.click('main .gr-box[data-t="station"]'); await p.waitForTimeout(150);
  chk(await p.locator('main .gr-members button').count() === await p.evaluate(() => EPI_ST.length), 'type members listed');
  await p.click('main .gr-members button[data-k="station:st_grade"]'); await p.waitForTimeout(200);
  chk(await p.locator('main .gr-focus .gr-node').count() >= 5 && await p.locator('main .gr-focus line.cross').count() >= 1, 'focus view with cross-system links');
  await p.fill('main .gr-q', 'آگاهی فراشناختی'); await p.waitForTimeout(150);
  chk(await p.locator('main .gr-hit').count() >= 1, 'search');
  chk(await p.locator('main .gr-gaps details').count() === 5 && await p.locator('main .gr-broken').count() === 1, 'gaps and self-check listed');
  // نقشهٔ ذهن ⇄ معرفت‌شناسی
  await p.evaluate(() => APP.go('kmap')); await p.waitForTimeout(250);
  await p.locator('main .km-n[data-id="knot_gt1"]').focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  info.km = await p.evaluate(() => ({ epi: !!document.querySelector('main .km-epi'), btn: !!document.querySelector('main .km-graph'), txt: (document.querySelector('main .km-epi') || {}).textContent }));
  await p.click('main .km-graph'); await p.waitForTimeout(250);
  chk(await p.evaluate(() => APP.state.view) === 'maps' && /گرهِ آزمونِ گراف/.test(await p.locator('main .gr-focus').innerHTML()), 'mind map ⇒ the same knot focused in the shared graph');
  chk(info.km.epi && info.km.btn && /ایستگاه|تصور یا تصدیق/.test(info.km.txt || '') , 'mind map drawer links to epistemology and the shared graph ' + JSON.stringify(info.km));
  await p.setViewportSize({ width: 390, height: 800 }); await p.evaluate(() => APP.go('maps')); await p.waitForTimeout(200);
  chk(await p.evaluate(() => document.documentElement.scrollWidth <= 392), 'no horizontal overflow at 390px');
  console.log(JSON.stringify(info).slice(0, 600));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
