const { chromium } = require('/home/user/Lifemanager/apps/learning-architecture/node_modules/playwright');
const fs=require('fs');
(async()=>{const ctx=await chromium.launchPersistentContext(process.argv[2],{});const p=ctx.pages()[0]||await ctx.newPage();
await p.goto('file:///home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html');await p.waitForSelector('.nav');
if(process.argv[4]) await p.evaluate(fs.readFileSync(process.argv[4],'utf8'));
const js=fs.readFileSync(process.argv[3],'utf8');const r=await p.evaluate(js);console.log(r);await ctx.close();})();
