import json,sys,os,re
s=sys.argv[1]; d=f'{s}/ai'
ps=sorted(int(f[1:-5]) for f in os.listdir(d) if re.match(r'p\d+\.json',f))
for n in ps:
  u=json.load(open(f'{d}/p{n}.json'))['user']; i=u.rfind('# نوبتِ تازه')
  um=u[i+13:].strip().split('\n')[0] if i>=0 else u[-300:]
  r=open(f'{d}/r{n}.txt').read() if os.path.exists(f'{d}/r{n}.txt') else ''
  try: j=json.loads(r); rep=j.get('reply',''); acts=[a.get('do') or a.get('type') for a in j.get('actions',[])]
  except Exception: rep=r[:600]; acts=[]
  pg=re.search(r'# صفحهٔ فعلی[^\n]*\n([^\n]*)',u)
  print(f'--- p{n} [{pg.group(1)[:80] if pg else ""}]\nUSER: {um[:500]}\nASST: {rep[:900]}\nACTS: {acts}')
