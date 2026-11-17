// تورِ پولیا (دستهٔ ۱، دورِ ۲۹، سهمِ «prior» — ۲۰۲۶-۱۱-۱۷) — DECISIONS_R29: R3 / F17 (C139 یک داور: S1 B29·D11؛ D29-7 متنِ ساخته؛ B29·D25 دلیلِ گامِ دست‌نخورده) و C25-7′ (s28 p4)؛ C163، C164.
//  runners  بازپخشِ صفحه‌ایِ خودِ اجراهای دونده‌ها (tests/fixtures/r29_prior از T/round29X/<sid>/ctl و ai — فقط خواندن): B nB2، B pwB1، B pwB3، D tD1، C s28
//  bank     همهٔ ورودی‌های R3.prior_work در بانکِ مستقلِ tests/variants/VARIANTS_R29.json (۱۰۱–۱۳۷)
//  هیچ انتظاری به تاریخِ تقویم بسته نیست (روزِ صفحه منجمد / ساعتِ Playwright). LLA_FILE = ساختِ دیگر (قرمزِ نخست: ساختِ BASE29)؛ ONLY=runners|B_nB2|…|bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const vfile = (n) => [path.join(__dirname, 'variants', n), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', n); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f));
const BANK = (() => { const f = process.env.LLA_VARIANTS || vfile('VARIANTS_R29.json'); return f && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : []; })();

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  const section = async (name, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').includes(name)) return; try { await fn(); } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); } };
  const T0 = '2026-10-25';   // روزِ منجمدِ صفحه (هیچ انتظاری به آن بسته نیست)
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(T0 => {
    APP.S.loaded = true; window.__calls = []; window.__q = []; window.__day = T0; window.__noNav = true;
    APP.today = () => window.__day;
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }),
      remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => {
      __calls.push({ sys, user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r;
      const text = typeof t === 'string' ? t : JSON.stringify(t);
      return opts && opts.withMeta ? { text, files: [] } : text;
    };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    window.__turn = async (text, reply, actions) => {
      const n0 = __calls.length; __q.push(typeof actions === 'function' ? (u) => R({ reply: reply || 'باشه.', actions: actions(u) }) : R({ reply: reply || 'باشه.', actions: actions || [] }));
      await APP.ASSIST.send(text); __q.length = 0;
      const all = __calls.slice(n0), c = all.filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {};
      return { user: c.user || '', task: c.task || '', n: all.length, all: all.map(x => x.user) };
    };
    window.__fresh = (view) => { APP.go(view || 'home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); const st0 = APP.S.settings(); st0.profile = {}; APP.S.saveSettings(st0); };   // دورِ ۲۶: نمایه (سن/ضمیر) هم پاک می‌شود — سناریوی سالمند نباید «شما» را به بخشِ بعد ببرد
    window.__live = (title, st) => { const r = APP.liveCreate(title, st || (title + ' — صورتِ کاملِ مسئله برای آزمون.'), 'find', { by: 'user' }); return r.p.id; };
    window.__liveSet = (pid, fn) => { const pg = APP.S.get('eprog_' + pid) || { id: 'eprog_' + pid, type: 'eprog' }; pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {};
      ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L); APP.S.put(pg); };
    window.__L = (pid) => { const pg = APP.S.get('eprog_' + pid); return pg && pg.solve && pg.solve.live ? JSON.parse(JSON.stringify(pg.solve.live)) : null; };
    window.__M = (id) => { const M = APP.ROUTE.model(id); if (!M) return null; return { origin: M.origin, dest: M.dest, now: M.nowFa, remain: M.remain, reached: M.reached, pts: M.pts.map(q => ({ k: q.k, cls: q.cls, t: q.title, lines: q.lines, out: q.out, det: q.det })), dets: M.dets.map(d => ({ kind: d.kind, depth: d.depth, concept: d.concept, rejoin: d.rejoin, parent: d.parent, from: d.from, guess: d.guess })), backs: M.backs }; };
  }, T0);
  const head = (u) => String(u || '').split('# نوبتِ تازه')[0];
  const turn = (text, reply, actions) => p.evaluate(([t, r, a]) => __turn(t, r, a), [text, reply || '', actions || []]);
  const fresh = (v) => p.evaluate((v) => __fresh(v), v || 'home');
  const wipe = () => p.evaluate(() => __wipe());
  const Lv = (pid) => p.evaluate((pid) => __L(pid), pid);
  const Mo = (id) => p.evaluate((id) => __M(id), id);
  const cs = (o) => Object.assign({ do: 'coach_state' }, o);
  const bind = async (title, stmt) => p.evaluate(([t, stmt]) => { const pid = __live(t, stmt); APP.liveBindSession(pid, __cur()); __liveSet(pid, () => {}); return pid; }, [title, stmt]);
  const lcq = (pid, t) => p.evaluate(([pid, t]) => { const c = APP.liveCoach(pid, { turn: { text: t || 'باشه' } }); return { q: c.q || '', src: c.src || '' }; }, [pid, t]);
  const WQ = await p.evaluate(() => APP.liveWholeQ);
  const strip = () => p.evaluate(() => { APP.go('home'); const g = document.querySelector('#main .rt-geo'); return g ? g.textContent : ''; });
  const chips = (pid) => p.evaluate((pid) => { APP.go('lprob', pid); return [...document.querySelectorAll('#main .lp-fromchat')].map(x => (x.getAttribute('data-p23') || '') + '|' + x.textContent); }, pid);
  const E = {}; BANK.forEach((e, i) => { E[i] = e; });
  const own = (i) => /^R4\b|prior/i.test(String(E[i].rc || E[i].family || ''));
  const T = (i, ok, x) => { info.bank[i] = !!ok; chk(ok, 'bank#' + i + ' [' + E[i].rc + '/' + E[i].kind + '] «' + E[i].text.slice(0, 70) + '» → ' + E[i].expect.slice(0, 110) + ' :: ' + String(JSON.stringify(x)).slice(0, 700)); };
  const NC = (i, why) => { info.nc[i] = why; };
  const blockLine = (u) => (head(u).split('\n').filter(l => /^# مسئلهٔ زندهٔ این سشن/.test(l))[0] || '');
  const coachHead = (u) => (head(u).split('\n').filter(l => /^# مربیِ حل/.test(l))[0] || '');
  const sugOf = (u) => ((head(u).match(/پیشنهادِ این نوبت: «([^»]*(?:«[^»]*»[^»]*)*)»/) || [])[1] || '');
  const story = () => p.evaluate(() => { const s = __cur(); return JSON.parse(JSON.stringify((s.coach || {}).story || {})); });
  const items = async (key) => { const st = await story(); const k = key || Object.keys(st).pop(); return (st[k] || { items: [] }).items; };
  const sph = (pid) => p.evaluate((pid) => ({ form: APP.livePhase(pid), story: APP.liveStoryPhase(pid), turn: APP.liveTurnPhase ? APP.liveTurnPhase(pid) : APP.livePhase(pid) }), pid);
  const nat = { role: 'self', nat: 'practical', stuck: false, fail: false };
  const csn = (o) => cs(Object.assign({}, nat, o));
  const U1 = /به مجهول نگاه کن|مجهول(?: \(یا حکمی که باید ثابت شود\))? چیست|حکم چیست/;
  const liveOf = (sid) => p.evaluate((sid) => { const r = APP.S.all('eprob').filter(x => x.sess === sid).pop(); return r ? r.p.id : ''; }, sid);
  const PR = (pid) => p.evaluate((pid) => { const s = __cur(); const pr = APP.STORY.priorFor(pid ? null : s, pid || ''); return pr ? JSON.parse(JSON.stringify(pr)) : null; }, pid || '');
  const PQ = (pid) => p.evaluate((pid) => APP.STORY.priorTurnQ(pid ? null : __cur(), pid || ''), pid || '');
  const ppr = (text, prior, o) => turn(text, (o && o.reply) || 'کارت را دیدم.', [csn(Object.assign({ ph: 'e', said: [], prior }, (o && o.cs) || {}))]);
  const bold = (u) => head(u).split('\n').filter(l => /\*\*پرسشِ این نوبت همین است/.test(l)).join('\n');
  const ask = (u) => /کارِ پیشینِ خودش را دارد \(گام‌هایی که خودش برداشته\)/.test(head(u));
  const evs = () => p.evaluate(() => (__cur().coachEv || []).filter(e => e.src === 'prior').map(e => ({ ok: e.ok, prior: e.prior, cause: e.cause, how: e.how, wd: !!e.wd })));
  const mind = () => p.evaluate(() => { const R = APP.MIND.phases(); const rows = Array.isArray(R) ? R : (R.rows || Object.values(R)); const ex = rows.filter(x => x && x.id === 'exec')[0] || {}; return (ex.acts || []).map(a => (a.ok ? '+' : '-') + a.fa + '|' + (a.cause || '')); });
  const st = (pr) => pr && pr.steps.map(x => [x.n, x.verdict, x.her || '', x.fixed ? 'F' : '', x.stale ? 'S' : '', (x.depWrong || []).join(), (x.depStale || []).join(), x.re ? 'R' : '']);
  const setHer = (n, v) => p.evaluate(([n, v]) => { const s = __cur(), k = String(s.coach.pk || 'c:0'); const x = s.coach.story[k].prior.steps[n - 1]; x.her = v; x.herAt = APP.nowISO(); if (v === 'no') { delete x.reAt; delete x.re; x.turns = 0; } APP.S.put(s); }, [n, v]);
  const PRIOR_BLK = /^# کارِ پیشینِ تو/m;
  const priorBlk = (u) => head(u).split('\n# ').filter(b => /^(?:# )?کارِ پیشینِ تو/.test(b)).join('\n');
  const st9 = (pr) => pr && pr.steps.map(x => [x.n, x.verdict, x.fixed ? 'F' : '', x.stale ? 'S' : '', x.retry ? 'R' + (x.retry.nc ? 'nc' : '') : '', (x.depStale || []).join()]);
  const NOTREAD = /متنِ تازه هنوز نمی‌خواند/;
  const storyTxt = () => p.evaluate(() => { const s = __cur(), T = (s.coach || {}).story || {}, o = []; Object.keys(T).forEach(k => (T[k].items || []).forEach(x => { o.push(String(x.t || '')); (x.lines || []).forEach(l => o.push(String(l))); })); return o; });

  // ================= runners: page-level replays (C101 (c), C137) — the runners' own ctl steps + recorded model replies (tests/fixtures/r29_prior, from T/round29X) =================
  const { replay } = require('./tour1_r26_replay');
  const FXD = path.join(__dirname, 'fixtures', 'r29_prior');
  const rp = async (name, upto, fn) => { if (process.env.ONLY && !process.env.ONLY.split(',').some(o => o === 'runners' || o === name)) return; let R = null;
    try { R = await replay(b, name, { dir: FXD, upto }); await fn(R); info.replay = info.replay || {}; info.replay[name] = 'ran'; } catch (e) { errors.push(name + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); }
    if (R) { R.errors.forEach(e => errors.push(name + ' ' + e)); await R.close(); } };
  const RS = (R) => R.p.evaluate(() => { const s = APP.ASSIST.cur(), bl = APP.ASSIST.boundLive ? APP.ASSIST.boundLive(s) : null, pid = bl && !bl.done ? bl.pid : '', pr = APP.STORY.priorFor(s, pid);
    const T = (s.coach || {}).story || {}, items = []; Object.keys(T).forEach(k => (T[k].items || []).forEach(x => { items.push(String(x.t || '')); (x.lines || []).forEach(l => items.push(String(l))); }));
    return { pr: pr ? JSON.parse(JSON.stringify(pr)) : null, lines: pr ? APP.STORY.priorLines(pr) : [], coach: pr ? APP.STORY.priorLines(pr, true) : [], items, tq: APP.STORY.priorTurnQ ? APP.STORY.priorTurnQ(s, pid) : '' }; });
  const callFor = (R, re) => { const c = R.calls.filter(x => re.test(String(x.user).split('# نوبتِ تازه').pop())); return c.length ? c[c.length - 1].user : ''; };

  // B nB2 p2 — S1 B29·D11: her correct fix of step 4 is applied (one judge, C139); p2's prompt shows the unchanged step-4 reason intact (B29·D25)
  await rp('B_nB2', 3, async (R) => {
    const o = await RS(R), x = o.pr && o.pr.steps[3];
    chk(!!x && x.verdict === 'ok' && x.fixed && /۱ میلیون و ۸۵۰/.test(x.fixed.t) && !x.retry && o.pr.resume !== 4, 'B29·D11 (nB2 p2 «۸ میلیون منهای ۶ میلیون و ۱۵۰ میشه ۱ میلیون و ۸۵۰»): the engine reads ✓ and the ledger applies her fix — never «متنِ تازه هنوز نمی‌خواند» :: ' + JSON.stringify(st9(o.pr)) + ' ' + (o.pr && o.pr.sum));
    chk(!o.items.some(l => NOTREAD.test(l)), 'B29·D11: no «… هنوز نمی‌خواند» line in her 📜 :: ' + o.items.filter(l => NOTREAD.test(l)).join(' ¦ ').slice(0, 400));
    const L4 = (head(callFor(R, /رنگ‌کار گفت دستمزدش/)).split('\n').filter(l => /گامِ ۴ ·/.test(l))[0] || '');
    chk(/✓ درست/.test(L4) && !/نمی‌خواند/.test(L4), 'B29·D11: the coach is told گامِ ۴ ✓ on the next turn (p3) :: ' + L4.slice(0, 300));
    const L2 = (head(callFor(R, /۸ میلیون منهای ۶ میلیون و ۱۵۰ میشه ۱ میلیون و ۸۵۰/)).split('\n').filter(l => /گامِ ۴ ·/.test(l))[0] || '');
    chk(/با ۲ میلیون و ۸۵۰ نمی‌خواند/.test(L2) && !/کنار رفت/.test(L2), 'B29·D25 (nB2 p2): the unchanged step-4 reason «… با ۲ میلیون و ۸۵۰ نمی‌خواند» is not cut at «و» and not stamped «کنار رفت» :: ' + L2.slice(0, 300));
    chk(!/گامِ ۴/.test(o.tq || ''), 'B29·D11: the turn question no longer asks her to re-check گامِ ۴ :: ' + o.tq);
  });
  // B nB2 p14 — the second shape «۸ میلیون منهای ۶ میلیون و ۶۰۰ = ۱ میلیون و ۴۰۰» (after the moves T23): still no «نمی‌خواند» in 📜
  await rp('B_nB2', 25, async (R) => {
    const o = await RS(R);
    chk(!o.items.some(l => NOTREAD.test(l)), 'B29·D11 second shape (nB2 p14): no «… هنوز نمی‌خواند» line anywhere in her 📜 :: ' + o.items.filter(l => NOTREAD.test(l)).join(' ¦ ').slice(0, 400));
  });
  // D tD1 p5–p13 — D29-7: no page-made «متنِ تازه‌ات»; later messages are not redos of step 1
  await rp('D_tD1', 21, async (R) => {
    const o = await RS(R), x = o.pr && o.pr.steps[0];
    chk(!!x && !(x.retry && /۵٫۵ متر در ۴ متر = ۲۰/.test(x.retry.t)) && !(x.fixed && /۵٫۵ متر در ۴ متر = ۲۰/.test(x.fixed.t)), 'D29-7 (tD1 p5–p8): step 1 never gets the fabricated sentence «پذیرایی ۵٫۵ متر در ۴ متر = ۲۰» :: ' + JSON.stringify(x && { retry: x.retry, fixed: x.fixed && x.fixed.t }));
    chk(!!x && !(x.retry && /قرنیز|نردبون|اتاقِ خواب/.test(x.retry.t)) && !(x.fixed && /قرنیز|نردبون|اتاقِ خواب/.test(x.fixed.t)), 'D29-7 (tD1 p11–p13): «قرنیز …»، «نردبون …»، «اتاقِ خواب …» are not new texts of step 1 :: ' + JSON.stringify(x && { retry: x.retry, fixed: x.fixed && x.fixed.t }));
    chk(!o.items.some(l => /گامِ ۱ متنِ تازه هنوز نمی‌خواند/.test(l)), 'D29-7: no «گامِ ۱ متنِ تازه هنوز نمی‌خواند» line in 📜 :: ' + o.items.filter(l => NOTREAD.test(l)).join(' ¦ ').slice(0, 400));
    chk(!!x && (x.stale || (x.fixed && /۵٫۵ متر در ۴ متر میشه ۲۲/.test(x.fixed.t))), 'D29-7 / C164: step 1 is stale after «۵ ⇒ ۵٫۵», or carries her OWN redo «۵٫۵ متر در ۴ متر میشه ۲۲» :: ' + JSON.stringify(st9(o.pr)));
  });
  // C s28 p4 — C25-7′: the second problem's opening with her ready work gets the prior-work block
  await rp('C_s28', 18, async (R) => {
    const u = callFor(R, /نسخه‌ی سه‌شنبه رو آوردم/);
    chk(!!u && PRIOR_BLK.test(head(u)) && ask(u), 'C25-7′ (s28 p4 «جلسه دوم: نسخه‌ی سه‌شنبه رو آوردم … فهرست کردم … ⇒ ۱۳/۲۷»): the prompt carries «# کارِ پیشینِ تو» with the opening request :: ' + priorBlk(u).slice(0, 200));
  });
  // B pwB3 / pwB1 — B29·D25: an unchanged step keeps its reason byte-exact, no «دیگر برقرار نیست کنار رفت»
  await rp('B_pwB3', 3, async (R) => {
    const o = await RS(R), bad = o.lines.concat(o.coach).filter(l => /دیگر برقرار نیست کنار رفت/.test(l));
    chk(o.pr && !bad.length, 'B29·D25 (pwB3, ledger step 1 «۳۶ ÷ ۲ = ۱۸ و نصفِ محیط…»): no «دلیلِ پیشینی که دیگر برقرار نیست کنار رفت» on an unchanged step :: ' + bad.join(' ¦ ').slice(0, 400));
    const s1 = o.pr && o.pr.steps[0], L1 = o.lines.filter(l => /^گامِ ۱ ·/.test(l))[0] || '';
    chk(!s1 || !s1.why || L1.indexOf(s1.why) >= 0 || (s1.fixed && s1.verdict === 'ok'), 'B29·D25: the reason of step 1 is shown byte-exact :: ' + JSON.stringify(s1 && s1.why) + ' | ' + L1.slice(0, 300));
  });
  await rp('B_pwB1', 31, async (R) => {
    const o = await RS(R), bad = o.lines.concat(o.coach).filter(l => /دیگر برقرار نیست کنار رفت/.test(l)), fixedBy = (o.pr ? o.pr.steps : []).filter(x => x.fixed && x.verdict === 'ok').map(x => x.n);
    chk(o.pr && bad.every(l => { const n = +((l.match(/^گامِ ([۰-۹]+)/) || [])[1] || '').replace(/[۰-۹]/g, c => c.charCodeAt(0) - 1776); const x = o.pr.steps[n - 1]; return x && /گام|هنوز/.test(x.why || ''); }),
      'B29·D25 (pwB1 post, steps 1/5 «۶٫۷، ۶٫۳»): «کنار رفت» only where a clause was really dropped :: ' + bad.join(' ¦ ').slice(0, 500) + ' fixed ' + fixedBy);
  });

  // ================= bank: every R3.prior_work entry of T/VARIANTS_R29.json (101–137); the «model» here is a scripted coach_state, the judging is the page's =================
  await section('bank', async () => {
    const own = (i) => /^R3\b/.test(String(E[i].rc || ''));
    const OPEN = 'سلام. ماهِ دیگه اسباب‌کشی داریم. خودم حساب کردم: گام ۱: کامیون ۳ میلیون و ۶۰۰ + کارگر ۱ میلیون و ۴۰۰ = ۵ میلیون. گام ۲: ۳۰ تا کارتن، چون سه اتاق و یه آشپزخونه داریم: ۳۰ × ۲۵ هزار = ۷۵۰ هزار. گام ۳: ۵ میلیون + ۷۵۰ هزار = ۵ میلیون و ۷۵۰. گام ۴: از ۹ میلیون بودجه: ۹ میلیون منهای ۵ میلیون و ۷۵۰ میشه ۴ میلیون و ۲۵۰. تا کجاش درسته؟';
    const OPRIOR = [{ step: 'کامیون و کارگر', quote: 'کامیون ۳ میلیون و ۶۰۰ + کارگر ۱ میلیون و ۴۰۰ = ۵ میلیون', verdict: 'ok', why: '۳٫۶ + ۱٫۴ = ۵ میلیون' },
      { step: 'کارتن', quote: '۳۰ تا کارتن، چون سه اتاق و یه آشپزخونه داریم: ۳۰ × ۲۵ هزار = ۷۵۰ هزار', verdict: 'ok', why: '۳۰ تا کارتن، چون سه اتاق و یه آشپزخونه داریم' },
      { step: 'جمع', quote: '۵ میلیون + ۷۵۰ هزار = ۵ میلیون و ۷۵۰', verdict: 'ok', why: 'جمعِ دو هزینه' },
      { step: 'باقی‌مانده', quote: '۹ میلیون منهای ۵ میلیون و ۷۵۰ میشه ۴ میلیون و ۲۵۰', verdict: 'wrong', why: 'تفریق با ۴ میلیون و ۲۵۰ نمی‌خواند' }];
    const move = async () => { await wipe(); await fresh(); const r = await ppr(OPEN, OPRIOR); return r; };
    const PRs = () => p.evaluate(() => { const s = __cur(); const pr = APP.STORY.priorFor(s, ''); return pr ? JSON.parse(JSON.stringify(pr)) : null; });
    const lines = (coach) => p.evaluate((c) => { const pr = APP.STORY.priorFor(__cur(), ''); return pr ? APP.STORY.priorLines(pr, c) : []; }, !!coach);
    const ledgerSig = (pr) => JSON.stringify(pr && pr.steps.map(x => [x.n, x.verdict, x.fixed ? x.fixed.t : '', !!x.stale, x.retry ? x.retry.t : '', x.say ? 1 : 0]));
    const fix4 = (t) => ppr(t, [{ n: 4, quote: t.replace(/^.*?:\s*/, '').replace(/^آهان،\s*|^آره،\s*/, ''), verdict: 'ok', why: 'خودش دوباره حساب کرد' }]);
    const allLedgers = () => p.evaluate(() => { const o = {}; APP.S.all('eprog').forEach(pg => { const P = pg.solve && pg.solve.live && pg.solve.live.prior; if (P) o[pg.id] = P.steps.length; });
      APP.S.all('achat').forEach(se => { const T = (se.coach || {}).story || {}; Object.keys(T).forEach(k => { if (T[k].prior) o[se.id + '|' + k] = T[k].prior.steps.length; }); }); return o; });
    const inert = async (i, t) => { await move(); const b4 = ledgerSig(await PRs()); const r = await turn(t, 'باشه.', [csn({ ph: 'e', said: [] })]); const a = await PRs(); const S = await storyTxt();
      return { ok: ledgerSig(a) === b4 && !S.some(l => NOTREAD.test(l) || /متنِ تازه/.test(l)), r, a, b4 }; };
    for (let i = 0; i < BANK.length; i++) { if (!own(i)) continue; const t = E[i].text.replace(/^.*U: /s, '').split(' ‖ ').pop().replace(/^U: /, '');
      try {
        if (i === 101 || i === 102 || i === 132 || i === 134 || i === 110 || i === 126) {
          if (i === 132) { await wipe(); await fresh(); await ppr('خودم حساب کردم: گام ۱: کامیون ۲ میلیون و ۸۰۰ + کارگر ۱ میلیون و ۷۰۰ = ۴ میلیون و ۵۰۰. گام ۲: ۷ میلیون منهای ۴ میلیون و ۵۰۰ = ۳ میلیون و ۵۰۰. درسته؟',
              [{ step: 'جمع', quote: 'کامیون ۲ میلیون و ۸۰۰ + کارگر ۱ میلیون و ۷۰۰ = ۴ میلیون و ۵۰۰', verdict: 'ok' }, { step: 'باقی', quote: '۷ میلیون منهای ۴ میلیون و ۵۰۰ = ۳ میلیون و ۵۰۰', verdict: 'ok' }]);
            await ppr(t, [{ n: 2, quote: '۷ میلیون منهای ۴ میلیون و ۵۰۰ میشه ۲ میلیون و ۵۰۰', verdict: 'ok' }]); const pr = await PRs(), q = await PQ();
            T(i, pr.steps[1].verdict === 'ok' && pr.steps[1].fixed && !pr.steps[1].retry && pr.resume !== 2 && !/گامِ ۲/.test(q), { st: st9(pr), q }); continue; }
          await move(); const r = await fix4('آهان، ۹ میلیون منهای ۵ میلیون و ۷۵۰ میشه ۳ میلیون و ۲۵۰'); const pr = await PRs(), q = await PQ(), S = await storyTxt(), L = await lines(), x = pr.steps[3];
          if (i === 101) T(i, x.verdict === 'ok' && x.fixed && !x.retry && pr.resume !== 4 && !/گامِ ۴/.test(q), { st: st9(pr), q });
          else if (i === 102) T(i, x.verdict === 'ok' && x.fixed && /۴ میلیون و ۲۵۰/.test(x.fixed.was) && !S.some(l => NOTREAD.test(l)) && !/گامِ ۴/.test(q), { st: st9(pr), S: S.slice(-3) });
          else if (i === 110 || i === 126) { const L2 = L.filter(l => /^گامِ ۲ ·/.test(l))[0] || '';
            T(i, L2.indexOf('۳۰ تا کارتن، چون سه اتاق و یه آشپزخونه داریم') >= 0 && !/کنار رفت|اصلاح شد/.test(L2) && !pr.steps[1].fixed, { L2 }); }
          else { const ev = await p.evaluate(() => (__cur().coachEv || []).filter(e => e.src === 'prior').map(e => ({ ok: e.ok, prior: e.prior, how: e.how })));
            T(i, x.verdict === 'ok' && x.fixed && ev.some(e => e.ok && e.prior === 4 && e.how === 'priorfix') && /۴ گام — ۴ درست/.test(pr.sum), { ev, sum: pr.sum }); }
        } else if (i === 103) { await move();
          await turn('کامیون ۳ میلیون و ۶۰۰ نیست، ۴ میلیون', 'باشه.', [csn({ ph: 'e', said: [], retract: { msg: 'کامیون ۳ میلیون و ۶۰۰', what: 'fact', fix: '۴ میلیون', old: '۳ میلیون و ۶۰۰', rests: [] } })]);
          await ppr('پس ۹ میلیون منهای ۶ میلیون و ۱۵۰ = ۲ میلیون و ۸۵۰', [{ n: 4, quote: '۹ میلیون منهای ۶ میلیون و ۱۵۰ = ۲ میلیون و ۸۵۰', verdict: 'ok' }]); const pr = await PRs(), x = pr.steps[3], S = await storyTxt();
          T(i, x.fixed && /۲ میلیون و ۸۵۰/.test(x.fixed.t) && x.verdict === 'ok' && !x.retry && !S.some(l => NOTREAD.test(l)), { st: st9(pr) });
        } else if (i === 104) { await move(); const r = await fix4(t); const pr = await PRs(), x = pr.steps[3], u = (await turn('باشه', 'باشه.', [csn({ ph: 'e', said: [] })])).user;
          const L4 = head(u).split('\n').filter(l => /گامِ ۴ ·/.test(l))[0] || '', Lh = (await lines()).filter(l => /^گامِ ۴ ·/.test(l))[0] || '';
          T(i, x.verdict === 'wrong' && !x.fixed && x.retry && !x.retry.nc && /۳ میلیون و ۲۵۰ هزار/.test(L4) && /۳ میلیون و ۹۹۹ هزار و ۲۵۰/.test(L4) && !/۳ میلیون و ۲۵۰ هزار/.test(Lh), { st: st9(pr), L4: L4.slice(0, 500), Lh: Lh.slice(0, 300) });
        } else if (i === 105) { await move(); await ppr(t, [{ n: 4, quote: t.replace(/^گامِ ۴:\s*/, ''), verdict: 'ok' }]); const pr = await PRs(), x = pr.steps[3];
          T(i, x.verdict === 'ok' && x.fixed && !x.retry, { st: st9(pr) });
        } else if (i === 106) { await move(); const r = await turn(t, 'باشه.', [csn({ ph: 'e', said: [] })]); const u = (await turn('باشه', 'باشه.', [csn({ ph: 'e', said: [] })])).user;
          const L4 = head(u).split('\n').filter(l => /گامِ ۴ ·/.test(l))[0] || '';
          T(i, /✗ نادرست/.test(L4) && !/صفحه سنجید: درست/.test(L4) && /حسابِ صفحه/.test(L4), { L4: L4.slice(0, 400) });
        } else if ([107, 109, 120, 121, 122, 128, 135, 136, 137].includes(i)) { const o = await inert(i, t);
          const extra = i === 122 ? o.a.steps[3].verdict === 'wrong' && !o.a.steps[3].fixed : true; T(i, o.ok && extra, { b4: o.b4, a: ledgerSig(o.a) });
        } else if (i === 108) { await wipe(); await fresh();
          await ppr('خودم حساب کردم: گام ۱: پذیرایی ۵ متر در ۴ متر = ۲۰ مترمربع. گام ۲: هر مترمربع ۸۵۰ هزار، پس ۲۰ × ۸۵۰ = ۱۷۰۰۰ هزار تومن. درسته؟',
            [{ step: 'مساحت', quote: 'پذیرایی ۵ متر در ۴ متر = ۲۰ مترمربع', verdict: 'ok' }, { step: 'هزینه', quote: '۲۰ × ۸۵۰ = ۱۷۰۰۰ هزار تومن', verdict: 'ok' }]);
          await turn(t, 'باشه.', [csn({ ph: 'e', said: [], retract: { msg: 'پذیرایی ۵ متر', what: 'fact', fix: '۵٫۵ متر', old: '۵ متر', rests: [] } })]);
          await turn('قرنیز هم دورِ پذیرایی ۲ × (۵ + ۴) = ۱۸ متره', 'باشه.', [csn({ ph: 'e', said: ['result'] })]);
          const pr = await PRs(), x = pr.steps[0], S = await storyTxt();
          T(i, !(x.retry && /۵٫۵ متر در ۴ متر = ۲۰/.test(x.retry.t)) && !(x.fixed && /= ۲۰/.test(x.fixed.t) && /۵٫۵/.test(x.fixed.t)) && !S.some(l => /گامِ ۱ متنِ تازه/.test(l)) && !(x.retry && /قرنیز/.test(x.retry.t)), { st: st9(pr), x: { retry: x.retry, fixed: x.fixed, stale: x.stale } });
        } else if (i === 111) { await wipe(); await fresh();
          await ppr('یه قاب ۳۶ سانتی، طول ۱۰. خودم حساب کردم: گام ۱: ۳۶ ÷ ۲ = ۱۸ و نصفِ محیط همینه. گام ۲: ۱۸ − ۱۰ = ۹، پس عرض ۹. درسته؟',
            [{ step: 'نصفِ محیط', quote: '۳۶ ÷ ۲ = ۱۸ و نصفِ محیط همینه', verdict: 'ok', why: '۳۶ ÷ ۲ = ۱۸ و نصفِ محیط همینه' }, { step: 'عرض', quote: '۱۸ − ۱۰ = ۹، پس عرض ۹', verdict: 'wrong', why: 'تفریق نمی‌خواند' }]);
          await ppr('گامِ ۲ رو درست کردم: ۱۸ − ۱۰ = ۸، پس عرض ۸', [{ n: 2, quote: '۱۸ − ۱۰ = ۸، پس عرض ۸', verdict: 'ok' }]);
          const L = (await lines()).concat(await lines(true)), L1 = L.filter(l => /^گامِ ۱ ·/.test(l)), pr = await PRs();
          T(i, L1.length && L1.every(l => l.indexOf('۳۶ ÷ ۲ = ۱۸ و نصفِ محیط همینه') >= 0 && !/کنار رفت/.test(l)) && pr.steps[1].fixed, { L1, st: st9(pr) });
        } else if (i === 112) { await move(); await ppr(t, [{ n: 2, quote: '۳۲ تا کارتن، چون انباری هم هست: ۳۲ × ۲۵ هزار = ۸۰۰ هزار', verdict: 'ok' }]); const pr = await PRs(), L = await lines(), x = pr.steps[1];
          const props = JSON.stringify(pr.steps.slice(2).map(y => y.stale && y.stale.nums));
          if (x.fixed && /۸۰۰ هزار/.test(x.fixed.t) && /۵٫۸|۵۸۰۰|۵ میلیون و ۸۰۰/.test(props)) T(i, true, {});
          else NC(i, 'PARTIAL — step 2 fixed: ' + !!(x.fixed && /۸۰۰ هزار/.test(x.fixed.t)) + '; exact proposals for steps 3/4 come from the correction engine (a38 A.livePriorStale, C89 — correction fixer R2) :: ' + JSON.stringify(st9(pr)) + ' ' + props.slice(0, 200));
        } else if (i === 113 || i === 114) { await move(); const n0 = await allLedgers(); const r = await turn(t, 'باشه.', [csn({ ph: 'e', said: [] })]); const n1 = await allLedgers(), pr = await PRs();
          if (i === 113) T(i, ask(r.user) && Object.values(n0).concat(Object.values(n1)).every(v => v <= 4) && (!pr || pr.steps.length <= 4), { ask: ask(r.user), n0, n1, blk: priorBlk(r.user).slice(0, 200) });
          else NC(i, 'the dossier and its 🧭 strip per problem are the story fixer\'s (R6, B29·D15); the prior half (separate ledgers, prior block at the second opening) is asserted in #113 :: ' + JSON.stringify(n1));
        } else if (i === 115 || i === 131) { await wipe(); await fresh(); const r = await turn(i === 131 ? 'خودم حساب کردم: گام ۱: کامیون ۲ میلیون و ۸۰۰ + کارگر ۱ میلیون و ۷۰۰ = ۴ میلیون و ۵۰۰ · گام ۲: ۷ میلیون منهای ۴ میلیون و ۵۰۰ = ۳ میلیون و ۵۰۰' : t, 'باشه.', []);
          if (i === 115) { T(i, ask(r.user), { blk: priorBlk(r.user).slice(0, 200) }); continue; }
          await wipe(); await fresh(); await ppr('خودم حساب کردم: گام ۱: کامیون ۲ میلیون و ۸۰۰ + کارگر ۱ میلیون و ۷۰۰ = ۴ میلیون و ۵۰۰ · گام ۲: ۷ میلیون منهای ۴ میلیون و ۵۰۰ = ۳ میلیون و ۵۰۰',
            [{ step: 'جمع', quote: 'کامیون ۲ میلیون و ۸۰۰ + کارگر ۱ میلیون و ۷۰۰ = ۴ میلیون و ۵۰۰', verdict: 'ok' }, { step: 'باقی', quote: '۷ میلیون منهای ۴ میلیون و ۵۰۰ = ۳ میلیون و ۵۰۰', verdict: 'ok' }]);
          const pr = await PRs(), L = await lines(true), L2 = L.filter(l => /^گامِ ۲ ·/.test(l))[0] || '';
          T(i, ask(r.user) && pr.steps[0].verdict === 'ok' && pr.steps[1].verdict === 'wrong' && pr.resume === 2 && /۲ میلیون و ۵۰۰ هزار/.test(L2) && /۲ میلیون و ۹۹۹ هزار و ۵۰۰/.test(L2), { st: st9(pr), L2: L2.slice(0, 400) });
        } else if (i === 116 || i === 133) { NC(i, 'closure-and-reopen flow (C56 merge after closure / C97 new problem after closure) is the r28 prior + story path, unchanged this round; asserted in test_tour1_r28_prior bank #219/#245/#252 and the r28 D28-6 section');
        } else if (i === 117) { await move(); const r = await turn(t, 'باشه.', [csn({ ph: 'e', said: [] })]); const pr = await PRs(), x = pr.steps[3];
          T(i, x.verdict === 'wrong' && !x.fixed, { st: st9(pr) });
        } else if ([118, 119].includes(i)) { await wipe(); await fresh(); const r = await turn(t, 'باشه.', []); T(i, !ask(r.user) && !PRIOR_BLK.test(head(r.user)), { blk: priorBlk(r.user).slice(0, 200) });
        } else if ([123, 127].includes(i)) { await move(); const n0 = await allLedgers(); const r = await turn(t, 'باشه.', [csn({ ph: 'e', said: [] })]); const n1 = await allLedgers(), pr = await PRs();
          T(i, !ask(r.user) && Object.values(n1).every(v => v <= 4) && Object.values(n1).filter(v => v === 4).length === 1, { n0, n1 });
        } else if (i === 124) { await move(); await turn(t, 'باشه.', [csn({ ph: 'e', said: [] })]); const q = await PQ(), pr = await PRs();
          T(i, !/گامِ [۱۲۳] /.test(q) && pr.steps.slice(0, 3).every(x => x.verdict === 'ok' && !x.re), { q });
        } else if (i === 125) { await move(); await turn(t, 'درسته.', [csn({ ph: 'e', said: ['result'], step: { quote: '۹ میلیون منهای ۵ میلیون و ۷۵۰ میشه ۳ میلیون و ۲۵۰', done: 'yes' } })]); const pr = await PRs(), x = pr.steps[3];
          T(i, x.verdict === 'ok' && x.fixed && !x.retry, { st: st9(pr) });
        } else if (i === 129 || i === 130) { const o = await inert(i, t); const ow = await p.evaluate((t) => { const r = APP.STORY.otherWork27 ? APP.STORY.otherWork27(t) : null; return r ? r.text || '' : ''; }, t);
          T(i, o.ok && (i === 130 ? /۷۵۰/.test(ow) : !/۱۸ \+ ۱۲/.test(ow)), { a: ledgerSig(o.a), ow });
        } else NC(i, 'not exercised');
      } catch (ex) { T(i, false, 'exception ' + String(ex).slice(0, 300)); }
    }
    console.log('bank R3: ' + Object.values(info.bank).filter(Boolean).length + '/' + Object.keys(info.bank).length + ' pass; nc: ' + JSON.stringify(info.nc));
  });

  await b.close();
  console.log(JSON.stringify(info));
  if (errors.length) { console.log('FAIL ' + errors.length + '\n' + errors.join('\n')); process.exit(1); }
  console.log('PASS test_tour1_r29_prior');
})();
