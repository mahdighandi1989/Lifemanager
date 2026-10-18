#!/usr/bin/env python3
# mkplan23.py sid birth — plan = all round22D ctls, with the age card filled right after the first «say»
import sys,json,glob,re
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,birth=sys.argv[1],sys.argv[2]
S=B+'/round22D/'+s
N=len(glob.glob(S+'/ctl/c*.json'))
plan=[];done=False
JS="(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<20&&!document.querySelector('.age-in');i++)await w(300);const i=document.querySelector('.age-in');if(!i)return 'NO age card';i.scrollIntoView({block:'center'});i.value='%s';i.dispatchEvent(new Event('input',{bubbles:true}));await w(150);const b=[...i.parentElement.querySelectorAll('button')].find(x=>x.textContent.trim()==='ثبت');b.click();await w(500);return 'birth='+APP.AGE.birth()+' age='+APP.AGE.age()+' band='+(APP.AGE.band(APP.AGE.age())||{}).id})()"%birth
for k in range(1,N+1):
    plan.append({'src':k})
    c=json.load(open(f'{S}/ctl/c{k}.json'))
    if not done and c.get('say'):
        plan.append({'new':{'eval':JS},'tag':'birth'}); done=True
json.dump(plan,open(f'{B}/round23D/{s}.plan.json','w'),ensure_ascii=False,indent=0)
print(s,N,'items',len(plan))
