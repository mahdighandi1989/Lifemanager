// «حرکت‌های حلِ مسئله» (a19_moves) + ارتقای «مسئله‌های بزرگ» (a8_prob): برچسبِ حرکتِ گام‌ها، نمای حرکت‌ها، تمرینِ درهم،
// پرش به گام، «دوره و زمانه»، پلِ «گیر کردم» به گره‌گشا، بازبینِ تاریخیِ تزریق، منو و موبایل — روی dist/learning-architecture.html
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
  await p.evaluate(() => { window.__puts = []; const o = APP.S.put; APP.S.put = function (r) { window.__puts.push(r.type + ':' + r.id); return o.apply(this, arguments); }; });
  const bad = async (lab) => { if (await p.locator('main .card.bad').count()) errors.push('render ' + lab + ': ' + await p.locator('main .card.bad').first().innerText()); };
  const go = async (...a) => { await p.evaluate(x => APP.go(...x), a); await p.waitForTimeout(120); await bad(a.join('/')); };
  const overflow = () => p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

  /* ۱) داده: ۱۶ حرکت، تکنیک‌های واقعی (۱ تا ۳)، برچسب برای همهٔ گام‌های ۸ مسئله جز فهرستِ بی‌برچسب‌ها */
  info.data = await p.evaluate(() => {
    const out = { moves: APP.MOVE_IDS.length, badTech: [], badTag: [], missing: [], both: [], unknownSid: [], perMove: {}, untagged: 0, tagged: 0 };
    APP.MOVE_LIST.forEach(m => { if (!m.tech.length || m.tech.length > 3 || m.tech.some(t => !APP.TM[t[0]] || !t[1])) out.badTech.push(m.id); if (!m.sig.length || !m.d || !m.fa) out.badTech.push(m.id + ':text'); });
    const P = window.EPI_PROBLEMS.slice(0, 8);
    P.forEach(pb => {
      const T = APP.MOVE_TAGS[pb.id] || {}, U = APP.MOVE_UNTAGGED[pb.id] || {};
      Object.keys(T).concat(Object.keys(U)).forEach(sid => { if (!pb.stages.some(s => s.id === sid)) out.unknownSid.push(pb.id + ':' + sid); });
      pb.stages.forEach(s => {
        const t = T[s.id], u = U[s.id];
        if (t && u) out.both.push(pb.id + ':' + s.id);
        if (!t && !u) out.missing.push(pb.id + ':' + s.id);
        if (t) { out.tagged++; if (!t.length || t.length > 2 || t.some(x => !APP.MOVES[x])) out.badTag.push(pb.id + ':' + s.id); t.forEach(x => { out.perMove[x] = (out.perMove[x] || 0) + 1; }); }
        if (u) out.untagged++;
        if (t && APP.stageMoves(pb, s).join() !== t.join()) out.badTag.push('merge ' + pb.id + ':' + s.id);
      });
    });
    out.ids = P.map(x => x.id).join(',');
    return out;
  });
  if (info.data.moves !== 16 || info.data.badTech.length || info.data.badTag.length || info.data.missing.length || info.data.both.length || info.data.unknownSid.length) errors.push('data: ' + JSON.stringify(info.data));
  if (info.data.ids !== 'pb_flt,pb_fourcolor,pb_poincare,pb_quintic,pb_greek,pb_parallel,pb_longitude,pb_semmelweis') errors.push('problem set changed: ' + info.data.ids);
  if (Object.keys(info.data.perMove).length !== 16) errors.push('some move has no stage: ' + JSON.stringify(info.data.perMove));

  /* ۲) نمای حرکت‌ها: ۱۶ کارت با شمارشِ درست */
  await go('moves');
  info.cards = await p.locator('main .mv-card').count();
  const counts = await p.evaluate(() => Array.from(document.querySelectorAll('main .mv-card')).map(c => [c.dataset.mv, c.querySelector('.mv-count').textContent, APP.moveStages(c.dataset.mv).length]));
  counts.forEach(([id, txt, n]) => { if (!txt.startsWith(APP_fa(n))) errors.push('count ' + id + ' ' + txt + ' vs ' + n); });
  function APP_fa(n) { return String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]); }
  if (info.cards !== 16) errors.push('moves cards ' + info.cards);
  info.untaggedList = await p.locator('main .mv-untagged li').count();
  if (info.untaggedList !== info.data.untagged) errors.push('untagged list ' + info.untaggedList + ' vs ' + info.data.untagged);
  info.transfer = await p.locator('main .mv-transfer').count();
  if (!info.transfer || !/Gick & Holyoak 1983/.test(await p.locator('main .mv-transfer').first().innerText({ timeout: 2000 }).catch(() => ''))) {
    await p.click('main .mv-transfer summary'); if (!/Gick & Holyoak 1983/.test(await p.locator('main .mv-transfer').first().innerText())) errors.push('transfer note');
  }
  if (/نابغه/.test(await p.locator('main').innerText())) errors.push('genius claim');

  /* ۳) صفحهٔ حرکت: کارت‌ها از دست‌کم دو مسئلهٔ متفاوت */
  for (const mv of ['mv_extend', 'mv_contra', 'mv_represent']) {
    await go('move', mv);
    const pids = await p.evaluate(() => Array.from(new Set(Array.from(document.querySelectorAll('main .mv-stage')).map(x => x.dataset.pid))));
    info['pids_' + mv] = pids.length;
    if (pids.length < 2) errors.push('move page ' + mv + ' from ' + pids.length + ' problems');
    if (!(await p.locator('main .mv-techs .tlink').count())) errors.push('techs on ' + mv);
  }
  info.crumbMoves = await p.locator('main .crumbs button.cr.link').first().textContent().catch(() => '');
  if (!/حرکت‌های حلِ مسئله/.test(info.crumbMoves || '')) errors.push('crumb parent: ' + info.crumbMoves);
  await go('moves', 'mv_invariant'); if (!(await p.locator('main .mv-practice').count())) errors.push('A.V.moves(mvId) did not open the move page');

  /* ۴) تمرینِ درهم روی mv_represent: اول «کدام حرکت؟»، بعد گزینه‌های خودِ گام؛ یک نوشتن برای هر پاسخ */
  await go('move', 'mv_represent');
  await p.click('main .mv-start'); await p.waitForTimeout(100);
  const sess = await p.evaluate(() => { const S = APP.moveSession(); return { n: S.items.length, own: S.items.filter(x => x.mv.includes('mv_represent')).length, pids: new Set(S.items.filter(x => x.mv.includes('mv_represent')).map(x => x.p.id)).size, choiceOk: S.items.every(x => x.choices.length === 4 && x.choices.some(c => x.mv.includes(c)) && new Set(x.choices).size === 4), otherHasTarget: S.items.filter(x => !x.mv.includes('mv_represent')).every(x => x.choices.includes('mv_represent')) }; });
  info.sess = sess;
  if (sess.own < 5 || sess.own > 8 || sess.n - sess.own < 2 || sess.n - sess.own > 3 || sess.pids < 2 || !sess.choiceOk || !sess.otherHasTarget) errors.push('session composition ' + JSON.stringify(sess));
  let answered = 0, writesBad = 0, rightCount = 0;
  for (let k = 0; k < sess.n; k++) {
    if (await p.locator('main .mv-q2:not(.hidden) .mv-sopt').count()) errors.push('stage options visible before move question at ' + k);
    const it = await p.evaluate(() => { const S = APP.moveSession(); const x = S.items[S.k]; return { mv: x.mv, choices: x.choices }; });
    // نیمی را درست، نیمی را نادرست؛ پاسخِ اول با صفحه‌کلید
    const pick = k % 2 === 0 ? it.choices.find(c => it.mv.includes(c)) : it.choices.find(c => !it.mv.includes(c));
    await p.evaluate(() => { window.__puts = []; });
    if (k === 0) { await p.focus(`main .mv-opt[data-mv="${pick}"]`); await p.keyboard.press('Enter'); }
    else await p.click(`main .mv-opt[data-mv="${pick}"]`);
    await p.waitForTimeout(80);
    const puts = await p.evaluate(() => window.__puts.slice());
    if (puts.length !== 1 || puts[0] !== 'mvprog:moves_prog') { writesBad++; errors.push('writes per answer: ' + JSON.stringify(puts)); }
    if (it.mv.includes(pick)) rightCount++;
    answered++;
    if (!(await p.locator('main .mv-q2:not(.hidden) .mv-sopt').count())) errors.push('stage options missing after move answer at ' + k);
    const n = await p.locator('main .mv-sopt').count();
    for (let j = 0; j < n; j++) { const o = p.locator('main .mv-sopt').nth(j); if (await o.isDisabled()) continue; await o.click(); if (await p.locator('main .mv-next').count()) break; }
    await p.click('main .mv-next'); await p.waitForTimeout(60);
  }
  info.practiceEnd = await p.locator('main .mv-practice').innerText();
  if (!/پایان/.test(info.practiceEnd)) errors.push('practice did not finish');
  info.prog = await p.evaluate(() => APP.S.get('moves_prog'));
  if (!info.prog || info.prog.type !== 'mvprog' || info.prog.log.length !== answered) errors.push('progress record ' + JSON.stringify(info.prog && { t: info.prog.type, l: info.prog.log.length }));
  const acc = await p.evaluate(() => APP.moveAcc('mv_represent'));
  if (acc.n !== sess.own) errors.push('acc n ' + JSON.stringify(acc) + ' own ' + sess.own);
  info.accShown = await p.locator('main .mv-acccard .mv-accval').innerText().catch(() => '');
  if (!/٪/.test(info.accShown)) errors.push('accuracy not updated live: ' + info.accShown);
  await go('move', 'mv_represent');
  if (!/٪/.test(await p.locator('main .mv-acccard').innerText())) errors.push('accuracy not shown');
  info.progWritesBad = writesBad; info.rightCount = rightCount;

  /* ۵) پرش به گام: «تمرین کن» و A.go("e_prob", pid, "sim:"+sid) */
  await go('e_prob', 'pb_parallel', 'sim:n6');
  const q6 = await p.evaluate(() => window.EPI_PROBLEMS.find(x => x.id === 'pb_parallel').stages.find(s => s.id === 'n6').q);
  if ((await p.locator('.simcard h3').first().textContent()) !== q6) errors.push('jump to stage failed');
  if (await p.evaluate(() => APP.state.sub) !== 'sim') errors.push('sub not normalised to sim');
  await p.click('.simcard .dopt >> nth=0'); // ممکن است نادرست باشد؛ فقط مطمئن شو رندرِ دوباره به همان گام پرت نمی‌کند
  await go('move', 'mv_analogy');
  const firstCard = await p.evaluate(() => { const c = document.querySelector('main .mv-stage'); return { pid: c.dataset.pid, sid: c.dataset.sid }; });
  await p.click('main .mv-stage .mv-try >> nth=0'); await p.waitForTimeout(150);
  const qa = await p.evaluate(fc => window.EPI_PROBLEMS.find(x => x.id === fc.pid).stages.find(s => s.id === fc.sid).q, firstCard);
  if ((await p.locator('.simcard h3').first().textContent()) !== qa) errors.push('«تمرین کن» did not open the stage');
  if (!(await p.locator('main .backbtn').count())) errors.push('no trail back after «تمرین کن»');

  /* ۶) «مسیر حل» و پس از پاسخ: چیپ‌های حرکت */
  await go('e_prob', 'pb_flt', 'path');
  info.pathChips = await p.locator('main .timeline .mv-chips').count();
  if (info.pathChips !== 7) errors.push('path chips ' + info.pathChips);
  await go('e_prob', 'pb_flt', 'sim:n2');
  { const n = await p.locator('.simcard .dopt').count(); for (let j = 0; j < n; j++) { const o = p.locator('.simcard .dopt').nth(j); if (await o.isDisabled()) continue; await o.click(); if (await p.locator('.simcard .btn:has-text("گام بعد")').count()) break; } }
  if (!/حرکتِ این گام/.test(await p.locator('.simcard').innerText())) errors.push('no move chips after answer');

  /* ۷) «دوره و زمانه»: بی‌era (خلاصهٔ صادقانه) و با era (مثلِ epi_problems_b) + mv ِ خودِ گام */
  await go('e_prob', 'pb_semmelweis', 'era');
  if (!(await p.locator('main .mv-era-note').count())) errors.push('era fallback note missing');
  const nSt = await p.evaluate(() => window.EPI_PROBLEMS.find(x => x.id === 'pb_semmelweis').stages.length);
  if ((await p.locator('main .mv-era-list li').count()) !== nSt) errors.push('era fallback list');
  const before = await p.evaluate(() => APP.moveStages('mv_compute').length);
  await p.evaluate(() => { window.EPI_PROBLEMS.push({ id: 'pb_test_b', title: 'مسئلهٔ آزمایشیِ ب', field: 'فیزیک', open: '۱۹۰۰–۱۹۲۰', statement: 's', why_hard: 'w', answer: 'a', src: [], era: { known: 'دانسته‌ها', assumed: ['فرضِ یک', 'فرضِ دو'], tools: 'ابزارها' },
    stages: [{ id: 'n1', year: 1905, who: 'x', ctx: 'c1', q: 'q1', opts: [{ t: 'a', ok: true, why: 'w' }], move: 'm', idea: 'i', lvl: 1, mv: ['mv_compute', 'mv_bogus'] }, { id: 'n2', year: 1910, who: 'y', ctx: 'c2', q: 'q2', opts: [{ t: 'b', ok: true, why: 'w' }], move: 'm', idea: 'i', lvl: 2 }], dead: [], lessons: [], drills: [], cases: [] }); });
  await go('e_prob', 'pb_test_b', 'era');
  if ((await p.locator('main .mv-era section.card').count()) !== 3 || await p.locator('main .mv-era-note').count()) errors.push('era with p.era');
  if ((await p.locator('main .mv-era li').count()) !== 2) errors.push('era array rendering');
  const after = await p.evaluate(() => APP.moveStages('mv_compute').length);
  if (after !== before + 1) errors.push('stage.mv from problem file not counted ' + before + '→' + after);
  if ((await p.evaluate(() => APP.stageMoves(window.EPI_PROBLEMS.find(x => x.id === 'pb_test_b'), window.EPI_PROBLEMS.find(x => x.id === 'pb_test_b').stages[0]).join())) !== 'mv_compute') errors.push('unknown mv not dropped');
  await p.evaluate(() => { window.EPI_PROBLEMS.pop(); });

  /* ۸) «🪢 این‌جا گیر کردم»: پیش از دیدنِ پاسخ ⇒ seen:"no" و پاسخ در صورتِ مسئله نیست؛ پیوندِ برگشت */
  await go('e_prob', 'pb_quintic', 'sim:n4');
  await p.click('.simcard .mv-stuck'); await p.waitForTimeout(200);
  const kc1 = await p.evaluate(() => APP.S.get(APP.state.arg));
  const ans4 = await p.evaluate(() => window.EPI_PROBLEMS.find(x => x.id === 'pb_quintic').stages.find(s => s.id === 'n4').opts.find(o => o.ok).t);
  info.kc1 = kc1 && { view: await p.evaluate(() => APP.state.view), seen: kc1.intake.seen, kinds: kc1.kinds, src: kc1.src, stuckAt: kc1.intake.stuckAt, title: kc1.title };
  if (!kc1 || kc1.type !== 'kcase' || kc1.intake.seen !== 'no' || kc1.kinds.join() !== 'problem' || !kc1.src || kc1.src.type !== 'eprob' || kc1.src.pid !== 'pb_quintic' || kc1.src.sid !== 'n4') errors.push('stuck case ' + JSON.stringify(info.kc1));
  if (kc1 && (kc1.intake.statement.indexOf(ans4) >= 0 || kc1.intake.answer !== ans4 || !/گامِ ۴ از مسئلهٔ/.test(kc1.intake.stuckAt))) errors.push('stuck fields');
  if (await p.evaluate(() => APP.state.view + ':' + APP.state.sub) !== 'kcase:in') errors.push('not on kcase intake');
  if (!(await p.locator('#knAns.mv-masked').count())) errors.push('answer not masked before reveal');
  if (await p.locator('#knStmt').inputValue().then(v => v.indexOf(ans4) >= 0)) errors.push('answer leaked in statement field');
  if (!(await p.locator('main .mv-kback-go').count())) errors.push('no back-link on kcase');
  await p.click('main .mv-unmask'); if (await p.locator('#knAns.mv-masked').count()) errors.push('unmask failed');
  await p.click('main .mv-kback-go'); await p.waitForTimeout(150);
  const qn4 = await p.evaluate(() => window.EPI_PROBLEMS.find(x => x.id === 'pb_quintic').stages.find(s => s.id === 'n4').q);
  if ((await p.locator('.simcard h3').first().textContent()) !== qn4) errors.push('back-link did not land on the stage');
  // دوباره روی همان گام ⇒ همان موقعیت (تکراری نمی‌سازد)
  const nK = await p.evaluate(() => APP.S.all('kcase').length);
  await p.click('.simcard .mv-stuck'); await p.waitForTimeout(150);
  if (await p.evaluate(() => APP.S.all('kcase').length) !== nK || await p.evaluate(() => APP.state.arg) !== kc1.id) errors.push('duplicate stuck case');
  // پس از دیدنِ پاسخ ⇒ seen:"yes"
  await go('e_prob', 'pb_quintic', 'sim:n5');
  { const n = await p.locator('.simcard .dopt').count(); for (let j = 0; j < n; j++) { const o = p.locator('.simcard .dopt').nth(j); if (await o.isDisabled()) continue; await o.click(); if (await p.locator('.simcard .btn:has-text("گام بعد")').count()) break; } }
  await p.click('.simcard .mv-stuck'); await p.waitForTimeout(200);
  const kc2 = await p.evaluate(() => APP.S.get(APP.state.arg));
  if (!kc2 || kc2.id === kc1.id || kc2.intake.seen !== 'yes' || kc2.src.sid !== 'n5') errors.push('stuck after reveal ' + JSON.stringify(kc2 && kc2.intake.seen));
  if (await p.locator('#knAns.mv-masked').count()) errors.push('answer masked although seen');
  await bad('kcase from stuck');

  /* ۹) تزریق: منبع لازم؛ بازبینِ تاریخی پرچم می‌زند و تأیید را تا اصلاح/پذیرش می‌بندد */
  await p.evaluate(() => {
    window.__ai = [];
    const decomp = { title: 'مسئلهٔ تزریقی', field: 'فیزیک', open: '۱۸۰۰–۱۹۰۰', statement: 's', why_hard: 'w', answer: 'a', src: [], era: { known: 'k', assumed: '', tools: 't' },
      stages: [{ id: 'n1', year: 1801, who: 'الف', ctx: 'c', q: 'q?', opts: [{ t: 'درست', ok: true, why: 'w' }, { t: 'نادرست', ok: false, why: 'w' }], move: 'm1', idea: 'i', st: [], lvl: 1, mv: ['mv_represent', 'mv_bogus'] },
        { id: 'n2', year: 1850, who: 'ب', ctx: 'c', q: 'q2?', opts: [{ t: 'درست', ok: true, why: 'w' }, { t: 'نادرست', ok: false, why: 'w' }], move: 'm2', idea: 'i', st: [], lvl: 2, mv: 'mv_contra' }],
      dead: [{ who: 'ج', year: 1820, idea: 'ایده', flaw: 'شکاف', st: [] }], lessons: [], drills: [] };
    APP.callAI = function (sys, user) {
      window.__ai.push({ sys, user });
      return Promise.resolve(window.__ai.length === 1 ? JSON.stringify(decomp) : 'نتیجه: ' + JSON.stringify([{ sid: 'n1', ok: true, issue: '' }, { sid: 'n2', ok: false, issue: 'سالِ ۱۸۵۰ در منابع نیست و نامطمئن است' }]));
    };
  });
  await go('e_prob', null, 'inject');
  await p.fill('#pbIn_title', 'مسئلهٔ تزریقی'); await p.fill('#pbIn_statement', 'صورت'); await p.fill('#pbIn_answer', 'پاسخ');
  const nRec0 = await p.evaluate(() => APP.S.all('eprob').length);
  await p.click('main .pb-ai'); await p.waitForTimeout(200);
  if (await p.evaluate(() => window.__ai.length) !== 0 || await p.evaluate(() => APP.S.all('eprob').length) !== nRec0) errors.push('AI ran without a source');
  await p.fill('#pbIn_src', 'کتابِ تاریخِ فیزیک، فصل ۳\nhttps://example.org/source');
  await p.click('main .pb-ai'); await p.waitForTimeout(600);
  const ai = await p.evaluate(() => window.__ai);
  if (ai.length !== 2) errors.push('ai calls ' + ai.length);
  else {
    if (!/mv_special/.test(ai[0].sys) || !/era/.test(ai[0].sys)) errors.push('PROB_SYS lacks mv/era');
    if (ai[1].sys !== await p.evaluate(() => APP.PROB_VERIFY_SYS) || !/example\.org/.test(ai[1].user) || !/"n2"/.test(ai[1].user)) errors.push('verifier call input');
  }
  const rec = await p.evaluate(() => APP.S.all('eprob', r => r.status === 'pending' && r.p.title === 'مسئلهٔ تزریقی')[0]);
  info.verify = rec && rec.verify && rec.verify.flags.map(f => f.sid + ':' + f.state);
  if (!rec || !rec.verify || rec.verify.flags.length !== 2 || !rec.verify.flags.some(f => f.sid === 'n2') || !rec.verify.flags.some(f => f.sid === 'd1')) errors.push('verify flags ' + JSON.stringify(info.verify));
  if (rec && (rec.p.stages[0].mv.join() !== 'mv_represent' || rec.p.stages[1].mv.join() !== 'mv_contra' || !rec.p.era || rec.p.era.assumed !== undefined)) errors.push('validP mv/era ' + JSON.stringify(rec && [rec.p.stages.map(s => s.mv), rec.p.era]));
  await go('e_prob', null, 'pending');
  const card = p.locator('main section.card', { hasText: 'مسئلهٔ تزریقی' });
  if ((await card.locator('.mv-flagged').count()) !== 2) errors.push('flagged highlight ' + await card.locator('.mv-flagged').count());
  if (!(await card.locator('.mv-flag.open', { hasText: 'سالِ ۱۸۵۰' }).count())) errors.push('issue text not shown');
  if (!(await card.locator('.mv-approve').isDisabled())) errors.push('approve not blocked');
  // «اصلاح کردم» بی‌تغییر ⇒ پذیرفته نمی‌شود
  await card.locator('li[data-sid="n2"] .mv-fix').click(); await p.waitForTimeout(100);
  if (await p.evaluate(() => APP.S.all('eprob', r => r.p.title === 'مسئلهٔ تزریقی')[0].verify.flags.find(f => f.sid === 'n2').state) !== 'open') errors.push('fix accepted without change');
  // اصلاحِ واقعی در JSON
  if (!(await card.locator('details').evaluate(d => d.open))) errors.push('unchanged «fix» should open the JSON editor');
  await card.locator('details').evaluate(d => { d.open = true; });
  const ta = card.locator('textarea.mono');
  const js = JSON.parse(await ta.inputValue()); js.stages[1].year = 1851; js.stages[1].who = 'ب (با منبع)';
  await ta.fill(JSON.stringify(js, null, 1));
  await card.locator('li[data-sid="n2"] .mv-fix').click(); await p.waitForTimeout(150);
  const card2 = p.locator('main section.card', { hasText: 'مسئلهٔ تزریقی' });
  if (!(await card2.locator('.mv-approve').isDisabled())) errors.push('approve open with d1 still flagged');
  await card2.locator('li[data-sid="d1"] .mv-accept').click(); await p.waitForTimeout(150);
  const card3 = p.locator('main section.card', { hasText: 'مسئلهٔ تزریقی' });
  if (await card3.locator('.mv-approve').isDisabled()) errors.push('approve still blocked after fix+accept');
  await card3.locator('.mv-approve').click(); await p.waitForTimeout(150);
  const fin = await p.evaluate(() => { const r = APP.S.all('eprob', r => r.p.title === 'مسئلهٔ تزریقی')[0]; return { st: r.status, year: r.p.stages[1].year, flags: r.verify.flags.map(f => f.sid + ':' + f.state).join() }; });
  info.injectFinal = fin;
  if (fin.st !== 'approved' || fin.year !== 1851 || fin.flags !== 'n2:fixed,d1:accepted') errors.push('inject final ' + JSON.stringify(fin));
  // مسئلهٔ تأییدشده در شمارشِ حرکت‌ها
  if (!(await p.evaluate(() => APP.moveStages('mv_contra').some(x => x.p.title === 'مسئلهٔ تزریقی')))) errors.push('approved injected not counted');
  // بازبینی که شکست بخورد ⇒ پرچمِ کلیِ باز
  await p.evaluate(() => { let n = 0; APP.callAI = () => (++n === 1 ? Promise.resolve(JSON.stringify({ title: 'دومی', field: 'ف', statement: 'ص', answer: 'پ', why_hard: 'چ', stages: [{ q: 'q', ctx: 'c', opts: [{ t: 'x', ok: true, why: 'w' }, { t: 'y', ok: false, why: 'w' }], move: 'm', idea: 'i' }] })) : Promise.reject(new Error('شبکه قطع است'))); });
  await go('e_prob', null, 'inject');
  await p.fill('#pbIn_title', 'دومی'); await p.fill('#pbIn_statement', 'ص'); await p.fill('#pbIn_answer', 'پ'); await p.fill('#pbIn_src', 'منبع');
  await p.click('main .pb-ai'); await p.waitForTimeout(400);
  await go('e_prob', null, 'pending');
  const c4 = p.locator('main section.card', { hasText: 'دومی' });
  if (!(await c4.locator('.mv-approve').isDisabled()) || !(await c4.locator('.mv-flag.open', { hasText: 'شبکه قطع است' }).count())) errors.push('verifier failure must block approval');
  // تجزیهٔ دستیِ JSON (مالک) همچنان بی‌بازبینی تأیید می‌شود (رفتارِ پیشین)
  info.manualOk = await p.evaluate(() => APP.probOpenFlags({ by: 'user', p: {} }).length === 0);
  if (!info.manualOk) errors.push('manual JSON blocked');

  /* ۱۰) منو و درِ شروع */
  await p.evaluate(() => APP.goRoot('home')); await p.waitForTimeout(100);
  info.nav = await p.evaluate(() => { const L = document.querySelector('.navlist[data-sys="learn"]'); return { prob: !!L.querySelector('.nav[data-v="e_prob"]'), moves: !!L.querySelector('.nav[data-v="moves"]'), group: Array.from(L.querySelectorAll('.navg')).some(g => g.textContent === 'حلِ مسئله'), epi: !!document.querySelector('.navlist[data-sys="epi"] .nav[data-v="e_prob"]') }; });
  if (!info.nav.prob || !info.nav.moves || !info.nav.group || !info.nav.epi) errors.push('nav ' + JSON.stringify(info.nav));
  await p.click('.navlist[data-sys="learn"] .nav[data-v="e_prob"]'); await p.waitForTimeout(150);
  info.sysAfterLearnNav = await p.evaluate(() => APP.lastSys + ':' + APP.state.view);
  if (info.sysAfterLearnNav !== 'learn:e_prob') errors.push('learn-nav entry switched system: ' + info.sysAfterLearnNav);
  await p.click('main .mv-golist'); await p.waitForTimeout(100);
  if (await p.evaluate(() => APP.state.view) !== 'moves') errors.push('e_prob → moves link');
  await p.evaluate(() => APP.goRoot('e_home')); await p.waitForTimeout(100);
  await p.click('.navlist[data-sys="epi"] .nav[data-v="e_prob"]'); await p.waitForTimeout(100);
  if (await p.evaluate(() => APP.lastSys) !== 'epi') errors.push('factory entry left the factory');
  await go('start');
  const door = p.locator('main .door', { hasText: 'می‌خواهم حلِ مسئله‌های سخت را از روی مسیرِ واقعیِ کاشفانشان تمرین کنم' });
  if (!(await door.count())) errors.push('start door missing');
  else { await door.locator('.btn').click(); await p.waitForTimeout(100); if (await p.evaluate(() => APP.state.view) !== 'e_prob') errors.push('door target'); }

  /* ۱۱) موبایل */
  await p.setViewportSize({ width: 390, height: 844 });
  for (const v of [['moves'], ['move', 'mv_represent'], ['e_prob', 'pb_flt', 'era'], ['e_prob', 'pb_greek', 'path'], ['e_prob', 'pb_longitude', 'sim:n3'], ['e_prob', null, 'pending'], ['e_prob', null, 'inject'], ['kcase', kc1.id, 'in'], ['start']]) {
    await go(...v); const ov = await overflow(); if (ov > 2) errors.push('mobile overflow ' + v.join('/') + ' ' + ov);
  }
  await go('move', 'mv_control'); await p.click('main .mv-start'); await p.waitForTimeout(100);
  { const ov = await overflow(); if (ov > 2) errors.push('mobile overflow practice ' + ov); }
  await p.screenshot({ path: __dirname + '/../dist/shot_moves_mobile.png', fullPage: false });
  await p.setViewportSize({ width: 1280, height: 900 });
  await go('move', 'mv_invariant'); await p.screenshot({ path: __dirname + '/../dist/shot_moves.png', fullPage: true });

  console.log(JSON.stringify(info, null, 1));
  console.log(errors.length ? errors.join('\n') : 'NO ERRORS');
  await b.close();
})();
