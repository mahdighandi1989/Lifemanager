// ev.js 'js' — fresh profile (temp), evaluate js on the dist page, print result
const { chromium } = require('/home/user/Lifemanager/apps/learning-architecture/node_modules/playwright');
const fs=require('fs');
(async()=>{const js=process.argv[2];const b=await chromium.launch();const p=await b.newPage();
await p.route('**/fonts.googleapis.com/**',r=>r.abort());
await p.goto('file:///home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html'); await p.waitForSelector('.nav');
await p.evaluate(()=>{APP.S.loaded=true;APP.render()});
try{console.log(await p.evaluate(js))}catch(e){console.log('ERR',e.message)} await b.close();})();
