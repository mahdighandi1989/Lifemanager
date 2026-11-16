// تورِ پولیا (دستهٔ ۱، دورِ ۲۸، سهمِ «prior» — ۲۰۲۶-۱۱-۱۶) — DECISIONS_R28: R6 «کارِ پیشین» (C98 پرسشِ خالی دربارهٔ حساب؛ پسرفتِ D28-6؛ B28·D9؛ C27-21؛ C97 سمتِ دفتر).
//  runners  نوبت‌های خودِ دونده‌های دورِ ۲۸ (tests/variants/R28_prior_runs.json: متنِ کاربر + پاسخِ ضبط‌شدهٔ مدل از T/round28X/<sid>/ai، بازپخش روی صفحه)
//  bank     ورودی‌های R6/prior در بانکِ مستقلِ tests/variants/VARIANTS_R28.json (اگر هست)
//  هر رفعِ مثبت «شبیهِ منفی» ِ خودش را در همان بخش دارد. روزِ صفحه منجمد است (APP.today)؛ هیچ انتظاری به تاریخِ تقویم بسته نیست.
//  LLA_FILE = ساختِ دیگر (برای «قرمزِ نخست»: ساختِ BASE28)؛ ONLY=<section,...>
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const vfile = (n) => [path.join(__dirname, 'variants', n), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', n); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f));
const BANK = (() => { const f = process.env.LLA_VARIANTS || vfile('VARIANTS_R28.json'); return f && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : []; })();
const RUNS = JSON.parse(fs.readFileSync(vfile('R28_prior_runs.json'), 'utf8'));

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
  // ---------- بازپخشِ نوبت‌های خودِ دونده‌ها (tests/variants/R26_prior_runs.json: متنِ کاربر + پاسخِ ضبط‌شدهٔ مدل) ----------
  // ---------- بازپخشِ نوبت‌های خودِ دونده‌های دورِ ۲۸ (tests/variants/R28_prior_runs.json: متنِ کاربر + پاسخِ ضبط‌شدهٔ مدل؛ fresh = گفت‌وگوی تازه مثلِ دونده) ----------
  const run = async (sid, upto, from) => {
    const T = RUNS[sid].turns.filter(t => t.p <= upto), out = {}; if (!from) { await wipe(); await fresh(); }
    for (let k = 0; k < T.length;) { const t = T[k]; if (t.sys || !t.u || (from && t.p < from)) { k++; continue; }
      if (t.fresh) await p.evaluate(() => { localStorage.removeItem('lla.assist.cur'); APP.ASSIST.newSession(); });
      const q = [t.r]; let j = k + 1; while (j < T.length && T[j].sys) { q.push(T[j].r); j++; }
      out[t.p] = await p.evaluate(async ([text, q]) => { const n0 = __calls.length; __q = q.map(r => typeof r === 'string' ? r : JSON.stringify(r)); await APP.ASSIST.send(text); __q.length = 0;
        const s = __cur(), bl = APP.ASSIST.boundLive ? APP.ASSIST.boundLive(s) : null, pid = (bl && !bl.done ? bl.pid : '') || (APP.STORY.priorPid ? APP.STORY.priorPid(s, text) : ''), pr = APP.STORY.priorFor(s, pid), u = (__calls[n0] || {}).user || '';
        const all = {}; APP.S.all('eprog').forEach(pg => { const P = pg.solve && pg.solve.live && pg.solve.live.prior; if (P) all[pg.id] = JSON.parse(JSON.stringify(P)); });
        APP.S.all('achat').forEach(se => { const st = (se.coach || {}).story || {}; Object.keys(st).forEach(k => { if (st[k].prior) all[se.id + '|' + k] = JSON.parse(JSON.stringify(st[k].prior)); }); });
        return { user: u, pid, bl: bl ? { pid: bl.pid, done: !!bl.done } : null, pk: (s.coach || {}).pk || '', pr: pr ? JSON.parse(JSON.stringify(pr)) : null, lines: pr ? APP.STORY.priorLines(pr) : [], all, sys: (s.msgs || []).filter(m => m.role === 'sys').map(m => String(m.text || '')).slice(-3) }; }, [t.u, q]);
      k = j; }
    return out;
  };
  const PRIOR_BLK = /^# کارِ پیشینِ تو/m;
  const priorBlk = (u) => head(u).split('\n# ').filter(b => /^(?:# )?کارِ پیشینِ تو/.test(b)).join('\n');
  const stepsOf = (P) => (P && P.steps || []).map(x => x.n + ':' + x.verdict + ':' + String(x.fixed ? x.fixed.t : x.quote).slice(0, 50));

  // ================= C98 (F12: A28-37 pwA1 p19، D28-30 tD2 p25، nB1 p7) — پرسشِ خالی دربارهٔ یک حساب کارِ پیشین نیست =================
  await section('C98', async () => {
    const o = await run('pwA1', 19);
    chk(!PRIOR_BLK.test(head(o[19].user)) && !ask(o[19].user), 'C98 / A28-37 (pwA1 p19, a fresh chat «۷ × ۸ = ۵۶ بود دیگه؟»): a bare question about a calculation opens no «# کارِ پیشینِ تو» block :: ' + priorBlk(o[19].user).slice(0, 300));
    chk(!o[19].pr || o[19].pid, 'C98 / A28-37: no ledger is created for the fresh chat :: ' + JSON.stringify(o[19].pr && o[19].pr.sum));
    const d = await run('tD2', 25);
    chk(!PRIOR_BLK.test(head(d[25].user)) && !ask(d[25].user) && !/نقطهٔ ازسرگیری/.test(head(d[25].user)), 'C98 / D28-30 (tD2 p25 «یه سؤالِ کوچیک: ۷ × ۸ = ۵۶ بود دیگه؟» after a fresh chat): no prior-work block and no resume-point question :: ' + priorBlk(d[25].user).slice(0, 300));
    // mid-chat, inside a real problem with a ledger (nB1 p7 «… راستی ۷ × ۸ = ۵۶ بود دیگه؟»): the bare question never becomes a ledger step
    const n = await run('nB1', 7);
    const keys7 = Object.keys(n[7].all), led7 = keys7.map(k => n[7].all[k]).filter(Boolean);
    chk(!led7.some(P => P.steps.some(x => /۷\s*×\s*۸/.test(String(x.fixed ? x.fixed.t : x.quote)))), 'C98 (nB1 p7, mid-chat «راستی ۷ × ۸ = ۵۶ بود دیگه؟»): the bare question is no step of any ledger :: ' + JSON.stringify(led7.map(stepsOf)).slice(0, 500));
    // look-alikes: her own worked step that asks «درسته؟» still is her prior work (C56); a bare question with her marker «خودم حساب کردم» too
    await wipe(); await fresh();
    const r1 = await turn('خودم حساب کردم: ۷۲۰۰۰ ÷ ۳۶۰۰ = ۲۰ متر بر ثانیه، پس تو ۱۰ ثانیه ۲۰۰ متر میره. درسته؟', 'باشه.', []);
    chk(ask(r1.user), 'C98 look-alike (C56): «خودم حساب کردم: … = ۲۰ …، پس … ۲۰۰ متر. درسته؟» is her worked step — the prior-work block opens :: ' + head(r1.user).split('\n').filter(l => /کارِ پیشین/.test(l)).join(' | ').slice(0, 200));
    await wipe(); await fresh();
    const r2 = await turn('ماشین با ۷۲ کیلومتر بر ساعت تو ۱۰ ثانیه چند متر میره؟ ۷۲۰۰۰ ÷ ۳۶۰۰ = ۲۰ متر بر ثانیه و ۲۰ × ۱۰ = ۲۰۰.', 'باشه.', []);
    chk(ask(r2.user), 'C98 look-alike: a problem with her two worked relations is prior work :: ' + head(r2.user).split('\n').filter(l => /کارِ پیشین/.test(l)).join(' | ').slice(0, 200));
    await wipe(); await fresh();
    for (const q of ['۱۲ × ۱۲ = ۱۴۴ میشه دیگه، نه؟', '۷ ضربدر ۸ همون ۵۶ میشه؟', 'یه سؤال: ۲۵۰ ÷ ۵ = ۵۰ درسته؟']) {
      await wipe(); await fresh(); const r = await turn(q, 'بله.', []);
      chk(!ask(r.user) && !PRIOR_BLK.test(head(r.user)), 'C98 variant: the bare question «' + q + '» opens no prior work :: ' + priorBlk(r.user).slice(0, 200)); }
  });

  // ================= D28-6 / C97 ledger side (dp2 p6) — مسئلهٔ تازه هرگز گامِ دفترِ مسئلهٔ دیگر نمی‌شود =================
  await section('D28-6', async () => {
    const o = await run('dp2', 7);
    const P6 = o[6], thunder = Object.keys(P6.all).map(k => [k, P6.all[k]]).filter(([k, P]) => P.steps.some(x => /۳۴۰|۷۳۴۴|۱۲۲۴/.test(String(x.fixed ? x.fixed.t : x.quote))));
    chk(thunder.length >= 1 && thunder.every(([k, P]) => P.steps.length === 2 && !P.steps.some(x => /۷۲۰۰۰|۲۰۰ متر/.test(String(x.fixed ? x.fixed.t : x.quote)))), 'D28-6 REGRESSION (dp2 p6 «امروز معلم یه سؤال داد: ماشین … ۷۲۰۰۰ ÷ ۳۶۰۰ = ۲۰ …»): the thunder ledger keeps its 2 steps — the new problem never becomes «گامِ ۳ و ۴» :: ' + JSON.stringify(thunder.map(([k, P]) => [k, stepsOf(P)])).slice(0, 600));
    const car = Object.keys(P6.all).map(k => [k, P6.all[k]]).filter(([k, P]) => P.steps.some(x => /۷۲۰۰۰/.test(String(x.fixed ? x.fixed.t : x.quote))));
    chk(car.length === 1 && car[0][1].steps.length === 2 && car[0][1].steps.every(x => x.verdict === 'ok' || x.verdict === 'unchecked'), 'D28-6 / C97: the car problem gets its own ledger (r27: «۲ گام — ۲ درست») :: ' + JSON.stringify(car.map(([k, P]) => [k, stepsOf(P)])).slice(0, 400));
    chk(!/گامِ ۱ · .*۳۴۰ ضربدر ۶/.test(priorBlk(o[7].user)), 'D28-6: the next turn\'s prior block is the car ledger, not the thunder one :: ' + priorBlk(o[7].user).slice(0, 400));
  });

  // ================= B28·D9 (pwB2 p9، nB1 p14) — اصلاحِ گامِ دفتر می‌نشیند؛ هر مسئله دفترِ خودش =================
  await section('B28D9', async () => {
    const o = await run('pwB2', 9);
    const P = o[9].pr, s5 = P && P.steps[4];
    chk(!!s5 && s5.verdict === 'ok' && s5.fixed && /۷٫۷/.test(s5.fixed.t) && P.resume !== 5, 'B28·D9 REGRESSION (pwB2 p9 «… شیراز = ۲٫۷ + ۱٫۶ + ۱٫۲ + ۰٫۸ + ۱٫۴ = ۷٫۷»): her fix lands on step 5 (r27: «✓ … نشست»), resume moves on :: ' + JSON.stringify(stepsOf(P)) + ' resume ' + (P && P.resume));
    const n = await run('nB1', 14);
    const floor = Object.keys(n[14].all).map(k => [k, n[14].all[k]]).filter(([k, Q]) => Q.steps.some(x => /کارتن|۳۰ ÷ ۱٫۵|۶ متر در ۵ متر/.test(String(x.fixed ? x.fixed.t : x.quote))));
    const shelves = Object.keys(n[14].all).map(k => [k, n[14].all[k]]).filter(([k, Q]) => Q.steps.some(x => /قفسه|۶۰ تا میشه ۳۰۰|۵ تا ۶۰/.test(String(x.fixed ? x.fixed.t : x.quote))));
    chk(floor.length >= 1 && !floor.some(([k, Q]) => Q.steps.some(x => /قفسه|۶۰ تا میشه ۳۰۰/.test(String(x.fixed ? x.fixed.t : x.quote)))), 'B28·D9 (nB1 p14): the floor problem keeps its own ledger (stale marks, accepted 20.83) — never the shelves steps :: ' + JSON.stringify(Object.keys(n[14].all).map(k => [k, stepsOf(n[14].all[k])])).slice(0, 700));
    chk(!priorBlk(n[14].user) || !/قفسه|۶۰ تا میشه ۳۰۰/.test(priorBlk(n[14].user)), 'B28·D9 (nB1 p14 «برگردیم به سرامیکِ کف …»): the prior block shown for the floor is not the shelves ledger :: ' + priorBlk(n[14].user).slice(0, 400));
    chk(!shelves.some(([k, Q]) => Q.steps.some(x => /کارتن/.test(String(x.fixed ? x.fixed.t : x.quote)))), 'B28·D9 / C97: the shelves ledger has no floor step :: ' + JSON.stringify(shelves.map(([k, Q]) => stepsOf(Q))).slice(0, 300));
  });

  // ================= C27-21 (pwC1 p3) — گامِ اصلاح‌شده دلیلِ کهنهٔ گامِ وابسته را از حکم برمی‌دارد =================
  await section('C27-21', async () => {
    const c = await run('pwC1', 3);
    const L3 = (c[2].lines || []).filter(l => /^گامِ ۳ ·/.test(l))[0] || '', blk = priorBlk(c[3].user);
    chk(!/۱۳۶۰ واتِ ناقصِ گامِ ۲/.test(blk), 'C27-21 (pwC1 p3, round 28 «CHANGED»): after step 2 was fixed ✓, the step-3 verdict text in the coach\'s ledger no longer says «بر ۱۳۶۰ واتِ ناقصِ گامِ ۲ بنا شده» :: ' + blk.split('\n').filter(l => /گامِ ۳/.test(l)).join(' | ').slice(0, 300));
    chk(/ساعت‌های آفتاب/.test(L3) && /ساعت‌های آفتاب/.test(blk),'C27-21 look-alike: the reason that still holds («ساعت‌های آفتاب … را نشمرده») stays :: ' + L3.slice(0, 300));
    chk(!/— [^·]*۱۳۶۰ واتِ ناقصِ گامِ ۲/.test(L3), 'C27-21: her view of step 3 shows the old reason only as history, not as the verdict reason :: ' + L3.slice(0, 300));
  });
  /*SECTIONS*/

  await b.close();
  console.log(JSON.stringify(info));
  if (errors.length) { console.log('FAIL ' + errors.length + '\n' + errors.join('\n')); process.exit(1); }
  console.log('PASS test_tour1_r28_prior');
})();
