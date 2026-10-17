import json,re,sys,glob,os,collections
dirs=sys.argv[1:]
files=[]
for d in dirs:
  files+=sorted(glob.glob(f'{d}/ai/p*.json'),key=lambda x:int(re.findall(r'p(\d+)\.json',x)[0]))
SKIPH=('# نقشهٔ سامانه','# دانسته‌های قلمرو','# صفحهٔ فعلی','# گفت‌وگو','# نوبتِ تازه','# امروز','# آنچه','# حافظه')
def blocks(u):
  for p in re.split(r'(?m)^(?=# )',u):
    hd=p.split('\n',1)[0]
    if hd.startswith(SKIPH) or not hd.startswith('# '): continue
    yield hd,[l for l in p.split('\n')[1:] if l.startswith('- ')]
freq=collections.Counter(); data=[]
for f in files:
  d=json.load(open(f))
  if d.get('task')!='lla_assistant': continue
  u=d['user']; L=[]
  for hd,ls in blocks(u):
    for l in ls: L.append((hd,l))
  data.append((f,L)); 
  for k in set(l[:60] for hd,l in L): freq[k]+=1
N=len(data); gen={k for k,v in freq.items() if v>0.5*N}
DIR=re.compile(r'بپرس|پیشنهادِ این نوبت|پرسشِ این نوبت|فقط \*\*یک\*\* پرسش')
for f,L in data:
  hits=[]
  for hd,l in L:
    if l[:60] in gen: continue
    if l.startswith('- زمینه (نه پرسشِ دوم)'): continue
    if not DIR.search(l): continue
    hits.append(hd[:25]+' | '+l[:int(os.environ.get('W','170'))])
  if len(hits)>=int(os.environ.get('MIN','2')): print('##',f.split('round19B/')[-1],len(hits)); [print('   ',h) for h in hits]
print('prompts',N,'generic',len(gen))
