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
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'pr', 'card', 'deadline', 'fcast', 'prereq', 'topic', 'wchain', 'case', 'practice', 'prc'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
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
  const tq = (u) => bold(u) + '\n' + liveQ(u);   // پرسشِ نوبت: سطرِ پررنگِ مربیِ گفت‌وگو، یا پرسشِ مسئلهٔ زنده
  const ctx = (u) => head(u).split('\n').filter(l => /^- زمینه \(نه پرسشِ دوم\): (?:همین پیام|پیامش حکمِ)/.test(l)).join('\n');
  const stp = (o, n) => (o && o.pr && o.pr.steps[n - 1]) || {};
  const line = (o, n) => (o.lines || []).filter(l => l.indexOf('گامِ ' + fa(n) + ' ·') === 0)[0] || '';
  const fa = (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
  const NOREAD = /هنوز با حسابِ صفحه یا حکم نمی‌خواند/;

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


  const ids = Object.keys(E).map(Number).filter(own), nb = ids.length, nbOk = ids.filter(i => info.bank[i]).length, miss = ids.filter(i => !(i in info.bank));
  if (!process.env.ONLY || process.env.ONLY.split(',').includes('bank')) { chk(!miss.length, 'bank: entries not exercised: ' + miss.join(','));
    console.log('bank Q4: ' + nbOk + '/' + nb + ' pass; nc: ' + Object.keys(info.nc).length + (Object.keys(info.nc).length ? ' ' + JSON.stringify(info.nc) : '')); }
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
