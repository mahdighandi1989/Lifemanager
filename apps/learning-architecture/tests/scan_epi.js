const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto('file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html')); await p.waitForSelector('.nav');
  const r = await p.evaluate(() => {
    const out = {}; const re = /\b(st|dos|d|c|r|cs|pb|sy)_[a-z0-9_]+|\bs\d{1,2}\b|\b(claims|grades|ways|verdict)\b/g;
    function check(v) { APP.go(...v); const t = document.querySelector('main').innerText; const m = t.match(re) || []; m.forEach(x => out[x] = (out[x] || 0) + 1); }
    APP.ESTL.forEach(s => ['why', 'how', 'ex', 'drill', 'rel', 'riv'].forEach(tb => check(['e_st', s.id, tb])));
    ['e_home', 'e_map', 'e_concepts', 'e_dos', 'e_cov', 'e_bt', 'e_lib', 'e_aut', 'e_living', 'e_prob'].forEach(v => check([v]));
    APP.runThree('A'); ['e_bt', 'e_aut'].forEach(v => check([v])); ['three','sens','cycle','enc','hist','about'].forEach(t => check(['e_bt', null, t]));
    (window.EPI_PROBLEMS||[]).forEach(p => ['about','path','sim','dead','drills','lessons','cases'].forEach(t => check(['e_prob', p.id, t])));
    APP.btCases('A').slice(0, 200).forEach(c => check(['e_lib', c.id])); check(['e_cov', null, 'notes']);
    const c = APP.newCase({ title: 't', input: 'x' }); APP.ESTL.forEach(s => { c.inc[s.id] = true; }); APP.S.put(c); APP.ESTL.forEach(s => check(['e_case', c.id, s.id]));
    return out;
  });
  console.log(JSON.stringify(r)); console.log(errs.join('\n') || 'no page errors'); await b.close();
})();
