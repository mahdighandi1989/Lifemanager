import json,glob,re,sys
D=sys.argv[1]
fs=sorted(glob.glob(D+'/ctl/c*.json'),key=lambda x:int(re.sub(r'\D','',x.split('/')[-1])))
W=int(sys.argv[2]) if len(sys.argv)>2 else 160
for f in fs:
  c=json.load(open(f)); k=f.split('/')[-1][:-5]
  if 'say' in c: print(k,'SAY',c['say'][:W*2], c.get('eval0','')[:40])
  elif 'exit' in c: print(k,'EXIT')
  elif 'click' in c or 'fill' in c: print(k,'UI',json.dumps(c,ensure_ascii=False)[:W])
  else: print(k,'EVAL',(c.get('eval') or '')[:W].replace('\n',' '))
