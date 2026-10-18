# pv.py SID N : compact view of a prompt for hand-answering
import json,sys,re
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A'
s,n=sys.argv[1],sys.argv[2]; p=json.load(open(f'{R}/{s}/ai/p{n}.json')); u=p['user']
print('TASK',p['task'],'len',len(u))
heads=re.findall(r'(?m)^# .*',u); print('HEADS:',[h[:60] for h in heads])
def blk(h,n=1800):
    i=u.find(h)
    if i<0: return
    j=u.find('\n# ',i+3); print(u[i:(j if j>0 else i+n)][:n]); print('-----')
for h in sys.argv[3:] if len(sys.argv)>3 else ['# وضعِ کنونی','# مسئلهٔ زندهٔ این سشن','# مربیِ حل','# اصلاحی که صفحه','# پرونده‌های تمرین','# پرسش‌های تشخیصی','# نوبتِ تازه']:
    blk(h)
