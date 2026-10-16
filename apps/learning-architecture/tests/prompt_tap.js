// شنودِ پرامپت (دورِ ۱۱ ِ تورِ پولیا، K1): با `node -r ./tests/prompt_tap.js tests/test_x.js` و LLA_PROMPT_TAP=<فایل> هر پرامپتی که صفحه به
// APP.callAI (همان مدلِ بدلیِ خودِ آزمون) می‌فرستد، یک سطرِ JSON در آن فایل می‌شود — آزمونِ ساختاری (test_tour1_r11_coach.js، بخشِ struct)
// همهٔ پرامپت‌های فیکسچرهای دورهای ۷ تا ۱۱ را از همین راه می‌خواند، نه از فهرستی دست‌چین. آزمون نیست (نامش test* نیست)؛ رفتارِ آزمونِ میزبان را عوض نمی‌کند.
const fs = require('fs');
const path = require('path');
const OUT = process.env.LLA_PROMPT_TAP;
if (OUT) {
  const pw = require(path.join(__dirname, '..', 'node_modules', 'playwright'));
  const NAME = path.basename(process.argv[1] || '?');
  const tapPage = async (p) => {
    try {
      await p.exposeFunction('__llaTapPrompt', (user) => { try { fs.appendFileSync(OUT, JSON.stringify({ t: NAME, user: String(user || '') }) + '\n'); } catch (e) { } });
      await p.addInitScript(() => {
        const wrap = (f) => { if (typeof f !== 'function' || f.__tap) return f; const g = function (sys, user) { try { window.__llaTapPrompt(String(user || '')); } catch (e) { } return f.apply(this, arguments); }; g.__tap = true; return g; };
        const iv = setInterval(() => {
          const A = window.APP; if (!A || A.__tapOn) return;
          let cur = wrap(A.callAI); A.__tapOn = true; clearInterval(iv);
          Object.defineProperty(A, 'callAI', { configurable: true, enumerable: true, get: () => cur, set: (v) => { cur = wrap(v); } });
        }, 5);
      });
    } catch (e) { }
    return p;
  };
  const wrapCtx = (c) => { const np = c.newPage.bind(c); c.newPage = async (...a) => tapPage(await np(...a)); return c; };
  const launch = pw.chromium.launch.bind(pw.chromium);
  pw.chromium.launch = async (...a) => {
    const b = await launch(...a);
    const nb = b.newPage.bind(b); b.newPage = async (...x) => tapPage(await nb(...x));
    const nc = b.newContext.bind(b); b.newContext = async (...x) => wrapCtx(await nc(...x));
    return b;
  };
}
