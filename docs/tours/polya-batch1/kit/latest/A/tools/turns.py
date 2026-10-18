import json,sys,os,re
R=sys.argv[1]; s=sys.argv[2]
D=f'{R}/{s}/ai'
ns=sorted(int(m.group(1)) for f in os.listdir(D) for m in [re.match(r'p(\d+)\.json',f)] if m)
for n in ns:
    p=json.load(open(f'{D}/p{n}.json')); u=p['user']; i=u.find('# نوبتِ تازه')
    t=u[i+13:i+13+260].replace('\n',' ') if i>=0 else '(no turn) '+u[:100].replace('\n',' ')
    r=open(f'{D}/r{n}.txt').read() if os.path.exists(f'{D}/r{n}.txt') else ''
    try: a=json.loads(r); acts=[x.get('do') for x in a.get('actions',[])]
    except: acts='?'
    print(f'p{n} [{p.get("task")}] {t[:230]} || {acts}')
