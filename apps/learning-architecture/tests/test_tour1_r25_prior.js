// تورِ پولیا (دستهٔ ۱، دورِ ۲۵، سهمِ «prior» — ۲۰۲۶-۱۱-۱۱) — DECISIONS_R25: P1 «قراردادِ دفترِ کارِ پیشین» (نقشهٔ راهِ منبع‌ها §۲۱) + روشن‌سازی‌های C5–C8.
//  runners  جمله‌های خودِ گزارش‌های دورِ ۲۵ — pwA1 (A25-1/3/6/7/10)، pwA2 (A25-2)، pwD1 (D25-1/2/3)، pwB2 (B25·D2/D3)، aA4 (A25-7)، pC2/pA1/s15 (C25-7، A25-4، B25·D13)،
//           pwB1 p5 (B25·D8)، pwC1 p11 (C25-15)، 🧭 (C25-16)، بستنِ مسئلهٔ حل‌شده در گفت‌وگو (D25-7)
//  bank     همهٔ ورودی‌های P1 در بانکِ مستقلِ tests/variants/VARIANTS_R25.json (رفتارِ محضِ مدل یا سهمِ سازوکارِ دیگر با دلیل در info.nc)
//  clock    روزِ صفحه منجمد است (APP.today)؛ هیچ انتظاری به تاریخِ تقویم بسته نیست
// LLA_FILE = ساختِ دیگر (برای «قرمزِ نخست»: ساختِ BASE25)؛ ONLY=pwA1,pwA2,pwD1,pwB2,aA4,mid,recall,retract,proof,page,bank
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));
const BANK = JSON.parse(fs.readFileSync(process.env.LLA_VARIANTS || [path.join(__dirname, 'variants', 'VARIANTS_R25.json'), (() => { try { return path.join(fs.realpathSync(path.join(__dirname, '..', 'src')), '..', 'tests', 'variants', 'VARIANTS_R25.json'); } catch (e) { return ''; } })()].find(f => f && fs.existsSync(f)), 'utf8'));

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
  const own = (i) => /^P1\./.test(E[i].rc);
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
  const CER = 'سلام. می‌خوام بدونم برای کفِ آشپزخونه چند جعبه سرامیک بخرم. ایده‌م اینه که مساحتِ کف رو به مساحتِ یه جعبه تقسیم کنم. گام ۱: کف ۳٫۲ در ۴٫۵ متره، میشه ۱۴٫۴ مترمربع. گام ۲: هر جعبه ۱٫۴۴ مترمربعه، پس ۱۴٫۴ تقسیم بر ۱٫۴۴ میشه ۱۲ جعبه. گام ۳: ده درصد هم پرت می‌ذارم، پس همون ۱۲ جعبه کافیه.';
  const CERP = [{ step: 'مساحت', quote: 'کف ۳٫۲ در ۴٫۵ متره، میشه ۱۴٫۴ مترمربع', verdict: 'ok' }, { step: 'تعدادِ جعبه', quote: 'هر جعبه ۱٫۴۴ مترمربعه، پس ۱۴٫۴ تقسیم بر ۱٫۴۴ میشه ۱۲ جعبه', verdict: 'wrong', why: 'تقسیمِ اعشاری', cause: 'skill', fix: '۱۴٫۴ تقسیم بر ۱٫۴۴ میشه ۱۰ جعبه' }, { step: 'پرت', quote: 'ده درصد هم پرت می‌ذارم، پس همون ۱۲ جعبه کافیه', verdict: 'incomplete', why: 'ده درصدِ پرت به عدد افزوده نشده' }];
  const cer = async () => { await wipe(); await fresh(); return ppr(CER, CERP, { cs: { said: ['u', 'd'] } }); };
  const CONG = 'می‌خوام ثابت کنم برای هر n طبیعی، 2^(3n) − 1 بر ۷ بخش‌پذیره. ایده‌م همنهشتیه. گام ۱: 2^(3n) = (2^3)^n = 8^n. گام ۲: چون 8 ≡ 1 (mod 7)، پس 8^n ≡ n (mod 7). گام ۳: پس 2^(3n) − 1 ≡ 0 (mod 7). به نظرم درسته، نه؟';
  const CONGP = [{ step: 'توان', quote: '2^(3n) = (2^3)^n = 8^n', verdict: 'ok' }, { step: 'همنهشتی', quote: 'چون 8 ≡ 1 (mod 7)، پس 8^n ≡ n (mod 7)', verdict: 'wrong', why: '8^n ≡ 1^n، نه n', cause: 'skill' }, { step: 'نتیجه', quote: 'پس 2^(3n) − 1 ≡ 0 (mod 7)', verdict: 'ok', dep: [2] }];
  const cong = async () => { await wipe(); await fresh(); return ppr(CONG, CONGP, { cs: { said: ['u'], nat: 'objective', guess: { text: 'به نظرم درسته' } } }); };

  // ================= runners — جمله‌های خودِ گزارش‌های دورِ ۲۵ =================
  await section('pwA1', async () => {   // A25-1/3/6/7، C25-12، D25-6
    await wipe(); await fresh();
    const M1 = 'سلام. یه مسئلهٔ المپیادی دارم که خودم تا یه جایی جلو بردمش؛ می‌خوام ببینی کجاش درسته کجاش نه، و کمکم کنی تمومش کنم.\nمسئله: ثابت کنید برای هر عددِ طبیعیِ n، عددِ 2^n عددِ n! را نمی‌شمارد.\nایده‌ام: توانِ ۲ در n! را بشمارم و نشان بدهم از n کمتر است.\nگام ۱: طبقِ فرمولِ لژاندر، توانِ ۲ در n! برابر است با [n/2] + [n/4] + [n/8] + … (تا جایی که 2^k ≤ n؛ [x] یعنی جزءِ صحیح).\nگام ۲: هر جملهٔ [n/2^k] از n/2^k بزرگ‌تر نیست.\nگام ۳: پس توانِ ۲ در n! حداکثر n/2 + n/4 + n/8 + … = n است، یعنی ≤ n.\nگام ۴: ولی چون 2^n عددِ n! را نمی‌شمارد، این توان نمی‌تواند دقیقاً n باشد؛ پس اکیداً کمتر از n است.\nگام ۵: پس 2^n عددِ n! را نمی‌شمارد. ∎\nبرای n = 1 تا 6 هم امتحان کردم، درست بود.';
    const P = [{ step: 'لژاندر', quote: 'توانِ ۲ در n! برابر است با [n/2] + [n/4] + [n/8] + …', verdict: 'ok' }, { step: 'کران', quote: 'هر جملهٔ [n/2^k] از n/2^k بزرگ‌تر نیست', verdict: 'ok' },
      { step: 'جمع', quote: 'پس توانِ ۲ در n! حداکثر n/2 + n/4 + n/8 + … = n است، یعنی ≤ n', verdict: 'incomplete', why: 'جمع متناهی است؛ ≤ بس نیست' }, { step: 'اکید', quote: 'چون 2^n عددِ n! را نمی‌شمارد، این توان نمی‌تواند دقیقاً n باشد', verdict: 'wrong', why: 'همان حکم را فرض کرده (دور)', cause: 'skill' },
      { step: 'حکم', quote: 'پس 2^n عددِ n! را نمی‌شمارد', verdict: 'unchecked', dep: [4] }, { step: 'آزمون', quote: 'برای n = 1 تا 6 هم امتحان کردم، درست بود', verdict: 'ok' }];
    let u = await ppr(M1, P, { cs: { said: ['u'], nat: 'objective' } });
    chk(ask(u.user) && /نقطهٔ ازسرگیری/.test(bold(u.user)) && !/کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی/.test(bold(u.user)) && !/پیشنهادِ این نوبت: «کلِ مسئله/.test(head(u.user)) && !/مرحلهٔ محتمل: فهمِ مسئله/.test(coachHead(u.user)),
      'A25-1 (pwA1 p1 «پرسشِ این نوبت همین است: اول کل …»): the opening prior-work turn question is the resume point :: ' + bold(u.user).slice(0, 300) + ' || ' + coachHead(u.user).slice(0, 200));
    let pr = await PR();
    chk(pr && pr.steps.length === 6 && pr.resume === 3 && pr.steps[5].test && /گامِ ۳/.test(await PQ()), 'pwA1 ledger: 6 steps, resume 3, step 6 a test :: ' + JSON.stringify(st(pr)));
    const ev0 = await evs();
    chk(ev0.some(e => e.ok && e.prior === 1) && ev0.some(e => e.ok && e.prior === 2) && ev0.some(e => !e.ok && e.prior === 4 && e.cause === 'skill'), 'A25-6: prior events credit steps 1–2 and book step 4 with its cause :: ' + JSON.stringify(ev0));
    const md = await mind();
    chk(md.some(t => /^\+گامِ درستِ کارِ پیشینِ خودش/.test(t)) && md.some(t => /^-گامِ کارِ پیشین که درست نبود.*\|skill/.test(t)), 'A25-6 (کارنامه «از کجا؟» هیچ رویدادِ prior ندارد): the mind card lists them :: ' + JSON.stringify(md));
    await setHer(1, 'ok'); await setHer(2, 'ok');
    u = await ppr('چرا گامِ ۴ رو غلط زدی؟ خب واقعاً 2^n عددِ n! رو نمی‌شمارد دیگه، با n=1 تا 6 هم دیدم. به نظرم گامم درسته.', [{ n: 4, quote: 'چون 2^n عددِ n! را نمی‌شمارد، این توان نمی‌تواند دقیقاً n باشد', verdict: 'wrong', why: 'جمله‌ای که می‌خواهی ثابت کنی همان مقدمه شده' }], { cs: { nat: 'objective', guess: { text: 'به نظرم گامم درسته' } } });
    chk(/حکمِ گامِ ۴/.test(bold(u.user)) && /با شاهد دوباره بسنج/.test(bold(u.user)) && !/همین پیام حدس است/.test(head(u.user)) && !/پرسشِ این نوبت همین است: «چطور می‌آزمایی‌اش/.test(head(u.user)) && /با n=1 تا 6 هم دیدم/.test(bold(u.user)),
      'A25-7 (pwA1 p4 «همین پیام حدس است («به نظرم گامم درسته») … درست است/نه نگو»): a dispute gets the re-check instruction, with the reason she gave :: ' + bold(u.user).slice(0, 400));
    pr = await PR();
    chk(pr.steps.length === 6 && pr.steps[0].her === 'ok' && pr.steps[1].her === 'ok' && pr.steps[3].re && pr.steps[3].re.was === 'wrong' && pr.steps[3].re.to === 'wrong' && pr.steps[3].reAt && pr.resume === 3 && /۶ گام/.test(pr.sum),
      'A25-3 (pwA1 p4→p5 «کارِ پیشینِ تو: ۱ گام — ۱ نادرست · ازسرگیری از گامِ ۱»): the one-step re-check MERGES; her ✓ stay; the re-check result is on the ledger :: ' + JSON.stringify(st(pr)) + pr.sum);
    u = await ppr('آها راست میگی، گامِ ۴ دور بود. پس باید خودِ گامِ ۳ رو اکید کنم: چون جمع فقط تا 2^K ≤ n میره، n/2 + n/4 + … + n/2^K = n(1 − 1/2^K) که اکیداً از n کمتره. پس توانِ ۲ در n! از n کمتره و 2^n عددِ n! را نمی‌شمارد. ثابت شد؟', [{ n: 3, quote: 'n/2 + n/4 + … + n/2^K = n(1 − 1/2^K) که اکیداً از n کمتره', verdict: 'ok' }], { cs: { nat: 'objective' } });
    pr = await PR();
    chk(pr.steps.length === 6 && pr.steps[2].verdict === 'ok' && pr.steps[2].fixed && pr.steps[2].fixed.by === 'her' && pr.resume === 4 && pr.steps[3].her === 'ok' && !/گامِ ۱ /.test(await PQ()),
      'A25-3/C25-14 (pwA1 p5 «گامِ ۱ (چون 2^n …) … کجایش می‌لنگد؟» در نوبتی که گامِ ۳ را اکید کرد): her own strict step lands on step 3 and the resume point moves :: ' + JSON.stringify(st(pr)) + (await PQ()));
  });

  await section('pwA2', async () => {   // A25-2
    await wipe(); await fresh();
    const M = 'سلام من آرمانم هشت سالمه. معلممون این سؤالو داده: یه کتاب ۴۸ صفحه داره. روز اول ۱۲ صفحه خوندم، روز دوم دو برابر روز اول خوندم. چند صفحه مونده؟ اگه از روز سوم روزی ۵ صفحه بخونم چند روز دیگه کتاب تموم میشه؟\nمن این جوری حل کردم:\nروز دوم: ۱۲ × ۲ = ۲۴\nدو روز با هم: ۱۲ + ۲۴ = ۳۴\nمونده: ۴۸ − ۳۴ = ۱۴\nروزی ۵ تا: ۱۴ تقسیم بر ۵ میشه ۲ و یه چیزی. پس ۲ روز.\nدرسته؟';
    let u = await ppr(M, [{ step: 'روز دوم', quote: '۱۲ × ۲ = ۲۴', verdict: 'ok' }, { step: 'دو روز', quote: '۱۲ + ۲۴ = ۳۴', verdict: 'ok' }, { step: 'مونده', quote: '۴۸ − ۳۴ = ۱۴', verdict: 'ok' }, { step: 'روزها', quote: '۱۴ تقسیم بر ۵ میشه ۲ و یه چیزی. پس ۲ روز', verdict: 'incomplete', why: 'باقی‌مانده هم یک روز می‌خواهد' }], { cs: { nat: 'objective', said: ['d'], guess: { text: 'درسته؟' } } });
    chk(/نقطهٔ ازسرگیری/.test(bold(u.user)) && !/همین پیام حدس است/.test(head(u.user)), 'A25-1 (pwA2 p1 «همین پیام حدس است … چطور می‌آزمایی‌اش؟»): resume point, not the guess test :: ' + bold(u.user).slice(0, 200));
    let pr = await PR();
    chk(pr && pr.steps[1].verdict === 'wrong' && pr.steps[2].depWrong.indexOf(2) >= 0 && pr.resume === 2, 'pwA2: page finds 12+24≠34; step 3 depends :: ' + JSON.stringify(st(pr)));
    u = await turn('اِ! ۱۲ و ۲۴ میشه ۳۶. پس مونده ۴۸ − ۳۶ = ۱۲.', 'آفرین.', [csn({ ph: 'e', said: ['result'], nat: 'objective', step: { quote: '۱۲ و ۲۴ میشه ۳۶', done: 'yes' }, result: '۴۸ − ۳۶ = ۱۲' })]);
    pr = await PR(); const q = await PQ();
    chk(pr.steps.length === 4 && pr.steps[1].verdict === 'ok' && pr.steps[1].fixed && pr.steps[2].fixed && /۳۶/.test(pr.steps[2].fixed.t) && pr.resume === 4 && pr.steps[3].depStale.indexOf(3) >= 0 && /گامِ ۴/.test(q) && !/گامِ ۲/.test(q),
      'A25-2 (pwA2 p2 پرسشِ ازسرگیری «گامِ ۲ …» در نوبتی که ۱۲+۲۴=۳۶ را درست کرد): steps 2 and 3 fixed from her own message, resume = step 4 (still on the old 14) :: ' + JSON.stringify(st(pr)) + q);
  });

  await section('pwD1', async () => {   // D25-1/2/3، C5
    await wipe(); await fresh();
    const M = 'سلام. یه مسئلهٔ واقعی دارم که خودم تا یه جایی جلو بردمش؛ می‌خوام ببینی کجاش درسته و کجاش نه، و بعد با هم ادامه بدیم. ۹۰ روزِ دیگه امتحانِ آلمانیِ B1 دارم و برای قبولی باید حدودِ ۳۰۰۰ واژه بلد باشم. تنها وقتِ آزادم رفت‌وآمد با متروئه: روزی ۴۰ دقیقه. ایده‌م اینه که فقط با فلش‌کارت (Anki) توی همون ۴۰ دقیقه کار کنم.\nگامِ ۱: ۳۰۰۰ تقسیم بر ۹۰ میشه ۳۳٫۳، پس روزی ۳۴ واژهٔ تازه.\nگامِ ۲: برای یاد گرفتنِ هر کارتِ تازه حدودِ ۳۵ ثانیه وقت می‌ذارم؛ ۳۴ ضربدر ۳۵ میشه ۱۱۹۰ ثانیه، یعنی حدودِ ۲۰ دقیقه.\nگامِ ۳: هر کارت تا امتحان حدودِ ۵ بار مرور میشه، پس روزی ۳۴ ضربدر ۵ میشه ۱۷۰ مرور.\nگامِ ۴: هر مرور ۱۰ ثانیه طول می‌کشه؛ ۱۷۰ ضربدر ۱۰ میشه ۱۷۰۰ ثانیه یعنی ۱۷ دقیقه.\nگامِ ۵: پس کلِ کارِ هر روز ۲۰ به‌علاوهٔ ۱۷ میشه ۳۷ دقیقه، که توی ۴۰ دقیقهٔ مترو جا میشه. پس برنامه‌م شدنیه.\nفقط یه جاش رو مطمئن نیستم: روزهای آخر چی میشه؟';
    await ppr(M, [{ step: 'تازه‌ها', quote: '۳۰۰۰ تقسیم بر ۹۰ میشه ۳۳٫۳، پس روزی ۳۴ واژهٔ تازه', verdict: 'ok' }, { step: 'زمانِ تازه', quote: '۳۴ ضربدر ۳۵ میشه ۱۱۹۰ ثانیه، یعنی حدودِ ۲۰ دقیقه', verdict: 'ok' }, { step: 'مرورها', quote: 'هر کارت تا امتحان حدودِ ۵ بار مرور میشه، پس روزی ۳۴ ضربدر ۵ میشه ۱۷۰ مرور', verdict: 'incomplete', why: 'کارت‌های فراموش‌شده دوباره می‌آیند' },
      { step: 'زمانِ مرور', quote: '۱۷۰ ضربدر ۱۰ میشه ۱۷۰۰ ثانیه یعنی ۱۷ دقیقه', verdict: 'ok' }, { step: 'جمع', quote: 'پس کلِ کارِ هر روز ۲۰ به‌علاوهٔ ۱۷ میشه ۳۷ دقیقه', verdict: 'ok' }], { cs: { nat: 'practical', said: ['u', 'd'] } });
    let pr = await PR();
    chk(pr && pr.steps[3].verdict === 'wrong' && pr.steps[4].depWrong.indexOf(4) >= 0 && pr.resume === 3, 'pwD1: page finds 1700 s ≠ 17 min; step 5 depends :: ' + JSON.stringify(st(pr)));
    const sid = await p.evaluate(() => __cur().id);
    const D0 = await p.evaluate((sid) => (APP.dossierSess ? APP.dossierSess(sid).events : []).map(e => (e.lines || []).join(' ')).join('\n'), sid);
    const hk = await p.evaluate(() => { const s = __cur(); return (APP.ASSIST.promptHooks || []).map(f => { try { return f(s, 'خب.') || ''; } catch (e) { return ''; } }).join('\n'); });
    chk(/کارِ پیشینِ تو/.test(D0) && !/لو نده/.test(D0) && !/۲۸٫۳۳۳|28\.333/.test(D0) && /لو نده/.test(hk),
      'D25-3 (📜 «(واحد: تبدیلِ ثانیه به دقیقه — با تبدیل ۲۸٫۳۳۳ می‌شود، نه ۱۷ (عددِ درست را لو نده))»): the coach-facing line is in the prompt only :: ' + D0.slice(0, 500));
    const u = await turn('نه، گامِ ۳ رو قبول ندارم، چون Anki خودش زمان‌بندی می‌کنه و اگه کارتی رو فراموش کنم فقط یه بار بیشتر نشونش میده؛ اثرش ناچیزه. ولی گامِ ۴ رو قبول دارم، اشتباه زدم: ۱۷۰۰ ثانیه حدودِ ۲۸ دقیقه‌ست، نه ۱۷. کلش در یک جمله: می‌خوام بدونم با روزی ۴۰ دقیقه Anki توی مترو، تا ۹۰ روزِ دیگه ۳۰۰۰ واژه رو می‌تونم بلد بشم یا نه.', 'گامِ ۳ را دوباره می‌سنجم.', [csn({ ph: 'e', said: ['u'], nat: 'practical' })]);
    pr = await PR();
    chk(pr.steps[2].her === 'no' && /Anki خودش زمان‌بندی/.test(pr.steps[2].herWhy || '') && pr.steps[3].her === 'ok' && pr.steps[3].verdict === 'ok' && pr.steps[3].fixed && /۲۸ دقیقه/.test(pr.steps[3].fixed.t) && /۱۷ دقیقه/.test(pr.steps[3].fixed.was),
      'D25-1/D25-2 (pwD1 p2 «هر دو گام رد کردی»؛ «از آن بخشِ پیامت چیزی در صفحه ثبت نشده بود»): step 3 disputed with her reason, step 4 accepted and fixed from her own «۲۸ … نه ۱۷» :: ' + JSON.stringify(st(pr)) + JSON.stringify(pr.steps[3].fixed));
    chk(pr.steps[4].depStale.indexOf(4) >= 0 && !pr.steps[4].depWrong.length, 'D25-2: step 5 (20 + 17) is now on the old number of the fixed step 4 :: ' + JSON.stringify(st(pr)));
    chk(/حکمِ گامِ ۳/.test(bold(u.user)) && !/حکمِ گامِ ۴/.test(bold(u.user)), 'D25-1: the turn re-checks step 3 only :: ' + bold(u.user).slice(0, 200));
    await setHer(2, 'no');
    await turn('تو صفحهٔ 🔭 دیدم کنارِ گامِ ۲ هم نوشته «رد کردی» — اشتباهی زدم، گامِ ۲ رو قبول دارم.', 'درست شد.', [csn({ ph: 'e', said: [], nat: 'practical' })]);
    pr = await PR();
    chk(pr.steps[1].her === 'ok' && (pr.steps[1].herHist || []).some(e => e.her === 'no' && e.undoAt) && !/گامِ ۲/.test(await PQ()), 'C5 (B_s D2 «اشتباهی زدم»، پنج نوبت «حکمِ گامِ ۶ را رد کردی»): the «نه» is withdrawn with history :: ' + JSON.stringify(pr.steps[1]));
  });

  await section('pwB2', async () => {   // B25·D2/D3
    await wipe(); await fresh();
    const M = 'سلام. یه تصمیمِ بزرگ دارم و خودم تا یه جایی جلو رفتم، می‌خوام ببینی درست رفتم یا نه. یه پیشنهادِ کار تو شیراز دارم که حقوقش ۴۰٪ بیشتره.\nکاری که کردم:\n۱. معیارها رو نوشتم: حقوق، هزینه‌ی مسکن، مدرسه‌ی بچه‌ها، رفت‌وآمد.\n۲. وزن دادم: حقوق ۴۰٪، مسکن ۳۰٪، مدرسه ۲۵٪، رفت‌وآمد ۱۵٪.\n۵. پس شیراز، با اختلافِ زیاد. تا آخرِ ماه باید جواب بدم. درسته؟';
    let u = await ppr(M, [{ step: 'معیارها', quote: 'معیارها رو نوشتم: حقوق، هزینه‌ی مسکن، مدرسه‌ی بچه‌ها، رفت‌وآمد', verdict: 'incomplete', why: 'معیارِ مهمی جا افتاده: مراقبت از مادر' }, { step: 'وزن‌ها', quote: 'وزن دادم: حقوق ۴۰٪، مسکن ۳۰٪، مدرسه ۲۵٪، رفت‌وآمد ۱۵٪', verdict: 'wrong', why: 'جمعِ وزن‌ها ۱۱۰٪ است' }], { cs: { nat: 'life', said: ['d'], guess: { text: 'درسته؟' } } });
    chk(/نقطهٔ ازسرگیری/.test(bold(u.user)) && !/همین پیام حدس است/.test(head(u.user)), 'B25·D2 (pwB2 p1 «همین پیام حدس است، نه نتیجه»): resume point :: ' + bold(u.user).slice(0, 160));
    u = await turn('مادرم معیار نیست، اون یه موضوعِ جداست؛ تصمیمِ کاری رو با عدد می‌گیرم. چرا میگی معیارِ جاافتاده‌ست؟', 'دوباره می‌سنجم.', [csn({ ph: 'e', said: [], nat: 'life', prior: [{ n: 1, quote: 'معیارها رو نوشتم: حقوق، هزینه‌ی مسکن، مدرسه‌ی بچه‌ها، رفت‌وآمد', verdict: 'incomplete', why: 'اگر بروی، سر زدنِ هفتگی به مادر عوض می‌شود — این پیامدِ همین تصمیم است' }] })]);
    const pr = await PR();
    chk(/حکمِ گامِ ۱/.test(bold(u.user)) && !/پیشنهادِ این نوبت: «خودت فکر می‌کنی چرا/.test(head(u.user)) && pr.steps[0].re && pr.steps[0].re.by === 'coach' && /سر زدنِ هفتگی/.test(pr.steps[0].re.why) && pr.steps.length === 2,
      'B25·D3 (pwB2 p2 «مادرم معیار نیست … چرا میگی…؟» ⇒ «خودت فکر می‌کنی چرا؟»؛ not registered): read as a dispute of step 1, re-checked, result on the ledger :: ' + bold(u.user).slice(0, 200) + JSON.stringify(st(pr)));
    const pg = await p.evaluate(() => APP.STORY.priorLines(APP.STORY.priorFor(__cur(), '')).join('\n'));
    chk(/دوباره سنجیده شد \(مربی\): حکم ماند — اگر بروی/.test(pg), 'A25-7: the re-check result is shown («دوباره سنجیده شد … حکم ماند — شاهد») :: ' + pg.slice(0, 400));
  });

  await section('aA4', async () => {   // A25-7(2)
    await wipe(); await fresh();
    const pid = await bind('پرده', 'پنجره ۱۸۰ سانت عرض دارد؛ توپِ پارچه ۱۴۰ سانت. چند متر پارچه بخرم؟');
    await ppr('حساب: عرضِ لازم با چین ۱۸۰ ضربدر ۲ می‌شود ۳۶۰ سانت. طولِ هر قواره ۱۵۰ + ۱۰ + ۲۰ + ۱۵ = ۱۹۵ سانت. پس ۲٫۵۷ قواره می‌خرم.', [{ step: 'عرض', quote: '۱۸۰ ضربدر ۲ می‌شود ۳۶۰ سانت', verdict: 'ok' }, { step: 'قواره', quote: 'پس ۲٫۵۷ قواره می‌خرم', verdict: 'incomplete', why: 'قواره کسری ندارد' }], { cs: { nat: 'practical', register: 'شما' } });
    let pr = await PR(pid);
    chk(pr && pr.steps.length === 2 && pr.resume === 2, 'aA4 ledger :: ' + JSON.stringify(st(pr)));
    const u = await turn('نه، بس نیست! قواره را که نمی‌شود تکه‌تکه دوخت؛ هر قواره یک عرضِ کاملِ پارچه است.', 'بله.', [csn({ ph: 'e', said: [], nat: 'practical', register: 'شما' })]);
    pr = await PR(pid); const q = await lcq(pid, 'خب');
    chk(!pr.steps.some(x => x.her === 'no') && !/را رد می‌کند/.test(head(u.user)) && !/رد کردی|رد کردید/.test(q.q), 'A25-7 (aA4 p7–p10 «حکمِ گامِ ۲ … را رد کردید — به چه دلیل درست است؟» چهار نوبت): «نه، بس نیست!» is not a dispute :: ' + JSON.stringify(st(pr)) + q.q);
  });

  await section('mid', async () => {   // A25-4/5، C25-7/9، D25-24، B25·D13
    await wipe(); await fresh();
    await turn('سلام. ۳۰۰ میلیون تومن پس‌انداز دارم؛ می‌خوام بدونم تا کی دووم میاره.', 'کلش؟', [csn({ ph: 'u', said: ['d'] })]);
    let u = await turn('۲۵۰ میلیون ضربدر ۲۳ درصد میشه ۵۷.۵ میلیون در سال، تقسیم بر ۱۲ میشه حدود ۴.۸ میلیون در ماه. پس از ۳ میلیون کسری بیشتره.', 'خوب.', [csn({ ph: 'e', said: ['result'], prior: [{ step: 'سود', quote: '۲۵۰ میلیون ضربدر ۲۳ درصد میشه ۵۷.۵ میلیون در سال', verdict: 'ok' }] })]);
    chk(!ask(u.user) && !/# کارِ پیشینِ تو/.test(head(u.user)) && !(await PR()), 'D25-24/A25-5 (سطرِ «# کارِ پیشینِ تو … گزارش کن prior» در نوبت‌های عادیِ میانهٔ حل): no request, and an unasked report makes no ledger :: ' + JSON.stringify(st(await PR())));
    u = await turn('مثلاً دیروز مسئله‌ی دو مثلث بود، گفتم: «خب بچه‌ها، اینجا باید از تشابه استفاده کنیم، نه؟» همه گفتن «بله خانم» و بعد باز ساکت شدن. بعد خودم حل کردم.', 'خوب.', [csn({ ph: 'u', said: [] })]);
    chk(!ask(u.user), 'B25·D13 (s15 p2 classroom anecdote): no request');
    await wipe(); await fresh();
    u = await turn('سلام. یه بخاری برقی ۲۰۰۰ واتی دارم که روزی ۳ ساعت روشنه. برق هم کیلوواتی ۱۵۰۰ تومنه. می‌خوام بدونم ماهی چقدر برام آب می‌خوره. حساب کردم: ۲۰۰۰ × ۳ × ۳۰ × ۱۵۰۰ شد ۲۷۰ میلیون تومن! امکان نداره، کلِ قبضم ماهی ۴۰۰ هزار تومنه. کجاشو اشتباه کردم؟', 'خوب.', [csn({ ph: 'u', said: ['d'] })]);
    chk(ask(u.user), 'C25-7 (pC2 p1 «حساب کردم: ۲۰۰۰ × ۳ × ۳۰ × ۱۵۰۰ شد ۲۷۰ میلیون»): an opening with one computed step fires :: ' + head(u.user).slice(0, 100));
    await wipe(); await fresh();
    u = await ppr('سلام. معلممون یه سؤال داده: ثابت کنید برای هر عددِ اولِ p بزرگ‌تر از ۳، عددِ p^2 − 1 بر ۲۴ بخش‌پذیره. امتحان کردم: p=5 ⇒ ۲۴، p=7 ⇒ ۴۸، p=11 ⇒ ۱۲۰. همه‌ش درمیاد ولی نمی‌دونم چطور ثابتش کنم.', [{ step: 'p=5', quote: 'p=5 ⇒ ۲۴', verdict: 'ok' }, { step: 'p=7', quote: 'p=7 ⇒ ۴۸', verdict: 'ok' }], { cs: { nat: 'objective', said: ['u'] } });
    chk(!(await PR()) && !ask(u.user) && !(await PQ()), 'A25-4 (pA1 p2–p9 «همهٔ گام‌های پیشینت درست درآمد — گامِ بعدیِ شما چیست …؟»): tested cases are not a ledger :: ' + JSON.stringify(st(await PR())));
  });

  await section('recall', async () => {   // B25·D8
    await cer();
    await turn('گامِ ۲ رو دوباره رفتم: ۱۴٫۴ تقسیم بر ۱٫۴۴ میشه ۱۰ جعبه. یه چیزی هم یادم رفته بود: اصطکاکِ لوله؛ لوله ۳۰ متره، فعلاً ۲۰٪ اضافه می‌گیرم.', 'خوب.', [csn({ ph: 'e', said: ['result'], result: '۱۴٫۴ تقسیم بر ۱٫۴۴ میشه ۱۰ جعبه' })]);
    const pr = await PR(), it = await items();
    chk(pr.steps[1].fixed && pr.steps[1].verdict === 'ok' && it.some(x => x.k === 'res'), 'B25·D8 (pwB1 p5 «… یه چیزی هم یادم رفته بود: اصطکاکِ لوله …» ⇒ the turn dropped): the turn\'s story is kept :: ' + JSON.stringify(st(pr)) + it.map(x => x.k));
  });

  await section('retract', async () => {   // C25-15
    await wipe(); await fresh();
    const M = 'سلام. یه ایده دارم و یه بخشش رو خودم جلو بردم؛ می‌خوام ببینی تا کجا درسته.\nگام ۱ — نیاز آبی: باغ ۲ هکتاره و نیاز روزانهٔ درخت‌ها تو تابستون حدود ۵ میلی‌متره. پس ۲۰۰۰۰ متر مربع × ۰٫۰۰۵ متر = ۱۰۰ متر مکعب در روز.\nگام ۲ — توانِ پمپ: آب از عمقِ ۴۰ متری میاد و می‌خوام ۱۰۰ متر مکعب رو تو ۸ ساعت پمپ کنم، یعنی دبی ۱۲٫۵ متر مکعب در ساعت.\nگام ۳ — پنل: پس ۴ تا پنلِ ۳۵۰ واتی کافیه.';
    await ppr(M, [{ step: 'نیاز آبی', quote: 'باغ ۲ هکتاره و نیاز روزانهٔ درخت‌ها تو تابستون حدود ۵ میلی‌متره. پس ۲۰۰۰۰ متر مربع × ۰٫۰۰۵ متر = ۱۰۰ متر مکعب در روز', verdict: 'ok' }, { step: 'دبی', quote: 'می‌خوام ۱۰۰ متر مکعب رو تو ۸ ساعت پمپ کنم، یعنی دبی ۱۲٫۵ متر مکعب در ساعت', verdict: 'ok' }, { step: 'پنل', quote: 'پس ۴ تا پنلِ ۳۵۰ واتی کافیه', verdict: 'incomplete', why: 'راندمان نیامده' }], { cs: { nat: 'practical', said: ['d'] } });
    await turn('خب.', 'باشه.', [csn({ ph: 'e', said: [] })]);
    await turn('یه اصلاح: روزِ اول گفتم باغ ۲ هکتاره — اشتباه گفتم، ۲٫۵ هکتاره.', 'اصلاح شد.', [csn({ ph: 'e', said: ['d'], retract: { msg: 'باغ ۲ هکتاره', key: 'datum:مساحت باغ', what: 'fact', fix: '۲٫۵ هکتاره', rests: [] } })]);
    const pr = await PR(), q = await PQ();
    chk(pr.steps[0].stale && /۲٫۵/.test(pr.steps[0].stale.fix) && pr.steps[1].depStale.indexOf(1) >= 0 && pr.resume === 1 && /۲٫۵ هکتار/.test(q) && /باید دوباره حساب شود/.test(pr.sum),
      'C25-15 (pwC1 p11→p12: گامِ ۱ ِ دفتر «✓ … ۱۰۰ م³» می‌ماند): the ledger step and its dependant go stale and the resume point returns to step 1 :: ' + JSON.stringify(st(pr)) + q);
    await turn('راستی جلسه با پیمانکار ساعت ۱۰ نیست، ساعت ۱۱ است.', 'باشه.', [csn({ ph: 'e', said: [], retract: { msg: 'ساعت ۱۰', what: 'fact', fix: 'ساعت ۱۱', rests: [] } })]);
    const pr2 = await PR();
    T(42, JSON.stringify(st(pr2)) === JSON.stringify(st(pr)), st(pr2));
    NC(42, 'the appointment datum itself and the chat result chain are the correction engine (P4, fixer «correction»); here: the ledger takes no stale mark — asserted');
    T(20, !!pr.steps[0].stale && pr.steps[1].depStale.length > 0, st(pr));
    NC(20, 'parts (a) the chat statement and (c) the chat result chain are the correction engine (P4, fixer «correction»); part (b) the ledger — asserted on the runners\' own sentence («۲ ⇐ ۲٫۵ هکتار», same shape as «۴۰۰ ⇐ ۴۵۰ متر»)');
  });

  await section('proof', async () => {   // A25-10
    await wipe(); await fresh();
    await turn('ثابت کنید توانِ ۲ در n! از n کمتر است.', 'خوب.', [csn({ ph: 'u', said: ['u'], nat: 'objective' })]);
    let u = await turn('از راهِ دیگه: حدس می‌زنم توانِ ۲ در n! دقیقاً برابرِ n منهای تعدادِ یک‌های n در مبنای ۲ باشه. برای n=6: ۶ = 110 دو تا یک، ۶ − ۲ = ۴، و 6! = 720 = 16 × 45، پس توان ۴ ✓. برای n=5: 101 دو تا یک، ۳؛ و 5! = 120 = 8 × 15 ✓.', 'خوب.', [csn({ ph: 'p', said: [], nat: 'objective', guess: { text: 'توانِ ۲ در n! دقیقاً برابرِ n منهای تعدادِ یک‌های n در مبنای ۲' } })]);
    chk(!/پرسشِ این نوبت همین است: «چطور می‌آزمایی‌اش/.test(head(u.user)), 'A25-10 (pwA1 p9 حدس + آزمونِ خودش ⇒ «چطور می‌آزمایی‌اش؟»): a guess she already tested is not asked how to test :: ' + bold(u.user).slice(0, 200) + sugOf(u.user));
    u = await turn('سلام، برگشتم. n=8 رو امتحان کردم: 8 = 1000 یه یک داره، پس حدسم میگه ۷. 8! = 40320 = 128 × 315 و 128 = 2^7، پس توان ۷ ✓. فکر کنم اثباتشم پیدا کردم: اگه n = a_0 + 2a_1 + 4a_2 + … (رقم‌های دودویی)، اون‌وقت [n/2^k] = a_k + 2a_{k+1} + …؛ جمعِ همه‌ی k ها میشه Σ a_i(2^i − 1) = n − (تعدادِ یک‌ها). پس حدسم درسته.', 'خوب.', [csn({ ph: 'e', said: ['result'], nat: 'objective' })]);
    chk(!/همین پیام حدس است/.test(head(u.user)) && /برهانت را خودت(?:ان)? وارسی می‌کن/.test(bold(u.user)), 'A25-10 (pwA1 p10 «n=8 رو امتحان کردم … اثباتشم پیدا کردم … پس حدسم درسته» ⇒ «همین پیام حدس است»): test + proof ⇒ the proof-check question :: ' + bold(u.user).slice(0, 300));
  });

  // ================= page — 🔭 / 🧭 / 📜 / کارنامه / بستن (C25-16، D25-7، A25-20، B25·D6) =================
  await section('page', async () => {
    await wipe(); await fresh();
    let pid = await bind('لولهٔ آب', 'می‌خوام بدونم لولهٔ ۴۵ میلی‌متری برای این دبی کافیه یا نه.');
    await ppr('گام ۱: قطرِ لوله ۴۵ میلی‌متر = ۰٫۴۵ متر. گام ۲: شعاع نصفِ قطره. گام ۳: مساحت رو با پی حساب کردم. گام ۴: دبی رو با سرعت ضرب کردم.',
      [{ step: 'تبدیل', quote: '۴۵ میلی‌متر = ۰٫۴۵ متر', verdict: 'ok' }, { step: 'شعاع', quote: 'شعاع نصفِ قطره', verdict: 'ok' }, { step: 'مساحت', quote: 'مساحت رو با پی حساب کردم', verdict: 'ok' }, { step: 'دبی', quote: 'دبی رو با سرعت ضرب کردم', verdict: 'unchecked' }], { cs: { nat: 'practical' } });
    let pr = await PR(pid);
    chk(pr && pr.steps.length === 4 && pr.steps[0].verdict === 'wrong' && pr.steps[0].pageBad, 'page ledger: the unit slip is page-detected :: ' + JSON.stringify(st(pr)));
    const M = await Mo(pid), D = await p.evaluate((pid) => APP.dossier(pid).events.map(e => e.k + '|' + (e.lines || []).join(' ')).join('\n'), pid);
    const form = await p.evaluate((pid) => { APP.go('lprob', pid); const s = document.querySelector('#main .lp-prior'); return s ? s.textContent : ''; }, pid);
    const tip = M.pts.map(q => q.t + ' ' + (q.lines || []).join(' ')).join('\n');
    const leak = (t) => /لو نده/.test(t) || /۰٫۰۴۵|0\.045/.test(t) || /حسابِ صفحه:/.test(t);
    const hk = await p.evaluate(() => { const s = __cur(); return (APP.ASSIST.promptHooks || []).map(f => { try { return f(s, 'خب.') || ''; } catch (e) { return ''; } }).join('\n'); });
    T(16, form && !leak(form) && !leak(D) && !leak(tip) && /واحد/.test(form), { form: form.slice(0, 300), D: D.slice(0, 300), tip: tip.slice(0, 300) });
    NC(16, 'the printed/downloaded dossier is rendered from the same EVLOG lines as 📜 (asserted on the dossier events)');
    T(39, /لو نده/.test(hk), hk.slice(0, 300));
    const mainP = M.pts.filter(q => q.k === 'cprior' && q.cls === 'main');
    T(21, mainP.length === 4 && /گام از ۴ گامِ کارِ پیشینت/.test(M.remain) && !/طرح هنوز نیست/.test(M.remain), { n: mainP.length, remain: M.remain });
    chk(mainP.length === 4 && !/طرح هنوز نیست/.test(M.remain), 'C25-16 (pwC1 🧭 «مانده: نامعلوم — طرح هنوز نیست» با چهار گامِ شماره‌دار): the main line is built from the prior steps :: ' + M.remain);
    // #4 merge on 🔭: her ✓ on step 2 stays; only step 1 is re-judged
    await p.evaluate((pid) => { APP.go('lprob', pid); const b = document.querySelector('#main .lp-prior-step[data-n="2"] .lp-prior-ok'); if (b) b.click(); }, pid);
    await ppr('خب.', [{ n: 1, quote: '۴۵ میلی‌متر = ۰٫۴۵ متر', verdict: 'wrong', why: 'هزار میلی‌متر یک متر است' }], { cs: { nat: 'practical' } });
    pr = await PR(pid);
    const form2 = await p.evaluate((pid) => { APP.go('lprob', pid); const s = document.querySelector('#main .lp-prior'); return s ? { t: s.textContent, n: s.querySelectorAll('.lp-prior-step').length, undo: s.querySelectorAll('.lp-prior-undo').length } : null; }, pid);
    T(4, pr.steps.length === 4 && pr.steps[1].her === 'ok' && pr.steps[0].verdict === 'wrong' && /۴ گام/.test(pr.sum) && form2 && form2.n === 4 && form2.undo >= 1 && /کارِ پیشینِ تو: ۴ گام/.test(hk), { st: st(pr), sum: pr.sum, form2: form2 && form2.n });
    // #5 a waiting step stays
    await p.evaluate((pid) => { const pg = APP.S.get('eprog_' + pid); const X = pg.solve.live.pre22 = pg.solve.live.pre22 || { st: [], n: 0 }; X.sys = (X.sys || []).concat([{ id: 'sw25', state: 'wait', step: 'گامِ ۴: دبی رو با سرعت ضرب کردم', number: 101, at: APP.nowISO() }]); APP.S.put(pg); }, pid);
    await ppr('خب، ادامه.', [{ n: 2, quote: 'شعاع نصفِ قطره', verdict: 'ok' }, { n: 3, quote: 'مساحت رو با پی حساب کردم', verdict: 'ok', why: 'πr²' }], { cs: { nat: 'practical' } });
    pr = await PR(pid);
    const hk5 = await p.evaluate(() => { const s = __cur(); return (APP.ASSIST.promptHooks || []).map(f => { try { return f(s, 'خب.') || ''; } catch (e) { return ''; } }).join('\n'); });
    T(5, pr.steps.length === 4 && /گامِ ۴ · [^\n]*⏸ منتظرِ برگهٔ #۱۰۱/.test(hk5) && /۴ گام/.test(pr.sum) && pr.resume === 1 && !/همه درست/.test(pr.sum), { st: st(pr), sum: pr.sum });
    NC(5, 'the bank\'s ledger has 5 steps; asserted on a 4-step ledger with the same shape (a waiting step + a later partial report): the row count stays, the waiting step is named «⏸ منتظرِ برگهٔ #۱۰۱» and is skipped by the resume point');
    // #22 / #44 / D25-7: solved in chat ⇒ closing never re-asks what she gave
    await wipe(); await fresh();
    pid = await bind('واژه‌های آلمانی', '۹۰ روزِ دیگه امتحانِ آلمانیِ B1 دارم و باید ۳۰۰۰ واژه بلد باشم؛ روزی ۴۰ دقیقه وقت دارم.');
    await turn('کلش در یک جمله: می‌خوام بدونم با روزی ۴۰ دقیقه Anki توی مترو، تا ۹۰ روزِ دیگه ۳۰۰۰ واژه رو می‌تونم بلد بشم یا نه.', 'خوب.', [csn({ ph: 'u', said: ['u'], nat: 'practical' })]);
    await turn('۳۰۰۰ تقسیم بر ۸۰ میشه ۳۷٫۵، یعنی روزی ۳۸ تازه. کل: ۲۲ به‌علاوهٔ ۳۳ میشه ۵۵ دقیقه؛ پس ۴۰ دقیقه مترو به‌علاوهٔ ۱۵ دقیقهٔ شب. جوابش شد روزی ۵۵ دقیقه. به نظرم این دیگه حل شد.', 'خوب.', [csn({ ph: 'e', said: ['result'], nat: 'practical', result: 'جوابش شد روزی ۵۵ دقیقه' })]);
    const before = await p.evaluate((pid) => { APP.go('lprob', pid); return { ph: APP.livePhase(pid), card: !!document.querySelector('#main .lp-chatsolved-ok'), bad: [...document.querySelectorAll('#main .lp-hardmiss, #main .lp-onemiss')].map(x => x.textContent).join(' ') }; }, pid);
    const hk22 = await p.evaluate(() => { const s = __cur(); return (APP.ASSIST.promptHooks || []).map(f => { try { return f(s, 'خب.') || ''; } catch (e) { return ''; } }).join('\n'); });
    await p.evaluate(() => { const b = document.querySelector('#main .lp-chatsolved-ok'); if (b) b.click(); });
    const after = await p.evaluate((pid) => { const L = __L(pid), pg = APP.S.get('eprog_' + pid); return { state: L.state, sol: (L.chat || {}).solution, u: pg.solve.u && pg.solve.u[1] && pg.solve.u[1].from, one: pg.solve.u && pg.solve.u[1] && pg.solve.u[1].one, main: document.getElementById('main').textContent.slice(0, 4000) }; }, pid);
    const ok22 = before.card && (before.ph === 'u' || before.ph === 'p') && after.state === 'solved' && /۵۵ دقیقه/.test(after.sol || '') && after.u === 'chat' && /می‌خوام بدونم با روزی ۴۰ دقیقه/.test(after.one || '') && !/رونوشتِ صورت/.test(after.main) && !/هنوز نه:[^.]*(?:مفهومِ مبهم|تقریبِ کافی|ریاضی‌کردن|حدس)/.test(after.main);
    T(22, ok22 && /دوباره پر کند/.test(hk22), { before, state: after.state, u: after.u, one: after.one });
    chk(ok22, 'D25-7 (pwD1 p7 «هنوز نه: جملهٔ کل تقریباً رونوشتِ صورت است» + هفت فیلد): the chat-solved problem closes with her own whole sentence and no re-asked frame :: ' + JSON.stringify({ before, state: after.state, u: after.u }));
    T(44, after.state === 'solved' && /بازنگری/.test(after.main), after.main.slice(0, 200));
    NC(44, 'the one genuinely missing field (her lesson) is asked by the look-back form of the solved page (existing a38 form, shown after the close) — the close itself asks nothing else; asserted: state solved, look-back section present');
    // #23 / A25-20: closed problem ⇒ the ledger is history
    await wipe(); await fresh();
    pid = await bind('سرامیک', 'برای کفِ آشپزخونه چند جعبه سرامیک بخرم؟');
    await ppr(CER, CERP, { cs: { said: ['d'] } });
    await turn('آها دیدم! ۱۴٫۴ تقسیم بر ۱٫۴۴ میشه ۱۰، نه ۱۲.', 'خوب.', [csn({ ph: 'e', said: ['result'], result: '۱۴٫۴ تقسیم بر ۱٫۴۴ میشه ۱۰' })]);
    await p.evaluate((pid) => { __liveSet(pid, (so, L) => { L.state = 'solved'; L.stateAt = APP.nowISO(); L.stateD = APP.today(); }); }, pid);
    const f23 = await p.evaluate((pid) => { APP.go('lprob', pid); const s = document.querySelector('#main .lp-prior'); return s ? s.textContent : ''; }, pid);
    T(23, f23 && !/ازسرگیری/.test(f23) && /اصلاح شد ⇐/.test(f23) && !(await PQ(pid)), f23.slice(0, 400));
  });

  // ================= bank — P1 (VARIANTS_R25) =================
  await section('bank', async () => {
    // #0 / #18 / #24 مسئلهٔ سرامیک
    let u = await cer(); let pr = await PR(), q = await PQ();
    T(0, ask(u.user) && /نقطهٔ ازسرگیری/.test(bold(u.user)) && !/کلِ مسئله را در یک جمله و به زبانِ خودت می‌گویی/.test(bold(u.user)) && !/پیشنهادِ این نوبت: «کلِ مسئله/.test(head(u.user)) && !/مرحلهٔ محتمل: فهمِ مسئله/.test(coachHead(u.user)) && (bold(u.user).match(/پرسشِ این نوبت همین است/g) || []).length === 1 &&
      pr && pr.steps[0].verdict === 'ok' && pr.steps[1].verdict === 'wrong' && pr.steps[1].pageBad && pr.steps[2].depWrong.indexOf(2) >= 0 && pr.resume === 2 && /گامِ ۲[^\n]*کجایش می‌لنگد/.test(q), { bold: bold(u.user).slice(0, 200), st: st(pr), q });
    T(24, pr.steps[2].depWrong.indexOf(2) >= 0, st(pr));
    NC(0, 'the page check of «۳٫۲ در ۴٫۵ متره، میشه ۱۴٫۴» (words between the operands) is the arithmetic reader (P2, fixer «arith»); step 1 is the model\'s ✓ here — step 2 page-checked ✗, dependency, resume and the single turn instruction asserted');
    const ev = await evs(), md = await mind();
    T(18, ev.some(e => e.ok && e.prior === 1) && ev.some(e => !e.ok && e.prior === 2 && e.cause === 'skill') && md.some(t => /^\+گامِ درستِ کارِ پیشینِ خودش \(گامِ ۱\)/.test(t)) && md.some(t => /^-گامِ کارِ پیشین که درست نبود \(گامِ ۲\).*\|skill/.test(t)), { ev, md });
    T(19, md.filter(t => /^\+گامِ درستِ کارِ پیشین/.test(t)).length >= 1 && md.some(t => /کارِ پیشین که درست نبود/.test(t) && !/\|unk/.test(t)), md);
    NC(19, 'child-simple wording of the cause is the model\'s `why`; the page shows each prior step with its source line and cause on the same card for any age — asserted on مسئلهٔ سرامیک (same code path)');
    // #9 her own fix (page reads «14.4 ÷ 1.44 = 10» itself; the model's validated step agrees)
    u = await turn('آها دیدم! ۱۴٫۴ تقسیم بر ۱٫۴۴ میشه ۱۰، نه ۱۲.', 'آفرین.', [csn({ ph: 'e', said: ['result'], step: { quote: '۱۴٫۴ تقسیم بر ۱٫۴۴ میشه ۱۰', done: 'yes' }, retract: { msg: '۱۲ جعبه', what: 'result', fix: '۱۰', rests: [] } })]);
    pr = await PR(); q = await PQ();
    const lastAi = await p.evaluate(() => { const s = __cur(); return (s.msgs || []).filter(m => m.role !== 'user').slice(-2).map(m => m.text + ' ' + JSON.stringify(m.notes || m.acts || '')).join(' '); });
    T(9, pr.steps[1].verdict === 'ok' && pr.steps[1].fixed && /۱۰ جعبه/.test(pr.steps[1].fixed.t) && /۱۲ جعبه/.test(pr.steps[1].fixed.was) && pr.resume === 3 && pr.steps[2].depStale.indexOf(2) >= 0 && !pr.steps[2].depWrong.length && /گامِ ۳/.test(q) && !/گامِ ۲[^\n]*کجایش می‌لنگد/.test(q) &&
      !/گامِ ۲[^»]*کجایش می‌لنگد/.test(sugOf(u.user)) && /گامِ ۳/.test(sugOf(u.user)) && !/چیزی برای عوض کردن نبود|چیزی در صفحه ثبت نشده بود/.test(lastAi), { st: st(pr), q, sug: sugOf(u.user), lastAi: lastAi.slice(0, 200) });
    // #37 a still-wrong «fix» is not applied (C8)
    await cer();
    await turn('آها، پس میشه ۱۱ جعبه', 'خوب.', [csn({ ph: 'e', said: ['result'], step: { quote: 'پس میشه ۱۱ جعبه', done: 'yes' } })]);
    pr = await PR(); q = await PQ();
    const ln37 = await p.evaluate(() => APP.STORY.priorLines(APP.STORY.priorFor(__cur(), '')).join('\n'));
    T(37, pr.steps[1].verdict === 'wrong' && !pr.steps[1].fixed && pr.resume === 2 && pr.steps[1].retry && /۱۱/.test(pr.steps[1].retry.t) && !/(?:^|[^۰-۹٫])۱۰(?![۰-۹٫])/.test(pr.steps[1].chk), { st: st(pr), ln37: ln37.slice(0, 300) });
    // #7 mixed, no leading «نه»
    await cer();
    await turn('گامِ ۲ رو قبول ندارم، چون جعبه‌ها رو باز هم میشه خرید؛ ولی دربارهٔ گامِ ۳ حق با توئه، پرت رو حساب نکرده بودم.', 'خوب.', [csn({ ph: 'e', said: [] })]);
    pr = await PR();
    T(7, pr.steps[1].her === 'no' && /باز هم میشه خرید/.test(pr.steps[1].herWhy || '') && pr.steps[2].her === 'ok', st(pr));
    // #46 both accepted ⇒ the model's fix may be written
    await cer();
    await turn('گامِ ۲ و ۳ هر دو رو قبول دارم، اشتباه از من بود', 'خوب.', [csn({ ph: 'e', said: [] })]);
    pr = await PR();
    T(46, pr.steps[1].her === 'ok' && pr.steps[2].her === 'ok' && !pr.steps.some(x => x.her === 'no') && pr.steps[1].fixed && pr.steps[1].fixed.by === 'yes', st(pr));
    // #31 / #32 / #33 leading «نه» that is not a dispute
    await cer(); await turn('نه نه، درست میگی، گامِ ۲ غلطه، خودمم شک داشتم', 'خوب.', [csn({ ph: 'e', said: [] })]); pr = await PR();
    T(31, pr.steps[1].her === 'ok' && !pr.steps.some(x => x.her === 'no'), st(pr));
    await cer(); const b32 = st(await PR()); await turn('نه دیگه، امروز خسته شدم. فردا ادامه میدیم.', 'باشه.', [csn({ ph: 'e', said: [] })]); pr = await PR();
    T(32, JSON.stringify(st(pr)) === JSON.stringify(b32) && pr.resume === 2, st(pr));
    await cer(); u = await turn('نه، منظورم اینه که گامِ ۲ رو یه کم بیشتر باز کن، نفهمیدم ایرادش کجاست', 'باشه.', [csn({ ph: 'e', said: [] })]); pr = await PR();
    T(33, !pr.steps.some(x => x.her === 'no') && !/را رد می‌کند/.test(head(u.user)) && !/رد کردی/.test(await PQ()), st(pr));
    // #30 «نه، بس نیست!» with a judged ledger (chat)
    await cer(); u = await turn('نه، بس نیست!', 'بله.', [csn({ ph: 'e', said: [] })]); pr = await PR();
    T(30, !pr.steps.some(x => x.her === 'no') && !/را رد می‌کند/.test(head(u.user)) && !/رد کرد/.test(await PQ()), st(pr));
    // #14 misclick withdrawn in words; 📜 keeps the history
    await cer(); await setHer(3, 'no');
    await turn('اشتباهی زدم، گامِ ۳ رو قبول دارم', 'درست شد.', [csn({ ph: 'e', said: [] })]);
    pr = await PR(); const sid14 = await p.evaluate(() => __cur().id);
    const D14 = await p.evaluate((sid) => (APP.dossierSess ? APP.dossierSess(sid).events : []).map(e => (e.lines || []).join(' ')).join('\n'), sid14);
    T(14, pr.steps[2].her === 'ok' && !/رد کرد/.test(await PQ()) && /رد ⇒ پس گرفته شد/.test(D14), { st: st(pr), D: D14.slice(-300) });
    // #25 / #38 mid-solve step report with a ledger: no request; an unasked one-step report never replaces
    await cer();
    u = await turn('خب ۱۴٫۴ رو تقسیم بر ۱٫۴۴ کردم شد ۱۰. بعد ده درصد اضافه کردم، پس میشه ۱۱ جعبه.', 'خوب.', [csn({ ph: 'e', said: ['result'], prior: [{ step: 'پرتِ تازه', quote: 'بعد ده درصد اضافه کردم، پس میشه ۱۱ جعبه', verdict: 'ok' }] })]);
    pr = await PR();
    T(25, !ask(u.user), head(u.user).slice(0, 80));
    T(38, pr.steps.length === 3 && /۳ گام/.test(pr.sum), { st: st(pr), sum: pr.sum });
    // #40 a real recall request
    await cer(); const b40 = st(await PR()), n40 = (await items()).length;
    await turn('یادم رفت دیروز تا کجا رسیدیم، یادم بنداز', 'تا گامِ ۲.', [csn({ ph: 'e', said: ['result'], step: { quote: 'یادم رفت دیروز تا کجا رسیدیم', done: 'yes' } })]);
    T(40, JSON.stringify(st(await PR())) === JSON.stringify(b40) && (await items()).length === n40, st(await PR()));
    // #17 «یادم رفته بود» beside the step result
    await cer();
    await turn('خب گامِ ۲ رو دوباره رفتم، ۱۴٫۴ تقسیم بر ۱٫۴۴ شد ۱۰ جعبه. راستی یه چیزی یادم رفته بود بگم: کرایهٔ وانت رو هم باید اضافه کنم.', 'خوب.', [csn({ ph: 'e', said: ['result'], result: '۱۴٫۴ تقسیم بر ۱٫۴۴ شد ۱۰ جعبه' })]);
    pr = await PR(); q = await PQ();
    T(17, pr.steps[1].fixed && pr.steps[1].verdict === 'ok' && (await items()).some(x => x.k === 'res') && !/گامِ ۲[^\n]*کجایش/.test(q), { st: st(pr), q });
    NC(17, 'the new plan item («کرایهٔ وانت») enters the plan through the model\'s plan report (story plan layer, R2) — here: the turn is not dropped, the step result is merged, the old question is gone — asserted (bank text «گامِ ۳ … ۸۴۰ هزار تومن» mapped onto مسئلهٔ سرامیک step 2)');
    // #1 / #8 / #11 / #13 / #47 مسئلهٔ همنهشتی
    u = await cong(); pr = await PR();
    T(1, ask(u.user) && /نقطهٔ ازسرگیری/.test(bold(u.user)) && !/همین پیام حدس است/.test(head(u.user)) && pr.steps[1].verdict === 'wrong' && pr.steps[2].depWrong.indexOf(2) >= 0 && pr.resume === 2 && /گامِ ۲/.test(await PQ()), { bold: bold(u.user).slice(0, 200), st: st(pr) });
    NC(1, '«formulas shown as formulas» is the formula renderer (round 21, fixer «classify» for bdi) — the turn question / verdicts / dependency asserted');
    await turn('نه، گامِ ۲ رو قبول ندارم، ۸ به هر توانی برسه باقی‌مونده‌ش عوض میشه. ولی گامِ ۳ رو قبول دارم که بهش وابسته‌ست.', 'خوب.', [csn({ ph: 'e', said: [], nat: 'objective' })]);
    pr = await PR();
    T(8, pr.steps[1].her === 'no' && pr.steps[2].her === 'ok' && /باقی‌مونده‌ش عوض میشه/.test(pr.steps[1].herWhy || ''), st(pr));
    await cong();
    u = await turn('ولی گامِ ۲ چرا غلطه؟ ۸ به توانِ هر چی باشه باقی‌مونده‌ش همون توانه دیگه!', 'دوباره سنجیدم.', [csn({ ph: 'e', said: [], nat: 'objective', prior: [{ n: 2, quote: 'چون 8 ≡ 1 (mod 7)، پس 8^n ≡ n (mod 7)', verdict: 'wrong', why: '8² = 64 = 7·9 + 1 ⇒ باقی‌مانده ۱، نه ۲' }] })]);
    pr = await PR(); const ln11 = await p.evaluate(() => APP.STORY.priorLines(APP.STORY.priorFor(__cur(), '')).join('\n'));
    T(11, /حکمِ گامِ ۲/.test(bold(u.user)) && /با شاهد دوباره بسنج/.test(bold(u.user)) && !/پیشنهادِ این نوبت: «خودت فکر می‌کنی چرا/.test(head(u.user)) && pr.steps[1].re && pr.steps[1].reAt && /دوباره سنجیده شد \(مربی\): حکم ماند — 8² = 64/.test(ln11) && !/دوباره سنجیده می‌شود/.test(ln11), { bold: bold(u.user).slice(0, 200), ln11: ln11.slice(0, 400) });
    const qs13 = []; for (const m of ['خب.', 'باشه، گامِ ۱ رو دوباره نگاه می‌کنم.', 'فهمیدم.', 'ادامه بده.']) { const u13 = await turn(m, 'خوب.', [csn({ ph: 'e', said: [], nat: 'objective' })]); qs13.push(bold(u13.user) + sugOf(u13.user)); qs13.push(await PQ()); }
    T(13, !qs13.some(t => /دلیلِ تازه‌ات برای گامِ ۲|را رد کردی — به چه دلیل/.test(t)), qs13.map(t => t.slice(0, 80)));
    u = await turn('نه! من درست میگم', 'شاهد همان است.', [csn({ ph: 'e', said: [], nat: 'objective' })]);
    pr = await PR();
    T(47, pr.steps[1].verdict === 'wrong' && pr.steps[1].her !== 'no' && /به کدام بخشِ شاهدِ دوباره‌سنجیِ گامِ ۲ شک داری/.test(bold(u.user)) && /8² = 64/.test(bold(u.user)), { st: st(pr), bold: bold(u.user).slice(0, 300) });
    // #12 she is right ⇒ the verdict changes on the page with the evidence
    await wipe(); await fresh();
    await ppr('می‌خوام فاصلهٔ ترمز رو حساب کنم. گام ۱: ۹۰ کیلومتر بر ساعت = ۲۵ متر بر ثانیه. گام ۲: زمانِ واکنش ۱ ثانیه‌ست پس ۲۵ متر می‌رم.', [{ step: 'تبدیل', quote: '۹۰ کیلومتر بر ساعت = ۲۵ متر بر ثانیه', verdict: 'wrong', why: 'تبدیل نادرست است' }, { step: 'واکنش', quote: 'زمانِ واکنش ۱ ثانیه‌ست پس ۲۵ متر می‌رم', verdict: 'ok', dep: [1] }], { cs: { nat: 'practical' } });
    u = await turn('اشتباه می‌کنی. ۹۰ کیلومتر یعنی ۹۰ هزار متر، تقسیم بر ۳۶۰۰ ثانیه میشه ۲۵.', 'حق با توست.', [csn({ ph: 'e', said: [], nat: 'practical', prior: [{ n: 1, quote: '۹۰ کیلومتر بر ساعت = ۲۵ متر بر ثانیه', verdict: 'ok', why: '۹۰۰۰۰ ÷ ۳۶۰۰ = ۲۵' }] })]);
    pr = await PR(); const ev12 = await evs();
    T(12, /حکمِ گامِ ۱/.test(bold(u.user)) && pr.steps[0].verdict === 'ok' && pr.steps[0].re && pr.steps[0].re.was === 'wrong' && pr.steps[0].re.to === 'ok' && /۹۰۰۰۰ ÷ ۳۶۰۰/.test(pr.steps[0].re.why) && pr.resume === 0 && !pr.steps[1].depWrong.length && ev12.some(e => !e.ok && e.prior === 1 && e.wd) && ev12.some(e => e.ok && e.prior === 1), { st: st(pr), ev12 });
    NC(12, 'the evidence «90 000 ÷ 3600 = 25» with «هزار» in words is computed by the page arithmetic check (P2, fixer «arith»); here the re-check result (the model\'s report with the evidence) flips the verdict on the ledger, moves the resume point and withdraws the negative mind-card event — asserted');
    // #2 she calls it her earlier work, not the opening
    await wipe(); await fresh();
    await turn('سلام. می‌خوام بودجهٔ ماهانه‌م رو مرتب کنم.', 'خوب.', [csn({ ph: 'u', said: ['u'] })]);
    for (const m of ['حقوقم ثابته.', 'خرج‌هام زیاده.', 'می‌خوام پس‌انداز کنم.', 'هدفم ۱۰۰ میلیونه.', 'باشه.']) await turn(m, 'خوب.', [csn({ ph: 'u', said: [] })]);
    u = await ppr('این کاریه که دیشب خودم روی کاغذ کرده بودم، ببین تا کجاش درسته: حقوقم ۴۲ میلیونه. اجاره ۱۵، خوراک ۹، قسط ۶٫۵، جمعِ خرج میشه ۳۰٫۵. پس ماهی ۱۲٫۵ می‌مونه. در ۸ ماه میشه ۱۰۰ میلیون.',
      [{ step: 'جمعِ خرج', quote: 'اجاره ۱۵، خوراک ۹، قسط ۶٫۵، جمعِ خرج میشه ۳۰٫۵', verdict: 'ok' }, { step: 'مانده', quote: 'پس ماهی ۱۲٫۵ می‌مونه', verdict: 'wrong', why: '۴۲ منهای ۳۰٫۵' }, { step: 'هشت ماه', quote: 'در ۸ ماه میشه ۱۰۰ میلیون', verdict: 'ok', dep: [2] }]);
    pr = await PR();
    T(2, ask(u.user) && pr && pr.steps.length === 3 && pr.steps[1].verdict === 'wrong' && pr.steps[2].depWrong.indexOf(2) >= 0 && pr.resume === 2, { ask: ask(u.user), st: st(pr) });
    NC(2, '«42 − 30.5 = 11.5» is not written as an expression in her text (the page claims no check of it); the ✗ is the model\'s verdict — firing, merge, dependency and resume asserted');
    // #3 an opening with ONE computed step
    await wipe(); await fresh();
    u = await ppr('با سلام. برای آبیاریِ باغچه حساب کرده‌ام: روزی ۴۰ لیتر، هفته‌ای ۳ بار، در ۲۶ هفته، لیتری ۸ تومان، شد ۲۴۹۶۰ تومان. می‌خواهم بدانم با این حساب تانکر بگیرم یا نه.', [{ step: 'هزینهٔ آب', quote: 'روزی ۴۰ لیتر، هفته‌ای ۳ بار، در ۲۶ هفته، لیتری ۸ تومان، شد ۲۴۹۶۰ تومان', verdict: 'ok' }], { cs: { register: 'شما', said: ['d'] } });
    pr = await PR(); q = await PQ();
    T(3, ask(u.user) && pr && pr.steps.length === 1 && pr.steps[0].verdict === 'ok' && pr.resume === 0 && !/کجایش می‌لنگد/.test(q), { ask: ask(u.user), st: st(pr), q });
    NC(3, 'the page check of the product written with commas («۴۰ … ۳ … ۲۶ … ۸ شد ۲۴۹۶۰») is the arithmetic reader (P2, fixer «arith»); «شما» is the register layer (P6) — firing on a single computed step, ✓ kept, no re-ask asserted');
    // #6 child fixes two steps; step 4 stays ✗
    await wipe(); await fresh();
    await ppr('آلبومم ۶۰ تا برچسب می‌خواد. گام ۱: هفتهٔ اول ۱۵ تا خریدم. گام ۲: هفتهٔ دوم دو برابر خریدم، پس ۱۵ + ۳۰ میشه ۳۵. گام ۳: ۶۰ منهای ۳۵ میشه ۲۵ تا مونده. گام ۴: روزی ۵ تا بخرم، پس ۳ روز.',
      [{ step: 'هفتهٔ اول', quote: 'هفتهٔ اول ۱۵ تا خریدم', verdict: 'ok' }, { step: 'جمع', quote: '۱۵ + ۳۰ میشه ۳۵', verdict: 'ok' }, { step: 'مانده', quote: '۶۰ منهای ۳۵ میشه ۲۵ تا مونده', verdict: 'ok' }, { step: 'روزها', quote: 'روزی ۵ تا بخرم، پس ۳ روز', verdict: 'wrong', why: 'تقسیم' }], { cs: { nat: 'objective' } });
    await turn('گام ۲ رو درست کردم: ۱۵ + ۳۰ میشه ۴۵. گام ۳ هم با اون میشه ۶۰ منهای ۴۵ یعنی ۱۵ تا برچسب مونده.', 'خوب.', [csn({ ph: 'e', said: ['result'], nat: 'objective' })]);
    pr = await PR(); q = await PQ();
    T(6, pr.steps[1].verdict === 'ok' && pr.steps[1].fixed && pr.steps[2].fixed && /۴۵/.test(pr.steps[2].fixed.t) && pr.steps[3].verdict === 'wrong' && pr.resume === 4 && pr.ph === 'c' && !/همهٔ گام‌های پیشینت درست درآمد/.test(q), { st: st(pr), q, ph: pr.ph });
    // #10 elder: her fix plus the redone dependent step
    await wipe(); await fresh();
    await ppr('با سلام. برای دوختِ پرده‌ها حساب کرده‌ام. گام ۱: برش و دوخت ۴۵۰ دقیقه یعنی ۴٫۵ ساعت. گام ۲: پس کلِ کار ۴٫۵ + ۲ یعنی ۶٫۵ ساعت می‌شود.', [{ step: 'تبدیل', quote: '۴۵۰ دقیقه یعنی ۴٫۵ ساعت', verdict: 'ok' }, { step: 'کل', quote: 'پس کلِ کار ۴٫۵ + ۲ یعنی ۶٫۵ ساعت می‌شود', verdict: 'ok' }], { cs: { register: 'شما' } });
    pr = await PR(); const b10 = st(pr);
    await turn('بله متوجه شدم، ۴۵۰ دقیقه ۷٫۵ ساعت است نه ۴٫۵. پس کلِ کار ۷٫۵ + ۲ یعنی ۹٫۵ ساعت می‌شود.', 'بله.', [csn({ ph: 'e', said: ['result'], register: 'شما' })]);
    pr = await PR();
    T(10, b10[0][1] === 'wrong' && b10[1][5] === '1' && pr.steps[0].verdict === 'ok' && /۷٫۵ ساعت/.test(pr.steps[0].fixed.t) && /۴٫۵/.test(pr.steps[0].fixed.was) && pr.steps[1].fixed && /۹٫۵/.test(pr.steps[1].fixed.t) && !pr.steps[1].depWrong.length && !pr.steps[1].depStale.length && pr.resume === 0, { b10, st: st(pr) });
    // #15 test followed by a proof; #45 bare claim
    await wipe(); await fresh();
    await turn('می‌خوام مجموعِ ۱ تا n رو پیدا کنم.', 'خوب.', [csn({ ph: 'u', said: ['u'], nat: 'objective' })]);
    u = await turn('برای n=۶ و n=۷ امتحان کردم: ۱+۲+…+۶ میشه ۲۱ و تا ۷ میشه ۲۸، با n(n+1)/2 جور دراومد. اثباتش رو هم پیدا کردم: دنباله رو یه بار رو به جلو و یه بار برعکس می‌نویسم، هر ستون میشه n+1 و n تا ستون داریم، پس دو برابرِ مجموع میشه n(n+1).', 'خوب.', [csn({ ph: 'e', said: ['result'], nat: 'objective' })]);
    T(15, /برهانت را خودت(?:ان)? وارسی می‌کن/.test(bold(u.user)) && !/همین پیام حدس است/.test(head(u.user)) && !/چطور می‌آزمایی‌اش/.test(bold(u.user)), bold(u.user).slice(0, 300));
    NC(15, 'recording the tested cases as «tests» and the proof as her argument is the model\'s step/claim report into the story; the page turn question (proof check, not the guess test) asserted');
    await wipe(); await fresh();
    u = await turn('به نظرم حاصل‌ضربِ هر دو عددِ متوالی همیشه زوجه', 'خوب.', [csn({ ph: 'u', said: [], nat: 'objective', guess: { text: 'حاصل‌ضربِ هر دو عددِ متوالی همیشه زوجه' } })]);
    T(45, /چطور می‌آزمایی‌اش/.test(head(u.user)) && !/برهانت را خودت وارسی/.test(head(u.user)), bold(u.user).slice(0, 200));
    // #26–#29 negatives: no request
    const noAsk = async (pre, m) => { await wipe(); await fresh(); for (const x of pre) await turn(x, 'خوب.', [csn({ ph: 'u', said: [] })]); const r = await turn(m, 'خوب.', [csn({ ph: 'e', said: [] })]); return !ask(r.user) && !(await PR()); };
    T(26, await noAsk(['یه مسئله دارم دربارهٔ مهره‌ها: روی هم چند تا مهره برداشتم؟'], 'اول ۷ تا مهره برداشتم، بعد ۵ تا دیگه، پس میشه ۱۲ تا'));
    T(27, await noAsk([], 'معلممون امروز گفت اول صورتِ مسئله رو بخونید، بعد شکل بکشید. پس منم شکل کشیدم ولی بازم نفهمیدم.'));
    NC(27, 'the mind-card booking of the teacher\'s words is the stuck/role layer of a27 (not the prior ledger): no prior event is created — asserted with the no-request check');
    T(28, await noAsk([], 'اول باید مسئله رو ثبت کنم بعد برگه‌ها رو ببینم؟ پس این فرم‌ها کجا ذخیره میشن؟'));
    T(29, await noAsk(['یه مسئله دارم: یک‌چهارمِ ۳۰ چنده؟'], 'نصفِ ۳۰ میشه ۱۵، پس یک‌چهارمش میشه ۷٫۵'));
    NC(29, 'the prerequisite check itself (✓ 30 ÷ 4 = 7.5) is the prereq layer (a44) on the model\'s prereq report; here: no prior request and no ledger — asserted');
    // #34 tested cases, then stuck
    await wipe(); await fresh();
    u = await ppr('2^n − 1 رو برای n=۲ و ۳ و ۵ و ۷ امتحان کردم: ۳، ۷، ۳۱، ۱۲۷، همه اول‌ان. ولی نمی‌دونم همیشه همین‌طوره یا نه. گیر کردم.', [{ step: 'n=2', quote: '۳، ۷، ۳۱، ۱۲۷، همه اول‌ان', verdict: 'ok' }], { cs: { nat: 'objective', stuck: true } });
    T(34, !(await PR()) && !ask(u.user) && !(await PQ()) && !/اجرای طرح|مرحلهٔ محتمل: اجرا/.test(coachHead(u.user)), coachHead(u.user).slice(0, 160));
    NC(34, 'the stuck help and «تو» for a teen are the stuck ladder / register layers (P6); here: no ledger, no «همه درست — گامِ بعدی؟», stage not «اجرا» — asserted');
    // #35 / #36 dependency needs the WRONG number in the same role
    const dep = await p.evaluate(() => { const s = { msgs: [] }; const mk = (t, P) => APP.STORY.priorOf(s, { prior: P }, { text: t, at: 't1' });
      const a = mk('گام ۲: انرژی = ۱۵۰۰ وات × ۱۲۰۰ ثانیه = ۱۸۰۰۰۰۰ ژول، یعنی ۱۸ کیلووات‌ساعت. گام ۴: ۱۸۰۰۰۰۰ ژول تقسیم بر (۴۲۰۰ × ۲۰) یعنی آبِ ۲۰ لیتری حدودِ ۲۱٫۴ درجه گرم می‌شود.', [{ step: 'انرژی', quote: 'انرژی = ۱۵۰۰ وات × ۱۲۰۰ ثانیه = ۱۸۰۰۰۰۰ ژول، یعنی ۱۸ کیلووات‌ساعت', verdict: 'wrong', why: 'تبدیل به کیلووات‌ساعت' }, { step: 'گرما', quote: '۱۸۰۰۰۰۰ ژول تقسیم بر (۴۲۰۰ × ۲۰) یعنی آبِ ۲۰ لیتری حدودِ ۲۱٫۴ درجه گرم می‌شود', verdict: 'ok' }]);
      const b = mk('گام ۱: ۱۴٫۴ تقسیم بر ۱٫۴۴ میشه ۱۲ جعبه. گام ۳: قسطِ ۱۲ ماهه می‌گیرم.', [{ step: 'جعبه', quote: '۱۴٫۴ تقسیم بر ۱٫۴۴ میشه ۱۲ جعبه', verdict: 'ok' }, { step: 'قسط', quote: 'قسطِ ۱۲ ماهه می‌گیرم', verdict: 'ok' }]);
      return { a: a.steps.map(x => [x.verdict, x.depWrong]), b: b.steps.map(x => [x.verdict, x.depWrong]) }; });
    T(35, dep.a[0][0] === 'wrong' && dep.a[1][0] === 'ok' && !dep.a[1][1].length, dep.a);
    T(36, dep.b[0][0] === 'wrong' && !dep.b[1][1].length, dep.b);
    // #41 a refuted own claim is not a stuck
    await cong();
    await turn('ادعای خودم رو با یه مثالِ نقض رد کردم: برای n=۴ جور درنمیاد.', 'خوب.', [csn({ ph: 'e', said: [], nat: 'objective', refuted: true })]);
    const ev41 = await p.evaluate(() => (__cur().coachEv || []).filter(e => !e.ok && !e.wd && /مثالِ نقض/.test(String(e.key || ''))).map(e => e.src + '|' + (e.cause || '')));
    T(41, !ev41.length, ev41);
    // #43 problem + idea, no steps
    await wipe(); await fresh();
    u = await turn('یه مسئله دارم: چطور قبضِ گاز رو کم کنیم؟ فکر می‌کنم باید درزِ پنجره‌ها رو بگیریم.', 'خوب.', [csn({ ph: 'u', said: ['u'], nat: 'life' })]);
    T(43, !ask(u.user) && !(await PR()), head(u.user).slice(0, 60));
    // #48 an opening whose steps are all ✓
    await wipe(); await fresh();
    u = await ppr('می‌خوام ببینم برای ۳۵ مهمون چند کیلو برنج لازمه. گام ۱: هر نفر ۱۲۰ گرم. گام ۲: ۳۵ × ۱۲۰ = ۴۲۰۰ گرم. گام ۳: یعنی ۴٫۲ کیلو. بعدش نمی‌دونم چقدر اضافه بگیرم.', [{ step: 'سرانه', quote: 'هر نفر ۱۲۰ گرم', verdict: 'ok' }, { step: 'ضرب', quote: '۳۵ × ۱۲۰ = ۴۲۰۰ گرم', verdict: 'ok' }, { step: 'کیلو', quote: 'یعنی ۴٫۲ کیلو', verdict: 'ok' }], { cs: { nat: 'practical' } });
    pr = await PR(); q = await PQ();
    T(48, pr && pr.resume === 0 && !/کجایش می‌لنگد/.test(q) && !pr.steps.some(x => x.verdict !== 'ok'), { st: st(pr), q });
    NC(48, 'naming the open part («چقدر اضافه بگیرم») as the resume point is the model\'s reply on the page line «نقطهٔ ازسرگیری پس از آخرین گام (همه درست)»; the page question is «گامِ بعدیِ تو چیست؟», never a «کجایش می‌لنگد؟» — asserted');
    const missing = BANK.map((e, i) => i).filter(i => /^P1\./.test(E[i].rc) && info.bank[i] === undefined && info.nc[i] === undefined);
    chk(!missing.length, 'bank: every P1 entry is tested or has a reason :: ' + JSON.stringify(missing));
  });

  const nb = Object.keys(info.bank).length, nbOk = Object.values(info.bank).filter(Boolean).length;
  console.log('bank P1: ' + nbOk + '/' + nb + ' pass; nc: ' + Object.keys(info.nc).length + (Object.keys(info.nc).length ? ' ' + JSON.stringify(info.nc) : ''));
  if (errors.length) { console.log('ERRORS (' + errors.length + '):\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
  await b.close();
})();
