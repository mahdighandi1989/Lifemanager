// تورِ پولیا (دستهٔ ۱، دورِ ۳۰، سهمِ «prior» — ۲۰۲۶-۱۱-۱۸) — DECISIONS_R30: F17 (D30-1، A30-22/D30-2، A30-21/B30·D14)، F11 سمتِ prior (C30-11)، دنباله C27-3.
//  runners  بازپخشِ صفحه‌ایِ خودِ اجراهای دونده‌ها (tests/fixtures/r30_prior از T/round30X/<sid>/ctl و ai — فقط خواندن) + بدل‌های منفیِ همان سناریو (C136)
//  هیچ انتظاری به تاریخِ تقویم بسته نیست (ساعتِ Playwright از fixture). LLA_FILE = ساختِ دیگر (قرمزِ نخست: ساختِ BASE30)؛ ONLY=D_tD1|D_tD3|A_pwA2|A_pwA1|B_nB3|C_s28|C_s29|units
const { chromium } = require('playwright');
const path = require('path');
const { replay } = require('./tour1_r26_replay');
const FXD = path.join(__dirname, 'fixtures', 'r30_prior');
const FILE = 'file://' + (process.env.LLA_FILE || path.join(__dirname, '..', 'dist', 'learning-architecture.html'));

(async () => {
  const b = await chromium.launch(); const errors = []; const ran = [];
  const chk = (c, m) => { if (!c) errors.push(m); };
  const want = (n) => !process.env.ONLY || process.env.ONLY.split(',').some(o => o === n || o === 'runners');
  const rp = async (name, upto, fn, tag) => { const id = tag || name; if (!want(name) && !want(id)) return; let R = null;
    try { R = await replay(b, name, { dir: FXD, upto }); await fn(R); ran.push(id); } catch (e) { errors.push(id + ' — exception: ' + String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); }
    if (R) { R.errors.forEach(e => errors.push(id + ' ' + e)); await R.close(); } };
  /* همهٔ دفترهای کارِ پیشین (مسئلهٔ زنده و گفت‌وگو) */
  const LED = (R) => R.p.evaluate(() => { const out = {}, dump = (P) => ({ steps: P.steps.map(x => ({ n: x.n, v: x.verdict, q: x.quote, f: x.fixed ? x.fixed.t : '', by: x.fixed ? x.fixed.by : '', stale: !!x.stale, page30: !!x.page30 })), lines: APP.STORY.priorLines(P) });
    APP.S.all('eprog').forEach(pg => { const P = pg.solve && pg.solve.live && pg.solve.live.prior; if (P) out['L:' + pg.id.replace(/^eprog_/, '')] = dump(P); });
    APP.S.all('achat').forEach(se => { const T = (se.coach || {}).story || {}; Object.keys(T).forEach(k => { if (T[k].prior && !/^L:/.test(k)) out['C:' + se.id + ':' + k] = dump(T[k].prior); }); });
    return out; });
  const liveLed = (L) => Object.keys(L).filter(k => /^L:/.test(k)).map(k => L[k]);
  const allLines = (L) => Object.values(L).reduce((a, x) => a.concat(x.lines), []);
  const R0 = (o) => JSON.stringify(Object.assign({ reply: 'باشه.', status: 'related', memory: 'm', actions: [] }, o));
  const cs = (o) => Object.assign({ do: 'coach_state', ph: 'e', said: [], ans: [], stuck: false, fail: false, role: 'self', nat: 'practical' }, o);

  // ===== D30-1 (S2) + D30-2 — tD1: p25 «… اوستا گفت روزی ۷ مترمربع نصب می‌کنه، پس ۲۲ ÷ ۷ ≈ ۳ روز» never rewrites step 2; step 1 keeps only its calculation =====
  await rp('D_tD1', 49, async (R) => {
    const L = await LED(R), lv = liveLed(L)[0];
    chk(!!lv, 'tD1: the live problem has its ledger :: ' + Object.keys(L));
    const s2 = lv && lv.steps[1];
    chk(s2 && !/۲۲ ÷ ۷/.test(s2.f) && /۲۰ × ۱٫۱۲ = ۲۲٫۴/.test(s2.f || s2.q), 'D30-1 (tD1 p25): step 2 «با ۱۲ درصد پرت، ۲۰ × ۱٫۱۲ = ۲۲٫۴» is never rewritten by «۲۲ ÷ ۷ ≈ ۳ روز» (a new calculation, not a redo of step 2) :: ' + JSON.stringify(s2));
    chk(!allLines(L).some(l => /۲۲ ÷ ۷/.test(l) && /به دستِ خودش/.test(l)), 'D30-1: no ledger line carries «۲۲ ÷ ۷ … به دستِ خودش» :: ' + allLines(L).filter(l => /۲۲ ÷ ۷/.test(l)).join(' ¦ ').slice(0, 400));
    chk(s2 && s2.stale, 'D30-1: step 2 stays «کهنه» (it still waits for her redo with ۲۲) :: ' + JSON.stringify(s2));
    const s1 = lv && lv.steps[0];
    chk(s1 && s1.f === '۵٫۵ متر در ۴ متر میشه ۲۲ مترمربع.', 'D30-2 (tD1 s14 «نه، ۲۷٫۵ نیست. منظورم طول بود: ۵٫۵ متر در ۴ متر میشه ۲۲ مترمربع.»): the fixed step stores its calculation only :: ' + JSON.stringify(s1 && s1.f));
    const u = R.calls.map(c => String(c.user)).filter(t => /برگردیم به پارکت. کنارِ هر حسابِ من/.test(t.split('# نوبتِ تازه').pop())).pop() || R.calls[R.calls.length - 1].user;
    chk(!/«۲۲ ÷ ۷ ≈ ۳ روز» \(اصلاح شد/.test(String(u)), 'D30-1: the next prompt never tells the coach step 2 became «۲۲ ÷ ۷ ≈ ۳ روز»');
    /* شبیه‌های همان سناریو (C136): بازحسابِ واقعیِ گامِ ۲ با ۲۲ هنوز می‌نشیند؛ همان حساب از زبانِ داداش نه */
    const t1 = await R.turn('داداشم حساب کرد ۲۲ × ۱٫۱۲ = ۲۴٫۶۴ مترمربع.', { reply: 'حسابِ برادرت را دیدم.', actions: [cs({ said: ['result'], result: '۲۲ × ۱٫۱۲ = ۲۴٫۶۴ مترمربع' })] });
    const L1 = await LED(R), s2b = liveLed(L1)[0].steps[1];
    chk(!/۲۴٫۶۴/.test(s2b.f), 'C136 look-alike: «داداشم حساب کرد ۲۲ × ۱٫۱۲ = ۲۴٫۶۴» (another person\'s work) never becomes her step 2 «به دستِ خودش» :: ' + JSON.stringify(s2b));
    const t2 = await R.turn('گامِ ۲ رو با ۲۲ دوباره حساب کردم: ۲۲ × ۱٫۱۲ = ۲۴٫۶۴ مترمربع.', { reply: 'درست است.', actions: [cs({ said: ['result'], result: '۲۲ × ۱٫۱۲ = ۲۴٫۶۴ مترمربع' })] });
    const L2 = await LED(R), s2c = liveLed(L2)[0].steps[1];
    chk(/۲۲ × ۱٫۱۲ = ۲۴٫۶۴/.test(s2c.f) && !s2c.stale && s2c.by === 'her', 'C136 positive: her own redo «۲۲ × ۱٫۱۲ = ۲۴٫۶۴» still fixes stale step 2 (her own words) :: ' + JSON.stringify(s2c));
    chk(!/دوباره حساب کردم:/.test(s2c.f), 'A30-22: the redo stores its calculation, not her lead-in «گامِ ۲ رو با ۲۲ دوباره حساب کردم:» :: ' + s2c.f);
  });
  // own look-alike without the other person: «۲۲ ÷ ۷ ≈ ۳ روز» alone is still not a redo of step 2
  await rp('D_tD1', 48, async (R) => {
    await R.turn('خودم حساب کردم کار ۲۲ ÷ ۷ ≈ ۳ روز طول می‌کشه.', { reply: 'درست است.', actions: [cs({ said: ['result'], result: '۲۲ ÷ ۷ ≈ ۳ روز' })] });
    const L = await LED(R), s2 = liveLed(L)[0].steps[1];
    chk(!/۲۲ ÷ ۷/.test(s2.f) && s2.stale, 'C136 look-alike (her own «۲۲ ÷ ۷ ≈ ۳ روز», no اوستا): a different calculation that only uses ۲۲ is not step 2\'s redo :: ' + JSON.stringify(s2));
  }, 'D_tD1_own');

  // ===== D30-2 — tD3 s21 «برگردیم به روپوش‌ها. گامِ ۳ رو درست کنم: ۶ × ۷ = ۴۲، پس از ۵۰ تا ۸ تا می‌مونه.» =====
  await rp('D_tD3', 21, async (R) => {
    const L = await LED(R), s3 = liveLed(L)[0].steps[2];
    chk(s3 && s3.f === '۶ × ۷ = ۴۲، پس از ۵۰ تا ۸ تا می‌مونه.' && s3.v === 'ok', 'D30-2 (tD3 s21): step 3 stores «۶ × ۷ = ۴۲، پس از ۵۰ تا ۸ تا می‌مونه.» — not «برگردیم به روپوش‌ها. گامِ ۳ رو درست کنم: …» :: ' + JSON.stringify(s3));
  });
  // ===== A30-22 — pwA2 p6–p11 «آهان اون ۲ تا رو هم باید یه روز دیگه بخونم. پس ۳ روز! ۵ و ۵ و ۲ میشه ۱۲.» =====
  await rp('A_pwA2', 13, async (R) => {
    const L = await LED(R), s4 = Object.values(L)[0].steps[3];
    chk(s4 && /^پس ۳ روز! ۵ و ۵ و ۲ میشه ۱۲/.test(s4.f) && !/اون ۲ تا رو هم/.test(s4.f), 'A30-22 (pwA2): the fixed step 4 stores its calculation «پس ۳ روز! ۵ و ۵ و ۲ میشه ۱۲», not the whole message :: ' + JSON.stringify(s4));
  });

  // ===== A30-21 — pwA1 p21: a second problem with three numbered steps, the model sends no prior ⇒ the page builds its own ledger =====
  await rp('A_pwA1', 130, async (R) => {
    const L = await LED(R), K = Object.keys(L).filter(k => L[k].steps.some(x => /3\^n/.test(x.q)));
    chk(K.length === 1, 'A30-21 (pwA1 p21 «یه مسئلهٔ دیگه دارم: ثابت کن 3^n − 1 همیشه زوجه … گام ۱ … گام ۲ … گام ۳ …»): the second problem gets its own ledger without a model prior :: ' + JSON.stringify(Object.keys(L)));
    const P = K.length ? L[K[0]] : null;
    chk(P && P.steps.length === 3 && P.steps.every(x => x.page30), 'A30-21: three page-built steps (her own «گام N:») :: ' + JSON.stringify(P && P.steps));
    chk(P && P.steps[0].v === 'unchecked' && P.steps[1].v === 'unchecked' && P.steps[2].v === 'ok', 'A30-21: verdicts only what the page can check — step 1 (non-numeric) and step 2 («فرد منهای ۱ زوجه، مثلاً …») «نسنجیده»; step 3 «۳³ − ۱ = ۲۶ هم زوجه» ✓ :: ' + JSON.stringify(P && P.steps.map(x => x.v)));
    chk(!Object.keys(L).filter(k => /^L:/.test(k)).some(k => L[k].steps.some(x => /3\^n/.test(x.q))), 'A30-21: the closed first problem\'s ledger gets none of these steps');
  });
  // ===== B30·D14 — nB3 p18: «یه مسئله‌ی جدا: چیدمانِ میزها … خودم حساب کردم: ۱۲ ÷ ۲ = ۶ … پس ۶ × ۳ = ۱۸ میز.» =====
  await rp('B_nB3', 16, async (R) => {
    const L = await LED(R), K = Object.keys(L).filter(k => L[k].steps.some(x => /۱۲ ÷ ۲ = ۶/.test(x.q)));
    chk(K.length === 1, 'B30·D14 (nB3 p18): the second problem\'s worked steps make its own ledger without a model prior :: ' + JSON.stringify(Object.keys(L)));
    const P = K.length ? L[K[0]] : null;
    chk(P && P.steps.length >= 4 && P.steps.every(x => x.v === 'ok'), 'B30·D14: each worked calculation is a step, all ✓ by the page\'s own engine (credit) :: ' + JSON.stringify(P && P.steps.map(x => [x.q, x.v])));
    chk(P && !P.steps.some(x => /^خودم حساب کردم/.test(x.q)), 'B30·D14: the lead-in «خودم حساب کردم:» is not part of a step quote :: ' + JSON.stringify(P && P.steps.map(x => x.q)));
    chk(!Object.keys(L).filter(k => k !== K[0]).some(k => L[k].steps.some(x => /میز جا میشه|۶ × ۳ = ۱۸/.test(x.q))), 'B30·D14: the party ledger (first problem) gets none of these steps');
  });

  // ===== C27-3 — s28 p4 «… فهرست کردم … ⇒ ۱۳/۲۷. فکر کنم درسته»: her verdict on her own enumeration is not a guess =====
  await rp('C_s28', 18, async (R) => {
    const o = await R.p.evaluate(() => { const s = APP.ASSIST.cur(), C = s.coach || {}; return { g: C.guess ? C.guess.text : '', gs: (C.guesses || []).map(g => g.text), mg: (s.msgs || []).filter(m => m.guess).map(m => m.guess.text) }; });
    chk(!/۱۳\/۲۷/.test(o.g) && !o.gs.some(t => /۱۳\/۲۷/.test(t)) && !o.mg.some(t => /۱۳\/۲۷/.test(t)), 'C27-3 (s28 p4): «⇒ ۱۳/۲۷. فکر کنم درسته» after her own «فهرست کردم …» is not registered as a guess (no «حدس (از گفت‌وگو)», no «تأیید شد», no calibration) :: ' + JSON.stringify(o));
    const it = await R.p.evaluate(() => { const T = (APP.ASSIST.cur().coach || {}).story || {}, o = []; Object.keys(T).forEach(k => (T[k].items || []).forEach(x => o.push(x.k + '|' + x.t))); return o; });
    chk(it.some(t => /^res\|.*۱۳\/۲۷/.test(t)), 'C27-3: the same result stays in her 📜 as her own result (not dropped) :: ' + it.join(' ¦ ').slice(0, 500));
  });

  // ===== C30-11 (F11, prior side) — s29 p11 «یه باغچهٔ دیگه هم دارم که مستطیله … حساب کردم: √(۱۵² + ۸²) ≈ ۱۷ متر.» =====
  await rp('C_s29', 131, async (R) => {
    const L = await LED(R), lv = Object.keys(L).filter(k => /^L:/.test(k));
    chk(!lv.some(k => L[k].steps.some(x => /√\(۱۵² \+ ۸²\)/.test(x.q))), 'C30-11 (s29 p11): another garden\'s work never becomes a step of the live problem\'s ledger :: ' + lv.map(k => JSON.stringify(L[k].steps.map(x => x.q))).join(' | ').slice(0, 600));
  });

  // ===== units (C136 look-alikes for the new predicates, from the runners' corpora) =====
  if (want('units')) try { const p = await b.newPage(); await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.goto(FILE); await p.waitForSelector('.nav');
    const span = await p.evaluate(() => [
      ['نه، ۲۷٫۵ نیست. منظورم طول بود: ۵٫۵ متر در ۴ متر میشه ۲۲ مترمربع.', '۵٫۵ متر در ۴ متر میشه ۲۲ مترمربع.'],
      ['برگردیم به روپوش‌ها. گامِ ۳ رو درست کنم: ۶ × ۷ = ۴۲، پس از ۵۰ تا ۸ تا می‌مونه.', '۶ × ۷ = ۴۲، پس از ۵۰ تا ۸ تا می‌مونه.'],
      ['دکمه: ۶ × ۸ = ۴۸ دکمه', 'دکمه: ۶ × ۸ = ۴۸ دکمه'],
      ['با ۱۲ درصد پرت، ۲۰ × ۱٫۱۲ = ۲۲٫۴ مترمربع پارکت لازمه', 'با ۱۲ درصد پرت، ۲۰ × ۱٫۱۲ = ۲۲٫۴ مترمربع پارکت لازمه'],
      ['جمع ۱۸٫۷ + ۳ = ۲۱٫۷ میلیون؛ پس‌اندازم ۱۸ میلیونه، پس ۳ میلیون و ۷۰۰ کم دارم', 'جمع ۱۸٫۷ + ۳ = ۲۱٫۷ میلیون؛ پس‌اندازم ۱۸ میلیونه، پس ۳ میلیون و ۷۰۰ کم دارم'],
      ['گام ۱: لژاندر، توانِ ۲ در n! = [n/2] + [n/4] + … تا 2^K ≤ n', 'گام ۱: لژاندر، توانِ ۲ در n! = [n/2] + [n/4] + … تا 2^K ≤ n'],
      ['چون جمع فقط تا 2^K ≤ n میره، n/2 + n/4 + … + n/2^K = n(1 − 1/2^K) که اکیداً از n کمتره', 'چون جمع فقط تا 2^K ≤ n میره، n/2 + n/4 + … + n/2^K = n(1 − 1/2^K) که اکیداً از n کمتره'],
      ['3^n فرده چون حاصل‌ضربِ فردهاست', '3^n فرده چون حاصل‌ضربِ فردهاست']].map(([t, w]) => [t, w, APP.STORY.priorCalcSpan30(t)]));
    span.forEach(([t, w, g]) => chk(g === w, 'A30-22 unit calcSpan30 «' + t + '» ⇒ «' + w + '» :: got «' + g + '»'));
    const sv = await p.evaluate(() => [
      ['جلسه دوم: نسخه‌ی سه‌شنبه رو آوردم. این بار با احتیاط: فهرست کردم ۱۴×۱۴ حالت، با حداقل یه پسرِ سه‌شنبه ۲۷ حالت، دوپسر ۱۳ تا ⇒ ۱۳/۲۷. فکر کنم درسته.', '⇒ ۱۳/۲۷. فکر کنم درسته', true],
      ['حساب کردم ۱۲ تا میشه، فکر کنم جوابِ کل ۵۰ باشه، درسته', 'جوابِ کل ۵۰ باشه، درسته', false],
      ['همین که گفتم! دو بچه، یکی پسره، اون یکی یا پسره یا دختر، پس ۱/۲. فکر کنم درسته', 'پس ۱/۲. فکر کنم درسته', false],
      ['فکر کنم ۱/۲ درسته', '۱/۲ درسته', false]].map(([u, g, w]) => [u, w, APP.ASSIST.selfVerdict30(u, g)]));
    sv.forEach(([u, w, g]) => chk(g === w, 'C27-3 unit selfVerdict30 «' + u.slice(0, 60) + '» ⇒ ' + w + ' :: got ' + g));
    const op = await p.evaluate(() => { const pid = APP.liveCreate('بزرگ‌ترین باغچهٔ چهارضلعی', 'با ۴۴ متر لبهٔ سنگی بزرگ‌ترین باغچهٔ چهارضلعی چه شکلی است؟', 'find', { by: 'user' }).p.id;
      return [['سلام. یه باغچهٔ دیگه هم دارم که مستطیله، ۱۵ در ۸ متر. می‌خوام یه مسیرِ اریب از یه گوشه به گوشهٔ روبه‌رو بکشم. حساب کردم: √(۱۵² + ۸²) ≈ ۱۷ متر.', true],
        ['یه گامِ دیگه هم رفتم: مربع ۱۱ در ۱۱ میشه ۱۲۱.', false], ['یه حسابِ دیگه هم کردم: ۱۱ × ۱۱ = ۱۲۱', false],
        ['یه سؤالِ دیگه دربارهٔ همین باغچه دارم: لبهٔ سنگی ۴۴ متره یا ۴۰؟', false]].map(([t, w]) => [t, w, APP.STORY.priorOtherProb30({ coach: {} }, t, pid)]); });
    op.forEach(([t, w, g]) => chk(g === w, 'C30-11 unit otherProb30 «' + t.slice(0, 60) + '» ⇒ ' + w + ' :: got ' + g));
    ran.push('units'); await p.close(); } catch (e) { errors.push('units — exception: ' + String(e && e.message || e).split('\n')[0]); }

  await b.close();
  console.log('ran: ' + ran.join(', '));
  if (errors.length) { console.log('FAIL ' + errors.length); errors.forEach(e => console.log(' - ' + e)); process.exit(1); }
  console.log('PASS test_tour1_r30_prior');
})();
