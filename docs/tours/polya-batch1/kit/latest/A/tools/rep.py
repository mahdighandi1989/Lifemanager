import sys,json,os,re
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya'
D=f'{T}/{sys.argv[2] if len(sys.argv)>2 else "round22A"}/{sys.argv[1]}'
n=1
while os.path.exists(f'{D}/ai/p{n}.json'):
    p=json.load(open(f'{D}/ai/p{n}.json'))
    r=open(f'{D}/ai/r{n}.txt').read() if os.path.exists(f'{D}/ai/r{n}.txt') else ''
    try: j=json.loads(r); rep=j.get('reply',''); acts=[a.get('do') for a in j.get('actions',[]) if isinstance(a,dict)]
    except Exception: rep=r[:300]; acts=[]
    u=p['user']; i=u.find('# نوبتِ تازه'); turn=u[i:i+250].replace('\n',' ') if i>=0 else ''
    m=re.search(r'# مسئلهٔ[^\n]*\n[^\n]*',u)
    print(f'p{n} [{p.get("task")}] acts={acts}\n  U: {turn}\n  M: {m.group(0)[:150].replace(chr(10)," ") if m else "-"}\n  A: {rep}\n')
    n+=1
