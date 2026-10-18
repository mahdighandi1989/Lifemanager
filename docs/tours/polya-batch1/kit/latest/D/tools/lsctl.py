import json,glob,sys,os,re
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/'
s=sys.argv[1]; R=sys.argv[2] if len(sys.argv)>2 else 'round20D'
S=B+R+'/'+s
ev=[];num=lambda f:int(re.findall(r'\d+',os.path.basename(f))[0])
for f in glob.glob(S+'/ctl/c*.json'): ev.append((os.path.getmtime(f),'C',num(f)))
for f in glob.glob(S+'/ai/p*.json'): ev.append((os.path.getmtime(f),'P',num(f)))
ev.sort(); mp={}; cur=None
for t,k,n in ev:
    if k=='C': cur=n; mp[n]=[]
    elif k=='P' and cur: mp[cur].append(n)
for k in range(1,len(glob.glob(S+'/ctl/c*.json'))+1):
    c=json.load(open(f'{S}/ctl/c{k}.json'))
    if c.get('say'): t='SAY '+c['say']
    elif c.get('exit'): t='EXIT'
    else: t=(c.get('eval') or c.get('eval0') or json.dumps(c,ensure_ascii=False))[-int(os.environ.get('W','160')):]
    print(k, mp.get(k), t.replace('\n',' ')[:int(os.environ.get('W','160'))+10])
