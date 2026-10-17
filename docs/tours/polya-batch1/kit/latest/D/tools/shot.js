// shot.js DIR name 'js expr that navigates (may return text)' [fullPage=1] — reopen the scenario profile (harness must be stopped) and take a settled full-page shot
const { chromium } = require('/home/user/Lifemanager/apps/learning-architecture/node_modules/playwright');
const path=require('path'),fs=require('fs');
(async()=>{const [D,name,js]=process.argv.slice(2);
const ctx=await chromium.launchPersistentContext(path.join(D,'profile'),{viewport:{width:1360,height:900}});
const p=ctx.pages()[0]||await ctx.newPage(); await p.route('**/fonts.googleapis.com/**',r=>r.abort());
await p.goto('file:///home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html'); await p.waitForSelector('.nav');
await p.evaluate(()=>{APP.S.loaded=true;APP.HOST=Object.assign(APP.HOST||{},{ai:async()=>'{"reply":"-","actions":[]}',remind:async()=>({ok:true}),unremind:async()=>({ok:true})});APP.render()});
await p.waitForTimeout(800); try{await p.evaluate(()=>APP.ASSIST.toggle(false))}catch(e){}
const r=await p.evaluate(js); await p.waitForTimeout(1200);
try{await p.evaluate(()=>document.fonts&&document.fonts.ready)}catch(e){}
await p.screenshot({path:path.join(D,'out',name+'.png'),fullPage:true});
if(r!=null) fs.writeFileSync(path.join(D,'out',name+'.txt'),String(r));
console.log('shot',name,String(r).slice(0,300)); await ctx.close();})();
