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
  // ================= bank — ورودی‌های R4 در tests/variants/VARIANTS_R27.json =================
  await section('bank', async () => {
    const ids = Object.keys(E).filter(i => /^R4\b/.test(E[i].rc)).map(Number);
    const BIKE = 'سلام، برای تمرینِ دوچرخه خودم حساب کردم: هر دور ۱۵۰ ثانیه طول می‌کشه، ۱۲ دور. ۱۵۰ × ۱۲ = ۱۸۰۰ ثانیه = ۱۸ دقیقه. پس با ۱۸ دقیقه گرم‌کردن کلاً ۳۶ دقیقه. درسته؟';
    const BIKEP = [{ step: 'زمانِ دورها', quote: 'هر دور ۱۵۰ ثانیه طول می‌کشه، ۱۲ دور', verdict: 'ok', why: 'داده' },
      { step: 'کلِ زمان', quote: '۱۵۰ × ۱۲ = ۱۸۰۰ ثانیه = ۱۸ دقیقه', verdict: 'ok', why: 'ضرب' },
      { step: 'جمع', quote: 'پس با ۱۸ دقیقه گرم‌کردن کلاً ۳۶ دقیقه', verdict: 'incomplete', why: 'بر گامِ ۲ سوار است', dep: [2] }];
    const bike = async () => { await wipe(); await fresh(); const r = await ppr(BIKE, BIKEP); return r; };
    const P0 = async () => PR();
    const s2 = (pr) => (pr && pr.steps[1]) || {};
    const opening = async (i, text, prior, o) => { await wipe(); await fresh(); const r = await ppr(text, prior, o); return { r, pr: await PR() }; };
    const reN = () => p.evaluate(() => (__cur().msgs || []).filter(m => m.role === 'sys' && /بازسنجی شد ⇒ درست/.test(m.text)).length);
    const okRe = (u) => /بازسنجی شد ⇒ درست/.test(head(u));
    for (const i of ids) {
      const e = E[i], t = e.text.replace(/^.*‖\s*U:\s*/, '').replace(/^U:\s*/, '').trim();
      try {
        if ([151, 152, 155, 156, 157, 171].includes(i)) {
          const first = await (async () => { await wipe(); await fresh(); return turn(t, 'باشه.', []); })();
          const isAsk = ask(first.user), ar = /# حسابِ صفحه روی همین پیام/.test(head(first.user));
          T(i, isAsk && (i !== 155 || ar), { ask: isAsk, arith: ar, q: tq(first.user).slice(0, 120) });
        } else if (i === 153) {
          const f = await (async () => { await wipe(); await fresh(); return turn(t, 'باشه.', []); })();
          T(i, ask(f.user), { ask: ask(f.user), q: tq(f.user).slice(0, 120) });
        } else if (i === 154) {
          const o = await opening(i, t, [{ step: 'سرعتِ متوسط', quote: '(۶۰ + ۹۰) ÷ ۲ = ۷۵', verdict: 'wrong', why: 'برای مسافت‌های برابر میانگینِ هارمونیک است، نه حسابی' }]);
          const x = (o.pr && o.pr.steps[0]) || {};
          T(i, ask(o.r.user) && x.verdict === 'wrong' && !x.pageBad, { ask: ask(o.r.user), v: x.verdict, chk: x.chk });
        } else if ([158, 159, 184].includes(i)) {
          await bike(); const b0 = await P0(); const r = await turn(t, 'باشه.', []); const b1 = await P0();
          T(i, s2(b0).verdict === 'wrong' && s2(b1).verdict === 'wrong' && !s2(b1).re && !s2(b1).fixed && !okRe(r.user) && !/بازسنجیِ حسابِ صفحه \(او به/.test(head(r.user)) && (await reN()) === 0, { v0: s2(b0).verdict, v1: s2(b1).verdict, re: s2(b1).re, fixed: !!s2(b1).fixed, rechk: head(r.user).split('\n').filter(l => /بازسنجی/.test(l)).join('|').slice(0, 200) });
        } else if ([160, 179].includes(i)) {
          await bike(); const r = await turn(t, 'باشه.', []); const b1 = await P0();
          T(i, s2(b1).verdict === 'wrong' && !okRe(r.user) && /بازسنجی|دوباره بسنج|رد می‌کند/.test(head(r.user)), { v1: s2(b1).verdict, ctx: head(r.user).split('\n').filter(l => /بازسنجی|رد می‌کند/.test(l)).join('|').slice(0, 300) });
        } else if (i === 161) {
          await bike(); await turn('نه، من مطمئنم ۱۸۰۰ ثانیه همون ۱۸ دقیقه‌ست', 'باشه.', [csn({ ph: 'e', said: [], prior: [{ n: 2, quote: '۱۵۰ × ۱۲ = ۱۸۰۰ ثانیه = ۱۸ دقیقه', verdict: 'ok', why: 'دوباره سنجیدم' }] })]);
          const r = await turn(t, 'باشه.', []); const b1 = await P0();
          T(i, s2(b1).verdict === 'wrong' && !okRe(r.user) && (await reN()) === 0, { v1: s2(b1).verdict, line: (await p.evaluate((pr) => APP.STORY.priorLines(pr), b1)).join(' | ').slice(0, 300) });
        } else if (i === 165) {
          await bike(); await turn(t, 'باشه.', [csn({ ph: 'e', said: [] })]); const b1 = await P0();
          T(i, s2(b1).verdict === 'ok' && !!s2(b1).fixed && ((b1.steps[2].depStale || []).length > 0 || !!b1.steps[2].stale || b1.steps[2].verdict !== 'ok'), { s2: [s2(b1).verdict, !!s2(b1).fixed], s3: b1 && b1.steps[2] });
        } else if (i === 180) {
          await bike(); await turn(t, 'باشه.', []); const b1 = await P0();
          T(i, s2(b1).verdict === 'wrong' && !s2(b1).fixed, { s2: [s2(b1).verdict, !!s2(b1).fixed] });
        } else if (i === 170) {
          await bike(); await turn('نه، من مطمئنم ۱۸۰۰ ثانیه همون ۱۸ دقیقه‌ست', 'باشه.', []); const r = await turn(t, 'باشه.', []); const b1 = await P0();
          T(i, s2(b1).verdict === 'wrong' && s2(b1).her !== 'no', { s2: [s2(b1).verdict, s2(b1).her], ctx: ctx(r.user).slice(0, 200) });
        } else if (i === 162) {
          const o = await opening(i, 'خودم شروع کردم: معیارها: قیمت، فاصله تا محلِ کار، مدرسهٔ بچه‌ها. حالا کدوم شهر؟', [{ step: 'معیارها', quote: 'معیارها: قیمت، فاصله تا محلِ کار، مدرسهٔ بچه‌ها', verdict: 'incomplete', why: 'نگه‌داریِ پدر و مادر در معیارها نیست' }]);
          const r = await turn(t, 'باشه.', [csn({ ph: 'e', said: [] })]); const pr = await PR(); const x = (pr && pr.steps[0]) || {};
          T(i, (x.her === 'no' || !!x.re) && /رد می‌کند/.test(ctx(r.user) + tq(r.user)), { her: x.her, q: tq(r.user).slice(0, 200), ctx: ctx(r.user).slice(0, 200) });
        } else if (i === 163) {
          const o = await run('pwA1', 13); const pid = o[13].pid; const ph0 = await p.evaluate((id) => APP.livePhase(id), pid);
          await turn(t, 'باشه.', [csn({ ph: 'b', said: [], prior: [{ step: 'قفسه', quote: '۴۸ ÷ ۶ = ۸ قفسه', verdict: 'ok' }] })]);
          const pr = await PR(pid), ph = await p.evaluate((id) => APP.livePhase(id), pid);
          T(i, !!pr && pr.steps.length === 6 && pr.steps[5].verdict === 'ok' && /۴۸ ÷ ۶/.test(pr.steps[5].quote) && pr.steps.slice(0, 5).every(x => x.verdict === 'ok' && x.fixed) && ph === ph0, { ph0, ph, n: pr && pr.steps.length, st: pr && pr.steps.map(x => x.n + ':' + x.verdict + ':' + x.quote.slice(0, 20)) });
        } else if (i === 164) {
          NC(i, 'covered by the runner section A27-21 (pwA1 p17, the third report after closure: same ledger, steps 1–5 keep numbers/history, «گام ۶» merged as 6)'); info.bank[i] = !errors.some(x => /^A27-21/.test(x));
        } else if (i === 172 || i === 174 || i === 176 || i === 177 || i === 178) {
          await wipe(); await fresh(); const r = await turn(t, 'باشه.', []); T(i, !ask(r.user), { q: tq(r.user).slice(0, 120) });
        } else if (i === 175 || i === 185) {
          await wipe(); await fresh(); const r = await turn(t, 'باشه.', []); T(i, !ask(r.user), { q: tq(r.user).slice(0, 120) });
        } else if (i === 173) {
          await wipe(); await fresh(); await bind('کاشی', 'کاشیِ کفِ حمام'); await turn('کفِ حمام رو باید کاشی کنم، چند تا کاشی لازمه؟', 'باشه.', []); const r = await turn(t, 'باشه.', []);
          T(i, !ask(r.user) && /# حسابِ صفحه روی همین پیام/.test(head(r.user)), { ask: ask(r.user) });
        } else if (i === 182) {
          await wipe(); await fresh(); await turn('یه تمرینِ ضرب: ۷ × ۸ = ?', 'باشه.', []); const r = await turn(t, 'باشه.', []); T(i, !ask(r.user), { q: tq(r.user).slice(0, 120) });
        } else if (i === 183) {
          await wipe(); await fresh(); await ppr('خودم حساب کردم: ۱۲ × ۲۰ = ۲۴۰ کتاب؛ ۲۴۰ ÷ ۴۰ = ۶ ردیف؛ پس ۶ ردیف در ۸ قفسه. درسته؟', [{ step: 'کتاب‌ها', quote: '۱۲ × ۲۰ = ۲۴۰ کتاب', verdict: 'ok' }, { step: 'ردیف', quote: '۲۴۰ ÷ ۴۰ = ۶ ردیف', verdict: 'ok' }, { step: 'نتیجه', quote: 'پس ۶ ردیف در ۸ قفسه', verdict: 'ok' }]);
          await turn(t, 'باشه.', []); const pr = await PR(); T(i, !!pr && pr.steps.length === 3, { n: pr && pr.steps.length });
        } else if (i === 181) {
          await wipe(); await fresh(); await turn('مسئله اینه که چند تا مربع تو یه صفحهٔ ۲ در ۲ هست.', 'باشه.', []);
          await turn(t, 'باشه.', [csn({ ph: 'e', said: ['res'], guess: '۸ تا', conf: '' })]);
          const it = await items(); const g = it.filter(x => /guess|حدس/.test(x.k + ' ' + (x.t || '')));
          T(i, !it.some(x => x.k === 'guess' && /۸ تا رو تو ذهنم شمردم/.test(x.t || '')) , { items: it.map(x => x.k + ':' + String(x.t || '').slice(0, 40)) });
        } else if (i === 168) {
          await wipe(); await fresh();
          await ppr('خودم حساب کردم: گامِ ۱: دبی ۱۰ لیتر بر ثانیه. گامِ ۲: توانِ پمپ = ۱۰۰۰ × ۹٫۸ × ۰٫۰۱ × ۱۲ = ۱۲۰۰ وات. گامِ ۳: پس ۴ تا پنلِ ۳۵۰ واتی کافیه. درسته؟',
            [{ step: 'دبی', quote: 'دبی ۱۰ لیتر بر ثانیه', verdict: 'ok' }, { step: 'توان', quote: 'توانِ پمپ = ۱۰۰۰ × ۹٫۸ × ۰٫۰۱ × ۱۲ = ۱۲۰۰ وات', verdict: 'wrong', why: 'حساب نمی‌خواند' },
             { step: 'پنل', quote: 'پس ۴ تا پنلِ ۳۵۰ واتی کافیه', verdict: 'incomplete', why: 'بر ۱۲۰۰ واتِ ناقصِ گامِ ۲ بنا شده و ساعت‌های آفتاب را نشمرده', dep: [2] }]);
          await turn('گامِ ۲ رو درست کردم: ۱۰۰۰ × ۹٫۸ × ۰٫۰۱ × ۱۲ = ۱۱۷۶ وات', 'آفرین.', [csn({ ph: 'e', said: [], prior: [{ n: 2, quote: '۱۰۰۰ × ۹٫۸ × ۰٫۰۱ × ۱۲ = ۱۱۷۶ وات', verdict: 'ok' }] })]);
          const pr = await PR(), q = await PQ();
          T(i, !!pr && pr.steps[1].verdict === 'ok' && pr.resume === 3 && !/۱۲۰۰ واتِ ناقص/.test(q) && /ساعت‌های آفتاب/.test(q) && /۱۲۰۰ واتِ ناقص/.test(pr.steps[2].why), { q, resume: pr && pr.resume, s2: pr && pr.steps[1].verdict });
        } else if (i === 169) {
          await wipe(); await fresh();
          await ppr('خودم حساب کردم: گامِ ۱: ارتفاعِ پمپاژ ۴۰ متره. گامِ ۲: پس پمپِ ۲ کیلوواتی کافیه. درسته؟',
            [{ step: 'ارتفاع', quote: 'ارتفاعِ پمپاژ ۴۰ متره', verdict: 'ok' }, { step: 'پمپ', quote: 'پس پمپِ ۲ کیلوواتی کافیه', verdict: 'incomplete', why: 'افتِ فشارِ لوله هنوز حساب نشده', dep: [1] }]);
          await turn(t, 'خوب.', [csn({ ph: 'e', said: [], prior: [{ step: 'افتِ فشار', quote: 'افتِ فشار رو هم حساب کردم: ۰٫۸ بار', verdict: 'ok' }] })]);
          const pr = await PR(), q = await PQ();
          T(i, !!pr && pr.steps.length === 3 && pr.steps[2].verdict === 'ok' && !/افتِ فشار(?:ِ لوله)? هنوز حساب نشده/.test(q), { q, n: pr && pr.steps.length });
        } else if (i === 166 || i === 167) {   // دورِ ۲۷b: شمارهٔ ۰-مبنای این فایل = بانکِ ۱-مبنای ۱۶۷/۱۶۸ — در tests/test_tour1_r27b_history.js داوری و سبز شد (fixer «history»)
          NC(i, 'judged in tests/test_tour1_r27b_history.js as bank #' + (i + 1) + ' (round 27b, fixer «history»)');
        } else NC(i, 'not exercised');
      } catch (ex) { T(i, false, 'exception ' + String(ex).slice(0, 200)); }
    }
    console.log('bank R4: ' + Object.values(info.bank).filter(Boolean).length + '/' + Object.keys(info.bank).length + ' pass; nc: ' + JSON.stringify(info.nc));
  });
  await section('C74', async () => {   // پرسشِ فرضی که در همان پیام واقعیت می‌شود: واقعیت اصلاح است (C48) و بخشِ فرضی برای مربی
    const r = await p.evaluate(() => { const H = APP.STORY.hypoCut; const a = 'اگه هر دور ۱۰ ثانیه بود چی؟ آهان، اصلاً هر دور ۱۰ ثانیه بوده نه ۱۲.'; const o = H(a); return { len: [a.length, o.length], o }; });
    chk(r.len[0] === r.len[1] && /اصلاً هر دور ۱۰ ثانیه بوده نه ۱۲/.test(r.o) && !/اگه/.test(r.o), 'C74: the hypothetical sentence is set aside, the fact «اصلاً … بوده نه ۱۲» stays for the correction engine; same length (offsets of other readers unchanged) :: ' + JSON.stringify(r));
    const r2 = await p.evaluate(() => APP.STORY.hypoCut('اگه اشتباه نکنم، گامِ ۴ غلطه.'));
    chk(/گامِ ۴ غلطه/.test(r2) && !/اشتباه نکنم/.test(r2), 'C46 look-alike: a hedging conditional keeps its main clause «گامِ ۴ غلطه» :: ' + r2);
  });
  await section('C27-21', async () => {   // pwC1 p2: پرسشِ ازسرگیری پس از اصلاحِ گامِ ۲ هنوز «بر ۱۳۶۰ واتِ ناقصِ گامِ ۲» می‌گفت
    const c = await run('pwC1', 2); const q = await PQ(c[2].pid);
    chk(!!q && c[2].pr && c[2].pr.steps[1].fixed && !/۱۳۶۰ واتِ ناقصِ گامِ ۲/.test(q), 'C27-21 (pwC1 p3): after step 2 was fixed ✓ the resume question no longer says step 3 rests «بر ۱۳۶۰ واتِ ناقصِ گامِ ۲» :: ' + q);
    chk(/۱۳۶۰ واتِ ناقصِ گامِ ۲/.test(c[2].pr.steps[2].why || ''), 'C27-21: the old reason stays in the ledger history (why) :: ' + (c[2].pr.steps[2].why || ''));
  });
  /*SECTIONS*/

  await b.close();
  console.log(JSON.stringify(info));
  if (errors.length) { console.log('FAIL ' + errors.length + '\n' + errors.join('\n')); process.exit(1); }
  console.log('PASS test_tour1_r27_prior');
})();
