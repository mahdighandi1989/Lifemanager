#!/usr/bin/env python3
# ov.py sid idx 'new say text' — replace the say of plan item idx (keeps the rest of the ctl); ov.py sid idx --ins '<json ctl>' inserts a new item BEFORE idx; --del removes
import sys,json
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s,i=sys.argv[1],int(sys.argv[2]); pf=f'{B}/round26D/{s}.plan.json'; plan=json.load(open(pf)); SRC=json.load(open(pf+'.src'))['src']
if sys.argv[3]=='--ins':
    for k,a in enumerate(sys.argv[4:]): plan.insert(i+k,{'new':json.loads(a),'tag':'new'})
elif sys.argv[3]=='--del': plan.pop(i)
else:
    it=plan[i]; c=json.load(open(f'{B}/round25D/{it.get("sid",SRC)}/ctl/c{it["src"]}.json')) if 'src' in it else it['new']
    open(f'{B}/round26D/{s}.adapt.log','a').write(f'[{i}] OLD: {c.get("say")}\n     NEW: {sys.argv[3]}\n')
    c['say']=sys.argv[3]; plan[i]={'new':c,'tag':'say*','was':it.get('src')}
json.dump(plan,open(pf,'w'),ensure_ascii=False); print('ok',len(plan))
