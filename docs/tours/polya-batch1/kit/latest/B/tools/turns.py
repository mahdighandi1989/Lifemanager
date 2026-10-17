import json,re,sys,os
B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round17B'
for s in sys.argv[1:]:
  d=f'{B}/{s}/ai'; ps=sorted(int(f[1:-5]) for f in os.listdir(d) if re.match(r'p\d+\.json$',f))
  print('########',s)
  for n in ps:
    p=json.load(open(f'{d}/p{n}.json')); u=p['user']; i=u.rfind('# نوبتِ تازه'); um=u[i+13:].strip() if i>=0 else u[-300:]
    r=open(f'{d}/r{n}.txt').read() if os.path.exists(f'{d}/r{n}.txt') else ''
    try: acts=json.loads(r).get('actions',[])
    except Exception: acts='NONJSON'
    print(f'p{n} [{p.get("task")}] USER: {um[:600]}')
    print('   ACTS:',json.dumps(acts,ensure_ascii=False)[:700])
