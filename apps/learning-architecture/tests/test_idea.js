// «💡 جایگاهِ ایده» (مالک ۲۰۲۶-۱۰-۱۵؛ کارزارِ v07): ایده خودش رکورد دارد — قوت با شاهد، فرض ⇐ پرونده، مسئلهٔ طراحی ⇐ مسئله؛
// جایگاه عدد نیست: سقفِ اعتبار = ضعیف‌ترین فرض (A1)، فرضِ سنجیده‌نشده = شک (½، A4).
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
  info.idea = await p.evaluate(async () => {
    APP.S.loaded = true; const S = APP.S, AS = APP.ASSIST, DO = AS.DO, out = {};
    const s = { id: 'ach_idea', type: 'achat', msgs: [{ role: 'user', text: 'سه شب پشت سر هم تصمیمم را مرور کردم و کمکم کرد؛ می‌خواهم برنامه‌اش را بسازم.' }] }; /* شاهدِ قوت باید از حرفِ خودِ کاربر باشد (ممیزیِ ۲۰۲۶-۱۰-۱۵ A2) */ S.put(s); AS._turnSession = s;
    out.needWhat = DO.idea_new({}) !== '';
    out.made = DO.idea_new({ what: 'برنامه‌ای که هر شب ۱۰ دقیقه دربارهٔ تصمیم‌ها حرف بزند و نشان دهد کجا خودم را گول زدم' }) === '' && !!s.idea;
    out.noEvStrength = DO.idea_add({ part: 'strength', t: 'از تجربهٔ خودم آمده' }) !== '';
    out.strength = DO.idea_add({ part: 'strength', t: 'از تجربهٔ خودم آمده', ev: 'سه شب پشت سر هم تصمیمم را مرور کردم و کمکم کرد' }) === '';
    DO.idea_add({ part: 'assumption', t: 'همه به آن نیاز دارند', test: 'حرف زدن با ۵ نفر' });
    DO.idea_add({ part: 'assumption', t: 'پولش را می‌دهند' });
    DO.idea_add({ part: 'problem', t: 'چطور در ۱۰ دقیقه خودفریبی سنجیده می‌شود؟' });
    DO.idea_add({ part: 'outside', t: 'قانون و حریمِ خصوصی' });
    const r = S.get(s.idea);
    // هیچ فرضی پرونده ندارد ⇒ شک (½)
    let st = APP.IDEA.standing(r); out.half = st.cap === 50 && st.open === 2;
    // یک فرض به پرونده با حکمِ ۳۰٪ ⇒ سقف ۳۰ (ضعیف‌ترین)
    S.put({ id: 'cs_idea', type: 'case', title: 'همه نیاز دارند', st: { st_final: { done: true, data: { final: [{ c: 'همه نیاز دارند', p: 30 }] } } } });
    out.linkBad = DO.idea_link({ i: 3, rec: 'cs_idea' }) !== '';      // مسئلهٔ طراحی به پرونده وصل نمی‌شود
    out.link = DO.idea_link({ i: 1, rec: 'cs_idea' }) === '';
    st = APP.IDEA.standing(S.get(s.idea)); out.weakest = st.cap === 30 && /همه به آن نیاز دارند/.test(st.weakest.t) && st.open === 1;
    S.put({ id: 'pb_idea', type: 'eprob', p: { id: 'pb_idea', title: 'سنجشِ خودفریبی' } });
    out.prob = DO.idea_link({ i: 3, rec: 'pb_idea' }) === '';
    APP.go('idea', s.idea); await new Promise(r => setTimeout(r, 200));
    const main = document.getElementById('main').innerText;
    out.view = /سقفِ اعتبارِ ایده/.test(main) && /وهم/.test(main) && /شاهد: «سه شب/.test(main) && /مسئلهٔ طراحی/.test(main) && /بیرون از این صفحه/.test(main) && !/نمره/.test(main.replace(/نمره (نده|ندارد)/g, ''));
    out.hook = AS.promptHooks.map(f => { try { return f(s, '') || ''; } catch (e) { return ''; } }).join('\n');
    out.hook = /# ایدهٔ این سشن/.test(out.hook) && /سقفِ اعتبار: 30٪/.test(out.hook);
    const hk = (ss, msg) => AS.promptHooks.map(f => { try { return f(ss, msg) || ''; } catch (e) { return ''; } }).join('\n');
    out.rules = /وجهِ problem/.test(hk(s, '')) && /به ایده نمره نده/.test(hk({ msgs: [] }, 'یه ایده دارم')) && !/به ایده نمره نده/.test(hk({ msgs: [] }, 'سلام'));
    out.graph = (() => { const M = APP.GRAPH.build(); return !!M.nodes['idea:' + s.idea]; })();
    return out;
  });
  chk(Object.values(info.idea).every(Boolean), 'idea record: strengths need the user\'s evidence, assumptions link to factory cases, design problems to the problem section; standing = weakest assumption (A1), untested = ½ (A4); no score: ' + JSON.stringify(info.idea));
  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
