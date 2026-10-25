# newplan.py sid  — create/extend a plan of only new items from <sid>.items.py (list I of items), plus dosend+exit at the end when DONE flag passed
import sys,json,os; sys.path.insert(0,os.path.dirname(__file__)); from mkins import *
s=sys.argv[1]; fin=len(sys.argv)>2 and sys.argv[2]=='fin'
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25D/'
g={}; exec(open(R+s+'.items.py').read(),globals(),g); P=g['I']
if fin: P=P+[{'new':{'eval':open(R+'tools/dosend.js').read()},'tag':'dosend'},{'exit':True}]
json.dump(P,open(R+s+'.plan.json','w'),ensure_ascii=False,indent=0); print(len(P),'items')
