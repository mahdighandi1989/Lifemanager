# scan.py sid... -> list question-directive lines not marked context in coach/live blocks
import json,sys,re,glob
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round18C'
for sid in sys.argv[1:]:
  for f in sorted(glob.glob(f'{T}/{sid}/ai/p*.json'),key=lambda x:int(x.split('/p')[-1][:-5])):
    u=json.load(open(f))['user']; L=[]
    for pt in re.split(r'(?m)^(?=# )',u):
        h=pt.split('\n',1)[0]
        if not h.startswith(('# مسئلهٔ زنده','# مربیِ حل')): continue
        for l in pt.split('\n')[1:]:
            if not l.startswith('- ') or l.startswith('- زمینه (نه پرسشِ دوم)'): continue
            if re.search(r'بپرس|پرسشِ این نوبت|پیشنهادِ این نوبت|⇐ همان پرسش|یک پرسش',l): L.append(l[:230])
    m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S)
    print('==',sid,f.split('/')[-1],len(L),'|',(m.group(1)[:90].replace('\n',' ') if m else ''))
    for l in L: print('   ',l)
