# ar.py sid N — the page-arithmetic block of prompt N (or NONE)
import json,sys,re
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26D/'
u=json.load(open(f'{R}{sys.argv[1]}/ai/p{sys.argv[2]}.json'))['user']
m=re.search(r'# حسابِ صفحه[^\n]*\n((?:- [^\n]*\n)+)',u)
print(m.group(0) if m else 'NO ARITH BLOCK')
