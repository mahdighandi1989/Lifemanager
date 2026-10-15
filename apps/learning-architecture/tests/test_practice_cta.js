// تمرینِ حرکت‌ها و شبیه‌ساز نباید خالی بماند (ممیزیِ پوشش ۲۰۲۶-۱۰-۱۵). تصمیمِ مالک (۲۰۲۶-۱۰-۱۵، «موافقم»): مسئله‌های کوتاهِ تمرینیِ خنثی
// **پیش‌فرض روشن**‌اند؛ قاعدهٔ پیشینِ مالک (نمونه‌های تاریخی/گمراه‌کننده پیش‌فرض پنهان، WORKLOG 21) برای نمونه‌های تاریخیِ سازنده سر جایش است.
// اگر کاربر در تنظیمات خاموششان کند، دکمهٔ «فهرست خالی است» برمی‌گردد و با یک کلیک روشن می‌کند؛ فهرستِ حرکت‌ها در پرامپتِ تجزیه از ثبت‌گاه.
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'dist', 'learning-architecture.html');
(async () => {
  const b = await chromium.launch(); const errors = []; const info = {};
  const p = await b.newPage(); p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await p.route('**/fonts.googleapis.com/**', r => r.abort());
  const chk = (c, m) => { if (!c) errors.push(m); };
  await p.goto(FILE); await p.waitForSelector('.nav');
  info.c = await p.evaluate(async () => {
    APP.S.loaded = true; const out = {};
    out.onByDefault = APP.practiceOn() && APP.probs().length === APP.practiceCount() && APP.probs().every(p => p.neutral === true);
    APP.go('e_prob'); await new Promise(r => setTimeout(r, 150)); out.noCtaByDefault = !document.querySelector('#main .practice-cta');
    const st = APP.S.settings(); st.practiceProbs = false; APP.S.saveSettings(st); out.hiddenWhenOff = APP.probs().length === 0;
    APP.go('e_prob'); await new Promise(r => setTimeout(r, 150)); out.ctaProb = !!document.querySelector('#main .practice-cta');
    APP.go('moves'); await new Promise(r => setTimeout(r, 150)); out.ctaMoves = !!document.querySelector('#main .practice-cta');
    document.querySelector('#main .practice-cta button').click(); await new Promise(r => setTimeout(r, 150));
    out.on = APP.probs().length === APP.practiceCount() && APP.practiceCount() >= 26 && APP.probs().every(p => p.neutral === true) && !document.querySelector('#main .practice-cta');
    const ps = APP.probSysText(); out.prompt = APP.MOVE_LIST.every(m => ps.indexOf(m.id) >= 0) && APP.MOVE_LIST.length >= 27;
    return out;
  });
  chk(Object.values(info.c).every(Boolean), 'practice problems: on by default (owner 2026-10-15), hidden only when turned off, then one-click enable from empty lists; parsing prompt lists every registry move: ' + JSON.stringify(info.c));
  console.log(JSON.stringify(info)); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO ERRORS'); if (errors.length) process.exitCode = 1;
  await b.close();
})();
