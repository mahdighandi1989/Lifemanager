# mapai.py sid — round21D ctl index -> round21 AI call numbers (mtime logic as drive22)
import sys,os,glob,re,json
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21D/'+sys.argv[1]
num=lambda f:int(re.findall(r'\d+',os.path.basename(f))[0])
ev=[]
for f in glob.glob(B+'/ctl/c*.json'): ev.append((os.path.getmtime(f),'C',num(f)))
for f in glob.glob(B+'/ai/p*.json'): ev.append((os.path.getmtime(f),'P',num(f)))
ev.sort(); cur=None; mp={}
for t,k,n in ev:
    if k=='C': cur=n; mp[n]=[]
    elif cur: mp[cur].append(n)
for k in sorted(mp):
    if mp[k]:
        c=json.load(open(f'{B}/ctl/c{k}.json')); print(k, mp[k], str(c.get('say') or c.get('eval') or '')[:70].replace('\n',' '))
