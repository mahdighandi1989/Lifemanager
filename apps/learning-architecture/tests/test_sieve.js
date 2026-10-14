// «🔍 غربالِ لایه‌ها» + «🧩 نقشهٔ پیش‌نیازها» + ایمیلِ بی کد (مالک ۲۰۲۶-۱۰-۱۴).
// غربال: لایه‌ها از ثبت‌گاه (هر ۱۲ خانوادهٔ گره از A.KF)؛ «پیدا شد» بی شاهد پذیرفته نمی‌شود؛ مدل وضعِ غربال و گره‌های پیشین را می‌بیند؛
// کشوی تور و ایمیل غربال را نشان می‌دهند؛ قاعدهٔ «هر جنبه یک وجه» جایش را به «ریشه» داده.
// پیش‌نیاز: نقشه ⇒ پیشنهادِ هوش (فقط پس از «بفرست») ⇒ سنجشِ خودِ کاربر ⇒ موضوعِ یادگیری ⇒ نشانه‌های وجهِ prereq از خودِ داده.
// ایمیل: هیچ کلیدِ وجه (f7)، کدِ خانواده (F8)، شناسهٔ حوزه/رکورد یا واژهٔ فنیِ برگه.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  await p.goto(FILE); await p.waitForSelector('.nav');

  info.sieve = await p.evaluate(async () => {
    APP.S.loaded = true; const AS = APP.ASSIST, out = {};
    window.__q = []; window.__calls = []; window.__mails = [];
    APP.callAI = async (sys, user) => { __calls.push({ sys, user }); return JSON.stringify(__q.shift()); };
    APP.HOST = { mail: async (r) => { __mails.push(r); return { status: 'sent' }; }, sheets: async () => [] };
    const L = AS.sieveLayers(); out.n = L.length; out.fams = L.filter(x => /^F\d+$/.test(x.id)).length;
    out.rules = /غربالِ لایه‌ها/.test(AS.SYS) && /نه سریع رد کن، نه پخش کن/.test(AS.SYS) && /دانشِ پیش‌نیاز/.test(AS.SYS) && !/هر جنبه‌ای که حرفِ کاربر دارد یک وجه شود/.test(AS.SYS);
    // گرهٔ پیشین ⇒ در پرامپت برای ریشهٔ مشترک
    APP.S.put({ id: 'kn_old', type: 'knot', name: 'برچسب را حکم گرفتن', fam: 'F11', status: 'practised' });
    const s = AS.newSession(); APP.S.put(s);
    __q.push({ reply: 'بیا لایه‌به‌لایه ببینیم.', status: 'related', title: 'خریدِ ماشین', memory: 'm', actions: [
      { do: 'tour_plan', goal: 'ریشهٔ دعواهای خرید', facets: [{ key: 'f1', kind: 'knot', title: 'واکنشِ داغ به برچسب' }, { key: 'f2', kind: 'prereq', title: 'دانشِ نبوده برای مقایسهٔ اقساط' }],
        diag: [{ id: 'F11', st: 'found', why: 'هر وقت می‌گه خسیسی، فکر می‌کنم راست می‌گه', facet: 'f1' }, { id: 'F7', st: 'found', why: '' }, { id: 'prereq', st: 'found', why: 'نمی‌دونم سودِ مرکب چطور حساب می‌شه', facet: 'f2' }, { id: 'outside', st: 'out', why: 'خودِ انتخابِ مدلِ ماشین' }, { id: 'nope', st: 'no' }] }] });
    await AS.send('می‌خوام ماشین بخرم ولی هر بار با همسرم سرش دعوامون می‌شه');
    const d = s.tour.diag || {};
    out.found = d.F11 && d.F11.st === 'found' && d.F11.facet === 'f1';
    out.noEvidence = d.F7 && d.F7.st === 'ask';                     // «پیدا شد» بی شاهد ⇒ «باید پرسید»
    out.prompt = /# گره‌های پیشینِ کاربر[\s\S]*برچسب را حکم گرفتن/.test(__calls[0].user) && /# غربالِ لایه‌ها/.test(AS.tourText(s)) && /سنجیده‌نشده:/.test(AS.tourText(s));
    out.unknown = /لایهٔ ناشناخته: nope/.test(JSON.stringify(s.msgs));
    // کشوی تور
    AS.paint && AS.paint(); const dr = AS.tourDrawer(s); out.drawer = /غربالِ لایه‌ها/.test(dr.textContent) && /پیدا شد/.test(dr.textContent);
    // نقشهٔ پیش‌نیازها برای وجهِ f2
    APP.go('prereq'); await new Promise(r => setTimeout(r, 120));
    document.getElementById('prT').value = 'مقایسهٔ اقساطِ دو وام'; document.getElementById('prS').value = 'نمی‌دانم کدام ارزان‌تر است';
    [...document.querySelectorAll('#main button')].find(x => /ساختنِ نقشه/.test(x.textContent)).click(); await new Promise(r => setTimeout(r, 120));
    const pq = APP.S.all('prereq')[0]; out.made = !!pq;
    AS._turnSession = s; AS.DO.tour_link({ facet: 'f2', id: pq.id });
    __calls.length = 0; __q.push([{ sci: 'ریاضی', sub: 'ریاضیِ مالی', concept: 'سودِ مرکب', why: 'گامِ اول: ارزشِ هر قسط', q: '۱۰۰ با سودِ ماهانهٔ ۲٪ پس از ۲ ماه؟', ref: '۱۰۴٫۰۴' }, { sci: 'ریاضی', sub: 'جبر', concept: 'دنبالهٔ هندسی', why: 'جمعِ اقساط', q: 'جمعِ ۱+۲+۴؟', ref: '۷' }]);
    [...document.querySelectorAll('#main button')].find(x => /پیشنهادِ پیش‌نیازها/.test(x.textContent)).click(); await new Promise(r => setTimeout(r, 120));
    out.gate = __calls.length === 0 && !!document.querySelector('.overlay.kn-ai');   // پیش از «بفرست» چیزی نمی‌رود
    [...document.querySelectorAll('.overlay.kn-ai button')].find(x => /^بفرست$/.test(x.textContent.trim())).click(); await new Promise(r => setTimeout(r, 200));
    const pq2 = APP.S.get(pq.id); out.items = pq2.items.length === 2 && pq2.items[0].by === 'ai' && /وارسی‌نشده/.test(document.getElementById('main').innerText);
    const f2 = s.tour.facets.find(f => f.key === 'f2'); const ms0 = AS.tourMilestones(f2).map(m => m.ok ? 1 : 0).join('');
    // سنجشِ خودِ کاربر ⇒ موضوع
    pq2.items[0].self = 'بلد نیستم'; pq2.items[1].self = 'بلدم'; APP.S.put(pq2); APP.go('prereq', pq.id); await new Promise(r => setTimeout(r, 120));
    out.refShown = /پاسخِ مرجع/.test(document.getElementById('main').innerText);
    [...document.querySelectorAll('#main button')].find(x => /موضوعِ یادگیری بساز/.test(x.textContent)).click(); await new Promise(r => setTimeout(r, 150));
    const pq3 = APP.S.get(pq.id), tp = APP.S.get(pq3.items[0].topic);
    out.topic = !!tp && /سودِ مرکب/.test(tp.title) && /ریاضیِ مالی/.test(tp.title);
    out.ms = ms0 + '>' + AS.tourMilestones(f2).map(m => m.ok ? 1 : 0).join('');
    out.today = APP.dueList().some(x => /پیش‌نیازهای/.test(x.txt)) === false;   // همه سنجیده ⇒ دیگر در «امروز» نیست
    out.nav = (APP.NAV || []).some(n => Array.isArray(n) && n[0] === 'prereq');
    // ایمیل بی کد
    s.msgs.push({ role: 'ai', text: 'وجهِ f2 و خانوادهٔ F11 و حوزهٔ dc_career_income و رکوردِ kc_abc123 و برگهٔ sys-territory deferred', at: '' });
    const rep = await APP.REPORT.build(s, [{ k: 'facet', fa: '✓ پایهٔ f1 برپا شد' }]);
    const all = rep.subject + rep.html + rep.text;
    out.noCodes = !/\bf\d{1,2}\b/.test(all) && !/\bF\d{1,2}\b/.test(all) && !/\b(?:dc|sc|sf|md|ln|pr)_[a-z_]+/.test(all) && !/kc_abc123/.test(all) && !/sys-territory|deferred/.test(all);
    out.humanized = /«برداشت و نتیجه‌گیری/.test(rep.html) && /قلمروِ سامانه‌ها/.test(rep.html) && /غربالِ لایه‌ها/.test(rep.html);
    return out;
  });
  const S = info.sieve;
  chk(S.fams === 12 && S.n >= 22, 'layers = base + all 12 knot families from the registry: ' + S.n + '/' + S.fams);
  chk(S.rules, 'root-first sieve rules replace "every aspect = a facet"');
  chk(S.found && S.noEvidence && S.unknown, '"found" needs the user\'s own words (else "ask"); unknown layer ids are reported');
  chk(S.prompt && S.drawer, 'the model sees prior knots and the sieve state; the drawer shows the sieve');
  chk(S.made && S.gate && S.items && S.refShown && S.topic, 'prerequisite map: AI only after «بفرست», marked unverified; user self-rates; missing ⇒ learning topic with science › branch');
  chk(/^10000>111/.test(S.ms), 'prereq facet milestones come from the map, the self-ratings and the topics: ' + S.ms);
  chk(S.today && S.nav, 'Today stops nagging once rated; menu entry');
  chk(S.noCodes && S.humanized, 'the e-mail carries no internal codes (facet keys, family codes, area/record ids, sheet jargon) — names instead');
  console.log(JSON.stringify(info).slice(0, 2500));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
