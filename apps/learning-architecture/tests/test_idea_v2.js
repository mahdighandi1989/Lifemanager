// «💡 جایگاهِ ایده» — ممیزیِ ۲۰۲۶-۱۰-۱۵ (A1–A5). ایده همان‌گونه ساخته می‌شود که دستیار می‌سازد (AS.DO.idea_*، با سشنِ حرفِ کاربر)؛
// پرونده‌ها، حکم، نتیجهٔ واقعی، نقد، جوابِ نقد، انتخابِ تصدیق و «🌱» همه با کنترل‌های واقعیِ صفحه؛ گذرِ روز با جابه‌جاییِ ساعتِ مرورگر.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
const W = ms => new Promise(r => setTimeout(r, ms));
const DAY = 86400000;
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const chk = (c, m) => { if (!c) errors.push(m); };
  async function page(offsetMs) {
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    await p.route('**/fonts.googleapis.com/**', r => r.abort());
    if (offsetMs) await p.addInitScript(`(function(){const D=Date;const off=${offsetMs};class FD extends D{constructor(...a){if(a.length)super(...a);else super(D.now()+off);} static now(){return D.now()+off;}};window.Date=FD;})()`);
    await p.goto(FILE); await p.waitForSelector('.nav'); await p.evaluate(() => { APP.S.loaded = true; });
    return p;
  }
  let p = await page(0);
  const U = {};
  U.newCase = async (title, input) => { await p.evaluate(() => APP.go('e_home')); await W(250);
    await p.fill('#ncT', title); await p.fill('#ncI', input);
    await p.locator('main button.btn.mt', { hasText: 'ورود به کارخانه' }).click(); await W(350);
    return p.evaluate(() => APP.state.arg); };
  U.st = async (cid, st) => { await p.evaluate(([i, s]) => APP.go('e_case', i, s), [cid, st]); await W(300); };
  U.rows = async (k, n) => { for (let i = 0; i < 20; i++) { const c = await p.locator(`main [data-k="${k}"] tbody tr`).count(); if (c >= n) return; await p.locator(`main [data-k="${k}"] button`, { hasText: '+ ردیف' }).click(); await W(120); } };
  U.cell = (k, i, sel) => p.locator(`main [data-k="${k}"] tbody tr`).nth(i).locator(sel);
  U.claims = async (cid, txts) => { await U.st(cid, 'st_tasdiq'); await U.rows('claims', txts.length);
    for (let i = 0; i < txts.length; i++) await U.cell('claims', i, 'textarea').first().fill(txts[i]); await W(450); };
  U.route = async (cid, ways) => { await U.st(cid, 'st_route'); await U.rows('ways', ways.length);
    for (let i = 0; i < ways.length; i++) { await U.cell('ways', i, 'select').nth(0).selectOption(String(ways[i][0])); await U.cell('ways', i, 'select').nth(1).selectOption(ways[i][1]); } await W(450); };
  U.sel = async (k, v) => { await p.locator(`main [data-k="${k}"] select`).first().selectOption(v); await W(250); };
  U.type = async (k, v) => { const el = p.locator(`main [data-k="${k}"] input`).first(); await el.fill(v); await W(450); };
  // «حکم نهایی» کامل و «ثبت» (پرونده به حکم می‌رسد)
  U.final = async (cid, rows) => { await U.st(cid, 'st_final'); await U.rows('final', rows.length);
    for (let i = 0; i < rows.length; i++) { await U.cell('final', i, 'select').nth(0).selectOption(String(rows[i][0])); await U.cell('final', i, 'input').first().fill(String(rows[i][1])); }
    await p.locator('main [data-k="conclusion"] textarea').fill('حکمِ من همین درجه‌هاست.');
    await U.sel('act', 'تحقیق بیشتر پیش از هر اقدام'); await U.sel('verdict', 'پرونده باز می‌ماند: منتظر قرینه یا تحقیق');
    await p.locator('main button.btn', { hasText: /^ثبت و/ }).first().click(); await W(500);
    chk(await p.evaluate(i => !!(APP.S.get(i).st.st_final || {}).done, cid), 'setup: st_final was saved as done through its own button'); };
  U.idea = async (iid) => { await p.evaluate(i => APP.go('idea', i), iid); await W(400); };
  U.grades = () => p.evaluate(() => [...document.querySelectorAll('main .idea-assumption li')].map(li => (li.querySelector('.idea-grade') || {}).textContent || ''));
  U.standing = () => p.evaluate(() => (document.querySelector('main .idea-standing') || {}).innerText || '');

  // ---------- ایده از حرفِ کاربر (همان کارهای دستیار) ----------
  const made = await p.evaluate(() => {
    const AS = APP.ASSIST, S = APP.S;
    const s = { id: 'ach_idea2', type: 'achat', msgs: [{ role: 'user', text: 'می‌خواهم برای ساختمانمان اشتراکِ هفتگیِ نانِ تازه راه بیندازم؛ همسایه‌ها حتماً پول می‌دهند چون همه از صفِ نانوایی خسته‌اند.' }] };
    S.put(s); AS._turnSession = s; const R = {};
    R.new_ = AS.DO.idea_new({ what: s.msgs[0].text }); R.id = s.idea;
    R.fab = AS.DO.idea_add({ part: 'strength', t: 'سودِ ماهانهٔ ۵۰ میلیون', ev: 'کاربر گفت سودش ماهی ۵۰ میلیون است' });
    R.ok = AS.DO.idea_add({ part: 'strength', t: 'دردِ واقعی: صفِ نانوایی', ev: 'همه از صف نانوایی خسته‌اند' });
    AS.DO.idea_add({ part: 'assumption', t: 'همسایه‌ها پول می‌دهند' });
    AS.DO.idea_add({ part: 'assumption', t: 'نانوایی هر هفته تحویل می‌دهد' });
    AS.DO.idea_add({ part: 'assumption', t: 'عددِ وارداتی' });
    const r = S.get(s.idea); R.ev = r.parts.filter(x => x.k === 'strength').map(x => x.evSt);
    return R;
  });
  info.made = made; const iid = made.id;
  // A2: شاهدِ ساختگی ⇒ «تأییدنشده» با یادداشت به دستیار؛ نقلِ واقعی ⇒ «کاربر»
  chk(made.fab !== '' && made.ok === '' && made.ev[0] === 'unconfirmed' && made.ev[1] === 'user', 'A2: a strength whose evidence is not in the user\'s messages stays «unconfirmed» (note to the assistant); a real quote passes: ' + JSON.stringify(made));

  // ---------- A1: پرونده با دو تصدیق؛ سقفِ موتور برای همان تصدیق؛ نه سطرِ اولِ حکم ----------
  const c1 = await U.newCase('همسایه‌ها پول می‌دهند', 'دو همسایه گفتند «چه خوب»؛ پس همه پول می‌دهند.');
  await U.claims(c1, ['بیشترِ همسایه‌ها برای اشتراکِ نان پول می‌دهند', 'دو همسایه گفتند چه خوب']);
  await U.route(c1, [[1, 'عقل'], [2, 'حس']]);
  await U.st(c1, 'st_aql'); await U.sel('c', '1'); await U.sel('form', 'استقرائی (از جزئی به کلی)'); await U.type('conseq_n', '۱'); await U.sel('conseq_new', 'تازه (پیش از پیش‌بینی دانسته نبود)');
  await U.final(c1, [[2, '۱۰۰'], [1, '۹۵']]);
  const c2 = await U.newCase('نانوایی تحویل می‌دهد', 'نانوا گفت هر هفته می‌آورم.');
  await U.claims(c2, ['نانوایی هر هفته تحویل می‌دهد']); await U.route(c2, [[1, 'حس']]); await U.final(c2, [[1, '۱۰۰']]);
  info.links = await p.evaluate(([iid, c1, c2]) => { const DO = APP.ASSIST.DO, r = APP.S.get(iid), ai = t => r.parts.findIndex(x => x.t === t);
    return { a1: DO.idea_link({ id: iid, i: ai('همسایه‌ها پول می‌دهند'), rec: c1 }), bad: DO.idea_link({ id: iid, i: ai('نانوایی هر هفته تحویل می‌دهد'), rec: c2, claim: 3 }), a2: DO.idea_link({ id: iid, i: ai('نانوایی هر هفته تحویل می‌دهد'), rec: c2 }) }; }, [iid, c1, c2]);
  chk(/۲|2/.test(info.links.a1) && /claim/.test(info.links.a1) && info.links.bad !== '' && info.links.a2 === '', 'A1: linking an assumption to a 2-claim case asks which claim; an out-of-range claim is refused: ' + JSON.stringify(info.links));
  await U.idea(iid);
  let g = await U.grades();
  chk(/شک \(½\)/.test(g[0]) && /کدام/.test(g[0]) && await p.locator('#ideaClaim_2').count() === 1, 'A1: ambiguous claim ⇒ ½ and a labelled claim picker: ' + JSON.stringify(g));
  await p.selectOption('#ideaClaim_2', '1'); await W(400);
  g = await U.grades(); let st = await U.standing();
  info.g1 = g; info.st1 = st;
  chk(/۶۶٫۷٪/.test(g[0]) && /سقفِ موتورِ قطعی/.test(g[0]) && !/۱۰۰٪/.test(g[0]), 'A1: grade = min(engine ceiling 66.7 for THAT claim, own 95) — not the first final row (100): ' + g[0]);
  chk(/۹۹٫۹٪/.test(g[1]) && /T_below1/.test(g[1]), 'A1: own 100 on a sense report (no demonstration) ⇒ «کمتر از یقین» 99.9: ' + g[1]);
  chk(!/یقین \(۱۰۰٪\)/.test(st) && /شک \(درست ½\) \(۵۰٪\)/.test(st) && /عددِ وارداتی/.test(st), 'A1: idea standing never «یقین (۱۰۰٪)»; it is the weakest assumption (here the still-unlinked one, ½): ' + st);

  // ---------- A3: درجهٔ ناعددی/فارسی/کسری در دادهٔ ذخیره‌شده (واردات یا نوشتهٔ دستیار) — بی TypeError ----------
  const c3 = await U.newCase('عددِ وارداتی', 'واردات.');
  await U.claims(c3, ['عددِ وارداتی درست است']);
  await p.evaluate(([iid, c3]) => { const S = APP.S, c = S.get(c3); c.st.st_final = { done: true, data: { final: [{ c: '1', p: '۹۰' }] } }; S.put(c);
    const r = S.get(iid); APP.ASSIST.DO.idea_link({ id: iid, i: r.parts.findIndex(x => x.t === 'عددِ وارداتی'), rec: c3 }); }, [iid, c3]);
  await U.idea(iid); g = await U.grades();
  chk(/۹۰٪/.test(g[2]), 'A3: a Persian-digit string grade «۹۰» is read (no TypeError): ' + g[2]);
  info.a3 = await p.evaluate(c3 => { const S = APP.S, c = S.get(c3), out = {};
    c.st.st_final.data.final[0].p = 'نود'; S.put(c); out.nan = APP.IDEA.standing(S.get('ach_idea2').idea ? S.get(S.get('ach_idea2').idea) : null);
    c.st.st_final.data.final[0].p = 0.5; S.put(c); out.half = APP.IDEA.degOf(0.5).p; out.frac = APP.IDEA.degOf(0.5, true).p;
    c.st.st_final.data.final[0].p = '۹۰'; S.put(c); return { nanOk: out.nan && typeof out.nan.cap === 'number', half: out.half, frac: out.frac }; }, c3);
  chk(info.a3.nanOk && info.a3.half === 0.5 && info.a3.frac === 50, 'A3: non-numeric grade ⇒ no crash; 0.5 in a percent column is 0.5%, fraction only when declared: ' + JSON.stringify(info.a3));

  // ---------- A4 + A1(۴): نقد ⇒ «زیرِ نقد» (حداکثر ½) تا جواب با شاهد؛ «فرضی که هنوز ننوشته‌ام» فرض می‌سازد ----------
  await U.idea(iid);
  await p.fill('#ideaCritT', 'نانوا تابستان تعطیل می‌کند'); await p.selectOption('#ideaCritA', '1'); await p.fill('#ideaCritC', 'نانوایی دوم'); await p.click('main .idea-critsave'); await W(400);
  g = await U.grades();
  chk(/زیرِ نقد/.test(g[1]) && /شک \(½\)/.test(g[1]) && await p.locator('main .idea-crit .chip', { hasText: 'زیرِ نقد' }).count() === 1, 'A1(4): an open critique caps its assumption at ½ («زیرِ نقد»): ' + g[1]);
  const nA0 = await p.evaluate(i => APP.S.get(i).parts.filter(x => x.k === 'assumption').length, iid);
  await p.fill('#ideaCritT', 'بیشترِ همسایه‌ها صبح‌ها خانه نیستند'); await p.selectOption('#ideaCritA', 'new');
  chk(await p.locator('#ideaCritNew').isVisible(), 'A4: «فرضی که هنوز ننوشته‌ام» opens a labelled field for the new assumption');
  await p.click('main .idea-critsave'); await W(300);
  chk(await p.evaluate(i => APP.S.get(i).crits.length, iid) === 1, 'A4: a «new» critique without the assumption text is not saved');
  await p.fill('#ideaCritNew', 'همسایه‌ها وقتِ تحویل گرفتن دارند'); await p.fill('#ideaCritC', 'زمانِ تحویل'); await p.click('main .idea-critsave'); await W(400);
  info.a4 = await p.evaluate(i => { const r = APP.S.get(i); return { nA: r.parts.filter(x => x.k === 'assumption').length, last: r.crits[r.crits.length - 1] }; }, iid);
  chk(info.a4.nA === nA0 + 1 && info.a4.last.made && info.a4.last.pi != null, 'A4: the critique creates the assumption it targets: ' + JSON.stringify(info.a4));
  // جوابِ نقدِ نخست با شاهد ⇒ دیگر «زیرِ نقد» نیست
  await p.fill('#ideaCritAns_0', 'نانوا گفت تابستان هم باز است و نامه داد'); await p.click('main .idea-critrow >> nth=0 >> .idea-critanssave'); await W(400);
  g = await U.grades();
  chk(!/زیرِ نقد/.test(g[1]) && /۹۹٫۹٪/.test(g[1]), 'A1(4): answering the critique with evidence lifts the ½: ' + g[1]);

  // «🌱» ثبت می‌کند کدام نقد/فرض را می‌آزماید
  const will = p.locator('main .sv-will').first();
  info.willIntro = await will.innerText();
  chk(/بیشترِ همسایه‌ها صبح‌ها خانه نیستند/.test(info.willIntro), 'A4: the 🌱 card names the open critique it should test');
  await will.getByLabel('چقدر می‌خواهی این را پیش ببری؟').selectOption('want');
  await will.getByLabel('امید داری که راهی هست؟').selectOption('yes');
  await will.getByLabel(/کوچک‌ترین گامِ بعد/).fill('فردا ۲۰ دقیقه از سه همسایه بپرسم چه ساعتی خانه‌اند');
  await will.getByLabel(/کِی، چند دقیقه/).fill('فردا ساعتِ ۷ عصر، ۲۰ دقیقه');
  await will.locator('.sv-willsave').click(); await W(400);
  info.step = await p.evaluate(i => (APP.S.get(i).will || {}).steps, iid);
  chk(info.step && info.step[0] && info.step[0].tests && /صبح‌ها خانه نیستند/.test(info.step[0].tests.t) && /وقتِ تحویل/.test(info.step[0].tests.target), 'A4: the step records which critique/assumption it tests: ' + JSON.stringify(info.step));

  // ---------- A1(۲): نتیجهٔ واقعیِ «نادرست» ⇒ فرض رد شد، جایگاه ۰ ----------
  await U.st(c1, 'st_final'); await p.selectOption('main select[aria-label="نتیجه ادعای 1"]', 'نادرست'); await W(400);
  await U.idea(iid); g = await U.grades(); st = await U.standing();
  chk(/رد شد با مشاهده/.test(g[0]) && await p.locator('main .idea-refuted').count() === 1 && /سقفِ اعتبارِ ایده: ۰/.test(st), 'A1(2): outcome «نادرست» on the linked claim ⇒ refuted (0), clearly worded: ' + g[0] + ' | ' + st);
  // A2: تأییدِ کاربر روی قوتِ تأییدنشده (data-own)
  chk(await p.locator('main .idea-evask[data-own] .chip', { hasText: 'از دستیار — تأییدِ تو لازم' }).count() === 1, 'A2: unconfirmed strength shows «از دستیار — تأییدِ تو لازم» inside a data-own block');
  await p.click('main .idea-evno'); await W(300);
  chk(await p.evaluate(i => APP.S.get(i).parts.find(x => x.k === 'strength').evSt, iid) === 'rejected' && await p.locator('main .idea-evrej').count() === 1, 'A2: the user can disown fabricated evidence (kept, struck out)');
  // قلّابِ پرامپت
  info.hook = await p.evaluate(iid => { const AS = APP.ASSIST, s = APP.S.get('ach_idea2'); return AS.promptHooks.map(f => { try { return f(s, '') || ''; } catch (e) { return 'ERR ' + e.message; } }).join('\n'); }, iid);
  chk(/سقفِ اعتبار: 0٪/.test(info.hook) && /با مشاهده رد شد/.test(info.hook) && /تأییدنشده|کاربر رد کرد/.test(info.hook) && !/ERR/.test(info.hook), 'A1/A2: the assistant sees the refuted standing and the evidence status');

  // ---------- A4: «نه / ترس» بی گامِ تازه ⇒ بازپرسی با همان نردبان ----------
  await p.close(); p = await page(DAY + 3600000);
  await U.idea(iid);
  const chkCard = p.locator('main .sv-willchk').first();
  chk(await chkCard.count() === 1, 'A4 setup: day+1 shows the check card');
  await chkCard.getByLabel('انجامش دادی؟').selectOption('no');
  await chkCard.getByLabel('چه چیزی جلویت را گرفت؟').selectOption('fear');
  await chkCard.getByLabel(/غرق در کار بودی یا پراکنده/).selectOption('none');
  await chkCard.locator('.sv-willchkgo').click(); await W(400);
  info.reask = await p.evaluate(i => APP.S.get(i).will.reask, iid);
  chk(info.reask && info.reask.block === 'fear' && info.reask.due, 'A4: «نه/ترس» schedules a re-ask: ' + JSON.stringify(info.reask));
  await p.close(); p = await page(5 * DAY + 3600000);
  info.due = await p.evaluate(() => APP.dueList().map(x => x.txt).join(' | '));
  chk(/دوباره می‌پرسم/.test(info.due), 'A4: the re-ask is due in «امروز» on the ladder (+3 days): ' + info.due);
  await U.idea(iid);
  chk(await p.locator('main .sv-willreask').count() === 1, 'A4: the will card re-asks after a «no» with no new step');

  // ---------- A5: قلّابِ پرامپت ----------
  info.a5 = await p.evaluate(() => {
    const AS = APP.ASSIST, hk = msg => AS.promptHooks.map(f => { try { return f({ msgs: [] }, msg) || ''; } catch (e) { return ''; } }).join('\n'), on = m => /به ایده نمره نده/.test(hk(m));
    return { no: ['دیروز در جلسه مطرح کردم که خوابم کم است', 'محصولات لبنی را کم کرده‌ام', 'برنامه‌ای که دکتر داد را اجرا نکردم', 'طرحِ درسِ فردا را ننوشته‌ام'].map(on),
      yes: ['یک فکری به سرم زده: کارگاهِ تعمیرِ دوچرخه در محله راه بیندازم', 'می‌خواهم یک کانالِ یوتیوب دربارهٔ آشپزی بزنم', 'یک فکری دارم', 'یه ایده دارم'].map(on) };
  });
  chk(info.a5.no.every(x => !x) && info.a5.yes.every(Boolean), 'A5: idea prompt hook fires on ideas only: ' + JSON.stringify(info.a5));

  console.log(JSON.stringify(info).slice(0, 4000));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
