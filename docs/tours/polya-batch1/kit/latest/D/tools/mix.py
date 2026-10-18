# mix.py sid — plan = round23D src ctls 1..N with replacements from <sid>.mix.py: R={k:[items]} (item {'src':k} keeps it); STOP=k ends before src k with exit
import sys,json,os,glob; sys.path.insert(0,os.path.dirname(__file__)); from mkins import *
s=sys.argv[1]; B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/'
R4=B+'round24D/'; N=len(glob.glob(B+'round23D/'+os.environ.get('SRCSID',s)+'/ctl/c*.json'))
g={}; exec(open(R4+s+'.mix.py').read(),globals(),g); Rp=g.get('R',{}); stop=g.get('STOP')
P=[]
for k in range(1,N+1):
    if stop and k>=stop: P.append({'exit':True}); break
    P+= Rp.get(k,[{'src':k}])
json.dump(P,open(R4+s+'.plan.json','w'),ensure_ascii=False,indent=0); print(s,len(P),'items')
