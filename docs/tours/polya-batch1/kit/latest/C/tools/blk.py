# blk.py sid N -> print coach + live blocks of pN
import json,sys,re
T='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round15C'
u=json.load(open(f'{T}/{sys.argv[1]}/ai/p{sys.argv[2]}.json'))['user']
for pt in re.split(r'(?m)^(?=# )',u):
    h=pt.split('\n',1)[0]
    if h.startswith(('# مسئلهٔ زنده','# مربیِ حل','# نوبتِ تازه','# پس از شکست','# مسئلهٔ حل‌شدهٔ مرتبط','# قلمرو')) or (len(sys.argv)>3 and sys.argv[3] in h): print(pt)
