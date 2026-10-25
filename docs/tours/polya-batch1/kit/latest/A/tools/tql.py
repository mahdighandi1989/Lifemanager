import json,sys,re
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A'
s,n=sys.argv[1],sys.argv[2];u=json.load(open(f'{R}/{s}/ai/p{n}.json'))['user']
for l in u.split('\n'):
    if re.search(r'پرسشِ این نوبت|\*\*یک\*\* پرسش|پرسیده نمی‌شود|پیشنهادِ این نوبت|پرسشِ تشخیصی|تسلط',l) and not l.startswith('- زمینه (نه پرسشِ دوم) — شیوهٔ'): print(l[:int(sys.argv[3]) if len(sys.argv)>3 else 420])
