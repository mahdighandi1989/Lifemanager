# qscan.py file... : list every non-context line in hook blocks that asks a question (بپرس / ends with ؟ / «…؟»)
import json,re,sys
CTX='زمینه (نه پرسشِ دوم)'
SKIP=('# نقشهٔ سامانه','# صفحهٔ فعلی','# گفت‌وگو','# نوبتِ تازه')
for f in sys.argv[1:]:
  d=json.load(open(f))
  if d.get('task')!='lla_assistant': continue
  u=d['user']; out=[]
  for p in re.split(r'(?m)^(?=# )',u):
    hd=p.split('\n',1)[0]
    if hd.startswith(SKIP): continue
    for l in p.split('\n')[1:]:
      s=l.strip()
      if not s or CTX in s[:45] or s.startswith(('- حلی که در همین','- پرسش‌های «')): continue
      q = re.search(r'بپرس(?!د)',s) or s.rstrip('.» ').endswith('؟') or re.search(r'«[^»]*؟»',s)
      if q: out.append((hd[:40], s))
  print('##',f.split('round18B/')[-1],len(out))
  for h,s in out: print('   [%s] %s'%(h,s[:int(__import__('os').environ.get('W','300'))]))
