#!/usr/bin/env python3
# hk.py DIR N — compact view of the hooks: headers, live block, coach key lines, page msgs, extra blocks, last turn
import sys,json,re
D,N=sys.argv[1],sys.argv[2]; p=json.load(open(f'{D}/ai/p{N}.json')); u=p['user']; s=p['sys']
if not s.startswith('تو «دستیار»'): print('NON-ASSIST TASK',p.get('task')); print(s[:1500]); print(u[:3000]); sys.exit()
secs=re.split(r'\n(?=# )',u)
KEEP=['مرحلهٔ محتمل','پیشنهادِ این نوبت','پرسشِ این نوبت','پرسش‌های «','پلهٔ','[در گفت‌وگو','گام','ضرب‌المثل','سلیقه','حالتِ','نتیجه','حل شد','فرض','معلم','ادعای','🌱','مسئله‌ای که','ایده','قلمرو','حوزه']
for sc in secs:
    h=sc.split('\n')[0]
    if h.startswith('# صفحهٔ فعلی'): print(h[:60],'...'); continue
    if h.startswith('# نقشهٔ سامانه') or h.startswith('## ') or h.startswith('# امروز') or h.startswith('# برگه‌ها') or h.startswith('# سشن') or h.startswith('# ساعت'): continue
    if h.startswith('# مربیِ حل'):
        print(h[:300])
        for l in sc.split('\n')[1:]:
            if any(k in l for k in ['مرحلهٔ محتمل','پیشنهادِ این نوبت','پرسشِ این نوبت','پرسش‌های «','[در گفت‌وگو','پلهٔ نردبان','نقش','معلمِ','B14','سلیقه','ضرب‌المثلِ','teacher','گیر','شکست','خواسته به عقب']) and 'قاعدهٔ سبک' not in l: print('  ',l[:1200])
        continue
    if h.startswith('# گفت‌وگو'):
        print(h); print(sc[-int(__import__('os').environ.get('CV','600')):]); continue
    print(sc[:int(__import__('os').environ.get('BL','2500'))])
