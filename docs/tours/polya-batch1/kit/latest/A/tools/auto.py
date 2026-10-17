#!/usr/bin/env python3
# auto.py SID : continue replay from pos+1; auto-answer AI prompts whose key blocks equal round8's; stop otherwise and print diff
import sys,os,json,re,subprocess,difflib
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
R9=T+'/round15A'; R8=T+'/round14A'; sid=sys.argv[1]; D=R9+'/'+sid
PID=re.compile(r'pb_l_[a-z0-9]{8,}')
KEYS=('# مسئلهٔ زنده','# مربیِ حل','# پس از شکست','# مسئلهٔ حل‌شده','# نوبتِ تازه','# مسئلهٔ واقعیِ')
def blocks(f):
    p=json.load(open(f)); u=p['user']; out=[]; inb=False
    for l in u.split('\n'):
        if l.startswith('# '): inb=l.startswith(KEYS)
        if inb:
            l=PID.sub('PID',l); l=re.sub(r'احتمالِ ضعیف‌ترین بودن [۰-۹]+٪','P%',l); l=re.sub(r'\([۰-۹]+ نمونه\)|[۰-۹]+ نمونه','N',l)
            out.append(l)
    return p.get('task'),out
CTX='زمینه (نه پرسشِ دوم): '
def strip(b): return [l.replace(CTX,'') for l in b]
def pending():
    import glob
    for f in sorted(os.listdir(D+'/ai'),key=lambda x:int(re.sub(r'\D','',x) or 0)):
        m=re.match(r'^p(\d+)\.json$',f)
        if m and not os.path.exists(D+'/ai/r%s.txt'%m.group(1)): return int(m.group(1))
def handle():
    while True:
        n=pending()
        if not n: return True
        f8=R8+'/'+sid+'/ai/p%d.json'%n
        if not os.path.exists(f8): print('NO R8 p%d'%n); return False
        t9,b9=blocks(D+'/ai/p%d.json'%n); t8,b8=blocks(f8)
        if t9==t8 and b9!=b8 and strip(b9)==strip(b8):
            print('CTXONLY p%d: '%n+' | '.join(l[:90] for l in b9 if CTX in l and l.replace(CTX,'') not in b8))
        if t9==t8 and strip(b9)==strip(b8):
            r=subprocess.run(['bash',R9+'/tools/ra.sh',sid,str(n)],capture_output=True,text=True,timeout=1200)
            print('auto-answered p%d'%n, 'ERR' if r.returncode else '', r.stdout[-300:] if r.returncode else '')
            if r.returncode: return False
            continue
        print('##### DIFF p%d (task %s vs %s)'%(n,t9,t8))
        for l in difflib.unified_diff(b8,b9,'r8','r9',n=0,lineterm=''): print(l[:900])
        return False
pos=int(open(D+'/pos').read()) if os.path.exists(D+'/pos') else 0
if not handle(): sys.exit(1)
i=pos+1
while True:
    if not os.path.exists(R8+'/'+sid+'/ctl/c%d.json'%i): print('END'); break
    r=subprocess.run(['python3',R9+'/tools/run.py',sid,str(i),str(i)],capture_output=True,text=True,timeout=1800)
    o=r.stdout
    if 'skip exit' in o or 'END at' in o: print('END'); break
    if 'cannot map' in o: print(o[-800:]); sys.exit(1)
    print('c%d: '%i + (re.search(r'EVAL: (.*)',o).group(1)[:300] if re.search(r'EVAL: (.*)',o) else o.split('\n')[0][:200]))
    open(D+'/pos','w').write(str(i))
    if not handle(): sys.exit(1)
    i+=1
