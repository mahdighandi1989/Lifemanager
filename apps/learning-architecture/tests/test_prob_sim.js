// «مسئله‌های بزرگ» (a8_prob + a19_moves) — آزمون‌های بازگشتِ ممیزی: ترتیبِ تصادفی و اندازهٔ یکسانِ گزینه‌ها، بستنِ راهِ دورزدنِ
// تأیید، validP ِ سخت‌گیر و رکوردِ خراب، نگه‌داشتنِ پاسخ و نمرهٔ بار اولِ سطح ۳–۴، سالِ منفی (پ.م.)، «↩ برگرد» روی محتوا،
// JSON ِ خرابِ هوش مصنوعی، برچسبِ textarea، پیوندِ منابع، برچسبِ حرکتِ چهاررنگ، نشتِ پاسخ در «گیر کردم» — روی dist/learning-architecture.html
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
const SHOTS = process.env.PB_SHOTS || path.join(__dirname, '..', 'dist');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(300);
  // ۲۰۲۶-۱۰-۱۳: ۱۳ مسئلهٔ آماده «نمونهٔ آمادهٔ سازنده»اند و پیش‌فرض پنهان؛ این آزمون خودِ آن‌ها را می‌سنجد ⇒ روشن
  await p.evaluate(() => { const st = APP.S.settings(); st.samples = true; APP.S.saveSettings(st); });
  const go = async (...a) => { await p.evaluate(x => APP.go(...x), a); await p.waitForTimeout(100); };
  const overflow = () => p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const unlock = (pid, upto) => p.evaluate(([pid, upto]) => {
    const P = window.EPI_PROBLEMS.find(x => x.id === pid); const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog', lv: {} };
    for (let l = 1; l <= upto; l++) { pg.lv[l] = {}; P.stages.forEach(s => { pg.lv[l][s.id] = { first: true }; }); }
    APP.S.put(pg);
  }, [pid, upto]);

  /* ۱) ترتیبِ تصادفیِ هر بار + اندازهٔ یکسان */
  info.shuffle = await p.evaluate(() => {
    const out = { stage: {}, drill: {}, moves: {}, uniform: [] };
    const P = window.EPI_PROBLEMS.find(x => x.id === 'pb_greek'), s = P.stages[5], okT = s.opts.find(o => o.ok).t;
    APP.simState = { pid: 'pb_greek', lv: 1, order: 'hist', i: 5 }; APP.go('e_prob', 'pb_greek', 'sim');
    for (let k = 0; k < 30; k++) { APP.render(); const t = [...document.querySelectorAll('.simcard .dopt')].map(b => b.textContent); out.stage[t.indexOf(okT)] = 1; }
    const d0 = P.drills.slice().sort((a, b) => a.lvl - b.lvl)[0];
    APP.go('e_prob', 'pb_greek', 'drills');
    for (let k = 0; k < 30; k++) { APP.render(); const t = [...document.querySelector('.drill .ditem .dopts').children].map(b => b.textContent); out.drill[t.indexOf(d0.opts[d0.a])] = 1; }
    for (let k = 0; k < 30; k++) { const S = APP.moveBuildSession('mv_extend'); const it = S.items[0]; out.moves[it.choices.findIndex(c => it.mv.indexOf(c) >= 0)] = 1; }
    return { stage: Object.keys(out.stage).length, drill: Object.keys(out.drill).length, moves: Object.keys(out.moves).length };
  });
  if (info.shuffle.stage < 2 || info.shuffle.drill < 2 || info.shuffle.moves < 2) errors.push('options not shuffled per attempt ' + JSON.stringify(info.shuffle));
  const sameSize = async (sel, lab) => {
    const r = await p.evaluate(sel => [...document.querySelectorAll(sel)].map(x => { const b = x.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; }), sel);
    if (r.length < 2) { errors.push('uniform ' + lab + ': no options'); return; }
    const w = new Set(r.map(x => x[0])), hh = r.map(x => x[1]);
    if (w.size !== 1 || Math.max(...hh) - Math.min(...hh) > 1) errors.push('options not uniform ' + lab + ' ' + JSON.stringify(r));
  };
  for (const W of [1280, 390]) {
    await p.setViewportSize({ width: W, height: W === 390 ? 844 : 900 });
    await p.evaluate(() => { APP.simState = { pid: 'pb_greek', lv: 1, order: 'hist', i: 5 }; APP.go('e_prob', 'pb_greek', 'sim'); }); await p.waitForTimeout(80);
    await sameSize('.simcard .dopts.pb-opts > .dopt', 'stage@' + W);
    await go('e_prob', 'pb_greek', 'drills'); await sameSize('.drill .ditem:first-of-type .dopts > .dopt', 'drill@' + W);
    await go('move', 'mv_extend'); if (await p.locator('main .mv-start').count()) { await p.click('main .mv-start'); await p.waitForTimeout(80); }
    await sameSize('.mv-q1 .dopts > .dopt', 'moves@' + W);
  }
  await p.setViewportSize({ width: 1280, height: 900 });

  /* ۱۰) برچسب‌های چهاررنگ + تمرینِ درهم با گامِ ≥۳ گزینه */
  info.tags = await p.evaluate(() => { const P = window.EPI_PROBLEMS.find(x => x.id === 'pb_fourcolor'); const g = id => APP.stageMoves(P, P.stages.find(s => s.id === id)); return { n7: g('n7'), n10: g('n10'), n10why: (APP.MOVE_UNTAGGED.pb_fourcolor || {}).n10 || '' }; });
  if (info.tags.n7.join() !== 'mv_compute' || info.tags.n10.length || !info.tags.n10why) errors.push('fourcolor tags ' + JSON.stringify(info.tags));
  await go('move', 'mv_compute'); await p.click('main .mv-start'); await p.waitForTimeout(80);
  const nOpts = await p.evaluate(() => {
    const S = APP.moveSession(), P = window.EPI_PROBLEMS.find(x => x.id === 'pb_fourcolor'), i = P.stages.findIndex(s => s.id === 'n8');
    S.items = [{ p: P, s: P.stages[i], i, mv: ['mv_compute'], choices: ['mv_special', 'mv_compute', 'mv_invariant', 'mv_contra'] }]; S.k = 0; S.phase = 'move';
    APP.render(); return P.stages[i].opts.length;
  });
  await p.waitForTimeout(80);
  await p.click('main .mv-opt[data-mv="mv_invariant"]'); await p.waitForTimeout(60);
  const sopts = await p.locator('main .mv-sopt').count();
  if (sopts !== nOpts || nOpts < 3) errors.push('practice stage options ' + sopts + ' vs ' + nOpts);
  await sameSize('.mv-q2 .dopts > .dopt', 'practice q2');
  await p.evaluate(() => { const s = APP.moveSession().items[0].s; [...document.querySelectorAll('main .mv-sopt')].forEach(b => { if (!b.disabled && !s.opts.find(o => o.t === b.textContent).ok) b.click(); }); [...document.querySelectorAll('main .mv-sopt')].forEach(b => { if (!b.disabled) b.click(); }); });
  await p.waitForTimeout(60);
  info.practice3 = { wrong: await p.locator('main .mv-sopt.wrong').count(), right: await p.locator('main .mv-sopt.right').count(), next: await p.locator('main .mv-next').count() };
  if (info.practice3.wrong !== nOpts - 1 || info.practice3.right !== 1 || info.practice3.next !== 1) errors.push('practice ≥3 options flow ' + JSON.stringify(info.practice3));

  /* ۵) سالِ منفی ⇒ «پ.م.» در سرِ شبیه‌ساز، مسیر حل، بن‌بست‌ها، دوره و زمانه، کارتِ حرکت، تمرینِ درهم */
  const negBad = t => /-\s*[۰-۹0-9]|[۰-۹0-9]\s*-/.test(t.replace(/[–—]/g, ''));
  await p.evaluate(() => { APP.simState = { pid: 'pb_greek', lv: 1, order: 'hist', i: 0 }; APP.go('e_prob', 'pb_greek', 'sim'); }); await p.waitForTimeout(80);
  info.greekHead = await p.locator('.simcard .eyebrow').innerText();
  if (!/۴۳۰ پ\.م\./.test(info.greekHead) || negBad(info.greekHead)) errors.push('sim header year ' + info.greekHead);
  if (!(await p.locator('.simcard .eyebrow bdi.pb-year').count())) errors.push('sim header year not isolated');
  for (const [t, sel] of [['path', 'main .timeline'], ['dead', 'main .col.gap'], ['era', 'main .mv-era']]) {
    await go('e_prob', 'pb_greek', t); const tx = await p.locator(sel).first().innerText();
    if (!/پ\.م\./.test(tx) || negBad(tx)) errors.push('year in ' + t + ': ' + tx.slice(0, 160));
  }
  await go('move', 'mv_extend');
  const card = p.locator('main .mv-stage[data-pid="pb_greek"][data-sid="n2"]');
  if (await card.count()) { const tx = await card.locator('.small.muted').first().innerText(); if (!/۲۵۰ پ\.م\./.test(tx) || negBad(tx)) errors.push('move card year ' + tx); } else errors.push('pb_greek n2 not on mv_extend page');
  // ترتیبِ دیداری در راست‌به‌چپ: «۴۳۰» پیش از «پ.م.» دیده می‌شود (سمتِ راستِ آن)
  info.bidi = await p.evaluate(() => { APP.simState = { pid: 'pb_greek', lv: 1, order: 'hist', i: 0 }; APP.go('e_prob', 'pb_greek', 'sim'); const el = document.querySelector('.simcard .eyebrow bdi'); const r = document.createRange(); const tn = el.firstChild; const t = tn.textContent; const i = t.indexOf('۴۳۰'), j = t.indexOf('پ.م.'); r.setStart(tn, i); r.setEnd(tn, i + 3); const a = r.getBoundingClientRect(); r.setStart(tn, j); r.setEnd(tn, j + 4); const c = r.getBoundingClientRect(); return { numRight: a.left > c.left, dir: getComputedStyle(el).direction }; });
  if (!info.bidi.numRight) errors.push('bidi: year scrambled ' + JSON.stringify(info.bidi));
  // ترتیبِ سه تکه در راست‌به‌چپ: «گام ۲ از ۹» ⇐ «۲۵۰ پ.م.» ⇐ نامِ شخص (هر تکه کاملاً سمتِ چپِ قبلی)
  info.bidiOrder = await p.evaluate(() => { APP.simState = { pid: 'pb_greek', lv: 1, order: 'hist', i: 1 }; APP.go('e_prob', 'pb_greek', 'sim');
    const el = document.querySelector('.simcard .eyebrow'), bd = el.querySelector('bdi'), first = el.firstChild, last = el.lastChild;
    const rr = (n) => { const r = document.createRange(); r.selectNodeContents(n); return r.getBoundingClientRect(); };
    const a = rr(first), y = bd.getBoundingClientRect(), w = rr(last);
    return { stepLeft: Math.round(a.left), yearRight: Math.round(y.right), yearLeft: Math.round(y.left), whoRight: Math.round(w.right), ok: a.left >= y.right - 1 && y.left >= w.right - 1 }; });
  if (!info.bidiOrder.ok) errors.push('bidi order scrambled ' + JSON.stringify(info.bidiOrder));

  /* ۸) برچسبِ textarea + ۴) سطح ۳: پاسخِ نوشته‌شده نگه داشته می‌شود */
  await unlock('pb_greek', 2);
  await p.evaluate(() => { const pg = APP.S.get('eprog_pb_greek'); delete pg.lv[3]; delete pg.lv[4]; APP.S.put(pg); APP.simState = { pid: 'pb_greek', lv: 3, order: 'hist', i: 0 }; APP.go('e_prob', 'pb_greek', 'sim'); });
  await p.waitForTimeout(80);
  info.label = await p.evaluate(() => { const t = document.querySelector('.simcard textarea'); return { labels: t.labels.length, text: t.labels[0] && t.labels[0].textContent, desc: !!document.getElementById(t.getAttribute('aria-describedby') || 'x') }; });
  if (!info.label.labels || !info.label.desc) errors.push('lv3 textarea label ' + JSON.stringify(info.label));
  const MINE3 = 'به نظرم باید مسئله را به زبانِ دیگری برد و حالتِ ساده‌تر را اول حل کرد';
  await p.fill('.simcard textarea', MINE3);
  await p.click('.simcard .btn:has-text("ثبت و دیدن گزینه‌ها")'); await p.waitForTimeout(60);
  await p.evaluate(() => { const s = window.EPI_PROBLEMS.find(x => x.id === 'pb_greek').stages[0]; const w = [...document.querySelectorAll('.simcard .dopt')].find(b => !s.opts.find(o => o.t === b.textContent).ok); w.click(); [...document.querySelectorAll('.simcard .dopt')].forEach(b => { if (!b.disabled) b.click(); }); });
  info.lv3 = await p.evaluate(() => APP.S.get('eprog_pb_greek').lv[3].n1);
  if (!info.lv3 || info.lv3.mine !== MINE3 || info.lv3.first !== false) errors.push('lv3 record ' + JSON.stringify(info.lv3));
  // تکرار: نمرهٔ بار اول عوض نمی‌شود، متنِ تازه ذخیره می‌شود
  await p.evaluate(() => { APP.simState = { pid: 'pb_greek', lv: 3, order: 'hist', i: 0 }; APP.go('e_prob', 'pb_greek', 'sim'); }); await p.waitForTimeout(60);
  if (await p.inputValue('.simcard textarea') !== MINE3) errors.push('lv3 textarea not prefilled with saved answer');
  await p.fill('.simcard textarea', MINE3 + ' — بار دوم'); await p.click('.simcard .btn:has-text("ثبت و دیدن گزینه‌ها")'); await p.waitForTimeout(60);
  await p.evaluate(() => { const s = window.EPI_PROBLEMS.find(x => x.id === 'pb_greek').stages[0]; [...document.querySelectorAll('.simcard .dopt')].find(b => s.opts.find(o => o.t === b.textContent).ok).click(); });
  info.lv3b = await p.evaluate(() => APP.S.get('eprog_pb_greek').lv[3].n1);
  if (info.lv3b.first !== false || info.lv3b.mine !== MINE3 + ' — بار دوم') errors.push('lv3 retry ' + JSON.stringify(info.lv3b));
  // سطح ۴: بار اول ۰، بار دوم ۲ ⇒ first/self همان بار اول
  await unlock('pb_greek', 3);
  for (const v of [0, 2]) {
    await p.evaluate(() => { APP.simState = { pid: 'pb_greek', lv: 4, order: 'hist', i: 0 }; APP.go('e_prob', 'pb_greek', 'sim'); }); await p.waitForTimeout(60);
    await p.fill('.simcard textarea', 'پاسخِ سطحِ چهار، بار ' + v + ' — مقایسه با حرکتِ واقعی');
    await p.click('.simcard .btn:has-text("ثبت و مقایسه")'); await p.waitForTimeout(60);
    await p.click(`.simcard .btn.ghost.sm:has-text("${['۰ نه', '۱ تاحدی', '۲ کامل'][v]}")`); await p.waitForTimeout(60);
  }
  info.lv4 = await p.evaluate(() => APP.S.get('eprog_pb_greek').lv[4].n1);
  if (!info.lv4 || info.lv4.first !== false || info.lv4.self !== 0 || info.lv4.last !== 2 || !/بار ۲/.test(info.lv4.mine) && !/بار 2/.test(info.lv4.mine)) errors.push('lv4 record ' + JSON.stringify(info.lv4));

  /* ۶) «↩ برگرد» روی محتوا نمی‌افتد (۱۲۸۰ و ۳۹۰) + عکس‌ها */
  for (const W of [1280, 390]) {
    await p.setViewportSize({ width: W, height: W === 390 ? 844 : 900 });
    await go('moves');
    await p.evaluate(() => { APP.simState = { pid: 'pb_greek', lv: 1, order: 'hist', i: 0 }; APP.go('e_prob', 'pb_greek', 'sim'); }); await p.waitForTimeout(100);
    if (!(await p.locator('.backfab').count())) { errors.push('no backfab to test @' + W); continue; }
    await p.screenshot({ path: path.join(SHOTS, 'shot_pb_greek_head_' + W + '.png'), fullPage: false });
    await p.evaluate(() => { const s = window.EPI_PROBLEMS.find(x => x.id === 'pb_greek').stages[0]; [...document.querySelectorAll('.simcard .dopt')].find(b => s.opts.find(o => o.t === b.textContent).ok).click(); });
    await p.waitForTimeout(80);
    const hits = [];
    for (const y of [0, 0.25, 0.5, 0.75, 1]) {
      const r = await p.evaluate(y => {
        window.scrollTo(0, y * (document.documentElement.scrollHeight - innerHeight)); const m = document.getElementById('main'); if (m) m.scrollTop = y * (m.scrollHeight - m.clientHeight);
        const f = document.querySelector('.backfab').getBoundingClientRect(); const out = [];
        document.querySelectorAll('main .page .chip, main .page .dopt, main .page .simcard p, main .page .simcard .small, main .page .simcard .btn, main .page h1, main .page .eyebrow').forEach(e => { const b = e.getBoundingClientRect(); if (b.width && b.height && b.left < f.right && b.right > f.left && b.top < f.bottom && b.bottom > f.top) out.push(e.className + ':' + e.textContent.slice(0, 30)); });
        return out;
      }, y);
      hits.push(...r);
    }
    if (hits.length) errors.push('backfab overlaps content @' + W + ': ' + hits.slice(0, 3).join(' | '));
    await p.evaluate(() => { window.scrollTo(0, 0); const m = document.getElementById('main'); if (m) m.scrollTop = 0; });
    await p.screenshot({ path: path.join(SHOTS, 'shot_pb_greek_feedback_' + W + '.png'), fullPage: true });
    if (await overflow() > 2) errors.push('overflow sim @' + W);
  }
  await p.setViewportSize({ width: 1280, height: 900 });

  /* ۷) JSON ِ خرابِ هوش مصنوعی ⇒ پیامِ فارسی، بی‌رکورد */
  await p.evaluate(() => { APP.callAI = () => Promise.resolve('این JSON نیست {'); });
  await go('e_prob', null, 'inject');
  await p.fill('#pbIn_title', 'الف'); await p.fill('#pbIn_statement', 'ص'); await p.fill('#pbIn_answer', 'پ'); await p.fill('#pbIn_src', 'منبع');
  const n0 = await p.evaluate(() => APP.S.all('eprob').length);
  await p.evaluate(() => { APP._pbAIok = true; }); await p.click('main .pb-ai'); await p.waitForTimeout(250);
  info.badJson = await p.locator('main .pb-err').first().innerText().catch(() => '');
  if (info.badJson.trim() !== await p.evaluate(() => APP.PROB_AI_BAD_JSON) || !/دستی وارد کن/.test(info.badJson)) errors.push('malformed AI JSON message: ' + info.badJson);
  if (await p.evaluate(() => APP.S.all('eprob').length) !== n0) errors.push('malformed AI JSON stored a record');
  await p.fill('main textarea.mono', '{ not json'); await p.click('main .pb-manual'); await p.waitForTimeout(80);
  if (!/JSON ِ واردشده معتبر نیست/.test(await p.locator('main .pb-err').first().innerText())) errors.push('manual bad JSON message');

  /* ۳) validP ِ سخت‌گیر: همهٔ ایرادها با پیامِ فارسی؛ هیچ رکوردی ذخیره نمی‌شود؛ مسئله‌های خودِ برنامه معتبرند */
  info.valid = await p.evaluate(() => {
    const ok = { title: 't', field: 'f', statement: 's', answer: 'a', why_hard: 'w', stages: [{ id: 'n1', q: 'q', opts: [{ t: 'a', ok: true }, { t: 'b', ok: false }] }] };
    const C = o => JSON.parse(JSON.stringify(o)), err = o => { try { APP.probValid(o); return ''; } catch (e) { return e.message; } };
    const cases = {
      noStatement: Object.assign(C(ok), { statement: undefined }),
      titleObj: Object.assign(C(ok), { title: { a: 1 } }),
      dupIds: Object.assign(C(ok), { stages: [C(ok.stages[0]), C(ok.stages[0])] }),
      objT: Object.assign(C(ok), { stages: [{ q: 'q', opts: [{ t: { x: 1 }, ok: true }, { t: 'b', ok: false }] }] }),
      oneOpt: Object.assign(C(ok), { stages: [{ q: 'q', opts: [{ t: 'a', ok: true }] }] }),
      twoOk: Object.assign(C(ok), { stages: [{ q: 'q', opts: [{ t: 'a', ok: true }, { t: 'b', ok: true }] }] }),
      okString: Object.assign(C(ok), { stages: [{ q: 'q', opts: [{ t: 'a', ok: 'true' }, { t: 'b', ok: false }] }] }),
      noQ: Object.assign(C(ok), { stages: [{ opts: ok.stages[0].opts }] }),
      stagesNull: Object.assign(C(ok), { stages: [null] }),
      lessonsStr: Object.assign(C(ok), { lessons: 'abc' }),
      srcObj: Object.assign(C(ok), { src: [{ u: 1 }] }),
      drillOptsStr: Object.assign(C(ok), { drills: [{ q: 'q', opts: 'abc', a: 1 }] }),
      drillA: Object.assign(C(ok), { drills: [{ q: 'q', opts: ['x', 'y'], a: 2 }] }),
      drillAFloat: Object.assign(C(ok), { drills: [{ q: 'q', opts: ['x', 'y'], a: 0.5 }] }),
      deadBad: Object.assign(C(ok), { dead: [{ who: 3, idea: 'i', flaw: 'f' }] }),
      deadNoFlaw: Object.assign(C(ok), { dead: [{ idea: 'i' }] }),
      eraBad: Object.assign(C(ok), { era: 'x' }),
      eraNum: Object.assign(C(ok), { era: { known: 5 } }),
      notObj: [1, 2],
    };
    const out = {}; Object.keys(cases).forEach(k => { out[k] = err(cases[k]); });
    const multi = err({ title: '', stages: [{ opts: [] }], drills: [{ q: 'q', opts: ['x'], a: 3 }] });
    const good = C(ok); good.stages[0].mv = ['mv_contra', 'mv_nope']; good.era = { known: 'k', assumed: '', tools: ['a', 'b'] };
    const g = APP.probValid(good);
    const builtin = window.EPI_PROBLEMS.map(x => { const e = err(C(x)); return e ? x.id + ': ' + e.slice(0, 200) : ''; }).filter(Boolean);
    return { out, multiCount: (multi.match(/\n• /g) || []).length, goodMv: g.stages[0].mv, goodEra: g.era, builtin };
  });
  Object.entries(info.valid.out).forEach(([k, m]) => { if (!m || !/[؀-ۿ]/.test(m)) errors.push('validP accepted/English for ' + k + ': ' + m); });
  if (info.valid.multiCount < 5) errors.push('validP should list all problems at once: ' + info.valid.multiCount);
  if (info.valid.goodMv.join() !== 'mv_contra' || info.valid.goodEra.assumed !== undefined || info.valid.goodEra.tools.length !== 2) errors.push('validP normalisation ' + JSON.stringify([info.valid.goodMv, info.valid.goodEra]));
  if (info.valid.builtin.length) errors.push('built-in problems fail validP: ' + info.valid.builtin.join(' || '));
  await go('e_prob', null, 'inject');
  const n1 = await p.evaluate(() => APP.S.all('eprob').length);
  await p.fill('main textarea.mono', JSON.stringify({ title: 'x', stages: [{ q: 'q', opts: [{ t: 'a', ok: true }] }], lessons: 'abc' }));
  await p.click('main .pb-manual'); await p.waitForTimeout(80);
  info.manualErr = await p.locator('main .pb-err').first().innerText();
  if (await p.evaluate(() => APP.S.all('eprob').length) !== n1 || !/statement/.test(info.manualErr) || !/lessons/.test(info.manualErr) || !/opts/.test(info.manualErr)) errors.push('manual invalid JSON: ' + info.manualErr);

  /* ۳ب) رکوردِ خرابِ ذخیره‌شده فهرست/حرکت‌ها/شبیه‌ساز را نمی‌شکند؛ کارتِ «رکوردِ خراب» با دکمهٔ رد */
  await p.evaluate(() => { APP.S.put({ id: 'eprob_pb_u_broken', type: 'eprob', status: 'approved', by: 'ai', p: { id: 'pb_u_broken', title: 'خراب', stages: [null], lessons: 'x' } }); APP.S.put({ id: 'eprob_pb_u_broken2', type: 'eprob', status: 'approved', by: 'ai', p: null }); });
  const before = errors.length;
  await go('e_prob');
  info.list = await p.evaluate(() => ({ cards: document.querySelectorAll('main .col.gap > .card:not(.pb-broken)').length, broken: document.querySelectorAll('main .pb-broken').length, builtin: window.EPI_PROBLEMS.length }));
  if (info.list.cards < info.list.builtin || info.list.broken !== 2) errors.push('broken record list ' + JSON.stringify(info.list));
  for (const a of [['moves'], ['move', 'mv_contra'], ['e_prob', 'pb_u_broken', 'sim'], ['e_prob', 'pb_flt', 'sim']]) await go(...a);
  if (errors.length !== before) errors.push('broken record caused errors');
  await go('e_prob');
  await p.locator('main .pb-broken[data-rid="eprob_pb_u_broken"] .pb-reject').click(); await p.waitForTimeout(80);
  if (await p.evaluate(() => APP.S.get('eprob_pb_u_broken').status) !== 'rejected' || await p.locator('main .pb-broken').count() !== 1) errors.push('broken record reject');
  await p.evaluate(() => { const r = APP.S.get('eprob_pb_u_broken2'); r.status = 'rejected'; APP.S.put(r); });

  /* ۲) دورزدنِ تأیید: ویرایشِ قلمِ بی‌پرچم پس از بازبینی ⇒ تأیید بسته؛ «اصلاحش کردم» با تغییرِ فقط-فاصله رد؛ بازبینیِ دوباره فقط قلم‌های تغییرکرده */
  await p.evaluate(() => {
    window.__ai = [];
    const decomp = { title: 'تزریقیِ دور', field: 'ریاضی', open: '۱۸۰۰–۱۹۰۰', statement: 's', why_hard: 'w', answer: 'a', src: ['https://example.org/x', 'کتابِ الف', 'javascript:alert(1)'],
      stages: [{ id: 'n1', year: 1801, who: 'الف', ctx: 'c', q: 'q?', opts: [{ t: 'درست', ok: true, why: 'w' }, { t: 'نادرست', ok: false, why: 'w' }, { t: 'سوم', ok: false, why: 'w' }], move: 'm1', idea: 'i', lvl: 1 },
        { id: 'n2', year: -300, who: 'ب', ctx: 'c', q: 'q2?', opts: [{ t: 'درست', ok: true, why: 'w' }, { t: 'نادرست', ok: false, why: 'w' }], move: 'm2', idea: 'i', lvl: 2 }],
      dead: [{ who: 'ج', year: 1820, idea: 'ایده', flaw: 'شکاف' }], lessons: ['درس'], drills: [{ lvl: 1, q: 'q', opts: ['x', 'y'], a: 1, why: 'w' }] };
    // وارسیِ پاسخ‌ها (۲۰۲۶-۱۰-۱۳): سه حل‌کنندهٔ ساختگیِ «درست‌کار» — گزینهٔ درست را از رکوردِ در انتظار برمی‌دارند و حرفش را در پرسشِ به‌هم‌ریخته پیدا می‌کنند
    window.__answerCheck = (user) => { const r = APP.S.all('eprob', x => x.status === 'pending').slice(-1)[0]; const items = APP.probCheckItems(r.p);
      return JSON.stringify(user.split(/\n(?=\[)/).map(b => { const m = /^\[([^\]]+)\]/.exec(b); if (!m) return null; const it = items.find(x => x.id === m[1]); const want = it ? it.opts[it.ok] : null;
        const ln = b.split('\n').find(l => /^[a-h]\) /.test(l) && l.slice(3) === want); return { id: m[1], pick: ln ? ln[0] : 'z', multi: false }; }).filter(Boolean)); };
    APP.callAI = function (sys, user) {
      window.__ai.push({ sys, user });
      if (sys.indexOf(APP.PROB_CHECK_TAIL) >= 0) return Promise.resolve(window.__answerCheck(user));
      if (window.__ai.length === 1) return Promise.resolve(JSON.stringify(decomp));
      const t = JSON.parse(user.slice(user.indexOf('تجزیه:\n') + 7));
      return Promise.resolve(JSON.stringify(t.stages.concat(t.dead).map(x => ({ sid: x.id, ok: x.id !== 'n2' || window.__ai.length > 2, issue: x.id === 'n2' ? 'سالِ ۳۰۰ پ.م. نامطمئن' : '' }))));
    };
  });
  await go('e_prob', null, 'inject');
  await p.fill('#pbIn_title', 'تزریقیِ دور'); await p.fill('#pbIn_statement', 'ص'); await p.fill('#pbIn_answer', 'پ'); await p.fill('#pbIn_src', 'منبع');
  await p.evaluate(() => { APP._pbAIok = true; }); await p.click('main .pb-ai'); await p.waitForTimeout(500);
  await go('e_prob', null, 'pending');
  const C = () => p.locator('main section.pb-pending', { hasText: 'تزریقیِ دور' });
  const rec = () => p.evaluate(() => APP.S.all('eprob', r => r.p && r.p.title === 'تزریقیِ دور')[0]);
  const editJSON = async fn => { await C().locator('details').evaluate(d => { d.open = true; }); const ta = C().locator('textarea.mono'); const js = JSON.parse(await ta.inputValue()); fn(js); await ta.fill(JSON.stringify(js, null, 1)); };
  // «اصلاحش کردم» با تغییرِ فقط-فاصله ⇒ رد
  await editJSON(js => { js.stages[1].who = '  ب  '; js.stages[1].ctx = 'c\n'; });
  await C().locator('li[data-sid="n2"] .mv-fix').click(); await p.waitForTimeout(80);
  if ((await rec()).verify.flags.find(f => f.sid === 'n2').state !== 'open') errors.push('whitespace-only edit accepted as fix');
  // پذیرشِ آگاهانهٔ n2 ⇒ تأیید باز
  await C().locator('li[data-sid="n2"] .mv-accept').click(); await p.waitForTimeout(80);
  if (await C().locator('.mv-approve').isDisabled()) errors.push('approve blocked after accepting the only flag');
  // دورزدن: ویرایشِ گامِ بی‌پرچمِ n1 و بن‌بستِ d1 در JSON و زدنِ «تأیید»
  await editJSON(js => { js.stages[0].who = 'ادعای جعلیِ تازه'; js.stages[0].year = 1234; js.dead[0].flaw = 'شکافِ دیگر'; });
  await C().locator('.mv-approve').click(); await p.waitForTimeout(120);
  let r = await rec();
  info.bypass = { status: r.status, who: r.p.stages[0].who, changed: await C().locator('.pb-changed li').count() };
  if (r.status !== 'pending' || info.bypass.changed !== 2 || !(await C().locator('.mv-approve').isDisabled())) errors.push('approval bypass still open ' + JSON.stringify(info.bypass));
  // فقط-فاصله در قلمی که قبلاً بازبینی شده «تغییر» حساب نمی‌شود
  await editJSON(js => { js.lessons = ['  درس  ']; js.stages[0].idea = ' i '; });
  info.wsChanged = await C().evaluate(c => { const r = APP.S.all('eprob', r => r.p && r.p.title === 'تزریقیِ دور')[0]; const np = APP.probValid(JSON.parse(c.querySelector('textarea.mono').value)); return APP.probChanged(r, np).map(x => x.id).join(); });
  if (info.wsChanged !== 'n1,d1') errors.push('whitespace edit counted as change: ' + info.wsChanged);
  // بازبینیِ دوباره فقط قلم‌های تغییرکرده
  const nAi = await p.evaluate(() => window.__ai.length);
  await C().locator('.pb-rereview').click(); await p.waitForTimeout(250);
  info.partial = await p.evaluate(n => { const u = window.__ai[n].user; const t = JSON.parse(u.slice(u.indexOf('تجزیه:\n') + 7)); return { stages: t.stages.map(x => x.id), dead: t.dead.map(x => x.id), calls: window.__ai.length - n }; }, nAi);
  if (info.partial.calls !== 1 || info.partial.stages.join() !== 'n1' || info.partial.dead.join() !== 'd1') errors.push('partial re-review payload ' + JSON.stringify(info.partial));
  r = await rec();
  if (r.verify.flags.find(f => f.sid === 'n2').state !== 'accepted') errors.push('partial re-review dropped other decisions');
  if (await C().locator('.pb-changed').count() || await C().locator('.mv-approve').isDisabled()) errors.push('approve still blocked after re-review');
  // پذیرشِ تک‌به‌تک: دوباره n1 را عوض کن ⇒ بسته؛ «آگاهانه می‌پذیرم» ⇒ باز؛ تأیید
  await editJSON(js => { js.stages[0].who = 'الف (اصلاحِ مالک)'; });
  await C().locator('.mv-approve').click(); await p.waitForTimeout(100);
  if (!(await C().locator('.mv-approve').isDisabled())) errors.push('second edit not blocked');
  await C().locator('.pb-changed li[data-sid="n1"] .pb-chaccept').click(); await p.waitForTimeout(80);
  await C().locator('.mv-approve').click(); await p.waitForTimeout(120);
  r = await rec();
  if (r.status !== 'approved' || r.p.stages[0].who !== 'الف (اصلاحِ مالک)') errors.push('approve after item accept ' + r.status);

  /* ۹) منابع: نشانی ⇒ پیوندِ امن؛ بقیه متن */
  await go('e_prob', r.p.id, 'about');
  await p.locator('main details summary').first().click();
  info.src = await p.evaluate(() => [...document.querySelectorAll('main .pb-src li')].map(li => { const a = li.querySelector('a'); return a ? { href: a.getAttribute('href'), target: a.target, rel: a.rel, text: a.textContent } : { text: li.textContent }; }));
  const link = info.src.find(x => x.href);
  if (info.src.length !== 3 || !link || link.href !== 'https://example.org/x' || link.target !== '_blank' || !/noopener/.test(link.rel) || info.src.filter(x => x.href).length !== 1) errors.push('sources ' + JSON.stringify(info.src));
  if (await p.locator('main a[href^="javascript"]').count()) errors.push('javascript: link rendered');
  await go('e_prob', r.p.id, 'sim');

  /* ۱۱) «گیر کردم»: صورتِ موقعیت بی‌نشتِ پاسخ؛ زمینهٔ کامل پس از دیدنِ پاسخ */
  info.leak = await p.evaluate(() => {
    const bad = [];
    APP.probs().forEach(P => P.stages.forEach(s => { const n = APP.probNeutralCtx(s); [s.move, s.idea].concat(s.opts.map(o => o.t)).forEach(t => { const g = APP.probShares4(n, t); if (g.length) bad.push(P.id + ':' + s.id + ' «' + g[0] + '»'); }); }));
    const strip = []; APP.probs().forEach(P => P.stages.forEach(s => { if (APP.probNeutralCtx(s).replace(/\s+/g, ' ').trim() !== String(s.ctx || '').replace(/\s+/g, ' ').trim()) strip.push(P.id + ':' + s.id); }));
    return { bad, strip };
  });
  if (info.leak.bad.length) errors.push('neutral ctx still shares 4 words with answer text: ' + info.leak.bad.slice(0, 5).join(' | '));
  if (!info.leak.strip.length) errors.push('no stage ctx needed stripping (test cannot exercise reveal)');
  else {
    const [pid, sid] = info.leak.strip[0].split(':');
    await p.evaluate(([pid, sid]) => { APP.S.all('kcase').forEach(c => { if (c.src && c.src.pid === pid) { c.status = 'closed'; APP.S.put(c); } }); APP.simState = null; APP.go('e_prob', pid, 'sim:' + sid); }, [pid, sid]);
    await p.waitForTimeout(100);
    await p.click('.simcard .mv-stuck'); await p.waitForTimeout(150);
    info.kc = await p.evaluate(([pid, sid]) => { const k = APP.S.get(APP.state.arg), s = APP.getProb(pid).stages.find(x => x.id === sid); const opts = s.opts.map(o => o.t).concat([s.move, s.idea]); return { id: k.id, seen: k.intake.seen, held: !!k.src.ctxHeld, stmt: k.intake.statement, exp: (APP.probNeutralCtx(s) ? APP.probNeutralCtx(s) + '\n\n' : '') + s.q, leak: opts.map(t => APP.probShares4(k.intake.statement, t)).flat(), ctx: s.ctx }; }, [pid, sid]);
    if (info.kc.seen !== 'no' || info.kc.stmt !== info.kc.exp || info.kc.leak.length || !info.kc.held) errors.push('stuck statement leak ' + JSON.stringify(info.kc).slice(0, 400));
    const unmask = p.locator('main .mv-unmask');
    if (!(await unmask.count())) errors.push('no unmask button');
    else {
      await unmask.click(); await p.waitForTimeout(100);
      const after = await p.evaluate(id => { const k = APP.S.get(id); return { stmt: k.intake.statement, held: !!k.src.ctxHeld, ta: (document.getElementById('knStmt') || {}).value }; }, info.kc.id);
      if (after.held || after.stmt.indexOf(info.kc.ctx) < 0 || after.ta !== after.stmt) errors.push('ctx not added after reveal ' + JSON.stringify(after).slice(0, 300));
    }
  }

  console.log(JSON.stringify(info, null, 1));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
