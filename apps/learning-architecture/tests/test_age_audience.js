// بستهٔ سن، بخشِ ۲ (docs/decisions/2026-10-18-age-and-user-scope.md بندهای ۳ و ۴):
// گروهِ سنی از تاریخِ تولد (هرگز عددِ ذخیره‌شده) ⇒ بلوکِ «# مخاطب» در پرامپتِ دستیار/مربی؛ کودک/نوجوان/بزرگسال/سالمند؛ سطرهای ایمنیِ کم‌سال؛
// بزرگسال بی بلوک (همان قاعدهٔ ضمیر)؛ منطقِ پولیا دست نمی‌خورد (بقیهٔ قلاب‌ها با و بی تاریخِ تولد یکی‌اند)؛ تاریخِ تولدِ نامعلوم ⇒ صفحه یک بار در سشن می‌پرسد.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const chk = (c, m) => { if (!c) errors.push(m); };
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'Asia/Tehran', locale: 'fa-IR' });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/fonts.gstatic.com/**', r => r.abort());
  await p.clock.install({ time: new Date('2026-10-18T10:00:00+03:30') });
  await p.goto(FILE); await p.waitForSelector('.nav');
  const r = await p.evaluate(async () => {
    APP.S.loaded = true; const AG = APP.AGE, out = {};
    out.api = !!AG && typeof AG.band === 'function' && typeof AG.audience === 'function' && typeof AG.age === 'function';
    if (!out.api) return out;
    const setB = d => { const st = APP.S.settings(); st.profile = st.profile || {}; if (d) st.profile.birth = d; else delete st.profile.birth; APP.S.saveSettings(st); };
    // گروه‌ها از مرزهای مستند (مرحله‌های مدرسه / CRC / WHO)، هر گروه با منبع
    out.bands = [[4, 'early'], [6, 'child'], [9, 'child'], [11, 'child'], [12, 'teen'], [17, 'teen'], [18, 'adult'], [37, 'adult'], [59, 'adult'], [60, 'elder'], [82, 'elder']].filter(([a, id]) => (AG.band(a) || {}).id !== id).map(x => x.join(':'));
    out.srcs = AG.BANDS.every(x => x.src && x.src.length > 20);
    out.nullBand = AG.band(null) === null;
    // سن همیشه از تاریخ: ۸ مارس ۱۹۸۹ ⇒ ۳۷ در ۲۰۲۶-۱۰-۱۸
    setB('1989-03-08'); out.age37 = AG.age() === 37 && APP.PSY.age() === 37;
    setB('2017-10-19'); out.ageBday = AG.age() === 8;   // فردا تولدِ نُه‌سالگی
    const hooks = (msg) => APP.ASSIST.promptHooks.map(f => { try { return f({ msgs: [{ role: 'user', text: msg || 'سلام' }] }, msg || 'سلام') || ''; } catch (e) { return ''; } });
    const all = msg => hooks(msg).filter(Boolean).join('\n\n');
    const blk = () => { const t = all('یک مسئله دارم'); const i = t.indexOf('# مخاطب'); return i < 0 ? '' : t.slice(i).split(/\n\n# /)[0]; };
    // کودک (۸ ساله)
    const child = blk(); out.child = child;
    out.childOk = /^# مخاطب/.test(child) && /دبستان/.test(child) && /جمله‌های کوتاه/.test(child) && /مثال/.test(child) && /گام/.test(child) && /چاپلوسی/.test(child);
    out.childSafe = /دادهٔ شخصی/.test(child) && /بزرگسالانه/.test(child) && /(پدر|مادر|والد)/.test(child) && /معلم/.test(child);
    out.polyaSame = /منطقِ حل/.test(child);
    // نوجوان (۱۵)
    setB('2011-05-01'); const teen = blk(); out.teen = teen;
    out.teenOk = /نوجوان/.test(teen) && /دادهٔ شخصی/.test(teen) && /بزرگسالانه/.test(teen) && /(پدر|مادر|والد)/.test(teen) && !/دبستان/.test(teen);
    // سالمند (۷۲)
    setB('1954-01-10'); const eld = blk(); out.eld = eld;
    out.eldOk = /حوصله/.test(eld) && /گام‌های بزرگ‌تر/.test(eld) && /تسلط/.test(eld) && /(تحقیر|از بالا)/.test(eld) && !/دادهٔ شخصی/.test(eld);
    // بزرگسال (۳۷): بی بلوک — قاعدهٔ ضمیرِ موجود دست نمی‌خورد
    setB('1989-03-08'); const adultHooks = hooks('یک مسئله دارم'); out.adultNone = !adultHooks.join('\n').includes('# مخاطب');
    // منطقِ پولیا/تونل‌ها: هر قلابِ دیگر با سنِ کودک همان خروجیِ بزرگسال را دارد (فقط بلوکِ «# مخاطب» افزوده می‌شود)
    setB('2017-10-19'); const childHooks = hooks('یک مسئله دارم');
    out.onlyAdded = adultHooks.length === childHooks.length && childHooks.every((x, i) => x === adultHooks[i] || (adultHooks[i] === '' && /^# مخاطب/.test(x)));
    // تاریخِ تولدِ نامعلوم ⇒ بلوکِ کوتاهِ امن، مدل نمی‌پرسد (صفحه می‌پرسد)
    setB(''); const unk = blk(); out.unk = unk;
    out.unkOk = /نامعلوم/.test(unk) && /نپرس/.test(unk) && /دادهٔ شخصی/.test(unk);
    // نخستین نوبتِ مربی: کارتِ «تاریخِ دقیقِ تولد» با یک جملهٔ چرا، فقط یک بار در سشن تا داده شود، بی بستنِ کارِ دیگر
    const AS = APP.ASSIST; const s = AS.newSession(); s.msgs.push({ role: 'user', text: 'یک مسئله دارم', at: new Date().toISOString(), seq: 1 }); APP.S.put(s);
    const card = (AS.logHooks || []).map(f => { try { return f(s); } catch (e) { return null; } }).filter(Boolean).find(el => el.classList && el.classList.contains('age-ask'));
    out.card = !!card && !!card.querySelector('input[aria-label^="تاریخِ دقیقِ تولد"]') && /چرا|تا /.test(card.textContent) && /تاریخِ دقیقِ تولد/.test(card.textContent);
    out.cardWhy = !!card && card.querySelectorAll('.age-why').length === 1;
    // «بعداً» ⇒ در همین سشن دوباره نمی‌پرسد
    if (card) { [...card.querySelectorAll('button')].find(x => /بعداً/.test(x.textContent)).click(); }
    const again = (AS.logHooks || []).map(f => { try { return f(s); } catch (e) { return null; } }).filter(Boolean).some(el => el.classList && el.classList.contains('age-ask'));
    out.onceSess = !again;
    // سشنِ تازه ⇒ دوباره (تا داده شود)؛ پیش از نخستین نوبت نه
    const s2 = AS.newSession(); const pre = (AS.logHooks || []).map(f => { try { return f(s2); } catch (e) { return null; } }).filter(Boolean).some(el => el.classList && el.classList.contains('age-ask'));
    s2.msgs.push({ role: 'user', text: 'سلام', at: new Date().toISOString(), seq: 1 });
    const c2 = (AS.logHooks || []).map(f => { try { return f(s2); } catch (e) { return null; } }).filter(Boolean).find(el => el.classList && el.classList.contains('age-ask'));
    out.newSess = !pre && !!c2;
    // ثبت از کارت ⇒ سن از تاریخ؛ کارت دیگر نیست
    if (c2) { const inp = c2.querySelector('input[aria-label^="تاریخِ دقیقِ تولد"]'); inp.value = '۲۰۱۲/۲/۲'; inp.dispatchEvent(new Event('input', { bubbles: true })); [...c2.querySelectorAll('button')].find(x => /ثبت/.test(x.textContent)).click(); }
    out.saved = APP.S.settings().profile.birth === '2012-02-02' && AG.age() === 14;
    const after = (AS.logHooks || []).map(f => { try { return f(s2); } catch (e) { return null; } }).filter(Boolean).some(el => el.classList && el.classList.contains('age-ask'));
    out.gone = !after;
    // آینده/ناممکن رد می‌شود
    out.refuse = AG.setBirth('2999-01-01') !== '' && AG.setBirth('1850-01-01') !== '' && AG.setBirth('2001-02-30') !== '';
    return out;
  });
  const show = JSON.stringify(r, null, 1);
  chk(r.api, 'APP.AGE exists with band/audience/age: ' + show);
  if (r.api) {
    chk(!r.bands.length && r.srcs && r.nullBand, 'age bands follow the documented stage boundaries, each with a source: ' + JSON.stringify(r.bands));
    chk(r.age37 && r.ageBday, 'age is always computed from the date of birth (birthday not yet reached ⇒ one less)');
    chk(r.childOk && r.childSafe && r.polyaSame, 'child «# مخاطب» block: language level, short sentences, examples, small steps, no flattery, minors safety: ' + r.child);
    chk(r.teenOk, 'teen block with minors safety: ' + r.teen);
    chk(r.eldOk, 'elderly block: patience, larger steps only on mastery, no condescension: ' + r.eld);
    chk(r.adultNone, 'adult: no «# مخاطب» block (existing pronoun register rule unchanged)');
    chk(r.onlyAdded, 'Pólya logic/tunnels unchanged: every other prompt hook is identical for a child and an adult');
    chk(r.unkOk, 'unknown birth: short safe block, model told not to ask (the page asks): ' + r.unk);
    chk(r.card && r.cardWhy, 'first coaching turn without birth: a card asks the exact date with one sentence why');
    chk(r.onceSess && r.newSess, 'asked once per session (dismiss ⇒ not again in that session; a new session asks again after its first turn)');
    chk(r.saved && r.gone && r.refuse, 'saving from the card stores the date; card disappears; impossible dates refused');
  }
  await b.close();
  if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('NO ERRORS');
})().catch(e => { console.error(e); process.exit(1); });
