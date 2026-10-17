#!/usr/bin/env python3
# ins.py sid spec.json — build round19D/src/<sid> = round19D/<sid> ctl (+ai) with extra ctls inserted; spec: {"before":{"k":[ctl,...]},"after":{"k":[ctl,...]}}
import sys,json,os,shutil,glob,re
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
s=sys.argv[1]; sp=json.load(open(sys.argv[2]))
S=f'{B}/round20D/{s}'; D=f'{B}/round20D/src/{s}'
shutil.rmtree(D,ignore_errors=True); os.makedirs(D+'/ctl'); shutil.copytree(S+'/ai',D+'/ai')
N=len(glob.glob(S+'/ctl/c*.json')); out=[]
for k in range(1,N+1):
    out+= sp.get('before',{}).get(str(k),[])
    out.append(json.load(open(f'{S}/ctl/c{k}.json')))
    out+= sp.get('after',{}).get(str(k),[])
for i,c in enumerate(out,1): json.dump(c,open(f'{D}/ctl/c{i}.json','w'),ensure_ascii=False)
print(s,'ctl',N,'->',len(out))
