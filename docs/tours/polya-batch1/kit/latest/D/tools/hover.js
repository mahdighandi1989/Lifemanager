// hover.js DIR id tag — route view of id (live pid or session id); hover one point of each kind; screenshot each with the tooltip
const { chromium } = require('/home/user/Lifemanager/apps/learning-architecture/node_modules/playwright');
const path=require('path'),fs=require('fs');
(async()=>{const [D,id,tag]=process.argv.slice(2);
const ctx=await chromium.launchPersistentContext(path.join(D,'profile'),{viewport:{width:1360,height:900}});
const p=ctx.pages()[0]||await ctx.newPage(); await p.route('**/fonts.googleapis.com/**',r=>r.abort());
await p.goto('file:///home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html'); await p.waitForSelector('.nav');
await p.evaluate(()=>{APP.S.loaded=true;APP.HOST=Object.assign(APP.HOST||{},{ai:async()=>'{"reply":"-","actions":[]}',remind:async()=>({ok:true}),unremind:async()=>({ok:true})});APP.render()});
await p.waitForTimeout(600); try{await p.evaluate(()=>APP.ASSIST.toggle(false))}catch(e){}
await p.evaluate((id)=>APP.go('route',id),id); await p.waitForTimeout(1500);
const out=[];
for(const k of ['rt-origin','rt-p-main','rt-p-det','rt-p-rejoin','rt-p-back','rt-dest']){
  const els=await p.$$('.rt-pt.'+k); if(!els.length){out.push(k+': none');continue}
  const el=els[Math.min(1,els.length-1)]; await el.scrollIntoViewIfNeeded(); await el.hover(); await p.waitForTimeout(500);
  const tip=await p.evaluate(()=>{const t=document.querySelector('.rt-tip');return t&&!t.hidden?t.innerText:'(no tip)'});
  out.push(k+' ('+els.length+'): '+tip.replace(/\n/g,' | '));
  await p.screenshot({path:path.join(D,'out','part_route_hover_'+tag+'_'+k+'.png')});
}
fs.writeFileSync(path.join(D,'out','part_route_hover_'+tag+'.txt'),out.join('\n')); console.log(out.join('\n')); await ctx.close();})();
