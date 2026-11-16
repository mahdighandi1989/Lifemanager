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
    const np = await p.evaluate(() => { const f = (stmt, t) => APP.STORY.newProb28({ id: 'x', coach: { pk: 'c:9', stmt } }, { pid: 'zz', done: true }, t);
      const car = 'امروز معلم یه سؤال داد: ماشین با سرعتِ ۷۲ کیلومتر بر ساعت میره، تو ۱۰ ثانیه چند متر میره؟';
      return [f(car, car), f('اگه ۶ نفر باشیم چی میشه', 'اگه ۶ نفر باشیم چی میشه؟'), f('اگه ۶ نفر باشیم چی میشه', 'یه مسئلهٔ جدا: اگه ۶ نفر باشیم چی میشه؟'), f(car, 'یه بارِ دیگه، گزارشِ سوم: ' + car)]; });
    chk(np[0] === true && np[1] === false && np[2] === true && np[3] === false, 'D28-6 / C126 look-alikes (ST.newProb28): a new statement with its own unknown ⇒ new ledger; «اگه ۶ نفر باشیم چی؟» is a hypothetical of the same problem unless she calls it separate; a self-labelled «گزارشِ سوم» stays in the old ledger :: ' + JSON.stringify(np));
    chk(!/گامِ ۱ · .*۳۴۰ ضربدر ۶/.test(priorBlk(o[7].user)), 'D28-6: the next turn\'s prior block is the car ledger, not the thunder one :: ' + priorBlk(o[7].user).slice(0, 400));
  });

  // ================= B28·D9 (pwB2 p9، nB1 p14) — اصلاحِ گامِ دفتر می‌نشیند؛ هر مسئله دفترِ خودش =================
  await section('B28D9', async () => {
    const o = await run('pwB2', 9);
    const P = o[9].pr, s5 = P && P.steps[4];
    chk(!!s5 && s5.verdict === 'ok' && s5.fixed && /۷٫۷/.test(s5.fixed.t) && P.resume !== 5, 'B28·D9 REGRESSION (pwB2 p9 «… شیراز = ۲٫۷ + ۱٫۶ + ۱٫۲ + ۰٫۸ + ۱٫۴ = ۷٫۷»): her fix lands on step 5 (r27: «✓ … نشست»), resume moves on :: ' + JSON.stringify(stepsOf(P)) + ' resume ' + (P && P.resume));
    const ow = await p.evaluate(() => [APP.STORY.otherWork27('داداشم حساب کرد نصب ۳ روز × ۴۰۰ هزار = ۱۲۰۰ هزار تومن میشه.'), APP.STORY.otherWork27('مادرم اولش نه گفت، ولی بعد گفت امتحانش می‌کنم. پس نمره‌ی مادر میشه ۷. شیراز = ۷٫۷.')].map(o => o && o.text));
    chk(/۱۲۰۰/.test(ow[0] || '') && !!ow[1] && !/۷٫۷|نمره/.test(ow[1]), 'B28·D9 root (a45 ST.otherWork27): «… گفت … . پس …» — her own inference after reported speech is hers; look-alike «داداشم حساب کرد … = ۱۲۰۰ …» stays the brother\'s work :: ' + JSON.stringify(ow));
    const n = await run('nB1', 14);
    const floor = Object.keys(n[14].all).map(k => [k, n[14].all[k]]).filter(([k, Q]) => Q.steps.some(x => /کارتن|۳۰ ÷ ۱٫۵|۶ متر در ۵ متر/.test(String(x.fixed ? x.fixed.t : x.quote))));
    const shelves = Object.keys(n[14].all).map(k => [k, n[14].all[k]]).filter(([k, Q]) => Q.steps.some(x => /قفسه|۶۰ تا میشه ۳۰۰|۵ تا ۶۰/.test(String(x.fixed ? x.fixed.t : x.quote))));
    chk(floor.length >= 1 && !floor.some(([k, Q]) => Q.steps.some(x => /قفسه|۶۰ تا میشه ۳۰۰/.test(String(x.fixed ? x.fixed.t : x.quote)))), 'B28·D9 (nB1 p14): the floor problem keeps its own ledger (stale marks, accepted 20.83) — never the shelves steps :: ' + JSON.stringify(Object.keys(n[14].all).map(k => [k, stepsOf(n[14].all[k])])).slice(0, 700));
    chk(floor.some(([k, Q]) => /^eprog_/.test(k) && Q.steps.length >= 4), 'B28·D9 (nB1 p12–p14): the floor live problem carries its own ≥4-step ledger :: ' + JSON.stringify(floor.map(([k, Q]) => [k, Q.steps.length])));
    chk(!priorBlk(n[14].user) ||!/قفسه|۶۰ تا میشه ۳۰۰/.test(priorBlk(n[14].user)), 'B28·D9 (nB1 p14 «برگردیم به سرامیکِ کف …»): the prior block shown for the floor is not the shelves ledger :: ' + priorBlk(n[14].user).slice(0, 400));
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
  // ================= بانکِ مستقلِ R28 — همهٔ ورودی‌های R6.prior_work (۲۱۸–۲۵۳)؛ «مدل» این‌جا گزارشِ ساختگیِ مدل است، داوری فقط سهمِ صفحه =================
  await section('bank', async () => {
    const own6 = (i) => /^R6\b/.test(String(E[i].rc || ''));
    const TQ_OPEN = 'خودم تا اینجا حساب کردم، ببین درسته: باغ ۲ هکتاره، یعنی ۲۰۰۰۰ مترمربع. هر مترمربع روزی ۵ لیتر: ۲۰۰۰۰ × ۵ = ۱۰۰۰۰۰ لیتر. تانکرِ ۸۰۰۰ لیتری: ۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۵ بار. هر بار ۲۰۰ هزار: ۱۵ × ۲۰۰ = ۳۰۰۰ هزار. چند بار تانکر لازمه و کلش چقدر میشه؟';
    const T_PRIOR = [{ step: 'مساحت', quote: 'باغ ۲ هکتاره، یعنی ۲۰۰۰۰ مترمربع', verdict: 'ok' }, { step: 'آبِ روزانه', quote: '۲۰۰۰۰ × ۵ = ۱۰۰۰۰۰ لیتر', verdict: 'ok' },
      { step: 'شمارِ بار', quote: '۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۵ بار', verdict: 'wrong', why: '۱۵ نیست: تقسیم دوباره حساب شود' }, { step: 'هزینه', quote: '۱۵ × ۲۰۰ = ۳۰۰۰ هزار', verdict: 'incomplete', why: 'بر گامِ ۳ تکیه دارد', dep: [3] }];
    const tank = async (live) => { await wipe(); await fresh(); let pid = ''; if (live) pid = await bind('مسئلهٔ تانکر', 'باغ ۲ هکتاره و هر مترمربع روزی ۵ لیتر آب می‌خواد، تانکر ۸۰۰۰ لیتریه و هر بار ۲۰۰ هزار؛ چند بار باید بیاد و کلش چقدر میشه؟');
      const r = await ppr(TQ_OPEN, T_PRIOR); return { pid, r }; };
    const snap = (pid) => p.evaluate((pid) => { const s = __cur(); const pr = APP.STORY.priorFor(pid ? null : s, pid || ''); return pr ? JSON.parse(JSON.stringify({ n: pr.steps.length, resume: pr.resume || 0, st: pr.steps.map(x => [x.n, x.verdict, String(x.fixed ? x.fixed.t : x.quote), !!x.stale, (x.depStale || []).concat(x.depWrong || []).join(), x.re ? 1 : 0, x.her || '']) })) : null; }, pid || '');
    const same = (a, b) => JSON.stringify(a && a.st.map(x => x.slice(0, 5))) === JSON.stringify(b && b.st.map(x => x.slice(0, 5))) && a.resume === b.resume;
    const ledgers = () => p.evaluate(() => { const o = {}; APP.S.all('eprog').forEach(pg => { const P = pg.solve && pg.solve.live && pg.solve.live.prior; if (P) o[pg.id] = P.steps.map(x => String(x.fixed ? x.fixed.t : x.quote)); });
      APP.S.all('achat').forEach(se => { const st = (se.coach || {}).story || {}; Object.keys(st).forEach(k => { if (st[k].prior) o[se.id + '|' + k] = st[k].prior.steps.map(x => String(x.fixed ? x.fixed.t : x.quote)); }); }); return o; });
    const NOPRIOR = (u) => !ask(u) && !PRIOR_BLK.test(head(u)) && !/نقطهٔ ازسرگیری/.test(bold(u));
    const day = (n) => p.evaluate((n) => { const d = new Date(window.__day + 'T09:00:00'); d.setDate(d.getDate() + n); window.__day = d.toISOString().slice(0, 10); }, n);
    const sysNotes = () => p.evaluate(() => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => String(m.text || '')));
    const closed = async () => { await turn('حل شد: ۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۲٫۵ بار، یعنی ۱۲٫۵ × ۲۰۰ = ۲۵۰۰ هزار تومن', 'آفرین.', [csn({ ph: 'l', said: ['result'], result: '۱۲٫۵ × ۲۰۰ = ۲۵۰۰ هزار تومن', prior: [{ n: 3, quote: '۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۲٫۵ بار', verdict: 'ok' }, { n: 4, quote: '۱۲٫۵ × ۲۰۰ = ۲۵۰۰ هزار تومن', verdict: 'ok' }] }),
      { do: 'chat_solved', title: 'مسئلهٔ تانکر', statement: 'باغ ۲ هکتاره و هر مترمربع روزی ۵ لیتر آب می‌خواد، تانکر ۸۰۰۰ لیتریه و هر بار ۲۰۰ هزار؛ چند بار باید بیاد و کلش چقدر میشه؟', solution: '۱۲٫۵ بار، ۲۵۰۰ هزار تومن' }]);
      const pid = await p.evaluate(() => { const bl = APP.ASSIST.boundLive(__cur()); return bl ? bl.pid : ''; });
      const ph = await p.evaluate((pid) => { if (!pid) return ''; if (APP.livePhase(pid) !== 'done') { try { APP.STORY.chatSolvedClose(pid); } catch (e) { } }
        if (APP.livePhase(pid) !== 'done') __liveSet(pid, (so, L) => { L.state = 'solved'; L.stateAt = new Date().toISOString(); L.stateD = APP.today(); so.u = so.u || {}; so.u[1] = so.u[1] || { done: true, from: 'chat' }; so.lb = so.lb || {}; });
        return APP.livePhase(pid) + '|' + JSON.stringify(APP.ASSIST.boundLive(__cur()) && APP.ASSIST.boundLive(__cur()).done); }, pid);
      return { pid, done: /^done/.test(ph), ph }; };
    for (let i = 0; i < BANK.length; i++) { if (!own6(i)) continue; const t = E[i].text.replace(/^.*U: /s, ''); await p.evaluate((d) => { window.__day = d; }, T0);
      try {
        if (i === 218) { await wipe(); await fresh();
          const r = await ppr(t, [{ step: 'میزها', quote: '۳۶ ÷ ۴ = ۹ میز', verdict: 'ok' }, { step: 'ویلچر', quote: 'ولی ۲ نفر ویلچر دارن و هر کدوم جای ۲ نفر رو می‌گیرن', verdict: 'unchecked', why: 'هنوز در شمارِ میزها نیامده' }]);
          const s = await snap(), q = await PQ(); T(i, ask(r.user) && s && s.st[0][1] === 'ok' && s.resume === 2 && !/۳۶ ÷ ۴/.test(q), { ask: ask(r.user), s, q });
        } else if (i === 219 || i === 245) { await tank(false); const { pid, done } = await closed(); const b4 = await snap(pid); await day(2);
          const r = await turn(t, 'کارت را دیدم.', [csn({ ph: 'e', said: [], prior: [{ step: 'سرعت', quote: '۷۲۰۰۰ ÷ ۳۶۰۰ = ۲۰ متر بر ثانیه', verdict: 'ok' }, { step: 'مسافت', quote: 'پس تو ۱۰ ثانیه ۲۰۰ متر میره', verdict: 'ok' }] })]);
          const a = await snap(pid), L = await ledgers(), car = Object.keys(L).filter(k => L[k].some(x => /۷۲۰۰۰/.test(x)));
          if (i === 219) T(i, done && !!b4 && same(a, b4) && a.n === 4 && car.length === 1 && L[car[0]].length === 2 && !/گامِ ۵/.test(JSON.stringify(r.all)), { b4, a, L });
          else { const rows = await p.evaluate((pid) => { APP.go('lprob', pid); return document.querySelectorAll('#main .lp-prior-step').length; }, pid); T(i, rows === 4 && a.n === 4, { rows, a }); }
        } else if (i === 220 || i === 249) { const { pid } = await tank(true); const b4 = await snap(pid);
          const r = await turn(i === 220 ? t : 'یه مسئله‌ی دیگه: استخرِ ۴۸ مترمکعبی با پمپِ ساعتی ۶ مترمکعب؛ من حساب کردم ۴۸ ÷ ۶ = ۸ ساعت', 'کارت را دیدم.', [csn({ ph: 'e', said: [], prior: [{ step: 'زمان', quote: '۴۸ ÷ ۶ = ۸ ساعت', verdict: 'ok' }] })]);
          if (i === 249) await turn(t, 'باشه.', [csn({ ph: 'e', said: [], prior: [{ n: 1, quote: 'پمپ ساعتی ۸ مترمکعبه نه ۶', verdict: 'incomplete', why: 'زمان با ۸ دوباره حساب شود' }] })]);
          const a = await snap(pid), L = await ledgers(), pool = Object.keys(L).filter(k => L[k].some(x => /۴۸/.test(x)));
          T(i, same(a, b4) && a.n === 4 && pool.length === 1 && !L[pool[0]].some(x => /۱۰۰۰۰۰|تانکر/.test(x)), { b4, a, L });
        } else if (i === 221 || i === 222 || i === 236) { const { pid } = await tank(true);
          await turn('تانکر رو درست کردم: ۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۲٫۵ بار', 'آفرین.', [csn({ ph: 'e', said: ['result'], result: '۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۲٫۵ بار' })]);
          const a = await snap(pid), pr = await PR(pid);
          if (i === 221) { const s3 = pr.steps[2], s4 = pr.steps[3]; const prop = (s4.fix || '') + ' ' + (s4.stale && s4.stale.nums || []).map(q => q.v + '=>' + q.re).join(' ');
            T(i, s3.verdict === 'ok' && s3.fixed && /۱۲٫۵/.test(s3.fixed.t) && /۱۵/.test(s3.fixed.was || '') && a.resume === 4 && ((s4.depStale || []).length || s4.stale || (s4.depWrong || []).length) && /3000=>2500/.test(prop), { a, prop, s4: { fix: s4.fix, depStale: s4.depStale, stale: s4.stale, depWrong: s4.depWrong } }); }
          else if (i === 222) { const row = await p.evaluate((pid) => { APP.go('lprob', pid); const r = document.querySelector('#main .lp-prior-step[data-n="3"]'); return r ? r.textContent : ''; }, pid);
            T(i, /۱۲٫۵/.test(row) && /✓/.test(row) && !/۱۵ نیست|نادرست/.test(row.replace(/⇐ «[^»]*»/g, '')), { row }); }
          else { const ev = await evs(); T(i, ev.some(e => e.ok && e.prior === 1) && ev.some(e => e.ok && e.prior === 2) && ev.some(e => e.ok && e.prior === 3 && e.how === 'priorfix') && ev.some(e => !e.ok && e.prior === 3 && e.cause), { ev }); }
        } else if (i === 223) { const { pid } = await tank(true);
          await turn(t, 'باشه.', [csn({ ph: 'e', said: ['result'], result: '۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۱ بار' })]); const a = await snap(pid), pr = await PR(pid);
          T(i, a.st[2][1] === 'wrong' && a.resume === 3 && !/۱۱/.test(String(pr.steps[3].fix || '')) && !/^۱۱|= ۱۱ بار/.test(a.st[2][2]), { a });
        } else if (i === 224) { await tank(false); const { pid, done } = await closed(); const b4 = await snap(pid);
          await turn(t, 'باشه.', [csn({ ph: 'e', said: [], prior: [{ step: 'ماهانه', quote: '۲۵۰۰ هزار تقسیم بر ۵ ماه = ۵۰۰ هزار در ماه', verdict: 'ok' }] })]);
          const a = await snap(pid), L = await ledgers(); T(i, done && a.n === 5 && a.st[4][1] === 'ok' && JSON.stringify(a.st.slice(0, 4).map(x => x.slice(0, 3))) === JSON.stringify(b4.st.map(x => x.slice(0, 3))) && Object.keys(L).filter(k => L[k].some(x => /۵۰۰ هزار در ماه/.test(x))).length === 1, { b4, a, L });
        } else if ([225, 227, 246, 248, 250, 251].includes(i)) { const { pid } = await tank(true); const b4 = await snap(pid);
          const r = await turn(t, 'باشه.', [csn({ ph: 'e', said: [] })]); const a = await snap(pid);
          const ok = same(a, b4) && a.n === 4 && !a.st.some(x => x[5]) && (i !== 227 || !/# اصلاحِ پیامِ پیشین/.test(head(r.user)));
          T(i, ok, { b4, a, retract: /# اصلاحِ پیامِ پیشین/.test(head(r.user)) });
        } else if (i === 226) { const { pid } = await tank(true);
          await turn(t, 'باشه.', [csn({ ph: 'e', said: [], retract: { msg: 'هر مترمربع روزی ۵ لیتر', fix: '۴ لیتر', old: '۵ لیتر' } })]); const a = await snap(pid), pr = await PR(pid);
          const props = pr.steps.map(x => String(x.fix || '') + JSON.stringify(x.stale || {}));
          T(i, (a.st[1][3] || /۸۰۰۰۰/.test(props[1])) && !/اگه/.test(JSON.stringify(a.st)), { a, props });
        } else if (i === 228) { const { pid } = await tank(true);
          const r = await turn(t, 'دوباره سنجیدم.', [csn({ ph: 'e', said: [] })]); const a = await snap(pid);
          T(i, a.st[2][1] === 'wrong' && /بازسنجی|دوباره‌سنجی|دوباره سنج|رد می‌کند/.test(head(r.user)) && !/۱۲٫۵/.test(bold(r.user)), { a, h: head(r.user).split('\n').filter(l => /بازسنجی|رد می‌کند|دوباره/.test(l)).join(' | ').slice(0, 400) });
        } else if (i === 229) { const { pid } = await tank(true);
          await turn(t, 'آفرین.', [csn({ ph: 'e', said: ['result'], result: '۱۲٫۵ بار، یعنی ۲۵۰۰ هزار تومن' })]); const a = await snap(pid), ph = await sph(pid);
          T(i, /۱۲٫۵/.test(a.st[2][2]) && a.st[2][1] === 'ok' && /۲۵۰۰/.test(a.st[3][2]) && /^(?:l|r|done)/.test(String(ph.story || ph.form)), { a, ph });
        } else if (i === 230) { const { pid } = await tank(true); const q = await PQ(pid);
          T(i, /گامِ ۳/.test(q) && !/هکتار|مترمربع|لیتر/.test(q.replace(/«[^»]*»/g, '')), { q });
        } else if (i === 231) { const { pid } = await tank(true);
          const d = await p.evaluate((pid) => { APP.go('dossier', pid); const t = document.getElementById('main').innerText; return t.slice(t.indexOf('📜')); }, pid);
          T(i, /کارِ پیشین/.test(d) && /✓/.test(d) && /✗/.test(d) && /وابسته به گامِ ۳/.test(d) && !/برنامه[^\n]{0,20}۱۰۰۰۰۰ ÷ ۸۰۰۰/.test(d) && !/حدس[^\n]{0,20}۱۰۰۰۰۰/.test(d), { d: d.slice(0, 900) });
        } else if (i === 232) { await wipe(); await fresh();
          const r = await ppr(t, [{ step: 'مدادها', quote: '۳ تا ۸ تا میشه ۲۴', verdict: 'ok' }, { step: 'بعدش', quote: '۵ تاش رو دادم به دوستم، بعدش نمی‌دونم چی کار کنم', verdict: 'unchecked', why: 'هنوز ۲۴ − ۵ حساب نشده' }]);
          const s = await snap(), q = await PQ(); T(i, ask(r.user) && s && s.st[0][1] === 'ok' && s.resume === 2 && !!q && !/۳ تا ۸ تا/.test(q), { s, q });
        } else if (i === 233) { const { pid } = await tank(true);
          await turn('قبول ندارم', 'دوباره سنجیدم: ✗ می‌ماند.', [csn({ ph: 'e', said: [] })]); await day(3);
          await turn(t, 'باشه.', [csn({ ph: 'e', said: [], prior: [{ step: 'هزینه', quote: 'هر بار ۲۰۰ هزار، ۱۲٫۵ بار، پس ۲۵۰۰ هزار', verdict: 'ok' }] })]);
          const a = await snap(pid), L = await ledgers(); T(i, Object.keys(L).filter(k => L[k].some(x => /۲۵۰۰/.test(x))).length === 1 && a.st.some(x => /۲۵۰۰/.test(x[2]) && x[1] === 'ok'), { a, L });
        } else if (i === 234) { const { pid } = await tank(true);
          await turn('تانکر رو درست کردم: ۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۲٫۵ بار', 'آفرین.', [csn({ ph: 'e', said: ['result'], result: '۱۰۰۰۰۰ ÷ ۸۰۰۰ = ۱۲٫۵ بار' })]);
          await turn('آره، همون ۲۵۰۰ درسته', 'باشه.', [csn({ ph: 'e', said: [] })]); const a = await snap(pid), pr = await PR(pid), s4 = pr.steps[3];
          const row = await p.evaluate((pid) => { APP.go('lprob', pid); const r = document.querySelector('#main .lp-prior-step[data-n="4"]'); return r ? r.textContent : ''; }, pid);
          T(i, /۲۵۰۰/.test(String(s4.fixed ? s4.fixed.t : '')) && /۳۰۰۰/.test(String(s4.fixed ? s4.fixed.was : '')) && /۲۵۰۰/.test(row), { s4: { fixed: s4.fixed, fix: s4.fix }, row });
        } else if (i === 235) { NC(i, 'the problem title comes from the model\'s live_new/title (a27 routing, «surface»/C28-5), not from the prior ledger; no page-side prior function names the record');
        } else if (i === 237) { await wipe(); await fresh(); const r = await turn(t, 'باشه.', []); T(i, ask(r.user), { blk: priorBlk(r.user).slice(0, 200) });
        } else if (i === 238) { await wipe(); await fresh(); const r = await turn(t, 'باشه.', []);
          T(i, ask(r.user) && /چند وجه دارد/.test(priorBlk(r.user)), { blk: priorBlk(r.user).slice(0, 300) });
        } else if ([239, 241, 242, 243, 244, 253].includes(i)) { await wipe(); await fresh(); const r = await turn(t, 'باشه.', []); const s = await snap(); T(i, NOPRIOR(r.user) && !s, { blk: priorBlk(r.user).slice(0, 200), s });
        } else if (i === 240) { const { pid } = await tank(true); const b4 = await snap(pid); const r = await turn(t, '۵۴ است.', [csn({ ph: 'e', said: [] })]); const a = await snap(pid);
          T(i, same(a, b4) && !ask(r.user), { b4, a });
        } else if (i === 247) { const { pid } = await tank(true); const r = await turn(t, 'باشه.', [csn({ ph: 'e', said: [] })]); const a = await snap(pid);
          const n = await sysNotes(); T(i, a.st[2][1] === 'wrong' && !/بازسنجیِ حسابِ صفحه \(او به|به درخواستِ خودتان/.test(head(r.user)) && !n.some(x => /اعتراضِ خودتان/.test(x)), { a, h: head(r.user).split('\n').filter(l => /بازسنجی/.test(l)).join(' | ').slice(0, 300) });
        } else if (i === 252) { await tank(false); const { pid, done } = await closed(); const b4 = await snap(pid), L0 = await ledgers();
          await turn(t, 'باشه.', [csn({ ph: 'e', said: [] })]); const a = await snap(pid), L = await ledgers(), cl = await p.evaluate((pid) => APP.livePhase(pid), pid);
          T(i, done && same(a, b4) && Object.keys(L).length === Object.keys(L0).length && cl === 'done', { a, L, cl });
        } else NC(i, 'not exercised');
      } catch (ex) { T(i, false, 'exception ' + String(ex).slice(0, 300)); }
    }
    console.log('bank R6: ' + Object.values(info.bank).filter(Boolean).length + '/' + Object.keys(info.bank).length + ' pass; nc: ' + JSON.stringify(info.nc));
  });
  /*SECTIONS*/

  await b.close();
  console.log(JSON.stringify(info));
  if (errors.length) { console.log('FAIL ' + errors.length + '\n' + errors.join('\n')); process.exit(1); }
  console.log('PASS test_tour1_r28_prior');
})();
