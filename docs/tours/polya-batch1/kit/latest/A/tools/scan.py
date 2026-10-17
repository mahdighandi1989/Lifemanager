import json,glob,re,sys,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEYS=('# مسئلهٔ زنده','# مربیِ حل','# پس از شکست','# مسئلهٔ حل‌شده','# مسئلهٔ بازِ','# 🌱')
GEN=('سکوت، «نمی‌دونم»','پرسشی را که','دوباره نپرس','این گفت‌وگو به همین مسئله بسته است','اگر کاربر مسئلهٔ واقعیِ','هر نوبت فقط یک پرسش')
CTX='زمینه (نه پرسشِ دوم)'
def directive(l):
    if not l.startswith('- ') and not l.startswith('  '): return False
    if CTX in l[:40]: return False
    if any(g in l for g in GEN): return False
    return bool(re.search(r'بپرس|پرسشِ این نوبت|\*\*یک\*\* پرسش|پیشنهادِ این نوبت|بخواه ',l))
sids=sys.argv[1:] or sorted(os.path.basename(d) for d in glob.glob(R+'/s*'))
for s in sids:
  for f in sorted(glob.glob(f'{R}/{s}/ai/p*.json'),key=lambda x:int(re.search(r'p(\d+)\.json',x).group(1))):
    u=json.load(open(f))['user']; inb=False; hits=[]
    for l in u.split('\n'):
        if l.startswith('# '): inb=l.startswith(KEYS); continue
        if inb and directive(l): hits.append(l)
    tag='MULTI' if len(hits)>1 else 'ok'
    if tag=='MULTI' or '-v' in os.environ.get('V',''):
        print('==',s,os.path.basename(f),tag,len(hits))
        for h in hits: print('    ',h[:260])
