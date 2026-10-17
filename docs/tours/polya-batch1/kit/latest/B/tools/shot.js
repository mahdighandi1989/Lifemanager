// shot.js <profile> <out.png> <selector> [nth]
const { chromium } = require('/home/user/Lifemanager/apps/learning-architecture/node_modules/playwright');
(async()=>{const ctx=await chromium.launchPersistentContext(process.argv[2],{viewport:{width:1360,height:900}});const p=ctx.pages()[0]||await ctx.newPage();
await p.goto('file:///home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html');await p.waitForSelector('.nav');
await p.evaluate(()=>{const pn=document.querySelector('.as-panel');if(!pn||pn.hidden)APP.ASSIST.toggle(true);});await p.waitForTimeout(1500);
const n=await p.evaluate(([sel,k])=>{const L=[...document.querySelectorAll(sel)];const e=L[k==null?L.length-1:+k];if(e){e.scrollIntoView({block:'center'});}return L.length;},[process.argv[4],process.argv[5]]);
await p.waitForTimeout(800);await p.screenshot({path:process.argv[3]});console.log('found',n);await ctx.close();})();
