// «📐 سنجشِ استاندارد» (مالک ۲۰۲۶-۱۰-۱۵): هر عدد یک احتمال از A3+A4، بی‌برش و بی‌میانگینِ قراردادی؛ سازه‌ها از CHC و مدلِ عقلانیت؛
// مقایسه با مردم فقط با معماهای لنگردار (دشواریِ جمعیتی از منبع) و راش؛ سن از تاریخِ تولدِ خودِ کاربر؛ معما فقط با دستِ خودِ کاربر.
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

  info.math = await p.evaluate(() => {
    const P = APP.PSY, near = (a, b, e) => Math.abs(a - b) < (e || 0.01);
    return {
      next: near(P.next(0, 0), 0.5) && near(P.next(11, 18), 0.6) && near(P.next(3, 3), 0.8),
      sym: near(P.pGreater(5, 10, 5, 10), 0.5, 0.02),
      far: P.pGreater(9, 10, 1, 10) > 0.99 && P.pGreater(1, 10, 9, 10) < 0.01,
      below: near(P.pBelow(0, 0, 0.3), 0.3, 0.01),          // بی‌داده: توزیعِ یکنواخت (A4)
      b0: near(P.bFromP(0.5), 0, 0.02), bEasy: P.bFromP(0.85) < -1, bHard: P.bFromP(0.15) > 1
    };
  });
  chk(Object.values(info.math).every(Boolean), 'probabilities follow from A3+A4 (rule of succession, P(p1>p2), Rasch difficulty from population p): ' + JSON.stringify(info.math));

  info.ui = await p.evaluate(async () => {
    APP.S.loaded = true; const S = APP.S, P = APP.PSY;
    // معماهای لنگردارِ ساختگی برای آزمون (در فهرستِ واقعی فقط دادهٔ وارسی‌شده می‌آید)
    window.PSY_NORMS = { retrieved: '2026-10-15', sources: [{ id: 'src1', cite: 'Test source', n: 1000 }], items: [
      { id: 'g1', construct: 'Gf', text: 'کدام عدد بعدی است؟ ۲، ۴، ۸، …', options: ['۱۰', '۱۶', '۱۲'], answer: 1, p: 0.8, src: 'src1', age: { bands: [{ lo: 30, hi: 39, mu: -0.2, sd: 1 }] } },
      { id: 'g2', construct: 'Gf', text: 'دومی', options: ['الف', 'ب'], answer: 0, p: 0.3, src: 'src1' } ] };
    const out = {};
    out.noBirth = P.age() === null;
    out.birthRefused = APP.ASSIST.DO.birth({ date: '2999-01-01' }) !== '';
    out.birthOk = APP.ASSIST.DO.birth({ date: '1989-03-08' }) === '';
    const t = APP.today(), exp = (+t.slice(0, 4) - 1989) - (t.slice(5) < '03-08' ? 1 : 0);
    out.age = P.age() === exp;
    out.today = APP.dueList().some(x => /معمای امروز/.test(x.txt));
    APP.go('psy_item', 'g1'); await new Promise(r => setTimeout(r, 150));
    const own = [...document.querySelectorAll('#main .psy-q input, #main .psy-q button')];
    out.ownOnly = own.length >= 3 && own.every(x => x.getAttribute('data-own') === '1');
    document.querySelectorAll('#main input[type=radio]')[[...document.querySelectorAll('#main input[type=radio]')].findIndex(x => x.getAttribute('aria-label') === '۱۶')].click();
    const ci = document.querySelector('#main input[aria-label="درصدِ اطمینان"]'); ci.value = '90'; ci.dispatchEvent(new Event('input', { bubbles: true }));
    [...document.querySelectorAll('#main button')].find(x => /ثبتِ پاسخ/.test(x.textContent)).click();
    await new Promise(r => setTimeout(r, 200));
    const a = S.all('psyans'); out.saved = a.length === 1 && a[0].ok === true && a[0].conf === 90;
    out.todayGone = !APP.dueList().some(x => /معمای امروز/.test(x.txt));
    const pe = P.popEst('Gf'); out.pop = pe.n === 1 && pe.pAbove > 0.5 && pe.pAbove < 1 && pe.aged && /۳۰ تا ۳۹/.test(pe.peers);
    // بی دادهٔ سن‌به‌سن در منبع ⇒ کلِ نمونه با اعلامِ صریح
    S.put({ id: 'pa2', type: 'psyans', item: 'g2', ok: false, at: new Date().toISOString() });
    out.popUpd = P.popEst('Gf').n === 2;
    // نسخهٔ ۲: مقیاس‌ها جدا (هرگز روی هم نمی‌ریزند)، کفِ حدس ۱/k، معمای «دیده‌شده» در مقایسه شمرده نمی‌شود، گویهٔ توصیفی فقط درصدِ گروه
    window.PSY_NORMS.scales = [{ id: 'sA', construct: 'Gf', bands: [{ lo: 30, hi: 39, mu: 0.3, sd: 1.1, label: 'گروهِ آزمونیِ ۳۰ تا ۳۹' }] }, { id: 'sB', construct: 'Gf', bands: [{ all: true, mu: 0, sd: 1, label: 'کلِ نمونهٔ ب' }] }];
    window.PSY_NORMS.items.push({ id: 'a1', scale: 'sA', construct: 'Gf', text: 'الف', options: [{ t: 'x' }, { t: 'y' }, { t: 'z' }, { t: 'w' }], answer: 0, b: 0 },
      { id: 'b1', scale: 'sB', construct: 'Gf', text: 'ب', options: [{ t: 'x' }, { t: 'y' }], answer: 0, b: 1 },
      { id: 'd1', scale: 'sB', construct: 'RQ', kind: 'descriptive', text: 'توصیفی', options: [{ t: 'x' }, { t: 'y' }], answer: 1, p: 0.31, group: 'بزرگسالانِ ۳۰ تا ۴۹ سالهٔ نمونه' });
    S.put({ id: 'pa3', type: 'psyans', item: 'a1', ok: true, at: new Date().toISOString() });
    S.put({ id: 'pa4', type: 'psyans', item: 'b1', ok: true, at: new Date().toISOString(), familiar: true });
    const pg = P.popEst('Gf');
    out.scalesApart = pg.scales.length === 2 && pg.scales.some(s => s.scale === 'sA' && s.n === 1 && /گروهِ آزمونیِ/.test(s.peers));
    out.famOut = !pg.scales.some(s => s.scale === 'sB');
    // کفِ حدس: با ۴ گزینه، پاسخِ درست کمتر از ۲ گزینه‌ای خبر می‌دهد
    S.put({ id: 'pa5', type: 'psyans', item: 'b1', ok: true, at: new Date().toISOString() });
    out.guess = P.scaleEst('sA').theta < P.scaleEst('sB').theta + 1 && P.scaleEst('sA').sdTheta > 0;
    out.descNoTheta = !P.isAnchor(P.item('d1'));
    const yday = () => S.all('psyans').forEach(a => { a.at = APP.addDays(APP.today(), -1) + 'T12:00:00'; S.put(a); });   // روزی یک معما (بازبینیِ ۲۰۲۶-۱۰-۱۵، M2): پاسخ‌های پیشین به دیروز
    yday(); APP.go('psy_item', 'd1'); await new Promise(r => setTimeout(r, 120));
    document.querySelectorAll('#main .psy-q input[type=radio]')[1].click();
    let toastTxt = ''; const ot = APP.toast; APP.toast = m => { toastTxt = m; };
    [...document.querySelectorAll('#main button')].find(x => /ثبتِ پاسخ/.test(x.textContent)).click(); APP.toast = ot;
    out.descMsg = /۳۱٪ ِ بزرگسالانِ ۳۰ تا ۴۹ سالهٔ نمونه درست جواب دادند/.test(toastTxt);
    // زمانِ مرجع: پایانِ زمان ⇒ «وقت تمام شد»، نادرست
    window.PSY_NORMS.items.push({ id: 't1', scale: 'sA', construct: 'Gf', text: 'زمان‌دار', options: [{ t: 'x' }, { t: 'y' }], answer: 0, b: 0, time_limit_s: 1 });
    yday(); APP.go('psy_item', 't1'); await new Promise(r => setTimeout(r, 1500));
    const tr = S.all('psyans').find(a => a.item === 't1'); out.timeout = !!tr && tr.timeout === true && tr.ok === false;
    // کارنامه: بی «نمره/مرحله»؛ بخشِ استاندارد؛ ضریبِ کل ساخته نمی‌شود؛ سازه‌های سنجیده‌نشدنی صریح
    APP.go('mind'); await new Promise(r => setTimeout(r, 300));
    const main = document.getElementById('main').innerText, ths = [...document.querySelectorAll('#main th')].map(x => x.textContent);
    out.noBands = !ths.includes('نمره') && !ths.includes('مرحله') && !/ورزیده ·|در حالِ رشد|استوار/.test([...document.querySelectorAll('#main .mind-table td')].map(x => x.textContent).join(' '));
    out.sec = !!document.querySelector('#main .psy-sec') && /CHC/.test(main) && /ضریبِ هوشیِ کل: ساخته نمی‌شود/.test(main);
    out.none = /سنجیده نمی‌شود/.test(document.querySelector('#main .psy-table tr[data-c=Gwm]').textContent);
    out.popCell = /احتمالِ بالاتر بودن از میانهٔ/.test(document.querySelector('#main .psy-table tr[data-c=Gf]').textContent);
    out.radar = /احتمالِ درستیِ پاسخِ بعدی/.test(document.querySelector('#main .mind-svg').textContent);
    out.ageShown = /سن: /.test(document.querySelector('#main .psy-age').textContent);
    // دستیار جوابِ معما را نمی‌دهد (قاعده) و تاریخِ تولد را فقط از حرفِ کاربر ثبت می‌کند
    // قواعدِ این بخش فقط وقتی به کار است در پرامپت می‌آید (سقفِ ۲۰ هزار نویسهٔ پرامپتِ سامانه)
    const hk = (msg) => APP.ASSIST.promptHooks.map(f => { try { return f({ msgs: [] }, msg) || ''; } catch (e) { return ''; } }).join('\n');
    out.rule = /معمای امروز» را هرگز حل نکن/.test(hk('')) && /"do":"birth"/.test(hk('')) && !/معمای امروز» را هرگز حل نکن/.test(APP.ASSIST.SYS);
    APP.go('home'); await new Promise(r => setTimeout(r, 100));
    out.ruleOff = !/"do":"birth"/.test(hk('سلام')) && /"do":"birth"/.test(hk('من متولد ۱۹۸۹ هستم'));
    return out;
  });
  chk(Object.values(info.ui).every(Boolean), 'birth/age, daily anchor item answered only by the owner, Rasch comparison with age peers, mind card without conventional bands: ' + JSON.stringify(info.ui));

  console.log(JSON.stringify(info));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS');
  await b.close(); process.exit(errors.length ? 1 : 0);
})();
