// «📚 منبع‌ها و پوشش» (مالک ۲۰۲۶-۱۰-۱۵): هر کتابِ بیرونی مورد‌به‌مورد با سامانه — در صفحه، در گرافِ مشترک و برای دستیار.
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
  info.s = await p.evaluate(async () => {
    APP.S.loaded = true; const out = {}, SR = APP.SOURCES, src = SR.all()[0];
    out.polya = !!src && src.items.length >= 800 && Object.keys(src.coverage.verdicts).length === src.items.length;
    const C = SR.counts(src); out.counts = C['عمیق'] + C['سطحی'] + C['ندارد'] + C['نامربوط'] === src.items.length;
    APP.go('sources'); await new Promise(r => setTimeout(r, 200));
    const main = document.getElementById('main').innerText;
    out.view = /منبع‌ها و پوشش/.test(main) && /چگونه آن را حل کنیم/.test(main) && document.querySelectorAll('#main .src-sec').length > 20;
    APP.go('sources', src.id, 'ندارد'); await new Promise(r => setTimeout(r, 150));
    out.filter = [...document.querySelectorAll('#main .src-it .pill')].every(x => x.textContent === 'ندارد') && document.querySelectorAll('#main .src-it').length === C['ندارد'];
    // پیوند به تونلِ واقعی (حرکت)
    APP.go('sources', src.id, ''); await new Promise(r => setTimeout(r, 150));
    const mv = [...document.querySelectorAll('#main .src-it button.linkish')].find(x => /move:/.test(x.textContent));
    if (mv) { mv.click(); await new Promise(r => setTimeout(r, 150)); out.nav = APP.state.view === 'move'; } else out.nav = false;
    const M = APP.GRAPH.build(); const items = Object.keys(M.nodes).filter(k => /^srcitem:/.test(k));
    out.graph = items.length === src.items.length && M.edges.filter(e => e.rel === 'covers').length > 200;
    const hk = msg => APP.ASSIST.promptHooks.map(f => { try { return f({ msgs: [] }, msg) || ''; } catch (e) { return ''; } }).join('\n');
    out.hook = /# منبع‌ها و پوشش/.test(hk('این کتاب در سامانه هست؟')) && !/# منبع‌ها و پوشش/.test(hk('سلام')) && /lla-sources/.test(hk('کتاب'));
    out.menu = APP.SUB_VIEWS.sources === 'maps';   // فقط از «🗺 نقشه‌ها» باز می‌شود (بازبینیِ متقابلِ ۲۰۲۶-۱۰-۱۵؛ a21 SUB_VIEWS)
    return out;
  });
  chk(Object.values(info.s).every(Boolean), 'every source item with its verdict, filterable, linked to the real tunnel, in the shared graph, known to the assistant: ' + JSON.stringify(info.s));
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
