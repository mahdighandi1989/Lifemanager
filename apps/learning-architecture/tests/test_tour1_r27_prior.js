// تورِ پولیا (دستهٔ ۱، دورِ ۲۷، سهمِ «prior» — ۲۰۲۶-۱۱-۱۵) — DECISIONS_R27: R4 «کارِ پیشین» (C46 پرسشِ فرضی، C56 گامِ کارشده در آغاز و ادغامِ هر گزارش).
//  runners  نوبت‌های خودِ دونده‌های دورِ ۲۷ (tests/variants/R26_prior_runs.json + R27_prior_runs.json: متنِ کاربر + پاسخِ ضبط‌شدهٔ مدل، بازپخش روی صفحه)
//  bank     ورودی‌های R4 در بانکِ مستقلِ tests/variants/VARIANTS_R27.json
//  هر رفعِ مثبت «شبیهِ منفی» ِ خودش را در همان بخش دارد. روزِ صفحه منجمد است (APP.today)؛ هیچ انتظاری به تاریخِ تقویم بسته نیست.
// LLA_FILE = ساختِ دیگر (برای «قرمزِ نخست»: ساختِ BASE27)؛ ONLY=<section,...>
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const vfile = (n) => [path.join(__dirname, 'variants', n), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', n); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f));
const BANK = (() => { const f = process.env.LLA_VARIANTS || vfile('VARIANTS_R27.json'); return f && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : []; })();
const RUNS = Object.assign({}, JSON.parse(fs.readFileSync(vfile('R26_prior_runs.json'), 'utf8')), (() => { const f = vfile('R27_prior_runs.json'); return f ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; })());

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
  const run = async (sid, upto, from) => {
    const T = RUNS[sid].turns.filter(t => t.p <= upto), out = {}; if (!from) { await wipe(); await fresh(); }
    for (let k = 0; k < T.length;) { const t = T[k]; if (t.sys || !t.u || (from && t.p < from)) { k++; continue; }
      const q = [t.r]; let j = k + 1; while (j < T.length && T[j].sys) { q.push(T[j].r); j++; }
      out[t.p] = await p.evaluate(async ([text, q]) => { const n0 = __calls.length; __q = q.map(r => typeof r === 'string' ? r : JSON.stringify(r)); await APP.ASSIST.send(text); __q.length = 0;
        const s = __cur(), bl = APP.ASSIST.boundLive ? APP.ASSIST.boundLive(s) : null, pid = (bl && !bl.done ? bl.pid : '') || (APP.STORY.priorPid ? APP.STORY.priorPid(s, text) : ''), pr = APP.STORY.priorFor(s, pid), u = (__calls[n0] || {}).user || '';
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
  // ================= runners — جمله‌های خودِ دونده‌های دورِ ۲۷ =================
  const sysNotes = () => p.evaluate(() => (__cur().msgs || []).filter(m => m.role === 'sys').map(m => String(m.text || '')));
  const RECHK_OK = /بازسنجی شد ⇒ درست|«✗» ِ پیشین (?:از خوانشِ خودِ صفحه|خطای خوانشِ صفحه)/;

  await section('D27-2', async () => {   // S1: پرسشِ فرضی خوانده شد اعتراض و «۱۷۰۰ ثانیه = ۱۷» درست اعلام شد
    const o = await run('pwD1', 3);
    const u3 = head(o[3].user), notes = await sysNotes();
    chk(!RECHK_OK.test(u3) && !/بازسنجیِ حسابِ صفحه \(او به «✗»/.test(u3), 'D27-2 S1 (pwD1 p3 «… اگه یه روز صفحه حسابِ درستِ منو غلط بخونه، از کجا بفهمم خطا از صفحه‌ست نه از من؟»): a hypothetical question is not a dispute — no re-check block for the coach :: ' + u3.split('\n').filter(l => /بازسنجی/.test(l)).join(' | ').slice(0, 400));
    chk(!notes.some(n => RECHK_OK.test(n)), 'D27-2 S1: her bubble never says «۱۷۰۰ ثانیه = ۱۷ … بازسنجی شد ⇒ درست» (1700 s = 28.3 min) :: ' + notes.filter(n => /بازسنجی/.test(n)).join(' | ').slice(0, 300));
    chk(stp(o[3], 4).verdict === 'ok' && stp(o[3], 4).fixed && /۲۸/.test(stp(o[3], 4).fixed.t) && !stp(o[3], 4).re, 'D27-2 / C46: the ledger does not change on a hypothetical — step 4 stays her own fix «۱۷۰۰ ثانیه حدودِ ۲۸ دقیقه‌ست» :: ' + line(o[3], 4).slice(0, 200));
    // جدا از پرسشِ فرضی، ریشهٔ دوم: بازسنجی بازحساب است — متنِ بریدهٔ ۶۰۰ نویسه‌ای «درست» خوانده نمی‌شود
    await wipe(); await fresh();
    const pad = 'سلام. ' + 'این یه توضیحِ طولانی دربارهٔ برنامهٔ تمرینم برای مسابقه است و فقط زمینه است. '.repeat(9);
    await turn(pad + 'آخرش: هر مرور ۱۰ ثانیه، ۱۷۰ ضربدر ۱۰ میشه ۱۷۰۰ ثانیه یعنی ۱۷ دقیقه.', 'باشه.', []);
    const bad0 = await p.evaluate(() => (__cur().coach.arithBad || []).map(b => [b.expr, b.said, b.text.length]));
    const r2 = await turn('نه، حسابم درسته؛ دوباره بسنج.', 'باشه.', []);
    const n2 = await sysNotes();
    chk(bad0.length >= 1 && !RECHK_OK.test(head(r2.user)) && !n2.some(n => RECHK_OK.test(n)), 'D27-2 root 2 (recheck must recompute, never trust): a real dispute of «۱۷۰۰ ثانیه یعنی ۱۷ دقیقه» whose stored text was clipped is never cleared as «درست» :: ' + JSON.stringify(bad0) + ' | ' + head(r2.user).split('\n').filter(l => /بازسنجی/.test(l)).join(' | ').slice(0, 300));
    chk(/حکم ماند|نسنجیده/.test(head(r2.user)), 'D27-2 root 2 look-alike: the real dispute is still heard — the page re-checks once (kept ✗ or «نسنجیده»), never silent :: ' + head(r2.user).split('\n').filter(l => /بازسنجی/.test(l)).join(' | ').slice(0, 300));
    // look-alike: اعتراضِ واقعی با بندِ شرطیِ پرهیز («اگه اشتباه نکنم، …») هنوز اعتراض است
    await wipe(); await fresh();
    await turn('هر مرور ۱۰ ثانیه؛ ۱۷۰ ضربدر ۱۰ میشه ۱۷۰۰ ثانیه یعنی ۱۷ دقیقه.', 'باشه.', []);
    const r3 = await turn('اگه اشتباه نکنم، حسابم درسته؛ دوباره بسنج.', 'باشه.', []);
    chk(/بازسنجیِ حسابِ صفحه/.test(head(r3.user)) && /حکم ماند/.test(head(r3.user)) && !RECHK_OK.test(head(r3.user)), 'look-alike (C29): «اگه اشتباه نکنم، حسابم درسته؛ دوباره بسنج» is a dispute — re-checked once, ✗ kept :: ' + head(r3.user).split('\n').filter(l => /بازسنجی/.test(l)).join(' | ').slice(0, 300));
    // look-alike: «اگه … بود چی؟» بعد از ✗ ِ پیامِ پیشین ⇒ نه اعتراض
    const r4 = await turn('اگه هر مرور ۸ ثانیه بود چی؟ اون وقت خطا از صفحه بود؟', 'باشه.', []);
    chk(!/بازسنجیِ حسابِ صفحه \(او به/.test(head(r4.user)), 'C46: «اگه هر مرور ۸ ثانیه بود چی؟ اون وقت خطا از صفحه بود؟» is not a dispute :: ' + head(r4.user).split('\n').filter(l => /بازسنجی/.test(l)).join(' | ').slice(0, 200));
  });

  await section('D26-11', async () => {   // ردِ به معنا پس از بستن (pwD1 p11، دورِ ۲۷: پس از «✅ حل شد — بازنگری»)
    await run('pwD1', 8);
    await p.evaluate(() => { const s = __cur(), bl = APP.ASSIST.boundLive(s); APP.STORY.chatSolvedClose(bl.pid); });
    const o = await run('pwD1', 12, 9);
    chk(/گامِ ۴/.test(tq(o[11].user)) && /رد می‌کند/.test(ctx(o[11].user)), 'D26-11 STILL→ (pwD1 p11 «گامِ ۴ به نظرم غلطه؛ ۲۴۷ ضربدر ۸ نباید ۱۹۷۶ بشه» after «✅ حل شد»): the dispute by meaning is heard after closure too :: ' + tq(o[11].user).slice(0, 200));
    chk(/پس می‌گیرد/.test(ctx(o[12].user)) && !/گامِ بعدیِ تو چیست/.test(ctx(o[12].user)), 'C56/A25-20: the take-back after closure is heard and no resume question is asked of a closed problem :: ' + ctx(o[12].user).slice(0, 300));
    chk(!/رد می‌کند/.test(ctx(o[10].user)) && !/پس می‌گیرد/.test(ctx(o[10].user)), 'look-alike (A25-7): «نه، بس نیست! …» after closure is still no dispute :: ' + ctx(o[10].user).slice(0, 160));
  });

  await section('C56open', async () => {   // A27-13 (s06، pA2)، B27·D3 (pwB3)، C25-7 (pC1)
    for (const [sid, k, why] of [['s06', 8, 'A27-13 (s06 p8 «یه سؤالِ تازه: … خودم یه گام رفتم: ۲۰۰ پیام در ثانیه × ۳۶۰۰ = ۷۲۰۰۰۰ پیام در ساعت»)'],
      ['pA2', 8, 'A27-13 (pA2 p8 «سلام، یه مسئلهٔ تازه دارم: … خودم یه گامش رو رفتم: ۴۰ میلیون × ۱٫۲ = ۴۸ میلیون»)'],
      ['pwB3', 1, 'B27·D3 (pwB3 p1 «گامِ اول رو خودم رفتم: نصفِ محیط میشه طول + عرض = ۱۸ سانت»)'],
      ['pC1', 1, 'C25-7 (pC1 p1 «من امتحان کردم: x=4 و y=1 میشه 16−1=15 درسته، x=8 و y=7 هم میشه 64−49=15»)']]) {
      const o = await run(sid, k);
      chk(ask(o[k].user), why + ': a worked step at the opening fires C7 (the «کارِ پیشینِ تو» request) :: ' + tq(o[k].user).slice(0, 160));
      if (sid !== 'pwB3') chk(/# حسابِ صفحه روی همین پیام/.test(head(o[k].user)), why + ': the page\'s arithmetic block reads the step :: ' + head(o[k].user).split('\n').filter(l => /حسابِ صفحه/.test(l)).join(' | ').slice(0, 200));
    }
    // look-alikes: صورتِ مسئله با معادله، کارِ کسِ دیگر، گامی وسطِ مسئله
    await wipe(); await fresh();
    const n1 = await turn('معلممون یه سؤال داده: معادلهٔ x² − y² = 15 چند تا جواب صحیح داره؟', 'باشه.', []);
    chk(!ask(n1.user), 'look-alike: a problem statement with an equation is not prior work (no C7) :: ' + tq(n1.user).slice(0, 120));
    await wipe(); await fresh();
    const n2 = await turn('داداشم حساب کرد: ۴۰ میلیون × ۱٫۲ = ۴۸ میلیون اجارهٔ جدید. حالا چی کار کنم؟', 'باشه.', []);
    chk(!ask(n2.user), 'look-alike (C57): another person\'s step is not her prior work :: ' + tq(n2.user).slice(0, 120));
    const o3 = await run('pwB3', 2);
    chk(!ask(o3[2].user), 'look-alike (T12): «خب، طول دو برابرِ عرضه، پس ۳ × عرض = ۱۸ …» mid-problem is not a new prior-work report :: ' + tq(o3[2].user).slice(0, 120));
  });

  await section('A27-21', async () => {   // گزارشِ سوم پس از بستن ⇒ ادغام، نه دفترِ تازه
    const o = await run('pwA1', 16);
    const P13 = o[13].pr, P16 = o[16].pr;
    chk(!!P16 && !!P13 && P16.at === P13.at, 'A27-21 (pwA1 p17 «یه بارِ دیگه، گزارشِ سوم، کلِ اثبات رو تمیز نوشتم …» after closure): the same ledger (not a new one) :: ' + (P13 && P13.at) + ' vs ' + (P16 && P16.at));
    chk(!!P16 && P16.steps.length === 6 && P16.steps.slice(0, 5).every(x => x.verdict === 'ok' && x.fixed) && /گام ۶/.test(P16.steps[5].quote), 'A27-21: steps 1–5 keep their numbers and history; «گام ۶» is merged as step 6 :: ' + (P16 ? P16.steps.map(x => x.n + ':' + x.verdict + ':' + x.quote.slice(0, 20)).join(' / ') : 'none'));
    chk(!!P16 && !P16.steps.some(x => x.n > 6), 'A27-21: restated steps «گام ۱/۲/۳/۵» are not appended again');
  });
  /*SECTIONS*/

  await b.close();
  console.log(JSON.stringify(info));
  if (errors.length) { console.log('FAIL ' + errors.length + '\n' + errors.join('\n')); process.exit(1); }
  console.log('PASS test_tour1_r27_prior');
})();
