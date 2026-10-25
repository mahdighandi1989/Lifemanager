# cv.py -> compact view of all pending turns
import json,glob,os,re,subprocess
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(R)
out=subprocess.run(['bash','tools/st.sh'],capture_output=True,text=True).stdout
for line in out.split('\n'):
    if 'PENDING' not in line: continue
    sid=line.split()[0]; n=int(re.search(r'PENDING p(\d+)',line).group(1))
    u=json.load(open(f'{sid}/ai/p{n}.json')); task=u.get('task'); u=u['user']
    m=re.search(r'# نوبتِ تازه\n(.*)',u,re.S); t=m.group(1).strip() if m else '?'
    flags=[]
    for k,lab in [('# اصلاحی','CORR-RESULT'),('# اصلاحِ پیامِ پیشین','CORR?'),('[سامانه — وارسیِ صفحه','POSTCHECK'),('# کارِ پیشینِ تو (حکمِ','PRIOR-LEDGER'),('پیامش کارِ پیشینِ خودش را دارد','PRIOR-ASK'),('طرحِ همین مسئله با چند گام','PLANSTEPS?'),('# برگه','SHEET'),('⏸','WAIT'),('ابزار','TOOL'),('# پیش‌نیاز (کمبودِ','')]:
        if k in u and lab: flags.append(lab)
    tq=''
    mm=re.search(r'\*\*پرسشِ این نوبت همین است:\*\*([^\n]*)',u)
    if mm: tq=mm.group(1)[:220]
    else:
        mm=re.search(r'- در این نوبت فقط \*\*یک\*\* پرسش[^\n]*?: «([^\n]*?)»\. اگر',u)
        if mm: tq='(card) '+mm.group(1)[:220]
    stg=re.search(r'# مسئلهٔ زندهٔ این سشن \([^)]*\): «([^»]*)» · مرحله: ([^·]*)',u)
    d=json.load(open(f'{sid}/drv.json')) if os.path.exists(f'{sid}/drv.json') else {}
    mp=d.get('map',{}).get(str(n))
    r24=''
    if mp and mp!=-1 and os.path.exists(f'../round24C/{sid}/ai/r{mp}.txt'):
        try: r24=json.load(open(f'../round24C/{sid}/ai/r{mp}.txt')).get('reply','')[:260]
        except: r24='?'
    pc=re.search(r'\[سامانه — وارسیِ صفحه[^\]]*\]',u)
    print(f'=== {sid} p{n} [{task}] map={mp} {" ".join(flags)}')
    print('  U:',t[:330].replace('\n',' '))
    if stg: print('  LIVE:',stg.group(1)[:50],'|',stg.group(2).strip())
    if tq: print('  TQ:',tq)
    if pc: print('  PC:',pc.group(0)[:300])
    if r24: print('  R24:',r24)
