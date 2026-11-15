// تورِ پولیا (دستهٔ ۱، دورِ ۲۶، سهمِ «prior» — ۲۰۲۶-۱۱-۱۲) — DECISIONS_R26: Q4 «خواندنِ پاسخ به کارِ پیشین» (دفترِ P1؛ نقشهٔ راهِ منبع‌ها §۲۱).
//  runners  نوبت‌های خودِ دونده‌های دورِ ۲۶ (tests/variants/R26_prior_runs.json: متنِ کاربر + پاسخِ ضبط‌شدهٔ مدل، بازپخش روی صفحه) — pwB2 (U8، U18، U9)، pwB1 (U44، U43، U3)،
//           pwA1 (A26-31/32/33)، pwA2 و s04 (A26-14)، pwD1 (D26-9، D26-11)، pwD2 (D26-3، D25-5)، s02/pA2/dp1/s38/aC3/pC3/s25 (A26-7، A26-5، C25-9، D25-24)، pwC1 (C26-8)
//  bank     همهٔ ۳۰ ورودیِ Q4 در بانکِ مستقلِ tests/variants/VARIANTS_R26.json (#99–#128)؛ آنچه سهمِ سازوکارِ دیگر است با دلیل در info.nc
//  هر رفعِ مثبت «شبیهِ منفی» ِ خودش را در همان بخش دارد (look-alike). روزِ صفحه منجمد است (APP.today)؛ هیچ انتظاری به تاریخِ تقویم بسته نیست.
// LLA_FILE = ساختِ دیگر (برای «قرمزِ نخست»: ساختِ BASE26)؛ ONLY=pwB2,pwB1,pwA1,pwA2,s04,pwD1,pwD2,mid,page,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const vfile = (n) => [path.join(__dirname, 'variants', n), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', n); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f));
const BANK = JSON.parse(fs.readFileSync(process.env.LLA_VARIANTS || vfile('VARIANTS_R26.json'), 'utf8'));
const RUNS = JSON.parse(fs.readFileSync(vfile('R26_prior_runs.json'), 'utf8'));

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
  const own = (i) => /^Q4\./.test(E[i].rc);
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
  // ---------- بازپخشِ نوبت‌های خودِ دونده‌ها (tests/variants/R26_prior_runs.json: متنِ کاربر + پاسخِ ضبط‌شدهٔ مدل) ----------
  const run = async (sid, upto, from) => {
    const T = RUNS[sid].turns.filter(t => t.p <= upto), out = {}; if (!from) { await wipe(); await fresh(); }
    for (let k = 0; k < T.length;) { const t = T[k]; if (t.sys || !t.u || (from && t.p < from)) { k++; continue; }
      const q = [t.r]; let j = k + 1; while (j < T.length && T[j].sys) { q.push(T[j].r); j++; }
      out[t.p] = await p.evaluate(async ([text, q]) => { const n0 = __calls.length; __q = q.map(r => typeof r === 'string' ? r : JSON.stringify(r)); await APP.ASSIST.send(text); __q.length = 0;
        const s = __cur(), bl = APP.ASSIST.boundLive ? APP.ASSIST.boundLive(s) : null, pid = bl && !bl.done ? bl.pid : '', pr = APP.STORY.priorFor(s, pid), u = (__calls[n0] || {}).user || '';
        return { user: u, pid, pr: pr ? JSON.parse(JSON.stringify(pr)) : null, lines: pr ? APP.STORY.priorLines(pr) : [], ev: (s.coachEv || []).filter(e => e.src === 'prior').map(e => ({ ok: e.ok, prior: e.prior, how: e.how || '' })) }; }, [t.u, q]);
      k = j; }
    return out;
  };
  const liveQ = (u) => ((head(u).match(/در این نوبت فقط \*\*یک\*\* پرسش[^«]*«([^»]*(?:«[^»]*»[^»]*)*)»/) || [])[1] || '');
  const tq = (u) => bold(u) + '\n' + liveQ(u) + '\n' + sugOf(u);   // پرسشِ نوبت: سطرِ پررنگِ مربیِ گفت‌وگو، پرسشِ مسئلهٔ زنده، یا «پیشنهادِ این نوبت»
  const eng = (t) => p.evaluate((t) => { const c = APP.STORY.arithChk(t); return c.length > 0 && c.every(x => x.ok === true); }, t);   // موتورِ حسابِ صفحه (a46 — سهمِ «arith») این متن را ✓ می‌خواند؟
  const ctx = (u) => head(u).split('\n').filter(l => /^- زمینه \(نه پرسشِ دوم\): (?:همین پیام|پیامش حکمِ)/.test(l)).join('\n');
  const stp = (o, n) => (o && o.pr && o.pr.steps[n - 1]) || {};
  const line = (o, n) => (o.lines || []).filter(l => l.indexOf('گامِ ' + fa(n) + ' ·') === 0)[0] || '';
  const fa = (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  const NOREAD = /هنوز با حسابِ صفحه یا حکم نمی‌خواند/;
  const okS = (x) => !!x && x.verdict === 'ok' && !x.stale && !((x.depStale || []).length) && !((x.depWrong || []).length);

  // ================= runners — جمله‌های خودِ گزارش‌های دورِ ۲۶ =================
  await section('pwB2', async () => {   // U8 (B25·D3 باقی‌مانده)، U18 = B26·D22، U9 = B26·D23
    const o = await run('pwB2', 7);
    chk(/گامِ ۱/.test(tq(o[2].user)) && /رد می‌کند|رد کردی/.test(tq(o[2].user) + ctx(o[2].user)) && !/خودت فکر می‌کنی چرا/.test(bold(o[2].user)), 'U8 (pwB2 p2 «مادرم معیار نیست … چرا میگی معیارِ جاافتاده‌ست؟» ⇒ A073 «خودت فکر می‌کنی چرا؟»): dispute of step 1 by meaning :: ' + tq(o[2].user).slice(0, 260));
    chk(stp(o[2], 1).her === 'no' || !!stp(o[2], 1).re, 'U8: the dispute is on the ledger (step 1) :: ' + line(o[2], 1).slice(-120));
    chk(stp(o[4], 4).verdict === 'ok' && stp(o[4], 4).fixed && /۶٫۷/.test(stp(o[4], 4).fixed.t) && o[4].pr.resume === 5 && !NOREAD.test(o[4].lines.join('\n')) && !stp(o[4], 4).retry,
      'U18 = B26·D22 (pwB2 p4 «شیراز = … = ۲٫۷ + ۱٫۶ + … = ۶٫۷. تهران = … = ۶٫۳» — two computations, every link ✓, model verdict ok): the fix lands the same turn :: ' + line(o[4], 4).slice(0, 300));
    chk(!/را رد می‌کند/.test(tq(o[7].user) + ctx(o[7].user)) && /پس می‌گیرد/.test(tq(o[7].user) + ctx(o[7].user)), 'U9 = B26·D23 (pwB2 p7 «اون «قبول ندارم» که درباره‌ی گامِ ۵ گفتم اشتباهی بود؛ حکمِ اولت درست بود»): a take-back, not a new dispute :: ' + (tq(o[7].user) + ctx(o[7].user)).slice(0, 300));
    chk(/رد ⇒ پس گرفته شد/.test(line(o[7], 5)) && stp(o[7], 5).her !== 'no' && (stp(o[7], 5).herHist || []).some(h => h.undoAt && h.back), 'U9: restored with history («رد ⇒ پس گرفته شد»، حکمِ پیش از رد برگشت) :: ' + line(o[7], 5).slice(-160));
    chk(/پرسشِ این نوبت \*\*نقطهٔ ازسرگیری\*\*/.test(bold(o[1].user)) && ask(o[1].user), 'look-alike: the opening message with her prior work still fires the report request');
    chk(!stp(o[6], 5).her || stp(o[6], 5).her !== 'no', 'look-alike (A25-7): «نه، بس نیست! …» is still not a dispute :: ' + line(o[6], 5).slice(-100));
  });

  await section('pwB1', async () => {   // U44، U43 = B26·D17، U3 = B26·D18
    const o = await run('pwB1', 11);
    chk(stp(o[4], 2).verdict === 'ok' && stp(o[4], 2).fixed && !stp(o[4], 2).re && !/حکم ماند/.test(line(o[4], 2)) && (stp(o[4], 2).reHist || []).length >= 1, 'U44 (pwB1 p4: step 2 ✓ beside the stale «دوباره سنجیده شد — حکم ماند»): a fixed step drops its old dispute reason, history kept :: ' + line(o[4], 2).slice(0, 320));
    chk(/۰٫۱۶۴ ÷ ۴٫۵/.test(String((stp(o[5], 5).fixed || {}).t || '')) && stp(o[5], 5).verdict === 'incomplete' && !NOREAD.test(o[5].lines.join('\n')) && /۰٫۵۹/.test(String((stp(o[5], 5).fixed || {}).was || '')) && o[5].pr.resume === 5,
      'U43 = B26·D17 (pwB1 p5 «۰٫۱۶۴ ÷ ۴٫۵ = ۰٫۰۳۶ کیلووات، یعنی ۳۶ وات» verdict incomplete ⇒ «متنِ تازه‌ات … هنوز … نمی‌خواند» + old text kept): her new text is the step, still «ناقص», old text as history :: ' + line(o[5], 5).slice(0, 300));
    chk(ask(o[10].user) && o[10].pr.steps.length === 12, 'look-alike (B25·D4): the second report «این هم ادامه‌ی کارِ خودمه که دیشب … نوشتم» still merges (5 ⇒ 12) :: ' + o[10].pr.steps.length);
    chk(ask(o[11].user) && o[11].pr.steps.length === 19 && /۱۹ گام/.test(o[11].pr.sum), 'U3 = B26·D18 (pwB1 p11 «… همین کار رو کردم، اینم کارِ خودمه، ببین: گامِ ۱۳ … گامِ ۱۹» — the THIRD report): request fires and the seven steps merge (12 ⇒ 19) :: ask=' + ask(o[11].user) + ' n=' + o[11].pr.steps.length + ' ' + o[11].pr.sum);
    chk(o[11].pr.steps.slice(0, 12).every(x => x.verdict === 'ok'), 'U3: the twelve earlier rows keep their state');
  });

  await section('pwA1', async () => {   // A26-31، A26-33، A26-32
    const o = await run('pwA1', 9);
    chk(stp(o[4], 4).drop && o[4].pr.resume === 0 && /کنار گذاشته شد/.test(line(o[4], 4)) && stp(o[4], 5).dep.indexOf(4) < 0, 'A26-31 (pwA1 p4 «راست میگی، گامِ ۴ دور بود. پس باید خودِ گامِ ۳ رو اکید کنم …» — step 5 now rests on step 3): step 4 is set aside, not the resume point :: ' + JSON.stringify([o[4].pr.resume, stp(o[4], 5).dep]) + line(o[4], 4).slice(-120));
    chk(!/گامِ ۴/.test(tq(o[5].user)), 'A26-31 (pwA1 p5): the resume question is not on the step she made obsolete :: ' + tq(o[5].user).slice(0, 200));
    chk(stp(o[5], 4).verdict === 'ok' && !stp(o[5], 4).drop, 'look-alike: when she later repairs step 4 itself it is ✓ again and no longer «کنار گذاشته»');
    chk(stp(o[6], 4).her !== 'no' && !/رد کردی/.test(line(o[6], 4)), 'look-alike (over-fix guard): «وقتی گامِ ۴ رو نوشتم حس کردم یه جاش می‌لنگه ولی نفهمیدم کجا» is a memory, not a dispute of the ✓ :: ' + line(o[6], 4).slice(-120));
    const f7 = o[7].ev.filter(e => e.how === 'priorfix').length, f8 = o[8].ev.filter(e => e.how === 'priorfix').length;
    chk(f8 === f7 && [1, 2, 3, 4].every(n => stp(o[8], n).verdict === 'ok') && /بازنویسی شد/.test(line(o[8], 1)), 'A26-33 (pwA1 p8 «کلِ اثباتمو یه بار مرتب و از نو نوشتم»): restating ✓ steps adds no «درست‌کردنِ خودش» credit (' + f7 + ' ⇒ ' + f8 + ') :: ' + line(o[8], 1).slice(0, 160));
    chk(!stp(o[8], 4).re && !/دوباره سنجیده شد/.test(line(o[8], 4)), 'A26-33: the old «دوباره سنجیده شد — حکم ماند» does not stay beside the new text of step 4 :: ' + line(o[8], 4).slice(-160));
    chk(/گامِ ۲/.test(tq(o[9].user)) && /رد می‌کند|رد کردی/.test(tq(o[9].user) + ctx(o[9].user)) && stp(o[9], 2).her === 'no' && /رد کردی/.test(line(o[9], 2)), 'A26-32 (pwA1 p9 «راستش حکمِ گامِ ۲ رو قبول ندارم» on a ✓): heard — re-check queued, «رد کردی» on the page :: ' + tq(o[9].user).slice(0, 200) + ' | ' + line(o[9], 2).slice(-100));
  });

  await section('pwA2', async () => {   // A26-14
    const o = await run('pwA2', 4);
    chk(stp(o[3], 4).verdict === 'incomplete' && !stp(o[3], 4).fixed && o[3].pr.resume === 4 && !/همه درست/.test(o[3].pr.sum), 'A26-14 (pwA2 p3 «روز اول ۵، روز دوم ۵، میشه ۱۰. ۲ تا می‌مونه. پس ۲ روز؟» — an intermediate result with an open guess): not booked as her fix of step 4 :: ' + line(o[3], 4).slice(0, 240) + ' | ' + o[3].pr.sum);
    chk(stp(o[4], 4).verdict === 'ok' && stp(o[4], 4).fixed && /۳ روز/.test(stp(o[4], 4).fixed.t), 'look-alike: «پس ۳ روز! ۵ و ۵ و ۲ میشه ۱۲» (the model reports the step fixed) lands :: ' + line(o[4], 4).slice(0, 200));
    chk(stp(o[2], 2).fixed && stp(o[2], 3).fixed && o[2].pr.resume === 4, 'look-alike (A25-2): «۱۲ و ۲۴ میشه ۳۶. پس مونده ۴۸ − ۳۶ = ۱۲» still fixes steps 2 and 3 the same turn');
  });

  await section('s04', async () => {   // A26-14 (نتیجهٔ بی‌ربط)
    const o = await run('s04', 12);
    chk(stp(o[12], 4).verdict === 'wrong' && !stp(o[12], 4).fixed && o[12].pr.resume === 4, 'A26-14 (s04 p12 «… ۲۷۵۰ میلیون / ۱۰ = ۲۷۵ میلیون هر قسط» ⇒ «اصلاح شد ⇐ «پس راهی نیست»»): an unrelated result is not her fix of the judged step :: ' + line(o[12], 4).slice(0, 240));
  });

  await section('pwD1', async () => {   // D26-9، D26-11 (+ پس گرفتن)
    const o = await run('pwD1', 12);
    chk(stp(o[4], 4).her === 'ok' && stp(o[4], 3).her !== 'ok' && !/پذیرفتی/.test(tq(o[4].user)) && /گامِ ۳/.test(tq(o[4].user) + ctx(o[4].user)) && /رد می‌کند|رد کردی/.test(tq(o[4].user) + ctx(o[4].user)),
      'D26-9 (pwD1 p4 «گامِ ۴ رو قبول کردم و گامِ ۳ رو نه»): each step its own state — 4 accepted, 3 disputed; never «حکمِ گامِ ۳ را پذیرفتی» :: ' + tq(o[4].user).slice(0, 220) + ' | her3=' + stp(o[4], 3).her + ' her4=' + stp(o[4], 4).her);
    chk(/گامِ ۴/.test(tq(o[11].user)) && /رد می‌کند|رد کردی/.test(tq(o[11].user) + ctx(o[11].user)) && !!stp(o[11], 4).re && stp(o[11], 4).verdict === 'ok' && /دوباره سنجیده شد/.test(line(o[11], 4)),
      'D26-11 (pwD1 p11 «گامِ ۴ به نظرم غلطه؛ ۲۴۷ ضربدر ۸ نباید ۱۹۷۶ بشه»): a dispute by meaning of a ✓ verdict is heard and re-checked with evidence :: ' + tq(o[11].user).slice(0, 200) + ' | ' + line(o[11], 4).slice(-200));
    chk(/پس می‌گیرد/.test(tq(o[12].user) + ctx(o[12].user)) && /رد ⇒ پس گرفته شد/.test(line(o[12], 4)) && stp(o[12], 4).verdict === 'ok' && !stp(o[12], 4).re, 'D26-11 / C5 (pwD1 p12 «اشتباهی گفتم؛ همون ۱۹۷۶ درست بود، حرفم رو پس می‌گیرم»): the dispute is taken back from the chat, with history :: ' + line(o[12], 4).slice(-160));
  });

  await section('pwD2', async () => {   // D26-3، D25-5
    const o = await run('pwD2', 5);
    chk(!NOREAD.test(o[2].lines.join('\n')) && !stp(o[2], 4).retry && stp(o[2], 4).her === 'ok' && /حرفِ تازه‌ات/.test(line(o[2], 4)), 'D26-3 (pwD2 p2 «… پس 3/7 به دو کسرِ واحد نمی‌شکنه و گامِ ۴ همون‌طور که نوشتم غلطه»): her confirmation of the wrongness is not answered «متنِ تازه‌ات … نمی‌خواند» :: ' + line(o[2], 4).slice(-260));
    chk(!/کجایش می‌لنگد/.test(tq(o[3].user)), 'D25-5 (pwD2 p3: the turn question stayed «گامِ ۴ … جای درنگ است … کجایش می‌لنگد؟» after she herself showed where): the question moves on :: ' + tq(o[3].user).slice(0, 220));
    chk(stp(o[3], 4).verdict === 'incomplete' && /مقسوم‌علیهِ d/.test(String((stp(o[3], 4).fixed || {}).t || '')) && !NOREAD.test(o[3].lines.join('\n')) && /بازنویسیِ خودش/.test(line(o[3], 4)), 'D26-3 (pwD2 p3: her non-numeric repair, verdict incomplete with a fresh quote): the ledger shows her new text with the new verdict and the old claim as history :: ' + line(o[3], 4).slice(0, 300));
    chk(!/هر کسری به شکلِ 3\/m/.test(tq(o[4].user)) && !/هر کسری به شکلِ 3\/m/.test(tq(o[5].user)), 'D25-5 (pwD2 p4, p5): the turn question no longer quotes the claim she replaced :: ' + tq(o[4].user).slice(0, 200));
  });

  await section('mid', async () => {   // A26-7، C25-9، D25-24، C26-8
    let o = await run('s02', 11);
    chk(!ask(o[10].user) && !o[10].pr && !/# کارِ پیشینِ تو/.test(head(o[10].user)), 'A26-7 (s02 p10 «یه لولهٔ کوتاه‌تر هم دارم … خودم حساب کردم: ۳٫۲² = ۱۰٫۲۴ …» mid-solution): no prior block, no ledger :: ask=' + ask(o[10].user) + ' sum=' + (o[10].pr && o[10].pr.sum));
    chk(o[10].ev.length === 0 && !/همهٔ گام‌های پیشینت درست درآمد/.test(tq(o[11].user)), 'A26-7 / A26-5 (s02 p10–p11): no inflated credit, and no «همهٔ گام‌های پیشینت درست درآمد» in a turn whose arithmetic the page reads ✗ :: ' + tq(o[11].user).slice(0, 160));
    o = await run('pA2', 6);
    chk(!ask(o[6].user) && !/نقطهٔ ازسرگیری/.test(bold(o[6].user)), 'A26-7 (pA2 p6 «برای حراجِ بعدی هم نشستم حساب کردم: …» after the problem closed): no report request :: ' + bold(o[6].user).slice(0, 160));
    o = await run('dp1', 8);
    chk(!ask(o[8].user) && !/نقطهٔ ازسرگیری/.test(bold(o[8].user)), 'D25-24 (dp1 p8: the test answer after chat_solved «۱۰ در ۷: کل ۷۰. بالا ۱۰ در ۳٫۵ نصفش ۱۷٫۵ …»): no prior-work contract :: ' + bold(o[8].user).slice(0, 160));
    o = await run('s38', 4);
    chk(!ask(o[4].user), 'C25-9 family (s38 p4 «آها! صفحه‌ای که از یال a و پاره‌خط b میگذره …» — the idea found mid-solve of a problem registered two turns earlier): not an «opening» :: ask=' + ask(o[4].user));
    o = await run('aC3', 4);
    chk(!ask(o[4].user) && !o[4].pr, 'C25-9 (aC3 p4 «اول ۱۱۰ هزار میشه. دفعهٔ دوم … میشه ۱۲۱ هزار» — the answer to the prerequisite\'s diagnostic question): no prior ledger :: ' + (o[4].pr && o[4].pr.sum));
    o = await run('pC3', 3);
    chk(!ask(o[3].user) && !o[3].pr, 'C25-9 (pC3 p3 «… مستطیل ۸ در ۵ میشه ۴۰ و مثلث نصفشه: ۲۰ …» — a mastery answer): no prior ledger :: ' + (o[3].pr && o[3].pr.sum));
    o = await run('s25', 16);
    chk(ask(o[1].user) && !ask(o[16].user), 'C25-9 (s25 p16 «برای الگوی خودم جمع‌ها رو حساب کردم: …» mid-work) no request; look-alike s25 p1 (her discovery with worked sums) still fires :: p1=' + ask(o[1].user) + ' p16=' + ask(o[16].user));
    o = await run('pwC1', 3);
    chk(stp(o[2], 2).verdict === 'ok' && stp(o[2], 2).fixed && /۲۴۷۰/.test(stp(o[2], 2).fixed.t) && !NOREAD.test(o[2].lines.join('\n')), 'C26-8 (pwC1 p2 «با ۵۵٪ میشه ۱۳۶۰ ÷ ۰٫۵۵ ≈ ۲۴۷۰ وات», verdict ok ⇒ «متنِ تازه‌ات … نمی‌خواند»): her fix lands the same turn :: ' + line(o[2], 2).slice(0, 260));
  });


  // ================= page — شبیه‌های منفیِ هر رفع، «کدام گام؟»، و کارتِ 🔭 =================
  await section('page', async () => {
    const W = 'سلام. می‌خوام بدونم ماهی چقدر برق مصرف می‌کنم؛ خودم تا یه جایی حساب کردم، ببین درست رفتم:\nگام ۱: بخاری ۲ کیلوواته و روزی ۳ ساعت روشنه: ۲ × ۳ = ۶ کیلووات‌ساعت در روز.\nگام ۲: ماهی ۶ × ۳۰ = ۱۶۰.\nگام ۳: هزینه ۱۶۰ × ۱٫۵ = ۲۴۰.\nگام ۴: پس ماهی ۲۴۰ هزار تومن میشه و به صرفه‌ست.';
    const WP = [{ step: 'روزانه', quote: '۲ × ۳ = ۶ کیلووات‌ساعت در روز', verdict: 'ok' }, { step: 'ماهانه', quote: 'ماهی ۶ × ۳۰ = ۱۶۰', verdict: 'wrong', why: 'ضرب نمی‌خواند', cause: 'skill' }, { step: 'هزینه', quote: 'هزینه ۱۶۰ × ۱٫۵ = ۲۴۰', verdict: 'ok', dep: [2] }, { step: 'نتیجه', quote: 'پس ماهی ۲۴۰ هزار تومن میشه و به صرفه‌ست', verdict: 'incomplete', why: 'معیارِ «به صرفه» گفته نشده و بر گامِ ۳ بناست', dep: [3] }];
    const led = async () => { await wipe(); await fresh(); return ppr(W, WP, { cs: { said: ['u', 'd'] } }); };
    const say = (text, o) => turn(text, (o && o.reply) || 'باشه.', [csn(Object.assign({ ph: 'e', said: [] }, o && o.cs || {}))]);
    const lines = () => p.evaluate(() => { const s = __cur(); const pr = APP.STORY.priorFor(s, ''); return pr ? APP.STORY.priorLines(pr) : []; });
    let u, pr;
    // C8 — زنجیره‌ای که یک حلقه‌اش نمی‌خواند، حتی با حکمِ «درست» ِ مدل، نمی‌نشیند (شبیهِ منفیِ U18)
    await led(); u = await ppr('دوباره حساب کردم: ماهی ۶ × ۳۰ = ۱۵۰ + ۳۰ = ۱۹۰.', [{ n: 2, quote: 'ماهی ۶ × ۳۰ = ۱۵۰ + ۳۰ = ۱۹۰', verdict: 'ok', why: 'جمع' }]); pr = await PR();
    chk(pr.steps[1].verdict === 'wrong' && !pr.steps[1].fixed && pr.steps[1].retry && pr.resume === 2 && /با حسابِ صفحه نمی‌خواند/.test((await lines())[2]) && !/۱۸۰/.test((await lines())[2]), 'look-alike of U18: a chain with a false link («۶ × ۳۰ = ۱۵۰ + ۳۰ = ۱۹۰») is refused although the model says ok — and the right number is not given away :: ' + (await lines())[2].slice(-200));
    // زنجیرهٔ درست می‌نشیند
    await led(); await ppr('دوباره حساب کردم: ماهی ۶ × ۳۰ = ۱۵۰ + ۳۰ = ۱۸۰.', [{ n: 2, quote: 'ماهی ۶ × ۳۰ = ۱۵۰ + ۳۰ = ۱۸۰', verdict: 'ok', why: 'جمع' }]); pr = await PR();
    chk(pr.steps[1].verdict === 'ok' && pr.steps[1].fixed && pr.resume === 3 && (pr.steps[2].depStale || []).indexOf(2) >= 0, 'U18 (chain, each link judged): «۶ × ۳۰ = ۱۵۰ + ۳۰ = ۱۸۰» lands and its dependant waits for the new number :: ' + JSON.stringify(st(pr)));
    const cal = await p.evaluate(() => ['۱۳۶۰ ÷ ۰٫۵۵ ≈ ۲۴۷۰', '۰٫۳×۹ + ۰٫۲×۸ = ۲٫۷ + ۱٫۶ = ۴٫۳', '۰٫۳×۹ + ۰٫۲×۸ = ۲٫۷ + ۱٫۶ = ۴٫۵', '۱۳۶۰ ÷ ۰٫۵۵ ≈ ۲۶۰۰'].map(t => APP.STORY.calcs25(t).map(c => [c.key, c.said, c.ok])));
    chk(JSON.stringify(cal[0]) === '[["1360/0.55","2470",true]]' && cal[1].length === 2 && cal[1].every(c => c[2] === true) && cal[1][0][1] === '4.3' && cal[2].every(c => c[2] === false) && cal[3][0][2] === false, 'light reader: «≈» is a connective, a chain is judged link by link, a false last link fails every expression before it :: ' + JSON.stringify(cal));
    // U43 — متنِ تازه‌ای که حسابِ خودِ صفحه در آن نمی‌خواند «بازنویسی» نمی‌شود (شبیهِ منفیِ بازنویسیِ ناقص)
    await led(); await ppr('ماهی ۶ × ۳۰ = ۱۷۰ میشه.', [{ n: 2, quote: 'ماهی ۶ × ۳۰ = ۱۷۰ میشه', verdict: 'incomplete', why: 'هنوز نمی‌خواند' }]); pr = await PR();
    chk(pr.steps[1].verdict === 'wrong' && !pr.steps[1].fixed && pr.steps[1].retry && /۱۶۰/.test(pr.steps[1].quote) && /با حسابِ صفحه نمی‌خواند/.test((await lines())[2]) && !/یا حکم/.test((await lines())[2]), 'look-alike of U43: a new text whose own arithmetic the page reads ✗ does not replace the step; the line names the page\'s check, not «یا حکم» :: ' + (await lines())[2].slice(-200));
    // U8 — «چرا میگی …؟» که به دو گام می‌خورد و گامِ ازسرگیری میانشان نیست ⇒ صفحه می‌پرسد کدام
    await wipe(); await fresh();
    await ppr('سلام. می‌خوام بدونم کدوم گوشی رو بخرم؛ خودم تا یه جایی رفتم، ببین درست رفتم:\nگام ۱: بودجه‌م ۲۰ میلیونه.\nگام ۲: دوربین برام مهمه، پس گوشیِ الف.\nگام ۳: باتری هم مهمه، پس باز گوشیِ الف.\nگام ۴: پس الف رو می‌خرم.',
      [{ step: 'بودجه', quote: 'بودجه‌م ۲۰ میلیونه', verdict: 'incomplete', why: 'سقف یا کف بودنش گفته نشده' }, { step: 'دوربین', quote: 'دوربین برام مهمه، پس گوشیِ الف', verdict: 'incomplete', why: 'مقایسه با گوشیِ ب نیامده' }, { step: 'باتری', quote: 'باتری هم مهمه، پس باز گوشیِ الف', verdict: 'incomplete', why: 'مقایسه با گوشیِ ب نیامده' }, { step: 'نتیجه', quote: 'پس الف رو می‌خرم', verdict: 'unchecked', dep: [2, 3] }], { cs: { nat: 'life', said: ['u'] } });
    u = await say('چرا میگی مقایسه با گوشیِ ب نیامده؟'); pr = await PR();
    chk(/حکمِ کدام گام را می‌گویی — گامِ ۲ یا گامِ ۳؟/.test(tq(u.user)) && !/خودت فکر می‌کنی چرا/.test(bold(u.user)) && !pr.steps.some(x => x.her === 'no'), 'U8 (tie, resume step not among the tied): the page asks which step — it does not guess and does not answer A073 :: ' + tq(u.user).slice(-260));
    u = await say('چرا میگی سقف یا کف بودنش گفته نشده؟'); pr = await PR();
    chk(pr.steps[0].her === 'no' && /گامِ ۱/.test(tq(u.user)) && /رد می‌کند/.test(tq(u.user) + ctx(u.user)), 'U8 (single match): «چرا میگی …؟» naming one step\'s reason is that step\'s dispute :: ' + tq(u.user).slice(0, 160));
    // U3 / A26-7 — «کارِ خودم» در برابرِ روایتِ همین لحظه (خودِ واژه‌ها)
    const calls = await p.evaluate(() => { const s = __cur(); const f = (t) => APP.STORY.priorAsk(s, '', t); return {
      third: f('برای حالتِ دوم هم همین کار رو کردم، اینم کارِ خودمه، ببین: گامِ ۵: ۳ × ۴ = ۱۲. گامِ ۶: ۱۲ + ۵ = ۱۷.'), second: f('یه گزارشِ دوم از کارِ خودم: گامِ ۵ — مخزنِ ذخیره: برای ۲ روزِ ابری ۲ × ۱۲۵ = ۲۵۰ متر مکعب. گامِ ۶ — لوله: قطرِ ۶۳ میلی‌متر کافیه.'),
      last: f('دیشب خودم نشستم حسابش رو کردم: ۳ × ۴ = ۱۲ و ۱۲ + ۵ = ۱۷.'), now: f('خودم حساب کردم: ۳ × ۴ = ۱۲ و ۱۲ + ۵ = ۱۷.'), sat: f('برای حراجِ بعدی هم نشستم حساب کردم: ۳ × ۴ = ۱۲ و ۱۲ + ۵ = ۱۷.'), other: f('همکارم این‌طوری حساب کرده بود: گام ۱: ۴ × ۲۴ = ۹۶. گام ۲: ۹۶ − ۸۰ = ۱۶.') }; });
    chk(calls.third && calls.second && calls.last && !calls.now && !calls.sat && !calls.other, 'U3 / C26-7 / A26-7 / bank #127: «اینم کارِ خودمه»، «یه گزارشِ دوم از کارِ خودم»، «دیشب … حسابش رو کردم» are her prior work; «خودم حساب کردم»، «نشستم حساب کردم» mid-work and a colleague\'s steps are not :: ' + JSON.stringify(calls));
    // 🔭 — کارتِ «کارِ پیشینِ تو» وضعِ تازه را نشان می‌دهد: «کنار گذاشته شد»، «بازنویسیِ خودش»، و ردِ حکمِ ✓ با دکمه همان‌جا دوباره حساب می‌شود
    await wipe(); await fresh(); const pid = await bind('مصرفِ برقِ بخاری', 'ماهی چقدر برق مصرف می‌کنم؟ بخاری ۲ کیلوواته و روزی ۳ ساعت روشنه.');
    await ppr(W, WP, { cs: { said: ['u', 'd'] } }); await say('گامِ ۴ رو کلاً گذاشتم کنار؛ فعلاً فقط مصرف رو می‌خوام.');
    await ppr('ماهی ۶ × ۳۰ میشه یه چیزی نزدیکِ ۲۰۰، دقیقش رو باید ببینم.', [{ n: 2, quote: 'ماهی ۶ × ۳۰ میشه یه چیزی نزدیکِ ۲۰۰، دقیقش رو باید ببینم', verdict: 'incomplete', why: 'حاصلِ دقیق هنوز نوشته نشده' }]);
    const card = await p.evaluate((pid) => { APP.go('lprob', pid); const R = [...document.querySelectorAll('#main .lp-prior-step')]; const no1 = R[0] && R[0].querySelector('.lp-prior-no'); if (no1) no1.click();
      const R2 = [...document.querySelectorAll('#main .lp-prior-step')]; return { rows: R.map(r => r.textContent), after: R2.map(r => r.textContent), undo: !!(R2[0] && R2[0].querySelector('.lp-prior-undo')) }; }, pid);
    chk(card.rows.length === 4 && /کنار گذاشته شد — به گفتهٔ خودت/.test(card.rows[3]) && !/ازسرگیری از این‌جا/.test(card.rows[3]) && /بازنویسیِ خودش — هنوز «درست» نیست/.test(card.rows[1]) && /ازسرگیری از این‌جا/.test(card.rows[1]), '🔭 card: set-aside step and her own rework are shown; the resume mark is on the reworked step, not on the set-aside one :: ' + JSON.stringify(card.rows.map(r => r.slice(0, 140))));
    chk(/دوباره سنجیده شد \(حسابِ صفحه\): حکم ماند/.test(card.after[0] || '') && card.undo, '🔭 card (D26-11): pressing «✗ نه» on a ✓ step whose arithmetic the page read re-checks it on the spot, with «↩ پس می‌گیرم» :: ' + String(card.after[0]).slice(-200));
  });

  // ================= bank — همهٔ ورودی‌های Q4 ِ VARIANTS_R26.json (#99–#128)؛ متنِ هر نوبت عیناً از خودِ بانک (پس از «U: ») =================
  await section('bank', async () => {
    const U = (i) => E[i].text.split('U: ').pop().trim();
    const LOAN = 'سلام. می‌خوام بدونم کدوم وام برام ارزون‌تره؛ خودم تا یه جایی حساب کردم، ببین درست رفتم (همهٔ عددها به میلیون تومنه):\nگام ۱: قسطِ بانکِ اول ماهی ۴٫۵ برای ۲۴ ماهه: ۴٫۵ × ۲۴ = ۱۰۸.\nگام ۲: سود = ۱۰۸ − ۸۰ = ۳۸.\nگام ۳: نسبت = ۳۸ ÷ ۸۰ = ۰٫۴۷۵.\nگام ۴: بانکِ دوم ۴۰ درصد سود می‌گیره، پس بانکِ دوم ارزون‌تره.';
    const LOANP = [{ step: 'کلِ بازپرداخت', quote: '۴٫۵ × ۲۴ = ۱۰۸', verdict: 'ok', why: 'قسط × ماه' }, { step: 'سود', quote: 'سود = ۱۰۸ − ۸۰ = ۳۸', verdict: 'wrong', why: 'تفریق نمی‌خواند', cause: 'skill' },
      { step: 'نسبت', quote: 'نسبت = ۳۸ ÷ ۸۰ = ۰٫۴۷۵', verdict: 'ok', why: 'تقسیم درست است ولی بر سودِ گامِ ۲ بنا شده', dep: [2] }, { step: 'نتیجه', quote: 'بانکِ دوم ۴۰ درصد سود می‌گیره، پس بانکِ دوم ارزون‌تره', verdict: 'incomplete', why: 'بر نسبتِ گامِ ۳ بنا شده', dep: [3] }];
    const loan = async () => { await wipe(); await fresh(); return ppr(LOAN, LOANP, { cs: { said: ['u', 'd'] } }); };
    const PROOF = 'می‌خوام ثابت کنم حاصل‌ضربِ دو عددِ فرد همیشه فرده، ولی یه جاش گیرم؛ کارِ خودم اینه. گام ۱: دو عددِ فرد رو 2a+1 و 2b+1 می‌گیرم. گام ۲: چون مجموعِ دو عددِ فرد زوجه، پس حاصل‌ضربشون هم زوجه. گام ۳: پس حکم ثابت نمیشه.';
    const PROOFP = [{ step: 'نام‌گذاری', quote: 'دو عددِ فرد رو 2a+1 و 2b+1 می‌گیرم', verdict: 'ok' }, { step: 'زوج بودن', quote: 'چون مجموعِ دو عددِ فرد زوجه، پس حاصل‌ضربشون هم زوجه', verdict: 'wrong', why: 'از زوج بودنِ مجموع زوج بودنِ حاصل‌ضرب نتیجه نمی‌شود', cause: 'knot' }, { step: 'نتیجه', quote: 'پس حکم ثابت نمیشه', verdict: 'incomplete', why: 'بر گامِ ۲ بنا شده', dep: [2] }];
    const proof = async () => { await wipe(); await fresh(); return ppr(PROOF, PROOFP, { cs: { said: ['u'], nat: 'objective' } }); };
    const say = (text, o) => turn(text, (o && o.reply) || 'باشه.', [csn(Object.assign({ ph: 'e', said: [] }, o && o.cs || {}))]);
    const ln = (pr, n) => { const x = pr.steps[n - 1]; return x ? [x.verdict, x.her || '', x.fixed ? 'F:' + x.fixed.t : '', x.retry ? 'RETRY' : '', x.re ? 'RE:' + x.re.by + ':' + x.re.was + '>' + x.re.to : '', x.drop ? 'DROP' : '', (x.depStale || []).join(), (x.depWrong || []).join()].join('|') : ''; };
    const lines = () => p.evaluate(() => { const s = __cur(); const pr = APP.STORY.priorFor(s, ''); return pr ? APP.STORY.priorLines(pr) : []; });
    const L = async (n) => (await lines()).filter(l => l.indexOf('گامِ ' + fa(n) + ' ·') === 0)[0] || '';
    const DISP = /را رد می‌کند|رد کردی/;
    let u, pr, pr0, l;

    // #99 — a THIRD report she calls her own work
    await loan();
    await ppr('این هم ادامهٔ کارِ خودمه که دیشب نوشتم، ببین درسته: گامِ ۵: بانکِ دوم ماهی ۴٫۷ میلیون برای ۲۴ ماه: ۴٫۷ × ۲۴ = ۱۱۲٫۸. گامِ ۶: سودش ۱۱۲٫۸ − ۸۰ = ۳۲٫۸.', [{ step: 'بانکِ دوم', quote: '۴٫۷ × ۲۴ = ۱۱۲٫۸', verdict: 'ok' }, { step: 'سودِ دوم', quote: 'سودش ۱۱۲٫۸ − ۸۰ = ۳۲٫۸', verdict: 'ok' }]);
    pr0 = await PR();
    u = await ppr(U(99), [{ step: 'با کارمزد', quote: 'با کارمزد میشه ۱۰۸ + ۱٫۶ = ۱۰۹٫۶ میلیون', verdict: 'ok' }, { step: 'قسط', quote: 'ماهی ۱۰۹٫۶ ÷ ۲۴ ≈ ۴٫۵۷', verdict: 'ok' }]);
    pr = await PR();
    const e99 = (await eng('با کارمزد میشه ۱۰۸ + ۱٫۶ = ۱۰۹٫۶ میلیون')) && (await eng('ماهی ۱۰۹٫۶ ÷ ۲۴ ≈ ۴٫۵۷'));
    T(99, pr0.steps.length === 6 && ask(u.user) && pr.steps.length === 8 && /۸ گام/.test(pr.sum) && pr.steps.slice(0, 6).every((x, k) => x.verdict === pr0.steps[k].verdict) && (!e99 || (pr.steps[6].verdict === 'ok' && pr.steps[7].verdict === 'ok')), { n0: pr0.steps.length, ask: ask(u.user), n: pr.steps.length, sum: pr.sum });
    if (!e99) NC(99, 'merge, request and header count asserted (6 ⇒ 8 rows); the ✓ of گام ۷–۸ themselves («= ۱۰۹٫۶ میلیون», «≈ ۴٫۵۷») is the arithmetic reader\'s (Q1/C15, fixer «arith»): on this build a46 does not yet read both lines ✓ — asserted automatically once it does');

    // #100 — her fix as ONE computation
    await loan(); u = await say(U(100)); pr = await PR(); l = await L(2);
    T(100, pr.steps[1].verdict === 'ok' && pr.steps[1].fixed && /۲۸/.test(pr.steps[1].fixed.t) && /۳۸/.test(pr.steps[1].fixed.was) && pr.resume === 3 && !NOREAD.test(l) && !/نمی‌خواند — گام همان می‌ماند/.test(l), { s2: ln(pr, 2), res: pr.resume, l: l.slice(0, 200) });

    // #101 — her fix as a CHAIN covering the wrong step and its dependant
    await loan(); u = await say(U(101)); pr = await PR();
    T(101, pr.steps[1].verdict === 'ok' && pr.steps[1].fixed && okS(pr.steps[2]) && pr.steps[2].fixed && /۰٫۳۵/.test(pr.steps[2].fixed.t) && !(pr.steps[2].depStale || []).length && !(pr.steps[2].depWrong || []).length && pr.resume === 4, { s2: ln(pr, 2), s3: ln(pr, 3), res: pr.resume });

    // #102 — ONE judged step made of two computations and a conclusion (state: after #101)
    u = await ppr(U(102), [{ n: 4, quote: 'بانکِ اول = ۲۸ ÷ ۸۰ = ۰٫۳۵. بانکِ دوم = ۳۲ ÷ ۸۰ = ۰٫۴. پس بانکِ اول ارزون‌تره', verdict: 'ok', why: 'هر دو نسبت می‌خواند' }], { cs: { said: ['result'], result: 'پس بانکِ اول ارزون‌تره' } });
    pr = await PR(); l = await L(4);
    T(102, pr.steps[3].verdict === 'ok' && pr.steps[3].fixed && /بانکِ اول ارزون‌تره/.test(pr.steps[3].fixed.t) && /بانکِ دوم ارزون‌تره/.test(pr.steps[3].fixed.was) && pr.resume === 0 && !NOREAD.test(l) && !pr.steps[3].retry, { s4: ln(pr, 4), res: pr.resume });

    // #126 — every row ✓: «همهٔ گام‌ها … درست» is legitimate here (state: after #102)
    u = await say(U(126)); pr = await PR();
    T(126, pr.steps.every(okS) && /همهٔ گام‌ها/.test(tq(u.user)) && /درست/.test(tq(u.user)), { q: tq(u.user).slice(0, 200), all: pr.steps.map(x => x.verdict).join() });

    // #103 — a NON-numeric repair the model reports valid with her fresh quote
    await proof(); u = await ppr(U(103), [{ n: 2, quote: 'حاصل‌ضربِ دو عددِ فرد فرده، چون (2a+1)(2b+1) = 2(2ab+a+b)+1', verdict: 'ok', why: 'اتحاد برقرار است' }]);
    pr = await PR(); l = await L(2); const u103 = await say('خب، حالا چی؟');
    T(103, pr.steps[1].verdict === 'ok' && pr.steps[1].fixed && /فرد فرده/.test(pr.steps[1].fixed.t) && /مجموعِ دو عددِ فرد/.test(pr.steps[1].fixed.was) && pr.resume !== 2 && !/مجموعِ دو عددِ فرد زوجه/.test(tq(u103.user)) && /اصلاح شد ⇐/.test(l), { s2: ln(pr, 2), res: pr.resume, q: tq(u103.user).slice(0, 160) });

    // #104 — she confirms the non-numeric step was wrong, no new text yet
    await proof(); u = await say(U(104)); pr = await PR(); l = await L(2);
    T(104, pr.steps[1].verdict === 'wrong' && pr.steps[1].her === 'ok' && !pr.steps[1].fixed && !pr.steps[1].retry && pr.resume === 2 && !pr.steps[1].drop && !NOREAD.test(l) && !/نمی‌خواند/.test(l) && /تأییدِ تو/.test(l), { s2: ln(pr, 2), res: pr.resume, l: l.slice(-120) });

    // #105 — a dispute BY MEANING of a ✓ verdict, the step named with an ordinal word
    await loan(); u = await say(U(105)); pr = await PR(); l = await L(1);
    T(105, /گامِ ۱/.test(tq(u.user)) && DISP.test(tq(u.user) + ctx(u.user)) && !/خودت فکر می‌کنی چرا/.test(bold(u.user)) && (pr.steps[0].her === 'no' || !!pr.steps[0].re) && /رد کردی|دوباره سنجیده شد/.test(l) && (pr.steps[0].herHist || []).some(h => h.noAt), { q: tq(u.user).slice(0, 220), s1: ln(pr, 1), l: l.slice(-160) });
    u = await say('اشتباهی گفتم، حرفم رو پس می‌گیرم.'); pr = await PR(); l = await L(1);
    chk(/رد ⇒ پس گرفته شد/.test(l) && pr.steps[0].her !== 'no' && !pr.steps[0].re, 'bank#105 (way to take it back): the dispute of step 1 is withdrawn from the chat :: ' + l.slice(-140));

    // #106 — an explicit rejection of a ✓ verdict
    await loan(); u = await say(U(106)); pr = await PR(); l = await L(1);
    T(106, DISP.test(tq(u.user) + ctx(u.user)) && /گامِ ۱/.test(tq(u.user)) && pr.steps[0].verdict === 'ok' && pr.steps[0].re && pr.steps[0].re.by === 'page' && /۴[.٫]۵/.test(pr.steps[0].re.why) && /۱۰۸/.test(pr.steps[0].re.why) && /دوباره سنجیده شد \(حسابِ صفحه\): حکم ماند/.test(l), { q: tq(u.user).slice(0, 200), re: pr.steps[0].re, l: l.slice(-200) });

    // #107 — a TAKE-BACK of a dispute, with «قبول ندارم» quoted inside it
    await loan(); await ppr('حکمِ گامِ ۳ رو قبول ندارم، به نظرم نسبت همینه.', [{ n: 3, quote: 'نسبت = ۳۸ ÷ ۸۰ = ۰٫۴۷۵', verdict: 'incomplete', why: 'دوباره سنجیده شد: تقسیم می‌خواند ولی ۳۸ از گامِ ۲ می‌آید' }]);
    pr0 = await PR(); u = await say(U(107)); pr = await PR(); l = await L(3);
    T(107, pr0.steps[2].verdict === 'incomplete' && !!pr0.steps[2].re && !/را رد می‌کند/.test(tq(u.user) + ctx(u.user)) && /پس می‌گیرد/.test(tq(u.user) + ctx(u.user)) && /رد ⇒ پس گرفته شد/.test(l) && pr.steps[2].verdict === 'ok' && pr.steps[2].her !== 'no' && !pr.steps[2].re && (pr.steps[2].reHist || []).length === 1,
      { before: ln(pr0, 3), after: ln(pr, 3), q: (tq(u.user) + ctx(u.user)).slice(0, 200), l: l.slice(-140) });

    // #108 — a mixed reply whose «نه» comes at the END
    await loan(); u = await say(U(108)); pr = await PR();
    T(108, pr.steps[3].her === 'ok' && pr.steps[2].her !== 'ok' && (pr.steps[2].her === 'no' || !!pr.steps[2].re) && !/حکمِ گامِ ۳[^.]*پذیرفتی/.test(tq(u.user)) && /گامِ ۳/.test(tq(u.user) + ctx(u.user)) && DISP.test(tq(u.user) + ctx(u.user)), { s3: ln(pr, 3), s4: ln(pr, 4), q: tq(u.user).slice(0, 200) });

    // #109 — acceptance first, rejection second, different verbs
    await loan(); u = await say(U(109)); pr = await PR(); const u109 = await say('نه دیگه، همون ۳۸ درسته.'); const pr109 = await PR();
    T(109, pr.steps[2].her === 'ok' && pr.steps[1].verdict === 'wrong' && pr.steps[1].re && pr.steps[1].re.by === 'page' && pr.steps[1].re.to === 'wrong' && !!pr.steps[1].reAt && /گامِ ۲/.test(tq(u.user)) && DISP.test(tq(u.user) + ctx(u.user)) && pr109.steps[1].verdict === 'wrong' && !/به چه دلیل درست است/.test(tq(u109.user)),
      { s2: ln(pr, 2), s3: ln(pr, 3), q: tq(u.user).slice(0, 160), q2: tq(u109.user).slice(0, 160) });

    // #110 — a fixed step that carried an old dispute reason
    await loan(); await say('گامِ ۲ رو قبول ندارم، ۳۸ درسته.'); pr0 = await PR(); await say('آها دیدم، ۱۰۸ منهای ۸۰ میشه ۲۸، نه ۳۸'); pr = await PR(); l = await L(2);
    const hist110 = (await items()).filter(x => x.k === 'prior').map(x => x.t).join(' ‖ ');
    T(110, !!pr0.steps[1].re && pr.steps[1].verdict === 'ok' && pr.steps[1].fixed && !pr.steps[1].re && !/حکم ماند/.test(l) && !/دوباره سنجیده شد/.test(l) && (pr.steps[1].reHist || []).length >= 1 && /حکم رد شد/.test(hist110) && /اصلاح شد/.test(hist110), { l: l.slice(0, 260), hist: hist110.slice(0, 300) });

    // #111 — her correct recomputation, result followed by a scale word
    await loan(); u = await say(U(111)); pr = await PR(); l = await L(2);
    T(111, pr.steps[1].verdict === 'ok' && pr.steps[1].fixed && /۲۸/.test(pr.steps[1].fixed.t) && !/۳۸/.test(pr.steps[1].fixed.t) && /۳۸/.test(pr.steps[1].fixed.was) && /اصلاح شد ⇐/.test(l) && !/نمی‌خواند/.test(l), { s2: ln(pr, 2), l: l.slice(0, 220) });

    // #112 — a correct fix AND a new wrong line in one message
    await loan(); u = await say(U(112)); pr = await PR(); l = await L(3);
    T(112, pr.steps[1].verdict === 'ok' && pr.steps[1].fixed && /۲۸/.test(pr.steps[1].fixed.t) && !okS(pr.steps[2]) && pr.resume === 3 && !/همهٔ گام‌های پیشینت درست درآمد/.test(tq(u.user)) && /گامِ ۳/.test(tq(u.user)) && !/۰٫۳۵/.test(l), { s2: ln(pr, 2), s3: ln(pr, 3), res: pr.resume, q: tq(u.user).slice(0, 200), l: l.slice(-200) });

    // #113 — she makes a step OBSOLETE
    await loan(); u = await say(U(113)); pr = await PR(); l = await L(4);
    await say('درستش کردم: سود = ۱۰۸ − ۸۰ = ۲۸. نسبت = ۲۸ ÷ ۸۰ = ۰٫۳۵، یعنی ۳۵ درصد'); const pr113 = await PR(); const u113 = await say('خب بعدش؟');
    T(113, pr.steps[3].drop && pr.steps[3].drop.by === 'her' && /کنار گذاشته شد — به گفتهٔ خودت/.test(l) && pr.resume === 2 && pr113.resume === 0 && pr113.steps[3].drop && pr113.steps[3].verdict === 'incomplete' && !/گامِ ۴/.test(tq(u113.user)), { s4: ln(pr, 4), res: [pr.resume, pr113.resume], l: l.slice(-140), q: tq(u113.user).slice(0, 160) });

    // #114 — re-reports of an unchanged ✓ step: credited once
    await loan(); const ev0 = (await evs()).filter(e => e.prior === 1 && e.ok).length;
    for (const t of ['کارِ خودم رو یه بار دیگه می‌نویسم: گام ۱: ۴٫۵ × ۲۴ = ۱۰۸. گام ۲: هنوز سرِ سودم.', 'باز هم کارِ خودم: گام ۱: ۴٫۵ × ۲۴ = ۱۰۸. گام ۲: سود رو بعداً می‌گم.', 'و برای بارِ سوم کارِ خودم: گام ۱: ۴٫۵ × ۲۴ = ۱۰۸. گام ۲: همون.'])
      await ppr(t, [{ n: 1, quote: '۴٫۵ × ۲۴ = ۱۰۸', verdict: 'ok', why: 'قسط × ماه' }]);
    pr = await PR(); const ev1 = (await evs()).filter(e => e.prior === 1 && e.ok).length, m114 = (await mind()).filter(x => /^\+/.test(x)).length;
    T(114, ev0 === 1 && ev1 === 1 && pr.steps.length === 4 && m114 <= 2, { ev0, ev1, n: pr.steps.length, mind: m114 });

    // #115 — take-back from chat of a mistaken ✗ on a ✓ verdict (button)
    await loan(); await setHer(1, 'no'); u = await say(U(115)); pr = await PR(); l = await L(1); const u115 = await say('خب.');
    T(115, pr.steps[0].her === 'ok' && pr.steps[0].verdict === 'ok' && (pr.steps[0].herHist || []).some(h => h.undoAt) && !pr.steps[0].re && !DISP.test(tq(u.user) + ctx(u.user)) && !/حکمِ گامِ ۱/.test(tq(u115.user)) && /رد ⇒ پس گرفته شد/.test(l), { s1: ln(pr, 1), q: tq(u.user).slice(0, 160), l: l.slice(-120) });

    // #116 — mid-solution arithmetic with «خودم … حساب کردم» (live problem, execution stage)
    await wipe(); await fresh(); let pid = await bind('چند جعبه کاشی', 'برای دیوارِ آشپزخانه چند جعبه کاشی بخرم؟ هر ردیف ۴۵ کاشی می‌خواهد و ۳ ردیف دارم؛ ۲۰ کاشی هم برای برش کنار می‌گذارم.');
    await p.evaluate((pid) => __liveSet(pid, (S0, L0) => { S0.u = { whole: 'می‌خواهم شمارِ کاشی‌ها را پیدا کنم', unknown: 'شمارِ کاشی' }; L0.plan = { t: 'ردیف‌ها را ضرب می‌کنم و برش را اضافه می‌کنم', at: APP.nowISO() }; L0.steps.push({ t: 'ردیف‌ها را شمردم: ۳ ردیف', at: APP.nowISO(), ok: true }); }), pid);
    u = await say(U(116), { cs: { said: ['result'], result: '۳ × ۴۵ = ۱۳۵ و با ۲۰ تا میشه ۱۵۵' } }); pr = await PR(pid);
    T(116, !ask(u.user) && !/# کارِ پیشینِ تو/.test(head(u.user)) && !pr && !(await PR()), { ask: ask(u.user), pr: pr && pr.sum });

    // #117 / #118 — post-closure arithmetic, and a mastery answer after the closure (the problem carried a ledger)
    const closed = async () => { await wipe(); await fresh(); const id = await bind('کدام وام ارزان‌تر است', 'کدام وام برایم ارزان‌تر است؟ بانکِ اول ماهی ۴٫۵ میلیون برای ۲۴ ماه، بانکِ دوم ۴۰ درصد سود.');
      await ppr(LOAN, LOANP, { cs: { said: ['u', 'd'] } }); await say('درستش کردم: سود = ۱۰۸ − ۸۰ = ۲۸. نسبت = ۲۸ ÷ ۸۰ = ۰٫۳۵، یعنی ۳۵ درصد');
      await p.evaluate((id) => __liveSet(id, (S0, L0) => { L0.state = 'solved'; L0.solvedAt = APP.nowISO(); }), id); return id; };
    pid = await closed(); pr0 = await PR(pid); u = await say(U(117)); pr = await PR(pid);
    T(117, !!pr0 && !ask(u.user) && !/نقطهٔ ازسرگیری/.test(tq(u.user)) && pr.steps.length === pr0.steps.length && JSON.stringify(pr.steps.map(x => [x.verdict, x.her, !!x.fixed])) === JSON.stringify(pr0.steps.map(x => [x.verdict, x.her, !!x.fixed])) && !(await PR()), { ask: ask(u.user), n: [pr0.steps.length, pr.steps.length], chat: !!(await PR()) });
    pid = await closed(); u = await say(U(118)); pr = await PR(pid);
    T(118, !ask(u.user) && !/نقطهٔ ازسرگیری/.test(tq(u.user)) && !/"prior":\[\{"step"/.test(head(u.user)) && !(await PR()), { ask: ask(u.user), q: tq(u.user).slice(0, 120) });
    NC(118, 'the mastery question itself (asked after chat_solved) and the routing of her answer to the mastery check are the practice/closure layers; here the Q4 half is asserted on a closed problem that carried a ledger: no report request, no prior contract, no new ledger');

    // #119 — a practice-session report
    await wipe(); await fresh(); u = await say(U(119));
    T(119, !ask(u.user) && !/# کارِ پیشینِ تو/.test(head(u.user)) && !/کلِ مسئله را در یک جمله/.test(bold(u.user)) && !(await PR()), { ask: ask(u.user), b: bold(u.user).slice(0, 160) });
    NC(119, '«booked as the practice session» is the practice layer (a35/a40); the Q4 half asserted: no prior block, no report request, no «کلِ مسئله را در یک جمله» turn question, no ledger');

    // #120 — an intermediate result about something else
    await loan(); u = await say(U(120), { cs: { said: ['result'], result: '۸۰ × ۰٫۰۲ = ۱٫۶ میلیون' } }); pr = await PR(); l = await L(2);
    T(120, pr.steps[1].verdict === 'wrong' && !pr.steps[1].fixed && pr.steps[1].her !== 'ok' && !pr.steps[1].retry && pr.resume === 2 && !/تأییدِ تو/.test(l) && !/۱٫۶/.test(l), { s2: ln(pr, 2), l: l.slice(0, 200) });

    // #121 — her «fix» is still wrong; the model calls it valid (C8)
    await loan(); u = await ppr(U(121), [{ n: 2, quote: 'پس سود میشه ۲۹ میلیون', verdict: 'ok', why: 'تفریق' }], { cs: { said: ['result'], result: 'پس سود میشه ۲۹ میلیون' } }); pr = await PR(); l = await L(2); const u121 = await say('خب؟');
    T(121, pr.steps[1].verdict === 'wrong' && !pr.steps[1].fixed && pr.steps[1].retry && pr.resume === 2 && /با حسابِ صفحه نمی‌خواند/.test(l) && !/۲۸/.test(l) && !/۲۸/.test(tq(u121.user)) && /گامِ ۲/.test(tq(u121.user)), { s2: ln(pr, 2), l: l.slice(-220), q: tq(u121.user).slice(0, 200) });

    // #122 — looks like a take-back, but what she takes back is an ACCEPTANCE
    await loan(); await say('گامِ ۳ رو قبول دارم.'); pr0 = await PR(); u = await say(U(122)); pr = await PR();
    T(122, pr0.steps[2].her === 'ok' && pr.steps[2].her !== 'ok' && (pr.steps[2].her === 'no' || !!pr.steps[2].re) && DISP.test(tq(u.user) + ctx(u.user)) && /گامِ ۳/.test(tq(u.user)) && !/پس می‌گیرد/.test(tq(u.user) + ctx(u.user)), { before: ln(pr0, 3), after: ln(pr, 3), q: tq(u.user).slice(0, 200) });

    // #123 — look-alike of the mixed reply, both accepted
    await loan(); u = await say(U(123)); pr = await PR();
    T(123, pr.steps[3].her === 'ok' && pr.steps[2].her === 'ok' && !pr.steps.some(x => x.her === 'no' || x.re) && !DISP.test(tq(u.user) + ctx(u.user)), { s3: ln(pr, 3), s4: ln(pr, 4) });

    // #124 — «نه هنوز» about her time
    await loan(); u = await say(U(124)); pr = await PR();
    T(124, !pr.steps[2].her && !pr.steps[2].re && !(pr.steps[2].herHist || []).length && !DISP.test(tq(u.user) + ctx(u.user)), { s3: ln(pr, 3), q: tq(u.user).slice(0, 160) });

    // #125 — postponing, not discarding
    await loan(); u = await say(U(125)); pr = await PR();
    T(125, !pr.steps[3].drop && pr.steps[3].verdict === 'incomplete' && pr.resume === 2 && !/کنار گذاشته/.test(await L(4)), { s4: ln(pr, 4), res: pr.resume });

    // #127 — a report of SOMEONE ELSE's work
    await loan(); const e127 = (await evs()).length; u = await ppr(U(127), [{ step: 'همکار', quote: '۴ × ۲۴ = ۹۶', verdict: 'ok' }]); pr = await PR();
    T(127, !ask(u.user) && pr.steps.length === 4 && (await evs()).length === e127 && !/۹۶/.test((await lines()).join('\n')), { ask: ask(u.user), n: pr.steps.length });

    // #128 — she restates a ✓ step
    await loan(); const e128 = (await evs()).length; u = await say(U(128)); pr = await PR();
    T(128, pr.resume === 2 && !pr.steps[0].her && !pr.steps[0].re && !pr.steps[0].fixed && (await evs()).length === e128 && !DISP.test(tq(u.user) + ctx(u.user)), { s1: ln(pr, 1), res: pr.resume });
  });

  const ids = Object.keys(E).map(Number).filter(own), nb = ids.length, nbOk = ids.filter(i => info.bank[i]).length, miss = ids.filter(i => !(i in info.bank));
  if (!process.env.ONLY || process.env.ONLY.split(',').includes('bank')) { chk(!miss.length, 'bank: entries not exercised: ' + miss.join(','));
    console.log('bank Q4: ' + nbOk + '/' + nb + ' pass; nc: ' + Object.keys(info.nc).length + (Object.keys(info.nc).length ? ' ' + JSON.stringify(info.nc) : '')); }
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
