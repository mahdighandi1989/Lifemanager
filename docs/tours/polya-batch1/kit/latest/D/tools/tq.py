# tq.py sid N — the kept turn-question line(s), coach_state contract lines, and other directive lines with «پرسش»
import json,sys,re
D='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25D/'+sys.argv[1]
p=json.load(open(f'{D}/ai/p{sys.argv[2]}.json')); u=p['user']
for l in u.split('\n'):
    if 'پرسشِ این نوبت همین است' in l or 'در این نوبت فقط **یک** پرسش' in l: print('TQ>',l[:1500])
    elif l.startswith('- گزارشِ وضع') or 'coach_state' in l and 'گزارش' in l[:40]: print('CS>',l[:900])
