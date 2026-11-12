# br.py DIR N [convTail] — brief view of prompt N for answering as the model
import sys,json,re,os
D,N=sys.argv[1],sys.argv[2]; tail=int(sys.argv[3]) if len(sys.argv)>3 else 2500
p=json.load(open(f'{D}/ai/p{N}.json')); u=p['user']; s=p['sys']
print('TASK',p.get('task'),'sys',len(s),'user',len(u))
if not s.startswith('تو «دستیار»'): print('NON-ASSIST'); print(s[:3000]); print(u[:4000]); sys.exit()
secs=re.split(r'\n(?=# )',u)
BIG=('# نقشهٔ سامانه','# صفحهٔ فعلی','# سشن','# برگه','# امروز','# ساعت','# دانسته','# نقشهٔ صفحه','# قلمرو','# واژه','# فهرستِ نماها','# همهٔ نماها')
for sc in secs:
    h=sc.split('\n')[0]
    if h.startswith('# گفت‌وگو'): print('#### CONV'); print(sc[-tail:]); continue
    if any(h.startswith(b) for b in BIG) or (len(sc)>6000 and not h.startswith('# مربیِ حل')): print(h[:90],'… [%d]'%len(sc)); continue
    print(sc[:int(os.environ.get('BL','3500'))])
