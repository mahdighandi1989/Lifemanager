// «🗺 نقشه‌ها» و گرافِ مشترکِ زنده (مالک ۲۰۲۶-۱۰-۱۴): همه از داده ساخته می‌شود، نه دستی.
// ۱) پوشش: هر عضوِ هر ثبت‌گاه (تکنیک، فاز، پروتکل، هفته، دغدغه، گامِ سفر، حرکت، خانوادهٔ گره، سالن، ایستگاه، قاعده، فصل، بخش، اصل، قضیه، پایه،
//    گروه و حوزهٔ قلمرو، یافته، پیشنهاد، سامانه و حوزهٔ قلمروِ سامانه‌ها، نما) یک گره است؛ هر یال دو سرِ موجود دارد؛ پل‌های ثبت‌شده همه هستند.
//    هر نوعِ G.TYPES دقیقاً یک ورودیِ پوشش دارد (ثبت‌گاه یا رکوردِ کاربر)؛ هر window.EPI_* / SYS_* و هر نوعِ رکوردِ S یا به نوعی از گراف
//    نگاشته شده یا در فهرستِ صریحِ «بیرون از گراف» با دلیل آمده — ثبت‌گاهِ تازهٔ بی‌سیم (ممیزیِ اجرا ۲۰۲۶-۱۰-۱۵) قرمز می‌شود.
// ۲) زنده: گره/موقعیت/قاعدهٔ تازه بی هیچ کارِ دیگری در گراف ظاهر می‌شود (همان لحظه)، با پیوندهایش.
// ۳) نما: «🗺 نقشه‌ها» در هر دو منو؛ همهٔ نقشه‌های پیشین هنوز هستند و ذیلِ گروهِ «🗺 نقشه‌ها»؛ نمای کلان، اعضا، کانون، جستجو، شکاف‌ها؛
//    نقشهٔ ذهن به معرفت‌شناسی وصل است؛ ۳۹۰px.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
/* نگاشتِ ثبت‌گاه‌های سراسری ⇒ نوعِ گراف. هر window.EPI_* / SYS_* / EPI باید این‌جا یا در NON_GRAPH_GLOBALS باشد. */
const GLOBAL_MAP = { EPI: 'hall', EPI_ST: 'station', EPI_RULES: 'rule', EPI_BOOK: 'section', EPI_FOUND: 'theorem', EPI_TERR: 'area', EPI_CO: 'concept',
  EPI_DR: 'drill', EPI_DOS: 'dossier', EPI_BT_LEDGER: 'event', SYS_TERR: 'sarea',
  EPI_PROBLEMS: 'prob' };   // مسئله‌های آمادهٔ سازنده: فقط با «نمونه‌های آمادهٔ سازنده» گره‌اند؛ وگرنه شمارشان در «شکاف‌ها» (پایین آزموده می‌شود)
/* سراسری‌های بیرون از گراف — هر کدام با دلیل؛ افزودن به این فهرست یعنی تصمیم که «این ثبت‌گاه نیست» */
const NON_GRAPH_GLOBALS = {
  EPI_FEAT: 'پرسش‌های فرمِ موتور (ورودیِ داوری، نه موجودیت)',
  EPI_FM: 'مدلِ فرم‌های ایستگاه‌ها (نما، نه موجودیت)',
  EPI_PIPE: 'ترتیبِ اجرای همان ایستگاه‌ها (گره‌ها از EPI_ST)',
  EPI_CASES: 'بذرِ وقایع — در گراف از راهِ EPI_BT_LEDGER.results (event) می‌آیند',
  EPI_BLIND: 'رمزگذاریِ کورِ همان وقایع (دادهٔ آزمون، نه موجودیت)',
  EPI_FIELD: 'داوریِ رشته برای همان وقایع (حکم، نه موجودیت)',
  EPI_BT: 'توابعِ هستهٔ بک‌تست (کد)',
  SYS_TERR_LEDGER: 'گامِ هر حوزهٔ همان SYS_TERR (وضع، نه موجودیت)'
};
/* نوعِ رکوردِ کاربر (S) ⇒ نوعِ گراف */
const REC_MAP = { topic: 'topic', tree: 'tree', fnode: 'fnode', knot: 'knot', kcase: 'kcase', kitem: 'kitem', seedling: 'seedling', struct: 'struct',
  case: 'ecase', eprob: 'prob', achat: 'tour', prereq: 'prereq', wchain: 'wchain', fcast: 'fcast', value: 'value', meaning: 'meaning', kexp: 'kexp',
  ex: 'ex', pr: 'prun', card: 'card', pbitem: 'pbitem', deadline: 'deadline', psyans: 'psyans', idea: 'idea' };
/* نوع‌های رکوردِ بیرون از گراف — هر کدام با دلیل */
const NON_GRAPH_RECS = {
  set: 'تنظیمات', course: 'پیشرفتِ دوره (درس‌ها گره‌اند)', epi_course: 'پیشرفتِ دورهٔ سنجش', eprog: 'پیشرفتِ هر مسئله (مسئله گره است)',
  mvprog: 'شمارِ پاسخ‌های حرکت‌ها (حرکت‌ها گره‌اند)', simsp: 'موعدِ مرورِ گام‌های شبیه‌ساز (مسئله گره است)', concern: 'یادداشتِ تو روی دغدغهٔ ثابت (دغدغه گره است)', sched: 'زمان‌بندِ یادآور',
  srcq: 'صفِ منابعِ خواندنی (بی ارجاع)', ebt: 'دفترِ اجرای سه آزمون', ecyc: 'دفترِ چرخهٔ بک‌تست', eliving: 'نسخه‌های جزوهٔ زنده', erules: 'تأییدِ نسخهٔ قاعده‌ها',
  ebtp: 'تصمیمِ مالک روی پیشنهاد/واقعه (پیشنهاد/واقعه گره‌اند)', eaut: 'اختلاف برای داوری (واقعه گره است)',
  ecase: 'واقعهٔ پیش‌نویسِ بک‌تست — پس از دور، «event» می‌شود', edrill: 'نمرهٔ تمرینِ ایستگاه (تمرین گره است)'
};
const HTML_INPUT = new Set(['text', 'number', 'date', 'password', 'range', 'search', 'checkbox', 'email', 'file', 'url', 'tel', 'color', 'time', 'hidden', 'radio', 'button', 'submit']);
function sourceRecordTypes() {
  const dir = path.join(__dirname, '..', 'src', 'app'), s = new Set();
  for (const f of fs.readdirSync(dir).filter(f => /^a\d+_.*\.js$/.test(f))) {
    const t = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const m of t.matchAll(/S\.all\("([a-z_]+)"/g)) s.add(m[1]);
    for (const m of t.matchAll(/\{\s*id:\s*[^{}]{0,160}?\btype:\s*"([a-z_]+)"/g)) if (!HTML_INPUT.has(m[1])) s.add(m[1]);
  }
  return [...s];
}
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
      ['drill', EPI_DR.map(x => x.id)], ['dossier', EPI_DOS.map(x => x.id)], ['event', EPI_BT_LEDGER.results.cases.map(x => x.id)], ['tool', ['FARM', 'ATLAS']],
      ['ssys', SYS_TERR.systems.map(m => m.id)], ['sarea', [].concat(...SYS_TERR.systems.map(m => [].concat(...m.groups.map(g => g.areas.map(a => a.id)))))],
      ['view', Object.keys(APP.V)], ['psyc', APP.PSY.CONSTRUCTS.map(c => c.id)], ['src', (window.SRC_COV || []).map(s => s.id)], ['srcitem', [].concat(...(window.SRC_COV || []).map(s => s.items.map(i => s.id + '/' + i.id)))]];
    reg.forEach(([t, ids]) => ids.forEach(id => { if (!has(t, id)) miss.push(t + ':' + id); }));
    const dangling = M.edges.filter(e => !M.nodes[e.a] || !M.nodes[e.b]).length;
    const stTech = EPI_ST.reduce((n, s) => n + (s.tech || []).length, 0), famSt = APP.KF.reduce((n, f) => n + (f.epi || []).length, 0);
    const br = M.edges.filter(e => e.rel === 'bridge').length;
    const unknownType = Object.values(M.nodes).filter(n => !APP.GRAPH.TM[n.t]).length;
    const G2 = APP.GRAPH.gaps(M);
    /* سراسری‌ها و نوع‌های رکوردِ زمانِ اجرا (برای وارسیِ «بی‌سیم» در Node) */
    const globals = Object.keys(window).filter(k => /^(EPI|SYS)_/.test(k) || k === 'EPI');
    const TA = EPI_BT_LEDGER.territory.areas, thPairs = new Set();
    Object.keys(TA).forEach(a => (TA[a].claims || []).forEach(c => { if (c.th) thPairs.add('area:' + a + '|' + (EPI_FOUND.TH[c.th] ? 'theorem:' : 'axiom:') + c.th); }));
    const eset = new Set(M.edges.filter(e => e.rel === 'basis').map(e => e.a + '|' + e.b)), claimTh = thPairs.size, claimMissing = [...thPairs].filter(x => !eset.has(x));
    return { broken: G2.broken.length, brokenSample: G2.broken.slice(0, 5), dups: G2.dups.map(d => d.id).sort().join(), n: Object.keys(M.nodes).length, e: M.edges.length, miss: miss.slice(0, 10), nmiss: miss.length, dangling, stTech, famSt, br, gapBridges: G2.bridges, unknownType,
      ruleAt: M.edges.filter(e => e.rel === 'at' && M.nodes[e.a].t === 'rule').length, regTypes: reg.map(r => r[0]), types: APP.GRAPH.TYPES.map(x => x.t),
      globals, recTypes: [...new Set(APP.S.all().map(r => r.type))], claimTh, claimMissing, areaBasis: M.edges.filter(e => e.rel === 'basis' && M.nodes[e.a].t === 'area').length,
      sareaView: M.edges.filter(e => M.nodes[e.a].t === 'sarea' && M.nodes[e.b].t === 'view').length, hidden: G2.hiddenSamples, nProb: (window.EPI_PROBLEMS || []).length };
  });
  /* دادهٔ کاربر: یک رکورد از هر نوعِ نگاشته‌شده با ارجاع‌های درست ⇒ گره + یال‌ها، بی ارجاعِ شکسته */
  info.user = await p.evaluate(() => {
    const S = APP.S, now = new Date().toISOString(), st0 = EPI_ST[0].id, ids = [];
    const put = r => { ids.push(r.id); S.put(r); };
    put({ id: 'tp_gu', type: 'topic', title: 'موضوعِ آزمونِ پوشش', journey: { step: APP.C.PIPELINE[0].k } });
    put({ id: 'tr_gu', type: 'tree', name: 'درختِ آزمون' }); put({ id: 'fn_gu', type: 'fnode', tree: 'tr_gu', title: 'مفهومِ آزمون', deps: [] });
    put({ id: 'knot_gu', type: 'knot', name: 'گرهِ آزمونِ پوشش', fam: 'F2', links: [], status: 'open' });
    put({ id: 'kc_gu', type: 'kcase', title: 'موقعیتِ آزمونِ پوشش', knots: ['knot_gu'], root: { primary: 'F2' }, topic: 'tp_gu' });
    put({ id: 'ki_gu', type: 'kitem', knot: 'knot_gu', prompt: 'تمرینِ پوشش', hist: [] });
    put({ id: 'sd_gu', type: 'seedling', text: 'نهالِ آزمون', src: { type: 'knot', id: 'knot_gu' } });
    put({ id: 'st_gu', type: 'struct', fa: 'ساختارِ تو' });
    put({ id: 'cs_gu', type: 'case', title: 'پروندهٔ آزمونِ پوشش', st: { [st0]: { done: true, data: {} } }, src: { type: 'kcase', id: 'kc_gu' } });
    const pr = JSON.parse(JSON.stringify(EPI_PROBLEMS[0])); pr.id = 'pb_gu'; pr.title = 'مسئلهٔ آزمونِ پوشش';
    put({ id: 'ep_gu', type: 'eprob', status: 'approved', p: pr, origin: { type: 'kcase', id: 'kc_gu' } });
    put({ id: 'pq_gu', type: 'prereq', title: 'پیش‌نیازِ آزمون', items: [{ concept: 'احتمال', self: 'بلد نیستم', topic: 'tp_gu' }], kcase: 'kc_gu' });
    put({ id: 'ach_gu', type: 'achat', title: 'تورِ آزمون', msgs: [], tour: { createdAt: now, facets: [{ key: 'f1', title: 'وجهِ آزمون', refs: [{ id: 'kc_gu', type: 'kcase' }, { id: 'pq_gu', type: 'prereq' }, { id: 'cs_gu', type: 'case' }, { id: 'ep_gu', type: 'eprob' }] }] } });
    put({ id: 'wc_gu', type: 'wchain', title: 'زنجیرهٔ آزمون', feel: 60, links: [] });
    put({ id: 'fc_gu', type: 'fcast', q: 'پیش‌بینیِ آزمون', p: 70, dim: 's_decision' });
    put({ id: 'vl_gu1', type: 'value', title: 'خانوادهٔ آزمون', vs: [{ with: 'درآمدِ آزمون', rule: '' }] }); put({ id: 'vl_gu2', type: 'value', title: 'درآمدِ آزمون', vs: [] });
    put({ id: 'mn_gu', type: 'meaning', date: APP.today(), presence: 5, search: 4 });
    put({ id: 'kx_gu', type: 'kexp', knot: 'knot_gu', plan: 'آزمایشِ آزمون', status: 'planned' });
    put({ id: 'ex_gu', type: 'ex', tid: 5, topic: 'tp_gu', status: 'draft', data: {}, rubric: [] });
    put({ id: 'pr_gu', type: 'pr', pid: APP.C.PROTOCOLS[0].id, topic: 'tp_gu', status: 'draft', data: {} });
    put({ id: 'cd_gu', type: 'card', q: 'کارتِ آزمون', a: 'x', tid: 5, knot: 'knot_gu', hist: [] });
    put({ id: 'pbi_gu', type: 'pbitem', pid: 'pb_gu', prompt: 'هم‌ساختارِ آزمون', hist: [] });
    window.PSY_NORMS = { items: [{ id: 'it_gu', construct: 'Gf', text: 'معمای آزمون' }], sources: [] };
    put({ id: 'pa_gu', type: 'psyans', item: 'it_gu', ok: true, at: new Date().toISOString() });
    put({ id: 'id_gu', type: 'idea', what: 'ایدهٔ آزمون', title: 'ایدهٔ آزمون', sess: 'ach_gu', parts: [{ k: 'assumption', t: 'فرض', caseId: 'cs_gu' }] });
    put({ id: 'dl_gu', type: 'deadline', what: 'موعدِ آزمون', date: APP.addDays(APP.today(), 3), sess: 'ach_gu', done: false });
    const M = APP.GRAPH.build(), nb = k => (M.adj[k] || []).map(i => M.edges[i]).map(e => e.a === k ? e.b : e.a);
    const want = { topic: 'tp_gu', tree: 'tr_gu', fnode: 'fn_gu', knot: 'knot_gu', kcase: 'kc_gu', kitem: 'ki_gu', seedling: 'sd_gu', struct: 'st_gu', ecase: 'cs_gu', prob: 'pb_gu',
      prereq: 'pq_gu', tour: 'ach_gu', tfacet: 'ach_gu/f1', wchain: 'wc_gu', fcast: 'fc_gu', value: 'vl_gu1', meaning: 'mn_gu', kexp: 'kx_gu', ex: 'ex_gu', prun: 'pr_gu', card: 'cd_gu', pbitem: 'pbi_gu', deadline: 'dl_gu', psyans: 'pa_gu', idea: 'id_gu' };
    const absent = Object.keys(want).filter(t => !M.nodes[t + ':' + want[t]]);
    const links = { prereqCase: nb('prereq:pq_gu').includes('kcase:kc_gu'), prereqTopic: nb('prereq:pq_gu').includes('topic:tp_gu'),
      facet: ['kcase:kc_gu', 'prereq:pq_gu', 'ecase:cs_gu', 'prob:pb_gu', 'tour:ach_gu'].every(k => nb('tfacet:ach_gu/f1').includes(k)),
      kexp: nb('kexp:kx_gu').includes('knot:knot_gu'), ex: nb('ex:ex_gu').includes('tech:5') && nb('ex:ex_gu').includes('topic:tp_gu'),
      prun: nb('prun:pr_gu').includes('proto:' + APP.C.PROTOCOLS[0].id), card: nb('card:cd_gu').includes('tech:5') && nb('card:cd_gu').includes('knot:knot_gu'),
      pbitem: nb('pbitem:pbi_gu').includes('prob:pb_gu'), deadline: nb('deadline:dl_gu').includes('tour:ach_gu'), psyans: nb('psyans:pa_gu').includes('psyc:Gf'), idea: nb('idea:id_gu').includes('ecase:cs_gu') && nb('idea:id_gu').includes('tour:ach_gu'), value: nb('value:vl_gu1').includes('value:vl_gu2'), fcast: nb('fcast:fc_gu').includes('ssys:s_decision'),
      views: ['wchain:wc_gu', 'meaning:mn_gu'].every(k => nb(k).some(x => /^view:/.test(x))) };
    const broken = APP.GRAPH.gaps(M).broken.map(b => b.a + '→' + b.missing);
    /* ارجاعِ شکستهٔ دادهٔ کاربر گزارش می‌شود: پیش‌نیاز به موقعیتِ پاک‌شده، وجهِ تور به گرهِ ناموجود */
    S.put({ id: 'pq_gu_bad', type: 'prereq', title: 'شکسته', items: [], kcase: 'kc_gone' });
    const brk2 = APP.GRAPH.gaps().broken.some(b => b.missing === 'kcase:kc_gone'); S.del('pq_gu_bad');
    ids.forEach(id => S.del(id));
    return { absent, links, broken, brk2, types: Object.keys(want) };
  });
  const src = sourceRecordTypes();
  info.wired = {
    typesNoCoverage: info.cov.types.filter(t => !info.cov.regTypes.includes(t) && !info.user.types.includes(t)),
    coverageTwice: info.cov.regTypes.filter(t => info.user.types.includes(t)).filter(t => t !== 'struct'),   // struct: هم ثبت‌گاهِ اطلس هم ساختارِ ساختهٔ تو
    coverageUnknown: info.cov.regTypes.concat(info.user.types).filter(t => !info.cov.types.includes(t)),
    globalsUnwired: info.cov.globals.filter(g => !GLOBAL_MAP[g] && !NON_GRAPH_GLOBALS[g]),
    globalMapBad: Object.keys(GLOBAL_MAP).filter(g => !info.cov.types.includes(GLOBAL_MAP[g])),
    recsUnwired: [...new Set(src.concat(info.cov.recTypes))].filter(r => !REC_MAP[r] && !NON_GRAPH_RECS[r]),
    recMapBad: Object.keys(REC_MAP).filter(r => !info.cov.types.includes(REC_MAP[r]))
  };
  chk(!info.wired.typesNoCoverage.length && !info.wired.coverageUnknown.length && !info.wired.coverageTwice.length, 'one coverage entry per G.TYPES type ' + JSON.stringify(info.wired));
  chk(!info.wired.globalsUnwired.length && !info.wired.globalMapBad.length, 'every EPI_*/SYS_* global is mapped to a graph type or explicitly non-graph: ' + info.wired.globalsUnwired + ' ' + info.wired.globalMapBad);
  chk(!info.wired.recsUnwired.length && !info.wired.recMapBad.length, 'every record type is mapped to a graph type or explicitly non-graph: ' + info.wired.recsUnwired + ' ' + info.wired.recMapBad);
  chk(!info.user.absent.length && Object.values(info.user.links).every(Boolean) && !info.user.broken.length && info.user.brk2, 'user records of every mapped type are nodes with their links, no broken refs ' + JSON.stringify(info.user));
  chk(info.cov.claimTh > 0 && !info.cov.claimMissing.length, 'territory claims tie areas to their axioms/theorems ' + JSON.stringify([info.cov.claimTh, info.cov.claimMissing.slice(0, 5)]));
  chk(info.cov.sareaView > 0, 'system-territory view: refs are view nodes');
  chk(info.cov.gapBridges === info.cov.br, '«پل میانِ دو سامانه» counts only recorded bridges ' + JSON.stringify([info.cov.gapBridges, info.cov.br]));
  chk(info.cov.hidden === info.cov.nProb, 'library problems hidden by default are counted in the gaps panel ' + JSON.stringify([info.cov.hidden, info.cov.nProb]));
  info.samples = await p.evaluate(() => { const st = APP.S.settings(); const old = st.samples; st.samples = true; APP.S.saveSettings(st);
    const M = APP.GRAPH.build(), ok = EPI_PROBLEMS.every(x => M.nodes['prob:' + x.id]), hid = APP.GRAPH.gaps(M).hiddenSamples, br = APP.GRAPH.gaps(M).broken.length;
    st.samples = old; APP.S.saveSettings(st); return { ok, hid, br }; });
  chk(info.samples.ok && info.samples.hid === 0 && info.samples.br === 0, 'with builder samples on, every library problem is a node ' + JSON.stringify(info.samples));
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
  info.hub = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('main .gr-mapcard')].map(c => c.dataset.v + '|' + c.textContent);
    const inMaps = sys => { const L = [...document.querySelectorAll('.navlist[data-sys="' + sys + '"] > *')]; let g = null, out = [];
      L.forEach(el => { if (el.classList.contains('navg')) g = el.textContent; else if (el.dataset && el.dataset.v === 'prereq') out.push(g); }); return out; };
    return { prereq: cards.some(c => /^prereq\|/.test(c)), whole: cards.some(c => /^whole\|/.test(c)),
      counts: cards.some(c => /^map\|/.test(c) && c.indexOf(APP.fa(APP.T.length) + ' تکنیک') >= 0 && c.indexOf(APP.fa(APP.C.PHASES.length) + ' فاز') >= 0) &&
        cards.some(c => /^e_map\|/.test(c) && c.indexOf(APP.fa(EPI_ST.length) + ' ایستگاه') >= 0 && c.indexOf(APP.fa(EPI.HALLS.length) + ' سالن') >= 0),
      navLearn: inMaps('learn'), navEpi: inMaps('epi'), hiddenNote: (document.querySelector('main .gr-hidden') || {}).textContent || '', hidN: APP.fa(EPI_PROBLEMS.length) };
  });
  chk(info.hub.prereq && info.hub.whole && info.hub.counts, 'hub has «🧩 نقشهٔ پیش‌نیازها» and «🧭 این برنامه چیست؟», counts derived from the registries ' + JSON.stringify(info.hub));
  chk(['navLearn', 'navEpi'].every(k => info.hub[k].some(g => /نقشه‌ها/.test(g)) && info.hub[k].some(g => /ابزارهای ذهن/.test(g))), 'prereq under «🗺 نقشه‌ها» in both menus, «🧰 ابزارهای ذهن» entry kept ' + JSON.stringify(info.hub));
  chk(/پنهان/.test(info.hub.hiddenNote) && info.hub.hiddenNote.indexOf(info.hub.hidN) >= 0, 'gaps panel says library problems are hidden, with the count ' + info.hub.hiddenNote);
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
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
