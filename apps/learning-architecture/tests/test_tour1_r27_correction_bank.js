// تورِ پولیا (دستهٔ ۱، دورِ ۲۷، ۲۰۲۶-۱۱-۱۵) — DECISIONS_R27، خانوادهٔ R2 «CORRECTION ENGINE» (C47، C48، C66–C68، C74؛ fixer «correction»). همان مهارِ بانکِ دورِ ۲۶.
//  بانکِ مستقلِ VARIANTS_R27 (tests/variants/VARIANTS_R27.json؛ LLA_VARIANTS = مسیرِ دیگر): هر ورودیِ «R2.correction_engine» یک بررسی، با شمارهٔ جایش در فایل (#n، ۰‌پایه = اندیسِ JSON).
//  هر بررسی نقشِ همان ورودی را اجرا می‌کند: [chat] نوبتِ واقعیِ دستیار با گزارشِ retract ِ مدلِ لفظی (مدل گزارش می‌دهد، صفحه می‌سنجد)، [edit] ✏️ ِ کامل، [page]/[prompt]/[time] خودِ صفحه و پرامپتِ بعدی.
//  متنِ ورودی‌ها دست نخورده است؛ ورودی‌ای که برآورده نمی‌شود با دلیل در NC (not covered) گزارش می‌شود، نه بی‌صدا. هیچ تاریخِ تقویمیِ ثابتی در انتظارها نیست.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANKF = process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R27.json')].find(f => f && fs.existsSync(f)) || '';

(async () => {
  const b = await chromium.launch(); const errors = []; const info = { bank: {}, nc: {} };
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('dialog ' + d.message()); d.dismiss(); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const J = (x) => JSON.stringify(x);
  await p.goto(FILE); await p.waitForSelector('.nav'); await p.waitForTimeout(250);
  await p.evaluate(() => {
    APP.S.loaded = true; window.__calls = []; window.__q = [];
    APP.HOST = { report: async () => ({ id: 'sh1', number: 1 }), sheets: async () => [], sheet: async () => null, note: async () => ({ ok: true }), remind: async () => ({ ok: true }), unremind: async () => ({ ok: true }), mail: async () => ({ status: 'sent' }) };
    APP.callAI = async (sys, user, opts) => { __calls.push({ sys, user: String(user || ''), task: opts && opts.task }); let r = __q.shift(); if (typeof r === 'function') r = r(String(user || ''));
      const t = r === undefined ? { reply: 'باشه.', status: 'related', memory: 'm', actions: [] } : r; const text = typeof t === 'string' ? t : JSON.stringify(t); return opts && opts.withMeta ? { text, files: [] } : text; };
    window.R = (o) => Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o);
    window.__turn = async (text, reply, actions, extra) => { const n0 = __calls.length; __q.push(R(Object.assign({ reply: reply || 'باشه.', actions: actions || [] }, extra || {}))); await APP.ASSIST.send(text); __q.length = 0;
      const all = __calls.slice(n0), c = all.filter(x => !/^\[سامانه/.test(String((x.user.split('# نوبتِ تازه\n')[1] || '')).trim()))[0] || {}; return { user: c.user || '', all: all.map(x => x.user) }; };
    window.__wipe = () => { ['achat', 'eprog', 'eprob', 'kcase', 'card', 'deadline', 'fcast', 'mlog'].forEach(t => APP.S.all(t).forEach(r => APP.S.del(r.id))); localStorage.removeItem('lla.assist.cur'); };
    window.__fresh = () => { APP.go('home'); localStorage.removeItem('lla.assist.cur'); const s = APP.ASSIST.newSession(); __q.length = 0; return s.id; };
    window.__cur = () => APP.ASSIST.cur();
    window.__U = (n) => (__cur().msgs || []).filter(m => m.role === 'user' && !/^\[(?:سامانه|اصلاحِ پیامِ قبلی)/.test(m.text))[n - 1];
    window.__live = (title, st, o) => { const r = APP.liveCreate(title, st, 'find', Object.assign({ by: 'user' }, o || {})); return r.p.id; };
    window.__set = (pid, fn) => { const pg = APP.S.get('eprog_' + pid); pg.solve = pg.solve || {}; const L = pg.solve.live = pg.solve.live || {}; ['steps', 'claims', 'moves', 'related', 'aux', 'knots'].forEach(k => { L[k] = L[k] || []; }); fn(pg.solve, L, APP.S.get('eprob_' + pid)); APP.S.put(pg); };
    window.__edit = async (m, nt) => { const s = __cur(), n0 = __calls.length; __q.push(R({ reply: 'درست شد.' })); const r = APP.ASSIST.retractEdit(s, m, nt);
      for (let i = 0; i < 80 && (__calls.length === n0 || APP.ASSIST.busy()); i++) await new Promise(z => setTimeout(z, 100)); await new Promise(z => setTimeout(z, 300)); return { r: { ok: r.ok, changed: (r.changed || []).map(c => c.label + ': ' + (typeof c.old === 'string' ? c.old : '') + ' ⇒ ' + (typeof c.new === 'string' ? c.new : '')), ask: (r.ask || []).map(q => q.path + '|' + q.old + '⇒' + q.new) }, user: (__calls.slice(n0)[0] || {}).user || '' }; };
    window.__asks = (sid) => ((APP.S.get(sid || __cur().id) || {}).copyAsk || []).map(q => ({ id: q.id, path: q.path, label: q.label, old: q.old, new: q.new, state: q.state, pid: q.pid }));
  });
  const turn = (text, reply, actions, extra) => p.evaluate(([t, r, a, x]) => __turn(t, r, a, x), [text, reply || '', actions || [], extra || null]);
  const ev = (f, a) => p.evaluate(f, a);
  const CS = (o) => [Object.assign({ do: 'coach_state' }, o)];
  const RT = (o, more) => [Object.assign({ do: 'coach_state', retract: o }, more || {})];
  const scen = (o) => ev(async (o) => {
    __wipe(); __fresh();
    if (o.stmt0) { const s0 = __cur(); s0.coach = s0.coach || {}; s0.coach.stmt = o.stmt0; APP.S.put(s0); }
    for (const t of (o.prior || [])) { if (typeof t === 'string') await __turn(t, 'خب.'); else await __turn(t.t, t.r || 'خب.', t.a || []); }
    const s = __cur(); let pid = '';
    if (o.stmtChat) { s.coach = s.coach || {}; s.coach.stmt = o.stmtChat; APP.S.put(s); }
    if (o.live) { pid = o.live.typed ? __live(o.live.title || 'مسئلهٔ آزمون', o.live.stmt) : __live(o.live.title || 'مسئلهٔ آزمون', o.live.stmt || (typeof o.prior[0] === 'string' ? o.prior[0] : o.prior[0].t), { by: 'assistant', sess: s.id });
      APP.liveBindSession(pid, APP.S.get(s.id)); if (!o.live.typed) APP.liveStampSess(APP.S.get(s.id));
      __set(pid, (so, L) => { const u = o.live.u; if (u) so.u = { 1: Object.assign({ done: true, at: new Date().toISOString(), one: 'کلِ مسئله', u: 'مجهول', dl: [], c: '', type: 'find', nat: 'practical', from: 'page' }, u) };
        if (o.live.plan) L.plan = { t: o.live.plan, at: new Date().toISOString() };
        (o.live.steps || []).forEach((t, i) => { const st = typeof t === 'string' ? { text: t } : t; L.steps.push(Object.assign({ id: 'st' + (i + 1), at: new Date().toISOString(), pred: 'می‌بینم', due: APP.today() }, st)); });
        if (o.live.b) so.b = { 1: Object.assign({ done: true, from: 'page', at: new Date().toISOString() }, o.live.b) };
        if (o.live.g) so.g = { 1: Object.assign({ at: new Date().toISOString() }, o.live.g) };
        if (o.live.prior) L.prior = o.live.prior;
        if (o.live.solved) { L.state = 'solved'; L.chat = { sess: s.id, at: new Date().toISOString(), solution: o.live.solved }; } }); }
    return pid;
  }, o);
  const snap = (pid) => ev(async (pid) => { const s = __cur(), r = pid && APP.S.get('eprob_' + pid), so = pid && APP.S.get('eprog_' + pid).solve; let card = '';
    if (pid) { APP.go('lprob', pid); await new Promise(z => setTimeout(z, 250)); const c = document.querySelector('#main .lp-stale'); card = c ? c.innerText : ''; }
    const L = so && so.live || {}, C = s.coach || {}, T = C.story || {};
    let pr = L.prior || null; if (!pr) Object.keys(T).forEach(k => { if (T[k] && T[k].prior) pr = T[k].prior; });
    return { st: r ? r.p.statement : '', title: r ? r.p.title : '', asks: __asks(), stale: pid && APP.liveStale ? APP.liveStale(pid).map(x => ({ k: x.k, v: x.v, re: x.re, raw: x.raw })) : [], card,
      state: L.state || '', dl: ((so && so.u && so.u[1] || {}).dl || []).map(x => x.t), plan: L.plan ? L.plan.t : '',
      prior: pr ? pr.steps.map(x => ({ n: x.n, v: x.verdict, stale: x.stale ? (x.stale.nums || []) : null, fixed: x.fixed ? x.fixed.t : '' })) : null, resume: pr ? pr.resume : null,
      story: Object.keys(T).reduce((a, k) => a.concat((T[k].items || []).map(it => it.k + ':' + it.t)), []), evlog: (s.evlog || []).concat(L.evlog || []).map(e => e.title + ' :: ' + (e.lines || []).join(' | ')),
      cg: (C.guesses || []).map(g => ({ id: g.id, t: g.text, r: g.res || '' })), ch: (C.retNote || {}).ch || [], res: (C.retNote || {}).res || null, refused: (C.retNote || {}).refused || null,
      ev: (s.coachEv || []).filter(e => e.how === 'res' && !e.wd).map(e => ({ span: (e.src20 || {}).span, stale: e.stale ? (e.stale.ask ? 'ask' : 'yes') : '' })), sys: s.msgs.filter(m => m.role === 'sys').map(m => m.text).slice(-3),
      strip: APP.liveCorrStale ? APP.liveCorrStale({ pid: pid || '', sess: s.id }) : null, sstale: (s.stale26 || []).slice(-1).map(e => e.items.map(x => x.v + '>' + (x.re == null ? '?' : x.re)).join(' '))[0] || '' }; }, pid);
  const edit = (n, f) => ev(async ([n, f]) => { const m = __U(n); return __edit(m, m.text.split(f[0]).join(f[1])); }, [n, f]);
  const yesAll = () => ev(async () => { for (const a of __asks().filter(a => a.state === 'open')) APP.liveCopyAnswer(__cur().id, a.id, true); });
  const RES = (t, more) => ({ t, a: CS(Object.assign({ ph: 'c', said: ['result'], result: t }, more || {})) });
  const st2 = (x) => x.stale.map(s0 => s0.v + '>' + (s0.re == null ? '?' : s0.re)).join(' ');
  const has = (x, v, re) => x.stale.some(s0 => s0.v === v && (re === undefined ? true : re === null ? s0.re == null : s0.re != null && Math.abs(s0.re - re) < 1e-6));
  const vals = (x) => x.stale.map(s0 => s0.v);
  const allText = (x) => J([x.card, x.ch, x.sys, x.res]);
  const H = { scen, snap, edit, yesAll, RES, st2, has, vals, allText, CS, RT, turn, ev, J };

  const bank = BANKF && fs.existsSync(BANKF) ? JSON.parse(fs.readFileSync(BANKF, 'utf8')) : null;
  info.bank.file = BANKF || '(missing)';
  if (!bank) errors.push('bank: VARIANTS_R27 not found (tests/variants/VARIANTS_R27.json)');
  else {
    const Q2 = bank.map((e, i) => Object.assign({ idx: i }, e)).filter((e) => /^R2\./.test(String(e.rc || '')));
    info.bank.n = bank.length; info.bank.q2 = Q2.length;
    const BH = require('./tour1_r27_correction_bank.js');
    const out = await BH.run({ p, ev, turn, bank, Q2, H });
    Object.assign(info.bank, out.summary, out.extra ? { extra: out.extra } : {}); Object.assign(info.nc, out.nc);
    out.fail.forEach(f => errors.push('bank ' + f));
  }
  console.log(J({ bank: info.bank, nc: info.nc }, null, 1));
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exit(1); }
  console.log('NO ERRORS');
})();
