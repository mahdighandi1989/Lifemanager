#!/usr/bin/env python3
# hooks20.py pfile — compact view: special blocks (اصلاح, برنامه, پیگیری, درخواست, موعد, chat-closed), the coach header+suggestion, last 3 turns, new turn
import sys,json,re
u=json.load(open(sys.argv[1]))['user']
secs=re.split(r'\n(?=# )',u)
for s in secs:
    h=s.split('\n')[0]
    if any(k in h for k in ('اصلاح','برنامه','پیگیری','درخواست','موعد','بازنگری','زنده','مسئلهٔ','وضعِ','گام','حدس','کارنامه','تمرین','پرونده')) and 'نقشهٔ' not in h and '🔭 مسئلهٔ حل‌نشدهٔ خودم (قاعدهٔ کوتاه)' not in h:
        print(s[:2500]); print('---')
    elif h.startswith('# مربیِ حل'):
        print(h[:250]); 
        for m in re.finditer(r'پیشنهادِ این نوبت[^\n]{0,300}',s): print('  >>',m.group(0)[:300])
        for l in s.split('\n'):
            if re.search(r'نتیجه‌ای گفت|chat_solved|میانهٔ|پرسشِ این نوبت:|^- پرسشِ نوبت',l): print('  ..',l[:300])
        print('---')
    elif h.startswith('# گفت‌وگو'):
        L=[l for l in s.split('\n') if l.startswith(('کاربر:','دستیار:'))]; print('\n'.join(x[:260] for x in L[-4:])); print('---')
    elif h.startswith('# نوبتِ تازه'): print(s[:1200])
