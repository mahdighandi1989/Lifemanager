(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const S=[
"ن۱ + ن۲ = نک یعنی ۰٫۱×۲۰ + ۰٫۲۵×ح = ۰٫۱۵(۲۰+ح)؛ پس ۲ + ۰٫۲۵ح = ۳ + ۰٫۱۵ح ⇒ ۰٫۱ح = ۱ ⇒ ح = ۱۰",
"دو طرف رو به توان دو رسوندم: ع+۶ = ع² ⇒ ع² − ع − ۶ = ۰ ⇒ ع = ۳ یا ع = −۲",
"رادیکال(ع+۶) = ع",
"sqrt(x+6) = x  =>  x+6 = x^2  =>  x^2 - x - 6 = 0",
"با سه تا ۱۰/۳ میشه (۱۰/۳)^۳ حدود ۳۷، با چهار تا ۲.۵^۴ حدود ۳۹",
"با n جزء مساوی حاصل‌ضرب (10/n)^n میشه؛ لگاریتمش n·ln(10/n) بیشینه‌اش وقتیه که 10/n=e یعنی n≈3.7",
"حاصل‌ضرب (10/n)^(n/2) میشه، بیشینه وقتی 10/n=e",
"پس حجم = ۲ × (۱/۳ × ab/2 × a/2) = a²b/6!",
"۱۸۰n − (n−۲)×۱۸۰ = ۳۶۰",
"۲۰ لیتر آب‌نمک ۱۰٪ داریم. چند لیتر آب‌نمک ۲۵٪ اضافه کنیم تا ۱۵٪ بشه؟",
"مدخل گندم: ۲۴ = ۸ × ۳. بر ۸: سه رقم آخر ۳۵y بر ۸ ⇒ y=۲ (۳۵۲)"];
APP.go("e_prob",null,"live");await w(900);const out=[];
for(const s of S){__setf("lpNewS",s);await w(350);const e=document.getElementById("lpNewS");let pv=e&&e.parentElement&&e.parentElement.querySelector(".mx-prev");if(!pv&&e){let n=e.nextElementSibling;while(n&&!pv){if(n.classList&&n.classList.contains("mx-prev"))pv=n;n=n.nextElementSibling}}if(!pv)pv=document.querySelector("#main .mx-prev");
out.push({s:s.slice(0,40),vis:!!(pv&&pv.offsetParent!==null&&getComputedStyle(pv).display!=="none"),n:pv?pv.querySelectorAll("math").length:-1,src:pv?[...pv.querySelectorAll("bdi.mx")].map(b=>b.dataset.src):[]})}
__setf("lpNewS",S[5]);await w(400);return JSON.stringify(out)})()
