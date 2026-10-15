// دو ایرادِ کوچکِ بازبینیِ دورِ ۵ (۲۰۲۶-۱۰-۱۵): (۱) کارتِ «از تجربهٔ خودت» پیش از نمونه و ورزشِ حرکت؛
// (۲) «❔ پرسشِ همین لحظه» در مسئلهٔ اثباتی / «اثبات یا رد کن» پرسش‌های همان نوع (حکم/فرض) را می‌دهد، نه «به مجهول نگاه کن».
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  await p.goto(FILE); await p.waitForSelector('.nav');
  const order = await p.evaluate(async () => {
    APP.S.loaded = true; APP.go('move', 'mv_special'); await new Promise(r => setTimeout(r, 200));
    const all = [...document.querySelectorAll('#main section')], ix = sel => all.findIndex(s => s.matches(sel));
    const drill = all.findIndex(s => s.querySelector('.mv-drill, [class*="drill"]'));
    return { exp: ix('.mv-exp'), ex: ix('.mv-ex'), drill };
  });
  chk(order.exp >= 0 && (order.ex < 0 || order.exp < order.ex) && (order.drill < 0 || order.exp < order.drill), '«از تجربهٔ خودت» before worked example and drills ' + JSON.stringify(order));
  const ask = await p.evaluate(async () => {
    const out = {}, T = APP.SOLVE_TYPES;
    out.find = APP.solveAskList('p', 1, 'find').join(' ').includes('مجهول') || APP.solveAskList('p', 1).length > 0;
    out.prove = JSON.stringify(APP.solveAskList('p', 1, 'prove')) === JSON.stringify(T.prove.plan);
    out.pod = JSON.stringify(APP.solveAskList('p', 1, 'pod')) === JSON.stringify(T.pod.plan);
    // روی صفحه: مسئله‌ای که نوعش «اثباتی» ثبت شده
    const pid = APP.S.all('eproblem')[0] ? APP.S.all('eproblem')[0].id : (APP.EPI_PROBLEMS || window.EPI_PROBLEMS || [])[0].id;
    APP.S.put({ id: 'eprog_' + pid, type: 'eprog', lv: {}, solve: { type: 'prove', u: { 1: { done: true, u: 'حکم', d: 'فرض', c: 'بخش‌ها', self: 2, type: 'prove' } }, g: { 1: { guess: 'درست است' } }, b: {}, rev: {}, chk: {}, cps: [], incub: [], mot: [], lessons: [] } });
    APP.simState = { pid: pid, lv: 1, order: 'hist', i: 0 }; APP.go('e_prob', pid, 'sim'); await new Promise(r => setTimeout(r, 300));
    const el = document.querySelector('#main .sv-ask'); out.ph = el && el.getAttribute('data-ph');
    out.txt = el ? el.textContent : '';
    out.noUnknown = !/به مجهول نگاه کن/.test(out.txt);
    out.proveQ = el ? (out.ph !== 'p' || T.prove.plan.some(q => out.txt.includes(q.slice(0, 20)))) : null;
    out.why = el ? (out.ph !== 'p' || /فرض و حکم/.test(out.txt)) : null;
    return out;
  });
  chk(ask.find && ask.prove && ask.pod, 'ask list follows the problem type ' + JSON.stringify(ask));
  chk(ask.ph === null || (ask.noUnknown && ask.proveQ !== false && ask.why !== false), 'proof problem: ask-now card uses proof questions, not «به مجهول نگاه کن» ' + JSON.stringify({ ph: ask.ph, t: (ask.txt || '').slice(0, 200) }));
  console.log(JSON.stringify({ order, ask: Object.assign({}, ask, { txt: (ask.txt || '').slice(0, 120) }) }));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})().catch(e => { console.log('ERRORS ' + e.message); process.exit(1); });
