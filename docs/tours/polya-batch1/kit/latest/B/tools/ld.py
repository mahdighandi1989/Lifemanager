import json,sys,re,difflib
s,k=sys.argv[1],sys.argv[2]
def g(d):
  o=json.load(open(f'{d}/out/s{k}.json'))
  t=str(o.get('error') or '')+str(o.get('eval0') or '')+str(o.get('eval') or '')
  t=re.sub(r'pb_[a-z]_[a-z0-9]+','PB',t); t=re.sub(r'(dl|cd|lk|rv)_[a-z0-9]+','ID',t); t=re.sub(r'20\d\d-\d\d-\d\d(T[\d:.]+Z)?','D',t)
  return re.split(r'\n| \| ',t)
for l in difflib.unified_diff(g('../round17B/'+s),g(s),lineterm='',n=0):
  if not l.startswith(('---','+++','@@')): print(l[:500])
