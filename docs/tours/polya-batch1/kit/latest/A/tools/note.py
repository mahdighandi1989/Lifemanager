# note.py SID SHEETNUM AT TEXT : append a routine reply note to the sheet file (answered)
import json,sys
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A'
s,num,at,text=sys.argv[1:5]; f=f'{R}/{s}/sheets/sh{num}.json'; d=json.load(open(f))
d['notes'].append({'id':'r'+str(len(d['notes'])),'by':'routine','at':at,'text':text}); d['status']='answered'
json.dump(d,open(f,'w'),ensure_ascii=False,indent=1); print('noted',num,len(d['notes']))
